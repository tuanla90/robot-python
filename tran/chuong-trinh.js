/* ============================================================================
   chuong-trinh.js — các chương trình Python cho Luật trận v0.1.

   Robot GIỐNG HỆT NHAU. Khác nhau chỉ ở đoạn logic dưới đây.
   Mỗi đội viết cho sân nhà của mình: A ở (0,3), B ở (8,3).
   Bản "_B" là bản gương (lật qua trục x=4), dùng để test công bằng của sân.

   Bộ lệnh: move(n) · turn_left() · turn_right() · pick() · drop() · go_to(x,y)
   ========================================================================== */
(function () {
  'use strict';

  function gop(dong) { return dong.join('\n'); }

  /* ---- LOGIC 1 — "lấy hết, bên nhà mình trước" ---------------------------- */
  var LAY_HET_A = gop([
    'def chuyen(x, y):',
    '    go_to(x, y)',
    '    pick()',
    '    go_to(0, 3)',
    '    drop()',
    '',
    'chuyen(3, 3)',
    'chuyen(3, 1)',
    'chuyen(3, 5)',
    'chuyen(5, 3)',
    'chuyen(5, 1)',
    'chuyen(5, 5)'
  ]);
  var LAY_HET_B = gop([
    'def chuyen(x, y):',
    '    go_to(x, y)',
    '    pick()',
    '    go_to(8, 3)',
    '    drop()',
    '',
    'chuyen(5, 3)',
    'chuyen(5, 1)',
    'chuyen(5, 5)',
    'chuyen(3, 3)',
    'chuyen(3, 1)',
    'chuyen(3, 5)'
  ]);

  /* ---- LOGIC 2 — "chỉ lấy hai khối giữa" ---------------------------------
     Chiến thuật thận trọng: chỉ nhắm hai khối gần nhất, lấy xong thì nghỉ.
     Khác hẳn LOGIC 1, và KHÔNG phải bản lỗi — nó là một lựa chọn. */
  var HAI_GIUA_A = gop([
    'def chuyen(x, y):',
    '    go_to(x, y)',
    '    pick()',
    '    go_to(0, 3)',
    '    drop()',
    '',
    'chuyen(3, 3)',
    'chuyen(5, 3)'
  ]);
  var HAI_GIUA_B = gop([
    'def chuyen(x, y):',
    '    go_to(x, y)',
    '    pick()',
    '    go_to(8, 3)',
    '    drop()',
    '',
    'chuyen(5, 3)',
    'chuyen(3, 3)'
  ]);

  /* ---- LOGIC 3 — "cướp bên kia trước" ------------------------------------
     Bỏ khối gần nhà mình, sang nửa sân đối phương lấy trước. */
  var CUOP_A = gop([
    'def chuyen(x, y):',
    '    go_to(x, y)',
    '    pick()',
    '    go_to(0, 3)',
    '    drop()',
    '',
    'chuyen(5, 3)',
    'chuyen(5, 1)',
    'chuyen(5, 5)',
    'chuyen(3, 3)',
    'chuyen(3, 1)',
    'chuyen(3, 5)'
  ]);
  var CUOP_B = gop([
    'def chuyen(x, y):',
    '    go_to(x, y)',
    '    pick()',
    '    go_to(8, 3)',
    '    drop()',
    '',
    'chuyen(3, 3)',
    'chuyen(3, 1)',
    'chuyen(3, 5)',
    'chuyen(5, 3)',
    'chuyen(5, 1)',
    'chuyen(5, 5)'
  ]);

  /* ---- Chương trình hỏng, để test bảo hiểm chống treo máy ---------------- */
  var LAP_VO_TAN = 'while True:\n    turn_left()';

  /* ==========================================================================
     LUẬT v0.2 — mỗi đội hai chương trình: { R1, R2 }
     R1 đi lấy khối ở vùng giữa mang về TRẠM GIAO.
     R2 tới trạm, nhặt khối rồi mang về NHÀ. Chỉ R2 giao ở nhà mới tính điểm.
     ========================================================================== */

  function r1Nhip(nha, tram, ds) {
    var d = ['def lay(x, y):', '    go_to(x, y)', '    pick()', '    go_to(' + tram.x + ', ' + tram.y + ')',
      '    while item_here():', '        wait()', '    drop()', ''];
    ds.forEach(function (t) { d.push('lay(' + t[0] + ', ' + t[1] + ')'); });
    return d.join('\n');
  }
  /** R2: tới trạm, CHỜ có khối (có giới hạn để không treo), rồi mang về nhà. */
  function r2Nhip(nha, tram, soChuyen) {
    return [
      'def thu():',
      '    go_to(' + tram.x + ', ' + tram.y + ')',
      '    n = 0',
      '    while not item_here() and n < 40:',
      '        wait()',
      '        n = n + 1',
      '    if item_here():',
      '        pick()',
      '        go_to(' + nha.x + ', ' + nha.y + ')',
      '        drop()',
      '',
      'for i in range(' + soChuyen + '):',
      '    thu()'
    ].join('\n');
  }

  /* LOGIC v0.2-A — "ăn nhịp": R1 lấy cả 4 khối, R2 làm 4 chuyến bàn giao. */
  var NHIP_A = {
    R1: r1Nhip({ x: 0, y: 3 }, { x: 3, y: 3 }, [[4, 1], [4, 5], [6, 1], [6, 5]]),
    R2: r2Nhip({ x: 0, y: 3 }, { x: 3, y: 3 }, 4)
  };
  /* Bản gương của v0.2-A, cho đội B. */
  var NHIP_B = {
    R1: r1Nhip({ x: 10, y: 3 }, { x: 7, y: 3 }, [[6, 1], [6, 5], [4, 1], [4, 5]]),
    R2: r2Nhip({ x: 10, y: 3 }, { x: 7, y: 3 }, 4)
  };

  /* LOGIC v0.2-B — "giao một chuyến rồi thôi": R1 vẫn lấy đủ, nhưng R2 chỉ
     tới trạm MỘT lần. Khác biệt nằm ở số chuyến bàn giao. */
  var MOT_CHUYEN_B = {
    R1: r1Nhip({ x: 10, y: 3 }, { x: 7, y: 3 }, [[6, 1], [6, 5], [4, 1], [4, 5]]),
    R2: r2Nhip({ x: 10, y: 3 }, { x: 7, y: 3 }, 1)
  };

  /* LOGIC v0.2-C — "R2 không bao giờ tới trạm": cả dây chuyền phải đứng. */
  var KHONG_GIAO_B = {
    R1: r1Nhip({ x: 10, y: 3 }, { x: 7, y: 3 }, [[6, 1], [6, 5], [4, 1], [4, 5]]),
    R2: ['go_to(10, 3)', 'for i in range(6):', '    wait()'].join('\n')
  };

  /* LOGIC v0.2-D — "R1 tự mang về nhà": phải KHÔNG được điểm nào, vì luật bắt
     buộc khối phải qua trạm giao. Dùng để test chính luật đó. */
  var R1_TU_MANG_A = {
    R1: [
      'def mang(x, y):',
      '    go_to(x, y)',
      '    pick()',
      '    go_to(0, 3)',
      '    drop()',
      '',
      'mang(4, 1)',
      'mang(4, 5)'
    ].join('\n'),
    R2: 'for i in range(6):\n    wait()'
  };
  var R1_TU_MANG_B = {
    R1: [
      'def mang(x, y):',
      '    go_to(x, y)',
      '    pick()',
      '    go_to(10, 3)',
      '    drop()',
      '',
      'mang(6, 1)',
      'mang(6, 5)'
    ].join('\n'),
    R2: 'for i in range(6):\n    wait()'
  };

  /* R2 cố đi vào vùng giữa — để test luật "chỉ R1 được vào vùng giữa". */
  var R2_VAO_VUNG_GIUA_A = {
    R1: r1Nhip({ x: 0, y: 3 }, { x: 3, y: 3 }, [[4, 1]]),
    R2: 'go_to(5, 3)\nfor i in range(4):\n    wait()'
  };

  var LAP_VO_TAN_V02 = { R1: 'while True:\n    wait()', R2: 'for i in range(3):\n    wait()' };

  /* ---- TRANH CHẤP CÙNG TICK ------------------------------------------------
     A-R1 đi thẳng tới (6,1) — khối nằm ở NỬA SÂN B — pick ở tick 8.
     B-R1 chờ 2 tick rồi cũng tới (6,1) — cũng pick ở tick 8.
     Cùng tick, cùng khối (6,1) nằm bên nửa sân B ⇒ luật công bằng phải cho B.
     (Cách xử cũ theo thứ tự robot sẽ cho A — đây là ca chứng minh đã sửa.) */
  var TRANH_CHAP_A = {
    R1: 'go_to(6, 1)\npick()\nfor i in range(4):\n    wait()',
    R2: 'for i in range(4):\n    wait()'
  };
  var TRANH_CHAP_B = {
    R1: 'wait()\nwait()\ngo_to(6, 1)\npick()\nfor i in range(4):\n    wait()',
    R2: 'for i in range(4):\n    wait()'
  };

  /* ==========================================================================
     LUẬT v0.3 — hai phương án cho khe "tay gắp".

       TAY_DAI    : gắp được khối ở Ô TRƯỚC MẶT; nhưng thân nặng — cứ hai hành
                    động thì tốn thêm 1 tick (1,5×). CÓ cảm biến item_here().
       CHAN_NHANH : mọi hành động 1 tick, NHƯNG MÙ — không có item_here(),
                    phải chạy theo lịch cố định, không biết khối có ở đó hay không.
     ========================================================================== */

  var V03_IDLE = { R1: 'for i in range(4):\n    wait()', R2: 'for i in range(4):\n    wait()' };

  /* --- ĐỀ "biết trước": khối ở (4,3), ngay trên hàng nhà ------------------- */

  // TAY_DAI: đi thẳng tới khối, gắp tại chỗ, rồi về trạm.
  var V03_TD_BIET = {
    phuongAn: 'TAY_DAI',
    R1: [
      'move(2)',
      'pick()',
      'quay_ve(3)',
      'move(1)',
      'drop()'
    ].join('\n'),
    R2: [
      'move(2)',
      'while not item_here():',
      '    wait()',
      'pick()',
      'quay_ve(3)',
      'move(3)',
      'drop()'
    ].join('\n')
  };

  // CHAN_NHANH: như trên nhưng R2 MÙ — phải chờ theo lịch, không hỏi được.
  var V03_CN_BIET = {
    phuongAn: 'CHAN_NHANH',
    R1: [
      'move(2)',
      'pick()',
      'quay_ve(3)',
      'move(1)',
      'drop()'
    ].join('\n'),
    R2: [
      'move(2)',
      'for i in range(6):',
      '    wait()',
      'pick()',
      'quay_ve(3)',
      'move(3)',
      'drop()'
    ].join('\n')
  };

  /* --- ĐỀ "không biết chỗ": khối ở (6,5), nhưng đề có HAI chỗ khả dĩ ---------
     (4,1) và (6,5). Ai có cảm biến thì đi thẳng tới chỗ có khối; ai mù thì phải
     thử chỗ này rồi chỗ kia. */

  // TAY_DAI: dùng thư viện go_to() để đứng cạnh khối rồi gắp ô trước mặt.
  var V03_TD_KHONG_BIET = {
    phuongAn: 'TAY_DAI',
    R1: [
      'go_to(6, 4)',
      'quay_ve(2)',
      'pick()',
      'go_to(3, 3)',
      'drop()'
    ].join('\n'),
    R2: [
      'move(2)',
      'while not item_here():',
      '    wait()',
      'pick()',
      'quay_ve(3)',
      'move(3)',
      'drop()'
    ].join('\n')
  };

  // CHAN_NHANH: mù nên phải đi thử (4,1) trước, rồi mới tới (6,5).
  var V03_CN_KHONG_BIET = {
    phuongAn: 'CHAN_NHANH',
    R1: [
      'quay_ve(1)',
      'move(2)',
      'quay_ve(0)',
      'move(2)',
      'pick()',
      'quay_ve(2)',
      'move(4)',
      'quay_ve(1)',
      'move(2)',
      'pick()',
      'quay_ve(3)',
      'move(3)',
      'quay_ve(0)',
      'move(2)',
      'drop()'
    ].join('\n'),
    R2: [
      'move(2)',
      'for i in range(40):',
      '    wait()',
      'pick()',
      'quay_ve(3)',
      'move(3)',
      'drop()'
    ].join('\n')
  };

  // Chương trình của TAY_DAI đem chạy dưới CHAN_NHANH → phải lộ locked-command
  var V03_TD_NHUNG_DUNG_ITEM = {
    R1: [
      'move(2)',
      'if item_here():',
      '    pick()',
      'quay_ve(3)',
      'move(1)',
      'drop()'
    ].join('\n'),
    R2: 'for i in range(4):\n    wait()'
  };

  var API = {
    LAY_HET_A: LAY_HET_A, LAY_HET_B: LAY_HET_B,
    HAI_GIUA_A: HAI_GIUA_A, HAI_GIUA_B: HAI_GIUA_B,
    CUOP_A: CUOP_A, CUOP_B: CUOP_B,
    LAP_VO_TAN: LAP_VO_TAN,
    NHIP_A: NHIP_A, NHIP_B: NHIP_B,
    MOT_CHUYEN_B: MOT_CHUYEN_B, KHONG_GIAO_B: KHONG_GIAO_B,
    R1_TU_MANG_A: R1_TU_MANG_A, R1_TU_MANG_B: R1_TU_MANG_B,
    R2_VAO_VUNG_GIUA_A: R2_VAO_VUNG_GIUA_A, LAP_VO_TAN_V02: LAP_VO_TAN_V02,
    TRANH_CHAP_A: TRANH_CHAP_A, TRANH_CHAP_B: TRANH_CHAP_B,
    V03_IDLE: V03_IDLE,
    V03_TD_BIET: V03_TD_BIET, V03_CN_BIET: V03_CN_BIET,
    V03_TD_KHONG_BIET: V03_TD_KHONG_BIET, V03_CN_KHONG_BIET: V03_CN_KHONG_BIET,
    V03_TD_NHUNG_DUNG_ITEM: V03_TD_NHUNG_DUNG_ITEM
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  if (typeof window !== 'undefined') window.ChuongTrinh = API;
})();
