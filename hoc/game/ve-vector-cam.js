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

  /* KHOẢNG CÁCH (tai xanh lơ, front_clear / left_clear / right_clear): cụm thu phát siêu âm gắn hông có khớp kẹp thép, vành loa tối và vòm thấu kính cyan;
     đang đọc (s.bat): đèn báo sáng, vòm phát sáng rực + hai cung sóng siêu âm phía trước. */
  V.dangKy({ loai: 'cam-bien', ma: 'khoang-cach', hamGoc: ['front_clear',  'left_clear',  'right_clear'], ten: 'Cảm biến khoảng cách (tai xanh lơ)', gan: ['hong', 'hongTrai', 'hongPhai'], diemNeo: { x: 50, y: 50 }, ve: function (g, s, M, H) {
    var ra = s.ra || 1;
    H.bo(g, ra > 0 ? 43 : 53.5, 46.5, 3.5, 7, 1.2); H.to(g, BM.vecBacToi); H.vien(g, BM.vecVien, 1.4);
    vo(g, H, 44.5, 43.5, 11, 17.5, 5.2);
    H.duong(g, 'M46.5 47 H53.5'); H.vien(g, BM.vecVoGhep, 1.5);
    H.tron(g, 50, 50, 1.6); H.to(g, s.bat ? BM.vecDenSang : BM.vecDen);
    H.bo(g, 45.6, 53.2, 8.8, 7.2, 3.5); H.to(g, BM.vecDe); H.vien(g, BM.vecVien, 1.4);
    H.bo(g, 46.8, 54.4, 6.4, 4.8, 2.4); H.to(g, s.bat ? BM.vecDenSang : BM.vecDen);
    H.duong(g, 'M48.2 56.8 H51.8'); H.vien(g, s.bat ? BM.vecVo : BM.vecDenSang, 1.2);
    if (s.bat) {
      g.beginPath(); g.arc(50, 58, 5, Math.PI * 0.15, Math.PI * 0.85); H.vien(g, BM.vecDen, 1.6);
      g.beginPath(); g.arc(50, 58.5, 7.2, Math.PI * 0.22, Math.PI * 0.78); H.vien(g, BM.vecDenSang, 1.3);
      g.beginPath(); g.moveTo(50 + ra * 5.5, 56); g.lineTo(50 + ra * 7.5, 58); H.vien(g, BM.vecDen, 1.6);
    }
  } });

  /* CẢM BIẾN TỪ (P1 mùa 3, 29/10; mã 'tu', front_metal / front_pole; thẻ "Cảm biến từ"): PART RIÊNG, không còn ghép vào tai khoảng cách. Vỏ con nhộng ngắn ở hông
     có gân cuộn cảm, cổ kẹp thép giữ đáy chữ U, hai nhánh ĐẦU DÒ chữ U (nhánh đỏ N / nhánh xanh dương S, đúng màu luật nam châm) mở chĩa về PHÍA TRƯỚC (+y); đang đọc: lõi sáng + ba cung sóng từ. */
  V.dangKy({ loai: 'cam-bien', ma: 'tu', hamGoc: ['front_metal',  'front_pole'], ten: 'Cảm biến từ (đầu dò chữ U ở hông)', gan: ['hong', 'hongTrai', 'hongPhai'], diemNeo: { x: 50, y: 50 }, ve: function (g, s, M, H) {
    vo(g, H, 44.5, 40.2, 11, 13.2, 5);
    H.duong(g, 'M46.5 47.8 H53.5 M46.5 50 H53.5'); H.vien(g, BM.vecVoGhep, 1.3);
    H.tron(g, 50, 44.4, 2.1); H.to(g, s.bat ? BM.vecDenSang : BM.vecDen); H.vien(g, BM.vecVien, 1);        // đèn báo từ trường trên thân cảm biến
    H.bo(g, 46, 51.4, 8, 3.8, 1.8); H.to(g, BM.vecThep); H.vien(g, BM.vecVien, 1.3);                       // cổ kẹp giữ đáy cong chữ U
    if (s.bat) { H.tron(g, 50, 61.2, 3.4); H.to(g, H.rgba(BM.vecMatSangRgb, 0.55)); }
    var d = 'M46.4 61.5 V57.2 C46.4 54.2 53.6 54.2 53.6 57.2 V61.5';                                       // đáy cong chữ U ở cổ (54.2), hai nhánh mở hướng về phía trước (+y)
    H.duong(g, d); H.vien(g, BM.vecVien, 4.5, 'butt');
    H.duong(g, d); H.vien(g, BM.vecBac, 2.2, 'butt');
    g.beginPath(); g.rect(45.0, 59.2, 2.8, 3.3); H.to(g, BM.luatVatDo); H.vien(g, BM.vecVien, 1.1, 'butt');           // đầu cực N đỏ hướng về phía trước
    g.beginPath(); g.rect(52.2, 59.2, 2.8, 3.3); H.to(g, BM.luatVatXanhDuong); H.vien(g, BM.vecVien, 1.1, 'butt');    // đầu cực S xanh dương hướng về phía trước
    if (s.bat) {
      H.duong(g, 'M45.7 60.8 H47.1'); H.vien(g, BM.luatVatDoSang, 1.1);
      H.duong(g, 'M52.9 60.8 H54.3'); H.vien(g, BM.luatVatXanhDuongSang, 1.1);
      for (var i = 0; i < 3; i++) { g.beginPath(); g.arc(50, 61.5, 2.6 + i * 2.1, Math.PI * 0.18, Math.PI * 0.82); H.vien(g, i % 2 ? BM.luatVatXanhDuong : BM.luatVatDo, 1.3); }
    }
  } });

  /* MÀU (dưới sườn, color()): cụm thấu kính quang phổ tròn lùi về phía đuôi so với ổ, vành khẩu độ tối, thấu kính đa lớp tím - lam; đang đọc: lõi sáng hồng + quầng tím. */
  V.dangKy({ loai: 'cam-bien', ma: 'mau', hamGoc: ['color'], ten: 'Cảm biến màu dưới sườn', gan: ['hong', 'hongTrai', 'hongPhai'], diemNeo: { x: 50, y: 50 }, ve: function (g, s, M, H) {
    if (s.bat) { H.tron(g, 50, 40, 7.8); H.to(g, H.rgba(BM.vecVienRgb, 0.14)); }
    H.tron(g, 50, 40, 6); g.fillStyle = H.gradVo(g, 44, 34, 12, 12); g.fill(); H.vien(g, BM.vecVien, 2.2);
    H.tron(g, 50, 40, 4.1); H.to(g, BM.vecDe); H.vien(g, BM.vecVien, 1);
    H.tron(g, 50, 40, 2.9); H.to(g, s.bat ? BM.vecMauCbSang : BM.vecMauCb);
    H.tron(g, 50, 40, 1.5); H.to(g, s.bat ? BM.vecHong : BM.vecTim);
    H.tron(g, 49, 39, 0.8); H.to(g, BM.vecVo);
  } });

  /* CẦN GẠT (va chạm, bumped()): hộp công tắc hành trình ở ổ, khớp lò xo, cần gạt thép chĩa về phía trước, đầu đệm con lăn ngang; vừa chạm (bat): đầu đệm sáng hồng đỏ + vạch chấn động. */
  V.dangKy({ loai: 'cam-bien', ma: 'cham', hamGoc: ['bumped'], ten: 'Cảm biến va chạm (cần gạt)', gan: ['hong', 'hongTrai', 'hongPhai'], diemNeo: { x: 50, y: 50 }, ve: function (g, s, M, H) {
    H.duong(g, 'M50 51 V60.5'); H.vien(g, BM.vecVien, 4.6); H.duong(g, 'M50 51 V60.5'); H.vien(g, BM.vecBac, 2.2);
    vo(g, H, 45.5, 44.2, 9, 9.2, 3.2);
    H.bo(g, 47, 51.5, 6, 3.2, 1.2); H.to(g, BM.vecThepToi); H.vien(g, BM.vecVien, 1.2);
    H.tron(g, 50, 48.5, 1.6); H.to(g, s.bat ? BM.vecHong : BM.vecBacToi);
    H.bo(g, 46.2, 59.2, 7.6, 4.4, 2.2); H.to(g, s.bat ? BM.vecHong : BM.vecDeSang); H.vien(g, BM.vecVien, 1.6);
    H.tron(g, 50, 61.4, 1.3); H.to(g, s.bat ? BM.vecHongSang : BM.vecBac);
    if (s.bat) { H.duong(g, 'M44.5 60 L43.2 58.6 M55.5 60 L56.8 58.6'); H.vien(g, BM.vecHong, 1.4); }
  } });

  /* CAMERA (color() đọc ô trước mặt) — gói V4 (user 28/10): khối camera trên trụ ngắn ở ĐUÔI xe (VeVector.robot đặt ở than.oCam, oVe 'cam'; ổ logic vẫn 'tren'
     như Part.ghep), ống kính hướng về PHÍA TRƯỚC (+y) nhìn qua đầu xe. Đế bạc chạm vỏ, khối trắng viền chàm có đèn báo REC, loa che tối, ống kính quang học nhiều lớp;
     s.mat (đang đọc): ống kính trắng rực + quầng. Gốc tia camera = tâm ống kính (diemNeo + (0, 10)) → VeVector.diemOngKinh. */
  V.dangKy({ loai: 'cam-bien', ma: 'camera', hamGoc: ['color'], ten: 'Camera (đôi mắt)', gan: 'tren', diemNeo: { x: 50, y: 50 }, oVe: 'cam', ongKinh: { x: 50, y: 60 }, ve: function (g, s, M, H) {
    var sang = !!s.mat;
    H.bo(g, 45, 42.8, 10, 8, 3); H.to(g, BM.vecBacToi); H.vien(g, BM.vecVien, 1.6);                                // trụ / đế chạm vỏ
    H.bo(g, 40.5, 45.8, 19, 12.2, 4.2); g.fillStyle = H.gradVo(g, 40.5, 45.8, 19, 12.2); g.fill(); H.vien(g, BM.vecVien, 2.2);   // thân camera
    H.duong(g, 'M44 49.2 H53'); H.vien(g, BM.vecVoGhep, 1.5);
    H.tron(g, 55.8, 49.2, 1.4); H.to(g, sang ? BM.vecDo : BM.vecDoSang);                                           // đèn báo REC
    H.bo(g, 43.5, 55.6, 13, 5.8, 2.2); H.to(g, BM.vecDe); H.vien(g, BM.vecVien, 1.5);                              // loa che ống kính (phía trước)
    if (sang) { H.tron(g, 50, 60, 7.2); H.to(g, H.rgba(BM.vecMatSangRgb, 0.7)); }
    H.tron(g, 50, 60, 3.8); H.to(g, BM.vecDe); H.vien(g, BM.vecVien, 1.3);
    H.tron(g, 50, 60, 2.6); H.to(g, sang ? BM.vecMatSang : s.bat ? BM.vecDenSang : BM.vecDen);
    H.tron(g, 50, 60, 1.2); H.to(g, sang ? BM.vecDen : BM.vecDeSang);
    H.tron(g, 49, 59, 0.8); H.to(g, BM.vecVo);
  } });

  /* CAMERA BỐN HƯỚNG (mùa 4 gói 3, color(huong)): tháp toàn cảnh trên nóc, bốn cụm ống kính nhô ra bốn hướng trước / sau / trái / phải, nắp trung tâm thép;
     đang đọc (s.mat): bốn ống kính sáng rực + quầng. Ổ logic 'tren'. */
  V.dangKy({ loai: 'cam-bien', ma: 'camera-4', hamGoc: ['color'], ten: 'Camera bốn hướng', gan: 'tren', diemNeo: { x: 50, y: 50 }, ve: function (g, s, M, H) {
    var sang = !!s.mat;
    if (sang) { H.tron(g, 50, 50, 11.2); H.to(g, H.rgba(BM.vecMatSangRgb, 0.38)); }
    [[50, 41.8], [58.2, 50], [50, 58.2], [41.8, 50]].forEach(function (p) {                                        // bốn cụm ống kính nhô ở 4 hướng
      H.tron(g, p[0], p[1], 2.7); H.to(g, BM.vecDe); H.vien(g, BM.vecVien, 1.2);
      H.tron(g, p[0], p[1], 1.6); H.to(g, sang ? BM.vecMatSang : s.bat ? BM.vecDenSang : BM.vecDen);
    });
    H.tron(g, 50, 50, 7.8); g.fillStyle = H.gradVo(g, 42.2, 42.2, 15.6, 15.6); g.fill(); H.vien(g, BM.vecVien, 2.2);   // vòm tháp chính
    H.duong(g, 'M45.5 45.5 L54.5 54.5 M54.5 45.5 L45.5 54.5'); H.vien(g, BM.vecVoGhep, 1.3);
    H.tron(g, 50, 50, 3.2); H.to(g, BM.vecThepToi); H.vien(g, BM.vecVien, 1.1);
    H.tron(g, 50, 50, 1.4); H.to(g, sang ? BM.vecMatSang : BM.vecDen);
  } });

  /* HỒNG NGOẠI (distance() / warm(), mùa 2): cụm thu phát hồng ngoại ở góc mũi bên trái, vỏ bo tròn có mái che tối phía trước, thấu kính đôi ruby đỏ:
     tắt = đỏ sẫm, đang đọc = đỏ hồng rực + lõi sáng + hai chấm tia nhô về phía trước. */
  V.dangKy({ loai: 'cam-bien', ma: 'hong-ngoai', hamGoc: ['distance',  'warm'], ten: 'Cảm biến hồng ngoại (mắt đỏ ở mũi)', gan: 'tren', diemNeo: { x: 50, y: 50 }, ve: function (g, s, M, H) {
    vo(g, H, 43.8, 43.8, 12.4, 12.4, 5.8);
    H.bo(g, 45, 49.2, 10, 6.6, 3); H.to(g, BM.vecDe); H.vien(g, BM.vecVien, 1.2);
    H.tron(g, 50, 52, 3.4); H.to(g, s.bat ? BM.vecHong : BM.vecHongToi); H.vien(g, BM.vecVien, 1.1);
    H.tron(g, 48.8, 51.2, 1.1); H.to(g, s.bat ? BM.vecHongSang : BM.vecHong);
    H.tron(g, 51.3, 52.3, 0.8); H.to(g, s.bat ? BM.vecVo : BM.vecHongSang);
    if (s.bat) {
      g.beginPath(); g.arc(50, 54.5, 5.2, Math.PI * 0.2, Math.PI * 0.8); H.vien(g, BM.vecHong, 1.3);
      H.tron(g, 47, 58.8, 1.2); H.to(g, BM.vecHong); H.tron(g, 53, 58.8, 1.2); H.to(g, BM.vecHong);
    }
  } });

  /* CAMERA NHÌN XUỐNG (camera-bay, look(), chỉ drone, ổ bung ở mép trên khung): cụm gimbal chống rung có ngàm kẹp hai bên, vỏ cầu trắng, ống kính góc rộng đa lớp;
     s.mat (đang đọc look()): kính cyan rực lõi trắng, quầng sáng quanh cụm, hai tia quét nhô ra ngoài (−y). */
  V.dangKy({ loai: 'cam-bien', ma: 'camera-bay', hamGoc: ['look'], ten: 'Camera nhìn xuống (dưới bụng drone)', gan: 'bung', diemNeo: { x: 50, y: 50 }, ve: function (g, s, M, H) {
    var sang = !!s.mat;
    if (sang) {
      H.tron(g, 50, 50, 10.2); H.to(g, H.rgba(BM.vecMatSangRgb, 0.7));
      H.duong(g, 'M45 40 L43.8 36.8 M55 40 L56.2 36.8'); H.vien(g, BM.vecDen, 1.8);
    }
    H.bo(g, 41.2, 47.2, 17.6, 5.6, 2.2); H.to(g, BM.vecThepToi); H.vien(g, BM.vecVien, 1.4);                       // khung ngàm gimbal
    H.tron(g, 50, 50, 7.6); g.fillStyle = H.gradVo(g, 42.4, 42.4, 15.2, 15.2); g.fill(); H.vien(g, BM.vecVien, 2.2);
    H.tron(g, 50, 50, 5.2); H.to(g, BM.vecDe); H.vien(g, BM.vecVien, 1);
    H.tron(g, 50, 50, 3.6); H.to(g, sang ? BM.vecDen : s.bat ? BM.vecDenToi : BM.vecBanh);
    H.tron(g, 50, 50, 1.8); H.to(g, sang ? BM.vecDenSang : BM.vecDe);
    H.tron(g, 48.6, 48.6, 1.2); H.to(g, sang ? BM.vecMatSang : BM.vecDenSang);
  } });

  /* RADAR TRÒN (mùa 6 gói 3, radar(d) / shape(d)): vòm radome trên nóc;
     - TẮT (!sang): màn hình tối nghỉ, lưới cự ly xám thép chìm, thanh ăng-ten nằm ngang cố định màu bạc tối.
     - ĐANG ĐỌC (s.bat / s.mat): bên ngoài vòm tỏa 4 cung sóng radar đôi + xung tín hiệu 4 hướng; bên trong màn hình bật rẻ quạt quét sáng rực, kim quét trắng và 2 chấm mục tiêu (blip). Ổ logic 'tren'. */
  V.dangKy({ loai: 'cam-bien', ma: 'radar', hamGoc: ['radar', 'shape'], ten: 'Radar tròn', gan: 'tren', diemNeo: { x: 50, y: 50 }, ve: function (g, s, M, H) {
    var sang = !!(s.bat || s.mat);
    if (sang) {
      H.tron(g, 50, 50, 12.2); H.to(g, H.rgba(BM.vecMatSangRgb, 0.42));
      /* Bốn cặp cung sóng radar tỏa ra 4 phía bên ngoài vòm radome */
      [-0.5, 0, 0.5, 1].forEach(function (k) {
        var a0 = k * Math.PI;
        g.beginPath(); g.arc(50, 50, 10.3, a0 - 0.42, a0 + 0.42); H.vien(g, BM.vecDen, 1.6);
        g.beginPath(); g.arc(50, 50, 12.3, a0 - 0.3, a0 + 0.3); H.vien(g, BM.vecDenSang, 1.25);
      });
    }
    /* Vòm radome trắng viền chàm + màn hình radar tối */
    H.tron(g, 50, 50, 8.2); g.fillStyle = H.gradVo(g, 41.8, 41.8, 16.4, 16.4); g.fill(); H.vien(g, BM.vecVien, 2.2);
    H.tron(g, 50, 50, 5.8); H.to(g, BM.vecDe); H.vien(g, BM.vecVien, 1.1);
    if (sang) {
      /* Rẻ quạt quét (Radar Sweep Sector) sáng rực trên màn hình */
      g.beginPath(); g.moveTo(50, 50); g.arc(50, 50, 5.3, -Math.PI * 0.48, Math.PI * 0.12); g.closePath(); H.to(g, BM.vecDenToi);
      g.beginPath(); g.moveTo(50, 50); g.arc(50, 50, 5.3, -Math.PI * 0.25, Math.PI * 0.12); g.closePath(); H.to(g, BM.vecDen);
      H.tron(g, 50, 50, 3.6); H.vien(g, BM.vecDenSang, 0.9);
      H.duong(g, 'M50 44.5 V55.5 M44.5 50 H55.5'); H.vien(g, BM.vecDen, 0.9);
      /* Hai chấm mục tiêu (target blips) phát hiện trên màn hình radar */
      H.tron(g, 52.3, 47.4, 1.15); H.to(g, BM.vecXanhLaSang);
      H.tron(g, 47.4, 52.4, 1.0); H.to(g, BM.vecCanhBao);
      /* Kim quét sáng trắng ở mép rẻ quạt + tâm phát xung */
      H.duong(g, 'M50 50 L54.8 51.8'); H.vien(g, BM.vecMatSang, 2.0);
      H.tron(g, 50, 50, 1.9); H.to(g, BM.vecMatSang); H.vien(g, BM.vecVien, 1);
    } else {
      /* Trạng thái TẮT (Standby): lưới cự ly tối chìm, thanh ăng-ten nằm ngang nghỉ */
      H.tron(g, 50, 50, 3.5); H.vien(g, BM.vecThepToi, 0.9);
      H.duong(g, 'M50 44.6 V55.4 M44.6 50 H55.4'); H.vien(g, BM.vecThepToi, 0.9);
      H.duong(g, 'M45.6 50 H54.4'); H.vien(g, BM.vecBacToi, 1.8);
      H.tron(g, 50, 50, 1.8); H.to(g, BM.vecThep); H.vien(g, BM.vecVien, 1);
    }
  } });

})(typeof window !== 'undefined' ? window : globalThis);
