// Bộ dựng phim gói khổ dọc 1080×1920 (hoc/KICH-BAN-PHIM-GOI-CLB.md bản 2): sân hiện trường nhìn từ trên (lưới ô, vật, robot chạy theo mốc khung),
// người nhờ có bóng thoại + huy hiệu cảm xúc, đồng hồ góc phim, bảng thành tựu phong phú, cảnh trong xe trạm (Luna chế part, CẠCH!), câu treo.
// Robot / ô / vật lấy từ bộ vẽ của game (tools/xuat-m1.mjs → public/robot/m1/), người nhờ ở public/nguoi/ (TopView, đã tách nền).
import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Burst, C, CLAMP, FONT, Icon, Mascot, MONO, Say, ease, pop} from '../d10';

/* ------------------------------------------------------------------ lưới sân */
export const O = 150;                      // cạnh một ô (px)
export const X0 = 165, Y0 = 330;           // góc trên trái lưới 5 × 7 ô, nằm trên nền xi măng của ảnh kho
export const COT = 5, HANG = 7;
export const tamO = (c: number, r: number) => ({x: X0 + (c + 0.5) * O, y: Y0 + (r + 0.5) * O});

/** Ngữ cảnh mùa hiện tại ('m1' .. 'm8'), mặc định 'm1'. */
export const MuaCtx = React.createContext<string>('m1');
export const duongRobot = (mua: string, ten: string) => `robot/${ten.includes('/') ? ten : `${mua}/${ten}`}.png`;

/** Mốc chuyển động: [khung, cột, hàng, góc độ (0 = mũi sang phải, -90 = lên)]; giữa hai mốc nội suy mượt. */
export type Moc = [number, number, number, number?];
/**
 * Chuẩn hóa danh sách mốc của robot trên lưới:
 * Nếu có 2 mốc liên tiếp vừa đổi cột (c) vừa đổi hàng (r) (đi chéo lỗi), tự động tách thành đường gấp khúc vuông góc L-shape
 * kèm xoay mũi 90° tại góc cua để robot luôn đi thẳng theo đúng tâm hàng/cột của game.
 */
export function chuanHoaMocVuongGoc(moc: Moc[]): Moc[] {
  if (moc.length < 2) return moc;
  // Chỉ áp dụng cho mốc của Robot (có khai báo góc hướng mũi m[3])
  if (moc.every((m) => m[3] === undefined)) return moc;
  const kq: Moc[] = [moc[0]];
  for (let i = 1; i < moc.length; i++) {
    const a = kq[kq.length - 1];
    const b = moc[i];
    const dc = b[1] - a[1];
    const dr = b[2] - a[2];
    if (Math.abs(dc) > 0.02 && Math.abs(dr) > 0.02 && b[0] - a[0] >= 12) {
      const dt = b[0] - a[0];
      const tMid1 = Math.round(a[0] + dt * 0.44);
      const tMid2 = Math.round(a[0] + dt * 0.56);
      const gocNgang = dc > 0 ? 0 : -180;
      const gocDoc = dr > 0 ? 90 : -90;
      // Đi ngang trước rồi rẽ dọc (hoặc dọc trước rồi rẽ ngang tùy hướng xuất phát)
      const diDocTruoc = Math.abs(Math.sin(((a[3] ?? -90) * Math.PI) / 180)) > 0.7;
      if (diDocTruoc) {
        kq.push([tMid1, a[1], b[2], gocDoc]);
        kq.push([tMid2, a[1], b[2], gocNgang]);
        kq.push([b[0], b[1], b[2], b[3] ?? gocNgang]);
      } else {
        kq.push([tMid1, b[1], a[2], gocNgang]);
        kq.push([tMid2, b[1], a[2], gocDoc]);
        kq.push([b[0], b[1], b[2], b[3] ?? gocDoc]);
      }
    } else {
      kq.push(b);
    }
  }
  return kq;
}

export function theoMoc(mocGoc: Moc[], f: number) {
  const moc = chuanHoaMocVuongGoc(mocGoc);
  let a = moc[0], b = moc[0];
  for (const m of moc) { if (m[0] <= f) a = m; if (m[0] >= f) { b = m; break; } b = m; }
  const t = b[0] === a[0] ? 0 : interpolate(f, [a[0], b[0]], [0, 1], {...CLAMP, easing: Easing.inOut(Easing.cubic)});
  const ga = a[3] ?? 0, gb = b[3] ?? ga;
  const c = a[1] + (b[1] - a[1]) * t, r = a[2] + (b[2] - a[2]) * t;
  return {...tamO(c, r), goc: ga + (gb - ga) * t, c, r};
}

/** Nền hiện trường: ảnh nơi chốn dọc, lưới ô có toạ độ nhẹ trên khoảng sàn trống, hỗ trợ rung màn hình khi va chạm. */
export const NenHienTruong: React.FC<{anh: string; mua?: string; luoi?: boolean; toi?: number; rung?: number[]; children?: React.ReactNode}> = ({anh, mua, luoi = true, toi = 0, rung = [], children}) => {
  const f = useCurrentFrame(), m = React.useContext(MuaCtx);
  let dx = 0, dy = 0;
  for (const t of rung) {
    if (f >= t && f < t + 14) {
      const k = (1 - (f - t) / 14) * 14;
      dx += Math.sin((f - t) * 2.8) * k;
      dy += Math.cos((f - t) * 3.5) * k * 0.7;
    }
  }
  return (
    <MuaCtx.Provider value={mua ?? m}>
      <AbsoluteFill style={{background: '#3B4252', overflow: 'hidden', fontFamily: FONT}}>
        <AbsoluteFill style={{transform: dx || dy ? `translate(${dx}px, ${dy}px)` : undefined}}>
          <Img src={staticFile(anh)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
            transform: `scale(${1.02 + 0.02 * Math.sin(f / 90)})`}} />
          {luoi ? (
            <div style={{position: 'absolute', left: X0, top: Y0, width: COT * O, height: HANG * O, borderRadius: 24,
              background: 'rgba(15,23,42,0.18)', border: '5px solid rgba(27,24,56,0.68)',
              boxShadow: '0 12px 0 rgba(15,23,42,0.42), inset 0 0 0 3px rgba(255,255,255,0.32)'}}>
              {Array.from({length: COT * HANG}, (_, idx) => {
                const c = idx % COT, r = Math.floor(idx / COT);
                const chan = (c + r) % 2 === 0;
                return (
                  <div key={idx} style={{position: 'absolute', left: c * O + 4, top: r * O + 4, width: O - 8, height: O - 8,
                    borderRadius: 14, background: chan ? 'rgba(255,255,255,0.13)' : 'rgba(15,23,42,0.12)',
                    border: '2px solid rgba(255,255,255,0.22)', boxSizing: 'border-box',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <div style={{width: 8, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.28)'}} />
                  </div>
                );
              })}
            </div>
          ) : null}
          {toi ? <AbsoluteFill style={{background: `rgba(20,18,45,${toi})`}} /> : null}
          {children}
        </AbsoluteFill>
      </AbsoluteFill>
    </MuaCtx.Provider>
  );
};

/** Ô cố định trên sân (kệ, nút đè, cửa, ô đích, cờ): ảnh ô của game đặt đúng ô. */
export const ODat: React.FC<{ten: string; c: number; r: number; mo?: number; mua?: string; style?: React.CSSProperties}> = ({ten, c, r, mo = 1, mua, style}) => {
  const m = React.useContext(MuaCtx), p = tamO(c, r);
  return <Img src={staticFile(duongRobot(mua ?? m, ten))} style={{position: 'absolute', left: p.x - O / 2, top: p.y - O / 2, width: O, height: O, opacity: mo, ...style}} />;
};

/** Vật di chuyển (thùng gỗ…): theo mốc, xoay / nghiêng / mờ tuỳ khung. Hỗ trợ bam đơn hoặc danh sách bam, hoặc quay theo tay xoay. */
export type Bam = {moc: Moc[]; tu: number; den?: number; xa?: number | ((f: number) => number); goc?: number; gocLech?: (f: number) => number};
export const Vat: React.FC<{ten?: string; moc: Moc[]; nghieng?: (f: number) => number; mo?: (f: number) => number; co?: number; bam?: Bam | Bam[]; mua?: string}> =
  ({ten = 'vat-thung-go', moc, nghieng, mo, co = 1, bam, mua}) => {
    const f = useCurrentFrame(), m = React.useContext(MuaCtx);
    let p = theoMoc(moc, f);
    const dsBam = Array.isArray(bam) ? bam : bam ? [bam] : [];
    const curBam = dsBam.find((b) => f >= b.tu && f <= (b.den ?? 1e9));
    if (curBam) {
      const x = theoMoc(curBam.moc, f);
      const lech = curBam.gocLech ? curBam.gocLech(f) : 0;
      const a = (((curBam.goc ?? x.goc) + lech) * Math.PI) / 180;
      const kc = typeof curBam.xa === 'function' ? curBam.xa(f) : (curBam.xa ?? 0.68);
      const d = kc * O;
      p = {x: x.x + Math.cos(a) * d, y: x.y + Math.sin(a) * d, goc: 0, c: x.c, r: x.r};
    }
    const s = O * co * (curBam ? 0.84 : 1);
    return <Img src={staticFile(duongRobot(mua ?? m, ten))} style={{position: 'absolute', left: p.x - s / 2, top: p.y - s / 2, width: s, height: s,
      transform: `rotate(${(nghieng ? nghieng(f) : 0) + p.goc}deg)`, opacity: mo ? mo(f) : 1, filter: 'drop-shadow(0 8px 6px rgba(0,0,0,.35))'}} />;
  };

/** Vệt đường đi trên lưới của robot từ mốc đầu tới khung hiện tại, giúp thấy rõ đường vuông góc theo ô. */
const VetDuong: React.FC<{moc: Moc[]; mau?: string}> = ({moc, mau = 'rgba(56,189,248,0.55)'}) => {
  const f = useCurrentFrame();
  if (moc.length < 2 || f <= moc[0][0]) return null;
  const pts: string[] = [];
  const tMax = Math.min(f, moc[moc.length - 1][0]);
  const steps = Math.max(8, Math.min(80, Math.floor((tMax - moc[0][0]) / 2)));
  for (let i = 0; i <= steps; i++) {
    const tf = moc[0][0] + ((tMax - moc[0][0]) * i) / steps;
    const p = theoMoc(moc, tf);
    pts.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`);
  }
  return (
    <svg style={{position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none'}} width={1080} height={1920}>
      <polyline points={pts.join(' ')} fill="none" stroke={mau} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="16 14" />
    </svg>
  );
};

/** Sóng siêu âm phát ra từ đầu cảm biến của robot theo hướng `goc` (độ). */
export const SongAm: React.FC<{c: number; r: number; goc?: number; tu: number; den: number; mau?: string}> = ({c, r, goc = -90, tu, den, mau = C.sola}) => {
  const f = useCurrentFrame();
  if (f < tu || f > den) return null;
  const p = tamO(c, r);
  return (
    <div style={{position: 'absolute', left: p.x, top: p.y, width: 0, height: 0, transform: `rotate(${goc}deg)`, pointerEvents: 'none'}}>
      {[0, 1, 2].map((i) => {
        const pha = ((f - tu + i * 10) % 30) / 30;
        const x = 45 + pha * 220;
        const h = 36 + pha * 110;
        return (
          <div key={i} style={{position: 'absolute', left: x, top: -h / 2, width: 18, height: h, borderRight: `6px solid ${mau}`,
            borderRadius: '0 999px 999px 0', opacity: (1 - pha) * 0.9, filter: `drop-shadow(0 0 8px ${mau})`}} />
        );
      })}
    </div>
  );
};

/** Hình robot của game; ảnh tay xoay rộng hơn (922 thay 576) nhưng cùng tỉ lệ thân, nên phóng theo bề ngang ảnh. */
const RONG: Record<string, number> = {xoay: 922, 'xoay-vui': 922, du: 922, 'du-vui': 922, 'du-ngac': 922};
export const Xe: React.FC<{anh: string; moc: Moc[]; doi?: [number, string][]; sang?: (f: number) => boolean; mo?: (f: number) => number; vet?: boolean; mauVet?: string; mua?: string}> =
  ({anh, moc, doi = [], sang, mo, vet = true, mauVet, mua}) => {
    const f = useCurrentFrame(), m = React.useContext(MuaCtx);
    const p = theoMoc(moc, f);
    const ten = [...doi].filter(([t]) => f >= t).pop()?.[1] ?? anh;
    const S = 1.2 * O * (RONG[ten] ?? 576) / 576;
    const isSang = sang ? sang(f) : false;
    return (
      <>
        {vet ? <VetDuong moc={moc} mau={mauVet} /> : null}
        <div style={{position: 'absolute', left: p.x - S / 2, top: p.y - S / 2, width: S, height: S, transform: `rotate(${p.goc}deg)`, opacity: mo ? mo(f) : 1,
          filter: isSang ? `drop-shadow(0 0 22px ${C.yellow})` : 'drop-shadow(0 10px 8px rgba(0,0,0,.35))'}}>
          <Img src={staticFile(duongRobot(mua ?? m, ten))} style={{width: S, height: S}} />
        </div>
      </>
    );
  };

/** Chữ hiệu ứng nảy kiểu Comic / Game (RẦM!, CỘP!, SẬP!, KẸT!, BÍP BÍP!…) với viền đậm 3D và độ nghiêng hoạt hình. */
export const ChuNay: React.FC<{chu: string; at: number; den?: number; x: number; y: number; mau?: string; co?: number}> = ({chu, at, den = at + 40, x, y, mau = C.bad, co = 52}) => {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  if (f < at || f > den) return null;
  const p = pop(f, at, fps, 8), ra = ease(f, [den - 8, den], [1, 0]);
  const fontSz = Math.min(co, 46);
  const tilt = -4 + Math.sin((f - at) * 0.45) * 2.5;
  return (
    <div style={{position: 'absolute', left: x, top: y,
      transform: `translate(-50%, -50%) rotate(${tilt}deg) scale(${p})`, opacity: ra,
      padding: '12px 26px', borderRadius: 20, background: mau, color: '#FFFFFF',
      border: `5px solid ${C.ink}`,
      boxShadow: `inset 0 0 0 3px rgba(255,255,255,0.88), 0 9px 0 ${C.ink}, 0 16px 26px rgba(0,0,0,0.38)`,
      fontFamily: FONT, fontWeight: 900, fontSize: fontSz, letterSpacing: '0.02em',
      textShadow: `0 3px 0 ${C.ink}`, display: 'inline-flex', alignItems: 'center', gap: 10,
      whiteSpace: 'nowrap', zIndex: 24}}>
      <Icon name="Zap" size={Math.round(fontSz * 0.72)} color="#FDE047" stroke={3} />
      <span>{chu}</span>
    </div>
  );
};

/* ------------------------------------------------------------------ người */
export type CamXucNguoi = 'lo' | 'hoang' | 'hoi' | 'vui' | 'khen';

const HuyHieuCamXuc: React.FC<{loai: CamXucNguoi; since: number; ben: 'trai' | 'phai'}> = ({loai, since, ben}) => {
  const s = Math.min(1, since / 6) * (1 + Math.sin(since / 5) * 0.08);
  const pos: React.CSSProperties = {position: 'absolute', top: 20, [ben === 'trai' ? 'left' : 'right']: 14, width: 68, height: 68,
    transform: `scale(${s}) rotate(${(ben === 'trai' ? -10 : 10) + Math.sin(since / 4) * 6}deg)`, pointerEvents: 'none'};
  if (loai === 'hoang') {
    return (
      <svg viewBox="0 0 64 64" style={pos}>
        <circle cx="32" cy="32" r="26" fill={C.bad} stroke="#fff" strokeWidth="4" />
        <path d="M32 16v18M32 44v2" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
      </svg>
    );
  }
  if (loai === 'lo') {
    return (
      <svg viewBox="0 0 64 64" style={{...pos, transform: `translateY(${(since % 24) * 0.6}px) scale(${s})`}}>
        <path d="M32 10 C42 26 48 34 48 42 A16 16 0 1 1 16 42 C16 34 22 26 32 10 Z" fill="#38BDF8" stroke="#fff" strokeWidth="4" />
        <path d="M26 38 A6 6 0 0 0 30 46" fill="none" stroke="#E0F2FE" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }
  if (loai === 'hoi') {
    return (
      <svg viewBox="0 0 64 64" style={pos}>
        <circle cx="32" cy="32" r="26" fill={C.yellow} stroke="#fff" strokeWidth="4" />
        <path d="M25 24a7 7 0 1 1 10 6.3c-2 1-3 2.2-3 4.7M32 44v1" fill="none" stroke={C.ink} strokeWidth="5.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (loai === 'vui' || loai === 'khen') {
    return (
      <svg viewBox="0 0 64 64" style={pos}>
        <path d="M32 6 L39 23 L57 25 L43 37 L47 55 L32 45 L17 55 L21 37 L7 25 L25 23 Z" fill={C.yellow} stroke="#fff" strokeWidth="4" strokeLinejoin="round" />
      </svg>
    );
  }
  return null;
};

/** Người nhờ (ảnh TopView tách nền): nảy lên ở `at`, bóng thoại chữ tự cân dòng, huy hiệu cảm xúc tự động hoặc tuỳ chỉnh. */
export const chonDangNguoi = (ten: string, so: number, xoa?: number): string => {
	if (ten === 'thay') {
		if (xoa !== undefined) return 'thay-hoang';
		if (so === 10) return 'thay-mung';
		if (so === 9) return 'thay-sot-ruot';
		if (so <= 2 || so === 5) return 'thay-tu-hao';
		return 'thay-dong-vien';
	}
	if (xoa !== undefined || so === 6) return `${ten}-hoang`;
	if (so === 10) return `${ten}-mung`;
	if (so === 9) return `${ten}-sot-ruot`;
	if (so <= 2) return `${ten}-nghi`;
	if (so <= 4) return `${ten}-ngac-nhien`;
	return `${ten}-tin`;
};

export const Nguoi: React.FC<{anh: string; doiAnh?: [number, string][]; camXuc?: [number, CamXucNguoi][]; ten: string; mau: string; x: number; h: number; at: number;
  says?: Say[]; bottom?: number; side?: 'left' | 'right'; lat?: boolean; bubbleW?: number; bubbleTop?: number}> =
  ({anh, doiAnh = [], camXuc, ten, mau, x, h, at, says = [], bottom = -h * 0.03, side = 'right', lat, bubbleW = 630, bubbleTop}) => {
    const f = useCurrentFrame(), {fps, height: H} = useVideoConfig();
    if (f < at) return null;
    const p = pop(f, at, fps, 10);
    const curAnh = [...doiAnh].filter(([t]) => f >= t).pop()?.[1] ?? anh;
    const say = says.find((s) => f >= s.at && f < s.out + 6);
    const dangNoi = Boolean(say && f >= say.at && f <= say.out);
    const bob = Math.sin(f / (dangNoi ? 5 : 10)) * (dangNoi ? 8 : 5);
    const squash = dangNoi ? 1 + Math.sin(f / 4) * 0.025 : 1;
    const top = H - bottom - h;
    const sp = say ? ease(f, [say.at, say.at + 8], [0, 1], Easing.out(Easing.back(1.6))) * (1 - ease(f, [say.out, say.out + 6], [0, 1])) : 0;

    // Chỉ hiện huy hiệu cảm xúc khi truyền camXuc rõ ràng hoặc ảnh kết thúc bằng -b
    const curCx: CamXucNguoi | null = camXuc ? ([...camXuc].filter(([t]) => f >= t).pop()?.[1] ?? null) : (curAnh.endsWith('-b') ? 'vui' : null);
    const sinceCx = say ? Math.max(0, f - say.at) : f - at;

    return (
      <>
        <div style={{position: 'absolute', left: x - h * 0.325, top: top + (1 - p) * h * 0.6 + bob, width: h * 0.65, height: h, opacity: Math.min(1, p * 2),
          transform: `scale(${(2 - squash) * (0.75 + 0.25 * p)}, ${squash * (0.75 + 0.25 * p)})`, transformOrigin: '50% 100%'}}>
          <Img src={staticFile(`nguoi/${curAnh}.png`)} style={{width: '100%', height: '100%', objectFit: 'contain', objectPosition: '50% 100%',
            filter: 'drop-shadow(0 14px 22px rgba(20,18,45,.35))', transform: lat ? 'scaleX(-1)' : undefined}} />
          {curCx ? <HuyHieuCamXuc loai={curCx} since={sinceCx} ben={lat ? 'trai' : 'phai'} /> : null}
        </div>
        {say && sp > 0.01 && (
          <div style={{position: 'absolute', top: (bubbleTop ?? top - 34) - 30 * (1 - sp), width: bubbleW, left: side === 'right' ? x + h * 0.1 : x - h * 0.1 - bubbleW,
            opacity: sp, transform: `scale(${0.82 + 0.18 * sp})`, transformOrigin: side === 'right' ? '0% 100%' : '100% 100%', zIndex: 15}}>
            <div style={{position: 'absolute', bottom: '100%', [side === 'right' ? 'left' : 'right']: 22,
              transform: `translateY(48%) rotate(${side === 'right' ? -2 : 2}deg)`,
              background: mau, color: '#fff', border: `4px solid ${C.ink}`,
              fontWeight: 900, fontSize: 24, padding: '5px 18px', borderRadius: 14, zIndex: 3, fontFamily: FONT, letterSpacing: '0.04em', whiteSpace: 'nowrap',
              boxShadow: `0 5px 0 ${C.ink}`, display: 'inline-flex', alignItems: 'center', gap: 8}}>
              <span style={{width: 10, height: 10, borderRadius: '50%', background: '#FDE047', border: `2px solid ${C.ink}`}} />
              <span>{ten}</span>
            </div>
            <div style={{position: 'relative', background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFBEB 100%)',
              border: `5px solid ${C.ink}`, borderRadius: 28, padding: '28px 26px 20px', fontFamily: FONT, fontWeight: 800, fontSize: 35,
              color: C.ink, lineHeight: 1.32, textWrap: 'balance',
              boxShadow: `0 10px 0 ${C.ink}, 0 18px 34px rgba(15,23,42,0.34), inset 0 4px 0 #FEF3C7`}}>
              {say.text}
              <svg width="34" height="24" viewBox="0 0 34 24" style={{position: 'absolute', bottom: -21,
                [side === 'right' ? 'left' : 'right']: 32, transform: side === 'right' ? undefined : 'scaleX(-1)', overflow: 'visible'}}>
                <path d="M 4 0 L 28 0 L 6 20 Z" fill="#FFFBEB" stroke={C.ink} strokeWidth="5" strokeLinejoin="round" />
                <path d="M 6 -2 L 26 -2" stroke="#FFFBEB" strokeWidth="6" />
              </svg>
            </div>
          </div>
        )}
      </>
    );
  };

/* ------------------------------------------------------------------ đồng hồ, bảng thành tựu, nhãn gói */
/** Đồng hồ HUD góc trên trái phong cách Arcade Game: nhấp nháy đỏ khi sát deadline. */
export const DongHo: React.FC<{tu: number; den?: number; dai?: number; gap?: boolean}> = ({tu, den = tu, dai = 300, gap}) => {
  const f = useCurrentFrame();
  const m = Math.round(interpolate(f, [0, dai], [tu, den], CLAMP));
  const chu = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  const nhay = gap && Math.floor(f / 12) % 2 === 0;
  return (
    <div style={{position: 'absolute', left: 36, top: 44, display: 'flex', alignItems: 'center', gap: 12, padding: '12px 24px', borderRadius: 999,
      background: nhay ? 'linear-gradient(180deg, #EF4444 0%, #DC2626 100%)' : 'linear-gradient(180deg, #FFFFFF 0%, #F1F5F9 100%)',
      color: nhay ? '#fff' : C.ink, border: `5px solid ${C.ink}`,
      boxShadow: `0 8px 0 ${C.ink}, inset 0 3px 0 rgba(255,255,255,0.6)`,
      fontFamily: MONO, fontWeight: 800, fontSize: 42, whiteSpace: 'nowrap', zIndex: 20}}>
      <Icon name="Clock" size={40} color={nhay ? '#FDE047' : '#0284C7'} stroke={2.8} />{chu}
    </div>
  );
};

/** Nhãn gói HUD góc trên phải kiểu Game Stage Badge: "QUEST 2 · Tay kẹp". */
export const NhanGoi: React.FC<{so: number; ten: string}> = ({so, ten}) => (
  <div style={{position: 'absolute', right: 36, top: 46, padding: '11px 22px', borderRadius: 20,
    background: 'linear-gradient(180deg, #38BDF8 0%, #0284C7 100%)', color: '#fff', fontFamily: FONT, fontWeight: 900,
    fontSize: 32, border: `5px solid ${C.ink}`, boxShadow: `0 8px 0 ${C.ink}, inset 0 3px 0 rgba(255,255,255,0.45)`,
    display: 'inline-flex', alignItems: 'center', gap: 10, whiteSpace: 'nowrap', zIndex: 20}}>
    <span style={{padding: '2px 10px', borderRadius: 10, background: '#FDE047', color: C.ink, fontSize: 24, fontWeight: 900, border: `2.5px solid ${C.ink}`}}>
      #{so}
    </span>
    <span style={{textShadow: `0 2px 0 ${C.ink}`}}>{ten}</span>
  </div>
);

const HO_SO_MUA: Record<string, {chuSo: string; avatar: string; icon: string; mau: string; nen: string; donVi: string}> = {
  m1: {chuSo: 'CHÚ TÙNG · THỦ KHO', avatar: 'nguoi/tu-tin.png', icon: 'Warehouse', mau: '#B45309', nen: '#FEF3C7', donVi: 'ĐƠN KHO'},
  m2: {chuSo: 'CÔ HẠNH · KỸ SƯ TRƯỞNG', avatar: 'nguoi/hanh-tin.png', icon: 'Factory', mau: '#0284C7', nen: '#E0F2FE', donVi: 'CA CỨU HỘ'},
  m3: {chuSo: 'BÁC SƠN · BÃI TÁI CHẾ', avatar: 'nguoi/sau-tin.png', icon: 'Recycle', mau: '#15803D', nen: '#DCFCE7', donVi: 'MẺ TÁI CHẾ'},
  cang: {chuSo: 'CÔ MAI · ĐIỀU ĐỘ CẢNG', avatar: 'nguoi/mai-tin.png', icon: 'Anchor', mau: '#CA8A04', nen: '#FEF3C7', donVi: 'CHUYẾN TÀU'},
  m4: {chuSo: 'BÁC BÌNH · TRẠM THỦY LỢI', avatar: 'nguoi/ba-tin.png', icon: 'Waves', mau: '#0369A1', nen: '#E0F2FE', donVi: 'TUYẾN KÊNH'},
  m5: {chuSo: 'CHỊ LAN · NÔNG TRẠI HOA', avatar: 'nguoi/lan-tin.png', icon: 'Flower2', mau: '#BE185D', nen: '#FCE7F3', donVi: 'LUỐNG HOA'},
  m6: {chuSo: 'ANH DŨNG · KỸ SƯ MỎ ĐÁ', avatar: 'nguoi/dung-tin.png', icon: 'Mountain', mau: '#C2410C', nen: '#FFEDD5', donVi: 'CHẶNG MỎ'},
  m7: {chuSo: 'CHÚ PHONG · ĐỘI CỨU HỘ', avatar: 'nguoi/phong-tin.png', icon: 'Compass', mau: '#0F766E', nen: '#CCFBF1', donVi: 'VÒM HANG'},
  m8: {chuSo: 'THẦY HIỆU TRƯỞNG · CLB', avatar: 'nguoi/thay-tu-hao.png', icon: 'Trophy', mau: '#1D4ED8', nen: '#DBEAFE', donVi: 'NHIỆM VỤ'},
};

/**
 * Sổ nghiệm thu hiện trường của người nhờ từng mùa (Chú Tùng, Cô Hạnh, Bác Sơn...):
 * - Header mang dấu xác nhận & avatar riêng của chủ sổ từng mùa (không dùng chung kiểu của Sola/Luna).
 * - Dải 10 ô số (#01..#10) trên đỉnh cho thấy toàn cảnh tiến độ 10 gói.
 * - Khung 5 dòng trọng tâm quanh gói hiện tại với cỡ chữ lớn (33-35px), cao thoáng (98px/dòng), cực kỳ dễ đọc.
 */
export const BangViec: React.FC<{tieuDe: string; dong: string[]; xong: number; moi?: number; at?: number; xoa?: number; x?: number; y?: number; w?: number}> =
  ({tieuDe, dong, xong, moi, at = 0, xoa, x = 40, y = 260, w = 1000}) => {
    const f = useCurrentFrame(), {fps} = useVideoConfig();
    const mua = React.useContext(MuaCtx);
    const hs = HO_SO_MUA[mua] ?? HO_SO_MUA.m1;
    const vao = pop(f, 0, fps, 13);
    const soXong = xong + (moi !== undefined && f >= at ? 1 : 0) - (xoa !== undefined && f >= at ? 1 : 0);

    // Cửa sổ 5 dòng xoay quanh mục đang xét (`moi` hoặc `xoa` hoặc `xong`) để mỗi dòng cao thoáng, chữ to rõ
    const tam = xoa ?? moi ?? xong;
    const cuaSo = Math.min(5, dong.length);
    const batDau = Math.max(0, Math.min(dong.length - cuaSo, tam - 2));
    const danhSachHien = dong.slice(batDau, batDau + cuaSo).map((d, idx) => ({d, i: batDau + idx}));

    return (
      <div style={{position: 'absolute', left: x, top: y, width: w, boxSizing: 'border-box',
        background: 'linear-gradient(180deg, #FFFBEB 0%, #FEF3C7 100%)', borderRadius: 32,
        border: `6px solid ${C.ink}`, boxShadow: `0 14px 0 ${C.ink}, 0 26px 44px rgba(0,0,0,0.45)`,
        padding: '22px 24px 24px', fontFamily: FONT, transform: `translateY(${(1 - vao) * 90}px)`, opacity: Math.min(1, vao * 2), zIndex: 10}}>

        {/* Header Bảng Nhiệm Vụ Game từng mùa cỡ lớn */}
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px', borderRadius: 24,
          background: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)', border: `4px solid ${C.ink}`,
          boxShadow: 'inset 0 3px 0 rgba(255,255,255,0.18)', marginBottom: 16, gap: 16}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 18, minWidth: 0}}>
            <div style={{width: 102, height: 102, borderRadius: 22, background: hs.nen, border: '4px solid #FDE047',
              boxShadow: '0 6px 0 #000', overflow: 'hidden', flexShrink: 0}}>
              <Img src={staticFile(hs.avatar)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 10%'}} />
            </div>
            <div style={{minWidth: 0}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4}}>
                <Icon name="Trophy" size={24} color="#FDE047" stroke={2.8} />
                <span style={{fontSize: 22, fontWeight: 900, color: '#FDE047', letterSpacing: '0.05em', whiteSpace: 'nowrap'}}>
                  {hs.chuSo}
                </span>
              </div>
              <div style={{fontSize: 27, fontWeight: 900, color: '#FFFFFF', lineHeight: 1.2}}>
                {tieuDe}
              </div>
            </div>
          </div>
          <div style={{padding: '14px 22px', borderRadius: 18,
            background: soXong === dong.length ? 'linear-gradient(180deg, #22C55E 0%, #15803D 100%)' : 'linear-gradient(180deg, #F59E0B 0%, #D97706 100%)',
            color: '#FFFFFF', fontSize: 27, fontWeight: 900, whiteSpace: 'nowrap',
            border: '3.5px solid #FFFFFF', boxShadow: '0 5px 0 rgba(0,0,0,0.4)', flexShrink: 0}}>
            {soXong}/{dong.length} {hs.donVi}
          </div>
        </div>

        {/* Dải 10 nút Level (#01 .. #10) kiểu Arcade Stage Bar cỡ lớn */}
        <div style={{display: 'grid', gridTemplateColumns: `repeat(${dong.length}, 1fr)`, gap: 8, marginBottom: 18}}>
          {dong.map((_, idx) => {
            const vXong = idx === moi && f >= at;
            const dXong = idx < xong || vXong;
            const bXoa = xoa === idx && f >= at;
            const bgStep = bXoa ? '#EF4444' : vXong ? '#38BDF8' : dXong ? '#22C55E' : '#FFFFFF';
            const fgStep = bXoa || dXong ? '#FFFFFF' : C.ink;
            return (
              <div key={idx} style={{height: 56, borderRadius: 14, background: bgStep, color: fgStep,
                border: `4px solid ${C.ink}`, boxShadow: `0 5px 0 ${C.ink}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontFamily: MONO, fontSize: 22, fontWeight: 900}}>
                {dXong && !bXoa ? <Icon name="Check" size={22} color="#FFFFFF" stroke={3.8} /> : null}
                <span>{String(idx + 1).padStart(2, '0')}</span>
              </div>
            );
          })}
        </div>

        {/* 5 thẻ Quest lớn chữ to, cao 112px/dòng lấp đầy màn hình */}
        <div style={{display: 'flex', flexDirection: 'column', gap: 14}}>
          {danhSachHien.map(({d, i}) => {
            const vuaXong = i === moi && f >= at;
            const daXong = i < xong || vuaXong;
            const pTich = i === moi ? pop(f, at, fps, 9) : 1;
            const biXoa = xoa === i && f >= at;
            const dangXet = (i === moi && f < at) || (i === xoa && f < at);

            const bgRow = biXoa ? '#FEE2E2' : vuaXong ? '#E0F2FE' : daXong ? '#DCFCE7' : '#FFFFFF';
            const coChu = d.length > 30 ? 33 : d.length > 25 ? 36 : 38;

            return (
              <div key={i} style={{position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 112,
                padding: '0 22px', borderRadius: 24, background: bgRow,
                border: `4.5px solid ${C.ink}`, boxSizing: 'border-box',
                boxShadow: `0 8px 0 ${C.ink}`}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 16, minWidth: 0}}>
                  <div style={{width: 64, height: 64, borderRadius: 18, border: `4px solid ${C.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: biXoa ? '#EF4444' : daXong ? '#22C55E' : dangXet ? '#FDE047' : '#F1F5F9',
                    boxShadow: `0 5px 0 ${C.ink}`,
                    transform: i === moi ? `scale(${0.6 + 0.4 * pTich})` : undefined, flexShrink: 0}}>
                    {daXong && !biXoa ? <Icon name="Check" size={40} color="#FFFFFF" stroke={4} />
                      : biXoa ? <Icon name="X" size={40} color="#FFFFFF" stroke={4} />
                      : dangXet ? <Icon name="Zap" size={34} color={C.ink} stroke={3} /> : null}
                  </div>
                  <span style={{fontSize: coChu, fontWeight: 900, color: biXoa ? '#991B1B' : C.ink, whiteSpace: 'nowrap'}}>
                    {d}
                  </span>
                </div>

                {vuaXong ? <Burst at={at} x={52} y={56} color={C.good} r={95} n={8} /> : null}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

/* ------------------------------------------------------------------ trong xe trạm */
const TRUOC_THEO_ANH: Record<string, string> = {
  kep: 'r1',
  'kep-cam': 'kep',
  xoay: 'kep-cam',
  du: 'xoay',
  'xich-voi': 'xich',
  'xich-cam': 'xich-voi',
  'xich-ui': 'xich-cam',
  'xich-manh': 'xich-ui',
  'xich-du': 'xich-manh',
  // Mùa 3 (Bãi tái chế)
  'nhen-nc': 'nhen',
  'nhen-tu': 'nhen-nc',
  'nhen-co': 'nhen-tu',
  'nhen-tu-s': 'nhen-tu',
  // Mùa 4 (Cảng sông)
  'cau-moc': 'cau',
  'cau-quet-bat': 'cau-moc',
  'cau-ray': 'cau-quet',
  'cau-doi': 'cau-ray',
  'cau-du': 'cau-doi',
  // Mùa 5 (Bến sông)
  'xuong-keo': 'xuong',
  'xuong-do-bat': 'xuong-keo',
  'xuong-neo': 'xuong-do',
  'xuong-dat': 'xuong-neo',
  'xuong-du': 'xuong-dat',
  // Mùa 6 (Nông trại)
  'drone-son': 'drone',
  'drone-cam': 'drone-son',
  'drone-cam-red': 'drone-cam',
  'drone-cam-do': 'drone-cam-red',
  // Mùa 7 (Mỏ đá)
  'omni-nem-cam': 'omni',
  'omni-radar-quet': 'omni-nem-cam',
  'omni-radar-vui': 'omni-radar',
  'omni-du': 'omni-radar',
  'omni-du-vui': 'omni-du',
  // Mùa 8 (Hang động)
  'gai-loa-phat': 'gai',
  'gai-am-nghe': 'gai-loa',
  'gai-du-thu': 'gai-am',
  'gai-du-vui': 'gai-du',
  // Mùa 9 (CLB)
  'lai-xich-nem': 'lai-nhen-kep',
  'lai-gai-cam': 'lai-xich-nem',
  'lai-xuong-tu': 'lai-gai-cam',
  'lai-omni-keo': 'lai-xuong-tu',
  'lai-drone-tu': 'lai-omni-keo',
  'lai-omni-loa': 'lai-drone-tu',
  'luna-bot': 'sola-bot',
};
/** Đè TRUOC_THEO_ANH theo mùa: mùa 2 'du' (lưỡi ủi, gói 5) đứng sau xe hồng ngoại, robot/m2 không có 'xoay' (1/11). */
const TRUOC_THEO_MUA: Record<string, Record<string, string>> = {m2: {du: 'xich-hn'}};
/** R1 đủ bộ của mùa (cảnh đưa R2 lên bàn, gói 9). */
const R1_DU: Record<string, string> = {
  m3: 'nhen-tu',
  cang: 'cau-du',
  m4: 'xuong-du',
  m5: 'drone-cam',
  m6: 'omni-du',
  m7: 'gai-du',
  m8: 'sola-bot',
};

export type LoaiNangCap = 'banh-lui' | 'tay-xoay' | 'cam-ben' | 'nang-cap';

/**
 * Trong xe trạm:
 * - Chế độ 1 — LẮP PART MỚI (`nangCap` không truyền):
 *   + Giai đoạn 1 (0 .. cach): Hiện rõ trạng thái TRƯỚC KHI LẮP trên sa bàn (Gói 1 chỉ có Bộ não `dau-r1.png`, Gói 2 là `r1.png`, Gói 3 là `kep.png`).
 *   + Giai đoạn 2 (cach - 48 .. cach): CHỈ RIÊNG BỘ PHẬN MỚI (2 bánh xe / tay kẹp / 2 tai cảm biến) trượt vào khớp với thân.
 *   + Giai đoạn 3 (cach .. hết cảnh): CẠCH! Robot hoàn chỉnh hiện rõ trên sa bàn.
 * - Chế độ 2 — NÂNG CẤP TÍNH NĂNG (`nangCap = 'banh-lui' | 'tay-xoay' | 'cam-ben'`):
 *   + Tuyệt đối KHÔNG trượt/ghép part mới! Robot đã có sẵn bộ phận đó đứng nguyên vẹn từ đầu.
 *   + Trước `cach`: Vòng sáng kỹ thuật quét đúng vào bộ phận đang được nâng cấp (2 bánh xe / khớp cổ tay / 2 tai cảm biến).
 *   + Sau `cach`: TÍT! MỞ KHÓA! Robot trực tiếp biểu diễn tính năng mới (chạy lùi / xoay cổ tay trái-phải / phát sóng siêu âm sang 2 bên hông) ngay trên sa bàn.
 */
export const TrongXe: React.FC<{
  anh: string;
  cach: number;
  luna: Say[];
  sola: Say[];
  lunaMat?: [number, string][];
  solaMat?: [number, string][];
  tenPart?: string;
  mua?: string;
  truoc?: string;
  nangCap?: LoaiNangCap;
}> = ({anh, cach, luna, sola, lunaMat = [[0, 'thinking']], solaMat = [[0, 'thinking']], tenPart, mua, truoc, nangCap}) => {
  const f = useCurrentFrame(), {fps} = useVideoConfig(), m = mua ?? React.useContext(MuaCtx);
  const p = pop(f, cach, fps, 9);
  const S = 580 * (RONG[anh] ?? 576) / 576;
  const S_DAU = 580;
  const uLap = ease(f, [Math.max(15, cach - 70), cach], [0, 1]);
  const dangLap = f >= Math.max(15, cach - 70) && f < cach;

  const maTruoc = truoc ?? TRUOC_THEO_MUA[m]?.[anh] ?? TRUOC_THEO_ANH[anh];
  const anhTruoc = maTruoc ? duongRobot(m, maTruoc) : 'robot/lab/dau-r1.png';
  const S_TRUOC = 580 * (maTruoc ? (RONG[maTruoc] ?? 576) / 576 : 1);
  const laLapHaiBanh = !nangCap && anh === 'r1';
  const laLapTayKep = !nangCap && anh === 'kep';
  const laLapCamBien = !nangCap && anh === 'kep-cam';
  const laLapR2 = !nangCap && (anh === 'r2' || anh === 'luna-bot');

  // Hiệu ứng biểu diễn sau khi mở khóa tính năng (f >= cach)
  const uSau = f >= cach ? ease(f, [cach + 8, cach + 68], [0, 1]) : 0;

  return (
    <AbsoluteFill style={{background: '#0F172A', fontFamily: FONT, overflow: 'hidden'}}>
      <Img src={staticFile('nen-doc/trong-xe.jpg')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(15,23,42,0.82) 0%, rgba(15,23,42,0.18) 28%, rgba(15,23,42,0.18) 70%, rgba(15,23,42,0.82) 100%)'}} />

      {/* Bệ xoay Hologram công nghệ cỡ lớn (680x680) dưới chân Robot trong Xưởng Độ */}
      <div style={{position: 'absolute', left: 540 - 340, top: 850 - 340, width: 680, height: 680, borderRadius: '50%',
        background: f >= cach
          ? 'radial-gradient(circle, rgba(250,204,21,0.36) 0%, rgba(56,189,248,0.2) 52%, transparent 72%)'
          : 'radial-gradient(circle, rgba(56,189,248,0.32) 0%, rgba(99,102,241,0.16) 52%, transparent 72%)',
        border: `5px dashed ${f >= cach ? '#FDE047' : '#38BDF8'}`,
        transform: `rotate(${f * 0.6}deg)`, pointerEvents: 'none', zIndex: 4}} />
      <div style={{position: 'absolute', left: 540 - 265, top: 850 - 265, width: 530, height: 530, borderRadius: '50%',
        border: `4px solid ${f >= cach ? 'rgba(253,224,71,0.6)' : 'rgba(56,189,248,0.5)'}`,
        boxShadow: f >= cach ? '0 0 48px rgba(250,204,21,0.4)' : '0 0 38px rgba(56,189,248,0.32)',
        pointerEvents: 'none', zIndex: 4}} />

      {/* Thanh HUD Xưởng Độ Robot phía trên */}
      <div style={{position: 'absolute', left: 40, right: 40, top: 36, padding: '14px 24px', borderRadius: 24,
        background: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)', border: `5px solid ${C.ink}`,
        boxShadow: `0 9px 0 ${C.ink}, 0 16px 28px rgba(0,0,0,0.4)`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 12}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <div style={{width: 44, height: 44, borderRadius: 12, background: nangCap ? '#7C3AED' : '#0284C7',
            border: '2.5px solid #FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Icon name={nangCap ? 'Sparkles' : 'Wrench'} size={24} color="#FDE047" stroke={2.8} />
          </div>
          <span style={{fontSize: 23, fontWeight: 900, color: '#FFFFFF', letterSpacing: '0.03em', whiteSpace: 'nowrap'}}>
            {nangCap ? 'Xe trạm · nâng cấp' : 'Xe trạm · lắp part'}
          </span>
        </div>
        {tenPart ? (
          <span style={{padding: '8px 18px', borderRadius: 14,
            background: f >= cach ? 'linear-gradient(180deg, #22C55E 0%, #15803D 100%)' : nangCap ? '#7C3AED' : '#0284C7',
            color: '#FFFFFF', fontSize: 20, fontWeight: 900, border: '3px solid #FFFFFF',
            boxShadow: '0 4px 0 rgba(0,0,0,0.35)', whiteSpace: 'nowrap'}}>
            {tenPart}
          </span>
        ) : null}
      </div>

      {/* Nhãn trạng thái trước & sau ở vùng trên sa bàn */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 152, textAlign: 'center', zIndex: 14}}>
        {f < cach ? (
          <span style={{display: 'inline-flex', alignItems: 'center', gap: 12, padding: '12px 28px', borderRadius: 20,
            background: '#FFFFFF', color: C.ink, fontWeight: 900, fontSize: 31, whiteSpace: 'nowrap',
            border: `4px solid ${C.ink}`, boxShadow: `0 7px 0 ${C.ink}`}}>
            <Icon name="Cpu" size={30} color="#0284C7" stroke={2.8} />
            <span>
              {nangCap ? 'Đang nâng cấp…' : 'Đang lắp…'}
            </span>
          </span>
        ) : tenPart ? (
          <span style={{display: 'inline-flex', alignItems: 'center', gap: 14, padding: '14px 34px', borderRadius: 22,
            background: 'linear-gradient(180deg, #FDE047 0%, #FACC15 100%)', color: C.ink, fontWeight: 900, fontSize: 36, whiteSpace: 'nowrap',
            border: `5px solid ${C.ink}`, boxShadow: `0 9px 0 ${C.ink}, 0 16px 30px rgba(0,0,0,0.4)`,
            transform: `scale(${0.85 + 0.15 * p})`}}>
            <Icon name="Sparkles" size={34} color={C.ink} stroke={3} />
            <span>{tenPart}!</span>
          </span>
        ) : null}
      </div>

      {/* ============================================================ CHẾ ĐỘ NÂNG CẤP TÍNH NĂNG (KHÔNG LẮP PART MỚI) */}
      {nangCap === 'banh-lui' ? (
        <>
          {/* Vệt bánh lùi khi R1 chạy lùi thử sau mốc cach */}
          {f >= cach ? (
            <>
              {[-95, 95].map((dx, i) => (
                <div key={i} style={{position: 'absolute', left: 540 + dx - 8, top: 820, width: 16, height: uSau * 170,
                  borderRadius: 8, background: 'repeating-linear-gradient(180deg, #FACC15 0 16px, transparent 16px 28px)', zIndex: 9}} />
              ))}
              <div style={{position: 'absolute', left: 115, top: 880, padding: '10px 20px', borderRadius: 14,
                background: '#0F172A', color: '#38BDF8', fontFamily: MONO, fontSize: 28, fontWeight: 800,
                border: '2.5px solid #38BDF8', display: 'inline-flex', alignItems: 'center', gap: 8, zIndex: 15}}>
                <span>left_back()</span>
                <Icon name="ArrowDown" size={26} color="#38BDF8" stroke={3} />
              </div>
              <div style={{position: 'absolute', right: 115, top: 880, padding: '10px 20px', borderRadius: 14,
                background: '#0F172A', color: '#38BDF8', fontFamily: MONO, fontSize: 28, fontWeight: 800,
                border: '2.5px solid #38BDF8', display: 'inline-flex', alignItems: 'center', gap: 8, zIndex: 15}}>
                <Icon name="ArrowDown" size={26} color="#38BDF8" stroke={3} />
                <span>right_back()</span>
              </div>
            </>
          ) : (
            /* Trước mốc cach: 2 khung sáng quét dọc 2 bánh xe đang có của R1 */
            [-102, 102].map((dx, i) => (
              <div key={i} style={{position: 'absolute', left: 540 + dx - 34, top: 845 - 95, width: 68, height: 190,
                borderRadius: 28, border: '5px dashed #38BDF8', background: 'rgba(56,189,248,0.22)',
                boxShadow: '0 0 28px #38BDF8', transform: `scale(${1 + 0.06 * Math.sin(f / 4)})`, zIndex: 14}} />
            ))
          )}

          {/* R1 (kep-cam) đã có đầy đủ bánh + tay kẹp + cảm biến ngay từ frame 0, chạy lùi thử sau cach */}
          <div style={{position: 'absolute', left: 540 - S_DAU / 2, top: 830 - S_DAU / 2 + uSau * 150, width: S_DAU, height: S_DAU,
            transform: 'rotate(-90deg)', filter: 'drop-shadow(0 18px 28px rgba(15,23,42,0.45))', zIndex: 11}}>
            <Img src={staticFile(duongRobot(m, f >= cach ? 'kep-cam-vui' : 'kep-cam'))} style={{width: S_DAU, height: S_DAU}} />
          </div>
        </>
      ) : nangCap === 'tay-xoay' ? (
        <>
          {/* Trước cach: Vòng cung xoay sáng rực quanh khớp tròn cổ tay của Tay kẹp */}
          {f < cach ? (
            <div style={{position: 'absolute', left: 540 - 90, top: 750 - 90, width: 180, height: 180, borderRadius: 999,
              border: '6px dashed #FACC15', background: 'rgba(250,204,21,0.18)', boxShadow: '0 0 32px #FACC15',
              transform: `rotate(${f * 4}deg)`, zIndex: 14}} />
          ) : (
            <>
              <div style={{position: 'absolute', left: 105, top: 790, padding: '10px 20px', borderRadius: 14,
                background: f < cach + 45 ? '#16A34A' : '#0F172A', color: '#FFFFFF', fontFamily: MONO, fontSize: 28, fontWeight: 800,
                border: '2.5px solid #FFFFFF', display: 'inline-flex', alignItems: 'center', gap: 8, zIndex: 15}}>
                <Icon name="ArrowLeft" size={26} color="#FFFFFF" stroke={3} />
                <span>arm_left()</span>
              </div>
              <div style={{position: 'absolute', right: 105, top: 790, padding: '10px 20px', borderRadius: 14,
                background: f >= cach + 45 ? '#16A34A' : '#0F172A', color: '#FFFFFF', fontFamily: MONO, fontSize: 28, fontWeight: 800,
                border: '2.5px solid #FFFFFF', display: 'inline-flex', alignItems: 'center', gap: 8, zIndex: 15}}>
                <span>arm_right()</span>
                <Icon name="ArrowRight" size={26} color="#FFFFFF" stroke={3} />
              </div>
            </>
          )}

          {/* R1 đứng yên trên sa bàn, sau mốc cach cổ tay xoay sang TRÁI rồi sang PHẢI */}
          <div style={{position: 'absolute', left: 540 - 240, top: 890 - 240, width: 480, height: 480,
            transform: 'rotate(-90deg)', filter: 'drop-shadow(0 18px 28px rgba(15,23,42,0.45))', zIndex: 11}}>
            <Img
              src={staticFile(
                f < cach
                  ? 'robot/lab/xoay-truoc.png'
                  : f < cach + 45
                    ? 'robot/lab/xoay-trai.png'
                    : 'robot/lab/xoay-phai.png'
              )}
              style={{width: 480, height: 480}} />
          </div>
        </>
      ) : nangCap === 'cam-ben' ? (
        <>
          {/* Trước cach: 2 vòng sáng nhấp nháy quanh 2 tai cảm biến bên hông R1 */}
          {f < cach ? (
            [-95, 95].map((dx, i) => (
              <div key={i} style={{position: 'absolute', left: 540 + dx - 44, top: 860 - 44, width: 88, height: 88,
                borderRadius: 999, border: '5px dashed #22D3EE', background: 'rgba(34,211,238,0.22)',
                boxShadow: '0 0 28px #22D3EE', transform: `scale(${1 + 0.08 * Math.sin(f / 3)})`, zIndex: 14}} />
            ))
          ) : (
            /* Sau cach: Phát chùm sóng siêu âm sang 2 bên TRÁI và PHẢI */
            <>
              {[-1, 1].map((dir) => (
                <div key={dir} style={{position: 'absolute', left: 540 + dir * 95, top: 870, width: 0, height: 0,
                  transform: `rotate(${dir < 0 ? 180 : 0}deg)`, zIndex: 13}}>
                  {[0, 1, 2].map((k) => {
                    const pha = ((f - cach + k * 9) % 27) / 27;
                    const x = 25 + pha * 170;
                    const h = 44 + pha * 120;
                    return (
                      <div key={k} style={{position: 'absolute', left: x, top: -h / 2, width: 18, height: h,
                        borderRight: '7px solid #22D3EE', borderRadius: '0 999px 999px 0',
                        opacity: (1 - pha) * 0.95, filter: 'drop-shadow(0 0 10px #22D3EE)'}} />
                    );
                  })}
                </div>
              ))}
              <div style={{position: 'absolute', left: 75, top: 755, padding: '10px 20px', borderRadius: 14,
                background: '#0F172A', color: '#22D3EE', fontFamily: MONO, fontSize: 27, fontWeight: 800,
                border: '2.5px solid #22D3EE', display: 'inline-flex', alignItems: 'center', gap: 8, zIndex: 15}}>
                <Icon name="ArrowLeft" size={25} color="#22D3EE" stroke={3} />
                <span>left_clear()</span>
              </div>
              <div style={{position: 'absolute', right: 75, top: 755, padding: '10px 20px', borderRadius: 14,
                background: '#0F172A', color: '#22D3EE', fontFamily: MONO, fontSize: 27, fontWeight: 800,
                border: '2.5px solid #22D3EE', display: 'inline-flex', alignItems: 'center', gap: 8, zIndex: 15}}>
                <span>right_clear()</span>
                <Icon name="ArrowRight" size={25} color="#22D3EE" stroke={3} />
              </div>
            </>
          )}

          <div style={{position: 'absolute', left: 540 - 240, top: 890 - 240, width: 480, height: 480,
            transform: 'rotate(-90deg)', filter: 'drop-shadow(0 18px 28px rgba(15,23,42,0.45))', zIndex: 11}}>
            <Img src={staticFile(f >= cach ? 'robot/lab/cb-kc-du.png' : 'robot/m1/kep-cam.png')} style={{width: 480, height: 480}} />
          </div>
        </>
      ) : laLapR2 ? (
        /* ============================================================ CHẾ ĐỘ ĐƯA THÊM ROBOT R2 LÊN BÀN CÙNG R1 (GÓI 9) */
        <>
          {/* R1 đứng sẵn bên trái sa bàn */}
          <div style={{position: 'absolute', left: 340 - 200, top: 890 - 200, width: 400, height: 400,
            transform: 'rotate(-90deg)', filter: 'drop-shadow(0 18px 28px rgba(15,23,42,0.45))'}}>
            <Img src={staticFile(duongRobot(m, R1_DU[m] ?? 'du'))} style={{width: 400, height: 400}} />
          </div>
          {/* R2 của Luna trượt từ bên phải vào đứng cạnh R1 */}
          <div style={{position: 'absolute', left: 740 - 200 + (f < cach ? (1 - uLap) * 220 : 0), top: 890 - 200, width: 400, height: 400,
            opacity: f < cach ? (dangLap ? uLap : 0.25) : 1,
            transform: `scale(${f >= cach ? 0.88 + 0.12 * p : 1}) rotate(-90deg)`,
            filter: 'drop-shadow(0 18px 28px rgba(15,23,42,0.45))'}}>
            <Img src={staticFile(duongRobot(m, f >= cach ? `${anh}-vui` : anh))} style={{width: 400, height: 400}} />
          </div>
        </>
      ) : f < cach ? (
        /* ============================================================ CHẾ ĐỘ LẮP PART MỚI (GÓI 1, 2, 3...) */
        <>
          {laLapHaiBanh && dangLap ? (
            <>
              {/* Bánh trái trượt từ bên trái vào */}
              <div style={{position: 'absolute', left: 540 - S_DAU / 2 - (1 - uLap) * 190, top: 890 - S_DAU / 2, width: S_DAU, height: S_DAU,
                opacity: uLap, transform: 'rotate(-90deg)'}}>
                <Img src={staticFile('robot/lab/banh-r1.png')} style={{width: S_DAU, height: S_DAU, clipPath: 'inset(0 0 65% 0)'}} />
              </div>
              {/* Bánh phải trượt từ bên phải vào */}
              <div style={{position: 'absolute', left: 540 - S_DAU / 2 + (1 - uLap) * 190, top: 890 - S_DAU / 2, width: S_DAU, height: S_DAU,
                opacity: uLap, transform: 'rotate(-90deg)'}}>
                <Img src={staticFile('robot/lab/banh-r1.png')} style={{width: S_DAU, height: S_DAU, clipPath: 'inset(65% 0 0 0)'}} />
              </div>
            </>
          ) : laLapTayKep && dangLap ? (
            /* Gói 2: Vẽ riêng cụm Tay kẹp vector nguyên bản (2 càng cong + cụm đế trắng + khớp tròn đèn cyan) nền trong suốt 100%, không cắt dính thân R1 */
            <svg viewBox="0 0 100 120" style={{position: 'absolute', left: 540 - (S_DAU * (480 / 576) * 0.86) / 2,
              top: 890 - (S_DAU * (480 / 576) * 0.86) * 0.64 - (1 - uLap) * 155,
              width: S_DAU * (480 / 576) * 0.86, height: S_DAU * (480 / 576) * 0.86 * 1.2,
              opacity: uLap, overflow: 'visible', zIndex: 12, filter: 'drop-shadow(0 12px 18px rgba(15,23,42,0.35))'}}>
              {/* Hai càng cong đối xứng hướng lên trên (y từ 40 lên 18) */}
              <path d="M 38 40 C 9 34 9 26 14 18 M 62 40 C 91 34 91 26 86 18" fill="none" stroke="#2D2654" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
              <path d="M 38 40 C 9 34 9 26 14 18 M 62 40 C 91 34 91 26 86 18" fill="none" stroke="#CBD5E1" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
              {/* Cụm đế trắng bo tròn */}
              <rect x={34} y={34} width={32} height={12} rx={6} fill="#FFFFFF" stroke="#2D2654" strokeWidth={3} />
              {/* Khớp tròn bạc + chấm đèn cyan */}
              <circle cx={50} cy={40} r={7} fill="#CBD5E1" stroke="#2D2654" strokeWidth={2.5} />
              <circle cx={50} cy={40} r={3} fill="#22D3EE" />
            </svg>
          ) : laLapCamBien && dangLap ? (
            /* Gói 3: Vẽ riêng 2 viên con nhộng Cảm biến khoảng cách nền trong suốt 100% (không bị dính nền chữ nhật trắng của thân R1) trượt từ 2 bên vào vai kep.png */
            <>
              {[-1, 1].map((ben) => (
                <svg key={ben} viewBox="0 0 40 68" style={{
                  position: 'absolute',
                  left: 540 + ben * (100 + (1 - uLap) * 145) - 26,
                  top: 890 - 16,
                  width: 52,
                  height: 88,
                  opacity: uLap,
                  overflow: 'visible',
                  zIndex: 12,
                  filter: 'drop-shadow(0 10px 16px rgba(15,23,42,0.38))',
                }}>
                  <defs>
                    <radialGradient id={`vo-cam-${ben}`} cx="42%" cy="35%" r="70%">
                      <stop offset="0%" stopColor="#FFFFFF" />
                      <stop offset="70%" stopColor="#F1EFFB" />
                      <stop offset="100%" stopColor="#D8D4F2" />
                    </radialGradient>
                  </defs>
                  {/* Vỏ con nhộng dọc chuẩn ve-vector-cam.js (10x17 bo 5 phóng x3.2) */}
                  <rect x={4} y={6} width={32} height={54} rx={16} fill={`url(#vo-cam-${ben})`} stroke="#2D2654" strokeWidth={7} />
                  {/* Thấu kính cyan ở đầu trước (hướng lên trên theo mũi R1) */}
                  <rect x={9} y={9} width={22} height={19} rx={9.5} fill="#22D3EE" stroke="#2D2654" strokeWidth={3.8} />
                </svg>
              ))}
            </>
          ) : dangLap ? (
            /* Các part gắn mũi khác: chỉ cắt phần mũi mới trượt vào */
            <div style={{position: 'absolute', left: 540 - S / 2, top: 890 - S / 2 - (1 - uLap) * 150, width: S, height: S,
              opacity: uLap * 0.9, transform: 'rotate(-90deg)', zIndex: 12}}>
              <Img src={staticFile(duongRobot(m, anh))} style={{width: S, height: S, clipPath: 'inset(0 0 0 58%)'}} />
            </div>
          ) : null}

          {/* Thân trước khi lắp nằm sẵn trên sa bàn từ đầu cảnh */}
          <div style={{position: 'absolute', left: 540 - S_TRUOC / 2, top: 890 - S_TRUOC / 2, width: S_TRUOC, height: S_TRUOC,
            transform: 'rotate(-90deg)', filter: 'drop-shadow(0 18px 28px rgba(15,23,42,0.45))'}}>
            <Img src={staticFile(anhTruoc)} style={{width: S_TRUOC, height: S_TRUOC}} />
          </div>
        </>
      ) : (
        /* Sau khi CẠCH (f >= cach): Robot hoàn chỉnh có bánh/part mới hiện rõ trên sa bàn */
        <div style={{position: 'absolute', left: 540 - S / 2, top: 890 - S / 2, width: S, height: S,
          transform: `scale(${0.88 + 0.12 * p}) rotate(-90deg)`, filter: 'drop-shadow(0 18px 28px rgba(15,23,42,0.45))'}}>
          <Img src={staticFile(duongRobot(m, anh))} style={{width: S, height: S}} />
        </div>
      )}

      <Burst at={cach} x={540} y={890} color={C.yellow} r={260} />
      <ChuNay chu={nangCap ? 'TÍT!' : 'CẠCH!'} at={cach} den={cach + 65} x={540} y={590} mau="#0F172A" co={64} />
      <Mascot who="sola" x={240} h={520} at={0} faces={solaMat} says={sola} bubbleW={560} bubbleTop={1180} />
      <Mascot who="luna" x={840} h={520} at={6} faces={lunaMat} says={luna} side="left" bubbleW={560} bubbleTop={1180} lat />
    </AbsoluteFill>
  );
};

/** Câu treo cuối phim mở: sa bàn phóng gần, vòng hào quang game dưới chân robot, nút Arcade "CHIẾN GÓI". */
export const CauTreo: React.FC<{anh: string; cau: string; so: number; ten: string; mua?: string; xoay?: number}> = ({anh, cau, so, ten, mua, xoay = -90}) => {
  const f = useCurrentFrame(), {fps} = useVideoConfig(), m = React.useContext(MuaCtx);
  const z = ease(f, [0, 40], [1, 1.32]);
  const S = 560 * (RONG[anh] ?? 576) / 576;
  const nut = pop(f, 32, fps, 9);
  return (
    <AbsoluteFill style={{background: '#0F172A', fontFamily: FONT, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: '50% 52%'}}>
        <Img src={staticFile('nen-doc/trong-xe.jpg')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />
        <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 52%, rgba(56,189,248,0.22) 0%, rgba(15,23,42,0.72) 85%)'}} />
        <div style={{position: 'absolute', left: 540 - 310, top: 820 - 310, width: 620, height: 620, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(250,204,21,0.36) 0%, rgba(56,189,248,0.2) 55%, transparent 72%)',
          border: '5px dashed #FDE047', transform: `rotate(${f * 0.8}deg)`}} />
        <div style={{position: 'absolute', left: 540 - S / 2, top: 820 - S / 2, width: S, height: S,
          transform: `rotate(${xoay + Math.sin(f / 10) * 5}deg)`, filter: 'drop-shadow(0 18px 28px rgba(0,0,0,0.5))'}}>
          <Img src={staticFile(duongRobot(mua ?? m, anh))} style={{width: S, height: S}} />
        </div>
      </AbsoluteFill>
      <Mascot who="sola" x={260} h={580} at={0} faces={[[0, 'confident'], [32, 'cheer']]} says={[{at: 6, out: 999, text: cau}]} bubbleW={560} bubbleTop={1180} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 190, textAlign: 'center', opacity: Math.min(1, nut * 2),
        transform: `scale(${(0.75 + 0.25 * nut) * (1 + 0.03 * Math.sin(f / 6))})`}}>
        <span style={{display: 'inline-flex', alignItems: 'center', gap: 18, padding: '22px 46px', borderRadius: 28,
          background: 'linear-gradient(180deg, #FDE047 0%, #F59E0B 100%)', color: C.ink, fontWeight: 900, fontSize: 48,
          border: `6px solid ${C.ink}`, boxShadow: `0 12px 0 ${C.ink}, 0 22px 38px rgba(0,0,0,0.45), inset 0 4px 0 #FEF08A`, whiteSpace: 'nowrap'}}>
          <Icon name="Play" size={46} color={C.ink} stroke={3.2} />
          <span>Gói {so} · {ten}</span>
        </span>
      </div>
    </AbsoluteFill>
  );
};
