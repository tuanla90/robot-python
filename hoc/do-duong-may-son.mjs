/* ============================================================================
   do-duong-may-son.mjs — bộ dò ĐƯỜNG TẮT cho máy sơn (chương may-son, che-may-son; mục tiêu 'to-hinh').
   BFS trên trạng thái (ô, hướng, đầu sơn hạ / nhấc, tập ô hình đã tô ĐÚNG màu). Mỗi nhịp xe hai bánh chọn: lệnh đầu sơn (không / dot / pen_down / pen_up) với một màu c1,
   một kiểu đi (đứng, tiến, lùi, quay phải, quay trái, quay đầu), và màu c2 cho nét cuối nhịp (ink() đổi màu không tốn nhịp nên màu không phải là trạng thái). Tô ra ngoài hình = cắt nhánh.
   Ô tô sai màu coi như chưa tô (tô lại được). Hình quá 16 ô hay trạng thái quá nhiều thì trả sao.nhip của màn (khongDoBFS), như các bộ dò khác.
   nhipMaySonNganNhat(cfg) → số nhịp ngắn nhất hay null; nhipMaySonTatCa(m) → nhịp của màn (nhiều sân: lớn nhất hay tổng theo nhipTheo).
   ========================================================================== */
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const SanHoc = require('./san-hoc.js');

const VEC = [[0, -1], [1, 0], [0, 1], [-1, 0]];
const KY = { r: 'red', g: 'green', b: 'blue', y: 'yellow' };
const TRAN = 3000000;

export function nhipMaySonNganNhat(cfg, gioiHan = 120) {
  const san = SanHoc.docSan(cfg.san), rows = cfg.san, H = rows.length, W = rows[0].length;
  const chiSo = new Map(), canMau = [];
  cfg.hinh.forEach((hang, y) => [...hang].forEach((c, x) => { if (KY[c]) { chiSo.set(x + ',' + y, canMau.length); canMau.push(KY[c]); } }));
  const n = canMau.length; if (n > 16) return null;
  const DU = (1 << n) - 1, mauDung = [...new Set(canMau)];
  const di = (x, y) => !SanHoc.lyDoChan(san, 'banh', x, y);
  function to(x, y, mau, mask) {                      // → mask mới, hay -1 nếu tô ra ngoài hình
    const i = chiSo.get(x + ',' + y);
    if (i === undefined) return -1;
    return canMau[i] === mau ? (mask | (1 << i)) : (mask & ~(1 << i));
  }
  const bd = cfg.batDau, khoa = (x, y, h, p, m) => (((m * W + x) * H + y) * 4 + h) * 2 + p;
  let tang = [[bd.x, bd.y, bd.huong || 0, 0, 0]];
  const da = new Set([khoa(bd.x, bd.y, bd.huong || 0, 0, 0)]);
  for (let nhip = 1; nhip <= gioiHan; nhip++) {
    const moi = [];
    for (const [x, y, h, p, m] of tang) {
      for (const lenh of ['', 'dot', 'down', 'up']) for (const c1 of (lenh === 'dot' || lenh === 'down' ? mauDung : [null])) {
        let p1 = p, m1 = m;
        if (lenh === 'up') p1 = 0;
        if (lenh === 'dot' || lenh === 'down') { m1 = to(x, y, c1, m1); if (m1 < 0) continue; if (lenh === 'down') p1 = 1; }
        for (const kieu of ['dung', 'tien', 'lui', 'phai', 'trai', 'dau']) {
          let nx = x, ny = y, nh = h;
          if (kieu === 'tien' || kieu === 'lui') { const v = VEC[kieu === 'tien' ? h : (h + 2) % 4]; if (di(x + v[0], y + v[1])) { nx = x + v[0]; ny = y + v[1]; } }
          else if (kieu === 'phai') nh = (h + 1) % 4; else if (kieu === 'trai') nh = (h + 3) % 4; else if (kieu === 'dau') nh = (h + 2) % 4;
          for (const c2 of (p1 ? mauDung : [null])) {
            const m2 = p1 ? to(nx, ny, c2, m1) : m1;
            if (m2 < 0) continue;
            if (m2 === DU) return nhip;
            const k = khoa(nx, ny, nh, p1, m2);
            if (da.has(k)) continue;
            da.add(k); moi.push([nx, ny, nh, p1, m2]);
            if (da.size > TRAN) return null;
          }
        }
      }
    }
    if (!moi.length) return null;
    tang = moi;
  }
  return null;
}

/** Nhịp ngắn nhất của màn m (một hay nhiều sân); màn khai khongDoBFS, hay BFS không chạy nổi, thì lấy sao.nhip. */
export function nhipMaySonTatCa(m) {
  if (m.khongDoBFS) return m.sao.nhip;
  const nhieu = Array.isArray(m.san[0]), dsSan = nhieu ? m.san : [m.san], kq = [];
  for (let i = 0; i < dsSan.length; i++) {
    const r = nhipMaySonNganNhat({ san: dsSan[i], hinh: nhieu ? m.hinh[i] : m.hinh, batDau: Array.isArray(m.batDau) ? m.batDau[i] : m.batDau }, m.sao.nhip + 2);
    if (r === null) return m.sao.nhip;
    kq.push(r);
  }
  return m.nhipTheo === 'tong' ? kq.reduce((a, b) => a + b, 0) : Math.max(...kq);
}
