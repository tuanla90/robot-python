var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ve-vector-tay-xoay.js — TAY XOAY CÓ KHỚP TRÒN vector (gói V3, mã 'xoay' như part-tay-xoay.js; arm_left / arm_right + bốn lệnh tay kẹp).
   Đế trắng ở mũi, KHỚP TRÒN (vành bạc, nắp xanh lá = tay nâng / hổ phách = tay hạ) ở KHOP (50, 84) hệ của tay; từ khớp: cổ tay tím → thanh ngang → hai ngón trắng viền chàm
   (mở / đóng / ôm vật như tay kẹp). Cánh tay quay quanh khớp theo góc liên tục s.goc (độ: 0 = trước, âm = trái xe, dương = phải xe) hoặc nấc s.xoay ('trai' | 'truoc' | 'phai').
   LUẬT VƯƠN (giữ như bộ pixel: tay chỉ sang ô bên thì vật nằm cạnh hông xe): tâm vật cách khớp L(góc) = L0 + (L1 − L0)·|sin góc| — trước mặt L0 = 13 (vật gần chỗ
   tay kẹp), sang ngang L1 = 41 (vật ra ngoài bánh, sát mép ô bên). Ở nấc trước / trái / phải mọi nét vẫn trong ô; lúc đang xoay giữa chừng (~45°) đầu ngón và vật
   chờm sang ô chéo tối đa ≈ 0,15 ô → canvas robot có lề tràn `tran` mỗi bên (VeVector.robot), san-ve.js vẽ trên lớp phủ cả sân nên phần chờm vẫn hiện.
   (Gói V6b: L0 / L1 / tran đổi theo vật to, xem dưới; tran = 0,3 ô vì ngón ôm vật nâng lúc xoay 45° chờm tới ≈ 0,29 ô.)
   vatXoay(tuThe, goc, k) → { x, y, canh } tâm vật trong hệ của tay (VeVector.vatXoay đổi sang { f, l, n } 1/100 ô, cùng nghĩa với VeRobot.vatXoay pixel); tay hạ: ngón dài thêm HA.
   Gói V6b (user 28/10 "Nâng lên to ra"): như tay kẹp, vật cỡ VeVector.coVatKep(k) (hạ = vật nằm sàn, nâng 1,2 lần), k = s.nangK hay theo tuThe; hai ngón ôm mép vật ở cỡ đó,
   khi MỞ giữ khe cũ (tay xoay không mở / khép dần). Vật to nên L0 / L1 dài hơn (L0 = 16: vật trước mũi gần chỗ tay kẹp; L1 = 46: vật cạnh hông, ngoài bánh) và
   ngón lùi về phía khớp (u0 = L − 16 … u1 = L + 4) cho đầu ngón ở nấc trước vẫn trong ô; ở nấc trái / phải vật to chờm sang ô chéo nên ngón ôm vật cũng chờm, nằm trong lề `tran`.
   Gói V7a: MỞ / KHÉP DẦN như tay kẹp: khe mở = MO ở nấc trước (rộng hơn vật nằm sàn, như tay kẹp; cũ 16,5 hẹp hơn vật nên vừa cầm là khe bật to), thu dần về MO_NGANG
   ở nấc trái / phải (ngón mở vẫn trong ô; nhặt ở nấc ngang thì khe nở dần ra ôm vật), s.moK (0 khép … 1 mở, san-ve.js hoatVec
   tween cả lúc nhặt vật) cho khe chạy dần từ MO về khe đích (ôm: mép vật + 1; đóng không vật: 2,5). Ngón ÔM SÁT hai cạnh vật: mép trong của nét ngón chạm mép vật
   (không chĩa ra ngoài), đầu ngón móc vào trong như càng tay kẹp. Máy kiểm --loi-gia: _loiGia.xoayBat bỏ moK (khe bật một phát, như trước V7a). */
(function (root) {
  var V = root.VeVector || (typeof module === 'object' && require('./ve-vector.js'));
  var KHOP = { x: 50, y: 84 }, L0 = 16, L1 = 46, HA = 2, CANH = V.VAT_SAN / V.CO_THAN;
  var MO = V.VAT_SAN / V.CO_THAN / 2 + 4, MO_NGANG = 20, DONG = 2.5, NET = 3.3;   // gói V7a: nửa khe khi mở ở nấc trước (= tay kẹp) / ở nấc ngang (ngón mở phải nằm trong ô) / khi đóng không vật;
                                                                                   // NET: tâm nét ngón cách mép vật (viền 8: mép trong nét chạm mép vật)
  function gocCua(s) { return s.goc !== undefined && s.goc !== null ? +s.goc : ({ trai: -90, phai: 90 }[s.xoay] || 0); }
  /** Tâm vật cách khớp bao nhiêu theo góc; ha = phần hạ 0..1 (gói V6b: chuyển dần theo độ nâng). */
  function dai(goc, ha) { return L0 + (L1 - L0) * Math.abs(Math.sin(goc * Math.PI / 180)) + HA * (ha === true ? 1 : +ha || 0); }
  V.dangKy({ loai: 'tay', ma: 'xoay', ten: 'Tay xoay có khớp tròn', gan: 'tay', diemNeo: { x: 50, y: 80 }, tran: 0.3, khop: KHOP, vatKep: { y: KHOP.y + L0, canh: CANH, ha: HA },
    vatXoay: function (tuThe, goc, k) {
      var b = (goc || 0) * Math.PI / 180, L = dai(goc || 0, 1 - V.nangCua(tuThe, k));
      return { x: KHOP.x - L * Math.sin(b), y: KHOP.y + L * Math.cos(b), canh: CANH };       // mặt quay xuống: bên phải xe là phía x nhỏ; cạnh thân vật thật: VeVector.coVatKep(k)
    },
    ve: function (g, s, M, H) {
      s = s || {};
      var goc = gocCua(s), ha = s.tuThe === 'duoi', nk = V.nangCua(s.tuThe, s.nangK), mo = s.kep !== 'dong', om = !mo && !!s.cam, L = dai(goc, 1 - nk), u0 = L - 16, u1 = L + 4 + HA * (1 - nk);
      var dich = om ? V.coVatKep(nk) / V.CO_THAN / 2 + NET : DONG;                        // gói V7a: khe đích; ôm = tâm nét ngón (ngoai = trong + 0,5) cách mép vật 3,8
      if (om) {                                                                             // đang xoay giữa hai nấc: vật vẫn vuông theo xe (san-ve.js) nên ngón ôm thẳng sẽ chĩa ra góc vật ("sừng");
        var hv = V.coVatKep(nk) / V.CO_THAN / 2, phi = (goc - 90 * Math.round(goc / 90)) * Math.PI / 180;   // thu khe dần về bề rộng nằm gọn trong vật xoay 45° (|sin 2φ|), về nấc thì ôm sát lại
        var wTrong = Math.SQRT2 * (hv - NET) + (u0 - L) - 0.5;
        if (wTrong < dich) dich -= (dich - wTrong) * Math.abs(Math.sin(2 * phi));
      }
      var mk = typeof s.moK === 'number' && isFinite(s.moK) && !V._loiGia.xoayBat ? Math.max(0, Math.min(1, s.moK)) : mo ? 1 : 0;
      var moG = MO - (MO - MO_NGANG) * Math.abs(Math.sin(goc * Math.PI / 180));        // khe mở theo góc: trước mặt rộng như tay kẹp, sang ngang hẹp lại cho ngón trong ô
      var trong = V._loiGia.xoayBat ? (mo ? 16.5 : om ? V.coVatKep(nk) / V.CO_THAN / 2 + 1 : 2.5) : dich + (moG - dich) * mk, ngoai = trong + 0.5;
      if (mk > 0 && !mo) mo = true;                                                         // đang khép dần: vẽ ngón thẳng như lúc mở, khe đang chạy
      var moc = !V._loiGia.xoayBat && mk < 1 ? 5 * (1 - mk) : 0;                          // đầu ngón móc dần vào trong khi khép (ôm), mở hẳn thì thẳng
      H.bo(g, 37, 76, 26, 10, 5); H.to(g, BM.vecKhop); H.vien(g, BM.vecVien, 2.5);
      g.save(); g.translate(KHOP.x, KHOP.y); g.rotate(goc * Math.PI / 180);            // hệ cánh tay: +y = dọc cánh tay (góc 0 = trước), xoay dương = sang phải xe (phía x nhỏ)
      /* cổ tay tím từ khớp tới thanh ngang */
      if (u0 > 3) { H.duong(g, 'M0 0 V' + u0); H.vien(g, BM.vecVien, 9); H.duong(g, 'M0 0 V' + u0); H.vien(g, BM.vecTim, 5); }
      /* thanh ngang + hai ngón */
      H.duong(g, 'M' + (-ngoai) + ' ' + u0 + ' H' + ngoai); H.vien(g, BM.vecVien, 8);
      var uM = u1 - moc * 0.6, ngon = mo || om ? 'M' + (-ngoai) + ' ' + u0 + ' V' + uM + (moc ? ' L' + (-ngoai + moc) + ' ' + u1 : '') + ' M' + ngoai + ' ' + u0 + ' V' + uM + (moc ? ' L' + (ngoai - moc) + ' ' + u1 : '')
        : 'M' + (-ngoai - 7) + ' ' + u0 + ' C' + (-ngoai - 7) + ' ' + (u0 + 9) + ' ' + (-ngoai) + ' ' + (u1 - 6) + ' ' + (-1.5) + ' ' + u1 + ' M' + (ngoai + 7) + ' ' + u0 + ' C' + (ngoai + 7) + ' ' + (u0 + 9) + ' ' + ngoai + ' ' + (u1 - 6) + ' 1.5 ' + u1;
      if (!mo && !om) { H.duong(g, 'M' + (-ngoai - 7) + ' ' + u0 + ' H' + (ngoai + 7)); H.vien(g, BM.vecVien, 8); }
      H.duong(g, ngon); H.vien(g, BM.vecVien, 8);
      H.duong(g, ngon); H.vien(g, BM.vecNgon, 4);                                            // ngón tông bạc như tay kẹp (gói V4)
      H.duong(g, 'M' + (-ngoai - (mo || om ? 0 : 7)) + ' ' + u0 + ' H' + (ngoai + (mo || om ? 0 : 7))); H.vien(g, BM.vecNgon, 4);
      g.restore();
      /* khớp tròn: vành bạc, nắp báo nâng / hạ */
      H.tron(g, KHOP.x, KHOP.y, 7); H.to(g, BM.vecBac); H.vien(g, BM.vecVien, 2.5);
      H.tron(g, KHOP.x, KHOP.y, 4); H.to(g, ha ? BM.vecVangToi : BM.vecXanhLa); H.vien(g, BM.vecVien, 1.2);
    } });
})(typeof window !== 'undefined' ? window : globalThis);
