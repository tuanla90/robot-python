/* ============================================================================
   do-duong-che-may-nem.mjs — BỘ DÒ ĐƯỜNG TẮT cho chương `che-may-nem` (xe hai bánh gắn MÁY NÉM, loaiRobot 'banh', mục tiêu 'bong-mo' hoặc 'dua-vat').
   Dùng trong máy kiểm (kiem-che-may-nem.mjs, kiem-hoc.mjs); không nằm trong game.

   BFS theo NHỊP trên trạng thái: (ô xe, hướng, bộ đếm băng chuyền, các ô diQua đã qua, vị trí từng vật). Luật y hệt san-hoc.js, phần MÁY NÉM:
     - vị trí vật: ô trên sân, -1 = đang trong rổ (rổ chứa một vật), -2 = vỡ (trạng thái chết, không mở rộng). Vật cùng màu giống hệt nhau được xếp tăng dần để gộp
       các trạng thái tương đương; vật khác màu thì phân biệt (màn che-may-nem.6 và .8 có vật đỏ / xanh dương, bóng mờ chấm theo màu);
     - aim(n) KHÔNG tốn nhịp nên không là một hành động: throw() ghép với tầm n nào cũng là MỘT nhịp (ba hành động throw tầm 1, 2, 3); load() và throw() mỗi lệnh
       đúng một nhịp riêng, xe đứng yên, KHÔNG gộp với lệnh bánh. Nên BFS cho ĐÚNG nhịp của lời giải chuẩn khi lời giải viết gọn;
     - load() nạp vật ở Ô TRƯỚC MẶT xe (vật nằm đất chiếm ô: xe và băng chuyền không đưa xe vào ô có vật); throw() rơi xuống ô cách xe đúng `tam` ô theo hướng mặt, bay qua mọi thứ ở giữa;
       ô rơi là tường, hàng rào, bậc thang, thùng nặng, ngoài sân hay đã có vật khác thì vật VỠ;
     - hành động bánh theo PHẦN CỨNG của màn (toHopChoPhep của do-duong-che-xe.mjs: sáu hiệu quả tien, lui, phai, trai, dau, cho; màn hỏng bánh có ít hơn);
       load / throw có trong hành động nếu phần cứng có load / throw;
     - băng chuyền: đứng trên ô băng sau một nhịp thì đếm +1, đủ 2 thì đẩy 1 ô theo mũi tên (bị chặn thì đứng yên); vật nằm đất KHÔNG bị băng đẩy.
   Thắng: 'bong-mo' — chạy xong mà xe đúng ô và hướng của xe mờ, đã qua mọi ô diQua (◆), mọi vật nằm đất đúng các ô vật mờ (đúng màu nếu khai; không thừa, không thiếu, không trong rổ, không vỡ);
          'dua-vat' — mọi vật nằm trên ô đích (đích có màu thì cùng màu vật); vật trong rổ chưa tính.
   Một sân. Nhiều sân: nhipCheMayNemTatCa() cộng nhịp từng sân.

   Hàm xuất:
     nhipCheMayNemNganNhat(man, tuyChon) → { nhip, soTrangThai, catNgang, chuoi } | { nhip:null, … }   (man: MỘT sân; tuyChon.batDau = { x, y, huong, pos, daQua } để bắt đầu từ trạng thái giữa chừng,
                                                                                                          tuyChon.phanCung, tuyChon.toiDaTrangThai)
     nhipCheMayNemTatCa(man, hamCuaEm, tuyChon) → tổng nhịp ngắn nhất mọi sân (null nếu có sân không giải được); màn có đoạn chương trình CỐ ĐỊNH chạy trước phần người chơi chế
                                                  (che-may-nem.9: go_load() của màn) thì chạy thật đoạn đó rồi BFS từ trạng thái sau nó
     chuoiThanhMa(chuoi, man) → mã Python lệnh gốc của đường (đúng phanCung của màn) để kiểm chéo với SanHoc.chay
     dungNguCanh, trangThaiDau, hanhDongChoPhep, buocMotNhip, laDich, moPhong — để so chéo với SanHoc.chay bằng chương trình ngẫu nhiên (kiem-che-may-nem.mjs)
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { toHopChoPhep, hieuQua } from './do-duong-che-xe.mjs';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));

const MAU_MA = (m) => (m ? SanHoc.MAU_TEN.indexOf(m) + 1 : 0);

/** Dựng ngữ cảnh từ một màn MỘT sân (san, batDau, mau, vatMau, mucTieu, bongMo, loaiRobot, hamGoc / phanCung). */
export function dungNguCanh(man, tuyChon = {}) {
  const loai = man.loaiRobot || 'banh';
  if (loai !== 'banh') throw new Error('Bộ dò che-may-nem chỉ biết xe hai bánh.');
  const san = SanHoc.docSan(man.san, man.mau, man.vatMau, null);
  const rong = san.rong, cao = san.cao;
  const o = (x, y) => y * rong + x;
  const chan = new Uint8Array(rong * cao);                       // xe không vào được (tường, rào, bậc thang, gầm thấp, nút)
  const khongRoi = new Uint8Array(rong * cao);                   // ô vật ném rơi vào thì vỡ (tường, rào, bậc thang)
  for (let y = 0; y < cao; y++) for (let x = 0; x < rong; x++) {
    chan[o(x, y)] = SanHoc.lyDoChan(san, loai, x, y) ? 1 : 0;
    const c = san.o[y][x];
    khongRoi[o(x, y)] = c === '#' || c === '=' || c === 'S' ? 1 : 0;
  }
  const thung = new Uint8Array(rong * cao);
  for (const t of san.thung) { chan[o(t.x, t.y)] = 1; khongRoi[o(t.x, t.y)] = 1; }
  const dich = new Uint8Array(rong * cao), mauDich = new Uint8Array(rong * cao);
  for (const d of san.dich) { dich[o(d.x, d.y)] = 1; mauDich[o(d.x, d.y)] = MAU_MA(d.mau); }
  const bang = new Int8Array(rong * cao).fill(-1);
  for (let y = 0; y < cao; y++) for (let x = 0; x < rong; x++) { const h = SanHoc.BANG[san.o[y][x]]; if (h !== undefined) bang[o(x, y)] = h; }
  const mauVat = san.vat.map((v) => MAU_MA(v.mau));
  const vat0 = san.vat.map((v) => o(v.x, v.y));
  const pc = tuyChon.phanCung || SanHoc.phanCungCua(man);
  const mucTieu = man.mucTieu || 'toi-co';
  if (mucTieu !== 'bong-mo' && mucTieu !== 'dua-vat') throw new Error('Bộ dò che-may-nem chỉ biết mục tiêu bong-mo và dua-vat.');
  let bm = null;
  if (mucTieu === 'bong-mo') {
    const b = man.bongMo;
    bm = {
      x: b.x, y: b.y, huong: b.huong === undefined || b.huong === null ? null : b.huong,
      diQua: (b.diQua || []).map((q) => o(q.x, q.y)), vat: (b.vat || []).map((q) => ({ o: o(q.x, q.y), mau: MAU_MA(q.mau) }))
    };
  }
  return { san, loai, rong, cao, o, chan, khongRoi, dich, bang, mauDich, mauVat, vat0, bd: man.batDau, nguong: 2, mucTieu, bm, pc, hieuQuaChoPhep: toHopChoPhep(man, { phanCung: pc }), lop: mauVat.slice() };
}

/** Trạng thái đầu (hoặc tuyChon.batDau = { x, y, huong, pos, daQua }: pos[i] là ô của vật i, -1 = trong rổ; daQua: mảng chỉ số ô diQua đã qua). */
export function trangThaiDau(ctx, batDau) {
  const bd = batDau || ctx.bd;
  let m = 0;
  if (ctx.bm) (bd.daQua || []).forEach((c) => { const i = ctx.bm.diQua.indexOf(c); if (i >= 0) m |= 1 << i; });
  return { x: bd.x, y: bd.y, h: bd.huong || 0, d: 0, m, pos: (bd.pos || ctx.vat0).slice() };
}

/** Các hành động của một nhịp: một hiệu quả bánh (theo phần cứng), hoặc load, hoặc throw tầm 1–3. */
export function hanhDongChoPhep(ctx) {
  const ds = ctx.hieuQuaChoPhep.map((hq) => ({ hq, nem: null }));
  if (ctx.pc.includes('load')) ds.push({ hq: 'cho', nem: 'load' });
  if (ctx.pc.includes('throw')) for (let n = 1; n <= SanHoc.TAM_NEM_TOI_DA; n++) ds.push({ hq: 'cho', nem: 'throw', tam: n });
  return ds;
}

function trong(ctx, x, y) { return x >= 0 && y >= 0 && x < ctx.rong && y < ctx.cao; }

/** Một nhịp. Trả về trạng thái mới (bản sao); N.vo = true nếu có vật vỡ (trạng thái chết). */
export function buocMotNhip(ctx, S, a) {
  const N = { x: S.x, y: S.y, h: S.h, d: S.d, m: S.m, pos: S.pos.slice(), vo: false };
  const { rong } = ctx;
  const VEC = SanHoc.VEC;
  if (a.nem === 'load') {
    if (N.pos.indexOf(-1) < 0) {                                  // rổ trống: nạp vật ở Ô TRƯỚC MẶT
      const v = VEC[N.h], fx = N.x + v[0], fy = N.y + v[1];
      const i = trong(ctx, fx, fy) ? N.pos.indexOf(fy * rong + fx) : -1;
      if (i >= 0) N.pos[i] = -1;
    }
  } else if (a.nem === 'throw') {
    const i = N.pos.indexOf(-1);
    if (i >= 0) {
      const v = VEC[N.h], dx = N.x + v[0] * a.tam, dy = N.y + v[1] * a.tam;
      if (!trong(ctx, dx, dy) || ctx.khongRoi[dy * rong + dx] || N.pos.indexOf(dy * rong + dx) >= 0) { N.pos[i] = -2; N.vo = true; }
      else N.pos[i] = dy * rong + dx;
    }
  } else {
    const tuDi = (soBuoc) => {
      const v = VEC[N.h], nx = N.x + v[0] * soBuoc, ny = N.y + v[1] * soBuoc;
      if (trong(ctx, nx, ny) && !ctx.chan[ny * rong + nx] && N.pos.indexOf(ny * rong + nx) < 0) { N.x = nx; N.y = ny; }
    };
    if (a.hq === 'tien') tuDi(1);
    else if (a.hq === 'lui') tuDi(-1);
    else if (a.hq === 'phai') N.h = (N.h + 1) % 4;
    else if (a.hq === 'trai') N.h = (N.h + 3) % 4;
    else if (a.hq === 'dau') N.h = (N.h + 2) % 4;
  }
  const hb = ctx.bang[N.y * rong + N.x];
  if (hb >= 0) {
    N.d++;
    if (N.d >= ctx.nguong) {
      const v = VEC[hb], nx = N.x + v[0], ny = N.y + v[1];
      if (trong(ctx, nx, ny) && !ctx.chan[ny * rong + nx] && N.pos.indexOf(ny * rong + nx) < 0) { N.x = nx; N.y = ny; }
      N.d = 0;
    }
  } else N.d = 0;
  if (ctx.bm) { const i = ctx.bm.diQua.indexOf(N.y * rong + N.x); if (i >= 0) N.m |= 1 << i; }
  return N;
}

/** Đạt mục tiêu ngay ở trạng thái S (bong-mo: xét khi chạy xong; dua-vat: thắng ngay khi mọi vật nằm trên đích). */
export function laDich(ctx, S) {
  if (S.pos.some((p) => p < 0)) return false;                    // vật còn trong rổ hay đã vỡ
  if (ctx.mucTieu === 'dua-vat') {
    if (!S.pos.length) return false;
    for (let i = 0; i < S.pos.length; i++) {
      const p = S.pos[i];
      if (!ctx.dich[p] || !(ctx.mauDich[p] === 0 || ctx.mauDich[p] === ctx.mauVat[i])) return false;
    }
    return true;
  }
  const bm = ctx.bm;
  if (S.x !== bm.x || S.y !== bm.y) return false;
  if (bm.huong !== null && S.h !== bm.huong) return false;
  if (S.m !== (1 << bm.diQua.length) - 1) return false;
  if (bm.vat.length !== S.pos.length) return false;
  return bm.vat.every((q) => { const i = S.pos.indexOf(q.o); return i >= 0 && (!q.mau || ctx.mauVat[i] === q.mau); });
}

function khoa(ctx, S) {
  const nhom = {};
  S.pos.forEach((p, i) => { (nhom[ctx.lop[i]] = nhom[ctx.lop[i]] || []).push(p + 2); });
  const base = ctx.rong * ctx.cao + 2;
  let k = (((S.y * ctx.rong + S.x) * 4 + S.h) * 2 + S.d) * (1 << Math.max(1, ctx.bm ? ctx.bm.diQua.length : 1)) + S.m;
  for (const l of Object.keys(nhom).sort((a, b) => a - b)) for (const c of nhom[l].sort((a, b) => a - b)) k = k * base + c;
  return k;
}

/** Nhịp ngắn nhất MỘT sân. */
export function nhipCheMayNemNganNhat(man, tuyChon = {}) {
  const ctx = dungNguCanh(man, tuyChon);
  const toiDa = tuyChon.toiDaTrangThai || 3000000;
  const dau = trangThaiDau(ctx, tuyChon.batDau);
  if (laDich(ctx, dau)) return { nhip: 0, soTrangThai: 1, catNgang: false, chuoi: [] };
  const HD = hanhDongChoPhep(ctx);
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
        if (laDich(ctx, N)) {
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

/** Màn con MỘT sân thứ i của màn m (lớp màu, bóng mờ, bắt đầu theo sân). */
function sanCon(man, i) {
  const lm = SanHoc.lopMauCuaSan(man, i);
  const nhieu = Array.isArray(man.san[0]);
  return Object.assign({}, man, { san: nhieu ? man.san[i] : man.san, batDau: Array.isArray(man.batDau) ? man.batDau[i] : man.batDau, mau: lm.mau, vatMau: lm.vatMau, bongMo: lm.bongMo || man.bongMo });
}

/**
 * Nhịp ngắn nhất của cả màn (mọi sân cộng lại). Màn có đoạn chương trình CỐ ĐỊNH chạy trước phần người chơi chế (che-may-nem.9: go_load() do màn cho) thì tính:
 * nhịp của đoạn đó (chạy thật với kho hamCuaEm) + BFS từ trạng thái sau đoạn đó (ô xe, hướng, vật đang trong rổ / nằm ở ô nào, ô diQua đã qua).
 * Đoạn cố định = những dòng đầu của chương trình chính cố định (maMau.chinh) chỉ gọi hàm KHÓA của màn (man.khoaHamMan).
 */
export function nhipCheMayNemTatCa(man, hamCuaEm, tuyChon = {}) {
  const khoaMan = man.khoaHamMan || [], chinh = man.chinhCoDinh && man.maMau ? man.maMau.chinh : [];
  let n = 0;
  while (n < chinh.length && khoaMan.some((t) => chinh[n].trim() === t + '()')) n++;
  const nhieu = Array.isArray(man.san[0]);
  if (!n) {
    let tong = 0;
    for (let i = 0; i < (nhieu ? man.san.length : 1); i++) {
      const k = nhipCheMayNemNganNhat(sanCon(man, i), tuyChon).nhip;
      tong = tong === null || k === null ? null : tong + k;
    }
    return tong;
  }
  if (nhieu) throw new Error('Đoạn cố định + nhiều sân chưa hỗ trợ.');
  const ChamHoc = require(path.join(day, 'cham.js'));
  const pre = ChamHoc.cham(Object.assign({}, man, { chinhCoDinh: false }), { chinh: chinh.slice(0, n), hamCuaMan: man.maMau.hamCuaMan }, hamCuaEm);
  if (!pre.theoSan.length || !pre.vet.length || pre.chanDoan.some((c) => c.ma === 'ham-chua-co' || c.ma === 'loi-chay')) throw new Error('Đoạn cố định của ' + man.ma + ' chạy lỗi.');
  const r = pre.theoSan[0], rong = SanHoc.docSan(man.san, man.mau, man.vatMau, null).rong;
  const pos = r.vat.map((v) => (v.trangThai === 'dat' ? v.y * rong + v.x : v.trangThai === 'ro' ? -1 : -2));
  if (pos.includes(-2)) return null;
  const b = nhipCheMayNemNganNhat(man, Object.assign({}, tuyChon, {
    batDau: { x: r.robot.x, y: r.robot.y, huong: r.robot.huong, pos, daQua: (r.diQua || []).filter((q) => q.da).map((q) => q.y * rong + q.x) }
  }));
  return b.nhip === null ? null : r.soNhip + b.nhip;
}

/** Chạy một chuỗi hành động từ trạng thái đầu; dừng khi vật vỡ (vo) hoặc, mục tiêu dua-vat, ngay khi thắng. Trả về { S, vo, thangSom, cacBuoc }. */
export function moPhong(ctx, chuoi, batDau) {
  let S = trangThaiDau(ctx, batDau);
  const cacBuoc = [S];
  for (const a of chuoi) {
    const N = buocMotNhip(ctx, S, a);
    cacBuoc.push(N);
    S = N;
    if (N.vo) return { S, vo: true, thangSom: false, cacBuoc };
    if (ctx.mucTieu === 'dua-vat' && laDich(ctx, N)) return { S, vo: false, thangSom: true, cacBuoc };
  }
  return { S, vo: false, thangSom: false, cacBuoc };
}

// tổ hợp (bánh trái, bánh phải) chọn cho từng hiệu quả, theo thứ tự ưu tiên
const UU_TIEN = {
  tien: [[1, 1]], lui: [[-1, -1]], phai: [[1, 0], [0, -1]], trai: [[0, 1], [-1, 0]], dau: [[1, -1], [-1, 1]], cho: [[0, 0]]
};

/** Chuỗi hành động → mã Python lệnh gốc theo phần cứng của màn (mỗi hành động một nhóm lệnh + wait(); throw thì aim(n) trước). */
export function chuoiThanhMa(chuoi, man) {
  const pc = SanHoc.phanCungCua(man);
  const dong = [];
  for (const a of chuoi) {
    if (a.nem === 'load') dong.push('load()');
    else if (a.nem === 'throw') { dong.push('aim(' + a.tam + ')'); dong.push('throw()'); }
    else {
      const cap = UU_TIEN[a.hq].find(([t, p]) => (t === 0 || pc.includes(t === 1 ? 'left_move' : 'left_back')) && (p === 0 || pc.includes(p === 1 ? 'right_move' : 'right_back')));
      if (!cap) throw new Error('Phần cứng không làm được hiệu quả ' + a.hq);
      if (cap[0] === 1) dong.push('left_move()'); else if (cap[0] === -1) dong.push('left_back()');
      if (cap[1] === 1) dong.push('right_move()'); else if (cap[1] === -1) dong.push('right_back()');
    }
    dong.push('wait()');
  }
  return dong.join('\n') + '\n';
}

export { hieuQua };
