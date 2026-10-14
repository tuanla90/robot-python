/* ============================================================================
   do-duong-sung-bong.mjs — BỘ DÒ ĐƯỜNG TẮT cho màn của XE GẮN SÚNG BÓNG (chương `sung-bong`; loaiRobot 'banh', 'omni' hoặc 'xich').
   Dùng trong máy kiểm (kiem-hoc.mjs, kiem-sung-bong.mjs); không nằm trong game.

   BFS theo NHỊP trên trạng thái: (ô xe, hướng, bộ đếm băng chuyền, nút nào đang bật, cửa nào đang mở, băng nào đang tắt, nhịp mod chu kỳ cửa nhịp).
   Luật y hệt san-hoc.js (phần SÚNG BÓNG). Một HÀNH ĐỘNG = một trong: bánh (đứng yên | tiến | quay phải | quay trái; omni thêm trượt trái | phải) | shoot.
   Nhịp có shoot thì xe đứng yên (lệnh bánh cùng nhịp bị bỏ) nên shoot là MỘT hành động riêng. Thứ tự trong nhịp: bắn (băng đổi ngay) → bánh → băng chuyền (theo trạng thái
   mới) → cửa đổi ở cuối nhịp (cửa đóng không đè lên xe).
   (tuyChon.dayDu = true: thêm lùi, quay đầu và "shoot cùng lệnh bánh" để thử đường tắt "lậu" và so chéo với san-hoc.js.)
   Chỉ mục tiêu 'toi-co'. Vật nằm đất / thùng nặng là chướng ngại cố định (xe và bóng đều bị chặn).
   BFS CÓ GIỚI HẠN: tuyChon.toiDaTrangThai (mặc định 400000) và tuyChon.toiDaMs (mặc định 8000); vượt thì trả { nhip: null, catNgang: true }.

   Hàm xuất:
     nhipSungBongNganNhat(man, tuyChon) → { nhip, soTrangThai, catNgang, chuoi } | { nhip:null, … }   (man: MỘT sân)
     nhipSungBongTatCa(man)             → TỔNG nhịp ngắn nhất trên mọi sân (null nếu có sân không giải được hay bị cắt ngang)
     dungNguCanh, trangThaiDau, buocMotNhip, laThang, hanhDongTuDo, chuoiThanhMa — để so chéo với SanHoc
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));

// các tổ hợp bánh (trái, phải); 9 = trượt trái, 10 = trượt phải (chỉ omni)
const TO_HOP = [];
for (let t = -1; t <= 1; t++) for (let p = -1; p <= 1; p++) TO_HOP.push([t, p]);
const SLIDE_TRAI = 9, SLIDE_PHAI = 10;
const DUNG = TO_HOP.findIndex((x) => x[0] === 0 && x[1] === 0);
const TIEN = TO_HOP.findIndex((x) => x[0] === 1 && x[1] === 1);
const PHAI = TO_HOP.findIndex((x) => x[0] === 1 && x[1] === 0);
const TRAI = TO_HOP.findIndex((x) => x[0] === 0 && x[1] === 1);
const LUI = TO_HOP.findIndex((x) => x[0] === -1 && x[1] === -1);
const QUAY_DAU = TO_HOP.findIndex((x) => x[0] === 1 && x[1] === -1);

const gcd = (a, b) => (b ? gcd(b, a % b) : a);

/** Dựng ngữ cảnh từ một màn MỘT sân (san, batDau, loaiRobot, cuaNhip, noi). */
export function dungNguCanh(man) {
  const loai = man.loaiRobot || 'banh';
  if (loai !== 'banh' && loai !== 'omni' && loai !== 'xich') throw new Error('Bộ dò súng bóng chỉ biết xe bánh, omni và xích.');
  if (loai === 'xich') throw new Error('Bộ dò súng bóng chưa hỗ trợ xích (quay chậm); chỉ xe bánh và omni.');
  const san = SanHoc.docSan(man.san, man.mau, man.vatMau, null);
  const rong = san.rong, cao = san.cao;
  const o = (x, y) => y * rong + x;
  const chan = new Uint8Array(rong * cao);                       // xe không vào được (tường, rào, nút, bậc thang với bánh / omni)
  const vatChan = new Uint8Array(rong * cao);                    // vật nằm đất / thùng nặng: chặn xe và bóng
  const banDung = new Uint8Array(rong * cao);                    // bóng dừng ở đây (tường cao, nút, bậc thang)
  for (let y = 0; y < cao; y++) for (let x = 0; x < rong; x++) {
    chan[o(x, y)] = SanHoc.lyDoChan(san, loai, x, y) ? 1 : 0;
    const c = san.o[y][x];
    banDung[o(x, y)] = c === '#' || c === 'N' || c === 'S' ? 1 : 0;
  }
  for (const v of san.vat) vatChan[o(v.x, v.y)] = 1;
  for (const t of san.thung) vatChan[o(t.x, t.y)] = 1;
  const bang = new Int8Array(rong * cao).fill(-1), bangIdx = new Int16Array(rong * cao).fill(-1), bangDs = [];
  for (let y = 0; y < cao; y++) for (let x = 0; x < rong; x++) {
    const h = SanHoc.BANG[san.o[y][x]];
    if (h !== undefined) { bang[o(x, y)] = h; bangIdx[o(x, y)] = bangDs.length; bangDs.push(o(x, y)); }
  }
  const nutIdx = new Int16Array(rong * cao).fill(-1);
  san.nut.forEach((n, i) => { nutIdx[o(n.x, n.y)] = i; });
  const cuaIdx = new Int16Array(rong * cao).fill(-1);
  const cua = san.cua.map((d, i) => { cuaIdx[o(d.x, d.y)] = i; return { cell: o(d.x, d.y), mo0: d.mo, nhip: null }; });
  for (const cn of man.cuaNhip || []) {
    const d = cua[cuaIdx[o(cn.x, cn.y)]];
    if (!d) throw new Error('Cửa nhịp không ở ô cửa.');
    d.nhip = { mo: cn.mo, dong: cn.dong, pha: cn.pha || 0 };
  }
  let L = 1;
  for (const d of cua) if (d.nhip) { const ck = d.nhip.mo + d.nhip.dong; L = (L * ck) / gcd(L, ck); }
  if (L > 2000) throw new Error('Chu kỳ cửa nhịp quá dài cho bộ dò.');
  // nút điều khiển gì
  const nutCua = san.nut.map(() => []), nutBang = san.nut.map(() => []);
  if (man.noi) {
    for (const g of man.noi) {
      const i = nutIdx[o(g.nut.x, g.nut.y)];
      if (i < 0) throw new Error('Nhóm nối: không phải nút.');
      for (const c of g.cua || []) { const j = cuaIdx[o(c.x, c.y)]; if (j < 0 || cua[j].nhip) throw new Error('Nhóm nối: cửa sai.'); if (!nutCua[i].includes(j)) nutCua[i].push(j); }
      for (const b of g.bang || []) { const j = bangIdx[o(b.x, b.y)]; if (j < 0) throw new Error('Nhóm nối: băng sai.'); if (!nutBang[i].includes(j)) nutBang[i].push(j); }
    }
  } else {
    san.nut.forEach((_, i) => { cua.forEach((d, j) => { if (!d.nhip) nutCua[i].push(j); }); bangDs.forEach((_, j) => nutBang[i].push(j)); });
  }
  return { san, loai, rong, cao, o, chan, vatChan, banDung, bang, bangIdx, bangDs, nutIdx, cuaIdx, cua, nutCua, nutBang, L, bd: man.batDau, nguong: loai === 'omni' ? 1 : 2 };
}

function cuaMoNhip(nh, t) { return ((t + nh.pha) % (nh.mo + nh.dong)) < nh.mo; }

/** Trạng thái đầu. nm: mask nút bật; cm: mask cửa ĐANG MỞ; bm: mask băng TẮT; t: nhịp mod L. */
export function trangThaiDau(ctx) {
  let cm = 0;
  ctx.cua.forEach((d, i) => { const mo = d.nhip ? cuaMoNhip(d.nhip, 0) : d.mo0; if (mo) cm |= 1 << i; });
  return { x: ctx.bd.x, y: ctx.bd.y, h: ctx.bd.huong || 0, d: 0, nm: 0, cm, bm: 0, t: 0 };
}

/** Các hành động: bánh | shoot (dayDu: thêm lùi, quay đầu và shoot cùng lệnh bánh). */
export function hanhDongTuDo(ctx, tuyChon = {}) {
  const banh = tuyChon.dayDu ? TO_HOP.map((_, i) => i) : [DUNG, TIEN, PHAI, TRAI];
  if (ctx.loai === 'omni') banh.push(SLIDE_TRAI, SLIDE_PHAI);
  const ds = banh.map((b) => ({ banh: b, shoot: false }));
  ds.push({ banh: DUNG, shoot: true });
  if (tuyChon.dayDu) { ds.push({ banh: TIEN, shoot: true }); ds.push({ banh: PHAI, shoot: true }); if (ctx.loai === 'omni') ds.push({ banh: SLIDE_PHAI, shoot: true }); }
  return ds;
}

function trong(ctx, x, y) { return x >= 0 && y >= 0 && x < ctx.rong && y < ctx.cao; }

/** Một nhịp. Trả về trạng thái mới (bản sao). */
export function buocMotNhip(ctx, S, a) {
  const N = { x: S.x, y: S.y, h: S.h, d: S.d, nm: S.nm, cm: S.cm, bm: S.bm, t: S.t };
  const { rong } = ctx;
  const VEC = SanHoc.VEC;
  const cuaDong = (cell) => { const j = ctx.cuaIdx[cell]; return j >= 0 && !((N.cm >> j) & 1); };
  let doiCua = 0;                                                  // mask cửa sẽ đổi ở cuối nhịp (do nút)
  if (a.shoot) {
    const v = VEC[N.h];
    let x = N.x, y = N.y;
    for (;;) {
      x += v[0]; y += v[1];
      if (!trong(ctx, x, y)) break;
      const cell = y * rong + x;
      if (ctx.banDung[cell] || cuaDong(cell) || ctx.vatChan[cell]) {
        const ni = ctx.nutIdx[cell];
        if (ni >= 0) {
          N.nm ^= 1 << ni;
          for (const b of ctx.nutBang[ni]) N.bm ^= 1 << b;
          for (const j of ctx.nutCua[ni]) doiCua ^= 1 << j;
        }
        break;
      }
    }
  } else {
    const tuDi = (huongDi, soBuoc) => {
      const v = VEC[huongDi], nx = N.x + v[0] * soBuoc, ny = N.y + v[1] * soBuoc;
      if (!trong(ctx, nx, ny)) return;
      const cell = ny * rong + nx;
      if (!ctx.chan[cell] && !ctx.vatChan[cell] && !cuaDong(cell)) { N.x = nx; N.y = ny; }
    };
    if (a.banh === SLIDE_TRAI) tuDi((N.h + 3) % 4, 1);
    else if (a.banh === SLIDE_PHAI) tuDi((N.h + 1) % 4, 1);
    else {
      const [t, p] = TO_HOP[a.banh];
      if (t === 1 && p === 1) tuDi(N.h, 1);
      else if (t === -1 && p === -1) tuDi(N.h, -1);
      else if ((t === 1 && p === -1) || (t === -1 && p === 1)) N.h = (N.h + 2) % 4;
      else if ((t === 1 && p === 0) || (t === 0 && p === -1)) N.h = (N.h + 1) % 4;
      else if ((t === 0 && p === 1) || (t === -1 && p === 0)) N.h = (N.h + 3) % 4;
    }
  }
  const cellXe = N.y * rong + N.x;
  const hb = ctx.bang[cellXe];
  if (hb >= 0 && !((N.bm >> ctx.bangIdx[cellXe]) & 1)) {
    N.d++;
    if (N.d >= ctx.nguong) {
      const v = VEC[hb], nx = N.x + v[0], ny = N.y + v[1];
      if (trong(ctx, nx, ny)) {
        const cell = ny * rong + nx;
        if (!ctx.chan[cell] && !ctx.vatChan[cell] && !cuaDong(cell)) { N.x = nx; N.y = ny; }
      }
      N.d = 0;
    }
  } else N.d = 0;
  // cuối nhịp: cửa đổi (theo nút hay theo chu kỳ); cửa không đóng xuống ô có xe
  const tMoi = S.t + 1;
  ctx.cua.forEach((d, j) => {
    const dangMo = (N.cm >> j) & 1;
    const muon = d.nhip ? (cuaMoNhip(d.nhip, tMoi) ? 1 : 0) : ((doiCua >> j) & 1 ? 1 - dangMo : dangMo);
    if (muon === dangMo) return;
    if (!muon && d.cell === N.y * rong + N.x) return;              // xe đang đứng ở ô cửa: giữ mở
    if (muon) N.cm |= 1 << j; else N.cm &= ~(1 << j);
  });
  N.t = tMoi % ctx.L;
  return N;
}

export function laThang(ctx, S) {
  const co = ctx.san.co;
  return !!co && S.x === co.x && S.y === co.y;
}

function khoa(ctx, S) {
  return S.x + ',' + S.y + ',' + S.h + ',' + S.d + ',' + S.nm + ',' + S.cm + ',' + S.bm + ',' + S.t;
}

export function nhipSungBongNganNhat(man, tuyChon = {}) {
  const ctx = dungNguCanh(man);
  const toiDa = tuyChon.toiDaTrangThai === undefined ? 400000 : tuyChon.toiDaTrangThai;
  const toiDaMs = tuyChon.toiDaMs === undefined ? 8000 : tuyChon.toiDaMs;
  const t0 = Date.now();
  const dau = trangThaiDau(ctx);
  if (laThang(ctx, dau)) return { nhip: 0, soTrangThai: 1, catNgang: false, chuoi: [] };
  const HD = hanhDongTuDo(ctx, tuyChon);
  const thay = new Set();
  const cha = [-1], act = [null];
  const kho = [dau];
  thay.add(khoa(ctx, dau));
  let i = 0, nhip = 0;
  while (i < kho.length) {
    nhip++;
    const cuoiLop = kho.length;
    for (; i < cuoiLop; i++) {
      if ((i & 255) === 0 && Date.now() - t0 >= toiDaMs) return { nhip: null, soTrangThai: kho.length, catNgang: true, chuoi: null };
      const S = kho[i];
      for (const a of HD) {
        const N = buocMotNhip(ctx, S, a);
        const k = khoa(ctx, N);
        if (thay.has(k)) continue;
        thay.add(k);
        cha.push(i); act.push(a); kho.push(N);
        if (laThang(ctx, N)) {
          const chuoi = [];
          for (let j = kho.length - 1; j > 0; j = cha[j]) chuoi.push(act[j]);
          return { nhip, soTrangThai: kho.length, catNgang: false, chuoi: chuoi.reverse() };
        }
        if (kho.length > toiDa) return { nhip: null, soTrangThai: kho.length, catNgang: true, chuoi: null };
      }
    }
  }
  return { nhip: null, soTrangThai: kho.length, catNgang: false, chuoi: null };
}

/** TỔNG nhịp ngắn nhất trên mọi sân của màn (nhiều sân: man.san là mảng sân; mau / batDau / cuaNhip / noi song song nếu là mảng). */
export function nhipSungBongTatCa(man, tuyChon = {}) {
  const nhieu = Array.isArray(man.san[0]);
  const dsSan = nhieu ? man.san : [man.san];
  let tong = 0;
  dsSan.forEach((rows, i) => {
    const lm = SanHoc.lopMauCuaSan(man, i);
    const con = Object.assign({}, man, { san: rows, batDau: Array.isArray(man.batDau) ? man.batDau[i] : man.batDau, mau: lm.mau, vatMau: lm.vatMau, cuaNhip: lm.cuaNhip || undefined, noi: lm.noi || undefined });
    const k = nhipSungBongNganNhat(con, tuyChon).nhip;
    tong = tong === null || k === null ? null : tong + k;
  });
  return tong;
}

/** Chuỗi hành động → mã Python (mỗi hành động một nhóm lệnh + wait(); shoot thì shoot() — cùng lệnh bánh nếu có). */
export function chuoiThanhMa(chuoi) {
  const dong = [];
  for (const a of chuoi) {
    if (a.shoot) dong.push('shoot()');
    if (a.banh === SLIDE_TRAI) dong.push('slide_left()');
    else if (a.banh === SLIDE_PHAI) dong.push('slide_right()');
    else {
      const [t, p] = TO_HOP[a.banh];
      if (t === 1) dong.push('left_move()'); else if (t === -1) dong.push('left_back()');
      if (p === 1) dong.push('right_move()'); else if (p === -1) dong.push('right_back()');
    }
    dong.push('wait()');
  }
  return dong.join('\n') + '\n';
}

export { TO_HOP, SLIDE_TRAI, SLIDE_PHAI, DUNG, TIEN, PHAI, TRAI, LUI, QUAY_DAU };
