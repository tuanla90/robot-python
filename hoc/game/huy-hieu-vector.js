var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ============================================================================
   huy-hieu-vector.js — HUY HIỆU VECTOR (gói V6, 28/10): VeVector.HUY_HIEU. Bản vector của huy-hieu.js (bộ pixel 36 × 36 giữ nguyên).
   Mọi hình trên hệ 100 × 100 của MỘT huy hiệu: vành tròn (thép 'mo' / vàng 'xong' / xám 'khoa'), đĩa trắng lab tâm (50, 50) bán kính R_DIA,
   hình của chương cắt trong đĩa (bán kính R_HINH), 'khoa' = hình bạc màu + ổ khoá giữa, 'xong' = sao vàng góc dưới phải.
   Hình của chương DỰNG TỪ BỘ VẼ VECTOR có sẵn (không gọi Part.*): robot VeVector.robot (mắt biểu cảm, màu đội), ô VeVector.o, vật VeVector.vat,
   cộng vài nét riêng của huy hiệu (bánh răng "chế lệnh", đồng xu "lắp ráp", sóng cảm biến, mũi tên, khối code "def" / "( n )", ô danh sách).
     VeVector.HUY_HIEU.co(ma)              → có bản vector cho mã này?
     VeVector.HUY_HIEU.ve(ma, tt, canhPx)  → canvas canhPx × canhPx (cờ .laVector, .laHuyHieu); null nếu chưa có bản vector (huy-hieu.js rơi về pixel)
     VeVector.HUY_HIEU.dangKy(ma, f)       → thêm hình: f(g, c) vẽ trong hệ 100 (đã cắt trong đĩa); c = bộ dựng bên dưới (c.robot, c.vat, c.o, c.banhRang…)
     VeVector.HUY_HIEU.ds()                → các mã đã có bản vector (hình riêng).
     (V7c1, 28/10) DANH SÁCH MÃ HUY HIỆU của game nằm ở đây (trước là Object.keys(HINH) của huy-hieu.js pixel):
     VeVector.HUY_HIEU.BI_DANH             { mã: mã gốc } mã dùng chung hình của mã khác (doi-* / che-doi-* = hai-robot; me-cung / cam-bien-ben = khoang-cach)
     VeVector.HUY_HIEU.maGoc(ma)           → mã có hình (bí danh → mã gốc; mã thường → chính nó)
     VeVector.HUY_HIEU.dsTatCa()           → mọi mã: hình riêng + bí danh (= HuyHieu.DS)
   Node: canvas giả của VeVector (ghi lệnh) — máy kiểm hoc/kiem-huy-hieu-phim-vector.mjs.
   ========================================================================== */
(function (root) {
  var V = root.VeVector || (typeof module === 'object' && require('./ve-vector.js'));
  var H = V.H, R_VANH = 47, R_DIA = 38.5, R_HINH = 37;
  var PHONG = '700 {c}px "Google Sans Code", ui-monospace, monospace';
  var HINH = {};
  var dem = {}, soDem = 0;

  /* ---------------------------------------------------------------- bộ dựng hình (c): mọi toạ độ theo hệ 100 của huy hiệu */
  function boDung(g, k) {
    var c = { k: k };
    /** Đặt canvas cv (đã rasterise đúng cỡ điểm ảnh) tâm (cx, cy), cạnh hiển thị = cv.width / k đơn vị. */
    c.dat = function (cv, cx, cy) { if (!cv) return; var w = cv.width / k, h = cv.height / k; g.drawImage(cv, cx - w / 2, cy - h / 2, w, h); };
    /** Robot vector cfg { than, tay, camBien, son } trạng thái st (như VeVector.robot), hướng huong, ô robot cạnh `canh` đơn vị, tâm thân (cx, cy). */
    c.robot = function (cfg, st, huong, cx, cy, canh) { c.dat(V.robot(cfg, st || {}, huong || 0, Math.max(1, Math.round(canh * k))), cx, cy); };
    /** Vật vector `ma` thân cạnh `n` đơn vị (vật vẽ trong hộp 12..88 của ô: canvas = n / 0,76). */
    c.vat = function (ma, s, cx, cy, n) { c.dat(V.vat(ma, Math.max(1, Math.round(n / 0.76 * k)), s || {}), cx, cy); };
    /** Ô vector `ma` cạnh `canh` đơn vị. */
    c.o = function (ma, s, cx, cy, canh) { c.dat(V.o(ma, Math.max(1, Math.round(canh * k)), s || {}), cx, cy); };
    /** Tâm + cạnh vật đang cầm (tay kẹp / tay xoay ở góc goc) của robot tâm (cx, cy) ô cạnh `canh`, hướng huong (0 lên, 1 phải, 2 xuống, 3 trái). */
    c.vatCam = function (cfg, tuThe, huong, cx, cy, canh, goc) {
      var u = canh / 100, f, l, n;
      if (goc !== undefined) { var x = V.vatXoay(cfg, tuThe, goc); if (!x) return null; f = x.f; l = x.l; n = x.n; }
      else { var v = V.vatKep(cfg, tuThe); if (!v) return null; f = v.ahead; l = 0; n = v.n; }
      var a = (huong || 0) * Math.PI / 2, fx = Math.sin(a), fy = -Math.cos(a);                    // hướng mũi; bên phải xe = (−fy, fx)
      return { x: cx + (fx * f - fy * l) * u, y: cy + (fy * f + fx * l) * u, n: n * u };
    };
    /** Gói V7a: vật trong tay to theo luật V6b (68,4% ô khi nâng) nên robot cầm vật cỡ cũ lẹm viền đĩa. Tìm chỗ đặt vừa đĩa: giữ cạnh `canh` lớn nhất có thể
     *  (thu dần tới 60%), lùi robot ngược hướng vật tối đa 24 đơn vị, sao cho bốn góc thân vật và vòng thân robot (≈ 0,4 cạnh) nằm trong bán kính R (mặc định R_HINH − 1,5).
     *  Trả { cx, cy, canh } (giữ nguyên nếu không có vật). */
    c.vua = function (cfg, tuThe, huong, cx, cy, canh, goc, R) {
      R = R || R_HINH - 1.5;
      var p0 = c.vatCam(cfg, tuThe, huong, cx, cy, canh, goc); if (!p0) return { cx: cx, cy: cy, canh: canh };
      var vx = p0.x - cx, vy = p0.y - cy, L = Math.sqrt(vx * vx + vy * vy) || 1, u, t, x, y;
      vx /= L; vy /= L;
      function lot(x, y, u) {
        var p = c.vatCam(cfg, tuThe, huong, x, y, u, goc), h = p.n / 2 + 1, i, dx, dy;
        for (i = 0; i < 4; i++) { dx = p.x + (i & 1 ? h : -h) - 50; dy = p.y + (i & 2 ? h : -h) - 50; if (dx * dx + dy * dy > R * R) return false; }
        dx = x - 50; dy = y - 50; return Math.sqrt(dx * dx + dy * dy) + u * 0.4 <= R + 2;
      }
      for (u = canh; u >= canh * 0.6; u -= 0.5) for (t = 0; t <= 24; t += 0.5) { x = cx - vx * t; y = cy - vy * t; if (lot(x, y, u)) return { cx: x, cy: y, canh: u }; }
      return { cx: cx, cy: cy, canh: canh * 0.6 };
    };
    /** Điểm cách tâm thân `d` (1/100 ô) về phía mũi, theo hướng: cho bóng hơi / vật trước mũi. */
    c.truoc = function (huong, cx, cy, canh, d) { var a = (huong || 0) * Math.PI / 2; return { x: cx + Math.sin(a) * d * canh / 100, y: cy - Math.cos(a) * d * canh / 100 }; };
    c.hh = function (cfg) { return V.hinhHoc(cfg) || { mz: 44, bk: 36 }; };
    /** Bánh răng "chế lệnh" (huy hiệu che-*): vàng viền chàm, lỗ trắng; tâm (cx, cy) bán kính r. */
    c.banhRang = function (cx, cy, r) {
      var n = 8, i, a, d = '';
      for (i = 0; i < n * 4; i++) {
        a = (i / (n * 4)) * Math.PI * 2 - Math.PI / 2;
        var rr = (i % 4 === 0 || i % 4 === 1) ? r : r * 0.74, x = cx + Math.cos(a + Math.PI / (n * 4)) * rr, y = cy + Math.sin(a + Math.PI / (n * 4)) * rr;
        d += (i ? ' L' : 'M') + x.toFixed(2) + ' ' + y.toFixed(2);
      }
      H.duong(g, d + ' Z'); g.fillStyle = H.gradToa(g, cx - r * 0.3, cy - r * 0.3, r * 1.4, [[0, BM.vecVangSang], [0.5, BM.vecVang], [1, BM.vecVangToi]]); g.fill(); H.vien(g, BM.vecVien, 2.2);
      H.tron(g, cx, cy, r * 0.34); H.to(g, BM.vecVo); H.vien(g, BM.vecVien, 2);
    };
    /** Đồng xu (ngân sách lắp ráp): vàng, vành trong, vạch giữa. */
    c.xu = function (cx, cy, r) {
      H.tron(g, cx, cy, r); g.fillStyle = H.gradToa(g, cx - r * 0.35, cy - r * 0.35, r * 1.5, [[0, BM.vecVangSang], [0.55, BM.vecVang], [1, BM.vecVangToi]]); g.fill(); H.vien(g, BM.vecVien, 2.2);
      H.tron(g, cx, cy, r * 0.68); H.vien(g, BM.vecVangToi, 1.6);
      H.duong(g, 'M' + cx + ' ' + (cy - r * 0.38) + ' V' + (cy + r * 0.38)); H.vien(g, BM.vecVangToi, 2.4);
    };
    /** Sao năm cánh vàng viền chàm. */
    c.sao = function (cx, cy, r, mau) { sao(g, cx, cy, r, mau); };
    /** Sóng cảm biến: ba cung đồng tâm (cx, cy), hướng a (rad, 0 = phải), màu cyan. */
    c.song = function (cx, cy, a, rs, mau) {
      (rs || [8, 14, 20]).forEach(function (r, i) { g.beginPath(); g.arc(cx, cy, r, a - 0.75, a + 0.75); H.vien(g, mau || BM.vecDen, 3.2 - i * 0.4); });
    };
    /** Mũi tên dày (thân + đầu) từ (x0, y0) tới (x1, y1). */
    c.muiTen = function (x0, y0, x1, y1, mau, day) {
      var a = Math.atan2(y1 - y0, x1 - x0), d = day || 5, L = d * 1.6, bx = x1 - Math.cos(a) * L, by = y1 - Math.sin(a) * L, nx = -Math.sin(a), ny = Math.cos(a);
      H.duong(g, 'M' + x0 + ' ' + y0 + ' L' + bx.toFixed(2) + ' ' + by.toFixed(2)); H.vien(g, BM.vecVien, d + 3); H.vien(g, mau || BM.vecVang, d);
      H.duong(g, 'M' + x1 + ' ' + y1 + ' L' + (bx + nx * L * 0.8).toFixed(2) + ' ' + (by + ny * L * 0.8).toFixed(2) + ' L' + (bx - nx * L * 0.8).toFixed(2) + ' ' + (by - ny * L * 0.8).toFixed(2) + ' Z');
      H.to(g, mau || BM.vecVang); H.vien(g, BM.vecVien, 2);
    };
    /** Mũi tên vòng (vòng lặp): cung gần kín tâm (cx, cy) bán kính r, đầu mũi tên ở cuối. */
    c.vong = function (cx, cy, r, mau, day) {
      var a0 = -Math.PI * 0.35, a1 = Math.PI * 1.35, d = day || 6, ex = cx + Math.cos(a1) * r, ey = cy + Math.sin(a1) * r;
      g.beginPath(); g.arc(cx, cy, r, a0, a1); H.vien(g, BM.vecVien, d + 3); g.beginPath(); g.arc(cx, cy, r, a0, a1); H.vien(g, mau || BM.vecTimDam, d);
      var tx = -Math.sin(a1), ty = Math.cos(a1), nx = Math.cos(a1), ny = Math.sin(a1), L = d * 1.5;       // tiếp tuyến (chiều tăng góc) và pháp tuyến
      H.duong(g, 'M' + (ex + tx * L).toFixed(2) + ' ' + (ey + ty * L).toFixed(2) + ' L' + (ex + nx * L).toFixed(2) + ' ' + (ey + ny * L).toFixed(2) + ' L' + (ex - nx * L).toFixed(2) + ' ' + (ey - ny * L).toFixed(2) + ' Z');
      H.to(g, mau || BM.vecTimDam); H.vien(g, BM.vecVien, 2);
    };
    /** Khối code (thẻ bo góc màu nhóm lệnh) w × h tâm (cx, cy); chu = [[chữ, màu, cỡ, dx]] canh giữa một dòng. */
    c.khoi = function (cx, cy, w, h, nen, chu, dong) {
      H.bo(g, cx - w / 2, cy - h / 2, w, h, 7); H.to(g, nen); H.vien(g, BM.vecVien, 2.5);
      H.bo(g, cx - w / 2 + 3, cy - h / 2 + 3, w - 6, 4, 2); g.globalAlpha = 0.35; H.to(g, BM.vecVo); g.globalAlpha = 1;
      g.textAlign = 'center'; g.textBaseline = 'middle';
      (chu || []).forEach(function (t) { g.font = PHONG.replace('{c}', t[2]); g.fillStyle = t[1]; g.fillText(t[0], cx + (t[3] || 0), cy + (t[4] || 0)); });
      (dong || []).forEach(function (d) { H.bo(g, cx - w / 2 + 7, d[0], d[1], 3.5, 1.75); H.to(g, d[2]); });
    };
    /** Tia đỏ đứt (hồng ngoại) từ (x0, y) tới (x1, y). */
    c.tiaDo = function (x0, x1, y) { g.setLineDash([4, 3]); H.duong(g, 'M' + x0 + ' ' + y + ' H' + x1); H.vien(g, BM.vecDo, 2.6, 'butt'); g.setLineDash([]); };
    return c;
  }

  function sao(g, cx, cy, r, mau) {
    var d = '', i, a, rr;
    for (i = 0; i < 10; i++) { a = -Math.PI / 2 + i * Math.PI / 5; rr = i % 2 ? r * 0.46 : r; d += (i ? ' L' : 'M') + (cx + Math.cos(a) * rr).toFixed(2) + ' ' + (cy + Math.sin(a) * rr).toFixed(2); }
    H.duong(g, d + ' Z'); g.fillStyle = mau || H.gradToa(g, cx - r * 0.3, cy - r * 0.4, r * 1.5, [[0, BM.vecVangSang], [0.5, BM.vecVang], [1, BM.vecVangToi]]); g.fill(); H.vien(g, BM.vecVien, Math.max(1.6, r * 0.16));
  }

  /* ---------------------------------------------------------------- vành + đĩa */
  var VANH = {
    mo: [BM.vecBacSang, BM.vecBac, BM.vecBacToi],
    xong: [BM.vecVangSang, BM.vecVang, BM.vecVangToi],
    khoa: [BM.vecDinh, BM.vecSat, BM.vecSatToi]
  };
  function vanh(g, tt) {
    var m = VANH[tt];
    H.tron(g, 52, 54, R_VANH); H.to(g, H.rgba(BM.vecVienRgb, 0.14));                                 // bóng đổ lệch phải-dưới
    H.tron(g, 50, 50, R_VANH); g.fillStyle = H.gradDoc(g, 20, 8, 80, 92, [[0, m[0]], [0.5, m[1]], [1, m[2]]]); g.fill(); H.vien(g, BM.vecVien, 3);
    g.beginPath(); g.arc(50, 50, R_VANH - 4, Math.PI * 1.05, Math.PI * 1.55); g.globalAlpha = 0.75; H.vien(g, BM.vecVo, 2.5); g.globalAlpha = 1;   // vệt sáng trái trên
    [[50, 7], [50, 93], [7, 50], [93, 50]].forEach(function (q) { H.tron(g, q[0], q[1], 2.4); H.to(g, BM.vecDinh); H.vien(g, BM.vecDinhVien, 1.2); });   // đinh tán
    H.tron(g, 50, 50, R_DIA); g.fillStyle = H.gradToa(g, 42, 38, R_DIA * 1.4, [[0, BM.vecVo], [0.7, BM.vecVoGiua], [1, BM.vecVoToi]]); g.fill(); H.vien(g, BM.vecVien, 2.5);
  }
  function khoa(g) {                                                                                  // ổ khoá giữa đĩa
    H.duong(g, 'M40 50 V42 C40 30 60 30 60 42 V50'); H.vien(g, BM.vecVien, 8); H.vien(g, BM.vecBac, 4);
    H.bo(g, 33, 47, 34, 26, 6); g.fillStyle = H.gradDoc(g, 0, 47, 0, 73, [[0, BM.vecVangSang], [1, BM.vecVangToi]]); g.fill(); H.vien(g, BM.vecVien, 2.8);
    H.tron(g, 50, 57, 3.4); H.to(g, BM.vecVien); H.duong(g, 'M50 58 V65'); H.vien(g, BM.vecVien, 3);
  }

  /** Vẽ huy hiệu `ma` trạng thái tt ('khoa' | 'mo' | 'xong') ra canvas cạnh canhPx; null nếu chưa có hình vector. */
  function ve(ma, tt, canhPx) {
    var f = HINH[ma]; if (!f) return null;
    tt = tt === 'khoa' || tt === 'xong' ? tt : 'mo';
    var canh = Math.max(8, Math.round(canhPx || 72)), khoaDem = ma + '|' + tt + '|' + canh;
    if (dem[khoaDem]) return dem[khoaDem];
    if (++soDem > 300) { dem = {}; soDem = 1; }
    var cv = V.taoCanvas(canh, canh), g = cv.getContext('2d'), k = canh / 100;
    g.save(); g.scale(k, k);
    vanh(g, tt);
    g.save(); H.tron(g, 50, 50, R_HINH); g.clip();
    f(g, boDung(g, k), tt);
    if (tt === 'khoa') {                                                                              // bạc màu + lớp sương: hình mờ đi, ổ khoá nổi lên
      g.globalCompositeOperation = 'saturation'; H.tron(g, 50, 50, R_HINH); H.to(g, BM.vecSat);
      g.globalCompositeOperation = 'source-over'; H.tron(g, 50, 50, R_HINH); H.to(g, H.rgba(BM.vecMatSangRgb, 0.38));
    }
    g.restore();
    if (tt === 'khoa') khoa(g);
    if (tt === 'xong') sao(g, 79, 80, 15);
    g.restore();
    cv.laVector = true; cv.laHuyHieu = true;
    return (dem[khoaDem] = cv);
  }

  /* ---------------------------------------------------------------- hình của từng chương */
  var KEP = { than: 'hai-banh', tay: 'kep', camBien: [] }, CAM = [{ ma: 'khoang-cach', o: 'hong' }];
  var VUI = { than: { mat: 'vui' } };
  function st(than, tay, cam) { var s = { than: Object.assign({ mat: 'vui' }, than || {}) }; if (tay) s.tay = tay; if (cam) s.camBien = cam; return s; }
  function dk(ma, f) { HINH[ma] = f; }
  /* BÍ DANH (V7c1): mã huy hiệu dùng lại hình của mã khác. Dữ liệu chụp từ huy-hieu.js pixel (HINH[a] = HINH[b]) ở c0, máy kiểm so với hoc/du-lieu-chup-pixel.json. */
  var BI_DANH = {
    'me-cung': 'khoang-cach',
    'cam-bien-ben': 'khoang-cach',
    'doi-ho-bang': 'hai-robot',
    'doi-gap-nem': 'hai-robot',
    'che-doi-ho-bang': 'hai-robot',
    'che-doi-gap-nem': 'hai-robot',
    'doi-xich': 'hai-robot',
    'che-doi-xich': 'hai-robot',
    'doi-omni': 'hai-robot',
    'che-doi-omni': 'hai-robot',
    'doi-sung-hoi': 'hai-robot',
    'che-doi-sung-hoi': 'hai-robot',
    'doi-mau': 'hai-robot',
    'che-doi-mau': 'hai-robot',
    'doi-nam-cham': 'hai-robot',
    'che-doi-nam-cham': 'hai-robot',
    'doi-tay-xoay': 'hai-robot',
    'che-doi-tay-xoay': 'hai-robot',
    'doi-drone': 'hai-robot',
    'che-doi-drone': 'hai-robot'
  };
  function maGoc(ma) { return BI_DANH[ma] || ma; }
  function dsTatCa() { return Object.keys(HINH).concat(Object.keys(BI_DANH).filter(function (k) { return !HINH[k]; })); }
  /** Robot cầm vật (tay kẹp / tay xoay): vật vẽ trước (dưới càng), rồi robot. */
  function robotCam(c, cfg, s, huong, cx, cy, canh, vat, goc) {
    var tt = s.tay && s.tay.tuThe === 'duoi' ? 'duoi' : 'tren', o = c.vua(cfg, tt, huong, cx, cy, canh, goc);   // gói V7a: vừa đĩa, không lẹm viền
    var p = c.vatCam(cfg, tt, huong, o.cx, o.cy, o.canh, goc);
    if (p) c.vat(vat || 'thung-go', {}, p.x, p.y, p.n);
    c.robot(cfg, s, huong, o.cx, o.cy, o.canh);
  }
  /** Huy hiệu "chế lệnh": hình nhỏ lệch trái dưới + bánh răng góc trên phải. */
  function che(f) { return function (g, c, tt) { f(g, c, tt); c.banhRang(68, 30, 13); }; }

  ['hai-banh', 'xich', 'nhen', 'omni', 'drone'].forEach(function (t) {
    dk(t, function (g, c) { c.robot({ than: t }, st(t === 'drone' ? { quat: true } : null), 0, 50, 52, 70); });
  });
  dk('xuong-ham', function (g, c) {
    c.khoi(50, 50, 58, 40, BM.vecTimDam, [['def', BM.vecVo, 15, 0, -6]], [[55, 30, BM.vecTimNhat], [62, 20, BM.vecTimNhat]]);
  });
  dk('tham-so', function (g, c) {
    c.khoi(50, 50, 60, 36, BM.vecTroiDam, [['(', BM.vecVang, 22, -17], ['n', BM.vecVo, 22, 0], [')', BM.vecVang, 22, 17]]);
  });
  dk('tay-gap', function (g, c) { robotCam(c, KEP, st(null, { tuThe: 'tren', kep: 'dong', cam: true }), 0, 50, 60, 64); });
  dk('che-tay', che(function (g, c) {
    var cfg = KEP, o = c.vua(cfg, 'tren', 0, 42, 62, 52), p = c.vatCam(cfg, 'tren', 0, o.cx, o.cy - 4, o.canh);   // gói V7a: vừa đĩa (vật mở kẹp cách 4 đơn vị)
    c.vat('khoi-sat', {}, p.x, p.y, p.n); c.robot(cfg, st(null, { tuThe: 'tren', kep: 'mo' }), 0, o.cx, o.cy, o.canh);
  }));
  function namCham(g, c, cx, cy, canh) {
    var cfg = { than: 'hai-banh', tay: 'nam-cham' }, p = c.truoc(0, cx, cy, canh, c.hh(cfg).mz + 12);
    c.vat('khoi-sat', {}, p.x, p.y, canh * 0.26);
    c.robot(cfg, st(null, { bat: true, cuc: 'N' }), 0, cx, cy, canh);
  }
  dk('nam-cham', function (g, c) { namCham(g, c, 50, 62, 60); });
  dk('che-nam-cham', che(function (g, c) { namCham(g, c, 42, 64, 50); }));
  function mayNem(g, c, cx, cy, canh, nho) {
    var cfg = { than: 'hai-banh', tay: 'nem' };
    c.robot(cfg, st(null, { dangNem: true, vung: 1 }), 1, cx, cy, canh);
    var pts = nho ? [[46, 56], [53, 51], [60, 51], [66, 55]] : [[50, 40], [58, 32], [67, 30], [76, 34], [82, 42]];
    pts.forEach(function (q) { H.tron(g, q[0], q[1], 2.6); H.to(g, BM.vecVang); H.vien(g, BM.vecVien, 1.4); });
    var e = pts[pts.length - 1]; c.vat('thung-go', {}, e[0] + 1, e[1] + 14, nho ? 11 : 14);
  }
  dk('may-nem', function (g, c) { mayNem(g, c, 30, 60, 52); });
  dk('che-may-nem', che(function (g, c) { mayNem(g, c, 30, 64, 46, true); }));
  function sungHoi(g, c, cx, cy, canh, bong) {
    var cfg = { than: 'hai-banh', tay: 'hoi' }, mz = c.hh(cfg).mz;
    c.robot(cfg, st(null, { dangBanTruoc: true }), 1, cx, cy, canh);
    (bong || [[8, 16]]).forEach(function (b) { var p = c.truoc(1, cx, cy, canh, mz + b[0]); c.vat('bong', {}, p.x + b[1] * 0.5, p.y, b[1]); });
  }
  dk('sung-hoi', function (g, c) { sungHoi(g, c, 34, 54, 58, [[16, 16]]); });
  dk('luc-ban', function (g, c) { sungHoi(g, c, 30, 54, 52, [[6, 10], [30, 18]]); });
  dk('che-sung-hoi', che(function (g, c) { sungHoi(g, c, 32, 62, 48, [[10, 13]]); }));
  dk('che-luc-ban', che(function (g, c) { c.vat('bong', {}, 32, 60, 12); c.vat('bong', {}, 52, 62, 20); }));
  function camBien(g, c, cx, cy, canh) {
    c.robot({ than: 'hai-banh', camBien: CAM }, st(null, null, { bat: true }), 1, cx, cy, canh);
    c.song(cx + canh * 0.42, cy, 0, [canh * 0.14, canh * 0.25, canh * 0.36]);
  }
  dk('khoang-cach', function (g, c) { camBien(g, c, 36, 52, 58); });
  dk('che-cam-bien', che(function (g, c, tt) {
    camBien(g, c, 32, 62, 46);
    g.font = PHONG.replace('{c}', 18); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = BM.vecBrand; g.fillText('?', 68, 64);
  }));
  dk('mau', function (g, c) { ['red', 'green', 'yellow', 'blue'].forEach(function (m, i) { c.o('san-mau', { mau: m }, 37 + (i % 2) * 26, 37 + Math.floor(i / 2) * 26, 26); }); });
  dk('che-mau', che(function (g, c) { ['red', 'green', 'yellow', 'blue'].forEach(function (m, i) { c.o('san-mau', { mau: m }, 30 + (i % 2) * 19, 50 + Math.floor(i / 2) * 19, 19); }); }));
  dk('bang-chuyen', function (g, c) {
    c.o('bang', { huong: 1, pha: 0 }, 36, 58, 28); c.o('bang', { huong: 1, pha: 0 }, 64, 58, 28);
    c.vat('thung-go', {}, 44, 50, 20);
  });
  dk('vong-lap', function (g, c) { c.vong(50, 50, 20); });
  dk('che-lap', che(function (g, c) { c.vong(40, 58, 15, null, 5); }));
  dk('che-xe', che(function (g, c) { c.robot({ than: 'hai-banh' }, st({ banh: { trai: 1, phai: 1 } }), 1, 42, 60, 56); }));
  dk('banh-lui', function (g, c) {
    c.robot({ than: 'hai-banh' }, st({ banh: { trai: 1, phai: 1 } }), 1, 58, 56, 58);
    c.muiTen(40, 30, 16, 30, BM.vecVang, 5);
    [[20, 62], [16, 70], [24, 72]].forEach(function (q) { H.tron(g, q[0], q[1], 3); H.to(g, H.rgba(BM.vecVienRgb, 0.18)); });
  });
  dk('nut-de', function (g, c) { c.o('nut-de', { de: true }, 50, 54, 52); c.vat('thung-go', {}, 50, 50, 22); });
  function hongNgoai(g, c, cx, cy, canh, x1) {
    var cfg = { than: 'hai-banh', camBien: [{ ma: 'hong-ngoai', o: 'tren' }] }, o = V.diemCamBien(cfg, 'hong-ngoai', 1, canh)[0];
    var oy = o ? cy + (o.y - canh / 2) : cy, ox = o ? cx + (o.x - canh / 2) : cx + canh * 0.4;
    c.o('tuong', {}, x1 + 8, oy, 16);
    c.tiaDo(ox + 2, x1, oy);
    c.robot(cfg, st(null, null, { bat: true }), 1, cx, cy, canh);
  }
  dk('hong-ngoai', function (g, c) { hongNgoai(g, c, 30, 54, 50, 72); });
  dk('che-hong-ngoai', che(function (g, c) { hongNgoai(g, c, 28, 64, 42, 64); }));
  dk('che-nhen', che(function (g, c) { c.robot({ than: 'nhen' }, st({ co: true }), 0, 42, 60, 56); }));
  function veDs(g, c, so, cx, cy, o) {
    var w = so.length * o + 10, x0 = cx - w / 2;
    H.duong(g, 'M' + (x0 + 4) + ' ' + (cy - o * 0.7) + ' h-4 v' + (o * 1.4) + ' h4 M' + (x0 + w - 4) + ' ' + (cy - o * 0.7) + ' h4 v' + (o * 1.4) + ' h-4'); H.vien(g, BM.vecVien, 3, 'butt');
    so.forEach(function (d, i) {
      var x = x0 + 5 + i * o;
      H.bo(g, x + 1, cy - o / 2 + 1, o - 2, o - 2, 3); H.to(g, BM.vecChanhNhat); H.vien(g, BM.vecChanhDam, 2);
      g.font = PHONG.replace('{c}', o * 0.62); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = BM.vecChanhChu; g.fillText(d, x + o / 2, cy + 0.5);
    });
  }
  dk('list', function (g, c) { veDs(g, c, ['4', '2', '3'], 50, 50, 18); });
  dk('che-list', che(function (g, c) { veDs(g, c, ['2', '3'], 40, 60, 16); }));
  dk('che-xich', che(function (g, c) { c.robot({ than: 'xich' }, st(), 1, 42, 60, 56); }));
  // Mùa 2 gói 1 chương 2 "Biến cho xích" (trùm bien-xich.10 đếm bước bằng biến n): xe xích đi lên + khối biến "n+1" + mũi tên đếm.
  dk('bien-xich', function (g, c) {
    c.robot({ than: 'xich' }, st({ banh: { trai: 1, phai: 1 } }), 0, 36, 62, 46);
    c.khoi(66, 34, 40, 26, BM.vecTroiDam, [['n', BM.vecVo, 18, -9], ['+1', BM.vecVang, 15, 9]]);
    c.muiTen(68, 80, 68, 56, BM.vecVang, 4.5);
  });
  function dayThung(g, c, cx, cy, canh) {
    c.vat('thung-nang', {}, cx + canh * 0.6, cy, canh * 0.62);
    c.robot({ than: 'xich' }, st({ banh: { trai: 1, phai: 1 } }), 1, cx, cy, canh);
  }
  dk('day-thung', function (g, c) { dayThung(g, c, 36, 58, 42); c.muiTen(52, 30, 76, 30, BM.vecVang, 5); });
  dk('che-day-thung', che(function (g, c) { c.vat('thung-nang', {}, 40, 62, 30); c.muiTen(22, 36, 44, 36, BM.vecVang, 4.5); }));
  function nutNong(g, c, cx, cy, canh) {
    c.o('nut-ban', { loe: true }, cx, cy, canh);
    [-10, 0, 10].forEach(function (dx) { H.duong(g, 'M' + (cx + dx) + ' ' + (cy - canh * 0.36) + ' c-4 -5 4 -8 0 -14'); H.vien(g, BM.vecDo, 2.6); });
  }
  dk('do-nhiet', function (g, c) { nutNong(g, c, 50, 58, 50); });
  dk('che-do-nhiet', che(function (g, c) { nutNong(g, c, 40, 64, 40); }));
  dk('che-omni', che(function (g, c) { c.robot({ than: 'omni' }, st(), 0, 42, 60, 56); }));
  dk('che-drone', che(function (g, c) { c.robot({ than: 'drone' }, st({ quat: true }), 0, 42, 60, 56); }));
  dk('flycam', function (g, c) {
    c.o('san-mau', { mau: 'red' }, 38, 74, 20); c.o('san-mau', { mau: 'blue' }, 62, 74, 20);
    c.robot({ than: 'drone', camBien: [{ ma: 'camera-bay', o: 'bung' }] }, st({ quat: true }, null, { mat: true }), 0, 50, 42, 56);
  });
  function maySon(g, c, cx, cy, canh, net) {
    if (net) { H.duong(g, net); H.vien(g, BM.luatSonDo, 6); }
    c.robot({ than: 'hai-banh', tay: 'son' }, st(null, { tuThe: 'duoi', mauSon: 'red' }), 1, cx, cy, canh);
  }
  dk('may-son', function (g, c) { maySon(g, c, 34, 46, 50, 'M40 70 H66 V52'); });
  dk('che-may-son', che(function (g, c) { maySon(g, c, 36, 62, 48); }));
  var XOAY = { than: 'hai-banh', tay: 'xoay' };
  dk('tay-xoay', function (g, c) { robotCam(c, XOAY, st(null, { tuThe: 'tren', kep: 'dong', cam: true, goc: -90 }), 0, 56, 56, 54, 'thung-go', -90); });
  dk('che-tay-xoay', che(function (g, c) { robotCam(c, XOAY, st(null, { tuThe: 'tren', kep: 'dong', cam: true, goc: -90 }), 0, 50, 62, 46, 'thung-go', -90); }));
  var DU_BO = { than: 'hai-banh', tay: 'xoay', camBien: CAM };
  dk('combo', function (g, c) {
    c.vat('thung-go', {}, 22, 46, 12); c.vat('thung-go', {}, 78, 46, 12);          // gói V7a: hai thùng dời vào trong đĩa (cũ 18 / 82 cỡ 14 lẹm viền)
    c.tiaDo(30, 40, 46); c.tiaDo(70, 60, 46);
    c.robot(DU_BO, st(null, { tuThe: 'tren', kep: 'mo' }, { bat: true }), 0, 50, 54, 54);
  });
  dk('che-combo', che(function (g, c) { robotCam(c, DU_BO, st(null, { tuThe: 'tren', kep: 'dong', cam: true, goc: -90 }, { bat: true }), 0, 50, 62, 46, 'thung-go', -90); }));
  dk('robot-hoan-thien', function (g, c) { c.robot(DU_BO, st(null, { tuThe: 'tren', kep: 'mo' }), 0, 50, 58, 58); c.sao(50, 22, 9); });
  dk('xuat-xuong', function (g, c) { c.robot(DU_BO, st(null, { tuThe: 'tren', kep: 'mo' }, { bat: true }), 0, 50, 56, 60); c.sao(24, 30, 7); c.sao(76, 30, 7); });
  function haiRobot(g, c) {
    c.vat('thung-go', {}, 50, 34, 14);
    c.robot({ than: 'hai-banh', son: '' }, st(), 0, 30, 60, 42);
    c.robot({ than: 'hai-banh', son: 'lam' }, st(), 0, 70, 60, 42);
  }
  dk('hai-robot', haiRobot);
  /* gói V7a: gói 8 mùa 2 "Đội" (doi-mua-2): hai xe đội (R1, R2) như hai-robot, giữa hai xe là sóng nhiệt đỏ (mắt hồng ngoại thấy bạn nóng); chế = thêm bánh răng. */
  function songNhiet(g, x, y0, n, b) {
    var i, y = y0;
    g.beginPath(); g.moveTo(x, y);
    for (i = 0; i < n; i++, y += b * 2.6) g.quadraticCurveTo(x + (i % 2 ? -b : b), y + b * 1.3, x, y + b * 2.6);   // đường lượn dọc (H.duong không có lệnh q)
    H.vien(g, H.rgba(BM.vecVienRgb, 0.3), 4.6); H.vien(g, BM.vecDo, 2.6);
  }
  function doiMua2(g, c, cy, canh, coThung) {
    if (coThung) c.vat('thung-go', {}, 50, 30, 14);
    c.robot({ than: 'hai-banh', son: '' }, st(), 0, 32, cy, canh);
    c.robot({ than: 'hai-banh', son: 'lam' }, st(), 0, 68, cy, canh);
    songNhiet(g, 47.5, cy - canh * 0.3, 3, 2); songNhiet(g, 52.5, cy - canh * 0.3, 3, -2);
  }
  dk('doi-mua-2', function (g, c) { doiMua2(g, c, 60, 34, true); });
  dk('che-doi-mua-2', che(function (g, c) { doiMua2(g, c, 62, 33, false); }));
  /* gói V7a: gói 9 mùa 2 "Bệ súng xích" (be-sung): xe xích gắn súng hơi, nòng trước vừa bắn ra quả bóng to (bắn tụ), xe đứng yên; chế = thân xích + nòng, thêm bánh răng. */
  function beSung(g, c, cx, cy, canh, bong) {
    var cfg = { than: 'xich', tay: 'hoi' }, mz = c.hh(cfg).mz;
    c.robot(cfg, st(null, { dangBanTruoc: !!bong }), 1, cx, cy, canh);
    if (bong) { var p = c.truoc(1, cx, cy, canh, mz + bong[0]); c.vat('bong', {}, p.x + bong[1] * 0.5, p.y, bong[1]); }
  }
  dk('be-sung', function (g, c) { beSung(g, c, 36, 54, 50, [8, 20]); });
  dk('che-be-sung', che(function (g, c) { beSung(g, c, 38, 62, 50); }));
  /* gói V7b (28/10): gói 10 mùa 2 "Nhà máy chạy lại" (gói 10 chỉ vẽ pixel, bản vector V7b lo): tong-hop-2 = bệ súng xích tì mũi vào thùng nặng
     (tổng hợp xích + súng hơi + thùng); nha-may-chay (trùm cuối mùa 2) = bệ súng xích vừa bắn bóng to, hai sao hai góc trên như xuat-xuong. */
  dk('tong-hop-2', function (g, c) {
    var cx = 32, cy = 56, canh = 46, p = c.truoc(1, cx, cy, canh, c.hh({ than: 'xich', tay: 'hoi' }).mz + 18);
    c.vat('thung-nang', {}, p.x + 7, p.y, 26);
    beSung(g, c, cx, cy, canh);
  });
  dk('nha-may-chay', function (g, c) { beSung(g, c, 36, 58, 48, [8, 18]); c.sao(22, 26, 7); c.sao(78, 26, 7); });
  dk('che-hai-robot', function (g, c) {
    c.o('nut-de', { de: true }, 30, 62, 32); c.robot({ than: 'hai-banh', son: '' }, st(), 0, 30, 62, 34);
    c.o('cua', { k: 1, doc: true }, 68, 34, 30);
    robotCam(c, { than: 'hai-banh', tay: 'kep', son: 'lam' }, st(null, { tuThe: 'tren', kep: 'dong', cam: true }), 0, 68, 66, 34);
  });
  dk('rap-nao', function (g, c) { c.robot({ than: 'xich' }, st(), 0, 46, 56, 62); c.xu(72, 30, 10); });
  dk('rap-du', function (g, c) { robotCam(c, { than: 'hai-banh', tay: 'kep', camBien: CAM }, st(null, { tuThe: 'tren', kep: 'mo' }), 0, 46, 60, 56); c.xu(74, 30, 10); });
  dk('rap-tay', function (g, c) { c.robot({ than: 'omni', tay: 'nam-cham' }, st(null, { bat: true, cuc: 'N' }), 0, 46, 60, 56); c.xu(74, 30, 10); });
  dk('ban-xoay', function (g, c) { c.o('ban-xoay', { chieu: 1, pha: 0 }, 50, 50, 60); });
  dk('che-ban-xoay', che(function (g, c) { c.o('cong', { so: '1', pha: 0 }, 42, 60, 44); }));
  function dua(g, c, x0) {
    c.o('co', { pha: 0.25 }, 76, 36, 24);
    c.robot({ than: 'hai-banh', son: 'do' }, st({ banh: { trai: 1, phai: 1 } }), 1, x0, 62, 32);
    c.robot({ than: 'hai-banh', son: '' }, st({ banh: { trai: 1, phai: 1 } }), 1, x0 + 24, 46, 32);
  }
  dk('dua-robot', function (g, c) { dua(g, c, 32); });
  dk('che-dua-robot', che(function (g, c) { dua(g, c, 30); }));
  dk('doi-thu-manh', function (g, c) {
    c.o('co', { pha: 0.25 }, 78, 36, 22);
    c.robot({ than: 'xich', son: 'do' }, st(), 1, 36, 62, 40);
    c.robot({ than: 'hai-banh', son: '' }, st(), 1, 60, 44, 28);
  });

  V.HUY_HIEU = {
    co: function (ma) { return !!HINH[ma]; },
    ve: ve,
    dangKy: function (ma, f) { if (typeof f !== 'function') throw new Error('HUY_HIEU.dangKy: cần hàm vẽ'); HINH[ma] = f; dem = {}; },
    ds: function () { return Object.keys(HINH); },
    BI_DANH: BI_DANH, maGoc: maGoc, dsTatCa: dsTatCa,
    R_DIA: R_DIA, R_HINH: R_HINH, _sao: sao
  };
})(typeof window !== 'undefined' ? window : globalThis);
