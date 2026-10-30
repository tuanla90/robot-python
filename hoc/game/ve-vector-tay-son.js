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
})(typeof window !== 'undefined' ? window : globalThis);
