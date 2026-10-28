var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ============================================================================
   ve-vector-icon.js — "Robot Chấn Hưng": ICON VECTOR (window.VeIcon, gói V5b, 28/10) cho chế độ vector.
   Icon điểm ảnh của ve.js (Ve.ico / Ve.sao / Ve.khoa, kể cả qua Ve.hydrate) mang nhãn c._vi = { ten, tuyChon, phu }. Ở body.ve-vector, mọi canvas có nhãn
   nằm trong PHAM_VI (các màn NGOÀI màn chơi: màn đầu, chọn gói, lưới màn, Lắp robot, hộp thoại, phim) được thay bằng <svg> cùng cỡ hiển thị (style width / height
   của Ve.mk), cùng lớp (giữ .pxi và lớp người gọi thêm), thêm lớp `vi vi-<tên>` (+ `tat` cho sao / xu tắt). Màu: fill / stroke = currentColor, nên MÀU THEO VAI
   đặt bằng CSS (giao-dien-vector-b.css mục 8: color: var(--g-vec…)); chi tiết phụ (lỗ khoá, vành xu…) mang lớp `vi2`.
   Thay bằng MutationObserver trên #stage: dựng màn / hộp xong là đổi ngay trong cùng vi tác vụ, trước khi trình duyệt vẽ (không chớp hình pixel).
   Màn chơi (#sc-choi) GIỮ icon điểm ảnh phóng sẵn của V5a (không đổi màn chơi trong gói này); icon chưa có bản vector (icon bộ phận den*, trùm…) giữ điểm ảnh.
   Pixel (không body.ve-vector): không làm gì.
   Cùng lúc: nút chỉ có icon trong PHAM_VI có aria-label mà thiếu title thì được thêm title cùng chữ (luật UI), chỉ ở vector.
   ========================================================================== */
(function (root) {
  'use strict';

  var PHAM_VI = '#sc-dau,#sc-goi,#sc-chon,#sc-lap,#lop-hop,.md';
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
    denLogic: [['r', 6, 6, 12, 12, 2.6], ['s', 'M9 2.6v2.4M12 2.6v2.4M15 2.6v2.4M9 19v2.4M12 19v2.4M15 19v2.4M2.6 9h2.4M2.6 12h2.4M2.6 15h2.4M19 9h2.4M19 12h2.4M19 15h2.4', 1.8], ['r', 9.4, 9.4, 5.2, 5.2, 1.2, 'vi2']]
  };

  /** <svg> của icon ten, cỡ hiển thị w × h px CSS (null nếu chưa có bản vector). */
  function taoSvg(ten, w, h, doc) {
    var ds = HINH[ten]; if (!ds) return null;
    doc = doc || root.document;
    var svg = doc.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('width', String(w)); svg.setAttribute('height', String(h));
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet'); svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false');
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

  /** Trạng thái phụ của icon (lớp CSS): sao tắt (Ve.sao(false)), xu đã tiêu / không đủ (man-lap.js xuIcon(false): tô xám). */
  function phuCua(v) {
    if (v.phu) return v.phu;
    if (v.ten === 'xu' && v.tuyChon && v.tuyChon.fill === BM.xamToi2V4) return 'tat';
    return '';
  }

  function giaoDienVec() { var d = root.document; return !!(d && d.body && d.body.classList.contains('ve-vector')); }
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
    return svg;
  }
  /** Nút chỉ có icon (không chữ) mang aria-label mà thiếu title: thêm title cùng chữ (luật UI: title + aria-label). */
  function datTitle(b) {
    if (b.hasAttribute('title') || !b.getAttribute('aria-label')) return;
    if ((b.textContent || '').trim()) return;
    b.setAttribute('title', b.getAttribute('aria-label'));
  }
  /** Thay mọi icon có nhãn trong goc (chỉ phần nằm trong PHAM_VI). Trả số icon đã thay. */
  function thay(goc) {
    if (!giaoDienVec() || !goc || !goc.querySelectorAll) return 0;
    var n = 0, i, ds = [];
    if (goc.tagName === 'CANVAS') ds.push(goc);
    var cs = goc.querySelectorAll('canvas.pxi'); for (i = 0; i < cs.length; i++) ds.push(cs[i]);
    for (i = 0; i < ds.length; i++) if (ds[i]._vi && ds[i].closest && ds[i].closest(PHAM_VI) && thayMot(ds[i])) n++;
    var bs = goc.tagName === 'BUTTON' ? [goc] : goc.querySelectorAll('button[aria-label]:not([title])');
    for (i = 0; i < bs.length; i++) if (bs[i].closest && bs[i].closest(PHAM_VI)) datTitle(bs[i]);
    return n;
  }
  var quanSat = null;
  /** Bắt đầu theo dõi #stage (gọi một lần khi nạp, sau VeVector.apGiaoDien). */
  function batDau() {
    var d = root.document; if (!giaoDienVec() || quanSat || !root.MutationObserver) return false;
    var st = d.getElementById('stage') || d.body;
    quanSat = new root.MutationObserver(function (ds) {
      for (var i = 0; i < ds.length; i++) for (var j = 0; j < ds[i].addedNodes.length; j++) { var nd = ds[i].addedNodes[j]; if (nd.nodeType === 1) thay(nd); }
    });
    quanSat.observe(st, { childList: true, subtree: true });
    thay(st);
    return true;
  }

  var VeIcon = { HINH: HINH, PHAM_VI: PHAM_VI, taoSvg: taoSvg, thay: thay, thayMot: thayMot, batDau: batDau, co: function (ten) { return !!HINH[ten]; } };
  root.VeIcon = VeIcon;
  if (typeof module === 'object' && module.exports) module.exports = VeIcon;
  if (root.document && root.document.body) batDau();
})(typeof window !== 'undefined' ? window : this);
