/* ============================================================================
   man-mo-cu.js — Mùa 6 "Mỏ đá" · Gói 8 "Mỏ đá cũ" (20 màn)
   - Chương 1: mo-cu (10 màn: mo-cu.1 .. mo-cu.10) — "Vượt mỏ đá cũ"
     Màn 1 trình diễn (chiChay: true), màn 2–9 kết hợp Máy khai mỏ R1 đủ bộ
     (omni + tay hất đá + radar nhận dạng + đi chéo + chỉnh lực + đá lấp hố)
     với các yếu tố mùa trước: nút đè M + cửa C, băng chuyền > < ^ v, thùng
     nặng H, hàng rào =, hố sâu u, sàn dốc, bàn xoay @ / %. Màn 10 trùm 2 sân.
   - Chương 2: che-mo-cu (10 màn: che-mo-cu.1 .. che-mo-cu.10) — "Chế lệnh: mở cổng mỏ"
     Chế 5 hàm mới: lob_pad(n), belt_lob(n), spin_pad(n), diag_pad(n), smart_pad()
     + 1 màn sửa hàm hỏng (che-mo-cu.8), màn 10 trùm 2 sân.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var KHAY_MO_CU = ['left_move', 'right_move', 'left_back', 'right_back', 'slide_left', 'slide_right', 'wait', 'load', 'throw', 'radar', 'diag_left', 'diag_right', 'aim', 'shape'];
  var ROBOT_MO_CU = { than: 'omni', tay: 'nem', camBien: [{ ma: 'radar', o: 'tren', nhanDang: true }] };
  var CAU_TRUC = ['for', 'if', 'while', 'list'];

  function bai(chinh, Phu) {
    return {
      chinh: chinh,
      hamCuaMan: (Phu && Phu.hamCuaMan) || [],
      hamCuaEmMoi: (Phu && Phu.hamCuaEmMoi) || []
    };
  }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo, than: than }; }

  var T_LOB_PAD = ['aim_lob(n)', 'forward(2)'];
  var T_BELT_LOB = ['move()', 'aim_lob(n)'];
  var T_SPIN_PAD = ['load()', 'wait()', 'move()', 'aim(n)', 'throw()', 'wait()'];
  var T_DIAG_PAD = ['diag_right()', 'aim_lob(n)', 'diag_left()'];
  var T_SMART_PAD = ['s = shape("front")', 'if s == "round":', '    aim_lob(2)', '    forward(2)', 'else:', '    lob_pad(3)'];

  function manMC(o) {
    var nhieuSan = Array.isArray(o.san[0]);
    return Object.assign({
      loaiRobot: 'omni',
      robot: ROBOT_MO_CU,
      omniCheo: true,
      chinhLuc: true,
      nhanDang: true,
      tamNemMacDinh: 2,
      daLapHo: true,
      hamGoc: KHAY_MO_CU,
      moXuong: true,
      mucTieu: 'toi-co',
      nhipTheo: nhieuSan ? 'tong' : undefined,
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
       CHƯƠNG 1: mo-cu — "Vượt mỏ đá cũ" (10 màn)
       ======================================================================== */

    /* ---- Màn 1: Trình diễn hất đá đè nút M mở cổng C (chiChay: true) ---- */
    manMC({
      id: 6801, chuong: 'mo-cu', so: 1, ma: 'mo-cu.1',
      ten: 'Hất đá mở cổng mỏ', hang: 'lam-quen',
      chiChay: true, chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward', 'slide_r', 'lob', 'aim_lob'],
      deBai: 'Trong khu mỏ đá cũ có những cánh cổng sắt `C` nối với nút đè `M` của nhà máy xưa. Khi R1 dùng `aim_lob(3)` hất viên đá bay vọt qua cổng `C` rơi trúng nút `M` ở `(3, 1)`, viên đá sẽ đè giữ nút `M` làm cổng `C` mở toang! Bấm Chạy để xem R1 mở cổng và trượt sang cờ.',
      veMaMau: 'Chương trình đã viết sẵn và khóa. Bấm Chạy để xem R1 hất đá tầm 3 lên nút M mở cổng C.',
      goiY: ['Bấm nút Chạy để xem viên đá bay qua cổng C rơi lên nút M và giữ cổng mở.'],
      san: [
        '#######',
        '#..M..#',
        '#..C.F#',
        '#..o..#',
        '#.....#',
        '#######'
      ],
      batDau: { x: 3, y: 4, huong: 0 },
      maMau: bai(['aim_lob(3)', 'forward(2)', 'slide_r(2)']),
      loiGiai: bai(['aim_lob(3)', 'forward(2)', 'slide_r(2)']),
      sao: { o: 17, nhip: 6 },
      loiBinh: 'Viên đá rơi xuống nút M sẽ đè giữ nút suốt phần còn lại của màn, mở thông cánh cổng C cho R1 đi qua.'
    }),

    /* ---- Màn 2: Hất đá qua rào = đè nút M mở cổng ngang ---- */
    manMC({
      id: 6802, chuong: 'mo-cu', so: 2, ma: 'mo-cu.2',
      ten: 'Hất qua rào đè nút', hang: 'lam-quen',
      hamCuaEmCan: ['slide_r', 'lob', 'aim_lob'],
      deBai: 'Nút đè `M` ở `(3, 1)` nằm khuất sau hàng rào `=`, cách R1 đúng 3 ô. Hãy gọi `aim_lob(3)` để hất viên đá trước mặt bay qua rào rơi trúng nút `M`, mở cánh cổng `C` ở `(4, 4)`, rồi gọi `slide_r(2)` trượt sang phải vào cờ `F`.',
      veMaMau: 'Chương trình mới gọi aim_lob(3). Hãy thêm lệnh trượt sang phải 2 ô qua cổng C.',
      goiY: [
        'Sau aim_lob(3), cổng C ở (4, 4) đã mở.',
        'Thêm dòng slide_r(2) để trượt sang phải 2 ô tới cờ F ở (5, 4).'
      ],
      san: [
        '#######',
        '#..M..#',
        '#..=..#',
        '#..o..#',
        '#...CF#',
        '#######'
      ],
      batDau: { x: 3, y: 4, huong: 0 },
      maMau: bai(['aim_lob(3)']),
      loiGiai: bai(['aim_lob(3)', 'slide_r(2)']),
      sao: { o: 11, nhip: 4 },
      loiSai: [
        { moTa: 'Chưa trượt sang phải qua cổng C sau khi hất đá lên nút M', baiLam: bai(['aim_lob(3)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Dùng lob() tầm 2 thay vì aim_lob(3) nên đá rơi trúng hàng rào = bị vỡ', baiLam: bai(['lob()', 'slide_r(2)']), phaiCoMa: ['nem-vo'] }
      ],
      loiBinh: 'Tay hất đá chỉnh lực giúp R1 kích hoạt nút đè M nằm sâu phía sau hàng rào mà không cần đi vòng.'
    }),

    /* ---- Màn 3: Băng chuyền cũ đẩy bánh omni ngay trong nhịp ---- */
    manMC({
      id: 6803, chuong: 'mo-cu', so: 3, ma: 'mo-cu.3',
      ten: 'Trượt đà băng chuyền', hang: 'lam-quen',
      hamCuaEmCan: ['move', 'forward', 'slide_r', 'lob', 'fill_pit'],
      deBai: 'Bánh lăn omni rất trơn nên vừa đặt chân lên băng chuyền `>` là được băng đẩy thêm 1 ô ngay cuối nhịp đó! Hãy gọi `fill_pit()` để lấp hố `u` và tiến lên `(1, 1)`, sau đó gọi `slide_r(1)` bước vào băng chuyền `>` (băng đẩy sang `(3, 1)`), rồi `slide_r(1)` lần nữa vào cờ `F`.',
      veMaMau: 'Sau fill_pit() và slide_r(1) đầu tiên, R1 đã được băng chuyền đẩy tới (3, 1). Hãy thêm bước trượt cuối cùng.',
      goiY: [
        'Nhịp slide_r(1) đầu tiên đưa R1 từ (1, 1) vào băng > ở (2, 1), băng lập tức đẩy R1 sang (3, 1).',
        'Thêm một lệnh slide_r(1) nữa để từ (3, 1) vào cờ F ở (4, 1).'
      ],
      san: [
        '######',
        '#u>.F#',
        '#o...#',
        '#....#',
        '######'
      ],
      batDau: { x: 1, y: 3, huong: 0 },
      maMau: bai(['fill_pit()', 'slide_r(1)']),
      loiGiai: bai(['fill_pit()', 'slide_r(1)', 'slide_r(1)']),
      sao: { o: 17, nhip: 6 },
      loiSai: [
        { moTa: 'Thiếu lệnh slide_r(1) cuối cùng nên dừng ở (3, 1) trước cờ', baiLam: bai(['fill_pit()', 'slide_r(1)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Trượt phải trước khi lấp hố nên lệch khỏi cột đá', baiLam: bai(['slide_r(1)', 'fill_pit()']), phaiCoMa: ['nap-hut'] }
      ],
      loiBinh: 'Khác với xe bánh thường và xích, bánh omni trơn nên băng chuyền đẩy xe ngay trong nhịp vừa bước lên.'
    }),

    /* ---- Màn 4: Lách chéo né thùng nặng H và băng chuyền ngược ---- */
    manMC({
      id: 6804, chuong: 'mo-cu', so: 4, ma: 'mo-cu.4',
      ten: 'Lách chéo né băng ngược', hang: 'luyen',
      hamCuaEmCan: ['move', 'forward', 'lob', 'fill_pit'],
      deBai: 'Trên đường lên hố `u` có thùng nặng `H` ở `(3, 5)` và băng chuyền ngược `v` ở `(4, 4)`. Hãy gọi `diag_right()` từ `(3, 6)` lên `(4, 5)` để né thùng `H`, gọi `diag_left()` lên `(3, 4)` để né băng ngược `v`, rồi dùng `fill_pit()` và `move()` để lấp hố tiến vào cờ!',
      veMaMau: 'Chương trình mới lách chéo qua thùng H và băng v tới (3, 4). Hãy gọi fill_pit() và move().',
      goiY: [
        'Tại (3, 4), viên đá tròn ở (3, 3) và hố u ở (3, 2) nằm ngay trước mũi xe.',
        'Gọi fill_pit() để lấp hố và tiến lên (3, 2), rồi gọi move() vào cờ F ở (3, 1).'
      ],
      san: [
        '######',
        '#..F.#',
        '#..u.#',
        '#..o.#',
        '#...v#',
        '#..H.#',
        '#....#',
        '######'
      ],
      batDau: { x: 3, y: 6, huong: 0 },
      maMau: bai(['diag_right()', 'diag_left()']),
      loiGiai: bai(['diag_right()', 'diag_left()', 'fill_pit()', 'move()']),
      sao: { o: 15, nhip: 7 },
      loiSai: [
        { moTa: 'Chưa gọi fill_pit() và move() sau khi lách chéo lên (3, 4)', baiLam: bai(['diag_right()', 'diag_left()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đi thẳng từ đầu thay vì lách chéo nên đâm vào thùng nặng H', baiLam: bai(['move()', 'fill_pit()', 'move()']), phaiCoMa: ['dam-tuong'] }
      ],
      loiBinh: 'Lộ trình zíc-zắc chéo giúp R1 luồn qua khe giữa thùng nặng H và dải băng chuyền ngược một cách gọn gàng.'
    }),

    /* ---- Màn 5: Lấp hố vừa kịp lúc thùng nặng trên băng chuyền đè nút M ---- */
    manMC({
      id: 6805, chuong: 'mo-cu', so: 5, ma: 'mo-cu.5',
      ten: 'Thùng nặng trôi mở cổng', hang: 'luyen',
      hamCuaEmCan: ['move', 'forward', 'slide_r', 'lob', 'fill_pit'],
      deBai: 'Ở hàng trên có một thùng nặng đang trôi trên băng chuyền `>>M` về phía nút đè `M`. Trong lúc chờ thùng nặng trôi tới đè nút mở cổng `C` ở `(4, 2)`, hãy gọi `fill_pit()` để lấp hố `u` và tiến lên `(3, 2)`, rồi `slide_r(2)` qua cổng `C` tới cờ `F`!',
      veMaMau: 'Sau fill_pit(), thùng nặng trên băng chuyền đã vừa kịp đè nút M mở cổng C. Hãy trượt sang phải 2 ô.',
      goiY: [
        'Hàm fill_pit() tốn 4 nhịp, vừa đủ thời gian cho thùng nặng trôi qua 2 ô băng chuyền đè lên nút M.',
        'Tại (3, 2), gọi slide_r(2) để đi qua cổng C ở (4, 2) tới cờ F ở (5, 2).'
      ],
      san: [
        '#######',
        '#>>M..#',
        '#.#uCF#',
        '#.#o..#',
        '#.#...#',
        '#######'
      ],
      thungThem: [{ x: 1, y: 1, nang: true }],
      batDau: { x: 3, y: 4, huong: 0 },
      maMau: bai(['fill_pit()']),
      loiGiai: bai(['fill_pit()', 'slide_r(2)']),
      sao: { o: 16, nhip: 6 },
      loiSai: [
        { moTa: 'Chưa gọi slide_r(2) để đi qua cổng C vào cờ', baiLam: bai(['fill_pit()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Không xúc đá lấp hố mà tiến thẳng đâm vào viên đá chắn đường', baiLam: bai(['forward(2)', 'slide_r(2)']), phaiCoMa: ['dam-tuong'] }
      ],
      loiBinh: 'Nhịp làm việc của R1 khớp hoàn hảo với nhịp trôi của thùng nặng trên băng chuyền cũ!'
    }),

    /* ---- Màn 6: 2 sân — Đá tròn lấp hố hay đá vuông đè nút M ---- */
    manMC({
      id: 6806, chuong: 'mo-cu', so: 6, ma: 'mo-cu.6',
      ten: 'Đá tròn lấp hố, đá vuông đè nút', hang: 'luyen',
      hamCuaEmCan: ['move', 'forward', 'slide_r', 'lob', 'aim_lob', 'fill_pit'],
      deBai: 'Trên hai sân, đường lên cờ ở cột 3 hoặc có hố `u` kèm đá tròn `"round"` ở `(3, 3)`, hoặc có cổng `C` kèm đá vuông `"square"` ở `(3, 3)` và nút đè `M` ở `(3, 1)`. Đá vuông không lấp được hố nhưng đè được nút `M`! Hãy đọc `s = shape("front")`, kiểm tra `if s == "round":` thì gọi `fill_pit()`, ngược lại (`else:`) gọi `aim_lob(3)` rồi `forward(2)`. Cuối cùng gọi `slide_r(2)` vào cờ `F`!',
      veMaMau: 'Hoàn thiện nhánh else (aim_lob(3) và forward(2)) rồi thêm slide_r(2) ở ngoài if/else.',
      goiY: [
        'Trong nhánh else:, viết aim_lob(3) để hất đá vuông lên nút M ở (3, 1), rồi forward(2) để tiến vào ô cổng C vừa mở ở (3, 2).',
        'Sau khối if/else (thẳng cột với if), viết slide_r(2) để trượt sang cờ F ở (5, 2).'
      ],
      san: [
        [
          '#######',
          '#.....#',
          '#..u.F#',
          '#..o..#',
          '#.....#',
          '#######'
        ],
        [
          '#######',
          '#..M..#',
          '#..C.F#',
          '#..o..#',
          '#.....#',
          '#######'
        ]
      ],
      vatDang: [
        [
          '.......',
          '.......',
          '.......',
          '...r...',
          '.......',
          '.......'
        ],
        [
          '.......',
          '.......',
          '.......',
          '...s...',
          '.......',
          '.......'
        ]
      ],
      batDau: { x: 3, y: 4, huong: 0 },
      maMau: bai([
        's = shape("front")',
        'if s == "round":',
        '    fill_pit()',
        'else:',
        '    aim_lob(3)'
      ]),
      loiGiai: bai([
        's = shape("front")',
        'if s == "round":',
        '    fill_pit()',
        'else:',
        '    aim_lob(3)',
        '    forward(2)',
        'slide_r(2)'
      ]),
      sao: { o: 22, nhip: 12 },
      loiSai: [
        { moTa: 'Thiếu forward(2) trong nhánh else và slide_r(2) ở cuối', baiLam: bai(['s = shape("front")', 'if s == "round":', '    fill_pit()', 'else:', '    aim_lob(3)']), phaiCoMa: ['chua-toi-co'], cung: true },
        { moTa: 'Dùng fill_pit() cố định cho cả hai sân nên ở sân 2 ném tầm 2 không tới nút M và đâm vào cửa C đóng', baiLam: bai(['fill_pit()', 'slide_r(2)']), phaiCoMa: ['dam-tuong'], cung: true }
      ],
      loiBinh: 'Đá vuông tuy không lấp vừa hố tròn nhưng lại là quả tạ tuyệt vời để đè nút M mở cổng sắt!'
    }),

    /* ---- Màn 7: Bàn xoay @ xoay hướng R1 về phía nút đè M ---- */
    manMC({
      id: 6807, chuong: 'mo-cu', so: 7, ma: 'mo-cu.7',
      ten: 'Bàn xoay nhắm nút đè', hang: 'thu-thach',
      hamCuaEmCan: ['move', 'forward', 'slide_r'],
      deBai: 'Xúc viên đá ở `(2, 2)` bằng `load()` và `wait()`, rồi tiến 2 ô `forward(2)` lên bàn xoay `@` ở `(2, 1)`. Bàn xoay tự động xoay mũi R1 sang phải (hướng Đông) nhìn thẳng về cổng `C` ở `(3, 1)`, hàng rào `=` ở `(4, 1)` và nút đè `M` ở `(5, 1)`. Hãy chỉnh tầm `aim(3)`, gọi `throw()`, `wait()` để hất đá đè nút `M` mở cổng `C`, rồi gọi `move()` và `slide_r(1)` vào cờ `F`!',
      veMaMau: 'Chương trình đã xúc đá và bước lên bàn xoay @ ở (2, 1). Hãy hất đá tầm 3 rồi qua cổng C vào cờ.',
      goiY: [
        'Trên bàn xoay (2, 1), mũi R1 đã xoay sang phải nhìn về cổng C (3, 1) và nút M (5, 1).',
        'Viết tiếp aim(3), throw(), wait(), rồi move() để bước sang (3, 1) và slide_r(1) để trượt xuống cờ F ở (3, 2).'
      ],
      san: [
        '#######',
        '#.@C=M#',
        '#.oF..#',
        '#.....#',
        '#######'
      ],
      batDau: { x: 2, y: 3, huong: 0 },
      maMau: bai(['load()', 'wait()', 'forward(2)']),
      loiGiai: bai(['load()', 'wait()', 'forward(2)', 'aim(3)', 'throw()', 'wait()', 'move()', 'slide_r(1)']),
      sao: { o: 16, nhip: 6 },
      loiSai: [
        { moTa: 'Chưa hất đá tầm 3 và bước vào cờ sau khi lên bàn xoay', baiLam: bai(['load()', 'wait()', 'forward(2)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên chỉnh aim(3) nên hất tầm 2 trúng hàng rào = ở (4, 1) làm vỡ đá', baiLam: bai(['load()', 'wait()', 'forward(2)', 'throw()', 'wait()', 'move()', 'slide_r(1)']), phaiCoMa: ['nem-vo'] }
      ],
      loiBinh: 'Bàn xoay @ kết hợp với tay hất đá chỉnh lực tạo thành bệ pháo xoay tự động mở cổng!'
    }),

    /* ---- Màn 8: 2 sân — Tuyển quặng dọc băng chuyền nối trạm ---- */
    manMC({
      id: 6808, chuong: 'mo-cu', so: 8, ma: 'mo-cu.8',
      ten: 'Tuyển quặng dọc băng chuyền', hang: 'thu-thach',
      mucTieu: 'dua-vat',
      hamCuaEmCan: ['slide_r', 'lob', 'aim_lob', 'safe_sort'],
      deBai: 'Trên hai sân có 3 trạm tuyển quặng ở các cột `1`, `3`, `5`, ngăn cách nhau bởi các ô băng chuyền `>` ở `(2, 4)` và `(4, 4)`. Mỗi khi gọi `slide_r(1)` bước vào băng chuyền `>`, băng đẩy R1 sang thẳng trạm kế tiếp! Hãy lặp 2 lần (`for i in range(2):`) gồm `safe_sort()` và `slide_r(1)`, sau đó gọi `safe_sort()` lần cuối ở trạm thứ 3!',
      veMaMau: 'Viết vòng lặp 2 lần safe_sort() và slide_r(1), rồi gọi thêm safe_sort() ở ngoài vòng lặp.',
      goiY: [
        'Trong vòng lặp for i in range(2):, gọi safe_sort() rồi slide_r(1) (băng chuyền > đẩy R1 nhảy 2 cột sang trạm tiếp theo).',
        'Sau vòng lặp, gọi safe_sort() để xử lý trạm cuối ở cột 5.'
      ],
      san: [
        [
          '#######',
          '#D..D.#',
          '#...=D#',
          '#o...o#',
          '#.>.>.#',
          '#######'
        ],
        [
          '#######',
          '#..D..#',
          '#D..=D#',
          '#o.o..#',
          '#.>.>.#',
          '#######'
        ]
      ],
      vatDang: [
        [
          '.......',
          '.......',
          '.......',
          '.q...r.',
          '.......',
          '.......'
        ],
        [
          '.......',
          '.......',
          '.......',
          '.r.q...',
          '.......',
          '.......'
        ]
      ],
      batDau: { x: 1, y: 4, huong: 0 },
      maMau: bai(['for i in range(2):', '    safe_sort()']),
      loiGiai: bai(['for i in range(2):', '    safe_sort()', '    slide_r(1)', 'safe_sort()']),
      sao: { o: 17, nhip: 11 },
      loiSai: [
        { moTa: 'Quên gọi safe_sort() sau vòng lặp nên bỏ sót viên đá ở cột 5 trên sân 1', baiLam: bai(['for i in range(2):', '    safe_sort()', '    slide_r(1)']), phaiCoMa: ['chua-dua-vat'], cung: true },
        { moTa: 'Dùng slide_r(2) thay vì slide_r(1) nên đi lố qua trạm do băng chuyền đã đẩy sẵn 1 ô', baiLam: bai(['for i in range(2):', '    safe_sort()', '    slide_r(2)', 'safe_sort()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      loiBinh: 'Tận dụng lực đẩy 1 ô của băng chuyền giúp R1 di chuyển giữa các trạm tuyển quặng nhanh gấp đôi!'
    }),

    /* ---- Màn 9: 2 sân — Vượt tầng đá tròn/vuông rồi hất đá mở cổng đỉnh mỏ ---- */
    manMC({
      id: 6809, chuong: 'mo-cu', so: 9, ma: 'mo-cu.9',
      ten: 'Sàn dốc và cổng khóa', hang: 'thu-thach',
      hamCuaEmCan: ['move', 'forward', 'slide_r', 'lob', 'aim_lob', 'fill_pit', 'diag_r', 'round_fill'],
      deBai: 'Ở tầng dưới có hố `u` kèm đá tròn hoặc đá vuông: hãy gọi `round_fill()` rồi `move()` để vượt lên tầng trên. Tại tầng trên, viên đá trước mặt cần hất xa 3 ô (`aim_lob(3)`) lên nút đè `M` để mở cổng `C`, sau đó tiến `forward(2)` qua cổng và trượt `slide_r(1)` lên băng chuyền `>` vào cờ `F`!',
      veMaMau: 'Sau round_fill() và move(), hãy gọi aim_lob(3), forward(2) và slide_r(1).',
      goiY: [
        'Bắt đầu bằng round_fill() rồi move() để lên hàng y = 4.',
        'Tại hàng y = 4, gọi aim_lob(3) để hất đá lên nút M ở hàng y = 1, rồi forward(2) qua cổng C và slide_r(1) lên băng chuyền > vào cờ F.'
      ],
      san: [
        [
          '#########',
          '#..M.M..#',
          '#..C>F..#',
          '#..o.o..#',
          '#.......#',
          '#..u....#',
          '#..o....#',
          '#.......#',
          '#########'
        ],
        [
          '#########',
          '#..M.M..#',
          '#....C>F#',
          '#..o.o..#',
          '#.......#',
          '#..u....#',
          '#..o....#',
          '#.......#',
          '#########'
        ]
      ],
      vatDang: [
        [
          '.........',
          '.........',
          '.........',
          '...r.r...',
          '.........',
          '.........',
          '...r.....',
          '.........',
          '.........'
        ],
        [
          '.........',
          '.........',
          '.........',
          '...r.r...',
          '.........',
          '.........',
          '...s.....',
          '.........',
          '.........'
        ]
      ],
      batDau: { x: 3, y: 7, huong: 0 },
      maMau: bai(['round_fill()', 'move()']),
      loiGiai: bai(['round_fill()', 'move()', 'aim_lob(3)', 'forward(2)', 'slide_r(1)']),
      sao: { o: 27, nhip: 18 },
      loiSai: [
        { moTa: 'Chưa mở cổng C ở tầng trên bằng aim_lob(3), forward(2), slide_r(1)', baiLam: bai(['round_fill()', 'move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Dùng fill_pit() cố định ở tầng dưới nên ở sân 2 hất đá vuông vào hố không lấp được hố', baiLam: bai(['fill_pit()', 'move()', 'aim_lob(3)', 'forward(2)', 'slide_r(1)']), phaiCoMa: ['roi-ho'], cung: true }
      ],
      loiBinh: 'Dù round_fill() đưa R1 lên cột 3 (sân 1) hay lách chéo sang cột 5 (sân 2), cụm lệnh mở cổng phía trên vẫn hoạt động chính xác!'
    }),

    /* ---- Màn 10: Trùm chương 1 (2 sân, huy hiệu mo-cu) ---- */
    manMC({
      id: 6810, chuong: 'mo-cu', so: 10, ma: 'mo-cu.10',
      ten: 'Trùm chương 1: Pháo đài mỏ đá cũ', hang: 'trum',
      huyHieu: 'mo-cu',
      hamCuaEmCan: ['move', 'forward', 'slide_r', 'lob', 'aim_lob', 'fill_pit', 'diag_r', 'round_fill'],
      deBai: 'Trùm Chương 1! Từ đáy hầm `(3, 10)`, hãy lặp 2 tầng đầu (`for i in range(2):`) với `round_fill()` và `move()` để vượt qua các bãi hố đá tròn/vuông. Lên tới tầng cổng sắt `(y = 4)`, hãy gọi `aim_lob(3)` để hất đá lên nút đè `M`, tiến `forward(2)` qua cổng `C`, rồi gọi `slide_r(1)` để băng chuyền `>` đẩy R1 vào cờ `F`!',
      veMaMau: 'Lặp 2 lần round_fill() và move(), sau đó gọi aim_lob(3), forward(2) và slide_r(1).',
      goiY: [
        'Viết vòng lặp for i in range(2): gồm round_fill() và move() để vượt 2 tầng dưới lên hàng y = 4.',
        'Sau vòng lặp, gọi aim_lob(3), forward(2), slide_r(1) để mở cổng C và trượt băng chuyền vào cờ.'
      ],
      san: [
        [
          '#########',
          '#..M.M..#',
          '#..C>F..#',
          '#..o.o..#',
          '#.......#',
          '#..u....#',
          '#..o....#',
          '#.......#',
          '#..u....#',
          '#..o....#',
          '#.......#',
          '#########'
        ],
        [
          '#########',
          '#....M.M#',
          '#....C>F#',
          '#....o.o#',
          '#.......#',
          '#....u..#',
          '#....o..#',
          '#.......#',
          '#..u....#',
          '#..o....#',
          '#.......#',
          '#########'
        ]
      ],
      vatDang: [
        [
          '.........',
          '.........',
          '.........',
          '...r.r...',
          '.........',
          '.........',
          '...r.....',
          '.........',
          '.........',
          '...r.....',
          '.........',
          '.........'
        ],
        [
          '.........',
          '.........',
          '.........',
          '.....r.r.',
          '.........',
          '.........',
          '.....r...',
          '.........',
          '.........',
          '...s.....',
          '.........',
          '.........'
        ]
      ],
      batDau: { x: 3, y: 10, huong: 0 },
      maMau: bai(['for i in range(2):', '    round_fill()', '    move()']),
      loiGiai: bai(['for i in range(2):', '    round_fill()', '    move()', 'aim_lob(3)', 'forward(2)', 'slide_r(1)']),
      sao: { o: 28, nhip: 28 },
      loiSai: [
        { moTa: 'Chưa mở cổng C ở tầng đỉnh sau vòng lặp', baiLam: bai(['for i in range(2):', '    round_fill()', '    move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Dùng fill_pit() cố định thay cho round_fill() nên ở sân 2 lao xuống hố tại tầng 1', baiLam: bai(['for i in range(2):', '    fill_pit()', '    move()', 'aim_lob(3)', 'forward(2)', 'slide_r(1)']), phaiCoMa: ['roi-ho'], cung: true }
      ],
      loiBinh: 'Xuất sắc! Em đã chinh phục Chương 1 Vượt mỏ đá cũ và giành huy hiệu Mỏ đá cũ!'
    }),

    /* ========================================================================
       CHƯƠNG 2: che-mo-cu — "Chế lệnh: mở cổng mỏ" (10 màn)
       ======================================================================== */

    /* ---- Màn 11 (che-mo-cu.1): Chế hàm lob_pad(n) ---- */
    manMC({
      id: 6811, chuong: 'che-mo-cu', so: 1, ma: 'che-mo-cu.1',
      ten: 'Chế hàm: Hất mở cổng (lob_pad)', hang: 'lam-quen',
      taoHam: ['lob_pad'],
      hamCuaEmCan: ['move', 'forward', 'slide_r', 'lob', 'aim_lob'],
      deBai: 'Cụm thao tác hất đá tầm `n` lên nút đè `M` rồi tiến 2 ô qua cổng `C` lặp lại ở khắp mỏ đá cũ. Hãy chế hàm `lob_pad(n)` gồm 2 dòng: gọi `aim_lob(n)` rồi gọi `forward(2)`. Chương trình chính sẽ gọi `lob_pad(3)` và `slide_r(2)` để đưa R1 vào cờ.',
      veMaMau: 'Hoàn thiện thân hàm lob_pad(n) bằng cách thêm forward(2) sau aim_lob(n).',
      goiY: [
        'Trong hàm def lob_pad(n):, ngay dưới dòng aim_lob(n), hãy viết forward(2).',
        'Chương trình chính đã gọi sẵn lob_pad(3) và slide_r(2).'
      ],
      san: [
        '#######',
        '#..M..#',
        '#..C.F#',
        '#..o..#',
        '#.....#',
        '#######'
      ],
      batDau: { x: 3, y: 4, huong: 0 },
      maMau: bai(['lob_pad(3)', 'slide_r(2)'], {
        hamCuaEmMoi: [H('lob_pad', ['n'], ['aim_lob(n)'])]
      }),
      loiGiai: bai(['lob_pad(3)', 'slide_r(2)'], {
        hamCuaEmMoi: [H('lob_pad', ['n'], T_LOB_PAD)]
      }),
      sao: { o: 18, nhip: 6 },
      loiSai: [
        { moTa: 'Chưa thêm forward(2) vào thân hàm lob_pad(n)', baiLam: bai(['lob_pad(3)', 'slide_r(2)'], { hamCuaEmMoi: [H('lob_pad', ['n'], ['aim_lob(n)'])] }), hamCuaEmMoi: [H('lob_pad', ['n'], ['aim_lob(n)'])], phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Viết aim_lob(2) cố định thay vì aim_lob(n) nên đá rơi trúng cổng C chưa mở', baiLam: bai(['lob_pad(3)', 'slide_r(2)'], { hamCuaEmMoi: [H('lob_pad', ['n'], ['aim_lob(2)', 'forward(2)'])] }), hamCuaEmMoi: [H('lob_pad', ['n'], ['aim_lob(2)', 'forward(2)'])], phaiCoMa: ['dam-tuong'] }
      ],
      loiBinh: 'Đã lưu hàm lob_pad(n) vào Kho hàm của em! Từ nay chỉ cần một lệnh là mở cổng và bước qua.'
    }),

    /* ---- Màn 12 (che-mo-cu.2): Luyện lob_pad(n) qua 2 tầng cổng nối tiếp ---- */
    manMC({
      id: 6812, chuong: 'che-mo-cu', so: 2, ma: 'che-mo-cu.2',
      ten: 'Hai tầng cổng sắt', hang: 'lam-quen',
      hamCuaEmCan: ['move', 'forward', 'slide_r', 'lob', 'aim_lob', 'lob_pad'],
      deBai: 'Đường lên cờ đi qua 2 tầng cổng `C` liên tiếp ở cột 3 và cột 5, nối bằng băng chuyền `>` ở `(4, 4)`. Tại mỗi tầng, nút đè `M` nằm cách R1 đúng 3 ô. Hãy lặp 2 lần (`for i in range(2):`): gọi `lob_pad(3)` rồi `slide_r(1)`!',
      veMaMau: 'Trong vòng lặp for i in range(2):, sau lob_pad(3) hãy thêm slide_r(1).',
      goiY: [
        'Tầng 1: lob_pad(3) mở cổng ở (3, 4) và tiến lên (3, 4); slide_r(1) bước vào băng > ở (4, 4) đẩy sang (5, 4).',
        'Tầng 2: lob_pad(3) mở cổng ở (5, 2) và tiến lên (5, 2); slide_r(1) trượt sang cờ F ở (6, 2).'
      ],
      san: [
        '########',
        '#....M.#',
        '#....CF#',
        '#..M.o.#',
        '#..C>..#',
        '#..o...#',
        '#......#',
        '########'
      ],
      noi: [
        { nut: { x: 3, y: 3 }, cua: [{ x: 3, y: 4 }] },
        { nut: { x: 5, y: 1 }, cua: [{ x: 5, y: 2 }] }
      ],
      batDau: { x: 3, y: 6, huong: 0 },
      maMau: bai(['for i in range(2):', '    lob_pad(3)']),
      loiGiai: bai(['for i in range(2):', '    lob_pad(3)', '    slide_r(1)']),
      sao: { o: 19, nhip: 10 },
      loiSai: [
        { moTa: 'Thiếu slide_r(1) trong vòng lặp nên không chuyển sang cột cổng thứ hai', baiLam: bai(['for i in range(2):', '    lob_pad(3)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Gọi lob_pad(2) thay vì lob_pad(3) nên đá không tới nút đè M', baiLam: bai(['for i in range(2):', '    lob_pad(2)', '    slide_r(1)']), phaiCoMa: ['dam-tuong'] }
      ],
      loiBinh: 'Kết hợp lob_pad(3) với băng chuyền > giúp R1 leo qua hai tầng cổng khóa chỉ bằng một vòng lặp 2 dòng!'
    }),

    /* ---- Màn 13 (che-mo-cu.3): Chế hàm belt_lob(n) ---- */
    manMC({
      id: 6813, chuong: 'che-mo-cu', so: 3, ma: 'che-mo-cu.3',
      ten: 'Chế hàm: Đà băng hất đá (belt_lob)', hang: 'lam-quen',
      mucTieu: 'dua-vat',
      taoHam: ['belt_lob'],
      hamCuaEmCan: ['move', 'back', 'slide_r', 'lob', 'aim_lob'],
      deBai: 'Khi trước mặt là ô băng chuyền tiến `^` dẫn tới viên đá, chỉ cần 1 lệnh `move()` là băng đẩy R1 tiến liền 2 ô tới sát viên đá! Hãy chế hàm `belt_lob(n)`: gọi `move()` rồi `aim_lob(n)`. Chương trình chính sẽ gọi `belt_lob(2)`, lùi 2 ô rồi trượt sang cột tiếp theo gọi `belt_lob(3)`!',
      veMaMau: 'Hoàn thiện hàm belt_lob(n): thêm aim_lob(n) ngay sau move().',
      goiY: [
        'Trong hàm def belt_lob(n):, dòng 1 là move(), dòng 2 là aim_lob(n).',
        'Chương trình chính đã viết sẵn các bước di chuyển giữa hai cột.'
      ],
      san: [
        '#######',
        '#...D.#',
        '#.D.=.#',
        '#.o.o.#',
        '#.....#',
        '#.^.^.#',
        '#.....#',
        '#######'
      ],
      batDau: { x: 2, y: 6, huong: 0 },
      maMau: bai(['belt_lob(2)', 'back()', 'back()', 'slide_r(2)', 'belt_lob(3)'], {
        hamCuaEmMoi: [H('belt_lob', ['n'], ['move()'])]
      }),
      loiGiai: bai(['belt_lob(2)', 'back()', 'back()', 'slide_r(2)', 'belt_lob(3)'], {
        hamCuaEmMoi: [H('belt_lob', ['n'], T_BELT_LOB)]
      }),
      sao: { o: 22, nhip: 10 },
      loiSai: [
        { moTa: 'Chưa gọi aim_lob(n) trong thân hàm belt_lob(n)', baiLam: bai(['belt_lob(2)', 'back()', 'back()', 'slide_r(2)', 'belt_lob(3)'], { hamCuaEmMoi: [H('belt_lob', ['n'], ['move()'])] }), hamCuaEmMoi: [H('belt_lob', ['n'], ['move()'])], phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Gọi lob() tầm 2 cố định thay vì aim_lob(n) nên viên đá thứ hai rơi trúng hàng rào =', baiLam: bai(['belt_lob(2)', 'back()', 'back()', 'slide_r(2)', 'belt_lob(3)'], { hamCuaEmMoi: [H('belt_lob', ['n'], ['move()', 'lob()'])] }), hamCuaEmMoi: [H('belt_lob', ['n'], ['move()', 'lob()'])], phaiCoMa: ['nem-vo'] }
      ],
      loiBinh: 'Đã lưu hàm belt_lob(n) vào Kho hàm của em! Mượn đà băng chuyền giúp R1 tiếp cận và hất đá cực nhanh.'
    }),

    /* ---- Màn 14 (che-mo-cu.4): Chế hàm spin_pad(n) ---- */
    manMC({
      id: 6814, chuong: 'che-mo-cu', so: 4, ma: 'che-mo-cu.4',
      ten: 'Chế hàm: Xoay bệ hất đá (spin_pad)', hang: 'luyen',
      taoHam: ['spin_pad'],
      hamCuaEmCan: ['move', 'forward'],
      deBai: 'Khi viên đá nằm ngay trên bàn xoay `@` hoặc `%` trước mặt, R1 có thể xúc đá (`load()`, `wait()`), bước lên bàn xoay (`move()`) để bàn xoay tự quay mũi xe về phía nút đè `M`, rồi chỉnh tầm và hất (`aim(n)`, `throw()`, `wait()`). Hãy chế hàm `spin_pad(n)` thực hiện chuỗi đó để mở cổng trên cả 2 sân!',
      veMaMau: 'Hoàn thiện hàm spin_pad(n): sau move(), hãy thêm aim(n), throw(), wait().',
      goiY: [
        'Trong hàm def spin_pad(n):, sau load(), wait(), move(), hãy viết tiếp aim(n), throw(), wait().',
        'Sau khi spin_pad(3) mở cổng C, chương trình chính gọi forward(2) để tiến qua cổng vào cờ F.'
      ],
      san: [
        [
          '#######',
          '#.@CFM#',
          '#.....#',
          '#######'
        ],
        [
          '#######',
          '#MFC%.#',
          '#.....#',
          '#######'
        ]
      ],
      vatThem: [
        [{ x: 2, y: 1 }],
        [{ x: 4, y: 1 }]
      ],
      batDau: [
        { x: 2, y: 2, huong: 0 },
        { x: 4, y: 2, huong: 0 }
      ],
      maMau: bai(['spin_pad(3)', 'forward(2)'], {
        hamCuaEmMoi: [H('spin_pad', ['n'], ['load()', 'wait()', 'move()'])]
      }),
      loiGiai: bai(['spin_pad(3)', 'forward(2)'], {
        hamCuaEmMoi: [H('spin_pad', ['n'], T_SPIN_PAD)]
      }),
      sao: { o: 13, nhip: 10 },
      loiSai: [
        { moTa: 'Chưa thêm aim(n), throw(), wait() vào thân hàm spin_pad(n) nên đâm vào cổng C đang đóng', baiLam: bai(['spin_pad(3)', 'forward(2)'], { hamCuaEmMoi: [H('spin_pad', ['n'], ['load()', 'wait()', 'move()'])] }), hamCuaEmMoi: [H('spin_pad', ['n'], ['load()', 'wait()', 'move()'])], phaiCoMa: ['dam-tuong'] },
        { moTa: 'Quên gọi aim(n) trước throw() nên ném tầm 2 rơi vào ô cờ trước nút M và không mở được cổng C', baiLam: bai(['spin_pad(3)', 'forward(2)'], { hamCuaEmMoi: [H('spin_pad', ['n'], ['load()', 'wait()', 'move()', 'throw()', 'wait()'])] }), hamCuaEmMoi: [H('spin_pad', ['n'], ['load()', 'wait()', 'move()', 'throw()', 'wait()'])], phaiCoMa: ['dam-tuong'], cung: true }
      ],
      loiBinh: 'Đã lưu hàm spin_pad(n) vào Kho hàm của em! Bất kể bàn xoay quay trái (%) hay quay phải (@), spin_pad(n) đều hất trúng nút M.'
    }),

    /* ---- Màn 15 (che-mo-cu.5): Phối hợp lob_pad(n) và spin_pad(n) ---- */
    manMC({
      id: 6815, chuong: 'che-mo-cu', so: 5, ma: 'che-mo-cu.5',
      ten: 'Cổng dọc nối cổng ngang', hang: 'luyen',
      hamCuaEmCan: ['move', 'forward', 'slide_r', 'lob', 'aim_lob', 'lob_pad', 'spin_pad'],
      deBai: 'Để thoát khỏi hầm mỏ cũ, trước hết hãy gọi `lob_pad(3)` để hất đá lên nút `M` ở `(2, 2)` mở cổng dọc `C` ở `(2, 3)` và tiến lên `(2, 3)`. Sau đó gọi `slide_r(2)` trượt sang `(4, 3)` ngay dưới bàn xoay `@` ở `(4, 2)`, rồi gọi `spin_pad(3)` và `forward(2)` qua cổng thứ hai vào cờ `F`!',
      veMaMau: 'Sau lob_pad(3) và slide_r(2), hãy gọi spin_pad(3) rồi forward(2).',
      goiY: [
        'lob_pad(3) và slide_r(2) đưa R1 tới (4, 3), ngay dưới bàn xoay @ ở (4, 2).',
        'Gọi spin_pad(3) để xúc đá ở (4, 2), bước lên @ xoay sang phải và hất đá tầm 3 vào nút M ở (7, 2), sau đó gọi forward(2) vào cờ F ở (6, 2).'
      ],
      san: [
        '#########',
        '#.......#',
        '#.M.@CFM#',
        '#.C.....#',
        '#.o.....#',
        '#.......#',
        '#########'
      ],
      noi: [
        { nut: { x: 2, y: 2 }, cua: [{ x: 2, y: 3 }] },
        { nut: { x: 7, y: 2 }, cua: [{ x: 5, y: 2 }] }
      ],
      vatThem: [{ x: 4, y: 2 }],
      batDau: { x: 2, y: 5, huong: 0 },
      maMau: bai(['lob_pad(3)', 'slide_r(2)']),
      loiGiai: bai(['lob_pad(3)', 'slide_r(2)', 'spin_pad(3)', 'forward(2)']),
      sao: { o: 26, nhip: 11 },
      loiSai: [
        { moTa: 'Chưa gọi spin_pad(3) và forward(2) sau khi trượt sang dưới bàn xoay', baiLam: bai(['lob_pad(3)', 'slide_r(2)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Gọi spin_pad(2) thay vì spin_pad(3) nên viên đá thứ hai không tới nút M ở (7, 2)', baiLam: bai(['lob_pad(3)', 'slide_r(2)', 'spin_pad(2)', 'forward(2)']), phaiCoMa: ['dam-tuong'] }
      ],
      loiBinh: 'Sự kết hợp giữa lob_pad(3) và spin_pad(3) giúp R1 mở thông hành lang chữ Z khóa kép chỉ trong vài dòng lệnh!'
    }),

    /* ---- Màn 16 (che-mo-cu.6): Chế hàm diag_pad(n) ---- */
    manMC({
      id: 6816, chuong: 'che-mo-cu', so: 6, ma: 'che-mo-cu.6',
      ten: 'Chế hàm: Lách chéo hất nút (diag_pad)', hang: 'luyen',
      taoHam: ['diag_pad'],
      hamCuaEmCan: ['move', 'forward', 'lob', 'aim_lob'],
      deBai: 'Khi viên đá và nút đè `M` nằm lệch 1 cột bên phải trục đường chính, R1 có thể lách chéo phải (`diag_right()`), hất đá tầm `n` lên nút `M` (`aim_lob(n)`), rồi lách chéo trái (`diag_left()`) trở về trục chính để đi qua cổng `C` vừa mở! Hãy chế hàm `diag_pad(n)` thực hiện 3 bước đó.',
      veMaMau: 'Hoàn thiện hàm diag_pad(n): thêm aim_lob(n) và diag_left() sau diag_right().',
      goiY: [
        'Trong hàm def diag_pad(n):, dòng 1 là diag_right(), dòng 2 là aim_lob(n), dòng 3 là diag_left().',
        'Chương trình chính đã gọi sẵn diag_pad(3) và forward(3) để đi qua cổng C tới cờ F.'
      ],
      san: [
        '#######',
        '#..F..#',
        '#..CM.#',
        '#...=.#',
        '#...o.#',
        '#.....#',
        '#.....#',
        '#######'
      ],
      batDau: { x: 3, y: 6, huong: 0 },
      maMau: bai(['diag_pad(3)', 'forward(3)'], {
        hamCuaEmMoi: [H('diag_pad', ['n'], ['diag_right()'])]
      }),
      loiGiai: bai(['diag_pad(3)', 'forward(3)'], {
        hamCuaEmMoi: [H('diag_pad', ['n'], T_DIAG_PAD)]
      }),
      sao: { o: 16, nhip: 7 },
      loiSai: [
        { moTa: 'Chưa hoàn thiện hàm diag_pad(n) nên chưa hất đá mở cổng và lệch khỏi cột cờ', baiLam: bai(['diag_pad(3)', 'forward(3)'], { hamCuaEmMoi: [H('diag_pad', ['n'], ['diag_right()'])] }), hamCuaEmMoi: [H('diag_pad', ['n'], ['diag_right()'])], phaiCoMa: ['dam-tuong'] },
        { moTa: 'Quên gọi diag_left() ở cuối hàm diag_pad(n) nên tiến thẳng đâm vào hàng rào =', baiLam: bai(['diag_pad(3)', 'forward(3)'], { hamCuaEmMoi: [H('diag_pad', ['n'], ['diag_right()', 'aim_lob(n)'])] }), hamCuaEmMoi: [H('diag_pad', ['n'], ['diag_right()', 'aim_lob(n)'])], phaiCoMa: ['dam-tuong'] }
      ],
      loiBinh: 'Đã lưu hàm diag_pad(n) vào Kho hàm của em! Lách chéo hất nút rồi quay lại trục chính giúp R1 mở cổng bên hông cực kỳ linh hoạt.'
    }),

    /* ---- Màn 17 (che-mo-cu.7): Chế hàm smart_pad() (2 sân) ---- */
    manMC({
      id: 6817, chuong: 'che-mo-cu', so: 7, ma: 'che-mo-cu.7',
      ten: 'Chế hàm: Lấp hố hay mở cổng (smart_pad)', hang: 'thu-thach',
      taoHam: ['smart_pad'],
      hamCuaEmCan: ['move', 'forward', 'slide_r', 'lob', 'aim_lob', 'lob_pad'],
      deBai: 'Trong hầm mỏ cũ, trước mặt R1 có thể là viên đá tròn `"round"` cần hất tầm 2 lấp hố `u` rồi tiến 2 ô (`aim_lob(2)`, `forward(2)`), hoặc viên đá vuông `"square"` cần hất xa 3 ô lên nút đè `M` mở cổng `C` rồi tiến 2 ô (`lob_pad(3)`). Hãy hoàn thiện nhánh `else:` của hàm `smart_pad()` bằng cách gọi `lob_pad(3)`!',
      veMaMau: 'Hoàn thiện nhánh else của hàm smart_pad() bằng cách gọi lob_pad(3).',
      goiY: [
        'Trong hàm def smart_pad():, dưới dòng else:, hãy viết lob_pad(3) thụt lề 4 dấu cách.',
        'Chương trình chính lặp 2 bậc thang smart_pad() và slide_r(1) (mượn băng chuyền >) để đưa R1 tới cờ trên cả hai sân.'
      ],
      san: [
        [
          '########',
          '#....M.#',
          '#....CF#',
          '#....o.#',
          '#..u>..#',
          '#..o...#',
          '#......#',
          '########'
        ],
        [
          '########',
          '#......#',
          '#....uF#',
          '#..M.o.#',
          '#..C>..#',
          '#..o...#',
          '#......#',
          '########'
        ]
      ],
      vatDang: [
        [
          '........',
          '........',
          '........',
          '.....s..',
          '........',
          '...r....',
          '........',
          '........'
        ],
        [
          '........',
          '........',
          '........',
          '.....r..',
          '........',
          '...s....',
          '........',
          '........'
        ]
      ],
      batDau: { x: 3, y: 6, huong: 0 },
      maMau: bai(['for i in range(2):', '    smart_pad()', '    slide_r(1)'], {
        hamCuaEmMoi: [H('smart_pad', [], ['s = shape("front")', 'if s == "round":', '    aim_lob(2)', '    forward(2)', 'else:'])]
      }),
      loiGiai: bai(['for i in range(2):', '    smart_pad()', '    slide_r(1)'], {
        hamCuaEmMoi: [H('smart_pad', [], T_SMART_PAD)]
      }),
      sao: { o: 24, nhip: 20 },
      loiSai: [
        { moTa: 'Trong nhánh else gọi lob_pad(2) thay vì lob_pad(3) nên đá vuông không mở được cổng C', baiLam: bai(['for i in range(2):', '    smart_pad()', '    slide_r(1)'], { hamCuaEmMoi: [H('smart_pad', [], ['s = shape("front")', 'if s == "round":', '    aim_lob(2)', '    forward(2)', 'else:', '    lob_pad(2)'])] }), hamCuaEmMoi: [H('smart_pad', [], ['s = shape("front")', 'if s == "round":', '    aim_lob(2)', '    forward(2)', 'else:', '    lob_pad(2)'])], phaiCoMa: ['dam-tuong'], cung: true },
        { moTa: 'Trong nhánh else gọi aim_lob(3) mà quên tiến 2 ô như lob_pad(3)', baiLam: bai(['for i in range(2):', '    smart_pad()', '    slide_r(1)'], { hamCuaEmMoi: [H('smart_pad', [], ['s = shape("front")', 'if s == "round":', '    aim_lob(2)', '    forward(2)', 'else:', '    aim_lob(3)'])] }), hamCuaEmMoi: [H('smart_pad', [], ['s = shape("front")', 'if s == "round":', '    aim_lob(2)', '    forward(2)', 'else:', '    aim_lob(3)'])], phaiCoMa: ['chua-toi-co'] }
      ],
      loiBinh: 'Đã lưu hàm smart_pad() vào Kho hàm của em! Chỉ một lệnh duy nhất giải quyết cả hố sâu lẫn cổng khóa tùy theo hình dạng viên đá.'
    }),

    /* ---- Màn 18 (che-mo-cu.8): Sửa hàm hỏng smart_pad() (suaHam: true, 2 sân) ---- */
    manMC({
      id: 6818, chuong: 'che-mo-cu', so: 8, ma: 'che-mo-cu.8',
      ten: 'Sửa hàm: Nhầm tầm nút đè', hang: 'thu-thach',
      suaHam: true,
      hamCuaEmCan: ['move', 'forward', 'slide_r', 'lob', 'aim_lob', 'lob_pad'],
      deBai: 'Hàm `smart_pad()` có sẵn đang bị lỗi: ở nhánh `else:`, ai đó đã viết `lob_pad(2)` thay vì `lob_pad(3)`, khiến viên đá vuông rơi ngay vào ô cổng `C` thay vì bay tới nút đè `M` cách 3 ô! Hãy sửa `lob_pad(2)` thành `lob_pad(3)` trong thân hàm `smart_pad()`.',
      veMaMau: 'Tìm dòng lob_pad(2) trong hàm smart_pad() và sửa số 2 thành 3.',
      goiY: [
        'Nút đè M nằm cách vị trí đứng của R1 đúng 3 ô (sau viên đá và cổng C).',
        'Đổi lob_pad(2) thành lob_pad(3) ở dòng cuối của hàm smart_pad().'
      ],
      san: [
        [
          '########',
          '#....M.#',
          '#....CF#',
          '#....o.#',
          '#..u>..#',
          '#..o...#',
          '#......#',
          '########'
        ],
        [
          '########',
          '#......#',
          '#....uF#',
          '#..M.o.#',
          '#..C>..#',
          '#..o...#',
          '#......#',
          '########'
        ]
      ],
      vatDang: [
        [
          '........',
          '........',
          '........',
          '.....s..',
          '........',
          '...r....',
          '........',
          '........'
        ],
        [
          '........',
          '........',
          '........',
          '.....r..',
          '........',
          '...s....',
          '........',
          '........'
        ]
      ],
      batDau: { x: 3, y: 6, huong: 0 },
      maMau: bai(['smart_pad()', 'slide_r(1)', 'smart_pad()', 'slide_r(1)'], {
        hamCuaEmMoi: [H('smart_pad', [], ['s = shape("front")', 'if s == "round":', '    aim_lob(2)', '    forward(2)', 'else:', '    lob_pad(2)'])]
      }),
      loiGiai: bai(['smart_pad()', 'slide_r(1)', 'smart_pad()', 'slide_r(1)'], {
        hamCuaEmMoi: [H('smart_pad', [], T_SMART_PAD)]
      }),
      sao: { o: 25, nhip: 20 },
      loiSai: [
        { moTa: 'Chưa sửa lob_pad(2) thành lob_pad(3) nên đá vuông không bay tới nút đè M và R1 đâm vào cổng C đang đóng', baiLam: bai(['smart_pad()', 'slide_r(1)', 'smart_pad()', 'slide_r(1)'], { hamCuaEmMoi: [H('smart_pad', [], ['s = shape("front")', 'if s == "round":', '    aim_lob(2)', '    forward(2)', 'else:', '    lob_pad(2)'])] }), hamCuaEmMoi: [H('smart_pad', [], ['s = shape("front")', 'if s == "round":', '    aim_lob(2)', '    forward(2)', 'else:', '    lob_pad(2)'])], phaiCoMa: ['dam-tuong'] },
        { moTa: 'Đổi nhầm điều kiện "round" thành "square" nên hất đá vuông vào hố u không lấp được hố', baiLam: bai(['smart_pad()', 'slide_r(1)', 'smart_pad()', 'slide_r(1)'], { hamCuaEmMoi: [H('smart_pad', [], ['s = shape("front")', 'if s == "square":', '    aim_lob(2)', '    forward(2)', 'else:', '    lob_pad(3)'])] }), hamCuaEmMoi: [H('smart_pad', [], ['s = shape("front")', 'if s == "square":', '    aim_lob(2)', '    forward(2)', 'else:', '    lob_pad(3)'])], phaiCoMa: ['roi-ho'], cung: true }
      ],
      loiBinh: 'Chỉ một con số tầm hất đúng chuẩn giúp smart_pad() mở toang cánh cổng sắt trên cả hai sân!'
    }),

    /* ---- Màn 19 (che-mo-cu.9): Phối hợp smart_pad() và diag_pad(3) (2 sân) ---- */
    manMC({
      id: 6819, chuong: 'che-mo-cu', so: 9, ma: 'che-mo-cu.9',
      ten: 'Lối chính phối hợp lối bên', hang: 'thu-thach',
      hamCuaEmCan: ['move', 'forward', 'lob', 'aim_lob', 'lob_pad', 'diag_pad', 'smart_pad'],
      deBai: 'Trên hai sân, tầng dưới có hố `u` hoặc cổng `C` thẳng trục chính (dùng `smart_pad()`), còn tầng trên có cổng `C` ở `(3, 2)` được điều khiển bởi nút đè `M` nằm lệch sang cột bên phải `(4, 1)` (dùng `diag_pad(3)`). Hãy gọi `smart_pad()`, sau đó gọi `diag_pad(3)` và `forward(3)` để vào cờ `F`!',
      veMaMau: 'Sau smart_pad(), hãy thêm diag_pad(3) và forward(3).',
      goiY: [
        'smart_pad() đưa R1 từ (3, 7) lên (3, 5).',
        'Tại (3, 5), gọi diag_pad(3) để lách chéo sang (4, 4), hất đá ở (4, 3) qua rào = lên nút M ở (4, 1) rồi lách chéo trái về (3, 3); cuối cùng gọi forward(3) vào cờ F ở (3, 1).'
      ],
      san: [
        [
          '#######',
          '#..FM.#',
          '#..C=.#',
          '#...o.#',
          '#.....#',
          '#..u..#',
          '#..o..#',
          '#.....#',
          '#######'
        ],
        [
          '#######',
          '#..FM.#',
          '#..C=.#',
          '#...o.#',
          '#..M..#',
          '#..C..#',
          '#..o..#',
          '#.....#',
          '#######'
        ]
      ],
      vatDang: [
        [
          '.......',
          '.......',
          '.......',
          '....s..',
          '.......',
          '.......',
          '...r...',
          '.......',
          '.......'
        ],
        [
          '.......',
          '.......',
          '.......',
          '....s..',
          '.......',
          '.......',
          '...s...',
          '.......',
          '.......'
        ]
      ],
      noi: [
        [{ nut: { x: 4, y: 1 }, cua: [{ x: 3, y: 2 }] }],
        [
          { nut: { x: 3, y: 4 }, cua: [{ x: 3, y: 5 }] },
          { nut: { x: 4, y: 1 }, cua: [{ x: 3, y: 2 }] }
        ]
      ],
      batDau: { x: 3, y: 7, huong: 0 },
      maMau: bai(['smart_pad()']),
      loiGiai: bai(['smart_pad()', 'diag_pad(3)', 'forward(3)']),
      sao: { o: 24, nhip: 20 },
      loiSai: [
        { moTa: 'Chưa gọi diag_pad(3) và forward(3) sau khi vượt tầng đầu', baiLam: bai(['smart_pad()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Dùng aim_lob(2) và forward(2) cố định thay cho smart_pad() nên ở sân 2 đâm vào cổng C tầng dưới', baiLam: bai(['aim_lob(2)', 'forward(2)', 'diag_pad(3)', 'forward(3)']), phaiCoMa: ['dam-tuong'], cung: true }
      ],
      loiBinh: 'Kết hợp smart_pad() trên trục chính và diag_pad(3) ở sườn bên giúp R1 phá giải mọi chốt chặn của mỏ đá cũ!'
    }),

    /* ---- Màn 20 (che-mo-cu.10): Trùm chương 2 (2 sân, huy hiệu che-mo-cu) ---- */
    manMC({
      id: 6820, chuong: 'che-mo-cu', so: 10, ma: 'che-mo-cu.10',
      ten: 'Trùm chế lệnh: Mở thông hầm mỏ cũ', hang: 'trum',
      huyHieu: 'che-mo-cu',
      hamCuaEmCan: ['move', 'forward', 'slide_r', 'lob', 'aim_lob', 'lob_pad', 'spin_pad', 'smart_pad'],
      deBai: 'Trùm cuối Gói 8! Từ đáy hầm `(2, 8)`, hãy lặp 2 bậc thang (`for i in range(2):`) với `smart_pad()` và `slide_r(1)` (mượn băng chuyền `>`) để vượt qua chuỗi hố sâu và cổng sắt lên tới `(6, 4)` ngay dưới bàn xoay `@` ở `(6, 3)`. Tại đây, hãy gọi `spin_pad(2)` để bước lên bàn xoay, quay sang phải hất đá đè nút `M` ở `(8, 3)` mở cổng `C` ở `(7, 3)`, rồi gọi `move()` và `slide_r(1)` vào cờ `F`!',
      veMaMau: 'Lặp 2 lần smart_pad() và slide_r(1), sau đó gọi spin_pad(2), move() và slide_r(1).',
      goiY: [
        'Viết vòng lặp for i in range(2): gồm smart_pad() và slide_r(1) để leo 2 bậc thang từ (2, 8) lên (6, 4).',
        'Sau vòng lặp, gọi spin_pad(2) để bước lên bàn xoay @ ở (6, 3) và hất đá mở cổng C ở (7, 3), rồi gọi move() và slide_r(1) vào cờ F ở (7, 4).'
      ],
      san: [
        [
          '##########',
          '#........#',
          '#........#',
          '#...M.@CM#',
          '#...C>.F.#',
          '#...o#...#',
          '#.u>.....#',
          '#.o#.....#',
          '#........#',
          '##########'
        ],
        [
          '##########',
          '#........#',
          '#........#',
          '#.....@CM#',
          '#...u>.F.#',
          '#.M.o#...#',
          '#.C>.....#',
          '#.o#.....#',
          '#........#',
          '##########'
        ]
      ],
      vatDang: [
        [
          '..........',
          '..........',
          '..........',
          '..........',
          '..........',
          '....s.....',
          '..........',
          '..r.......',
          '..........',
          '..........'
        ],
        [
          '..........',
          '..........',
          '..........',
          '..........',
          '..........',
          '....r.....',
          '..........',
          '..s.......',
          '..........',
          '..........'
        ]
      ],
      vatThem: [
        [{ x: 6, y: 3 }],
        [{ x: 6, y: 3 }]
      ],
      noi: [
        [
          { nut: { x: 4, y: 3 }, cua: [{ x: 4, y: 4 }] },
          { nut: { x: 8, y: 3 }, cua: [{ x: 7, y: 3 }] }
        ],
        [
          { nut: { x: 2, y: 5 }, cua: [{ x: 2, y: 6 }] },
          { nut: { x: 8, y: 3 }, cua: [{ x: 7, y: 3 }] }
        ]
      ],
      batDau: { x: 2, y: 8, huong: 0 },
      maMau: bai(['for i in range(2):', '    smart_pad()', '    slide_r(1)']),
      loiGiai: bai(['for i in range(2):', '    smart_pad()', '    slide_r(1)', 'spin_pad(2)', 'move()', 'slide_r(1)']),
      sao: { o: 33, nhip: 30 },
      loiSai: [
        { moTa: 'Chưa gọi spin_pad(2), move() và slide_r(1) tại bàn xoay đỉnh hầm', baiLam: bai(['for i in range(2):', '    smart_pad()', '    slide_r(1)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Dùng aim_lob(2) và forward(2) cố định thay cho smart_pad() nên đâm vào cổng C trên cả hai sân', baiLam: bai(['for i in range(2):', '    aim_lob(2)', '    forward(2)', '    slide_r(1)', 'spin_pad(2)', 'move()', 'slide_r(1)']), phaiCoMa: ['dam-tuong'], cung: true }
      ],
      loiBinh: 'Chúc mừng! Em đã hoàn thành xuất sắc Gói 8 Mỏ đá cũ và làm chủ mọi cơ cấu cổng sắt, băng chuyền, bàn xoay trong hầm mỏ!'
    })
  ];

  ManHoc.manMoCu = DS;
})();
