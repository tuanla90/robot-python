// Bộ dựng cảnh Lab dùng chung cho phim gói các mùa sau, theo khuôn mùa 1 (PhimTayKep, PhimMua2Lab):
// sa bàn lưới trong xe trạm → Sola viết mật lệnh, bấm Chạy → robot làm đúng luật lõi của game (dòng code sáng theo nhịp) →
// sai thì Luna chỉ HỎI dẫn, Sola tự rút ra → chạy lại đúng → thẻ "Lệnh mới" chỉ gồm lệnh của chính gói đó.
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {C, CodeBox, FONT, Headline, Icon, Mascot, MONO, PopIn, Say, Stage} from '../d10';
import {MuaCtx, O, tamO} from './kit-doc';

/** Lưới sa bàn: 5 cột × 5 hàng (hàng 0..4), dời xuống DY so với lưới hiện trường để chừa chỗ bảng code phía trên. */
export const DY = 70;
export const HANG_LAB = 5;
export const tamLab = (c: number, r: number) => { const p = tamO(c, r); return {x: p.x, y: p.y + DY}; };

/** Sa bàn: ảnh nơi chốn mờ tối, mặt lưới sáng; `san` là vật trên lưới (toạ độ tamO của kit-doc), `children` là lớp phủ (code, nút, nhân vật). */
export const SanLab: React.FC<{nen: string; mua: string; san: React.ReactNode; children?: React.ReactNode}> = ({nen, mua, san, children}) => {
  const p0 = tamLab(0, 0);
  return (
    <MuaCtx.Provider value={mua}>
      <AbsoluteFill style={{background: '#1E293B', fontFamily: FONT, overflow: 'hidden'}}>
        <Img src={staticFile(nen)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />
        <AbsoluteFill style={{background: 'rgba(15,23,42,0.45)'}} />
        <div style={{position: 'absolute', left: p0.x - O / 2 - 14, top: p0.y - O / 2 - 14, width: 5 * O + 28, height: HANG_LAB * O + 28, borderRadius: 30,
          background: 'rgba(241,245,249,0.9)', border: `6px solid ${C.ink}`, boxShadow: `0 14px 0 ${C.ink}`,
          backgroundImage: 'linear-gradient(rgba(30,27,75,.10) 2px, transparent 2px), linear-gradient(90deg, rgba(30,27,75,.10) 2px, transparent 2px)',
          backgroundSize: `${O}px ${O}px`, backgroundPosition: '14px 14px'}} />
        <div style={{position: 'absolute', left: p0.x - O / 2 - 14, top: p0.y + HANG_LAB * O - O / 2 + 22, padding: '6px 18px', borderRadius: 12,
          background: C.ink, color: '#FDE047', fontFamily: MONO, fontSize: 22, fontWeight: 800}}>SA BÀN XE TRẠM</div>
        <AbsoluteFill style={{transform: `translateY(${DY}px)`}}>{san}</AbsoluteFill>
        {children}
      </AbsoluteFill>
    </MuaCtx.Provider>
  );
};

/** Nút Chạy cạnh bảng code; lún xuống ở các khung `bam`. */
export const NutChay: React.FC<{bam: number[]; y?: number}> = ({bam, y = 125}) => {
  const f = useCurrentFrame();
  const lun = bam.some((b) => f >= b && f < b + 6);
  return (
    <div style={{position: 'absolute', left: 740, top: y, display: 'flex', alignItems: 'center', gap: 12, padding: '16px 32px', borderRadius: 20, fontSize: 36, fontWeight: 800,
      fontFamily: FONT, color: '#fff', background: lun ? C.solaDeep : C.sola, transform: `scale(${lun ? 0.9 : 1})`, boxShadow: '0 10px 24px rgba(2,132,199,.35)', zIndex: 13}}>
      <Icon name="Play" size={32} color="#fff" />Chạy
    </div>
  );
};

/** Mốc dòng sáng: [khung bắt đầu, chỉ số dòng]; -1 = tắt. */
export const dongSang = (f: number, moc: [number, number][]) => moc.filter(([t]) => f >= t).pop()?.[1] ?? -1;

/** Bảng mật lệnh + nút Chạy (vị trí chuẩn của mọi cảnh Lab). */
export const BangLenh: React.FC<{lines: string[]; sang?: [number, number][]; bam?: number[]; typeAt?: number; title?: string; w?: number}> =
  ({lines, sang = [], bam = [], typeAt, title = 'mat_lenh.py', w = 640}) => {
    const f = useCurrentFrame();
    const s = dongSang(f, sang);
    return (
      <>
        <CodeBox lines={lines} x={50} y={40} w={w} size={lines.length > 4 ? 30 : 34} typeAt={typeAt} cps={0.8} title={title} hl={s < 0 ? undefined : s} />
        {bam.length ? <NutChay bam={bam} /> : null}
      </>
    );
  };

const SAY = {bubbleTop: 1250, bubbleW: 520};
export const SolaL: React.FC<{says: Say[]; mat: [number, string][]; at?: number}> = ({says, mat, at = 0}) => (
  <Mascot who="sola" x={230} h={500} at={at} faces={mat} says={says} {...SAY} />
);
export const LunaL: React.FC<{says: Say[]; mat: [number, string][]; at?: number}> = ({says, mat, at = 0}) => (
  <Mascot who="luna" x={850} h={500} at={at} faces={mat} says={says} side="left" lat {...SAY} />
);

/** Dòng chốt luật (chỉ hiện SAU khi người xem đã thấy nó xảy ra). */
export const Chot: React.FC<{tu: number; den?: number; children: React.ReactNode; y?: number}> = ({tu, den = 1e9, children, y = 1110}) => {
  const f = useCurrentFrame();
  if (f < tu || f > den) return null;
  return (
    <PopIn at={tu} style={{position: 'absolute', left: 60, right: 60, top: y, textAlign: 'center', zIndex: 14}}>
      <span style={{display: 'inline-block', padding: '12px 28px', borderRadius: 18, background: '#FEF9C3', border: `4px solid ${C.ink}`, boxShadow: `0 8px 0 ${C.ink}`,
        fontFamily: FONT, fontWeight: 900, fontSize: 36, color: C.ink}}>{children}</span>
    </PopIn>
  );
};

/** Tia thẳng từ điểm `tu` tới `den` (cảm biến, tia nước…), toạ độ màn hình. */
export const Tia: React.FC<{tu: {x: number; y: number}; den: {x: number; y: number}; mau?: string; day?: number}> = ({tu, den, mau = C.yellow, day = 12}) => {
  const dx = den.x - tu.x, dy = den.y - tu.y, dai = Math.hypot(dx, dy), g = (Math.atan2(dy, dx) * 180) / Math.PI;
  return <div style={{position: 'absolute', left: tu.x, top: tu.y - day / 2, width: dai, height: day, borderRadius: day, background: mau, opacity: 0.85,
    transform: `rotate(${g}deg)`, transformOrigin: '0 50%', boxShadow: `0 0 18px ${mau}`}} />;
};

/** Nhãn nhỏ nổi trên sa bàn (giá trị cảm biến trả về, số nhịp…), toạ độ màn hình. */
export const Nhan: React.FC<{x: number; y: number; chu: string; at: number; den?: number; mau?: string; nen?: string}> = ({x, y, chu, at, den = 1e9, mau = '#F4F3FF', nen = C.codeBg}) => {
  const f = useCurrentFrame();
  if (f < at || f > den) return null;
  return <div style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)', padding: '8px 18px', borderRadius: 14, background: nen, color: mau,
    border: '3px solid #FDE047', fontFamily: MONO, fontSize: 30, fontWeight: 800, whiteSpace: 'nowrap', zIndex: 12, boxShadow: '0 8px 20px rgba(0,0,0,.35)'}}>{chu}</div>;
};

/** Thẻ tổng kết lệnh mới của gói (khuôn CanhLenhMoi mùa 1): chỉ lệnh của chính gói, mỗi lệnh một câu "làm gì". */
export type NhomLenh = {nhan: string; icon: string; mau: string; lenh: {ma: string; viec: string}[]};
export const LenhMoi: React.FC<{tieuDe: string; accent?: string[]; nhom: NhomLenh[]; loi: string}> = ({tieuDe, accent = [], nhom, loi}) => {
  let y = 250, at = 16;
  const khoi: React.ReactNode[] = [];
  nhom.forEach((n, i) => {
    khoi.push(
      <PopIn key={`n${i}`} at={at} style={{position: 'absolute', left: 65, top: y, width: 950}}>
        <div style={{display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 22px', borderRadius: 999, background: n.mau, color: '#fff', fontSize: 24, fontWeight: 900, letterSpacing: '0.04em'}}>
          <Icon name={n.icon} size={26} color="#FDE047" stroke={2.6} /><span>{n.nhan}</span>
        </div>
      </PopIn>,
    );
    y += 66; at += 8;
    n.lenh.forEach((l) => {
      khoi.push(
        <PopIn key={`${i}-${l.ma}`} at={at} style={{position: 'absolute', left: 65, top: y, width: 950}}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, background: '#fff', borderRadius: 22, padding: '18px 26px',
            border: `3px solid ${C.rule}`, boxShadow: '0 14px 34px rgba(34,26,102,.12)'}}>
            <span style={{fontFamily: 'JetBrains Mono, Consolas, monospace', fontSize: 32, fontWeight: 700, color: '#F4F3FF', background: C.codeBg, borderRadius: 12,
              padding: '8px 18px', whiteSpace: 'nowrap'}}>{l.ma}</span>
            <span style={{fontSize: 30, fontWeight: 800, color: C.ink, textAlign: 'right'}}>{l.viec}</span>
          </div>
        </PopIn>,
      );
      y += 128; at += 10;
    });
    y += 24;
  });
  return (
    <Stage>
      <Headline text={tieuDe} at={4} accent={accent} size={62} top={95} />
      {khoi}
      <Mascot who="sola" x={260} h={520} at={at + 6} faces={[[at + 6, 'thumbs-up']]} says={[{at: at + 18, out: at + 150, text: loi}]} bubbleTop={1260} bubbleW={540} />
    </Stage>
  );
};
