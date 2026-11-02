// 10 phim gói mùa 3 "Bãi tái chế", khổ dọc, theo hoc/KICH-BAN-PHIM-GOI-CLB.md bản 2 mục 4:
// mỗi gói hai phim: M3G<n>-Mo (phim mở) và M3G<n>-Ket (đoạn kết sau màn trùm).
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Burst, C, CodeBox, FONT, Icon, Mascot, MONO, Say, Shake, ease, pop} from '../d10';
import {Phim, W_IN} from '../may-phim';
import {BangViec, CauTreo, ChuNay, Moc, NenHienTruong, NhanGoi, Nguoi, O, ODat, TrongXe, Vat, Xe, chonDangNguoi, tamO} from './kit-doc';

const NEN = 'nen-doc/mua-3.png';
const DON = [
  'Bò ngang qua khe sắt hẹp', 'Hút tấm sắt phẳng về thùng', 'Dò sắt dưới lớp bạt kín', 'Quét sạch ba hàng chữ Z', 'Bật nhảy qua rãnh thoát nước',
  'Đảo cực đẩy/hút nam châm loa', 'Đọc cực mô-tơ sạt lở', 'Tháo sắt băng chuyền cô Hạnh', 'R2 ủi bê-tông mở cổng cuối', 'Phân loại trọn bãi kịp xe',
];

/** Bác Sơn chủ bãi tái chế (ảnh TopView tách nền). */
const Sau: React.FC<{says: Say[]; at?: number; x?: number; side?: 'left' | 'right'; dang?: string}> = ({says, at = 0, x = 820, side = 'left', dang = 'sau-nghi'}) => (
  <Nguoi anh={dang} ten="BÁC SƠN" mau="#16A34A" x={x} h={600} at={at} says={says} side={side} bubbleW={560} bubbleTop={1230} />
);
const Sola: React.FC<{says: Say[]; mat: [number, string][]; at?: number; x?: number}> = ({says, mat, at = 0, x = 240}) => (
  <Mascot who="sola" x={x} h={540} at={at} faces={mat} says={says} bubbleW={520} bubbleTop={1240} />
);
const Luna: React.FC<{says: Say[]; mat: [number, string][]; at?: number; x?: number}> = ({says, mat, at = 0, x = 840}) => (
  <Mascot who="luna" x={x} h={540} at={at} faces={mat} says={says} side="left" bubbleW={520} bubbleTop={1240} lat />
);

/** Đồng hồ lịch hẹn xe thu mua phế liệu góc trên trái. */
const DongHoBai: React.FC<{con: string; gap?: boolean}> = ({con, gap}) => {
  const f = useCurrentFrame();
  const nhay = gap && Math.floor(f / 10) % 2 === 0;
  return (
    <div style={{position: 'absolute', left: 36, top: 44, display: 'flex', alignItems: 'center', gap: 14, padding: '12px 24px', borderRadius: 999,
      background: nhay ? C.bad : '#fff', color: nhay ? '#fff' : C.ink, border: `4px solid ${C.ink}`, boxShadow: `0 8px 0 ${C.ink}`, fontFamily: MONO, fontWeight: 800, fontSize: 36}}>
      <Icon name="Calendar" size={40} color={nhay ? '#fff' : '#16A34A'} stroke={2.6} />
      <span>Hạn dọn: {con}</span>
    </div>
  );
};

/** Ba thùng chứa lớn Sắt - Gỗ - Nhựa trên bảng thành tựu đầy dần theo tiến độ. */
const BaThung: React.FC<{muc: [number, number, number]; loiNhua?: boolean}> = ({muc, loiNhua}) => {
  const THUNG = [
    {ten: 'Thùng Sắt', mau: '#0284C7', nen: '#E0F2FE'},
    {ten: 'Thùng Gỗ', mau: '#D97706', nen: '#FEF3C7'},
    {ten: 'Thùng Nhựa', mau: loiNhua ? C.bad : '#16A34A', nen: loiNhua ? '#FEE2E2' : '#DCFCE7'},
  ];
  return (
    <div style={{position: 'absolute', left: 90, top: 150, width: 900, display: 'flex', gap: 18}}>
      {THUNG.map((t, i) => (
        <div key={t.ten} style={{flex: 1, padding: '12px 18px', borderRadius: 20, background: t.nen, border: `4px solid ${C.ink}`, boxShadow: `0 8px 0 ${C.ink}`,
          fontFamily: FONT, fontWeight: 800, fontSize: 26, color: C.ink}}>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 8}}>
            <span>{t.ten}</span><span>{muc[i]}%</span>
          </div>
          <div style={{height: 16, borderRadius: 99, background: '#fff', border: `3px solid ${C.ink}`, overflow: 'hidden'}}>
            <div style={{width: `${muc[i]}%`, height: '100%', background: t.mau}} />
          </div>
        </div>
      ))}
    </div>
  );
};

/** Đoạn kết chung mùa 3: 3 thùng Sắt-Gỗ-Nhựa + bảng tiến độ + lịch đếm ngược + bác Sơn. */
const ThanhTuu: React.FC<{moi: number; loi: string; con: string; so: number; ten: string; muc: [number, number, number]; xoa?: number}> =
  ({moi, loi, con, so, ten, muc, xoa}) => (
    <NenHienTruong anh={NEN} mua="m3" luoi={false} toi={0.52}>
      <BaThung muc={muc} loiNhua={xoa !== undefined} />
      <BangViec tieuDe="Tiến độ phân loại bãi tái chế bác Sơn" dong={DON} xong={moi} moi={moi} xoa={xoa} at={22} y={270} />
      <DongHoBai con={con} gap={xoa !== undefined} />
      <NhanGoi so={so} ten={ten} />
      <Sau dang={chonDangNguoi('sau', so, xoa)} says={[{at: 48, out: 200, text: loi}]} at={28} />
    </NenHienTruong>
  );

/** Cuộn nam châm loa cũ hai màu Đỏ (N) - Xanh (S) gieo từ gói 1 ở góc trên phải (4, 0). */
const LoaGoc: React.FC<{daLan?: boolean}> = ({daLan}) =>
  daLan ? null : <Vat ten="vat-nam-cham-n" moc={[[0, 4, 0]]} nghieng={(f) => 12 + 3 * Math.sin(f / 8)} />;

/** Vách sắt phế liệu chặn ô trên sân: dùng đúng ô khối phế liệu ép đai thép 3D (o-tuong-bai-tai-che) của game. */
const VachSat: React.FC<{o: [number, number][]}> = ({o}) => (
  <>{o.map(([c, r]) => <ODat key={`${c}-${r}`} ten="o-tuong-bai-tai-che" c={c} r={r} style={{borderRadius: 18}} />)}</>
);

/** Cửa sắt bãi phế liệu: mở = mờ đi. */
const Cua: React.FC<{c: number; r: number; mo: (f: number) => boolean}> = ({c, r, mo}) => {
  const f = useCurrentFrame();
  return <ODat ten="o-cua" c={c} r={r} mo={mo(f) ? 0.15 : 1} />;
};

/* ================================================================== GÓI 1 · Chân nhện */
const R_G1M: Moc[] = [[0, 1, 5.2, -90], [20, 1, 3.2, -90], [55, 1, 3.2, -35], [85, 1, 3.2, -55]];
const G1Mo: React.FC = () => (
  <Shake hits={[58]} amp={10}>
    <NenHienTruong anh={NEN} mua="m3">
      <LoaGoc />
      <VachSat o={[[0, 3], [2, 4], [2, 2], [4, 3]]} />
      <ODat ten="o-dich" c={3} r={1} />
      <Xe anh="xich" moc={R_G1M} doi={[[58, 'xich-ngac']]} />
      <ChuNay chu="KẸT GÓC!" at={58} den={135} x={tamO(1, 3).x + 140} y={tamO(1, 3).y - 40} />
      <DongHoBai con="6 giờ" />
      <NhanGoi so={1} ten="Chân nhện" />
      <Sau says={[{at: 68, out: 175, text: 'Chỗ này hẹp lại toàn sắt gồ ghề, xe xích xoay mình sao lọt!'}]} at={55} />
    </NenHienTruong>
  </Shake>
);
const R_G1K: Moc[] = [[0, 1, 5.2, 0], [15, 1, 5.2, 0], [50, 1, 3, 0], [95, 3, 3, 0], [135, 3, 1.2, 0]];
const G1Lam: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m3">
    <LoaGoc />
    <VachSat o={[[0, 3], [2, 4], [2, 2], [4, 3]]} />
    <ODat ten="o-dich" c={3} r={1} />
    <Xe anh="nhen" moc={R_G1K} doi={[[136, 'nhen-vui']]} />
    <Burst at={136} x={tamO(3, 1).x} y={tamO(3, 1).y} color={C.yellow} />
    <DongHoBai con="5 giờ 30" />
  </NenHienTruong>
);

/* ================================================================== GÓI 2 · Tay nam châm */
const R_G2M: Moc[] = [[0, 2, 5.2, 0], [20, 2, 5.2, 0], [70, 2, 2.75, 0], [100, 2, 2.9, 0]];
const G2Thu: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <NenHienTruong anh={NEN} mua="m3">
      <LoaGoc />
      <ODat ten="o-dich" c={4} r={3} />
      <Vat ten="vat-khoi-sat" moc={[[0, 2, 2]]} />
      <Xe anh="nhen" moc={R_G2M} doi={[[75, 'nhen-ngac']]} />
      <ChuNay chu="TRƠN QUÁ!" at={75} den={145} x={tamO(2, 2).x + 150} y={tamO(2, 2).y} mau={C.warn} />
      <DongHoBai con="5 giờ" />
      <NhanGoi so={2} ten="Nam châm" />
      <Sola says={[{at: 8, out: 68, text: 'Tấm sắt phẳng lì không có chỗ bám, làm sao nhấc?'}]} mat={[[0, 'worried'], [75, 'confused']]} />
      {f >= 90 ? <Sau says={[{at: 98, out: 230, text: 'Sắt tấm nằm bệt thế kia, tay thường không bấu vào đâu được!'}]} at={90} /> : null}
    </NenHienTruong>
  );
};
const R_G2K: Moc[] = [[0, 2, 4.8, 0], [15, 2, 4.8, 0], [50, 2, 2.68, 0], [65, 2, 2.68, 0], [105, 4, 2.68, 0], [140, 4, 3.68, 0]];
const G2Lam: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m3">
    <LoaGoc />
    <ODat ten="o-dich" c={4} r={3} />
    <Xe anh="nhen-nc" moc={R_G2K} doi={[[52, 'nhen-nc-hut'], [142, 'nhen-nc-vui']]} />
    <Vat ten="vat-khoi-sat" moc={[[0, 2, 2], [51, 2, 2], [143, 4, 3]]} bam={{moc: R_G2K, tu: 52, den: 142, goc: -90, xa: 0.68}} />
    <ChuNay chu="TÁCH!" at={52} den={90} x={tamO(2, 2).x + 120} y={tamO(2, 2).y} mau={C.good} />
    <Burst at={143} x={tamO(4, 3).x} y={tamO(4, 3).y} color={C.yellow} />
    <DongHoBai con="4 giờ 40" />
  </NenHienTruong>
);

/* ================================================================== GÓI 3 · Cảm biến từ */
const R_G3M: Moc[] = [[0, 0, 3.8, 0], [35, 0, 2.68, 0], [95, 0, 2.68, 0], [135, 0, 3.8, 0]];
const G3Thu: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <NenHienTruong anh={NEN} mua="m3">
      <LoaGoc />
      <Vat ten="vat-thung-go" moc={[[0, 0, 2]]} />
      <Vat ten="vat-thung-go" moc={[[0, 2, 2]]} />
      <Vat ten="vat-khoi-sat" moc={[[0, 4, 2]]} />
      <Xe anh="nhen-nc" moc={R_G3M} doi={[[40, 'nhen-nc-hut'], [75, 'nhen-nc-ngac']]} />
      <ChuNay chu="KHÔNG DÍNH!" at={72} den={135} x={tamO(0, 2).x + 160} y={tamO(0, 2).y} mau={C.warn} />
      <CodeBox lines={['go_up()', 'magnet_n()']} x={280} y={145} w={460} size={30} title="Hút đại không dò" />
      <DongHoBai con="4 giờ 20" />
      <NhanGoi so={3} ten="Cảm biến từ" />
      <Sola says={[{at: 6, out: 62, text: 'Thử hút kiện đầu tiên xem có sắt không!'}]} mat={[[0, 'confident'], [75, 'facepalm']]} />
      {f >= 95 ? <Sau says={[{at: 102, out: 235, text: 'Bạt phủ kín thế kia, nhìn ngoài biết đâu là sắt đâu là gỗ!'}]} at={95} /> : null}
    </NenHienTruong>
  );
};
const R_G3K: Moc[] = [[0, 0, 2.68, 0], [20, 0, 2.68, 0], [50, 2, 2.68, 0], [82, 4, 2.68, 0], [105, 4, 2.68, 0], [148, 4, 4.68, 0]];
const G3Lam: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m3">
    <LoaGoc />
    <ODat ten="o-dich" c={4} r={4} />
    <Vat ten="vat-thung-go" moc={[[0, 0, 2]]} />
    <Vat ten="vat-thung-go" moc={[[0, 2, 2]]} />
    <Xe anh="nhen-tu" moc={R_G3K} doi={[[84, 'nhen-tu-do'], [96, 'nhen-tu-n'], [150, 'nhen-tu-vui']]} />
    <Vat ten="vat-khoi-sat" moc={[[0, 4, 2], [95, 4, 2], [150, 4, 4]]} bam={{moc: R_G3K, tu: 96, den: 149, goc: -90, xa: 0.68}} />
    <Burst at={150} x={tamO(4, 4).x} y={tamO(4, 4).y} color={C.yellow} />
    <DongHoBai con="4 giờ" />
  </NenHienTruong>
);

/* ================================================================== GÓI 4 · Bãi phế liệu chữ Z */
const R_G4M: Moc[] = [[0, 0, 4.5, 0], [35, 3, 4.5, 0], [65, 3, 3.2, 0], [100, 4.1, 3.2, 0]];
const G4Thu: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Shake hits={[100]} amp={10}>
      <NenHienTruong anh={NEN} mua="m3">
        <LoaGoc />
        <VachSat o={[[4, 3], [0, 2]]} />
        <Vat ten="vat-khoi-sat" moc={[[0, 2, 4]]} />
        <Vat ten="vat-khoi-sat" moc={[[0, 1, 3]]} />
        <Vat ten="vat-khoi-sat" moc={[[0, 3, 1]]} />
        <Xe anh="nhen-tu" moc={R_G4M} doi={[[100, 'nhen-tu-ngac']]} />
        <ChuNay chu="LẠC ĐƯỜNG!" at={100} den={165} x={tamO(3, 3).x} y={tamO(3, 3).y - 60} />
        <CodeBox lines={['go_right()', 'go_up()', 'go_right()']} x={280} y={145} w={460} size={30} title="Viết lẻ từng bước" />
        <DongHoBai con="3 giờ 40" />
        <NhanGoi so={4} ten="Quét bãi" />
        {f >= 108 ? <Sau dang="sau-sot-ruot" says={[{at: 115, out: 245, text: 'Ba hàng giống nhau mà viết lẻ từng bước thế kia dễ nhầm lắm!'}]} at={108} /> : null}
      </NenHienTruong>
    </Shake>
  );
};
const G4Nghi: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m3" toi={0.42}>
    <Vat ten="vat-khoi-sat" moc={[[0, 1, 4]]} />
    <Vat ten="vat-khoi-sat" moc={[[0, 3, 3]]} />
    <Vat ten="vat-khoi-sat" moc={[[0, 1, 2]]} />
    <Xe anh="nhen-tu" moc={[[0, 0, 4.5, 0]]} />
    <Luna says={[{at: 6, out: 82, text: 'Mỗi hàng đều đi ngang rồi bước lên, có gì lặp lại không?'}]} mat={[[0, 'thinking']]} />
    <Sola says={[{at: 88, out: 175, text: 'Gom thành cụm lệnh quét hàng rồi lặp qua cả ba hàng!'}]} mat={[[0, 'thinking'], [88, 'confident']]} />
  </NenHienTruong>
);
const R_G4K: Moc[] = [[0, 0, 4.5, 0], [35, 3, 4.5, 0], [55, 3, 3.3, 0], [90, 1, 3.3, 0], [110, 1, 2.2, 0], [145, 3, 2.2, 0]];
const G4Lam: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m3">
    <LoaGoc />
    <ODat ten="o-dich" c={3} r={1} />
    <Vat ten="vat-khoi-sat" moc={[[0, 2, 3.8], [28, 2, 3.8], [148, 3, 1]]} bam={{moc: R_G4K, tu: 28, den: 147, goc: -90, xa: 0.68}} />
    <Xe anh="nhen-tu" moc={R_G4K} doi={[[28, 'nhen-tu-n'], [148, 'nhen-tu-vui']]} />
    <Burst at={148} x={tamO(3, 1).x} y={tamO(3, 1).y} color={C.yellow} />
    <DongHoBai con="3 giờ 20" />
  </NenHienTruong>
);

/* ================================================================== GÓI 5 · Lò xo chân nhện (Nhảy qua rãnh) */
const RANH_5 = [1, 2, 3, 4, 5];
const R_G5M: Moc[] = [[0, 0, 3, 0], [20, 0, 3, 0], [65, 1.15, 3, 0], [95, 1.0, 3, 0]];
const G5Thu: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <NenHienTruong anh={NEN} mua="m3">
      <LoaGoc />
      {RANH_5.map((r) => <ODat key={r} ten="o-ho" c={2} r={r} />)}
      <Vat ten="vat-khoi-sat" moc={[[0, 3, 2]]} />
      <Xe anh="nhen-tu" moc={R_G5M} doi={[[68, 'nhen-tu-ngac']]} />
      <ChuNay chu="RÃNH SÂU!" at={68} den={140} x={tamO(2, 3).x} y={tamO(2, 3).y - 60} mau={C.warn} />
      <DongHoBai con="3 giờ" />
      <NhanGoi so={5} ten="Bật nhảy" />
      {f >= 82 ? <Sau dang="sau-hoang" says={[{at: 90, out: 225, text: 'Cầu sắt mục gãy rồi, rãnh rộng thế bước thường sao qua!'}]} at={82} /> : null}
    </NenHienTruong>
  );
};
const R_G5K: Moc[] = [[0, 1, 2.68, 0], [25, 1, 2.68, 0], [55, 3, 2.68, 0], [80, 3, 2.68, 0], [115, 1, 2.68, 0], [140, 1, 4.68, 0]];
const G5Lam: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m3">
    <LoaGoc />
    {RANH_5.map((r) => <ODat key={r} ten="o-ho" c={2} r={r} />)}
    <ODat ten="o-dich" c={1} r={4} />
    <Xe anh="nhen-tu" moc={R_G5K} doi={[[15, 'nhen-co'], [55, 'nhen-tu-n'], [142, 'nhen-tu-vui']]} />
    <Vat ten="vat-khoi-sat" moc={[[0, 3, 2], [58, 3, 2], [142, 1, 4]]} bam={{moc: R_G5K, tu: 58, den: 141, goc: -90, xa: 0.68}} />
    <ChuNay chu="VÙ!" at={32} den={65} x={tamO(2, 2.5).x} y={tamO(2, 2.5).y - 50} mau={C.good} />
    <Burst at={142} x={tamO(1, 4).x} y={tamO(1, 4).y} color={C.yellow} />
    <DongHoBai con="2 giờ 40" />
  </NenHienTruong>
);

/* ================================================================== GÓI 6 · Đảo cực Đỏ/Xanh + bước lùi */
const R_G6M: Moc[] = [[0, 2, 4.5, 0], [20, 2, 4.5, 0], [65, 2, 2.75, 0], [95, 2, 4.2, 0]];
const G6Thu: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Shake hits={[68]} amp={12}>
      <NenHienTruong anh={NEN} mua="m3">
        <LoaGoc daLan />
        <Vat ten="vat-nam-cham-n" moc={[[0, 2, 2], [68, 2, 2], [90, 2, 1.4]]} />
        <Xe anh="nhen-tu-n" moc={R_G6M} doi={[[70, 'nhen-tu-ngac']]} />
        <ChuNay chu="ĐẨY VĂNG!" at={68} den={145} x={tamO(2, 2.5).x + 150} y={tamO(2, 2.5).y} />
        <CodeBox lines={['magnet_n()', 'go_up()']} x={280} y={145} w={440} size={30} title="Cùng cực Đỏ (N)" />
        <DongHoBai con="2 giờ 20" />
        <NhanGoi so={6} ten="Đảo cực" />
        {f >= 88 ? <Sau dang="sau-hoang" says={[{at: 96, out: 245, text: 'Nam châm trong loa thùng đấy, cùng màu cực Đỏ là nó đẩy văng ra!'}]} at={88} /> : null}
      </NenHienTruong>
    </Shake>
  );
};
const R_G6K: Moc[] = [[0, 1, 3.8, 0], [30, 1, 2.8, 0], [55, 3, 3.8, 0], [95, 3, 2.68, 0], [140, 3, 4.68, 0]];
const G6Lam: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m3">
    <LoaGoc daLan />
    <ODat ten="o-nut-de" c={1} r={1} />
    <ODat ten="o-dich" c={3} r={4} />
    <Vat ten="vat-nam-cham-n" moc={[[0, 1, 2], [32, 1, 2], [55, 1, 1]]} />
    <Xe anh="nhen-tu-n" moc={R_G6K} doi={[[60, 'nhen-tu-s'], [142, 'nhen-tu-vui']]} />
    <Vat ten="vat-nam-cham-n" moc={[[0, 3, 2], [96, 3, 2], [142, 3, 4]]} bam={{moc: R_G6K, tu: 96, den: 141, goc: -90, xa: 0.68}} />
    <Burst at={142} x={tamO(3, 4).x} y={tamO(3, 4).y} color={C.yellow} />
    <DongHoBai con="2 giờ" gap />
  </NenHienTruong>
);

/* ================================================================== GÓI 7 · Đọc cực từ bằng cảm biến */
const R_G7M: Moc[] = [[0, 1, 4.2, 0], [25, 1, 2.8, 0], [65, 1, 3.8, 0]];
const G7Thu: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Shake hits={[60]} amp={10}>
      <NenHienTruong anh={NEN} mua="m3">
        <LoaGoc daLan />
        <ODat ten="o-dem-tu-n" c={1} r={2} />
        <ODat ten="o-dem-tu-s" c={3} r={2} />
        <Vat ten="vat-nam-cham-n" moc={[[0, 1, 2], [58, 1, 2], [85, 0.3, 1.1]]} nghieng={(g) => ease(g, [58, 85], [0, -35])} />
        <Vat ten="vat-nam-cham-s" moc={[[0, 3, 2]]} />
        <Xe anh="nhen-tu-n" moc={R_G7M} doi={[[60, 'nhen-tu-ngac']]} />
        <ChuNay chu="SAI CỰC!" at={60} den={135} x={tamO(1, 2).x + 140} y={tamO(1, 2).y} />
        <CodeBox lines={['magnet_n()', 'go_up()']} x={280} y={145} w={440} size={30} title="Không đọc cực trước" />
        <DongHoBai con="1 giờ 45" gap />
        <NhanGoi so={7} ten="Đọc cực từ" />
        {f >= 82 ? <Sau dang="sau-sot-ruot" says={[{at: 90, out: 235, text: 'Vỏ ngoài bạc hết màu sơn rồi, bật bừa là nó đẩy văng lung tung đấy!'}]} at={82} /> : null}
      </NenHienTruong>
    </Shake>
  );
};
const G7Nghi: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m3" toi={0.42}>
    <ODat ten="o-dem-tu-n" c={1} r={2} />
    <ODat ten="o-dem-tu-s" c={3} r={2} />
    <Xe anh="nhen-tu-do" moc={[[0, 2, 3.5, 0]]} />
    <Luna says={[{at: 6, out: 82, text: 'Cảm biến từ có báo trước cực gì đang quay về phía R1 không?'}]} mat={[[0, 'thinking']]} />
    <Sola says={[{at: 88, out: 175, text: 'Hỏi cảm biến xem cực N hay S, rồi bật cực ngược lại để hút!'}]} mat={[[0, 'thinking'], [88, 'confident']]} />
  </NenHienTruong>
);
const R_G7K: Moc[] = [[0, 1, 4.2, 0], [30, 1, 2.68, 0], [65, 1, 4.2, 0], [95, 3, 2.68, 0], [140, 3, 4.2, 0]];
const G7Lam: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m3">
    <LoaGoc daLan />
    <ODat ten="o-dem-tu-n" c={1} r={2} />
    <ODat ten="o-dem-tu-s" c={3} r={2} />
    <ODat ten="o-dich" c={1} r={4} />
    <ODat ten="o-dich" c={3} r={4} />
    <Xe anh="nhen-tu-do" moc={R_G7K} doi={[[28, 'nhen-tu-s'], [75, 'nhen-tu-n'], [142, 'nhen-tu-vui']]} />
    <Vat ten="vat-nam-cham-n" moc={[[0, 1, 2], [30, 1, 2], [66, 1, 4]]} bam={{moc: R_G7K, tu: 30, den: 65, goc: -90, xa: 0.68}} />
    <Vat ten="vat-nam-cham-s" moc={[[0, 3, 2], [95, 3, 2], [141, 3, 4]]} bam={{moc: R_G7K, tu: 95, den: 140, goc: -90, xa: 0.68}} />
    <Burst at={66} x={tamO(1, 4).x} y={tamO(1, 4).y} color={C.yellow} />
    <Burst at={141} x={tamO(3, 4).x} y={tamO(3, 4).y} color={C.yellow} />
    <DongHoBai con="1 giờ 20" />
  </NenHienTruong>
);

/* ================================================================== GÓI 8 · Băng chuyền cũ từ nhà máy cô Hạnh */
const R_G8M: Moc[] = [[0, 3, 3.2, 0], [140, 3, 3.2, 0]];
const G8Thu: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <NenHienTruong anh={NEN} mua="m3">
      <LoaGoc daLan />
      {[0, 1, 2, 3].map((c) => <ODat key={c} ten="o-bang" c={c} r={2} />)}
      <Vat ten="vat-khoi-sat" moc={[[0, 0, 2], [60, 1, 2], [130, 2, 2]]} />
      <Xe anh="nhen-tu-n" moc={R_G8M} doi={[[65, 'nhen-tu-ngac']]} />
      <ChuNay chu="CHƯA TỚI!" at={65} den={135} x={tamO(3, 2).x + 110} y={tamO(3, 2).y} mau={C.warn} />
      <div style={{position: 'absolute', left: 165, top: 150, padding: '12px 24px', borderRadius: 18, background: '#E0F2FE', border: `4px solid ${C.ink}`,
        display: 'flex', alignItems: 'center', gap: 14, fontFamily: FONT, fontWeight: 800, fontSize: 30, color: C.ink}}>
        <Icon name="Factory" size={38} color="#0284C7" />Nhà máy cô Hạnh gửi băng chuyền cũ sang tái chế
      </div>
      <DongHoBai con="1 giờ" />
      <NhanGoi so={8} ten="Băng chuyền cũ" />
      {f >= 82 ? <Sau dang="sau-tin" says={[{at: 90, out: 235, text: 'Đồ từ nhà máy cô Hạnh gửi sang đấy, phải canh nhịp mới gắp kịp!'}]} at={82} /> : null}
    </NenHienTruong>
  );
};
const G8Nghi: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m3" toi={0.42}>
    {[0, 1, 2, 3].map((c) => <ODat key={c} ten="o-bang" c={c} r={2} />)}
    <Vat ten="vat-khoi-sat" moc={[[0, 1, 2]]} />
    <Xe anh="nhen-tu" moc={[[0, 3, 3.2, 0]]} />
    <Luna says={[{at: 6, out: 82, text: 'Băng chuyền mùa trước kết hợp nam châm mùa này — R1 canh lúc nào?'}]} mat={[[0, 'thinking']]} />
    <Sola says={[{at: 88, out: 175, text: 'Chờ băng chuyền đưa sắt tới đúng trước mặt rồi bật nam châm hút!'}]} mat={[[0, 'thinking'], [88, 'confident']]} />
  </NenHienTruong>
);
const R_G8K: Moc[] = [[0, 3, 2.68, 0], [95, 3, 2.68, 0], [145, 3, 4.68, 0]];
const G8Lam: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m3">
    <LoaGoc daLan />
    {[0, 1, 2, 3].map((c) => <ODat key={c} ten="o-bang" c={c} r={2} />)}
    <ODat ten="o-dich" c={3} r={4} />
    <Xe anh="nhen-tu" moc={R_G8K} doi={[[85, 'nhen-tu-n'], [148, 'nhen-tu-vui']]} />
    <Vat ten="vat-khoi-sat" moc={[[0, 0, 2], [85, 3, 2], [148, 3, 4]]} bam={{moc: R_G8K, tu: 86, den: 147, goc: -90, xa: 0.68}} />
    <Burst at={148} x={tamO(3, 4).x} y={tamO(3, 4).y} color={C.yellow} />
    <DongHoBai con="45 phút" />
  </NenHienTruong>
);

/* ================================================================== GÓI 9 · Gọi R2 bánh xích ủi bê-tông */
const R_G9M: Moc[] = [[0, 0, 4.8, 0], [20, 0, 4.8, 0], [70, 0, 3.68, 0], [95, 0, 3.85, 0]];
const G9Thu: React.FC = () => (
  <Shake hits={[72]} amp={10}>
    <NenHienTruong anh={NEN} mua="m3">
      <LoaGoc daLan />
      <ODat ten="o-nut-de" c={0} r={1} />
      <Cua c={3} r={2} mo={() => false} />
      {[1, 2, 3, 4].map((r) => <ODat key={r} ten="o-ho" c={2} r={r} />)}
      <Vat ten="vat-thung-nang" moc={[[0, 0, 3]]} />
      <Vat ten="vat-khoi-sat" moc={[[0, 3, 1]]} />
      <Xe anh="nhen-tu" moc={R_G9M} doi={[[72, 'nhen-tu-ngac']]} />
      <ChuNay chu="NẶNG QUÁ!" at={72} den={145} x={tamO(0, 3).x + 150} y={tamO(0, 3).y} />
      <DongHoBai con="30 phút" />
      <NhanGoi so={9} ten="R2 bánh xích" />
      <Sola says={[{at: 85, out: 225, text: 'Chân nhện leo trèo giỏi nhưng không ủi nổi khối bê-tông to thế kia!'}]} mat={[[0, 'worried'], [72, 'shocked']]} />
    </NenHienTruong>
  </Shake>
);
const R2_G9K: Moc[] = [[0, 0, 5.2, -90], [20, 0, 3.68, -90], [75, 0, 1.68, -90], [150, 0, 1.68, -90]];
const R1_G9K: Moc[] = [[0, 1, 3.5, 0], [65, 1, 3.5, 0], [95, 3, 3.5, 0], [120, 3, 1.68, 0], [155, 3, 4.68, 0]];
const G9Lam: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m3">
    <LoaGoc daLan />
    <ODat ten="o-nut-de" c={0} r={1} />
    <Cua c={3} r={2} mo={(g) => g >= 75} />
    {[1, 2, 3, 4].map((r) => <ODat key={r} ten="o-ho" c={2} r={r} />)}
    <ODat ten="o-dich" c={3} r={4} />
    <Xe anh="r2" moc={R2_G9K} doi={[[76, 'r2-vui']]} />
    <Vat ten="vat-thung-nang" moc={[[0, 0, 3], [20, 0, 3], [75, 0, 1]]} />
    <Xe anh="nhen-tu" moc={R1_G9K} doi={[[120, 'nhen-tu-n'], [156, 'nhen-tu-vui']]} />
    <Vat ten="vat-khoi-sat" moc={[[0, 3, 1], [120, 3, 1], [156, 3, 4]]} bam={{moc: R1_G9K, tu: 121, den: 155, goc: -90, xa: 0.68}} />
    <Burst at={156} x={tamO(3, 4).x} y={tamO(3, 4).y} color={C.yellow} />
    <DongHoBai con="20 phút" />
  </NenHienTruong>
);

/* ================================================================== GÓI 10 · Xuất xưởng Robot phân loại R1 */
const G10Mo: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m3">
    {[1, 2, 3].map((r) => <ODat key={r} ten="o-ho" c={1} r={r} />)}
    {[2, 3, 4].map((c) => <ODat key={c} ten="o-bang" c={c} r={2} />)}
    <ODat ten="o-dem-tu-n" c={3} r={1} />
    <Vat ten="vat-khoi-sat" moc={[[0, 2, 3]]} />
    <Vat ten="vat-nam-cham-n" moc={[[0, 3, 1]]} />
    <Xe anh="nhen-tu" moc={[[0, 0, 4.5, 0]]} />
    <DongHoBai con="15 phút" gap />
    <NhanGoi so={10} ten="Xuất xưởng" />
    <Sau dang="sau-sot-ruot" says={[{at: 10, out: 145, text: 'Xe thu mua tới đầu ngõ rồi, còn mẻ lớn cuối cùng này thôi!'}]} />
  </NenHienTruong>
);
const ThaTayM3: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#EEF2FF', fontFamily: FONT}}>
      <Img src={staticFile('nen-doc/trong-xe.jpg')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(15,23,42,0.82) 0%, rgba(15,23,42,0.25) 45%, rgba(15,23,42,0.85) 100%)'}} />
      <CodeBox lines={['if front_pole() == "N":', '    magnet_s()', 'else: magnet_n()']} x={150} y={80} w={780} size={36} hl={1} title="phan_loai_tu_dong.py" />
      <div style={{position: 'absolute', left: 540 - 310, top: 820 - 310, width: 620, height: 620, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(34,197,94,0.36) 0%, rgba(56,189,248,0.18) 55%, transparent 72%)',
        border: '5px dashed #FDE047', transform: `rotate(${f * 0.7}deg)`}} />
      <div style={{position: 'absolute', left: 540 - 280, top: 820 - 280, width: 560, height: 560}}>
        <Img src={staticFile('robot/m3/nhen-tu-vui.png')} style={{width: '100%', height: '100%', filter: 'drop-shadow(0 18px 28px rgba(0,0,0,0.5))'}} />
      </div>
      <Sola says={[{at: 10, out: 72, text: 'Code tự động đọc cực từ xong rồi! R1 tự dọn sạch cả bãi cho bác Sơn xem!'}]} mat={[[0, 'confident'], [65, 'proud']]} x={260} />
      <Luna says={[{at: 78, out: 155, text: 'Chiến thần 6 chân nhện xuất kích!'}]} mat={[[0, 'surprised'], [78, 'excited']]} x={820} />
    </AbsoluteFill>
  );
};
const R_G10A: Moc[] = [[0, 0, 3.68, 0], [25, 0, 3.68, 0], [55, 2, 3.68, 0], [80, 2, 3.68, 0], [125, 2, 4.68, 0]];
const G10NhayDo: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m3">
    {[1, 2, 3, 4].map((r) => <ODat key={r} ten="o-ho" c={1} r={r} />)}
    <ODat ten="o-dich" c={2} r={4} />
    <Xe anh="nhen-tu" moc={R_G10A} doi={[[15, 'nhen-co'], [58, 'nhen-tu-n'], [128, 'nhen-tu-vui']]} />
    <Vat ten="vat-khoi-sat" moc={[[0, 2, 3], [58, 2, 3], [128, 2, 4]]} bam={{moc: R_G10A, tu: 59, den: 127, goc: -90, xa: 0.68}} />
    <ChuNay chu="VÙ!" at={30} den={60} x={tamO(1, 3).x} y={tamO(1, 3).y - 50} mau={C.good} />
    <DongHoBai con="10 phút" gap />
    <NhanGoi so={10} ten="Vượt rãnh & dò sắt" />
  </NenHienTruong>
);
const R_G10B: Moc[] = [[0, 3, 3.8, 0], [40, 3, 2.68, 0], [95, 3, 2.68, 0], [145, 3, 4.68, 0]];
const G10DaoCuc: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m3">
    <ODat ten="o-dem-tu-n" c={3} r={2} />
    <ODat ten="o-dich" c={3} r={4} />
    <ChuNay chu="!" at={42} den={72} x={tamO(3, 2).x + 120} y={tamO(3, 2).y - 50} mau={C.bad} />
    <Xe anh="nhen-tu-n" moc={R_G10B} doi={[[42, 'nhen-tu-do'], [68, 'nhen-tu-s'], [148, 'nhen-tu-vui']]} />
    <Vat ten="vat-nam-cham-n" moc={[[0, 3, 2], [68, 3, 2], [148, 3, 4]]} bam={{moc: R_G10B, tu: 69, den: 147, goc: -90, xa: 0.68}} />
    <Burst at={148} x={tamO(3, 4).x} y={tamO(3, 4).y} color={C.yellow} />
    <DongHoBai con="Đúng giờ!" />
    <NhanGoi so={10} ten="Tự động đảo cực" />
  </NenHienTruong>
);
const XuatXuongM3: React.FC = () => {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  const tem = pop(f, 60, fps, 8);
  const PART = ['Thân sáu chân nhện · Bật nhảy', 'Tay nam châm điện · Đảo cực N/S', 'Cảm biến từ · Dò sắt & đọc cực'];
  return (
    <Shake hits={[62]} amp={14}>
      <AbsoluteFill style={{background: '#14532D', fontFamily: FONT, backgroundImage: 'linear-gradient(rgba(255,255,255,.08) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,.08) 2px, transparent 2px)', backgroundSize: '60px 60px'}}>
        <div style={{position: 'absolute', top: 170, left: 0, right: 0, textAlign: 'center', color: '#fff', fontWeight: 900, fontSize: 72}}>Robot phân loại R1</div>
        <div style={{position: 'absolute', left: 540 - 440, top: 260, width: 880, height: 880, transform: `scale(${1 + 0.02 * Math.sin(f / 10)})`}}>
          <Img src={staticFile('robot/m3/nhen-tu-vui.png')} style={{width: 880, height: 880}} />
        </div>
        {PART.map((p, i) => (
          <div key={p} style={{position: 'absolute', left: 110, right: 110, top: 1150 + i * 110, opacity: ease(f, [10 + i * 10, 22 + i * 10], [0, 1]), padding: '18px 28px', borderRadius: 20,
            background: 'rgba(255,255,255,.14)', border: '3px solid rgba(255,255,255,.5)', color: '#fff', fontWeight: 800, fontSize: 38, display: 'flex', gap: 18, alignItems: 'center'}}>
            <Icon name="CircleCheck" size={44} color={C.yellow} />{p}
          </div>
        ))}
        {f >= 54 ? (
          <div style={{position: 'absolute', left: 540, top: 760, transform: `translate(-50%, -50%) rotate(-14deg) scale(${2.4 - 1.4 * tem})`, opacity: Math.min(1, tem * 2),
            padding: '18px 44px', border: `12px solid ${C.yellow}`, borderRadius: 24, color: C.yellow, fontWeight: 900, fontSize: 110, letterSpacing: '0.06em', background: 'rgba(27,24,56,.92)', whiteSpace: 'nowrap'}}>XUẤT XƯỞNG</div>
        ) : null}
        <div style={{position: 'absolute', left: 80, right: 80, top: 1520, textAlign: 'center', color: '#DCFCE7', fontWeight: 700, fontSize: 40, lineHeight: 1.35, opacity: ease(f, [100, 120], [0, 1])}}>
          Thân nhện nam châm ở lại bãi tái chế giúp bác Sơn.<br />Bộ não R1 về xe trạm, lên đường tiếp.
        </div>
      </AbsoluteFill>
    </Shake>
  );
};
const NgoaiDoiM3: React.FC = () => {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  const THE = [
    {icon: 'Magnet' as const, ten: 'Cần Cẩu Nam Châm Điện Phế Liệu', mo: 'Đóng dòng điện để hút hàng tấn sắt thép vụn, ngắt hoặc đảo dòng để nhả hàng tức thì.'},
    {icon: 'Bot' as const, ten: 'Robot Sáu Chân Địa Hình (Hexapod)', mo: 'Bước ngang, xoay tại chỗ và vượt địa hình gồ ghề nơi bánh xe thông thường bị kẹt.'},
  ];
  return (
    <NenHienTruong anh={NEN} mua="m3" luoi={false} toi={0.58}>
      <div style={{position: 'absolute', left: 40, top: 120, right: 40, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 48, color: C.yellow, textShadow: `0 6px 0 ${C.ink}`}}>
        CÔNG NGHỆ NGOÀI ĐỜI THỰC · M3
      </div>

      {/* Hero Showcase: Robot R1 của mùa -> Công nghệ thực tế (top: 210 .. 490) */}
      <div style={{position: 'absolute', left: 50, right: 50, top: 210, height: 275, borderRadius: 32,
        background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', border: `6px solid ${C.ink}`,
        boxShadow: `0 14px 0 ${C.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 34px',
        transform: `scale(${pop(f, 6, fps)})`, boxSizing: 'border-box'}}>
        <div style={{width: 225, height: 225, borderRadius: 28, background: 'rgba(255,255,255,0.08)', border: `4px solid ${C.yellow}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
          <Img src={staticFile('robot/m3/nhen-tu-vui.png')} style={{width: 200, height: 200, objectFit: 'contain'}} />
        </div>
        <div style={{flex: 1, marginLeft: 28, fontFamily: FONT, color: '#fff'}}>
          <div style={{display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 99, background: '#16A34A',
            border: '3px solid #fff', fontSize: 22, fontWeight: 900, marginBottom: 10}}>
            TỪ SA BÀN CLB RA THỰC TẾ
          </div>
          <div style={{fontSize: 38, fontWeight: 900, color: '#FDE047', marginBottom: 6}}>Robot Nhện Nam Châm R1</div>
          <div style={{fontSize: 26, fontWeight: 700, color: '#E2E8F0', lineHeight: 1.3}}>Bước ngang 4 hướng, bật nhảy qua rãnh và đảo cực nam châm điện N/S.</div>
        </div>
      </div>

      {THE.map((t, i) => (
        <div key={t.ten} style={{position: 'absolute', left: 50, right: 50, top: 515 + i * 325, height: 295, padding: '28px 34px', borderRadius: 30, background: '#fff',
          border: `6px solid ${C.ink}`, boxShadow: `0 14px 0 ${C.ink}`, display: 'flex', gap: 28, alignItems: 'center',
          transform: `scale(${pop(f, 12 + i * 16, fps)})`, boxSizing: 'border-box'}}>
          <div style={{width: 150, height: 150, borderRadius: 28, background: '#16A34A', border: `5px solid ${C.ink}`,
            boxShadow: `0 8px 0 ${C.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
            <Icon name={t.icon} size={84} color="#fff" />
          </div>
          <div style={{fontFamily: FONT, color: C.ink, flex: 1}}>
            <div style={{fontWeight: 900, fontSize: 38, marginBottom: 10, lineHeight: 1.2}}>{t.ten}</div>
            <div style={{fontWeight: 800, fontSize: 28, color: '#334155', lineHeight: 1.34}}>{t.mo}</div>
          </div>
        </div>
      ))}
      <Luna mat={[[0, 'happy']]} says={[{at: 14, out: 142, text: 'Nam châm điện kết hợp cảm biến từ trường giúp phân loại kim loại cực nhanh mà không cần chạm tay!'}]} />
    </NenHienTruong>
  );
};
const NhaMua4: React.FC = () => {
  const f = useCurrentFrame();
  const xXe = ease(f, [0, 120], [40, 120]);
  return (
    <AbsoluteFill style={{background: '#0C4A6E', fontFamily: FONT, overflow: 'hidden'}}>
      <Img src={staticFile('nen-doc/mua-song.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.92}} />
      <AbsoluteFill style={{background: 'rgba(15,23,42,0.32)'}} />

      <div style={{position: 'absolute', left: 45, right: 45, top: 80, padding: '20px 28px', borderRadius: 26,
        background: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)', border: `5px solid #FDE047`,
        boxShadow: `0 10px 0 ${C.ink}`, textAlign: 'center', color: '#FDE047', fontWeight: 900, fontSize: 38}}>
        CHUYỂN TRẠM CHIẾN DỊCH · RA BẾN SÔNG MÙA 4!
      </div>

      <div style={{position: 'absolute', left: 45, right: 45, top: 230, height: 590, borderRadius: 36,
        background: 'linear-gradient(180deg, rgba(15,23,42,0.92) 0%, rgba(12,74,110,0.92) 100%)',
        border: `6px solid ${C.ink}`, boxShadow: `0 16px 0 ${C.ink}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around', padding: '28px 34px', boxSizing: 'border-box'}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-around', width: '100%'}}>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, transform: `translateX(${xXe * 0.25}px)`}}>
            <Img src={staticFile('robot/xe-tram-a.png')} style={{width: 320, height: 270, objectFit: 'contain'}} />
            <span style={{padding: '8px 22px', borderRadius: 14, background: '#38BDF8', color: C.ink, fontWeight: 900, fontSize: 23, border: `3.5px solid ${C.ink}`}}>
              CHỞ PHAO SẮT RA BẾN SÔNG
            </span>
          </div>
          <div style={{width: 280, height: 280, borderRadius: 32, background: '#BAE6FD', border: `6px solid #38BDF8`,
            boxShadow: `0 10px 0 ${C.ink}`, overflow: 'hidden'}}>
            <Img src={staticFile('nguoi/ba-hoang.png')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 10%'}} />
          </div>
        </div>
        <div style={{padding: '14px 28px', borderRadius: 20, background: '#0284C7', color: '#fff', fontWeight: 900, fontSize: 30,
          border: '3.5px solid #fff', display: 'flex', alignItems: 'center', gap: 14}}>
          <Icon name="Waves" size={36} color="#FDE047" />
          <span>TRẠM THỦY LỢI BÁC BÌNH ĐANG BỊ LỤC BÌNH CHẶN CỐNG!</span>
        </div>
      </div>

      <div style={{position: 'absolute', left: 45, right: 45, top: 870, opacity: ease(f, [15, 35], [0, 1]),
        background: '#E0F2FE', borderRadius: 34, border: `6px solid ${C.ink}`, boxShadow: `0 16px 0 ${C.ink}`, padding: '32px 36px', display: 'flex', gap: 26, alignItems: 'center'}}>
        <div style={{width: 120, height: 120, borderRadius: 26, background: '#0284C7', border: `4px solid ${C.ink}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
          <Icon name="Anchor" size={72} color="#fff" />
        </div>
        <div>
          <div style={{fontSize: 24, fontWeight: 900, color: '#0369A1', marginBottom: 6}}>ĐIỂM ĐẾN TIẾP THEO · MÙA 4</div>
          <div style={{fontSize: 38, fontWeight: 900, color: C.ink, lineHeight: 1.28}}>
            Bến sông bác Bình · Độ Tàu thủy lợi R1 khơi thông dòng chảy trước giờ triều cường!
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== danh sách phim */
const mo = (so: number, canh: Phim['canh']): Phim => ({id: `M3G${so}-Mo`, doc: true, canh});
const ket = (so: number, canh: Phim['canh']): Phim => ({id: `M3G${so}-Ket`, doc: true, canh});
const tt = (so: number, ten: string, con: string, loi: string, muc: [number, number, number], xoa?: number) => ({
  id: 'thanh-tuu', dur: 170, el: <ThanhTuu moi={so - 1} loi={loi} con={con} so={so} ten={ten} muc={muc} xoa={xoa} />,
  sfx: [[22, xoa !== undefined ? 'wrong.wav' : 'ding.wav', 0.5]] as any,
});
const xe = (anh: string, luna: string, sola: string, tenPart: string, cach = 120) => ({
  id: 'trong-xe', dur: cach + 70,
  el: <TrongXe mua="m3" anh={anh} cach={cach} tenPart={tenPart} luna={[{at: 10, out: 70, text: luna}]} sola={[{at: 76, out: cach - 4, text: sola}]}
    lunaMat={[[0, 'thinking'], [76, 'happy']]} solaMat={[[0, 'thinking'], [76, 'confident']]} />,
  sfx: [[cach, 'impact.wav', 0.5], [cach, 'ding.wav', 0.4]] as any,
});
const treo = (anh: string, cau: string, so: number, ten: string) => ({
  id: 'cau-treo', dur: 110, el: <CauTreo mua="m3" xoay={0} anh={anh} cau={cau} so={so} ten={ten} />, sfx: [W_IN, [40, 'pop.wav', 0.4]] as any,
});

export const PHIM_M3: Phim[] = [
  mo(1, [
    {id: 'hien-truong', dur: 180, el: <G1Mo />, sfx: [W_IN, [58, 'impact.wav', 0.5]]},
    xe('nhen', 'Không đủ chỗ xoay đầu thì làm sao bước thẳng sang ngang?', 'Thay sáu chân nhện — bước bốn hướng khỏi cần quay đầu!', 'Thân sáu chân nhện', 120),
    treo('nhen', 'Bước thẳng bốn hướng trên sa bàn nào!', 1, 'Chân nhện'),
  ]),
  ket(1, [{id: 'lam', dur: 155, el: <G1Lam />, sfx: [[136, 'ding.wav', 0.5]]}, tt(1, 'Chân nhện', '5 giờ 30', 'Bò ngang qua khe hẹp gọn ghê!', [15, 10, 10])]),
  mo(2, [
    {id: 'thu', dur: 235, el: <G2Thu />, sfx: [[75, 'wrong.wav', 0.5]]},
    xe('nhen-nc', 'Nó bằng sắt đấy — cái gì hút được sắt mà không cần kẹp?', 'Gắn tay nam châm điện — bật lên là hút chặt tấm sắt!', 'Tay nam châm điện', 125),
    treo('nhen-nc', 'Bật nam châm hút sắt về thùng nào!', 2, 'Nam châm'),
  ]),
  ket(2, [{id: 'lam', dur: 165, el: <G2Lam />, sfx: [[52, 'click.wav', 0.6], [143, 'ding.wav', 0.5]]}, tt(2, 'Nam châm', '4 giờ 40', 'Hút một phát lên luôn, khỏi cần mó tay!', [35, 15, 15])]),
  mo(3, [
    {id: 'thu', dur: 240, el: <G3Thu />, sfx: [[72, 'wrong.wav', 0.5]]},
    xe('nhen-tu', 'Có cách nào biết đống nào có sắt trước khi bật nam châm không?', 'Gắn cảm biến từ — lại gần sắt là báo hiệu ngay!', 'Cảm biến từ', 125),
    treo('nhen-tu', 'Dò xem kiện nào có sắt rồi mới hút nhé!', 3, 'Cảm biến từ'),
  ]),
  ket(3, [{id: 'lam', dur: 170, el: <G3Lam />, sfx: [[84, 'pop.wav', 0.4], [150, 'ding.wav', 0.5]]}, tt(3, 'Cảm biến từ', '4 giờ', 'Nhìn xuyên cả bạt để tìm sắt, hay thật!', [48, 35, 25])]),
  mo(4, [
    {id: 'thu', dur: 250, el: <G4Thu />, sfx: [[100, 'impact.wav', 0.5]]},
    {id: 'nghi', dur: 180, el: <G4Nghi />, sfx: [[20, 'pop.wav', 0.3], [88, 'pop.wav', 0.3]]},
    treo('nhen-tu', 'Quét sạch cả ba hàng thật gọn nào!', 4, 'Quét bãi'),
  ]),
  ket(4, [{id: 'lam', dur: 165, el: <G4Lam />, sfx: [[148, 'ding.wav', 0.5]]}, tt(4, 'Quét bãi', '3 giờ 20', 'Đi chữ Z quét sạch sành sanh, không sót món nào!', [60, 50, 40])]),
  mo(5, [
    {id: 'thu', dur: 230, el: <G5Thu />, sfx: [[68, 'wrong.wav', 0.5]]},
    xe('nhen-co', 'Chân nhện có khớp gấp, nén mạnh rồi bung ra thì sao?', 'Lắp lò xo gập chân — co sáu chân bật nhảy qua rãnh!', 'Lò xo bật nhảy', 125),
    treo('nhen-tu', 'Co chân bật nhảy qua rãnh nào!', 5, 'Bật nhảy'),
  ]),
  ket(5, [{id: 'lam', dur: 160, el: <G5Lam />, sfx: [[32, 'swish.wav', 0.5], [142, 'ding.wav', 0.5]]}, tt(5, 'Bật nhảy', '2 giờ 40', 'Nhảy qua rãnh nhẹ như cào cào ấy nhỉ!', [72, 60, 55])]),
  mo(6, [
    {id: 'thu', dur: 250, el: <G6Thu />, sfx: [[68, 'impact.wav', 0.7]]},
    xe('nhen-tu-s', 'Cùng cực Đỏ đẩy nhau, còn khác cực Đỏ với Xanh thì sao?', 'Đảo dòng điện đổi cực — khác cực hút vào, cùng cực đẩy ra!', 'Công tắc đảo cực N / S', 125),
    treo('nhen-tu-s', 'Nhìn màu cực rồi chọn hút hay đẩy nhé!', 6, 'Đảo cực'),
  ]),
  ket(6, [{id: 'lam', dur: 160, el: <G6Lam />, sfx: [[32, 'click.wav', 0.5], [142, 'ding.wav', 0.4]]}, tt(6, 'Đảo cực', '2 giờ', 'Trời đất, đống mô-tơ nam châm sạt xuống lẫn lộn hết cực rồi!', [75, 65, 30], 4)]),
  mo(7, [
    {id: 'thu', dur: 240, el: <G7Thu />, sfx: [[60, 'impact.wav', 0.6]]},
    {id: 'nghi', dur: 180, el: <G7Nghi />, sfx: [[20, 'pop.wav', 0.3], [88, 'pop.wav', 0.3]]},
    treo('nhen-tu-do', 'Đọc cực trước rồi mới bật nam châm nhé!', 7, 'Đọc cực từ'),
  ]),
  ket(7, [{id: 'lam', dur: 160, el: <G7Lam />, sfx: [[66, 'ding.wav', 0.4], [141, 'ding.wav', 0.5]]}, tt(7, 'Đọc cực từ', '1 giờ 20', 'Đoán trúng phóc từng cực, không trượt phát nào!', [82, 75, 75])]),
  mo(8, [
    {id: 'thu', dur: 240, el: <G8Thu />, sfx: [[65, 'wrong.wav', 0.5]]},
    {id: 'nghi', dur: 180, el: <G8Nghi />, sfx: [[20, 'pop.wav', 0.3], [88, 'pop.wav', 0.3]]},
    treo('nhen-tu', 'Phối hợp băng chuyền với nam châm nào!', 8, 'Băng chuyền cũ'),
  ]),
  ket(8, [{id: 'lam', dur: 165, el: <G8Lam />, sfx: [[86, 'click.wav', 0.5], [148, 'ding.wav', 0.5]]}, tt(8, 'Băng chuyền cũ', '45 phút', 'Mớ máy cũ của cô Hạnh biến thành thép tốt hết rồi!', [90, 85, 85])]),
  mo(9, [
    {id: 'thu', dur: 230, el: <G9Thu />, sfx: [[72, 'impact.wav', 0.6]]},
    xe('r2', 'Ai khoẻ nhất trong việc ủi vật nặng ở mùa trước nhỉ?', 'Lắp R2 bánh xích ủi bê-tông mở cổng, R1 nhện nhảy qua rãnh!', 'R2 bánh xích · Lưỡi ủi', 120),
    treo('nhen-tu', 'Bánh xích ủi đường, chân nhện vượt rãnh!', 9, 'R2 bánh xích'),
  ]),
  ket(9, [{id: 'lam', dur: 170, el: <G9Lam />, sfx: [[75, 'click.wav', 0.5], [156, 'ding.wav', 0.5]]}, tt(9, 'R2 bánh xích', '20 phút', 'Một đứa ủi khoẻ, một đứa leo khéo — cặp đôi hoàn hảo!', [95, 92, 92])]),
  mo(10, [
    {id: 'hien-truong', dur: 155, el: <G10Mo />, sfx: [W_IN]},
    {id: 'tha-tay', dur: 160, el: <ThaTayM3 />, sfx: [[70, 'riser.wav', 0.4]]},
  ]),
  ket(10, [
    {id: 'nhay-do', dur: 145, el: <G10NhayDo />, sfx: [[30, 'swish.wav', 0.5], [128, 'ding.wav', 0.4]]},
    {id: 'dao-cuc', dur: 165, el: <G10DaoCuc />, sfx: [[42, 'wrong.wav', 0.4], [148, 'ding.wav', 0.5]]},
    tt(10, 'Xuất xưởng', 'Đúng giờ!', 'Sạch bong từng món, kịp giờ xe chở đi tái chế rồi!', [100, 100, 100]),
    {id: 'xuat-xuong', dur: 180, el: <XuatXuongM3 />, sfx: [[60, 'impact.wav', 0.8], [62, 'ding.wav', 0.5]]},
    {id: 'ngoai-doi', dur: 150, el: <NgoaiDoiM3 />, sfx: [W_IN]},
    {id: 'nha', dur: 150, el: <NhaMua4 />, sfx: [[25, 'whoosh-soft.wav', 0.4]]},
  ]),
];
