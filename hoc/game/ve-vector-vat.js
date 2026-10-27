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

  /* KHỐI SẮT (chất 'sat', chương nam châm): như mẫu vat-sat — khối xám bạc gradient, tấm giữa lõm, bốn đinh tán. s.mau: đai màu luật ngang thân. */
  V.dangKy({ loai: 'vat', ma: 'khoi-sat', ten: 'Khối sắt', cacTrangThai: [{}].concat(MAU.map(function (m) { return { mau: m }; })), ve: function (g, s, H) {
    H.bo(g, 12, 12, 76, 76, 10); g.fillStyle = H.gradDoc(g, 0, 12, 0, 88, [[0, BM.vecSat], [1, BM.vecSatToi]]); g.fill(); H.vien(g, BM.vecVien, 3);
    H.bo(g, 23, 23, 54, 54, 6); H.to(g, BM.vecSatGiua); H.vien(g, BM.vecSatVien, 2);
    H.duong(g, 'M28 30 H60'); H.vien(g, BM.vecDinh, 3);
    if (s.mau && MAU_DAI[s.mau]) { g.beginPath(); g.rect(12, 44, 76, 13); g.closePath(); H.to(g, BM[MAU_DAI[s.mau]]); H.vien(g, BM.vecVien, 2, 'butt'); }
    dinh(g, H, 19.5, 19.5, 4); dinh(g, H, 80.5, 19.5, 4); dinh(g, H, 19.5, 80.5, 4); dinh(g, H, 80.5, 80.5, 4);
  } });

  /* VẬT NAM CHÂM (chất 'nam-cham', cực N / S): khối màu cực (N đỏ, S xanh dương — nhóm LUAT như bộ pixel), chữ cực trắng viền chàm (vẽ bằng nét, không phụ thuộc phông). */
  var CUC = { N: ['luatVatDo', 'luatVatDoSang', 'luatVatDoToi'], S: ['luatVatXanhDuong', 'luatVatXanhDuongSang', 'luatVatXanhDuongToi'] };
  var CHU = { N: 'M38 68 V33 L62 67 V32', S: 'M61 37 C57 30 39 29 39 41 C39 52 61 48 61 59 C61 71 43 71 38 63' };
  V.dangKy({ loai: 'vat', ma: 'nam-cham', ten: 'Vật nam châm', cacTrangThai: [{ cuc: 'N' }, { cuc: 'S' }], ve: function (g, s, H) {
    var cuc = s.cuc === 'S' ? 'S' : 'N', c = CUC[cuc];
    H.bo(g, 12, 12, 76, 76, 12); g.fillStyle = H.gradDoc(g, 0, 12, 0, 88, [[0, BM[c[1]]], [0.45, BM[c[0]]], [1, BM[c[2]]]]); g.fill(); H.vien(g, BM.vecVien, 3);
    H.duong(g, 'M24 21 H76'); g.globalAlpha = 0.55; H.vien(g, BM.vecVo, 4); g.globalAlpha = 1;
    H.duong(g, CHU[cuc]); H.vien(g, BM.vecVien, 13);
    H.duong(g, CHU[cuc]); H.vien(g, BM.vecVo, 7);
  } });

  /* THÙNG NẶNG (H, h — chương súng hơi, bị đẩy / hất đi): thùng THÉP TỐI xám xanh đậm (vecThep*, gói V3: tông riêng, không lẫn khối sắt xám bạc nhạt, khác mái gầm sọc vàng),
     lớn gần trọn ô, khung viền nổi, tấm giữa thép tối hơn, thanh giằng chéo chữ X sáng, bốn đinh tán lớn ở góc khung, vệt sáng mép trên. */
  V.dangKy({ loai: 'vat', ma: 'thung-nang', ten: 'Thùng nặng', cacTrangThai: [{}], ve: function (g, s, H) {
    H.bo(g, 8, 10, 86, 86, 12); H.to(g, H.rgba(BM.vecVienRgb, 0.16));                                  // bóng đổ lệch phải-dưới (vẽ trong ảnh: thùng đứng trên ô)
    H.bo(g, 6, 6, 86, 86, 12); g.fillStyle = H.gradDoc(g, 0, 6, 0, 92, [[0, BM.vecThep], [1, BM.vecThepToi]]); g.fill(); H.vien(g, BM.vecVien, 3.5);
    H.bo(g, 20, 20, 58, 58, 5); H.to(g, BM.vecThepToi); H.vien(g, BM.vecVien, 2.5);
    H.duong(g, 'M24 24 L74 74 M74 24 L24 74'); H.vien(g, BM.vecVien, 9);
    H.duong(g, 'M24 24 L74 74 M74 24 L24 74'); H.vien(g, BM.vecThepSang, 5);
    H.duong(g, 'M18 12 H80'); H.vien(g, BM.vecThepSang, 3);
    dinh(g, H, 13.5, 13.5, 4.5); dinh(g, H, 84.5, 13.5, 4.5); dinh(g, H, 13.5, 84.5, 4.5); dinh(g, H, 84.5, 84.5, 4.5);
  } });

  /* BÓNG HƠI (súng hơi bắn ra): quả bóng vàng viền chàm, vệt sáng trái trên. s.bep: lúc đập vào vật — bẹp ngang. */
  V.dangKy({ loai: 'vat', ma: 'bong', ten: 'Bóng hơi', cacTrangThai: [{}, { bep: true }], ve: function (g, s, H) {
    if (s.bep) H.elip(g, 50, 56, 44, 28); else H.tron(g, 50, 50, 41);
    g.fillStyle = H.gradToa(g, 38, 36, 52, [[0, BM.vecVangSang], [0.55, BM.vecVang], [1, BM.vecVangToi]]); g.fill(); H.vien(g, BM.vecVien, 7);
    if (s.bep) H.elip(g, 36, 48, 9, 5); else H.tron(g, 36, 35, 9);
    g.globalAlpha = 0.85; H.to(g, BM.vecVo); g.globalAlpha = 1;
  } });
})(typeof window !== 'undefined' ? window : globalThis);
