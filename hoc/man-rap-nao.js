/* ============================================================================
   man-rap-nao.js — "Đường học": chương rap-nao · Lắp ráp: Thân + Não (10 màn, chế độ lắp ráp). ĐANG LÀM — xem KE-HOACH-LAP-RAP.md.
   Nối tiếp man-chuoi-1.js vào cùng window.ManHoc. Thứ tự chương: thu-tu-chuong.js.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var DS = [];

  ManHoc.them(DS);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();
