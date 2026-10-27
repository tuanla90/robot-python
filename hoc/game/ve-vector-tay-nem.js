var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ve-vector-tay-nem.js — MÁY NÉM vector (gói V3, mã 'nem' như part-nem.js): đế trắng ở mũi, trụ khớp, CẦN tím chĩa về phía trước, GÁO tròn ở đầu cần (vành trắng, lòng tối).
   Trạng thái s: ngam 1..3 (tầm aim(n): bấy nhiêu chấm cyan cạnh cần), dangNem (cần bật lên: gáo vươn xa hơn — san-ve.js dùng bk × 27,5 / 23,5 như bộ pixel),
   cam (có vật trong gáo: lòng gáo có viền sáng; VẬT do san-ve.js vẽ ở viTriRo theo VeRobot.hinhHoc().bk = tâm gáo).
   ro.y = tâm gáo (hệ của tay) → hinhHoc().bk; diemNeo (50, 80) như tay kẹp. */
(function (root) {
  var V = root.VeVector || (typeof module === 'object' && require('./ve-vector.js'));
  var RO = 96, RO_NEM = 102.5;                     // tâm gáo: nghỉ / đang ném (tỉ lệ ≈ 27,5 / 23,5 tính từ tâm thân của thân hai bánh)
  V.dangKy({ loai: 'tay', ma: 'nem', ten: 'Máy ném trước mũi', gan: 'tay', diemNeo: { x: 50, y: 80 }, ro: { y: RO }, ve: function (g, s, M, H) {
    s = s || {};
    var vg = typeof s.vung === 'number' ? Math.max(0, Math.min(1, s.vung)) : s.dangNem ? 1 : 0;      // gói V4: s.vung 0..1 = gáo vung dần (tween)
    var n = Math.max(1, Math.min(3, +s.ngam || 1)), y = RO + (RO_NEM - RO) * vg, r = 8 - 0.5 * vg, i;
    H.bo(g, 37, 76, 26, 10, 5); H.to(g, BM.vecKhop); H.vien(g, BM.vecVien, 2.5);
    H.duong(g, 'M50 84 V' + (y - r + 1)); H.vien(g, BM.vecVien, 8); H.duong(g, 'M50 84 V' + (y - r + 1)); H.vien(g, BM.vecTim, 4);
    H.tron(g, 50, 84, 4.5); H.to(g, BM.vecVo); H.vien(g, BM.vecVien, 2);
    H.tron(g, 50, y, r); g.fillStyle = H.gradVo(g, 50 - r, y - r, 2 * r, 2 * r); g.fill(); H.vien(g, BM.vecVien, 2.5);
    H.tron(g, 50, y, r - 3.2); H.to(g, BM.vecLoi); if (s.cam) H.vien(g, BM.vecDenSang, 1.5);
    for (i = 0; i < n; i++) { H.tron(g, 59, 88 + i * 4.5, 1.8); H.to(g, BM.vecDen); H.vien(g, BM.vecVien, 1); }
  } });
})(typeof window !== 'undefined' ? window : globalThis);
