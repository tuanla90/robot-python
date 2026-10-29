// Kiểm tra lộ trình XUẤT BẢN, bổ sung cho các kiểm tra ngân hàng bài gốc.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

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
const chuongTam = new Set([...chuongMua1, ...chuongMua2, 'che-xich']);
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
const NHIEU_SAN_KHONG_TRUM = ['cam-bien-ben.10', 'khoang-cach.12', 'khoang-cach.13', 'che-cam-bien.1', 'che-cam-bien.2', 'che-cam-bien.4', 'cam-bien-ben.7', 'me-cung.6'];
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
  for (const ma of ['khoang-cach.1', 'khoang-cach.2', 'vong-lap.1']) assert.ok(get(ma).chiChay && get(ma).chinhCoDinh, ma + ' là màn trình diễn (chiChay)');
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
  ['banh-lui', [['banh-lui', day('che-xe', [4, 5, 6, 7, 8, 9]).concat(day('banh-lui', [1, 2, 3, 4]))], ['che-banh-lui', ['che-xe.10'].concat(day('che-tay', [5, 7, 9]), day('che-lap', [7, 9]), day('che-banh-lui', [1, 2, 3, 4]))]]],
  ['tay-xoay', [['tay-xoay', day('tay-xoay', MUOI)], ['che-tay-xoay', day('che-tay-xoay', MUOI)]]],
  ['me-cung', [['cam-bien-ben', ['che-cam-bien.4'].concat(day('cam-bien-ben', [1, 2, 3, 4, 5, 6, 7, 8, 9]))], ['me-cung', day('me-cung', MUOI)]]],
  ['hai-robot', [['hai-robot', day('hai-robot', MUOI)], ['che-hai-robot', day('che-hai-robot', MUOI)]]],
  ['combo', [['combo', day('combo', MUOI)], ['che-combo', day('che-combo', [1, 2, 3, 4, 5, 6, 7, 8, 9]).concat('che-cam-bien.10')]]],
  ['robot', [['robot-hoan-thien', day('robot-hoan-thien', [1, 2, 3, 4, 5, 6, 7, 8, 11]).concat('cam-bien-ben.10')], ['trum-mua-1', day('trum-mua-1', MUOI)]]]
];
const CAT_MUA_1 = ['vong-lap.7', 'che-lap.1', 'che-lap.2', 'che-lap.3', 'che-lap.4', 'che-lap.6', 'che-lap.8', 'che-lap.10', 'khoang-cach.7', 'che-cam-bien.8', 'robot-hoan-thien.10', 'khoang-cach.4', 'khoang-cach.9'];
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
  assert.equal(goiCuaChuong('che-xich').mua, 'mua-3');
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
kiem('(f) gói đội tay xoay (cần nam châm) không ở mùa 1, đứng sau gói Đội nam châm', () => {
  const g = TT.goi.find(x => x.ma === 'doi-tay-xoay');
  assert.ok(g && g.mua !== 'mua-1', 'doi-tay-xoay ở ' + (g && g.mua));
  assert.equal(TT.goi[TT.goi.indexOf(g) - 1].ma, 'doi-nam-cham');
  assert.ok(TT.thuTu.indexOf('doi-tay-xoay') > TT.thuTu.indexOf('che-nam-cham'));
  for (const c of g.chuong) assert.ok(!chuongMua1.has(c), c);
});

// ---------------------------------------------------------------- MÙA 2 = 10 GÓI (27/10, KE-HOACH-MUA-2.md): thứ tự gói, ràng buộc Python / part theo gói
// Chạy với --loi-gia-mua-2: cắm sáu lỗi giả vào dữ liệu đã nạp, mục mùa 2 phải ĐỎ cả (a)–(f) rồi dừng (không chạy phần sau).
const LOI_GIA_2 = process.argv.includes('--loi-gia-mua-2');
// Bảng mục 2 KE-HOACH-MUA-2.md: [mã gói, [[chương, màn CÓ SẴN theo thứ tự]]]. Màn mới của các tệp ngân hàng mùa 2 (TEP_MUA_2) nối sau màn có sẵn.
const BANG_MUA_2 = [
  ['xich', [['xich', day('xich', MUOI)], ['bien-xich', ['che-xich.1', 'che-xich.2', 'che-xich.6', 'che-xich.8'].concat(BIEN_MUA_2, ['che-xich.9'])]]],
  ['sung-hoi', [['sung-hoi', day('sung-hoi', MUOI)], ['tham-so', day('tham-so', MUOI)]]],
  ['hong-ngoai', [['hong-ngoai', []], ['che-hong-ngoai', []]]],
  ['nha-may', [['bang-chuyen', day('bang-chuyen', MUOI)], ['che-sung-hoi', day('che-sung-hoi', MUOI)]]],
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
kiem2('(a) mùa 2 đúng các gói / chương đang có màn theo bảng, đúng thứ tự màn; MUA_2 khai đủ 10 gói × 2 chương; mùa 2 ẩn; ngưỡng sao không khai cứng', () => {
  assert.deepEqual(M.mua2.map(g => [g.ma, g.chuong.map(c => c[0])]), BANG_MUA_2.map(([ma, ds]) => [ma, ds.map(c => c[0])]), 'MUA_2 khác bảng mục 2');
  assert.deepEqual(goiMua('mua-2').map(g => [g.ma, g.chuong]), goi2Bang.map(([ma, ds]) => [ma, ds.map(c => c[0])]), 'gói / chương mùa 2');
  for (const [, ds] of goi2Bang) for (const [c, dsMa] of ds) assert.deepEqual(M.danhSach.filter(m => m.chuong === c).map(m => m.ma), dsMa, c);
  assert.deepEqual(TT.thuTu.slice(chuongMua1.size, chuongMua1.size + chuongMua2.size), goi2Bang.flatMap(([, ds]) => ds.map(c => c[0])), 'chương mùa 2 đứng ngay sau mùa 1');
  for (const m of moiMua2) assert.ok(BANG_MUA_2.some(([, ds]) => ds.some(c => c[0] === m.chuong)), m.ma + ' thuộc chương ngoài bảng');
  assert.equal(TT.mua.find(x => x.ma === 'mua-2').an, true, 'mùa 2 phải còn ẩn');
  for (const g of goiMua('mua-2')) assert.equal(g.sao, undefined, g.ma + ' khai cứng sao (mùa 2 đang dựng: để mo-goi.js tính TI_LE_SAO)');
  // Chương cũ của mùa 2 ngoài bảng ở mùa ẩn
  for (const c of ['ban-xoay', 'nhen', 'doi-ho-bang', 'list', 'doi-xich', 'omni', 'doi-omni', 'che-xich']) assert.equal(goiCuaChuong(c).mua, 'mua-3', c);
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
if (LOI_GIA_2) {
  console.log('Lỗi giả mùa 2: HỎNG ' + hong2 + ' / 6 mục (a)–(f).');
  process.exit(hong2 === 6 ? 0 : 1);
}
if (hong2) { console.log('Mùa 2: HỎNG ' + hong2 + ' mục.'); process.exit(1); }

// 26/10: chương cam-bien-ben = che-cam-bien.4 (chế to_gap) + cam-bien-ben 1–9, đều một sân; trùm ba sân cũ cam-bien-ben.10 sang chương Tổng hợp.
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
  assert.equal(TT.thuTu.indexOf('doi-ho-bang'), TT.thuTu.indexOf('che-nhen') + 1);
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
  assert.equal(ds[6].man[0].ma, 'che-cam-bien.4');
  assert.equal(ds[6].man[19].ma, 'me-cung.10');
  assert.equal(browser.MoGoi.goiTheoMa('rap-du').saoCan, 90);
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

console.log('ĐẠT ' + dat + ' kiểm tra lộ trình xuất bản.');
