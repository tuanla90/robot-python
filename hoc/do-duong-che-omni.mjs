/* ============================================================================
   do-duong-che-omni.mjs — BỘ DÒ ĐƯỜNG TẮT cho chương `che-omni` (xe BÁNH OMNI, loaiRobot 'omni', mục tiêu 'bong-mo' hoặc 'toi-co'; tay kẹp ở 6 và 10).
   Dùng trong máy kiểm (kiem-che-omni.mjs, kiem-hoc.mjs); không nằm trong game.

   Dựa trên BFS của do-duong-omni.mjs (luật y hệt san-hoc.js, loại 'omni': tiến / lùi / quay như xe bánh, trượt ngang không đổi hướng và không đi chéo,
   băng chuyền đẩy omni sau MỘT nhịp, tay hạ thì không đi không trượt, vật nằm đất chiếm ô) — buocMotNhip của nó được dùng lại nguyên, ở đây chỉ thêm:
     - mục tiêu 'bong-mo' đúng bongMoDat của san-hoc.js: xe đúng ô và hướng, đã qua mọi ô diQua (qua = cuối một nhịp đứng ở ô đó), bongMo.cam (xe mờ cầm vật),
       mọi vật còn lại nằm đất đúng các ô bongMo.vat (không thừa không thiếu, không vỡ);
     - hành động chọn được theo PHẦN CỨNG của màn (man.phanCung; không có thì khay): màn hỏng (che-omni.7: không có slide_right) có ít tổ hợp hơn;
     - gop = false: "cách viết chuẩn" — nhặt = khối pick() 2 nhịp (hạ tay + grab, rồi nâng tay), đặt = khối drop() 2 nhịp; bánh / trượt mỗi nhịp một hành động;
     - màn có đoạn chương trình CỐ ĐỊNH chạy trước phần người chơi viết (che-omni.9: step_out() của màn, khóa): nhipCheOmniTatCa chạy thật đoạn đó rồi BFS từ trạng thái sau nó.

   Hàm xuất:
     nhipCheOmniNganNhat(man, tuyChon) → { nhip, soTrangThai, catNgang, chuoi } | { nhip:null, … }   (màn MỘT sân)
        tuyChon.batDau   : { x, y, huong, tuThe: 'tren'|'duoi', cam: số thứ tự vật đang cầm | -1, pos: [ô của từng vật], daQua: [ô diQua đã qua] }
        tuyChon.phanCung : phần cứng khác (mặc định SanHoc.phanCungCua(man))
        tuyChon.gop      : mặc định true (đường ngắn nhất thật, nâng tay gộp được vào nhịp trượt / bánh kế tiếp)
        tuyChon.toiDaTrangThai : mặc định 6 000 000
     nhipCheOmniTatCa(man, hamCuaEm, tuyChon) → số nhịp cả màn (tính cả đoạn cố định gọi hàm khóa của màn), hay null
     chuoiThanhMa(chuoi)  → mã Python lệnh gốc của đường gop = true (mỗi hành động một nhóm lệnh + wait())
     dungNguCanh, trangThaiBanDau, buocMotNhip, daDatDich, hanhDongChoPhep → từng bước, để so chéo với SanHoc.chay bằng chương trình ngẫu nhiên
   ========================================================================== */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import * as BoOmni from './do-duong-omni.mjs';

const day = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const SanHoc = require(path.join(day, 'san-hoc.js'));
const { TO_HOP, SLIDE_TRAI, SLIDE_PHAI } = BoOmni;
const CHO = 4;                                               // chỉ số tổ hợp bánh (0, 0): đứng yên

export function dungNguCanh(man) {
  if (Array.isArray(man.san[0])) throw new Error('Bộ dò che-omni chỉ hỗ trợ màn một sân.');
  if (/[HhNCc=]/.test(man.san.join(''))) throw new Error('Bộ dò che-omni không hỗ trợ thùng nặng, nút, cửa, hàng rào.');
  const ctx = BoOmni.dungNguCanh(man);
  const rong = ctx.rong;
  ctx.laBongMo = (man.mucTieu || 'toi-co') === 'bong-mo';
  ctx.bm = ctx.laBongMo ? man.bongMo : null;
  ctx.diQua = ctx.bm ? (ctx.bm.diQua || []).map((q) => q.y * rong + q.x) : [];
  ctx.dichVat = ctx.bm ? (ctx.bm.vat || []).map((q) => q.y * rong + q.x) : [];
  ctx.cam = !!(ctx.bm && ctx.bm.cam);
  return ctx;
}

const maDiQua = (ctx, o) => { const i = ctx.diQua.indexOf(o); return i >= 0 ? 1 << i : 0; };

/** Trạng thái xuất phát: của màn, hay tuyChon.batDau (vd sau một đoạn chương trình cố định). */
export function trangThaiBanDau(man, tuyChon = {}) {
  const ctx = dungNguCanh(man), dau = BoOmni.trangThaiDau(ctx), b = tuyChon.batDau || {};
  const S = {
    x: b.x !== undefined ? b.x : dau.x, y: b.y !== undefined ? b.y : dau.y, h: b.huong !== undefined ? b.huong : dau.h,
    t: b.tuThe === 'duoi' ? 1 : b.tuThe === 'tren' ? 0 : dau.t, cam: b.cam !== undefined ? b.cam : dau.cam, pos: b.pos ? b.pos.slice() : dau.pos.slice(), mask: 0
  };
  (b.daQua || []).forEach((o) => { S.mask |= maDiQua(ctx, o); });
  return { ctx, S };
}

/** Một nhịp (hành động a = { tuThe, kep, banh }): luật của do-duong-omni.mjs, thêm ô diQua đã qua. */
export function buocMotNhip(ctx, S, a) {
  const N = BoOmni.buocMotNhip(ctx, S, a);
  N.mask = S.mask | maDiQua(ctx, N.y * ctx.rong + N.x);
  return N;
}

/** Xe đúng tư thế đích (bóng mờ) hay tới cờ, như bongMoDat của san-hoc.js. */
export function daDatDich(ctx, N) {
  if (!ctx.laBongMo) return ctx.co >= 0 && N.y * ctx.rong + N.x === ctx.co;
  const bm = ctx.bm;
  if (N.x !== bm.x || N.y !== bm.y) return false;
  if (bm.huong !== null && bm.huong !== undefined && N.h !== bm.huong) return false;
  if (N.mask !== (1 << ctx.diQua.length) - 1) return false;
  if (ctx.cam && N.cam < 0) return false;
  if (ctx.dichVat.length || ctx.cam) {
    let dat = 0;
    for (const p of N.pos) if (p >= 0) dat++;
    if (dat + (ctx.cam ? 1 : 0) !== N.pos.length || dat !== ctx.dichVat.length) return false;
    for (const o of ctx.dichVat) if (N.pos.indexOf(o) < 0) return false;
  }
  return true;
}

/** Hành động (tư thế tay × kẹp / thả × bánh / trượt) mà phần cứng cho phép. */
export function hanhDongChoPhep(ctx, phanCung) {
  const co = (t) => phanCung.includes(t);
  const banhOk = (b) => {
    if (b === SLIDE_TRAI) return co('slide_left');
    if (b === SLIDE_PHAI) return co('slide_right');
    const [t, p] = TO_HOP[b];
    return (t === 0 || co(t > 0 ? 'left_move' : 'left_back')) && (p === 0 || co(p > 0 ? 'right_move' : 'right_back'));
  };
  return BoOmni.hanhDongTuDo(ctx).filter((a) => banhOk(a.banh) && (a.tuThe !== 'duoi' || co('arm_down')) && (a.tuThe !== 'tren' || co('arm_up')) && (a.kep !== 'kep' || co('grab')) && (a.kep !== 'tha' || co('release')));
}

/** Một hành động của kiểu khối (gop = false): { khoi:'banh', banh } 1 nhịp · { khoi:'pick' | 'drop' } 2 nhịp. Trả { N, nhip } hoặc null (vật vỡ). */
function buocKhoi(ctx, S, a) {
  if (a.khoi === 'banh') return { N: buocMotNhip(ctx, S, { tuThe: null, kep: null, banh: a.banh }), nhip: 1 };
  const N1 = buocMotNhip(ctx, S, { tuThe: 'duoi', kep: a.khoi === 'pick' ? 'kep' : 'tha', banh: CHO });
  const N2 = buocMotNhip(ctx, N1, { tuThe: 'tren', kep: null, banh: CHO });
  return { N: N2, nhip: 2 };
}

export function nhipCheOmniNganNhat(man, tuyChon = {}) {
  const { ctx, S: S0 } = trangThaiBanDau(man, tuyChon);
  const gop = tuyChon.gop !== false;
  const toiDa = tuyChon.toiDaTrangThai || 6000000;
  const phanCung = tuyChon.phanCung || SanHoc.phanCungCua(man);
  const tuDo = hanhDongChoPhep(ctx, phanCung);
  let dsHD;
  if (gop) dsHD = tuDo;
  else {
    dsHD = [];
    const thay = new Set();
    for (const a of tuDo) if (!a.tuThe && !a.kep && !thay.has(a.banh)) { thay.add(a.banh); dsHD.push({ khoi: 'banh', banh: a.banh }); }
    if (ctx.coTay && ['arm_down', 'arm_up', 'grab', 'release'].every((t) => phanCung.includes(t))) dsHD.push({ khoi: 'pick' }, { khoi: 'drop' });
  }
  const { rong, cao } = ctx, nCell = rong * cao, nDq = ctx.diQua.length;
  const khoa = (N) => {
    let k = ((((N.y * rong + N.x) * 4 + N.h) * 2 + N.t) * 2 + (N.cam >= 0 ? 1 : 0)) * (1 << nDq) + N.mask;
    const cs = N.pos.map((p) => p + 1).sort((a, b) => a - b);
    for (const c of cs) k = k * (nCell + 2) + c;
    return k;
  };
  if (daDatDich(ctx, S0)) return { nhip: 0, soTrangThai: 1, catNgang: false, chuoi: [] };
  const duong = (cha, act, j) => { const kq = []; for (; j > 0; j = cha[j]) kq.push(dsHD[act[j]]); return kq.reverse(); };
  const ds = [S0], cha = [-1], act = [-1], cp = [0];
  const thay = new Map([[khoa(S0), 0]]);
  if (gop) {                                               // mọi hành động đúng 1 nhịp: BFS theo lớp
    let lop = [0];
    while (lop.length) {
      const tiep = [];
      for (const i of lop) {
        for (let ai = 0; ai < dsHD.length; ai++) {
          const N = buocMotNhip(ctx, ds[i], dsHD[ai]);
          if (N.pos.some((p) => p === -2)) continue;       // vật vỡ: không thể thắng nữa
          const k = khoa(N);
          if (thay.has(k)) continue;
          thay.set(k, ds.length);
          ds.push(N); cha.push(i); act.push(ai); cp.push(cp[i] + 1);
          const nj = ds.length - 1;
          if (daDatDich(ctx, N)) return { nhip: cp[nj], soTrangThai: ds.length, catNgang: false, chuoi: duong(cha, act, nj) };
          tiep.push(nj);
          if (ds.length > toiDa) return { nhip: null, soTrangThai: ds.length, catNgang: true, chuoi: null };
        }
      }
      lop = tiep;
    }
    return { nhip: null, soTrangThai: ds.length, catNgang: false, chuoi: null };
  }
  // gop = false: có hành động tốn 2 nhịp → tìm theo chi phí
  const theoCP = new Map([[0, [0]]]);
  for (let c = 0; c <= 600; c++) {
    const lop = theoCP.get(c) || [];
    for (let q = 0; q < lop.length; q++) {
      const i = lop[q];
      if (thay.get(khoa(ds[i])) !== i) continue;             // đã có đường rẻ hơn tới trạng thái này
      if (daDatDich(ctx, ds[i])) return { nhip: c, soTrangThai: ds.length, catNgang: false, chuoi: duong(cha, act, i) };
      for (let ai = 0; ai < dsHD.length; ai++) {
        const r = buocKhoi(ctx, ds[i], dsHD[ai]);
        if (r.N.pos.some((p) => p === -2)) continue;
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

/**
 * Nhịp ngắn nhất của cả màn. Màn có đoạn chương trình CỐ ĐỊNH chạy trước phần người chơi viết (che-omni.9: step_out() do màn cho) thì tính:
 * nhịp của đoạn đó (chạy thật với kho hamCuaEm) + BFS từ trạng thái sau đoạn đó (xe, tay, vật, ô diQua đã qua).
 * Đoạn cố định = những dòng đầu của chương trình chính cố định (maMau.chinh) chỉ gọi hàm KHÓA của màn (man.khoaHamMan).
 */
export function nhipCheOmniTatCa(man, hamCuaEm, tuyChon = {}) {
  const khoa = man.khoaHamMan || [], chinh = man.chinhCoDinh && man.maMau ? man.maMau.chinh : [];
  let n = 0;
  while (n < chinh.length && khoa.some((t) => chinh[n].trim() === t + '()')) n++;
  if (!n) return nhipCheOmniNganNhat(man, tuyChon).nhip;
  const ChamHoc = require(path.join(day, 'cham.js'));
  const pre = ChamHoc.cham(Object.assign({}, man, { chinhCoDinh: false }), { chinh: chinh.slice(0, n), hamCuaMan: man.maMau.hamCuaMan }, hamCuaEm);
  if (!pre.theoSan.length || !pre.vet.length || pre.chanDoan.some((c) => c.ma === 'ham-chua-co' || c.ma === 'loi-chay' || c.ma === 'vat-vo')) throw new Error('Đoạn cố định của ' + man.ma + ' chạy lỗi.');
  const r = pre.theoSan[0], rong = SanHoc.docSan(man.san).rong;
  const pos = r.vat.map((v) => (v.trangThai === 'dat' ? v.y * rong + v.x : v.trangThai === 'cam' ? -1 : -2));
  const cam = r.tay && r.tay.cam !== null && r.tay.cam !== undefined ? r.tay.cam - 1 : -1;
  const b = nhipCheOmniNganNhat(man, Object.assign({}, tuyChon, {
    batDau: { x: r.robot.x, y: r.robot.y, huong: r.robot.huong, tuThe: r.tay && r.tay.tuThe === 'duoi' ? 'duoi' : 'tren', cam, pos, daQua: (r.diQua || []).filter((q) => q.da).map((q) => q.y * rong + q.x) }
  }));
  return b.nhip === null ? null : r.soNhip + b.nhip;
}

/** Chuỗi hành động (gop = true) → mã Python lệnh gốc, mỗi nhịp kết thúc bằng wait(). */
export const chuoiThanhMa = BoOmni.chuoiThanhMa;

export { BoOmni, TO_HOP, SLIDE_TRAI, SLIDE_PHAI };
