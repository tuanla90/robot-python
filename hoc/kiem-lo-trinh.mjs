// Kiểm tra lộ trình XUẤT BẢN, bổ sung cho các kiểm tra ngân hàng bài gốc.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { coHinhRieng } from './huy-hieu-ds.mjs';   // mùa 2 xong (29/10): huy hiệu trùm chương mùa 2 phải có hình vector riêng

const require = createRequire(import.meta.url);
const M = require('./lo-trinh-hoc.js');
const TT = require('./thu-tu-chuong.js');
const Cham = require('./cham.js');
const LR = require('./lap-rap.js');
const clone = x => JSON.parse(JSON.stringify(x));
const soSan = m => Array.isArray(m.san[0]) ? m.san.length : 1;
const get = ma => M.timMa(ma);
const kho = new Map(), khoTruoc = new Map();
let dat = 0;
function kiem(ten, fn) { fn(); dat++; }
function cham(m, lg, truoc = khoTruoc.get(m.ma) || []) {
  const hs = new Map(truoc.map(h => [h.ten, clone(h)]));
  for (const h of lg.hamCuaEmMoi || []) hs.set(h.ten, clone(h));
  for (const h of m.hamCuaEmCan || []) assert.ok(hs.has(h), m.ma + ' cần hàm chưa được học: ' + h);
  return Cham.cham(m, { chinh: lg.chinh, hamCuaMan: lg.hamCuaMan || [], doi: lg.doi }, [...hs.values()]);
}

// Mùa 1 (26/10, KE-HOACH-MUA-1.md) và mùa 2 (27/10, KE-HOACH-MUA-2.md, đang dựng: chương còn chờ màn mới) được có chương chưa đủ 10 màn; mọi chương khác đủ 10.
const chuongMua1 = new Set(TT.goi.filter(g => g.mua === 'mua-1').flatMap(g => g.chuong));
const chuongMua2 = new Set(TT.goi.filter(g => g.mua === 'mua-2').flatMap(g => g.chuong));
// che-xich (mùa 3, ẩn): năm màn bậc thang rời mùa 2 nhưng giữ vì che-xich.4 tạo climb() cho gói đội mùa ẩn.
// Mùa 3 (29/10, KE-HOACH-MUA-3.md, đang dựng) cũng được có chương chưa đủ 10; chương rời mùa 3 (M.roiMua3: doi-xich-bac 8, nam-cham-omni 1) cũng vậy.
const chuongMua3 = new Set(TT.goi.filter(g => g.mua === 'mua-3').flatMap(g => g.chuong));
// Mùa 4 (29/10, KE-HOACH-MUA-4.md, đang dựng): chương chưa đủ 10 như mùa 3.
const chuongMua4 = new Set(TT.goi.filter(g => g.mua === 'mua-4').flatMap(g => g.chuong));
const chuongTam = new Set([...chuongMua1, ...chuongMua2, ...chuongMua3, ...chuongMua4, ...Object.keys(M.roiMua3 || {}), 'che-xich']);

kiem('mã duy nhất, chương đánh số liền 1..n (mùa 1 tối đa 10, mùa sau đúng 10), ít nhất 380 màn gốc + các gói thêm', () => {
  assert.ok(M.danhSach.length >= 410);
  assert.equal(new Set(M.danhSach.map(m => m.ma)).size, M.danhSach.length);
  for (const c of M.chuong()) {
    const so = M.danhSach.filter(m => m.chuong === c.ma).map(m => m.so);
    assert.ok(so.length <= 10 && (chuongTam.has(c.ma) || so.length === 10), c.ma + ' có ' + so.length + ' màn');
    assert.deepEqual(so, so.map((_, i) => i + 1), c.ma);
  }
});
// cam-bien-ben.10 (ba sân) là trùm cũ của Cảm biến hai bên, nay đứng thứ 9 chương Tổng hợp trước trùm mùa.
// HD1 (29/10): màn ÉP khối mới có hai sân dài ngắn khác nhau để đếm cứng không đủ sao (khoang-cach.12 ép if, khoang-cach.13 ép while).
// Màn CHẾ HÀM có while / if lấy lại bản nhiều sân của ngân hàng (che-cam-bien.1, .2, .4) hay thêm sân (me-cung.6, cam-bien-ben.7): thân hàm đếm cứng không qua.
const NHIEU_SAN_KHONG_TRUM = ['cam-bien-ben.10', 'khoang-cach.12', 'khoang-cach.13', 'che-cam-bien.1', 'che-cam-bien.2', 'che-cam-bien.4', 'cam-bien-ben.7', 'me-cung.6',
  'che-cam-bien.10'];      // HD2: hai kho dài ngắn khác nhau (fetch_back đếm cứng không thắng cả hai)
NHIEU_SAN_KHONG_TRUM.push('che-cam-bien.5', 'che-cam-bien.9', 'robot-hoan-thien.9');      // gói T mùa 2: ba màn ép biến đếm (chương bien-xich) lấy lại ba sân của ngân hàng
kiem('nhiều sân chỉ ở màn trùm, trùm là màn cuối chương, chương đủ 10 có trùm', () => {
  for (const m of M.danhSach) {
    const ds = M.danhSach.filter(x => x.chuong === m.chuong);
    if (m.hang !== 'trum' && !NHIEU_SAN_KHONG_TRUM.includes(m.ma)) assert.equal(soSan(m), 1, m.ma);
    if (m.hang === 'trum') assert.equal(m.so, ds.length, m.ma + ' trùm không đứng cuối chương');
    if (ds.length === 10) assert.equal(m.hang === 'trum', m.so === 10, m.ma);
  }
  for (const c of ['khoang-cach', 'hai-robot', 'che-list', 'mau', 'che-mau', 'rap-nao', 'nam-cham', 'che-nam-cham', 'may-nem', 'che-may-nem', 'drone', 'che-drone', 'flycam', 'rap-du', 'me-cung', 'cam-bien-ben']) {
    assert.equal(soSan(get(c + '.10')), 3, c);
  }
  // Gói 10: robot-hoan-thien.10 đã cất, trùm Tổng hợp là robot-hoan-thien.11; trùm cuối mùa trum-mua-1.10.
  for (const ma of ['robot-hoan-thien.11', 'trum-mua-1.10']) assert.equal(soSan(get(ma)), 3, ma);
});
kiem('đổi vị trí vẫn giữ mã bài cũ, gói Mê cung sau cảm biến', () => {
  assert.equal(get('khoang-cach.8').so, 7);                        // HD1: sau hai màn trình diễn + hai màn ép + kc.3 + kc.11
  assert.equal(get('khoang-cach.7'), null, 'khoang-cach.7 đã cất khỏi lộ trình');
  assert.equal(get('khoang-cach.4'), null, 'khoang-cach.4 đã cất (HD1)');
  assert.equal(get('khoang-cach.9'), null, 'khoang-cach.9 đã cất (HD1)');
  for (const ma of ['khoang-cach.1', 'khoang-cach.2', 'vong-lap.1', 'nut-de.1', 'tay-xoay.1', 'cam-bien-ben.1', 'banh-lui.5', 'hai-robot.1']) assert.ok(get(ma).chiChay && get(ma).chinhCoDinh, ma + ' là màn trình diễn (chiChay)');
  assert.ok(get('cam-bien-ben.1').deBai.includes('left_clear'));
  assert.ok(!get('cam-bien-ben.1').deBai.includes('mê cung'));
  assert.equal(get('cam-bien-ben.10').hang, 'bien-the');
  assert.equal(get('che-cam-bien.7').so, 3);
  assert.equal(get('che-cam-bien.6').chuong, 'bien-xich');           // 27/10: chương tạm bien gộp vào gói 1 mùa 2, chương 2 "Biến cho xích"
  assert.equal(get('che-cam-bien.6').so, 5);
  assert.equal(TT.thuTu.indexOf('me-cung'), TT.thuTu.indexOf('cam-bien-ben') + 1);
  assert.deepEqual(TT.goi.find(g => g.ma === 'me-cung').chuong, ['cam-bien-ben', 'me-cung']);
  assert.equal(get('me-cung.6').taoHam[0], 'follow_right');
  assert.ok(!TT.goi.some(g => g.ma === 'cam-bien-ben'));
  assert.ok(!get('che-cam-bien.6').taoHam.includes('follow_right'));
});

for (const m of M.danhSach) {
  khoTruoc.set(m.ma, clone([...kho.values()]));
  kiem(m.ma + ': lời giải thắng, 3 sao, toàn bộ sân', () => {
    for (const h of m.hamCuaEmCan) assert.ok(kho.has(h), m.ma + ' cần hàm chưa được học: ' + h);
    const r = cham(m, m.loiGiai);
    assert.ok(r.thang, m.ma + ': ' + JSON.stringify(r.chanDoan));
    assert.equal(r.sao, 3, m.ma + ' sao=' + r.sao);
    assert.equal(r.theoSan.length, soSan(m), m.ma);
    assert.ok(r.theoSan.every(s => s.thang), m.ma);
    if (m.phienBanNoiDung === 2) {
      assert.equal(r.soNhip, m.sao.nhip, m.ma + ' ngưỡng nhịp chưa đo lại');
      assert.equal(r.soO, m.sao.o, m.ma + ' ngưỡng ô chưa đo lại');
    }
  });
  if (m.lapRap) kiem(m.ma + ': mọi cách lắp mẫu vẫn thắng', () => {
    assert.deepEqual(LR.kiemDuLieu(m), []);
    for (const c of m.lapRap.cachLap) {
      const a = LR.apDung(m, c);
      assert.ok(cham(a, a.loiGiai, khoTruoc.get(m.ma)).thang, m.ma + ': ' + JSON.stringify(c));
    }
  });
  if (!m.tietKiemNhip) for (const h of m.loiGiai.hamCuaEmMoi || []) kho.set(h.ten, clone(h));
}

// ---------------------------------------------------------------- MÙA 1 = 10 GÓI (26/10, KE-HOACH-MUA-1.md): thứ tự gói, ràng buộc lệnh theo gói
const day = (c, so) => so.map(n => c + '.' + n);
const MUOI = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
// [mã gói, [[chương, các màn (không kể thứ tự)]]]. Gói 9 Combo: man-combo-mua-1.js + che-cam-bien.10 (về từ chỗ cất).
// Gói 10 R1 xuất xưởng: robot-hoan-thien.11 thay robot-hoan-thien.10 (cất) + chương Trùm mùa (man-trum-mua-1.js). Mùa 1 đủ 10 gói × 20 màn.
const BANG_MUA_1 = [
  ['xe', [['hai-banh', day('hai-banh', MUOI)], ['xuong-ham', day('xuong-ham', MUOI)]]],
  ['tay-gap', [['tay-gap', day('tay-gap', MUOI)], ['vong-lap', day('vong-lap', [1, 2, 3, 4, 5, 6, 8, 9, 10]).concat('che-lap.5')]]],
  ['cam-bien', [['khoang-cach', day('khoang-cach', [1, 2, 3, 5, 6, 8, 10, 11, 12, 13])], ['che-cam-bien', day('che-cam-bien', [1, 2, 3, 7, 11, 12, 13, 14, 15, 16])]]],
  ['kho-hang', [['nut-de', day('nut-de', MUOI)], ['kho-hang', day('che-tay', [1, 2, 3, 4, 6, 8, 10]).concat(day('che-xe', [1, 2, 3]))]]],
  ['banh-lui', [['banh-lui', day('che-xe', [4, 5, 6, 7, 9]).concat(day('banh-lui', [1, 2, 3, 4, 5]))], ['che-banh-lui', ['che-xe.10'].concat(day('che-tay', [5, 7, 9]), day('che-lap', [7, 9]), day('che-banh-lui', [1, 2, 3, 4]))]]],
  ['tay-xoay', [['tay-xoay', day('tay-xoay', MUOI)], ['che-tay-xoay', day('che-tay-xoay', MUOI)]]],
  ['me-cung', [['cam-bien-ben', ['che-cam-bien.4'].concat(day('cam-bien-ben', [1, 2, 3, 4, 5, 6, 7, 8, 9]))], ['me-cung', day('me-cung', MUOI)]]],
  ['hai-robot', [['hai-robot', day('hai-robot', MUOI)], ['che-hai-robot', day('che-hai-robot', MUOI)]]],
  ['combo', [['combo', day('combo', MUOI)], ['che-combo', day('che-combo', [1, 2, 3, 4, 5, 6, 7, 8, 9]).concat('che-cam-bien.10')]]],
  ['robot', [['robot-hoan-thien', day('robot-hoan-thien', [1, 2, 3, 4, 5, 6, 7, 8, 11]).concat('cam-bien-ben.10')], ['trum-mua-1', day('trum-mua-1', MUOI)]]]
];
// HD3 (29/10): banh-lui.5 (màn trình diễn lệnh lùi) vào chương banh-lui, che-xe.8 cất.
const CAT_MUA_1 = ['vong-lap.7', 'che-lap.1', 'che-lap.2', 'che-lap.3', 'che-lap.4', 'che-lap.6', 'che-lap.8', 'che-lap.10', 'khoang-cach.7', 'che-cam-bien.8', 'robot-hoan-thien.10', 'khoang-cach.4', 'khoang-cach.9', 'che-xe.8'];
const BIEN_MUA_2 = ['che-cam-bien.6', 'che-cam-bien.5', 'che-cam-bien.9', 'robot-hoan-thien.9'];
// Mùa 2 (27/10): che-xich 3, 4, 5, 7, 10 (bậc thang + hàm có tham số) rời mùa 2, sang chương che-xich ở mùa 3 (ẩn); không màn nào cất thêm.
const XICH_CU = ['che-xich.3', 'che-xich.4', 'che-xich.5', 'che-xich.7', 'che-xich.10'];
const goiMua = mu => TT.goi.filter(g => g.mua === mu);
const goiCuaChuong = c => TT.goi.find(g => g.chuong.includes(c));
const manMua1 = M.danhSach.filter(m => chuongMua1.has(m.chuong));
const viTriGoi = m => goiMua('mua-1').indexOf(goiCuaChuong(m.chuong));
/** Tên mọi lời gọi f(...) trong các dòng code. */
function loiGoi(dong) { const s = new Set(); for (const l of dong || []) for (const x of l.matchAll(/([A-Za-z_]\w*)\s*\(/g)) s.add(x[1]); return s; }
/** Code màn đưa ra hay người chơi viết ở lời giải: [dòng], kèm các hàm (tên → thân) màn cho dùng. */
function codeMan(m) {
  const dong = [], bang = new Map((khoTruoc.get(m.ma) || []).map(h => [h.ten, h.than]));
  for (const b of [m.maMau, m.loiGiai]) {
    dong.push(...(b.chinh || []));
    for (const h of (b.hamCuaEmMoi || []).concat(b.hamCuaMan || [])) { dong.push(...h.than); bang.set(h.ten, h.than); }
  }
  return { dong, bang };
}
/** Mọi lệnh màn m chạy tới khi chạy lời giải / mã mẫu, kể cả qua hàm của em và hàm của màn (bắc cầu). */
function lenhBacCau(m) {
  const { dong, bang } = codeMan(m), da = new Set(), cho = [...loiGoi(dong)];
  while (cho.length) { const t = cho.pop(); if (da.has(t)) continue; da.add(t); if (bang.has(t)) cho.push(...loiGoi(bang.get(t))); }
  return da;
}
const LUI = ['left_back', 'right_back'], BEN = ['left_clear', 'right_clear'];
kiem('(a) mùa 1 đúng các gói của bảng, đúng thứ tự, đúng màn; màn cất / dời mùa 2 đúng danh sách; ngưỡng sao không khóa vĩnh viễn', () => {
  assert.deepEqual(goiMua('mua-1').map(g => g.ma), BANG_MUA_1.map(x => x[0]));
  assert.deepEqual(TT.thuTu.slice(0, chuongMua1.size), BANG_MUA_1.flatMap(x => x[1].map(c => c[0])), 'chương mùa 1 phải đứng đầu thuTu, theo thứ tự gói');
  for (const [ma, ds] of BANG_MUA_1) {
    assert.deepEqual(goiCuaChuong(ds[0][0]).chuong, ds.map(c => c[0]), ma);
    for (const [c, dsMa] of ds) assert.deepEqual(M.danhSach.filter(m => m.chuong === c).map(m => m.ma).sort(), dsMa.slice().sort(), c);
  }
  assert.deepEqual(M.manCat, CAT_MUA_1);
  assert.deepEqual(M.danhSach.filter(m => m.chuong === 'che-xich').map(m => m.ma), XICH_CU);
  assert.equal(goiCuaChuong('che-xich').mua, 'mua-5');     // 29/10 P0 mùa 3: che-xich (bậc thang) rời mùa 3 sang đầu mùa 4 (ẩn); P0 mùa 4: dời tiếp sang mùa 5 (ẩn)
  for (const ma of CAT_MUA_1) assert.equal(get(ma), null, ma + ' phải cất khỏi lộ trình');
  // Bốn màn dùng biến dời mùa 2: nay ở gói 1 chương 2 (bien-xich).
  for (const ma of BIEN_MUA_2) assert.equal(get(ma).chuong, 'bien-xich', ma);
});
kiem('(b) không màn nào trước gói Bánh lùi gọi lệnh lùi (thẳng hay qua hàm, bắc cầu) hay có lệnh lùi trên khay', () => {
  const moc = BANG_MUA_1.findIndex(x => x[0] === 'banh-lui');
  for (const m of manMua1.filter(m => viTriGoi(m) < moc)) {
    assert.ok(!LUI.some(h => (m.hamGoc || []).includes(h)), m.ma + ' khay có lệnh lùi');
    const l = lenhBacCau(m);
    assert.ok(!LUI.some(h => l.has(h)), m.ma + ' gọi lệnh lùi: ' + [...l].filter(h => LUI.includes(h)));
  }
});
kiem('(c) không màn nào trước gói Cảm biến bên gọi left_clear / right_clear hay có chúng trên khay', () => {
  const moc = BANG_MUA_1.findIndex(x => x[0] === 'me-cung');
  for (const m of manMua1.filter(m => viTriGoi(m) < moc)) {
    assert.ok(!BEN.some(h => (m.hamGoc || []).includes(h)), m.ma + ' khay có cảm biến bên');
    const l = lenhBacCau(m);
    assert.ok(!BEN.some(h => l.has(h)), m.ma + ' gọi cảm biến bên: ' + [...l].filter(h => BEN.includes(h)));
  }
});
// Không còn ngoại lệ: robot-hoan-thien.10 (bounce / fetch_back có biến đếm, hàm của màn khóa) đã cất, robot-hoan-thien.11 không biến thay chỗ.
const BIEN_KHOA = {};
const laBien = l => /^\s*[A-Za-z_]\w*(\s*\[[^\]]*\])?\s*[-+*/]?=(?!=)/.test(l) || /range\(\s*[A-Za-z_]/.test(l);
kiem('(d) không màn mùa 1 nào dùng biến (mã mẫu, lời giải, hàm của em mới, hàm của màn không khóa), không mở nhóm ĐẾM trên khay', () => {
  for (const m of manMua1) {
    assert.ok(!m.bienDem, m.ma + ' mở nhóm ĐẾM');
    const khoa = m.khoaHamMan || [];
    assert.deepEqual(khoa.filter(t => (BIEN_KHOA[m.ma] || []).includes(t)), BIEN_KHOA[m.ma] || []);
    // Code người chơi thấy hay viết: mã mẫu và lời giải. loiGiaiKhac / loiSai chỉ là dữ liệu máy kiểm (khoang-cach.6, .9 có co_duong = ... ở loiGiaiKhac), không xét.
    for (const b of [m.maMau, m.loiGiai]) {
      const dong = [...(b.chinh || [])];
      for (const h of (b.hamCuaEmMoi || []).concat(b.hamCuaMan || [])) if (!(BIEN_KHOA[m.ma] || []).includes(h.ten)) dong.push(...h.than);
      const sai = dong.filter(laBien);
      assert.deepEqual(sai, [], m.ma + ' dùng biến');
    }
  }
});
kiem('(e) mọi hamCuaEmCan được tạo ở màn đứng trước trong lộ trình; mùa 1: hàm của em lời giải gọi thẳng đều có trong hamCuaEmCan', () => {
  const daTao = new Set();
  for (const m of M.danhSach) {
    for (const h of m.hamCuaEmCan) assert.ok(daTao.has(h), m.ma + ' cần ' + h + ' nhưng chưa màn nào trước nó tạo');
    if (chuongMua1.has(m.chuong)) {
      const lg = m.loiGiai, rieng = new Set((lg.hamCuaMan || []).concat(lg.hamCuaEmMoi || []).map(h => h.ten));
      const dong = [...(lg.chinh || []), ...(lg.doi || []).flatMap(x => x.chinh || []), ...(lg.hamCuaMan || []).concat(lg.hamCuaEmMoi || []).flatMap(h => h.than)];
      for (const t of loiGoi(dong)) if (daTao.has(t) && !rieng.has(t) && !(m.hamGoc || []).includes(t)) assert.ok(m.hamCuaEmCan.includes(t), m.ma + ' gọi ' + t + '() mà không khai trong hamCuaEmCan');
    }
    for (const t of (m.taoHam || []).concat((m.loiGiai.hamCuaEmMoi || []).map(h => h.ten))) daTao.add(t);
  }
});
kiem('(f) gói đội tay xoay (cần nam châm) không ở mùa 1, đứng sau gói Đội nam châm (không cần liền kề)', () => {
  const g = TT.goi.find(x => x.ma === 'doi-tay-xoay');
  assert.ok(g && g.mua !== 'mua-1', 'doi-tay-xoay ở ' + (g && g.mua));
  assert.ok(TT.goi.indexOf(g) > TT.goi.findIndex(x => x.ma === 'doi-nam-cham'), 'doi-tay-xoay phải đứng sau gói Đội nam châm');      // P0 mùa 4: Đội nam châm vào gói 8 mùa 4, đội tay xoay ở mùa 5 (ẩn) nên không còn liền kề
  assert.ok(TT.thuTu.indexOf('doi-tay-xoay') > TT.thuTu.indexOf('che-nam-cham'));
  for (const c of g.chuong) assert.ok(!chuongMua1.has(c), c);
});

// ---------------------------------------------------------------- MÙA 2 = 10 GÓI (27/10, KE-HOACH-MUA-2.md): thứ tự gói, ràng buộc Python / part theo gói
// Chạy với --loi-gia-mua-2: cắm tám lỗi giả vào dữ liệu đã nạp, mục mùa 2 phải ĐỎ cả (a)–(h) rồi dừng (không chạy phần sau).
const LOI_GIA_2 = process.argv.includes('--loi-gia-mua-2');
// Bảng mục 2 KE-HOACH-MUA-2.md: [mã gói, [[chương, màn CÓ SẴN theo thứ tự]]]. Màn mới của các tệp ngân hàng mùa 2 (TEP_MUA_2) nối sau màn có sẵn.
const BANG_MUA_2 = [
  ['xich', [['xich', day('xich', MUOI)], ['bien-xich', ['che-xich.1', 'che-xich.2', 'che-xich.8', 'che-xich.6'].concat(BIEN_MUA_2, ['che-xich.9'])]]],
  ['sung-hoi', [['sung-hoi', day('sung-hoi', [1, 2, 3, 4, 5, 6, 9, 7, 8, 10])], ['tham-so', day('tham-so', MUOI)]]],     // 29/10: sung-hoi.9 lên sau .6 (đường cong)
  ['hong-ngoai', [['hong-ngoai', []], ['che-hong-ngoai', []]]],
  ['nha-may', [['bang-chuyen', day('bang-chuyen', [1, 2, 6, 5, 7, 8, 3, 4, 9, 10])], ['che-sung-hoi', day('che-sung-hoi', [1, 2, 3, 4, 5, 6, 8, 7, 9, 10])]]],     // 29/10: đường cong
  ['day-thung', [['day-thung', []], ['che-day-thung', []]]],
  ['luc-ban', [['luc-ban', day('luc-ban', MUOI)], ['che-luc-ban', []]]],
  ['do-nhiet', [['do-nhiet', []], ['che-do-nhiet', []]]],
  ['doi-mua-2', [['doi-mua-2', []], ['che-doi-mua-2', []]]],
  ['be-sung', [['be-sung', []], ['che-be-sung', []]]],
  ['nha-may-chay', [['tong-hop-2', []], ['trum-mua-2', []]]]
];
const TEP_MUA_2 = ['manBienXich', 'manHongNgoai', 'manDayThung', 'manCheLucBan', 'manDoNhiet', 'manDoiMua2', 'manBeSung', 'manTrumMua2'];
const moiMua2 = TEP_MUA_2.flatMap(k => M[k] || []);
/** Màn của chương c theo bảng: có sẵn + màn mới (theo so). */
const manBang2 = (c, coSan) => coSan.concat(moiMua2.filter(m => m.chuong === c).sort((a, b) => a.so - b.so).map(m => m.ma));
const goi2Bang = BANG_MUA_2.map(([ma, ds]) => [ma, ds.map(([c, coSan]) => [c, manBang2(c, coSan)]).filter(x => x[1].length)]).filter(x => x[1].length);
const manMua2 = M.danhSach.filter(m => chuongMua2.has(m.chuong));
const viTriMan = m => M.danhSach.indexOf(m);
const LENH_MUA_1 = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'arm_down', 'arm_up', 'arm_left', 'arm_right', 'grab', 'release', 'front_clear', 'left_clear', 'right_clear'];
const LENH_MUA_2 = LENH_MUA_1.concat(['shoot', 'shoot_back', 'distance', 'warm']);     // + súng hơi; distance / warm khi lõi có hồng ngoại (gói 3, 7)
const PART_2 = { than: ['hai-banh', 'xich'], tay: ['kep', 'xoay', 'hoi'], camBien: ['khoang-cach', 'hong-ngoai'], loaiRobot: ['banh', 'xich'] };
if (LOI_GIA_2) {
  // (a) đổi chỗ hai màn mùa 2; (b) biến ở chương xich; (c) gọi hàm có tham số ở sung-hoi; (d) bậc thang ở bang-chuyen; (e) màn cần hàm chưa ai tạo; (f) nam châm ở luc-ban.
  const a = get('sung-hoi.1'), b = get('sung-hoi.2'); [a.so, b.so] = [b.so, a.so]; M.tinhLai();
  get('xich.2').loiGiai.chinh = ['n = 3'].concat(get('xich.2').loiGiai.chinh);
  get('sung-hoi.5').loiGiai.chinh = get('sung-hoi.5').loiGiai.chinh.concat(['shoot("fast")']);
  get('bang-chuyen.4').san = get('bang-chuyen.4').san.map((d, i) => i === 0 ? 'S' + d.slice(1) : d);
  get('che-sung-hoi.3').hamCuaEmCan = get('che-sung-hoi.3').hamCuaEmCan.concat(['fly_home']);
  get('luc-ban.2').robot = Object.assign({}, get('luc-ban.2').robot, { tay: 'nam-cham' });
}
let hong2 = 0;
const kiem2 = (ten, fn) => { try { fn(); dat++; } catch (e) { hong2++; console.log('  HỎNG ' + ten + '\n       ' + (e && e.message ? e.message.split('\n')[0] : e)); } };
/** Mọi dòng code màn m chạy (mã mẫu, lời giải, hàm của em mới, hàm của màn) kèm thân các hàm của em được gọi tới (bắc cầu qua kho). */
function dongBacCau(m) {
  const { dong, bang } = codeMan(m);
  for (const b of [m.maMau, m.loiGiai]) for (const d of b.doi || []) dong.push(...(d.chinh || []));
  const kq = [...dong], da = new Set(), cho = [...loiGoi(dong)];
  while (cho.length) { const t = cho.pop(); if (da.has(t) || !bang.has(t)) continue; da.add(t); kq.push(...bang.get(t)); cho.push(...loiGoi(bang.get(t))); }
  return { dong: kq, bang, goi: da };
}
/** Lời gọi có đối số (trừ range) trong các dòng, và hàm có tham số được gọi / khai. */
function thamSo(m) {
  const { dong, bang, goi } = dongBacCau(m), sai = [];
  for (const l of dong) for (const x of l.matchAll(/([A-Za-z_]\w*)\s*\(([^()]*)\)/g)) if (x[1] !== 'range' && x[2].trim() !== '') sai.push(x[0]);
  for (const b of [m.maMau, m.loiGiai]) for (const h of (b.hamCuaEmMoi || []).concat(b.hamCuaMan || [])) if ((h.thamSo || []).length) sai.push('def ' + h.ten + '(' + h.thamSo + ')');
  return sai;
}
const dsSanCua = m => (Array.isArray(m.san[0]) ? m.san : [m.san]);
kiem2('(a) mùa 2 đúng các gói / chương đang có màn theo bảng, đúng thứ tự màn; MUA_2 khai đủ 10 gói × 2 chương; mùa 2 "Nhà máy" hiện; ngưỡng sao khai cứng khớp công thức TI_LE_SAO', () => {
  assert.deepEqual(M.mua2.map(g => [g.ma, g.chuong.map(c => c[0])]), BANG_MUA_2.map(([ma, ds]) => [ma, ds.map(c => c[0])]), 'MUA_2 khác bảng mục 2');
  assert.deepEqual(goiMua('mua-2').map(g => [g.ma, g.chuong]), goi2Bang.map(([ma, ds]) => [ma, ds.map(c => c[0])]), 'gói / chương mùa 2');
  for (const [, ds] of goi2Bang) for (const [c, dsMa] of ds) assert.deepEqual(M.danhSach.filter(m => m.chuong === c).map(m => m.ma), dsMa, c);
  assert.deepEqual(TT.thuTu.slice(chuongMua1.size, chuongMua1.size + chuongMua2.size), goi2Bang.flatMap(([, ds]) => ds.map(c => c[0])), 'chương mùa 2 đứng ngay sau mùa 1');
  for (const m of moiMua2) assert.ok(BANG_MUA_2.some(([, ds]) => ds.some(c => c[0] === m.chuong)), m.ma + ' thuộc chương ngoài bảng');
  // 29/10 mùa 2 xong: mùa 2 hiện (không `an`), tên "Ghi nhớ", vẫn bán (`ban`); ngưỡng sao gói khai cứng = công thức mo-goi.js (0,5 × tổng sao tối đa các gói trước
  // trong mùa, làm tròn xuống bội 5) tính trên số màn thật lúc mở, và 0, 30, …, 270 như mùa 1.
  const mua2 = TT.mua.find(x => x.ma === 'mua-2');
  assert.ok(!mua2.an, 'mùa 2 còn ẩn');
  assert.equal(mua2.ten, 'Nhà máy', 'tên mùa 2');      // 29/10 quy tắc đặt tên: tên mùa = nơi chốn (trước: Ghi nhớ)
  assert.ok(mua2.ban && mua2.ban.gia, 'mùa 2 mất `ban`');
  for (const ma of ['mua-3', 'mua-4', 'mua-5']) assert.equal(TT.mua.find(x => x.ma === ma).an, true, ma + ' phải còn ẩn');
  let tr = 0;
  for (const g of goiMua('mua-2')) {
    assert.equal(g.sao, Math.floor(0.5 * tr / 5) * 5, g.ma + ' ngưỡng ' + g.sao + ' khác công thức');
    tr += 3 * g.chuong.reduce((s, c) => s + M.danhSach.filter(m => m.chuong === c).length, 0);
  }
  assert.deepEqual(goiMua('mua-2').map(g => g.sao), [0, 30, 60, 90, 120, 150, 180, 210, 240, 270], 'ngưỡng sao mùa 2');
  // Chương cũ của mùa 2 ngoài bảng ở mùa ẩn (29/10 P0 mùa 3: nhen, doi-xich vào MUA_3; các chương khác sang đầu mùa 4, cũng ẩn)
  for (const c of ['ban-xoay', 'nhen', 'doi-ho-bang', 'list', 'doi-xich', 'omni', 'doi-omni', 'che-xich']) assert.ok(TT.mua.find(x => x.ma === goiCuaChuong(c).mua).an, c);
});
kiem2('(b) không màn nào trước gói 1 chương 2 mùa 2 (bien-xich) dùng biến (bắc cầu qua hàm của em) hay mở nhóm ĐẾM', () => {
  const moc = viTriMan(M.danhSach.find(m => m.chuong === 'bien-xich'));
  assert.ok(moc > 0);
  for (const m of M.danhSach.slice(0, moc)) {
    assert.ok(!m.bienDem, m.ma + ' mở nhóm ĐẾM');
    const sai = dongBacCau(m).dong.filter(laBien);
    assert.deepEqual(sai, [], m.ma + ' dùng biến');
  }
});
kiem2('(c) không màn nào trước gói 2 chương 2 mùa 2 (tham-so) gọi hàm có đối số (trừ range) hay khai hàm có tham số, thẳng hay qua hàm của em', () => {
  const moc = viTriMan(get('tham-so.1'));
  for (const m of M.danhSach.slice(0, moc)) assert.deepEqual(thamSo(m), [], m.ma + ' dùng tham số');
});
kiem2('(d) không sân mùa 2 nào có bậc thang S, hố u, gầm n', () => {
  for (const m of manMua2) for (const s of dsSanCua(m)) assert.ok(!/[Sun]/.test(s.join('')), m.ma + ' có ' + [...new Set(s.join('').match(/[Sun]/g))].join(''));
});
kiem2('(e) mùa 2: hàm của em mà màn cần hay lời giải gọi thẳng đều được tạo ở màn đứng trước', () => {
  const daTao = new Set();
  for (const m of M.danhSach) {
    if (chuongMua2.has(m.chuong)) {
      for (const h of m.hamCuaEmCan) assert.ok(daTao.has(h), m.ma + ' cần ' + h + ' nhưng chưa màn nào trước nó tạo');
      const lg = m.loiGiai, rieng = new Set((lg.hamCuaMan || []).concat(lg.hamCuaEmMoi || []).map(h => h.ten));
      const dong = [...(lg.chinh || []), ...(lg.doi || []).flatMap(x => x.chinh || []), ...(lg.hamCuaMan || []).concat(lg.hamCuaEmMoi || []).flatMap(h => h.than)];
      for (const t of loiGoi(dong)) if (!rieng.has(t) && !(m.hamGoc || []).includes(t) && !LENH_MUA_2.includes(t) && t !== 'range') assert.ok(daTao.has(t), m.ma + ' gọi ' + t + '() chưa được tạo');
    }
    for (const t of (m.taoHam || []).concat((m.loiGiai.hamCuaEmMoi || []).map(h => h.ten))) daTao.add(t);
  }
});
kiem2('(f) robot mùa 2 chỉ dùng part mùa 1 + xích + súng hơi (+ hồng ngoại); khay chỉ có lệnh của các part đó', () => {
  for (const m of manMua2) {
    assert.ok(!m.lapRap, m.ma + ' là màn lắp ráp');
    if (m.loaiRobot) assert.ok(PART_2.loaiRobot.includes(m.loaiRobot), m.ma + ' loaiRobot ' + m.loaiRobot);
    for (const r of [m.robot].concat((m.doi || []).map(d => d.robot)).filter(Boolean)) {
      if (r.than) assert.ok(PART_2.than.includes(r.than), m.ma + ' thân ' + r.than);
      if (r.tay) assert.ok(PART_2.tay.includes(r.tay), m.ma + ' tay ' + r.tay);
      for (const c of r.camBien || []) assert.ok(PART_2.camBien.includes(c.ma), m.ma + ' cảm biến ' + c.ma);
    }
    for (const h of (m.hamGoc || []).concat((m.doi || []).flatMap(d => d.hamGoc || []))) assert.ok(LENH_MUA_2.includes(h), m.ma + ' khay có ' + h);
  }
});
// (g) Đường cong CẢ MÙA 2 (luật đo KE-HOACH-MUA-1.md mục Trạng thái, cách đo như kiem-be-sung.mjs mục 5): dòng lời giải (chương trình chính, 0 nếu chinhCoDinh;
// màn đội cộng các xe không coDinh; + thân hàm của màn + hàm của em mới), nhịp sao.nhip, ô = số ô không '#' của sân lớn nhất. Màn n ≤ max(1,5 × mốc, mốc + lề),
// lề dòng 3 / nhịp 4 / ô 6; mốc = màn không trùm đứng ngay trước theo thứ tự cả mùa (qua ranh chương, ranh gói); trùm miễn và không làm mốc.
const LE_CONG = { dong: 3, nhip: 4, o: 6 };
// Gói T (29/10): màn trình diễn chiChay (chương trình khoá, chỉ bấm Chạy: không có việc làm) MIỄN như trùm và KHÔNG làm mốc: màn ép kế tiếp so với màn thật đứng trước.
const soDongCong = m => (m.doi ? m.loiGiai.doi.filter((d, i) => !m.doi[i].coDinh).reduce((s, d) => s + d.chinh.length, 0) : (m.chinhCoDinh ? 0 : m.loiGiai.chinh.length))
  + (m.loiGiai.hamCuaMan || []).concat(m.loiGiai.hamCuaEmMoi || []).reduce((s, h) => s + h.than.length, 0);
const soOCong = m => Math.max(...dsSanCua(m).map(r => r.join('').replace(/#/g, '').length));
const chiSoCong = m => ({ dong: soDongCong(m), nhip: m.sao.nhip, o: soOCong(m) });
const chuongTheoGoi2 = () => goiMua('mua-2').flatMap(g => g.chuong.map(c => M.danhSach.filter(m => m.chuong === c).sort((a, b) => a.so - b.so)));
if (LOI_GIA_2) {
  // (g) đảo hai màn một chương (hong-ngoai.1 ↔ hong-ngoai.7: màn sân 30 ô thành màn đầu chương); (h) trùm day-thung.10 mất huy hiệu.
  const a = get('hong-ngoai.1'), b = get('hong-ngoai.7'); [a.so, b.so] = [b.so, a.so]; M.tinhLai();
  delete get('day-thung.10').huyHieu;
}
kiem2('(g) đường cong cả mùa 2: dòng / nhịp / ô của màn n ≤ max(1,5 × mốc, mốc + lề 3 / 4 / 6), mốc = màn không trùm ngay trước (qua ranh chương), trùm miễn', () => {
  const tran = (a, b, le) => a <= Math.max(1.5 * b, b + le), sai = [];
  let moc = null;
  for (const ds of chuongTheoGoi2()) for (const m of ds) {
    if (m.hang === 'trum' || m.chiChay) continue;
    if (moc) {
      const v = chiSoCong(m), t = chiSoCong(moc);
      for (const k of ['dong', 'nhip', 'o']) if (!tran(v[k], t[k], LE_CONG[k])) sai.push(m.ma + ' (' + m.chuong + '.' + m.so + ') sau ' + moc.ma + ': ' + k + ' ' + t[k] + '→' + v[k]);
    }
    moc = m;
  }
  assert.deepEqual(sai, [], sai.length + ' chỗ nhảy: ' + sai.join(' · '));
});
kiem2('(h) mỗi chương mùa 2 đúng 10 màn (so 1–10), màn 10 là trùm có huy hiệu, huy hiệu có hình vector riêng (coHinhRieng); 9 màn đầu không trùm, không huy hiệu', () => {
  const ds = chuongTheoGoi2();
  assert.equal(ds.length, 20, 'mùa 2 có ' + ds.length + ' chương có màn');
  for (const ch of ds) {
    const c = ch[0].chuong;
    assert.deepEqual(ch.map(m => m.so), MUOI, c + ': ' + ch.length + ' màn, so ' + ch.map(m => m.so).join(','));
    const t = ch[9];
    assert.ok(t.hang === 'trum' && t.huyHieu && t.huyHieu.ma, c + ': màn 10 ' + t.ma + ' không phải trùm có huy hiệu');
    assert.ok(coHinhRieng(t.huyHieu.ma), c + ': huy hiệu ' + t.huyHieu.ma + ' không có hình vector riêng');
    for (const m of ch.slice(0, 9)) assert.ok(m.hang !== 'trum' && !m.huyHieu, m.ma + ' trước màn 10 là trùm / mang huy hiệu');
  }
});
if (LOI_GIA_2) {
  console.log('Lỗi giả mùa 2: HỎNG ' + hong2 + ' / 8 mục (a)–(h).');
  process.exit(hong2 === 8 ? 0 : 1);
}
if (hong2) { console.log('Mùa 2: HỎNG ' + hong2 + ' mục.'); process.exit(1); }

// ---------------------------------------------------------------- MÙA 3 = 10 GÓI (29/10, KE-HOACH-MUA-3.md, đang dựng, ẩn): thứ tự gói, ràng buộc Python / part theo gói
// Chạy với --loi-gia-mua-3: cắm bảy lỗi giả vào dữ liệu đã nạp (sau khi mục mùa 2 đã xanh), mục mùa 3 phải ĐỎ cả (a)–(g) rồi dừng. (h) chỉ in bảng.
const LOI_GIA_3 = process.argv.includes('--loi-gia-mua-3');
// Bảng P0 (brief-P0-khung-mua-3.md, KE-HOACH-MUA-3.md mục 2): [mã gói, loại, [[chương, màn CÓ SẴN theo thứ tự]]]. Màn mới của TEP_MUA_3 nối sau màn có sẵn
// (chen trước màn trùm có sẵn cuối chương). Khác bảng brief (đo 29/10, lý do ở lo-trinh-hoc.js khối mùa 3): che-nam-cham.2, .3, .4, .7, .9 ở che-doc-cuc;
// che-doi-xich cả 10 màn rời mùa 3.
const BANG_MUA_3 = [
  ['nhen', 'bo-phan', [['nhen', ['nhen.1', 'nhen.8']], ['chuoi-nhen', ['nhen.4', 'nhen.7']]]],
  ['nam-cham', 'bo-phan', [['nam-cham', day('nam-cham', [1, 4, 7, 8, 5])], ['logic-nam-cham', day('che-nam-cham', [1, 8])]]],
  ['cam-ung-tu', 'bo-phan', [['cam-ung-tu', []], ['che-cam-ung-tu', []]]],
  ['bai-tu', undefined, [['bai-tu', []], ['che-bai-tu', []]]],
  ['nhay', 'bo-phan', [['nhay', day('nhen', [3, 2, 9, 5, 6, 10])], ['che-nhen', day('che-nhen', [1, 2, 8, 5, 9, 4, 3, 7, 6, 10])]]],
  ['dao-cuc', 'bo-phan', [['dao-cuc', day('nam-cham', [3, 2])], ['che-dao-cuc', ['che-nam-cham.6']]]],
  ['doc-cuc', 'bo-phan', [['doc-cuc', day('nam-cham', [6, 10])], ['che-doc-cuc', day('che-nam-cham', [2, 7, 4, 5, 9, 3, 10])]]],
  ['doi-xich', 'thu-thach', [['doi-xich', day('doi-xich', [3, 9])], ['che-doi-xich', []]]],
  ['bung-nhen', 'thu-thach', [['bung-nhen', []], ['che-bung-nhen', []]]],
  ['tong-hop-3', 'thu-thach', [['tong-hop-3', []], ['trum-mua-3', []]]]
];
const TEP_MUA_3 = ['manThanNhen', 'manNamChamN', 'manCamUngTu', 'manBaiTu', 'manNhay', 'manDaoCuc', 'manDocCuc', 'manDoiXichNhen', 'manBungNhen', 'manTrumMua3'];
const moiMua3 = TEP_MUA_3.flatMap(k => M[k] || []);
const laTrum3 = ma => { const m = get(ma); return m && (m.hang === 'trum'); };
/** Màn của chương c theo bảng: có sẵn + màn mới (theo so), màn mới chen trước trùm có sẵn cuối chương. */
const manBang3 = (c, coSan) => {
  const them = moiMua3.filter(m => m.chuong === c).sort((a, b) => a.so - b.so).map(m => m.ma);
  const cuoi = coSan[coSan.length - 1];
  return cuoi && laTrum3(cuoi) ? coSan.slice(0, -1).concat(them, [cuoi]) : coSan.concat(them);
};
const goi3Bang = BANG_MUA_3.map(([ma, , ds]) => [ma, ds.map(([c, coSan]) => [c, manBang3(c, coSan)]).filter(x => x[1].length)]).filter(x => x[1].length);
// Rời mùa 3 (brief: đầu mùa 4, giữ thứ tự): gói ngoài khuôn, chương rời (M.roiMua3).
const ROI_3_GOI = ['ban-xoay', 'doi-ho-bang', 'list', 'che-xich', 'doi-xich-bac', 'omni', 'doi-omni', 'doi-sung-hoi', 'mau', 'doi-mau', 'may-son', 'rap-nao', 'nam-cham-omni', 'doi-nam-cham', 'doi-tay-xoay'];
const LENH_MUA_3 = LENH_MUA_2.concat(['go_up', 'go_down', 'go_left', 'go_right', 'crouch', 'stand', 'magnet_n', 'magnet_s', 'magnet_off', 'front_metal', 'front_pole']);
const PART_3 = { than: ['hai-banh', 'xich', 'nhen'], tay: ['kep', 'xoay', 'hoi', 'nam-cham'], camBien: ['khoang-cach', 'hong-ngoai', 'cam-ung-tu'], loaiRobot: ['banh', 'xich', 'nhen'] };
// Lệnh của part ngoài mùa 3 (omni, drone, camera / màu, máy ném, pin): không được gọi, kể cả qua hàm của em.
const CAM_3 = ['color', 'look', 'slide_left', 'slide_right', 'aim', 'throw', 'load', 'battery', 'recharge'];
const goi3 = () => goiMua('mua-3');
const chuongMua3Nay = () => new Set(goi3().flatMap(g => g.chuong));
const manMua3 = () => M.danhSach.filter(m => chuongMua3Nay().has(m.chuong));
/** Vị trí (trong danhSach) màn đầu của gói thứ k (1–10) của MUA_3, hay của gói có màn đầu tiên sau nó; hết mùa 3 thì màn đầu sau mùa 3. */
function mocGoi3(k) {
  for (let i = k - 1; i < M.mua3.length; i++) {
    const ch = M.mua3[i].chuong.map(c => c[0]);
    const m = M.danhSach.find(x => ch.includes(x.chuong));
    if (m) return viTriMan(m);
  }
  const ds = manMua3();
  return ds.length ? viTriMan(ds[ds.length - 1]) + 1 : M.danhSach.length;
}
/** Vị trí màn đầu của chương c (chương mùa 3; chưa có màn thì như mocGoi3 của gói chứa nó, tính từ chương đó). */
function mocChuong3(c) {
  const m = M.danhSach.find(x => x.chuong === c);
  if (m) return viTriMan(m);
  const k = M.mua3.findIndex(g => g.chuong.some(x => x[0] === c));
  return mocGoi3(k + 2);     // chương 2 của gói k+1 còn trống: mốc là gói sau
}
/** Dòng code bỏ chuỗi và chú thích (để tìm từ khóa). */
const boChuoi = l => l.replace(/"[^"]*"|'[^']*'/g, '""').replace(/#.*$/, '');
/** (b) Chuỗi làm DỮ LIỆU trong một dòng: gán chuỗi cho biến; for … in chuỗi / biến (không phải range); so sánh == / != với chuỗi; gọi hàm với đối số
 *  là chuỗi đường đi (chỉ gồm U D L R: walk("RRD"), go("R"), leap(...)). Đối số chuỗi cố định khác (shoot("fast")) KHÔNG tính. */
function chuoiDuLieu(l) {
  const sai = [];
  if (/^\s*[A-Za-z_]\w*\s*=\s*["']/.test(l)) sai.push('gán chuỗi');
  if (/^\s*for\s+[A-Za-z_]\w*\s+in\s+(?!range\s*\()/.test(l)) sai.push('for … in chuỗi / biến');
  if (/(==|!=)\s*["']|["']\s*(==|!=)/.test(l)) sai.push('so sánh chuỗi');
  if (/[A-Za-z_]\w*\s*\(\s*["'][UDLR]+["']\s*\)/.test(l)) sai.push('chuỗi đường đi');
  return sai;
}
const coLogic = l => /\b(and|or)\b/.test(boChuoi(l));
let hong3 = 0;
const kiem3 = (ten, fn) => { try { fn(); dat++; } catch (e) { hong3++; console.log('  HỎNG ' + ten + '\n       ' + (e && e.message ? e.message.split('\n')[0] : e)); } };
if (LOI_GIA_3) {
  // (a) đổi chỗ hai màn gói 1; (b) gán chuỗi ở nhen.1 (gói 1 chương 1); (c) and ở nam-cham.1 (gói 2 chương 1); (d) cảm biến màu ở nhen.2;
  // (e) magnet_s trên khay nam-cham.7 (gói 2); (f) bậc thang ở doi-xich.3; (g) che-nhen.4 cần hàm chưa ai tạo.
  const a = get('nhen.1'), b = get('nhen.8'); [a.so, b.so] = [b.so, a.so]; M.tinhLai();
  get('nhen.1').loiGiai.chinh = ['path = "RRR"'].concat(get('nhen.1').loiGiai.chinh);
  get('nam-cham.1').loiGiai.chinh = get('nam-cham.1').loiGiai.chinh.concat(['if front_clear() and front_clear():', '    wait()']);
  get('nhen.2').robot = Object.assign({}, get('nhen.2').robot, { camBien: [{ ma: 'mau', o: 'bung' }] });
  get('nam-cham.7').hamGoc = get('nam-cham.7').hamGoc.concat(['magnet_s']);
  get('doi-xich.3').san = get('doi-xich.3').san.map((d, i) => i === 0 ? 'S' + d.slice(1) : d);
  get('che-nhen.4').hamCuaEmCan = get('che-nhen.4').hamCuaEmCan.concat(['fly_home']);
}
kiem3('(a) mùa 3 đúng các gói / chương đang có màn theo bảng, đúng thứ tự màn; MUA_3 khai đủ 10 gói × 2 chương, đúng loại; chương chưa có màn chưa hiện; mùa 3 ẩn; gói ngoài khuôn ở đầu mùa 4', () => {
  assert.deepEqual(M.mua3.map(g => [g.ma, g.loai, g.chuong.map(c => c[0])]), BANG_MUA_3.map(([ma, loai, ds]) => [ma, loai, ds.map(c => c[0])]), 'MUA_3 khác bảng');
  assert.deepEqual(goi3().map(g => [g.ma, g.chuong]), goi3Bang.map(([ma, ds]) => [ma, ds.map(c => c[0])]), 'gói / chương mùa 3');
  for (const [, ds] of goi3Bang) for (const [c, dsMa] of ds) assert.deepEqual(M.danhSach.filter(m => m.chuong === c).map(m => m.ma), dsMa, c);
  const n12 = chuongMua1.size + chuongMua2.size, ch3 = goi3Bang.flatMap(([, ds]) => ds.map(c => c[0]));
  assert.deepEqual(TT.thuTu.slice(n12, n12 + ch3.length), ch3, 'chương mùa 3 đứng ngay sau mùa 2');
  for (const [, , ds] of BANG_MUA_3) for (const [c] of ds) if (!ch3.includes(c)) assert.ok(!TT.thuTu.includes(c), c + ' chưa có màn mà đã vào thuTu');
  for (const m of moiMua3) assert.ok(BANG_MUA_3.some(([, , ds]) => ds.some(c => c[0] === m.chuong)), m.ma + ' thuộc chương ngoài bảng');
  assert.equal(TT.mua.find(x => x.ma === 'mua-3').an, true, 'mùa 3 phải còn ẩn');
  for (const g of goi3()) assert.equal(g.sao, undefined, g.ma + ' khai cứng ngưỡng sao (mùa 3 đang dựng: tự tính)');
  // Gói ngoài khuôn: đầu mùa 4, giữ thứ tự cũ, trước các gói mùa 4 cũ; chương rời của MUA_3 đúng màn.
  // P0 mùa 4 (29/10): gói ngoài khuôn của mùa 3 dời tiếp sang đầu mùa 5; gói đã vào MUA_4 (drone, may-son, mau, flycam, doi-nam-cham) và list (chương vào gói drone) không còn ở đây.
  const vaoMua4 = new Set((M.mua4 || []).map(g => g.ma).concat(['list']));
  const ROI_3_CON = ROI_3_GOI.filter(ma => !vaoMua4.has(ma));
  const g4 = goiMua('mua-5').map(g => g.ma);
  assert.deepEqual(g4.slice(0, ROI_3_CON.length), ROI_3_CON, 'đầu mùa 5');
  assert.equal(goiMua('mua-5')[0].sao, 0, 'gói đầu mùa 5 cần 0 sao');
  assert.deepEqual(Object.keys(M.roiMua3).map(c => [c, M.danhSach.filter(m => m.chuong === c).map(m => m.ma)]), Object.entries(M.roiMua3), 'chương rời mùa 3');
  for (const c of Object.keys(M.roiMua3)) assert.equal(goiCuaChuong(c).mua, 'mua-5', c);
});
kiem3('(b) không màn nào trước gói 1 chương 2 mùa 3 (chuoi-nhen) dùng chuỗi làm dữ liệu (bắc cầu qua hàm của em); shoot("fast") vẫn được', () => {
  const moc = mocChuong3('chuoi-nhen'), sai = [];
  for (const m of M.danhSach.slice(0, moc)) for (const l of dongBacCau(m).dong) for (const s of chuoiDuLieu(l)) sai.push(m.ma + ' ' + s + ': ' + l.trim());
  assert.deepEqual(sai, [], sai.length + ' chỗ: ' + sai.slice(0, 6).join(' · '));
});
kiem3('(c) không màn nào trước gói 2 chương 2 mùa 3 (logic-nam-cham) dùng and / or (kể cả mùa 1, 2; bắc cầu qua hàm của em)', () => {
  const moc = mocChuong3('logic-nam-cham'), sai = [];
  for (const m of M.danhSach.slice(0, moc)) for (const l of dongBacCau(m).dong) if (coLogic(l)) sai.push(m.ma + ': ' + l.trim());
  assert.deepEqual(sai, [], sai.length + ' chỗ: ' + sai.slice(0, 6).join(' · '));
});
kiem3('(d) robot mùa 3: thân hai bánh / xích / nhện; tay mùa 1–2 + nam châm; cảm biến mùa 1–2 + cảm ứng từ; khay chỉ lệnh của các part đó; không gọi lệnh omni / drone / màu / máy ném', () => {
  for (const m of manMua3()) {
    if (m.loaiRobot) assert.ok(PART_3.loaiRobot.includes(m.loaiRobot), m.ma + ' loaiRobot ' + m.loaiRobot);
    for (const r of [m.robot].concat((m.doi || []).map(d => d.robot)).filter(Boolean)) {
      if (r.than) assert.ok(PART_3.than.includes(r.than), m.ma + ' thân ' + r.than);
      if (r.tay) assert.ok(PART_3.tay.includes(r.tay), m.ma + ' tay ' + r.tay);
      for (const c of r.camBien || []) assert.ok(PART_3.camBien.includes(c.ma), m.ma + ' cảm biến ' + c.ma);
    }
    for (const h of (m.hamGoc || []).concat((m.doi || []).flatMap(d => d.hamGoc || []))) assert.ok(LENH_MUA_3.includes(h), m.ma + ' khay có ' + h);
    const goi = [...loiGoi(dongBacCau(m).dong)].filter(t => CAM_3.includes(t));
    assert.deepEqual(goi, [], m.ma + ' gọi lệnh ngoài mùa 3');
  }
});
// (e) part mở dần (gốc → nâng cấp): [lệnh / thân, gói mở]. Màn đứng trước màn đầu của gói đó (cả mùa 1, 2) không được gọi (bắc cầu) hay có trên khay.
const MO_DAN_3 = [['front_metal', 3], ['crouch', 5], ['stand', 5], ['jump', 5], ['leap', 5], ['magnet_s', 6], ['front_pole', 7]];
kiem3('(e) part mở dần: không front_metal trước gói 3, crouch / stand / jump / leap trước gói 5, magnet_s trước gói 6, front_pole trước gói 7, nhện trước gói 1 (bắc cầu + khay)', () => {
  const sai = [];
  for (const [t, k] of MO_DAN_3) {
    const moc = mocGoi3(k);
    for (const m of M.danhSach.slice(0, moc)) {
      const khay = (m.hamGoc || []).concat((m.doi || []).flatMap(d => d.hamGoc || []));
      if (khay.includes(t)) sai.push(m.ma + ' khay có ' + t + ' (trước gói ' + k + ')');
      if (loiGoi(dongBacCau(m).dong).has(t)) sai.push(m.ma + ' gọi ' + t + ' (trước gói ' + k + ')');
    }
  }
  for (const m of M.danhSach.slice(0, mocGoi3(1))) {
    const r = [m.robot].concat((m.doi || []).map(d => d.robot)).filter(Boolean);
    if (m.loaiRobot === 'nhen' || r.some(x => x.than === 'nhen') || (m.doi || []).some(d => d.loaiRobot === 'nhen')) sai.push(m.ma + ' có nhện (trước gói 1)');
  }
  assert.deepEqual(sai, [], sai.length + ' chỗ: ' + sai.slice(0, 6).join(' · '));
});
kiem3('(f) không sân mùa 3 nào có bậc thang S', () => {
  for (const m of manMua3()) for (const s of dsSanCua(m)) assert.ok(!/S/.test(s.join('')), m.ma + ' có bậc thang S');
});
// Hàm có sẵn của Python / danh sách (không phải hàm của em) khi dò lời gọi.
const PY_SAN = ['range', 'len', 'append', 'pop', 'int', 'str', 'abs', 'min', 'max', 'print'];
kiem3('(g) mùa 3 và mùa ẩn sau nó: hàm của em mà màn cần hay lời giải gọi thẳng đều được tạo ở màn đứng trước', () => {
  const daTao = new Set(), c3 = chuongMua3Nay(), sau = new Set(TT.goi.filter(g => g.mua !== 'mua-1' && g.mua !== 'mua-2' && g.mua !== 'mua-3').flatMap(g => g.chuong)), sai = [];
  for (const m of M.danhSach) {
    if (c3.has(m.chuong) || sau.has(m.chuong)) {
      for (const h of m.hamCuaEmCan) if (!daTao.has(h)) sai.push(m.ma + ' cần ' + h);
      const lg = m.loiGiai, rieng = new Set((lg.hamCuaMan || []).concat(lg.hamCuaEmMoi || []).map(h => h.ten));
      const goc = new Set((m.hamGoc || []).concat((m.doi || []).flatMap(d => d.hamGoc || [])));
      const dong = [...(lg.chinh || []), ...(lg.doi || []).flatMap(x => x.chinh || []), ...(lg.hamCuaMan || []).concat(lg.hamCuaEmMoi || []).flatMap(h => h.than)];
      for (const t of loiGoi(dong)) if (!rieng.has(t) && !goc.has(t) && !LENH_MUA_3.includes(t) && !PY_SAN.includes(t) && !daTao.has(t)) sai.push(m.ma + ' gọi ' + t + '()');
    }
    for (const t of (m.taoHam || []).concat((m.loiGiai.hamCuaEmMoi || []).map(h => h.ten))) daTao.add(t);
  }
  assert.deepEqual(sai, [], sai.length + ' chỗ: ' + sai.slice(0, 8).join(' · '));
});
kiem3('(h) ĐO đường cong mùa 3 (luật phanh (g) mùa 2: lề dòng 3 / nhịp 4 / ô 6, mốc = màn không trùm đứng trước qua ranh chương / gói, trùm miễn): chỉ in, chưa ép', () => {
  const tran = (a, b, le) => a <= Math.max(1.5 * b, b + le), nhay = [];
  let moc = null;
  for (const g of goi3()) for (const c of g.chuong) for (const m of M.danhSach.filter(x => x.chuong === c).sort((a, b) => a.so - b.so)) {
    if (m.hang === 'trum') continue;
    if (moc) {
      const v = chiSoCong(m), t = chiSoCong(moc);
      for (const k of ['dong', 'nhip', 'o']) if (!tran(v[k], t[k], LE_CONG[k])) nhay.push([g.ma, m.chuong + '.' + m.so, m.ma, moc.ma, k, t[k], v[k]]);
    }
    moc = m;
  }
  if (!LOI_GIA_3) {
    console.log('Mùa 3 (h) đường cong: ' + nhay.length + ' chỗ nhảy (gói | màn | mốc | chỉ số mốc → màn)');
    for (const [g, id, ma, mc, k, a, b] of nhay) console.log('  ' + g + ' | ' + id + ' ' + ma + ' | ' + mc + ' | ' + k + ' ' + a + ' → ' + b);
  }
});
if (!LOI_GIA_3) {
  // (f) bảng ô hố u / gầm n theo gói mùa 3 (luật: hố là sàn mới mùa 3, đi cùng nhảy ở gói 5, bãi từ gói 4): chỉ in.
  const ho = goi3().map(g => [g.ma, g.chuong.flatMap(c => M.danhSach.filter(m => m.chuong === c)).filter(m => dsSanCua(m).some(s => /[un]/.test(s.join(''))))
    .map(m => m.ma + '(' + [...new Set(dsSanCua(m).flatMap(s => s.join('').match(/[un]/g) || []))].join('') + ')')]);
  console.log('Mùa 3 (f) hố u / gầm n theo gói: ' + ho.map(([g, ds]) => g + ': ' + (ds.join(' ') || 'không')).join(' · '));
}
if (LOI_GIA_3) {
  console.log('Lỗi giả mùa 3: HỎNG ' + hong3 + ' / 7 mục (a)–(g).');
  process.exit(hong3 === 7 ? 0 : 1);
}
if (hong3) { console.log('Mùa 3: HỎNG ' + hong3 + ' mục.'); process.exit(1); }

// 26/10: chương cam-bien-ben = che-cam-bien.4 (chế to_gap) + cam-bien-ben 1–9, đều một sân; trùm ba sân cũ cam-bien-ben.10 sang chương Tổng hợp.
// HD2 (29/10): cam-bien-ben.1 (trình diễn left_clear, chiChay) đứng đầu chương, che-cam-bien.4 thứ hai.
kiem('gói cảm biến hai bên: mười màn khác nhau, một sân; trùm cũ ba sân', () => {
  for (const c of ['cam-bien-ben']) {
    const ds = M.danhSach.filter(m => m.chuong === c);
    assert.equal(new Set(ds.map(m => JSON.stringify([m.san, m.loiGiai]))).size, 10, c + ' có màn trùng nhau');
    assert.equal(new Set(ds.map(m => m.ten)).size, 10, c + ' trùng tên màn');
    for (const m of ds) assert.equal(soSan(m), m.ma === 'che-cam-bien.4' ? 3 : m.ma === 'cam-bien-ben.7' ? 2 : 1, m.ma);      // HD1: màn chế / sửa hàm nhiều sân
  }
  assert.equal(soSan(get('cam-bien-ben.10')), 3);
  for (const m of M.danhSach.filter(m => m.chuong === 'cam-bien-ben')) {
    const lg = JSON.stringify(m.loiGiai);
    assert.ok(/left_clear|right_clear/.test(lg), m.ma + ' không dùng cảm biến hai bên');
  }
  assert.ok(M.danhSach.filter(m => m.chuong === 'cam-bien-ben').filter(m => /left_clear/.test(JSON.stringify(m.loiGiai))).length >= 8);
});
kiem('chương mới không đổi id của ngân hàng bài gốc trong thu-tu-chuong.js', () => {
  const goc = fs.readFileSync(new URL('./thu-tu-chuong.js', import.meta.url), 'utf8');
  for (const c of ['cam-bien-ben', 'me-cung', 'doi-ho-bang', 'doi-gap-nem']) assert.ok(!goc.includes("'" + c + "'"), c);
  // 29/10 P0 mùa 3: che-nhen ở gói 5 mùa 3, doi-ho-bang (ngoài khuôn) sang đầu mùa 4: vẫn đứng sau che-nhen, không còn liền kề.
  assert.ok(TT.thuTu.indexOf('doi-ho-bang') > TT.thuTu.indexOf('che-nhen'));
  assert.equal(TT.thuTu.indexOf('doi-gap-nem'), TT.thuTu.indexOf('che-may-nem') + 1);
  assert.ok(TT.dot2.includes('doi-ho-bang') && TT.dot2.includes('doi-gap-nem'));
});

kiem('mê cung: chỉ tiến khi gặp tường thì rẽ phải không giải được trùm', () => {
  const m = get('me-cung.10');
  const sai = { chinh: ['for i in range(60):', '    if front_clear():', '        move()', '    else:', '        turn_right()'] };
  assert.equal(cham(m, sai).thang, false);
});
kiem('các bài mê cung vẫn cần người học hoàn thành mẫu', () => {
  for (let i = 1; i <= 10; i++) {
    const m = get('me-cung.' + i);
    assert.equal(cham(m, m.maMau).thang, false, m.ma + ' mẫu đã giải sẵn');
  }
});
kiem('trùm lắp ráp giữ lựa chọn nhanh hoặc rẻ và mọi hàm vừa 10 ô', () => {
  const m = get('rap-du.10');
  const tk = LR.thongKeMau(m, khoTruoc.get(m.ma));
  assert.ok(tk.every(x => x.thang && x.sao === 3));
  assert.ok(tk[0].nhip < tk[1].nhip && tk[1].gia < tk[0].gia);
  assert.deepEqual(LR.kiemCanMan(m, khoTruoc.get(m.ma)), []);
  for (const c of m.lapRap.cachLap) for (const h of c.loiGiai.hamCuaMan) assert.ok(h.than.length <= 10);
});
kiem('mê cung: bỏ nhánh quay trái sẽ mắc ở ngõ cụt', () => {
  const m = get('me-cung.10');
  const lg = clone(m.loiGiai);
  lg.hamCuaEmMoi = [{ ten: 'follow_right', thamSo: [], than: ['if right_clear():', '    turn_right()', '    move()', 'elif front_clear():', '    move()'] }];
  assert.equal(cham(m, lg).thang, false);
});
kiem('máy ném: ghi cứng tầm theo hàng không vượt cả ba kho', () => {
  const m = get('may-nem.10');
  const lg = { chinh: ['for i in range(3):', '    load()', '    wait()', '    turn_left()', '    aim(3 - i)', '    throw()', '    wait()', '    turn_right()', '    forward(2)'] };
  assert.equal(cham(m, lg).thang, false);
});
kiem('drone: bỏ sạc không giao được cả hai hộp', () => {
  const m = get('drone.10');
  const lg = clone(m.loiGiai);
  lg.chinh = ['ship("RR")', 'walk("RR")', 'ship("RR")'];
  assert.equal(cham(m, lg).thang, false);
});
kiem('lắp ráp: lời giải trùm cũ không thắng nhiệm vụ mới', () => {
  const m = get('rap-du.10');
  assert.equal(cham(m, { chinh: ['jet_back()', 'turn_right()', 'forward(4)'] }).thang, false);
  const lg = clone(m.loiGiai);
  lg.hamCuaMan[0].than = ['pick()', 'arm_left()', 'drop()', 'arm_right()', 'wait()'];
  assert.equal(cham(m, lg).thang, false);
});

// Chạy chính các script HTML trong VM: tránh Node đúng nhưng trình duyệt quên nạp policy.
const html = fs.readFileSync(new URL('./game/choi.html', import.meta.url), 'utf8');
const browser = { console };
browser.window = browser;
const ctx = vm.createContext(browser);
for (const match of html.matchAll(/<script src="([^"]+)"><\/script>/g)) {
  const url = new URL(match[1], new URL('./game/choi.html', import.meta.url));
  vm.runInContext(fs.readFileSync(url, 'utf8'), ctx, { filename: fileURLToPath(url) });
  if (match[1] === '../lo-trinh-hoc.js') break;
}
kiem('HTML và Node dùng cùng danh sách màn và cùng ngưỡng sao', () => {
  assert.deepEqual(clone(browser.ManHoc.danhSach), clone(M.danhSach));
  assert.deepEqual(clone(browser.ThuTuChuong), clone(TT));
});
vm.runInContext(fs.readFileSync(new URL('./game/mo-goi.js', import.meta.url), 'utf8'), ctx);
kiem('đi tuần tự toàn bộ lộ trình không gặp khóa phụ thuộc tương lai', () => {
  const sao = {};
  const luu = { saoTot: ma => sao[ma] || 0, daMua: () => true };
  for (const m of browser.ManHoc.danhSach) {
    const tt = browser.MoGoi.trangThai(m, luu, false);
    assert.ok(tt.mo, m.ma + ': ' + JSON.stringify(tt));
    sao[m.ma] = 3;
  }
  assert.equal(browser.MoGoi.manTiepTheo(luu, false), null);
});
kiem('mua thẳng từng mùa sau (chưa chơi mùa trước): đi tuần tự hết mùa đó không gặp khóa', () => {
  for (const mu of browser.MoGoi.dsMua().slice(1)) {
    const sao = {};
    const luu = { saoTot: ma => sao[ma] || 0, daMua: ma => ma === mu.ma };
    for (const g of mu.goi) for (const m of g.man) {
      const tt = browser.MoGoi.trangThai(m, luu, false);
      assert.ok(tt.mo, mu.ma + ' ' + m.ma + ': ' + JSON.stringify(tt));
      sao[m.ma] = 3;
    }
  }
});
kiem('chưa mua thì gói đầu mùa sau khóa với lyDo chua-mua', () => {
  assert.equal(browser.MoGoi.trangThai(browser.ManHoc.timMa('che-cam-bien.6'), { saoTot: () => 3 }, false).lyDo, 'chua-mua');
  assert.equal(browser.MoGoi.trangThai(browser.ManHoc.timMa('may-nem.1'), { saoTot: () => 3 }, false).lyDo, 'chua-mua');
});
kiem('ngưỡng sao: gói đầu mỗi mùa 0 ★, không gói nào cần nhiều sao hơn các gói trước có; mùa 1, mùa 2 đúng luật TI_LE_SAO', () => {
  for (const mu of browser.MoGoi.dsMua()) {
    let tr = 0;
    mu.goi.forEach((g, i) => {
      if (i === 0) assert.equal(g.saoCan, 0, mu.ma + ' gói đầu mùa phải 0 ★: ' + g.ma);
      assert.ok(g.saoCan <= tr, mu.ma + ' ' + g.ma + ' cần ' + g.saoCan + ' ★, các gói trước chỉ có ' + tr);
      tr += g.saoToiDa;
    });
  }
  let tr = 0;
  for (const g of browser.MoGoi.dsMua()[0].goi) { assert.equal(g.saoCan, Math.floor(browser.MoGoi.TI_LE_SAO * tr / 5) * 5, g.ma); tr += g.saoToiDa; }
  // Mùa 2 (đang dựng, ẩn): cũng đúng luật TI_LE_SAO trong mùa, tự tính lại khi gói sau thêm màn.
  tr = 0;
  for (const g of browser.MoGoi.dsMua()[1].goi) { assert.equal(g.saoCan, Math.floor(browser.MoGoi.TI_LE_SAO * tr / 5) * 5, 'mùa 2 ' + g.ma); tr += g.saoToiDa; }
  const ds = browser.MoGoi.dsMua()[0].goi;
  assert.deepEqual(Array.from(ds, g => g.man.length), [20, 20, 20, 20, 20, 20, 20, 20, 20, 20]);
  assert.equal(ds[6].man[0].ma, 'cam-bien-ben.1');      // HD2: màn trình diễn left_clear đứng đầu gói 7
  assert.equal(ds[6].man[19].ma, 'me-cung.10');
  assert.equal(browser.MoGoi.goiTheoMa('rap-du').saoCan, 95);      // P0 mùa 4 (29/10): gói cũ dời sang mùa 5 (ẩn), ngưỡng tính lại trong mùa 5
});

kiem('bản lưu cũ giữ sao theo mã, bỏ nháp lỗi thời, nháp mới đọc lại được', () => {
  const data = new Map();
  data.set('duong-hoc:tien-do', JSON.stringify({ phienBan: 1, sao: { 'khoang-cach.8': 3, 'rap-du.10': 2, 'che-cam-bien.6': 3 } }));
  data.set('duong-hoc:nhap:che-tay.1', JSON.stringify({ chinh: ['old()'], hamCuaMan: [] }));
  data.set('duong-hoc:nhap:hai-banh.1', JSON.stringify({ chinh: ['wait()'], hamCuaMan: [] }));
  browser.localStorage = { getItem: k => data.has(k) ? data.get(k) : null, setItem: (k,v) => data.set(k, String(v)), removeItem: k => data.delete(k) };
  vm.runInContext(fs.readFileSync(new URL('./game/luu.js', import.meta.url), 'utf8'), ctx);
  assert.equal(browser.Luu.saoTot('khoang-cach.8'), 3);
  assert.equal(browser.Luu.saoTot('rap-du.10'), 2);
  assert.equal(browser.Luu.saoTot('me-cung.6'), 3);
  assert.equal(browser.ManHoc.timMa('khoang-cach.8').so, 7);        // HD1: kc.8 đứng thứ 7
  assert.equal(browser.Luu.docNhap('che-tay.1'), null);         // 26/10: che-tay.1 đổi số nhịp (u_turn trước gói Bánh lùi) nên nháp cũ bỏ
  assert.equal(browser.Luu.docNhap('hai-banh.1').chinh[0], 'wait()');
  browser.Luu.ghiNhap('che-tay.1', { chinh: ['new()'], hamCuaMan: [] });
  assert.equal(browser.Luu.docNhap('che-tay.1').chinh[0], 'new()');
});

// ---------------------------------------------------------------- MÙA 4 = 10 GÓI (29/10, KE-HOACH-MUA-4.md, đang dựng, ẩn): thứ tự gói, part mở dần
// Chạy với --loi-gia-mua-4: cắm bốn lỗi giả vào dữ liệu đã nạp (sau khi các mục trước đã xanh), mục mùa 4 phải ĐỎ cả (a)–(d) rồi dừng.
const LOI_GIA_4 = process.argv.includes('--loi-gia-mua-4');
// Bảng mục 2 KE-HOACH-MUA-4.md: [mã gói, loại, [[chương, màn CÓ SẴN theo thứ tự]]]. Màn mới của các tệp ngân hàng mùa 4 (TEP_MUA_4) nối sau màn có sẵn
// (chen trước màn trùm có sẵn cuối chương).
const BANG_MUA_4 = [
  ['drone', 'bo-phan', [['drone', day('drone', [1, 2, 3, 7, 8, 9])], ['list', day('list', MUOI)]]],
  ['may-son', 'bo-phan', [['may-son', day('may-son', [1, 2, 6, 7])], ['che-list', day('che-list', MUOI)]]],
  ['mau', 'bo-phan', [['mau', day('mau', MUOI)], ['che-mau', day('che-mau', MUOI)]]],
  ['pho-mau', undefined, [['pho-mau', []], ['che-pho-mau', []]]],
  ['tram-sac', 'bo-phan', [['tram-sac', day('drone', [4, 5, 6, 10])], ['che-drone', day('che-drone', MUOI)]]],
  ['net-lien', 'bo-phan', [['net-lien', day('may-son', [3, 4, 5, 8, 9, 10])], ['che-may-son', day('che-may-son', MUOI)]]],
  ['flycam', 'bo-phan', [['flycam', day('flycam', MUOI)], ['che-flycam', []]]],
  ['doi-nam-cham', 'thu-thach', [['doi-nam-cham', day('doi-nam-cham', MUOI)], ['che-doi-nam-cham', day('che-doi-nam-cham', MUOI)]]],
  ['son-tren-cao', 'thu-thach', [['son-tren-cao', []], ['che-son-tren-cao', []]]],
  ['drone-ke-vach', 'thu-thach', [['tong-hop-4', []], ['trum-mua-4', []]]]
];
const TEP_MUA_4 = ['manCatCanh', 'manChamSon', 'manCameraBonHuong', 'manPhoMau', 'manTramSac', 'manNetLien', 'manNhinDuoiChan', 'manDoiChiaHang', 'manSonTrenCao', 'manTrumMua4'];
const moiMua4 = TEP_MUA_4.flatMap(k => M[k] || []);
const manBang4 = (c, coSan) => {
  const them = moiMua4.filter(m => m.chuong === c).sort((a, b) => a.so - b.so).map(m => m.ma);
  const cuoi = coSan[coSan.length - 1];
  return cuoi && them.length && get(cuoi).hang === 'trum' ? coSan.slice(0, -1).concat(them, [cuoi]) : coSan.concat(them);
};
const goi4Bang = BANG_MUA_4.map(([ma, , ds]) => [ma, ds.map(([c, coSan]) => [c, manBang4(c, coSan)]).filter(x => x[1].length)]).filter(x => x[1].length);
// Part mùa 1–4 (bảng chuẩn KE-HOACH-7-MUA.md): mùa 4 thêm drone, máy sơn, camera trước / cảm biến màu / camera bụng drone, pin.
const PART_4 = { than: ['hai-banh', 'xich', 'nhen', 'drone'], tay: ['kep', 'xoay', 'hoi', 'nam-cham', 'son'],
  camBien: ['khoang-cach', 'hong-ngoai', 'cam-ung-tu', 'tu', 'mau', 'camera', 'camera-bay', 'pin'] };
// Lệnh của part ngoài mùa 4 (omni, máy ném, bánh gai, loa, âm thanh): không được gọi, kể cả qua hàm của em; không có trên khay.
const CAM_4 = ['slide_left', 'slide_right', 'aim', 'throw', 'load', 'beat', 'note', 'listen', 'spike', 'retract'];
const goi4 = () => goiMua('mua-4');
const chuongMua4Nay = () => new Set(goi4().flatMap(g => g.chuong));
const manMua4 = () => M.danhSach.filter(m => chuongMua4Nay().has(m.chuong));
/** Vị trí (trong danhSach) màn đầu của gói thứ k (1–10) của MUA_4, hay của gói có màn đầu tiên sau nó; hết mùa 4 thì màn đầu sau mùa 4. */
function mocGoi4(k) {
  for (let i = k - 1; i < M.mua4.length; i++) {
    const ch = M.mua4[i].chuong.map(c => c[0]);
    const m = M.danhSach.find(x => ch.includes(x.chuong));
    if (m) return viTriMan(m);
  }
  const ds = manMua4();
  return ds.length ? viTriMan(ds[ds.length - 1]) + 1 : M.danhSach.length;
}
let hong4 = 0;
const kiem4 = (ten, fn) => { try { fn(); dat++; } catch (e) { hong4++; console.log('  HỎNG ' + ten + '\n       ' + (e && e.message ? e.message.split('\n')[0] : e)); } };
if (LOI_GIA_4) {
  // (a) đổi chỗ hai màn gói 1; (b) lệnh omni trên khay drone.1; (c) pen_down trên khay may-son.1 (gói 2); (d) ô sạc P ở sân drone.1 (gói 1).
  const a = get('drone.1'), b = get('drone.2'); [a.so, b.so] = [b.so, a.so]; M.tinhLai();
  get('drone.1').hamGoc = (get('drone.1').hamGoc || []).concat(['slide_left']);
  get('may-son.1').hamGoc = (get('may-son.1').hamGoc || []).concat(['pen_down']);
  const d1 = get('drone.1'); d1.san = Array.isArray(d1.san[0]) ? d1.san.map(s => s.map((r, i) => i === 0 ? 'P' + r.slice(1) : r)) : d1.san.map((r, i) => i === 0 ? 'P' + r.slice(1) : r);
}
kiem4('(a) mùa 4 đúng các gói / chương đang có màn theo bảng, đúng thứ tự màn; MUA_4 khai đủ 10 gói × 2 chương, đúng loại; mùa 4 và mùa 5 ẩn; gói cũ ngoài khuôn ở mùa 5', () => {
  assert.deepEqual(M.mua4.map(g => [g.ma, g.loai, g.chuong.map(c => c[0])]), BANG_MUA_4.map(([ma, loai, ds]) => [ma, loai, ds.map(c => c[0])]), 'MUA_4 khác bảng');
  assert.deepEqual(goi4().map(g => [g.ma, g.chuong]), goi4Bang.map(([ma, ds]) => [ma, ds.map(c => c[0])]), 'gói / chương mùa 4');
  for (const [, ds] of goi4Bang) for (const [c, dsMa] of ds) assert.deepEqual(M.danhSach.filter(m => m.chuong === c).map(m => m.ma), dsMa, c);
  for (const m of moiMua4) assert.ok(BANG_MUA_4.some(([, , ds]) => ds.some(c => c[0] === m.chuong)), m.ma + ' thuộc chương ngoài bảng');
  for (const ma of ['mua-4', 'mua-5']) assert.equal(TT.mua.find(x => x.ma === ma).an, true, ma + ' phải còn ẩn');
  for (const g of goi4()) assert.equal(g.sao, undefined, g.ma + ' khai cứng ngưỡng sao (mùa 4 đang dựng: tự tính)');
  for (const ma of ['omni', 'may-nem', 'ban-xoay', 'rap-du', 'dua-robot']) assert.equal(TT.goi.find(g => g.ma === ma).mua, 'mua-5', ma + ' phải ở mùa 5');
  assert.equal(goiMua('mua-5')[0].sao, 0, 'gói đầu mùa 5 cần 0 sao');
});
kiem4('(b) robot mùa 4: chỉ part mùa 1–4 (thân hai bánh / xích / nhện / drone; tay + máy sơn; cảm biến + màu / camera / pin); không omni, máy ném, loa, bánh gai trên khay hay trong lời giải', () => {
  for (const m of manMua4()) {
    for (const r of [m.robot].concat((m.doi || []).map(d => d.robot)).filter(Boolean)) {
      if (r.than) assert.ok(PART_4.than.includes(r.than), m.ma + ' thân ' + r.than);
      if (r.tay) assert.ok(PART_4.tay.includes(r.tay), m.ma + ' tay ' + r.tay);
      for (const c of r.camBien || []) assert.ok(PART_4.camBien.includes(c.ma), m.ma + ' cảm biến ' + c.ma);
    }
    for (const h of (m.hamGoc || []).concat((m.doi || []).flatMap(d => d.hamGoc || []))) assert.ok(!CAM_4.includes(h), m.ma + ' khay có ' + h);
    const goi = [...loiGoi(dongBacCau(m).dong)].filter(t => CAM_4.includes(t));
    assert.deepEqual(goi, [], m.ma + ' gọi lệnh ngoài mùa 4');
  }
});
kiem4('(c) bút liền mở ở gói 6: không pen_down / pen_up trên khay hay trong lời giải (bắc cầu) của màn mùa 4 đứng trước gói 6', () => {
  const sai = [], dau4 = mocGoi4(1), moc = mocGoi4(6);
  for (const m of M.danhSach.slice(dau4, moc)) {
    const khay = (m.hamGoc || []).concat((m.doi || []).flatMap(d => d.hamGoc || []));
    for (const t of ['pen_down', 'pen_up']) {
      if (khay.includes(t)) sai.push(m.ma + ' khay có ' + t);
      if (loiGoi(dongBacCau(m).dong).has(t)) sai.push(m.ma + ' gọi ' + t);
    }
  }
  assert.deepEqual(sai, [], sai.length + ' chỗ: ' + sai.slice(0, 6).join(' · '));
});
kiem4('(d) ô sạc P mở ở gói 5 (đáp đất sạc là nâng cấp drone): không sân nào của màn mùa 4 đứng trước gói 5 có ô P', () => {
  const sai = [], dau4 = mocGoi4(1), moc = mocGoi4(5);
  for (const m of M.danhSach.slice(dau4, moc)) if (dsSanCua(m).some(s => s.join('').includes('P'))) sai.push(m.ma);
  assert.deepEqual(sai, [], sai.length + ' màn: ' + sai.join(' · '));
});
if (LOI_GIA_4) {
  console.log('Lỗi giả mùa 4: HỎNG ' + hong4 + ' / 4 mục (a)–(d).');
  process.exit(hong4 === 4 ? 0 : 1);
}

console.log('ĐẠT ' + dat + ' kiểm tra lộ trình xuất bản.');
