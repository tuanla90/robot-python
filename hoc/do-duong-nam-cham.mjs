/* ============================================================================
   do-duong-nam-cham.mjs — BỘ DÒ ĐƯỜNG TẮT cho màn của XE GẮN NAM CHÂM (chương `nam-cham`; loaiRobot 'banh' hoặc 'omni').
   Dùng trong máy kiểm (kiem-hoc.mjs, kiem-nam-cham.mjs); không nằm trong game.

   BFS theo NHỊP trên trạng thái: (ô xe, hướng, nam châm bật hay tắt, bộ đếm băng chuyền, vị trí từng vật).
   Vị trí vật: ô trên sân, hoặc -1 = đang dính nam châm. Vật giống hệt nhau (cùng chất, cùng màu) được xếp tăng dần để gộp các
   trạng thái tương đương; vật khác chất hay khác màu thì phân biệt.
   Luật y hệt san-hoc.js (phần NAM CHÂM):
     Thứ tự trong nhịp: (a) lệnh nam châm  →  (b) bánh chạy  →  (c) băng chuyền  →  (d) HÚT.
     (a) magnet_on: bật. magnet_off: tắt; nếu đang dính một vật thì thả xuống ô ngay trước mũi xe khi ô đó nhận được (không tường,
         mép sân, bậc thang, vật nằm); bị chặn thì vật vẫn dính và nam châm vẫn bật.
     (d) nam châm bật, chưa dính vật: nhìn ô 1 rồi ô 2 trước mặt (tường, mép sân chắn); vật đầu tiên gặp là sắt thì bị hút và dính; là gỗ thì không.
   Một HÀNH ĐỘNG = lệnh nam châm (không | bật | tắt) × hành động bánh. Hành động bánh (như bộ dò tay gắp, không có lùi / quay đầu 1 nhịp):
     xe 'banh': đứng yên | tiến | quay phải | quay trái   (4)
     xe 'omni': thêm trượt trái | trượt phải              (6)
   (tuyChon.dayDu = true: thêm lùi và quay đầu — chín tổ hợp bánh — để thử đường tắt "lậu".)
   tuyChon.tachNhip = true: lệnh nam châm phải đứng MỘT MÌNH trong nhịp (bánh đứng yên), đúng cách viết "magnet_on()  wait()" / "magnet_off()  wait()" của
   lời giải chuẩn. Không có tuyChon này, magnet_on() / magnet_off() gộp được vào nhịp đi / quay (vd "magnet_on()  move()" là MỘT nhịp): đường ngắn hơn, là bài
   tối ưu riêng (như gộp pick() / drop() ở chương tay gắp).
   Băng chuyền: đứng trên ô băng sau hành động thì đếm +1; đủ ngưỡng (2; omni: 1) thì đẩy 1 ô theo mũi tên (bị chặn thì đứng yên).
   Vật nằm dưới đất KHÔNG bị băng đẩy; vật dính đi theo xe. Luật vật 14/10: vật nằm đất CHIẾM Ô — xe (và băng chuyền) không đưa xe vào ô có vật.
   Thắng: mọi vật cần (man.vatCan === 'sat' thì chỉ vật sắt) nằm trên ô đích (ô đích có màu thì cùng màu vật).
   Một sân. Nhiều sân: nhipNamChamTatCa() cộng nhịp từng sân.

   Hàm xuất:
     nhipNamChamNganNhat(man, tuyChon) → { nhip, soTrangThai, catNgang, chuoi } | { nhip:null, … }   (man: MỘT sân)
     nhipNamChamTatCa(man)             → tổng nhịp ngắn nhất trên mọi sân (null nếu có sân không giải được)
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

/** Dựng ngữ cảnh từ một màn MỘT sân (san, batDau, mau, vatMau, vatChat, vatCan, loaiRobot). */
export function dungNguCanh(man) {
  const loai = man.loaiRobot || 'banh';
  if (loai !== 'banh' && loai !== 'omni') throw new Error('Bộ dò nam châm chỉ biết xe bánh và omni.');
  const san = SanHoc.docSan(man.san, man.mau, man.vatMau, man.vatChat);
  const rong = san.rong, cao = san.cao;
  const o = (x, y) => y * rong + x;
  const chan = new Uint8Array(rong * cao);                       // xe không vào được (tường, bậc thang với bánh / omni)
  const tuongS = new Uint8Array(rong * cao);                     // ô tường hay bậc thang: không nhận vật thả xuống, chắn hút nếu là tường
  const tuong = new Uint8Array(rong * cao);
  for (let y = 0; y < cao; y++) for (let x = 0; x < rong; x++) {
    chan[o(x, y)] = SanHoc.lyDoChan(san, loai, x, y) ? 1 : 0;
    tuong[o(x, y)] = san.o[y][x] === '#' ? 1 : 0;
    tuongS[o(x, y)] = san.o[y][x] === '#' || san.o[y][x] === 'S' ? 1 : 0;
  }
  const dich = new Uint8Array(rong * cao);
  for (const d of san.dich) dich[o(d.x, d.y)] = 1;
  const bang = new Int8Array(rong * cao).fill(-1);
  for (let y = 0; y < cao; y++) for (let x = 0; x < rong; x++) { const h = SanHoc.BANG[san.o[y][x]]; if (h !== undefined) bang[o(x, y)] = h; }
  const ma = (m) => (m ? SanHoc.MAU_TEN.indexOf(m) + 1 : 0);
  const mauDich = new Uint8Array(rong * cao);
  for (const d of san.dich) mauDich[o(d.x, d.y)] = ma(d.mau);
  // vật nằm sẵn: các ô o / X của sân, rồi man.vatThem ({x, y, chat?, mau?}: vật đặt ở ô không viết được bằng ký hiệu, vd trên băng chuyền), mỗi ô một vật như san-hoc.js
  const dsVat = san.vat.slice();
  for (const e of man.vatThem || []) if (!dsVat.some((v) => v.x === e.x && v.y === e.y)) dsVat.push(e);
  const mauVat = dsVat.map((v) => ma(v.mau));
  const sat = dsVat.map((v) => (v.chat === 'sat' ? 1 : 0));
  const can = dsVat.map((v, i) => (man.vatCan === 'sat' ? sat[i] === 1 : true));
  return { san, loai, rong, cao, o, chan, tuong, tuongS, dich, bang, mauDich, mauVat, sat, can, vat0: dsVat.map((v) => o(v.x, v.y)), bd: man.batDau,
    nguong: loai === 'omni' ? 1 : 2, lop: dsVat.map((v, i) => sat[i] * 8 + mauVat[i]) };
}

/** Trạng thái đầu. pos[i]: ô của vật i, -1 = đang dính nam châm. */
export function trangThaiDau(ctx) {
  return { x: ctx.bd.x, y: ctx.bd.y, h: ctx.bd.huong || 0, bat: 0, d: 0, pos: ctx.vat0.slice() };
}

/** Các hành động: lệnh nam châm × hành động bánh. */
export function hanhDongTuDo(ctx, tuyChon = {}) {
  const banh = tuyChon.dayDu ? TO_HOP.map((_, i) => i) : [DUNG, TIEN, PHAI, TRAI];
  if (ctx.loai === 'omni') banh.push(SLIDE_TRAI, SLIDE_PHAI);
  const ds = [];
  for (const nc of [null, 'on', 'off']) for (const b of banh) {
    if (tuyChon.tachNhip && nc !== null && b !== DUNG) continue;
    ds.push({ nc, banh: b });
  }
  return ds;
}

function trong(ctx, x, y) { return x >= 0 && y >= 0 && x < ctx.rong && y < ctx.cao; }

/** Một nhịp. Trả về trạng thái mới (bản sao). */
export function buocMotNhip(ctx, S, a) {
  const N = { x: S.x, y: S.y, h: S.h, bat: S.bat, d: S.d, pos: S.pos.slice() };
  const { rong } = ctx;
  const VEC = SanHoc.VEC;
  // (a) nam châm
  if (a.nc === 'on') N.bat = 1;
  else if (a.nc === 'off') {
    const i = N.pos.indexOf(-1);
    if (i < 0) N.bat = 0;
    else {
      const v = VEC[N.h], fx = N.x + v[0], fy = N.y + v[1];
      const chan = !trong(ctx, fx, fy) || ctx.tuongS[fy * rong + fx] || N.pos.indexOf(fy * rong + fx) >= 0;
      if (!chan) { N.pos[i] = fy * rong + fx; N.bat = 0; }
    }
  }
  // (b) bánh
  const tuDi = (huongDi, soBuoc) => {
    const v = VEC[huongDi], nx = N.x + v[0] * soBuoc, ny = N.y + v[1] * soBuoc;
    if (trong(ctx, nx, ny) && !ctx.chan[ny * rong + nx] && N.pos.indexOf(ny * rong + nx) < 0) { N.x = nx; N.y = ny; }
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
  // (c) băng chuyền
  const hb = ctx.bang[N.y * rong + N.x];
  if (hb >= 0) {
    N.d++;
    if (N.d >= ctx.nguong) {
      const v = VEC[hb], nx = N.x + v[0], ny = N.y + v[1];
      if (trong(ctx, nx, ny) && !ctx.chan[ny * rong + nx] && N.pos.indexOf(ny * rong + nx) < 0) { N.x = nx; N.y = ny; }
      N.d = 0;
    }
  } else N.d = 0;
  // (d) hút
  if (N.bat && N.pos.indexOf(-1) < 0) {
    const v = VEC[N.h];
    for (let k = 1; k <= SanHoc.TAM_HUT; k++) {
      const x = N.x + v[0] * k, y = N.y + v[1] * k;
      if (!trong(ctx, x, y) || ctx.tuong[y * rong + x]) break;
      const i = N.pos.indexOf(y * rong + x);
      if (i >= 0) { if (ctx.sat[i]) N.pos[i] = -1; break; }
    }
  }
  return N;
}

export function laThang(ctx, S) {
  let coCan = false;
  for (let i = 0; i < S.pos.length; i++) {
    if (!ctx.can[i]) continue;
    coCan = true;
    const p = S.pos[i];
    if (p < 0 || !ctx.dich[p] || !(ctx.mauDich[p] === 0 || ctx.mauDich[p] === ctx.mauVat[i])) return false;
  }
  return coCan;
}

function khoa(ctx, S) {
  const cell = S.y * ctx.rong + S.x;
  // vật cùng lớp (chất + màu) xếp tăng dần
  const nhom = {};
  S.pos.forEach((p, i) => { (nhom[ctx.lop[i]] = nhom[ctx.lop[i]] || []).push(p + 1); });
  const base = ctx.rong * ctx.cao + 1;
  let k = (((cell * 4 + S.h) * 2 + S.bat) * 2 + S.d);
  for (const lop of Object.keys(nhom).sort((a, b) => a - b)) for (const c of nhom[lop].sort((a, b) => a - b)) k = k * base + c;
  return k;
}

export function nhipNamChamNganNhat(man, tuyChon = {}) {
  const ctx = dungNguCanh(man);
  const toiDa = tuyChon.toiDaTrangThai || 3000000;
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

/** Tổng nhịp ngắn nhất trên mọi sân của màn (nhiều sân: man.san là mảng sân; mau / vatMau / vatChat / batDau song song). */
export function nhipNamChamTatCa(man, tuyChon = {}) {
  const nhieu = Array.isArray(man.san[0]);
  const dsSan = nhieu ? man.san : [man.san];
  let tong = 0;
  dsSan.forEach((rows, i) => {
    const lm = SanHoc.lopMauCuaSan(man, i);
    const con = Object.assign({}, man, { san: rows, batDau: Array.isArray(man.batDau) ? man.batDau[i] : man.batDau, mau: lm.mau, vatMau: lm.vatMau, vatChat: lm.vatChat, vatThem: lm.vatThem });
    const k = nhipNamChamNganNhat(con, tuyChon).nhip;
    tong = tong === null || k === null ? null : tong + k;
  });
  return tong;
}

/** Chuỗi hành động → mã Python (mỗi hành động một nhóm lệnh + wait()). */
export function chuoiThanhMa(chuoi) {
  const dong = [];
  for (const a of chuoi) {
    if (a.nc === 'on') dong.push('magnet_on()'); else if (a.nc === 'off') dong.push('magnet_off()');
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
