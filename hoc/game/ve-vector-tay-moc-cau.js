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
    H.bo(g, x - r * 0.45, y - r * 0.55, r * 0.9, r * 0.7, r * 0.2); H.to(g, BM.vecThepToi); H.vien(g, BM.vecVien, Math.max(0.8, r * 0.14));      // khối puli
    g.beginPath(); g.moveTo(x, y + r * 0.1); g.lineTo(x, y + r * 0.55); g.arc(x - r * 0.3, y + r * 0.55, r * 0.3, 0, Math.PI, false); g.lineTo(x - r * 0.6, y + r * 0.4);
    H.vien(g, BM.vecVien, Math.max(1.2, r * 0.34)); H.vien(g, BM.vecCanhBao, Math.max(0.7, r * 0.18));
  }
  function veMocCau(g, x, y, r, doi) {
    if (!doi) { mocDon(g, x, y, r); return; }
    H.bo(g, x - r * 1.2, y - r * 0.75, r * 2.4, r * 0.4, r * 0.15); H.to(g, BM.vecThep); H.vien(g, BM.vecVien, Math.max(0.8, r * 0.12));         // khung ngang
    mocDon(g, x - r * 0.7, y + r * 0.1, r * 0.8); mocDon(g, x + r * 0.7, y + r * 0.1, r * 0.8);
  }
  V.veMocCau = veMocCau;

  V.dangKy({
    loai: 'tay', ma: 'moc-cau', hamGoc: ['pick_up', 'set_down', 'pick_up2'], ten: 'Móc cẩu', gan: 'tay', diemNeo: { x: 50, y: 82 },
    ve: function (g, s, M, H) {
      s = s || {};
      H.bo(g, 41, 75, 18, 10, 3); H.to(g, BM.vecThepToi); H.vien(g, BM.vecVien, 2.2);                                    // tời cáp
      g.beginPath(); g.moveTo(43, 80); g.lineTo(57, 80); H.vien(g, BM.vecBacToi, 2.5, 'butt');
      if (s.trenCan) return;
      g.beginPath(); g.moveTo(50, 85); g.lineTo(50, 88); H.vien(g, BM.vecVien, 2.4);
      veMocCau(g, 50, 90, 7, !!s.doi);
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
