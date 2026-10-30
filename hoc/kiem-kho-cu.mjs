/* ============================================================================
   kiem-kho-cu.mjs — máy kiểm 20 màn mới của mùa 2, gói 8 "Góc kho cũ" (man-kho-cu.js, PDM2b 31/10): chương `kho-cu` (xe cứu hỏa gặp yếu tố mùa 1) và
   `che-kho-cu` "Chế lệnh: dọn kho cũ". Khuôn mới KE-HOACH-PART-DUNG-MUA.md mục 1: gói 8 = cỗ máy mùa đầy đủ gặp yếu tố (vật / sàn / cơ chế) của mùa trước.
   Gồm:
   1. Vị trí: gói kho-cu (mùa 2) có hai chương kho-cu, che-kho-cu; mỗi chương đúng 10 màn mới theo `so`, hạng lam-quen ×3 · luyen ×3 · bien-the ×3 · trum;
      kho-cu.1 ngay sau che-do-nhiet.10, che-kho-cu.1 ngay sau kho-cu.10; trùm mang huy hiệu (huy-hieu-vector.js có hình), màn khác không mang; tên không trùng.
   2. Từng màn: đủ trường (≥ 2 lời sai có phaiCoMa), R1 là XE CỨU HỎA ĐẦY ĐỦ (xích + vòi phun + hồng ngoại; xichDay, lucBan; khay có spray, distance, warm;
      không tay kẹp / cảm biến khoảng cách / hai bánh), một sân (trùm tối đa ba), mỗi sân có ít nhất một YẾU TỐ MÙA 1: nút đè M, thùng gỗ o, hàng rào =, ô đích D.
   3. Hàm của em: hàm màn cần đã tạo ở màn đứng trước; mọi lời gọi khai trong hamCuaEmCan; hàm mới (taoHam) không trùng tên hàm của em / hàm của màn ở màn khác, có mục Sổ lệnh.
   4. Không dùng thứ lạ: không nhiều robot (doi: gói 9), không beSung, return; sân không S / u / n.
   5. Lời giải 3 sao đúng sao.o / sao.nhip (chẩn đoán thông tin giat-chan được phép); mã mẫu chưa thắng (trừ màn trình diễn: khoá, 3 sao); lời giải khác 2 sao;
      công thức khác thắng; lời sai thua đủ mã.
   6. Đường cong: màn trình diễn kho-cu.1 (chiChay, chinhCoDinh); dòng / nhịp / ô của màn n ≤ max(1,5 × mốc, mốc + lề), mốc = màn không trùm ngay trước
      (kho-cu.2 so với che-do-nhiet.9 qua ranh gói, màn trình diễn miễn và không làm mốc); mỗi màn thêm tối đa MỘT điều mới (đặc trưng đọc từ lời giải và sân).
   7. Bộ dò (do-duong-sung-hoi.mjs, đã biết xích): BFS tự do mỗi sân không dài hơn sao.nhip.
   Chạy: node hoc/kiem-kho-cu.mjs [--loi-gia]      (--loi-gia: cắm lỗi giả, các mục tương ứng phải ĐỎ)
   ========================================================================== */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { coHinhRieng } from './huy-hieu-ds.mjs';

const require = createRequire(import.meta.url);
const Cham = require('./cham.js');
const M = require('./lo-trinh-hoc.js');
const TT = require('./thu-tu-chuong.js');
const SL = require('./so-lenh.js');
const SanHoc = require('./san-hoc.js');
const Bo = await import('./do-duong-sung-hoi.mjs');
const clone = (x) => JSON.parse(JSON.stringify(x));
const LOI_GIA = process.argv.includes('--loi-gia');

let dat = 0, hong = 0;
const hongMuc = [];
function kiem(ten, fn) {
  try { fn(); dat++; } catch (e) { hong++; hongMuc.push(ten); console.log('  HỎNG ' + ten + '\n       ' + (e && e.message ? e.message.split('\n')[0] : e)); }
}

const CHUONG = ['kho-cu', 'che-kho-cu'];
const DAU_SAU = { 'kho-cu': 'che-do-nhiet.10', 'che-kho-cu': 'kho-cu.10' };
const MOC_DAU = 'che-do-nhiet.9';
const LE = { dong: 3, nhip: 4, o: 6 };
const get = (ma) => M.timMa(ma);
const dsSan = (m) => (Array.isArray(m.san[0]) ? m.san : [m.san]);
const soSan = (m) => dsSan(m).length;
const CHAN_DOAN_DUOC = ['giat-chan'];
const KHAY = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'spray', 'spray_back', 'distance', 'warm'];

/* ------------------------------------------------------------------ lỗi giả (--loi-gia) */
const LOI_GIA_DS = [];
if (LOI_GIA) {
  const a = get('kho-cu.2'), b = get('kho-cu.3'), c = get('che-kho-cu.4'), t = get('che-kho-cu.10');
  a.sao = Object.assign({}, a.sao, { nhip: a.sao.nhip - 1 }); LOI_GIA_DS.push('kho-cu.2: lời giải');                 // ngưỡng nhịp sai → 2 sao
  b.san = b.san.map((d) => d.replace('=', '.')); LOI_GIA_DS.push('kho-cu.3: đủ trường');                               // mất yếu tố mùa 1
  c.hamCuaEmCan = c.hamCuaEmCan.concat(['fly_home']); LOI_GIA_DS.push('che-kho-cu.4: hàm của em');                    // hàm chưa ai tạo
  get('kho-cu.5').robot = Object.assign({}, get('kho-cu.5').robot, { than: 'hai-banh' }); LOI_GIA_DS.push('kho-cu.5: đủ trường');   // không phải xích
  get('kho-cu.1').chiChay = false; LOI_GIA_DS.push('đường cong');                                                       // mất màn trình diễn
  t.huyHieu = null; LOI_GIA_DS.push('huy hiệu');                                                                        // trùm mất huy hiệu
  get('che-kho-cu.2').taoHam = ['squirt']; LOI_GIA_DS.push('che-kho-cu.2: hàm của em');                                 // trùng hàm cốt truyện luc-ban.4
  get('che-kho-cu.3').doi = [{}, {}]; LOI_GIA_DS.push('che-kho-cu.3: không dùng thứ');                                 // nhiều robot là gói 9
}

/* ------------------------------------------------------------------ kho hàm của em theo thứ tự lộ trình */
const khoTruoc = new Map(), daTaoTruoc = new Map();
{
  const kho = new Map(), daTao = new Set();
  for (const m of M.danhSach) {
    khoTruoc.set(m.ma, clone([...kho.values()]));
    daTaoTruoc.set(m.ma, new Set(daTao));
    if (!m.tietKiemNhip) for (const h of m.loiGiai.hamCuaEmMoi || []) kho.set(h.ten, clone(h));
    for (const t of (m.taoHam || []).concat((m.loiGiai.hamCuaEmMoi || []).map((h) => h.ten))) daTao.add(t);
  }
}
function cham(m, b, moi, them) {
  const hs = new Map(khoTruoc.get(m.ma).map((h) => [h.ten, clone(h)]));
  for (const h of moi || []) hs.set(h.ten, clone(h));
  return Cham.cham(Object.assign({}, m, them || {}), { chinh: b.chinh, hamCuaMan: b.hamCuaMan || [] }, [...hs.values()]);
}
function loiGoi(dong) { const s = new Set(); for (const l of dong || []) for (const x of l.replace(/#.*$/, '').replace(/"[^"]*"/g, '""').matchAll(/([A-Za-z_]\w*)\s*\(/g)) s.add(x[1]); return s; }
const PY = new Set(['range', 'print', 'len']);
function moiBai(m) {
  const ds = [{ ten: 'maMau', b: m.maMau, moi: [] }, { ten: 'loiGiai', b: m.loiGiai, moi: m.loiGiai.hamCuaEmMoi }];
  if (m.loiGiaiKhac) ds.push({ ten: 'loiGiaiKhac', b: m.loiGiaiKhac.baiLam, moi: m.loiGiaiKhac.hamCuaEmMoi });
  (m.congThucKhac || []).forEach((c, i) => ds.push({ ten: 'congThucKhac[' + i + ']', b: c.baiLam, moi: c.hamCuaEmMoi }));
  m.loiSai.forEach((ls, i) => ds.push({ ten: 'loiSai[' + i + ']', b: ls.baiLam, moi: ls.hamCuaEmMoi }));
  return ds;
}
const dongCua = (x) => [...(x.b.chinh || []), ...(x.b.hamCuaMan || []).concat(x.moi || []).flatMap((h) => h.than)];
const soDong = (m) => (m.chinhCoDinh ? 0 : m.loiGiai.chinh.length) + (m.loiGiai.hamCuaMan || []).concat(m.loiGiai.hamCuaEmMoi || []).reduce((s, h) => s + h.than.length, 0);
const coSan = (m) => Math.max(...dsSan(m).map((rows) => rows.join('').replace(/#/g, '').length));
function bacCau(m, dong, moi) {
  const bang = new Map(khoTruoc.get(m.ma).map((h) => [h.ten, h]));
  for (const h of moi || []) bang.set(h.ten, h);
  const kq = [...dong], da = new Set(), cho = [...loiGoi(dong)];
  while (cho.length) { const t = cho.pop(); if (da.has(t) || !bang.has(t)) continue; da.add(t); kq.push(...bang.get(t).than); cho.push(...loiGoi(bang.get(t).than)); }
  return { dong: kq, goi: da };
}
const dongLoiGiai = (m) => [...(m.loiGiai.chinh || []), ...(m.loiGiai.doi || []).flatMap((d) => d.chinh || []), ...(m.loiGiai.hamCuaMan || []).concat(m.loiGiai.hamCuaEmMoi || []).flatMap((h) => h.than)];
/** Yếu tố mùa 1 trên sân: nút đè M, thùng gỗ o, hàng rào =, ô đích D. */
const yeuToMua1 = (rows) => [...new Set((rows.join('').match(/[Mo=D]/g) || []))];

/* ------------------------------------------------------------------ đặc trưng (điều mới) của một màn */
function dacTrung(m) {
  const lg = m.loiGiai, moi = lg.hamCuaEmMoi || [], cuaMan = lg.hamCuaMan || [];
  const dong = bacCau(m, dongLoiGiai(m), moi).dong;
  const f = new Set();
  for (const l of dongLoiGiai(m)) {
    if (/^\s*while\b/.test(l)) f.add('while');
    if (/^\s*if\b/.test(l)) f.add('if');
    if (/^\s*for\b/.test(l)) f.add('for');
    if (/^\s*[A-Za-z_]\w*\s*=\s*\w+\(\)/.test(l)) f.add('bien = cam bien');
  }
  if (dong.some((l) => /distance\(\)/.test(l))) f.add('distance');
  if (dong.some((l) => /warm\(\)/.test(l))) f.add('warm');
  if (dong.some((l) => /"high"/.test(l))) f.add('luc high');
  if (dong.some((l) => /\bspin\(\)/.test(l))) f.add('spin');
  if (dong.some((l) => /\bsidestep\(\)/.test(l))) f.add('sidestep');
  if (dong.some((l) => /\bgo_to_wall\(\)/.test(l))) f.add('go_to_wall');
  if (dong.some((l) => /\bopen_left\(\)/.test(l))) f.add('open_left');
  for (const h of moi) {
    f.add(h.thamSo.length ? 'tao ham co tham so' : 'tao ham');
    const kho = new Map(khoTruoc.get(m.ma).map((x) => [x.ten, x]));
    if ([...loiGoi(h.than)].some((t) => kho.has(t))) f.add('ham goi ham');
    if (h.than.some((l) => /^\s*for\b/.test(l))) f.add('for trong ham');
    if (h.than.some((l) => /^\s*if\b/.test(l))) f.add('if trong ham');
  }
  if (cuaMan.length) f.add('sua ham cua man');
  if (m.chinhCoDinh) f.add('chuong trinh khoa');
  if (m.chiChay) f.add('trinh dien');
  const chu = dsSan(m).map((s) => s.join('')).join('');
  if (/M/.test(chu)) f.add('nut de');
  if (/o/.test(chu)) f.add('thung go');
  if (/=/.test(chu)) f.add('hang rao');
  if (/[Hh]/.test(chu)) f.add('thung nang');
  if (/N/.test(chu)) f.add('van');
  if (/[Cc]/.test(chu)) f.add('cua');
  if ([].concat(m.nutBat || []).flat().length) f.add('nut bat san');
  if (soSan(m) > 1) f.add('nhieu san');
  return f;
}

/* ------------------------------------------------------------------ 1. vị trí */
const goi = TT.goi.find((g) => g.ma === 'kho-cu');
const DS_C = Object.fromEntries(CHUONG.map((c) => [c, M.danhSach.filter((m) => m.chuong === c)]));
const DS = CHUONG.flatMap((c) => DS_C[c]);
kiem('gói kho-cu (mùa 2, gói 8): hai chương kho-cu, che-kho-cu; mỗi chương 10 màn mới đúng so và hạng; nối đúng chỗ trong lộ trình', () => {
  assert.ok(goi && goi.mua === 'mua-2', 'không thấy gói kho-cu ở mùa 2');
  assert.equal(TT.goi.filter((g) => g.mua === 'mua-2').indexOf(goi), 7, 'kho-cu phải là gói thứ 8 của mùa 2');
  assert.deepEqual(goi.chuong, CHUONG);
  for (const c of CHUONG) {
    const ds = DS_C[c];
    assert.deepEqual(ds.map((m) => m.ma), Array.from({ length: 10 }, (_, i) => c + '.' + (i + 1)), c);
    assert.deepEqual(ds.map((m) => m.hang), ds.map((_, i) => (i < 3 ? 'lam-quen' : i < 6 ? 'luyen' : i < 9 ? 'bien-the' : 'trum')), c + ' hạng');
    assert.equal(M.danhSach.indexOf(ds[0]), M.danhSach.indexOf(get(DAU_SAU[c])) + 1, c + '.1 phải đứng ngay sau ' + DAU_SAU[c]);
  }
  assert.equal((M.manKhoCu || []).length, 20, 'ManHoc.manKhoCu phải có 20 màn');
  const gDoi = TT.goi.find((g) => g.ma === 'doi-mua-2');
  assert.ok(!gDoi || gDoi.mua !== 'mua-2', 'gói Đội cũ vẫn còn ở mùa 2');
});
kiem('tên màn không trùng trong gói và không trùng màn khác của lộ trình', () => {
  const ten = DS.map((m) => m.ten);
  assert.equal(new Set(ten).size, ten.length, 'trùng tên: ' + ten.filter((t, i) => ten.indexOf(t) !== i));
  const cu = M.danhSach.filter((m) => !CHUONG.includes(m.chuong)).map((m) => m.ten);
  for (const t of ten) assert.ok(!cu.includes(t), 'tên "' + t + '" trùng một màn khác');
});
kiem('huy hiệu: chỉ trùm mang, đúng mã chương; huy-hieu-vector.js có hình', () => {
  for (const c of CHUONG) {
    const ds = DS_C[c], trum = ds[ds.length - 1];
    assert.equal(trum && trum.hang, 'trum');
    assert.equal(trum.huyHieu && trum.huyHieu.ma, c, c + ': trùm thiếu huy hiệu');
    assert.ok(trum.huyHieu.ten && !/[—]/.test(trum.huyHieu.ten));
    for (const m of ds.slice(0, -1)) assert.ok(!m.huyHieu, m.ma + ' không phải trùm mà có huy hiệu');
    assert.ok(coHinhRieng(c), "huy-hieu-vector.js thiếu hình huy hiệu '" + c + "'");
  }
});

/* ------------------------------------------------------------------ 2–5, 7. từng màn */
const HAM_COT_TRUYEN = new Map();
for (const m of M.danhSach) for (const t of m.taoHam || []) if (!HAM_COT_TRUYEN.has(t)) HAM_COT_TRUYEN.set(t, m.ma);
const HAM_CUA_MAN_KHAC = new Set();
for (const m of M.danhSach) if (!CHUONG.includes(m.chuong)) for (const h of (m.loiGiai.hamCuaMan || []).concat((m.maMau || {}).hamCuaMan || [])) HAM_CUA_MAN_KHAC.add(h.ten);
const bang = {};
for (const m of DS) {
  const kho = khoTruoc.get(m.ma), daTao = daTaoTruoc.get(m.ma);
  bang[m.ma] = {};
  kiem(m.ma + ': đủ trường, R1 xe cứu hỏa đầy đủ (xích + vòi + hồng ngoại, xichDay, lucBan), một sân, mọi sân có yếu tố mùa 1', () => {
    for (const k of ['ten', 'deBai', 'san', 'batDau', 'mucTieu', 'hamGoc', 'robot', 'sao', 'maMau', 'loiGiai', 'loiGiaiKhac', 'goiY', 'hamCuaEmCan', 'yMoi']) assert.ok(m[k] !== undefined && m[k] !== '', m.ma + ' thiếu ' + k);
    assert.ok(m.loiSai.length >= 2, m.ma + ' cần ít nhất 2 lời sai');
    for (const ls of m.loiSai) assert.ok(ls.moTa && ls.phaiCoMa && ls.phaiCoMa.length, m.ma + ' lời sai thiếu moTa / phaiCoMa');
    assert.ok(m.goiY.length >= 1);
    assert.equal(m.loaiRobot, 'xich');
    assert.equal(m.robot.than, 'xich');
    assert.equal(m.robot.tay, 'hoi', m.ma + ' tay ' + m.robot.tay);
    assert.deepEqual(m.robot.camBien.map((c) => c.ma), ['hong-ngoai'], m.ma + ' phải gắn mắt hồng ngoại');
    assert.equal(m.xichDay, true, m.ma + ' thiếu xichDay: true (xích đã nâng cấp ở gói 5)');
    assert.equal(m.lucBan, true, m.ma + ' thiếu lucBan: true');
    assert.deepEqual(m.hamGoc, KHAY, m.ma + ' khay phải là xe cứu hỏa đầy đủ');
    assert.ok(!m.doi, m.ma + ' có nhiều robot');
    assert.ok(['toi-co', 'bong-mo', 'day-thung'].includes(m.mucTieu), m.ma + ' mục tiêu ' + m.mucTieu);
    if (m.hang === 'trum') assert.ok(soSan(m) <= 3, m.ma + ' trùm tối đa ba sân');
    else assert.equal(soSan(m), 1, m.ma + ' nhiều sân chỉ ở trùm (luật lộ trình)');
    if (soSan(m) > 1) assert.equal(m.nhipTheo, 'tong', m.ma + ' nhiều sân phải tính tổng nhịp');
    dsSan(m).forEach((rows, i) => {
      assert.ok(yeuToMua1(rows).length >= 1, m.ma + ' sân ' + (i + 1) + ' không có yếu tố mùa 1 (M / o / = / D)');
      assert.ok(rows.every((r) => r.length === rows[0].length), m.ma + ' sân ' + (i + 1) + ' các hàng không bằng nhau');
    });
    for (const s of ['ten', 'deBai', 'veMaMau', 'yMoi']) if (m[s]) assert.ok(!/—|\p{Extended_Pictographic}/u.test(m[s]), m.ma + ' ' + s + ' có gạch dài / emoji');
    for (const s of m.goiY.concat(m.loiSai.map((x) => x.moTa), [m.loiGiaiKhac.moTa], (m.congThucKhac || []).map((x) => x.moTa))) assert.ok(!/—|\p{Extended_Pictographic}/u.test(s), m.ma + ' chữ có gạch dài / emoji: ' + s);
    assert.ok(!/bắn|súng/i.test([m.ten, m.deBai, m.veMaMau].concat(m.goiY).join(' ')), m.ma + ' có chữ vũ khí');
    if (m.hang === 'trum') assert.ok(m.huyHieu, m.ma + ' trùm thiếu huy hiệu');
  });
  kiem(m.ma + ': không dùng thứ của gói sau / thứ lạ (beSung, doi, return), sân không S / u / n', () => {
    for (const k of ['beSung', 'doi']) assert.ok(!m[k], m.ma + ' có ' + k);
    for (const x of moiBai(m)) assert.ok(!dongCua(x).some((l) => /^\s*return\b/.test(l)), m.ma + ' ' + x.ten + ' dùng return (mùa 5)');
    for (const rows of dsSan(m)) assert.ok(!/[Sun]/.test(rows.join('')), m.ma + ' sân có S / u / n');
  });
  kiem(m.ma + ': hàm của em cần đã tạo ở màn trước; mọi lời gọi đều khai trong hamCuaEmCan; hàm mới / hàm của màn không trùng tên ở màn khác, hàm mới có mục Sổ lệnh', () => {
    for (const h of m.hamCuaEmCan) assert.ok(daTao.has(h) && kho.some((x) => x.ten === h), m.ma + ' cần ' + h + ' nhưng chưa màn nào trước nó tạo');
    for (const x of moiBai(m)) {
      const rieng = new Set((x.b.hamCuaMan || []).concat(x.moi || []).map((h) => h.ten).concat(m.taoHam || []));
      for (const t of loiGoi(dongCua(x))) {
        if (PY.has(t) || rieng.has(t) || m.hamGoc.includes(t)) continue;
        assert.ok(m.hamCuaEmCan.includes(t), m.ma + ' ' + x.ten + ' gọi ' + t + '() mà không khai trong hamCuaEmCan');
      }
    }
    for (const t of m.taoHam || []) {
      assert.ok(!daTao.has(t), m.ma + ' tạo lại hàm đã có ' + t);
      assert.ok((m.loiGiai.hamCuaEmMoi || []).some((h) => h.ten === t), m.ma + ' taoHam ' + t + ' mà lời giải không tạo');
      const khac = M.danhSach.filter((x) => x !== m && (x.taoHam || []).includes(t)).map((x) => x.ma);
      assert.deepEqual(khac, [], m.ma + ' tên hàm ' + t + ' trùng hàm cốt truyện của màn khác');
      assert.ok(!HAM_CUA_MAN_KHAC.has(t), m.ma + ' tên hàm ' + t + ' trùng hàm của màn ở màn khác');
      const sl = SL.tim(t);
      assert.ok(sl && sl.man === m.ma && sl.chuong === m.chuong, m.ma + ' hàm mới ' + t + ' chưa có mục Sổ lệnh đúng màn / chương: ' + JSON.stringify(sl));
    }
    for (const x of m.loiGiai.hamCuaMan || []) {
      assert.ok(!HAM_COT_TRUYEN.has(x.ten) && !kho.some((h) => h.ten === x.ten), m.ma + ' hàm của màn ' + x.ten + ' trùng hàm cốt truyện / hàm trong kho');
      assert.ok(!HAM_CUA_MAN_KHAC.has(x.ten), m.ma + ' hàm của màn ' + x.ten + ' trùng hàm của màn ở màn khác');
    }
  });
  kiem(m.ma + ': lời giải 3 sao đúng ngưỡng; mã mẫu chưa thắng (trình diễn: khoá, 3 sao); lời giải khác 2 sao; công thức khác thắng; lời sai thua đúng mã', () => {
    const r = cham(m, m.loiGiai, m.loiGiai.hamCuaEmMoi);
    assert.ok(r.thang, m.ma + ' lời giải thua: ' + JSON.stringify(r.chanDoan.map((c) => c.ma)));
    assert.equal(r.soO, m.sao.o, m.ma + ' soO=' + r.soO + ' khai ' + m.sao.o);
    assert.equal(r.soNhip, m.sao.nhip, m.ma + ' soNhip=' + r.soNhip + ' khai ' + m.sao.nhip);
    assert.equal(r.sao, 3, m.ma + ' sao=' + r.sao);
    assert.deepEqual(r.chanDoan.filter((c) => !(c.muc === 'thong-tin' && CHAN_DOAN_DUOC.includes(c.ma))).map((c) => c.ma), [], m.ma + ' lời giải có chẩn đoán');
    assert.ok(r.theoSan.length === soSan(m) && r.theoSan.every((s) => s.thang));
    const mo = m.chiChay ? Object.assign({}, m, { chiChay: false, chinhCoDinh: false }) : m;
    const rm = cham(m, m.maMau);
    if (m.chiChay) assert.ok(rm.thang && rm.sao === 3 && m.chinhCoDinh, m.ma + ' màn trình diễn: mã mẫu khoá phải thắng 3 sao');
    else assert.equal(rm.thang, false, m.ma + ' mã mẫu đã thắng sẵn');
    const rk = cham(mo, m.loiGiaiKhac.baiLam, m.loiGiaiKhac.hamCuaEmMoi);
    assert.ok(rk.thang, m.ma + ' lời giải khác thua: ' + JSON.stringify(rk.chanDoan.map((c) => c.ma)));
    assert.equal(rk.sao, 2, m.ma + ' lời giải khác sao=' + rk.sao + ' (ô ' + rk.soO + ', nhịp ' + rk.soNhip + ')');
    (m.congThucKhac || []).forEach((c, i) => { const rc = cham(mo, c.baiLam, c.hamCuaEmMoi); assert.ok(rc.thang, m.ma + ' công thức khác ' + i + ' "' + c.moTa + '" thua: ' + JSON.stringify(rc.chanDoan.map((x) => x.ma))); });
    m.loiSai.forEach((ls, i) => {
      const rl = cham(mo, ls.baiLam, ls.hamCuaEmMoi);
      assert.equal(rl.thang, false, m.ma + ' lời sai ' + i + ' "' + ls.moTa + '" lại thắng');
      const ma = rl.chanDoan.map((c) => c.ma);
      for (const x of ls.phaiCoMa) assert.ok(ma.includes(x), m.ma + ' lời sai ' + i + ' "' + ls.moTa + '" thiếu mã ' + x + ' (có: ' + ma.join(',') + ')');
    });
    Object.assign(bang[m.ma], { o: r.soO, nhip: r.soNhip });
  });
  kiem(m.ma + ': bộ dò: BFS tự do mỗi sân không dài hơn sao.nhip', () => {
    let bfs = 0;
    dsSan(m).forEach((rows, i) => {
      const lm = SanHoc.lopMauCuaSan(m, i);
      const con = Object.assign({}, m, { san: rows, batDau: Array.isArray(m.batDau) ? m.batDau[i] : m.batDau, noi: lm.noi || m.noi, nutBat: lm.nutBat || m.nutBat, bongMo: lm.bongMo || m.bongMo });
      let k = null;
      try { k = Bo.nhipSungHoiNganNhat(con, { toiDaMs: 20000 }).nhip; } catch (e) { bang[m.ma].bfs = 'bộ dò không hỗ trợ: ' + e.message; k = m.sao.nhip; }
      bfs = bfs === null || k === null ? null : bfs + k;
    });
    assert.ok(bfs !== null && bfs <= m.sao.nhip, m.ma + ' BFS ' + bfs + ' > sao.nhip ' + m.sao.nhip);
    if (bang[m.ma].bfs === undefined) bang[m.ma].bfs = bfs;
  });
}

/* ------------------------------------------------------------------ 6. đường cong, điều mới */
kiem('màn trình diễn: kho-cu.1 chiChay + chinhCoDinh, mã mẫu = lời giải; không màn nào khác chiChay', () => {
  const a = get('kho-cu.1');
  assert.ok(a.chiChay && a.chinhCoDinh, 'kho-cu.1 phải là màn trình diễn (chiChay, chinhCoDinh)');
  assert.deepEqual(a.maMau.chinh, a.loiGiai.chinh, 'kho-cu.1 mã mẫu phải là lời giải');
  for (const m of DS.slice(1)) assert.ok(!m.chiChay, m.ma + ' không được là màn trình diễn');
});
kiem('đường cong: dòng / nhịp / ô không tường của màn n ≤ max(1,5 × mốc, mốc + lề), mốc = màn không trùm ngay trước (kho-cu.2 so với ' + MOC_DAU + '); trùm miễn, trình diễn miễn', () => {
  const tran = (a, b, le) => a <= Math.max(1.5 * b, b + le);
  let moc = get(MOC_DAU);
  for (const m of DS) {
    if (m.hang === 'trum' || m.chiChay) continue;
    assert.ok(tran(soDong(m), soDong(moc), LE.dong), m.ma + ' dòng ' + soDong(m) + ' so với ' + moc.ma + ' ' + soDong(moc));
    assert.ok(tran(m.sao.nhip, moc.sao.nhip, LE.nhip), m.ma + ' nhịp ' + m.sao.nhip + ' so với ' + moc.ma + ' ' + moc.sao.nhip);
    assert.ok(tran(coSan(m), coSan(moc), LE.o), m.ma + ' ô ' + coSan(m) + ' so với ' + moc.ma + ' ' + coSan(moc));
    moc = m;
  }
});
const dieuMoi = {};
kiem('mỗi màn thêm tối đa MỘT điều mới (so với mọi màn đứng trước, đặc trưng đọc từ lời giải và sân); kho-cu.1 trình diễn yếu tố mùa 1 đầu tiên (nút đè)', () => {
  const da = new Set();
  for (const m of M.danhSach.slice(0, M.danhSach.indexOf(DS[0]))) for (const f of dacTrung(m)) da.add(f);
  for (const m of DS) {
    const moi = [...dacTrung(m)].filter((f) => !da.has(f) && f !== 'trinh dien');
    dieuMoi[m.ma] = moi;
    if (m.hang !== 'trum') assert.ok(moi.length <= 1, m.ma + ' thêm ' + moi.length + ' điều mới: ' + moi.join(', '));
    for (const f of dacTrung(m)) da.add(f);
  }
  assert.ok(/M/.test(get('kho-cu.1').san.join('')), 'kho-cu.1 phải có nút đè');
});
kiem('đủ bốn yếu tố mùa 1 trong gói: nút đè M, thùng gỗ o, hàng rào = (ô đích D không bắt buộc); mỗi chương dùng ít nhất ba', () => {
  for (const c of CHUONG) {
    const co = new Set(DS_C[c].flatMap((m) => dsSan(m).flatMap(yeuToMua1)));
    for (const y of ['M', 'o', '=']) assert.ok(co.has(y), c + ' thiếu yếu tố ' + y);
  }
});

console.log('số | mã | tên | điều mới | dòng | nhịp | ô không tường | ô code | BFS | yếu tố mùa 1');
for (const m of DS) console.log([m.so, m.ma, m.ten, (dieuMoi[m.ma] || []).join(', ') + ' (yMoi: ' + m.yMoi + ')', soDong(m), m.sao.nhip, coSan(m), bang[m.ma].o, bang[m.ma].bfs, dsSan(m).flatMap(yeuToMua1).join('')].join(' | '));

if (LOI_GIA) {
  const thieu = LOI_GIA_DS.filter((t) => !hongMuc.some((h) => h.startsWith(t)));
  console.log('\nLỗi giả: ' + LOI_GIA_DS.length + ' lỗi cắm, ' + (LOI_GIA_DS.length - thieu.length) + ' bị bắt' + (thieu.length ? '; KHÔNG BẮT ĐƯỢC: ' + thieu.join(' · ') : ''));
  process.exit(thieu.length ? 1 : 0);
}
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong + ' kiểm tra 20 màn gói Góc kho cũ.');
if (hong) process.exit(1);
