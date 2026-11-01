// Phim 0 · Mở đầu game khổ dọc 1080×1920 (doc: true):
// Giới thiệu CLB Mật Lệnh Robot (cấp 3) nhận kèo giải cứu 8 điểm nóng toàn thị trấn,
// khám phá Xe Trạm Lab Di Động (xưởng độ robot + sa bàn giả lập),
// và hành trình xe trạm lăn bánh dọc bản đồ chiến dịch 8 mùa.
import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Burst, C, CLAMP, FONT, Headline, Icon, Mascot, MONO, PopIn, Sub, ease, pop} from './d10';
import {FPS, Phim, W_IN, pops} from './may-phim';
import {Nguoi} from './doc/kit-doc';

/** Cảnh 1 (6s = 180f): Tại phòng CLB (nen-doc/mua-7.png), Bảng Ủy Nhiệm từ Thầy Hiệu Trưởng gửi tới CLB Robot. */
const YEU_CAU_THI_TRAN = [
  {ma: 'QUEST #1', noi: 'Kho hàng Chú Tư', viec: 'Kẹt 10 đơn sát giờ xe tải chạy', mau: '#F59E0B', nen: '#FEF3C7', anh: 'tu-sot-ruot', bot: 'robot/m1/du-vui.png', xoay: -90, zoom: 1.48},
  {ma: 'QUEST #2', noi: 'Nhà máy Cô Hạnh', viec: 'Lò hơi quá áp, kẹt van tầng cao', mau: '#EF4444', nen: '#FEE2E2', anh: 'hanh-hoang', bot: 'robot/m2/du-vui.png', xoay: -90},
  {ma: 'QUEST #3', noi: 'Bãi tái chế Bác Sáu', viec: 'Núi sắt nhựa lẫn lộn chờ phân loại', mau: '#10B981', nen: '#D1FAE5', anh: 'sau-sot-ruot', bot: 'robot/m3/nhen-tu-vui.png', xoay: 0},
  {ma: 'QUEST #4', noi: 'Nông trại Chị Lan', viec: 'Cánh đồng hoa Tết chờ gieo hạt', mau: '#EC4899', nen: '#FCE7F3', anh: 'lan-sot-ruot', bot: 'robot/m5/drone-cam-vui.png', xoay: 0},
];

const CHIEN_DICH_TIEP = [
  {ten: 'Bến sông Bác Ba', anh: 'ba-hoang', mau: '#0284C7'},
  {ten: 'Mỏ đá Anh Dũng', anh: 'dung-hoang', mau: '#D97706'},
  {ten: 'Hang động Chú Phong', anh: 'phong-hoang', mau: '#0D9488'},
  {ten: 'Đại hội CLB Trường', anh: 'thay-tu-hao', mau: '#4F46E5'},
];

const CanhPhongClb: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#1E1B4B', fontFamily: FONT, overflow: 'hidden'}}>
      <Img src={staticFile('nen-doc/mua-7.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
        transform: `scale(${1.02 + 0.02 * Math.sin(f / 60)})`}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0.45) 45%, rgba(15,23,42,0.9) 100%)'}} />

      <Headline text="CLB ROBOT NHẬN KÈO GIẢI CỨU!" at={4} top={34} size={52} color="#FFFFFF" accent={['NHẬN KÈO']} />
      <Sub text="Độ robot · Code Python · Cân đẹp 8 điểm nóng khắp thị trấn" at={12} top={106} size={28} color="#FDE047" />

      {/* Bảng Ủy Nhiệm Chiến Dịch kiểu Game Quest Board khổ lớn (lấp đầy y = 162 .. 1190) */}
      <PopIn at={14} style={{position: 'absolute', left: 36, top: 162, width: 1008, padding: '22px 24px 24px',
        borderRadius: 34, border: `6px solid ${C.ink}`,
        background: 'linear-gradient(180deg, #FFFBEB 0%, #FEF3C7 100%)',
        boxShadow: `0 16px 0 ${C.ink}, 0 28px 48px rgba(0,0,0,0.5)`, boxSizing: 'border-box'}}>

        {/* Header Thầy Hiệu Trưởng cỡ lớn */}
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18,
          padding: '14px 20px', borderRadius: 24, background: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)',
          border: `4px solid ${C.ink}`, gap: 16}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 18, minWidth: 0, flex: 1}}>
            <div style={{width: 104, height: 104, borderRadius: 22, background: '#DBEAFE', border: '4px solid #FDE047', overflow: 'hidden', flexShrink: 0,
              boxShadow: '0 6px 0 #000'}}>
              <Img src={staticFile('nguoi/thay-giao-viec.png')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 12%'}} />
            </div>
            <div style={{minWidth: 0, flex: 1}}>
              <div style={{fontSize: 21, fontWeight: 900, color: '#38BDF8', letterSpacing: '0.04em', marginBottom: 4}}>
                LỆNH TRIỆU TẬP · THẦY HIỆU TRƯỞNG
              </div>
              <div style={{fontSize: 29, fontWeight: 900, color: '#FFFFFF', lineHeight: 1.25}}>
                “Đem công nghệ CLB mình ra giúp bà con ngay!”
              </div>
            </div>
          </div>
          <span style={{padding: '14px 22px', borderRadius: 18, background: 'linear-gradient(180deg, #FDE047 0%, #F59E0B 100%)',
            color: C.ink, fontSize: 25, fontWeight: 900, border: '3.5px solid #FFFFFF', whiteSpace: 'nowrap', flexShrink: 0,
            boxShadow: '0 5px 0 rgba(0,0,0,0.4)'}}>
            8 CHIẾN DỊCH
          </span>
        </div>

        {/* Lưới 2x2 Thẻ Quest Hero cỡ lớn (cao 335px/thẻ, ảnh NPC 160x160 + ảnh Robot 125x125) */}
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18}}>
          {YEU_CAU_THI_TRAN.map((item, i) => (
            <PopIn key={item.ma} at={22 + i * 10} style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              padding: '18px 20px', borderRadius: 26, background: '#FFFFFF', height: 335,
              border: `5px solid ${C.ink}`, boxShadow: `0 10px 0 ${C.ink}`, boxSizing: 'border-box'}}>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12}}>
                <div style={{position: 'relative', width: 168, height: 168, borderRadius: 24, background: item.nen,
                  border: `4px solid ${C.ink}`, boxShadow: `0 6px 0 ${C.ink}`, overflow: 'hidden', flexShrink: 0}}>
                  <Img src={staticFile(`nguoi/${item.anh}.png`)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 10%'}} />
                </div>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1,
                  height: 168, borderRadius: 22, background: '#F8FAFC', border: '3px dashed #94A3B8', padding: 8, boxSizing: 'border-box'}}>
                  <Img src={staticFile(item.bot)} style={{width: 138, height: 138, objectFit: 'contain', transform: `${item.xoay ? `rotate(${item.xoay}deg) ` : ''}scale(${'zoom' in item && item.zoom ? item.zoom : 1})`}} />
                  <span style={{fontFamily: MONO, fontSize: 16, fontWeight: 900, color: '#334155', marginTop: 2}}>MẪU ĐỘ R1</span>
                </div>
              </div>
              <div>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6}}>
                  <span style={{fontFamily: MONO, fontSize: 21, fontWeight: 900, color: '#FFFFFF', background: item.mau,
                    border: `3px solid ${C.ink}`, padding: '4px 14px', borderRadius: 12, whiteSpace: 'nowrap', boxShadow: `0 3px 0 ${C.ink}`}}>
                    {item.ma}
                  </span>
                  <span style={{fontSize: 19, fontWeight: 900, color: '#DC2626', background: '#FEE2E2', padding: '4px 12px',
                    borderRadius: 10, border: '2px solid #DC2626'}}>KHẨN CẤP</span>
                </div>
                <div style={{fontSize: 31, fontWeight: 900, color: C.ink, lineHeight: 1.2, marginBottom: 4}}>
                  {item.noi}
                </div>
                <div style={{fontSize: 23, fontWeight: 800, color: '#475569', lineHeight: 1.25}}>
                  {item.viec}
                </div>
              </div>
            </PopIn>
          ))}
        </div>

        {/* Dải 4 Chiến Dịch Tiếp Theo ở đáy bảng để lấp đầy bố cục và giới thiệu trọn 8 mùa */}
        <div style={{marginTop: 18, padding: '14px 18px', borderRadius: 22, background: '#1E293B', border: `4px solid ${C.ink}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12}}>
          {CHIEN_DICH_TIEP.map((cd) => (
            <div key={cd.ten} style={{display: 'flex', alignItems: 'center', gap: 10, background: '#0F172A', padding: '8px 12px',
              borderRadius: 16, border: `2.5px solid ${cd.mau}`, flex: 1, minWidth: 0}}>
              <div style={{width: 54, height: 54, borderRadius: 14, background: '#fff', border: `2.5px solid ${cd.mau}`, overflow: 'hidden', flexShrink: 0}}>
                <Img src={staticFile(`nguoi/${cd.anh}.png`)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 12%'}} />
              </div>
              <div style={{fontSize: 19, fontWeight: 900, color: '#F8FAFC', lineHeight: 1.2}}>{cd.ten}</div>
            </div>
          ))}
        </div>
      </PopIn>

      <Burst at={24} x={540} y={320} color={C.yellow} r={220} />

      <Mascot who="sola" x={230} h={520} at={8}
        faces={[[8, 'surprised-sach'], [50, 'cheer'], [110, 'celebrate-jump']]}
        says={[{at: 14, out: 98, text: 'Cả thị trấn gửi yêu cầu cứu hộ dồn dập luôn! CLB Robot mình nhận kèo lớn rồi Luna ơi!'}]}
        bubbleW={580} bubbleTop={1280} />
      <Mascot who="luna" x={850} h={520} at={16} side="left" lat
        faces={[[16, 'happy'], [75, 'explaining'], [125, 'thumbs-up']]}
        says={[{at: 102, out: 174, text: 'Thầy còn cấp luôn Xe Trạm Lab để team mình vừa đi vừa độ robot ngay tại hiện trường đó!'}]}
        bubbleW={580} bubbleTop={1280} />
    </AbsoluteFill>
  );
};

/** Cảnh 2 (7s = 210f): Khám phá Xe Trạm Lab Di Động (nen-doc/trong-xe.jpg) & Core R1. */
const HANG_MUC_XE_TRAM = [
  {ma: 'GARAGE', ten: 'Xưởng Độ Tại Chỗ', moTa: 'Thiếu tay kẹp hay cảm biến, Luna chế lắp ngay trên xe', anh: 'robot/m1/kep-cam-vui.png', trangThai: 'FULL ĐỒ', mau: '#EC4899', nen: '#FCE7F3'},
  {ma: 'SIMULATOR', ten: 'Sa Bàn Giả Lập', moTa: 'Test thử thuật toán an toàn trước khi thả bot ra sân', anh: 'robot/thung-go.png', trangThai: 'ONLINE', mau: '#6366F1', nen: '#E0E7FF'},
  {ma: 'CORE R1', ten: 'Bộ Não R1 Đa Năng', moTa: 'Khởi đầu 2 bánh gọn nhẹ · Nâng cấp mô-đun theo từng map', anh: 'robot/lab/dau-r1.png', trangThai: 'READY', mau: '#0284C7', nen: '#E0F2FE'},
  {ma: 'DEPLOY', ten: 'Độ Xong Tặng Luôn', moTa: 'Xong việc khung máy ở lại giúp dân, não R1 đi trạm kế', anh: 'robot/m2/du-vui.png', trangThai: '8 MÙA', mau: '#16A34A', nen: '#DCFCE7'},
];

const CanhXeTramLab: React.FC = () => {
  const f = useCurrentFrame();
  const r1Pop = pop(f, 18, FPS, 10);
  return (
    <AbsoluteFill style={{background: '#0F172A', fontFamily: FONT, overflow: 'hidden'}}>
      <Img src={staticFile('nen-doc/trong-xe.jpg')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(15,23,42,0.88) 0%, rgba(15,23,42,0.32) 40%, rgba(15,23,42,0.88) 100%)'}} />

      <Headline text="XE TRẠM LAB · XƯỞNG ĐỘ DI ĐỘNG!" at={4} top={38} size={52} color="#FFFFFF" accent={['XƯỞNG ĐỘ']} />

      {/* Sân khấu trưng bày Xe Trạm + Core R1 cỡ lớn (top: 122 .. 495) */}
      <div style={{position: 'absolute', left: 36, top: 122, width: 1008, height: 365, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', boxSizing: 'border-box'}}>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${r1Pop})`}}>
          <div style={{width: 390, height: 295, borderRadius: 34, background: 'rgba(15,23,42,0.82)',
            border: `6px solid ${C.ink}`, boxShadow: `0 12px 0 ${C.ink}, inset 0 0 32px rgba(56,189,248,0.4)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Img src={staticFile('robot/xe-tram-a.png')} style={{width: 350, height: 265, objectFit: 'contain',
              transform: `translateY(${Math.sin(f / 8) * 6}px)`}} />
          </div>
          <span style={{marginTop: -18, padding: '8px 28px', borderRadius: 16, background: '#38BDF8', color: C.ink, fontSize: 27, fontWeight: 900,
            border: `4px solid ${C.ink}`, boxShadow: `0 6px 0 ${C.ink}`, whiteSpace: 'nowrap'}}>Xe Trạm CLB</span>
        </div>

        <div style={{padding: 18, borderRadius: '50%', background: '#FDE047', border: `5px solid ${C.ink}`, boxShadow: `0 8px 0 ${C.ink}`}}>
          <Icon name="ArrowRight" size={52} color={C.ink} stroke={3.5} />
        </div>

        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${r1Pop})`}}>
          <div style={{width: 330, height: 295, borderRadius: 34, background: 'rgba(15,23,42,0.82)',
            border: `6px solid #FDE047`, boxShadow: `0 12px 0 ${C.ink}, 0 0 36px rgba(250,204,21,0.4)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Img src={staticFile('robot/m1/r1-vui.png')} style={{width: 260, height: 260, transform: `rotate(${-90 + Math.sin(f / 10) * 6}deg)`}} />
          </div>
          <span style={{marginTop: -18, padding: '8px 28px', borderRadius: 16, background: '#FDE047', color: C.ink, fontSize: 27, fontWeight: 900,
            border: `4px solid ${C.ink}`, boxShadow: `0 6px 0 ${C.ink}`, whiteSpace: 'nowrap'}}>Core R1 · 2 Bánh</span>
        </div>
      </div>

      {/* Lưới 2x2 Trang bị Xe Trạm cỡ lớn (top: 520 .. 1190, cao 325px/thẻ, có hình minh họa 140x140) */}
      <div style={{position: 'absolute', left: 36, right: 36, top: 520, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18}}>
        {HANG_MUC_XE_TRAM.map((h, i) => (
          <PopIn key={h.ma} at={20 + i * 12} style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            padding: '20px 22px', borderRadius: 28, background: '#FFFFFF',
            border: `5px solid ${C.ink}`, boxShadow: `0 11px 0 ${C.ink}`, boxSizing: 'border-box', height: 325}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14}}>
              <div style={{width: 145, height: 145, borderRadius: 24, background: h.nen, border: `4px solid ${C.ink}`,
                boxShadow: `0 6px 0 ${C.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
                <Img src={staticFile(h.anh)} style={{width: 132, height: 132, objectFit: 'contain', transform: h.anh.includes('robot/m') || h.anh.includes('dau-r1') ? 'rotate(-90deg)' : undefined}} />
              </div>
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10}}>
                <span style={{fontFamily: MONO, fontSize: 22, fontWeight: 900, padding: '8px 16px', borderRadius: 14,
                  background: h.mau, color: '#FFFFFF', border: `3px solid ${C.ink}`, boxShadow: `0 4px 0 ${C.ink}`}}>
                  {h.trangThai}
                </span>
                <span style={{fontFamily: MONO, fontSize: 18, fontWeight: 900, color: '#64748B'}}>#{h.ma}</span>
              </div>
            </div>
            <div>
              <div style={{fontSize: 32, fontWeight: 900, color: C.ink, marginBottom: 6}}>{h.ten}</div>
              <div style={{fontSize: 23, fontWeight: 800, color: '#334155', lineHeight: 1.28}}>{h.moTa}</div>
            </div>
          </PopIn>
        ))}
      </div>

      <Mascot who="sola" x={230} h={500} at={10}
        faces={[[10, 'shocked'], [65, 'thinking'], [120, 'confident']]}
        says={[{at: 16, out: 108, text: 'Đầu game R1 mới có 2 bánh cơ bản, nhưng thiếu đồ chơi gì là cậu chế ngay trên xe luôn nhỉ!'}]}
        bubbleW={580} bubbleTop={1300} />
      <Mascot who="luna" x={850} h={500} at={18} side="left" lat
        faces={[[18, 'explaining'], [95, 'wink'], [145, 'thumbs-up']]}
        says={[{at: 112, out: 202, text: 'Chuẩn! Độ full đồ xử lý xong việc là tặng khung máy lại đó, còn não R1 theo xe đi phá đảo trạm tiếp!'}]}
        bubbleW={580} bubbleTop={1300} />
    </AbsoluteFill>
  );
};

/** Cảnh 3 (8s = 240f): Bản đồ dọc (nen-doc/the-gioi.png) — Chiếc xe trạm chạy dọc con đường đi giúp các nơi! */
const TRAM_DOC = [
  {ten: 'CLB Robot', x: 750, y: 131, xeX: 495, xeY: 165, icon: 'Home', mau: C.indigo, nguoi: 'thay-giao-viec'},
  {ten: '1. Kho hàng', x: 750, y: 330, xeX: 350, xeY: 335, icon: 'Warehouse', mau: '#D97706', nguoi: 'tu-nghi'},
  {ten: '2. Nhà máy', x: 750, y: 522, xeX: 520, xeY: 520, icon: 'Factory', mau: '#DC2626', nguoi: 'hanh-nghi'},
  {ten: '3. Bãi tái chế', x: 755, y: 698, xeX: 350, xeY: 700, icon: 'Recycle', mau: '#16A34A', nguoi: 'sau-nghi'},
  {ten: '4. Cảng biển', x: 768, y: 908, xeX: 500, xeY: 910, icon: 'Anchor', mau: '#0891B2', nguoi: 'mai-nghi'},
  {ten: '5. Bến sông', x: 842, y: 1133, xeX: 480, xeY: 1130, icon: 'Waves', mau: '#0D9488', nguoi: 'ba-nghi'},
  {ten: '6. Nông trại', x: 798, y: 1336, xeX: 360, xeY: 1335, icon: 'Flower2', mau: '#DB2777', nguoi: 'lan-nghi'},
  {ten: '7. Mỏ đá', x: 802, y: 1558, xeX: 470, xeY: 1555, icon: 'Mountain', mau: '#7C3AED', nguoi: 'dung-nghi'},
  {ten: '8. Hang động', x: 802, y: 1765, xeX: 455, xeY: 1760, icon: 'Compass', mau: '#0284C7', nguoi: 'phong-nghi'},
];

const CanhHanhTrinh: React.FC = () => {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  const u = interpolate(f, [20, 195], [0, TRAM_DOC.length - 1], {...CLAMP, easing: Easing.inOut(Easing.cubic)});
  const idx = Math.min(TRAM_DOC.length - 2, Math.floor(u));
  const frac = u - idx;
  const a = TRAM_DOC[idx], b = TRAM_DOC[idx + 1];
  const xeX = a.xeX + (b.xeX - a.xeX) * frac;
  const xeY = a.xeY + (b.xeY - a.xeY) * frac;
  const latXe = b.xeX < a.xeX;

  return (
    <AbsoluteFill style={{background: '#0F172A', fontFamily: FONT, overflow: 'hidden'}}>
      <Img src={staticFile('nen-doc/the-gioi.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />

      {/* Đường kẻ sáng nối các trạm xe đã đi qua */}
      <svg style={{position: 'absolute', inset: 0, pointerEvents: 'none'}} width={1080} height={1920}>
        <polyline
          points={TRAM_DOC.slice(0, idx + 1).map((t) => `${t.xeX},${t.xeY}`).concat([`${xeX.toFixed(1)},${xeY.toFixed(1)}`]).join(' ')}
          fill="none" stroke={C.ink} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" />
        <polyline
          points={TRAM_DOC.slice(0, idx + 1).map((t) => `${t.xeX},${t.xeY}`).concat([`${xeX.toFixed(1)},${xeY.toFixed(1)}`]).join(' ')}
          fill="none" stroke={C.yellow} strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="22 14" />
      </svg>

      {/* Nhãn gắn đúng vào các ô trên bản đồ dọc + avatar người nhờ cỡ lớn (96x96) */}
      {TRAM_DOC.map((t, i) => {
        const at = 6 + i * 14;
        if (f < at) return null;
        const s = pop(f, at, fps, 10);
        const daQua = u >= i - 0.15;
        return (
          <React.Fragment key={t.ten}>
            <div style={{position: 'absolute', left: t.x, top: t.y, transform: `translate(-50%, -50%) scale(${s})`,
              display: 'flex', alignItems: 'center', gap: 12, padding: '11px 24px', borderRadius: 999,
              background: daQua ? 'linear-gradient(180deg, #FDE047 0%, #FACC15 100%)' : '#FFFFFF',
              color: C.ink, border: `5px solid ${C.ink}`, boxShadow: `0 8px 0 ${C.ink}`, whiteSpace: 'nowrap', zIndex: 8}}>
              <Icon name={t.icon} size={28} color={daQua ? C.ink : t.mau} stroke={3} />
              <span style={{fontSize: 28, fontWeight: 900}}>{t.ten}</span>
            </div>
            <div style={{position: 'absolute', left: t.x - 195, top: t.y - 48, width: 96, height: 96, borderRadius: '50%',
              background: '#fff', border: `5px solid ${daQua ? '#FDE047' : C.ink}`, overflow: 'hidden', transform: `scale(${s})`,
              boxShadow: `0 8px 0 ${C.ink}`, zIndex: 9}}>
              <Img src={staticFile(`nguoi/${t.nguoi}.png`)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 10%'}} />
            </div>
          </React.Fragment>
        );
      })}

      {/* Chiếc xe trạm cỡ lớn chạy dọc theo con đường */}
      <div style={{position: 'absolute', left: xeX - 115, top: xeY - 100, width: 230, height: 200, zIndex: 14,
        transform: `translateY(${Math.sin(f * 0.8) * 5}px)`}}>
        <Img src={staticFile('robot/xe-tram-a.png')} style={{width: '100%', height: '100%', objectFit: 'contain',
          transform: latXe ? 'scaleX(-1)' : undefined, filter: `drop-shadow(0 0 22px ${C.yellow}) drop-shadow(0 12px 18px rgba(0,0,0,0.45))`}} />
      </div>

      {/* Băng-rôn tiêu đề trên đỉnh kiểu Game Banner */}
      <div style={{position: 'absolute', left: 36, right: 36, top: 16, padding: '12px 26px', borderRadius: 24,
        background: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)', border: `5px solid #FDE047`,
        boxShadow: `0 8px 0 ${C.ink}`, textAlign: 'center', zIndex: 16}}>
        <div style={{fontSize: 36, fontWeight: 900, color: '#FDE047', letterSpacing: '0.03em', whiteSpace: 'nowrap'}}>
          BẢN ĐỒ CHIẾN DỊCH · 8 MÙA PHÁ ĐẢO
        </div>
      </div>

      <Mascot who="sola" x={210} h={460} at={12}
        faces={[[12, 'cheer'], [100, 'surprised-sach'], [175, 'celebrate-jump']]}
        says={[{at: 18, out: 120, text: 'Lăn bánh thôi! Từ trường mình xuyên qua kho hàng, nhà máy, bến sông, lên thẳng mỏ đá và hang sâu!'}]}
        bubbleW={590} bubbleTop={1340} />
      <Mascot who="luna" x={870} h={460} at={20} side="left" lat
        faces={[[20, 'happy'], [120, 'explaining'], [185, 'thumbs-up']]}
        says={[{at: 126, out: 232, text: 'Mở màn ở Kho hàng chú Tư ngay sát trường trước. Tới nơi chốt gọn 10 đơn trước 5 giờ chiều nay nhé!'}]}
        bubbleW={590} bubbleTop={1340} />
    </AbsoluteFill>
  );
};

/** Cảnh 4 (6s = 180f): Dừng tại Trạm 1 · Kho hàng Chú Tư (nen-doc/mua-1.png), chuẩn bị vào Phòng Lab học lái R1. */
const CanhDiemDau: React.FC = () => {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  const nut = pop(f, 35, fps, 10);
  return (
    <AbsoluteFill style={{background: '#1E293B', fontFamily: FONT, overflow: 'hidden'}}>
      <Img src={staticFile('nen-doc/mua-1.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />
      <AbsoluteFill style={{background: 'rgba(15,23,42,0.48)'}} />

      <Headline text="MÙA 1: KHO HÀNG CHÚ TƯ!" at={4} top={48} size={58} color="#fff" accent={['KHO HÀNG']} />

      {/* Thẻ Chọn Màn Chơi Mùa 1 cỡ lớn (top: 155 .. 1185) */}
      <PopIn at={14} style={{position: 'absolute', left: 40, top: 155, width: 1000, padding: '28px 32px 34px',
        borderRadius: 36, border: `6px solid ${C.ink}`,
        background: 'linear-gradient(180deg, #FFFFFF 0%, #E0F2FE 100%)',
        boxShadow: `0 16px 0 ${C.ink}, 0 28px 48px rgba(0,0,0,0.5)`, boxSizing: 'border-box'}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <span style={{padding: '10px 24px', borderRadius: 16, background: '#0284C7', color: '#fff', fontSize: 25, fontWeight: 900,
            border: `3.5px solid ${C.ink}`, boxShadow: `0 5px 0 ${C.ink}`, whiteSpace: 'nowrap'}}>
            STAGE 1 · 10 QUEST
          </span>
          <span style={{padding: '10px 24px', borderRadius: 16, background: '#EF4444', color: '#fff', fontSize: 25, fontWeight: 900,
            border: `3.5px solid ${C.ink}`, boxShadow: `0 5px 0 ${C.ink}`, whiteSpace: 'nowrap'}}>
            DEADLINE: 17:00 CHIỀU
          </span>
        </div>

        {/* Sân khấu Diorama cỡ lớn bên trong thẻ: Xe Trạm + Core R1 + Kiện Hàng */}
        <div style={{marginTop: 22, height: 370, borderRadius: 28, background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
          border: `5px solid ${C.ink}`, boxShadow: 'inset 0 0 40px rgba(56,189,248,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 24px', position: 'relative', overflow: 'hidden'}}>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}>
            <Img src={staticFile('robot/xe-tram-a.png')} style={{width: 280, height: 240, objectFit: 'contain',
              filter: 'drop-shadow(0 12px 20px rgba(0,0,0,0.5))'}} />
            <span style={{fontFamily: MONO, fontSize: 20, fontWeight: 900, color: '#38BDF8'}}>XE TRẠM LAB</span>
          </div>

          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}>
            <div style={{width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(250,204,21,0.35) 0%, transparent 70%)',
              border: '4px dashed #FDE047', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <Img src={staticFile('robot/m1/du-vui.png')} style={{width: 215, height: 215, transform: 'rotate(-90deg)'}} />
            </div>
            <span style={{fontFamily: MONO, fontSize: 20, fontWeight: 900, color: '#FDE047'}}>XE KHO R1</span>
          </div>

          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
            <div style={{display: 'flex', gap: 10}}>
              <Img src={staticFile('robot/thung-go.png')} style={{width: 105, height: 105}} />
              <Img src={staticFile('robot/thung-go.png')} style={{width: 105, height: 105}} />
            </div>
            <Img src={staticFile('robot/thung-go.png')} style={{width: 105, height: 105}} />
            <span style={{fontFamily: MONO, fontSize: 20, fontWeight: 900, color: '#4ADE80'}}>10 ĐƠN HÀNG</span>
          </div>
        </div>

        <div style={{marginTop: 22}}>
          <div style={{fontSize: 42, fontWeight: 900, color: C.ink, marginBottom: 8}}>Chiến dịch: Xe Kho Tự Hành</div>
          <div style={{fontSize: 27, fontWeight: 800, color: '#334155', lineHeight: 1.34}}>
            Vào xưởng Lab trên xe để Luna hướng dẫn code lái 2 bánh xe trước khi ra kho dọn 10 đơn giúp chú Tư!
          </div>
        </div>

        {/* 3 Huy hiệu mục tiêu */}
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginTop: 20}}>
          {[
            {icon: 'Wrench', nhan: 'Độ Bánh Xe & Tay Kẹp', mau: '#0284C7'},
            {icon: 'Radar', nhan: 'Cảm Biến Khoảng Cách', mau: '#7C3AED'},
            {icon: 'Cpu', nhan: '1 Code Giải 3 Ca Kho', mau: '#16A34A'},
          ].map((m) => (
            <div key={m.nhan} style={{padding: '12px 14px', borderRadius: 18, background: '#FFFBEB', border: `3.5px solid ${C.ink}`,
              boxShadow: `0 5px 0 ${C.ink}`, display: 'flex', alignItems: 'center', gap: 10, fontWeight: 900, fontSize: 21, color: C.ink}}>
              <Icon name={m.icon} size={28} color={m.mau} stroke={2.8} />
              <span>{m.nhan}</span>
            </div>
          ))}
        </div>

        <div style={{marginTop: 26, textAlign: 'center', transform: `scale(${(0.85 + 0.15 * nut) * (1 + 0.025 * Math.sin(f / 6))})`}}>
          <span style={{display: 'inline-flex', alignItems: 'center', gap: 18, padding: '22px 52px', borderRadius: 26,
            background: 'linear-gradient(180deg, #FDE047 0%, #F59E0B 100%)', color: C.ink, fontSize: 40, fontWeight: 900,
            border: `5px solid ${C.ink}`, boxShadow: `0 11px 0 ${C.ink}`, whiteSpace: 'nowrap'}}>
            <Icon name="Play" size={44} color={C.ink} stroke={3.2} />
            <span>VÀO LAB · ĐỘ BÁNH XE R1!</span>
          </span>
        </div>
      </PopIn>

      <Burst at={38} x={540} y={660} color={C.yellow} r={240} />

      <Nguoi anh="tu-sot-ruot" doiAnh={[[90, 'tu-mung']]} camXuc={[[0, 'hoang'], [90, 'vui']]} ten="CHÚ TƯ · THỦ KHO" mau="#B45309" x={180} h={540} at={6}
        says={[{at: 12, out: 98, text: 'May quá mấy đứa CLB Robot tới rồi! Kho chú còn kẹt 10 đơn phải bốc lên xe tải trước 5 giờ chiều!'}]}
        bubbleW={610} bubbleTop={1290} />
      <Mascot who="sola" x={850} h={500} at={16} side="left" lat
        faces={[[16, 'confident'], [95, 'celebrate-jump']]}
        says={[{at: 102, out: 174, text: 'Chú Tư cứ yên tâm! Tụi cháu vào Lab ráp đôi bánh xe với Luna rồi ra dọn sạch kho ngay!'}]}
        bubbleW={590} bubbleTop={1290} />
    </AbsoluteFill>
  );
};

export const PHIM_MO_DAU: Phim = {
  id: 'PhimMoDau',
  doc: true,
  canh: [
    {id: 'phong-clb', dur: 180, el: <CanhPhongClb />, sfx: [W_IN, ...pops([14, 28, 40, 52, 64], 0.3)]},
    {id: 'xe-tram-lab', dur: 210, el: <CanhXeTramLab />, sfx: [W_IN, ...pops([22, 36, 50, 64], 0.3), [18, 'ding.wav', 0.5]]},
    {id: 'hanh-trinh', dur: 240, el: <CanhHanhTrinh />, sfx: [W_IN, ...pops([6, 20, 34, 48, 62, 76, 90], 0.28), [160, 'riser.wav', 0.5]]},
    {id: 'diem-dau', dur: 180, el: <CanhDiemDau />, sfx: [W_IN, [35, 'ding.wav', 0.8]]},
  ],
};
