// Bản đồ thế giới: ảnh nền 'the-gioi' (TopView 30/10: MỘT con đường uốn từ thị trấn góc dưới trái lên đỉnh núi tuyết góc trên phải,
// sáu trạm theo thứ tự mùa, mỗi trạm có sẵn một ô trắng để đặt nhãn). Nhãn đặt đúng lên các ô trắng (toạ độ đo bằng máy trên ảnh,
// khung 1280×720); R1 chạy dọc con đường qua các ô nhãn theo thứ tự (user 30/10: các mùa xếp từ CLB ra xa rồi quay về).
import React from 'react';
import {Img, staticFile} from 'remotion';
import {AnhNen} from './nen';
import {M} from './kit';

export type Noi = {ma: string; ten: string; x: number; y: number; can?: string};
export const CLB: Noi = {ma: 'clb', ten: 'CLB', x: 281, y: 669};
export const NOI: Noi[] = [
  {ma: 'mua-1', ten: 'Kho hàng', x: 295, y: 550, can: 'cần chở thùng'},
  {ma: 'mua-2', ten: 'Nhà máy', x: 406, y: 473, can: 'cần chữa cháy'},
  {ma: 'mua-3', ten: 'Bãi tái chế', x: 587, y: 383, can: 'cần phân loại rác'},
  {ma: 'mua-4', ten: 'Nông trại', x: 864, y: 444, can: 'cần chăm hoa'},
  {ma: 'mua-5', ten: 'Mỏ đá', x: 1048, y: 314, can: 'cần khai thác đá'},
  {ma: 'mua-6', ten: 'Núi tuyết', x: 1212, y: 194, can: 'cần tuần tra'},
];

/** Điểm trên con đường (gấp khúc qua CLB rồi các trạm theo thứ tự) ở tiến độ u ∈ [0, 1] của đoạn CLB → trạm thứ k. */
function tren(k: number, u: number) {
  const ds = [CLB, ...NOI.slice(0, k + 1)];
  const dai = ds.slice(1).map((p, i) => Math.hypot(p.x - ds[i].x, p.y - ds[i].y));
  let con = u * dai.reduce((a, b) => a + b, 0);
  for (let i = 0; i < dai.length; i++) {
    if (con <= dai[i] || i === dai.length - 1) {
      const t = Math.min(1, con / dai[i]), a = ds[i], b = ds[i + 1];
      return {x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, goc: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI, diQua: ds.slice(0, i + 1).concat([{x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t} as Noi])};
    }
    con -= dai[i];
  }
  return {x: CLB.x, y: CLB.y, goc: 0, diQua: [CLB]};
}

/**
 * hien: số nơi đã hiện (theo thứ tự NOI, có thể lẻ để nảy dần). sang: mã nơi được chọn (vàng, nhấp nháy).
 * duong: tiến độ 0..1 của đường CLB → nơi sang (đi dọc con đường); r1: vị trí R1 trên đường 0..1 (âm: ẩn).
 * can: 0..1 hiện nhãn việc cần làm dưới mỗi nơi; mo: 0..1 làm mờ các nơi không được chọn.
 */
export const BanDo: React.FC<{f: number; hien?: number; sang?: string; duong?: number; r1?: number; can?: number; mo?: number; phong?: [number, number]; khung?: [number, number]; tam?: [number, number]}> = ({f, hien = 6, sang, duong = 0, r1 = -1, can = 0, mo = 0, phong, khung, tam}) => {
  const k = NOI.findIndex((n) => n.ma === sang);
  const nhay = 1 + 0.08 * Math.sin(f / 5);
  return (
    <>
      <AnhNen ma="the-gioi" phong={phong} khung={khung} tam={tam} />
      {k >= 0 && duong > 0 ? (
        <svg style={{position: 'absolute', inset: 0}} width={1280} height={720}>
          <polyline points={tren(k, duong).diQua.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke={M.sola} strokeWidth={9} strokeDasharray="18 12"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
      {NOI.map((n, i) => {
        const s = Math.max(0, Math.min(1, hien - i));
        if (s <= 0) return null;
        const la = n.ma === sang;
        return (
          <div key={n.ma} style={{position: 'absolute', left: n.x, top: n.y, transform: `translate(-50%, -50%) scale(${s * (la ? nhay : 1)})`, padding: '6px 14px', borderRadius: 14,
            fontSize: 20, fontWeight: 800, background: la ? M.sang : '#fff', color: la ? M.muc : M.mucNhat, border: `3px solid ${la ? M.muc : M.vien}`, whiteSpace: 'nowrap',
            opacity: la ? 1 : 1 - 0.6 * mo, textAlign: 'center', boxShadow: '0 4px 10px rgba(30,27,75,.15)'}}>
            {n.ten}{la || can > 0 ? '' : ' ?'}
            {can > 0 && n.can ? <div style={{fontSize: 15, fontWeight: 700, color: la ? M.muc : '#B45309', opacity: can, marginTop: 1}}>{n.can}</div> : null}
          </div>
        );
      })}
      <div style={{position: 'absolute', left: CLB.x, top: CLB.y, transform: 'translate(-50%, -50%)', padding: '6px 18px', borderRadius: 14, fontSize: 20, fontWeight: 800,
        background: M.sola, color: '#fff', border: `3px solid ${M.solaDam}`}}>CLB</div>
      {r1 >= 0 && k >= 0 ? (() => {
        const p = tren(k, r1);
        return <Img src={staticFile('robot/r1.png')} style={{position: 'absolute', left: p.x - 40, top: p.y - 40, width: 80, height: 80, transform: `rotate(${p.goc}deg)`}} />;
      })() : null}
    </>
  );
};
