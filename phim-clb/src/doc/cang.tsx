// 10 phim gói mùa "Cảng sông · Cần cẩu container R1" (mua-4 trong game), khổ dọc 1080x1920:
// mỗi gói hai phim: MCG<n>-Mo (phim mở) và MCG<n>-Ket (đoạn kết sau màn trùm).
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Burst, C, CodeBox, FONT, Icon, Mascot, MONO, Say, Shake, ease, pop} from '../d10';
import {Phim, W_IN} from '../may-phim';
import {BangViec, CauTreo, ChuNay, Moc, NenHienTruong, NhanGoi, Nguoi, O, ODat, TrongXe, Vat, Xe, chonDangNguoi, tamO} from './kit-doc';

const NEN = 'nen-doc/mua-cang.png';
const DON = [
  'Vươn cần qua vách cảng & mép nước', 'Móc cẩu tầm xa gắp container', 'Quét mã vạch phân loại container', 'Xếp đủ chuyến tàu rời bến', 'Trượt dọc đường ray thép cầu cảng',
  'Cẩu đôi 2 container chồng cao', 'Cân tải trọng container siêu trường', 'Phối hợp băng chuyền & nút mở cổng', 'Phối hợp R2 rút chốt sắt cầu tàu', 'Thông cảng 4 chuyến tàu xuất khẩu',
];

/** Cô Mai điều độ viên cảng sông (ảnh TopView tách nền). */
const Mai: React.FC<{says: Say[]; at?: number; x?: number; side?: 'left' | 'right'; dang?: string}> = ({says, at = 0, x = 820, side = 'left', dang = 'mai-nghi'}) => (
  <Nguoi anh={dang} ten="CÔ MAI" mau="#CA8A04" x={x} h={600} at={at} says={says} side={side} bubbleW={560} bubbleTop={1230} />
);
const Sola: React.FC<{says: Say[]; mat: [number, string][]; at?: number; x?: number}> = ({says, mat, at = 0, x = 240}) => (
  <Mascot who="sola" x={x} h={540} at={at} faces={mat} says={says} bubbleW={520} bubbleTop={1240} />
);
const Luna: React.FC<{says: Say[]; mat: [number, string][]; at?: number; x?: number}> = ({says, mat, at = 0, x = 840}) => (
  <Mascot who="luna" x={x} h={540} at={at} faces={mat} says={says} side="left" bubbleW={520} bubbleTop={1240} lat />
);

/** Đồng hồ còi tàu rời cảng góc trên trái. */
const CoiTauBar: React.FC<{con: string; gap?: boolean}> = ({con, gap}) => {
  const f = useCurrentFrame();
  const nhay = gap && Math.floor(f / 10) % 2 === 0;
  return (
    <div style={{position: 'absolute', left: 36, top: 44, display: 'flex', alignItems: 'center', gap: 14, padding: '12px 24px', borderRadius: 999,
      background: nhay ? C.bad : '#fff', color: nhay ? '#fff' : C.ink, border: `4px solid ${C.ink}`, boxShadow: `0 8px 0 ${C.ink}`, fontFamily: MONO, fontWeight: 800, fontSize: 36}}>
      <Icon name="Anchor" size={40} color={nhay ? '#fff' : '#CA8A04'} stroke={2.6} />
      <span>{con}</span>
    </div>
  );
};

/** Bốn bến tàu container trên bảng thành tựu bốc xếp dần từ 0% đến 100%. */
const BenTauBar: React.FC<{chuyen: [number, number, number, number]; bao?: boolean}> = ({chuyen, bao}) => {
  const BEN = [
    {ten: 'Bến Đỏ', mau: '#EF4444', nen: '#FEE2E2'},
    {ten: 'Bến Lam', mau: '#0284C7', nen: '#E0F2FE'},
    {ten: 'Bến Vàng', mau: '#CA8A04', nen: '#FEF3C7'},
    {ten: 'Bến Xanh', mau: '#16A34A', nen: '#DCFCE7'},
  ];
  return (
    <div style={{position: 'absolute', left: 90, top: 150, width: 900, display: 'flex', gap: 14}}>
      {BEN.map((b, i) => (
        <div key={b.ten} style={{flex: 1, padding: '12px 14px', borderRadius: 20, background: bao && i === 2 ? '#FEE2E2' : b.nen,
          border: `4px solid ${C.ink}`, boxShadow: `0 8px 0 ${C.ink}`, fontFamily: FONT, fontWeight: 800, fontSize: 22, color: C.ink, whiteSpace: 'nowrap'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 8}}>
            <span>{b.ten}</span><span>{chuyen[i]}%</span>
          </div>
          <div style={{height: 14, borderRadius: 99, background: '#fff', border: `3px solid ${C.ink}`, overflow: 'hidden'}}>
            <div style={{width: `${chuyen[i]}%`, height: '100%', background: b.mau}} />
          </div>
        </div>
      ))}
    </div>
  );
};

/** Đoạn kết chung mùa Cảng sông: 4 bến tàu + bảng tiến độ + đồng hồ chuyến tàu + cô Mai. */
const ThanhTuu: React.FC<{moi: number; loi: string; con: string; so: number; ten: string; chuyen: [number, number, number, number]; xoa?: number}> =
  ({moi, loi, con, so, ten, chuyen, xoa}) => (
    <NenHienTruong anh={NEN} mua="cang" luoi={false} toi={0.52}>
      <BenTauBar chuyen={chuyen} bao={xoa !== undefined} />
      <BangViec tieuDe="Sổ điều độ bến cảng của cô Mai" dong={DON} xong={moi} moi={moi} xoa={xoa} at={22} y={270} />
      <CoiTauBar con={con} gap={xoa !== undefined} />
      <NhanGoi so={so} ten={ten} />
      <Mai dang={chonDangNguoi('mai', so, xoa)} says={[{at: 48, out: 200, text: loi}]} at={28} />
    </NenHienTruong>
  );

/** Đèn báo gió cảng góc trên phải (4, 0) gieo từ gói 1; đến gói 6 gió lớn làm nghiêng chồng container. */
const DenCangGoc: React.FC<{gio?: boolean}> = ({gio}) => {
  const f = useCurrentFrame(), p = tamO(4, 0);
  const g = gio ? 22 : 4 * Math.sin(f / 8);
  return (
    <div style={{position: 'absolute', left: p.x - O * 0.44, top: p.y - O * 0.42, width: O * 0.88, height: O * 0.84, borderRadius: 16,
      background: gio ? 'linear-gradient(135deg, #EF4444, #B91C1C)' : 'linear-gradient(135deg, #F59E0B, #D97706)',
      border: `4px solid ${C.ink}`, transform: `rotate(${g}deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <Icon name="Compass" size={46} color="#fff" />
    </div>
  );
};

/** Dây cáp cẩu nối từ cần cẩu tới container đang cẩu xa. */
const CapCau: React.FC<{tu: [number, number]; den: [number, number]; at: number; out: number}> = ({tu, den, at, out}) => {
  const f = useCurrentFrame();
  if (f < at || f > out) return null;
  const p1 = tamO(tu[0], tu[1]), p2 = tamO(den[0], den[1]);
  const dx = p2.x - p1.x, dy = p2.y - p1.y, d = Math.hypot(dx, dy), goc = (Math.atan2(dy, dx) * 180) / Math.PI;
  return (
    <div style={{position: 'absolute', left: p1.x, top: p1.y - 6, width: d, height: 12, transformOrigin: '0 50%', transform: `rotate(${goc}deg)`,
      background: '#FACC15', border: `3px solid ${C.ink}`, borderRadius: 99}} />
  );
};

/* ================================================================== GÓI 1 · Thân cần cẩu bánh lốp */
const R_G1M: Moc[] = [[0, 1, 5, -90], [18, 1, 5, -90], [65, 1, 4, -90], [95, 1, 4, -75]];
const G1Mo: React.FC = () => (
  <Shake hits={[66]} amp={10}>
    <NenHienTruong anh={NEN} mua="cang">
      <DenCangGoc />
      {[1, 2, 3].map((c) => <ODat key={c} ten="o-tuong-cang" c={c} r={3} />)}
      <ODat ten="o-dich" c={1} r={2} />
      <Xe anh="nhen" moc={R_G1M} doi={[[66, 'nhen-ngac']]} />
      <ChuNay chu="VƯỚNG THÀNH CẢNG!" at={66} den={138} x={tamO(1, 3).x + 110} y={tamO(1, 3).y - 40} />
      <CoiTauBar con="Tàu rời bến: 10 giờ" />
      <NhanGoi so={1} ten="Thân cần cẩu" />
      <Mai dang="mai-hoang" says={[{at: 72, out: 175, text: 'Bậc thềm cao quá, chân nhện không bước qua được!'}]} at={58} />
    </NenHienTruong>
  </Shake>
);
const R_G1K: Moc[] = [[0, 1, 5, -90], [18, 1, 5, -90], [65, 1, 4, -90], [115, 1, 2, -90], [150, 3, 2, 0]];
const G1Lam: React.FC = () => (
  <NenHienTruong anh={NEN} mua="cang">
    <DenCangGoc />
    {[2, 3].map((c) => <ODat key={c} ten="o-tuong-cang" c={c} r={3} />)}
    <ODat ten="o-dich" c={3} r={2} />
    <Xe anh="cau" moc={R_G1K} doi={[[145, 'cau-vui']]} />
    <Burst x={tamO(3, 2).x} y={tamO(3, 2).y} at={146} />
    <CodeBox lines={['# Cần cẩu bánh lốp lớn', 'for _ in range(3):', '    up_move()']}
      typeAt={15} x={44} y={260} w={560} title="can_cau_cang.py" />
    <CoiTauBar con="Tàu rời bến: 9 giờ 30" />
    <NhanGoi so={1} ten="Thân cần cẩu" />
  </NenHienTruong>
);

/* ================================================================== GÓI 2 · Móc cẩu tầm xa */
const R_G2M: Moc[] = [[0, 1, 4, 0], [18, 1, 4, 0], [58, 2, 4, 0], [95, 2, 4, 15]];
const G2Thu: React.FC = () => (
  <Shake hits={[60]} amp={10}>
    <NenHienTruong anh={NEN} mua="cang">
      <DenCangGoc />
      <ODat ten="o-nuoc" c={3} r={4} />
      <ODat ten="o-boong-tau" c={4} r={4} />
      <Vat ten="vat-cont-do" moc={[[0, 4, 4, 0]]} />
      <Xe anh="cau" moc={R_G2M} doi={[[60, 'cau-ngac']]} />
      <ChuNay chu="CÁCH MÉP NƯỚC!" at={60} den={140} x={tamO(3, 4).x + 60} y={tamO(3, 4).y - 50} />
      <CoiTauBar con="Tàu rời bến: 9 giờ" />
      <NhanGoi so={2} ten="Móc cẩu tầm xa" />
      <Mai says={[{at: 68, out: 220, text: 'Tàu cách cầu một luồng nước, xe không ra được!'}]} at={54} />
    </NenHienTruong>
  </Shake>
);
const R_G2K: Moc[] = [[0, 2, 4, 0], [155, 2, 4, 0]];
const C_G2K: Moc[] = [[0, 4, 4, 0], [40, 4, 4, 0], [95, 2, 2, 0], [155, 2, 2, 0]];
const G2Lam: React.FC = () => (
  <NenHienTruong anh={NEN} mua="cang">
    <DenCangGoc />
    <ODat ten="o-nuoc" c={3} r={4} />
    <ODat ten="o-boong-tau" c={4} r={4} />
    <ODat ten="o-bai-cont" c={2} r={2} />
    <CapCau tu={[2, 4]} den={[4, 4]} at={25} out={65} />
    <CapCau tu={[2, 4]} den={[2, 2]} at={66} out={110} />
    <Vat ten="vat-cont-do" moc={C_G2K} />
    <Xe anh="cau-moc" moc={R_G2K} doi={[[25, 'cau-moc-kep'], [115, 'cau-moc-vui']]} />
    <Burst x={tamO(2, 2).x} y={tamO(2, 2).y} at={115} />
    <CoiTauBar con="Tàu rời bến: 8 giờ 30" />
    <NhanGoi so={2} ten="Móc cẩu tầm xa" />
  </NenHienTruong>
);

/* ================================================================== GÓI 3 · Đầu đọc mã vạch */
const R_G3M: Moc[] = [[0, 2, 4, -90], [65, 2, 3, -90], [100, 2, 3, -75]];
const G3Thu: React.FC = () => (
  <Shake hits={[68]} amp={9}>
    <NenHienTruong anh={NEN} mua="cang">
      <DenCangGoc />
      <ODat ten="o-boong-tau" c={1} r={2} />
      <ODat ten="o-tau-vang" c={3} r={2} />
      <Vat ten="vat-kien-cang" moc={[[0, 2, 2, 0]]} />
      <Xe anh="cau-moc" moc={R_G3M} doi={[[68, 'cau-moc-ngac']]} />
      <ChuNay chu="NHẦM TÀU HÀNG!" at={68} den={142} x={tamO(2, 2).x + 90} y={tamO(2, 2).y - 40} />
      <CoiTauBar con="Tàu rời bến: 8 giờ" />
      <NhanGoi so={3} ten="Đầu đọc mã vạch" />
      <Sola mat={[[0, 'normal'], [66, 'surprised']]} says={[{at: 12, out: 64, text: 'Bạt phủ kín mít, đoán đại hàng Đỏ nhé!'}, {at: 72, out: 220, text: 'Ái, hàng Vàng, xếp nhầm bến rồi!'}]} />
    </NenHienTruong>
  </Shake>
);
const R_G3K: Moc[] = [[0, 2, 4, -90], [35, 2, 3, -90], [150, 2, 3, 0]];
const C_G3K: Moc[] = [[0, 2, 2, 0], [65, 2, 2, 0], [125, 3, 2, 0], [150, 3, 2, 0]];
const G3Lam: React.FC = () => (
  <NenHienTruong anh={NEN} mua="cang">
    <DenCangGoc />
    <ODat ten="o-boong-tau" c={1} r={2} />
    <ODat ten="o-tau-vang" c={3} r={2} />
    <CapCau tu={[2, 3]} den={[3, 2]} at={65} out={128} />
    <Vat ten="vat-cont-vang" moc={C_G3K} />
    <Xe anh="cau-quet" moc={R_G3K} doi={[[35, 'cau-quet-bat'], [130, 'cau-quet-vui']]} />
    <Burst x={tamO(3, 2).x} y={tamO(3, 2).y} at={130} />
    <CodeBox lines={['ma = scan()  # đọc mã vạch', 'if ma == "vang":', '    place_right()']}
      typeAt={15} x={44} y={260} w={580} title="quet_ma_cont.py" />
    <CoiTauBar con="Tàu rời bến: 7 giờ 30" />
    <NhanGoi so={3} ten="Đầu đọc mã vạch" />
  </NenHienTruong>
);

/* ================================================================== GÓI 4 · Bến tàu xuất hàng (Cơ chế ngôi sao) */
const R_G4M: Moc[] = [[0, 2, 4, -90], [80, 2, 4, -90]];
const G4Thu: React.FC = () => (
  <Shake hits={[60]} amp={10}>
    <NenHienTruong anh={NEN} mua="cang">
      <DenCangGoc />
      <ODat ten="o-boong-tau-1" c={2} r={2} />
      <Vat ten="vat-cont-do" moc={[[0, 1, 4, 0]]} />
      <Vat ten="vat-cont-lam" moc={[[0, 3, 4, 0]]} />
      <Xe anh="cau-quet" moc={R_G4M} doi={[[55, 'cau-quet-ngac']]} />
      <ChuNay chu="CHƯA ĐỦ CHUYẾN!" at={58} den={140} x={tamO(2, 2).x + 80} y={tamO(2, 2).y - 45} />
      <CoiTauBar con="Tàu rời bến: 7 giờ" />
      <NhanGoi so={4} ten="Bến tàu xuất hàng" />
      <Mai dang="mai-sot-ruot" says={[{at: 64, out: 230, text: 'Mỗi tàu xếp đủ 2 container mới được rời cảng!'}]} at={50} />
    </NenHienTruong>
  </Shake>
);
const R_G4K: Moc[] = [[0, 2, 4, -90], [155, 2, 4, -90]];
const C1_G4: Moc[] = [[0, 1, 4, 0], [25, 1, 4, 0], [65, 2, 2, 0], [155, 2, 2, 0]];
const C2_G4: Moc[] = [[0, 3, 4, 0], [85, 3, 4, 0], [135, 2, 2, 0], [155, 2, 2, 0]];
const G4Lam: React.FC = () => {
  const f = useCurrentFrame();
  const boong = f >= 135 ? 'o-boong-tau-2' : f >= 65 ? 'o-boong-tau-1' : 'o-boong-tau';
  return (
    <NenHienTruong anh={NEN} mua="cang">
      <DenCangGoc />
      <ODat ten={boong} c={2} r={2} />
      <CapCau tu={[2, 4]} den={[2, 2]} at={25} out={65} />
      <CapCau tu={[2, 4]} den={[2, 2]} at={85} out={135} />
      <Vat ten="vat-cont-do" moc={C1_G4} mo={(fr) => (fr >= 68 ? 0 : 1)} />
      <Vat ten="vat-cont-lam" moc={C2_G4} mo={(fr) => (fr >= 138 ? 0 : 1)} />
      <Xe anh="cau-quet" moc={R_G4K} doi={[[138, 'cau-quet-vui']]} />
      <Burst x={tamO(2, 2).x} y={tamO(2, 2).y} at={66} />
      <Burst x={tamO(2, 2).x} y={tamO(2, 2).y} at={138} />
      <CoiTauBar con="Tàu rời bến: 6 giờ 30" />
      <NhanGoi so={4} ten="Bến tàu xuất hàng" />
    </NenHienTruong>
  );
};

/* ================================================================== GÓI 5 · Khớp kẹp đường ray */
const R_G5M: Moc[] = [[0, 0, 4, 0], [35, 1, 4, 0], [85, 2, 4, 0]];
const G5Thu: React.FC = () => (
  <Shake hits={[65]} amp={9}>
    <NenHienTruong anh={NEN} mua="cang">
      <DenCangGoc />
      {[0, 1, 2, 3, 4].map((c) => <ODat key={c} ten="o-ray" c={c} r={4} />)}
      <Vat ten="vat-cont-do" moc={[[0, 4, 3, 0]]} />
      <Xe anh="cau-quet" moc={R_G5M} doi={[[65, 'cau-quet-ngac']]} />
      <ChuNay chu="CHẬM NHỊP TÀU!" at={65} den={140} x={tamO(2, 4).x + 90} y={tamO(2, 4).y - 35} />
      <CoiTauBar con="Tàu rời bến: 6 giờ" />
      <NhanGoi so={5} ten="Khớp kẹp đường ray" />
      <Luna mat={[[0, 'normal'], [65, 'surprised']]} says={[{at: 12, out: 60, text: 'Cầu cảng dài tít, nhích từng ô lâu quá!'}, {at: 68, out: 220, text: 'Có ray thép dưới sàn, giá mà trượt vèo!'}]} />
    </NenHienTruong>
  </Shake>
);
const R_G5K: Moc[] = [[0, 0, 4, 0], [20, 0, 4, 0], [70, 4, 4, 0], [155, 4, 4, -90]];
const C_G5K: Moc[] = [[0, 4, 3, 0], [80, 4, 3, 0], [130, 4, 2, 0], [155, 4, 2, 0]];
const G5Lam: React.FC = () => (
  <NenHienTruong anh={NEN} mua="cang">
    <DenCangGoc />
    {[0, 1, 2, 3, 4].map((c) => <ODat key={c} ten="o-ray" c={c} r={4} />)}
    <ODat ten="o-boong-tau" c={4} r={2} />
    <CapCau tu={[4, 4]} den={[4, 2]} at={80} out={130} />
    <Vat ten="vat-cont-do" moc={C_G5K} />
    <Xe anh="cau-ray" moc={R_G5K} doi={[[132, 'cau-ray-vui']]} />
    <Burst x={tamO(4, 2).x} y={tamO(4, 2).y} at={132} />
    <CodeBox lines={['# Trượt dọc ray thép cầu cảng', 'slide_rail("right", 4)', 'crane_grab(); crane_drop()']}
      typeAt={15} x={44} y={260} w={590} title="truot_ray_cang.py" />
    <CoiTauBar con="Tàu rời bến: 5 giờ 30" />
    <NhanGoi so={5} ten="Khớp kẹp đường ray" />
  </NenHienTruong>
);

/* ================================================================== GÓI 6 · Cẩu đôi 2 container (Biến cố giữa mùa) */
const R_G6M: Moc[] = [[0, 2, 4, -90], [100, 2, 4, -90]];
const G6Thu: React.FC = () => (
  <Shake hits={[22, 68]} amp={12}>
    <NenHienTruong anh={NEN} mua="cang">
      <DenCangGoc gio />
      <ODat ten="o-bai-cont" c={2} r={2} />
      <Vat ten="vat-chong-2" moc={[[0, 2, 2, 0]]} />
      <Xe anh="cau-ray" moc={R_G6M} doi={[[68, 'cau-quet-ngac']]} />
      <ChuNay chu="GIÓ LỚN TRÊN CẢNG!" at={20} den={85} x={tamO(3, 1).x} y={tamO(3, 1).y} />
      <ChuNay chu="CHỒNG CAO NẶNG!" at={68} den={145} x={tamO(2, 2).x + 80} y={tamO(2, 2).y - 45} />
      <CoiTauBar con="GIÔNG GIÓ TRÊN CẢNG!" gap />
      <NhanGoi so={6} ten="Cẩu đôi 2 container" />
      <Mai dang="mai-hoang" says={[{at: 52, out: 230, text: 'Gió giông lắc chồng thùng, gắp lẻ không kịp!'}]} at={40} />
    </NenHienTruong>
  </Shake>
);
const R_G6K: Moc[] = [[0, 2, 4, -90], [150, 2, 4, -90]];
const C_G6K: Moc[] = [[0, 2, 2, 0], [35, 2, 2, 0], [115, 3, 2, 0], [150, 3, 2, 0]];
const G6Lam: React.FC = () => (
  <NenHienTruong anh={NEN} mua="cang">
    <DenCangGoc gio />
    <ODat ten="o-bai-cont" c={2} r={2} />
    <ODat ten="o-boong-tau-2" c={3} r={2} />
    <CapCau tu={[2, 4]} den={[3, 2]} at={35} out={118} />
    <Vat ten="vat-chong-2" moc={C_G6K} />
    <Xe anh="cau-doi" moc={R_G6K} doi={[[120, 'cau-doi-vui']]} />
    <Burst x={tamO(3, 2).x} y={tamO(3, 2).y} at={120} />
    <CoiTauBar con="Tàu rời bến: 4 giờ 30" />
    <NhanGoi so={6} ten="Cẩu đôi 2 container" />
  </NenHienTruong>
);

/* ================================================================== GÓI 7 · Cảm biến cân tải */
const R_G7M: Moc[] = [[0, 2, 4, -90], [100, 2, 4, -90]];
const C_G7M: Moc[] = [[0, 1, 2, 0], [30, 1, 2, 0], [68, 2, 2, 18], [100, 2, 2, 18]];
const G7Thu: React.FC = () => (
  <Shake hits={[68]} amp={10}>
    <NenHienTruong anh={NEN} mua="cang">
      <ODat ten="o-boong-tau" c={2} r={2} />
      <ODat ten="o-tau-vang" c={3} r={2} />
      <CapCau tu={[2, 4]} den={[2, 2]} at={25} out={68} />
      <Vat ten="vat-cont-nang" moc={C_G7M} />
      <Xe anh="cau-doi" moc={R_G7M} doi={[[68, 'cau-du-ngac']]} />
      <ChuNay chu="QUÁ TẢI BOONG!" at={68} den={140} x={tamO(2, 2).x + 90} y={tamO(2, 2).y - 40} />
      <CoiTauBar con="Tàu rời bến: 4 giờ" />
      <NhanGoi so={7} ten="Cảm biến cân tải" />
      <Sola mat={[[0, 'normal'], [68, 'surprised']]} says={[{at: 12, out: 64, text: 'Thùng này giống hệt mấy thùng kia, lên tàu nhỏ!'}, {at: 72, out: 225, text: 'Ối, nặng 15 tấn, phải sang tàu lớn!'}]} />
    </NenHienTruong>
  </Shake>
);
const R_G7K: Moc[] = [[0, 2, 4, -90], [150, 2, 4, -90]];
const C_G7K: Moc[] = [[0, 1, 2, 0], [35, 1, 2, 0], [115, 3, 2, 0], [150, 3, 2, 0]];
const G7Lam: React.FC = () => (
  <NenHienTruong anh={NEN} mua="cang">
    <ODat ten="o-boong-tau" c={2} r={2} />
    <ODat ten="o-tau-vang" c={3} r={2} />
    <CapCau tu={[2, 4]} den={[3, 2]} at={35} out={118} />
    <Vat ten="vat-cont-nang" moc={C_G7K} />
    <Xe anh="cau-du" moc={R_G7K} doi={[[120, 'cau-du-vui']]} />
    <Burst x={tamO(3, 2).x} y={tamO(3, 2).y} at={120} />
    <CodeBox lines={['# Cân tải trọng ở đầu cáp', 'w = weight()', 'if w > 10: drop_heavy_ship()']}
      typeAt={15} x={44} y={260} w={590} title="can_tai_trong.py" />
    <CoiTauBar con="Tàu rời bến: 3 giờ 30" />
    <NhanGoi so={7} ten="Cảm biến cân tải" />
  </NenHienTruong>
);

/* ================================================================== GÓI 8 · Kết hợp băng chuyền & nút đè cảng cũ */
const R_G8M: Moc[] = [[0, 2, 4, -90], [80, 2, 4, -90]];
const C_G8M: Moc[] = [[0, 1, 3, 0], [35, 3, 3, 0], [75, 4, 3, 20]];
const G8Thu: React.FC = () => (
  <Shake hits={[65]} amp={9}>
    <NenHienTruong anh={NEN} mua="cang">
      <ODat ten="o-bang-phai" c={1} r={3} />
      <ODat ten="o-bang-phai" c={2} r={3} />
      <ODat ten="o-bang-phai" c={3} r={3} />
      <Vat ten="vat-cont-xanh" moc={C_G8M} />
      <Xe anh="cau-du" moc={R_G8M} doi={[[65, 'cau-du-ngac']]} />
      <ChuNay chu="TRÔI QUA CẦU TÀU!" at={65} den={140} x={tamO(3, 3).x + 70} y={tamO(3, 3).y - 40} />
      <CoiTauBar con="Tàu rời bến: 3 giờ" />
      <NhanGoi so={8} ten="Băng chuyền cầu cảng" />
      <Mai dang="mai-tin" says={[{at: 66, out: 230, text: 'Hàng chú Tùng, cô Hạnh tới, bấm chặn đúng nhịp!'}]} at={52} />
    </NenHienTruong>
  </Shake>
);
const R_G8K: Moc[] = [[0, 1, 4, 0], [45, 2, 4, -90], [155, 2, 4, -90]];
const C_G8K: Moc[] = [[0, 1, 3, 0], [50, 2, 3, 0], [115, 2, 2, 0], [155, 2, 2, 0]];
const G8Lam: React.FC = () => {
  const f = useCurrentFrame(), bat = f >= 42;
  return (
    <NenHienTruong anh={NEN} mua="cang">
      <ODat ten={bat ? 'o-nut-bat' : 'o-nut-tat'} c={2} r={4} />
      <ODat ten="o-bang-phai" c={1} r={3} />
      <ODat ten="o-boong-tau" c={2} r={2} />
      <CapCau tu={[2, 4]} den={[2, 2]} at={55} out={118} />
      <Vat ten="vat-cont-xanh" moc={C_G8K} />
      <Xe anh="cau-du" moc={R_G8K} doi={[[120, 'cau-du-vui']]} />
      <Burst x={tamO(2, 2).x} y={tamO(2, 2).y} at={120} />
      <CoiTauBar con="Tàu rời bến: 2 giờ 30" />
      <NhanGoi so={8} ten="Băng chuyền cầu cảng" />
    </NenHienTruong>
  );
};

/* ================================================================== GÓI 9 · Phối hợp R2 ở cảng */
const R_G9M: Moc[] = [[0, 2, 4, -90], [90, 2, 4, -90]];
const G9Thu: React.FC = () => (
  <Shake hits={[60]} amp={9}>
    <NenHienTruong anh={NEN} mua="cang">
      <ODat ten="o-ray" c={1} r={4} />
      <ODat ten="o-ray" c={2} r={4} />
      <Vat ten="vat-khoi-sat" moc={[[0, 3, 4, 0]]} />
      <Vat ten="vat-cont-do" moc={[[0, 3, 2, 0]]} />
      <Xe anh="cau-du" moc={R_G9M} doi={[[60, 'cau-du-ngac']]} />
      <ChuNay chu="KẸT CHỐT ĐƯỜNG RAY!" at={60} den={140} x={tamO(3, 4).x + 70} y={tamO(3, 4).y - 35} />
      <CoiTauBar con="Tàu rời bến: 2 giờ" />
      <NhanGoi so={9} ten="Phối hợp R2 ở cảng" />
      <Sola mat={[[0, 'normal'], [60, 'surprised']]} says={[{at: 14, out: 58, text: 'Chốt sắt bãi bác Sơn kẹt trên ray cần cẩu!'}, {at: 64, out: 220, text: 'Móc cẩu không hút sắt đặc, gọi R2 nam châm!'}]} />
    </NenHienTruong>
  </Shake>
);
const R2_G9K: Moc[] = [[0, 3, 5, -90], [45, 3, 5, -90], [85, 3, 5, -90]];
const K_G9K: Moc[] = [[0, 3, 4, 0], [35, 3, 4, 0], [72, 3, 5, 0], [155, 3, 5, 0]];
const R1_G9K: Moc[] = [[0, 1, 4, 0], [75, 1, 4, 0], [110, 3, 4, -90], [155, 3, 4, -90]];
const C_G9K: Moc[] = [[0, 3, 2, 0], [110, 3, 2, 0], [145, 4, 2, 0], [155, 4, 2, 0]];
const G9Lam: React.FC = () => (
  <NenHienTruong anh={NEN} mua="cang">
    {[1, 2, 3].map((c) => <ODat key={c} ten="o-ray" c={c} r={4} />)}
    <ODat ten="o-boong-tau" c={4} r={2} />
    <CapCau tu={[3, 4]} den={[4, 2]} at={112} out={145} />
    <Vat ten="vat-khoi-sat" moc={K_G9K} />
    <Vat ten="vat-cont-do" moc={C_G9K} />
    <Xe anh="r2" moc={R2_G9K} doi={[[30, 'r2-hut'], [75, 'r2-vui']]} />
    <Xe anh="cau-du" moc={R1_G9K} doi={[[146, 'cau-du-vui']]} />
    <Burst x={tamO(3, 4).x} y={tamO(3, 4).y} at={72} />
    <Burst x={tamO(4, 2).x} y={tamO(4, 2).y} at={146} />
    <CoiTauBar con="Tàu rời bến: 1 giờ 30" />
    <NhanGoi so={9} ten="Phối hợp R2 ở cảng" />
  </NenHienTruong>
);

/* ================================================================== GÓI 10 · Xuất xưởng Cần cẩu container R1 */
const ThaTayCang: React.FC = () => {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  return (
    <NenHienTruong anh={NEN} mua="cang" luoi={false} toi={0.45}>
      <div style={{position: 'absolute', left: 60, top: 200, right: 60, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 52, color: '#fff', textShadow: `0 6px 0 ${C.ink}`}}>
        NÂNG CẤP HOÀN CHỈNH CẦN CẨU CẢNG R1
      </div>
      <div style={{position: 'absolute', left: 540 - 260, top: 430, width: 520, height: 520}}>
        <Img src={staticFile('robot/cang/cau-du-vui.png')} style={{width: '100%', height: '100%', transform: 'rotate(-90deg)'}} />
      </div>
      {[
        {nhan: 'Thân cần cẩu & Khớp ray', x: 70, y: 420, at: 8},
        {nhan: 'Móc cẩu tầm xa & Cẩu đôi', x: 620, y: 420, at: 18},
        {nhan: 'Đầu đọc mã vạch scan()', x: 70, y: 820, at: 28},
        {nhan: 'Cảm biến cân tải weight()', x: 610, y: 820, at: 38},
      ].map((m) => (
        <div key={m.nhan} style={{position: 'absolute', left: m.x, top: m.y, padding: '14px 24px', borderRadius: 20, background: C.sola,
          border: `4px solid ${C.ink}`, boxShadow: `0 8px 0 ${C.ink}`, fontFamily: FONT, fontWeight: 800, fontSize: 28, color: C.ink, transform: `scale(${pop(f, m.at, fps)})`}}>
          {m.nhan}
        </div>
      ))}
      <Sola mat={[[0, 'happy']]} says={[{at: 12, out: 150, text: 'Cần cẩu container R1 đã đủ trọn bộ đồ nghề bến cảng, sẵn sàng xuất 4 chuyến tàu lớn!'}]} />
    </NenHienTruong>
  );
};

const R1_C1: Moc[] = [[0, 1, 4, 0], [45, 3, 4, -90], [140, 3, 4, -90]];
const C1_C1: Moc[] = [[0, 3, 2, 0], [50, 3, 2, 0], [115, 2, 2, 0], [145, 2, 2, 0]];
const G10Canh1: React.FC = () => (
  <NenHienTruong anh={NEN} mua="cang">
    {[1, 2, 3].map((c) => <ODat key={c} ten="o-ray" c={c} r={4} />)}
    <ODat ten="o-boong-tau-2" c={2} r={2} />
    <CapCau tu={[3, 4]} den={[2, 2]} at={50} out={115} />
    <Vat ten="vat-chong-2" moc={C1_C1} />
    <Xe anh="cau-du" moc={R1_C1} doi={[[118, 'cau-du-vui']]} />
    <Burst x={tamO(2, 2).x} y={tamO(2, 2).y} at={118} />
    <CoiTauBar con="Ca trực 1/2 · Cẩu đôi container lên tàu" />
  </NenHienTruong>
);

const R2_C2: Moc[] = [[0, 1, 4, 0], [45, 1, 4, 0], [160, 1, 4, 0]];
const K_C2: Moc[] = [[0, 2, 4, 0], [20, 2, 4, 0], [55, 1, 4, 0], [160, 1, 4, 0]];
const R1_C2: Moc[] = [[0, 3, 4, -90], [160, 3, 4, -90]];
const C2_C2: Moc[] = [[0, 3, 3, 0], [60, 3, 3, 0], [125, 3, 2, 0], [160, 3, 2, 0]];
const G10Canh2: React.FC = () => (
  <NenHienTruong anh={NEN} mua="cang">
    <ODat ten="o-tau-vang" c={3} r={2} />
    <CapCau tu={[3, 4]} den={[3, 2]} at={60} out={125} />
    <Vat ten="vat-khoi-sat" moc={K_C2} />
    <Vat ten="vat-cont-nang" moc={C2_C2} />
    <Xe anh="r2-hut" moc={R2_C2} doi={[[58, 'r2-vui']]} />
    <Xe anh="cau-du" moc={R1_C2} doi={[[128, 'cau-du-vui']]} />
    <Burst x={tamO(2, 4).x} y={tamO(2, 4).y} at={55} />
    <Burst x={tamO(3, 2).x} y={tamO(3, 2).y} at={128} />
    <CoiTauBar con="Ca trực 2/2 · Xuất tàu siêu trường" />
  </NenHienTruong>
);

const XuatXuongCang: React.FC = () => {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  const PART = ['Thân cần cẩu bánh lốp · Khớp trượt đường ray', 'Móc cẩu tầm xa · Ngàm cẩu đôi 2 container', 'Đầu đọc mã vạch scan() · Cảm biến cân tải weight()'];
  return (
    <NenHienTruong anh={NEN} mua="cang" luoi={false} toi={0.42}>
      <div style={{position: 'absolute', left: 50, top: 120, right: 50, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 54, color: C.yellow, textShadow: `0 6px 0 ${C.ink}`}}>
        XUẤT XƯỞNG: CẦN CẨU CẢNG R1
      </div>
      <div style={{position: 'absolute', left: 540 - 300, top: 210, width: 600, height: 600, transform: `scale(${pop(f, 8, fps)})`}}>
        <Img src={staticFile('robot/cang/cau-du-vui.png')} style={{width: '100%', height: '100%', transform: 'rotate(-90deg)'}} />
      </div>
      {PART.map((p, i) => (
        <div key={p} style={{position: 'absolute', left: 80, right: 80, top: 830 + i * 105, opacity: ease(f, [10 + i * 10, 22 + i * 10], [0, 1]),
          padding: '16px 26px', borderRadius: 22, background: 'rgba(15,23,42,0.85)', border: `4px solid ${C.yellow}`,
          color: '#fff', fontFamily: FONT, fontWeight: 800, fontSize: 34, display: 'flex', gap: 16, alignItems: 'center'}}>
          <Icon name="CircleCheck" size={40} color={C.yellow} />{p}
        </div>
      ))}
      <Burst x={540} y={520} at={18} />
      <Mai dang="mai-mung" x={820} says={[{at: 12, out: 88, text: 'Cảm ơn hai em! Cả 4 chuyến tàu container đều đã xuất bến đúng giờ, cảng sông thông suốt rồi!'}]} at={6} />
      <Sola x={230} mat={[[0, 'happy']]} says={[{at: 94, out: 172, text: 'Cần cẩu R1 ở lại trực cảng cùng cô Mai, tụi em xuôi dòng sang Trạm thủy lợi bác Bình đây ạ!'}]} />
    </NenHienTruong>
  );
};

const NgoaiDoiCang: React.FC = () => {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  const THE = [
    {icon: 'Anchor' as const, ten: 'Cẩu Giàn Container Tự Động (STS / RMG)', mo: 'Trượt trên đường ray thép dọc cầu cảng, tự động gắp và xếp container chính xác từng centimet.'},
    {icon: 'Cpu' as const, ten: 'Cổng Quét Mã Vạch & Cân Tải Thông Minh', mo: 'Quét mã số container bằng camera quang học và đo tải trọng ngay trên cáp cẩu trước khi xếp lên tàu.'},
  ];
  return (
    <NenHienTruong anh={NEN} mua="cang" luoi={false} toi={0.58}>
      <div style={{position: 'absolute', left: 40, top: 120, right: 40, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 48, color: C.yellow, textShadow: `0 6px 0 ${C.ink}`}}>
        CÔNG NGHỆ NGOÀI ĐỜI THỰC · CẢNG SÔNG
      </div>

      <div style={{position: 'absolute', left: 50, right: 50, top: 210, height: 275, borderRadius: 32,
        background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', border: `6px solid ${C.ink}`,
        boxShadow: `0 14px 0 ${C.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 34px',
        transform: `scale(${pop(f, 6, fps)})`, boxSizing: 'border-box'}}>
        <div style={{width: 225, height: 225, borderRadius: 28, background: 'rgba(255,255,255,0.08)', border: `4px solid ${C.yellow}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
          <Img src={staticFile('robot/cang/cau-du-vui.png')} style={{width: 205, height: 205, objectFit: 'contain', transform: 'rotate(-90deg)'}} />
        </div>
        <div style={{flex: 1, marginLeft: 28, fontFamily: FONT, color: '#fff'}}>
          <div style={{display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 99, background: '#CA8A04',
            border: '3px solid #fff', fontSize: 22, fontWeight: 900, marginBottom: 10}}>
            TỪ SA BÀN CLB RA THỰC TẾ
          </div>
          <div style={{fontSize: 38, fontWeight: 900, color: '#FDE047', marginBottom: 6}}>Cần Cẩu Container Tự Động R1</div>
          <div style={{fontSize: 26, fontWeight: 700, color: '#E2E8F0', lineHeight: 1.3}}>Trượt ray cầu cảng, quét mã phân loại và cân tải trọng container xuất khẩu.</div>
        </div>
      </div>

      {THE.map((t, i) => (
        <div key={t.ten} style={{position: 'absolute', left: 50, right: 50, top: 515 + i * 325, height: 295, padding: '28px 34px', borderRadius: 30, background: '#fff',
          border: `6px solid ${C.ink}`, boxShadow: `0 14px 0 ${C.ink}`, display: 'flex', gap: 28, alignItems: 'center',
          transform: `scale(${pop(f, 12 + i * 16, fps)})`, boxSizing: 'border-box'}}>
          <div style={{width: 150, height: 150, borderRadius: 28, background: '#CA8A04', border: `5px solid ${C.ink}`,
            boxShadow: `0 8px 0 ${C.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
            <Icon name={t.icon} size={84} color="#fff" />
          </div>
          <div style={{fontFamily: FONT, color: C.ink, flex: 1}}>
            <div style={{fontWeight: 900, fontSize: 38, marginBottom: 10, lineHeight: 1.2}}>{t.ten}</div>
            <div style={{fontWeight: 800, fontSize: 28, color: '#334155', lineHeight: 1.34}}>{t.mo}</div>
          </div>
        </div>
      ))}
      <Sola mat={[[0, 'happy']]} says={[{at: 14, out: 142, text: 'Ở các cảng biển thông minh ngoài đời, cần cẩu tự động cũng trượt ray và đọc mã container y hệt R1 vậy!'}]} />
    </NenHienTruong>
  );
};

const NhaMuaBenSong: React.FC = () => {
  const f = useCurrentFrame();
  const s = 1 + 0.04 * Math.sin(f / 8);
  return (
    <AbsoluteFill style={{background: C.ink, overflow: 'hidden'}}>
      <Img src={staticFile('nen-doc/mua-song.png')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${s})`}} />
      <div style={{position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.42)'}} />
      <div style={{position: 'absolute', left: 60, right: 60, top: 200, padding: '28px 36px', borderRadius: 28, background: '#0284C7',
        border: `5px solid ${C.ink}`, boxShadow: `0 12px 0 ${C.ink}`, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 46, color: '#fff'}}>
        CHẶNG TIẾP THEO · BẾN SÔNG & TRẠM THỦY LỢI BÁC BÌNH
      </div>
      <Nguoi anh="ba-tin" ten="BÁC BÌNH" mau="#0284C7" x={820} h={600} at={8} side="left" bubbleW={560} bubbleTop={1230}
        says={[{at: 12, out: 76, text: 'Tàu hàng ở cảng cô Mai đã rời bến, hai cháu xuôi sông xuống giúp bác khơi thông 4 tuyến kênh trước giờ triều cường nhé!'}]} />
      <Sola x={230} mat={[[0, 'surprised'], [78, 'happy']]} says={[{at: 82, out: 145, text: 'Mùa tiếp theo mình xuống nước chế tạo Tàu thủy lợi R1 và đo dòng chảy nào!'}]} />
    </AbsoluteFill>
  );
};

/* ================================================================== ĐĂNG KÝ 20 PHIM MÙA CẢNG SÔNG (MCG1..MCG10) */
const mo = (so: number, canh: Phim['canh']): Phim => ({id: `MCG${so}-Mo`, doc: true, canh});
const ket = (so: number, canh: Phim['canh']): Phim => ({id: `MCG${so}-Ket`, doc: true, canh});
const tt = (so: number, ten: string, con: string, loi: string, chuyen: [number, number, number, number], xoa?: number) => ({
  id: 'thanh-tuu', dur: 170, el: <ThanhTuu moi={so - 1} loi={loi} con={con} so={so} ten={ten} chuyen={chuyen} xoa={xoa} />,
  sfx: [[22, xoa !== undefined ? 'wrong.wav' : 'ding.wav', 0.5]] as any,
});
const xe = (anh: string, luna: string, sola: string, tenPart: string, cach = 120) => ({
  id: 'trong-xe', dur: cach + 70,
  el: <TrongXe mua="cang" anh={anh} cach={cach} tenPart={tenPart} luna={[{at: 10, out: 70, text: luna}]} sola={[{at: 76, out: cach - 4, text: sola}]}
    lunaMat={[[0, 'thinking'], [76, 'happy']]} solaMat={[[0, 'thinking'], [76, 'confident']]} />,
  sfx: [[cach, 'impact.wav', 0.5], [cach, 'ding.wav', 0.4]] as any,
});
const treo = (anh: string, cau: string, so: number, ten: string) => ({
  id: 'cau-treo', dur: 110, el: <CauTreo mua="cang" xoay={-90} anh={anh} cau={cau} so={so} ten={ten} />, sfx: [W_IN, [40, 'pop.wav', 0.4]] as any,
});

export const PHIM_CANG: Phim[] = [
  mo(1, [
    {id: 'hien-truong', dur: 180, el: <G1Mo />, sfx: [W_IN, [66, 'wrong.wav', 0.5]]},
    xe('cau', 'Bậc thềm cầu cảng cao và rộng quá, làm sao bước qua gọn gàng?', 'Lắp khung gầm cần cẩu bánh lốp lớn và tháp cần vươn cao!', 'Thân cần cẩu bánh lốp', 120),
    treo('cau', 'Điều khiển cần cẩu tiến vào bãi container nào!', 1, 'Thân cần cẩu'),
  ]),
  ket(1, [{id: 'lam', dur: 165, el: <G1Lam />, sfx: [[146, 'ding.wav', 0.5]]}, tt(1, 'Thân cần cẩu', 'Tàu rời bến: 9 giờ', 'Khung gầm cần cẩu vững quá! Giờ vươn cần gắp container ngoài mạn tàu nhé!', [25, 0, 0, 0])]),
  mo(2, [
    {id: 'thu', dur: 235, el: <G2Thu />, sfx: [[60, 'wrong.wav', 0.5]]},
    xe('cau-moc', 'Tàu đậu cách bờ một luồng nước, làm sao gắp container từ xa?', 'Lắp móc cẩu tầm xa trên đỉnh cần — vươn xa 2–3 ô nhấc bổng container!', 'Móc cẩu tầm xa', 125),
    treo('cau-moc', 'Vươn móc cẩu qua mép nước gắp container về bãi nào!', 2, 'Móc cẩu tầm xa'),
  ]),
  ket(2, [{id: 'lam', dur: 165, el: <G2Lam />, sfx: [[115, 'ding.wav', 0.5]]}, tt(2, 'Móc cẩu tầm xa', 'Tàu rời bến: 8 giờ', 'Cẩu qua mặt nước êm ru! Nhưng lô hàng mới cập cảng bọc kín bạt chưa rõ màu tàu đấy!', [50, 15, 0, 0])]),
  mo(3, [
    {id: 'thu', dur: 240, el: <G3Thu />, sfx: [[68, 'wrong.wav', 0.5]]},
    xe('cau-quet-bat', 'Container phủ bạt kín mít, làm sao biết xếp lên tàu Đỏ, Lam hay Vàng?', 'Gắn đầu đọc mã vạch laser ở mũi cần — quét scan() biết ngay màu chuyến tàu!', 'Đầu đọc mã vạch laser', 125),
    treo('cau-quet-bat', 'Quét mã vạch bằng hàm trả về rồi xếp đúng bến tàu nhé!', 3, 'Đầu đọc mã vạch'),
  ]),
  ket(3, [{id: 'lam', dur: 165, el: <G3Lam />, sfx: [[130, 'ding.wav', 0.5]]}, tt(3, 'Đầu đọc mã vạch', 'Tàu rời bến: 7 giờ', 'Quét mã vạch chuẩn không trượt phát nào! Giờ xếp đủ hàng cho các chuyến tàu xuất bến nhé!', [75, 35, 15, 0])]),
  mo(4, [
    {id: 'thu', dur: 245, el: <G4Thu />, sfx: [[58, 'wrong.wav', 0.5]]},
    treo('cau-quet', 'Xếp đủ 2 container lên boong để tàu kéo còi xuất bến nào!', 4, 'Bến tàu xuất hàng'),
  ]),
  ket(4, [{id: 'lam', dur: 165, el: <G4Lam />, sfx: [[66, 'click.wav', 0.5], [138, 'ding.wav', 0.5]]}, tt(4, 'Bến tàu xuất hàng', 'Tàu rời bến: 6 giờ', 'Chuyến tàu đầu tiên đã kéo còi rời cảng! Sang cầu tàu dài có đường ray thép nhé!', [85, 65, 35, 15])]),
  mo(5, [
    {id: 'thu', dur: 235, el: <G5Thu />, sfx: [[65, 'wrong.wav', 0.5]]},
    xe('cau-ray', 'Cầu cảng dài mà đi từng bước thì chậm quá, tận dụng đường ray thép thế nào?', 'Lắp bộ bánh kẹp đường ray thép — hạ khớp trượt một mạch dọc ray cầu cảng!', 'Khớp kẹp đường ray', 125),
    treo('cau-ray', 'Trượt dọc đường ray thép tiếp cận nhanh các khoang tàu nào!', 5, 'Khớp kẹp đường ray'),
  ]),
  ket(5, [{id: 'lam', dur: 165, el: <G5Lam />, sfx: [[132, 'ding.wav', 0.5]]}, tt(5, 'Khớp kẹp đường ray', 'Tàu rời bến: 5 giờ', 'Trượt trên ray nhanh gấp bội! Nhưng coi chừng gió lớn ngoài cửa sông đang thổi vào cảng kìa!', [90, 80, 50, 30])]),
  mo(6, [
    {id: 'thu', dur: 245, el: <G6Thu />, sfx: [[22, 'impact.wav', 0.6], [68, 'wrong.wav', 0.5]]},
    xe('cau-doi', 'Container xếp chồng 2 tầng đang rung trước gió, làm sao hạ nhanh trong 1 lượt?', 'Nâng cấp ngàm khóa kép — cẩu đôi cả chồng 2 container cùng lúc!', 'Ngàm cẩu đôi 2 container', 125),
    treo('cau-doi', 'Dùng ngàm cẩu đôi nhấc gọn các chồng container 2 tầng nhé!', 6, 'Cẩu đôi 2 container'),
  ]),
  ket(6, [{id: 'lam', dur: 165, el: <G6Lam />, sfx: [[120, 'ding.wav', 0.5]]}, tt(6, 'Cẩu đôi 2 container', 'Tàu rời bến: 4 giờ', 'Cẩu đôi cứu được cả dãy hàng cao rồi! Nhưng gió lớn làm lẫn các thùng máy siêu trọng vào bãi đấy!', [90, 80, 45, 35], 2)]),
  mo(7, [
    {id: 'thu', dur: 240, el: <G7Thu />, sfx: [[68, 'wrong.wav', 0.5]]},
    xe('cau-du', 'Nhìn vỏ ngoài sao phân biệt được container thường với container máy siêu nặng?', 'Gắn cảm biến cân tải trọng ở đầu cáp — nhấc thử báo ngay số tấn weight()!', 'Cảm biến cân tải trọng', 125),
    treo('cau-du', 'Đo tải trọng bằng weight() để xếp đúng tàu chịu tải lớn nhé!', 7, 'Cảm biến cân tải'),
  ]),
  ket(7, [{id: 'lam', dur: 165, el: <G7Lam />, sfx: [[120, 'ding.wav', 0.5]]}, tt(7, 'Cảm biến cân tải', 'Tàu rời bến: 3 giờ', 'Cân tải trọng chính xác từng tấn! Giờ đón lô hàng từ băng chuyền nhà máy cô Hạnh chuyển sang nhé!', [95, 85, 75, 50])]),
  mo(8, [
    {id: 'thu', dur: 240, el: <G8Thu />, sfx: [[65, 'wrong.wav', 0.5]]},
    treo('cau-du', 'Phối hợp nút đè và đón container từ băng chuyền lên tàu nào!', 8, 'Băng chuyền cầu cảng'),
  ]),
  ket(8, [{id: 'lam', dur: 165, el: <G8Lam />, sfx: [[120, 'ding.wav', 0.5]]}, tt(8, 'Băng chuyền cầu cảng', 'Tàu rời bến: 2 giờ', 'Băng chuyền nối thông từ nhà máy ra tận mạn tàu! Giờ mở nốt đường ray cầu tàu số 4 bị kẹt chốt sắt nhé!', [100, 90, 85, 70])]),
  mo(9, [
    {id: 'thu', dur: 235, el: <G9Thu />, sfx: [[60, 'wrong.wav', 0.5]]},
    xe('r2', 'Ai rút được khối chốt sắt kẹt cứng trên đường ray để mở đường cho R1?', 'Triệu hồi R2 chân nhện nam châm hút chốt sắt, mở thông ray cho R1 cẩu hàng!', 'R2 nhện nam châm hỗ trợ', 120),
    treo('cau-du', 'R2 hút chốt sắt mở ray, R1 trượt ray cẩu hàng lên tàu nào!', 9, 'Phối hợp R2 ở cảng'),
  ]),
  ket(9, [{id: 'lam', dur: 165, el: <G9Lam />, sfx: [[72, 'click.wav', 0.5], [146, 'ding.wav', 0.5]]}, tt(9, 'Phối hợp R2 ở cảng', 'Tàu rời bến: 1 giờ', 'R2 mở khóa đường ray, R1 cẩu hàng lên tàu — phối hợp ăn ý tuyệt vời!', [100, 100, 95, 85])]),
  mo(10, [
    {id: 'tha-tay', dur: 160, el: <ThaTayCang />, sfx: [W_IN, [60, 'riser.wav', 0.4]]},
  ]),
  ket(10, [
    {id: 'canh-1', dur: 150, el: <G10Canh1 />, sfx: [[118, 'ding.wav', 0.4]]},
    {id: 'canh-2', dur: 165, el: <G10Canh2 />, sfx: [[55, 'click.wav', 0.4], [128, 'ding.wav', 0.5]]},
    tt(10, 'Xuất xưởng', 'Đúng giờ xuất bến!', 'Cả 4 bến tàu container đều đạt 100%, đoàn tàu xuất khẩu đã kéo còi rời cảng!', [100, 100, 100, 100]),
    {id: 'xuat-xuong', dur: 180, el: <XuatXuongCang />, sfx: [[18, 'impact.wav', 0.8], [20, 'ding.wav', 0.5]]},
    {id: 'ngoai-doi', dur: 150, el: <NgoaiDoiCang />, sfx: [W_IN]},
    {id: 'nha', dur: 150, el: <NhaMuaBenSong />, sfx: [[25, 'whoosh-soft.wav', 0.4]]},
  ]),
];
