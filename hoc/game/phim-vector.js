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
     PhimVector.ico(ten, s, mau)  icon của phim (cùng cỡ Ve.ico): MỌI tên của bộ icon chung VeIcon.HINH (ve-vector-icon.js), vẽ có màu + viền dán; tên không có → null
   (gói V6c gộp: bộ ICON riêng hệ 100 của V6 trùng 7 tên với VeIcon.HINH đã bỏ, một bộ icon cho cả giao diện và phim)
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
    var m = { w: 11 * (s || 2), h: 10 * (s || 2) };                   // cỡ Ve.sao(true, s): sao 11 × 10 điểm (không vẽ bản pixel để đo, gói V6c)
    return the(m.w, m.h, function (g) { var r = Math.min(m.w, m.h) / 2; g.save(); g.translate(m.w / 2, m.h / 2 + r * 0.06); g.scale(r / 50, r / 50); V.HUY_HIEU._sao(g, 0, 0, 46); g.restore(); });
  }

  /* ---------------------------------------------------------------- icon của phim: CÙNG MỘT BỘ với giao diện (VeIcon.HINH, ve-vector-icon.js; gói V6c)
     Phim vẽ icon lên canvas bằng VeIcon.veCanvas: nét / mảng màu theo vai vector của màu pixel người gọi đưa (MAU_VEC), viền dán chàm đậm, chi tiết phụ trắng. */
  var MAU_VEC = [[BM.vang, 'vecVang'], [BM.xanhLoSang2, 'vecDen'], [BM.lamSang, 'vecLam'], [BM.xanhLaSangV9, 'vecXanhLa'], [BM.camToiV1, 'vecHoPhach'],
    [BM.timV7, 'vecCong2'], [BM.do, 'vecDo']];
  /** Màu pixel của phim → vai vector cùng họ (không có thì tím chàm thương hiệu). */
  function mauVec(mau) { for (var i = 0; i < MAU_VEC.length; i++) if (MAU_VEC[i][0] === mau) return BM[MAU_VEC[i][1]]; return BM.vecBrand; }
  /** Cỡ CSS của Ve.ico(ten, s): bảng số Ve.CO_ICON (ve.js; V7c2: lưới pixel Ve.HINH đã xoá, bảng là nguồn duy nhất); tên không có: 12 × 12. */
  function coIco(ten, s) {
    s = s || 2;
    var c = (root.Ve && root.Ve.CO_ICON && root.Ve.CO_ICON[ten]) || [12, 12];
    return { w: c[0] * s, h: c[1] * s };
  }
  function ico(ten, s, mau) {
    var VI = root.VeIcon;
    if (!bat() || !VI || !VI.HINH[ten]) return null;
    var m = coIco(ten, s);
    return the(m.w, m.h, function (g) { var r = Math.min(m.w, m.h) * 0.92; VI.veCanvas(g, ten, (m.w - r) / 2, (m.h - r) / 2, r, mauVec(mau || BM.vang), { vien: BM.vecVien, day: 1.5 }); });
  }

  /** Gói V6c: xe tải chở linh kiện của cảnh mở màn (mo-dau.js khung 1, 2) nhìn ngang, đầu quay phải, cỡ CSS w × h (bản pixel: icon 'car' tỉ lệ 6 = 84 × 60).
   *  Thùng sau thấp (thùng gỗ đặt lên trên), cabin đỏ có kính, đèn pha vàng, hai bánh con nhộng tối có trục trắng, viền chàm đậm. */
  function xeTai(w, h) {
    if (!bat()) return null;
    w = w || 84; h = h || 60;
    return the(w, h, function (g) {
      var H = V.H, k = Math.min(w / 84, h / 60);
      g.save(); g.scale(k, k);
      H.bo(g, 3, 30, 52, 15, 4); g.fillStyle = H.gradDoc(g, 0, 30, 0, 45, [[0, BM.vecDoSang], [1, BM.vecDo]]); g.fill(); H.vien(g, BM.vecVien, 2.4);   // thùng sau
      H.duong(g, 'M8 36 H50'); H.vien(g, BM.vecVo, 1.6);                                                                                       // nẹp sáng
      H.duong(g, 'M53 45 V22 C53 18 55 16 59 16 H69 C72 16 74 18 76 21 L81 30 V45 Z');
      g.fillStyle = H.gradDoc(g, 0, 16, 0, 45, [[0, BM.vecDoSang], [0.35, BM.vecDo], [1, BM.vecDo]]); g.fill(); H.vien(g, BM.vecVien, 2.4);          // cabin
      H.duong(g, 'M58 21 H69 L74 29 H58 Z'); H.to(g, BM.vecMat); H.vien(g, BM.vecVien, 1.8);                                                   // kính
      H.bo(g, 76, 34, 5, 4, 1.5); H.to(g, BM.vecVang); H.vien(g, BM.vecVien, 1.4);                                                             // đèn pha
      H.duong(g, 'M2 45 H82'); H.vien(g, BM.vecVien, 3);                                                                                       // sàn xe
      [18, 66].forEach(function (x) { H.tron(g, x, 47, 9); H.to(g, BM.vecBanh); H.vien(g, BM.vecVien, 2.4); H.tron(g, x, 47, 3.4); H.to(g, BM.vecVo); });
      g.restore();
    });
  }

  root.PhimVector = { bat: bat, o: o, co: co, nutDe: nutDe, cua: cua, sao: sao, ico: ico, xeTai: xeTai, mauVec: mauVec, the: the };

  /* ---------------------------------------------------------------- PHIM MÙA 2 (28/10, phim-mua-2.js): hình cơ chế mới của mùa 2, cùng cách các hàm trên
     (trả canvas vector cỡ CSS, hay null khi không ở vector → người gọi rơi về pixel). Chỉ THÊM hàm, không đổi hàm nào ở trên.
       PhimVector.bang(s, huong, pha)   ô băng chuyền (VeVector.o('bang')) trên sàn, cạnh 14·s; huong 0 lên · 1 phải · 2 xuống · 3 trái; pha 0..5 (vạch chạy)
       PhimVector.nutBan(bat, s)        ô nút bắn (VeVector.o('nut-ban', { bat })) trên sàn; bat = true thêm quầng nóng (VeVector.HU.nong, luật warm())
       PhimVector.thungNang(s)          thùng nặng (VeVector.vat('thung-nang')) đầy ô 14·s, không có sàn dưới (đặt chồng lên ô sàn)
       PhimVector.bong(s)               quả bóng hơi (VeVector.vat('bong')) cạnh 6·s
       PhimVector.nong(s, now)          riêng quầng nóng + gợn nhiệt của một ô cạnh 14·s (đặt chồng lên robot / nút đang nóng) */
  function bang(s, huong, pha) {
    if (!bat()) return null; var c = 14 * s;
    return the(c, c, function (g) { dan(g, V.o('san', px(c), {}), 0, 0, c); dan(g, V.o('bang', px(c), { huong: huong | 0, pha: pha || 0 }), 0, 0, c); });
  }
  function nong(s, now) {
    if (!bat() || !V.HU || !V.HU.nong) return null; var c = 14 * s;
    return the(c, c, function (g) { g.save(); g.scale(c / 14, c / 14); V.HU.nong(g, 0, 0, now || 0); g.restore(); });
  }
  function nutBan(bat_, s) {
    if (!bat()) return null; var c = 14 * s;
    return the(c, c, function (g) {
      dan(g, V.o('san', px(c), {}), 0, 0, c); dan(g, V.o('nut-ban', px(c), bat_ ? { bat: true } : {}), 0, 0, c);
      if (bat_ && V.HU && V.HU.nong) { g.save(); g.scale(c / 14, c / 14); V.HU.nong(g, 0, 0, 0); g.restore(); }
    });
  }
  function thungNang(s) { if (!bat()) return null; var c = 14 * s; return the(c, c, function (g) { dan(g, V.vat('thung-nang', px(c), {}), 0, 0, c); }); }
  function bong(s) { if (!bat()) return null; var c = 6 * (s || 2); return the(c, c, function (g) { dan(g, V.vat('bong', px(c), {}), 0, 0, c); }); }
  root.PhimVector.bang = bang; root.PhimVector.nutBan = nutBan; root.PhimVector.thungNang = thungNang; root.PhimVector.bong = bong; root.PhimVector.nong = nong;

  /* ---------------------------------------------------------------- CỖ MÁY XUẤT XƯỞNG (29/10, phim gói 10 MỌI mùa; KE-HOACH-PHIM-GOI.md mục 3c). Chỉ THÊM hàm.
       PhimVector.xuatXuong(o)          khối tem của phim gói 10: con dấu chữ nhật o.tem ("XUẤT XƯỞNG") rơi xuống đóng, bảng tên cỗ máy o.ten, một hàng icon part
                                        o.part = [[tên icon VeIcon, màu pixel], …] (thường ba). Chữ người gọi lấy từ chu.js (khoá pg.tem.*), không viết cứng ở đây.
                                        Trả div .pg-xx rộng 180 (cao ~104; đặt bằng c.dat). o.t (giây, mặc định 1) = lúc tem chạm; tên hiện +0,3 s, part +0,5 s, cách 0,15 s.
                                        Khung dấu vẽ canvas (viền đôi đỏ, hai sao), chữ là DOM để dùng phông game; hoạt cảnh: lớp .pg-xx-* ở choi.css.
       PhimVector.nhaMay(w, h, chay)    nhà xưởng nhìn ngang (mái răng cưa, ống khói, cửa cuốn): chay = false im lìm (xám, cửa sổ tối), true sáng đèn */
  function khungTem(g, w, h) {
    var H = V.H;
    H.bo(g, 2, 2, w - 4, h - 4, 6); H.to(g, BM.vecVo); H.vien(g, BM.vecDo, 3);
    H.bo(g, 7, 7, w - 14, h - 14, 3); H.vien(g, BM.vecDo, 1.4);
    [14, w - 14].forEach(function (x) {                                                                                             // sao năm cánh cùng mực đỏ (dấu một màu)
      g.beginPath();
      for (var i = 0; i < 10; i++) { var r = i % 2 ? 2.4 : 5.6, a = -Math.PI / 2 + i * Math.PI / 5; g[i ? 'lineTo' : 'moveTo'](x + r * Math.cos(a), h / 2 + r * Math.sin(a)); }
      g.closePath(); H.to(g, BM.vecDo);
    });
  }
  function xuatXuong(o) {
    if (!bat() || !o) return null;
    var d = root.document, t = o.t === undefined ? 1 : o.t;
    function el(cls, chu) { var e = d.createElement('div'); e.className = cls; if (chu) e.textContent = chu; return e; }
    var khoi = el('pg-xx');
    var tem = el('pg-xx-tem'); tem.style.animationDelay = Math.max(0, t - 0.45) + 's';
    tem.appendChild(the(178, 42, function (g) { khungTem(g, 178, 42); }));
    tem.appendChild(el('pg-xx-chu', o.tem || ''));
    var ten = el('pg-xx-ten', o.ten || ''); ten.style.animationDelay = (t + 0.3) + 's';
    var hang = el('pg-xx-part');
    (o.part || []).forEach(function (p, i) {
      var v = el('pg-xx-o'); v.style.animationDelay = (t + 0.5 + i * 0.15) + 's';
      var hinh = ico(p[0], 2, p[1]); if (hinh) v.appendChild(hinh);
      hang.appendChild(v);
    });
    khoi.appendChild(tem); khoi.appendChild(ten); khoi.appendChild(hang);
    return khoi;
  }
  function nhaMay(w, h, chay) {
    if (!bat()) return null;
    w = w || 84; h = h || 56;
    return the(w, h, function (g) {
      var H = V.H, k = Math.min(w / 84, h / 56);
      g.save(); g.scale(k, k);
      H.bo(g, 60, 4, 10, 22, 1.5); H.to(g, chay ? BM.vecThepSang : BM.vecSatToi); H.vien(g, BM.vecVien, 2);                         // ống khói
      H.duong(g, 'M4 54 V24 L18 14 V24 L32 14 V24 L46 14 V24 L60 14 V24 L80 24 V54 Z');                                              // thân + mái răng cưa
      g.fillStyle = H.gradDoc(g, 0, 14, 0, 54, chay ? [[0, BM.vecThepSang], [1, BM.vecThep]] : [[0, BM.vecSatToi], [1, BM.vecThepToi]]); g.fill(); H.vien(g, BM.vecVien, 2.2);
      [10, 24, 52, 66].forEach(function (x) { H.bo(g, x, 30, 8, 8, 1); H.to(g, chay ? BM.vecVangSang : BM.vecHo); H.vien(g, BM.vecVien, 1.4); });      // cửa sổ
      H.bo(g, 33, 34, 16, 20, 1); H.to(g, chay ? BM.vecVang : BM.vecDe); H.vien(g, BM.vecVien, 1.8);                                  // cửa cuốn
      if (!chay) [38, 42, 46, 50].forEach(function (y) { H.duong(g, 'M35 ' + y + ' H47'); H.vien(g, BM.vecDeSang, 1); });
      g.restore();
    });
  }
  root.PhimVector.xuatXuong = xuatXuong; root.PhimVector.nhaMay = nhaMay;
})(typeof window !== 'undefined' ? window : globalThis);
