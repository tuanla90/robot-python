/* ============================================================================
   man-demo.js — diem10code-python: MÀN DEMO cho các mùa cốt lõi chưa dựng.

   Chỉ để CHỨNG MINH khung game (bảng mẫu, chấm bài, vẽ robot) hoạt động đúng
   với mỗi loại thân đã giữ lại. KHÔNG phải màn thật của lộ trình ôn thi — xem
   README.md mục "Việc còn lại" trước khi thêm màn mới vào lộ trình thật.

   Mẫu hồ sơ màn (`chuong`, `so`, `ten`, `san`, `batDau`, `maMau`, `loiGiai`…)
   giữ đúng schema của bản gốc (hoc/man-chuoi-1.js), xem lại ở đó nếu cần tra cứu.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-co-so.js') : window.ManHoc;

  /* Cả 4 mùa cốt lõi đã có màn thật (man-m1-*.js … man-m4-*.js, xem thu-tu-chuong.js), hiện không còn màn demo nào. */

  if (laNode) module.exports = ManHoc;
})();
