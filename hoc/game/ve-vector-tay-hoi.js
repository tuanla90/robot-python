var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ve-vector-tay-hoi.js — SÚNG HƠI HAI NÒNG vector (gói V3, mã 'hoi' như part-hoi.js; shoot() bắn ra trước, shoot_back() ra sau).
   NÒNG TRƯỚC ở mũi: đế trắng, bình khí nén trắng có đồng hồ cyan, ống thép bạc, MIỆNG LOE trắng lòng tối; NÒNG SAU ở ĐUÔI thân: ống ngắn chồng lên đuôi, miệng loe nhô khỏi đuôi.
   Nòng sau đặt theo ổ 'sau' của từng thân: VeVector.robot truyền s.sau (ổ sau của thân, đổi sang hệ của tay) — như part-hoi.js đặt theo DUOI[than].
   Trạng thái s: dangBanTruoc (miệng trước sáng cyan + đám hơi trắng xanh), dangBanSau (miệng sau sáng + hai tia hơi hai bên), chiTruoc (chỉ nòng trước: hình rời).
   mieng: { truoc: y miệng nòng trước (hệ tay) → hinhHoc().mz, lui: miệng sau nhô khỏi ổ sau bấy nhiêu → hinhHoc().mzs } (san-ve.js: bóng bay ra từ đó, giật xe). */
(function (root) {
  var V = root.VeVector || (typeof module === 'object' && require('./ve-vector.js'));
  var MIENG = 103, LUI = 7;
  function ong(g, H, y0, y1) {                     // ống thép dọc x 45..55
    g.beginPath(); g.rect(45, Math.min(y0, y1), 10, Math.abs(y1 - y0)); g.closePath(); H.to(g, BM.vecBac); H.vien(g, BM.vecVien, 2.2, 'butt');
    H.duong(g, 'M47.5 ' + Math.min(y0, y1) + ' V' + Math.max(y0, y1)); H.vien(g, BM.vecVo, 1.6, 'butt');
  }
  function mieng(g, H, y, huong, ban) {            // miệng loe ở y (mép ngoài), huong +1 = mở về +y (trước), −1 = về −y (sau)
    var y0 = huong > 0 ? y - 6 : y;
    H.bo(g, 41, y0, 18, 6, 3); H.to(g, ban ? BM.vecDenSang : BM.vecVo); H.vien(g, BM.vecVien, 2.2);
    H.elip(g, 50, y0 + 3, 4.5, 1.6); H.to(g, ban ? BM.vecDen : BM.vecLoi);
  }
  V.dangKy({ loai: 'tay', ma: 'hoi', hamGoc: ['shoot',  'shoot_back'], ten: 'Súng hơi hai nòng', gan: 'tay', diemNeo: { x: 50, y: 80 }, mieng: { truoc: MIENG, lui: LUI }, ve: function (g, s, M, H) {
    s = s || {};
    var tr = !!s.dangBanTruoc, sa = !!s.dangBanSau;
    /* nòng sau (vẽ trước: nằm dưới bình khí nếu thân ngắn) */
    if (!s.chiTruoc && s.sau) {
      g.save(); g.translate(s.sau.x - 50, 0);
      ong(g, H, s.sau.y + 6, s.sau.y - LUI + 6);
      mieng(g, H, s.sau.y - LUI, -1, sa);
      if (sa) { H.duong(g, 'M40 ' + (s.sau.y - LUI + 2) + ' l-3 -3 M60 ' + (s.sau.y - LUI + 2) + ' l3 -3'); H.vien(g, BM.vecDen, 2); }
      g.restore();
    }
    /* nòng trước */
    H.bo(g, 37, 76, 26, 10, 5); H.to(g, BM.vecKhop); H.vien(g, BM.vecVien, 2.5);
    ong(g, H, 88, MIENG - 5);
    H.bo(g, 38, 82, 24, 10, 5); g.fillStyle = H.gradVo(g, 38, 82, 24, 10); g.fill(); H.vien(g, BM.vecVien, 2.2);
    H.tron(g, 50, 87, 2.6); H.to(g, BM.vecDen); H.vien(g, BM.vecVien, 1.2);
    mieng(g, H, MIENG, 1, tr);
    if (tr) {
      [[50, 107, 3.6], [44.5, 105.5, 2.3], [55.5, 105.5, 2.3]].forEach(function (q) { H.tron(g, q[0], q[1], q[2]); H.to(g, BM.vecHoi); H.vien(g, BM.vecDen, 1.2); });
    }
  } });
})(typeof window !== 'undefined' ? window : globalThis);
