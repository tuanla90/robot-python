/* ============================================================================
   do-duong-day.mjs — BỘ DÒ ĐƯỜNG TẮT cho màn có TẤM ĐẨY và THÙNG NẶNG (mucTieu 'day-thung'): chương `tam-day`.
   Dùng trong máy kiểm (kiem-hoc.mjs, kiem-tam-day.mjs); không nằm trong game.

   BFS theo NHỊP trên trạng thái: (ô xe, hướng, phần quay dở của xích, đếm băng của xe, vị trí + đếm băng của từng thùng).
   Luật y hệt san-hoc.js (loaiRobot 'banh' | 'xich' | 'omni', hamGoc có 'push'):
     - Mỗi nhịp chọn MỘT hành động: chín tổ hợp bánh (trái, phải) ∈ {-1,0,1}² (xe omni thêm slide_left / slide_right),
       HOẶC push() (đẩy mạnh: nhịp có push thì lệnh bánh / trượt bị bỏ, xe đứng yên; BFS không cần xét "push + lệnh bánh").
     - Xe TIẾN vào ô thùng: thùng đi 1 ô nếu ô sau thùng trống (không tường, mép sân, bậc thang S, thùng khác, xe), xe vào ô cũ.
       Lùi / quay / trượt vào ô thùng: xe đứng yên (thùng cản như tường).
     - push(): thùng ngay trước mặt xe trượt thẳng tới khi gặp vật cản (không dừng ở đích).
     - Băng chuyền: xe như cũ (xe bánh đủ 2 nhịp, omni 1 nhịp, xích không bị đẩy); thùng nằm trên băng đủ 2 nhịp liên tiếp thì bị đẩy 1 ô
       theo mũi tên nếu ô kế trống (xe cũng cản).
     - Thùng nằm ở góc chết (hai cạnh vuông góc là tường hoặc mép sân, ô băng dẫn ra khỏi góc thì không chết) mà không phải ô đích →
       trạng thái chết, BFS bỏ (san-hoc.js dừng sớm 'thung-ket').
   Mục tiêu: thắng khi MỌI thùng nằm trên ô đích (D, X, h).

   Hàm xuất:
     nhipDayNganNhat(man, tuyChon) → { nhip, soTrangThai, catNgang, chuoi } | { nhip:null, … }
     chuoiThanhMa(chuoi, loai)     → mã Python (mỗi hành động một nhóm lệnh + wait())
     dungNguCanh(man), trangThaiDau(ctx), hanhDongTuDo(ctx), buocMotNhip(ctx, S, a), laThang(ctx, S)  (để so chéo với SanHoc)
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));

// các tổ hợp bánh (trái, phải); chỉ số 0..8. 9 = slide_left, 10 = slide_right, 11 = push
const TO_HOP = [];
for (let t = -1; t <= 1; t++) for (let p = -1; p <= 1; p++) TO_HOP.push([t, p]);
const CHIEU_QUAY = TO_HOP.map(([t, p]) => SanHoc.XICH_QUAY[t + ',' + p] || 0);
const SLIDE_TRAI = 9, SLIDE_PHAI = 10, PUSH = 11;
const TIEN = TO_HOP.findIndex(([t, p]) => t === 1 && p === 1), LUI = TO_HOP.findIndex(([t, p]) => t === -1 && p === -1);

/** Dựng ngữ cảnh từ một màn. */
export function dungNguCanh(man) {
  const loai = man.loaiRobot || 'banh';
  const san = SanHoc.docSan(man.san);
  const rong = san.rong, cao = san.cao;
  const o = (x, y) => (x < 0 || y < 0 || x >= rong || y >= cao ? -1 : y * rong + x);
  const chan = new Uint8Array(rong * cao);                     // ô xe không vào được
  const raw = new Array(rong * cao);                           // ký hiệu từng ô
  const bang = new Int8Array(rong * cao).fill(-1);
  for (let y = 0; y < cao; y++) for (let x = 0; x < rong; x++) {
    chan[y * rong + x] = SanHoc.lyDoChan(san, loai, x, y) ? 1 : 0;
    const c = san.o[y][x];
    raw[y * rong + x] = c;
    if (SanHoc.BANG[c] !== undefined) bang[y * rong + x] = SanHoc.BANG[c];
  }
  const dich = new Uint8Array(rong * cao);
  for (const d of san.dich) dich[o(d.x, d.y)] = 1;
  const hamGoc = man.hamGoc || SanHoc.HAM_GOC[loai].concat(['push']);
  return { loai, san, rong, cao, o, chan, raw, bang, dich, coDay: hamGoc.indexOf('push') >= 0, thung0: san.thung.map((t) => o(t.x, t.y)), bd: man.batDau, mucTieu: man.mucTieu || 'day-thung' };
}

export function trangThaiDau(ctx) {
  return { x: ctx.bd.x, y: ctx.bd.y, h: ctx.bd.huong || 0, q: -1, db: 0, p: ctx.thung0.slice(), d: ctx.thung0.map(() => 0), chet: false };
}

/** Các hành động: 9 tổ hợp bánh (+ 2 trượt nếu omni) + push (nếu có tấm đẩy). */
export function hanhDongTuDo(ctx) {
  const ds = [];
  for (let b = 0; b < 9; b++) ds.push({ banh: b });
  if (ctx.loai === 'omni') { ds.push({ banh: SLIDE_TRAI }); ds.push({ banh: SLIDE_PHAI }); }
  if (ctx.coDay) ds.push({ banh: PUSH });
  return ds;
}

/** Một nhịp. */
export function buocMotNhip(ctx, S, a) {
  const { rong, cao, loai } = ctx;
  const N = { x: S.x, y: S.y, h: S.h, q: S.q, db: S.db, p: S.p.slice(), d: S.d.slice(), chet: false };
  const cellOf = ctx.o;
  const thungChan = (x, y) => {                                // ô (x, y) không nhận thêm được một thùng?
    const c = cellOf(x, y);
    if (c < 0) return true;
    const k = ctx.raw[c];
    if (k === '#' || k === 'S') return true;
    if (N.p.indexOf(c) >= 0) return true;
    return N.x === x && N.y === y;
  };
  const tuDi = (huongDi, soBuoc, tien) => {
    const v = SanHoc.VEC[huongDi], nx = N.x + v[0] * soBuoc, ny = N.y + v[1] * soBuoc;
    const c = cellOf(nx, ny);
    if (c < 0 || ctx.chan[c]) return;
    const i = N.p.indexOf(c);
    if (i >= 0) {
      if (!(ctx.coDay && tien)) return;
      const bx = nx + v[0], by = ny + v[1];
      if (thungChan(bx, by)) return;
      N.p[i] = cellOf(bx, by); N.d[i] = 0;
    }
    N.x = nx; N.y = ny;
  };
  const pushManh = () => {
    const v = SanHoc.VEC[N.h], fx = N.x + v[0], fy = N.y + v[1], i = N.p.indexOf(cellOf(fx, fy));
    if (i < 0) return;
    let cx = fx, cy = fy;
    while (!thungChan(cx + v[0], cy + v[1])) { cx += v[0]; cy += v[1]; }
    if (cx === fx && cy === fy) return;
    N.p[i] = cellOf(cx, cy); N.d[i] = 0;
  };

  const b = a.banh;
  if (b === PUSH) {
    if (loai === 'xich') N.q = -1;
    pushManh();
  } else if (b === SLIDE_TRAI || b === SLIDE_PHAI) {
    tuDi((N.h + (b === SLIDE_PHAI ? 1 : 3)) % 4, 1, false);
  } else {
    const [t, p] = TO_HOP[b];
    if (loai === 'xich') {
      const q = CHIEU_QUAY[b];
      if (q === 0) {
        N.q = -1;
        if (b === TIEN) tuDi(N.h, 1, true);
        else if (b === LUI) tuDi(N.h, -1, false);
      } else if (S.q === b) { N.h = (N.h + (q > 0 ? 1 : 3)) % 4; N.q = -1; }
      else N.q = b;
    } else if (t === 1 && p === 1) tuDi(N.h, 1, true);
    else if (t === -1 && p === -1) tuDi(N.h, -1, false);
    else if ((t === 1 && p === -1) || (t === -1 && p === 1)) N.h = (N.h + 2) % 4;
    else if ((t === 1 && p === 0) || (t === 0 && p === -1)) N.h = (N.h + 1) % 4;
    else if ((t === 0 && p === 1) || (t === -1 && p === 0)) N.h = (N.h + 3) % 4;
  }

  // băng chuyền của xe
  const cx0 = cellOf(N.x, N.y), hd = ctx.bang[cx0];
  if (hd >= 0) {
    N.db++;
    if (N.db >= 2 && loai === 'xich') N.db = 0;
    else if (N.db >= (loai === 'omni' ? 1 : 2)) {
      const v = SanHoc.VEC[hd], c = cellOf(N.x + v[0], N.y + v[1]);
      if (!(c < 0 || ctx.chan[c] || N.p.indexOf(c) >= 0)) { N.x += v[0]; N.y += v[1]; }
      N.db = 0;
    }
  } else N.db = 0;

  // băng chuyền đẩy thùng
  let dung = [];
  for (let i = 0; i < N.p.length; i++) {
    const c = N.p[i];
    if (ctx.bang[c] >= 0) { N.d[i]++; if (N.d[i] >= 2) dung.push(i); } else N.d[i] = 0;
  }
  let doi = true;
  while (doi && dung.length) {
    doi = false;
    dung = dung.filter((i) => {
      const c = N.p[i], v = SanHoc.VEC[ctx.bang[c]], x = c % rong, y = Math.floor(c / rong);
      if (thungChan(x + v[0], y + v[1])) return true;
      N.p[i] = cellOf(x + v[0], y + v[1]); N.d[i] = 0; doi = true;
      return false;
    });
  }
  dung.forEach((i) => { N.d[i] = 0; });

  // thùng kẹt góc
  if (!laThang(ctx, N)) {
    const tm = (x, y) => { const c = cellOf(x, y); return c < 0 || ctx.raw[c] === '#'; };
    for (let i = 0; i < N.p.length && !N.chet; i++) {
      const c = N.p[i];
      if (ctx.dich[c]) continue;
      const x = c % rong, y = Math.floor(c / rong);
      if (!(tm(x - 1, y) || tm(x + 1, y)) || !(tm(x, y - 1) || tm(x, y + 1))) continue;
      if (ctx.bang[c] >= 0) {
        const v = SanHoc.VEC[ctx.bang[c]], k = cellOf(x + v[0], y + v[1]);
        if (!(k < 0 || ctx.raw[k] === '#' || ctx.raw[k] === 'S')) continue;
      }
      N.chet = true;
    }
  }
  return N;
}

export function laThang(ctx, S) {
  if (!S.p.length) return false;
  return S.p.every((c) => ctx.dich[c]);
}

function khoa(ctx, S) {
  const cell = S.y * ctx.rong + S.x;
  const ds = S.p.map((c, i) => c * 2 + S.d[i]).sort((a, b) => a - b);
  let k = ((((cell * 4 + S.h) * 10 + (S.q + 1)) * 3 + S.db));
  const base = 2 * ctx.rong * ctx.cao + 2;
  for (const c of ds) k = k * base + c;
  return k;
}

export function nhipDayNganNhat(man, tuyChon = {}) {
  const ctx = dungNguCanh(man);
  const toiDa = tuyChon.toiDaTrangThai || 4000000;
  const dau = trangThaiDau(ctx);
  if (laThang(ctx, dau)) return { nhip: 0, soTrangThai: 1, catNgang: false, chuoi: [] };
  const HD = hanhDongTuDo(ctx);
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
        if (N.chet) continue;
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

/** Chuỗi hành động → mã Python: mỗi hành động thành lệnh bánh / trượt / push + wait(). */
export function chuoiThanhMa(chuoi) {
  const dong = [];
  for (const a of chuoi) {
    if (a.banh === PUSH) dong.push('push()');
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

export { TO_HOP, SLIDE_TRAI, SLIDE_PHAI, PUSH, TIEN, LUI };
