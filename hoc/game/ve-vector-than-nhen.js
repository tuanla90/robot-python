var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ve-vector-than-nhen.js — THÂN NHỆN BỐN CHÂN vector (gói V3), cùng gia đình thân A: vỏ trắng tròn trịa (bo gần tròn), đường ghép tím nhạt, kính + hai mắt màu đội,
   ăng-ten chấm màu đội; bốn chân trắng hai đốt viền chàm, khớp gối và bàn chân chấm cyan.
   Quay mặt XUỐNG, tâm (50, 56). Ổ: tay (50, 81); hongTrai (88, 56) / hongPhai (12, 56) giữa chân trước và chân sau; tren (68, 77) góc mũi trái; sau (38, 31) đuôi.
   Trạng thái s: buoc (0 | 1) → cặp chân sau đổi chỗ (bước); co (chương nhện co chân, chui gầm): bốn chân dang sát đất nằm ngang, đốt ngắn, vỏ nhỏ lại
   và lùi về sau một chút, thêm vạch bóng tối ở bụng — ổ gắn KHÔNG đổi (tay kẹp vẫn ở đúng chỗ), như part-nhen.js; camera / camSang như thân A.
   Nhện không tay đi bốn hướng không quay mặt: VeRobot truyền hướng 0 (như bộ pixel). */
(function (root) {
  var V = root.VeVector || (typeof module === 'object' && require('./ve-vector.js'));
  /* một chân: hông (h) → gối (k) → bàn (b); [x, y] trong hệ thân */
  function chan(g, H, h, k, b) {
    var d = 'M' + h[0] + ' ' + h[1] + ' L' + k[0] + ' ' + k[1] + ' L' + b[0] + ' ' + b[1];
    H.duong(g, d); H.vien(g, BM.vecVien, 9);
    H.duong(g, d); H.vien(g, BM.vecVo, 4.5);
    H.tron(g, k[0], k[1], 3.6); H.to(g, BM.vecKhop); H.vien(g, BM.vecVien, 2);
    H.tron(g, b[0], b[1], 3.2); H.to(g, BM.vecDen); H.vien(g, BM.vecVien, 2);
  }
  V.dangKy({ loai: 'than', ma: 'nhen', ten: 'Thân nhện bốn chân', oGan: { tay: { x: 50, y: 81 }, hongTrai: { x: 88, y: 56 }, hongPhai: { x: 12, y: 56 }, tren: { x: 68, y: 77 }, sau: { x: 38, y: 31 } }, ve: function (g, s, M, H) {
    var d = s && s.buoc ? 5 : 0;
    if (s && s.co) {
      [[-1], [1]].forEach(function (q) {
        var k = q[0], x = function (v) { return 50 + k * (v - 50); };
        chan(g, H, [x(34), 66], [x(14), 68], [x(8), 76]);
        chan(g, H, [x(34), 44], [x(14), 42 + d * 0.6], [x(8), 35 + d * 0.6]);
      });
      H.bo(g, 27, 33, 46, 47, 21); g.fillStyle = H.gradVo(g, 27, 33, 46, 47); g.fill(); H.vien(g, BM.vecVien, 3.5);
      H.duong(g, 'M37 39 C35 47 35 54 37 60 M63 39 C65 47 65 54 63 60'); H.vien(g, BM.vecVoGhep, 2.5);
      H.duong(g, 'M33 76 H67'); H.vien(g, BM.vecVoToi, 3);
      H.kinh(g, M, 31, 60, 38, 14, s);
      H.angTen(g, M, 50, 34, 24, 4.5);
      return;
    }
    [[-1], [1]].forEach(function (q) {
      var k = q[0], x = function (v) { return 50 + k * (v - 50); };
      chan(g, H, [x(32), 68], [x(14), 72], [x(9), 88]);
      chan(g, H, [x(32), 42], [x(14), 37 + d], [x(10), 22 + d]);
    });
    H.bo(g, 25, 29, 50, 52, 23); g.fillStyle = H.gradVo(g, 25, 29, 50, 52); g.fill(); H.vien(g, BM.vecVien, 3.5);
    H.duong(g, 'M36 36 C34 45 34 53 36 60 M64 36 C66 45 66 53 64 60 M50 29 v10'); H.vien(g, BM.vecVoGhep, 2.5);
    H.duong(g, 'M33 39 C36 34 40 33 45 33'); H.vien(g, BM.vecVo, 4);
    H.kinh(g, M, 30, 58, 40, 15, s);
    H.angTen(g, M, 50, 30, 18, 5);
  } });
})(typeof window !== 'undefined' ? window : globalThis);
