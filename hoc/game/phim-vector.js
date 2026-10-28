var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ============================================================================
   phim-vector.js — HÌNH VECTOR CHO PHIM (gói V6, 28/10): window.PhimVector. Bộ dựng hình của phim gói (phim-goi.js, C.ico / C.o / C.co / C.nutDe / C.cua / C.sao)
   gọi vào đây khi VeVector.bat(); mỗi hàm trả PHẦN TỬ canvas đã đặt cỡ CSS (rasterise × devicePixelRatio × 2, trình duyệt thu mịn), hoặc null nếu chưa có bản vector
   (người gọi rơi về pixel). Cỡ hiển thị theo đúng bản pixel cùng tham số (ô 14·s, icon / sao: đo cỡ phần tử pixel) để bố cục phim không xê dịch.
     PhimVector.o(ten, s, i)      ô sân: 'rug' (sàn, i chẵn / lẻ → bàn cờ), 'pad', 'wall', 'crate' (thùng gỗ), 'thung' (thùng nặng), cạnh 14·s
     PhimVector.co(s)             cờ đích đầy một ô 14·s (cờ bay: VeVector.o('co', { pha }))
     PhimVector.nutDe(bat, s)     nút đè (VeVector.o('nut-de', { de })) trên sàn
     PhimVector.cua(mo, s, doc)   cửa (VeVector.o('cua', { k, doc })) trên sàn
     PhimVector.sao(s)            sao vàng (cùng cỡ Ve.sao(true, s))
     PhimVector.ico(ten, s, mau)  icon bộ phận của phim: denKepMo, denCam, denBanh, denXich, denXoay, box, reset (cùng cỡ Ve.ico); tên khác → null
   ICON CHUNG: ICON[ten](g, H, mau) vẽ trong hệ 100 × 100; V5b / người giao có thể gom vào bộ icon vector chung của giao diện.
   ========================================================================== */
(function (root) {
  'use strict';
  var V = root.VeVector, SIEU = 2;
  function bat() { return !!(V && V.bat()); }
  function dpr() { return root.devicePixelRatio || 1; }
  /** Phần tử canvas cỡ CSS w × h, vẽ bằng ve(g) trong hệ (w, h) CSS. */
  function the(w, h, ve) {
    var k = dpr() * SIEU, cv = root.document.createElement('canvas');
    cv.width = Math.max(1, Math.round(w * k)); cv.height = Math.max(1, Math.round(h * k));
    var g = cv.getContext('2d'); g.save(); g.scale(cv.width / w, cv.height / h); ve(g); g.restore();
    cv.style.width = w + 'px'; cv.style.height = h + 'px'; cv.className = 'pxi'; cv.laVector = true;
    return cv;
  }
  /** Canvas đệm của VeVector (o / vat) đặt kín ô (x, y, canh) trong hệ CSS. */
  function dan(g, nguon, x, y, canh) { if (nguon) g.drawImage(nguon, x, y, canh, canh); }
  function px(canhCss) { return Math.max(1, Math.round(canhCss * dpr() * SIEU)); }

  function o(ten, s, i) {
    if (!bat()) return null;
    var c = 14 * s;
    if (ten === 'rug' || ten === 'pad') return the(c, c, function (g) { dan(g, V.o('san', px(c), (i || 0) & 1 ? { le: 1 } : {}), 0, 0, c); });
    if (ten === 'wall') return the(c, c, function (g) { dan(g, V.o('tuong', px(c), {}), 0, 0, c); });
    if (ten === 'crate') return the(c, c, function (g) { dan(g, V.vat('thung-go', px(c), {}), 0, 0, c); });
    if (ten === 'thung') return the(c, c, function (g) { dan(g, V.vat('thung-nang', px(c), {}), 0, 0, c); });
    return null;
  }
  function co(s) { if (!bat()) return null; var c = 14 * s; return the(c, c, function (g) { dan(g, V.o('co', px(c), { pha: 0.25 }), 0, 0, c); }); }
  function nutDe(bat_, s) {
    if (!bat()) return null; var c = 14 * s;
    return the(c, c, function (g) { dan(g, V.o('san', px(c), {}), 0, 0, c); dan(g, V.o('nut-de', px(c), bat_ ? { de: true } : {}), 0, 0, c); });
  }
  function cua(mo, s, doc) {
    if (!bat()) return null; var c = 14 * s;
    return the(c, c, function (g) { dan(g, V.o('san', px(c), {}), 0, 0, c); dan(g, V.o('cua', px(c), { k: mo >= 1 ? 1 : mo <= 0 ? 0 : mo, doc: doc !== false }), 0, 0, c); });
  }
  /** Cỡ CSS của phần tử pixel cùng tham số (để bản vector chiếm đúng chỗ). */
  function coCua(e) { return { w: parseFloat(e.style.width) || e.width, h: parseFloat(e.style.height) || e.height }; }
  function sao(s) {
    if (!bat() || !V.HUY_HIEU) return null;
    var m = coCua(root.Ve.sao(true, s));
    return the(m.w, m.h, function (g) { var r = Math.min(m.w, m.h) / 2; g.save(); g.translate(m.w / 2, m.h / 2 + r * 0.06); g.scale(r / 50, r / 50); V.HUY_HIEU._sao(g, 0, 0, 46); g.restore(); });
  }

  /* ---------------------------------------------------------------- icon bộ phận của phim (hệ 100) */
  var ICON = {};
  function nen(g, H, d, mau) { H.duong(g, d); H.to(g, mau); H.vien(g, BM.vecVien, 6); }
  ICON.denKepMo = function (g, H, mau) {                                  // càng kẹp mở: hai ngón cong trên cổ tay
    H.duong(g, 'M50 62 C36 52 22 38 20 12 M50 62 C64 52 78 38 80 12'); H.vien(g, BM.vecVien, 17); H.vien(g, mau, 9);
    H.bo(g, 38, 58, 24, 16, 6); H.to(g, BM.vecVo); H.vien(g, BM.vecVien, 5);
    H.duong(g, 'M50 74 V92'); H.vien(g, BM.vecVien, 13); H.vien(g, mau, 6);
  };
  ICON.denCam = function (g, H, mau) {                                    // mắt cảm biến: vỏ tròn, thấu kính, vệt sáng
    H.elip(g, 50, 50, 44, 32); H.to(g, BM.vecVo); H.vien(g, BM.vecVien, 6);
    H.tron(g, 50, 50, 19); H.to(g, mau); H.vien(g, BM.vecVien, 5);
    H.tron(g, 43, 43, 6); H.to(g, BM.vecVo);
  };
  ICON.denBanh = function (g, H, mau) {                                   // bánh xe: lốp, vành màu, trục
    H.tron(g, 50, 50, 44); H.to(g, BM.vecBanh); H.vien(g, BM.vecVien, 6);
    H.tron(g, 50, 50, 27); H.to(g, mau); H.vien(g, BM.vecVien, 5);
    H.tron(g, 50, 50, 9); H.to(g, BM.vecVo); H.vien(g, BM.vecVien, 4);
  };
  ICON.denXich = function (g, H, mau) {                                   // dải xích: vòng bo tròn, mắt xích, hai bánh dẫn
    H.bo(g, 4, 18, 92, 64, 32); H.to(g, BM.vecBanh); H.vien(g, BM.vecVien, 6);
    g.beginPath(); for (var x = 22; x <= 78; x += 14) { g.moveTo(x, 20); g.lineTo(x, 28); g.moveTo(x, 72); g.lineTo(x, 80); } H.vien(g, BM.vecXichMat, 5);
    [30, 70].forEach(function (x) { H.tron(g, x, 50, 15); H.to(g, mau); H.vien(g, BM.vecVien, 5); H.tron(g, x, 50, 5); H.to(g, BM.vecVo); });
  };
  ICON.denXoay = function (g, H, mau) {                                   // khớp xoay: cung mũi tên quanh khớp tròn trên cột
    g.beginPath(); g.arc(50, 40, 32, Math.PI * 1.05, Math.PI * 1.95); H.vien(g, BM.vecVien, 13); H.vien(g, mau, 6);
    nen(g, H, 'M76 14 L88 30 L70 32 Z', mau);
    H.duong(g, 'M50 52 V90'); H.vien(g, BM.vecVien, 13); H.vien(g, BM.vecVo, 6);
    H.tron(g, 50, 48, 13); H.to(g, mau); H.vien(g, BM.vecVien, 5);
  };
  ICON.box = function (g, H, mau) {                                       // hộp linh kiện: thân màu, nắp, vệt sáng
    H.bo(g, 8, 22, 84, 70, 12); g.fillStyle = H.gradDoc(g, 0, 22, 0, 92, [[0, mau], [1, mau]]); g.fill(); H.vien(g, BM.vecVien, 6);
    H.bo(g, 4, 10, 92, 22, 8); H.to(g, BM.vecVo); H.vien(g, BM.vecVien, 6);
    H.bo(g, 40, 44, 20, 12, 4); H.to(g, BM.vecVo); H.vien(g, BM.vecVien, 4);
  };
  ICON.reset = function (g, H, mau) {                                     // mũi tên vòng (quay cả xe)
    g.beginPath(); g.arc(50, 52, 32, -Math.PI * 0.3, Math.PI * 1.3); H.vien(g, BM.vecVien, 17); H.vien(g, mau, 9);
    var a = Math.PI * 1.3, ex = 50 + Math.cos(a) * 32, ey = 52 + Math.sin(a) * 32;
    nen(g, H, 'M' + (ex - 18) + ' ' + (ey - 2) + ' L' + (ex + 12) + ' ' + (ey - 14) + ' L' + (ex + 6) + ' ' + (ey + 18) + ' Z', mau);
  };
  function ico(ten, s, mau) {
    if (!bat() || !ICON[ten]) return null;
    var m = coCua(root.Ve.ico(ten, s, { fill: mau || BM.vang, line: BM.vienDam }));
    return the(m.w, m.h, function (g) { var r = Math.min(m.w, m.h); g.save(); g.translate((m.w - r) / 2, (m.h - r) / 2); g.scale(r / 100, r / 100); ICON[ten](g, V.H, mau || BM.vang); g.restore(); });
  }

  root.PhimVector = { bat: bat, o: o, co: co, nutDe: nutDe, cua: cua, sao: sao, ico: ico, ICON: ICON, the: the };
})(typeof window !== 'undefined' ? window : globalThis);
