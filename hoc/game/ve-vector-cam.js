var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ve-vector-cam.js — CẢM BIẾN vector (gói V3), cùng mã / tên / ổ gắn với bộ pixel part/part-*.js: khoang-cach, mau, cham (ổ hông), camera (ổ tren: không có hình riêng,
   là hai mắt ống kính trên kính của thân — H.kinh vẽ theo s.camera / s.camSang), hong-ngoai (ổ tren, góc mũi), camera-bay (ổ bung của drone).
   Hệ của cảm biến: điểm neo (50, 50) đặt trùng ổ; vẽ trong hệ của THÂN (quay mặt xuống: phía trước là +y) nên xoay cùng cả nhóm.
   Trạng thái s (VeVector.robot truyền): bat (có cảm biến đang đọc), mat (camera / camera-bay đang đọc), ben 'trai' | 'phai' (ổ hông nào), ra (+1 / −1: phía NGOÀI
   của ổ theo trục x của thân), o (tên ổ). Vỏ trắng viền chàm như thân (gia đình thân A); không dùng màu đội (màu đội chỉ ở kính + mắt + ăng-ten).
   Mọi nét nằm trong |x − 50| ≤ 8, |y − 50| ≤ 14 quanh điểm neo (cộng ổ ngoài cùng x 95 của thân vẫn lọt ô sau khi thu 0,86). */
(function (root) {
  var V = root.VeVector || (typeof module === 'object' && require('./ve-vector.js'));
  function vo(g, H, x, y, w, h, r) { H.bo(g, x, y, w, h, r); g.fillStyle = H.gradVo(g, x, y, w, h); g.fill(); H.vien(g, BM.vecVien, 2.2); }

  /* KHOẢNG CÁCH (tai xanh lơ, front_clear / left_clear / right_clear): vỏ con nhộng dọc, thấu kính cyan ở đầu trước; đang đọc: thấu kính sáng + hai gợn sóng ở góc trước-ngoài. */
  V.dangKy({ loai: 'cam-bien', ma: 'khoang-cach', ten: 'Cảm biến khoảng cách (tai xanh lơ)', gan: ['hong', 'hongTrai', 'hongPhai'], diemNeo: { x: 50, y: 50 }, ve: function (g, s, M, H) {
    var ra = s.ra || 1;
    vo(g, H, 45, 45, 10, 17, 5);
    H.bo(g, 46.5, 54, 7, 6, 3); H.to(g, s.bat ? BM.vecDenSang : BM.vecDen); H.vien(g, BM.vecVien, 1.2);
    if (s.bat) {
      g.beginPath(); g.arc(50, 58, 5, Math.PI * 0.15, Math.PI * 0.85); H.vien(g, BM.vecDen, 1.6);
      g.beginPath(); g.moveTo(50 + ra * 5.5, 56); g.lineTo(50 + ra * 7.5, 58); H.vien(g, BM.vecDen, 1.6);
    }
  } });

  /* MÀU (dưới sườn, color()): vỏ tròn nhỏ lùi về phía đuôi so với ổ, thấu kính tím; đang đọc: lõi sáng hồng + quầng tím. */
  V.dangKy({ loai: 'cam-bien', ma: 'mau', ten: 'Cảm biến màu dưới sườn', gan: ['hong', 'hongTrai', 'hongPhai'], diemNeo: { x: 50, y: 50 }, ve: function (g, s, M, H) {
    if (s.bat) { H.tron(g, 50, 40, 7.5); H.to(g, H.rgba(BM.vecVienRgb, 0.12)); }
    H.tron(g, 50, 40, 5.5); g.fillStyle = H.gradVo(g, 44.5, 34.5, 11, 11); g.fill(); H.vien(g, BM.vecVien, 2.2);
    H.tron(g, 50, 40, 3); H.to(g, s.bat ? BM.vecMauCbSang : BM.vecMauCb); H.vien(g, s.bat ? BM.vecMauCb : BM.vecVien, 1.2);
  } });

  /* CẦN GẠT (va chạm, bumped()): đế thép nhỏ ở ổ, cần bạc chĩa về phía trước, đầu tròn; vừa chạm (bat): đầu cần đỏ hồng. */
  V.dangKy({ loai: 'cam-bien', ma: 'cham', ten: 'Cảm biến va chạm (cần gạt)', gan: ['hong', 'hongTrai', 'hongPhai'], diemNeo: { x: 50, y: 50 }, ve: function (g, s, M, H) {
    H.duong(g, 'M50 50 V61'); H.vien(g, BM.vecVien, 4.5); H.duong(g, 'M50 50 V61'); H.vien(g, BM.vecBac, 2);
    vo(g, H, 46, 45, 8, 9, 3);
    H.tron(g, 50, 62, 3); H.to(g, s.bat ? BM.vecHong : BM.vecDeSang); H.vien(g, BM.vecVien, 1.5);
  } });

  /* CAMERA (đôi mắt, color() đọc ô trước mặt): không có hình ở ổ — hai mắt trên kính của thân thành ống kính (VeVector.robot đặt s.camera / s.camSang cho thân). */
  V.dangKy({ loai: 'cam-bien', ma: 'camera', ten: 'Camera (đôi mắt)', gan: 'tren', diemNeo: { x: 50, y: 50 }, trenThan: true, ve: function () { /* mắt vẽ ở thân (H.kinh) */ } });

  /* HỒNG NGOẠI (distance() / warm(), mùa 2): mắt đo nhỏ ở góc mũi bên trái, vỏ tròn trắng, thấu kính đỏ: tắt = đỏ sẫm, đang đọc = đỏ hồng rực + lõi sáng + hai chấm nhô về phía trước
     (tia dài trên sân do san-ve.js / gói V4 vẽ). */
  V.dangKy({ loai: 'cam-bien', ma: 'hong-ngoai', ten: 'Cảm biến hồng ngoại (mắt đỏ ở mũi)', gan: 'tren', diemNeo: { x: 50, y: 50 }, ve: function (g, s, M, H) {
    H.tron(g, 50, 50, 5.5); g.fillStyle = H.gradVo(g, 44.5, 44.5, 11, 11); g.fill(); H.vien(g, BM.vecVien, 2.2);
    H.tron(g, 50, 50.5, 3.2); H.to(g, s.bat ? BM.vecHong : BM.vecHongToi); H.vien(g, BM.vecVien, 1);
    if (s.bat) {
      H.tron(g, 49, 49.5, 1.3); H.to(g, BM.vecHongSang);
      H.tron(g, 47, 58.5, 1.2); H.to(g, BM.vecHong); H.tron(g, 53, 58.5, 1.2); H.to(g, BM.vecHong);
    }
  } });

  /* CAMERA NHÌN XUỐNG (camera-bay, look(), chỉ drone, ổ bung ở mép trên khung): cụm gimbal tròn vỏ trắng, vành tối, kính xanh; s.bat: kính sáng nhẹ;
     s.mat (đang đọc look()): kính cyan rực lõi trắng, quầng sáng quanh cụm, hai tia nhỏ nhô ra ngoài (−y: drone không xoay, ổ bung ở phía trên). */
  V.dangKy({ loai: 'cam-bien', ma: 'camera-bay', ten: 'Camera nhìn xuống (dưới bụng drone)', gan: 'bung', diemNeo: { x: 50, y: 50 }, ve: function (g, s, M, H) {
    var sang = !!s.mat;
    if (sang) {
      H.tron(g, 50, 50, 10); H.to(g, H.rgba(BM.vecMatSangRgb, 0.7));
      H.duong(g, 'M45 40 L44 37 M55 40 L56 37'); H.vien(g, BM.vecDen, 1.8);
    }
    H.tron(g, 50, 50, 7.5); g.fillStyle = H.gradVo(g, 42.5, 42.5, 15, 15); g.fill(); H.vien(g, BM.vecVien, 2.2);
    H.tron(g, 50, 50, 4.8); H.to(g, BM.vecDe);
    H.tron(g, 50, 50, 3.3); H.to(g, sang ? BM.vecDen : s.bat ? BM.vecDenToi : BM.vecBanh);
    H.tron(g, 48.8, 48.8, 1.2); H.to(g, sang ? BM.vecMatSang : BM.vecDenSang);
  } });
})(typeof window !== 'undefined' ? window : globalThis);
