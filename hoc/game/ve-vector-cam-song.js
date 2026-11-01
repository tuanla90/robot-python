var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ve-vector-cam-song.js — CẢM BIẾN CHONG CHÓNG DÒNG CHẢY 'dong-chay' (Bến sông, mùa 5, 31/10; hoc/KE-HOACH-MUA-CANG-SONG.md mục 2.7), ổ 'tren' (góc mũi).
   Cụm tuabin đo lưu tốc nước: đế tròn vỏ trắng, lòng đĩa tối, bốn cánh gàu cong 3D và chóp trục; s.bat (đang đọc): quầng xoáy nước xanh, cánh xoay lệch sáng, chóp vàng;
   s.nang (nâng cấp flow() trả cả sức nước): thêm vành la bàn chia vạch quanh đế (đồng hồ sức nước). hamGoc: flow_dir (gốc gói 3) + flow (nâng cấp gói 7). */
(function (root) {
  var V = root.VeVector || (typeof module === 'object' && require('./ve-vector.js'));
  V.dangKy({ loai: 'cam-bien', ma: 'dong-chay', hamGoc: ['flow_dir', 'flow'], ten: 'Chong chóng đo dòng chảy', gan: 'tren', diemNeo: { x: 50, y: 50 }, ve: function (g, s, M, H) {
    s = s || {};
    var i, a, c, sn, nx, ny;
    if (s.bat) {
      H.tron(g, 50, 50, 11.2); H.to(g, H.rgba(BM.vecNuocRgb, 0.38));
      g.beginPath(); g.arc(50, 50, 9.4, 0.15 * Math.PI, 0.75 * Math.PI); g.moveTo(50 - 9.4 * Math.cos(0.15 * Math.PI), 50 - 9.4 * Math.sin(0.15 * Math.PI)); g.arc(50, 50, 9.4, 1.15 * Math.PI, 1.75 * Math.PI);
      H.vien(g, BM.vecNuocSang, 1.3);
    }
    if (s.nang) {
      H.tron(g, 50, 50, 10.2); H.vien(g, BM.vecVien, 1.6);
      g.beginPath();
      for (i = 0; i < 8; i++) {
        a = i * Math.PI / 4;
        g.moveTo(50 + Math.cos(a) * 8.2, 50 + Math.sin(a) * 8.2);
        g.lineTo(50 + Math.cos(a) * 10.2, 50 + Math.sin(a) * 10.2);
      }
      H.vien(g, BM.vecNuocToi, 1.3);
    }
    H.tron(g, 50, 50, 7); g.fillStyle = H.gradVo(g, 43, 43, 14, 14); g.fill(); H.vien(g, BM.vecVien, 2.2);
    H.tron(g, 50, 50, 4.4); H.to(g, BM.vecDe);
    /* bốn cánh gàu cong chong chóng thủy lực */
    for (i = 0; i < 4; i++) {
      a = i * Math.PI / 2 + (s.bat ? 0.45 : 0);
      c = Math.cos(a); sn = Math.sin(a); nx = -sn; ny = c;
      g.beginPath();
      g.moveTo(50 + c * 1.6, 50 + sn * 1.6);
      g.quadraticCurveTo(50 + c * 5.6 + nx * 3.2, 50 + sn * 5.6 + ny * 3.2, 50 + c * 8.8, 50 + sn * 8.8);
      g.quadraticCurveTo(50 + c * 5.2 - nx * 1.2, 50 + sn * 5.2 - ny * 1.2, 50 + c * 1.6, 50 + sn * 1.6);
      g.closePath();
      H.to(g, s.bat ? BM.vecDai : BM.vecNuoc); H.vien(g, BM.vecVien, 1.5);
    }
    H.tron(g, 50, 50, 2.6); H.to(g, s.bat ? BM.vecCanhBao : BM.vecVo); H.vien(g, BM.vecVien, 1.3);
    H.tron(g, 50, 50, 0.9); H.to(g, BM.vecVien);
  } });
})(typeof window !== 'undefined' ? window : globalThis);
