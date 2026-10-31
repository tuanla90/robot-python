var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ve-vector-vat-song.js — VẬT NỔI BẾN SÔNG (mùa 5, 31/10; hoc/KE-HOACH-MUA-CANG-SONG.md mục 2.1, 2.9): bè hàng 'B' ('be-go') và đám lục bình 'L' ('luc-binh').
   Chép từ hình phim (claude/phim-clb xuat-m4.mjs), màu đổi sang BangMau, thêm vòng bọt nước quanh vật (đọc ra "đang nổi"). Vẽ đầy canvas như mọi vật (ve-vector-vat.js);
   s.keo: vật đang bị dây phao kéo (vòng bọt cam: dây đang giữ). kyDacTa = ký hiệu sân theo đặc tả (chưa là ký hiệu SanHoc). */
(function (root) {
  var V = root.VeVector || (typeof module === 'object' && require('./ve-vector.js'));
  function bot(g, H, keo) { H.elip(g, 50, 52, 45, 43); H.vien(g, keo ? BM.vecVanNongSang : H.rgba(BM.vecMatSangRgb, 0.75), 3); }

  /* BÈ HÀNG: bốn thân gỗ dọc, hai thanh buộc vàng, thùng hàng trắng sọc xanh ở giữa. */
  V.dangKy({ loai: 'vat', ma: 'be-go', ten: 'Bè hàng nổi', kyDacTa: ['B'], cacTrangThai: [{}, { keo: true }], ve: function (g, s, H) {
    bot(g, H, !!(s && s.keo));
    [14, 31, 48, 65].forEach(function (x) {
      H.bo(g, x, 12, 16, 78, 7); g.fillStyle = H.gradDoc(g, x, 0, x + 16, 0, [[0, BM.vecDatSang], [1, BM.vecDat]]); g.fill(); H.vien(g, BM.vecDatToi, 2.4);
    });
    H.bo(g, 11, 22, 72, 8, 3); H.to(g, BM.vecBao); H.vien(g, BM.vecBaoVien, 2);
    H.bo(g, 11, 72, 72, 8, 3); H.to(g, BM.vecBao); H.vien(g, BM.vecBaoVien, 2);
    H.bo(g, 23, 30, 48, 40, 8); g.fillStyle = H.gradVo(g, 23, 30, 48, 40); g.fill(); H.vien(g, BM.vecVien, 2.8);
    H.bo(g, 23, 45, 48, 10, 2); H.to(g, BM.vecNuocToi); H.vien(g, BM.vecVien, 1.8);
  } });

  /* ĐÁM LỤC BÌNH: năm cụm lá tròn xanh, ba bông tím nhụy vàng. */
  V.dangKy({ loai: 'vat', ma: 'luc-binh', ten: 'Đám lục bình', kyDacTa: ['L'], cacTrangThai: [{}, { keo: true }], ve: function (g, s, H) {
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
})(typeof window !== 'undefined' ? window : globalThis);
