var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ve-vector-than-drone.js — THÂN DRONE vector (gói V3), cùng gia đình thân A: thân giữa trắng bo góc lớn có kính + hai mắt màu đội và chấm ăng-ten màu đội,
   khung chữ X (thanh chàm lõi tím nhạt) tới bốn cánh quạt (vành trắng, đĩa tối, cánh cyan).
   DRONE KHÔNG CÓ HƯỚNG MẶT (luật part.js / san-hoc.js: bay bốn hướng, không quay): khongHuong → VeVector.robot không xoay (hướng nào cũng một hình, theo màn hình,
   như bộ pixel luôn hướng 0); bongRieng → không có bóng đổ trong hình: san-ve.js vẽ bóng ở mặt ô theo độ cao bay ALT (veDuoiDrone), còn hình drone nâng lên v.hop.
   Hệ 100 × 100 theo MÀN HÌNH (trên = trên), tâm (50, 56). Ổ (như part-drone.js): hongTrai (8, 56) bên TRÁI màn hình / hongPhai (92, 56) bên phải, giữa hai hàng cánh;
   duoi (50, 70) dưới bụng (nam châm treo); tren (50, 44); bung (50, 23) mép trên giữa hai cánh trên (camera nhìn xuống). dinh = 14: đỉnh hình (thanh pin của san-ve.js).
   Trạng thái s: quat (cánh quay; false = nằm đất, cánh đứng), buoc (0 | 1) pha cánh (đổi chữ + / ×), doc (đang đo pin battery(): mắt sáng rực). */
(function (root) {
  var V = root.VeVector || (typeof module === 'object' && require('./ve-vector.js'));
  var CANH = [[22, 29], [78, 29], [22, 83], [78, 83]];
  function quat(g, H, cx, cy, quay, pha) {
    H.tron(g, cx, cy, 13); g.fillStyle = H.gradVo(g, cx - 13, cy - 13, 26, 26); g.fill(); H.vien(g, BM.vecVien, 3);
    H.tron(g, cx, cy, 9); H.to(g, BM.vecDe); H.vien(g, BM.vecVien, 1.5);
    if (quay) { H.tron(g, cx, cy, 8); g.globalAlpha = 0.45; H.to(g, BM.vecQuat); g.globalAlpha = 1; }
    g.beginPath();
    if (pha) { g.moveTo(cx - 6, cy - 6); g.lineTo(cx + 6, cy + 6); g.moveTo(cx - 6, cy + 6); g.lineTo(cx + 6, cy - 6); }
    else { g.moveTo(cx - 8, cy); g.lineTo(cx + 8, cy); g.moveTo(cx, cy - 8); g.lineTo(cx, cy + 8); }
    H.vien(g, quay ? BM.vecDen : BM.vecBacToi, 3.5);
    H.tron(g, cx, cy, 2.6); H.to(g, BM.vecVo); H.vien(g, BM.vecVien, 1.5);
  }
  V.dangKy({ loai: 'than', ma: 'drone', ten: 'Thân drone', khongHuong: true, bongRieng: true, dinh: 14,
    oGan: { hongTrai: { x: 8, y: 56 }, hongPhai: { x: 92, y: 56 }, duoi: { x: 50, y: 70 }, tren: { x: 50, y: 44 }, bung: { x: 50, y: 23 } }, ve: function (g, s, M, H) {
    s = s || {};
    var quay = s.quat !== false, pha = s.buoc ? 1 : 0;
    H.duong(g, 'M36 42 L22 29 M64 42 L78 29 M36 70 L22 83 M64 70 L78 83'); H.vien(g, BM.vecVien, 8);
    H.duong(g, 'M36 42 L22 29 M64 42 L78 29 M36 70 L22 83 M64 70 L78 83'); H.vien(g, BM.vecVoGhep, 3.6);
    CANH.forEach(function (c) { quat(g, H, c[0], c[1], quay, pha); });
    H.bo(g, 31, 38, 38, 36, 15); g.fillStyle = H.gradVo(g, 31, 38, 38, 36); g.fill(); H.vien(g, BM.vecVien, 3.5);
    H.duong(g, 'M39 43 C37 50 37 57 39 63 M61 43 C63 50 63 57 61 63'); H.vien(g, BM.vecVoGhep, 2.2);
    H.kinh(g, M, 35, 53, 30, 13, { sang: !!s.doc, mat: s.mat });         // gói V4: mắt biểu cảm (s.mat) như mọi thân
    H.angTen(g, M, 50, 39, 33, 3.8);
  } });
})(typeof window !== 'undefined' ? window : globalThis);
