/* ============================================================================
   kiem-combo-mua-1.mjs — máy kiểm gói 9 "Combo" của mùa 1 (man-combo-mua-1.js + che-cam-bien.10 do lo-trinh-hoc.js đưa về):
   chương `combo` "Nhìn bên, nhặt bên" (combo.1 … .10) và `che-combo` "Combo mở rộng" (che-combo.1 … .9 + che-cam-bien.10).
   1. Vị trí: gói combo (mùa 1) đứng giữa gói hai-robot và gói robot, hai chương đúng thứ tự THU_TU, hàng lam-quen / luyen / bien-the / trum;
      trùm combo.10 / che-combo.9 mang huy hiệu 'combo' / 'che-combo' (huy-hieu.js có hình); choi.html nạp man-combo-mua-1.js trước lo-trinh-hoc.js;
      mã mới không trùng màn có sẵn hay màn đã cất; tên màn không trùng trong lộ trình; che-cam-bien.10 rời danh sách cất.
   2. Từng màn mới: đủ trường (kể cả kieuBai); một sân (trùm: ba sân); robot hai bánh + TAY XOAY + cảm biến khoảng cách (màn hai robot: R1 tay kẹp vàng,
      R2 tay xoay lam); lời giải thắng 3 sao đúng sao.o / sao.nhip, không chẩn đoán; mã mẫu chưa thắng; lời giải khác đúng 2 sao; mỗi lời sai thua
      và có đủ mã phaiCoMa; hàm của em cần đã học trước màn và khai đủ (cả lời gọi qua hàm của màn); robot khóa chạy đúng chương trình mã mẫu.
   3. Ràng buộc mùa 1: không biến, không hàm có tham số, không bậc thang, không tạo hàm của em mới; mọi lệnh chạy tới (bắc cầu qua kho) là lệnh mùa 1.
   4. Đường cong của CẢ HAI chương: dòng (chương trình không khóa + thân hàm của màn không khóa), nhịp, cỡ sân (ô không phải tường) của màn n
      ≤ max(1,5 × màn n−1, màn n−1 + bù), bù dòng +3, nhịp +4, cỡ sân +6; trừ trùm. Màn 1 dễ hơn trùm gói 8 (che-hai-robot.10) rất nhiều.
   5. Bộ dò đường tắt:
      - BFS "khối chuẩn" một hay hai robot (move / back / turn_* / u_turn / wait 1 nhịp; pick / drop 2 nhịp; tay xoay thêm pick_left / pick_right /
        drop_left / drop_right 2 nhịp; nút đè M giữ cửa C; luật hai robot như kiem-doi-mua-1.mjs). Đường dò được dịch thành chương trình rồi CHẠY THẬT
        (đúng số nhịp). Không có đường nào nhanh hơn ngưỡng sao.nhip — trừ màn khai NHANH_HON (lý do ghi kèm); trùm: đường ngắn nhất từng sân
        (đếm cứng) không thắng cả ba sân; màn hai robot đưa vật: một robot đứng yên thì không thắng.
      - màn chương trình chính khóa gọi hàm của màn ở nhiều chỗ: mọi thân đếm cứng (≤ 3 lệnh, hay một vòng for) không được 3 sao.
   6. BẢNG RECALL (KE-HOACH-MUA-1.md, "Đường cong học và recall"): mỗi màn đánh dấu gói 1–8 nào được dùng, đọc từ lời giải (lệnh gọi tới
      bắc cầu qua hàm của em / hàm của màn, vòng for, hàm của màn người chơi viết, ký hiệu sân M, số robot). Ba luật:
      (a) mỗi màn MỚI có combo (gói 6 tay xoay + gói 7 cảm biến bên) và ít nhất HAI gói khác trong {1, 2, 3, 4, 5, 8};
      (b) trên cả gói, mỗi gói 1–8 được nhắc ít nhất 2 lần; (c) không hai màn liền nhau cùng kiểu bài (kieuBai).
      Phần recall XUẤT được (recallMan, kiemRecall, GOI_RECALL) để máy kiểm gói 10 gộp gói 9 + 10 (mỗi gói ≥ 3 lần).
   Chạy: node hoc/kiem-combo-mua-1.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { coHinhRieng } from './huy-hieu-ds.mjs';   // V7c1: danh sách mã huy hiệu từ dữ liệu bộ vector (không regex huy-hieu.js pixel)

const require = createRequire(import.meta.url);
const clone = (x) => JSON.parse(JSON.stringify(x));
const dsSan = (m) => (Array.isArray(m.san[0]) ? m.san : [m.san]);
const soSan = (m) => (Array.isArray(m.san[0]) ? m.san.length : 1);
function loiGoi(dong) { const s = new Set(); for (const l of dong || []) for (const x of l.matchAll(/([A-Za-z_]\w*)\s*\(/g)) s.add(x[1]); return s; }

/* ================================================================== RECALL (xuất cho gói 10) */
/** Tên ngắn của gói 1–8 mùa 1 (theo KE-HOACH-MUA-1.md). */
export const GOI_RECALL = {
  1: 'xe + def', 2: 'tay + for', 3: 'khoảng cách + if/while', 4: 'kho hàng + nút đè', 5: 'bánh lùi', 6: 'tay xoay', 7: 'cảm biến bên', 8: 'đội'
};
/** Kho hàm của em đứng trước từng màn (theo thứ tự lộ trình, bỏ màn tietKiemNhip như mọi máy kiểm). */
export function khoTheoLoTrinh(M) {
  const khoTruoc = new Map(), daTaoTruoc = new Map(), kho = new Map(), daTao = new Set();
  for (const m of M.danhSach) {
    khoTruoc.set(m.ma, clone([...kho.values()]));
    daTaoTruoc.set(m.ma, new Set(daTao));
    if (!m.tietKiemNhip) for (const h of m.loiGiai.hamCuaEmMoi || []) kho.set(h.ten, clone(h));
    for (const t of (m.taoHam || []).concat((m.loiGiai.hamCuaEmMoi || []).map((h) => h.ten))) daTao.add(t);
  }
  return { khoTruoc, daTaoTruoc };
}
/** Các chương trình chính của một bài làm (một robot: [chinh]; đội: chinh của từng robot). */
const chinhCua = (b) => (b.doi ? b.doi.map((d) => d.chinh || []) : [b.chinh || []]);
/** Mọi lệnh bài làm chạy tới (bắc cầu qua kho và hàm của màn), trừ thân các hàm trong `boQua`. */
function bacCau(kho, bai, boQua = []) {
  const bang = new Map(kho.map((h) => [h.ten, h.than]));
  for (const h of (bai.hamCuaMan || []).concat(bai.hamCuaEmMoi || [])) bang.set(h.ten, h.than);
  const da = new Set(), cho = [...loiGoi(chinhCua(bai).flat())];
  while (cho.length) { const t = cho.pop(); if (da.has(t)) continue; da.add(t); if (bang.has(t) && !boQua.includes(t)) cho.push(...loiGoi(bang.get(t))); }
  return da;
}
/**
 * Gói 1–8 mà lời giải màn m dùng: { goi: Set<số>, lyDo: { số: chuỗi } }.
 * kho = hàm của em đứng trước màn; thang(mSua) = hàm chấm lời giải trên màn đã sửa (để thử bỏ nút đè M).
 */
export function recallMan(m, kho, thang) {
  const lg = m.loiGiai, goi = new Set(), lyDo = {};
  const dat = (n, s) => { goi.add(n); lyDo[n] = s; };
  const L = bacCau(kho, lg);
  const L5 = bacCau(kho, lg, ['u_turn', 'turn_left']);                      // u_turn / turn_left một nhịp có left_back trong thân: không tính là "dùng lùi"
  const khoa = m.khoaHamMan || [];
  const dong = chinhCua(lg).flat().concat((lg.hamCuaMan || []).concat(lg.hamCuaEmMoi || []).flatMap((h) => h.than));
  const viet = (lg.hamCuaMan || []).filter((h) => !khoa.includes(h.ten)).map((h) => h.ten);
  const co = (ds) => ds.filter((t) => L.has(t));
  if (viet.length) dat(1, 'def ' + viet.join('/') + '()');
  else if (co(['corner', 'stair', 'two']).length) dat(1, co(['corner', 'stair', 'two']).join('/'));
  if (dong.some((l) => /^\s*for /.test(l))) dat(2, 'for');
  else if (co(['pick', 'drop', 'carry', 'sweep']).length) dat(2, co(['pick', 'drop', 'carry', 'sweep']).join('/'));
  if (L.has('front_clear')) dat(3, co(['go_wall', 'safe_move', 'face_open']).join('/') || 'front_clear');
  if (dsSan(m).some((rows) => rows.join('').includes('M'))) {
    const bo = clone(m); bo.san = soSan(m) > 1 ? m.san.map((rows) => rows.map((s) => s.replace(/M/g, '.'))) : m.san.map((s) => s.replace(/M/g, '.'));
    if (!thang(bo)) dat(4, 'nút đè M');
  }
  if (!goi.has(4) && co(['put_right', 'pass_back', 'grab_back', 'swap', 'dodge_left', 'dodge_right']).length) dat(4, co(['put_right', 'pass_back', 'grab_back', 'swap', 'dodge_left', 'dodge_right']).join('/'));
  const lui = ['back', 'park', 'drag', 'left_back', 'right_back'].filter((t) => L5.has(t));
  if (lui.length) dat(5, lui.includes('back') ? 'back' : lui.join('/'));
  if (L.has('arm_left') || L.has('arm_right')) dat(6, co(['pick_left', 'pick_right', 'drop_left', 'drop_right', 'clear_left', 'relay', 'swap_sides', 'sort_two']).join('/') || 'arm_left/arm_right');
  if (L.has('left_clear') || L.has('right_clear')) dat(7, co(['left_clear', 'right_clear', 'to_gap', 'to_left_gap', 'follow_right']).join('/'));
  if (m.doi && m.doi.length > 1) dat(8, m.doi.length + ' robot');
  return { goi, lyDo };
}
/**
 * Ba luật recall trên danh sách màn ds (theo thứ tự chơi). moi(m) = màn mới (luật a); toiThieu = số lần tối thiểu mỗi gói 1–8 (luật b).
 * recall(m) = kết quả recallMan. Trả { dem: { gói: số lần }, loi: [chuỗi] }.
 */
export function kiemRecall(ds, recall, { moi = () => true, toiThieu = 2, yChinh = [6, 7], khac = [1, 2, 3, 4, 5, 8], toiThieuKhac = 2 } = {}) {
  const loi = [], dem = {};
  for (let g = 1; g <= 8; g++) dem[g] = 0;
  ds.forEach((m, i) => {
    const r = recall(m);
    for (const g of r.goi) dem[g]++;
    if (moi(m)) {
      for (const g of yChinh) if (!r.goi.has(g)) loi.push(m.ma + ': thiếu ý chính gói ' + g + ' (' + GOI_RECALL[g] + ')');
      const n = khac.filter((g) => r.goi.has(g)).length;
      if (n < toiThieuKhac) loi.push(m.ma + ': chỉ recall ' + n + ' gói trong {' + khac.join(', ') + '} (cần ≥ ' + toiThieuKhac + ')');
    }
    if (!m.kieuBai) loi.push(m.ma + ': thiếu kieuBai');
    if (i > 0 && m.kieuBai && m.kieuBai === ds[i - 1].kieuBai) loi.push(m.ma + ' cùng kiểu bài "' + m.kieuBai + '" với màn liền trước ' + ds[i - 1].ma);
  });
  for (let g = 1; g <= 8; g++) if (dem[g] < toiThieu) loi.push('gói ' + g + ' (' + GOI_RECALL[g] + ') chỉ được nhắc ' + dem[g] + ' lần (cần ≥ ' + toiThieu + ')');
  return { dem, loi };
}

/* ================================================================== máy kiểm gói 9 */
async function main() {
  const Cham = require('./cham.js');
  const SanHoc = require('./san-hoc.js');
  const M = require('./lo-trinh-hoc.js');
  const TT = require('./thu-tu-chuong.js');

  let dat = 0, hong = 0;
  const kiem = (ten, fn) => { try { fn(); dat++; } catch (e) { hong++; console.log('  HỎNG ' + ten + '\n       ' + (e && e.message ? e.message.split('\n')[0] : e)); } };

  const C1 = 'combo', C2 = 'che-combo';
  const MOI = (M.manComboMua1 || []).map((m) => m.ma);
  const THU_TU = {
    combo: MOI.filter((ma) => ma.startsWith('combo.')),
    'che-combo': MOI.filter((ma) => ma.startsWith('che-combo.'))
  };
  const CU = ['che-cam-bien.10'];
  /** Vị trí che-cam-bien.10 trong chương che-combo (0 = đầu). */
  const VI_TRI_CCB10 = 7;
  if (THU_TU['che-combo'].length === 9) THU_TU['che-combo'].splice(VI_TRI_CCB10, 0, 'che-cam-bien.10');
  /** Màn mà bộ dò khối chuẩn có đường nhanh hơn ngưỡng: lý do. */
  const NHANH_HON = {
    'che-combo.1': 'R2 đếm đúng số nhịp chờ thì nhặt ngay trong nhịp R1 thả (R1 chạy trước trong nhịp), nhanh hơn chờ bằng cảm biến một nhịp; chỉ đúng ở sân này (như che-hai-robot.4)',
    'che-combo.7': 'lùi xuống đầu dưới (không quay đầu) nhanh hơn một nhịp, nhưng chương trình chính bị khóa: quay đầu (trái thành phải) là ý của màn',
    'che-combo.6': 'R1 đếm đúng số nhịp chờ thì bước vào cửa ngay nhịp cửa vừa mở, nhanh hơn hỏi front_clear() một nhịp; chỉ đúng ở sân này'
  };
  /** Robot khóa (màn hai robot): dãy khối nó chạy. */
  const KHOI_KHOA = { 'che-combo.1': { r: 0, khoi: ['pick', 'turn_right', 'drop'] } };
  const BU = { dong: 3, nhip: 4, o: 6 };
  const theoSan = (v, i) => (Array.isArray(v) ? v[i] : v);
  const get = (ma) => M.timMa(ma);
  const DS = MOI.map(get);
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
  /** Số dòng người chơi viết / sửa: chương trình không khóa (chinhCoDinh / robot coDinh) + thân hàm của màn không khóa + hàm mới. */
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

  /* ------------------------------------------------------------------ 1. vị trí */
  const goi = TT.goi.find((g) => g.ma === 'combo');
  kiem('gói combo (mùa 1) giữa hai-robot và robot; hai chương combo / che-combo đúng thứ tự, đúng hàng, đúng tên', () => {
    assert.ok(goi && goi.mua === 'mua-1');
    const mua1 = TT.goi.filter((g) => g.mua === 'mua-1').map((g) => g.ma);
    assert.equal(mua1.indexOf('combo'), mua1.indexOf('hai-robot') + 1);
    assert.equal(mua1.indexOf('robot'), mua1.indexOf('combo') + 1);
    assert.deepEqual(goi.chuong, [C1, C2]);
    for (const c of goi.chuong) {
      const ds = M.danhSach.filter((m) => m.chuong === c);
      assert.deepEqual(ds.map((m) => m.ma), THU_TU[c], c);
      assert.deepEqual(ds.map((m) => m.so), ds.map((_, i) => i + 1), c);
      assert.deepEqual(ds.map((m) => m.hang), ds.map((_, i) => (i < 3 ? 'lam-quen' : i < 6 ? 'luyen' : i < 9 ? 'bien-the' : 'trum')), c);
    }
    assert.equal(TT.ten[C1], 'Nhìn bên, nhặt bên');
    assert.equal(TT.ten[C2], 'Combo mở rộng');
    assert.equal(TT.thuTu.indexOf(C1), TT.thuTu.indexOf('che-hai-robot') + 1);
    assert.equal(TT.thuTu.indexOf(C2), TT.thuTu.indexOf(C1) + 1);
  });
  kiem('mã mới không trùng màn đã cất; che-cam-bien.10 không còn cất; tên màn không trùng trong lộ trình', () => {
    for (const ma of MOI) assert.ok(get(ma), ma + ' không có trong lộ trình');
    for (const ma of MOI) assert.ok(!(M.manCat || []).includes(ma), ma + ' trùng màn đã cất');
    assert.ok(!(M.manCat || []).includes('che-cam-bien.10'), 'che-cam-bien.10 vẫn nằm trong danh sách cất');
    const tenMoi = DS.map((m) => m.ten), tenCu = M.danhSach.filter((m) => !MOI.includes(m.ma)).map((m) => m.ten);
    assert.equal(new Set(tenMoi).size, tenMoi.length, 'trùng tên trong gói');
    for (const t of tenMoi) assert.ok(!tenCu.includes(t), 'tên "' + t + '" trùng một màn khác của lộ trình');
  });
  kiem('huy hiệu: chỉ trùm mỗi chương mang huy hiệu (combo / che-combo, huy-hieu.js có hình); không màn nào khác của gói có huy hiệu', () => {
    for (const c of goi.chuong) {
      const ds = M.danhSach.filter((m) => m.chuong === c);
      const trum = ds[ds.length - 1];
      assert.equal(trum.hang, 'trum', c);
      assert.equal(trum.huyHieu && trum.huyHieu.ma, c, c + ' trùm thiếu huy hiệu ' + c);
      assert.deepEqual(M.danhSach.filter((m) => m.huyHieu && m.huyHieu.ma === c).map((m) => m.ma), [trum.ma]);
      for (const m of ds.slice(0, -1)) assert.ok(!m.huyHieu, m.ma + ' không phải trùm mà có huy hiệu');
      assert.ok(coHinhRieng(c), "huy-hieu-vector.js thiếu hình huy hiệu '" + c + "'");
    }
  });
  kiem('choi.html nạp man-combo-mua-1.js (một lần) trước lo-trinh-hoc.js', () => {
    const html = fs.readFileSync(new URL('./game/choi.html', import.meta.url), 'utf8');
    const a = html.indexOf('../man-combo-mua-1.js'), b = html.indexOf('../lo-trinh-hoc.js');
    assert.ok(a > 0 && a < b);
    assert.equal(html.split('../man-combo-mua-1.js').length, 2);
  });

  /* ------------------------------------------------------------------ 5. bộ dò khối chuẩn (một hay hai robot) */
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
      // nút điều khiển cửa: không khai noi thì mọi nút giữ mọi cửa; có noi thì cửa chỉ theo các nút của nhóm chứa nó (như san-hoc.js)
      cua: san.cua.map((d) => {
        const noi = Array.isArray(m.san[0]) ? (m.noi || [])[si] : m.noi;
        const nut = noi ? noi.filter((g) => (g.cua || []).some((c) => c.x === d.x && c.y === d.y)).map((g) => san.nutDe.findIndex((q) => q.x === g.nut.x && q.y === g.nut.y))
          : san.nutDe.map((_, k) => k);
        return { o: d.y * rong + d.x, mo0: d.mo, nut };
      }),
      laCo: (o) => o >= 0 && rows[(o - (o % rong)) / rong][o % rong] === 'F', dich: new Set(san.dich.map((d) => d.y * rong + d.x)),
      vat0: san.vat.map((v) => v.y * rong + v.x),
      dichVat: bm ? (bm.vat || []).map((v) => v.y * rong + v.x).sort((a, b) => a - b) : null
    };
  }
  const ke = (ctx, x, y, h) => { const v = VEC[((h % 4) + 4) % 4]; return ctx.o(x + v[0], y + v[1]); };
  function buoc(ctx, S, chon) {
    const r = S.r.map((R) => Object.assign({}, R)), pos = S.pos.slice(), cua = S.cua.slice();
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
        if (c >= 0 && !ctx.tuong(c) && !cuaDong(c) && pos.indexOf(c) < 0 && !K.some((Q, j) => vi(Q) === c) && !dinh.some((d, j) => j !== i && d === c)) { R.x = c % ctx.rong; R.y = (c - R.x) / ctx.rong; }
      } else if (a.quay) R.h = (R.h + a.quay) % 4;
      R.b++;
      if (R.b >= KHOI[R.k].length) { R.k = null; R.b = 0; }
    }
    const batNut = ctx.nut.map((o) => r.some((R) => vi(R) === o) || pos.includes(o));
    ctx.cua.forEach((d, j) => {
      const bat = d.nut.some((k) => k >= 0 && batNut[k]);
      const muon = bat ? !d.mo0 : d.mo0;
      if (muon === cua[j]) return;
      if (!muon && (r.some((R) => vi(R) === d.o) || pos.includes(d.o))) return;
      cua[j] = muon;
    });
    if (ctx.mucTieu === 'toi-co') r.forEach((R, i) => { const o = vi(R); if (!R.xong && ctx.laCo(o) && (!ctx.ds[i].co || ctx.ds[i].co.includes(o))) { R.xong = true; R.k = null; } });
    return { r, pos, cua };
  }
  function laDich(ctx, S) {
    if (ctx.mucTieu === 'toi-co') return S.r.every((R) => R.xong);
    if (ctx.mucTieu === 'dua-vat') return S.pos.every((p) => p >= 0 && ctx.dich.has(p));
    const R = S.r[0], bm = ctx.bm;                                       // bong-mo (một robot): xe đúng ô, đúng hướng, rảnh tay (hay cầm theo bongMo.cam), vật đúng ô
    if (R.k !== null || R.x !== bm.x || R.y !== bm.y || R.h !== (bm.huong || 0) || (R.cam >= 0) !== !!bm.cam) return false;
    const p = S.pos.filter((x) => x >= 0).sort((a, b) => a - b);
    return p.length === ctx.dichVat.length && p.every((c, k) => c === ctx.dichVat[k]);
  }
  function bfs(m, si, tuyChon = {}, toiDa = 400000) {
    const ctx = nguCanh(m, si);
    const S0 = { r: ctx.ds.map((d) => ({ x: d.x, y: d.y, h: d.h, cam: -1, k: null, b: 0, xong: false, q: 0 })), pos: ctx.vat0.slice(), cua: ctx.cua.map((d) => d.mo0) };
    const khoa = tuyChon.khoa;
    const ma = (S) => S.r.map((R) => [R.x, R.y, R.h, R.cam, R.k, R.b, R.xong ? 1 : 0, R.q].join(',')).join('|') + '|' + S.pos.join('.') + '|' + S.cua.map(Number).join('');
    const thay = new Set([ma(S0)]);
    let lop = [{ S: S0, vet: S0.r.map(() => []) }];
    for (let n = 1; n <= 200 && lop.length; n++) {
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
    if (soSan(m) > 1) {
      x.san = clone(m.san[si]); delete x.nhipTheo;
      for (const k of ['batDau', 'bongMo']) if (Array.isArray(m[k])) x[k] = clone(m[k][si]);
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
    if (!m) continue;
    const kho = khoTruoc.get(m.ma), daTao = daTaoTruoc.get(m.ma);
    bang[m.ma] = {};
    kiem(m.ma + ': đủ trường, số sân, robot (tay xoay + cảm biến; đội: R1 kẹp vàng, R2 xoay lam), chặn biến, không bậc thang', () => {
      for (const k of ['ten', 'deBai', 'san', 'batDau', 'mucTieu', 'hamGoc', 'sao', 'maMau', 'loiGiai', 'loiGiaiKhac', 'goiY', 'hamCuaEmCan', 'kieuBai']) assert.ok(m[k] !== undefined && m[k] !== '', m.ma + ' thiếu ' + k);
      assert.ok(m.loiSai.length >= 2, m.ma + ' cần ít nhất 2 lời sai');
      for (const ls of m.loiSai) assert.ok(ls.moTa && ls.phaiCoMa && ls.phaiCoMa.length, m.ma + ' lời sai thiếu moTa / phaiCoMa');
      assert.ok(m.goiY.length >= 1);
      assert.equal(soSan(m), m.hang === 'trum' ? 3 : 1, m.ma + ' số sân');
      for (const rows of dsSan(m)) assert.ok(!/S/.test(rows.join('')), m.ma + ' sân có bậc thang');
      if (m.doi) {
        assert.equal(m.doi.length, 2);
        const [a, b] = m.doi;
        assert.deepEqual([a.robot.than, a.robot.tay, a.robot.son], ['hai-banh', 'kep', 'vang'], m.ma + ' R1');
        assert.deepEqual([b.robot.than, b.robot.tay, b.robot.son], ['hai-banh', 'xoay', 'lam'], m.ma + ' R2');
        assert.deepEqual(a.hamGoc.slice().sort(), KHAY_KEP.slice().sort(), m.ma + ' khay R1');
        assert.deepEqual(b.hamGoc.slice().sort(), KHAY_XOAY.slice().sort(), m.ma + ' khay R2');
        for (const d of m.doi) assert.deepEqual(d.robot.camBien.map((c) => c.ma), ['khoang-cach']);
      } else {
        assert.deepEqual([m.robot.than, m.robot.tay], ['hai-banh', 'xoay'], m.ma + ' robot');
        assert.deepEqual(m.robot.camBien.map((c) => c.ma), ['khoang-cach']);
        assert.deepEqual(m.hamGoc.slice().sort(), KHAY_XOAY.slice().sort(), m.ma + ' khay');
      }
      assert.ok(m.khung.chanBien, m.ma + ' phải chặn biến (khung.chanBien)');
      assert.ok(!m.bienDem, m.ma + ' mở nhóm ĐẾM');
      if (m.hang === 'trum') assert.ok(m.huyHieu, m.ma + ' trùm thiếu huy hiệu');
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
      const rm = cham(m, m.maMau);
      assert.equal(rm.thang, false, m.ma + ' mã mẫu đã thắng sẵn');
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
          delete mr.chinhCoDinh;
          const r = cham(mr, duong[i]);
          assert.ok(!r.thang && r.theoSan[i].thang, m.ma + ': đường đếm cứng của sân ' + i + ' thắng cả ba sân (hay thua chính sân đó)');
        }
      }
    });
    // Hàm của màn được gọi ở nhiều chỗ (nhiều dòng gọi, hay một dòng trong vòng for): thân đếm cứng không được 3 sao.
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
  const chuongDS = (c) => M.danhSach.filter((m) => m.chuong === c);
  kiem('đường cong hai chương: dòng / nhịp / cỡ sân màn n ≤ max(1,5 × màn n−1, màn n−1 + bù), trừ trùm', () => {
    for (const c of goi.chuong) {
      const ds = chuongDS(c);
      for (let i = 1; i < ds.length; i++) {
        const m = ds[i], t = ds[i - 1];
        if (m.hang === 'trum') continue;
        const tran = (a, b, bu) => a <= Math.max(1.5 * b, b + bu);
        assert.ok(tran(soDong(m), soDong(t), BU.dong), m.ma + ' dòng ' + soDong(m) + ' so với ' + t.ma + ' ' + soDong(t));
        assert.ok(tran(m.sao.nhip, t.sao.nhip, BU.nhip), m.ma + ' nhịp ' + m.sao.nhip + ' so với ' + t.ma + ' ' + t.sao.nhip);
        assert.ok(tran(coSan(m), coSan(t), BU.o), m.ma + ' cỡ sân ' + coSan(m) + ' so với ' + t.ma + ' ' + coSan(t));
      }
    }
  });
  kiem('màn 1 của gói dễ hơn trùm gói 8 (che-hai-robot.10) rất nhiều: nhịp ≤ 1/4, dòng và cỡ sân không lớn hơn', () => {
    const a = chuongDS(C1)[0], t = get('che-hai-robot.10');
    assert.ok(a.sao.nhip * 4 <= t.sao.nhip, a.ma + ' nhịp ' + a.sao.nhip + ' / trùm ' + t.sao.nhip);
    assert.ok(soDong(a) <= soDong(t) && coSan(a) <= coSan(t));
  });

  /* ------------------------------------------------------------------ 6. bảng recall */
  const dsGoi = goi.chuong.flatMap(chuongDS);
  const RC = new Map();
  const recallCua = (m) => {
    if (!RC.has(m.ma)) RC.set(m.ma, recallMan(m, khoTruoc.get(m.ma), (mSua) => { try { return cham(mSua, m.loiGiai, m.loiGiai.hamCuaEmMoi).thang; } catch (e) { return false; } }));
    return RC.get(m.ma);
  };
  const KQ = kiemRecall(dsGoi, recallCua, { moi: (m) => MOI.includes(m.ma), toiThieu: 2 });
  kiem('recall (a) mỗi màn mới có combo + ≥ 2 gói khác; (b) mỗi gói 1–8 ≥ 2 lần; (c) không hai màn liền nhau cùng kiểu bài', () => {
    assert.deepEqual(KQ.loi, []);
  });

  console.log('chương | số | mã | tên | kiểu bài | gói recall | dòng | nhịp | ô | cỡ sân | khối chuẩn');
  for (const m of dsGoi) {
    const b = bang[m.ma] || {}, r = recallCua(m);
    console.log([m.chuong, m.so, m.ma + (MOI.includes(m.ma) ? '' : ' (cũ)'), m.ten, m.kieuBai, [...r.goi].sort().map((g) => g + ':' + r.lyDo[g]).join(', '), soDong(m), m.sao.nhip + (b.nhip !== undefined && b.nhip !== m.sao.nhip ? ' (đo ' + b.nhip + ')' : ''), m.sao.o + (b.o !== undefined && b.o !== m.sao.o ? ' (đo ' + b.o + ')' : ''), coSan(m), (b.khoi ?? '') + (NHANH_HON[m.ma] ? ' (NHANH_HON)' : '')].join(' | '));
  }
  console.log('BẢNG RECALL (số lần mỗi gói được nhắc trong ' + dsGoi.length + ' màn): ' + Object.entries(KQ.dem).map(([g, n]) => g + ' ' + GOI_RECALL[g] + ' = ' + n).join(' · '));
  for (const l of KQ.loi) console.log('  recall: ' + l);
  for (const ma of Object.keys(bang)) if (bang[ma].demCung) console.log('đếm cứng ' + ma + ': ' + bang[ma].demCung);
  if (process.argv.includes('--duong')) for (const ma of Object.keys(bang)) console.log('đường dò ' + ma + ': ' + bang[ma].duong);
  console.log('ĐẠT ' + dat + ' · HỎNG ' + hong + ' kiểm tra gói Combo.');
  if (hong) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
