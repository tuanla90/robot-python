// 10 phim gói mùa 1 "Kho hàng", khổ dọc, theo hoc/KICH-BAN-PHIM-GOI-CLB.md bản 2 mục 2:
// mỗi gói hai phim: M1G<n>-Mo (phim mở: nhu cầu → thử, không được → Luna chế part → câu treo) và M1G<n>-Ket (đoạn kết sau màn trùm: làm thật → thành tựu).
// Gói 1: M1G1-Mo là đoạn dẫn ngắn, phim dạy rẽ bánh đầy đủ vẫn là PhimXe (ngoại lệ đã chốt).
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Burst, C, CodeBox, FONT, Icon, Mascot, Say, Shake, ease, pop} from '../d10';
import {Phim, W_IN} from '../may-phim';
import {BangViec, CauTreo, ChuNay, DongHo, Moc, NenHienTruong, NhanGoi, Nguoi, O, ODat, TrongXe, Vat, Xe, tamO, theoMoc} from './kit-doc';

const NEN = 'nen-doc/mua-1.png';
const DON = ['Dạy xe chạy', 'Dọn lối', 'Thùng chạy chỗ', 'Kho lạnh', 'Ngõ cụt', 'Lối hẹp hai bên', 'Mê cung kệ', 'Bến xuất', 'Đơn kho lạnh cuối', 'Xe tải lên đường'];
const GIO = (h: number, m = 0) => h * 60 + m;

/** Chú Tư thủ kho (ảnh TopView bản a; user chọn bản a / b sau). */
const Tu: React.FC<{says: Say[]; at?: number; x?: number; side?: 'left' | 'right'}> = ({says, at = 0, x = 820, side = 'left'}) => (
  <Nguoi anh="tu-a" ten="CHÚ TƯ" mau="#EA580C" x={x} h={600} at={at} says={says} side={side} bubbleW={560} bubbleTop={1230} />
);
const Sola: React.FC<{says: Say[]; mat: [number, string][]; at?: number; x?: number}> = ({says, mat, at = 0, x = 240}) => (
  <Mascot who="sola" x={x} h={540} at={at} faces={mat} says={says} bubbleW={520} bubbleTop={1240} />
);
const Luna: React.FC<{says: Say[]; mat: [number, string][]; at?: number; x?: number}> = ({says, mat, at = 0, x = 840}) => (
  <Mascot who="luna" x={x} h={540} at={at} faces={mat} says={says} side="left" bubbleW={520} bubbleTop={1240} lat />
);

/** Đoạn kết chung: nền kho tối, bảng đơn hàng gạch thêm một dòng, chú Tư nói một câu. */
const ThanhTuu: React.FC<{moi: number; loi: string; gio: number; so: number; ten: string}> = ({moi, loi, gio, so, ten}) => (
  <NenHienTruong anh={NEN} luoi={false} toi={0.5}>
    <BangViec tieuDe="Đơn hàng chiều nay của chú Tư" dong={DON} xong={moi} moi={moi} at={22} y={170} />
    <DongHo tu={gio} />
    <NhanGoi so={so} ten={ten} />
    <Tu says={[{at: 50, out: 200, text: loi}]} at={30} />
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

/** Hàng kệ hàng theo danh sách ô: khung sắt tối, hai tầng thùng gỗ nâu (ô tường của game trông giống thùng nên không dùng). */
const Ke: React.FC<{o: [number, number][]}> = ({o}) => (
  <>{o.map(([c, r]) => {
    const p = tamO(c, r);
    return (
      <div key={`${c}-${r}`} style={{position: 'absolute', left: p.x - O / 2 + 4, top: p.y - O / 2 + 4, width: O - 8, height: O - 8, borderRadius: 12, background: '#1E293B',
        border: '5px solid #0F172A', boxShadow: '0 8px 0 rgba(15,23,42,.45)', padding: 10, boxSizing: 'border-box', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8}}>
        {[0, 1, 2, 3].map((k) => <div key={k} style={{borderRadius: 6, background: k % 3 ? '#C2410C' : '#D97706', border: '3px solid #7C2D12'}} />)}
      </div>
    );
  })}</>
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

/* ================================================================== GÓI 1 · Xe hai bánh */
const G1Mo: React.FC = () => (
  <NenHienTruong anh={NEN}>
    {[[1, 1], [3, 2], [2, 3], [0, 4], [4, 4], [1, 5]].map(([c, r], i) => <Vat key={i} moc={[[0, c, r]]} />)}
    <DongHo tu={GIO(13)} />
    <NhanGoi so={1} ten="Xe hai bánh" />
    <Tu says={[{at: 15, out: 140, text: 'Năm giờ xe tải tới mà hàng còn chất đầy lối!'}]} />
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
const R_G2: Moc[] = [[0, 2, 5, -90], [60, 2, 5, -90], [100, 2, 2.62, -90], [130, 2, 2.75, -90]];
const G2Thu: React.FC = () => {
  const f = useCurrentFrame();
  const rot = (k: number) => (g: number) => ease(g, [100, 125], [0, k]);
  return (
    <Shake hits={[102]} amp={16}>
      <NenHienTruong anh={NEN}>
        <Vat moc={[[0, 2, 2], [100, 2, 2], [125, 2, 1.1]]} nghieng={rot(25)} />
        <Vat moc={[[0, 2, 1], [100, 2, 1], [125, 1.4, 0.2]]} nghieng={rot(-60)} />
        <Vat moc={[[0, 1, 1.5], [100, 1, 1.5], [125, 0.3, 1.9]]} nghieng={rot(-110)} />
        <Vat moc={[[0, 3, 1.5], [100, 3, 1.5], [125, 3.8, 0.8]]} nghieng={rot(80)} />
        <Xe anh="r1" moc={R_G2} doi={[[104, 'r1-ngac']]} />
        <ChuNay chu="RẦM!" at={102} den={160} x={540} y={420} co={140} />
        <DongHo tu={GIO(13, 20)} />
        <NhanGoi so={2} ten="Tay kẹp" />
        <Sola says={[{at: 10, out: 62, text: 'R1 húc ra là xong!'}]} mat={[[0, 'confident'], [104, 'shocked']]} />
        {f >= 110 ? <Tu says={[{at: 128, out: 250, text: 'Trời ơi, đổ hết cả chồng!'}]} at={110} /> : null}
      </NenHienTruong>
    </Shake>
  );
};
const R_G2K: Moc[] = [[0, 2, 4, -90], [10, 2, 4, -90], [45, 2, 1.62, -90], [60, 2, 1.62, -90], [90, 2, 4, -90], [105, 2, 4, 0], [140, 3.38, 4, 0], [170, 3.38, 4, 0]];
const G2Lam: React.FC = () => (
  <NenHienTruong anh={NEN}>
    <ODat ten="o-dich" c={4} r={4} />
    <Xe anh="kep" moc={R_G2K} doi={[[55, 'kep-vui'], [150, 'kep']]} />
    <Vat moc={[[0, 2, 1], [54, 2, 1], [151, 4, 4]]} bam={{moc: R_G2K, tu: 55, den: 150}} />
    <Burst at={152} x={tamO(4, 4).x} y={tamO(4, 4).y} color={C.yellow} />
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
        <Sola says={[{at: 4, out: 34, text: 'Đếm ba bước là tới!'}, {at: 230, out: 300, text: 'Ơ… lại không đúng!'}]} mat={[[0, 'confident'], [84, 'confused'], [224, 'facepalm']]} />
        {f >= 135 ? <Tu says={[{at: 140, out: 210, text: 'Để thùng đây cho gần nè.'}]} at={135} /> : null}
      </NenHienTruong>
    </Shake>
  );
};
const LAN3: [number, number, number][] = [[1, 1, 0], [2, 3, 25], [3, 2, 50]];     // cột, hàng thùng, khung xuất phát
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
        <ChuNay chu="SẬP!" at={96} den={150} x={540} y={tamO(2, 1).y - 40} co={120} />
        <DongHo tu={GIO(14, 20)} />
        <NhanGoi so={4} ten="Kho lạnh" />
        <Tu says={[{at: 20, out: 52, text: 'Đơn quan trọng nhất ở trong kia.'}, {at: 104, out: 160, text: 'Ấy chết!'}]} x={260} side="right" />
        {f >= 165 ? <Luna says={[{at: 170, out: 280, text: 'Cửa mở lúc nào nhỉ?'}]} mat={[[165, 'thinking']]} at={165} /> : null}
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
    <Sola says={[{at: 20, out: 160, text: 'Hay là…'}]} mat={[[0, 'thinking']]} />
  </NenHienTruong>
);
const R_G4K: Moc[] = [[0, 1, 5.2, -90], [45, 1, 3.62, -90], [60, 1, 3.62, -90], [75, 1, 4.4, -90], [90, 1, 4.4, 0], [110, 2, 4.4, 0], [125, 2, 4.4, -90], [175, 2, 0.4, -90]];
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
        <ChuNay chu="RẦM!" at={8} den={60} x={540} y={300} co={130} />
        {f >= 165 ? <ChuNay chu="2 nhịp…" at={165} den={260} x={800} y={tamO(2, 3).y} mau={C.warn} co={80} /> : null}
        <DongHo tu={GIO(15, 20)} den={GIO(15, 50)} dai={300} />
        <NhanGoi so={6} ten="Tay xoay" />
        <Tu says={[{at: 34, out: 120, text: 'Kệ cũ sập rồi! Thùng tràn ra lối!'}]} />
        {f >= 196 ? <Sola says={[{at: 200, out: 300, text: 'Quay cả xe, chậm quá!'}]} mat={[[196, 'worried']]} at={196} /> : null}
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
      <Sola says={[{at: 44, out: 100, text: 'Trái hay phải? Đoán… trái!'}, {at: 110, out: 220, text: 'Ngõ cụt rồi!'}]} mat={[[0, 'thinking'], [44, 'confident'], [104, 'shocked']]} />
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
const R_G8: Moc[] = [[0, 2, 5, -90], [25, 2, 3, -90], [45, 2, 5, -90], [70, 3, 4, 0], [95, 1, 4, 180], [120, 2, 5, -90], [145, 2, 3, -90]];
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
          <path d={`M ${tamO(0, 5).x} ${tamO(0, 5).y} Q ${tamO(0, 3).x} ${tamO(0, 3).y} ${tamO(1, 3).x} ${tamO(1, 3).y} L ${tamO(2, 1).x} ${tamO(2, 1).y}`}
            fill="none" stroke={C.luna} strokeWidth={14} strokeLinecap="round" strokeDasharray="30 22" pathLength={1} strokeDashoffset={1 - mui8} style={{strokeDasharray: `${mui8} 1`}} />
        </svg>
      ) : null}
      <DongHo tu={GIO(16)} den={GIO(16, 15)} dai={260} />
      <NhanGoi so={8} ten="Bến xuất" />
      <Sola says={[{at: 90, out: 190, text: 'Làm từng việc chậm quá!'}]} mat={[[0, 'worried']]} />
      {f >= 195 ? <Luna says={[{at: 200, out: 320, text: 'Thùng giữ cửa cũng là thùng giao cuối?'}]} mat={[[195, 'magnifier']]} at={195} /> : null}
    </NenHienTruong>
  );
};
const R_G8K: Moc[] = [[0, 0, 4.4, -90], [10, 0, 4.4, -90], [30, 0, 3, 0], [45, 0.38, 3, 0], [60, 0.2, 3.4, 0], [80, 2, 4.4, -90], [120, 2, 0.4, -90], [150, 2, 3.4, -90]];
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
const R_G9: Moc[] = [[0, 2, 5, -90], [20, 2, 5, -90], [50, 3, 3, -90], [75, 3, 3, -90], [100, 2, 3, -90], [120, 2, 2.3, -90]];
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
        <Sola says={[{at: 120, out: 250, text: 'Đè nút thì không vào được, vào thì cửa đóng!'}]} mat={[[0, 'confident'], [102, 'upset']]} />
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

/* ================================================================== GÓI 10 · Xuất xưởng */
const G10Mo: React.FC = () => (
  <NenHienTruong anh={NEN}>
    {[[1, 1], [3, 2], [0, 4], [4, 4]].map(([c, r], i) => <Vat key={i} moc={[[0, c, r]]} />)}
    <DongHo tu={GIO(16, 50)} den={GIO(16, 51)} gap />
    <NhanGoi so={10} ten="Xuất xưởng" />
    <Tu says={[{at: 15, out: 140, text: 'Mười phút nữa xe tải chạy!'}]} />
  </NenHienTruong>
);
const ThaTay: React.FC = () => {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  const p = pop(f, 70, fps, 10);
  return (
    <AbsoluteFill style={{background: '#EEF2FF', fontFamily: FONT}}>
      <Img src={staticFile('nen-doc/trong-xe.jpg')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center', opacity: Math.min(1, p * 2), transform: `scale(${0.7 + 0.3 * p})`}}>
        <span style={{display: 'inline-flex', alignItems: 'center', gap: 16, padding: '20px 36px', borderRadius: 24, background: C.ink, color: '#fff', fontWeight: 900, fontSize: 46}}>
          <Icon name="Keyboard" size={50} color="#fff" />Sola thả tay khỏi bàn phím</span>
      </div>
      <Mascot who="sola" x={540} h={680} at={0} faces={[[0, 'serious'], [70, 'confident']]} says={[{at: 10, out: 140, text: 'Lần này R1 tự làm.'}]} bubbleW={560} bubbleTop={1180} />
    </AbsoluteFill>
  );
};
const R_G10A: Moc[] = [[0, 1, 5.2, -90], [35, 1, 3.62, -90], [45, 1, 3.62, -90], [55, 1, 4.4, -90], [65, 1, 4.4, 0], [80, 2, 4.4, 0], [90, 2, 4.4, -90], [130, 2, 0.4, -90]];
const G10Kho: React.FC = () => (
  <NenHienTruong anh={NEN}>
    <div style={{position: 'absolute', left: tamO(0, 0).x - O / 2, top: tamO(0, 0).y - O / 2, width: 5 * O, height: O, background: 'rgba(125,211,252,.55)', borderRadius: 14}} />
    <Ke o={KE_LANH} />
    <Cua c={2} r={1} mo={(g) => g >= 45} />
    <ODat ten="o-nut-de" c={1} r={3} />
    <Xe anh="du" moc={R_G10A} />
    <Vat moc={[[0, 1, 3], [46, 1, 3]]} bam={{moc: R_G10A, tu: 0, den: 45}} />
    <DongHo tu={GIO(16, 52)} gap />
    <NhanGoi so={10} ten="Kho lạnh" />
  </NenHienTruong>
);
const R_G10B: Moc[] = [[0, 2, 5.2, -90], [35, 2, 3.62, -90], [60, 2, 3.62, -90], [72, 2, 3.62, 0], [100, 4, 3.62, 0], [112, 4, 3.62, -90], [150, 4, 1.62, -90]];
const G10MeCung: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <NenHienTruong anh={NEN}>
      <Ke o={[[0, 3], [1, 4], [3, 4], [0, 4], [4, 4], [1, 2], [3, 2]]} />
      <ODat ten="o-co" c={4} r={1} />
      <Vat moc={[[0, 2, 1.2], [20, 2, 1.2], [34, 2, 2.6]]} nghieng={(g) => ease(g, [20, 34], [-40, 6])} />
      {f >= 36 && f < 62 ? <Tia tu={mui(R_G10B, f)} den={{x: tamO(2, 2.6).x, y: tamO(2, 2.6).y + O * 0.45}} mau={C.bad} /> : null}
      <ChuNay chu="!" at={36} den={62} x={tamO(2, 3.62).x + 130} y={tamO(2, 3.62).y - 80} mau={C.bad} />
      <Xe anh="du" moc={R_G10B} doi={[[152, 'du-vui']]} />
      <DongHo tu={GIO(16, 56)} gap />
      <NhanGoi so={10} ten="Mê cung kệ" />
    </NenHienTruong>
  );
};
const XuatXuong: React.FC = () => {
  const f = useCurrentFrame(), {fps} = useVideoConfig();
  const tem = pop(f, 60, fps, 8);
  const PART = ['Thân hai bánh · lùi được', 'Tay kẹp · xoay được', 'Mắt khoảng cách · nhìn hai bên'];
  return (
    <Shake hits={[62]} amp={14}>
      <AbsoluteFill style={{background: '#1E3A8A', fontFamily: FONT, backgroundImage: 'linear-gradient(rgba(255,255,255,.08) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,.08) 2px, transparent 2px)', backgroundSize: '60px 60px'}}>
        <div style={{position: 'absolute', top: 170, left: 0, right: 0, textAlign: 'center', color: '#fff', fontWeight: 900, fontSize: 76}}>Xe chở hàng R1</div>
        <div style={{position: 'absolute', left: 540 - 560, top: 220, width: 1120, height: 1120, transform: `rotate(-90deg) scale(${1 + 0.02 * Math.sin(f / 10)})`}}>
          <Img src={staticFile('robot/m1/du-vui.png')} style={{width: 1120, height: 1120}} />
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
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#0F172A', fontFamily: FONT, alignItems: 'center'}}>
      <div style={{position: 'absolute', top: 200, padding: '12px 32px', borderRadius: 999, background: C.yellow, color: C.ink, fontWeight: 900, fontSize: 44}}>NGOÀI ĐỜI</div>
      <div style={{position: 'absolute', top: 420, width: 860, height: 860, borderRadius: 40, background: '#1E293B', border: '4px dashed #475569', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 30, color: '#94A3B8', fontSize: 34, fontWeight: 700, textAlign: 'center'}}>
        <div style={{display: 'flex', gap: 40, transform: `translateX(${Math.sin(f / 20) * 30}px)`}}>
          <Icon name="Warehouse" size={150} color="#CBD5E1" /><Icon name="Bot" size={150} color={C.sola} />
        </div>
        (chờ ảnh minh hoạ TopView)
      </div>
      <div style={{position: 'absolute', top: 1340, left: 90, right: 90, textAlign: 'center', color: '#fff', fontWeight: 800, fontSize: 52, lineHeight: 1.3, opacity: ease(f, [10, 30], [0, 1])}}>
        Robot kho tự hành chở cả kệ hàng tới chỗ người đóng gói.</div>
    </AbsoluteFill>
  );
};
const NhaMua2: React.FC = () => {
  const f = useCurrentFrame();
  const y = ease(f, [0, 120], [-700, -1500]);
  const rung = Math.floor(f / 3) % 2 ? 3 : -3;
  return (
    <AbsoluteFill style={{background: '#9BD27A', fontFamily: FONT, overflow: 'hidden'}}>
      <Img src={staticFile('ban-do/dai-4a.jpg')} style={{position: 'absolute', left: 0, top: y, width: 1080}} />
      <div style={{position: 'absolute', left: 90, right: 90, top: 1250, transform: `translateX(${f > 30 && f < 60 ? rung : 0}px)`, opacity: ease(f, [25, 40], [0, 1]),
        background: '#fff', borderRadius: 30, border: `5px solid ${C.ink}`, boxShadow: `0 12px 0 ${C.ink}`, padding: '28px 32px', display: 'flex', gap: 24, alignItems: 'center'}}>
        <Icon name="Radio" size={80} color="#EF4444" stroke={2.4} />
        <div style={{fontSize: 44, fontWeight: 800, color: C.ink, lineHeight: 1.3}}>"Rè… rè… Có ai sửa được nhà máy hơi nước không?"</div>
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== danh sách phim */
const mo = (so: number, ten: string, canh: Phim['canh']): Phim => ({id: `M1G${so}-Mo`, doc: true, canh});
const ket = (so: number, canh: Phim['canh']): Phim => ({id: `M1G${so}-Ket`, doc: true, canh});
const tt = (so: number, ten: string, gio: number, loi: string) => ({id: 'thanh-tuu', dur: 170, el: <ThanhTuu moi={so - 1} loi={loi} gio={gio} so={so} ten={ten} />,
  sfx: [[22, 'ding.wav', 0.5]] as any});
const xe = (anh: string, luna: string, sola: string, tenPart: string, cach = 120) => ({id: 'trong-xe', dur: cach + 70,
  el: <TrongXe anh={anh} cach={cach} tenPart={tenPart} luna={[{at: 10, out: 70, text: luna}]} sola={[{at: 76, out: cach - 4, text: sola}]}
    lunaMat={[[0, 'thinking'], [76, 'happy']]} solaMat={[[0, 'thinking'], [76, 'confident']]} />, sfx: [[cach, 'impact.wav', 0.5], [cach, 'ding.wav', 0.4]] as any});
const treo = (anh: string, cau: string, so: number, ten: string) => ({id: 'cau-treo', dur: 110, el: <CauTreo anh={anh} cau={cau} so={so} ten={ten} />, sfx: [W_IN, [40, 'pop.wav', 0.4]] as any});

export const PHIM_M1: Phim[] = [
  mo(1, 'Xe hai bánh', [
    {id: 'kho', dur: 150, el: <G1Mo />, sfx: [W_IN]},
    xe('r1', 'R1 mới là bộ não, chưa có chân.', 'Lắp hai bánh, cho R1 chạy!', 'Thân hai bánh', 110),
    treo('r1', 'Dạy R1 lái nào!', 1, 'Xe hai bánh'),
  ]),
  ket(1, [{id: 'lam', dur: 120, el: <G1Lam />}, tt(1, 'Xe hai bánh', GIO(13, 10), 'Ờ, cũng được đấy.')]),
  mo(2, 'Tay kẹp', [
    {id: 'thu', dur: 250, el: <G2Thu />, sfx: [[60, 'whoosh-soft.wav', 0.3], [102, 'impact.wav', 0.7]]},
    xe('kep', 'Thùng có tay cầm kìa?', 'Phải nhấc lên!', 'Tay kẹp', 125),
    treo('kep', 'Thử kẹp trên sa bàn nào!', 2, 'Tay kẹp'),
  ]),
  ket(2, [{id: 'lam', dur: 175, el: <G2Lam />, sfx: [[55, 'click.wav', 0.6], [152, 'ding.wav', 0.4]]}, tt(2, 'Tay kẹp', GIO(13, 30), 'Nhấc lên đặt xuống, gọn ghê!')]),
  mo(3, 'Cảm biến khoảng cách', [
    {id: 'thu', dur: 300, el: <G3Thu />, sfx: [[84, 'wrong.wav', 0.5], [223, 'impact.wav', 0.5]]},
    xe('kep-cam', 'Thùng mỗi lúc một chỗ, đếm sao kịp?', 'Cho R1 tự nhìn phía trước!', 'Mắt khoảng cách', 125),
    treo('kep-cam', 'R1 tự nhìn, mình chỉ việc chờ.', 3, 'Cảm biến'),
  ]),
  ket(3, [{id: 'lam', dur: 130, el: <G3Lam />}, tt(3, 'Cảm biến', GIO(14), 'Dời đâu cũng tìm ra. Giỏi!')]),
  mo(4, 'Kho lạnh', [
    {id: 'thu', dur: 290, el: <G4Thu />, sfx: [[55, 'click.wav', 0.6], [96, 'impact.wav', 0.7]]},
    {id: 'nghi', dur: 170, el: <G4Nghi />, sfx: [[30, 'pop.wav', 0.3], [60, 'pop.wav', 0.3]]},
    treo('kep-cam', 'Thử trên sa bàn xem!', 4, 'Kho lạnh'),
  ]),
  ket(4, [{id: 'lam', dur: 180, el: <G4Lam />, sfx: [[60, 'ding.wav', 0.4]]}, tt(4, 'Kho lạnh', GIO(14, 40), 'Biết giữ cửa rồi đấy!')]),
  mo(5, 'Bánh lùi', [
    {id: 'thu', dur: 260, el: <G5Thu />, sfx: [[106, 'impact.wav', 0.3], [134, 'impact.wav', 0.3], [146, 'wrong.wav', 0.5]]},
    xe('kep-cam', 'Bánh chỉ biết lăn tới thôi à?', 'Cho bánh quay ngược!', 'Bánh lùi', 120),
    treo('kep-cam', 'Lùi thử trên sa bàn!', 5, 'Bánh lùi'),
  ]),
  ket(5, [{id: 'lam', dur: 120, el: <G5Lam />, sfx: [[30, 'swish.wav', 0.4]]}, tt(5, 'Bánh lùi', GIO(15, 10), 'Lùi ra gọn gàng!')]),
  mo(6, 'Tay xoay', [
    {id: 'thu', dur: 300, el: <G6Thu />, sfx: [[8, 'impact.wav', 0.8], [165, 'wrong.wav', 0.4]]},
    xe('xoay', 'Quay cả xe, hay chỉ cần quay cái tay?', 'Cổ tay xoay!', 'Tay xoay', 125),
    treo('xoay', 'Xe đứng yên, tay quay!', 6, 'Tay xoay'),
  ]),
  ket(6, [{id: 'lam', dur: 180, el: <G6Lam />, sfx: [[45, 'click.wav', 0.5], [95, 'click.wav', 0.5]]}, tt(6, 'Tay xoay', GIO(15, 40), 'Thông lối rồi!')]),
  mo(7, 'Cảm biến bên', [
    {id: 'thu', dur: 270, el: <G7Thu />, sfx: [[104, 'wrong.wav', 0.5]]},
    xe('du', 'Bên hông có lối không, R1 có biết không?', 'Gắn mắt hai bên!', 'Mắt hai bên', 125),
    treo('du', 'Hỏi trước rồi mới rẽ.', 7, 'Cảm biến bên'),
  ]),
  ket(7, [{id: 'lam', dur: 190, el: <G7Lam />, sfx: [[45, 'pop.wav', 0.3], [182, 'ding.wav', 0.4]]}, tt(7, 'Cảm biến bên', GIO(16, 5), 'Đơn khó nhất, giao R1 luôn!')]),
  mo(8, 'Bến xuất', [
    {id: 'thu', dur: 330, el: <G8Thu />, sfx: [[60, 'wrong.wav', 0.4], [200, 'swish.wav', 0.3]]},
    treo('du', 'Xếp lại thứ tự!', 8, 'Bến xuất'),
  ]),
  ket(8, [{id: 'lam', dur: 165, el: <G8Lam />, sfx: [[46, 'click.wav', 0.5], [122, 'ding.wav', 0.4]]}, tt(8, 'Bến xuất', GIO(16, 20), 'Bến xuất gọn rồi!')]),
  mo(9, 'R2', [
    {id: 'thu', dur: 260, el: <G9Thu />, sfx: [[50, 'click.wav', 0.6], [100, 'impact.wav', 0.7]]},
    xe('r2', 'Bộ hai bánh dư trên kệ đây!', 'Lắp thành R2!', 'R2 của Luna', 120),
    treo('r2', 'Hai bảng mật lệnh nhé!', 9, 'R2'),
  ]),
  ket(9, [{id: 'lam', dur: 175, el: <G9Lam />, sfx: [[40, 'click.wav', 0.5], [115, 'click.wav', 0.5]]}, tt(9, 'R2', GIO(16, 40), 'Hai đứa, hai việc. Hay!')]),
  mo(10, 'Xuất xưởng', [
    {id: 'kho', dur: 150, el: <G10Mo />, sfx: [W_IN]},
    {id: 'tha-tay', dur: 160, el: <ThaTay />, sfx: [[70, 'riser.wav', 0.4]]},
  ]),
  ket(10, [
    {id: 'kho-lanh', dur: 140, el: <G10Kho />, sfx: [[45, 'click.wav', 0.5]]},
    {id: 'me-cung', dur: 165, el: <G10MeCung />, sfx: [[36, 'wrong.wav', 0.4], [152, 'ding.wav', 0.4]]},
    tt(10, 'Xuất xưởng', GIO(16, 59), 'Kịp giờ! Cảm ơn hai cháu!'),
    {id: 'xuat-xuong', dur: 180, el: <XuatXuong />, sfx: [[60, 'impact.wav', 0.8], [62, 'ding.wav', 0.5]]},
    {id: 'ngoai-doi', dur: 150, el: <NgoaiDoi />, sfx: [W_IN]},
    {id: 'nha', dur: 150, el: <NhaMua2 />, sfx: [[30, 'glitch.wav', 0.4]]},
  ]),
];
