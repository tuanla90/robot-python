var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ============================================================================
   ve.js — "Robot Chấn Hưng": ICON + ĐỒ DÙNG CHUNG (window.Ve). V7c2 (28/10): bộ vẽ PIXEL (Painter, chất liệu gỗ / bảng, lưới icon HINH, sprite ô sân / robot /
   sao / khóa / trùm / huy hiệu, Ve.tiles, make*, khungGo, datChatLieu) đã xoá; game luôn vector (ve-vector*.js, VeIcon). Còn lại:
     Ve.T = 14                         cạnh một ô sân theo "pixel sân" (hệ toạ độ logic của san-ve.js / phim)
     Ve.MAU / MAU_TEN                  tên màu của lõi (red green blue yellow) → vai màu (n nền, s sáng, t tối, d đốm, vi viền) cho ô đích / sàn màu
     Ve.CO_ICON                        cỡ icon (px CSS ở s = 1), bảng số đo một lần từ bản pixel tại c830c12 (V7c1)
     Ve.ico / sao / mui / khoa          <svg class="pxi vi vi-<tên>"> của VeIcon (ve-vector-icon.js), cỡ = cạnh lớn CO_ICON × s; tên lạ: <span class="pxi"> rỗng
     Ve.hydrate(goc)                   điền icon vào mọi [data-i] chưa có nội dung (star / lock / trum / huyhieu → HuyHieu.mk / tên icon)
     Ve.mk(cv, s)                      canvas → phần tử canvas hiển thị cv.width × s px CSS (hình vector: chép 1:1; hình khác: phóng lân cận gần nhất tới đủ điểm ảnh thiết bị)
   ========================================================================== */
(function () {
  'use strict';

  var T = 14;

  /* ---- CHƯƠNG CẢM BIẾN MÀU: tên màu của lõi → bảng màu (san-ve.js: ô đích / sàn màu; ve-vector-* đọc qua đây) */
  var MAU = {                                                             // tên màu của lõi → bảng màu: n nền, s sáng, t tối (viền), d đốm, vi viền nét
    red: { n: BM.luatSanDo, s: BM.luatSanDoSang, t: BM.luatSanDoToi, d: BM.luatSanDoDom, vi: BM.luatSanDoVien },
    green: { n: BM.luatSanXanhLa, s: BM.luatSanXanhLaSang, t: BM.luatSanXanhLaToi, d: BM.luatSanXanhLaDom, vi: BM.luatSanXanhLaVien },
    blue: { n: BM.luatSanXanhDuong, s: BM.luatSanXanhDuongSang, t: BM.luatSanXanhDuongToi, d: BM.luatSanXanhDuongDom, vi: BM.luatSanXanhDuongVien },
    yellow: { n: BM.luatSanVang, s: BM.luatSanVangSang, t: BM.luatSanVangToi, d: BM.luatSanVangDom, vi: BM.luatSanVangVien }
  };
  var MAU_TEN = ['red', 'green', 'blue', 'yellow'];

  /* -------------------------------------------------- canvas → phần tử DOM */
  function mk(cv, s) {
    var c = document.createElement('canvas'), k = phongVec(cv, s);
    c.width = cv.width * k; c.height = cv.height * k;
    var g = c.getContext('2d'); if (k > 1) g.imageSmoothingEnabled = false;
    g.drawImage(cv, 0, 0, c.width, c.height);
    c.style.width = cv.width * s + 'px'; c.style.height = cv.height * s + 'px'; c.className = 'pxi';
    if (k > 1) c.style.setProperty('--hp', cv.height * s + 'px');        // cao hiển thị (choi-vector.css dùng khi chỗ đặt ép width / height: auto)
    return c;
  }
  /** Giao diện vector (gói V5a: body.ve-vector, có sẵn từ V7c1). Ở đó KHÔNG dùng image-rendering: pixelated nên canvas KHÔNG phải hình vector (cv.laVector) được
   *  PHÓNG SẴN bằng lân cận gần nhất tới đủ điểm ảnh thiết bị (k = ⌈s × dpr × 2⌉, chừa phép phóng của #stage), trình duyệt chỉ còn thu nhỏ: nét, không nhoè. Hình vector: k = 1. */
  function giaoDienVec() { return typeof document !== 'undefined' && !!document.body && document.body.classList.contains('ve-vector'); }
  function phongVec(cv, s) {
    if (!giaoDienVec() || cv.laVector || !(s > 0)) return 1;
    return Math.max(1, Math.min(8, Math.ceil(s * (window.devicePixelRatio || 1) * 2)));
  }
  /** Phần tử rỗng thay icon không có tên trong VeIcon (V7c2: trước rơi về canvas pixel). */
  function rong(ten) { var e = document.createElement('span'); e.className = 'pxi vi-thieu'; e.setAttribute('data-thieu', ten || ''); if (typeof console !== 'undefined' && console.warn) console.warn('Ve: không có icon "' + ten + '"'); return e; }

  /* ---------------------------------------------------------------- icon */
  /* V7b (28/10, gỡ cầu C1): Ve.ico / sao / mui / khoa / hydrate('trum') trả THẲNG <svg> của VeIcon (VeIcon.svg: lớp `pxi vi vi-<tên>` + phu,
     style width / height = cạnh lớn của bản pixel × s, y như Ve.mk + thayMot trước đây), KHÔNG vẽ canvas điểm ảnh, không cần MutationObserver thay sau. */
  /* V7c1 (28/10): game luôn vector → cỡ icon (px CSS ở s = 1) là BẢNG SỐ cố định, đo một lần từ bản pixel (lưới HINH = (cột + 2) × (hàng + 2); hình vẽ riêng
     edit / star / lock / mui / trum đo Painter) bằng scratchpad co-icon.cjs tại c830c12; V7c2: lưới HINH pixel đã xoá, bảng này là nguồn duy nhất. */
  var CO_ICON = { play: [14, 14], step: [14, 14], reset: [15, 16], back: [7, 10], next: [7, 10], plus: [10, 10], check: [10, 9], cross: [9, 9], close: [9, 9], x5: [7, 7], menu: [12, 10], help: [9, 11], bulb: [14, 14], trash: [11, 11], del: [12, 9], thutvao: [11, 10], thutra: [11, 10], dot: [6, 6], book: [13, 11], gear: [13, 13], banhRang: [13, 13], xu: [13, 13], box: [13, 13],
    loa: [11, 10], nhac: [10, 10], canhbao: [14, 12], mau: [9, 9], car: [14, 10], wall: [14, 10], pin: [14, 9], sac: [11, 13], denBanh: [13, 13], denXich: [13, 11], denTruot: [13, 13], denTayLen: [13, 13], denTayXuong: [13, 13], denXoay: [13, 12], denKepMo: [13, 12], denKepDong: [13, 12], denNamCham: [13, 10], denNem: [13, 12], denSung: [13, 9], denSon: [13, 13], denCam: [13, 9], denChan: [13, 11], denCanh: [13, 13], denLogic: [13, 13],
    rao: [13, 9], ro: [13, 10], nutban: [13, 11], thung: [13, 13], bac: [13, 10], gam: [13, 8], ho: [13, 9], bang: [13, 8], cua: [13, 10],
    edit: [9, 9], star: [11, 10], lock: [12, 14], lockNho: [10, 11], mui: [10, 9], trum: [24, 24] };
  function coIcon(ten, nho) { return (nho && ten === 'lock' ? CO_ICON.lockNho : CO_ICON[ten]) || null; }
  function svgVec(ten, s, tuyChon, phu, nho) {
    var VI = typeof window !== 'undefined' && window.VeIcon;
    if (!VI || !VI.svg || !VI.co(ten)) return null;          // thiếu VeIcon / tên lạ: người gọi trả phần tử rỗng (V7c2: hết canvas pixel)
    var c = coIcon(ten, nho); if (!c) return null;
    return VI.svg(ten, Math.max(c[0], c[1]) * (s || 2), tuyChon, phu);
  }
  function ico(ten, s, tuyChon) { return svgVec(ten, s, tuyChon) || rong(ten); }
  function sao(bat, s) { return svgVec('star', s, null, bat ? '' : 'tat') || rong('star'); }
  function mui(mau, s) { return svgVec('mui', s, { fill: mau }) || rong('mui'); }        // gói V6c: mũi tên bong bóng → ô code
  function khoa(s, tran) { return svgVec('lock', s, null, '', tran) || rong('lock'); }

  /** Điền icon vào mọi [data-i] chưa có nội dung. data-s tỉ lệ, data-l màu viền, data-f màu tô. */
  function hydrate(goc) {
    var els = goc.querySelectorAll('[data-i]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i]; if (el.firstChild) continue;
      var ten = el.getAttribute('data-i'), s = +(el.getAttribute('data-s') || 2);
      var opt = { line: el.getAttribute('data-l') || undefined, fill: el.getAttribute('data-f') || undefined };
      var node;
      if (ten === 'star') node = sao(el.getAttribute('data-on') !== '0', s);
      else if (ten === 'lock') node = khoa(s);
      else if (ten === 'trum') node = svgVec('trum', s, null, el.getAttribute('data-on') !== '0' ? '' : 'tat') || rong('trum');
      else if (ten === 'huyhieu') node = window.HuyHieu && el.getAttribute('data-ma') ? HuyHieu.mk(el.getAttribute('data-ma'), el.getAttribute('data-tt') || 'xong', s) : rong('huyhieu');   // V7b: HuyHieu.mk (hết bọc Ve.mk / Ve.hydrate)
      else node = ico(ten, s, opt);
      el.appendChild(node); el.style.display = 'flex';
    }
  }

  window.Ve = { T: T, MAU: MAU, MAU_TEN: MAU_TEN, CO_ICON: CO_ICON, mk: mk, ico: ico, sao: sao, khoa: khoa, mui: mui, hydrate: hydrate };
})();
