// Sa bàn mô phỏng cho phim gói (2/11, hoc/KE-HOACH-SUA-PHIM-GOI.md mục 2): đọc đúng KÝ HIỆU SÂN của game (hoc/san-hoc.js: # tường/kệ, o vật,
// D ô đích, F cờ, M nút đè, C cửa đóng, c cửa mở) và chạy một dãy NHỊP lệnh đúng tên game, mỗi nhịp một ô, theo luật lõi:
//   - tiến / lùi vào tường, mép sân, vật nằm đất, cửa đóng → đứng yên tại chỗ, mất nhịp, sao choáng ('dam-tuong');
//   - tay hạ ('duoi') mà bước → vướng, đứng yên; grab chỉ gắp vật ở ô tay chỉ khi tay hạ; release đặt vật xuống ô tay chỉ (phải là sàn trống);
//   - tay xoay: arm_left / arm_right xoay một nấc (truoc ↔ trai / phai), ô tay chỉ = ô trước / trái / phải theo hướng mặt;
//   - nút đè M: có xe hay vật nằm trên nút thì mọi cửa C mở; rời nút thì đóng lại;
//   - cầm vật mà xoay làm vật đụng tường / vật khác → vướng tay, không xoay.
// Mọi toạ độ là Ô NGUYÊN (tâm ô); số lẻ chỉ sinh ra trong hoạt cảnh nội suy giữa hai nhịp. Hướng theo game: 0 lên, 1 phải, 2 xuống, 3 trái.
import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {C, MONO, ease} from '../d10';
import {duongRobot, MuaCtx} from './kit-doc';

export type Huong = 0 | 1 | 2 | 3;
export type Nac = 'truoc' | 'trai' | 'phai';
export type Vat = {id: number; x: number; y: number; cam?: boolean};
export type TrangThai = {
  x: number; y: number; huong: Huong; tay: 'tren' | 'duoi'; nac: Nac; cam: number | null;
  vat: Vat[]; cuaMo: boolean; loi: null | 'dam' | 'vuong-tay' | 'kep-hut'; thuNhip?: number;
};
/** Một nhịp: `lenh` là nhãn lệnh game hiện trên bảng code (dòng `dong` sáng); các cờ bên dưới là việc máy làm trong nhịp đó (thứ tự game: tay → kẹp/thả → bánh). */
export type Nhip = {
  lenh?: string; dong?: number;
  tien?: boolean; lui?: boolean; re?: 'trai' | 'phai';
  tayHa?: boolean; tayNang?: boolean; kep?: boolean; tha?: boolean; xoay?: 'trai' | 'phai';
  /** hỏi cảm biến: hiện tia dò ô ấy và kết quả True/False */
  hoi?: 'truoc' | 'trai' | 'phai';
};
export type San = {o: string[]; batDau: {x: number; y: number; huong: Huong}};

const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];
const quay = (h: Huong, re: 'trai' | 'phai'): Huong => (((h + (re === 'phai' ? 1 : 3)) % 4) as Huong);
const oTai = (san: string[], x: number, y: number) => (y < 0 || y >= san.length || x < 0 || x >= san[y].length ? '#' : san[y][x]);
/** Ô tay đang chỉ: trước mặt, hay bên trái / phải theo hướng mặt. */
export const oTay = (t: {x: number; y: number; huong: Huong; nac: Nac}) => {
  const h = t.nac === 'truoc' ? t.huong : quay(t.huong, t.nac);
  return {x: t.x + DX[h], y: t.y + DY[h]};
};
const laSan = (c: string) => c === '.' || c === 'D' || c === 'F' || c === 'M' || c === 'c' || c === ',';

export const docSan = (san: string[], batDau: {x: number; y: number; huong: Huong}): TrangThai => {
  const vat: Vat[] = [];
  san.forEach((hang, y) => [...hang].forEach((c, x) => { if (c === 'o') vat.push({id: vat.length + 1, x, y}); }));
  return {...batDau, tay: 'tren', nac: 'truoc', cam: null, vat, cuaMo: false, loi: null};
};
const vatTai = (t: TrangThai, x: number, y: number) => t.vat.find((v) => !v.cam && v.x === x && v.y === y);
const coNut = (san: string[], t: TrangThai) => {
  const tren = (x: number, y: number) => oTai(san, x, y) === 'M';
  return tren(t.x, t.y) || t.vat.some((v) => !v.cam && tren(v.x, v.y));
};
const diVaoDuoc = (san: string[], t: TrangThai, x: number, y: number) => {
  const c = oTai(san, x, y);
  if (c === 'C') return t.cuaMo;
  if (c === 'o') return !vatTai(t, x, y);       // ký hiệu o chỉ là chỗ đặt vật lúc đầu; vật đã nhấc thì ô là sàn
  if (!laSan(c)) return false;
  return !vatTai(t, x, y);
};

/** Chạy một nhịp theo luật game, trả trạng thái mới (không đổi trạng thái cũ). */
export const chayNhip = (san: string[], t0: TrangThai, n: Nhip): TrangThai => {
  const t: TrangThai = {...t0, vat: t0.vat.map((v) => ({...v})), loi: null};
  // (a) tay: nâng → xoay → hạ
  if (n.tayNang) t.tay = 'tren';
  if (n.xoay) {
    if (t.tay === 'duoi' && !n.tayNang) t.loi = 'vuong-tay';      // tay hạ thì khớp kẹt
    else {
      const nacMoi: Nac = n.xoay === 'trai' ? (t.nac === 'phai' ? 'truoc' : 'trai') : (t.nac === 'trai' ? 'truoc' : 'phai');
      if (nacMoi !== t.nac) {
        const o = oTay({...t, nac: nacMoi});
        if (t.cam !== null && !diVaoDuoc(san, t, o.x, o.y)) t.loi = 'vuong-tay';   // cầm vật mà xoay vào kệ → vướng tay
        else t.nac = nacMoi;
      }
    }
  }
  if (n.tayHa) t.tay = 'duoi';
  // (b) kẹp / thả ở ô tay chỉ
  const o = oTay(t);
  if (n.kep && t.cam === null) {
    const v = t.tay === 'duoi' ? vatTai(t, o.x, o.y) : undefined;
    if (v) { v.cam = true; t.cam = v.id; } else t.loi = 'kep-hut';
  }
  if (n.tha && t.cam !== null && t.tay === 'duoi') {
    const c = oTai(san, o.x, o.y);
    if (laSan(c) || c === 'o') { const v = t.vat.find((q) => q.id === t.cam)!; v.cam = false; v.x = o.x; v.y = o.y; t.cam = null; }
  }
  // (c) bánh: xoay tại chỗ luôn được (vật đang cầm nằm trong kẹp, không chiếm ô: san-hoc.js "gắp xong ô đó trống")
  if (n.re) t.huong = quay(t.huong, n.re);
  if (n.tien || n.lui) {
    if (t.tay === 'duoi') t.loi = 'vuong-tay';                              // tay hạ mà bước: vướng tay (san-hoc.js)
    else {
      const h = n.tien ? t.huong : (((t.huong + 2) % 4) as Huong);
      const nx = t.x + DX[h], ny = t.y + DY[h];
      if (!diVaoDuoc(san, t, nx, ny)) t.loi = 'dam';
      else { t.x = nx; t.y = ny; }
    }
  }
  // vật đang cầm đi theo tay
  if (t.cam !== null) { const v = t.vat.find((q) => q.id === t.cam)!; const p = oTay(t); v.x = p.x; v.y = p.y; }
  // (d) nút đè giữ cửa
  t.cuaMo = coNut(san, t) || san.some((h) => h.includes('c')) && !san.some((h) => h.includes('C'));
  return t;
};

/** Dãy trạng thái sau từng nhịp: ds[0] = ban đầu, ds[k] = sau nhịp k. */
export const moPhong = (san: string[], batDau: San['batDau'], nhip: Nhip[]): TrangThai[] => {
  const ds = [docSan(san, batDau)];
  ds[0].cuaMo = coNut(san, ds[0]);
  for (const n of nhip) ds.push(chayNhip(san, ds[ds.length - 1], n));
  return ds;
};

/* ------------------------------------------------------------------ dựng nhịp từ lệnh game (tiện viết kịch bản) */
/** Dãy nhịp từ các lệnh gốc của game, mỗi phần tử một nhịp (wait() nằm sẵn trong từng nhịp). `dong` = dòng code sáng. */
export const N = {
  move: (dong?: number): Nhip => ({lenh: 'move()', dong, tien: true}),
  back: (dong?: number): Nhip => ({lenh: 'back()', dong, lui: true}),
  turnLeft: (dong?: number): Nhip => ({lenh: 'turn_left()', dong, re: 'trai'}),
  turnRight: (dong?: number): Nhip => ({lenh: 'turn_right()', dong, re: 'phai'}),
  wait: (dong?: number, lenh = 'wait()'): Nhip => ({lenh, dong}),
  /** gói 1: left_move() + right_move() + wait() = tiến một ô */
  haiBanh: (dong?: number): Nhip => ({lenh: 'left_move() right_move()', dong, tien: true}),
  leftMove: (dong?: number): Nhip => ({lenh: 'left_move()', dong, re: 'phai'}),
  rightMove: (dong?: number): Nhip => ({lenh: 'right_move()', dong, re: 'trai'}),
  haiBanhLui: (dong?: number): Nhip => ({lenh: 'left_back() right_back()', dong, lui: true}),
  armDown: (dong?: number): Nhip => ({lenh: 'arm_down()', dong, tayHa: true}),
  armUp: (dong?: number): Nhip => ({lenh: 'arm_up()', dong, tayNang: true}),
  grab: (dong?: number): Nhip => ({lenh: 'grab()', dong, kep: true}),
  release: (dong?: number): Nhip => ({lenh: 'release()', dong, tha: true}),
  armDownGrab: (dong?: number): Nhip => ({lenh: 'arm_down() grab()', dong, tayHa: true, kep: true}),
  armDownRelease: (dong?: number): Nhip => ({lenh: 'arm_down() release()', dong, tayHa: true, tha: true}),
  /** pick() của em = 2 nhịp: hạ + kẹp, rồi nâng */
  pick: (dong?: number): Nhip[] => [{lenh: 'pick()', dong, tayHa: true, kep: true}, {lenh: 'pick()', dong, tayNang: true}],
  /** drop() của em = 2 nhịp: hạ + thả, rồi nâng */
  drop: (dong?: number): Nhip[] => [{lenh: 'drop()', dong, tayHa: true, tha: true}, {lenh: 'drop()', dong, tayNang: true}],
  armLeft: (dong?: number): Nhip => ({lenh: 'arm_left()', dong, xoay: 'trai'}),
  armRight: (dong?: number): Nhip => ({lenh: 'arm_right()', dong, xoay: 'phai'}),
  /** pick_left() / drop_right()… của em = 2 nhịp: xoay sang bên + hạ + kẹp/thả, rồi nâng + xoay về trước */
  pickLeft: (dong?: number): Nhip[] => [{lenh: 'pick_left()', dong, xoay: 'trai', tayHa: true, kep: true}, {lenh: 'pick_left()', dong, tayNang: true, xoay: 'phai'}],
  pickRight: (dong?: number): Nhip[] => [{lenh: 'pick_right()', dong, xoay: 'phai', tayHa: true, kep: true}, {lenh: 'pick_right()', dong, tayNang: true, xoay: 'trai'}],
  dropLeft: (dong?: number): Nhip[] => [{lenh: 'drop_left()', dong, xoay: 'trai', tayHa: true, tha: true}, {lenh: 'drop_left()', dong, tayNang: true, xoay: 'phai'}],
  dropRight: (dong?: number): Nhip[] => [{lenh: 'drop_right()', dong, xoay: 'phai', tayHa: true, tha: true}, {lenh: 'drop_right()', dong, tayNang: true, xoay: 'trai'}],
  /** hỏi cảm biến rồi (tuỳ) tiến trong cùng nhịp hiện lệnh */
  hoi: (ben: 'truoc' | 'trai' | 'phai', lenh: string, dong?: number, tien = false): Nhip => ({lenh, dong, hoi: ben, tien}),
};

/* ------------------------------------------------------------------ vẽ */
export type Vo = 'lab' | 'kho';
const HINH_O: Record<Vo, {san: string; tuong: string; vat: string}> = {lab: {san: 'o-san', tuong: 'o-tuong', vat: 'vat-thung-go'}, kho: {san: 'o-san-kho', tuong: 'o-ke-hang', vat: 'vat-thung-carton'}};
export type KhungSaBan = {x0: number; y0: number; o: number; cot: number; hang: number};
/** Khung lưới vừa vùng (trái 90, phải 990, trên `top`, cao `cao`: mặc định 300..1140, trên vùng bóng thoại 1180), ô tối đa `oMax`, căn giữa. */
export const khungCho = (san: string[], top = 300, cao = 840, oMax = 168): KhungSaBan => {
  const cot = Math.max(...san.map((h) => h.length)), hang = san.length;
  const o = Math.min(oMax, Math.floor(900 / cot), Math.floor(cao / hang));
  return {x0: 540 - (cot * o) / 2, y0: top + (cao - hang * o) / 2, o, cot, hang};
};
export const tamKhung = (k: KhungSaBan, x: number, y: number) => ({x: k.x0 + (x + 0.5) * k.o, y: k.y0 + (y + 0.5) * k.o});

const RONG: Record<string, number> = {xoay: 922, 'xoay-vui': 922, du: 922, 'du-vui': 922, 'du-ngac': 922};

/** Sao choáng bốn cánh quay vòng trên đầu robot (như HU.choang của game). */
const Choang: React.FC<{x: number; y: number; since: number; o: number}> = ({x, y, since, o}) => {
  const a = Math.max(0, 1 - since / 60);
  if (a <= 0) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 0, height: 0, opacity: a, zIndex: 30}}>
      {[0, 1, 2].map((i) => {
        const g = since / 6 + (i * 2 * Math.PI) / 3, r = o * 0.42;
        return (
          <svg key={i} viewBox="0 0 40 40" width={o * 0.3} height={o * 0.3}
            style={{position: 'absolute', left: Math.cos(g) * r - o * 0.15, top: Math.sin(g) * r * 0.45 - o * 0.15 - o * 0.55}}>
            <path d="M20 2 L24 16 L38 20 L24 24 L20 38 L16 24 L2 20 L16 16 Z" fill={C.yellow} stroke={C.ink} strokeWidth="3" strokeLinejoin="round" />
          </svg>
        );
      })}
    </div>
  );
};

/** Tia cảm biến dò một ô: khung sáng xanh (trống) / đỏ (vướng) + nhãn True / False. */
const TiaDo: React.FC<{k: KhungSaBan; x: number; y: number; trong: boolean; nhan: string; u: number}> = ({k, x, y, trong, nhan, u}) => {
  const p = tamKhung(k, x, y), m = trong ? C.good : C.bad;
  return (
    <div style={{position: 'absolute', left: p.x - k.o / 2, top: p.y - k.o / 2, width: k.o, height: k.o, borderRadius: k.o * 0.14, opacity: u,
      background: trong ? 'rgba(14,159,110,0.25)' : 'rgba(229,72,77,0.28)', border: `6px dashed ${m}`, boxSizing: 'border-box', zIndex: 25}}>
      <div style={{position: 'absolute', left: '50%', top: -58, transform: 'translateX(-50%)', padding: '6px 16px', borderRadius: 12, background: m, color: '#fff',
        fontFamily: MONO, fontSize: 26, fontWeight: 800, whiteSpace: 'nowrap', border: `3px solid ${C.ink}`}}>{nhan} → {trong ? 'True' : 'False'}</div>
    </div>
  );
};

export type SaBanProps = {
  san: string[]; batDau: San['batDau']; nhip: Nhip[];
  /** khung bắt đầu nhịp 1, số khung mỗi nhịp */
  tu?: number; moiNhip?: number;
  vo?: Vo; anhXe?: string; anhVui?: string; anhNgac?: string;
  /** không vẽ ô sàn (hiện trường có nền ảnh) */
  khongSan?: boolean;
  khung?: KhungSaBan; top?: number; cao?: number; oMax?: number;
  /** vẽ vết đường đã đi */
  vet?: boolean;
  /** không vẽ robot (hiện trường chưa có xe) · không vẽ ô, vật (robot thứ hai chung sân) */
  anXe?: boolean; anSan?: boolean;
  /** gói 1: bánh nào đang lăn trong nhịp i ('ca' = cả hai); bánh kia đứng yên */
  banhSang?: (i: number) => 'trai' | 'phai' | 'ca' | null;
  children?: (k: KhungSaBan, tt: TrangThai, i: number) => React.ReactNode;
};

/** Hai bánh xe trên hình robot (mũi quay sang phải trong ảnh 576 px: bánh trái ở trên, bánh phải ở dưới): bánh lăn sáng vàng, bánh đứng yên viền đỏ. */
const Banh: React.FC<{S: number; lan: 'trai' | 'phai' | 'ca'; u: number}> = ({S, lan, u}) => (
  <>
    {(['trai', 'phai'] as const).map((b) => {
      const dang = lan === 'ca' || lan === b;
      const w = (226 / 576) * S, h = (86 / 576) * S, cx = S / 2 + (9 / 576) * S, cy = S / 2 + (b === 'trai' ? -1 : 1) * (159 / 576) * S;
      return (
        <div key={b} style={{position: 'absolute', left: cx - w / 2, top: cy - h / 2, width: w, height: h, borderRadius: h / 2, boxSizing: 'border-box',
          border: dang ? `5px solid ${C.yellow}` : `5px dashed ${C.bad}`, boxShadow: dang ? `0 0 ${18 + 10 * Math.sin(u * 20)}px ${C.yellow}` : 'none',
          background: dang ? `repeating-linear-gradient(90deg, rgba(250,204,21,.55) 0 ${h * 0.3}px, transparent ${h * 0.3}px ${h * 0.6}px)` : 'rgba(229,72,77,.25)',
          backgroundPosition: `${dang ? u * w : 0}px 0`}} />
      );
    })}
  </>
);

/** Sa bàn: lưới ô game + vật + robot chạy dãy nhịp. Trạng thái tại khung f: nhịp i = floor((f - tu) / moiNhip), nội suy từ ds[i] sang ds[i+1]. */
export const SaBan: React.FC<SaBanProps> = ({san, batDau, nhip, tu = 20, moiNhip = 22, vo = 'lab', anhXe = 'r1', anhVui, anhNgac, khongSan, khung, top, cao, oMax, vet = true, anXe, anSan, banhSang, children}) => {
  const f = useCurrentFrame(), mua = React.useContext(MuaCtx);
  const k = khung ?? khungCho(san, top, cao, oMax);
  const ds = React.useMemo(() => moPhong(san, batDau, nhip), [san, batDau, nhip]);
  const i = Math.max(0, Math.min(nhip.length, Math.floor((f - tu) / moiNhip) + (f >= tu ? 1 : 0)));   // nhịp đang chạy (1..n), 0 = chưa chạy
  const a = ds[Math.max(0, i - 1)], b = ds[i];
  const t0 = tu + (i - 1) * moiNhip;
  const u = i === 0 ? 1 : ease(f, [t0, t0 + moiNhip * 0.7], [0, 1]);
  const n = i > 0 ? nhip[i - 1] : undefined;
  // vị trí robot: nội suy a → b; đâm thì nhích 25% rồi bật lại
  const dam = b.loi === 'dam' || (b.loi === 'vuong-tay' && (n?.tien || n?.lui));
  let rx = a.x + (b.x - a.x) * u, ry = a.y + (b.y - a.y) * u;
  if (dam && n) {
    const h = n.lui ? ((a.huong + 2) % 4) as Huong : a.huong;
    const d = 0.25 * Math.sin(Math.min(1, u) * Math.PI);
    rx = a.x + DX[h] * d; ry = a.y + DY[h] * d;
  }
  let gocA = a.huong * 90, gocB = b.huong * 90;
  if (gocB - gocA > 180) gocA += 360; else if (gocA - gocB > 180) gocB += 360;
  const goc = gocA + (gocB - gocA) * u;
  const p = {x: k.x0 + (rx + 0.5) * k.o, y: k.y0 + (ry + 0.5) * k.o};
  const nacGoc = (nac: Nac) => (nac === 'trai' ? -90 : nac === 'phai' ? 90 : 0);
  const gocTay = goc + nacGoc(a.nac) + (nacGoc(b.nac) - nacGoc(a.nac)) * u;
  const ten = b.loi && f >= t0 + moiNhip * 0.3 && anhNgac ? anhNgac : i === nhip.length && f >= t0 + moiNhip * 0.6 && anhVui ? anhVui : anhXe;
  const S = 1.5 * k.o * (RONG[ten] ?? 576) / 576;      // ảnh 576 có lề: thân robot ≈ 0.8 S, vừa kín ô như trong game
  const cuaMo = b.cuaMo;
  const hinh = HINH_O[vo];
  const choangTu = dam || b.loi === 'vuong-tay' || b.loi === 'kep-hut' ? t0 + moiNhip * 0.3 : -1;
  // vết đường: tâm các ô đã đi
  const vetDiem = vet ? ds.slice(0, i).map((t) => tamKhung(k, t.x, t.y)).concat([p]) : [];
  const dangChay = i > 0 && f < t0 + moiNhip;
  const lan = banhSang && dangChay ? banhSang(i) : null;
  return (
    <>
      {anSan ? null : san.map((hang, y) => [...hang].map((c, x) => {
        const q = tamKhung(k, x, y), st: React.CSSProperties = {position: 'absolute', left: q.x - k.o / 2, top: q.y - k.o / 2, width: k.o, height: k.o};
        const anh = (t: string) => <Img key={`${x}-${y}-${t}`} src={staticFile(duongRobot(mua, t))} style={st} />;
        const lop: React.ReactNode[] = [];
        if (c === '#') lop.push(anh(hinh.tuong));
        else {
          if (!khongSan || c === 'M' || c === 'D' || c === 'F') lop.push(anh(c === 'M' ? 'o-nut-de' : c === 'D' ? 'o-dich' : c === 'F' ? 'o-co' : hinh.san));
          if (c === 'C' || c === 'c') {
            lop.push(<div key={`${x}-${y}-lanh`} style={{...st, background: 'radial-gradient(circle, #E0F2FE 0%, #7DD3FC 70%)', borderRadius: k.o * 0.08, opacity: cuaMo ? 1 : 0.35}} />);
            lop.push(<Img key={`${x}-${y}-cua`} src={staticFile(duongRobot(mua, 'o-cua'))} style={{...st, opacity: cuaMo ? 0 : 1, transform: `scaleX(${cuaMo ? 0.2 : 1})`, transition: 'none'}} />);
          }
        }
        return lop;
      }))}
      {vet && !anSan && !anXe && vetDiem.length > 1 ? (
        <svg style={{position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none'}} width={1080} height={1920}>
          <polyline points={vetDiem.map((q) => `${q.x},${q.y}`).join(' ')} fill="none" stroke="rgba(56,189,248,0.5)" strokeWidth={k.o * 0.08} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${k.o * 0.1} ${k.o * 0.09}`} />
        </svg>
      ) : null}
      {anSan ? null : b.vat.map((v) => {
        if (v.cam) return null;
        const va = a.vat.find((q) => q.id === v.id) ?? v;
        const q = tamKhung(k, va.x + (v.x - va.x) * u, va.y + (v.y - va.y) * u), s = k.o * 0.92;
        return <Img key={v.id} src={staticFile(duongRobot(mua, hinh.vat))} style={{position: 'absolute', left: q.x - s / 2, top: q.y - s / 2, width: s, height: s, filter: 'drop-shadow(0 8px 6px rgba(0,0,0,.3))'}} />;
      })}
      {n?.hoi && f >= t0 ? (() => {
        const o = oTay({...a, nac: n.hoi === 'truoc' ? 'truoc' : n.hoi});
        return <TiaDo k={k} x={o.x} y={o.y} trong={diVaoDuoc(san, a, o.x, o.y)} nhan={n.hoi === 'truoc' ? 'front_clear()' : n.hoi === 'trai' ? 'left_clear()' : 'right_clear()'} u={ease(f, [t0, t0 + 6], [0, 1])} />;
      })() : null}
      {anXe ? null : (
        <div style={{position: 'absolute', left: p.x - S / 2, top: p.y - S / 2, width: S, height: S, transform: `rotate(${goc - 90}deg)`, zIndex: 20,
          filter: 'drop-shadow(0 10px 8px rgba(0,0,0,.35))'}}>
          <Img src={staticFile(duongRobot(mua, ten))} style={{width: S, height: S}} />
          {lan ? <Banh S={S} lan={lan} u={u} /> : null}
        </div>
      )}
      {!anXe && (b.cam !== null || (a.cam !== null && u < 1)) ? (() => {
        const d = 0.72 * k.o, g = (gocTay - 90) * Math.PI / 180, s = k.o * 0.78;
        const qx = p.x + Math.cos(g) * d, qy = p.y + Math.sin(g) * d;
        return <Img src={staticFile(duongRobot(mua, hinh.vat))} style={{position: 'absolute', left: qx - s / 2, top: qy - s / 2, width: s, height: s, zIndex: 21, transform: `rotate(${gocTay - 90}deg)`, filter: 'drop-shadow(0 10px 8px rgba(0,0,0,.35))'}} />;
      })() : null}
      {!anXe && choangTu >= 0 && f >= choangTu ? <Choang x={p.x} y={p.y} since={f - choangTu} o={k.o} /> : null}
      {children ? children(k, b, i) : null}
    </>
  );
};

/** Nhịp đang chạy tại khung f (0 = chưa chạy) và dòng code sáng. */
export const nhipTai = (f: number, nhip: Nhip[], tu = 20, moiNhip = 22) => {
  const i = Math.max(0, Math.min(nhip.length, Math.floor((f - tu) / moiNhip) + (f >= tu ? 1 : 0)));
  return {i, dong: i > 0 ? nhip[i - 1].dong : undefined, xong: f >= tu + nhip.length * moiNhip};
};
