/* ============================================================================
   man-nhan-dang.js — Mùa 6 "Mỏ đá" · Gói 7 "Nhận dạng mỏ" (20 màn)
   - Chương 1: nhan-dang (10 màn: nhan-dang.1 .. nhan-dang.10) — "Đá tròn hay quặng?"
     Màn 1 trình diễn (chiChay: true), màn 2–9 luyện shape(huong) ("front",
     "left", "right") phân biệt "round", "square", "ore", "none" kết hợp
     aim_lob(n), fill_pit(), diag_right(), màn 10 trùm 2 sân.
   - Chương 2: che-nhan-dang (10 màn: che-nhan-dang.1 .. che-nhan-dang.10) — "Chế lệnh: lọc quặng"
     Chế 5 hàm mới: sort_lob(), round_fill(), pick_round(), diag_sort(), safe_sort()
     + 1 màn sửa hàm hỏng (che-nhan-dang.8), màn 10 trùm 2 sân.
   Toàn bộ 20 màn chạy trên Máy khai mỏ R1 (loaiRobot: 'omni', tay: 'nem',
   camBien: [{ ma: 'radar', o: 'tren', nhanDang: true }], omniCheo: true,
   chinhLuc: true, nhanDang: true, tamNemMacDinh: 2, daLapHo: true).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var KHAY_NHAN_DANG = ['left_move', 'right_move', 'left_back', 'right_back', 'slide_left', 'slide_right', 'wait', 'load', 'throw', 'radar', 'diag_left', 'diag_right', 'aim', 'shape'];
  var ROBOT_NHAN_DANG = { than: 'omni', tay: 'nem', camBien: [{ ma: 'radar', o: 'tren', nhanDang: true }] };
  var CAU_TRUC = ['for', 'if', 'while', 'list'];

  function bai(chinh, Phu) {
    return {
      chinh: chinh,
      hamCuaMan: (Phu && Phu.hamCuaMan) || [],
      hamCuaEmMoi: (Phu && Phu.hamCuaEmMoi) || []
    };
  }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo, than: than }; }

  var T_SORT_LOB = ['s = shape("front")', 'if s == "ore":', '    aim_lob(3)', 'else:', '    aim_lob(2)'];
  var T_ROUND_FILL = ['s = shape("front")', 'if s == "round":', '    fill_pit()', 'else:', '    diag_r(2)'];
  var T_PICK_ROUND = ['s = shape("left")', 'if s == "round":', '    turn_left()', 'else:', '    turn_right()', 'fill_pit()'];
  var T_DIAG_SORT = ['diag_right()', 'sort_lob()'];
  var T_SAFE_SORT = ['s = shape("front")', 'if s == "ore":', '    aim_lob(3)', 's = shape("front")', 'if s == "round":', '    aim_lob(2)'];

  function manND(o) {
    return Object.assign({
      loaiRobot: 'omni',
      robot: ROBOT_NHAN_DANG,
      omniCheo: true,
      chinhLuc: true,
      nhanDang: true,
      tamNemMacDinh: 2,
      daLapHo: true,
      hamGoc: KHAY_NHAN_DANG,
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
       CHƯƠNG 1: nhan-dang — "Đá tròn hay quặng?" (10 màn)
       ======================================================================== */

    /* ---- Màn 1: Trình diễn nâng cấp nhận dạng shape(huong) (chiChay: true) ---- */
    manND({
      id: 6701, chuong: 'nhan-dang', so: 1, ma: 'nhan-dang.1',
      ten: 'Mắt thần phân loại', hang: 'lam-quen',
      chiChay: true, chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward', 'slide_r', 'lob', 'fill_pit'],
      deBai: 'Cảm biến radar của R1 vừa được nâng cấp thấu kính nhận dạng `shape(huong)`, trả về `"round"` (đá tròn), `"square"` (đá vuông), `"ore"` (quặng quý) hoặc `"none"`, không tốn nhịp. Chỉ đá tròn mới lăn lấp vừa hố sâu `u`, còn đá vuông thì không! Bấm Chạy để xem R1 tránh viên đá vuông và lấp hố bằng đá tròn.',
      veMaMau: 'Chương trình đã viết sẵn và khóa. Bấm Chạy để xem R1 kiểm tra shape("front") rồi trượt sang cột đá tròn.',
      goiY: ['Bấm nút Chạy để xem shape("front") phát hiện viên đá vuông "square" và trượt sang cột đá tròn "round".'],
      san: [
        '######',
        '#..F.#',
        '#.uu.#',
        '#.oo.#',
        '#....#',
        '######'
      ],
      vatDang: [
        '......',
        '......',
        '......',
        '..sr..',
        '......',
        '......'
      ],
      batDau: { x: 2, y: 4, huong: 0 },
      maMau: bai(['s = shape("front")', 'if s == "square":', '    slide_r(1)', 'fill_pit()', 'move()']),
      loiGiai: bai(['s = shape("front")', 'if s == "square":', '    slide_r(1)', 'fill_pit()', 'move()']),
      sao: { o: 18, nhip: 6 },
      loiBinh: 'Lệnh shape(huong) phân biệt đá tròn ("round"), đá vuông ("square") và quặng quý ("ore") ngay tức thì mà không tốn nhịp.'
    }),

    /* ---- Màn 2: Phân loại quặng quý ("ore") và đá tròn ("round") ---- */
    manND({
      id: 6702, chuong: 'nhan-dang', so: 2, ma: 'nhan-dang.2',
      ten: 'Quặng quý vào máng xa', hang: 'lam-quen',
      mucTieu: 'dua-vat',
      hamCuaEmCan: ['lob', 'aim_lob'],
      deBai: 'Trên hai sân, viên đá trước mũi xe có thể là quặng quý (`"ore"`) cần hất xa 3 ô vào máng `D` ở hàng 1, hoặc đá tròn (`"round"`) cần hất 2 ô vào máng `D` ở hàng 2. Hãy kiểm tra `if shape("front") == "ore":` để gọi `aim_lob(3)`, ngược lại (`else:`) gọi `aim_lob(2)`.',
      veMaMau: 'Chương trình có sẵn mới có nhánh if cho quặng "ore". Hãy viết thêm nhánh else gọi aim_lob(2).',
      goiY: [
        'Ở cuối chương trình, viết else: thẳng cột với if.',
        'Bên trong else, thụt lề 4 dấu cách và gọi aim_lob(2).'
      ],
      san: [
        [
          '#####',
          '#.D.#',
          '#...#',
          '#.o.#',
          '#...#',
          '#####'
        ],
        [
          '#####',
          '#...#',
          '#.D.#',
          '#.o.#',
          '#...#',
          '#####'
        ]
      ],
      vatDang: [
        [
          '.....',
          '.....',
          '.....',
          '..q..',
          '.....',
          '.....'
        ],
        [
          '.....',
          '.....',
          '.....',
          '..r..',
          '.....',
          '.....'
        ]
      ],
      batDau: { x: 2, y: 4, huong: 0 },
      maMau: bai(['s = shape("front")', 'if s == "ore":', '    aim_lob(3)']),
      loiGiai: bai(['s = shape("front")', 'if s == "ore":', '    aim_lob(3)', 'else:', '    aim_lob(2)']),
      sao: { o: 10, nhip: 2 },
      loiSai: [
        { moTa: 'Chưa viết nhánh else để hất viên đá tròn ở sân 2', baiLam: bai(['s = shape("front")', 'if s == "ore":', '    aim_lob(3)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Luôn gọi aim_lob(2) không phân biệt quặng quý làm quặng rơi trượt ngoài máng', baiLam: bai(['aim_lob(2)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      loiBinh: 'Nhờ shape("front"), R1 tự động hất quặng quý xa 3 ô và đá tròn gần 2 ô trên cả hai sân.'
    }),

    /* ---- Màn 3: Nhìn hai bên hông bằng shape("left") ---- */
    manND({
      id: 6703, chuong: 'nhan-dang', so: 3, ma: 'nhan-dang.3',
      ten: 'Đá tròn hai bên hông', hang: 'luyen',
      hamCuaEmCan: ['move', 'forward', 'turn_left', 'turn_right', 'lob', 'fill_pit'],
      deBai: 'R1 đứng giữa hai viên đá ở hai bên hông: một bên là đá tròn (`"round"`) lấp được hố sâu dẫn tới cờ, bên kia là đá vuông (`"square"`). Hãy kiểm tra `if shape("left") == "round":` để quay trái (`turn_left()`), ngược lại (`else:`) quay phải (`turn_right()`), rồi gọi `fill_pit()` và `move()` tới cờ.',
      veMaMau: 'Điền turn_left() vào nhánh if, thêm nhánh else gọi turn_right(), rồi gọi fill_pit() và move().',
      goiY: [
        'Nếu shape("left") == "round" thì gọi turn_left(), ngược lại else: gọi turn_right().',
        'Sau khối if/else, gọi fill_pit() và move() ở lề ngoài cùng.'
      ],
      san: [
        [
          '#########',
          '#.......#',
          '#Fuo.ou.#',
          '#.......#',
          '#########'
        ],
        [
          '#########',
          '#.......#',
          '#.uo.ouF#',
          '#.......#',
          '#########'
        ]
      ],
      vatDang: [
        [
          '.........',
          '.........',
          '...r.s...',
          '.........',
          '.........'
        ],
        [
          '.........',
          '.........',
          '...s.r...',
          '.........',
          '.........'
        ]
      ],
      batDau: { x: 4, y: 2, huong: 0 },
      maMau: bai(['s = shape("left")', 'if s == "round":', '    turn_left()', 'fill_pit()', 'move()']),
      loiGiai: bai(['s = shape("left")', 'if s == "round":', '    turn_left()', 'else:', '    turn_right()', 'fill_pit()', 'move()']),
      sao: { o: 21, nhip: 6 },
      loiSai: [
        { moTa: 'Thiếu nhánh else quay phải khi đá tròn nằm bên phải ở sân 2', baiLam: bai(['s = shape("left")', 'if s == "round":', '    turn_left()', 'fill_pit()', 'move()']), phaiCoMa: ['nap-hut'] },
        { moTa: 'Quên gọi move() cuối cùng để bước vào ô cờ sau khi lấp hố', baiLam: bai(['s = shape("left")', 'if s == "round":', '    turn_left()', 'else:', '    turn_right()', 'fill_pit()']), phaiCoMa: ['chua-toi-co'] }
      ],
      loiBinh: 'Lệnh shape("left") và shape("right") soi ngay viên đá nằm sát hông trái hoặc hông phải của xe.'
    }),

    /* ---- Màn 4: Vòng lặp phân loại 3 cột quặng ---- */
    manND({
      id: 6704, chuong: 'nhan-dang', so: 4, ma: 'nhan-dang.4',
      ten: 'Mạch quặng ngang', hang: 'luyen',
      mucTieu: 'dua-vat',
      hamCuaEmCan: ['slide_r', 'lob', 'aim_lob'],
      deBai: 'Ba cột liên tiếp chứa lẫn lộn quặng quý (`"ore"`) và đá tròn (`"round"`). Trong vòng lặp `for i in range(3):`, hãy kiểm tra `if shape("front") == "ore":` để gọi `aim_lob(3)`, `else:` gọi `aim_lob(2)`, rồi gọi `slide_r(1)` sang cột kế tiếp.',
      veMaMau: 'Hoàn thiện khối if/else phân loại quặng và trượt phải 1 ô trong vòng lặp 3 bước.',
      goiY: [
        'Bên trong vòng lặp, nếu shape("front") == "ore" thì gọi aim_lob(3), else: gọi aim_lob(2).',
        'Cuối mỗi bước lặp (thụt lề 4 dấu cách), gọi slide_r(1).'
      ],
      san: [
        [
          '######',
          '#D.D.#',
          '#.D..#',
          '#ooo.#',
          '#....#',
          '######'
        ],
        [
          '######',
          '#.D..#',
          '#D.D.#',
          '#ooo.#',
          '#....#',
          '######'
        ]
      ],
      vatDang: [
        [
          '......',
          '......',
          '......',
          '.qrq..',
          '......',
          '......'
        ],
        [
          '......',
          '......',
          '......',
          '.rqr..',
          '......',
          '......'
        ]
      ],
      batDau: { x: 1, y: 4, huong: 0 },
      maMau: bai(['for i in range(3):', '    s = shape("front")', '    if s == "ore":', '        aim_lob(3)', '    slide_r(1)']),
      loiGiai: bai(['for i in range(3):', '    s = shape("front")', '    if s == "ore":', '        aim_lob(3)', '    else:', '        aim_lob(2)', '    slide_r(1)']),
      sao: { o: 15, nhip: 8 },
      loiSai: [
        { moTa: 'Thiếu nhánh else gọi aim_lob(2) cho các viên đá tròn', baiLam: bai(['for i in range(3):', '    s = shape("front")', '    if s == "ore":', '        aim_lob(3)', '    slide_r(1)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Chỉ lặp 2 bước nên bỏ sót viên đá ở cột thứ ba', baiLam: bai(['for i in range(2):', '    s = shape("front")', '    if s == "ore":', '        aim_lob(3)', '    else:', '        aim_lob(2)', '    slide_r(1)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      loiBinh: 'Vòng lặp kết hợp shape("front") giúp R1 phân loại cả dãy đá và quặng không sót viên nào.'
    }),

    /* ---- Màn 5: Tránh đá vuông qua 2 tầng hầm ---- */
    manND({
      id: 6705, chuong: 'nhan-dang', so: 5, ma: 'nhan-dang.5',
      ten: 'Tránh đá vuông lấp hố', hang: 'luyen',
      hamCuaEmCan: ['move', 'forward', 'slide_r', 'lob', 'fill_pit'],
      deBai: 'Đường lên cờ ở `(2, 1)` đi qua 2 tầng hố sâu. Ở mỗi tầng, nếu viên đá trước mặt là đá vuông (`if shape("front") == "square":`), hãy trượt sang phải 1 ô (`slide_r(1)`) để lấy viên đá tròn bên cạnh, sau đó gọi `fill_pit()` và `move()`.',
      veMaMau: 'Trong vòng lặp 2 bước, kiểm tra shape("front") == "square" để slide_r(1) trước khi gọi fill_pit() và move().',
      goiY: [
        'Trong vòng lặp for i in range(2):, viết if shape("front") == "square": rồi gọi slide_r(1).',
        'Sau khối if (vẫn trong vòng lặp), gọi fill_pit() và move().'
      ],
      san: [
        [
          '######',
          '#.F..#',
          '#uuu.#',
          '#ooo.#',
          '#....#',
          '#uu..#',
          '#oo..#',
          '#....#',
          '######'
        ],
        [
          '######',
          '#.F..#',
          '#uuu.#',
          '#ooo.#',
          '#....#',
          '#uu..#',
          '#oo..#',
          '#....#',
          '######'
        ]
      ],
      vatDang: [
        [
          '......',
          '......',
          '......',
          '.rrs..',
          '......',
          '......',
          '.sr...',
          '......',
          '......'
        ],
        [
          '......',
          '......',
          '......',
          '.srs..',
          '......',
          '......',
          '.rs...',
          '......',
          '......'
        ]
      ],
      batDau: { x: 1, y: 7, huong: 0 },
      maMau: bai(['for i in range(2):', '    s = shape("front")', '    if s == "square":', '        slide_r(1)', '    fill_pit()']),
      loiGiai: bai(['for i in range(2):', '    s = shape("front")', '    if s == "square":', '        slide_r(1)', '    fill_pit()', '    move()']),
      sao: { o: 19, nhip: 11 },
      loiSai: [
        { moTa: 'Quên gọi move() sau mỗi lần fill_pit() nên xe chưa áp sát tầng tiếp theo', baiLam: bai(['for i in range(2):', '    s = shape("front")', '    if s == "square":', '        slide_r(1)', '    fill_pit()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Không kiểm tra đá vuông nên ném đá vuông vào hố không lấp được hố', baiLam: bai(['for i in range(2):', '    fill_pit()', '    move()']), phaiCoMa: ['roi-ho'] }
      ],
      loiBinh: 'Kiểm tra đá vuông trước khi hất giúp R1 không bao giờ ném nhầm đá vuông xuống hố.'
    }),

    /* ---- Màn 6: Đá vuông đè công tắc M, đá tròn lấp hố u ---- */
    manND({
      id: 6706, chuong: 'nhan-dang', so: 6, ma: 'nhan-dang.6',
      ten: 'Đá vuông đè công tắc', hang: 'van-dung',
      hamCuaEmCan: ['move', 'forward', 'slide_r', 'lob', 'aim_lob'],
      deBai: 'Đá vuông không lấp được hố nhưng rất nặng để đè công tắc `M`! Nếu trước mặt là đá vuông (`if shape("front") == "square":`), hãy gọi `aim_lob(3)` ném xa 3 ô đè công tắc `M` mở cửa `C`; ngược lại (`else:`) là đá tròn thì gọi `aim_lob(2)` lấp hố `u` cách 2 ô. Sau đó tiến 2 ô (`forward(2)`) và trượt phải 1 ô (`slide_r(1)`) tới cờ.',
      veMaMau: 'Hoàn thiện nhánh else gọi aim_lob(2), rồi gọi forward(2) và slide_r(1) để vào ô cờ.',
      goiY: [
        'Nếu shape("front") == "square" thì gọi aim_lob(3), else: gọi aim_lob(2).',
        'Sau khối if/else, gọi forward(2) rồi slide_r(1).'
      ],
      san: [
        [
          '######',
          '#....#',
          '#.M..#',
          '#.CF.#',
          '#.o..#',
          '#....#',
          '######'
        ],
        [
          '######',
          '#....#',
          '#.=..#',
          '#.uF.#',
          '#.o..#',
          '#....#',
          '######'
        ]
      ],
      vatDang: [
        [
          '......',
          '......',
          '......',
          '......',
          '..s...',
          '......',
          '......'
        ],
        [
          '......',
          '......',
          '......',
          '......',
          '..r...',
          '......',
          '......'
        ]
      ],
      batDau: { x: 2, y: 5, huong: 0 },
      maMau: bai(['s = shape("front")', 'if s == "square":', '    aim_lob(3)', 'forward(2)', 'slide_r(1)']),
      loiGiai: bai(['s = shape("front")', 'if s == "square":', '    aim_lob(3)', 'else:', '    aim_lob(2)', 'forward(2)', 'slide_r(1)']),
      sao: { o: 20, nhip: 5 },
      loiSai: [
        { moTa: 'Thiếu nhánh else gọi aim_lob(2) để lấp hố ở sân 2', baiLam: bai(['s = shape("front")', 'if s == "square":', '    aim_lob(3)', 'forward(2)', 'slide_r(1)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Quên gọi slide_r(1) ở cuối nên xe dừng bên trái ô cờ', baiLam: bai(['s = shape("front")', 'if s == "square":', '    aim_lob(3)', 'else:', '    aim_lob(2)', 'forward(2)']), phaiCoMa: ['chua-toi-co'] }
      ],
      loiBinh: 'Mỗi loại đá đều có công dụng riêng: đá vuông đè công tắc ở xa, đá tròn lấp hố sâu.'
    }),

    /* ---- Màn 7: Đi chéo kết hợp shape("front") ---- */
    manND({
      id: 6707, chuong: 'nhan-dang', so: 7, ma: 'nhan-dang.7',
      ten: 'Bậc chéo phân quặng', hang: 'van-dung',
      mucTieu: 'dua-vat',
      hamCuaEmCan: ['lob', 'aim_lob'],
      deBai: 'Hai viên đá nằm dọc theo bậc thang chéo. Trong vòng lặp `for i in range(2):`, hãy bước chéo lên phải (`diag_right()`), rồi kiểm tra `if shape("front") == "ore":` để gọi `aim_lob(3)`, ngược lại (`else:`) gọi `aim_lob(2)`.',
      veMaMau: 'Trong vòng lặp 2 bước, sau diag_right() hãy dùng if/else với shape("front") == "ore" để chọn aim_lob(3) hay aim_lob(2).',
      goiY: [
        'Mỗi bước lặp, gọi diag_right() trước để tiến tới sát dưới viên đá.',
        'Sau đó viết if shape("front") == "ore": gọi aim_lob(3), else: gọi aim_lob(2).'
      ],
      san: [
        [
          '######',
          '#....#',
          '#.DD.#',
          '#..o.#',
          '#.o..#',
          '#....#',
          '#....#',
          '######'
        ],
        [
          '######',
          '#..D.#',
          '#....#',
          '#.Do.#',
          '#.o..#',
          '#....#',
          '#....#',
          '######'
        ]
      ],
      vatDang: [
        [
          '......',
          '......',
          '......',
          '...r..',
          '..q...',
          '......',
          '......',
          '......'
        ],
        [
          '......',
          '......',
          '......',
          '...q..',
          '..r...',
          '......',
          '......',
          '......'
        ]
      ],
      batDau: { x: 1, y: 6, huong: 0 },
      maMau: bai(['for i in range(2):', '    diag_right()', '    s = shape("front")', '    if s == "ore":', '        aim_lob(3)']),
      loiGiai: bai(['for i in range(2):', '    diag_right()', '    s = shape("front")', '    if s == "ore":', '        aim_lob(3)', '    else:', '        aim_lob(2)']),
      sao: { o: 12, nhip: 6 },
      loiSai: [
        { moTa: 'Thiếu nhánh else gọi aim_lob(2) cho viên đá tròn', baiLam: bai(['for i in range(2):', '    diag_right()', '    s = shape("front")', '    if s == "ore":', '        aim_lob(3)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Chỉ bước chéo 1 lần nên bỏ sót viên đá thứ hai', baiLam: bai(['diag_right()', 's = shape("front")', 'if s == "ore":', '    aim_lob(3)', 'else:', '    aim_lob(2)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      loiBinh: 'Bước chéo diag_right() đưa R1 áp sát từng viên đá trên vách chéo để shape("front") soi và phân loại.'
    }),

    /* ---- Màn 8: Duyệt danh sách bước trượt và lọc quặng ---- */
    manND({
      id: 6708, chuong: 'nhan-dang', so: 8, ma: 'nhan-dang.8',
      ten: 'Lịch trượt lọc quặng', hang: 'van-dung',
      mucTieu: 'dua-vat',
      hamCuaEmCan: ['slide_r', 'lob', 'aim_lob'],
      deBai: 'Danh sách `steps = [1, 2, 1]` ghi số ô cần trượt sang phải để tới từng cột đá. Hãy duyệt `for s in steps:`, gọi `slide_r(s)`, rồi kiểm tra `if shape("front") == "ore":` gọi `aim_lob(3)`, `else:` gọi `aim_lob(2)`.',
      veMaMau: 'Duyệt từng bước s trong steps, trượt phải s ô rồi phân loại quặng và đá tròn.',
      goiY: [
        'Trong vòng lặp for s in steps:, gọi slide_r(s) trước.',
        'Tiếp theo viết if shape("front") == "ore": gọi aim_lob(3), else: gọi aim_lob(2).'
      ],
      san: [
        [
          '#######',
          '#.D..D#',
          '#...D.#',
          '#.o.oo#',
          '#.....#',
          '#######'
        ],
        [
          '#######',
          '#...D.#',
          '#.D..D#',
          '#.o.oo#',
          '#.....#',
          '#######'
        ]
      ],
      vatDang: [
        [
          '.......',
          '.......',
          '.......',
          '..q.rq.',
          '.......',
          '.......'
        ],
        [
          '.......',
          '.......',
          '.......',
          '..r.qr.',
          '.......',
          '.......'
        ]
      ],
      batDau: { x: 1, y: 4, huong: 0 },
      maMau: bai(['steps = [1, 2, 1]', 'for s in steps:', '    slide_r(s)', '    t = shape("front")', '    if t == "ore":', '        aim_lob(3)']),
      loiGiai: bai(['steps = [1, 2, 1]', 'for s in steps:', '    slide_r(s)', '    t = shape("front")', '    if t == "ore":', '        aim_lob(3)', '    else:', '        aim_lob(2)']),
      sao: { o: 16, nhip: 10 },
      loiSai: [
        { moTa: 'Thiếu nhánh else gọi aim_lob(2) cho các viên đá tròn', baiLam: bai(['steps = [1, 2, 1]', 'for s in steps:', '    slide_r(s)', '    t = shape("front")', '    if t == "ore":', '        aim_lob(3)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Trượt cố định slide_r(1) thay vì slide_r(s) theo danh sách', baiLam: bai(['steps = [1, 2, 1]', 'for s in steps:', '    slide_r(1)', '    t = shape("front")', '    if t == "ore":', '        aim_lob(3)', '    else:', '        aim_lob(2)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      loiBinh: 'Danh sách điều khiển quãng đường trượt, còn cảm biến shape("front") quyết định lực hất tại mỗi điểm dừng.'
    }),

    /* ---- Màn 9: Phân biệt "ore", "round" và ô trống "none" ---- */
    manND({
      id: 6709, chuong: 'nhan-dang', so: 9, ma: 'nhan-dang.9',
      ten: 'Bỏ qua ô trống', hang: 'van-dung',
      mucTieu: 'dua-vat',
      hamCuaEmCan: ['slide_r', 'lob', 'aim_lob'],
      deBai: 'Khi trước mặt không có vật nào, `shape("front")` trả về `"none"`. Trên 3 cột liên tiếp có một cột trống, một cột quặng `"ore"` và một cột đá tròn `"round"`. Trong vòng lặp `for i in range(3):`, hãy dùng hai câu `if` riêng: nếu `"ore"` thì `aim_lob(3)`, nếu `"round"` thì `aim_lob(2)`, rồi `slide_r(1)`.',
      veMaMau: 'Thêm câu if thứ hai kiểm tra shape("front") == "round" để gọi aim_lob(2), rồi trượt phải 1 ô.',
      goiY: [
        'Không dùng else ở đây vì ô trống trả về "none" không được gọi aim_lob.',
        'Viết if shape("front") == "round": gọi aim_lob(2), rồi cuối vòng lặp gọi slide_r(1).'
      ],
      san: [
        [
          '######',
          '#D...#',
          '#..D.#',
          '#o.o.#',
          '#....#',
          '######'
        ],
        [
          '######',
          '#..D.#',
          '#.D..#',
          '#.oo.#',
          '#....#',
          '######'
        ]
      ],
      vatDang: [
        [
          '......',
          '......',
          '......',
          '.q.r..',
          '......',
          '......'
        ],
        [
          '......',
          '......',
          '......',
          '..rq..',
          '......',
          '......'
        ]
      ],
      batDau: { x: 1, y: 4, huong: 0 },
      maMau: bai(['for i in range(3):', '    s = shape("front")', '    if s == "ore":', '        aim_lob(3)', '    slide_r(1)']),
      loiGiai: bai(['for i in range(3):', '    s = shape("front")', '    if s == "ore":', '        aim_lob(3)', '    s = shape("front")', '    if s == "round":', '        aim_lob(2)', '    slide_r(1)']),
      sao: { o: 15, nhip: 6 },
      loiSai: [
        { moTa: 'Chưa thêm điều kiện kiểm tra đá tròn "round"', baiLam: bai(['for i in range(3):', '    s = shape("front")', '    if s == "ore":', '        aim_lob(3)', '    slide_r(1)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Dùng else thay vì if shape("front") == "round" nên xúc hụt ở ô trống', baiLam: bai(['for i in range(3):', '    s = shape("front")', '    if s == "ore":', '        aim_lob(3)', '    else:', '        aim_lob(2)', '    slide_r(1)']), phaiCoMa: ['nap-hut'] }
      ],
      loiBinh: 'Dùng hai điều kiện if cho "ore" và "round" giúp R1 tự động bỏ qua các ô trống ("none") hoặc đá vuông ("square").'
    }),

    /* ---- Màn 10: Trùm chương 1 (2 sân, huy hiệu nhan-dang) ---- */
    manND({
      id: 6710, chuong: 'nhan-dang', so: 10, ma: 'nhan-dang.10',
      ten: 'Trùm nhận dạng: Vượt ba tầng mỏ', hang: 'trum',
      huyHieu: 'nhan-dang',
      hamCuaEmCan: ['move', 'forward', 'lob', 'fill_pit', 'diag_r'],
      deBai: 'Trùm chương 1! Đường lên cờ ở `(5, 1)` gồm 3 tầng liên tiếp. Ở mỗi tầng, nếu trước mặt là đá tròn (`if shape("front") == "round":`), hãy gọi `fill_pit()` để lấp hố và tiến lên 2 ô; ngược lại (`else:`, gặp đá vuông không lấp được hố) hãy gọi `diag_r(2)` để lách chéo phải 2 bước qua hố. Cuối mỗi tầng, gọi `move()` để sang tầng tiếp theo.',
      veMaMau: 'Lặp 3 tầng: nếu shape("front") == "round" thì fill_pit(), else thì diag_r(2), rồi move().',
      goiY: [
        'Dùng vòng lặp for i in range(3): cho 3 tầng mỏ.',
        'Trong mỗi tầng: if shape("front") == "round": gọi fill_pit(), else: gọi diag_r(2), rồi gọi move() ở cuối vòng lặp.'
      ],
      san: [
        [
          '#######',
          '#....F#',
          '#..u..#',
          '#..o..#',
          '#.....#',
          '#u....#',
          '#o....#',
          '#.....#',
          '#u.u..#',
          '#o....#',
          '#.....#',
          '#######'
        ],
        [
          '#######',
          '#....F#',
          '#..u..#',
          '#..o..#',
          '#.....#',
          '#..u.u#',
          '#..o..#',
          '#.....#',
          '#u....#',
          '#o....#',
          '#.....#',
          '#######'
        ]
      ],
      vatDang: [
        [
          '.......',
          '.......',
          '.......',
          '...s...',
          '.......',
          '.......',
          '.s.....',
          '.......',
          '.......',
          '.r.....',
          '.......',
          '.......'
        ],
        [
          '.......',
          '.......',
          '.......',
          '...s...',
          '.......',
          '.......',
          '...r...',
          '.......',
          '.......',
          '.s.....',
          '.......',
          '.......'
        ]
      ],
      batDau: { x: 1, y: 10, huong: 0 },
      maMau: bai(['for i in range(3):', '    s = shape("front")', '    if s == "round":', '        fill_pit()']),
      loiGiai: bai(['for i in range(3):', '    s = shape("front")', '    if s == "round":', '        fill_pit()', '    else:', '        diag_r(2)', '    move()']),
      sao: { o: 19, nhip: 11 },
      loiSai: [
        { moTa: 'Chưa viết nhánh else gọi diag_r(2) và lệnh move() cuối mỗi tầng', baiLam: bai(['for i in range(3):', '    s = shape("front")', '    if s == "round":', '        fill_pit()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Chỉ lặp 2 tầng nên chưa lên tới cờ ở tầng thứ 3', baiLam: bai(['for i in range(2):', '    s = shape("front")', '    if s == "round":', '        fill_pit()', '    else:', '        diag_r(2)', '    move()']), phaiCoMa: ['chua-toi-co'] }
      ],
      loiBinh: 'Xuất sắc! R1 đã làm chủ thấu kính shape(huong), kết hợp lấp hố và đi chéo vượt qua cả ba tầng mỏ sâu!'
    }),

    /* ========================================================================
       CHƯƠNG 2: che-nhan-dang — "Chế lệnh: lọc quặng" (10 màn)
       ======================================================================== */

    /* ---- Màn 11 (che-nhan-dang.1): Chế hàm sort_lob() ---- */
    manND({
      id: 6711, chuong: 'che-nhan-dang', so: 1, ma: 'che-nhan-dang.1',
      ten: 'Chế hàm lọc quặng sort_lob', hang: 'lam-quen',
      mucTieu: 'dua-vat',
      taoHam: ['sort_lob'],
      hamCuaEmCan: ['slide_r', 'lob', 'aim_lob'],
      deBai: 'Hãy chế hàm `sort_lob()` không tham số để tự động phân loại viên đá trước mặt: nếu `shape("front") == "ore"` thì gọi `aim_lob(3)`, ngược lại (`else:`) gọi `aim_lob(2)`. Sau đó dùng `sort_lob()`, `slide_r(2)`, `sort_lob()` để lọc hai cột đá trên cả hai sân.',
      veMaMau: 'Hoàn thiện thân hàm sort_lob() bằng if/else với shape("front") == "ore".',
      goiY: [
        'Trong thân hàm sort_lob(): nếu shape("front") == "ore" gọi aim_lob(3), else: gọi aim_lob(2).',
        'Chương trình chính gọi sort_lob(), slide_r(2), sort_lob().'
      ],
      san: [
        [
          '######',
          '#D...#',
          '#..D.#',
          '#o.o.#',
          '#....#',
          '######'
        ],
        [
          '######',
          '#..D.#',
          '#D...#',
          '#o.o.#',
          '#....#',
          '######'
        ]
      ],
      vatDang: [
        [
          '......',
          '......',
          '......',
          '.q.r..',
          '......',
          '......'
        ],
        [
          '......',
          '......',
          '......',
          '.r.q..',
          '......',
          '......'
        ]
      ],
      batDau: { x: 1, y: 4, huong: 0 },
      maMau: bai(['sort_lob()', 'slide_r(2)', 'sort_lob()'], {
        hamCuaEmMoi: [H('sort_lob', [], ['s = shape("front")', 'if s == "ore":', '    aim_lob(3)'])]
      }),
      loiGiai: bai(['sort_lob()', 'slide_r(2)', 'sort_lob()'], {
        hamCuaEmMoi: [H('sort_lob', [], T_SORT_LOB)]
      }),
      sao: { o: 16, nhip: 6 },
      loiSai: [
        { moTa: 'Trong sort_lob() thiếu nhánh else gọi aim_lob(2)', baiLam: bai(['sort_lob()', 'slide_r(2)', 'sort_lob()']), hamCuaEmMoi: [H('sort_lob', [], ['s = shape("front")', 'if s == "ore":', '    aim_lob(3)'])], phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên gọi sort_lob() lần thứ hai sau khi trượt phải 2 ô', baiLam: bai(['sort_lob()', 'slide_r(2)']), hamCuaEmMoi: [H('sort_lob', [], T_SORT_LOB)], phaiCoMa: ['chua-dua-vat'] }
      ],
      loiBinh: 'Hàm sort_lob() đã vào kho! Từ giờ chỉ cần 1 dòng lệnh để tự động phân loại quặng và đá tròn.'
    }),

    /* ---- Màn 12 (che-nhan-dang.2): Chế hàm round_fill() ---- */
    manND({
      id: 6712, chuong: 'che-nhan-dang', so: 2, ma: 'che-nhan-dang.2',
      ten: 'Chế hàm vượt tầng round_fill', hang: 'lam-quen',
      taoHam: ['round_fill'],
      hamCuaEmCan: ['move', 'forward', 'lob', 'fill_pit', 'diag_r'],
      deBai: 'Hãy chế hàm `round_fill()` để xử lý một tầng hố sâu: nếu viên đá trước mặt là đá tròn (`if shape("front") == "round":`) thì gọi `fill_pit()`, ngược lại (`else:`, gặp đá vuông) thì gọi `diag_r(2)` lách chéo sang phải 2 bước. Chương trình chính gọi `round_fill()` và `move()` hai lần để tới cờ.',
      veMaMau: 'Viết thân hàm round_fill() kiểm tra shape("front") == "round" chọn fill_pit() hoặc diag_r(2).',
      goiY: [
        'Trong round_fill(): if shape("front") == "round": gọi fill_pit(), else: gọi diag_r(2).',
        'Chương trình chính đã có sẵn round_fill() và move() hai lần.'
      ],
      san: [
        [
          '######',
          '#..F.#',
          '#u...#',
          '#o...#',
          '#....#',
          '#u.u.#',
          '#o...#',
          '#....#',
          '######'
        ],
        [
          '######',
          '#..F.#',
          '#u.u.#',
          '#o.o.#',
          '#....#',
          '#u...#',
          '#o...#',
          '#....#',
          '######'
        ]
      ],
      vatDang: [
        [
          '......',
          '......',
          '......',
          '.s....',
          '......',
          '......',
          '.r....',
          '......',
          '......'
        ],
        [
          '......',
          '......',
          '......',
          '.s.r..',
          '......',
          '......',
          '.s....',
          '......',
          '......'
        ]
      ],
      batDau: { x: 1, y: 7, huong: 0 },
      maMau: bai(['round_fill()', 'move()', 'round_fill()', 'move()'], {
        hamCuaEmMoi: [H('round_fill', [], ['s = shape("front")', 'if s == "round":', '    fill_pit()'])]
      }),
      loiGiai: bai(['round_fill()', 'move()', 'round_fill()', 'move()'], {
        hamCuaEmMoi: [H('round_fill', [], T_ROUND_FILL)]
      }),
      sao: { o: 21, nhip: 8 },
      loiSai: [
        { moTa: 'Trong round_fill() thiếu nhánh else gọi diag_r(2) khi gặp đá vuông', baiLam: bai(['round_fill()', 'move()', 'round_fill()', 'move()']), hamCuaEmMoi: [H('round_fill', [], ['s = shape("front")', 'if s == "round":', '    fill_pit()'])], phaiCoMa: ['dam-tuong'] },
        { moTa: 'Quên gọi move() cuối cùng để bước vào ô cờ', baiLam: bai(['round_fill()', 'move()', 'round_fill()']), hamCuaEmMoi: [H('round_fill', [], T_ROUND_FILL)], phaiCoMa: ['chua-toi-co'] }
      ],
      loiBinh: 'Hàm round_fill() đóng gói gọn gàng quyết định lấp hố hay lách chéo tại mỗi tầng mỏ.'
    }),

    /* ---- Màn 13 (che-nhan-dang.3): Luyện sort_lob() qua vòng lặp ---- */
    manND({
      id: 6713, chuong: 'che-nhan-dang', so: 3, ma: 'che-nhan-dang.3',
      ten: 'Dây chuyền lọc ba cột', hang: 'luyen',
      mucTieu: 'dua-vat',
      hamCuaEmCan: ['slide_r', 'lob', 'aim_lob', 'sort_lob'],
      deBai: 'Sử dụng hàm `sort_lob()` vừa chế trong vòng lặp `for i in range(3):` kết hợp `slide_r(1)` để phân loại cả 3 cột quặng quý và đá tròn trên hai sân.',
      veMaMau: 'Trong vòng lặp 3 bước, gọi sort_lob() rồi slide_r(1).',
      goiY: [
        'Mỗi bước lặp, gọi sort_lob() để phân loại viên đá trước mặt.',
        'Sau đó gọi slide_r(1) để trượt sang cột kế tiếp.'
      ],
      san: [
        [
          '######',
          '#D.D.#',
          '#.D..#',
          '#ooo.#',
          '#....#',
          '######'
        ],
        [
          '######',
          '#.D..#',
          '#D.D.#',
          '#ooo.#',
          '#....#',
          '######'
        ]
      ],
      vatDang: [
        [
          '......',
          '......',
          '......',
          '.qrq..',
          '......',
          '......'
        ],
        [
          '......',
          '......',
          '......',
          '.rqr..',
          '......',
          '......'
        ]
      ],
      batDau: { x: 1, y: 4, huong: 0 },
      maMau: bai(['for i in range(3):', '    sort_lob()']),
      loiGiai: bai(['for i in range(3):', '    sort_lob()', '    slide_r(1)']),
      sao: { o: 16, nhip: 8 },
      loiSai: [
        { moTa: 'Quên gọi slide_r(1) trong vòng lặp nên xe đứng yên tại cột đầu', baiLam: bai(['for i in range(3):', '    sort_lob()']), phaiCoMa: ['nap-hut'] },
        { moTa: 'Chỉ lặp 2 lần nên bỏ sót cột đá thứ ba', baiLam: bai(['for i in range(2):', '    sort_lob()', '    slide_r(1)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      loiBinh: 'Nhờ có sort_lob(), vòng lặp lọc quặng ở màn 4 giờ chỉ còn đúng 3 dòng lệnh!'
    }),

    /* ---- Màn 14 (che-nhan-dang.4): Chế hàm pick_round() ---- */
    manND({
      id: 6714, chuong: 'che-nhan-dang', so: 4, ma: 'che-nhan-dang.4',
      ten: 'Chế hàm chọn đá tròn pick_round', hang: 'luyen',
      taoHam: ['pick_round'],
      hamCuaEmCan: ['move', 'forward', 'turn_left', 'turn_right', 'lob', 'fill_pit'],
      deBai: 'Hãy chế hàm `pick_round()` để kiểm tra hai bên hông: nếu `shape("left") == "round"` thì quay trái (`turn_left()`), ngược lại (`else:`) quay phải (`turn_right()`), rồi gọi `fill_pit()` để lấp hố phía đá tròn và tiến lên. Chương trình chính gọi `pick_round()` và `move()` để tới cờ.',
      veMaMau: 'Hoàn thiện thân hàm pick_round() với if/else kiểm tra shape("left") == "round" rồi gọi fill_pit().',
      goiY: [
        'Trong pick_round(): nếu shape("left") == "round" gọi turn_left(), else: gọi turn_right().',
        'Sau khối if/else trong pick_round(), gọi fill_pit().'
      ],
      san: [
        [
          '#########',
          '#.......#',
          '#Fuo.ou.#',
          '#.......#',
          '#########'
        ],
        [
          '#########',
          '#.......#',
          '#.uo.ouF#',
          '#.......#',
          '#########'
        ]
      ],
      vatDang: [
        [
          '.........',
          '.........',
          '...r.s...',
          '.........',
          '.........'
        ],
        [
          '.........',
          '.........',
          '...s.r...',
          '.........',
          '.........'
        ]
      ],
      batDau: { x: 4, y: 2, huong: 0 },
      maMau: bai(['pick_round()', 'move()'], {
        hamCuaEmMoi: [H('pick_round', [], ['s = shape("left")', 'if s == "round":', '    turn_left()', 'fill_pit()'])]
      }),
      loiGiai: bai(['pick_round()', 'move()'], {
        hamCuaEmMoi: [H('pick_round', [], T_PICK_ROUND)]
      }),
      sao: { o: 22, nhip: 6 },
      loiSai: [
        { moTa: 'Trong pick_round() thiếu nhánh else gọi turn_right()', baiLam: bai(['pick_round()', 'move()']), hamCuaEmMoi: [H('pick_round', [], ['s = shape("left")', 'if s == "round":', '    turn_left()', 'fill_pit()'])], phaiCoMa: ['nap-hut'] },
        { moTa: 'Quên gọi move() sau pick_round() để bước vào ô cờ', baiLam: bai(['pick_round()']), hamCuaEmMoi: [H('pick_round', [], T_PICK_ROUND)], phaiCoMa: ['chua-toi-co'] }
      ],
      loiBinh: 'Hàm pick_round() giúp R1 tự xoay về phía viên đá tròn và lấp hố mở đường ngay lập tức.'
    }),

    /* ---- Màn 15 (che-nhan-dang.5): Chế hàm diag_sort() ---- */
    manND({
      id: 6715, chuong: 'che-nhan-dang', so: 5, ma: 'che-nhan-dang.5',
      ten: 'Chế hàm bước chéo lọc quặng diag_sort', hang: 'luyen',
      mucTieu: 'dua-vat',
      taoHam: ['diag_sort'],
      hamCuaEmCan: ['lob', 'aim_lob', 'sort_lob'],
      deBai: 'Hãy chế hàm `diag_sort()` gồm 2 bước: tiến chéo lên phải 1 ô (`diag_right()`) rồi gọi `sort_lob()` để phân loại viên đá trước mặt. Chương trình chính lặp 3 lần `diag_sort()` để lọc sạch mạch quặng chéo trên hai sân.',
      veMaMau: 'Trong thân hàm diag_sort(), gọi diag_right() rồi sort_lob().',
      goiY: [
        'Thân hàm diag_sort() chỉ gồm 2 dòng: diag_right() và sort_lob().',
        'Chương trình chính lặp for i in range(3): gọi diag_sort().'
      ],
      san: [
        [
          '#######',
          '#...D.#',
          '#..D..#',
          '#.D.o.#',
          '#..o..#',
          '#.o...#',
          '#.....#',
          '#.....#',
          '#######'
        ],
        [
          '#######',
          '#.....#',
          '#..DD.#',
          '#...o.#',
          '#.Do..#',
          '#.o...#',
          '#.....#',
          '#.....#',
          '#######'
        ]
      ],
      vatDang: [
        [
          '.......',
          '.......',
          '.......',
          '....q..',
          '...q...',
          '..q....',
          '.......',
          '.......',
          '.......'
        ],
        [
          '.......',
          '.......',
          '.......',
          '....r..',
          '...q...',
          '..r....',
          '.......',
          '.......',
          '.......'
        ]
      ],
      batDau: { x: 1, y: 7, huong: 0 },
      maMau: bai(['for i in range(3):', '    diag_sort()'], {
        hamCuaEmMoi: [H('diag_sort', [], ['diag_right()'])]
      }),
      loiGiai: bai(['for i in range(3):', '    diag_sort()'], {
        hamCuaEmMoi: [H('diag_sort', [], T_DIAG_SORT)]
      }),
      sao: { o: 14, nhip: 9 },
      loiSai: [
        { moTa: 'Trong diag_sort() quên gọi sort_lob() sau khi bước chéo', baiLam: bai(['for i in range(3):', '    diag_sort()']), hamCuaEmMoi: [H('diag_sort', [], ['diag_right()'])], phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Chỉ lặp 2 lần nên bỏ sót viên đá thứ ba trên vách chéo', baiLam: bai(['for i in range(2):', '    diag_sort()']), hamCuaEmMoi: [H('diag_sort', [], T_DIAG_SORT)], phaiCoMa: ['chua-dua-vat'] }
      ],
      loiBinh: 'Kết hợp diag_right() và sort_lob() thành diag_sort() giúp R1 vừa leo bậc chéo vừa lọc quặng tự động.'
    }),

    /* ---- Màn 16 (che-nhan-dang.6): Chế hàm safe_sort() ---- */
    manND({
      id: 6716, chuong: 'che-nhan-dang', so: 6, ma: 'che-nhan-dang.6',
      ten: 'Chế hàm lọc an toàn safe_sort', hang: 'van-dung',
      mucTieu: 'dua-vat',
      taoHam: ['safe_sort'],
      hamCuaEmCan: ['slide_r', 'lob', 'aim_lob'],
      deBai: 'Khi dãy mỏ có ô trống (`"none"`), gọi `sort_lob()` sẽ xúc hụt ở ô trống. Hãy chế hàm `safe_sort()` dùng 2 câu `if`: nếu `shape("front") == "ore"` thì gọi `aim_lob(3)`, nếu `shape("front") == "round"` thì gọi `aim_lob(2)`. Sau đó lặp 4 cột với `safe_sort()` và `slide_r(1)`.',
      veMaMau: 'Hoàn thiện thân hàm safe_sort() bằng 2 câu if cho "ore" và "round", rồi lặp 4 bước.',
      goiY: [
        'Trong safe_sort(): viết if shape("front") == "ore": gọi aim_lob(3), tiếp theo if shape("front") == "round": gọi aim_lob(2).',
        'Trong vòng lặp for i in range(4): của chương trình chính, gọi safe_sort() rồi slide_r(1).'
      ],
      san: [
        [
          '#######',
          '#D..D.#',
          '#..D..#',
          '#o.oo.#',
          '#.....#',
          '#######'
        ],
        [
          '#######',
          '#.D...#',
          '#D..D.#',
          '#oo.o.#',
          '#.....#',
          '#######'
        ]
      ],
      vatDang: [
        [
          '.......',
          '.......',
          '.......',
          '.q.rq..',
          '.......',
          '.......'
        ],
        [
          '.......',
          '.......',
          '.......',
          '.rq.r..',
          '.......',
          '.......'
        ]
      ],
      batDau: { x: 1, y: 4, huong: 0 },
      maMau: bai(['for i in range(4):', '    safe_sort()', '    slide_r(1)'], {
        hamCuaEmMoi: [H('safe_sort', [], ['s = shape("front")', 'if s == "ore":', '    aim_lob(3)'])]
      }),
      loiGiai: bai(['for i in range(4):', '    safe_sort()', '    slide_r(1)'], {
        hamCuaEmMoi: [H('safe_sort', [], T_SAFE_SORT)]
      }),
      sao: { o: 16, nhip: 9 },
      loiSai: [
        { moTa: 'Trong safe_sort() thiếu câu if thứ hai cho đá tròn "round"', baiLam: bai(['for i in range(4):', '    safe_sort()', '    slide_r(1)']), hamCuaEmMoi: [H('safe_sort', [], ['s = shape("front")', 'if s == "ore":', '    aim_lob(3)'])], phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Dùng else thay vì if shape("front") == "round" nên xúc hụt ở cột trống', baiLam: bai(['for i in range(4):', '    safe_sort()', '    slide_r(1)']), hamCuaEmMoi: [H('safe_sort', [], T_SORT_LOB)], phaiCoMa: ['nap-hut'] }
      ],
      loiBinh: 'Hàm safe_sort() chỉ hất khi gặp đúng quặng "ore" hoặc đá tròn "round", an toàn tuyệt đối trước các ô trống.'
    }),

    /* ---- Màn 17 (che-nhan-dang.7): Phối hợp sort_lob() và diag_sort() ---- */
    manND({
      id: 6717, chuong: 'che-nhan-dang', so: 7, ma: 'che-nhan-dang.7',
      ten: 'Mở lối chéo liên hoàn', hang: 'van-dung',
      mucTieu: 'dua-vat',
      hamCuaEmCan: ['lob', 'aim_lob', 'sort_lob', 'diag_sort'],
      deBai: 'Viên đá đầu tiên ở `(1, 6)` đang chắn ngay lối bước chéo từ `(1, 7)` lên `(2, 6)`. Hãy gọi `sort_lob()` tại chỗ xuất phát để hất viên đá đầu tiên vào máng và dọn trống ô `(1, 6)`, sau đó lặp `for i in range(2):` gọi `diag_sort()` để lọc tiếp 2 viên đá trên bậc chéo.',
      veMaMau: 'Gọi sort_lob() trước vòng lặp, rồi lặp 2 lần diag_sort().',
      goiY: [
        'Dòng đầu tiên gọi sort_lob() để hất viên đá ở (1, 6).',
        'Tiếp theo viết for i in range(2): và gọi diag_sort() bên trong.'
      ],
      san: [
        [
          '######',
          '#....#',
          '#..D.#',
          '#....#',
          '#DDo.#',
          '#.o..#',
          '#o...#',
          '#....#',
          '######'
        ],
        [
          '######',
          '#....#',
          '#....#',
          '#.DD.#',
          '#..o.#',
          '#Do..#',
          '#o...#',
          '#....#',
          '######'
        ]
      ],
      vatDang: [
        [
          '......',
          '......',
          '......',
          '......',
          '...q..',
          '..r...',
          '.q....',
          '......',
          '......'
        ],
        [
          '......',
          '......',
          '......',
          '......',
          '...r..',
          '..q...',
          '.r....',
          '......',
          '......'
        ]
      ],
      batDau: { x: 1, y: 7, huong: 0 },
      maMau: bai(['sort_lob()', 'for i in range(2):', '    wait()']),
      loiGiai: bai(['sort_lob()', 'for i in range(2):', '    diag_sort()']),
      sao: { o: 15, nhip: 8 },
      loiSai: [
        { moTa: 'Chưa thay wait() trong vòng lặp bằng diag_sort()', baiLam: bai(['sort_lob()', 'for i in range(2):', '    wait()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Chỉ gọi diag_sort() 1 lần nên còn sót viên đá cuối bậc chéo', baiLam: bai(['sort_lob()', 'diag_sort()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      loiBinh: 'Hất viên đá đầu tiên bằng sort_lob() vừa ghi điểm vừa mở thông hành lang chéo cho diag_sort()!'
    }),

    /* ---- Màn 18 (che-nhan-dang.8): Sửa hàm hỏng sort_lob() (suaHam) ---- */
    manND({
      id: 6718, chuong: 'che-nhan-dang', so: 8, ma: 'che-nhan-dang.8',
      ten: 'Sửa hàm sort_lob bị ngược tầm', hang: 'van-dung',
      mucTieu: 'dua-vat',
      suaHam: ['sort_lob'],
      hamCuaEmCan: ['slide_r', 'lob', 'aim_lob'],
      deBai: 'Hàm `sort_lob()` đang bị viết ngược tầm: gặp quặng `"ore"` lại gọi `aim_lob(2)`, còn đá tròn lại gọi `aim_lob(3)` khiến cả hai viên đá đều rơi trượt ngoài máng `D`! Hãy sửa lại thân hàm `sort_lob()` cho đúng: `"ore"` gọi `aim_lob(3)`, `else:` gọi `aim_lob(2)`.',
      veMaMau: 'Sửa lại số tầm trong aim_lob(3) và aim_lob(2) của hàm sort_lob().',
      goiY: [
        'Trong nhánh if shape("front") == "ore":, đổi aim_lob(2) thành aim_lob(3).',
        'Trong nhánh else:, đổi aim_lob(3) thành aim_lob(2).'
      ],
      san: [
        '######',
        '#D...#',
        '#..D.#',
        '#o.o.#',
        '#....#',
        '######'
      ],
      vatDang: [
        '......',
        '......',
        '......',
        '.q.r..',
        '......',
        '......'
      ],
      batDau: { x: 1, y: 4, huong: 0 },
      maMau: bai(['sort_lob()', 'slide_r(2)', 'sort_lob()'], {
        hamCuaEmMoi: [H('sort_lob', [], ['s = shape("front")', 'if s == "ore":', '    aim_lob(2)', 'else:', '    aim_lob(3)'])]
      }),
      loiGiai: bai(['sort_lob()', 'slide_r(2)', 'sort_lob()'], {
        hamCuaEmMoi: [H('sort_lob', [], T_SORT_LOB)]
      }),
      sao: { o: 16, nhip: 6 },
      loiSai: [
        { moTa: 'Chưa sửa lại tầm ném bị ngược trong sort_lob()', baiLam: bai(['sort_lob()', 'slide_r(2)', 'sort_lob()']), hamCuaEmMoi: [H('sort_lob', [], ['s = shape("front")', 'if s == "ore":', '    aim_lob(2)', 'else:', '    aim_lob(3)'])], phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Sửa cả hai nhánh thành aim_lob(2) nên viên quặng quý rơi chưa tới máng', baiLam: bai(['sort_lob()', 'slide_r(2)', 'sort_lob()']), hamCuaEmMoi: [H('sort_lob', [], ['s = shape("front")', 'if s == "ore":', '    aim_lob(2)', 'else:', '    aim_lob(2)'])], phaiCoMa: ['chua-dua-vat'] }
      ],
      loiBinh: 'Đã sửa xong sort_lob()! Quặng quý bay xa 3 ô, đá tròn bay 2 ô chuẩn xác.'
    }),

    /* ---- Màn 19 (che-nhan-dang.9): Kết hợp diag_sort(), slide_r(1) và safe_sort() ---- */
    manND({
      id: 6719, chuong: 'che-nhan-dang', so: 9, ma: 'che-nhan-dang.9',
      ten: 'Quét bậc thang đôi', hang: 'van-dung',
      mucTieu: 'dua-vat',
      hamCuaEmCan: ['slide_r', 'lob', 'aim_lob', 'sort_lob', 'diag_sort', 'safe_sort'],
      deBai: 'Mỏ đá gồm 2 bậc đôi: ở mỗi bậc (`for i in range(2):`), hãy gọi `diag_sort()` để bước chéo lên và lọc viên đá đầu bậc, sau đó trượt phải 1 ô (`slide_r(1)`) và gọi `safe_sort()` để lọc tiếp ô bên cạnh (có thể có đá hoặc trống) đồng thời dọn đường cho bước chéo tiếp theo.',
      veMaMau: 'Trong vòng lặp 2 bước, gọi diag_sort(), slide_r(1) rồi safe_sort().',
      goiY: [
        'Mỗi bước lặp gồm 3 dòng: diag_sort(), slide_r(1), safe_sort().',
        'safe_sort() sẽ tự hất đá nếu có và bỏ qua nếu ô trước mặt trống.'
      ],
      san: [
        [
          '#######',
          '#...DD#',
          '#.D...#',
          '#...oo#',
          '#.o...#',
          '#.....#',
          '#.....#',
          '#######'
        ],
        [
          '#######',
          '#...D.#',
          '#.....#',
          '#.DDo.#',
          '#.oo..#',
          '#.....#',
          '#.....#',
          '#######'
        ]
      ],
      vatDang: [
        [
          '.......',
          '.......',
          '.......',
          '....qq.',
          '..q....',
          '.......',
          '.......',
          '.......'
        ],
        [
          '.......',
          '.......',
          '.......',
          '....q..',
          '..rr...',
          '.......',
          '.......',
          '.......'
        ]
      ],
      batDau: { x: 1, y: 6, huong: 0 },
      maMau: bai(['for i in range(2):', '    diag_sort()', '    slide_r(1)']),
      loiGiai: bai(['for i in range(2):', '    diag_sort()', '    slide_r(1)', '    safe_sort()']),
      sao: { o: 23, nhip: 10 },
      loiSai: [
        { moTa: 'Quên gọi safe_sort() sau khi trượt phải nên còn sót đá chắn đường', baiLam: bai(['for i in range(2):', '    diag_sort()', '    slide_r(1)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Dùng sort_lob() thay cho safe_sort() nên xúc hụt ở ô trống', baiLam: bai(['for i in range(2):', '    diag_sort()', '    slide_r(1)', '    sort_lob()']), phaiCoMa: ['nap-hut'] }
      ],
      loiBinh: 'Sự kết hợp giữa diag_sort(), slide_r(1) và safe_sort() giúp R1 quét sạch mọi bậc mỏ đôi!'
    }),

    /* ---- Màn 20 (che-nhan-dang.10): Trùm chương 2 (2 sân, huy hiệu che-nhan-dang) ---- */
    manND({
      id: 6720, chuong: 'che-nhan-dang', so: 10, ma: 'che-nhan-dang.10',
      ten: 'Trùm chế lệnh: Đỉnh mỏ thông minh', hang: 'trum',
      huyHieu: 'che-nhan-dang',
      hamCuaEmCan: ['move', 'forward', 'turn_left', 'turn_right', 'lob', 'fill_pit', 'diag_r', 'round_fill', 'pick_round'],
      deBai: 'Trùm cuối Gói 7! Từ đáy mỏ `(2, 11)`, hãy lặp 3 tầng (`for i in range(3):`) với `round_fill()` và `move()` để vượt qua 3 tầng đá tròn và đá vuông lên tới ngã ba `(4, 2)`. Tại ngã ba đỉnh mỏ, hãy gọi `pick_round()` và `move()` để chọn đúng viên đá tròn bên hông lấp hố cuối cùng và tiến vào cờ!',
      veMaMau: 'Lặp 3 lần round_fill() và move(), sau đó gọi pick_round() và move() ở cuối chương trình.',
      goiY: [
        'Viết vòng lặp for i in range(3): gồm round_fill() và move() để lên tới ô (4, 2).',
        'Sau vòng lặp (ở lề ngoài cùng), gọi pick_round() rồi move().'
      ],
      san: [
        [
          '#########',
          '#.......#',
          '#Fuo.ou.#',
          '#...u.u.#',
          '#...o...#',
          '#.......#',
          '#.u.....#',
          '#.o.....#',
          '#.......#',
          '#.u.u...#',
          '#.o.....#',
          '#.......#',
          '#########'
        ],
        [
          '#########',
          '#.......#',
          '#.uo.ouF#',
          '#...u.u.#',
          '#...o...#',
          '#.......#',
          '#...u.u.#',
          '#...o...#',
          '#.......#',
          '#.u.....#',
          '#.o.....#',
          '#.......#',
          '#########'
        ]
      ],
      vatDang: [
        [
          '.........',
          '.........',
          '...r.s...',
          '.........',
          '....r....',
          '.........',
          '.........',
          '..s......',
          '.........',
          '.........',
          '..r......',
          '.........',
          '.........'
        ],
        [
          '.........',
          '.........',
          '...s.r...',
          '.........',
          '....r....',
          '.........',
          '.........',
          '....r....',
          '.........',
          '.........',
          '..s......',
          '.........',
          '.........'
        ]
      ],
      batDau: { x: 2, y: 11, huong: 0 },
      maMau: bai(['for i in range(3):', '    round_fill()', '    move()']),
      loiGiai: bai(['for i in range(3):', '    round_fill()', '    move()', 'pick_round()', 'move()']),
      sao: { o: 31, nhip: 19 },
      loiSai: [
        { moTa: 'Chưa gọi pick_round() và move() tại ngã ba đỉnh mỏ', baiLam: bai(['for i in range(3):', '    round_fill()', '    move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Gọi pick_round() nhưng quên gọi move() cuối cùng để bước vào ô cờ', baiLam: bai(['for i in range(3):', '    round_fill()', '    move()', 'pick_round()']), phaiCoMa: ['chua-toi-co'] }
      ],
      loiBinh: 'Chúc mừng! Em đã hoàn thành toàn bộ Gói 7 Nhận dạng mỏ, biến R1 thành cỗ máy tuyển quặng thông minh bậc nhất!'
    })
  ];

  ManHoc.manNhanDang = DS;
})();
