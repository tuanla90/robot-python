/* ============================================================================
   mo-dau.js — "Robot Chấn Hưng": PHIM MỞ ĐẦU (window.MoDau), kiểu cảnh mở của Cut the Rope.
   Sáu khung hoạt hình pixel, mỗi khung một câu: xe chở linh kiện sụp ổ gà ở cửa xưởng, bộ phận văng khắp xưởng,
   còn lại robot R1 chỉ có thân hai bánh, cứ quay mòng mòng; R1 hiểu lệnh Python, em viết lệnh cho R1.
   Truyện này là lý do của luật mở gói: mỗi gói bộ phận là một món đồ tìm lại được (bang-mo-khoa.js: GOI_BO_PHAN).
   Lời mỗi khung khớp tranh (góp ý Gemini 22/10): khung 2 đã có chữ RẦM! trên tranh, khung 3 tay gắp nằm dưới thùng gỗ, khung 5 R1 quay tại chỗ.
   Xong phim là ba trang mẹo chơi (gioi-thieu.js: viết lệnh + Chạy, gom sao, mở bộ phận mới).
   ung-dung.js chiếu một lần khi chưa có cờ 'mo-dau' (Luu.daXem); Cài đặt có nút "Xem lại phim mở đầu".
   Chạm khung tranh hoặc nút Tiếp để sang khung; "Bỏ qua" ở góc trên.
   Hình lấy từ bộ vẽ sẵn có: VeRobot (R1), Ve.ico (xe, thùng, icon đèn bộ phận), Ve.tiles() (tường, thùng gỗ, cờ).
   ========================================================================== */
(function () {
  'use strict';

  var h = TP.h;
  var CO = 'mo-dau';
  var SO_KHUNG = 6;
  var R1 = { than: 'hai-banh', tay: null, camBien: [] };
  var VANG = '#ffd95a', MUC = '#1b120a';

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
  /** R1 (thân hai bánh, không tay) đã cắt lề: tỉ lệ 3 ≈ 51×60, tỉ lệ 4 ≈ 68×80. */
  function r1(huong, tiLe) {
    try { var c = Ve.mk(catLe(VeRobot.ve(R1, { wl: 0, wr: 0, ph: 0, tay: null }, huong, tiLe)), 1); c.classList.add('pxi'); return c; }
    catch (e) { return h('div'); }
  }
  function ico(ten, s, mau) { var c = Ve.ico(ten, s, { fill: mau || VANG, line: MUC }); c.classList.add('pxi'); return c; }
  function o(ten, s) { var c = Ve.mk(Ve.tiles()[ten], s); c.classList.add('pxi'); return c; }
  function co(s) { var c = Ve.mk(Ve.tiles().flags[0], s); c.classList.add('pxi', 'md-co'); return c; }
  function chu(cls, s) { return h('div', 'md-a ' + cls, s); }
  function nen(k, cls) { k.appendChild(h('div', cls)); }

  // bốn bộ phận văng ra: icon đèn bộ phận + màu
  var DO = [
    { ten: 'denKepMo', mau: '#ffd95a', x: -120, y: 40, r: '-200deg' },
    { ten: 'denCam', mau: '#7ff0ff', x: 110, y: 30, r: '160deg' },
    { ten: 'denXich', mau: '#c0c6d4', x: -70, y: -40, r: '-90deg' },
    { ten: 'denCanh', mau: '#a8dc72', x: 80, y: -90, r: '540deg' }
  ];

  /* ------------------------------------------------------------- bảy khung */
  var KHUNG = [
    // 1 · xe chạy trong mưa
    function (k) {
      nen(k, 'md-mua'); nen(k, 'md-duong');
      var xe = h('div', 'md-a md-xe'); xe.style.top = '106px';
      var nhun = h('div', 'md-nhun');
      nhun.appendChild(dat(ico('box', 3, '#c98a45'), 6, 0));
      nhun.appendChild(dat(ico('car', 6, '#e8504a'), 0, 26));
      xe.appendChild(nhun); k.appendChild(xe);
    },
    // 2 · sụp ổ gà, thùng bật, đồ văng
    function (k) {
      nen(k, 'md-mua'); nen(k, 'md-duong');
      k.appendChild(dat(ico('car', 6, '#e8504a'), 118, 132, 'md-rung'));
      k.appendChild(dat(ico('box', 3, '#c98a45'), 124, 106, 'md-bat'));
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
      k.appendChild(dat(ico('denXich', 3, '#c0c6d4'), 40, 36, 'md-lac'));
      k.appendChild(dat(ico('denKepMo', 3, '#ffd95a'), 228, 156, 'md-lac'));      // thò nửa ra khỏi gầm tủ (thùng vẽ sau, che nửa trái)
      k.appendChild(dat(o('crate', 5), 178, 104));
      k.appendChild(dat(ico('denCanh', 2, '#a8dc72'), 250, 70, 'md-mat'));
      k.appendChild(chu('md-hoi md-hoi-xa', '?'));
    },
    // 4 · còn lại mỗi R1
    function (k) {
      nen(k, 'md-san');
      k.appendChild(dat(r1(1, 4), 126, 106, 'md-nhun'));
      k.appendChild(chu('md-hoi md-hoi-bi', '?'));
    },
    // 5 · R1 muốn đi mà quay mòng mòng
    function (k) {
      nen(k, 'md-san');
      k.appendChild(dat(co(4), 252, 138));
      k.appendChild(dat(r1(1, 3), 70, 126, 'md-quay'));
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
      var b = dat(r1(1, 3), 60, 126, 'md-di'); b.style.setProperty('--d', '155px'); k.appendChild(b);      // dừng sát chân cờ
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
