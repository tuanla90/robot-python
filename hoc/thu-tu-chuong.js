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
   THỨ TỰ MỚI (kế hoạch "Chế lệnh", 14/10, xem KE-HOACH-CHE-LENH.md): đợt 1 = hai-banh, xuong-ham, che-xe, tay-gap, vong-lap, khoang-cach (mỗi part chỉ mở vài
   lệnh gốc, người chơi tự chế hàm); đợt 2 = các chương còn lại, mở CÙNG LÚC khi thắng trùm của chương cổng (congDot2). Chỉ liệt kê chương ĐÃ CÓ tệp màn;
   ba chương chế lệnh (che-tay, che-lap, che-cam-bien) và robot-hoan-thien đã có tệp màn và nằm đúng vị trí trong mảng. Số chương hiển thị (id màn) đổi theo vị trí trong mảng.
   Chương 3 'che-xe' (Chế lệnh xe) nằm ở man-che-xe.js.
   Chương 10 'robot-hoan-thien' (Robot hoàn thiện, chương cổng mở đợt 2) nằm ở man-robot-hoan-thien.js.
   Chương 'bang-chuyen' (Băng chuyền) nằm ở man-bang-chuyen.js.
   Chương 6 'tham-so' (Hàm có tham số) nằm ở man-tham-so.js.
   Chương 7 'nhen' (Thân nhện) nằm ở man-nhen.js.
   Chương 8 'xich' (Bánh xích) nằm ở man-xich.js.
   Chương 9 'omni' (Bánh omni) nằm ở man-omni.js.
   Chương 10 'tam-day' (Tấm đẩy) nằm ở man-tam-day.js.
   Chương 11 'khoang-cach' (Cảm biến khoảng cách) nằm ở man-khoang-cach.js.
   Chương 12 'mau' (Cảm biến màu) nằm ở man-mau.js.
   Chương 13 'nam-cham' (Nam châm) nằm ở man-nam-cham.js.
   Chương 14 'may-nem' (Máy ném) nằm ở man-may-nem.js.
   Chương 15 'sung-bong' (Súng bóng) nằm ở man-sung-bong.js.
   Chương 16 'drone' (Drone) nằm ở man-drone.js.

   Chạy được trong Node (module.exports) và trình duyệt (window.ThuTuChuong).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);

  var API = {
    thuTu: ['hai-banh', 'xuong-ham', 'che-xe', 'tay-gap', 'che-tay', 'vong-lap', 'che-lap', 'khoang-cach', 'che-cam-bien', 'robot-hoan-thien',
      'bang-chuyen', 'tham-so', 'nhen', 'xich', 'omni', 'tam-day', 'mau', 'nam-cham', 'may-nem', 'sung-bong', 'drone'],
    // các chương đợt 2 (khóa tới khi thắng trùm của chương cổng)
    dot2: ['bang-chuyen', 'tham-so', 'nhen', 'xich', 'omni', 'tam-day', 'mau', 'nam-cham', 'may-nem', 'sung-bong', 'drone'],
    // chương cổng: thắng trùm chương này (Robot hoàn thiện, chương 10 cuối đợt 1) thì mở cả đợt 2.
    congDot2: 'robot-hoan-thien',
    ten: {
      'hai-banh': 'Hai bánh',
      'xuong-ham': 'Xưởng hàm',
      'che-xe': 'Chế lệnh xe',
      'tay-gap': 'Tay gắp',
      'che-tay': 'Chế lệnh tay',
      'vong-lap': 'Vòng lặp',
      'che-lap': 'Chế lệnh có for',
      'che-cam-bien': 'Chế lệnh có if, while',
      'robot-hoan-thien': 'Robot hoàn thiện',
      'bang-chuyen': 'Băng chuyền',
      'tham-so': 'Hàm có tham số',
      'nhen': 'Thân nhện',
      'xich': 'Bánh xích',
      'omni': 'Bánh omni',
      'tam-day': 'Tấm đẩy',
      'khoang-cach': 'Cảm biến khoảng cách',
      'mau': 'Cảm biến màu',
      'nam-cham': 'Nam châm',
      'may-nem': 'Máy ném',
      'sung-bong': 'Súng bóng',
      'drone': 'Drone'
    }
  };

  /** Chương `ma` thuộc đợt 2 (mở sau khi thắng trùm chương cổng)? */
  API.laDot2 = function (ma) { return API.dot2.indexOf(ma) >= 0; };

  if (laNode) module.exports = API;
  if (typeof window !== 'undefined') window.ThuTuChuong = API;
})();
