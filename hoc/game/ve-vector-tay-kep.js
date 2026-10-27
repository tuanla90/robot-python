var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ve-vector-tay-kep.js — TAY KẸP vector (hoc/hinh-mau/thu-vector.html): cụm giữa trắng bo tròn có chấm đèn, hai càng cong viền chàm lõi trắng.
   Hệ 100 × 100 của tay, hướng xuống (mũi xe ở dưới); diemNeo (50, 80) đặt trùng ổ tay của thân (thân hai bánh: (50, 80)).
   Trạng thái s (VeRobot.veGhep đổi từ trangThai của game): kep 'mo' | 'dong'; cam (đang cầm vật: càng ôm mép vật); tuThe 'tren' | 'duoi' (hạ: càng dài thêm HA, chấm đèn cam).
   Vật trong kẹp KHÔNG vẽ ở đây: san-ve.js vẽ ngay dưới ảnh robot theo VeVector.vatKep (vatKep: tâm vật y = 96, cạnh 28, hạ xa thêm HA) rồi hai càng đè lên mép vật.
   Thêm một tay: VeVector.dangKy({ loai: 'tay', ma, ten, gan: 'tay', diemNeo: {x, y}, vatKep: { y, canh, ha }, ve(g, s, M, H) }). */
(function (root) {
  var V = root.VeVector || (typeof module === 'object' && require('./ve-vector.js'));
  var HA = 3;                                        // tay hạ: càng dài thêm bấy nhiêu (chạm đất)
  /* hai càng đối xứng quanh x = 50: d1 / d2 độ phình của hai điểm điều khiển, t khoảng từ tâm tới đầu càng, y đầu càng */
  function cang(g, d1, d2, t, yDau) {
    g.beginPath();
    [-1, 1].forEach(function (k) { g.moveTo(50 + k * 12, 84); g.bezierCurveTo(50 + k * d1, 90, 50 + k * d2, 98, 50 + k * t, yDau); });
  }
  V.dangKy({ loai: 'tay', ma: 'kep', ten: 'Tay kẹp trước mũi', gan: 'tay', diemNeo: { x: 50, y: 80 }, vatKep: { y: 96, canh: 28, ha: HA }, ve: function (g, s, M, H) {
    s = s || {};
    var mo = s.kep !== 'dong', om = !mo && !!s.cam, ha = s.tuThe === 'duoi', yDau = (om ? 104 : 102) + (ha ? HA : 0);
    var k = typeof s.moK === 'number' && !om ? Math.max(0, Math.min(1, s.moK)) : null;       // gói V4: độ mở 0 (đóng) … 1 (mở) khi đang khép / mở dần
    function ve2() { if (k !== null) cang(g, 14 + 6 * k, 8 + 12 * k, 1.5 + 12.5 * k, yDau); else if (mo) cang(g, 20, 20, 14, yDau); else if (om) cang(g, 18, 17, 15, yDau); else cang(g, 14, 8, 1.5, yDau); }
    ve2(); H.vien(g, BM.vecVien, 9);
    ve2(); H.vien(g, BM.vecNgon, 5);                                                         // ngón tông bạc (gói V4): tách khỏi vật trắng trong kẹp
    H.bo(g, 34, 76, 32, 12, 6); H.to(g, BM.vecVo); H.vien(g, BM.vecVien, 3);
    H.tron(g, 50, 82, 3); H.to(g, ha ? BM.robotCam : BM.vecDen);
  } });
})(typeof window !== 'undefined' ? window : globalThis);
