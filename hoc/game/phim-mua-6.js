var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});
/* ============================================================================
   phim-mua-6.js — "Mật Lệnh Robot": DỮ LIỆU PHIM GÓI MÙA 6 "MỎ ĐÁ" (gói 1–4).
   Cỗ máy mùa 6: Máy mỏ đá R1 (thân omni + tay hất đá + radar tròn).
   ========================================================================== */
(function (goc) {
  'use strict';

  var XE = { than: 'hai-banh', tay: null, camBien: [] };
  var OMNI = { than: 'omni', tay: null, camBien: [] };
  var OMNI_NEM = { than: 'omni', tay: 'nem', camBien: [] };
  var OMNI_RADAR = { than: 'omni', tay: 'nem', camBien: [{ ma: 'radar', o: 'tren' }] };
  var Y = 158;
  var X0 = 20, Y0 = 26, C1 = 56;

  function truot(c, e, ms, x, y, giay) {
    e.classList.add('pg-truot'); e.style.setProperty('--tg', (giay || 1) + 's');
    c.sau(ms, function () { e.style.left = x + 'px'; if (y !== undefined) e.style.top = y + 'px'; });
  }
  function diQua(c, s, r, diem, ms0, buoc) {
    diem.forEach(function (d, i) {
      var p = s.o(d[0], d[1]), t = ms0 + i * buoc;
      truot(c, r, t, p.x, p.y, buoc / 1000 * 0.9);
      c.sau(t, function () { c.keu('buoc'); });
    });
  }
  function hoi(k, c, chu, x, y, t) {
    var e = c.chu('md-hoi', chu); e.style.left = x + 'px'; e.style.top = y + 'px'; e.style.animationDelay = t + 's';
    k.appendChild(e); return e;
  }
  function bayToi(k, c, e, x0, y0, x1, y1, t0, t1) {
    var vx = c.h('div', 'md-a md-vx'); vx.style.left = x0 + 'px'; vx.style.top = y0 + 'px'; vx.style.setProperty('--x', (x1 - x0) + 'px'); vx.style.animationDelay = t0 + 's';
    var vy = c.h('div', 'md-vy'); vy.style.setProperty('--y', (y1 - y0) + 'px'); vy.style.setProperty('--r', '360deg'); vy.style.animationDelay = t0 + 's';
    vy.appendChild(e); vx.appendChild(vy); k.appendChild(c.tu(vx, t1, true));
  }
  function lap(k, c, cu, moi, t) {
    k.appendChild(c.tu(cu, t, true)); k.appendChild(c.tu(moi, t));
    var cach = c.chu('md-ram pg-cach', 'CẠCH!'); cach.style.animationDelay = t + 's'; k.appendChild(cach);
    c.sau(t * 1000, function () { c.keu('kep'); });
  }

  var PHIM = {
    /* ---------------------------------------------------------------- 1 · Bánh omni & Lưới 2D */
    'omni': [
      // 1 · bậc đá mỏ quá hẹp, xe hai bánh không quay đầu nổi
      function (k, c) {
        var s = c.san(k, ['##.##', '##..F', '..###'], 4, X0, Y0, 'mo-da'), p = s.o(0, 2);
        var r = c.xe(XE, {}, 0, 2, p.x, p.y); k.appendChild(r);
        diQua(c, s, r, [[1, 2], [2, 1]], 300, 500);
        hoi(k, c, '?', 140, 60, 1.3);
        c.sau(1400, function () { r.mat('ngac'); c.keu('loi'); });
      },
      // 2 · lắp bánh con lăn omni vào gầm R1
      function (k, c) {
        c.nen(k, 'pg-xuong'); c.nen(k, 'md-san pg-gach');
        bayToi(k, c, c.ico('denBanh', 3, BM.vang), 250, 40, 140, Y, 0.1, 0.95);
        lap(k, c, c.xe(XE, {}, 1, 3, 150, Y), c.xe(OMNI, {}, 1, 3, 150, Y), 0.95);
      },
      // 3 · R1 trượt ngang qua khe hẹp, không cần quay mũi
      function (k, c) {
        var s = c.san(k, ['##..F', '##.#.', '...##'], 4, X0, Y0, 'mo-da'), p = s.o(0, 2);
        var r = c.xe(OMNI, {}, 0, 2, p.x, p.y); k.appendChild(r);
        diQua(c, s, r, [[2, 2], [2, 0], [4, 0]], 300, 600);
        c.sau(2200, function () { r.mat('vui'); c.keu('thang'); });
      },
      // 4 · code: trượt ngang và đọc bảng lưới hai chiều
      function (k, c) {
        c.nen(k, 'pg-xuong'); c.nen(k, 'md-san pg-gach');
        c.code(k, ['slide_right(2)', 'g = [[2, 1], [3, 2]]', 'for r in g:'], 10, 14);
        var r = c.xe(OMNI, {}, 0, 3, 180, Y); k.appendChild(r);
        truot(c, r, 1000, 250, Y, 0.7);
        c.sau(1800, function () { r.mat('vui'); c.keu('thang'); });
      }
    ],

    /* ---------------------------------------------------------------- 2 · Tay hất đá */
    'may-nem': [
      // 1 · tảng đá nằm trước hàng rào, xe omni chưa có tay hất
      function (k, c) {
        var s = c.san(k, ['##D##', '##=##', '##o.#'], 4, X0, Y0, 'mo-da'), p = s.o(3, 2);
        var r = c.xe(OMNI, {}, 0, 2, p.x, p.y); k.appendChild(r);
        diQua(c, s, r, [[2, 2]], 300, 500);
        hoi(k, c, '?', 130, 80, 1.0);
        c.sau(1100, function () { r.mat('ngac'); c.keu('loi'); });
      },
      // 2 · lắp tay hất đá vào mũi R1
      function (k, c) {
        c.nen(k, 'pg-xuong'); c.nen(k, 'md-san pg-gach');
        bayToi(k, c, c.ico('denNem', 3, BM.vang), 250, 40, 160, Y - 20, 0.1, 0.95);
        lap(k, c, c.xe(OMNI, {}, 1, 3, 150, Y), c.xe(OMNI_NEM, {}, 1, 3, 150, Y), 0.95);
      },
      // 3 · xúc đá rồi hất qua rào vào ô đích
      function (k, c) {
        var s = c.san(k, ['##*##', '##o##', '##.##'], 4, X0, Y0, 'mo-da'), p = s.o(2, 2);
        var r = c.xe(OMNI_NEM, {}, 0, 2, p.x, p.y); k.appendChild(r);
        var da = s.vat['2,1'];
        if (da) truot(c, da, 400, s.o(2, 0).x - 28, s.o(2, 0).y - 28, 0.7);
        c.sau(400, function () { c.keu('kep'); });
        c.sau(1300, function () { r.mat('vui'); c.keu('thang'); });
      },
      // 4 · code: load() và throw()
      function (k, c) {
        c.nen(k, 'pg-xuong'); c.nen(k, 'md-san pg-gach');
        c.code(k, ['load()', 'wait()', 'throw()', 'wait()'], 10, 14);
        var r = c.xe(OMNI_NEM, {}, 1, 3, 180, Y); k.appendChild(r);
        truot(c, r, 900, 230, Y, 0.6);
        c.sau(1600, function () { r.mat('vui'); c.keu('thang'); });
      }
    ],

    /* ---------------------------------------------------------------- 3 · Radar tròn */
    'radar-tron': [
      // 1 · đá và hố đổi chỗ mỗi ca, chưa có radar không biết bên nào có đá
      function (k, c) {
        var s = c.san(k, ['#*#*#', '#o#u#', '#...#'], 4, X0, Y0, 'mo-da'), p = s.o(2, 2);
        var r = c.xe(OMNI_NEM, {}, 0, 2, p.x, p.y); k.appendChild(r);
        hoi(k, c, '?', 130, 80, 0.8);
        c.sau(900, function () { r.mat('ngac'); c.keu('loi'); });
      },
      // 2 · lắp vòm Radar tròn lên nóc R1
      function (k, c) {
        c.nen(k, 'pg-xuong'); c.nen(k, 'md-san pg-gach');
        bayToi(k, c, c.ico('denCam', 3, BM.vang), 250, 40, 150, Y - 24, 0.1, 0.95);
        lap(k, c, c.xe(OMNI_NEM, {}, 1, 3, 150, Y), c.xe(OMNI_RADAR, { camBien: { bat: true, mat: true } }, 1, 3, 150, Y), 0.95);
      },
      // 3 · radar quét vòng 3x3, R1 trượt sang đúng cột có đá rồi hất vào đích
      function (k, c) {
        var s = c.san(k, ['#*#*#', '#o#u#', '#...#'], 4, X0, Y0, 'mo-da'), p = s.o(2, 2);
        var r = c.xe(OMNI_RADAR, { camBien: { bat: true, mat: true } }, 0, 2, p.x, p.y); k.appendChild(r);
        diQua(c, s, r, [[1, 2]], 400, 600);
        var da = s.vat['1,1'];
        if (da) truot(c, da, 1100, s.o(1, 0).x - 28, s.o(1, 0).y - 28, 0.6);
        c.sau(1800, function () { r.mat('vui'); c.keu('thang'); });
      },
      // 4 · code: g = radar(), kiểm tra g[r][c]
      function (k, c) {
        c.nen(k, 'pg-xuong'); c.nen(k, 'md-san pg-gach');
        c.code(k, ['g = radar()', 'if g[0][1] == "V":', '    lob()'], 10, 14);
        var r = c.xe(OMNI_RADAR, { camBien: { bat: true, mat: true } }, 1, 3, 180, Y); k.appendChild(r);
        truot(c, r, 900, 230, Y, 0.6);
        c.sau(1600, function () { r.mat('vui'); c.keu('thang'); });
      }
    ]
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = PHIM;
  if (goc && goc.PhimGoi) goc.PhimGoi.them(PHIM);
})(typeof window !== 'undefined' ? window : globalThis);
