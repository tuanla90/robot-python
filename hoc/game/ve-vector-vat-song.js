var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ve-vector-vat-song.js — VẬT NỔI BẾN SÔNG (mùa 5, 31/10; hoc/KE-HOACH-MUA-CANG-SONG.md mục 2.1, 2.9): bè hàng 'B' ('be-go') và đám lục bình 'L' ('luc-binh').
   Chép từ hình phim (claude/phim-clb xuat-m4.mjs), màu đổi sang BangMau, thêm vòng bọt nước quanh vật (đọc ra "đang nổi"). Vẽ đầy canvas như mọi vật (ve-vector-vat.js);
   s.keo: vật đang bị dây phao kéo (vòng bọt cam: dây đang giữ). ky = ký hiệu sân SanHoc (lõi Bến sông đã nhận từ 31/10). */
(function (root) {
  var V = root.VeVector || (typeof module === 'object' && require('./ve-vector.js'));
  function bot(g, H, keo) { H.elip(g, 50, 52, 45, 43); H.vien(g, keo ? BM.vecVanNongSang : H.rgba(BM.vecMatSangRgb, 0.75), 3); }

  /* BÈ HÀNG: bốn thân gỗ dọc, hai thanh buộc vàng, kiện hàng gỗ 3D buộc bạt xanh ở giữa. */
  V.dangKy({ loai: 'vat', ma: 'be-go', ten: 'Bè hàng nổi', ky: ['B'], cacTrangThai: [{}, { keo: true }], ve: function (g, s, H) {
    bot(g, H, !!(s && s.keo));
    [14, 31, 48, 65].forEach(function (x) {
      H.bo(g, x, 12, 16, 78, 7); g.fillStyle = H.gradDoc(g, x, 0, x + 16, 0, [[0, BM.vecDatSang], [1, BM.vecDat]]); g.fill(); H.vien(g, BM.vecDatToi, 2.4);
    });
    H.bo(g, 11, 22, 72, 8, 3); H.to(g, BM.vecBao); H.vien(g, BM.vecBaoVien, 2);
    H.bo(g, 11, 72, 72, 8, 3); H.to(g, BM.vecBao); H.vien(g, BM.vecBaoVien, 2);
    // Kiện hàng gỗ 3D đặt trên bè
    H.bo(g, 23, 28, 48, 42, 8);
    g.fillStyle = H.gradDoc(g, 0, 28, 0, 70, [[0, BM.vecCarton], [0.6, BM.vecCartonGiua], [1, BM.vecCartonToi]]);
    g.fill(); H.vien(g, BM.vecVien, 2.8);
    H.bo(g, 25, 30, 44, 24, 6);
    g.fillStyle = H.gradDoc(g, 0, 30, 0, 54, [[0, BM.vecCartonMat], [1, BM.vecCarton]]);
    g.fill(); H.vien(g, BM.vecCartonVien, 1.5);
    H.bo(g, 23, 47, 48, 10, 2); H.to(g, BM.vecNuocToi); H.vien(g, BM.vecVien, 1.8);
  } });

  /* ĐÁM LỤC BÌNH: năm cụm lá tròn xanh, ba bông tím nhụy vàng. */
  V.dangKy({ loai: 'vat', ma: 'luc-binh', ten: 'Đám lục bình', ky: ['L'], cacTrangThai: [{}, { keo: true }], ve: function (g, s, H) {
    bot(g, H, !!(s && s.keo));
    [[34, 38, 17], [64, 36, 16], [32, 64, 16], [64, 63, 18], [49, 50, 19]].forEach(function (c) {
      H.tron(g, c[0], c[1], c[2]); H.to(g, BM.vecLaDam); H.vien(g, BM.vecVien, 2.4);
      H.tron(g, c[0] - 3, c[1] - 3, c[2] * 0.55); H.to(g, BM.vecXanhLa);
    });
    [[43, 42], [57, 46], [49, 56]].forEach(function (f) {
      H.tron(g, f[0], f[1], 5.5); H.to(g, BM.vecMauCb); H.vien(g, BM.vecVien, 1.6);
      H.tron(g, f[0], f[1], 2); H.to(g, BM.vecNhuy);
    });
  } });

  /* ===== MÙA 9 (M9H1, 4/11): vật mới trên sân của lõi mùa 9 (hoc/san-hoc.js luật P, L2, L9, L10, T4). Vẽ bằng san-ve.js (veNguoi9, veSan9, veTreoCau9). */

  /* NGƯỜI CẦN CỨU (luật P): nhìn từ trên hơi chếch (như mọi vật 3D của game) — đầu tóc nâu, mặt, áo phao CAM có hai sọc trắng, hai tay.
     s.vay: tay phải giơ cao vẫy (đang chờ cứu, hai khung xen nhau) · s.nuoc: dưới nước (nửa dưới chìm, gợn nước quanh) · s.bam: hai tay dang ra ôm phao
     · s.tram: đã về trạm — khoác chăn xanh lá (không còn áo phao cam), dấu tích xanh. Màu đều từ BangMau; viền tối đọc được trên nước, bùn, sàn. */
  function veNguoi(g, s, H) {
    s = s || {};
    var tram = !!s.tram, nuoc = !!s.nuoc && !tram, bam = !!s.bam && nuoc, vay = !!s.vay && !tram && !bam;
    if (nuoc) { H.elip(g, 50, 60, 40, 34); H.to(g, H.rgba(BM.vecNuocRgb, 0.35)); H.vien(g, BM.vecNuocSang, 3); }
    else { H.elip(g, 52, 86, 26, 7); H.to(g, H.rgba(BM.vecBongRgb, 0.22)); }
    function tay(x0, y0, x1, y1) {
      g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); H.vien(g, BM.vecVien, 12); H.vien(g, BM.vecGoMat, 7);
      H.tron(g, x1, y1, 6); H.to(g, BM.vecGoMat); H.vien(g, BM.vecVien, 2.4);
    }
    // tay (dưới thân): buông xuôi / dang ôm phao / tay phải vẫy
    if (bam) { tay(34, 56, 12, 50); tay(66, 56, 88, 50); }
    else if (!tram) { tay(33, 56, 25, 76); if (vay) tay(67, 52, 84, 20); else tay(67, 56, 75, 76); }
    // thân: áo phao cam (hai sọc trắng) hay chăn xanh lá khi đã về trạm
    H.bo(g, 30, 44, 40, 40, 14);
    g.fillStyle = tram ? H.gradDoc(g, 0, 44, 0, 84, [[0, BM.vecXanhLaSang], [1, BM.vecLa]]) : H.gradDoc(g, 0, 44, 0, 84, [[0, BM.vecVanNongSang], [0.45, BM.vecVanNong], [1, BM.vecCamDam]]);
    g.fill(); H.vien(g, BM.vecVien, 3);
    if (tram) { H.duong(g, 'M50 46 L50 82'); H.vien(g, BM.vecLaDam, 2.4); }
    else {
      H.bo(g, 31, 58, 38, 6, 2); H.to(g, BM.vecVo); H.bo(g, 31, 70, 38, 6, 2); H.to(g, BM.vecVo);
      H.duong(g, 'M50 46 L50 82'); H.vien(g, BM.vecCamDam, 2);
    }
    // đầu: mặt + tóc + mắt + miệng
    H.tron(g, 50, 32, 15); H.to(g, BM.vecGoMat); H.vien(g, BM.vecVien, 3);
    g.beginPath(); g.arc(50, 31, 15, Math.PI * 1.02, Math.PI * 1.98); g.quadraticCurveTo(50, 24, 35.2, 29); g.closePath(); H.to(g, BM.vecGoToi);
    H.tron(g, 50, 32, 15); H.vien(g, BM.vecVien, 3);
    H.tron(g, 44.5, 34, 2.2); H.to(g, BM.vecVien); H.tron(g, 55.5, 34, 2.2); H.to(g, BM.vecVien);
    g.beginPath(); if (tram) g.arc(50, 37.5, 5, Math.PI * 0.15, Math.PI * 0.85); else g.arc(50, 41.5, 3.4, Math.PI * 1.15, Math.PI * 1.85); H.vien(g, BM.vecVien, 2);
    if (vay) { H.duong(g, 'M88 12 Q93 18 90 25 M78 10 Q74 14 75 19'); H.vien(g, BM.vecVien, 2.2); }   // vạch vẫy quanh bàn tay
    if (nuoc) {                                                                                    // mặt nước che nửa dưới
      H.bo(g, 14, 70, 72, 24, 12); H.to(g, H.rgba(BM.vecNuocRgb, 0.82));
      H.duong(g, 'M20 76 Q30 71 40 76 T60 76 T80 76'); H.vien(g, BM.vecNuocSang, 3);
      H.duong(g, 'M26 87 Q36 83 46 87 T66 87'); H.vien(g, BM.vecNuocSang, 2.2);
    }
    if (tram) { H.tron(g, 80, 20, 12); H.to(g, BM.vecXanhLa); H.vien(g, BM.vecVien, 2.4); H.duong(g, 'M74 20 L79 25 L87 15'); H.vien(g, BM.vecVo, 3.4); }
  }
  V.dangKy({ loai: 'vat', ma: 'nguoi-cuu', ten: 'Người cần cứu', cacTrangThai: [{}, { vay: 1 }, { nuoc: true }, { nuoc: true, vay: 1 }, { nuoc: true, bam: true }, { tram: true }], ve: function (g, s, H) { veNguoi(g, s, H); } });

  /* PHAO CỨU SINH (L10, drone thả): vòng phao cam bốn khúc trắng, dây buộc quanh; nằm trên mặt nước. s.loe: vừa có người bám (viền sáng). */
  V.dangKy({ loai: 'vat', ma: 'phao-cuu', ten: 'Phao cứu sinh', cacTrangThai: [{}, { loe: true }], ve: function (g, s, H) {
    H.tron(g, 50, 52, 40); H.to(g, H.rgba(BM.vecBongRgb, 0.18));
    H.tron(g, 50, 50, 30); H.vien(g, BM.vecVien, 22); H.vien(g, BM.vecVanNong, 16);
    for (var i = 0; i < 4; i++) { var a = i * Math.PI / 2 + Math.PI / 4; g.beginPath(); g.arc(50, 50, 30, a - 0.3, a + 0.3); H.vien(g, BM.vecVo, 16, 'butt'); }
    H.tron(g, 50, 50, 30); H.vien(g, BM.vecCamDam, 1.6);
    if (s && s.loe) { H.tron(g, 50, 50, 44); H.vien(g, BM.vecCanhBao, 3); }
  } });

  /* CONTAINER TRÔI (L2, lớp contTroi): container số trên mặt nước, vòng bọt quanh (như vật nổi). s.so, s.tan, s.keo (vòng bọt cam: dây đang giữ). */
  V.dangKy({ loai: 'vat', ma: 'container-troi', ten: 'Container trôi', cacTrangThai: [{ so: 7 }, { so: 12, keo: true }, { so: 3, tan: 3, hienTan: true }], ve: function (g, s, H) {
    s = s || {};
    bot(g, H, !!s.keo);
    if (V.veContainer) V.veContainer(g, H, 12, 28, 76, 50, s.so == null ? 1 : s.so, s);
  } });

  /* BÈ SẠC (T4, lớp beSac): bè gỗ bốn thân + tấm sạc xanh lơ có tia chớp vàng ở giữa (đọc ra "ô sạc nổi"). s.keo: dây đang giữ; s.loe: đang sạc (quầng vàng). */
  V.dangKy({ loai: 'vat', ma: 'be-sac', ten: 'Bè sạc', cacTrangThai: [{}, { keo: true }, { loe: true }], ve: function (g, s, H) {
    s = s || {};
    bot(g, H, !!s.keo);
    [14, 31, 48, 65].forEach(function (x) { H.bo(g, x, 12, 16, 78, 7); g.fillStyle = H.gradDoc(g, x, 0, x + 16, 0, [[0, BM.vecDatSang], [1, BM.vecDat]]); g.fill(); H.vien(g, BM.vecDatToi, 2.4); });
    if (s.loe) { H.tron(g, 50, 50, 34); H.to(g, H.rgba(BM.vecDichRgb, 0.45)); }
    H.bo(g, 24, 24, 52, 52, 10); g.fillStyle = H.gradDoc(g, 0, 24, 0, 76, [[0, BM.vecDen], [1, BM.vecDenToi]]); g.fill(); H.vien(g, BM.vecVien, 3);
    H.duong(g, 'M55 30 L38 53 L49 53 L44 70 L62 46 L51 46 Z'); H.to(g, BM.vecCanhBao); H.vien(g, BM.vecVien, 2.2);
  } });

  /* GIỎ CỨU HỘ (L9, tay lưới trên cần cẩu): giỏ lưới tròn khung cam treo dưới đầu cần (vẽ dưới móc); s.day: trong giỏ có người / vật (lưới căng hơn). */
  V.dangKy({ loai: 'vat', ma: 'gio-cuu-ho', ten: 'Giỏ cứu hộ', cacTrangThai: [{}, { day: true }], ve: function (g, s, H) {
    H.tron(g, 50, 52, 40); H.to(g, H.rgba(BM.vecBongRgb, 0.16));
    H.tron(g, 50, 50, 38); H.to(g, H.rgba(BM.vecMatSangRgb, 0.35)); H.vien(g, BM.vecVien, 7); H.vien(g, BM.vecVanNong, 4);
    g.beginPath(); for (var i = -2; i <= 2; i++) { g.moveTo(50 + i * 13, 50 - Math.sqrt(1444 - i * i * 169) + 2); g.lineTo(50 + i * 13, 50 + Math.sqrt(1444 - i * i * 169) - 2); g.moveTo(50 - Math.sqrt(1444 - i * i * 169) + 2, 50 + i * 13); g.lineTo(50 + Math.sqrt(1444 - i * i * 169) - 2, 50 + i * 13); }
    H.vien(g, s && s.day ? BM.vecCamDam : BM.vecVanNongSang, 1.8);
    [[50, 12], [88, 50], [50, 88], [12, 50]].forEach(function (p) { H.tron(g, p[0], p[1], 4); H.to(g, BM.vecThep); H.vien(g, BM.vecVien, 1.6); });   // bốn móc treo dây
  } });

  var MAU_TEN = ['red', 'green', 'blue', 'yellow'];
  var MAU_DAI = { red: 'luatSanDo', green: 'luatSanXanhLa', blue: 'luatSanXanhDuong', yellow: 'luatSanVang' };
  /* KIỆN HÀNG BẾN SÔNG 'o' (kien-hang-song): thùng gỗ kiện hàng chống nước 3D cao đặt trên bến sông. */
  V.dangKy({ loai: 'vat', ma: 'kien-hang-song', ten: 'Kiện hàng gỗ bến sông 3D',
    cacTrangThai: [{}].concat(MAU_TEN.map(function (m) { return { mau: m }; })),
    ve: function (g, s, H) {
      var coMau = s && MAU_TEN.indexOf(s.mau) >= 0, m = coMau ? s.mau : null;
      var dai = m ? BM[MAU_DAI[m]] : BM.vecNuocToi;
      // Thân kiện hàng gỗ 3D cao
      H.bo(g, 12, 14, 76, 72, 13);
      g.fillStyle = H.gradDoc(g, 0, 14, 0, 86, [[0, BM.vecCarton], [0.56, BM.vecCartonGiua], [1, BM.vecGoGiua]]);
      g.fill(); H.vien(g, BM.vecVien, 3);
      // Mặt nắp gỗ trên sáng (y = 16..54)
      H.bo(g, 15, 16, 70, 38, 9);
      g.fillStyle = H.gradDoc(g, 0, 16, 0, 54, [[0, BM.vecCartonMat], [1, BM.vecCarton]]);
      g.fill(); H.vien(g, BM.vecCartonVien, 1.8);
      H.duong(g, 'M24 22 H76'); H.vien(g, BM.vecGoSang, 3);
      // Đai bạt chống nước ở vách đứng phía trước (y = 60..77)
      H.bo(g, 16, 61, 68, 15, 4);
      H.to(g, dai); H.vien(g, BM.vecVien, 2);
      H.bo(g, 36, 65, 28, 7, 3); H.to(g, m ? BM.vecThe : BM.vecNuocSang);
      if (m) V.dauHinhMau(g, H, m, 50, 35, 14);
      else {
        H.duong(g, 'M24 35 H76'); H.vien(g, BM.vecCartonVien, 2);
      }
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
