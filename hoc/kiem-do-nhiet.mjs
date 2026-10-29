/* ============================================================================
   kiem-do-nhiet.mjs — máy kiểm 20 màn mới của mùa 2, gói 7 "Đo nhiệt" (man-do-nhiet.js): chương `do-nhiet` (làm quen warm()) và `che-do-nhiet` "Hàm đo nhiệt".
   Màn 10 mỗi chương là trùm có huy hiệu (do-nhiet, che-do-nhiet).
   1. Vị trí: gói do-nhiet (mùa 2) có hai chương do-nhiet, che-do-nhiet; mỗi chương đúng 10 màn mới theo `so`, hạng lam-quen ×3 · luyen ×3 · bien-the ×3 · trum;
      do-nhiet.1 ngay sau che-luc-ban.10, che-do-nhiet.1 ngay sau do-nhiet.10; trùm mang huy hiệu đúng mã chương (huy-hieu.js có hình), màn khác không mang.
   2. Từng màn: đủ trường (≥ 2 lời sai có phaiCoMa), xe HAI BÁNH gắn súng hơi + mắt hồng ngoại, khay có warm (và distance), lucBan ở mọi màn; có nút bật sẵn (nutBat);
      nhiều sân chỉ ở trùm (+ nhipTheo 'tong'); lời giải thắng 3 sao, đúng sao.o / sao.nhip, KHÔNG chẩn đoán (trừ thông tin 'giat-chan'), có đọc warm(); mã mẫu chưa thắng; lời giải khác đúng 2 sao;
      công thức khác (nếu có) thắng; lời sai thua và có đủ mã phaiCoMa; chữ hiển thị không emoji, không gạch dài.
   3. Hàm của em: mọi hàm màn cần đã được tạo ở màn đứng trước, mọi lời gọi khai trong hamCuaEmCan; hàm mới (taoHam) không trùng hàm cốt truyện nào (kể cả mùa ẩn)
      và có mục Sổ lệnh đúng màn / chương, nhóm hong-ngoai; hàm của màn không trùng hàm cốt truyện / hàm trong kho.
   4. Không dùng thứ của gói sau / thứ lạ: beSung (gói 9), xichDay, nhiều robot (doi: gói 8), return (mùa 5); sân không S / u / n.
   5. Đường cong (mỗi chương): dòng lời giải / nhịp / số ô không tường của màn n ≤ max(1,5 × màn n−1, màn n−1 + lề) (lề +3 dòng, +4 nhịp, +6 ô), trùm được miễn và
      không làm mốc (do-nhiet.1 so với che-luc-ban.9, che-do-nhiet.1 so với do-nhiet.9); mỗi màn thêm TỐI ĐA MỘT điều mới; recall: mỗi chương ≥ 4 màn dùng thứ của
      gói 1–6 mùa 2 hay mùa 1; chương do-nhiet có màn đố ("Đố…"), chương che-do-nhiet có màn sửa hàm lỗi ("Sửa…", hàm của màn).
   6. Bộ dò (do-duong-do-nhiet.mjs = bộ dò gói 6 + timLoiNeNhanh cho màn mở; lời tìm được chấm thật bằng cham.js):
      - nút bật sẵn không nối gì (động học sân không phụ thuộc nutBat, nên bộ dò dãy cố định đúng luật);
      - BFS tự do (mỗi sân) không dài hơn sao.nhip;
      - màn khóa chương trình chính: KHÔNG thân hàm cố định (không cảm biến) nào được 3 sao (chương trình chính có go_to_wall() thì mô phỏng mọi dãy thân cố định
        đủ ngắn cho sao.nhip: timThanCoDinh); màn nhiều sân: không có dãy chung nào thắng mọi sân trong sao.nhip;
        màn mở một sân: lời cố định (kể cả một hàm phụ f()) không được 3 sao; liệt kê tối đa 100000 dãy thắng (bảng ghi "cắt ngang" khi chạm trần).
   Chạy: node hoc/kiem-do-nhiet.mjs              (trượt thì thoát mã 1)
         node hoc/kiem-do-nhiet.mjs --loi-gia    (cắm lỗi giả: các mục bị cắm phải ĐỎ; thoát 0 khi đỏ đủ)
   ========================================================================== */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { coHinhRieng } from './huy-hieu-ds.mjs';   // V7c1: danh sách mã huy hiệu từ dữ liệu bộ vector (không regex huy-hieu.js pixel)

const require = createRequire(import.meta.url);
const Cham = require('./cham.js');
const M = require('./lo-trinh-hoc.js');
const TT = require('./thu-tu-chuong.js');
const SL = require('./so-lenh.js');
const Bo = await import('./do-duong-sung-hoi.mjs');
const { timLoiNeNhanh, timLoiNeKhoa, timThanCoDinh, moRong, doDuongChung, catSan, kiemDocLap } = await import('./do-duong-do-nhiet.mjs');
const clone = (x) => JSON.parse(JSON.stringify(x));
const LOI_GIA = process.argv.includes('--loi-gia');
const CHI = (process.argv.find((a) => a.startsWith('--chi=')) || '').slice(6);      // --chi=do-nhiet.3: chỉ chạy kiểm từng màn cho các mã này (phẩy), để làm nhanh

let dat = 0, hong = 0;
const hongMuc = [];
function kiem(ten, fn) {
  try { fn(); dat++; } catch (e) { hong++; hongMuc.push(ten); console.log('  HỎNG ' + ten + '\n       ' + (e && e.message ? e.message.split('\n')[0] : e)); }
}

const CHUONG = ['do-nhiet', 'che-do-nhiet'];
const MOC = { 'do-nhiet': 'che-luc-ban.9', 'che-do-nhiet': 'do-nhiet.9' };
const LE = { dong: 3, nhip: 4, o: 6 };
const get = (ma) => M.timMa(ma);
const dsSan = (m) => (Array.isArray(m.san[0]) ? m.san : [m.san]);
const soSan = (m) => dsSan(m).length;

/* ------------------------------------------------------------------ lỗi giả (--loi-gia): mỗi lỗi làm đỏ một mục */
const LOI_GIA_DS = [];
if (LOI_GIA) {
  const a = get('do-nhiet.1'), b = get('do-nhiet.2'), c = get('do-nhiet.3'), d = get('che-do-nhiet.4'), t = get('do-nhiet.10'), u = get('che-do-nhiet.10');
  a.sao = Object.assign({}, a.sao, { nhip: a.sao.nhip - 1 }); LOI_GIA_DS.push('do-nhiet.1: lời giải');           // ngưỡng nhịp sai → lời giải chỉ 2 sao
  b.loiSai[0].phaiCoMa = ['vat-vo']; LOI_GIA_DS.push('do-nhiet.2: lời giải');                                    // lời sai thiếu mã
  b.hamCuaEmCan = b.hamCuaEmCan.concat(['fly_home']); LOI_GIA_DS.push('do-nhiet.2: hàm của em');                 // hàm chưa ai tạo
  c.san = [c.san, c.san]; c.batDau = [c.batDau, c.batDau]; LOI_GIA_DS.push('do-nhiet.3: đủ trường');             // nhiều sân ở màn không phải trùm
  d.lucBan = false; LOI_GIA_DS.push('che-do-nhiet.4: đủ trường');                                                // quên cờ lực bắn
  get('do-nhiet.4').sao = Object.assign({}, get('do-nhiet.4').sao, { o: get('do-nhiet.4').sao.o + 4 }); LOI_GIA_DS.push('do-nhiet.4: lời giải');
  t.sao = Object.assign({}, t.sao, { nhip: t.sao.nhip + 12 }); LOI_GIA_DS.push('do-nhiet.10: lời giải');        // ngưỡng nhịp lệch lời giải
  u.huyHieu = null; LOI_GIA_DS.push('huy hiệu');                                                                 // trùm mất huy hiệu
  get('che-do-nhiet.2').taoHam = ['sweep']; LOI_GIA_DS.push('che-do-nhiet.2: hàm của em');                       // trùng hàm cốt truyện che-lap.5
  get('do-nhiet.5').beSung = true; LOI_GIA_DS.push('do-nhiet.5: không dùng thứ');                                // bệ súng là gói 9
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
/** Số dòng lời giải người chơi viết / sửa: chương trình chính (trừ khi khóa) + thân hàm mới + thân hàm của màn. */
const soDong = (m) => (m.chinhCoDinh ? 0 : m.loiGiai.chinh.length) + (m.loiGiai.hamCuaMan || []).concat(m.loiGiai.hamCuaEmMoi || []).reduce((s, h) => s + h.than.length, 0);
/** Số ô không phải tường (sân lớn nhất). */
const coSan = (m) => Math.max(...dsSan(m).map((rows) => rows.join('').replace(/#/g, '').length));
/** Dòng kèm thân mọi hàm của em được gọi tới (bắc cầu) theo kho trước màn + hàm mới. */
function bacCau(m, dong, moi) {
  const bang = new Map(khoTruoc.get(m.ma).map((h) => [h.ten, h]));
  for (const h of moi || []) bang.set(h.ten, h);
  const kq = [...dong], da = new Set(), cho = [...loiGoi(dong)];
  while (cho.length) { const t = cho.pop(); if (da.has(t) || !bang.has(t)) continue; da.add(t); kq.push(...bang.get(t).than); cho.push(...loiGoi(bang.get(t).than)); }
  return { dong: kq, goi: da };
}
const dongLoiGiai = (m) => [...(m.loiGiai.chinh || []), ...(m.loiGiai.hamCuaMan || []).concat(m.loiGiai.hamCuaEmMoi || []).flatMap((h) => h.than)];
/** Lời giải có đọc warm() (thẳng hay qua hàm của em). */
const docNhiet = (m) => bacCau(m, dongLoiGiai(m), m.loiGiai.hamCuaEmMoi).dong.some((l) => /warm\(\)/.test(l));

/* ------------------------------------------------------------------ đặc trưng (điều mới) của một màn, đọc từ lời giải và sân */
const RE_SO_SANH = /(<=|>=|==|!=|<|>)\s*(\d+|[A-Za-z_]\w*)/g;
function dacTrung(m) {
  const lg = m.loiGiai, moi = lg.hamCuaEmMoi || [], cuaMan = lg.hamCuaMan || [];
  const dong = dongLoiGiai(m);
  const f = new Set();
  for (const l of dong) {
    if (/distance\(\)/.test(l)) f.add('distance');
    if (/warm\(\)/.test(l)) f.add('warm');                                        // nút bật sẵn đi cùng warm(): một ý "nóng / không nóng"
    if (/\bwhile\s+not\s+warm\(\)/.test(l)) f.add('while not warm');
    else if (/\bwhile\s+warm\(\)/.test(l)) f.add('while warm');
    if (/\b(and|or)\b/.test(l.replace(/#.*$/, ''))) f.add('and / or');
    if (/^\s*while\b/.test(l)) f.add(/^\s*while True:/.test(l) ? 'while True' : 'while');
    if (/^\s*if\b/.test(l)) f.add('if');
    if (/^\s*elif\b/.test(l)) f.add('elif');
    if (/^\s*else\s*:/.test(l)) f.add('else');
    if (/^\s*for\b/.test(l)) f.add('for');
    if (/^\s*[A-Za-z_]\w*\s*=\s*"/.test(l)) f.add('bien = chuoi');
    else if (/^\s*[A-Za-z_]\w*\s*=\s*\d+\s*$/.test(l)) f.add('bien = so');
    else if (/^\s*[A-Za-z_]\w*\s*([-+]=|=\s*[A-Za-z_]\w*\s*[-+])/.test(l)) f.add('bien dem');
    else if (/^\s*[A-Za-z_]\w*\s*=\s*\w+\(\)/.test(l)) f.add('bien = cam bien');
    for (const x of l.matchAll(RE_SO_SANH)) if (!/^\s*for\b/.test(l)) f.add('so sanh ' + x[1] + (/^\d+$/.test(x[2]) ? ' so' : ' bien'));
    if (/\b(shoot|shoot_back|fire|fire_back)\("(fast|charge)"\)/.test(l)) f.add('luc ban');
  }
  for (const h of moi.concat(cuaMan)) {
    if (h.thamSo.length && h.than.some((l) => new RegExp('\\((' + h.thamSo.join('|') + ')\\)').test(l) && /\b(shoot|shoot_back|fire|fire_back)\(/.test(l))) f.add('tham so luc');
    if (h.than.some((l) => /distance\(\)/.test(l)) && h.than.some((l) => /\b(shoot|fire)\w*\(/.test(l))) f.add('chon luc theo distance');
    if (h.than.some((l) => /warm\(\)/.test(l))) f.add('ham doc warm');
  }
  for (const h of moi) {
    f.add(h.thamSo.length > 1 ? 'tao ham hai tham so' : h.thamSo.length ? 'tao ham co tham so' : 'tao ham');
    const kho = new Map(khoTruoc.get(m.ma).map((x) => [x.ten, x]));
    const goiKho = [...loiGoi(h.than)].filter((t) => kho.has(t));
    if (goiKho.length) f.add('ham goi ham');
    if (goiKho.some((t) => bacCau(m, [t + '()'], []).dong.some((l) => /distance\(\)/.test(l)))) f.add('ham goi ham cam bien');
    if (goiKho.some((t) => bacCau(m, [t + '()'], []).dong.some((l) => /warm\(\)/.test(l)))) f.add('ham goi ham doc warm');
    if (h.than.some((l) => /^\s*for\b/.test(l))) f.add('for trong ham');
    if (h.than.some((l) => /^\s*while\b/.test(l))) f.add('while trong ham');
  }
  if (cuaMan.length) f.add(m.chinhCoDinh ? 'chuong trinh khoa' : 'ham cua man');
  if (m.chinhCoDinh) f.add('chuong trinh khoa');
  if (m.mucTieu) f.add('muc tieu ' + m.mucTieu);
  if (m.lucBan) f.add('luc ban');
  const chu = dsSan(m).map((s) => s.join('')).join('');
  if (/[Hh]/.test(chu)) f.add('thung nang');
  if (/[<>^v]/.test(chu)) f.add('bang chuyen');
  if (/M/.test(chu)) f.add('nut de');
  if (/N/.test(chu)) f.add('nut ban');
  if (/[Cc]/.test(chu)) f.add('cua');
  if (/N/.test(chu) && /[<>^v]/.test(chu)) f.add('nut tat bang');
  if (m.bongMo && [].concat(m.bongMo).some((b) => b && b.thung)) f.add('thung mo');
  return f;
}

/* ------------------------------------------------------------------ 1. vị trí */
const goi = TT.goi.find((g) => g.ma === 'do-nhiet');
const DS_C = Object.fromEntries(CHUONG.map((c) => [c, M.danhSach.filter((m) => m.chuong === c)]));
const DS = CHUONG.flatMap((c) => DS_C[c]);
kiem('gói do-nhiet (mùa 2): hai chương do-nhiet, che-do-nhiet; mỗi chương 10 màn mới đúng so và hạng; nối đúng chỗ trong lộ trình', () => {
  assert.ok(goi && goi.mua === 'mua-2', 'không thấy gói do-nhiet ở mùa 2');
  assert.deepEqual(goi.chuong, CHUONG);
  for (const c of CHUONG) {
    const ds = DS_C[c];
    assert.deepEqual(ds.map((m) => m.ma), Array.from({ length: 10 }, (_, i) => c + '.' + (i + 1)), c);
    assert.deepEqual(ds.map((m) => m.hang), ds.map((_, i) => (i < 3 ? 'lam-quen' : i < 6 ? 'luyen' : i < 9 ? 'bien-the' : 'trum')), c + ' hạng');
  }
  assert.equal((M.manDoNhiet || []).length, 20, 'ManHoc.manDoNhiet phải có 20 màn');
  assert.equal(M.danhSach.indexOf(DS_C['do-nhiet'][0]), M.danhSach.indexOf(get('che-luc-ban.10')) + 1, 'do-nhiet.1 phải đứng ngay sau che-luc-ban.10');
  assert.equal(M.danhSach.indexOf(DS_C['che-do-nhiet'][0]), M.danhSach.indexOf(get('do-nhiet.10')) + 1, 'che-do-nhiet.1 phải đứng ngay sau do-nhiet.10');
});
kiem('tên màn không trùng trong gói và không trùng màn khác của lộ trình', () => {
  const ten = DS.map((m) => m.ten);
  assert.equal(new Set(ten).size, ten.length, 'trùng tên: ' + ten.filter((t, i) => ten.indexOf(t) !== i));
  const cu = M.danhSach.filter((m) => !CHUONG.includes(m.chuong)).map((m) => m.ten);
  for (const t of ten) assert.ok(!cu.includes(t), 'tên "' + t + '" trùng một màn khác');
});
kiem('huy hiệu: chỉ trùm mang, đúng mã chương; huy-hieu.js có hình', () => {
  for (const c of CHUONG) {
    const ds = DS_C[c], trum = ds[ds.length - 1];
    assert.equal(trum && trum.hang, 'trum');
    assert.equal(trum.huyHieu && trum.huyHieu.ma, c, c + ': trùm thiếu huy hiệu');
    assert.ok(trum.huyHieu.ten && !/[—]/.test(trum.huyHieu.ten));
    for (const m of ds.slice(0, -1)) assert.ok(!m.huyHieu, m.ma + ' không phải trùm mà có huy hiệu');
    assert.ok(coHinhRieng(c), "huy-hieu-vector.js thiếu hình huy hiệu '" + c + "'");
  }
});

/* ------------------------------------------------------------------ 2–4, 6. từng màn */
// Chẩn đoán thông tin được phép trong lời giải: 'giat-chan' (bắn tụ mà sau lưng là tường nên xe đứng yên: chính là cách màn dạy bắn tụ an toàn).
const CHAN_DOAN_DUOC = ['giat-chan'];
const HAM_COT_TRUYEN = new Map();
for (const m of M.danhSach) for (const t of m.taoHam || []) if (!HAM_COT_TRUYEN.has(t)) HAM_COT_TRUYEN.set(t, m.ma);
const bang = {};
for (const m of DS) {
  const kho = khoTruoc.get(m.ma), daTao = daTaoTruoc.get(m.ma);
  bang[m.ma] = {};
  if (CHI && !CHI.split(',').includes(m.ma)) continue;
  kiem(m.ma + ': đủ trường, robot hai bánh súng hơi + hồng ngoại, warm, lực bắn, nút bật sẵn, một sân', () => {
    for (const k of ['ten', 'deBai', 'san', 'batDau', 'mucTieu', 'hamGoc', 'robot', 'sao', 'maMau', 'loiGiai', 'loiGiaiKhac', 'goiY', 'hamCuaEmCan', 'yMoi']) assert.ok(m[k] !== undefined && m[k] !== '', m.ma + ' thiếu ' + k);
    assert.ok(m.loiSai.length >= 2, m.ma + ' cần ít nhất 2 lời sai');
    for (const ls of m.loiSai) assert.ok(ls.moTa && ls.phaiCoMa && ls.phaiCoMa.length, m.ma + ' lời sai thiếu moTa / phaiCoMa');
    assert.ok(m.goiY.length >= 1);
    assert.equal(m.loaiRobot, 'banh');
    assert.equal(m.robot.than, 'hai-banh');
    assert.equal(m.robot.tay, 'hoi', m.ma + ' tay ' + m.robot.tay);
    assert.equal(m.lucBan, true, m.ma + ' thiếu lucBan: true');
    for (const h of ['shoot', 'shoot_back', 'warm']) assert.ok(m.hamGoc.includes(h), m.ma + ' khay thiếu ' + h);
    assert.deepEqual(m.robot.camBien.map((c) => c.ma), ['hong-ngoai'], m.ma + ' phải gắn mắt hồng ngoại');
    assert.ok(['toi-co', 'bong-mo', 'day-thung'].includes(m.mucTieu), m.ma + ' mục tiêu ' + m.mucTieu);
    if (m.hang === 'trum') assert.ok(soSan(m) <= 3, m.ma + ' trùm tối đa ba sân');
    else assert.equal(soSan(m), 1, m.ma + ' nhiều sân chỉ ở trùm (luật lộ trình)');
    if (soSan(m) > 1) assert.equal(m.nhipTheo, 'tong', m.ma + ' nhiều sân phải tính tổng nhịp');
    dsSan(m).forEach((rows, i) => {
      assert.ok(/N/.test(rows.join('')), m.ma + ' sân ' + (i + 1) + ' không có nút bắn');
      const nb = catSan(m, i).nutBat || [];
      assert.ok(nb.length >= 1, m.ma + ' sân ' + (i + 1) + ' không có nút bật sẵn (nutBat)');
    });
    assert.ok(docNhiet(m), m.ma + ' lời giải không đọc warm()');
    for (const s of ['ten', 'deBai', 'veMaMau', 'yMoi']) if (m[s]) assert.ok(!/—|\p{Extended_Pictographic}/u.test(m[s]), m.ma + ' ' + s + ' có gạch dài / emoji');
    for (const s of m.goiY.concat(m.loiSai.map((x) => x.moTa), [m.loiGiaiKhac.moTa], (m.congThucKhac || []).map((x) => x.moTa))) assert.ok(!/—|\p{Extended_Pictographic}/u.test(s), m.ma + ' chữ có gạch dài / emoji: ' + s);
    if (m.hang === 'trum') assert.ok(m.huyHieu, m.ma + ' trùm thiếu huy hiệu');
  });
  kiem(m.ma + ': không dùng thứ của gói sau (beSung, xichDay, nhiều robot, return), sân không S / u / n', () => {
    for (const k of ['beSung', 'xichDay', 'doi']) assert.ok(!m[k], m.ma + ' có ' + k);
    for (const x of moiBai(m)) assert.ok(!dongCua(x).some((l) => /^\s*return\b/.test(l)), m.ma + ' ' + x.ten + ' dùng return (mùa 5)');
    for (const rows of dsSan(m)) assert.ok(!/[Sun]/.test(rows.join('')), m.ma + ' sân có S / u / n');
  });
  kiem(m.ma + ': hàm của em cần đã tạo ở màn trước; mọi lời gọi hàm của em đều khai trong hamCuaEmCan; hàm mới không trùng tên cốt truyện, có mục Sổ lệnh', () => {
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
      const sl = SL.tim(t);
      assert.ok(sl && sl.man === m.ma && sl.chuong === m.chuong && sl.nhom === 'hong-ngoai', m.ma + ' hàm mới ' + t + ' chưa có mục Sổ lệnh đúng màn / chương / nhóm hong-ngoai: ' + JSON.stringify(sl));
    }
    for (const x of m.loiGiai.hamCuaMan || []) assert.ok(!HAM_COT_TRUYEN.has(x.ten) && !kho.some((h) => h.ten === x.ten), m.ma + ' hàm của màn ' + x.ten + ' trùng hàm cốt truyện / hàm trong kho');
  });
  kiem(m.ma + ': lời giải 3 sao đúng ngưỡng, không chẩn đoán; mã mẫu chưa thắng; lời giải khác 2 sao; công thức khác thắng; lời sai thua đúng mã', () => {
    const r = cham(m, m.loiGiai, m.loiGiai.hamCuaEmMoi);
    assert.ok(r.thang, m.ma + ' lời giải thua: ' + JSON.stringify(r.chanDoan.map((c) => c.ma)));
    assert.equal(r.soO, m.sao.o, m.ma + ' soO=' + r.soO + ' khai ' + m.sao.o);
    assert.equal(r.soNhip, m.sao.nhip, m.ma + ' soNhip=' + r.soNhip + ' khai ' + m.sao.nhip);
    assert.equal(r.sao, 3, m.ma + ' sao=' + r.sao);
    assert.deepEqual(r.chanDoan.filter((c) => !(c.muc === 'thong-tin' && CHAN_DOAN_DUOC.includes(c.ma))).map((c) => c.ma), [], m.ma + ' lời giải có chẩn đoán');
    assert.ok(r.theoSan.length === soSan(m) && r.theoSan.every((s) => s.thang));
    const rm = cham(m, m.maMau);
    if (m.chiChay) assert.ok(rm.thang && rm.sao === 3 && m.chinhCoDinh, m.ma + ' màn trình diễn (gói T): mã mẫu khoá phải thắng 3 sao');     // gói T mùa 2: do-nhiet.1 trình diễn
    else assert.equal(rm.thang, false, m.ma + ' mã mẫu đã thắng sẵn');
    const rk = cham(m, m.loiGiaiKhac.baiLam, m.loiGiaiKhac.hamCuaEmMoi);
    assert.ok(rk.thang, m.ma + ' lời giải khác thua: ' + JSON.stringify(rk.chanDoan.map((c) => c.ma)));
    if (!m.chiChay) assert.equal(rk.sao, 2, m.ma + ' lời giải khác sao=' + rk.sao + ' (ô ' + rk.soO + ', nhịp ' + rk.soNhip + ')');     // màn trình diễn: main khoá nên lời giải khác / lời sai cũng chạy mã mẫu
    (m.congThucKhac || []).forEach((c, i) => { const rc = cham(m, c.baiLam, c.hamCuaEmMoi); assert.ok(rc.thang, m.ma + ' công thức khác ' + i + ' "' + c.moTa + '" thua: ' + JSON.stringify(rc.chanDoan.map((x) => x.ma))); });
    if (!m.chiChay) m.loiSai.forEach((ls, i) => {
      const rl = cham(m, ls.baiLam, ls.hamCuaEmMoi);
      assert.equal(rl.thang, false, m.ma + ' lời sai ' + i + ' "' + ls.moTa + '" lại thắng');
      const ma = rl.chanDoan.map((c) => c.ma);
      for (const x of ls.phaiCoMa) assert.ok(ma.includes(x), m.ma + ' lời sai ' + i + ' "' + ls.moTa + '" thiếu mã ' + x + ' (có: ' + ma.join(',') + ')');
    });
    Object.assign(bang[m.ma], { o: r.soO, nhip: r.soNhip });
  });
  kiem(m.ma + ': bộ dò: nút bật sẵn không nối gì; BFS không ngắn hơn lời giải một cách vô lý; lời cố định (không cảm biến) không được 3 sao', () => {
    const dl = kiemDocLap(m);
    assert.equal(dl, '', m.ma + ': ' + dl);
    let bfs = 0;
    dsSan(m).forEach((_, i) => {
      const k = Bo.nhipSungHoiNganNhat(catSan(m, i)).nhip;
      bfs = bfs === null || k === null ? null : bfs + k;
    });
    assert.ok(bfs !== null && bfs <= m.sao.nhip, m.ma + ' BFS ' + bfs + ' > sao.nhip ' + m.sao.nhip);
    bang[m.ma].bfs = bfs;
    if (m.chiChay) { bang[m.ma].ne = 'màn trình diễn (khoá, chỉ bấm Chạy)'; return; }     // gói T mùa 2
    if (soSan(m) > 1) {
      const t = doDuongChung(m, m.sao.nhip);
      if (t) assert.fail(m.ma + ': dãy chung ' + t.nhip + ' nhịp ≤ ' + m.sao.nhip + ' thắng mọi sân không cần warm(): ' + t.chuoi);
      bang[m.ma].ne = 'không có dãy chung ≤ ' + m.sao.nhip + ' nhịp';
      return;
    }
    if (m.chinhCoDinh) {
      const hm = (m.loiGiai.hamCuaEmMoi || [])[0] || (m.loiGiai.hamCuaMan || [])[0];
      assert.ok(hm, m.ma + ' khóa chương trình chính mà không có hàm để viết / sửa');
      assert.ok(bacCau(m, hm.than, m.loiGiai.hamCuaEmMoi).dong.some((l) => /warm\(\)/.test(l)), m.ma + ': thân ' + hm.ten + ' không đọc warm()');
      const laMan = !(m.loiGiai.hamCuaEmMoi || []).length;
      const chamThan = (than) => {
        const h = Object.assign({}, hm, { than });
        return laMan ? cham(m, { chinh: m.loiGiai.chinh, hamCuaMan: [h] }, []) : cham(m, { chinh: m.loiGiai.chinh, hamCuaMan: m.loiGiai.hamCuaMan }, [h]);
      };
      // chương trình chính mở được thành dãy cố định: bộ dò gói 6; có go_to_wall() (while theo distance()) thì liệt kê thẳng mọi thân cố định trong ngân sách ô
      const moDuoc = moRong(m.loiGiai.chinh, kho, {}, hm.ten) !== null;
      const t = moDuoc ? timLoiNeKhoa(m, hm.ten, kho, chamThan) : timThanCoDinh(m, hm.ten, kho, chamThan);
      bang[m.ma].ne = 'khóa: thân cố định ' + (t.khong ? 'không thắng' : t.soO + ' ô ' + t.soNhip + ' nhịp') + (moDuoc ? '' : ' (mô phỏng ' + t.soDay + ' dãy dài ≤ ' + t.dai + ', ' + t.soThang + ' dãy thắng)');
      if (!t.khong && t.soO <= m.sao.o && t.soNhip <= m.sao.nhip) assert.fail(m.ma + ': thân ' + hm.ten + ' cố định ' + t.soO + ' ô ≤ ' + m.sao.o + ', ' + t.soNhip + ' nhịp: ' + t.than.join(' / '));
      return;
    }
    const t = timLoiNeNhanh(m, kho, (dong, hamMoi) => cham(m, { chinh: dong }, hamMoi), { nguong: m.sao.o, tran: 100000 });
    bang[m.ma].ne = (t.khong ? 'không lời ≤ ' + m.sao.o + ' ô (rẻ nhất ' + t.oNhoNhat + ' ô)' : t.soO + ' ô ' + t.soNhip + ' nhịp') + ', ' + t.soDay + ' dãy' + (t.catNgang ? ' (cắt ngang)' : '');
    assert.ok(!t.catCham, m.ma + ': bộ dò chấm quá nhiều ứng viên, chưa kết luận được');
    if (t.khong) return;
    const ct = t.chinh.join(' / ') + (t.hamMoi.length ? ' với ' + t.hamMoi[0].ten + ': ' + t.hamMoi[0].than.join(' / ') : '');
    if (t.soO <= m.sao.o && t.soNhip <= m.sao.nhip) assert.fail(m.ma + ': lời né warm() ' + t.soO + ' ô ≤ ' + m.sao.o + ', ' + t.soNhip + ' nhịp: ' + ct);
  });
}

/* ------------------------------------------------------------------ 5. đường cong, điều mới, recall */
if (!CHI) {
  kiem('đường cong: dòng / nhịp / ô không tường của màn n ≤ max(1,5 × màn n−1, màn n−1 + lề), trùm miễn và không làm mốc', () => {
    for (const c of CHUONG) {
      let t = get(MOC[c]);
      for (const m of DS_C[c]) {
        if (m.hang === 'trum' || m.chiChay) continue;       // gói T: màn trình diễn (chỉ bấm Chạy) miễn và không làm mốc, như kiem-lo-trinh (g)
        const tran = (a, b, le) => a <= Math.max(1.5 * b, b + le);
        assert.ok(tran(soDong(m), soDong(t), LE.dong), m.ma + ' dòng ' + soDong(m) + ' so với ' + t.ma + ' ' + soDong(t));
        assert.ok(tran(m.sao.nhip, t.sao.nhip, LE.nhip), m.ma + ' nhịp ' + m.sao.nhip + ' so với ' + t.ma + ' ' + t.sao.nhip);
        assert.ok(tran(coSan(m), coSan(t), LE.o), m.ma + ' ô ' + coSan(m) + ' so với ' + t.ma + ' ' + coSan(t));
        t = m;
      }
    }
  });
}
const viTri = (m) => M.danhSach.indexOf(m);
const biet = new Set();
for (const m of M.danhSach.slice(0, viTri(DS[0]))) for (const f of dacTrung(m)) biet.add(f);
const dieuMoi = {};
if (!CHI) {
  kiem('mỗi màn thêm tối đa MỘT điều mới (so với mọi màn đứng trước, đặc trưng đọc từ lời giải và sân)', () => {
    const da = new Set(biet);
    for (const m of DS) {
      const moi = [...dacTrung(m)].filter((f) => !da.has(f));
      dieuMoi[m.ma] = moi;
      if (m.hang !== 'trum') assert.ok(moi.length <= 1, m.ma + ' thêm ' + moi.length + ' điều mới: ' + moi.join(', '));
      for (const f of dacTrung(m)) da.add(f);
    }
  });
}
// Thứ của gói 1–6 mùa 2 hay mùa 1: hàm của em có trước gói Đo nhiệt (trừ move / turn_left / turn_right / u_turn / fire cơ bản), for, distance, lực "charge", băng chuyền, thùng nặng
const HAM_CU = new Set(khoTruoc.get('do-nhiet.1').map((h) => h.ten));
const recall = (m) => {
  const d = dongCua({ b: m.loiGiai, moi: m.loiGiai.hamCuaEmMoi });
  const ds = [...loiGoi(d)].filter((t) => HAM_CU.has(t) && !['move', 'turn_left', 'turn_right', 'u_turn', 'fire'].includes(t));
  if (d.some((l) => /^\s*for\b/.test(l))) ds.push('for');
  if (d.some((l) => /distance\(\)/.test(l))) ds.push('distance');
  if (d.some((l) => /"charge"/.test(l))) ds.push('bắn tụ');
  const chu = dsSan(m).map((s) => s.join('')).join('');
  if (/[<>^v]/.test(chu)) ds.push('băng chuyền');
  if (/[Hh]/.test(chu)) ds.push('thùng nặng');
  return [...new Set(ds)];
};
if (!CHI) {
  kiem('recall: mỗi chương ít nhất 4 màn dùng thứ của gói 1–6 mùa 2 hay mùa 1 (hàm của em cũ như forward, go_to_wall, aim_fire; for; distance; bắn tụ; băng chuyền; thùng nặng)', () => {
    for (const c of CHUONG) { const co = DS_C[c].filter((m) => recall(m).length); assert.ok(co.length >= 4, c + ': chỉ ' + co.length + ' màn recall'); }
  });
  kiem('có màn đố ("Đố…") ở do-nhiet, màn sửa hàm lỗi ("Sửa…", hàm của màn) ở che-do-nhiet; che-do-nhiet có màn khóa đọc warm() qua hàm của em', () => {
    assert.ok(DS_C['do-nhiet'].some((m) => /^Đố/.test(m.ten)), 'do-nhiet thiếu màn đố');
    assert.ok(DS_C['che-do-nhiet'].some((m) => /^Sửa/.test(m.ten) && (m.loiGiai.hamCuaMan || []).length), 'che-do-nhiet thiếu màn sửa hàm');
    assert.ok(DS_C['che-do-nhiet'].some((m) => m.chinhCoDinh && (m.loiGiai.hamCuaEmMoi || []).some((h) => h.than.some((l) => /warm\(\)/.test(l)))), 'che-do-nhiet thiếu màn khóa tạo hàm đọc warm()');
  });
}

/* ------------------------------------------------------------------ bảng */
console.log('số | mã | tên | điều mới (yMoi) | dòng | nhịp | ô không tường | ô code | BFS | lời cố định / thân cố định | recall');
for (const m of DS) {
  const b = bang[m.ma] || {};
  console.log([m.so, m.ma, m.ten, (dieuMoi[m.ma] || []).join(', ') + ' (yMoi: ' + m.yMoi + ')', soDong(m), m.sao.nhip, coSan(m), m.sao.o, b.bfs, b.ne || '?', recall(m).join(',')].join(' | '));
}
if (LOI_GIA) {
  const doDu = LOI_GIA_DS.every((x) => hongMuc.some((t) => t.startsWith(x)));
  console.log('Lỗi giả: cắm ' + LOI_GIA_DS.length + ', mục đỏ ' + hongMuc.length + ' → ' + (doDu ? 'ĐỎ ĐỦ' : 'THIẾU: ' + LOI_GIA_DS.filter((x) => !hongMuc.some((t) => t.startsWith(x))).join('; ')));
  process.exit(doDu ? 0 : 1);
}
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong + ' kiểm tra 20 màn gói Đo nhiệt.');
if (hong) process.exitCode = 1;
