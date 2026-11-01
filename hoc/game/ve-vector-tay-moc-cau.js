var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ve-vector-tay-moc-cau.js — TAY MÓC CẨU 'moc-cau' (Cảng sông, mùa 4, 31/10; hoc/KE-HOACH-MUA-CANG-SONG.md mục 3.3) + hàm vẽ móc dùng chung.
   Tay (ổ 'tay' của thân cẩu = đầu đoạn cần ngắn): tời cáp + cáp + móc. s.doi = nâng cấp móc đôi (khung ngang hai móc). s.trenCan: veBeCau gọi (cần thật do veCanCau
   vẽ, móc ở đầu cần) → chỉ vẽ tời. hamGoc: pick_up, set_down (gốc gói 2) + pick_up2 (nâng cấp gói 6) — đặc tả ghi hook / unhook nhưng mùa 3 đã dạy trẻ tự đặt hàm hook() (san-hoc.js phần CẢNG SÔNG, 31/10).
   HÀM: VeVector.veMocCau(g, x, y, r, doi)  móc tại (x, y) cỡ r (đơn vị của g hiện tại: px sân, hay hệ 100): móc đơn chữ J vàng dưới khối puli;
        doi: khung ngang + hai móc. veCanCau (ve-vector-than-cau.js) gọi ở đầu cần. */
(function (root) {
  var V = root.VeVector || (typeof module === 'object' && require('./ve-vector.js'));
  var H = V.H;
  function mocDon(g, x, y, r) {
    /* khối ròng rọc (puli) công nghiệp có ốp cảnh báo vàng và trục thép */
    H.bo(g, x - r * 0.48, y - r * 0.58, r * 0.96, r * 0.74, r * 0.22); H.to(g, BM.vecThepToi); H.vien(g, BM.vecVien, Math.max(0.9, r * 0.15));
    H.bo(g, x - r * 0.34, y - r * 0.42, r * 0.68, r * 0.32, r * 0.1); H.to(g, BM.vecCanhBao);
    H.tron(g, x, y - r * 0.16, r * 0.14); H.to(g, BM.vecSat);
    /* móc thép chữ J rèn 3D dưới cổ xoay */
    g.beginPath(); g.moveTo(x, y + r * 0.12); g.lineTo(x, y + r * 0.54); g.arc(x - r * 0.3, y + r * 0.54, r * 0.32, 0, Math.PI, false); g.lineTo(x - r * 0.62, y + r * 0.36);
    H.vien(g, BM.vecVien, Math.max(1.3, r * 0.36)); H.vien(g, BM.vecCanhBao, Math.max(0.8, r * 0.2));
  }
  function veMocCau(g, x, y, r, doi) {
    if (!doi) { mocDon(g, x, y, r); return; }
    /* dầm ngang móc đôi (spreader beam) */
    H.bo(g, x - r * 1.25, y - r * 0.78, r * 2.5, r * 0.44, r * 0.16); H.to(g, BM.vecVang); H.vien(g, BM.vecVien, Math.max(0.9, r * 0.13));
    H.bo(g, x - r * 0.35, y - r * 0.85, r * 0.7, r * 0.58, r * 0.14); H.to(g, BM.vecThepToi); H.vien(g, BM.vecVien, Math.max(0.8, r * 0.12));
    mocDon(g, x - r * 0.72, y + r * 0.1, r * 0.82); mocDon(g, x + r * 0.72, y + r * 0.1, r * 0.82);
  }
  V.veMocCau = veMocCau;

  V.dangKy({
    loai: 'tay', ma: 'moc-cau', hamGoc: ['pick_up', 'set_down', 'pick_up2'], ten: 'Móc cẩu', gan: 'tay', diemNeo: { x: 50, y: 82 },
    ve: function (g, s, M, H) {
      s = s || {};
      /* cụm tời cáp thép có tang cuốn dây cáp bạc */
      H.bo(g, 39.5, 73.5, 21, 9.5, 3); H.to(g, BM.vecThepToi); H.vien(g, BM.vecVien, 2.2);
      H.bo(g, 42.5, 75.5, 15, 5.5, 1.8); H.to(g, BM.vecBacToi); H.vien(g, BM.vecVien, 1.3);
      g.beginPath(); g.moveTo(46, 75.8); g.lineTo(46, 80.8); g.moveTo(50, 75.8); g.lineTo(50, 80.8); g.moveTo(54, 75.8); g.lineTo(54, 80.8);
      H.vien(g, BM.vecThepToi, 1.2);
      if (s.trenCan) return;
      g.beginPath(); g.moveTo(50, 83); g.lineTo(50, 86.2); H.vien(g, BM.vecVien, 2.6); H.vien(g, BM.vecBac, 1.2);
      veMocCau(g, 50, 87.5, 6.4, !!s.doi);
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
