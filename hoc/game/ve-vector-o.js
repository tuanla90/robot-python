var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ve-vector-o.js — Ô SÂN và VẬT vector (gói V1): sàn, tường, cờ, thùng gỗ. Hệ 100 × 100 một ô, theo hoc/hinh-mau/thu-vector.html.
   Ô / vật còn lại có ở gói V2: ve-vector-o2.js (bậc thang, hố, gầm, sàn màu, ô sạc, rào, ô đích), ve-vector-may.js (băng chuyền, nút bắn, nút đè, cửa,
   bàn xoay, cổng), ve-vector-vat.js (khối sắt, nam châm, thùng nặng, bóng hơi); bảng nối ký hiệu → hình: ve-vector-ky-hieu.js.
   Thêm một ô: VeVector.dangKy({ loai: 'o', ma, ten, ve: function (g, s, H) { … } }); một vật: loai 'vat' (vẽ đầy ô, người gọi quyết cỡ). */
(function (root) {
  var V = root.VeVector || (typeof module === 'object' && require('./ve-vector.js'));
  var MAU_DAI = { red: 'luatVatDo', green: 'luatVatXanhLa', blue: 'luatVatXanhDuong', yellow: 'luatVatVang' };   // vật mang màu (chương cảm biến màu): đai đổi theo màu luật

  /* Ô SÀN: tấm trắng bo góc, gradient chéo nhạt, viền lưới lavender, một vệt bóng ở góc trên trái.
     Gói V4 (user 27/10): sàn BÀN CỜ hai tông xen kẽ theo (x + y) chẵn / lẻ — s.le (1: ô lẻ, xám nhạt hơn một bậc; thiếu / 0: ô chẵn, trắng lab hơi xám), chênh nhẹ. */
  function nenLuoi(g) { g.fillStyle = BM.vecSanToi; g.fillRect(0, 0, 100, 100); }   // nền lavender lộ ra ở khe giữa các tấm (lưới mờ của sân lab); sân vẽ kín ô nên nền canvas không lộ
  V.dangKy({ loai: 'o', ma: 'san', ten: 'Sàn lab', cacTrangThai: [{}, { le: 1 }], ve: function (g, s, H) {
    var le = !!(s && s.le);
    nenLuoi(g);
    H.bo(g, 3, 3, 94, 94, 6); g.fillStyle = H.gradDoc(g, 3, 3, 97, 97, le ? [[0, BM.vecSanLe], [1, BM.vecSanLeToi]] : [[0, BM.vecSanChan], [1, BM.vecSanChanToi]]); g.fill(); H.vien(g, BM.vecSanVien, 2);
    H.duong(g, 'M14 30 L30 14'); g.globalAlpha = 0.9; H.vien(g, BM.vecSan, 5); g.globalAlpha = 1;                 // vệt sáng trắng (vecSan) trên cả hai tông
  } });

  /* Ô TƯỜNG: khối trắng bạc nhìn từ trên, mặt trên trắng viền nhạt, dải đèn cyan với vệt sáng. */
  V.dangKy({ loai: 'o', ma: 'tuong', ten: 'Tường', ve: function (g, s, H) {
    nenLuoi(g);
    H.bo(g, 2, 2, 96, 96, 10); g.fillStyle = H.gradDoc(g, 0, 2, 0, 98, [[0, BM.vecTuong], [1, BM.vecTuongToi]]); g.fill(); H.vien(g, BM.vecTuongVien, 3);
    H.bo(g, 14, 10, 72, 70, 8); H.to(g, BM.vecTuongTrong); H.vien(g, BM.vecTuongTrongVien, 2);
    H.bo(g, 24, 26, 52, 9, 4.5); H.to(g, BM.vecDen);
    H.bo(g, 28, 28, 44, 3, 1.5); H.to(g, BM.vecDenSang);
  } });

  /* CỜ ĐÍCH (vẽ ĐÈ lên ô sàn): đế trắng trên vệt bóng, cột bạc, đỉnh tròn, cờ hồng bay sang phải. */
  V.dangKy({ loai: 'o', ma: 'co', ten: 'Cờ đích', ve: function (g, s, H) {
    H.elip(g, 38, 86, 16, 6); H.to(g, BM.vecBong);
    H.bo(g, 26, 76, 24, 10, 4); H.to(g, BM.vecVo); H.vien(g, BM.vecVien, 2.5);
    H.bo(g, 35, 16, 6, 64, 3); H.to(g, BM.vecBac); H.vien(g, BM.vecVien, 2);
    H.tron(g, 38, 15, 6); H.to(g, BM.vecBacSang); H.vien(g, BM.vecVien, 2);
    H.duong(g, 'M41 22 C58 18 66 28 84 22 L84 50 C66 56 58 46 41 50 Z'); H.to(g, BM.vecDoiR2); H.vien(g, BM.vecVien, 2.5);
  } });

  /* THÙNG GỖ (vật 'o' của luật, chat 'go'): hộp trắng toả sáng, đai xanh có khoá sáng, vệt bóng trên nắp. s.mau ('red'…): đai đổi theo màu vật. Vẽ đầy ô 100 (12..88): người gọi thu về cỡ vật. */
  V.dangKy({ loai: 'vat', ma: 'thung-go', ten: 'Thùng gỗ', ve: function (g, s, H) {
    var dai = s && s.mau && MAU_DAI[s.mau] ? BM[MAU_DAI[s.mau]] : BM.vecDai;
    H.bo(g, 12, 14, 76, 72, 14); g.fillStyle = H.gradVo(g, 12, 14, 76, 72); g.fill(); H.vien(g, BM.vecVien, 3);
    g.beginPath(); g.rect(12, 46, 76, 14); g.closePath(); H.to(g, dai); H.vien(g, BM.vecVien, 2, 'butt');
    H.bo(g, 40, 49, 20, 8, 3); H.to(g, BM.vecDenSang);
    H.duong(g, 'M26 24 h48'); H.vien(g, BM.vecVo, 4);
  } });
})(typeof window !== 'undefined' ? window : globalThis);
