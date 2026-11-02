// Bộ 3 Phim Phòng Lab riêng cho từng Bộ phận Mùa 3 (Bãi tái chế) & Mùa 4 (Nông trại hoa) khổ dọc 1080×1920 (doc: true):
// 1. PHIM_BANH_OMNI (id: 'PhimBanhOmni') — Bộ phận: Thân Bánh Omni (omni)
// 2. PHIM_NAM_CHAM  (id: 'PhimNamCham')  — Bộ phận: Nam Châm (nam-cham) & Cảm Biến Từ (tu)
// 3. PHIM_GIEO_HAT  (id: 'PhimGieoHat')  — Bộ phận: Bộ Gieo Hạt (son) & Cảm Biến Màu / Camera (mau, camera, camera-4)
import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {Burst, C, CodeBox, Icon, Mascot, MONO, PopIn} from './d10';
import {San, mo} from './kit';
import {Phim, W_IN, pops} from './may-phim';
import {ChuNay, Moc, NenHienTruong, NhanGoi, Nguoi, ODat, TrongXe, Vat, Xe, tamO} from './doc/kit-doc';
import {CongThucLab, HangSoTayLab, KhungLabLuna} from './PhimTayKep';

const O = 155;

/* ============================================================================
   1. PHIM_BANH_OMNI — Bộ phận: Thân Bánh Omni (omni)
   Bố cục: Vấn đề (Hành lang bãi tái chế hẹp không đủ chỗ quay đầu) -> Luna chế Bánh Omni -> Giải thích cơ chế cho Sola
   ========================================================================== */

const R_OMNI_VAN_DE: Moc[] = [[0, 2, 4, -90], [30, 2, 3, -90], [65, 2, 3, -45], [95, 2, 3, -90]];

export const CanhOmniVanDe: React.FC = () => (
  <NenHienTruong anh="nen-doc/mua-3.png" mua="m3">
    <Vat moc={[[0, 1, 3]]} />
    <Vat moc={[[0, 3, 3]]} />
    <Xe anh="xich" moc={R_OMNI_VAN_DE} />
    <ChuNay chu="KẸT GÓC QUAY · CHẬM NHỊP!" at={60} den={155} x={540} y={tamO(2, 2).y} mau={C.bad} co={38} />
    <NhanGoi so={1} ten="Bánh Omni" />
    <Mascot who="sola" x={230} h={520} at={0}
      faces={[[0, 'worried'], [65, 'shocked']]}
      says={[{at: 8, out: 92, text: 'Bãi tái chế nhiều đống sắt sát nhau quá, cứ phải quay mũi xe sang ngang mới đi được thì kẹt suốt!'}]}
      bubbleW={550} bubbleTop={1230} />
    <Nguoi anh="sau-nghi" ten="BÁC SƠN" mau="#D97706" x={820} h={600} at={90} side="left" bubbleW={560} bubbleTop={1230}
      says={[{at: 96, out: 185, text: 'Khu phân loại hẹp lắm, xe phải lách ngang sang hai bên mà giữ nguyên hướng mũi mới kịp!'}]} />
  </NenHienTruong>
);

export const CanhOmniLunaChePart: React.FC = () => (
  <TrongXe mua="m3" anh="omni" cach={120} tenPart="Thân bánh Omni"
    sola={[{at: 8, out: 72, text: 'Có loại bánh nào trượt ngang sang trái phải mà không cần quay mũi xe không Luna?'}]}
    luna={[{at: 78, out: 185, text: 'Tớ chế Thân bánh Omni có con lăn chéo rồi đây! Trượt ngang 1 ô cực lẹ mà mặt xe vẫn hướng thẳng phía trước nhé!'}]}
    solaMat={[[0, 'thinking'], [78, 'excited']]}
    lunaMat={[[0, 'confident'], [78, 'happy']]} />
);

/** Cảnh 1 (6.5s = 195f): Cơ chế slide_left() & slide_right() trượt ngang giữ nguyên hướng mũi xe. */
const CanhOmniTruotNgang: React.FC = () => {
  const f = useCurrentFrame();
  const uPhai = mo(f, 25, 80);
  const uTrai = mo(f, 105, 160);
  const xOmni = 385 + uPhai * 2 * O - uTrai * O;

  return (
    <KhungLabLuna huyHieu="PHÒNG LAB XE TRẠM · BỘ PHẬN: THÂN BÁNH OMNI"
      tieuDe="Bánh Omni: slide_left / right() trượt ngang!" accent={['Bánh Omni:', 'trượt ngang!']}
      phuDe="Bốn bánh có con lăn phụ giúp trượt sang trái/phải 1 ô mà mũi xe giữ nguyên hướng">
      <San x={140} y={245} w={800} h={570} o={O} />

      <div style={{position: 'absolute', left: 385, top: 530 - 6, width: 2 * O, height: 12,
        background: 'rgba(219,39,119,0.28)', borderRadius: 999, zIndex: 7}} />

      <div style={{position: 'absolute', left: xOmni - 130, top: 530 - 130, width: 260, height: 260, zIndex: 12}}>
        <Img src={staticFile('robot/lab/omni-co-ban.png')} style={{width: '100%', height: '100%', transform: 'rotate(-90deg)'}} />
      </div>

      <div style={{position: 'absolute', left: 540, top: 272, transform: 'translateX(-50%)', padding: '10px 22px',
        borderRadius: 999, background: C.lunaDeep, color: '#fff', fontSize: 21, fontWeight: 900,
        border: '3px solid #fff', whiteSpace: 'nowrap', zIndex: 15}}>
        Lưu ý: Trượt theo hướng mặt xe (slide_left = bên trái của mũi xe)!
      </div>

      <Burst at={82} x={695} y={530} color={C.good} r={160} />
      <Burst at={162} x={540} y={530} color={C.good} r={160} />

      <CodeBox x={110} y={840} w={860} size={23} title="omni_truot_ngang.py"
        lines={[
          'slide_right(); wait() # Trượt sang phải 1 ô (mặt giữ nguyên)',
          'slide_right(); wait() # Trượt tiếp sang phải 1 ô',
          'slide_left(); wait()  # Trượt sang trái 1 ô (theo hướng xe)',
        ]}
        hl={f < 55 ? 0 : f < 100 ? 1 : 2} hlAt={10} />

      <CongThucLab lenh="slide_left / right() + wait()" coChe="Con lăn chéo trượt ngang" ketQua="Không cần quay mũi!" mau={C.lunaDeep} at={20} y={1115} />

      <Mascot who="luna" x={855} h={490} at={6} side="left" lat
        faces={[[6, 'explaining'], [90, 'happy'], [150, 'thumbs-up']]}
        says={[
          {at: 10, out: 98, text: 'Thân Bánh Omni có đầy đủ các lệnh của xe hai bánh, cộng thêm 2 lệnh slide_left() và slide_right() để trượt ngang 1 ô!'},
          {at: 104, out: 188, text: 'Nhớ kỹ nha: trượt tính theo hướng mặt của xe chứ không phải màn hình, và trong 1 nhịp có trượt thì lệnh bánh thường sẽ bị bỏ!'},
        ]}
        bubbleW={590} bubbleTop={1295} />
      <Mascot who="sola" x={225} h={480} at={12} faces={[[12, 'surprised-sach'], [95, 'celebrate-jump']]} />
    </KhungLabLuna>
  );
};

const BANG_BANH_OMNI = [
  {ma: 'OMNI-01', code: 'slide_right() + wait()', moTa: 'Trượt sang phải 1 ô (theo mặt xe), mũi giữ nguyên', kq: 'Trượt phải 1 ô', icon: 'ArrowRight', mau: C.lunaDeep},
  {ma: 'OMNI-02', code: 'slide_left() + wait()', moTa: 'Trượt sang trái 1 ô (theo mặt xe), mũi giữ nguyên', kq: 'Trượt trái 1 ô', icon: 'ArrowLeft', mau: C.solaDeep},
  {ma: 'OMNI-03', code: 'left/right_move() + wait()', moTa: 'Quay 90° trong 1 nhịp hoặc đi thẳng như xe 2 bánh', kq: 'Quay 90° / Tiến', icon: 'RotateCw', mau: C.good},
  {ma: 'OMNI-04', code: 'Không đi chéo được', moTa: 'Trong nhịp có slide_...() thì các lệnh bánh bị bỏ qua', kq: 'Không đi chéo', icon: 'Slash', mau: C.indigo},
  {ma: 'OMNI-05', code: 'Bánh trơn trên băng chuyền', moTa: 'Đứng trên băng chuyền 1 nhịp đã bị đẩy; không leo thang', kq: 'Trơn 1 nhịp', icon: 'AlertTriangle', mau: '#D97706'},
];

const CanhSoTayBanhOmni: React.FC = () => (
  <KhungLabLuna huyHieu="PHÒNG LAB XE TRẠM · SỔ TAY THÂN BÁNH OMNI"
    tieuDe="Sổ tay 5 Quy tắc Thân Bánh Omni (Mùa 3–4)" accent={['Thân Bánh Omni']}
    phuDe="Lách ngang linh hoạt không cần quay đầu cho Bãi tái chế và Nông trại hoa">
    <div style={{position: 'absolute', left: 45, right: 45, top: 250, display: 'flex', flexDirection: 'column', gap: 16}}>
      {BANG_BANH_OMNI.map((row, i) => (
        <HangSoTayLab key={row.ma} {...row} at={12 + i * 12} />
      ))}
    </div>
    <Mascot who="luna" x={855} h={490} at={8} side="left" lat faces={[[8, 'explaining'], [80, 'thumbs-up']]}
      says={[{at: 14, out: 172, text: 'Lưu ý bánh Omni rất trơn nên đứng trên băng chuyền chỉ 1 nhịp là bị đẩy trôi ngay, đừng đứng lâu trên băng chuyền nhé!'}]} bubbleW={590} bubbleTop={1295} />
    <Mascot who="sola" x={225} h={490} at={14} faces={[[14, 'cheer'], [85, 'celebrate-jump']]} />
  </KhungLabLuna>
);

export const PHIM_BANH_OMNI: Phim = {
  id: 'PhimBanhOmni',
  doc: true,
  canh: [
    {id: 'van-de-omni', dur: 195, el: <CanhOmniVanDe />, sfx: [W_IN, [60, 'wrong.wav', 0.5]]},
    {id: 'luna-che-omni', dur: 195, el: <CanhOmniLunaChePart />, sfx: [[120, 'impact.wav', 0.5], [120, 'ding.wav', 0.4]]},
    {id: 'omni-truot-ngang', dur: 195, el: <CanhOmniTruotNgang />, sfx: [W_IN, [25, 'swish.wav', 0.45], [82, 'ding.wav', 0.6], [105, 'swish.wav', 0.45], [162, 'ding.wav', 0.6]]},
    {id: 'so-tay-banh-omni', dur: 180, el: <CanhSoTayBanhOmni />, sfx: [W_IN, ...pops([12, 24, 36, 48, 60], 0.35), [80, 'ding.wav', 0.6]]},
  ],
};

/* ============================================================================
   2. PHIM_NAM_CHAM — Bộ phận: Nam Châm (nam-cham) & Cảm Biến Từ (tu)
   Bố cục: Vấn đề (Phế liệu sắt nằm xa 2 ô sau rào & lẫn sắt với gỗ) -> Luna chế Nam châm & Cảm biến từ -> Giải thích cơ chế cho Sola
   ========================================================================== */

export const CanhNamChamVanDe: React.FC = () => (
  <NenHienTruong anh="nen-doc/mua-3.png" mua="m3">
    {[0, 1, 2, 3, 4].map((c) => <ODat key={c} ten="o-rao" c={c} r={2} />)}
    <Vat moc={[[0, 2, 1]]} />
    <Xe anh="omni" moc={[[0, 2, 4, -90], [45, 2, 3, -90]]} />
    <ChuNay chu="TAY KẸP KHÔNG VỚI TỚI 2 Ô!" at={50} den={155} x={540} y={tamO(2, 2).y - 40} mau={C.bad} co={36} />
    <NhanGoi so={2} ten="Nam châm & Cảm biến từ" />
    <Mascot who="sola" x={230} h={520} at={0}
      faces={[[0, 'thinking'], [50, 'shocked']]}
      says={[{at: 8, out: 92, text: 'Khối phế liệu sắt nằm cách 2 ô bên kia rào, tay kẹp chỉ với được 1 ô sát cạnh nên chịu thua rồi!'}]}
      bubbleW={550} bubbleTop={1230} />
    <Nguoi anh="sau-tin" ten="BÁC SƠN" mau="#D97706" x={820} h={600} at={90} side="left" bubbleW={560} bubbleTop={1230}
      says={[{at: 96, out: 185, text: 'Trong bãi còn trộn lẫn sắt với gỗ và cả thỏi nam châm nữa, phải phân biệt và hút từ xa mới được!'}]} />
  </NenHienTruong>
);

export const CanhNamChamLunaChePart: React.FC = () => (
  <TrongXe mua="m3" anh="omni-nc" cach={120} tenPart="Nam châm & Cảm biến từ"
    sola={[{at: 8, out: 72, text: 'Làm sao vừa nhận biết sắt hay cực từ, vừa hút được sắt từ cách 2 ô đây Luna?'}]}
    luna={[{at: 78, out: 185, text: 'Tớ chế Nam châm điện chữ U kèm Cảm biến từ rồi đây! Hút sắt xa 2 ô và đẩy/hút cực từ xa tới 3 ô luôn!'}]}
    solaMat={[[0, 'thinking'], [78, 'excited']]}
    lunaMat={[[0, 'confident'], [78, 'happy']]} />
);

/** Cảnh 1 (7s = 210f): Cơ chế Nam châm hút sắt (tầm 2 ô), đẩy/hút cực nam châm (tầm 3 ô) & Cảm biến từ. */
const CanhNamChamChiTiet: React.FC = () => {
  const f = useCurrentFrame();
  // f=25..95: Bật cực N (magnet_n) hút khối sắt từ cách 2 ô (x=695) bay về dính trước mũi xe (x=475)!
  // f=115..185: Bật cực S (magnet_s) cùng cực với nam châm S đẩy văng ra xa 3 ô!
  const uHut = mo(f, 35, 90);
  const xSat = 695 - uHut * 215;

  return (
    <KhungLabLuna huyHieu="PHÒNG LAB XE TRẠM · BỘ PHẬN: NAM CHÂM & CẢM BIẾN TỪ"
      tieuDe="Nam châm: Hút sắt 2 ô · Hút/Đẩy cực từ!" accent={['Hút sắt 2 ô', 'Hút/Đẩy cực từ!']}
      phuDe="magnet_n() (cực Bắc đỏ), magnet_s() (cực Nam xanh), magnet_off() (ngắt điện thả vật)">
      <San x={140} y={245} w={800} h={570} o={O} />

      {/* Từ trường phát sáng từ mũi nam châm */}
      <div style={{position: 'absolute', left: 440, top: 530 - 55, width: 280, height: 110, borderRadius: 999,
        background: f < 110 ? 'radial-gradient(circle, rgba(239,68,68,0.28) 0%, transparent 75%)' : 'radial-gradient(circle, rgba(59,130,246,0.28) 0%, transparent 75%)',
        zIndex: 8}} />

      {/* Khối phế liệu sắt bị hút từ cách 2 ô về dính mũi xe */}
      <div style={{position: 'absolute', left: xSat - 48, top: 530 - 48, width: 96, height: 96, borderRadius: 20,
        background: '#475569', border: '4px solid #E2E8F0', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', zIndex: 11}}>
        <Icon name="Cpu" size={44} color="#38BDF8" stroke={2.8} />
        <span style={{fontSize: 16, fontWeight: 900, color: '#fff', whiteSpace: 'nowrap'}}>SẮT</span>
      </div>

      {/* Robot gắn Nam châm & Cảm biến từ */}
      <div style={{position: 'absolute', left: 340 - 130, top: 530 - 130, width: 260, height: 260, zIndex: 12}}>
        <Img src={staticFile(f < 110 ? 'robot/lab/omni-nam-cham.png' : 'robot/lab/omni-nam-cham-s.png')} style={{width: '100%', height: '100%'}} />
      </div>

      {/* Bảng hiển thị Cảm biến từ ở đỉnh sa bàn */}
      <div style={{position: 'absolute', left: 155, right: 155, top: 272, padding: '12px 18px', borderRadius: 20,
        background: '#0F172A', border: `3px solid ${C.indigo}`, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', zIndex: 15}}>
        <span style={{fontFamily: MONO, fontSize: 19, fontWeight: 900, color: '#fff', whiteSpace: 'nowrap'}}>
          front_metal() == <span style={{color: '#4ADE80'}}>True</span> (≤ 2 ô)
        </span>
        <div style={{width: 2, height: 28, background: '#334155'}} />
        <span style={{fontFamily: MONO, fontSize: 19, fontWeight: 900, color: '#fff', whiteSpace: 'nowrap'}}>
          front_pole() == <span style={{color: '#F87171'}}>"N" / "S"</span> (≤ 3 ô)
        </span>
      </div>

      <Burst at={92} x={480} y={530} color={C.good} r={170} />

      <CodeBox x={110} y={840} w={860} size={23} title="nam_cham_va_cam_bien_tu.py"
        lines={[
          'if front_metal():       # Phía trước <= 2 ô là sắt?',
          '    magnet_n(); wait()  # Bật cực N hút sắt về mũi xe!',
          'magnet_off(); wait()    # Ngắt điện -> Thả vật ở ô trước mũi',
        ]}
        hl={f < 35 ? 0 : f < 110 ? 1 : 2} hlAt={10} />

      <CongThucLab lenh="magnet_n / s / off() + wait()" coChe="Hút sắt 2 ô · Cực từ 3 ô" ketQua="Hút / Đẩy từ xa!" mau={C.indigo} at={22} y={1115} />

      <Mascot who="luna" x={855} h={490} at={6} side="left" lat
        faces={[[6, 'explaining'], [95, 'happy'], [155, 'thumbs-up']]}
        says={[
          {at: 10, out: 102, text: 'Nam châm chữ U hút được vật sắt cách xa tới 2 ô về dính ngay trước mũi xe, nhưng không hút được thùng gỗ đâu nha!'},
          {at: 108, out: 204, text: 'Còn với vật có từ tính trong tầm 3 ô: khác cực thì hút lại, cùng cực thì đẩy ra xa! Muốn thả vật thì gọi magnet_off() + wait()!'},
        ]}
        bubbleW={590} bubbleTop={1295} />
      <Mascot who="sola" x={225} h={480} at={12} faces={[[12, 'surprised-sach'], [95, 'celebrate-jump']]} />
    </KhungLabLuna>
  );
};

const BANG_NAM_CHAM = [
  {ma: 'TU-01', code: 'magnet_n() / magnet_s() + wait()', moTa: 'Bật cực Bắc (đỏ) hoặc Nam (xanh) · Hút sắt cách 2 ô', kq: 'Hút sắt ≤ 2 ô', icon: 'Magnet', mau: C.bad},
  {ma: 'TU-02', code: 'Khác cực HÚT · Cùng cực ĐẨY', moTa: 'Tương tác với vật nam châm phía trước trong tầm 3 ô', kq: 'Tầm xa 3 ô', icon: 'Repeat', mau: C.solaDeep},
  {ma: 'TU-03', code: 'magnet_off() + wait()', moTa: 'Ngắt điện nam châm, thả vật xuống ô ngay trước mũi', kq: 'Thả vật xuống', icon: 'PowerOff', mau: '#64748B'},
  {ma: 'TU-04', code: 'front_metal()', moTa: 'Cảm biến từ hỏi vật gần nhất ≤ 2 ô có phải sắt không', kq: 'True / False', icon: 'Cpu', mau: C.indigo},
  {ma: 'TU-05', code: 'front_pole()', moTa: 'Cảm biến từ hỏi cực của nam châm gần nhất trong 3 ô', kq: '"N" / "S" / "none"', icon: 'Compass', mau: C.good},
];

const CanhSoTayNamCham: React.FC = () => (
  <KhungLabLuna huyHieu="PHÒNG LAB XE TRẠM · SỔ TAY NAM CHÂM & CẢM BIẾN TỪ"
    tieuDe="Sổ tay Nam Châm & Cảm Biến Từ (Mùa 3)" accent={['Nam Châm & Cảm Biến Từ']}
    phuDe="Phân loại sắt, gỗ và điều khiển lực từ trường từ xa trong Bãi tái chế">
    <div style={{position: 'absolute', left: 45, right: 45, top: 250, display: 'flex', flexDirection: 'column', gap: 16}}>
      {BANG_NAM_CHAM.map((row, i) => (
        <HangSoTayLab key={row.ma} {...row} at={12 + i * 12} />
      ))}
    </div>
    <Mascot who="luna" x={855} h={490} at={8} side="left" lat faces={[[8, 'explaining'], [80, 'thumbs-up']]}
      says={[{at: 14, out: 172, text: 'Lưu ý: khi gắn trên Nhện hoặc Drone ở các mùa sau, nam châm sẽ treo dưới bụng để hút vật ngay ô bên dưới nhé!'}]} bubbleW={590} bubbleTop={1295} />
    <Mascot who="sola" x={225} h={490} at={14} faces={[[14, 'cheer'], [85, 'celebrate-jump']]} />
  </KhungLabLuna>
);

export const PHIM_NAM_CHAM: Phim = {
  id: 'PhimNamCham',
  doc: true,
  canh: [
    {id: 'van-de-nam-cham', dur: 195, el: <CanhNamChamVanDe />, sfx: [W_IN, [50, 'wrong.wav', 0.5]]},
    {id: 'luna-che-nam-cham', dur: 195, el: <CanhNamChamLunaChePart />, sfx: [[120, 'impact.wav', 0.5], [120, 'ding.wav', 0.4]]},
    {id: 'nam-cham-chi-tiet', dur: 210, el: <CanhNamChamChiTiet />, sfx: [W_IN, [35, 'swish.wav', 0.5], [92, 'ding.wav', 0.7]]},
    {id: 'so-tay-nam-cham', dur: 180, el: <CanhSoTayNamCham />, sfx: [W_IN, ...pops([12, 24, 36, 48, 60], 0.35), [80, 'ding.wav', 0.6]]},
  ],
};

/* ============================================================================
   3. PHIM_GIEO_HAT — Bộ phận: Bộ Gieo Hạt (son) & Cảm Biến Màu / Camera (color)
   Bố cục: Vấn đề (Luống đất Nông trại cần gieo 4 màu hoa theo ô mẫu) -> Luna chế Bộ gieo hạt & Camera màu -> Giải thích cơ chế cho Sola
   ========================================================================== */

export const CanhGieoHatVanDe: React.FC = () => (
  <NenHienTruong anh="nen-doc/mua-4.png" mua="m5">
    {[0, 1, 2, 3, 4].map((c) => <ODat key={c} ten="o-dich" c={c} r={2} />)}
    <Xe anh="omni" moc={[[0, 1, 4, -90], [50, 1, 2, -90]]} />
    <ChuNay chu="CHƯA CÓ BỘ GIEO HẠT & MẮT ĐỌC MÀU!" at={55} den={155} x={540} y={tamO(2, 2).y - 50} mau={C.bad} co={32} />
    <NhanGoi so={1} ten="Bộ gieo hạt & Đọc màu" />
    <Mascot who="sola" x={230} h={520} at={0}
      faces={[[0, 'thinking'], [55, 'worried']]}
      says={[{at: 8, out: 92, text: 'Luống đất cần gieo 4 màu hoa Tết theo vạch mẫu, mà R1 chưa biết đọc màu cũng chưa có bầu gieo hạt!'}]}
      bubbleW={550} bubbleTop={1230} />
    <Nguoi anh="lan-tin" ten="CHỊ LAN" mau="#EC4899" x={820} h={600} at={90} side="left" bubbleW={560} bubbleTop={1230}
      says={[{at: 96, out: 185, text: 'Mỗi ô mẫu một màu hoa khác nhau, phải đọc đúng màu mẫu rồi chọn đúng hạt hoa để gieo nhé!'}]} />
  </NenHienTruong>
);

export const CanhGieoHatLunaChePart: React.FC = () => (
  <TrongXe mua="m5" anh="du" cach={120} tenPart="Bộ gieo hạt & Camera màu"
    sola={[{at: 8, out: 72, text: 'Làm sao để R1 vừa đọc được màu vạch mẫu vừa gieo 4 loại hạt hoa đây Luna?'}]}
    luna={[{at: 78, out: 185, text: 'Tớ lắp Bộ gieo hạt 4 ngăn màu cùng Cảm biến màu & Tháp Camera cho R1 rồi đây! Để tớ chỉ cậu cách dùng nhé!'}]}
    solaMat={[[0, 'thinking'], [78, 'excited']]}
    lunaMat={[[0, 'confident'], [78, 'happy']]} />
);

/** Cảnh 1 (7s = 210f): Bộ gieo hạt ink(), dot(), pen_down(), pen_up() & 3 loại mắt đọc color(). */
const CanhGieoHatVaCamera: React.FC = () => {
  const f = useCurrentFrame();
  const uDi = mo(f, 35, 135);
  const xRobot = 230 + uDi * 3 * O;

  const MAU_HOA = [
    {x: 230, ten: '"red"', hoa: 'Hoa hồng', mau: '#EF4444'},
    {x: 385, ten: '"yellow"', hoa: 'Hoa cúc', mau: '#EAB308'},
    {x: 540, ten: '"blue"', hoa: 'Cẩm tú cầu', mau: '#3B82F6'},
    {x: 695, ten: '"green"', hoa: 'Cỏ ba lá', mau: '#10B981'},
  ];

  return (
    <KhungLabLuna huyHieu="PHÒNG LAB XE TRẠM · BỘ PHẬN: BỘ GIEO HẠT & CAMERA MÀU"
      tieuDe="Bộ Gieo Hạt: ink() · pen_down() · color()!" accent={['ink()', 'pen_down()', 'color()!']}
      phuDe="Hạ miệng gieo pen_down() thì đi tới đâu gieo hoa tới đó — ink() chọn màu hạt 0 tốn nhịp">
      <San x={140} y={245} w={800} h={570} o={O} />

      {/* 4 ô hoa theo đúng 4 màu chuẩn của Mùa 4 */}
      {MAU_HOA.map((h) => {
        const daGieo = xRobot >= h.x - 15;
        return (
          <div key={h.x} style={{position: 'absolute', left: h.x - 62, top: 530 - 62, width: 124, height: 124, borderRadius: 22,
            background: daGieo ? `${h.mau}22` : '#F8FAFC', border: `4px ${daGieo ? 'solid' : 'dashed'} ${h.mau}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 8}}>
            <Icon name="Flower2" size={44} color={daGieo ? h.mau : '#CBD5E1'} stroke={2.8} />
            <span style={{fontFamily: MONO, fontSize: 16, fontWeight: 900, color: h.mau, whiteSpace: 'nowrap'}}>{h.ten}</span>
          </div>
        );
      })}

      {/* Robot gắn Bộ gieo hạt + Tháp Camera 4 hướng */}
      <div style={{position: 'absolute', left: xRobot - 125, top: 530 - 125, width: 250, height: 250, zIndex: 12}}>
        <Img src={staticFile('robot/lab/omni-camera-4.png')} style={{width: '100%', height: '100%'}} />
      </div>

      {/* Bảng phân biệt 3 loại mắt đọc color() trên đỉnh sa bàn */}
      <div style={{position: 'absolute', left: 155, right: 155, top: 268, padding: '12px 20px', borderRadius: 20,
        background: '#0F172A', border: `3px solid ${C.good}`, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', zIndex: 15}}>
        <span style={{fontSize: 19, fontWeight: 800, color: '#A7F3D0', whiteSpace: 'nowrap'}}>Bụng: color() dưới sàn</span>
        <span style={{fontSize: 19, fontWeight: 800, color: '#FDE047', whiteSpace: 'nowrap'}}>Cam trước: color() ô trước</span>
        <span style={{fontSize: 19, fontWeight: 800, color: '#Ffe4e6', whiteSpace: 'nowrap'}}>Cam 4 hướng: color("left")</span>
      </div>

      <Burst at={138} x={695} y={530} color={C.good} r={175} />

      <CodeBox x={110} y={840} w={860} size={22.5} title="gieo_hat_va_doc_mau.py"
        lines={[
          'ink("red")                 # Chọn hạt hoa hồng (0 tốn nhịp)',
          'pen_down(); wait()         # Hạ miệng gieo: đi đâu gieo đó!',
          'if color("left") == "blue":# Camera 4 hướng nhìn sang trái',
          '    ink("blue"); dot()     # Đổi hạt cẩm tú cầu & gieo!',
        ]}
        hl={f < 35 ? 0 : f < 110 ? 1 : 2} hlAt={10} />

      <CongThucLab lenh="ink(mau) -> dot() / pen_down()" coChe="4 màu hoa · 3 loại mắt color()" ketQua="Gieo chuẩn mẫu!" mau={C.good} at={22} y={1115} />

      <Mascot who="luna" x={855} h={490} at={6} side="left" lat
        faces={[[6, 'explaining'], [95, 'happy'], [155, 'thumbs-up']]}
        says={[
          {at: 10, out: 102, text: 'Ở Nông trại Mùa 4, lệnh ink() chọn 1 trong 4 loại hạt không tốn nhịp: "red" hoa hồng, "yellow" hoa cúc, "blue" cẩm tú cầu, "green" cỏ ba lá!'},
          {at: 108, out: 204, text: 'Gọi dot() để gieo 1 ô, hoặc pen_down() để đi tới đâu gieo liền tới đó! Nhớ xem xe đang lắp cảm biến bụng, camera trước hay camera 4 hướng khi gọi color() nhé!'},
        ]}
        bubbleW={590} bubbleTop={1295} />
      <Mascot who="sola" x={225} h={480} at={12} faces={[[12, 'surprised-sach'], [135, 'celebrate-jump']]} />
    </KhungLabLuna>
  );
};

const BANG_GIEO_HAT = [
  {ma: 'SON-01', code: 'ink("red"|"yellow"|"blue"|"green")', moTa: 'Chọn loại hạt hoa ngay lập tức · Không tốn nhịp wait()', kq: '0 tốn nhịp', icon: 'Palette', mau: '#EC4899'},
  {ma: 'SON-02', code: 'dot() + wait()', moTa: 'Gieo hạt vào đúng 1 ô mà robot đang đứng', kq: 'Gieo 1 ô', icon: 'Sprout', mau: C.good},
  {ma: 'SON-03', code: 'pen_down() / pen_up() + wait()', moTa: 'Hạ miệng gieo để đi/trượt/quay tới đâu gieo liền tới đó', kq: 'Gieo liền hàng', icon: 'Edit3', mau: C.solaDeep},
  {ma: 'SON-04', code: 'color() (Cảm biến bụng / Cam trước)', moTa: 'Bụng đọc sàn dưới chân · Camera trước đọc ô trước mũi', kq: 'Đọc màu 0 nhịp', icon: 'Eye', mau: C.indigo},
  {ma: 'SON-05', code: 'color("front"|"left"|"right"|"back")', moTa: 'Tháp Camera 4 hướng bắt buộc phải ghi hướng cần nhìn', kq: 'Nhìn 4 hướng', icon: 'Camera', mau: '#D97706'},
];

const CanhSoTayGieoHat: React.FC = () => (
  <KhungLabLuna huyHieu="PHÒNG LAB XE TRẠM · SỔ TAY BỘ GIEO HẠT & CAMERA"
    tieuDe="Sổ tay Bộ Gieo Hạt & Đọc Màu (Mùa 4)" accent={['Bộ Gieo Hạt & Đọc Màu']}
    phuDe="Nắm trọn cơ chế gieo hoa và 3 biến thể của hàm color() trên Nông trại">
    <div style={{position: 'absolute', left: 45, right: 45, top: 250, display: 'flex', flexDirection: 'column', gap: 16}}>
      {BANG_GIEO_HAT.map((row, i) => (
        <HangSoTayLab key={row.ma} {...row} at={12 + i * 12} />
      ))}
    </div>
    <Mascot who="luna" x={855} h={490} at={8} side="left" lat faces={[[8, 'explaining'], [80, 'thumbs-up']]}
      says={[{at: 14, out: 172, text: 'Cẩn thận đừng gieo ra ngoài luống vì gieo nhầm không nhổ lại được; còn gieo đè lên ô đã có hoa thì hoa mới sẽ thay hoa cũ nhé!'}]} bubbleW={590} bubbleTop={1295} />
    <Mascot who="sola" x={225} h={490} at={14} faces={[[14, 'cheer'], [85, 'celebrate-jump']]} />
  </KhungLabLuna>
);

export const PHIM_GIEO_HAT: Phim = {
  id: 'PhimGieoHat',
  doc: true,
  canh: [
    {id: 'van-de-gieo-hat', dur: 195, el: <CanhGieoHatVanDe />, sfx: [W_IN, [55, 'wrong.wav', 0.5]]},
    {id: 'luna-che-gieo-hat', dur: 195, el: <CanhGieoHatLunaChePart />, sfx: [[120, 'impact.wav', 0.5], [120, 'ding.wav', 0.4]]},
    {id: 'gieo-hat-va-camera', dur: 210, el: <CanhGieoHatVaCamera />, sfx: [W_IN, [35, 'swish.wav', 0.45], [138, 'ding.wav', 0.7]]},
    {id: 'so-tay-gieo-hat', dur: 180, el: <CanhSoTayGieoHat />, sfx: [W_IN, ...pops([12, 24, 36, 48, 60], 0.35), [80, 'ding.wav', 0.6]]},
  ],
};
