/* ============================================================================
   do-duong-tay.mjs — BỘ DÒ ĐƯỜNG TẮT cho màn mục tiêu `dua-vat` (xe có tay gắp).
   Dùng trong máy kiểm (kiem-hoc.mjs, kiem-tay-gap.mjs); không nằm trong game.

   BFS trên TRẠNG THÁI: (ô xe, hướng, tư thế tay, đang cầm hay không, vị trí các vật nằm dưới đất,
   bộ đếm băng chuyền).
   Vật giống hệt nhau (chỉ cần "mọi vật nằm trên ô đích") nên vị trí các vật được xếp tăng dần để
   gộp các trạng thái tương đương. Vật đã vỡ thì bỏ trạng thái đó (không bao giờ thắng được nữa).
   MÀU (chương mau): man.mau / man.vatMau (lớp màu của MỘT sân, xem san-hoc.js) cho ô đích có màu và vật có màu. Ô đích có màu chỉ
   tính khi vật cùng màu nằm trên nó. Có vật mang màu thì các vật không còn "giống hệt nhau": không xếp tăng dần nữa.

   Một HÀNH ĐỘNG = một nhịp = tổ hợp hợp lệ của:
     tay đổi tư thế   : không | arm_down | arm_up                 (3)
     kẹp / thả        : không | grab | release                    (3)
     bánh             : đứng yên | tiến | quay phải | quay trái   (4)     → 36 tổ hợp
   (không có lùi/quay đầu vì màn không cho left_back / right_back; một nhịp không gọi lại cùng nhóm lệnh)
   Thứ tự trong nhịp: (a) tư thế → (b) kẹp / thả ở tư thế mới → (c) bánh (bị chặn nếu tay 'duoi').
   Băng chuyền (>, <, ^, v) có tính: (d) sau bánh, nếu xe đứng trên ô băng thì đếm +1; đủ 2 nhịp liền
   thì đẩy xe 1 ô theo mũi tên (bị chặn thì đứng yên) rồi đếm về 0; không đứng trên băng thì đếm về 0.
   Vật đang cầm đi theo xe; vật nằm dưới đất KHÔNG bị băng đẩy (giống san-hoc.js).

   GIỚI HẠN: dừng khi mở quá `toiDaTrangThai` (mặc định 3 000 000) trạng thái. Khi đó trả về
   { nhip: null, catNgang: true }: kết quả không còn là bằng chứng "không có đường tắt".

   Hàm xuất:
     nhipDuaVatNganNhat(man, tuyChon) → { nhip, soTrangThai, catNgang, chuoi } | { nhip:null, … }
     buocMotNhip(ctx, trangThai, hanhDong)  — một nhịp, dùng để so với SanHoc (kiểm chéo)
     chuoiThanhMa(chuoi)                    — đổi chuỗi hành động thành mã Python (mỗi nhịp kết thúc bằng wait())
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));

const HANH_DONG = [];
for (const tuThe of [null, 'duoi', 'tren']) {
  for (const kep of [null, 'kep', 'tha']) {
    for (const banh of ['dung', 'tien', 'phai', 'trai']) HANH_DONG.push({ tuThe, kep, banh });
  }
}

/** Dựng ngữ cảnh từ một màn (hoặc cấu hình tương tự: san, batDau). */
export function dungNguCanh(man) {
  const san = SanHoc.docSan(man.san, man.mau, man.vatMau);
  const rong = san.rong, cao = san.cao;
  const o = (x, y) => y * rong + x;
  const chan = new Uint8Array(rong * cao);
  for (let y = 0; y < cao; y++) for (let x = 0; x < rong; x++) chan[o(x, y)] = SanHoc.lyDoChan(san, man.loaiRobot || 'banh', x, y) ? 1 : 0;
  const dich = new Uint8Array(rong * cao);
  for (const d of san.dich) dich[o(d.x, d.y)] = 1;
  const bang = new Int8Array(rong * cao).fill(-1);                    // hướng đẩy của ô băng (0..3), -1 = không phải băng
  for (let y = 0; y < cao; y++) for (let x = 0; x < rong; x++) { const h = SanHoc.BANG[san.o[y][x]]; if (h !== undefined) bang[o(x, y)] = h; }
  const ma = (m) => (m ? SanHoc.MAU_TEN.indexOf(m) + 1 : 0);          // 0 = không màu, 1..4 = red, green, blue, yellow
  const mauDich = new Uint8Array(rong * cao);
  for (const d of san.dich) mauDich[o(d.x, d.y)] = ma(d.mau);
  const mauVat = san.vat.map((v) => ma(v.mau));
  return { san, rong, cao, o, chan, bang, dich, mauDich, mauVat, coMau: mauVat.some((m) => m > 0), vat0: san.vat.map((v) => o(v.x, v.y)), bd: man.batDau };
}

/** Trạng thái đầu. pos[i]: ô của vật i, -1 = đang cầm, -2 = vỡ. */
export function trangThaiDau(ctx) {
  return { x: ctx.bd.x, y: ctx.bd.y, h: ctx.bd.huong || 0, t: 0, kep: 0, cam: -1, d: 0, pos: ctx.vat0.slice() };
}

/** Một nhịp. Trả về trạng thái mới (bản sao). Vật vỡ → pos[i] = -2. */
export function buocMotNhip(ctx, S, a) {
  const N = { x: S.x, y: S.y, h: S.h, t: S.t, kep: S.kep, cam: S.cam, d: S.d, pos: S.pos.slice() };
  const { rong } = ctx;
  // (a) tư thế
  if (a.tuThe === 'duoi') N.t = 1; else if (a.tuThe === 'tren') N.t = 0;
  // (b) kẹp / thả ở tư thế mới
  const cell = N.y * rong + N.x;
  if (a.kep === 'kep') {
    if (N.cam < 0) {
      const i = N.pos.indexOf(cell);                  // vật đang nằm ở ô này (nếu có)
      N.kep = 1;
      if (i >= 0 && N.t === 1) { N.pos[i] = -1; N.cam = i; }
    }
  } else if (a.kep === 'tha') {
    if (N.cam < 0) N.kep = 0;
    else if (N.t === 0) { N.pos[N.cam] = -2; N.cam = -1; N.kep = 0; }
    else if (N.pos.indexOf(cell) < 0) { N.pos[N.cam] = cell; N.cam = -1; N.kep = 0; }
  }
  // (c) bánh
  if (!(N.t === 1 && a.banh !== 'dung')) {
    if (a.banh === 'tien') {
      const v = SanHoc.VEC[N.h], nx = N.x + v[0], ny = N.y + v[1];
      if (nx >= 0 && ny >= 0 && nx < ctx.rong && ny < ctx.cao && !ctx.chan[ny * rong + nx]) { N.x = nx; N.y = ny; }
    } else if (a.banh === 'phai') N.h = (N.h + 1) % 4;
    else if (a.banh === 'trai') N.h = (N.h + 3) % 4;
  }
  // (d) băng chuyền
  const hb = ctx.bang[N.y * rong + N.x];
  if (hb >= 0) {
    N.d++;
    if (N.d >= 2) {
      const v = SanHoc.VEC[hb], nx = N.x + v[0], ny = N.y + v[1];
      if (nx >= 0 && ny >= 0 && nx < ctx.rong && ny < ctx.cao && !ctx.chan[ny * rong + nx]) { N.x = nx; N.y = ny; }
      N.d = 0;
    }
  } else N.d = 0;
  return N;
}

export function laThang(ctx, S) {
  if (!S.pos.length) return false;
  return S.pos.every((p, i) => p >= 0 && ctx.dich[p] && (ctx.mauDich[p] === 0 || ctx.mauDich[p] === ctx.mauVat[i]));
}

function khoa(ctx, S) {
  // Khóa số, KHÔNG bao giờ trùng giữa hai trạng thái khác nhau: phần đầu (ô xe, hướng, tay, cầm hay không,
  // bộ đếm băng) rồi MỖI vật một chữ số (0 = đang cầm, p + 1 = nằm ở ô p), xếp tăng dần để các vật giống nhau gộp được.
  // (Bản cũ chỉ ghi các vật nằm dưới đất nên có thể trùng khóa giữa các trạng thái khác nhau.)
  const cell = S.y * ctx.rong + S.x;
  const chuSo = S.pos.map((p) => p + 1);                                     // vỡ (-2) đã bị loại trước khi tới đây
  if (!ctx.coMau) chuSo.sort((a, b) => a - b);                               // vật có màu thì phân biệt từng vật, không xếp lại
  let k = (((cell * 4 + S.h) * 2 + S.t) * 2 + (S.cam >= 0 ? 1 : 0)) * 2 + S.d;        // (độ đóng của kẹp không ảnh hưởng luật nên không vào khóa)
  for (const c of chuSo) k = k * (ctx.rong * ctx.cao + 1) + c;
  return k;
}

export function nhipDuaVatNganNhat(man, tuyChon = {}) {
  const ctx = dungNguCanh(man);
  const toiDa = tuyChon.toiDaTrangThai || 3000000;
  const dau = trangThaiDau(ctx);
  if (laThang(ctx, dau)) return { nhip: 0, soTrangThai: 1, catNgang: false, chuoi: [] };
  const thay = new Map();
  const cha = [-1], act = [-1];
  const kho = [dau];
  thay.set(khoa(ctx, dau), 0);
  let dau_i = 0, hetLop = 1, nhip = 0, moRong = 0;
  while (dau_i < kho.length) {
    nhip++;
    const cuoiLop = kho.length;
    for (; dau_i < cuoiLop; dau_i++) {
      const S = kho[dau_i];
      for (let ai = 0; ai < HANH_DONG.length; ai++) {
        const N = buocMotNhip(ctx, S, HANH_DONG[ai]);
        if (N.pos.some((p) => p === -2)) continue;                      // vỡ: bỏ
        const k = khoa(ctx, N);
        if (thay.has(k)) continue;
        thay.set(k, kho.length);
        cha.push(dau_i); act.push(ai); kho.push(N);
        if (laThang(ctx, N)) {
          const chuoi = [];
          for (let i = kho.length - 1; i > 0; i = cha[i]) chuoi.push(HANH_DONG[act[i]]);
          return { nhip, soTrangThai: kho.length, catNgang: false, chuoi: chuoi.reverse() };
        }
        if (kho.length > toiDa) return { nhip: null, soTrangThai: kho.length, catNgang: true, chuoi: null };
      }
    }
  }
  return { nhip: null, soTrangThai: kho.length, catNgang: false, chuoi: null };      // không tới được
}

/** Chuỗi hành động → mã Python (mỗi nhịp một nhóm dòng + wait()). */
export function chuoiThanhMa(chuoi) {
  const dong = [];
  for (const a of chuoi) {
    if (a.tuThe === 'duoi') dong.push('arm_down()'); else if (a.tuThe === 'tren') dong.push('arm_up()');
    if (a.kep === 'kep') dong.push('grab()'); else if (a.kep === 'tha') dong.push('release()');
    if (a.banh === 'tien') dong.push('left_move()', 'right_move()');
    else if (a.banh === 'phai') dong.push('left_move()');
    else if (a.banh === 'trai') dong.push('right_move()');
    dong.push('wait()');
  }
  return dong.join('\n') + '\n';
}

export { HANH_DONG };
