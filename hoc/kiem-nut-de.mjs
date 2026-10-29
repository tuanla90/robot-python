/* ============================================================================
   kiem-nut-de.mjs — máy kiểm chương `nut-de` (man-nut-de.js): mùa 1, gói 4 "Kho hàng", chương 1 "Nút đè".
   1. Vị trí trong lộ trình: chương nut-de là chương 1 của gói kho-hang, đứng ngay trước chương kho-hang; tên "Nút đè"; huy hiệu có hình.
   2. Từng màn: đủ trường; lời giải thắng 3 sao, đúng sao.o / sao.nhip, KHÔNG có chẩn đoán nào; mã mẫu chưa thắng; lời giải khác đúng 2 sao;
      mỗi lời sai thua và có đủ mã phaiCoMa; hàm của em cần đã được tạo ở màn đứng trước (theo thứ tự lộ trình) và lời giải gọi thẳng hàm nào thì khai hàm đó.
   3. Ràng buộc mùa 1: không lệnh lùi, không left_clear / right_clear, không tay xoay, không biến, không hàm có tham số, không bậc thang S;
      u_turn() trong kho lúc này là bản hai lần turn_right().
   4. Đường cong: số dòng lời giải và số nhịp của màn n không quá 1,5 lần màn n−1 (trừ trùm); màn 1 dễ hơn trùm của gói trước.
   5. Bộ dò đường (BFS theo nhịp, luật nút đè / cửa như san-hoc.js; kiểm chéo đường tìm được bằng SanHoc.chay):
      - không có đường tới cờ nào NÉ cơ chế nút đè (không bao giờ đặt thùng lên M) mà nhanh bằng hay hơn ngưỡng sao.nhip;
      - màn cửa `c` (đè thì đóng): coi cửa luôn mở thì có đường nhanh hơn hẳn (cơ chế đổi đường đi thật);
      - đường ngắn nhất "khối chuẩn" (pick / drop = 2 nhịp, bánh mỗi nhịp một việc) không ngắn hơn ngưỡng: ngưỡng không lỏng.
   Chạy: node hoc/kiem-nut-de.mjs        (trượt thì thoát mã 1)
   ========================================================================== */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { coHinhRieng } from './huy-hieu-ds.mjs';   // V7c1: danh sách mã huy hiệu từ dữ liệu bộ vector (không regex huy-hieu.js pixel)

const require = createRequire(import.meta.url);
const SanHoc = require('./san-hoc.js');
const Cham = require('./cham.js');
const M = require('./lo-trinh-hoc.js');
const TT = require('./thu-tu-chuong.js');
const clone = (x) => JSON.parse(JSON.stringify(x));

let dat = 0, hong = 0;
function kiem(ten, fn) {
  try { fn(); dat++; } catch (e) { hong++; console.log('  HỎNG ' + ten + '\n       ' + (e && e.message ? e.message.split('\n')[0] : e)); }
}

const DS = M.danhSach.filter((m) => m.chuong === 'nut-de');
const SO_MAN = 10;
const soSan = (m) => (Array.isArray(m.san[0]) ? m.san.length : 1);
const dsSan = (m) => (Array.isArray(m.san[0]) ? m.san : [m.san]);
const theoSan = (v, i) => (Array.isArray(v) ? v[i] : v);

/* ------------------------------------------------------------------ 1. vị trí trong lộ trình */
kiem('chương nut-de là chương 1 của gói kho-hang, ngay trước chương kho-hang, tên "Thùng giữ cửa" (gói tên "Nút đè")', () => {
  const g = TT.goi.find((x) => x.ma === 'kho-hang');
  assert.ok(g && g.mua === 'mua-1', 'gói kho-hang ở mùa 1');
  assert.deepEqual(g.chuong, ['nut-de', 'kho-hang']);
  assert.equal(TT.thuTu.indexOf('kho-hang'), TT.thuTu.indexOf('nut-de') + 1);
  assert.equal(TT.ten['nut-de'], 'Thùng giữ cửa');      // tên theo quy tắc đặt tên (user duyệt 29/10): gói kho-hang tên 'Nút đè'
  assert.equal(DS.length, SO_MAN, 'chương nut-de có ' + DS.length + ' màn');
  assert.deepEqual(DS.map((m) => m.so), DS.map((_, i) => i + 1));
  assert.deepEqual(DS.map((m) => m.ma), DS.map((_, i) => 'nut-de.' + (i + 1)));
});
kiem('huy hiệu nut-de: màn 10 là trùm có huyHieu, huy-hieu.js có HINH riêng', () => {
  const trum = DS[DS.length - 1];
  assert.equal(trum.hang, 'trum');
  assert.deepEqual(trum.huyHieu && trum.huyHieu.ma, 'nut-de');
  assert.ok(typeof trum.huyHieu.ten === 'string' && trum.huyHieu.ten.length > 0);
  for (const m of DS.slice(0, -1)) assert.ok(!m.huyHieu, m.ma + ' không phải trùm mà có huy hiệu');
  assert.ok(coHinhRieng('nut-de'), "huy-hieu-vector.js thiếu hình huy hiệu 'nut-de' (hình vẽ riêng)");
});

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
/** Tên mọi lời gọi f(...) trong các dòng code. */
function loiGoi(dong) { const s = new Set(); for (const l of dong || []) for (const x of l.matchAll(/([A-Za-z_]\w*)\s*\(/g)) s.add(x[1]); return s; }
const PY = new Set(['range', 'print', 'len']);
/** Mọi bài làm khai trong màn (mã mẫu, lời giải, lời giải khác, lời sai), kèm các hàm mới / của màn của chúng. */
function moiBai(m) {
  const ds = [{ ten: 'maMau', b: m.maMau, moi: [] }, { ten: 'loiGiai', b: m.loiGiai, moi: m.loiGiai.hamCuaEmMoi }];
  if (m.loiGiaiKhac) ds.push({ ten: 'loiGiaiKhac', b: m.loiGiaiKhac.baiLam, moi: m.loiGiaiKhac.hamCuaEmMoi });
  m.loiSai.forEach((ls, i) => ds.push({ ten: 'loiSai[' + i + ']', b: ls.baiLam, moi: ls.hamCuaEmMoi }));
  return ds;
}
function dongCua(x) { return [...(x.b.chinh || []), ...(x.b.hamCuaMan || []).concat(x.moi || []).flatMap((h) => h.than)]; }
/** Số dòng lời giải người chơi viết / sửa: chương trình chính (trừ khi màn khóa nó: chinhCoDinh) + thân hàm mới + thân hàm của màn. */
const soDong = (m) => (m.chinhCoDinh ? 0 : m.loiGiai.chinh.length) + (m.loiGiai.hamCuaMan || []).concat(m.loiGiai.hamCuaEmMoi || []).reduce((s, h) => s + h.than.length, 0);
/** Màn cửa `c` (mở lúc đầu, đè thì đóng): cơ chế là cái bẫy phải tránh, không phải thứ phải dùng. */
const laCuaNguoc = (m) => dsSan(m).some((rows) => rows.join('').includes('c'));

/* ------------------------------------------------------------------ 5. bộ dò đường nút đè */
const VEC = SanHoc.VEC;
/** Ngữ cảnh một sân: ô chặn, nút, cửa (kèm nút điều khiển), thùng, cờ. */
function nguCanh(m, i) {
  const rows = dsSan(m)[i], san = SanHoc.docSan(rows), rong = san.rong, cao = san.cao;
  if (san.thung.length || san.nut.length || san.banXoay.length || san.cong.length || /[><^v]/.test(rows.join(''))) throw new Error(m.ma + ': bộ dò nút đè không hỗ trợ thùng nặng, nút bắn, bàn xoay, cổng, băng chuyền.');
  const chan = (x, y) => !!SanHoc.lyDoChan(san, 'banh', x, y);
  const nut = san.nutDe.map((q) => q.y * rong + q.x);
  const noi = soSan(m) > 1 ? (m.noi || [])[i] : m.noi;
  const cua = san.cua.map((d) => {
    let ds;
    if (noi) ds = noi.filter((g) => (g.cua || []).some((c) => c.x === d.x && c.y === d.y)).map((g) => nut.indexOf(g.nut.y * rong + g.nut.x));
    else ds = nut.map((_, k) => k);
    assert.ok(ds.every((k) => k >= 0), m.ma + ': noi trỏ tới ô không phải nút M');
    return { o: d.y * rong + d.x, mo0: d.mo, nut: ds };
  });
  const bd = theoSan(m.batDau, i);
  return { m, rong, cao, chan, nut, cua, co: san.co ? san.co.y * rong + san.co.x : -1, vat0: san.vat.map((v) => v.y * rong + v.x), bd, rows, noi };
}
/** Một nhịp. a = { tuThe: null|'duoi'|'tren', kep: null|'kep'|'tha', banh: 'tien'|'phai'|'trai'|'cho' }.
 *  tuyChon.khongDatLenM: cấm thả thùng xuống ô M (đường né cơ chế); tuyChon.cuaDungYen: cửa không bao giờ đổi (bỏ qua cơ chế). Trả trạng thái mới hay null (vật vỡ / bị cấm). */
function motNhip(ctx, S, a, tuyChon) {
  const { rong, cao } = ctx;
  const N = { x: S.x, y: S.y, h: S.h, t: S.t, cam: S.cam, pos: S.pos.slice(), cua: S.cua.slice() };
  if (a.tuThe === 'duoi') N.t = 1; else if (a.tuThe === 'tren') N.t = 0;
  const v = VEC[N.h], fx = N.x + v[0], fy = N.y + v[1];
  const trong = fx >= 0 && fy >= 0 && fx < rong && fy < cao;
  const front = trong ? fy * rong + fx : -1;
  if (a.kep === 'kep') {
    if (N.cam < 0 && N.t === 1 && front >= 0) { const k = N.pos.indexOf(front); if (k >= 0) { N.pos[k] = -1; N.cam = k; } }
  } else if (a.kep === 'tha' && N.cam >= 0) {
    if (N.t === 0) return null;                                              // thả từ trên cao: vật vỡ
    if (front >= 0 && !ctx.chan(fx, fy) && N.pos.indexOf(front) < 0) {
      if (tuyChon.khongDatLenM && ctx.nut.includes(front)) return null;
      N.pos[N.cam] = front; N.cam = -1;
    }
  }
  if (a.banh !== 'cho' && N.t === 0) {                                        // tay hạ: bánh không chạy
    if (a.banh === 'tien') {
      if (front >= 0 && !ctx.chan(fx, fy) && N.pos.indexOf(front) < 0) {
        const kc = ctx.cua.findIndex((d) => d.o === front);
        if (kc < 0 || N.cua[kc]) { N.x = fx; N.y = fy; }
      }
    } else if (a.banh === 'phai') N.h = (N.h + 1) % 4;
    else if (a.banh === 'trai') N.h = (N.h + 3) % 4;
  }
  if (!tuyChon.cuaDungYen) {                                                  // cuối nhịp: nút đè, rồi cửa (không đóng xuống ô có xe / vật)
    const xe = N.y * rong + N.x;
    const bat = ctx.nut.map((o) => o === xe || N.pos.includes(o));
    ctx.cua.forEach((d, k) => {
      if (!d.nut.length) return;
      const muon = d.nut.some((j) => bat[j]) ? !d.mo0 : d.mo0;
      if (muon === N.cua[k]) return;
      if (!muon && (xe === d.o || N.pos.includes(d.o))) return;
      N.cua[k] = muon;
    });
  }
  return N;
}
const BANH = ['tien', 'phai', 'trai', 'cho'];
function hanhDong(gop) {
  const ds = [];
  if (gop) { for (const t of [null, 'duoi', 'tren']) for (const k of [null, 'kep', 'tha']) for (const b of BANH) ds.push([{ tuThe: t, kep: k, banh: b }]); }
  else {                                                                      // khối chuẩn: bánh một nhịp; pick() / drop() = hai nhịp
    for (const b of ['tien', 'phai', 'trai']) ds.push([{ tuThe: null, kep: null, banh: b }]);
    ds.push([{ tuThe: 'duoi', kep: 'kep', banh: 'cho' }, { tuThe: 'tren', kep: null, banh: 'cho' }]);
    ds.push([{ tuThe: 'duoi', kep: 'tha', banh: 'cho' }, { tuThe: 'tren', kep: null, banh: 'cho' }]);
  }
  return ds;
}
/** BFS (Dijkstra theo nhịp, hành động 1–2 nhịp) tới cờ. Trả { nhip, chuoi } hay { nhip: null }. */
function nganNhat(ctx, tuyChon = {}) {
  const gop = tuyChon.gop !== false, dsHD = hanhDong(gop);
  const S0 = { x: ctx.bd.x, y: ctx.bd.y, h: ctx.bd.huong || 0, t: 0, cam: -1, pos: ctx.vat0.slice(), cua: ctx.cua.map((d) => d.mo0) };
  const khoa = (S) => [S.x, S.y, S.h, S.t, S.cam, S.pos.join(','), S.cua.map(Number).join('')].join('|');
  const laCo = (S) => S.y * ctx.rong + S.x === ctx.co;
  const thay = new Map([[khoa(S0), 0]]);
  let lop = [[S0, []]], nhip = 0;
  const cho = new Map();                                                      // nhịp → [trạng thái, chuỗi]
  const toiDa = tuyChon.toiDaNhip || 80;
  while (nhip <= toiDa) {
    for (const [S, chuoi] of lop) {
      for (const hd of dsHD) {
        let N = S, ok = true, buoc = 0;
        for (const a of hd) { N = motNhip(ctx, N, a, tuyChon); buoc++; if (!N) { ok = false; break; } if (laCo(N)) break; }
        if (!ok) continue;
        const c2 = chuoi.concat(hd.slice(0, buoc));
        if (laCo(N)) {                                                         // tới cờ: thắng ngay trong nhịp đó (trước nhịp thứ hai của khối)
          const n2 = nhip + buoc;
          if (!cho.has(-1) || cho.get(-1)[0] > n2) cho.set(-1, [n2, c2]);
          continue;
        }
        const k = khoa(N), n2 = nhip + buoc;
        if (thay.has(k) && thay.get(k) <= n2) continue;
        thay.set(k, n2);
        if (!cho.has(n2)) cho.set(n2, []);
        cho.get(n2).push([N, c2]);
      }
    }
    if (cho.has(-1) && cho.get(-1)[0] <= nhip + 1) return { nhip: cho.get(-1)[0], chuoi: cho.get(-1)[1] };
    nhip++;
    lop = (cho.get(nhip) || []).filter(([N]) => thay.get(khoa(N)) === nhip);
    cho.delete(nhip);
    if (!lop.length && ![...cho.keys()].some((k) => k > nhip) && !cho.has(-1)) return { nhip: null, chuoi: null };
  }
  if (cho.has(-1)) return { nhip: cho.get(-1)[0], chuoi: cho.get(-1)[1] };
  return { nhip: null, chuoi: null };
}
function thanhMa(chuoi) {
  const dong = [];
  for (const a of chuoi) {
    if (a.tuThe === 'duoi') dong.push('arm_down()'); else if (a.tuThe === 'tren') dong.push('arm_up()');
    if (a.kep === 'kep') dong.push('grab()'); else if (a.kep === 'tha') dong.push('release()');
    if (a.banh === 'tien' || a.banh === 'phai') dong.push('left_move()');
    if (a.banh === 'tien' || a.banh === 'trai') dong.push('right_move()');
    dong.push('wait()');
  }
  return dong.join('\n') + '\n';
}
/** Chạy thật một đường BFS bằng SanHoc.chay (luật thật của lõi). */
function chayThat(ctx, chuoi) {
  const m = ctx.m;
  return SanHoc.chay({ san: ctx.rows, batDau: ctx.bd, loaiRobot: 'banh', hamGoc: m.hamGoc, nhipToiDa: 200, mucTieu: 'toi-co', noi: ctx.noi || undefined, camBien: m.robot.camBien, phanCung: SanHoc.phanCungCua(m) }, thanhMa(chuoi));
}

/* ------------------------------------------------------------------ 2–5. từng màn */
const LUI = ['left_back', 'right_back', 'back'], BEN = ['left_clear', 'right_clear'], XOAY = ['arm_left', 'arm_right'];
const laBien = (l) => /^\s*[A-Za-z_]\w*(\s*\[[^\]]*\])?\s*[-+*/]?=(?!=)/.test(l) || /range\(\s*[A-Za-z_]/.test(l);
const TRUM_GOI_TRUOC = M.danhSach.filter((m) => TT.goi.find((g) => g.ma === 'cam-bien').chuong.includes(m.chuong) && m.hang === 'trum');
const bang = [];
let truoc = null;
for (const m of DS) {
  const kho = khoTruoc.get(m.ma), daTao = daTaoTruoc.get(m.ma);
  kiem(m.ma + ': đủ trường, đúng hàng, một sân (trừ trùm), sân có nút M và cửa', () => {
    // HD2: màn trình diễn (chiChay, nut-de.1) không có lời giải khác / lời sai (chương trình khoá, chỉ bấm Chạy)
    for (const k of ['ten', 'deBai', 'san', 'batDau', 'sao', 'maMau', 'loiGiai', 'goiY', 'hamCuaEmCan'].concat(m.chiChay ? [] : ['loiGiaiKhac'])) assert.ok(m[k] !== undefined && m[k] !== '', m.ma + ' thiếu ' + k);
    if (!m.chiChay) assert.ok(m.loiSai.length >= 2, m.ma + ' cần ít nhất 2 lời sai');
    for (const ls of m.loiSai) assert.ok(ls.moTa && ls.phaiCoMa && ls.phaiCoMa.length, m.ma + ' lời sai thiếu moTa / phaiCoMa');
    assert.ok(m.goiY.length >= 1);
    assert.equal(m.hang, m.so <= 3 ? 'lam-quen' : m.so <= 6 ? 'luyen' : m.so <= 9 ? 'bien-the' : 'trum', m.ma);
    assert.equal(soSan(m), m.hang === 'trum' ? 3 : 1, m.ma + ' số sân');
    for (const rows of dsSan(m)) {
      assert.ok(rows.join('').includes('M'), m.ma + ' sân không có nút M');
      assert.ok(/[Cc]/.test(rows.join('')), m.ma + ' sân không có cửa');
      assert.ok(!rows.join('').includes('S'), m.ma + ' có bậc thang S');
    }
    assert.equal(m.robot.than, 'hai-banh'); assert.equal(m.robot.tay, 'kep');
    assert.deepEqual(m.robot.camBien.map((c) => c.ma), ['khoang-cach']);
  });
  kiem(m.ma + ': ràng buộc mùa 1 (không lùi, không cảm biến bên, không tay xoay, không biến, không tham số; u_turn hai lần turn_right)', () => {
    for (const h of LUI.concat(BEN, XOAY)) assert.ok(!m.hamGoc.includes(h), m.ma + ' khay có ' + h);
    for (const x of moiBai(m)) {
      const goi = loiGoi(dongCua(x));
      for (const h of LUI.concat(BEN, XOAY)) assert.ok(!goi.has(h), m.ma + ' ' + x.ten + ' gọi ' + h);
      for (const h of (x.b.hamCuaMan || []).concat(x.moi || [])) assert.deepEqual(h.thamSo || [], [], m.ma + ' ' + x.ten + ': hàm ' + h.ten + ' có tham số');
      if (x.ten === 'maMau' || x.ten === 'loiGiai' || x.ten === 'loiGiaiKhac') assert.deepEqual(dongCua(x).filter(laBien), [], m.ma + ' ' + x.ten + ' dùng biến');
    }
    const ut = kho.find((h) => h.ten === 'u_turn');
    assert.ok(ut, 'kho chưa có u_turn');
    assert.deepEqual(ut.than, ['turn_right()', 'turn_right()'], 'u_turn trước gói Bánh lùi phải là hai lần turn_right()');
    for (const h of kho) assert.ok(!loiGoi(h.than).has('left_back') && !loiGoi(h.than).has('right_back'), 'kho có hàm ' + h.ten + ' dùng lệnh lùi');
  });
  kiem(m.ma + ': hàm của em cần đã học trước màn; lời giải gọi hàm của em nào (thẳng hay qua hàm của màn) thì khai trong hamCuaEmCan', () => {
    for (const h of m.hamCuaEmCan) assert.ok(daTao.has(h) && kho.some((x) => x.ten === h), m.ma + ' cần ' + h + ' nhưng chưa màn nào trước nó tạo');
    for (const x of moiBai(m)) {
      const rieng = new Set((x.b.hamCuaMan || []).concat(x.moi || []).map((h) => h.ten));
      for (const t of loiGoi(dongCua(x))) {
        if (PY.has(t) || rieng.has(t) || m.hamGoc.includes(t)) continue;
        assert.ok(m.hamCuaEmCan.includes(t), m.ma + ' ' + x.ten + ' gọi ' + t + '() mà không khai trong hamCuaEmCan');
      }
    }
    assert.deepEqual(m.loiGiai.hamCuaEmMoi || [], [], m.ma + ': chương nut-de không tạo hàm của em mới');
    assert.deepEqual(m.taoHam || [], []);
  });
  let r;
  kiem(m.ma + ': lời giải thắng 3 sao, đúng sao.o / sao.nhip, không chẩn đoán; mã mẫu chưa thắng; lời giải khác 2 sao; lời sai thua đúng mã', () => {
    r = cham(m, m.loiGiai, m.loiGiai.hamCuaEmMoi);
    assert.ok(r.thang, m.ma + ' lời giải thua: ' + JSON.stringify(r.chanDoan));
    assert.equal(r.sao, 3, m.ma + ' sao=' + r.sao);
    assert.equal(r.soO, m.sao.o, m.ma + ' soO=' + r.soO + ' khai ' + m.sao.o);
    assert.equal(r.soNhip, m.sao.nhip, m.ma + ' soNhip=' + r.soNhip + ' khai ' + m.sao.nhip);
    assert.deepEqual(r.chanDoan.map((c) => c.ma), [], m.ma + ' lời giải có chẩn đoán');
    assert.ok(r.theoSan.every((s) => s.thang));
    if (m.chiChay) { assert.ok(m.chinhCoDinh === true && cham(m, m.maMau).sao === 3, m.ma + ' màn trình diễn: mã mẫu khoá phải thắng 3 sao'); return; }   // HD2
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
  kiem(m.ma + ': đường cong (dòng, nhịp ≤ 1,5 lần màn trước; màn 1 dễ hơn trùm gói trước)', () => {
    const d = soDong(m), n = m.sao.nhip;
    if (!truoc) {
      for (const t of TRUM_GOI_TRUOC) {
        assert.ok(n < t.sao.nhip, m.ma + ' nhịp ' + n + ' không dễ hơn trùm ' + t.ma + ' (' + t.sao.nhip + ')');
        assert.ok(d <= soDong(t), m.ma + ' dòng ' + d + ' nhiều hơn trùm ' + t.ma);
      }
    } else if (m.hang !== 'trum') {
      const dTruoc = truoc.chiChay ? truoc.maMau.chinh.length : soDong(truoc);       // HD2: sau màn trình diễn, người chơi đã ĐỌC mã mẫu khoá: so với số dòng đó
      assert.ok(d <= 1.5 * dTruoc, m.ma + ' dòng ' + d + ' > 1,5 × ' + dTruoc);
      assert.ok(n <= 1.5 * truoc.sao.nhip, m.ma + ' nhịp ' + n + ' > 1,5 × ' + truoc.sao.nhip);
    }
  });
  kiem(m.ma + ': bộ dò đường: không có đường né nút đè nhanh hơn ngưỡng; ngưỡng không lỏng; đường dò được chạy thật đúng', () => {
    let tongNe = 0, coNe = true, tongKhoi = 0, tongBoQua = 0;
    for (let i = 0; i < soSan(m); i++) {
      const ctx = nguCanh(m, i);
      const ne = nganNhat(ctx, { khongDatLenM: true });
      if (ne.nhip === null) coNe = false; else tongNe += ne.nhip;
      const khoi = nganNhat(ctx, { gop: false });
      assert.ok(khoi.nhip !== null, m.ma + ' sân ' + i + ': bộ dò không tìm được đường khối chuẩn');
      tongKhoi += khoi.nhip;
      const rr = chayThat(ctx, khoi.chuoi);
      assert.ok(rr.thang, m.ma + ' sân ' + i + ': đường bộ dò tìm được thua khi chạy thật');
      assert.equal(rr.nhip, khoi.nhip, m.ma + ' sân ' + i + ': bộ dò và lõi lệch nhịp');
      if (ne.nhip !== null) { const rn = chayThat(ctx, ne.chuoi); assert.ok(rn.thang && rn.nhip === ne.nhip, m.ma + ': đường né chạy thật lệch'); }
      if (laCuaNguoc(m) && !dsSan(m)[i].join('').includes('C')) { const bq = nganNhat(ctx, { cuaDungYen: true, gop: false }); tongBoQua += bq.nhip; }
    }
    const nguong = m.sao.nhip;
    if (laCuaNguoc(m) && !dsSan(m).some((rows) => rows.join('').includes('C'))) {
      assert.ok(tongBoQua < tongKhoi, m.ma + ': coi cửa c luôn mở mà không nhanh hơn: cơ chế không đổi đường');
    } else {
      assert.ok(!coNe || tongNe > nguong, m.ma + ': có đường né nút đè ' + tongNe + ' nhịp ≤ ngưỡng ' + nguong);
    }
    assert.ok(tongKhoi >= nguong, m.ma + ': đường khối chuẩn ' + tongKhoi + ' nhịp < ngưỡng ' + nguong + ' (ngưỡng lỏng)');
    bang.push({ so: m.so, ten: m.ten, dong: soDong(m), nhip: m.sao.nhip, o: m.sao.o, khoi: tongKhoi, ne: coNe ? tongNe : '—' });
  });
  truoc = m;
}

console.log('màn | tên | dòng | nhịp | ô | khối chuẩn | né M');
for (const b of bang) console.log([b.so, b.ten, b.dong, b.nhip, b.o, b.khoi, b.ne].join(' | '));
console.log('ĐẠT ' + dat + ' · HỎNG ' + hong + ' kiểm tra chương Nút đè.');
if (hong) process.exitCode = 1;
