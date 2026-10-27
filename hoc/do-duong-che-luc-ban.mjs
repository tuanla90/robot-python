/* ============================================================================
   do-duong-che-luc-ban.mjs — BỘ DÒ "LỜI CỐ ĐỊNH" cho chương che-luc-ban "Hàm lực bắn" (man-che-luc-ban.js, mùa 2 gói 6). Dùng trong kiem-che-luc-ban.mjs; không nằm trong game.

   Xe HAI BÁNH gắn súng hơi, màn lucBan. Mô phỏng một nhịp lấy y nguyên BFS của do-duong-sung-hoi.mjs (luật san-hoc.js: bóng, giật, thùng trượt, nút, cửa, băng chuyền, bóng mờ).
   Một hành động mỗi nhịp, viết bằng một chữ:
       M tiến   B lùi   R quay phải   L quay trái   U quay đầu   W đứng yên
       f bắn nhanh ra trước   c bắn tụ ra trước   g bắn nhanh ra sau   h bắn tụ ra sau
   Chương trình KHÔNG đọc cảm biến chạy ra MỘT DÃY CỐ ĐỊNH. Bộ dò:
     1. dsDay: liệt kê MỌI dãy thắng sân (một sân) với tổng nhịp ≤ giới hạn (đồ thị trạng thái + khoảng cách còn lại tới đích để cắt nhánh).
     2. moRong: mở thân hàm của em / chương trình thành dãy chữ (for với số cố định, tham số số hay chuỗi; gặp if / while / cảm biến / biến thì không mở được).
     3. nenDay: nén một dãy thành chương trình ít dòng nhất: hàm của em mở được (move, turn_left, forward(n), fire(p), fire_left(p)…), lệnh gốc viết thẳng, for, while True ở khúc cuối;
        thêm được MỘT hàm phụ f() không tham số, hay MỘT hàm phụ g(p) có tham số lực (khối lặp lại chỉ khác lực của một phát bắn).
     4. timLoiNe: lời cố định rẻ nhất (theo ô, chấm thật bằng cham.js) thắng sân trong sao.nhip.
     5. timLoiNeKhoa: màn khóa chương trình chính: thân hàm X là một dãy cố định (mọi lời gọi X chạy cùng dãy); trả thân rẻ nhất thắng được hay null.
     6. doDuongChung: màn nhiều sân: một dãy chung thắng MỌI sân, nhịp tính tổng (sân tới cờ thì dừng sân đó); null nếu không có trong giới hạn.

   Hàm xuất: CHU, dsDay, doDuongChung, moRong, nenDay, timLoiNe, timLoiNeKhoa
   ========================================================================== */
import { createRequire } from 'node:module';
import * as Bo from './do-duong-sung-hoi.mjs';

const require = createRequire(import.meta.url);
const SanHoc = require('./san-hoc.js');

/** Chữ của một hành động BFS. */
export function CHU(a) {
  if (a.ban) return a.ban === 'truoc' ? (a.luc === 'fast' ? 'f' : 'c') : (a.luc === 'fast' ? 'g' : 'h');
  return { cho: 'W', tien: 'M', lui: 'B', phai: 'R', trai: 'L', dau: 'U' }[a.banh];
}

/* ------------------------------------------------------------------ 1. một sân */
function conCua(m, i) {
  const nhieu = Array.isArray(m.san[0]);
  const lm = SanHoc.lopMauCuaSan(m, i);
  return Object.assign({}, m, { san: nhieu ? m.san[i] : m.san, batDau: Array.isArray(m.batDau) ? m.batDau[i] : m.batDau, bongMo: lm.bongMo || m.bongMo, cuaNhip: lm.cuaNhip || undefined, noi: lm.noi || m.noi });
}
function moPhong(m, i) {
  const con = conCua(m, i);
  const ctx = Bo.dungNguCanh(con);
  const HD = Bo.hanhDongChoPhep(con).map((a) => [CHU(a), a]);
  const khoa = (S) => [S.x, S.y, S.h, S.d, S.p.join('.'), S.e.join('.'), S.nm, S.cm, S.bm, S.t, S.q].join(',');
  const dung = ctx.mucTieu !== 'bong-mo';                // tới cờ / đẩy thùng: thắng là dừng; bóng mờ: thắng khi chương trình chạy xong
  return { ctx, HD, khoa, dau: Bo.trangThaiDau(ctx), buoc: (S, a) => Bo.buocMotNhip(ctx, S, a), laDich: (S) => Bo.laDich(ctx, S), dung };
}

/** Đồ thị trạng thái một sân trong gioiHan nhịp: cạnh, khoảng cách còn lại tới đích (con). */
function doThi(m, gioiHan, tuy = {}) {
  const toiDa = tuy.toiDaTrangThai || 400000;
  const P = moPhong(m, tuy.san || 0);
  const k0 = P.khoa(P.dau);
  const nut = new Map([[k0, P.dau]]), sau = new Map([[k0, 0]]), canh = new Map(), DICH = '#DICH';
  let cho = [P.dau], catNgang = false;
  const dichTai = new Set();
  if (P.laDich(P.dau)) dichTai.add(k0);
  for (let d = 0; d < gioiHan && cho.length; d++) {
    const moi = [];
    for (const st of cho) {
      const k = P.khoa(st), ds = [];
      canh.set(k, ds);
      for (const [c, a] of P.HD) {
        const n = P.buoc(st, a);
        if (n.chet) continue;
        const kn = P.khoa(n);
        if (P.laDich(n)) dichTai.add(kn);
        ds.push([c, kn]);
        if (P.dung && P.laDich(n)) continue;           // tới đích là dừng: không đi tiếp từ đó
        if (!nut.has(kn)) {
          nut.set(kn, n); sau.set(kn, d + 1); moi.push(n);
          if (nut.size > toiDa) { catNgang = true; break; }
        }
      }
      if (catNgang) break;
    }
    if (catNgang) break;
    cho = moi;
  }
  // khoảng cách còn lại tới một trạng thái đích (BFS ngược, mọi cạnh 1 nhịp)
  const nguoc = new Map();
  for (const [k, ds] of canh) for (const [, kn] of ds) { if (!nguoc.has(kn)) nguoc.set(kn, []); nguoc.get(kn).push(k); }
  const con = new Map();
  let hang = [...dichTai];
  hang.forEach((k) => con.set(k, 0));
  while (hang.length) {
    const moi = [];
    for (const k of hang) for (const kt of nguoc.get(k) || []) if (!con.has(kt)) { con.set(kt, con.get(k) + 1); moi.push(kt); }
    hang = moi;
  }
  return { P, k0, canh, con, dichTai, catNgang };
}
/** Mọi dãy thắng sân (một sân) với tổng nhịp ≤ gioiHan; tối đa tuy.tran dãy. Trả { ds, catNgang }. */
export function dsDay(m, gioiHan, tuy = {}) {
  const tran = tuy.tran || 3000;
  const { P, k0, canh, con, dichTai, catNgang } = doThi(m, gioiHan, tuy);
  const kq = [];
  (function di(k, c, chuoi) {
    if (kq.length >= tran) return;
    if (dichTai.has(k) && chuoi) { kq.push(chuoi); if (P.dung) return; }
    else if (dichTai.has(k) && !chuoi) kq.push('');
    for (const [a, kn] of canh.get(k) || []) {
      if (!con.has(kn) || c + 1 + con.get(kn) > gioiHan) continue;
      di(kn, c + 1, chuoi + a);
    }
  })(k0, 0, '');
  return { ds: kq.filter((x) => x.length), catNgang: catNgang || kq.length >= tran };
}

/* ------------------------------------------------------------------ 2. dãy chung mọi sân */
export function doDuongChung(m, gioiHan) {
  const n = Array.isArray(m.san[0]) ? m.san.length : 1;
  const Ps = Array.from({ length: n }, (_, i) => moPhong(m, i));
  const HD = Ps[0].HD;
  const dau = Ps.map((P) => ({ st: P.dau, xong: false }));
  const khoa = (ds) => ds.map((d, i) => (d.xong ? 'X' : Ps[i].khoa(d.st))).join('#');
  const tot = new Map([[khoa(dau), 0]]);
  const xo = Array.from({ length: gioiHan + 1 }, () => []);          // hàng đợi theo xô: chi phí là số nguyên nhỏ
  xo[0].push([0, dau, '']);
  for (let cx = 0; cx <= gioiHan; cx++) while (xo[cx].length) {
    const [c, ds, chuoi] = xo[cx].pop();
    if (tot.get(khoa(ds)) < c) continue;
    if (chuoi && ds.every((d, i) => d.xong || (!Ps[i].dung && Ps[i].laDich(d.st)))) return { nhip: c, chuoi };
    for (const [ch, a] of HD) {
      let tang = 0, ok = true;
      const moi = ds.map((d, i) => {
        if (d.xong) return d;
        const r = Ps[i].buoc(d.st, a);
        if (r.chet) { ok = false; return d; }
        tang++;
        return { st: r, xong: Ps[i].dung && Ps[i].laDich(r) };
      });
      if (!ok) continue;
      const c2 = c + tang;
      if (c2 > gioiHan) continue;
      const k = khoa(moi);
      if (tot.has(k) && tot.get(k) <= c2) continue;
      tot.set(k, c2); xo[c2].push([c2, moi, chuoi + ch]);
    }
  }
  return null;
}

/* ------------------------------------------------------------------ 3. mở chương trình thành dãy chữ */
const RAW_BANH = { left_move: [1, 0], right_move: [0, 1], left_back: [-1, 0], right_back: [0, -1] };
function hieuQua(l, r) {
  if (l === r) return l > 0 ? 'M' : l < 0 ? 'B' : 'W';
  const d = r - l;
  if (Math.abs(d) === 2) return 'U';
  return d > 0 ? 'L' : 'R';
}
function tachDoi(s) {
  const kq = []; let cur = '', sau = 0, nhay = null;
  for (const ch of s) {
    if (nhay) { cur += ch; if (ch === nhay) nhay = null; continue; }
    if (ch === '"' || ch === "'") { nhay = ch; cur += ch; continue; }
    if (ch === '(') sau++;
    if (ch === ')') sau--;
    if (ch === ',' && !sau) { kq.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  if (cur.trim()) kq.push(cur.trim());
  return kq;
}
function giaTri(t, env) {
  if (/^-?\d+$/.test(t)) return +t;
  const s = t.match(/^"([^"]*)"$|^'([^']*)'$/);
  if (s) return s[1] !== undefined ? s[1] : s[2];
  if (Object.prototype.hasOwnProperty.call(env, t)) return env[t];
  const cong = t.match(/^(\w+)\s*([-+])\s*(\w+)$/);
  if (cong) { const a = giaTri(cong[1], env), b = giaTri(cong[3], env); if (typeof a === 'number' && typeof b === 'number') return cong[2] === '+' ? a + b : a - b; }
  return undefined;
}
/**
 * Mở các dòng (chương trình hay thân hàm) thành dãy chữ. kho: [{ten, thamSo, than}]. env: tham số → giá trị. tenX: tên hàm giữ nguyên thành chữ 'X'.
 * Trả chuỗi (có thể có 'X') hay null nếu không mở được (if, while, biến, cảm biến, lệnh lạ).
 */
export function moRong(dong, kho, env = {}, tenX = null, sau = 0) {
  if (sau > 12) return null;
  const bang = new Map(kho.map((h) => [h.ten, h]));
  const ds = dong.map((l) => l.replace(/#.*$/, '')).filter((l) => l.trim());
  const thut = (l) => l.match(/^ */)[0].length;
  let kq = '', banh = [0, 0], sung = null;
  function khoi(a, b, e) {
    for (let i = a; i < b; i++) {
      const l = ds[i], t = l.trim(), base = thut(l);
      const f = t.match(/^for\s+\w+\s+in\s+range\((.+)\):$/);
      if (f) {
        let j = i + 1;
        while (j < b && thut(ds[j]) > base) j++;
        const n = giaTri(f[1].trim(), e);
        if (typeof n !== 'number' || n < 0 || n > 30) return false;
        for (let k = 0; k < n; k++) if (!khoi(i + 1, j, e)) return false;
        i = j - 1; continue;
      }
      const g = t.match(/^([A-Za-z_]\w*)\((.*)\)$/);
      if (!g) return false;
      const ten = g[1], doi = tachDoi(g[2]).map((x) => giaTri(x, e));
      if (doi.some((x) => x === undefined)) return false;
      if (ten === tenX) { if (banh[0] || banh[1] || sung) return false; kq += 'X'; continue; }
      if (RAW_BANH[ten]) { const v = RAW_BANH[ten]; if (v[0]) banh[0] = v[0]; if (v[1]) banh[1] = v[1]; continue; }
      if (ten === 'shoot' || ten === 'shoot_back') {
        const luc = doi.length ? doi[0] : 'charge';
        if (luc !== 'fast' && luc !== 'charge') return false;
        sung = (ten === 'shoot' ? 'truoc' : 'sau') + ':' + luc; continue;
      }
      if (ten === 'wait') {
        if (sung) { const [h, lc] = sung.split(':'); kq += h === 'truoc' ? (lc === 'fast' ? 'f' : 'c') : (lc === 'fast' ? 'g' : 'h'); }
        else kq += hieuQua(banh[0], banh[1]);
        banh = [0, 0]; sung = null; continue;
      }
      const h = bang.get(ten);
      if (!h || h.thamSo.length !== doi.length) return false;
      if (banh[0] || banh[1] || sung) return false;
      const e2 = {}; h.thamSo.forEach((p, k) => { e2[p] = doi[k]; });
      const r = moRong(h.than, kho, e2, tenX, sau + 1);
      if (r === null) return false;
      kq += r;
    }
    return true;
  }
  if (!khoi(0, ds.length, env)) return null;
  if (banh[0] || banh[1] || sung) return null;           // còn lệnh chưa wait(): khung khác, không xét
  return kq;
}

/* ------------------------------------------------------------------ 4. nén dãy thành chương trình ít dòng */
const RAW = {
  M: ['left_move()', 'right_move()', 'wait()'], B: ['left_back()', 'right_back()', 'wait()'], R: ['left_move()', 'wait()'], L: ['right_move()', 'wait()'],
  U: ['left_move()', 'right_back()', 'wait()'], W: ['wait()'],
  f: ['shoot("fast")', 'wait()'], c: ['shoot("charge")', 'wait()'], g: ['shoot_back("fast")', 'wait()'], h: ['shoot_back("charge")', 'wait()']
};
const GIA_TRI_THU = [1, 2, 3, 4, 5, 6, 7, 8, 'fast', 'charge'];
/** Các "viên gạch" dùng được: [dòng gọi, dãy chữ, tên hàm của em dùng]. bo: tên hàm không được dùng. */
function gach(kho, bo, them) {
  const kq = [];
  for (const [a, dong] of Object.entries(RAW)) kq.push([dong, a, null]);
  for (const h of kho) {
    if (bo.has(h.ten)) continue;
    if (!h.thamSo.length) { const e = moRong(h.than, kho); if (e) kq.push([[h.ten + '()'], e, h.ten]); continue; }
    if (h.thamSo.length > 2) continue;
    const bo2 = h.thamSo.length === 1 ? GIA_TRI_THU.map((v) => [v]) : GIA_TRI_THU.flatMap((a) => GIA_TRI_THU.map((b) => [a, b]));
    const da = new Set();
    for (const vs of bo2) {
      const env = {}; h.thamSo.forEach((p, k) => { env[p] = vs[k]; });
      const e = moRong(h.than, kho, env);
      if (!e || da.has(e)) continue;
      da.add(e);
      kq.push([[h.ten + '(' + vs.map((v) => (typeof v === 'string' ? '"' + v + '"' : v)).join(', ') + ')'], e, h.ten]);
    }
  }
  return kq.concat(them || []);
}
export function nenDay(day, kho, bo = new Set(), them = [], khongTuan = false) {
  const G = gach(kho, bo, them);
  const n = day.length, C = [], B = [];
  for (let i = 0; i <= n; i++) { C.push(new Array(n + 1).fill(Infinity)); B.push(new Array(n + 1).fill(null)); }
  for (let len = 1; len <= n; len++) for (let i = 0; i + len <= n; i++) {
    const j = i + len, s = day.slice(i, j);
    let tot = Infinity, cach = null;
    for (const [dong, e] of G) if (e === s && dong.length < tot) { tot = dong.length; cach = { dong }; }
    for (let k = i + 1; k < j; k++) if (C[i][k] + C[k][j] < tot) { tot = C[i][k] + C[k][j]; cach = { tach: k }; }
    for (let p = 1; p * 2 <= len; p++) if (len % p === 0 && s === s.slice(0, p).repeat(len / p) && 1 + C[i][i + p] < tot) { tot = 1 + C[i][i + p]; cach = { lap: len / p, p }; }
    C[i][j] = tot; B[i][j] = cach;
  }
  function viet(i, j, th) {
    const c = B[i][j];
    if (c.dong) return c.dong.map((l) => th + l);
    if (c.tach) return viet(i, c.tach, th).concat(viet(c.tach, j, th));
    return [th + 'for i in range(' + c.lap + '):'].concat(viet(i, i + c.p, th + '    '));
  }
  // T[i]: phủ day[i..n); khúc CUỐI được là `while True:` lặp tuần hoàn (thắng thì dừng giữa chừng)
  const T = new Array(n + 1).fill(Infinity), TB = new Array(n + 1).fill(null);
  T[n] = 0;
  for (let i = n - 1; i >= 0; i--) {
    for (let k = i + 1; k <= n; k++) if (C[i][k] + T[k] < T[i]) { T[i] = C[i][k] + T[k]; TB[i] = { k }; }
    const s = day.slice(i);
    for (let p = 1; p < s.length && !khongTuan; p++) {
      let ok = true;
      for (let q = p; q < s.length && ok; q++) if (s[q] !== s[q - p]) ok = false;
      if (ok && 1 + C[i][i + p] < T[i]) { T[i] = 1 + C[i][i + p]; TB[i] = { tuan: p }; }
    }
  }
  if (!n) return { dong: [], dung: [] };
  const dong = [];
  for (let i = 0; i < n;) {
    const t = TB[i];
    if (t.tuan) { dong.push('while True:', ...viet(i, i + t.tuan, '    ')); break; }
    dong.push(...viet(i, t.k, '')); i = t.k;
  }
  const ten = new Set(kho.map((h) => h.ten).concat(them.map((x) => x[2]).filter(Boolean)));
  const dung = [...new Set(dong.flatMap((l) => [...l.matchAll(/([A-Za-z_]\w*)\(/g)].map((x) => x[1])))].filter((t) => ten.has(t));
  return { dong, dung };
}

/* ------------------------------------------------------------------ 5. lời cố định rẻ nhất */
function khucLap(day, tran = 80) {
  const kq = new Set();
  for (let len = 2; len * 2 <= day.length; len++) for (let i = 0; i + len <= day.length; i++) {
    const k = day.slice(i, i + len);
    if (kq.has(k)) continue;
    let dem = 0;
    for (let j = 0; (j = day.indexOf(k, j)) >= 0; j += len) dem++;
    if (dem >= 2) kq.add(k);
    if (kq.size >= tran) return [...kq];
  }
  return [...kq];
}
/** Khối có MỘT phát bắn trước (f / c) đổi lực được, lặp lại ít nhất hai lần với cả hai lực: hàm phụ g(p). */
function khucLuc(day, tran = 60) {
  const kq = new Map();
  for (let len = 1; len <= 8 && len * 2 <= day.length; len++) for (let i = 0; i + len <= day.length; i++) {
    const k = day.slice(i, i + len);
    for (let q = 0; q < len; q++) {
      if (k[q] !== 'f' && k[q] !== 'c') continue;
      const mau = k.slice(0, q) + '?' + k.slice(q + 1);
      if (kq.has(mau)) continue;
      const re = new RegExp(mau.replace('?', '[fc]'), 'g');
      const thay = [...day.matchAll(re)].map((x) => x[0][q]);
      if (thay.length >= 2 && new Set(thay).size === 2) kq.set(mau, q);
      if (kq.size >= tran) return [...kq];
    }
  }
  return [...kq];
}
/** Hàm phụ cho một khối: f() không tham số hay g(p) với một chỗ lực. Trả { hamMoi, them } (them: viên gạch gọi hàm phụ). */
function hamPhu(kho, khoi) {
  if (!khoi.includes('?')) {
    const than = nenDay(khoi, kho).dong;
    return { hamMoi: [{ ten: 'f', thamSo: [], than }], them: [[['f()'], khoi, 'f']] };
  }
  const q = khoi.indexOf('?');
  const coFire = kho.some((h) => h.ten === 'fire');
  const truoc = nenDay(khoi.slice(0, q), kho).dong, sau = nenDay(khoi.slice(q + 1), kho).dong;
  const than = truoc.concat(coFire ? ['fire(p)'] : ['shoot(p)', 'wait()'], sau);
  return { hamMoi: [{ ten: 'g', thamSo: ['p'], than }], them: [[['g("fast")'], khoi.replace('?', 'f'), 'g'], [['g("charge")'], khoi.replace('?', 'c'), 'g']] };
}
/** cham(dong, hamMoi) → kết quả cham.js. Trả lời cố định rẻ nhất theo ô (thắng) hay null. */
export function timLoiNe(m, kho, cham, tuy = {}) {
  const tranF = tuy.tranF || 40;
  const { ds, catNgang } = dsDay(m, m.sao.nhip, tuy);
  let tot = null;
  const da = new Map();
  const chiKho = new Set(kho.map((h) => h.ten));
  ds.forEach((day, so) => {
    const thu = [null];
    if (so < tranF) { for (const k of khucLap(day)) thu.push(k); for (const [k] of khucLuc(day)) thu.push(k); }
    for (const khoi of thu) {
      const ph = khoi ? hamPhu(kho, khoi) : { hamMoi: [], them: [] };
      const daBo = new Set(), cho = [new Set(), chiKho];
      let r = null;
      while (cho.length && daBo.size < 30) {
        const bo = cho.pop(), k = [...bo].sort().join(',');
        if (daBo.has(k)) continue;
        daBo.add(k);
        const tim = nenDay(day, kho, bo, ph.them), r2 = chay(tim.dong, ph.hamMoi);
        if (r2 && (!r || r2.soO < r.soO)) r = r2;
        for (const t of tim.dung) if (t !== 'f' && t !== 'g' && !bo.has(t)) cho.push(new Set([...bo, t]));
      }
      if (r && (!tot || r.soO < tot.soO)) tot = Object.assign({ day }, r);
    }
  });
  return tot ? Object.assign(tot, { catNgang, soDay: ds.length }) : { khong: true, catNgang, soDay: ds.length };
  function chay(dong, hamMoi) {
    if (hamMoi.length && !dong.some((l) => new RegExp('\\b' + hamMoi[0].ten + '\\(').test(l))) return null;
    const k = dong.join('\n') + '|' + JSON.stringify(hamMoi);
    if (!da.has(k)) { const r = cham(dong, hamMoi); da.set(k, r.thang ? { soO: r.soO, soNhip: r.soNhip, chinh: dong, hamMoi } : null); }
    return da.get(k);
  }
}

/* ------------------------------------------------------------------ 6. màn khóa chương trình chính: thân MỘT hàm là dãy cố định */
/** Chạy cả chương trình (dãy chữ) trên sân i: { thang, nhip }. Tới cờ / đẩy thùng: dừng khi thắng; bóng mờ: xét lúc hết dãy. */
function chayDay(P, day) {
  let st = P.dau;
  if (P.dung && P.laDich(st)) return { thang: true, nhip: 0 };
  for (let i = 0; i < day.length; i++) {
    const a = P.HD.find((x) => x[0] === day[i]);
    if (!a) return { thang: false, nhip: i };
    st = P.buoc(st, a[1]);
    if (st.chet) return { thang: false, nhip: i + 1 };
    if (P.dung && P.laDich(st)) return { thang: true, nhip: i + 1 };
  }
  return { thang: !P.dung && P.laDich(st), nhip: day.length };
}
/**
 * Màn khóa chương trình chính (MỘT sân): thân hàm X là dãy cố định x, mọi lời gọi X chạy cùng x. Dò mọi x (cắt nhánh bằng khoảng cách còn lại tới đích
 * sau lần gọi X đầu tiên) sao cho cả chương trình thắng trong sao.nhip; nén x thành thân ít dòng rồi chấm thật bằng chamThan(than).
 * Trả { soO, soNhip, than, x } rẻ nhất (theo ô) hay { khong: true, soX } (soX: số thân cố định thắng được).
 */
export function timLoiNeKhoa(m, tenX, kho, chamThan, tuy = {}) {
  if (Array.isArray(m.san[0])) throw new Error(m.ma + ': bộ dò màn khóa chỉ cho một sân');
  const mau = moRong(m.loiGiai.chinh, kho, {}, tenX);
  if (mau === null) throw new Error(m.ma + ': không mở được chương trình chính khóa thành dãy mẫu');
  const i0 = mau.indexOf('X');
  if (i0 < 0) throw new Error(m.ma + ': chương trình chính không gọi ' + tenX);
  const gioiHan = m.sao.nhip;
  const { P, k0, canh, con } = doThi(m, gioiHan, tuy);
  // trạng thái sau đoạn đầu cố định
  let st = P.dau, k = k0;
  for (const ch of mau.slice(0, i0)) {
    const e = (canh.get(k) || []).find((x) => x[0] === ch);
    if (!e) return { khong: true, soX: 0 };
    const a = P.HD.find((x) => x[0] === ch)[1];
    st = P.buoc(st, a); k = e[1];
  }
  // bóng mờ: chương trình chạy hết nên tổng độ dài (đoạn cố định + mỗi lần gọi một x) không quá giới hạn
  const soX = mau.split('X').length - 1, coDinh = mau.length - soX;
  const dai = P.dung ? Infinity : Math.floor((gioiHan - coDinh) / soX);
  const thang = [];
  let soNut = 0;
  (function di(k, c, x) {
    if (thang.length > 400 || ++soNut > 200000) return;
    const r = chayDay(P, mau.split('X').join(x));
    if (r.thang && r.nhip <= gioiHan) thang.push(x);
    if (P.dung && P.laDich && thang.includes(x) && r.nhip <= i0 + x.length) return;     // đã tới đích ngay trong lần gọi đầu
    if (x.length >= dai) return;
    for (const [ch, kn] of canh.get(k) || []) {
      if (!con.has(kn) || c + 1 + con.get(kn) > gioiHan) continue;
      di(kn, c + 1, x + ch);
    }
  })(k, i0, '');
  if (soNut > 200000) throw new Error(m.ma + ': bộ dò màn khóa quá nhiều nhánh');
  let tot = null;
  for (const x of thang) {
    const than = x ? nenDay(x, kho, new Set(), [], true).dong : ['pass'];
    const r = chamThan(than);
    if (r.thang && (!tot || r.soO < tot.soO)) tot = { soO: r.soO, soNhip: r.soNhip, than, x };
  }
  return tot ? Object.assign(tot, { soX: thang.length }) : { khong: true, soX: thang.length };
}
