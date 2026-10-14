/* ============================================================================
   do-duong-che-tay.mjs — BỘ DÒ ĐƯỜNG TẮT cho chương `che-tay` (xe hai bánh gắn tay kẹp, loaiRobot 'banh', mục tiêu 'bong-mo' hoặc 'toi-co').
   Dùng trong máy kiểm (kiem-che-tay.mjs, kiem-hoc.mjs); không nằm trong game.

   BFS theo NHỊP trên trạng thái: (ô xe, hướng, tư thế tay, vật đang cầm, ô của từng vật, tập ô diQua đã qua). Luật y hệt san-hoc.js:
     một NHỊP = tay đổi tư thế (không / arm_down / arm_up) → kẹp hay thả (không / grab / release) ở tư thế mới, tại Ô TRƯỚC MẶT → bánh chạy (bị chặn nếu tay đang hạ).
   Lệnh bánh chọn được thì do PHẦN CỨNG của màn quyết định (toHopChoPhep của do-duong-che-xe.mjs: sáu hiệu quả tien, lui, phai, trai, dau, cho); màn hỏng (5.9) có ít tổ hợp hơn.
   daoChieu 'tay' / 'kep' (lắp ngược) không đổi tập hiệu quả làm được (chỉ đổi TÊN lệnh), nên bộ dò bỏ qua.
   Vật nằm đất CHIẾM Ô (xe không tiến / lùi vào), vật đang cầm đi theo xe. grab chỉ lấy được vật ở ô trước mặt khi tay hạ; release khi tay nâng làm vật vỡ (bỏ trạng thái đó),
   khi tay hạ thì vật nằm xuống ô trước mặt nếu đó là sàn trống (không tường, hàng rào, bậc thang, nút, vật khác, ngoài sân), không thì vật vẫn ở tay.
   Mục tiêu 'bong-mo': đúng luật bongMoDat của san-hoc.js — xe đúng ô và hướng, đã qua mọi ô diQua; nếu bongMo.cam thì tay đang cầm một vật (đúng màu nếu camMau); mọi vật còn lại
   nằm đất đúng các ô bongMo.vat (đúng màu nếu khai), không thừa không thiếu. 'toi-co': xe tới ô cờ F.
   Có hai kiểu đếm nhịp:
     gop = true  (mặc định): đường ngắn nhất THẬT, nâng tay chung nhịp với lệnh bánh kế tiếp được.
     gop = false: "cách viết chuẩn" — nhặt = một khối 2 nhịp (hạ tay + grab, rồi nâng tay), đặt = một khối 2 nhịp, giống pick() / drop() của chương tay-gap; bánh mỗi nhịp một hiệu quả.
   Hàm xuất:
     nhipCheTayNganNhat(man, tuyChon) → { nhip, soTrangThai, catNgang, chuoi } | { nhip:null, … }
        tuyChon.batDau   : { x, y, huong, tuThe: 'tren'|'duoi', cam: số thứ tự vật đang cầm | -1, pos: [ô của từng vật], daQua: [ô diQua đã qua] } (mặc định: xuất phát của màn)
        tuyChon.phanCung : phần cứng khác (mặc định SanHoc.phanCungCua(man))
        tuyChon.gop      : xem trên
        tuyChon.toiDaTrangThai : mặc định 6 000 000
     nhipCheTayTatCa(man, hamCuaEm, tuyChon) → số nhịp cả màn (tính cả đoạn cố định gọi hàm khóa của màn, như 5.7 go_get())
     chuoiThanhMa(chuoi, phanCung) → mã Python lệnh gốc của đường gop = true (kiểm chéo với SanHoc.chay)
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

export function dungNguCanh(man) {
  if (Array.isArray(man.san[0])) throw new Error('Bộ dò che-tay chỉ hỗ trợ màn một sân.');
  const san = SanHoc.docSan(man.san, man.mau, man.vatMau);
  if (/[><^vHhNCcP]/.test(man.san.join('').replace(/F/g, ''))) throw new Error('Bộ dò che-tay không hỗ trợ băng chuyền, thùng nặng, nút, cửa, ô sạc.');
  const rong = san.rong, cao = san.cao, nCell = rong * cao;
  const chan = new Uint8Array(nCell);
  for (let y = 0; y < cao; y++) for (let x = 0; x < rong; x++) chan[y * rong + x] = SanHoc.lyDoChan(san, 'banh', x, y) ? 1 : 0;
  const mauTen = SanHoc.MAU_TEN;
  const mauVat = san.vat.map((v) => (v.mau ? mauTen.indexOf(v.mau) + 1 : 0));
  const laBongMo = (man.mucTieu || 'toi-co') === 'bong-mo';
  const bm = laBongMo ? man.bongMo : null;
  const diQua = bm ? (bm.diQua || []).map((q) => q.y * rong + q.x) : [];
  const dichVat = bm ? (bm.vat || []).map((q) => ({ o: q.y * rong + q.x, mau: q.mau ? mauTen.indexOf(q.mau) + 1 : 0 })) : [];
  return {
    san, rong, cao, nCell, chan, mauVat, nVat: san.vat.length, laBongMo, bm, diQua, dichVat,
    cam: !!(bm && bm.cam), camMau: bm && bm.camMau ? mauTen.indexOf(bm.camMau) + 1 : 0,
    co: san.co ? san.co.y * rong + san.co.x : -1,
    vat0: san.vat.map((v) => v.y * rong + v.x), bd: man.batDau
  };
}

function dungHanhDong(choPhep, gop) {
  const ds = [];
  if (gop) {
    for (const t of [null, 'duoi', 'tren']) for (const k of [null, 'kep', 'tha']) for (const b of BANH_EFFECT) if (choPhep.includes(b)) ds.push({ tuThe: t, kep: k, banh: b });
  } else {                                                 // khối chuẩn: pick = hạ tay + grab (nhịp 1) rồi nâng tay (nhịp 2); drop tương tự
    for (const b of BANH_EFFECT) if (choPhep.includes(b)) ds.push({ khoi: 'banh', banh: b });
    ds.push({ khoi: 'pick' }, { khoi: 'drop' });
  }
  return ds;
}

/** Trạng thái đầu từ xuất phát của màn (hoặc từ tuyChon.batDau). */
function trangThaiDau(ctx, tuyChon) {
  const b = tuyChon.batDau || {};
  const bd = ctx.bd;
  return {
    x: b.x !== undefined ? b.x : bd.x, y: b.y !== undefined ? b.y : bd.y, h: b.huong !== undefined ? b.huong : (bd.huong || 0),
    t: b.tuThe === 'duoi' ? 1 : 0, cam: b.cam !== undefined ? b.cam : -1, pos: b.pos ? b.pos.slice() : ctx.vat0.slice(),
    mask: (b.daQua || []).reduce((m, o) => { const i = ctx.diQua.indexOf(o); return i >= 0 ? m | (1 << i) : m; }, 0)
  };
}

function laDich(ctx, x, y, h, cam, pos, mask) {
  if (!ctx.laBongMo) return ctx.co >= 0 && y * ctx.rong + x === ctx.co;
  const bm = ctx.bm;
  if (x !== bm.x || y !== bm.y) return false;
  if (bm.huong !== null && bm.huong !== undefined && h !== bm.huong) return false;
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

/** Tay đổi tư thế rồi kẹp / thả ở ô trước mặt, ở tư thế mới. Trả false nếu vật vỡ. Sửa N tại chỗ. */
function tayVaKep(ctx, N, tuThe, kep) {
  const { rong, cao, chan } = ctx;
  if (tuThe === 'duoi') N.t = 1; else if (tuThe === 'tren') N.t = 0;
  const v = SanHoc.VEC[N.h], fx = N.x + v[0], fy = N.y + v[1];
  const front = (fx >= 0 && fy >= 0 && fx < rong && fy < cao) ? fy * rong + fx : -1;
  if (kep === 'kep') {
    if (N.cam < 0 && N.t === 1 && front >= 0) {
      const i = N.pos.indexOf(front);
      if (i >= 0) { N.pos[i] = -1; N.cam = i; }
    }
  } else if (kep === 'tha') {
    if (N.cam >= 0) {
      if (N.t === 0) return false;                          // thả từ trên cao: vật vỡ
      if (front >= 0 && !chan[front] && N.pos.indexOf(front) < 0) { N.pos[N.cam] = front; N.cam = -1; }
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

/** MỘT bước: áp hành động a ({ tuThe, kep, banh } khi gop; { khoi:'banh', banh } | { khoi:'pick'|'drop' } khi không gop) lên bản sao của S. Trả { N, nhip } hoặc null (vật vỡ). */
export function buocMotNhip(ctx, S, a, gop = true) {
  const N = { x: S.x, y: S.y, h: S.h, t: S.t, cam: S.cam, mask: S.mask, pos: S.pos.slice() };
  let nhip = 1;
  if (gop) {
    if (!tayVaKep(ctx, N, a.tuThe, a.kep)) return null;
    banhChay(ctx, N, a.banh);
  } else if (a.khoi === 'banh') banhChay(ctx, N, a.banh);
  else {                                                   // khối chuẩn: hạ tay + grab / release (nhịp 1), nâng tay (nhịp 2), như pick() / drop()
    if (!tayVaKep(ctx, N, 'duoi', a.khoi === 'pick' ? 'kep' : 'tha')) return null;
    tayVaKep(ctx, N, 'tren', null);
    nhip = 2;
  }
  N.mask |= maDiQua(ctx, N.y * ctx.rong + N.x);
  return { N, nhip };
}
export function trangThaiBanDau(man, tuyChon = {}) {
  const ctx = dungNguCanh(man), dau = trangThaiDau(ctx, tuyChon);
  return { ctx, S: { x: dau.x, y: dau.y, h: dau.h, t: dau.t, cam: dau.cam, mask: dau.mask | maDiQua(ctx, dau.y * ctx.rong + dau.x), pos: dau.pos } };
}
export const daDatDich = (ctx, N) => laDich(ctx, N.x, N.y, N.h, N.cam, N.pos, N.mask);

export function nhipCheTayNganNhat(man, tuyChon = {}) {
  const ctx = dungNguCanh(man);
  const gop = tuyChon.gop !== false;
  const toiDa = tuyChon.toiDaTrangThai || 6000000;
  const phanCung = tuyChon.phanCung || SanHoc.phanCungCua(man);
  const choPhep = toHopChoPhep(man, { phanCung });
  const dsHD = dungHanhDong(choPhep, gop);
  const { rong, nCell, nVat } = ctx;
  const S0 = trangThaiBanDau(man, tuyChon).S;
  const N1 = nCell + 2;                                    // mã vật: 0 = đang cầm, 1.. = ô + 1
  const nDq = ctx.diQua.length;
  const khoa = (N) => {
    let k = ((((N.y * rong + N.x) * 4 + N.h) * 2 + N.t) * (nVat + 1) + (N.cam + 1)) * (1 << nDq) + N.mask;
    for (let i = 0; i < nVat; i++) k = k * N1 + (N.pos[i] + 1);
    return k;
  };
  const dich = (N) => laDich(ctx, N.x, N.y, N.h, N.cam, N.pos, N.mask);
  if (dich(S0)) return { nhip: 0, soTrangThai: 1, catNgang: false, chuoi: [] };
  const duong = (cha, act, j) => { const kq = []; for (; j > 0; j = cha[j]) kq.push(dsHD[act[j]]); return kq.reverse(); };

  const ds = [S0], cha = [-1], act = [-1], cp = [0];
  const thay = new Map([[khoa(S0), 0]]);
  if (gop) {                                               // mọi hành động đúng 1 nhịp: BFS theo lớp
    let lop = [0];
    while (lop.length) {
      const tiep = [];
      for (const i of lop) {
        for (let ai = 0; ai < dsHD.length; ai++) {
          const r = buocMotNhip(ctx, ds[i], dsHD[ai], true);
          if (!r) continue;
          const k = khoa(r.N);
          if (thay.has(k)) continue;
          thay.set(k, ds.length);
          ds.push(r.N); cha.push(i); act.push(ai); cp.push(cp[i] + 1);
          const nj = ds.length - 1;
          if (dich(r.N)) return { nhip: cp[nj], soTrangThai: ds.length, catNgang: false, chuoi: duong(cha, act, nj) };
          tiep.push(nj);
          if (ds.length > toiDa) return { nhip: null, soTrangThai: ds.length, catNgang: true, chuoi: null };
        }
      }
      lop = tiep;
    }
    return { nhip: null, soTrangThai: ds.length, catNgang: false, chuoi: null };
  }
  // gop = false: có hành động tốn 2 nhịp → tìm theo chi phí (hàng đợi theo từng mức)
  const theoCP = new Map([[0, [0]]]);
  for (let c = 0; c <= 500; c++) {
    const lop = theoCP.get(c) || [];
    for (let q = 0; q < lop.length; q++) {
      const i = lop[q];
      if (thay.get(khoa(ds[i])) !== i) continue;             // đã có đường rẻ hơn tới trạng thái này
      if (dich(ds[i])) return { nhip: c, soTrangThai: ds.length, catNgang: false, chuoi: duong(cha, act, i) };
      for (let ai = 0; ai < dsHD.length; ai++) {
        const r = buocMotNhip(ctx, ds[i], dsHD[ai], false);
        if (!r) continue;
        const k = khoa(r.N), nc = c + r.nhip, cu = thay.get(k);
        if (cu !== undefined && cp[cu] <= nc) continue;
        thay.set(k, ds.length);
        ds.push(r.N); cha.push(i); act.push(ai); cp.push(nc);
        if (!theoCP.has(nc)) theoCP.set(nc, []);
        theoCP.get(nc).push(ds.length - 1);
        if (ds.length > toiDa) return { nhip: null, soTrangThai: ds.length, catNgang: true, chuoi: null };
      }
    }
  }
  return { nhip: null, soTrangThai: ds.length, catNgang: false, chuoi: null };
}

/** Chuỗi hành động (gop = true) → mã Python gồm lệnh gốc (mỗi nhịp kết thúc bằng wait()), chọn tổ hợp bánh phần cứng có sẵn cho từng hiệu quả. */
export function chuoiThanhMa(chuoi, phanCung) {
  const TOHOP = { tien: [[1, 1]], lui: [[-1, -1]], phai: [[1, 0], [0, -1]], trai: [[0, 1], [-1, 0]], dau: [[1, -1], [-1, 1]], cho: [[0, 0]] };
  const co = (t, p) => (t === 0 || phanCung.includes(t > 0 ? 'left_move' : 'left_back')) && (p === 0 || phanCung.includes(p > 0 ? 'right_move' : 'right_back'));
  const dong = [];
  for (const a of chuoi) {
    if (a.tuThe === 'duoi') dong.push('arm_down()'); else if (a.tuThe === 'tren') dong.push('arm_up()');
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
 * Nhịp ngắn nhất của cả màn. Màn có đoạn chương trình CỐ ĐỊNH chạy trước phần người chơi chế (5.7: go_get() do màn cho) thì tính:
 * nhịp của đoạn đó (chạy thật với kho hamCuaEm) + BFS từ trạng thái sau đoạn đó (tay, vật đang cầm, ô các vật và ô diQua đã qua).
 * Đoạn cố định = những dòng đầu của chương trình chính cố định (maMau.chinh) chỉ gọi hàm KHÓA của màn (man.khoaHamMan).
 */
export function nhipCheTayTatCa(man, hamCuaEm, tuyChon = {}) {
  const khoa = man.khoaHamMan || [], chinh = man.chinhCoDinh && man.maMau ? man.maMau.chinh : [];
  let n = 0;
  while (n < chinh.length && khoa.some((t) => chinh[n].trim() === t + '()')) n++;
  if (!n) return nhipCheTayNganNhat(man, tuyChon).nhip;
  const ChamHoc = require(path.join(day, 'cham.js'));
  const pre = ChamHoc.cham(Object.assign({}, man, { chinhCoDinh: false }), { chinh: chinh.slice(0, n), hamCuaMan: man.maMau.hamCuaMan }, hamCuaEm);
  if (!pre.theoSan.length || !pre.vet.length || pre.chanDoan.some((c) => c.ma === 'ham-chua-co' || c.ma === 'loi-chay' || c.ma === 'vat-vo')) throw new Error('Đoạn cố định của ' + man.ma + ' chạy lỗi.');
  const r = pre.theoSan[0], rong = SanHoc.docSan(man.san).rong;
  const pos = r.vat.map((v) => (v.trangThai === 'dat' ? v.y * rong + v.x : -1));
  const cam = r.tay && r.tay.cam !== null && r.tay.cam !== undefined ? r.tay.cam - 1 : -1;
  const b = nhipCheTayNganNhat(man, Object.assign({}, tuyChon, {
    batDau: { x: r.robot.x, y: r.robot.y, huong: r.robot.huong, tuThe: r.tay ? r.tay.tuThe : 'tren', cam, pos, daQua: (r.diQua || []).filter((q) => q.da).map((q) => q.y * rong + q.x) }
  }));
  return b.nhip === null ? null : r.soNhip + b.nhip;
}

export { BANH_EFFECT };
