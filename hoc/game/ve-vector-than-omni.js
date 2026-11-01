var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ve-vector-than-omni.js — THÂN OMNI vector (gói V3), cùng gia đình thân A: vỏ trắng vuông bo góc chuẩn R1, đường ghép tím nhạt, kính + hai mắt màu đội, ăng-ten chấm màu đội;
   bốn bánh omni / mecanum ở bốn góc có cổ trục motor, khung vành bạc và ba con lăn cao su hình tang trống xếp chéo kèm vòng đệm trắng ở hai đầu — chạy được sang ngang (slide_left / slide_right).
   Quay mặt XUỐNG, tâm (50, 56). Ổ: tay (50, 81); hongTrai (71, 47) / hongPhai (29, 47) trên vỏ; tren (71, 78) góc mũi trái; sau (37, 27) đuôi.
   Trạng thái s: lan (0..1) hoặc banh { trai, phai } + buoc (0 | 1) → các con lăn chéo dịch chuyển theo nhịp bánh quay; camera / camSang như thân A. */
(function (root) {
  var V = root.VeVector || (typeof module === 'object' && require('./ve-vector.js'));
  function banhOmni(g, H, cx, cy, goc, dirTruc, chieuCheo, lan) {
    g.save();
    g.translate(cx, cy);
    g.rotate(goc);
    /* 1. Cổ trục gá motor kim loại nối vào góc thân + đai trục cyan */
    var ax = dirTruc > 0 ? 3.0 : -11.5, fx = dirTruc > 0 ? 4.8 : -7.6;
    H.bo(g, ax, -4.4, 8.5, 8.8, 1.8); H.to(g, BM.vecThep); H.vien(g, BM.vecVien, 2.2);
    H.bo(g, fx, -6.0, 2.8, 12.0, 1.0); H.to(g, BM.vecDen); H.vien(g, BM.vecVien, 1.6);
    /* 2. Khung vành bánh kim loại bạc sáng (giữ các trục con lăn) */
    H.bo(g, -6.2, -13.0, 12.4, 26.0, 4.5); H.to(g, BM.vecDinh); H.vien(g, BM.vecVien, 2.6);
    H.bo(g, -3.6, -11.4, 7.2, 22.8, 2.2); H.to(g, BM.vecThepToi);
    /* 3. Ba con lăn cao su hình tang trống xếp chéo + vòng đệm trắng sáng ở 2 đầu */
    var lech = ((lan % 1) - 0.5) * 7.4;
    [-1, 0, 1].forEach(function (i) {
      var ry = i * 7.4 + lech;
      if (ry < -9.4 || ry > 9.4) return;
      g.save();
      g.translate(0, ry);
      g.rotate(chieuCheo * 0.48);
      H.bo(g, -6.8, -3.4, 13.6, 6.8, 3.1); H.to(g, BM.vecVo); H.vien(g, BM.vecVien, 2.2);
      H.bo(g, -4.4, -2.7, 8.8, 5.4, 1.4); H.to(g, BM.vecBanh);
      H.duong(g, 'M-4.3 -2.5 V2.5 M4.3 -2.5 V2.5'); H.vien(g, BM.vecVien, 1.2);
      H.duong(g, 'M-2.4 -0.8 H2.4'); H.vien(g, BM.vecSat, 1.5);
      g.restore();
    });
    /* 4. Hai đầu mấu kim loại bạc ở 2 cực bánh xe */
    [-12.0, 12.0].forEach(function (ry) {
      H.bo(g, -3.4, ry - 1.0, 6.8, 2.0, 0.9); H.to(g, BM.vecSat); H.vien(g, BM.vecVien, 1.3);
    });
    g.restore();
  }
  V.dangKy({ loai: 'than', ma: 'omni', hamGoc: ['left_move',  'right_move',  'left_back',  'right_back',  'slide_left',  'slide_right',  'wait'], ten: 'Thân omni', oGan: { tay: { x: 50, y: 81 }, hongTrai: { x: 71, y: 47 }, hongPhai: { x: 29, y: 47 }, tren: { x: 71, y: 78 }, sau: { x: 37, y: 27 } }, oCam: { x: 63, y: 29 }, vo: { x: 23, y: 24, w: 54, h: 59 }, ve: function (g, s, M, H) {
    var lan = s && typeof s.lan === 'number' ? s.lan : (s && s.banh && (s.banh.trai || s.banh.phai) && s.buoc ? 0.5 : 0);
    banhOmni(g, H, 14.5, 36.5, 0, 1, 1, lan);
    banhOmni(g, H, 85.5, 36.5, 0, -1, -1, lan);
    banhOmni(g, H, 14.5, 70.5, 0, 1, -1, lan);
    banhOmni(g, H, 85.5, 70.5, 0, -1, 1, lan);
    H.bo(g, 23, 26, 54, 54, 18); g.fillStyle = H.gradVo(g, 23, 26, 54, 54); g.fill(); H.vien(g, BM.vecVien, 3.5);
    H.duong(g, 'M35 34 C33 44 33 53 35 62 M65 34 C67 44 67 53 65 62 M50 26 v11'); H.vien(g, BM.vecVoGhep, 2.5);
    H.duong(g, 'M31 36 C34 31 39 30 45 30'); H.vien(g, BM.vecVo, 4);
    H.kinh(g, M, 29, 57, 42, 15.5, s);
    H.angTen(g, M, 50, 27, 13, 5);
  } });

  /* THÂN BÁNH GAI BÁM ĐÁ 'gai' (mùa 8 Hang động đá vôi & mùa 9 Về CLB): 4 bánh lốp địa hình 3D có cổ trục motor, vành thép và đinh gai vàng cảnh báo
     (khi s.thu = true hoặc s.gai === false: thu đinh gai vào trong vành lốp để trượt nhanh trên dải đá vôi ướt 'I'). */
  V.dangKy({ loai: 'than', ma: 'gai', hamGoc: ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'retract_spikes', 'extend_spikes'], ten: 'Thân bánh gai bám đá', oGan: { tay: { x: 50, y: 81 }, hongTrai: { x: 71, y: 47 }, hongPhai: { x: 29, y: 47 }, tren: { x: 71, y: 78 }, sau: { x: 37, y: 27 } }, oCam: { x: 63, y: 29 }, vo: { x: 23, y: 24, w: 54, h: 59 }, ve: function (g, s, M, H) {
    s = s || {};
    var thu = !!(s.thu || s.gai === false);
    var lan = typeof s.lan === 'number' ? s.lan : (s.banh && (s.banh.trai || s.banh.phai) && s.buoc ? 0.5 : 0);
    var lech = ((lan % 1) - 0.5) * 3.6;
    [[14.5, 36.5], [85.5, 36.5], [14.5, 70.5], [85.5, 70.5]].forEach(function (b) {
      var bx = b[0], by = b[1], dir = bx < 50 ? -1 : 1;
      var ax = dir < 0 ? bx + 3.0 : bx - 11.5, fx = dir < 0 ? bx + 4.8 : bx - 7.6;
      H.bo(g, ax, by - 4.4, 8.5, 8.8, 1.8); H.to(g, BM.vecThep); H.vien(g, BM.vecVien, 2.2);
      H.bo(g, fx, by - 6.0, 2.8, 12.0, 1.0); H.to(g, BM.vecDen); H.vien(g, BM.vecVien, 1.6);
      if (!thu) {
        [-8.5, 0, 8.5].forEach(function (dy0) {
          var dy = dy0 + lech * 0.35;
          g.beginPath();
          g.moveTo(bx + dir * 4.5, by + dy - 3.6);
          g.lineTo(bx + dir * 13.0, by + dy);
          g.lineTo(bx + dir * 4.5, by + dy + 3.6);
          g.closePath();
          H.to(g, BM.vecCanhBao); H.vien(g, BM.vecVien, 2.1);
        });
      }
      H.bo(g, bx - 6.6, by - 13.5, 13.2, 27, 4.8);
      H.to(g, thu ? BM.vecDen : BM.vecBanh);
      H.vien(g, BM.vecVien, 2.8);
      [-7.5, 0, 7.5].forEach(function (dy0) {
        var dy = dy0 + lech * 0.45;
        H.bo(g, bx - 4.8, by + dy - 2, 9.6, 4, 1.4);
        H.to(g, thu ? BM.vecDenSang : BM.vecBanhGach);
        H.vien(g, BM.vecVien, 1.2);
      });
    });
    H.bo(g, 23, 26, 54, 54, 18); g.fillStyle = H.gradVo(g, 23, 26, 54, 54); g.fill(); H.vien(g, BM.vecVien, 3.5);
    H.duong(g, 'M35 34 C33 44 33 53 35 62 M65 34 C67 44 67 53 65 62 M50 26 v11'); H.vien(g, BM.vecVoGhep, 2.5);
    H.duong(g, 'M31 36 C34 31 39 30 45 30'); H.vien(g, BM.vecVo, 4);
    H.kinh(g, M, 29, 57, 42, 15.5, s);
    H.angTen(g, M, 50, 27, 13, 5);
  } });
})(typeof window !== 'undefined' ? window : globalThis);
