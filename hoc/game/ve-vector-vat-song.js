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
