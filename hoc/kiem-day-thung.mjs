/* ============================================================================
   kiem-day-thung.mjs — máy kiểm 20 màn mới của mùa 2, gói 5 "Đẩy thùng" (man-day-thung.js):
   chương day-thung (xích tiến vào thùng nặng thì đẩy) và che-day-thung "Hàm đẩy thùng"; màn 10 mỗi chương là trùm có huy hiệu.
   1. Vị trí: gói day-thung (mùa 2) có hai chương, mỗi chương đúng 10 màn mới theo `so`, hạng lam-quen ×3 · luyen ×3 · bien-the ×3 · trum;
      trùm mang huy hiệu đúng mã chương (huy-hieu.js có hình), không màn nào khác của gói mang huy hiệu.
   2. Từng màn: đủ trường (≥ 2 lời sai có phaiCoMa), robot xe bánh XÍCH (không tay; hồng ngoại đúng khi khay có distance), xichDay ở MỌI màn;
      nhiều sân chỉ ở trùm (+ nhipTheo 'tong'); lời giải thắng 3 sao, đúng sao.o / sao.nhip, KHÔNG chẩn đoán; mã mẫu chưa thắng; lời giải khác đúng 2 sao;
      lời sai thua và có đủ mã phaiCoMa; chữ hiển thị không emoji, không gạch dài.
   3. Hàm của em: mọi hàm màn cần đã được tạo ở màn đứng trước (theo thứ tự lộ trình), mọi lời gọi khai trong hamCuaEmCan; hàm mới (taoHam) không trùng hàm cốt truyện
      nào (kể cả mùa ẩn) và có mục Sổ lệnh đúng màn / chương, nhóm xich.
   4. Không dùng thứ của gói sau: không warm(), beSung, lucBan, súng hơi, return (mùa 5); sân không S / u / n.
   5. Đường cong cả hai chương: dòng lời giải / nhịp / số ô không tường của màn n ≤ max(1,5 × màn n−1, màn n−1 + lề) (lề +3 dòng, +4 nhịp, +6 ô), trùm được miễn;
      mỗi màn thêm TỐI ĐA MỘT điều mới (đặc trưng đọc từ lời giải và sân); màn 1 chương 1 dễ (≤ 3 dòng); recall: ≥ 4 màn dùng thứ của gói 1–4 mùa 2 hay mùa 1.
   6. Bộ dò (do-duong-day-thung.mjs, mô phỏng xích đẩy thùng theo luật lõi; lời tìm được chạy thật bằng cham.js):
      - màn đọc distance() (thẳng hay qua hàm của em): không có lời CỐ ĐỊNH (không cảm biến) nào được 3 sao; màn khóa chương trình chính: thân hàm cố định không được 3 sao;
        màn nhiều sân: không có dãy chung nào thắng mọi sân trong sao.nhip;
      - màn không cảm biến: lời cố định rẻ nhất không rẻ hơn lời giải (ngưỡng ô chặt);
      - màn tới cờ: coi thùng như tường thì không tới được cờ trong sao.nhip (màn mở đường phải đẩy thùng).
   Chạy: node hoc/kiem-day-thung.mjs              (trượt thì thoát mã 1)
         node hoc/kiem-day-thung.mjs --loi-gia    (cắm lỗi giả: các mục bị cắm phải ĐỎ; thoát 0 khi đỏ đủ)
   ========================================================================== */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Cham = require('./cham.js');
const M = require('./lo-trinh-hoc.js');
const TT = require('./thu-tu-chuong.js');
const SL = require('./so-lenh.js');
const { timLoiNe, timLoiNeKhoa, doDuongChung } = await import('./do-duong-day-thung.mjs');
const clone = (x) => JSON.parse(JSON.stringify(x));
const LOI_GIA = process.argv.includes('--loi-gia');

let dat = 0, hong = 0;
const hongMuc = [];
function kiem(ten, fn) {
  try { fn(); dat++; } catch (e) { hong++; hongMuc.push(ten); console.log('  HỎNG ' + ten + '\n       ' + (e && e.message ? e.message.split('\n')[0] : e)); }
}

const CHUONG = ['day-thung', 'che-day-thung'];
const HUY = { 'day-thung': 'day-thung', 'che-day-thung': 'che-day-thung' };
const LE = { dong: 3, nhip: 4, o: 6 };
const get = (ma) => M.timMa(ma);
const dsSan = (m) => (Array.isArray(m.san[0]) ? m.san : [m.san]);
const soSan = (m) => dsSan(m).length;

/* ------------------------------------------------------------------ lỗi giả (--loi-gia): mỗi lỗi làm đỏ một mục */
const LOI_GIA_DS = [];
if (LOI_GIA) {
  const a = get('day-thung.1'), b = get('day-thung.2'), c = get('day-thung.6'), e = get('day-thung.3'), t = get('day-thung.10');
  a.sao = Object.assign({}, a.sao, { nhip: a.sao.nhip - 1 }); LOI_GIA_DS.push('day-thung.1: lời giải');      // ngưỡng nhịp sai → lời giải chỉ 2 sao
  b.loiSai[0].phaiCoMa = ['vat-vo']; LOI_GIA_DS.push('day-thung.2: lời giải');                              // lời sai thiếu mã
  b.hamCuaEmCan = b.hamCuaEmCan.concat(['fly_home']); LOI_GIA_DS.push('day-thung.2: hàm của em');           // hàm chưa ai tạo
  a.loiGiai.chinh = a.loiGiai.chinh.concat(['w = warm()']); LOI_GIA_DS.push('day-thung.1: không dùng thứ');  // warm() là gói 7
  c.sao = Object.assign({}, c.sao, { o: c.sao.o + 3 }); LOI_GIA_DS.push('day-thung.6: bộ dò');               // ngưỡng ô rộng: đếm cứng cũng 3 sao
  e.san = [e.san, e.san]; e.batDau = [e.batDau, e.batDau]; LOI_GIA_DS.push('day-thung.3: đủ trường');       // nhiều sân ở màn không phải trùm
  get('day-thung.4').xichDay = false; LOI_GIA_DS.push('day-thung.4: đủ trường');                             // quên cờ xích đẩy thùng
  t.huyHieu = null; LOI_GIA_DS.push('huy hiệu');                                                              // trùm mất huy hiệu
  const k = get('che-day-thung.1');
  if (k) { k.taoHam = ['fetch']; LOI_GIA_DS.push('che-day-thung.1: hàm của em'); }                           // trùng hàm cốt truyện nam-cham.5
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
function loiGoi(dong) { const s = new Set(); for (const l of dong || []) for (const x of l.matchAll(/([A-Za-z_]\w*)\s*\(/g)) s.add(x[1]); return s; }
const PY = new Set(['range', 'print', 'len']);
function moiBai(m) {
  const ds = [{ ten: 'maMau', b: m.maMau, moi: [] }, { ten: 'loiGiai', b: m.loiGiai, moi: m.loiGiai.hamCuaEmMoi }];
  if (m.loiGiaiKhac) ds.push({ ten: 'loiGiaiKhac', b: m.loiGiaiKhac.baiLam, moi: m.loiGiaiKhac.hamCuaEmMoi });
  m.loiSai.forEach((ls, i) => ds.push({ ten: 'loiSai[' + i + ']', b: ls.baiLam, moi: ls.hamCuaEmMoi }));
  return ds;
}
const dongCua = (x) => [...(x.b.chinh || []), ...(x.b.hamCuaMan || []).concat(x.moi || []).flatMap((h) => h.than)];
/** Số dòng lời giải người chơi viết / sửa: chương trình chính (trừ khi khóa) + thân hàm mới + thân hàm của màn. */
const soDong = (m) => (m.chinhCoDinh ? 0 : m.loiGiai.chinh.length) + (m.loiGiai.hamCuaMan || []).concat(m.loiGiai.hamCuaEmMoi || []).reduce((s, h) => s + h.than.length, 0);
/** Số ô không phải tường (sân lớn nhất). */
const coSan = (m) => Math.max(...dsSan(m).map((rows) => rows.join('').replace(/#/g, '').length));
/** Dòng lời giải kèm thân mọi hàm của em được gọi tới (bắc cầu) theo kho trước màn + hàm mới. */
function bacCau(m, dong, moi) {
  const bang = new Map(khoTruoc.get(m.ma).map((h) => [h.ten, h]));
  for (const h of moi || []) bang.set(h.ten, h);
  const kq = [...dong], da = new Set(), cho = [...loiGoi(dong)];
  while (cho.length) { const t = cho.pop(); if (da.has(t) || !bang.has(t)) continue; da.add(t); kq.push(...bang.get(t).than); cho.push(...loiGoi(bang.get(t).than)); }
  return { dong: kq, goi: da };
}
const dongLoiGiai = (m) => [...(m.loiGiai.chinh || []), ...(m.loiGiai.hamCuaMan || []).concat(m.loiGiai.hamCuaEmMoi || []).flatMap((h) => h.than)];
/** Lời giải có đọc distance() (thẳng hay qua hàm của em). */
const docMat = (m) => bacCau(m, dongLoiGiai(m), m.loiGiai.hamCuaEmMoi).dong.some((l) => /distance\(\)/.test(l));

/* ------------------------------------------------------------------ đặc trưng (điều mới) của một màn, đọc từ lời giải và sân */
const RE_SO_SANH = /(<=|>=|==|!=|<|>)\s*(\d+|[A-Za-z_]\w*)/g;
function dacTrung(m) {
  const lg = m.loiGiai, moi = lg.hamCuaEmMoi || [];
  const dong = dongLoiGiai(m);
  const f = new Set();
  for (const l of dong) {
    if (/distance\(\)/.test(l)) f.add('distance');
    if (/^\s*while\b/.test(l)) f.add(/^\s*while True:/.test(l) ? 'while True' : 'while');
    if (/^\s*if\b/.test(l)) f.add('if');
    if (/^\s*else\s*:/.test(l)) f.add('else');
    if (/^\s*for\b/.test(l)) f.add('for');
    if (/^\s*[A-Za-z_]\w*\s*=\s*distance\(\)/.test(l)) { /* gán số đo vào biến: cùng ý distance() */ }
    else if (/^\s*[A-Za-z_]\w*\s*=\s*\d+\s*$/.test(l)) f.add('bien = so');
    else if (/^\s*[A-Za-z_]\w*\s*([-+]=|=\s*[A-Za-z_]\w*\s*[-+])/.test(l)) f.add('bien dem');
    for (const x of l.matchAll(RE_SO_SANH)) if (!/^\s*for\b/.test(l)) f.add('so sanh ' + x[1] + (/^\d+$/.test(x[2]) ? ' so' : ' bien'));
    for (const x of l.matchAll(/([A-Za-z_]\w*)\(\s*distance\(\)/g)) f.add('distance() lam doi so');
    if (/distance\(\)\s*[-+]/.test(l) || /[-+]\s*distance\(\)/.test(l)) f.add('phep tinh voi distance');
  }
  for (const h of moi) f.add(h.thamSo.length > 1 ? 'tao ham hai tham so' : h.thamSo.length ? 'tao ham co tham so' : 'tao ham');
  if ((lg.hamCuaMan || []).length) f.add(m.chinhCoDinh ? 'chuong trinh khoa' : 'ham cua man');
  if (m.mucTieu) f.add('muc tieu ' + m.mucTieu);
  if (m.xichDay) f.add('xich day thung');
  const chu = dsSan(m).map((s) => s.join('')).join('');
  if (/[Hh]/.test(chu)) f.add('thung nang');
  if (/[<>^v]/.test(chu)) f.add('bang chuyen');
  if (/M/.test(chu)) f.add('nut de');
  if (/[Cc]/.test(chu)) f.add('cua');
  if (/[Hh]/.test(chu) && /[<>^v]/.test(chu)) f.add('thung tren bang');
  if (/[Hh]/.test(chu) && /M/.test(chu)) f.add('thung de nut');
  return f;
}

/* ------------------------------------------------------------------ 1. vị trí */
const goi = TT.goi.find((g) => g.ma === 'day-thung');
const DS = CHUONG.flatMap((c) => M.danhSach.filter((m) => m.chuong === c));
kiem('gói day-thung (mùa 2): hai chương day-thung, che-day-thung, mỗi chương 10 màn mới đúng so và hạng', () => {
  assert.ok(goi && goi.mua === 'mua-2', 'không thấy gói day-thung ở mùa 2');
  assert.deepEqual(goi.chuong, CHUONG);
  for (const c of CHUONG) {
    const ds = M.danhSach.filter((m) => m.chuong === c);
    assert.deepEqual(ds.map((m) => m.ma), Array.from({ length: 10 }, (_, i) => c + '.' + (i + 1)), c);
    assert.deepEqual(ds.map((m) => m.hang), ds.map((_, i) => (i < 3 ? 'lam-quen' : i < 6 ? 'luyen' : i < 9 ? 'bien-the' : 'trum')), c);
  }
  assert.equal((M.manDayThung || []).length, 20, 'ManHoc.manDayThung phải có 20 màn');
});
kiem('tên màn không trùng trong gói và không trùng màn khác của lộ trình', () => {
  const ten = DS.map((m) => m.ten);
  assert.equal(new Set(ten).size, ten.length, 'trùng tên: ' + ten.filter((t, i) => ten.indexOf(t) !== i));
  const cu = M.danhSach.filter((m) => !CHUONG.includes(m.chuong)).map((m) => m.ten);
  for (const t of ten) assert.ok(!cu.includes(t), 'tên "' + t + '" trùng một màn khác');
});
kiem('huy hiệu: chỉ trùm mỗi chương mang, đúng mã chương; huy-hieu.js có hình', () => {
  const hh = fs.readFileSync(new URL('./game/huy-hieu.js', import.meta.url), 'utf8');
  for (const c of CHUONG) {
    const ds = M.danhSach.filter((m) => m.chuong === c);
    const trum = ds[ds.length - 1];
    assert.equal(trum && trum.hang, 'trum', c);
    assert.equal(trum.huyHieu && trum.huyHieu.ma, HUY[c], c + ' trùm thiếu huy hiệu');
    assert.ok(trum.huyHieu.ten && !/[—]/.test(trum.huyHieu.ten));
    for (const m of ds.slice(0, -1)) assert.ok(!m.huyHieu, m.ma + ' không phải trùm mà có huy hiệu');
    assert.ok(new RegExp("HINH\\['" + HUY[c] + "'\\]\\s*=\\s*function").test(hh), "huy-hieu.js thiếu HINH['" + HUY[c] + "']");
  }
});

/* ------------------------------------------------------------------ 2–4, 6. từng màn */
const CAM_LENH = ['warm', 'shoot', 'shoot_back'];
const HAM_COT_TRUYEN = new Map();
for (const m of M.danhSach) for (const t of m.taoHam || []) if (!HAM_COT_TRUYEN.has(t)) HAM_COT_TRUYEN.set(t, m.ma);
const bang = {};
for (const m of DS) {
  const kho = khoTruoc.get(m.ma), daTao = daTaoTruoc.get(m.ma);
  bang[m.ma] = {};
  kiem(m.ma + ': đủ trường, robot xích đẩy thùng, khay, một sân', () => {
    for (const k of ['ten', 'deBai', 'san', 'batDau', 'mucTieu', 'hamGoc', 'robot', 'sao', 'maMau', 'loiGiai', 'loiGiaiKhac', 'goiY', 'hamCuaEmCan', 'yMoi']) assert.ok(m[k] !== undefined && m[k] !== '', m.ma + ' thiếu ' + k);
    assert.ok(m.loiSai.length >= 2, m.ma + ' cần ít nhất 2 lời sai');
    for (const ls of m.loiSai) assert.ok(ls.moTa && ls.phaiCoMa && ls.phaiCoMa.length, m.ma + ' lời sai thiếu moTa / phaiCoMa');
    assert.ok(m.goiY.length >= 1);
    assert.equal(m.loaiRobot, 'xich');
    assert.equal(m.robot.than, 'xich');
    assert.equal(m.robot.tay, null, m.ma + ' tay ' + m.robot.tay);
    assert.equal(m.xichDay, true, m.ma + ' thiếu xichDay: true');
    const coMat = m.hamGoc.includes('distance');
    assert.deepEqual(m.robot.camBien.map((c) => c.ma), coMat ? ['hong-ngoai'] : [], m.ma + ' hồng ngoại phải gắn đúng khi khay có distance');
    assert.ok(['day-thung', 'toi-co'].includes(m.mucTieu), m.ma + ' mục tiêu ' + m.mucTieu);
    if (m.hang === 'trum') assert.ok(soSan(m) <= 3, m.ma + ' trùm tối đa ba sân');
    else assert.equal(soSan(m), 1, m.ma + ' nhiều sân chỉ ở trùm (luật lộ trình)');
    if (soSan(m) > 1) assert.equal(m.nhipTheo, 'tong', m.ma + ' nhiều sân phải tính tổng nhịp');
    for (const rows of dsSan(m)) assert.ok(/[Hh]/.test(rows.join('')), m.ma + ' sân không có thùng nặng');
    for (const s of ['ten', 'deBai', 'veMaMau', 'yMoi']) if (m[s]) assert.ok(!/—|\p{Extended_Pictographic}/u.test(m[s]), m.ma + ' ' + s + ' có gạch dài / emoji');
    for (const s of m.goiY.concat(m.loiSai.map((x) => x.moTa), [m.loiGiaiKhac.moTa])) assert.ok(!/—|\p{Extended_Pictographic}/u.test(s), m.ma + ' chữ có gạch dài / emoji: ' + s);
    if (m.hang === 'trum') assert.ok(m.huyHieu, m.ma + ' trùm thiếu huy hiệu');
  });
  kiem(m.ma + ': không dùng thứ của gói sau (warm, súng hơi, beSung, lucBan, return), sân không S / u / n', () => {
    for (const k of ['beSung', 'lucBan']) assert.ok(!m[k], m.ma + ' có ' + k);
    for (const h of CAM_LENH) assert.ok(!m.hamGoc.includes(h), m.ma + ' khay có ' + h);
    for (const x of moiBai(m)) {
      const d = dongCua(x);
      for (const h of CAM_LENH) assert.ok(!loiGoi(d).has(h), m.ma + ' ' + x.ten + ' gọi ' + h);
      assert.ok(!d.some((l) => /^\s*return\b/.test(l)), m.ma + ' ' + x.ten + ' dùng return (mùa 5)');
    }
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
      assert.ok(sl && sl.man === m.ma && sl.chuong === m.chuong && sl.nhom === 'xich', m.ma + ' hàm mới ' + t + ' chưa có mục Sổ lệnh đúng màn / chương / nhóm xich: ' + JSON.stringify(sl));
    }
    for (const x of m.loiGiai.hamCuaMan || []) assert.ok(!HAM_COT_TRUYEN.has(x.ten) && !kho.some((h) => h.ten === x.ten), m.ma + ' hàm của màn ' + x.ten + ' trùng hàm cốt truyện / hàm trong kho');
  });
  kiem(m.ma + ': lời giải 3 sao đúng ngưỡng, không chẩn đoán; mã mẫu chưa thắng; lời giải khác 2 sao; lời sai thua đúng mã', () => {
    const r = cham(m, m.loiGiai, m.loiGiai.hamCuaEmMoi);
    assert.ok(r.thang, m.ma + ' lời giải thua: ' + JSON.stringify(r.chanDoan.map((c) => c.ma)));
    assert.equal(r.soO, m.sao.o, m.ma + ' soO=' + r.soO + ' khai ' + m.sao.o);
    assert.equal(r.soNhip, m.sao.nhip, m.ma + ' soNhip=' + r.soNhip + ' khai ' + m.sao.nhip);
    assert.equal(r.sao, 3, m.ma + ' sao=' + r.sao);
    assert.deepEqual(r.chanDoan.map((c) => c.ma), [], m.ma + ' lời giải có chẩn đoán');
    assert.ok(r.theoSan.length === soSan(m) && r.theoSan.every((s) => s.thang));
    const rm = cham(m, m.maMau);
    assert.equal(rm.thang, false, m.ma + ' mã mẫu đã thắng sẵn');
    const rk = cham(m, m.loiGiaiKhac.baiLam, m.loiGiaiKhac.hamCuaEmMoi);
    assert.ok(rk.thang, m.ma + ' lời giải khác thua: ' + JSON.stringify(rk.chanDoan.map((c) => c.ma)));
    assert.equal(rk.sao, 2, m.ma + ' lời giải khác sao=' + rk.sao + ' (ô ' + rk.soO + ', nhịp ' + rk.soNhip + ')');
    m.loiSai.forEach((ls, i) => {
      const rl = cham(m, ls.baiLam, ls.hamCuaEmMoi);
      assert.equal(rl.thang, false, m.ma + ' lời sai ' + i + ' "' + ls.moTa + '" lại thắng');
      const ma = rl.chanDoan.map((c) => c.ma);
      for (const x of ls.phaiCoMa) assert.ok(ma.includes(x), m.ma + ' lời sai ' + i + ' "' + ls.moTa + '" thiếu mã ' + x + ' (có: ' + ma.join(',') + ')');
    });
    Object.assign(bang[m.ma], { o: r.soO, nhip: r.soNhip });
  });
  kiem(m.ma + ': bộ dò: lời cố định (không cảm biến) không phá ý màn', () => {
    const mat = docMat(m);
    if (m.mucTieu === 'toi-co') {
      const t = doDuongChung(m, m.sao.nhip, { khongDay: true });
      if (t) assert.fail(m.ma + ': coi thùng như tường mà vẫn tới cờ trong ' + t.nhip + ' nhịp: ' + t.chuoi + ' (màn mở đường không cần đẩy thùng)');
    }
    if (soSan(m) > 1) {
      const t = doDuongChung(m, m.sao.nhip);
      if (t) assert.fail(m.ma + ': dãy chung ' + t.nhip + ' nhịp ≤ ' + m.sao.nhip + ' thắng mọi sân không cần distance(): ' + t.chuoi);
      bang[m.ma].ne = 'không có dãy chung';
      return;
    }
    if (m.chinhCoDinh) {
      const hm = (m.loiGiai.hamCuaEmMoi || [])[0] || (m.loiGiai.hamCuaMan || [])[0];
      assert.ok(hm, m.ma + ' khóa chương trình chính mà không có hàm để sửa');
      const laMan = !(m.loiGiai.hamCuaEmMoi || []).length;
      const t = timLoiNeKhoa(m, hm.ten, kho, (than) => {
        const h = Object.assign({}, hm, { than });
        return laMan ? cham(m, { chinh: m.loiGiai.chinh, hamCuaMan: [h] }, []) : cham(m, { chinh: m.loiGiai.chinh, hamCuaMan: m.loiGiai.hamCuaMan }, [h]);
      });
      bang[m.ma].ne = 'khóa: thân cố định ' + (t ? t.soO + ' ô ' + t.soNhip + ' nhịp' : 'không thắng');
      if (t && t.soO <= m.sao.o && t.soNhip <= m.sao.nhip) assert.fail(m.ma + ': thân ' + hm.ten + ' cố định ' + t.soO + ' ô ≤ ' + m.sao.o + ', ' + t.soNhip + ' nhịp: ' + t.than.join(' / '));
      return;
    }
    const t = timLoiNe(m, kho, (dong, hamMoi) => cham(m, { chinh: dong }, hamMoi));
    bang[m.ma].ne = t ? t.soO + ' ô ' + t.soNhip + ' nhịp' : 'không thắng';
    if (!t) return;
    const ct = t.chinh.join(' / ') + (t.hamMoi.length ? ' với f: ' + t.hamMoi[0].than.join(' / ') : '');
    if (mat && t.soO <= m.sao.o && t.soNhip <= m.sao.nhip) assert.fail(m.ma + ': lời né distance() ' + t.soO + ' ô ≤ ' + m.sao.o + ', ' + t.soNhip + ' nhịp: ' + ct);
    if (!mat && t.soO < m.sao.o) assert.fail(m.ma + ': lời cố định ' + t.soO + ' ô rẻ hơn lời giải (' + m.sao.o + ' ô): ' + ct);
  });
}

/* ------------------------------------------------------------------ 5. đường cong, điều mới, recall */
kiem('đường cong hai chương: dòng / nhịp / ô không tường của màn n ≤ max(1,5 × màn n−1, màn n−1 + lề), trừ trùm; màn 1 dễ', () => {
  for (const c of CHUONG) {
    const ds = M.danhSach.filter((m) => m.chuong === c);
    for (let i = 1; i < ds.length; i++) {
      const m = ds[i], t = ds[i - 1];
      if (m.hang === 'trum') continue;
      const tran = (a, b, le) => a <= Math.max(1.5 * b, b + le);
      assert.ok(tran(soDong(m), soDong(t), LE.dong), m.ma + ' dòng ' + soDong(m) + ' so với ' + t.ma + ' ' + soDong(t));
      assert.ok(tran(m.sao.nhip, t.sao.nhip, LE.nhip), m.ma + ' nhịp ' + m.sao.nhip + ' so với ' + t.ma + ' ' + t.sao.nhip);
      assert.ok(tran(coSan(m), coSan(t), LE.o), m.ma + ' ô ' + coSan(m) + ' so với ' + t.ma + ' ' + coSan(t));
    }
  }
  const dau = get('day-thung.1');
  assert.ok(soDong(dau) <= 3, 'day-thung.1 phải dễ: ' + soDong(dau) + ' dòng');
});
const viTri = (m) => M.danhSach.indexOf(m);
const dauGoi = M.danhSach.find((m) => m.chuong === 'day-thung');
const biet = new Set();
for (const m of M.danhSach.slice(0, viTri(dauGoi))) for (const f of dacTrung(m)) biet.add(f);
const dieuMoi = {};
kiem('mỗi màn thêm tối đa MỘT điều mới (so với mọi màn đứng trước, đặc trưng đọc từ lời giải và sân)', () => {
  const da = new Set(biet);
  for (const m of DS) {
    const moi = [...dacTrung(m)].filter((f) => !da.has(f));
    dieuMoi[m.ma] = moi;
    if (m.hang !== 'trum') assert.ok(moi.length <= 1, m.ma + ' thêm ' + moi.length + ' điều mới: ' + moi.join(', '));
    for (const f of dacTrung(m)) da.add(f);
  }
});
// Thứ của gói 1–4 mùa 2 hay mùa 1 (ngoài move / back / tr_right / tr_left cơ bản của xích)
const HAM_CU = new Set(khoTruoc.get(dauGoi.ma).map((h) => h.ten));
const recall = (m) => {
  const d = dongCua({ b: m.loiGiai, moi: [] });
  const ds = [...loiGoi(d)].filter((t) => HAM_CU.has(t) && !['move', 'back', 'tr_right', 'tr_left'].includes(t));
  if (d.some((l) => /^\s*for\b/.test(l))) ds.push('for');
  if (d.some((l) => /distance\(\)/.test(l))) ds.push('distance');
  const chu = dsSan(m).map((s) => s.join('')).join('');
  if (/[<>^v]/.test(chu)) ds.push('băng chuyền');
  if (/M/.test(chu)) ds.push('nút đè');
  if (/[Cc]/.test(chu)) ds.push('cửa');
  if ((m.loiGiai.hamCuaEmMoi || []).some((h) => h.thamSo.length)) ds.push('tham số');
  return [...new Set(ds)];
};
kiem('recall: ít nhất 4 màn dùng thứ của gói 1–4 mùa 2 hay mùa 1 (hàm của em cũ, for, distance, băng chuyền, nút đè, cửa, tham số)', () => {
  const co = DS.filter((m) => recall(m).length);
  assert.ok(co.length >= 4, 'chỉ ' + co.length + ' màn recall');
});
kiem('ít nhất một màn đố / sửa lỗi mỗi chương (tên có "Đố" / "Sửa", hay đề nhắc bản của Sola)', () => {
  for (const c of CHUONG) assert.ok(DS.some((m) => m.chuong === c && (/^(Đố|Sửa)/.test(m.ten) || /Sola/.test(m.deBai))), c);
});
kiem('màn đọc distance(): ít nhất một màn chương day-thung', () => {
  assert.ok(DS.some((m) => m.chuong === 'day-thung' && docMat(m)));
});

/* ------------------------------------------------------------------ bảng */
console.log('chương | số | mã | tên | điều mới (yMoi) | dòng | nhịp | ô không tường | ô code | lời cố định rẻ nhất | recall');
for (const m of DS) {
  const b = bang[m.ma] || {};
  console.log([m.chuong, m.so, m.ma, m.ten, (dieuMoi[m.ma] || []).join(', ') + ' (yMoi: ' + m.yMoi + ')', soDong(m), m.sao.nhip, coSan(m), m.sao.o, b.ne || '?', recall(m).join(',')].join(' | '));
}
if (LOI_GIA) {
  const doDu = LOI_GIA_DS.every((x) => hongMuc.some((t) => t.startsWith(x)));
  console.log('Lỗi giả: cắm ' + LOI_GIA_DS.length + ', mục đỏ ' + hongMuc.length + ' → ' + (doDu ? 'ĐỎ ĐỦ' : 'THIẾU: ' + LOI_GIA_DS.filter((x) => !hongMuc.some((t) => t.startsWith(x))).join('; ')));
  process.exit(doDu ? 0 : 1);
}
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong + ' kiểm tra 20 màn gói Đẩy thùng.');
if (hong) process.exitCode = 1;
