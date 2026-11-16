// Helper dùng chung cho các phim gói mùa sau: khung Lab trắng (KhungLabLuna/CongThucLab/HangSoTayLab)
// và sân Góc Nhìn Ngang (SanNgang/ThungNgang/R1Ngang) cho cơ chế nâng/hạ của Tay kẹp — xem doc/m1.tsx.
// (Phim gói 2 "Tay kẹp" / gói 6 "Tay xoay" thật nằm trong doc/m1.tsx; các cảnh Lab bản thảo cũ của
// hai gói này từng ở cuối file đã xoá vì không đăng ký ở index.ts.)
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, FONT, Headline, Icon, MONO, PopIn, Sub} from './d10';

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

/**
 * Khung GÓC NHÌN NGANG (Side-View Cross-Section):
 * Mặt sàn kho ở y = 880, có 2 đường chuẩn độ cao: TRÊN CAO (arm_up) và SÁT SÀN (arm_down).
 */
export const SanNgang: React.FC<{children: React.ReactNode; dangCao: boolean}> = ({children, dangCao}) => (
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
export const ThungNgang: React.FC<{x: number; y: number; size?: number; mop?: boolean}> = ({x, y, size = 136, mop = false}) => (
  <div style={{position: 'absolute', left: x, top: y, width: size, height: size, pointerEvents: 'none', zIndex: 9,
    transform: mop ? 'translateY(10px) rotate(11deg) scaleX(1.12) scaleY(0.84)' : 'none', transformOrigin: '50% 100%'}}>
    <Img src={staticFile('robot/m1/vat-thung-go.png')} style={{width: '100%', height: '100%', display: 'block'}} />
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
export const R1Ngang: React.FC<{
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

