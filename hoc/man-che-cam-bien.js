/* ============================================================================
   man-che-cam-bien.js — "Đường học": CHƯƠNG `che-cam-bien` · CHẾ LỆNH CÓ if, while + BIẾN ĐẾM (10 màn). Kế hoạch "Chế lệnh" 14/10 (KE-HOACH-CHE-LENH.md, mục 5.3).
   Chương thứ 9 (sau Cảm biến khoảng cách). Robot là XE HAI BÁNH gắn CẢM BIẾN KHOẢNG CÁCH ở hông (như chương khoang-cach), 9 và 10 có thêm TAY KẸP:
   robot { than: 'hai-banh', tay: null | 'kep', camBien: [{ ma: 'khoang-cach', o: 'hong' }] }.
   Chỉ dùng hàm của em từ chương 2, 3, 4 (pick, drop), 6 và 8 (go_wall); KHÔNG dùng hàm của che-tay / che-lap (hai chương làm song song).
   Luật thiết kế (như che-xe): lệnh gốc chỉ đổi MỘT trạng thái; lệnh biết nhìn (if, while) và biết đếm (biến) là thứ NGƯỜI CHƠI TỰ CHẾ.
   Mỗi lệnh chế được ít nhất hai cách và cả hai đều thắng: `congThucKhac: [{ moTa, hamCuaEmMoi, baiLam? }]` (máy kiểm kiem-che-cam-bien.mjs chạy từng cách).

   Màn chế lệnh có cảm biến chấm trên BA SÂN (man.san là MẢNG 3 sân, batDau và bongMo song song, nhipTheo 'tong'): một chương trình viết cứng số bước chỉ đúng một sân.
   Chương trình chính cố định (chinhCoDinh) ở mọi màn trừ 3 (Mê cung nhỏ) và 10 (Kho hàng, trùm): người chơi tự viết chương trình chính ở hai màn đó.
   Mục tiêu 'bong-mo' (xe mờ) ở 1, 2, 4, 5, 7, 9, 10 (màn 5 có thêm ◆ ở ô sát tường, không thì xe đứng yên cũng về "đúng chỗ cũ"); tới cờ ở 3, 6, 8. Sao: sao.nhip = TỔNG nhịp ba sân; ở 2, 3, 6, 9, 10 khai nhipTheoLoiGiai (lời giải chuẩn quay / đi vòng nên dài hơn
   đường ngắn nhất của bộ dò do-duong-che-cam-bien.mjs; máy kiểm chỉ đòi BFS ≤ sao.nhip). Hướng: 0 lên, 1 phải, 2 xuống, 3 trái. (x, y) với y = 0 ở hàng trên.

   Hàm của em MỚI (tên cốt truyện, khóa trong kho):
     che-cam-bien.1 safe_move()    = if front_clear(): move()                        tiến một ô nếu trước mặt trống, không thì đứng yên (0 nhịp khi bị chắn)
     che-cam-bien.2 face_open()    = while not front_clear(): turn_right()           quay phải cho tới khi trước mặt trống
     che-cam-bien.4 to_gap()       = while not right_clear(): move()                 đi thẳng cho tới khi bên phải xe trống (có cửa)
     che-cam-bien.5 bounce()       = n = 0; while front_clear(): move(), n = n + 1; for i in range(n): back()   tới tường rồi lùi về đúng chỗ cũ (BIẾN ĐẾM)
     che-cam-bien.6 follow_right() = một bước bám tường phải (if / elif / else)
     che-cam-bien.9 fetch_back()   = đếm bước tới vật, pick(), lùi n ô, drop()       lấy vật cuối hành lang về đặt trước chỗ cũ
   HÀM CỦA MÀN (15/10: hàm chỉ đúng cho MỘT màn thì không vào kho, người chơi tự viết / sửa thân trong màn; `maMau.hamCuaMan`, không `taoHam`, không có trong Sổ lệnh):
     che-cam-bien.7 safe_move2()   thân ban đầu = safe_move() (if front_clear(): move(); sai vì cảm biến lắp ngược, daoChieu ['cam']); lời giải if not front_clear(): move()
     che-cam-bien.8 to_door()      hỏng điều kiện left_clear; sửa thành right_clear
   Màn 3 và 10 là màn dùng.

   BIẾN ĐẾM (man.bienDem = true từ màn 5): khay hiện nhóm ĐẾM (n = 0, n = n + 1, for i in range(n)); khung.chanBien = true ở 1–4 (chưa dạy biến): khung-code.js báo cau-truc-chua-hoc
   nếu chương trình / hàm của màn dùng gán biến hay range(biến). cauTruc luôn ['for', 'if', 'while'] (chương này dạy if, while sau khi đã học ở chương 8).
   Màn 7: man.daoChieu ['cam'] + canhBao 'Cảm biến lắp ngược' (san-hoc.js, phần ĐẤU DÂY NGƯỢC).
   Màn 10 khai gioiHanHam 3: chương trình chính chỉ được gọi trực tiếp 3 hàm của em khác nhau; huy hiệu `che-cam-bien`.

   Nối tiếp man-chuoi-1.js vào cùng window.ManHoc. Thứ tự chương: thu-tu-chuong.js.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var TAY = ['arm_down', 'arm_up', 'grab', 'release'];
  var FRONT = ['front_clear'];
  var TRUOC_PHAI = ['front_clear', 'right_clear'];
  var BA_HUONG = ['front_clear', 'left_clear', 'right_clear'];

  function H(ten, than) { return { ten: ten, thamSo: [], than: than.slice() }; }
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  function lap(s, n) { var kq = []; for (var i = 0; i < n; i++) kq.push(s); return kq; }
  /** Vòng for lặp các lệnh `lenh` (chuỗi hoặc mảng) `n` lần. */
  function LAP(n, lenh) {
    var ds = Array.isArray(lenh) ? lenh : [lenh];
    return ['for i in range(' + n + '):'].concat(ds.map(function (s) { return '    ' + s; }));
  }

  // thân các hàm chế (cách 1, cách người chơi thường chọn)
  var T_SAFE_MOVE = ['if front_clear():', '    move()'];
  var T_FACE_OPEN = ['while not front_clear():', '    turn_right()'];
  var T_TO_GAP = ['while not right_clear():', '    move()'];
  var T_BOUNCE = ['n = 0', 'while front_clear():', '    move()', '    n = n + 1', 'for i in range(n):', '    back()'];
  var T_FOLLOW_RIGHT = ['if right_clear():', '    turn_right()', '    move()', 'elif front_clear():', '    move()', 'else:', '    turn_left()'];
  var T_SAFE_MOVE2 = ['if not front_clear():', '    move()'];
  // thân ban đầu của safe_move2() ở 9.7: chép safe_move(), chạy sai vì cảm biến lắp ngược
  var T_SAFE_MOVE2_CU = T_SAFE_MOVE;
  var T_FETCH_BACK = ['n = 0', 'while front_clear():', '    move()', '    n = n + 1', 'pick()', 'for i in range(n):', '    back()', 'drop()'];
  // hàm của màn 8 (hỏng: hỏi bên trái trong khi cửa ở bên phải) và bản sửa
  var T_TO_DOOR_HONG = ['while not left_clear():', '    move()'];
  var T_TO_DOOR = ['while not right_clear():', '    move()'];
  // thân lệnh bánh viết thẳng (không gọi hàm của em)
  var W_MOVE = ['left_move()', 'right_move()', 'wait()'];
  var W_BACK = ['left_back()', 'right_back()', 'wait()'];
  var W_RIGHT = ['left_move()', 'wait()'];

  // chương trình chính của từng màn (cố định hay lời giải)
  var C_1 = lap('safe_move()', 3);
  var C_2 = ['face_open()'];
  var L_3 = ['go_wall()', 'for i in range(3):', '    face_open()', '    go_wall()'];
  var C_4 = ['to_gap()'];
  var C_5 = ['bounce()'];
  var C_6 = LAP(60, 'follow_right()');
  var C_7 = lap('safe_move2()', 3);
  var C_8 = ['to_door()', 'turn_right()', 'go_wall()'];
  var C_9 = ['fetch_back()'];
  var L_10 = ['to_gap()', 'turn_right()', 'fetch_back()'];

  /**
   * m.cam: hàm cảm biến trên khay (FRONT mặc định); m.tay: true thì có tay kẹp (9, 10); m.coCo: true thì mục tiêu tới cờ (mặc định bóng mờ).
   * Ba trường này bị bỏ sau khi dùng. Màn 1–4 chặn biến (khung.chanBien), từ màn 5 có biến đếm (man.bienDem).
   */
  function man(m) {
    var tuyChon = { cam: m.cam, tay: m.tay, coCo: m.coCo };
    delete m.cam; delete m.tay; delete m.coCo;
    m.chuong = 'che-cam-bien';
    m.cauTruc = ['for', 'if', 'while'];
    m.loaiRobot = 'banh';
    m.robot = { than: 'hai-banh', tay: tuyChon.tay ? 'kep' : null, camBien: [{ ma: 'khoang-cach', o: 'hong' }] };
    m.hamGoc = nhieu(BANH, tuyChon.tay ? TAY : [], tuyChon.cam || FRONT);
    if (!tuyChon.coCo) m.mucTieu = 'bong-mo';
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    if (m.so >= 5) m.bienDem = true; else m.khung.chanBien = true;
    m.nhipTheo = 'tong';
    if (!Array.isArray(m.batDau)) m.batDau = m.san.map(function () { return Object.assign({}, m.batDau); });
    return ManHoc.chuanHoa(m);
  }

  /* ------------------------------------------------------------------- sân (dựng từ đường đi, kiểm bằng tay và bằng bộ dò) */

  // 1: ba phòng 5×6, xe đứng ở (2,5) quay lên; phía trước trống tới đầu sân / có khối chắn ở (2,3) / có khối chắn sát mặt (2,4)
  var SAN_1 = [
    ['.....', '.....', '.....', '.....', '.....', '.....'],
    ['.....', '.....', '.....', '..#..', '.....', '.....'],
    ['.....', '.....', '.....', '.....', '..#..', '.....']
  ];
  var BD_1 = { x: 2, y: 5, huong: 0 };
  var BM_1 = [{ x: 2, y: 2, huong: 0 }, { x: 2, y: 4, huong: 0 }, { x: 2, y: 5, huong: 0 }];

  // 2: ba ngõ cụt 5×5, xe đứng ở (2,2) quay lên (mặt vào tường); lối ra duy nhất ở bên phải / phía sau / bên trái
  var SAN_2 = [
    ['#####', '#####', '##...', '#####', '#####'],
    ['#####', '#####', '##.##', '##.##', '##.##'],
    ['#####', '#####', '...##', '#####', '#####']
  ];
  var BD_2 = { x: 2, y: 2, huong: 0 };
  var BM_2 = [{ x: 2, y: 2, huong: 1 }, { x: 2, y: 2, huong: 2 }, { x: 2, y: 2, huong: 3 }];

  // 3: ba mê cung nhỏ chỉ rẽ phải (1 khúc có ngõ cụt giả, 2 khúc, 3 khúc); xe ở chân hành lang quay lên
  var SAN_3 = [
    ['#######', '#####F#', '#.....#', '#.###.#', '#.###.#', '#.#####', '#.#####'],
    ['#######', '#.....#', '#.###.#', '#.###.#', '#.#F..#', '#.#####', '#.#####'],
    ['#######', '#....F#', '#.#####', '#.....#', '#.###.#', '#.###.#', '#.#####']
  ];
  var BD_3 = { x: 1, y: 6, huong: 0 };

  // 4: ba hành lang đứng 5×7, cửa bên phải ở y = 4 / 2 / 1; xe ở (1,6) quay lên
  var SAN_4 = [
    ['#####', '#.###', '#.###', '#.###', '#....', '#.###', '#.###'],
    ['#####', '#.###', '#....', '#.###', '#.###', '#.###', '#.###'],
    ['#####', '#....', '#.###', '#.###', '#.###', '#.###', '#.###']
  ];
  var BD_4 = { x: 1, y: 6, huong: 0 };
  var BM_4 = [{ x: 1, y: 4, huong: 0 }, { x: 1, y: 2, huong: 0 }, { x: 1, y: 1, huong: 0 }];

  // 5: ba hành lang đứng 3×7, xe ở (1,5) quay lên, sau lưng còn một ô; phía trước có 2 / 4 / 5 ô trống; ◆ ở ô sát tường (xe phải ghé rồi mới về, không thì xe đứng yên cũng thắng)
  var SAN_5 = [
    ['###', '###', '###', '#.#', '#.#', '#.#', '#.#'],
    ['###', '#.#', '#.#', '#.#', '#.#', '#.#', '#.#'],
    ['#.#', '#.#', '#.#', '#.#', '#.#', '#.#', '#.#']
  ];
  var BD_5 = { x: 1, y: 5, huong: 0 };
  var BM_5 = [3, 1, 0].map(function (y) { return { x: 1, y: 5, huong: 0, diQua: [{ x: 1, y: y }] }; });      // về đúng chỗ cũ, sau khi đã ghé ◆ ở ô sát tường

  // 6: ba mê cung hành lang không có vòng (bám tường phải luôn tới cờ F); xe xuất phát ở chỗ khác nhau
  var SAN_6 = [
    ['#######', '#...#F#', '#.#.#.#', '#.#...#', '#.#####', '#.....#', '#######'],
    ['#######', '#.#...#', '#.#.#.#', '#.#.#.#', '#...#.#', '#.###F#', '#######'],
    ['#######', '#F..#.#', '###.#.#', '#...#.#', '#.###.#', '#.....#', '#######']
  ];
  var BD_6 = [{ x: 1, y: 5, huong: 1 }, { x: 1, y: 1, huong: 2 }, { x: 5, y: 1, huong: 2 }];

  // 7: ba hành lang ngang 6×3, xe ở (0,1) quay phải; phía trước trống / khối chắn ở (2,1) / khối chắn sát mặt (1,1)
  var SAN_7 = [
    ['......', '......', '......'],
    ['......', '..#...', '......'],
    ['......', '.#....', '......']
  ];
  var BD_7 = { x: 0, y: 1, huong: 1 };
  var BM_7 = [{ x: 3, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }, { x: 0, y: 1, huong: 1 }];

  // 8: ba hành lang đứng, cửa bên phải ở y = 4 / 2 / 1, sau cửa là nhánh ngang dẫn tới cờ F; xe ở (1,6) quay lên
  var SAN_8 = [
    ['#####', '#.###', '#.###', '#.###', '#..F#', '#.###', '#.###'],
    ['#####', '#.###', '#...F', '#.###', '#.###', '#.###', '#.###'],
    ['#####', '#...F', '#.###', '#.###', '#.###', '#.###', '#.###']
  ];
  var BD_8 = { x: 1, y: 6, huong: 0 };

  // 9: ba hành lang đứng 3×7, vật 'o' nằm cuối (xe đi 2 / 4 / 5 ô tới sát vật); xe ở (1,6) quay lên; vật được đặt xuống ô trước mặt chỗ xuất phát
  var SAN_9 = [
    ['###', '###', '###', '#o#', '#.#', '#.#', '#.#'],
    ['###', '#o#', '#.#', '#.#', '#.#', '#.#', '#.#'],
    ['#o#', '#.#', '#.#', '#.#', '#.#', '#.#', '#.#']
  ];
  var BD_9 = { x: 1, y: 6, huong: 0 };
  var BM_9 = [1, 2, 3].map(function () { return { x: 1, y: 6, huong: 0, vat: [{ x: 1, y: 5 }] }; });

  // 10: ba kho: hành lang đứng (x = 2) có hốc cụt bên trái làm mồi, cửa bên phải dẫn vào nhánh ngang có hàng 'o' ở cuối (xe đi 1 / 2 / 3 ô tới sát hàng)
  var SAN_10 = [
    ['##.####', '##.####', '#..####', '##.####', '##..o##', '##.####', '##.####'],
    ['##.####', '##.####', '##...o#', '##.####', '#..####', '##.####', '##.####'],
    ['##.####', '##....o', '##.####', '#..####', '##.####', '##.####', '##.####']
  ];
  var BD_10 = { x: 2, y: 6, huong: 0 };
  var BM_10 = [
    { x: 2, y: 4, huong: 1, vat: [{ x: 3, y: 4 }] },
    { x: 2, y: 2, huong: 1, vat: [{ x: 3, y: 2 }] },
    { x: 2, y: 1, huong: 1, vat: [{ x: 3, y: 1 }] }
  ];

  var DS = [
    /* ------------------------------------------------------------ hàng 1: làm quen */
    man({
      so: 1, ten: 'Đi cẩn thận', hang: 'lam-quen',
      hamCuaEmCan: ['move'], taoHam: ['safe_move'],
      deBai: 'Chương trình chính gọi safe_move() ba lần. Em chế lệnh safe_move(): ô trước mặt trống thì xe tiến một ô, bị chắn thì xe đứng yên. Ở cả ba sân xe phải dừng đúng chỗ bóng mờ.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có ba dòng gọi safe_move(). Mở Xưởng hàm, tạo safe_move() rồi bấm Chạy.',
      san: SAN_1, batDau: BD_1, bongMo: BM_1,
      chinhCoDinh: true,
      maMau: { chinh: C_1.slice() },
      sao: { o: 8, nhip: 4 },
      loiGiai: { chinh: C_1.slice(), hamCuaEmMoi: [H('safe_move', T_SAFE_MOVE)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_1.slice() },
        hamCuaEmMoi: [H('safe_move', nhieu(['# hỏi rồi mới tiến'], T_SAFE_MOVE))]
      },
      congThucKhac: [
        { moTa: 'Viết thẳng lệnh bánh trong nhánh if, không gọi move()', hamCuaEmMoi: [H('safe_move', nhieu(['if front_clear():'], W_MOVE.map(function (s) { return '    ' + s; })))] },
        { moTa: 'Nhánh if chờ khi bị chắn, nhánh else mới tiến (sân bị chắn tốn thêm nhịp nên ít sao hơn)', hamCuaEmMoi: [H('safe_move', ['if not front_clear():', '    wait()', 'else:', '    move()'])] }
      ],
      loiSai: [
        { moTa: 'Gọi move() thẳng, không hỏi cảm biến: xe húc khối chắn nên tốn thêm nhịp, thiếu sao', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [H('safe_move', ['move()'])], phaiCoMa: ['dam-tuong'] },
        { moTa: 'Đảo điều kiện bằng not: xe tiến khi bị chắn và đứng yên khi trống', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [H('safe_move', ['if not front_clear():', '    move()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Nhánh if chỉ chờ, không bao giờ tiến', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [H('safe_move', ['if front_clear():', '    wait()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Gọi safe_move() mà chưa chế hàm', baiLam: { chinh: C_1.slice() }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Cảm biến front_clear() là True khi ô trước mặt đi vào được.', 'Hỏi trước, chỉ khi trống mới tiến: đó là việc của if.']
    }),

    man({
      so: 2, ten: 'Tìm lối mở', hang: 'lam-quen', nhipTheoLoiGiai: true,
      hamCuaEmCan: ['turn_right'], taoHam: ['face_open'],
      deBai: 'Xe đứng trong một ngõ cụt, mặt quay vào tường, chỉ có một lối ra. Chế lệnh face_open(): xe quay phải cho tới khi trước mặt trống. Ở cả ba sân xe phải quay mặt về lối ra như bóng mờ.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi face_open(). Mở Xưởng hàm, tạo face_open() rồi bấm Chạy.',
      san: SAN_2, batDau: BD_2, bongMo: BM_2,
      chinhCoDinh: true,
      maMau: { chinh: C_2.slice() },
      sao: { o: 5, nhip: 6 },
      loiGiai: { chinh: C_2.slice(), hamCuaEmMoi: [H('face_open', T_FACE_OPEN)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_2.slice() },
        hamCuaEmMoi: [H('face_open', nhieu(['# quay cho tới khi hết bị chắn'], T_FACE_OPEN))]
      },
      congThucKhac: [
        { moTa: 'Viết thẳng lệnh bánh trong vòng while, không gọi turn_right()', hamCuaEmMoi: [H('face_open', nhieu(['while not front_clear():'], W_RIGHT.map(function (s) { return '    ' + s; })))] },
        { moTa: 'Quay trái thay vì quay phải (ba sân vẫn đủ nhịp: 3 + 2 + 1)', hamCuaEmMoi: [H('face_open', ['while not front_clear():', '    turn_left()'])] },
        { moTa: 'Vòng for chứa if: lặp tối đa 3 lần, cứ bị chắn thì quay', hamCuaEmMoi: [H('face_open', nhieu(LAP(3, ['if not front_clear():', '    turn_right()'])))] }
      ],
      loiSai: [
        { moTa: 'Dùng if thay while: chỉ quay được một lần nên hai sân sau vẫn quay mặt vào tường', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [H('face_open', ['if not front_clear():', '    turn_right()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đảo điều kiện: while front_clear() không chạy lần nào vì trước mặt đang bị chắn', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [H('face_open', ['while front_clear():', '    turn_right()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Thân vòng chỉ chờ, không quay: điều kiện không bao giờ đổi', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [H('face_open', ['while not front_clear():', '    wait()'])], phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Đếm cứng một lần quay: chỉ đúng sân đầu', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [H('face_open', ['turn_right()'])], phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Số lần quay mỗi sân một khác, nên đừng đếm: để cảm biến báo.', 'Còn bị chắn thì quay tiếp: điều kiện của while có chữ not.']
    }),

    man({
      so: 3, ten: 'Mê cung nhỏ', hang: 'lam-quen', nhipTheoLoiGiai: true, coCo: true,
      hamCuaEmCan: ['go_wall', 'face_open'],
      deBai: 'Ba mê cung nhỏ, khúc quẹo nào cũng rẽ phải. Dùng go_wall() và face_open() em đã chế để đưa xe tới cờ ở cả ba sân; chương trình chỉ có 10 ô.',
      san: SAN_3, batDau: BD_3,
      maMau: { chinh: [] },
      sao: { o: 13, nhip: 44 },
      loiGiai: { chinh: L_3.slice() },
      loiGiaiKhac: {
        moTa: 'Không dùng vòng for: gọi từng cặp go_wall() và face_open() ba lần',
        baiLam: { chinh: ['go_wall()', 'face_open()', 'go_wall()', 'face_open()', 'go_wall()', 'face_open()', 'go_wall()'] }
      },
      congThucKhac: [
        { moTa: 'Vòng for lặp cặp lệnh năm lần: sân nào tới cờ trước thì dừng', baiLam: { chinh: nhieu(['go_wall()'], LAP(5, ['face_open()', 'go_wall()'])) } }
      ],
      loiSai: [
        { moTa: 'Chỉ đi thẳng: xe dừng ở khúc quẹo đầu tiên', baiLam: { chinh: ['go_wall()'] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Lặp thiếu một lần: xe dừng trước đoạn cuối', baiLam: { chinh: nhieu(['go_wall()'], LAP(2, ['face_open()', 'go_wall()'])) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên tìm lối mở sau mỗi lần đi thẳng: xe húc tường', baiLam: { chinh: nhieu(['go_wall()'], LAP(3, ['go_wall()'])) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Viết từng bước, không dùng lệnh đã chế: quá 10 ô', baiLam: { chinh: lap('move()', 11) }, phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['Đi hết đường thẳng, tìm lối mở, rồi lại đi: lặp lại cặp đó.', 'Xe tới cờ là chương trình dừng ngay, nên lặp dư vài lần cũng không sao.']
    }),

    /* ------------------------------------------------------------ hàng 2: luyện */
    man({
      so: 4, ten: 'Cửa hông', hang: 'luyen', cam: TRUOC_PHAI,
      hamCuaEmCan: ['move'], taoHam: ['to_gap'],
      deBai: 'Mỗi hành lang có một cửa mở ra bên phải, xa gần khác nhau. Chế lệnh to_gap(): xe đi thẳng cho tới khi bên phải xe trống, và dừng đúng chỗ bóng mờ.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi to_gap(). Mở Xưởng hàm, tạo to_gap() rồi bấm Chạy.',
      san: SAN_4, batDau: BD_4, bongMo: BM_4,
      chinhCoDinh: true,
      maMau: { chinh: C_4.slice() },
      sao: { o: 6, nhip: 11 },
      loiGiai: { chinh: C_4.slice(), hamCuaEmMoi: [H('to_gap', T_TO_GAP)] },
      loiGiaiKhac: {
        moTa: 'Vòng for chứa if: lặp tối đa 9 lần, bên phải còn là tường thì tiến',
        baiLam: { chinh: C_4.slice() },
        hamCuaEmMoi: [H('to_gap', LAP(9, ['if not right_clear():', '    move()']))]
      },
      congThucKhac: [
        { moTa: 'Viết thẳng lệnh bánh trong vòng while, không gọi move()', hamCuaEmMoi: [H('to_gap', nhieu(['while not right_clear():'], W_MOVE.map(function (s) { return '    ' + s; })))] }
      ],
      loiSai: [
        { moTa: 'Hỏi nhầm phía trước: xe đi tới tận tường bỏ qua cửa', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [H('to_gap', ['while front_clear():', '    move()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quên chữ not: bên phải đang là tường nên vòng không chạy lần nào', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [H('to_gap', ['while right_clear():', '    move()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Thân vòng chỉ chờ, không tiến: điều kiện không bao giờ đổi', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [H('to_gap', ['while not right_clear():', '    wait()'])], phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Đếm cứng hai ô theo sân đầu: hai sân sau xe dừng quá sớm', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [H('to_gap', ['move()', 'move()'])], phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['right_clear() hỏi ô bên phải xe có trống không.', 'Bên phải còn là tường thì xe cứ đi tiếp.']
    }),

    man({
      so: 5, ten: 'Đi rồi về', hang: 'luyen',
      hamCuaEmCan: ['move', 'back'], taoHam: ['bounce'],
      deBai: 'Xe đi thẳng tới sát tường rồi về đúng chỗ xuất phát, mặt vẫn quay lên như bóng mờ. Hành lang mỗi sân dài một khác, nên em chế lệnh bounce() và dùng một biến n để đếm số ô xe đã đi. Gán n = 0 lúc đầu, mỗi ô đi thêm thì n = n + 1.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi bounce(). Mở Xưởng hàm, tạo bounce() rồi bấm Chạy.',
      san: SAN_5, batDau: BD_5, bongMo: BM_5,
      chinhCoDinh: true,
      maMau: { chinh: C_5.slice() },
      sao: { o: 13, nhip: 22 },
      loiGiai: { chinh: C_5.slice(), hamCuaEmMoi: [H('bounce', T_BOUNCE)] },
      loiGiaiKhac: {
        moTa: 'Vòng for chứa if cho tối đa 9 lượt hỏi, thay cho vòng while',
        baiLam: { chinh: C_5.slice() },
        hamCuaEmMoi: [H('bounce', nhieu(['n = 0'], LAP(9, ['if front_clear():', '    move()', '    n = n + 1']), ['for i in range(n):', '    back()']))]
      },
      congThucKhac: [
        { moTa: 'Quay đầu hai lần thay cho lùi (đúng chỗ nhưng tốn thêm nhịp quay đầu nên ít sao hơn)', hamCuaEmMoi: [H('bounce', ['n = 0', 'while front_clear():', '    move()', '    n = n + 1', 'u_turn()', 'for i in range(n):', '    move()', 'u_turn()'])] },
        { moTa: 'Lùi bằng lệnh bánh viết thẳng', hamCuaEmMoi: [H('bounce', nhieu(['n = 0', 'while front_clear():', '    move()', '    n = n + 1', 'for i in range(n):'], W_BACK.map(function (s) { return '    ' + s; })))] }
      ],
      loiSai: [
        { moTa: 'Không đếm, về bằng go_wall() sau khi quay đầu: xe chạy quá chỗ xuất phát', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [H('bounce', ['while front_clear():', '    move()', 'u_turn()', 'go_wall()', 'u_turn()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quên tăng n trong vòng while: n luôn bằng 0 nên xe không về', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [H('bounce', ['n = 0', 'while front_clear():', '    move()', 'for i in range(n):', '    back()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đặt n = 0 bên trong vòng while: mỗi lượt n lại về 0', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [H('bounce', ['while front_clear():', '    n = 0', '    move()', '    n = n + 1', 'for i in range(n):', '    back()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Lùi n + 1 ô: xe chạy quá chỗ xuất phát một ô', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [H('bounce', ['n = 1', 'while front_clear():', '    move()', '    n = n + 1', 'for i in range(n):', '    back()'])], phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Biến n nhớ số ô đã đi: bắt đầu bằng 0, mỗi lần tiến thì tăng thêm một.', 'Lúc về, lặp lại đúng n lần: vòng for có thể lặp n lần.']
    }),

    man({
      so: 6, ten: 'Bám tường', hang: 'luyen', nhipTheoLoiGiai: true, coCo: true, cam: TRUOC_PHAI,
      hamCuaEmCan: ['move', 'turn_right', 'turn_left'], taoHam: ['follow_right'],
      deBai: 'Xe lạc trong mê cung và phải bám tường bên tay phải để tới cờ. Chương trình chính chỉ lặp follow_right(); em chế một bước đi đó: bên phải trống thì rẽ phải rồi tiến, không thì tiến nếu trước mặt trống, còn không thì rẽ trái.',
      veMaMau: 'Chương trình chính bị khóa, lặp follow_right() sáu mươi lần. Mở Xưởng hàm, tạo follow_right() rồi bấm Chạy.',
      san: SAN_6, batDau: BD_6,
      chinhCoDinh: true,
      maMau: { chinh: C_6.slice() },
      sao: { o: 16, nhip: 70 },
      loiGiai: { chinh: C_6.slice(), hamCuaEmMoi: [H('follow_right', T_FOLLOW_RIGHT)] },
      loiGiaiKhac: {
        moTa: 'Lồng một if trong nhánh else',
        baiLam: { chinh: C_6.slice() },
        hamCuaEmMoi: [H('follow_right', ['if right_clear():', '    turn_right()', '    move()', 'else:', '    if front_clear():', '        move()', '    else:', '        turn_left()'])]
      },
      congThucKhac: [
        { moTa: 'Hai if liền nhau: rẽ phải nếu bên phải trống, rồi tiến nếu trước mặt trống không thì rẽ trái', hamCuaEmMoi: [H('follow_right', ['if right_clear():', '    turn_right()', 'if front_clear():', '    move()', 'else:', '    turn_left()'])] }
      ],
      loiSai: [
        { moTa: 'Không hỏi bên phải (chỉ rẽ phải khi gặp tường): xe lạc vào ngõ cụt', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [H('follow_right', ['if front_clear():', '    move()', 'else:', '    turn_right()'])], phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Bên phải trống mà chỉ tiến, không rẽ: xe bỏ qua lối rẽ', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [H('follow_right', ['if right_clear():', '    move()', 'elif front_clear():', '    move()', 'else:', '    turn_left()'])], phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Rẽ phải xong không tiến: xe quay tại chỗ mãi', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [H('follow_right', ['if right_clear():', '    turn_right()', 'elif front_clear():', '    move()', 'else:', '    turn_left()'])], phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Thiếu nhánh else: gặp ngõ cụt xe đứng yên mãi', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [H('follow_right', ['if right_clear():', '    turn_right()', '    move()', 'elif front_clear():', '    move()'])], phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Thứ tự hỏi quan trọng: bên phải trước, rồi phía trước, cuối cùng mới rẽ trái.', 'Rẽ phải xong thì tiến luôn một ô vào lối vừa tìm thấy.']
    }),

    /* ------------------------------------------------------------ hàng 3: biến thể */
    man({
      so: 7, ten: 'Cảm biến lắp ngược', hang: 'bien-the',
      hamCuaEmCan: ['move'],
      daoChieu: ['cam'], canhBao: 'Cảm biến lắp ngược',
      deBai: 'Cảm biến của xe bị lắp ngược: front_clear() báo True khi trước mặt bị chắn và False khi trống. Hàm safe_move2() của màn viết theo cách cũ nên chạy sai: sửa nó để xe vẫn tiến một ô khi trống và đứng yên khi bị chắn.',
      veMaMau: 'Chương trình chính bị khóa, gọi safe_move2() ba lần. Thân hàm safe_move2() của màn đang giống safe_move() cũ của em, sẽ sai với cảm biến này: thử nó trong sân thử của Xưởng hàm.',
      san: SAN_7, batDau: BD_7, bongMo: BM_7,
      chinhCoDinh: true,
      maMau: { chinh: C_7.slice(), hamCuaMan: [H('safe_move2', T_SAFE_MOVE2_CU)] },
      sao: { o: 8, nhip: 4 },
      loiGiai: { chinh: C_7.slice(), hamCuaMan: [H('safe_move2', T_SAFE_MOVE2)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách sửa, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_7.slice(), hamCuaMan: [H('safe_move2', nhieu(['# cảm biến báo ngược nên có not'], T_SAFE_MOVE2))] }
      },
      congThucKhac: [
        { moTa: 'Viết thẳng lệnh bánh trong nhánh if, không gọi move()', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('safe_move2', nhieu(['if not front_clear():'], W_MOVE.map(function (s) { return '    ' + s; })))] } },
        { moTa: 'Nhánh if chờ khi cảm biến báo True, nhánh else mới tiến (sân bị chắn tốn thêm nhịp nên ít sao hơn)', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('safe_move2', ['if front_clear():', '    wait()', 'else:', '    move()'])] } }
      ],
      loiSai: [
        { moTa: 'Để nguyên thân cũ (giống safe_move()): cảm biến báo ngược nên xe đứng yên ở chỗ trống', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('safe_move2', T_SAFE_MOVE2_CU)] }, phaiCoMa: ['lech-bong-mo', 'cam-bien-nguoc'] },
        { moTa: 'Không hỏi cảm biến, gọi move() thẳng: xe húc khối chắn nên tốn thêm nhịp, thiếu sao', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('safe_move2', ['move()'])] }, phaiCoMa: ['dam-tuong'] },
        { moTa: 'Nhánh if chỉ chờ, không bao giờ tiến', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('safe_move2', ['if not front_clear():', '    wait()'])] }, phaiCoMa: ['lech-bong-mo', 'cam-bien-nguoc'] },
        { moTa: 'Xóa mất hàm safe_move2() của màn: lệnh gọi nó không còn hàm nào', baiLam: { chinh: C_7.slice() }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Thử hàm safe_move2() trong sân thử: cảm biến báo True ở chỗ nào, False ở chỗ nào?', 'Muốn có câu trả lời đúng thì đảo kết quả của cảm biến bằng not.']
    }),

    man({
      so: 8, ten: 'Sửa hàm lỗi', hang: 'bien-the', coCo: true, cam: BA_HUONG,
      hamCuaEmCan: ['turn_right', 'go_wall', 'move'],
      deBai: 'Hàm to_door() của màn phải đưa xe tới cửa bên phải, nhưng nó chạy mãi không dừng. Tìm chỗ sai trong hàm và sửa, để xe qua cửa rồi tới cờ.',
      veMaMau: 'Chương trình chính bị khóa: to_door(), turn_right(), go_wall(). Mở hàm to_door() của màn trong Xưởng hàm để sửa.',
      san: SAN_8, batDau: BD_8,
      chinhCoDinh: true,
      maMau: { chinh: C_8.slice(), hamCuaMan: [H('to_door', T_TO_DOOR_HONG)] },
      sao: { o: 12, nhip: 22 },
      loiGiai: { chinh: C_8.slice(), hamCuaMan: [H('to_door', T_TO_DOOR)] },
      loiGiaiKhac: {
        moTa: 'Sửa bằng cách viết thẳng lệnh bánh trong vòng while',
        baiLam: { chinh: C_8.slice(), hamCuaMan: [H('to_door', nhieu(['while not right_clear():'], W_MOVE.map(function (s) { return '    ' + s; })))] }
      },
      congThucKhac: [
        { moTa: 'Viết lại bằng vòng for chứa if, lặp tối đa 9 lần', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('to_door', LAP(9, ['if not right_clear():', '    move()']))] } }
      ],
      loiSai: [
        { moTa: 'Chưa sửa gì: cửa ở bên phải mà hàm hỏi bên trái nên vòng while chạy mãi', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('to_door', T_TO_DOOR_HONG)] }, phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Sửa thành hỏi phía trước: xe đi tới tận tường bỏ qua cửa', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('to_door', ['while front_clear():', '    move()'])] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Sửa đúng bên nhưng bỏ chữ not: bên phải đang là tường nên vòng không chạy lần nào', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('to_door', ['while right_clear():', '    move()'])] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Thân vòng chỉ chờ, không tiến: điều kiện không bao giờ đổi', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('to_door', ['while not right_clear():', '    wait()'])] }, phaiCoMa: ['vong-vo-han'] }
      ],
      goiY: ['Cửa mở ra bên nào, còn hàm đang hỏi bên nào?', 'Bấm Chạy: xe có dừng ở cửa không?']
    }),

    man({
      so: 9, ten: 'Lấy rồi về', hang: 'bien-the', nhipTheoLoiGiai: true, tay: true,
      hamCuaEmCan: ['move', 'back', 'pick', 'drop'], taoHam: ['fetch_back'],
      deBai: 'Một vật nằm cuối hành lang. Chế lệnh fetch_back(): xe đi tới sát vật, nhặt vật, lùi về đúng chỗ cũ rồi đặt vật xuống trước mặt, giống bóng mờ. Hành lang ba sân dài ngắn khác nhau.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi fetch_back(). Mở Xưởng hàm, tạo fetch_back() rồi bấm Chạy.',
      san: SAN_9, batDau: BD_9, bongMo: BM_9,
      chinhCoDinh: true,
      maMau: { chinh: C_9.slice() },
      sao: { o: 25, nhip: 34 },
      loiGiai: { chinh: C_9.slice(), hamCuaEmMoi: [H('fetch_back', T_FETCH_BACK)] },
      loiGiaiKhac: {
        moTa: 'Đếm trong vòng for chứa if, cho tối đa 9 lượt hỏi',
        baiLam: { chinh: C_9.slice() },
        hamCuaEmMoi: [H('fetch_back', nhieu(['n = 0'], LAP(9, ['if front_clear():', '    move()', '    n = n + 1']), ['pick()', 'for i in range(n):', '    back()', 'drop()']))]
      },
      congThucKhac: [
        { moTa: 'Quay đầu, đi lại n ô rồi quay đầu lần nữa (đúng chỗ nhưng thêm hai lần quay đầu nên ít sao hơn)', hamCuaEmMoi: [H('fetch_back', ['n = 0', 'while front_clear():', '    move()', '    n = n + 1', 'pick()', 'u_turn()', 'for i in range(n):', '    move()', 'u_turn()', 'drop()'])] }
      ],
      loiSai: [
        { moTa: 'Quên nhặt vật: xe về tay không rồi thả, vật vẫn nằm cuối hành lang', baiLam: { chinh: C_9.slice() }, hamCuaEmMoi: [H('fetch_back', ['n = 0', 'while front_clear():', '    move()', '    n = n + 1', 'for i in range(n):', '    back()', 'drop()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đếm cứng hai ô theo sân đầu: hai sân sau xe nhặt hụt', baiLam: { chinh: C_9.slice() }, hamCuaEmMoi: [H('fetch_back', ['move()', 'move()', 'pick()', 'back()', 'back()', 'drop()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quên đặt vật xuống: xe về đúng chỗ nhưng vật vẫn trên tay', baiLam: { chinh: C_9.slice() }, hamCuaEmMoi: [H('fetch_back', ['n = 0', 'while front_clear():', '    move()', '    n = n + 1', 'pick()', 'for i in range(n):', '    back()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Lùi thiếu một ô: n bắt đầu từ 0 nhưng xe đã tiến một ô trước khi đếm', baiLam: { chinh: C_9.slice() }, hamCuaEmMoi: [H('fetch_back', ['n = 0', 'move()', 'while front_clear():', '    move()', '    n = n + 1', 'pick()', 'for i in range(n):', '    back()', 'drop()'])], phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Đếm xem xe đã tiến mấy ô, lúc về lùi đúng bấy nhiêu ô.', 'pick() và drop() em đã chế sẵn trong kho.']
    }),

    /* ------------------------------------------------------------ trùm */
    man({
      so: 10, ten: 'Kho hàng', hang: 'trum', nhipTheoLoiGiai: true, tay: true, cam: TRUOC_PHAI,
      hamCuaEmCan: ['turn_right', 'to_gap', 'fetch_back'], gioiHanHam: 3,
      huyHieu: { ma: 'che-cam-bien', ten: 'Huy hiệu Chế lệnh cảm biến' },
      deBai: 'Hàng nằm cuối một nhánh bên của kho. Đi lên hành lang tới cửa bên phải, vào nhánh, lấy hàng rồi đặt nó ngay trước cửa, giống bóng mờ. Chương trình chỉ được gọi tối đa 3 hàm của em.',
      san: SAN_10, batDau: BD_10, bongMo: BM_10,
      maMau: { chinh: [] },
      sao: { o: 31, nhip: 38 },
      loiGiai: { chinh: L_10.slice() },
      loiGiaiKhac: {
        moTa: 'Cùng đường đi, thêm một dòng chú thích',
        baiLam: { chinh: nhieu(['# lên cửa, vào nhánh, lấy hàng'], L_10) }
      },
      congThucKhac: [
        { moTa: 'Rẽ phải bằng lệnh bánh viết thẳng, chỉ còn 2 hàm của em', baiLam: { chinh: ['to_gap()', 'left_move()', 'wait()', 'fetch_back()'] } }
      ],
      loiSai: [
        { moTa: 'Quên rẽ phải vào nhánh: fetch_back() chạy dọc hành lang', baiLam: { chinh: ['to_gap()', 'fetch_back()'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Bỏ qua to_gap(): xe rẽ phải ngay ở chân hành lang, trước mặt là tường', baiLam: { chinh: ['turn_right()', 'fetch_back()'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Dùng thêm go_wall(): vượt quá 3 hàm của em', baiLam: { chinh: ['to_gap()', 'turn_right()', 'fetch_back()', 'go_wall()'] }, phaiCoMa: ['qua-gioi-han-ham'] },
        { moTa: 'fetch_back() đếm cứng một ô: chỉ đúng sân đầu', baiLam: { chinh: L_10.slice() }, hamCuaEmMoi: [H('fetch_back', ['move()', 'pick()', 'back()', 'drop()'])], phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Có ba việc: tìm cửa bên phải, rẽ vào, lấy hàng ra đặt trước cửa. Em đã có sẵn lệnh cho từng việc.', 'Sân nào cũng có hốc cụt bên trái: bỏ qua nó, chỉ để ý bên phải.']
    })
  ];

  ManHoc.them(DS);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();
