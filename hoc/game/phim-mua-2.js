var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ============================================================================
   phim-mua-2.js — "Robot Chấn Hưng": DỮ LIỆU PHIM GÓI MÙA 2 "Ghi nhớ" (bộ máy chiếu: phim-goi.js, cùng cách phim-mua-1.js).
   Kịch bản: hoc/KE-HOACH-PHIM-GOI.md mục "Kịch bản mùa 2"; nội dung gói: hoc/KE-HOACH-MUA-2.md (mảng MUA_2 trong lo-trinh-hoc.js).
   Mỗi mã gói một mảng 3–4 hàm khung (k, c): k = khung tranh 320×220, c = bộ dựng hình của PhimGoi (c.xe, c.san, c.code…).
   Lời khung n ở chu.js khóa 'pg.<mã gói>.<n>' (≤ 14 từ). Truyện nối phim gói 10 mùa 1: R1 lăn ra khỏi xưởng, thấy bánh xích trên đồi;
   mùa 2 R1 lắp lại xích, nhận súng hơi, mắt hồng ngoại, rồi làm nhà máy cũ chạy lại; phim cuối nhá mùa 3 "Tín hiệu" (nhện, nam châm, sóng từ).
   Hình: sân mini nhìn từ trên (c.san, ô 56 px, robot tỉ lệ 2) hay dải sàn (md-san, robot tỉ lệ 3). Cơ chế mới của mùa 2 (băng chuyền, nút bắn và quầng nóng,
   thùng nặng, bóng hơi) vẽ bằng PhimVector.bang / nutBan / thungNang / bong / nong (V7c2: hết đường lùi pixel; thiếu thì icon / div).
   Huy hiệu mùa 2 chưa có bản vector thì ở vector thay bằng icon bộ phận (không có canvas pixel trong phim vector).
   R1 sơn mặc định (vector: xanh đội R1), R2 sơn lam (vector: hồng đội R2).
   Node (máy kiểm kiem-phim-goi.mjs) require tệp này lấy bảng PHIM (không chạy hàm vẽ nào).
   ========================================================================== */
(function (goc) {
  'use strict';

  var HN = [{ ma: 'hong-ngoai', o: 'tren' }];
  var XE = { than: 'hai-banh', tay: null, camBien: [] };                  // R1 cuối mùa 1 (chưa lắp xích; tay xoay để lại xưởng)
  var XICH = { than: 'xich', tay: null, camBien: [] };
  var XH = { than: 'xich', tay: 'hoi', camBien: [] };                     // xích + súng hơi (từ gói 2)
  var XHN = { than: 'xich', tay: 'hoi', camBien: HN };                    // xích + súng hơi + hồng ngoại (từ gói 3)
  var R2 = { than: 'hai-banh', tay: 'hoi', camBien: HN, son: 'lam' };     // R2 gói 8: hai bánh + súng hơi + hồng ngoại
  var HUY = ['xich', 'sung-hoi', 'hong-ngoai', 'bang-chuyen', 'day-thung', 'luc-ban', 'do-nhiet', 'be-sung', 'tong-hop-2', 'nha-may-chay'];   // huy hiệu chương 1 các gói mùa 2 (+ gói 10 và trùm, V7b) bay trong phim gói 10
  var Y = 158;                                    // tâm thân R1 khi đứng trên dải sàn (tỉ lệ 3)
  var BAN = { tay: { tuThe: 'tren', dangBanTruoc: true } }, BAN_SAU = { tay: { tuThe: 'tren', dangBanSau: true } }, YEN = { tay: { tuThe: 'tren' } };
  var DO = { camBien: { bat: true } };

  /* ---------------------------------------------------------------- hình cơ chế mùa 2 (PhimVector; dự phòng: icon / div) */
  function PV() { return goc.PhimVector || null; }
  function veBang(c, s, huong, pha) { var v = PV() && PhimVector.bang(s, huong, pha); return v || c.ico('bang', s); }
  function veNut(c, bat, s) {
    var v = PV() && PhimVector.nutBan(!!bat, s); if (v) return v;
    return c.ico('nutban', s, bat ? BM.do : BM.vang);
  }
  function veNang(c, s) { var v = PV() && PhimVector.thungNang(s); return v || c.o('thung', s); }
  function veBong(c, s) {
    var v = PV() && PhimVector.bong(s); if (v) return v;
    var e = c.h('div'); var w = 6 * s;
    e.style.width = e.style.height = w + 'px'; e.style.borderRadius = '50%'; e.style.background = BM.xanhLoSang2; e.style.boxShadow = '0 0 0 2px ' + BM.vienDam;
    return e;
  }
  /** Quầng nóng (luật warm()) đặt chồng lên ô cạnh 14·s ở (x, y); pixel: khung cam nhấp nháy. */
  function quangNong(k, c, s, x, y) {
    var v = PV() && PhimVector.nong(s, 0), e;
    if (v) e = c.dat(v, x, y, 'pg-nhay');
    else { e = c.dat(c.h('div'), x + 2, y + 2, 'pg-nhay'); e.style.width = e.style.height = (14 * s - 4) + 'px'; e.style.boxShadow = 'inset 0 0 0 3px ' + BM.do; }
    k.appendChild(e); return e;
  }

  /**
   * Sân mini mùa 2: như c.san (ô 14·s) và thêm ký tự
   *   '>' '<' '^' 'v' băng chuyền · 'N' nút bắn tắt · 'n' nút bắn đang bật (nóng) · 'H' thùng nặng
   * Trả về kq của c.san cộng: bang: [{ e, x, y, huong }], nb: { 'x,y': ô nút bắn (.dat(bat)) }, nang: { 'x,y': thùng nặng }, chay(ms, soNhip) cho băng chạy.
   */
  var HUONG_BANG = { '^': 0, '>': 1, 'v': 2, '<': 3 };
  function san2(k, c, rows, s, x0, y0) {
    var kq = c.san(k, rows.map(function (r) { return r.replace(/[<>^vNnH]/g, '.'); }), s, x0, y0), canh = 14 * s;
    kq.bang = []; kq.nb = {}; kq.nang = {};
    rows.forEach(function (r, y) {
      for (var x = 0; x < r.length; x++) {
        var ch = r[x], px = x0 + x * canh, py = y0 + y * canh, khoa = x + ',' + y;
        if (HUONG_BANG[ch] !== undefined) { var b = c.dat(c.h('div'), px, py); b.appendChild(veBang(c, s, HUONG_BANG[ch], 0)); k.appendChild(b); kq.bang.push({ e: b, huong: HUONG_BANG[ch] }); }
        else if (ch === 'N' || ch === 'n') {
          var o = c.dat(c.h('div'), px, py);
          o.dat = (function (o, px, py) { return function (bat) { o.innerHTML = ''; o.appendChild(veNut(c, bat, s)); if (o.nong) { o.nong.remove(); o.nong = null; } if (bat) o.nong = quangNong(k, c, s, px, py); }; })(o, px, py);
          k.appendChild(o); o.dat(ch === 'n'); kq.nb[khoa] = o;
        } else if (ch === 'H') k.appendChild(kq.nang[khoa] = c.dat(veNang(c, s), px, py));
      }
    });
    /** Băng chạy từ ms, soNhip nhịp vạch (130 ms một nhịp; hữu hạn để hẹn giờ của khung luôn dứt). */
    kq.chay = function (ms, soNhip) {
      for (var i = 1; i <= (soNhip || 24); i++) (function (i) {
        c.sau(ms + i * 130, function () { kq.bang.forEach(function (b) { b.e.innerHTML = ''; b.e.appendChild(veBang(c, s, b.huong, i % 5)); }); });
      })(i);
    };
    return kq;
  }

  /** Dời phần tử (left/top) sau ms, có trượt (lớp pg-truot, thời lượng giây). */
  function truot(c, e, ms, x, y, giay) {
    e.classList.add('pg-truot'); e.style.setProperty('--tg', (giay || 1) + 's');
    c.sau(ms, function () { e.style.left = x + 'px'; if (y !== undefined) e.style.top = y + 'px'; });
  }
  /** Bóng hơi bay từ tâm (x0, y0) tới tâm (x1, y1): hiện ở ms, bay giay giây, tới nơi thì biến mất (roi = true: rơi xuống sàn mờ dần). */
  function banBong(k, c, s, x0, y0, x1, y1, ms, giay, roi) {
    var w = 6 * s, b = c.dat(veBong(c, s), x0 - w / 2, y0 - w / 2);
    var nhom = c.tu(b, ms / 1000); k.appendChild(nhom);
    b.classList.add('pg-truot'); b.style.setProperty('--tg', giay + 's');
    c.sau(ms + 20, function () { b.style.left = (x1 - w / 2) + 'px'; b.style.top = (y1 - w / 2) + 'px'; c.keu('ban'); });
    c.sau(ms + giay * 1000 + 40, function () { if (roi) { b.style.setProperty('--tg', '.3s'); b.style.top = (y1 - w / 2 + 12) + 'px'; b.style.opacity = '0.4'; } else b.classList.add('pg-an-ngay'); });
    if (roi) c.sau(ms + giay * 1000 + 400, function () { b.classList.add('pg-an-ngay'); });
    return b;
  }
  /** Chữ tượng thanh nhỏ (PHỤT!, BỤP!, NÓNG!) ở (x, y), bật lên từ giây t. */
  function tieng(k, c, chu, x, y, t) { var e = c.chu('md-ram pg-cach', chu); e.style.left = x + 'px'; e.style.top = y + 'px'; e.style.fontSize = '24px'; e.style.animationDelay = t + 's'; k.appendChild(e); return e; }
  /** Dấu hỏi / chấm than trên đầu ở (x, y) từ giây t. */
  function hoi(k, c, chu, x, y, t) { var e = c.chu('md-hoi', chu); e.style.left = x + 'px'; e.style.top = y + 'px'; e.style.animationDelay = t + 's'; k.appendChild(e); return e; }
  /** Số nhịp / số ô bật lên ở (x, y) từ giây t. */
  function nhip(k, c, so, x, y, t) { var e = c.chu('md-hoi pg-nhip', so); e.style.left = x + 'px'; e.style.top = y + 'px'; e.style.animationDelay = t + 's'; k.appendChild(e); return e; }
  /** Bọc robot r trong lớp xoay quanh tâm (cx, cy) (xích quay chậm: nửa góc mỗi nhịp). Trả lớp có .goc(độ). */
  function lopXoay(k, c, r, cx, cy) {
    var w = c.dat(c.h('div'), 0, 0); w.style.width = '320px'; w.style.height = '220px'; w.style.transformOrigin = cx + 'px ' + cy + 'px'; w.style.transition = 'transform .35s';
    w.appendChild(r); k.appendChild(w);
    w.goc = function (d) { w.style.transform = 'rotate(' + d + 'deg)'; return w; };
    return w;
  }
  /** Món đồ (icon) bay từ (x0, y0) tới (x1, y1) xoay một vòng, biến mất lúc tới (giây t1). */
  function bayToi(k, c, e, x0, y0, x1, y1, t0, t1) {
    var vx = c.h('div', 'md-a md-vx'); vx.style.left = x0 + 'px'; vx.style.top = y0 + 'px'; vx.style.setProperty('--x', (x1 - x0) + 'px'); vx.style.animationDelay = t0 + 's';
    var vy = c.h('div', 'md-vy'); vy.style.setProperty('--y', (y1 - y0) + 'px'); vy.style.setProperty('--r', '360deg'); vy.style.animationDelay = t0 + 's';
    vy.appendChild(e); vx.appendChild(vy); k.appendChild(c.tu(vx, t1, true));
  }
  /** Robot cũ ẩn ở giây t, robot mới (cfg) hiện đúng chỗ đó: lắp bộ phận, CẠCH! */
  function lap(k, c, cu, moi, t) { k.appendChild(c.tu(cu, t, true)); k.appendChild(c.tu(moi, t)); var cach = c.chu('md-ram pg-cach', 'CẠCH!'); cach.style.animationDelay = t + 's'; k.appendChild(cach); c.sau(t * 1000, function () { c.keu('kep'); }); }
  /** Cột tường ở x (ba ô tường cạnh 42, đáy chạm sàn). */
  function tuong(k, c, x) { [64, 106, 148].forEach(function (y) { k.appendChild(c.dat(c.o('wall', 3), x, y)); }); }
  /** Huy hiệu ma (trạng thái xong) cạnh 36 px (HuyHieu.mk vector); chưa có bản vector thì sao. */
  function huyHieu(c, ma) {
    var HH = goc.HuyHieu;
    try { if (HH && HH.maVec && HH.maVec(ma) && HH.mk) { var v = HH.mk(ma, 'xong', 1); if (v && v.laVector) return v; } } catch (e) { /* rơi về sao */ }
    return c.sao(2);                                                   // V7b: mọi mã đều có bản vector (máy kiểm A6), đường tạm icon trong khung tròn đã gỡ
  }
  /** Chữ qua t() của chu.js (Node không có t: trả khóa). */
  function t2(khoa) { return typeof t === 'function' ? t(khoa) : khoa; }
  /** Đặt nhãn tên robot lên đầu bảng code. */
  function bangTen(c, bang, ten, cls) { var d = c.h('div', 'pg-ten ' + (cls || ''), ten); bang.insertBefore(d, bang.firstChild); }

  var C1 = 56, X0 = 20, Y0 = 26;                  // sân mini: ô 14·4 = 56 px, góc (20, 26), 5 × 3 ô

  var PHIM = {
    /* ---------------------------------------------------------------- 1 · Bánh xích */
    'xich': [
      // 1 · ngoài xưởng, bánh xích văng hôm trước nằm trên đồi; R1 hai bánh lăn tới
      function (k, c) {
        c.nen(k, 'pg-troi'); c.nen(k, 'pg-doi'); c.nen(k, 'md-san pg-dat');
        k.appendChild(c.dat(c.ico('denXich', 3, BM.lamSang), 232, 96, 'pg-nhay'));
        var r = c.xe(XE, {}, 1, 3, -40, Y); k.appendChild(r);
        truot(c, r, 80, 150, Y, 1.4);
        for (var i = 0; i < 5; i++) c.sau(200 + i * 260, function () { c.keu('buoc'); });
        hoi(k, c, '!', 240, 50, 1.6);
        c.sau(1600, function () { r.mat('ngac'); c.keu('moKhoa'); });
      },
      // 2 · bánh xích bay vào thân, R1 thành xe xích, CẠCH!
      function (k, c) {
        c.nen(k, 'pg-troi'); c.nen(k, 'pg-doi'); c.nen(k, 'md-san pg-dat');
        var cu = c.xe(XE, {}, 1, 3, 150, Y), moi = c.xe(XICH, {}, 1, 3, 150, Y);
        bayToi(k, c, c.ico('denXich', 3, BM.lamSang), 232, 96, 136, Y - 20, 0.1, 0.95);
        lap(k, c, cu, moi, 0.95);
        c.sau(1200, function () { moi.mat('vui'); });
      },
      // 3 · xích quay chậm: mỗi nhịp nửa góc, hai nhịp mới đủ góc vuông
      function (k, c) {
        var s = c.san(k, ['.....', '.....', '.....'], 4, X0, Y0), p = s.o(2, 1);
        var r = c.xe(XICH, {}, 1, 2, p.x, p.y), w = lopXoay(k, c, r, p.x, p.y);
        c.sau(600, function () { w.goc(45); r.ve({ wl: 2, wr: 0 }); c.keu('buoc'); });
        nhip(k, c, '1', p.x + 34, p.y - 52, 0.6);
        c.sau(1400, function () { w.goc(90); c.keu('buoc'); });
        nhip(k, c, '2', p.x + 54, p.y - 24, 1.4);
        c.sau(1900, function () { r.ve({}); r.mat('vui'); c.keu('thang'); });
        c.sau(300, function () { r.mat('ngac'); });
      },
      // 4 · code def tr_right(); R1 quay đủ góc vuông bằng hai nhịp
      function (k, c) {
        c.nen(k, 'md-san');
        c.code(k, ['def tr_right():', '    for i in range(2):', '        left_move()', '        wait()'], 10, 14);
        var r = c.xe(XICH, {}, 1, 3, 240, Y), w = lopXoay(k, c, r, 240, Y);
        c.sau(1600, function () { w.goc(45); r.ve({ wl: 2, wr: 0 }); c.keu('buoc'); });
        c.sau(2200, function () { w.goc(90); c.keu('buoc'); });
        c.sau(2700, function () { r.ve({}); r.mat('vui'); c.keu('thang'); });
      }
    ],

    /* ---------------------------------------------------------------- 2 · Súng hơi */
    'sung-hoi': [
      // 1 · sau đống thùng có khẩu súng hơi nằm lăn lóc; R1 xích lăn tới
      function (k, c) {
        var s = c.san(k, ['#o#o#', '.....', '#####'], 4, X0, Y0), q = s.o(3, 0);
        k.appendChild(c.dat(c.ico('denSung', 3, BM.lamSang), q.x - 2, q.y + 2, 'md-lac'));
        var r = c.xe(XICH, {}, 1, 2, s.o(0, 1).x, s.o(0, 1).y); k.appendChild(r);
        truot(c, r, 100, s.o(2, 1).x, s.o(2, 1).y, 0.9);
        c.sau(1200, function () { r.mat('ngac'); c.keu('moKhoa'); });
        hoi(k, c, '!', q.x - 6, 4, 1.2);
      },
      // 2 · súng hơi bay lên mũi xe, CẠCH!
      function (k, c) {
        var s = c.san(k, ['#o#o#', '.....', '#####'], 4, X0, Y0), q = s.o(3, 0), p = s.o(2, 1);
        bayToi(k, c, c.ico('denSung', 3, BM.lamSang), q.x - 2, q.y + 2, p.x + 10, p.y - 14, 0.1, 0.95);
        lap(k, c, c.xe(XICH, {}, 1, 2, p.x, p.y), c.xe(XH, YEN, 1, 2, p.x, p.y).mat('vui'), 0.95);
      },
      // 3 · shoot(): bóng bay ra trước, xe giật lùi một ô
      function (k, c) {
        var s = c.san(k, ['#####', '....#', '#####'], 4, X0, Y0), p = s.o(2, 1), sau = s.o(1, 1), tuongO = s.o(4, 1);
        var r = c.xe(XH, YEN, 1, 2, p.x, p.y); k.appendChild(r);
        c.sau(500, function () { r.ve(BAN); });
        banBong(k, c, 2, p.x + 30, p.y, tuongO.x - 30, tuongO.y, 520, 0.4);
        tieng(k, c, 'PHỤT!', p.x - 40, 40, 0.55);
        truot(c, r, 560, sau.x, sau.y, 0.3);
        c.sau(700, function () { r.ve(YEN); r.mat('ngac'); });
        c.sau(1700, function () { r.mat('vui'); });
      },
      // 4 · code shoot_back() + hàm có tham số forward(n)
      function (k, c) {
        c.nen(k, 'md-san');
        c.code(k, ['shoot_back()', 'def forward(n):', '    for i in range(n):', '        move()'], 10, 14);
        var r = c.xe(XH, YEN, 1, 3, 200, Y); k.appendChild(r);
        c.sau(1500, function () { r.ve(BAN_SAU); });
        banBong(k, c, 3, 160, Y, -20, Y, 1520, 0.5);
        truot(c, r, 1560, 242, Y, 0.3);
        c.sau(1800, function () { r.ve(YEN); r.mat('vui'); c.keu('thang'); });
      }
    ],

    /* ---------------------------------------------------------------- 3 · Hồng ngoại */
    'hong-ngoai': [
      // 1 · tường phía trước còn xa hay gần? R1 không biết
      function (k, c) {
        c.nen(k, 'md-san'); tuong(k, c, 270);
        var r = c.xe(XH, YEN, 1, 3, 80, Y); k.appendChild(r);
        hoi(k, c, '?', 150, 70, 0.6);
        c.sau(600, function () { r.mat('ngac'); c.keu('loi'); });
      },
      // 2 · mắt hồng ngoại đỏ lăn ra, gắn lên mũi
      function (k, c) {
        c.nen(k, 'md-san'); tuong(k, c, 270);
        var den = c.dat(c.ico('denCam', 3, BM.do), -30, 164, 'pg-lan'); den.style.setProperty('--x', '120px'); k.appendChild(c.tu(den, 1.4, true));
        lap(k, c, c.xe(XH, YEN, 1, 3, 130, Y), c.xe(XHN, YEN, 1, 3, 130, Y).mat('vui'), 1.4);
        c.sau(400, function () { c.keu('buoc'); });
      },
      // 3 · tia đỏ đếm số ô trống tới tường: ba ô
      function (k, c) {
        c.nen(k, 'md-san'); tuong(k, c, 270);
        var r = c.xe(XHN, DO, 1, 3, 102, Y); k.appendChild(r);
        var tia = c.dat(c.h('div', 'pg-tia pg-do'), 140, Y - 4); tia.style.width = '130px'; tia.style.setProperty('--t', '0s'); k.appendChild(c.tu(tia, 0.3));
        c.sau(300, function () { c.keu('quet'); });
        ['1', '2', '3'].forEach(function (so, i) { nhip(k, c, so, 150 + i * 42, 104, 0.7 + i * 0.4); });
        c.sau(2000, function () { r.mat('vui'); c.keu('thang'); });
      },
      // 4 · code d = distance(); for j in range(d): move(); R1 dừng sát tường
      function (k, c) {
        c.nen(k, 'md-san'); tuong(k, c, 270);
        c.code(k, ['d = distance()', 'for j in range(d):', '    move()'], 10, 14);
        var nhom = c.dat(c.h('div', 'pg-nhom md-di'), 0, 0); nhom.style.setProperty('--d', '126px');
        var r = c.xe(XHN, DO, 1, 3, 102, Y); nhom.appendChild(r);
        k.appendChild(nhom);
        c.sau(300, function () { c.keu('quet'); });
        for (var i = 0; i < 3; i++) c.sau(1100 + i * 300, function () { c.keu('buoc'); });
        c.sau(2500, function () { c.keu('thang'); r.mat('vui'); });
      }
    ],

    /* ---------------------------------------------------------------- 4 · Nhà máy (băng chuyền, nút bắn, cửa, thùng nặng) */
    'nha-may': [
      // 1 · nhà máy cũ im lìm: băng đứng yên, cửa đóng
      function (k, c) {
        var s = san2(k, c, ['N####', '.>>>C', '#####'], 4, X0, Y0), p = s.o(0, 1);
        var r = c.xe(XHN, YEN, 1, 2, p.x, p.y); k.appendChild(r);
        hoi(k, c, '?', s.o(2, 1).x - 8, 20, 0.8);
        c.sau(800, function () { r.mat('ngac'); });
      },
      // 2 · băng chạy: thùng nặng trôi theo mũi tên
      function (k, c) {
        var s = san2(k, c, ['N####', '.>>>C', '#####'], 4, X0, Y0), p = s.o(0, 1), a = s.o(1, 1), b = s.o(3, 1);
        var r = c.xe(XHN, YEN, 1, 2, p.x, p.y); k.appendChild(r);
        var tg = c.dat(veNang(c, 4), a.x - C1 / 2, a.y - C1 / 2); k.appendChild(tg);
        s.chay(200, 22);
        truot(c, tg, 300, b.x - C1 / 2, b.y - C1 / 2, 2.4);
        c.sau(300, function () { c.keu('moKhoa'); r.mat('ngac'); });
        c.sau(2400, function () { r.mat('vui'); });
      },
      // 3 · bắn trúng nút bắn: nút bật, cửa cuối băng mở
      function (k, c) {
        var s = san2(k, c, ['N####', '.>>>C', '#####'], 4, X0, Y0), p = s.o(0, 1), n = s.o(0, 0);
        var r = c.xe(XHN, YEN, 0, 2, p.x, p.y); k.appendChild(r);
        c.sau(500, function () { r.ve(BAN); });
        banBong(k, c, 2, p.x, p.y - 26, n.x, n.y, 520, 0.3);
        c.sau(850, function () { s.nb['0,0'].dat(true); s.cua['4,1'].dat(true); r.ve(YEN); c.keu('moKhoa'); });
        s.chay(900, 16);
        c.sau(1100, function () { r.mat('vui'); });
      },
      // 4 · thùng nặng: xe húc không nhúc nhích, cú giật súng hơi mới hất được
      function (k, c) {
        var s = san2(k, c, ['#####', '.H..#', '#####'], 4, X0, Y0), p = s.o(2, 1), q = s.o(1, 1), z = s.o(0, 1), tuongO = s.o(4, 1);
        var tg = s.nang['1,1'];
        var r = c.xe(XHN, YEN, 1, 2, p.x, p.y); k.appendChild(r);
        c.sau(300, function () { r.mat('ngac'); });
        c.sau(700, function () { r.ve(BAN); });
        banBong(k, c, 2, p.x + 30, p.y, tuongO.x - 30, tuongO.y, 720, 0.3);
        truot(c, r, 760, q.x, q.y, 0.3);
        truot(c, tg, 760, z.x - C1 / 2, z.y - C1 / 2, 0.3);
        tieng(k, c, 'HẤT!', 40, 130, 0.8);
        c.sau(1000, function () { r.ve(YEN); r.mat('vui'); c.keu('dam'); });
      }
    ],

    /* ---------------------------------------------------------------- 5 · Đẩy thùng */
    'day-thung': [
      // 1 · thùng nặng chắn lối; bắn vào cũng không nhúc nhích
      function (k, c) {
        var s = san2(k, c, ['#####', '#.H.*', '#####'], 4, X0, Y0), p = s.o(1, 1), tg = s.nang['2,1'];
        var r = c.xe(XHN, YEN, 1, 2, p.x, p.y); k.appendChild(r);
        c.sau(500, function () { r.ve(BAN); });
        banBong(k, c, 2, p.x + 30, p.y, s.o(2, 1).x - 28, p.y, 520, 0.2);
        c.sau(740, function () { tg.classList.add('md-rung'); r.ve(YEN); c.keu('dam'); });
        tieng(k, c, 'BỤP!', 120, 20, 0.74);
        c.sau(1300, function () { r.mat('buon'); });
      },
      // 2 · xích tiến vào thùng nặng là đẩy nó trượt một ô (hai lần), thùng vào ô đích
      function (k, c) {
        var s = san2(k, c, ['#####', '#.H.*', '#####'], 4, X0, Y0), tg = s.nang['2,1'];
        var r = c.xe(XHN, YEN, 1, 2, s.o(1, 1).x, s.o(1, 1).y); k.appendChild(r);
        [2, 3].forEach(function (x, i) {
          var t = 500 + i * 900;
          truot(c, r, t, s.o(x, 1).x, s.o(x, 1).y, 0.5);
          truot(c, tg, t, s.o(x + 1, 1).x - C1 / 2, s.o(x + 1, 1).y - C1 / 2, 0.5);
          c.sau(t, function () { r.ve({ wl: 2, wr: 2, tay: { tuThe: 'tren' } }); c.keu('buoc'); });
          c.sau(t + 520, function () { r.ve(YEN); });
        });
        var d = s.o(4, 1), sa = c.dat(c.sao(3), d.x - 16, d.y - 56, 'md-pop md-sang'); sa.style.animationDelay = '2.1s, 2.1s'; k.appendChild(sa);
        c.sau(2100, function () { c.keu('thang'); r.mat('vui'); });
      },
      // 3 · sau thùng là tường: thùng kẹt; lùi cũng không kéo thùng về
      function (k, c) {
        var s = san2(k, c, ['#####', '#.H##', '#####'], 4, X0, Y0), tg = s.nang['2,1'], p = s.o(1, 1);
        var r = c.xe(XHN, YEN, 1, 2, p.x, p.y); k.appendChild(r);
        c.sau(500, function () { r.classList.add('md-rung'); tg.classList.add('md-rung'); c.keu('dam'); r.mat('xoay'); });
        var ram = c.chu('md-ram', 'RẦM!'); ram.style.animationDelay = '.5s'; k.appendChild(ram);
        c.sau(1500, function () { r.mat('buon'); });
        hoi(k, c, '?', p.x - 8, 150, 1.6);
      },
      // 4 · code def push(n); R1 đẩy thùng hai ô bằng một dòng
      function (k, c) {
        c.nen(k, 'md-san');
        c.code(k, ['def push(n):', '    for i in range(n):', '        move()', 'push(2)'], 10, 14);
        var nhom = c.dat(c.h('div', 'pg-nhom md-di'), 0, 0); nhom.style.setProperty('--d', '84px');
        nhom.appendChild(c.dat(veNang(c, 3), 166, Y - 21));
        var r = c.xe(XHN, YEN, 1, 3, 124, Y); nhom.appendChild(r);
        k.appendChild(nhom);
        var dich = c.dat(c.h('div', 'pg-dich'), 248, Y - 23); dich.style.width = dich.style.height = '46px'; k.appendChild(dich);
        for (var i = 0; i < 2; i++) c.sau(1100 + i * 500, function () { c.keu('buoc'); });
        c.sau(2500, function () { c.keu('thang'); r.mat('vui'); });
      }
    ],

    /* ---------------------------------------------------------------- 6 · Lực bắn */
    'luc-ban': [
      // 1 · bắn tụ shoot("charge"): bóng bay tới nút, xe giật lùi một ô
      function (k, c) {
        var s = san2(k, c, ['#####', '....N', '#####'], 4, X0, Y0), p = s.o(1, 1), n = s.o(4, 1);
        var r = c.xe(XHN, YEN, 1, 2, p.x, p.y); k.appendChild(r);
        c.sau(500, function () { r.ve(BAN); });
        banBong(k, c, 2, p.x + 30, p.y, n.x, n.y, 520, 0.6);
        truot(c, r, 560, s.o(0, 1).x, p.y, 0.3);
        c.sau(1140, function () { s.nb['4,1'].dat(true); r.ve(YEN); c.keu('moKhoa'); r.mat('ngac'); });
        tieng(k, c, 'GIẬT!', 10, 130, 0.6);
      },
      // 2 · bắn nhanh shoot("fast"): bóng bay hai ô rồi rơi, xe đứng yên
      function (k, c) {
        var s = san2(k, c, ['#####', '....N', '#####'], 4, X0, Y0), p = s.o(1, 1), roi = s.o(3, 1);
        var r = c.xe(XHN, YEN, 1, 2, p.x, p.y); k.appendChild(r);
        c.sau(500, function () { r.ve(BAN); });
        banBong(k, c, 2, p.x + 30, p.y, roi.x, roi.y, 520, 0.35, true);
        [s.o(2, 1), roi].forEach(function (o, i) { nhip(k, c, String(i + 1), o.x - 8, o.y - 54, 0.6 + i * 0.2); });
        c.sau(900, function () { r.ve(YEN); r.mat('vui'); });
      },
      // 3 · gần thì bắn nhanh, xa thì bắn tụ: hỏi distance() để chọn lực
      function (k, c) {
        c.nen(k, 'md-san');
        c.code(k, ['if distance() > 1:', '    shoot("charge")', 'else:', '    shoot("fast")'], 10, 14);
        var nut = c.dat(c.h('div'), 226, Y - 21); nut.appendChild(veNut(c, false, 3)); k.appendChild(nut);
        var r = c.xe(XHN, DO, 1, 3, 150, Y); k.appendChild(r);
        var tia = c.dat(c.h('div', 'pg-tia pg-do'), 190, Y - 4); tia.style.width = '36px'; tia.style.setProperty('--t', '0s'); k.appendChild(c.tu(tia, 1.4));
        c.sau(1400, function () { c.keu('quet'); });
        c.sau(2200, function () { tia.classList.add('pg-an-ngay'); r.ve(BAN); });
        banBong(k, c, 3, 190, Y, 247, Y, 2220, 0.25);
        c.sau(2500, function () { nut.innerHTML = ''; nut.appendChild(veNut(c, true, 3)); r.ve(YEN); r.mat('vui'); c.keu('thang'); });
      }
    ],

    /* ---------------------------------------------------------------- 7 · Đo nhiệt */
    'do-nhiet': [
      // 1 · nút đang bật thì nóng; lỡ bắn vào là nút tắt mất
      function (k, c) {
        var s = san2(k, c, ['##n##', '.....', '#####'], 4, X0, Y0), p = s.o(2, 1), n = s.o(2, 0);
        var r = c.xe(XHN, YEN, 0, 2, p.x, p.y); k.appendChild(r);
        c.sau(900, function () { r.ve(BAN); });
        banBong(k, c, 2, p.x, p.y - 26, n.x, n.y, 920, 0.25);
        c.sau(1200, function () { s.nb['2,0'].dat(false); r.ve(YEN); c.keu('loi'); });
        c.sau(1500, function () { r.mat('buon'); });
        hoi(k, c, '?!', p.x + 34, p.y - 20, 1.5);
      },
      // 2 · hồng ngoại cảm được hơi nóng: nút nóng thì để yên, nút nguội thì bắn
      function (k, c) {
        var s = san2(k, c, ['#n#N#', '.....', '#####'], 4, X0, Y0), a = s.o(1, 1), b = s.o(3, 1), nb = s.o(3, 0);
        var r = c.xe(XHN, DO, 0, 2, a.x, a.y); k.appendChild(r);
        var t1 = c.dat(c.h('div', 'pg-tia doc pg-do'), a.x - 4, a.y - 56); t1.style.height = '28px'; t1.style.setProperty('--t', '0s'); k.appendChild(c.tu(c.tu(t1, 0.3), 1.3, true));
        tieng(k, c, 'NÓNG!', a.x + 30, 30, 0.6);
        c.sau(600, function () { r.mat('ngac'); c.keu('quet'); });
        truot(c, r, 1400, b.x, b.y, 0.6);
        var t2b = c.dat(c.h('div', 'pg-tia doc pg-do'), b.x - 4, b.y - 56); t2b.style.height = '28px'; t2b.style.setProperty('--t', '0s'); k.appendChild(c.tu(c.tu(t2b, 2.1), 2.7, true));
        c.sau(2100, function () { c.keu('quet'); });
        c.sau(2700, function () { r.ve(BAN); });
        banBong(k, c, 2, b.x, b.y - 26, nb.x, nb.y, 2720, 0.25);
        c.sau(3000, function () { s.nb['3,0'].dat(true); r.ve(DO); r.mat('vui'); c.keu('moKhoa'); });
      },
      // 3 · code if not warm(): shoot()
      function (k, c) {
        c.nen(k, 'md-san');
        c.code(k, ['if not warm():', '    shoot()'], 10, 14);
        var nut = c.dat(c.h('div'), 226, Y - 21); nut.appendChild(veNut(c, false, 3)); k.appendChild(nut);
        var r = c.xe(XHN, DO, 1, 3, 150, Y); k.appendChild(r);
        var tia = c.dat(c.h('div', 'pg-tia pg-do'), 190, Y - 4); tia.style.width = '36px'; tia.style.setProperty('--t', '0s'); k.appendChild(c.tu(tia, 0.9));
        c.sau(900, function () { c.keu('quet'); });
        c.sau(1800, function () { tia.classList.add('pg-an-ngay'); r.ve(BAN); });
        banBong(k, c, 3, 190, Y, 247, Y, 1820, 0.25);
        c.sau(2100, function () { nut.innerHTML = ''; nut.appendChild(veNut(c, true, 3)); quangNong(k, c, 3, 226, Y - 21); r.ve(DO); r.mat('vui'); c.keu('thang'); });
      }
    ],

    /* ---------------------------------------------------------------- 8 · Đội (R1 xích + R2 hai bánh; warm() thấy bạn) */
    'doi-mua-2': [
      // 1 · R2 trở lại với súng hơi và mắt hồng ngoại
      function (k, c) {
        c.nen(k, 'md-san');
        var r1 = c.xe(XHN, YEN, 1, 3, 80, Y); k.appendChild(r1);
        var anh = c.dat(c.h('div', 'pg-anh'), 200, 20); anh.style.width = '120px'; anh.style.height = '170px'; k.appendChild(anh);
        k.appendChild(c.dat(c.h('div', 'pg-cua-lon pg-mo-cua'), 236, 20));
        var r2 = c.xe(R2, YEN, 3, 3, 360, Y); k.appendChild(r2);
        truot(c, r2, 1500, 236, Y, 1.0);
        c.sau(500, function () { c.keu('moKhoa'); r1.mat('ngac'); });
        c.sau(1600, function () { c.keu('buoc'); });
        c.sau(2600, function () { r1.mat('vui'); r2.mat('vui'); });
      },
      // 2 · robot đang chạy thì nóng: R2 thấy R1 chắn trước nên chờ
      function (k, c) {
        var s = san2(k, c, ['##N##', '....C', '##.##'], 4, X0, Y0), q = s.o(2, 2), a = s.o(0, 1), m = s.o(2, 1), b = s.o(3, 1);
        var r2 = c.xe(R2, DO, 0, 2, q.x, q.y); k.appendChild(r2);
        var r1 = c.xe(XHN, YEN, 1, 2, a.x, a.y); k.appendChild(r1);
        truot(c, r1, 200, m.x, m.y, 0.6);
        var tia = c.dat(c.h('div', 'pg-tia doc pg-do'), q.x - 4, q.y - 34); tia.style.height = '8px'; tia.style.setProperty('--t', '0s'); k.appendChild(c.tu(c.tu(tia, 0.9), 2.0, true));
        tieng(k, c, 'NÓNG!', q.x + 34, q.y - 30, 1.0);
        c.sau(1000, function () { r2.mat('ngac'); c.keu('quet'); });
        truot(c, r1, 2000, b.x, b.y, 0.5);
        c.sau(2600, function () { r2.mat('vui'); });
      },
      // 3 · đường trống, warm() là False: R2 bắn trúng nút, cửa mở cho cả đội
      function (k, c) {
        var s = san2(k, c, ['##N##', '....C', '##.##'], 4, X0, Y0), q = s.o(2, 2), n = s.o(2, 0), b = s.o(3, 1), d = s.o(4, 1);
        var r1 = c.xe(XHN, YEN, 1, 2, b.x, b.y); k.appendChild(r1);
        var r2 = c.xe(R2, DO, 0, 2, q.x, q.y); k.appendChild(r2);
        var tia = c.dat(c.h('div', 'pg-tia doc pg-do'), q.x - 4, n.y + 26); tia.style.height = '80px'; tia.style.setProperty('--t', '0s'); k.appendChild(c.tu(c.tu(tia, 0.3), 0.9, true));
        c.sau(300, function () { c.keu('quet'); });
        c.sau(900, function () { r2.ve(BAN); });
        banBong(k, c, 2, q.x, q.y - 26, n.x, n.y, 920, 0.45);
        c.sau(1400, function () { s.nb['2,0'].dat(true); s.cua['4,1'].dat(true); r2.ve(DO); c.keu('moKhoa'); });
        truot(c, r1, 1800, d.x, d.y, 0.5);
        c.sau(2400, function () { r1.mat('vui'); r2.mat('vui'); c.keu('thang'); });
      },
      // 4 · mỗi robot một chương trình; while warm(): wait() là chờ bạn đi qua
      function (k, c) {
        c.nen(k, 'md-san');
        k.appendChild(c.xe(XHN, YEN, 1, 3, 70, Y).mat('vui'));
        k.appendChild(c.xe(R2, DO, 3, 3, 250, Y).mat('vui'));
        var b1 = c.code(k, ['forward(4)', 'wait()'], 8, 8); bangTen(c, b1, t2('pg.tenR1'), '');
        var b2 = c.code(k, ['while warm():', '    wait()', 'shoot()'], 170, 8, 0.5); bangTen(c, b2, t2('pg.tenR2'), 'pg-ten-r2');
        c.sau(300, function () { c.keu('bam'); });
      }
    ],

    /* ---------------------------------------------------------------- 9 · Bệ súng xích */
    'be-sung': [
      // 1 · xe hai bánh bắn tụ là giật lùi, hất văng thùng phía sau
      function (k, c) {
        var s = san2(k, c, ['#####', '.H..N', '#####'], 4, X0, Y0), p = s.o(2, 1), q = s.o(1, 1), z = s.o(0, 1), n = s.o(4, 1), tg = s.nang['1,1'];
        var r = c.xe(R2, YEN, 1, 2, p.x, p.y); k.appendChild(r);
        c.sau(500, function () { r.ve(BAN); });
        banBong(k, c, 2, p.x + 30, p.y, n.x, n.y, 520, 0.4);
        truot(c, r, 560, q.x, q.y, 0.3);
        truot(c, tg, 560, z.x - C1 / 2, z.y - C1 / 2, 0.3);
        c.sau(940, function () { s.nb['4,1'].dat(true); r.ve(YEN); c.keu('dam'); r.mat('ngac'); });
        tieng(k, c, 'HẤT!', 10, 130, 0.6);
      },
      // 2 · xích bám sàn như bệ súng: bắn tụ mà xe đứng yên
      function (k, c) {
        var s = san2(k, c, ['#####', '.H..N', '#####'], 4, X0, Y0), p = s.o(2, 1), n = s.o(4, 1);
        var r = c.xe(XHN, YEN, 1, 2, p.x, p.y); k.appendChild(r);
        c.sau(500, function () { r.ve(BAN); r.classList.add('md-rung'); });
        banBong(k, c, 2, p.x + 30, p.y, n.x, n.y, 520, 0.4);
        c.sau(940, function () { s.nb['4,1'].dat(true); r.ve(YEN); c.keu('moKhoa'); });
        tieng(k, c, 'VỮNG!', 110, 140, 0.9);
        c.sau(1300, function () { r.mat('vui'); });
      },
      // 3 · ba phát, ba hướng, một chỗ đứng: không lùi bước nào
      function (k, c) {
        var s = san2(k, c, ['##N##', '#...N', '##N##'], 4, X0, Y0), p = s.o(2, 1);
        var r = c.xe(XHN, YEN, 1, 2, p.x, p.y), w = lopXoay(k, c, r, p.x, p.y);
        var luot = [[1, '4,1', s.o(4, 1), 0], [0, '2,0', s.o(2, 0), -90], [2, '2,2', s.o(2, 2), 90]];
        luot.forEach(function (l, i) {
          var t = 400 + i * 1100;
          c.sau(t, function () { w.goc(l[3]); c.keu('buoc'); });
          c.sau(t + 450, function () { r.ve(BAN); });
          var dx = l[2].x - p.x, dy = l[2].y - p.y, dai = Math.abs(dx) + Math.abs(dy);
          banBong(k, c, 2, p.x + dx / dai * 30, p.y + dy / dai * 30, l[2].x, l[2].y, t + 470, 0.3);
          c.sau(t + 800, function () { s.nb[l[1]].dat(true); r.ve(YEN); c.keu('moKhoa'); });
          nhip(k, c, String(i + 1), 26 + i * 30, 182, (t + 800) / 1000);
        });
        c.sau(3500, function () { r.mat('vui'); c.keu('thang'); });
      }
    ],

    /* ---------------------------------------------------------------- 10 · Nhà máy chạy lại (tổng hợp + trùm; nhá mùa 3) */
    'nha-may-chay': [
      // 1 · R1 đủ bộ giữa nhà máy, các huy hiệu mùa 2 bay quanh
      function (k, c) {
        c.nen(k, 'md-san');
        k.appendChild(c.xe(XHN, DO, 1, 3, 150, Y, 'md-nhun').mat('vui'));
        var cho = [[30, 30], [110, 14], [196, 14], [262, 40], [20, 100], [266, 104], [64, 60], [222, 72], [70, 128], [220, 132]];   // 10 chỗ cho 10 huy hiệu (V7b thêm hai)
        HUY.forEach(function (m, i) {
          var o = c.dat(c.h('div', 'pg-bay'), cho[i][0], cho[i][1]); o.style.animationDelay = (-i * 0.3) + 's';
          var p = c.dat(c.h('div', 'md-pop'), 0, 0); p.style.animationDelay = (0.2 + i * 0.15) + 's'; p.appendChild(huyHieu(c, m));
          o.appendChild(p); k.appendChild(o);
        });
        c.sau(300, function () { c.keu('thang'); });
      },
      // 2 · mọi nút bật, mọi băng chạy: nhà máy chạy lại
      function (k, c) {
        var s = san2(k, c, ['>>>>>', 'N...N', '<<<<<'], 4, X0, Y0);
        var r1 = c.xe(XHN, DO, 1, 2, s.o(1, 1).x, s.o(1, 1).y); k.appendChild(r1);
        var r2 = c.xe(R2, DO, 3, 2, s.o(3, 1).x, s.o(3, 1).y); k.appendChild(r2);
        c.sau(400, function () { s.nb['0,1'].dat(true); c.keu('moKhoa'); });
        c.sau(800, function () { s.nb['4,1'].dat(true); c.keu('moKhoa'); });
        s.chay(1000, 22);
        var tren = c.dat(veNang(c, 4), X0, Y0), duoi = c.dat(veNang(c, 4), X0 + 4 * C1, Y0 + 2 * C1);
        k.appendChild(tren); k.appendChild(duoi);
        truot(c, tren, 1100, X0 + 4 * C1, Y0, 2.6);
        truot(c, duoi, 1100, X0, Y0 + 2 * C1, 2.6);
        c.sau(1000, function () { r1.mat('vui'); r2.mat('vui'); c.keu('thang'); });
      },
      // 3 · ngoài xưởng, xa xa nhấp nháy tín hiệu lạ: chân nhện, nam châm, sóng từ (nhá mùa 3)
      function (k, c) {
        c.nen(k, 'pg-troi'); c.nen(k, 'pg-doi'); c.nen(k, 'md-san pg-dat');
        var r = c.xe(XHN, DO, 1, 3, -40, Y); k.appendChild(r);
        truot(c, r, 100, 110, Y, 1.4);
        for (var i = 0; i < 5; i++) c.sau(200 + i * 260, function () { c.keu('buoc'); });
        [['denChan', 196, 84], ['denNamCham', 244, 66], ['denCam', 284, 92]].forEach(function (d, i) {
          var e = c.dat(c.ico(d[0], 2, i === 2 ? BM.xanhLoSang2 : BM.vang), d[1], d[2], 'pg-nhay'); e.style.animationDelay = (i * 0.25) + 's';
          k.appendChild(c.tu(e, 1.6 + i * 0.3));
        });
        [0, 1, 2].forEach(function (i) {
          var song = c.dat(c.h('div', 'pg-nhay'), 270 - i * 9, 78 - i * 9); var w = 30 + i * 18;
          song.style.width = song.style.height = w + 'px'; song.style.borderRadius = '50%'; song.style.border = '2px solid ' + BM.xanhLoSang2; song.style.borderLeftColor = song.style.borderBottomColor = 'transparent';
          song.style.animationDelay = (i * 0.2) + 's'; k.appendChild(c.tu(song, 2.4));
        });
        hoi(k, c, '?', 150, 70, 2.6);
        c.sau(1600, function () { r.mat('ngac'); c.keu('moKhoa'); });
      }
    ]
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = PHIM;
  if (goc && goc.PhimGoi) goc.PhimGoi.them(PHIM);
})(typeof window !== 'undefined' ? window : globalThis);
