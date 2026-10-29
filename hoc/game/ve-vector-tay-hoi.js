var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ve-vector-tay-hoi.js — VÒI PHUN HAI ĐẦU vector (Xe cứu hỏa R1, 29/10; trước là "súng hơi hai nòng"). Mã 'hoi' giữ nguyên như part-hoi.js; shoot() phun ra trước, shoot_back() ra sau.
   ĐẦU TRƯỚC ở mũi: đế trắng, BÌNH NƯỚC trắng có ô kính thấy mực nước xanh, ỐNG MỀM đỏ, khớp nối vàng, ĐẦU VÒI ĐỎ thuôn (cùng kiểu PhimVector.voiPhun) miệng nhỏ;
   ĐẦU SAU ở ĐUÔI thân: ống mềm đỏ ngắn chồng lên đuôi, đầu vòi đỏ thuôn nhô khỏi đuôi.
   Đầu sau đặt theo ổ 'sau' của từng thân: VeVector.robot truyền s.sau (ổ sau của thân, đổi sang hệ của tay) — như part-hoi.js đặt theo DUOI[than].
   Trạng thái s: dangBanTruoc (miệng trước sáng xanh nước + ba giọt nước tóe ra), dangBanSau (miệng sau sáng + ba giọt ra sau), chiTruoc (chỉ đầu trước: hình rời).
   mieng: { truoc: y miệng vòi trước (hệ tay) → hinhHoc().mz, lui: miệng sau nhô khỏi ổ sau bấy nhiêu → hinhHoc().mzs } (san-ve.js: tia nước phun ra từ đó, giật xe). */
(function (root) {
  var V = root.VeVector || (typeof module === 'object' && require('./ve-vector.js'));
  var MIENG = 103, LUI = 7;
  function ongMem(g, H, y0, y1) {                  // ống mềm đỏ dọc x 46..54, một vạch sáng
    var a = Math.min(y0, y1), b = Math.max(y0, y1);
    g.beginPath(); g.rect(46, a, 8, b - a); g.closePath(); H.to(g, BM.vecDo); H.vien(g, BM.vecVien, 2.2, 'butt');
    H.duong(g, 'M48 ' + a + ' V' + b); H.vien(g, BM.vecDoSang, 1.4, 'butt');
  }
  function dauVoi(g, H, y, huong, ban) {            // đầu vòi đỏ thuôn: miệng (mép ngoài) ở y, huong +1 = phun về +y (trước), −1 = về −y (sau); cao 7
    var y1 = y - 7 * huong;
    H.duong(g, 'M44 ' + y1 + ' L56 ' + y1 + ' L52.5 ' + y + ' L47.5 ' + y + ' Z'); H.to(g, BM.vecDo); H.vien(g, BM.vecVien, 2);
    H.duong(g, 'M46.5 ' + (y1 + 1.5 * huong) + ' L48.6 ' + (y - 1.2 * huong)); H.vien(g, BM.vecDoSang, 1.2);
    H.elip(g, 50, y, 2.6, 1.1); H.to(g, ban ? BM.vecNuocSang : BM.vecLoi); H.vien(g, BM.vecVien, 1);
  }
  function giot(g, H, x, y, r) { H.tron(g, x, y, r); H.to(g, BM.vecNuoc); H.vien(g, BM.vecNuocToi, 1); H.tron(g, x - r * 0.3, y - r * 0.3, r * 0.35); H.to(g, BM.vecNuocSang); }
  V.dangKy({ loai: 'tay', ma: 'hoi', hamGoc: ['shoot',  'shoot_back'], ten: 'Vòi phun hai đầu', gan: 'tay', diemNeo: { x: 50, y: 80 }, mieng: { truoc: MIENG, lui: LUI }, ve: function (g, s, M, H) {
    s = s || {};
    var tr = !!s.dangBanTruoc, sa = !!s.dangBanSau;
    /* đầu sau (vẽ trước: nằm dưới bình nước nếu thân ngắn) */
    if (!s.chiTruoc && s.sau) {
      var ys = s.sau.y - LUI;
      g.save(); g.translate(s.sau.x - 50, 0);
      ongMem(g, H, s.sau.y + 6, ys + 6);
      dauVoi(g, H, ys, -1, sa);
      if (sa) { giot(g, H, 50, ys - 1.2, 1.5); giot(g, H, 45.5, ys + 0.6, 1.1); giot(g, H, 54.5, ys + 0.6, 1.1); }
      g.restore();
    }
    /* đầu trước: đế, ống mềm, bình nước, khớp nối, đầu vòi */
    H.bo(g, 37, 76, 26, 10, 5); H.to(g, BM.vecKhop); H.vien(g, BM.vecVien, 2.5);
    ongMem(g, H, 90, MIENG - 8);
    H.bo(g, 38, 81, 24, 10, 5); g.fillStyle = H.gradVo(g, 38, 81, 24, 10); g.fill(); H.vien(g, BM.vecVien, 2.2);
    H.bo(g, 42.5, 84, 15, 4, 2); H.to(g, BM.vecNuocSang); H.vien(g, BM.vecVien, 1.1);                 // ô kính bình nước
    H.bo(g, 42.5, 86, 15, 2, 1); H.to(g, BM.vecNuoc);                                                // mực nước
    H.bo(g, 44, MIENG - 9.5, 12, 3, 1.3); H.to(g, BM.vecVang); H.vien(g, BM.vecVien, 1.6);            // khớp nối vàng
    dauVoi(g, H, MIENG, 1, tr);
    if (tr) { giot(g, H, 50, 106.6, 2.8); giot(g, H, 45, 105.2, 1.8); giot(g, H, 55, 105.2, 1.8); }
  } });
})(typeof window !== 'undefined' ? window : globalThis);
