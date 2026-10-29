/* ============================================================================
   kiem-trum-mua-1.mjs — máy kiểm gói 10 "R1 xuất xưởng" của mùa 1 (man-trum-mua-1.js do lo-trinh-hoc.js xếp):
   chương 1 `robot-hoan-thien` "Tổng hợp" (robot-hoan-thien 1–8 + cam-bien-ben.10 + robot-hoan-thien.11 mới, thay robot-hoan-thien.10 đã cất)
   và chương 2 `trum-mua-1` "Trùm mùa" (trum-mua-1.1 … .10, trùm cuối mùa .10 huy hiệu 'xuat-xuong').
   1. Vị trí: gói robot là gói cuối mùa 1, hai chương đúng thứ tự, hàng lam-quen / luyen / bien-the / trum; robot-hoan-thien.10 cất, không màn mùa 1 nào
      còn hàm của màn khóa (khoaHamMan); choi.html nạp man-trum-mua-1.js trước lo-trinh-hoc.js; mã / tên mới không trùng.
      MÙA 1 = 10 gói × 2 chương × 10 màn = 200 màn; mọi chương mùa 1 có trùm là màn cuối, trùm có huy hiệu (huy-hieu.js có hình), màn khác không có.
   2. Từng màn mới: đủ trường (kể cả kieuBai); một sân (trùm: ba sân); robot (chương 1: tay kẹp; chương 2: tay xoay; hai robot: R1 xoay vàng, R2 kẹp lam);
      lời giải thắng 3 sao đúng sao.o / sao.nhip, không chẩn đoán; mã mẫu chưa thắng; lời giải khác đúng 2 sao; lời sai thua đúng mã phaiCoMa;
      hàm của em cần đã học trước màn và khai đủ (cả qua hàm của màn); robot khóa / chương trình khóa chạy đúng mã mẫu.
   3. Ràng buộc mùa 1: không biến, không hàm có tham số, không bậc thang, không tạo hàm của em mới; mọi lệnh chạy tới (bắc cầu qua kho) là lệnh mùa 1.
   4. Đường cong chương Trùm mùa: dòng / nhịp / cỡ sân (ô không phải tường) màn n ≤ max(1,5 × màn n−1, màn n−1 + bù), bù dòng +3, nhịp +4, cỡ sân +6;
      trừ trùm. Màn 1 Trùm mùa dễ hơn trùm chương 1 (robot-hoan-thien.11) rất nhiều. Hai màn vong-lap thêm tay kẹp (8, 9): giữ đường cong chương vong-lap
      (so với màn trước và màn sau), chỉ dùng thứ của gói 1–2, lời giải có for, trải for ra thì tràn khung hay mất sao.
   5. Bộ dò đường tắt (khối chuẩn một / hai robot, có điểm ◆ diQua): không có đường nào nhanh hơn sao.nhip (trừ NHANH_HON có lý do); đường dò chạy thật đúng
      nhịp; trùm: đường ngắn nhất từng sân (đếm cứng) không thắng cả ba sân; màn hai robot đưa vật: một robot đứng yên thì không thắng.
      Màn chương trình chính khóa gọi hàm của màn ở nhiều chỗ: mọi thân đếm cứng không được 3 sao.
   6. BẢNG RECALL gộp gói 9 + 10 (recallMan / kiemRecall của kiem-combo-mua-1.mjs): (a) mỗi màn mới chương Trùm mùa có tay xoay + cảm biến bên và
      ≥ 2 gói khác trong {1, 2, 3, 4, 5, 8}; robot-hoan-thien.11 dùng ≥ 2 gói 1–8; (b) mỗi gói 1–8 được nhắc ≥ 3 lần trên 40 màn gói 9 + 10;
      (c) không hai màn liền nhau cùng kiểu bài. Trùm cuối mùa dùng gần như mọi thứ: tay xoay, cảm biến trước + bên, lùi, nút đè, hàm tự viết, vòng lặp.
   Chạy: node hoc/kiem-trum-mua-1.mjs            (trượt thì thoát mã 1)
         node hoc/kiem-trum-mua-1.mjs --loi-gia  (cắm lỗi giả vào dữ liệu đã nạp: máy kiểm phải ĐỎ)
   ========================================================================== */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { GOI_RECALL, recallMan, kiemRecall, khoTheoLoTrinh } from './kiem-combo-mua-1.mjs';
import { coHuyHieu } from './huy-hieu-ds.mjs';   // V7c1: danh sách mã huy hiệu từ dữ liệu bộ vector (không regex huy-hieu.js pixel)

const require = createRequire(import.meta.url);
const clone = (x) => JSON.parse(JSON.stringify(x));
const dsSan = (m) => (Array.isArray(m.san[0]) ? m.san : [m.san]);
const soSan = (m) => (Array.isArray(m.san[0]) ? m.san.length : 1);
function loiGoi(dong) { const s = new Set(); for (const l of dong || []) for (const x of l.matchAll(/([A-Za-z_]\w*)\s*\(/g)) s.add(x[1]); return s; }
const chinhCua = (b) => (b.doi ? b.doi.map((d) => d.chinh || []) : [b.chinh || []]);
function bacCau(kho, bai) {
  const bang = new Map(kho.map((h) => [h.ten, h.than]));
  for (const h of (bai.hamCuaMan || []).concat(bai.hamCuaEmMoi || [])) bang.set(h.ten, h.than);
  const da = new Set(), cho = [...loiGoi(chinhCua(bai).flat())];
  while (cho.length) { const t = cho.pop(); if (da.has(t)) continue; da.add(t); if (bang.has(t)) cho.push(...loiGoi(bang.get(t))); }
  return da;
}

const Cham = require('./cham.js');
const SanHoc = require('./san-hoc.js');
const M = require('./lo-trinh-hoc.js');
const TT = require('./thu-tu-chuong.js');
const LOI_GIA = process.argv.includes('--loi-gia');
if (LOI_GIA) {
  // Lỗi giả: sai ngưỡng nhịp, hai màn liền nhau cùng kiểu bài, một trùm mùa 1 mất huy hiệu, một màn mới khai thiếu hàm cần, màn đội của gói 10 còn một robot (recall gói 8 tụt còn 2).
  const a = M.timMa('trum-mua-1.3'); a.sao = Object.assign({}, a.sao, { nhip: a.sao.nhip - 1 });
  M.timMa('trum-mua-1.2').kieuBai = M.timMa('trum-mua-1.1').kieuBai;
  delete M.timMa('me-cung.10').huyHieu;
  M.timMa('trum-mua-1.1').hamCuaEmCan = M.timMa('trum-mua-1.1').hamCuaEmCan.filter((h) => h !== 'back');
  for (const m of M.danhSach) if (m.chuong === 'trum-mua-1' && m.doi) { m.kieuBai = 'giao-hang'; m.doi = m.doi.slice(0, 1); m.loiGiai.doi = m.loiGiai.doi.slice(0, 1); }
}

let dat = 0, hong = 0;
const kiem = (ten, fn) => { try { fn(); dat++; } catch (e) { hong++; console.log('  HỎNG ' + ten + '\n       ' + (e && e.message ? e.message.split('\n')[0] : e)); } };

const C1 = 'robot-hoan-thien', C2 = 'trum-mua-1';
const MOI = (M.manTrumMua1 || []).map((m) => m.ma);
const THU_TU = {
  'robot-hoan-thien': ['robot-hoan-thien.1', 'robot-hoan-thien.2', 'robot-hoan-thien.3', 'robot-hoan-thien.4', 'robot-hoan-thien.5', 'robot-hoan-thien.6',
    'robot-hoan-thien.7', 'robot-hoan-thien.8', 'cam-bien-ben.10', 'robot-hoan-thien.11'],
  'trum-mua-1': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => 'trum-mua-1.' + n)
};
/** Màn mà bộ dò khối chuẩn có đường nhanh hơn ngưỡng: lý do. */
const NHANH_HON = {
  'robot-hoan-thien.11': 'đếm cứng số bước lùi lên ◆ (mỗi kho một khác) thì bỏ được lần quay đầu thứ hai của pass_back(): nhanh hơn một nhịp mỗi sân, nhưng không chung được cho ba kho (đường đếm cứng không thắng cả ba sân)'
};
/** Robot khóa (màn hai robot): dãy khối nó chạy. */
const KHOI_KHOA = { 'trum-mua-1.4': { r: 1, khoi: ['pick', 'turn_right', 'drop'] } };
const BU = { dong: 3, nhip: 4, o: 6 };
const theoSan = (v, i) => (Array.isArray(v) ? v[i] : v);
const get = (ma) => M.timMa(ma);
const DS = MOI.map(get).filter(Boolean);
const { khoTruoc, daTaoTruoc } = khoTheoLoTrinh(M);
function cham(m, bai, moi) {
  const hs = new Map(khoTruoc.get(m.ma).map((h) => [h.ten, clone(h)]));
  for (const h of moi || []) hs.set(h.ten, clone(h));
  return Cham.cham(m, { chinh: bai.chinh, doi: bai.doi, hamCuaMan: bai.hamCuaMan || [] }, [...hs.values()]);
}
const PY = new Set(['range', 'print', 'len']);
function moiBai(m) {
  const ds = [{ ten: 'maMau', b: m.maMau, moi: [] }, { ten: 'loiGiai', b: m.loiGiai, moi: m.loiGiai.hamCuaEmMoi }];
  if (m.loiGiaiKhac) ds.push({ ten: 'loiGiaiKhac', b: m.loiGiaiKhac.baiLam, moi: m.loiGiaiKhac.hamCuaEmMoi });
  m.loiSai.forEach((ls, i) => ds.push({ ten: 'loiSai[' + i + ']', b: ls.baiLam, moi: ls.hamCuaEmMoi }));
  return ds;
}
const thanHam = (b, moi, boQua = []) => (b.hamCuaMan || []).filter((h) => !boQua.includes(h.ten)).concat(moi || []).flatMap((h) => h.than);
const dongCua = (x) => [...chinhCua(x.b).flat(), ...thanHam(x.b, x.moi)];
/** Số dòng người chơi viết / sửa: chương trình không khóa + thân hàm của màn không khóa + hàm mới. */
const soDong = (m) => {
  const lg = m.loiGiai;
  const chinh = m.doi ? lg.doi.reduce((s, d, i) => s + (m.doi[i].coDinh ? 0 : d.chinh.length), 0) : (m.chinhCoDinh ? 0 : lg.chinh.length);
  return chinh + thanHam(lg, lg.hamCuaEmMoi, m.khoaHamMan || []).length;
};
const coSan = (m) => Math.max(...dsSan(m).map((rows) => rows.join('').replace(/#/g, '').length));
const laBien = (l) => /^\s*[A-Za-z_]\w*(\s*\[[^\]]*\])?\s*[-+*/]?=(?!=)/.test(l) || /range\(\s*[A-Za-z_]/.test(l);
const LENH_MUA_1 = new Set(['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'arm_down', 'arm_up', 'arm_left', 'arm_right', 'grab', 'release',
  'front_clear', 'left_clear', 'right_clear']);
const KHAY_KEP = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'arm_down', 'arm_up', 'grab', 'release', 'front_clear', 'left_clear', 'right_clear'];
const KHAY_XOAY = KHAY_KEP.concat(['arm_left', 'arm_right']);
const tran = (a, b, bu) => a <= Math.max(1.5 * b, b + bu);

/* ------------------------------------------------------------------ 1. vị trí, mùa 1 đủ 200 màn, huy hiệu */
const goi = TT.goi.find((g) => g.ma === 'robot');
const mua1 = TT.goi.filter((g) => g.mua === 'mua-1');
const chuongDS = (c) => M.danhSach.filter((m) => m.chuong === c);
const coHinh = coHuyHieu;   // V7c1: mã có trong dữ liệu bộ vector (hình riêng hay bí danh)
kiem('gói robot "R1 xuất xưởng" là gói cuối mùa 1, đứng sau combo; hai chương robot-hoan-thien / trum-mua-1 đúng thứ tự, đúng hàng, đúng tên', () => {
  assert.ok(goi && goi.mua === 'mua-1');
  assert.equal(goi.ten, 'R1 xuất xưởng');
  assert.equal(mua1[mua1.length - 1], goi);
  assert.equal(mua1[mua1.length - 2].ma, 'combo');
  assert.deepEqual(goi.chuong, [C1, C2]);
  for (const c of goi.chuong) {
    const ds = chuongDS(c);
    assert.deepEqual(ds.map((m) => m.ma), THU_TU[c], c);
    assert.deepEqual(ds.map((m) => m.so), ds.map((_, i) => i + 1), c);
    assert.deepEqual(ds.map((m) => m.hang), ds.map((_, i) => (i < 3 ? 'lam-quen' : i < 6 ? 'luyen' : i < 9 ? 'bien-the' : 'trum')), c);
  }
  assert.equal(TT.ten[C2], 'Ngày xuất xưởng');      // tên theo quy tắc đặt tên (user duyệt 29/10)
  assert.equal(TT.thuTu.indexOf(C1), TT.thuTu.indexOf('che-combo') + 1);
  assert.equal(TT.thuTu.indexOf(C2), TT.thuTu.indexOf(C1) + 1);
});
kiem('robot-hoan-thien.10 đã cất (không còn trong lộ trình); không màn mùa 1 nào còn hàm của màn khóa có biến (người chơi xem được); mã / tên mới không trùng', () => {
  assert.ok((M.manCat || []).includes('robot-hoan-thien.10'));
  assert.equal(get('robot-hoan-thien.10'), null);
  const chuongMua1 = new Set(mua1.flatMap((g) => g.chuong));
  for (const m of M.danhSach.filter((x) => chuongMua1.has(x.chuong))) {
    const khoa = (m.loiGiai.hamCuaMan || []).concat(m.maMau.hamCuaMan || []).filter((h) => (m.khoaHamMan || []).includes(h.ten));
    assert.deepEqual(khoa.flatMap((h) => h.than).filter(laBien), [], m.ma + ' có hàm của màn khóa dùng biến');
  }
  for (const ma of MOI) { assert.ok(get(ma), ma + ' không có trong lộ trình'); assert.ok(!(M.manCat || []).includes(ma), ma + ' trùng màn cất'); }
  const tenMoi = DS.map((m) => m.ten), tenCu = M.danhSach.filter((m) => !MOI.includes(m.ma)).map((m) => m.ten);
  assert.equal(new Set(tenMoi).size, tenMoi.length, 'trùng tên trong gói');
  for (const t of tenMoi) assert.ok(!tenCu.includes(t), 'tên "' + t + '" trùng một màn khác của lộ trình');
});
kiem('MÙA 1 đúng 10 gói × 2 chương × 10 màn = 200 màn', () => {
  assert.equal(mua1.length, 10);
  for (const g of mua1) {
    assert.equal(g.chuong.length, 2, g.ma);
    for (const c of g.chuong) assert.equal(chuongDS(c).length, 10, g.ma + ' / ' + c);
  }
  assert.equal(mua1.flatMap((g) => g.chuong).reduce((s, c) => s + chuongDS(c).length, 0), 200);
});
kiem('mọi chương mùa 1: trùm là màn cuối, trùm có huy hiệu (huy-hieu.js có hình), màn khác không có; huy hiệu không trùng', () => {
  const daCo = new Map();
  for (const c of mua1.flatMap((g) => g.chuong)) {
    const ds = chuongDS(c), trum = ds[ds.length - 1];
    assert.equal(trum.hang, 'trum', c + ': màn cuối không phải trùm');
    assert.ok(trum.huyHieu && trum.huyHieu.ma && trum.huyHieu.ten, c + ': trùm ' + trum.ma + ' thiếu huy hiệu');
    assert.ok(coHinh(trum.huyHieu.ma), "huy-hieu.js thiếu HINH['" + trum.huyHieu.ma + "']");
    for (const m of ds.slice(0, -1)) assert.ok(!m.huyHieu && m.hang !== 'trum', m.ma + ' không phải màn cuối mà có huy hiệu / là trùm');
    assert.ok(!daCo.has(trum.huyHieu.ma), 'huy hiệu ' + trum.huyHieu.ma + ' trùng ' + daCo.get(trum.huyHieu.ma));
    daCo.set(trum.huyHieu.ma, trum.ma);
  }
  assert.equal(get('robot-hoan-thien.11').huyHieu.ma, 'robot-hoan-thien');
  assert.equal(get('trum-mua-1.10').huyHieu.ma, 'xuat-xuong');
});
kiem('choi.html nạp man-trum-mua-1.js (một lần) trước lo-trinh-hoc.js', () => {
  const html = fs.readFileSync(new URL('./game/choi.html', import.meta.url), 'utf8');
  const a = html.indexOf('../man-trum-mua-1.js'), b = html.indexOf('../lo-trinh-hoc.js');
  assert.ok(a > 0 && a < b);
  assert.equal(html.split('../man-trum-mua-1.js').length, 2);
});

/* ------------------------------------------------------------------ 5. bộ dò khối chuẩn (một hay hai robot, có điểm ◆) */
const VEC = SanHoc.VEC;
const KHOI = {
  move: [{ di: 1 }], back: [{ di: -1 }], turn_right: [{ quay: 1 }], turn_left: [{ quay: 3 }], u_turn: [{ quay: 2 }], wait: [{}],
  pick: [{ kep: 0 }, {}], drop: [{ tha: 0 }, {}],
  pick_left: [{ kep: 3 }, {}], pick_right: [{ kep: 1 }, {}], drop_left: [{ tha: 3 }, {}], drop_right: [{ tha: 1 }, {}]
};
const KHOI_KEP = ['move', 'back', 'turn_right', 'turn_left', 'u_turn', 'wait', 'pick', 'drop'];
const KHOI_XOAY = KHOI_KEP.concat(['pick_left', 'pick_right', 'drop_left', 'drop_right']);
const dsRobot = (m) => (m.doi ? m.doi : [{ batDau: m.batDau, robot: m.robot, co: null }]);
function nguCanh(m, si) {
  const nhieu = Array.isArray(m.san[0]), rows = dsSan(m)[si];
  if (/[^.#oDXFMCc]/.test(rows.join(''))) throw new Error(m.ma + ': bộ dò chỉ hỗ trợ tường, vật, ô đích, cờ, nút đè, cửa');
  const san = SanHoc.docSan(rows), rong = san.rong, cao = san.cao;
  const tuong = (o) => o < 0 || !!SanHoc.lyDoChan(san, 'banh', o % rong, (o - (o % rong)) / rong) && !san.cua.some((d) => d.y * rong + d.x === o);
  const ds = dsRobot(m).map((d) => {
    const bd = nhieu && Array.isArray(d.batDau) ? d.batDau[si] : d.batDau;
    const co = d.co ? SanHoc.coCuaSan(d.co, si, nhieu) : null;
    return { x: bd.x, y: bd.y, h: bd.huong || 0, xoay: d.robot.tay === 'xoay', co: co ? co.map((q) => q.y * rong + q.x) : null };
  });
  const bm = m.mucTieu === 'bong-mo' ? theoSan(m.bongMo, si) : null;
  return {
    m, si, rows, rong, cao, mucTieu: m.mucTieu || 'toi-co', ds, bm,
    o: (x, y) => (x < 0 || y < 0 || x >= rong || y >= cao ? -1 : y * rong + x),
    tuong, nut: san.nutDe.map((q) => q.y * rong + q.x),
    cua: san.cua.map((d) => {
      const noi = Array.isArray(m.san[0]) ? (m.noi || [])[si] : m.noi;
      const nut = noi ? noi.filter((g) => (g.cua || []).some((c) => c.x === d.x && c.y === d.y)).map((g) => san.nutDe.findIndex((q) => q.x === g.nut.x && q.y === g.nut.y))
        : san.nutDe.map((_, k) => k);
      return { o: d.y * rong + d.x, mo0: d.mo, nut };
    }),
    laCo: (o) => o >= 0 && rows[(o - (o % rong)) / rong][o % rong] === 'F', dich: new Set(san.dich.map((d) => d.y * rong + d.x)),
    vat0: san.vat.map((v) => v.y * rong + v.x),
    dichVat: bm ? (bm.vat || []).map((v) => v.y * rong + v.x).sort((a, b) => a - b) : null,
    diQua: bm ? (bm.diQua || []).map((q) => q.y * rong + q.x) : []
  };
}
const ke = (ctx, x, y, h) => { const v = VEC[((h % 4) + 4) % 4]; return ctx.o(x + v[0], y + v[1]); };
function buoc(ctx, S, chon) {
  const r = S.r.map((R) => Object.assign({}, R)), pos = S.pos.slice(), cua = S.cua.slice();
  let qua = S.qua;
  const vi = (R) => ctx.o(R.x, R.y);
  const hd = r.map((R, i) => {
    if (R.xong) return {};
    if (R.k === null) { R.k = chon[i]; R.b = 0; }
    return KHOI[R.k][R.b];
  });
  const dinh = r.map((R, i) => (hd[i].di ? ke(ctx, R.x, R.y, R.h + (hd[i].di > 0 ? 0 : 2)) : -2));
  const kepO = r.map((R, i) => (hd[i].kep !== undefined && R.cam < 0 ? ke(ctx, R.x, R.y, R.h + hd[i].kep) : -1));
  const tranh = r.length > 1 && kepO[0] >= 0 && kepO[0] === kepO[1];
  const cuaDong = (o) => ctx.cua.some((d, j) => d.o === o && !cua[j]);
  for (let i = 0; i < r.length; i++) {
    const R = r[i], a = hd[i], K = r.filter((_, j) => j !== i);
    if (R.xong) continue;
    if (a.kep !== undefined && R.cam < 0 && !tranh) {
      const j = pos.indexOf(kepO[i]); if (kepO[i] >= 0 && j >= 0) { pos[j] = -1; R.cam = j; }
    } else if (a.tha !== undefined && R.cam >= 0) {
      const t = ke(ctx, R.x, R.y, R.h + a.tha);
      if (t >= 0 && !ctx.tuong(t) && pos.indexOf(t) < 0 && !K.some((Q) => vi(Q) === t) && !ctx.cua.some((d) => d.o === t)) { pos[R.cam] = t; R.cam = -1; }
    } else if (a.di) {
      const c = dinh[i];
      if (c >= 0 && !ctx.tuong(c) && !cuaDong(c) && pos.indexOf(c) < 0 && !K.some((Q) => vi(Q) === c) && !dinh.some((d, j) => j !== i && d === c)) { R.x = c % ctx.rong; R.y = (c - R.x) / ctx.rong; }
    } else if (a.quay) R.h = (R.h + a.quay) % 4;
    R.b++;
    if (R.b >= KHOI[R.k].length) { R.k = null; R.b = 0; }
  }
  ctx.diQua.forEach((o, k) => { if (r.some((R) => vi(R) === o)) qua |= 1 << k; });
  const batNut = ctx.nut.map((o) => r.some((R) => vi(R) === o) || pos.includes(o));
  ctx.cua.forEach((d, j) => {
    const bat = d.nut.some((k) => k >= 0 && batNut[k]);
    const muon = bat ? !d.mo0 : d.mo0;
    if (muon === cua[j]) return;
    if (!muon && (r.some((R) => vi(R) === d.o) || pos.includes(d.o))) return;
    cua[j] = muon;
  });
  if (ctx.mucTieu === 'toi-co') r.forEach((R, i) => { const o = vi(R); if (!R.xong && ctx.laCo(o) && (!ctx.ds[i].co || ctx.ds[i].co.includes(o))) { R.xong = true; R.k = null; } });
  return { r, pos, cua, qua };
}
function laDich(ctx, S) {
  if (ctx.mucTieu === 'toi-co') return S.r.every((R) => R.xong);
  if (ctx.mucTieu === 'dua-vat') return S.pos.every((p) => p >= 0 && ctx.dich.has(p));
  const R = S.r[0], bm = ctx.bm;
  if (S.qua !== (1 << ctx.diQua.length) - 1) return false;
  if (R.k !== null || R.x !== bm.x || R.y !== bm.y || R.h !== (bm.huong || 0) || (R.cam >= 0) !== !!bm.cam) return false;
  const p = S.pos.filter((x) => x >= 0).sort((a, b) => a - b);
  return p.length === ctx.dichVat.length && p.every((c, k) => c === ctx.dichVat[k]);
}
function bfs(m, si, tuyChon = {}, toiDa = 600000) {
  const ctx = nguCanh(m, si);
  const S0 = { r: ctx.ds.map((d) => ({ x: d.x, y: d.y, h: d.h, cam: -1, k: null, b: 0, xong: false, q: 0 })), pos: ctx.vat0.slice(), cua: ctx.cua.map((d) => d.mo0), qua: 0 };
  ctx.diQua.forEach((o, k) => { if (S0.r.some((R) => ctx.o(R.x, R.y) === o)) S0.qua |= 1 << k; });
  const khoa = tuyChon.khoa;
  const ma = (S) => S.r.map((R) => [R.x, R.y, R.h, R.cam, R.k, R.b, R.xong ? 1 : 0, R.q].join(',')).join('|') + '|' + S.pos.join('.') + '|' + S.cua.map(Number).join('') + '|' + S.qua;
  const thay = new Set([ma(S0)]);
  let lop = [{ S: S0, vet: S0.r.map(() => []) }];
  for (let n = 1; n <= 250 && lop.length; n++) {
    const tiep = [];
    for (const { S, vet } of lop) {
      const lua = S.r.map((R, i) => {
        if (R.xong || R.k !== null) return [null];
        if (khoa && khoa.r === i) return [R.q < khoa.khoi.length ? khoa.khoi[R.q] : 'wait'];
        if (tuyChon.dungYen === i) return ['wait'];
        return ctx.ds[i].xoay ? KHOI_XOAY : KHOI_KEP;
      });
      const toHop = lua.reduce((acc, ls) => acc.flatMap((a) => ls.map((x) => a.concat([x]))), [[]]);
      for (const chon of toHop) {
        const N = buoc(ctx, S, chon);
        chon.forEach((x, i) => { N.r[i].q = x !== null && khoa && khoa.r === i ? S.r[i].q + 1 : S.r[i].q; });
        const k = ma(N);
        if (thay.has(k)) continue;
        thay.add(k);
        const v2 = vet.map((v, i) => (chon[i] === null ? v : v.concat(chon[i])));
        if (laDich(ctx, N)) return { nhip: n, khoi: v2 };
        tiep.push({ S: N, vet: v2 });
        if (thay.size > toiDa) throw new Error(m.ma + ' sân ' + si + ': bộ dò vượt ' + toiDa + ' trạng thái');
      }
    }
    lop = tiep;
  }
  return { nhip: null, khoi: null };
}
function thanhMa(khoi) {
  const ds = [];
  for (let i = 0; i < khoi.length;) {
    let j = i; while (j < khoi.length && khoi[j] === khoi[i]) j++;
    if (j - i >= 2) ds.push('for i in range(' + (j - i) + '):', '    ' + khoi[i] + '()'); else ds.push(khoi[i] + '()');
    i = j;
  }
  return ds;
}
function manSan(m, si) {
  const x = clone(m);
  delete x.chinhCoDinh;
  x.khung = Object.assign({}, x.khung, { chinh: 99 });
  delete x.gioiHanHam;
  if (soSan(m) > 1) {
    x.san = clone(m.san[si]); delete x.nhipTheo;
    for (const k of ['batDau', 'bongMo']) if (Array.isArray(m[k])) x[k] = clone(m[k][si]);
    if (Array.isArray(m.noi) && Array.isArray(m.noi[0])) x.noi = clone(m.noi[si]);
    (x.doi || []).forEach((d, i) => { d.batDau = clone(m.doi[i].batDau[si]); if (m.doi[i].co && Array.isArray(m.doi[i].co[0])) d.co = clone(m.doi[i].co[si]); });
    if (x.doi) x.batDau = clone(x.doi[0].batDau);
  }
  return x;
}
function baiDuong(m, khoi) {
  if (!m.doi) return { chinh: thanhMa(khoi[0]), hamCuaMan: [] };
  return { doi: khoi.map((k, i) => ({ chinh: m.doi[i].coDinh ? m.maMau.doi[i].chinh.slice() : thanhMa(k) })), hamCuaMan: [] };
}
const bang = {};

/* ------------------------------------------------------------------ 2–3, 5. từng màn mới */
for (const m of DS) {
  const kho = khoTruoc.get(m.ma), daTao = daTaoTruoc.get(m.ma);
  const c1 = m.chuong === C1;
  bang[m.ma] = {};
  kiem(m.ma + ': đủ trường, số sân, robot, chặn biến, không bậc thang', () => {
    for (const k of ['ten', 'deBai', 'san', 'batDau', 'mucTieu', 'hamGoc', 'sao', 'maMau', 'loiGiai', 'loiGiaiKhac', 'goiY', 'hamCuaEmCan', 'kieuBai']) assert.ok(m[k] !== undefined && m[k] !== '', m.ma + ' thiếu ' + k);
    assert.ok(m.loiSai.length >= 2, m.ma + ' cần ít nhất 2 lời sai');
    for (const ls of m.loiSai) assert.ok(ls.moTa && ls.phaiCoMa && ls.phaiCoMa.length, m.ma + ' lời sai thiếu moTa / phaiCoMa');
    assert.ok(m.goiY.length >= 1);
    assert.equal(soSan(m), m.hang === 'trum' ? 3 : 1, m.ma + ' số sân');
    for (const rows of dsSan(m)) assert.ok(!/S/.test(rows.join('')), m.ma + ' sân có bậc thang');
    if (m.doi) {
      assert.ok(!c1, m.ma + ': chương Tổng hợp không có màn hai robot mới');
      assert.equal(m.doi.length, 2);
      const [a, b] = m.doi;
      assert.deepEqual([a.robot.than, a.robot.tay, a.robot.son], ['hai-banh', 'xoay', 'vang'], m.ma + ' R1');
      assert.deepEqual([b.robot.than, b.robot.tay, b.robot.son], ['hai-banh', 'kep', 'lam'], m.ma + ' R2');
      assert.deepEqual(a.hamGoc.slice().sort(), KHAY_XOAY.slice().sort(), m.ma + ' khay R1');
      assert.deepEqual(b.hamGoc.slice().sort(), KHAY_KEP.slice().sort(), m.ma + ' khay R2');
      for (const d of m.doi) assert.deepEqual(d.robot.camBien.map((c) => c.ma), ['khoang-cach']);
    } else {
      assert.deepEqual([m.robot.than, m.robot.tay], ['hai-banh', c1 ? 'kep' : 'xoay'], m.ma + ' robot');
      assert.deepEqual(m.robot.camBien.map((c) => c.ma), ['khoang-cach']);
      assert.deepEqual(m.hamGoc.slice().sort(), (c1 ? KHAY_KEP : KHAY_XOAY).slice().sort(), m.ma + ' khay');
    }
    assert.ok(m.khung.chanBien, m.ma + ' phải chặn biến (khung.chanBien)');
    assert.ok(!m.bienDem, m.ma + ' mở nhóm ĐẾM');
    if (m.hang === 'trum') assert.ok(m.huyHieu, m.ma + ' trùm thiếu huy hiệu');
    else assert.ok(!m.huyHieu, m.ma + ' không phải trùm mà có huy hiệu');
  });
  kiem(m.ma + ': robot khóa chạy đúng chương trình của mã mẫu; chương trình chính khóa giống mã mẫu', () => {
    for (const x of moiBai(m)) {
      (m.doi || []).forEach((d, i) => { if (d.coDinh) assert.deepEqual(x.b.doi[i].chinh, m.maMau.doi[i].chinh, m.ma + ' ' + x.ten + ': R' + (i + 1) + ' khác bản khóa'); });
      if (m.chinhCoDinh) assert.deepEqual(x.b.chinh, m.maMau.chinh, m.ma + ' ' + x.ten + ': chương trình chính khác bản khóa');
    }
  });
  kiem(m.ma + ': ràng buộc mùa 1 (không biến, không tham số, không tạo hàm mới, chỉ lệnh mùa 1 kể cả qua kho)', () => {
    for (const x of moiBai(m)) {
      for (const h of (x.b.hamCuaMan || []).concat(x.moi || [])) assert.deepEqual(h.thamSo || [], [], m.ma + ' ' + x.ten + ': hàm ' + h.ten + ' có tham số');
      assert.deepEqual(dongCua(x).filter(laBien), [], m.ma + ' ' + x.ten + ' dùng biến');
      const l = bacCau(kho, Object.assign({ hamCuaEmMoi: x.moi || [] }, x.b));
      const goc = [...l].filter((t) => !kho.some((h) => h.ten === t) && !(x.b.hamCuaMan || []).some((h) => h.ten === t) && !PY.has(t));
      for (const t of goc) assert.ok(LENH_MUA_1.has(t), m.ma + ' ' + x.ten + ' gọi lệnh ngoài mùa 1: ' + t);
    }
    assert.deepEqual(m.loiGiai.hamCuaEmMoi || [], [], m.ma + ' tạo hàm của em mới (cần mục Sổ lệnh)');
    assert.deepEqual(m.taoHam || [], [], m.ma + ' có taoHam');
    assert.ok(!(m.khoaHamMan || []).length, m.ma + ' có hàm của màn khóa');
    for (const h of m.loiGiai.hamCuaMan || []) assert.ok(!kho.some((x) => x.ten === h.ten), m.ma + ': hàm của màn ' + h.ten + ' trùng tên hàm của em');
  });
  kiem(m.ma + ': hàm của em cần đã học trước màn; mọi lời gọi hàm của em (thẳng hay qua hàm của màn) đều khai trong hamCuaEmCan', () => {
    for (const h of m.hamCuaEmCan) assert.ok(daTao.has(h) && kho.some((x) => x.ten === h), m.ma + ' cần ' + h + ' nhưng chưa màn nào trước nó tạo');
    for (const x of moiBai(m)) {
      const rieng = new Set((x.b.hamCuaMan || []).concat(x.moi || []).map((h) => h.ten));
      for (const t of loiGoi(dongCua(x))) {
        if (PY.has(t) || rieng.has(t) || KHAY_XOAY.includes(t)) continue;
        assert.ok(m.hamCuaEmCan.includes(t), m.ma + ' ' + x.ten + ' gọi ' + t + '() mà không khai trong hamCuaEmCan');
      }
    }
  });
  kiem(m.ma + ': lời giải 3 sao đúng ngưỡng, không chẩn đoán; mã mẫu chưa thắng; lời giải khác 2 sao; lời sai thua đúng mã', () => {
    const r = cham(m, m.loiGiai, m.loiGiai.hamCuaEmMoi);
    Object.assign(bang[m.ma], { o: r.soO, nhip: r.soNhip });
    assert.ok(r.thang, m.ma + ' lời giải thua: ' + JSON.stringify(r.chanDoan.map((c) => c.ma + ': ' + c.loi)));
    assert.equal(r.soO, m.sao.o, m.ma + ' soO=' + r.soO + ' khai ' + m.sao.o);
    assert.equal(r.soNhip, m.sao.nhip, m.ma + ' soNhip=' + r.soNhip + ' khai ' + m.sao.nhip);
    assert.equal(r.sao, 3, m.ma + ' sao=' + r.sao);
    assert.deepEqual(r.chanDoan.map((c) => c.ma), [], m.ma + ' lời giải có chẩn đoán');
    assert.ok(r.theoSan.length === soSan(m) && r.theoSan.every((s) => s.thang));
    assert.equal(cham(m, m.maMau).thang, false, m.ma + ' mã mẫu đã thắng sẵn');
    const rk = cham(m, m.loiGiaiKhac.baiLam, m.loiGiaiKhac.hamCuaEmMoi);
    assert.ok(rk.thang, m.ma + ' lời giải khác thua: ' + JSON.stringify(rk.chanDoan.map((c) => c.ma)));
    assert.equal(rk.sao, 2, m.ma + ' lời giải khác sao=' + rk.sao + ' (o ' + rk.soO + ', nhịp ' + rk.soNhip + ')');
    for (const ls of m.loiSai) {
      const rl = cham(m, ls.baiLam, ls.hamCuaEmMoi);
      assert.equal(rl.thang, false, m.ma + ' lời sai "' + ls.moTa + '" lại thắng');
      const ma = rl.chanDoan.map((c) => c.ma);
      for (const x of ls.phaiCoMa) assert.ok(ma.includes(x), m.ma + ' lời sai "' + ls.moTa + '" thiếu mã ' + x + ' (có: ' + ma.join(',') + ')');
    }
  });
  if (m.doi) kiem(m.ma + ': cần cả đội: bỏ chương trình một robot (không khóa) thì lời giải thua', () => {
    for (let i = 0; i < 2; i++) {
      if (m.doi[i].coDinh) continue;
      const b = clone(m.loiGiai); b.doi[i].chinh = [];
      assert.equal(cham(m, b).thang, false, m.ma + ': bỏ chương trình R' + (i + 1) + ' mà vẫn thắng');
    }
  });
  kiem(m.ma + ': bộ dò khối chuẩn: không có đường nhanh hơn ngưỡng (trừ lý do khai); đường dò chạy thật đúng nhịp; trùm: đếm cứng một sân không thắng cả ba', () => {
    let tong = 0;
    const duong = [];
    const khoa = KHOI_KHOA[m.ma];
    if ((m.doi || []).some((d) => d.coDinh)) assert.ok(khoa && m.doi[khoa.r].coDinh, m.ma + ': màn có robot khóa cần khai KHOI_KHOA');
    for (let si = 0; si < soSan(m); si++) {
      const b = bfs(m, si, { khoa });
      assert.ok(b.nhip !== null, m.ma + ' sân ' + si + ': bộ dò không tới được đích');
      tong += b.nhip;
      const bai = baiDuong(m, b.khoi);
      duong.push(bai);
      const rr = Cham.cham(manSan(m, si), bai, kho);
      const txt = JSON.stringify(chinhCua(bai).map((d) => d.join(' ; ')));
      assert.ok(rr.thang, m.ma + ' sân ' + si + ': đường dò được thua khi chạy thật: ' + txt + ' ' + JSON.stringify(rr.chanDoan.map((c) => c.ma)));
      assert.equal(rr.soNhip, b.nhip, m.ma + ' sân ' + si + ': bộ dò (' + b.nhip + ') và máy chấm (' + rr.soNhip + ') lệch nhịp: ' + txt);
      if (m.doi && m.mucTieu === 'dua-vat') {
        for (let i = 0; i < 2; i++) {
          if (khoa && khoa.r === i) continue;
          assert.equal(bfs(m, si, { khoa, dungYen: i }).nhip, null, m.ma + ' sân ' + si + ': R' + (i + 1) + ' đứng yên mà đội vẫn đưa được vật tới đích');
        }
      }
    }
    bang[m.ma].khoi = tong;
    bang[m.ma].duong = duong.map((d) => chinhCua(d).map((x) => x.join(' ; ')).join(' || ')).join(' ## ');
    if (NHANH_HON[m.ma]) assert.ok(tong < m.sao.nhip, m.ma + ': khai NHANH_HON mà đường khối chuẩn không nhanh hơn (' + tong + ' / ' + m.sao.nhip + ')');
    else assert.ok(tong >= m.sao.nhip, m.ma + ': đường khối chuẩn ' + tong + ' nhịp nhanh hơn ngưỡng ' + m.sao.nhip + ': ' + bang[m.ma].duong);
    if (soSan(m) > 1) {
      for (let i = 0; i < duong.length; i++) {
        const mr = Object.assign(clone(m), { khung: Object.assign({}, m.khung, { chinh: 99 }) });
        delete mr.chinhCoDinh; delete mr.gioiHanHam;
        const r = cham(mr, duong[i]);
        assert.ok(!r.thang && r.theoSan[i].thang, m.ma + ': đường đếm cứng của sân ' + i + ' thắng cả ba sân (hay thua chính sân đó)');
      }
    }
  });
  const hm = (m.loiGiai.hamCuaMan || []).filter((h) => !(m.khoaHamMan || []).includes(h.ten));
  if (m.chinhCoDinh && hm.length) {
    kiem(m.ma + ': chương trình chính khóa: thân hàm của màn đếm cứng (không hỏi cảm biến) không được 3 sao khi hàm được gọi ở nhiều chỗ', () => {
      assert.equal(hm.length, 1, m.ma + ' cần đúng một hàm của màn người chơi viết');
      const ten = hm[0].ten + '()', ds = chinhCua(m.loiGiai).flat();
      const goiNhieu = ds.filter((l) => l.includes(ten)).length >= 2 || ds.some((l) => /^\s*for /.test(l));
      const lenh = ['move()', 'back()', 'turn_right()', 'turn_left()', 'u_turn()', 'pick()', 'drop()', 'pick_left()', 'pick_right()', 'drop_left()', 'drop_right()'];
      const than = [[]];
      for (let d = 1; d <= 3; d++) for (const t of than.filter((x) => x.length === d - 1)) for (const l of lenh) than.push(t.concat(l));
      for (const di of ['move()', 'back()']) for (let n = 2; n <= 6; n++) for (const l of [[], ...lenh.map((x) => [x])]) than.push([...l, 'for i in range(' + n + '):', '    ' + di]);
      let soThang = 0, so3 = 0;
      for (const t of than) {
        const b = clone(m.loiGiai);
        b.hamCuaMan = b.hamCuaMan.map((h) => (h.ten === hm[0].ten ? { ten: h.ten, thamSo: [], than: t } : h));
        const r = cham(m, b);
        if (goiNhieu) assert.ok(!(r.thang && r.sao === 3), m.ma + ': thân đếm cứng [' + t.join('; ') + '] được 3 sao');
        if (r.thang) soThang++;
        if (r.thang && r.sao === 3) so3++;
      }
      bang[m.ma].demCung = (goiNhieu ? 'gọi nhiều chỗ' : 'gọi một lần') + ': ' + soThang + '/' + than.length + ' thân đếm cứng thắng, ' + so3 + ' được 3 sao';
    });
  }
}

/* ------------------------------------------------------------------ 4. đường cong */
kiem('đường cong chương Trùm mùa: dòng / nhịp / cỡ sân màn n ≤ max(1,5 × màn n−1, màn n−1 + bù), trừ trùm', () => {
  const ds = chuongDS(C2);
  for (let i = 1; i < ds.length; i++) {
    const m = ds[i], t = ds[i - 1];
    if (m.hang === 'trum') continue;
    assert.ok(tran(soDong(m), soDong(t), BU.dong), m.ma + ' dòng ' + soDong(m) + ' so với ' + t.ma + ' ' + soDong(t));
    assert.ok(tran(m.sao.nhip, t.sao.nhip, BU.nhip), m.ma + ' nhịp ' + m.sao.nhip + ' so với ' + t.ma + ' ' + t.sao.nhip);
    assert.ok(tran(coSan(m), coSan(t), BU.o), m.ma + ' cỡ sân ' + coSan(m) + ' so với ' + t.ma + ' ' + coSan(t));
  }
});
kiem('màn 1 Trùm mùa dễ hơn trùm chương Tổng hợp (robot-hoan-thien.11) rất nhiều: nhịp ≤ 1/4, dòng và cỡ sân không lớn hơn', () => {
  const a = chuongDS(C2)[0], t = get('robot-hoan-thien.11');
  assert.ok(a.sao.nhip * 4 <= t.sao.nhip, a.ma + ' nhịp ' + a.sao.nhip + ' / trùm ' + t.sao.nhip);
  assert.ok(soDong(a) <= soDong(t) && coSan(a) <= coSan(t));
});
kiem('trùm cuối mùa (trum-mua-1.10) dùng gần như mọi thứ: tay xoay, cảm biến trước + bên, lùi, nút đè, hàm tự viết, vòng lặp, nhiều sân', () => {
  const m = get('trum-mua-1.10'), lg = m.loiGiai;
  const L = bacCau(khoTruoc.get(m.ma), lg);
  const dong = chinhCua(lg).flat().concat((lg.hamCuaMan || []).flatMap((h) => h.than));
  assert.ok(L.has('arm_left') || L.has('arm_right'), 'tay xoay');
  assert.ok(L.has('front_clear'), 'cảm biến trước');
  assert.ok(L.has('left_clear') || L.has('right_clear'), 'cảm biến bên');
  assert.ok(L.has('back'), 'lùi');
  assert.ok(dsSan(m).every((rows) => rows.join('').includes('M')), 'nút đè ở mọi sân');
  assert.ok((lg.hamCuaMan || []).some((h) => !(m.khoaHamMan || []).includes(h.ten)), 'hàm tự viết (hàm của màn)');
  assert.ok(dong.some((l) => /^\s*(for|while) /.test(l)), 'vòng lặp');
  assert.equal(soSan(m), 3);
});
// Hai màn vong-lap thêm tay kẹp (gói 2 chương 2): đổi qua lộ trình, giữ đường cong chương.
const VL = ['vong-lap.8', 'vong-lap.9'];
kiem('vong-lap.8, .9 có tay kẹp (pick / drop, mục tiêu đưa vật), lời giải dùng for, chỉ hàm của gói 1–2, không cảm biến / lùi; vong-lap.10 không đổi', () => {
  const vl = chuongDS('vong-lap');
  const goi12 = new Set(mua1.slice(0, 2).flatMap((g) => g.chuong));
  for (const ma of VL) {
    const m = get(ma);
    assert.equal(m.chuong, 'vong-lap');
    assert.equal(m.mucTieu, 'dua-vat', ma);
    const l = bacCau(khoTruoc.get(ma), m.loiGiai);
    assert.ok(l.has('pick') && l.has('drop'), ma + ' chưa dùng tay kẹp');
    assert.ok(m.loiGiai.chinh.some((s) => /^\s*for /.test(s)), ma + ' lời giải không có for');
    for (const t of ['front_clear', 'left_clear', 'right_clear', 'left_back', 'right_back', 'back']) assert.ok(!l.has(t), ma + ' dùng ' + t);
    assert.ok(!(m.hamGoc || []).some((h) => /clear|back/.test(h)), ma + ' khay có cảm biến / lùi');
    for (const h of m.hamCuaEmCan) {
      const tao = M.danhSach.find((x) => (x.taoHam || []).concat((x.loiGiai.hamCuaEmMoi || []).map((f) => f.ten)).includes(h));
      assert.ok(tao && goi12.has(tao.chuong), ma + ' cần ' + h + ' không thuộc gói 1–2');
    }
    assert.ok(vl.indexOf(m) >= 6 && vl.indexOf(m) <= 8, ma + ' không ở gần cuối chương');
    // trải for ra: tràn khung hay mất sao
    const trai = [];
    const lg = m.loiGiai.chinh;
    for (let i = 0; i < lg.length; i++) {
      const f = /^(\s*)for \w+ in range\((\d+)\):/.exec(lg[i]);
      if (!f || f[1].length) { if (!/^\s{4}/.test(lg[i]) || !trai.length) trai.push(lg[i].replace(/^\s{4}/, '')); continue; }
      const than = []; let j = i + 1;
      while (j < lg.length && /^\s{4}/.test(lg[j])) than.push(lg[j++].slice(4));
      for (let k = 0; k < +f[2]; k++) trai.push(...than);
      i = j - 1;
    }
    const r = cham(m, { chinh: trai });
    assert.ok(!r.thang || r.sao < 3, ma + ': trải for ra mà vẫn 3 sao');
  }
  assert.equal(get('vong-lap.10').phienBanNoiDung, undefined, 'vong-lap.10 bị đổi');
});
kiem('đường cong chương vong-lap quanh hai màn sửa (màn trước → 8 → 9 → màn sau): dòng / nhịp / cỡ sân trong luật đo', () => {
  const vl = chuongDS('vong-lap');
  for (const ma of VL) {
    const i = vl.indexOf(get(ma));
    for (const [m, t] of [[vl[i], vl[i - 1]], [vl[i + 1], vl[i]]]) {
      if (m.hang === 'trum') continue;
      assert.ok(tran(soDong(m), soDong(t), BU.dong), m.ma + ' dòng ' + soDong(m) + ' so với ' + t.ma + ' ' + soDong(t));
      assert.ok(tran(m.sao.nhip, t.sao.nhip, BU.nhip), m.ma + ' nhịp ' + m.sao.nhip + ' so với ' + t.ma + ' ' + t.sao.nhip);
      assert.ok(tran(coSan(m), coSan(t), BU.o), m.ma + ' cỡ sân ' + coSan(m) + ' so với ' + t.ma + ' ' + coSan(t));
    }
  }
});

/* ------------------------------------------------------------------ 6. bảng recall gộp gói 9 + 10 */
const goi9 = TT.goi.find((g) => g.ma === 'combo');
const dsGoi = goi9.chuong.concat(goi.chuong).flatMap(chuongDS);
const RC = new Map();
const recallCua = (m) => {
  if (!RC.has(m.ma)) RC.set(m.ma, recallMan(m, khoTruoc.get(m.ma), (mSua) => { try { return cham(mSua, m.loiGiai, m.loiGiai.hamCuaEmMoi).thang; } catch (e) { return false; } }));
  return RC.get(m.ma);
};
const KQ = kiemRecall(dsGoi, recallCua, { moi: (m) => m.chuong === C2, toiThieu: 3 });
const KQ1 = kiemRecall([get('robot-hoan-thien.11')], recallCua, { yChinh: [], khac: [1, 2, 3, 4, 5, 6, 7, 8], toiThieuKhac: 2, toiThieu: 0 });
kiem('recall gộp gói 9 + 10: (a) màn Trùm mùa có tay xoay + cảm biến bên + ≥ 2 gói khác, robot-hoan-thien.11 ≥ 2 gói; (b) mỗi gói 1–8 ≥ 3 lần; (c) không hai màn liền nhau cùng kiểu bài', () => {
  assert.deepEqual(KQ.loi.concat(KQ1.loi), []);
});

console.log('chương | số | mã | tên | kiểu bài | gói recall | dòng | nhịp | ô | cỡ sân | khối chuẩn');
for (const m of goi.chuong.flatMap(chuongDS)) {
  const b = bang[m.ma] || {}, r = recallCua(m);
  console.log([m.chuong, m.so, m.ma + (MOI.includes(m.ma) ? '' : ' (cũ)'), m.ten, m.kieuBai, [...r.goi].sort().map((g) => g + ':' + r.lyDo[g]).join(', '), soDong(m), m.sao.nhip + (b.nhip !== undefined && b.nhip !== m.sao.nhip ? ' (đo ' + b.nhip + ')' : ''), m.sao.o + (b.o !== undefined && b.o !== m.sao.o ? ' (đo ' + b.o + ')' : ''), coSan(m), (b.khoi ?? '') + (NHANH_HON[m.ma] ? ' (NHANH_HON)' : '')].join(' | '));
}
const dem10 = kiemRecall(goi.chuong.flatMap(chuongDS), recallCua, { moi: () => false, toiThieu: 0 }).dem;
console.log('BẢNG RECALL gộp gói 9 + 10 (' + dsGoi.length + ' màn): ' + Object.entries(KQ.dem).map(([g, n]) => g + ' ' + GOI_RECALL[g] + ' = ' + n + ' (gói 10: ' + dem10[g] + ')').join(' · '));
for (const l of KQ.loi.concat(KQ1.loi)) console.log('  recall: ' + l);
for (const ma of Object.keys(bang)) if (bang[ma].demCung) console.log('đếm cứng ' + ma + ': ' + bang[ma].demCung);
console.log('MÙA 1: ' + mua1.map((g) => g.ma + ' ' + g.chuong.map((c) => c + ':' + chuongDS(c).length).join(' + ')).join(' · '));
if (process.argv.includes('--duong')) for (const ma of Object.keys(bang)) console.log('đường dò ' + ma + ': ' + bang[ma].duong);
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong + ' kiểm tra gói R1 xuất xưởng.');
if (hong) process.exitCode = 1;
