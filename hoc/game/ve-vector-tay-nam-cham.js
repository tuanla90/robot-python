var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ve-vector-tay-nam-cham.js — NAM CHÂM CHỮ U vector (gói V3, mã 'nam-cham' như part-nam-cham.js): đế trắng ở mũi, chữ U bạc viền chàm MỞ VỀ PHÍA TRƯỚC, hai đầu cực:
   cực N = hai đầu đỏ, cực S = hai đầu xanh dương (màu luật luatVat*, như vật nam châm); chưa khai cực = bên trái xe xanh dương, bên phải đỏ (như bộ pixel).
   s.bat (đang hút): hai gợn từ trường trước miệng U theo màu cực (chưa khai cực: cyan).
   Gắn hai kiểu (gan ['tay', 'duoi']): ổ 'tay' ở mũi xe — diemNeo (50, 80) như tay kẹp; ổ 'duoi' dưới bụng DRONE (s.duoi, diemNeoDuoi (50, 50)): dây cáp ngắn + chữ U nhỏ
   mở xuống (hệ màn hình: drone không xoay), gợn từ trường dưới U. Vật hút / treo do san-ve.js vẽ (veVatTu, veDuoiDrone). */
(function (root) {
  var V = root.VeVector || (typeof module === 'object' && require('./ve-vector.js'));
  function mauCuc(cuc, ben) { return cuc === 'N' ? BM.luatVatDo : cuc === 'S' ? BM.luatVatXanhDuong : (ben === 'trai' ? BM.luatVatXanhDuong : BM.luatVatDo); }
  function mauTu(cuc) { return cuc === 'N' ? BM.luatVatDo : cuc === 'S' ? BM.luatVatXanhDuong : BM.vecDen; }
  /* chữ U: hai nhánh từ y0 (đáy cong) tới y1 (đầu cực), nửa bề rộng w; trai = nhánh x lớn (mặt quay xuống: bên trái xe là phía x lớn) */
  function chuU(g, H, cuc, y0, y1, w, day, xTrai) {
    var d = 'M' + (50 - w) + ' ' + y1 + ' V' + (y0 + w) + ' C' + (50 - w) + ' ' + (y0 - w * 0.35) + ' ' + (50 + w) + ' ' + (y0 - w * 0.35) + ' ' + (50 + w) + ' ' + (y0 + w) + ' V' + y1;
    H.duong(g, d); H.vien(g, BM.vecVien, day + 4, 'butt');
    H.duong(g, d); H.vien(g, BM.vecBac, day, 'butt');
    var dau = Math.min(7, (y1 - y0) * 0.4);
    [[50 - w, xTrai ? 'phai' : 'trai'], [50 + w, xTrai ? 'trai' : 'phai']].forEach(function (q) {
      g.beginPath(); g.rect(q[0] - day / 2, y1 - dau, day, dau); g.closePath(); H.to(g, mauCuc(cuc, q[1])); H.vien(g, BM.vecVien, 1.6, 'butt');
    });
  }
  function gon(g, H, cuc, cy, r1, r2) {
    [r1, r2].forEach(function (r) { g.beginPath(); g.arc(50, cy, r, Math.PI * 0.2, Math.PI * 0.8); H.vien(g, mauTu(cuc), 2.2); });
  }
  V.dangKy({ loai: 'tay', ma: 'nam-cham', hamGoc: ['magnet_n',  'magnet_s',  'magnet_off'], ten: 'Nam châm chữ U trước mũi', gan: ['tay', 'duoi'], diemNeo: { x: 50, y: 80 }, diemNeoDuoi: { x: 50, y: 50 }, ve: function (g, s, M, H) {
    s = s || {};
    if (s.duoi) {                                                            // treo dưới bụng drone (hệ màn hình)
      H.duong(g, 'M50 49 V58'); H.vien(g, BM.vecVien, 4.5); H.duong(g, 'M50 49 V58'); H.vien(g, BM.vecBacToi, 2);
      chuU(g, H, s.cuc, 58, 70, 7, 5, false);
      if (s.bat) gon(g, H, s.cuc, 70, 4, 8);
      return;
    }
    H.bo(g, 37, 76, 26, 10, 5); H.to(g, BM.vecKhop); H.vien(g, BM.vecVien, 2.5);
    chuU(g, H, s.cuc, 86, 104, 11, 7, true);
    H.tron(g, 50, 81, 2.6); H.to(g, s.bat ? mauTu(s.cuc) : BM.vecDen);
    if (s.bat) gon(g, H, s.cuc, 102, 4, 8);
  } });
})(typeof window !== 'undefined' ? window : globalThis);
