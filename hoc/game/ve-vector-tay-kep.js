var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ve-vector-tay-kep.js — TAY KẸP vector (hoc/hinh-mau/thu-vector.html): cụm giữa trắng bo tròn có chấm đèn, hai càng cong viền chàm lõi trắng.
   Hệ 100 × 100 của tay, hướng xuống (mũi xe ở dưới); diemNeo (50, 80) đặt trùng ổ tay của thân (thân hai bánh: (50, 80)).
   Trạng thái s (VeRobot.veGhep đổi từ trangThai của game): kep 'mo' | 'dong'; cam (đang cầm vật: càng ôm mép vật); tuThe 'tren' | 'duoi' (hạ: càng dài thêm HA, chấm đèn cam).
   Vật trong kẹp KHÔNG vẽ ở đây: san-ve.js vẽ ngay dưới ảnh robot theo VeVector.vatKep (vatKep: tâm vật y = Y_VAT, hạ xa thêm HA) rồi hai càng đè lên mép vật.
   Gói V6b (user 28/10 "Nâng lên to ra"): vật trong kẹp cỡ VeVector.coVatKep(k) (hạ = vật nằm sàn 57% ô, nâng 1,2 lần), k = s.nangK (hoạt cảnh nâng / hạ mượt) hay theo
   tuThe; hai càng ÔM mép vật ở cỡ đó (khe = cạnh thân vật / CO_THAN + 2), càng mở rộng hơn vật nằm sàn để đón vật; đầu càng ở ngang tâm vật.
   Thêm một tay: VeVector.dangKy({ loai: 'tay', ma, ten, gan: 'tay', diemNeo: {x, y}, vatKep: { y, canh, ha }, ve(g, s, M, H) }). */
(function (root) {
  var V = root.VeVector || (typeof module === 'object' && require('./ve-vector.js'));
  var HA = 3;                                        // tay hạ: càng dài thêm bấy nhiêu (chạm đất)
  var Y_VAT = 102;                                   // tâm vật trong kẹp (hệ của tay, tay nâng): trước mũi xe ~0,4 ô, vật to chờm sang ô trước mặt (gói V6b)
  var MO = V.VAT_SAN / V.CO_THAN / 2 + 4;            // nửa khe kẹp khi MỞ: rộng hơn vật nằm sàn một chút để đón vật
  /* hai càng đối xứng quanh x = ox (mặc định 50): gốc càng (ox ± 12, oy) (mặc định oy = 84), d1 / d2 độ phình của hai điểm điều khiển (ở oy + 6, oy + 14),
     t khoảng từ trục tới đầu càng, y đầu càng. Gói V8b: tay xoay vẽ đúng hai càng này (ox = 0, oy = đoạn trượt) trong hệ cánh tay đã xoay quanh khớp. */
  function cang(g, d1, d2, t, yDau, ox, oy) {
    ox = ox === undefined ? 50 : ox; oy = oy === undefined ? 84 : oy;
    g.beginPath();
    [-1, 1].forEach(function (k) { g.moveTo(ox + k * 12, oy); g.bezierCurveTo(ox + k * d1, oy + 6, ox + k * d2, oy + 14, ox + k * t, yDau); });
  }
  /* cụm giữa trắng bo tròn 32 × 12, tâm ngang x, mép trên y (tay kẹp: (50, 76)) */
  function cum(g, H, x, y) { H.bo(g, x - 16, y, 32, 12, 6); H.to(g, BM.vecVo); H.vien(g, BM.vecVien, 3); }
  /* đèn báo tư thế (chung tay kẹp / tay xoay, gói V8b): nâng = đèn cyan, hạ = cam */
  function mauDen(ha) { return ha ? BM.robotCam : BM.vecDen; }
  V.dangKy({ loai: 'tay', ma: 'kep', hamGoc: ['arm_down',  'arm_up',  'grab',  'release'], ten: 'Tay kẹp trước mũi', gan: 'tay', diemNeo: { x: 50, y: 80 }, vatKep: { y: Y_VAT, canh: V.VAT_SAN / V.CO_THAN, ha: HA },
    dungChung: { cang: cang, cum: cum, mauDen: mauDen, MO: MO, HA: HA },   // gói V8b: tay xoay (ve-vector-tay-xoay.js) vẽ bằng đúng các hàm này, chỉ thêm khớp tròn
    ve: function (g, s, M, H) {
    s = s || {};
    var mo = s.kep !== 'dong', om = !mo && !!s.cam, ha = s.tuThe === 'duoi', nk = V.nangCua(s.tuThe, s.nangK), yDau = (om ? Y_VAT + 2 : Y_VAT) + HA * (1 - nk);
    var k = typeof s.moK === 'number' && !om ? Math.max(0, Math.min(1, s.moK)) : null;       // gói V4: độ mở 0 (đóng) … 1 (mở) khi đang khép / mở dần
    var t = V._loiGia.kheCu ? 15 : V.coVatKep(nk) / V.CO_THAN / 2 + 1.5;                                             // gói V6b: nửa khe ôm vật ở cỡ hiện tại (thân vật / CO_THAN), càng không xuyên vật
    function ve2() { if (k !== null) cang(g, 14 + (MO + 5 - 14) * k, 8 + (MO + 5 - 8) * k, 1.5 + (MO - 1.5) * k, yDau); else if (mo) cang(g, MO + 5, MO + 5, MO, yDau); else if (om) cang(g, t + 3, t + 2, t, yDau); else cang(g, 14, 8, 1.5, yDau); }
    ve2(); H.vien(g, BM.vecVien, 9);
    ve2(); H.vien(g, BM.vecNgon, 5);                                                         // ngón tông bạc (gói V4): tách khỏi vật trắng trong kẹp
    cum(g, H, 50, 76);
    H.tron(g, 50, 82, 3); H.to(g, mauDen(ha));
  } });
})(typeof window !== 'undefined' ? window : globalThis);
