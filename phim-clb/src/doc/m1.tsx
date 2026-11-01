// 10 phim gói mùa 1 "Kho hàng", khổ dọc, theo hoc/KICH-BAN-PHIM-GOI-CLB.md bản 2 mục 2:
// mỗi gói hai phim: M1G<n>-Mo (phim mở: vấn đề thực tế -> Luna chế part giải pháp -> giải thích cơ chế cho Sola -> câu treo)
// và M1G<n>-Ket (đoạn kết sau màn trùm: làm thật -> thành tựu).
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Burst, C, CodeBox, FONT, Icon, Mascot, MONO, Say, Shake, ease, pop} from '../d10';
import {Phim, W_IN} from '../may-phim';
import {CANH_LAB_XE, CanhBanhLuiLab} from '../PhimXe';
import {CANH_LAB_TAY_KEP, CANH_LAB_TAY_XOAY} from '../PhimTayKep';
import {CANH_LAB_KC_BEN, CANH_LAB_KC_TRUOC} from '../PhimKhoangCach';
import {BangViec, CauTreo, ChuNay, DongHo, LoaiNangCap, Moc, NenHienTruong, NhanGoi, Nguoi, O, ODat, TrongXe, Vat, Xe, chonDangNguoi, tamO, theoMoc} from './kit-doc';

const NEN = 'nen-doc/mua-1.png';
const DON = ['Dạy xe chạy', 'Dọn lối', 'Thùng chạy chỗ', 'Kho lạnh', 'Ngõ cụt', 'Lối hẹp hai bên', 'Mê cung kệ', 'Bến xuất', 'Đơn kho lạnh cuối', 'Xe tải lên đường'];
const GIO = (h: number, m = 0) => h * 60 + m;

/** Chú Tư thủ kho. */
const Tu: React.FC<{says: Say[]; at?: number; x?: number; side?: 'left' | 'right'; dang?: string; doiAnh?: [number, string][]}> = ({says, at = 0, x = 820, side = 'left', dang = 'tu-nghi', doiAnh}) => (
  <Nguoi anh={dang} doiAnh={doiAnh} ten="CHÚ TƯ" mau="#EA580C" x={x} h={600} at={at} says={says} side={side} bubbleW={560} bubbleTop={1230} />
);
const Sola: React.FC<{says: Say[]; mat: [number, string][]; at?: number; x?: number}> = ({says, mat, at = 0, x = 240}) => (
  <Mascot who="sola" x={x} h={540} at={at} faces={mat} says={says} bubbleW={520} bubbleTop={1240} />
);
const Luna: React.FC<{says: Say[]; mat: [number, string][]; at?: number; x?: number}> = ({says, mat, at = 0, x = 840}) => (
  <Mascot who="luna" x={x} h={540} at={at} faces={mat} says={says} side="left" bubbleW={520} bubbleTop={1240} lat />
);

/** Thanh trạng thái 3 phân khu Kho hàng Chú Tư trên bảng thành tựu. */
const KhuKhoBar: React.FC<{sang: [boolean, boolean, boolean]}> = ({sang}) => (
  <div style={{position: 'absolute', left: 90, top: 155, width: 900, display: 'flex', gap: 18}}>
    {['Khu lối vào', 'Khu kho lạnh', 'Khu bến xuất'].map((t, i) => (
      <div key={t} style={{flex: 1, padding: '14px 18px', borderRadius: 20, background: sang[i] ? '#DCFCE7' : '#1E293B',
        border: `4px solid ${C.ink}`, boxShadow: `0 8px 0 ${C.ink}`, display: 'flex', alignItems: 'center', gap: 12, fontFamily: FONT, fontWeight: 800, fontSize: 28,
        color: sang[i] ? '#166534' : '#94A3B8'}}>
        <Icon name={sang[i] ? 'PackageCheck' : 'Warehouse'} size={32} color={sang[i] ? '#16A34A' : '#F59E0B'} />{t}
      </div>
    ))}
  </div>
);

/** Đoạn kết chung: nền kho tối, bảng đơn hàng gạch thêm một dòng, chú Tư nói một câu. */
const ThanhTuu: React.FC<{moi: number; loi: string; gio: number; so: number; ten: string; khu: [boolean, boolean, boolean]; xoa?: number}> =
  ({moi, loi, gio, so, ten, khu, xoa}) => (
    <NenHienTruong anh={NEN} mua="m1" luoi={false} toi={0.52}>
      <KhuKhoBar sang={khu} />
      <BangViec tieuDe="Đơn hàng chiều nay của chú Tư" dong={DON} xong={moi} moi={moi} xoa={xoa} at={22} y={265} />
      <DongHo tu={gio} />
      <NhanGoi so={so} ten={ten} />
      <Tu dang={chonDangNguoi('tu', so, xoa)} says={[{at: 50, out: 200, text: loi}]} at={30} />
    </NenHienTruong>
  );

/** Tia cảm biến từ mũi xe tới điểm (x, y): vạch vàng (đỏ khi sát vật). */
const Tia: React.FC<{tu: {x: number; y: number}; den: {x: number; y: number}; mau?: string; mo?: number}> = ({tu, den, mau = C.yellow, mo = 1}) => {
  const dx = den.x - tu.x, dy = den.y - tu.y, dai = Math.hypot(dx, dy), g = (Math.atan2(dy, dx) * 180) / Math.PI;
  return <div style={{position: 'absolute', left: tu.x, top: tu.y - 6, width: dai, height: 12, borderRadius: 6, background: mau, opacity: 0.8 * mo,
    transform: `rotate(${g}deg)`, transformOrigin: '0 50%', boxShadow: `0 0 18px ${mau}`}} />;
};
const mui = (m: Moc[], f: number, xa = 0.55) => { const p = theoMoc(m, f), a = (p.goc * Math.PI) / 180; return {x: p.x + Math.cos(a) * xa * O, y: p.y + Math.sin(a) * xa * O}; };

/** Vòng sáng nhấp nháy quanh một ô (gợi ý nhìn vào đó). */
const VongSang: React.FC<{c: number; r: number; at: number}> = ({c, r, at}) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const p = tamO(c, r), k = 1 + 0.08 * Math.sin((f - at) / 4);
  return <div style={{position: 'absolute', left: p.x - O * 0.62, top: p.y - O * 0.62, width: O * 1.24, height: O * 1.24, borderRadius: 26,
    border: `8px solid ${C.yellow}`, boxShadow: `0 0 30px ${C.yellow}`, transform: `scale(${k})`, opacity: ease(f, [at, at + 10], [0, 1])}} />;
};

/** Hàng kệ hàng theo danh sách ô: dùng đúng ô kệ hàng 3D (o-ke-hang) của game. */
const Ke: React.FC<{o: [number, number][]}> = ({o}) => (
  <>{o.map(([c, r]) => <ODat key={`${c}-${r}`} ten="o-ke-hang" c={c} r={r} style={{borderRadius: 18}} />)}</>
);

/** Cửa kho (ô cửa của game): mở = mờ đi, lộ hơi lạnh xanh. */
const Cua: React.FC<{c: number; r: number; mo: (f: number) => boolean}> = ({c, r, mo}) => {
  const f = useCurrentFrame();
  const m = mo(f), p = tamO(c, r);
  return (
    <>
      <div style={{position: 'absolute', left: p.x - O / 2, top: p.y - O / 2, width: O, height: O, background: 'radial-gradient(circle, #E0F2FE 0%, #7DD3FC 70%)', borderRadius: 12}} />
      <ODat ten="o-cua" c={c} r={r} mo={m ? 0 : 1} />
    </>
  );
};

/* ================================================================== GÓI 1 · Hai bánh xe */
const G1Mo: React.FC = () => (
  <NenHienTruong anh={NEN}>
    {[[1, 1], [3, 2], [2, 3], [0, 4], [4, 4], [1, 5]].map(([c, r], i) => <Vat key={i} moc={[[0, c, r]]} />)}
    <DongHo tu={GIO(13)} />
    <NhanGoi so={1} ten="Hai bánh xe" />
    <Tu dang="tu-sot-ruot" says={[{at: 10, out: 135, text: 'Năm giờ xe tải tới mà hàng còn chất đầy lối!'}]} />
    <Sola says={[{at: 140, out: 255, text: 'Chú Tư cần dọn kho gấp trước 5 giờ chiều mà R1 chưa có bánh xe để lăn bánh luôn!'}]}
      mat={[[0, 'surprised-sach'], [140, 'worried']]} />
  </NenHienTruong>
);
const R_G1: Moc[] = [[0, 2, 5, -90], [10, 2, 5, -90], [90, 2, 1.62, -90]];
const G1Lam: React.FC = () => (
  <NenHienTruong anh={NEN}>
    <Vat moc={[[0, 2, 1]]} />
    <Xe anh="r1" moc={R_G1} doi={[[92, 'r1-vui']]} />
    <Burst at={92} x={tamO(2, 1).x} y={tamO(2, 1).y} color={C.yellow} />
    <DongHo tu={GIO(13, 10)} />
  </NenHienTruong>
);

/* ================================================================== GÓI 2 · Tay kẹp */
const R_G2: Moc[] = [
  [0, 1, 5, -90],
  [22, 1, 3, -90],
  [34, 1, 3, 0],
  [54, 2, 3, 0],
  [66, 2, 3, -90],
  [92, 2, 2.35, -90],
  [115, 2, 2.55, -90],
];
const G2Thu: React.FC = () => {
  const f = useCurrentFrame();
  const rot = (k: number) => (g: number) => ease(g, [92, 122], [0, k]);
  return (
    <Shake hits={[94]} amp={18}>
      <NenHienTruong anh={NEN}>
        <ODat ten="o-dich" c={4} r={3} />
        <ODat ten="o-dich" c={4} r={4} />
        <Vat moc={[[0, 2, 2], [92, 2, 2], [122, 0.2, 0.4]]} nghieng={rot(-140)} />
        <Vat moc={[[0, 2, 1], [92, 2, 1], [122, 3.8, 0.3]]} nghieng={rot(155)} />
        <Vat moc={[[0, 1.2, 1.6], [92, 1.2, 1.6], [122, 0.15, 2.8]]} nghieng={rot(-190)} />
        <Vat moc={[[0, 2.8, 1.6], [92, 2.8, 1.6], [122, 3.85, 2.1]]} nghieng={rot(135)} />
        <Xe anh="r1" moc={R_G2} doi={[[94, 'r1-ngac']]} />
        <ChuNay chu="RẦM! VĂNG HẾT THÙNG!" at={94} den={165} x={540} y={400} co={64} />
        <DongHo tu={GIO(13, 20)} />
        <NhanGoi so={2} ten="Tay kẹp" />
        <Sola says={[{at: 8, out: 84, text: 'R1 chạy mượt rồi, phóng thẳng tới ủi đống thùng luôn!'}]} mat={[[0, 'confident'], [94, 'shocked']]} />
        {f >= 100 ? <Tu dang="tu-hoang" says={[{at: 108, out: 270, text: 'Ấy chết, đâm thế bắn hết thùng ra xa rồi! Phải cầm lên mang ra đặt đúng vị trí chứ!'}]} at={100} /> : null}
      </NenHienTruong>
    </Shake>
  );
};
const R_G2K: Moc[] = [
  [0, 2, 5, -90],
  [10, 2, 5, -90],
  [45, 2, 2.68, -90],
  [58, 2, 2.68, -90],
  [78, 2, 2, -90],
  [92, 2, 2, 0],
  [140, 3.32, 2, 0],
  [170, 3.32, 2, 0],
];
const G2Lam: React.FC = () => (
  <NenHienTruong anh={NEN}>
    <ODat ten="o-dich" c={4} r={2} />
    <Xe anh="kep" moc={R_G2K} doi={[[55, 'kep-vui'], [145, 'kep']]} />
    <Vat moc={[[0, 2, 2], [54, 2, 2], [146, 4, 2]]} bam={{moc: R_G2K, tu: 55, den: 145}} />
    <Burst at={147} x={tamO(4, 2).x} y={tamO(4, 2).y} color={C.yellow} />
    <DongHo tu={GIO(13, 30)} />
  </NenHienTruong>
);

/* ================================================================== GÓI 3 · Cảm biến khoảng cách */
const R_G3: Moc[] = [[0, 2, 5, -90], [30, 2, 5, -90], [80, 2, 2, -90], [120, 2, 2, -90], [124, 2, 5, -90], [190, 2, 5, -90], [222, 2, 3.62, -90], [240, 2, 3.7, -90]];
const G3Thu: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Shake hits={[223]} amp={8}>
      <NenHienTruong anh={NEN}>
        <Vat moc={[[0, 2, 0], [150, 2, 0], [178, 2, 3]]} />
        <Xe anh="kep" moc={R_G3} mo={(g) => (g >= 120 && g < 140 ? 0.25 : 1)} doi={[[84, 'kep-ngac'], [124, 'kep'], [224, 'kep-ngac']]} />
        {f >= 82 && f < 120 ? <div style={{position: 'absolute', left: tamO(2, 1).x - 6, top: tamO(2, 0).y + O * 0.45, width: 12, height: O * 0.95,
          background: `repeating-linear-gradient(${C.bad} 0 14px, transparent 14px 26px)`}} /> : null}
        <ChuNay chu="HỤT!" at={84} den={120} x={790} y={tamO(2, 1).y} mau={C.warn} />
        <ChuNay chu="CỘP!" at={223} den={270} x={790} y={tamO(2, 3).y} />
        <CodeBox lines={['for i in range(3):', '    move()']} x={300} y={150} w={480} size={30} title="Sola viết vội" />
        <DongHo tu={GIO(13, 40)} />
        <Sola says={[{at: 4, out: 34, text: 'Code cứng 3 bước là tới chuẩn đét!'}, {at: 230, out: 300, text: 'Ủa alo… chú Tư dời thùng là lệch nhịp ngay!'}]} mat={[[0, 'confident'], [84, 'confused'], [224, 'facepalm']]} />
        {f >= 135 ? <Tu says={[{at: 140, out: 210, text: 'Để thùng đây cho gần nè.'}]} at={135} /> : null}
      </NenHienTruong>
    </Shake>
  );
};
const LAN3: [number, number, number][] = [[1, 1, 0], [2, 3, 25], [3, 2, 50]];
const G3Lam: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <NenHienTruong anh={NEN}>
      {LAN3.map(([c, r, t0]) => {
        const m: Moc[] = [[t0, c, 5.4, -90], [t0 + 60, c, r + 0.68, -90]];
        const chay = f >= t0 && f <= t0 + 60;
        return (
          <React.Fragment key={c}>
            <Vat moc={[[0, c, r]]} />
            {f >= t0 ? <Tia tu={mui(m, f)} den={{x: tamO(c, r).x, y: tamO(c, r).y + O * 0.42}} mau={chay ? C.yellow : C.good} /> : null}
            <Xe anh={f > t0 + 60 ? 'kep-cam-vui' : 'kep-cam'} moc={m} />
          </React.Fragment>
        );
      })}
      <DongHo tu={GIO(14)} />
    </NenHienTruong>
  );
};

/* ================================================================== GÓI 4 · Nút đè (kho lạnh) */
const KE_LANH: [number, number][] = [[0, 1], [1, 1], [3, 1], [4, 1]];
const R_G4: Moc[] = [[0, 1, 5, -90], [15, 1, 5, -90], [55, 1, 3, -90], [75, 1, 3, -90], [85, 1, 3, 0], [105, 2, 3, 0], [115, 2, 3, -90], [140, 2, 2.3, -90]];
const G4Thu: React.FC = () => {
  const f = useCurrentFrame();
  const mo = (g: number) => g >= 55 && g < 96;
  return (
    <Shake hits={[96]} amp={14}>
      <NenHienTruong anh={NEN}>
        <div style={{position: 'absolute', left: tamO(0, 0).x - O / 2, top: tamO(0, 0).y - O / 2, width: 5 * O, height: O, background: 'rgba(125,211,252,.55)', borderRadius: 14}} />
        <Ke o={KE_LANH} />
        <Cua c={2} r={1} mo={mo} />
        <ODat ten="o-nut-de" c={1} r={3} />
        <Vat moc={[[0, 4, 4]]} />
        <Xe anh="kep-cam" moc={R_G4} doi={[[98, 'kep-cam-ngac']]} />
        <ChuNay chu="SẬP!" at={96} den={150} x={540} y={tamO(2, 1).y - 40} co={110} />
        <DongHo tu={GIO(14, 20)} />
        <NhanGoi so={4} ten="Kho lạnh" />
        <Tu dang="tu-tin" doiAnh={[[96, 'tu-hoang']]} says={[{at: 8, out: 92, text: 'Đơn quan trọng nhất ở trong kia.'}, {at: 100, out: 165, text: 'Ấy chết!'}]} x={260} side="right" />
        {f >= 165 ? <Luna says={[{at: 170, out: 280, text: 'Cửa mở lúc nào nhỉ Sola?'}]} mat={[[165, 'thinking']]} at={165} /> : null}
      </NenHienTruong>
    </Shake>
  );
};
const G4Nghi: React.FC = () => (
  <NenHienTruong anh={NEN}>
    <div style={{position: 'absolute', left: tamO(0, 0).x - O / 2, top: tamO(0, 0).y - O / 2, width: 5 * O, height: O, background: 'rgba(125,211,252,.55)', borderRadius: 14}} />
    <Ke o={KE_LANH} />
    <Cua c={2} r={1} mo={() => false} />
    <ODat ten="o-nut-de" c={1} r={3} />
    <Vat moc={[[0, 4, 4]]} />
    <Xe anh="kep-cam" moc={[[0, 2, 4.4, -90]]} />
    <VongSang c={4} r={4} at={30} />
    <VongSang c={1} r={3} at={60} />
    <DongHo tu={GIO(14, 25)} />
    <Sola says={[{at: 20, out: 160, text: 'À há! Kẹp thùng gỗ đặt đè lên nút sàn là giữ cửa kho lạnh mở suốt luôn!'}]} mat={[[0, 'thinking'], [60, 'excited']]} />
  </NenHienTruong>
);
const R_G4K: Moc[] = [
  [0, 1, 5, -90],
  [45, 1, 4, -90],
  [60, 1, 4, -90],
  [75, 1, 4, 0],
  [105, 2, 4, 0],
  [120, 2, 4, -90],
  [175, 2, 0.4, -90],
];
const G4Lam: React.FC = () => (
  <NenHienTruong anh={NEN}>
    <div style={{position: 'absolute', left: tamO(0, 0).x - O / 2, top: tamO(0, 0).y - O / 2, width: 5 * O, height: O, background: 'rgba(125,211,252,.55)', borderRadius: 14}} />
    <Ke o={KE_LANH} />
    <Cua c={2} r={1} mo={(g) => g >= 60} />
    <ODat ten="o-nut-de" c={1} r={3} />
    <Xe anh="kep-cam" moc={R_G4K} doi={[[150, 'kep-cam-vui']]} />
    <Vat moc={[[0, 1, 3], [61, 1, 3]]} bam={{moc: R_G4K, tu: 0, den: 60}} />
    <Burst at={60} x={tamO(2, 1).x} y={tamO(2, 1).y} color="#7DD3FC" />
    <DongHo tu={GIO(14, 40)} />
  </NenHienTruong>
);

/* ================================================================== GÓI 5 · Bánh lùi */
const NGO: [number, number][] = [[1, 0], [1, 1], [1, 2], [1, 3], [3, 0], [3, 1], [3, 2], [3, 3]];
const R_G5: Moc[] = [[0, 2, 5, -90], [20, 2, 5, -90], [70, 2, 0.62, -90], [85, 2, 0.62, -90], [105, 2, 0.62, -66], [118, 2, 0.62, -90], [133, 2, 0.62, -114], [146, 2, 0.62, -90]];
const G5Thu: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Shake hits={[106, 134]} amp={7}>
      <NenHienTruong anh={NEN}>
        <Ke o={NGO} />
        <Xe anh="kep-cam" moc={R_G5} doi={[[85, 'kep-cam-vui'], [107, 'kep-cam-ngac']]} />
        <Vat moc={[[0, 2, 0], [84, 2, 0]]} bam={{moc: R_G5, tu: 85}} />
        <ChuNay chu="KẸT!" at={146} den={200} x={790} y={tamO(2, 1).y} />
        <DongHo tu={GIO(15)} />
        <NhanGoi so={5} ten="Bánh lùi" />
        {f >= 150 ? <Tu says={[{at: 155, out: 250, text: 'Ngõ này xe nào vào cũng kẹt.'}]} at={150} /> : null}
      </NenHienTruong>
    </Shake>
  );
};
const R_G5K: Moc[] = [[0, 2, 0.62, -90], [20, 2, 0.62, -90], [110, 2, 4.8, -90]];
const G5Lam: React.FC = () => {
  const f = useCurrentFrame();
  const p = theoMoc(R_G5K, f), a = tamO(2, 0.62);
  return (
    <NenHienTruong anh={NEN}>
      <Ke o={NGO} />
      {[-0.3, 0.3].map((k) => <div key={k} style={{position: 'absolute', left: a.x + k * O - 6, top: a.y, width: 12, height: Math.max(0, p.y - a.y),
        background: `repeating-linear-gradient(${C.yellow} 0 16px, transparent 16px 28px)`}} />)}
      <Xe anh="kep-cam-vui" moc={R_G5K} />
      <Vat moc={[[0, 2, 0]]} bam={{moc: R_G5K, tu: 0}} />
      <ChuNay chu="LÙI!" at={30} den={110} x={820} y={tamO(2, 2).y} mau={C.sola} />
      <DongHo tu={GIO(15, 10)} />
    </NenHienTruong>
  );
};

/* ================================================================== GÓI 6 · Tay xoay (bước lùi) */
const TUONG6: [number, number][] = [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [4, 0], [4, 1], [4, 2], [4, 3], [4, 4]];
const R_G6: Moc[] = [[0, 2, 4, -90], [125, 2, 4, -90], [160, 2, 4, -135], [195, 2, 4, -180]];
const G6Thu: React.FC = () => {
  const f = useCurrentFrame();
  const truot = (c0: number, c: number, r: number, t: number): Moc[] => [[0, c0, r - 1.5], [t, c0, r - 1.5], [t + 22, c, r]];
  return (
    <Shake hits={[8, 20]} amp={18}>
      <NenHienTruong anh={NEN}>
        <Ke o={TUONG6} />
        <Vat moc={truot(0.2, 1, 1, 10)} mo={(g) => ease(g, [10, 16], [0, 1])} nghieng={(g) => ease(g, [10, 32], [-60, 8])} />
        <Vat moc={truot(3.8, 3, 2, 14)} mo={(g) => ease(g, [14, 20], [0, 1])} nghieng={(g) => ease(g, [14, 36], [70, -6])} />
        <Vat moc={truot(0.2, 1, 3, 18)} mo={(g) => ease(g, [18, 24], [0, 1])} nghieng={(g) => ease(g, [18, 40], [-40, 4])} />
        <Xe anh="kep-cam" moc={R_G6} />
        <ChuNay chu="RẦM!" at={8} den={60} x={540} y={300} co={110} />
        {f >= 165 ? <ChuNay chu="2 nhịp…" at={165} den={260} x={800} y={tamO(2, 3).y} mau={C.warn} co={80} /> : null}
        <DongHo tu={GIO(15, 20)} den={GIO(15, 50)} dai={300} />
        <NhanGoi so={6} ten="Tay xoay" />
        <Tu dang="tu-hoang" says={[{at: 34, out: 120, text: 'Kệ cũ sập rồi! Thùng tràn ra lối!'}]} />
        {f >= 196 ? <Sola says={[{at: 200, out: 300, text: 'Quay cả thân xe tốn 2 nhịp, trễ giờ xuất bến mất Luna ơi!'}]} mat={[[196, 'worried']]} at={196} /> : null}
      </NenHienTruong>
    </Shake>
  );
};
const R_G6K: Moc[] = [[0, 2, 3, -90], [130, 2, 3, -90], [175, 2, 0.8, -90]];
const G6Lam: React.FC = () => {
  const f = useCurrentFrame();
  const nhan = (chu: string, at: number, x: number) => f >= at && f < at + 40 ? (
    <div style={{position: 'absolute', left: x, top: tamO(2, 3).y - 150, padding: '8px 18px', borderRadius: 14, background: C.codeBg, color: '#F4F3FF',
      fontFamily: 'JetBrains Mono, monospace', fontSize: 34, fontWeight: 700, transform: 'translateX(-50%)'}}>{chu}</div>) : null;
  return (
    <NenHienTruong anh={NEN}>
      <Ke o={TUONG6} />
      <Vat moc={[[0, 1, 3], [20, 1, 3], [45, 2, 2.4]]} mo={(g) => ease(g, [50, 62], [1, 0])} />
      <Vat moc={[[0, 3, 3], [70, 3, 3], [95, 2, 2.4]]} mo={(g) => ease(g, [100, 112], [1, 0])} />
      <Xe anh="xoay-vui" moc={R_G6K} />
      {nhan('arm_left()', 10, tamO(1, 3).x)}
      {nhan('arm_right()', 60, tamO(3, 3).x)}
      <ChuNay chu="Xe đứng yên!" at={115} den={175} x={540} y={300} mau={C.sola} co={80} />
      <DongHo tu={GIO(15, 40)} />
    </NenHienTruong>
  );
};

/* ================================================================== GÓI 7 · Cảm biến bên */
const MECUNG: [number, number][] = [[0, 2], [1, 2], [2, 2], [3, 2], [0, 3], [0, 4], [1, 4], [3, 4], [4, 4]];
const R_G7: Moc[] = [[0, 2, 5.2, -90], [40, 2, 3, -90], [60, 2, 3, -90], [75, 2, 3, -180], [102, 1, 3, -180], [140, 1, 3, -180], [155, 1, 3, 0], [180, 2, 3, 0]];
const G7Thu: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <NenHienTruong anh={NEN}>
      <Ke o={MECUNG} />
      <ODat ten="o-co" c={4} r={1} />
      <Xe anh="kep-cam" moc={R_G7} doi={[[104, 'kep-cam-ngac'], [156, 'kep-cam']]} />
      <ChuNay chu="?" at={42} den={74} x={tamO(2, 3).x} y={tamO(2, 3).y - 150} mau={C.violet} />
      <ChuNay chu="NGÕ CỤT!" at={104} den={150} x={430} y={tamO(1, 3).y - 150} co={80} />
      <DongHo tu={GIO(16, 0)} den={GIO(16, 5)} dai={240} />
      <NhanGoi so={7} ten="Cảm biến bên" />
      <Sola says={[{at: 44, out: 100, text: 'Rẽ trái hay phải đây? Đoán đại… rẽ trái!'}, {at: 110, out: 220, text: 'Toang, đâm đầu vào ngõ cụt rồi!'}]} mat={[[0, 'thinking'], [44, 'confident'], [104, 'shocked']]} />
      {f >= 185 ? <Tu says={[{at: 188, out: 260, text: 'Lối ra bến ở đâu ta?'}]} at={185} /> : null}
    </NenHienTruong>
  );
};
const R_G7K: Moc[] = [[0, 2, 5.2, -90], [40, 2, 3, -90], [90, 2, 3, -90], [105, 2, 3, 0], [135, 4, 3, 0], [148, 4, 3, -90], [180, 4, 1.62, -90]];
const G7Lam: React.FC = () => {
  const f = useCurrentFrame();
  const p = tamO(2, 3);
  return (
    <NenHienTruong anh={NEN}>
      <Ke o={MECUNG} />
      <ODat ten="o-co" c={4} r={1} />
      {f >= 45 && f < 92 ? <>
        <Tia tu={{x: p.x - O * 0.3, y: p.y}} den={{x: tamO(0, 3).x + O * 0.5, y: p.y}} mau={C.bad} />
        <Tia tu={{x: p.x + O * 0.3, y: p.y}} den={{x: tamO(4, 3).x + O * 0.5, y: p.y}} mau={C.good} />
      </> : null}
      <Xe anh="du" moc={R_G7K} doi={[[182, 'du-vui']]} />
      <Burst at={182} x={tamO(4, 1).x} y={tamO(4, 1).y} color={C.yellow} />
      <DongHo tu={GIO(16, 5)} />
    </NenHienTruong>
  );
};

/* ================================================================== GÓI 8 · Bến xuất (yếu tố cũ) */
const BEN: [number, number][] = [[0, 1], [1, 1], [3, 1], [4, 1]];
const R_G8: Moc[] = [
  [0, 2, 5, -90],
  [25, 2, 3, -90],
  [45, 2, 4, -90],
  [55, 2, 4, 0],
  [80, 3, 4, 0],
  [92, 3, 4, -180],
  [120, 1, 4, -180],
  [132, 1, 4, 0],
  [150, 2, 4, 0],
  [162, 2, 4, -90],
  [185, 2, 3, -90],
];
const G8Thu: React.FC = () => {
  const f = useCurrentFrame();
  const mui8 = ease(f, [200, 270], [0, 1]);
  return (
    <NenHienTruong anh={NEN}>
      <div style={{position: 'absolute', left: tamO(0, 0).x - O / 2, top: tamO(0, 0).y - O / 2, width: 5 * O, height: O, background: 'rgba(250,204,21,.25)', borderRadius: 14}} />
      <Ke o={BEN} />
      <Cua c={2} r={1} mo={() => false} />
      <ODat ten="o-nut-de" c={1} r={3} />
      <ODat ten="o-dich" c={3} r={3} />
      {[[0, 5], [4, 5], [4, 3]].map(([c, r], i) => <Vat key={i} moc={[[0, c, r]]} />)}
      <Xe anh="du" moc={R_G8} />
      <ChuNay chu="BÍP BÍP!" at={60} den={130} x={540} y={250} mau={C.warn} co={90} />
      {mui8 > 0 ? (
        <svg style={{position: 'absolute', inset: 0, overflow: 'visible'}} width="100%" height="100%">
          <path d={`M ${tamO(0, 5).x} ${tamO(0, 5).y} L ${tamO(0, 3).x} ${tamO(0, 3).y} L ${tamO(2, 3).x} ${tamO(2, 3).y} L ${tamO(2, 1).x} ${tamO(2, 1).y}`}
            fill="none" stroke={C.luna} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDashoffset={1 - mui8} style={{strokeDasharray: `${mui8} 1`}} />
        </svg>
      ) : null}
      <DongHo tu={GIO(16)} den={GIO(16, 15)} dai={260} />
      <NhanGoi so={8} ten="Bến xuất" />
      <Sola says={[{at: 90, out: 190, text: 'Chạy từng việc rời rạc thế này tốn bước quá!'}]} mat={[[0, 'worried']]} />
      {f >= 195 ? <Luna says={[{at: 200, out: 320, text: 'Tối ưu lộ trình đi Sola: thùng đè nút giữ cửa cũng chính là kiện hàng chốt sổ đó!'}]} mat={[[195, 'magnifier']]} at={195} /> : null}
    </NenHienTruong>
  );
};
const R_G8K: Moc[] = [
  [0, 0, 4, -90],
  [10, 0, 4, -90],
  [28, 0, 3, -90],
  [38, 0, 3, 0],
  [48, 0.32, 3, 0],
  [60, 0, 3, 0],
  [70, 0, 3, 90],
  [86, 0, 4, 90],
  [96, 0, 4, 0],
  [116, 2, 4, 0],
  [126, 2, 4, -90],
  [158, 2, 0.4, -90],
];
const G8Lam: React.FC = () => (
  <NenHienTruong anh={NEN}>
    <div style={{position: 'absolute', left: tamO(0, 0).x - O / 2, top: tamO(0, 0).y - O / 2, width: 5 * O, height: O, background: 'rgba(250,204,21,.25)', borderRadius: 14}} />
    <Ke o={BEN} />
    <Cua c={2} r={1} mo={(g) => g >= 46} />
    <ODat ten="o-nut-de" c={1} r={3} />
    <Vat moc={[[0, 4, 5], [100, 4, 5], [120, 2, 0], [140, 2, 0]]} mo={(g) => ease(g, [120, 140], [1, 0])} />
    <Xe anh="du" moc={R_G8K} doi={[[150, 'du-vui']]} />
    <Vat moc={[[0, 0, 5], [9, 0, 5], [46, 1, 3]]} bam={{moc: R_G8K, tu: 10, den: 45}} />
    <ChuNay chu="1" at={46} den={90} x={tamO(1, 3).x} y={tamO(1, 3).y - 120} mau={C.violet} co={90} />
    <ChuNay chu="2" at={122} den={160} x={tamO(2, 0).x + 120} y={tamO(2, 0).y} mau={C.violet} co={90} />
    <DongHo tu={GIO(16, 20)} />
  </NenHienTruong>
);

/* ================================================================== GÓI 9 · R2 */
const R_G9: Moc[] = [
  [0, 2, 5, 0],
  [18, 3, 5, 0],
  [28, 3, 5, -90],
  [52, 3, 3, -90],
  [72, 3, 3, -90],
  [82, 3, 3, -180],
  [102, 2, 3, -180],
  [112, 2, 3, -90],
  [128, 2, 2.2, -90],
];
const G9Thu: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Shake hits={[101]} amp={12}>
      <NenHienTruong anh={NEN}>
        <div style={{position: 'absolute', left: tamO(0, 0).x - O / 2, top: tamO(0, 0).y - O / 2, width: 5 * O, height: O, background: 'rgba(125,211,252,.55)', borderRadius: 14}} />
        <Ke o={KE_LANH} />
        <Cua c={2} r={1} mo={(g) => g >= 50 && g < 100} />
        <ODat ten="o-nut-de" c={3} r={3} />
        <div style={{position: 'absolute', left: tamO(3, 3).x + 30, top: tamO(3, 3).y - 90, opacity: ease(f, [130, 150], [0, 1])}}>
          <Icon name="Ban" size={70} color={C.bad} stroke={3} />
        </div>
        <Xe anh="du" moc={R_G9} doi={[[102, 'du-ngac']]} />
        <ChuNay chu="SẬP!" at={100} den={150} x={540} y={tamO(2, 1).y - 40} co={110} />
        <DongHo tu={GIO(16, 30)} gap />
        <NhanGoi so={9} ten="R2" />
        <Sola says={[{at: 120, out: 250, text: 'Không còn thùng phụ để đè nút! R1 đứng đè nút thì không vào được, bước vào thì cửa sập!'}]} mat={[[0, 'confident'], [102, 'upset']]} />
      </NenHienTruong>
    </Shake>
  );
};
const R1_G9K: Moc[] = [[0, 2, 5, -90], [55, 2, 5, -90], [100, 2, 0.4, -90], [115, 2, 0.4, -90], [160, 2, 4, -90]];
const R2_G9K: Moc[] = [[0, 3, 5.2, -90], [40, 3, 3, -90]];
const G9Lam: React.FC = () => (
  <NenHienTruong anh={NEN}>
    <div style={{position: 'absolute', left: tamO(0, 0).x - O / 2, top: tamO(0, 0).y - O / 2, width: 5 * O, height: O, background: 'rgba(125,211,252,.55)', borderRadius: 14}} />
    <Ke o={KE_LANH} />
    <Cua c={2} r={1} mo={(g) => g >= 40} />
    <ODat ten="o-nut-de" c={3} r={3} />
    <Xe anh="r2" moc={R2_G9K} doi={[[42, 'r2-vui']]} />
    <Xe anh="du" moc={R1_G9K} doi={[[160, 'du-vui']]} />
    <Vat moc={[[0, 2, 0], [114, 2, 0]]} bam={{moc: R1_G9K, tu: 115}} />
    <CodeBox lines={['wait_n(4)', 'forward(4)', 'grab()']} x={60} y={1450} w={460} size={30} title="R1 · Sola" />
    <CodeBox lines={['forward(2)', 'stay()']} x={560} y={1450} w={460} size={30} title="R2 · Luna" />
    <DongHo tu={GIO(16, 40)} />
  </NenHienTruong>
);

/* ================================================================== GÓI 10 · Xuất xưởng (Mỗi màn phải giải đúng NHIỀU TRƯỜNG HỢP) */
const R_G10_TH1: Moc[] = [
  [0, 2, 4, -90],
  [18, 2, 4, -90],
  [52, 2, 2.6, -90],
  [68, 2, 2.6, -90],
  [105, 2, 0.6, -90],
];
const R_G10_TH2: Moc[] = [
  [140, 2, 5, -90],
  [158, 2, 5, -90],
  [192, 2, 2.6, -90],
];

/** Thanh hiển thị các Trường hợp (Test cases) của màn chơi Gói 10 trên đỉnh sân. */
const ThanhTruongHop: React.FC<{
  dangChay: 1 | 2 | 3;
  tt1: 'cho' | 'chay' | 'dat';
  tt2: 'cho' | 'chay' | 'thua' | 'dat';
  tt3?: 'cho' | 'chay' | 'dat';
}> = ({dangChay, tt1, tt2, tt3}) => {
  const the = (so: number, ten: string, tt: 'cho' | 'chay' | 'thua' | 'dat', active: boolean) => {
    const bg = tt === 'dat' ? '#16A34A' : tt === 'thua' ? '#DC2626' : active ? '#0284C7' : '#1E293B';
    const vi = active ? '#FDE047' : '#0F172A';
    const nhan = tt === 'dat' ? 'ĐẠT' : tt === 'thua' ? 'THUA' : tt === 'chay' ? 'ĐANG CHẠY' : 'CHỜ';
    const iconName = tt === 'dat' ? 'Check' : tt === 'thua' ? 'X' : tt === 'chay' ? 'Play' : 'Clock';
    return (
      <div key={so} style={{flex: 1, padding: '12px 16px', borderRadius: 18, background: bg, color: '#fff',
        border: `4px solid ${vi}`, boxShadow: active ? '0 0 20px rgba(253,224,71,0.65)' : `0 6px 0 ${C.ink}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, fontFamily: FONT, fontWeight: 900, fontSize: 24}}>
        <span>Trường hợp {so}: {ten}</span>
        <span style={{display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 10, background: 'rgba(15,23,42,0.35)', fontSize: 21}}>
          <Icon name={iconName} size={20} color="#fff" stroke={3} />
          {nhan}
        </span>
      </div>
    );
  };
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top: 155, display: 'flex', gap: 14, zIndex: 22}}>
      {the(1, 'Ca sáng', tt1, dangChay === 1)}
      {the(2, 'Ca chiều', tt2, dangChay === 2)}
      {tt3 ? the(3, 'Ca tối', tt3, dangChay === 3) : null}
    </div>
  );
};

const G10Mo: React.FC = () => {
  const f = useCurrentFrame();
  const sangTH2 = f >= 140;
  const tt1: 'cho' | 'chay' | 'dat' = f < 18 ? 'cho' : f < 110 ? 'chay' : 'dat';
  const tt2: 'cho' | 'chay' | 'thua' = f < 140 ? 'cho' : f < 192 ? 'chay' : 'thua';
  return (
    <Shake hits={[192]} amp={14}>
      <NenHienTruong anh={NEN}>
        <ThanhTruongHop dangChay={sangTH2 ? 2 : 1} tt1={tt1} tt2={tt2} tt3="cho" />

        {!sangTH2 ? (
          /* TRƯỜNG HỢP 1 (0..139): Thùng ở (2, 2), Ô đích ở (2, 0) -> Đếm cứng chạy ĐẠT */
          <>
            <Ke o={[[0, 1], [4, 1], [0, 3], [4, 3]]} />
            <ODat ten="o-dich" c={2} r={0} />
            <Xe anh="du" moc={R_G10_TH1} doi={[[108, 'du-vui']]} />
            <Vat moc={[[0, 2, 2], [58, 2, 2]]} bam={{moc: R_G10_TH1, tu: 58, den: 108}} />
            <ChuNay chu="TH1: ĐẠT!" at={108} den={138} x={540} y={320} mau={C.good} co={82} />
          </>
        ) : (
          /* TRƯỜNG HỢP 2 (140..300): Vị trí thùng đổi sang (3, 3), kệ chắn ngay (2, 2) -> Code đếm cứng đâm thẳng vào kệ! */
          <>
            <Ke o={[[0, 1], [2, 2], [4, 1], [0, 3]]} />
            <ODat ten="o-dich" c={4} r={2} />
            <Vat moc={[[0, 3, 3]]} />
            <Xe anh="du" moc={R_G10_TH2} doi={[[192, 'du-ngac']]} />
            <ChuNay chu="TH2: SAI VỊ TRÍ!" at={192} den={290} x={540} y={320} mau={C.bad} co={78} />
          </>
        )}

        <CodeBox
          lines={['# Code đếm bước cứng:', 'forward(2); grab()', 'forward(2); release()']}
          x={55} y={960} w={540} size={26} title="mat_lenh.py (chỉ đúng TH1)"
          hl={sangTH2 && f >= 192 ? 1 : undefined}
        />

        <DongHo tu={GIO(16, 50)} den={GIO(16, 52)} gap />
        <NhanGoi so={10} ten="Xuất xưởng" />
        {f < 135 ? (
          <Tu dang="tu-sot-ruot" says={[{at: 8, out: 130, text: 'Từ giờ mỗi màn có nhiều ca làm việc, mỗi trường hợp kho lại xếp hàng một kiểu khác nhau đấy!'}]} />
        ) : null}
        {f >= 145 && f < 225 ? (
          <Sola says={[{at: 148, out: 222, text: 'Ủa! Code vừa pass Test Case 1 ngon lành, sao sang Ca 2 đổi vị trí thùng là gãy ngay?!'}]}
            mat={[[145, 'surprised-sach'], [192, 'upset']]} />
        ) : null}
        {f >= 225 ? (
          <Luna says={[{at: 228, out: 298, text: 'Chuẩn bài thi thực chiến đó: MỘT đoạn code của cậu phải tự cân đẹp TẤT CẢ các test case!'}]}
            mat={[[225, 'magnifier']]} at={225} />
        ) : null}
      </NenHienTruong>
    </Shake>
  );
};

const ThaTay: React.FC = () => {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  const p1 = pop(f, 20, fps, 10);
  const p2 = pop(f, 55, fps, 10);
  const p3 = pop(f, 90, fps, 10);
  const pChot = pop(f, 125, fps, 10);

  const theTH = (so: number, tieuDe: string, moTa: string, p: number, mau: string) => (
    <div key={so} style={{
      flex: 1, background: '#0F172A', borderRadius: 24, border: `4px solid ${mau}`,
      padding: '20px 18px', color: '#fff', transform: `scale(${0.75 + 0.25 * p})`, opacity: Math.min(1, p * 2),
      boxShadow: '0 14px 30px rgba(15,23,42,0.45)', display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <span style={{padding: '6px 14px', borderRadius: 12, background: mau, color: '#0F172A', fontWeight: 900, fontSize: 24}}>
          TRƯỜNG HỢP {so}
        </span>
        <Icon name="CircleCheck" size={36} color="#4ADE80" stroke={3} />
      </div>
      <div style={{fontSize: 28, fontWeight: 900, color: '#F8FAFC'}}>{tieuDe}</div>
      <div style={{fontSize: 23, fontWeight: 700, color: '#CBD5E1', lineHeight: 1.3}}>{moTa}</div>
      <div style={{marginTop: 'auto', padding: '8px 12px', borderRadius: 12, background: 'rgba(34,197,94,0.18)',
        border: '2px solid #4ADE80', color: '#4ADE80', fontWeight: 900, fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8}}>
        <Icon name="Check" size={24} color="#4ADE80" stroke={3} />
        <span>ĐẠT</span>
      </div>
    </div>
  );

  return (
    <AbsoluteFill style={{background: '#0F172A', fontFamily: FONT, overflow: 'hidden'}}>
      <Img src={staticFile('nen-doc/trong-xe.jpg')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(15,23,42,0.88) 0%, rgba(15,23,42,0.55) 55%, rgba(15,23,42,0.88) 100%)'}} />

      {/* Tiêu đề Luật Gói 10 */}
      <div style={{position: 'absolute', left: 45, right: 45, top: 48, padding: '18px 28px', borderRadius: 22,
        background: '#1E293B', border: '3px solid #38BDF8', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 12px 28px rgba(0,0,0,0.4)'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
          <Icon name="Layers" size={36} color="#38BDF8" stroke={2.8} />
          <span style={{fontSize: 30, fontWeight: 900, color: '#FFFFFF'}}>LUẬT GÓI 10 · 1 CODE GIẢI NHIỀU TRƯỜNG HỢP</span>
        </div>
      </div>

      {/* Hộp 1 Chương trình tổng quát duy nhất */}
      <div style={{position: 'absolute', left: 65, right: 65, top: 175, padding: '22px 28px', borderRadius: 26,
        background: '#0F172A', border: '4px solid #FDE047', boxShadow: '0 16px 36px rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24}}>
        <div>
          <div style={{color: '#FDE047', fontWeight: 900, fontSize: 26, marginBottom: 8, letterSpacing: '0.03em'}}>
            1 CHƯƠNG TRÌNH TỔNG QUÁT DUY NHẤT
          </div>
          <div style={{fontFamily: MONO, fontSize: 28, fontWeight: 700, color: '#E2E8F0', lineHeight: 1.45}}>
            while front_clear(): forward()<br />
            if left_clear(): turn_left()
          </div>
        </div>
        <div style={{padding: '14px 22px', borderRadius: 18, background: '#FEF08A', color: '#0F172A', fontWeight: 900, fontSize: 26, textAlign: 'center'}}>
          Dùng cảm biến<br />&amp; vòng lặp
        </div>
      </div>

      {/* 3 thẻ Trường hợp 1, 2, 3 */}
      <div style={{position: 'absolute', left: 45, right: 45, top: 430, height: 340, display: 'flex', gap: 18}}>
        {theTH(1, 'Thùng ở gần', 'Khoảng cách 2 ô, lối rẽ bên trái', p1, '#38BDF8')}
        {theTH(2, 'Thùng ở xa', 'Khoảng cách 4 ô, lối rẽ bên phải', p2, '#A78BFA')}
        {theTH(3, 'Đổi vị trí cửa', 'Nút đè & đích đổi sang cột khác', p3, '#F472B6')}
      </div>

      {/* Huy hiệu tổng kết điều kiện thắng */}
      {f >= 125 ? (
        <div style={{position: 'absolute', left: 85, right: 85, top: 810, padding: '20px 28px', borderRadius: 24,
          background: '#16A34A', border: '4px solid #FFFFFF', color: '#FFFFFF', fontWeight: 900, fontSize: 34,
          textAlign: 'center', transform: `scale(${0.8 + 0.2 * pChot})`, boxShadow: '0 16px 36px rgba(22,163,74,0.5)'}}>
          VƯỢT QUA CẢ 3/3 TRƯỜNG HỢP = CHIẾN THẮNG!
        </div>
      ) : null}

      <Mascot who="sola" x={240} h={520} at={0} faces={[[0, 'thinking'], [90, 'confident']]}
        says={[{at: 10, out: 115, text: 'Bỏ vụ đếm bước cứng (hardcode) thôi! Dùng cảm biến + vòng lặp để R1 tự ứng biến mọi map!'}]}
        bubbleW={570} bubbleTop={1260} />
      <Mascot who="luna" x={840} h={520} at={6} faces={[[0, 'confident'], [120, 'cheer']]} side="left" lat
        says={[{at: 120, out: 235, text: 'Chỉ một lần bấm Chạy, code của cậu phải clear gọn cả 3 ca làm việc liên tiếp nha!'}]}
        bubbleW={570} bubbleTop={1260} />
    </AbsoluteFill>
  );
};
const R_G10A: Moc[] = [[0, 1, 5, -90], [35, 1, 4, -90], [45, 1, 4, -90], [58, 1, 4, 0], [82, 2, 4, 0], [94, 2, 4, -90], [130, 2, 0.4, -90]];
const G10Kho: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <NenHienTruong anh={NEN}>
      <ThanhTruongHop dangChay={1} tt1={f >= 125 ? 'dat' : 'chay'} tt2="cho" />
      <div style={{position: 'absolute', left: tamO(0, 0).x - O / 2, top: tamO(0, 0).y - O / 2, width: 5 * O, height: O, background: 'rgba(125,211,252,.55)', borderRadius: 14}} />
      <Ke o={KE_LANH} />
      <Cua c={2} r={1} mo={(g) => g >= 45} />
      <ODat ten="o-nut-de" c={1} r={3} />
      <Xe anh="du" moc={R_G10A} />
      <Vat moc={[[0, 1, 3], [46, 1, 3]]} bam={{moc: R_G10A, tu: 0, den: 45}} />
      <DongHo tu={GIO(16, 52)} gap />
      <NhanGoi so={10} ten="Trường hợp 1/2" />
    </NenHienTruong>
  );
};
const R_G10B: Moc[] = [[0, 2, 5, -90], [35, 2, 3, -90], [60, 2, 3, -90], [72, 2, 3, 0], [100, 4, 3, 0], [112, 4, 3, -90], [150, 4, 1.62, -90]];
const G10MeCung: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <NenHienTruong anh={NEN}>
      <ThanhTruongHop dangChay={2} tt1="dat" tt2={f >= 145 ? 'dat' : 'chay'} />
      <Ke o={[[0, 3], [1, 4], [3, 4], [0, 4], [4, 4], [1, 2], [3, 2]]} />
      <ODat ten="o-co" c={4} r={1} />
      <Vat moc={[[0, 2, 1.2], [20, 2, 1.2], [34, 2, 2.6]]} nghieng={(g) => ease(g, [20, 34], [-40, 6])} />
      {f >= 36 && f < 62 ? <Tia tu={mui(R_G10B, f)} den={{x: tamO(2, 2.6).x, y: tamO(2, 2.6).y + O * 0.45}} mau={C.bad} /> : null}
      <ChuNay chu="!" at={36} den={62} x={tamO(2, 3.62).x + 130} y={tamO(2, 3.62).y - 80} mau={C.bad} />
      <Xe anh="du" moc={R_G10B} doi={[[152, 'du-vui']]} />
      <DongHo tu={GIO(16, 56)} gap />
      <NhanGoi so={10} ten="Trường hợp 2/2" />
    </NenHienTruong>
  );
};
const XuatXuong: React.FC = () => {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  const tem = pop(f, 60, fps, 8);
  const PART = ['Hai bánh xe · lùi được', 'Tay kẹp · xoay được', 'Mắt khoảng cách · nhìn hai bên'];
  return (
    <Shake hits={[62]} amp={14}>
      <AbsoluteFill style={{background: '#1E3A8A', fontFamily: FONT, backgroundImage: 'linear-gradient(rgba(255,255,255,.08) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,.08) 2px, transparent 2px)', backgroundSize: '60px 60px'}}>
        <div style={{position: 'absolute', top: 170, left: 0, right: 0, textAlign: 'center', color: '#fff', fontWeight: 900, fontSize: 76}}>Xe chở hàng R1</div>
        <div style={{position: 'absolute', left: 540 - 560, top: 220, width: 1120, height: 1120, transform: `rotate(-90deg) scale(${1 + 0.02 * Math.sin(f / 10)})`}}>
          <Img src={staticFile('robot/m1/kep-cam-vui.png')} style={{width: 1120, height: 1120}} />
        </div>
        {PART.map((p, i) => (
          <div key={p} style={{position: 'absolute', left: 140, right: 140, top: 1150 + i * 110, opacity: ease(f, [10 + i * 10, 22 + i * 10], [0, 1]), padding: '18px 28px', borderRadius: 20,
            background: 'rgba(255,255,255,.12)', border: '3px solid rgba(255,255,255,.5)', color: '#fff', fontWeight: 800, fontSize: 40, display: 'flex', gap: 18, alignItems: 'center'}}>
            <Icon name="CircleCheck" size={44} color={C.yellow} />{p}</div>
        ))}
        {f >= 54 ? (
          <div style={{position: 'absolute', left: 540, top: 760, transform: `translate(-50%, -50%) rotate(-14deg) scale(${2.4 - 1.4 * tem})`, opacity: Math.min(1, tem * 2),
            padding: '18px 44px', border: `12px solid ${C.bad}`, borderRadius: 24, color: C.bad, fontWeight: 900, fontSize: 110, letterSpacing: '0.06em', background: 'rgba(255,255,255,.9)', whiteSpace: 'nowrap'}}>XUẤT XƯỞNG</div>
        ) : null}
        <div style={{position: 'absolute', left: 80, right: 80, top: 1520, textAlign: 'center', color: '#E0E7FF', fontWeight: 700, fontSize: 40, lineHeight: 1.35, opacity: ease(f, [100, 120], [0, 1])}}>
          Thân xe ở lại kho làm việc.<br />Bộ não R1 về xe trạm, đi tiếp.</div>
      </AbsoluteFill>
    </Shake>
  );
};
const NgoaiDoi: React.FC = () => {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  const THE = [
    {icon: 'Warehouse' as const, ten: 'Robot Kho Hàng Tự Hành (AGV / AMR)', mo: 'Chui dưới kệ hàng nặng hàng trăm kg, nâng cả kệ chạy thẳng tới bàn đóng gói.'},
    {icon: 'Radar' as const, ten: 'Cảm Biến LiDAR & Tránh Va Chạm', mo: 'Quét laser 360 độ quanh thân xe để tự phanh và rẽ nhánh khi gặp chướng ngại.'},
  ];
  return (
    <NenHienTruong anh={NEN} mua="m1" luoi={false} toi={0.58}>
      <div style={{position: 'absolute', left: 40, top: 120, right: 40, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 48, color: C.yellow, textShadow: `0 6px 0 ${C.ink}`}}>
        CÔNG NGHỆ NGOÀI ĐỜI THỰC · M1
      </div>

      {/* Hero Showcase: Robot R1 của mùa -> Công nghệ thực tế (top: 210 .. 490) */}
      <div style={{position: 'absolute', left: 50, right: 50, top: 210, height: 275, borderRadius: 32,
        background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', border: `6px solid ${C.ink}`,
        boxShadow: `0 14px 0 ${C.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 34px',
        transform: `scale(${pop(f, 6, fps)})`, boxSizing: 'border-box'}}>
        <div style={{width: 225, height: 225, borderRadius: 28, background: 'rgba(255,255,255,0.08)', border: `4px solid ${C.yellow}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
          <Img src={staticFile('robot/m1/kep-cam-vui.png')} style={{width: 205, height: 205, objectFit: 'contain', transform: 'rotate(-90deg)'}} />
        </div>
        <div style={{flex: 1, marginLeft: 28, fontFamily: FONT, color: '#fff'}}>
          <div style={{display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 99, background: '#2563EB',
            border: '3px solid #fff', fontSize: 22, fontWeight: 900, marginBottom: 10}}>
            TỪ SA BÀN CLB RA THỰC TẾ
          </div>
          <div style={{fontSize: 38, fontWeight: 900, color: '#FDE047', marginBottom: 6}}>Xe Kho Tự Hành R1</div>
          <div style={{fontSize: 26, fontWeight: 700, color: '#E2E8F0', lineHeight: 1.3}}>Tự dò khoảng cách, xoay tay kẹp và lùi xe vượt ngõ cụt trong kho hàng.</div>
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
      <Luna mat={[[0, 'happy']]} says={[{at: 14, out: 142, text: 'Code cảm biến của tụi mình y hệt nguyên lý dàn robot tự hành trong siêu kho logistics ngoài đời luôn!'}]} />
    </NenHienTruong>
  );
};
const NhaMua2: React.FC = () => {
  const f = useCurrentFrame();
  const y = ease(f, [0, 120], [-1724, -3200]);
  const rung = Math.floor(f / 3) % 2 ? 5 : -5;
  return (
    <AbsoluteFill style={{background: '#9BD27A', fontFamily: FONT, overflow: 'hidden'}}>
      <Img src={staticFile('ban-do/dai-9.jpg')} style={{position: 'absolute', left: 0, top: y, width: 1080}} />
      <AbsoluteFill style={{background: 'rgba(15,23,42,0.28)'}} />

      {/* Header chuyển trạm */}
      <div style={{position: 'absolute', left: 45, right: 45, top: 80, padding: '20px 28px', borderRadius: 26,
        background: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)', border: `5px solid #FDE047`,
        boxShadow: `0 10px 0 ${C.ink}`, textAlign: 'center', color: '#FDE047', fontWeight: 900, fontSize: 38}}>
        CHUYỂN TRẠM CHIẾN DỊCH · LÊN ĐƯỜNG SANG MÙA 2!
      </div>

      {/* Khung Hero trung tâm: Xe Trạm CLB + Chân dung Cô Hạnh cỡ lớn (top: 230 .. 830) */}
      <div style={{position: 'absolute', left: 45, right: 45, top: 230, height: 590, borderRadius: 36,
        background: 'linear-gradient(180deg, rgba(15,23,42,0.92) 0%, rgba(30,41,59,0.94) 100%)',
        border: `6px solid ${C.ink}`, boxShadow: `0 16px 0 ${C.ink}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around', padding: '28px 34px', boxSizing: 'border-box'}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-around', width: '100%'}}>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
            <Img src={staticFile('robot/xe-tram-a.png')} style={{width: 320, height: 270, objectFit: 'contain',
              transform: `translateY(${Math.sin(f / 5) * 6}px)`}} />
            <span style={{padding: '8px 22px', borderRadius: 14, background: '#38BDF8', color: C.ink, fontWeight: 900, fontSize: 24, border: `3.5px solid ${C.ink}`}}>
              XE TRẠM CLB LĂN BÁNH
            </span>
          </div>
          <div style={{width: 280, height: 280, borderRadius: 32, background: '#FEE2E2', border: `6px solid #EF4444`,
            boxShadow: `0 10px 0 ${C.ink}`, overflow: 'hidden', transform: `translateX(${f > 25 && f < 75 ? rung : 0}px)`}}>
            <Img src={staticFile('nguoi/hanh-hoang.png')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 10%'}} />
          </div>
        </div>
        <div style={{padding: '14px 28px', borderRadius: 20, background: '#DC2626', color: '#fff', fontWeight: 900, fontSize: 30,
          border: '3.5px solid #fff', display: 'flex', alignItems: 'center', gap: 14}}>
          <Icon name="Radio" size={36} color="#FDE047" />
          <span>TÍN HIỆU CỨU HỘ KHẨN CẤP TỪ NHÀ MÁY CÔ HẠNH!</span>
        </div>
      </div>

      {/* Thẻ thoại SOS cỡ lớn phía dưới (top: 870 .. 1200) */}
      <div style={{position: 'absolute', left: 45, right: 45, top: 870, transform: `translateX(${f > 30 && f < 65 ? rung : 0}px)`, opacity: ease(f, [15, 35], [0, 1]),
        background: '#FEF2F2', borderRadius: 34, border: `6px solid ${C.ink}`, boxShadow: `0 16px 0 ${C.ink}`, padding: '32px 36px', display: 'flex', gap: 26, alignItems: 'center'}}>
        <div style={{width: 120, height: 120, borderRadius: 26, background: '#EF4444', border: `4px solid ${C.ink}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
          <Icon name="Flame" size={72} color="#FDE047" />
        </div>
        <div>
          <div style={{fontSize: 24, fontWeight: 900, color: '#DC2626', marginBottom: 6}}>ĐIỂM NÓNG TIẾP THEO · MÙA 2</div>
          <div style={{fontSize: 40, fontWeight: 900, color: C.ink, lineHeight: 1.28}}>
            "Rè… rè… Nhà máy hơi nước đang quá áp, CLB Robot ứng cứu cô Hạnh với!"
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== danh sách phim */
const mo = (so: number, ten: string, canh: Phim['canh']): Phim => ({id: `M1G${so}-Mo`, doc: true, canh});
const ket = (so: number, canh: Phim['canh']): Phim => ({id: `M1G${so}-Ket`, doc: true, canh});
const tt = (so: number, ten: string, gio: number, loi: string, khu: [boolean, boolean, boolean], xoa?: number) => ({
  id: `thanh-tuu-${so}`, dur: 205, el: <ThanhTuu moi={so - 1} loi={loi} gio={gio} so={so} ten={ten} khu={khu} xoa={xoa} />,
  sfx: [[22, 'ding.wav', 0.5]] as any,
});
const xe = (anh: string, sola: string, luna: string, tenPart: string, cach = 125, nangCap?: LoaiNangCap) => ({
  id: 'trong-xe', dur: cach + 95,
  el: <TrongXe anh={anh} cach={cach} tenPart={tenPart} nangCap={nangCap}
    sola={[{at: 10, out: 76, text: sola}]} luna={[{at: 82, out: cach + 85, text: luna}]}
    solaMat={[[0, 'thinking'], [82, 'excited']]} lunaMat={[[0, 'confident'], [82, 'happy']]} />,
  sfx: [[cach, 'impact.wav', 0.5], [cach, 'ding.wav', 0.4]] as any,
});
const treo = (anh: string, cau: string, so: number, ten: string) => ({
  id: 'cau-treo', dur: 110, el: <CauTreo anh={anh} cau={cau} so={so} ten={ten} />, sfx: [W_IN, [40, 'pop.wav', 0.4]] as any,
});

export const PHIM_M1: Phim[] = [
  mo(1, 'Hai bánh xe', [
    {id: 'kho', dur: 270, el: <G1Mo />, sfx: [W_IN]},
    xe('r1', 'Khung R1 mới có bộ não thôi, chưa có bánh xe để lăn bánh!', 'Để tớ độ ngay cụm Hai bánh xe cho R1 phóng vèo vèo nhé!', 'Hai bánh xe', 120),
    ...CANH_LAB_XE,
  ]),
  mo(2, 'Tay kẹp', [
    tt(1, 'Hai bánh xe', GIO(13, 10), 'Ờ, R1 biết chạy rồi đấy. Qua dọn đống thùng bên kia xem!', [false, false, false]),
    {id: 'thu', dur: 280, el: <G2Thu />, sfx: [[60, 'whoosh-soft.wav', 0.3], [94, 'impact.wav', 0.7]]},
    xe('kep', 'R1 mới biết chạy thôi, húc vào thùng là văng tứ tung!', 'Để tớ độ thêm Tay kẹp cơ khí cho R1 gắp thùng đặt chuẩn từng ô nhé!', 'Tay kẹp', 120),
    ...CANH_LAB_TAY_KEP,
  ]),
  mo(3, 'Cảm biến khoảng cách', [
    {id: 'lam-g2', dur: 175, el: <G2Lam />, sfx: [[55, 'click.wav', 0.6], [152, 'ding.wav', 0.4]]},
    tt(2, 'Tay kẹp', GIO(13, 30), 'Nhấc lên đặt xuống gọn ghê! Giờ dọn tiếp khu giữa kho nhé!', [true, false, false]),
    {id: 'thu', dur: 300, el: <G3Thu />, sfx: [[84, 'wrong.wav', 0.5], [223, 'impact.wav', 0.5]]},
    xe('kep-cam', 'Thùng mỗi lúc một chỗ, đếm sao kịp?', 'Cho R1 tự nhìn phía trước!', 'Mắt khoảng cách', 120),
    ...CANH_LAB_KC_TRUOC,
  ]),
  mo(4, 'Kho lạnh', [
    {id: 'lam-g3', dur: 130, el: <G3Lam />},
    tt(3, 'Cảm biến', GIO(14), 'Dời đâu cũng tìm ra, giỏi! Giờ vào kho lạnh lấy đơn gấp nhé!', [true, false, false]),
    {id: 'thu', dur: 290, el: <G4Thu />, sfx: [[55, 'click.wav', 0.6], [96, 'impact.wav', 0.7]]},
    {id: 'nghi', dur: 170, el: <G4Nghi />, sfx: [[30, 'pop.wav', 0.3], [60, 'pop.wav', 0.3]]},
    treo('kep-cam', 'Lấy thùng đè nút mở cửa kho lạnh nào!', 4, 'Kho lạnh'),
  ]),
  mo(5, 'Bánh lùi', [
    {id: 'lam-g4', dur: 180, el: <G4Lam />, sfx: [[60, 'ding.wav', 0.4]]},
    tt(4, 'Kho lạnh', GIO(14, 40), 'Biết giữ cửa kho lạnh rồi! Còn kiện hàng nằm sâu trong ngõ cụt kìa.', [true, true, false]),
    {id: 'thu', dur: 260, el: <G5Thu />, sfx: [[106, 'impact.wav', 0.3], [134, 'impact.wav', 0.3], [146, 'wrong.wav', 0.5]]},
    xe('kep-cam', 'Ngõ cụt hẹp quá không quay đầu được, mà bánh xe chỉ biết tiến tới!', 'Tớ nâng cấp mạch đảo chiều cho Hai bánh xe để R1 chạy lùi nhé!', 'Bánh lùi', 115, 'banh-lui'),
    {id: 'lab-banh-lui', dur: 240, el: <CanhBanhLuiLab />, sfx: [[15, 'type.wav', 0.5, 40], [62, 'click.wav', 0.8], [168, 'ding.wav', 0.5]]},
    treo('kep-cam', 'Cài số lùi thoát khỏi ngõ cụt nào!', 5, 'Bánh lùi'),
  ]),
  mo(6, 'Tay xoay', [
    {id: 'lam-g5', dur: 120, el: <G5Lam />, sfx: [[30, 'swish.wav', 0.4]]},
    tt(5, 'Bánh lùi', GIO(15, 10), 'Lùi ra khỏi ngõ cụt gọn gàng!', [true, true, false]),
    {id: 'thu', dur: 300, el: <G6Thu />, sfx: [[8, 'impact.wav', 0.8], [165, 'wrong.wav', 0.4]]},
    xe('xoay', 'Quay cả thân xe sang hai bên tốn tới 2 nhịp, chậm quá!', 'Tớ mở khóa khớp xoay cổ tay cho Tay kẹp để chỉ cần quay tay thôi!', 'Tay xoay', 120, 'tay-xoay'),
    ...CANH_LAB_TAY_XOAY,
    treo('xoay', 'Xe đứng yên, tay quay!', 6, 'Tay xoay'),
  ]),
  mo(7, 'Cảm biến bên', [
    {id: 'lam-g6', dur: 180, el: <G6Lam />, sfx: [[45, 'click.wav', 0.5], [95, 'click.wav', 0.5]]},
    tt(6, 'Tay xoay', GIO(15, 40), 'Thông lối kệ đổ rồi! Nhưng đường ra bến xuất thành mê cung kìa!', [true, true, false]),
    {id: 'thu', dur: 270, el: <G7Thu />, sfx: [[104, 'wrong.wav', 0.5]]},
    xe('du', 'Mắt khoảng cách mới nhìn được phía trước, sao biết bên hông nào trống?', 'Tớ nâng cấp góc quét hai bên hông cho Mắt khoảng cách nhé!', 'Dò hai bên', 120, 'cam-ben'),
    ...CANH_LAB_KC_BEN,
    treo('du', 'Quét cảm biến hai bên trước khi rẽ nhé!', 7, 'Cảm biến bên'),
  ]),
  mo(8, 'Bến xuất', [
    {id: 'lam-g7', dur: 190, el: <G7Lam />, sfx: [[45, 'pop.wav', 0.3], [182, 'ding.wav', 0.4]]},
    tt(7, 'Cảm biến bên', GIO(16, 5), 'Vượt mê cung kệ ngon lành! Ra thẳng bến xuất gom hàng lên xe thôi!', [true, true, false]),
    {id: 'thu', dur: 330, el: <G8Thu />, sfx: [[60, 'wrong.wav', 0.4], [200, 'swish.wav', 0.3]]},
    treo('du', 'Tối ưu thứ tự gom hàng ra bến xuất nào!', 8, 'Bến xuất'),
  ]),
  mo(9, 'R2', [
    {id: 'lam-g8', dur: 165, el: <G8Lam />, sfx: [[46, 'click.wav', 0.5], [122, 'ding.wav', 0.4]]},
    tt(8, 'Bến xuất', GIO(16, 20), 'Bến xuất gọn rồi! Còn đơn kho lạnh cuối cùng nữa thôi!', [true, true, true]),
    {id: 'thu', dur: 260, el: <G9Thu />, sfx: [[50, 'click.wav', 0.6], [100, 'impact.wav', 0.7]]},
    xe('r2', 'Trên kệ CLB còn dư một bộ khung hai bánh kìa Luna!', 'Quất luôn! Lắp thành chiến hữu R2 chạy song song với R1!', 'R2 của Luna', 115),
    treo('r2', 'Lập trình song song cho bộ đôi R1 & R2 nhé!', 9, 'R2'),
  ]),
  mo(10, 'Xuất xưởng', [
    {id: 'lam-g9', dur: 175, el: <G9Lam />, sfx: [[40, 'click.wav', 0.5], [115, 'click.wav', 0.5]]},
    tt(9, 'R2', GIO(16, 40), 'Hai đứa phối hợp ăn ý quá! Còn 10 phút cuối trước khi xe tải chạy!', [true, true, true]),
    {id: 'kho', dur: 300, el: <G10Mo />, sfx: [W_IN, [108, 'ding.wav', 0.45], [192, 'wrong.wav', 0.55]]},
    {id: 'tha-tay', dur: 240, el: <ThaTay />, sfx: [[20, 'pop.wav', 0.35], [55, 'pop.wav', 0.35], [90, 'pop.wav', 0.35], [125, 'ding.wav', 0.5]]},
    treo('du', 'Viết 1 code tổng quát cân đẹp mọi Test Case!', 10, 'Xuất xưởng'),
  ]),
  ket(10, [
    {id: 'kho-lanh', dur: 140, el: <G10Kho />, sfx: [[45, 'click.wav', 0.5]]},
    {id: 'me-cung', dur: 165, el: <G10MeCung />, sfx: [[36, 'wrong.wav', 0.4], [152, 'ding.wav', 0.4]]},
    tt(10, 'Xuất xưởng', GIO(16, 59), 'Kịp giờ! Cảm ơn hai cháu!', [true, true, true]),
    {id: 'xuat-xuong', dur: 180, el: <XuatXuong />, sfx: [[60, 'impact.wav', 0.8], [62, 'ding.wav', 0.5]]},
    {id: 'ngoai-doi', dur: 150, el: <NgoaiDoi />, sfx: [W_IN]},
    {id: 'nha', dur: 150, el: <NhaMua2 />, sfx: [[30, 'glitch.wav', 0.4]]},
  ]),
];
