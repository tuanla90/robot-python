/* ============================================================================
   man-cham-son.js — "Mật Lệnh Robot": NGÂN HÀNG MÀN MỚI của mùa 4, gói 2 "Chấm sơn" (KE-HOACH-MUA-4.md). HIỆN CHƯA CÓ MÀN.
   Khung mùa 4 (lo-trinh-hoc.js, khối "MÙA 4 = 10 GÓI", mảng MUA_4) đã chừa chỗ: tệp đã có trong danh sách require của lo-trinh-hoc.js và
   thẻ <script> của game/choi.html. Gói sau CHỈ việc thêm màn vào mảng DS dưới đây; màn tự hiện đúng chương, đúng gói.
     - `may-son`: chương 1 "Chấm từng ô" (màn có sẵn may-son.1, .2, .6, .7; màn mới so từ 11)
     - `che-list`: chương 2 "Chế lệnh: đi theo danh sách" (đủ 10 màn có sẵn)
   Mỗi màn khai `chuong` (một trong các mã trên) và `so` (thứ tự trong phần màn mới của chương); mã `ma` = chuong + '.' + so là khóa lưu sao,
   KHÔNG đổi sau khi xuất bản, KHÔNG trùng mã đã có (chương dùng lại mã cũ như drone, may-son, mau, flycam: khai so từ 11). Gọi ManHoc.chuanHoa(m)
   như các tệp màn khác. Màn mới nối SAU các màn có sẵn của chương (chen trước màn trùm có sẵn nếu màn cuối có sẵn là trùm). Chương còn trống thì chưa hiện.
   Ràng buộc mùa 4 (hoc/kiem-lo-trinh.mjs mục mùa 4): được dùng mọi part mùa 1–3 + drone, máy sơn, camera; KHÔNG omni, máy ném, bánh gai, loa;
   bút liền (pen_down / pen_up) chỉ từ gói 6; ô sạc P chỉ từ gói 5. Tên chương và lời theo KE-HOACH-7-MUA.md "Quy tắc đặt tên và giọng kể".
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var DS = [];

  ManHoc.manChamSon = DS;
  if (laNode) module.exports = ManHoc;
})();
