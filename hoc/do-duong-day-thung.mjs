/* ============================================================================
   do-duong-day-thung.mjs — BỘ DÒ "LỜI CỐ ĐỊNH" cho gói 5 mùa 2 Đẩy thùng (man-day-thung.js). Dùng trong kiem-day-thung.mjs; không nằm trong game.

   Xe bánh XÍCH đẩy thùng nặng (cfg.xichDay). Chương trình KHÔNG đọc cảm biến chạy ra MỘT DÃY HÀNH ĐỘNG CỐ ĐỊNH, dừng ngay khi thắng. Bộ dò:
     1. Mô phỏng sân theo nhịp đúng luật lõi (san-hoc.js: XÍCH ĐẨY THÙNG NẶNG, băng chuyền đẩy thùng sau 2 nhịp, nút đè M giữ cửa, thùng kẹt góc):
        hành động là hàm của em của xích: move M (1 nhịp, tiến hay đẩy), back B (1), tr_right R (2), tr_left L (2), wait W (1, chỉ khi sân có băng / cửa).
     2. Liệt kê MỌI dãy thắng sân với tổng nhịp ≤ gioiHan (đồ thị trạng thái + khoảng cách còn lại tới đích để cắt nhánh).
     3. NÉN mỗi dãy thành chương trình ít dòng nhất (hàm của em có sẵn mở được: spin, sidestep…; forward(n); for; while True ở khúc cuối)
        rồi chạy THẬT bằng cham.js: lời cố định rẻ nhất (theo ô) là thứ máy kiểm so với ngưỡng sao.
   Màn nhiều sân: dò CHUNG một dãy cho mọi sân (nhipTheo 'tong': mỗi bước tốn nhịp × số sân chưa xong).
   Tùy chọn khongDay: coi thùng như tường (xích không đẩy được) để hỏi "màn tới cờ có cần đẩy thùng không".

   Hàm xuất:
     dsDay(man, gioiHan, { tran, khongDay })        → [chuỗi hành động] thắng sân (một sân)
     doDuongChung(man, gioiHan, { khongDay })       → { nhip, chuoi } dãy chung rẻ nhất (mọi sân) hay null
     nenDay(day, khoHam, bo)                         → { dong, dung } chương trình ít dòng nhất
     timLoiNe(man, khoHam, cham)                     → { soO, soNhip, chinh, day } lời cố định rẻ nhất (thắng theo cham) hay null
     timLoiNeKhoa(man, tenX, khoHam, chamThan)       → màn khóa chương trình chính: thân hàm tenX là dãy cố định; { soO, soNhip, than, day } hay null
   ========================================================================== */
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const SanHoc = require('./san-hoc.js');
const VEC = SanHoc.VEC;
const BANG = { '^': 0, '>': 1, 'v': 2, '<': 3 };

const NGUYEN_TU = { move: 'M', back: 'B', tr_right: 'R', tr_left: 'L', wait: 'W' };
const TEN_CUA = Object.fromEntries(Object.entries(NGUYEN_TU).map(([k, v]) => [v, k]));
const GIA = { M: 1, B: 1, R: 2, L: 2, W: 1 };

/* ------------------------------------------------------------------ 1. mô phỏng một sân */
function sanCua(m, i) {
  const rows = Array.isArray(m.san[0]) ? m.san[i] : m.san, bd = Array.isArray(m.batDau) ? m.batDau[i] : m.batDau;
  const S = SanHoc.docSan(rows);
  if (S.vat.length || /[SunN@%12P]/.test(rows.join(''))) throw new Error((m.ma || '?') + ': bộ dò đẩy thùng chưa hỗ trợ vật nhẹ, bậc thang, hố, gầm, nút bắn, bàn xoay, cổng, ô sạc');
  return { S, rows, bd };
}
function moPhong(m, i, khongDay) {
  const { S, rows, bd } = sanCua(m, i);
  const W = S.rong, Hh = S.cao;
  const o = (x, y) => (x < 0 || y < 0 || x >= W || y >= Hh ? null : rows[y][x]);
  const dich = new Set(S.dich.map((d) => d.x + ',' + d.y));
  const nutDe = S.nutDe.map((q) => q.x + ',' + q.y);
  const cua = S.cua.map((d) => ({ k: d.x + ',' + d.y, mo0: d.mo }));
  const laDay = m.mucTieu === 'day-thung';
  const coThoiGian = /[<>^v]/.test(rows.join('')) || cua.length > 0;
  const tuongHoacMep = (x, y) => { const c = o(x, y); return c === null || c === '#' || c === '='; };
  function thungTai(st, x, y) { return st.t.findIndex((t) => t[0] === x && t[1] === y); }
  function cuaDong(st, x, y) { const j = cua.findIndex((d) => d.k === x + ',' + y); return j >= 0 && !st.c[j]; }
  function chanThung(st, x, y) {
    const c = o(x, y);
    if (c === null || c === '#' || c === 'N' || c === '=' || c === 'S') return true;
    if (cuaDong(st, x, y) || thungTai(st, x, y) >= 0) return true;
    return st.x === x && st.y === y;
  }
  function chanXe(st, x, y) { const c = o(x, y); return c === null || c === '#' || c === '=' || c === 'N' || cuaDong(st, x, y); }
  const dau = { x: bd.x, y: bd.y, h: bd.huong || 0, t: S.thung.map((q) => [q.x, q.y, 0]), c: cua.map((d) => d.mo0) };
  const khoa = (st) => st.x + ',' + st.y + ',' + st.h + '|' + st.t.map((t) => t.join('.')).join(';') + '|' + st.c.map((b) => (b ? 1 : 0)).join('');
  const xong = (st) => (laDay ? st.t.length > 0 && st.t.every((t) => dich.has(t[0] + ',' + t[1])) : !!S.co && st.x === S.co.x && st.y === S.co.y);
  function ket(st) {
    if (!laDay) return false;
    for (const t of st.t) {
      if (dich.has(t[0] + ',' + t[1])) continue;
      if (!(tuongHoacMep(t[0] - 1, t[1]) || tuongHoacMep(t[0] + 1, t[1]))) continue;
      if (!(tuongHoacMep(t[0], t[1] - 1) || tuongHoacMep(t[0], t[1] + 1))) continue;
      const c = o(t[0], t[1]);
      if (BANG[c] !== undefined) { const v = VEC[BANG[c]], cc = o(t[0] + v[0], t[1] + v[1]); if (cc !== null && cc !== '#' && cc !== 'S') continue; }
      return true;
    }
    return false;
  }
  /** Một nhịp: hành động robot (M tiến / đẩy, B lùi, '' đứng yên), rồi băng đẩy thùng, rồi cửa theo nút đè. Trả trạng thái mới. */
  function nhip(st0, hd) {
    const st = { x: st0.x, y: st0.y, h: st0.h, t: st0.t.map((t) => t.slice()), c: st0.c.slice() };
    const v = VEC[st.h];
    if (hd === 'M' || hd === 'B') {
      const s = hd === 'M' ? 1 : -1, nx = st.x + v[0] * s, ny = st.y + v[1] * s;
      if (!chanXe(st, nx, ny)) {
        const k = thungTai(st, nx, ny);
        if (k < 0) { st.x = nx; st.y = ny; }
        else if (hd === 'M' && !khongDay && !chanThung(st, nx + v[0], ny + v[1])) { st.t[k] = [nx + v[0], ny + v[1], 0]; st.x = nx; st.y = ny; }
      }
    }
    // băng chuyền đẩy thùng (đủ 2 nhịp liên tiếp)
    let dung = [];
    st.t.forEach((t, k) => { const c = o(t[0], t[1]); if (BANG[c] !== undefined) { t[2]++; if (t[2] >= 2) dung.push(k); } else t[2] = 0; });
    let doi = true;
    while (doi && dung.length) {
      doi = false;
      dung = dung.filter((k) => {
        const t = st.t[k], vb = VEC[BANG[o(t[0], t[1])]], nx = t[0] + vb[0], ny = t[1] + vb[1];
        if (chanThung(st, nx, ny)) return true;
        st.t[k] = [nx, ny, 0]; doi = true;
        return false;
      });
    }
    for (const k of dung) st.t[k][2] = 0;
    // cửa theo nút đè (mọi cửa nối mọi nút đè, cfg.noi không dùng ở gói này)
    if (cua.length) {
      const de = nutDe.some((q) => q === st.x + ',' + st.y || st.t.some((t) => t[0] + ',' + t[1] === q));
      cua.forEach((d, j) => {
        const muon = nutDe.length ? (de ? !d.mo0 : d.mo0) : st.c[j];
        if (muon === st.c[j]) return;
        const [cx, cy] = d.k.split(',').map(Number);
        if (!muon && ((st.x === cx && st.y === cy) || thungTai(st, cx, cy) >= 0)) return;     // không đóng xuống xe / thùng
        st.c[j] = muon;
      });
    }
    return st;
  }
  /** Hàm của em (nguyên tử) → { st, gia, xong } (gia: số nhịp thật tới lúc thắng hay hết lệnh); null nếu thua hẳn (thùng kẹt). */
  function buoc(st, a) {
    const ds = a === 'M' ? ['M'] : a === 'B' ? ['B'] : a === 'W' ? [''] : ['', ''];
    let s = st, g = 0;
    for (const hd of ds) {
      s = nhip(s, hd); g++;
      if (xong(s)) return { st: s, gia: g, xong: true };
      if (ket(s)) return null;
    }
    if (a === 'R') s = Object.assign({}, s, { h: (s.h + 1) % 4 });
    if (a === 'L') s = Object.assign({}, s, { h: (s.h + 3) % 4 });
    return { st: s, gia: g, xong: false };
  }
  const HD = ['M', 'B', 'R', 'L'].concat(coThoiGian ? ['W'] : []);
  return { dau, khoa, xong, buoc, HD };
}

/* ------------------------------------------------------------------ 2. dãy hành động thắng một sân */
export function dsDay(m, gioiHan, tuy = {}) {
  const tran = tuy.tran || 3000;
  const P = moPhong(m, 0, tuy.khongDay);
  const nut = new Map([[P.khoa(P.dau), P.dau]]), canh = new Map(), cho = [P.dau], THANG = '#THANG';
  // trạng thái đầu cũng tốn nhịp ⇒ giới hạn số trạng thái theo BFS độ sâu nhịp
  const sau = new Map([[P.khoa(P.dau), 0]]);
  while (cho.length) {
    const st = cho.shift(), k = P.khoa(st), ds = [];
    canh.set(k, ds);
    for (const a of P.HD) {
      const r = P.buoc(st, a);
      if (!r) continue;
      if (r.xong) { ds.push([a, THANG, r.gia]); continue; }
      const kn = P.khoa(r.st), d2 = sau.get(k) + r.gia;
      ds.push([a, kn, r.gia]);
      if (d2 > gioiHan) continue;
      if (!nut.has(kn)) { nut.set(kn, r.st); sau.set(kn, d2); cho.push(r.st); }
      else if (d2 < sau.get(kn)) sau.set(kn, d2);
    }
  }
  // khoảng cách còn lại tới đích (Dijkstra ngược)
  const nguoc = new Map();
  for (const [k, ds] of canh) for (const [, kn, g] of ds) { if (!nguoc.has(kn)) nguoc.set(kn, []); nguoc.get(kn).push([g, k]); }
  const con = new Map();
  let hang = [[0, THANG]];
  while (hang.length) {
    hang.sort((a, b) => a[0] - b[0]);
    const [c, k] = hang.shift();
    if (con.has(k)) continue;
    con.set(k, c);
    for (const [g, kt] of nguoc.get(k) || []) if (!con.has(kt)) hang.push([c + g, kt]);
  }
  const kq = [];
  (function di(k, c, chuoi) {
    if (kq.length >= tran) return;
    if (k === THANG) { kq.push(chuoi); return; }
    for (const [a, kn, g] of canh.get(k) || []) {
      const c2 = c + g;
      if (!con.has(kn) || c2 + con.get(kn) > gioiHan) continue;
      di(kn, c2, chuoi + a);
    }
  })(P.khoa(P.dau), 0, '');
  return kq;
}

/* ------------------------------------------------------------------ 3. dãy chung mọi sân (màn nhiều sân) */
export function doDuongChung(m, gioiHan, tuy = {}) {
  const n = Array.isArray(m.san[0]) ? m.san.length : 1;
  const Ps = Array.from({ length: n }, (_, i) => moPhong(m, i, tuy.khongDay));
  const HD = [...new Set(Ps.flatMap((P) => P.HD))];
  const dau = Ps.map((P) => ({ st: P.dau, xong: false }));
  const khoa = (ds) => ds.map((d, i) => (d.xong ? 'X' : Ps[i].khoa(d.st))).join('#');
  const tot = new Map([[khoa(dau), 0]]);
  let hang = [[0, dau, '']];
  while (hang.length) {
    hang.sort((a, b) => a[0] - b[0]);
    const [c, ds, chuoi] = hang.shift();
    if (tot.get(khoa(ds)) < c) continue;
    if (ds.every((d) => d.xong)) return { nhip: c, chuoi };
    for (const a of HD) {
      let tang = 0, ok = true;
      const moi = ds.map((d, i) => {
        if (d.xong) return d;
        const r = Ps[i].buoc(d.st, a);
        if (!r) { ok = false; return d; }
        tang += r.gia;
        return { st: r.st, xong: r.xong };
      });
      if (!ok) continue;
      const c2 = c + tang;
      if (c2 > gioiHan) continue;
      const k = khoa(moi);
      if (tot.has(k) && tot.get(k) <= c2) continue;
      tot.set(k, c2); hang.push([c2, moi, chuoi + a]);
    }
  }
  return null;
}

/* ------------------------------------------------------------------ 4. nén dãy thành chương trình ít dòng */
/** Dãy hành động của một hàm của em không tham số (chỉ gọi nguyên tử / hàm khác / for cố định), hay null nếu không mở được. */
function moHam(ten, bang, dang = new Set()) {
  if (NGUYEN_TU[ten]) return NGUYEN_TU[ten];
  const h = bang.get(ten);
  if (!h || h.thamSo.length || dang.has(ten)) return null;
  dang.add(ten);
  let kq = '';
  const than = h.than;
  for (let i = 0; i < than.length; i++) {
    const l = than[i];
    const f = l.match(/^for \w+ in range\((\d+)\):$/), g = l.match(/^\s*([A-Za-z_]\w*)\(\)$/);
    if (f && !/^\s/.test(l)) {
      let j = i + 1, khoi = '';
      for (; j < than.length && /^    /.test(than[j]); j++) {
        const gg = than[j].match(/^    ([A-Za-z_]\w*)\(\)$/);
        if (!gg) { dang.delete(ten); return null; }
        const e = moHam(gg[1], bang, dang);
        if (e === null) { dang.delete(ten); return null; }
        khoi += e;
      }
      kq += khoi.repeat(+f[1]); i = j - 1;
    } else if (g && !/^\s/.test(l)) {
      const e = moHam(g[1], bang, dang);
      if (e === null) { dang.delete(ten); return null; }
      kq += e;
    } else { dang.delete(ten); return null; }
  }
  dang.delete(ten);
  return kq;
}
const THAM_SO = { forward: (s) => /^M+$/.test(s) && ['forward(' + s.length + ')'] };
export function nenDay(day, khoHam, bo = new Set(), them = []) {
  const bang = new Map(khoHam.map((h) => [h.ten, h]));
  const mau = them.slice();
  for (const [a, t] of Object.entries(TEN_CUA)) if (!bang.has(t)) mau.push([t, a]);      // wait() là lệnh gốc
  for (const h of khoHam) if (!bo.has(h.ten) || NGUYEN_TU[h.ten]) { const e = moHam(h.ten, bang); if (e) mau.push([h.ten, e]); }
  const ts = Object.keys(THAM_SO).filter((t) => bang.has(t) && !bo.has(t));
  const n = day.length, C = [], B = [];
  for (let i = 0; i <= n; i++) { C.push(new Array(n + 1).fill(Infinity)); B.push(new Array(n + 1).fill(null)); }
  for (let len = 1; len <= n; len++) for (let i = 0; i + len <= n; i++) {
    const j = i + len, s = day.slice(i, j);
    let tot = Infinity, cach = null;
    for (const [ten, e] of mau) if (e === s) { tot = 1; cach = { goi: ten + '()' }; break; }
    if (tot > 1) for (const t of ts) { const r = THAM_SO[t](s); if (r) { tot = 1; cach = { goi: r[0] }; break; } }
    for (let k = i + 1; k < j && tot > 2; k++) if (C[i][k] + C[k][j] < tot) { tot = C[i][k] + C[k][j]; cach = { tach: k }; }
    for (let p = 1; p * 2 <= len; p++) if (len % p === 0 && s === s.slice(0, p).repeat(len / p) && 1 + C[i][i + p] < tot) { tot = 1 + C[i][i + p]; cach = { lap: len / p, p }; }
    C[i][j] = tot; B[i][j] = cach;
  }
  function viet(i, j, thut) {
    const c = B[i][j];
    if (c.goi) return [thut + c.goi];
    if (c.tach) return viet(i, c.tach, thut).concat(viet(c.tach, j, thut));
    return [thut + 'for i in range(' + c.lap + '):'].concat(viet(i, i + c.p, thut + '    '));
  }
  // T[i]: phủ day[i..n), khúc CUỐI được là `while True:` lặp tuần hoàn (thắng thì dừng giữa chừng)
  const T = new Array(n + 1).fill(Infinity), TB = new Array(n + 1).fill(null);
  T[n] = 0;
  for (let i = n - 1; i >= 0; i--) {
    for (let k = i + 1; k <= n; k++) if (C[i][k] + T[k] < T[i]) { T[i] = C[i][k] + T[k]; TB[i] = { k }; }
    const s = day.slice(i);
    for (let p = 1; p < s.length; p++) {
      let ok = true;
      for (let q = p; q < s.length && ok; q++) if (s[q] !== s[q - p]) ok = false;
      if (ok && 1 + C[i][i + p] < T[i]) { T[i] = 1 + C[i][i + p]; TB[i] = { tuan: p }; }
    }
  }
  const dong = [];
  for (let i = 0; i < n;) {
    const t = TB[i];
    if (t.tuan) { dong.push('while True:', ...viet(i, i + t.tuan, '    ')); break; }
    dong.push(...viet(i, t.k, '')); i = t.k;
  }
  const dung = [...new Set(dong.flatMap((l) => [...l.matchAll(/([A-Za-z_]\w*)\(/g)].map((x) => x[1])))].filter((t) => t !== 'range' && (bang.has(t) || them.some((x) => x[0] === t)));
  return { dong, dung };
}

/* ------------------------------------------------------------------ 5. lời cố định rẻ nhất */
function khucLap(day, tran = 120) {
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
/** cham(dong, hamMoi) → kết quả cham.js. Trả lời cố định rẻ nhất theo ô (thắng). */
export function timLoiNe(m, khoHam, cham, tuy = {}) {
  const tran = tuy.tran || 3000, tranF = tuy.tranF || 60;
  const ds = dsDay(m, m.sao.nhip, { tran });
  let tot = null;
  const da = new Map();
  const chiNguyenTu = new Set(khoHam.map((h) => h.ten).filter((t) => !NGUYEN_TU[t]));
  ds.forEach((day, so) => {
    const thu = [[]];
    if (so < tranF) for (const k of khucLap(day)) thu.push([['f', k]]);
    for (const them of thu) {
      const hamMoi = them.length ? [{ ten: 'f', thamSo: [], than: nenDay(them[0][1], khoHam, chiNguyenTu).dong }] : [];
      const daBo = new Set(), cho = [new Set(), chiNguyenTu];
      let r = null;
      while (cho.length && daBo.size < 40) {
        const bo = cho.pop(), k = [...bo].sort().join(',');
        if (daBo.has(k)) continue;
        daBo.add(k);
        const tim = nenDay(day, khoHam, bo, them), r2 = chay(tim.dong, hamMoi);
        if (r2 && (!r || r2.soO < r.soO)) r = r2;
        for (const t of tim.dung) if (!NGUYEN_TU[t] && t !== 'f' && !bo.has(t)) cho.push(new Set([...bo, t]));
      }
      if (r && (!tot || r.soO < tot.soO)) tot = Object.assign({ day }, r);
    }
  });
  return tot;
  function chay(dong, hamMoi) {
    if (hamMoi.length && !dong.some((l) => /\bf\(\)/.test(l))) return null;
    const k = dong.join('\n') + '|' + JSON.stringify(hamMoi);
    if (!da.has(k)) { const r = cham(dong, hamMoi); da.set(k, r.thang ? { soO: r.soO, soNhip: r.soNhip, chinh: dong, hamMoi } : null); }
    return da.get(k);
  }
}

/* ------------------------------------------------------------------ 6. màn khóa chương trình chính: chỉ sửa thân MỘT hàm */
function moMau(dong, tenX, khoHam) {
  const bang = new Map(khoHam.map((h) => [h.ten, h]));
  function khoi(ds, thut) {
    let kq = [];
    for (let i = 0; i < ds.length; i++) {
      const l = ds[i].slice(thut);
      const f = l.match(/^for \w+ in range\((\d+)\):$/);
      if (f) {
        let j = i + 1;
        while (j < ds.length && ds[j].startsWith(' '.repeat(thut + 4))) j++;
        const than = khoi(ds.slice(i + 1, j), thut + 4);
        if (than === null) return null;
        for (let k = 0; k < +f[1]; k++) kq = kq.concat(than);
        i = j - 1;
        continue;
      }
      const g = l.match(/^([A-Za-z_]\w*)\((.*)\)$/);
      if (!g) return null;
      const so = g[2].trim();
      if (g[1] === tenX) kq.push('X');
      else if (!so) { const e = moHam(g[1], bang); if (e === null) return null; kq = kq.concat(e.split('')); }
      else if (g[1] === 'forward' && /^\d+$/.test(so)) kq = kq.concat('M'.repeat(+so).split(''));
      else return null;
    }
    return kq;
  }
  return khoi(dong, 0);
}
export function timLoiNeKhoa(m, tenX, khoHam, chamThan, tuy = {}) {
  const tran = tuy.tran || 3000;
  const mau = moMau(m.loiGiai.chinh, tenX, khoHam);
  if (!mau) throw new Error(m.ma + ': không mở được chương trình chính khóa thành dãy mẫu');
  const i0 = mau.indexOf('X');
  let tot = null;
  const da = new Set();
  const chiNguyenTu = new Set(khoHam.map((h) => h.ten).filter((t) => !NGUYEN_TU[t]));
  for (const day of dsDay(m, m.sao.nhip, { tran })) {
    if (i0 < 0 || mau.slice(0, i0).join('') !== day.slice(0, i0)) continue;
    for (let L = 0; i0 + L <= day.length; L++) {
      const x = day.slice(i0, i0 + L), mo = mau.map((t) => (t === 'X' ? x : t)).join('');
      if (!mo.startsWith(day) || da.has(x)) continue;
      da.add(x);
      for (const than of x ? [nenDay(x, khoHam).dong, nenDay(x, khoHam, chiNguyenTu).dong] : [['pass']]) {
        const r = chamThan(than);
        if (r.thang && (!tot || r.soO < tot.soO)) tot = { soO: r.soO, soNhip: r.soNhip, than, day };
      }
    }
  }
  return tot;
}
