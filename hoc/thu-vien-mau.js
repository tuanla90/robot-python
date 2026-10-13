/* ============================================================================
   thu-vien-mau.js — "Đường học": BẢN MẪU mã nguồn thư viện (window.ThuVienMau).
   Dạng { tên: 'def ...' } — truyền vào ChamHoc.cham(man, baiLam, thuVien).
   Thư viện dựng từ hàm gốc thấp hơn: move ← left_move/right_move/wait,
   u_turn ← turn_right. Học sinh ở chuỗi 2 tự viết lại các hàm này từng bước.
   ========================================================================== */
(function () {
  'use strict';

  var THU_VIEN = {
    move: 'def move():\n    left_move()\n    right_move()\n    wait()',
    turn_right: 'def turn_right():\n    left_move()\n    wait()',
    turn_left: 'def turn_left():\n    right_move()\n    wait()',
    u_turn: 'def u_turn():\n    turn_right()\n    turn_right()'
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = THU_VIEN;
  if (typeof window !== 'undefined') window.ThuVienMau = THU_VIEN;
})();
