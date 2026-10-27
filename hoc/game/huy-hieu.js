var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ============================================================================
   huy-hieu.js — "Robot Chấn Hưng": HUY HIỆU CỦA TỪNG CHƯƠNG (window.HuyHieu).
   Một huy hiệu tròn 36×36 pixel: vành kim loại + đĩa nền sáng + hình part / cơ chế của chương (vẽ bằng code, dùng Part và Ve sẵn có).
     HuyHieu.ve(ma, tt) → canvas 36×36.   ma = mã huy hiệu (man.huyHieu.ma = mã chương), tt = 'khoa' | 'mo' | 'xong'
     khoa = xám + ổ khóa · mo = đủ màu, vành thép · xong = vành vàng + sao.
   Ve.hydrate() gọi qua [data-i="huyhieu"] (data-ma, data-tt).
   ========================================================================== */
(function () {
  'use strict';

  var INK = BM.vienDam, N = 36, TAM = 18, BK = 13.4;
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
    veBloc(p, 0, 0, 22, 15, BM.hhTimV1, BM.hhTimV2, BM.hhTimV3);
    var x = 4; x += chu(p, 'd', x, 2, BM.hhTrang) + 1; x += chu(p, 'e', x, 2, BM.hhTrang) + 1; chu(p, 'f', x, 2, BM.hhTrang);
    p.rect(5, 9, 9, 2, BM.hhTim); p.rect(5, 12, 6, 1, BM.hhTim);
    return p;
  };
  HINH['tham-so'] = function () {                               // ( n )
    var p = P(24, 15);
    veBloc(p, 0, 0, 24, 15, BM.hhXanhLoV3, BM.hhXanhLoV4, BM.hhXanhLoV5);
    chu(p, '(', 3, 2, BM.hhVangV3, 1); chu(p, 'n', 9, 4, BM.hhTrang, 2); chu(p, ')', 17, 2, BM.hhVangV3, 1);
    return p;
  };
  HINH['tay-gap'] = function () {                               // càng kẹp ôm thùng
    return cat(partTho('tay', 'kep', { kep: 'dong', cam: true, vat: 'go' }));
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
    pts.forEach(function (q) { p.rect(q[0] - 1, q[1] - 1, 4, 4, INK); p.rect(q[0], q[1], 2, 2, BM.hhVangV1); });
    Part.veVatNho(p, 21, 12, 8, 'go');
    p.rect(21, 20, 8, 1, BM.hhXanhLaV1); p.rect(22, 21, 6, 1, BM.hhXanhLaV2);
    return cat(p);
  };
  /** Nòng trước của súng hơi (không có đế): bỏ hai hàng đế dưới cùng của hình part, để ghép với bóng. */
  function nongTruoc() {
    var q = partTho('tay', 'hoi', { chiTruoc: true }), r = P(q.w, 22);
    for (var y = 0; y < 22; y++) for (var x = 0; x < q.w; x++) r.px(x, y, q.get(x, y));
    return cat(r);
  }
  HINH['sung-hoi'] = function () {                              // súng hơi nằm ngang, vừa bắn ra một quả bóng
    var g = Part.rot90(nongTruoc()), p = P(g.w + 9, g.h), bx = g.w + 2, by = (g.h - 7) >> 1;
    chep(p, g, 0, 0, 1);
    var M = ['..XXX..', '.XwyyX.', 'XwyyyyX', 'XyyyyyX', 'XyyyydX', '.XdddX.', '..XXX..'], CB = { X: INK, w: BM.hhKemV1, y: BM.hhVangV2, d: BM.hhNauV1 };
    for (var j = 0; j < 7; j++) for (var i = 0; i < 7; i++) if (M[j].charAt(i) !== '.') p.px(bx + i, by + j, CB[M[j].charAt(i)]);
    return p;
  };
  HINH['luc-ban'] = function () {                               // súng hơi nằm ngang + hai quả bóng: nhỏ ở gần (bắn nhanh), to ở xa (bắn tụ)
    var g = Part.rot90(nongTruoc()), p = P(g.w + 15, g.h), by = g.h >> 1;
    chep(p, g, 0, 0, 1);
    var NHO = ['.XXX.', 'XwyyX', 'XyyyX', 'XyydX', '.XXX.'];
    var TO = ['..XXX..', '.XwyyX.', 'XwyyyyX', 'XyyyyyX', 'XyyyydX', '.XdddX.', '..XXX..'], CB = { X: INK, w: BM.hhKemV1, y: BM.hhVangV2, d: BM.hhNauV1 };
    function ve(M, x0, y0) { for (var j = 0; j < M.length; j++) for (var i = 0; i < M[j].length; i++) if (M[j].charAt(i) !== '.') p.px(x0 + i, y0 + j, CB[M[j].charAt(i)]); }
    ve(NHO, g.w + 1, by - 2);
    ve(TO, g.w + 7, by - 3);
    return p;
  };
  HINH['che-sung-hoi'] = function () {                          // súng hơi (nòng trước, đứng) + bánh răng
    var p = P(T26, T26), t = nongTruoc();
    chep(p, t, Math.max(0, 8 - (t.w >> 1)), Math.max(0, T26 - 1 - t.h), 1);
    themBanhRang(p);
    return p;
  };
  HINH['khoang-cach'] = function () {                           // cảm biến + sóng
    var p = P(30, 24), s = cat(partTho('cam-bien', 'khoang-cach', { ben: 'phai', bat: false }));
    chep(p, s, 0, 12 - s.h, 2);
    var cx = 2 * s.w + 2, cy = 12;
    [5, 9, 13].forEach(function (r) {
      for (var a = -55; a <= 55; a += 2) {
        var x = Math.round(cx + Math.cos(a * Math.PI / 180) * r), y = Math.round(cy + Math.sin(a * Math.PI / 180) * r);
        p.px(x, y, BM.hhXanhLoV1); p.px(x + 1, y, BM.hhXanhLo); p.px(x, y - 1, BM.hhXanhLoV1); 
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
    p.rect(1, 11, 22, 10, BM.hhXamV3);
    for (var x = 2; x < 22; x += 2) p.rect(x, 12, 1, 8, (x & 2) ? BM.hhXam : BM.hhXamV4);
    p.rect(1, 11, 22, 1, BM.hhXamV5); p.rect(1, 20, 22, 1, BM.hhXam);
    [[3, 16], [20, 16]].forEach(function (q) { p.ell(q[0], q[1], 3, 3, INK); p.ell(q[0], q[1], 2, 2, BM.hhXamV6); p.px(q[0] - 1, q[1] - 1, BM.hhLamV6); });
    [5, 11, 17].forEach(function (x) { tamGiac(p, [x, 13], [x + 3, 16], [x, 19], BM.hhVang); });
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
      p.px(x, y, r > 8.3 ? BM.hhLamV1 : lit ? BM.hhLamV2 : BM.hhLam);
    }
    function pos(deg, r) { return [cx + Math.cos(deg * Math.PI / 180) * r, cy + Math.sin(deg * Math.PI / 180) * r]; }
    tamGiac(p, pos(-78, 3.4), pos(-78, 12.2), pos(-50, 7.8), BM.hhLam);
    p.outline(INK);
    return p;
  };

  /* ---------------------------------------------- bốn chương "Chế lệnh" + Robot hoàn thiện
     Bốn huy hiệu che-xe, che-tay, che-lap, che-cam-bien dùng chung một mô-típ: BÁNH RĂNG VÀNG nhỏ ở góc trên phải ("tự chế lệnh"),
     hình chính của chương nằm dưới trái. robot-hoan-thien (huy hiệu lớn nhất đợt 1) là robot đủ bộ có NGÔI SAO nổi phía trên tay kẹp.
     Mọi hình dựng trên tấm vẽ 26×26 (tâm tấm ở (13,13) = tâm đĩa), phải nằm gọn trong bán kính BK. Trạng thái "xong" đóng sao vàng
     ở góc dưới phải nên chi tiết chính đừng dồn vào đó. */
  var KK = (typeof Part !== 'undefined' && Part.K) || {}, T26 = 26;
  var RANG = ['..X.X.X..', '.XXXXXXX.', 'XXXXXXXXX', '.XXXoXXX.', 'XXXoooXXX', '.XXXoXXX.', 'XXXXXXXXX', '.XXXXXXX.', '..X.X.X..'];
  /** bánh răng vàng 11×11 (thân 9×9 + viền tối), 8 răng, lỗ giữa tối. */
  function banhRang() {
    var q = P(11, 11);
    RANG.forEach(function (row, j) {
      for (var i = 0; i < 9; i++) {
        var c = row.charAt(i);
        if (c === 'X') q.px(i + 1, j + 1, i + j <= 4 ? KK.vangSang : i + j >= 12 ? KK.vangToi : KK.vang);
        else if (c === 'o') q.px(i + 1, j + 1, INK);
      }
    });
    return q.outline(INK);
  }
  function themBanhRang(p) { return chep(p, banhRang(), 14, 2, 1); }
  /** sao vàng 9×9 (thân 7×7 + viền tối), sáng trái-trên, tối phải-dưới. */
  function saoNho() {
    var m = ['...X...', '..XXX..', 'XXXXXXX', '.XXXXX.', '..XXX..', '.XX.XX.', '.X...X.'], q = P(9, 9);
    m.forEach(function (row, j) { for (var i = 0; i < 7; i++) if (row.charAt(i) === 'X') q.px(i + 1, j + 1, i + j <= 3 ? BM.hhKem : i + j >= 8 ? BM.hhNau : KK.vang); });
    return q.outline(INK);
  }

  HINH['che-xe'] = function () {                                // xe nhìn ngang (quay sang phải) + bánh răng
    var p = P(T26, T26), x0 = 3, y0 = 9;
    p.rect(x0, y0 + 4, 19, 6, INK); p.rect(x0 + 1, y0 + 5, 17, 4, KK.vang);          // thân
    p.rect(x0 + 1, y0 + 5, 17, 1, KK.vangSang); p.rect(x0 + 1, y0 + 8, 17, 1, KK.vangToi);
    p.rect(x0 + 4, y0, 10, 5, INK); p.rect(x0 + 5, y0 + 1, 8, 4, KK.vang);            // cabin
    p.rect(x0 + 6, y0 + 1, 6, 3, KK.kinh); p.rect(x0 + 6, y0 + 1, 2, 1, KK.xanh); p.px(x0 + 8, y0 + 2, KK.xanh);
    p.rect(x0 + 18, y0 + 5, 1, 2, BM.hhKem);                                         // đèn trước
    [4, 14].forEach(function (cx) {                                                   // hai bánh
      p.ell(x0 + cx + 0.5, y0 + 9.5, 2.9, 2.9, INK); p.ell(x0 + cx + 0.5, y0 + 9.5, 1.9, 1.9, KK.den); p.px(x0 + cx, y0 + 9, KK.thepSang);
    });
    themBanhRang(p);
    return p;
  };

  HINH['banh-lui'] = function () {                              // xe nhìn ngang (quay sang phải) đang lùi: mũi tên vàng chỉ về phía sau, vệt bụi sau đuôi
    var p = P(T26, T26), x0 = 7, y0 = 11;
    p.rect(x0, y0 + 4, 17, 6, INK); p.rect(x0 + 1, y0 + 5, 15, 4, KK.vang);          // thân
    p.rect(x0 + 1, y0 + 5, 15, 1, KK.vangSang); p.rect(x0 + 1, y0 + 8, 15, 1, KK.vangToi);
    p.rect(x0 + 4, y0, 9, 5, INK); p.rect(x0 + 5, y0 + 1, 7, 4, KK.vang);             // cabin
    p.rect(x0 + 6, y0 + 1, 5, 3, KK.kinh); p.rect(x0 + 6, y0 + 1, 2, 1, KK.xanh);
    p.rect(x0 + 16, y0 + 5, 1, 2, BM.hhKem);                                         // đèn trước
    p.rect(x0, y0 + 5, 1, 2, BM.hhDo);                                              // đèn lùi đỏ ở đuôi
    [3, 13].forEach(function (cx) {                                                   // hai bánh
      p.ell(x0 + cx + 0.5, y0 + 9.5, 2.9, 2.9, INK); p.ell(x0 + cx + 0.5, y0 + 9.5, 1.9, 1.9, KK.den); p.px(x0 + cx, y0 + 9, KK.thepSang);
    });
    p.rect(5, 6, 13, 3, INK); p.rect(6, 7, 11, 1, KK.vangSang);                       // mũi tên lùi: thân
    tamGiac(p, [0.5, 7.5], [6.5, 2.5], [6.5, 12.5], INK); tamGiac(p, [2, 7.5], [6, 4.2], [6, 10.8], KK.vang);
    [[2, 18], [3, 21], [1, 23]].forEach(function (q) { p.rect(q[0], q[1], 2, 1, BM.hhVangV4); });   // bụi
    return p;
  };

  HINH['che-tay'] = function () {                               // càng kẹp mở, sắp gắp khối sắt + bánh răng
    var p = P(T26, T26), k = cat(partTho('tay', 'kep', { kep: 'mo' })), q = P(k.w, k.h - 3), y;
    for (y = 0; y < k.h; y++) if (y < 5 || y > 7) for (var x = 0; x < k.w; x++) q.px(x, y < 5 ? y : y - 3, k.get(x, y));   // rút ngắn hai càng 3 hàng cho khỏi chạm bánh răng
    chep(p, q, 3, 24 - q.h, 1);
    Part.veVatNho(p, 9, 14, 8, 'sat');
    themBanhRang(p);
    return p;
  };
  HINH['nut-de'] = function () {                                // nút đè M đang bật (lún, xanh lá như ô M trên sân) + thùng gỗ đè lên trên
    var p = P(T26, T26);
    p.rect(2, 16, 22, 8, INK);
    p.rect(3, 17, 20, 6, BM.hhLamV7);
    p.rect(4, 18, 18, 4, BM.hhXanhLaV3);
    p.rect(4, 18, 18, 1, BM.hhXanhLa); p.rect(4, 18, 1, 4, BM.hhXanhLa);
    p.rect(4, 21, 18, 1, BM.hhXanhLaV4); p.rect(21, 18, 1, 4, BM.hhXanhLaV4);
    [[3, 17], [22, 17], [3, 22], [22, 22]].forEach(function (q) { p.px(q[0], q[1], BM.hhXanhLaV5); });
    Part.veVatNho(p, 7, 5, 12, 'go');
    return p;
  };

  HINH['che-lap'] = function () {                               // mũi tên vòng nhỏ + bánh răng
    var p = P(T26, T26), cx = 9.5, cy = 16.5, ri = 4.6, ro = 7.8;
    for (var y = 0; y < T26; y++) for (var x = 0; x < T26; x++) {
      var dx = x + 0.5 - cx, dy = y + 0.5 - cy, r = Math.sqrt(dx * dx + dy * dy), a = Math.atan2(dy, dx) * 180 / Math.PI;
      if (r < ri || r > ro) continue;
      if (a > -85 && a < -20) continue;
      var lit = (-dx - dy) / (r * 1.414) > 0.35;
      p.px(x, y, r > ro - 1 ? BM.hhLamV1 : lit ? BM.hhLamV2 : BM.hhLam);
    }
    function pos(deg, rr) { return [cx + Math.cos(deg * Math.PI / 180) * rr, cy + Math.sin(deg * Math.PI / 180) * rr]; }
    tamGiac(p, pos(-85, 2.4), pos(-85, 10.6), pos(-52, 6.6), BM.hhLam);
    p.outline(INK);
    themBanhRang(p);
    return p;
  };

  /** mắt hồng ngoại (vỏ mực, thấu kính đỏ đang đọc) ở (x, y), cỡ 6×6 */
  function matHongNgoai(p, x, y) {
    p.rect(x, y, 6, 6, INK); p.rect(x + 1, y + 1, 4, 4, BM.hhDoV5);
    p.rect(x + 2, y + 2, 2, 2, BM.hhDoV1); p.px(x + 2, y + 2, BM.hhDoV6); p.px(x + 1, y, BM.hhXamV7);
  }
  /** tia đỏ đứt từ (x0, y) tới x1, mỗi ô 3 px (vạch ngang + chấm sáng) */
  function tiaDo(p, x0, x1, y) {
    for (var x = x0; x < x1; x++) { p.px(x, y, (x - x0) % 3 === 2 ? BM.hhDoV3 : BM.hhDoV2); }
    for (var k = x0 + 2; k < x1; k += 3) { p.px(k, y - 1, BM.hhDoV2); p.px(k, y + 1, BM.hhDoV2); }
  }
  HINH['hong-ngoai'] = function () {                            // mắt hồng ngoại bắn tia đỏ đứt (mỗi vạch một ô 10 cm) tới viên gạch tường
    var p = P(30, 22);
    matHongNgoai(p, 0, 8);
    tiaDo(p, 6, 21, 11);
    veBloc(p, 21, 4, 8, 7, BM.hhNauV2, BM.hhCam, BM.hhNauV3); veBloc(p, 21, 11, 8, 7, BM.hhNauV2, BM.hhCam, BM.hhNauV3);
    return cat(p);
  };
  HINH['che-hong-ngoai'] = function () {                        // mắt hồng ngoại + tia đỏ ngắn tới gạch + bánh răng
    var p = P(T26, T26);
    matHongNgoai(p, 1, 15);
    tiaDo(p, 7, 17, 18);
    veBloc(p, 17, 14, 7, 9, BM.hhNauV2, BM.hhCam, BM.hhNauV3);
    themBanhRang(p);
    return p;
  };
  HINH['che-cam-bien'] = function () {                          // cảm biến + sóng + dấu ? + bánh răng
    var p = P(T26, T26), sx = 2, sy = 9, sh = 11;
    p.rect(sx, sy, 4, sh, INK); p.rect(sx + 1, sy + 1, 2, sh - 2, KK.thep);              // thân cảm biến (tai xanh lơ)
    p.rect(sx + 1, sy + 1, 2, 4, KK.xanh); p.px(sx + 1, sy + 1, BM.hhTrang); p.rect(sx + 1, sy + sh - 3, 2, 2, KK.thepToi);
    var cx = sx + 4, cy = sy + 3;
    [3.5, 6.5].forEach(function (r) {
      for (var a = -55; a <= 55; a += 3) {
        var x = Math.round(cx + Math.cos(a * Math.PI / 180) * r), y = Math.round(cy + Math.sin(a * Math.PI / 180) * r);
        p.px(x, y, BM.hhXanhLoV1); p.px(x + 1, y, BM.hhXanhLo); p.px(x, y - 1, BM.hhXanhLoV1);
      }
    });
    var h = ['.XXX.', 'XX.XX', '...XX', '..XX.', '.XX..', '.XX..', '.....', '.XX..', '.XX..'], q = P(7, 11);
    h.forEach(function (row, j) { for (var i = 0; i < 5; i++) if (row.charAt(i) === 'X') q.px(i + 1, j + 1, j <= 2 ? KK.vangSang : j >= 7 ? KK.vangToi : KK.vang); });
    chep(p, q.outline(INK), 14, 13, 1);
    themBanhRang(p);
    return p;
  };

  HINH['che-nhen'] = function () {                             // nhện CO chân (thân thấp) + bánh răng
    var p = P(T26, T26), t = cat(partTho('than', 'nhen', { co: true }));
    chep(p, t, Math.max(0, 10 - (t.w >> 1)), Math.max(0, T26 - 2 - t.h), 1);
    themBanhRang(p);
    return p;
  };
  /* Danh sách [ 4 2 3 ] (gói List, 17/10): ngoặc vuông vàng + các ô trắng, mỗi ô một chữ số; viền tối quanh. so = mảng chữ số, trả về Painter (6·n + 7) × 13. */
  var SO_LS = { '1': ['.X.', 'XX.', '.X.', '.X.', 'XXX'], '2': ['XXX', '..X', 'XXX', 'X..', 'XXX'], '3': ['XXX', '..X', 'XXX', '..X', 'XXX'], '4': ['X.X', 'X.X', 'XXX', '..X', '..X'] };
  function veDsO(so) {
    var n = so.length, w = 6 * n + 5, p = P(w + 2, 13), ox = 1, oy = 1, V = KK.vang || BM.hhVangV5;
    p.rect(ox, oy, 1, 11, V); p.rect(ox + 1, oy, 1, 1, V); p.rect(ox + 1, oy + 10, 1, 1, V);                                     // ngoặc [
    p.rect(ox + w - 1, oy, 1, 11, V); p.rect(ox + w - 2, oy, 1, 1, V); p.rect(ox + w - 2, oy + 10, 1, 1, V);                     // ngoặc ]
    so.forEach(function (d, i) {
      var cx = ox + 3 + i * 6;
      p.rect(cx, oy + 1, 5, 9, BM.hhTrang); p.rect(cx, oy + 9, 5, 1, BM.hhLamV8);
      SO_LS[d].forEach(function (row, j) { for (var k = 0; k < 3; k++) if (row.charAt(k) === 'X') p.px(cx + 1 + k, oy + 2 + j, BM.hhLamV9); });
    });
    return p.outline(INK);
  }
  HINH['list'] = function () { return veDsO(['4', '2', '3']); };                               // [ 4 2 3 ]
  HINH['che-list'] = function () {                                                              // [ 2 3 ] nhỏ + bánh răng
    var p = P(T26, T26), t = veDsO(['2', '3']);
    chep(p, t, 1, T26 - t.h, 1);
    themBanhRang(p);
    return p;
  };
  HINH['che-mau'] = function () {                               // bốn ô màu (đỏ, xanh lá, vàng, xanh dương) nhỏ + bánh răng
    var p = P(T26, T26), ten = ['red', 'green', 'yellow', 'blue'];
    ten.forEach(function (m, i) {
      var c = Ve.MAU[m], x = 4 + (i % 2) * 7, y = 10 + Math.floor(i / 2) * 7;
      p.rect(x, y, 6, 6, INK); p.rect(x + 1, y + 1, 4, 4, c.n);
      p.rect(x + 1, y + 1, 4, 1, c.s); p.rect(x + 1, y + 1, 1, 4, c.s); p.rect(x + 1, y + 4, 4, 1, c.t); p.rect(x + 4, y + 1, 1, 4, c.t);
    });
    themBanhRang(p);
    return p;
  };
  HINH['che-xich'] = function () {                              // xe xích nhìn ngang (quay sang phải): thân thấp trên một dải xích + bánh răng
    var p = P(T26, T26), x0 = 4, y0 = 12;
    p.rect(x0 + 2, y0, 14, 5, INK); p.rect(x0 + 3, y0 + 1, 12, 3, KK.vang);            // thân
    p.rect(x0 + 3, y0 + 1, 12, 1, KK.vangSang); p.rect(x0 + 3, y0 + 3, 12, 1, KK.vangToi);
    p.rect(x0 + 6, y0 + 1, 5, 2, KK.kinh); p.rect(x0 + 6, y0 + 1, 2, 1, KK.xanh);       // cửa kính
    p.rect(x0, y0 + 4, 18, 7, INK); p.rect(x0 + 1, y0 + 5, 16, 5, KK.den);              // dải xích
    for (var i = 1; i < 16; i += 3) { p.rect(x0 + 1 + i, y0 + 5, 1, 1, KK.denSang); p.rect(x0 + 1 + i, y0 + 9, 1, 1, KK.denSang); }      // mắt xích
    [3.5, 14.5].forEach(function (cx) { p.ell(x0 + cx, y0 + 7.5, 2.4, 2.4, INK); p.ell(x0 + cx, y0 + 7.5, 1.5, 1.5, KK.thepSang); });     // hai bánh dẫn
    themBanhRang(p);
    return p;
  };
  /** thùng nặng gỗ s×s (viền mực, ván sáng trên trái, tối dưới phải, hai nẹp chéo). */
  function veThungGo(p, x, y, s) {
    veBloc(p, x, y, s, s, BM.hhNauV6, BM.hhCamV1, BM.hhNauV7);
    for (var i = 2; i < s - 2; i++) { p.px(x + i, y + i, BM.hhNauV4); p.px(x + s - 1 - i, y + i, BM.hhNauV4); }
    p.rect(x + 1, y + (s >> 1), s - 2, 1, BM.hhNauV4);
  }
  /** xe xích nhìn ngang, quay sang phải (18 × 11 px): thân thấp trên một dải xích. */
  function veXichNgang(p, x0, y0) {
    p.rect(x0 + 2, y0, 14, 5, INK); p.rect(x0 + 3, y0 + 1, 12, 3, KK.vang);
    p.rect(x0 + 3, y0 + 1, 12, 1, KK.vangSang); p.rect(x0 + 3, y0 + 3, 12, 1, KK.vangToi);
    p.rect(x0 + 6, y0 + 1, 5, 2, KK.kinh); p.rect(x0 + 6, y0 + 1, 2, 1, KK.xanh);
    p.rect(x0, y0 + 4, 18, 7, INK); p.rect(x0 + 1, y0 + 5, 16, 5, KK.den);
    for (var i = 1; i < 16; i += 3) { p.rect(x0 + 1 + i, y0 + 5, 1, 1, KK.denSang); p.rect(x0 + 1 + i, y0 + 9, 1, 1, KK.denSang); }
    [3.5, 14.5].forEach(function (cx) { p.ell(x0 + cx, y0 + 7.5, 2.4, 2.4, INK); p.ell(x0 + cx, y0 + 7.5, 1.5, 1.5, KK.thepSang); });
  }
  HINH['day-thung'] = function () {                             // xe xích nhìn ngang tì mũi vào thùng nặng gỗ, mũi tên đẩy phía trên thùng
    var p = P(T26, T26);
    veXichNgang(p, 0, 13);
    veThungGo(p, 17, 14, 9);
    tamGiac(p, [19, 4], [24, 8.5], [19, 13], INK); p.rect(12, 7, 7, 3, INK);           // mũi tên đẩy sang phải
    tamGiac(p, [20, 6], [22.6, 8.5], [20, 11], KK.vang); p.rect(13, 8, 7, 1, KK.vang);
    return p;
  };
  HINH['che-day-thung'] = function () {                         // thùng nặng gỗ + mũi tên đẩy + bánh răng
    var p = P(T26, T26);
    veThungGo(p, 11, 13, 11);
    tamGiac(p, [6, 13], [11, 18.5], [6, 24], INK); p.rect(2, 16, 4, 5, INK);           // mũi tên đẩy vào thùng
    tamGiac(p, [7, 15.5], [9.6, 18.5], [7, 21.5], KK.vang); p.rect(3, 17, 5, 3, KK.vang);
    themBanhRang(p);
    return p;
  };
  HINH['che-luc-ban'] = function () {                           // hai quả bóng (nhỏ: bắn nhanh, to: bắn tụ) + bánh răng
    var p = P(T26, T26);
    var NHO = ['.XXX.', 'XwyyX', 'XyyyX', 'XyydX', '.XXX.'];
    var TO = ['..XXX..', '.XwyyX.', 'XwyyyyX', 'XyyyyyX', 'XyyyydX', '.XdddX.', '..XXX..'], CB = { X: INK, w: BM.hhKemV1, y: BM.hhVangV2, d: BM.hhNauV1 };
    function ve(M, x0, y0) { for (var j = 0; j < M.length; j++) for (var i = 0; i < M[j].length; i++) if (M[j].charAt(i) !== '.') p.px(x0 + i, y0 + j, CB[M[j].charAt(i)]); }
    ve(NHO, 2, 17);
    ve(TO, 9, 14);
    themBanhRang(p);
    return p;
  };
  /** Nút bắn ĐANG BẬT nhìn thẳng (khối tường xám, núm đỏ sáng) có quầng đỏ và ba làn hơi nóng bốc lên; x0, y0: góc trái trên của khung 16 × 18. */
  function veNutNong(p, x0, y0) {
    var M = [
      '....r.....r.....',
      '...r.....r....r.',
      '....r.....r..r..',
      '...r.....r....r.',
      '..oooooooooooo..',
      '.ooXXXXXXXXXXoo.',
      'ooXggggggggggXoo',
      'oXgsssssssssgXo.',
      'oXgsgsXXXXsgsXo.',
      'oXgsgXRRRRXgsXo.',
      'oXgsXRwRRRdXsXo.',
      'oXgsXRRRRRdXsXo.',
      'oXgsXRRRRddXsXo.',
      'oXgsgXddddXgsXo.',
      'oXgsssXXXXsssXo.',
      'ooXggggggggggXoo',
      '.ooXXXXXXXXXXoo.',
      '..oooooooooooo..'
    ];
    var CB = { X: INK, g: BM.hhXamV8, s: BM.hhXamV9, R: BM.hhDoV7, w: BM.hhDoV8, d: BM.hhDoV9, o: BM.hhDoV3, r: BM.hhDoV10 };
    for (var j = 0; j < M.length; j++) for (var i = 0; i < M[j].length; i++) { var c = M[j].charAt(i); if (c !== '.') p.px(x0 + i, y0 + j, CB[c]); }
  }
  HINH['do-nhiet'] = function () {                              // nút bắn đang bật: núm đỏ, quầng đỏ, hơi nóng bốc lên
    var p = P(T26, T26);
    veNutNong(p, 5, 5);
    return p;
  };
  HINH['che-do-nhiet'] = function () {                          // nút nóng + bánh răng
    var p = P(T26, T26);
    veNutNong(p, 1, 7);
    themBanhRang(p);
    return p;
  };
  HINH['che-omni'] = function () {                              // thân omni (bốn bánh nhỏ ở góc, nhìn từ trên) + bánh răng
    var p = P(T26, T26), t = thanPart('omni');
    chep(p, t, 2, Math.max(0, T26 - 3 - t.h), 1);          // thân gọn trong vòng tròn; bánh răng che một chút góc phải trên
    themBanhRang(p);
    return p;
  };
  HINH['che-nam-cham'] = function () {                          // nam châm đang bật + bánh răng
    var p = P(T26, T26), t = cat(partTho('tay', 'nam-cham', { bat: true, cuc: 'N' }));
    chep(p, t, Math.max(0, 10 - (t.w >> 1)), Math.max(0, T26 - 1 - t.h), 1);
    themBanhRang(p);
    return p;
  };
  HINH['che-may-nem'] = function () {                           // máy ném + vòng cung vật bay thấp + vật rơi xuống đất + bánh răng
    var p = P(T26, T26), m = cat(partTho('tay', 'nem', { dangNem: true, cam: true }));
    chep(p, m, 0, T26 - 1 - m.h, 1);
    [[9, 14], [12, 12], [15, 12], [18, 14]].forEach(function (q) { p.rect(q[0] - 1, q[1] - 1, 4, 4, INK); p.rect(q[0], q[1], 2, 2, BM.hhVangV1); });
    Part.veVatNho(p, 17, 17, 7, 'go');
    p.rect(16, 24, 9, 1, BM.hhXanhLaV1); p.rect(17, 25, 7, 1, BM.hhXanhLaV2);
    themBanhRang(p);
    return p;
  };
  HINH['che-drone'] = function () {                             // thân drone nhìn từ trên (bốn cánh quạt) + bánh răng
    var p = P(T26, T26), t = thanPart('drone');
    chep(p, t, 2, Math.max(0, T26 - 3 - t.h), 1);          // thân gọn trong vòng tròn; bánh răng che một chút góc phải trên
    themBanhRang(p);
    return p;
  };
  HINH['flycam'] = function () {                                // drone nhìn từ trên + camera dưới bụng đang nhìn (kính sáng) + hai ô màu (đỏ, xanh dương) bên dưới
    var p = P(T26, T26), w = P(24, 24), k;
    chep(w, partTho('than', 'drone'), 0, 0, 1);
    chep(w, partTho('cam-bien', 'camera-bay', { mat: true }), 0, 0, 1);
    var t = cat(w);
    chep(p, t, Math.max(0, (T26 - t.w) >> 1), 0, 1);
    var y0 = Math.min(T26 - 7, t.h + 1);                          // hai ô màu nhỏ ngay dưới camera, nối bằng hai tia nhìn
    [[5, 'red'], [14, 'blue']].forEach(function (o) {
      var c = Ve.MAU[o[1]];
      p.rect(o[0], y0, 7, 7, INK); p.rect(o[0] + 1, y0 + 1, 5, 5, c.n);
      p.rect(o[0] + 1, y0 + 1, 5, 1, c.s); p.rect(o[0] + 1, y0 + 1, 1, 5, c.s); p.rect(o[0] + 1, y0 + 5, 5, 1, c.t); p.rect(o[0] + 5, y0 + 1, 1, 5, c.t);
    });
    for (k = 0; k < 2; k++) { p.px(11 - k * 2, y0 - 2 + k, BM.hhXanhLoV2); p.px(14 + k * 2, y0 - 2 + k, BM.hhXanhLoV2); }
    return p;
  };
  HINH['may-son'] = function () {                               // đầu sơn + nét sơn đỏ gập góc
    var p = P(30, 26), t = cat(partTho('tay', 'son', { mauSon: 'red', tuThe: 'duoi' }));
    chep(p, t, 0, Math.max(0, 26 - t.h), 1);
    p.rect(17, 3, 12, 5, INK); p.rect(18, 4, 10, 3, BM.hhDoV4); p.rect(23, 3, 6, 16, INK); p.rect(24, 4, 4, 14, BM.hhDoV4); p.rect(18, 4, 10, 1, BM.hhDoV11);
    return cat(p);
  };
  HINH['che-may-son'] = function () {                           // đầu sơn + bánh răng
    var p = P(T26, T26), t = cat(partTho('tay', 'son', { mauSon: 'blue' }));
    chep(p, t, Math.max(0, 10 - (t.w >> 1)), Math.max(0, T26 - t.h), 1);
    themBanhRang(p);
    return p;
  };
  HINH['tay-xoay'] = function () {                              // tay xoay (khớp tròn) + vật gỗ bên cạnh
    var p = P(30, 26), t = cat(partTho('tay', 'xoay', { kep: 'mo' }));
    chep(p, t, 0, Math.max(0, 26 - t.h), 1);
    Part.veVatNho(p, 21, 2, 8, 'go');
    return cat(p);
  };
  HINH['che-tay-xoay'] = function () {                          // tay xoay + bánh răng
    var p = P(T26, T26), t = cat(partTho('tay', 'xoay', { kep: 'mo' }));
    chep(p, t, Math.max(0, 10 - (t.w >> 1)), Math.max(0, T26 - t.h), 1);
    themBanhRang(p);
    return p;
  };

  HINH['combo'] = function () {                                 // combo nhìn bên, nhặt bên: tay xoay ở giữa, hai thùng hai bên, hai tia cảm biến đỏ chỉ sang hai bên
    var p = P(30, 26), t = cat(partTho('tay', 'xoay', { kep: 'mo' }));
    chep(p, t, 15 - (t.w >> 1), Math.max(0, 26 - t.h), 1);
    Part.veVatNho(p, 0, 4, 7, 'go');
    Part.veVatNho(p, 23, 4, 7, 'go');
    for (var i = 0; i < 3; i++) { p.px(8 + i * 2, 7, BM.hhDo); p.px(21 - i * 2, 7, BM.hhDo); }
    return p;
  };
  HINH['che-combo'] = function () {                             // combo mở rộng: tay xoay + thùng bên cạnh + bánh răng
    var p = P(T26, T26), t = cat(partTho('tay', 'xoay', { kep: 'mo' }));
    chep(p, t, Math.max(0, 10 - (t.w >> 1)), Math.max(0, T26 - t.h), 1);
    Part.veVatNho(p, 0, 2, 6, 'go');
    p.px(7, 5, BM.hhDo); p.px(9, 5, BM.hhDo);
    themBanhRang(p);
    return p;
  };

  HINH['robot-hoan-thien'] = function () {                   // robot đủ bộ nhìn từ trên (hướng lên) đúng dáng robot trong game, thu nhỏ; sao nổi phía trên
    var p = P(T26, T26), r = P(23, 14), CY = BM.hhXanhLo;
    r.rect(3, 7, 3, 7, INK); r.rect(4, 8, 1, 5, KK.denSang); r.px(4, 9, KK.thepSang); r.px(4, 11, KK.thepSang);       // bánh trái
    r.rect(17, 7, 3, 7, INK); r.rect(18, 8, 1, 5, KK.denSang); r.px(18, 9, KK.thepSang); r.px(18, 11, KK.thepSang);   // bánh phải
    r.rect(5, 6, 13, 8, INK); r.rect(6, 7, 11, 6, KK.vang);                                                          // thân
    r.rect(6, 7, 11, 1, KK.vangSang); r.rect(6, 12, 11, 1, KK.vangToi);
    r.rect(8, 8, 7, 4, KK.kinh); r.rect(9, 9, 2, 2, KK.xanh); r.rect(12, 9, 2, 2, KK.xanh);                          // kính + hai mắt
    r.rect(0, 7, 4, 7, INK); r.rect(1, 8, 2, 5, CY); r.rect(1, 8, 2, 1, BM.hhNgoc); r.px(1, 8, BM.hhTrang); r.rect(1, 12, 2, 1, KK.thep);   // cảm biến trái (tai xanh lơ)
    r.rect(19, 7, 4, 7, INK); r.rect(20, 8, 2, 5, CY); r.rect(20, 8, 2, 1, BM.hhNgoc); r.px(20, 8, BM.hhTrang); r.rect(20, 12, 2, 1, KK.thep); // cảm biến phải
    r.rect(5, 0, 4, 6, INK); r.rect(6, 1, 2, 4, KK.vangSang);                                                        // tay kẹp: hai càng + thanh nối
    r.rect(14, 0, 4, 6, INK); r.rect(15, 1, 2, 4, KK.vang); r.rect(15, 4, 2, 1, KK.vangToi);
    r.rect(9, 4, 5, 3, INK); r.rect(10, 5, 3, 1, KK.thep);
    chep(p, r, 1, 9, 1);
    chep(p, saoNho(), 8, 0, 1);
    return p;
  };

  HINH['xuat-xuong'] = function () {                           // trùm cuối mùa 1 "R1 xuất xưởng": tay xoay đủ bộ ở giữa, hai tai cảm biến bên xanh lơ, hai sao hai góc trên
    var p = P(T26, T26), t = cat(partTho('tay', 'xoay', { kep: 'mo' })), s = saoNho();
    chep(p, t, 13 - (t.w >> 1), Math.max(0, T26 - t.h), 1);
    for (var i = 0; i < 3; i++) { p.px(1 + i * 2, 15, BM.hhXanhLo); p.px(T26 - 2 - i * 2, 15, BM.hhXanhLo); }
    chep(p, s, 0, 0, 1);
    chep(p, s, T26 - s.w, 0, 1);
    return p;
  };

  HINH['hai-robot'] = function () {                             // đội hai robot: hai xe nhỏ nhìn từ trên, sơn vàng (R1) và lam (R2) như trên sân, thùng hàng chuyền ở giữa
    var p = P(30, 26);
    function xe(son) {                                          // xe 12×12 quay lên: hai bánh, thân sơn màu đội, kính + hai mắt
      var q = P(12, 12), s = Part.SON[son];
      q.rect(0, 3, 3, 8, INK); q.rect(1, 4, 1, 6, KK.denSang); q.px(1, 5, KK.thepSang); q.px(1, 8, KK.thepSang);
      q.rect(9, 3, 3, 8, INK); q.rect(10, 4, 1, 6, KK.denSang); q.px(10, 5, KK.thepSang); q.px(10, 8, KK.thepSang);
      q.rect(2, 1, 8, 11, INK); q.rect(3, 2, 6, 9, s[0]); q.rect(3, 2, 6, 1, s[1]); q.rect(3, 10, 6, 1, s[2]);
      q.rect(4, 4, 4, 3, KK.kinh); q.px(4, 5, KK.xanh); q.px(7, 5, KK.xanh);
      return q;
    }
    chep(p, xe('vang'), 0, 13, 1);
    chep(p, xe('lam'), 18, 13, 1);
    Part.veVatNho(p, 11, 3, 8, 'go');
    p.px(9, 10, INK); p.px(8, 11, INK); p.px(20, 10, INK); p.px(21, 11, INK);    // hai vạch chéo: thùng đi từ xe này sang xe kia
    return p;
  };

  HINH['che-hai-robot'] = function () {                         // đội phối hợp: R1 vàng đứng trên nút đè M (xanh lá) giữ cửa mở, R2 lam mang thùng đi qua khung cửa
    var p = P(30, 26);
    function xe(son) {                                          // xe 12×12 quay lên như HINH['hai-robot']
      var q = P(12, 12), s = Part.SON[son];
      q.rect(0, 3, 3, 8, INK); q.rect(1, 4, 1, 6, KK.denSang); q.px(1, 5, KK.thepSang); q.px(1, 8, KK.thepSang);
      q.rect(9, 3, 3, 8, INK); q.rect(10, 4, 1, 6, KK.denSang); q.px(10, 5, KK.thepSang); q.px(10, 8, KK.thepSang);
      q.rect(2, 1, 8, 11, INK); q.rect(3, 2, 6, 9, s[0]); q.rect(3, 2, 6, 1, s[1]); q.rect(3, 10, 6, 1, s[2]);
      q.rect(4, 4, 4, 3, KK.kinh); q.px(4, 5, KK.xanh); q.px(7, 5, KK.xanh);
      return q;
    }
    p.rect(0, 22, 14, 4, INK); p.rect(1, 23, 12, 2, BM.hhXanhLaV3); p.rect(1, 23, 12, 1, BM.hhXanhLa);   // nút đè M dưới R1
    chep(p, xe('vang'), 1, 11, 1);
    p.rect(14, 4, 2, 22, INK); p.rect(14, 5, 1, 20, BM.hhXamV1);                                   // khung cửa (cánh đã mở)
    p.rect(28, 4, 2, 22, INK); p.rect(29, 5, 1, 20, BM.hhXamV1);
    p.rect(14, 4, 16, 2, INK); p.rect(15, 5, 14, 1, BM.hhLamV10);
    chep(p, xe('lam'), 16, 13, 1);
    Part.veVatNho(p, 18, 7, 8, 'go');                                                            // thùng R2 đang mang
    return p;
  };

  HINH['rap-nao'] = function () {                              // lắp ráp thân + não: thân xích nhìn từ trên + đồng xu vàng nổi ở góc (ngân sách)
    var p = P(T26, T26), t = thanPart('xich');
    chep(p, t, Math.max(0, 14 - (t.w >> 1)), Math.max(0, T26 - t.h), 1);
    p.ell(8.5, 8.5, 6.5, 6.5, INK); p.ell(8.5, 8.5, 5.6, 5.6, BM.hhNau); p.ell(8.5, 8.5, 4.4, 4.4, BM.hhVang);
    p.rect(6, 6, 2, 1, BM.hhKem); p.rect(5, 7, 1, 3, BM.hhKem);                                   // ánh sáng
    p.rect(8, 6, 2, 6, BM.hhNau); p.rect(8, 6, 1, 6, BM.hhNauV5);                                    // khe giữa đồng xu
    return p;
  };

  HINH['rap-du'] = function () {                                // lắp ráp đủ bộ: robot ghép đủ ba part (hai bánh + tay kẹp + cảm biến khoảng cách, đúng hình robot trong game) + đồng xu vàng ở góc
    var p = P(T26, T26), r = cat(tuCanvas(Part.ghep({ than: 'hai-banh', tay: 'kep', camBien: [{ ma: 'khoang-cach', o: 'hong' }] })));
    chep(p, r, Math.max(0, (T26 - r.w) >> 1), Math.max(0, T26 - r.h), 1);
    p.ell(21, 4.5, 4.5, 4.5, INK); p.ell(21, 4.5, 3.7, 3.7, BM.hhNau); p.ell(21, 4.5, 2.6, 2.6, BM.hhVang);
    p.rect(19, 3, 1, 1, BM.hhKem); p.rect(20, 3, 1, 3, BM.hhNauV5);
    return p;
  };

  HINH['rap-tay'] = function () {                               // lắp ráp thân + tay: thân omni ở dưới, tay nam châm gắn phía trên, đồng xu vàng ở góc
    var p = P(T26, T26), t = thanPart('omni'), a = cat(partTho('tay', 'nam-cham', { bat: true }));
    chep(p, t, Math.max(0, (T26 - t.w) >> 1), Math.max(0, T26 - t.h), 1);
    chep(p, a, Math.max(0, (T26 - a.w) >> 1), Math.max(0, T26 - t.h - a.h + 3), 1);
    p.ell(21.5, 4.5, 4.5, 4.5, INK); p.ell(21.5, 4.5, 3.7, 3.7, BM.hhNau); p.ell(21.5, 4.5, 2.6, 2.6, BM.hhVang);
    p.rect(20, 3, 1, 1, BM.hhKem); p.rect(21, 3, 1, 3, BM.hhNauV5);
    return p;
  };

  HINH['ban-xoay'] = function () {                              // mâm bàn xoay cơ khí + mũi tên vòng chiều kim đồng hồ
    var p = P(T26, T26);
    p.ell(13, 13, 10, 10, INK);
    p.ell(13, 13, 8.8, 8.8, BM.hhLamV11);
    p.ell(13, 13, 7.2, 7.2, BM.hhNauV8);
    p.ell(13, 13, 6.2, 6.2, BM.hhNauV9);
    for (var a = -140; a <= 40; a += 6) {
      var rx = Math.round(13 + Math.cos(a * Math.PI / 180) * 4.5), ry = Math.round(13 + Math.sin(a * Math.PI / 180) * 4.5);
      p.px(rx, ry, BM.hhKemV2);
    }
    p.rect(16, 14, 3, 2, BM.hhKemV2); p.px(17, 16, BM.hhTrang);
    p.ell(13, 13, 2.2, 2.2, INK); p.ell(13, 13, 1.3, 1.3, BM.hhTrangV2);
    return p;
  };
  HINH['che-ban-xoay'] = function () {                          // cổng dịch chuyển phát sáng + bánh răng
    var p = P(T26, T26);
    p.ell(11, 15, 8.5, 8.5, INK);
    p.ell(11, 15, 7.2, 7.2, BM.hhXanhLoV6);
    p.ell(11, 15, 5.4, 5.4, BM.hhXanhLoV7);
    p.ell(11, 15, 3.2, 3.2, BM.hhXanhLoV8);
    p.rect(10, 14, 2, 2, BM.hhTrang);
    themBanhRang(p);
    return p;
  };
  function xeDuaNho(son) {
    var q = P(12, 12), s = Part.SON[son];
    q.rect(0, 3, 3, 8, INK); q.rect(1, 4, 1, 6, KK.denSang); q.px(1, 5, KK.thepSang); q.px(1, 8, KK.thepSang);
    q.rect(9, 3, 3, 8, INK); q.rect(10, 4, 1, 6, KK.denSang); q.px(10, 5, KK.thepSang); q.px(10, 8, KK.thepSang);
    q.rect(2, 1, 8, 11, INK); q.rect(3, 2, 6, 9, s[0]); q.rect(3, 2, 6, 1, s[1]); q.rect(3, 10, 6, 1, s[2]);
    q.rect(4, 4, 4, 3, KK.kinh); q.px(4, 5, KK.xanh); q.px(7, 5, KK.xanh);
    return q;
  }
  HINH['dua-robot'] = function () {                             // đua đối kháng: xe vàng (R1) vượt trước xe đỏ (R2) hướng tới cờ đích
    var p = P(30, 26);
    chep(p, xeDuaNho('vang'), 1, 11, 1);
    chep(p, xeDuaNho('do'), 17, 14, 1);
    p.rect(13, 1, 2, 11, INK); p.rect(14, 2, 1, 9, BM.hhTrangV1);
    p.rect(15, 1, 7, 6, INK); p.rect(15, 2, 6, 4, BM.hhDoV1); p.rect(15, 2, 3, 2, BM.hhVangV1); p.rect(18, 4, 3, 2, BM.hhVangV1);
    return p;
  };
  HINH['che-dua-robot'] = function () {                         // chiến thuật đối kháng: xe vàng đấu xe đỏ + bánh răng
    var p = P(T26, T26);
    chep(p, xeDuaNho('vang'), 0, 12, 1);
    chep(p, xeDuaNho('do'), 13, 14, 1);
    themBanhRang(p);
    return p;
  };
  function xeXichNho(son) {                                     // thân xích 14×14: hai dải xích rộng có mắt xích, thân sơn màu đội, nòng ngắn phía trước
    var q = P(14, 14), s = Part.SON[son], y;
    q.rect(0, 1, 4, 13, INK); q.rect(1, 2, 2, 11, KK.thepToi);
    q.rect(10, 1, 4, 13, INK); q.rect(11, 2, 2, 11, KK.thepToi);
    for (y = 3; y < 13; y += 2) { q.rect(1, y, 2, 1, KK.thepSang); q.rect(11, y, 2, 1, KK.thepSang); }
    q.rect(3, 3, 8, 10, INK); q.rect(4, 4, 6, 8, s[0]); q.rect(4, 4, 6, 1, s[1]); q.rect(4, 11, 6, 1, s[2]);
    q.rect(5, 6, 4, 3, KK.kinh); q.px(5, 7, KK.xanh); q.px(8, 7, KK.xanh);
    q.rect(6, 0, 2, 4, INK); q.px(6, 1, KK.thepSang); q.px(7, 1, KK.thepSang);
    return q;
  }
  HINH['doi-thu-manh'] = function () {                          // đọ sức part mạnh: xe hai bánh vàng nhỏ (R1) đi trước xe xích đỏ to (R2), cờ đích phía trước R1
    var p = P(30, 27);
    chep(p, xeXichNho('do'), 15, 12, 1);
    chep(p, xeDuaNho('vang'), 2, 9, 1);
    p.rect(4, 0, 2, 9, INK); p.rect(5, 1, 1, 7, BM.hhTrangV1);
    p.rect(6, 0, 7, 6, INK); p.rect(6, 1, 6, 4, BM.hhDoV1); p.rect(6, 1, 3, 2, BM.hhVangV1); p.rect(9, 3, 3, 2, BM.hhVangV1);
    return p;
  };

  /* ---------------------------------------------------------------- vành + đĩa */
  var PAL = {
    khoa: { hi: BM.hhXamV10, md: BM.hhXamV2, lo: BM.hhXamV11, d1: BM.hhXamV12, d2: BM.hhXamV13 },
    mo: { hi: BM.hhTrangV3, md: BM.hhLamV12, lo: BM.hhXamV14, d1: BM.hhLamV3, d2: BM.hhLamV4 },
    xong: { hi: BM.hhKem, md: BM.hhVang, lo: BM.hhNauV10, d1: BM.hhLamV3, d2: BM.hhLamV4 }
  };
  function xam(c) {
    var n = parseInt(c.slice(1), 16), l = Math.round(0.3 * (n >> 16) + 0.59 * ((n >> 8) & 255) + 0.11 * (n & 255));
    l = Math.round(l * 0.62 + 52); var h = l.toString(16); if (h.length < 2) h = '0' + h;
    return '#' + h + h + h;
  }
  function veSao(p, cx, cy) {                                   // sao vàng 11×11 có viền tối
    var m = ['....XXX....', '....XXX....', '...XXXXX...', 'XXXXXXXXXXX', '.XXXXXXXXX.', '..XXXXXXX..', '..XXXXXXX..', '.XXXX.XXXX.', '.XXX...XXX.', 'XX.......XX'];
    var q = P(13, 12);
    m.forEach(function (row, y) { for (var x = 0; x < row.length; x++) if (row.charAt(x) === 'X') q.px(x + 1, y + 1, BM.hhVang); });
    q.outline(INK);
    for (var y = 0; y < q.h; y++) for (var x = 0; x < q.w; x++) if (q.get(x, y) === BM.hhVang) { if (y <= 3 || x <= 4) q.px(x, y, BM.hhKem); else if (y >= 7 || x >= 8) q.px(x, y, BM.hhNau); }
    chep(p, q, cx - 6, cy - 6, 1);
  }
  function veKhoa(p, cx, cy) {                                  // ổ khóa 9×11
    var q = P(11, 13);
    q.rect(2, 0, 7, 7, INK); q.rect(4, 2, 3, 5, null); q.rect(3, 1, 5, 1, BM.hhLamV5); q.rect(3, 2, 1, 5, BM.hhLamV5); q.rect(7, 2, 1, 5, BM.hhXamV2);
    q.rect(0, 5, 11, 8, INK); q.rect(1, 6, 9, 6, BM.hhVangV6); q.rect(1, 6, 9, 1, BM.hhVangV7); q.rect(1, 11, 9, 1, BM.hhNauV11);
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

  HINH['me-cung'] = HINH['khoang-cach'];
  HINH['cam-bien-ben'] = HINH['khoang-cach'];
  HINH['doi-ho-bang'] = HINH['hai-robot'];                      // gói thử thách hai robot: dùng lại hình Đội hai robot
  HINH['doi-gap-nem'] = HINH['hai-robot'];
  HINH['che-doi-ho-bang'] = HINH['hai-robot'];
  HINH['che-doi-gap-nem'] = HINH['hai-robot'];
  HINH['doi-xich'] = HINH['hai-robot'];
  HINH['che-doi-xich'] = HINH['hai-robot'];
  HINH['doi-omni'] = HINH['hai-robot'];
  HINH['che-doi-omni'] = HINH['hai-robot'];
  HINH['doi-sung-hoi'] = HINH['hai-robot'];
  HINH['che-doi-sung-hoi'] = HINH['hai-robot'];
  HINH['doi-mau'] = HINH['hai-robot'];
  HINH['che-doi-mau'] = HINH['hai-robot'];
  HINH['doi-nam-cham'] = HINH['hai-robot'];
  HINH['che-doi-nam-cham'] = HINH['hai-robot'];
  HINH['doi-tay-xoay'] = HINH['hai-robot'];
  HINH['che-doi-tay-xoay'] = HINH['hai-robot'];
  HINH['doi-drone'] = HINH['hai-robot'];
  HINH['che-doi-drone'] = HINH['hai-robot'];
  window.HuyHieu = { ve: ve, DS: Object.keys(HINH) };
})();
