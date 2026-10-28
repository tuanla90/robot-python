var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ============================================================================
   ve-vector-icon.js — "Robot Chấn Hưng": ICON VECTOR (window.VeIcon, gói V5b, 28/10) cho chế độ vector.
   V7b (28/10, gỡ cầu C1 / C5): ở body.ve-vector, ve.js (Ve.ico / Ve.sao / Ve.khoa / Ve.mui / Ve.hydrate) gọi VeIcon.svg(ten, k, tuyChon, phu) và trả THẲNG <svg>
   cùng cỡ hiển thị như bản pixel qua Ve.mk (ô vuông cạnh k = cạnh lớn × s), lớp `pxi vi vi-<tên>` (+ `tat` cho sao / xu / trùm tắt), nhãn _vi; không còn canvas
   điểm ảnh có nhãn phải thay sau, không MutationObserver cho icon. Màu: fill / stroke = currentColor, nên MÀU THEO VAI đặt bằng CSS (giao-dien-vector-b.css mục 8:
   color: var(--g-vec…)); chi tiết phụ (lỗ khoá, vành xu…) mang lớp `vi2`. Phim vẽ cùng bộ hình lên canvas (veCanvas). Pixel (không body.ve-vector): không làm gì.
   Một phạm vi PHAM_VI = '#stage' (cả khung game): nút chỉ có icon trong đó có aria-label mà thiếu title thì được thêm title cùng chữ (luật UI, datTitle), chỉ ở vector.
   Còn lại (V7b việc 9 gỡ tiếp): hình bộ phận thật ở tiêu đề thẻ khay (thayPart / noiPart: móc Part._veMot + drawImage) thay qua MutationObserver trên #stage.
   ========================================================================== */
(function (root) {
  'use strict';

  var PHAM_VI = '#stage';                                // V7b (gỡ C5): MỘT phạm vi = cả khung game (mọi màn, #lop-hop, phim .md); chỉ còn dùng cho datTitle (nút chỉ icon)
  var NS = 'http://www.w3.org/2000/svg';

  /* ---------------------------------------------------------------- dựng hình (khung 24 × 24) */
  // mỗi hình là danh sách phần: ['p', d] tô đặc · ['s', d, dày] nét tròn · ['c', cx, cy, r] tròn đặc · ['r', x, y, w, h, bo] chữ nhật đặc; thêm phần tử cuối 'vi2' = chi tiết phụ
  function banhRang(n, rN, rT, rLo) {
    var d = '', i, buoc = Math.PI * 2 / n, nua = buoc * 0.26;
    for (i = 0; i < n; i++) {
      var g = i * buoc - Math.PI / 2, pts = [[g - buoc / 2 + nua * 0.5, rT], [g - nua, rT], [g - nua * 0.72, rN], [g + nua * 0.72, rN], [g + nua, rT], [g + buoc / 2 - nua * 0.5, rT]];
      pts.forEach(function (q, k) { var x = (12 + Math.cos(q[0]) * q[1]).toFixed(2), y = (12 + Math.sin(q[0]) * q[1]).toFixed(2); d += (i === 0 && k === 0 ? 'M' : 'L') + x + ' ' + y; });
    }
    d += 'Z';
    d += 'M' + (12 + rLo) + ' 12a' + rLo + ' ' + rLo + ' 0 1 0 ' + (-2 * rLo) + ' 0a' + rLo + ' ' + rLo + ' 0 1 0 ' + (2 * rLo) + ' 0Z';   // lỗ giữa (evenodd)
    return d;
  }
  function sao5(rN, rT) {
    var d = '';
    for (var i = 0; i < 10; i++) { var g = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? rT : rN; d += (i ? 'L' : 'M') + (12 + Math.cos(g) * r).toFixed(2) + ' ' + (12.6 + Math.sin(g) * r).toFixed(2); }
    return d + 'Z';
  }
  var HINH = {
    play: [['p', 'M8 5.6v12.8a1.2 1.2 0 0 0 1.8 1l10-6.4a1.2 1.2 0 0 0 0-2l-10-6.4A1.2 1.2 0 0 0 8 5.6z']],
    step: [['p', 'M4.5 5.6v12.8a1.2 1.2 0 0 0 1.9 1l8.6-6.4a1.2 1.2 0 0 0 0-2L6.4 4.6a1.2 1.2 0 0 0-1.9 1z'], ['r', 16.5, 5, 3.2, 14, 1.3]],
    reset: [['s', 'M19.2 12.6A7.2 7.2 0 1 1 16.6 6.3', 2.8], ['p', 'M20.6 3.4v6.4h-6.4z']],
    back: [['s', 'M15 4.8L7.8 12l7.2 7.2', 3.2]],
    next: [['s', 'M9 4.8l7.2 7.2L9 19.2', 3.2]],
    plus: [['s', 'M12 5v14M5 12h14', 3]],
    check: [['s', 'M4.8 12.6l4.6 4.6L19.4 7', 3.2]],
    cross: [['s', 'M6.2 6.2l11.6 11.6M17.8 6.2L6.2 17.8', 3.2]],
    close: [['s', 'M6.2 6.2l11.6 11.6M17.8 6.2L6.2 17.8', 3.2]],
    x5: [['s', 'M7 7l10 10M17 7L7 17', 3.4]],
    menu: [['s', 'M4.5 6.5h15M4.5 12h15M4.5 17.5h15', 2.8]],
    help: [['s', 'M8.6 8.8a3.5 3.5 0 1 1 5.1 3.1c-1.1.6-1.7 1.3-1.7 2.5v.5', 2.8], ['c', 12, 19.2, 1.7]],
    bulb: [['p', 'M12 2.8a6.6 6.6 0 0 0-3.9 11.9c.6.4.9 1.1.9 1.8v.7h6v-.7c0-.7.3-1.4.9-1.8A6.6 6.6 0 0 0 12 2.8z'], ['p', 'M9.2 18.6h5.6v.9a2.3 2.3 0 0 1-2.3 2.3h-1a2.3 2.3 0 0 1-2.3-2.3z'],
      ['s', 'M10 8.4a2.6 2.6 0 0 1 2-1.4', 1.6, 'vi2']],
    trash: [['s', 'M4 6.6h16M9.6 6.4V4.4h4.8v2', 2.4], ['s', 'M6.4 9.4l.9 10.2a1.6 1.6 0 0 0 1.6 1.4h6.2a1.6 1.6 0 0 0 1.6-1.4l.9-10.2M10.2 12.2v5.6M13.8 12.2v5.6', 2.2]],
    del: [['p', 'M9.2 5h9.6a2.2 2.2 0 0 1 2.2 2.2v9.6a2.2 2.2 0 0 1-2.2 2.2H9.2a1.6 1.6 0 0 1-1.2-.55L2.8 12.7a1 1 0 0 1 0-1.4L8 5.55A1.6 1.6 0 0 1 9.2 5z'],
      ['s', 'M11.6 9.4l5.2 5.2M16.8 9.4l-5.2 5.2', 2.2, 'vi2']],
    thutvao: [['s', 'M11 6.5h9M11 12h9M11 17.5h9', 2.6], ['p', 'M3.6 8.4l4.8 3.6-4.8 3.6z']],
    thutra: [['s', 'M11 6.5h9M11 12h9M11 17.5h9', 2.6], ['p', 'M8.4 8.4L3.6 12l4.8 3.6z']],
    dot: [['c', 12, 12, 5.5]],
    book: [['s', 'M12 6.8C10.4 5.4 8 4.8 3.8 5v13.2c4.2-.2 6.6.4 8.2 1.8 1.6-1.4 4-2 8.2-1.8V5C16 4.8 13.6 5.4 12 6.8zM12 6.8V20', 2.2]],
    gear: [['p', banhRang(8, 10.2, 7.4, 3.1), 'evenodd']],
    banhRang: [['p', banhRang(8, 10.2, 7.4, 3.1), 'evenodd']],
    xu: [['c', 12, 12, 9.4], ['s', 'M12 6.6v10.8', 2.4, 'vi2'], ['s', 'M12 4.6a7.4 7.4 0 0 1 0 14.8 7.4 7.4 0 0 1 0-14.8z', 1.4, 'vi2']],
    box: [['s', 'M6 4.6h12A1.4 1.4 0 0 1 19.4 6v12a1.4 1.4 0 0 1-1.4 1.4H6A1.4 1.4 0 0 1 4.6 18V6A1.4 1.4 0 0 1 6 4.6zM5.4 5.4l13.2 13.2M18.6 5.4L5.4 18.6', 2.2]],
    lock: [['s', 'M8 10.6V8a4 4 0 0 1 8 0v2.6', 2.6], ['r', 4.8, 10.4, 14.4, 10.6, 2.6], ['p', 'M12 13.4a1.6 1.6 0 0 1 1 2.85V18h-2v-1.75a1.6 1.6 0 0 1 1-2.85z', '', 'vi2']],
    star: [['p', sao5(10.2, 4.7), '', '', 1.8]],
    edit: [['p', 'M4 20l1.1-4.6L15.4 5.1a2.2 2.2 0 0 1 3.1 0l.4.4a2.2 2.2 0 0 1 0 3.1L8.6 18.9z'], ['s', 'M13.6 6.9l3.5 3.5', 1.6, 'vi2']],
    loa: [['p', 'M4 9.4h3.4l4.6-4v13.2l-4.6-4H4a1 1 0 0 1-1-1V10.4a1 1 0 0 1 1-1z'], ['s', 'M15.4 9a4.2 4.2 0 0 1 0 6M18 6.4a7.8 7.8 0 0 1 0 11.2', 2.2]],
    nhac: [['s', 'M9.2 17.4V6.2l10-2.2v11.2', 2.4], ['c', 6.8, 17.4, 2.8], ['c', 16.8, 15.2, 2.8]],
    canhbao: [['p', 'M10.3 4.3a2 2 0 0 1 3.4 0l7.7 13.3a2 2 0 0 1-1.7 3H4.3a2 2 0 0 1-1.7-3z'], ['r', 10.9, 8.6, 2.2, 6.4, 1.1, 'vi2'], ['c', 12, 17.2, 1.3, 'vi2']],
    mau: [['r', 4, 4, 7, 7, 2], ['r', 13, 4, 7, 7, 2], ['r', 4, 13, 7, 7, 2], ['r', 13, 13, 7, 7, 2]],
    car: [['p', 'M6.6 7.2A2 2 0 0 1 8.4 6h7.2a2 2 0 0 1 1.8 1.2l1.4 3.2h.8A2.4 2.4 0 0 1 22 12.8v2.6a1.2 1.2 0 0 1-1.2 1.2H3.2A1.2 1.2 0 0 1 2 15.4v-2.6a2.4 2.4 0 0 1 2.4-2.4h.8z'],
      ['c', 7, 17, 2.4], ['c', 17, 17, 2.4], ['p', 'M8.8 8h2.6v2.4H7.8zM12.6 8h2.6l1 2.4h-3.6z', '', 'vi2']],
    wall: [['r', 3, 4, 8.4, 4.4, 1.2], ['r', 12.6, 4, 8.4, 4.4, 1.2], ['r', 3, 9.8, 4.2, 4.4, 1.2], ['r', 8.4, 9.8, 7.2, 4.4, 1.2], ['r', 16.8, 9.8, 4.2, 4.4, 1.2],
      ['r', 3, 15.6, 8.4, 4.4, 1.2], ['r', 12.6, 15.6, 8.4, 4.4, 1.2]],
    pin: [['s', 'M4.6 7h12.6a1.6 1.6 0 0 1 1.6 1.6v6.8a1.6 1.6 0 0 1-1.6 1.6H4.6A1.6 1.6 0 0 1 3 15.4V8.6A1.6 1.6 0 0 1 4.6 7z', 2], ['r', 19.6, 10, 2, 4, .8],
      ['r', 5.6, 9.6, 3, 4.8, .8], ['r', 9.6, 9.6, 3, 4.8, .8]],
    sac: [['p', 'M13.4 2.4L4.6 13.6h6.2L9.8 21.6l9-11.6h-6.4z', '', '', 1]],
    // ICON BỘ PHẬN (den-bo-phan.js: thẻ phần ở Lắp robot, đèn nhịp): cùng ý của hình 11 × 11 điểm ảnh, nét tròn
    denBanh: [['s', 'M12 3.6a8.4 8.4 0 1 1 0 16.8 8.4 8.4 0 0 1 0-16.8z', 3], ['c', 12, 12, 2.6], ['s', 'M12 6.4v2.2M12 15.4v2.2M6.4 12h2.2M15.4 12h2.2', 1.8]],
    denXich: [['s', 'M7.4 6h9.2a6 6 0 0 1 0 12H7.4a6 6 0 0 1 0-12z', 2.6], ['c', 7.6, 12, 2.4], ['c', 16.4, 12, 2.4]],
    denTruot: [['s', 'M4 8h15M15.5 4.6L19 8l-3.5 3.4M20 16H5M8.5 12.6L5 16l3.5 3.4', 2.6]],
    denTayLen: [['s', 'M12 20V7M7.4 10.6L12 6l4.6 4.6M6 20.4h12', 2.8]],
    denTayXuong: [['s', 'M12 4v13M7.4 13.4L12 18l4.6-4.6M6 3.6h12', 2.8]],
    denXoay: [['s', 'M5.2 10.4a7.2 7.2 0 0 1 13.6 0M12 12.4v8', 2.8], ['p', 'M20.6 6.6l-1.4 5.4-5-2.4z', '', '', 1]],
    denKepMo: [['s', 'M4.4 3.8l5.4 7.4M19.6 3.8l-5.4 7.4M12 12.6v7.6', 2.8], ['c', 12, 12.2, 3]],
    denKepDong: [['s', 'M9 3.6v6.6l3 1.6 3-1.6V3.6M12 12.6v7.6', 2.8], ['c', 12, 12.4, 2.6]],
    denNamCham: [['s', 'M6.4 4v7.2a5.6 5.6 0 0 0 11.2 0V4', 4.2], ['r', 3.9, 2.8, 5, 3.4, 1, 'vi2'], ['r', 15.1, 2.8, 5, 3.4, 1, 'vi2']],
    denNem: [['s', 'M5 18.4L16.6 6.8M3 19.4h18', 2.6], ['c', 18.2, 5.2, 2.8]],
    denSung: [['s', 'M12 5.4a6.6 6.6 0 1 1 0 13.2 6.6 6.6 0 0 1 0-13.2zM12 2.6v4M12 17.4v4M2.6 12h4M17.4 12h4', 2.4], ['c', 12, 12, 2]],
    denSon: [['r', 8, 7.6, 8, 11, 2.2], ['r', 10.2, 3.2, 3.6, 3.6, 1], ['s', 'M10.4 11.6h3.2', 1.6, 'vi2'], ['s', 'M5.4 21h13.2', 2.4]],
    denCam: [['s', 'M2.8 12c2.4-4.2 5.6-6.4 9.2-6.4s6.8 2.2 9.2 6.4c-2.4 4.2-5.6 6.4-9.2 6.4S5.2 16.2 2.8 12z', 2.4], ['c', 12, 12, 3.2]],
    denChan: [['c', 12, 12, 4], ['s', 'M8.8 9.4L4.4 5.4L3 7.6M15.2 9.4l4.4-4L21 7.6M8.8 14.6l-4.4 4L3 16.4M15.2 14.6l4.4 4 1.4-2.2', 2.2]],
    denCanh: [['s', 'M6.2 6.2l11.6 11.6M17.8 6.2L6.2 17.8', 2.4], ['s', 'M6 2.8a3.2 3.2 0 1 1 0 6.4 3.2 3.2 0 0 1 0-6.4zM18 2.8a3.2 3.2 0 1 1 0 6.4 3.2 3.2 0 0 1 0-6.4zM6 14.8a3.2 3.2 0 1 1 0 6.4 3.2 3.2 0 0 1 0-6.4zM18 14.8a3.2 3.2 0 1 1 0 6.4 3.2 3.2 0 0 1 0-6.4z', 1.8], ['r', 9.4, 9.4, 5.2, 5.2, 1.4]],
    denLogic: [['r', 6, 6, 12, 12, 2.6], ['s', 'M9 2.6v2.4M12 2.6v2.4M15 2.6v2.4M9 19v2.4M12 19v2.4M15 19v2.4M2.6 9h2.4M2.6 12h2.4M2.6 15h2.4M19 9h2.4M19 12h2.4M19 15h2.4', 1.8], ['r', 9.4, 9.4, 5.2, 5.2, 1.2, 'vi2']],
    // gói V6c: icon còn thiếu của màn chơi / Xưởng hàm (bảng vật Xưởng: xuong-ham.js LOAI[].bieu), mũi tên bong bóng, trùm
    mui: [['p', 'M3.2 12l8.2-7v4.4h9.4v5.2h-9.4V19z', '', '', 1.6]],                                    // mũi tên từ bong bóng chỉ sang ô code (Ve.mui)
    trum: [['s', 'M12 8.4V4.8', 2.2], ['c', 12, 3.8, 2], ['s', 'M4.4 12.6H2.6V8.8M19.6 12.6h1.8V8.8', 2.2], ['r', 4.4, 8.2, 15.2, 12.6, 3.2],
      ['r', 6.6, 11, 4.2, 3.4, 1.2, 'vi2'], ['r', 13.2, 11, 4.2, 3.4, 1.2, 'vi2'], ['s', 'M8.6 17.4h6.8', 1.6, 'vi2']],               // robot trùm: ăng-ten, hai càng, kính hai mắt
    rao: [['s', 'M3 9.2h18M3 15.2h18', 2.4], ['s', 'M6 5.4v14.2M12 5.4v14.2M18 5.4v14.2', 2.8]],                                     // hàng rào thấp
    ro: [['p', 'M3.2 9.6h17.6l-2 9.4a2 2 0 0 1-2 1.6H7.2a2 2 0 0 1-2-1.6z'], ['s', 'M7.6 9.4l3-5.4M16.4 9.4l-3-5.4', 2.2], ['s', 'M9.4 12.8v4.8M14.6 12.8v4.8', 1.6, 'vi2']],   // rổ
    nutban: [['s', 'M7 3.8h10A3.2 3.2 0 0 1 20.2 7v10a3.2 3.2 0 0 1-3.2 3.2H7A3.2 3.2 0 0 1 3.8 17V7A3.2 3.2 0 0 1 7 3.8z', 2.2], ['c', 12, 12, 4.8]],   // nút bắn trên sàn
    thung: [['r', 3.4, 3.4, 17.2, 17.2, 2.6], ['s', 'M7.4 7.4l9.2 9.2M16.6 7.4l-9.2 9.2', 2, 'vi2']],                                 // thùng nặng (đai chữ X)
    bac: [['p', 'M3 20.6V15h5.4V9.6h5.4V4.2H21v16.4z', '', '', 1.2]],                                                               // bậc thang
    gam: [['r', 2.6, 3.8, 18.8, 6, 1.8], ['s', 'M5.2 9.8v10.4M18.8 9.8v10.4', 2.6], ['s', 'M7.8 6.8h2.6M13.6 6.8h2.6', 1.6, 'vi2']],   // gầm thấp: mái trên hai cột
    ho: [['s', 'M2.8 12.4a9.2 6.6 0 1 0 18.4 0a9.2 6.6 0 1 0-18.4 0z', 2.2], ['p', 'M6.4 13a5.6 3.6 0 1 0 11.2 0a5.6 3.6 0 1 0-11.2 0z']],   // hố: miệng elip, đáy tối
    bang: [['s', 'M6 7.6h12a4.4 4.4 0 0 1 0 8.8H6a4.4 4.4 0 0 1 0-8.8z', 2.2], ['c', 6.2, 12, 1.8], ['c', 17.8, 12, 1.8], ['p', 'M10.2 9.6l3.8 2.4-3.8 2.4z']],   // băng chuyền
    cua: [['s', 'M5.6 20.8V5a1.6 1.6 0 0 1 1.6-1.6h9.6A1.6 1.6 0 0 1 18.4 5v15.8M3.2 20.8h17.6', 2.2], ['c', 15, 12.8, 1.6], ['s', 'M9 7.6h6', 1.8]]   // cửa
  };

  /** <svg> của icon ten, cỡ hiển thị w × h px CSS (null nếu chưa có bản vector). */
  function taoSvg(ten, w, h, doc) {
    var ds = HINH[ten]; if (!ds) return null;
    doc = doc || root.document;
    var svg = doc.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('width', String(w)); svg.setAttribute('height', String(h));
    svg.setAttribute('class', 'vi vi-' + ten); svg.setAttribute('preserveAspectRatio', 'xMidYMid meet'); svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false');
    ds.forEach(function (q) {
      var e, lop = '';
      if (q[0] === 'p') {
        e = doc.createElementNS(NS, 'path'); e.setAttribute('d', q[1]); e.setAttribute('fill', 'currentColor');
        if (q[2] === 'evenodd') e.setAttribute('fill-rule', 'evenodd');
        if (q[4]) { e.setAttribute('stroke', 'currentColor'); e.setAttribute('stroke-width', String(q[4])); e.setAttribute('stroke-linejoin', 'round'); }   // bo góc hình đặc (sao, tia chớp)
        lop = q[3] || '';
      } else if (q[0] === 's') {
        e = doc.createElementNS(NS, 'path'); e.setAttribute('d', q[1]); e.setAttribute('fill', 'none'); e.setAttribute('stroke', 'currentColor');
        e.setAttribute('stroke-width', String(q[2])); e.setAttribute('stroke-linecap', 'round'); e.setAttribute('stroke-linejoin', 'round');
        lop = q[3] || '';
      } else if (q[0] === 'c') {
        e = doc.createElementNS(NS, 'circle'); e.setAttribute('cx', q[1]); e.setAttribute('cy', q[2]); e.setAttribute('r', q[3]); e.setAttribute('fill', 'currentColor'); lop = q[4] || '';
      } else {
        e = doc.createElementNS(NS, 'rect'); e.setAttribute('x', q[1]); e.setAttribute('y', q[2]); e.setAttribute('width', q[3]); e.setAttribute('height', q[4]); e.setAttribute('rx', q[5]);
        e.setAttribute('fill', 'currentColor'); lop = q[6] || '';
      }
      if (lop) e.setAttribute('class', lop);
      svg.appendChild(e);
    });
    return svg;
  }

  /* ---------------------------------------------------------------- cùng hình HINH, vẽ lên canvas 2D (gói V6c: phim mở gói, cảnh mở màn)
     MỘT bộ icon cho cả giao diện (svg currentColor) lẫn phim (canvas có màu + viền dán): phim-vector.js không còn bộ ICON riêng.
     Đọc chuỗi đường SVG bằng lệnh canvas thường (không Path2D) để chạy được cả với canvas giả của máy kiểm Node. */
  function tachDuong(d) { return String(d).match(/[A-Za-z]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/g) || []; }
  /** Cung elip SVG (A rx ry góc lớn quét x y) → g.ellipse theo tâm (SVG 1.1, phụ lục F.6.5). */
  function cung(g, x1, y1, rx, ry, phiDo, lon, quet, x2, y2) {
    rx = Math.abs(rx); ry = Math.abs(ry);
    if (!rx || !ry || (x1 === x2 && y1 === y2)) { g.lineTo(x2, y2); return; }
    var phi = phiDo * Math.PI / 180, cs = Math.cos(phi), sn = Math.sin(phi);
    var dx = (x1 - x2) / 2, dy = (y1 - y2) / 2, xp = cs * dx + sn * dy, yp = -sn * dx + cs * dy;
    var lam = xp * xp / (rx * rx) + yp * yp / (ry * ry); if (lam > 1) { lam = Math.sqrt(lam); rx *= lam; ry *= lam; }
    var tu = rx * rx * ry * ry - rx * rx * yp * yp - ry * ry * xp * xp, mau = rx * rx * yp * yp + ry * ry * xp * xp;
    var he = Math.sqrt(Math.max(0, tu / mau)) * (lon === quet ? -1 : 1), cxp = he * rx * yp / ry, cyp = -he * ry * xp / rx;
    var cx = cs * cxp - sn * cyp + (x1 + x2) / 2, cy = sn * cxp + cs * cyp + (y1 + y2) / 2;
    var t1 = Math.atan2((yp - cyp) / ry, (xp - cxp) / rx), t2 = Math.atan2((-yp - cyp) / ry, (-xp - cxp) / rx), dt = t2 - t1;
    if (quet && dt < 0) dt += Math.PI * 2; else if (!quet && dt > 0) dt -= Math.PI * 2;
    g.ellipse(cx, cy, rx, ry, phi, t1, t1 + dt, !quet);
  }
  /** Dựng đường SVG d (M L H V C S Q A Z, hoa / thường) thành path hiện hành của g. */
  function duong(g, d) {
    var tk = tachDuong(d), i = 0, c = '', x = 0, y = 0, sx = 0, sy = 0, kx = 0, ky = 0, truoc = '';
    function so() { return parseFloat(tk[i++]); }
    g.beginPath();
    while (i < tk.length) {
      if (/[A-Za-z]/.test(tk[i])) c = tk[i++];
      var C = c.toUpperCase(), tg = c !== C, ox = tg ? x : 0, oy = tg ? y : 0, a, b;
      if (C === 'Z') { g.closePath(); x = sx; y = sy; truoc = 'Z'; if (i < tk.length && !/[A-Za-z]/.test(tk[i])) break; continue; }
      if (C === 'M') { x = ox + so(); y = oy + so(); sx = x; sy = y; g.moveTo(x, y); c = tg ? 'l' : 'L'; }
      else if (C === 'L') { x = ox + so(); y = oy + so(); g.lineTo(x, y); }
      else if (C === 'H') { x = ox + so(); g.lineTo(x, y); }
      else if (C === 'V') { y = oy + so(); g.lineTo(x, y); }
      else if (C === 'C') { a = ox + so(); b = oy + so(); kx = ox + so(); ky = oy + so(); x = ox + so(); y = oy + so(); g.bezierCurveTo(a, b, kx, ky, x, y); }
      else if (C === 'S') { a = /[CS]/.test(truoc) ? 2 * x - kx : x; b = /[CS]/.test(truoc) ? 2 * y - ky : y; kx = ox + so(); ky = oy + so(); x = ox + so(); y = oy + so(); g.bezierCurveTo(a, b, kx, ky, x, y); }
      else if (C === 'Q') { kx = ox + so(); ky = oy + so(); x = ox + so(); y = oy + so(); g.quadraticCurveTo(kx, ky, x, y); }
      else if (C === 'A') { var rx = so(), ry = so(), phi = so(), lon = so(), quet = so(), x2 = ox + so(), y2 = oy + so(); cung(g, x, y, rx, ry, phi, lon, quet, x2, y2); x = x2; y = y2; }
      else throw new Error('VeIcon: lệnh đường lạ "' + c + '"');
      if (isNaN(x) || isNaN(y)) throw new Error('VeIcon: đường hỏng ' + d);
      truoc = C;
    }
  }
  function chuNhatBo(g, x, y, w, h, r) {
    r = Math.min(r || 0, w / 2, h / 2);
    g.beginPath(); g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.arcTo(x + w, y, x + w, y + r, r); g.lineTo(x + w, y + h - r); g.arcTo(x + w, y + h, x + w - r, y + h, r);
    g.lineTo(x + r, y + h); g.arcTo(x, y + h, x, y + h - r, r); g.lineTo(x, y + r); g.arcTo(x, y, x + r, y, r); g.closePath();
  }
  /**
   * Vẽ icon ten (khung 24) vào ô vuông (x, y, canh) của canvas g: nét / mảng tô màu mau, chi tiết phụ (vi2) màu tc.phu (mặc định trắng thẻ);
   * tc.vien: màu viền dán quanh hình (rộng thêm tc.day đơn vị 24 mỗi bên, mặc định 1,6), như nhãn dán của bộ vẽ vector. Trả false nếu không có hình.
   */
  function veCanvas(g, ten, x, y, canh, mau, tc) {
    var ds = HINH[ten]; if (!ds) return false;
    tc = tc || {};
    var phu = tc.phu || BM.vecThe, day = tc.day === undefined ? 1.6 : tc.day;
    function dung(q) {
      if (q[0] === 'p' || q[0] === 's') duong(g, q[1]);
      else if (q[0] === 'c') { g.beginPath(); g.arc(q[1], q[2], q[3], 0, Math.PI * 2); g.closePath(); }
      else chuNhatBo(g, q[1], q[2], q[3], q[4], q[5]);
    }
    function lopCua(q) { return q[0] === 'p' ? q[3] : q[0] === 's' ? q[3] : q[0] === 'c' ? q[4] : q[6]; }
    g.save(); g.translate(x, y); g.scale(canh / 24, canh / 24);
    g.lineCap = 'round'; g.lineJoin = 'round';
    if (tc.vien) ds.forEach(function (q) {                                  // lượt 1: viền dán (chi tiết phụ không viền)
      if (lopCua(q) === 'vi2') return;
      dung(q); g.strokeStyle = tc.vien;
      g.lineWidth = (q[0] === 's' ? q[2] : q[0] === 'p' && q[4] ? q[4] : 0) + day * 2; g.stroke();
      if (q[0] !== 's') { g.fillStyle = tc.vien; g.fill(q[0] === 'p' && q[2] === 'evenodd' ? 'evenodd' : 'nonzero'); }
    });
    ds.forEach(function (q) {                                               // lượt 2: hình
      var m = lopCua(q) === 'vi2' ? phu : mau;
      dung(q);
      if (q[0] === 's') { g.strokeStyle = m; g.lineWidth = q[2]; g.stroke(); return; }
      g.fillStyle = m; g.fill(q[0] === 'p' && q[2] === 'evenodd' ? 'evenodd' : 'nonzero');
      if (q[0] === 'p' && q[4]) { g.strokeStyle = m; g.lineWidth = q[4]; g.stroke(); }
    });
    g.restore();
    return true;
  }

  /** Trạng thái phụ của icon (lớp CSS): sao tắt (Ve.sao(false)), xu đã tiêu / không đủ (man-lap.js xuIcon(false): tô xám). */
  function phuCua(v) {
    if (v.phu) return v.phu;
    if (v.ten === 'xu' && v.tuyChon && v.tuyChon.fill === BM.xamToi2V4) return 'tat';
    return '';
  }

  function giaoDienVec() { var d = root.document; return !!(d && d.body && d.body.classList && d.body.classList.contains && d.body.classList.contains('ve-vector')); }   // DOM giả của máy kiểm có thể thiếu classList
  function trongPhamVi(e) { return !!(e.closest && e.closest(PHAM_VI)); }
  /** V7b (gỡ C1): <svg> icon dùng THẲNG trong giao diện (ve.js Ve.ico / sao / mui / khoa / hydrate gọi ở body.ve-vector): cạnh k px CSS (ô vuông theo cạnh lớn của bản pixel),
   *  lớp `pxi vi vi-<tên>` (+ phu: 'tat' cho sao / xu / trùm tắt), nhãn _vi như canvas pixel. Trả null nếu không có hình hay DOM không dựng được svg (Node không createElementNS). */
  function svg(ten, k, tuyChon, phu) {
    var d = root.document; if (!HINH[ten] || !d || typeof d.createElementNS !== 'function') return null;
    var v = { ten: ten, tuyChon: tuyChon || {}, phu: phu || '' }, p = phuCua(v), e = taoSvg(ten, k, k, d);
    if (!e) return null;
    e.setAttribute('class', 'pxi vi vi-' + ten + (p ? ' ' + p : ''));
    e.style.width = k + 'px'; e.style.height = k + 'px';
    e._vi = v;
    return e;
  }
  /** Người gọi có thể còn giữ canvas cũ để đổi sau (den-bo-phan.js bật / tắt đèn bằng cv.style.display; thanh-phan.js thêm lớp): canvas đã gỡ
   *  chuyển style / classList / className sang hình thay nó, nên mọi thay đổi về sau vẫn tới hình đang hiện. */
  function noiVe(c, moi) {
    try {
      Object.defineProperty(c, 'style', { configurable: true, get: function () { return moi.style; } });
      Object.defineProperty(c, 'classList', { configurable: true, get: function () { return moi.classList; } });
      Object.defineProperty(c, 'className', { configurable: true, get: function () { return moi.getAttribute('class') || ''; }, set: function (v) { moi.setAttribute('class', v); } });
    } catch (e) { /* trình duyệt không cho định nghĩa lại: bỏ qua */ }
    c._thay = moi;
  }
  /** Thay một canvas icon có nhãn bằng svg (trả svg, hoặc null nếu không thay). */
  function thayMot(c) {
    var v = c._vi; if (!v || !HINH[v.ten] || !c.parentNode) return null;
    var w = parseFloat(c.style.width) || c.width, h = parseFloat(c.style.height) || c.height, k = Math.max(w, h);   // ô vuông theo cạnh lớn: icon hẹp (‹ › 7 × 10 điểm) không bị thu nhỏ
    var svg = taoSvg(v.ten, k, k); if (!svg) return null;
    var phu = phuCua(v);
    svg.setAttribute('class', (c.getAttribute('class') || '') + ' vi vi-' + v.ten + (phu ? ' ' + phu : ''));
    if (c.style.cssText) { svg.style.cssText = c.style.cssText; svg.style.width = k + 'px'; svg.style.height = k + 'px'; }
    svg._vi = v;
    c.parentNode.replaceChild(svg, c);
    noiVe(c, svg);
    return svg;
  }
  /* ---- hình BỘ PHẬN THẬT ở tiêu đề thẻ khay (thanh-phan.js hinhPart: Part._veMot → cắt lề → Ve.mk, ảnh điểm ảnh không nhãn).
     Ở vector: Part._veMot đánh dấu canvas bộ phận (_partVi = { loai, ma }), dấu đi theo drawImage sang canvas chép (cắt lề, Ve.mk); canvas có dấu nằm trong
     tiêu đề thẻ (.co-part) được thay bằng hình bộ phận vẽ bằng VeVector (thân: VeVector.robot không tay; tay: hình tay đứng một mình), cùng cỡ chỗ đặt.
     Cùng chỗ nối: canvas MỚI mà lần vẽ đầu là chép một hình vector (.laVector, ví dụ the-part.js / mo-dau.js cắt lề robot) cũng mang .laVector. */
  var DAU_PART = '_partVi';
  function catLe(cv) {
    var g = cv.getContext('2d'), w = cv.width, hh = cv.height, d = g.getImageData(0, 0, w, hh).data, x0 = w, y0 = hh, x1 = -1, y1 = -1, x, y;
    for (y = 0; y < hh; y++) for (x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (x1 < 0) return cv;
    var c = root.document.createElement('canvas'); c.width = x1 - x0 + 1; c.height = y1 - y0 + 1;
    c.getContext('2d').drawImage(cv, x0, y0, c.width, c.height, 0, 0, c.width, c.height);
    return c;
  }
  /** Canvas vector của bộ phận bp = { loai: 'than' | 'tay', ma } (null nếu VeVector chưa có hình). */
  function hinhPartVec(bp) {
    var V = root.VeVector; if (!V || !V.lay || !bp) return null;
    var d = V.lay(bp.loai, bp.ma); if (!d) return null;
    var P = Math.round(56 * (root.devicePixelRatio || 1)), cv;
    try {
      if (bp.loai === 'than') cv = V.robot({ than: bp.ma, tay: null, camBien: [] }, {}, 0, P);
      else {
        var tr = d.tran || 0, W = Math.round(P * (1 + 2 * tr));
        cv = root.document.createElement('canvas'); cv.width = W; cv.height = P;
        var g = cv.getContext('2d'); g.save(); g.translate(W / 2, P / 2); g.rotate(Math.PI); g.translate(-W / 2, -P / 2); g.translate(P * tr, 0); g.scale(P / 100, P / 100);   // tay vẽ quay mặt xuống: lật lên như thân
        d.ve(g, {}, V.mauDoi(), V.H); g.restore();
      }
    } catch (e) { return null; }
    var c = catLe(cv); c.laVector = true; return c;
  }
  function thayPart(c) {
    var moi = hinhPartVec(c[DAU_PART]); if (!moi || !c.parentNode) return null;
    moi.className = (c.getAttribute('class') || 'pxi') + ' vi-part';
    c.parentNode.replaceChild(moi, c);
    noiVe(c, moi);
    return moi;
  }
  var daNoiPart = false;
  function noiPart() {
    var P = root.Part, C2 = root.CanvasRenderingContext2D;
    if (daNoiPart || !P || !P._veMot || !C2 || !C2.prototype.drawImage) return false;
    daNoiPart = true;
    var ve0 = P._veMot;
    P._veMot = function (d) {
      var p = ve0.apply(this, arguments);
      if (p && p.canvas && d && d.ma) { var c0 = p.canvas; p.canvas = function () { var cv = c0.apply(p, arguments); if (cv) cv[DAU_PART] = { loai: d.loai, ma: d.ma }; return cv; }; }
      return p;
    };
    var di0 = C2.prototype.drawImage;
    C2.prototype.drawImage = function (nguon) {
      var dich = this.canvas;
      if (dich && nguon) {
        if (nguon[DAU_PART] && !dich[DAU_PART]) dich[DAU_PART] = nguon[DAU_PART];
        if (nguon.laVector && dich._daVe === undefined && !dich.laVector) dich.laVector = true;    // bản chép (cắt lề) của hình vector, lần vẽ ĐẦU vào canvas mới: Ve.mk không phóng điểm ảnh
        dich._daVe = 1;
      }
      return di0.apply(this, arguments);
    };
    return true;
  }
  /** Nút chỉ có icon (không chữ) mang aria-label mà thiếu title: thêm title cùng chữ (luật UI: title + aria-label). */
  function datTitle(b) {
    if (b.hasAttribute('title') || !b.getAttribute('aria-label')) return;
    if ((b.textContent || '').trim()) return;
    b.setAttribute('title', b.getAttribute('aria-label'));
  }
  /** Thay mọi icon có nhãn trong goc (chỉ phần nằm trong PHAM_VI / PHAM_VI_CHOI). Trả số icon đã thay. */
  function thay(goc) {
    if (!giaoDienVec() || !goc || !goc.querySelectorAll) return 0;
    var n = 0, i, ds = [];
    if (goc.tagName === 'CANVAS') ds.push(goc);
    var cs = goc.querySelectorAll('canvas.pxi'); for (i = 0; i < cs.length; i++) ds.push(cs[i]);
    for (i = 0; i < ds.length; i++) {
      var c = ds[i];                                                     // V7b: icon có nhãn _vi không thay nữa (ve.js đã trả svg thẳng); chỉ còn hình bộ phận (C3)
      if (!c._vi && c[DAU_PART] && !c.laVector && c.closest && c.closest('.co-part') && thayPart(c)) n++;
    }
    var bs = goc.tagName === 'BUTTON' ? [goc] : goc.querySelectorAll('button[aria-label]:not([title])');
    for (i = 0; i < bs.length; i++) if (trongPhamVi(bs[i])) datTitle(bs[i]);
    return n;
  }
  var quanSat = null;
  /** Bắt đầu theo dõi #stage (gọi một lần khi nạp, sau VeVector.apGiaoDien). */
  function batDau() {
    var d = root.document; if (!giaoDienVec() || quanSat || !root.MutationObserver) return false;
    noiPart();
    var st = (d.getElementById && d.getElementById('stage')) || d.body;
    quanSat = new root.MutationObserver(function (ds) {
      for (var i = 0; i < ds.length; i++) for (var j = 0; j < ds[i].addedNodes.length; j++) { var nd = ds[i].addedNodes[j]; if (nd.nodeType === 1) thay(nd); }
    });
    quanSat.observe(st, { childList: true, subtree: true });
    thay(st);
    return true;
  }

  var VeIcon = { HINH: HINH, PHAM_VI: PHAM_VI, svg: svg, hinhPartVec: hinhPartVec, taoSvg: taoSvg, veCanvas: veCanvas, duong: duong, thay: thay, thayMot: thayMot, batDau: batDau, co: function (ten) { return !!HINH[ten]; } };
  root.VeIcon = VeIcon;
  if (typeof module === 'object' && module.exports) module.exports = VeIcon;
  if (root.document && root.document.body) batDau();
})(typeof window !== 'undefined' ? window : this);
