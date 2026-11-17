/* ============================================================================
   ban.js — Mật Lệnh Robot: BẢN ĐANG CHƠI (window.Ban / module.exports).

   Một game, hai bản, cùng lõi (san-hoc.js, cham.js, nhan/) và cùng giao diện (game/):
     'day-du'  Bản đầy đủ: 9 mùa (game/choi.html, nội dung hoc/man-*.js, lộ trình hoc/lo-trinh-hoc.js)
     'on-thi'  Bản Ôn thi THPT: 5 mùa (game/on-thi.html, nội dung hoc/on-thi/*.js)

   Trang chọn bản TRƯỚC khi nạp mọi script khác: on-thi.html đặt window.BAN_GAME = 'on-thi'.
   Không đặt gì thì là bản đầy đủ, nên choi.html và mọi máy kiểm cũ không đổi. Máy kiểm của
   bản Ôn thi (Node) đặt globalThis.BAN_GAME = 'on-thi' trước khi require.

   Chỗ khác nhau giữa hai bản đọc ở đây, không đọc thẳng BAN_GAME:
     Ban.ma          'day-du' | 'on-thi'
     Ban.laOnThi     true ở bản Ôn thi
     Ban.tienToKho   tiền tố khóa lưu: bản đầy đủ 'duong-hoc:' (như cũ), bản Ôn thi 'on-thi:'
                     (luu.js đổi tiền tố ở một chỗ, nên sao, bản nháp, kho hàm của hai bản tách nhau)
     Ban.trang       trang chơi của bản: 'choi.html' | 'on-thi.html'
     Ban.trangKia    trang của bản còn lại (nút chuyển bản)
   ========================================================================== */
(function () {
  'use strict';
  var laNode = (typeof module !== 'undefined' && module.exports);
  var g = (typeof globalThis !== 'undefined') ? globalThis : (typeof window !== 'undefined' ? window : {});
  var ma = g.BAN_GAME === 'on-thi' ? 'on-thi' : 'day-du';
  var Ban = {
    ma: ma,
    laOnThi: ma === 'on-thi',
    tienToKho: ma === 'on-thi' ? 'on-thi:' : 'duong-hoc:',
    trang: ma === 'on-thi' ? 'on-thi.html' : 'choi.html',
    trangKia: ma === 'on-thi' ? 'choi.html' : 'on-thi.html',
    ten: ma === 'on-thi' ? 'Ôn thi THPT' : 'Bản đầy đủ',
    tenKia: ma === 'on-thi' ? 'Bản đầy đủ' : 'Ôn thi THPT'
  };
  if (laNode) module.exports = Ban;
  if (typeof window !== 'undefined') window.Ban = Ban;
})();
