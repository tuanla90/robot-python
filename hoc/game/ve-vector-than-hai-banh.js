var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ve-vector-than-hai-banh.js — THÂN HAI BÁNH vector (thân A của hoc/hinh-mau/thu-vector.html, user chốt 27/10): vỏ vuông bo góc lớn trắng toả sáng,
   đường ghép tím nhạt chạy dọc, kính dải ngang + hai mắt viên thuốc, hai bánh con nhộng viền cyan, ăng-ten có chấm. Quay mặt XUỐNG trong hệ 100 × 100,
   tâm thân (50, 56) = VeVector.TAM_THAN. Thân A là CHUẨN "gia đình" cho mọi thân (gói V3: xích, nhện, omni, drone dùng chung H.kinh + H.angTen).
   Ổ gắn (oGan, hệ của thân; mặt quay xuống nên bên TRÁI xe là phía x LỚN):
     tay (50, 80)       mép dưới vỏ: tay nhô ra trước mũi;
     hongTrai (74, 46)  hongPhai (26, 46)  trên VỎ sát mép hông, trên kính (gói V4: dính vỏ, không treo ngoài bánh; cảm biến khoảng cách / màu / cần gạt);
     oCam (64, 28)      camera (gói V4): khối ống kính ở đuôi, lệch trái ăng-ten (nòng sau súng hơi ở bên phải), nhìn về phía trước; vo: hộp vỏ (máy kiểm cảm biến dính vỏ);
     tren (71, 76)      góc mũi bên trái (cảm biến hồng ngoại; camera không có hình riêng: là hai mắt trên kính);
     sau (36, 25)       đuôi, lệch trái cột ăng-ten (nòng sau của súng hơi).
   Màu đội M = { chinh, toi } (VeVector.mauDoi): kính (gradient toi → chinh), hai mắt (viền chinh), chấm ăng-ten (chinh) — đúng ba chỗ.
   Trạng thái s: banh { trai, phai } (bánh đang quay) + buoc (0 | 1, nhịp) → gạch bánh dịch một nấc; camera / camSang: hai mắt là ống kính / đang đọc (sáng rực).
   Thêm một thân: VeVector.dangKy({ loai: 'than', ma, ten, oGan: { tay: {x, y}, … }, ve(g, s, M, H) }) — vẽ quay xuống, tâm ở TAM_THAN. */
(function (root) {
  var V = root.VeVector || (typeof module === 'object' && require('./ve-vector.js'));
  V.dangKy({ loai: 'than', ma: 'hai-banh', hamGoc: ['left_move',  'right_move',  'left_back',  'right_back',  'wait'], ten: 'Thân hai bánh (A)', oGan: { tay: { x: 50, y: 80 }, hongTrai: { x: 74, y: 46 }, hongPhai: { x: 26, y: 46 }, tren: { x: 71, y: 76 }, sau: { x: 36, y: 25 } }, oCam: { x: 64, y: 28 }, vo: { x: 20, y: 23, w: 60, h: 58 }, ve: function (g, s, M, H) {
    var quay = s && s.banh && (s.banh.trai || s.banh.phai), lech = typeof s.lan === 'number' ? s.lan * 8 : quay && s.buoc ? 4 : 0, i, y;       // s.lan (0..1, gói V4): pha bánh theo quãng đi
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
    /* kính dải ngang + hai mắt viên thuốc (màu đội), ăng-ten có chấm màu đội */
    H.kinh(g, M, 27, 57, 46, 17, s);
    H.angTen(g, M, 50, 24, 12, 5);
  } });
})(typeof window !== 'undefined' ? window : globalThis);
