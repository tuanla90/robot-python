/* ============================================================================
   kiem-kho-hang-them.mjs — máy kiểm chương `kho-hang` "Chế lệnh: mở kho" (mùa 1, gói 4 chương 2) sau brief SM1-A (30/10):
   4 màn mới của man-kho-hang-them.js (kho-hang.1 … .4, .4 là trùm ba kho) và 4 màn ngân hàng viết lại trong lo-trinh-hoc.js cho dính nút đè
   (che-tay.2, che-tay.1, che-tay.6, che-tay.4; giữ mã, tên và thân hàm cốt truyện put_right / pass_back / swap / grab_back).
   1. Vị trí: gói kho-hang có hai chương nut-de / kho-hang, chương kho-hang đúng 10 màn theo THU_TU; che-xe.3, che-tay.3, che-tay.8, che-tay.10 cất;
      trùm kho-hang.4 mang huy hiệu che-tay (hình có sẵn), không màn nào khác của chương có huy hiệu; mã mới không trùng màn có sẵn / đã cất; tên không trùng;
      choi.html và lo-trinh-hoc.js nạp man-kho-hang-them.js; Sổ lệnh có set_box (chương kho-hang, màn kho-hang.1).
   2. Từng màn mới / viết lại: đủ trường; một sân (trùm: ba sân); lời giải thắng 3 sao, đúng sao.o / sao.nhip, KHÔNG chẩn đoán; mã mẫu chưa thắng;
      lời giải khác đúng 2 sao; mỗi lời sai thua và có đủ mã phaiCoMa; hàm của em cần đã tạo trước màn và mọi lời gọi đều khai trong hamCuaEmCan;
      màn có nút đè M và cửa C (trừ che-tay.6 swap: ngách kho).
   3. Ràng buộc gói 4 (trước gói Bánh lùi): khay không có lệnh lùi, không left_clear / right_clear, không tay xoay; không biến, không hàm có tham số,
      không bậc thang; u_turn() trong kho lúc này còn là bản hai lần turn_right(); chỉ kho-hang.1 có taoHam (['set_box']); màn taoHam có chinhCoDinh
      và cờ damLaThua; thân hàm cốt truyện viết lại đúng bằng thân trong ngân hàng man-che-tay.js.
   4. Đường cong cả chương: số dòng lời giải, số nhịp của màn n ≤ max(1,5 × màn n−1, màn n−1 + bù), trừ trùm; cỡ sân (ô không phải tường) cũng vậy
      ở cặp có màn mới / viết lại (bù: dòng +3, nhịp +4, ô +6). Trùm: nhịp lớn nhất chương và ≤ 2 × màn 9. Nút đè: ít nhất 7 / 10 màn có M.
   5. Bộ dò đường khối chuẩn (BFS theo nhịp: move / turn 1 nhịp, u_turn 2 nhịp (bản gói 4), pick / drop 2 nhịp, nút đè M giữ cửa C như san-hoc.js;
      đường dò được chạy thật bằng cham.js): không có đường nào nhanh hơn ngưỡng sao.nhip, trừ màn khai NHANH_HON (lý do ghi rõ). Trùm: chương trình
      đếm cứng theo đường ngắn nhất của từng kho không được 3 sao ở cả ba kho.
   --loi-gia: cắm ba lỗi giả vào dữ liệu đã nạp (sao.o lệch, mất nút M, mất cờ damLaThua) rồi chạy: phải thấy HỎNG (máy kiểm tự chứng minh).
   Chạy: node hoc/kiem-kho-hang-them.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { coHinhRieng } from './huy-hieu-ds.mjs';

const require = createRequire(import.meta.url);
const Cham = require('./cham.js');
const SanHoc = require('./san-hoc.js');
const M = require('./lo-trinh-hoc.js');
const TT = require('./thu-tu-chuong.js');
const SoLenh = require('./so-lenh.js');
const clone = (x) => JSON.parse(JSON.stringify(x));
const LOI_GIA = process.argv.includes('--loi-gia');

let dat = 0, hong = 0;
function kiem(ten, fn) {
  try { fn(); dat++; } catch (e) { hong++; console.log('  HỎNG ' + ten + '\n       ' + (e && e.message ? e.message.split('\n')[0] : e)); }
}

const MOI = ['kho-hang.1', 'kho-hang.2', 'kho-hang.3', 'kho-hang.4'];
const VIET_LAI = ['che-tay.2', 'che-tay.1', 'che-tay.6', 'che-tay.4'];
const THU_TU = ['che-xe.1', 'che-xe.2', 'che-tay.2', 'che-tay.1', 'kho-hang.1', 'kho-hang.2', 'kho-hang.3', 'che-tay.6', 'che-tay.4', 'kho-hang.4'];
const CAT = ['che-xe.3', 'che-tay.3', 'che-tay.8', 'che-tay.10'];
/** Màn mà đường khối chuẩn ngắn hơn ngưỡng: lý do. */
const NHANH_HON = {
  'che-tay.4': 'nhặt sau lưng xong (đang nhìn sang trái) thì turn_left là nhìn xuống nút: turn_left + drop + turn_left nhanh hơn u_turn + turn_right + drop + turn_left hai nhịp; chương trình chính khóa nên người chơi không chọn được',
  'kho-hang.4': 'như che-tay.4: đoạn thùng sau lưng có đường ngắn hơn hai nhịp nếu không dùng grab_back(); người chơi viết thế vẫn 3 sao, ngưỡng theo lời giải dùng hàm đã chế'
};
/** Màn bộ dò không chạy: lý do. */
const KHONG_DO = { 'che-tay.6': 'vật có màu (đổi chỗ đỏ / xanh): bộ dò không phân biệt màu; sân và lời giải như ngân hàng (kiem-che-tay.mjs đo)' };
const BU = { dong: 3, nhip: 4, o: 6 };
const soSan = (m) => (Array.isArray(m.san[0]) ? m.san.length : 1);
const dsSan = (m) => (Array.isArray(m.san[0]) ? m.san : [m.san]);
const theoSan = (v, i) => (Array.isArray(v) ? v[i] : v);
const get = (ma) => M.timMa(ma);

if (LOI_GIA) {
  get('kho-hang.2').sao.o += 1;                                                            // mục 2: sao.o lệch
  get('kho-hang.1').san = get('kho-hang.1').san.map((d) => d.replace('M', '#'));           // mục 2: mất nút M, lời giải thua
  delete get('kho-hang.1').damLaThua;                                                      // mục 3: màn taoHam mất cờ
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
function cham(m, bai, moi) {
  const hs = new Map(khoTruoc.get(m.ma).map((h) => [h.ten, clone(h)]));
  for (const h of moi || []) hs.set(h.ten, clone(h));
  return Cham.cham(m, { chinh: bai.chinh, hamCuaMan: bai.hamCuaMan || [] }, [...hs.values()]);
}
function loiGoi(dong) { const s = new Set(); for (const l of dong || []) for (const x of l.matchAll(/([A-Za-z_]\w*)\s*\(/g)) s.add(x[1]); return s; }
const PY = new Set(['range', 'print', 'len']);
function moiBai(m) {
  const ds = [{ ten: 'maMau', b: m.maMau, moi: [] }, { ten: 'loiGiai', b: m.loiGiai, moi: m.loiGiai.hamCuaEmMoi }];
  if (m.loiGiaiKhac) ds.push({ ten: 'loiGiaiKhac', b: m.loiGiaiKhac.baiLam, moi: m.loiGiaiKhac.hamCuaEmMoi });
  m.loiSai.forEach((ls, i) => ds.push({ ten: 'loiSai[' + i + ']', b: ls.baiLam, moi: ls.hamCuaEmMoi }));
  return ds;
}
function dongCua(x) { return [...(x.b.chinh || []), ...(x.b.hamCuaMan || []).concat(x.moi || []).flatMap((h) => h.than)]; }
const soDong = (m) => (m.chinhCoDinh ? 0 : m.loiGiai.chinh.length) + (m.loiGiai.hamCuaMan || []).concat(m.loiGiai.hamCuaEmMoi || []).reduce((s, h) => s + h.than.length, 0);
const coSan = (m) => Math.max(...dsSan(m).map((rows) => rows.join('').replace(/#/g, '').length));
const laBien = (l) => /^\s*[A-Za-z_]\w*(\s*\[[^\]]*\])?\s*[-+*/]?=(?!=)/.test(l) || /range\(\s*[A-Za-z_]/.test(l);
const LUI = ['left_back', 'right_back'], BEN = ['left_clear', 'right_clear'], XOAY = ['arm_left', 'arm_right'];
const coM = (m) => dsSan(m).every((rows) => rows.join('').includes('M'));

/* ------------------------------------------------------------------ 1. vị trí */
const goi = TT.goi.find((g) => g.ma === 'kho-hang');
const DS_CHUONG = M.danhSach.filter((m) => m.chuong === 'kho-hang');
kiem('gói kho-hang (mùa 1): hai chương nut-de, kho-hang; chương kho-hang đúng 10 màn theo thứ tự, số và hàng đúng', () => {
  assert.ok(goi && goi.mua === 'mua-1');
  assert.deepEqual(goi.chuong, ['nut-de', 'kho-hang']);
  assert.deepEqual(DS_CHUONG.map((m) => m.ma), THU_TU);
  assert.deepEqual(DS_CHUONG.map((m) => m.so), THU_TU.map((_, i) => i + 1));
  assert.deepEqual(DS_CHUONG.map((m) => m.hang), THU_TU.map((_, i) => (i < 3 ? 'lam-quen' : i < 6 ? 'luyen' : i < 9 ? 'bien-the' : 'trum')));
  assert.equal(TT.ten['kho-hang'], 'Chế lệnh: mở kho');
});
kiem('bốn màn không tạo hàm của chương cũ đã cất (M.manCat), ngân hàng còn mã; mã mới không trùng màn cất; tên màn không trùng trong lộ trình', () => {
  for (const ma of CAT) { assert.ok(M.manCat.includes(ma), ma + ' không có trong manCat'); assert.equal(get(ma), null, ma + ' còn trong lộ trình'); }
  const nhXe = fs.readFileSync(new URL('./man-che-xe.js', import.meta.url), 'utf8'), nhTay = fs.readFileSync(new URL('./man-che-tay.js', import.meta.url), 'utf8');
  assert.ok(/so: 3, ten: 'Đường né'/.test(nhXe) && /so: 10, ten: 'Kho đồ'/.test(nhTay), 'ngân hàng mất màn đã cất');
  for (const ma of MOI) { assert.ok(get(ma), ma + ' không có trong lộ trình'); assert.ok(!M.manCat.includes(ma), ma + ' trùng màn đã cất'); }
  const ten = M.danhSach.map((m) => m.ten), tenMoi = MOI.concat(VIET_LAI).map((ma) => get(ma).ten);
  for (const t of tenMoi) assert.equal(ten.filter((x) => x === t).length, 1, 'tên "' + t + '" trùng một màn khác của lộ trình');
});
kiem('huy hiệu: chỉ trùm kho-hang.4 mang huy hiệu che-tay (hình có sẵn), tên theo tên chương; che-tay.10 (trùm cũ) đã cất', () => {
  const trum = get('kho-hang.4');
  assert.equal(trum.hang, 'trum');
  assert.equal(trum.huyHieu && trum.huyHieu.ma, 'che-tay');
  assert.equal(trum.huyHieu.ten, 'Huy hiệu Chế lệnh mở kho');
  assert.deepEqual(M.danhSach.filter((m) => m.huyHieu && m.huyHieu.ma === 'che-tay').map((m) => m.ma), ['kho-hang.4']);
  for (const m of DS_CHUONG.slice(0, -1)) assert.ok(!m.huyHieu, m.ma + ' không phải trùm mà có huy hiệu');
  assert.ok(coHinhRieng('che-tay'));
});
kiem('choi.html và lo-trinh-hoc.js nạp man-kho-hang-them.js trước khi dựng lộ trình; Sổ lệnh có set_box (kho-hang, kho-hang.1)', () => {
  const html = fs.readFileSync(new URL('./game/choi.html', import.meta.url), 'utf8');
  const a = html.indexOf('../man-kho-hang-them.js'), b = html.indexOf('../lo-trinh-hoc.js');
  assert.ok(a > 0 && a < b, 'choi.html');
  const lt = fs.readFileSync(new URL('./lo-trinh-hoc.js', import.meta.url), 'utf8');
  assert.ok(/'kho-hang-them'/.test(lt) && /M\.them\(M\.manKhoHangThem/.test(lt), 'lo-trinh-hoc.js');
  const h = SoLenh.tim('set_box');
  assert.ok(h && h.chuong === 'kho-hang' && h.man === 'kho-hang.1', 'Sổ lệnh thiếu set_box');
  assert.ok(M.hamCotTruyen().includes('set_box'), 'set_box không phải hàm cốt truyện');
});

/* ------------------------------------------------------------------ 5. bộ dò khối chuẩn (nút đè, cửa; không lùi; u_turn 2 nhịp) */
const VEC = SanHoc.VEC;
function nguCanh(m, i) {
  const rows = dsSan(m)[i], san = SanHoc.docSan(rows), rong = san.rong, cao = san.cao;
  const nut = san.nutDe.map((q) => q.y * rong + q.x);
  const noi = m.noi ? (soSan(m) > 1 ? m.noi[i] : m.noi) : null;
  const cua = san.cua.map((d) => ({ o: d.y * rong + d.x, mo0: d.mo, nut: noi ? nut.filter((o) => noi.some((g) => g.nut.y * rong + g.nut.x === o && g.cua.some((c) => c.y * rong + c.x === d.y * rong + d.x))) : nut }));
  const bd = theoSan(m.batDau, i), bm = theoSan(m.bongMo, i);
  const laBM = m.mucTieu === 'bong-mo';
  return {
    m, i, rows, rong, cao, nut, cua, laBM, bm, coTay: m.hamGoc.includes('grab'),
    chan: (x, y) => x < 0 || y < 0 || x >= rong || y >= cao || !!SanHoc.lyDoChan(san, 'banh', x, y),
    co: san.co ? san.co.y * rong + san.co.x : -1, vat0: san.vat.map((v) => v.y * rong + v.x),
    dichVat: laBM ? (bm.vat || []).map((v) => v.y * rong + v.x).sort((a, b) => a - b) : [], bd
  };
}
const HD = [['move', 1], ['turn_right', 1], ['turn_left', 1], ['u_turn', 2], ['pick', 2], ['drop', 2]];
function buoc(ctx, S, ten) {
  const { rong } = ctx;
  const N = { x: S.x, y: S.y, h: S.h, cam: S.cam, pos: S.pos.slice(), cua: S.cua.slice() };
  const coCuaDong = (o) => ctx.cua.some((d, k) => d.o === o && !N.cua[k]);
  const laCua = (o) => ctx.cua.some((d) => d.o === o);
  const vao = (x, y) => !ctx.chan(x, y) && !N.pos.includes(y * rong + x) && !coCuaDong(y * rong + x);
  const v = VEC[N.h], fx = N.x + v[0], fy = N.y + v[1], front = fy * rong + fx;
  if (ten === 'move') { if (!vao(fx, fy)) return null; N.x = fx; N.y = fy; }
  else if (ten === 'turn_right') N.h = (N.h + 1) % 4;
  else if (ten === 'turn_left') N.h = (N.h + 3) % 4;
  else if (ten === 'u_turn') N.h = (N.h + 2) % 4;
  else if (ten === 'pick') { if (!ctx.coTay) return null; const k = N.pos.indexOf(front); if (N.cam >= 0 || k < 0) return null; N.pos[k] = -1; N.cam = k; }
  else if (ten === 'drop') { if (!ctx.coTay || N.cam < 0 || ctx.chan(fx, fy) || N.pos.includes(front) || laCua(front)) return null; N.pos[N.cam] = front; N.cam = -1; }
  const xe = N.y * rong + N.x;
  ctx.cua.forEach((d, k) => {
    const bat = d.nut.some((o) => o === xe || N.pos.includes(o));
    const muon = bat ? !d.mo0 : d.mo0;
    if (muon === N.cua[k]) return;
    if (!muon && (xe === d.o || N.pos.includes(d.o))) return;
    N.cua[k] = muon;
  });
  return N;
}
function laDich(ctx, S) {
  if (!ctx.laBM) return S.y * ctx.rong + S.x === ctx.co;
  const bm = ctx.bm;
  if (S.x !== bm.x || S.y !== bm.y || S.h !== bm.huong || S.cam >= 0) return false;
  const p = S.pos.slice().sort((a, b) => a - b);
  return p.length === ctx.dichVat.length && p.every((c, k) => c === ctx.dichVat[k]);
}
function bfsKhoi(m, i) {
  const ctx = nguCanh(m, i), bd = ctx.bd;
  const S0 = { x: bd.x, y: bd.y, h: bd.huong || 0, cam: -1, pos: ctx.vat0.slice(), cua: ctx.cua.map((d) => d.mo0) };
  const khoa = (S) => [S.x, S.y, S.h, S.cam, S.pos.join('.'), S.cua.map(Number).join('')].join('|');
  const thay = new Map([[khoa(S0), 0]]);
  const theoNhip = new Map([[0, [[S0, []]]]]);
  for (let n = 0; n <= 150; n++) {
    for (const [S, chuoi] of theoNhip.get(n) || []) {
      if (thay.get(khoa(S)) !== n) continue;
      if (laDich(ctx, S)) return { nhip: n, chuoi };
      for (const [ten, gia] of HD) {
        const N = buoc(ctx, S, ten);
        if (!N) continue;
        const k = khoa(N), n2 = n + gia;
        if (thay.has(k) && thay.get(k) <= n2) continue;
        thay.set(k, n2);
        if (!theoNhip.has(n2)) theoNhip.set(n2, []);
        theoNhip.get(n2).push([N, chuoi.concat(ten)]);
      }
    }
    theoNhip.delete(n);
  }
  return { nhip: null, chuoi: null };
}
function thanhChuongTrinh(chuoi) {
  const ds = [];
  for (let i = 0; i < chuoi.length;) {
    let j = i; while (j < chuoi.length && chuoi[j] === chuoi[i]) j++;
    const n = j - i;
    if (n >= 2 && chuoi[i] === 'move') ds.push('for i in range(' + n + '):', '    move()');
    else for (let k = 0; k < n; k++) ds.push(chuoi[i] + '()');
    i = j;
  }
  return ds;
}
function manSan(m, i) {
  const x = clone(m);
  delete x.chinhCoDinh; delete x.damLaThua; delete x.taoHam;                   // đường dò viết thẳng: không cần chế hàm
  x.cauTruc = ['for', 'if', 'while'];
  x.khung = Object.assign({}, x.khung, { chinh: 99, cauTruc: x.cauTruc.slice() });
  if (soSan(m) > 1) { x.san = clone(m.san[i]); x.batDau = clone(m.batDau[i]); if (m.bongMo) x.bongMo = clone(m.bongMo[i]); if (m.noi) x.noi = clone(m.noi[i]); delete x.nhipTheo; }
  return x;
}
const bang = {};

/* ------------------------------------------------------------------ 2–3, 5. từng màn mới / viết lại */
const DS = MOI.concat(VIET_LAI).map(get);
for (const m of DS) {
  if (!m) continue;
  const kho = khoTruoc.get(m.ma), daTao = daTaoTruoc.get(m.ma);
  const moi = MOI.includes(m.ma);
  bang[m.ma] = {};
  kiem(m.ma + ': đủ trường, số sân, robot xe hai bánh + tay kẹp, sân có nút đè M (trừ che-tay.6), không bậc thang, không lùi trên khay' + (moi ? ', có cảm biến khoảng cách' : ''), () => {
    for (const k of ['ten', 'deBai', 'san', 'batDau', 'hamGoc', 'sao', 'maMau', 'loiGiai', 'loiGiaiKhac', 'goiY', 'hamCuaEmCan']) assert.ok(m[k] !== undefined && m[k] !== '', m.ma + ' thiếu ' + k);
    assert.ok(m.loiSai.length >= 3, m.ma + ' cần ít nhất 3 lời sai');
    for (const ls of m.loiSai) assert.ok(ls.moTa && ls.phaiCoMa && ls.phaiCoMa.length, m.ma + ' lời sai thiếu moTa / phaiCoMa');
    assert.equal(soSan(m), m.hang === 'trum' ? 3 : 1, m.ma + ' số sân');
    for (const rows of dsSan(m)) assert.ok(!/S/.test(rows.join('')), m.ma + ' sân có bậc thang');
    assert.equal(m.robot.than, 'hai-banh'); assert.equal(m.robot.tay, 'kep');
    if (moi) assert.deepEqual(m.robot.camBien.map((c) => c.ma), ['khoang-cach']);
    if (m.ma !== 'che-tay.6') assert.ok(coM(m), m.ma + ' sân không có nút đè M');
    if (m.hang === 'trum') assert.ok(m.huyHieu, m.ma + ' trùm thiếu huy hiệu');
    assert.equal(m.phienBanNoiDung, moi ? undefined : 2, m.ma + ' phienBanNoiDung');
    for (const h of LUI.concat(BEN, XOAY)) assert.ok(!m.hamGoc.includes(h), m.ma + ' khay có ' + h);
    for (const [t, d] of [['chú thích', /[—–]/], ['emoji', /[\u{1F300}-\u{1FAFF}☀-➿]/u]]) for (const s of [m.ten, m.deBai, m.veMaMau || ''].concat(m.goiY)) assert.ok(!d.test(s), m.ma + ' chữ có ' + t);
  });
  kiem(m.ma + ': không lệnh lùi / cảm biến bên / tay xoay / biến / tham số trong mọi bài; u_turn trong kho là bản hai lần turn_right; taoHam chỉ ở kho-hang.1 (set_box, chinhCoDinh, damLaThua)', () => {
    for (const x of moiBai(m)) {
      const goi = loiGoi(dongCua(x));
      for (const h of LUI.concat(BEN, XOAY)) assert.ok(!goi.has(h), m.ma + ' ' + x.ten + ' gọi ' + h);
      for (const h of (x.b.hamCuaMan || []).concat(x.moi || [])) assert.deepEqual(h.thamSo || [], [], m.ma + ' ' + x.ten + ': hàm ' + h.ten + ' có tham số');
      assert.deepEqual(dongCua(x).filter(laBien), [], m.ma + ' ' + x.ten + ' dùng biến');
    }
    const ut = kho.find((h) => h.ten === 'u_turn');
    assert.ok(ut && ut.than.filter((l) => l.trim() === 'turn_right()').length === 2, 'u_turn ở gói Kho hàng phải là bản hai lần turn_right (xuong-ham.7)');
    assert.ok(!kho.some((h) => h.ten === 'back'), 'kho đã có back() trước gói Bánh lùi');
    if (m.ma === 'kho-hang.1') { assert.deepEqual(m.taoHam, ['set_box']); assert.ok(m.chinhCoDinh === true && m.damLaThua === true, 'kho-hang.1 cần chinhCoDinh + damLaThua'); }
    else if (moi) { assert.deepEqual(m.taoHam || [], []); assert.deepEqual(m.loiGiai.hamCuaEmMoi || [], []); assert.ok(!m.damLaThua, m.ma + ' không ép gì mà có cờ damLaThua'); }
    else { assert.ok(m.chinhCoDinh === true && m.damLaThua === true, m.ma + ' (taoHam) cần chinhCoDinh + damLaThua'); }
  });
  kiem(m.ma + ': hàm của em cần đã học trước màn; mọi lời gọi hàm của em ở mã mẫu / lời giải / lời giải khác đều khai trong hamCuaEmCan', () => {
    for (const h of m.hamCuaEmCan) assert.ok(daTao.has(h) && kho.some((x) => x.ten === h), m.ma + ' cần ' + h + ' nhưng chưa màn nào trước nó tạo');
    for (const x of moiBai(m).filter((x) => !x.ten.startsWith('loiSai'))) {                 // lời sai là dữ liệu máy kiểm, được gọi hàm khác
      const rieng = new Set((x.b.hamCuaMan || []).concat(x.moi || []).map((h) => h.ten).concat(m.taoHam || []));     // hàm màn bắt chế không khai ở hamCuaEmCan
      for (const t of loiGoi(dongCua(x))) {
        if (PY.has(t) || rieng.has(t) || m.hamGoc.includes(t)) continue;
        assert.ok(m.hamCuaEmCan.includes(t), m.ma + ' ' + x.ten + ' gọi ' + t + '() mà không khai trong hamCuaEmCan');
      }
    }
  });
  kiem(m.ma + ': lời giải 3 sao đúng ngưỡng, không chẩn đoán; mã mẫu chưa thắng; lời giải khác 2 sao; lời sai thua đúng mã', () => {
    const r = cham(m, m.loiGiai, m.loiGiai.hamCuaEmMoi);
    assert.ok(r.thang, m.ma + ' lời giải thua: ' + JSON.stringify(r.chanDoan));
    assert.equal(r.sao, 3, m.ma + ' sao=' + r.sao);
    assert.equal(r.soO, m.sao.o, m.ma + ' soO=' + r.soO + ' khai ' + m.sao.o);
    assert.equal(r.soNhip, m.sao.nhip, m.ma + ' soNhip=' + r.soNhip + ' khai ' + m.sao.nhip);
    assert.deepEqual(r.chanDoan.map((c) => c.ma), [], m.ma + ' lời giải có chẩn đoán');
    assert.ok(r.theoSan.length === soSan(m) && r.theoSan.every((s) => s.thang));
    assert.equal(cham(m, m.maMau).thang, false, m.ma + ' mã mẫu đã thắng sẵn');
    const rk = cham(m, m.loiGiaiKhac.baiLam, m.loiGiaiKhac.hamCuaEmMoi);
    assert.ok(rk.thang, m.ma + ' lời giải khác thua: ' + JSON.stringify(rk.chanDoan));
    assert.equal(rk.sao, 2, m.ma + ' lời giải khác sao=' + rk.sao);
    for (const ls of m.loiSai) {
      const rl = cham(m, ls.baiLam, ls.hamCuaEmMoi);
      assert.equal(rl.thang, false, m.ma + ' lời sai "' + ls.moTa + '" lại thắng');
      const ma = rl.chanDoan.map((c) => c.ma);
      for (const x of ls.phaiCoMa) assert.ok(ma.includes(x), m.ma + ' lời sai "' + ls.moTa + '" thiếu mã ' + x + ' (có: ' + ma.join(',') + ')');
    }
  });
  if (!moi) kiem(m.ma + ': thân hàm cốt truyện viết lại đúng bằng thân trong ngân hàng man-che-tay.js (giữ mã, tên, thân)', () => {
    const nh = fs.readFileSync(new URL('./man-che-tay.js', import.meta.url), 'utf8');
    for (const h of m.loiGiai.hamCuaEmMoi) {
      const bien = { pass_back: 'T_PASS_BACK', put_right: 'T_PUT_RIGHT', grab_back: 'T_GRAB_BACK', swap: 'T_SWAP' }[h.ten];
      const mt = nh.match(new RegExp('var ' + bien + ' = \\[([^\\]]*)\\]'));
      assert.ok(mt, 'ngân hàng thiếu ' + bien);
      assert.deepEqual(h.than, mt[1].split(',').map((s) => s.trim().replace(/^'|'$/g, '')), m.ma + ': thân ' + h.ten + ' khác ngân hàng');
    }
    assert.deepEqual(m.taoHam, (m.loiGiai.hamCuaEmMoi || []).map((h) => h.ten).filter((t) => ['pass_back', 'put_right', 'grab_back', 'swap'].includes(t)));
  });
  if (!KHONG_DO[m.ma]) kiem(m.ma + ': bộ dò đường khối chuẩn: không có đường nhanh hơn ngưỡng (trừ lý do khai); đường dò chạy thật đúng nhịp', () => {
    let tong = 0; const duong = [];
    for (let i = 0; i < soSan(m); i++) {
      const b = bfsKhoi(m, i);
      assert.ok(b.nhip !== null, m.ma + ' sân ' + i + ': bộ dò không tới được đích');
      tong = Math.max(tong, b.nhip);
      const ct = thanhChuongTrinh(b.chuoi);
      duong.push(ct);
      const rr = Cham.cham(manSan(m, i), { chinh: ct, hamCuaMan: [] }, kho);
      assert.ok(rr.thang, m.ma + ' sân ' + i + ': đường dò được thua khi chạy thật: ' + ct.join(' / ') + ' ' + JSON.stringify(rr.chanDoan.map((c) => c.ma)));
      assert.equal(rr.soNhip, b.nhip, m.ma + ' sân ' + i + ': bộ dò và máy chấm lệch nhịp');
    }
    if (NHANH_HON[m.ma]) assert.ok(tong < m.sao.nhip, m.ma + ': khai NHANH_HON mà đường khối chuẩn không nhanh hơn (' + tong + ' / ' + m.sao.nhip + ')');
    else assert.ok(tong >= m.sao.nhip, m.ma + ': đường khối chuẩn ' + tong + ' nhịp nhanh hơn ngưỡng ' + m.sao.nhip);
    if (soSan(m) > 1) {
      for (let i = 0; i < duong.length; i++) {
        const mr = Object.assign(clone(m), { khung: Object.assign({}, m.khung, { chinh: 99 }) });
        const r = cham(mr, { chinh: duong[i] });
        assert.ok(!(r.thang && r.sao === 3), m.ma + ': đường đếm cứng của kho ' + i + ' được 3 sao ở cả ba kho');
        assert.ok(r.theoSan[i].thang, m.ma + ': đường đếm cứng của kho ' + i + ' thua chính kho đó');
      }
    }
    bang[m.ma].khoi = tong;
  });
}

/* ------------------------------------------------------------------ 4. đường cong cả chương, trùm, nút đè */
kiem('đường cong chương kho-hang: dòng / nhịp màn n ≤ max(1,5 × màn n−1, màn n−1 + bù), trừ trùm; cỡ sân cũng vậy ở cặp có màn mới / viết lại', () => {
  const ds = DS_CHUONG, dong = (m) => soDong(m), tran = (a, b, bu) => a <= Math.max(1.5 * b, b + bu);
  for (let i = 1; i < ds.length; i++) {
    const m = ds[i], t = ds[i - 1];
    if (m.hang === 'trum') continue;
    assert.ok(tran(dong(m), dong(t), BU.dong), m.ma + ' dòng ' + dong(m) + ' so với ' + t.ma + ' ' + dong(t));
    assert.ok(tran(m.sao.nhip, t.sao.nhip, BU.nhip), m.ma + ' nhịp ' + m.sao.nhip + ' so với ' + t.ma + ' ' + t.sao.nhip);
    if (MOI.concat(VIET_LAI).some((x) => x === m.ma || x === t.ma)) assert.ok(tran(coSan(m), coSan(t), BU.o), m.ma + ' cỡ sân ' + coSan(m) + ' so với ' + t.ma + ' ' + coSan(t));
  }
});
kiem('trùm kho-hang.4: nhịp lớn nhất chương, không quá 2 lần màn 9; ba kho dài ngắn khác nhau; dùng cả grab_back lẫn set_box', () => {
  const trum = get('kho-hang.4'), m9 = DS_CHUONG[8];
  for (const m of DS_CHUONG.slice(0, -1)) assert.ok(trum.sao.nhip > m.sao.nhip, 'trùm ' + trum.sao.nhip + ' nhịp không hơn ' + m.ma + ' ' + m.sao.nhip);
  assert.ok(trum.sao.nhip <= 2 * m9.sao.nhip, 'trùm gấp quá 2 lần màn 9');
  const r = cham(trum, trum.loiGiai);
  assert.equal(new Set(r.theoSan.map((s) => s.soNhip)).size, 3, 'ba kho phải khác số nhịp: ' + r.theoSan.map((s) => s.soNhip));
  const goi = loiGoi(trum.loiGiai.chinh);
  assert.ok(goi.has('grab_back') && goi.has('set_box') && goi.has('go_wall'));
});
kiem('nút đè: ít nhất 7 trong 10 màn của chương có nút M (nghiệm thu: trước đây 0 / 10); mọi màn mới có cửa C', () => {
  const co = DS_CHUONG.filter(coM);
  assert.ok(co.length >= 7, 'chỉ ' + co.length + ' màn có nút đè: ' + co.map((m) => m.ma));
  for (const ma of MOI) assert.ok(dsSan(get(ma)).every((rows) => rows.join('').includes('C')), ma + ' không có cửa C');
});
kiem('hàm cốt truyện của chương (put_right, pass_back, set_box, swap, grab_back) được tạo trước mọi màn dùng nó trong lộ trình', () => {
  const daTao = new Set();
  for (const m of M.danhSach) {
    for (const h of m.hamCuaEmCan) if (['put_right', 'pass_back', 'set_box', 'swap', 'grab_back', 'dodge_right', 'dodge_left'].includes(h)) assert.ok(daTao.has(h), m.ma + ' cần ' + h + ' trước khi tạo');
    for (const t of m.taoHam || []) daTao.add(t);
  }
  assert.deepEqual([...daTao].filter((t) => ['dodge_right', 'dodge_left', 'put_right', 'pass_back', 'set_box', 'swap', 'grab_back'].includes(t)), ['dodge_right', 'dodge_left', 'put_right', 'pass_back', 'set_box', 'swap', 'grab_back']);
});

console.log('số | mã | tên | dòng | nhịp | ô | cỡ sân | khối chuẩn | nút M | cửa C');
for (const m of DS_CHUONG) console.log([m.so, m.ma + (MOI.includes(m.ma) ? ' (mới)' : VIET_LAI.includes(m.ma) ? ' (viết lại)' : ''), m.ten, soDong(m), m.sao.nhip, m.sao.o, coSan(m), (bang[m.ma] || {}).khoi ?? '', coM(m) ? 'M' : '', dsSan(m).some((r) => r.join('').includes('C')) ? 'C' : ''].join(' | '));
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong + ' kiểm tra chương kho-hang (4 màn mới + 4 màn viết lại)' + (LOI_GIA ? ' [lỗi giả: phải có HỎNG]' : '') + '.');
if (LOI_GIA ? hong === 0 : hong) process.exitCode = 1;
