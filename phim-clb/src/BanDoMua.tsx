// Bản đồ hành trình dọc kiểu Duolingo, đi TỪ TRÊN XUỐNG (user 30/10): mỗi mùa một ảnh TopView dọc (mùa 1: đường bắt đầu ở cổng CLB
// trên đỉnh; mùa sau: đường vào giữa mép trên), ra ở giữa mép dưới; mùa sau nằm ngay dưới và hiện dần ở mép trên (chồng CHONG px),
// KHÔNG có dải che chỗ nối. 10 nút gói mỗi mùa do code vẽ trên con đường (dò bằng tools/do-duong.py → ban-do-mua.json);
// nút cuối là điểm dừng của mùa: icon nơi chốn + tên. Bản xem thử: camera cuộn từ CLB xuống.
import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT, Icon} from './d10';
import DUONG from './ban-do-mua.json';

const W = 1080, H_ANH = 1924, CHONG = 200;           // ảnh mùa 1080×1924, hai mùa chồng 200 px (ghép sẵn bằng tools/noi-mua.py: đường cắt tối ưu)
export type Mua = {anh: string; khoa: keyof typeof DUONG; ten: string; icon: string; mau: string};
type TrangThai = 'xong' | 'mo' | 'khoa';

/** Rải n nút đều theo chiều dài đường (toạ độ 0..1, đi từ trên xuống), từ tỉ lệ dau tới cuoi của chiều dài. */
function raiNut(duong: number[][], n = 10, dau = 0, cuoi = 0.9): number[][] {
  const xuong = duong[0][1] <= duong[duong.length - 1][1] ? duong : [...duong].reverse();
  const P = xuong.map(([x, y]) => [x * W, y * H_ANH]);
  const doan = [0];
  for (let i = 1; i < P.length; i++) doan.push(doan[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
  const L = doan[doan.length - 1];
  return Array.from({length: n}, (_, i) => {
    const s = L * (dau + (cuoi - dau) * i / (n - 1));
    let j = doan.findIndex((d) => d >= s); if (j <= 0) j = 1;
    const t = (s - doan[j - 1]) / (doan[j] - doan[j - 1] || 1);
    return [(P[j - 1][0] + (P[j][0] - P[j - 1][0]) * t) / W, (P[j - 1][1] + (P[j][1] - P[j - 1][1]) * t) / H_ANH];
  });
}
/** Mùa đầu bắt đầu ở cổng CLB (đầu đường); mùa sau chừa đoạn đầu (chỗ nối) cho khỏi trùng nút cuối mùa trước. */
export const nutCua = (mua: Mua, sau: boolean) => raiNut(DUONG[mua.khoa].duong, 10, sau ? 0.15 : 0, 0.86);

/** 10 nút gói của một mùa (ảnh nền là ảnh dài đã ghép sẵn); nút cuối là điểm dừng có icon nơi chốn. */
const LopMua: React.FC<{mua: Mua; y: number; sau: boolean; trangThai: (i: number) => TrangThai; f: number}> = ({mua, y, sau, trangThai, f}) => {
  const nut = nutCua(mua, sau);
  return (
    <div style={{position: 'absolute', left: 0, top: y, width: W, height: H_ANH}}>
      {nut.map(([nx, ny], i) => {
        const tt = trangThai(i), cuoi = i === nut.length - 1;
        const r = cuoi ? 84 : 56, nhip = tt === 'mo' ? 1 + 0.06 * Math.sin(f / 6) : 1;
        const nen = cuoi ? (tt === 'khoa' ? '#E5E7EB' : mua.mau) : tt === 'xong' ? C.yellow : tt === 'mo' ? mua.mau : '#E5E7EB';
        const mauChu = tt === 'khoa' ? '#9CA3AF' : cuoi ? '#fff' : C.ink;
        return (
          <React.Fragment key={i}>
            <div style={{position: 'absolute', left: nx * W - r, top: ny * H_ANH - r, width: 2 * r, height: 2 * r, borderRadius: cuoi ? 36 : '50%', background: nen,
              border: `7px solid ${C.ink}`, boxShadow: `0 ${tt === 'khoa' ? 7 : 13}px 0 ${C.ink}, inset 0 6px 0 rgba(255,255,255,0.45)`, transform: `scale(${nhip})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 46, color: mauChu}}>
              {cuoi ? <Icon name={mua.icon} size={86} color={mauChu} stroke={2.6} />
                : tt === 'khoa' ? <Icon name="Lock" size={42} color={mauChu} stroke={2.8} />
                : tt === 'xong' ? <Icon name="Check" size={52} color={C.ink} stroke={3.6} /> : i + 1}
            </div>
            {cuoi ? (
              <div style={{position: 'absolute', left: nx * W, top: ny * H_ANH + r + 18, transform: 'translateX(-50%)', whiteSpace: 'nowrap', padding: '10px 26px',
                borderRadius: 20, background: 'linear-gradient(180deg, #FFFFFF 0%, #FEF3C7 100%)', border: `5px solid ${C.ink}`,
                boxShadow: `0 8px 0 ${C.ink}`, fontFamily: FONT, fontSize: 34, fontWeight: 900, color: C.ink}}>{mua.ten}</div>
            ) : null}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export const taoBanDo = (MUA: Mua[], anhDai: string, xe: {anh: string; mua: number; nut: number}) => {
  const cao = H_ANH * MUA.length - CHONG * (MUA.length - 1);
  const yMua = (k: number) => k * (H_ANH - CHONG);                              // mùa 1 ở đỉnh, đi xuống
  const tt = (k: number) => (i: number): TrangThai => (k < xe.mua ? 'xong' : k > xe.mua ? 'khoa' : i < xe.nut ? 'xong' : i === xe.nut ? 'mo' : 'khoa');
  const BanDo: React.FC = () => {
    const f = useCurrentFrame(), {durationInFrames: dai} = useVideoConfig();
    // camera: dừng ở CLB 1,5 giây, cuộn xuống hết, dừng ở đáy 1 giây
    const dich = interpolate(f, [45, dai - 30], [0, cao - 1920], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
    const nx = nutCua(MUA[xe.mua], xe.mua > 0)[xe.nut];
    return (
      <AbsoluteFill style={{background: '#9BD27A', overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 0, top: -dich, width: W, height: cao}}>
          <Img src={staticFile(`ban-do/${anhDai}`)} style={{position: 'absolute', left: 0, top: 0, width: W, height: cao}} />
          {MUA.map((m, k) => <LopMua key={k} mua={m} y={yMua(k)} sau={k > 0} trangThai={tt(k)} f={f} />)}
          {/* xe trạm đỗ cạnh nút gói đang mở */}
          <Img src={staticFile(`robot/${xe.anh}`)} style={{position: 'absolute', width: 175, left: nx[0] * W + (nx[0] > 0.72 ? -260 : 90), top: yMua(xe.mua) + nx[1] * H_ANH - 120,
            transform: nx[0] > 0.72 ? 'scaleX(-1)' : undefined, filter: 'drop-shadow(0 0 18px #FDE047) drop-shadow(0 12px 10px rgba(30,27,75,.45))'}} />
        </div>
        {/* Thanh HUD Chiến Dịch cố định trên đỉnh màn hình bản đồ */}
        <div style={{position: 'absolute', left: 36, right: 36, top: 28, padding: '14px 26px', borderRadius: 24,
          background: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)', border: `5px solid ${C.ink}`,
          boxShadow: `0 9px 0 ${C.ink}, 0 16px 28px rgba(0,0,0,0.4)`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: FONT, zIndex: 30}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
            <Icon name="Compass" size={34} color="#FDE047" stroke={2.8} />
            <span style={{fontSize: 28, fontWeight: 900, color: '#FFFFFF', letterSpacing: '0.02em'}}>BẢN ĐỒ CHIẾN DỊCH · CLB ROBOT</span>
          </div>
          <span style={{padding: '6px 16px', borderRadius: 14, background: '#FDE047', color: C.ink, fontSize: 22, fontWeight: 900, border: `3px solid ${C.ink}`}}>
            9 CHẶNG · 80 MÀN
          </span>
        </div>
      </AbsoluteFill>
    );
  };
  return {BanDo, cao};
};
