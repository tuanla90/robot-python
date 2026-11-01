var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ve-vector-tay-hoi.js — VÒI PHUN HAI ĐẦU vector (Xe cứu hỏa R1, 29/10; trước là "súng hơi hai nòng"). Mã 'hoi' giữ nguyên như part-hoi.js; spray() phun ra trước, spray_back() ra sau.
   ĐẦU TRƯỚC ở mũi: đế trắng, BÌNH NƯỚC trắng có ô kính thấy mực nước xanh, ỐNG MỀM đỏ, khớp nối vàng, ĐẦU VÒI ĐỎ thuôn (cùng kiểu PhimVector.voiPhun) miệng nhỏ;
   ĐẦU SAU ở ĐUÔI thân: ống mềm đỏ ngắn chồng lên đuôi, đầu vòi đỏ thuôn nhô khỏi đuôi.
   Đầu sau đặt theo ổ 'sau' của từng thân: VeVector.robot truyền s.sau (ổ sau của thân, đổi sang hệ của tay) — như part-hoi.js đặt theo DUOI[than].
   Trạng thái s: dangBanTruoc (miệng trước sáng xanh nước + ba giọt nước tóe ra), dangBanSau (miệng sau sáng + ba giọt ra sau), chiTruoc (chỉ đầu trước: hình rời).
   mieng: { truoc: y miệng vòi trước (hệ tay) → hinhHoc().mz, lui: miệng sau nhô khỏi ổ sau bấy nhiêu → hinhHoc().mzs } (san-ve.js: tia nước phun ra từ đó, giật xe). */
(function (root) {
  var V = root.VeVector || (typeof module === 'object' && require('./ve-vector.js'));
  var MIENG = 103, LUI = 7;
  function ongMem(g, H, y0, y1) {                  // ống dẫn đỏ dọc x 45..55, có vạch phản quang đỏ sáng
    var a = Math.min(y0, y1), b = Math.max(y0, y1);
    g.beginPath(); g.rect(45, a, 10, b - a); g.closePath(); H.to(g, BM.vecDo); H.vien(g, BM.vecVien, 2.2, 'butt');
    H.duong(g, 'M47.5 ' + a + ' V' + b); H.vien(g, BM.vecDoSang, 1.5, 'butt');
  }
  function dauVoi(g, H, y, huong, ban, lucCao) {    // lăng phun cứu hỏa: miệng ở y, huong +1 = phun về +y (trước), −1 = về −y (sau)
    var y1 = y - 9.5 * huong, yGiua = y - 4.8 * huong, yDau = y - 1.3 * huong;
    if (ban && lucCao) {
      H.tron(g, 50, y, 7.2); g.fillStyle = H.gradToa(g, 50, y, 7.2, [[0, H.rgba(BM.vecNuocRgb, 0.65)], [0.6, H.rgba(BM.vecNuocRgb, 0.25)], [1, H.rgba(BM.vecNuocRgb, 0)]]); g.fill();
    }
    H.duong(g, 'M43 ' + y1 + ' L57 ' + y1 + ' L54 ' + (y - 1.5 * huong) + ' L46 ' + (y - 1.5 * huong) + ' Z'); H.to(g, BM.vecDo); H.vien(g, BM.vecVien, 2.2);
    H.duong(g, 'M45.8 ' + (y1 + 1.4 * huong) + ' L47.4 ' + (y - 2.2 * huong)); H.vien(g, BM.vecDoSang, 1.6);
    H.bo(g, 43.8, Math.min(yGiua, yGiua - 2.2 * huong), 12.4, 2.2, 1); H.to(g, BM.vecVang); H.vien(g, BM.vecVien, 1.3);
    H.bo(g, 44.5, Math.min(y + 0.3 * huong, y - 2.7 * huong), 11, 3, 1.4); H.to(g, BM.vecDe); H.vien(g, BM.vecVien, 1.8);
    H.elip(g, 50, yDau + 1.1 * huong, 3.2, 1.3); H.to(g, ban ? (lucCao ? BM.vecVo : BM.vecNuocSang) : BM.vecLoi); H.vien(g, BM.vecVien, 1.1);
  }
  function giot(g, H, x, y, r) { H.tron(g, x, y, r); H.to(g, BM.vecNuoc); H.vien(g, BM.vecNuocToi, 1); H.tron(g, x - r * 0.3, y - r * 0.3, r * 0.35); H.to(g, BM.vecNuocSang); }
  V.dangKy({ loai: 'tay', ma: 'hoi', hamGoc: ['spray',  'spray_back'], ten: 'Vòi phun hai đầu', gan: 'tay', diemNeo: { x: 50, y: 80 }, mieng: { truoc: MIENG, lui: LUI }, ve: function (g, s, M, H) {
    s = s || {};
    var tr = !!s.dangBanTruoc, sa = !!s.dangBanSau, lucCao = s.lucBan !== 'low', tu = !!s.tuLuc;
    /* đầu sau (vẽ trước: nằm dưới bình nước nếu thân ngắn) */
    if (!s.chiTruoc && s.sau) {
      var ys = s.sau.y - LUI;
      g.save(); g.translate(s.sau.x - 50, 0);
      ongMem(g, H, s.sau.y + 6, ys + 7.5);
      H.bo(g, 43.5, ys + 6.5, 13, 3.2, 1.5); H.to(g, BM.vecVang); H.vien(g, BM.vecVien, 1.6);
      dauVoi(g, H, ys, -1, sa, lucCao);
      if (sa) {
        if (lucCao) { H.duong(g, 'M47 ' + ys + ' L50 ' + (ys - 3.2) + ' L53 ' + ys + ' Z'); H.to(g, BM.vecNuocSang); }
        giot(g, H, 50, ys - 1.5, lucCao ? 1.8 : 1.3); giot(g, H, 45, ys + 0.4, lucCao ? 1.3 : 0.9); giot(g, H, 55, ys + 0.4, lucCao ? 1.3 : 0.9);
      }
      g.restore();
    }
    /* đầu trước: đế, bình nước áp lực 2 đầu đỏ + khoang nước xanh trong suốt, van đồng vàng, lăng phun đỏ */
    if (tu) {
      H.tron(g, 50, 95, 16); g.fillStyle = H.gradToa(g, 50, 95, 16, [[0, H.rgba(BM.vecNuocRgb, 0.55)], [0.65, H.rgba(BM.vecNuocRgb, 0.22)], [1, H.rgba(BM.vecNuocRgb, 0)]]); g.fill();
    }
    H.bo(g, 35, 75, 30, 9, 4.5); H.to(g, BM.vecKhop); H.vien(g, BM.vecVien, 2.4);
    H.bo(g, 34, 78.5, 32, 11.5, 5.5); H.to(g, BM.vecNuocSang); H.vien(g, BM.vecVien, 2.4);             // khoang kính bình nước
    H.bo(g, 35.2, 82, 29.6, 7.2, 3.5); H.to(g, BM.vecNuoc);                                            // mực nước xanh đậm
    H.duong(g, 'M39 82 Q44.5 80.6 50 82 Q55.5 83.4 61 82'); H.vien(g, BM.vecVo, 1.5);                  // mặt nước gợn sáng
    H.bo(g, 34, 78.5, 6.5, 11.5, 3.2); H.to(g, BM.vecDo); H.vien(g, BM.vecVien, 2);                    // nắp chụp đầu bình trái (đỏ cứu hỏa)
    H.bo(g, 59.5, 78.5, 6.5, 11.5, 3.2); H.to(g, BM.vecDo); H.vien(g, BM.vecVien, 2);                  // nắp chụp đầu bình phải (đỏ cứu hỏa)
    H.duong(g, 'M45.5 79.5 V89 M54.5 79.5 V89'); H.vien(g, BM.vecVien, 1.2);                           // vạch chia khoang áp lực
    H.bo(g, 42, 89, 16, 4.6, 2.2); H.to(g, BM.vecVang); H.vien(g, BM.vecVien, 2);                      // cổ van đồng vàng
    H.duong(g, 'M44.5 90.6 H55.5'); H.vien(g, BM.vecVangSang, 1.4);
    dauVoi(g, H, MIENG, 1, tr || tu, lucCao);
    if (tr) {
      if (lucCao) {
        H.duong(g, 'M46.5 103 L50 108.5 L53.5 103 Z'); H.to(g, BM.vecNuocSang); H.vien(g, BM.vecNuoc, 1.2);
        giot(g, H, 50, 106.8, 2.9); giot(g, H, 43.8, 105.2, 2.0); giot(g, H, 56.2, 105.2, 2.0);
      } else {
        giot(g, H, 50, 106.2, 2.0); giot(g, H, 45.8, 105.0, 1.3); giot(g, H, 54.2, 105.0, 1.3);
      }
    }
  } });
})(typeof window !== 'undefined' ? window : globalThis);
