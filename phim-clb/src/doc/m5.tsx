// 10 phim gói mùa 5 "Nông trại hoa", khổ dọc, theo hoc/KICH-BAN-PHIM-GOI-CLB.md bản 3 mục 6:
// mỗi gói hai phim: M5G<n>-Mo (phim mở) và M5G<n>-Ket (đoạn kết sau màn trùm).
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Burst, C, CodeBox, FONT, Icon, Mascot, MONO, Say, Shake, ease, pop} from '../d10';
import {Phim, W_IN} from '../may-phim';
import {BangViec, CauTreo, ChuNay, Moc, NenHienTruong, NhanGoi, Nguoi, O, ODat, TrongXe, Vat, Xe, chonDangNguoi, tamO} from './kit-doc';

const NEN = 'nen-doc/mua-4.png';
const DON = [
  'Bay qua luống mầm non', 'Gieo hạt hoa hồng & hoa cúc', 'Nhìn luống mẫu 4 hướng', 'Sao chép dãy hoa dài', 'Canh pin ghé trạm sạc P',
  'Rải hạt liền mạch theo hàng', 'Đọc thẻ màu ngay dưới bụng', 'Bay qua kênh nước & chậu bác Sơn', 'Phối hợp R2 đưa hạt ra bờ', 'Dệt thảm hoa Xuân kịp Tết',
];

/** Chị Lan chủ nông trại hoa (ảnh TopView tách nền). */
const Lan: React.FC<{says: Say[]; at?: number; x?: number; side?: 'left' | 'right'; dang?: string}> = ({says, at = 0, x = 820, side = 'left', dang = 'lan-nghi'}) => (
  <Nguoi anh={dang} ten="CHỊ LAN" mau="#EC4899" x={x} h={600} at={at} says={says} side={side} bubbleW={560} bubbleTop={1230} />
);
const Sola: React.FC<{says: Say[]; mat: [number, string][]; at?: number; x?: number}> = ({says, mat, at = 0, x = 240}) => (
  <Mascot who="sola" x={x} h={540} at={at} faces={mat} says={says} bubbleW={520} bubbleTop={1240} />
);
const Luna: React.FC<{says: Say[]; mat: [number, string][]; at?: number; x?: number}> = ({says, mat, at = 0, x = 840}) => (
  <Mascot who="luna" x={x} h={540} at={at} faces={mat} says={says} side="left" bubbleW={520} bubbleTop={1240} lat />
);

/** Đồng hồ lịch đếm ngược ngày hội hoa Tết góc trên trái. */
const DongHoTet: React.FC<{con: string; gap?: boolean}> = ({con, gap}) => {
  const f = useCurrentFrame();
  const nhay = gap && Math.floor(f / 10) % 2 === 0;
  return (
    <div style={{position: 'absolute', left: 36, top: 44, display: 'flex', alignItems: 'center', gap: 14, padding: '12px 24px', borderRadius: 999,
      background: nhay ? C.bad : '#fff', color: nhay ? '#fff' : C.ink, border: `4px solid ${C.ink}`, boxShadow: `0 8px 0 ${C.ink}`, fontFamily: MONO, fontWeight: 800, fontSize: 36}}>
      <Icon name="Flower2" size={40} color={nhay ? '#fff' : '#EC4899'} stroke={2.6} />
      <span>{con}</span>
    </div>
  );
};

/** Bốn luống hoa 4 màu (Đỏ, Vàng, Xanh dương, Xanh lá) trên bảng thành tựu nở dần theo tiến độ. */
const VuonHoaBar: React.FC<{no: [number, number, number, number]; gio?: boolean}> = ({no, gio}) => {
  const LUONG = [
    {ten: 'Hoa Đỏ', mau: '#EF4444', nen: '#FEE2E2'},
    {ten: 'Hoa Vàng', mau: '#EAB308', nen: '#FEF9C3'},
    {ten: 'Hoa Lam', mau: '#2563EB', nen: '#DBEAFE'},
    {ten: 'Cỏ Xanh', mau: '#16A34A', nen: '#DCFCE7'},
  ];
  return (
    <div style={{position: 'absolute', left: 90, top: 150, width: 900, display: 'flex', gap: 14}}>
      {LUONG.map((l, i) => (
        <div key={l.ten} style={{flex: 1, padding: '12px 14px', borderRadius: 20, background: gio && i === 1 ? '#FEE2E2' : l.nen,
          border: `4px solid ${C.ink}`, boxShadow: `0 8px 0 ${C.ink}`, fontFamily: FONT, fontWeight: 800, fontSize: 22, color: C.ink, whiteSpace: 'nowrap'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 8}}>
            <span>{l.ten}</span><span>{no[i]}%</span>
          </div>
          <div style={{height: 14, borderRadius: 99, background: '#fff', border: `3px solid ${C.ink}`, overflow: 'hidden'}}>
            <div style={{width: `${no[i]}%`, height: '100%', background: l.mau}} />
          </div>
        </div>
      ))}
    </div>
  );
};

/** Đoạn kết chung mùa 5: 4 luống hoa + bảng tiến độ + lịch Tết + chị Lan. */
const ThanhTuu: React.FC<{moi: number; loi: string; con: string; so: number; ten: string; no: [number, number, number, number]; xoa?: number}> =
  ({moi, loi, con, so, ten, no, xoa}) => (
    <NenHienTruong anh={NEN} mua="m5" luoi={false} toi={0.52}>
      <VuonHoaBar no={no} gio={xoa !== undefined} />
      <BangViec tieuDe="Nhật ký gieo hoa đón Tết của chị Lan" dong={DON} xong={moi} moi={moi} xoa={xoa} at={22} y={270} />
      <DongHoTet con={con} gap={xoa !== undefined} />
      <NhanGoi so={so} ten={ten} />
      <Lan dang={chonDangNguoi('lan', so, xoa)} says={[{at: 48, out: 200, text: loi}]} at={28} />
    </NenHienTruong>
  );

/** Tấm bạt chắn gió góc trên phải (4, 0) gieo từ gói 1, chốt lỏng lay nhẹ theo gió; đến gói 6 bung ra. */
const BatGioGoc: React.FC<{bung?: boolean}> = ({bung}) => {
  const f = useCurrentFrame(), p = tamO(4, 0);
  const g = bung ? -28 : 4 * Math.sin(f / 6);
  return (
    <div style={{position: 'absolute', left: p.x - O * 0.45, top: p.y - O * 0.42, width: O * 0.9, height: O * 0.84, borderRadius: 14,
      background: bung ? 'linear-gradient(135deg, #F97316, #EA580C)' : 'linear-gradient(135deg, #38BDF8, #0284C7)',
      border: `4px solid ${C.ink}`, transform: `rotate(${g}deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <Icon name="Wind" size={48} color="#fff" />
    </div>
  );
};

/** Thanh hiển thị mức pin trên đầu drone trong gói 5 và gói 10. */
const PinDrone: React.FC<{c: number; r: number; pin: number}> = ({c, r, pin}) => {
  const p = tamO(c, r), mau = pin <= 25 ? C.bad : pin <= 50 ? C.warn : C.good;
  return (
    <div style={{position: 'absolute', left: p.x - 54, top: p.y - O * 0.72, width: 108, padding: '4px 10px', borderRadius: 12,
      background: '#0F172A', border: '3px solid #fff', display: 'flex', alignItems: 'center', gap: 8, fontFamily: MONO, fontWeight: 800, fontSize: 22, color: '#fff'}}>
      <div style={{flex: 1, height: 12, borderRadius: 6, background: '#334155', overflow: 'hidden'}}>
        <div style={{width: `${pin}%`, height: '100%', background: mau}} />
      </div>
    </div>
  );
};

/* ================================================================== GÓI 1 · Cánh quạt bay (Drone) */
const R_G1M: Moc[] = [[0, 2, 5.2, 0], [20, 2, 5.2, 0], [65, 2, 3.2, 0], [95, 2, 3.3, 0]];
const G1Mo: React.FC = () => (
  <Shake hits={[66]} amp={10}>
    <NenHienTruong anh={NEN} mua="m5">
      <BatGioGoc />
      {[1, 2, 3].map((c) => <ODat key={c} ten="o-luong-green" c={c} r={3} />)}
      <ODat ten="o-dich" c={2} r={1} />
      <Xe anh="nhen" moc={R_G1M} doi={[[66, 'nhen-ngac']]} />
      <ChuNay chu="DẬP MẦM!" at={66} den={138} x={tamO(2, 3).x + 150} y={tamO(2, 3).y - 30} />
      <DongHoTet con="Tết còn 10 ngày" />
      <NhanGoi so={1} ten="Cánh quạt bay" />
      <Lan dang="lan-hoang" says={[{at: 72, out: 175, text: 'Đất mới tưới mềm lắm, đi trên là nát mầm!'}]} at={58} />
    </NenHienTruong>
  </Shake>
);
const R_G1K: Moc[] = [[0, 1, 5.2, 0], [15, 1, 5.2, 0], [55, 1, 3, 0], [95, 2, 3, 0], [135, 2, 1, 0]];
const G1Lam: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m5">
    <BatGioGoc />
    {[1, 2, 3].map((c) => <ODat key={c} ten="o-luong-green" c={c} r={3} />)}
    <ODat ten="o-dich" c={2} r={1} />
    <Xe anh="drone" moc={R_G1K} doi={[[136, 'drone-vui']]} />
    <Burst at={136} x={tamO(2, 1).x} y={tamO(2, 1).y} color={C.yellow} />
    <DongHoTet con="Tết còn 9 ngày" />
  </NenHienTruong>
);

/* ================================================================== GÓI 2 · Bộ gieo hạt 4 màu */
const R_G2M: Moc[] = [[0, 1, 4.8, 0], [20, 1, 4.8, 0], [68, 1, 2, 0], [110, 3, 2, 0]];
const G2Thu: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <NenHienTruong anh={NEN} mua="m5">
      <BatGioGoc />
      <ODat ten="o-co-non" c={1} r={2} />
      <ODat ten="o-co-non" c={3} r={2} />
      <Vat ten="vat-bao-red" moc={[[0, 0, 2]]} />
      <Vat ten="vat-bao-yellow" moc={[[0, 4, 2]]} />
      <Xe anh="drone" moc={R_G2M} doi={[[72, 'drone-ngac']]} />
      <ChuNay chu="TRỐNG KHÔNG!" at={72} den={145} x={tamO(2, 2).x} y={tamO(2, 2).y - 60} mau={C.warn} />
      <DongHoTet con="Tết còn 8 ngày" />
      <NhanGoi so={2} ten="Bộ gieo hạt" />
      <Sola says={[{at: 8, out: 68, text: 'Bay tới rồi mà chưa có phễu thả hạt!'}]} mat={[[0, 'worried'], [72, 'confused']]} />
      {f >= 90 ? <Lan dang="lan-tin" says={[{at: 98, out: 230, text: 'Rải đúng hồng đỏ, cúc vàng vào từng ô nhé!'}]} at={90} /> : null}
    </NenHienTruong>
  );
};
const R_G2K: Moc[] = [[0, 1, 4.5, 0], [15, 1, 4.5, 0], [50, 1, 2, 0], [75, 1, 2, 0], [115, 3, 2, 0], [150, 3, 2, 0]];
const G2Lam: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <NenHienTruong anh={NEN} mua="m5">
      <BatGioGoc />
      <ODat ten="o-co-non" c={1} r={2} />
      <ODat ten="o-co-non" c={3} r={2} />
      {f >= 60 ? <ODat ten="o-hoa-red" c={1} r={2} /> : null}
      {f >= 130 ? <ODat ten="o-hoa-yellow" c={3} r={2} /> : null}
      <Vat ten="vat-bao-red" moc={[[0, 0, 2]]} />
      <Vat ten="vat-bao-yellow" moc={[[0, 4, 2]]} />
      <Xe anh="drone-son" moc={R_G2K} doi={[[52, 'drone-son-red'], [118, 'drone-son-yellow'], [142, 'drone-son-vui']]} />
      <Burst at={60} x={tamO(1, 2).x} y={tamO(1, 2).y} color={C.yellow} />
      <Burst at={130} x={tamO(3, 2).x} y={tamO(3, 2).y} color={C.yellow} />
      <DongHoTet con="Tết còn 8 ngày" />
    </NenHienTruong>
  );
};

/* ================================================================== GÓI 3 · Camera 4 hướng */
const R_G3M: Moc[] = [[0, 1, 4.5, 0], [35, 1, 2.5, 0], [135, 1, 2.5, 0]];
const G3Thu: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <NenHienTruong anh={NEN} mua="m5">
      <BatGioGoc />
      <ODat ten="o-luong-green" c={0} r={2.5} />
      <ODat ten="o-co-non" c={1} r={2.5} />
      {f >= 50 ? <ODat ten="o-hoa-red" c={1} r={2.5} /> : null}
      <ODat ten="o-luong-blue" c={4} r={1.5} />
      <ODat ten="o-co-non" c={3} r={1.5} />
      <Xe anh="drone-son" moc={R_G3M} doi={[[42, 'drone-son-red'], [72, 'drone-son-ngac']]} />
      <ChuNay chu="SAI MÀU!" at={68} den={140} x={tamO(1, 2.5).x + 150} y={tamO(1, 2.5).y} />
      <CodeBox lines={['ink("red")', 'dot()']} x={290} y={145} w={440} size={30} title="Đoán mò không nhìn mẫu" />
      <DongHoTet con="Tết còn 7 ngày" />
      <NhanGoi so={3} ten="Camera 4 hướng" />
      <Sola says={[{at: 6, out: 60, text: 'Cứ gieo màu đỏ đại vào ô trống!'}]} mat={[[0, 'confident'], [70, 'facepalm']]} />
      {f >= 92 ? <Lan says={[{at: 100, out: 235, text: 'Nhìn luống mẫu bên cạnh màu gì rồi gieo chứ!'}]} at={92} /> : null}
    </NenHienTruong>
  );
};
const R_G3K: Moc[] = [[0, 1, 4.2, 0], [30, 1, 2.5, 0], [65, 1, 2.5, 0], [105, 3, 1.5, 0], [150, 3, 1.5, 0]];
const G3Lam: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <NenHienTruong anh={NEN} mua="m5">
      <BatGioGoc />
      <ODat ten="o-luong-green" c={0} r={2.5} />
      <ODat ten="o-co-non" c={1} r={2.5} />
      {f >= 52 ? <ODat ten="o-hoa-green" c={1} r={2.5} /> : null}
      <ODat ten="o-luong-blue" c={4} r={1.5} />
      <ODat ten="o-co-non" c={3} r={1.5} />
      {f >= 128 ? <ODat ten="o-hoa-blue" c={3} r={1.5} /> : null}
      <Xe anh="drone-cam" moc={R_G3K} doi={[[35, 'drone-cam-green'], [110, 'drone-cam-blue'], [142, 'drone-cam-vui']]} />
      <Burst at={52} x={tamO(1, 2.5).x} y={tamO(1, 2.5).y} color={C.yellow} />
      <Burst at={128} x={tamO(3, 1.5).x} y={tamO(3, 1.5).y} color={C.yellow} />
      <DongHoTet con="Tết còn 7 ngày" />
    </NenHienTruong>
  );
};

/* ================================================================== GÓI 4 · Sao chép dãy luống hoa */
const MAU_4 = ['red', 'yellow', 'blue', 'green'] as const;
const R_G4M: Moc[] = [[0, 0, 3, 0], [35, 1, 3, 0], [75, 2, 3, 0], [135, 2, 3, 0]];
const G4Thu: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <NenHienTruong anh={NEN} mua="m5">
      <BatGioGoc />
      {MAU_4.map((m, i) => <ODat key={m} ten={`o-luong-${m}`} c={i} r={2} />)}
      {MAU_4.map((m, i) => <ODat key={m} ten="o-co-non" c={i} r={3} />)}
      {f >= 15 ? <ODat ten="o-hoa-red" c={0} r={3} /> : null}
      {f >= 45 ? <ODat ten="o-hoa-yellow" c={1} r={3} /> : null}
      {f >= 82 ? <ODat ten="o-hoa-blue" c={2} r={3} /> : null}
      <Xe anh="drone-cam" moc={R_G4M} doi={[[92, 'drone-cam-ngac']]} />
      <ChuNay chu="SÓT Ô!" at={92} den={160} x={tamO(3, 3).x} y={tamO(3, 3).y - 50} mau={C.warn} />
      <CodeBox lines={['c = color("up")', 'ink(c); dot()', 'go_right()']} x={270} y={145} w={460} size={30} title="Viết rời từng ô" />
      <DongHoTet con="Tết còn 6 ngày" />
      <NhanGoi so={4} ten="Sao chép luống" />
      {f >= 102 ? <Lan dang="lan-sot-ruot" says={[{at: 110, out: 245, text: 'Dãy dài giống nhau, viết lẻ từng ô dễ sót!'}]} at={102} /> : null}
    </NenHienTruong>
  );
};
const G4Nghi: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m5" toi={0.42}>
    {MAU_4.map((m, i) => <ODat key={m} ten={`o-luong-${m}`} c={i} r={2} />)}
    {MAU_4.map((m, i) => <ODat key={m} ten="o-co-non" c={i} r={3} />)}
    <Xe anh="drone-cam" moc={[[0, 0, 3, 0]]} />
    <Luna says={[{at: 6, out: 82, text: 'Mỗi ô trên hàng đều làm đúng một việc giống nhau, viết sao cho gọn?'}]} mat={[[0, 'thinking']]} />
    <Sola says={[{at: 88, out: 175, text: 'Đóng gói việc đọc màu và gieo hạt vào hàm rồi lặp hết dãy!'}]} mat={[[0, 'thinking'], [88, 'confident']]} />
  </NenHienTruong>
);
const R_G4K: Moc[] = [[0, 0, 3, 0], [35, 1, 3, 0], [70, 2, 3, 0], [105, 3, 3, 0], [150, 3, 3, 0]];
const G4Lam: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <NenHienTruong anh={NEN} mua="m5">
      <BatGioGoc />
      {MAU_4.map((m, i) => <ODat key={m} ten={`o-luong-${m}`} c={i} r={2} />)}
      {MAU_4.map((m, i) => <ODat key={m} ten="o-co-non" c={i} r={3} />)}
      {MAU_4.map((m, i) => (f >= 15 + i * 32 ? <ODat key={m} ten={`o-hoa-${m}`} c={i} r={3} /> : null))}
      <Xe anh="drone-cam" moc={R_G4K} doi={[[10, 'drone-cam-red'], [40, 'drone-cam-yellow'], [75, 'drone-cam-blue'], [110, 'drone-cam-green'], [138, 'drone-cam-vui']]} />
      <Burst at={120} x={tamO(3, 3).x} y={tamO(3, 3).y} color={C.yellow} />
      <DongHoTet con="Tết còn 6 ngày" />
    </NenHienTruong>
  );
};

/* ================================================================== GÓI 5 · Trạm sạc pin ngoài đồng */
const R_G5M: Moc[] = [[0, 2, 5.5, 0], [20, 2, 5.5, 0], [80, 2, 2.3, 0], [140, 2, 2.3, 0]];
const G5Thu: React.FC = () => {
  const f = useCurrentFrame();
  const pin = f < 20 ? 60 : f < 80 ? Math.max(10, Math.round(60 - (f - 20) * 0.85)) : 10;
  return (
    <NenHienTruong anh={NEN} mua="m5">
      <BatGioGoc />
      <ODat ten="o-sac" c={1} r={3} />
      <ODat ten="o-co-non" c={2} r={1} />
      <Xe anh="drone-cam" moc={R_G5M} doi={[[82, 'drone-dau']]} />
      <PinDrone c={2} r={f < 20 ? 5.5 : f < 80 ? 5.5 - ((f - 20) / 60) * 3.2 : 2.3} pin={pin} />
      <ChuNay chu="PIN YẾU!" at={80} den={150} x={tamO(2, 2.3).x + 150} y={tamO(2, 2.3).y} />
      <CodeBox lines={['for i in range(6):', '    go_up()']} x={280} y={145} w={440} size={30} title="Bay một mạch quên sạc" />
      <DongHoTet con="Tết còn 5 ngày" />
      <NhanGoi so={5} ten="Trạm sạc pin" />
      {f >= 92 ? <Lan dang="lan-sot-ruot" says={[{at: 100, out: 235, text: 'Bay xa tốn pin, sao không ghé trạm sạc!'}]} at={92} /> : null}
    </NenHienTruong>
  );
};
const G5Nghi: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m5" toi={0.42}>
    <ODat ten="o-sac" c={1} r={3} />
    <ODat ten="o-co-non" c={2} r={1} />
    <Xe anh="drone-cam-dau" moc={[[0, 1, 3, 0]]} />
    <Luna says={[{at: 6, out: 82, text: 'Làm sao biết khi nào pin sắp cạn để đáp xuống trạm sạc P?'}]} mat={[[0, 'thinking']]} />
    <Sola says={[{at: 88, out: 175, text: 'Kiểm tra battery() — pin thấp thì land() sạc đầy rồi take_off() bay tiếp!'}]} mat={[[0, 'thinking'], [88, 'confident']]} />
  </NenHienTruong>
);
const R_G5K: Moc[] = [[0, 2, 5.2, 0], [35, 1, 3, 0], [85, 1, 3, 0], [125, 2, 1, 0], [155, 2, 1, 0]];
const G5Lam: React.FC = () => {
  const f = useCurrentFrame();
  const pin = f < 35 ? 30 : f < 80 ? 100 : 85;
  return (
    <NenHienTruong anh={NEN} mua="m5">
      <BatGioGoc />
      <ODat ten="o-sac" c={1} r={3} />
      <ODat ten="o-co-non" c={2} r={1} />
      {f >= 132 ? <ODat ten="o-hoa-red" c={2} r={1} /> : null}
      <Xe anh="drone-cam" moc={R_G5K} doi={[[38, 'drone-cam-dau'], [85, 'drone-cam'], [128, 'drone-cam-red'], [145, 'drone-cam-vui']]} />
      <PinDrone c={f < 35 ? 1.5 : f < 85 ? 1 : 2} r={f < 35 ? 4 : f < 85 ? 3 : 1} pin={pin} />
      <Burst at={65} x={tamO(1, 3).x} y={tamO(1, 3).y} color={C.good} />
      <Burst at={132} x={tamO(2, 1).x} y={tamO(2, 1).y} color={C.yellow} />
      <DongHoTet con="Tết còn 5 ngày" />
    </NenHienTruong>
  );
};

/* ================================================================== GÓI 6 · Gió đêm thổi bạt + Rải hạt theo hàng (pen_down / pen_up) */
const R_G6M: Moc[] = [[0, 0, 3, 0], [45, 1, 3, 0], [135, 1, 3, 0]];
const G6Thu: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <NenHienTruong anh={NEN} mua="m5">
      <BatGioGoc bung />
      {[0, 1, 2, 3].map((c) => <ODat key={c} ten="o-co-non" c={c} r={3} />)}
      {f >= 15 ? <ODat ten="o-hoa-red" c={0} r={3} /> : null}
      {f >= 60 ? <ODat ten="o-hoa-red" c={1} r={3} /> : null}
      <Xe anh="drone-cam" moc={R_G6M} doi={[[12, 'drone-cam-red'], [75, 'drone-cam-ngac']]} />
      <ChuNay chu="CHẬM QUÁ!" at={75} den={145} x={tamO(2, 3).x} y={tamO(2, 3).y - 60} mau={C.warn} />
      <CodeBox lines={['dot(); go_right()', 'dot(); go_right()']} x={270} y={145} w={460} size={30} title="Chấm lẻ từng ô" />
      <DongHoTet con="Tết còn 4 ngày" />
      <NhanGoi so={6} ten="Rải theo hàng" />
      {f >= 92 ? <Lan dang="lan-hoang" says={[{at: 100, out: 245, text: 'Gió hỏng cả dải, chấm lẻ từng ô sao kịp!'}]} at={92} /> : null}
    </NenHienTruong>
  );
};
const R_G6K: Moc[] = [[0, 0, 3, 0], [20, 0, 3, 0], [125, 3, 3, 0], [150, 3, 3, 0]];
const G6Lam: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <NenHienTruong anh={NEN} mua="m5">
      <BatGioGoc bung />
      {[0, 1, 2, 3].map((c) => <ODat key={c} ten="o-co-non" c={c} r={3} />)}
      {[0, 1, 2, 3].map((c) => (f >= 22 + c * 30 ? <ODat key={c} ten="o-hoa-red" c={c} r={3} /> : null))}
      <Xe anh="drone-cam-red" moc={R_G6K} doi={[[130, 'drone-cam-vui']]} />
      <Burst at={125} x={tamO(3, 3).x} y={tamO(3, 3).y} color={C.yellow} />
      <DongHoTet con="Tết còn 4 ngày" gap />
    </NenHienTruong>
  );
};

/* ================================================================== GÓI 7 · Mắt nhìn thẳng xuống bụng (color("here")) */
const R_G7M: Moc[] = [[0, 0, 3, 0], [30, 1, 3, 0], [135, 1, 3, 0]];
const G7Thu: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <NenHienTruong anh={NEN} mua="m5">
      <BatGioGoc bung />
      <ODat ten="o-luong-yellow" c={1} r={3} />
      <ODat ten="o-co-non" c={2} r={3} />
      <ODat ten="o-co-non" c={3} r={3} />
      <Xe anh="drone-cam" moc={R_G7M} doi={[[55, 'drone-cam-ngac']]} />
      <ChuNay chu="KHÔNG THẤY!" at={55} den={135} x={tamO(1, 3).x + 150} y={tamO(1, 3).y - 50} mau={C.warn} />
      <CodeBox lines={['c = color("up")', 'ink(c)']} x={280} y={145} w={440} size={30} title="Nhìn ngang thay vì nhìn bụng" />
      <DongHoTet con="Tết còn 3 ngày" gap />
      <NhanGoi so={7} ten="Mắt nhìn xuống" />
      {f >= 82 ? <Lan dang="lan-ngac-nhien" says={[{at: 90, out: 235, text: 'Thẻ màu ngay dưới bụng drone, nhìn đâu thế!'}]} at={82} /> : null}
    </NenHienTruong>
  );
};
const R_G7K: Moc[] = [[0, 0, 3, 0], [30, 1, 3, 0], [55, 1, 3, 0], [125, 3, 3, 0], [150, 3, 3, 0]];
const G7Lam: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <NenHienTruong anh={NEN} mua="m5">
      <BatGioGoc bung />
      <ODat ten="o-luong-yellow" c={1} r={3} />
      <ODat ten="o-co-non" c={2} r={3} />
      <ODat ten="o-co-non" c={3} r={3} />
      {f >= 88 ? <ODat ten="o-hoa-yellow" c={2} r={3} /> : null}
      {f >= 122 ? <ODat ten="o-hoa-yellow" c={3} r={3} /> : null}
      <Xe anh="drone-cam" moc={R_G7K} doi={[[32, 'drone-cam-do'], [55, 'drone-cam-yellow'], [130, 'drone-cam-vui']]} />
      <Burst at={125} x={tamO(3, 3).x} y={tamO(3, 3).y} color={C.yellow} />
      <DongHoTet con="Tết còn 3 ngày" />
    </NenHienTruong>
  );
};

/* ================================================================== GÓI 8 · Kênh nước bác Bình & dãy chậu bác Sơn */
const R_G8M: Moc[] = [[0, 0, 3, 0], [35, 1, 3, 0], [75, 2, 3, 0], [135, 2, 3, 0]];
const G8Thu: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <NenHienTruong anh={NEN} mua="m5">
      {MAU_4.map((m, i) => <ODat key={m} ten="o-co-non" c={i} r={3} />)}
      {f >= 15 ? <ODat ten="o-hoa-red" c={0} r={3} /> : null}
      {f >= 48 ? <ODat ten="o-hoa-blue" c={1} r={3} /> : null}
      <Xe anh="drone-cam" moc={R_G8M} doi={[[12, 'drone-cam-red'], [45, 'drone-cam-blue'], [78, 'drone-cam-ngac']]} />
      <ChuNay chu="LỘN THỨ TỰ!" at={78} den={148} x={tamO(2, 3).x + 120} y={tamO(2, 3).y - 50} />
      <div style={{position: 'absolute', left: 140, top: 150, padding: '12px 24px', borderRadius: 18, background: '#E0F2FE', border: `4px solid ${C.ink}`,
        display: 'flex', alignItems: 'center', gap: 14, fontFamily: FONT, fontWeight: 800, fontSize: 30, color: C.ink}}>
        <Icon name="Waves" size={38} color="#0284C7" />Bác Bình & bác Sơn: "Nước ngọt và chậu 4 màu tới vườn rồi nhé!"
      </div>
      <DongHoTet con="Tết còn 2 ngày" />
      <NhanGoi so={8} ten="Dãy màu hoa" />
      {f >= 92 ? <Lan dang="lan-tin" says={[{at: 100, out: 235, text: 'Chậu xếp dãy màu, nhầm thứ tự là lệch giàn!'}]} at={92} /> : null}
    </NenHienTruong>
  );
};
const G8Nghi: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m5" toi={0.42}>
    {MAU_4.map((m, i) => <Vat key={m} ten={`vat-bao-${m}`} moc={[[0, i, 2]]} />)}
    {MAU_4.map((m, i) => <ODat key={m} ten="o-co-non" c={i} r={3} />)}
    <Xe anh="drone-cam" moc={[[0, 0, 3, 0]]} />
    <Luna says={[{at: 6, out: 82, text: 'Bốn màu xếp thành một hàng cố định rồi, đưa cả dãy màu cho R1 thế nào?'}]} mat={[[0, 'thinking']]} />
    <Sola says={[{at: 88, out: 175, text: 'Xếp các màu thành một dãy thứ tự rồi cho R1 đi gieo lần lượt!'}]} mat={[[0, 'thinking'], [88, 'confident']]} />
  </NenHienTruong>
);
const R_G8K: Moc[] = [[0, 0, 3, 0], [35, 1, 3, 0], [70, 2, 3, 0], [105, 3, 3, 0], [150, 3, 3, 0]];
const G8Lam: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <NenHienTruong anh={NEN} mua="m5">
      {MAU_4.map((m, i) => <Vat key={m} ten={`vat-bao-${m}`} moc={[[0, i, 2]]} />)}
      {MAU_4.map((m, i) => <ODat key={m} ten="o-co-non" c={i} r={3} />)}
      {MAU_4.map((m, i) => (f >= 15 + i * 32 ? <ODat key={m} ten={`o-hoa-${m}`} c={i} r={3} /> : null))}
      <Xe anh="drone-cam" moc={R_G8K} doi={[[10, 'drone-cam-red'], [40, 'drone-cam-yellow'], [75, 'drone-cam-blue'], [110, 'drone-cam-green'], [138, 'drone-cam-vui']]} />
      <Burst at={120} x={tamO(3, 3).x} y={tamO(3, 3).y} color={C.yellow} />
      <DongHoTet con="Tết còn 2 ngày" />
    </NenHienTruong>
  );
};

/* ================================================================== GÓI 9 · Gọi R2 dọn dưới đất cho R1 drone */
const R_G9M: Moc[] = [[0, 2, 4.5, 0], [35, 2, 2.2, 0], [135, 2, 2.2, 0]];
const G9Thu: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m5">
    <ODat ten="o-sac" c={1} r={3} />
    <ODat ten="o-co-non" c={2} r={2} />
    <ODat ten="o-co-non" c={3} r={2} />
    <Vat ten="vat-khoi-sat" moc={[[0, 1, 3]]} />
    <Vat ten="vat-khoi-sat" moc={[[0, 2, 2]]} />
    <Xe anh="drone-cam" moc={R_G9M} doi={[[42, 'drone-cam-ngac']]} />
    <ChuNay chu="VƯỚNG SẮT!" at={42} den={125} x={tamO(2, 2).x + 150} y={tamO(2, 2).y - 40} mau={C.warn} />
    <DongHoTet con="Tết còn 1 ngày" />
    <NhanGoi so={9} ten="Phối hợp 2 tầng" />
    <Sola says={[{at: 55, out: 220, text: 'Drone trên trời không dọn được tấm sắt đè luống!'}]} mat={[[0, 'worried'], [42, 'shocked']]} />
  </NenHienTruong>
);
const R2_G9K: Moc[] = [[0, 2, 4.2, 0], [30, 2, 2.68, 0], [75, 0, 2.68, 0], [150, 0, 2.68, 0]];
const R1_G9K: Moc[] = [[0, 3, 4.2, 0], [65, 2, 2, 0], [115, 3, 2, 0], [150, 3, 2, 0]];
const G9Lam: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <NenHienTruong anh={NEN} mua="m5">
      <ODat ten="o-co-non" c={2} r={2} />
      <ODat ten="o-co-non" c={3} r={2} />
      {f >= 85 ? <ODat ten="o-hoa-red" c={2} r={2} /> : null}
      {f >= 128 ? <ODat ten="o-hoa-yellow" c={3} r={2} /> : null}
      <Xe anh="r2" moc={R2_G9K} doi={[[32, 'r2-vui']]} />
      <Vat ten="vat-khoi-sat" moc={[[0, 2, 2], [32, 2, 2], [75, 0, 2]]} bam={{moc: R2_G9K, tu: 32, den: 74, goc: -90, xa: 0.68}} />
      <Xe anh="drone-cam" moc={R1_G9K} doi={[[70, 'drone-cam-red'], [115, 'drone-cam-yellow'], [140, 'drone-cam-vui']]} />
      <Burst at={85} x={tamO(2, 2).x} y={tamO(2, 2).y} color={C.yellow} />
      <Burst at={128} x={tamO(3, 2).x} y={tamO(3, 2).y} color={C.yellow} />
      <DongHoTet con="Tết còn 1 ngày" />
    </NenHienTruong>
  );
};

/* ================================================================== GÓI 10 · Xuất xưởng Drone nông nghiệp R1 */
const G10Mo: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m5">
    {MAU_4.map((m, i) => <ODat key={m} ten={`o-luong-${m}`} c={i} r={1} />)}
    {MAU_4.map((m, i) => <ODat key={m} ten="o-co-non" c={i} r={2} />)}
    <ODat ten="o-sac" c={1} r={4} />
    <ODat ten="o-dich" c={3} r={4} />
    <Xe anh="drone-cam" moc={[[0, 0, 4.5, 0]]} />
    <DongHoTet con="Chợ hoa Tết: hôm nay!" gap />
    <NhanGoi so={10} ten="Xuất xưởng" />
    <Lan dang="lan-sot-ruot" says={[{at: 10, out: 145, text: 'Khách sắp tới, còn thảm hoa lớn giữa sân thôi!'}]} />
  </NenHienTruong>
);
const ThaTayM5: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#EEF2FF', fontFamily: FONT}}>
      <Img src={staticFile('nen-doc/trong-xe.jpg')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(15,23,42,0.82) 0%, rgba(15,23,42,0.25) 45%, rgba(15,23,42,0.85) 100%)'}} />
      <CodeBox lines={['c = color("here")', 'if battery() < 3: land()', 'sow_line(c, 4)']} x={150} y={80} w={780} size={36} hl={2} title="drone_gieo_hoa.py" />
      <div style={{position: 'absolute', left: 540 - 310, top: 820 - 310, width: 620, height: 620, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(236,72,153,0.36) 0%, rgba(56,189,248,0.18) 55%, transparent 72%)',
        border: '5px dashed #FDE047', transform: `rotate(${f * 0.7}deg)`}} />
      <div style={{position: 'absolute', left: 540 - 280, top: 820 - 280, width: 560, height: 560}}>
        <Img src={staticFile('robot/m5/drone-cam-vui.png')} style={{width: '100%', height: '100%', filter: 'drop-shadow(0 18px 28px rgba(0,0,0,0.5))'}} />
      </div>
      <Sola says={[{at: 10, out: 72, text: 'Code xong! Để Drone R1 tự bay dệt trọn thảm hoa Tết cho chị Lan nhé!'}]} mat={[[0, 'confident'], [65, 'proud']]} x={260} />
      <Luna says={[{at: 78, out: 155, text: 'Cất cánh thôi Drone R1 ơi!'}]} mat={[[0, 'surprised'], [78, 'excited']]} x={820} />
    </AbsoluteFill>
  );
};
const R_G10A: Moc[] = [[0, 0, 2, 0], [35, 1, 2, 0], [70, 2, 2, 0], [115, 3, 2, 0], [140, 3, 2, 0]];
const G10DocMau: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <NenHienTruong anh={NEN} mua="m5">
      {MAU_4.map((m, i) => <ODat key={m} ten={`o-luong-${m}`} c={i} r={1} />)}
      {MAU_4.map((m, i) => <ODat key={m} ten="o-co-non" c={i} r={2} />)}
      {MAU_4.map((m, i) => (f >= 15 + i * 32 ? <ODat key={m} ten={`o-hoa-${m}`} c={i} r={2} /> : null))}
      <Xe anh="drone-cam" moc={R_G10A} doi={[[10, 'drone-cam-red'], [40, 'drone-cam-yellow'], [75, 'drone-cam-blue'], [110, 'drone-cam-green']]} />
      <DongHoTet con="Sáng 29 Tết" gap />
      <NhanGoi so={10} ten="Dệt thảm hoa" />
    </NenHienTruong>
  );
};
const R_G10B: Moc[] = [[0, 3, 2, 0], [35, 1, 4, 0], [80, 1, 4, 0], [125, 3, 4, 0], [160, 3, 4, 0]];
const G10SacPin: React.FC = () => {
  const f = useCurrentFrame();
  const pin = f < 35 ? 20 : f < 80 ? 100 : 88;
  return (
    <NenHienTruong anh={NEN} mua="m5">
      {MAU_4.map((m, i) => <ODat key={m} ten={`o-hoa-${m}`} c={i} r={2} />)}
      <ODat ten="o-sac" c={1} r={4} />
      <ODat ten="o-dich" c={3} r={4} />
      {f >= 130 ? <ODat ten="o-hoa-yellow" c={3} r={4} /> : null}
      <ChuNay chu="!" at={8} den={32} x={tamO(3, 2).x + 110} y={tamO(3, 2).y - 50} mau={C.warn} />
      <Xe anh="drone-cam" moc={R_G10B} doi={[[36, 'drone-cam-dau'], [80, 'drone-cam-yellow'], [135, 'drone-cam-vui']]} />
      <PinDrone c={f < 35 ? 2 : f < 80 ? 1 : 3} r={f < 35 ? 3 : 4} pin={pin} />
      <Burst at={65} x={tamO(1, 4).x} y={tamO(1, 4).y} color={C.good} />
      <Burst at={135} x={tamO(3, 4).x} y={tamO(3, 4).y} color={C.yellow} />
      <DongHoTet con="Khai hội Hoa Xuân!" />
      <NhanGoi so={10} ten="Sạc pin & về đích" />
    </NenHienTruong>
  );
};
const XuatXuongM5: React.FC = () => {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  const tem = pop(f, 60, fps, 8);
  const PART = ['Thân 4 cánh quạt · Lồng bảo vệ', 'Phễu gieo hạt 4 màu · Rải theo hàng', 'Camera 4 hướng · Mắt nhìn xuống'];
  return (
    <Shake hits={[62]} amp={14}>
      <AbsoluteFill style={{background: '#831843', fontFamily: FONT, backgroundImage: 'linear-gradient(rgba(255,255,255,.08) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,.08) 2px, transparent 2px)', backgroundSize: '60px 60px'}}>
        <div style={{position: 'absolute', top: 170, left: 0, right: 0, textAlign: 'center', color: '#fff', fontWeight: 900, fontSize: 70}}>Drone nông nghiệp R1</div>
        <div style={{position: 'absolute', left: 540 - 440, top: 260, width: 880, height: 880, transform: `scale(${1 + 0.02 * Math.sin(f / 10)})`}}>
          <Img src={staticFile('robot/m5/drone-cam-vui.png')} style={{width: 880, height: 880}} />
        </div>
        {PART.map((p, i) => (
          <div key={p} style={{position: 'absolute', left: 105, right: 105, top: 1150 + i * 110, opacity: ease(f, [10 + i * 10, 22 + i * 10], [0, 1]), padding: '18px 28px', borderRadius: 20,
            background: 'rgba(255,255,255,.14)', border: '3px solid rgba(255,255,255,.5)', color: '#fff', fontWeight: 800, fontSize: 38, display: 'flex', gap: 18, alignItems: 'center'}}>
            <Icon name="CircleCheck" size={44} color={C.yellow} />{p}
          </div>
        ))}
        {f >= 54 ? (
          <div style={{position: 'absolute', left: 540, top: 760, transform: `translate(-50%, -50%) rotate(-14deg) scale(${2.4 - 1.4 * tem})`, opacity: Math.min(1, tem * 2),
            padding: '18px 44px', border: `12px solid ${C.yellow}`, borderRadius: 24, color: C.yellow, fontWeight: 900, fontSize: 110, letterSpacing: '0.06em', background: 'rgba(27,24,56,.92)', whiteSpace: 'nowrap'}}>XUẤT XƯỞNG</div>
        ) : null}
        <div style={{position: 'absolute', left: 80, right: 80, top: 1520, textAlign: 'center', color: '#FCE7F3', fontWeight: 700, fontSize: 40, lineHeight: 1.35, opacity: ease(f, [100, 120], [0, 1])}}>
          Thân drone gieo hạt ở lại nông trại cùng chị Lan.<br />Bộ não R1 về xe trạm, lên đường tiếp.
        </div>
      </AbsoluteFill>
    </Shake>
  );
};
const NgoaiDoiM5: React.FC = () => {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  const THE = [
    {icon: 'Plane' as const, ten: 'Drone Nông Nghiệp Thông Minh (Agri-Drone)', mo: 'Bay tự động theo bản đồ tọa độ, rải hạt giống đều tăm tắp mà không dẫm nát luống cây.'},
    {icon: 'Camera' as const, ten: 'Camera Đa Quang Phổ & Trạm Sạc Tự Động', mo: 'Quét màu lá cây từ trên cao để phát hiện chỗ thiếu nước và tự về trạm sạc khi pin yếu.'},
  ];
  return (
    <NenHienTruong anh={NEN} mua="m5" luoi={false} toi={0.58}>
      <div style={{position: 'absolute', left: 40, top: 120, right: 40, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 48, color: C.yellow, textShadow: `0 6px 0 ${C.ink}`}}>
        CÔNG NGHỆ NGOÀI ĐỜI THỰC · M5
      </div>

      {/* Hero Showcase: Robot R1 của mùa -> Công nghệ thực tế (top: 210 .. 490) */}
      <div style={{position: 'absolute', left: 50, right: 50, top: 210, height: 275, borderRadius: 32,
        background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', border: `6px solid ${C.ink}`,
        boxShadow: `0 14px 0 ${C.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 34px',
        transform: `scale(${pop(f, 6, fps)})`, boxSizing: 'border-box'}}>
        <div style={{width: 225, height: 225, borderRadius: 28, background: 'rgba(255,255,255,0.08)', border: `4px solid ${C.yellow}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
          <Img src={staticFile('robot/m5/drone-cam-vui.png')} style={{width: 200, height: 200, objectFit: 'contain'}} />
        </div>
        <div style={{flex: 1, marginLeft: 28, fontFamily: FONT, color: '#fff'}}>
          <div style={{display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 99, background: '#EC4899',
            border: '3px solid #fff', fontSize: 22, fontWeight: 900, marginBottom: 10}}>
            TỪ SA BÀN CLB RA THỰC TẾ
          </div>
          <div style={{fontSize: 38, fontWeight: 900, color: '#FDE047', marginBottom: 6}}>Drone Nông Nghiệp R1</div>
          <div style={{fontSize: 26, fontWeight: 700, color: '#E2E8F0', lineHeight: 1.3}}>Bay lơ lửng không dẫm luống hoa, đọc thẻ màu 5 hướng và rải hạt theo hàng.</div>
        </div>
      </div>

      {THE.map((t, i) => (
        <div key={t.ten} style={{position: 'absolute', left: 50, right: 50, top: 515 + i * 325, height: 295, padding: '28px 34px', borderRadius: 30, background: '#fff',
          border: `6px solid ${C.ink}`, boxShadow: `0 14px 0 ${C.ink}`, display: 'flex', gap: 28, alignItems: 'center',
          transform: `scale(${pop(f, 12 + i * 16, fps)})`, boxSizing: 'border-box'}}>
          <div style={{width: 150, height: 150, borderRadius: 28, background: '#EC4899', border: `5px solid ${C.ink}`,
            boxShadow: `0 8px 0 ${C.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
            <Icon name={t.icon} size={84} color="#fff" />
          </div>
          <div style={{fontFamily: FONT, color: C.ink, flex: 1}}>
            <div style={{fontWeight: 900, fontSize: 38, marginBottom: 10, lineHeight: 1.2}}>{t.ten}</div>
            <div style={{fontWeight: 800, fontSize: 28, color: '#334155', lineHeight: 1.34}}>{t.mo}</div>
          </div>
        </div>
      ))}
      <Sola mat={[[0, 'happy']]} says={[{at: 14, out: 142, text: 'Dùng danh sách (list) lưu chuỗi màu và điều khiển Drone bay rải hạt đúng chuẩn nông nghiệp công nghệ cao!'}]} />
    </NenHienTruong>
  );
};
const NhaMua6: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#1E293B', fontFamily: FONT, overflow: 'hidden'}}>
      <Img src={staticFile('nen-doc/mua-4.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.65}} />
      <AbsoluteFill style={{background: 'rgba(15,23,42,0.35)'}} />

      <div style={{position: 'absolute', left: 45, right: 45, top: 80, padding: '20px 28px', borderRadius: 26,
        background: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)', border: `5px solid #FDE047`,
        boxShadow: `0 10px 0 ${C.ink}`, textAlign: 'center', color: '#FDE047', fontWeight: 900, fontSize: 38}}>
        CHUYỂN TRẠM CHIẾN DỊCH · LÊN MỎ ĐÁ NÚI CAO MÙA 6!
      </div>

      <div style={{position: 'absolute', left: 45, right: 45, top: 230, height: 590, borderRadius: 36,
        background: 'linear-gradient(180deg, rgba(15,23,42,0.92) 0%, rgba(124,45,18,0.92) 100%)',
        border: `6px solid ${C.ink}`, boxShadow: `0 16px 0 ${C.ink}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around', padding: '28px 34px', boxSizing: 'border-box'}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-around', width: '100%'}}>
          <div style={{width: 260, height: 260, borderRadius: 32, background: '#FCE7F3', border: `6px solid #EC4899`,
            boxShadow: `0 10px 0 ${C.ink}`, overflow: 'hidden'}}>
            <Img src={staticFile('nguoi/lan-mung.png')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 10%'}} />
          </div>
          <Icon name="ArrowRight" size={64} color="#FDE047" stroke={3.5} />
          <div style={{width: 260, height: 260, borderRadius: 32, background: '#FFEDD5', border: `6px solid #EA580C`,
            boxShadow: `0 10px 0 ${C.ink}`, overflow: 'hidden'}}>
            <Img src={staticFile('nguoi/dung-hoang.png')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 10%'}} />
          </div>
        </div>
        <div style={{fontSize: 34, fontWeight: 900, color: '#fff', textAlign: 'center', lineHeight: 1.3}}>
          Chị Lan: "Đá lát lối vườn hoa chị đặt mua từ mỏ đá của anh Dũng trên núi đấy!"
        </div>
      </div>

      <div style={{position: 'absolute', left: 45, right: 45, top: 870, opacity: ease(f, [15, 35], [0, 1]),
        background: '#FEF3C7', borderRadius: 34, border: `6px solid ${C.ink}`, boxShadow: `0 16px 0 ${C.ink}`, padding: '32px 36px', display: 'flex', gap: 26, alignItems: 'center'}}>
        <div style={{width: 120, height: 120, borderRadius: 26, background: '#EA580C', border: `4px solid ${C.ink}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
          <Icon name="Mountain" size={72} color="#fff" />
        </div>
        <div>
          <div style={{fontSize: 24, fontWeight: 900, color: '#C2410C', marginBottom: 6}}>ĐIỂM ĐẾN TIẾP THEO · MÙA 6</div>
          <div style={{fontSize: 38, fontWeight: 900, color: C.ink, lineHeight: 1.28}}>
            Mỏ đá anh Dũng · Độ bánh đa hướng Omni & Radar 360° dọn đá trước cơn mưa lớn!
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== danh sách phim */
const mo = (so: number, canh: Phim['canh']): Phim => ({id: `M5G${so}-Mo`, doc: true, canh});
const ket = (so: number, canh: Phim['canh']): Phim => ({id: `M5G${so}-Ket`, doc: true, canh});
const tt = (so: number, ten: string, con: string, loi: string, no: [number, number, number, number], xoa?: number) => ({
  id: 'thanh-tuu', dur: 170, el: <ThanhTuu moi={so - 1} loi={loi} con={con} so={so} ten={ten} no={no} xoa={xoa} />,
  sfx: [[22, xoa !== undefined ? 'wrong.wav' : 'ding.wav', 0.5]] as any,
});
const xe = (anh: string, luna: string, sola: string, tenPart: string, cach = 120) => ({
  id: 'trong-xe', dur: cach + 70,
  el: <TrongXe mua="m5" anh={anh} cach={cach} tenPart={tenPart} luna={[{at: 10, out: 70, text: luna}]} sola={[{at: 76, out: cach - 4, text: sola}]}
    lunaMat={[[0, 'thinking'], [76, 'happy']]} solaMat={[[0, 'thinking'], [76, 'confident']]} />,
  sfx: [[cach, 'impact.wav', 0.5], [cach, 'ding.wav', 0.4]] as any,
});
const treo = (anh: string, cau: string, so: number, ten: string) => ({
  id: 'cau-treo', dur: 110, el: <CauTreo mua="m5" xoay={0} anh={anh} cau={cau} so={so} ten={ten} />, sfx: [W_IN, [40, 'pop.wav', 0.4]] as any,
});

export const PHIM_M5: Phim[] = [
  mo(1, [
    {id: 'hien-truong', dur: 180, el: <G1Mo />, sfx: [W_IN, [66, 'wrong.wav', 0.5]]},
    xe('drone', 'Không được chạm chân xuống đất thì làm sao qua luống hoa?', 'Lắp bốn cánh quạt có lồng bảo vệ — bay lơ lửng trên không!', 'Thân drone · Lồng bảo vệ', 120),
    treo('drone', 'Bay bốn hướng trên luống hoa nào!', 1, 'Cánh quạt bay'),
  ]),
  ket(1, [{id: 'lam', dur: 155, el: <G1Lam />, sfx: [[136, 'ding.wav', 0.5]]}, tt(1, 'Cánh quạt bay', 'Tết còn 9 ngày', 'Bay êm thế này không sợ dập cây nào nữa!', [10, 10, 10, 20])]),
  mo(2, [
    {id: 'thu', dur: 235, el: <G2Thu />, sfx: [[72, 'wrong.wav', 0.5]]},
    xe('drone-son', 'Có bốn loại hạt giống bốn màu, làm sao chọn đúng màu rồi thả?', 'Gắn phễu gieo hạt bốn ngăn dưới bụng — chọn màu rồi thả!', 'Phễu gieo hạt 4 màu', 125),
    treo('drone-son', 'Chọn màu hạt rồi gieo xuống luống nào!', 2, 'Bộ gieo hạt'),
  ]),
  ket(2, [{id: 'lam', dur: 165, el: <G2Lam />, sfx: [[60, 'pop.wav', 0.4], [130, 'ding.wav', 0.5]]}, tt(2, 'Bộ gieo hạt', 'Tết còn 8 ngày', 'Mỗi ô một màu hoa chuẩn chỉnh luôn!', [35, 35, 15, 25])]),
  mo(3, [
    {id: 'thu', dur: 240, el: <G3Thu />, sfx: [[68, 'wrong.wav', 0.5]]},
    xe('drone-cam', 'Drone bay ở giữa, làm sao nhìn được màu hoa ở bốn phía?', 'Gắn camera bốn hướng — nhìn trái, phải, trên, dưới biết ngay!', 'Camera bốn hướng', 125),
    treo('drone-cam', 'Nhìn màu bên cạnh rồi gieo đúng màu đó nhé!', 3, 'Camera 4 hướng'),
  ]),
  ket(3, [{id: 'lam', dur: 165, el: <G3Lam />, sfx: [[52, 'pop.wav', 0.4], [128, 'ding.wav', 0.5]]}, tt(3, 'Camera 4 hướng', 'Tết còn 7 ngày', 'Nhìn luống mẫu bên cạnh mà gieo chuẩn không sai một bông!', [45, 45, 45, 45])]),
  mo(4, [
    {id: 'thu', dur: 250, el: <G4Thu />, sfx: [[92, 'wrong.wav', 0.5]]},
    {id: 'nghi', dur: 180, el: <G4Nghi />, sfx: [[20, 'pop.wav', 0.3], [88, 'pop.wav', 0.3]]},
    treo('drone-cam', 'Sao chép trọn dãy hoa mẫu thật gọn nào!', 4, 'Sao chép luống'),
  ]),
  ket(4, [{id: 'lam', dur: 165, el: <G4Lam />, sfx: [[120, 'ding.wav', 0.5]]}, tt(4, 'Sao chép luống', 'Tết còn 6 ngày', 'Cả dãy dài nở đều tăm tắp, nhìn mê quá!', [60, 60, 60, 60])]),
  mo(5, [
    {id: 'thu', dur: 240, el: <G5Thu />, sfx: [[80, 'wrong.wav', 0.5]]},
    {id: 'nghi', dur: 180, el: <G5Nghi />, sfx: [[20, 'pop.wav', 0.3], [88, 'pop.wav', 0.3]]},
    treo('drone-cam-dau', 'Canh pin và ghé trạm sạc đúng lúc nhé!', 5, 'Trạm sạc pin'),
  ]),
  ket(5, [{id: 'lam', dur: 170, el: <G5Lam />, sfx: [[65, 'ding.wav', 0.4], [132, 'ding.wav', 0.5]]}, tt(5, 'Trạm sạc pin', 'Tết còn 5 ngày', 'Biết tự ghé trạm sạc nạp điện, bay xa mấy cũng yên tâm!', [70, 68, 65, 65])]),
  mo(6, [
    {id: 'thu', dur: 250, el: <G6Thu />, sfx: [[75, 'wrong.wav', 0.5]]},
    xe('drone-cam-red', 'Kẻ một đường dài thì chấm từng chấm hay hạ bút kéo một mạch?', 'Mở phễu liên tục — bay tới đâu hạt rải đều một vệt tới đó!', 'Van rải hạt theo hàng', 125),
    treo('drone-cam-red', 'Hạ phễu rải một mạch suốt luống dài nào!', 6, 'Rải theo hàng'),
  ]),
  ket(6, [{id: 'lam', dur: 160, el: <G6Lam />, sfx: [[125, 'ding.wav', 0.4]]}, tt(6, 'Rải theo hàng', 'Tết còn 4 ngày', 'Chết thật, gió thổi thẻ màu rơi xuống nằm ngay dưới mặt luống rồi!', [75, 40, 68, 68], 4)]),
  mo(7, [
    {id: 'thu', dur: 240, el: <G7Thu />, sfx: [[55, 'wrong.wav', 0.5]]},
    xe('drone-cam-do', 'Camera bốn hướng nhìn ngang rồi, còn ngay dưới bụng thì sao?', 'Thêm mắt kính nhìn thẳng xuống bụng — đọc ngay màu dưới chân!', 'Ống kính nhìn xuống bụng', 125),
    treo('drone-cam-do', 'Đọc màu ngay dưới bụng rồi gieo hoa tiếp nhé!', 7, 'Mắt nhìn xuống'),
  ]),
  ket(7, [{id: 'lam', dur: 165, el: <G7Lam />, sfx: [[35, 'pop.wav', 0.4], [125, 'ding.wav', 0.5]]}, tt(7, 'Mắt nhìn xuống', 'Tết còn 3 ngày', 'Nhìn thẳng xuống đất đọc thẻ màu nhanh thật đấy!', [82, 80, 78, 78])]),
  mo(8, [
    {id: 'thu', dur: 240, el: <G8Thu />, sfx: [[78, 'wrong.wav', 0.5]]},
    {id: 'nghi', dur: 180, el: <G8Nghi />, sfx: [[20, 'pop.wav', 0.3], [88, 'pop.wav', 0.3]]},
    treo('drone-cam', 'Gieo lần lượt theo đúng dãy màu nào!', 8, 'Dãy màu hoa'),
  ]),
  ket(8, [{id: 'lam', dur: 165, el: <G8Lam />, sfx: [[120, 'ding.wav', 0.5]]}, tt(8, 'Dãy màu hoa', 'Tết còn 2 ngày', 'Nước ngọt từ trạm bác Bình và chậu bác Sơn giúp hoa lên đẹp quá!', [90, 90, 88, 88])]),
  mo(9, [
    {id: 'thu', dur: 230, el: <G9Thu />, sfx: [[42, 'wrong.wav', 0.5]]},
    xe('r2', 'Ai dọn tấm sắt nặng dưới đất để mở luống cho R1 bay gieo?', 'Gọi R2 kéo sắt dưới đất, R1 drone bay gieo trên cao!', 'R2 dọn dưới đất', 120),
    treo('drone-cam', 'Dưới đất dọn sắt, trên trời gieo hoa!', 9, 'Phối hợp 2 tầng'),
  ]),
  ket(9, [{id: 'lam', dur: 165, el: <G9Lam />, sfx: [[32, 'click.wav', 0.5], [128, 'ding.wav', 0.5]]}, tt(9, 'Phối hợp 2 tầng', 'Tết còn 1 ngày', 'Một đứa dọn dưới đất, một đứa gieo trên trời — nhịp nhàng quá!', [96, 96, 95, 95])]),
  mo(10, [
    {id: 'hien-truong', dur: 155, el: <G10Mo />, sfx: [W_IN]},
    {id: 'tha-tay', dur: 160, el: <ThaTayM5 />, sfx: [[70, 'riser.wav', 0.4]]},
  ]),
  ket(10, [
    {id: 'doc-mau', dur: 150, el: <G10DocMau />, sfx: [[110, 'ding.wav', 0.4]]},
    {id: 'sac-pin', dur: 170, el: <G10SacPin />, sfx: [[65, 'ding.wav', 0.4], [135, 'ding.wav', 0.5]]},
    tt(10, 'Xuất xưởng', 'Khai hội Hoa Xuân!', 'Cả cánh đồng hoa Tết nở kịp giờ mở hội rồi! Cảm ơn hai cháu và R1!', [100, 100, 100, 100]),
    {id: 'xuat-xuong', dur: 180, el: <XuatXuongM5 />, sfx: [[60, 'impact.wav', 0.8], [62, 'ding.wav', 0.5]]},
    {id: 'ngoai-doi', dur: 150, el: <NgoaiDoiM5 />, sfx: [W_IN]},
    {id: 'nha', dur: 150, el: <NhaMua6 />, sfx: [[25, 'whoosh-soft.wav', 0.4]]},
  ]),
];
