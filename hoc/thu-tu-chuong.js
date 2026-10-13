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
   Chương 5 'bang-chuyen' (Băng chuyền) nằm ở man-bang-chuyen.js.
   Chương 6 'tham-so' (Hàm có tham số) nằm ở man-tham-so.js.
   Chương 7 'nhen' (Thân nhện) nằm ở man-nhen.js.
   Chương 8 'xich' (Bánh xích) nằm ở man-xich.js.
   Chương 9 'omni' (Bánh omni) nằm ở man-omni.js.
   Chương 10 'tam-day' (Tấm đẩy) nằm ở man-tam-day.js.
   Chương 11 'khoang-cach' (Cảm biến khoảng cách) nằm ở man-khoang-cach.js.
   Chương 12 'mau' (Cảm biến màu) nằm ở man-mau.js.

   Chạy được trong Node (module.exports) và trình duyệt (window.ThuTuChuong).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);

  var API = {
    thuTu: ['hai-banh', 'xuong-ham', 'tay-gap', 'vong-lap', 'bang-chuyen', 'tham-so', 'nhen', 'xich', 'omni', 'tam-day', 'khoang-cach', 'mau'],
    ten: {
      'hai-banh': 'Hai bánh',
      'xuong-ham': 'Xưởng hàm',
      'tay-gap': 'Tay gắp',
      'vong-lap': 'Vòng lặp',
      'bang-chuyen': 'Băng chuyền',
      'tham-so': 'Hàm có tham số',
      'nhen': 'Thân nhện',
      'xich': 'Bánh xích',
      'omni': 'Bánh omni',
      'tam-day': 'Tấm đẩy',
      'khoang-cach': 'Cảm biến khoảng cách',
      'mau': 'Cảm biến màu'
    }
  };

  if (laNode) module.exports = API;
  if (typeof window !== 'undefined') window.ThuTuChuong = API;
})();
