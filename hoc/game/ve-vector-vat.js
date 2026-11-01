var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ve-vector-vat.js — VẬT vector (gói V2): khối sắt (chất 'sat', có đai màu), vật nam châm (chữ cực N đỏ / S xanh), thùng nặng H / h, bóng hơi của súng hơi.
   Hệ 100 × 100; vật nhỏ (khối sắt, nam châm — như thùng gỗ ở ve-vector-o.js) vẽ thân trong hộp 12..88 (76% cạnh) để người gọi dùng chung một phép
   thu cỡ (san-ve.js coVatDat = 10,5 pixel sân → thân ≈ 8 / 14 = 57% ô, luật "vật nhỏ hơn ô"); thùng nặng là khối lớn chiếm gần trọn ô (6..94), vẽ ở cỡ một ô;
   bóng hơi đầy hộp (8..92), san-ve.js vẽ ở cỡ 7 pixel sân như bộ pixel. Mỗi hình khai cacTrangThai cho máy kiểm / trang xem. */
(function (root) {
  var V = root.VeVector || (typeof module === 'object' && require('./ve-vector.js'));
  var MAU_DAI = { red: 'luatVatDo', green: 'luatVatXanhLa', blue: 'luatVatXanhDuong', yellow: 'luatVatVang' };   // đai màu vật (nhóm LUAT, như thùng gỗ)
  var MAU = ['red', 'green', 'blue', 'yellow'];
  function dinh(g, H, x, y, r) { H.tron(g, x, y, r); H.to(g, BM.vecDinh); H.vien(g, BM.vecDinhVien, 1.5); }

  /* KHỐI SẮT (chất 'sat', chương nam châm): khối đúc sắt 3D cao — mặt trên xám bạc sáng (y = 14..54) có tấm lõm và 4 đinh tán, vách đứng trước thép sẫm (y = 54..86). s.mau: đai màu luật ở vách trước. */
  V.dangKy({ loai: 'vat', ma: 'khoi-sat', ten: 'Khối sắt', cacTrangThai: [{}].concat(MAU.map(function (m) { return { mau: m }; })), ve: function (g, s, H) {
    // Thân khối sắt 3D cao (vách trước y = 54..86 sẫm màu tạo chiều cao khối thực)
    H.bo(g, 12, 12, 76, 76, 11);
    g.fillStyle = H.gradDoc(g, 0, 12, 0, 88, [[0, BM.vecSat], [0.55, BM.vecSatToi], [1, BM.vecThepToi]]);
    g.fill(); H.vien(g, BM.vecVien, 3);
    // Mặt trên khối sắt sáng (y = 14..54)
    H.bo(g, 15, 14, 70, 40, 8);
    g.fillStyle = H.gradDoc(g, 0, 14, 0, 54, [[0, BM.vecDinh], [1, BM.vecSat]]);
    g.fill(); H.vien(g, BM.vecSatVien, 1.8);
    H.bo(g, 25, 21, 50, 26, 5); H.to(g, BM.vecSatGiua); H.vien(g, BM.vecSatVien, 1.8);
    H.duong(g, 'M30 26 H62'); H.vien(g, BM.vecDinh, 2.8);
    dinh(g, H, 20.5, 20.5, 3.5); dinh(g, H, 79.5, 20.5, 3.5); dinh(g, H, 20.5, 47.5, 3.5); dinh(g, H, 79.5, 47.5, 3.5);
    // Vách đứng trước (y = 54..88): đai màu luật hoặc gờ thép đúc
    if (s.mau && MAU_DAI[s.mau]) {
      H.bo(g, 16, 60, 68, 16, 4); H.to(g, BM[MAU_DAI[s.mau]]); H.vien(g, BM.vecVien, 2);
      V.dauHinhMau(g, H, s.mau, 50, 34, 12);
    } else {
      H.bo(g, 22, 62, 56, 14, 4); H.to(g, BM.vecThep); H.vien(g, BM.vecVien, 2);
      dinh(g, H, 30, 69, 3); dinh(g, H, 70, 69, 3);
    }
  } });

  /* VẬT NAM CHÂM (chất 'nam-cham', cực N / S): khối từ tính 3D cao — mặt trên (y = 14..58) in chữ cực N/S nổi, vách đứng trước (y = 58..88) bọc cực thép bạc. */
  var CUC = { N: ['luatVatDo', 'luatVatDoSang', 'luatVatDoToi'], S: ['luatVatXanhDuong', 'luatVatXanhDuongSang', 'luatVatXanhDuongToi'] };
  var CHU = { N: 'M38 52 V24 L62 51 V23', S: 'M61 28 C57 22 39 21 39 31 C39 40 61 37 61 46 C61 55 43 55 38 49' };
  V.dangKy({ loai: 'vat', ma: 'nam-cham', ten: 'Vật nam châm', cacTrangThai: [{ cuc: 'N' }, { cuc: 'S' }], ve: function (g, s, H) {
    var cuc = s.cuc === 'S' ? 'S' : 'N', c = CUC[cuc];
    // Thân khối nam châm 3D cao
    H.bo(g, 12, 12, 76, 76, 12);
    g.fillStyle = H.gradDoc(g, 0, 12, 0, 88, [[0, BM[c[0]]], [0.6, BM[c[2]]], [1, BM[c[2]]]]);
    g.fill(); H.vien(g, BM.vecVien, 3);
    // Mặt trên khối nam châm sáng (y = 14..60)
    H.bo(g, 15, 14, 70, 46, 9);
    g.fillStyle = H.gradDoc(g, 0, 14, 0, 60, [[0, BM[c[1]]], [1, BM[c[0]]]]);
    g.fill(); H.vien(g, BM[c[2]], 1.8);
    H.duong(g, 'M24 19 H76'); g.globalAlpha = 0.55; H.vien(g, BM.vecVo, 3.5); g.globalAlpha = 1;
    H.duong(g, CHU[cuc]); H.vien(g, BM.vecVien, 12);
    H.duong(g, CHU[cuc]); H.vien(g, BM.vecVo, 6.5);
    // Vách đứng trước (y = 60..88): má cực sắt từ bạc sáng hai bên
    H.bo(g, 20, 66, 60, 13, 4);
    g.fillStyle = H.gradDoc(g, 0, 66, 0, 79, [[0, BM.vecDinh], [1, BM.vecSatToi]]);
    g.fill(); H.vien(g, BM.vecVien, 2);
  } });

  /* THÙNG NẶNG (H, h — chương súng hơi / xích ủi, bị đẩy / hất đi): khối đối trọng thép đặc 3D cao (mặt trên y = 8..58 có giằng chữ X + 4 bu-lông góc, vách đứng trước y = 58..92 thép sẫm gắn dải đệm vàng cảnh báo). */
  V.dangKy({ loai: 'vat', ma: 'thung-nang', ten: 'Thùng nặng', cacTrangThai: [{}], ve: function (g, s, H) {
    H.bo(g, 8, 10, 86, 86, 12); H.to(g, H.rgba(BM.vecVienRgb, 0.16));                                  // bóng đổ lệch phải-dưới
    // Thân khối thùng nặng 3D cao (vách đứng trước y = 58..92 thép tối sâu)
    H.bo(g, 6, 6, 86, 86, 12);
    g.fillStyle = H.gradDoc(g, 0, 6, 0, 92, [[0, BM.vecThep], [0.58, BM.vecThepToi], [1, BM.vecDe]]);
    g.fill(); H.vien(g, BM.vecVien, 3.5);
    // Mặt trên khối thùng nặng (y = 8..58)
    H.bo(g, 9, 8, 80, 50, 9);
    g.fillStyle = H.gradDoc(g, 0, 8, 0, 58, [[0, BM.vecThepSang], [1, BM.vecThep]]);
    g.fill(); H.vien(g, BM.vecThepToi, 2);
    H.bo(g, 21, 16, 56, 34, 5); H.to(g, BM.vecThepToi); H.vien(g, BM.vecVien, 2.2);
    H.duong(g, 'M25 20 L73 46 M73 20 L25 46'); H.vien(g, BM.vecVien, 8);
    H.duong(g, 'M25 20 L73 46 M73 20 L25 46'); H.vien(g, BM.vecThepSang, 4.5);
    H.duong(g, 'M18 12 H80'); H.vien(g, BM.vecKhoMat, 3);
    dinh(g, H, 15, 14, 4); dinh(g, H, 83, 14, 4); dinh(g, H, 15, 52, 4); dinh(g, H, 83, 52, 4);
    // Vách đứng trước 3D (y = 58..92): gờ chịu lực đẩy + thanh cảnh báo vàng-cam
    H.bo(g, 16, 66, 66, 16, 5); H.to(g, BM.vecDe); H.vien(g, BM.vecVien, 2);
    H.bo(g, 22, 70, 54, 8, 3); H.to(g, BM.vecCanhBao); H.vien(g, BM.vecVien, 1.8);
    dinh(g, H, 15, 84, 3.5); dinh(g, H, 83, 84, 3.5);
  } });

  /* KHỐI NƯỚC (vòi phun bắn ra; mã 'bong' giữ nguyên, 29/10 thay quả bóng hơi vàng): đầu tia nước tròn xanh nước, viền chàm mảnh, vệt sáng trái trên
     (vệt nước phía sau do san-ve.js veBong vẽ). s.bep: lúc đập vào vật — nước TÓE: vũng dẹt + năm giọt bắn ra hình vương miện. */
  V.dangKy({ loai: 'vat', ma: 'bong', ten: 'Khối nước', cacTrangThai: [{}, { bep: true }], ve: function (g, s, H) {
    var nuoc = function (cx, cy, r) { return H.gradToa(g, cx - r * 0.3, cy - r * 0.35, r * 1.3, [[0, BM.vecNuocSang], [0.5, BM.vecNuoc], [1, BM.vecNuocToi]]); };
    if (s.bep) {
      [[18, 30, 9], [34, 16, 8], [50, 11, 9], [66, 16, 8], [82, 30, 9]].forEach(function (q) { H.tron(g, q[0], q[1], q[2]); g.fillStyle = nuoc(q[0], q[1], q[2]); g.fill(); H.vien(g, BM.vecVien, 4); });
      H.elip(g, 50, 64, 44, 24); g.fillStyle = nuoc(50, 64, 44); g.fill(); H.vien(g, BM.vecVien, 6);
      H.elip(g, 36, 57, 10, 5);
    } else {
      H.tron(g, 50, 50, 41); g.fillStyle = nuoc(50, 50, 41); g.fill(); H.vien(g, BM.vecVien, 6);
      H.tron(g, 35, 34, 10);
    }
    g.globalAlpha = 0.9; H.to(g, BM.vecVo); g.globalAlpha = 1;
  } });
})(typeof window !== 'undefined' ? window : globalThis);
