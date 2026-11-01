var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ve-vector-o-song.js — Ô SÂN BẾN SÔNG (mùa 5) + ô nước '~' dùng chung với Cảng sông (mùa 4). 31/10, đặc tả hoc/KE-HOACH-MUA-CANG-SONG.md mục 2.1, 2.3, 2.8, 4.
   Chép từ hình phim (nhánh claude/phim-clb, phim-clb/tools/xuat-m4.mjs) rồi sửa theo luật game: màu lấy từ BangMau, thêm dòng TẮT, bến nhận bè 'q', van cống 'V'.
   Hệ 100 × 100 một ô như ve-vector-o*.js; mỗi hình khai cacTrangThai; ky = ký hiệu sân SanHoc (lõi Bến sông đã nhận từ 31/10; bảng ve-vector-ky-hieu.js) cho máy kiểm hoc/kiem-ve-vector.mjs.
     'nuoc'          '~'  mặt nước (s.le: gợn lệch, tránh lặp khi lát nhiều ô liền)
     'dong-nuoc'     lớp cfg.dong: s.huong 0 lên · 1 phải · 2 xuống · 3 trái (chiều nước chảy), s.xiet (sức 2: hai mũi tên vàng), s.tat (dòng tắt: mũi tên mờ nét đứt,
                     không bọt), s.pha 0..1 (hoạt cảnh gợn trôi theo dòng: mũi tên trượt theo chiều chảy, quay vòng)
     'cong-thuy-loi' 'K' / 'k'  cống: s.mo (mở), s.k 0..1 (hoạt cảnh nâng cánh: 0 đóng … 1 mở; bỏ trống = theo s.mo)
     'van-cong'      'V'  van cống trên bờ (cần gạt): s.bat (đã gạt: cần nghiêng phải, núm xanh), s.goc 0..1 (hoạt cảnh gạt)
     'phao-dich'     'Q'  phao đích có cờ trên nước
     'ben-nhan'      'q'  bến nhận bè: cầu gỗ chữ U ôm ô nước + khung đích; s.xong (đã có bè: khung xanh lá) */
(function (root) {
  var V = root.VeVector || (typeof module === 'object' && require('./ve-vector.js'));

  /** Nền nước tràn ô (không viền bo: nhiều ô nước liền thành một mặt sông). */
  function nenNuoc(g, H, le) {
    g.fillStyle = H.gradDoc(g, 0, 0, 100, 100, [[0, BM.vecNuoc], [1, BM.vecNuocToi]]); g.fillRect(0, 0, 100, 100);
    var y1 = le ? 30 : 26, y2 = le ? 74 : 66, x0 = le ? 30 : 16;
    g.beginPath();
    g.moveTo(x0, y1); g.quadraticCurveTo(x0 + 9, y1 - 6, x0 + 18, y1); g.quadraticCurveTo(x0 + 27, y1 + 6, x0 + 36, y1);
    g.moveTo(x0 + 22, y2); g.quadraticCurveTo(x0 + 31, y2 - 6, x0 + 40, y2); g.quadraticCurveTo(x0 + 49, y2 + 6, x0 + 58 > 96 ? 96 : x0 + 58, y2);
    H.vien(g, H.rgba(BM.vecMatSangRgb, 0.55), 2.6);
  }
  V.nenNuoc = nenNuoc;

  V.dangKy({ loai: 'o', ma: 'nuoc', ten: 'Mặt nước sông', ky: ['~'], cacTrangThai: [{}, { le: 1 }], ve: function (g, s, H) {
    nenNuoc(g, H, !!(s && s.le));
  } });

  /* DÒNG CHẢY: vẽ quay theo hướng (mặc định chảy LÊN, −y). Thường: một mũi tên trắng + hai vệt bọt; xiết: nền đậm hơn, hai mũi tên vàng; tắt: mũi tên mờ nét đứt. */
  var TT_DONG = [];
  [0, 1, 2, 3].forEach(function (h) { TT_DONG.push({ huong: h }); TT_DONG.push({ huong: h, xiet: true }); TT_DONG.push({ huong: h, tat: true }); });
  TT_DONG.push({ huong: 1, xiet: true, tat: true }, { huong: 0, pha: 0.5 }, { huong: 2, xiet: true, pha: 0.25 });
  V.dangKy({ loai: 'o', ma: 'dong-nuoc', ten: 'Dòng nước chảy', cacTrangThai: TT_DONG, ve: function (g, s, H) {
    s = s || {};
    var h = ((s.huong | 0) % 4 + 4) % 4, xiet = !!s.xiet, tat = !!s.tat, pha = typeof s.pha === 'number' ? ((s.pha % 1) + 1) % 1 : 0, i, y;
    g.save();
    g.translate(50, 50); g.rotate(h * Math.PI / 2); g.translate(-50, -50);
    g.fillStyle = H.gradDoc(g, 0, 100, 0, 0, tat ? [[0, BM.vecNuoc], [1, BM.vecNuocToi]] : xiet ? [[0, BM.vecNuocToi], [1, BM.vecLamDam]] : [[0, BM.vecNuoc], [1, BM.vecNuocToi]]);
    g.fillRect(0, 0, 100, 100);
    if (!tat) {                                                                                    // vệt bọt dọc hai bên (dòng đang chạy)
      g.beginPath();
      for (i = 0; i < 2; i++) { y = 10 + ((i * 44 + (1 - pha) * 44) % 88); g.moveTo(18, y); g.lineTo(18, Math.min(92, y + 18)); g.moveTo(82, Math.max(8, 100 - y - 18)); g.lineTo(82, 100 - y); }
      H.vien(g, H.rgba(BM.vecMatSangRgb, 0.6), 2.6);
    }
    var ys = xiet ? [30, 62] : [48], P = xiet ? 64 : 60;
    ys.forEach(function (y0) {
      var yc = 18 + (((y0 - 18 - pha * P) % P) + P) % P;                                          // trượt theo chiều chảy (−y), quay vòng trong dải 18..18+P của ô
      g.beginPath(); g.moveTo(30, yc + 13); g.lineTo(50, yc - 7); g.lineTo(70, yc + 13);
      if (tat) {
        g.setLineDash([5, 5]); H.vien(g, H.rgba(BM.vecMatSangRgb, 0.55), 4); g.setLineDash([]);
      } else {
        H.vien(g, BM.vecVien, 10); H.vien(g, xiet ? BM.vecCanhBao : BM.vecTroiNhat, 5.5);
      }
    });
    g.restore();
  } });

  /* CỐNG THỦY LỢI: hai trụ bê tông, cánh thép trượt. Đóng: cánh chắn ngang, sọc vàng, đèn đỏ; mở: cánh kéo lên mép trên, đèn xanh, mũi tên luồng thông. */
  V.dangKy({ loai: 'o', ma: 'cong-thuy-loi', ten: 'Cống thủy lợi', ky: ['K', 'k'], cacTrangThai: [{ mo: false }, { mo: true }, { k: 0.5 }], ve: function (g, s, H) {
    s = s || {};
    var k = typeof s.k === 'number' ? Math.max(0, Math.min(1, s.k)) : (s.mo ? 1 : 0), mo = k >= 1, y = 32 - 26 * k, cao = 36 - 24 * k;
    nenNuoc(g, H, false);
    if (k > 0) { g.beginPath(); g.moveTo(37, 64); g.lineTo(50, 50); g.lineTo(63, 64); H.vien(g, BM.vecNuocSang, 4.5); }
    [3, 81].forEach(function (x) {
      H.bo(g, x, 3, 16, 94, 4); g.fillStyle = H.gradDoc(g, x, 0, x + 16, 0, [[0, BM.vecBac], [1, BM.vecBacToi]]); g.fill(); H.vien(g, BM.vecVien, 2.5);
      H.tron(g, x + 8, 84, 4); H.to(g, mo ? BM.vecXanhLa : k > 0 ? BM.vecCanhBao : BM.vecDo); H.vien(g, BM.vecVien, 1.5);
    });
    H.bo(g, 17, y, 66, cao, 4); g.fillStyle = H.gradDoc(g, 0, y, 0, y + cao, [[0, BM.vecThepSang], [1, BM.vecThep]]); g.fill(); H.vien(g, BM.vecVien, 3);
    if (cao > 18) { g.beginPath(); g.moveTo(24, y + cao * 0.33); g.lineTo(76, y + cao * 0.33); g.moveTo(24, y + cao * 0.67); g.lineTo(76, y + cao * 0.67); H.vien(g, BM.vecCanhBao, 3.5); }
    else { g.beginPath(); g.moveTo(24, y + cao / 2); g.lineTo(76, y + cao / 2); H.vien(g, BM.vecCanhBao, 3); }
  } });

  /* VAN CỐNG 'V' (cần gạt trên bờ kè 3D, chiếm ô như tường): khối bờ kè đá-gỗ 3D, bệ thép, rãnh gạt, cần thép, núm. Tắt: cần nghiêng trái, núm đỏ; bật: nghiêng phải, núm xanh lá + quầng. */
  V.dangKy({ loai: 'o', ma: 'van-cong', ten: 'Van cống', ky: ['V'], cacTrangThai: [{}, { bat: true }, { goc: 0.5 }], ve: function (g, s, H) {
    s = s || {};
    var k = typeof s.goc === 'number' ? Math.max(0, Math.min(1, s.goc)) : (s.bat ? 1 : 0), bat = k >= 1, a = (-0.6 + 1.2 * k), dx = Math.sin(a) * 30, dy = -Math.cos(a) * 30;
    g.fillStyle = BM.vecCoVien; g.fillRect(0, 0, 100, 100);
    // Thân khối bờ kè 3D dưới chân van cống
    H.bo(g, 4, 5, 92, 90, 10); g.fillStyle = H.gradDoc(g, 0, 5, 0, 95, [[0, BM.vecGo], [0.65, BM.vecGoGiua], [1, BM.vecGoToi]]); g.fill(); H.vien(g, BM.vecVien, 3);
    H.bo(g, 7, 7, 86, 62, 8); g.fillStyle = H.gradDoc(g, 0, 7, 0, 69, [[0, BM.vecGoMat], [1, BM.vecDatSang]]); g.fill(); H.vien(g, BM.vecGoVien, 2);
    H.bo(g, 14, 58, 72, 28, 6); g.fillStyle = H.gradDoc(g, 0, 58, 0, 86, [[0, BM.vecBac], [1, BM.vecBacToi]]); g.fill(); H.vien(g, BM.vecVien, 2.5);   // bệ
    H.bo(g, 24, 66, 52, 10, 5); H.to(g, BM.vecDe); H.vien(g, BM.vecVien, 1.5);                                                                          // rãnh gạt
    g.beginPath(); g.moveTo(26, 30); g.lineTo(34, 24); g.moveTo(74, 30); g.lineTo(66, 24); H.vien(g, BM.vecVien, 2.5);                                    // vạch hai đầu: tắt / bật
    H.tron(g, 21, 33, 4.5); H.to(g, BM.vecDo); H.vien(g, BM.vecVien, 1.5);
    H.tron(g, 79, 33, 4.5); H.to(g, BM.vecXanhLa); H.vien(g, BM.vecVien, 1.5);
    g.beginPath(); g.moveTo(50, 71); g.lineTo(50 + dx, 71 + dy); H.vien(g, BM.vecVien, 9); H.vien(g, BM.vecThepSang, 5);                                 // cần gạt
    if (bat) { H.tron(g, 50 + dx, 71 + dy, 13); H.to(g, H.rgba(BM.vecDayNoiSangRgb, 0.35)); }
    H.tron(g, 50 + dx, 71 + dy, 8.5); H.to(g, bat ? BM.vecXanhLa : k > 0 ? BM.vecCanhBao : BM.vecDo); H.vien(g, BM.vecVien, 2.5);
    H.tron(g, 50, 71, 5); H.to(g, BM.vecThepToi); H.vien(g, BM.vecVien, 1.5);
  } });

  /* PHAO ĐÍCH 'Q': phao tròn cam - trắng nổi trên nước, cờ xanh lá cắm giữa. */
  V.dangKy({ loai: 'o', ma: 'phao-dich', ten: 'Phao đích', ky: ['Q'], cacTrangThai: [{}], ve: function (g, s, H) {
    nenNuoc(g, H, false);
    H.tron(g, 50, 54, 36); H.vien(g, H.rgba(BM.vecMatSangRgb, 0.7), 2.5);
    H.tron(g, 50, 54, 26); H.to(g, BM.vecVanNong); H.vien(g, BM.vecVien, 3);
    H.tron(g, 50, 54, 15); H.to(g, BM.vecVo); H.vien(g, BM.vecVien, 2);
    g.beginPath(); g.moveTo(50, 56); g.lineTo(50, 16); H.vien(g, BM.vecVien, 3.5);
    H.duong(g, 'M51 16 L72 23 L51 30 Z'); H.to(g, BM.vecXanhLa); H.vien(g, BM.vecVien, 2.2);
  } });

  /* BẾN NHẬN BÈ 'q': ô nước có cầu gỗ chữ U (ba phía), khung đích nét đứt màu đích; s.xong: đã có bè, khung xanh lá liền nét. */
  V.dangKy({ loai: 'o', ma: 'ben-nhan', ten: 'Bến nhận bè', ky: ['q'], cacTrangThai: [{}, { xong: true }], ve: function (g, s, H) {
    var xong = !!(s && s.xong), i;
    nenNuoc(g, H, true);
    H.bo(g, 2, 2, 96, 14, 3); H.to(g, BM.vecDat); H.vien(g, BM.vecDatToi, 2.5);
    H.bo(g, 2, 2, 14, 96, 3); H.to(g, BM.vecDat); H.vien(g, BM.vecDatToi, 2.5);
    H.bo(g, 84, 2, 14, 96, 3); H.to(g, BM.vecDat); H.vien(g, BM.vecDatToi, 2.5);
    g.beginPath(); for (i = 1; i < 4; i++) { g.moveTo(2 + i * 24, 4); g.lineTo(2 + i * 24, 14); g.moveTo(4, 2 + i * 24); g.lineTo(14, 2 + i * 24); g.moveTo(86, 2 + i * 24); g.lineTo(96, 2 + i * 24); }
    H.vien(g, BM.vecDatToi, 2);
    [[9, 9], [91, 9], [9, 91], [91, 91]].forEach(function (p) { H.tron(g, p[0], p[1], 4.5); H.to(g, BM.vecDatSang); H.vien(g, BM.vecVien, 1.8); });   // cọc buộc
    H.bo(g, 22, 22, 56, 70, 8);
    if (xong) { H.vien(g, BM.vecXanhLa, 4); } else { g.setLineDash([7, 6]); H.vien(g, BM.vecDich, 4); g.setLineDash([]); }
  } });

  /* SÀN BẾN SÔNG '.' (san-ben-song): sàn đá lát bến sông ghép ván gỗ ấm áp. */
  V.dangKy({ loai: 'o', ma: 'san-ben-song', ten: 'Sàn đá lát bến sông', cacTrangThai: [{}, { le: 1 }], ve: function (g, s, H) {
    var le = !!(s && s.le);
    g.fillStyle = BM.vecCoVien; g.fillRect(0, 0, 100, 100);
    H.bo(g, 2.5, 2.5, 95, 95, 7);
    g.fillStyle = H.gradDoc(g, 3, 3, 97, 97, le ? [[0, BM.vecCoLe], [1, BM.vecCoDe]] : [[0, BM.vecCo], [1, BM.vecCoToi]]);
    g.fill(); H.vien(g, BM.vecCoGach, 1.8);
    // Hai mạch ván / phiến đá bến sông ngang nhẹ
    H.duong(g, 'M10 34 H90 M10 68 H90');
    g.globalAlpha = 0.35; H.vien(g, BM.vecCoGach, 1.6); g.globalAlpha = 1;
  } });

  /* KHỐI BỜ KÈ BẾN SÔNG '#' (bo-ke-song): khối kè đá kết cọc gỗ bến sông 3D cao (mặt trên ván gỗ/đá sáng y = 8..60 + vách đứng trước cọc gỗ và kè đá sẫm y = 60..94). */
  V.dangKy({ loai: 'o', ma: 'bo-ke-song', ten: 'Khối bờ kè gỗ đá bến sông 3D', cacTrangThai: [{}], ve: function (g, s, H) {
    g.fillStyle = BM.vecCoVien; g.fillRect(0, 0, 100, 100);
    // Thân khối bờ kè 3D cao (vách đứng phía trước sẫm màu y = 60..94)
    H.bo(g, 5, 6, 90, 88, 10);
    g.fillStyle = H.gradDoc(g, 0, 6, 0, 94, [[0, BM.vecGo], [0.58, BM.vecGoGiua], [1, BM.vecGoToi]]);
    g.fill(); H.vien(g, BM.vecVien, 3);
    // Mặt trên khối kè gỗ-đá sáng ấm (y = 8..60)
    H.bo(g, 8, 8, 84, 52, 8);
    g.fillStyle = H.gradDoc(g, 0, 8, 0, 60, [[0, BM.vecGoMat], [0.58, BM.vecGoMatToi], [1, BM.vecGo]]);
    g.fill(); H.vien(g, BM.vecGoVien, 2);
    H.bo(g, 15, 12, 70, 5, 2.5); H.to(g, BM.vecGoSang);
    H.duong(g, 'M12 34 H88'); H.vien(g, BM.vecGoVien, 2.2);
    // Hai đầu cọc gỗ tròn đóng dọc bờ kè trên mặt đỉnh + vách cọc phía trước
    [26, 74].forEach(function (cx) {
      H.bo(g, cx - 7, 60, 14, 33, 3); H.to(g, BM.vecGoToi); H.vien(g, BM.vecVien, 2);
      H.tron(g, cx, 34, 8); H.to(g, BM.vecGoSang); H.vien(g, BM.vecGoVien, 2.2);
      H.tron(g, cx, 34, 3); H.to(g, BM.vecGo);
    });
  } });
})(typeof window !== 'undefined' ? window : globalThis);
