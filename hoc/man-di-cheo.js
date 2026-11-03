/* ============================================================================
   man-di-cheo.js — Mùa 6 "Mỏ đá" · Gói 5 "Đi chéo" (20 màn)
   - Chương 1: di-cheo (10 màn: di-cheo.1 .. di-cheo.10) — "Lách chéo vách đá"
     Màn 1 trình diễn (chiChay: true), màn 2–9 luyện diag_left() / diag_right()
     lách chéo 1 ô trong 1 nhịp không đổi hướng mặt, kết hợp máy hất đá (lob)
     và radar tròn (radar), màn 10 trùm 2 sân.
   - Chương 2: che-di-cheo (10 màn: che-di-cheo.1 .. che-di-cheo.10) — "Chế lệnh: đi chéo"
     Chế 5 hàm mới: diag_r(n), diag_l(n), bypass_r(), diag_lob(), auto_bypass()
     + 1 màn sửa hàm hỏng (che-di-cheo.8), màn 10 trùm 2 sân.
   Toàn bộ 20 màn chạy trên Máy khai mỏ R1 (loaiRobot: 'omni', tay: 'nem',
   camBien: [{ ma: 'radar', o: 'tren' }], omniCheo: true, tamNemMacDinh: 2, daLapHo: true).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var KHAY_DI_CHEO = ['left_move', 'right_move', 'left_back', 'right_back', 'slide_left', 'slide_right', 'wait', 'load', 'throw', 'radar', 'diag_left', 'diag_right'];
  var ROBOT_DI_CHEO = { than: 'omni', tay: 'nem', camBien: [{ ma: 'radar', o: 'tren' }] };
  var CAU_TRUC = ['for', 'if', 'while', 'list'];

  function bai(chinh, Phu) {
    return {
      chinh: chinh,
      hamCuaMan: (Phu && Phu.hamCuaMan) || [],
      hamCuaEmMoi: (Phu && Phu.hamCuaEmMoi) || []
    };
  }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo, than: than }; }

  var T_DIAG_R = ['for i in range(n):', '    diag_right()'];
  var T_DIAG_L = ['for i in range(n):', '    diag_left()'];
  var T_BYPASS_R = ['diag_right()', 'diag_left()'];
  var T_DIAG_LOB = ['diag_right()', 'lob()'];
  var T_AUTO_BYPASS = ['g = radar()', 't = g[0][1]', 'if t == "#":', '    bypass_r()', 'else:', '    forward(2)'];

  function manDC(o) {
    return Object.assign({
      loaiRobot: 'omni',
      robot: ROBOT_DI_CHEO,
      omniCheo: true,
      tamNemMacDinh: 2,
      daLapHo: true,
      hamGoc: KHAY_DI_CHEO,
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
       CHƯƠNG 1: di-cheo — "Lách chéo vách đá" (10 màn)
       ======================================================================== */

    /* ---- Màn 1: Trình diễn nâng cấp bánh omni đi chéo (chiChay: true) ---- */
    manDC({
      id: 6501, chuong: 'di-cheo', so: 1, ma: 'di-cheo.1',
      ten: 'Con lăn lách chéo', hang: 'lam-quen',
      chiChay: true, chinhCoDinh: true,
      hamCuaEmCan: ['move'],
      deBai: 'Bánh omni của R1 vừa được nâng cấp con lăn chéo: `diag_right()` lách chéo tiến-phải 1 ô trong 1 nhịp, `diag_left()` lách chéo tiến-trái 1 ô trong 1 nhịp, mũi xe vẫn giữ nguyên hướng. Bấm Chạy để xem R1 lách qua khe vách đá.',
      veMaMau: 'Chương trình đã viết sẵn và khóa. Bấm Chạy để xem R1 lách chéo qua khe đá.',
      goiY: ['Bấm nút Chạy để xem R1 dùng diag_right() và diag_left() lách qua vách đá.'],
      san: [
        '#####',
        '#.F.#',
        '##.##',
        '#..##',
        '##..#',
        '#...#',
        '#####'
      ],
      batDau: { x: 1, y: 5, huong: 0 },
      maMau: bai(['diag_right()', 'diag_left()', 'diag_right()', 'move()']),
      loiGiai: bai(['diag_right()', 'diag_left()', 'diag_right()', 'move()']),
      sao: { o: 7, nhip: 4 },
      loiBinh: 'Mỗi lệnh diag_right() hay diag_left() đưa R1 đi chéo 1 ô chỉ trong 1 nhịp mà không cần quay xe.'
    }),

    /* ---- Màn 2: Hai bước chéo qua khe đá ---- */
    manDC({
      id: 6502, chuong: 'di-cheo', so: 2, ma: 'di-cheo.2',
      ten: 'Khe đá chéo phải', hang: 'lam-quen',
      hamCuaEmCan: ['move'],
      deBai: 'Lối thẳng trước mặt bị vách đá chắn. Hãy gọi `diag_right()` hai lần để lách chéo lên phải 2 ô, rồi `move()` tới cờ.',
      veMaMau: 'Chương trình có sẵn mới gọi diag_right() một lần. Hãy thêm một lệnh diag_right() nữa trước move().',
      goiY: [
        'Từ (1, 4) mặt hướng lên, gọi diag_right() sẽ tới (2, 3), gọi tiếp diag_right() sẽ tới (3, 2).',
        'Từ (3, 2), gọi move() để tiến lên cờ ở (3, 1).'
      ],
      san: [
        '######',
        '#..F.#',
        '#.#..#',
        '##...#',
        '#....#',
        '######'
      ],
      batDau: { x: 1, y: 4, huong: 0 },
      maMau: bai(['diag_right()', 'move()']),
      loiGiai: bai(['diag_right()', 'diag_right()', 'move()']),
      sao: { o: 6, nhip: 3 },
      loiSai: [
        { moTa: 'Mới lách chéo phải 1 lần đã tiến thẳng nên đâm vào vách đá ở (2, 2)', baiLam: bai(['diag_right()', 'move()']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Đi thẳng ngay từ đầu nên đâm vào vách đá ở (1, 3)', baiLam: bai(['move()', 'diag_right()']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      loiBinh: 'Lách chéo giúp R1 vừa tiến lên vừa dịch sang bên trong cùng một nhịp.'
    }),

    /* ---- Màn 3: Lách phải rồi lách trái qua 2 trụ đá ---- */
    manDC({
      id: 6503, chuong: 'di-cheo', so: 3, ma: 'di-cheo.3',
      ten: 'Vòng qua trụ đá', hang: 'lam-quen',
      hamCuaEmCan: ['move'],
      deBai: 'Trụ đá và hố sâu chắn ngay cột giữa. Hãy dùng `diag_left()` và `diag_right()` để lách qua trụ đá bên trái rồi vòng qua hố sâu bên phải lên thẳng cờ.',
      veMaMau: 'Chương trình có sẵn mới vượt qua trụ đá đầu tiên. Hãy thêm cặp lệnh đi chéo tiếp theo để vòng qua hố sâu.',
      goiY: [
        'Gọi diag_left() để lách sang (1, 4), rồi diag_right() để về (2, 3) phía trên trụ đá.',
        'Tiếp tục gọi diag_right() sang (3, 2) rồi diag_left() để vào thẳng cờ ở (2, 1).'
      ],
      san: [
        '#####',
        '#.F.#',
        '#.u.#',
        '#...#',
        '#.###',
        '#...#',
        '#####'
      ],
      batDau: { x: 2, y: 5, huong: 0 },
      maMau: bai(['diag_left()', 'diag_right()']),
      loiGiai: bai(['diag_left()', 'diag_right()', 'diag_right()', 'diag_left()']),
      sao: { o: 4, nhip: 4 },
      loiSai: [
        { moTa: 'Dừng lại ở (2, 3) sau khi qua trụ đá đầu tiên', baiLam: bai(['diag_left()', 'diag_right()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đi thẳng từ (2, 3) nên rơi xuống hố sâu ở (2, 2)', baiLam: bai(['diag_left()', 'diag_right()', 'move()']), phaiCoMa: ['roi-ho'] }
      ],
      loiBinh: 'Ghép diag_left() với diag_right() giúp R1 vòng qua vật cản trước mặt chỉ trong 2 nhịp.'
    }),

    /* ---- Màn 4: Vòng lặp for đi chéo lên dốc đá ---- */
    manDC({
      id: 6504, chuong: 'di-cheo', so: 4, ma: 'di-cheo.4',
      ten: 'Rãnh chéo dài', hang: 'luyen',
      deBai: 'Rãnh mỏ chạy chéo suốt 4 bậc lên phía phải. Hãy dùng vòng lặp `for` gọi `diag_right()` 4 lần để đưa R1 tới thẳng cờ.',
      veMaMau: 'Chương trình có sẵn mới lặp 3 lần nên còn thiếu 1 bước chéo. Hãy sửa số lần lặp.',
      goiY: [
        'Từ (1, 5) tới cờ (5, 1) là đúng 4 bước chéo tiến-phải.',
        'Dùng for i in range(4): rồi gọi diag_right() bên trong.'
      ],
      san: [
        '#######',
        '#....F#',
        '###...#',
        '##..###',
        '#..####',
        '#.....#',
        '#######'
      ],
      batDau: { x: 1, y: 5, huong: 0 },
      maMau: bai(['for i in range(3):', '    diag_right()']),
      loiGiai: bai(['for i in range(4):', '    diag_right()']),
      sao: { o: 2, nhip: 4 },
      loiSai: [
        { moTa: 'Chỉ lặp 3 lần nên dừng ở (4, 2) trước cờ', baiLam: bai(['for i in range(3):', '    diag_right()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Gọi nhầm diag_left() nên đâm vào vách đá bên trái', baiLam: bai(['for i in range(4):', '    diag_left()']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      loiBinh: 'Với vòng lặp for, 4 bước lách chéo liên tiếp chỉ tốn 2 dòng lệnh và 4 nhịp.'
    }),

    /* ---- Màn 5: Đi chéo vào sau đá rồi hất lấp hố ---- */
    manDC({
      id: 6505, chuong: 'di-cheo', so: 5, ma: 'di-cheo.5',
      ten: 'Lách chéo hất đá', hang: 'luyen',
      hamCuaEmCan: ['move', 'forward', 'lob'],
      deBai: 'Viên đá tròn nằm lệch ở cột bên phải, phía trước nó là hố sâu chắn trước cờ. Hãy `diag_right()` vào ngay dưới viên đá, gọi `lob()` hất đá lấp hố, rồi `forward(3)` tới cờ.',
      veMaMau: 'Chương trình có sẵn đã gọi diag_right() và forward(3) nhưng thiếu bước hất đá lấp hố.',
      goiY: [
        'R1 ở (2, 5) hướng lên. Gọi diag_right() để sang (3, 4), ngay phía dưới viên đá ở (3, 3).',
        'Gọi lob() để nạp viên đá ở (3, 3) và hất xa 2 ô lấp hố ở (3, 2), rồi forward(3) lên cờ ở (3, 1).'
      ],
      san: [
        '######',
        '#..F.#',
        '#..u.#',
        '#..o.#',
        '###..#',
        '#....#',
        '######'
      ],
      batDau: { x: 2, y: 5, huong: 0 },
      maMau: bai(['diag_right()', 'forward(3)']),
      loiGiai: bai(['diag_right()', 'lob()', 'forward(3)']),
      sao: { o: 12, nhip: 6 },
      loiSai: [
        { moTa: 'Quên gọi lob() trước khi tiến lên nên đâm vào viên đá ở (3, 3)', baiLam: bai(['diag_right()', 'forward(3)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Gọi lob() trước khi diag_right() nên xúc hụt vì đá nằm ở cột bên phải', baiLam: bai(['lob()', 'diag_right()', 'forward(3)']), phaiCoMa: ['nap-hut', 'dam-tuong'] }
      ],
      loiBinh: 'Nhờ giữ nguyên hướng mặt khi đi chéo, R1 tới sau viên đá là có thể gọi lob() ngay.'
    }),

    /* ---- Màn 6: Vòng lặp ziczac chéo qua 3 hố sâu ---- */
    manDC({
      id: 6506, chuong: 'di-cheo', so: 6, ma: 'di-cheo.6',
      ten: 'Ziczac qua bãi hố', hang: 'luyen',
      deBai: 'Ba hố sâu nằm thẳng hàng trên cột giữa. Hãy dùng vòng lặp `for` 3 lần, mỗi lần `diag_right()` rồi `diag_left()` để lách qua cả 3 hố tới cờ.',
      veMaMau: 'Chương trình có sẵn mới gọi diag_right() trong vòng lặp. Hãy thêm diag_left() để quay lại cột giữa sau mỗi hố.',
      goiY: [
        'Mỗi cặp diag_right() rồi diag_left() giúp R1 tiến lên 2 hàng và vòng qua 1 hố trên cột 2.',
        'Lặp 3 lần trong vòng for sẽ đưa R1 từ (2, 7) lên thẳng cờ ở (2, 1).'
      ],
      san: [
        '#####',
        '#.F.#',
        '#.u.#',
        '#...#',
        '#.u.#',
        '#...#',
        '#.u.#',
        '#...#',
        '#####'
      ],
      batDau: { x: 2, y: 7, huong: 0 },
      maMau: bai(['for i in range(3):', '    diag_right()']),
      loiGiai: bai(['for i in range(3):', '    diag_right()', '    diag_left()']),
      sao: { o: 3, nhip: 6 },
      loiSai: [
        { moTa: 'Thiếu diag_left() trong vòng lặp nên đâm vào tường bên phải', baiLam: bai(['for i in range(3):', '    diag_right()']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Chỉ lặp 2 lần nên dừng ở (2, 3) dưới hố cuối cùng', baiLam: bai(['for i in range(2):', '    diag_right()', '    diag_left()']), phaiCoMa: ['chua-toi-co'] }
      ],
      loiBinh: 'Cặp lệnh diag_right() và diag_left() trong vòng lặp tạo thành bước lách ziczac rất gọn.'
    }),

    /* ---- Màn 7: Radar quét cột đá trước mặt để lách chéo (2 sân) ---- */
    manDC({
      id: 6507, chuong: 'di-cheo', so: 7, ma: 'di-cheo.7',
      ten: 'Radar báo lách chéo', hang: 'bien-the',
      hamCuaEmCan: ['move'],
      deBai: 'Trên 4 bước tiến lên cờ, có chỗ bị vách đá `#` chắn ngay trước mặt (`g[0][1] == "#"`). Mỗi bước hãy quét `g = radar()`, nếu `g[0][1] == "#"` thì `diag_right()` để lách sang cột bên, còn không thì `move()`.',
      veMaMau: 'Chương trình có sẵn mới xử lý nhánh if khi gặp vách đá. Hãy thêm nhánh else để tiến thẳng khi đường trống.',
      goiY: [
        'Trong vòng lặp for i in range(4):, gọi g = radar().',
        'Dùng if g[0][1] == "#": gọi diag_right(), nhánh else: gọi move().'
      ],
      san: [
        [
          '######',
          '#..F.#',
          '#....#',
          '###..#',
          '#....#',
          '#....#',
          '######'
        ],
        [
          '######',
          '#..F.#',
          '###..#',
          '#....#',
          '##...#',
          '#....#',
          '######'
        ]
      ],
      batDau: [
        { x: 2, y: 5, huong: 0 },
        { x: 1, y: 5, huong: 0 }
      ],
      maMau: bai([
        'for i in range(4):',
        '    g = radar()',
        '    t = g[0][1]',
        '    if t == "#":',
        '        diag_right()'
      ]),
      loiGiai: bai([
        'for i in range(4):',
        '    g = radar()',
        '    t = g[0][1]',
        '    if t == "#":',
        '        diag_right()',
        '    else:',
        '        move()'
      ]),
      sao: { o: 9, nhip: 4 },
      loiSai: [
        { moTa: 'Thiếu nhánh else: move() nên gặp ô trống xe đứng yên', baiLam: bai(['for i in range(4):', '    g = radar()', '    t = g[0][1]', '    if t == "#":', '        diag_right()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đi thẳng cả 4 bước không kiểm tra radar nên đâm vào vách đá', baiLam: bai(['for i in range(4):', '    move()']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      loiBinh: 'Nhờ radar() nhìn trước 1 hàng, R1 biết đúng lúc nào cần lách chéo để tránh vách đá.'
    }),

    /* ---- Màn 8: Radar chọn lách trái hay lách phải (2 sân) ---- */
    manDC({
      id: 6508, chuong: 'di-cheo', so: 8, ma: 'di-cheo.8',
      ten: 'Chọn ngả lách chéo', hang: 'bien-the',
      deBai: 'Đường lên mỏ phải đi chéo 4 bước qua các khe đá. Mỗi bước hãy quét `g = radar()`, kiểm tra `if g[0][2] != "#":` thì `diag_right()`, ngược lại thì `diag_left()`.',
      veMaMau: 'Chương trình có sẵn mới gọi diag_right() khi góc phải trước mặt trống. Hãy thêm nhánh else gọi diag_left().',
      goiY: [
        'Ô chéo tiến-phải của R1 khi hướng lên ứng với g[0][2] trong lưới 3x3 của radar().',
        'Nếu g[0][2] != "#": gọi diag_right(), else: gọi diag_left().'
      ],
      san: [
        [
          '######',
          '#.F..#',
          '#..###',
          '#...##',
          '#..###',
          '#....#',
          '######'
        ],
        [
          '######',
          '#..F.#',
          '###..#',
          '##...#',
          '###..#',
          '#....#',
          '######'
        ]
      ],
      batDau: [
        { x: 2, y: 5, huong: 0 },
        { x: 3, y: 5, huong: 0 }
      ],
      maMau: bai([
        'for i in range(4):',
        '    g = radar()',
        '    t = g[0][2]',
        '    if t != "#":',
        '        diag_right()'
      ]),
      loiGiai: bai([
        'for i in range(4):',
        '    g = radar()',
        '    t = g[0][2]',
        '    if t != "#":',
        '        diag_right()',
        '    else:',
        '        diag_left()'
      ]),
      sao: { o: 6, nhip: 4 },
      loiSai: [
        { moTa: 'Chưa có nhánh else gọi diag_left() nên chưa lên tới cờ', baiLam: bai(['for i in range(4):', '    g = radar()', '    t = g[0][2]', '    if t != "#":', '        diag_right()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Chỉ gọi diag_right() 4 lần nên đâm vào vách đá', baiLam: bai(['for i in range(4):', '    diag_right()']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      loiBinh: 'Đọc góc g[0][2] của radar() giúp R1 biết ngay ngả chéo bên phải thông hay bị vách đá chắn.'
    }),

    /* ---- Màn 9: Kết hợp đi chéo, bàn xoay và lấp hố ---- */
    manDC({
      id: 6509, chuong: 'di-cheo', so: 9, ma: 'di-cheo.9',
      ten: 'Lách chéo lên bàn xoay', hang: 'bien-the',
      hamCuaEmCan: ['move', 'forward', 'lob'],
      deBai: 'Hãy `diag_right()` 2 lần để lên bàn xoay `@` (tự xoay mặt sang phải), sau đó `lob()` hất viên đá trước mặt lấp hố sâu, rồi `forward(3)` tới cờ.',
      veMaMau: 'Chương trình có sẵn đã đi chéo 2 lần lên bàn xoay "@" nhưng quên gọi lob() trước khi tiến 3 ô.',
      goiY: [
        'Lặp 2 lần diag_right() đưa R1 từ (1, 3) lên (2, 2) rồi vào bàn xoay @ ở (3, 1), mặt tự xoay sang phải.',
        'Lúc này viên đá ở (4, 1) và hố ở (5, 1) nằm ngay trước mũi xe: gọi lob() rồi forward(3) tới cờ ở (6, 1).'
      ],
      san: [
        '########',
        '#..@ouF#',
        '##.....#',
        '#......#',
        '########'
      ],
      batDau: { x: 1, y: 3, huong: 0 },
      maMau: bai(['diag_right()', 'diag_right()', 'forward(3)']),
      loiGiai: bai(['diag_right()', 'diag_right()', 'lob()', 'forward(3)']),
      sao: { o: 13, nhip: 7 },
      loiSai: [
        { moTa: 'Quên gọi lob() sau khi lên bàn xoay nên đâm vào viên đá ở (4, 1)', baiLam: bai(['diag_right()', 'diag_right()', 'forward(3)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Chỉ gọi diag_right() 1 lần nên chưa chạm tới bàn xoay "@"', baiLam: bai(['diag_right()', 'lob()', 'forward(3)']), phaiCoMa: ['nap-hut', 'dam-tuong'] }
      ],
      loiBinh: 'Bước chéo cuối đáp đúng lên bàn xoay @ để đổi hướng mặt mà không tốn nhịp quay xe.'
    }),

    /* ---- Màn 10: Trùm chương 1 (2 sân) ---- */
    manDC({
      id: 6510, chuong: 'di-cheo', so: 10, ma: 'di-cheo.10',
      ten: 'Trùm lách chéo mỏ đá', hang: 'trum',
      huyHieu: { ma: 'di-cheo', ten: 'Bánh Chéo Vách Đá' },
      hamCuaEmCan: ['move', 'forward', 'lob', 'fill_pit'],
      deBai: 'Đường mỏ dài 3 chặng (mỗi chặng tiến 2 hàng) rồi bước thêm 1 ô cuối vào cờ. Đầu mỗi chặng trong vòng lặp 3 lần, hãy quét `g = radar()`: nếu trước mặt có đá (`g[0][1] == "V"`) thì gọi `fill_pit()` để hất đá lấp hố rồi tiến 2 ô; ngược lại (gặp trụ đá `#`) thì gọi `diag_right()` rồi `diag_left()` để lách qua trụ đá. Cuối cùng gọi `move()` vào cờ.',
      veMaMau: 'Chương trình có sẵn mới viết nhánh if gọi fill_pit(). Hãy hoàn thiện nhánh else lách chéo và lệnh move() ở cuối.',
      goiY: [
        'Dùng vòng lặp for i in range(3): cho 3 chặng.',
        'Trong vòng lặp: g = radar(), nếu g[0][1] == "V": gọi fill_pit(), else: gọi diag_right() rồi diag_left(). Ngoài vòng lặp gọi move().'
      ],
      san: [
        [
          '#####',
          '#.F.#',
          '#...#',
          '#.#.#',
          '#...#',
          '#.#.#',
          '#.u.#',
          '#.o.#',
          '#...#',
          '#####'
        ],
        [
          '#####',
          '#.F.#',
          '#...#',
          '#.#.#',
          '#.u.#',
          '#.o.#',
          '#...#',
          '#.#.#',
          '#...#',
          '#####'
        ]
      ],
      batDau: [
        { x: 2, y: 8, huong: 0 },
        { x: 2, y: 8, huong: 0 }
      ],
      maMau: bai([
        'for i in range(3):',
        '    g = radar()',
        '    t = g[0][1]',
        '    if t == "V":',
        '        fill_pit()'
      ]),
      loiGiai: bai([
        'for i in range(3):',
        '    g = radar()',
        '    t = g[0][1]',
        '    if t == "V":',
        '        fill_pit()',
        '    else:',
        '        diag_right()',
        '        diag_left()',
        'move()'
      ]),
      sao: { o: 19, nhip: 9 },
      loiSai: [
        { moTa: 'Thiếu nhánh else lách qua trụ đá và lệnh move() cuối', baiLam: bai(['for i in range(3):', '    g = radar()', '    t = g[0][1]', '    if t == "V":', '        fill_pit()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Chỉ lách chéo mà không lấp hố khi gặp đá nên rơi xuống hố sâu', baiLam: bai(['for i in range(3):', '    diag_right()', '    diag_left()', 'move()']), phaiCoMa: ['roi-ho'] }
      ],
      loiBinh: 'Quét radar kết hợp fill_pit() và lách chéo giúp R1 vượt qua cả hố sâu lẫn trụ đá chắn đường.'
    }),

    /* ========================================================================
       CHƯƠNG 2: che-di-cheo — "Chế lệnh: đi chéo" (10 màn)
       Hàm chế mới:
       1. diag_r(n)       (che-di-cheo.1)
       2. diag_l(n)       (che-di-cheo.2)
       3. bypass_r()      (che-di-cheo.4)
       4. diag_lob()      (che-di-cheo.5)
       5. auto_bypass()   (che-di-cheo.6)
       Sửa hàm hỏng:
       - bypass_r()       (che-di-cheo.8)
       ======================================================================== */

    /* ---- Màn 11 (che-di-cheo.1): Chế hàm diag_r(n) ---- */
    manDC({
      id: 6511, chuong: 'che-di-cheo', so: 1, ma: 'che-di-cheo.1',
      ten: 'Chế hàm lách phải n ô', hang: 'lam-quen',
      canHam: 'tran-khung',
      mucTieu: 'bong-mo',
      bongMo: { x: 4, y: 1, huong: 0, diQua: [{ x: 2, y: 3 }] },
      taoHam: ['diag_r'],
      chinhCoDinh: true,
      deBai: 'Hãy viết hàm `diag_r(n)` dùng vòng lặp `for` gọi `diag_right()` đúng `n` lần để R1 trượt chéo tiến-phải 3 ô liền nhau tới bóng mờ.',
      veMaMau: 'Chương trình chính đã gọi sẵn diag_r(3). Hãy vào Xưởng hàm viết thân hàm diag_r(n).',
      goiY: [
        'Trong def diag_r(n):, viết for i in range(n): rồi gọi diag_right() bên trong.',
        'Chương trình chính đã gọi sẵn diag_r(3).'
      ],
      san: [
        '######',
        '#....#',
        '#.#..#',
        '##...#',
        '#....#',
        '######'
      ],
      batDau: { x: 1, y: 4, huong: 0 },
      maMau: bai(['diag_r(3)'], { hamCuaEmMoi: [H('diag_r', ['n'], ['diag_right()'])] }),
      loiGiai: bai(['diag_r(3)'], { hamCuaEmMoi: [H('diag_r', ['n'], T_DIAG_R)] }),
      sao: { o: 3, nhip: 3 },
      loiSai: [
        { moTa: 'Trong diag_r(n) chỉ gọi diag_right() 1 lần không dùng vòng lặp for', baiLam: bai(['diag_r(3)']), hamCuaEmMoi: [H('diag_r', ['n'], ['diag_right()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Trong diag_r(n) gọi nhầm diag_left() nên đâm vào tường bên trái', baiLam: bai(['diag_r(3)']), hamCuaEmMoi: [H('diag_r', ['n'], ['for i in range(n):', '    diag_left()'])], phaiCoMa: ['dam-tuong', 'lech-bong-mo'] }
      ],
      loiBinh: 'Hàm diag_r(n) đã lưu vào kho lệnh để em đi chéo phải bao nhiêu ô tùy ý.'
    }),

    /* ---- Màn 12 (che-di-cheo.2): Chế hàm diag_l(n) ---- */
    manDC({
      id: 6512, chuong: 'che-di-cheo', so: 2, ma: 'che-di-cheo.2',
      ten: 'Chế hàm lách trái n ô', hang: 'lam-quen',
      canHam: 'tran-khung',
      mucTieu: 'bong-mo',
      bongMo: { x: 1, y: 1, huong: 0, diQua: [{ x: 3, y: 3 }] },
      taoHam: ['diag_l'],
      chinhCoDinh: true,
      deBai: 'Hãy viết hàm `diag_l(n)` dùng vòng lặp `for` gọi `diag_left()` đúng `n` lần để R1 trượt chéo tiến-trái 3 ô liền nhau tới bóng mờ.',
      veMaMau: 'Chương trình chính đã gọi sẵn diag_l(3). Hãy vào Xưởng hàm viết thân hàm diag_l(n).',
      goiY: [
        'Trong def diag_l(n):, viết for i in range(n): rồi gọi diag_left() bên trong.',
        'Chương trình chính đã gọi sẵn diag_l(3).'
      ],
      san: [
        '######',
        '#....#',
        '#..#.#',
        '#...##',
        '#....#',
        '######'
      ],
      batDau: { x: 4, y: 4, huong: 0 },
      maMau: bai(['diag_l(3)'], { hamCuaEmMoi: [H('diag_l', ['n'], ['diag_left()'])] }),
      loiGiai: bai(['diag_l(3)'], { hamCuaEmMoi: [H('diag_l', ['n'], T_DIAG_L)] }),
      sao: { o: 3, nhip: 3 },
      loiSai: [
        { moTa: 'Trong diag_l(n) chỉ gọi diag_left() 1 lần không dùng vòng lặp for', baiLam: bai(['diag_l(3)']), hamCuaEmMoi: [H('diag_l', ['n'], ['diag_left()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Trong diag_l(n) gọi nhầm diag_right() nên đâm vào tường bên phải', baiLam: bai(['diag_l(3)']), hamCuaEmMoi: [H('diag_l', ['n'], ['for i in range(n):', '    diag_right()'])], phaiCoMa: ['dam-tuong', 'lech-bong-mo'] }
      ],
      loiBinh: 'Có đủ cặp diag_r(n) và diag_l(n), R1 đã sẵn sàng lách chéo hai bên theo tham số.'
    }),

    /* ---- Màn 13 (che-di-cheo.3): Luyện diag_r(n), diag_l(n) và lob() ---- */
    manDC({
      id: 6513, chuong: 'che-di-cheo', so: 3, ma: 'che-di-cheo.3',
      ten: 'Đường chéo chữ V', hang: 'luyen',
      hamCuaEmCan: ['move', 'forward', 'lob', 'diag_r', 'diag_l'],
      deBai: 'Hãy gọi `diag_r(2)` rồi `diag_l(1)` để vòng qua vách đá vào ngay dưới viên đá tròn, sau đó gọi `lob()` hất đá lấp hố sâu rồi `forward(3)` tới cờ.',
      veMaMau: 'Chương trình có sẵn đã lách qua vách đá bằng diag_r(2) và diag_l(1) nhưng thiếu lệnh lob() trước forward(3).',
      goiY: [
        'Từ (1, 7) gọi diag_r(2) tới (3, 5), rồi gọi diag_l(1) tới (2, 4) ngay dưới viên đá ở (2, 3).',
        'Gọi lob() để lấp hố ở (2, 2), rồi forward(3) tiến thẳng lên cờ ở (2, 1).'
      ],
      san: [
        '#####',
        '#.F.#',
        '#.u.#',
        '#.o.#',
        '#...#',
        '###.#',
        '#...#',
        '#...#',
        '#####'
      ],
      batDau: { x: 1, y: 7, huong: 0 },
      maMau: bai(['diag_r(2)', 'diag_l(1)', 'forward(3)']),
      loiGiai: bai(['diag_r(2)', 'diag_l(1)', 'lob()', 'forward(3)']),
      sao: { o: 17, nhip: 8 },
      loiSai: [
        { moTa: 'Quên gọi lob() trước forward(3) nên đâm vào viên đá ở (2, 3)', baiLam: bai(['diag_r(2)', 'diag_l(1)', 'forward(3)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Chỉ tiến 2 ô sau khi lấp hố nên dừng ở (2, 2) trước cờ', baiLam: bai(['diag_r(2)', 'diag_l(1)', 'lob()', 'forward(2)']), phaiCoMa: ['chua-toi-co'] }
      ],
      loiBinh: 'Ghép diag_r(2) và diag_l(1) giúp R1 vòng qua vách đá chắn ngang và vào đúng vị trí hất đá.'
    }),

    /* ---- Màn 14 (che-di-cheo.4): Chế hàm bypass_r() ---- */
    manDC({
      id: 6514, chuong: 'che-di-cheo', so: 4, ma: 'che-di-cheo.4',
      ten: 'Chế hàm lách trụ đá', hang: 'luyen',
      canHam: 'tran-khung',
      mucTieu: 'bong-mo',
      bongMo: { x: 2, y: 1, huong: 0, diQua: [{ x: 3, y: 4 }, { x: 3, y: 2 }] },
      taoHam: ['bypass_r'],
      chinhCoDinh: true,
      deBai: 'Trước mặt R1 có trụ đá chắn ngang cột. Hãy viết hàm `bypass_r()` gồm `diag_right()` rồi `diag_left()` để lách qua bên phải trụ đá và trở về đúng cột cũ chỉ trong 2 nhịp.',
      veMaMau: 'Chương trình chính đã gọi bypass_r() 2 lần. Hãy hoàn thiện thân hàm bypass_r() trong Xưởng hàm.',
      goiY: [
        'Trong def bypass_r():, gọi diag_right() rồi diag_left().',
        'Chương trình chính gọi bypass_r() hai lần để vượt qua 2 trụ đá liên tiếp.'
      ],
      san: [
        '#####',
        '#...#',
        '#.#.#',
        '#...#',
        '#.#.#',
        '#...#',
        '#####'
      ],
      batDau: { x: 2, y: 5, huong: 0 },
      maMau: bai(['bypass_r()', 'bypass_r()'], { hamCuaEmMoi: [H('bypass_r', [], ['diag_right()'])] }),
      loiGiai: bai(['bypass_r()', 'bypass_r()'], { hamCuaEmMoi: [H('bypass_r', [], T_BYPASS_R)] }),
      sao: { o: 4, nhip: 4 },
      loiSai: [
        { moTa: 'Trong bypass_r() chỉ gọi diag_right() mà thiếu diag_left() nên đâm vào tường bên phải', baiLam: bai(['bypass_r()', 'bypass_r()']), hamCuaEmMoi: [H('bypass_r', [], ['diag_right()'])], phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Trong bypass_r() lách sang trái thay vì sang phải nên bỏ lỡ điểm mốc bên phải', baiLam: bai(['bypass_r()', 'bypass_r()']), hamCuaEmMoi: [H('bypass_r', [], ['diag_left()', 'diag_right()'])], phaiCoMa: ['chua-qua-diem'] }
      ],
      loiBinh: 'Với bánh omni đi chéo, bypass_r() vượt qua chướng ngại trước mặt chỉ mất 2 nhịp thay vì 4 nhịp.'
    }),

    /* ---- Màn 15 (che-di-cheo.5): Chế hàm diag_lob() ---- */
    manDC({
      id: 6515, chuong: 'che-di-cheo', so: 5, ma: 'che-di-cheo.5',
      ten: 'Chế hàm lách phải hất đá', hang: 'luyen',
      canHam: 'tran-khung',
      mucTieu: 'dua-vat',
      taoHam: ['diag_lob'],
      chinhCoDinh: true,
      hamCuaEmCan: ['lob'],
      deBai: 'Ba viên đá nằm trên bậc thang chéo sang phải, mỗi viên cần hất xa 2 ô vào máng `D` phía trên. Hãy viết hàm `diag_lob()`: gọi `diag_right()` để lách vào ngay dưới viên đá rồi gọi `lob()` để hất đá vào máng.',
      veMaMau: 'Chương trình chính đã lặp 3 lần diag_lob(). Hãy thêm lệnh lob() vào thân hàm diag_lob().',
      goiY: [
        'Trong def diag_lob():, gọi diag_right() rồi gọi lob().',
        'Chương trình chính lặp 3 lần diag_lob() để hất đủ 3 viên đá vào 3 máng D.'
      ],
      san: [
        '#######',
        '#...D.#',
        '#..Do.#',
        '#.Do..#',
        '#.o...#',
        '#.....#',
        '#.....#',
        '#######'
      ],
      batDau: { x: 1, y: 6, huong: 0 },
      maMau: bai(['for i in range(3):', '    diag_lob()'], { hamCuaEmMoi: [H('diag_lob', [], ['diag_right()'])] }),
      loiGiai: bai(['for i in range(3):', '    diag_lob()'], { hamCuaEmMoi: [H('diag_lob', [], T_DIAG_LOB)] }),
      sao: { o: 8, nhip: 9 },
      loiSai: [
        { moTa: 'Trong diag_lob() chỉ gọi diag_right() mà quên gọi lob() để hất đá', baiLam: bai(['for i in range(3):', '    diag_lob()']), hamCuaEmMoi: [H('diag_lob', [], ['diag_right()'])], phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Trong diag_lob() gọi lob() trước diag_right() nên xúc hụt ngay từ bước đầu', baiLam: bai(['for i in range(3):', '    diag_lob()']), hamCuaEmMoi: [H('diag_lob', [], ['lob()', 'diag_right()'])], phaiCoMa: ['nap-hut', 'chua-dua-vat'] }
      ],
      loiBinh: 'Hàm diag_lob() gom thao tác lách chéo tới viên đá và hất đá vào một lệnh duy nhất.'
    }),

    /* ---- Màn 16 (che-di-cheo.6): Chế hàm auto_bypass() (2 sân) ---- */
    manDC({
      id: 6516, chuong: 'che-di-cheo', so: 6, ma: 'che-di-cheo.6',
      ten: 'Chế hàm tự lách trụ đá', hang: 'bien-the',
      canHam: 'tran-khung',
      taoHam: ['auto_bypass'],
      chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward', 'bypass_r'],
      deBai: 'Mỗi chặng R1 cần tiến lên 2 hàng. Hãy viết hàm `auto_bypass()`: quét `g = radar()`, nếu ô ngay trước mặt là trụ đá (`g[0][1] == "#"`) thì gọi `bypass_r()`, ngược lại thì gọi `forward(2)`.',
      veMaMau: 'Chương trình chính đã lặp 3 lần auto_bypass(). Hãy viết thân hàm auto_bypass() kiểm tra radar().',
      goiY: [
        'Trong def auto_bypass():, g = radar().',
        'Nếu g[0][1] == "#": gọi bypass_r(), else: gọi forward(2).'
      ],
      san: [
        [
          '#####',
          '#.F.#',
          '#.#.#',
          '#...#',
          '#...#',
          '#.#.#',
          '#...#',
          '#####'
        ],
        [
          '#####',
          '#.F.#',
          '#...#',
          '#...#',
          '#.#.#',
          '#...#',
          '#...#',
          '#####'
        ]
      ],
      batDau: [
        { x: 2, y: 6, huong: 0 },
        { x: 2, y: 6, huong: 0 }
      ],
      maMau: bai(['for i in range(3):', '    auto_bypass()'], { hamCuaEmMoi: [H('auto_bypass', [], ['g = radar()', 'forward(2)'])] }),
      loiGiai: bai(['for i in range(3):', '    auto_bypass()'], { hamCuaEmMoi: [H('auto_bypass', [], T_AUTO_BYPASS)] }),
      sao: { o: 14, nhip: 6 },
      loiSai: [
        { moTa: 'Trong auto_bypass() luôn gọi forward(2) nên đâm vào trụ đá', baiLam: bai(['for i in range(3):', '    auto_bypass()']), hamCuaEmMoi: [H('auto_bypass', [], ['g = radar()', 'forward(2)'])], phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Thiếu nhánh else gọi forward(2) nên khi đường trống xe đứng yên', baiLam: bai(['for i in range(3):', '    auto_bypass()']), hamCuaEmMoi: [H('auto_bypass', [], ['g = radar()', 't = g[0][1]', 'if t == "#":', '    bypass_r()'])], phaiCoMa: ['chua-toi-co'] }
      ],
      loiBinh: 'Dù chặng đường trống hay có trụ đá chắn, auto_bypass() đều đưa R1 tiến 2 hàng trong đúng 2 nhịp.'
    }),

    /* ---- Màn 17 (che-di-cheo.7): Luyện auto_bypass() và diag_lob() (2 sân) ---- */
    manDC({
      id: 6517, chuong: 'che-di-cheo', so: 7, ma: 'che-di-cheo.7',
      ten: 'Lách đá lấp hố dọc hầm', hang: 'bien-the',
      hamCuaEmCan: ['move', 'forward', 'lob', 'bypass_r', 'diag_lob', 'auto_bypass'],
      deBai: 'Hãy gọi `diag_lob()` để lách phải sang cột giữa và hất viên đá lấp hố sâu phía trên, sau đó gọi `auto_bypass()` 2 lần để vượt qua 2 chặng cuối tới cờ.',
      veMaMau: 'Chương trình có sẵn mới gọi auto_bypass() 1 lần sau diag_lob(). Hãy gọi thêm auto_bypass() lần thứ hai.',
      goiY: [
        'Bắt đầu bằng diag_lob() để R1 từ (1, 6) lách lên (2, 5), nạp đá ở (2, 4) lấp hố ở (2, 3).',
        'Sau đó gọi auto_bypass() 2 lần (hoặc dùng vòng for 2 lần) để từ (2, 5) tiến 4 hàng lên cờ ở (2, 1).'
      ],
      san: [
        [
          '#####',
          '#.F.#',
          '#.#.#',
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
          '#...#',
          '#...#',
          '#####'
        ]
      ],
      batDau: [
        { x: 1, y: 6, huong: 0 },
        { x: 1, y: 6, huong: 0 }
      ],
      maMau: bai(['diag_lob()', 'auto_bypass()']),
      loiGiai: bai(['diag_lob()', 'auto_bypass()', 'auto_bypass()']),
      sao: { o: 21, nhip: 7 },
      loiGiaiKhac: {
        moTa: 'Dùng vòng lặp for 2 lần gọi auto_bypass()',
        baiLam: bai(['diag_lob()', 'for i in range(2):', '    auto_bypass()'])
      },
      loiSai: [
        { moTa: 'Mới gọi auto_bypass() 1 lần nên dừng ở (2, 3) chưa tới cờ', baiLam: bai(['diag_lob()', 'auto_bypass()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên gọi diag_lob() ở đầu nên đi ở cột 1 không vào được cột cờ', baiLam: bai(['auto_bypass()', 'auto_bypass()']), phaiCoMa: ['chua-toi-co'] }
      ],
      loiBinh: 'Khi hố sâu đã được lấp thành sàn phẳng, auto_bypass() đi qua đoạn đó dễ dàng.'
    }),

    /* ---- Màn 18 (che-di-cheo.8): Sửa hàm hỏng bypass_r() ---- */
    manDC({
      id: 6518, chuong: 'che-di-cheo', so: 8, ma: 'che-di-cheo.8',
      ten: 'Sửa hàm lách trụ đá', hang: 'bien-the',
      mucTieu: 'bong-mo',
      bongMo: { x: 2, y: 5, huong: 0, diQua: [{ x: 2, y: 1 }] },
      suaHam: ['bypass_r'],
      chinhCoDinh: true,
      khoaHamMan: ['quarry_back'],
      hamCuaEmCan: ['back', 'bypass_r'],
      deBai: 'Hàm `bypass_r()` đang bị viết nhầm thành 2 lần `diag_right()` nên R1 lệch hẳn khỏi làn đường. Hãy sửa lại `bypass_r()` thành `diag_right()` rồi `diag_left()` để R1 lách lên điểm mốc và lùi về bóng mờ.',
      veMaMau: 'Mở hàm bypass_r() trong Xưởng hàm và đổi dòng thứ hai từ diag_right() thành diag_left().',
      goiY: [
        'Sửa dòng thứ hai trong def bypass_r(): từ diag_right() thành diag_left().',
        'Khi bypass_r() đúng, quarry_back() sẽ đưa R1 lùi về đúng bóng mờ ở (2, 5).'
      ],
      san: [
        '#####',
        '#...#',
        '#.#.#',
        '#...#',
        '#.#.#',
        '#...#',
        '#####'
      ],
      batDau: { x: 2, y: 5, huong: 0 },
      maMau: bai(
        ['bypass_r()', 'bypass_r()', 'quarry_back()'],
        {
          hamCuaMan: [H('quarry_back', [], ['slide_right()', 'wait()', 'back()', 'back()', 'back()', 'back()', 'slide_left()', 'wait()'])],
          hamCuaEmMoi: [H('bypass_r', [], ['diag_right()', 'diag_right()'])]
        }
      ),
      loiGiai: bai(
        ['bypass_r()', 'bypass_r()', 'quarry_back()'],
        {
          hamCuaMan: [H('quarry_back', [], ['slide_right()', 'wait()', 'back()', 'back()', 'back()', 'back()', 'slide_left()', 'wait()'])],
          hamCuaEmMoi: [H('bypass_r', [], T_BYPASS_R)]
        }
      ),
      sao: { o: 16, nhip: 10 },
      loiSai: [
        {
          moTa: 'Không sửa hàm bypass_r(): hai lần diag_right() làm xe đâm vào tường bên phải',
          baiLam: bai(['bypass_r()', 'bypass_r()', 'quarry_back()'], { hamCuaMan: [H('quarry_back', [], ['slide_right()', 'wait()', 'back()', 'back()', 'back()', 'back()', 'slide_left()', 'wait()'])] }),
          hamCuaEmMoi: [H('bypass_r', [], ['diag_right()', 'diag_right()'])],
          phaiCoMa: ['dam-tuong', 'chua-qua-diem']
        },
        {
          moTa: 'Xóa mất dòng thứ hai trong bypass_r(): xe mới lệch sang cột 3 đã đâm tường',
          baiLam: bai(['bypass_r()', 'bypass_r()', 'quarry_back()'], { hamCuaMan: [H('quarry_back', [], ['slide_right()', 'wait()', 'back()', 'back()', 'back()', 'back()', 'slide_left()', 'wait()'])] }),
          hamCuaEmMoi: [H('bypass_r', [], ['diag_right()'])],
          phaiCoMa: ['dam-tuong', 'chua-qua-diem']
        }
      ],
      loiBinh: 'Sửa lại bước thứ hai thành diag_left() giúp R1 giữ đúng trục đường sau mỗi lần né trụ đá.'
    }),

    /* ---- Màn 19 (che-di-cheo.9): Tổng hợp hàm đi chéo và danh sách 2D ---- */
    manDC({
      id: 6519, chuong: 'che-di-cheo', so: 9, ma: 'che-di-cheo.9',
      ten: 'Bảng lộ trình chéo', hang: 'bien-the',
      hamCuaEmCan: ['move', 'forward', 'lob', 'diag_r', 'diag_l'],
      deBai: 'Danh sách 2 chiều `steps = [[2, 1], [1, 2]]` ghi từng chặng: `r[0]` bước chéo phải `diag_r(r[0])` rồi `r[1]` bước chéo trái `diag_l(r[1])`. Hãy duyệt `for r in steps:` thực hiện 2 bước đó, rồi gọi `lob()` lấp hố và `forward(3)` tới cờ.',
      veMaMau: 'Chương trình có sẵn đã duyệt danh sách steps nhưng chưa gọi lob() và forward(3) ở cuối.',
      goiY: [
        'Trong vòng lặp for r in steps:, gọi diag_r(r[0]) rồi diag_l(r[1]).',
        'Sau vòng lặp, R1 đứng ở (2, 4) ngay dưới viên đá (2, 3): gọi lob() lấp hố ở (2, 2) rồi forward(3) tới cờ.'
      ],
      san: [
        '######',
        '#.F..#',
        '#.u..#',
        '#.o..#',
        '#....#',
        '#.#..#',
        '#....#',
        '#.#..#',
        '#....#',
        '#.#..#',
        '#....#',
        '######'
      ],
      batDau: { x: 2, y: 10, huong: 0 },
      maMau: bai([
        'steps = [[2, 1], [1, 2]]',
        'for r in steps:',
        '    diag_r(r[0])',
        '    diag_l(r[1])'
      ]),
      loiGiai: bai([
        'steps = [[2, 1], [1, 2]]',
        'for r in steps:',
        '    diag_r(r[0])',
        '    diag_l(r[1])',
        'lob()',
        'forward(3)'
      ]),
      sao: { o: 19, nhip: 11 },
      loiSai: [
        { moTa: 'Mới chạy xong vòng lặp steps mà chưa lấp hố và tiến lên cờ', baiLam: bai(['steps = [[2, 1], [1, 2]]', 'for r in steps:', '    diag_r(r[0])', '    diag_l(r[1])']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên gọi lob() trước forward(3) nên đâm vào viên đá ở (2, 3)', baiLam: bai(['steps = [[2, 1], [1, 2]]', 'for r in steps:', '    diag_r(r[0])', '    diag_l(r[1])', 'forward(3)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      loiBinh: 'Kết hợp danh sách 2 chiều với diag_r() và diag_l() giúp R1 uốn lượn qua dãy vách đá phức tạp.'
    }),

    /* ---- Màn 20 (che-di-cheo.10): Trùm chương 2 (2 sân) ---- */
    manDC({
      id: 6520, chuong: 'che-di-cheo', so: 10, ma: 'che-di-cheo.10',
      ten: 'Trùm chế lệnh đi chéo', hang: 'trum',
      huyHieu: { ma: 'che-di-cheo', ten: 'Kỹ Sư Lách Chéo' },
      hamCuaEmCan: ['move', 'forward', 'lob', 'bypass_r', 'diag_lob', 'auto_bypass'],
      deBai: 'Hành lang mỏ gồm 2 nhánh nối bằng bước lách chéo. Hãy gọi `auto_bypass()` để vượt chặng đầu ở nhánh trái, tiếp theo gọi `diag_lob()` để lách sang nhánh giữa và hất đá lấp hố, rồi gọi `auto_bypass()` 2 lần nữa để lên tới cờ.',
      veMaMau: 'Chương trình có sẵn đã gọi auto_bypass() và diag_lob(). Hãy gọi thêm 2 lần auto_bypass() để lên tới cờ.',
      goiY: [
        'Bước 1: gọi auto_bypass() đưa R1 từ (1, 8) lên (1, 6).',
        'Bước 2: gọi diag_lob() để lách sang (2, 5) và hất viên đá ở (2, 4) lấp hố ở (2, 3).',
        'Bước 3: gọi auto_bypass() 2 lần để từ (2, 5) vượt qua (2, 3) lên cờ ở (2, 1).'
      ],
      san: [
        [
          '######',
          '#.F..#',
          '#....#',
          '#.u..#',
          '#.o..#',
          '#....#',
          '#....#',
          '#.#..#',
          '#....#',
          '######'
        ],
        [
          '######',
          '#.F..#',
          '#.#..#',
          '#.u..#',
          '#.o..#',
          '#....#',
          '#....#',
          '#....#',
          '#....#',
          '######'
        ]
      ],
      batDau: [
        { x: 1, y: 8, huong: 0 },
        { x: 1, y: 8, huong: 0 }
      ],
      maMau: bai(['auto_bypass()', 'diag_lob()']),
      loiGiai: bai(['auto_bypass()', 'diag_lob()', 'auto_bypass()', 'auto_bypass()']),
      sao: { o: 22, nhip: 9 },
      loiGiaiKhac: {
        moTa: 'Dùng vòng lặp for 2 lần cho hai lệnh auto_bypass() cuối',
        baiLam: bai(['auto_bypass()', 'diag_lob()', 'for i in range(2):', '    auto_bypass()'])
      },
      loiSai: [
        { moTa: 'Mới gọi 1 lần auto_bypass() ở nhánh giữa nên dừng ở (2, 3) chưa tới cờ', baiLam: bai(['auto_bypass()', 'diag_lob()', 'auto_bypass()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Gọi diag_lob() ngay từ đầu trước khi qua chặng đầu nên xúc hụt', baiLam: bai(['diag_lob()', 'auto_bypass()', 'auto_bypass()']), phaiCoMa: ['nap-hut', 'chua-toi-co'] }
      ],
      loiBinh: 'Ghép auto_bypass() và diag_lob() giúp R1 tự thích ứng với trụ đá ở cả hai sân và về đích gọn gàng.'
    })
  ];

  ManHoc.manDiCheo = DS;
  if (laNode) module.exports = DS;
})();
