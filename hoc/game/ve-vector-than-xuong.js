var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ve-vector-than-xuong.js — THÂN XUỒNG CHÂN VỊT 'xuong' (Bến sông, mùa 5, 31/10; hoc/KE-HOACH-MUA-CANG-SONG.md mục 2.2, 2.4, 2.6). Chép từ hình phim
   (claude/phim-clb xuat-m4.mjs), màu đổi sang BangMau: phao đệm khí xanh nước bao quanh, dải phản quang cam, hai chân vịt ở đuôi (−y), vỏ trắng gia đình thân A,
   kính + mắt màu đội, ăng-ten. Quay mặt XUỐNG, tâm (50, 56) như mọi thân.
   Trạng thái s: neo (đã thả neo: hai mỏ neo vàng hai hông + xích), dat (nâng cấp buộc đuôi: móc kéo cam ở đuôi), dangDat (đang có vật buộc đuôi: dây cam ra khỏi móc),
   chay (chân vịt đang quay: cánh xoay 45°, gợn sau đuôi), mat (mắt biểu cảm của H.kinh).
   hamGoc: lệnh xe hai bánh (gốc gói 1) + anchor / unanchor (nâng cấp gói 5, theo cách drone có land / take_off trong hamGoc). */
(function (root) {
  var V = root.VeVector || (typeof module === 'object' && require('./ve-vector.js'));
  V.dangKy({
    loai: 'than', ma: 'xuong', hamGoc: ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'anchor', 'unanchor'], ten: 'Thân xuồng chân vịt',
    oGan: { tay: { x: 50, y: 84 }, hongTrai: { x: 76, y: 50 }, hongPhai: { x: 24, y: 50 }, tren: { x: 70, y: 76 }, sau: { x: 50, y: 22 } },
    oCam: { x: 64, y: 30 }, vo: { x: 22, y: 26, w: 56, h: 60 },
    ve: function (g, s, M, H) {
      s = s || {};
      var i, cx, a;
      g.beginPath(); g.arc(50, 56, 41, 0.15 * Math.PI, 0.85 * Math.PI); H.vien(g, H.rgba(BM.vecMatSangRgb, 0.7), 2.6);          // gợn nước hai mạn
      if (s.chay) { g.beginPath(); g.moveTo(30, 8); g.lineTo(35, 3); g.moveTo(70, 8); g.lineTo(65, 3); g.moveTo(50, 7); g.lineTo(50, 2); H.vien(g, H.rgba(BM.vecMatSangRgb, 0.8), 2.4); }
      for (i = 0; i < 2; i++) {                                                                                              // hai chân vịt ở đuôi
        cx = i ? 65 : 35;
        H.bo(g, cx - 5, 14, 10, 9, 3); H.to(g, BM.vecThepToi); H.vien(g, BM.vecVien, 2);
        a = s.chay ? Math.PI / 4 : 0;
        g.save(); g.translate(cx, 13); g.rotate(a);
        H.elip(g, -4, 0, 4.5, 2.2); H.to(g, BM.vecDai); H.vien(g, BM.vecVien, 1.5);
        H.elip(g, 4, 0, 4.5, 2.2); H.to(g, BM.vecDai); H.vien(g, BM.vecVien, 1.5);
        g.restore();
      }
      if (s.dat) {                                                                                                           // móc kéo đuôi (nâng cấp buộc dắt)
        H.bo(g, 45, 10, 10, 11, 4); H.to(g, BM.vecVanNong); H.vien(g, BM.vecVien, 2.2);
        H.tron(g, 50, 12, 3.2); H.to(g, BM.vecDe); H.vien(g, BM.vecVien, 1.5);
        if (s.dangDat) { g.beginPath(); g.moveTo(50, 9); g.lineTo(50, 3); H.vien(g, BM.vecVien, 6); H.vien(g, BM.vecVanNong, 3.5); }
      }
      g.beginPath(); g.moveTo(22, 27); g.lineTo(78, 27); g.quadraticCurveTo(84, 55, 74, 81); g.quadraticCurveTo(50, 93, 26, 81); g.quadraticCurveTo(16, 55, 22, 27); g.closePath();   // phao đệm khí
      g.fillStyle = H.gradDoc(g, 0, 22, 0, 92, [[0, BM.vecNuoc], [1, BM.vecNuocToi]]); g.fill(); H.vien(g, BM.vecVien, 3.6);
      H.bo(g, 18, 45, 6, 18, 3); H.to(g, BM.vecVanNong); H.vien(g, BM.vecVien, 1.8);                                           // dải phản quang cam hai mạn
      H.bo(g, 76, 45, 6, 18, 3); H.to(g, BM.vecVanNong); H.vien(g, BM.vecVien, 1.8);
      if (s.neo) {                                                                                                           // mỏ neo hai hông + xích
        [[11, -1], [89, 1]].forEach(function (p) {
          var ax = p[0], d = p[1];
          g.beginPath(); g.moveTo(ax - d * 7, 52); g.lineTo(ax, 52); g.lineTo(ax, 66); H.vien(g, BM.vecVien, 5); H.vien(g, BM.vecCanhBao, 2.6);
          g.beginPath(); g.moveTo(ax - 5, 61); g.quadraticCurveTo(ax, 70, ax + 5, 61); H.vien(g, BM.vecVien, 5); H.vien(g, BM.vecCanhBao, 2.6);
          g.beginPath(); g.moveTo(ax - 3.5, 56); g.lineTo(ax + 3.5, 56); H.vien(g, BM.vecVien, 3);
        });
      }
      H.bo(g, 27, 28, 46, 54, 16); g.fillStyle = H.gradVo(g, 27, 28, 46, 54); g.fill(); H.vien(g, BM.vecVien, 3.4);            // vỏ trắng gia đình thân A
      H.duong(g, 'M37 35 C35 45 35 53 37 61 M63 35 C65 45 65 53 63 61 M50 28 v10'); H.vien(g, BM.vecVoGhep, 2.2);
      H.kinh(g, M, 31, 59, 38, 14, s);
      H.angTen(g, M, 50, 29, 14, 4.8);
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
