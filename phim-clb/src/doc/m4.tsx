// 10 phim gói mùa 4 "Bến sông · Tàu thủy lợi R1", khổ dọc, theo hoc/KICH-BAN-PHIM-GOI-CLB.md bản 3 mục 5:
// mỗi gói hai phim: M4G<n>-Mo (phim mở) và M4G<n>-Ket (đoạn kết sau màn trùm).
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Burst, C, CodeBox, FONT, Icon, Mascot, MONO, Say, Shake, ease, pop} from '../d10';
import {Phim, W_IN} from '../may-phim';
import {BangViec, CauTreo, ChuNay, Moc, NenHienTruong, NhanGoi, Nguoi, O, ODat, TrongXe, Vat, Xe, chonDangNguoi, tamO} from './kit-doc';

const NEN = 'nen-doc/mua-song.png';
const DON = [
  'Vượt lòng kênh nước chảy', 'Kéo lục bình & bè gỗ về bến', 'Đo hướng dòng chảy ngầm', 'Đóng van cống chặn dòng xoáy', 'Thả neo giữ vững giữa dòng xiết',
  'Buộc dắt bè hàng qua luồng hẹp', 'Đo tuple (hướng, sức nước)', 'Ghép thùng phao sắt bác Sơn', 'Phối hợp R2 mở chốt bờ kè', 'Thông luồng 4 tuyến kênh thủy lợi',
];

/** Bác Bình quản lý trạm thủy lợi & bến sông (ảnh TopView tách nền). */
const Ba: React.FC<{says: Say[]; at?: number; x?: number; side?: 'left' | 'right'; dang?: string}> = ({says, at = 0, x = 820, side = 'left', dang = 'ba-nghi'}) => (
  <Nguoi anh={dang} ten="BÁC BÌNH" mau="#0284C7" x={x} h={600} at={at} says={says} side={side} bubbleW={560} bubbleTop={1230} />
);
const Sola: React.FC<{says: Say[]; mat: [number, string][]; at?: number; x?: number}> = ({says, mat, at = 0, x = 240}) => (
  <Mascot who="sola" x={x} h={540} at={at} faces={mat} says={says} bubbleW={520} bubbleTop={1240} />
);
const Luna: React.FC<{says: Say[]; mat: [number, string][]; at?: number; x?: number}> = ({says, mat, at = 0, x = 840}) => (
  <Mascot who="luna" x={x} h={540} at={at} faces={mat} says={says} side="left" bubbleW={520} bubbleTop={1240} lat />
);

/** Đồng hồ đếm ngược giờ triều cường góc trên trái. */
const ThuyTrieuBar: React.FC<{con: string; gap?: boolean}> = ({con, gap}) => {
  const f = useCurrentFrame();
  const nhay = gap && Math.floor(f / 10) % 2 === 0;
  return (
    <div style={{position: 'absolute', left: 36, top: 44, display: 'flex', alignItems: 'center', gap: 14, padding: '12px 24px', borderRadius: 999,
      background: nhay ? C.bad : '#fff', color: nhay ? '#fff' : C.ink, border: `4px solid ${C.ink}`, boxShadow: `0 8px 0 ${C.ink}`, fontFamily: MONO, fontWeight: 800, fontSize: 36}}>
      <Icon name="Waves" size={40} color={nhay ? '#fff' : '#0284C7'} stroke={2.6} />
      <span>{con}</span>
    </div>
  );
};

/** Bốn tuyến kênh thủy lợi trên bảng thành tựu thông luồng dần từ 0% đến 100%. */
const TuyenKenhBar: React.FC<{luong: [number, number, number, number]; lut?: boolean}> = ({luong, lut}) => {
  const KENH = [
    {ten: 'Kênh Bắc', mau: '#0284C7', nen: '#E0F2FE'},
    {ten: 'Kênh Nam', mau: '#0D9488', nen: '#CCFBF1'},
    {ten: 'Âu thuyền', mau: '#2563EB', nen: '#DBEAFE'},
    {ten: 'Đập chính', mau: '#16A34A', nen: '#DCFCE7'},
  ];
  return (
    <div style={{position: 'absolute', left: 90, top: 150, width: 900, display: 'flex', gap: 14}}>
      {KENH.map((k, i) => (
        <div key={k.ten} style={{flex: 1, padding: '12px 14px', borderRadius: 20, background: lut && i === 2 ? '#FEE2E2' : k.nen,
          border: `4px solid ${C.ink}`, boxShadow: `0 8px 0 ${C.ink}`, fontFamily: FONT, fontWeight: 800, fontSize: 22, color: C.ink, whiteSpace: 'nowrap'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 8}}>
            <span>{k.ten}</span><span>{luong[i]}%</span>
          </div>
          <div style={{height: 14, borderRadius: 99, background: '#fff', border: `3px solid ${C.ink}`, overflow: 'hidden'}}>
            <div style={{width: `${luong[i]}%`, height: '100%', background: k.mau}} />
          </div>
        </div>
      ))}
    </div>
  );
};

/** Đoạn kết chung mùa 4: 4 tuyến kênh + bảng tiến độ + đồng hồ triều cường + bác Bình. */
const ThanhTuu: React.FC<{moi: number; loi: string; con: string; so: number; ten: string; luong: [number, number, number, number]; xoa?: number}> =
  ({moi, loi, con, so, ten, luong, xoa}) => (
    <NenHienTruong anh={NEN} mua="m4" luoi={false} toi={0.52}>
      <TuyenKenhBar luong={luong} lut={xoa !== undefined} />
      <BangViec tieuDe="Sổ trực thông luồng bến sông của bác Bình" dong={DON} xong={moi} moi={moi} xoa={xoa} at={22} y={270} />
      <ThuyTrieuBar con={con} gap={xoa !== undefined} />
      <NhanGoi so={so} ten={ten} />
      <Ba dang={chonDangNguoi('ba', so, xoa)} says={[{at: 48, out: 200, text: loi}]} at={28} />
    </NenHienTruong>
  );

/** Cọc đo mực nước & chốt buộc bè góc trên phải (4, 0) gieo từ gói 1; đến gói 6 triều cường dâng làm bung chốt. */
const CocDoNuocGoc: React.FC<{bung?: boolean}> = ({bung}) => {
  const f = useCurrentFrame(), p = tamO(4, 0);
  const g = bung ? 26 : 5 * Math.sin(f / 7);
  return (
    <div style={{position: 'absolute', left: p.x - O * 0.44, top: p.y - O * 0.42, width: O * 0.88, height: O * 0.84, borderRadius: 16,
      background: bung ? 'linear-gradient(135deg, #EF4444, #B91C1C)' : 'linear-gradient(135deg, #0284C7, #0369A1)',
      border: `4px solid ${C.ink}`, transform: `rotate(${g}deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <Icon name="Anchor" size={46} color="#fff" />
    </div>
  );
};

/** Dây cáp cam nối từ mũi xuồng (hoặc đuôi xuồng) tới vật đang kéo trên sông. */
const DayCapKeo: React.FC<{tu: [number, number]; den: [number, number]; at: number; out: number}> = ({tu, den, at, out}) => {
  const f = useCurrentFrame();
  if (f < at || f > out) return null;
  const p1 = tamO(tu[0], tu[1]), p2 = tamO(den[0], den[1]);
  const dx = p2.x - p1.x, dy = p2.y - p1.y, d = Math.hypot(dx, dy), goc = (Math.atan2(dy, dx) * 180) / Math.PI;
  return (
    <div style={{position: 'absolute', left: p1.x, top: p1.y - 6, width: d, height: 12, transformOrigin: '0 50%', transform: `rotate(${goc}deg)`,
      background: '#F97316', border: `3px solid ${C.ink}`, borderRadius: 99}} />
  );
};

/* ================================================================== GÓI 1 · Thân xuồng chân vịt */
const R_G1M: Moc[] = [[0, 0, 3, 0], [18, 0, 3, 0], [65, 1.5, 3, 0], [95, 1.5, 3.6, 25]];
const G1Mo: React.FC = () => (
  <Shake hits={[66]} amp={10}>
    <NenHienTruong anh={NEN} mua="m4">
      <CocDoNuocGoc />
      {[1, 2, 3].map((c) => <ODat key={c} ten="o-dong-xuong" c={c} r={3} />)}
      <ODat ten="o-phao-dich" c={4} r={3} />
      <Xe anh="nhen" moc={R_G1M} doi={[[66, 'nhen-ngac']]} />
      <ChuNay chu="CHÌM NGHỈM!" at={66} den={138} x={tamO(2, 3).x + 90} y={tamO(2, 3).y - 40} />
      <ThuyTrieuBar con="Triều lên: 10 giờ" />
      <NhanGoi so={1} ten="Thân xuồng chân vịt" />
      <Ba dang="ba-hoang" says={[{at: 72, out: 175, text: 'Chân nhện chỉ đi cạn, xuống kênh sâu là chìm!'}]} at={58} />
    </NenHienTruong>
  </Shake>
);
const R_G1K: Moc[] = [[0, 0, 3, 0], [15, 0, 3, 0], [55, 1, 3, 0], [95, 2, 3, 0], [130, 3, 3, 0], [150, 4, 3, 0]];
const G1Lam: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m4">
    <CocDoNuocGoc />
    {[1, 2, 3].map((c) => <ODat key={c} ten="o-dong-xuong" c={c} r={3} />)}
    <ODat ten="o-phao-dich" c={4} r={3} />
    <Xe anh="xuong" moc={R_G1K} doi={[[145, 'xuong-vui']]} />
    <Burst x={tamO(4, 3).x} y={tamO(4, 3).y} at={146} />
    <CodeBox lines={['# Xuồng bù dòng chảy (+1, -1)', 'drift = -1', 'move(1 - drift)']}
      typeAt={15} x={44} y={260} w={580} title="xuong_bu_dong.py" />
    <ThuyTrieuBar con="Triều lên: 9 giờ 30" />
    <NhanGoi so={1} ten="Thân xuồng chân vịt" />
  </NenHienTruong>
);

/* ================================================================== GÓI 2 · Dây phao kéo (tow) */
const R_G2M: Moc[] = [[0, 1, 4, 0], [18, 1, 4, 0], [58, 2, 4, 0], [95, 2, 4, 15]];
const B_G2M: Moc[] = [[0, 3, 4, 0], [58, 3, 4, 0], [95, 4, 4, 20]];
const G2Thu: React.FC = () => (
  <Shake hits={[60]} amp={10}>
    <NenHienTruong anh={NEN} mua="m4">
      <CocDoNuocGoc />
      {[1, 2, 3, 4].map((c) => <ODat key={c} ten="o-nuoc" c={c} r={4} />)}
      <Vat ten="vat-be-go" moc={B_G2M} />
      <Xe anh="xuong" moc={R_G2M} doi={[[60, 'xuong-ngac']]} />
      <ChuNay chu="TRÔI XA!" at={60} den={140} x={tamO(3, 4).x + 60} y={tamO(3, 4).y - 50} />
      <ThuyTrieuBar con="Triều lên: 9 giờ" />
      <NhanGoi so={2} ten="Dây phao kéo" />
      <Ba says={[{at: 68, out: 220, text: 'Dưới nước không điểm tựa, đẩy là bè trôi tuột!'}]} at={54} />
    </NenHienTruong>
  </Shake>
);
const R_G2K: Moc[] = [[0, 1, 4, 0], [20, 1, 2, -90], [60, 1, 2, 0], [155, 1, 2, 0]];
const L_G2K: Moc[] = [[0, 1, 4, 0], [35, 1, 4, 0], [60, 1, 3, 0], [155, 1, 3, 0]];
const B_G2K: Moc[] = [[0, 4, 2, 0], [90, 4, 2, 0], [138, 2, 2, 0], [155, 2, 2, 0]];
const G2Lam: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m4">
    <CocDoNuocGoc />
    <ODat ten="o-phao-dich" c={2} r={2} />
    <DayCapKeo tu={[1, 2]} den={[1, 4]} at={26} out={58} />
    <DayCapKeo tu={[1, 2]} den={[4, 2]} at={82} out={138} />
    <Vat ten="vat-luc-binh" moc={L_G2K} />
    <Vat ten="vat-be-go" moc={B_G2K} />
    <Xe anh="xuong-keo" moc={R_G2K} doi={[[26, 'xuong-keo-day'], [60, 'xuong-keo'], [82, 'xuong-keo-day'], [140, 'xuong-keo-vui']]} />
    <Burst x={tamO(2, 2).x} y={tamO(2, 2).y} at={140} />
    <ThuyTrieuBar con="Triều lên: 8 giờ 30" />
    <NhanGoi so={2} ten="Dây phao kéo" />
  </NenHienTruong>
);

/* ================================================================== GÓI 3 · Chong chóng đo dòng chảy */
const R_G3M: Moc[] = [[0, 1, 4, 0], [18, 1, 4, 0], [65, 2, 4, 0], [100, 2, 5, 30]];
const G3Thu: React.FC = () => (
  <Shake hits={[68]} amp={9}>
    <NenHienTruong anh={NEN} mua="m4">
      <CocDoNuocGoc />
      <ODat ten="o-dong-xuong" c={2} r={4} />
      <ODat ten="o-dong-xuong" c={2} r={5} />
      <ODat ten="o-phao-dich" c={3} r={4} />
      <Xe anh="xuong-keo" moc={R_G3M} doi={[[68, 'xuong-keo-ngac']]} />
      <ChuNay chu="LỆCH LUỒNG!" at={68} den={142} x={tamO(2, 4).x + 110} y={tamO(2, 4).y - 40} />
      <ThuyTrieuBar con="Triều lên: 8 giờ" />
      <NhanGoi so={3} ten="Chong chóng đo nước" />
      <Sola mat={[[0, 'normal'], [66, 'surprised']]} says={[{at: 12, out: 64, text: 'Nước phẳng lặng, chắc đi thẳng là tới phao!'}, {at: 72, out: 220, text: 'Ái, dòng ngầm đẩy trôi xuống dưới rồi!'}]} />
    </NenHienTruong>
  </Shake>
);
const R_G3K: Moc[] = [[0, 1, 4, 0], [20, 1, 4, 0], [65, 2, 3, -45], [115, 2, 4, 0], [150, 3, 4, 0]];
const G3Lam: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m4">
    <CocDoNuocGoc />
    <ODat ten="o-dong-xuong" c={2} r={3} />
    <ODat ten="o-dong-xuong" c={2} r={4} />
    <ODat ten="o-phao-dich" c={3} r={4} />
    <Xe anh="xuong-do" moc={R_G3K} doi={[[22, 'xuong-do-bat'], [148, 'xuong-do-vui']]} />
    <Burst x={tamO(3, 4).x} y={tamO(3, 4).y} at={150} />
    <CodeBox lines={['def bu_dong():', '    h = flow_dir()', '    if h == "down": steer_up()']}
      typeAt={15} x={44} y={260} w={590} title="do_dong_chay.py" />
    <ThuyTrieuBar con="Triều lên: 7 giờ 30" />
    <NhanGoi so={3} ten="Chong chóng đo nước" />
  </NenHienTruong>
);

/* ================================================================== GÓI 4 · Cống thủy lợi (Cơ chế ngôi sao) */
const R_G4M: Moc[] = [[0, 1, 4, 0], [20, 1, 4, 0], [80, 1, 4, 0]];
const B_G4M: Moc[] = [[0, 2, 4, 0], [35, 2, 4, 0], [75, 4, 4, 25]];
const G4Thu: React.FC = () => (
  <Shake hits={[60]} amp={10}>
    <NenHienTruong anh={NEN} mua="m4">
      <CocDoNuocGoc />
      <ODat ten="o-cong-mo" c={1} r={4} />
      {[2, 3, 4].map((c) => <ODat key={c} ten="o-xiet-phai" c={c} r={4} />)}
      <Vat ten="vat-be-go" moc={B_G4M} />
      <Xe anh="xuong-do" moc={R_G4M} doi={[[55, 'xuong-do-ngac']]} />
      <ChuNay chu="CUỐN TRÔI!" at={58} den={140} x={tamO(3, 4).x + 60} y={tamO(3, 4).y - 45} />
      <ThuyTrieuBar con="Triều lên: 7 giờ" />
      <NhanGoi so={4} ten="Cống thủy lợi" />
      <Ba dang="ba-sot-ruot" says={[{at: 64, out: 230, text: 'Cống xả xiết, chạm van trên bờ đóng cống trước!'}]} at={50} />
    </NenHienTruong>
  </Shake>
);
const R_G4K: Moc[] = [[0, 1, 2, 0], [45, 1, 2, 90], [85, 1, 4, 0], [155, 1, 4, 0]];
const B_G4K: Moc[] = [[0, 3, 4, 0], [95, 3, 4, 0], [142, 2, 4, 0], [155, 2, 4, 0]];
const G4Lam: React.FC = () => {
  const f = useCurrentFrame(), dong = f >= 42;
  return (
    <NenHienTruong anh={NEN} mua="m4">
      <CocDoNuocGoc />
      <ODat ten={dong ? 'o-van-cong-bat' : 'o-van-cong'} c={2} r={2} />
      <ODat ten={dong ? 'o-cong-dong' : 'o-cong-mo'} c={1} r={4} />
      {[2, 3, 4].map((c) => <ODat key={c} ten={dong ? 'o-nuoc' : 'o-xiet-phai'} c={c} r={4} />)}
      <ODat ten="o-phao-dich" c={2} r={4} />
      <DayCapKeo tu={[1, 4]} den={[3, 4]} at={90} out={142} />
      <Vat ten="vat-be-go" moc={B_G4K} />
      <Xe anh="xuong-do" moc={R_G4K} doi={[[90, 'xuong-keo-day'], [144, 'xuong-do-vui']]} />
      <Burst x={tamO(2, 2).x} y={tamO(2, 2).y} at={42} />
      <Burst x={tamO(2, 4).x} y={tamO(2, 4).y} at={144} />
      <ThuyTrieuBar con="Triều lên: 6 giờ 30" />
      <NhanGoi so={4} ten="Cống thủy lợi" />
    </NenHienTruong>
  );
};

/* ================================================================== GÓI 5 · Thả neo giữ vị trí (anchor) */
const R_G5M: Moc[] = [[0, 2, 2, 90], [35, 2, 2, 90], [85, 2, 4, 110]];
const B_G5M: Moc[] = [[0, 2, 4, 0], [35, 2, 4, 0], [85, 2, 5.5, 15]];
const G5Thu: React.FC = () => (
  <Shake hits={[55]} amp={11}>
    <NenHienTruong anh={NEN} mua="m4">
      <CocDoNuocGoc />
      {[2, 3, 4, 5].map((r) => <ODat key={r} ten="o-xiet-xuong" c={2} r={r} />)}
      <DayCapKeo tu={[2, 2]} den={[2, 4]} at={25} out={55} />
      <Vat ten="vat-be-go" moc={B_G5M} />
      <Xe anh="xuong-do" moc={R_G5M} doi={[[25, 'xuong-keo-day'], [55, 'xuong-do-ngac']]} />
      <ChuNay chu="TRÔI CẢ XUỒNG!" at={55} den={140} x={tamO(2, 3).x + 120} y={tamO(2, 3).y - 30} />
      <ThuyTrieuBar con="Triều lên: 6 giờ" />
      <NhanGoi so={5} ten="Thả neo giữ vị trí" />
      <Luna mat={[[0, 'normal'], [55, 'surprised']]} says={[{at: 12, out: 52, text: 'Quăng dây kéo bè gỗ giữa nước xiết nào!'}, {at: 60, out: 220, text: 'Ối, bè nặng, nước xiết kéo trôi cả xuồng!'}]} />
    </NenHienTruong>
  </Shake>
);
const R_G5K: Moc[] = [[0, 2, 2, 90], [155, 2, 2, 90]];
const B_G5K: Moc[] = [[0, 2, 5, 0], [45, 2, 5, 0], [115, 2, 3, 0], [155, 2, 3, 0]];
const G5Lam: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m4">
    <CocDoNuocGoc />
    {[2, 3, 4, 5].map((r) => <ODat key={r} ten="o-xiet-xuong" c={2} r={r} />)}
    <ODat ten="o-phao-dich" c={2} r={3} />
    <DayCapKeo tu={[2, 2]} den={[2, 5]} at={40} out={115} />
    <Vat ten="vat-be-go" moc={B_G5K} />
    <Xe anh="xuong-do" moc={R_G5K} doi={[[22, 'xuong-neo'], [118, 'xuong-neo-vui']]} />
    <Burst x={tamO(2, 3).x} y={tamO(2, 3).y} at={118} />
    <CodeBox lines={['def keo_giua_dong_xiet():', '    anchor()  # hạ neo bám đáy sông', '    tow()     # kéo bè không sợ trôi']}
      typeAt={15} x={44} y={260} w={590} title="tha_neo.py" />
    <ThuyTrieuBar con="Triều lên: 5 giờ 30" />
    <NhanGoi so={5} ten="Thả neo giữ vị trí" />
  </NenHienTruong>
);

/* ================================================================== GÓI 6 · Buộc dắt theo đuôi (Biến cố giữa mùa) */
const R_G6M: Moc[] = [[0, 1, 2, 0], [100, 1, 2, 0]];
const B_G6M: Moc[] = [[0, 3, 2, 0], [30, 3, 2, 0], [70, 2, 2, 18], [100, 2, 2, 18]];
const G6Thu: React.FC = () => (
  <Shake hits={[22, 68]} amp={12}>
    <NenHienTruong anh={NEN} mua="m4">
      <CocDoNuocGoc bung />
      <ODat ten="o-bo-da" c={2} r={3} />
      <ODat ten="o-bo-da" c={2} r={4} />
      <DayCapKeo tu={[1, 2]} den={[3, 2]} at={25} out={68} />
      <Vat ten="vat-be-go" moc={B_G6M} />
      <Xe anh="xuong-neo" moc={R_G6M} doi={[[68, 'xuong-do-ngac']]} />
      <ChuNay chu="BUNG CỌC NEO!" at={20} den={85} x={tamO(3, 1).x} y={tamO(3, 1).y} />
      <ChuNay chu="KẸT KHÚC CUA!" at={68} den={145} x={tamO(2, 2).x + 60} y={tamO(2, 2).y - 45} />
      <ThuyTrieuBar con="TRIỀU CƯỜNG DÂNG!" gap />
      <NhanGoi so={6} ten="Buộc dắt theo đuôi" />
      <Ba dang="ba-hoang" says={[{at: 52, out: 230, text: 'Luồng âu gấp khúc thế này, kéo thẳng sao qua!'}]} at={40} />
    </NenHienTruong>
  </Shake>
);
const R_G6K: Moc[] = [[0, 3, 2, 180], [35, 3, 2, 180], [75, 1, 2, 90], [115, 1, 4, 0], [150, 3, 4, 0]];
const B_G6K: Moc[] = [[0, 4, 2, 0], [35, 4, 2, 0], [75, 2, 2, 0], [115, 1, 3, 0], [150, 2, 4, 0]];
const G6Lam: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m4">
    <CocDoNuocGoc bung />
    <ODat ten="o-bo-da" c={2} r={3} />
    <ODat ten="o-bo-da" c={3} r={3} />
    <ODat ten="o-phao-dich" c={2} r={4} />
    <Vat ten="vat-be-go" moc={B_G6K} />
    <Xe anh="xuong-dat" moc={R_G6K} doi={[[145, 'xuong-dat-vui']]} />
    <Burst x={tamO(2, 4).x} y={tamO(2, 4).y} at={146} />
    <ThuyTrieuBar con="Triều lên: 4 giờ 30" />
    <NhanGoi so={6} ten="Buộc dắt theo đuôi" />
  </NenHienTruong>
);

/* ================================================================== GÓI 7 · Đo sức nước · Tuple (hướng, sức_nước) */
const R_G7M: Moc[] = [[0, 1, 4, 0], [20, 1, 4, 0], [65, 2, 2, -45], [100, 2, 5, 30]];
const G7Thu: React.FC = () => (
  <Shake hits={[68]} amp={10}>
    <NenHienTruong anh={NEN} mua="m4">
      <ODat ten="o-xiet-xuong" c={2} r={2} />
      <ODat ten="o-xiet-xuong" c={2} r={3} />
      <ODat ten="o-xiet-xuong" c={2} r={4} />
      <ODat ten="o-phao-dich" c={3} r={3} />
      <Xe anh="xuong-do-bat" moc={R_G7M} doi={[[68, 'xuong-do-ngac']]} />
      <ChuNay chu="TRÔI 2 Ô!" at={68} den={140} x={tamO(2, 4).x + 110} y={tamO(2, 4).y - 40} />
      <ThuyTrieuBar con="Triều lên: 4 giờ" />
      <NhanGoi so={7} ten="Tuple (hướng, sức nước)" />
      <Sola mat={[[0, 'normal'], [68, 'surprised']]} says={[{at: 12, out: 64, text: 'Nước chảy xuống, mình bù lên 1 ô rồi mà!'}, {at: 72, out: 225, text: 'Á, luồng xiết cuốn tới 2 ô lận!'}]} />
    </NenHienTruong>
  </Shake>
);
const R_G7K: Moc[] = [[0, 1, 4, 0], [20, 1, 4, 0], [65, 2, 1, -60], [115, 2, 3, 0], [150, 3, 3, 0]];
const G7Lam: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m4">
    <ODat ten="o-xiet-xuong" c={2} r={1} />
    <ODat ten="o-xiet-xuong" c={2} r={2} />
    <ODat ten="o-xiet-xuong" c={2} r={3} />
    <ODat ten="o-phao-dich" c={3} r={3} />
    <Xe anh="xuong-du" moc={R_G7K} doi={[[146, 'xuong-du-vui']]} />
    <Burst x={tamO(3, 3).x} y={tamO(3, 3).y} at={148} />
    <CodeBox lines={['# Mở gói tuple (hướng, sức_nước)', 'h, s = flow()   # ("down", 2)', 'up_move(s); right_move()']}
      typeAt={15} x={44} y={260} w={590} title="tuple_dong_nuoc.py" />
    <ThuyTrieuBar con="Triều lên: 3 giờ 30" />
    <NhanGoi so={7} ten="Tuple (hướng, sức nước)" />
  </NenHienTruong>
);

/* ================================================================== GÓI 8 · Yếu tố cũ: Thùng phao sắt bác Sơn & Băng chuyền */
const R_G8M: Moc[] = [[0, 1, 2, 0], [35, 1, 4, 90], [80, 1, 4, 90]];
const P_G8M: Moc[] = [[0, 1, 3, 0], [35, 3, 3, 0], [75, 3, 5, 20]];
const G8Thu: React.FC = () => (
  <Shake hits={[65]} amp={9}>
    <NenHienTruong anh={NEN} mua="m4">
      <ODat ten="o-bang-phai" c={1} r={3} />
      <ODat ten="o-bang-phai" c={2} r={3} />
      <ODat ten="o-dong-xuong" c={3} r={3} />
      <ODat ten="o-dong-xuong" c={3} r={4} />
      <Vat ten="vat-phao-sat" moc={P_G8M} />
      <Xe anh="xuong-du" moc={R_G8M} doi={[[65, 'xuong-do-ngac']]} />
      <ChuNay chu="TRÔI LỆCH NHỊP!" at={65} den={140} x={tamO(3, 4).x + 70} y={tamO(3, 4).y - 40} />
      <ThuyTrieuBar con="Triều lên: 3 giờ" />
      <NhanGoi so={8} ten="Ghép cầu phao bác Sơn" />
      <Ba dang="ba-tin" says={[{at: 66, out: 230, text: 'Phao bác Sơn tới, neo không kịp là lệch cầu!'}]} at={52} />
    </NenHienTruong>
  </Shake>
);
const R_G8K: Moc[] = [[0, 1, 4, -90], [45, 2, 4, -90], [95, 3, 4, -90], [155, 3, 4, 0]];
const P1_G8: Moc[] = [[0, 1, 2, 0], [40, 1, 3, 0], [155, 1, 3, 0]];
const P2_G8: Moc[] = [[0, 2, 2, 0], [80, 2, 3, 0], [155, 2, 3, 0]];
const P3_G8: Moc[] = [[0, 3, 1, 0], [60, 3, 2, 0], [125, 3, 3, 0], [155, 3, 3, 0]];
const G8Lam: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m4">
    <ODat ten="o-bang-phai" c={0} r={2} />
    <DayCapKeo tu={[1, 4]} den={[1, 2]} at={18} out={40} />
    <DayCapKeo tu={[2, 4]} den={[2, 2]} at={55} out={80} />
    <DayCapKeo tu={[3, 4]} den={[3, 2]} at={100} out={125} />
    <Vat ten="vat-phao-sat" moc={P1_G8} />
    <Vat ten="vat-phao-sat" moc={P2_G8} />
    <Vat ten="vat-phao-sat" moc={P3_G8} />
    <Xe anh="xuong-neo" moc={R_G8K} doi={[[130, 'xuong-neo-vui']]} />
    <Burst x={tamO(2, 3).x} y={tamO(2, 3).y} at={132} />
    <ThuyTrieuBar con="Triều lên: 2 giờ 30" />
    <NhanGoi so={8} ten="Ghép cầu phao bác Sơn" />
  </NenHienTruong>
);

/* ================================================================== GÓI 9 · R2 xuất hiện (Nhện nam châm trên bờ kè + Xuồng dưới sông) */
const R_G9M: Moc[] = [[0, 2, 4, -90], [45, 2, 3, -90], [90, 2, 3, -90]];
const G9Thu: React.FC = () => (
  <Shake hits={[60]} amp={9}>
    <NenHienTruong anh={NEN} mua="m4">
      {[1, 2, 3].map((c) => <ODat key={c} ten="o-bo-da" c={c} r={2} />)}
      <Vat ten="vat-khoi-sat" moc={[[0, 2, 2, 0]]} />
      <Vat ten="vat-be-go" moc={[[0, 3, 4, 0]]} />
      <Xe anh="xuong-du" moc={R_G9M} doi={[[60, 'xuong-do-ngac']]} />
      <ChuNay chu="VƯỚNG CHỐT BỜ!" at={60} den={140} x={tamO(2, 2).x + 90} y={tamO(2, 2).y - 35} />
      <ThuyTrieuBar con="Triều lên: 2 giờ" />
      <NhanGoi so={9} ten="Phối hợp R2 bờ kè" />
      <Sola mat={[[0, 'normal'], [60, 'surprised']]} says={[{at: 14, out: 58, text: 'Chốt sắt nằm tít trên bờ kè cao kìa!'}, {at: 64, out: 220, text: 'Xuồng chỉ bơi, sao leo lên bờ kè mở chốt?'}]} />
    </NenHienTruong>
  </Shake>
);
const R2_G9K: Moc[] = [[0, 1, 2, 0], [45, 1, 2, 0], [85, 1, 2, 0]];
const K_G9K: Moc[] = [[0, 3, 2, 0], [40, 3, 2, 0], [75, 2, 2, 0], [155, 2, 2, 0]];
const R1_G9K: Moc[] = [[0, 1, 4, 0], [80, 1, 4, 0], [150, 1, 4, 0]];
const B_G9K: Moc[] = [[0, 3, 4, 0], [95, 3, 4, 0], [145, 2, 4, 0], [155, 2, 4, 0]];
const G9Lam: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m4">
    {[1, 2, 3].map((c) => <ODat key={c} ten="o-bo-da" c={c} r={2} />)}
    <ODat ten="o-phao-dich" c={2} r={4} />
    <DayCapKeo tu={[1, 4]} den={[3, 4]} at={90} out={145} />
    <Vat ten="vat-khoi-sat" moc={K_G9K} />
    <Vat ten="vat-be-go" moc={B_G9K} />
    <Xe anh="r2" moc={R2_G9K} doi={[[35, 'r2-hut'], [80, 'r2-vui']]} />
    <Xe anh="xuong-neo" moc={R1_G9K} doi={[[146, 'xuong-neo-vui']]} />
    <Burst x={tamO(2, 2).x} y={tamO(2, 2).y} at={76} />
    <Burst x={tamO(2, 4).x} y={tamO(2, 4).y} at={146} />
    <ThuyTrieuBar con="Triều lên: 1 giờ 30" />
    <NhanGoi so={9} ten="Phối hợp R2 bờ kè" />
  </NenHienTruong>
);

/* ================================================================== GÓI 10 · Xuất xưởng Tàu thủy lợi R1 */
const ThaTayM4: React.FC = () => {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  return (
    <NenHienTruong anh={NEN} mua="m4" luoi={false} toi={0.45}>
      <div style={{position: 'absolute', left: 60, top: 200, right: 60, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 52, color: '#fff', textShadow: `0 6px 0 ${C.ink}`}}>
        NÂNG CẤP HOÀN CHỈNH TÀU THỦY LỢI R1
      </div>
      <div style={{position: 'absolute', left: 540 - 260, top: 430, width: 520, height: 520}}>
        <Img src={staticFile('robot/m4/xuong-du-vui.png')} style={{width: '100%', height: '100%', transform: 'rotate(-90deg)'}} />
      </div>
      {[
        {nhan: 'Thân xuồng chân vịt', x: 70, y: 420, at: 8},
        {nhan: 'Tời dây phao kéo 3 ô', x: 640, y: 420, at: 18},
        {nhan: 'Chong chóng tuple (h, s)', x: 60, y: 820, at: 28},
        {nhan: 'Mỏ neo & Móc dắt đuôi', x: 620, y: 820, at: 38},
      ].map((m) => (
        <div key={m.nhan} style={{position: 'absolute', left: m.x, top: m.y, padding: '14px 24px', borderRadius: 20, background: C.sola,
          border: `4px solid ${C.ink}`, boxShadow: `0 8px 0 ${C.ink}`, fontFamily: FONT, fontWeight: 800, fontSize: 28, color: C.ink, transform: `scale(${pop(f, m.at, fps)})`}}>
          {m.nhan}
        </div>
      ))}
      <Sola mat={[[0, 'happy']]} says={[{at: 12, out: 150, text: 'Tàu R1 đủ nghề sông nước, thả tay đón triều!'}]} />
    </NenHienTruong>
  );
};

const R1_C1: Moc[] = [[0, 1, 2, 90], [45, 1, 4, 0], [140, 1, 4, 0]];
const LB_C1: Moc[] = [[0, 3, 4, 0], [55, 3, 4, 0], [115, 2, 4, 0], [145, 2, 4, 0]];
const G10Canh1: React.FC = () => {
  const f = useCurrentFrame(), dong = f >= 38;
  return (
    <NenHienTruong anh={NEN} mua="m4">
      <ODat ten={dong ? 'o-van-cong-bat' : 'o-van-cong'} c={1} r={3} />
      <ODat ten={dong ? 'o-cong-dong' : 'o-cong-mo'} c={0} r={4} />
      {[1, 2, 3].map((c) => <ODat key={c} ten={dong ? 'o-dong-xuong' : 'o-xiet-phai'} c={c} r={4} />)}
      <DayCapKeo tu={[1, 4]} den={[3, 4]} at={52} out={115} />
      <Vat ten="vat-luc-binh" moc={LB_C1} />
      <Xe anh="xuong-du" moc={R1_C1} doi={[[48, 'xuong-neo'], [118, 'xuong-neo-vui']]} />
      <Burst x={tamO(1, 3).x} y={tamO(1, 3).y} at={38} />
      <Burst x={tamO(2, 4).x} y={tamO(2, 4).y} at={118} />
      <ThuyTrieuBar con="Ca trực 1/2 · Khơi thông cửa cống" />
    </NenHienTruong>
  );
};

const R2_C2: Moc[] = [[0, 1, 2, 0], [45, 1, 2, 0], [160, 1, 2, 0]];
const K_C2: Moc[] = [[0, 3, 2, 0], [20, 3, 2, 0], [55, 2, 2, 0], [160, 2, 2, 0]];
const R1_C2: Moc[] = [[0, 1, 4, 0], [45, 2, 4, 0], [125, 4, 4, 0], [160, 4, 4, 0]];
const B_C2: Moc[] = [[0, 0, 4, 0], [45, 1, 4, 0], [125, 3, 4, 0], [160, 3, 4, 0]];
const G10Canh2: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m4">
    {[1, 2, 3].map((c) => <ODat key={c} ten="o-bo-da" c={c} r={2} />)}
    <ODat ten="o-phao-dich" c={3} r={4} />
    <Vat ten="vat-khoi-sat" moc={K_C2} />
    <Vat ten="vat-be-go" moc={B_C2} />
    <Xe anh="r2-hut" moc={R2_C2} doi={[[58, 'r2-vui']]} />
    <Xe anh="xuong-dat" moc={R1_C2} doi={[[128, 'xuong-dat-vui']]} />
    <Burst x={tamO(2, 2).x} y={tamO(2, 2).y} at={55} />
    <Burst x={tamO(3, 4).x} y={tamO(3, 4).y} at={128} />
    <ThuyTrieuBar con="Ca trực 2/2 · Dắt bè qua Đập chính" />
  </NenHienTruong>
);

const XuatXuongM4: React.FC = () => {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  const PART = ['Thân xuồng chân vịt · Nổi & bù dòng', 'Tời dây phao kéo · Mỏ neo giữ vị trí', 'Chong chóng đo dòng chảy · Tuple (h, s)'];
  return (
    <NenHienTruong anh={NEN} mua="m4" luoi={false} toi={0.42}>
      <div style={{position: 'absolute', left: 50, top: 120, right: 50, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 54, color: C.yellow, textShadow: `0 6px 0 ${C.ink}`}}>
        XUẤT XƯỞNG: TÀU THỦY LỢI R1
      </div>
      <div style={{position: 'absolute', left: 540 - 300, top: 210, width: 600, height: 600, transform: `scale(${pop(f, 8, fps)})`}}>
        <Img src={staticFile('robot/m4/xuong-du-vui.png')} style={{width: '100%', height: '100%', transform: 'rotate(-90deg)'}} />
      </div>
      {PART.map((p, i) => (
        <div key={p} style={{position: 'absolute', left: 80, right: 80, top: 830 + i * 105, opacity: ease(f, [10 + i * 10, 22 + i * 10], [0, 1]),
          padding: '16px 26px', borderRadius: 22, background: 'rgba(15,23,42,0.85)', border: `4px solid ${C.yellow}`,
          color: '#fff', fontFamily: FONT, fontWeight: 800, fontSize: 34, display: 'flex', gap: 16, alignItems: 'center'}}>
          <Icon name="CircleCheck" size={40} color={C.yellow} />{p}
        </div>
      ))}
      <Burst x={540} y={520} at={18} />
      <Ba dang="ba-mung" x={820} says={[{at: 12, out: 88, text: 'Cảm ơn hai cháu! Bến sông và kênh thủy lợi thông suốt, nước ngọt đã chảy về khắp cánh đồng!'}]} at={6} />
      <Sola x={230} mat={[[0, 'happy']]} says={[{at: 94, out: 172, text: 'Tàu thủy lợi R1 xin ở lại trực bến sông cùng bác Bình ạ!'}]} />
    </NenHienTruong>
  );
};

const NgoaiDoiM4: React.FC = () => {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  const THE = [
    {icon: 'Waves' as const, ten: 'Tàu Mặt Nước Tự Hành Đo Thủy Văn (USV)', mo: 'Tự động đo lưu tốc dòng chảy, độ sâu lòng sông và truyền dữ liệu cảnh báo lũ sớm.'},
    {icon: 'Anchor' as const, ten: 'Xuồng Tự Động Vớt Lục Bình & Rác Sông', mo: 'Gom lục bình ùn tắc trước cửa cống và lai dắt sà lan nông sản qua âu thuyền an toàn.'},
  ];
  return (
    <NenHienTruong anh={NEN} mua="m4" luoi={false} toi={0.58}>
      <div style={{position: 'absolute', left: 40, top: 120, right: 40, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 48, color: C.yellow, textShadow: `0 6px 0 ${C.ink}`}}>
        CÔNG NGHỆ NGOÀI ĐỜI THỰC · M4
      </div>

      {/* Hero Showcase: Robot R1 của mùa -> Công nghệ thực tế (top: 210 .. 490) */}
      <div style={{position: 'absolute', left: 50, right: 50, top: 210, height: 275, borderRadius: 32,
        background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', border: `6px solid ${C.ink}`,
        boxShadow: `0 14px 0 ${C.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 34px',
        transform: `scale(${pop(f, 6, fps)})`, boxSizing: 'border-box'}}>
        <div style={{width: 225, height: 225, borderRadius: 28, background: 'rgba(255,255,255,0.08)', border: `4px solid ${C.yellow}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
          <Img src={staticFile('robot/m4/xuong-du-vui.png')} style={{width: 205, height: 205, objectFit: 'contain', transform: 'rotate(-90deg)'}} />
        </div>
        <div style={{flex: 1, marginLeft: 28, fontFamily: FONT, color: '#fff'}}>
          <div style={{display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 99, background: '#0284C7',
            border: '3px solid #fff', fontSize: 22, fontWeight: 900, marginBottom: 10}}>
            TỪ SA BÀN CLB RA THỰC TẾ
          </div>
          <div style={{fontSize: 38, fontWeight: 900, color: '#FDE047', marginBottom: 6}}>Tàu Tự Hành Đường Thủy R1</div>
          <div style={{fontSize: 26, fontWeight: 700, color: '#E2E8F0', lineHeight: 1.3}}>Đo hướng dòng chảy bằng cảm biến thủy văn, thả neo và kéo phao cứu hộ.</div>
        </div>
      </div>

      {THE.map((t, i) => (
        <div key={t.ten} style={{position: 'absolute', left: 50, right: 50, top: 515 + i * 325, height: 295, padding: '28px 34px', borderRadius: 30, background: '#fff',
          border: `6px solid ${C.ink}`, boxShadow: `0 14px 0 ${C.ink}`, display: 'flex', gap: 28, alignItems: 'center',
          transform: `scale(${pop(f, 12 + i * 16, fps)})`, boxSizing: 'border-box'}}>
          <div style={{width: 150, height: 150, borderRadius: 28, background: '#0284C7', border: `5px solid ${C.ink}`,
            boxShadow: `0 8px 0 ${C.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
            <Icon name={t.icon} size={84} color="#fff" />
          </div>
          <div style={{fontFamily: FONT, color: C.ink, flex: 1}}>
            <div style={{fontWeight: 900, fontSize: 38, marginBottom: 10, lineHeight: 1.2}}>{t.ten}</div>
            <div style={{fontWeight: 800, fontSize: 28, color: '#334155', lineHeight: 1.34}}>{t.mo}</div>
          </div>
        </div>
      ))}
      <Sola mat={[[0, 'happy']]} says={[{at: 14, out: 142, text: 'Từ cảm biến đo dòng chảy trên sa bàn, ngoài đời các kỹ sư cũng lập trình tàu tự hành USV giữ an toàn đường sông!'}]} />
    </NenHienTruong>
  );
};

const NhaMua5: React.FC = () => {
  const f = useCurrentFrame();
  const s = 1 + 0.04 * Math.sin(f / 8);
  return (
    <AbsoluteFill style={{background: C.ink, overflow: 'hidden'}}>
      <Img src={staticFile('nen-doc/mua-4.png')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${s})`}} />
      <div style={{position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.42)'}} />
      <div style={{position: 'absolute', left: 60, right: 60, top: 200, padding: '28px 36px', borderRadius: 28, background: '#EC4899',
        border: `5px solid ${C.ink}`, boxShadow: `0 12px 0 ${C.ink}`, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 46, color: '#fff'}}>
        MÙA 5 TIẾP THEO · NÔNG TRẠI HOA CHỊ LAN
      </div>
      <Nguoi anh="lan-tin" ten="CHỊ LAN" mau="#EC4899" x={820} h={600} at={8} side="left" bubbleW={560} bubbleTop={1230}
        says={[{at: 12, out: 76, text: 'Nước kênh bác Bình đã dẫn về tới nông trại hoa rồi! Hai em chế tạo Drone bay gieo hạt giúp chị kịp hội hoa Xuân nhé!'}]} />
      <Sola x={230} mat={[[0, 'surprised'], [78, 'happy']]} says={[{at: 82, out: 145, text: 'Mùa 5 mình cất cánh lên bầu trời: chế tạo Drone nông nghiệp và học danh sách list!'}]} />
    </AbsoluteFill>
  );
};

/* ================================================================== ĐĂNG KÝ 20 PHIM MÙA 4 */
const mo = (so: number, canh: Phim['canh']): Phim => ({id: `M4G${so}-Mo`, doc: true, canh});
const ket = (so: number, canh: Phim['canh']): Phim => ({id: `M4G${so}-Ket`, doc: true, canh});
const tt = (so: number, ten: string, con: string, loi: string, luong: [number, number, number, number], xoa?: number) => ({
  id: 'thanh-tuu', dur: 170, el: <ThanhTuu moi={so - 1} loi={loi} con={con} so={so} ten={ten} luong={luong} xoa={xoa} />,
  sfx: [[22, xoa !== undefined ? 'wrong.wav' : 'ding.wav', 0.5]] as any,
});
const xe = (anh: string, luna: string, sola: string, tenPart: string, cach = 120) => ({
  id: 'trong-xe', dur: cach + 70,
  el: <TrongXe mua="m4" anh={anh} cach={cach} tenPart={tenPart} luna={[{at: 10, out: 70, text: luna}]} sola={[{at: 76, out: cach - 4, text: sola}]}
    lunaMat={[[0, 'thinking'], [76, 'happy']]} solaMat={[[0, 'thinking'], [76, 'confident']]} />,
  sfx: [[cach, 'impact.wav', 0.5], [cach, 'ding.wav', 0.4]] as any,
});
const treo = (anh: string, cau: string, so: number, ten: string) => ({
  id: 'cau-treo', dur: 110, el: <CauTreo mua="m4" xoay={-90} anh={anh} cau={cau} so={so} ten={ten} />, sfx: [W_IN, [40, 'pop.wav', 0.4]] as any,
});

export const PHIM_M4: Phim[] = [
  mo(1, [
    {id: 'hien-truong', dur: 180, el: <G1Mo />, sfx: [W_IN, [66, 'wrong.wav', 0.5]]},
    xe('xuong', 'Chân nhện bước xuống kênh sâu là chìm, làm sao nổi và đi trên mặt nước?', 'Lắp phao đệm khí và chân vịt kép — lướt trên sông và bù dòng chảy!', 'Thân xuồng chân vịt', 120),
    treo('xuong', 'Lái xuồng vượt dòng nước chảy trên sa bàn nào!', 1, 'Xuồng chân vịt'),
  ]),
  ket(1, [{id: 'lam', dur: 165, el: <G1Lam />, sfx: [[146, 'ding.wav', 0.5]]}, tt(1, 'Xuồng chân vịt', 'Triều lên: 9 giờ', 'Tàu nổi êm quá! Giờ kéo giúp bác đám lục bình với bè gỗ nhé!', [25, 0, 0, 0])]),
  mo(2, [
    {id: 'thu', dur: 235, el: <G2Thu />, sfx: [[60, 'wrong.wav', 0.5]]},
    xe('xuong-keo', 'Không lại sát bè gỗ giữa dòng được thì kéo từ xa bằng gì?', 'Lắp tời dây phao cứu sinh ở mũi — quăng dây xa 3 ô kéo về!', 'Tời dây phao kéo', 125),
    treo('xuong-keo', 'Quăng dây phao kéo lục bình và bè gỗ về bến nào!', 2, 'Dây phao kéo'),
  ]),
  ket(2, [{id: 'lam', dur: 165, el: <G2Lam />, sfx: [[140, 'ding.wav', 0.5]]}, tt(2, 'Dây phao kéo', 'Triều lên: 8 giờ', 'Kéo bè gọn quá! Nhưng khúc sông ngoài kia có dòng chảy ngầm đổi chiều đấy!', [50, 15, 0, 0])]),
  mo(3, [
    {id: 'thu', dur: 240, el: <G3Thu />, sfx: [[68, 'wrong.wav', 0.5]]},
    xe('xuong-do-bat', 'Dòng nước ngầm chảy hướng nào, nhìn mặt sông có biết không?', 'Gắn chong chóng đo dòng chảy — nước xoay cánh quạt báo hướng ngay!', 'Chong chóng đo dòng chảy', 125),
    treo('xuong-do-bat', 'Đo hướng nước trả về bằng return rồi mới lái nhé!', 3, 'Đo dòng chảy'),
  ]),
  ket(3, [{id: 'lam', dur: 165, el: <G3Lam />, sfx: [[150, 'ding.wav', 0.5]]}, tt(3, 'Đo dòng chảy', 'Triều lên: 7 giờ', 'Đo dòng chảy nhạy lắm! Nhưng cống xả Kênh Nam đang mở toang kìa!', [75, 35, 15, 0])]),
  mo(4, [
    {id: 'thu', dur: 245, el: <G4Thu />, sfx: [[58, 'wrong.wav', 0.5]]},
    treo('xuong-do', 'Đóng van cống chặn dòng xoáy trước rồi mới kéo bè nhé!', 4, 'Cống thủy lợi'),
  ]),
  ket(4, [{id: 'lam', dur: 165, el: <G4Lam />, sfx: [[42, 'click.wav', 0.5], [144, 'ding.wav', 0.5]]}, tt(4, 'Cống thủy lợi', 'Triều lên: 6 giờ', 'Đóng cống khéo lắm! Nhưng ngoài cửa sông lớn nước chảy xiết liên tục đấy!', [85, 65, 35, 15])]),
  mo(5, [
    {id: 'thu', dur: 235, el: <G5Thu />, sfx: [[55, 'wrong.wav', 0.5]]},
    xe('xuong-neo', 'Tàu thuyền muốn đứng vững giữa dòng nước xiết để kéo bè thì thả cái gì?', 'Lắp đôi mỏ neo bên mạn xuồng — thả neo bám chặt đáy sông!', 'Mỏ neo giữ vị trí', 125),
    treo('xuong-neo', 'Thả neo đứng vững giữa dòng xiết rồi kéo bè nào!', 5, 'Thả neo'),
  ]),
  ket(5, [{id: 'lam', dur: 165, el: <G5Lam />, sfx: [[118, 'ding.wav', 0.5]]}, tt(5, 'Thả neo', 'Triều lên: 5 giờ', 'Có neo giữ vững tâm rồi! Nhưng coi chừng triều cường chiều nay dâng gắt lắm!', [90, 80, 50, 30])]),
  mo(6, [
    {id: 'thu', dur: 245, el: <G6Thu />, sfx: [[22, 'impact.wav', 0.6], [68, 'wrong.wav', 0.5]]},
    xe('xuong-dat', 'Tàu kéo trên sông muốn đưa sà lan qua rạch hẹp quanh co thì dắt ở đâu?', 'Lắp móc kéo ở đuôi xuồng — xuồng đi trước, bè nối đuôi theo sau!', 'Móc buộc dắt theo đuôi', 125),
    treo('xuong-dat', 'Buộc bè vào đuôi xuồng rồi lượn qua khúc cua hẹp nhé!', 6, 'Buộc dắt đuôi'),
  ]),
  ket(6, [{id: 'lam', dur: 165, el: <G6Lam />, sfx: [[146, 'ding.wav', 0.5]]}, tt(6, 'Buộc dắt đuôi', 'Triều lên: 4 giờ', 'Cứu được bè hàng rồi! Nhưng triều cường làm chỗ chảy êm chỗ chảy xiết đấy!', [90, 80, 45, 35], 3)]),
  mo(7, [
    {id: 'thu', dur: 240, el: <G7Thu />, sfx: [[68, 'wrong.wav', 0.5]]},
    xe('xuong-du', 'Chỉ biết hướng nước thôi đã đủ chưa, còn mạnh 1 ô hay 2 ô thì sao?', 'Nâng cấp chong chóng đo kép — trả về cặp tuple (hướng, sức_nước)!', 'Cảm biến tuple (hướng, sức)', 125),
    treo('xuong-du', 'Đọc một lần ra cả hướng lẫn sức nước bằng tuple nhé!', 7, 'Đo sức nước'),
  ]),
  ket(7, [{id: 'lam', dur: 165, el: <G7Lam />, sfx: [[148, 'ding.wav', 0.5]]}, tt(7, 'Đo sức nước', 'Triều lên: 3 giờ', 'Mở gói tuple gọn quá! Bác Sơn vừa gửi sang mấy thùng phao sắt làm cầu phao đấy!', [95, 85, 75, 50])]),
  mo(8, [
    {id: 'thu', dur: 240, el: <G8Thu />, sfx: [[65, 'wrong.wav', 0.5]]},
    treo('xuong-neo', 'Đón thùng phao sắt từ băng chuyền ghép thành cầu phao nào!', 8, 'Cầu phao bác Sơn'),
  ]),
  ket(8, [{id: 'lam', dur: 165, el: <G8Lam />, sfx: [[132, 'ding.wav', 0.5]]}, tt(8, 'Cầu phao bác Sơn', 'Triều lên: 2 giờ', 'Cầu phao ghép từ thùng sắt bác Sơn chắc chắn quá! Giờ còn chốt sắt trên bờ kè cao thôi!', [100, 90, 85, 70])]),
  mo(9, [
    {id: 'thu', dur: 235, el: <G9Thu />, sfx: [[60, 'wrong.wav', 0.5]]},
    xe('r2', 'Ai leo được bờ kè đá cao và hút được chốt khóa sắt ở mùa trước?', 'Lắp R2 chân nhện + nam châm trên bờ kè, R1 xuồng kéo bè dưới sông!', 'R2 nhện nam châm', 120),
    treo('xuong-neo', 'Trên bờ R2 rút chốt sắt, dưới sông R1 kéo bè nào!', 9, 'Phối hợp bờ & sông'),
  ]),
  ket(9, [{id: 'lam', dur: 165, el: <G9Lam />, sfx: [[76, 'click.wav', 0.5], [146, 'ding.wav', 0.5]]}, tt(9, 'Phối hợp bờ & sông', 'Triều lên: 1 giờ', 'R2 trên bờ với R1 dưới sông phối hợp nhịp nhàng quá!', [100, 100, 95, 85])]),
  mo(10, [
    {id: 'tha-tay', dur: 160, el: <ThaTayM4 />, sfx: [W_IN, [60, 'riser.wav', 0.4]]},
  ]),
  ket(10, [
    {id: 'canh-1', dur: 150, el: <G10Canh1 />, sfx: [[38, 'click.wav', 0.5], [118, 'ding.wav', 0.4]]},
    {id: 'canh-2', dur: 165, el: <G10Canh2 />, sfx: [[55, 'click.wav', 0.4], [128, 'ding.wav', 0.5]]},
    tt(10, 'Xuất xưởng', 'Đúng đỉnh triều!', 'Cả 4 tuyến kênh thủy lợi đều thông suốt 100%, nước mát đã về khắp cánh đồng!', [100, 100, 100, 100]),
    {id: 'xuat-xuong', dur: 180, el: <XuatXuongM4 />, sfx: [[18, 'impact.wav', 0.8], [20, 'ding.wav', 0.5]]},
    {id: 'ngoai-doi', dur: 150, el: <NgoaiDoiM4 />, sfx: [W_IN]},
    {id: 'nha', dur: 150, el: <NhaMua5 />, sfx: [[25, 'whoosh-soft.wav', 0.4]]},
  ]),
];
