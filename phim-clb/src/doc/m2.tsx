// 10 phim gói mùa 2 "Nhà máy", khổ dọc, theo hoc/KICH-BAN-PHIM-GOI-CLB.md bản 2 mục 3:
// mỗi gói hai phim: M2G<n>-Mo (phim mở) và M2G<n>-Ket (đoạn kết sau màn trùm).
import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Burst, C, CLAMP, CodeBox, FONT, Icon, Mascot, MONO, Say, Shake, ease, pop} from '../d10';
import {Phim, W_IN} from '../may-phim';
import {CANH_LAB_BANH_XICH, CANH_LAB_HONG_NGOAI, CANH_LAB_VOI_PHUN} from '../PhimMua2Lab';
import {BangViec, CauTreo, ChuNay, Moc, NenHienTruong, NhanGoi, Nguoi, O, ODat, TrongXe, Vat, Xe, chonDangNguoi, tamO, theoMoc} from './kit-doc';

const NEN = 'nen-doc/mua-2.png';
const DON = [
  'Vượt băng chuyền vào xưởng', 'Đóng van qua rãnh nóng', 'Dò ống quá nhiệt', 'Canh nhịp băng chuyền', 'Ủi kiện sắt mở buồng van',
  'Mở van kẹt phòng vật tư', 'Dập ổ nhiệt trong khói', 'Tiếp nhận van kho chú Tùng', 'R2 giữ băng chuyền', 'Hạ áp toàn nhà máy',
];

/** Cô Hạnh kỹ sư trưởng nhà máy hơi nước (ảnh TopView tách nền). */
const Hanh: React.FC<{says: Say[]; at?: number; x?: number; side?: 'left' | 'right'; dang?: string}> = ({says, at = 0, x = 820, side = 'left', dang = 'hanh-nghi'}) => (
  <Nguoi anh={dang} ten="CÔ HẠNH" mau="#0284C7" x={x} h={600} at={at} says={says} side={side} bubbleW={560} bubbleTop={1230} />
);
const Sola: React.FC<{says: Say[]; mat: [number, string][]; at?: number; x?: number}> = ({says, mat, at = 0, x = 240}) => (
  <Mascot who="sola" x={x} h={540} at={at} faces={mat} says={says} bubbleW={520} bubbleTop={1240} />
);
const Luna: React.FC<{says: Say[]; mat: [number, string][]; at?: number; x?: number}> = ({says, mat, at = 0, x = 840}) => (
  <Mascot who="luna" x={x} h={540} at={at} faces={mat} says={says} side="left" bubbleW={520} bubbleTop={1240} lat />
);

/** Đồng hồ áp suất hơi nước góc trên trái: kim nhích dần về vạch đỏ (0..100%). */
const DongHoApSuat: React.FC<{tu: number; den?: number; dai?: number; gap?: boolean}> = ({tu, den = tu, dai = 240, gap}) => {
  const f = useCurrentFrame();
  const p = Math.round(interpolate(f, [0, dai], [tu, den], CLAMP));
  const goc = -90 + (p / 100) * 180;
  const nhay = (gap || p >= 85) && Math.floor(f / 10) % 2 === 0;
  const mau = p >= 80 ? C.bad : p >= 60 ? C.warn : C.good;
  return (
    <div style={{position: 'absolute', left: 36, top: 44, display: 'flex', alignItems: 'center', gap: 16, padding: '12px 24px', borderRadius: 999,
      background: nhay ? C.bad : '#fff', color: nhay ? '#fff' : C.ink, border: `4px solid ${C.ink}`, boxShadow: `0 8px 0 ${C.ink}`, fontFamily: MONO, fontWeight: 800, fontSize: 40}}>
      <div style={{position: 'relative', width: 56, height: 34, borderRadius: '56px 56px 0 0', background: '#F1F5F9', border: `4px solid ${C.ink}`, overflow: 'hidden'}}>
        <div style={{position: 'absolute', right: 0, top: 0, width: 20, height: 34, background: 'rgba(239,68,68,.35)'}} />
        <div style={{position: 'absolute', left: '50%', bottom: 0, width: 6, height: 26, borderRadius: 4, background: mau,
          transformOrigin: '50% 100%', transform: `translateX(-50%) rotate(${goc}deg)`}} />
      </div>
      <span>{p}%</span>
    </div>
  );
};

/** Thanh trạng thái 3 phân xưởng trên bảng thành tựu: đèn sáng xanh khi hoàn thành, tắt đỏ khi gặp bước lùi. */
const XuongBar: React.FC<{sang: [boolean, boolean, boolean]}> = ({sang}) => (
  <div style={{position: 'absolute', left: 90, top: 155, width: 900, display: 'flex', gap: 18}}>
    {['Phân xưởng 1', 'Phân xưởng 2', 'Phân xưởng 3'].map((t, i) => (
      <div key={t} style={{flex: 1, padding: '14px 18px', borderRadius: 20, background: sang[i] ? '#DCFCE7' : '#1E293B',
        border: `4px solid ${C.ink}`, boxShadow: `0 8px 0 ${C.ink}`, display: 'flex', alignItems: 'center', gap: 12, fontFamily: FONT, fontWeight: 800, fontSize: 28,
        color: sang[i] ? '#166534' : '#94A3B8'}}>
        <Icon name={sang[i] ? 'Zap' : 'AlertTriangle'} size={32} color={sang[i] ? '#16A34A' : '#F59E0B'} />{t}
      </div>
    ))}
  </div>
);

/** Đoạn kết chung mùa 2: sơ đồ 3 phân xưởng + bảng tiến độ + đồng hồ áp suất + cô Hạnh. */
const ThanhTuu: React.FC<{moi: number; loi: string; ap: number; apDen?: number; so: number; ten: string; xoa?: number; xuong: [boolean, boolean, boolean]}> =
  ({moi, loi, ap, apDen, so, ten, xoa, xuong}) => (
    <NenHienTruong anh={NEN} mua="m2" luoi={false} toi={0.52}>
      <XuongBar sang={xuong} />
      <BangViec tieuDe="Nhật ký cứu hộ nhà máy hơi nước" dong={DON} xong={moi} moi={moi} xoa={xoa} at={22} y={265} />
      <DongHoApSuat tu={ap} den={apDen ?? ap} gap={xoa !== undefined} />
      <NhanGoi so={so} ten={ten} />
      <Hanh dang={chonDangNguoi('hanh', so, xoa)} says={[{at: 48, out: 200, text: loi}]} at={28} />
    </NenHienTruong>
  );

/** Đốm lửa âm ỉ gieo từ gói 1 ở góc khuất (4, 0) sau hàng rào. */
const LuaGoc: React.FC<{to?: boolean; tat?: boolean}> = ({to, tat}) => (
  <>
    <ODat ten="o-rao" c={3} r={0} />
    <ODat ten="o-rao" c={4} r={1} />
    <ODat ten={tat ? 'o-lua-tat' : to ? 'o-lua' : 'o-lua-nho'} c={4} r={0} />
  </>
);

/** Vệt dầu loang trên sàn. */
const VetDau: React.FC<{c: number; r: number; w?: number; h?: number}> = ({c, r, w = 1, h = 1}) => {
  const p = tamO(c, r);
  return <div style={{position: 'absolute', left: p.x - O * 0.48, top: p.y - O * 0.48, width: O * (w - 0.04), height: O * (h - 0.04), borderRadius: 48,
    background: 'radial-gradient(ellipse at 40% 40%, rgba(15,23,42,.78) 0%, rgba(30,41,59,.88) 65%, rgba(51,65,85,.2) 100%)',
    border: '3px solid rgba(148,163,184,.35)'}} />;
};

/** Rãnh nước nóng bốc hơi cắt ngang sàn. */
const RanhNong: React.FC<{r: number}> = ({r}) => {
  const p = tamO(0, r);
  return <div style={{position: 'absolute', left: p.x - O / 2, top: p.y - O * 0.38, width: 5 * O, height: O * 0.76,
    background: 'linear-gradient(180deg, #7C2D12 0%, #EA580C 50%, #7C2D12 100%)', borderTop: '5px solid #FDBA74', borderBottom: '5px solid #FDBA74',
    boxShadow: '0 0 24px rgba(249,115,22,.65)'}} />;
};

/** Tia nước phun từ mũi robot tới ô đích. */
const TiaNuoc: React.FC<{tu: {x: number; y: number}; den: {x: number; y: number}; manh?: boolean}> = ({tu, den, manh}) => {
  const dx = den.x - tu.x, dy = den.y - tu.y, dai = Math.hypot(dx, dy), g = (Math.atan2(dy, dx) * 180) / Math.PI;
  return (
    <>
      <div style={{position: 'absolute', left: tu.x, top: tu.y - (manh ? 14 : 9), width: dai, height: manh ? 28 : 18, borderRadius: 99,
        background: manh ? 'linear-gradient(90deg, #38BDF8, #0284C7, #E0F2FE)' : 'linear-gradient(90deg, #7DD3FC, #38BDF8)',
        transform: `rotate(${g}deg)`, transformOrigin: '0 50%', boxShadow: '0 0 22px #38BDF8'}} />
      <Img src={staticFile('robot/m2/vat-bong.png')} style={{position: 'absolute', left: den.x - 56, top: den.y - 56, width: 112, height: 112}} />
    </>
  );
};

/** Quầng nóng đỏ trên ống / van đang quá nhiệt. */
const QuangNong: React.FC<{c: number; r: number; mo?: number}> = ({c, r, mo = 1}) => {
  const f = useCurrentFrame(), p = tamO(c, r), k = 1 + 0.08 * Math.sin(f / 5);
  return <div style={{position: 'absolute', left: p.x - O * 0.65, top: p.y - O * 0.65, width: O * 1.3, height: O * 1.3, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(239,68,68,.65) 0%, rgba(249,115,22,.35) 55%, transparent 75%)',
    transform: `scale(${k})`, opacity: mo}} />;
};

/** Cửa sắt nhà máy: mở = mờ đi. */
const Cua: React.FC<{c: number; r: number; mo: (f: number) => boolean}> = ({c, r, mo}) => {
  const f = useCurrentFrame();
  return <ODat ten="o-cua" c={c} r={r} mo={mo(f) ? 0.15 : 1} />;
};

/* ================================================================== GÓI 1 · Bánh xích */
const R_G1M: Moc[] = [[0, 1, 5.2, -90], [18, 1, 5.2, -90], [55, 1, 3, -90], [72, 1, 3, -90], [118, 3.6, 3, -45]];
const G1Mo: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m2">
    <LuaGoc />
    {[0, 1, 2, 3, 4].map((c) => <ODat key={`b3-${c}`} ten="o-bang" c={c} r={3} />)}
    {[1, 2, 3, 4].map((c) => <ODat key={`b2-${c}`} ten="o-bang" c={c} r={2} />)}
    <ODat ten="o-nut-ban" c={1} r={1} />
    <Xe anh="r1-banh" moc={R_G1M} doi={[[68, 'r1-banh-ngac']]} />
    <ChuNay chu="BỊ BĂNG CHUYỀN ĐẨY!" at={68} den={145} x={540} y={tamO(2, 3).y - 60} mau={C.bad} co={42} />
    <DongHoApSuat tu={52} den={56} />
    <NhanGoi so={1} ten="Bánh xích" />
    <Sola says={[{at: 8, out: 62, text: 'Tớ cho xe hai bánh chạy qua băng chuyền vào xưởng nha!'}]} mat={[[0, 'confident'], [68, 'shocked']]} />
    <Hanh says={[{at: 72, out: 175, text: 'Nhà máy nhiều băng chuyền chạy liên tục, xe hai bánh thường đứng lên là bị đẩy trôi ngay!'}]} at={60} />
  </NenHienTruong>
);
const R_G1K: Moc[] = [[0, 1, 5.4, -90], [15, 1, 5.4, -90], [55, 1, 3, -90], [68, 1, 3, 0], [95, 2, 3, 0], [108, 2, 3, -90], [135, 2, 1.7, -90]];
const G1Lam: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m2">
    <LuaGoc />
    {[0, 1, 2, 3, 4].map((c) => <ODat key={`b3-${c}`} ten="o-bang" c={c} r={3} />)}
    {[1, 2, 3, 4].map((c) => <ODat key={`b2-${c}`} ten="o-bang" c={c} r={2} />)}
    <ODat ten="o-dich" c={2} r={1} />
    <Xe anh="xich" moc={R_G1K} doi={[[136, 'xich-vui']]} />
    <Burst at={136} x={tamO(2, 1).x} y={tamO(2, 1).y} color={C.yellow} />
    <DongHoApSuat tu={55} den={50} />
  </NenHienTruong>
);

/* ================================================================== GÓI 2 · Vòi nước */
const R_G2M: Moc[] = [[0, 2, 5.2, -90], [20, 2, 5.2, -90], [75, 2, 3.15, -90], [105, 2, 3.25, -90]];
const G2Thu: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <NenHienTruong anh={NEN} mua="m2">
      <LuaGoc />
      <RanhNong r={2} />
      <QuangNong c={2} r={1} />
      <ODat ten="o-nut-ban" c={2} r={1} />
      <Xe anh="xich" moc={R_G2M} doi={[[80, 'xich-ngac']]} />
      <ChuNay chu="NÓNG!" at={80} den={150} x={tamO(2, 2).x + 150} y={tamO(2, 2).y} />
      <DongHoApSuat tu={58} den={64} />
      <NhanGoi so={2} ten="Vòi nước" />
      <Sola says={[{at: 10, out: 72, text: 'Rãnh nước nóng chặn ngang, không tới gần vặn van được!'}]} mat={[[0, 'worried'], [80, 'shocked']]} />
      {f >= 95 ? <Hanh dang="hanh-sot-ruot" says={[{at: 105, out: 230, text: 'Van kẹt lại nóng bỏng, đứng bên này làm sao đóng?'}]} at={95} /> : null}
    </NenHienTruong>
  );
};
const R_G2K: Moc[] = [[0, 2, 4.5, -90], [15, 2, 4.5, -90], [45, 2, 3.15, -90], [110, 2, 3.15, -90], [140, 2, 4.2, -90]];
const G2Lam: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <NenHienTruong anh={NEN} mua="m2">
      <LuaGoc />
      <RanhNong r={2} />
      {f < 75 ? <QuangNong c={2} r={1} /> : null}
      <ODat ten={f >= 75 ? 'o-nut-ban-mo' : 'o-nut-ban'} c={2} r={1} />
      <ODat ten={f >= 150 ? 'o-nut-ban-mo' : 'o-nut-ban'} c={2} r={5} />
      {f >= 50 && f < 82 ? <TiaNuoc tu={tamO(2, 2.7)} den={tamO(2, 1)} /> : null}
      {f >= 142 && f < 168 ? <TiaNuoc tu={tamO(2, 4.5)} den={tamO(2, 5)} /> : null}
      <Xe anh="xich-voi" moc={R_G2K} doi={[[50, 'xich-voi-phun'], [85, 'xich-voi-vui']]} />
      <ChuNay chu="XÈO!" at={60} den={105} x={tamO(2, 1).x + 140} y={tamO(2, 1).y} mau={C.good} />
      <Burst at={75} x={tamO(2, 1).x} y={tamO(2, 1).y} color={C.yellow} />
      <Burst at={152} x={tamO(2, 5).x} y={tamO(2, 5).y} color={C.yellow} />
      <DongHoApSuat tu={62} den={54} />
    </NenHienTruong>
  );
};

/* ================================================================== GÓI 3 · Mắt hồng ngoại */
const R_G3M: Moc[] = [[0, 0, 3.2, -90], [35, 0, 2.2, -90], [140, 0, 2.2, -90]];
const G3Thu: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <NenHienTruong anh={NEN} mua="m2">
      <LuaGoc />
      <ODat ten="o-nut-ban" c={0} r={1} />
      <ODat ten="o-nut-ban" c={2} r={1} />
      <ODat ten="o-nut-ban" c={4} r={1} />
      {f >= 95 ? <QuangNong c={4} r={1} /> : null}
      {f >= 45 && f < 80 ? <TiaNuoc tu={tamO(0, 1.8)} den={tamO(0, 1)} /> : null}
      <Xe anh="xich-voi" moc={R_G3M} doi={[[45, 'xich-voi-phun'], [95, 'xich-voi-ngac']]} />
      <ChuNay chu="TRẬT!" at={65} den={115} x={tamO(0, 1).x + 110} y={tamO(0, 1).y} mau={C.warn} />
      <ChuNay chu="XÌ!" at={98} den={165} x={tamO(4, 1).x - 90} y={tamO(4, 1).y} />
      <CodeBox lines={['move()', 'spray()']} x={280} y={145} w={460} size={30} title="Sola đoán mò" />
      <DongHoApSuat tu={64} den={72} />
      <Sola says={[{at: 6, out: 58, text: 'Chắc ống đầu tiên nóng, phun đại!'}]} mat={[[0, 'confident'], [95, 'facepalm']]} />
      {f >= 105 ? <Hanh says={[{at: 112, out: 235, text: 'Ống nào nóng có nhìn bằng mắt thường được đâu!'}]} at={105} /> : null}
    </NenHienTruong>
  );
};
const R_G3K: Moc[] = [[0, 0, 2.3, -90], [20, 0, 2.3, 0], [50, 2, 2.3, 0], [82, 4, 2.3, 0], [95, 4, 2.3, -90], [150, 4, 2.3, -90]];
const G3Lam: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <NenHienTruong anh={NEN} mua="m2">
      <LuaGoc />
      <ODat ten="o-nut-ban" c={0} r={1} />
      <ODat ten="o-nut-ban" c={2} r={1} />
      {f >= 85 && f < 130 ? <QuangNong c={4} r={1} /> : null}
      <ODat ten={f >= 130 ? 'o-nut-ban-mo' : 'o-nut-ban'} c={4} r={1} />
      {f >= 102 && f < 135 ? <TiaNuoc tu={tamO(4, 1.9)} den={tamO(4, 1)} /> : null}
      <Xe anh="xich-hn" moc={R_G3K} doi={[[85, 'xich-hn-do'], [102, 'xich-hn-phun'], [135, 'xich-hn-vui']]} />
      <Burst at={132} x={tamO(4, 1).x} y={tamO(4, 1).y} color={C.yellow} />
      <DongHoApSuat tu={70} den={60} />
    </NenHienTruong>
  );
};

/* ================================================================== GÓI 4 · Băng chuyền */
const BANG_4 = [0, 1, 2, 3, 4];
const R_G4M: Moc[] = [[0, 1, 4.3, -90], [20, 1, 4.3, -90], [55, 1, 3, -90], [95, 3, 3, -90], [125, 3, 2, -90]];
const G4Thu: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <NenHienTruong anh={NEN} mua="m2">
      <LuaGoc />
      {BANG_4.map((c) => <ODat key={c} ten="o-bang" c={c} r={3} />)}
      <QuangNong c={1} r={1} />
      <ODat ten="o-nut-ban" c={1} r={1} />
      {f >= 125 && f < 155 ? <TiaNuoc tu={tamO(3, 1.6)} den={tamO(3, 1)} /> : null}
      <Xe anh="xich-hn" moc={R_G4M} doi={[[65, 'xich-hn-ngac']]} />
      <ChuNay chu="TRÔI!" at={68} den={115} x={tamO(2, 3).x} y={tamO(2, 3).y - 70} mau={C.warn} />
      <ChuNay chu="HỤT!" at={130} den={175} x={tamO(3, 1).x + 110} y={tamO(3, 1).y} />
      <CodeBox lines={['move()', 'move()', 'spray()']} x={280} y={145} w={440} size={30} title="Quên tính băng trôi" />
      <DongHoApSuat tu={68} den={75} />
      {f >= 130 ? <Hanh dang="hanh-hoang" says={[{at: 138, out: 250, text: 'Băng chuyền đang chạy, bước lên là trôi lệch ngay!'}]} at={130} /> : null}
    </NenHienTruong>
  );
};
const G4Nghi: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m2" toi={0.4}>
    {BANG_4.map((c) => <ODat key={c} ten="o-bang" c={c} r={3} />)}
    <ODat ten="o-nut-ban" c={3} r={1} />
    <Xe anh="xich-hn" moc={[[0, 1, 4.2, -90]]} />
    <Luna says={[{at: 6, out: 82, text: 'Băng chuyền đẩy R1 đi mấy ô, hướng nào?'}]} mat={[[0, 'thinking']]} />
    <Sola says={[{at: 88, out: 175, text: 'Đứng trên băng chờ nó đưa tới đúng chỗ rồi phun!'}]} mat={[[0, 'thinking'], [88, 'happy']]} />
  </NenHienTruong>
);
const R_G4K: Moc[] = [[0, 1, 4.3, -90], [15, 1, 4.3, -90], [45, 1, 3, -90], [90, 3, 3, -90], [118, 3, 2, -90]];
const G4Lam: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <NenHienTruong anh={NEN} mua="m2">
      <LuaGoc />
      {BANG_4.map((c) => <ODat key={c} ten="o-bang" c={c} r={3} />)}
      {f < 145 ? <QuangNong c={3} r={1} /> : null}
      <ODat ten={f >= 145 ? 'o-nut-ban-mo' : 'o-nut-ban'} c={3} r={1} />
      {f >= 120 && f < 150 ? <TiaNuoc tu={tamO(3, 1.6)} den={tamO(3, 1)} /> : null}
      <Xe anh="xich-hn" moc={R_G4K} doi={[[120, 'xich-hn-phun'], [150, 'xich-hn-vui']]} />
      <Burst at={145} x={tamO(3, 1).x} y={tamO(3, 1).y} color={C.yellow} />
      <DongHoApSuat tu={74} den={62} />
    </NenHienTruong>
  );
};

/* ================================================================== GÓI 5 · Đẩy thùng nặng */
const R_G5M: Moc[] = [[0, 2, 5.2, -90], [20, 2, 5.2, -90], [65, 2, 3.65, -90], [95, 2.35, 3.3, -65]];
const G5Thu: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Shake hits={[68]} amp={10}>
      <NenHienTruong anh={NEN} mua="m2">
        <LuaGoc />
        <ODat ten="o-nut-de" c={2} r={1} />
        <Cua c={4} r={2} mo={() => false} />
        <Vat ten="vat-thung-nang" moc={[[0, 2, 3], [68, 2, 3], [95, 1.85, 2.85]]} nghieng={(g) => ease(g, [68, 95], [0, -18])} />
        <Xe anh="xich-hn" moc={R_G5M} doi={[[68, 'xich-hn-ngac']]} />
        <ChuNay chu="KẸT!" at={68} den={135} x={tamO(2, 3).x + 130} y={tamO(2, 3).y} />
        <DongHoApSuat tu={66} den={72} />
        <NhanGoi so={5} ten="Lưỡi ủi" />
        {f >= 85 ? <Hanh says={[{at: 92, out: 220, text: 'Kiện máy bằng sắt đặc đấy, mũi xe tròn đẩy sao thẳng được!'}]} at={85} /> : null}
      </NenHienTruong>
    </Shake>
  );
};
const R_G5K: Moc[] = [[0, 2, 5.2, -90], [20, 2, 5.2, -90], [50, 2, 3.68, -90], [115, 2, 1.68, -90], [135, 2, 2.3, -90]];
const G5Lam: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m2">
    <LuaGoc />
    <ODat ten="o-nut-de" c={2} r={1} />
    <Cua c={4} r={2} mo={(g) => g >= 115} />
    <Xe anh="du" moc={R_G5K} doi={[[118, 'du-vui']]} />
    <Vat ten="vat-thung-nang" moc={[[0, 2, 3], [50, 2, 3], [115, 2, 1]]} />
    <Burst at={116} x={tamO(2, 1).x} y={tamO(2, 1).y} color={C.yellow} />
    <DongHoApSuat tu={70} den={60} />
  </NenHienTruong>
);

/* ================================================================== GÓI 6 · Hai mức vòi phun + bước lùi */
const R_G6M: Moc[] = [[0, 1, 4.5, -90], [20, 1, 3.2, -90], [65, 1, 3.2, 0], [95, 2.2, 3.2, -90], [115, 2.2, 2.2, -90]];
const G6Thu: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <NenHienTruong anh={NEN} mua="m2">
      <LuaGoc to />
      <ODat ten={f >= 52 ? 'o-lua-tat' : 'o-lua-nho'} c={1} r={2} />
      <QuangNong c={2} r={1} />
      <ODat ten="o-nut-ban" c={2} r={1} />
      {f >= 25 && f < 55 ? <TiaNuoc tu={tamO(1, 2.8)} den={tamO(1, 2)} /> : null}
      {f >= 118 && f < 155 ? <TiaNuoc tu={tamO(2.2, 1.8)} den={tamO(2, 1)} /> : null}
      <Xe anh="du" moc={R_G6M} doi={[[25, 'du-phun'], [55, 'du'], [120, 'du-ngac']]} />
      <ChuNay chu="YẾU QUÁ!" at={128} den={185} x={tamO(2, 1).x + 150} y={tamO(2, 1).y} mau={C.warn} />
      <CodeBox lines={['spray()', 'move()', 'spray()']} x={270} y={145} w={440} size={30} title="Một mức phun nhẹ" />
      <DongHoApSuat tu={72} den={82} />
      <NhanGoi so={6} ten="Hai mức phun" />
      {f >= 132 ? <Hanh dang="hanh-hoang" says={[{at: 140, out: 255, text: 'Van trong đó kẹt cứng lắm, phun nhẹ thế không ăn thua!'}]} at={132} /> : null}
    </NenHienTruong>
  );
};
const R_G6K: Moc[] = [[0, 1, 4.2, -90], [20, 1, 3.1, -90], [60, 1, 3.1, 0], [85, 2, 3.1, -90], [110, 2, 2.1, -90]];
const G6Lam: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <NenHienTruong anh={NEN} mua="m2">
      <LuaGoc to />
      <ODat ten={f >= 50 ? 'o-lua-tat' : 'o-lua-nho'} c={1} r={2} />
      {f < 145 ? <QuangNong c={2} r={1} /> : null}
      <ODat ten={f >= 145 ? 'o-nut-ban-mo' : 'o-nut-ban'} c={2} r={1} />
      {f >= 25 && f < 52 ? <TiaNuoc tu={tamO(1, 2.7)} den={tamO(1, 2)} /> : null}
      {f >= 115 && f < 148 ? <TiaNuoc tu={tamO(2, 1.7)} den={tamO(2, 1)} manh /> : null}
      <Xe anh="du" moc={R_G6K} doi={[[25, 'du-phun'], [55, 'du'], [115, 'du-phun'], [148, 'du-vui']]} />
      <Burst at={145} x={tamO(2, 1).x} y={tamO(2, 1).y} color={C.yellow} />
      <DongHoApSuat tu={78} den={86} gap />
    </NenHienTruong>
  );
};

/* ================================================================== GÓI 7 · Dò nguồn nhiệt */
const R_G7M: Moc[] = [[0, 2, 5.2, -90], [25, 2, 3, -90], [40, 2, 3, -180], [75, 0.8, 3, -180]];
const G7Thu: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <NenHienTruong anh={NEN} mua="m2">
      <LuaGoc to />
      <ODat ten="o-lua-tat" c={0} r={3} />
      <QuangNong c={4} r={2} />
      <ODat ten="o-lua" c={4} r={2} />
      {f >= 80 && f < 115 ? <TiaNuoc tu={tamO(0.5, 3)} den={tamO(0, 3)} /> : null}
      <Xe anh="du" moc={R_G7M} doi={[[85, 'du-ngac']]} />
      <ChuNay chu="TRỐNG!" at={85} den={145} x={tamO(0, 3).x + 110} y={tamO(0, 3).y - 60} mau={C.warn} />
      <CodeBox lines={['move()', 'left_move()', 'spray("low")']} x={260} y={145} w={480} size={30} title="Đi mù không hỏi cảm biến" />
      <DongHoApSuat tu={84} den={89} gap />
      <NhanGoi so={7} ten="Dò nguồn nhiệt" />
      {f >= 100 ? <Hanh dang="hanh-sot-ruot" says={[{at: 108, out: 235, text: 'Khói mù thế này, ổ nóng đổi chỗ liên tục, đi mò sao trúng!'}]} at={100} /> : null}
    </NenHienTruong>
  );
};
const G7Nghi: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m2" toi={0.42}>
    <QuangNong c={4} r={2} />
    <ODat ten="o-lua" c={4} r={2} />
    <Xe anh="du-do" moc={[[0, 2, 3, 0]]} />
    <Luna says={[{at: 6, out: 82, text: 'Mắt hồng ngoại đã báo nóng hay nguội rồi, sao bắt R1 đi mù?'}]} mat={[[0, 'thinking']]} />
    <Sola says={[{at: 88, out: 175, text: 'Hỏi mắt hồng ngoại trước: thấy nóng mới dừng lại phun!'}]} mat={[[0, 'thinking'], [88, 'confident']]} />
  </NenHienTruong>
);
const R_G7K: Moc[] = [[0, 2, 5.2, -90], [30, 2, 3, -90], [65, 2, 2, -90], [80, 2, 2, 0], [110, 3, 2, 0]];
const G7Lam: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <NenHienTruong anh={NEN} mua="m2">
      <LuaGoc to />
      {f < 150 ? <QuangNong c={4} r={2} /> : null}
      <ODat ten={f >= 150 ? 'o-lua-tat' : 'o-lua'} c={4} r={2} />
      {f >= 115 && f < 152 ? <TiaNuoc tu={tamO(3.4, 2)} den={tamO(4, 2)} /> : null}
      <Xe anh="du" moc={R_G7K} doi={[[70, 'du-do'], [115, 'du-phun'], [152, 'du-vui']]} />
      <Burst at={150} x={tamO(4, 2).x} y={tamO(4, 2).y} color={C.yellow} />
      <DongHoApSuat tu={88} den={72} />
    </NenHienTruong>
  );
};

/* ================================================================== GÓI 8 · Tiếp vận từ kho chú Tùng */
const R_G8M: Moc[] = [[0, 1, 5.2, -90], [20, 1, 5.2, -90], [75, 1, 3.65, -90], [95, 1, 3.8, -90]];
const G8Thu: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Shake hits={[76]} amp={10}>
      <NenHienTruong anh={NEN} mua="m2">
        <LuaGoc to />
        <ODat ten="o-nut-de" c={3} r={4} />
        <Cua c={1} r={2} mo={() => false} />
        {[1, 2, 3].map((c) => <ODat key={c} ten="o-bang" c={c} r={1} />)}
        <ODat ten="o-dich" c={4} r={1} />
        <Vat ten="vat-thung-go" moc={[[0, 1, 3], [75, 1, 2.75]]} />
        <Xe anh="du" moc={R_G8M} doi={[[76, 'du-ngac']]} />
        <ChuNay chu="VƯỚNG CỬA!" at={76} den={145} x={tamO(1, 2).x + 150} y={tamO(1, 2).y} />
        <div style={{position: 'absolute', left: 170, top: 150, padding: '12px 24px', borderRadius: 18, background: '#FFF7ED', border: `4px solid ${C.ink}`,
          display: 'flex', alignItems: 'center', gap: 14, fontFamily: FONT, fontWeight: 800, fontSize: 30, color: C.ink}}>
          <Icon name="Radio" size={38} color="#EA580C" />Kho chú Tùng: "Gửi thùng van sang cho cô Hạnh đây!"
        </div>
        <DongHoApSuat tu={74} den={78} />
        <NhanGoi so={8} ten="Tiếp vận" />
        {f >= 92 ? <Hanh dang="hanh-tin" says={[{at: 100, out: 235, text: 'Phải mở cửa rồi canh băng chuyền mới đưa thùng vào được!'}]} at={92} /> : null}
      </NenHienTruong>
    </Shake>
  );
};
const G8Nghi: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m2" toi={0.42}>
    <ODat ten="o-nut-de" c={3} r={4} />
    <Cua c={1} r={2} mo={() => false} />
    {[1, 2, 3].map((c) => <ODat key={c} ten="o-bang" c={c} r={1} />)}
    <ODat ten="o-dich" c={4} r={1} />
    <Vat ten="vat-thung-go" moc={[[0, 1, 3]]} />
    <Xe anh="du" moc={[[0, 2, 4.5, -90]]} />
    <Luna says={[{at: 6, out: 82, text: 'Làm cái nào trước, cái nào sau để thùng không kẹt cửa?'}]} mat={[[0, 'thinking']]} />
    <Sola says={[{at: 88, out: 175, text: 'Mở cửa trước, đẩy thùng lên băng chuyền cho trôi vào bệ!'}]} mat={[[0, 'thinking'], [88, 'confident']]} />
  </NenHienTruong>
);
const R_G8K: Moc[] = [[0, 3, 5.2, -90], [30, 3, 4, -90], [45, 3, 4, -180], [70, 1, 4, -180], [82, 1, 4, -90], [120, 1, 1.75, -90]];
const G8Lam: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m2">
    <LuaGoc to />
    <ODat ten="o-nut-de" c={3} r={4} />
    <Cua c={1} r={2} mo={(g) => g >= 30} />
    {[1, 2, 3].map((c) => <ODat key={c} ten="o-bang" c={c} r={1} />)}
    <ODat ten="o-dich" c={4} r={1} />
    <Xe anh="du" moc={R_G8K} doi={[[155, 'du-vui']]} />
    <Vat ten="vat-thung-go" moc={[[0, 1, 3], [82, 1, 3], [120, 1, 1], [158, 4, 1]]} />
    <Burst at={158} x={tamO(4, 1).x} y={tamO(4, 1).y} color={C.yellow} />
    <DongHoApSuat tu={76} den={64} />
  </NenHienTruong>
);

/* ================================================================== GÓI 9 · Gọi thêm R2 giữ băng chuyền */
const R_G9M: Moc[] = [[0, 0, 4, 0], [35, 0, 4, 0], [75, 2, 4, 0], [88, 2, 4, -90], [135, 2, 4, -90]];
const G9Thu: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <NenHienTruong anh={NEN} mua="m2">
      <LuaGoc to />
      <ODat ten="o-nut-de" c={0} r={4} />
      {[0, 1, 2, 3, 4].map((c) => <ODat key={c} ten="o-bang" c={c} r={2} />)}
      <QuangNong c={2} r={1} />
      <ODat ten="o-nut-ban" c={2} r={1} />
      <Vat ten="vat-thung-go" moc={[[0, 0, 2], [40, 0, 2], [90, 2, 2]]} />
      {f >= 95 && f < 130 ? <TiaNuoc tu={tamO(2, 3.5)} den={tamO(2, 2)} manh /> : null}
      <Xe anh="du" moc={R_G9M} doi={[[95, 'du-phun'], [115, 'du-ngac']]} />
      <ChuNay chu="BỊ CHẮN!" at={105} den={165} x={tamO(2, 2).x + 140} y={tamO(2, 2).y} />
      <DongHoApSuat tu={82} den={90} gap />
      <NhanGoi so={9} ten="R2 tiếp viện" />
      <Sola says={[{at: 112, out: 230, text: 'Một mình R1 không vừa giữ băng chuyền vừa phun van tổng được!'}]} mat={[[0, 'worried'], [105, 'shocked']]} />
    </NenHienTruong>
  );
};
const R2_G9K: Moc[] = [[0, 0, 5.5, -90], [45, 0, 4.62, -90], [150, 0, 4.62, -90]];
const R1_G9K: Moc[] = [[0, 2, 5.2, -90], [50, 2, 3.2, -90], [150, 2, 3.2, -90]];
const G9Lam: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <NenHienTruong anh={NEN} mua="m2">
      <LuaGoc to />
      <ODat ten="o-nut-de" c={0} r={4} />
      {[0, 1, 2, 3, 4].map((c) => <ODat key={c} ten="o-bang" c={c} r={2} />)}
      {f < 135 ? <QuangNong c={2} r={1} /> : null}
      <ODat ten={f >= 135 ? 'o-nut-ban-mo' : 'o-nut-ban'} c={2} r={1} />
      <Vat ten="vat-thung-go" moc={[[0, 0, 2], [45, 1, 2], [150, 1, 2]]} />
      <Xe anh="r2" moc={R2_G9K} doi={[[48, 'r2-vui']]} />
      <Vat ten="vat-thung-go" moc={[[0, 0, 4]]} bam={{moc: R2_G9K, tu: 0, den: 48}} />
      {f >= 85 && f < 138 ? <TiaNuoc tu={tamO(2, 2.7)} den={tamO(2, 1)} manh /> : null}
      <Xe anh="du" moc={R1_G9K} doi={[[85, 'du-phun'], [138, 'du-vui']]} />
      <Burst at={135} x={tamO(2, 1).x} y={tamO(2, 1).y} color={C.yellow} />
      <DongHoApSuat tu={88} den={68} />
    </NenHienTruong>
  );
};

/* ================================================================== GÓI 10 · Xuất xưởng Xe cứu hỏa R1 */
const G10Mo: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m2">
    <LuaGoc to />
    <VetDau c={1} r={4} w={3} h={1.6} />
    {[0, 1, 2].map((c) => <ODat key={c} ten="o-bang" c={c} r={3} />)}
    <Vat ten="vat-thung-nang" moc={[[0, 2, 2]]} />
    <ODat ten="o-nut-de" c={2} r={1} />
    <Cua c={3} r={1} mo={() => false} />
    <QuangNong c={4} r={1} />
    <ODat ten="o-nut-ban" c={4} r={1} />
    <Xe anh="du" moc={[[0, 1, 5.4, -90]]} />
    <DongHoApSuat tu={94} den={98} gap />
    <NhanGoi so={10} ten="Xuất xưởng" />
    <Hanh dang="hanh-sot-ruot" says={[{at: 10, out: 145, text: 'Áp suất lên tới đỉnh rồi, phải hạ nhiệt cả ba khu một mạch!'}]} />
  </NenHienTruong>
);
const ThaTay: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#EEF2FF', fontFamily: FONT}}>
      <Img src={staticFile('nen-doc/trong-xe.jpg')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(15,23,42,0.82) 0%, rgba(15,23,42,0.25) 45%, rgba(15,23,42,0.85) 100%)'}} />
      <CodeBox lines={['while warm():', '    spray("low")', 'spray("high")']} x={160} y={80} w={760} size={38} hl={2} title="cuu_hoa_tu_dong.py" />
      <div style={{position: 'absolute', left: 540 - 310, top: 820 - 310, width: 620, height: 620, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(249,115,22,0.36) 0%, rgba(250,204,21,0.18) 55%, transparent 72%)',
        border: '5px dashed #FDE047', transform: `rotate(${f * 0.7}deg)`}} />
      <div style={{position: 'absolute', left: 540 - 280, top: 820 - 280, width: 560, height: 560, transform: 'rotate(-90deg)'}}>
        <Img src={staticFile('robot/m2/du-vui.png')} style={{width: '100%', height: '100%', filter: 'drop-shadow(0 18px 28px rgba(0,0,0,0.5))'}} />
      </div>
      <Sola says={[{at: 10, out: 72, text: 'Code xong! Giờ thả tay để R1 tự cân hết cả 3 phân xưởng nhà máy!'}]} mat={[[0, 'confident'], [65, 'proud']]} x={260} />
      <Luna says={[{at: 78, out: 155, text: 'Full giáp bánh xích + vòi áp lực cao, chiến thôi R1 ơi!'}]} mat={[[0, 'surprised'], [78, 'excited']]} x={820} />
    </AbsoluteFill>
  );
};
const R_G10A: Moc[] = [[0, 0, 5.2, -90], [35, 0, 3, -90], [75, 2, 3, -90], [120, 2, 1.68, -90]];
const G10Khu12: React.FC = () => (
  <NenHienTruong anh={NEN} mua="m2">
    <VetDau c={0} r={4} w={2} h={1.5} />
    {[0, 1, 2].map((c) => <ODat key={c} ten="o-bang" c={c} r={3} />)}
    <ODat ten="o-nut-de" c={2} r={1} />
    <Cua c={3} r={1} mo={(g) => g >= 120} />
    <Xe anh="du" moc={R_G10A} />
    <Vat ten="vat-thung-nang" moc={[[0, 2, 2], [75, 2, 2], [120, 2, 1]]} />
    <DongHoApSuat tu={96} den={82} gap />
    <NhanGoi so={10} ten="Khu băng chuyền" />
  </NenHienTruong>
);
const R_G10B: Moc[] = [[0, 2, 4.2, -90], [35, 2, 2, -90], [48, 2, 2, 0], [80, 3, 2, 0], [95, 3, 2, -90], [160, 3, 2, -90]];
const G10BuongLo: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <NenHienTruong anh={NEN} mua="m2">
      <LuaGoc tat={f >= 75} to={f < 75} />
      {f < 145 ? <QuangNong c={3} r={1} /> : null}
      <ODat ten={f >= 145 ? 'o-nut-ban-mo' : 'o-nut-ban'} c={3} r={1} />
      {f >= 52 && f < 78 ? <TiaNuoc tu={tamO(3.2, 1.5)} den={tamO(4, 0)} /> : null}
      {f >= 98 && f < 115 ? <TiaNuoc tu={tamO(3, 1.6)} den={tamO(3, 1)} /> : null}
      {f >= 120 && f < 148 ? <TiaNuoc tu={tamO(3, 1.6)} den={tamO(3, 1)} manh /> : null}
      <ChuNay chu="!" at={108} den={125} x={tamO(3, 2).x + 120} y={tamO(3, 2).y - 60} mau={C.bad} />
      <Xe anh="du" moc={R_G10B} doi={[[50, 'du-phun'], [95, 'du-do'], [120, 'du-phun'], [148, 'du-vui']]} />
      <Burst at={145} x={tamO(3, 1).x} y={tamO(3, 1).y} color={C.yellow} />
      <DongHoApSuat tu={82} den={35} />
      <NhanGoi so={10} ten="Buồng lò chính" />
    </NenHienTruong>
  );
};
const XuatXuongM2: React.FC = () => {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  const tem = pop(f, 60, fps, 8);
  const PART = ['Thân bánh xích · Lưỡi ủi', 'Vòi phun nước · Hai mức áp lực', 'Mắt hồng ngoại · Dò nguồn nhiệt'];
  return (
    <Shake hits={[62]} amp={14}>
      <AbsoluteFill style={{background: '#7C2D12', fontFamily: FONT, backgroundImage: 'linear-gradient(rgba(255,255,255,.08) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,.08) 2px, transparent 2px)', backgroundSize: '60px 60px'}}>
        <div style={{position: 'absolute', top: 170, left: 0, right: 0, textAlign: 'center', color: '#fff', fontWeight: 900, fontSize: 76}}>Xe cứu hỏa R1</div>
        <div style={{position: 'absolute', left: 540 - 440, top: 260, width: 880, height: 880, transform: `rotate(-90deg) scale(${1 + 0.02 * Math.sin(f / 10)})`}}>
          <Img src={staticFile('robot/m2/du-vui.png')} style={{width: 880, height: 880}} />
        </div>
        {PART.map((p, i) => (
          <div key={p} style={{position: 'absolute', left: 120, right: 120, top: 1150 + i * 110, opacity: ease(f, [10 + i * 10, 22 + i * 10], [0, 1]), padding: '18px 28px', borderRadius: 20,
            background: 'rgba(255,255,255,.14)', border: '3px solid rgba(255,255,255,.5)', color: '#fff', fontWeight: 800, fontSize: 38, display: 'flex', gap: 18, alignItems: 'center'}}>
            <Icon name="CircleCheck" size={44} color={C.yellow} />{p}
          </div>
        ))}
        {f >= 54 ? (
          <div style={{position: 'absolute', left: 540, top: 760, transform: `translate(-50%, -50%) rotate(-14deg) scale(${2.4 - 1.4 * tem})`, opacity: Math.min(1, tem * 2),
            padding: '18px 44px', border: `12px solid ${C.yellow}`, borderRadius: 24, color: C.yellow, fontWeight: 900, fontSize: 110, letterSpacing: '0.06em', background: 'rgba(27,24,56,.92)', whiteSpace: 'nowrap'}}>XUẤT XƯỞNG</div>
        ) : null}
        <div style={{position: 'absolute', left: 80, right: 80, top: 1520, textAlign: 'center', color: '#FFEDD5', fontWeight: 700, fontSize: 40, lineHeight: 1.35, opacity: ease(f, [100, 120], [0, 1])}}>
          Thân bánh xích ở lại nhà máy trực cứu hỏa.<br />Bộ não R1 về xe trạm, lên đường tiếp.
        </div>
      </AbsoluteFill>
    </Shake>
  );
};
const NgoaiDoiM2: React.FC = () => {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  const THE = [
    {icon: 'Flame' as const, ten: 'Robot Cứu Hỏa Bánh Xích (Thermite / Colossus)', mo: 'Vượt đống đổ nát và băng chuyền công nghiệp, chịu nhiệt hàng trăm độ thay lính cứu hỏa.'},
    {icon: 'Eye' as const, ten: 'Camera Nhiệt Hồng Ngoại (Thermal IR)', mo: 'Nhìn xuyên khói đặc để phát hiện điểm phát nhiệt ngầm bên trong đường ống và buồng lò.'},
  ];
  return (
    <NenHienTruong anh={NEN} mua="m2" luoi={false} toi={0.58}>
      <div style={{position: 'absolute', left: 40, top: 120, right: 40, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 48, color: C.yellow, textShadow: `0 6px 0 ${C.ink}`}}>
        CÔNG NGHỆ NGOÀI ĐỜI THỰC · M2
      </div>

      {/* Hero Showcase: Robot R1 của mùa -> Công nghệ thực tế (top: 210 .. 490) */}
      <div style={{position: 'absolute', left: 50, right: 50, top: 210, height: 275, borderRadius: 32,
        background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', border: `6px solid ${C.ink}`,
        boxShadow: `0 14px 0 ${C.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 34px',
        transform: `scale(${pop(f, 6, fps)})`, boxSizing: 'border-box'}}>
        <div style={{width: 225, height: 225, borderRadius: 28, background: 'rgba(255,255,255,0.08)', border: `4px solid ${C.yellow}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
          <Img src={staticFile('robot/m2/du-vui.png')} style={{width: 205, height: 205, objectFit: 'contain', transform: 'rotate(-90deg)'}} />
        </div>
        <div style={{flex: 1, marginLeft: 28, fontFamily: FONT, color: '#fff'}}>
          <div style={{display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 99, background: '#EA580C',
            border: '3px solid #fff', fontSize: 22, fontWeight: 900, marginBottom: 10}}>
            TỪ SA BÀN CLB RA THỰC TẾ
          </div>
          <div style={{fontSize: 38, fontWeight: 900, color: '#FDE047', marginBottom: 6}}>Xe Cứu Hỏa Bánh Xích R1</div>
          <div style={{fontSize: 26, fontWeight: 700, color: '#E2E8F0', lineHeight: 1.3}}>Bám chắc băng chuyền, dò nhiệt hồng ngoại và phun nước 2 mức áp lực.</div>
        </div>
      </div>

      {THE.map((t, i) => (
        <div key={t.ten} style={{position: 'absolute', left: 50, right: 50, top: 515 + i * 325, height: 295, padding: '28px 34px', borderRadius: 30, background: '#fff',
          border: `6px solid ${C.ink}`, boxShadow: `0 14px 0 ${C.ink}`, display: 'flex', gap: 28, alignItems: 'center',
          transform: `scale(${pop(f, 12 + i * 16, fps)})`, boxSizing: 'border-box'}}>
          <div style={{width: 150, height: 150, borderRadius: 28, background: '#EA580C', border: `5px solid ${C.ink}`,
            boxShadow: `0 8px 0 ${C.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
            <Icon name={t.icon} size={84} color="#fff" />
          </div>
          <div style={{fontFamily: FONT, color: C.ink, flex: 1}}>
            <div style={{fontWeight: 900, fontSize: 38, marginBottom: 10, lineHeight: 1.2}}>{t.ten}</div>
            <div style={{fontWeight: 800, fontSize: 28, color: '#334155', lineHeight: 1.34}}>{t.mo}</div>
          </div>
        </div>
      ))}
      <Sola mat={[[0, 'happy']]} says={[{at: 14, out: 142, text: 'Cảm biến hồng ngoại kết hợp vòi phun 2 áp lực trên R1 chính là bản thu nhỏ của robot cứu hỏa thực chiến!'}]} />
    </NenHienTruong>
  );
};
const NhaMua3: React.FC = () => {
  const f = useCurrentFrame();
  const xXe = ease(f, [0, 120], [40, 120]);
  return (
    <AbsoluteFill style={{background: '#334155', fontFamily: FONT, overflow: 'hidden'}}>
      <Img src={staticFile('ban-do/mua-3b.jpg')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9}} />
      <AbsoluteFill style={{background: 'rgba(15,23,42,0.32)'}} />

      <div style={{position: 'absolute', left: 45, right: 45, top: 80, padding: '20px 28px', borderRadius: 26,
        background: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)', border: `5px solid #FDE047`,
        boxShadow: `0 10px 0 ${C.ink}`, textAlign: 'center', color: '#FDE047', fontWeight: 900, fontSize: 38}}>
        CHUYỂN TRẠM CHIẾN DỊCH · TIẾN VỀ BÃI TÁI CHẾ MÙA 3!
      </div>

      {/* Khung Hero trung tâm: Xe Trạm + Chân dung Bác Sơn cỡ lớn (top: 230 .. 830) */}
      <div style={{position: 'absolute', left: 45, right: 45, top: 230, height: 590, borderRadius: 36,
        background: 'linear-gradient(180deg, rgba(15,23,42,0.92) 0%, rgba(20,83,45,0.92) 100%)',
        border: `6px solid ${C.ink}`, boxShadow: `0 16px 0 ${C.ink}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around', padding: '28px 34px', boxSizing: 'border-box'}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-around', width: '100%'}}>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, transform: `translateX(${xXe * 0.25}px)`}}>
            <Img src={staticFile('robot/xe-tram-a.png')} style={{width: 320, height: 270, objectFit: 'contain'}} />
            <span style={{padding: '8px 22px', borderRadius: 14, background: '#F59E0B', color: C.ink, fontWeight: 900, fontSize: 23, border: `3.5px solid ${C.ink}`}}>
              THEO XE CHỞ SẮT VỤN
            </span>
          </div>
          <div style={{width: 280, height: 280, borderRadius: 32, background: '#DCFCE7', border: `6px solid #22C55E`,
            boxShadow: `0 10px 0 ${C.ink}`, overflow: 'hidden'}}>
            <Img src={staticFile('nguoi/sau-sot-ruot.png')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 10%'}} />
          </div>
        </div>
        <div style={{padding: '14px 28px', borderRadius: 20, background: '#16A34A', color: '#fff', fontWeight: 900, fontSize: 30,
          border: '3.5px solid #fff', display: 'flex', alignItems: 'center', gap: 14}}>
          <Icon name="Recycle" size={36} color="#FDE047" />
          <span>BÁC SƠN ĐANG CẦN ROBOT PHÂN LOẠI KIM LOẠI!</span>
        </div>
      </div>

      <div style={{position: 'absolute', left: 45, right: 45, top: 870, opacity: ease(f, [15, 35], [0, 1]),
        background: '#FEF3C7', borderRadius: 34, border: `6px solid ${C.ink}`, boxShadow: `0 16px 0 ${C.ink}`, padding: '32px 36px', display: 'flex', gap: 26, alignItems: 'center'}}>
        <div style={{width: 120, height: 120, borderRadius: 26, background: '#16A34A', border: `4px solid ${C.ink}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
          <Icon name="Magnet" size={72} color="#fff" />
        </div>
        <div>
          <div style={{fontSize: 24, fontWeight: 900, color: '#15803D', marginBottom: 6}}>ĐIỂM ĐẾN TIẾP THEO · MÙA 3</div>
          <div style={{fontSize: 38, fontWeight: 900, color: C.ink, lineHeight: 1.28}}>
            Bãi tái chế bác Sơn · Độ chân nhện & nam châm điện lọc sạch núi sắt vụn!
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== danh sách phim */
const mo = (so: number, canh: Phim['canh']): Phim => ({id: `M2G${so}-Mo`, doc: true, canh});
const ket = (so: number, canh: Phim['canh']): Phim => ({id: `M2G${so}-Ket`, doc: true, canh});
const tt = (so: number, ten: string, ap: number, loi: string, xuong: [boolean, boolean, boolean], xoa?: number, apDen?: number) => ({
  id: 'thanh-tuu', dur: 170, el: <ThanhTuu moi={so - 1} loi={loi} ap={ap} apDen={apDen} so={so} ten={ten} xoa={xoa} xuong={xuong} />,
  sfx: [[22, xoa !== undefined ? 'wrong.wav' : 'ding.wav', 0.5]] as any,
});
const xe = (anh: string, sola: string, luna: string, tenPart: string, cach = 120) => ({
  id: 'trong-xe', dur: cach + 75,
  el: <TrongXe mua="m2" anh={anh} cach={cach} tenPart={tenPart} sola={[{at: 8, out: 72, text: sola}]} luna={[{at: 78, out: cach + 65, text: luna}]}
    solaMat={[[0, 'thinking'], [78, 'excited']]} lunaMat={[[0, 'confident'], [78, 'happy']]} />,
  sfx: [[cach, 'impact.wav', 0.5], [cach, 'ding.wav', 0.4]] as any,
});
const treo = (anh: string, cau: string, so: number, ten: string) => ({
  id: 'cau-treo', dur: 110, el: <CauTreo mua="m2" anh={anh} cau={cau} so={so} ten={ten} />, sfx: [W_IN, [40, 'pop.wav', 0.4]] as any,
});

export const PHIM_M2: Phim[] = [
  mo(1, [
    {id: 'hien-truong', dur: 185, el: <G1Mo />, sfx: [W_IN, [68, 'wrong.wav', 0.5]]},
    xe('xich', 'Map nhà máy nhiều băng chuyền quá, xe hai bánh cứ bước lên là bị đẩy trôi mất Luna ơi!', 'Bắt buộc phải lắp Thân bánh xích hạng nặng thôi! Bám chặt không bị băng chuyền đẩy, để tớ chỉ cậu cách lái nhé!', 'Thân bánh xích', 120),
    ...CANH_LAB_BANH_XICH,
    treo('xich', 'Hai dải xích có bốn cách gạt — thử xem sao!', 1, 'Bánh xích'),
  ]),
  ket(1, [{id: 'lam', dur: 155, el: <G1Lam />, sfx: [[136, 'ding.wav', 0.5]]}, tt(1, 'Bánh xích', 50, 'Đứng trên băng chuyền mà không bị đẩy trôi, chắc chắn thật!', [false, false, false])]),
  mo(2, [
    {id: 'thu', dur: 240, el: <G2Thu />, sfx: [[80, 'wrong.wav', 0.5]]},
    xe('xich-voi', 'Rãnh nóng chặn ngang không tới gần van được, làm sao đây Luna?', 'Tớ gắn Vòi phun nước cho R1 đứng xa 2 ô bắn tia nước qua rãnh nhé!', 'Vòi phun nước', 125),
    ...CANH_LAB_VOI_PHUN,
    treo('xich-voi', 'Phun trúng van bên kia rãnh nào!', 2, 'Vòi nước'),
  ]),
  ket(2, [{id: 'lam', dur: 180, el: <G2Lam />, sfx: [[52, 'swish.wav', 0.5], [75, 'ding.wav', 0.4], [152, 'ding.wav', 0.4]]}, tt(2, 'Vòi nước', 54, 'Đứng xa mà đóng được van, tài thật!', [true, false, false])]),
  mo(3, [
    {id: 'thu', dur: 245, el: <G3Thu />, sfx: [[65, 'wrong.wav', 0.5], [98, 'impact.wav', 0.5]]},
    xe('xich-hn', 'Mắt thường không thấy ống nào nóng hay cách mấy ô, làm sao đây Luna?', 'Tớ gắn Cảm biến hồng ngoại vừa đếm ô trống vừa phát hiện nguồn nhiệt nhé!', 'Mắt hồng ngoại', 125),
    ...CANH_LAB_HONG_NGOAI,
    treo('xich-hn', 'R1 tự dò chỗ nóng rồi mới phun nhé!', 3, 'Mắt hồng ngoại'),
  ]),
  ket(3, [{id: 'lam', dur: 165, el: <G3Lam />, sfx: [[85, 'pop.wav', 0.4], [132, 'ding.wav', 0.5]]}, tt(3, 'Mắt hồng ngoại', 60, 'Đúng ống đang nóng rồi, không tốn giọt nước nào!', [true, false, false])]),
  mo(4, [
    {id: 'thu', dur: 255, el: <G4Thu />, sfx: [[68, 'swish.wav', 0.4], [130, 'wrong.wav', 0.5]]},
    {id: 'nghi', dur: 180, el: <G4Nghi />, sfx: [[20, 'pop.wav', 0.3], [88, 'pop.wav', 0.3]]},
    treo('xich-hn', 'Canh nhịp băng chuyền cho chuẩn nào!', 4, 'Băng chuyền'),
  ]),
  ket(4, [{id: 'lam', dur: 170, el: <G4Lam />, sfx: [[145, 'ding.wav', 0.5]]}, tt(4, 'Băng chuyền', 62, 'Đi nhờ băng chuyền luôn, khéo thế!', [true, true, false])]),
  mo(5, [
    {id: 'thu', dur: 230, el: <G5Thu />, sfx: [[68, 'impact.wav', 0.6]]},
    xe('du', 'Mũi xe nhỏ đẩy kiện sắt dễ trượt, cần gì ở đầu xe?', 'Gắn lưỡi ủi phẳng — ủi thẳng băng!', 'Lưỡi ủi', 125),
    treo('du', 'Đo khoảng cách rồi ủi kiện sắt vào nút sàn nào!', 5, 'Lưỡi ủi'),
  ]),
  ket(5, [{id: 'lam', dur: 150, el: <G5Lam />, sfx: [[115, 'click.wav', 0.6], [116, 'ding.wav', 0.4]]}, tt(5, 'Lưỡi ủi', 60, 'Nặng thế mà ủi một mạch tới nơi!', [true, true, false])]),
  mo(6, [
    {id: 'thu', dur: 260, el: <G6Thu />, sfx: [[128, 'wrong.wav', 0.5]]},
    xe('du-phun', 'Phun nhẹ dập lửa gần, gặp van kẹt cứng thì sao?', 'Chỉnh vòi hai mức: mức nhẹ dập lửa, mức mạnh mở van!', 'Van hai mức áp lực', 125),
    treo('du', 'Tuỳ chỗ mà chọn mức phun nhé!', 6, 'Hai mức phun'),
  ]),
  ket(6, [{id: 'lam', dur: 165, el: <G6Lam />, sfx: [[115, 'swish.wav', 0.5], [145, 'ding.wav', 0.4]]}, tt(6, 'Hai mức phun', 72, 'Chết rồi, trong phòng vật tư lửa bùng lại kìa!', [true, false, false], 4, 88)]),
  mo(7, [
    {id: 'thu', dur: 240, el: <G7Thu />, sfx: [[85, 'wrong.wav', 0.5]]},
    {id: 'nghi', dur: 180, el: <G7Nghi />, sfx: [[20, 'pop.wav', 0.3], [88, 'pop.wav', 0.3]]},
    treo('du', 'Để R1 vừa đi vừa hỏi mắt hồng ngoại!', 7, 'Dò nguồn nhiệt'),
  ]),
  ket(7, [{id: 'lam', dur: 170, el: <G7Lam />, sfx: [[70, 'pop.wav', 0.4], [150, 'ding.wav', 0.5]]}, tt(7, 'Dò nguồn nhiệt', 70, 'Tự tìm ra tận gốc chỗ nóng, giỏi thật!', [true, true, false])]),
  mo(8, [
    {id: 'thu', dur: 240, el: <G8Thu />, sfx: [[76, 'impact.wav', 0.6]]},
    {id: 'nghi', dur: 180, el: <G8Nghi />, sfx: [[20, 'pop.wav', 0.3], [88, 'pop.wav', 0.3]]},
    treo('du', 'Sắp lại thứ tự từng việc cho R1 nào!', 8, 'Tiếp vận'),
  ]),
  ket(8, [{id: 'lam', dur: 175, el: <G8Lam />, sfx: [[30, 'click.wav', 0.5], [158, 'ding.wav', 0.5]]}, tt(8, 'Tiếp vận', 64, 'Nhờ hàng chú Tùng gửi sang mà kịp thay van mới!', [true, true, false])]),
  mo(9, [
    {id: 'thu', dur: 235, el: <G9Thu />, sfx: [[105, 'wrong.wav', 0.5]]},
    xe('r2', 'Bộ hai bánh và tay kẹp của mùa trước vẫn còn đây?', 'Lắp thành R2 giữ băng chuyền, R1 phun van tổng!', 'R2 của Luna', 120),
    treo('r2', 'Hai robot phối hợp hai đầu sàn nhé!', 9, 'R2 tiếp viện'),
  ]),
  ket(9, [{id: 'lam', dur: 165, el: <G9Lam />, sfx: [[48, 'click.wav', 0.5], [135, 'ding.wav', 0.5]]}, tt(9, 'R2 tiếp viện', 68, 'Con robot nhỏ ở kho chú Tùng sang giúp ăn ý quá!', [true, true, false])]),
  mo(10, [
    {id: 'hien-truong', dur: 155, el: <G10Mo />, sfx: [W_IN]},
    {id: 'tha-tay', dur: 160, el: <ThaTay />, sfx: [[70, 'riser.wav', 0.4]]},
  ]),
  ket(10, [
    {id: 'khu-1-2', dur: 145, el: <G10Khu12 />, sfx: [[120, 'click.wav', 0.5]]},
    {id: 'buong-lo', dur: 170, el: <G10BuongLo />, sfx: [[108, 'wrong.wav', 0.4], [145, 'ding.wav', 0.5]]},
    tt(10, 'Xuất xưởng', 82, 'Nhà máy thoát hiểm rồi! Cảm ơn hai cháu và R1!', [true, true, true], undefined, 32),
    {id: 'xuat-xuong', dur: 180, el: <XuatXuongM2 />, sfx: [[60, 'impact.wav', 0.8], [62, 'ding.wav', 0.5]]},
    {id: 'ngoai-doi', dur: 150, el: <NgoaiDoiM2 />, sfx: [W_IN]},
    {id: 'nha', dur: 150, el: <NhaMua3 />, sfx: [[25, 'whoosh-soft.wav', 0.4]]},
  ]),
];
