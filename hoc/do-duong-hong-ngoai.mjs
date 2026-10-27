/* ============================================================================
   do-duong-hong-ngoai.mjs — BỘ DÒ "LỜI NÉ distance()" cho gói 3 mùa 2 Hồng ngoại (man-hong-ngoai.js). Dùng trong kiem-hong-ngoai.mjs; không nằm trong game.

   Câu hỏi: có chương trình nào KHÔNG đọc distance() mà vẫn được 3 sao (ô ≤ sao.o VÀ nhịp ≤ sao.nhip) không? Có thì màn hỏng ý (giải được không cần cảm biến).
   Chương trình không đọc cảm biến (không if / while theo cảm biến) chạy RA MỘT DÃY HÀNH ĐỘNG CỐ ĐỊNH, dừng ngay khi thắng. Nên:
     1. Liệt kê MỌI dãy hành động (move M, back B, turn_right R, turn_left L, u_turn U: 1 nhịp; pick P, drop D: 2 nhịp) thắng sân với tổng nhịp ≤ sao.nhip
        (đi trên đồ thị trạng thái thật của sân: ô, hướng, vật đang cầm, chỗ các vật; cắt nhánh bằng khoảng cách còn lại tới đích).
     2. Với mỗi dãy, NÉN thành chương trình ít dòng nhất bằng quy hoạch động: gọi hàm của em có sẵn (kho trước màn: move, corner, stair, side, row…; hàm có
        tham số forward(n), right(k), deliver(n), step(a, b)), vòng `for i in range(k):` cho khúc lặp lại, và `while True:` cho khúc CUỐI lặp tuần hoàn
        (thắng thì chương trình dừng, nên vòng lặp không cần biết khi nào thôi). Thử bỏ bớt hàm để khỏi tính thân hàm (soO đếm cả thân hàm được gọi).
     3. Chạy THẬT chương trình nén bằng cham.js (đúng soO, đúng nhịp, phải thắng). Trả về lời rẻ nhất.
   Đây là bộ dò heuristic (không thử biến, phép tính trên biến đếm vòng lặp, lệnh bánh viết tay): màn nên dùng độ dài đoạn KHÔNG đều (không cấp số cộng)
   để những cách đó cũng không rẻ hơn. Màn nhiều sân dùng bộ dò BFS chung mọi sân trong kiem-hong-ngoai.mjs.

   Hàm xuất:
     dsDay(man, gioiHan, tran = 3000)     → [chuỗi hành động] thắng sân (một sân) với tổng nhịp ≤ gioiHan
     nenDay(day, khoHam, bo = new Set())  → { dong, dung: [tên hàm của em gọi] } chương trình ít dòng nhất (chưa tính thân hàm)
     timLoiNe(man, khoHam, cham)          → { soO, soNhip, chinh, day } lời né distance() rẻ nhất (thắng, theo cham), hay null
   ========================================================================== */
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const SanHoc = require('./san-hoc.js');
const VEC = SanHoc.VEC;

const NGUYEN_TU = { move: 'M', back: 'B', turn_right: 'R', turn_left: 'L', u_turn: 'U', pick: 'P', drop: 'D' };
const TEN_CUA = Object.fromEntries(Object.entries(NGUYEN_TU).map(([k, v]) => [v, k]));
const GIA = { M: 1, B: 1, R: 1, L: 1, U: 1, P: 2, D: 2 };

/* ------------------------------------------------------------------ 1. dãy hành động thắng sân */
export function dsDay(m, gioiHan, tran = 3000) {
  const rows = Array.isArray(m.san[0]) ? m.san[0] : m.san, bd = Array.isArray(m.batDau) ? m.batDau[0] : m.batDau;
  const S = SanHoc.docSan(rows);
  if (S.thung.length || /[NCc<>^vSun]/.test(rows.join(''))) throw new Error(m.ma + ': bộ dò chưa hỗ trợ thùng nặng, nút, cửa, băng chuyền');
  const coTay = m.hamGoc.includes('grab'), laDuaVat = m.mucTieu === 'dua-vat';
  const HD = ['M', 'B', 'R', 'L', 'U'].concat(coTay ? ['P', 'D'] : []);
  const chan = (x, y) => x < 0 || y < 0 || x >= S.rong || y >= S.cao || !!SanHoc.lyDoChan(S, 'banh', x, y);
  const dich = S.dich.map((d) => d.y * S.rong + d.x).sort((a, b) => a - b);
  const xong = (st) => {
    if (!laDuaVat) return !!S.co && st.x === S.co.x && st.y === S.co.y;
    if (st.cam >= 0) return false;
    const p = st.pos.slice().sort((a, b) => a - b);
    return p.length === dich.length && p.every((c, k) => c === dich[k]);
  };
  const khoa = (st) => [st.x, st.y, st.h, st.cam, st.pos.join('.')].join(',');
  function buoc(st, t) {
    const N = { x: st.x, y: st.y, h: st.h, cam: st.cam, pos: st.pos.slice() };
    const v = VEC[N.h], fx = N.x + v[0], fy = N.y + v[1], front = fy * S.rong + fx;
    if (t === 'M') { if (!chan(fx, fy) && !N.pos.includes(front)) { N.x = fx; N.y = fy; } }
    else if (t === 'B') { const bx = N.x - v[0], by = N.y - v[1]; if (!chan(bx, by) && !N.pos.includes(by * S.rong + bx)) { N.x = bx; N.y = by; } }
    else if (t === 'R') N.h = (N.h + 1) % 4;
    else if (t === 'L') N.h = (N.h + 3) % 4;
    else if (t === 'U') N.h = (N.h + 2) % 4;
    else if (t === 'P') { const k = N.pos.indexOf(front); if (N.cam >= 0 || k < 0) return null; N.pos[k] = -1; N.cam = k; }
    else if (t === 'D') { if (N.cam < 0 || chan(fx, fy) || N.pos.includes(front)) return null; N.pos[N.cam] = front; N.cam = -1; }
    return N;
  }
  // đồ thị trạng thái với tới được (bỏ trạng thái đã thắng: thắng là dừng)
  const dau = { x: bd.x, y: bd.y, h: bd.huong || 0, cam: -1, pos: S.vat.map((v) => v.y * S.rong + v.x) };
  const nut = new Map([[khoa(dau), dau]]), canh = new Map(), cho = [dau];
  while (cho.length) {
    const st = cho.pop(), k = khoa(st), ds = [];
    canh.set(k, ds);
    if (xong(st)) continue;
    for (const t of HD) {
      const N = buoc(st, t);
      if (!N) continue;
      const kn = khoa(N);
      ds.push([t, kn, t === "D" && xong(N) ? 1 : GIA[t]]);   // thả vật mà thắng: dừng ngay sau nhịp đầu của drop()
      if (!nut.has(kn)) { nut.set(kn, N); cho.push(N); }
    }
  }
  // khoảng cách còn lại tới đích (Dijkstra ngược)
  const nguoc = new Map();
  for (const [k, ds] of canh) for (const [, kn, g] of ds) { if (!nguoc.has(kn)) nguoc.set(kn, []); nguoc.get(kn).push([g, k]); }
  const con = new Map();
  let hang = [...nut.keys()].filter((k) => xong(nut.get(k))).map((k) => [0, k]);
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
    if (xong(nut.get(k))) { kq.push(chuoi); return; }
    for (const [t, kn, g] of canh.get(k)) {
      const c2 = c + g;
      if (!con.has(kn) || c2 + con.get(kn) > gioiHan) continue;
      di(kn, c2, chuoi + t);
    }
  })(khoa(dau), 0, '');
  return kq;
}

/* ------------------------------------------------------------------ 2. nén dãy thành chương trình ít dòng */
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
const THAM_SO = {
  forward: (s) => /^M+$/.test(s) && ['forward(' + s.length + ')'],
  right: (s) => /^R+$/.test(s) && ['right(' + s.length + ')'],
  deliver: (s) => { const x = s.match(/^P(M+)D$/); return x && ['deliver(' + x[1].length + ')']; },
  step: (s) => { const x = s.match(/^(M+)R(M+)L$/); return x && ['step(' + x[1].length + ', ' + x[2].length + ')']; }
};
export function nenDay(day, khoHam, bo = new Set(), them = []) {
  const bang = new Map(khoHam.map((h) => [h.ten, h]));
  const mau = them.slice();   // [tên, dãy] hàm không tham số mở được (them: hàm tự đặt thêm, xét trước)
  for (const h of khoHam) if (!bo.has(h.ten)) { const e = moHam(h.ten, bang); if (e) mau.push([h.ten, e]); }
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
  // T[i]: phủ day[i..n) và được để khúc CUỐI là `while True:` lặp tuần hoàn (thắng thì dừng giữa chừng)
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

/* ------------------------------------------------------------------ 3. lời né distance() rẻ nhất */
/** Khúc lặp lại (≥ 2 lần, không chồng nhau, dài ≥ 2) của dãy: ứng viên cho MỘT hàm tự đặt thêm (tên f) để gọi nhiều chỗ. */
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
/** cham(dong, hamMoi) → kết quả cham.js của chương trình chính `dong` với hàm của em mới `hamMoi`. tran: số dãy tối đa; tranF: số dãy được thử thêm hàm tự đặt. */
export function timLoiNe(m, khoHam, cham, tran = 3000, tranF = 60) {
  const ds = dsDay(m, m.sao.nhip, tran);
  let tot = null;
  const da = new Map();
  ds.forEach((day, so) => {
    const thu = [[]];
    if (so < tranF) for (const k of khucLap(day)) thu.push([['f', k]]);
    for (const them of thu) {
      const hamMoi = them.length ? [{ ten: 'f', thamSo: [], than: nenDay(them[0][1], khoHam).dong }] : [];
      let bo = new Set(), tim = nenDay(day, khoHam, bo, them), r = chay(tim.dong, hamMoi);
      for (let doi = true; doi;) {          // bỏ bớt hàm của em (khỏi tính thân hàm) nếu rẻ hơn
        doi = false;
        for (const t of tim.dung) {
          if (NGUYEN_TU[t] || t === 'f') continue;
          const bo2 = new Set([...bo, t]), t2 = nenDay(day, khoHam, bo2, them), r2 = chay(t2.dong, hamMoi);
          if (r2 && (!r || r2.soO < r.soO)) { bo = bo2; tim = t2; r = r2; doi = true; break; }
        }
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

/* ------------------------------------------------------------------ 4. màn khóa chương trình chính (chinhCoDinh): chỉ sửa thân MỘT hàm */
/** Mở chương trình chính khóa thành dãy mẫu: nguyên tử, 'X' ở mỗi lời gọi hàm được sửa (tenX, đối số bỏ qua), hàm của em khác mở ra dãy cố định. null nếu không mở được. */
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
      else if (g[1] === 'right' && /^\d+$/.test(so)) kq = kq.concat('R'.repeat(+so).split(''));
      else return null;
    }
    return kq;
  }
  return khoi(dong, 0);
}
/** Lời né distance() rẻ nhất ở màn khóa chương trình chính: thân hàm tenX là một dãy hành động CỐ ĐỊNH (mọi lời gọi chạy như nhau, đối số bị bỏ qua).
 *  chamThan(than) → kết quả cham.js khi thân hàm tenX = than. Trả về { soO, soNhip, than, day } hay null. */
export function timLoiNeKhoa(m, tenX, khoHam, chamThan, tran = 3000) {
  const mau = moMau(m.loiGiai.chinh, tenX, khoHam);
  if (!mau) throw new Error(m.ma + ': không mở được chương trình chính khóa thành dãy mẫu');
  const i0 = mau.indexOf('X');
  let tot = null;
  const da = new Set();
  for (const day of dsDay(m, m.sao.nhip, tran)) {
    if (i0 < 0 || mau.slice(0, i0).join('') !== day.slice(0, i0)) continue;
    for (let L = 0; i0 + L <= day.length; L++) {
      const x = day.slice(i0, i0 + L), mo = mau.map((t) => (t === 'X' ? x : t)).join('');
      if (!mo.startsWith(day) || da.has(x)) continue;
      da.add(x);
      const than = x ? nenDay(x, khoHam).dong : ['pass'];
      const r = chamThan(than);
      if (r.thang && (!tot || r.soO < tot.soO)) tot = { soO: r.soO, soNhip: r.soNhip, than, day };
    }
  }
  return tot;
}
