// Phim CLB chiếu thẳng trong game bằng @remotion/player (không xuất mp4). Đóng gói: tools/web/dong-goi.mjs → hoc/game/phim-clb/phim-clb.js.
// window.PhimCLB.mo(maGoi, stage, chu, khiXong): phủ lớp phim 360×640 lên #stage (khổ dọc 1080×1920 thu 1/3); phim tự chạy, nút Tiếp (chu.tiep) nhảy cảnh, ở cảnh cuối thành chu.cuoi; Bỏ qua và nút cuối gọi khiXong.
// Mã gói → phim: DS_GOI (thứ tự 10 gói mỗi mùa ở thu-tu-chuong.js), gói thứ n mùa m chiếu M<m>G<n>-Mo (đã ghép đoạn kết gói trước, như Studio).
import React, {useEffect, useRef, useState} from 'react';
import {createRoot, Root} from 'react-dom/client';
import {Player, PlayerRef} from '@remotion/player';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {C, FONT, Stage, Whip} from '../d10';
import {FPS, Phim} from '../may-phim';
import {PHIM_MO_DAU} from '../PhimMoDau';
import {PHIM_M1} from '../doc/m1';
import {PHIM_M2} from '../doc/m2';
import {PHIM_M3} from '../doc/m3';
import {PHIM_CANG} from '../doc/cang';
import {PHIM_M4} from '../doc/m4';
import {PHIM_M5} from '../doc/m5';
import {PHIM_M6} from '../doc/m6';
import {PHIM_M7} from '../doc/m7';
import {PHIM_M8} from '../doc/m8';
import {DS_GOI} from './ds-goi';

// cùng nhịp với may-phim.tsx (ChieuPhim không export nên chép phần xếp cảnh)
const XF = 16, LEAD = 8, SFX_GAIN = 0.55;
const SFX_TRIM: Record<string, number> = {'wrong.wav': 0.35, 'type.wav': 0.55, 'riser.wav': 0.6, 'ding.wav': 0.8};
const xep = (p: Phim) => {
  const starts: number[] = [];
  const end = p.canh.reduce((at, s) => { starts.push(at); return at + s.dur - XF; }, LEAD) + XF;
  return {starts, total: end};
};

const gopKetVaoMoSau = (ds: Phim[]): Phim[] => {
  const kq: Phim[] = [];
  let ketCho: Phim | null = null;
  for (const p of ds) {
    if (/^M[0-9C]+G([1-9])-Ket$/.test(p.id)) { ketCho = p; continue; }
    if (ketCho && /^M[0-9C]+G\d+-Mo$/.test(p.id)) {
      kq.push({...p, canh: [...ketCho.canh.map((c, i) => ({...c, id: `ket-truoc-${i}-${c.id}`})), ...p.canh]});
      ketCho = null;
    } else {
      if (ketCho) { kq.push(ketCho); ketCho = null; }
      kq.push(p);
    }
  }
  if (ketCho) kq.push(ketCho);
  return kq;
};

const PHIM = new Map<string, Phim>();
PHIM.set('mo-dau', PHIM_MO_DAU);
PHIM.set(PHIM_MO_DAU.id, PHIM_MO_DAU);
[PHIM_M1, PHIM_M2, PHIM_M3, PHIM_CANG, PHIM_M4, PHIM_M5, PHIM_M6, PHIM_M7, PHIM_M8].forEach((ds) =>
  gopKetVaoMoSau(ds).forEach((p) => PHIM.set(p.id, p))
);

const phimCuaGoi = (ma: string): Phim | undefined => {
  if (ma === 'mo-dau' || ma === PHIM_MO_DAU.id) return PHIM_MO_DAU;
  for (const [m, ds] of Object.entries(DS_GOI)) {
    const n = ds.indexOf(ma);
    if (n >= 0) return PHIM.get(`M${m}G${n + 1}-Mo`);
  }
  return undefined;
};

const ChieuPhim: React.FC<{phim: Phim}> = ({phim}) => {
  const {starts} = xep(phim);
  const S = phim.canh;
  return (
    <AbsoluteFill style={{background: C.bg, fontFamily: FONT, fontVariantLigatures: 'none'}}>
      <Sequence name="lead" durationInFrames={LEAD + XF}><Stage /></Sequence>
      {S.map((s, i) => (
        <Sequence key={s.id} name={s.id} from={starts[i]} durationInFrames={s.dur}>
          <Whip dur={s.dur} len={XF} first={i === 0} last={i === S.length - 1}>{s.el}</Whip>
        </Sequence>
      ))}
      {S.flatMap((s, i) => (s.sfx || []).map(([at, src, vol, len], k) => (
        <Sequence key={`${s.id}-${k}`} from={starts[i] + at} durationInFrames={len ?? 90} layout="none">
          <Audio src={staticFile(`sfx/${src}`)} volume={vol * SFX_GAIN * (SFX_TRIM[src] ?? 1)} />
        </Sequence>
      )))}
    </AbsoluteFill>
  );
};

type Chu = {boQua: string; cuoi: string; tiep?: string};

// Cảnh đang chiếu ở khung f: cảnh cuối đã bắt đầu (qua nửa đoạn chuyển XF thì tính là cảnh sau).
const canhTai = (starts: number[], f: number) => {
  let i = 0;
  while (i + 1 < starts.length && f >= starts[i + 1] + XF / 2) i++;
  return i;
};

// Phim tự chạy; hàng dưới đáy: Bỏ qua | chấm cảnh | Tiếp (nhảy sang đầu cảnh sau; cảnh cuối thành nút cuối, gọi xong). Chạm phim: dừng / chạy tiếp. Hết phim: nút cuối to. Không thanh tua.
const LopPhim: React.FC<{phim: Phim; chu: Chu; xong: () => void}> = ({phim, chu, xong}) => {
  const ref = useRef<PlayerRef>(null);
  const {starts, total} = React.useMemo(() => xep(phim), [phim]);
  const [canh, setCanh] = useState(0);
  const [dung, setDung] = useState(false);
  const [het, setHet] = useState(false);
  useEffect(() => {
    const p = ref.current;
    if (!p) return;
    dangChieu = p;
    const khiKhung = (e: {detail: {frame: number}}) => setCanh(canhTai(starts, e.detail.frame));
    const khiDung = () => setDung(true), khiChay = () => { setDung(false); setHet(false); }, khiHet = () => setHet(true);
    p.addEventListener('frameupdate', khiKhung);
    p.addEventListener('pause', khiDung);
    p.addEventListener('play', khiChay);
    p.addEventListener('ended', khiHet);
    try { p.play(); } catch { setDung(true); /* trình duyệt chặn tự chạy: hiện nút ▶ */ }
    return () => { p.removeEventListener('frameupdate', khiKhung); p.removeEventListener('pause', khiDung); p.removeEventListener('play', khiChay); p.removeEventListener('ended', khiHet); };
  }, [starts]);
  const Comp = React.useMemo(() => () => <ChieuPhim phim={phim} />, [phim]);
  const laMoDau = phim.id === PHIM_MO_DAU.id;
  const cuoi = canh >= starts.length - 1;
  const tiep = () => {
    if (cuoi) { xong(); return; }
    const p = ref.current;
    if (!p) return;
    p.seekTo(starts[canh + 1]);
    setCanh(canh + 1);
    p.play();
  };
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: 30, background: '#0F172A'}} data-hop="phim-clb" data-phim={phim.id}>
      <Player ref={ref} component={Comp} durationInFrames={total} fps={FPS} compositionWidth={1080} compositionHeight={1920}
        style={{width: '100%', height: '100%'}} controls={false} clickToPlay moveToBeginningWhenEnded={false} showVolumeControls={false} allowFullscreen={false} numberOfSharedAudioTags={24} acknowledgeRemotionLicense />
      {dung && !het && (
        <button className="bt g-wd md-chay" data-nut="md-chay" onClick={() => ref.current?.play()} aria-label="Chạy tiếp"
          style={{position: 'absolute', left: '50%', top: '42%', transform: 'translate(-50%, -50%)', width: 64, height: 64, borderRadius: '50%', fontSize: 26, zIndex: 2}}>▶</button>
      )}
      <div style={{position: 'absolute', left: 12, right: 12, bottom: 12, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 2}}>
        <button className="bt g-wd md-bo-qua" data-nut={laMoDau ? 'md-bo-qua' : 'pg-bo-qua'} onClick={xong} style={{position: 'static'}}>{chu.boQua}</button>
        <div className="md-cham">{starts.map((_, i) => <i key={i} className={i === canh ? 'on' : undefined} />)}</div>
        <button className="bt g-gr md-tiep" data-nut={laMoDau ? 'md-tiep' : 'pg-tiep'} onClick={tiep}
          style={{width: 'auto', height: 36, padding: '0 16px', fontSize: 15, letterSpacing: 0, borderRadius: 18, visibility: het ? 'hidden' : 'visible'}}>{cuoi ? chu.cuoi : (chu.tiep || 'Tiếp') + ' ›'}</button>
      </div>
      {het && (
        <button className="bt g-gr md-tiep" data-nut={laMoDau ? 'md-tiep-cuoi' : 'pg-tiep-cuoi'} onClick={xong}
          style={{position: 'absolute', left: '50%', bottom: 70, transform: 'translateX(-50%)', zIndex: 2}}>{chu.cuoi}</button>
      )}
    </div>
  );
};

let goc: Root | null = null, lop: HTMLDivElement | null = null;
let dangChieu: PlayerRef | null = null;      // Player đang chiếu (PhimCLB.player(): máy soát tua phim tìm ảnh thiếu)
const dong = () => { goc?.unmount(); goc = null; lop?.remove(); lop = null; dangChieu = null; };

const mo = (ma: string, stage: HTMLElement, chu: Chu, khiXong?: () => void) => {
  const phim = phimCuaGoi(ma);
  if (!phim) { khiXong?.(); return; }
  dong();
  lop = document.createElement('div');
  lop.className = 'pclb';
  lop.style.cssText = 'position:absolute;left:0;top:0;width:360px;height:var(--sh,640px);z-index:30';
  stage.appendChild(lop);
  goc = createRoot(lop);
  let daXong = false;
  goc.render(<LopPhim phim={phim} chu={chu} xong={() => { if (daXong) return; daXong = true; dong(); khiXong?.(); }} />);
};

(window as any).PhimCLB = {mo, co: (ma: string) => !!phimCuaGoi(ma), dong, player: () => dangChieu, soKhung: (ma: string) => { const p = phimCuaGoi(ma); return p ? xep(p).total : 0; }, ds: () => ['mo-dau', ...Object.values(DS_GOI).flat()].filter((m) => phimCuaGoi(m))};
