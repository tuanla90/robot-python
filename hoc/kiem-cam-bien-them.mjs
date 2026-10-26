/* ============================================================================
   kiem-cam-bien-them.mjs — máy kiểm 7 màn mới của mùa 1, gói 3 "Cảm biến khoảng cách" (man-cam-bien-them.js):
   khoang-cach.11 (chương khoang-cach) và che-cam-bien.11 … .16 (chương che-cam-bien, .16 là trùm).
   1. Vị trí: gói cam-bien có hai chương khoang-cach / che-cam-bien, mỗi chương đúng 10 màn theo THU_TU dưới đây; trùm che-cam-bien.16 mang huy hiệu
      'che-cam-bien' (huy-hieu.js có hình), không màn nào khác của gói mang huy hiệu đó; mã mới không trùng màn có sẵn hay màn đã cất.
   2. Từng màn mới: đủ trường; một sân (trừ trùm: ba sân); lời giải thắng 3 sao, đúng sao.o / sao.nhip, KHÔNG có chẩn đoán; mã mẫu chưa thắng;
      lời giải khác đúng 2 sao; mỗi lời sai thua và có đủ mã phaiCoMa; hàm của em cần đã học trước màn (theo thứ tự lộ trình) và khai đủ.
   3. Ràng buộc mùa 1: không lệnh lùi, không left_clear / right_clear, không tay xoay, không biến, không hàm có tham số, không nút đè M, không bậc thang S;
      u_turn() trong kho là bản hai lần turn_right(); không tạo hàm của em mới (taoHam cần mục Sổ lệnh).
   4. Đường cong của CẢ HAI chương (màn cũ và mới): số dòng lời giải, số nhịp của màn n ≤ max(1,5 × màn n−1, màn n−1 + bù) — trừ trùm;
      cỡ sân (số ô đi được) cũng vậy ở mọi cặp liền nhau có màn mới (cặp cũ–cũ là phòng trống / hành lang có sẵn, chỉ ghi). Bù cho số nhỏ (1 → 2 nhịp đã là gấp đôi): dòng +3, nhịp +4, ô sân +6. Recall: ít nhất 3 màn mới gọi hàm / vòng for của gói 1–2.
   5. Bộ dò đường:
      - BFS "khối chuẩn" (move / turn_right / turn_left 1 nhịp, pick / drop 2 nhịp, đúng luật vật chiếm ô), đường dò được chạy thật bằng cham.js:
        không có đường nào nhanh hơn ngưỡng sao.nhip — trừ màn khai NHANH_HON (đường nhanh hơn cần biết trước hướng rẽ, thân hàm đếm cứng không thắng);
      - do-duong-che-cam-bien.mjs (BFS gộp mọi việc trong một nhịp): ngưỡng không chặt quá (≤ sao.nhip là đạt được về vật lý — chỉ ghi);
      - màn chương trình chính bị khóa (chinhCoDinh) gọi hàm của màn ở nhiều chỗ: mọi thân hàm KHÔNG hỏi cảm biến (dãy ≤ 4 lệnh move / turn_* / u_turn /
        pick / drop, hay vòng for move) đều không được 3 sao — đếm cứng không né được ý của màn;
      - trùm: đường ngắn nhất (đếm cứng) của mỗi sân không thắng cả ba sân.
   Chạy: node hoc/kiem-cam-bien-them.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Cham = require('./cham.js');
const SanHoc = require('./san-hoc.js');
const M = require('./lo-trinh-hoc.js');
const TT = require('./thu-tu-chuong.js');
const { nhipCheCamBienSan } = await import('./do-duong-che-cam-bien.mjs');
const clone = (x) => JSON.parse(JSON.stringify(x));

let dat = 0, hong = 0;
function kiem(ten, fn) {
  try { fn(); dat++; } catch (e) { hong++; console.log('  HỎNG ' + ten + '\n       ' + (e && e.message ? e.message.split('\n')[0] : e)); }
}

const MOI = ['khoang-cach.11', 'che-cam-bien.11', 'che-cam-bien.12', 'che-cam-bien.13', 'che-cam-bien.14', 'che-cam-bien.15', 'che-cam-bien.16'];
const THU_TU = {
  'khoang-cach': [1, 2, 3, 8, 4, 11, 5, 6, 9, 10].map((n) => 'khoang-cach.' + n),
  'che-cam-bien': [1, 2, 7, 11, 12, 13, 3, 14, 15, 16].map((n) => 'che-cam-bien.' + n)
};
/** Màn mà đường khối chuẩn ngắn hơn ngưỡng: lý do (kiểm thêm bằng đếm cứng ở mục 5). */
const NHANH_HON = {
  'che-cam-bien.15': 'khúc rẽ trái: turn_left() một nhịp nhanh hơn turn_right() + u_turn(), nhưng chỉ khi biết trước khúc nào rẽ trái',
  'che-cam-bien.16': 'ngách bên trái (sân 2): turn_left() nhanh hơn turn_right() + u_turn(), nhưng chỉ khi biết trước ngách ở bên nào'
};
const BU = { dong: 3, nhip: 4, o: 6 };
const soSan = (m) => (Array.isArray(m.san[0]) ? m.san.length : 1);
const dsSan = (m) => (Array.isArray(m.san[0]) ? m.san : [m.san]);
const theoSan = (v, i) => (Array.isArray(v) ? v[i] : v);
const get = (ma) => M.timMa(ma);
const DS = MOI.map(get);

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
/** Số dòng lời giải người chơi viết / sửa: chương trình chính (trừ khi khóa: chinhCoDinh) + thân hàm mới + thân hàm của màn. */
const soDong = (m) => (m.chinhCoDinh ? 0 : m.loiGiai.chinh.length) + (m.loiGiai.hamCuaMan || []).concat(m.loiGiai.hamCuaEmMoi || []).reduce((s, h) => s + h.than.length, 0);
/** Cỡ sân: số ô không phải tường (sân lớn nhất nếu nhiều sân). */
const coSan = (m) => Math.max(...dsSan(m).map((rows) => rows.join('').replace(/#/g, '').length));
const laBien = (l) => /^\s*[A-Za-z_]\w*(\s*\[[^\]]*\])?\s*[-+*/]?=(?!=)/.test(l) || /range\(\s*[A-Za-z_]/.test(l);
const LUI = ['left_back', 'right_back', 'back'], BEN = ['left_clear', 'right_clear'], XOAY = ['arm_left', 'arm_right'];

/* ------------------------------------------------------------------ 1. vị trí */
const goi = TT.goi.find((g) => g.ma === 'cam-bien');
kiem('gói cam-bien (mùa 1): hai chương khoang-cach, che-cam-bien, mỗi chương 10 màn đúng thứ tự', () => {
  assert.ok(goi && goi.mua === 'mua-1');
  assert.deepEqual(goi.chuong, ['khoang-cach', 'che-cam-bien']);
  for (const c of goi.chuong) {
    const ds = M.danhSach.filter((m) => m.chuong === c);
    assert.deepEqual(ds.map((m) => m.ma), THU_TU[c], c);
    assert.deepEqual(ds.map((m) => m.so), ds.map((_, i) => i + 1), c);
    assert.deepEqual(ds.map((m) => m.hang), ds.map((_, i) => (i < 3 ? 'lam-quen' : i < 6 ? 'luyen' : i < 9 ? 'bien-the' : 'trum')), c);
  }
});
kiem('mã mới: chưa có trong ngân hàng gốc, không trùng màn đã cất; tên màn không trùng trong gói', () => {
  for (const ma of MOI) assert.ok(get(ma), ma + ' không có trong lộ trình');
  for (const ma of MOI) assert.ok(!(M.manCat || []).includes(ma), ma + ' trùng màn đã cất');
  const tenGoi = M.danhSach.filter((m) => goi.chuong.includes(m.chuong)).map((m) => m.ten);
  assert.equal(new Set(tenGoi).size, tenGoi.length, 'trùng tên màn trong gói: ' + tenGoi.filter((t, i) => tenGoi.indexOf(t) !== i));
  const tenMoi = DS.map((m) => m.ten), tenCu = M.danhSach.filter((m) => !MOI.includes(m.ma)).map((m) => m.ten);
  for (const t of tenMoi) assert.ok(!tenCu.includes(t), 'tên "' + t + '" trùng một màn khác của lộ trình');
});
kiem('huy hiệu che-cam-bien: chỉ trùm che-cam-bien.16 mang, huy-hieu.js có hình; khoang-cach.10 vẫn mang huy hiệu khoang-cach', () => {
  const trum = get('che-cam-bien.16');
  assert.equal(trum.hang, 'trum');
  assert.equal(trum.huyHieu && trum.huyHieu.ma, 'che-cam-bien');
  assert.ok(trum.huyHieu.ten.length > 0);
  assert.deepEqual(M.danhSach.filter((m) => m.huyHieu && m.huyHieu.ma === 'che-cam-bien').map((m) => m.ma), ['che-cam-bien.16']);
  assert.equal(get('khoang-cach.10').huyHieu.ma, 'khoang-cach');
  for (const m of M.danhSach.filter((x) => goi.chuong.includes(x.chuong) && x.hang !== 'trum')) assert.ok(!m.huyHieu, m.ma + ' không phải trùm mà có huy hiệu');
  const hh = fs.readFileSync(new URL('./game/huy-hieu.js', import.meta.url), 'utf8');
  assert.ok(/HINH\['che-cam-bien'\]\s*=\s*function/.test(hh), "huy-hieu.js thiếu HINH['che-cam-bien']");
});

/* ------------------------------------------------------------------ 5. bộ dò khối chuẩn */
const VEC = SanHoc.VEC;
/** BFS theo nhịp với khối chuẩn (hàm của em đã học), trên sân thứ i. Trả { nhip, chuoi: [tên lệnh] } hay { nhip: null }. */
function bfsKhoi(m, i) {
  const rows = dsSan(m)[i], san = SanHoc.docSan(rows), rong = san.rong, cao = san.cao;
  if (san.thung.length || san.dich.length || /[MCcS<>^v]/.test(rows.join(''))) throw new Error(m.ma + ': bộ dò khối chuẩn không hỗ trợ thùng nặng, đích D, nút, cửa, bậc thang, băng chuyền');
  const chan = (x, y) => x < 0 || y < 0 || x >= rong || y >= cao || !!SanHoc.lyDoChan(san, 'banh', x, y);
  const bd = theoSan(m.batDau, i), bm = theoSan(m.bongMo, i);
  const laBM = m.mucTieu === 'bong-mo';
  const coTay = m.hamGoc.includes('grab');
  const diQua = laBM ? (bm.diQua || []) : [];
  const dichVat = laBM ? (bm.vat || []).map((v) => v.y * rong + v.x).sort((a, b) => a - b) : [];
  const bit = (x, y) => { const k = diQua.findIndex((q) => q.x === x && q.y === y); return k < 0 ? 0 : 1 << k; };
  const day2 = (1 << diQua.length) - 1;
  const S0 = { x: bd.x, y: bd.y, h: bd.huong || 0, cam: -1, pos: san.vat.map((v) => v.y * rong + v.x), m: bit(bd.x, bd.y) };
  const khoa = (S) => [S.x, S.y, S.h, S.cam, S.pos.join('.'), S.m].join('|');
  const laDich = (S) => {
    if (!laBM) return !!san.co && S.x === san.co.x && S.y === san.co.y;
    if (S.x !== bm.x || S.y !== bm.y || S.h !== bm.huong || S.m !== day2 || S.cam >= 0) return false;
    const p = S.pos.slice().sort((a, b) => a - b);
    return p.length === dichVat.length && p.every((c, k) => c === dichVat[k]);
  };
  const HD = [['move', 1], ['turn_right', 1], ['turn_left', 1]].concat(coTay ? [['pick', 2], ['drop', 2]] : []);
  const thay = new Map([[khoa(S0), 0]]);
  const hang = [[S0, 0, []]];
  let tot = null;
  for (let nhip = 0; nhip <= 120 && !tot; nhip++) {
    for (let q = 0; q < hang.length; q++) {
      const [S, n, chuoi] = hang[q];
      if (n !== nhip || thay.get(khoa(S)) !== n) continue;
      for (const [ten, gia] of HD) {
        const N = { x: S.x, y: S.y, h: S.h, cam: S.cam, pos: S.pos.slice(), m: S.m };
        const v = VEC[N.h], fx = N.x + v[0], fy = N.y + v[1], front = fy * rong + fx;
        if (ten === 'move') { if (chan(fx, fy) || N.pos.includes(front)) continue; N.x = fx; N.y = fy; N.m |= bit(fx, fy); }
        else if (ten === 'turn_right') N.h = (N.h + 1) % 4;
        else if (ten === 'turn_left') N.h = (N.h + 3) % 4;
        else if (ten === 'pick') { const k = N.pos.indexOf(front); if (N.cam >= 0 || k < 0) continue; N.pos[k] = -1; N.cam = k; }
        else if (ten === 'drop') { if (N.cam < 0 || chan(fx, fy) || N.pos.includes(front)) continue; N.pos[N.cam] = front; N.cam = -1; }
        const n2 = n + gia, c2 = chuoi.concat(ten);
        if (laDich(N)) { if (!tot || tot.nhip > n2) tot = { nhip: n2, chuoi: c2 }; continue; }
        const k = khoa(N);
        if (thay.has(k) && thay.get(k) <= n2) continue;
        thay.set(k, n2); hang.push([N, n2, c2]);
      }
    }
    if (tot && tot.nhip <= nhip + 1) break;
  }
  return tot || { nhip: null, chuoi: null };
}
/** Đường dò được thành chương trình đếm cứng (gọi hàm của em), gộp các move() liền nhau bằng vòng for. */
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
/** Màn con chỉ có sân thứ i (để chạy thật một đường dò). */
function manSan(m, i) {
  const x = clone(m);
  delete x.chinhCoDinh;
  x.khung = Object.assign({}, x.khung, { chinh: 99 });                      // đường dò được viết thẳng: không tính khung 10 ô
  if (soSan(m) > 1) { x.san = clone(m.san[i]); x.batDau = clone(m.batDau[i]); if (m.bongMo) x.bongMo = clone(m.bongMo[i]); delete x.nhipTheo; }
  return x;
}
const bang = {};

/* ------------------------------------------------------------------ 2–5. từng màn mới */
for (const m of DS) {
  if (!m) continue;
  const kho = khoTruoc.get(m.ma), daTao = daTaoTruoc.get(m.ma);
  bang[m.ma] = {};
  kiem(m.ma + ': đủ trường, số sân, robot, sân không có nút / cửa / bậc thang', () => {
    for (const k of ['ten', 'deBai', 'san', 'batDau', 'mucTieu', 'hamGoc', 'sao', 'maMau', 'loiGiai', 'loiGiaiKhac', 'goiY', 'hamCuaEmCan']) assert.ok(m[k] !== undefined && m[k] !== '', m.ma + ' thiếu ' + k);
    assert.ok(m.loiSai.length >= 2, m.ma + ' cần ít nhất 2 lời sai');
    for (const ls of m.loiSai) assert.ok(ls.moTa && ls.phaiCoMa && ls.phaiCoMa.length, m.ma + ' lời sai thiếu moTa / phaiCoMa');
    assert.ok(m.goiY.length >= 1);
    assert.equal(soSan(m), m.hang === 'trum' ? 3 : 1, m.ma + ' số sân');
    for (const rows of dsSan(m)) assert.ok(!/[MCcS]/.test(rows.join('')), m.ma + ' sân có nút đè / cửa / bậc thang');
    assert.equal(m.robot.than, 'hai-banh');
    assert.deepEqual(m.robot.camBien.map((c) => c.ma), ['khoang-cach']);
    assert.ok(m.robot.tay === null || m.robot.tay === 'kep');
    assert.ok(m.khung.chanBien, m.ma + ' phải chặn biến (khung.chanBien)');
    if (m.hang === 'trum') assert.ok(m.huyHieu, m.ma + ' trùm thiếu huy hiệu');
  });
  kiem(m.ma + ': ràng buộc mùa 1 (không lùi, không cảm biến bên, không tay xoay, không biến, không tham số; u_turn hai lần turn_right)', () => {
    for (const h of LUI.concat(BEN, XOAY)) assert.ok(!m.hamGoc.includes(h), m.ma + ' khay có ' + h);
    for (const x of moiBai(m)) {
      const goi = loiGoi(dongCua(x));
      for (const h of LUI.concat(BEN, XOAY)) assert.ok(!goi.has(h), m.ma + ' ' + x.ten + ' gọi ' + h);
      for (const h of (x.b.hamCuaMan || []).concat(x.moi || [])) assert.deepEqual(h.thamSo || [], [], m.ma + ' ' + x.ten + ': hàm ' + h.ten + ' có tham số');
      assert.deepEqual(dongCua(x).filter(laBien), [], m.ma + ' ' + x.ten + ' dùng biến');
    }
    const ut = kho.find((h) => h.ten === 'u_turn');
    assert.ok(ut && JSON.stringify(ut.than) === JSON.stringify(['turn_right()', 'turn_right()']), 'u_turn trước gói Bánh lùi phải là hai lần turn_right()');
    assert.deepEqual(m.loiGiai.hamCuaEmMoi || [], [], m.ma + ' tạo hàm của em mới (cần mục Sổ lệnh)');
    assert.deepEqual(m.taoHam || [], [], m.ma + ' có taoHam');
  });
  kiem(m.ma + ': hàm của em cần đã học trước màn; mọi lời gọi hàm của em (thẳng hay qua hàm của màn) đều khai trong hamCuaEmCan', () => {
    for (const h of m.hamCuaEmCan) assert.ok(daTao.has(h) && kho.some((x) => x.ten === h), m.ma + ' cần ' + h + ' nhưng chưa màn nào trước nó tạo');
    for (const x of moiBai(m)) {
      const rieng = new Set((x.b.hamCuaMan || []).concat(x.moi || []).map((h) => h.ten));
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
  kiem(m.ma + ': bộ dò đường khối chuẩn: không có đường nhanh hơn ngưỡng (trừ lý do khai); đường dò chạy thật đúng; BFS gộp ≤ ngưỡng', () => {
    let tong = 0, tongGop = 0;
    const duong = [];
    for (let i = 0; i < soSan(m); i++) {
      const b = bfsKhoi(m, i);
      assert.ok(b.nhip !== null, m.ma + ' sân ' + i + ': bộ dò không tới được đích');
      tong += b.nhip;
      const ct = thanhChuongTrinh(b.chuoi);
      duong.push(ct);
      const ms = manSan(m, i);
      const rr = Cham.cham(ms, { chinh: ct, hamCuaMan: [] }, kho);
      assert.ok(rr.thang, m.ma + ' sân ' + i + ': đường dò được thua khi chạy thật: ' + ct.join(' / ') + ' ' + JSON.stringify(rr.chanDoan.map((c) => c.ma)));
      assert.equal(rr.soNhip, b.nhip, m.ma + ' sân ' + i + ': bộ dò và máy chấm lệch nhịp');
      const g = nhipCheCamBienSan(m, i);
      assert.ok(g.nhip !== null);
      tongGop += g.nhip;
    }
    if (NHANH_HON[m.ma]) assert.ok(tong < m.sao.nhip, m.ma + ': khai NHANH_HON mà đường khối chuẩn không nhanh hơn (' + tong + ' / ' + m.sao.nhip + ')');
    else assert.ok(tong >= m.sao.nhip, m.ma + ': đường khối chuẩn ' + tong + ' nhịp nhanh hơn ngưỡng ' + m.sao.nhip);
    assert.ok(tongGop <= m.sao.nhip, m.ma + ': BFS gộp ' + tongGop + ' > ngưỡng ' + m.sao.nhip);
    if (soSan(m) > 1) {
      for (let i = 0; i < duong.length; i++) {
        const mr = Object.assign(clone(m), { khung: Object.assign({}, m.khung, { chinh: 99 }) });
        const r = cham(mr, { chinh: duong[i] });
        assert.ok(!r.thang && r.theoSan[i].thang, m.ma + ': đường đếm cứng của sân ' + i + ' thắng cả ba sân (hay thua chính sân đó)');
      }
    }
    Object.assign(bang[m.ma], { khoi: tong, gop: tongGop });
  });
  // Hàm của màn được gọi ở nhiều chỗ (nhiều dòng gọi, hay một dòng trong vòng for): thân đếm cứng không được 3 sao.
  // Gọi đúng một lần (che-cam-bien.12) thì đếm cứng hòa với cảm biến như mọi màn một sân: chỉ ghi số thân thắng.
  const goiNhieu = m.chinhCoDinh && (() => { const ten = m.loiGiai.hamCuaMan[0].ten + '()'; const ds = m.loiGiai.chinh; return ds.filter((l) => l.includes(ten)).length >= 2 || ds.some((l) => /^\s*for /.test(l)); })();
  if (m.chinhCoDinh) {
    kiem(m.ma + ': chương trình chính khóa: thân hàm của màn đếm cứng (không hỏi cảm biến) không được 3 sao khi hàm được gọi ở nhiều chỗ', () => {
      const hm = m.loiGiai.hamCuaMan;
      assert.equal(hm.length, 1, m.ma + ' cần đúng một hàm của màn');
      const lenh = ['move()', 'turn_right()', 'turn_left()', 'u_turn()'].concat(m.hamGoc.includes('grab') ? ['pick()', 'drop()'] : []);
      const than = [[]];
      for (let d = 1; d <= 4; d++) for (const t of than.filter((x) => x.length === d - 1)) for (const l of lenh) than.push(t.concat(l));
      for (let n = 2; n <= 8; n++) for (const l of [[], ...lenh.map((x) => [x])]) for (const l2 of [[], ...lenh.map((x) => [x])]) than.push([...l, 'for i in range(' + n + '):', '    move()', ...l2]);
      let soThang = 0, so3 = 0;
      for (const t of than) {
        const r = cham(m, { chinh: m.loiGiai.chinh, hamCuaMan: [{ ten: hm[0].ten, thamSo: [], than: t }] });
        if (goiNhieu) assert.ok(!(r.thang && r.sao === 3), m.ma + ': thân đếm cứng [' + t.join('; ') + '] được 3 sao');
        if (r.thang) soThang++;
        if (r.thang && r.sao === 3) so3++;
      }
      bang[m.ma].demCung = (goiNhieu ? 'gọi nhiều chỗ' : 'gọi một lần') + ': ' + soThang + '/' + than.length + ' thân đếm cứng thắng, ' + so3 + ' được 3 sao';
    });
  }
}

/* ------------------------------------------------------------------ 4. đường cong cả hai chương, recall */
kiem('đường cong hai chương: dòng / nhịp màn n ≤ max(1,5 × màn n−1, màn n−1 + bù), trừ trùm; cỡ sân (ô đi được) cũng vậy ở mọi cặp có màn mới', () => {
  for (const c of goi.chuong) {
    const ds = M.danhSach.filter((m) => m.chuong === c);
    for (let i = 1; i < ds.length; i++) {
      const m = ds[i], t = ds[i - 1];
      if (m.hang === 'trum') continue;
      const tran = (a, b, bu) => a <= Math.max(1.5 * b, b + bu);
      assert.ok(tran(soDong(m), soDong(t), BU.dong), m.ma + ' dòng ' + soDong(m) + ' so với ' + t.ma + ' ' + soDong(t));
      assert.ok(tran(m.sao.nhip, t.sao.nhip, BU.nhip), m.ma + ' nhịp ' + m.sao.nhip + ' so với ' + t.ma + ' ' + t.sao.nhip);
      if (MOI.includes(m.ma) || MOI.includes(t.ma)) assert.ok(tran(coSan(m), coSan(t), BU.o), m.ma + ' cỡ sân ' + coSan(m) + ' so với ' + t.ma + ' ' + coSan(t));
    }
  }
});
/** Hàm của em tạo ở gói 1–2 (trước gói cam-bien). */
const dauGoi3 = M.danhSach.find((m) => m.chuong === 'khoang-cach');
const HAM_GOI_12 = new Set(khoTruoc.get(dauGoi3.ma).map((h) => h.ten));
const recall = (m) => {
  const dong = dongCua({ b: m.loiGiai, moi: [] });
  return [...loiGoi(dong)].filter((t) => HAM_GOI_12.has(t)).concat(dong.some((l) => /^\s*for /.test(l)) ? ['for'] : []);
};
kiem('recall: ít nhất 3 màn mới dùng hàm hay vòng for của gói 1–2', () => {
  const co = DS.filter((m) => m && recall(m).length);
  assert.ok(co.length >= 3, 'chỉ ' + co.length + ' màn mới recall gói 1–2');
});

console.log('chương | số | mã | tên | dòng | nhịp | ô | cỡ sân | khối chuẩn | BFS gộp | recall gói 1–2');
for (const c of goi.chuong) {
  for (const m of M.danhSach.filter((x) => x.chuong === c)) {
    const b = bang[m.ma] || {};
    console.log([c, m.so, m.ma + (MOI.includes(m.ma) ? ' (mới)' : ''), m.ten, soDong(m), m.sao.nhip, m.sao.o, coSan(m), b.khoi ?? '', b.gop ?? '', MOI.includes(m.ma) ? recall(m).join(',') : ''].join(' | '));
  }
}
for (const ma of MOI) if (bang[ma] && bang[ma].demCung) console.log('đếm cứng ' + ma + ': ' + bang[ma].demCung);
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong + ' kiểm tra 7 màn mới gói Cảm biến khoảng cách.');
if (hong) process.exitCode = 1;
