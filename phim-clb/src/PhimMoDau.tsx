// Phim 0 · Mở đầu game khổ dọc 1080×1920 (doc: true):
// Giới thiệu CLB Mật Lệnh Robot (cấp 3) nhận kèo giải cứu 8 điểm nóng toàn thị trấn,
// khám phá Xe Trạm Lab Di Động (xưởng độ robot + sa bàn giả lập),
// và hành trình xe trạm lăn bánh dọc bản đồ chiến dịch 8 mùa.
import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Burst, C, CLAMP, FONT, Headline, Icon, Mascot, MONO, PopIn, ease, pop} from './d10';
import {FPS, Phim, W_IN, pops} from './may-phim';
import {Nguoi} from './doc/kit-doc';

/** Cảnh 1 (8s = 240f; mỗi cảnh dừng cuối chờ Tiếp, mỗi nhịp một câu ngắn — 2/11 theo skill remotion-motion-graphics): Tại phòng CLB (nen-doc/mua-7.png), Bảng Ủy Nhiệm từ Thầy Hiệu Trưởng gửi tới CLB Robot. */
const YEU_CAU_THI_TRAN = [
  {ma: 'QUEST #1', noi: 'Kho hàng Chú Tư', viec: 'Kẹt 10 đơn sát giờ xe tải chạy', mau: '#F59E0B', nen: '#FEF3C7', anh: 'tu-sot-ruot', bot: 'robot/m1/du-vui.png', xoay: -90, zoom: 1.48},
  {ma: 'QUEST #2', noi: 'Nhà máy Cô Hạnh', viec: 'Lò hơi quá áp, kẹt van tầng cao', mau: '#EF4444', nen: '#FEE2E2', anh: 'hanh-hoang', bot: 'robot/m2/du-vui.png', xoay: -90},
  {ma: 'QUEST #3', noi: 'Bãi tái chế Bác Sáu', viec: 'Núi sắt nhựa lẫn lộn chờ phân loại', mau: '#10B981', nen: '#D1FAE5', anh: 'sau-sot-ruot', bot: 'robot/m3/nhen-tu-vui.png', xoay: 0},
  {ma: 'QUEST #4', noi: 'Nông trại Chị Lan', viec: 'Cánh đồng hoa Tết chờ gieo hạt', mau: '#EC4899', nen: '#FCE7F3', anh: 'lan-sot-ruot', bot: 'robot/m5/drone-cam-vui.png', xoay: 0},
];

const CanhPhongClb: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#1E1B4B', fontFamily: FONT, overflow: 'hidden'}}>
      <Img src={staticFile('nen-doc/mua-7.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
        transform: `scale(${1.02 + 0.02 * Math.sin(f / 60)})`}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0.45) 45%, rgba(15,23,42,0.9) 100%)'}} />

      <Headline text="CLB ROBOT NHẬN KÈO GIẢI CỨU!" at={4} top={34} size={52} color="#FFFFFF" accent={['NHẬN KÈO']} />

      {/* Bảng Ủy Nhiệm: lời Thầy + 4 người nhờ (ảnh + tên nơi), không chữ phụ (y = 130 .. ~1010) */}
      <PopIn at={14} style={{position: 'absolute', left: 36, top: 130, width: 1008, padding: '22px 24px 24px',
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

        {/* Lưới 2x2 người nhờ: ảnh lớn + tên nơi (2/11: bỏ mã quest, KHẨN CẤP, mẫu robot, mô tả — chữ nhiều quá) */}
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18}}>
          {YEU_CAU_THI_TRAN.map((item, i) => (
            <PopIn key={item.ma} at={22 + i * 10} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
              padding: '20px 20px 22px', borderRadius: 26, background: '#FFFFFF',
              border: `5px solid ${C.ink}`, boxShadow: `0 10px 0 ${C.ink}`, boxSizing: 'border-box'}}>
              <div style={{width: 230, height: 230, borderRadius: 28, background: item.nen,
                border: `5px solid ${item.mau}`, boxShadow: `0 6px 0 ${C.ink}`, overflow: 'hidden'}}>
                <Img src={staticFile(`nguoi/${item.anh}.png`)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 10%'}} />
              </div>
              <div style={{fontSize: 36, fontWeight: 900, color: C.ink, lineHeight: 1.15, textAlign: 'center'}}>{item.noi}</div>
            </PopIn>
          ))}
        </div>
      </PopIn>

      <Burst at={24} x={540} y={320} color={C.yellow} r={220} />

      <Mascot who="sola" x={230} h={520} at={8}
        faces={[[8, 'surprised-sach'], [50, 'cheer'], [110, 'celebrate-jump']]}
        says={[{at: 14, out: 120, text: 'Cả thị trấn nhờ CLB mình giải cứu!'}]}
        bubbleW={560} bubbleTop={1180} />
      <Mascot who="luna" x={850} h={520} at={16} side="left" lat
        faces={[[16, 'happy'], [75, 'explaining'], [125, 'thumbs-up']]}
        says={[{at: 126, out: 240, text: 'Thầy cấp luôn Xe Trạm Lab cho tụi mình!'}]}
        bubbleW={560} bubbleTop={1180} />
    </AbsoluteFill>
  );
};

/** Cảnh 2 (8s = 240f): Khám phá Xe Trạm Lab Di Động (nen-doc/trong-xe.jpg) & Core R1. */
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

      {/* Lưới 2x2 trang bị Xe Trạm: hình + tên (top: 520 .. ~1010; 2/11 bỏ mô tả, nhãn trạng thái) */}
      <div style={{position: 'absolute', left: 36, right: 36, top: 520, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18}}>
        {HANG_MUC_XE_TRAM.map((h, i) => (
          <PopIn key={h.ma} at={20 + i * 12} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
            padding: '20px 22px 22px', borderRadius: 28, background: '#FFFFFF',
            border: `5px solid ${C.ink}`, boxShadow: `0 11px 0 ${C.ink}`, boxSizing: 'border-box'}}>
            <div style={{width: 170, height: 170, borderRadius: 26, background: h.nen, border: `5px solid ${h.mau}`,
              boxShadow: `0 6px 0 ${C.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <Img src={staticFile(h.anh)} style={{width: 150, height: 150, objectFit: 'contain', transform: h.anh.includes('robot/m') || h.anh.includes('dau-r1') ? 'rotate(-90deg)' : undefined}} />
            </div>
            <div style={{fontSize: 34, fontWeight: 900, color: C.ink, textAlign: 'center', lineHeight: 1.15}}>{h.ten}</div>
          </PopIn>
        ))}
      </div>

      <Mascot who="sola" x={230} h={500} at={10}
        faces={[[10, 'shocked'], [65, 'thinking'], [120, 'confident']]}
        says={[{at: 16, out: 120, text: 'R1 mới có 2 bánh thôi hả Luna?'}]}
        bubbleW={560} bubbleTop={1180} />
      <Mascot who="luna" x={850} h={500} at={18} side="left" lat
        faces={[[18, 'explaining'], [95, 'wink'], [145, 'thumbs-up']]}
        says={[{at: 126, out: 240, text: 'Thiếu đồ gì, mình độ ngay trên xe!'}]}
        bubbleW={560} bubbleTop={1180} />
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
  {ten: '8. Hang động', x: 802, y: 1722, xeX: 455, xeY: 1760, icon: 'Compass', mau: '#0284C7', nguoi: 'phong-nghi'},
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

      {/* 2/11: bỏ Sola / Luna và bóng thoại ở cảnh này — đè lên trạm 6–8; bản đồ + băng-rôn tự kể */}
    </AbsoluteFill>
  );
};

/** Cảnh 4 (8s = 240f): Dừng tại Trạm 1 · Kho hàng Chú Tư (nen-doc/mua-1.png), chuẩn bị vào Phòng Lab học lái R1. */
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

        <div style={{marginTop: 26, textAlign: 'center'}}>
          <div style={{fontSize: 46, fontWeight: 900, color: C.ink, marginBottom: 6}}>Xe Kho Tự Hành</div>
          <div style={{fontSize: 32, fontWeight: 800, color: '#334155'}}>Dọn 10 đơn trước 5 giờ chiều</div>
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
        says={[{at: 12, out: 120, text: 'Kho chú kẹt 10 đơn, 5 giờ xe tải chạy rồi!'}]}
        bubbleW={560} bubbleTop={1180} />
      <Mascot who="sola" x={850} h={500} at={16} side="left" lat
        faces={[[16, 'confident'], [95, 'celebrate-jump']]}
        says={[{at: 126, out: 999, text: 'Tụi cháu vào Lab ráp bánh xe rồi ra liền!'}]}
        bubbleW={560} bubbleTop={1180} />
    </AbsoluteFill>
  );
};

export const PHIM_MO_DAU: Phim = {
  id: 'PhimMoDau',
  doc: true,
  canh: [
    {id: 'phong-clb', dur: 240, el: <CanhPhongClb />, sfx: [W_IN, ...pops([14, 28, 40, 52, 64], 0.3)]},
    {id: 'xe-tram-lab', dur: 240, el: <CanhXeTramLab />, sfx: [W_IN, ...pops([22, 36, 50, 64], 0.3), [18, 'ding.wav', 0.5]]},
    {id: 'hanh-trinh', dur: 240, el: <CanhHanhTrinh />, sfx: [W_IN, ...pops([6, 20, 34, 48, 62, 76, 90], 0.28), [160, 'riser.wav', 0.5]]},
    {id: 'diem-dau', dur: 240, el: <CanhDiemDau />, sfx: [W_IN, [35, 'ding.wav', 0.8]]},
  ],
};
