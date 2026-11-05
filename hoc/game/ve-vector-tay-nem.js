var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ve-vector-tay-nem.js — MÁY NÉM vector (gói V3, mã 'nem' như part-nem.js): đế trắng ở mũi, trụ khớp, CẦN tím chĩa về phía trước, GÁO tròn ở đầu cần (vành trắng, lòng tối).
   Trạng thái s: ngam 1..3 (tầm aim(n): bấy nhiêu chấm cyan cạnh cần), dangNem (cần bật lên: gáo vươn xa hơn — san-ve.js dùng bk × 27,5 / 23,5 như bộ pixel),
   cam (có vật trong gáo: lòng gáo có viền sáng; VẬT do san-ve.js vẽ ở viTriRo theo VeRobot.hinhHoc().bk = tâm gáo).
   ro.y = tâm gáo (hệ của tay) → hinhHoc().bk; diemNeo (50, 80) như tay kẹp. */
(function (root) {
  var V = root.VeVector || (typeof module === 'object' && require('./ve-vector.js'));
  var RO = 96, RO_NEM = 102.5;                     // tâm gáo: nghỉ / đang ném (tỉ lệ ≈ 27,5 / 23,5 tính từ tâm thân của thân hai bánh)
  V.dangKy({ loai: 'tay', ma: 'nem', hamGoc: ['aim',  'throw',  'load'], ten: 'Máy ném trước mũi', gan: 'tay', diemNeo: { x: 50, y: 80 }, ro: { y: RO }, ve: function (g, s, M, H) {
    s = s || {};
    var vg = typeof s.vung === 'number' ? Math.max(0, Math.min(1, s.vung)) : s.dangNem ? 1 : 0;      // gói V4: s.vung 0..1 = gáo vung dần (tween)
    var n = Math.max(1, Math.min(3, +s.ngam || 1)), y = RO + (RO_NEM - RO) * vg, r = 8.2 - 0.4 * vg, yCo = y - r + 1.5, i;
    /* cụm thước ngắm 3 vạch LED gắn bên hông phải bệ phóng (rõ mức 1..3 thay vì chấm rời) */
    H.bo(g, 59.5, 80.5, 9, 14.5, 2.8); H.to(g, BM.vecDe); H.vien(g, BM.vecVien, 2);
    for (i = 0; i < 3; i++) {
      H.bo(g, 61.5, 82.6 + i * 3.8, 5, 2.3, 1);
      H.to(g, i < n ? (vg > 0.3 ? BM.vecDenSang : BM.vecDen) : BM.vecDeSang);
      if (i < n) H.vien(g, BM.vecVien, 0.8);
    }
    /* đế máy bắn bọc thép + hai gối đỡ cơ khí */
    H.bo(g, 35, 75.5, 30, 10, 5); H.to(g, BM.vecKhop); H.vien(g, BM.vecVien, 2.5);
    [37.5, 57.5].forEach(function (x) { H.bo(g, x, 77.8, 5, 6.8, 1.6); H.to(g, BM.vecThep); H.vien(g, BM.vecVien, 1.6); });
    /* thanh dẫn hướng đôi + cần phóng trung tâm */
    H.duong(g, 'M46.2 83.5 V' + yCo + ' M53.8 83.5 V' + yCo); H.vien(g, BM.vecVien, 3.8);
    H.duong(g, 'M46.2 83.5 V' + yCo + ' M53.8 83.5 V' + yCo); H.vien(g, BM.vecThepSang, 1.6);
    H.duong(g, 'M50 83.5 V' + yCo); H.vien(g, BM.vecVien, 6.8);
    H.duong(g, 'M50 83.5 V' + yCo); H.vien(g, BM.vecTim, 3.4);
    /* trống lò xo xoắn ở khớp bật */
    H.tron(g, 50, 83.5, 4.8); H.to(g, BM.vecVo); H.vien(g, BM.vecVien, 2.1);
    H.tron(g, 50, 83.5, 2.2); H.to(g, vg > 0.1 ? BM.vecVang : s.cam ? BM.vecDen : BM.vecTim);
    /* sóng xung lực bật cần khi đang phóng (vg > 0) */
    if (vg > 0.05) {
      H.duong(g, 'M39.5 ' + (y - 2.5) + ' Q50 ' + (y - r - 3.5) + ' 60.5 ' + (y - 2.5));
      H.vien(g, H.rgba(BM.tiaXanhLoRgb, 0.75 * vg), 2);
    }
    /* gáo ôm vật 3D + lòng gáo sâu + 3 vấu giữ quanh vành */
    H.tron(g, 50, y, r); g.fillStyle = H.gradVo(g, 50 - r, y - r, 2 * r, 2 * r); g.fill(); H.vien(g, BM.vecVien, 2.5);
    H.tron(g, 50, y, r - 2.8); H.to(g, BM.vecLoi);
    if (s.cam) {
      H.vien(g, BM.vecDen, 1.6);
      H.tron(g, 50, y, r - 4.8); H.vien(g, BM.vecDenSang, 1.2);
    } else {
      H.tron(g, 50, y, r - 4.8); H.vien(g, BM.vecDeSang, 1.1);
    }
    [-1, 1].forEach(function ( ch ) {
      H.bo(g, 50 + ch * (r - 1.1) - 1.5, y - 2.2, 3, 4.4, 1.2); H.to(g, BM.vecThepSang); H.vien(g, BM.vecVien, 1.5);
    });
    H.bo(g, 47.6, y + r - 2.2, 4.8, 2.8, 1.1); H.to(g, BM.vecThepSang); H.vien(g, BM.vecVien, 1.5);
  } });
})(typeof window !== 'undefined' ? window : globalThis);
