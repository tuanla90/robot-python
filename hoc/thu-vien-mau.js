/* ============================================================================
   thu-vien-mau.js — "Robot Chấn Hưng": BỘ HÀM CỦA EM MẪU, dùng cho test (window.HamCuaEmMau).
   (Tên tệp giữ từ thời "thư viện theo trùm"; nay là kho hàm của em, xem kho-ham.js.)
   Dạng mảng [ { ten, thamSo, than } ] — đúng dạng ChamHoc.cham(man, baiLam, hamCuaEm) nhận.
   Dựng từ hàm gốc thấp hơn: move ← left_move/right_move/wait, u_turn ← turn_right,
   pick / drop ← arm_down/grab/release/arm_up/wait (làm trọn việc, trả tay về nâng); gắp / thả ở Ô TRƯỚC MẶT (luật vật 14/10).
   Ở game thật học sinh tự viết các hàm này từng bước (chuỗi 2).
   ========================================================================== */
(function () {
  'use strict';

  var HAM_MAU = [
    { ten: 'move', thamSo: [], than: ['left_move()', 'right_move()', 'wait()'] },
    { ten: 'turn_right', thamSo: [], than: ['left_move()', 'wait()'] },
    { ten: 'turn_left', thamSo: [], than: ['right_move()', 'wait()'] },
    { ten: 'u_turn', thamSo: [], than: ['turn_right()', 'turn_right()'] },
    // chương tay-gap, cách chuẩn: nhặt / thả xong thì NÂNG TAY lại (nhịp riêng) nên lệnh đi sau chạy ngay được
    { ten: 'pick', thamSo: [], than: ['arm_down()', 'grab()', 'wait()', 'arm_up()', 'wait()'] },
    { ten: 'drop', thamSo: [], than: ['arm_down()', 'release()', 'wait()', 'arm_up()', 'wait()'] }
  ];

  if (typeof module !== 'undefined' && module.exports) module.exports = HAM_MAU;
  if (typeof window !== 'undefined') window.HamCuaEmMau = HAM_MAU;
})();
