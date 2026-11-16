var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ve-vector-tay-nam-cham.js — NAM CHÂM CHỮ U vector (gói V3, mã 'nam-cham' như part-nam-cham.js): đế trắng ở mũi, chữ U bạc viền chàm MỞ VỀ PHÍA TRƯỚC, hai đầu cực:
   cực N = hai đầu đỏ, cực S = hai đầu xanh dương (màu luật luatVat*, như vật nam châm); chưa khai cực = bên trái xe xanh dương, bên phải đỏ (như bộ pixel).
   s.bat (đang hút): hai gợn từ trường trước miệng U theo màu cực (chưa khai cực: cyan).
   Gắn hai kiểu (gan ['tay', 'duoi']): ổ 'tay' ở mũi xe — diemNeo (50, 80) như tay kẹp; ổ 'duoi' dưới bụng DRONE (s.duoi, diemNeoDuoi (50, 50)): dây cáp ngắn + chữ U nhỏ
   mở xuống (hệ màn hình: drone không xoay), gợn từ trường dưới U. Vật hút / treo do san-ve.js vẽ (veVatTu, veDuoiDrone).
   NAM CHÂM BỤNG NHỆN (P1 mùa 3, 29/10; s.duoi + s.than 'nhen', chỗ treo oTayDuoi (50, 42) = giữa vỏ phía đuôi, dưới dải mắt; vẽ quanh điểm neo (50, 50) nên đĩa nằm đúng oTayDuoi): ĐĨA nam châm tròn nhìn từ trên
   (đế trắng viền chàm, vành bạc, lõi tròn màu cực: N đỏ / S xanh dương / chưa khai: nửa đỏ nửa xanh), đè lên giữa vỏ nhện như nam châm treo của drone đè lên thân drone;
   s.bat: vòng gợn từ trường quanh đĩa theo màu cực. Thân nhện và nam châm bụng luôn đứng thẳng theo màn hình (thanDung, 3/11), hướng nào cũng vậy. Vật dính do san-ve.js vẽ dưới thân (veDuoiNhen). */
(function (root) {
  var V = root.VeVector || (typeof module === 'object' && require('./ve-vector.js'));
  function mauCuc(cuc, ben) { return cuc === 'N' ? BM.luatVatDo : cuc === 'S' ? BM.luatVatXanhDuong : (ben === 'trai' ? BM.luatVatXanhDuong : BM.luatVatDo); }
  function mauSang(cuc, ben) { return cuc === 'N' ? BM.luatVatDoSang : cuc === 'S' ? BM.luatVatXanhDuongSang : (ben === 'trai' ? BM.luatVatXanhDuongSang : BM.luatVatDoSang); }
  function mauTu(cuc) { return cuc === 'N' ? BM.luatVatDo : cuc === 'S' ? BM.luatVatXanhDuong : BM.vecDen; }
  function rgbTu(cuc) { return cuc === 'N' ? BM.tiaDoRgb : cuc === 'S' ? BM.tiaLamRgb : BM.tiaXanhLoRgb; }
  /* chữ U: hai nhánh từ y0 (đáy cong) tới y1 (đầu cực), nửa bề rộng w; trai = nhánh x lớn (mặt quay xuống: bên trái xe là phía x lớn).
     Khi bật (bat) hoặc có cực: hào quang màu cực tỏa quanh chữ U, cả 2 thanh màu chuyển hẳn sang ĐỎ (cực N) hoặc XANH DƯƠNG (cực S) kèm lõi sáng dọc thân. */
  function chuU(g, H, cuc, bat, y0, y1, w, day, xTrai) {
    var d = 'M' + (50 - w) + ' ' + y1 + ' V' + (y0 + w) + ' C' + (50 - w) + ' ' + (y0 - w * 0.35) + ' ' + (50 + w) + ' ' + (y0 - w * 0.35) + ' ' + (50 + w) + ' ' + (y0 + w) + ' V' + y1;
    var coCuc = cuc === 'N' || cuc === 'S';
    if (bat) {
      var cy = (y0 + y1) * 0.5, rk = w + day * 0.72;
      H.tron(g, 50, cy, rk); g.fillStyle = H.gradToa(g, 50, cy, rk, [[0, H.rgba(rgbTu(cuc), 0.62)], [0.6, H.rgba(rgbTu(cuc), 0.25)], [1, H.rgba(rgbTu(cuc), 0)]]); g.fill();
      H.duong(g, d); H.vien(g, H.rgba(rgbTu(cuc), 0.48), day + 7.2, 'butt');
    }
    H.duong(g, d); H.vien(g, BM.vecVien, day + 4, 'butt');
    H.duong(g, d); H.vien(g, coCuc ? mauCuc(cuc) : BM.vecBac, day, 'butt');
    if (coCuc) { H.duong(g, d); H.vien(g, mauSang(cuc), day * 0.38, 'butt'); }
    var dau = Math.round((y1 - y0) * 0.68);
    [[50 - w, xTrai ? 'phai' : 'trai'], [50 + w, xTrai ? 'trai' : 'phai']].forEach(function (q) {
      if (!coCuc) {
        g.beginPath(); g.rect(q[0] - day / 2, y1 - dau, day, dau); g.closePath(); H.to(g, mauCuc(cuc, q[1])); H.vien(g, BM.vecVien, 1.6, 'butt');
      } else {
        g.beginPath(); g.rect(q[0] - day * 0.26, y1 - dau + 1, day * 0.52, Math.max(2, dau - 2)); g.closePath(); H.to(g, mauSang(cuc, q[1]));
      }
    });
  }
  function gon(g, H, cuc, cy, r1, r2) {
    [r1, r2].forEach(function (r, idx) {
      g.beginPath(); g.arc(50, cy, r, Math.PI * 0.22, Math.PI * 0.78); H.vien(g, H.rgba(rgbTu(cuc), idx ? 0.38 : 0.52), 3.0);
      g.beginPath(); g.arc(50, cy, r, Math.PI * 0.24, Math.PI * 0.76); H.vien(g, mauTu(cuc), 1.8);
      g.beginPath(); g.arc(50, cy, r, Math.PI * 0.32, Math.PI * 0.68); H.vien(g, mauSang(cuc), 0.9);
    });
  }
  V.dangKy({ loai: 'tay', ma: 'nam-cham', hamGoc: ['magnet_n',  'magnet_s',  'magnet_off'], ten: 'Nam châm chữ U trước mũi', gan: ['tay', 'duoi'], diemNeo: { x: 50, y: 80 }, diemNeoDuoi: { x: 50, y: 50 }, ve: function (g, s, M, H) {
    s = s || {};
    if (s.duoi && s.than === 'nhen') {                                       // NAM CHÂM BỤNG NHỆN (mùa 3): cụm nam châm elip 3D gắn DƯỚI GẦM BỤNG nhện (sát dưới đáy vỏ y = 71, giữa 2 chân gần; dịch d.y = -8 nên cy = 84 → y_thân = 76)
      var cy = 84, cuc = s.cuc;
      if (s.bat) {
        H.elip(g, 50, cy + 1.5, 16.5, 9.5); g.fillStyle = H.gradToa(g, 50, cy + 1.5, 16.5, [[0, H.rgba(rgbTu(cuc), 0.68)], [0.65, H.rgba(rgbTu(cuc), 0.28)], [1, H.rgba(rgbTu(cuc), 0)]]); g.fill();
        H.elip(g, 50, cy + 1.2, 12.6, 7.2); H.vien(g, mauTu(cuc), 2.2);
        H.elip(g, 50, cy + 1.5, 15.2, 8.6); H.vien(g, mauSang(cuc), 1.3);
      }
      H.bo(g, 43, cy - 6.8, 14, 5.5, 2); H.to(g, BM.vecKhop); H.vien(g, BM.vecVien, 2.0);
      H.elip(g, 50, cy, 10.2, 6.0); H.to(g, BM.vecKhop); H.vien(g, BM.vecVien, 2.3);
      H.elip(g, 50, cy + 0.3, 7.6, 4.4); H.to(g, s.bat && (cuc === 'N' || cuc === 'S') ? mauSang(cuc) : BM.vecBac); H.vien(g, BM.vecVien, 1.4);
      if (cuc === 'N' || cuc === 'S') { H.elip(g, 50, cy + 0.5, 5.2, 3.0); H.to(g, mauCuc(cuc)); }
      else {                                                                 // chưa khai cực: nửa trái xanh dương, nửa phải đỏ
        g.beginPath(); g.ellipse(50, cy + 0.5, 5.2, 3.0, 0, Math.PI / 2, Math.PI * 3 / 2); g.closePath(); H.to(g, BM.luatVatXanhDuong);
        g.beginPath(); g.ellipse(50, cy + 0.5, 5.2, 3.0, 0, -Math.PI / 2, Math.PI / 2); g.closePath(); H.to(g, BM.luatVatDo);
      }
      H.elip(g, 50, cy + 0.5, 5.2, 3.0); H.vien(g, BM.vecVien, 1.2);
      H.tron(g, 50, cy + 0.5, 1.6); H.to(g, s.bat ? BM.vecVo : BM.vecDe);
      return;
    }
    if (s.duoi) {                                                            // treo dưới bụng drone (hệ màn hình)
      H.duong(g, 'M50 49 V58'); H.vien(g, BM.vecVien, 4.5); H.duong(g, 'M50 49 V58'); H.vien(g, BM.vecBacToi, 2);
      chuU(g, H, s.cuc, !!s.bat, 58, 70, 7, 5, false);
      if (s.bat) gon(g, H, s.cuc, 70, 4, 8);
      return;
    }
    /* Khi gắn ở ĐẦU nhện (s.than === 'nhen' && !s.duoi): đáy thân chuẩn R1 của nhện đứng ở y = 71 (dịch d.y = +1 từ oGan.tay = 81),
       nên lùi lên -9 đơn vị để đế nam châm chữ U (y = 76..86 → 68..78) ôm khít ngay mép đầu thân nhện dưới dải kính y như robot thường */
    var laDauNhen = s.than === 'nhen';
    if (laDauNhen) { g.save(); g.translate(0, -9); }
    H.bo(g, 37, 76, 26, 10, 5); H.to(g, BM.vecKhop); H.vien(g, BM.vecVien, 2.5);
    chuU(g, H, s.cuc, !!s.bat, 86, 104, 11, 7, true);
    H.bo(g, 41, 78.2, 18, 5.6, 2.8); H.to(g, s.bat ? mauTu(s.cuc) : (s.cuc ? mauCuc(s.cuc) : BM.vecDe)); H.vien(g, BM.vecVien, 1.2);
    if (s.bat) { H.bo(g, 44, 79.6, 12, 2.8, 1.4); H.to(g, mauSang(s.cuc)); gon(g, H, s.cuc, 103, 4.2, 7.6); }
    if (laDauNhen) g.restore();
  } });
})(typeof window !== 'undefined' ? window : globalThis);
