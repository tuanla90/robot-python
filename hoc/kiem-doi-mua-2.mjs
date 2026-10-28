/* ============================================================================
   kiem-doi-mua-2.mjs — máy kiểm 20 màn mới của mùa 2, gói 8 "Đội" (man-doi-mua-2.js): chương `doi-mua-2` (hồng ngoại thấy robot) và `che-doi-mua-2` "Đội phối hợp".
   Màn 10 mỗi chương là trùm có huy hiệu (doi-mua-2, che-doi-mua-2).
   1. Vị trí: gói doi-mua-2 (mùa 2) có hai chương doi-mua-2, che-doi-mua-2; mỗi chương đúng 10 màn mới theo `so`, hạng lam-quen ×3 · luyen ×3 · bien-the ×3 · trum;
      doi-mua-2.1 ngay sau che-do-nhiet.10, che-doi-mua-2.1 ngay sau doi-mua-2.10; trùm mang huy hiệu đúng mã chương (huy-hieu.js có hình), màn khác không mang.
   2. Từng màn: đủ trường (≥ 2 lời sai có phaiCoMa); ĐỘI hai robot: R1 xe xích + mắt hồng ngoại (distance, warm), R2 xe hai bánh + súng hơi + mắt hồng ngoại + lucBan;
      cả hai chương trình chính KHÓA (doi[i].coDinh, mã mẫu = lời giải ở phần chương trình chính); cờ riêng từng robot ở màn tới cờ; nhiều sân chỉ ở trùm (+ nhipTheo 'tong');
      lời giải thắng 3 sao, đúng sao.o / sao.nhip, KHÔNG chẩn đoán (trừ thông tin 'giat-chan'); thân hàm người chơi viết có đọc warm() / distance() (bắc cầu) và khi chạy lời giải
      mắt hồng ngoại THẤY ĐỒNG ĐỘI ít nhất một lần (đọc ra vat 'dong-doi'); mã mẫu chưa thắng; lời giải khác đúng 2 sao; công thức khác thắng; lời sai thua và có đủ mã phaiCoMa;
      chữ hiển thị không emoji, không gạch dài.
   3. Hàm của em: mọi hàm màn cần đã được tạo ở màn đứng trước, mọi lời gọi khai trong hamCuaEmCan; hàm mới (taoHam) không trùng hàm cốt truyện nào (kể cả mùa ẩn)
      và có mục Sổ lệnh đúng màn / chương, nhóm hong-ngoai; hàm của màn không trùng hàm cốt truyện / hàm trong kho. Chương 1 không tạo hàm của em, chương 2 có.
   4. Không dùng thứ của gói sau / thứ lạ: beSung (gói 9), return (mùa 5); sân không S / u / n.
   5. Đường cong (mỗi chương): dòng lời giải / nhịp / số ô không tường của màn n ≤ max(1,5 × màn n−1, màn n−1 + lề) (lề +3 dòng, +4 nhịp, +6 ô), trùm được miễn và
      không làm mốc (doi-mua-2.1 so với che-do-nhiet.9, che-doi-mua-2.1 so với doi-mua-2.9); mỗi màn thêm TỐI ĐA MỘT điều mới; recall: mỗi chương ≥ 4 màn dùng thứ của
      gói 1–7 mùa 2 hay mùa 1; chương doi-mua-2 có màn đố ("Đố…"), chương che-doi-mua-2 có màn sửa hàm lỗi ("Sửa…", hàm của màn) và màn có hàm CẢ HAI robot cùng gọi.
   6. Bộ dò (do-duong-doi-mua-2.mjs): KHÔNG thân cố định nào (không đọc cảm biến, dài ≤ L, liệt kê đủ, chấm thật bằng cham.js) thắng trong sao.nhip.
   Chạy: node hoc/kiem-doi-mua-2.mjs              (trượt thì thoát mã 1)
         node hoc/kiem-doi-mua-2.mjs --loi-gia    (cắm lỗi giả: các mục bị cắm phải ĐỎ; thoát 0 khi đỏ đủ)
         node hoc/kiem-doi-mua-2.mjs --chi=doi-mua-2.3,che-doi-mua-2.1   (chỉ kiểm từng màn các mã này, để làm nhanh)
   ========================================================================== */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Cham = require('./cham.js');
const M = require('./lo-trinh-hoc.js');
const TT = require('./thu-tu-chuong.js');
const SL = require('./so-lenh.js');
const { timThanCoDinhDoi } = await import('./do-duong-doi-mua-2.mjs');
const clone = (x) => JSON.parse(JSON.stringify(x));
const LOI_GIA = process.argv.includes('--loi-gia');
const CHI = (process.argv.find((a) => a.startsWith('--chi=')) || '').slice(6);

let dat = 0, hong = 0;
const hongMuc = [];
function kiem(ten, fn) {
  try { fn(); dat++; } catch (e) { hong++; hongMuc.push(ten); console.log('  HỎNG ' + ten + '\n       ' + (e && e.message ? e.message.split('\n')[0] : e)); }
}

const CHUONG = ['doi-mua-2', 'che-doi-mua-2'];
const MOC = { 'doi-mua-2': 'che-do-nhiet.9', 'che-doi-mua-2': 'doi-mua-2.9' };
const DAU_SAU = { 'doi-mua-2': 'che-do-nhiet.10', 'che-doi-mua-2': 'doi-mua-2.10' };
const LE = { dong: 3, nhip: 4, o: 6 };
const get = (ma) => M.timMa(ma);
const dsSan = (m) => (Array.isArray(m.san[0]) ? m.san : [m.san]);
const soSan = (m) => dsSan(m).length;

/* ------------------------------------------------------------------ lỗi giả (--loi-gia): mỗi lỗi làm đỏ một mục */
const LOI_GIA_DS = [];
if (LOI_GIA) {
  const a = get('doi-mua-2.1');
  a.sao = Object.assign({}, a.sao, { nhip: a.sao.nhip - 1 }); LOI_GIA_DS.push('doi-mua-2.1: lời giải');           // ngưỡng nhịp sai → lời giải chỉ 2 sao
  a.loiSai[0].phaiCoMa = ['vat-vo']; LOI_GIA_DS.push('doi-mua-2.1: lời giải');                                   // lời sai thiếu mã
  a.hamCuaEmCan = a.hamCuaEmCan.concat(['fly_home']); LOI_GIA_DS.push('doi-mua-2.1: hàm của em');               // hàm chưa ai tạo
  a.doi[1].coDinh = false; LOI_GIA_DS.push('doi-mua-2.1: đủ trường');                                           // R2 không khóa
  a.doi[0].beSung = true; LOI_GIA_DS.push('doi-mua-2.1: không dùng thứ');                                        // bệ súng là gói 9
  a.sao = Object.assign({}, a.sao, { nhip: a.sao.nhip + 30 }); LOI_GIA_DS.push('doi-mua-2.1: bộ dò');            // ngưỡng nhịp rộng: thân cố định cũng thắng
  get('che-doi-mua-2.1').taoHam = ['safe_move']; LOI_GIA_DS.push('che-doi-mua-2.1: hàm của em');                 // trùng hàm cốt truyện che-cam-bien.1
  get('che-doi-mua-2.10').huyHieu = null; LOI_GIA_DS.push('huy hiệu');                                           // trùm mất huy hiệu
  get('doi-mua-2.3').san = get('doi-mua-2.3').san.map((d, i) => (i === 1 ? '#S' + d.slice(2) : d)); LOI_GIA_DS.push('doi-mua-2.3: không dùng thứ');   // bậc thang S
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
/** Chấm bài làm b ({ doi, hamCuaMan } hay { chinh, hamCuaMan } của màn một robot) với kho trước màn + hàm mới. */
function cham(m, b, moi, them) {
  const hs = new Map(khoTruoc.get(m.ma).map((h) => [h.ten, clone(h)]));
  for (const h of moi || []) hs.set(h.ten, clone(h));
  const bl = b.doi ? { chinh: [], doi: b.doi.map((d) => ({ chinh: d.chinh.slice() })), hamCuaMan: b.hamCuaMan || [] } : { chinh: b.chinh, hamCuaMan: b.hamCuaMan || [] };
  return Cham.cham(Object.assign({}, m, them || {}), bl, [...hs.values()]);
}
function loiGoi(dong) { const s = new Set(); for (const l of dong || []) for (const x of l.replace(/#.*$/, '').replace(/"[^"]*"/g, '""').matchAll(/([A-Za-z_]\w*)\s*\(/g)) s.add(x[1]); return s; }
const PY = new Set(['range', 'print', 'len']);
function moiBai(m) {
  const ds = [{ ten: 'maMau', b: m.maMau, moi: [] }, { ten: 'loiGiai', b: m.loiGiai, moi: m.loiGiai.hamCuaEmMoi }];
  if (m.loiGiaiKhac) ds.push({ ten: 'loiGiaiKhac', b: m.loiGiaiKhac.baiLam, moi: m.loiGiaiKhac.baiLam.hamCuaEmMoi });
  (m.congThucKhac || []).forEach((c, i) => ds.push({ ten: 'congThucKhac[' + i + ']', b: c.baiLam, moi: c.baiLam.hamCuaEmMoi }));
  m.loiSai.forEach((ls, i) => ds.push({ ten: 'loiSai[' + i + ']', b: ls.baiLam, moi: ls.baiLam.hamCuaEmMoi }));
  return ds;
}
const chinhCua = (b) => (b.doi ? b.doi.flatMap((d) => d.chinh) : b.chinh || []);
const dongCua = (x) => [...chinhCua(x.b), ...(x.b.hamCuaMan || []).concat(x.moi || []).flatMap((h) => h.than)];
/** Hàm người chơi viết / sửa ở lời giải (hàm của màn hay hàm của em mới). */
const hamViet = (m) => (m.loiGiai.hamCuaEmMoi || []).concat(m.loiGiai.hamCuaMan || []);
/** Số dòng lời giải người chơi viết / sửa: chương trình chính không khóa + thân hàm mới + thân hàm của màn. */
const soDong = (m) => (m.doi ? m.loiGiai.doi.filter((d, i) => !m.doi[i].coDinh).reduce((s, d) => s + d.chinh.length, 0) : (m.chinhCoDinh ? 0 : m.loiGiai.chinh.length)) +
  (m.loiGiai.hamCuaMan || []).concat(m.loiGiai.hamCuaEmMoi || []).reduce((s, h) => s + h.than.length, 0);
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
const dongLoiGiai = (m) => [...chinhCua(m.loiGiai), ...(m.loiGiai.hamCuaMan || []).concat(m.loiGiai.hamCuaEmMoi || []).flatMap((h) => h.than)];
/** Robot nào (chỉ số) gọi hàm ten trong chương trình khóa (thẳng hay qua hàm của em). */
function robotGoi(m, ten) {
  if (!m.doi) return [];
  return m.loiGiai.doi.map((d, i) => (bacCau(m, d.chinh, m.loiGiai.hamCuaEmMoi.concat(m.loiGiai.hamCuaMan || [])).goi.has(ten) ? i : -1)).filter((i) => i >= 0);
}

/* ------------------------------------------------------------------ đặc trưng (điều mới) của một màn, đọc từ lời giải và sân */
const RE_SO_SANH = /(<=|>=|==|!=|<|>)\s*(\d+|[A-Za-z_]\w*)/g;
const thayDongDoi = new Map();          // mã màn → lời giải có lần đọc hồng ngoại thấy đồng đội (điền ở mục 2)
function dacTrung(m) {
  const lg = m.loiGiai, moi = lg.hamCuaEmMoi || [], cuaMan = lg.hamCuaMan || [];
  const dong = dongLoiGiai(m);
  const f = new Set();
  for (const l of dong) {
    if (/distance\(\)/.test(l)) f.add('distance');
    if (/warm\(\)/.test(l)) f.add('warm');
    if (/\bwhile\s+(not\s+)?warm\(\)/.test(l)) f.add('while warm / while not warm');   // một ý: vòng chờ theo warm(), đổi chiều điều kiện như while front_clear() / while not front_clear() của mùa 1
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
    if (h.than.some((l) => /distance\(\)/.test(l))) f.add('ham doc distance');
    if (robotGoi(m, h.ten).length > 1) f.add('ham ca doi goi');
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
  if (cuaMan.length) f.add(m.chinhCoDinh || m.doi ? 'chuong trinh khoa' : 'ham cua man');
  if (m.chinhCoDinh) f.add('chuong trinh khoa');
  if (m.doi) {
    f.add('nhieu robot');
    if (m.doi.some((d) => d.coDinh)) f.add('chuong trinh khoa');
    const loai = m.doi.map((d) => d.loaiRobot + ':' + (d.robot && d.robot.tay)).sort().join('+');
    f.add('doi ' + loai);
    if (thayDongDoi.get(m.ma)) f.add('hong ngoai thay dong doi');
  }
  if (m.mucTieu) f.add('muc tieu ' + m.mucTieu);
  if (m.lucBan || (m.doi || []).some((d) => d.lucBan)) f.add('luc ban');
  if (m.xichDay || (m.doi || []).some((d) => d.xichDay)) f.add('xich day thung');
  const chu = dsSan(m).map((s) => s.join('')).join('');
  if (/[Hh]/.test(chu)) f.add('thung nang');
  if (/[<>^v]/.test(chu)) f.add('bang chuyen');
  if (/M/.test(chu)) f.add('nut de');
  if (/N/.test(chu)) f.add('nut ban');
  if (/[Cc]/.test(chu)) f.add('cua');
  if (/N/.test(chu) && /[<>^v]/.test(chu)) f.add('nut tat bang');
  if ([].concat(m.nutBat || []).flat().length) f.add('nut bat san');
  if (m.bongMo && [].concat(m.bongMo).some((b) => b && b.thung)) f.add('thung mo');
  return f;
}

/* ------------------------------------------------------------------ 1. vị trí */
const goi = TT.goi.find((g) => g.ma === 'doi-mua-2');
const DS_C = Object.fromEntries(CHUONG.map((c) => [c, M.danhSach.filter((m) => m.chuong === c)]));
const DS = CHUONG.flatMap((c) => DS_C[c]);
const DU = DS.length === 20;
kiem('gói doi-mua-2 (mùa 2): hai chương doi-mua-2, che-doi-mua-2; mỗi chương 10 màn mới đúng so và hạng; nối đúng chỗ trong lộ trình', () => {
  assert.ok(goi && goi.mua === 'mua-2', 'không thấy gói doi-mua-2 ở mùa 2');
  assert.deepEqual(goi.chuong, CHUONG.filter((c) => DS_C[c].length));
  for (const c of CHUONG) {
    const ds = DS_C[c];
    if (!ds.length) continue;
    assert.deepEqual(ds.map((m) => m.ma), Array.from({ length: ds.length }, (_, i) => c + '.' + (i + 1)), c);
    if (ds.length === 10) assert.deepEqual(ds.map((m) => m.hang), ds.map((_, i) => (i < 3 ? 'lam-quen' : i < 6 ? 'luyen' : i < 9 ? 'bien-the' : 'trum')), c + ' hạng');
    assert.equal(M.danhSach.indexOf(ds[0]), M.danhSach.indexOf(get(DAU_SAU[c])) + 1, c + '.1 phải đứng ngay sau ' + DAU_SAU[c]);
  }
  assert.equal((M.manDoiMua2 || []).length, DS.length, 'ManHoc.manDoiMua2 khác số màn trong lộ trình');
  assert.ok(DU, 'gói cần 20 màn (đang có ' + DS.length + ')');
});
kiem('tên màn không trùng trong gói và không trùng màn khác của lộ trình', () => {
  const ten = DS.map((m) => m.ten);
  assert.equal(new Set(ten).size, ten.length, 'trùng tên: ' + ten.filter((t, i) => ten.indexOf(t) !== i));
  const cu = M.danhSach.filter((m) => !CHUONG.includes(m.chuong)).map((m) => m.ten);
  for (const t of ten) assert.ok(!cu.includes(t), 'tên "' + t + '" trùng một màn khác');
});
kiem('huy hiệu: chỉ trùm mang, đúng mã chương; huy-hieu.js có hình', () => {
  const hh = fs.readFileSync(new URL('./game/huy-hieu.js', import.meta.url), 'utf8');
  for (const c of CHUONG) {
    const ds = DS_C[c], trum = ds[ds.length - 1];
    assert.ok(ds.length === 10, c + ' chưa đủ 10 màn');
    assert.equal(trum && trum.hang, 'trum');
    assert.equal(trum.huyHieu && trum.huyHieu.ma, c, c + ': trùm thiếu huy hiệu');
    assert.ok(trum.huyHieu.ten && !/[—]/.test(trum.huyHieu.ten));
    for (const m of ds.slice(0, -1)) assert.ok(!m.huyHieu, m.ma + ' không phải trùm mà có huy hiệu');
    assert.ok(new RegExp("HINH\\['" + c + "'\\]\\s*=\\s*function").test(hh), "huy-hieu.js thiếu HINH['" + c + "']");
  }
});

/* ------------------------------------------------------------------ 2–4, 6. từng màn */
const CHAN_DOAN_DUOC = ['giat-chan'];
const HAM_COT_TRUYEN = new Map();
for (const m of M.danhSach) for (const t of m.taoHam || []) if (!HAM_COT_TRUYEN.has(t)) HAM_COT_TRUYEN.set(t, m.ma);
const bang = {};
/** Lời giải có lần đọc hồng ngoại ra đồng đội (vat 'dong-doi') ở sân nào đó. */
function docThayDongDoi(r) {
  return r.theoSan.some((s) => (s.doi || []).some((d) => d.vet.some((e) => e.docCamBien && e.docCamBien.cam === 'hong-ngoai' && e.docCamBien.vat === 'dong-doi')));
}
for (const m of DS) {
  const kho = khoTruoc.get(m.ma), daTao = daTaoTruoc.get(m.ma);
  bang[m.ma] = {};
  try { thayDongDoi.set(m.ma, docThayDongDoi(cham(m, m.loiGiai, m.loiGiai.hamCuaEmMoi))); } catch (e) { thayDongDoi.set(m.ma, false); }
  if (CHI && !CHI.split(',').includes(m.ma)) continue;
  kiem(m.ma + ': đủ trường, đội xích + xe súng có hồng ngoại, cả hai chương trình khóa, cờ riêng, một sân', () => {
    for (const k of ['ten', 'deBai', 'san', 'batDau', 'mucTieu', 'hamGoc', 'robot', 'sao', 'maMau', 'loiGiai', 'loiGiaiKhac', 'goiY', 'hamCuaEmCan', 'yMoi']) assert.ok(m[k] !== undefined && m[k] !== '', m.ma + ' thiếu ' + k);
    assert.ok(m.loiSai.length >= 2, m.ma + ' cần ít nhất 2 lời sai');
    for (const ls of m.loiSai) assert.ok(ls.moTa && ls.phaiCoMa && ls.phaiCoMa.length, m.ma + ' lời sai thiếu moTa / phaiCoMa');
    assert.ok(m.goiY.length >= 1);
    assert.ok(Array.isArray(m.doi) && m.doi.length === 2, m.ma + ' phải có hai robot');
    const [r1, r2] = m.doi;
    assert.equal(r1.loaiRobot, 'xich', m.ma + ' R1 phải là xe xích');
    assert.equal(r1.robot.than, 'xich');
    assert.equal(r2.loaiRobot, 'banh', m.ma + ' R2 phải là xe hai bánh');
    assert.equal(r2.robot.than, 'hai-banh');
    assert.equal(r2.robot.tay, 'hoi', m.ma + ' R2 phải gắn súng hơi');
    assert.equal(r2.lucBan, true, m.ma + ' R2 thiếu lucBan');
    for (const r of m.doi) {
      assert.deepEqual(r.robot.camBien.map((c) => c.ma), ['hong-ngoai'], m.ma + ' robot phải gắn mắt hồng ngoại');
      for (const h of ['distance', 'warm']) assert.ok(r.hamGoc.includes(h), m.ma + ' khay thiếu ' + h);
      assert.equal(r.coDinh, true, m.ma + ' chương trình chính phải khóa');
      if (m.mucTieu === 'toi-co') assert.ok(r.co && r.co.length, m.ma + ' cờ riêng từng robot');
    }
    for (const h of ['shoot', 'shoot_back']) assert.ok(r2.hamGoc.includes(h) && !r1.hamGoc.includes(h), m.ma + ' súng chỉ ở R2');
    assert.deepEqual(m.maMau.doi.map((d) => d.chinh), m.loiGiai.doi.map((d) => d.chinh), m.ma + ' chương trình khóa: mã mẫu phải trùng lời giải');
    assert.equal(m.loiGiai.chinh, undefined);
    assert.equal(hamViet(m).length, 1, m.ma + ' người chơi viết / sửa đúng một hàm');
    assert.ok(['toi-co', 'day-thung', 'dua-vat'].includes(m.mucTieu), m.ma + ' mục tiêu ' + m.mucTieu);
    if (m.hang === 'trum') assert.ok(soSan(m) > 1 && soSan(m) <= 3, m.ma + ' trùm hai đến ba sân');
    else assert.equal(soSan(m), 1, m.ma + ' nhiều sân chỉ ở trùm (luật lộ trình)');
    if (soSan(m) > 1) assert.equal(m.nhipTheo, 'tong', m.ma + ' nhiều sân phải tính tổng nhịp');
    const hv = hamViet(m)[0];
    assert.ok(bacCau(m, hv.than, m.loiGiai.hamCuaEmMoi).dong.some((l) => /warm\(\)|distance\(\)/.test(l)), m.ma + ' thân ' + hv.ten + ' không đọc hồng ngoại');
    assert.ok(thayDongDoi.get(m.ma), m.ma + ' chạy lời giải mà mắt hồng ngoại chưa lần nào thấy đồng đội');
    if (m.chuong === 'doi-mua-2') assert.deepEqual(m.taoHam, [], m.ma + ' chương 1 không tạo hàm của em');
    for (const s of ['ten', 'deBai', 'veMaMau', 'yMoi']) if (m[s]) assert.ok(!/—|\p{Extended_Pictographic}/u.test(m[s]), m.ma + ' ' + s + ' có gạch dài / emoji');
    for (const s of m.goiY.concat(m.loiSai.map((x) => x.moTa), [m.loiGiaiKhac.moTa], (m.congThucKhac || []).map((x) => x.moTa))) assert.ok(!/—|\p{Extended_Pictographic}/u.test(s), m.ma + ' chữ có gạch dài / emoji: ' + s);
    if (m.hang === 'trum') assert.ok(m.huyHieu, m.ma + ' trùm thiếu huy hiệu');
  });
  kiem(m.ma + ': không dùng thứ của gói sau (beSung, return), sân không S / u / n', () => {
    assert.ok(!m.beSung && !(m.doi || []).some((d) => d.beSung), m.ma + ' có beSung');
    for (const x of moiBai(m)) assert.ok(!dongCua(x).some((l) => /^\s*return\b/.test(l)), m.ma + ' ' + x.ten + ' dùng return (mùa 5)');
    for (const rows of dsSan(m)) assert.ok(!/[Sun]/.test(rows.join('')), m.ma + ' sân có S / u / n');
  });
  kiem(m.ma + ': hàm của em cần đã tạo ở màn trước; mọi lời gọi hàm của em đều khai trong hamCuaEmCan; hàm mới không trùng tên cốt truyện, có mục Sổ lệnh', () => {
    for (const h of m.hamCuaEmCan) assert.ok(daTao.has(h) && kho.some((x) => x.ten === h), m.ma + ' cần ' + h + ' nhưng chưa màn nào trước nó tạo');
    const goc = new Set(m.doi.flatMap((d) => d.hamGoc));
    for (const x of moiBai(m)) {
      const rieng = new Set((x.b.hamCuaMan || []).concat(x.moi || []).map((h) => h.ten).concat(m.taoHam || []));
      for (const t of loiGoi(dongCua(x))) {
        if (PY.has(t) || rieng.has(t) || goc.has(t)) continue;
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
    assert.equal(rm.thang, false, m.ma + ' mã mẫu đã thắng sẵn');
    const rk = cham(m, m.loiGiaiKhac.baiLam, m.loiGiaiKhac.baiLam.hamCuaEmMoi);
    assert.ok(rk.thang, m.ma + ' lời giải khác thua: ' + JSON.stringify(rk.chanDoan.map((c) => c.ma)));
    assert.equal(rk.sao, 2, m.ma + ' lời giải khác sao=' + rk.sao + ' (ô ' + rk.soO + ', nhịp ' + rk.soNhip + ')');
    (m.congThucKhac || []).forEach((c, i) => { const rc = cham(m, c.baiLam, c.baiLam.hamCuaEmMoi); assert.ok(rc.thang, m.ma + ' công thức khác ' + i + ' "' + c.moTa + '" thua: ' + JSON.stringify(rc.chanDoan.map((x) => x.ma))); });
    m.loiSai.forEach((ls, i) => {
      const rl = cham(m, ls.baiLam, ls.baiLam.hamCuaEmMoi);
      assert.equal(rl.thang, false, m.ma + ' lời sai ' + i + ' "' + ls.moTa + '" lại thắng');
      const ma = rl.chanDoan.map((c) => c.ma);
      for (const x of ls.phaiCoMa) assert.ok(ma.includes(x), m.ma + ' lời sai ' + i + ' "' + ls.moTa + '" thiếu mã ' + x + ' (có: ' + ma.join(',') + ')');
    });
    Object.assign(bang[m.ma], { o: r.soO, nhip: r.soNhip });
  });
  kiem(m.ma + ': bộ dò: không thân cố định (không đọc cảm biến) nào thắng trong sao.nhip', () => {
    const hv = hamViet(m)[0];
    const laMan = !(m.loiGiai.hamCuaEmMoi || []).length;
    const ngan = { nhipToiDa: m.sao.nhip + 1 };              // chỉ cần biết có thắng trong ngưỡng không: chạy ngắn
    const chamThan = (than) => {
      const h = Object.assign({}, hv, { than });
      return laMan ? cham(m, Object.assign({}, m.loiGiai, { hamCuaMan: [h] }), [], ngan) : cham(m, Object.assign({}, m.loiGiai, { hamCuaMan: m.loiGiai.hamCuaMan }), [h], ngan);
    };
    const t = timThanCoDinhDoi(m, hv.ten, kho, chamThan);
    bang[m.ma].ne = 'thân cố định: đủ mọi dãy dài ≤ ' + t.du + (t.L > t.du ? ', chờ + ≤ 2 lệnh tới dài ' + t.L : '') + (t.demDuoc ? '' : ' (không đếm tĩnh được)') + ' trên ' + t.chu.length + ' chữ: thử ' + t.soThu + ', thắng trong ngưỡng ' + t.thang.length;
    if (t.thang.length) assert.fail(m.ma + ': thân ' + hv.ten + ' cố định thắng ' + t.thang[0].soNhip + ' nhịp ≤ ' + m.sao.nhip + ': ' + t.thang[0].than.join(' / ') + ' (' + t.thang.length + ' thân)');
  });
}

/* ------------------------------------------------------------------ 5. đường cong, điều mới, recall */
if (!CHI) {
  kiem('đường cong: dòng / nhịp / ô không tường của màn n ≤ max(1,5 × màn n−1, màn n−1 + lề), trùm miễn và không làm mốc', () => {
    for (const c of CHUONG) {
      let t = get(MOC[c]);
      if (!t) continue;
      for (const m of DS_C[c]) {
        if (m.hang === 'trum') continue;
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
if (DS.length) for (const m of M.danhSach.slice(0, viTri(DS[0]))) for (const f of dacTrung(m)) biet.add(f);
const dieuMoi = {};
if (!CHI) {
  kiem('mỗi màn thêm tối đa MỘT điều mới (so với mọi màn đứng trước, đặc trưng đọc từ lời giải và sân)', () => {
    const da = new Set(biet);
    for (const m of DS) {
      const moi = [...dacTrung(m)].filter((f) => !da.has(f));
      dieuMoi[m.ma] = moi;
      // màn đầu gói: "đội xe xích + xe súng" và "hồng ngoại thấy đồng đội" là MỘT ý (lần đầu hai part đi chung một đội là lúc mắt hồng ngoại thấy được robot)
      const dem = moi.filter((f) => !(m.so === 1 && m.chuong === 'doi-mua-2' && /^doi /.test(f))).length;
      if (m.hang !== 'trum') assert.ok(dem <= 1, m.ma + ' thêm ' + moi.length + ' điều mới: ' + moi.join(', '));
      for (const f of dacTrung(m)) da.add(f);
    }
  });
}
// Thứ của gói 1–7 mùa 2 hay mùa 1: hàm của em có trước gói Đội (trừ move / turn_left / turn_right / u_turn / fire / wait cơ bản), for, distance, lực "charge", băng chuyền, thùng nặng
const HAM_CU = new Set(DS.length ? khoTruoc.get(DS[0].ma).map((h) => h.ten) : []);
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
if (!CHI && DU) {
  kiem('recall: mỗi chương ít nhất 4 màn dùng thứ của gói 1–7 mùa 2 hay mùa 1 (hàm của em cũ như forward, go_to_wall, aim_fire, tr_right; for; distance; bắn tụ; băng chuyền; thùng nặng)', () => {
    for (const c of CHUONG) { const co = DS_C[c].filter((m) => recall(m).length); assert.ok(co.length >= 4, c + ': chỉ ' + co.length + ' màn recall'); }
  });
  kiem('có màn đố ("Đố…") ở doi-mua-2, màn sửa hàm lỗi ("Sửa…", hàm của màn) ở che-doi-mua-2; che-doi-mua-2 có hàm của em mà CẢ HAI robot cùng gọi', () => {
    assert.ok(DS_C['doi-mua-2'].some((m) => /^Đố/.test(m.ten)), 'doi-mua-2 thiếu màn đố');
    assert.ok(DS_C['che-doi-mua-2'].some((m) => /^Sửa/.test(m.ten) && (m.loiGiai.hamCuaMan || []).length), 'che-doi-mua-2 thiếu màn sửa hàm');
    assert.ok(DS_C['che-doi-mua-2'].some((m) => (m.loiGiai.hamCuaEmMoi || []).some((h) => robotGoi(m, h.ten).length === 2)), 'che-doi-mua-2 thiếu hàm của em cả đội cùng gọi');
  });
}

/* ------------------------------------------------------------------ bảng */
console.log('số | mã | tên | điều mới (yMoi) | dòng | nhịp | ô không tường | ô code | thân cố định (bộ dò) | recall');
for (const m of DS) {
  const b = bang[m.ma] || {};
  console.log([m.so, m.ma, m.ten, (dieuMoi[m.ma] || []).join(', ') + ' (yMoi: ' + m.yMoi + ')', soDong(m), m.sao.nhip, coSan(m), m.sao.o, b.ne || '?', recall(m).join(',')].join(' | '));
}
if (LOI_GIA) {
  const doDu = LOI_GIA_DS.every((x) => hongMuc.some((t) => t.startsWith(x)));
  console.log('Lỗi giả: cắm ' + LOI_GIA_DS.length + ', mục đỏ ' + hongMuc.length + ' → ' + (doDu ? 'ĐỎ ĐỦ' : 'THIẾU: ' + LOI_GIA_DS.filter((x) => !hongMuc.some((t) => t.startsWith(x))).join('; ')));
  process.exit(doDu ? 0 : 1);
}
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong + ' kiểm tra ' + DS.length + ' màn gói Đội.');
if (hong) process.exitCode = 1;
