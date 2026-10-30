var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ============================================================================
   phim-mua-4.js — "Mật Lệnh Robot": DỮ LIỆU PHIM GÓI MÙA 4 "Thành phố" (bộ máy chiếu: phim-goi.js, cùng cách phim-mua-1.js, phim-mua-2.js; phiên "Mùa 4", 30/10).
   Kịch bản: hoc/KE-HOACH-PHIM-GOI.md mục "Kịch bản mùa 4"; nội dung gói: hoc/KE-HOACH-MUA-4.md (mảng MUA_4 trong lo-trinh-hoc.js).
   Mỗi mã gói một mảng 3–4 hàm khung (k, c): k = khung tranh 320×220, c = bộ dựng hình của PhimGoi (c.xe, c.san, c.code…). Lời khung n ở chu.js khóa 'pg.<mã gói>.<n>' (≤ 14 từ).
   Truyện (khuôn mục 3c): thành phố mới có vạch kẻ đường mờ hết, xe đi lộn xộn (đơn việc ở gói 1); em lắp cánh quạt cho R1 thành drone, rồi máy sơn, camera bốn hướng,
   nâng cấp đáp sạc, bút liền, mắt nhìn dưới chân; R2 trở lại ở gói đội; gói 9 gắn máy sơn dưới bụng drone; gói 10 "Drone kẻ vạch R1 xuất xưởng", phim cuối nhá mùa 5 (sân bóng).
   Hình: sân mini nhìn từ trên (c.san, ô 56 px, robot tỉ lệ 2) hay dải sàn (robot tỉ lệ 3). Ô của mùa 4 (sàn màu, hộp màu, ô sạc P, hàng rào, hố, ô đích màu, ô đã sơn)
   vẽ bằng VeVector (cùng hình trên sân chơi); không có VeVector (máy kiểm Node, DOM giả) thì là div tô màu.
   Node (máy kiểm kiem-phim-goi.mjs) require tệp này lấy bảng PHIM (không chạy hàm vẽ nào).
   ========================================================================== */
(function (goc) {
  'use strict';

  var CAM = { ma: 'camera-4', o: 'tren' }, CAM_DUOI = { ma: 'camera-4', o: 'tren', taiCho: true };
  var XE = { than: 'hai-banh', tay: null, camBien: [] };
  var XE_SON = { than: 'hai-banh', tay: 'son', camBien: [] };
  var XE_CAM = { than: 'hai-banh', tay: null, camBien: [CAM] };
  var DRONE = { than: 'drone', tay: null, camBien: [] };
  var DRONE_CAM = { than: 'drone', tay: 'nam-cham', camBien: [CAM] };
  var DRONE_DUOI = { than: 'drone', tay: 'nam-cham', camBien: [CAM_DUOI] };
  var DRONE_SON = { than: 'drone', tay: 'son', camBien: [CAM_DUOI] };                            // Drone kẻ vạch R1 (gói 9, 10)
  var R1_NC = { than: 'hai-banh', tay: 'nam-cham', camBien: [{ ma: 'khoang-cach', o: 'hong' }] };    // gói 8: R1 xe nam châm
  var R2 = { than: 'hai-banh', tay: 'kep', camBien: [CAM], son: 'lam' };                          // gói 8: R2 xe kẹp + camera, sơn lam
  var MAU = { r: 'red', g: 'green', b: 'blue', y: 'yellow' };
  var MAU_DU_PHONG = { red: BM.do, green: BM.xanhLa, blue: BM.lamSang, yellow: BM.vang };
  var Y = 158;                                    // tâm thân robot trên dải sàn (tỉ lệ 3)
  var X0 = 20, Y0 = 26, C1 = 56;                  // sân mini: ô 14·4 = 56 px, góc (20, 26), 5 × 3 ô

  /* ---------------------------------------------------------------- hình ô mùa 4 (VeVector; dự phòng: div tô màu) */
  function VV() { var V = goc.VeVector; return V && V.bat && V.bat() ? V : null; }
  /** Ô / vật cạnh 14·s vẽ bằng VeVector (loai 'o' | 'vat', mã, trạng thái); không có thì div màu mauDp. */
  function veV(c, loai, ma, s, tt, mauDp) {
    var canh = 14 * s, V = VV(), e = null;
    if (V) {
      try {
        var n = Math.max(1, Math.round(canh * (goc.devicePixelRatio || 1) * 2));
        var src = loai === 'vat' ? V.vat(ma, n, tt || {}) : V.o(ma, n, tt || {});
        e = goc.document.createElement('canvas'); e.width = e.height = n; e.style.width = e.style.height = canh + 'px';
        e.getContext('2d').drawImage(src, 0, 0, n, n);
        e.className = 'pxi'; e.laVector = true;                                     // như canvas của PhimVector (máy kiểm B2: mọi canvas trong phim là vector)
      } catch (err) { e = null; }
    }
    if (!e) { e = c.h('div'); e.style.width = e.style.height = canh + 'px'; e.style.borderRadius = '4px'; e.style.background = mauDp || BM.xam; }
    return e;
  }
  function oMau(c, m, s) { return veV(c, 'o', 'san-mau', s, { mau: m }, MAU_DU_PHONG[m]); }
  function hop(c, m, s) { return veV(c, 'vat', 'khoi-sat', s, m ? { mau: m } : {}, MAU_DU_PHONG[m] || BM.xam); }

  /**
   * Sân mini mùa 4: rows như c.san ('.' '#' 'o' 'F' '*') và thêm '=' rào · 'u' hố · 'P' ô sạc · 'D' ô đích; lop: { mau: sàn màu, dich: màu ô đích, hop: hộp màu } (mảng chuỗi r g b y .).
   * Trả về kq của c.san cộng: hop { 'x,y': phần tử hộp }, to(x, y, mau, t): ô (x, y) được sơn màu mau ở giây t (lớp sơn nằm dưới robot).
   */
  function san4(k, c, rows, lop, s, x0, y0) {
    s = s || 4; x0 = x0 === undefined ? X0 : x0; y0 = y0 === undefined ? Y0 : y0; lop = lop || {};
    var kq = c.san(k, rows.map(function (r) { return r.replace(/[=uPD]/g, '.'); }), s, x0, y0), canh = 14 * s;
    var lopSon = c.dat(c.h('div'), 0, 0); kq.hop = {};
    function ky(ds, x, y) { return ds && ds[y] ? ds[y][x] : '.'; }
    rows.forEach(function (r, y) {
      for (var x = 0; x < r.length; x++) {
        var ch = r[x], px = x0 + x * canh, py = y0 + y * canh, m = MAU[ky(lop.mau, x, y)], md = MAU[ky(lop.dich, x, y)];
        if (m) k.appendChild(c.dat(oMau(c, m, s), px, py));
        if (ch === '=') k.appendChild(c.dat(veV(c, 'o', 'rao', s, { mask: 0 }, BM.xamToi), px, py));
        else if (ch === 'u') k.appendChild(c.dat(veV(c, 'o', 'ho', s, {}, BM.xamToi2), px, py));
        else if (ch === 'P') k.appendChild(c.dat(veV(c, 'o', 'sac', s, { pha: 0 }, BM.vang), px, py));
        else if (ch === 'D') k.appendChild(c.dat(veV(c, 'o', 'dich', s, md ? { kieu: 'trong', mau: md } : { kieu: 'trong' }, MAU_DU_PHONG[md] || BM.vang), px, py));
      }
    });
    k.appendChild(lopSon);
    rows.forEach(function (r, y) {
      for (var x = 0; x < r.length; x++) { var mh = MAU[ky(lop.hop, x, y)]; if (mh) k.appendChild(kq.hop[x + ',' + y] = c.dat(hop(c, mh, s), x0 + x * canh, y0 + y * canh)); }
    });
    kq.to = function (x, y, m, t) {
      var e = c.dat(oMau(c, m, s), x0 + x * canh, y0 + y * canh);
      lopSon.appendChild(c.tu(e, t));
      c.sau(t * 1000, function () { c.keu('kep'); });
      return e;
    };
    return kq;
  }

  /** Dời phần tử (left/top) sau ms, có trượt (lớp pg-truot, thời lượng giây). */
  function truot(c, e, ms, x, y, giay) {
    e.classList.add('pg-truot'); e.style.setProperty('--tg', (giay || 1) + 's');
    c.sau(ms, function () { e.style.left = x + 'px'; if (y !== undefined) e.style.top = y + 'px'; });
  }
  /** Robot r (và vật kèm theo, đặt theo góc) đi qua chuỗi ô của sân s: diem = [[x, y], …], mỗi bước buoc ms, bắt đầu ms0. */
  function diQua(c, s, r, diem, ms0, buoc, kem) {
    diem.forEach(function (d, i) {
      var p = s.o(d[0], d[1]), t = ms0 + i * buoc;
      truot(c, r, t, p.x, p.y, buoc / 1000 * 0.9);
      if (kem) truot(c, kem, t, p.x - C1 / 2, p.y - C1 / 2, buoc / 1000 * 0.9);
      c.sau(t, function () { c.keu('buoc'); });
    });
  }
  /** Chữ tượng thanh nhỏ ở (x, y), bật lên từ giây t. */
  function tieng(k, c, chu, x, y, t) { var e = c.chu('md-ram pg-cach', chu); e.style.left = x + 'px'; e.style.top = y + 'px'; e.style.fontSize = '24px'; e.style.animationDelay = t + 's'; k.appendChild(e); return e; }
  /** Dấu hỏi / chấm than trên đầu ở (x, y) từ giây t. */
  function hoi(k, c, chu, x, y, t) { var e = c.chu('md-hoi', chu); e.style.left = x + 'px'; e.style.top = y + 'px'; e.style.animationDelay = t + 's'; k.appendChild(e); return e; }
  /** Món đồ (icon) bay từ (x0, y0) tới (x1, y1) xoay một vòng, biến mất lúc tới (giây t1). */
  function bayToi(k, c, e, x0, y0, x1, y1, t0, t1) {
    var vx = c.h('div', 'md-a md-vx'); vx.style.left = x0 + 'px'; vx.style.top = y0 + 'px'; vx.style.setProperty('--x', (x1 - x0) + 'px'); vx.style.animationDelay = t0 + 's';
    var vy = c.h('div', 'md-vy'); vy.style.setProperty('--y', (y1 - y0) + 'px'); vy.style.setProperty('--r', '360deg'); vy.style.animationDelay = t0 + 's';
    vy.appendChild(e); vx.appendChild(vy); k.appendChild(c.tu(vx, t1, true));
  }
  /** Robot cũ ẩn ở giây t, robot mới hiện đúng chỗ đó: lắp bộ phận, CẠCH! */
  function lap(k, c, cu, moi, t) { k.appendChild(c.tu(cu, t, true)); k.appendChild(c.tu(moi, t)); var cach = c.chu('md-ram pg-cach', 'CẠCH!'); cach.style.animationDelay = t + 's'; k.appendChild(cach); c.sau(t * 1000, function () { c.keu('kep'); }); }
  /** Thanh pin n vạch ở (x, y); .dat(v) tô v vạch đầu (vàng), còn lại xám. */
  function thanhPin(k, c, x, y, n, v) {
    var b = c.dat(c.h('div'), x, y); b.style.display = 'flex'; b.style.gap = '2px'; b.style.padding = '3px'; b.style.borderRadius = '4px'; b.style.background = BM.vienDam;
    var vach = []; for (var i = 0; i < n; i++) { var e = c.h('div'); e.style.width = '9px'; e.style.height = '12px'; e.style.borderRadius = '2px'; b.appendChild(e); vach.push(e); }
    b.dat = function (so) { vach.forEach(function (e, i) { e.style.background = i < so ? BM.vang : BM.xamToi; }); return b; };
    k.appendChild(b); return b.dat(v === undefined ? n : v);
  }
  /** Nhà phố nhìn ngang: khối cao h, rộng w, đáy chạm y; cửa sổ sáng khi sang. */
  function nha(k, c, x, y, w, h, sang) {
    var e = c.dat(c.h('div'), x, y - h); e.style.width = w + 'px'; e.style.height = h + 'px'; e.style.background = sang ? BM.lamSangV1 || BM.lamSang : BM.xamToi; e.style.border = '2px solid ' + BM.vienDam; e.style.borderRadius = '3px 3px 0 0';
    for (var yy = 8; yy < h - 10; yy += 16) for (var xx = 6; xx < w - 8; xx += 14) {
      var cs = c.dat(c.h('div'), xx, yy); cs.style.width = '7px'; cs.style.height = '8px'; cs.style.background = sang ? BM.vang : BM.xam; e.appendChild(cs);
    }
    k.appendChild(e); return e;
  }
  /** Mặt đường nhìn ngang (dải tối) với vạch giữa đường: ro = true vạch vàng rõ, false vạch mờ đứt quãng. */
  function duongPho(k, c, y, ro) {
    var d = c.dat(c.h('div'), 0, y); d.style.width = '320px'; d.style.height = '46px'; d.style.background = BM.xamToi2; k.appendChild(d);
    var vach = [];
    for (var x = 8; x < 320; x += 44) {
      var v = c.dat(c.h('div'), x, y + 20); v.style.width = '26px'; v.style.height = '6px'; v.style.borderRadius = '2px';
      v.style.background = ro ? BM.vang : BM.trang; v.style.opacity = ro ? '1' : (x % 88 ? '0.15' : '0.35'); k.appendChild(v); vach.push(v);
    }
    return vach;
  }
  // huy hiệu chương 1 các gói mùa 4 (+ cỗ máy gói 10) bay trong phim gói 10
  var HUY = ['drone', 'may-son', 'cam-bon', 'pho-mau', 'tram-sac', 'net-lien', 'nhin-duoi', 'doi-nam-cham', 'son-tren-cao', 'drone-ke-vach'];
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

  var PHIM = {
    /* ---------------------------------------------------------------- 1 · Cất cánh (thân drone) */
    'drone': [
      // 1 · đơn việc (khuôn mục 3c): thành phố mới, vạch kẻ đường mờ hết, xe đi lộn xộn; R1 xe hai bánh lăn tới
      function (k, c) {
        c.nen(k, 'pg-troi');
        nha(k, c, 14, 128, 52, 92, false); nha(k, c, 76, 128, 40, 70, false); nha(k, c, 214, 128, 46, 84, false); nha(k, c, 268, 128, 44, 104, false);
        duongPho(k, c, 128, false);
        var x1 = c.dat(c.ico('car', 3, BM.do), 150, 132, 'md-lac'), x2 = c.dat(c.ico('car', 3, BM.lamSang), 200, 150, 'md-lac');
        x2.style.animationDelay = '.3s'; k.appendChild(x1); k.appendChild(x2);
        c.nen(k, 'md-san pg-dat');
        var r = c.xe(XE, {}, 1, 3, -40, 196); k.appendChild(r);
        truot(c, r, 80, 70, 196, 1.2);
        hoi(k, c, '?', 170, 96, 1.2);
        c.sau(1300, function () { r.mat('ngac'); c.keu('loi'); });
      },
      // 2 · em lắp cánh quạt: R1 thành drone, CẠCH!
      function (k, c) {
        c.nen(k, 'pg-troi'); c.nen(k, 'md-san pg-dat');
        var cu = c.xe(XE, {}, 1, 3, 150, Y), moi = c.xe(DRONE, {}, 1, 3, 150, Y - 30);
        bayToi(k, c, c.ico('denCanh', 3, BM.lamSang), 250, 40, 136, Y - 40, 0.1, 0.95);
        lap(k, c, cu, moi, 0.95);
        c.sau(1200, function () { moi.mat('vui'); });
        truot(c, moi, 1500, 150, Y - 70, 0.8);
      },
      // 3 · drone bay qua hàng rào; mỗi ô tốn một vạch pin
      function (k, c) {
        var s = san4(k, c, ['.....', '=====', '.....'], {}, 4, X0, 34), p = s.o(0, 0);
        var pin = thanhPin(k, c, 214, 4, 5);
        var r = c.xe(DRONE, {}, 1, 2, p.x, p.y); k.appendChild(r);
        diQua(c, s, r, [[0, 1], [0, 2], [1, 2], [2, 2]], 400, 600);
        [4, 3, 2, 1].forEach(function (v, i) { c.sau(400 + i * 600 + 400, function () { pin.dat(v); }); });
        c.sau(2900, function () { r.mat('vui'); c.keu('thang'); });
      },
      // 4 · code: lệnh bay bốn hướng; danh sách giữ cả đường bay
      function (k, c) {
        c.nen(k, 'pg-troi'); c.nen(k, 'md-san pg-dat');
        c.code(k, ['go_up()', 'go_right()', 'path = ["right", "down"]'], 10, 14);
        var r = c.xe(DRONE, {}, 1, 3, 200, 140); k.appendChild(r);
        truot(c, r, 1300, 200, 100, 0.5);
        truot(c, r, 1900, 260, 100, 0.5);
        c.sau(2500, function () { r.mat('vui'); c.keu('thang'); });
      }
    ],

    /* ---------------------------------------------------------------- 2 · Chấm sơn (máy sơn gốc, xe hai bánh) */
    'may-son': [
      // 1 · đường cần vạch mới (khung vàng), R1 chưa có gì để tô
      function (k, c) {
        san4(k, c, ['.....', '*.*.*', '.....']);
        var r = c.xe(XE, {}, 1, 2, X0 + C1 / 2, Y0 + C1 * 1.5); k.appendChild(r);
        hoi(k, c, '?', 50, 40, 0.6);
        c.sau(600, function () { r.mat('ngac'); c.keu('loi'); });
      },
      // 2 · em lắp máy sơn vào mũi xe
      function (k, c) {
        c.nen(k, 'pg-troi'); c.nen(k, 'md-san pg-dat');
        bayToi(k, c, c.ico('denSon', 3, BM.vang), 260, 40, 170, Y - 20, 0.1, 0.95);
        lap(k, c, c.xe(XE, {}, 1, 3, 150, Y), c.xe(XE_SON, {}, 1, 3, 150, Y), 0.95);
      },
      // 3 · ink chọn màu, dot chấm một ô: đỏ, vàng, đỏ
      function (k, c) {
        var s = san4(k, c, ['.....', '*.*.*', '.....']), p = s.o(0, 1);
        var r = c.xe(XE_SON, {}, 1, 2, p.x, p.y); k.appendChild(r);
        ['red', 'yellow', 'red'].forEach(function (m, i) {
          s.to(i * 2, 1, m, 0.4 + i * 1.0);
          if (i < 2) diQua(c, s, r, [[i * 2 + 1, 1], [i * 2 + 2, 1]], 700 + i * 1000, 300);
        });
        c.sau(2700, function () { r.mat('vui'); c.keu('thang'); });
      },
      // 4 · code: duyệt danh sách màu, mỗi màu chấm một ô
      function (k, c) {
        c.nen(k, 'md-san');
        c.code(k, ['for c in ["red", "yellow"]:', '    ink(c)', '    dot()', '    move()'], 10, 14);
        k.appendChild(c.xe(XE_SON, {}, 1, 3, 240, Y).mat('vui'));
      }
    ],

    /* ---------------------------------------------------------------- 3 · Camera bốn hướng */
    'cam-bon': [
      // 1 · ngã tư: đường xanh rẽ trái hay phải?
      function (k, c) {
        var s = san4(k, c, ['##.##', '.....', '##.##'], { mau: ['.....', 'gg...', '.....'] }), p = s.o(2, 2);
        var r = c.xe(XE, {}, 0, 2, p.x, p.y); k.appendChild(r);
        truot(c, r, 200, s.o(2, 1).x, s.o(2, 1).y, 0.6);
        hoi(k, c, '?', 160, 40, 1.0);
        c.sau(1000, function () { r.mat('ngac'); c.keu('loi'); });
      },
      // 2 · em lắp camera bốn hướng lên nóc xe
      function (k, c) {
        c.nen(k, 'pg-troi'); c.nen(k, 'md-san pg-dat');
        bayToi(k, c, c.ico('denCam', 3, BM.do), 240, 30, 150, Y - 40, 0.1, 0.95);
        lap(k, c, c.xe(XE, {}, 1, 3, 150, Y), c.xe(XE_CAM, {}, 1, 3, 150, Y), 0.95);
      },
      // 3 · camera nhìn bốn phía: bên trái thấy xanh; xe rẽ trái
      function (k, c) {
        var s = san4(k, c, ['##.##', '.....', '##.##'], { mau: ['.....', 'gg...', '.....'] }), p = s.o(2, 1);
        var r = c.xe(XE_CAM, { camBien: { bat: true } }, 0, 2, p.x, p.y); k.appendChild(r);
        [[2, 0], [3, 1], [2, 2], [1, 1]].forEach(function (d, i) {
          var q = s.o(d[0], d[1]), v = c.dat(c.h('div', 'md-pop'), q.x - 9, q.y - 9);
          v.style.width = v.style.height = '18px'; v.style.borderRadius = '50%'; v.style.border = '3px solid ' + (i === 3 ? BM.xanhLa : BM.trang);
          v.style.animationDelay = (0.3 + i * 0.3) + 's'; k.appendChild(v);
        });
        c.sau(1500, function () { r.ve(undefined, 3); c.keu('buoc'); });
        diQua(c, s, r, [[1, 1], [0, 1]], 1900, 500);
        c.sau(3000, function () { r.mat('vui'); c.keu('thang'); });
      },
      // 4 · code color("left")
      function (k, c) {
        c.nen(k, 'md-san');
        c.code(k, ['if color("left") == "green":', '    turn_left()', 'move()'], 10, 14);
        k.appendChild(c.xe(XE_CAM, { camBien: { bat: true } }, 3, 3, 240, Y).mat('vui'));
      }
    ],

    /* ---------------------------------------------------------------- 4 · Phố màu (sân: hộp màu, ô đích màu) */
    'pho-mau': [
      // 1 · ô đích có màu: hộp đỏ thả vào ô xanh không nhận
      function (k, c) {
        var s = san4(k, c, ['...D.', '.....', '...D.'], { dich: ['...r.', '.....', '...b.'] }), p = s.o(1, 1);
        var r = c.xe(DRONE_CAM, {}, 1, 2, p.x, p.y), h = c.dat(hop(c, 'red', 4), p.x - C1 / 2, p.y - C1 / 2);
        k.appendChild(h); k.appendChild(r);
        diQua(c, s, r, [[2, 1], [3, 1], [3, 2]], 300, 500, h);
        tieng(k, c, '?!', 230, 100, 2.0);
        c.sau(2000, function () { r.mat('buon'); c.keu('loi'); });
      },
      // 2 · drone nhìn ô bên cạnh tìm ô đích cùng màu hộp
      function (k, c) {
        var s = san4(k, c, ['...D.', '.....', '...D.'], { dich: ['...r.', '.....', '...b.'] }), p = s.o(3, 1);
        var h = c.dat(hop(c, 'red', 4), p.x - C1 / 2, p.y - C1 / 2); k.appendChild(h);
        var r = c.xe(DRONE_CAM, { camBien: { bat: true } }, 1, 2, p.x, p.y); k.appendChild(r);
        [[3, 2], [3, 0]].forEach(function (d, i) {
          var q = s.o(d[0], d[1]), v = c.dat(c.h('div', 'md-pop'), q.x - 14, q.y - 14);
          v.style.width = v.style.height = '28px'; v.style.borderRadius = '50%'; v.style.border = '3px solid ' + (i ? BM.xanhLa : BM.do);
          v.style.animationDelay = (0.4 + i * 0.8) + 's'; k.appendChild(v);
        });
        hoi(k, c, '!', 200, 4, 1.4);
        c.sau(1400, function () { r.mat('vui'); c.keu('moKhoa'); });
      },
      // 3 · hộp đỏ về ô đỏ: giao đúng
      function (k, c) {
        var s = san4(k, c, ['...D.', '.....', '...D.'], { dich: ['...r.', '.....', '...b.'] }), p = s.o(3, 1);
        var h = c.dat(hop(c, 'red', 4), p.x - C1 / 2, p.y - C1 / 2); k.appendChild(h);
        var r = c.xe(DRONE_CAM, {}, 1, 2, p.x, p.y); k.appendChild(r);
        diQua(c, s, r, [[3, 0]], 300, 600, h);
        var sao = c.dat(c.sao(3), 226, 20, 'md-pop'); sao.style.animationDelay = '1.1s'; k.appendChild(sao);
        c.sau(1100, function () { r.mat('vui'); c.keu('thang'); });
      }
    ],

    /* ---------------------------------------------------------------- 5 · Trạm sạc (nâng cấp drone: đáp đất sạc) */
    'tram-sac': [
      // 1 · pin cạn giữa phố: drone hạ cánh khẩn
      function (k, c) {
        c.nen(k, 'pg-troi'); duongPho(k, c, 150, false); c.nen(k, 'md-san pg-dat');
        var pin = thanhPin(k, c, 214, 4, 5, 3);
        var r = c.xe(DRONE, {}, 1, 3, 40, 90); k.appendChild(r);
        truot(c, r, 100, 170, 90, 1.4);
        [2, 1, 0].forEach(function (v, i) { c.sau(400 + i * 400, function () { pin.dat(v); }); });
        truot(c, r, 1700, 170, 150, 0.4);
        tieng(k, c, '!?', 200, 70, 1.9);
        c.sau(1900, function () { r.mat('buon'); c.keu('loi'); });
      },
      // 2 · em nâng cấp drone: đáp xuống được, cất cánh lại được
      function (k, c) {
        c.nen(k, 'pg-troi'); c.nen(k, 'md-san pg-dat');
        bayToi(k, c, c.ico('sac', 3, BM.vang), 250, 30, 150, Y - 50, 0.1, 0.95);
        lap(k, c, c.xe(DRONE, {}, 1, 3, 150, Y - 30), c.xe(DRONE, {}, 1, 3, 150, Y - 30), 0.95);
        c.sau(1300, function () { c.keu('buoc'); });
      },
      // 3 · đáp trên ô sạc: pin đầy ngay, rồi cất cánh bay tiếp
      function (k, c) {
        var s = san4(k, c, ['.....', '..P..', '.....']), p = s.o(0, 1);
        var pin = thanhPin(k, c, 214, 4, 5, 2);
        var r = c.xe(DRONE, {}, 1, 2, p.x, p.y); k.appendChild(r);
        diQua(c, s, r, [[1, 1], [2, 1]], 300, 500);
        c.sau(500, function () { pin.dat(1); });
        var q = s.o(2, 1);
        truot(c, r, 1400, q.x, q.y + 8, 0.3);
        c.sau(1700, function () { pin.dat(5); c.keu('moKhoa'); r.mat('vui'); });
        tieng(k, c, 'ĐẦY!', q.x - 20, 2, 1.7);
        truot(c, r, 2300, q.x, q.y, 0.3);
        diQua(c, s, r, [[3, 1], [4, 1]], 2700, 500);
      },
      // 4 · code land / take_off / battery
      function (k, c) {
        c.nen(k, 'md-san');
        c.code(k, ['land()', 'take_off()', 'if battery() < 3:'], 10, 14);
        k.appendChild(c.xe(DRONE, {}, 1, 3, 240, 120).mat('vui'));
      }
    ],

    /* ---------------------------------------------------------------- 6 · Nét liền (nâng cấp máy sơn: bút liền) */
    'net-lien': [
      // 1 · chấm từng ô mãi mới xong một vạch dài
      function (k, c) {
        var s = san4(k, c, ['.....', '*****', '.....']), p = s.o(0, 1);
        var r = c.xe(XE_SON, {}, 1, 2, p.x, p.y); k.appendChild(r);
        s.to(0, 1, 'blue', 0.5); diQua(c, s, r, [[1, 1]], 900, 700); s.to(1, 1, 'blue', 1.8);
        hoi(k, c, '?', 160, 4, 2.2);
        c.sau(2200, function () { r.mat('buon'); c.keu('loi'); });
      },
      // 2 · em nâng cấp máy sơn thành bút liền
      function (k, c) {
        c.nen(k, 'pg-troi'); c.nen(k, 'md-san pg-dat');
        bayToi(k, c, c.ico('edit', 3, BM.lamSang), 260, 40, 170, Y - 20, 0.1, 0.95);
        lap(k, c, c.xe(XE_SON, {}, 1, 3, 150, Y), c.xe(XE_SON, {}, 1, 3, 150, Y), 0.95);
      },
      // 3 · hạ bút: xe đi tới đâu, vạch kéo dài tới đó
      function (k, c) {
        var s = san4(k, c, ['.....', '*****', '.....']), p = s.o(0, 1);
        var r = c.xe(XE_SON, {}, 1, 2, p.x, p.y); k.appendChild(r);
        s.to(0, 1, 'blue', 0.3);
        diQua(c, s, r, [[1, 1], [2, 1], [3, 1], [4, 1]], 500, 450);
        [1, 2, 3, 4].forEach(function (x, i) { s.to(x, 1, 'blue', 0.95 + i * 0.45); });
        c.sau(2600, function () { r.mat('vui'); c.keu('thang'); });
      },
      // 4 · code pen_down / pen_up
      function (k, c) {
        c.nen(k, 'md-san');
        c.code(k, ['pen_down()', 'forward(3)', 'pen_up()'], 10, 14);
        k.appendChild(c.xe(XE_SON, {}, 1, 3, 240, Y).mat('vui'));
      }
    ],

    /* ---------------------------------------------------------------- 7 · Nhìn dưới chân (nâng cấp camera: "here") */
    'nhin-duoi': [
      // 1 · hộp nằm ngay dưới bụng: camera bốn hướng không nhìn thấy
      function (k, c) {
        var s = san4(k, c, ['.....', '.....', '.....'], { hop: ['.....', '..r..', '.....'] }), p = s.o(2, 1);
        var r = c.xe(DRONE_CAM, { camBien: { bat: true } }, 1, 2, p.x, p.y); k.appendChild(r);
        hoi(k, c, '?', 150, 4, 0.8);
        c.sau(800, function () { r.mat('ngac'); c.keu('loi'); });
      },
      // 2 · em nâng cấp camera: thêm mắt nhìn xuống dưới chân
      function (k, c) {
        c.nen(k, 'pg-troi'); c.nen(k, 'md-san pg-dat');
        bayToi(k, c, c.ico('denCam', 3, BM.do), 250, 20, 150, Y - 20, 0.1, 0.95);
        lap(k, c, c.xe(DRONE_CAM, {}, 1, 3, 150, Y - 30), c.xe(DRONE_DUOI, {}, 1, 3, 150, Y - 30), 0.95);
      },
      // 3 · drone đọc màu hộp dưới chân, rồi chở đi
      function (k, c) {
        var s = san4(k, c, ['D....', '.....', '.....'], { hop: ['.....', '..r..', '.....'], dich: ['r....', '.....', '.....'] }), p = s.o(2, 1);
        var r = c.xe(DRONE_DUOI, { camBien: { bat: true } }, 1, 2, p.x, p.y); k.appendChild(r);
        var v = c.dat(c.h('div', 'md-pop'), p.x - 24, p.y - 24); v.style.width = v.style.height = '48px'; v.style.borderRadius = '50%'; v.style.border = '3px solid ' + BM.do; v.style.animationDelay = '.4s'; k.appendChild(v);
        c.sau(500, function () { c.keu('quet'); r.mat('vui'); });
        var h = s.hop['2,1']; k.appendChild(h);  // đưa hộp lên trên lớp vòng
        k.appendChild(r);
        diQua(c, s, r, [[1, 1], [0, 1], [0, 0]], 1200, 500, h);
        c.sau(2800, function () { c.keu('thang'); });
      },
      // 4 · code color("here")
      function (k, c) {
        c.nen(k, 'md-san');
        c.code(k, ['c = color("here")', 'if c == "red":', '    go_up()'], 10, 14);
        k.appendChild(c.xe(DRONE_DUOI, { camBien: { bat: true } }, 1, 3, 240, 120).mat('vui'));
      }
    ],

    /* ---------------------------------------------------------------- 8 · Đội chia hàng (R2 trở lại) */
    'doi-nam-cham': [
      // 1 · R2 trở lại với tay kẹp và camera; R1 giữ nam châm
      function (k, c) {
        c.nen(k, 'pg-troi'); c.nen(k, 'md-san pg-dat');
        k.appendChild(c.xe(R1_NC, {}, 1, 3, 90, Y).mat('vui'));
        var r2 = c.xe(R2, {}, 3, 3, 360, Y); k.appendChild(r2);
        truot(c, r2, 100, 230, Y, 1.3);
        c.sau(1400, function () { r2.mat('vui'); c.keu('moKhoa'); });
        hoi(k, c, '!', 160, 70, 1.4);
      },
      // 2 · R1 hút hộp sắt qua rào, đặt trước mũi R2
      function (k, c) {
        var s = san4(k, c, ['.....', '.=...', '.....'], { hop: ['.b...', '.....', '.....'] });
        var p1 = s.o(1, 2), p2 = s.o(3, 2);
        var r1 = c.xe(R1_NC, {}, 0, 2, p1.x, p1.y), r2 = c.xe(R2, {}, 3, 2, p2.x, p2.y);
        k.appendChild(r1); k.appendChild(r2);
        var h = s.hop['1,0']; k.appendChild(h);
        truot(c, h, 500, X0 + C1, Y0 + C1, 0.6);
        tieng(k, c, 'HÚT!', 120, 8, 0.5);
        c.sau(1300, function () { r1.ve(undefined, 1); c.keu('buoc'); });
        truot(c, h, 1500, X0 + 2 * C1, Y0 + 2 * C1, 0.6);
        c.sau(2100, function () { r1.mat('vui'); r2.mat('vui'); c.keu('kep'); });
      },
      // 3 · R2 nhìn màu hộp, xếp vào đúng ô đích
      function (k, c) {
        var s = san4(k, c, ['...D.', '.....', '.....'], { dich: ['...b.', '.....', '.....'], hop: ['.....', '.....', '..b..'] }), p2 = s.o(3, 2);
        var r1 = c.xe(R1_NC, {}, 1, 2, s.o(1, 2).x, p2.y), r2 = c.xe(R2, { camBien: { bat: true } }, 3, 2, p2.x, p2.y);
        k.appendChild(r1); k.appendChild(r2);
        var h = s.hop['2,2']; k.appendChild(h);
        c.sau(400, function () { c.keu('quet'); });
        c.sau(1000, function () { r2.ve(undefined, 0); c.keu('kep'); });
        truot(c, h, 1300, X0 + 3 * C1, Y0 + C1, 0.5);
        truot(c, h, 1900, X0 + 3 * C1, Y0, 0.5);
        c.sau(2500, function () { r1.mat('vui'); r2.mat('vui'); c.keu('thang'); });
      },
      // 4 · hai bảng code R1 / R2
      function (k, c) {
        c.nen(k, 'md-san');
        bangTen(c, c.code(k, ['hand_off()'], 10, 14), t2('pg.tenR1'), '');
        bangTen(c, c.code(k, ['hold_on(3)', 'sort_by_color()'], 170, 14, 0.5), t2('pg.tenR2'), 'pg-ten-r2');
        k.appendChild(c.xe(R1_NC, {}, 1, 3, 90, Y).mat('vui'));
        k.appendChild(c.xe(R2, {}, 3, 3, 230, Y).mat('vui'));
      }
    ],

    /* ---------------------------------------------------------------- 9 · Sơn từ trên cao (combo: drone + máy sơn + camera) */
    'son-tren-cao': [
      // 1 · bên kia hàng rào, xe máy sơn không qua được
      function (k, c) {
        var s = san4(k, c, ['.....', '..=**', '.....']), p = s.o(1, 1);
        var r = c.xe(XE_SON, {}, 1, 2, s.o(0, 1).x, p.y); k.appendChild(r);
        truot(c, r, 200, p.x, p.y, 0.6);
        tieng(k, c, 'CỘP!', 120, 40, 0.8);
        hoi(k, c, '?', 90, 4, 1.0);
        c.sau(900, function () { r.mat('buon'); c.keu('loi'); });
      },
      // 2 · em gắn máy sơn dưới bụng drone
      function (k, c) {
        c.nen(k, 'pg-troi'); c.nen(k, 'md-san pg-dat');
        bayToi(k, c, c.ico('denSon', 3, BM.vang), 40, 40, 140, Y - 10, 0.1, 0.95);
        lap(k, c, c.xe(DRONE_DUOI, {}, 1, 3, 150, Y - 30), c.xe(DRONE_SON, {}, 1, 3, 150, Y - 30), 0.95);
      },
      // 3 · drone kẻ vạch trên cao, nhấc bút khi bay qua rào
      function (k, c) {
        var s = san4(k, c, ['.....', '..=..', '.....']), p = s.o(0, 1);
        var r = c.xe(DRONE_SON, {}, 1, 2, p.x, p.y); k.appendChild(r);
        s.to(0, 1, 'yellow', 0.3);
        diQua(c, s, r, [[1, 1], [2, 1], [3, 1], [4, 1]], 500, 500);
        s.to(1, 1, 'yellow', 1.0); s.to(3, 1, 'yellow', 2.0); s.to(4, 1, 'yellow', 2.5);
        c.sau(2700, function () { r.mat('vui'); c.keu('thang'); });
      },
      // 4 · code nhấc bút trước rào, hạ bút sau rào
      function (k, c) {
        c.nen(k, 'pg-troi');
        c.code(k, ['pen_up()', 'go_right()', 'pen_down()'], 10, 14);
        k.appendChild(c.xe(DRONE_SON, {}, 1, 3, 240, 120).mat('vui'));
      }
    ],

    /* ---------------------------------------------------------------- 10 · Drone kẻ vạch R1 xuất xưởng (tổng hợp + trùm; khuôn mục 3c; nhá mùa 5 sân bóng) */
    'drone-ke-vach': [
      // 1 · drone đủ bộ giữa xưởng, các huy hiệu mùa 4 bay quanh (như phim gói 10 mùa 2)
      function (k, c) {
        c.nen(k, 'md-san');
        k.appendChild(c.xe(DRONE_SON, { camBien: { bat: true } }, 1, 3, 160, 110, 'md-nhun').mat('vui'));
        var cho = [[30, 30], [110, 14], [196, 14], [262, 40], [20, 100], [266, 104], [64, 60], [222, 72], [70, 128], [220, 132]];
        HUY.forEach(function (m, i) {
          var o = c.dat(c.h('div', 'pg-bay'), cho[i][0], cho[i][1]); o.style.animationDelay = (-i * 0.3) + 's';
          var p = c.dat(c.h('div', 'md-pop'), 0, 0); p.style.animationDelay = (0.2 + i * 0.15) + 's'; p.appendChild(huyHieu(c, m));
          o.appendChild(p); k.appendChild(o);
        });
        c.sau(300, function () { c.keu('thang'); });
      },
      // 2 · tem XUẤT XƯỞNG: "Drone kẻ vạch R1" + ba part: cánh quạt, máy sơn, camera
      function (k, c) {
        c.nen(k, 'md-san');
        var r = c.xe(DRONE_SON, {}, 1, 3, 160, 150); k.appendChild(r);
        c.sau(300, function () { r.mat('ngac'); });
        c.sau(2100, function () { r.mat('vui'); });
        var v = goc.PhimVector && goc.PhimVector.xuatXuong && goc.PhimVector.xuatXuong({ tem: t2('pg.tem.xuat-xuong'), ten: t2('pg.tem.drone-ke-vach'),
          part: [['denCanh', BM.lamSang], ['denSon', BM.vang], ['denCam', BM.do]], t: 1 });
        if (v) k.appendChild(c.dat(v, 70, 10));
        c.sau(1000, function () { c.keu('dam'); });
        c.sau(1900, function () { c.keu('thang'); });
      },
      // 3 · vạch đường sáng rõ, xe đi đúng làn (việc kẹt ở drone.1 được gỡ)
      function (k, c) {
        c.nen(k, 'pg-troi');
        nha(k, c, 14, 128, 52, 92, true); nha(k, c, 76, 128, 40, 70, true); nha(k, c, 214, 128, 46, 84, true); nha(k, c, 268, 128, 44, 104, true);
        var vach = duongPho(k, c, 128, false);
        var r = c.xe(DRONE_SON, {}, 1, 2, -30, 118); k.appendChild(r);
        truot(c, r, 100, 340, 118, 2.6);
        vach.forEach(function (v, i) { c.sau(300 + i * 330, function () { v.style.background = BM.vang; v.style.opacity = '1'; c.keu('kep'); }); });
        var x1 = c.dat(c.ico('car', 3, BM.do), -50, 132), x2 = c.dat(c.ico('car', 3, BM.lamSang), 330, 152);
        k.appendChild(x1); k.appendChild(x2);
        truot(c, x1, 2900, 140, 132, 1.4); truot(c, x2, 2900, 150, 152, 1.4);
        c.nen(k, 'md-san pg-dat');
        c.sau(3000, function () { r.mat('vui'); c.keu('thang'); });
      },
      // 4 · nhá mùa 5: xa xa sân bóng sáng đèn, quả bóng nhấp nháy
      function (k, c) {
        c.nen(k, 'pg-troi'); c.nen(k, 'pg-doi');
        var sanCo = c.dat(c.h('div'), 186, 92); sanCo.style.width = '120px'; sanCo.style.height = '52px'; sanCo.style.background = BM.xanhLa; sanCo.style.border = '3px solid ' + BM.trang; sanCo.style.borderRadius = '4px'; k.appendChild(sanCo);
        var giua = c.dat(c.h('div'), 58, 0); giua.style.width = '3px'; giua.style.height = '52px'; giua.style.background = BM.trang; sanCo.appendChild(giua);
        [[194, 54], [292, 54]].forEach(function (d, i) {
          var den = c.dat(c.h('div', 'pg-nhay'), d[0], d[1]); den.style.width = '12px'; den.style.height = '12px'; den.style.borderRadius = '50%'; den.style.background = BM.vang;
          den.style.animationDelay = (i * 0.3) + 's'; k.appendChild(c.tu(den, 1.2));
        });
        var bong = c.dat(c.h('div', 'pg-nhay'), 240, 108); bong.style.width = bong.style.height = '16px'; bong.style.borderRadius = '50%'; bong.style.background = BM.trang; bong.style.border = '2px solid ' + BM.vienDam;
        k.appendChild(c.tu(bong, 1.6));
        c.nen(k, 'md-san pg-dat');
        var r = c.xe(DRONE_SON, {}, 1, 3, -40, 110); k.appendChild(r);
        truot(c, r, 100, 100, 110, 1.4);
        hoi(k, c, '?', 150, 60, 2.2);
        c.sau(1600, function () { r.mat('ngac'); c.keu('moKhoa'); });
      }
    ]
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = PHIM;
  if (goc && goc.PhimGoi) goc.PhimGoi.them(PHIM);
})(typeof window !== 'undefined' ? window : globalThis);
