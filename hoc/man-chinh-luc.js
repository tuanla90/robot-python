/* ============================================================================
   man-chinh-luc.js — Mùa 6 "Mỏ đá" · Gói 6 "Chỉnh lực hất" (20 màn)
   - Chương 1: chinh-luc (10 màn: chinh-luc.1 .. chinh-luc.10) — "Hất gần, hất xa"
     Màn 1 trình diễn (chiChay: true), màn 2–9 luyện aim(1), aim(2), aim(3)
     kết hợp load(), throw(), lob(), đi chéo và radar(), màn 10 trùm 2 sân.
   - Chương 2: che-chinh-luc (10 màn: che-chinh-luc.1 .. che-chinh-luc.10) — "Chế lệnh: hất đúng tầm"
     Chế 5 hàm mới: aim_lob(n), fill_far(), lob_step(r), auto_aim(), diag_aim(n)
     + 1 màn sửa hàm hỏng (che-chinh-luc.8), màn 10 trùm 2 sân.
   Toàn bộ 20 màn chạy trên Máy khai mỏ R1 (loaiRobot: 'omni', tay: 'nem',
   camBien: [{ ma: 'radar', o: 'tren' }], omniCheo: true, chinhLuc: true,
   tamNemMacDinh: 2, daLapHo: true).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var KHAY_CHINH_LUC = ['left_move', 'right_move', 'left_back', 'right_back', 'slide_left', 'slide_right', 'wait', 'load', 'throw', 'radar', 'diag_left', 'diag_right', 'aim'];
  var ROBOT_CHINH_LUC = { than: 'omni', tay: 'nem', camBien: [{ ma: 'radar', o: 'tren' }] };
  var CAU_TRUC = ['for', 'if', 'while', 'list'];

  function bai(chinh, Phu) {
    return {
      chinh: chinh,
      hamCuaMan: (Phu && Phu.hamCuaMan) || [],
      hamCuaEmMoi: (Phu && Phu.hamCuaEmMoi) || []
    };
  }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo, than: than }; }

  var T_AIM_LOB = ['aim(n)', 'lob()'];
  var T_FILL_FAR = ['aim_lob(3)', 'forward(3)'];
  var T_LOB_STEP = ['slide_r(r[0])', 'aim_lob(r[1])'];
  var T_AUTO_AIM = ['g = radar()', 't = g[1][2]', 'if t == "#":', '    aim_lob(3)', 'else:', '    aim_lob(2)', 'forward(3)'];
  var T_DIAG_AIM = ['diag_right()', 'aim_lob(n)'];

  function manCL(o) {
    return Object.assign({
      loaiRobot: 'omni',
      robot: ROBOT_CHINH_LUC,
      omniCheo: true,
      chinhLuc: true,
      tamNemMacDinh: 2,
      daLapHo: true,
      hamGoc: KHAY_CHINH_LUC,
      moXuong: true,
      mucTieu: 'toi-co',
      khung: { chinh: 10, moiHam: 10, cauTruc: CAU_TRUC },
      cauTruc: CAU_TRUC,
      taoHam: [],
      hamCuaEmCan: [],
      loiSai: [],
      goiY: [],
      phienBanNoiDung: 2
    }, o);
  }

  var DS = [
    /* ========================================================================
       CHƯƠNG 1: chinh-luc — "Hất gần, hất xa" (10 màn)
       ======================================================================== */

    /* ---- Màn 1: Trình diễn nâng cấp chỉnh lực aim(n) (chiChay: true) ---- */
    manCL({
      id: 6601, chuong: 'chinh-luc', so: 1, ma: 'chinh-luc.1',
      ten: 'Cần gạt chỉnh tầm', hang: 'lam-quen',
      chiChay: true, chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward', 'lob'],
      deBai: 'Tay hất đá của R1 vừa được nâng cấp bộ chỉnh lực `aim(n)` (`n` là `1`, `2` hoặc `3`), đổi tầm ném ngay mà không tốn nhịp. Khi gọi `aim(3)`, lệnh `lob()` sẽ hất viên đá bay xa 3 ô lấp đầy hố sâu ở xa. Bấm Chạy để xem!',
      veMaMau: 'Chương trình đã viết sẵn và khóa. Bấm Chạy để xem R1 chỉnh tầm 3 ô và hất đá lấp hố.',
      goiY: ['Bấm nút Chạy để xem aim(3) giúp lob() hất viên đá bay xa 3 ô tới hố sâu ở (1, 2).'],
      san: [
        '###',
        '#F#',
        '#u#',
        '#.#',
        '#o#',
        '#.#',
        '###'
      ],
      batDau: { x: 1, y: 5, huong: 0 },
      maMau: bai(['aim(3)', 'lob()', 'forward(4)']),
      loiGiai: bai(['aim(3)', 'lob()', 'forward(4)']),
      sao: { o: 12, nhip: 6 },
      loiBinh: 'Lệnh aim(n) đặt lại tầm ném 1, 2 hoặc 3 ô ngay tức thì mà không tốn nhịp nào.'
    }),

    /* ---- Màn 2: Hất gần 1 ô bằng aim(1) ---- */
    manCL({
      id: 6602, chuong: 'chinh-luc', so: 2, ma: 'chinh-luc.2',
      ten: 'Hất gần một ô', hang: 'lam-quen',
      hamCuaEmCan: ['move', 'forward', 'slide_r'],
      deBai: 'R1 đã xúc viên đá và trượt sang cột phải, ngay trước mũi xe 1 ô là hố sâu `u`. Hãy gọi `aim(1)` trước `throw()` và `wait()` để thả đá xuống đúng ô hố ngay trước mặt, rồi gọi `forward(2)` tới cờ.',
      veMaMau: 'Chương trình có sẵn chưa gọi aim(1) nên ném xa 2 ô vào cờ. Hãy thêm aim(1) trước throw().',
      goiY: [
        'Mặc định máy ném hất xa 2 ô. Muốn thả đá vào ô ngay trước mặt (cách 1 ô), hãy gọi aim(1).',
        'Sau khi throw() và wait() lấp hố ở (2, 2), gọi forward(2) để lên cờ ở (2, 1).'
      ],
      san: [
        '####',
        '##F#',
        '#ou#',
        '#..#',
        '####'
      ],
      batDau: { x: 1, y: 3, huong: 0 },
      maMau: bai(['load()', 'wait()', 'slide_r(1)', 'throw()', 'wait()', 'forward(2)']),
      loiGiai: bai(['load()', 'wait()', 'slide_r(1)', 'aim(1)', 'throw()', 'wait()', 'forward(2)']),
      sao: { o: 15, nhip: 5 },
      loiSai: [
        { moTa: 'Quên gọi aim(1) nên đá bay 2 ô vượt qua hố, khi tiến lên xe rơi xuống hố', baiLam: bai(['load()', 'wait()', 'slide_r(1)', 'throw()', 'wait()', 'forward(2)']), phaiCoMa: ['roi-ho'] },
        { moTa: 'Đặt nhầm aim(3) nên đá đập vào tường phía trên làm vỡ đá', baiLam: bai(['load()', 'wait()', 'slide_r(1)', 'aim(3)', 'throw()', 'wait()', 'forward(2)']), phaiCoMa: ['nem-vo'] }
      ],
      loiBinh: 'Với aim(1), máy ném thả đá ngay ô trước mũi xe để lấp những hố nằm sát bên.'
    }),

    /* ---- Màn 3: Đổi tầm aim(3) rồi aim(2) ---- */
    manCL({
      id: 6603, chuong: 'chinh-luc', so: 3, ma: 'chinh-luc.3',
      ten: 'Hai máng xa gần', hang: 'lam-quen',
      mucTieu: 'dua-vat',
      hamCuaEmCan: ['slide_r', 'lob'],
      deBai: 'Cột bên trái có máng đích `D` cách xe 3 ô, còn cột bên phải có máng đích `D` cách xe 2 ô. Hãy dùng `aim(3)` rồi `lob()` ở cột đầu, trượt phải 2 ô bằng `slide_r(2)`, rồi dùng `aim(2)` và `lob()` ở cột thứ hai.',
      veMaMau: 'Chương trình có sẵn đã hất viên đá đầu bằng aim(3) và trượt sang cột phải. Hãy chỉnh lại aim(2) rồi gọi lob().',
      goiY: [
        'Khi đã đặt aim(3), máy ném giữ nguyên tầm 3 ô cho tới khi em gọi aim() lần mới.',
        'Sau slide_r(2), hãy gọi aim(2) rồi gọi lob() để hất viên đá thứ hai vào máng ở (3, 3).'
      ],
      san: [
        '#####',
        '#D###',
        '#=#D#',
        '#o#o#',
        '#...#',
        '#####'
      ],
      batDau: { x: 1, y: 4, huong: 0 },
      maMau: bai(['aim(3)', 'lob()', 'slide_r(2)']),
      loiGiai: bai(['aim(3)', 'lob()', 'slide_r(2)', 'aim(2)', 'lob()']),
      sao: { o: 12, nhip: 6 },
      loiSai: [
        { moTa: 'Chưa hất viên đá thứ hai ở cột bên phải', baiLam: bai(['aim(3)', 'lob()', 'slide_r(2)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên đổi lại aim(2) ở cột phải nên viên đá thứ hai đập vào tường ở (3, 1)', baiLam: bai(['aim(3)', 'lob()', 'slide_r(2)', 'lob()']), phaiCoMa: ['nem-vo'] }
      ],
      loiBinh: 'Tầm ném đã chọn bằng aim(n) được giữ nguyên cho tới lần gọi aim() tiếp theo.'
    }),

    /* ---- Màn 4: Duyệt danh sách tầm ném ---- */
    manCL({
      id: 6604, chuong: 'chinh-luc', so: 4, ma: 'chinh-luc.4',
      ten: 'Dãy máng ba tầm', hang: 'luyen',
      mucTieu: 'dua-vat',
      hamCuaEmCan: ['slide_r', 'lob'],
      deBai: 'Ba cột đá liên tiếp có máng nhận `D` ở khoảng cách lần lượt theo danh sách `dists = [2, 3, 2]`. Hãy duyệt `for d in dists:`: mỗi lượt trượt phải 1 ô `slide_r(1)`, đặt tầm `aim(d)` rồi gọi `lob()`.',
      veMaMau: 'Chương trình có sẵn đã khai báo dists = [2, 3, 2]. Hãy viết vòng lặp for d in dists để trượt và hất từng viên đá.',
      goiY: [
        'Trong vòng lặp for d in dists:, gọi slide_r(1) để sang cột đá kế tiếp.',
        'Tiếp theo gọi aim(d) rồi lob() để hất viên đá đúng tầm d.'
      ],
      san: [
        '######',
        '###D##',
        '##D=D#',
        '##ooo#',
        '#....#',
        '######'
      ],
      batDau: { x: 1, y: 4, huong: 0 },
      maMau: bai(['dists = [2, 3, 2]']),
      loiGiai: bai([
        'dists = [2, 3, 2]',
        'for d in dists:',
        '    slide_r(1)',
        '    aim(d)',
        '    lob()'
      ]),
      sao: { o: 12, nhip: 9 },
      loiSai: [
        { moTa: 'Chưa viết vòng lặp duyệt danh sách dists', baiLam: bai(['dists = [2, 3, 2]']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên gọi aim(d) trong vòng lặp nên cột giữa chỉ ném xa 2 ô trúng hàng rào', baiLam: bai(['dists = [2, 3, 2]', 'for d in dists:', '    slide_r(1)', '    lob()']), phaiCoMa: ['nem-vo'] }
      ],
      loiBinh: 'Lưu tầm ném vào danh sách giúp R1 tự điều chỉnh lực hất cho cả dãy máng khác tầm.'
    }),

    /* ---- Màn 5: Hất xa 3 ô đè nút mở cửa ---- */
    manCL({
      id: 6605, chuong: 'chinh-luc', so: 5, ma: 'chinh-luc.5',
      ten: 'Hất xa đè công tắc', hang: 'luyen',
      hamCuaEmCan: ['move', 'lob', 'diag_r'],
      deBai: 'Nút đè `M` nằm cách R1 tới 3 ô bên kia hàng rào. Hãy gọi `aim(3)` rồi `lob()` để hất viên đá đè lên nút `M` mở cửa `C`, sau đó gọi `diag_r(2)` lách chéo qua cửa rồi `move()` tới cờ.',
      veMaMau: 'Chương trình có sẵn mới gọi diag_r(2) và move() khi cửa C còn đóng. Hãy hất đá tầm 3 đè lên nút M trước.',
      goiY: [
        'Ở đầu chương trình, gọi aim(3) rồi lob() để viên đá ở (1, 4) bay 3 ô tới nút M ở (1, 2).',
        'Khi cửa C ở (2, 4) đã mở, diag_r(2) và move() sẽ đưa R1 tới cờ ở (3, 2).'
      ],
      san: [
        '#####',
        '#####',
        '#M.F#',
        '#=..#',
        '#oC.#',
        '#...#',
        '#####'
      ],
      batDau: { x: 1, y: 5, huong: 0 },
      maMau: bai(['diag_r(2)', 'move()']),
      loiGiai: bai(['aim(3)', 'lob()', 'diag_r(2)', 'move()']),
      sao: { o: 13, nhip: 5 },
      loiSai: [
        { moTa: 'Chưa hất đá đè lên nút M nên cửa C đóng chặn đường chéo', baiLam: bai(['diag_r(2)', 'move()']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Quên gọi aim(3) nên đá chỉ bay 2 ô rơi vào hàng rào bị vỡ', baiLam: bai(['lob()', 'diag_r(2)', 'move()']), phaiCoMa: ['nem-vo'] }
      ],
      loiBinh: 'Nhờ aim(3), R1 có thể kích hoạt công tắc M nằm sâu bên kia hàng rào.'
    }),

    /* ---- Màn 6: Lách chéo kết hợp lấp hố tầm 3 và tầm 2 ---- */
    manCL({
      id: 6606, chuong: 'chinh-luc', so: 6, ma: 'chinh-luc.6',
      ten: 'Hai tầng hố lệch', hang: 'luyen',
      hamCuaEmCan: ['move', 'forward', 'lob'],
      deBai: 'Ở nhánh trái, hố sâu cách R1 3 ô; sang nhánh phải, hố sâu cách R1 2 ô. Hãy gọi `aim(3)`, `lob()`, `forward(3)` để vượt nhánh trái, sau đó `diag_right()` sang nhánh phải, gọi `aim(2)`, `lob()`, `forward(3)` tới cờ.',
      veMaMau: 'Chương trình có sẵn đã vượt qua nhánh trái và lách sang nhánh phải ở (2, 4). Hãy chỉnh tầm 2 ô, lấp hố và tiến lên cờ.',
      goiY: [
        'Sau diag_right(), R1 đứng ở (2, 4), trước mặt là viên đá ở (2, 3) và hố ở (2, 2) (cách 2 ô).',
        'Gọi aim(2), lob() để lấp hố ở (2, 2), rồi gọi forward(3) lên cờ ở (2, 1).'
      ],
      san: [
        '####',
        '##F#',
        '##u#',
        '##o#',
        '#..#',
        '#u.#',
        '#.##',
        '#o##',
        '#.##',
        '####'
      ],
      batDau: { x: 1, y: 8, huong: 0 },
      maMau: bai(['aim(3)', 'lob()', 'forward(3)', 'diag_right()']),
      loiGiai: bai(['aim(3)', 'lob()', 'forward(3)', 'diag_right()', 'aim(2)', 'lob()', 'forward(3)']),
      sao: { o: 16, nhip: 11 },
      loiSai: [
        { moTa: 'Dừng lại ở (2, 4) chưa lấp hố nhánh phải', baiLam: bai(['aim(3)', 'lob()', 'forward(3)', 'diag_right()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên đổi về aim(2) ở nhánh phải nên hất đá vọt lên ô cờ còn hố vẫn mở', baiLam: bai(['aim(3)', 'lob()', 'forward(3)', 'diag_right()', 'lob()', 'forward(3)']), phaiCoMa: ['roi-ho'] }
      ],
      loiBinh: 'Khi chuyển giữa các tầng mỏ có khoảng cách hố khác nhau, nhớ đặt lại aim(n) phù hợp.'
    }),

    /* ---- Màn 7: Bước lên sát máng rồi dùng radar chọn aim(1) hay aim(2) (2 sân) ---- */
    manCL({
      id: 6607, chuong: 'chinh-luc', so: 7, ma: 'chinh-luc.7',
      ten: 'Radar đo máng gần xa', hang: 'bien-the',
      mucTieu: 'dua-vat',
      hamCuaEmCan: ['move'],
      deBai: 'R1 xúc viên đá vào rổ rồi tiến 1 ô lên `(2, 4)`. Lúc này máng nhận `D` có thể nằm ngay sát trước mũi (ô `g[0][1]` là `"D"`, cách 1 ô) hoặc nằm xa hơn 1 ô (cách 2 ô). Hãy quét `g = radar()`, đọc `t = g[0][1]`, nếu `t == "D"` thì `aim(1)`, ngược lại `aim(2)`, rồi `throw()` và `wait()`.',
      veMaMau: 'Chương trình có sẵn đã xúc đá, tiến lên (2, 4) và quét radar(). Hãy thêm if/else chọn aim(1) hoặc aim(2) trước khi ném.',
      goiY: [
        'Khi đứng ở (2, 4), ô (2, 3) ngay trước mũi là g[0][1] của radar().',
        'Viết t = g[0][1], rồi if t == "D": aim(1) và else: aim(2), sau đó gọi throw() và wait().'
      ],
      san: [
        [
          '#####',
          '#...#',
          '#...#',
          '#.D.#',
          '#.o.#',
          '#...#',
          '#####'
        ],
        [
          '#####',
          '#...#',
          '#.D.#',
          '#...#',
          '#.o.#',
          '#...#',
          '#####'
        ]
      ],
      batDau: [
        { x: 2, y: 5, huong: 0 },
        { x: 2, y: 5, huong: 0 }
      ],
      maMau: bai([
        'load()',
        'wait()',
        'move()',
        'g = radar()',
        'throw()',
        'wait()'
      ]),
      loiGiai: bai([
        'load()',
        'wait()',
        'move()',
        'g = radar()',
        't = g[0][1]',
        'if t == "D":',
        '    aim(1)',
        'else:',
        '    aim(2)',
        'throw()',
        'wait()'
      ]),
      sao: { o: 13, nhip: 3 },
      loiSai: [
        { moTa: 'Không chỉnh aim(1) khi máng ở ngay trước mặt nên ở sân 1 ném vọt qua máng', baiLam: bai(['load()', 'wait()', 'move()', 'g = radar()', 'throw()', 'wait()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Luôn đặt aim(1) nên ở sân 2 đá chưa tới máng ở cách 2 ô', baiLam: bai(['load()', 'wait()', 'move()', 'aim(1)', 'throw()', 'wait()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      loiBinh: 'Xúc đá vào rổ rồi tiến lên 1 ô giúp radar 3x3 nhìn thấy ngay máng đích cách 1 ô hay 2 ô.'
    }),

    /* ---- Màn 8: Radar đọc cọc báo tầm bên phải (2 sân) ---- */
    manCL({
      id: 6608, chuong: 'chinh-luc', so: 8, ma: 'chinh-luc.8',
      ten: 'Cọc đá báo tầm hất', hang: 'bien-the',
      hamCuaEmCan: ['move', 'forward', 'lob'],
      deBai: 'Hành lang gồm 2 chặng (mỗi chặng dài 3 ô). Ở đầu mỗi chặng, nếu bên phải R1 có cọc đá `#` (ô `g[1][2]` là `"#"`) thì hố sâu nằm cách 3 ô (`aim(3)`), còn không thì hố sâu nằm cách 2 ô (`aim(2)`). Trong vòng lặp 2 lần, hãy quét `g = radar()`, chọn `aim(3)` hoặc `aim(2)`, gọi `lob()` và `forward(3)`, rồi ngoài vòng lặp gọi `move()` vào cờ.',
      veMaMau: 'Chương trình có sẵn mới viết nhánh if cho aim(3). Hãy thêm nhánh else đặt aim(2), gọi lob(), forward(3), rồi cuối cùng gọi move().',
      goiY: [
        'Trong vòng lặp for i in range(2):, sau khối if/else chọn aim(3) hay aim(2), gọi lob() rồi forward(3).',
        'Ngoài vòng lặp for, gọi thêm move() để bước từ (2, 2) vào cờ ở (2, 1).'
      ],
      san: [
        [
          '#####',
          '#.F.#',
          '#...#',
          '#.u.#',
          '#.o.#',
          '#.u.#',
          '#...#',
          '#.o##',
          '#..##',
          '#####'
        ],
        [
          '#####',
          '#.F.#',
          '#.u.#',
          '#...#',
          '#.o##',
          '#..##',
          '#.u.#',
          '#.o.#',
          '#...#',
          '#####'
        ]
      ],
      batDau: [
        { x: 2, y: 8, huong: 0 },
        { x: 2, y: 8, huong: 0 }
      ],
      maMau: bai([
        'for i in range(2):',
        '    g = radar()',
        '    t = g[1][2]',
        '    if t == "#":',
        '        aim(3)'
      ]),
      loiGiai: bai([
        'for i in range(2):',
        '    g = radar()',
        '    t = g[1][2]',
        '    if t == "#":',
        '        aim(3)',
        '    else:',
        '        aim(2)',
        '    lob()',
        '    forward(3)',
        'move()'
      ]),
      sao: { o: 18, nhip: 11 },
      loiSai: [
        { moTa: 'Chưa gọi lob() và forward(3) sau khi chọn tầm', baiLam: bai(['for i in range(2):', '    g = radar()', '    t = g[1][2]', '    if t == "#":', '        aim(3)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Thiếu nhánh else đặt lại aim(2) nên sau chặng tầm 3 máy ném vẫn giữ tầm 3', baiLam: bai(['for i in range(2):', '    g = radar()', '    t = g[1][2]', '    if t == "#":', '        aim(3)', '    lob()', '    forward(3)', 'move()']), phaiCoMa: ['roi-ho'] }
      ],
      loiBinh: 'Đọc cọc mốc bên hông qua g[1][2] giúp R1 chỉnh đúng tầm 2 hay 3 ô cho từng chặng hầm.'
    }),

    /* ---- Màn 9: Lưới 2 chiều điều phối trượt và tầm ném ---- */
    manCL({
      id: 6609, chuong: 'chinh-luc', so: 9, ma: 'chinh-luc.9',
      ten: 'Bảng phối tầm hất', hang: 'bien-the',
      mucTieu: 'dua-vat',
      hamCuaEmCan: ['slide_r', 'lob'],
      deBai: 'Bảng `plan = [[1, 3], [2, 2], [1, 3]]` ghi từng bước: `r[0]` là số ô trượt phải `slide_r(r[0])`, `r[1]` là tầm ném `aim(r[1])`. Hãy duyệt `for r in plan:` để trượt, chỉnh tầm và gọi `lob()` đưa cả 3 viên đá vào đúng máng `D`.',
      veMaMau: 'Chương trình có sẵn đã khai báo bảng plan. Hãy viết vòng lặp for r in plan để thực hiện từng bước.',
      goiY: [
        'Trong vòng lặp for r in plan:, gọi slide_r(r[0]), rồi aim(r[1]), rồi lob().',
        'Mỗi hàng r trong plan sẽ xử lý trọn vẹn một viên đá.'
      ],
      san: [
        '#######',
        '##D##D#',
        '##=#D=#',
        '##o#oo#',
        '#.....#',
        '#######'
      ],
      batDau: { x: 1, y: 4, huong: 0 },
      maMau: bai(['plan = [[1, 3], [2, 2], [1, 3]]']),
      loiGiai: bai([
        'plan = [[1, 3], [2, 2], [1, 3]]',
        'for r in plan:',
        '    slide_r(r[0])',
        '    aim(r[1])',
        '    lob()'
      ]),
      sao: { o: 12, nhip: 10 },
      loiSai: [
        { moTa: 'Chưa viết vòng lặp duyệt bảng plan', baiLam: bai(['plan = [[1, 3], [2, 2], [1, 3]]']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên gọi aim(r[1]) nên hai cột tầm 3 ném trúng hàng rào bị vỡ đá', baiLam: bai(['plan = [[1, 3], [2, 2], [1, 3]]', 'for r in plan:', '    slide_r(r[0])', '    lob()']), phaiCoMa: ['nem-vo'] }
      ],
      loiBinh: 'Dùng danh sách 2 chiều giúp ghép cặp khoảng trượt và tầm ném rất rõ ràng.'
    }),

    /* ---- Màn 10: Trùm chương 1 (2 sân) ---- */
    manCL({
      id: 6610, chuong: 'chinh-luc', so: 10, ma: 'chinh-luc.10',
      ten: 'Trùm chỉnh lực mỏ đá', hang: 'trum',
      huyHieu: { ma: 'chinh-luc', ten: 'Tay Hất Chuẩn Tầm' },
      hamCuaEmCan: ['move', 'forward', 'lob', 'diag_r'],
      deBai: 'Từ cửa hầm bên trái, hãy gọi `diag_r(1)` để lách chéo vào trục chính ở `(2, 8)`. Sau đó lặp 2 chặng (`for i in range(2):`): quét `g = radar()`, đọc `t = g[1][2]`, nếu bên phải có cọc đá (`t == "#"`) thì `aim(3)`, ngược lại `aim(2)`, rồi gọi `lob()` và `forward(3)`. Cuối cùng gọi `move()` vào cờ.',
      veMaMau: 'Chương trình có sẵn mới lách vào trục chính bằng diag_r(1). Hãy thêm vòng lặp 2 chặng và lệnh move() cuối.',
      goiY: [
        'Sau diag_r(1), viết for i in range(2): rồi quét g = radar().',
        'Đọc t = g[1][2]; nếu t == "#": aim(3), else: aim(2), tiếp theo gọi lob() và forward(3). Ngoài vòng lặp gọi move().'
      ],
      san: [
        [
          '#####',
          '#.F.#',
          '#.u.#',
          '#...#',
          '#.o##',
          '#..##',
          '#.u.#',
          '#.o.#',
          '#...#',
          '#...#',
          '#####'
        ],
        [
          '#####',
          '#.F.#',
          '#...#',
          '#.u.#',
          '#.o.#',
          '#.u.#',
          '#...#',
          '#.o##',
          '#..##',
          '#...#',
          '#####'
        ]
      ],
      batDau: [
        { x: 1, y: 9, huong: 0 },
        { x: 1, y: 9, huong: 0 }
      ],
      maMau: bai(['diag_r(1)']),
      loiGiai: bai([
        'diag_r(1)',
        'for i in range(2):',
        '    g = radar()',
        '    t = g[1][2]',
        '    if t == "#":',
        '        aim(3)',
        '    else:',
        '        aim(2)',
        '    lob()',
        '    forward(3)',
        'move()'
      ]),
      sao: { o: 21, nhip: 12 },
      loiSai: [
        { moTa: 'Mới lách vào trục chính mà chưa vượt qua 2 chặng hố sâu', baiLam: bai(['diag_r(1)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Không chỉnh aim(3) khi gặp cọc đá nên ném đá ngắn rơi chắn đường xe', baiLam: bai(['diag_r(1)', 'for i in range(2):', '    lob()', '    forward(3)', 'move()']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      loiBinh: 'Kết hợp lách chéo, quét radar và chỉnh lực giúp R1 làm chủ toàn bộ tuyến hầm mỏ.'
    }),

    /* ========================================================================
       CHƯƠNG 2: che-chinh-luc — "Chế lệnh: hất đúng tầm" (10 màn)
       Hàm chế mới:
       1. aim_lob(n)      (che-chinh-luc.1)
       2. fill_far()      (che-chinh-luc.2)
       3. lob_step(r)     (che-chinh-luc.4)
       4. auto_aim()      (che-chinh-luc.5)
       5. diag_aim(n)     (che-chinh-luc.6)
       Sửa hàm hỏng:
       - fill_far()       (che-chinh-luc.8)
       ======================================================================== */

    /* ---- Màn 11 (che-chinh-luc.1): Chế hàm aim_lob(n) ---- */
    manCL({
      id: 6611, chuong: 'che-chinh-luc', so: 1, ma: 'che-chinh-luc.1',
      ten: 'Chế hàm hất theo tầm', hang: 'lam-quen',
      canHam: 'tran-khung',
      mucTieu: 'dua-vat',
      taoHam: ['aim_lob'],
      chinhCoDinh: true,
      hamCuaEmCan: ['slide_r', 'lob'],
      deBai: 'Hãy viết hàm `aim_lob(n)` có tham số `n`: gọi `aim(n)` để chọn tầm rồi gọi `lob()` để xúc và hất viên đá trước mặt bay đúng `n` ô.',
      veMaMau: 'Chương trình chính đã gọi aim_lob(3), slide_r(2), aim_lob(2). Hãy vào Xưởng hàm viết thân hàm aim_lob(n).',
      goiY: [
        'Trong def aim_lob(n):, dòng đầu gọi aim(n), dòng thứ hai gọi lob().',
        'Chương trình chính sẽ dùng aim_lob(3) và aim_lob(2) cho hai cột đá.'
      ],
      san: [
        '#####',
        '#D###',
        '#=#D#',
        '#o#o#',
        '#...#',
        '#####'
      ],
      batDau: { x: 1, y: 4, huong: 0 },
      maMau: bai(['aim_lob(3)', 'slide_r(2)', 'aim_lob(2)'], { hamCuaEmMoi: [H('aim_lob', ['n'], ['lob()'])] }),
      loiGiai: bai(['aim_lob(3)', 'slide_r(2)', 'aim_lob(2)'], { hamCuaEmMoi: [H('aim_lob', ['n'], T_AIM_LOB)] }),
      sao: { o: 12, nhip: 6 },
      loiSai: [
        { moTa: 'Trong aim_lob(n) quên gọi aim(n) trước lob() nên viên đá đầu đập vào hàng rào', baiLam: bai(['aim_lob(3)', 'slide_r(2)', 'aim_lob(2)']), hamCuaEmMoi: [H('aim_lob', ['n'], ['lob()'])], phaiCoMa: ['nem-vo'] },
        { moTa: 'Trong aim_lob(n) đặt cứng aim(3) thay vì aim(n) nên viên đá thứ hai đập vào tường', baiLam: bai(['aim_lob(3)', 'slide_r(2)', 'aim_lob(2)']), hamCuaEmMoi: [H('aim_lob', ['n'], ['aim(3)', 'lob()'])], phaiCoMa: ['nem-vo'] }
      ],
      loiBinh: 'Hàm aim_lob(n) gói gọn hai bước chọn tầm và hất đá thành một lệnh có tham số rất tiện.'
    }),

    /* ---- Màn 12 (che-chinh-luc.2): Chế hàm fill_far() ---- */
    manCL({
      id: 6612, chuong: 'che-chinh-luc', so: 2, ma: 'che-chinh-luc.2',
      ten: 'Chế hàm lấp hố xa', hang: 'lam-quen',
      canHam: 'tran-khung',
      taoHam: ['fill_far'],
      chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward', 'lob', 'aim_lob'],
      deBai: 'Dọc đường hầm có các hố sâu nằm cách xe 3 ô. Hãy viết hàm `fill_far()` gồm: gọi `aim_lob(3)` để hất đá lấp hố xa 3 ô, rồi gọi `forward(3)` để tiến lên đứng ngay trên ô vừa lấp.',
      veMaMau: 'Chương trình chính đã gọi fill_far() 2 lần rồi move() vào cờ. Hãy hoàn thiện thân hàm fill_far() trong Xưởng hàm.',
      goiY: [
        'Trong def fill_far():, gọi aim_lob(3) rồi gọi forward(3).',
        'Hai lần gọi fill_far() rồi move() sẽ đưa R1 từ (1, 8) qua hai hố sâu lên thẳng cờ ở (1, 1).'
      ],
      san: [
        '###',
        '#F#',
        '#u#',
        '#.#',
        '#o#',
        '#u#',
        '#.#',
        '#o#',
        '#.#',
        '###'
      ],
      batDau: { x: 1, y: 8, huong: 0 },
      maMau: bai(['fill_far()', 'fill_far()', 'move()'], { hamCuaEmMoi: [H('fill_far', [], ['aim_lob(3)'])] }),
      loiGiai: bai(['fill_far()', 'fill_far()', 'move()'], { hamCuaEmMoi: [H('fill_far', [], T_FILL_FAR)] }),
      sao: { o: 16, nhip: 11 },
      loiSai: [
        { moTa: 'Trong fill_far() thiếu lệnh forward(3) nên xe chưa tới được cờ', baiLam: bai(['fill_far()', 'fill_far()', 'move()']), hamCuaEmMoi: [H('fill_far', [], ['aim_lob(3)'])], phaiCoMa: ['nap-hut', 'chua-toi-co'] },
        { moTa: 'Trong fill_far() chỉ tiến 2 ô forward(2) thay vì forward(3) nên chưa tới viên đá tiếp theo', baiLam: bai(['fill_far()', 'fill_far()', 'move()']), hamCuaEmMoi: [H('fill_far', [], ['aim_lob(3)', 'forward(2)'])], phaiCoMa: ['nap-hut', 'dam-tuong', 'chua-toi-co'] }
      ],
      loiBinh: 'Trong khi fill_pit() lấp hố cách 2 ô, fill_far() giúp R1 bắc cầu qua những hố cách xa 3 ô.'
    }),

    /* ---- Màn 13 (che-chinh-luc.3): Luyện fill_far(), diag_r() và aim_lob() ---- */
    manCL({
      id: 6613, chuong: 'che-chinh-luc', so: 3, ma: 'che-chinh-luc.3',
      ten: 'Chuyển làn lấp hố xa gần', hang: 'luyen',
      hamCuaEmCan: ['move', 'forward', 'lob', 'diag_r', 'aim_lob', 'fill_far'],
      deBai: 'Hãy gọi `fill_far()` để vượt hố xa ở nhánh trái, tiếp theo gọi `diag_r(1)` lách sang nhánh phải, rồi gọi `aim_lob(2)` lấp hố gần và `forward(3)` tới cờ.',
      veMaMau: 'Chương trình có sẵn đã gọi fill_far() và diag_r(1). Hãy thêm aim_lob(2) và forward(3) để về đích.',
      goiY: [
        'Sau fill_far() và diag_r(1), R1 đang đứng ở (2, 4) ngay dưới viên đá ở (2, 3) và hố ở (2, 2).',
        'Gọi aim_lob(2) để lấp hố ở (2, 2), rồi gọi forward(3) lên cờ ở (2, 1).'
      ],
      san: [
        '####',
        '##F#',
        '##u#',
        '##o#',
        '#..#',
        '#u.#',
        '#.##',
        '#o##',
        '#.##',
        '####'
      ],
      batDau: { x: 1, y: 8, huong: 0 },
      maMau: bai(['fill_far()', 'diag_r(1)']),
      loiGiai: bai(['fill_far()', 'diag_r(1)', 'aim_lob(2)', 'forward(3)']),
      sao: { o: 19, nhip: 11 },
      loiSai: [
        { moTa: 'Dừng lại ở (2, 4) chưa lấp hố nhánh phải và tiến lên cờ', baiLam: bai(['fill_far()', 'diag_r(1)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên gọi aim_lob(2) trước forward(3) ở nhánh phải nên đâm vào viên đá ở (2, 3)', baiLam: bai(['fill_far()', 'diag_r(1)', 'forward(3)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      loiBinh: 'Nhờ có sẵn fill_far() và aim_lob(n), chương trình chính xử lý hai nhánh mỏ chỉ trong 4 dòng.'
    }),

    /* ---- Màn 14 (che-chinh-luc.4): Chế hàm lob_step(r) ---- */
    manCL({
      id: 6614, chuong: 'che-chinh-luc', so: 4, ma: 'che-chinh-luc.4',
      ten: 'Chế hàm trượt và hất theo cặp', hang: 'luyen',
      canHam: 'tran-khung',
      mucTieu: 'dua-vat',
      taoHam: ['lob_step'],
      chinhCoDinh: true,
      hamCuaEmCan: ['slide_r', 'lob', 'aim_lob'],
      deBai: 'Mỗi phần tử `r` trong bảng gồm `[số_ô_trượt, tầm_ném]`. Hãy viết hàm `lob_step(r)`: gọi `slide_r(r[0])` để trượt phải `r[0]` ô, rồi gọi `aim_lob(r[1])` để hất viên đá bay `r[1]` ô vào máng `D`.',
      veMaMau: 'Chương trình chính đã duyệt bảng plan và gọi lob_step(r). Hãy hoàn thiện thân hàm lob_step(r).',
      goiY: [
        'Trong def lob_step(r):, dòng đầu gọi slide_r(r[0]), dòng thứ hai gọi aim_lob(r[1]).',
        'Chương trình chính sẽ tự gọi lob_step(r) cho cả 3 cột đá.'
      ],
      san: [
        '#######',
        '##D##D#',
        '##=#D=#',
        '##o#oo#',
        '#.....#',
        '#######'
      ],
      batDau: { x: 1, y: 4, huong: 0 },
      maMau: bai(
        ['plan = [[1, 3], [2, 2], [1, 3]]', 'for r in plan:', '    lob_step(r)'],
        { hamCuaEmMoi: [H('lob_step', ['r'], ['slide_r(r[0])'])] }
      ),
      loiGiai: bai(
        ['plan = [[1, 3], [2, 2], [1, 3]]', 'for r in plan:', '    lob_step(r)'],
        { hamCuaEmMoi: [H('lob_step', ['r'], T_LOB_STEP)] }
      ),
      sao: { o: 14, nhip: 10 },
      loiSai: [
        { moTa: 'Trong lob_step(r) chỉ trượt mà quên gọi aim_lob(r[1])', baiLam: bai(['plan = [[1, 3], [2, 2], [1, 3]]', 'for r in plan:', '    lob_step(r)']), hamCuaEmMoi: [H('lob_step', ['r'], ['slide_r(r[0])'])], phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Trong lob_step(r) gọi aim_lob(r[1]) trước slide_r(r[0]) nên xúc hụt ngay từ đầu', baiLam: bai(['plan = [[1, 3], [2, 2], [1, 3]]', 'for r in plan:', '    lob_step(r)']), hamCuaEmMoi: [H('lob_step', ['r'], ['aim_lob(r[1])', 'slide_r(r[0])'])], phaiCoMa: ['nap-hut', 'nem-vo'] }
      ],
      loiBinh: 'Hàm lob_step(r) nhận một cặp số từ danh sách 2 chiều để vừa di chuyển vừa hất đá đúng tầm.'
    }),

    /* ---- Màn 15 (che-chinh-luc.5): Chế hàm auto_aim() (2 sân) ---- */
    manCL({
      id: 6615, chuong: 'che-chinh-luc', so: 5, ma: 'che-chinh-luc.5',
      ten: 'Chế hàm tự chọn tầm lấp hố', hang: 'bien-the',
      canHam: 'tran-khung',
      taoHam: ['auto_aim'],
      chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward', 'lob', 'aim_lob'],
      deBai: 'Hãy viết hàm `auto_aim()` để vượt 1 chặng 3 ô: quét `g = radar()`, đọc `t = g[1][2]`, nếu bên phải có cọc đá (`t == "#"`) thì gọi `aim_lob(3)` (hố xa 3 ô), ngược lại gọi `aim_lob(2)` (hố cách 2 ô), sau đó gọi `forward(3)`.',
      veMaMau: 'Chương trình chính đã lặp 2 lần auto_aim() và bước vào cờ. Hãy viết thân hàm auto_aim() trong Xưởng hàm.',
      goiY: [
        'Trong def auto_aim():, viết g = radar(), t = g[1][2], nếu t == "#": gọi aim_lob(3), else: gọi aim_lob(2).',
        'Cuối hàm auto_aim() (ngoài khối if/else) gọi forward(3).'
      ],
      san: [
        [
          '#####',
          '#.F.#',
          '#...#',
          '#.u.#',
          '#.o.#',
          '#.u.#',
          '#...#',
          '#.o##',
          '#..##',
          '#####'
        ],
        [
          '#####',
          '#.F.#',
          '#.u.#',
          '#...#',
          '#.o##',
          '#..##',
          '#.u.#',
          '#.o.#',
          '#...#',
          '#####'
        ]
      ],
      batDau: [
        { x: 2, y: 8, huong: 0 },
        { x: 2, y: 8, huong: 0 }
      ],
      maMau: bai(
        ['for i in range(2):', '    auto_aim()', 'move()'],
        { hamCuaEmMoi: [H('auto_aim', [], ['g = radar()', 'aim_lob(2)', 'forward(3)'])] }
      ),
      loiGiai: bai(
        ['for i in range(2):', '    auto_aim()', 'move()'],
        { hamCuaEmMoi: [H('auto_aim', [], T_AUTO_AIM)] }
      ),
      sao: { o: 20, nhip: 11 },
      loiSai: [
        { moTa: 'Trong auto_aim() luôn gọi aim_lob(2) nên ném đá ngắn chắn đường xe', baiLam: bai(['for i in range(2):', '    auto_aim()', 'move()']), hamCuaEmMoi: [H('auto_aim', [], ['g = radar()', 'aim_lob(2)', 'forward(3)'])], phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Trong auto_aim() quên gọi forward(3) ở cuối nên xe chưa tới cờ', baiLam: bai(['for i in range(2):', '    auto_aim()', 'move()']), hamCuaEmMoi: [H('auto_aim', [], ['g = radar()', 't = g[1][2]', 'if t == "#":', '    aim_lob(3)', 'else:', '    aim_lob(2)'])], phaiCoMa: ['nap-hut', 'chua-toi-co'] }
      ],
      loiBinh: 'Hàm auto_aim() giúp R1 tự nhìn cọc mốc bên hông để lấp cả hố gần lẫn hố xa rồi tiến lên 3 ô.'
    }),

    /* ---- Màn 16 (che-chinh-luc.6): Chế hàm diag_aim(n) ---- */
    manCL({
      id: 6616, chuong: 'che-chinh-luc', so: 6, ma: 'che-chinh-luc.6',
      ten: 'Chế hàm lách chéo hất theo tầm', hang: 'bien-the',
      canHam: 'tran-khung',
      mucTieu: 'dua-vat',
      taoHam: ['diag_aim'],
      chinhCoDinh: true,
      hamCuaEmCan: ['lob', 'aim_lob'],
      deBai: 'Ba viên đá nằm trên bậc thang chéo sang phải nhưng khoảng cách tới máng `D` khác nhau. Hãy viết hàm `diag_aim(n)`: gọi `diag_right()` để lách vào dưới viên đá, rồi gọi `aim_lob(n)` để hất đá bay `n` ô.',
      veMaMau: 'Chương trình chính đã gọi diag_aim(3), diag_aim(2), diag_aim(3). Hãy viết thân hàm diag_aim(n).',
      goiY: [
        'Trong def diag_aim(n):, dòng đầu gọi diag_right(), dòng thứ hai gọi aim_lob(n).',
        'Chương trình chính sẽ truyền tầm 3, 2, 3 cho 3 bậc đá.'
      ],
      san: [
        '#######',
        '#...D.#',
        '#...=.#',
        '#.DDo.#',
        '#.=o..#',
        '#.o...#',
        '#.....#',
        '#.....#',
        '#######'
      ],
      batDau: { x: 1, y: 7, huong: 0 },
      maMau: bai(
        ['diag_aim(3)', 'diag_aim(2)', 'diag_aim(3)'],
        { hamCuaEmMoi: [H('diag_aim', ['n'], ['diag_right()'])] }
      ),
      loiGiai: bai(
        ['diag_aim(3)', 'diag_aim(2)', 'diag_aim(3)'],
        { hamCuaEmMoi: [H('diag_aim', ['n'], T_DIAG_AIM)] }
      ),
      sao: { o: 11, nhip: 9 },
      loiSai: [
        { moTa: 'Trong diag_aim(n) chỉ lách chéo mà chưa gọi aim_lob(n)', baiLam: bai(['diag_aim(3)', 'diag_aim(2)', 'diag_aim(3)']), hamCuaEmMoi: [H('diag_aim', ['n'], ['diag_right()'])], phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Trong diag_aim(n) gọi aim_lob(n) trước diag_right() nên xúc hụt', baiLam: bai(['diag_aim(3)', 'diag_aim(2)', 'diag_aim(3)']), hamCuaEmMoi: [H('diag_aim', ['n'], ['aim_lob(n)', 'diag_right()'])], phaiCoMa: ['nap-hut', 'nem-vo'] }
      ],
      loiBinh: 'Hàm diag_aim(n) nâng cấp diag_lob() bằng tham số tầm ném n.'
    }),

    /* ---- Màn 17 (che-chinh-luc.7): Luyện diag_aim(n) và auto_aim() (2 sân) ---- */
    manCL({
      id: 6617, chuong: 'che-chinh-luc', so: 7, ma: 'che-chinh-luc.7',
      ten: 'Lách chéo mở cầu tự động', hang: 'bien-the',
      hamCuaEmCan: ['move', 'forward', 'lob', 'aim_lob', 'diag_aim', 'auto_aim'],
      deBai: 'Từ `(1, 9)`, hãy gọi `diag_aim(3)` để lách sang cột 2 và hất viên đá đầu tiên lấp hố xa 3 ô ở `(2, 5)`, tiếp theo gọi `forward(3)` lên `(2, 5)`, gọi `auto_aim()` để vượt chặng thứ hai, rồi `move()` vào cờ.',
      veMaMau: 'Chương trình có sẵn đã gọi diag_aim(3) và forward(3). Hãy thêm auto_aim() và move() ở cuối.',
      goiY: [
        'Sau diag_aim(3) và forward(3), R1 đang đứng ở (2, 5).',
        'Gọi auto_aim() để R1 tự chọn tầm lấp hố và tiến lên (2, 2), rồi gọi move() tới cờ ở (2, 1).'
      ],
      san: [
        [
          '#####',
          '#.F.#',
          '#.u.#',
          '#...#',
          '#.o##',
          '#.u##',
          '#...#',
          '#.o.#',
          '#...#',
          '#...#',
          '#####'
        ],
        [
          '#####',
          '#.F.#',
          '#...#',
          '#.u.#',
          '#.o.#',
          '#.u.#',
          '#...#',
          '#.o.#',
          '#...#',
          '#...#',
          '#####'
        ]
      ],
      batDau: [
        { x: 1, y: 9, huong: 0 },
        { x: 1, y: 9, huong: 0 }
      ],
      maMau: bai(['diag_aim(3)', 'forward(3)']),
      loiGiai: bai(['diag_aim(3)', 'forward(3)', 'auto_aim()', 'move()']),
      sao: { o: 23, nhip: 12 },
      loiSai: [
        { moTa: 'Dừng lại ở (2, 5) mà chưa gọi auto_aim() và move()', baiLam: bai(['diag_aim(3)', 'forward(3)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên gọi forward(3) sau diag_aim(3) nên gọi auto_aim() khi chưa tới viên đá thứ hai', baiLam: bai(['diag_aim(3)', 'auto_aim()', 'move()']), phaiCoMa: ['nap-hut', 'chua-toi-co'] }
      ],
      loiBinh: 'Ghép diag_aim(3) với auto_aim() giúp R1 vừa chuyển làn vừa tự động đo tầm hố ở chặng tiếp theo.'
    }),

    /* ---- Màn 18 (che-chinh-luc.8): Sửa hàm hỏng fill_far() ---- */
    manCL({
      id: 6618, chuong: 'che-chinh-luc', so: 8, ma: 'che-chinh-luc.8',
      ten: 'Sửa hàm lấp hố xa', hang: 'bien-the',
      mucTieu: 'bong-mo',
      bongMo: { x: 2, y: 5, huong: 0, diQua: [{ x: 2, y: 2 }] },
      suaHam: ['fill_far'],
      chinhCoDinh: true,
      khoaHamMan: ['aim_back'],
      hamCuaEmCan: ['move', 'forward', 'back', 'lob', 'aim_lob', 'fill_far'],
      deBai: 'Hàm `fill_far()` đang bị viết nhầm thành `aim_lob(2)` nên viên đá rơi ngay trước hố sâu làm R1 vướng đá không lên được điểm mốc `(2, 2)`. Hãy sửa `aim_lob(2)` thành `aim_lob(3)` trong `fill_far()`.',
      veMaMau: 'Mở hàm fill_far() trong Xưởng hàm và sửa đối số của aim_lob từ 2 thành 3.',
      goiY: [
        'Hố sâu ở (2, 2) cách vị trí xuất phát (2, 5) đúng 3 ô.',
        'Trong def fill_far():, đổi aim_lob(2) thành aim_lob(3) để lấp đúng hố rồi tiến lên (2, 2) và lùi về bóng mờ.'
      ],
      san: [
        '#####',
        '#...#',
        '#.u.#',
        '#...#',
        '#.o.#',
        '#...#',
        '#####'
      ],
      batDau: { x: 2, y: 5, huong: 0 },
      maMau: bai(
        ['fill_far()', 'aim_back()'],
        {
          hamCuaMan: [H('aim_back', [], ['back()', 'back()', 'back()'])],
          hamCuaEmMoi: [H('fill_far', [], ['aim_lob(2)', 'forward(3)'])]
        }
      ),
      loiGiai: bai(
        ['fill_far()', 'aim_back()'],
        {
          hamCuaMan: [H('aim_back', [], ['back()', 'back()', 'back()'])],
          hamCuaEmMoi: [H('fill_far', [], T_FILL_FAR)]
        }
      ),
      sao: { o: 21, nhip: 8 },
      loiSai: [
        {
          moTa: 'Không sửa hàm fill_far(): aim_lob(2) ném đá xuống (2, 3) chặn đường xe tiến lên',
          baiLam: bai(['fill_far()', 'aim_back()'], { hamCuaMan: [H('aim_back', [], ['back()', 'back()', 'back()'])] }),
          hamCuaEmMoi: [H('fill_far', [], ['aim_lob(2)', 'forward(3)'])],
          phaiCoMa: ['dam-tuong', 'chua-qua-diem']
        },
        {
          moTa: 'Đổi thành aim_lob(1) làm viên đá rơi ngay lại ô (2, 4) chặn đường xe',
          baiLam: bai(['fill_far()', 'aim_back()'], { hamCuaMan: [H('aim_back', [], ['back()', 'back()', 'back()'])] }),
          hamCuaEmMoi: [H('fill_far', [], ['aim_lob(1)', 'forward(3)'])],
          phaiCoMa: ['dam-tuong', 'chua-qua-diem']
        }
      ],
      loiBinh: 'Sửa lại aim_lob(3) trong fill_far() giúp viên đá bay đúng 3 ô vào hố sâu.'
    }),

    /* ---- Màn 19 (che-chinh-luc.9): Tổng hợp lob_step(r) mở công tắc và lấp hố ---- */
    manCL({
      id: 6619, chuong: 'che-chinh-luc', so: 9, ma: 'che-chinh-luc.9',
      ten: 'Mở cổng và bắc cầu theo bảng', hang: 'bien-the',
      hamCuaEmCan: ['move', 'forward', 'slide_r', 'lob', 'aim_lob', 'lob_step'],
      deBai: 'Bảng `plan = [[1, 3], [2, 2]]` điều khiển R1: bước đầu trượt sang cột 2 và hất đá xa 3 ô đè lên nút `M` mở cửa `C`; bước hai trượt sang cột 4 và hất đá xa 2 ô lấp hố sâu `u`. Hãy duyệt `for r in plan:` gọi `lob_step(r)`, rồi gọi `forward(4)` tiến thẳng qua cửa `C` tới cờ.',
      veMaMau: 'Chương trình có sẵn đã duyệt bảng plan bằng lob_step(r). Hãy thêm lệnh forward(4) ở cuối để tiến lên cờ.',
      goiY: [
        'Sau vòng lặp for r in plan: lob_step(r), R1 đang đứng ở (4, 5), hố ở (4, 3) đã lấp và cửa C ở (4, 2) đã mở.',
        'Gọi forward(4) ở ngoài vòng lặp để đưa R1 từ (4, 5) lên thẳng cờ ở (4, 1).'
      ],
      san: [
        '######',
        '####F#',
        '##M#C#',
        '##=#u#',
        '##o#o#',
        '#....#',
        '######'
      ],
      batDau: { x: 1, y: 5, huong: 0 },
      maMau: bai([
        'plan = [[1, 3], [2, 2]]',
        'for r in plan:',
        '    lob_step(r)'
      ]),
      loiGiai: bai([
        'plan = [[1, 3], [2, 2]]',
        'for r in plan:',
        '    lob_step(r)',
        'forward(4)'
      ]),
      sao: { o: 20, nhip: 11 },
      loiSai: [
        { moTa: 'Mới mở cửa và lấp hố xong mà chưa gọi forward(4) lên cờ', baiLam: bai(['plan = [[1, 3], [2, 2]]', 'for r in plan:', '    lob_step(r)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đặt nhầm forward(4) vào bên trong vòng lặp for nên đâm vào hàng rào ở cột 2', baiLam: bai(['plan = [[1, 3], [2, 2]]', 'for r in plan:', '    lob_step(r)', '    forward(4)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      loiBinh: 'Một bảng 2 chiều kết hợp lob_step(r) giải quyết cùng lúc cả việc đè nút mở cửa lẫn việc lấp hố bắc cầu.'
    }),

    /* ---- Màn 20 (che-chinh-luc.10): Trùm chương 2 (2 sân) ---- */
    manCL({
      id: 6620, chuong: 'che-chinh-luc', so: 10, ma: 'che-chinh-luc.10',
      ten: 'Trùm chế lệnh chỉnh lực', hang: 'trum',
      huyHieu: { ma: 'che-chinh-luc', ten: 'Bậc Thầy Chỉnh Lực' },
      hamCuaEmCan: ['move', 'forward', 'lob', 'aim_lob', 'fill_far', 'auto_aim'],
      deBai: 'Từ `(1, 9)`, hãy gọi `fill_far()` để vượt hố xa ở nhánh trái lên `(1, 6)`, tiếp theo gọi `diag_right()` để lách sang trục chính ở `(2, 5)`, rồi gọi `auto_aim()` và `move()` để vượt chặng cuối tới cờ.',
      veMaMau: 'Chương trình có sẵn đã gọi fill_far() và diag_right(). Hãy thêm auto_aim() và move() để về đích.',
      goiY: [
        'Bước 1: fill_far() đưa R1 từ (1, 9) lên (1, 6), rồi diag_right() lách sang (2, 5).',
        'Bước 2: gọi auto_aim() để R1 tự chọn tầm lấp hố và tiến lên (2, 2), cuối cùng gọi move() vào cờ ở (2, 1).'
      ],
      san: [
        [
          '#####',
          '#.F.#',
          '#.u.#',
          '#...#',
          '#.o##',
          '#..##',
          '#.u.#',
          '#...#',
          '#.o.#',
          '#...#',
          '#####'
        ],
        [
          '#####',
          '#.F.#',
          '#...#',
          '#.u.#',
          '#.o.#',
          '#...#',
          '#.u.#',
          '#...#',
          '#.o.#',
          '#...#',
          '#####'
        ]
      ],
      batDau: [
        { x: 1, y: 9, huong: 0 },
        { x: 1, y: 9, huong: 0 }
      ],
      maMau: bai(['fill_far()', 'diag_right()']),
      loiGiai: bai(['fill_far()', 'diag_right()', 'auto_aim()', 'move()']),
      sao: { o: 23, nhip: 12 },
      loiSai: [
        { moTa: 'Mới lách sang trục chính ở (2, 5) mà chưa gọi auto_aim() và move()', baiLam: bai(['fill_far()', 'diag_right()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Dùng fill_far() ở chặng cuối thay vì auto_aim() nên ở sân 2 đá bay vọt qua hố cách 2 ô', baiLam: bai(['fill_far()', 'diag_right()', 'fill_far()', 'move()']), phaiCoMa: ['roi-ho'] }
      ],
      loiBinh: 'Phối hợp fill_far(), diag_right() và auto_aim() giúp R1 chinh phục trọn vẹn gói Chỉnh lực hất.'
    })
  ];

  ManHoc.manChinhLuc = DS;
  if (laNode) module.exports = DS;
})();
