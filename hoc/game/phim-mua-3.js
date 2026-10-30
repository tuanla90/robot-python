var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ============================================================================
   phim-mua-3.js — "Robot Chấn Hưng": DỮ LIỆU PHIM GÓI MÙA 3 "Mỏ quặng" (bộ máy chiếu: phim-goi.js, cùng cách phim-mua-2.js).
   Kịch bản: hoc/KE-HOACH-PHIM-GOI.md mục "3d. Kịch bản mùa 3"; nội dung gói: hoc/KE-HOACH-MUA-3.md (mảng MUA_3 trong lo-trinh-hoc.js).
   Mỗi mã gói một mảng 3–4 hàm khung (k, c): k = khung tranh 320×220, c = bộ dựng hình của PhimGoi (c.xe, c.san, c.code…).
   Lời khung n ở chu.js khóa 'pg.<mã gói>.<n>' (≤ 14 từ). Truyện nối phim gói 10 mùa 2: xe cứu hỏa R1 tới mỏ quặng, quặng sắt nằm bên kia khe nứt;
   mùa 3 em lắp chân nhện, nam châm, cảm biến từ, gặp R2 (nhện) rồi Xe thăm dò R1 xuất xưởng; phim cuối nhá mùa 4 "Thành phố" (cánh quạt, đầu sơn, mắt nhìn xuống).
   Hình: sân mini nhìn từ trên (san3: c.san cộng hố, gầm, đệm từ, quặng sắt, vật nam châm; ô 56 px, robot tỉ lệ 2) hay dải sàn (md-san, robot tỉ lệ 3).
   Hình mới của mùa 3 vẽ bằng PhimVector.oSan / vat / moQuang (phim-vector.js). R1 sơn mặc định (vector: xanh đội R1), R2 sơn lam (vector: hồng đội R2).
   Node (máy kiểm kiem-phim-goi.mjs) require tệp này lấy bảng PHIM (không chạy hàm vẽ nào).
   ========================================================================== */
(function (goc) {
  'use strict';

  var HN = [{ ma: 'hong-ngoai', o: 'tren' }], TU = [{ ma: 'tu', o: 'hong' }];
  var XHN = { than: 'xich', tay: 'hoi', camBien: HN };                   // xe cứu hỏa R1 cuối mùa 2
  var NHEN = { than: 'nhen', tay: null, camBien: [] };
  var NC = { than: 'hai-banh', tay: 'nam-cham', camBien: [] };            // gói 2, 6: xe hai bánh có nam châm
  var NCT = { than: 'hai-banh', tay: 'nam-cham', camBien: TU };           // gói 3, 7: thêm cảm biến từ
  var NB = { than: 'nhen', tay: 'nam-cham', camBien: [] };                // gói 9: nam châm bụng nhện
  var XTD = { than: 'nhen', tay: 'nam-cham', camBien: TU };               // Xe thăm dò R1 (gói 10)
  var R1X = { than: 'xich', tay: 'kep', camBien: [{ ma: 'khoang-cach', o: 'hong' }] };   // gói 8: R1 xe xích tay kẹp
  var R2N = { than: 'nhen', tay: null, camBien: [], son: 'lam' };         // gói 8: R2 nhện
  var HUY = ['nhen', 'nam-cham', 'cam-ung-tu', 'bai-tu', 'nhay', 'dao-cuc', 'doc-cuc', 'doi-xich-nhen', 'bung-nhen', 'tong-hop-3'];   // huy hiệu chương 1 mười gói bay trong phim gói 10
  var Y = 158;                                    // tâm thân robot khi đứng trên dải sàn (tỉ lệ 3)
  var TAT = { tay: { bat: false } }, HUT_N = { tay: { bat: true, cuc: 'N' } }, HUT_S = { tay: { bat: true, cuc: 'S' } };
  var DO = { camBien: { bat: true } }, CO = { than: { co: true } };

  /* ---------------------------------------------------------------- hình mùa 3 (PhimVector; dự phòng: div) */
  function PV() { return goc.PhimVector || null; }
  function oSan(c, ma, s, st) { return (PV() && PhimVector.oSan && PhimVector.oSan(ma, s, st)) || c.o('rug', s); }
  function vat(c, ma, s, st) { return (PV() && PhimVector.vat && PhimVector.vat(ma, s, st)) || c.o('crate', s); }
  function sat(c, s) { return vat(c, 'khoi-sat', s); }

  /**
   * Sân mini mùa 3: như c.san (ô 14·s) và thêm ký tự
   *   'u' hố (khe nứt) · 'n' gầm thấp · 'P' / 'Q' đệm từ N / S đang chạy (thường 'p' / 'q' đệm tắt) · 'i' quặng sắt · 'm' / 'w' vật nam châm N / S
   * Trả kq của c.san cộng: dem: { 'x,y': ô đệm (.dat(tat)) }, vat: { 'x,y': phần tử vật } (quặng, vật nam châm).
   */
  function san3(k, c, rows, s, x0, y0) {
    var kq = c.san(k, rows.map(function (r) { return r.replace(/[unPQpqimw]/g, '.'); }), s, x0, y0), canh = 14 * s;
    kq.dem = {}; kq.vat3 = {};
    rows.forEach(function (r, y) {
      for (var x = 0; x < r.length; x++) {
        var ch = r[x], px = x0 + x * canh, py = y0 + y * canh, khoa = x + ',' + y;
        if (ch === 'u' || ch === 'n') k.appendChild(c.dat(oSan(c, ch === 'u' ? 'ho' : 'gam', s), px, py));
        else if ('PQpq'.indexOf(ch) >= 0) {
          var o = c.dat(c.h('div'), px, py), cuc = ch === 'P' || ch === 'p' ? 'N' : 'S';
          o.dat = (function (o, cuc) { return function (tat) { o.innerHTML = ''; o.appendChild(oSan(c, 'dem-tu', s, { cuc: cuc, tat: !!tat })); }; })(o, cuc);
          o.dat(ch === 'p' || ch === 'q'); k.appendChild(kq.dem[khoa] = o);
        } else if (ch === 'i') k.appendChild(kq.vat3[khoa] = c.dat(sat(c, s), px, py));
        else if (ch === 'm' || ch === 'w') k.appendChild(kq.vat3[khoa] = c.dat(vat(c, 'nam-cham', s, { cuc: ch === 'm' ? 'N' : 'S' }), px, py));
      }
    });
    return kq;
  }

  /** Dời phần tử (left/top) sau ms, có trượt (lớp pg-truot, thời lượng giây). */
  function truot(c, e, ms, x, y, giay) {
    e.classList.add('pg-truot'); e.style.setProperty('--tg', (giay || 1) + 's');
    c.sau(ms, function () { e.style.setProperty('--tg', (giay || 1) + 's'); e.style.left = x + 'px'; if (y !== undefined) e.style.top = y + 'px'; });
  }
  /** Nhảy: robot r (tâm) bay vòng cung từ chỗ đang đứng tới (x, y) qua đỉnh cao `cao` px, bắt đầu ms. */
  function nhay(c, r, ms, x0, y0, x, y, cao) {
    truot(c, r, ms, (x0 + x) / 2, Math.min(y0, y) - cao, 0.3);
    truot(c, r, ms + 320, x, y, 0.3);
    c.sau(ms, function () { c.keu('buoc'); });
    c.sau(ms + 640, function () { c.keu('dam'); });
  }
  /** Chữ tượng thanh nhỏ (CẠCH!, TÍT TÍT!) ở (x, y), bật lên từ giây t. */
  function tieng(k, c, chu, x, y, t) { var e = c.chu('md-ram pg-cach', chu); e.style.left = x + 'px'; e.style.top = y + 'px'; e.style.fontSize = '24px'; e.style.animationDelay = t + 's'; k.appendChild(e); return e; }
  /** Dấu hỏi / chấm than trên đầu ở (x, y) từ giây t. */
  function hoi(k, c, chu, x, y, t) { var e = c.chu('md-hoi', chu); e.style.left = x + 'px'; e.style.top = y + 'px'; e.style.animationDelay = t + 's'; k.appendChild(e); return e; }
  /** Số / nhãn nhỏ bật lên ở (x, y) từ giây t. */
  function nhan(k, c, so, x, y, t) { var e = c.chu('md-hoi pg-nhip', so); e.style.left = x + 'px'; e.style.top = y + 'px'; e.style.animationDelay = t + 's'; k.appendChild(e); return e; }
  /** Món đồ (icon) bay từ (x0, y0) tới (x1, y1) xoay một vòng, biến mất lúc tới (giây t1). */
  function bayToi(k, c, e, x0, y0, x1, y1, t0, t1) {
    var vx = c.h('div', 'md-a md-vx'); vx.style.left = x0 + 'px'; vx.style.top = y0 + 'px'; vx.style.setProperty('--x', (x1 - x0) + 'px'); vx.style.animationDelay = t0 + 's';
    var vy = c.h('div', 'md-vy'); vy.style.setProperty('--y', (y1 - y0) + 'px'); vy.style.setProperty('--r', '360deg'); vy.style.animationDelay = t0 + 's';
    vy.appendChild(e); vx.appendChild(vy); k.appendChild(c.tu(vx, t1, true));
  }
  /** Robot cũ ẩn ở giây t, robot mới hiện đúng chỗ đó: lắp bộ phận, CẠCH! */
  function lap(k, c, cu, moi, t) { k.appendChild(c.tu(cu, t, true)); k.appendChild(c.tu(moi, t)); var cach = c.chu('md-ram pg-cach', 'CẠCH!'); cach.style.animationDelay = t + 's'; k.appendChild(cach); c.sau(t * 1000, function () { c.keu('kep'); }); }
  /** Sóng từ (ba cung) ở (x, y) hướng sang phải, hiện từ giây t (cảm biến từ dò). */
  function songTu(k, c, x, y, t, trai) {
    [0, 1, 2].forEach(function (i) {
      var w = 14 + i * 10, e = c.dat(c.h('div', 'pg-nhay'), trai ? x - w / 2 - i * 4 : x - w / 2 + i * 4, y - w / 2);
      e.style.width = e.style.height = w + 'px'; e.style.borderRadius = '50%'; e.style.border = '2px solid ' + BM.xanhLoSang2;
      if (trai) e.style.borderRightColor = e.style.borderTopColor = e.style.borderBottomColor = 'transparent';
      else e.style.borderLeftColor = e.style.borderTopColor = e.style.borderBottomColor = 'transparent';
      e.style.animationDelay = (i * 0.2) + 's'; k.appendChild(c.tu(e, t));
    });
  }
  /** Huy hiệu ma (trạng thái xong) cạnh 36 px (HuyHieu.mk vector); chưa có bản vector thì sao. */
  function huyHieu(c, ma) {
    var HH = goc.HuyHieu;
    try { if (HH && HH.maVec && HH.maVec(ma) && HH.mk) { var v = HH.mk(ma, 'xong', 1); if (v && v.laVector) return v; } } catch (e) { /* rơi về sao */ }
    return c.sao(2);
  }
  /** Chữ qua t() của chu.js (Node không có t: trả khóa). */
  function t2(khoa) { return typeof t === 'function' ? t(khoa) : khoa; }
  /** Đặt nhãn tên robot lên đầu bảng code. */
  function bangTen(c, bang, ten, cls) { var d = c.h('div', 'pg-ten ' + (cls || ''), ten); bang.insertBefore(d, bang.firstChild); }
  /** Nền ngoài trời ở mỏ: trời, đồi, cửa hầm mỏ (PhimVector.moQuang) bên phải, dải đất. */
  function nenMo(k, c, coHam) {
    c.nen(k, 'pg-troi'); c.nen(k, 'pg-doi pg-doi-xa');
    if (coHam !== false) { var m = PV() && PhimVector.moQuang && PhimVector.moQuang(84, 56); if (m) k.appendChild(c.dat(m, 226, 46)); }
    c.nen(k, 'md-san pg-dat');
  }

  var C1 = 56, X0 = 20, Y0 = 26;                  // sân mini: ô 14·4 = 56 px, góc (20, 26), 5 × 3 ô

  var PHIM = {
    /* ---------------------------------------------------------------- 1 · Nhện */
    'nhen': [
      // 1 · đơn việc (KE-HOACH-PHIM-GOI.md mục 3c): ở mỏ quặng, quặng sắt nằm bên kia khe nứt; xe cứu hỏa R1 dừng ở mép, "?"
      function (k, c) {
        var s = san3(k, c, ['##.##', '..u.i', '##.##'], 4, X0, Y0), p = s.o(1, 1);
        var r = c.xe(XHN, {}, 1, 2, s.o(0, 1).x, p.y); k.appendChild(r);
        truot(c, r, 100, p.x, p.y, 0.8);
        hoi(k, c, '?', p.x - 6, 4, 1.1);
        c.sau(1100, function () { r.mat('ngac'); c.keu('loi'); });
      },
      // 2 · bốn chân nhện bay tới, R1 thành nhện, CẠCH!
      function (k, c) {
        nenMo(k, c);
        var cu = c.xe(XHN, {}, 1, 3, 130, Y), moi = c.xe(NHEN, {}, 1, 3, 130, Y);
        bayToi(k, c, c.ico('denChan', 3, BM.vang), 250, 150, 116, Y - 20, 0.1, 0.95);
        lap(k, c, cu, moi, 0.95);
        c.sau(1200, function () { moi.mat('vui'); });
      },
      // 3 · nhện bước từng ô, chui qua gầm thấp, tới quặng
      function (k, c) {
        var s = san3(k, c, ['#####', '..n.i', '#####'], 4, X0, Y0), r = c.xe(NHEN, {}, 1, 2, s.o(0, 1).x, s.o(0, 1).y); k.appendChild(r);
        [1, 2, 3].forEach(function (x, i) { truot(c, r, 300 + i * 700, s.o(x, 1).x, s.o(x, 1).y, 0.5); c.sau(300 + i * 700, function () { c.keu('buoc'); }); });
        c.sau(950, function () { r.ve(CO); });
        c.sau(1700, function () { r.ve({}); });
        c.sau(2400, function () { r.mat('vui'); c.keu('thang'); });
      },
      // 4 · code go_right() go_down(): mỗi lệnh một ô
      function (k, c) {
        c.nen(k, 'md-san');
        c.code(k, ['go_right()', 'go_right()', 'go_down()'], 10, 14);
        var r = c.xe(NHEN, {}, 1, 3, 190, 110); k.appendChild(r);
        truot(c, r, 1200, 232, 110, 0.5); truot(c, r, 1600, 274, 110, 0.5); truot(c, r, 2000, 274, 152, 0.5);
        [1200, 1600, 2000].forEach(function (t) { c.sau(t, function () { c.keu('buoc'); }); });
        c.sau(2600, function () { r.mat('vui'); c.keu('thang'); });
      }
    ],

    /* ---------------------------------------------------------------- 2 · Nam châm */
    'nam-cham': [
      // 1 · quặng sắt rải rác; xe hai bánh không có gì để nhặt
      function (k, c) {
        var s = san3(k, c, ['#####', '...i.', '#i###'], 4, X0, Y0), p = s.o(1, 1);
        var r = c.xe({ than: 'hai-banh', tay: null, camBien: [] }, {}, 1, 2, p.x, p.y); k.appendChild(r);
        hoi(k, c, '?', p.x - 6, 4, 0.6);
        c.sau(600, function () { r.mat('ngac'); c.keu('loi'); });
      },
      // 2 · nam châm chữ U bay lên mũi xe, CẠCH!
      function (k, c) {
        var s = san3(k, c, ['#####', '...i.', '#i###'], 4, X0, Y0), p = s.o(1, 1);
        bayToi(k, c, c.ico('denNamCham', 3, BM.do), 260, 150, p.x + 10, p.y - 14, 0.1, 0.95);
        lap(k, c, c.xe({ than: 'hai-banh', tay: null, camBien: [] }, {}, 1, 2, p.x, p.y), c.xe(NC, TAT, 1, 2, p.x, p.y).mat('vui'), 0.95);
      },
      // 3 · magnet_n(): khối sắt trước mũi bị hút dính vào xe
      function (k, c) {
        var s = san3(k, c, ['#####', '...i.', '#####'], 4, X0, Y0), p = s.o(1, 1), q = s.o(3, 1);
        var r = c.xe(NC, TAT, 1, 2, p.x, p.y); k.appendChild(r);
        c.sau(500, function () { r.ve(HUT_N); c.keu('quet'); });
        truot(c, s.vat3['3,1'], 700, s.o(2, 1).x - C1 / 2 - 6, q.y - C1 / 2, 0.5);
        tieng(k, c, 'CẠCH!', p.x - 10, 150, 1.2);
        c.sau(1300, function () { r.mat('vui'); c.keu('thang'); });
      },
      // 4 · code magnet_n() / magnet_off(): bật hút, tắt thì vật rơi
      function (k, c) {
        c.nen(k, 'md-san');
        c.code(k, ['magnet_n()', 'move()', 'magnet_off()'], 10, 14);
        var r = c.xe(NC, HUT_N, 1, 3, 180, Y); k.appendChild(r);
        var v = c.dat(sat(c, 3), 220, Y - 21); k.appendChild(v);
        truot(c, r, 1300, 222, Y, 0.6); truot(c, v, 1300, 262, Y - 21, 0.6);
        c.sau(2000, function () { r.ve(TAT); c.keu('kep'); });
        truot(c, v, 2100, 266, Y - 10, 0.3);
        c.sau(2500, function () { r.mat('vui'); c.keu('thang'); });
      }
    ],

    /* ---------------------------------------------------------------- 3 · Cảm biến từ (dò sắt) */
    'cam-ung-tu': [
      // 1 · thùng gỗ và quặng sắt lẫn trong đống đổ nát: cục nào là sắt?
      function (k, c) {
        var s = san3(k, c, ['#o#o#', '....i', '#####'], 4, X0, Y0), p = s.o(1, 1);
        var r = c.xe(NC, TAT, 1, 2, p.x, p.y); k.appendChild(r);
        hoi(k, c, '?', p.x + 40, 4, 0.6);
        c.sau(600, function () { r.mat('ngac'); c.keu('loi'); });
      },
      // 2 · cảm biến từ lăn ra, gắn bên hông như máy dò kim loại, CẠCH!
      function (k, c) {
        c.nen(k, 'md-san');
        var den = c.dat(c.ico('denCam', 3, BM.xanhLoSang2), -30, 164, 'pg-lan'); den.style.setProperty('--x', '120px'); k.appendChild(c.tu(den, 1.4, true));
        lap(k, c, c.xe(NC, TAT, 1, 3, 130, Y), c.xe(NCT, TAT, 1, 3, 130, Y).mat('vui'), 1.4);
        c.sau(400, function () { c.keu('buoc'); });
      },
      // 3 · gặp sắt phía trước: sóng từ, TÍT TÍT!
      function (k, c) {
        var s = san3(k, c, ['#o#o#', '....i', '#####'], 4, X0, Y0), r = c.xe(NCT, TAT, 1, 2, s.o(1, 1).x, s.o(1, 1).y); k.appendChild(r);
        truot(c, r, 300, s.o(3, 1).x, s.o(3, 1).y, 1);
        c.sau(1400, function () { r.ve(Object.assign({}, TAT, DO)); c.keu('quet'); });
        songTu(k, c, s.o(3, 1).x + 34, s.o(3, 1).y, 1.4);
        tieng(k, c, 'TÍT TÍT!', 150, 150, 1.6);
        c.sau(1800, function () { r.mat('vui'); });
      },
      // 4 · code if front_metal(): magnet_n()
      function (k, c) {
        c.nen(k, 'md-san');
        c.code(k, ['if front_metal():', '    magnet_n()'], 10, 14);
        var r = c.xe(NCT, TAT, 1, 3, 190, Y); k.appendChild(r);
        var v = c.dat(sat(c, 3), 250, Y - 21); k.appendChild(v);
        c.sau(1100, function () { r.ve(Object.assign({}, TAT, DO)); c.keu('quet'); });
        songTu(k, c, 236, Y, 1.1);
        c.sau(1700, function () { r.ve(Object.assign({}, HUT_N, DO)); });
        truot(c, v, 1800, 232, Y - 21, 0.4);
        c.sau(2300, function () { r.mat('vui'); c.keu('thang'); });
      }
    ],

    /* ---------------------------------------------------------------- 4 · Bãi từ (đệm từ, nút tắt đệm) */
    'bai-tu': [
      // 1 · bãi từ: đệm N, đệm S nằm khắp sàn mỏ
      function (k, c) {
        var s = san3(k, c, ['P.Q.P', '.Q.P.', 'Q.P.Q'], 4, X0, Y0);
        var r = c.xe(NC, TAT, 1, 2, s.o(2, 0).x, s.o(1, 1).y); k.appendChild(r);
        hoi(k, c, '!', s.o(2, 0).x - 6, 4, 0.6);
        c.sau(600, function () { r.mat('ngac'); c.keu('moKhoa'); });
      },
      // 2 · nam châm N khác cực đệm S: xe bị hút trượt tới đệm
      function (k, c) {
        var s = san3(k, c, ['#####', '....Q', '#####'], 4, X0, Y0), r = c.xe(NC, TAT, 1, 2, s.o(1, 1).x, s.o(1, 1).y); k.appendChild(r);
        c.sau(500, function () { r.ve(HUT_N); c.keu('quet'); r.mat('ngac'); });
        truot(c, r, 800, s.o(3, 1).x, s.o(3, 1).y, 0.6);
        tieng(k, c, 'VÈO!', 120, 150, 1.0);
      },
      // 3 · đệm đang hút giữ quặng; nhện đè nút, đệm tắt, quặng mới nhấc được
      function (k, c) {
        var s = san3(k, c, ['#####', 'M.Qi.', '#####'], 4, X0, Y0), r = c.xe(NHEN, {}, 1, 2, s.o(0, 0).x, s.o(0, 0).y + 20);
        k.appendChild(r); truot(c, r, 300, s.o(0, 1).x, s.o(0, 1).y, 0.6);
        c.sau(1000, function () { s.nut['0,1'].dat(true); s.dem['2,1'].dat(true); c.keu('moKhoa'); });
        tieng(k, c, 'TẮT!', 120, 150, 1.1);
        c.sau(1400, function () { r.mat('vui'); c.keu('thang'); });
      }
    ],

    /* ---------------------------------------------------------------- 5 · Nhảy */
    'nhay': [
      // 1 · khe nứt rộng một ô: bước thường thì rơi
      function (k, c) {
        var s = san3(k, c, ['#####', '.u.i.', '#####'], 4, X0, Y0), r = c.xe(NHEN, {}, 1, 2, s.o(0, 1).x, s.o(0, 1).y); k.appendChild(r);
        hoi(k, c, '?', s.o(0, 1).x - 6, 4, 0.6);
        c.sau(600, function () { r.mat('ngac'); c.keu('loi'); });
      },
      // 2 · nhện co chân lấy đà
      function (k, c) {
        var s = san3(k, c, ['#####', '.u.i.', '#####'], 4, X0, Y0), r = c.xe(NHEN, {}, 1, 2, s.o(0, 1).x, s.o(0, 1).y); k.appendChild(r);
        c.sau(500, function () { r.ve(CO); c.keu('kep'); });
        tieng(k, c, 'NHÚN!', 40, 150, 0.6);
      },
      // 3 · bật! nhện nhảy qua hố, đáp xuống ô bên kia
      function (k, c) {
        var s = san3(k, c, ['#####', '.u.i.', '#####'], 4, X0, Y0), a = s.o(0, 1), b = s.o(2, 1), r = c.xe(NHEN, CO, 1, 2, a.x, a.y); k.appendChild(r);
        c.sau(400, function () { r.ve({}); });
        nhay(c, r, 450, a.x, a.y, b.x, b.y, 40);
        tieng(k, c, 'BẬT!', 70, 6, 0.5);
        c.sau(1300, function () { r.mat('vui'); c.keu('thang'); });
      },
      // 4 · code jump("R"): một lệnh, qua hố
      function (k, c) {
        c.nen(k, 'md-san');
        c.code(k, ['go_right()', 'jump("R")', 'go_right()'], 10, 14);
        var h = c.dat(oSan(c, 'ho', 3), 210, Y - 21); k.appendChild(h);
        var r = c.xe(NHEN, {}, 1, 3, 150, Y); k.appendChild(r);
        truot(c, r, 1100, 188, Y, 0.4); c.sau(1100, function () { c.keu('buoc'); });
        nhay(c, r, 1600, 188, Y, 272, Y, 46);
        c.sau(2600, function () { r.mat('vui'); c.keu('thang'); });
      }
    ],

    /* ---------------------------------------------------------------- 6 · Đảo cực */
    'dao-cuc': [
      // 1 · vật nam châm cực N trước mũi: bật N, cùng cực nên bị đẩy ra
      function (k, c) {
        var s = san3(k, c, ['#####', '..m..', '#####'], 4, X0, Y0), p = s.o(1, 1), q = s.o(2, 1), r = c.xe(NC, TAT, 1, 2, p.x, p.y); k.appendChild(r);
        c.sau(500, function () { r.ve(HUT_N); c.keu('quet'); });
        truot(c, s.vat3['2,1'], 700, q.x - C1 / 2 + 2 * C1, q.y - C1 / 2, 0.6);
        tieng(k, c, 'ĐẨY!', 150, 150, 0.9);
        c.sau(1100, function () { r.mat('ngac'); });
      },
      // 2 · magnet_s(): khác cực, vật bị hút về mũi xe
      function (k, c) {
        var s = san3(k, c, ['#####', '....m', '#####'], 4, X0, Y0), p = s.o(1, 1), q = s.o(4, 1), r = c.xe(NC, TAT, 1, 2, p.x, p.y); k.appendChild(r);
        c.sau(500, function () { r.ve(HUT_S); c.keu('quet'); });
        truot(c, s.vat3['4,1'], 700, s.o(2, 1).x - C1 / 2 - 10, q.y - C1 / 2, 0.7);
        tieng(k, c, 'HÚT!', 150, 150, 1.1);
        c.sau(1400, function () { r.mat('vui'); c.keu('thang'); });
      },
      // 3 · code magnet_s() / magnet_n(): hai cực, hút về hay đẩy đi
      function (k, c) {
        c.nen(k, 'md-san');
        c.code(k, ['magnet_s()', 'back()', 'magnet_n()'], 10, 14);
        var r = c.xe(NC, HUT_S, 1, 3, 190, Y); k.appendChild(r);
        var v = c.dat(vat(c, 'nam-cham', 3, { cuc: 'N' }), 230, Y - 21); k.appendChild(v);
        truot(c, r, 1300, 160, Y, 0.5); truot(c, v, 1300, 200, Y - 21, 0.5);
        c.sau(2000, function () { r.ve(HUT_N); c.keu('quet'); });
        truot(c, v, 2100, 270, Y - 21, 0.5);
        c.sau(2700, function () { r.mat('vui'); c.keu('thang'); });
      }
    ],

    /* ---------------------------------------------------------------- 7 · Đọc cực */
    'doc-cuc': [
      // 1 · hai vật nam châm giống hệt nhau: cực nào là N?
      function (k, c) {
        c.nen(k, 'md-san');
        var r = c.xe(NCT, TAT, 1, 3, 110, Y); k.appendChild(r);
        [200, 256].forEach(function (x, i) {                                      // chưa biết cực: hai khối trơn giống hệt, dấu ? trên mỗi khối
          k.appendChild(c.dat(sat(c, 3), x, Y - 21));
          nhan(k, c, '?', x + 14, Y - 62, 0.4 + i * 0.3);
        });
        c.sau(600, function () { r.mat('ngac'); c.keu('loi'); });
      },
      // 2 · cảm biến từ đọc cực của vật phía trước: hiện chữ N
      function (k, c) {
        c.nen(k, 'md-san');
        var r = c.xe(NCT, TAT, 1, 3, 150, Y); k.appendChild(r);
        k.appendChild(c.dat(vat(c, 'nam-cham', 3, { cuc: 'N' }), 192, Y - 21));
        c.sau(400, function () { r.ve(Object.assign({}, TAT, DO)); c.keu('quet'); });
        songTu(k, c, 190, Y, 0.4);
        nhan(k, c, 'N', 206, 82, 0.9);
        c.sau(1200, function () { r.mat('vui'); });
      },
      // 3 · code if front_pole() == "N": magnet_s()
      function (k, c) {
        c.nen(k, 'md-san');
        c.code(k, ['if front_pole() == "N":', '    magnet_s()', 'else:', '    magnet_n()'], 10, 14);
        var r = c.xe(NCT, TAT, 1, 3, 150, Y); k.appendChild(r);
        var v = c.dat(vat(c, 'nam-cham', 3, { cuc: 'N' }), 230, Y - 21); k.appendChild(v);
        c.sau(1500, function () { r.ve(Object.assign({}, TAT, DO)); c.keu('quet'); });
        c.sau(2000, function () { r.ve(Object.assign({}, HUT_S, DO)); });
        truot(c, v, 2100, 192, Y - 21, 0.5);
        c.sau(2700, function () { r.mat('vui'); c.keu('thang'); });
      }
    ],

    /* ---------------------------------------------------------------- 8 · Đội xích và nhện (R1 xe xích tay kẹp, R2 nhện sơn lam) */
    'doi-xich': [
      // 1 · R2 tới mỏ: lần này R2 là nhện, R1 lái xe xích
      function (k, c) {
        nenMo(k, c);
        var r1 = c.xe(R1X, {}, 1, 3, 90, Y); k.appendChild(r1);
        var r2 = c.xe(R2N, {}, 3, 3, 360, Y); k.appendChild(r2);
        truot(c, r2, 200, 210, Y, 1.2);
        for (var i = 0; i < 4; i++) c.sau(250 + i * 280, function () { c.keu('buoc'); });
        c.sau(1500, function () { r1.mat('vui'); r2.mat('vui'); c.keu('thang'); });
      },
      // 2 · nhện nhảy qua khe đè nút, cửa mở cho xe xích chở hàng
      function (k, c) {
        var s = san3(k, c, ['#.u.M', '.o..C', '#####'], 4, X0, Y0), a = s.o(1, 0), b = s.o(3, 0);
        var r2 = c.xe(R2N, {}, 1, 2, a.x, a.y); k.appendChild(r2);
        var r1 = c.xe(R1X, { tay: { tuThe: 'tren', kep: 'dong', cam: true } }, 1, 2, s.o(0, 1).x, s.o(0, 1).y); k.appendChild(r1);
        s.vat['1,1'].remove();
        nhay(c, r2, 300, a.x, a.y, b.x, b.y, 30);
        truot(c, r2, 1200, s.o(4, 0).x, s.o(4, 0).y, 0.4);
        c.sau(1650, function () { s.nut['4,0'].dat(true); s.cua['4,1'].dat(true); c.keu('moKhoa'); });
        truot(c, r1, 1900, s.o(3, 1).x, s.o(3, 1).y, 1.2);
        c.sau(3200, function () { r1.mat('vui'); r2.mat('vui'); c.keu('thang'); });
      },
      // 3 · hai bảng code: R1 chờ, R2 nhảy; chạy cùng nhịp
      function (k, c) {
        c.nen(k, 'md-san');
        bangTen(c, c.code(k, ['wait_n(4)', 'move()', 'move()'], 10, 14), 'R1', 'r1');
        bangTen(c, c.code(k, ['jump("R")', 'go_right()'], 168, 14), 'R2', 'r2');
        k.appendChild(c.xe(R1X, {}, 1, 3, 80, Y).mat('vui'));
        k.appendChild(c.xe(R2N, {}, 1, 3, 240, Y).mat('vui'));
        c.sau(1600, function () { c.keu('thang'); });
      }
    ],

    /* ---------------------------------------------------------------- 9 · Nam châm bụng nhện */
    'bung-nhen': [
      // 1 · đường hầm hẹp: quặng nằm dưới chỗ nhện đứng, tay không với tới
      function (k, c) {
        var s = san3(k, c, ['#####', '.ni.u', '#####'], 4, X0, Y0), r = c.xe(NHEN, {}, 1, 2, s.o(0, 1).x, s.o(0, 1).y); k.appendChild(r);
        truot(c, r, 200, s.o(2, 1).x, s.o(2, 1).y, 1.2);
        c.sau(500, function () { r.ve(CO); }); c.sau(1100, function () { r.ve({}); });
        hoi(k, c, '?', s.o(2, 1).x - 6, 4, 1.5);
        c.sau(1500, function () { r.mat('ngac'); c.keu('loi'); });
      },
      // 2 · nam châm bụng bật: quặng dính dưới bụng
      function (k, c) {
        var s = san3(k, c, ['#####', '.ni.u', '#####'], 4, X0, Y0), p = s.o(2, 1);
        bayToi(k, c, c.ico('denNamCham', 3, BM.do), 260, 160, p.x - 10, p.y - 14, 0.1, 0.9);
        lap(k, c, c.xe(NHEN, {}, 1, 2, p.x, p.y), c.xe(NB, TAT, 1, 2, p.x, p.y), 0.9);
        k.appendChild(c.tu(c.xe(NB, HUT_N, 1, 2, p.x, p.y).mat('vui'), 1.5));
        c.sau(1500, function () { s.vat3['2,1'].style.opacity = '0.55'; c.keu('quet'); });
      },
      // 3 · nhện mang quặng nhảy qua khe, thả đúng ô đích
      function (k, c) {
        var s = san3(k, c, ['#####', '..u.*', '#####'], 4, X0, Y0), a = s.o(1, 1), b = s.o(3, 1);
        var v = c.dat(sat(c, 4), a.x - C1 / 2, a.y - C1 / 2); k.appendChild(v); v.style.opacity = '0.55';
        var r = c.xe(NB, HUT_N, 1, 2, a.x, a.y); k.appendChild(r);
        nhay(c, r, 400, a.x, a.y, b.x, b.y, 34); nhay(c, v, 400, a.x - C1 / 2, a.y - C1 / 2, b.x - C1 / 2, b.y - C1 / 2, 34);
        truot(c, r, 1300, s.o(4, 1).x, b.y, 0.4); truot(c, v, 1300, s.o(4, 1).x - C1 / 2, b.y - C1 / 2, 0.4);
        c.sau(1900, function () { r.ve(TAT); v.style.opacity = '1'; c.keu('kep'); });
        c.sau(2300, function () { r.mat('vui'); c.keu('thang'); });
      }
    ],

    /* ---------------------------------------------------------------- 10 · Xe thăm dò R1 xuất xưởng (mã gói tong-hop-3; khuôn "cỗ máy xuất xưởng" mục 3c; nhá mùa 4) */
    'tong-hop-3': [
      // 1 · R1 đủ bộ giữa mỏ, mười huy hiệu mùa 3 bay quanh
      function (k, c) {
        c.nen(k, 'md-san');
        k.appendChild(c.xe(XTD, DO, 1, 3, 150, Y, 'md-nhun').mat('vui'));
        var cho = [[30, 30], [110, 14], [196, 14], [262, 40], [20, 100], [266, 104], [64, 60], [222, 72], [70, 128], [220, 132]];
        HUY.forEach(function (m, i) {
          var o = c.dat(c.h('div', 'pg-bay'), cho[i][0], cho[i][1]); o.style.animationDelay = (-i * 0.3) + 's';
          var p = c.dat(c.h('div', 'md-pop'), 0, 0); p.style.animationDelay = (0.2 + i * 0.15) + 's'; p.appendChild(huyHieu(c, m));
          o.appendChild(p); k.appendChild(o);
        });
        c.sau(300, function () { c.keu('thang'); });
      },
      // 2 · tem XUẤT XƯỞNG: "Xe thăm dò R1" + ba part: chân nhện, nam châm, cảm biến từ (máy dò sắt)
      function (k, c) {
        c.nen(k, 'md-san');
        var r = c.xe(XTD, DO, 1, 3, 160, Y); k.appendChild(r);
        c.sau(300, function () { r.mat('ngac'); });
        c.sau(2100, function () { r.mat('vui'); });
        var v = PV() && PhimVector.xuatXuong({ tem: t2('pg.tem.xuat-xuong'), ten: t2('pg.tem.xe-tham-do'), part: [['denChan', BM.vang], ['denNamCham', BM.do], ['denCam', BM.xanhLoSang2]], t: 1 });
        if (v) k.appendChild(c.dat(v, 70, 10));
        c.sau(1000, function () { c.keu('dam'); });
        c.sau(1900, function () { c.keu('thang'); });
      },
      // 3 · quặng bên kia khe nứt về tới bãi (việc kẹt ở nhen.1 được gỡ)
      function (k, c) {
        var s = san3(k, c, ['##.##', '*.u.i', '##.##'], 4, X0, Y0), a = s.o(4, 1), b = s.o(1, 1);
        var r = c.xe(XTD, DO, 3, 2, s.o(3, 1).x, a.y); k.appendChild(r);
        var v = s.vat3['4,1'];
        c.sau(300, function () { c.keu('quet'); });
        songTu(k, c, s.o(3, 1).x + 30, a.y, 0.3);
        truot(c, r, 700, a.x, a.y, 0.4);
        c.sau(1100, function () { r.ve(Object.assign({}, HUT_N, DO)); v.style.opacity = '0.55'; c.keu('kep'); });
        nhay(c, r, 1500, a.x, a.y, b.x, b.y, 40); nhay(c, v, 1500, a.x - C1 / 2, a.y - C1 / 2, b.x - C1 / 2, b.y - C1 / 2, 40);
        truot(c, r, 2400, s.o(0, 1).x, b.y, 0.4); truot(c, v, 2400, s.o(0, 1).x - C1 / 2, b.y - C1 / 2, 0.4);
        c.sau(2900, function () { r.ve(DO); v.style.opacity = '1'; r.mat('vui'); c.keu('thang'); });
      },
      // 4 · ngoài mỏ, phía thành phố xa xa nhấp nháy: cánh quạt, đầu sơn, mắt nhìn xuống (nhá mùa 4: drone kẻ vạch ở thành phố)
      function (k, c) {
        nenMo(k, c, false);
        var nm = PV() && PhimVector.nhaMay(84, 56, true); if (nm) k.appendChild(c.dat(nm, 222, 64));
        var r = c.xe(XTD, DO, 1, 3, -40, Y); k.appendChild(r);
        truot(c, r, 100, 110, Y, 1.4);
        for (var i = 0; i < 5; i++) c.sau(200 + i * 260, function () { c.keu('buoc'); });
        [['denCanh', 196, 44], ['denSon', 244, 30], ['denCam', 284, 50]].forEach(function (d, i) {
          var e = c.dat(c.ico(d[0], 2, i === 2 ? BM.xanhLoSang2 : BM.vang), d[1], d[2], 'pg-nhay'); e.style.animationDelay = (i * 0.25) + 's';
          k.appendChild(c.tu(e, 1.6 + i * 0.3));
        });
        hoi(k, c, '?', 150, 70, 2.6);
        c.sau(1600, function () { r.mat('ngac'); c.keu('moKhoa'); });
      }
    ]
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = PHIM;
  if (goc && goc.PhimGoi) goc.PhimGoi.them(PHIM);
})(typeof window !== 'undefined' ? window : globalThis);
