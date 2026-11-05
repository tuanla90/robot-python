var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ve-vector-than-xuong.js — THÂN XUỒNG CHÂN VỊT 'xuong' (Bến sông, mùa 5, 31/10; hoc/KE-HOACH-MUA-CANG-SONG.md mục 2.2, 2.4, 2.6).
   Xuồng tuần tra / cứu hộ thủy lợi: thân phao đệm khí CAM cứu hộ 3D có đai chia khoang, mũi đệm cao su tối, dải phản quang trắng hai mạn, lòng khoang tàu thép tối,
   hai cụm chân vịt có vòng chắn bảo vệ ở đuôi (−y), cabin vỏ trắng chuẩn gia đình thân R1 (kính + mắt màu đội, ăng-ten, vệt sáng). Quay mặt XUỐNG, tâm (50, 56).
   Trạng thái s: neo (đã thả neo: hai mỏ neo hải quân vàng hai hông + xích + vòng sóng), dat (nâng cấp buộc đuôi: bích móc kéo cam ở đuôi), dangDat (đang có vật buộc đuôi),
   chay (chân vịt đang quay: cánh xoay 45°, bọt sóng sau đuôi), mat (mắt biểu cảm của H.kinh).
   hamGoc: lệnh xe hai bánh (gốc gói 1) + anchor / unanchor (nâng cấp gói 5). */
(function (root) {
  var V = root.VeVector || (typeof module === 'object' && require('./ve-vector.js'));
  V.dangKy({
    loai: 'than', ma: 'xuong', hamGoc: ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'anchor', 'unanchor'], ten: 'Thân xuồng chân vịt',
    oGan: { tay: { x: 50, y: 82 }, hongTrai: { x: 76, y: 50 }, hongPhai: { x: 24, y: 50 }, tren: { x: 72, y: 76 }, sau: { x: 50, y: 22 } },
    oCam: { x: 64, y: 29 }, vo: { x: 22, y: 26, w: 56, h: 60 },
    ve: function (g, s, M, H) {
      s = s || {};
      var i, cx, a;
      /* gợn sóng nước tách hai bên mạn xuồng */
      g.beginPath(); g.arc(50, 56, 42, 0.14 * Math.PI, 0.86 * Math.PI); H.vien(g, H.rgba(BM.vecMatSangRgb, 0.72), 2.5);
      if (s.chay) {
        g.beginPath();
        g.moveTo(31, 9); g.lineTo(35, 2.5); g.moveTo(69, 9); g.lineTo(65, 2.5); g.moveTo(50, 8); g.lineTo(50, 2);
        H.vien(g, H.rgba(BM.vecMatSangRgb, 0.85), 2.5);
      }
      /* hai cụm động cơ chân vịt đuôi tàu (−y) có cổ trụ thép và cánh quạt thủy lực */
      for (i = 0; i < 2; i++) {
        cx = i ? 66 : 34;
        H.bo(g, cx - 5.5, 13.5, 11, 10, 3); H.to(g, BM.vecThepToi); H.vien(g, BM.vecVien, 2);
        a = s.chay ? Math.PI / 4 : 0;
        g.save(); g.translate(cx, 12.5); g.rotate(a);
        H.elip(g, -4.4, 0, 4.6, 2.3); H.to(g, BM.vecDai); H.vien(g, BM.vecVien, 1.5);
        H.elip(g, 4.4, 0, 4.6, 2.3); H.to(g, BM.vecDai); H.vien(g, BM.vecVien, 1.5);
        H.tron(g, 0, 0, 2); H.to(g, BM.vecCanhBao); H.vien(g, BM.vecVien, 1.2);
        g.restore();
      }
      /* bích móc kéo đuôi (nâng cấp buộc dắt) */
      if (s.dat) {
        H.bo(g, 44.5, 10.5, 11, 11.5, 4); H.to(g, BM.vecVanNong); H.vien(g, BM.vecVien, 2.2);
        H.tron(g, 50, 13, 3.2); H.to(g, BM.vecDe); H.vien(g, BM.vecVien, 1.5);
        if (s.dangDat) { g.beginPath(); g.moveTo(50, 9.5); g.lineTo(50, 3); H.vien(g, BM.vecVien, 6); H.vien(g, BM.vecVanNong, 3.5); }
      }
      /* thân phao đệm khí cứu hộ 3D bầu đặn ôm quanh khoang tàu */
      g.beginPath();
      g.moveTo(20, 24); g.lineTo(80, 24);
      g.bezierCurveTo(88, 38, 87, 68, 76, 82);
      g.quadraticCurveTo(50, 95, 24, 82);
      g.bezierCurveTo(13, 68, 12, 38, 20, 24);
      g.closePath();
      g.fillStyle = H.gradDoc(g, 0, 22, 0, 92, [[0, BM.vecVanNongSang], [0.55, BM.vecVanNong], [1, BM.vecLuaCam]]); g.fill();
      H.vien(g, BM.vecVien, 3.6);
      /* vệt sáng nổi 3D và các đường đai chia khoang phao khí */
      H.duong(g, 'M17 36 H24 M76 36 H83 M16 64 H24 M76 64 H84 M29 77 L24 82 M71 77 L76 82');
      H.vien(g, BM.vecVien, 2);
      /* đệm mũi chống va đập (bow bumper) */
      H.bo(g, 38, 85.5, 24, 6.5, 3.2); H.to(g, BM.vecDe); H.vien(g, BM.vecVien, 2);
      /* dải phản quang trắng cứu hộ hai mạn */
      H.bo(g, 14.5, 44, 6.5, 18, 3); H.to(g, BM.vecVo); H.vien(g, BM.vecVien, 1.8);
      H.bo(g, 79, 44, 6.5, 18, 3); H.to(g, BM.vecVo); H.vien(g, BM.vecVien, 1.8);
      /* lòng sàn khoang tàu thép tối tạo chiều sâu trước khi đặt cabin R1 */
      H.bo(g, 23, 26.5, 54, 54, 17); H.to(g, BM.vecThepToi); H.vien(g, BM.vecVien, 2);
      /* cặp mỏ neo hải quân hai hông + xích khi thả neo (s.neo) */
      if (s.neo) {
        [[9.5, -1], [90.5, 1]].forEach(function (p) {
          var ax = p[0], d = p[1];
          H.elip(g, ax, 64, 7.5, 5); H.vien(g, H.rgba(BM.vecMatSangRgb, 0.75), 1.6);
          g.beginPath(); g.moveTo(ax - d * 6, 51); g.lineTo(ax, 53); g.lineTo(ax, 66.5);
          H.vien(g, BM.vecVien, 4.8); H.vien(g, BM.vecCanhBao, 2.5);
          g.beginPath(); g.moveTo(ax - 3.8, 56.5); g.lineTo(ax + 3.8, 56.5);
          H.vien(g, BM.vecVien, 3.4); H.vien(g, BM.vecCanhBao, 1.6);
          g.beginPath(); g.moveTo(ax - 5.2, 61.5); g.quadraticCurveTo(ax, 70, ax + 5.2, 61.5);
          H.vien(g, BM.vecVien, 4.8); H.vien(g, BM.vecCanhBao, 2.5);
          H.tron(g, ax, 52.5, 2); H.to(g, BM.vecCanhBao); H.vien(g, BM.vecVien, 1.2);
        });
      }
      /* cabin vỏ trắng chuẩn gia đình R1: vuông bo góc cân đối (48 × 46, r = 16), đường ghép tím nhạt + vệt sáng trắng */
      H.bo(g, 26, 27, 48, 46, 16); g.fillStyle = H.gradVo(g, 26, 27, 48, 46); g.fill(); H.vien(g, BM.vecVien, 3.4);
      H.duong(g, 'M36 34 C34.5 42 34.5 50 36 58 M64 34 C65.5 42 65.5 50 64 58 M50 27 v9'); H.vien(g, BM.vecVoGhep, 2.3);
      H.duong(g, 'M34 35.5 C37 31 41.5 30.2 47.5 30.2'); H.vien(g, BM.vecVo, 3.6);
      H.kinh(g, M, 31, 53, 38, 14, s);
      H.angTen(g, M, 50, 28, 14, 4.8);
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
