var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ============================================================================
   mo-dau.js — "Robot Chấn Hưng": PHIM MỞ ĐẦU (window.MoDau), kiểu cảnh mở của Cut the Rope.
   Sáu khung hoạt hình (vector), mỗi khung một câu: xe chở linh kiện sụp ổ gà ở cửa xưởng, bộ phận văng khắp xưởng,
   còn lại robot R1 chỉ có thân hai bánh, cứ quay mòng mòng; R1 hiểu lệnh Python, em viết lệnh cho R1.
   Truyện này là lý do của luật mở gói: mỗi gói bộ phận là một món đồ tìm lại được (bang-mo-khoa.js: GOI_BO_PHAN).
   Lời mỗi khung khớp tranh (góp ý Gemini 22/10): khung 2 đã có chữ RẦM! trên tranh, khung 3 tay gắp nằm dưới thùng gỗ, khung 5 R1 quay tại chỗ.
   Xong phim là ba trang mẹo chơi (gioi-thieu.js: viết lệnh + Chạy, gom sao, mở bộ phận mới).
   ung-dung.js chiếu một lần khi chưa có cờ 'mo-dau' (Luu.daXem); Cài đặt có nút "Xem lại phim mở đầu".
   Chạm khung tranh hoặc nút Tiếp để sang khung; "Bỏ qua" ở góc trên.
   Hình lấy từ bộ vẽ vector sẵn có: VeRobot (R1), PhimVector (icon VeIcon, ô tường / thùng gỗ / cờ, xe tải).
   Gói V6c: ở vector cùng các hình đó vẽ bằng bộ vẽ vector (PhimVector, VeIcon, VeRobot mắt biểu cảm); nền cảnh (mưa, đường, sàn) ở giao-dien-vector-b.css mục 10.
   ========================================================================== */
(function () {
  'use strict';

  var h = TP.h;
  var CO = 'mo-dau';
  var SO_KHUNG = 6;
  var R1 = { than: 'hai-banh', tay: null, camBien: [] };
  var VANG = BM.vang, MUC = BM.vienDam;

  var hen = [];                                   // hẹn giờ tiếng của khung đang chiếu (đổi khung thì hủy)
  function sau(ms, f) { hen.push(setTimeout(f, ms)); }
  function huyHen() { hen.forEach(clearTimeout); hen = []; }
  function keu(ten) { if (window.AmThanh) AmThanh.phat(ten); }

  /* ------------------------------------------------------------- dựng hình */
  /** Đặt phần tử e ở (x, y) trong khung tranh, thêm lớp cls. */
  function dat(e, x, y, cls) {
    e.classList.add('md-a');
    if (cls) cls.split(' ').forEach(function (c) { e.classList.add(c); });
    e.style.left = x + 'px'; e.style.top = y + 'px';
    return e;
  }
  /** Cắt lề trong suốt (hình VeRobot có lề rộng để tâm thân nằm giữa ô). */
  function catLe(cv) {
    var g = cv.getContext('2d'), w = cv.width, hh = cv.height, d = g.getImageData(0, 0, w, hh).data;
    var x0 = w, y0 = hh, x1 = -1, y1 = -1;
    for (var y = 0; y < hh; y++) for (var x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (x1 < 0) return cv;
    var c = document.createElement('canvas'); c.width = x1 - x0 + 1; c.height = y1 - y0 + 1;
    var g2 = c.getContext('2d'); g2.imageSmoothingEnabled = false; g2.drawImage(cv, x0, y0, c.width, c.height, 0, 0, c.width, c.height);
    return c;
  }
  /** Gói V6c: mọi hình của cảnh lấy từ bộ vẽ vector (PhimVector: icon chung VeIcon, ô / vật / cờ / xe tải; VeRobot: R1 có mắt biểu cảm), cùng cỡ CSS với
   *  bản pixel cũ nên vị trí, hoạt cảnh, lời, thứ tự khung, thời lượng giữ nguyên. V7c2 (28/10): hết đường lùi pixel (Ve.tiles / Ve.mk ô). */
  function PV() { return window.PhimVector || null; }
  /** R1 (thân hai bánh, không tay) đã cắt lề: tỉ lệ 3 ≈ 51×60, tỉ lệ 4 ≈ 68×80. mat: biểu cảm mắt (VeVector H.kinh). */
  function r1(huong, tiLe, mat) {
    try {
      var tt = { wl: 0, wr: 0, ph: 0, tay: null }; if (mat) tt.mat = mat;
      var cv = VeRobot.veCo(R1, tt, huong, tiLe * VeRobot.PX_O_PART), cl = catLe(cv); cl.laVector = true;      // bản cắt lề vẫn là hình vector (Ve.mk không phóng điểm ảnh)
      var c = Ve.mk(cl, VeRobot.heSoCss(cv)); c.laVector = true; c.classList.add('pxi'); return c;      // tiLe = bội số "pixel part" → cỡ ô hiển thị (VeRobot.veCo)
    }
    catch (e) { return h('div'); }
  }
  function ico(ten, s, mau) { return (PV() && PhimVector.ico(ten, s, mau || VANG)) || Ve.ico(ten, s, { fill: mau || VANG, line: MUC }); }     // Ve.ico: svg VeIcon (tên ngoài bộ phim)
  function o(ten, s) { return (PV() && PhimVector.o(ten, s, 0)) || h('div'); }
  function co(s) { var v = PV() && PhimVector.co(s); if (!v) return h('div'); v.classList.add('md-co'); return v; }
  /** Xe chở linh kiện: xe tải PhimVector.xeTai cỡ 84 × 60 (dự phòng: icon 'car' tỉ lệ 6 màu đỏ). */
  function xeHang() { var v = PV() && PhimVector.xeTai(84, 60); return v || ico('car', 6, BM.do); }
  /** Thùng linh kiện trên xe (pixel: icon 'box' tỉ lệ 3 = 39 × 39; vector: thùng gỗ của sân cùng cỡ). */
  function thungHang() { var v = PV() && PhimVector.o('crate', 39 / 14, 0); return v || ico('box', 3, BM.camToiV1); }
  function chu(cls, s) { return h('div', 'md-a ' + cls, s); }
  function nen(k, cls) {
    k.appendChild(h('div', cls));
    if (cls === 'md-mua' && PV()) k.classList.add('co-mua');        // gói V7a: đường lùi cho luật CSS :has(.md-mua) (Safari < 15.4, Firefox < 121): chỉ vector, pixel y nguyên
  }

  // bốn bộ phận văng ra: icon đèn bộ phận + màu
  var DO = [
    { ten: 'denKepMo', mau: BM.vang, x: -120, y: 40, r: '-200deg' },
    { ten: 'denCam', mau: BM.xanhLoSang2, x: 110, y: 30, r: '160deg' },
    { ten: 'denXich', mau: BM.lamSang, x: -70, y: -40, r: '-90deg' },
    { ten: 'denCanh', mau: BM.xanhLaSangV9, x: 80, y: -90, r: '540deg' }
  ];

  /* ------------------------------------------------------------- bảy khung */
  var KHUNG = [
    // 1 · xe chạy trong mưa
    function (k) {
      nen(k, 'md-mua'); nen(k, 'md-duong');
      var xe = h('div', 'md-a md-xe'); xe.style.top = '106px';
      var nhun = h('div', 'md-nhun');
      nhun.appendChild(dat(thungHang(), 6, 0));
      nhun.appendChild(dat(xeHang(), 0, 26));
      xe.appendChild(nhun); k.appendChild(xe);
    },
    // 2 · sụp ổ gà, thùng bật, đồ văng
    function (k) {
      nen(k, 'md-mua'); nen(k, 'md-duong');
      k.appendChild(dat(xeHang(), 118, 132, 'md-rung'));
      k.appendChild(dat(thungHang(), 124, 106, 'md-bat'));
      DO.forEach(function (d, i) {
        var vx = h('div', 'md-a md-vx'); vx.style.left = '140px'; vx.style.top = '110px';
        vx.style.setProperty('--x', d.x + 'px'); vx.style.animationDelay = (0.12 + i * 0.05) + 's';
        var vy = h('div', 'md-vy'); vy.style.setProperty('--y', d.y + 'px'); vy.style.setProperty('--r', d.r); vy.style.animationDelay = vx.style.animationDelay;
        vy.appendChild(ico(d.ten, 3, d.mau)); vx.appendChild(vy); k.appendChild(vx);
      });
      k.appendChild(chu('md-ram', 'RẦM!'));
      sau(120, function () { keu('dam'); });
    },
    // 3 · đồ rơi khắp xưởng
    function (k) {
      nen(k, 'md-san');
      k.appendChild(dat(o('wall', 3), 18, 66)); k.appendChild(dat(o('wall', 3), 60, 66));
      k.appendChild(dat(ico('denXich', 3, BM.lamSang), 40, 36, 'md-lac'));
      k.appendChild(dat(ico('denKepMo', 3, BM.vang), PV() ? 212 : 228, 156, 'md-lac'));      // vector: thùng gỗ vẽ gọn hơn trong ô, dời kẹp vào gầm cho thùng vẫn che nửa      // thò nửa ra khỏi gầm tủ (thùng vẽ sau, che nửa trái)
      k.appendChild(dat(o('crate', 5), 178, 104));
      k.appendChild(dat(ico('denCanh', 2, BM.xanhLaSangV9), 250, 70, 'md-mat'));
      k.appendChild(chu('md-hoi md-hoi-xa', '?'));
    },
    // 4 · còn lại mỗi R1
    function (k) {
      nen(k, 'md-san');
      k.appendChild(dat(r1(1, 4, 'ngac'), 126, 106, 'md-nhun'));
      k.appendChild(chu('md-hoi md-hoi-bi', '?'));
    },
    // 5 · R1 muốn đi mà quay mòng mòng
    function (k) {
      nen(k, 'md-san');
      k.appendChild(dat(co(4), 252, 138));
      k.appendChild(dat(r1(1, 3, 'xoay'), 70, 126, 'md-quay'));
      var hoi = chu('md-hoi md-hoi-quay', '?!'); k.appendChild(hoi);
      sau(1300, function () { keu('loi'); });
    },
    // 6 · có code, R1 đi thẳng tới cờ
    function (k) {
      nen(k, 'md-san');
      var code = h('div', 'md-a md-code'); code.style.left = '10px'; code.style.top = '14px';
      ['left_move()', 'right_move()', 'wait()'].forEach(function (s, i) {
        var d = h('div', 'md-dong'); d.style.animationDelay = (0.2 + i * 0.25) + 's';
        d.appendChild(h('span', 'so', String(i + 1))); d.appendChild(h('span', 'kc', s)); code.appendChild(d);
      });
      k.appendChild(code);
      k.appendChild(dat(co(4), 262, 138));
      var b = dat(r1(1, 3, 'vui'), 60, 126, 'md-di'); b.style.setProperty('--d', (PV() ? 147 : 155) + 'px'); k.appendChild(b);      // dừng sát chân cờ
      for (var i = 0; i < 5; i++) sau(1000 + i * 260, function () { keu('buoc'); });
    }
  ];

  /* ------------------------------------------------------------- chiếu phim */
  /** Chiếu phim từ khung 1; xong (nút cuối / Bỏ qua) thì ghi cờ, gỡ lớp phim, gọi khiXong. */
  function mo(khiXong) {
    var san = document.getElementById('stage'); if (!san) return;
    var cu = san.querySelector('.md'); if (cu) cu.remove();
    var lop = h('div', 'md'); lop.setAttribute('data-hop', 'mo-dau');
    var boQua = h('button', 'bt g-wd md-bo-qua', t('md.boQua')); boQua.setAttribute('data-nut', 'md-bo-qua');
    var khung = h('div', 'md-khung chalk'); khung.setAttribute('data-nut', 'md-khung');
    var loi = h('div', 'md-loi');
    var cham = h('div', 'md-cham'); for (var i = 0; i < SO_KHUNG; i++) cham.appendChild(h('i'));
    var tiep = h('button', 'bt g-gr md-tiep'); tiep.setAttribute('data-nut', 'md-tiep');
    [boQua, khung, loi, cham, tiep].forEach(function (e) { lop.appendChild(e); });
    san.appendChild(lop);

    var so = 0;
    function ve(n) {
      huyHen(); so = n;
      khung.innerHTML = '';
      if (khung.classList) khung.classList.remove('co-mua');           // gói V7a: khung mưa đặt lại mỗi cảnh
      KHUNG[n - 1](khung);
      loi.textContent = t('md.' + n);
      Array.prototype.forEach.call(cham.children, function (c, i) { c.classList.toggle('on', i === n - 1); });
      tiep.textContent = n < SO_KHUNG ? t('md.tiep') : t('md.batDau');
      boQua.style.visibility = n < SO_KHUNG ? '' : 'hidden';
    }
    function sang() { if (so < SO_KHUNG) ve(so + 1); else xong(); }
    function xong() {
      huyHen();
      Luu.datDaXem(CO);
      lop.remove();
      if (khiXong) khiXong();
    }
    tiep.addEventListener('click', sang);
    khung.addEventListener('click', function () { if (so < SO_KHUNG) sang(); });
    boQua.addEventListener('click', xong);
    ve(1);
  }

  window.MoDau = { mo: mo, CO: CO, SO_KHUNG: SO_KHUNG };
})();
