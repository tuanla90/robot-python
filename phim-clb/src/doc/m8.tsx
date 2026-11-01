// 10 phim gói mùa 8 "Về CLB · Giải cứu thị trấn", khổ dọc, theo hoc/KICH-BAN-PHIM-GOI-CLB.md bản 3 mục 9:
// mỗi gói hai phim: M8G<n>-Mo (phim mở) và M8G<n>-Ket (đoạn kết sau màn trùm).
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Burst, C, CodeBox, FONT, Icon, Mascot, MONO, Say, Shake, pop} from '../d10';
import {Phim, W_IN} from '../may-phim';
import {BangViec, CauTreo, ChuNay, Moc, NenHienTruong, NhanGoi, Nguoi, O, ODat, TrongXe, Vat, Xe, chonDangNguoi, tamO} from './kit-doc';

const NEN = 'nen-doc/mua-7.png';
const DON = [
  'Thân lai Nhện+Kẹp mở cửa ngõ chú Tư', 'Tay lai Xích+Máy ném đón xe cô Hạnh', 'Cảm biến lai dẫn xe hoa chị Lan', 'Xuồng+Nam châm khơi dòng lũ qua phố', 'Omni+Dây kéo vượt mưa đón anh Dũng',
  'Drone+Nam châm dựng lại cổng chào CLB', 'Omni+Loa Sonar mở cửa hầm chú Phong', 'Tổng dọn sân trường CLB trước lễ', 'Song kiếm hợp bích Sola-Bot & Luna-Bot', 'Khai mạc Ngày hội Robot toàn thị trấn',
];

/** Thầy hiệu trưởng chủ nhiệm CLB Robot (ảnh TopView tách nền). */
const Thay: React.FC<{says: Say[]; at?: number; x?: number; side?: 'left' | 'right'; dang?: string}> = ({says, at = 0, x = 820, side = 'left', dang = 'thay-tu-hao'}) => (
  <Nguoi anh={dang} ten="THẦY HIỆU TRƯỞNG" mau="#2563EB" x={x} h={600} at={at} says={says} side={side} bubbleW={560} bubbleTop={1230} />
);
const Sola: React.FC<{says: Say[]; mat: [number, string][]; at?: number; x?: number}> = ({says, mat, at = 0, x = 240}) => (
  <Mascot who="sola" x={x} h={540} at={at} faces={mat} says={says} bubbleW={520} bubbleTop={1240} />
);
const Luna: React.FC<{says: Say[]; mat: [number, string][]; at?: number; x?: number}> = ({says, mat, at = 0, x = 840}) => (
  <Mascot who="luna" x={x} h={540} at={at} faces={mat} says={says} side="left" bubbleW={520} bubbleTop={1240} lat />
);

/** Đồng hồ đếm ngược tới giờ khai mạc Ngày hội Robot góc trên trái. */
const GioKhaiMacBar: React.FC<{con: string; gap?: boolean}> = ({con, gap}) => {
  const f = useCurrentFrame();
  const nhay = gap && Math.floor(f / 10) % 2 === 0;
  return (
    <div style={{position: 'absolute', left: 36, top: 44, display: 'flex', alignItems: 'center', gap: 14, padding: '12px 24px', borderRadius: 999,
      background: nhay ? C.bad : '#fff', color: nhay ? '#fff' : C.ink, border: `4px solid ${C.ink}`, boxShadow: `0 8px 0 ${C.ink}`, fontFamily: MONO, fontWeight: 800, fontSize: 36}}>
      <Icon name="Trophy" size={40} color={nhay ? '#fff' : '#2563EB'} stroke={2.6} />
      <span>{con}</span>
    </div>
  );
};

/** Bốn khu vực cửa ngõ thị trấn trên bảng thành tựu chuyển từ đỏ sang xanh 0%..100%. */
const CuaNgoBar: React.FC<{xong: [number, number, number, number]; bao?: boolean}> = ({xong, bao}) => {
  const CUA = [
    {ten: 'Ngõ Đông', mau: '#2563EB', nen: '#DBEAFE'},
    {ten: 'Ngõ Tây', mau: '#0D9488', nen: '#CCFBF1'},
    {ten: 'Ngõ Nam', mau: '#D97706', nen: '#FEF3C7'},
    {ten: 'Sân CLB', mau: '#16A34A', nen: '#DCFCE7'},
  ];
  return (
    <div style={{position: 'absolute', left: 90, top: 150, width: 900, display: 'flex', gap: 14}}>
      {CUA.map((c, i) => (
        <div key={c.ten} style={{flex: 1, padding: '12px 14px', borderRadius: 20, background: bao && i === 3 ? '#FEE2E2' : c.nen,
          border: `4px solid ${C.ink}`, boxShadow: `0 8px 0 ${C.ink}`, fontFamily: FONT, fontWeight: 800, fontSize: 22, color: C.ink, whiteSpace: 'nowrap'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 8}}>
            <span>{c.ten}</span><span>{xong[i]}%</span>
          </div>
          <div style={{height: 14, borderRadius: 99, background: '#fff', border: `3px solid ${C.ink}`, overflow: 'hidden'}}>
            <div style={{width: `${xong[i]}%`, height: '100%', background: c.mau}} />
          </div>
        </div>
      ))}
    </div>
  );
};

/** Đoạn kết chung mùa 8: 4 cửa ngõ + bảng tiến độ + giờ khai mạc + Thầy hiệu trưởng. */
const ThanhTuu: React.FC<{moi: number; loi: string; con: string; so: number; ten: string; xong: [number, number, number, number]; xoa?: number}> =
  ({moi, loi, con, so, ten, xong, xoa}) => (
    <NenHienTruong anh={NEN} mua="m8" luoi={false} toi={0.52}>
      <CuaNgoBar xong={xong} bao={xoa !== undefined} />
      <BangViec tieuDe="Bản đồ giải cứu 7 cửa ngõ & Ngày hội Robot CLB" dong={DON} xong={moi} moi={moi} xoa={xoa} at={22} y={270} />
      <GioKhaiMacBar con={con} gap={xoa !== undefined} />
      <NhanGoi so={so} ten={ten} />
      <Thay dang={chonDangNguoi('thay', so, xoa)} says={[{at: 48, out: 200, text: loi}]} at={28} />
    </NenHienTruong>
  );

/** Cổng chào lễ hội góc trên phải (4, 0) rung nhẹ trước gió bão; đến gói 6 gió giật làm nghiêng cổng. */
const CongChaoGoc: React.FC<{nghieng?: boolean}> = ({nghieng}) => {
  const f = useCurrentFrame(), p = tamO(4, 0);
  const g = nghieng ? 25 : 4 * Math.sin(f / 6);
  return (
    <div style={{position: 'absolute', left: p.x - O * 0.44, top: p.y - O * 0.42, width: O * 0.88, height: O * 0.84, borderRadius: 16,
      background: nghieng ? 'linear-gradient(135deg, #EF4444, #991B1B)' : 'linear-gradient(135deg, #2563EB, #1D4ED8)',
      border: `4px solid ${C.ink}`, transform: `rotate(${g}deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <Icon name="Sparkles" size={46} color="#fff" />
    </div>
  );
};

/* ================================================================== GÓI 1 · Thân lai: Nhện (M3) + Tay gắp (M1) đón chú Tư */
const R_G1M: Moc[] = [[0, 0, 3, 0], [55, 1.5, 3, 0], [95, 1.5, 3, 25]];
const G1Mo: React.FC = () => (
  <Shake hits={[58]} amp={10}>
    <NenHienTruong anh={NEN} mua="m8">
      <CongChaoGoc />
      <ODat ten="o-ho" c={2} r={3} />
      <ODat ten="o-dich" c={4} r={3} />
      <Vat ten="vat-thung-go" moc={[[0, 3, 3, 0]]} />
      <Xe anh="banh-ngac" moc={R_G1M} />
      <ChuNay chu="CẦU GÃY HỐ SÂU!" at={58} den={140} x={tamO(2, 3).x + 80} y={tamO(2, 3).y - 40} />
      <GioKhaiMacBar con="Khai mạc: 10 giờ" />
      <NhanGoi so={1} ten="Thân lai: Nhện + Tay gắp" />
      <Nguoi anh="tu-hoang" ten="CHÚ TƯ" mau="#D97706" x={820} h={600} at={45} side="left" bubbleW={560} bubbleTop={1230}
        says={[{at: 58, out: 175, text: 'Cầu gỗ ở cửa ngõ Kho hàng gãy thành hố sâu rồi, xe hai bánh không qua lấy kiện hàng dự hội được!'}]} />
    </NenHienTruong>
  </Shake>
);
const R_G1K: Moc[] = [[0, 1, 3, 0], [35, 1, 3, 0], [75, 3, 3, 0], [135, 4, 3, 0]];
const T_G1K: Moc[] = [[0, 3, 3, 0], [80, 3, 3, 0], [135, 4, 3, 0], [160, 4, 3, 0]];
const G1Lam: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m8">
    <CongChaoGoc />
    <ODat ten="o-ho" c={2} r={3} />
    <ODat ten="o-dich" c={4} r={3} />
    <Vat ten="vat-thung-go" moc={T_G1K} />
    <Xe anh="lai-nhen-kep" moc={R_G1K} />
    <Burst x={tamO(4, 3).x} y={tamO(4, 3).y} at={138} />
    <CodeBox lines={['# Ghép Thân nhện (M3) + Tay gắp (M1)', 'jump()      # nhảy vọt qua hố cầu gãy', 'grab()      # gắp thùng hàng chú Tư', 'move(); drop()']}
      typeAt={35} x={44} y={260} w={580} title="lai_nhen_kep.py" />
    <NhanGoi so={1} ten="Thân lai: Nhện + Tay gắp" />
    <Sola mat={[[0, 'proud'], [135, 'happy']]} says={[{at: 18, out: 118, text: 'Lấy Thân nhện mùa 3 ghép với Tay gắp mùa 1: nhảy qua hố cầu gãy rồi gắp gọn kiện hàng!'}, {at: 135, out: 205, text: 'Đón chú Tư vào hội!'}]} />
  </NenHienTruong>
);

/* ================================================================== GÓI 2 · Tay lai: Thân xích (M2) + Máy ném (M6) đón cô Hạnh */
const R_G2M: Moc[] = [[0, 1, 3, 0], [55, 1.6, 3, 0], [95, 1.6, 3, 15]];
const G2Mo: React.FC = () => (
  <Shake hits={[58]} amp={10}>
    <NenHienTruong anh={NEN} mua="m8">
      <CongChaoGoc />
      <ODat ten="o-rao" c={2} r={3} />
      <ODat ten="o-dich" c={4} r={3} />
      <Vat ten="vat-da-tron" moc={[[0, 1, 3, 0]]} />
      <Xe anh="banh-ngac" moc={R_G2M} />
      <ChuNay chu="ĐÁ CHẮN TRƯỚC RÀO!" at={58} den={140} x={tamO(2, 3).x + 70} y={tamO(2, 3).y - 40} />
      <GioKhaiMacBar con="Khai mạc: 9 giờ" />
      <NhanGoi so={2} ten="Tay lai: Xích + Máy ném" />
      <Nguoi anh="hanh-hoang" ten="CÔ HẠNH" mau="#DC2626" x={820} h={600} at={45} side="left" bubbleW={560} bubbleTop={1230}
        says={[{at: 58, out: 175, text: 'Bão làm đá lăn chắn trước hàng rào cổng Nhà máy, phải dùng bánh xích và tay máy ném mới hất qua rào được!'}]} />
    </NenHienTruong>
  </Shake>
);
const R_G2K: Moc[] = [[0, 0, 3, 0], [45, 1, 3, 0], [160, 1, 3, 0]];
const D_G2K: Moc[] = [[0, 1.35, 3, 0], [55, 1.35, 3, 0], [105, 4, 3, 0], [160, 4, 3, 0]];
const G2Lam: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m8">
    <CongChaoGoc />
    <ODat ten="o-rao" c={2} r={3} />
    <ODat ten="o-dich" c={4} r={3} />
    <Vat ten="vat-da-tron" moc={D_G2K} />
    <Xe anh="lai-xich-nem" moc={R_G2K} />
    <Burst x={tamO(4, 3).x} y={tamO(4, 3).y} at={106} />
    <CodeBox lines={['# Thân xích (M2) + Tay máy ném (M6)', 'move()', 'load()', 'aim(3); throw()  # hất đá vượt rào']}
      typeAt={50} x={44} y={260} w={570} title="lai_xich_nem.py" />
    <NhanGoi so={2} ten="Tay lai: Xích + Máy ném" />
    <Luna mat={[[0, 'wink'], [106, 'happy']]} says={[{at: 18, out: 112, text: 'Thân xích lì đòn của mùa 2 gắn thêm Máy ném mùa 6: ủi tới sát rào rồi hất tảng đá bay vọt qua!'}, {at: 115, out: 205, text: 'Đón cô Hạnh thông suốt!'}]} />
  </NenHienTruong>
);

/* ================================================================== GÓI 3 · Cảm biến lai: Bánh gai (M7) + Camera 4 hướng (M5) đón chị Lan */
const R_G3M: Moc[] = [[0, 1, 3, 0], [55, 2, 3, 180], [95, 2, 4, 290]];
const G3Mo: React.FC = () => (
  <Shake hits={[58]} amp={9}>
    <NenHienTruong anh={NEN} mua="m8">
      <CongChaoGoc />
      {[1, 2, 3].map((c) => <ODat key={c} ten="o-da-uot" c={c} r={3} />)}
      <ODat ten="o-san-do" c={2} r={2} />
      <Xe anh="banh-ngac" moc={R_G3M} />
      <ChuNay chu="ĐƯỜNG TRƠN & LẠC MÀU!" at={58} den={140} x={tamO(2, 3).x + 70} y={tamO(2, 3).y - 40} />
      <GioKhaiMacBar con="Khai mạc: 8 giờ" />
      <NhanGoi so={3} ten="Cảm biến lai: Gai + Camera" />
      <Nguoi anh="lan-sot-ruot" ten="CHỊ LAN" mau="#EC4899" x={820} h={600} at={45} side="left" bubbleW={560} bubbleTop={1230}
        says={[{at: 58, out: 175, text: 'Mưa bão làm hầm chui vừa trơn trượt vừa ngập bùn che vạch màu, xe chở hoa Tết của chị chưa dám qua!'}]} />
    </NenHienTruong>
  </Shake>
);
const R_G3K: Moc[] = [[0, 1, 3, 0], [45, 2, 3, -90], [95, 2, 2, 0], [145, 3, 2, 0]];
const G3Lam: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m8">
    <CongChaoGoc />
    {[1, 2, 3].map((c) => <ODat key={c} ten="o-da-uot" c={c} r={3} />)}
    <ODat ten="o-san-do" c={2} r={2} />
    <ODat ten="o-dich" c={3} r={2} />
    <Xe anh="lai-gai-cam" moc={R_G3K} />
    <Burst x={tamO(3, 2).x} y={tamO(3, 2).y} at={145} />
    <CodeBox lines={['# Bánh gai (M7) + Camera 4 hướng (M5)', 'if color("up") == "red":', '    up_move()', '    ink("red"); dot()']}
      typeAt={40} x={44} y={260} w={580} title="lai_gai_camera.py" />
    <NhanGoi so={3} ten="Cảm biến lai: Gai + Camera" />
    <Sola mat={[[0, 'proud'], [142, 'happy']]} says={[{at: 18, out: 118, text: 'Bánh gai mùa 7 bám chặt mặt hầm trơn, còn Camera 4 hướng mùa 5 nhìn vạch màu dẫn xe hoa chị Lan!'}, {at: 140, out: 205, text: 'Xe hoa vào hội an toàn!'}]} />
  </NenHienTruong>
);

/* ================================================================== GÓI 4 · Xuồng (M4) + Nam châm (M3) đón bác Ba & bác Sáu */
const R_G4M: Moc[] = [[0, 1, 3, 0], [55, 2, 4, 25], [95, 2, 4.5, 40]];
const G4Mo: React.FC = () => (
  <Shake hits={[58]} amp={10}>
    <NenHienTruong anh={NEN} mua="m8">
      <CongChaoGoc />
      {[1, 2, 3].map((c) => <ODat key={c} ten="o-nuoc" c={c} r={3} />)}
      <Vat ten="vat-khoi-sat" moc={[[0, 3, 3, 0]]} />
      <Xe anh="banh-ngac" moc={R_G4M} />
      <ChuNay chu="NƯỚC TRÀN & KẸT SẮT!" at={58} den={140} x={tamO(2, 3).x + 70} y={tamO(2, 3).y - 40} />
      <GioKhaiMacBar con="Khai mạc: 7 giờ" />
      <NhanGoi so={4} ten="Xuồng + Nam châm điện" />
      <Nguoi anh="ba-hoang" ten="BÁC BA" mau="#0284C7" x={820} h={600} at={45} side="left" bubbleW={560} bubbleTop={1230}
        says={[{at: 58, out: 175, text: 'Nước lũ tràn qua phố cuốn khối sắt của bác Sáu chắn miệng cống thoát nước rồi, cần xuồng có nam châm hút ngay!'}]} />
    </NenHienTruong>
  </Shake>
);
const R_G4K: Moc[] = [[0, 1, 3, 0], [45, 2, 3, 0], [150, 2, 3, 0]];
const S_G4K: Moc[] = [[0, 4, 3, 0], [50, 4, 3, 0], [105, 3, 3, 0], [160, 3, 3, 0]];
const G4Lam: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m8">
    <CongChaoGoc />
    {[1, 2, 3].map((c) => <ODat key={c} ten="o-nuoc" c={c} r={3} />)}
    <ODat ten="o-dich" c={3} r={3} />
    <Vat ten="vat-khoi-sat" moc={S_G4K} />
    <Xe anh="lai-xuong-tu" moc={R_G4K} />
    <Burst x={tamO(3, 3).x} y={tamO(3, 3).y} at={108} />
    <CodeBox lines={['# Thân xuồng (M4) + Nam châm (M3)', 'h, s = flow()', 'move(1 - s)', 'pull("N")  # hút khối sắt giữa dòng nước']}
      typeAt={45} x={44} y={260} w={590} title="lai_xuong_nam_cham.py" />
    <NhanGoi so={4} ten="Xuồng + Nam châm điện" />
    <Luna mat={[[0, 'wink'], [108, 'happy']]} says={[{at: 18, out: 112, text: 'Thân xuồng mùa 4 lướt trên dòng nước ngập, bật Nam châm mùa 3 hút gọn khối sắt mở thông cống phố!'}, {at: 115, out: 205, text: 'Đón bác Ba và bác Sáu!'}]} />
  </NenHienTruong>
);

/* ================================================================== GÓI 5 · Thời tiết 1 (Mưa lớn): Omni (M6) + Dây kéo (M4) đón anh Dũng */
const R_G5M: Moc[] = [[0, 1, 4, -90], [60, 2, 3, -90], [95, 2, 4, 25]];
const G5Mo: React.FC = () => (
  <Shake hits={[60]} amp={10}>
    <NenHienTruong anh={NEN} mua="m8">
      <CongChaoGoc />
      <Vat ten="vat-da-tron" moc={[[0, 2, 1, 0], [60, 2, 3, 180]]} />
      <Vat ten="vat-thung-go" moc={[[0, 4, 2, 0]]} />
      <Xe anh="banh-ngac" moc={R_G5M} />
      <ChuNay chu="MƯA LỚN ĐÁ LĂN!" at={60} den={140} x={tamO(2, 3).x + 80} y={tamO(2, 3).y - 40} />
      <GioKhaiMacBar con="Khai mạc: 6 giờ" />
      <NhanGoi so={5} ten="Omni + Dây kéo vượt mưa" />
      <Nguoi anh="dung-sot-ruot" ten="ANH DŨNG" mau="#D97706" x={820} h={600} at={45} side="left" bubbleW={560} bubbleTop={1230}
        says={[{at: 58, out: 175, text: 'Mưa lớn làm đá tròn lăn chắn dốc, cần bánh Omni đi chéo né đá kết hợp dây phao kéo kiện đá mẫu về!'}]} />
    </NenHienTruong>
  </Shake>
);
const R_G5K: Moc[] = [[0, 1, 4, -90], [45, 2, 2, 0], [150, 2, 2, 0]];
const T_G5K: Moc[] = [[0, 4, 2, 0], [55, 4, 2, 0], [110, 3, 2, 0], [160, 3, 2, 0]];
const G5Lam: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m8">
    <CongChaoGoc />
    <ODat ten="o-dich" c={3} r={2} />
    <Vat ten="vat-da-tron" moc={[[0, 1, 1, 0], [90, 1, 4, 180]]} />
    <Vat ten="vat-thung-go" moc={T_G5K} />
    <Xe anh="lai-omni-keo" moc={R_G5K} />
    <Burst x={tamO(3, 2).x} y={tamO(3, 2).y} at={112} />
    <CodeBox lines={['# Thân Omni (M6) + Dây kéo (M4)', 'diag_up_right()  # né đá lăn 1 nhịp', 'tow()            # kéo kiện đá về đích']}
      typeAt={45} x={44} y={260} w={570} title="lai_omni_day_keo.py" />
    <NhanGoi so={5} ten="Omni + Dây kéo vượt mưa" />
    <Sola mat={[[0, 'proud'], [112, 'happy']]} says={[{at: 18, out: 112, text: 'Thân Omni mùa 6 lướt chéo né tảng đá lăn, rồi quăng Dây kéo mùa 4 thu gọn kiện đá mẫu của anh Dũng!'}, {at: 118, out: 205, text: 'Anh Dũng vào hội!'}]} />
  </NenHienTruong>
);

/* ================================================================== GÓI 6 · Thời tiết 2 (Gió giật · Biến cố): Drone (M5) + Nam châm (M3) */
const R_G6M: Moc[] = [[0, 1, 3, 0], [55, 2, 3, 0], [95, 2, 3, 18]];
const G6Mo: React.FC = () => (
  <Shake hits={[20, 60]} amp={12}>
    <NenHienTruong anh={NEN} mua="m8">
      <CongChaoGoc nghieng />
      <ODat ten="o-rao" c={2} r={3} />
      <Vat ten="vat-khoi-sat" moc={[[0, 3, 3, 0]]} />
      <Xe anh="banh-ngac" moc={R_G6M} />
      <ChuNay chu="NGHIÊNG CỔNG CHÀO!" at={18} den={85} x={tamO(3, 1).x} y={tamO(3, 1).y} />
      <ChuNay chu="RÀO ĐỔ CHẮN LỐI!" at={60} den={145} x={tamO(2, 3).x + 60} y={tamO(2, 3).y - 45} />
      <GioKhaiMacBar con="GIÓ GIẬT SÂN TRƯỜNG!" gap />
      <NhanGoi so={6} ten="Drone + Nam châm dựng cổng" />
      <Thay dang="thay-hoang" says={[{at: 52, out: 175, text: 'Gió giật làm nghiêng cổng chào lễ hội và đổ rào chắn lối rồi! Phải bay qua rào hút thanh dầm sắt gia cố lại ngay!'}]} at={40} />
    </NenHienTruong>
  </Shake>
);
const R_G6K: Moc[] = [[0, 1, 3, 0], [50, 2, 3, 0], [150, 2, 3, 0]];
const S_G6K: Moc[] = [[0, 4, 3, 0], [55, 4, 3, 0], [110, 3, 3, 0], [160, 3, 3, 0]];
const G6Lam: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m8">
    <CongChaoGoc />
    <ODat ten="o-rao" c={2} r={3} />
    <ODat ten="o-dich" c={3} r={3} />
    <Vat ten="vat-khoi-sat" moc={S_G6K} />
    <Xe anh="lai-drone-tu" moc={R_G6K} />
    <Burst x={tamO(3, 3).x} y={tamO(3, 3).y} at={112} />
    <CodeBox lines={['# Thân Drone (M5) + Nam châm (M3)', 'move(2)      # bay vọt qua hàng rào đổ', 'pull("N")    # hút dầm sắt dựng cổng chào']}
      typeAt={45} x={44} y={260} w={580} title="lai_drone_nam_cham.py" />
    <NhanGoi so={6} ten="Drone + Nam châm dựng cổng" />
    <Luna mat={[[0, 'wink'], [112, 'happy']]} says={[{at: 18, out: 112, text: 'Thân Drone mùa 5 bay vọt lên trên hàng rào đổ, bật Nam châm mùa 3 hút dầm sắt dựng thẳng lại cổng chào!'}, {at: 118, out: 205, text: 'Cổng chào vững vàng!'}]} />
  </NenHienTruong>
);

/* ================================================================== GÓI 7 · Thời tiết 3 (Mất điện): Omni (M6) + Loa Sonar (M7) đón chú Phong */
const R_G7M: Moc[] = [[0, 1, 3, 0], [55, 1.5, 3, 0], [95, 1.5, 3, 0]];
const G7Mo: React.FC = () => (
  <Shake hits={[58]} amp={10}>
    <NenHienTruong anh={NEN} mua="m8" toi={0.38}>
      <Vat ten="vat-da-chuong" moc={[[0, 2, 3, 0]]} />
      <Xe anh="banh-ngac" moc={R_G7M} />
      <ChuNay chu="MẤT ĐIỆN & ĐÁ CHẮN!" at={58} den={140} x={tamO(2, 3).x + 70} y={tamO(2, 3).y - 40} />
      <GioKhaiMacBar con="Khai mạc: 4 giờ" />
      <NhanGoi so={7} ten="Omni + Loa Sonar phá đá" />
      <Nguoi anh="phong-sot-ruot" ten="CHÚ PHONG" mau="#0D9488" x={820} h={600} at={45} side="left" bubbleW={560} bubbleTop={1230}
        says={[{at: 58, out: 175, text: 'Cửa hầm dẫn về thị trấn bị mất điện tối đen lại vướng khối đá chuông, phải dùng tai Sonar và loa cộng hưởng!'}]} />
    </NenHienTruong>
  </Shake>
);
const R_G7K: Moc[] = [[0, 1, 4, -90], [40, 1, 3, 0], [95, 1, 3, 0], [145, 3, 3, 0]];
const G7Lam: React.FC = () => {
  const f = useCurrentFrame(), vo = f >= 90;
  return (
    <NenHienTruong anh={NEN} mua="m8">
      <ODat ten="o-dich" c={3} r={3} />
      {!vo && <Vat ten="vat-da-chuong" moc={[[0, 2, 3, 0]]} />}
      <Xe anh="lai-omni-loa" moc={R_G7K} />
      <Burst x={tamO(2, 3).x} y={tamO(2, 3).y} at={90} />
      <Burst x={tamO(3, 3).x} y={tamO(3, 3).y} at={145} />
      <CodeBox lines={['# Thân Omni (M6) + Loa & Tai Sonar (M7)', 'slide_left()', 'n = listen()  # nghe tần số trong bóng tối', 'note(n)       # cộng hưởng mở cửa hầm']}
        typeAt={40} x={44} y={260} w={590} title="lai_omni_loa.py" />
      <NhanGoi so={7} ten="Omni + Loa Sonar phá đá" />
      <Sola mat={[[0, 'proud'], [92, 'happy']]} says={[{at: 18, out: 112, text: 'Bánh Omni trượt ngang vào đúng vị trí, tai Sonar nghe giọng đá rồi phát nốt cộng hưởng mở thông cửa hầm!'}, {at: 118, out: 205, text: 'Đủ mặt cả 7 người nhờ!'}]} />
    </NenHienTruong>
  );
};

/* ================================================================== GÓI 8 · Tổng hợp cơ chế 7 mùa tại Sân trường CLB */
const R_G8M: Moc[] = [[0, 1, 3, 0], [55, 2, 3, 0], [95, 2, 3, 20]];
const G8Mo: React.FC = () => (
  <Shake hits={[58]} amp={9}>
    <NenHienTruong anh={NEN} mua="m8">
      <ODat ten="o-bang" c={1} r={3} />
      <ODat ten="o-ban-xoay" c={2} r={3} />
      <ODat ten="o-ngach-1" c={3} r={3} />
      <Xe anh="banh-ngac" moc={R_G8M} />
      <ChuNay chu="TỔ HỢP 7 MÙA!" at={58} den={140} x={tamO(2, 3).x + 80} y={tamO(2, 3).y - 40} />
      <GioKhaiMacBar con="Khai mạc: 3 giờ" />
      <NhanGoi so={8} ten="Sa bàn liên hoàn 7 mùa" />
      <Thay dang="thay-dong-vien" says={[{at: 60, out: 175, text: 'Sa bàn thi đấu giữa sân trường hội tụ đủ băng chuyền, bàn xoay, đường ngầm và vạch màu của cả 7 mùa đấy!'}]} at={48} />
    </NenHienTruong>
  </Shake>
);
const R_G8K: Moc[] = [[0, 1, 2, 0], [45, 2, 2, 90], [90, 2, 4, 0], [145, 4, 4, 0]];
const G8Lam: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m8">
    <ODat ten="o-bang" c={1} r={2} />
    <ODat ten="o-ban-xoay" c={2} r={2} />
    <ODat ten="o-san-xanh" c={2} r={3} />
    <ODat ten="o-dich" c={4} r={4} />
    <Xe anh="sola-bot" moc={R_G8K} />
    <Burst x={tamO(4, 4).x} y={tamO(4, 4).y} at={145} />
    <CodeBox lines={['# Kết hợp tuple, list, dict vượt sa bàn', 'lo_trinh = [("bang", 1), ("xoay", 2)]', 'for buoc, so in lo_trinh:', '    di_theo(buoc, so)']}
      typeAt={40} x={44} y={260} w={590} title="sa_ban_7_mua.py" />
    <NhanGoi so={8} ten="Sa bàn liên hoàn 7 mùa" />
    <Luna mat={[[0, 'wink'], [142, 'happy']]} says={[{at: 18, out: 118, text: 'Dùng danh sách các tuple kết hợp từ điển để điều khiển Robot Lai vượt qua mọi cơ chế trên sân trường!'}, {at: 140, out: 205, text: 'Sân trường sẵn sàng!'}]} />
  </NenHienTruong>
);

/* ================================================================== GÓI 9 · Song kiếm hợp bích: Sola-Bot + Luna-Bot */
const R_G9M: Moc[] = [[0, 1, 3, 0], [60, 1, 3, 0], [95, 1, 3, 0]];
const G9Mo: React.FC = () => (
  <Shake hits={[58]} amp={9}>
    <NenHienTruong anh={NEN} mua="m8">
      <ODat ten="o-san-do" c={1} r={2} />
      <ODat ten="o-san-vang" c={3} r={2} />
      <Vat ten="vat-da-chuong" moc={[[0, 1, 3, 0]]} />
      <Vat ten="vat-khoi-sat" moc={[[0, 3, 3, 0]]} />
      <Xe anh="sola-bot" moc={R_G9M} />
      <ChuNay chu="HAI ĐẦU SÂN KHẤU!" at={58} den={140} x={tamO(2, 3).x + 70} y={tamO(2, 3).y - 40} />
      <GioKhaiMacBar con="Khai mạc: 2 giờ" />
      <NhanGoi so={9} ten="Sola-Bot & Luna-Bot" />
      <Sola mat={[[0, 'normal'], [58, 'surprised']]} says={[{at: 16, out: 55, text: 'Hai trụ sân khấu chính ở hai đầu cần kích hoạt cùng một nhịp!'}, {at: 60, out: 175, text: 'Mình với Luna mỗi người điều khiển một Robot Lai song hành thôi!'}]} />
    </NenHienTruong>
  </Shake>
);
const RS_G9K: Moc[] = [[0, 1, 4, -90], [50, 1, 3, -90], [115, 1, 2, -90], [160, 1, 2, -90]];
const RL_G9K: Moc[] = [[0, 3, 4, 0], [50, 3, 3, 0], [115, 3, 2, 0], [160, 3, 2, 0]];
const G9Lam: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m8">
    <ODat ten="o-san-do" c={1} r={2} />
    <ODat ten="o-san-vang" c={3} r={2} />
    <Xe anh="sola-bot" moc={RS_G9K} />
    <Xe anh="luna-bot" moc={RL_G9K} />
    <Burst x={tamO(1, 2).x} y={tamO(1, 2).y} at={116} />
    <Burst x={tamO(3, 2).x} y={tamO(3, 2).y} at={116} />
    <CodeBox lines={['# Sola-Bot dưới đất · Luna-Bot trên không', 'sola_bot.note(5)      # mở khóa âm học', 'luna_bot.dot("gold")  # thắp đèn sân khấu']}
      typeAt={45} x={44} y={260} w={590} title="song_kiem_hop_bich.py" />
    <NhanGoi so={9} ten="Sola-Bot & Luna-Bot" />
    <Luna mat={[[0, 'wink'], [116, 'happy']]} says={[{at: 18, out: 112, text: 'Sola-Bot mở khóa trụ trái, Luna-Bot bay lên thắp sáng trụ phải đúng cùng một nhịp!'}, {at: 118, out: 205, text: 'Sân khấu chính tỏa sáng!'}]} />
  </NenHienTruong>
);

/* ================================================================== GÓI 10 · Giải cứu thị trấn & Đại lễ hội CLB 8 Mùa */
const ThaTayM8: React.FC = () => {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  const STATS = [
    {nhan: 'Kho Linh Kiện 7 Mùa', kq: 'MỞ KHÓA 100%', mau: '#2563EB'},
    {nhan: 'Đội Hình Tác Chiến', kq: 'SOLA-BOT & LUNA-BOT', mau: '#EC4899'},
    {nhan: 'Thuật Toán Python', kq: 'TUPLE · LIST · DICT · SET', mau: '#16A34A'},
    {nhan: 'Mục Tiêu Chiến Dịch', kq: 'KHƠI THÔNG 7 CỬA NGÕ', mau: '#D97706'},
  ];
  return (
    <NenHienTruong anh={NEN} mua="m8" luoi={false} toi={0.52}>
      <div style={{position: 'absolute', left: 40, top: 125, right: 40, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 50, color: C.yellow, textShadow: `0 6px 0 ${C.ink}`}}>
        BỘ ĐÔI ROBOT LAI TỐI THƯỢNG · SOLA & LUNA
      </div>
      <div style={{position: 'absolute', left: 60, top: 240, width: 450, height: 450, borderRadius: 36, background: 'rgba(15,23,42,0.8)',
        border: `6px solid #38BDF8`, boxShadow: `0 14px 0 ${C.ink}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        transform: `scale(${pop(f, 6, fps)})`}}>
        <Img src={staticFile('robot/m8/sola-bot.png')} style={{width: 360, height: 360, transform: 'rotate(-90deg)'}} />
        <span style={{padding: '6px 22px', borderRadius: 14, background: '#38BDF8', color: C.ink, fontWeight: 900, fontSize: 26, border: `3px solid ${C.ink}`}}>
          SOLA-BOT · ĐỊA HÌNH
        </span>
      </div>
      <div style={{position: 'absolute', right: 60, top: 240, width: 450, height: 450, borderRadius: 36, background: 'rgba(15,23,42,0.8)',
        border: `6px solid #F472B6`, boxShadow: `0 14px 0 ${C.ink}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        transform: `scale(${pop(f, 12, fps)})`}}>
        <Img src={staticFile('robot/m8/luna-bot.png')} style={{width: 360, height: 360}} />
        <span style={{padding: '6px 22px', borderRadius: 14, background: '#F472B6', color: C.ink, fontWeight: 900, fontSize: 26, border: `3px solid ${C.ink}`}}>
          LUNA-BOT · KHÔNG GIAN
        </span>
      </div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 730, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18}}>
        {STATS.map((s, i) => (
          <div key={s.nhan} style={{padding: '22px 24px', borderRadius: 24, background: '#FFFFFF', border: `5px solid ${C.ink}`,
            boxShadow: `0 10px 0 ${C.ink}`, transform: `scale(${pop(f, 18 + i * 6, fps)})`}}>
            <div style={{fontSize: 22, fontWeight: 800, color: '#64748B', marginBottom: 6}}>{s.nhan}</div>
            <div style={{fontSize: 28, fontWeight: 900, color: s.mau}}>{s.kq}</div>
          </div>
        ))}
      </div>
      <Sola mat={[[0, 'happy']]} says={[{at: 12, out: 110, text: 'Toàn bộ linh kiện và kiến thức Python của 8 mùa đã hội tụ, thả tay chạy màn trình diễn lớn nhất nào!'}]} />
    </NenHienTruong>
  );
};

const RS_C1: Moc[] = [[0, 1, 4, -90], [50, 1, 2, 0], [110, 2, 2, 0]];
const RL_C1: Moc[] = [[0, 3, 4, 0], [50, 3, 2, 0], [110, 2, 2, 0]];
const Canh1: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m8">
    <ODat ten="o-san-do" c={1} r={2} />
    <ODat ten="o-dich" c={2} r={2} />
    <ODat ten="o-san-vang" c={3} r={2} />
    <Xe anh="sola-bot" moc={RS_C1} />
    <Xe anh="luna-bot" moc={RL_C1} />
    <Burst x={tamO(2, 2).x} y={tamO(2, 2).y} at={95} />
    <GioKhaiMacBar con="Màn 1/2 · Khơi thông toàn thị trấn" />
    <Thay says={[{at: 12, out: 112, text: 'Hai robot lai tự động vượt qua mọi chướng ngại, nối thông toàn bộ 7 cửa ngõ về sân trường CLB!'}]} at={6} />
  </NenHienTruong>
);

const Canh2: React.FC = () => {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  const KHACH = [
    {anh: 'tu-mung', ten: 'Chú Tư', mau: '#D97706', x: 160, y: 420},
    {anh: 'hanh-mung', ten: 'Cô Hạnh', mau: '#DC2626', x: 413, y: 420},
    {anh: 'sau-mung', ten: 'Bác Sáu', mau: '#16A34A', x: 667, y: 420},
    {anh: 'mai-mung', ten: 'Cô Mai', mau: '#0891B2', x: 920, y: 420},
    {anh: 'ba-mung', ten: 'Bác Ba', mau: '#0284C7', x: 160, y: 780},
    {anh: 'lan-mung', ten: 'Chị Lan', mau: '#EC4899', x: 413, y: 780},
    {anh: 'dung-mung', ten: 'Anh Dũng', mau: '#EA580C', x: 667, y: 780},
    {anh: 'phong-mung', ten: 'Chú Phong', mau: '#0F766E', x: 920, y: 780},
  ];
  return (
    <NenHienTruong anh={NEN} mua="m8" luoi={false} toi={0.35}>
      <div style={{position: 'absolute', left: 40, top: 150, right: 40, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 46, color: C.yellow, textShadow: `0 6px 0 ${C.ink}`}}>
        8 NGƯỜI BẠN LỚN HỘI TỤ VỀ NGÀY HỘI ROBOT!
      </div>
      {KHACH.map((k, i) => (
        <div key={k.ten} style={{position: 'absolute', left: k.x - 110, top: k.y - 160, width: 220, textAlign: 'center', transform: `scale(${pop(f, 6 + i * 6, fps)})`}}>
          <Img src={staticFile(`nguoi/${k.anh}.png`)} style={{height: 260, width: 'auto'}} />
          <div style={{marginTop: -10, padding: '6px 14px', borderRadius: 99, background: k.mau, border: `4px solid ${C.ink}`, color: '#fff', fontFamily: FONT, fontWeight: 900, fontSize: 24}}>
            {k.ten}
          </div>
        </div>
      ))}
      <Burst x={540} y={560} at={45} />
      <Luna mat={[[0, 'happy']]} says={[{at: 12, out: 112, text: 'Chú Tư, cô Hạnh, bác Sáu, bác Ba, chị Lan, anh Dũng và chú Phong đều đã mang sản phẩm về dự hội!'}]} />
    </NenHienTruong>
  );
};

const TraoHuyHieuCLB: React.FC = () => {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  return (
    <NenHienTruong anh={NEN} mua="m8" luoi={false} toi={0.48}>
      <div style={{position: 'absolute', left: 30, top: 92, right: 30, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 47, color: C.yellow, textShadow: `0 6px 0 ${C.ink}`, whiteSpace: 'nowrap'}}>
        HUY HIỆU KỸ SƯ TRƯỞNG CLB ROBOT
      </div>

      {/* Sân khấu Huy Hiệu cỡ lớn + Bộ đôi Robot Lai hộ tống hai bên (top: 220 .. 680) */}
      <div style={{position: 'absolute', left: 45, top: 300, width: 260, height: 260, borderRadius: 32, background: 'rgba(15,23,42,0.82)',
        border: `5px solid #38BDF8`, boxShadow: `0 10px 0 ${C.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        transform: `scale(${pop(f, 14, fps)})`}}>
        <Img src={staticFile('robot/m8/sola-bot.png')} style={{width: 225, height: 225, transform: 'rotate(-90deg)'}} />
      </div>

      <div style={{position: 'absolute', right: 45, top: 300, width: 260, height: 260, borderRadius: 32, background: 'rgba(15,23,42,0.82)',
        border: `5px solid #F472B6`, boxShadow: `0 10px 0 ${C.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        transform: `scale(${pop(f, 18, fps)})`}}>
        <Img src={staticFile('robot/m8/luna-bot.png')} style={{width: 225, height: 225}} />
      </div>

      <div style={{position: 'absolute', left: 540 - 200, top: 230, width: 400, height: 400, borderRadius: '50%',
        background: 'linear-gradient(135deg, #FACC15, #EA580C)',
        border: `9px solid ${C.ink}`, boxShadow: `0 18px 0 ${C.ink}, 0 0 60px rgba(250,204,21,0.6)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${pop(f, 8, fps)})`, zIndex: 5}}>
        <Icon name="Award" size={240} color="#fff" stroke={2.4} />
      </div>

      {/* Bảng Chứng Nhận Kỹ Sư Trưởng cỡ lớn lấp đầy vùng y = 690 .. 1150 */}
      <div style={{position: 'absolute', left: 55, right: 55, top: 690, padding: '30px 36px', borderRadius: 34,
        background: 'linear-gradient(180deg, #FFFBEB 0%, #FEF3C7 100%)', border: `6px solid ${C.ink}`,
        boxShadow: `0 16px 0 ${C.ink}`, textAlign: 'center', transform: `scale(${pop(f, 22, fps)})`}}>
        <div style={{display: 'inline-flex', alignItems: 'center', gap: 12, padding: '8px 26px', borderRadius: 99,
          background: '#1E1B4B', color: '#FDE047', fontWeight: 900, fontSize: 25, marginBottom: 14, border: `3px solid ${C.ink}`}}>
          <Icon name="Trophy" size={28} color="#FDE047" />
          <span>DANH HIỆU TỐI THƯỢNG · 8/8 MÙA CHIẾN DỊCH</span>
        </div>
        <div style={{fontSize: 40, fontWeight: 900, color: C.ink, marginBottom: 10}}>
          ĐỘI TRƯỞNG KỸ THUẬT CLB ROBOT CHẤN HƯNG
        </div>
        <div style={{fontSize: 27, fontWeight: 800, color: '#334155', lineHeight: 1.35}}>
          Đã chế tạo thành công 8 thế hệ Robot R1 &amp; R2, ứng dụng Python giải cứu trọn vẹn 8 điểm nóng toàn thị trấn!
        </div>
      </div>

      <Burst x={540} y={430} at={18} />
      <Thay dang="thay-mung" x={820} says={[{at: 12, out: 76, text: 'Thầy trao tặng Sola, Luna và em Huy hiệu Kỹ sư Trưởng CLB vì đã dùng công nghệ giúp đỡ khắp thị trấn!'}]} at={6} />
      <Sola x={230} mat={[[0, 'happy']]} says={[{at: 82, out: 145, text: 'Tụi em cảm ơn Thầy và cảm ơn cậu — chiến thần code đã đồng hành cùng CLB suốt 8 mùa qua!'}]} />
    </NenHienTruong>
  );
};

const NgoaiDoiM8: React.FC = () => {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  const THE = [
    {icon: 'Bot' as const, ten: 'Đội Robot Cứu Hộ Đa Địa Hình Thực Chiến', mo: 'Kết hợp Drone bay, tàu mặt nước USV và robot bánh xích/chân nhện ứng cứu sau bão lũ ngoài đời.'},
    {icon: 'Sparkles' as const, ten: 'Từ CLB Trường Cấp 3 Tới Kỹ Sư AI & Robotics', mo: 'Nền tảng Python (hàm, biến, tuple, list, lưới 2D, dict, set) là chìa khóa mở cánh cửa công nghệ tương lai.'},
  ];
  return (
    <NenHienTruong anh={NEN} mua="m8" luoi={false} toi={0.58}>
      <div style={{position: 'absolute', left: 40, top: 120, right: 40, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 48, color: C.yellow, textShadow: `0 6px 0 ${C.ink}`}}>
        CÔNG NGHỆ NGOÀI ĐỜI THỰC · M8
      </div>

      {/* Hero Showcase: Robot R1 của mùa -> Công nghệ thực tế (top: 210 .. 490) */}
      <div style={{position: 'absolute', left: 50, right: 50, top: 210, height: 275, borderRadius: 32,
        background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', border: `6px solid ${C.ink}`,
        boxShadow: `0 14px 0 ${C.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 34px',
        transform: `scale(${pop(f, 6, fps)})`, boxSizing: 'border-box'}}>
        <div style={{width: 225, height: 225, borderRadius: 28, background: 'rgba(255,255,255,0.08)', border: `4px solid ${C.yellow}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
          <Img src={staticFile('robot/m8/sola-bot.png')} style={{width: 205, height: 205, objectFit: 'contain', transform: 'rotate(-90deg)'}} />
        </div>
        <div style={{flex: 1, marginLeft: 28, fontFamily: FONT, color: '#fff'}}>
          <div style={{display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 99, background: '#2563EB',
            border: '3px solid #fff', fontSize: 22, fontWeight: 900, marginBottom: 10}}>
            TỪ SA BÀN CLB RA THỰC TẾ
          </div>
          <div style={{fontSize: 38, fontWeight: 900, color: '#FDE047', marginBottom: 6}}>Đội Hình Robot Lai Đa Địa Hình</div>
          <div style={{fontSize: 26, fontWeight: 700, color: '#E2E8F0', lineHeight: 1.3}}>Kết hợp linh hoạt mô-đun cơ khí và cấu trúc dữ liệu Python cho mọi nhiệm vụ.</div>
        </div>
      </div>

      {THE.map((t, i) => (
        <div key={t.ten} style={{position: 'absolute', left: 50, right: 50, top: 515 + i * 325, height: 295, padding: '28px 34px', borderRadius: 30, background: '#fff',
          border: `6px solid ${C.ink}`, boxShadow: `0 14px 0 ${C.ink}`, display: 'flex', gap: 28, alignItems: 'center',
          transform: `scale(${pop(f, 12 + i * 16, fps)})`, boxSizing: 'border-box'}}>
          <div style={{width: 150, height: 150, borderRadius: 28, background: '#2563EB', border: `5px solid ${C.ink}`,
            boxShadow: `0 8px 0 ${C.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
            <Icon name={t.icon} size={84} color="#fff" />
          </div>
          <div style={{fontFamily: FONT, color: C.ink, flex: 1}}>
            <div style={{fontWeight: 900, fontSize: 38, marginBottom: 10, lineHeight: 1.2}}>{t.ten}</div>
            <div style={{fontWeight: 800, fontSize: 28, color: '#334155', lineHeight: 1.34}}>{t.mo}</div>
          </div>
        </div>
      ))}
      <Luna mat={[[0, 'happy']]} says={[{at: 14, out: 142, text: 'Từ chiếc xe 2 bánh đầu tiên ở Kho chú Tư, giờ cậu đã làm chủ cả một hạm đội Robot Lai siêu đỉnh!'}]} />
    </NenHienTruong>
  );
};

const DaiKetCuc8Mua: React.FC = () => {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  const BOT = [
    {ten: 'M1 · Xe Kho Hàng', anh: 'robot/m1/du-vui.png', mau: '#D97706', xoay: -90, zoom: 1.48},
    {ten: 'M2 · Xe Cứu Hỏa', anh: 'robot/m2/du-vui.png', mau: '#EA580C', xoay: -90, zoom: 1.08},
    {ten: 'M3 · Nhện Phân Loại', anh: 'robot/m3/nhen-tu-vui.png', mau: '#16A34A', xoay: 0, zoom: 1.08},
    {ten: 'M4 · Cần Cẩu Cảng', anh: 'robot/m4/cau-du-vui.png', mau: '#CA8A04', xoay: -90, zoom: 1.08},
    {ten: 'M5 · Tàu Thủy Lợi', anh: 'robot/m4/xuong-du-vui.png', mau: '#0284C7', xoay: -90, zoom: 1.08},
    {ten: 'M6 · Drone Gieo Hoa', anh: 'robot/m5/drone-cam-vui.png', mau: '#EC4899', xoay: 0, zoom: 1.08},
    {ten: 'M7 · Máy Khai Thác Đá', anh: 'robot/m6/omni-du-vui.png', mau: '#D97706', xoay: -90, zoom: 1.08},
    {ten: 'M8 · Xe Hang Động', anh: 'robot/m7/gai-du-vui.png', mau: '#0D9488', xoay: -90, zoom: 1.08},
  ];
  return (
    <NenHienTruong anh={NEN} mua="m8" luoi={false} toi={0.52}>
      <div style={{position: 'absolute', left: 40, right: 40, top: 95, padding: '22px 32px', borderRadius: 28,
        background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
        border: `6px solid ${C.ink}`, boxShadow: `0 12px 0 ${C.ink}`, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 44, color: '#fff'}}>
        CHÚC MỪNG PHÁ ĐẢO TRỌN VẸN 8 MÙA!
      </div>
      {/* Lưới 4x2 Thẻ Robot cỡ lớn (cao 210px/thẻ, ảnh Robot 160x160) lấp đầy y = 225 .. 1155 */}
      <div style={{position: 'absolute', left: 40, right: 40, top: 225, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20}}>
        {BOT.map((b, i) => (
          <div key={b.ten} style={{height: 210, padding: '16px 22px', borderRadius: 28, background: '#fff',
            border: `5px solid ${C.ink}`, boxShadow: `0 10px 0 ${C.ink}`, boxSizing: 'border-box',
            display: 'flex', alignItems: 'center', gap: 18, transform: `scale(${pop(f, 6 + i * 5, fps)})`}}>
            <div style={{width: 168, height: 168, borderRadius: 24, background: '#F8FAFC', border: `4px solid ${b.mau}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden'}}>
              <Img src={staticFile(b.anh)} style={{width: 156, height: 156, objectFit: 'contain',
                transform: `${b.xoay ? `rotate(${b.xoay}deg) ` : ''}scale(${b.zoom ?? 1})`}} />
            </div>
            <div style={{fontFamily: FONT, color: C.ink, flex: 1}}>
              <span style={{display: 'inline-block', padding: '4px 12px', borderRadius: 10, background: b.mau, color: '#fff',
                fontWeight: 900, fontSize: 19, marginBottom: 8}}>HOÀN THÀNH</span>
              <div style={{fontWeight: 900, fontSize: 30, lineHeight: 1.2}}>{b.ten}</div>
            </div>
          </div>
        ))}
      </div>
      <Burst x={540} y={620} at={55} />
      <Sola x={240} mat={[[0, 'happy']]} says={[{at: 12, out: 76, text: 'Cảm ơn cậu đã sát cánh cùng team CLB Robot Chấn Hưng phá đảo trọn vẹn 8 mùa rực rỡ!'}]} />
      <Luna x={840} mat={[[0, 'happy']]} says={[{at: 82, out: 145, text: 'Hẹn gặp lại Kỹ sư Trưởng ở những dự án độ bot và giải đấu tiếp theo nha!'}]} />
    </NenHienTruong>
  );
};

/* ================================================================== ĐĂNG KÝ 20 PHIM MÙA 8 */
const mo = (so: number, canh: Phim['canh']): Phim => ({id: `M8G${so}-Mo`, doc: true, canh});
const ket = (so: number, canh: Phim['canh']): Phim => ({id: `M8G${so}-Ket`, doc: true, canh});
const tt = (so: number, ten: string, con: string, loi: string, xong: [number, number, number, number], xoa?: number) => ({
  id: 'thanh-tuu', dur: 170, el: <ThanhTuu moi={so - 1} loi={loi} con={con} so={so} ten={ten} xong={xong} xoa={xoa} />,
  sfx: [[22, xoa !== undefined ? 'wrong.wav' : 'ding.wav', 0.5]] as any,
});
const xe = (anh: string, luna: string, sola: string, tenPart: string, cach = 120) => ({
  id: 'trong-xe', dur: cach + 70,
  el: <TrongXe mua="m8" anh={anh} cach={cach} tenPart={tenPart} luna={[{at: 10, out: 70, text: luna}]} sola={[{at: 76, out: cach - 4, text: sola}]}
    lunaMat={[[0, 'thinking'], [76, 'happy']]} solaMat={[[0, 'thinking'], [76, 'confident']]} />,
  sfx: [[cach, 'impact.wav', 0.5], [cach, 'ding.wav', 0.4]] as any,
});
const treo = (anh: string, cau: string, so: number, ten: string, xoay = -90) => ({
  id: 'cau-treo', dur: 110, el: <CauTreo mua="m8" xoay={xoay} anh={anh} cau={cau} so={so} ten={ten} />, sfx: [W_IN, [40, 'pop.wav', 0.4]] as any,
});

export const PHIM_M8: Phim[] = [
  mo(1, [
    {id: 'hien-truong', dur: 185, el: <G1Mo />, sfx: [W_IN, [58, 'wrong.wav', 0.5]]},
    xe('lai-nhen-kep', 'Cầu gỗ gãy thành hố sâu mà kiện hàng chú Tư ở bên kia, ghép sao đây?', 'Kho linh kiện 7 mùa mở tự do! Ghép Thân nhện mùa 3 nhảy hố với Tay gắp mùa 1!', 'Robot Lai: Nhện + Tay gắp', 120),
    treo('lai-nhen-kep', 'Nhảy qua cầu gãy rồi gắp kiện hàng đón chú Tư vào hội!', 1, 'Thân lai: Nhện + Tay gắp', 0),
  ]),
  ket(1, [{id: 'lam', dur: 210, el: <G1Lam />, sfx: [[138, 'ding.wav', 0.5]]}, tt(1, 'Thân lai: Nhện + Tay gắp', 'Khai mạc: 9 giờ', 'Chú Tư đã qua cửa ngõ Kho hàng! Giờ sang cửa ngõ Nhà máy giải cứu xe của cô Hạnh nhé!', [25, 0, 0, 0])]),
  mo(2, [
    {id: 'thu', dur: 185, el: <G2Mo />, sfx: [[58, 'wrong.wav', 0.5]]},
    xe('lai-xich-nem', 'Đá lăn chắn trước hàng rào cổng Nhà máy cô Hạnh, kết hợp gì bây giờ?', 'Ghép Thân xích mùa 2 lì đòn với Tay máy ném mùa 6 — ủi sát rào rồi hất đá vọt qua!', 'Robot Lai: Xích + Máy ném', 125),
    treo('lai-xich-nem', 'Ủi sát rào và hất tảng đá bay vọt qua đón cô Hạnh!', 2, 'Tay lai: Xích + Máy ném'),
  ]),
  ket(2, [{id: 'lam', dur: 210, el: <G2Lam />, sfx: [[106, 'ding.wav', 0.5]]}, tt(2, 'Tay lai: Xích + Máy ném', 'Khai mạc: 8 giờ', 'Cô Hạnh đã mang mô hình nhà máy vào sân trường! Giờ tới hầm chui cửa ngõ Nông trại đón xe hoa chị Lan!', [50, 20, 0, 0])]),
  mo(3, [
    {id: 'thu', dur: 185, el: <G3Mo />, sfx: [[58, 'wrong.wav', 0.5]]},
    xe('lai-gai-cam', 'Hầm chui vừa trơn trượt vừa ngập bùn che vạch màu, dẫn xe hoa chị Lan sao đây?', 'Ghép Bánh gai mùa 7 chống trượt với Camera 4 hướng & Máy sơn mùa 5 đọc màu!', 'Robot Lai: Bánh gai + Camera', 125),
    treo('lai-gai-cam', 'Bám đường trơn và đọc màu dẫn xe hoa chị Lan vào hội!', 3, 'Cảm biến lai: Gai + Camera'),
  ]),
  ket(3, [{id: 'lam', dur: 210, el: <G3Lam />, sfx: [[145, 'ding.wav', 0.5]]}, tt(3, 'Cảm biến lai: Gai + Camera', 'Khai mạc: 7 giờ', 'Xe hoa của chị Lan đã tới cổng trường rực rỡ! Nhưng ngoài phố nước mưa đang chảy tràn qua ngã tư bác Ba và bác Sáu!', [75, 45, 15, 0])]),
  mo(4, [
    {id: 'thu', dur: 185, el: <G4Mo />, sfx: [[58, 'wrong.wav', 0.5]]},
    xe('lai-xuong-tu', 'Nước tràn cuốn khối sắt của bác Sáu kẹt miệng cống, xe thường không bơi ra được!', 'Ghép Thân xuồng mùa 4 lướt dòng nước với Nam châm điện mùa 3 hút gọn khối sắt!', 'Tàu Lai: Xuồng + Nam châm', 125),
    treo('lai-xuong-tu', 'Lướt dòng nước ngập hút khối sắt mở thông cống phố!', 4, 'Xuồng + Nam châm điện'),
  ]),
  ket(4, [{id: 'lam', dur: 210, el: <G4Lam />, sfx: [[108, 'ding.wav', 0.5]]}, tt(4, 'Xuồng + Nam châm điện', 'Khai mạc: 6 giờ', 'Bác Ba và bác Sáu đã về tới trường! Tiếp theo là các đợt thời tiết mưa, gió giật và mất điện ở 3 cửa ngõ núi!', [85, 65, 35, 15])]),
  mo(5, [
    {id: 'thu', dur: 185, el: <G5Mo />, sfx: [[60, 'wrong.wav', 0.5]]},
    xe('lai-omni-keo', 'Mưa lớn làm đá tròn lăn trên dốc anh Dũng, vừa phải né đá vừa phải kéo kiện hàng!', 'Ghép Bánh Omni mùa 6 đi chéo 1 nhịp né đá với Dây phao kéo mùa 4 thu kiện hàng từ xa!', 'Robot Lai: Omni + Dây kéo', 125),
    treo('lai-omni-keo', 'Đi chéo 1 nhịp né đá lăn rồi kéo kiện đá mẫu về!', 5, 'Omni + Dây kéo vượt mưa'),
  ]),
  ket(5, [{id: 'lam', dur: 210, el: <G5Lam />, sfx: [[112, 'ding.wav', 0.5]]}, tt(5, 'Omni + Dây kéo vượt mưa', 'Khai mạc: 5 giờ', 'Anh Dũng đã mang bộ mẫu đá quý về trường! Nhưng gió giật mạnh quá làm cổng chào sân trường nghiêng rồi!', [90, 80, 55, 30])]),
  mo(6, [
    {id: 'thu', dur: 185, el: <G6Mo />, sfx: [[20, 'impact.wav', 0.6], [60, 'wrong.wav', 0.5]]},
    xe('lai-drone-tu', 'Rào đổ chắn lối dưới đất mà cổng chào sắt đang nghiêng, ứng cứu sao kịp?', 'Ghép Cánh quạt Drone mùa 5 bay vọt qua rào với Nam châm điện mùa 3 hút dầm sắt dựng cổng!', 'Drone Lai: Bay + Nam châm', 125),
    treo('lai-drone-tu', 'Bay vọt qua rào hút dầm sắt gia cố cổng chào lễ hội!', 6, 'Drone + Nam châm dựng cổng', 0),
  ]),
  ket(6, [{id: 'lam', dur: 210, el: <G6Lam />, sfx: [[112, 'ding.wav', 0.5]]}, tt(6, 'Drone + Nam châm dựng cổng', 'Khai mạc: 4 giờ', 'Dựng lại cổng chào kịp thời lắm! Giờ còn chú Phong đang kẹt ở cửa hầm mất điện, mau lên đường tiếp ứng!', [90, 80, 55, 45], 3)]),
  mo(7, [
    {id: 'thu', dur: 185, el: <G7Mo />, sfx: [[58, 'wrong.wav', 0.5]]},
    xe('lai-omni-loa', 'Cửa hầm mất điện tối đen lại vướng khối đá chuông, đón chú Phong bằng tổ hợp nào?', 'Ghép Bánh Omni mùa 6 trượt ngang với Tai Sonar & Loa cộng hưởng mùa 7 phá đá trong tối!', 'Robot Lai: Omni + Loa Sonar', 125),
    treo('lai-omni-loa', 'Trượt ngang định vị âm học và phát nốt mở cửa hầm!', 7, 'Omni + Loa Sonar phá đá'),
  ]),
  ket(7, [{id: 'lam', dur: 210, el: <G7Lam />, sfx: [[90, 'ding.wav', 0.4], [145, 'ding.wav', 0.5]]}, tt(7, 'Omni + Loa Sonar phá đá', 'Khai mạc: 3 giờ', 'Cả 7 cô chú từ 7 mùa đã về tới CLB! Giờ mình tổng dọn sân trường và dựng lại sân khấu chính nhé!', [100, 95, 85, 60])]),
  mo(8, [
    {id: 'thu', dur: 185, el: <G8Mo />, sfx: [[58, 'wrong.wav', 0.5]]},
    treo('sola-bot', 'Dùng tuple, list, dict điều khiển Robot Lai vượt sa bàn liên hoàn 7 mùa!', 8, 'Sa bàn liên hoàn 7 mùa'),
  ]),
  ket(8, [{id: 'lam', dur: 210, el: <G8Lam />, sfx: [[145, 'ding.wav', 0.5]]}, tt(8, 'Sa bàn liên hoàn 7 mùa', 'Khai mạc: 2 giờ', 'Sa bàn liên hoàn đã thông suốt! Giờ còn sân khấu chính cần cả hai robot của Sola và Luna phối hợp dựng lại!', [100, 100, 95, 80])]),
  mo(9, [
    {id: 'thu', dur: 185, el: <G9Mo />, sfx: [[58, 'wrong.wav', 0.5]]},
    xe('luna-bot', 'Hai trụ sân khấu ở hai đầu phải mở khóa âm học dưới đất và thắp đèn trên cao cùng lúc!', 'Sola-Bot chạy dưới đất phát nốt nhạc, Luna-Bot bay trên không chấm đèn — song kiếm hợp bích!', 'Bộ đôi Sola-Bot & Luna-Bot', 120),
    treo('sola-bot', 'Sola-Bot và Luna-Bot song hành kích hoạt hai trụ sân khấu nhé!', 9, 'Sola-Bot & Luna-Bot'),
  ]),
  ket(9, [{id: 'lam', dur: 210, el: <G9Lam />, sfx: [[116, 'ding.wav', 0.5]]}, tt(9, 'Sola-Bot & Luna-Bot', 'Khai mạc: 1 giờ', 'Sola và Luna phối hợp tuyệt đẹp! Giờ chuẩn bị bấm nút khai mạc Ngày hội Robot toàn thị trấn nhé!', [100, 100, 100, 90])]),
  mo(10, [
    {id: 'tha-tay', dur: 120, el: <ThaTayM8 />, sfx: [W_IN, [50, 'riser.wav', 0.4]]},
  ]),
  ket(10, [
    {id: 'canh-1', dur: 120, el: <Canh1 />, sfx: [[95, 'ding.wav', 0.5]]},
    {id: 'canh-2', dur: 120, el: <Canh2 />, sfx: [[45, 'ding.wav', 0.5]]},
    tt(10, 'Giải cứu thị trấn', 'KHAI MẠC LỄ HỘI!', 'Cả 4 khu vực và 7 cửa ngõ thị trấn đã thông suốt 100%, Ngày hội Robot chính thức khai mạc!', [100, 100, 100, 100]),
    {id: 'huy-hieu', dur: 150, el: <TraoHuyHieuCLB />, sfx: [[18, 'impact.wav', 0.8], [20, 'ding.wav', 0.5]]},
    {id: 'ngoai-doi', dur: 150, el: <NgoaiDoiM8 />, sfx: [W_IN]},
    {id: 'dai-ket', dur: 150, el: <DaiKetCuc8Mua />, sfx: [[55, 'ding.wav', 0.5]]},
  ]),
];
