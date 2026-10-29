var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ve-vector-than-omni.js — THÂN OMNI vector (gói V3), cùng gia đình thân A: vỏ trắng vuông bo góc hẹp (V8a: bo / cạnh ngắn ≈ 0,34 như thân A, trước 0,41), đường ghép tím nhạt, kính + hai mắt màu đội, ăng-ten chấm màu đội;
   bốn bánh omni ở bốn góc (bầu dục nghiêng 40°, trục cyan, hai con lăn chéo) — chạy được sang ngang (slide_left / slide_right).
   Quay mặt XUỐNG, tâm (50, 56). Ổ: tay (50, 81); hongTrai (96, 56) / hongPhai (4, 56) giữa hai bánh mỗi bên; tren (71, 78) góc mũi trái; sau (37, 27) đuôi.
   Trạng thái s: banh { trai, phai } + buoc (0 | 1) → con lăn đổi chéo (thấy bánh quay); camera / camSang như thân A. */
(function (root) {
  var V = root.VeVector || (typeof module === 'object' && require('./ve-vector.js'));
  function banh(g, H, cx, cy, goc, pha) {
    g.save(); g.translate(cx, cy); g.rotate(goc);
    H.elip(g, 0, 0, 12, 8.5); H.to(g, BM.vecBanh); H.vien(g, BM.vecVien, 3);
    g.beginPath(); if (pha) { g.moveTo(-8, 0); g.lineTo(8, 0); g.moveTo(0, -5.5); g.lineTo(0, 5.5); } else { g.moveTo(-7, -4); g.lineTo(7, 4); g.moveTo(-7, 4); g.lineTo(7, -4); }
    H.vien(g, BM.vecBanhGach, 2.2);
    H.elip(g, 0, 0, 4.5, 3.2); H.to(g, BM.vecDen); H.vien(g, BM.vecVien, 1.5);
    g.restore();
  }
  V.dangKy({ loai: 'than', ma: 'omni', hamGoc: ['left_move',  'right_move',  'left_back',  'right_back',  'slide_left',  'slide_right',  'wait'], ten: 'Thân omni', oGan: { tay: { x: 50, y: 81 }, hongTrai: { x: 71, y: 47 }, hongPhai: { x: 29, y: 47 }, tren: { x: 71, y: 78 }, sau: { x: 37, y: 27 } }, oCam: { x: 63, y: 29 }, vo: { x: 23, y: 24, w: 54, h: 59 }, ve: function (g, s, M, H) {
    var pha = s && typeof s.lan === 'number' ? (s.lan >= 0.5 ? 1 : 0) : s && s.banh && (s.banh.trai || s.banh.phai) && s.buoc ? 1 : 0, A = 40 * Math.PI / 180;
    banh(g, H, 17, 37, A, pha); banh(g, H, 83, 37, -A, pha); banh(g, H, 17, 75, -A, pha); banh(g, H, 83, 75, A, pha);
    H.bo(g, 23, 24, 54, 59, 18.5); g.fillStyle = H.gradVo(g, 23, 24, 54, 59); g.fill(); H.vien(g, BM.vecVien, 3.5);
    H.duong(g, 'M35 32 C33 42 33 51 35 60 M65 32 C67 42 67 51 65 60 M50 24 v12'); H.vien(g, BM.vecVoGhep, 2.5);
    H.duong(g, 'M31 35 C34 29 39 28 45 28'); H.vien(g, BM.vecVo, 4);
    H.kinh(g, M, 29, 58, 42, 16, s);
    H.angTen(g, M, 50, 25, 13, 5);
  } });
})(typeof window !== 'undefined' ? window : globalThis);
