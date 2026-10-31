// Bộ dựng phim gói khổ dọc 1080×1920 (hoc/KICH-BAN-PHIM-GOI-CLB.md bản 2): sân hiện trường nhìn từ trên (lưới ô, vật, robot chạy theo mốc khung),
// người nhờ có bóng thoại, đồng hồ góc phim, bảng thành tựu, cảnh trong xe trạm (Luna chế part, CẠCH!), câu treo.
// Robot / ô / vật lấy từ bộ vẽ của game (tools/xuat-m1.mjs → public/robot/m1/), người nhờ ở public/nguoi/ (TopView, đã tách nền).
import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Burst, C, CLAMP, FONT, Icon, Mascot, MONO, Say, ease, pop} from '../d10';

/* ------------------------------------------------------------------ lưới sân */
export const O = 150;                      // cạnh một ô (px)
export const X0 = 165, Y0 = 330;           // góc trên trái lưới 5 × 7 ô, nằm trên nền xi măng của ảnh kho
export const COT = 5, HANG = 7;
export const tamO = (c: number, r: number) => ({x: X0 + (c + 0.5) * O, y: Y0 + (r + 0.5) * O});

/** Ngữ cảnh mùa hiện tại ('m1' | 'm2' | 'm3' | 'm4'), mặc định 'm1' để mùa 1 giữ nguyên. */
export const MuaCtx = React.createContext<string>('m1');
const duongRobot = (mua: string, ten: string) => `robot/${ten.includes('/') ? ten : `${mua}/${ten}`}.png`;

/** Mốc chuyển động: [khung, cột, hàng, góc độ (0 = mũi sang phải, -90 = lên)]; giữa hai mốc nội suy mượt. */
export type Moc = [number, number, number, number?];
export function theoMoc(moc: Moc[], f: number) {
  let a = moc[0], b = moc[0];
  for (const m of moc) { if (m[0] <= f) a = m; if (m[0] >= f) { b = m; break; } b = m; }
  const t = b[0] === a[0] ? 0 : interpolate(f, [a[0], b[0]], [0, 1], {...CLAMP, easing: Easing.inOut(Easing.cubic)});
  const ga = a[3] ?? 0, gb = b[3] ?? ga;
  const c = a[1] + (b[1] - a[1]) * t, r = a[2] + (b[2] - a[2]) * t;
  return {...tamO(c, r), goc: ga + (gb - ga) * t};
}

/** Nền hiện trường: ảnh nơi chốn dọc, lưới ô mờ trên khoảng sàn trống. */
export const NenHienTruong: React.FC<{anh: string; mua?: string; luoi?: boolean; toi?: number; children?: React.ReactNode}> = ({anh, mua, luoi = true, toi = 0, children}) => {
  const f = useCurrentFrame(), m = React.useContext(MuaCtx);
  return (
    <MuaCtx.Provider value={mua ?? m}>
      <AbsoluteFill style={{background: '#3B4252', overflow: 'hidden', fontFamily: FONT}}>
        <Img src={staticFile(anh)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
          transform: `scale(${1.02 + 0.02 * Math.sin(f / 90)})`}} />
        {luoi ? <div style={{position: 'absolute', left: X0, top: Y0, width: COT * O, height: HANG * O, borderRadius: 18,
          backgroundImage: 'linear-gradient(rgba(255,255,255,.16) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,.16) 2px, transparent 2px)',
          backgroundSize: `${O}px ${O}px`, border: '2px solid rgba(255,255,255,.22)'}} /> : null}
        {toi ? <AbsoluteFill style={{background: `rgba(20,18,45,${toi})`}} /> : null}
        {children}
      </AbsoluteFill>
    </MuaCtx.Provider>
  );
};

/** Ô cố định trên sân (kệ, nút đè, cửa, ô đích, cờ): ảnh ô của game đặt đúng ô. */
export const ODat: React.FC<{ten: string; c: number; r: number; mo?: number; mua?: string; style?: React.CSSProperties}> = ({ten, c, r, mo = 1, mua, style}) => {
  const m = React.useContext(MuaCtx), p = tamO(c, r);
  return <Img src={staticFile(duongRobot(mua ?? m, ten))} style={{position: 'absolute', left: p.x - O / 2, top: p.y - O / 2, width: O, height: O, opacity: mo, ...style}} />;
};

/** Vật di chuyển (thùng gỗ…): theo mốc, xoay / nghiêng / mờ tuỳ khung. */
export type Bam = {moc: Moc[]; tu: number; den?: number; xa?: number};
/** bam: từ khung `tu` tới `den` vật nằm ở mũi xe (cách tâm xe `xa` ô theo hướng xe), thay cho mốc riêng (xe đang kẹp mang vật). */
export const Vat: React.FC<{ten?: string; moc: Moc[]; nghieng?: (f: number) => number; mo?: (f: number) => number; co?: number; bam?: Bam; mua?: string}> = ({ten = 'vat-thung-go', moc, nghieng, mo, co = 1, bam, mua}) => {
  const f = useCurrentFrame(), m = React.useContext(MuaCtx);
  let p = theoMoc(moc, f);
  if (bam && f >= bam.tu && f <= (bam.den ?? 1e9)) {
    const x = theoMoc(bam.moc, f), a = (x.goc * Math.PI) / 180, d = (bam.xa ?? 0.62) * O;
    p = {x: x.x + Math.cos(a) * d, y: x.y + Math.sin(a) * d, goc: 0};
  }
  const s = O * co * (bam && f >= bam.tu && f <= (bam.den ?? 1e9) ? 0.82 : 1);
  return <Img src={staticFile(duongRobot(mua ?? m, ten))} style={{position: 'absolute', left: p.x - s / 2, top: p.y - s / 2, width: s, height: s,
    transform: `rotate(${(nghieng ? nghieng(f) : 0) + p.goc}deg)`, opacity: mo ? mo(f) : 1, filter: 'drop-shadow(0 8px 6px rgba(0,0,0,.35))'}} />;
};

/** Hình robot của game; ảnh tay xoay rộng hơn (922 thay 576) nhưng cùng tỉ lệ thân, nên phóng theo bề ngang ảnh. */
const RONG: Record<string, number> = {xoay: 922, 'xoay-vui': 922, du: 922, 'du-vui': 922, 'du-ngac': 922};
export const Xe: React.FC<{anh: string; moc: Moc[]; doi?: [number, string][]; sang?: (f: number) => boolean; mo?: (f: number) => number; mua?: string}> = ({anh, moc, doi = [], sang, mo, mua}) => {
  const f = useCurrentFrame(), m = React.useContext(MuaCtx);
  const p = theoMoc(moc, f);
  const ten = [...doi].filter(([t]) => f >= t).pop()?.[1] ?? anh;
  const S = 1.2 * O * (RONG[ten] ?? 576) / 576;
  return (
    <div style={{position: 'absolute', left: p.x - S / 2, top: p.y - S / 2, width: S, height: S, transform: `rotate(${p.goc}deg)`, opacity: mo ? mo(f) : 1,
      filter: sang && sang(f) ? `drop-shadow(0 0 18px ${C.yellow})` : 'drop-shadow(0 10px 8px rgba(0,0,0,.35))'}}>
      <Img src={staticFile(duongRobot(mua ?? m, ten))} style={{width: S, height: S}} />
    </div>
  );
};

/** Chữ hiệu ứng nảy (RẦM!, CỘP, ?!, VÈO…) tại một điểm, hiện từ khung `at` tới `den`. */
export const ChuNay: React.FC<{chu: string; at: number; den?: number; x: number; y: number; mau?: string; co?: number}> = ({chu, at, den = at + 40, x, y, mau = C.bad, co = 96}) => {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  if (f < at || f > den) return null;
  const p = pop(f, at, fps, 9), ra = ease(f, [den - 8, den], [1, 0]);
  return <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${p}) rotate(-6deg)`, opacity: ra, fontFamily: FONT, fontWeight: 900,
    fontSize: co, color: mau, WebkitTextStroke: '4px #fff', textShadow: '0 8px 0 rgba(27,24,56,.35)', whiteSpace: 'nowrap'}}>{chu}</div>;
};

/* ------------------------------------------------------------------ người */
/** Người nhờ (ảnh TopView tách nền): nảy lên ở `at`, bóng thoại chữ, bảng tên. Cùng nét với Mascot của d10. */
export const Nguoi: React.FC<{anh: string; ten: string; mau: string; x: number; h: number; at: number; says?: Say[]; bottom?: number; side?: 'left' | 'right'; lat?: boolean; bubbleW?: number; bubbleTop?: number}> =
  ({anh, ten, mau, x, h, at, says = [], bottom = -h * 0.03, side = 'right', lat, bubbleW = 600, bubbleTop}) => {
    const f = useCurrentFrame(), {fps, height: H} = useVideoConfig();
    if (f < at) return null;
    const p = pop(f, at, fps, 10);
    const bob = Math.sin(f / 10) * 5;
    const top = H - bottom - h;
    const say = says.find((s) => f >= s.at && f < s.out + 6);
    const sp = say ? ease(f, [say.at, say.at + 8], [0, 1], Easing.out(Easing.back(1.6))) * (1 - ease(f, [say.out, say.out + 6], [0, 1])) : 0;
    return (
      <>
        <div style={{position: 'absolute', left: x - h * 0.3, top: top + (1 - p) * h * 0.6 + bob, width: h * 0.6, height: h, opacity: Math.min(1, p * 2),
          transform: `scale(${0.75 + 0.25 * p})`, transformOrigin: '50% 100%'}}>
          <Img src={staticFile(`nguoi/${anh}.png`)} style={{width: '100%', height: '100%', objectFit: 'contain', objectPosition: '50% 100%',
            filter: 'drop-shadow(0 14px 22px rgba(20,18,45,.35))', transform: lat ? 'scaleX(-1)' : undefined}} />
        </div>
        {say && sp > 0.01 && (
          <div style={{position: 'absolute', top: (bubbleTop ?? top - 30) - 30 * (1 - sp), width: bubbleW, left: side === 'right' ? x + h * 0.12 : x - h * 0.12 - bubbleW,
            opacity: sp, transform: `scale(${0.8 + 0.2 * sp})`, transformOrigin: side === 'right' ? '0% 100%' : '100% 100%'}}>
            <div style={{position: 'absolute', bottom: '100%', [side === 'right' ? 'left' : 'right']: 18, transform: 'translateY(50%)', background: mau, color: '#fff',
              fontWeight: 800, fontSize: 26, padding: '4px 14px', borderRadius: 12, zIndex: 2, fontFamily: FONT, letterSpacing: '0.04em', whiteSpace: 'nowrap'}}>{ten}</div>
            <div style={{background: '#fff', border: `3px solid ${mau}`, borderRadius: 26, padding: '26px 28px 20px', fontFamily: FONT, fontWeight: 700, fontSize: 40,
              color: C.ink, lineHeight: 1.3, boxShadow: '0 18px 40px rgba(34,26,102,.22)'}}>{say.text}</div>
          </div>
        )}
      </>
    );
  };

/* ------------------------------------------------------------------ đồng hồ, bảng thành tựu, nhãn gói */
/** Đồng hồ góc trên trái: giờ chạy từ `tu` tới `den` (phút trong ngày) trong suốt cảnh; `gap` = đỏ nhấp nháy khi sát hạn. */
export const DongHo: React.FC<{tu: number; den?: number; dai?: number; gap?: boolean}> = ({tu, den = tu, dai = 300, gap}) => {
  const f = useCurrentFrame();
  const m = Math.round(interpolate(f, [0, dai], [tu, den], CLAMP));
  const chu = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  const nhay = gap && Math.floor(f / 12) % 2 === 0;
  return (
    <div style={{position: 'absolute', left: 40, top: 48, display: 'flex', alignItems: 'center', gap: 14, padding: '14px 26px', borderRadius: 999,
      background: nhay ? C.bad : '#fff', color: nhay ? '#fff' : C.ink, border: `4px solid ${C.ink}`, boxShadow: `0 8px 0 ${C.ink}`, fontFamily: MONO, fontWeight: 700, fontSize: 46}}>
      <Icon name="Clock" size={44} color={nhay ? '#fff' : C.ink} stroke={2.6} />{chu}
    </div>
  );
};

/** Nhãn gói ở góc trên phải: "Gói 2 · Tay kẹp". */
export const NhanGoi: React.FC<{so: number; ten: string}> = ({so, ten}) => (
  <div style={{position: 'absolute', right: 40, top: 54, padding: '12px 24px', borderRadius: 18, background: C.sola, color: '#fff', fontFamily: FONT, fontWeight: 800,
    fontSize: 34, border: `4px solid ${C.ink}`, boxShadow: `0 8px 0 ${C.ink}`}}>Gói {so} · {ten}</div>
);

/** Bảng đơn hàng của người nhờ: các dòng < `xong` đã gạch; dòng `moi` gạch ở khung `at` (dấu tích nảy); `xoa` = dòng bị xoá lại (bước lùi). */
export const BangViec: React.FC<{tieuDe: string; dong: string[]; xong: number; moi?: number; at?: number; xoa?: number; x?: number; y?: number; w?: number}> =
  ({tieuDe, dong, xong, moi, at = 0, xoa, x = 90, y = 300, w = 900}) => {
    const f = useCurrentFrame(), {fps} = useVideoConfig();
    const vao = pop(f, 0, fps, 13);
    return (
      <div style={{position: 'absolute', left: x, top: y, width: w, background: '#FFFDF5', borderRadius: 28, border: `5px solid ${C.ink}`, boxShadow: `0 14px 0 ${C.ink}`,
        padding: '70px 40px 30px', fontFamily: FONT, transform: `translateY(${(1 - vao) * 120}px) rotate(-1.5deg)`, opacity: Math.min(1, vao * 2)}}>
        <div style={{position: 'absolute', top: -34, left: '50%', transform: 'translateX(-50%)', width: 220, height: 62, borderRadius: 16, background: '#94A3B8', border: `5px solid ${C.ink}`}} />
        <div style={{position: 'absolute', top: 18, left: 40, right: 40, fontSize: 38, fontWeight: 900, color: C.ink}}>{tieuDe}</div>
        {dong.map((d, i) => {
          const daXong = i < xong || (i === moi && f >= at);
          const pTich = i === moi ? pop(f, at, fps, 9) : 1;
          const biXoa = xoa === i && f >= at;
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 18, height: 64, borderBottom: '2px dashed #E4E1F7', fontSize: 34, fontWeight: 700,
              color: daXong && !biXoa ? C.soft : C.ink, background: i === moi && f >= at ? `rgba(250,204,21,${0.35 * (1 - ease(f, [at + 20, at + 60], [0, 1]))})` : undefined}}>
              <div style={{width: 44, height: 44, borderRadius: 10, border: `4px solid ${C.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: daXong && !biXoa ? C.good : '#fff', transform: i === moi ? `scale(${0.6 + 0.4 * pTich})` : undefined}}>
                {daXong && !biXoa ? <Icon name="Check" size={32} color="#fff" stroke={4} /> : biXoa ? <Icon name="X" size={30} color={C.bad} stroke={4} /> : null}
              </div>
              <span style={{textDecoration: daXong && !biXoa ? 'line-through' : undefined}}>{i + 1}. {d}</span>
            </div>
          );
        })}
      </div>
    );
  };

/* ------------------------------------------------------------------ trong xe trạm */
/** Trong xe trạm: nền lab, Luna và Sola, part mới (hình robot có part) nảy lên sa bàn ở `cach` với CẠCH!. Lời thoại theo `luna`, `sola`. */
export const TrongXe: React.FC<{anh: string; cach: number; luna: Say[]; sola: Say[]; lunaMat?: [number, string][]; solaMat?: [number, string][]; tenPart?: string; mua?: string}> =
  ({anh, cach, luna, sola, lunaMat = [[0, 'thinking']], solaMat = [[0, 'thinking']], tenPart, mua}) => {
    const f = useCurrentFrame(), {fps} = useVideoConfig(), m = React.useContext(MuaCtx);
    const p = pop(f, cach, fps, 9);
    const S = 520 * (RONG[anh] ?? 576) / 576;
    return (
      <AbsoluteFill style={{background: '#EEF2FF', fontFamily: FONT, overflow: 'hidden'}}>
        <Img src={staticFile('nen-doc/trong-xe.jpg')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />
        {f >= cach - 30 ? (
          <div style={{position: 'absolute', left: 540 - S / 2, top: 1010 - S / 2, width: S, height: S, opacity: Math.min(1, p * 2),
            transform: `scale(${0.4 + 0.6 * p}) rotate(${(1 - p) * -30}deg)`, filter: `drop-shadow(0 0 ${f >= cach ? 30 : 0}px ${C.yellow})`}}>
            <Img src={staticFile(duongRobot(mua ?? m, anh))} style={{width: S, height: S}} />
          </div>
        ) : null}
        <Burst at={cach} x={540} y={1010} color={C.yellow} r={260} />
        <ChuNay chu="CẠCH!" at={cach} den={cach + 50} x={540} y={720} mau={C.sola} co={130} />
        {tenPart && f >= cach + 8 ? (
          <div style={{position: 'absolute', left: 0, right: 0, top: 1300, textAlign: 'center', opacity: ease(f, [cach + 8, cach + 18], [0, 1])}}>
            <span style={{display: 'inline-block', padding: '12px 30px', borderRadius: 18, background: C.ink, color: '#fff', fontWeight: 800, fontSize: 40}}>{tenPart}</span>
          </div>
        ) : null}
        <Mascot who="sola" x={250} h={560} at={0} faces={solaMat} says={sola} bubbleW={520} bubbleTop={1290} />
        <Mascot who="luna" x={830} h={560} at={6} faces={lunaMat} says={luna} side="left" bubbleW={520} bubbleTop={1290} lat />
      </AbsoluteFill>
    );
  };

/** Câu treo cuối phim mở: sa bàn trong xe (phóng gần), R1 có part mới đứng giữa, Sola nói câu treo, nút "Vào gói". */
export const CauTreo: React.FC<{anh: string; cau: string; so: number; ten: string; mua?: string; xoay?: number}> = ({anh, cau, so, ten, mua, xoay = -90}) => {
  const f = useCurrentFrame(), {fps} = useVideoConfig(), m = React.useContext(MuaCtx);
  const z = ease(f, [0, 40], [1, 1.35]);
  const S = 420 * (RONG[anh] ?? 576) / 576;
  const nut = pop(f, 40, fps, 10);
  return (
    <AbsoluteFill style={{background: '#EEF2FF', fontFamily: FONT, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: '50% 58%'}}>
        <Img src={staticFile('nen-doc/trong-xe.jpg')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />
        <div style={{position: 'absolute', left: 540 - S / 2, top: 1050 - S / 2, width: S, height: S, transform: `rotate(${xoay + Math.sin(f / 12) * 4}deg)`}}>
          <Img src={staticFile(duongRobot(mua ?? m, anh))} style={{width: S, height: S}} />
        </div>
      </AbsoluteFill>
      <Mascot who="sola" x={300} h={600} at={0} faces={[[0, 'confident']]} says={[{at: 6, out: 999, text: cau}]} bubbleW={560} bubbleTop={1240} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 220, textAlign: 'center', opacity: Math.min(1, nut * 2), transform: `scale(${0.7 + 0.3 * nut})`}}>
        <span style={{display: 'inline-flex', alignItems: 'center', gap: 16, padding: '22px 44px', borderRadius: 26, background: C.sola, color: '#fff', fontWeight: 900, fontSize: 54,
          border: `5px solid ${C.ink}`, boxShadow: `0 12px 0 ${C.ink}`}}><Icon name="Play" size={52} color="#fff" stroke={3} />Vào gói {so} · {ten}</span>
      </div>
    </AbsoluteFill>
  );
};
