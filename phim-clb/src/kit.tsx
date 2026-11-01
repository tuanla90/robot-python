// Bộ dựng chung của phim CLB Mật Lệnh Robot: màu, nền sân nhìn từ trên, robot (hình xuất từ game), mascot, bong bóng thoại, bảng code, phụ đề.
import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont} from '@remotion/google-fonts/BeVietnamPro';

export const {fontFamily: FONT} = loadFont('normal', {weights: ['500', '700', '800'], subsets: ['vietnamese', 'latin']});
export const MONO = 'Consolas, "Cascadia Mono", monospace';

/** Bảng màu "lab trắng" của game + màu riêng Sola / Luna (diem10code-video README). */
export const M = {
  nen: '#F4F2FB', san: '#FFFFFF', luoi: '#E6E8F2', vien: '#CBD5E1', muc: '#1E1B4B', mucNhat: '#64748B',
  sola: '#38BDF8', solaDam: '#0284C7', luna: '#F472B6', lunaDam: '#DB2777',
  sang: '#FACC15', dung: '#94A3B8', truc: '#EF4444', code: '#1E1B4B', codeChu: '#E0E7FF', codeSang: '#4338CA',
};

/* ------------------------------------------------------------------ robot */
/** Hình robot 576×576, tâm thân ở giữa; bánh trái tâm (297, 125), bánh phải (297, 443) khi mũi quay sang phải (đo trên r1.png). */
export const BANH = {d: 159 / 576, x: 9 / 576, w: 226 / 576, h: 86 / 576};
export type Diem = {x: number; y: number};
export type TuThe = Diem & {goc: number};

const rad = (g: number) => (g * Math.PI) / 180;
function xoayVec(p: Diem, g: number): Diem {
  const c = Math.cos(rad(g)), s = Math.sin(rad(g));
  return {x: p.x * c - p.y * s, y: p.x * s + p.y * c};
}
/** Điểm trong khung robot (x tới trước, y sang phải xe) → toạ độ màn hình. */
export function raNgoai(t: TuThe, p: Diem): Diem {
  const v = xoayVec(p, t.goc);
  return {x: t.x + v.x, y: t.y + v.y};
}
/** Tâm bánh trong khung robot, S = cạnh hình robot. Bánh trái ở phía y âm (bên trái xe). */
export function tamBanh(banh: 'trai' | 'phai', S: number): Diem {
  return {x: BANH.x * S, y: (banh === 'trai' ? -1 : 1) * BANH.d * S};
}
/**
 * Xe quay phi độ (dương = theo chiều kim đồng hồ = rẽ phải) quanh bánh truc đang đứng yên.
 * Rẽ phải: bánh trái chạy, trục là bánh phải. Rẽ trái: bánh phải chạy, trục là bánh trái.
 */
export function xoayQuanh(t0: TuThe, phi: number, truc: 'trai' | 'phai', S: number): TuThe {
  const p = tamBanh(truc, S), P = raNgoai(t0, p), v = xoayVec(p, t0.goc + phi);
  return {x: P.x - v.x, y: P.y - v.y, goc: t0.goc + phi};
}
export function tien(t0: TuThe, quang: number): TuThe {
  const v = xoayVec({x: quang, y: 0}, t0.goc);
  return {x: t0.x + v.x, y: t0.y + v.y, goc: t0.goc};
}

type BanhSang = {trai?: boolean; phai?: boolean};
/**
 * Robot nhìn từ trên đặt theo tâm. chay: bánh nào đang quay (hình nháy pha 0 / 1 + lớp sáng + mũi tên chạy tới).
 * dungYen: bánh nào hiện nhãn "đứng yên". nhan: hiện nhãn "Bánh TRÁI" / "Bánh PHẢI" (chữ luôn đứng thẳng).
 */
export const Robot: React.FC<{t: TuThe; S: number; anh?: string; chay?: BanhSang; dungYen?: BanhSang; nhan?: number; mo?: number}> = ({t, S, anh = 'r1', chay = {}, dungYen = {}, nhan = 0, mo = 1}) => {
  const f = useCurrentFrame();
  const ma = anh;      // hình game không vẽ khác nhau theo bánh chạy (r1-trai-*, r1-phai-* trùng r1), nên bánh lăn chỉ hiện bằng lớp sáng + mũi tên
  const lop = (banh: 'trai' | 'phai') => {
    const c = tamBanh(banh, S), w = BANH.w * S * 1.08, h = BANH.h * S * 1.25;
    const sang = banh === 'trai' ? chay.trai : chay.phai, dung = banh === 'trai' ? dungYen.trai : dungYen.phai;
    const chu = banh === 'trai' ? 'Bánh TRÁI' : 'Bánh PHẢI';
    return (
      <React.Fragment key={banh}>
        {sang ? (
          <div style={{position: 'absolute', left: S / 2 + c.x - w / 2, top: S / 2 + c.y - h / 2, width: w, height: h, borderRadius: h / 2,
            boxShadow: `0 0 ${S * 0.06}px ${S * 0.025}px ${M.sang}`, border: `${Math.max(3, S * 0.012)}px solid ${M.sang}`, overflow: 'hidden'}}>
            {[0, 1, 2].map((i) => {
              const x = ((f * S * 0.012 + (i * w) / 3) % w) - h * 0.2;
              return <div key={i} style={{position: 'absolute', left: x, top: h * 0.2, width: h * 0.45, height: h * 0.6, color: M.sang,
                fontSize: h * 0.7, lineHeight: `${h * 0.6}px`, fontWeight: 800, fontFamily: FONT, textShadow: `0 0 4px ${M.muc}`}}>›</div>;
            })}
          </div>
        ) : null}
        {dung ? (
          <>
            <div style={{position: 'absolute', left: S / 2 + c.x - w / 2, top: S / 2 + c.y - h / 2, width: w, height: h, borderRadius: h / 2,
              border: `${Math.max(3, S * 0.01)}px dashed ${M.dung}`, background: 'rgba(148,163,184,.25)'}} />
            {/* chốt trục: chấm tròn ở tâm bánh đứng yên, xe xoay quanh nó (tròn nên xoay theo thân vẫn đứng nguyên chỗ) */}
            <div style={{position: 'absolute', left: S / 2 + c.x - S * 0.045, top: S / 2 + c.y - S * 0.045, width: S * 0.09, height: S * 0.09, borderRadius: '50%',
              background: M.truc, border: `${Math.max(3, S * 0.012)}px solid #fff`, boxShadow: `0 0 0 ${Math.max(2, S * 0.008)}px ${M.muc}`}} />
          </>
        ) : null}
        {(nhan > 0 || dung) ? (() => {
          const ra = tamBanh(banh, S);
          const lech = xoayVec({x: 0, y: (banh === 'phai' ? -1 : 1) * S * 0.56}, -t.goc);
          return (
            <div style={{position: 'absolute', left: S / 2 + ra.x + lech.x, top: S / 2 + ra.y + lech.y,
              transform: `translate(-50%, -50%) rotate(${-t.goc}deg)`,
              opacity: dung && !nhan ? 1 : nhan, whiteSpace: 'nowrap', fontFamily: FONT, fontWeight: 800,
              fontSize: Math.max(28, Math.round(S * 0.115)),
              color: M.muc, background: sang ? M.sang : '#FFFFFF', border: `3.5px solid ${M.muc}`,
              boxShadow: '0 8px 20px rgba(30,27,75,.22)', borderRadius: 16, padding: '8px 18px', zIndex: 25}}>
              {chu}{dung ? ' · đứng yên' : sang ? ' · lăn' : ''}
            </div>
          );
        })() : null}
      </React.Fragment>
    );
  };
  return (
    <div style={{position: 'absolute', left: t.x - S / 2, top: t.y - S / 2, width: S, height: S, transform: `rotate(${t.goc}deg)`, opacity: mo}}>
      <Img src={staticFile(`robot/${ma}.png`)} style={{width: S, height: S}} />
      {lop('trai')}
      {lop('phai')}
    </div>
  );
};

/** Vệt bánh: đường đi của tâm bánh `banh` khi tư thế đi từ t(0) tới t(tienDo), lấy mẫu bằng hàm tuThe(u), u ∈ [0, 1]. */
export const VetBanh: React.FC<{tuThe: (u: number) => TuThe; banh: 'trai' | 'phai'; S: number; tienDo: number; mau?: string}> = ({tuThe, banh, S, tienDo, mau = M.sang}) => {
  const n = 40, diem: string[] = [];
  for (let i = 0; i <= n; i++) {
    const u = (i / n) * tienDo, p = raNgoai(tuThe(u), tamBanh(banh, S));
    diem.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`);
  }
  return (
    <svg style={{position: 'absolute', inset: 0, overflow: 'visible'}} width="100%" height="100%">
      <polyline points={diem.join(' ')} fill="none" stroke={mau} strokeWidth={S * 0.05} strokeLinecap="round" strokeDasharray={`${S * 0.06} ${S * 0.05}`} opacity={0.85} />
    </svg>
  );
};

/* ------------------------------------------------------------------ nền */
/** Sân nhìn từ trên: ô trắng, lưới mờ. */
export const San: React.FC<{x: number; y: number; w: number; h: number; o: number}> = ({x, y, w, h, o}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, background: M.san, borderRadius: 24, border: `3px solid ${M.vien}`,
    backgroundImage: `linear-gradient(${M.luoi} 2px, transparent 2px), linear-gradient(90deg, ${M.luoi} 2px, transparent 2px)`,
    backgroundSize: `${o}px ${o}px`, backgroundPosition: `${(w / 2) % o - 1}px ${(h / 2) % o - 1}px`, boxShadow: '0 10px 30px rgba(30,27,75,.08)'}} />
);

/** Khung một cảnh dài `dai`: nền lavender, mờ vào 10 khung đầu, mờ ra 10 khung cuối. */
export const Canh: React.FC<{dai: number; children: React.ReactNode}> = ({dai, children}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: M.nen, fontFamily: FONT}}>
      <AbsoluteFill style={{opacity: Math.min(mo(f, 0, 10), 1 - mo(f, dai - 10, dai))}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ nhân vật */
export type Ai = 'sola' | 'luna';
/** Mascot (ảnh diem10code) trượt vào từ khung `vao`, nhún nhẹ. lat: lật ngang. */
export const Mascot: React.FC<{ai: Ai; bieuCam: string; x: number; y: number; h: number; vao?: number; lat?: boolean}> = ({ai, bieuCam, x, y, h, vao = 0, lat}) => {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  const s = spring({frame: f - vao, fps, config: {damping: 14}});
  const nhun = Math.sin((f - vao) / 9) * 4;
  return (
    <Img src={staticFile(`mascot/${ai}/${bieuCam}.png`)} style={{position: 'absolute', left: x, top: y + (1 - s) * 80 + nhun, height: h, opacity: s,
      transform: lat ? 'scaleX(-1)' : undefined}} />
  );
};

/** Bong bóng thoại có tên người nói; hiện từ khung `tu` tới khung `den`. duoi: đuôi chỉ về phía 'trai' | 'phai' | 'duoi'. */
export const Bong: React.FC<{ai: Ai; x: number; y: number; w: number; tu: number; den?: number; duoi?: 'trai' | 'phai' | 'duoi'; children: React.ReactNode}> = ({ai, x, y, w, tu, den = 99999, duoi = 'trai', children}) => {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  if (f < tu || f > den) return null;
  const s = spring({frame: f - tu, fps, config: {damping: 12, mass: 0.6}});
  const mau = ai === 'sola' ? M.solaDam : M.lunaDam;
  const duoiStyle: React.CSSProperties = duoi === 'trai' ? {left: -18, top: 40, borderWidth: '12px 20px 12px 0', borderColor: `transparent ${mau} transparent transparent`}
    : duoi === 'phai' ? {right: -18, top: 40, borderWidth: '12px 0 12px 20px', borderColor: `transparent transparent transparent ${mau}`}
    : {left: 60, bottom: -18, borderWidth: '20px 12px 0 12px', borderColor: `${mau} transparent transparent transparent`};
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, transform: `scale(${s})`, transformOrigin: duoi === 'phai' ? 'right center' : 'left center',
      background: '#fff', border: `4px solid ${mau}`, borderRadius: 22, padding: '16px 22px', fontFamily: FONT, fontSize: 30, fontWeight: 700, color: M.muc, lineHeight: 1.3}}>
      <div style={{position: 'absolute', top: -20, left: 18, background: mau, color: '#fff', fontSize: 20, fontWeight: 800, borderRadius: 10, padding: '2px 12px'}}>
        {ai === 'sola' ? 'Sola' : 'Luna'}
      </div>
      <div style={{position: 'absolute', width: 0, height: 0, borderStyle: 'solid', ...duoiStyle}} />
      {children}
    </div>
  );
};

/* ------------------------------------------------------------------ code */
/** Bảng code: dòng hiện dần (go: số dòng đã gõ, có thể lẻ), dòng sang = đang chạy. */
export const BangCode: React.FC<{x: number; y: number; w: number; dong: string[]; go?: number; sang?: number; co?: number; tieuDe?: string}> = ({x, y, w, dong, go = 99, sang = -1, co = 30, tieuDe = 'Mật lệnh của Sola'}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, background: M.code, borderRadius: 18, padding: '14px 0 18px', boxShadow: '0 12px 30px rgba(30,27,75,.25)'}}>
    <div style={{fontFamily: FONT, fontSize: 18, fontWeight: 700, color: '#A5B4FC', padding: '0 20px 8px'}}>{tieuDe}</div>
    {dong.map((d, i) => {
      if (i >= go) return null;
      const phan = i + 1 > go ? d.slice(0, Math.floor((go - i) * d.length)) : d;
      const la = i === sang;
      return (
        <div key={i} style={{display: 'flex', gap: 16, padding: '3px 20px', background: la ? M.codeSang : 'transparent', borderLeft: `6px solid ${la ? M.sang : 'transparent'}`}}>
          <span style={{fontFamily: MONO, fontSize: co * 0.8, color: '#6366F1', width: co * 0.8, textAlign: 'right'}}>{i + 1}</span>
          <span style={{fontFamily: MONO, fontSize: co, color: la ? '#fff' : M.codeChu, fontWeight: la ? 700 : 400}}>{phan}</span>
        </div>
      );
    })}
  </div>
);

/** Phụ đề chốt ý ở đáy khung (chữ to, nền vàng). */
export const ChuChot: React.FC<{tu: number; den?: number; children: React.ReactNode; y?: number}> = ({tu, den = 99999, children, y = 610}) => {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  if (f < tu || f > den) return null;
  const s = spring({frame: f - tu, fps, config: {damping: 13}});
  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      <div style={{position: 'absolute', top: y, transform: `translateY(${(1 - s) * 40}px)`, opacity: s, fontFamily: FONT, fontSize: 40, fontWeight: 800,
        color: M.muc, background: M.sang, border: `4px solid ${M.muc}`, borderRadius: 18, padding: '10px 30px', whiteSpace: 'nowrap'}}>{children}</div>
    </AbsoluteFill>
  );
};

/** Nội suy có làm mượt, kẹp hai đầu. */
export const mo = (f: number, a: number, b: number, tu = 0, den = 1, ease = Easing.inOut(Easing.cubic)) =>
  interpolate(f, [a, b], [tu, den], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
