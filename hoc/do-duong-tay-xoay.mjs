/* ============================================================================
   do-duong-tay-xoay.mjs — BỘ DÒ ĐƯỜNG TẮT cho hai chương tay xoay: `tay-xoay` (mục tiêu dua-vat / toi-co) và `che-tay-xoay` (bóng mờ). Robot: xe hai bánh gắn TAY XOAY
   (man.robot.tay = 'xoay'; khay có arm_up / arm_down / grab / release / arm_left / arm_right). Dùng trong máy kiểm (kiem-tay-xoay.mjs, kiem-che-tay-xoay.mjs, kiem-hoc.mjs); không nằm trong game.

   BFS theo NHỊP trên trạng thái: (ô xe, hướng, tư thế tay, nấc khớp xoay, vật đang cầm, ô của từng vật, tập ô diQua đã qua). Luật y hệt san-hoc.js (phần TAY XOAY):
     một NHỊP = tay NÂNG (arm_up) → khớp XOAY một nấc (arm_left / arm_right; chỉ khi tay đang nâng, hết nấc thì đứng) → tay HẠ (arm_down) → KẸP / THẢ ở Ô TAY CHỈ (trước mặt / bên trái / bên phải xe, theo nấc khớp)
     → bánh chạy (bị chặn nếu tay đang hạ).
   Lệnh bánh chọn được thì do PHẦN CỨNG của màn quyết định (toHopChoPhep của do-duong-che-xe.mjs). Khớp kẹt một phía: phanCung thiếu arm_left (hay arm_right) thì không xoay phía đó.
   daoChieu (tay / kẹp / xoay lắp ngược) chỉ đổi TÊN lệnh, không đổi tập hiệu quả làm được, nên bộ dò bỏ qua.
   Vật nằm đất CHIẾM Ô (xe không tiến / lùi vào), vật đang cầm đi theo xe. grab chỉ lấy được vật ở ô tay chỉ khi tay hạ; release khi tay nâng làm vật vỡ (bỏ trạng thái đó),
   khi tay hạ thì vật nằm xuống ô tay chỉ nếu đó là sàn trống (không tường, hàng rào, bậc thang, nút, vật khác, ngoài sân), không thì vật vẫn ở tay.
   Mục tiêu 'dua-vat': mọi vật nằm trên ô đích (đích có màu chỉ nhận vật cùng màu). 'toi-co': xe tới ô cờ F. 'bong-mo': đúng luật bongMoDat của san-hoc.js — xe đúng ô và hướng, đã qua mọi ô diQua,
   khớp ở nấc bongMo.xoay (mặc định 'truoc'), nếu bongMo.cam thì tay đang cầm một vật (đúng màu nếu camMau), mọi vật còn lại nằm đất đúng các ô bongMo.vat (đúng màu nếu khai), không thừa không thiếu.
   Hàm xuất:
     nhipTayXoayNganNhat(man, tuyChon) → { nhip, soTrangThai, catNgang, chuoi } | { nhip:null, … }
        tuyChon.batDau   : { x, y, huong, tuThe: 'tren'|'duoi', xoay: 'trai'|'truoc'|'phai', cam: số thứ tự vật đang cầm | -1, pos: [ô của từng vật], daQua: [ô diQua đã qua] }
        tuyChon.phanCung : phần cứng khác (mặc định SanHoc.phanCungCua(man))
        tuyChon.toiDaTrangThai : mặc định 6 000 000
     nhipTayXoayTatCa(man, hamCuaEm, tuyChon) → số nhịp cả màn (tính cả đoạn cố định gọi hàm khóa của màn)
     chuoiThanhMa(chuoi, phanCung) → mã Python lệnh gốc của đường BFS (kiểm chéo với SanHoc.chay)
     dungNguCanh, trangThaiBanDau, buocMotNhip, daDatDich → từng bước, để kiểm chéo với SanHoc.chay bằng chương trình ngẫu nhiên
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { toHopChoPhep } from './do-duong-che-xe.mjs';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));

const BANH_EFFECT = ['tien', 'lui', 'phai', 'trai', 'dau', 'cho'];
const NAC = ['trai', 'truoc', 'phai'];

export function dungNguCanh(man) {
  if (Array.isArray(man.san[0])) throw new Error('Bộ dò tay xoay chỉ hỗ trợ màn một sân.');
  const san = SanHoc.docSan(man.san, man.mau, man.vatMau);
  if (/[><^vHhNCcP]/.test(man.san.join('').replace(/F/g, ''))) throw new Error('Bộ dò tay xoay không hỗ trợ băng chuyền, thùng nặng, nút, cửa, ô sạc.');
  const rong = san.rong, cao = san.cao, nCell = rong * cao;
  const chan = new Uint8Array(nCell);
  for (let y = 0; y < cao; y++) for (let x = 0; x < rong; x++) chan[y * rong + x] = SanHoc.lyDoChan(san, 'banh', x, y) ? 1 : 0;
  const mauTen = SanHoc.MAU_TEN;
  const mauVat = san.vat.map((v) => (v.mau ? mauTen.indexOf(v.mau) + 1 : 0));
  const mucTieu = man.mucTieu || 'toi-co';
  const laBongMo = mucTieu === 'bong-mo';
  const bm = laBongMo ? man.bongMo : null;
  const diQua = bm ? (bm.diQua || []).map((q) => q.y * rong + q.x) : [];
  const dichVat = bm ? (bm.vat || []).map((q) => ({ o: q.y * rong + q.x, mau: q.mau ? mauTen.indexOf(q.mau) + 1 : 0 })) : [];
  const dich = new Int8Array(nCell).fill(-1);                                        // mục tiêu dua-vat: ô đích (-1 không phải đích; 0 đích không màu; 1.. màu)
  san.dich.forEach((d) => { dich[d.y * rong + d.x] = d.mau ? mauTen.indexOf(d.mau) + 1 : 0; });
  return {
    san, rong, cao, nCell, chan, mauVat, nVat: san.vat.length, mucTieu, laBongMo, bm, diQua, dichVat, dich,
    cam: !!(bm && bm.cam), camMau: bm && bm.camMau ? mauTen.indexOf(bm.camMau) + 1 : 0,
    xoayDich: bm ? NAC.indexOf(bm.xoay || 'truoc') : 1,
    co: san.co ? san.co.y * rong + san.co.x : -1,
    vat0: san.vat.map((v) => v.y * rong + v.x), bd: man.batDau
  };
}

function dungHanhDong(choPhep, phanCung) {
  const ds = [], rots = [0];
  if (phanCung.includes('arm_left')) rots.push(-1);
  if (phanCung.includes('arm_right')) rots.push(1);
  for (const t of [null, 'duoi', 'tren']) for (const r of rots) for (const k of [null, 'kep', 'tha']) for (const b of BANH_EFFECT) if (choPhep.includes(b)) ds.push({ tuThe: t, xoay: r, kep: k, banh: b });
  return ds;
}

/** Trạng thái đầu từ xuất phát của màn (hoặc từ tuyChon.batDau). r: 0 trái, 1 trước, 2 phải. */
function trangThaiDau(ctx, tuyChon) {
  const b = tuyChon.batDau || {};
  const bd = ctx.bd;
  return {
    x: b.x !== undefined ? b.x : bd.x, y: b.y !== undefined ? b.y : bd.y, h: b.huong !== undefined ? b.huong : (bd.huong || 0),
    t: b.tuThe === 'duoi' ? 1 : 0, r: b.xoay !== undefined ? NAC.indexOf(b.xoay) : 1, cam: b.cam !== undefined ? b.cam : -1, pos: b.pos ? b.pos.slice() : ctx.vat0.slice(),
    mask: (b.daQua || []).reduce((m, o) => { const i = ctx.diQua.indexOf(o); return i >= 0 ? m | (1 << i) : m; }, 0)
  };
}

function laDich(ctx, N) {
  const { x, y, h, r, cam, pos, mask } = N;
  if (ctx.mucTieu === 'toi-co') return ctx.co >= 0 && y * ctx.rong + x === ctx.co;
  if (ctx.mucTieu === 'dua-vat') {
    if (!pos.length) return false;
    for (let i = 0; i < pos.length; i++) {
      if (i === cam || pos[i] < 0) return false;
      const d = ctx.dich[pos[i]];
      if (d < 0 || (d > 0 && ctx.mauVat[i] !== d)) return false;
    }
    return true;
  }
  const bm = ctx.bm;
  if (x !== bm.x || y !== bm.y) return false;
  if (bm.huong !== null && bm.huong !== undefined && h !== bm.huong) return false;
  if (r !== ctx.xoayDich) return false;
  if (mask !== (1 << ctx.diQua.length) - 1) return false;
  if (ctx.cam) {
    if (cam < 0) return false;
    if (ctx.camMau && ctx.mauVat[cam] !== ctx.camMau) return false;
  }
  if (ctx.dichVat.length || ctx.cam) {
    let dat = 0;
    for (let i = 0; i < pos.length; i++) if (pos[i] >= 0) dat++;
    if (dat + (ctx.cam ? 1 : 0) !== pos.length || dat !== ctx.dichVat.length) return false;
    for (const q of ctx.dichVat) {
      let ok = false;
      for (let i = 0; i < pos.length; i++) if (pos[i] === q.o && (!q.mau || ctx.mauVat[i] === q.mau)) { ok = true; break; }
      if (!ok) return false;
    }
  }
  return true;
}

/** Ô tay chỉ (chỉ số ô, -1 nếu ngoài sân) theo hướng xe h và nấc khớp r. */
function oTay(ctx, N) {
  const hh = (N.h + (N.r === 0 ? 3 : N.r === 2 ? 1 : 0)) % 4, v = SanHoc.VEC[hh], fx = N.x + v[0], fy = N.y + v[1];
  return (fx >= 0 && fy >= 0 && fx < ctx.rong && fy < ctx.cao) ? fy * ctx.rong + fx : -1;
}
/** (a1) nâng, (a2) xoay một nấc, (a3) hạ, rồi (b) kẹp / thả ở ô tay chỉ. Trả false nếu vật vỡ. Sửa N tại chỗ. */
function tayVaKep(ctx, N, a) {
  if (a.tuThe === 'tren') N.t = 0;
  if (a.xoay && N.t === 0) { const nr = N.r + a.xoay; if (nr >= 0 && nr <= 2) N.r = nr; }
  if (a.tuThe === 'duoi') N.t = 1;
  const front = oTay(ctx, N);
  if (a.kep === 'kep') {
    if (N.cam < 0 && N.t === 1 && front >= 0) {
      const i = N.pos.indexOf(front);
      if (i >= 0) { N.pos[i] = -1; N.cam = i; }
    }
  } else if (a.kep === 'tha') {
    if (N.cam >= 0) {
      if (N.t === 0) return false;                          // thả từ trên cao: vật vỡ
      if (front >= 0 && !ctx.chan[front] && N.pos.indexOf(front) < 0) { N.pos[N.cam] = front; N.cam = -1; }
    }
  }
  return true;
}
/** Bánh: hiệu quả `b` (bị chặn nếu tay hạ và không phải đứng yên). */
function banhChay(ctx, N, b) {
  const { rong, cao, chan } = ctx;
  if (b === 'cho' || N.t === 1) return;
  if (b === 'tien' || b === 'lui') {
    const v = SanHoc.VEC[N.h], d = b === 'tien' ? 1 : -1, nx = N.x + v[0] * d, ny = N.y + v[1] * d;
    if (nx < 0 || ny < 0 || nx >= rong || ny >= cao) return;
    const c = ny * rong + nx;
    if (chan[c] || N.pos.indexOf(c) >= 0) return;
    N.x = nx; N.y = ny;
  } else if (b === 'phai') N.h = (N.h + 1) % 4;
  else if (b === 'trai') N.h = (N.h + 3) % 4;
  else if (b === 'dau') N.h = (N.h + 2) % 4;
}
const maDiQua = (ctx, o) => { const i = ctx.diQua.indexOf(o); return i >= 0 ? 1 << i : 0; };

/** MỘT bước: áp hành động a ({ tuThe, xoay (-1 | 0 | 1), kep, banh }) lên bản sao của S. Trả { N, nhip: 1 } hoặc null (vật vỡ). */
export function buocMotNhip(ctx, S, a) {
  const N = { x: S.x, y: S.y, h: S.h, t: S.t, r: S.r, cam: S.cam, mask: S.mask, pos: S.pos.slice() };
  if (!tayVaKep(ctx, N, a)) return null;
  banhChay(ctx, N, a.banh);
  N.mask |= maDiQua(ctx, N.y * ctx.rong + N.x);
  return { N, nhip: 1 };
}
export function trangThaiBanDau(man, tuyChon = {}) {
  const ctx = dungNguCanh(man), dau = trangThaiDau(ctx, tuyChon);
  return { ctx, S: { x: dau.x, y: dau.y, h: dau.h, t: dau.t, r: dau.r, cam: dau.cam, mask: dau.mask | maDiQua(ctx, dau.y * ctx.rong + dau.x), pos: dau.pos } };
}
export const daDatDich = (ctx, N) => laDich(ctx, N);

export function nhipTayXoayNganNhat(man, tuyChon = {}) {
  const ctx = dungNguCanh(man);
  const toiDa = tuyChon.toiDaTrangThai || 6000000;
  const phanCung = tuyChon.phanCung || SanHoc.phanCungCua(man);
  const choPhep = toHopChoPhep(man, { phanCung });
  const dsHD = dungHanhDong(choPhep, phanCung);
  const { rong, nCell, nVat } = ctx;
  const S0 = trangThaiBanDau(man, tuyChon).S;
  const N1 = nCell + 2;
  const nDq = ctx.diQua.length;
  const khoa = (N) => {
    let k = (((((N.y * rong + N.x) * 4 + N.h) * 2 + N.t) * 3 + N.r) * (nVat + 1) + (N.cam + 1)) * (1 << nDq) + N.mask;
    for (let i = 0; i < nVat; i++) k = k * N1 + (N.pos[i] + 1);
    return k;
  };
  if (daDatDich(ctx, S0)) return { nhip: 0, soTrangThai: 1, catNgang: false, chuoi: [] };
  const duong = (cha, act, j) => { const kq = []; for (; j > 0; j = cha[j]) kq.push(dsHD[act[j]]); return kq.reverse(); };
  const ds = [S0], cha = [-1], act = [-1], cp = [0];
  const thay = new Set([khoa(S0)]);
  let lop = [0];
  while (lop.length) {                                     // mọi hành động đúng 1 nhịp: BFS theo lớp
    const tiep = [];
    for (const i of lop) {
      for (let ai = 0; ai < dsHD.length; ai++) {
        const r = buocMotNhip(ctx, ds[i], dsHD[ai]);
        if (!r) continue;
        const k = khoa(r.N);
        if (thay.has(k)) continue;
        thay.add(k);
        ds.push(r.N); cha.push(i); act.push(ai); cp.push(cp[i] + 1);
        const nj = ds.length - 1;
        if (daDatDich(ctx, r.N)) return { nhip: cp[nj], soTrangThai: ds.length, catNgang: false, chuoi: duong(cha, act, nj) };
        tiep.push(nj);
        if (ds.length > toiDa) return { nhip: null, soTrangThai: ds.length, catNgang: true, chuoi: null };
      }
    }
    lop = tiep;
  }
  return { nhip: null, soTrangThai: ds.length, catNgang: false, chuoi: null };
}

/** Chuỗi hành động → mã Python gồm lệnh gốc (mỗi nhịp kết thúc bằng wait()), chọn tổ hợp bánh phần cứng có sẵn cho từng hiệu quả. */
export function chuoiThanhMa(chuoi, phanCung) {
  const TOHOP = { tien: [[1, 1]], lui: [[-1, -1]], phai: [[1, 0], [0, -1]], trai: [[0, 1], [-1, 0]], dau: [[1, -1], [-1, 1]], cho: [[0, 0]] };
  const co = (t, p) => (t === 0 || phanCung.includes(t > 0 ? 'left_move' : 'left_back')) && (p === 0 || phanCung.includes(p > 0 ? 'right_move' : 'right_back'));
  const dong = [];
  for (const a of chuoi) {
    if (a.tuThe === 'duoi') dong.push('arm_down()'); else if (a.tuThe === 'tren') dong.push('arm_up()');
    if (a.xoay === -1) dong.push('arm_left()'); else if (a.xoay === 1) dong.push('arm_right()');
    if (a.kep === 'kep') dong.push('grab()'); else if (a.kep === 'tha') dong.push('release()');
    const tp = TOHOP[a.banh].find(([t, p]) => co(t, p));
    if (!tp) throw new Error('Phần cứng không làm được hiệu quả ' + a.banh);
    if (tp[0] === 1) dong.push('left_move()'); else if (tp[0] === -1) dong.push('left_back()');
    if (tp[1] === 1) dong.push('right_move()'); else if (tp[1] === -1) dong.push('right_back()');
    dong.push('wait()');
  }
  return dong.join('\n') + '\n';
}

/**
 * Nhịp ngắn nhất của cả màn (màn khai khongDoBFS: true — bốn vật trở lên, không BFS nổi — thì trả sao.nhip). Màn có đoạn chương trình CỐ ĐỊNH chạy trước phần người chơi chế (hàm khóa của màn, vd. go_get()) thì tính:
 * nhịp của đoạn đó (chạy thật với kho hamCuaEm) + BFS từ trạng thái sau đoạn đó (tay, nấc khớp, vật đang cầm, ô các vật và ô diQua đã qua).
 * Đoạn cố định = những dòng đầu của chương trình chính cố định (maMau.chinh) chỉ gọi hàm KHÓA của màn (man.khoaHamMan).
 */
export function nhipTayXoayTatCa(man, hamCuaEm, tuyChon = {}) {
  if (man.khongDoBFS === true) return man.sao.nhip;     // màn nhiều vật (4 vật trở lên): BFS đầy đủ không chạy nổi trong thời gian máy kiểm; sao.nhip theo lời giải chuẩn (nhipTheoLoiGiai), kiểm-che-tay-xoay.mjs kiểm lời giải chạy đúng sao.nhip
  const khoa = man.khoaHamMan || [], chinh = man.chinhCoDinh && man.maMau ? man.maMau.chinh : [];
  let n = 0;
  while (n < chinh.length && khoa.some((t) => chinh[n].trim() === t + '()')) n++;
  if (!n) return nhipTayXoayNganNhat(man, tuyChon).nhip;
  const ChamHoc = require(path.join(day, 'cham.js'));
  const pre = ChamHoc.cham(Object.assign({}, man, { chinhCoDinh: false }), { chinh: chinh.slice(0, n), hamCuaMan: man.maMau.hamCuaMan }, hamCuaEm);
  if (!pre.theoSan.length || !pre.vet.length || pre.chanDoan.some((c) => c.ma === 'ham-chua-co' || c.ma === 'loi-chay' || c.ma === 'vat-vo')) throw new Error('Đoạn cố định của ' + man.ma + ' chạy lỗi.');
  const r = pre.theoSan[0], rong = SanHoc.docSan(man.san).rong;
  const pos = r.vat.map((v) => (v.trangThai === 'dat' ? v.y * rong + v.x : -1));
  const cam = r.tay && r.tay.cam !== null && r.tay.cam !== undefined ? r.tay.cam - 1 : -1;
  const b = nhipTayXoayNganNhat(man, Object.assign({}, tuyChon, {
    batDau: { x: r.robot.x, y: r.robot.y, huong: r.robot.huong, tuThe: r.tay ? r.tay.tuThe : 'tren', xoay: r.tay && r.tay.xoay ? r.tay.xoay : 'truoc', cam, pos, daQua: (r.diQua || []).filter((q) => q.da).map((q) => q.y * rong + q.x) }
  }));
  return b.nhip === null ? null : r.soNhip + b.nhip;
}

export { BANH_EFFECT };
