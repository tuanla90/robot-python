var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ve-vector-cam-song.js — CẢM BIẾN CHONG CHÓNG DÒNG CHẢY 'dong-chay' (Bến sông, mùa 5, 31/10; hoc/KE-HOACH-MUA-CANG-SONG.md mục 2.7), ổ 'tren' (góc mũi).
   Chép từ hình phim, màu đổi sang BangMau. Đế tròn vỏ trắng, bốn cánh chong chóng, chóp; s.bat (đang đọc): quầng xanh, cánh xoay lệch, chóp vàng; s.nang (nâng cấp
   flow() trả cả sức nước): thêm vòng chia vạch quanh đế (đồng hồ sức nước). hamGoc: flow_dir (gốc gói 3) + flow (nâng cấp gói 7). */
(function (root) {
  var V = root.VeVector || (typeof module === 'object' && require('./ve-vector.js'));
  V.dangKy({ loai: 'cam-bien', ma: 'dong-chay', hamGoc: ['flow_dir', 'flow'], ten: 'Chong chóng đo dòng chảy', gan: 'tren', diemNeo: { x: 50, y: 50 }, ve: function (g, s, M, H) {
    s = s || {};
    var i, a;
    if (s.bat) { H.tron(g, 50, 50, 11); H.to(g, H.rgba(BM.vecNuocRgb, 0.4)); }
    if (s.nang) { H.tron(g, 50, 50, 10); H.vien(g, BM.vecVien, 1.4); g.beginPath(); for (i = 0; i < 8; i++) { a = i * Math.PI / 4; g.moveTo(50 + Math.cos(a) * 8.5, 50 + Math.sin(a) * 8.5); g.lineTo(50 + Math.cos(a) * 10, 50 + Math.sin(a) * 10); } H.vien(g, BM.vecNuocToi, 1.2); }
    H.tron(g, 50, 50, 6.5); g.fillStyle = H.gradVo(g, 43.5, 43.5, 13, 13); g.fill(); H.vien(g, BM.vecVien, 2.2);
    g.beginPath();
    for (i = 0; i < 4; i++) { a = i * Math.PI / 2 + (s.bat ? 0.4 : 0); g.moveTo(50, 50); g.lineTo(50 + Math.cos(a) * 8.5, 50 + Math.sin(a) * 8.5); }
    H.vien(g, BM.vecVien, 4.2); H.vien(g, s.bat ? BM.vecDai : BM.vecNuocToi, 2.2);
    H.tron(g, 50, 50, 2.5); H.to(g, s.bat ? BM.vecCanhBao : BM.vecVo); H.vien(g, BM.vecVien, 1.2);
  } });
})(typeof window !== 'undefined' ? window : globalThis);
