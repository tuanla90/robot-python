/* ============================================================================
   kiem-che-luc-ban.mjs — máy kiểm 10 màn mới của mùa 2, gói 6 "Lực bắn", chương 2 `che-luc-ban` "Hàm lực bắn" (man-che-luc-ban.js).
   Chương 1 `luc-ban` có sẵn (man-luc-ban.js, kiem-luc-ban.mjs kiểm). Màn 10 là trùm có huy hiệu `che-luc-ban`.
   1. Vị trí: gói luc-ban (mùa 2) có hai chương luc-ban, che-luc-ban; che-luc-ban đúng 10 màn mới theo `so`, hạng lam-quen ×3 · luyen ×3 · bien-the ×3 · trum;
      trùm mang huy hiệu đúng mã chương (huy-hieu.js có hình), không màn nào khác của chương mang huy hiệu.
   2. Từng màn: đủ trường (≥ 2 lời sai có phaiCoMa), robot xe HAI BÁNH gắn súng hơi (mắt hồng ngoại đúng khi khay có distance), lucBan ở MỌI màn;
      nhiều sân chỉ ở trùm (+ nhipTheo 'tong'); lời giải thắng 3 sao, đúng sao.o / sao.nhip, KHÔNG chẩn đoán; mã mẫu chưa thắng; lời giải khác đúng 2 sao;
      công thức khác (nếu có) thắng; lời sai thua và có đủ mã phaiCoMa; chữ hiển thị không emoji, không gạch dài.
   3. Hàm của em: mọi hàm màn cần đã được tạo ở màn đứng trước, mọi lời gọi khai trong hamCuaEmCan; hàm mới (taoHam) không trùng hàm cốt truyện nào (kể cả mùa ẩn)
      và có mục Sổ lệnh đúng màn / chương, nhóm hoi; hàm của màn không trùng hàm cốt truyện / hàm trong kho.
   4. Không dùng thứ của gói sau / thứ lạ: không warm() (gói 7), beSung (gói 9), xichDay, return (mùa 5); sân không S / u / n.
   5. Đường cong: dòng lời giải / nhịp / số ô không tường của màn n ≤ max(1,5 × màn n−1, màn n−1 + lề) (lề +3 dòng, +4 nhịp, +6 ô), trùm được miễn,
      che-luc-ban.1 so với luc-ban.10; mỗi màn thêm TỐI ĐA MỘT điều mới (đặc trưng đọc từ lời giải và sân, so với mọi màn đứng trước);
      recall: ≥ 4 màn dùng thứ của gói 1–5 mùa 2 hay mùa 1; có màn sửa hàm lỗi và màn đố.
   6. Bộ dò (do-duong-sung-hoi.mjs BFS + do-duong-che-luc-ban.mjs; lời tìm được chấm thật bằng cham.js):
      - BFS tự do (mỗi sân) không dài hơn sao.nhip (lời giải không "nhanh hơn đường ngắn nhất");
      - màn đọc distance() (thẳng hay qua hàm của em): màn khóa chương trình chính: KHÔNG thân hàm cố định (không cảm biến) nào được 3 sao;
        màn nhiều sân: không có dãy chung nào thắng mọi sân trong sao.nhip; màn mở một sân: lời cố định (kể cả hàm phụ f() / g(p)) không được 3 sao;
      - màn không cảm biến, khóa: thân hàm là dãy cố định (ghi chú); không khóa: lời cố định rẻ nhất không rẻ hơn lời giải (ngưỡng ô chặt).
   Chạy: node hoc/kiem-che-luc-ban.mjs              (trượt thì thoát mã 1)
         node hoc/kiem-che-luc-ban.mjs --loi-gia    (cắm lỗi giả: các mục bị cắm phải ĐỎ; thoát 0 khi đỏ đủ)
   ========================================================================== */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Cham = require('./cham.js');
const M = require('./lo-trinh-hoc.js');
const TT = require('./thu-tu-chuong.js');
const SL = require('./so-lenh.js');
const Bo = await import('./do-duong-sung-hoi.mjs');
const { timLoiNe, timLoiNeKhoa, doDuongChung } = await import('./do-duong-che-luc-ban.mjs');
const clone = (x) => JSON.parse(JSON.stringify(x));
const LOI_GIA = process.argv.includes('--loi-gia');

let dat = 0, hong = 0;
const hongMuc = [];
function kiem(ten, fn) {
  try { fn(); dat++; } catch (e) { hong++; hongMuc.push(ten); console.log('  HỎNG ' + ten + '\n       ' + (e && e.message ? e.message.split('\n')[0] : e)); }
}

const CHUONG = 'che-luc-ban';
const LE = { dong: 3, nhip: 4, o: 6 };
const get = (ma) => M.timMa(ma);
const dsSan = (m) => (Array.isArray(m.san[0]) ? m.san : [m.san]);
const soSan = (m) => dsSan(m).length;

/* ------------------------------------------------------------------ lỗi giả (--loi-gia): mỗi lỗi làm đỏ một mục */
const LOI_GIA_DS = [];
if (LOI_GIA) {
  const a = get('che-luc-ban.1'), b = get('che-luc-ban.2'), c = get('che-luc-ban.3'), d = get('che-luc-ban.4'), t = get('che-luc-ban.10');
  a.sao = Object.assign({}, a.sao, { nhip: a.sao.nhip - 1 }); LOI_GIA_DS.push('che-luc-ban.1: lời giải');      // ngưỡng nhịp sai → lời giải chỉ 2 sao
  b.loiSai[0].phaiCoMa = ['vat-vo']; LOI_GIA_DS.push('che-luc-ban.2: lời giải');                              // lời sai thiếu mã
  b.hamCuaEmCan = b.hamCuaEmCan.concat(['fly_home']); LOI_GIA_DS.push('che-luc-ban.2: hàm của em');           // hàm chưa ai tạo
  a.loiGiai.chinh = a.loiGiai.chinh.concat(['w = warm()']); LOI_GIA_DS.push('che-luc-ban.1: không dùng thứ');  // warm() là gói 7
  c.san = [c.san, c.san]; c.batDau = [c.batDau, c.batDau]; LOI_GIA_DS.push('che-luc-ban.3: đủ trường');       // nhiều sân ở màn không phải trùm
  d.lucBan = false; LOI_GIA_DS.push('che-luc-ban.4: đủ trường');                                               // quên cờ lực bắn
  t.sao = Object.assign({}, t.sao, { nhip: t.sao.nhip + 5 }); LOI_GIA_DS.push('che-luc-ban.10: bộ dò');      // ngưỡng nhịp rộng: dãy chung không cảm biến cũng 3 sao
  t.huyHieu = null; LOI_GIA_DS.push('huy hiệu');                                                               // trùm mất huy hiệu
  get('che-luc-ban.7').taoHam = ['sweep']; LOI_GIA_DS.push('che-luc-ban.7: hàm của em');                      // trùng hàm cốt truyện che-lap.5
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
function loiGoi(dong) { const s = new Set(); for (const l of dong || []) for (const x of l.replace(/"[^"]*"/g, '""').matchAll(/([A-Za-z_]\w*)\s*\(/g)) s.add(x[1]); return s; }
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
/** Lời giải có đọc distance() (thẳng hay qua hàm của em). */
const docMat = (m) => bacCau(m, dongLoiGiai(m), m.loiGiai.hamCuaEmMoi).dong.some((l) => /distance\(\)/.test(l));

/* ------------------------------------------------------------------ đặc trưng (điều mới) của một màn, đọc từ lời giải và sân */
const RE_SO_SANH = /(<=|>=|==|!=|<|>)\s*(\d+|[A-Za-z_]\w*)/g;
function dacTrung(m) {
  const lg = m.loiGiai, moi = lg.hamCuaEmMoi || [], cuaMan = lg.hamCuaMan || [];
  const dong = dongLoiGiai(m);
  const f = new Set();
  for (const l of dong) {
    if (/distance\(\)/.test(l)) f.add('distance');
    if (/^\s*while\b/.test(l)) f.add(/^\s*while True:/.test(l) ? 'while True' : 'while');
    if (/^\s*if\b/.test(l)) f.add('if');
    if (/^\s*else\s*:/.test(l)) f.add('else');
    if (/^\s*for\b/.test(l)) f.add('for');
    if (/^\s*[A-Za-z_]\w*\s*=\s*"/.test(l)) f.add('bien = chuoi');
    else if (/^\s*[A-Za-z_]\w*\s*=\s*\d+\s*$/.test(l)) f.add('bien = so');
    else if (/^\s*[A-Za-z_]\w*\s*([-+]=|=\s*[A-Za-z_]\w*\s*[-+])/.test(l)) f.add('bien dem');
    for (const x of l.matchAll(RE_SO_SANH)) if (!/^\s*for\b/.test(l)) f.add('so sanh ' + x[1] + (/^\d+$/.test(x[2]) ? ' so' : ' bien'));
    if (/\b(shoot|shoot_back|fire|fire_back)\("(fast|charge)"\)/.test(l)) f.add('luc ban');
  }
  for (const h of moi.concat(cuaMan)) {
    if (h.thamSo.length && h.than.some((l) => new RegExp('\\((' + h.thamSo.join('|') + ')\\)').test(l) && /\b(shoot|shoot_back|fire|fire_back)\(/.test(l))) f.add('tham so luc');
    if (h.than.some((l) => /distance\(\)/.test(l)) && h.than.some((l) => /\b(shoot|fire)\w*\(/.test(l))) f.add('chon luc theo distance');
  }
  for (const h of moi) {
    f.add(h.thamSo.length > 1 ? 'tao ham hai tham so' : h.thamSo.length ? 'tao ham co tham so' : 'tao ham');
    const kho = new Map(khoTruoc.get(m.ma).map((x) => [x.ten, x]));
    const goiKho = [...loiGoi(h.than)].filter((t) => kho.has(t));
    if (goiKho.length) f.add('ham goi ham');
    if (goiKho.some((t) => bacCau(m, [t + '()'], []).dong.some((l) => /distance\(\)/.test(l)))) f.add('ham goi ham cam bien');
    if (h.than.some((l) => /^\s*for\b/.test(l))) f.add('for trong ham');
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
const goi = TT.goi.find((g) => g.ma === 'luc-ban');
const DS = M.danhSach.filter((m) => m.chuong === CHUONG);
kiem('gói luc-ban (mùa 2): hai chương luc-ban, che-luc-ban; che-luc-ban 10 màn mới đúng so và hạng', () => {
  assert.ok(goi && goi.mua === 'mua-2', 'không thấy gói luc-ban ở mùa 2');
  assert.deepEqual(goi.chuong, ['luc-ban', CHUONG]);
  assert.deepEqual(DS.map((m) => m.ma), Array.from({ length: 10 }, (_, i) => CHUONG + '.' + (i + 1)));
  assert.deepEqual(DS.map((m) => m.hang), DS.map((_, i) => (i < 3 ? 'lam-quen' : i < 6 ? 'luyen' : i < 9 ? 'bien-the' : 'trum')));
  assert.equal((M.manCheLucBan || []).length, 10, 'ManHoc.manCheLucBan phải có 10 màn');
  assert.equal(M.danhSach.indexOf(DS[0]), M.danhSach.indexOf(get('luc-ban.10')) + 1, 'che-luc-ban.1 phải đứng ngay sau luc-ban.10');
});
kiem('tên màn không trùng trong chương và không trùng màn khác của lộ trình', () => {
  const ten = DS.map((m) => m.ten);
  assert.equal(new Set(ten).size, ten.length, 'trùng tên: ' + ten.filter((t, i) => ten.indexOf(t) !== i));
  const cu = M.danhSach.filter((m) => m.chuong !== CHUONG).map((m) => m.ten);
  for (const t of ten) assert.ok(!cu.includes(t), 'tên "' + t + '" trùng một màn khác');
});
kiem('huy hiệu: chỉ trùm mang, mã che-luc-ban; huy-hieu.js có hình', () => {
  const hh = fs.readFileSync(new URL('./game/huy-hieu.js', import.meta.url), 'utf8');
  const trum = DS[DS.length - 1];
  assert.equal(trum && trum.hang, 'trum');
  assert.equal(trum.huyHieu && trum.huyHieu.ma, CHUONG, 'trùm thiếu huy hiệu');
  assert.ok(trum.huyHieu.ten && !/[—]/.test(trum.huyHieu.ten));
  for (const m of DS.slice(0, -1)) assert.ok(!m.huyHieu, m.ma + ' không phải trùm mà có huy hiệu');
  assert.ok(/HINH\['che-luc-ban'\]\s*=\s*function/.test(hh), "huy-hieu.js thiếu HINH['che-luc-ban']");
});

/* ------------------------------------------------------------------ 2–4, 6. từng màn */
const CAM_LENH = ['warm'];
const HAM_COT_TRUYEN = new Map();
for (const m of M.danhSach) for (const t of m.taoHam || []) if (!HAM_COT_TRUYEN.has(t)) HAM_COT_TRUYEN.set(t, m.ma);
const bang = {};
for (const m of DS) {
  const kho = khoTruoc.get(m.ma), daTao = daTaoTruoc.get(m.ma);
  bang[m.ma] = {};
  kiem(m.ma + ': đủ trường, robot hai bánh súng hơi, lực bắn, khay, một sân', () => {
    for (const k of ['ten', 'deBai', 'san', 'batDau', 'mucTieu', 'hamGoc', 'robot', 'sao', 'maMau', 'loiGiai', 'loiGiaiKhac', 'goiY', 'hamCuaEmCan', 'yMoi']) assert.ok(m[k] !== undefined && m[k] !== '', m.ma + ' thiếu ' + k);
    assert.ok(m.loiSai.length >= 2, m.ma + ' cần ít nhất 2 lời sai');
    for (const ls of m.loiSai) assert.ok(ls.moTa && ls.phaiCoMa && ls.phaiCoMa.length, m.ma + ' lời sai thiếu moTa / phaiCoMa');
    assert.ok(m.goiY.length >= 1);
    assert.equal(m.loaiRobot, 'banh');
    assert.equal(m.robot.than, 'hai-banh');
    assert.equal(m.robot.tay, 'hoi', m.ma + ' tay ' + m.robot.tay);
    assert.equal(m.lucBan, true, m.ma + ' thiếu lucBan: true');
    for (const h of ['shoot', 'shoot_back']) assert.ok(m.hamGoc.includes(h), m.ma + ' khay thiếu ' + h);
    const coMat = m.hamGoc.includes('distance');
    assert.deepEqual(m.robot.camBien.map((c) => c.ma), coMat ? ['hong-ngoai'] : [], m.ma + ' hồng ngoại phải gắn đúng khi khay có distance');
    assert.ok(['toi-co', 'bong-mo', 'day-thung'].includes(m.mucTieu), m.ma + ' mục tiêu ' + m.mucTieu);
    if (m.hang === 'trum') assert.ok(soSan(m) <= 3, m.ma + ' trùm tối đa ba sân');
    else assert.equal(soSan(m), 1, m.ma + ' nhiều sân chỉ ở trùm (luật lộ trình)');
    if (soSan(m) > 1) assert.equal(m.nhipTheo, 'tong', m.ma + ' nhiều sân phải tính tổng nhịp');
    for (const rows of dsSan(m)) assert.ok(/N/.test(rows.join('')), m.ma + ' sân không có nút bắn');
    for (const s of ['ten', 'deBai', 'veMaMau', 'yMoi']) if (m[s]) assert.ok(!/—|\p{Extended_Pictographic}/u.test(m[s]), m.ma + ' ' + s + ' có gạch dài / emoji');
    for (const s of m.goiY.concat(m.loiSai.map((x) => x.moTa), [m.loiGiaiKhac.moTa], (m.congThucKhac || []).map((x) => x.moTa))) assert.ok(!/—|\p{Extended_Pictographic}/u.test(s), m.ma + ' chữ có gạch dài / emoji: ' + s);
    if (m.hang === 'trum') assert.ok(m.huyHieu, m.ma + ' trùm thiếu huy hiệu');
  });
  kiem(m.ma + ': không dùng thứ của gói sau (warm, beSung, xichDay, return), sân không S / u / n', () => {
    for (const k of ['beSung', 'xichDay']) assert.ok(!m[k], m.ma + ' có ' + k);
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
      assert.ok(sl && sl.man === m.ma && sl.chuong === m.chuong && sl.nhom === 'hoi', m.ma + ' hàm mới ' + t + ' chưa có mục Sổ lệnh đúng màn / chương / nhóm hoi: ' + JSON.stringify(sl));
    }
    for (const x of m.loiGiai.hamCuaMan || []) assert.ok(!HAM_COT_TRUYEN.has(x.ten) && !kho.some((h) => h.ten === x.ten), m.ma + ' hàm của màn ' + x.ten + ' trùng hàm cốt truyện / hàm trong kho');
  });
  kiem(m.ma + ': lời giải 3 sao đúng ngưỡng, không chẩn đoán; mã mẫu chưa thắng; lời giải khác 2 sao; công thức khác thắng; lời sai thua đúng mã', () => {
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
    (m.congThucKhac || []).forEach((c, i) => { const rc = cham(m, c.baiLam, c.hamCuaEmMoi); assert.ok(rc.thang, m.ma + ' công thức khác ' + i + ' "' + c.moTa + '" thua'); });
    m.loiSai.forEach((ls, i) => {
      const rl = cham(m, ls.baiLam, ls.hamCuaEmMoi);
      assert.equal(rl.thang, false, m.ma + ' lời sai ' + i + ' "' + ls.moTa + '" lại thắng');
      const ma = rl.chanDoan.map((c) => c.ma);
      for (const x of ls.phaiCoMa) assert.ok(ma.includes(x), m.ma + ' lời sai ' + i + ' "' + ls.moTa + '" thiếu mã ' + x + ' (có: ' + ma.join(',') + ')');
    });
    Object.assign(bang[m.ma], { o: r.soO, nhip: r.soNhip });
  });
  kiem(m.ma + ': bộ dò: BFS không ngắn hơn lời giải một cách vô lý; lời cố định (không cảm biến) không phá ý màn', () => {
    // BFS tự do mỗi sân (cộng lại khi nhiều sân): sao.nhip không được nhỏ hơn đường ngắn nhất
    let bfs = 0;
    dsSan(m).forEach((_, i) => {
      const con = Object.assign({}, m, { san: dsSan(m)[i], batDau: Array.isArray(m.batDau) ? m.batDau[i] : m.batDau, noi: Array.isArray(m.noi && m.noi[0]) ? m.noi[i] : m.noi });
      const k = Bo.nhipSungHoiNganNhat(con).nhip;
      bfs = bfs === null || k === null ? null : bfs + k;
    });
    assert.ok(bfs !== null && bfs <= m.sao.nhip, m.ma + ' BFS ' + bfs + ' > sao.nhip ' + m.sao.nhip);
    bang[m.ma].bfs = bfs;
    const mat = docMat(m);
    if (soSan(m) > 1) {
      const t = doDuongChung(m, m.sao.nhip);
      if (t) assert.fail(m.ma + ': dãy chung ' + t.nhip + ' nhịp ≤ ' + m.sao.nhip + ' thắng mọi sân không cần distance(): ' + t.chuoi);
      bang[m.ma].ne = 'không có dãy chung ≤ ' + m.sao.nhip + ' nhịp';
      return;
    }
    if (m.chinhCoDinh) {
      const hm = (m.loiGiai.hamCuaEmMoi || [])[0] || (m.loiGiai.hamCuaMan || [])[0];
      assert.ok(hm, m.ma + ' khóa chương trình chính mà không có hàm để viết / sửa');
      if (!bacCau(m, hm.than, m.loiGiai.hamCuaEmMoi).dong.some((l) => /distance\(\)/.test(l))) { bang[m.ma].ne = 'khóa: thân ' + hm.ten + ' không cảm biến (lời giải là dãy cố định)'; return; }
      const laMan = !(m.loiGiai.hamCuaEmMoi || []).length;
      const t = timLoiNeKhoa(m, hm.ten, kho, (than) => {
        const h = Object.assign({}, hm, { than });
        return laMan ? cham(m, { chinh: m.loiGiai.chinh, hamCuaMan: [h] }, []) : cham(m, { chinh: m.loiGiai.chinh, hamCuaMan: m.loiGiai.hamCuaMan }, [h]);
      });
      bang[m.ma].ne = 'khóa: thân cố định ' + (t.khong ? 'không thắng' : t.soO + ' ô ' + t.soNhip + ' nhịp');
      if (!t.khong && t.soO <= m.sao.o && t.soNhip <= m.sao.nhip) assert.fail(m.ma + ': thân ' + hm.ten + ' cố định ' + t.soO + ' ô ≤ ' + m.sao.o + ', ' + t.soNhip + ' nhịp: ' + t.than.join(' / '));
      return;
    }
    const t = timLoiNe(m, kho, (dong, hamMoi) => cham(m, { chinh: dong }, hamMoi));
    bang[m.ma].ne = t.khong ? 'không thắng' : t.soO + ' ô ' + t.soNhip + ' nhịp';
    if (t.khong) return;
    const ct = t.chinh.join(' / ') + (t.hamMoi.length ? ' với ' + t.hamMoi[0].ten + ': ' + t.hamMoi[0].than.join(' / ') : '');
    if (mat && t.soO <= m.sao.o && t.soNhip <= m.sao.nhip) assert.fail(m.ma + ': lời né distance() ' + t.soO + ' ô ≤ ' + m.sao.o + ', ' + t.soNhip + ' nhịp: ' + ct);
    if (!mat && t.soO < m.sao.o) assert.fail(m.ma + ': lời cố định ' + t.soO + ' ô rẻ hơn lời giải (' + m.sao.o + ' ô): ' + ct);
  });
}

/* ------------------------------------------------------------------ 5. đường cong, điều mới, recall */
kiem('đường cong: dòng / nhịp / ô không tường của màn n ≤ max(1,5 × màn n−1, màn n−1 + lề), trừ trùm; che-luc-ban.1 so với luc-ban.10', () => {
  const ds = [get('luc-ban.10')].concat(DS);
  for (let i = 1; i < ds.length; i++) {
    const m = ds[i], t = ds[i - 1];
    if (m.hang === 'trum') continue;
    const tran = (a, b, le) => a <= Math.max(1.5 * b, b + le);
    assert.ok(tran(soDong(m), soDong(t), LE.dong), m.ma + ' dòng ' + soDong(m) + ' so với ' + t.ma + ' ' + soDong(t));
    assert.ok(tran(m.sao.nhip, t.sao.nhip, LE.nhip), m.ma + ' nhịp ' + m.sao.nhip + ' so với ' + t.ma + ' ' + t.sao.nhip);
    assert.ok(tran(coSan(m), coSan(t), LE.o), m.ma + ' ô ' + coSan(m) + ' so với ' + t.ma + ' ' + coSan(t));
  }
});
const viTri = (m) => M.danhSach.indexOf(m);
const biet = new Set();
for (const m of M.danhSach.slice(0, viTri(DS[0]))) for (const f of dacTrung(m)) biet.add(f);
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
// Thứ của gói 1–5 mùa 2 hay mùa 1: hàm của em có trước gói Lực bắn (trừ move / turn_left / turn_right / u_turn cơ bản), for, distance, băng chuyền, nút đè, thùng nặng
const HAM_CU = new Set(khoTruoc.get('luc-ban.1').map((h) => h.ten));
const recall = (m) => {
  const d = dongCua({ b: m.loiGiai, moi: m.loiGiai.hamCuaEmMoi });
  const ds = [...loiGoi(d)].filter((t) => HAM_CU.has(t) && !['move', 'turn_left', 'turn_right', 'u_turn'].includes(t));
  if (d.some((l) => /^\s*for\b/.test(l))) ds.push('for');
  if (d.some((l) => /distance\(\)/.test(l))) ds.push('distance');
  const chu = dsSan(m).map((s) => s.join('')).join('');
  if (/[<>^v]/.test(chu)) ds.push('băng chuyền');
  if (/M/.test(chu)) ds.push('nút đè');
  if (/[Hh]/.test(chu)) ds.push('thùng nặng');
  return [...new Set(ds)];
};
kiem('recall: ít nhất 4 màn dùng thứ của gói 1–5 mùa 2 hay mùa 1 (hàm của em cũ như forward, go_to_wall; for; distance; băng chuyền; thùng nặng)', () => {
  const co = DS.filter((m) => recall(m).length);
  assert.ok(co.length >= 4, 'chỉ ' + co.length + ' màn recall');
});
kiem('có màn sửa hàm lỗi (tên "Sửa…", hàm của màn) và màn đố (tên "Đố…"); có màn chọn lực bằng distance()', () => {
  assert.ok(DS.some((m) => /^Sửa/.test(m.ten) && (m.loiGiai.hamCuaMan || []).length), 'thiếu màn sửa hàm');
  assert.ok(DS.some((m) => /^Đố/.test(m.ten)), 'thiếu màn đố');
  assert.ok(DS.some((m) => m.chinhCoDinh && docMat(m)), 'thiếu màn khóa chọn lực bằng distance()');
});

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
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong + ' kiểm tra 10 màn chương Hàm lực bắn.');
if (hong) process.exitCode = 1;
