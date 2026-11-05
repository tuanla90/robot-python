/* ============================================================================
   lo-trinh-hoc.js — diem10code-python: điểm vào cuối của lộ trình.

   Bản gốc dùng tệp này để NẠP toàn bộ ngân hàng màn rồi sửa/ghép lại. Dự án này
   chưa cần bước ghép đó: man-co-so.js (sổ màn) + man-demo.js (nội dung) đã đủ.
   Giữ tên tệp và vị trí nạp (SAU man-demo.js, TRƯỚC giao diện) để khỏi phải sửa
   choi.html / server-side script khi lộ trình thật được viết vào đây sau này.
   ========================================================================== */
(function () {
  'use strict';
  var laNode = (typeof module !== 'undefined' && module.exports);
  if (laNode) {
    require('./man-co-so.js');
    ['m1-than', 'm1-tay', 'm1-cambien', 'm1-san', 'm1-nangcap', 'm1-trum'].forEach(function (n) { require('./man-m1-' + n.replace('m1-', '') + '.js'); });
  }
  var M = laNode ? require('./man-demo.js') : window.ManHoc;
  if (laNode) module.exports = M;
})();
