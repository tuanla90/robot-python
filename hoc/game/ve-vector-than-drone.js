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
  var CANH = [[18.5, 25.5, 1], [81.5, 25.5, -1], [18.5, 85.5, -1], [81.5, 85.5, 1]];
  function quat(g, H, cx, cy, quay, pha, chieu) {
    H.tron(g, cx, cy, 13.2); g.fillStyle = H.gradVo(g, cx - 13.2, cy - 13.2, 26.4, 26.4); g.fill(); H.vien(g, BM.vecVien, 2.8);
    H.tron(g, cx, cy, 9.8); H.to(g, BM.vecDe); H.vien(g, BM.vecVien, 1.6);
    H.tron(g, cx, cy, 5.2); H.to(g, BM.vecDeSang);
    if (quay) { H.tron(g, cx, cy, 8.6); g.globalAlpha = 0.45; H.to(g, BM.vecQuat); g.globalAlpha = 1; }
    g.save();
    g.translate(cx, cy);
    g.rotate((pha ? Math.PI / 4 : 0) + chieu * 0.22);
    if (quay) {
      g.beginPath(); g.arc(0, 0, 7.2, 0.35, 1.25); H.vien(g, BM.vecDenSang, 1.5);
      g.beginPath(); g.arc(0, 0, 7.2, Math.PI + 0.35, Math.PI + 1.25); H.vien(g, BM.vecDenSang, 1.5);
    }
    H.bo(g, -8.4, -1.7, 16.8, 3.4, 1.6); H.to(g, quay ? BM.vecDen : BM.vecBacToi); H.vien(g, BM.vecVien, 1.5);
    H.bo(g, -1.7, -8.4, 3.4, 16.8, 1.6); H.to(g, quay ? BM.vecDenSang : BM.vecBac); H.vien(g, BM.vecVien, 1.5);
    g.restore();
    H.tron(g, cx, cy, 3.0); H.to(g, BM.vecVo); H.vien(g, BM.vecVien, 1.6);
    H.tron(g, cx, cy, 1.1); H.to(g, quay ? BM.vecDen : BM.vecBacToi);
  }
  V.dangKy({ loai: 'than', ma: 'drone', hamGoc: ['go_up',  'go_down',  'go_left',  'go_right',  'wait',  'battery',  'land',  'take_off'], ten: 'Thân drone', khongHuong: true, bongRieng: true, dinh: 14,
    oGan: { hongTrai: { x: 31, y: 46 }, hongPhai: { x: 69, y: 46 }, duoi: { x: 50, y: 70 }, tren: { x: 50, y: 44 }, bung: { x: 50, y: 36 } }, vo: { x: 28, y: 35, w: 44, h: 42 }, ve: function (g, s, M, H) {
    s = s || {};
    var quay = s.quat !== false, pha = s.buoc ? 1 : 0;
    H.duong(g, 'M35 42 L18.5 25.5 M65 42 L81.5 25.5 M35 70 L18.5 85.5 M65 70 L81.5 85.5'); H.vien(g, BM.vecVien, 9.2);
    H.duong(g, 'M35 42 L18.5 25.5 M65 42 L81.5 25.5 M35 70 L18.5 85.5 M65 70 L81.5 85.5'); H.vien(g, BM.vecSat, 4.6);
    H.duong(g, 'M31.5 38.5 L24.5 31.5 M68.5 38.5 L75.5 31.5 M31.5 73.2 L24.5 79.8 M68.5 73.2 L75.5 79.8'); H.vien(g, BM.vecDen, 1.8);
    CANH.forEach(function (c) { quat(g, H, c[0], c[1], quay, pha, c[2]); });
    H.bo(g, 28, 35, 44, 42, 13.5); g.fillStyle = H.gradVo(g, 28, 35, 44, 42); g.fill(); H.vien(g, BM.vecVien, 3.5);
    H.duong(g, 'M38 41.5 C36.2 49 36.2 57 38 64.5 M62 41.5 C63.8 49 63.8 57 62 64.5 M50 35 v8.5'); H.vien(g, BM.vecVoGhep, 2.4);
    H.duong(g, 'M35 43 C37.5 39 41.5 38 46 38'); H.vien(g, BM.vecVo, 3.6);
    H.kinh(g, M, 32.5, 53.5, 35, 14, { sang: !!s.doc, mat: s.mat });         // gói V4: mắt biểu cảm (s.mat) như mọi thân
    H.angTen(g, M, 50, 36, 25.5, 4.2);
  } });
})(typeof window !== 'undefined' ? window : globalThis);
