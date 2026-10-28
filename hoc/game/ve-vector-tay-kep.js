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
  /* hai càng đối xứng quanh x = 50: d1 / d2 độ phình của hai điểm điều khiển, t khoảng từ tâm tới đầu càng, y đầu càng */
  function cang(g, d1, d2, t, yDau) {
    g.beginPath();
    [-1, 1].forEach(function (k) { g.moveTo(50 + k * 12, 84); g.bezierCurveTo(50 + k * d1, 90, 50 + k * d2, 98, 50 + k * t, yDau); });
  }
  V.dangKy({ loai: 'tay', ma: 'kep', hamGoc: ['arm_down',  'arm_up',  'grab',  'release'], ten: 'Tay kẹp trước mũi', gan: 'tay', diemNeo: { x: 50, y: 80 }, vatKep: { y: Y_VAT, canh: V.VAT_SAN / V.CO_THAN, ha: HA }, ve: function (g, s, M, H) {
    s = s || {};
    var mo = s.kep !== 'dong', om = !mo && !!s.cam, ha = s.tuThe === 'duoi', nk = V.nangCua(s.tuThe, s.nangK), yDau = (om ? Y_VAT + 2 : Y_VAT) + HA * (1 - nk);
    var k = typeof s.moK === 'number' && !om ? Math.max(0, Math.min(1, s.moK)) : null;       // gói V4: độ mở 0 (đóng) … 1 (mở) khi đang khép / mở dần
    var t = V._loiGia.kheCu ? 15 : V.coVatKep(nk) / V.CO_THAN / 2 + 1.5;                                             // gói V6b: nửa khe ôm vật ở cỡ hiện tại (thân vật / CO_THAN), càng không xuyên vật
    function ve2() { if (k !== null) cang(g, 14 + (MO + 5 - 14) * k, 8 + (MO + 5 - 8) * k, 1.5 + (MO - 1.5) * k, yDau); else if (mo) cang(g, MO + 5, MO + 5, MO, yDau); else if (om) cang(g, t + 3, t + 2, t, yDau); else cang(g, 14, 8, 1.5, yDau); }
    ve2(); H.vien(g, BM.vecVien, 9);
    ve2(); H.vien(g, BM.vecNgon, 5);                                                         // ngón tông bạc (gói V4): tách khỏi vật trắng trong kẹp
    H.bo(g, 34, 76, 32, 12, 6); H.to(g, BM.vecVo); H.vien(g, BM.vecVien, 3);
    H.tron(g, 50, 82, 3); H.to(g, ha ? BM.robotCam : BM.vecDen);
  } });
})(typeof window !== 'undefined' ? window : globalThis);
