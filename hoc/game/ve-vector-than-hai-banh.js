var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ve-vector-than-hai-banh.js — THÂN HAI BÁNH vector (thân A của hoc/hinh-mau/thu-vector.html, user chốt 27/10): vỏ vuông bo góc lớn trắng toả sáng,
   đường ghép tím nhạt chạy dọc, kính dải ngang + hai mắt viên thuốc, hai bánh con nhộng viền cyan, ăng-ten có chấm. Quay mặt XUỐNG trong hệ 100 × 100,
   tâm thân (50, 56) = VeVector.TAM_THAN; ổ gắn tay ở (50, 80) (mép dưới vỏ: tay kẹp nhô ra trước mũi).
   Màu đội M = { chinh, toi } (VeVector.mauDoi): kính (gradient toi → chinh), hai mắt (chinh pha sáng: viền mắt), chấm ăng-ten (chinh).
   Trạng thái s: banh { trai, phai } (bánh đang quay) + buoc (0 | 1, nhịp) → gạch bánh dịch một nấc; camera / camSang: chưa dùng (V3).
   Thêm một thân: VeVector.dangKy({ loai: 'than', ma, ten, oGan: { tay: {x, y} }, ve(g, s, M, H) }) — vẽ quay xuống, tâm ở TAM_THAN. */
(function (root) {
  var V = root.VeVector || (typeof module === 'object' && require('./ve-vector.js'));
  V.dangKy({ loai: 'than', ma: 'hai-banh', ten: 'Thân hai bánh (A)', oGan: { tay: { x: 50, y: 80 } }, ve: function (g, s, M, H) {
    var quay = s && s.banh && (s.banh.trai || s.banh.phai), lech = quay && s.buoc ? 4 : 0, i, y;
    /* hai bánh con nhộng */
    [10, 74].forEach(function (x) { H.bo(g, x, 36, 16, 44, 8); H.to(g, BM.vecBanh); H.vien(g, BM.vecVien, 3); });
    g.beginPath();
    for (i = 0; i < 4; i++) { y = 46 + ((i * 8 + lech) % 32); g.moveTo(14, y); g.lineTo(22, y); g.moveTo(78, y); g.lineTo(86, y); }
    H.vien(g, BM.vecBanhGach, 3);
    H.duong(g, 'M24 42v32M76 42v32'); H.vien(g, BM.vecDen, 3);
    /* vỏ A: vuông bo góc lớn */
    H.bo(g, 20, 23, 60, 58, 20); g.fillStyle = H.gradVo(g, 20, 23, 60, 58); g.fill(); H.vien(g, BM.vecVien, 3.5);
    H.duong(g, 'M33 31 C31 41 31 51 33 60 M67 31 C69 41 69 51 67 60 M50 23 v12'); H.vien(g, BM.vecVoGhep, 2.5);
    H.duong(g, 'M30 33 C33 28 39 27 46 27'); H.vien(g, BM.vecVo, 4);
    /* kính dải ngang + hai mắt viên thuốc (màu đội) */
    H.bo(g, 27, 57, 46, 17, 8.5); g.fillStyle = H.gradDoc(g, 0, 57, 0, 74, [[0, M.toi], [1, M.chinh]]); g.fill(); H.vien(g, BM.vecVien, 2.5);
    [37, 56].forEach(function (x) { H.bo(g, x, 60.5, 7, 10, 3.5); H.to(g, BM.vecMat); H.vien(g, M.chinh, 1); });
    /* ăng-ten: cột bạc + chấm màu đội */
    H.duong(g, 'M50 24 v-9'); H.vien(g, BM.vecBacToi, 3);
    H.tron(g, 50, 12, 5); H.to(g, M.chinh); H.vien(g, BM.vecVien, 2);
  } });
})(typeof window !== 'undefined' ? window : globalThis);
