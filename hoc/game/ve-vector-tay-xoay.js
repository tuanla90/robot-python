var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ve-vector-tay-xoay.js — TAY XOAY CÓ KHỚP TRÒN vector (gói V3, mã 'xoay' như part-tay-xoay.js; arm_left / arm_right + bốn lệnh tay kẹp).
   Đế trắng ở mũi, KHỚP TRÒN (vành bạc, nắp xanh lá = tay nâng / hổ phách = tay hạ) ở KHOP (50, 84) hệ của tay; từ khớp: cổ tay tím → thanh ngang → hai ngón trắng viền chàm
   (mở / đóng / ôm vật như tay kẹp). Cánh tay quay quanh khớp theo góc liên tục s.goc (độ: 0 = trước, âm = trái xe, dương = phải xe) hoặc nấc s.xoay ('trai' | 'truoc' | 'phai').
   LUẬT VƯƠN (giữ như bộ pixel: tay chỉ sang ô bên thì vật nằm cạnh hông xe): tâm vật cách khớp L(góc) = L0 + (L1 − L0)·|sin góc| — trước mặt L0 = 16 (vật trùng chỗ
   tay kẹp), sang ngang L1 = 42 (vật ra ngoài bánh, sát mép ô bên). Ở nấc trước / trái / phải mọi nét vẫn trong ô; lúc đang xoay giữa chừng (~45°) đầu ngón và vật
   chờm sang ô chéo tối đa ≈ 0,1 ô → canvas robot có lề tràn `tran` = 0,12 ô mỗi bên (VeVector.robot), san-ve.js vẽ trên lớp phủ cả sân nên phần chờm vẫn hiện.
   vatXoay(tuThe, goc) → { x, y, canh } tâm vật trong hệ của tay (VeVector.vatXoay đổi sang { f, l, n } 1/100 ô, cùng nghĩa với VeRobot.vatXoay pixel); tay hạ: ngón dài thêm HA. */
(function (root) {
  var V = root.VeVector || (typeof module === 'object' && require('./ve-vector.js'));
  var KHOP = { x: 50, y: 84 }, L0 = 16, L1 = 42, HA = 3, CANH = 28;
  function gocCua(s) { return s.goc !== undefined && s.goc !== null ? +s.goc : ({ trai: -90, phai: 90 }[s.xoay] || 0); }
  function dai(goc, ha) { return L0 + (L1 - L0) * Math.abs(Math.sin(goc * Math.PI / 180)) + (ha ? HA : 0); }
  V.dangKy({ loai: 'tay', ma: 'xoay', ten: 'Tay xoay có khớp tròn', gan: 'tay', diemNeo: { x: 50, y: 80 }, tran: 0.12, khop: KHOP, vatKep: { y: KHOP.y + L0, canh: CANH, ha: HA },
    vatXoay: function (tuThe, goc) {
      var b = (goc || 0) * Math.PI / 180, L = dai(goc || 0, tuThe === 'duoi');
      return { x: KHOP.x - L * Math.sin(b), y: KHOP.y + L * Math.cos(b), canh: CANH };       // mặt quay xuống: bên phải xe là phía x nhỏ
    },
    ve: function (g, s, M, H) {
      s = s || {};
      var goc = gocCua(s), ha = s.tuThe === 'duoi', mo = s.kep !== 'dong', om = !mo && !!s.cam, L = dai(goc, ha), u0 = L - 12, u1 = L + 11 + (ha ? HA : 0);
      var trong = mo ? 16.5 : om ? 15 : 2.5, ngoai = trong + 0.5;
      H.bo(g, 37, 76, 26, 10, 5); H.to(g, BM.vecKhop); H.vien(g, BM.vecVien, 2.5);
      g.save(); g.translate(KHOP.x, KHOP.y); g.rotate(goc * Math.PI / 180);            // hệ cánh tay: +y = dọc cánh tay (góc 0 = trước), xoay dương = sang phải xe (phía x nhỏ)
      /* cổ tay tím từ khớp tới thanh ngang */
      if (u0 > 3) { H.duong(g, 'M0 0 V' + u0); H.vien(g, BM.vecVien, 9); H.duong(g, 'M0 0 V' + u0); H.vien(g, BM.vecTim, 5); }
      /* thanh ngang + hai ngón */
      H.duong(g, 'M' + (-ngoai) + ' ' + u0 + ' H' + ngoai); H.vien(g, BM.vecVien, 8);
      var ngon = mo || om ? 'M' + (-ngoai) + ' ' + u0 + ' V' + u1 + ' M' + ngoai + ' ' + u0 + ' V' + u1
        : 'M' + (-ngoai - 7) + ' ' + u0 + ' C' + (-ngoai - 7) + ' ' + (u0 + 9) + ' ' + (-ngoai) + ' ' + (u1 - 6) + ' ' + (-1.5) + ' ' + u1 + ' M' + (ngoai + 7) + ' ' + u0 + ' C' + (ngoai + 7) + ' ' + (u0 + 9) + ' ' + ngoai + ' ' + (u1 - 6) + ' 1.5 ' + u1;
      if (!mo && !om) { H.duong(g, 'M' + (-ngoai - 7) + ' ' + u0 + ' H' + (ngoai + 7)); H.vien(g, BM.vecVien, 8); }
      H.duong(g, ngon); H.vien(g, BM.vecVien, 8);
      H.duong(g, ngon); H.vien(g, BM.vecVo, 4);
      H.duong(g, 'M' + (-ngoai - (mo || om ? 0 : 7)) + ' ' + u0 + ' H' + (ngoai + (mo || om ? 0 : 7))); H.vien(g, BM.vecVo, 4);
      g.restore();
      /* khớp tròn: vành bạc, nắp báo nâng / hạ */
      H.tron(g, KHOP.x, KHOP.y, 7); H.to(g, BM.vecBac); H.vien(g, BM.vecVien, 2.5);
      H.tron(g, KHOP.x, KHOP.y, 4); H.to(g, ha ? BM.vecVangToi : BM.vecXanhLa); H.vien(g, BM.vecVien, 1.2);
    } });
})(typeof window !== 'undefined' ? window : globalThis);
