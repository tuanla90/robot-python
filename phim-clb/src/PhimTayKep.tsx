// Phim gói 2 mùa 1 "Tay kẹp" & gói 6 "Tay xoay" khổ dọc 1080×1920 (doc: true), theo đúng tinh thần Show, Don't Tell:
// - Mở đầu Gói 2: R1 đã biết chạy từ Gói 1, lao thẳng tới chỗ các thùng hàng nhưng va phải làm thùng bắn văng ra xa.
//   Chú Tư xuất hiện bảo phải cầm thùng lên mang ra đặt đúng vị trí -> Luna lắp thêm Tay kẹp.
// - Giải thích cơ chế nâng/hạ bằng GÓC NHÌN NGANG (Side-View 3/4 đúng thiết kế vector của R1):
//   1. Tay đang ở TRÊN CAO mà gọi grab() -> khép gọng giữa không trung, kẹp hụt! Phải arm_down() hạ sát sàn rồi mới grab().
//   2. Tay đang ở DƯỚI THẤP (sát sàn) mà cho xe chạy -> đáy gọng kẹp & thùng cạ sát mặt sàn làm kẹt cứng! Phải arm_up() nâng lên cao mới đi được.
//   3. Tay đang ở TRÊN CAO mà gọi release() -> thùng rơi tự do xuống sàn bị móp/vỡ hỏng! Phải arm_down() hạ chạm sàn rồi mới release().
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {Burst, C, CodeBox, FONT, Headline, Icon, Mascot, MONO, PopIn, Shake, Stage, Sub, ease} from './d10';
import {ChuChot, mo} from './kit';
import {Phim, W_IN, pops} from './may-phim';
import {ChuNay, DongHo, Moc, NenHienTruong, NhanGoi, Nguoi, ODat, TrongXe, Vat, Xe} from './doc/kit-doc';

/* ------------------------------------------------------------------ Giữ export helper cho các file mùa sau */
export const KhungLabLuna: React.FC<{huyHieu: string; tieuDe: string; phuDe?: string; accent?: string[]; children: React.ReactNode}> = ({
  huyHieu, tieuDe, phuDe, accent = [], children,
}) => (
  <AbsoluteFill style={{background: '#0F172A', fontFamily: FONT, overflow: 'hidden'}}>
    <Img src={staticFile('nen-doc/trong-xe.jpg')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(15,23,42,0.88) 0%, rgba(15,23,42,0.28) 32%, rgba(15,23,42,0.32) 68%, rgba(15,23,42,0.88) 100%)'}} />
    <div style={{position: 'absolute', left: 36, right: 36, top: 24, height: 198, borderRadius: 24,
      background: '#0F172A', border: '2px solid #334155', boxShadow: '0 10px 28px rgba(0,0,0,0.35)', zIndex: 5}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 38, textAlign: 'center', zIndex: 15}}>
      <span style={{display: 'inline-flex', alignItems: 'center', gap: 10, padding: '6px 20px', borderRadius: 999,
        background: '#1E293B', color: '#E2E8F0', fontSize: 20, fontWeight: 700, border: '1.5px solid #475569', whiteSpace: 'nowrap'}}>
        <Icon name="FlaskConical" size={20} color="#38BDF8" stroke={2.4} />
        <span>{huyHieu}</span>
      </span>
    </div>
    <Headline text={tieuDe} at={4} top={94} size={40} color="#FFFFFF" accent={accent} />
    {phuDe ? <Sub text={phuDe} at={14} top={158} size={24} color="#CBD5E1" /> : null}
    {children}
  </AbsoluteFill>
);

export const CongThucLab: React.FC<{lenh: string; coChe: string; ketQua: string; mau?: string; at?: number; y?: number}> =
  ({lenh, coChe, ketQua, at = 20, y = 1110}) => (
    <PopIn at={at} style={{position: 'absolute', left: 45, width: 990, top: y, padding: '14px 22px', borderRadius: 20,
      background: '#FFFFFF', border: '3px solid #CBD5E1', boxShadow: '0 10px 24px rgba(15,23,42,0.22)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxSizing: 'border-box', zIndex: 14}}>
      <span style={{fontFamily: MONO, fontSize: 21, fontWeight: 800, color: '#0F172A', background: '#F1F5F9',
        border: '2px solid #94A3B8', padding: '7px 14px', borderRadius: 10, whiteSpace: 'nowrap'}}>{lenh}</span>
      <Icon name="ArrowRight" size={24} color="#475569" stroke={2.8} />
      <span style={{fontSize: 21, fontWeight: 800, color: '#1E293B', whiteSpace: 'nowrap'}}>{coChe}</span>
      <Icon name="ArrowRight" size={24} color="#475569" stroke={2.8} />
      <span style={{fontSize: 21, fontWeight: 800, color: '#FFFFFF', background: '#0F172A', padding: '8px 16px',
        borderRadius: 10, whiteSpace: 'nowrap'}}>{ketQua}</span>
    </PopIn>
  );

export const HangSoTayLab: React.FC<{ma: string; code: string; moTa: string; kq: string; icon: string; at: number}> =
  ({ma, code, moTa, kq, icon, at}) => (
    <PopIn at={at} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '18px 22px', borderRadius: 20, background: '#FFFFFF', border: '2.5px solid #CBD5E1',
      boxShadow: '0 8px 20px rgba(15,23,42,0.18)', boxSizing: 'border-box'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
        <div style={{width: 52, height: 52, borderRadius: 14, background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
          <Icon name={icon} size={28} color="#38BDF8" stroke={2.6} />
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
            <span style={{fontFamily: MONO, fontSize: 17, fontWeight: 800, color: '#475569', background: '#F1F5F9',
              padding: '2px 10px', borderRadius: 8, whiteSpace: 'nowrap'}}>{ma}</span>
            <span style={{fontFamily: MONO, fontSize: 22, fontWeight: 800, color: '#0F172A', background: '#F8FAFC',
              padding: '3px 12px', borderRadius: 8, border: '1.5px solid #94A3B8', whiteSpace: 'nowrap'}}>{code}</span>
          </div>
          <span style={{fontSize: 21, fontWeight: 700, color: '#334155', whiteSpace: 'nowrap'}}>{moTa}</span>
        </div>
      </div>
      <span style={{fontSize: 21, fontWeight: 800, padding: '10px 16px', borderRadius: 12,
        background: '#0F172A', color: '#FDE047', whiteSpace: 'nowrap', flexShrink: 0}}>{kq}</span>
    </PopIn>
  );

/* ------------------------------------------------------------------ Sân thử Top-Down (cho Gói 6 Tay xoay) & Sân Góc Nhìn Ngang (cho Gói 2 Tay kẹp) */
const SanThu: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{fontFamily: FONT}}>
    <Img src={staticFile('nen-doc/mua-1.png')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    <div style={{position: 'absolute', left: 65, top: 340, width: 950, height: 760, borderRadius: 28,
      background: 'rgba(255,255,255,0.42)',
      backgroundImage: 'linear-gradient(rgba(30,27,75,.08) 2px, transparent 2px), linear-gradient(90deg, rgba(30,27,75,.08) 2px, transparent 2px)',
      backgroundSize: '155px 155px'}} />
    {children}
  </AbsoluteFill>
);

/**
 * Khung GÓC NHÌN NGANG (Side-View Cross-Section):
 * Mặt sàn kho ở y = 880, có 2 đường chuẩn độ cao: TRÊN CAO (arm_up) và SÁT SÀN (arm_down).
 */
const SanNgang: React.FC<{children: React.ReactNode; dangCao: boolean}> = ({children, dangCao}) => (
  <AbsoluteFill style={{fontFamily: FONT}}>
    <Img src={staticFile('nen-doc/mua-1.png')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    <AbsoluteFill style={{background: 'rgba(15, 23, 42, 0.35)'}} />

    <div style={{position: 'absolute', left: 55, top: 348, width: 970, height: 712, borderRadius: 32,
      background: 'linear-gradient(180deg, #FFFFFF 0%, #F1EFFB 78%, #E3DFF5 100%)',
      border: '5px solid #2E2A5A', boxShadow: '0 20px 50px rgba(15,23,42,0.35)', overflow: 'hidden'}}>

      {/* Thanh tiêu đề GÓC NHÌN NGANG + trạng thái độ cao tay kẹp */}
      <div style={{position: 'absolute', left: 22, right: 22, top: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 6}}>
        <div style={{display: 'inline-flex', alignItems: 'center', gap: 10, whiteSpace: 'nowrap',
          padding: '8px 18px', borderRadius: 14, background: '#2E2A5A', color: '#F8FAFC', fontSize: 21, fontWeight: 800}}>
          <Icon name="Eye" size={22} color="#22D3EE" stroke={2.6} />
          <span>GÓC NHÌN NGANG</span>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
          <span style={{padding: '7px 16px', borderRadius: 10, whiteSpace: 'nowrap',
            background: dangCao ? '#0284C7' : '#E2E8F0', color: dangCao ? '#FFFFFF' : '#64748B',
            fontSize: 20, fontWeight: 900, border: `2px solid ${dangCao ? '#0369A1' : '#CBD5E1'}`}}>
            TRÊN CAO · arm_up()
          </span>
          <span style={{padding: '7px 16px', borderRadius: 10, whiteSpace: 'nowrap',
            background: !dangCao ? '#FF8A35' : '#E2E8F0', color: !dangCao ? '#1E1B4B' : '#64748B',
            fontSize: 20, fontWeight: 900, border: `2px solid ${!dangCao ? '#C2410C' : '#CBD5E1'}`}}>
            SÁT SÀN · arm_down()
          </span>
        </div>
      </div>

      {/* Đường chuẩn TẦNG CAO (arm_up) và SÁT SÀN (arm_down) */}
      <div style={{position: 'absolute', left: 30, right: 30, top: 212, borderTop: `3px dashed ${dangCao ? '#0284C7' : '#CBD5E1'}`, zIndex: 2}} />
      <div style={{position: 'absolute', left: 30, right: 30, top: 447, borderTop: `3px dashed ${!dangCao ? '#FF8A35' : '#CBD5E1'}`, zIndex: 2}} />

      {/* Mặt sàn kho cắt dọc ở đáy khung (top: 532..712 trong khung = y: 880..1060 màn hình) */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 532, height: 180,
        background: 'repeating-linear-gradient(-45deg, #3B4266 0 18px, #2E2A5A 18px 36px)',
        borderTop: '8px solid #2E2A5A', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <span style={{padding: '8px 28px', borderRadius: 12, background: '#1E1B4B', color: '#E0FBFF',
          fontSize: 24, fontWeight: 900, letterSpacing: '0.08em', border: '2px solid #5A6290'}}>
          MẶT SÀN KHO
        </span>
      </div>
    </div>

    {children}
  </AbsoluteFill>
);

/**
 * Thùng hàng vector chuẩn của game (bo góc trắng-tím nhạt, đai xanh #38BDF8 ở giữa, viền chàm #2E2A5A).
 * Khi `mop = true` (rơi từ trên cao): thùng bị móp méo, nghiêng lệch và có vết nứt đỏ.
 */
const ThungNgang: React.FC<{x: number; y: number; size?: number; mop?: boolean}> = ({x, y, size = 136, mop = false}) => (
  <div style={{position: 'absolute', left: x, top: y, width: size, height: size, pointerEvents: 'none', zIndex: 9,
    transform: mop ? 'translateY(10px) rotate(11deg) scaleX(1.12) scaleY(0.84)' : 'none', transformOrigin: '50% 100%'}}>
    <Img src={staticFile('robot/thung-go.png')} style={{width: '100%', height: '100%', display: 'block'}} />
    {mop ? (
      <svg width={size} height={size} viewBox="0 0 100 100" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        {/* Vết nứt vỡ đỏ trên thùng khi rơi từ trên cao */}
        <path d="M 28 18 L 45 42 L 34 56 L 58 82 M 72 24 L 54 48 L 68 66" fill="none" stroke="#EF4444" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="82" cy="18" r="18" fill="#EF4444" stroke="#FFFFFF" strokeWidth="4" />
        <path d="M 74 10 L 90 26 M 90 10 L 74 26" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
      </svg>
    ) : null}
  </div>
);

/**
 * Vẽ R1 + Tay kẹp ở GÓC NHÌN NGANG 90° bằng code SVG theo đúng cấu hình chốt:
 * 1. Thân (Option 3): Vỏ vuông bo góc lớn (`#FFFFFF -> #EDE9FE -> #D8D0F2`), 1 đường vòm tím nhạt `#C4BBEA` từ lưng chạy tới mép kính,
 *    ăng-ten nghiêng 45° ở góc lưng sau, dải kính xanh dương ôm mặt trước chỉ lộ 1 MẮT viên thuốc sáng `#E0FBFF`.
 * 2. Chân (Mẫu B - 4 bánh tròn): Cổ đế có dải đèn cyan + dầm gầm ngang viền cyan + DÃY 4 BÁNH TRÒN đồng cỡ có khía gai xoay theo `lan` và tâm đèn cyan.
 * 3. Tay gắp (Rãnh trượt nâng hạ của Mẫu B + Tay kẹp ngàm ngang của Mẫu A):
 *    - Thanh trượt dọc trước mũi + khối trượt trắng + khớp tròn bạc có đèn báo tư thế (cyan khi `arm_up`, cam khi `arm_down`).
 *    - Ngàm kẹp Mẫu A gồm ngàm sau/dưới (vẽ ở lớp dưới thùng `zIndex: 8`) và ngàm ngang chính chạy ngang qua mặt bên thùng (vẽ ở lớp trên thùng `zIndex: 12`).
 */
const R1Ngang: React.FC<{
  x: number;
  uHa: number;       // 0 = TRÊN CAO (arm_up), 1 = SÁT SÀN (arm_down)
  dong: boolean;     // true = grab() khép gọng ôm hông thùng, false = release() mở gọng
  lan?: number;      // pha lăn của 4 bánh xe tròn
  mat?: 'thuong' | 'ngac' | 'vui';
}> = ({x, uHa, dong, lan = 0, mat = 'thuong'}) => {
  const ySan = 880;
  // Tâm khớp nâng hạ trượt dọc từ y = 606 (TRÊN CAO) xuống y = 804 (SÁT SÀN)
  const yKhop = 606 + uHa * 198;
  const cxKhop = x + 158;
  const mauDenKhop = uHa > 0.5 ? '#FF8A35' : '#22D3EE';
  const gocBanh = lan * 45;
  // Khi mở gọng (dong = false), 2 ngàm ngang tách rộng ra theo phương ngang-xiên (không chọc xuống sàn)
  const doTach = dong ? 0 : 14;
  const clipId = `r1-shell-clip-${Math.round(x)}`;

  return (
    <>
      {/* LỚP DƯỚI THÙNG HÀNG (zIndex: 8): Ngàm kẹp phía xa của Mẫu A (nằm phía sau thùng theo phối cảnh) */}
      <svg width="1080" height="1920" viewBox="0 0 1080 1920"
        style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none', zIndex: 8, overflow: 'visible'}}>
        <path
          d={`M ${cxKhop + 4} ${yKhop + 8} L ${cxKhop + 36} ${yKhop + 48 + doTach} L ${cxKhop + 134} ${yKhop + 42 + doTach} A 8 8 0 0 0 ${cxKhop + 134} ${yKhop + 26 + doTach} L ${cxKhop + 46} ${yKhop + 32 + doTach} L ${cxKhop + 20} ${yKhop + 2} Z`}
          fill="#94A3B8" stroke="#2E2A5A" strokeWidth={8} strokeLinejoin="round" />
      </svg>

      {/* LỚP TRÊN THÙNG HÀNG (zIndex: 12): Thân R1, 4 bánh xe tròn, rãnh nâng hạ Mẫu B và ngàm ngang chính Mẫu A ôm trước mặt bên thùng */}
      <svg width="1080" height="1920" viewBox="0 0 1080 1920"
        style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none', zIndex: 12, overflow: 'visible'}}>
        <defs>
          <linearGradient id="r1VoNgangGrad" x1="65%" y1="10%" x2="15%" y2="95%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="62%" stopColor="#F5F3FF" />
            <stop offset="100%" stopColor="#D8D0F2" />
          </linearGradient>
          <linearGradient id="r1KinhNgangGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>
          <linearGradient id="r1KhopBacGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F1F5F9" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>
          <clipPath id={clipId}>
            <rect x={x - 112} y={578} width={220} height={214} rx={66} />
          </clipPath>
        </defs>

        {/* 1. Ăng-ten nghiêng 45° ở góc lưng trên-trái (Option 3) */}
        <line x1={x - 92} y1={604} x2={x - 142} y2={554} stroke="#2E2A5A" strokeWidth={18} strokeLinecap="round" />
        <line x1={x - 92} y1={604} x2={x - 142} y2={554} stroke="#94A3B8" strokeWidth={8} strokeLinecap="round" />
        {/* Đế ăng-ten bo tròn ôm góc vỏ */}
        <path d={`M ${x - 108} ${622} C ${x - 116} ${608}, ${x - 96} ${588}, ${x - 82} ${596} Z`}
          fill="#64748B" stroke="#2E2A5A" strokeWidth={8} strokeLinejoin="round" />
        {/* Quả cầu cyan đầu ăng-ten */}
        <circle cx={x - 150} cy={546} r={22} fill="#38BDF8" stroke="#2E2A5A" strokeWidth={9} />
        <circle cx={x - 156} cy={540} r={7} fill="#BAE6FD" />

        {/* 2. Cổ đế + Dầm gầm ngang có dải đèn cyan (Mẫu B) */}
        <rect x={x - 62} y={786} width={116} height={18} rx={8} fill="#22D3EE" stroke="#2E2A5A" strokeWidth={7} />
        <rect x={x - 98} y={802} width={188} height={38} rx={12} fill="#3B4266" stroke="#2E2A5A" strokeWidth={8} />
        <rect x={x - 88} y={807} width={168} height={7} rx={3.5} fill="#22D3EE" />

        {/* 3. Vỏ thân R1 vuông bo góc lớn (Option 3) */}
        <rect x={x - 112} y={578} width={220} height={214} rx={66} fill="url(#r1VoNgangGrad)" stroke="#2E2A5A" strokeWidth={10} />

        <g clipPath={`url(#${clipId})`}>
          {/* Dải bóng tím nhạt dọc lưng và đáy vỏ */}
          <path d={`M ${x - 112} ${578} L ${x - 86} ${578} L ${x - 86} ${764} L ${x + 108} ${764} L ${x + 108} ${792} L ${x - 112} ${792} Z`}
            fill="#C4BBEA" opacity={0.45} />

          {/* 1 đường hoa văn vòm tím nhạt (#C4BBEA) chạy ngang từ lưng tới mép kính */}
          <path d={`M ${x - 112} ${656} C ${x - 64} ${618}, ${x - 4} ${618}, ${x + 36} ${636}`}
            fill="none" stroke="#C4BBEA" strokeWidth={7} strokeLinecap="round" />

          {/* Vệt bóng trắng góc trên lưng */}
          <path d={`M ${x - 74} ${616} C ${x - 52} ${598}, ${x - 18} ${596}, ${x + 14} ${598}`}
            fill="none" stroke="#FFFFFF" strokeWidth={14} strokeLinecap="round" />

          {/* Kính mặt trước xanh dương ôm sát mép phải của thân */}
          <path d={`M ${x + 48} ${576} C ${x + 12} ${624}, ${x + 16} ${716}, ${x + 74} ${724} L ${x + 116} ${724} L ${x + 116} ${576} Z`}
            fill="url(#r1KinhNgangGrad)" stroke="#2E2A5A" strokeWidth={10} strokeLinejoin="round" />

          {/* Vệt phản quang trên đỉnh kính */}
          <ellipse cx={x + 68} cy={608} rx={16} ry={7} transform={`rotate(28 ${x + 68} ${608})`} fill="#7DD3FC" opacity={0.65} />

          {/* Duy nhất 1 MẮT nhìn ngang ở mặt kính trước */}
          {mat === 'vui' ? (
            <path d={`M ${x + 64} ${664} A 13 13 0 0 1 ${x + 90} ${664}`}
              fill="none" stroke="#E0FBFF" strokeWidth={9} strokeLinecap="round" />
          ) : mat === 'ngac' ? (
            <g>
              <ellipse cx={x + 77} cy={658} rx={13} ry={18} fill="#E0FBFF" stroke="#38BDF8" strokeWidth={3} />
              <circle cx={x + 80} cy={658} r={6} fill="#1D4ED8" />
            </g>
          ) : (
            <rect x={x + 67} y={636} width={20} height={44} rx={10}
              fill="#E0FBFF" stroke="#38BDF8" strokeWidth={3.5} />
          )}
        </g>

        {/* Viền ngoài vỏ thân đè lên clipPath để nét viền sắc nét */}
        <rect x={x - 112} y={578} width={220} height={214} rx={66} fill="none" stroke="#2E2A5A" strokeWidth={10} />

        {/* 4. Dãy 4 bánh xe tròn đồng cỡ dưới gầm (kiểu Mẫu B nhưng đủ 4 bánh) */}
        {[-84, -28, 28, 84].map((dx, i) => {
          const cxB = x - 4 + dx;
          const cyB = ySan - 28;
          return (
            <g key={i} transform={`translate(${cxB}, ${cyB})`}>
              {/* Lốp tròn chàm đậm */}
              <circle cx={0} cy={0} r={26} fill="#3B4266" stroke="#2E2A5A" strokeWidth={7} />
              {/* 8 vạch gai bánh xoay theo pha lăn */}
              <g transform={`rotate(${gocBanh})`}>
                {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                  <line key={deg} x1={0} y1={-24} x2={0} y2={-17}
                    stroke="#1E1B4B" strokeWidth={4.5} strokeLinecap="round"
                    transform={`rotate(${deg})`} />
                ))}
              </g>
              {/* Vành trong + Tâm đèn cyan */}
              <circle cx={0} cy={0} r={13} fill="#252A4A" stroke="#5A6290" strokeWidth={2.5} />
              <circle cx={0} cy={0} r={5.5} fill="#22D3EE" />
            </g>
          );
        })}

        {/* 5. Thanh trượt dọc nâng/hạ trước mũi (Mẫu B) */}
        <rect x={x + 106} y={562} width={16} height={262} rx={8} fill="#334155" stroke="#2E2A5A" strokeWidth={7} />

        {/* Khối trượt trắng chạy dọc trên thanh trượt theo `uHa` */}
        <rect x={x + 92} y={yKhop - 28} width={54} height={56} rx={12} fill="#FFFFFF" stroke="#2E2A5A" strokeWidth={8} />
        <rect x={x + 97} y={yKhop + 8} width={44} height={15} rx={6} fill="#D8D0F2" />

        {/* 6. Ngàm kẹp ngang chính (Mẫu A) vươn ngang qua mặt bên thùng hàng */}
        <path
          d={`M ${cxKhop + 14} ${yKhop - 11 - doTach * 0.6} L ${cxKhop + 136} ${yKhop - 11 - doTach * 0.6} A 11 11 0 0 1 ${cxKhop + 136} ${yKhop + 11 - doTach * 0.6} L ${cxKhop + 14} ${yKhop + 11 - doTach * 0.6} Z`}
          fill="url(#r1KhopBacGrad)" stroke="#2E2A5A" strokeWidth={8} strokeLinejoin="round" />
        <line x1={cxKhop + 28} y1={yKhop - 4 - doTach * 0.6} x2={cxKhop + 128} y2={yKhop - 4 - doTach * 0.6} stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" />

        {/* 7. Khớp tròn bạc + Đèn báo tư thế (cyan = arm_up, cam = arm_down) */}
        <circle cx={cxKhop} cy={yKhop} r={27} fill="url(#r1KhopBacGrad)" stroke="#2E2A5A" strokeWidth={8} />
        <circle cx={cxKhop} cy={yKhop} r={12} fill={mauDenKhop} stroke="#2E2A5A" strokeWidth={5} />
        <circle cx={cxKhop - 4} cy={yKhop - 4} r={3.5} fill="#FFFFFF" />
      </svg>
    </>
  );
};

const NutChay: React.FC<{bam: number[]; y?: number}> = ({bam, y = 115}) => {
  const f = useCurrentFrame();
  const lun = bam.some((b) => f >= b && f < b + 6);
  return (
    <div style={{position: 'absolute', left: 730, top: y, display: 'flex', alignItems: 'center', gap: 12, padding: '16px 32px', borderRadius: 20, fontSize: 36, fontWeight: 800,
      fontFamily: FONT, color: '#fff', background: lun ? C.solaDeep : C.sola, transform: `scale(${lun ? 0.9 : 1})`, boxShadow: '0 10px 24px rgba(2,132,199,.35)'}}>
      <Icon name="Play" size={32} color="#fff" />Chạy
    </div>
  );
};

const dongSang = (f: number, moc: [number, number][]) => moc.filter(([t]) => f >= t).pop()?.[1] ?? -1;

/* Mở đầu Gói 2: R1 lao tới chỗ các thùng, va phải làm các thùng bắn ra xa -> Chú Tư bảo phải cầm lên đặt đúng vị trí */
const R_KEP_VAN_DE: Moc[] = [
  [0, 1, 5, -90],
  [22, 1, 3.5, -90],
  [34, 1, 3.5, 0],
  [54, 2, 3.5, 0],
  [66, 2, 3.5, -90],
  [92, 2, 2.35, -90],
  [115, 2, 2.55, -90],
];

export const CanhTayKepVanDe: React.FC = () => {
  const f = useCurrentFrame();
  const rot = (k: number) => (g: number) => ease(g, [92, 122], [0, k]);
  return (
    <Shake hits={[94]} amp={18}>
      <NenHienTruong anh="nen-doc/mua-1.png">
        <ODat ten="o-dich" c={4} r={3} />
        <ODat ten="o-dich" c={4} r={4} />
        <Vat moc={[[0, 2, 2], [92, 2, 2], [122, 0.2, 0.4]]} nghieng={rot(-140)} />
        <Vat moc={[[0, 2, 1], [92, 2, 1], [122, 3.8, 0.3]]} nghieng={rot(155)} />
        <Vat moc={[[0, 1.2, 1.6], [92, 1.2, 1.6], [122, 0.15, 2.8]]} nghieng={rot(-190)} />
        <Vat moc={[[0, 2.8, 1.6], [92, 2.8, 1.6], [122, 3.85, 2.1]]} nghieng={rot(135)} />
        <Xe anh="r1" moc={R_KEP_VAN_DE} doi={[[94, 'r1-ngac']]} />
        <ChuNay chu="RẦM! VĂNG HẾT THÙNG!" at={94} den={165} x={540} y={400} co={64} />
        <DongHo tu={13 * 60 + 20} />
        <NhanGoi so={2} ten="Tay kẹp" />
        <Mascot who="sola" x={240} h={540} at={0} faces={[[0, 'confident'], [94, 'shocked']]}
          says={[{at: 8, out: 84, text: 'R1 biết lái rồi, lao tới đống thùng luôn!'}]} bubbleW={520} bubbleTop={1240} />
        {f >= 100 ? (
          <Nguoi anh="tu-hoang" ten="CHÚ TƯ" mau="#EA580C" x={820} h={600} at={100} side="left" bubbleW={560} bubbleTop={1230}
            says={[{at: 108, out: 270, text: 'Ấy chết, đâm thế bắn hết thùng ra xa rồi! Phải cầm lên mang ra đặt đúng vị trí chứ!'}]} />
        ) : null}
      </NenHienTruong>
    </Shake>
  );
};

export const CanhTayKepLunaChePart: React.FC = () => (
  <TrongXe anh="kep" cach={125} tenPart="Tay kẹp"
    sola={[{at: 8, out: 74, text: 'R1 mới có bánh xe để chạy chứ chưa có tay cầm thùng!'}]}
    luna={[{at: 80, out: 200, text: 'Để tớ lắp thêm Tay kẹp cho R1 cầm thùng đặt vào ô đích nhé!'}]}
    solaMat={[[0, 'thinking'], [125, 'excited']]}
    lunaMat={[[0, 'confident'], [125, 'happy']]} />
);

/* 1 · GÓC NHÌN NGANG: Tay đang ở TRÊN CAO mà bấm grab() -> kẹp hụt giữa không trung! Phải arm_down() trước (280f) */
const CanhChuaHaTay: React.FC = () => {
  const f = useCurrentFrame();
  const khepHut = f >= 46 && f < 138;
  const uHa = ease(f, [166, 196], [0, 1]);
  const daGap = f >= 210;
  const dong = khepHut || daGap;
  const sang = f < 142
    ? dongSang(f, [[28, 0], [46, 1], [82, -1]])
    : dongSang(f, [[160, 0], [175, 1], [202, 2], [216, 3], [250, -1]]);

  return (
    <Shake hits={[50]} amp={10}>
      <SanNgang dangCao={uHa < 0.5}>
        <ThungNgang x={320 + 178} y={880 - 136} />
        <R1Ngang x={320} uHa={uHa} dong={dong} mat={khepHut ? 'ngac' : daGap ? 'vui' : 'thuong'} />

        {uHa < 0.2 ? (
          <div style={{position: 'absolute', left: 635, top: 555, height: 145, borderLeft: '5px dashed #EF4444',
            display: 'flex', alignItems: 'center', paddingLeft: 18, zIndex: 15}}>
            <span style={{padding: '10px 20px', borderRadius: 14, background: khepHut ? '#EF4444' : '#FEF2F2',
              color: khepHut ? '#FFFFFF' : '#B91C1C', fontSize: 27, fontWeight: 900,
              border: '3px solid #EF4444', whiteSpace: 'nowrap'}}>
              {khepHut ? 'KẸP HỤT TRÊN KHÔNG!' : 'Đang ở trên cao!'}
            </span>
          </div>
        ) : null}

        {daGap ? (
          <div style={{position: 'absolute', left: 660, top: 760, padding: '10px 22px', borderRadius: 14,
            background: '#16A34A', color: '#FFFFFF', fontSize: 28, fontWeight: 900,
            border: '3px solid #1E1B4B', zIndex: 15}}>
            KẸP TRÚNG THÙNG!
          </div>
        ) : null}

        <Burst at={212} x={566} y={795} color={C.yellow} />
        <CodeBox
          lines={f < 142 ? ['grab()', 'wait()'] : ['arm_down()', 'wait()', 'grab()', 'wait()']}
          x={70} y={40} w={620} size={34} title="mat_lenh.py" hl={sang < 0 ? undefined : sang} />
        <NutChay bam={[24, 156]} y={120} />

        <Mascot who="sola" x={230} h={520} at={0}
          faces={[[0, 'confident'], [50, 'shocked'], [144, 'happy'], [212, 'cheer']]} bubbleTop={1240} bubbleW={520}
          says={[
            {at: 52, out: 100, text: 'Ơ! Sao gọng kẹp khép lại mà toàn kẹp trúng không khí vậy?'},
            {at: 146, out: 204, text: 'À! Tay đang ở trên cao, phải gọi arm_down() hạ sát sàn trước!'},
          ]} />
        <Mascot who="luna" x={850} h={520} at={96} side="left" bubbleTop={1240} bubbleW={520} lat
          faces={[[96, 'thinking'], [212, 'great-job']]}
          says={[
            {at: 100, out: 144, text: 'Nhìn góc ngang kìa! Tay kẹp đang ở trên cao, làm sao chạm tới thùng dưới sàn?'},
            {at: 216, out: 274, text: 'Chuẩn! Hạ sát sàn rồi mới khép gọng kẹp!'},
          ]} />
      </SanNgang>
    </Shake>
  );
};

/* 2 · GÓC NHÌN NGANG: Tay đang ở DƯỚI THẤP mà chạy -> cạ sàn kẹt cứng! Phải arm_up() nâng lên cao mới đi được (290f) */
const CanhHaTayKhongDiDuoc: React.FC = () => {
  const f = useCurrentFrame();
  const dangKet = f >= 38 && f < 105;
  const uNang = ease(f, [162, 192], [0, 1]);
  const uHa = 1 - uNang;
  const uDi = mo(f, 205, 258);
  const rungX = dangKet ? Math.sin(f * 2.1) * 10 : 0;
  const xR1 = 270 + uDi * 250 + rungX;
  const yThung = 880 - 136 - uNang * 200;
  const lan = dangKet ? Math.sin(f * 1.6) * 0.4 : uDi * 4;

  const sang = f < 140
    ? dongSang(f, [[24, 0], [34, 1], [44, 2], [85, -1]])
    : dongSang(f, [[152, 0], [166, 1], [198, 2], [210, 3], [260, -1]]);

  return (
    <Shake hits={[44, 68]} amp={12}>
      <SanNgang dangCao={uHa < 0.5}>
        <div style={{position: 'absolute', left: 675, top: 862, width: 210, height: 22, borderRadius: 8,
          background: '#FACC15', border: '4px solid #2E2A5A', zIndex: 7}} />
        <div style={{position: 'absolute', left: 715, top: 814, padding: '4px 14px', borderRadius: 10,
          background: '#FACC15', color: '#1E1B4B', fontSize: 20, fontWeight: 900, border: '2.5px solid #2E2A5A', zIndex: 7}}>
          VỊ TRÍ ĐẶT
        </div>

        <ThungNgang x={xR1 + 178} y={yThung} />
        <R1Ngang x={xR1} uHa={uHa} dong lan={lan} mat={dangKet ? 'ngac' : uDi > 0.8 ? 'vui' : 'thuong'} />

        {dangKet ? (
          <div style={{position: 'absolute', left: xR1 + 150, top: 640, padding: '10px 24px', borderRadius: 14,
            background: '#EF4444', color: '#FFFFFF', fontSize: 28, fontWeight: 900,
            border: '4px solid #FFFFFF', boxShadow: '0 8px 24px rgba(239,68,68,0.5)', zIndex: 16}}>
            CẠ SÁT SÀN · KẸT CỨNG!
          </div>
        ) : null}

        {uNang > 0.85 && uDi < 0.95 ? (
          <div style={{position: 'absolute', left: xR1 + 150, top: 720, padding: '8px 20px', borderRadius: 14,
            background: '#DCFCE7', color: '#166534', fontSize: 25, fontWeight: 900,
            border: '3px solid #16A34A', zIndex: 15}}>
            Gầm thoáng · Chạy êm!
          </div>
        ) : null}

        <Burst at={256} x={770} y={620} color={C.yellow} />
        <CodeBox
          lines={f < 140
            ? ['left_move()', 'right_move()', 'wait()']
            : ['arm_up()', 'wait()', 'left_move(); right_move()', 'wait()']}
          x={70} y={40} w={620} size={32} title="mat_lenh.py" hl={sang < 0 ? undefined : sang} />
        <NutChay bam={[20, 148]} y={125} />

        <Mascot who="sola" x={230} h={520} at={0}
          faces={[[0, 'confident'], [44, 'shocked'], [142, 'happy'], [255, 'cheer']]} bubbleTop={1240} bubbleW={520}
          says={[
            {at: 48, out: 96, text: 'Ủa, sao bánh xe quay mà R1 bị kẹt cứng tại chỗ vậy?'},
            {at: 144, out: 204, text: 'À! Để thấp bị cạ sàn, phải arm_up() nâng lên cao rồi mới chạy!'},
          ]} />
        <Mascot who="luna" x={850} h={520} at={94} side="left" bubbleTop={1240} bubbleW={520} lat
          faces={[[94, 'thinking'], [210, 'great-job']]}
          says={[
            {at: 98, out: 142, text: 'Nhìn dưới đáy gọng kẹp và thùng kìa, để sát sàn thế kia thì tỳ vào đâu?'},
            {at: 215, out: 282, text: 'Nhấc bổng lên cao là lăn bon bon tới đích ngay!'},
          ]} />
      </SanNgang>
    </Shake>
  );
};

/* 3 · GÓC NHÌN NGANG: Tới đích mà chưa arm_down() đã gọi release() -> thùng rơi từ trên cao xuống móp/vỡ hỏng! Phải arm_down() trước (285f) */
const CanhThaTuTrenCao: React.FC = () => {
  const f = useCurrentFrame();
  // Lần 1 (0..138): Tay đang ở TRÊN CAO (uHa = 0), gọi release() ở f = 42 -> thùng rơi tự do từ y = 508 xuống y = 728 (f = 42..58) và bị móp hỏng!
  // Lần 2 (140..285): Gọi arm_down() ở f = 164..196 (uHa: 0 -> 1) hạ thùng chạm sàn êm ái, rồi mới release() ở f = 212!
  const lan2 = f >= 140;
  const uRoi = !lan2 ? ease(f, [42, 58], [0, 1]) : 0;
  const biMop = !lan2 && f >= 58;
  const uHa = lan2 ? ease(f, [164, 196], [0, 1]) : 0;
  const daThaEm = lan2 && f >= 212;
  const dong = !lan2 ? f < 42 : !daThaEm;

  const yThung = !lan2
    ? 544 + uRoi * 200
    : 544 + uHa * 200;

  const sang = !lan2
    ? dongSang(f, [[26, 0], [42, 1], [82, -1]])
    : dongSang(f, [[156, 0], [170, 1], [200, 2], [214, 3], [250, -1]]);

  return (
    <Shake hits={[58]} amp={16}>
      <SanNgang dangCao={uHa < 0.5}>
        {/* Ô đích bên dưới thùng */}
        <div style={{position: 'absolute', left: 660, top: 862, width: 220, height: 22, borderRadius: 8,
          background: '#FACC15', border: '4px solid #2E2A5A', zIndex: 7}} />

        {/* Vệt rơi tự do khi thả từ trên cao */}
        {!lan2 && f >= 42 && f < 135 ? (
          <div style={{position: 'absolute', left: 765, top: 580, height: 160, borderLeft: '6px dashed #EF4444', zIndex: 8}} />
        ) : null}

        <ThungNgang x={520 + 178} y={yThung} mop={biMop} />
        <R1Ngang x={520} uHa={uHa} dong={dong} mat={biMop ? 'ngac' : daThaEm ? 'vui' : 'thuong'} />

        {biMop ? (
          <div style={{position: 'absolute', left: 390, top: 445, padding: '10px 24px', borderRadius: 16,
            background: '#EF4444', color: '#FFFFFF', fontSize: 28, fontWeight: 900, whiteSpace: 'nowrap',
            border: '4px solid #FFFFFF', boxShadow: '0 10px 26px rgba(239,68,68,0.5)', zIndex: 16}}>
            XOẢNG! RƠI MÓP THÙNG HÀNG!
          </div>
        ) : null}

        {daThaEm ? (
          <div style={{position: 'absolute', left: 390, top: 445, padding: '10px 24px', borderRadius: 16,
            background: '#16A34A', color: '#FFFFFF', fontSize: 28, fontWeight: 900, whiteSpace: 'nowrap',
            border: '4px solid #FFFFFF', boxShadow: '0 10px 26px rgba(22,163,74,0.45)', zIndex: 16}}>
            ĐẶT ÊM · THÙNG NGUYÊN VẸN!
          </div>
        ) : null}

        <Burst at={214} x={765} y={795} color={C.yellow} />
        <CodeBox
          lines={!lan2
            ? ['release()', 'wait()']
            : ['arm_down()', 'wait()', 'release()', 'wait()']}
          x={70} y={40} w={620} size={34} title="mat_lenh.py" hl={sang < 0 ? undefined : sang} />
        <NutChay bam={[22, 152]} y={120} />

        <Mascot who="sola" x={230} h={520} at={0}
          faces={[[0, 'confident'], [58, 'shocked'], [142, 'happy'], [214, 'cheer']]} bubbleTop={1240} bubbleW={520}
          says={[
            {at: 60, out: 104, text: 'Á! Đang ở trên cao mà thả luôn làm thùng rơi móp hỏng mất rồi!'},
            {at: 144, out: 204, text: 'Phải gọi arm_down() hạ thùng chạm sàn rồi mới mở gọng release()!'},
          ]} />
        <Mascot who="luna" x={850} h={520} at={98} side="left" bubbleTop={1240} bubbleW={520} lat
          faces={[[98, 'thinking'], [214, 'great-job']]}
          says={[
            {at: 102, out: 142, text: 'Tay đang treo cao thế kia mà buông ra thì thùng rơi tự do đấy!'},
            {at: 216, out: 278, text: 'Đúng rồi! Hạ sát sàn trước khi gắp và cả trước khi thả nhé!'},
          ]} />
      </SanNgang>
    </Shake>
  );
};

/* 4 · Tổng kết đúng 4 lệnh của Part Tay kẹp (không lộ arm_left/arm_right của Gói 6) (235f) */
const LENH_KEP = [
  {ma: 'arm_down()', viec: 'hạ tay sát sàn (trước khi gắp / thả)'},
  {ma: 'grab()', viec: 'khép gọng kẹp chặt thùng'},
  {ma: 'arm_up()', viec: 'nâng tay lên cao (trước khi chạy)'},
  {ma: 'release()', viec: 'mở gọng đặt thùng xuống'},
];

const CanhLenhTayKep: React.FC = () => (
  <Stage>
    <Headline text="Bốn lệnh của Tay kẹp" at={4} accent={['Tay kẹp']} size={66} top={90} />
    <PopIn at={14} style={{position: 'absolute', left: 65, top: 225, width: 950}}>
      <div style={{display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 22px', borderRadius: 999,
        background: C.solaDeep, color: '#fff', fontSize: 24, fontWeight: 900, letterSpacing: '0.04em'}}>
        <Icon name="Wrench" size={26} color="#FDE047" stroke={2.6} />
        <span>PART TAY KẸP · 4 LỆNH</span>
      </div>
    </PopIn>
    {LENH_KEP.map((l, i) => (
      <PopIn key={l.ma} at={22 + i * 12} style={{position: 'absolute', left: 65, top: 290 + i * 155, width: 950}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, background: '#fff', borderRadius: 24, padding: '20px 30px',
          border: `3px solid ${C.rule}`, boxShadow: '0 16px 40px rgba(34,26,102,.12)'}}>
          <span style={{fontFamily: 'JetBrains Mono, Consolas, monospace', fontSize: 34, fontWeight: 700, color: '#F4F3FF', background: C.codeBg, borderRadius: 14,
            padding: '8px 20px', whiteSpace: 'nowrap'}}>{l.ma}</span>
          <span style={{fontSize: 30, fontWeight: 800, color: C.ink, whiteSpace: 'nowrap'}}>{l.viec}</span>
        </div>
      </PopIn>
    ))}
    <Mascot who="sola" x={260} h={540} at={74} faces={[[74, 'thumbs-up']]}
      says={[{at: 90, out: 225, text: 'Nhớ hạ sát sàn để gắp và thả, nâng lên cao trước khi chạy nhé!'}]} bubbleTop={1230} bubbleW={520} />
  </Stage>
);

/* ------------------------------------------------------------------ Cảnh thử Tay xoay riêng cho Gói 6 (M1G6-Mo) */
const CanhThuTayXoay: React.FC = () => {
  const f = useCurrentFrame();
  const gocXoay = f < 70 ? 0 : f < 155 ? -1 : 1;
  const anhXoay = gocXoay === -1 ? 'robot/lab/xoay-trai.png' : gocXoay === 1 ? 'robot/lab/xoay-phai.png' : 'robot/lab/xoay-truoc.png';
  const sang = dongSang(f, [[55, 0], [68, 1], [140, 2], [154, 3], [200, -1]]);

  return (
    <SanThu>
      <Img src={staticFile('robot/thung-go.png')} style={{position: 'absolute', left: 320 - 75, top: 640 - 75, width: 150, height: 150}} />
      <Img src={staticFile('robot/thung-go.png')} style={{position: 'absolute', left: 760 - 75, top: 640 - 75, width: 150, height: 150}} />
      <Img src={staticFile(anhXoay)} style={{position: 'absolute', left: 540 - 140, top: 640 - 140, width: 280, height: 280, transform: 'rotate(-90deg)'}} />
      <Burst at={160} x={540} y={640} color={C.yellow} />
      <CodeBox
        lines={['arm_left()', 'wait()', 'arm_right()', 'wait()']}
        x={70} y={50} w={620} size={34} title="mat_lenh.py" hl={sang < 0 ? undefined : sang} />
      <NutChay bam={[50, 136]} y={135} />
      <Mascot who="sola" x={230} h={520} at={0} faces={[[0, 'confident'], [160, 'cheer']]} bubbleTop={1240} bubbleW={520}
        says={[{at: 10, out: 120, text: 'Xe đứng yên, chỉ xoay cổ tay qua trái qua phải thôi!'}]} />
      <Mascot who="luna" x={850} h={520} at={120} side="left" bubbleTop={1240} bubbleW={520} lat
        faces={[[120, 'great-job']]}
        says={[{at: 125, out: 230, text: 'Nhớ nâng tay arm_up() trước khi xoay cổ tay nhé!'}]} />
      <ChuChot tu={165} y={960}>arm_left() · arm_right() → xoay cổ tay</ChuChot>
    </SanThu>
  );
};

export const CANH_LAB_TAY_KEP: Phim['canh'] = [
  {id: 'chua-ha-tay', dur: 280, el: <CanhChuaHaTay />, sfx: [[24, 'click.wav', 0.8], [50, 'wrong.wav', 0.6], [156, 'click.wav', 0.8], [212, 'ding.wav', 0.7]]},
  {id: 'ha-tay-khong-di', dur: 290, el: <CanhHaTayKhongDiDuoc />, sfx: [[20, 'click.wav', 0.8], [44, 'wrong.wav', 0.6], [148, 'click.wav', 0.8], [256, 'ding.wav', 0.7]]},
  {id: 'tha-tu-tren-cao', dur: 285, el: <CanhThaTuTrenCao />, sfx: [[22, 'click.wav', 0.8], [58, 'impact.wav', 0.85], [60, 'wrong.wav', 0.6], [152, 'click.wav', 0.8], [214, 'ding.wav', 0.7]]},
  {id: 'lenh-tay-kep', dur: 235, el: <CanhLenhTayKep />, sfx: [W_IN, ...pops([22, 34, 46, 58], 0.3)]},
];

export const CANH_LAB_TAY_XOAY: Phim['canh'] = [
  {id: 'thu-tay-xoay', dur: 240, el: <CanhThuTayXoay />, sfx: [[50, 'click.wav', 0.8], [136, 'click.wav', 0.8], [160, 'ding.wav', 0.6]]},
];

export const PHIM_TAY_KEP: Phim = {
  id: 'PhimTayKep',
  doc: true,
  canh: [
    {id: 'van-de-tay-kep', dur: 280, el: <CanhTayKepVanDe />, sfx: [[60, 'whoosh-soft.wav', 0.3], [94, 'impact.wav', 0.7]]},
    {id: 'luna-che-tay-kep', dur: 215, el: <CanhTayKepLunaChePart />, sfx: [[125, 'impact.wav', 0.5], [125, 'ding.wav', 0.4]]},
    ...CANH_LAB_TAY_KEP,
  ],
};
