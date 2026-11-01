var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ve-vector-than-xich.js — THÂN BÁNH XÍCH vector (gói V3), cùng gia đình thân A (ve-vector-than-hai-banh.js): vỏ trắng bo góc lớn, đường ghép tím nhạt, kính dải ngang
   hai mắt (màu đội), ăng-ten chấm màu đội; hai dải xích dài ôm gần trọn hông (khác hai bánh con nhộng ngắn), mắt xích ngang chạy theo nhịp.
   Quay mặt XUỐNG, tâm (50, 56). Ổ: tay (50, 81) mép dưới vỏ; hongTrai (98, 56) / hongPhai (2, 56) ngoài hai dải xích; tren (70, 78) góc mũi trái; sau (36, 26) đuôi lệch trái ăng-ten.
   Trạng thái s: banh { trai, phai } + buoc (0 | 1) → mắt xích dịch nửa nấc (nhịp bánh xích); camera / camSang như thân A. */
(function (root) {
  var V = root.VeVector || (typeof module === 'object' && require('./ve-vector.js'));
  V.dangKy({ loai: 'than', ma: 'xich', hamGoc: ['left_move',  'right_move',  'left_back',  'right_back',  'wait'], ten: 'Thân bánh xích', oGan: { tay: { x: 50, y: 81 }, hongTrai: { x: 72, y: 47 }, hongPhai: { x: 28, y: 47 }, tren: { x: 70, y: 78 }, sau: { x: 36, y: 26 } }, oCam: { x: 64, y: 29 }, vo: { x: 22, y: 24, w: 56, h: 59 }, ve: function (g, s, M, H) {
    var b = (s && s.banh) || {}, quay = !!(b.trai || b.phai), pha = typeof (s && s.lan) === 'number' ? s.lan : (quay && s && s.buoc ? 0.5 : 0);
    var i, t, y, hDot, n = 7;
    /* gầm trục nối thân với hai cụm xích */
    [35, 65].forEach(function (yT) {
      H.bo(g, 19, yT, 62, 6, 2); H.to(g, BM.vecThepToi); H.vien(g, BM.vecVien, 2);
    });
    /* hai dải xích nhìn từ trên xuống: bản xích phân đốt 3D uốn cong theo luồng lăn ở hai đầu và rãnh xích giữa */
    [6, 74].forEach(function (x) {
      var trai = x > 50, xNgoai = !trai ? x - 1.2 : x + 18.2;
      /* gờ răng cưa mép ngoài vừa phải tạo dáng dải xích thực tế */
      for (i = 0; i < n; i++) {
        t = ((i + pha) % n) / n;
        y = 54 - Math.cos(t * Math.PI) * 24.5;
        hDot = Math.max(2, Math.sin(t * Math.PI) * 4.8);
        H.bo(g, xNgoai, y - hDot / 2, 3, hDot, 1); H.to(g, BM.vecBanh); H.vien(g, BM.vecVien, 1.5);
      }
      /* khung bao dải xích */
      H.bo(g, x, 25, 20, 58, 7.5); H.to(g, BM.vecBanh); H.vien(g, BM.vecVien, 3);
      /* lòng rãnh xích có clip để các bản xích cuộn mượt ở hai đầu */
      g.save();
      H.bo(g, x + 2, 26.8, 16, 54.4, 5.8); H.to(g, BM.vecDe);
      g.clip();
      /* hai đường ray dẫn hướng dọc dưới lòng xích */
      H.duong(g, 'M' + (x + 6.5) + ' 27 V81 M' + (x + 13.5) + ' 27 V81'); H.vien(g, BM.vecThepToi, 1.6);
      /* các đốt bản xích 3D (foreshortened ở hai đầu cong 27..81) */
      for (i = 0; i < n; i++) {
        t = ((i + pha) % n) / n;
        y = 54 - Math.cos(t * Math.PI) * 25.5;
        hDot = Math.max(2.4, Math.sin(t * Math.PI) * 5.8);
        H.bo(g, x + 2.6, y - hDot / 2, 14.8, hDot, 1.5);
        H.to(g, BM.vecXichMat); H.vien(g, BM.vecVien, 1.4);
        if (hDot > 3.4) {
          H.duong(g, 'M' + (x + 4) + ' ' + (y - hDot * 0.22) + ' H' + (x + 16));
          H.vien(g, BM.vecThepSang, 1);
          /* mắt xích khóa tâm */
          H.bo(g, x + 8.3, y - hDot * 0.35, 3.4, hDot * 0.7, 0.8);
          H.to(g, BM.vecDe); H.vien(g, BM.vecVien, 1);
        }
      }
      g.restore();
      H.bo(g, x + 2, 26.8, 16, 54.4, 5.8); H.vien(g, BM.vecVien, 1.8);
      /* NÂNG CẤP XÍCH ĐẨY THÙNG (xichDay: true — Phương án A):
         Ốp giáp bảo vệ dọc sườn ngoài bánh xích + Càng đệm đẩy chữ U vàng-thép ôm sát đầu trước (+y) của 2 bánh xích,
         đẩy thùng trực tiếp bằng 2 đầu bánh xích, chừa khoang giữa thông thoáng cho mọi loại tay công cụ */
      if (s && s.xichDay) {
        var xGu = !trai ? x - 2.2 : x + 19.2;
        H.bo(g, xGu, 33, 3, 45, 1.4); H.to(g, BM.vecThep); H.vien(g, BM.vecVien, 1.6);
        H.tron(g, xGu + 1.5, 39, 1.1); H.to(g, BM.vecDinh);
        H.tron(g, xGu + 1.5, 71, 1.1); H.to(g, BM.vecDinh);
        H.duong(g,
          'M' + (x - 1.2) + ' 76.5 ' +
          'V82.2 C' + (x - 1.2) + ' 85.2 ' + (x + 2.2) + ' 86.5 ' + (x + 6) + ' 86.5 ' +
          'H' + (x + 14) + ' C' + (x + 17.8) + ' 86.5 ' + (x + 21.2) + ' 85.2 ' + (x + 21.2) + ' 82.2 ' +
          'V76.5 H' + (x + 17.5) + ' V81.2 H' + (x + 2.5) + ' V76.5 Z'
        );
        H.to(g, BM.vecVang); H.vien(g, BM.vecVien, 2.1);
        H.duong(g, 'M' + (x + 3) + ' 83.2 H' + (x + 17)); H.vien(g, BM.vecVangSang, 1.3);
        H.bo(g, x + 3.5, 84.2, 4.2, 2.4, 0.8); H.to(g, BM.vecThepToi); H.vien(g, BM.vecVien, 1.2);
        H.bo(g, x + 12.3, 84.2, 4.2, 2.4, 0.8); H.to(g, BM.vecThepToi); H.vien(g, BM.vecVien, 1.2);
      }
      /* ốp chắn bùn mép trong gắn đèn cyan chuẩn R1 */
      var xOp = !trai ? 22.5 : 74.5;
      H.bo(g, xOp, 34, 3, 40, 1.5); H.to(g, BM.vecDen); H.vien(g, BM.vecVien, 1.2);
    });
    /* vỏ chuẩn R1: vuông bo góc cân đối (56 × 54, r = 18.5), đường ghép tím nhạt + vệt sáng trắng */
    H.bo(g, 22, 25, 56, 54, 18.5); g.fillStyle = H.gradVo(g, 22, 25, 56, 54); g.fill(); H.vien(g, BM.vecVien, 3.5);
    H.duong(g, 'M34 32 C32 42 32 52 34 61 M66 32 C68 42 68 52 66 61 M50 25 v12'); H.vien(g, BM.vecVoGhep, 2.5);
    H.duong(g, 'M31 34 C34 29 39 28 46 28'); H.vien(g, BM.vecVo, 4);
    H.kinh(g, M, 28, 57, 44, 16.5, s);
    H.angTen(g, M, 50, 26, 13, 5);
  } });
})(typeof window !== 'undefined' ? window : globalThis);
