/* ============================================================================
   do-duong-do-nhiet.mjs — BỘ DÒ "LỜI NÉ warm()" cho gói 7 mùa 2 "Đo nhiệt" (man-do-nhiet.js: chương do-nhiet, che-do-nhiet). Dùng trong kiem-do-nhiet.mjs; không nằm trong game.

   Xe HAI BÁNH gắn súng hơi + mắt hồng ngoại, màn lucBan. Bộ dò của gói 6 (do-duong-che-luc-ban.mjs, mô phỏng một nhịp của do-duong-sung-hoi.mjs) dùng lại NGUYÊN VẸN:
   một chương trình KHÔNG đọc cảm biến chạy ra MỘT DÃY CỐ ĐỊNH, nên "né warm()" = có một dãy cố định thắng trong ngưỡng.
   Vì sao bỏ qua được cfg.nutBat (nút bật sẵn) khi mô phỏng: lõi CẤM nút bật sẵn nối cửa / băng chuyền (san-hoc.js, mục SÚNG BÓNG), nên trạng thái bật / tắt của nút
   bật sẵn không đổi được gì trên sân (bóng vẫn dừng ở nút như mọi nút); nó chỉ đổi kết quả warm(), mà dãy cố định thì không đọc warm(). kiemDocLap() kiểm lại điều đó
   cho từng sân (nút bật sẵn không nằm trong nhóm noi nào có cửa / băng; sân có cửa / băng thì phải khai noi), để bộ dò không âm thầm sai nếu luật lõi đổi.
   Màn nhiều sân: catSan(m, i) cắt mọi lớp theo sân (san, batDau, noi, nutBat, bongMo…) như lopMauCuaSan, để chỗ nào truyền màn một sân vào SanHoc cũng không vấp nutBat chưa cắt.

   Màn mở (chương do-nhiet) dùng timLoiNeNhanh (ô tính tĩnh, chỉ chấm thật các ứng viên rẻ nhất) vì timLoiNe chấm mọi cách nén của mọi dãy: quá chậm cho màn mở.

   Màn khóa mà chương trình chính có go_to_wall() (không mở thành dãy được) dùng timThanCoDinh: mô phỏng mọi dãy thân cố định đủ ngắn cho sao.nhip.

   Hàm xuất: catSan, kiemDocLap, timLoiNeNhanh, timThanCoDinh, và lại của do-duong-che-luc-ban.mjs: dsDay, doDuongChung, moRong, nenDay, timLoiNe, timLoiNeKhoa
   ========================================================================== */
import { createRequire } from 'node:module';
import { CHU, dsDay, doDuongChung, moRong, nenDay, timLoiNe, timLoiNeKhoa } from './do-duong-che-luc-ban.mjs';
import * as Bo from './do-duong-sung-hoi.mjs';

const require = createRequire(import.meta.url);
const SanHoc = require('./san-hoc.js');

export { dsDay, doDuongChung, moRong, nenDay, timLoiNe, timLoiNeKhoa };

/** Màn một sân thứ i (màn một sân: trả bản sao nông, nutBat giữ nguyên). */
export function catSan(m, i) {
  if (!Array.isArray(m.san[0])) return Object.assign({}, m);
  const lm = SanHoc.lopMauCuaSan(m, i);
  const con = Object.assign({}, m, { san: m.san[i], batDau: Array.isArray(m.batDau) ? m.batDau[i] : m.batDau });
  for (const k of ['mau', 'vatMau', 'vatChat', 'cuaNhip', 'noi', 'nutBat', 'lua', 'bongMo']) {
    const v = lm[k] || (Array.isArray(m[k]) ? null : m[k]);         // lớp song song với san thì cắt; một giá trị chung (bongMo một object) thì giữ
    if (v !== undefined && v !== null) con[k] = v; else delete con[k];
  }
  return con;
}

/** Trạng thái nút bật sẵn không đổi được động học của sân (chỉ đổi warm()). Trả '' nếu đúng, chuỗi lỗi nếu sai. */
export function kiemDocLap(m) {
  const n = Array.isArray(m.san[0]) ? m.san.length : 1;
  for (let i = 0; i < n; i++) {
    const con = catSan(m, i);
    const san = SanHoc.docSan(con.san, null, null, null);
    const nb = con.nutBat || [];
    const coNoiThu = san.cua.length || Object.keys(SanHoc.BANG).some((k) => con.san.join('').includes(k));
    if (nb.length && coNoiThu && !con.noi) return 'sân ' + (i + 1) + ': có cửa / băng mà không khai noi (nút bật sẵn sẽ nối mọi thứ)';
    for (const o of nb) {
      if (!san.nut.some((q) => q.x === o.x && q.y === o.y)) return 'sân ' + (i + 1) + ': nutBat (' + o.x + ', ' + o.y + ') không phải nút N';
      const g = (con.noi || []).find((q) => q.nut.x === o.x && q.nut.y === o.y);
      if (g && ((g.cua || []).length || (g.bang || []).length)) return 'sân ' + (i + 1) + ': nút bật sẵn (' + o.x + ', ' + o.y + ') có nối cửa / băng';
    }
    try { SanHoc.chay(Object.assign({}, con, { hamGoc: ['wait'], lucBan: false }), 'wait()\n'); } catch (e) { return 'sân ' + (i + 1) + ': lõi báo lỗi cấu hình: ' + e.message; }
  }
  return '';
}

/* ------------------------------------------------------------------ lời cố định rẻ nhất, bản NHANH cho màn mở (chương do-nhiet)
   timLoiNe của gói 6 chấm thật bằng cham.js MỌI cách nén của MỌI dãy thắng: màn mở có hàng nghìn dãy nên quá chậm. Ở đây số ô được tính TĨNH (dòng chương trình
   + thân hàm phụ + thân mọi hàm của em được gọi tới, bắc cầu, mỗi hàm một lần: đúng cách cham.js đếm khi mọi hàm gọi tới đều chạy), các ứng viên xếp theo ô tăng dần,
   rồi chấm thật bằng cham.js từ rẻ nhất cho tới khi gặp một lời thắng. Viên gạch nén như nenDay (lệnh gốc, hàm của em mở được với tham số số / lực, for, while True cuối),
   thêm MỘT hàm phụ f() cho một khúc lặp lại. */
const RAW = {
  M: ['left_move()', 'right_move()', 'wait()'], B: ['left_back()', 'right_back()', 'wait()'], R: ['left_move()', 'wait()'], L: ['right_move()', 'wait()'],
  U: ['left_move()', 'right_back()', 'wait()'], W: ['wait()'],
  f: ['spray("low")', 'wait()'], c: ['spray("high")', 'wait()'], g: ['spray_back("low")', 'wait()'], h: ['spray_back("high")', 'wait()']
};
const GIA_TRI = [1, 2, 3, 4, 5, 6, 7, 8, 'low', 'high'];
function taoGach(kho) {
  const kq = Object.entries(RAW).map(([a, dong]) => ({ dong, e: a, ten: null }));
  for (const h of kho) {
    if (h.thamSo.length > 1) continue;
    const ds = h.thamSo.length ? GIA_TRI.map((v) => ({ [h.thamSo[0]]: v })) : [{}];
    const da = new Set();
    for (const env of ds) {
      const e = moRong(h.than, kho, env);
      if (!e || da.has(e)) continue;
      da.add(e);
      const v = h.thamSo.length ? env[h.thamSo[0]] : null;
      kq.push({ dong: [h.ten + '(' + (v === null ? '' : typeof v === 'string' ? '"' + v + '"' : v) + ')'], e, ten: h.ten });
    }
  }
  return kq;
}
/** Nén một dãy thành ít dòng nhất với bộ gạch G (mỗi dãy con chọn gạch ít dòng nhất; for; while True ở khúc cuối). */
function nen(day, G) {
  const n = day.length, C = [], B = [];
  for (let i = 0; i <= n; i++) { C.push(new Array(n + 1).fill(Infinity)); B.push(new Array(n + 1).fill(null)); }
  const theoE = new Map();
  for (const g of G) if (!theoE.has(g.e) || theoE.get(g.e).dong.length > g.dong.length) theoE.set(g.e, g);
  for (let len = 1; len <= n; len++) for (let i = 0; i + len <= n; i++) {
    const j = i + len, s = day.slice(i, j);
    let tot = Infinity, cach = null;
    const g = theoE.get(s);
    if (g) { tot = g.dong.length; cach = { g }; }
    for (let k = i + 1; k < j; k++) if (C[i][k] + C[k][j] < tot) { tot = C[i][k] + C[k][j]; cach = { tach: k }; }
    for (let p = 1; p * 2 <= len; p++) if (len % p === 0 && s === s.slice(0, p).repeat(len / p) && 1 + C[i][i + p] < tot) { tot = 1 + C[i][i + p]; cach = { lap: len / p, p }; }
    C[i][j] = tot; B[i][j] = cach;
  }
  function viet(i, j, th) {
    const c = B[i][j];
    if (c.g) return c.g.dong.map((l) => th + l);
    if (c.tach) return viet(i, c.tach, th).concat(viet(c.tach, j, th));
    return [th + 'for i in range(' + c.lap + '):'].concat(viet(i, i + c.p, th + '    '));
  }
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
  return dong;
}
/** Số ô tĩnh: dòng + thân hàm phụ (nếu gọi) + thân hàm của em được gọi tới (bắc cầu, mỗi hàm một lần). */
function oTinh(dong, phu, bangKho) {
  let o = dong.length;
  const da = new Set(), cho = [];
  const goi = (ds) => { for (const l of ds) for (const x of l.matchAll(/([A-Za-z_]\w*)\(/g)) cho.push(x[1]); };
  goi(dong);
  while (cho.length) {
    const t = cho.pop();
    if (da.has(t)) continue;
    da.add(t);
    const h = phu && t === phu.ten ? phu : bangKho.get(t);
    if (!h) continue;
    o += h.than.length; goi(h.than);
  }
  return o;
}
/**
 * Màn mở một sân: lời cố định (không cảm biến) rẻ nhất theo ô, thắng trong sao.nhip. cham(dong, hamMoi) → kết quả cham.js.
 * Trả { soO, soNhip, chinh, hamMoi, day, soDay, catNgang, soCham } hay { khong: true, soDay, catNgang, soCham }.
 * tuy.tran: số dãy thắng tối đa liệt kê (mặc định 20000; vượt thì catNgang); tuy.tranF: số dãy thử hàm phụ (mặc định 300); tuy.nguong: bỏ ứng viên tĩnh > nguong ô.
 */
export function timLoiNeNhanh(m, kho, cham, tuy = {}) {
  const { ds, catNgang } = dsDay(m, m.sao.nhip, { tran: tuy.tran || 20000 });
  const bangKho = new Map(kho.map((h) => [h.ten, h]));
  const G0 = taoGach(kho), G1 = taoGach([]);
  const ung = [], da = new Set();
  function them(dong, phu, day) {
    const k = dong.join('\n') + '|' + (phu ? phu.than.join('/') : '');
    if (da.has(k)) return;
    da.add(k);
    ung.push({ o: oTinh(dong, phu, bangKho), dong, phu, day });
  }
  for (const day of ds) { them(nen(day, G0), null, day); them(nen(day, G1), null, day); }
  const tot = [...ung].sort((a, b) => a.o - b.o), xet = new Set();
  for (const u of tot) {                                       // hàm phụ f() cho một khúc lặp lại, thử trên các dãy nén rẻ nhất
    if (xet.size >= (tuy.tranF || 300)) break;
    if (xet.has(u.day)) continue;
    xet.add(u.day);
    const day = u.day, khuc = new Set();
    for (let len = 2; len * 2 <= day.length && len <= 10; len++) for (let i = 0; i + len <= day.length; i++) { const k = day.slice(i, i + len); if (day.indexOf(k, i + len) >= 0) khuc.add(k); }
    for (const k of khuc) them(nen(day, G0.concat([{ dong: ['f()'], e: k, ten: 'f' }])), { ten: 'f', thamSo: [], than: nen(k, G0) }, day);
  }
  ung.sort((a, b) => a.o - b.o);
  let soCham = 0, catCham = false;
  for (const u of ung) {
    if (tuy.nguong !== undefined && u.o > tuy.nguong) break;
    if (++soCham > (tuy.toiDaCham || 400)) { catCham = true; break; }
    const hm = u.phu && u.dong.some((l) => /\bf\(/.test(l)) ? [u.phu] : [];
    const r = cham(u.dong, hm);
    if (r.thang && r.soNhip <= m.sao.nhip) return { soO: r.soO, soNhip: r.soNhip, chinh: u.dong, hamMoi: hm, day: u.day, soDay: ds.length, catNgang, soCham, oTinh: u.o };
  }
  return { khong: true, soDay: ds.length, catNgang, catCham, soCham, oNhoNhat: ung.length ? ung[0].o : null };
}

/* ------------------------------------------------------------------ màn khóa mà chương trình chính KHÔNG mở thành dãy được (có go_to_wall(): while theo distance())
   timLoiNeKhoa cần mở chương trình chính thành một dãy cố định nên không dùng được. Một thân X cố định (không if / while / cảm biến) chạy ra MỘT dãy hành động x
   ở mọi lần gọi; go_to_wall() thì mô phỏng thẳng (tiến tới khi ô trước mặt bị chặn: tường, nút, cửa đóng, thùng). Ở đây liệt kê MỌI dãy x (10 hành động một nhịp)
   đủ ngắn để cả chương trình còn trong sao.nhip, mô phỏng bằng bộ dò súng hơi (do-duong-sung-hoi.mjs, luật san-hoc.js), giữ dãy thắng, nén thành thân ít dòng nhất
   (như timLoiNeNhanh) và chấm thật bằng cham.js những thân có ô tĩnh ≤ sao.o. Trả thân rẻ nhất được 3 sao hay { khong: true, soDay, soThang }. Liệt kê ĐỦ (không cắt). */
function moChinh(dong, kho, tenX) {
  // chương trình chính khóa: lời gọi hàm, for số cố định; go_to_wall() thành 'G', X thành 'X', hàm khác mở bằng moRong
  const ds = dong.map((l) => l.replace(/#.*$/, '')).filter((l) => l.trim());
  const thut = (l) => l.match(/^ */)[0].length;
  function khoi(a, b) {
    let kq = '';
    for (let i = a; i < b; i++) {
      const t = ds[i].trim(), f = t.match(/^for\s+\w+\s+in\s+range\((\d+)\):$/);
      if (f) { let j = i + 1; while (j < b && thut(ds[j]) > thut(ds[i])) j++; const k = khoi(i + 1, j); if (k === null) return null; kq += k.repeat(+f[1]); i = j - 1; continue; }
      if (t === 'go_to_wall()') { kq += 'G'; continue; }
      if (t === tenX + '()') { kq += 'X'; continue; }
      const e = moRong([t], kho);
      if (e === null) return null;
      kq += e;
    }
    return kq;
  }
  return khoi(0, ds.length);
}
export function timThanCoDinh(m, tenX, kho, chamThan, tuy = {}) {
  if (Array.isArray(m.san[0])) throw new Error(m.ma + ': timThanCoDinh chỉ cho một sân');
  const mau = moChinh(m.maMau.chinh, kho, tenX);
  if (mau === null) throw new Error(m.ma + ': không mở được chương trình chính khóa');
  const ctx = Bo.dungNguCanh(m), HD = new Map(Bo.hanhDongChoPhep(m).map((a) => [CHU(a), a]));
  const dau = Bo.trangThaiDau(ctx), { rong } = ctx, VEC = SanHoc.VEC;
  const dung = ctx.mucTieu !== 'bong-mo';
  const truocTrong = (S) => {
    const v = VEC[S.h], x = S.x + v[0], y = S.y + v[1];
    if (!ctx.trongSan(x, y)) return false;
    const c = y * rong + x, j = ctx.cuaIdx[c];
    return !ctx.chan[c] && !(j >= 0 && !((S.cm >> j) & 1)) && S.p.indexOf(c) < 0;
  };
  function chay(x) {
    let S = dau, nhip = 0;
    for (const ch of mau) {
      const ds = ch === 'X' ? x : ch === 'G' ? null : ch;
      if (ds === null) {
        let an = 0;
        while (truocTrong(S)) { S = Bo.buocMotNhip(ctx, S, HD.get('M')); nhip++; if (S.chet || nhip > m.sao.nhip || ++an > 40) return false; if (dung && Bo.laDich(ctx, S)) return nhip; }
        continue;
      }
      for (const a of ds) {
        const hd = HD.get(a);
        if (!hd) return false;
        S = Bo.buocMotNhip(ctx, S, hd); nhip++;
        if (S.chet || nhip > m.sao.nhip) return false;
        if (dung && Bo.laDich(ctx, S)) return nhip;
      }
    }
    return !dung && Bo.laDich(ctx, S) ? nhip : false;
  }
  const soX = mau.split('X').length - 1, coDinh = mau.replace(/[XG]/g, '').length;
  const dai = Math.min(tuy.daiToiDa || 6, Math.floor((m.sao.nhip - coDinh) / soX));
  const chu = [...HD.keys()], thang = [];
  let soDay = 0;
  (function di(x) {
    soDay++;
    if (chay(x) !== false) thang.push(x);
    if (x.length >= dai) return;
    for (const c of chu) di(x + c);
  })('');
  // ô tĩnh: chương trình chính + các hàm nó gọi (trừ X) + thân X nén + hàm thân X gọi mà chưa tính
  const bangKho = new Map(kho.map((h) => [h.ten, h])), G0 = taoGach(kho);
  const ung = thang.map((x) => {
    const than = x ? nen(x, G0) : ['pass'];
    return { than, o: oTinh(m.maMau.chinh, { ten: tenX, thamSo: [], than }, bangKho) };
  }).sort((a, b) => a.o - b.o);
  let tot = null, soCham = 0;
  for (const u of ung) {
    if (u.o > m.sao.o) break;
    soCham++;
    const r = chamThan(u.than);
    if (r.thang && r.sao === 3) { tot = { soO: r.soO, soNhip: r.soNhip, than: u.than }; break; }
  }
  return tot ? Object.assign(tot, { soDay, soThang: thang.length, dai, soCham }) : { khong: true, soDay, soThang: thang.length, dai, soCham, oNhoNhat: ung.length ? ung[0].o : null };
}
