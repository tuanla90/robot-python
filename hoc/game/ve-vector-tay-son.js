var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ve-vector-tay-son.js — ĐẦU SƠN CÓ CHỔI vector (gói V3, mã 'son' như part-son.js; ink / dot / pen_down / pen_up): đế trắng ở mũi, LON SƠN tròn vỏ trắng, ruột mang màu
   đang chọn (s.mauSon 'red' | 'green' | 'blue' | 'yellow', mặc định đỏ — màu luật luatSon*, như bộ pixel), cổ ống / VÒI tím, CHỔI ở đầu thấm sơn.
   s.tuThe 'duoi' (pen_down): chổi duỗi dài chạm sàn + vệt sơn loang dưới đầu chổi; không thì đang nhấc (chổi ngắn). Sơn tô ô XE ĐANG ĐỨNG: luật ở san-hoc.js. */
(function (root) {
  var V = root.VeVector || (typeof module === 'object' && require('./ve-vector.js'));
  var MAU = { red: ['luatSonDo', 'luatSonDoSang', 'luatSonDoToi'], green: ['luatSonXanhLa', 'luatSonXanhLaSang', 'luatSonXanhLaToi'], blue: ['luatSonXanhDuong', 'luatSonXanhDuongSang', 'luatSonXanhDuongToi'], yellow: ['luatSonVang', 'luatSonVangSang', 'luatSonVangToi'] };
  V.dangKy({ loai: 'tay', ma: 'son', ten: 'Đầu sơn có chổi', gan: 'tay', diemNeo: { x: 50, y: 80 }, MAU_SON: MAU, ve: function (g, s, M, H) {
    s = s || {};
    var k = MAU[s.mauSon] || MAU.red, c = [BM[k[0]], BM[k[1]], BM[k[2]]], ha = s.tuThe === 'duoi', dau = ha ? 101 : 96;
    H.bo(g, 37, 76, 26, 10, 5); H.to(g, BM.vecKhop); H.vien(g, BM.vecVien, 2.5);
    if (ha) { H.elip(g, 50, 106, 10, 4); g.globalAlpha = 0.75; H.to(g, c[0]); g.globalAlpha = 1; }
    H.duong(g, 'M50 88 V' + dau); H.vien(g, BM.vecVien, 6.5); H.duong(g, 'M50 88 V' + dau); H.vien(g, BM.vecTim, 3);
    H.tron(g, 50, 85, 7.5); g.fillStyle = H.gradVo(g, 42.5, 77.5, 15, 15); g.fill(); H.vien(g, BM.vecVien, 2.5);
    H.tron(g, 50, 85, 4.5); g.fillStyle = H.gradDoc(g, 0, 80.5, 0, 89.5, [[0, c[1]], [1, c[2]]]); g.fill();
    H.bo(g, 43.5, dau - 1, 13, 7, 3.5); H.to(g, c[0]); H.vien(g, BM.vecVien, 2.2);
    H.duong(g, 'M46.5 ' + (dau + 1.5) + ' H53.5'); H.vien(g, c[1], 1.6);
  } });
})(typeof window !== 'undefined' ? window : globalThis);
