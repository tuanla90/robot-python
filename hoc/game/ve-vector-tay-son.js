var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ve-vector-tay-son.js — BỘ GIEO HẠT vector (mã 'son' như part-son.js; ink / dot / pen_down / pen_up). 30/10 (mùa 4 Nông trại hoa, user: "mỗi màu sơn là một
   loại hoa"): thay đầu sơn có chổi, luật giữ nguyên. Đế trắng ở mũi, PHỄU HẠT vỏ trắng có ô kính thấy hạt màu đang chọn (s.mauSon 'red' | 'green' | 'blue' | 'yellow',
   mặc định đỏ: màu luật luatSon*), cổ ống tím, MIỆNG GIEO ở đầu. s.tuThe 'duoi' (pen_down): miệng gieo hạ thấp + chùm hạt rơi xuống ô; không thì đang nhấc.
   Gieo vào ô XE ĐANG ĐỨNG: luật ở san-hoc.js (lệnh sơn). Ô đã gieo nở hoa (ve-vector-nong-trai.js V.hoa). */
(function (root) {
  var V = root.VeVector || (typeof module === 'object' && require('./ve-vector.js'));
  var MAU = { red: ['luatSonDo', 'luatSonDoSang', 'luatSonDoToi'], green: ['luatSonXanhLa', 'luatSonXanhLaSang', 'luatSonXanhLaToi'], blue: ['luatSonXanhDuong', 'luatSonXanhDuongSang', 'luatSonXanhDuongToi'], yellow: ['luatSonVang', 'luatSonVangSang', 'luatSonVangToi'] };
  V.dangKy({ loai: 'tay', ma: 'son', hamGoc: ['ink',  'dot',  'pen_down',  'pen_up'], ten: 'Bộ gieo hạt', gan: 'tay', diemNeo: { x: 50, y: 80 }, MAU_SON: MAU, ve: function (g, s, M, H) {
    s = s || {};
    var k = MAU[s.mauSon] || MAU.red, c = [BM[k[0]], BM[k[1]], BM[k[2]]], ha = s.tuThe === 'duoi', dau = ha ? 101 : 96;
    H.bo(g, 37, 76, 26, 10, 5); H.to(g, BM.vecKhop); H.vien(g, BM.vecVien, 2.5);
    if (ha) { [[46, 104], [50, 107], [54, 104], [48, 109.5], [52, 109.5]].forEach(function (q) { H.tron(g, q[0], q[1], 1.6); H.to(g, c[0]); }); }
    H.duong(g, 'M50 90 V' + dau); H.vien(g, BM.vecVien, 6.5); H.duong(g, 'M50 90 V' + dau); H.vien(g, BM.vecTim, 3);
    H.duong(g, 'M37 75 H63 L55 93 H45 Z'); H.to(g, BM.vecVo); H.vien(g, BM.vecVien, 2);
    H.duong(g, 'M42 78.5 H58 L55 86 H45 Z'); g.fillStyle = H.gradDoc(g, 0, 78.5, 0, 86, [[0, c[1]], [1, c[2]]]); g.fill();
    H.tron(g, 47, 81.5, 1.2); H.to(g, c[0]); H.tron(g, 51, 83.5, 1.2); H.to(g, c[0]); H.tron(g, 54, 80.8, 1.2); H.to(g, c[0]);
    H.duong(g, 'M45 ' + (dau - 1) + ' H55 L53 ' + (dau + 4) + ' H47 Z'); H.to(g, c[0]); H.vien(g, BM.vecVien, 2.2);
  } });
  /* LOA KÈN vector (mã 'loa'; note / beat; mùa Hang động & Mùa cuối Về CLB): đế khớp ở mũi xe, bầu cộng hưởng tròn, cổ kèn uốn cong và miệng loa bầu tròn 3D loe về phía trước (+y).
     Khi s.bat = true (đang phát âm): thân loa & vành miệng loa phồng tròn căng hơn theo pha s.pha, lòng loa + côn loa ở tâm sáng rực màu nốt s.notLoa (1..8 hoặc 'x' = trống),
     kèm 3 vòng sóng âm tròn đồng tâm lan tỏa mượt phía trước miệng loa. */
  var MAU_NOT = { 1: BM.vecDo, 2: BM.vecVanNong, 3: BM.vecVang, 4: BM.vecXanhLa, 5: BM.vecNgoc, 6: BM.vecCong1, 7: BM.vecCong2, 8: BM.vecHong, x: BM.vecSat };
  V.dangKy({ loai: 'tay', ma: 'loa', hamGoc: ['note', 'beat'], ten: 'Loa kèn', gan: 'tay', diemNeo: { x: 50, y: 80 }, MAU_NOT: MAU_NOT, ve: function (g, s, M, H) {
    s = s || {};
    var bat = !!s.bat, pha = typeof s.pha === 'number' ? Math.max(0, Math.min(1, s.pha)) : 0, nhip = bat ? Math.sin(pha * Math.PI * 2) : 0;
    var m = MAU_NOT[s.notLoa] || BM.vecVang, laTrong = s.notLoa === 'x';
    var yM = bat ? 91.6 + 0.3 * nhip : 92, rxM = bat ? 11.6 + 0.6 * nhip : 10.6, ryM = bat ? 6.8 + 0.5 * nhip : 3.6, phinh = bat ? 2.2 + 0.5 * nhip : 0;
    /* khi phát âm: 3 vòng cung sóng âm TRÒN đồng tâm tỏa ra từ phía trước vành loa (vẽ dưới vành loa để không đè lên lòng loa) */
    if (bat) {
      [0, 1, 2].forEach(function (k) {
        var tW = (k + pha) / 3, rW = 8.6 + tW * 8.6;
        g.beginPath(); g.arc(50, yM + 0.6, rW, Math.PI * 0.16, Math.PI * 0.84);
        H.vien(g, m, laTrong ? 2.5 - tW * 0.7 : 2.2 - tW * 0.5);
      });
      if (laTrong) {
        H.duong(g, 'M35.5 ' + (yM + 6.5) + ' L38.5 ' + (yM + 8.5) + ' M64.5 ' + (yM + 6.5) + ' L61.5 ' + (yM + 8.5));
        H.vien(g, BM.vecVo, 1.7);
      } else {
        H.tron(g, 37.5 - pha * 1.8, yM + 6.2 + pha * 1.8, 1.35); H.to(g, m);
        H.tron(g, 62.5 + pha * 1.8, yM + 6.2 + pha * 1.8, 1.35); H.to(g, m);
      }
    }
    /* đế khớp mũi xe + bầu cộng hưởng âm thanh bo tròn */
    H.bo(g, 36.5, 75.5, 27, 8, 4); H.to(g, BM.vecKhop); H.vien(g, BM.vecVien, 2.3);
    H.elip(g, 50, 81.8, bat ? 9.8 + 0.4 * nhip : 9, bat ? 4.6 + 0.3 * nhip : 4); H.to(g, BM.vecDe); H.vien(g, BM.vecVien, 2.2);
    /* cổ loa uốn cong + bầu thân loa phồng tròn căng khi phát âm */
    H.duong(g, 'M43.2 83.2 C' + (42 - phinh) + ' 86.8 ' + (50 - rxM) + ' ' + (yM - 2.5) + ' ' + (50 - rxM) + ' ' + yM +
      ' L' + (50 + rxM) + ' ' + yM + ' C' + (50 + rxM) + ' ' + (yM - 2.5) + ' ' + (58 + phinh) + ' 86.8 56.8 83.2 Z');
    g.fillStyle = H.gradDoc(g, 0, 83, 0, yM, [[0, BM.vecVangToi], [0.45, BM.vecVang], [1, BM.vecVangSang]]);
    g.fill(); H.vien(g, BM.vecVien, 2.3);
    H.tron(g, 50, 81.5, bat ? 2.6 + 0.25 * nhip : 2.1); H.to(g, bat ? m : BM.vecThepSang); H.vien(g, BM.vecVien, 1.2);
    /* vành miệng loa bầu tròn (khi phát âm mở tròn đầy đặn ryM = 6.8) + lòng loa tròn sâu + côn loa tròn ở tâm */
    H.elip(g, 50, yM, rxM, ryM);
    g.fillStyle = H.gradDoc(g, 0, yM - ryM, 0, yM + ryM, [[0, BM.vecVangSang], [1, BM.vecVang]]);
    g.fill(); H.vien(g, BM.vecVien, 2.3);
    H.elip(g, 50, yM + 0.2, rxM - 2.4, Math.max(1.6, ryM - 1.7)); H.to(g, BM.vecLoi); H.vien(g, bat ? m : BM.vecVangToi, 1.5);
    H.elip(g, 50, yM, bat ? 3.8 + 0.35 * nhip : 2.8, bat ? 2.8 + 0.3 * nhip : 1.3); H.to(g, bat ? m : BM.vecVangSang); H.vien(g, BM.vecVien, 1.3);
    if (bat) { H.tron(g, 49, yM - 0.5, 0.95); H.to(g, BM.vecVo); }
  } });
})(typeof window !== 'undefined' ? window : globalThis);
