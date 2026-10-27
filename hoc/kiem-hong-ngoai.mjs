/* ============================================================================
   kiem-hong-ngoai.mjs — máy kiểm 20 màn mới của mùa 2, gói 3 "Hồng ngoại" (man-hong-ngoai.js):
   chương hong-ngoai (làm quen distance()) và che-hong-ngoai "Hàm cho hồng ngoại"; màn 10 mỗi chương là trùm có huy hiệu.
   1. Vị trí: gói hong-ngoai (mùa 2) có hai chương, mỗi chương đúng 10 màn mới theo `so`, hạng lam-quen ×3 · luyen ×3 · bien-the ×3 · trum;
      trùm mang huy hiệu đúng mã chương (huy-hieu.js có hình), không màn nào khác của gói mang huy hiệu.
   2. Từng màn: đủ trường (≥ 2 lời sai có phaiCoMa), robot xe hai bánh + hồng ngoại (tay kẹp được), khay có distance; NHIỀU SÂN + nhipTheo 'tong';
      lời giải thắng 3 sao, đúng sao.o / sao.nhip, KHÔNG chẩn đoán; mã mẫu chưa thắng; lời giải khác đúng 2 sao; lời sai thua và có đủ mã phaiCoMa.
   3. Hàm của em: mọi hàm màn cần đã được tạo ở màn đứng trước (theo thứ tự lộ trình) và lời gọi nào cũng khai trong hamCuaEmCan; hàm mới (taoHam) có mục Sổ lệnh.
   4. Không dùng thứ của gói sau: không warm(), không xichDay / beSung / lucBan, không shoot("…"), không return (mùa 5); sân không S / u / n.
   5. Đường cong cả hai chương: dòng lời giải / nhịp / số ô không tường của màn n ≤ max(1,5 × màn n−1, màn n−1 + lề) (lề +3 dòng, +4 nhịp, +6 ô), trùm được miễn;
      mỗi màn thêm TỐI ĐA MỘT điều mới (bảng đặc trưng đọc từ lời giải: distance, phép so sánh, biến, while / if / else, hàm của em mới, hàm có tham số, vật…);
      màn 1 chương 1 dễ (≤ 5 dòng); recall: ≥ 4 màn dùng thứ của gói 1–2 mùa 2 hay mùa 1 (hàm của em cũ, for, tay kẹp, forward(n)…).
   6. Phép so số (>, <=, == … với số): in ra màn đầu tiên dùng nó TRƯỚC gói 3; nếu chưa có thì màn đầu của gói dùng phép so phải tự giới thiệu (đề + gợi ý).
   7. Bộ dò đường tắt: BFS CHUNG mọi sân (một dãy lệnh cố định chạy trên mọi sân, khối chuẩn move / back / turn_right / turn_left / u_turn 1 nhịp, pick / drop 2 nhịp)
      không tìm được lời nào KHÔNG đọc distance() mà thắng mọi sân với tổng nhịp ≤ sao.nhip (màn hồng ngoại giải được không cần distance là màn hỏng ý).
      Đường tắt tìm được (nếu có) chạy thật bằng cham.js để chắc bộ dò đúng luật.
   Chạy: node hoc/kiem-hong-ngoai.mjs              (trượt thì thoát mã 1)
         node hoc/kiem-hong-ngoai.mjs --loi-gia    (cắm lỗi giả: các mục bị cắm phải ĐỎ; thoát 0 khi đỏ đủ)
   ========================================================================== */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Cham = require('./cham.js');
const SanHoc = require('./san-hoc.js');
const M = require('./lo-trinh-hoc.js');
const TT = require('./thu-tu-chuong.js');
const SL = require('./so-lenh.js');
const clone = (x) => JSON.parse(JSON.stringify(x));
const LOI_GIA = process.argv.includes('--loi-gia');

let dat = 0, hong = 0;
const hongMuc = [];
function kiem(ten, fn) {
  try { fn(); dat++; } catch (e) { hong++; hongMuc.push(ten); console.log('  HỎNG ' + ten + '\n       ' + (e && e.message ? e.message.split('\n')[0] : e)); }
}

const CHUONG = ['hong-ngoai', 'che-hong-ngoai'];
const HUY = { 'hong-ngoai': 'hong-ngoai', 'che-hong-ngoai': 'che-hong-ngoai' };
const LE = { dong: 3, nhip: 4, o: 6 };
const get = (ma) => M.timMa(ma);
const dsSan = (m) => (Array.isArray(m.san[0]) ? m.san : [m.san]);
const soSan = (m) => dsSan(m).length;
const theoSan = (v, i) => (Array.isArray(v) ? v[i] : v);

/* ------------------------------------------------------------------ lỗi giả (--loi-gia): mỗi lỗi làm đỏ một mục */
const LOI_GIA_DS = [];
if (LOI_GIA) {
  const a = get('hong-ngoai.1'), b = get('hong-ngoai.2');
  a.sao = Object.assign({}, a.sao, { nhip: a.sao.nhip - 1 }); LOI_GIA_DS.push('hong-ngoai.1: lời giải'); // ngưỡng nhịp sai → lời giải chỉ 2 sao
  b.loiSai[0].phaiCoMa = ['vat-vo']; LOI_GIA_DS.push('hong-ngoai.2: lời giải');                          // lời sai thiếu mã
  b.hamCuaEmCan = b.hamCuaEmCan.concat(['fly_home']); LOI_GIA_DS.push('hong-ngoai.2: hàm của em');       // hàm chưa ai tạo
  a.loiGiai.chinh = a.loiGiai.chinh.concat(['w = warm()']); LOI_GIA_DS.push('hong-ngoai.1: không dùng thứ'); // warm() là gói 7
  b.san = [['......', '......', '......', '...F..'], ['......', '......', '......', '...F..']]; LOI_GIA_DS.push('hong-ngoai.2: bộ dò');    // sân trống: đếm cứng thắng
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
/** Thân mọi hàm của em được gọi tới (bắc cầu) từ các dòng, theo kho trước màn + hàm mới. */
function bacCau(m, dong, moi) {
  const bang = new Map(khoTruoc.get(m.ma).map((h) => [h.ten, h]));
  for (const h of moi || []) bang.set(h.ten, h);
  const kq = [...dong], da = new Set(), cho = [...loiGoi(dong)];
  while (cho.length) { const t = cho.pop(); if (da.has(t) || !bang.has(t)) continue; da.add(t); kq.push(...bang.get(t).than); cho.push(...loiGoi(bang.get(t).than)); }
  return { dong: kq, goi: da };
}

/* ------------------------------------------------------------------ đặc trưng (điều mới) của một màn, đọc từ lời giải */
const RE_SO_SANH = /(<=|>=|==|!=|<|>)\s*(\d+|[A-Za-z_]\w*)/g;
function dacTrung(m) {
  const lg = m.loiGiai, moi = lg.hamCuaEmMoi || [];
  const dong = [...(lg.chinh || []), ...(lg.hamCuaMan || []).concat(moi).flatMap((h) => h.than)];
  const f = new Set();
  for (const l of dong) {
    if (/distance\(\)/.test(l)) f.add('distance');
    if (/^\s*while\b/.test(l)) f.add('while');
    if (/^\s*if\b/.test(l)) f.add('if');
    if (/^\s*else\s*:/.test(l)) f.add('else');
    if (/^\s*for\b/.test(l)) f.add('for');
    if (/^\s*[A-Za-z_]\w*\s*=\s*distance\(\)/.test(l)) { /* gán số đọc được vào biến: cùng ý "distance()" (biến đã học ở gói 1) */ }
    else if (/^\s*[A-Za-z_]\w*\s*=\s*\d+\s*$/.test(l)) f.add('bien = so');
    else if (/^\s*[A-Za-z_]\w*\s*([-+]=|=\s*[A-Za-z_]\w*\s*[-+])/.test(l)) f.add('bien dem');
    for (const x of l.matchAll(RE_SO_SANH)) if (!/^\s*for\b/.test(l)) f.add('so sanh ' + x[1] + (/^\d+$/.test(x[2]) ? ' so' : ' bien'));
    for (const x of l.matchAll(/([A-Za-z_]\w*)\(\s*distance\(\)\s*\)/g)) f.add('distance() lam doi so');
  }
  for (const h of moi) f.add(h.thamSo.length ? 'tao ham co tham so' : 'tao ham');
  if ((lg.hamCuaMan || []).length) f.add(m.chinhCoDinh ? 'chuong trinh khoa' : 'ham cua man');
  if (m.mucTieu === 'dua-vat') f.add('dua vat');
  if (dsSan(m).some((s) => /o/.test(s.join('')))) f.add('vat can la vat');
  if (dsSan(m).some((s) => /H/.test(s.join('')))) f.add('vat can la thung');
  return f;
}

/* ------------------------------------------------------------------ 1. vị trí */
const goi = TT.goi.find((g) => g.ma === 'hong-ngoai');
const DS = CHUONG.flatMap((c) => M.danhSach.filter((m) => m.chuong === c));
kiem('gói hong-ngoai (mùa 2): hai chương hong-ngoai, che-hong-ngoai, mỗi chương 10 màn mới đúng so và hạng', () => {
  assert.ok(goi && goi.mua === 'mua-2', 'không thấy gói hong-ngoai ở mùa 2');
  assert.deepEqual(goi.chuong, CHUONG);
  for (const c of CHUONG) {
    const ds = M.danhSach.filter((m) => m.chuong === c);
    assert.deepEqual(ds.map((m) => m.ma), Array.from({ length: 10 }, (_, i) => c + '.' + (i + 1)), c);
    assert.deepEqual(ds.map((m) => m.hang), ds.map((_, i) => (i < 3 ? 'lam-quen' : i < 6 ? 'luyen' : i < 9 ? 'bien-the' : 'trum')), c);
  }
  assert.equal((M.manHongNgoai || []).length, 20, 'ManHoc.manHongNgoai phải có 20 màn');
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

/* ------------------------------------------------------------------ 7. bộ dò đường tắt: BFS chung mọi sân, không đọc distance() */
const VEC = SanHoc.VEC;
const KHOI = [['move', 1], ['back', 1], ['turn_right', 1], ['turn_left', 1], ['u_turn', 1]];
/** Dijkstra trên trạng thái CHUNG của mọi sân (một dãy lệnh cố định): chi phí mỗi bước = nhịp × số sân chưa xong (nhipTheo 'tong').
 *  Trả về { nhip, chuoi } của lời rẻ nhất có tổng nhịp ≤ gioiHan, hay null. */
function doDuongTat(m, gioiHan) {
  const sans = dsSan(m).map((rows, i) => {
    const s = SanHoc.docSan(rows);
    if (s.thung.length || /[NCc<>^vSun]/.test(rows.join(''))) throw new Error(m.ma + ': bộ dò chưa hỗ trợ thùng nặng, nút, cửa, băng chuyền');
    return { s, rows, bd: theoSan(m.batDau, i) };
  });
  const coTay = m.hamGoc.includes('grab');
  const HD = KHOI.concat(coTay ? [['pick', 2], ['drop', 2]] : []);
  const laDuaVat = m.mucTieu === 'dua-vat';
  const chan = (S, x, y) => x < 0 || y < 0 || x >= S.s.rong || y >= S.s.cao || !!SanHoc.lyDoChan(S.s, 'banh', x, y);
  const dau = sans.map((S) => ({ x: S.bd.x, y: S.bd.y, h: S.bd.huong || 0, cam: -1, pos: S.s.vat.map((v) => v.y * S.s.rong + v.x), xong: false }));
  const dichCua = sans.map((S) => S.s.dich.map((d) => d.y * S.s.rong + d.x).sort((a, b) => a - b));
  const xongChua = (S, st, i) => {
    if (!laDuaVat) return !!S.s.co && st.x === S.s.co.x && st.y === S.s.co.y;
    if (st.cam >= 0) return false;
    const p = st.pos.slice().sort((a, b) => a - b), d = dichCua[i];
    return p.length === d.length && p.every((c, k) => c === d[k]);
  };
  const khoa = (ds) => ds.map((st) => st.xong ? 'X' : [st.x, st.y, st.h, st.cam, st.pos.join('.')].join(',')).join('|');
  const tot = new Map([[khoa(dau), 0]]);
  let hang = [[0, dau, []]];
  while (hang.length) {
    hang.sort((a, b) => a[0] - b[0]);
    const [c, ds, chuoi] = hang.shift();
    if (tot.get(khoa(ds)) < c) continue;
    if (ds.every((st) => st.xong)) return { nhip: c, chuoi };
    for (const [ten, gia] of HD) {
      let tang = 0, ok = true;
      const moi = ds.map((st, i) => {
        if (st.xong) return st;
        tang += gia;
        const S = sans[i], N = { x: st.x, y: st.y, h: st.h, cam: st.cam, pos: st.pos.slice(), xong: false };
        const v = VEC[N.h], fx = N.x + v[0], fy = N.y + v[1], front = fy * S.s.rong + fx;
        if (ten === 'move') { if (!chan(S, fx, fy) && !N.pos.includes(front)) { N.x = fx; N.y = fy; } }
        else if (ten === 'back') { const bx = N.x - v[0], by = N.y - v[1]; if (!chan(S, bx, by) && !N.pos.includes(by * S.s.rong + bx)) { N.x = bx; N.y = by; } }
        else if (ten === 'turn_right') N.h = (N.h + 1) % 4;
        else if (ten === 'turn_left') N.h = (N.h + 3) % 4;
        else if (ten === 'u_turn') N.h = (N.h + 2) % 4;
        else if (ten === 'pick') { const k = N.pos.indexOf(front); if (N.cam >= 0 || k < 0) ok = false; else { N.pos[k] = -1; N.cam = k; } }
        else if (ten === 'drop') { if (N.cam < 0 || chan(S, fx, fy) || N.pos.includes(front)) ok = false; else { N.pos[N.cam] = front; N.cam = -1; } }
        N.xong = xongChua(S, N, i);
        return N;
      });
      if (!ok) continue;
      const c2 = c + tang;
      if (c2 > gioiHan) continue;
      const k = khoa(moi);
      if (tot.has(k) && tot.get(k) <= c2) continue;
      tot.set(k, c2); hang.push([c2, moi, chuoi.concat(ten)]);
    }
  }
  return null;
}
/** Dãy lệnh cố định → chương trình (gọi hàm của em), gộp move() liền nhau bằng for. */
function thanhChuongTrinh(chuoi) {
  const ds = [];
  for (let i = 0; i < chuoi.length;) {
    let j = i; while (j < chuoi.length && chuoi[j] === chuoi[i]) j++;
    if (j - i >= 2) ds.push('for i in range(' + (j - i) + '):', '    ' + chuoi[i] + '()');
    else ds.push(chuoi[i] + '()');
    i = j;
  }
  return ds;
}

/* ------------------------------------------------------------------ 2–4, 7. từng màn */
const CAM_LENH = ['warm', 'xichDay', 'beSung'];
const bang = {};
for (const m of DS) {
  const kho = khoTruoc.get(m.ma), daTao = daTaoTruoc.get(m.ma);
  bang[m.ma] = {};
  kiem(m.ma + ': đủ trường, robot, khay, nhiều sân', () => {
    for (const k of ['ten', 'deBai', 'san', 'batDau', 'mucTieu', 'hamGoc', 'robot', 'sao', 'maMau', 'loiGiai', 'loiGiaiKhac', 'goiY', 'hamCuaEmCan', 'yMoi', 'buocVideo']) assert.ok(m[k] !== undefined && m[k] !== '', m.ma + ' thiếu ' + k);
    assert.ok(m.loiSai.length >= 2, m.ma + ' cần ít nhất 2 lời sai');
    for (const ls of m.loiSai) assert.ok(ls.moTa && ls.phaiCoMa && ls.phaiCoMa.length, m.ma + ' lời sai thiếu moTa / phaiCoMa');
    assert.ok(m.goiY.length >= 1);
    assert.equal(m.loaiRobot, 'banh');
    assert.equal(m.robot.than, 'hai-banh');
    assert.ok(m.robot.tay === null || m.robot.tay === 'kep', m.ma + ' tay ' + m.robot.tay);
    assert.deepEqual(m.robot.camBien.map((c) => c.ma), ['hong-ngoai']);
    assert.ok(m.hamGoc.includes('distance'), m.ma + ' khay thiếu distance');
    assert.ok(soSan(m) >= 2, m.ma + ' phải có nhiều sân (một chương trình cho mọi sân)');
    assert.equal(m.nhipTheo, 'tong', m.ma + ' nhiều sân phải tính tổng nhịp');
    for (const s of ['ten', 'deBai', 'veMaMau']) if (m[s]) assert.ok(!/—|\p{Extended_Pictographic}/u.test(m[s]), m.ma + ' ' + s + ' có gạch dài / emoji');
    for (const s of m.goiY.concat(m.loiSai.map((x) => x.moTa))) assert.ok(!/—|\p{Extended_Pictographic}/u.test(s), m.ma + ' chữ có gạch dài / emoji: ' + s);
    if (m.hang === 'trum') assert.ok(m.huyHieu, m.ma + ' trùm thiếu huy hiệu');
  });
  kiem(m.ma + ': không dùng thứ của gói sau (warm, xichDay, beSung, lucBan, shoot("…"), return), sân không S / u / n', () => {
    for (const k of ['xichDay', 'beSung', 'lucBan']) assert.ok(!m[k], m.ma + ' có ' + k);
    for (const h of CAM_LENH) assert.ok(!m.hamGoc.includes(h), m.ma + ' khay có ' + h);
    for (const x of moiBai(m)) {
      const d = dongCua(x);
      for (const h of CAM_LENH) assert.ok(!loiGoi(d).has(h), m.ma + ' ' + x.ten + ' gọi ' + h);
      assert.ok(!d.some((l) => /^\s*return\b/.test(l)), m.ma + ' ' + x.ten + ' dùng return (mùa 5)');
      assert.ok(!d.some((l) => /shoot(_back)?\(\s*"/.test(l)), m.ma + ' ' + x.ten + ' dùng lực bắn');
    }
    for (const rows of dsSan(m)) assert.ok(!/[Sun]/.test(rows.join('')), m.ma + ' sân có S / u / n');
  });
  kiem(m.ma + ': hàm của em cần đã tạo ở màn trước; mọi lời gọi hàm của em đều khai trong hamCuaEmCan; hàm mới có mục Sổ lệnh', () => {
    for (const h of m.hamCuaEmCan) assert.ok(daTao.has(h) && kho.some((x) => x.ten === h), m.ma + ' cần ' + h + ' nhưng chưa màn nào trước nó tạo');
    for (const x of moiBai(m)) {
      const rieng = new Set((x.b.hamCuaMan || []).concat(x.moi || []).map((h) => h.ten));
      for (const t of loiGoi(dongCua(x))) {
        if (PY.has(t) || rieng.has(t) || m.hamGoc.includes(t)) continue;
        assert.ok(m.hamCuaEmCan.includes(t), m.ma + ' ' + x.ten + ' gọi ' + t + '() mà không khai trong hamCuaEmCan');
      }
    }
    for (const t of m.taoHam || []) {
      assert.ok(!daTao.has(t), m.ma + ' tạo lại hàm đã có ' + t);
      assert.ok((m.loiGiai.hamCuaEmMoi || []).some((h) => h.ten === t), m.ma + ' taoHam ' + t + ' mà lời giải không tạo');
      const sl = SL.tim(t);
      assert.ok(sl && sl.man === m.ma && sl.chuong === m.chuong, m.ma + ': Sổ lệnh thiếu / sai mục ' + t);
    }
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
  kiem(m.ma + ': bộ dò đường tắt: không có dãy lệnh cố định (không đọc distance()) thắng mọi sân với tổng nhịp ≤ ngưỡng', () => {
    const t = doDuongTat(m, m.sao.nhip);
    if (t) {
      const ct = thanhChuongTrinh(t.chuoi);
      const rr = cham(m, { chinh: ct }, [], { khung: Object.assign({}, m.khung, { chinh: 99, moiHam: 99 }) });
      assert.fail(m.ma + ': đường tắt ' + t.nhip + ' nhịp ≤ ' + m.sao.nhip + ' không cần distance(): ' + t.chuoi.join(' ') + ' (chạy thật: ' + (rr.thang ? 'thắng ' + rr.soNhip + ' nhịp' : 'thua') + ')');
    }
    bang[m.ma].tat = 'không';
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
  const dau = get('hong-ngoai.1');
  assert.ok(soDong(dau) <= 5, 'hong-ngoai.1 phải dễ: ' + soDong(dau) + ' dòng');
});
// Điều đã biết trước gói 3: đặc trưng của mọi màn đứng trước gói trong lộ trình.
const viTri = (m) => M.danhSach.indexOf(m);
const dauGoi = M.danhSach.find((m) => m.chuong === 'hong-ngoai');
const biet = new Set();
for (const m of M.danhSach.slice(0, viTri(dauGoi))) for (const f of dacTrung(m)) biet.add(f);
const dieuMoi = {};
kiem('mỗi màn thêm tối đa MỘT điều mới (so với mọi màn đứng trước, đặc trưng đọc từ lời giải); yMoi khai đúng một ý', () => {
  const da = new Set(biet);
  for (const m of DS) {
    const moi = [...dacTrung(m)].filter((f) => !da.has(f));
    dieuMoi[m.ma] = moi;
    if (m.hang !== 'trum') assert.ok(moi.length <= 1, m.ma + ' thêm ' + moi.length + ' điều mới: ' + moi.join(', '));
    for (const f of dacTrung(m)) da.add(f);
  }
});
const HAM_CU = new Set(khoTruoc.get(dauGoi.ma).map((h) => h.ten));
const recall = (m) => {
  const d = dongCua({ b: m.loiGiai, moi: [] });
  const ds = [...loiGoi(d)].filter((t) => HAM_CU.has(t) && !['move', 'turn_right', 'turn_left'].includes(t));
  if (d.some((l) => /^\s*for\b/.test(l))) ds.push('for');
  if (m.robot.tay === 'kep') ds.push('tay kẹp');
  if ((m.loiGiai.hamCuaEmMoi || []).some((h) => h.thamSo.length)) ds.push('tham số');
  return [...new Set(ds)];
};
kiem('recall: ít nhất 4 màn dùng thứ của gói 1–2 mùa 2 hay mùa 1 (hàm của em cũ, for, tay kẹp, tham số)', () => {
  const co = DS.filter((m) => recall(m).length);
  assert.ok(co.length >= 4, 'chỉ ' + co.length + ' màn recall');
});

/* ------------------------------------------------------------------ 6. phép so số trước gói 3 */
let soSanhTruoc = null;
for (const m of M.danhSach.slice(0, viTri(dauGoi))) {
  const { dong } = bacCau(m, [...(m.loiGiai.chinh || []), ...(m.loiGiai.hamCuaMan || []).concat(m.loiGiai.hamCuaEmMoi || []).flatMap((h) => h.than)], m.loiGiai.hamCuaEmMoi);
  const l = dong.find((x) => !/^\s*for\b/.test(x) && /(<=|>=|==|!=|<|>)\s*\d+/.test(x));
  if (l) { soSanhTruoc = m.ma + ': ' + l.trim(); break; }
}
kiem('phép so số: nếu chưa có trước gói 3 thì màn đầu dùng phép so tự giới thiệu (đề hoặc gợi ý nói "so sánh" và viết dấu)', () => {
  if (soSanhTruoc) return;
  const dau = DS.find((m) => [...dacTrung(m)].some((f) => /^so sanh/.test(f)));
  assert.ok(dau, 'không màn nào dùng phép so');
  const chu = [dau.deBai].concat(dau.goiY).join(' ');
  assert.ok(/so sánh/.test(chu) && /[<>]/.test(chu), dau.ma + ' dùng phép so lần đầu mà đề / gợi ý chưa giới thiệu');
});

/* ------------------------------------------------------------------ bảng */
console.log('Phép so số trước gói 3: ' + (soSanhTruoc || 'CHƯA CÓ (lời giải các màn trước gói 3 không so số)'));
console.log('chương | số | mã | tên | điều mới | bước video | dòng | nhịp | ô không tường | ô code | đường tắt | recall');
for (const m of DS) {
  const b = bang[m.ma] || {};
  console.log([m.chuong, m.so, m.ma, m.ten, (dieuMoi[m.ma] || []).join(', ') + ' (yMoi: ' + m.yMoi + ')', m.buocVideo, soDong(m), m.sao.nhip, coSan(m), m.sao.o, b.tat || '?', recall(m).join(',')].join(' | '));
}
if (LOI_GIA) {
  const doDu = LOI_GIA_DS.every((x) => hongMuc.some((t) => t.startsWith(x)));
  console.log('Lỗi giả: cắm ' + LOI_GIA_DS.length + ', mục đỏ ' + hongMuc.length + ' → ' + (doDu ? 'ĐỎ ĐỦ' : 'THIẾU: ' + LOI_GIA_DS.filter((x) => !hongMuc.some((t) => t.startsWith(x))).join('; ')));
  process.exit(doDu ? 0 : 1);
}
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong + ' kiểm tra 20 màn gói Hồng ngoại.');
if (hong) process.exitCode = 1;
