/* ============================================================================
   kiem-doi-mua-1.mjs — máy kiểm 10 màn mới của mùa 1, gói 8 "Đội hai robot", chương 2 `che-hai-robot` "Đội phối hợp" (man-doi-mua-1.js).
   1. Vị trí: gói hai-robot (mùa 1) có hai chương hai-robot / che-hai-robot, chương mới đủ 10 màn đúng thứ tự, hàng lam-quen / luyen / bien-the / trum;
      trùm .10 mang huy hiệu 'che-hai-robot' (huy-hieu.js có hình); choi.html nạp man-doi-mua-1.js trước lo-trinh-hoc.js; mã mới không trùng màn cất;
      tên màn không trùng trong lộ trình.
   2. Từng màn: đủ trường; một sân (trùm: ba sân); R1 = hai bánh + TAY KẸP (vàng), R2 = hai bánh + TAY XOAY (lam), cảm biến khoảng cách; robot khóa (coDinh)
      chạy đúng chương trình của mã mẫu trong mọi bài làm; lời giải thắng 3 sao, đúng sao.o / sao.nhip, không chẩn đoán; mã mẫu chưa thắng;
      lời giải khác đúng 2 sao; mỗi lời sai thua và có đủ mã phaiCoMa; hàm của em cần đã học trước màn và khai đủ.
   3. Ràng buộc mùa 1: không biến (khung.chanBien), không hàm có tham số, không bậc thang S, không tạo hàm của em mới; khay chỉ có lệnh mùa 1
      (bánh có lùi, tay kẹp / tay xoay, ba cảm biến khoảng cách); mọi lời gọi (bắc cầu qua kho) chỉ tới lệnh mùa 1.
   4. Đường cong (KE-HOACH-MUA-1.md): dòng (chương trình robot không khóa + thân hàm), nhịp, cỡ sân (ô không phải tường) của màn n
      ≤ max(1,5 × màn n−1, màn n−1 + bù), bù dòng +3, nhịp +4, ô sân +6; trừ trùm. Màn 1 dễ hơn trùm chương 1 rất nhiều (nhịp ≤ 1/4).
   5. Recall: mỗi màn dùng ít nhất một thứ của gói 4–7 (nút đè M — lời giải thua khi bỏ nút; bánh lùi — gọi back / park / drag / left_back / right_back,
      không tính u_turn; tay xoay — R2 gọi arm_left / arm_right; cảm biến bên — gọi left_clear / right_clear); cả chương mỗi thứ ≥ 2 màn.
   6. Bộ dò đường tắt hai robot:
      - do-duong-hai-robot.mjs (bộ dò của chương 1) KHÔNG đọc part từng robot: nó coi mọi robot là tay kẹp (chỉ kẹp / thả ô trước mặt) và không nhận cửa C,
        nên máy này kiểm điều đó (bộ dò cũ từ chối sân có cửa, và nhận sai màn có tay xoay) rồi dùng bộ dò riêng dưới đây;
      - BFS "KHỐI CHUẨN HAI ROBOT": mỗi robot chọn từng khối lệnh của kho (move / back / turn_right / turn_left / u_turn / wait 1 nhịp; pick / drop 2 nhịp;
        R2 thêm pick_left / pick_right / drop_left / drop_right 2 nhịp, kẹp / thả ở nhịp đầu), robot khóa chạy đúng dãy khối của nó; luật hai robot như san-hoc.js
        (pha hành động R1 rồi R2, không vào ô đồng đội đang đứng hay định tới, không thả vào ô đồng đội, hai robot kẹp cùng một ô thì không ai được,
        nút đè M giữ cửa C, cửa không đóng xuống ô có xe / vật, cờ riêng từng robot). Đường dò được dịch thành chương trình rồi CHẠY THẬT bằng cham.js
        (đúng số nhịp). Không có đường nào nhanh hơn ngưỡng sao.nhip — trừ màn khai NHANH_HON (lý do ghi kèm; trùm thì đường đếm cứng của từng sân
        không thắng cả ba sân);
      - cần cả đội: màn đưa vật, một robot đứng yên (chỉ wait) thì bộ dò không tìm được đường thắng; lời giải bỏ chương trình một robot (không khóa) thì thua.
   Chạy: node hoc/kiem-doi-mua-1.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Cham = require('./cham.js');
const SanHoc = require('./san-hoc.js');
const M = require('./lo-trinh-hoc.js');
const TT = require('./thu-tu-chuong.js');
const { nhipHaiRobotTatCa } = await import('./do-duong-hai-robot.mjs');
const clone = (x) => JSON.parse(JSON.stringify(x));

let dat = 0, hong = 0;
function kiem(ten, fn) {
  try { fn(); dat++; } catch (e) { hong++; console.log('  HỎNG ' + ten + '\n       ' + (e && e.message ? e.message.split('\n')[0] : e)); }
}

const CHUONG = 'che-hai-robot';
const MOI = Array.from({ length: 10 }, (_, i) => CHUONG + '.' + (i + 1));
/** Ý mới của từng màn (để in bảng; mỗi màn tối đa một ý mới). */
const Y_MOI = [
  'R2 có tay xoay (pick_left / drop_right)', 'R1 dùng cảm biến bên (to_gap)', 'nút đè cho đội: R1 đứng giữ cửa', 'R2 chờ hàng bằng cảm biến bên',
  'R2 lùi khi cầm hàng (back giữ đúng bên tay xoay)', 'R2 chờ cửa mở; R1 tìm nút bằng to_gap', 'R1 chờ R2 rời ô đích (chờ ngược chiều)',
  'gác nút tới khi bạn vào cửa rồi lùi về (cờ riêng)', 'R1 tự động (khóa), sửa R2', 'trùm ba sân: mọi thứ của chương'
];
/** Màn mà bộ dò khối chuẩn có đường nhanh hơn ngưỡng: lý do. */
const NHANH_HON = {
  'che-hai-robot.4': 'R2 đếm đúng số nhịp chờ thì kẹp ngay trong nhịp R1 thả (R1 chạy trước trong nhịp), nhanh hơn chờ bằng cảm biến một nhịp; chỉ đúng ở sân này',
  'che-hai-robot.5': 'như màn 4: đếm nhịp chờ khớp đúng nhịp R1 thả',
  'che-hai-robot.9': 'như màn 4: đếm nhịp chờ khớp đúng nhịp R1 (tự động) thả',
  'che-hai-robot.10': 'trùm ba sân: đường ngắn nhất từng sân đếm cứng số bước (R2 tiến đúng tới ô trước ô đích, khỏi lùi) và số nhịp chờ; mục 6 kiểm nó không thắng cả ba sân'
};
/** Robot khóa: dãy khối nó chạy (đọc từ chương trình khóa; kiểm lại bằng chạy thật ở mục 6). */
const KHOI_KHOA = { 'che-hai-robot.9': { r: 0, khoi: ['move', 'move', 'pick', 'back', 'back', 'turn_right', 'drop'] } };
const BU = { dong: 3, nhip: 4, o: 6 };
const soSan = (m) => (Array.isArray(m.san[0]) ? m.san.length : 1);
const dsSan = (m) => (Array.isArray(m.san[0]) ? m.san : [m.san]);
const theoSan = (v, i, nhieu) => (nhieu && Array.isArray(v) ? v[i] : v);
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
  return Cham.cham(m, { doi: bai.doi, hamCuaMan: bai.hamCuaMan || [] }, [...hs.values()]);
}
function loiGoi(dong) { const s = new Set(); for (const l of dong || []) for (const x of l.matchAll(/([A-Za-z_]\w*)\s*\(/g)) s.add(x[1]); return s; }
const PY = new Set(['range', 'print', 'len']);
function moiBai(m) {
  const ds = [{ ten: 'maMau', b: m.maMau, moi: [] }, { ten: 'loiGiai', b: m.loiGiai, moi: m.loiGiai.hamCuaEmMoi }];
  if (m.loiGiaiKhac) ds.push({ ten: 'loiGiaiKhac', b: m.loiGiaiKhac.baiLam, moi: m.loiGiaiKhac.hamCuaEmMoi });
  m.loiSai.forEach((ls, i) => ds.push({ ten: 'loiSai[' + i + ']', b: ls.baiLam, moi: ls.hamCuaEmMoi }));
  return ds;
}
const thanHam = (x) => (x.b.hamCuaMan || []).concat(x.moi || []).flatMap((h) => h.than);
/** Dòng code robot i của một bài (chương trình chính + thân hàm của màn / hàm mới). */
const dongXe = (x, i) => [...((x.b.doi && x.b.doi[i] && x.b.doi[i].chinh) || []), ...thanHam(x)];
const dongCua = (x) => [...x.b.doi.flatMap((d) => d.chinh || []), ...thanHam(x)];
/** Số dòng người chơi viết / sửa: chương trình các robot KHÔNG khóa + thân hàm. */
const soDong = (m) => m.loiGiai.doi.reduce((s, d, i) => s + (m.doi[i].coDinh ? 0 : d.chinh.length), 0) + thanHam({ b: m.loiGiai, moi: m.loiGiai.hamCuaEmMoi }).length;
const coSan = (m) => Math.max(...dsSan(m).map((rows) => rows.join('').replace(/#/g, '').length));
const laBien = (l) => /^\s*[A-Za-z_]\w*(\s*\[[^\]]*\])?\s*[-+*/]?=(?!=)/.test(l) || /range\(\s*[A-Za-z_]/.test(l);
/** Mọi lệnh robot i chạy tới (bắc cầu qua kho hàm của em và hàm của màn), trừ thân các hàm trong `boQua`. */
function lenhBacCau(m, bai, i, boQua = []) {
  const bang = new Map(khoTruoc.get(m.ma).map((h) => [h.ten, h.than]));
  for (const h of (bai.hamCuaMan || []).concat(bai.hamCuaEmMoi || [])) bang.set(h.ten, h.than);
  const da = new Set(), cho = [...loiGoi(bai.doi[i].chinh)];
  while (cho.length) { const t = cho.pop(); if (da.has(t)) continue; da.add(t); if (bang.has(t) && !boQua.includes(t)) cho.push(...loiGoi(bang.get(t))); }
  return da;
}
const LENH_MUA_1 = new Set(['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'arm_down', 'arm_up', 'arm_left', 'arm_right', 'grab', 'release',
  'front_clear', 'left_clear', 'right_clear']);
const KEP = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'arm_down', 'arm_up', 'grab', 'release', 'front_clear', 'left_clear', 'right_clear'];
const XOAY = KEP.concat(['arm_left', 'arm_right']);

/* ------------------------------------------------------------------ 1. vị trí */
const goi = TT.goi.find((g) => g.ma === 'hai-robot');
kiem('gói hai-robot (mùa 1): hai chương hai-robot, che-hai-robot; chương mới đủ 10 màn đúng thứ tự, đúng hàng; tên chương "Đội phối hợp"', () => {
  assert.ok(goi && goi.mua === 'mua-1');
  assert.deepEqual(goi.chuong, ['hai-robot', CHUONG]);
  const ds = M.danhSach.filter((m) => m.chuong === CHUONG);
  assert.deepEqual(ds.map((m) => m.ma), MOI);
  assert.deepEqual(ds.map((m) => m.so), MOI.map((_, i) => i + 1));
  assert.deepEqual(ds.map((m) => m.hang), MOI.map((_, i) => (i < 3 ? 'lam-quen' : i < 6 ? 'luyen' : i < 9 ? 'bien-the' : 'trum')));
  assert.equal(TT.ten[CHUONG], 'Đội phối hợp');
  assert.equal(TT.thuTu.indexOf(CHUONG), TT.thuTu.indexOf('hai-robot') + 1, 'chương mới phải đứng ngay sau hai-robot');
});
kiem('mã mới không trùng màn đã cất; tên màn không trùng trong lộ trình', () => {
  for (const ma of MOI) assert.ok(!(M.manCat || []).includes(ma), ma + ' trùng màn đã cất');
  const tenMoi = DS.map((m) => m.ten), tenCu = M.danhSach.filter((m) => !MOI.includes(m.ma)).map((m) => m.ten);
  assert.equal(new Set(tenMoi).size, tenMoi.length, 'trùng tên trong chương');
  for (const t of tenMoi) assert.ok(!tenCu.includes(t), 'tên "' + t + '" trùng một màn khác của lộ trình');
});
kiem('huy hiệu: chỉ trùm .10 mang huy hiệu che-hai-robot (huy-hieu.js có hình); hai-robot.10 vẫn mang huy hiệu hai-robot', () => {
  const trum = get(CHUONG + '.10');
  assert.equal(trum.hang, 'trum');
  assert.equal(trum.huyHieu && trum.huyHieu.ma, CHUONG);
  assert.ok(trum.huyHieu.ten.length > 0);
  assert.deepEqual(M.danhSach.filter((m) => m.huyHieu && m.huyHieu.ma === CHUONG).map((m) => m.ma), [CHUONG + '.10']);
  assert.equal(get('hai-robot.10').huyHieu.ma, 'hai-robot');
  for (const m of DS.filter((x) => x.hang !== 'trum')) assert.ok(!m.huyHieu, m.ma + ' không phải trùm mà có huy hiệu');
  const hh = fs.readFileSync(new URL('./game/huy-hieu.js', import.meta.url), 'utf8');
  assert.ok(/HINH\['che-hai-robot'\]\s*=\s*function/.test(hh), "huy-hieu.js thiếu HINH['che-hai-robot']");
});
kiem('choi.html nạp man-doi-mua-1.js (một lần) trước lo-trinh-hoc.js', () => {
  const html = fs.readFileSync(new URL('./game/choi.html', import.meta.url), 'utf8');
  const a = html.indexOf('../man-doi-mua-1.js'), b = html.indexOf('../lo-trinh-hoc.js');
  assert.ok(a > 0 && a < b);
  assert.equal(html.split('../man-doi-mua-1.js').length, 2);
});

/* ------------------------------------------------------------------ 6a. bộ dò của chương 1 không đọc part từng robot */
const DO_CU = {};
kiem('do-duong-hai-robot.mjs (chương 1) không dùng được cho chương này: từ chối sân có cửa, không có hành động tay xoay (coi R2 là tay kẹp)', () => {
  let tuChoi = 0;
  for (const m of DS) {
    let loi = null, n = null;
    try { n = nhipHaiRobotTatCa(m); } catch (e) { loi = e.message; }
    DO_CU[m.ma] = loi ? 'từ chối' : n;
    if (dsSan(m).some((rows) => /[Cc]/.test(rows.join('')))) { assert.ok(loi, m.ma + ': bộ dò cũ lẽ ra phải từ chối sân có cửa'); tuChoi++; }
  }
  assert.ok(tuChoi >= 3);
  const ma = fs.readFileSync(new URL('./do-duong-hai-robot.mjs', import.meta.url), 'utf8');
  assert.ok(!/xoay|arm_left|arm_right/.test(ma), 'bộ dò cũ đã biết tay xoay: xem lại mục 6');
});

/* ------------------------------------------------------------------ 6b. bộ dò khối chuẩn hai robot */
const VEC = SanHoc.VEC;
const KHOI = {
  move: [{ di: 1 }], back: [{ di: -1 }], turn_right: [{ quay: 1 }], turn_left: [{ quay: 3 }], u_turn: [{ quay: 2 }], wait: [{}],
  pick: [{ kep: 0 }, {}], drop: [{ tha: 0 }, {}],
  pick_left: [{ kep: 3 }, {}], pick_right: [{ kep: 1 }, {}], drop_left: [{ tha: 3 }, {}], drop_right: [{ tha: 1 }, {}]
};
const KHOI_KEP = ['move', 'back', 'turn_right', 'turn_left', 'u_turn', 'wait', 'pick', 'drop'];
const KHOI_XOAY = KHOI_KEP.concat(['pick_left', 'pick_right', 'drop_left', 'drop_right']);
function nguCanh(m, si) {
  const nhieu = Array.isArray(m.san[0]), rows = dsSan(m)[si];
  if (/[^.#oDXFMCc]/.test(rows.join(''))) throw new Error(m.ma + ': bộ dò chỉ hỗ trợ tường, vật, ô đích, cờ, nút đè, cửa');
  const san = SanHoc.docSan(rows), rong = san.rong, cao = san.cao;
  const tuong = (o) => o < 0 || !!SanHoc.lyDoChan(san, 'banh', o % rong, (o - (o % rong)) / rong) && !san.cua.some((d) => d.y * rong + d.x === o);
  const ds = m.doi.map((d, i) => {
    const bd = theoSan(d.batDau, si, nhieu);
    const co = SanHoc.coCuaSan(d.co, si, nhieu);
    return { x: bd.x, y: bd.y, h: bd.huong || 0, xoay: d.robot.tay === 'xoay', co: co ? co.map((q) => q.y * rong + q.x) : null };
  });
  return {
    m, si, rows, rong, cao, mucTieu: m.mucTieu || 'toi-co', ds,
    o: (x, y) => (x < 0 || y < 0 || x >= rong || y >= cao ? -1 : y * rong + x),
    tuong, nut: san.nutDe.map((q) => q.y * rong + q.x), cua: san.cua.map((d) => ({ o: d.y * rong + d.x, mo0: d.mo })),
    laCo: (o) => o >= 0 && rows[(o - (o % rong)) / rong][o % rong] === 'F', dich: new Set(san.dich.map((d) => d.y * rong + d.x)),
    vat0: san.vat.map((v) => v.y * rong + v.x)
  };
}
/** Ô theo hướng (h + lech) từ ô (x, y). */
function ke(ctx, x, y, h) { const v = VEC[((h % 4) + 4) % 4]; return ctx.o(x + v[0], y + v[1]); }
/** Một nhịp. S = { r: [{x,y,h,cam,k,b,xong}], pos: [ô vật], cua: [bool] }; chon[i] = tên khối mới khi robot i rảnh. Trả trạng thái mới. */
function buoc(ctx, S, chon) {
  const r = S.r.map((R) => Object.assign({}, R)), pos = S.pos.slice(), cua = S.cua.slice();
  const vi = (R) => ctx.o(R.x, R.y);
  const hd = r.map((R, i) => {
    if (R.xong) return {};
    if (R.k === null) { R.k = chon[i]; R.b = 0; }
    const a = KHOI[R.k][R.b];
    return a;
  });
  const dinh = r.map((R, i) => (hd[i].di ? ke(ctx, R.x, R.y, R.h + (hd[i].di > 0 ? 0 : 2)) : -2));
  const kepO = r.map((R, i) => (hd[i].kep !== undefined && R.cam < 0 ? ke(ctx, R.x, R.y, R.h + hd[i].kep) : -1));
  const tranh = kepO[0] >= 0 && kepO[0] === kepO[1];
  const cuaDong = (o) => ctx.cua.some((d, j) => d.o === o && !cua[j]);
  for (let i = 0; i < r.length; i++) {
    const R = r[i], a = hd[i], K = r[1 - i];
    if (R.xong) continue;
    if (a.kep !== undefined && R.cam < 0 && !tranh) {
      const j = pos.indexOf(kepO[i]); if (kepO[i] >= 0 && j >= 0) { pos[j] = -1; R.cam = j; }
    } else if (a.tha !== undefined && R.cam >= 0) {
      const t = ke(ctx, R.x, R.y, R.h + a.tha);
      if (t >= 0 && !(ctx.tuong(t)) && pos.indexOf(t) < 0 && t !== vi(K)) { pos[R.cam] = t; R.cam = -1; }
    } else if (a.di) {
      const c = dinh[i];
      if (c >= 0 && !ctx.tuong(c) && !cuaDong(c) && pos.indexOf(c) < 0 && c !== vi(K) && c !== dinh[1 - i]) { R.x = c % ctx.rong; R.y = (c - R.x) / ctx.rong; }
    } else if (a.quay) R.h = (R.h + a.quay) % 4;
    R.b++;
    if (R.b >= KHOI[R.k].length) { R.k = null; R.b = 0; }
  }
  // cuối nhịp: nút đè (xe hay vật trên M) giữ cửa; cửa không đóng xuống ô có xe / vật
  const bat = ctx.nut.some((o) => r.some((R) => vi(R) === o) || pos.includes(o));
  ctx.cua.forEach((d, j) => {
    const muon = bat ? !d.mo0 : d.mo0;
    if (muon === cua[j]) return;
    if (!muon && (r.some((R) => vi(R) === d.o) || pos.includes(d.o))) return;
    cua[j] = muon;
  });
  if (ctx.mucTieu === 'toi-co') r.forEach((R, i) => { const o = vi(R); if (!R.xong && ctx.laCo(o) && (!ctx.ds[i].co || ctx.ds[i].co.includes(o))) { R.xong = true; R.k = null; } });
  return { r, pos, cua };
}
function laDich(ctx, S) { return ctx.mucTieu === 'toi-co' ? S.r.every((R) => R.xong) : S.pos.every((p) => p >= 0 && ctx.dich.has(p)); }
/**
 * BFS theo nhịp. tuyChon.khoa = { r, khoi } (robot khóa chạy đúng dãy khối rồi đứng yên), tuyChon.dungYen = chỉ số robot chỉ được wait().
 * Trả { nhip, khoi: [[tên khối của R1], [của R2]] } hay { nhip: null }.
 */
function bfs(m, si, tuyChon = {}, toiDa = 400000) {
  const ctx = nguCanh(m, si);
  const S0 = { r: ctx.ds.map((d) => ({ x: d.x, y: d.y, h: d.h, cam: -1, k: null, b: 0, xong: false, q: 0 })), pos: ctx.vat0.slice(), cua: ctx.cua.map((d) => d.mo0) };
  const khoa = tuyChon.khoa;
  const ma = (S) => S.r.map((R) => [R.x, R.y, R.h, R.cam, R.k, R.b, R.xong ? 1 : 0, R.q].join(',')).join('|') + '|' + S.pos.join('.') + '|' + S.cua.map(Number).join('');
  const thay = new Set([ma(S0)]);
  let lop = [{ S: S0, vet: [[], []] }];
  for (let n = 1; n <= 200 && lop.length; n++) {
    const tiep = [];
    for (const { S, vet } of lop) {
      const lua = S.r.map((R, i) => {
        if (R.xong || R.k !== null) return [null];
        if (khoa && khoa.r === i) return [R.q < khoa.khoi.length ? khoa.khoi[R.q] : 'wait'];
        if (tuyChon.dungYen === i) return ['wait'];
        return ctx.ds[i].xoay ? KHOI_XOAY : KHOI_KEP;
      });
      for (const a of lua[0]) for (const b of lua[1]) {
        const N = buoc(ctx, S, [a, b]);
        [a, b].forEach((x, i) => { if (x !== null && khoa && khoa.r === i) N.r[i].q = S.r[i].q + 1; else N.r[i].q = S.r[i].q; });
        const k = ma(N);
        if (thay.has(k)) continue;
        thay.add(k);
        const v2 = [a === null ? vet[0] : vet[0].concat(a), b === null ? vet[1] : vet[1].concat(b)];
        if (laDich(ctx, N)) return { nhip: n, khoi: v2 };
        tiep.push({ S: N, vet: v2 });
        if (thay.size > toiDa) throw new Error(m.ma + ' sân ' + si + ': bộ dò vượt ' + toiDa + ' trạng thái');
      }
    }
    lop = tiep;
  }
  return { nhip: null, khoi: null };
}
/** Dãy khối → dòng code (gộp các khối liền nhau giống nhau bằng vòng for). */
function thanhMa(khoi) {
  const ds = [];
  for (let i = 0; i < khoi.length;) {
    let j = i; while (j < khoi.length && khoi[j] === khoi[i]) j++;
    if (j - i >= 2) ds.push('for i in range(' + (j - i) + '):', '    ' + khoi[i] + '()'); else ds.push(khoi[i] + '()');
    i = j;
  }
  return ds;
}
/** Màn con chỉ có sân si, khung rộng (đường dò viết thẳng), robot khóa giữ chương trình khóa. */
function manSan(m, si) {
  const x = clone(m);
  x.khung = Object.assign({}, x.khung, { chinh: 99 });
  if (soSan(m) > 1) {
    x.san = clone(m.san[si]); delete x.nhipTheo;
    x.doi.forEach((d, i) => { d.batDau = clone(m.doi[i].batDau[si]); if (m.doi[i].co && Array.isArray(m.doi[i].co[0])) d.co = clone(m.doi[i].co[si]); });
    x.batDau = clone(x.doi[0].batDau);
  }
  return x;
}
/** Chương trình của đường dò: robot khóa chạy chương trình khóa của mã mẫu. */
function baiDuong(m, khoi) {
  return { doi: khoi.map((k, i) => ({ chinh: m.doi[i].coDinh ? m.maMau.doi[i].chinh.slice() : thanhMa(k) })), hamCuaMan: [] };
}
const bang = {};

/* ------------------------------------------------------------------ 2–3, 6. từng màn */
for (const m of DS) {
  if (!m) continue;
  const kho = khoTruoc.get(m.ma), daTao = daTaoTruoc.get(m.ma);
  bang[m.ma] = {};
  kiem(m.ma + ': đủ trường, số sân, đội R1 tay kẹp (vàng) + R2 tay xoay (lam), cảm biến khoảng cách, chặn biến', () => {
    for (const k of ['ten', 'deBai', 'san', 'batDau', 'mucTieu', 'hamGoc', 'sao', 'maMau', 'loiGiai', 'loiGiaiKhac', 'goiY', 'hamCuaEmCan']) assert.ok(m[k] !== undefined && m[k] !== '', m.ma + ' thiếu ' + k);
    assert.ok(m.loiSai.length >= 2, m.ma + ' cần ít nhất 2 lời sai');
    for (const ls of m.loiSai) assert.ok(ls.moTa && ls.phaiCoMa && ls.phaiCoMa.length, m.ma + ' lời sai thiếu moTa / phaiCoMa');
    assert.ok(m.goiY.length >= 1);
    assert.equal(soSan(m), m.hang === 'trum' ? 3 : 1, m.ma + ' số sân');
    for (const rows of dsSan(m)) assert.ok(!/S/.test(rows.join('')), m.ma + ' sân có bậc thang');
    assert.equal(m.doi.length, 2);
    const [a, b] = m.doi;
    assert.deepEqual([a.robot.than, a.robot.tay, a.robot.son, a.loaiRobot], ['hai-banh', 'kep', 'vang', 'banh'], m.ma + ' R1');
    assert.deepEqual([b.robot.than, b.robot.tay, b.robot.son, b.loaiRobot], ['hai-banh', 'xoay', 'lam', 'banh'], m.ma + ' R2');
    for (const d of m.doi) assert.deepEqual(d.robot.camBien.map((c) => c.ma), ['khoang-cach']);
    assert.deepEqual(a.hamGoc.slice().sort(), KEP.slice().sort(), m.ma + ' khay R1');
    assert.deepEqual(b.hamGoc.slice().sort(), XOAY.slice().sort(), m.ma + ' khay R2');
    assert.ok(m.khung.chanBien, m.ma + ' phải chặn biến (khung.chanBien)');
    assert.ok(!m.bienDem, m.ma + ' mở nhóm ĐẾM');
    if (m.hang === 'trum') assert.ok(m.huyHieu, m.ma + ' trùm thiếu huy hiệu');
  });
  kiem(m.ma + ': robot khóa (coDinh) chạy đúng chương trình của mã mẫu trong mọi bài làm', () => {
    m.doi.forEach((d, i) => {
      if (!d.coDinh) return;
      for (const x of moiBai(m)) assert.deepEqual(x.b.doi[i].chinh, m.maMau.doi[i].chinh, m.ma + ' ' + x.ten + ': chương trình R' + (i + 1) + ' khác bản khóa');
    });
  });
  kiem(m.ma + ': ràng buộc mùa 1 (không biến, không tham số, không tạo hàm mới, chỉ lệnh mùa 1 kể cả qua kho)', () => {
    for (const x of moiBai(m)) {
      for (const h of (x.b.hamCuaMan || []).concat(x.moi || [])) assert.deepEqual(h.thamSo || [], [], m.ma + ' ' + x.ten + ': hàm ' + h.ten + ' có tham số');
      assert.deepEqual(dongCua(x).filter(laBien), [], m.ma + ' ' + x.ten + ' dùng biến');
      for (let i = 0; i < 2; i++) {
        const l = lenhBacCau(m, Object.assign({ hamCuaEmMoi: x.moi || [] }, x.b), i);
        const goc = [...l].filter((t) => !kho.some((h) => h.ten === t) && !(x.b.hamCuaMan || []).some((h) => h.ten === t) && !PY.has(t));
        for (const t of goc) assert.ok(LENH_MUA_1.has(t), m.ma + ' ' + x.ten + ' R' + (i + 1) + ' gọi lệnh ngoài mùa 1: ' + t);
      }
    }
    assert.deepEqual(m.loiGiai.hamCuaEmMoi || [], [], m.ma + ' tạo hàm của em mới (cần mục Sổ lệnh)');
    assert.deepEqual(m.taoHam || [], [], m.ma + ' có taoHam');
  });
  kiem(m.ma + ': hàm của em cần đã học trước màn; mọi lời gọi hàm của em đều khai trong hamCuaEmCan', () => {
    for (const h of m.hamCuaEmCan) assert.ok(daTao.has(h) && kho.some((x) => x.ten === h), m.ma + ' cần ' + h + ' nhưng chưa màn nào trước nó tạo');
    for (const x of moiBai(m)) {
      const rieng = new Set((x.b.hamCuaMan || []).concat(x.moi || []).map((h) => h.ten));
      for (const t of loiGoi(dongCua(x))) {
        if (PY.has(t) || rieng.has(t) || XOAY.includes(t)) continue;
        assert.ok(m.hamCuaEmCan.includes(t), m.ma + ' ' + x.ten + ' gọi ' + t + '() mà không khai trong hamCuaEmCan');
      }
    }
  });
  kiem(m.ma + ': lời giải 3 sao đúng ngưỡng, không chẩn đoán; mã mẫu chưa thắng; lời giải khác 2 sao; lời sai thua đúng mã', () => {
    const r = cham(m, m.loiGiai, m.loiGiai.hamCuaEmMoi);
    assert.ok(r.thang, m.ma + ' lời giải thua: ' + JSON.stringify(r.chanDoan.map((c) => c.loi)));
    assert.equal(r.sao, 3, m.ma + ' sao=' + r.sao);
    assert.equal(r.soO, m.sao.o, m.ma + ' soO=' + r.soO + ' khai ' + m.sao.o);
    assert.equal(r.soNhip, m.sao.nhip, m.ma + ' soNhip=' + r.soNhip + ' khai ' + m.sao.nhip);
    assert.deepEqual(r.chanDoan.map((c) => c.ma), [], m.ma + ' lời giải có chẩn đoán');
    assert.ok(r.theoSan.length === soSan(m) && r.theoSan.every((s) => s.thang));
    assert.equal(cham(m, m.maMau).thang, false, m.ma + ' mã mẫu đã thắng sẵn');
    const rk = cham(m, m.loiGiaiKhac.baiLam, m.loiGiaiKhac.hamCuaEmMoi);
    assert.ok(rk.thang, m.ma + ' lời giải khác thua');
    assert.equal(rk.sao, 2, m.ma + ' lời giải khác sao=' + rk.sao);
    for (const ls of m.loiSai) {
      const rl = cham(m, ls.baiLam, ls.hamCuaEmMoi);
      assert.equal(rl.thang, false, m.ma + ' lời sai "' + ls.moTa + '" lại thắng');
      const ma = rl.chanDoan.map((c) => c.ma);
      for (const x of ls.phaiCoMa) assert.ok(ma.includes(x), m.ma + ' lời sai "' + ls.moTa + '" thiếu mã ' + x + ' (có: ' + ma.join(',') + ')');
    }
    Object.assign(bang[m.ma], { o: r.soO, nhip: r.soNhip });
  });
  kiem(m.ma + ': cần cả đội: bỏ chương trình một robot (không khóa) thì lời giải thua', () => {
    for (let i = 0; i < 2; i++) {
      if (m.doi[i].coDinh) continue;
      const b = clone(m.loiGiai); b.doi[i].chinh = [];
      assert.equal(cham(m, b).thang, false, m.ma + ': bỏ chương trình R' + (i + 1) + ' mà vẫn thắng');
    }
  });
  kiem(m.ma + ': bộ dò khối chuẩn hai robot: không có đường nhanh hơn ngưỡng (trừ lý do khai); đường dò chạy thật đúng nhịp; đưa vật thì một robot đứng yên không thắng', () => {
    let tong = 0;
    const duong = [];
    const khoa = KHOI_KHOA[m.ma];
    if (m.doi.some((d) => d.coDinh)) assert.ok(khoa && m.doi[khoa.r].coDinh, m.ma + ': màn có robot khóa cần khai KHOI_KHOA');
    for (let si = 0; si < soSan(m); si++) {
      const b = bfs(m, si, { khoa });
      assert.ok(b.nhip !== null, m.ma + ' sân ' + si + ': bộ dò không tới được đích');
      tong += b.nhip;
      const bai = baiDuong(m, b.khoi);
      duong.push(bai);
      const rr = Cham.cham(manSan(m, si), bai, kho);
      assert.ok(rr.thang, m.ma + ' sân ' + si + ': đường dò được thua khi chạy thật: ' + JSON.stringify(bai.doi.map((d) => d.chinh.join(' ; '))) + ' ' + JSON.stringify(rr.chanDoan.map((c) => c.ma)));
      assert.equal(rr.soNhip, b.nhip, m.ma + ' sân ' + si + ': bộ dò (' + b.nhip + ') và máy chấm (' + rr.soNhip + ') lệch nhịp: ' + JSON.stringify(bai.doi.map((d) => d.chinh.join(' ; '))));
      if (m.mucTieu === 'dua-vat') {
        for (let i = 0; i < 2; i++) {
          if (khoa && khoa.r === i) continue;
          assert.equal(bfs(m, si, { khoa, dungYen: i }).nhip, null, m.ma + ' sân ' + si + ': R' + (i + 1) + ' đứng yên mà đội vẫn đưa được vật tới đích');
        }
      }
    }
    if (NHANH_HON[m.ma]) assert.ok(tong < m.sao.nhip, m.ma + ': khai NHANH_HON mà đường khối chuẩn không nhanh hơn (' + tong + ' / ' + m.sao.nhip + ')');
    else assert.ok(tong >= m.sao.nhip, m.ma + ': đường khối chuẩn ' + tong + ' nhịp nhanh hơn ngưỡng ' + m.sao.nhip + ': ' + JSON.stringify(duong.map((d) => d.doi.map((x) => x.chinh.join(' ; ')))));
    if (soSan(m) > 1) {
      for (let i = 0; i < duong.length; i++) {
        const mr = Object.assign(clone(m), { khung: Object.assign({}, m.khung, { chinh: 99 }) });
        const r = cham(mr, duong[i]);
        assert.ok(!r.thang && r.theoSan[i].thang, m.ma + ': đường đếm cứng của sân ' + i + ' thắng cả ba sân (hay thua chính sân đó)');
      }
    }
    bang[m.ma].khoi = tong;
  });
}

/* ------------------------------------------------------------------ 4. đường cong */
kiem('đường cong chương mới: dòng / nhịp / cỡ sân màn n ≤ max(1,5 × màn n−1, màn n−1 + bù), trừ trùm', () => {
  for (let i = 1; i < DS.length; i++) {
    const m = DS[i], t = DS[i - 1];
    if (m.hang === 'trum') continue;
    const tran = (a, b, bu) => a <= Math.max(1.5 * b, b + bu);
    assert.ok(tran(soDong(m), soDong(t), BU.dong), m.ma + ' dòng ' + soDong(m) + ' so với ' + t.ma + ' ' + soDong(t));
    assert.ok(tran(m.sao.nhip, t.sao.nhip, BU.nhip), m.ma + ' nhịp ' + m.sao.nhip + ' so với ' + t.ma + ' ' + t.sao.nhip);
    assert.ok(tran(coSan(m), coSan(t), BU.o), m.ma + ' cỡ sân ' + coSan(m) + ' so với ' + t.ma + ' ' + coSan(t));
  }
});
kiem('màn 1 dễ hơn trùm chương 1 rất nhiều (nhịp ≤ 1/4, dòng và cỡ sân không lớn hơn)', () => {
  const a = DS[0], t = get('hai-robot.10');
  assert.ok(a.sao.nhip * 4 <= t.sao.nhip, a.ma + ' nhịp ' + a.sao.nhip + ' / trùm ' + t.sao.nhip);
  const dongTrum = t.loiGiai.doi.reduce((s, d) => s + d.chinh.length, 0);
  assert.ok(soDong(a) <= dongTrum && coSan(a) <= coSan(t));
});

/* ------------------------------------------------------------------ 5. recall gói 4–7 */
/** Thứ của gói 4–7 mà lời giải màn m dùng. */
function recall(m) {
  const kq = [];
  const lg = m.loiGiai;
  if (dsSan(m).some((rows) => rows.join('').includes('M'))) {
    const bo = clone(m); bo.san = soSan(m) > 1 ? m.san.map((rows) => rows.map((s) => s.replace(/M/g, '.'))) : m.san.map((s) => s.replace(/M/g, '.'));
    if (!cham(bo, lg).thang) kq.push('nút đè (gói 4)');
  }
  const goi = [0, 1].map((i) => lenhBacCau(m, lg, i, ['u_turn']));
  if (goi.some((g) => ['left_back', 'right_back', 'back', 'park', 'drag'].some((t) => g.has(t)))) kq.push('bánh lùi (gói 5)');
  if (['arm_left', 'arm_right'].some((t) => goi[1].has(t))) kq.push('tay xoay (gói 6)');
  if (goi.some((g) => ['left_clear', 'right_clear'].some((t) => g.has(t)))) kq.push('cảm biến bên (gói 7)');
  return kq;
}
const RECALL = Object.fromEntries(DS.map((m) => [m.ma, recall(m)]));
kiem('recall: mỗi màn dùng ít nhất một thứ của gói 4–7; cả chương mỗi thứ ≥ 2 màn', () => {
  for (const m of DS) assert.ok(RECALL[m.ma].length >= 1, m.ma + ' không recall gói 4–7');
  for (const t of ['nút đè (gói 4)', 'bánh lùi (gói 5)', 'tay xoay (gói 6)', 'cảm biến bên (gói 7)']) {
    const n = DS.filter((m) => RECALL[m.ma].includes(t)).length;
    assert.ok(n >= 2, t + ' chỉ có ở ' + n + ' màn');
  }
});
kiem('trùm dùng đủ bốn thứ của gói 4–7', () => { assert.equal(RECALL[CHUONG + '.10'].length, 4, JSON.stringify(RECALL[CHUONG + '.10'])); });

console.log('số | mã | tên | ý mới | recall gói 4–7 | dòng | nhịp | ô (code) | cỡ sân | khối chuẩn | bộ dò cũ');
DS.forEach((m, i) => {
  const b = bang[m.ma] || {};
  console.log([m.so, m.ma, m.ten, Y_MOI[i], RECALL[m.ma].join(', '), soDong(m), m.sao.nhip, m.sao.o, coSan(m), (b.khoi ?? '') + (NHANH_HON[m.ma] ? ' (NHANH_HON)' : ''), DO_CU[m.ma]].join(' | '));
});
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong + ' kiểm tra 10 màn chương Đội phối hợp.');
if (hong) process.exitCode = 1;
