// Ảnh nền dùng chung cho game và phim (user 30/10): 1 bản đồ thế giới + 7 ảnh mùa, gen bằng TopView, đặt ở public/nen/<mã>.png (1920×1080).
// Chưa có ảnh thì vẽ nền tạm có nhãn vàng. Có ảnh rồi: bật CO_ANH[mã] = true.
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {FONT, mo} from './kit';

export type MaNen = 'the-gioi' | 'mua-1' | 'mua-2' | 'mua-3' | 'mua-4' | 'mua-5' | 'mua-6' | 'mua-7';
export const CO_ANH: Record<MaNen, boolean> = {
  'the-gioi': true, 'mua-1': true, 'mua-2': true, 'mua-3': true, 'mua-4': true, 'mua-5': true, 'mua-6': true, 'mua-7': true,
};
export const TEN_NEN: Record<MaNen, string> = {
  'the-gioi': 'bản đồ thị trấn', 'mua-1': 'kho hàng', 'mua-2': 'nhà máy', 'mua-3': 'bãi tái chế', 'mua-4': 'nông trại',
  'mua-5': 'mỏ đá', 'mua-6': 'núi tuyết', 'mua-7': 'phòng CLB',
};
const MAU_TAM: Record<MaNen, string> = {
  'the-gioi': '#EEF2F7', 'mua-1': '#F3EBDD', 'mua-2': '#E9E7EF', 'mua-3': '#EDE4DA', 'mua-4': '#E6EEF5', 'mua-5': '#E3F1E4', 'mua-6': '#EEF4FA', 'mua-7': '#F1EEFB',
};

/** Nhãn "nền tạm": chỗ này chờ ảnh TopView. */
export const NhanTam: React.FC<{chu: string}> = ({chu}) => (
  <div style={{position: 'absolute', left: 24, top: 20, fontFamily: FONT, fontSize: 18, fontWeight: 700, color: '#B45309', background: '#FEF3C7',
    border: '2px dashed #F59E0B', borderRadius: 10, padding: '4px 12px', zIndex: 50}}>Nền tạm · chờ ảnh TopView: {chu}</div>
);

/**
 * Ảnh nền phủ kín khung, phóng chậm (zoom từ 1 tới phong) quanh điểm tam (0..1). mo: làm mờ (px) khi nền chỉ làm phông sau sân.
 * Chưa có ảnh: nền màu + nhãn tạm (tamVe: hình vẽ tạm thay ảnh, vd bản đồ đường kẻ).
 */
export const AnhNen: React.FC<{ma: MaNen; phong?: [number, number]; khung?: [number, number]; tam?: [number, number]; mo?: number; tamVe?: React.ReactNode}> = ({ma, phong = [1, 1.06], khung = [0, 300], tam = [0.5, 0.5], mo: lamMo = 0, tamVe}) => {
  const f = useCurrentFrame();
  const z = mo(f, khung[0], khung[1], phong[0], phong[1]);
  const bien: React.CSSProperties = {transform: `scale(${z})`, transformOrigin: `${tam[0] * 100}% ${tam[1] * 100}%`, filter: lamMo ? `blur(${lamMo}px)` : undefined};
  return (
    <AbsoluteFill>
      {CO_ANH[ma]
        ? <Img src={staticFile(`nen/${ma}.png`)} style={{width: '100%', height: '100%', objectFit: 'cover', ...bien}} />
        : <AbsoluteFill style={{background: MAU_TAM[ma], ...bien}}>{tamVe}</AbsoluteFill>}
      {CO_ANH[ma] ? null : <NhanTam chu={TEN_NEN[ma]} />}
    </AbsoluteFill>
  );
};
