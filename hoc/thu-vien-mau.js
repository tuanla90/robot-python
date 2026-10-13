/* ============================================================================
   thu-vien-mau.js — "Đường học": BỘ HÀM CỦA EM MẪU, dùng cho test (window.HamCuaEmMau).
   (Tên tệp giữ từ thời "thư viện theo trùm"; nay là kho hàm của em, xem kho-ham.js.)
   Dạng mảng [ { ten, thamSo, than } ] — đúng dạng ChamHoc.cham(man, baiLam, hamCuaEm) nhận.
   Dựng từ hàm gốc thấp hơn: move ← left_move/right_move/wait, u_turn ← turn_right.
   Ở game thật học sinh tự viết các hàm này từng bước (chuỗi 2).
   ========================================================================== */
(function () {
  'use strict';

  var HAM_MAU = [
    { ten: 'move', thamSo: [], than: ['left_move()', 'right_move()', 'wait()'] },
    { ten: 'turn_right', thamSo: [], than: ['left_move()', 'wait()'] },
    { ten: 'turn_left', thamSo: [], than: ['right_move()', 'wait()'] },
    { ten: 'u_turn', thamSo: [], than: ['turn_right()', 'turn_right()'] }
  ];

  if (typeof module !== 'undefined' && module.exports) module.exports = HAM_MAU;
  if (typeof window !== 'undefined') window.HamCuaEmMau = HAM_MAU;
})();
