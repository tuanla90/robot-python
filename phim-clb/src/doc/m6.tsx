// 10 phim gói mùa 6 "Mỏ đá · Máy khai thác đá R1", khổ dọc, theo hoc/KICH-BAN-PHIM-GOI-CLB.md bản 3 mục 7:
// mỗi gói hai phim: M6G<n>-Mo (phim mở) và M6G<n>-Ket (đoạn kết sau màn trùm).
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Burst, C, CodeBox, FONT, Icon, Mascot, MONO, Say, Shake, ease, pop} from '../d10';
import {Phim, W_IN} from '../may-phim';
import {BangViec, CauTreo, ChuNay, Moc, NenHienTruong, NhanGoi, Nguoi, O, ODat, TrongXe, Vat, Xe, chonDangNguoi, tamO} from './kit-doc';

const NEN = 'nen-doc/mua-5.png';
const DON = [
  'Trượt ngang dọc gờ đá hẹp', 'Hất đá vụn qua rào an toàn', 'Quét radar 4 hướng xuyên bụi', 'Lăn đá tròn lấp hố khai thác', 'Đi chéo 1 nhịp né đá lăn',
  'Chỉnh lực aim(n) ném trúng bãi', 'Phân biệt đá tròn & đá xẻ vuông', 'Đi theo vạch màu & ghé trạm sạc', 'Phối hợp R2 drone canh vách cao', 'Thông tuyến an toàn toàn mỏ đá',
];

/** Anh Dũng kỹ sư trưởng mỏ đá (ảnh TopView tách nền). */
const Dung: React.FC<{says: Say[]; at?: number; x?: number; side?: 'left' | 'right'; dang?: string}> = ({says, at = 0, x = 820, side = 'left', dang = 'dung-nghi'}) => (
  <Nguoi anh={dang} ten="ANH DŨNG" mau="#D97706" x={x} h={600} at={at} says={says} side={side} bubbleW={560} bubbleTop={1230} />
);
const Sola: React.FC<{says: Say[]; mat: [number, string][]; at?: number; x?: number}> = ({says, mat, at = 0, x = 240}) => (
  <Mascot who="sola" x={x} h={540} at={at} faces={mat} says={says} bubbleW={520} bubbleTop={1240} />
);
const Luna: React.FC<{says: Say[]; mat: [number, string][]; at?: number; x?: number}> = ({says, mat, at = 0, x = 840}) => (
  <Mascot who="luna" x={x} h={540} at={at} faces={mat} says={says} side="left" bubbleW={520} bubbleTop={1240} lat />
);

/** Đồng hồ đếm ngược trước cơn mưa lớn đầu mùa góc trên trái. */
const MayMuaBar: React.FC<{con: string; gap?: boolean}> = ({con, gap}) => {
  const f = useCurrentFrame();
  const nhay = gap && Math.floor(f / 10) % 2 === 0;
  return (
    <div style={{position: 'absolute', left: 36, top: 44, display: 'flex', alignItems: 'center', gap: 14, padding: '12px 24px', borderRadius: 999,
      background: nhay ? C.bad : '#fff', color: nhay ? '#fff' : C.ink, border: `4px solid ${C.ink}`, boxShadow: `0 8px 0 ${C.ink}`, fontFamily: MONO, fontWeight: 800, fontSize: 36}}>
      <Icon name="CloudRain" size={40} color={nhay ? '#fff' : '#D97706'} stroke={2.6} />
      <span>{con}</span>
    </div>
  );
};

/** Bốn chặng đường lên mỏ đá gỡ biển nguy hiểm, tăng độ an toàn từ 0% đến 100%. */
const ChangMoBar: React.FC<{anToan: [number, number, number, number]; sat?: boolean}> = ({anToan, sat}) => {
  const CHANG = [
    {ten: 'Chân Núi', mau: '#D97706', nen: '#FEF3C7'},
    {ten: 'Bãi Chứa', mau: '#EA580C', nen: '#FFEDD5'},
    {ten: 'Dốc Đá', mau: '#0284C7', nen: '#E0F2FE'},
    {ten: 'Đỉnh Mỏ', mau: '#16A34A', nen: '#DCFCE7'},
  ];
  return (
    <div style={{position: 'absolute', left: 90, top: 150, width: 900, display: 'flex', gap: 14}}>
      {CHANG.map((c, i) => (
        <div key={c.ten} style={{flex: 1, padding: '12px 14px', borderRadius: 20, background: sat && i === 2 ? '#FEE2E2' : c.nen,
          border: `4px solid ${C.ink}`, boxShadow: `0 8px 0 ${C.ink}`, fontFamily: FONT, fontWeight: 800, fontSize: 22, color: C.ink, whiteSpace: 'nowrap'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 8}}>
            <span>{c.ten}</span><span>{anToan[i]}%</span>
          </div>
          <div style={{height: 14, borderRadius: 99, background: '#fff', border: `3px solid ${C.ink}`, overflow: 'hidden'}}>
            <div style={{width: `${anToan[i]}%`, height: '100%', background: c.mau}} />
          </div>
        </div>
      ))}
    </div>
  );
};

/** Đoạn kết chung mùa 6: 4 chặng mỏ + bảng tiến độ + đồng hồ mây mưa + anh Dũng. */
const ThanhTuu: React.FC<{moi: number; loi: string; con: string; so: number; ten: string; anToan: [number, number, number, number]; xoa?: number}> =
  ({moi, loi, con, so, ten, anToan, xoa}) => (
    <NenHienTruong anh={NEN} mua="m6" luoi={false} toi={0.52}>
      <ChangMoBar anToan={anToan} sat={xoa !== undefined} />
      <BangViec tieuDe="Sổ an toàn khai trường mỏ đá của anh Dũng" dong={DON} xong={moi} moi={moi} xoa={xoa} at={22} y={270} />
      <MayMuaBar con={con} gap={xoa !== undefined} />
      <NhanGoi so={so} ten={ten} />
      <Dung dang={chonDangNguoi('dung', so, xoa)} says={[{at: 48, out: 200, text: loi}]} at={28} />
    </NenHienTruong>
  );

/** Vách đá nứt góc trên phải (4, 0) gieo từ gói 1, rung nhẹ; đến gói 6 mưa đầu mùa làm sạt lở. */
const VachDaSatGoc: React.FC<{sat?: boolean}> = ({sat}) => {
  const f = useCurrentFrame(), p = tamO(4, 0);
  const g = sat ? -22 : 3 * Math.sin(f / 5);
  return (
    <div style={{position: 'absolute', left: p.x - O * 0.44, top: p.y - O * 0.42, width: O * 0.88, height: O * 0.84, borderRadius: 16,
      background: sat ? 'linear-gradient(135deg, #EF4444, #991B1B)' : 'linear-gradient(135deg, #F59E0B, #B45309)',
      border: `4px solid ${C.ink}`, transform: `rotate(${g}deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <Icon name="TriangleAlert" size={46} color="#fff" />
    </div>
  );
};

/* ================================================================== GÓI 1 · Bánh Omni đi ngang (slide_left / slide_right) */
const R_G1M: Moc[] = [[0, 1, 3, 0], [20, 1, 3, 0], [65, 2, 3, 25], [95, 2.4, 3.5, -30]];
const G1Mo: React.FC = () => (
  <Shake hits={[66]} amp={10}>
    <NenHienTruong anh={NEN} mua="m6">
      <VachDaSatGoc />
      {[1, 2, 3].map((c) => <ODat key={c} ten="o-ho" c={c} r={4} />)}
      <ODat ten="o-dich" c={3} r={3} />
      <Xe anh="drone" moc={R_G1M} doi={[[66, 'drone-ngac']]} />
      <ChuNay chu="GIÓ NÚI GIẬT!" at={66} den={138} x={tamO(2, 3).x + 90} y={tamO(2, 3).y - 40} />
      <MayMuaBar con="Mưa còn: 10 giờ" />
      <NhanGoi so={1} ten="Bánh Omni đi ngang" />
      <Dung says={[{at: 72, out: 175, text: 'Hẻm núi gió lốc mạnh lắm, drone nhẹ quá bị thổi bạt ngay, phải dùng khung gầm nặng bám đất!'}]} at={58} />
    </NenHienTruong>
  </Shake>
);
const R_G1K: Moc[] = [[0, 1, 3, -90], [20, 1, 3, -90], [75, 2, 3, -90], [135, 3, 3, -90]];
const G1Lam: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m6">
    <VachDaSatGoc />
    {[1, 2, 3].map((c) => <ODat key={c} ten="o-ho" c={c} r={4} />)}
    <ODat ten="o-dich" c={3} r={3} />
    <Xe anh="omni" moc={R_G1K} doi={[[135, 'omni-vui']]} />
    <Burst x={tamO(3, 3).x} y={tamO(3, 3).y} at={138} />
    <CodeBox lines={['# Lưới 2 chiều: trượt ngang dọc gờ đá', 'grid[3][1] = "safe"', 'slide_right(); slide_right()']}
      typeAt={15} x={44} y={260} w={580} title="omni_truot_ngang.py" />
    <MayMuaBar con="Mưa còn: 9 giờ 30" />
    <NhanGoi so={1} ten="Bánh Omni đi ngang" />
  </NenHienTruong>
);

/* ================================================================== GÓI 2 · Máy ném trước mũi (load / throw) */
const R_G2M: Moc[] = [[0, 1, 3, 0], [20, 1, 3, 0], [65, 1.7, 3, 0], [95, 1.5, 3, 12]];
const G2Thu: React.FC = () => (
  <Shake hits={[65]} amp={10}>
    <NenHienTruong anh={NEN} mua="m6">
      <VachDaSatGoc />
      <ODat ten="o-rao" c={2} r={3} />
      <ODat ten="o-dich" c={3} r={3} />
      <Vat ten="vat-da-tron" moc={[[0, 1, 3, 0]]} />
      <Xe anh="omni" moc={R_G2M} doi={[[65, 'omni-ngac']]} />
      <ChuNay chu="VƯỚNG RÀO!" at={65} den={140} x={tamO(2, 3).x + 70} y={tamO(2, 3).y - 45} />
      <MayMuaBar con="Mưa còn: 9 giờ" />
      <NhanGoi so={2} ten="Tay máy ném" />
      <Dung says={[{at: 68, out: 225, text: 'Rào an toàn chắn ngang rồi, xe không bước qua được mà tay kẹp thường cũng không vươn tới bãi chứa!'}]} at={54} />
    </NenHienTruong>
  </Shake>
);
const R_G2K: Moc[] = [[0, 1, 3, 0], [155, 1, 3, 0]];
const D_G2K: Moc[] = [[0, 1.35, 3, 0], [50, 1.35, 3, 0], [95, 3, 3, 0], [155, 3, 3, 0]];
const G2Lam: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m6">
    <VachDaSatGoc />
    <ODat ten="o-rao" c={2} r={3} />
    <ODat ten="o-dich" c={3} r={3} />
    <Vat ten="vat-da-tron" moc={D_G2K} />
    <Xe anh="omni-nem-cam" moc={R_G2K} doi={[[50, 'omni-nem-vung'], [100, 'omni-nem-vui']]} />
    <Burst x={tamO(3, 3).x} y={tamO(3, 3).y} at={96} />
    <MayMuaBar con="Mưa còn: 8 giờ 30" />
    <NhanGoi so={2} ten="Tay máy ném" />
  </NenHienTruong>
);

/* ================================================================== GÓI 3 · Radar tròn quét 4 hướng */
const R_G3M: Moc[] = [[0, 2, 3, 0], [30, 2, 3, -90], [60, 2, 3, 180], [90, 2, 3, 90]];
const G3Thu: React.FC = () => (
  <Shake hits={[88]} amp={9}>
    <NenHienTruong anh={NEN} mua="m6">
      <VachDaSatGoc />
      <Vat ten="vat-da-tron" moc={[[0, 2, 1, 0]]} />
      <Vat ten="vat-da-tron" moc={[[0, 4, 3, 0]]} />
      <Xe anh="omni-nem" moc={R_G3M} doi={[[88, 'omni-nem-ngac']]} />
      <ChuNay chu="MÙ BỤI ĐÁ!" at={88} den={145} x={tamO(2, 3).x + 90} y={tamO(2, 3).y - 40} />
      <MayMuaBar con="Mưa còn: 8 giờ" />
      <NhanGoi so={3} ten="Radar tròn 4 hướng" />
      <Sola mat={[[0, 'normal'], [86, 'surprised']]} says={[{at: 12, out: 82, text: 'Bụi đá mù mịt, phải xoay 4 hướng mới biết tảng đá nằm phía nào...'}, {at: 88, out: 225, text: 'Xoay đủ 4 vòng thì chóng cả mặt mà hết giờ mất!'}]} />
    </NenHienTruong>
  </Shake>
);
const R_G3K: Moc[] = [[0, 2, 3, 0], [45, 2, 3, -90], [90, 2, 2, -90], [150, 2, 2, -90]];
const D_G3K: Moc[] = [[0, 2, 1, 0], [95, 2, 1, 0], [140, 2, 0, 0], [155, 2, 0, 0]];
const G3Lam: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m6">
    <VachDaSatGoc />
    <ODat ten="o-dich" c={2} r={0} />
    <Vat ten="vat-da-tron" moc={D_G3K} />
    <Xe anh="omni-radar-quet" moc={R_G3K} doi={[[142, 'omni-radar-vui']]} />
    <Burst x={tamO(2, 0).x} y={tamO(2, 0).y} at={142} />
    <CodeBox lines={['# Quét 1 vòng trả về list 4 hướng', 'q = radar()  # [1, 0, 0, 0]', 'if q[0] == 1: load(); throw()']}
      typeAt={15} x={44} y={260} w={580} title="radar_bon_huong.py" />
    <MayMuaBar con="Mưa còn: 7 giờ 30" />
    <NhanGoi so={3} ten="Radar tròn 4 hướng" />
  </NenHienTruong>
);

/* ================================================================== GÓI 4 · Đá tròn + Sàn dốc (Cơ chế ngôi sao) */
const R_G4M: Moc[] = [[0, 1, 3, 0], [30, 1, 3, 0], [70, 2, 3, 0], [100, 2, 3, 20]];
const G4Thu: React.FC = () => (
  <Shake hits={[70]} amp={10}>
    <NenHienTruong anh={NEN} mua="m6">
      <VachDaSatGoc />
      <ODat ten="o-ho" c={3} r={3} />
      <ODat ten="o-dich" c={4} r={3} />
      <Xe anh="omni-radar" moc={R_G4M} doi={[[70, 'omni-radar-ngac']]} />
      <ChuNay chu="HỐ SÂU CHẮN LỐI!" at={70} den={140} x={tamO(3, 3).x + 60} y={tamO(3, 3).y - 45} />
      <MayMuaBar con="Mưa còn: 7 giờ" />
      <NhanGoi so={4} ten="Đá tròn lăn dốc" />
      <Dung dang="dung-tin" says={[{at: 66, out: 230, text: 'Hố khai thác cũ sâu hoắm chắn giữa đường, phải lăn tảng đá tròn trên dốc xuống lấp đầy hố mới đi qua được!'}]} at={52} />
    </NenHienTruong>
  </Shake>
);
const R_G4K: Moc[] = [[0, 3, 1, 90], [35, 3, 1, 90], [95, 1, 3, 0], [150, 4, 3, 0]];
const D_G4K: Moc[] = [[0, 3, 2, 0], [35, 3, 2, 0], [75, 3, 3, 180], [155, 3, 3, 180]];
const G4Lam: React.FC = () => {
  const f = useCurrentFrame(), lap = f >= 76;
  return (
    <NenHienTruong anh={NEN} mua="m6">
      <VachDaSatGoc />
      <ODat ten="o-doc-xuong" c={3} r={2} />
      {!lap ? <ODat ten="o-ho" c={3} r={3} /> : <ODat ten="o-vach-xanh" c={3} r={3} />}
      <ODat ten="o-dich" c={4} r={3} />
      {!lap && <Vat ten="vat-da-tron" moc={D_G4K} />}
      <Xe anh="omni-radar" moc={R_G4K} doi={[[148, 'omni-radar-vui']]} />
      <Burst x={tamO(3, 3).x} y={tamO(3, 3).y} at={76} />
      <Burst x={tamO(4, 3).x} y={tamO(4, 3).y} at={150} />
      <MayMuaBar con="Mưa còn: 6 giờ 30" />
      <NhanGoi so={4} ten="Đá tròn lăn dốc" />
    </NenHienTruong>
  );
};

/* ================================================================== GÓI 5 · Đi chéo 1 nhịp (Nâng cấp thân Omni) */
const R_G5M: Moc[] = [[0, 1, 4, -90], [45, 2, 4, -90], [85, 2, 3, -70]];
const D_G5M: Moc[] = [[0, 2, 1, 0], [80, 2, 3, 180], [100, 2, 4, 240]];
const G5Thu: React.FC = () => (
  <Shake hits={[80]} amp={11}>
    <NenHienTruong anh={NEN} mua="m6">
      <VachDaSatGoc />
      <ODat ten="o-doc-xuong" c={2} r={1} />
      <ODat ten="o-doc-xuong" c={2} r={2} />
      <Vat ten="vat-da-tron" moc={D_G5M} />
      <Xe anh="omni-radar" moc={R_G5M} doi={[[80, 'omni-radar-ngac']]} />
      <ChuNay chu="CHẬM 1 NHỊP!" at={80} den={142} x={tamO(2, 3).x + 100} y={tamO(2, 3).y - 35} />
      <MayMuaBar con="Mưa còn: 6 giờ" />
      <NhanGoi so={5} ten="Đi chéo 1 nhịp" />
      <Luna mat={[[0, 'normal'], [78, 'surprised']]} says={[{at: 12, out: 74, text: 'Trượt ngang 1 nhịp rồi mới tiến lên 1 nhịp là mất 2 bước...'}, {at: 80, out: 225, text: 'Ối, mất 2 nhịp nên tảng đá tròn lăn tới kịp chắn đường rồi!'}]} />
    </NenHienTruong>
  </Shake>
);
const R_G5K: Moc[] = [[0, 1, 4, -90], [30, 1, 4, -90], [70, 2, 3, -90], [110, 3, 2, -90], [150, 3, 2, -90]];
const D_G5K: Moc[] = [[0, 2, 1, 0], [30, 2, 1, 0], [100, 2, 4, 240], [155, 2, 5, 300]];
const G5Lam: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m6">
    <VachDaSatGoc />
    <ODat ten="o-doc-xuong" c={2} r={1} />
    <ODat ten="o-doc-xuong" c={2} r={2} />
    <ODat ten="o-dich" c={3} r={2} />
    <Vat ten="vat-da-tron" moc={D_G5K} />
    <Xe anh="omni-radar" moc={R_G5K} doi={[[112, 'omni-radar-vui']]} />
    <Burst x={tamO(3, 2).x} y={tamO(3, 2).y} at={112} />
    <CodeBox lines={['# Đồng bộ bánh Omni đi chéo 1 nhịp', 'diag_up_right()', 'diag_up_right()']}
      typeAt={15} x={44} y={260} w={570} title="di_cheo_omni.py" />
    <MayMuaBar con="Mưa còn: 5 giờ 30" />
    <NhanGoi so={5} ten="Đi chéo 1 nhịp" />
  </NenHienTruong>
);

/* ================================================================== GÓI 6 · Chỉnh lực máy ném aim(n) (Biến cố giữa mùa) */
const R_G6M: Moc[] = [[0, 0, 3, 0], [100, 0, 3, 0]];
const D_G6M: Moc[] = [[0, 0.35, 3, 0], [35, 0.35, 3, 0], [75, 4, 3, 0], [100, 4, 3, 0]];
const G6Thu: React.FC = () => (
  <Shake hits={[20, 75]} amp={12}>
    <NenHienTruong anh={NEN} mua="m6">
      <VachDaSatGoc sat />
      <ODat ten="o-rao" c={1} r={3} />
      <ODat ten="o-dich" c={2} r={3} />
      <Vat ten="vat-da-tron" moc={D_G6M} />
      <Xe anh="omni-nem-vung" moc={R_G6M} doi={[[75, 'omni-radar-ngac']]} />
      <ChuNay chu="SẠT VÁCH ĐÁ!" at={18} den={85} x={tamO(3, 1).x} y={tamO(3, 1).y} />
      <ChuNay chu="BAY QUÁ BÃI!" at={75} den={145} x={tamO(3, 3).x + 60} y={tamO(3, 3).y - 45} />
      <MayMuaBar con="MƯA SẠT VÁCH ĐÁ!" gap />
      <NhanGoi so={6} ten="Chỉnh lực ném aim(n)" />
      <Dung dang="dung-hoang" says={[{at: 52, out: 230, text: 'Mưa đầu mùa làm sạt vách đá rồi! Bãi chứa có ô gần ô xa, hất hết cỡ là đá bay vọt qua bãi rơi xuống đường!'}]} at={40} />
    </NenHienTruong>
  </Shake>
);
const R_G6K: Moc[] = [[0, 0, 2, 0], [75, 0, 4, 0], [155, 0, 4, 0]];
const D1_G6K: Moc[] = [[0, 0.35, 2, 0], [30, 0.35, 2, 0], [65, 2, 2, 0], [155, 2, 2, 0]];
const D2_G6K: Moc[] = [[0, 0.35, 4, 0], [95, 0.35, 4, 0], [140, 3, 4, 0], [155, 3, 4, 0]];
const G6Lam: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m6">
    <VachDaSatGoc sat />
    <ODat ten="o-rao" c={1} r={2} />
    <ODat ten="o-rao" c={1} r={4} />
    <ODat ten="o-dich" c={2} r={2} />
    <ODat ten="o-dich" c={3} r={4} />
    <Vat ten="vat-da-tron" moc={D1_G6K} />
    <Vat ten="vat-da-tron" moc={D2_G6K} />
    <Xe anh="omni-du" moc={R_G6K} doi={[[30, 'omni-du-vung'], [70, 'omni-du'], [95, 'omni-du-vung'], [142, 'omni-du-vui']]} />
    <Burst x={tamO(2, 2).x} y={tamO(2, 2).y} at={65} />
    <Burst x={tamO(3, 4).x} y={tamO(3, 4).y} at={142} />
    <MayMuaBar con="Mưa còn: 4 giờ 30" />
    <NhanGoi so={6} ten="Chỉnh lực ném aim(n)" />
  </NenHienTruong>
);

/* ================================================================== GÓI 7 · Nhận diện hình dạng (Đá tròn vs Đá xẻ vuông) */
const R_G7M: Moc[] = [[0, 1, 3, 0], [100, 1, 3, 0]];
const X_G7M: Moc[] = [[0, 1.35, 3, 0], [35, 1.35, 3, 0], [75, 3, 3, 25], [100, 3, 3, 25]];
const G7Thu: React.FC = () => (
  <Shake hits={[75]} amp={10}>
    <NenHienTruong anh={NEN} mua="m6">
      <ODat ten="o-doc-xuong" c={3} r={3} />
      <Vat ten="vat-da-xe" moc={X_G7M} />
      <Xe anh="omni-du-vung" moc={R_G7M} doi={[[75, 'omni-radar-ngac']]} />
      <ChuNay chu="MẺ ĐÁ XẺ VUÔNG!" at={75} den={142} x={tamO(3, 3).x + 60} y={tamO(3, 3).y - 45} />
      <MayMuaBar con="Mưa còn: 4 giờ" />
      <NhanGoi so={7} ten="Radar nhận hình dạng" />
      <Dung dang="dung-hoang" says={[{at: 68, out: 230, text: 'Ấy chết, khối đó là đá xẻ vuông cao cấp để lát vườn hoa, ném vào dốc đá lăn là sứt mẻ hết góc cạnh!'}]} at={54} />
    </NenHienTruong>
  </Shake>
);
const R_G7K: Moc[] = [[0, 1, 2, 0], [75, 1, 4, 0], [155, 1, 4, 0]];
const D_G7K: Moc[] = [[0, 1.35, 2, 0], [30, 1.35, 2, 0], [65, 3, 2, 0], [155, 3, 2, 0]];
const X_G7K: Moc[] = [[0, 1.35, 4, 0], [95, 1.35, 4, 0], [140, 3, 4, 0], [155, 3, 4, 0]];
const G7Lam: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m6">
    <ODat ten="o-ho" c={3} r={2} />
    <ODat ten="o-dich" c={3} r={4} />
    <Vat ten="vat-da-tron" moc={D_G7K} />
    <Vat ten="vat-da-xe" moc={X_G7K} />
    <Xe anh="omni-du" moc={R_G7K} doi={[[30, 'omni-du-vung'], [70, 'omni-du'], [95, 'omni-du-vung'], [142, 'omni-du-vui']]} />
    <Burst x={tamO(3, 2).x} y={tamO(3, 2).y} at={65} />
    <Burst x={tamO(3, 4).x} y={tamO(3, 4).y} at={142} />
    <CodeBox lines={['if radar_shape() == "round":', '    aim(2); throw()  # lấp hố', 'elif radar_shape() == "square":', '    aim(2); throw()  # về bãi đá xẻ']}
      typeAt={15} x={44} y={240} w={590} title="nhan_dang_da.py" />
    <MayMuaBar con="Mưa còn: 3 giờ 30" />
    <NhanGoi so={7} ten="Radar nhận hình dạng" />
  </NenHienTruong>
);

/* ================================================================== GÓI 8 · Yếu tố cũ: Vạch màu an toàn & Trạm sạc P */
const R_G8M: Moc[] = [[0, 1, 4, -90], [50, 2, 3, -90], [95, 2, 3, -75]];
const G8Thu: React.FC = () => (
  <Shake hits={[65]} amp={9}>
    <NenHienTruong anh={NEN} mua="m6">
      <ODat ten="o-vach-vang" c={2} r={3} />
      <ODat ten="o-vach-xanh" c={1} r={3} />
      <ODat ten="o-sac" c={1} r={2} />
      <Vat ten="vat-da-tron" moc={[[0, 2, 1, 0], [65, 2, 3, 180]]} />
      <Xe anh="omni-du" moc={R_G8M} doi={[[65, 'omni-radar-ngac']]} />
      <ChuNay chu="VẠCH VÀNG ĐÁ RƠI!" at={65} den={140} x={tamO(2, 3).x + 90} y={tamO(2, 3).y - 40} />
      <MayMuaBar con="Mưa còn: 3 giờ" />
      <NhanGoi so={8} ten="Vạch màu & Trạm sạc" />
      <Dung dang="dung-tin" says={[{at: 66, out: 230, text: 'Trong mỏ kẻ sẵn vạch vàng cảnh báo đá rơi và vạch xanh an toàn dẫn tới trạm sạc P giống bên nông trại đấy!'}]} at={52} />
    </NenHienTruong>
  </Shake>
);
const R_G8K: Moc[] = [[0, 1, 4, -90], [40, 1, 3, -90], [85, 1, 2, 0], [150, 1, 2, 0]];
const X_G8K: Moc[] = [[0, 1.35, 2, 0], [95, 1.35, 2, 0], [140, 3, 2, 0], [155, 3, 2, 0]];
const G8Lam: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m6">
    <ODat ten="o-vach-xanh" c={1} r={4} />
    <ODat ten="o-vach-xanh" c={1} r={3} />
    <ODat ten="o-sac" c={1} r={2} />
    <ODat ten="o-vach-vang" c={2} r={3} />
    <ODat ten="o-dich" c={3} r={2} />
    <Vat ten="vat-da-xe" moc={X_G8K} />
    <Xe anh="omni-du" moc={R_G8K} doi={[[95, 'omni-du-vung'], [142, 'omni-du-vui']]} />
    <Burst x={tamO(1, 2).x} y={tamO(1, 2).y} at={85} />
    <Burst x={tamO(3, 2).x} y={tamO(3, 2).y} at={142} />
    <MayMuaBar con="Mưa còn: 2 giờ 30" />
    <NhanGoi so={8} ten="Vạch màu & Trạm sạc" />
  </NenHienTruong>
);

/* ================================================================== GÓI 9 · R2 xuất hiện (Drone trinh sát trên cao + Omni dưới đất) */
const R_G9M: Moc[] = [[0, 2, 4, -90], [60, 2, 4, -90]];
const G9Thu: React.FC = () => (
  <Shake hits={[58]} amp={9}>
    <NenHienTruong anh={NEN} mua="m6">
      <ODat ten="o-rao" c={2} r={2} />
      <Vat ten="vat-da-tron" moc={[[0, 3, 1, 0]]} />
      <Xe anh="omni-du" moc={R_G9M} doi={[[58, 'omni-radar-ngac']]} />
      <ChuNay chu="KHUẤT VÁCH CAO!" at={58} den={140} x={tamO(2, 2).x + 80} y={tamO(2, 2).y - 40} />
      <MayMuaBar con="Mưa còn: 2 giờ" />
      <NhanGoi so={9} ten="Phối hợp R2 Drone" />
      <Sola mat={[[0, 'normal'], [58, 'surprised']]} says={[{at: 14, out: 55, text: 'Vách đá dựng đứng che khuất mất tầng mỏ bên trên rồi!'}, {at: 60, out: 220, text: 'R1 đứng dưới thấp không biết đá ở cột nào sắp lăn xuống!'}]} />
    </NenHienTruong>
  </Shake>
);
const R2_G9K: Moc[] = [[0, 1, 1, 0], [45, 3, 1, 0], [155, 3, 1, 0]];
const R1_G9K: Moc[] = [[0, 1, 4, -90], [50, 1, 4, -90], [90, 3, 4, 0], [155, 3, 4, 0]];
const D_G9K: Moc[] = [[0, 3, 2, 0], [85, 3, 3.6, 0], [140, 4, 4, 0], [155, 4, 4, 0]];
const G9Lam: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m6">
    <ODat ten="o-doc-xuong" c={3} r={2} />
    <ODat ten="o-dich" c={4} r={4} />
    <Vat ten="vat-da-tron" moc={D_G9K} />
    <Xe anh="r2" moc={R2_G9K} doi={[[45, 'r2-quet'], [140, 'r2-vui']]} />
    <Xe anh="omni-du" moc={R1_G9K} doi={[[95, 'omni-du-vung'], [142, 'omni-du-vui']]} />
    <Burst x={tamO(3, 1).x} y={tamO(3, 1).y} at={48} />
    <Burst x={tamO(4, 4).x} y={tamO(4, 4).y} at={142} />
    <MayMuaBar con="Mưa còn: 1 giờ 30" />
    <NhanGoi so={9} ten="Phối hợp R2 Drone" />
  </NenHienTruong>
);

/* ================================================================== GÓI 10 · Xuất xưởng Máy khai thác đá R1 */
const ThaTayM6: React.FC = () => {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  return (
    <NenHienTruong anh={NEN} mua="m6" luoi={false} toi={0.45}>
      <div style={{position: 'absolute', left: 60, top: 200, right: 60, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 52, color: '#fff', textShadow: `0 6px 0 ${C.ink}`}}>
        NÂNG CẤP HOÀN CHỈNH MÁY KHAI THÁC ĐÁ R1
      </div>
      <div style={{position: 'absolute', left: 540 - 260, top: 430, width: 520, height: 520}}>
        <Img src={staticFile('robot/m6/omni-du-vui.png')} style={{width: '100%', height: '100%', transform: 'rotate(-90deg)'}} />
      </div>
      {[
        {nhan: '4 bánh Omni đi ngang & chéo', x: 50, y: 420, at: 8},
        {nhan: 'Tay máy ném chỉnh lực aim(n)', x: 590, y: 420, at: 18},
        {nhan: 'Radar 360° xuyên bụi', x: 70, y: 820, at: 28},
        {nhan: 'Nhận diện đá tròn & đá xẻ', x: 590, y: 820, at: 38},
      ].map((m) => (
        <div key={m.nhan} style={{position: 'absolute', left: m.x, top: m.y, padding: '14px 24px', borderRadius: 20, background: C.yellow,
          border: `4px solid ${C.ink}`, boxShadow: `0 8px 0 ${C.ink}`, fontFamily: FONT, fontWeight: 800, fontSize: 28, color: C.ink, transform: `scale(${pop(f, m.at, fps)})`}}>
          {m.nhan}
        </div>
      ))}
      <Sola mat={[[0, 'happy']]} says={[{at: 12, out: 150, text: 'Máy khai thác đá R1 hoàn chỉnh cả 4 món nghề, thả tay tổng dọn toàn mỏ trước cơn mưa!'}]} />
    </NenHienTruong>
  );
};

const R1_C1: Moc[] = [[0, 1, 3, 0], [50, 2, 3, 0], [140, 2, 3, 0]];
const D1_C1: Moc[] = [[0, 1.35, 3, 0], [35, 3, 3, 180], [140, 3, 3, 180]];
const X1_C1: Moc[] = [[0, 2.35, 3, 0], [55, 2.35, 3, 0], [110, 4, 3, 0], [140, 4, 3, 0]];
const G10Canh1: React.FC = () => {
  const f = useCurrentFrame(), lap = f >= 36;
  return (
    <NenHienTruong anh={NEN} mua="m6">
      <ODat ten="o-doc-phai" c={2} r={3} />
      {!lap ? <ODat ten="o-ho" c={3} r={3} /> : <ODat ten="o-vach-xanh" c={3} r={3} />}
      <ODat ten="o-dich" c={4} r={3} />
      {!lap && <Vat ten="vat-da-tron" moc={D1_C1} />}
      <Vat ten="vat-da-xe" moc={X1_C1} />
      <Xe anh="omni-du" moc={R1_C1} doi={[[55, 'omni-du-vung'], [112, 'omni-du-vui']]} />
      <Burst x={tamO(3, 3).x} y={tamO(3, 3).y} at={36} />
      <Burst x={tamO(4, 3).x} y={tamO(4, 3).y} at={112} />
      <MayMuaBar con="Chặng 1/2 · Lấp hố & phân loại đá" />
    </NenHienTruong>
  );
};

const R2_C2: Moc[] = [[0, 1, 1, 0], [45, 2, 1, 0], [150, 2, 1, 0]];
const R1_C2: Moc[] = [[0, 1, 4, -90], [45, 2, 3, -90], [115, 3, 2, 0], [150, 3, 2, 0]];
const D2_C2: Moc[] = [[0, 2, 1, 0], [35, 2, 1, 0], [95, 2, 4, 240], [150, 2, 4, 240]];
const G10Canh2: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m6">
    <ODat ten="o-doc-xuong" c={2} r={1} />
    <ODat ten="o-doc-xuong" c={2} r={2} />
    <ODat ten="o-dich" c={3} r={2} />
    <Vat ten="vat-da-tron" moc={D2_C2} />
    <Xe anh="r2-quet" moc={R2_C2} doi={[[112, 'r2-vui']]} />
    <Xe anh="omni-du" moc={R1_C2} doi={[[115, 'omni-du-vui']]} />
    <Burst x={tamO(3, 2).x} y={tamO(3, 2).y} at={115} />
    <MayMuaBar con="Chặng 2/2 · Lướt chéo lên Đỉnh Mỏ" />
  </NenHienTruong>
);

const XuatXuongM6: React.FC = () => {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  const PART = ['Bánh đa hướng Omni · Trượt ngang & chéo', 'Tay máy ném · Chỉnh lực aim(1..3)', 'Radar tròn 360° · Nhận diện dáng đá'];
  return (
    <NenHienTruong anh={NEN} mua="m6" luoi={false} toi={0.42}>
      <div style={{position: 'absolute', left: 50, top: 120, right: 50, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 52, color: C.yellow, textShadow: `0 6px 0 ${C.ink}`}}>
        XUẤT XƯỞNG: MÁY KHAI THÁC ĐÁ R1
      </div>
      <div style={{position: 'absolute', left: 540 - 300, top: 210, width: 600, height: 600, transform: `scale(${pop(f, 8, fps)})`}}>
        <Img src={staticFile('robot/m6/omni-du-vui.png')} style={{width: '100%', height: '100%', transform: 'rotate(-90deg)'}} />
      </div>
      {PART.map((p, i) => (
        <div key={p} style={{position: 'absolute', left: 80, right: 80, top: 830 + i * 105, opacity: ease(f, [10 + i * 10, 22 + i * 10], [0, 1]),
          padding: '16px 26px', borderRadius: 22, background: 'rgba(15,23,42,0.85)', border: `4px solid ${C.yellow}`,
          color: '#fff', fontFamily: FONT, fontWeight: 800, fontSize: 34, display: 'flex', gap: 16, alignItems: 'center'}}>
          <Icon name="CircleCheck" size={40} color={C.yellow} />{p}
        </div>
      ))}
      <Burst x={540} y={520} at={18} />
      <Dung dang="dung-mung" x={820} says={[{at: 12, out: 88, text: 'Tuyệt vời! Toàn bộ 4 chặng mỏ đã gỡ hết biển nguy hiểm, công nhân không còn phải đứng gần vách đá sạt nữa!'}]} at={6} />
      <Sola x={230} mat={[[0, 'happy']]} says={[{at: 94, out: 172, text: 'Máy khai thác đá R1 xin ở lại giữ an toàn cho mỏ đá của anh Dũng ạ!'}]} />
    </NenHienTruong>
  );
};

const NgoaiDoiM6: React.FC = () => {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  const THE = [
    {icon: 'Radar' as const, ten: 'Radar Quét Địa Hình 3D Xuyên Bụi', mo: 'Robot mỏ lộ thiên dùng LiDAR & Radar xuyên bụi lập bản đồ lưới 2D/3D phát hiện đá lở sớm.'},
    {icon: 'Truck' as const, ten: 'Tổ Hợp Máy Khai Khoáng Tự Hành Từ Xa', mo: 'Thợ mỏ ngồi tại phòng điều khiển an toàn, robot tự hành dọn đá ở các vách núi hiểm trở.'},
  ];
  return (
    <NenHienTruong anh={NEN} mua="m6" luoi={false} toi={0.58}>
      <div style={{position: 'absolute', left: 40, top: 120, right: 40, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 48, color: C.yellow, textShadow: `0 6px 0 ${C.ink}`}}>
        CÔNG NGHỆ NGOÀI ĐỜI THỰC · M6
      </div>

      {/* Hero Showcase: Robot R1 của mùa -> Công nghệ thực tế (top: 210 .. 490) */}
      <div style={{position: 'absolute', left: 50, right: 50, top: 210, height: 275, borderRadius: 32,
        background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', border: `6px solid ${C.ink}`,
        boxShadow: `0 14px 0 ${C.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 34px',
        transform: `scale(${pop(f, 6, fps)})`, boxSizing: 'border-box'}}>
        <div style={{width: 225, height: 225, borderRadius: 28, background: 'rgba(255,255,255,0.08)', border: `4px solid ${C.yellow}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
          <Img src={staticFile('robot/m6/omni-du-vui.png')} style={{width: 205, height: 205, objectFit: 'contain', transform: 'rotate(-90deg)'}} />
        </div>
        <div style={{flex: 1, marginLeft: 28, fontFamily: FONT, color: '#fff'}}>
          <div style={{display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 99, background: '#D97706',
            border: '3px solid #fff', fontSize: 22, fontWeight: 900, marginBottom: 10}}>
            TỪ SA BÀN CLB RA THỰC TẾ
          </div>
          <div style={{fontSize: 38, fontWeight: 900, color: '#FDE047', marginBottom: 6}}>Máy Khai Thác Đá Omni R1</div>
          <div style={{fontSize: 26, fontWeight: 700, color: '#E2E8F0', lineHeight: 1.3}}>Lướt ngang và chéo bằng bánh Mecanum/Omni, quét Radar 360° trên lưới 2D.</div>
        </div>
      </div>

      {THE.map((t, i) => (
        <div key={t.ten} style={{position: 'absolute', left: 50, right: 50, top: 515 + i * 325, height: 295, padding: '28px 34px', borderRadius: 30, background: '#fff',
          border: `6px solid ${C.ink}`, boxShadow: `0 14px 0 ${C.ink}`, display: 'flex', gap: 28, alignItems: 'center',
          transform: `scale(${pop(f, 12 + i * 16, fps)})`, boxSizing: 'border-box'}}>
          <div style={{width: 150, height: 150, borderRadius: 28, background: '#D97706', border: `5px solid ${C.ink}`,
            boxShadow: `0 8px 0 ${C.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
            <Icon name={t.icon} size={84} color="#fff" />
          </div>
          <div style={{fontFamily: FONT, color: C.ink, flex: 1}}>
            <div style={{fontWeight: 900, fontSize: 38, marginBottom: 10, lineHeight: 1.2}}>{t.ten}</div>
            <div style={{fontWeight: 800, fontSize: 28, color: '#334155', lineHeight: 1.34}}>{t.mo}</div>
          </div>
        </div>
      ))}
      <Luna mat={[[0, 'happy']]} says={[{at: 14, out: 142, text: 'Thuật toán duyệt lưới 2 chiều (2D Grid) tụi mình viết chính là cốt lõi của hệ thống định vị robot khai khoáng!'}]} />
    </NenHienTruong>
  );
};

const NhaMua7: React.FC = () => {
  const f = useCurrentFrame();
  const s = 1 + 0.04 * Math.sin(f / 8);
  return (
    <AbsoluteFill style={{background: C.ink, overflow: 'hidden'}}>
      <Img src={staticFile('nen-doc/mua-hang.png')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${s})`}} />
      <div style={{position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.45)'}} />
      <div style={{position: 'absolute', left: 60, right: 60, top: 200, padding: '28px 36px', borderRadius: 28, background: '#0D9488',
        border: `5px solid ${C.ink}`, boxShadow: `0 12px 0 ${C.ink}`, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 44, color: '#fff'}}>
        MÙA 7 TIẾP THEO · HANG ĐỘNG ĐÁ VÔI CHÚ PHONG
      </div>
      <Nguoi anh="phong-tin" ten="CHÚ PHONG" mau="#0D9488" x={820} h={600} at={8} side="left" bubbleW={560} bubbleTop={1230}
        says={[{at: 12, out: 76, text: 'Sâu bên trong vách núi đá vôi vừa phát lộ hang động thạch nhũ! Đoàn khảo sát đang cần robot định vị tiếng vang dẫn đường!'}]} />
      <Sola x={230} mat={[[0, 'surprised'], [78, 'happy']]} says={[{at: 82, out: 145, text: 'Mùa 7 mình tiến vào Hang động đá vôi: chế tạo Xe thám hiểm sóng âm và học từ điển dict!'}]} />
    </AbsoluteFill>
  );
};

/* ================================================================== ĐĂNG KÝ 20 PHIM MÙA 6 */
const mo = (so: number, canh: Phim['canh']): Phim => ({id: `M6G${so}-Mo`, doc: true, canh});
const ket = (so: number, canh: Phim['canh']): Phim => ({id: `M6G${so}-Ket`, doc: true, canh});
const tt = (so: number, ten: string, con: string, loi: string, anToan: [number, number, number, number], xoa?: number) => ({
  id: 'thanh-tuu', dur: 170, el: <ThanhTuu moi={so - 1} loi={loi} con={con} so={so} ten={ten} anToan={anToan} xoa={xoa} />,
  sfx: [[22, xoa !== undefined ? 'wrong.wav' : 'ding.wav', 0.5]] as any,
});
const xe = (anh: string, luna: string, sola: string, tenPart: string, cach = 120) => ({
  id: 'trong-xe', dur: cach + 70,
  el: <TrongXe mua="m6" anh={anh} cach={cach} tenPart={tenPart} luna={[{at: 10, out: 70, text: luna}]} sola={[{at: 76, out: cach - 4, text: sola}]}
    lunaMat={[[0, 'thinking'], [76, 'happy']]} solaMat={[[0, 'thinking'], [76, 'confident']]} />,
  sfx: [[cach, 'impact.wav', 0.5], [cach, 'ding.wav', 0.4]] as any,
});
const treo = (anh: string, cau: string, so: number, ten: string) => ({
  id: 'cau-treo', dur: 110, el: <CauTreo mua="m6" xoay={-90} anh={anh} cau={cau} so={so} ten={ten} />, sfx: [W_IN, [40, 'pop.wav', 0.4]] as any,
});

export const PHIM_M6: Phim[] = [
  mo(1, [
    {id: 'hien-truong', dur: 180, el: <G1Mo />, sfx: [W_IN, [66, 'wrong.wav', 0.5]]},
    xe('omni', 'Đi dọc gờ đá hẹp mà mặt vẫn nhìn thẳng vào vách núi được không?', 'Lắp 4 bánh con lăn chéo Omni — trượt ngang mượt mà không cần quay đầu!', 'Thân bánh đa hướng Omni', 120),
    treo('omni', 'Mặt nhìn vách đá, trượt ngang dọc gờ hẹp nào!', 1, 'Bánh Omni'),
  ]),
  ket(1, [{id: 'lam', dur: 160, el: <G1Lam />, sfx: [[138, 'ding.wav', 0.5]]}, tt(1, 'Bánh Omni', 'Mưa còn: 9 giờ', 'Bám gờ đá vững vàng quá! Giờ dọn giúp anh mấy tảng đá vụn chắn đường nhé!', [25, 0, 0, 0])]),
  mo(2, [
    {id: 'thu', dur: 235, el: <G2Thu />, sfx: [[65, 'wrong.wav', 0.5]]},
    xe('omni-nem-cam', 'Làm sao đưa tảng đá sang bãi chứa bên kia rào mà không bước qua rào?', 'Lắp tay máy ném trước mũi — xúc đá vào gáo rồi hất vọt qua rào!', 'Tay máy ném trước mũi', 125),
    treo('omni-nem-cam', 'Xúc đá rồi hất thử một hòn qua rào nào!', 2, 'Máy ném'),
  ]),
  ket(2, [{id: 'lam', dur: 165, el: <G2Lam />, sfx: [[96, 'ding.wav', 0.5]]}, tt(2, 'Máy ném', 'Mưa còn: 8 giờ', 'Hất đá qua rào gọn quá! Nhưng khu ngã tư trên kia bụi đá mù mịt đấy!', [50, 20, 0, 0])]),
  mo(3, [
    {id: 'thu', dur: 240, el: <G3Thu />, sfx: [[88, 'wrong.wav', 0.5]]},
    xe('omni-radar-quet', 'Giữa màn bụi đá, có cách nào nhìn 1 lần thấy cả 4 phía không?', 'Gắn đĩa radar tròn trên nóc — quét một vòng thấy trọn 4 hướng!', 'Radar tròn quét 4 hướng', 125),
    treo('omni-radar-quet', 'Quét một vòng radar rồi chọn hướng có đá nhé!', 3, 'Radar tròn'),
  ]),
  ket(3, [{id: 'lam', dur: 165, el: <G3Lam />, sfx: [[142, 'ding.wav', 0.5]]}, tt(3, 'Radar tròn', 'Mưa còn: 7 giờ', 'Radar xuyên bụi nhạy thật! Lên sườn dốc tận dụng đá tròn lấp hố khai thác cũ nhé!', [75, 45, 15, 0])]),
  mo(4, [
    {id: 'thu', dur: 240, el: <G4Thu />, sfx: [[70, 'wrong.wav', 0.5]]},
    treo('omni-radar', 'Đẩy tảng đá tròn trên dốc cho nó lăn xuống lấp hố nào!', 4, 'Đá tròn lăn dốc'),
  ]),
  ket(4, [{id: 'lam', dur: 165, el: <G4Lam />, sfx: [[76, 'impact.wav', 0.5], [150, 'ding.wav', 0.5]]}, tt(4, 'Đá tròn lăn dốc', 'Mưa còn: 6 giờ', 'Lăn đá lấp hố thông minh lắm! Nhưng khe hẹp phía trên có đá lăn bất ngờ đấy!', [85, 65, 40, 15])]),
  mo(5, [
    {id: 'thu', dur: 240, el: <G5Thu />, sfx: [[80, 'wrong.wav', 0.5]]},
    xe('omni-radar-vui', 'Trượt ngang và tiến tới cùng một lúc trong 1 nhịp được không?', 'Đồng bộ cặp bánh con lăn chéo — lướt chéo 1 nhịp vọt qua trước đá lăn!', 'Đồng bộ bánh đi chéo', 125),
    treo('omni-radar-vui', 'Đi chéo một nhịp vượt qua trước khi đá lăn tới nhé!', 5, 'Đi chéo 1 nhịp'),
  ]),
  ket(5, [{id: 'lam', dur: 165, el: <G5Lam />, sfx: [[112, 'ding.wav', 0.5]]}, tt(5, 'Đi chéo 1 nhịp', 'Mưa còn: 5 giờ', 'Lướt chéo nhanh như chớp! Nhưng mưa đầu mùa làm vách đá sạt xuống rồi!', [90, 80, 55, 30])]),
  mo(6, [
    {id: 'thu', dur: 245, el: <G6Thu />, sfx: [[20, 'impact.wav', 0.6], [75, 'wrong.wav', 0.5]]},
    xe('omni-du', 'Bãi chứa gần thì hất nhẹ, bãi chứa xa thì chỉnh lực thế nào?', 'Lắp thước ngắm chỉnh lực aim(1..3) — đếm số ô trên lưới rồi chọn đúng lực!', 'Thước ngắm chỉnh lực aim(n)', 125),
    treo('omni-du', 'Đếm ô trên lưới 2 chiều rồi chỉnh lực aim(n) nhé!', 6, 'Chỉnh lực ném'),
  ]),
  ket(6, [{id: 'lam', dur: 165, el: <G6Lam />, sfx: [[65, 'ding.wav', 0.4], [142, 'ding.wav', 0.5]]}, tt(6, 'Chỉnh lực ném', 'Mưa còn: 4 giờ', 'Dọn xong đoạn sạt lở rồi! Nhưng trên bãi lẫn cả đá hộc tròn và đá xẻ vuông đấy!', [90, 80, 50, 35], 4)]),
  mo(7, [
    {id: 'thu', dur: 240, el: <G7Thu />, sfx: [[75, 'wrong.wav', 0.5]]},
    xe('omni-du-vui', 'Bụi phủ làm đá tròn và đá khối vuông trông giống nhau, radar phân biệt sao?', 'Nâng cấp mắt radar nhận dáng — phân biệt rõ đá tròn và đá xẻ vuông!', 'Radar nhận diện hình dạng', 125),
    treo('omni-du-vui', 'Nhận diện hình dạng tròn hay vuông trước khi hất nhé!', 7, 'Nhận diện dáng'),
  ]),
  ket(7, [{id: 'lam', dur: 165, el: <G7Lam />, sfx: [[65, 'ding.wav', 0.4], [142, 'ding.wav', 0.5]]}, tt(7, 'Nhận diện dáng', 'Mưa còn: 3 giờ', 'Phân loại đá tròn với đá xẻ chuẩn lắm! Giờ đi theo vạch màu an toàn của mỏ nhé!', [95, 85, 75, 50])]),
  mo(8, [
    {id: 'thu', dur: 240, el: <G8Thu />, sfx: [[65, 'wrong.wav', 0.5]]},
    treo('omni-du', 'Đi theo vạch xanh an toàn và ghé trạm sạc P nạp điện nào!', 8, 'Vạch màu & Trạm sạc'),
  ]),
  ket(8, [{id: 'lam', dur: 165, el: <G8Lam />, sfx: [[85, 'ding.wav', 0.4], [142, 'ding.wav', 0.5]]}, tt(8, 'Vạch màu & Trạm sạc', 'Mưa còn: 2 giờ', 'Đi đúng vạch xanh an toàn chuẩn lắm! Giờ lên đỉnh mỏ gọi thêm Drone R2 nhé!', [100, 90, 85, 70])]),
  mo(9, [
    {id: 'thu', dur: 235, el: <G9Thu />, sfx: [[58, 'wrong.wav', 0.5]]},
    xe('r2', 'Ai bay cao lên trên tầng bụi để nhìn thấy đá lăn trên đỉnh vách?', 'Lắp R2 Drone + Camera bay canh trên cao, báo xuống cho R1 Omni dọn dưới đất!', 'R2 Drone trinh sát', 120),
    treo('omni-du', 'R2 canh trên cao, R1 đón lõng dưới đất nào!', 9, 'Phối hợp R2 Drone'),
  ]),
  ket(9, [{id: 'lam', dur: 165, el: <G9Lam />, sfx: [[48, 'pop.wav', 0.4], [142, 'ding.wav', 0.5]]}, tt(9, 'Phối hợp R2 Drone', 'Mưa còn: 1 giờ', 'Có Drone R2 canh trên cao và Omni R1 dọn dưới đất thì yên tâm tuyệt đối!', [100, 100, 95, 85])]),
  mo(10, [
    {id: 'tha-tay', dur: 160, el: <ThaTayM6 />, sfx: [W_IN, [60, 'riser.wav', 0.4]]},
  ]),
  ket(10, [
    {id: 'canh-1', dur: 150, el: <G10Canh1 />, sfx: [[36, 'impact.wav', 0.5], [112, 'ding.wav', 0.4]]},
    {id: 'canh-2', dur: 165, el: <G10Canh2 />, sfx: [[115, 'ding.wav', 0.5]]},
    tt(10, 'Xuất xưởng', 'Trước cơn mưa!', 'Cả 4 chặng đường mỏ đã an toàn 100% trước khi mưa lớn đổ xuống!', [100, 100, 100, 100]),
    {id: 'xuat-xuong', dur: 180, el: <XuatXuongM6 />, sfx: [[18, 'impact.wav', 0.8], [20, 'ding.wav', 0.5]]},
    {id: 'ngoai-doi', dur: 150, el: <NgoaiDoiM6 />, sfx: [W_IN]},
    {id: 'nha', dur: 150, el: <NhaMua7 />, sfx: [[25, 'whoosh-soft.wav', 0.4]]},
  ]),
];
