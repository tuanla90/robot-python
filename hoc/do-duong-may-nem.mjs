/* ============================================================================
   do-duong-may-nem.mjs — BỘ DÒ ĐƯỜNG TẮT cho màn của XE GẮN MÁY NÉM (chương `may-nem`; loaiRobot 'banh' hoặc 'omni').
   Dùng trong máy kiểm (kiem-hoc.mjs, kiem-may-nem.mjs); không nằm trong game.

   BFS theo NHỊP trên trạng thái: (ô xe, hướng, bộ đếm băng chuyền, vị trí từng vật).
   Vị trí vật: ô trên sân, -1 = đang trong rổ. Vật vỡ thì trạng thái chết (không mở rộng). Vật giống hệt nhau (cùng màu) được xếp tăng dần để gộp
   các trạng thái tương đương; vật khác màu thì phân biệt.
   Luật y hệt san-hoc.js (phần MÁY NÉM). aim(n) KHÔNG tốn nhịp nên không là một hành động: throw() ghép với tầm n nào cũng là MỘT nhịp, nên có ba
   hành động throw tầm 1, 2, 3. Nhịp có load() hay throw() thì xe đứng yên (không gộp với lệnh bánh), nên không có "đường gộp nhịp" như nam châm:
   BFS này cho đúng số nhịp của lời giải chuẩn.
   Một HÀNH ĐỘNG = một trong: bánh (đứng yên | tiến | quay phải | quay trái; omni thêm trượt trái | phải) | load | throw tầm 1 | 2 | 3.
   (tuyChon.dayDu = true: thêm lùi và quay đầu — chín tổ hợp bánh — để thử đường tắt "lậu".)
   Băng chuyền: đứng trên ô băng sau hành động thì đếm +1; đủ ngưỡng (2; omni: 1) thì đẩy 1 ô theo mũi tên (bị chặn thì đứng yên). Vật nằm
   dưới đất KHÔNG bị băng đẩy.
   Thắng: mọi vật nằm trên ô đích (đích có màu thì cùng màu vật).
   Một sân. Nhiều sân: nhipMayNemTatCa() cộng nhịp từng sân.

   Hàm xuất:
     nhipMayNemNganNhat(man, tuyChon) → { nhip, soTrangThai, catNgang, chuoi } | { nhip:null, … }   (man: MỘT sân)
     nhipMayNemTatCa(man)             → tổng nhịp ngắn nhất trên mọi sân (null nếu có sân không giải được)
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

/** Dựng ngữ cảnh từ một màn MỘT sân (san, batDau, mau, vatMau, loaiRobot, roBanDau). */
export function dungNguCanh(man) {
  const loai = man.loaiRobot || 'banh';
  if (loai !== 'banh' && loai !== 'omni') throw new Error('Bộ dò máy ném chỉ biết xe bánh và omni.');
  const san = SanHoc.docSan(man.san, man.mau, man.vatMau, null);
  const rong = san.rong, cao = san.cao;
  const o = (x, y) => y * rong + x;
  const chan = new Uint8Array(rong * cao);                       // xe không vào được (tường, rào, bậc thang với bánh / omni)
  const khongRoi = new Uint8Array(rong * cao);                   // ô vật ném rơi vào thì vỡ (tường, rào, bậc thang)
  for (let y = 0; y < cao; y++) for (let x = 0; x < rong; x++) {
    chan[o(x, y)] = SanHoc.lyDoChan(san, loai, x, y) ? 1 : 0;
    const c = san.o[y][x];
    khongRoi[o(x, y)] = c === '#' || c === '=' || c === 'S' ? 1 : 0;
  }
  const dich = new Uint8Array(rong * cao);
  for (const d of san.dich) dich[o(d.x, d.y)] = 1;
  const bang = new Int8Array(rong * cao).fill(-1);
  for (let y = 0; y < cao; y++) for (let x = 0; x < rong; x++) { const h = SanHoc.BANG[san.o[y][x]]; if (h !== undefined) bang[o(x, y)] = h; }
  const ma = (m) => (m ? SanHoc.MAU_TEN.indexOf(m) + 1 : 0);
  const mauDich = new Uint8Array(rong * cao);
  for (const d of san.dich) mauDich[o(d.x, d.y)] = ma(d.mau);
  const dsVat = san.vat.slice();
  const mauVat = dsVat.map((v) => ma(v.mau));
  const vat0 = dsVat.map((v) => o(v.x, v.y));
  if (man.roBanDau) {                                            // rổ có sẵn một vật: vật cuối cùng, vị trí -1
    const rb = typeof man.roBanDau === 'object' ? man.roBanDau : {};
    mauVat.push(ma(rb.mau)); vat0.push(-1);
  }
  return { san, loai, rong, cao, o, chan, khongRoi, dich, bang, mauDich, mauVat, vat0, bd: man.batDau, nguong: loai === 'omni' ? 1 : 2, lop: mauVat.slice() };
}

/** Trạng thái đầu. pos[i]: ô của vật i, -1 = đang trong rổ. */
export function trangThaiDau(ctx) {
  return { x: ctx.bd.x, y: ctx.bd.y, h: ctx.bd.huong || 0, d: 0, pos: ctx.vat0.slice() };
}

/** Các hành động: bánh, load, throw tầm 1–3. */
export function hanhDongTuDo(ctx, tuyChon = {}) {
  const banh = tuyChon.dayDu ? TO_HOP.map((_, i) => i) : [DUNG, TIEN, PHAI, TRAI];
  if (ctx.loai === 'omni') banh.push(SLIDE_TRAI, SLIDE_PHAI);
  const ds = banh.map((b) => ({ banh: b, nem: null }));
  ds.push({ banh: DUNG, nem: 'load' });
  for (let n = 1; n <= SanHoc.TAM_NEM_TOI_DA; n++) ds.push({ banh: DUNG, nem: 'throw', tam: n });
  return ds;
}

function trong(ctx, x, y) { return x >= 0 && y >= 0 && x < ctx.rong && y < ctx.cao; }

/** Một nhịp. Trả về trạng thái mới (bản sao); N.vo = true nếu có vật vỡ (trạng thái chết). */
export function buocMotNhip(ctx, S, a) {
  const N = { x: S.x, y: S.y, h: S.h, d: S.d, pos: S.pos.slice(), vo: false };
  const { rong } = ctx;
  const VEC = SanHoc.VEC;
  if (a.nem === 'load') {
    if (N.pos.indexOf(-1) < 0) { const i = N.pos.indexOf(N.y * rong + N.x); if (i >= 0) N.pos[i] = -1; }
  } else if (a.nem === 'throw') {
    const i = N.pos.indexOf(-1);
    if (i >= 0) {
      const v = VEC[N.h], dx = N.x + v[0] * a.tam, dy = N.y + v[1] * a.tam;
      if (!trong(ctx, dx, dy) || ctx.khongRoi[dy * rong + dx] || N.pos.indexOf(dy * rong + dx) >= 0) { N.pos[i] = -2; N.vo = true; }
      else N.pos[i] = dy * rong + dx;
    }
  } else {
    const tuDi = (huongDi, soBuoc) => {
      const v = VEC[huongDi], nx = N.x + v[0] * soBuoc, ny = N.y + v[1] * soBuoc;
      if (trong(ctx, nx, ny) && !ctx.chan[ny * rong + nx]) { N.x = nx; N.y = ny; }
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
  const hb = ctx.bang[N.y * rong + N.x];
  if (hb >= 0) {
    N.d++;
    if (N.d >= ctx.nguong) {
      const v = VEC[hb], nx = N.x + v[0], ny = N.y + v[1];
      if (trong(ctx, nx, ny) && !ctx.chan[ny * rong + nx]) { N.x = nx; N.y = ny; }
      N.d = 0;
    }
  } else N.d = 0;
  return N;
}

export function laThang(ctx, S) {
  if (!S.pos.length) return false;
  for (let i = 0; i < S.pos.length; i++) {
    const p = S.pos[i];
    if (p < 0 || !ctx.dich[p] || !(ctx.mauDich[p] === 0 || ctx.mauDich[p] === ctx.mauVat[i])) return false;
  }
  return true;
}

function khoa(ctx, S) {
  const cell = S.y * ctx.rong + S.x;
  const nhom = {};
  S.pos.forEach((p, i) => { (nhom[ctx.lop[i]] = nhom[ctx.lop[i]] || []).push(p + 1); });
  const base = ctx.rong * ctx.cao + 1;
  let k = ((cell * 4 + S.h) * 2 + S.d);
  for (const lop of Object.keys(nhom).sort((a, b) => a - b)) for (const c of nhom[lop].sort((a, b) => a - b)) k = k * base + c;
  return k;
}

export function nhipMayNemNganNhat(man, tuyChon = {}) {
  const ctx = dungNguCanh(man);
  const toiDa = tuyChon.toiDaTrangThai || 2000000;
  const dau = trangThaiDau(ctx);
  if (laThang(ctx, dau)) return { nhip: 0, soTrangThai: 1, catNgang: false, chuoi: [] };
  const HD = hanhDongTuDo(ctx, tuyChon);
  const thay = new Map();
  const cha = [-1], act = [null];
  const kho = [dau];
  thay.set(khoa(ctx, dau), 0);
  let i = 0, nhip = 0;
  while (i < kho.length) {
    nhip++;
    const cuoiLop = kho.length;
    for (; i < cuoiLop; i++) {
      const S = kho[i];
      for (const a of HD) {
        const N = buocMotNhip(ctx, S, a);
        if (N.vo) continue;
        const k = khoa(ctx, N);
        if (thay.has(k)) continue;
        thay.set(k, kho.length);
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

/** Tổng nhịp ngắn nhất trên mọi sân của màn (nhiều sân: man.san là mảng sân; mau / vatMau / batDau / roBanDau song song nếu là mảng). */
export function nhipMayNemTatCa(man, tuyChon = {}) {
  const nhieu = Array.isArray(man.san[0]);
  const dsSan = nhieu ? man.san : [man.san];
  let tong = 0;
  dsSan.forEach((rows, i) => {
    const lm = SanHoc.lopMauCuaSan(man, i);
    const con = Object.assign({}, man, { san: rows, batDau: Array.isArray(man.batDau) ? man.batDau[i] : man.batDau, mau: lm.mau, vatMau: lm.vatMau, roBanDau: Array.isArray(man.roBanDau) ? man.roBanDau[i] : man.roBanDau });
    const k = nhipMayNemNganNhat(con, tuyChon).nhip;
    tong = tong === null || k === null ? null : tong + k;
  });
  return tong;
}

/** Chuỗi hành động → mã Python (mỗi hành động một nhóm lệnh + wait(); throw thì aim(n) trước). */
export function chuoiThanhMa(chuoi) {
  const dong = [];
  for (const a of chuoi) {
    if (a.nem === 'load') dong.push('load()');
    else if (a.nem === 'throw') { dong.push('aim(' + a.tam + ')'); dong.push('throw()'); }
    else if (a.banh === SLIDE_TRAI) dong.push('slide_left()');
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
