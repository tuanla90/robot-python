/* ============================================================================
   thu-tu-chuong.js — "Đường học": THỨ TỰ CÁC CHƯƠNG (window.ThuTuChuong).

   MUỐN ĐỔI THỨ TỰ CHƯƠNG THÌ CHỈ SỬA MẢNG `thuTu` Ở DƯỚI. Không sửa chỗ nào khác.
   - Mỗi chương có MÃ cố định (chuỗi, không bao giờ đổi): đây là danh tính của chương.
   - Mỗi màn có MÃ cố định `ma` = chương + '.' + số (vd 'vong-lap.4'). Mã không đổi khi
     đổi thứ tự chương → dùng nó làm khóa lưu tiến độ.
   - `id` HIỂN THỊ của màn ("3.4") do ManHoc TÍNH khi nạp, từ vị trí của chương trong
     mảng `thuTu` (vị trí 0 → "1.x"). Đổi thứ tự thì id đổi theo.
   - Giao diện lưu tiến độ cần dùng `ma`, KHÔNG dùng `id`.

   Nạp tệp này TRƯỚC các tệp màn (man-chuoi-1.js trở đi).
   Chương mới: thêm mã vào `thuTu`, thêm tên vào `ten`, rồi viết tệp màn của chương
   (mỗi màn khai `chuong` và `so`, xem man-chuoi-1.js).
   Mã dự kiến sau này: 'tay-gap', 'bang-chuyen' (chưa có màn thì CHƯA thêm vào mảng).

   Chạy được trong Node (module.exports) và trình duyệt (window.ThuTuChuong).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);

  var API = {
    thuTu: ['hai-banh', 'xuong-ham', 'vong-lap'],
    ten: {
      'hai-banh': 'Hai bánh',
      'xuong-ham': 'Xưởng hàm',
      'vong-lap': 'Vòng lặp'
    }
  };

  if (laNode) module.exports = API;
  if (typeof window !== 'undefined') window.ThuTuChuong = API;
})();
