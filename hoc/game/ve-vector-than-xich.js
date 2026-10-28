var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ve-vector-than-xich.js — THÂN BÁNH XÍCH vector (gói V3), cùng gia đình thân A (ve-vector-than-hai-banh.js): vỏ trắng bo góc lớn, đường ghép tím nhạt, kính dải ngang
   hai mắt (màu đội), ăng-ten chấm màu đội; hai dải xích dài ôm gần trọn hông (khác hai bánh con nhộng ngắn), mắt xích ngang chạy theo nhịp.
   Quay mặt XUỐNG, tâm (50, 56). Ổ: tay (50, 81) mép dưới vỏ; hongTrai (98, 56) / hongPhai (2, 56) ngoài hai dải xích; tren (70, 78) góc mũi trái; sau (36, 26) đuôi lệch trái ăng-ten.
   Trạng thái s: banh { trai, phai } + buoc (0 | 1) → mắt xích dịch nửa nấc (nhịp bánh xích); camera / camSang như thân A. */
(function (root) {
  var V = root.VeVector || (typeof module === 'object' && require('./ve-vector.js'));
  V.dangKy({ loai: 'than', ma: 'xich', hamGoc: ['left_move',  'right_move',  'left_back',  'right_back',  'wait'], ten: 'Thân bánh xích', oGan: { tay: { x: 50, y: 81 }, hongTrai: { x: 72, y: 47 }, hongPhai: { x: 28, y: 47 }, tren: { x: 70, y: 78 }, sau: { x: 36, y: 26 } }, oCam: { x: 64, y: 29 }, vo: { x: 22, y: 24, w: 56, h: 59 }, ve: function (g, s, M, H) {
    var quay = s && s.banh && (s.banh.trai || s.banh.phai), lech = typeof s.lan === 'number' ? s.lan * 7 : quay && s.buoc ? 3.5 : 0, i, y;       // s.lan (0..1, gói V4): mắt xích theo quãng đi
    /* hai dải xích: khung tối bo tròn hai đầu, bánh dẫn ở hai đầu, mắt xích ngang */
    [6, 74].forEach(function (x) {
      H.bo(g, x, 25, 20, 62, 10); H.to(g, BM.vecBanh); H.vien(g, BM.vecVien, 3);
      H.tron(g, x + 10, 34, 5); H.to(g, BM.vecBanhGach); H.tron(g, x + 10, 78, 5); H.to(g, BM.vecBanhGach);
    });
    g.beginPath();
    for (i = 0; i < 8; i++) { y = 29 + ((i * 7 + lech) % 56); g.moveTo(9, y); g.lineTo(23, y); g.moveTo(77, y); g.lineTo(91, y); }
    H.vien(g, BM.vecXichMat, 3);
    H.duong(g, 'M25 34 V78 M75 34 V78'); H.vien(g, BM.vecDen, 2.5);
    /* vỏ: vuông bo góc, nhỉnh dài hơn thân A, hai gờ ghép dọc */
    H.bo(g, 22, 24, 56, 59, 17); g.fillStyle = H.gradVo(g, 22, 24, 56, 59); g.fill(); H.vien(g, BM.vecVien, 3.5);
    H.duong(g, 'M34 31 C32 41 32 51 34 60 M66 31 C68 41 68 51 66 60 M50 24 v12 M38 78 H62'); H.vien(g, BM.vecVoGhep, 2.5);
    H.duong(g, 'M31 34 C34 29 39 28 45 28'); H.vien(g, BM.vecVo, 4);
    H.kinh(g, M, 28, 58, 44, 16, s);
    H.angTen(g, M, 50, 25, 13, 5);
  } });
})(typeof window !== 'undefined' ? window : globalThis);
