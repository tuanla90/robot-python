// Phim "Giải Mã Cơ Chế Các Xe Mùa Khác (Bánh Xích, Omni, Nhện, Drone)" khổ dọc 1080×1920 (doc: true):
// Do Luna trực tiếp giảng giải trong môi trường Phòng Lab trên xe trạm (nen-doc/trong-xe.jpg + Sa bàn lưới ô).
// Giải thích:
// 1. Mùa 2 — Thân Bánh Xích (xich) & Vòi Phun (hoi): Quay chậm 2 nhịp liên tiếp mới đủ 90° + Phun mạnh giật lùi 1 ô.
// 2. Mùa 3 & 4 — Thân Bánh Omni (omni), Nam Châm & Bộ Gieo Hạt: slide_left/right() trượt ngang giữ nguyên hướng mặt.
// 3. Mùa 5 — Thân Nhện 4 Chân (nhen) & Máy Ném: Đi 4 hướng không cần quay (2 nhịp/bước), crouch() chui gầm & stand()+go nhảy qua hố.
// 4. Mùa 6 — Thân Drone Bay (drone): Bay 1 nhịp/ô vượt rào, mỗi nhịp tốn 1 pin, phải land() xuống ô P sạc pin rồi take_off().
import React from 'react';
import {Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Burst, C, CLAMP, CodeBox, Icon, Mascot, MONO, PopIn} from './d10';
import {San, mo} from './kit';
import {Phim, W_IN, pops} from './may-phim';
import {CongThucLab, KhungLabLuna} from './PhimTayKep';

const O = 155;

/** Cảnh 1 (7s = 210f): Mùa 2 — Thân Bánh Xích (quay 90° cần 2 nhịp liên tiếp) & Vòi Phun Nước (phản lực). */
const CanhXeBanhXich: React.FC = () => {
  const f = useCurrentFrame();
  // Nhịp 1 (f=25..75): left_move() + wait() lần 1 -> Chỉ mới xoay được nửa góc 45°!
  // Nhịp 2 (f=95..145): left_move() + wait() lần 2 ngay sau đó -> Xoay nốt 45° thành đủ 90°!
  // Nhịp 3 (f=155..200): spray() bắn tia nước mở van!
  const gocXich = f < 25 ? -90 : f < 95 ? -90 + mo(f, 25, 70) * 45 : -45 + mo(f, 95, 140) * 45;
  const dangPhun = f >= 152;

  return (
    <KhungLabLuna huyHieu="PHÒNG LAB XE TRẠM · MÙA 2: BÁNH XÍCH & VÒI PHUN"
      tieuDe="Bánh Xích: Cần 2 nhịp liên tiếp để quay 90°!" accent={['Bánh Xích:', '2 nhịp liên tiếp']}
      phuDe="Xích bám chắc leo bậc thang & chống trôi băng chuyền — nhưng mỗi nhịp chỉ nhích nửa góc (45°)">
      <San x={140} y={245} w={800} h={570} o={O} />

      {/* Vòng cung hiển thị 2 nấc góc 45° -> 90° */}
      <div style={{position: 'absolute', left: 170, top: 270, padding: '12px 18px', borderRadius: 18,
        background: '#0F172A', border: '3px solid #F59E0B', display: 'flex', flexDirection: 'column', gap: 6, zIndex: 14}}>
        <span style={{fontSize: 18, fontWeight: 800, color: '#FDE047', whiteSpace: 'nowrap'}}>CƠ CHẾ QUAY BÁNH XÍCH</span>
        <span style={{fontFamily: MONO, fontSize: 21, fontWeight: 900, color: f >= 25 && f < 95 ? '#38BDF8' : '#94A3B8', whiteSpace: 'nowrap'}}>
          Nhịp 1: Nhích 45° (quay dở)
        </span>
        <span style={{fontFamily: MONO, fontSize: 21, fontWeight: 900, color: f >= 95 ? '#4ADE80' : '#94A3B8', whiteSpace: 'nowrap'}}>
          Nhịp 2: Lặp lại lệnh → Đủ 90°!
        </span>
      </div>

      {/* Tia nước khi phun ở nhịp 3 */}
      {dangPhun ? (
        <div style={{position: 'absolute', left: 560, top: 530 - 14, width: 250, height: 28, borderRadius: 999,
          background: 'linear-gradient(90deg, #38BDF8, #0284C7)', boxShadow: '0 0 22px #38BDF8', zIndex: 9}} />
      ) : null}

      {/* Xe bánh xích ở giữa sa bàn (480, 530) */}
      <div style={{position: 'absolute', left: 480 - 135, top: 530 - 135, width: 270, height: 270, zIndex: 12}}>
        <Img src={staticFile(dangPhun ? 'robot/lab/xich-voi-phun.png' : 'robot/lab/xich-co-ban.png')}
          style={{width: '100%', height: '100%', transform: `rotate(${gocXich}deg)`}} />
      </div>

      {/* Nhãn báo góc hiện tại */}
      <div style={{position: 'absolute', left: 480, top: 695, transform: 'translateX(-50%)', padding: '8px 20px',
        borderRadius: 999, background: f >= 140 ? C.good : '#D97706', color: '#fff', fontSize: 22, fontWeight: 900,
        border: '3px solid #fff', whiteSpace: 'nowrap', zIndex: 14}}>
        {f < 25 ? 'Hướng ban đầu: 0°' : f < 95 ? 'Sau nhịp 1: Mới nhích 45°!' : 'Sau nhịp 2 liên tiếp: Đã quay đủ 90°!'}
      </div>

      <Burst at={140} x={480} y={530} color={C.good} r={170} />

      <CodeBox x={110} y={840} w={860} size={25} title="quay_banh_xich_90.py"
        lines={[
          'left_move(); wait()   # Nhịp 1: Xích nhích 45°',
          'left_move(); wait()   # Nhịp 2: Làm y hệt -> Đủ 90°!',
          'spray("high"); wait() # Phun mạnh: giật lùi 1 ô!',
        ]}
        hl={f < 90 ? 0 : f < 150 ? 1 : 2} hlAt={10} />

      <CongThucLab lenh="2 × (left_move + wait)" coChe="Mỗi nhịp nhích 45°" ketQua="Đủ 90° (Leo bậc thang)" mau="#D97706" at={22} y={1115} />

      <Mascot who="luna" x={855} h={490} at={6} side="left" lat
        faces={[[6, 'explaining'], [95, 'happy'], [155, 'thumbs-up']]}
        says={[
          {at: 10, out: 104, text: 'Sang Nhà máy Mùa 2, R1 lắp Thân Bánh Xích leo bậc thang cực khỏe, nhưng vì xích nặng nên 1 nhịp chỉ nhích được nửa góc 45 độ thôi!'},
          {at: 110, out: 204, text: 'Muốn quay đủ 90 độ phải gọi 2 nhịp giống hệt nhau liên tiếp! Còn vòi phun spray("high") sẽ đẩy giật lùi xe 1 ô để húc thùng nặng!'},
        ]}
        bubbleW={590} bubbleTop={1295} />
      <Mascot who="sola" x={225} h={480} at={12} faces={[[12, 'surprised-sach'], [95, 'thinking-sach'], [150, 'celebrate-jump']]} />
    </KhungLabLuna>
  );
};

/** Cảnh 2 (6.5s = 195f): Mùa 3 & 4 — Thân Bánh Omni (trượt ngang slide_left / slide_right) + Nam châm & Gieo hạt. */
const CanhXeOmni: React.FC = () => {
  const f = useCurrentFrame();
  // Xe Omni đứng ở (385, 540) hướng mũi lên trên (-90°), trượt ngang sang phải 1 ô (540) rồi trượt tiếp sang (695) mà KHÔNG cần xoay mũi!
  const u1 = mo(f, 25, 75);
  const u2 = mo(f, 95, 145);
  const xOmni = 385 + (u1 + u2) * O;

  return (
    <KhungLabLuna huyHieu="PHÒNG LAB XE TRẠM · MÙA 3 & 4: BÁNH OMNI TRƯỢT NGANG"
      tieuDe="Bánh Omni: slide_left / right() trượt ngang!" accent={['Bánh Omni:', 'trượt ngang!']}
      phuDe="Trượt sang trái/phải 1 ô mà mũi xe giữ nguyên hướng — Kết hợp Nam Châm hoặc Bộ Gieo Hạt">
      <San x={140} y={245} w={800} h={570} o={O} />

      {/* Vệt trượt ngang qua 3 ô */}
      <div style={{position: 'absolute', left: 385, top: 530 - 6, width: Math.max(0, xOmni - 385), height: 12,
        background: 'linear-gradient(90deg, #A855F7, #EC4899)', borderRadius: 999, zIndex: 8}} />

      {/* Các bông hoa gieo dọc theo đường trượt ngang */}
      {[385, 540, 695].map((ox, i) => {
        if (xOmni < ox - 10) return null;
        return (
          <div key={ox} style={{position: 'absolute', left: ox - 45, top: 530 - 45, width: 90, height: 90, borderRadius: 20,
            background: 'rgba(236,72,153,0.18)', border: '3px dashed #EC4899', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 7}}>
            <Icon name="Flower2" size={44} color="#DB2777" stroke={2.8} />
          </div>
        );
      })}

      {/* Robot Bánh Omni mũi luôn hướng lên trên (-90°) trong khi trượt ngang */}
      <div style={{position: 'absolute', left: xOmni - 130, top: 530 - 130, width: 260, height: 260, zIndex: 12}}>
        <Img src={staticFile(f < 90 ? 'robot/lab/omni-nam-cham.png' : 'robot/lab/omni-gieo-hat.png')}
          style={{width: '100%', height: '100%', transform: 'rotate(-90deg)'}} />
      </div>

      {/* Huy hiệu hướng mũi xe giữ nguyên */}
      <div style={{position: 'absolute', left: 540, top: 275, transform: 'translateX(-50%)', padding: '10px 22px',
        borderRadius: 999, background: C.lunaDeep, color: '#fff', fontSize: 22, fontWeight: 900,
        border: '3px solid #fff', whiteSpace: 'nowrap', zIndex: 15}}>
        Mũi xe giữ nguyên hướng · Trượt ngang theo hướng mặt xe!
      </div>

      <Burst at={145} x={695} y={530} color={C.good} r={170} />

      <CodeBox x={110} y={840} w={860} size={25} title="omni_truot_ngang.py"
        lines={[
          'pen_down(); wait()    # Hạ phễu gieo hạt dưới bụng',
          'slide_right(); wait() # Trượt ngang phải 1 ô',
          'slide_right(); wait() # Trượt tiếp -> Gieo thẳng hàng!',
        ]}
        hl={f < 25 ? 0 : f < 90 ? 1 : 2} hlAt={10} />

      <CongThucLab lenh="slide_left / right() + wait()" coChe="Con lăn trượt ngang" ketQua="Không cần quay mũi!" mau={C.lunaDeep} at={20} y={1115} />

      <Mascot who="luna" x={855} h={490} at={6} side="left" lat
        faces={[[6, 'explaining'], [85, 'happy'], [145, 'thumbs-up']]}
        says={[
          {at: 10, out: 98, text: 'Ở Bãi tái chế và Nông trại hoa, Thân Bánh Omni có thêm lệnh slide_left() và slide_right() giúp trượt ngang mà không cần quay xe!'},
          {at: 104, out: 188, text: 'Nhớ là trượt theo hướng mặt xe nha! Kết hợp Nam châm hút sắt 2 ô hoặc hạ phễu pen_down() là vừa trượt vừa gieo hoa cực lẹ!'},
        ]}
        bubbleW={590} bubbleTop={1295} />
      <Mascot who="sola" x={225} h={480} at={12} faces={[[12, 'surprised-sach'], [95, 'celebrate-jump']]} />
    </KhungLabLuna>
  );
};

/** Cảnh 3 (7s = 210f): Mùa 5 — Thân Nhện 4 Chân (đi 4 hướng không cần quay, crouch chui gầm, stand+go nhảy qua hố). */
const CanhXeNhen: React.FC = () => {
  const f = useCurrentFrame();
  // f=0..75: Nhện gọi crouch() + wait() -> co chân thấp xuống (nhen-co.png) để chui gầm thấp!
  // f=80..155: Đang co chân, gọi stand() + go_right() -> bật nhảy vọt qua hố đen ở giữa (540, 530) sang ô đích (695, 530)!
  const dangCo = f >= 25 && f < 95;
  const uNhay = mo(f, 95, 155);
  const xNhen = 230 + (f < 95 ? mo(f, 35, 80) * O : O + uNhay * 2 * O);
  const doCaoNhay = f >= 95 && f <= 155 ? Math.sin(uNhay * Math.PI) * 95 : 0;

  return (
    <KhungLabLuna huyHieu="PHÒNG LAB XE TRẠM · MÙA 5: NHỆN 4 CHÂN & MÁY NÉM"
      tieuDe="Thân Nhện: Đi 4 hướng · Co chân & Nhảy qua hố!" accent={['Đi 4 hướng', 'Nhảy qua hố!']}
      phuDe="Mỗi lệnh go_up/down/left/right() tự bước 2 nhịp (không cần wait) — crouch() + stand() để nhảy!">
      <San x={140} y={245} w={800} h={570} o={O} />

      {/* Gầm đá thấp ở ô (385, 530) */}
      <div style={{position: 'absolute', left: 385 - 70, top: 530 - 70, width: 140, height: 140, borderRadius: 20,
        background: 'rgba(124,58,237,0.16)', border: '4px dashed #7C3AED', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'flex-start', paddingTop: 10, zIndex: 13}}>
        <span style={{fontSize: 18, fontWeight: 900, color: '#6D28D9', background: '#EDE9FE', padding: '2px 10px', borderRadius: 8, whiteSpace: 'nowrap'}}>
          GẦM ĐÁ THẤP
        </span>
      </div>

      {/* Hố sâu ở ô (540, 530) */}
      <div style={{position: 'absolute', left: 540 - 66, top: 530 - 66, width: 132, height: 132, borderRadius: '50%',
        background: 'radial-gradient(circle, #020617 55%, #334155 100%)', border: '4px solid #475569',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 6}}>
        <span style={{fontSize: 20, fontWeight: 900, color: '#94A3B8', whiteSpace: 'nowrap'}}>HỐ SÂU</span>
      </div>

      {/* Ô đích bên phải (695, 530) */}
      <div style={{position: 'absolute', left: 695 - 64, top: 530 - 64, width: 128, height: 128, borderRadius: 22,
        border: `4px dashed ${C.good}`, background: 'rgba(14,159,110,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 6}}>
        <Icon name="CheckCircle2" size={48} color={C.good} stroke={2.8} />
      </div>

      {/* Robot Nhện 4 chân */}
      <div style={{position: 'absolute', left: xNhen - 125, top: 530 - 125 - doCaoNhay, width: 250, height: 250, zIndex: 14,
        transform: `scale(${1 + doCaoNhay / 350})`, filter: doCaoNhay > 5 ? 'drop-shadow(0 28px 18px rgba(15,23,42,0.45))' : 'none'}}>
        <Img src={staticFile(dangCo ? 'robot/lab/nhen-co.png' : 'robot/lab/nhen-dung.png')} style={{width: '100%', height: '100%'}} />
      </div>

      <Burst at={155} x={695} y={530} color={C.good} r={170} />

      <CodeBox x={110} y={840} w={860} size={25} title="nhen_co_va_nhay.py"
        lines={[
          'crouch(); wait()    # 1. Co chân thấp xuống',
          'go_right()          # 2. Chui qua gầm (tự đi 2 nhịp)',
          'stand(); go_right() # 3. Duỗi + bước -> NHẢY QUA HỐ!',
        ]}
        hl={f < 40 ? 0 : f < 95 ? 1 : 2} hlAt={10} />

      <CongThucLab lenh="crouch() -> stand() + go_..." coChe="Co lấy đà rồi bật duỗi" ketQua="Nhảy vọt qua 1 ô!" mau="#7C3AED" at={22} y={1115} />

      <Mascot who="luna" x={855} h={490} at={6} side="left" lat
        faces={[[6, 'explaining'], [95, 'happy'], [155, 'thumbs-up']]}
        says={[
          {at: 10, out: 102, text: 'Trên Mỏ đá Mùa 5, Thân Nhện 4 chân không có mặt trước: gọi go_up(), go_right()... là đi ngay không cần quay và không cần wait()!'},
          {at: 108, out: 204, text: 'Muốn chui gầm thấp thì gọi crouch() + wait(). Còn đang co mà gọi stand() cùng lúc với lệnh bước là Nhện bật nhảy vọt qua hố luôn!'},
        ]}
        bubbleW={590} bubbleTop={1295} />
      <Mascot who="sola" x={225} h={480} at={12} faces={[[12, 'surprised-sach'], [100, 'celebrate-jump']]} />
    </KhungLabLuna>
  );
};

/** Cảnh 4 (6.5s = 195f): Mùa 6 — Thân Drone Bay (go_... 1 nhịp, tốn pin battery(), hạ cánh land() lên ô P sạc đầy). */
const CanhXeDrone: React.FC = () => {
  const f = useCurrentFrame();
  // Drone bay từ (230, 530) qua rào chắn ở (385, 530) và (540, 530) tới ô sạc P ở (695, 530), rồi land() sạc đầy pin!
  const uBay = mo(f, 20, 110);
  const daDau = f >= 130;
  const xDrone = 230 + uBay * 3 * O;
  const pin = daDau ? 5 : Math.max(1, 5 - Math.floor(uBay * 3.5));

  return (
    <KhungLabLuna huyHieu="PHÒNG LAB XE TRẠM · MÙA 6: DRONE BAY & TRẠM SẠC PIN"
      tieuDe="Thân Drone: Bay vượt rào & Sạc pin!" accent={['Bay vượt rào', 'Sạc pin!']}
      phuDe="Mỗi nhịp bay hoặc lơ lửng đều tốn 1 pin (hết pin là rơi) — Phải land() xuống ô P để sạc đầy!">
      <San x={140} y={245} w={800} h={570} o={O} />

      {/* Hàng rào chắn ở 2 ô giữa mà Drone bay vọt qua trên đầu */}
      {[385, 540].map((ox) => (
        <div key={ox} style={{position: 'absolute', left: ox - 64, top: 530 - 64, width: 128, height: 128, borderRadius: 18,
          background: 'rgba(100,116,139,0.22)', border: '4px solid #64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 6}}>
          <span style={{fontSize: 19, fontWeight: 900, color: '#334155', whiteSpace: 'nowrap'}}>RÀO THẤP</span>
        </div>
      ))}

      {/* Ô sạc P ở (695, 530) */}
      <div style={{position: 'absolute', left: 695 - 68, top: 530 - 68, width: 136, height: 136, borderRadius: 24,
        background: daDau ? '#DCFCE7' : '#E0F2FE', border: `5px solid ${daDau ? C.good : '#0284C7'}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 7}}>
        <span style={{fontFamily: MONO, fontSize: 42, fontWeight: 900, color: daDau ? C.good : '#0369A1', lineHeight: 1}}>P</span>
        <span style={{fontSize: 16, fontWeight: 900, color: daDau ? C.good : '#0369A1', whiteSpace: 'nowrap'}}>TRẠM SẠC</span>
      </div>

      {/* Drone bay lơ lửng hoặc hạ cánh */}
      <div style={{position: 'absolute', left: xDrone - 125, top: 530 - 125 - (daDau ? 0 : 18 + Math.sin(f * 0.4) * 6),
        width: 250, height: 250, zIndex: 14, transform: `scale(${daDau ? 0.92 : 1.06})`,
        filter: daDau ? 'none' : 'drop-shadow(0 24px 16px rgba(15,23,42,0.38))'}}>
        <Img src={staticFile(daDau ? 'robot/lab/drone-dau.png' : 'robot/lab/drone-bay.png')} style={{width: '100%', height: '100%'}} />
      </div>

      {/* Đồng hồ đo pin battery() trên đỉnh sa bàn */}
      <div style={{position: 'absolute', left: 165, right: 165, top: 272, padding: '12px 22px', borderRadius: 20,
        background: '#0F172A', border: `3px solid ${daDau ? C.good : '#0284C7'}`, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', zIndex: 15}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
          <Icon name="BatteryCharging" size={28} color={daDau ? '#4ADE80' : '#38BDF8'} stroke={2.8} />
          <span style={{fontFamily: MONO, fontSize: 23, fontWeight: 900, color: '#fff', whiteSpace: 'nowrap'}}>
            battery() == <span style={{color: daDau ? '#4ADE80' : '#FDE047'}}>{pin}/5</span>
          </span>
        </div>
        <span style={{padding: '6px 16px', borderRadius: 999, background: daDau ? C.good : '#0284C7', color: '#fff',
          fontSize: 19, fontWeight: 900, whiteSpace: 'nowrap'}}>
          {daDau ? 'Đã land() xuống P -> Pin ĐẦY!' : 'Đang bay: -1 pin / nhịp'}
        </span>
      </div>

      <Burst at={132} x={695} y={530} color={C.good} r={180} />

      <CodeBox x={110} y={840} w={860} size={23} title="drone_bay_va_sac_pin.py"
        lines={[
          'go_right(); go_right(); go_right() # Bay 3 ô vượt rào',
          'if battery() < 3:                  # Kiểm tra pin',
          '    land()                         # Đáp ô P sạc đầy!',
          '    take_off()                     # Cất cánh bay tiếp!',
        ]}
        hl={f < 110 ? 0 : f < 130 ? 1 : f < 165 ? 2 : 3} hlAt={10} />

      <CongThucLab lenh="battery() -> land()" coChe="Đáp đúng ô P sạc pin" ketQua="Bay tiếp an toàn!" mau="#0284C7" at={22} y={1115} />

      <Mascot who="luna" x={855} h={490} at={6} side="left" lat
        faces={[[6, 'explaining'], [95, 'happy'], [145, 'thumbs-up']]}
        says={[
          {at: 10, out: 98, text: 'Trên Núi tuyết Mùa 6, Drone bay vọt qua mọi rào thấp chỉ 1 nhịp mỗi ô, nhưng mỗi nhịp bay đều tốn 1 vạch pin!'},
          {at: 104, out: 188, text: 'Bay ngang qua ô sạc P chưa được sạc đâu nha! Phải gọi land() đáp hẳn xuống ô P thì pin mới đầy, rồi take_off() bay tiếp!'},
        ]}
        bubbleW={590} bubbleTop={1295} />
      <Mascot who="sola" x={225} h={480} at={12} faces={[[12, 'surprised-sach'], [130, 'celebrate-jump']]} />
    </KhungLabLuna>
  );
};

/** Cảnh 5 (6s = 180f): Bảng Tổng Hợp 5 Thân Xe Từ Mùa 1 -> Mùa 6 Trong Phòng Lab. */
const BANG_5_THAN_XE = [
  {ma: 'MÙA 1', ten: 'Thân Hai Bánh', lenh: 'left/right_move() + wait()', coChe: 'Quay 90° trong 1 nhịp · Gài 2 bánh để tiến', mau: C.solaDeep, icon: 'Disc'},
  {ma: 'MÙA 2', ten: 'Thân Bánh Xích', lenh: '2 × (left_move + wait)', coChe: 'Leo bậc thang · Cần 2 nhịp liên tiếp để quay 90°', mau: '#D97706', icon: 'Shield'},
  {ma: 'MÙA 3–4', ten: 'Thân Bánh Omni', lenh: 'slide_left / right() + wait()', coChe: 'Trượt ngang giữ nguyên hướng mặt xe', mau: C.lunaDeep, icon: 'MoveHorizontal'},
  {ma: 'MÙA 5', ten: 'Thân Nhện 4 Chân', lenh: 'go_...() · crouch() · stand()', coChe: 'Đi 4 hướng (2 nhịp/bước) · Co chui gầm & Nhảy hố', mau: '#7C3AED', icon: 'Footprints'},
  {ma: 'MÙA 6', ten: 'Thân Drone Bay', lenh: 'go_...() · land() · take_off()', coChe: 'Bay vượt rào (1 nhịp/ô) · Đáp ô P sạc pin', mau: '#0284C7', icon: 'Plane'},
];

const CanhSoTayCacXe: React.FC = () => (
  <KhungLabLuna huyHieu="PHÒNG LAB XE TRẠM · BẢNG TỔNG HỢP 5 THÂN XE"
    tieuDe="Sổ tay 5 Thân Xe Robot các Mùa" accent={['5 Thân Xe Robot']}
    phuDe="Mỗi địa hình trong thị trấn có một loại khung gầm chuyên dụng với cơ chế di chuyển riêng">
    <div style={{position: 'absolute', left: 45, right: 45, top: 250, display: 'flex', flexDirection: 'column', gap: 16}}>
      {BANG_5_THAN_XE.map((row, i) => (
        <PopIn key={row.ma} at={12 + i * 12} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 22px', borderRadius: 22, background: 'rgba(255,255,255,0.97)', border: `3.5px solid ${row.mau}`,
          boxShadow: '0 10px 24px rgba(15,23,42,0.25)', boxSizing: 'border-box'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
            <div style={{width: 54, height: 54, borderRadius: 15, background: row.mau, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
              <Icon name={row.icon} size={30} color="#fff" stroke={2.8} />
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                <span style={{fontFamily: MONO, fontSize: 18, fontWeight: 800, color: '#fff', background: row.mau,
                  padding: '2px 10px', borderRadius: 8, whiteSpace: 'nowrap'}}>{row.ma}</span>
                <span style={{fontSize: 25, fontWeight: 900, color: C.ink, whiteSpace: 'nowrap'}}>{row.ten}</span>
                <span style={{fontFamily: MONO, fontSize: 20, fontWeight: 800, color: C.codeBg, background: '#F1F5F9',
                  padding: '2px 10px', borderRadius: 8, border: '1.5px solid #CBD5E1', whiteSpace: 'nowrap'}}>{row.lenh}</span>
              </div>
              <span style={{fontSize: 22, fontWeight: 700, color: '#475569', whiteSpace: 'nowrap'}}>{row.coChe}</span>
            </div>
          </div>
        </PopIn>
      ))}
    </div>

    <Mascot who="luna" x={855} h={490} at={8} side="left" lat
      faces={[[8, 'explaining'], [75, 'happy'], [130, 'thumbs-up']]}
      says={[{at: 14, out: 172, text: 'Từ hai bánh, bánh xích, bánh Omni tới chân nhện và Drone bay — nắm trọn bí kíp Phòng Lab là chinh phục cả 7 mùa dễ dàng!'}]}
      bubbleW={590} bubbleTop={1295} />
    <Mascot who="sola" x={225} h={490} at={14} faces={[[14, 'cheer'], [85, 'celebrate-jump']]} />
  </KhungLabLuna>
);

export const PHIM_XE_MUA_KHAC: Phim = {
  id: 'PhimXeMuaKhac',
  doc: true,
  canh: [
    {id: 'xe-banh-xich', dur: 210, el: <CanhXeBanhXich />, sfx: [W_IN, [25, 'swish.wav', 0.45], [95, 'swish.wav', 0.45], [140, 'ding.wav', 0.6]]},
    {id: 'xe-omni', dur: 195, el: <CanhXeOmni />, sfx: [W_IN, [25, 'swish.wav', 0.45], [95, 'swish.wav', 0.45], [145, 'ding.wav', 0.6]]},
    {id: 'xe-nhen', dur: 210, el: <CanhXeNhen />, sfx: [W_IN, [25, 'click.wav', 0.45], [95, 'swish.wav', 0.6], [155, 'ding.wav', 0.7]]},
    {id: 'xe-drone', dur: 195, el: <CanhXeDrone />, sfx: [W_IN, [20, 'swish.wav', 0.5], [132, 'ding.wav', 0.7]]},
    {id: 'so-tay-cac-xe', dur: 180, el: <CanhSoTayCacXe />, sfx: [W_IN, ...pops([12, 24, 36, 48, 60], 0.35), [80, 'ding.wav', 0.6]]},
  ],
};
