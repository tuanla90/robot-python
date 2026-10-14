/* ============================================================================
   huy-hieu.js — "Đường học": HUY HIỆU CỦA TỪNG CHƯƠNG (window.HuyHieu).
   Một huy hiệu tròn 36×36 pixel: vành kim loại + đĩa nền sáng + hình part / cơ chế của chương (vẽ bằng code, dùng Part và Ve sẵn có).
     HuyHieu.ve(ma, tt) → canvas 36×36.   ma = mã huy hiệu (man.huyHieu.ma = mã chương), tt = 'khoa' | 'mo' | 'xong'
     khoa = xám + ổ khóa · mo = đủ màu, vành thép · xong = vành vàng + sao.
   Ve.hydrate() gọi qua [data-i="huyhieu"] (data-ma, data-tt).
   ========================================================================== */
(function () {
  'use strict';

  var INK = '#1b120a', N = 36, TAM = 18, BK = 13.4;
  var cache = {};

  function P(w, h) { return new Ve.Painter(w, h); }

  /* ----------------------------------------------------------- tiện ích vẽ */
  /** chép src (Painter bất kỳ, hoặc canvas) vào dst tại (ox, oy), phóng nguyên lần k. */
  function chep(dst, src, ox, oy, k) {
    k = k || 1;
    if (src.getContext) src = tuCanvas(src);
    for (var y = 0; y < src.h; y++) for (var x = 0; x < src.w; x++) {
      var c = src.get(x, y); if (!c) continue;
      for (var j = 0; j < k; j++) for (var i = 0; i < k; i++) dst.px(ox + x * k + i, oy + y * k + j, c);
    }
    return dst;
  }
  function tuCanvas(cv) {
    var p = P(cv.width, cv.height), d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
    for (var i = 0; i < cv.width * cv.height; i++) {
      if (d[i * 4 + 3] < 128) continue;
      p.buf[i] = '#' + ((1 << 24) | (d[i * 4] << 16) | (d[i * 4 + 1] << 8) | d[i * 4 + 2]).toString(16).slice(1);
    }
    return p;
  }
  /** cắt sát phần có pixel. */
  function cat(p) {
    var x0 = p.w, y0 = p.h, x1 = -1, y1 = -1, x, y;
    for (y = 0; y < p.h; y++) for (x = 0; x < p.w; x++) if (p.get(x, y)) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (x1 < 0) return p;
    var q = P(x1 - x0 + 1, y1 - y0 + 1);
    for (y = y0; y <= y1; y++) for (x = x0; x <= x1; x++) q.px(x - x0, y - y0, p.get(x, y));
    return q;
  }
  function partTho(loai, ma, s) { return Part._veMot(Part.lay(loai, ma), s || {}); }
  function thanPart(ma) { return cat(partTho('than', ma)); }

  /** tam giác đặc (toạ độ nguyên / lẻ), tô bằng c */
  function tamGiac(p, a, b, c, mau) {
    var minx = Math.floor(Math.min(a[0], b[0], c[0])), maxx = Math.ceil(Math.max(a[0], b[0], c[0]));
    var miny = Math.floor(Math.min(a[1], b[1], c[1])), maxy = Math.ceil(Math.max(a[1], b[1], c[1]));
    function s(p1, p2, p3) { return (p1[0] - p3[0]) * (p2[1] - p3[1]) - (p2[0] - p3[0]) * (p1[1] - p3[1]); }
    for (var y = miny; y <= maxy; y++) for (var x = minx; x <= maxx; x++) {
      var q = [x + 0.5, y + 0.5], d1 = s(q, a, b), d2 = s(q, b, c), d3 = s(q, c, a);
      var neg = d1 < 0 || d2 < 0 || d3 < 0, pos = d1 > 0 || d2 > 0 || d3 > 0;
      if (!(neg && pos)) p.px(x, y, mau);
    }
  }
  function veBloc(p, x, y, w, h, c, hi, lo) {
    p.rect(x, y, w, h, INK); p.rect(x + 1, y + 1, w - 2, h - 2, c);
    p.rect(x + 1, y + 1, w - 2, 1, hi); p.rect(x + 1, y + 1, 1, h - 2, hi); p.rect(x + 1, y + h - 2, w - 2, 1, lo); p.rect(x + w - 2, y + 1, 1, h - 2, lo);
    return p;
  }
  var CHU = {
    d: ['..X', '..X', 'XXX', 'X.X', 'XXX'], e: ['XXX', 'X.X', 'XXX', 'X..', 'XXX'], f: ['.XX', 'X..', 'XXX', 'X..', 'X..'],
    '(': ['..XX', '.XX.', 'XX..', 'XX..', 'XX..', 'XX..', 'XX..', 'XX..', '.XX.', '..XX'], ')': ['XX..', '.XX.', '..XX', '..XX', '..XX', '..XX', '..XX', '..XX', '.XX.', 'XX..'], n: ['...', 'XXX', 'X.X', 'X.X', 'X.X']
  };
  function chu(p, s, x, y, c, k) {
    k = k || 1;
    var rows = CHU[s];
    for (var j = 0; j < rows.length; j++) for (var i = 0; i < rows[j].length; i++) if (rows[j].charAt(i) === 'X') p.rect(x + i * k, y + j * k, k, k, c);
    return rows[0].length * k;
  }

  /* ------------------------------------------------------------- hình của chương */
  var HINH = {};
  HINH['hai-banh'] = function () { return thanPart('hai-banh'); };
  HINH['xich'] = function () { return thanPart('xich'); };
  HINH['nhen'] = function () { return thanPart('nhen'); };
  HINH['omni'] = function () { return thanPart('omni'); };
  HINH['drone'] = function () { return thanPart('drone'); };

  HINH['xuong-ham'] = function () {                             // khối "def" của Xưởng hàm
    var p = P(22, 15);
    veBloc(p, 0, 0, 22, 15, '#7a4fd0', '#a98af0', '#4a2a92');
    var x = 4; x += chu(p, 'd', x, 2, '#ffffff') + 1; x += chu(p, 'e', x, 2, '#ffffff') + 1; chu(p, 'f', x, 2, '#ffffff');
    p.rect(5, 9, 9, 2, '#c9b6ff'); p.rect(5, 12, 6, 1, '#c9b6ff');
    return p;
  };
  HINH['tham-so'] = function () {                               // ( n )
    var p = P(24, 15);
    veBloc(p, 0, 0, 24, 15, '#1f7a8c', '#5cc4d6', '#0f4654');
    chu(p, '(', 3, 2, '#ffe45c', 1); chu(p, 'n', 9, 4, '#ffffff', 2); chu(p, ')', 17, 2, '#ffe45c', 1);
    return p;
  };
  HINH['tay-gap'] = function () {                               // càng kẹp ôm thùng
    return cat(partTho('tay', 'kep', { kep: 'dong', cam: true, vat: 'go' }));
  };
  HINH['tam-day'] = function () {                               // tấm đẩy + thùng nặng
    var p = P(24, 24);
    chep(p, partTho('tay', 'day', {}), 0, 3, 1);
    Part.veVatNho(p, 7, 1, 10, 'sat');
    return cat(p);
  };
  HINH['nam-cham'] = function () {                              // nam châm + vật sắt
    var p = P(24, 24);
    chep(p, partTho('tay', 'nam-cham', { bat: true }), 0, 0, 1);
    Part.veVatNho(p, 8, 0, 8, 'sat');
    return cat(p);
  };
  HINH['may-nem'] = function () {                               // máy ném + vật bay vòng cung
    var p = P(30, 24), m = cat(partTho('tay', 'nem', { dangNem: true, cam: true }));
    chep(p, m, 0, 24 - m.h, 1);
    var pts = [[10, 5], [13, 2], [17, 1], [21, 2], [24, 5]];
    pts.forEach(function (q) { p.rect(q[0] - 1, q[1] - 1, 4, 4, INK); p.rect(q[0], q[1], 2, 2, '#ffd23f'); });
    Part.veVatNho(p, 21, 12, 8, 'go');
    p.rect(21, 20, 8, 1, '#3f9a48'); p.rect(22, 21, 6, 1, '#2c7436');
    return cat(p);
  };
  HINH['sung-bong'] = function () {                             // nút + bóng
    var p = P(28, 24);
    chep(p, Ve.makeNut(true, 0), 0, 10, 1);
    var bx = 17, by = 1;
    p.ell(bx + 4, by + 4, 4.5, 4.5, INK); p.ell(bx + 4, by + 4, 3.5, 3.5, '#ff8a35'); p.rect(bx + 2, by + 2, 2, 2, '#ffe0a0');
    p.rect(bx + 5, by + 5, 2, 2, '#c8501a');
    [[13, 9], [11, 11], [9, 13]].forEach(function (q) { p.rect(q[0], q[1], 2, 2, '#ffd23f'); });
    return cat(p);
  };
  HINH['khoang-cach'] = function () {                           // cảm biến + sóng
    var p = P(30, 24), s = cat(partTho('cam-bien', 'khoang-cach', { ben: 'phai', bat: false }));
    chep(p, s, 0, 12 - s.h, 2);
    var cx = 2 * s.w + 2, cy = 12;
    [5, 9, 13].forEach(function (r) {
      for (var a = -55; a <= 55; a += 2) {
        var x = Math.round(cx + Math.cos(a * Math.PI / 180) * r), y = Math.round(cy + Math.sin(a * Math.PI / 180) * r);
        p.px(x, y, '#1f7f95'); p.px(x + 1, y, '#3fd0e8'); p.px(x, y - 1, '#1f7f95'); 
      }
    });
    return cat(p);
  };
  HINH['mau'] = function () {                                   // bốn ô màu
    var p = P(23, 23), ten = ['red', 'green', 'yellow', 'blue'];
    ten.forEach(function (m, i) {
      var c = Ve.MAU[m], x = (i % 2) * 12, y = Math.floor(i / 2) * 12;
      p.rect(x, y, 11, 11, INK); p.rect(x + 1, y + 1, 9, 9, c.n);
      p.rect(x + 1, y + 1, 9, 1, c.s); p.rect(x + 1, y + 1, 1, 9, c.s); p.rect(x + 1, y + 9, 9, 1, c.t); p.rect(x + 9, y + 1, 1, 9, c.t);
    });
    return p;
  };
  HINH['bang-chuyen'] = function () {                           // băng chuyền + thùng
    var p = P(24, 22);
    p.rect(0, 10, 24, 12, INK);
    p.rect(1, 11, 22, 10, '#4a4a5a');
    for (var x = 2; x < 22; x += 2) p.rect(x, 12, 1, 8, (x & 2) ? '#2e2e3a' : '#5a5a6e');
    p.rect(1, 11, 22, 1, '#8a8a9c'); p.rect(1, 20, 22, 1, '#2e2e3a');
    [[3, 16], [20, 16]].forEach(function (q) { p.ell(q[0], q[1], 3, 3, INK); p.ell(q[0], q[1], 2, 2, '#9aa3b5'); p.px(q[0] - 1, q[1] - 1, '#dbe3ed'); });
    [5, 11, 17].forEach(function (x) { tamGiac(p, [x, 13], [x + 3, 16], [x, 19], '#ffcf30'); });
    Part.veVatNho(p, 7, 1, 10, 'go');
    return p;
  };
  HINH['vong-lap'] = function () {                              // mũi tên vòng
    var p = P(24, 24), cx = 12, cy = 12;
    for (var y = 0; y < 24; y++) for (var x = 0; x < 24; x++) {
      var dx = x + 0.5 - cx, dy = y + 0.5 - cy, r = Math.sqrt(dx * dx + dy * dy), a = Math.atan2(dy, dx) * 180 / Math.PI;
      if (r < 6 || r > 9.4) continue;
      if (a > -80 && a < -25) continue;
      var lit = (-dx - dy) / (r * 1.414) > 0.35;
      p.px(x, y, r > 8.3 ? '#2b5fb8' : lit ? '#8fc0ff' : '#3f7fe0');
    }
    function pos(deg, r) { return [cx + Math.cos(deg * Math.PI / 180) * r, cy + Math.sin(deg * Math.PI / 180) * r]; }
    tamGiac(p, pos(-78, 3.4), pos(-78, 12.2), pos(-50, 7.8), '#3f7fe0');
    p.outline(INK);
    return p;
  };

  /* ---------------------------------------------------------------- vành + đĩa */
  var PAL = {
    khoa: { hi: '#b7bac4', md: '#8b8f9c', lo: '#555966', d1: '#7d818e', d2: '#6a6e7b' },
    mo: { hi: '#f1f6fb', md: '#b3bdcf', lo: '#6a758c', d1: '#d6e8f6', d2: '#b0cde4' },
    xong: { hi: '#fff3b0', md: '#ffcf30', lo: '#c28a0c', d1: '#d6e8f6', d2: '#b0cde4' }
  };
  function xam(c) {
    var n = parseInt(c.slice(1), 16), l = Math.round(0.3 * (n >> 16) + 0.59 * ((n >> 8) & 255) + 0.11 * (n & 255));
    l = Math.round(l * 0.62 + 52); var h = l.toString(16); if (h.length < 2) h = '0' + h;
    return '#' + h + h + h;
  }
  function veSao(p, cx, cy) {                                   // sao vàng 11×11 có viền tối
    var m = ['....XXX....', '....XXX....', '...XXXXX...', 'XXXXXXXXXXX', '.XXXXXXXXX.', '..XXXXXXX..', '..XXXXXXX..', '.XXXX.XXXX.', '.XXX...XXX.', 'XX.......XX'];
    var q = P(13, 12);
    m.forEach(function (row, y) { for (var x = 0; x < row.length; x++) if (row.charAt(x) === 'X') q.px(x + 1, y + 1, '#ffcf30'); });
    q.outline(INK);
    for (var y = 0; y < q.h; y++) for (var x = 0; x < q.w; x++) if (q.get(x, y) === '#ffcf30') { if (y <= 3 || x <= 4) q.px(x, y, '#fff3b0'); else if (y >= 7 || x >= 8) q.px(x, y, '#e5a416'); }
    chep(p, q, cx - 6, cy - 6, 1);
  }
  function veKhoa(p, cx, cy) {                                  // ổ khóa 9×11
    var q = P(11, 13);
    q.rect(2, 0, 7, 7, INK); q.rect(4, 2, 3, 5, null); q.rect(3, 1, 5, 1, '#d0d4de'); q.rect(3, 2, 1, 5, '#d0d4de'); q.rect(7, 2, 1, 5, '#8b8f9c');
    q.rect(0, 5, 11, 8, INK); q.rect(1, 6, 9, 6, '#f0b640'); q.rect(1, 6, 9, 1, '#ffe08a'); q.rect(1, 11, 9, 1, '#b07a1a');
    q.rect(5, 8, 1, 2, INK);
    chep(p, q, cx - 5, cy - 6, 1);
  }

  function ve(ma, tt) {
    tt = tt === 'khoa' || tt === 'xong' ? tt : 'mo';
    var key = ma + '|' + tt; if (cache[key]) return cache[key];
    var pal = PAL[tt], p = P(N, N), x, y;
    for (y = 0; y < N; y++) for (x = 0; x < N; x++) {
      var dx = x + 0.5 - TAM, dy = y + 0.5 - TAM, d = Math.sqrt(dx * dx + dy * dy);
      if (d > 18) continue;
      if (d > 17) { p.px(x, y, INK); continue; }
      if (d > 14.6) {
        var v = (-dx - dy) / (d * 1.414);
        p.px(x, y, v > 0.55 ? pal.hi : v < -0.55 ? pal.lo : pal.md);
      } else if (d > 13.6) p.px(x, y, INK);
      else p.px(x, y, dy > 3 ? pal.d2 : pal.d1);
    }
    // vài đinh tán trên vành
    [[18, 1], [18, 34], [1, 18], [34, 18]].forEach(function (q) { p.px(q[0], q[1], pal.hi); p.px(q[0] + (q[0] > 20 ? 1 : 0), q[1] + (q[1] > 20 ? 1 : 0), INK); });
    // hình của chương
    var f = HINH[ma] ? HINH[ma]() : null;
    if (f) {
      var hh = P(N, N), ox = TAM - (f.w >> 1), oy = TAM - (f.h >> 1);
      chep(hh, f, ox, oy, 1);
      for (y = 0; y < N; y++) for (x = 0; x < N; x++) {
        var c = hh.get(x, y); if (!c) continue;
        var ex = x + 0.5 - TAM, ey = y + 0.5 - TAM; if (ex * ex + ey * ey > BK * BK) continue;
        p.px(x, y, tt === 'khoa' ? xam(c) : c);
      }
    }
    if (tt === 'khoa') veKhoa(p, TAM, TAM + 3);
    if (tt === 'xong') veSao(p, 28, 30);
    cache[key] = p.canvas(); return cache[key];
  }

  window.HuyHieu = { ve: ve, DS: Object.keys(HINH) };
})();
