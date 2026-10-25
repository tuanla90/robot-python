/* ============================================================================
   man-hai-robot.js — "Học lập trình": CHƯƠNG `hai-robot` · ĐỘI HAI ROBOT (10 màn). Kế hoạch KE-HOACH-HAI-ROBOT.md (22/10).
   Đứng ngay sau gói Robot hoàn thiện: người chơi đã có if / while, cảm biến khoảng cách, tay kẹp và kho hàm (move, pick, drop, u_turn, go_wall…).
   Mỗi màn có HAI robot giống nhau (xe hai bánh + tay kẹp + cảm biến khoảng cách ở hông), mỗi robot MỘT chương trình (khung R1 / R2), chạy theo NHỊP CHUNG.
   Hai robot không có lệnh báo nhau (user chốt 22/10): muốn chờ đồng đội thì dùng cảm biến — đồng đội và vật đều làm front_clear() trả False.
   Dữ liệu màn nhiều robot: man.doi = [phần riêng R1, phần riêng R2] (batDau…); trường chung (robot, hamGoc, loaiRobot) ở man và chép sang từng robot;
   man.batDau / man.robot ở cấp ngoài là của R1 để mã đọc màn một robot không vỡ. Bài làm: { doi: [{ chinh }, { chinh }], hamCuaMan } (ChamHoc.cham → chamDoi).
   Ô = tổng hai chương trình chính + thân mỗi hàm được gọi (mỗi hàm tính một lần dù cả hai robot cùng gọi).

   Luật mục tiêu của lõi: 'toi-co' nhận CỜ NÀO cũng được, 'dua-vat' nhận Ô ĐÍCH NÀO cũng được (không có cờ / đích riêng của từng robot), nên màn không đặt cờ / đích
   "của robot kia" ở chỗ robot này tới dễ hơn (bộ dò do-duong-hai-robot.mjs bắt được đường tắt kiểu đó).

   Mười màn (lời giải chuẩn):
     1  Hai lá cờ      toi-co, 1 sân      R1 go_wall (đã viết sẵn), R2 go_wall                            làm quen thẻ R1 / R2
     2  Chia việc      dua-vat, 1 sân     mỗi robot pick, u_turn, drop ở làn của mình                     hai robot làm song song
     3  Bàn giao       dua-vat, 1 sân     R1 đặt vật trước mặt R2; R2 chờ bằng while front_clear(): wait()
     4  Chờ hàng       dua-vat, 3 sân     đường R1 dài ngắn khác nhau: R2 phải chờ bằng cảm biến, không đếm nhịp
     5  Nhường đường   toi-co, 3 sân      ngã tư: R2 chờ R1 tới rồi chờ R1 đi qua (hai vòng while)
     6  Theo sau       toi-co, 3 sân      chung một làn: R2 go_wall dừng sau lưng R1 (đồng đội cũng là vật cản)
     7  Dọn hai dãy    dua-vat, 3 sân     hai robot cùng một chương trình while not front_clear(): put_right(), move()
     8  Nhường lối     dua-vat, 1 sân     hành lang một làn có một hốc: R2 vào hốc để R1 mang vật qua tới ô đích
     9  Làm mốc        dua-vat, 3 sân     R2 tới đứng ngay sau ô đích làm mốc: go_wall() của R1 dừng đúng trên ô đích (đồng đội là vật cản)
     10 Ca làm đôi     dua-vat, 3 sân     trùm: R1 đi lấy vật xa gần khác nhau, R2 mang tới đích xa gần khác nhau; huy hiệu `hai-robot`

   Nối tiếp man-chuoi-1.js vào cùng window.ManHoc. Thứ tự chương: thu-tu-chuong.js. Hướng: 0 lên, 1 phải, 2 xuống, 3 trái. (x, y) với y = 0 ở hàng trên.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var TAY = ['arm_down', 'arm_up', 'grab', 'release'];
  var BA_HUONG = ['front_clear', 'left_clear', 'right_clear'];
  var ROBOT = { than: 'hai-banh', tay: 'kep', camBien: [{ ma: 'khoang-cach', o: 'hong' }] };

  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  function thut(ds) { return ds.map(function (s) { return '    ' + s; }); }
  /** Bài làm hai robot. */
  function B(c1, c2) { return { doi: [{ chinh: c1.slice() }, { chinh: c2.slice() }] }; }
  function sao(x) { return JSON.parse(JSON.stringify(x)); }

  // các đoạn hay dùng
  var CHO_THAY = ['while front_clear():', '    wait()'];                    // chờ tới khi trước mặt có vật / đồng đội
  var CHO_DI = ['while not front_clear():', '    wait()'];                 // chờ tới khi trước mặt trống lại
  var PICK_THANG = ['arm_down()', 'grab()', 'wait()', 'arm_up()', 'wait()'];

  /**
   * m.bd: [batDau R1, batDau R2] (mỗi batDau là một ô hay mảng ô theo sân). Mọi màn: hai robot ROBOT, khay = bánh + tay + ba cảm biến,
   * if / while / for, Xưởng mở, chương trình chính tự viết; nhiều sân thì nhipTheo 'tong' và sao.nhip theo lời giải chuẩn.
   */
  function man(m) {
    var bd = m.bd;
    delete m.bd;
    m.chuong = 'hai-robot';
    m.cauTruc = ['for', 'if', 'while'];
    m.loaiRobot = 'banh';
    m.robot = sao(ROBOT);
    m.hamGoc = nhieu(BANH, TAY, BA_HUONG);
    m.mucTieu = m.mucTieu || 'toi-co';
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    m.bienDem = true;
    var nhieuSan = Array.isArray(m.san[0]);
    if (nhieuSan) m.nhipTheo = 'tong';
    m.nhipTheoLoiGiai = true;
    m.doi = bd.map(function (b) { return { batDau: b }; });
    m.batDau = bd[0];                                                       // cấp ngoài = R1 (mã đọc màn một robot)
    m.maMau = m.maMau || B([], []);
    return ManHoc.chuanHoa(m);
  }

  /* ------------------------------------------------------------------- sân */

  // 1: hai làn đứng tách bởi tường; R1 ở (0,4), R2 ở (2,4), cùng quay lên; cờ ở đầu mỗi làn
  var SAN_1 = ['F#F', '.#.', '.#.', '.#.', '.#.'];

  // 2: hai làn ngắn; mỗi robot có một vật ngay trước mặt và ô đích ngay sau lưng
  var SAN_2 = ['o#o', '.#.', 'D#D'];

  // 3: R1 ở (1,3) quay lên, vật ở (1,2); R2 ở (4,3) quay trái; ô đích (5,3). R1 đặt vật ở (3,3) ngay trước mặt R2
  var SAN_3 = ['......', '......', '.o....', '.....D'];

  // 4: làn dọc của R1 (x = 0) dài ngắn khác nhau, vật ngay trước mặt R1; hàng trên là đường của R2: ô giao (1,0), R2 ở (2,0) quay trái, đích (4,0)
  var SAN_4 = [
    ['....D', '.####', '.####', '.####', 'o####', '.####'],
    ['....D', '.####', 'o####', '.####', '#####', '#####'],
    ['....D', '.####', '.####', 'o####', '.####', '#####']
  ];
  var BD_4 = [[{ x: 0, y: 5, huong: 0 }, { x: 0, y: 3, huong: 0 }, { x: 0, y: 4, huong: 0 }], [0, 1, 2].map(function () { return { x: 2, y: 0, huong: 3 }; })];

  // 5: ngã tư ở (3,2): R1 chạy ngang hàng 2 tới cờ (5,2), xuất phát xa gần khác nhau; R2 đứng ở (3,3) quay lên, cờ của R2 ở (3,0)
  var SAN_5 = [0, 1, 2].map(function () { return ['###F##', '###.##', '.....F', '###.##']; });
  var BD_5 = [[{ x: 0, y: 2, huong: 1 }, { x: 2, y: 2, huong: 1 }, { x: 1, y: 2, huong: 1 }], [0, 1, 2].map(function () { return { x: 3, y: 3, huong: 0 }; })];

  // 6: một làn ngang (hàng 1) chung cho hai robot, R1 đi trước; cờ của R1 ở cuối làn, cờ của R2 ở hốc phía trên ô ngay trước cờ R1
  var SAN_6 = [
    ['#####F#', '......F', '#######'],
    ['###F###', '....F##', '#######'],
    ['####F##', '.....F#', '#######']
  ];
  var BD_6 = [[{ x: 2, y: 1, huong: 1 }, { x: 2, y: 1, huong: 1 }, { x: 2, y: 1, huong: 1 }], [0, 1, 2].map(function () { return { x: 0, y: 1, huong: 1 }; })];

  // 7: hai làn đứng (x = 0 và x = 3), mỗi làn một dãy vật (số vật khác nhau), cột bên phải mỗi làn là ô đích
  var SAN_7 = [
    ['.D#.D', 'oD#.D', 'oD#oD', 'oD#oD', '.D#.D'],
    ['.D#.D', '.D#oD', 'oD#oD', 'oD#oD', '.D#.D'],
    ['.D#.D', '.D#.D', '.D#.D', 'oD#oD', '.D#.D']
  ];
  var BD_7 = [[0, 1, 2].map(function () { return { x: 0, y: 4, huong: 0 }; }), [0, 1, 2].map(function () { return { x: 3, y: 4, huong: 0 }; })];

  // 8: hành lang một làn (hàng 1), hốc ở (3,0); R1 ở (0,1) quay phải, vật ngay trước mặt (1,1); R2 ở (5,1) quay trái chắn lối; ô đích (6,1) ở cuối hành lang
  var SAN_8 = ['###.###', '.o....D'];

  // 9: hàng 2 là đường của R1 (xuất phát (0,2) quay phải, vật ở (1,2)); ô đích ở giữa đường (x = 2 / 4 / 3), đường còn dài quá ô đích; R2 ở đầu một ngõ dọc
  //    đổ xuống ngay sau ô đích, quay xuống
  var SAN_9 = [
    ['###.###', '###.###', '.oD....', '#######'],
    ['#####.#', '#####.#', '.o..D..', '#######'],
    ['####.##', '####.##', '.o.D...', '#######']
  ];
  var BD_9 = [[0, 1, 2].map(function () { return { x: 0, y: 2, huong: 1 }; }), [{ x: 3, y: 0, huong: 2 }, { x: 5, y: 0, huong: 2 }, { x: 4, y: 0, huong: 2 }]];

  // 10 (trùm): R1 ở (0,0) quay xuống, vật ở cuối làn dọc của R1 (sâu nông khác nhau); ô giao (1,0); R2 ở (2,0) quay trái, ô đích ở cuối hàng trên (xa gần khác nhau)
  var SAN_10 = [
    ['......D', '.######', '.######', '.######', 'o######', '#######'],
    ['....D##', '.######', 'o######', '#######', '#######', '#######'],
    ['.....D#', '.######', '.######', 'o######', '#######', '#######']
  ];
  var BD_10 = [[0, 1, 2].map(function () { return { x: 0, y: 0, huong: 2 }; }), [0, 1, 2].map(function () { return { x: 2, y: 0, huong: 3 }; })];

  // lời giải chuẩn
  var L_4 = [['pick()', 'go_wall()', 'turn_right()', 'drop()'], nhieu(CHO_THAY, ['pick()', 'u_turn()', 'move()', 'drop()'])];
  var L_5 = [['go_wall()'], nhieu(CHO_THAY, CHO_DI, ['go_wall()'])];
  var L_6 = [['go_wall()'], ['go_wall()', 'turn_left()', 'move()']];
  var L_7 = ['while not front_clear():', '    put_right()', '    move()'];
  var L_8 = [['pick()', 'go_wall()', 'back()', 'drop()'], ['move()', 'move()', 'turn_right()', 'move()']];
  var L_9 = [['pick()', 'go_wall()', 'back()', 'drop()'], ['go_wall()']];
  var L_10 = [['go_wall()', 'pick()', 'u_turn()', 'go_wall()', 'turn_right()', 'drop()'], nhieu(CHO_THAY, ['pick()', 'u_turn()', 'go_wall()', 'back()', 'drop()'])];

  var DS = [
    /* ------------------------------------------------------------ hàng 1: làm quen */
    man({
      so: 1, ten: 'Hai lá cờ', hang: 'lam-quen',
      hamCuaEmCan: ['go_wall'],
      deBai: 'Hai robot, mỗi robot một chương trình. R1 đã có chương trình. Chạm thẻ R2 rồi viết chương trình đưa R2 tới cờ của nó.',
      veMaMau: 'Chạm R1 / R2 ở đầu khung chương trình để đổi robot.',
      san: SAN_1, bd: [{ x: 0, y: 4, huong: 0 }, { x: 2, y: 4, huong: 0 }],
      maMau: B(['go_wall()'], []),
      sao: { o: 7, nhip: 4 },
      loiGiai: B(['go_wall()'], ['go_wall()']),
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: B(['go_wall()'], ['# R2 cũng đi tới cờ', 'go_wall()']) },
      congThucKhac: [
        { moTa: 'R2 đếm bước bằng vòng for', baiLam: B(['go_wall()'], ['for i in range(4):', '    move()']) }
      ],
      loiSai: [
        { moTa: 'Quên viết chương trình cho R2', baiLam: B(['go_wall()'], []), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'R2 đi thiếu một bước', baiLam: B(['go_wall()'], ['for i in range(3):', '    move()']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Chạm thẻ R2 ở đầu khung chương trình: khung trống là chương trình của R2.', 'R2 đứng giống R1, chỉ khác làn: chương trình của R2 có thể giống hệt R1.']
    }),

    man({
      so: 2, ten: 'Chia việc', hang: 'lam-quen',
      hamCuaEmCan: ['pick', 'u_turn', 'drop'],
      mucTieu: 'dua-vat',
      deBai: 'Mỗi làn có một vật trước mặt robot và một ô đích sau lưng. Hai robot cùng làm thì xong nhanh gấp đôi.',
      san: SAN_2, bd: [{ x: 0, y: 1, huong: 0 }, { x: 2, y: 1, huong: 0 }],
      sao: { o: 19, nhip: 4 },
      loiGiai: B(['pick()', 'u_turn()', 'drop()'], ['pick()', 'u_turn()', 'drop()']),
      loiGiaiKhac: { moTa: 'R2 nhặt bằng lệnh tay viết thẳng thay cho pick()', baiLam: B(['pick()', 'u_turn()', 'drop()'], nhieu(PICK_THANG, ['u_turn()', 'drop()'])) },
      congThucKhac: [
        { moTa: 'Quay đầu bằng hai lần quay phải (chậm hơn)', baiLam: B(['pick()', 'turn_right()', 'turn_right()', 'drop()'], ['pick()', 'u_turn()', 'drop()']) }
      ],
      loiSai: [
        { moTa: 'Chỉ R1 làm việc, R2 đứng yên', baiLam: B(['pick()', 'u_turn()', 'drop()'], []), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'R2 quên quay đầu: đặt vật lại chỗ cũ', baiLam: B(['pick()', 'u_turn()', 'drop()'], ['pick()', 'drop()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Hai robot giống nhau và làn giống nhau: chương trình của R2 có thể y như R1.', 'Nhặt vật, quay đầu, rồi đặt xuống ô đích.']
    }),

    man({
      so: 3, ten: 'Bàn giao', hang: 'lam-quen',
      hamCuaEmCan: ['pick', 'turn_right', 'move', 'drop', 'u_turn'],
      mucTieu: 'dua-vat',
      deBai: 'Chỉ R2 tới được ô đích. R1 nhặt vật rồi đặt xuống ngay trước mặt R2. R2 chờ tới khi thấy vật trước mặt thì kẹp lên, quay đầu, đặt vào ô đích.',
      san: SAN_3, bd: [{ x: 1, y: 3, huong: 0 }, { x: 4, y: 3, huong: 3 }],
      sao: { o: 27, nhip: 9 },
      loiGiai: B(['pick()', 'turn_right()', 'move()', 'drop()'], nhieu(CHO_THAY, ['pick()', 'u_turn()', 'drop()'])),
      loiGiaiKhac: { moTa: 'R2 chờ bằng năm dòng wait() viết thẳng', baiLam: B(['pick()', 'turn_right()', 'move()', 'drop()'], ['wait()', 'wait()', 'wait()', 'wait()', 'wait()', 'pick()', 'u_turn()', 'drop()']) },
      congThucKhac: [
        { moTa: 'R2 đếm nhịp chờ bằng vòng for', baiLam: B(['pick()', 'turn_right()', 'move()', 'drop()'], ['for i in range(5):', '    wait()', 'pick()', 'u_turn()', 'drop()']) }
      ],
      loiSai: [
        { moTa: 'R2 không chờ: kẹp khi vật chưa tới', baiLam: B(['pick()', 'turn_right()', 'move()', 'drop()'], ['pick()', 'u_turn()', 'drop()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'R1 đi một bước quá xa: ô trước mặt là R2 nên không đặt được', baiLam: B(['pick()', 'turn_right()', 'move()', 'move()', 'drop()'], nhieu(CHO_THAY, ['pick()', 'u_turn()', 'drop()'])), phaiCoMa: ['tha-bi-chan', 'chua-dua-vat'] }
      ],
      goiY: ['R2 không biết lúc nào R1 đặt vật xong: cho R2 chờ trong khi trước mặt còn trống.', 'while front_clear(): wait() — vật vừa xuất hiện trước mặt thì vòng lặp dừng.']
    }),

    /* ------------------------------------------------------------ hàng 2: luyện */
    man({
      so: 4, ten: 'Chờ hàng', hang: 'luyen',
      hamCuaEmCan: ['pick', 'go_wall', 'turn_right', 'drop', 'u_turn', 'move'],
      mucTieu: 'dua-vat',
      deBai: 'Đường của R1 ở mỗi sân dài ngắn khác nhau. R1 mang vật lên ô giao trước mặt R2; R2 mang vật tới ô đích. Một chương trình phải đúng cả ba sân.',
      san: SAN_4, bd: BD_4,
      sao: { o: 30, nhip: 39 },
      loiGiai: B(L_4[0], L_4[1]),
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: B(L_4[0], nhieu(['# chờ R1 đặt vật'], L_4[1])) },
      congThucKhac: [
        { moTa: 'R2 chờ đủ lâu cho sân dài nhất (thắng nhưng chậm)', baiLam: B(L_4[0], ['for i in range(9):', '    wait()', 'pick()', 'u_turn()', 'move()', 'drop()']) }
      ],
      loiSai: [
        { moTa: 'R2 đếm nhịp chờ theo sân ngắn: sân dài vật chưa tới', baiLam: B(L_4[0], ['for i in range(5):', '    wait()', 'pick()', 'u_turn()', 'move()', 'drop()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'R2 đi luôn tới ô giao: R1 không còn chỗ đặt vật', baiLam: B(L_4[0], ['move()', 'pick()', 'u_turn()', 'move()', 'drop()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Đếm nhịp chờ chỉ đúng một sân. R2 chờ tới khi THẤY vật trước mặt.', 'R2: while front_clear(): wait(), rồi nhặt, quay đầu, đi một ô, đặt.']
    }),

    man({
      so: 5, ten: 'Nhường đường', hang: 'luyen',
      hamCuaEmCan: ['go_wall'],
      deBai: 'Đường của R1 và R2 cắt nhau ở ngã tư; cùng tiến vào một ô thì cả hai đứng yên. R2 chờ R1 đi qua ngã tư rồi mới đi. Mỗi sân R1 xuất phát xa gần khác nhau.',
      san: SAN_5, bd: BD_5,
      sao: { o: 11, nhip: 18 },
      loiGiai: B(L_5[0], L_5[1]),
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: B(L_5[0], nhieu(['# chờ R1 tới rồi chờ R1 đi qua'], L_5[1])) },
      congThucKhac: [
        { moTa: 'R2 chờ đủ lâu cho sân xa nhất (thắng nhưng chậm)', baiLam: B(L_5[0], ['for i in range(5):', '    wait()', 'go_wall()']) }
      ],
      loiSai: [
        { moTa: 'R2 đi luôn: hai robot cùng tiến vào ngã tư rồi kẹt mãi', baiLam: B(L_5[0], ['go_wall()']), phaiCoMa: ['dam-tuong', 'vong-vo-han'] },
        { moTa: 'R2 chỉ chờ R1 tới, không chờ R1 đi khỏi', baiLam: B(L_5[0], nhieu(CHO_THAY, ['go_wall()'])), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Từ chỗ R2 đứng, ô trước mặt chính là ngã tư: R1 tới thì front_clear() trả False, R1 đi khỏi thì lại True.', 'Hai vòng chờ: while front_clear(): wait() rồi while not front_clear(): wait().']
    }),

    man({
      so: 6, ten: 'Theo sau', hang: 'luyen',
      hamCuaEmCan: ['go_wall', 'turn_left', 'move'],
      deBai: 'Hai robot đi chung một làn, R1 đi trước. Cờ của R2 ở hốc ngay trước cờ của R1. Làn mỗi sân dài ngắn khác nhau.',
      san: SAN_6, bd: BD_6,
      sao: { o: 11, nhip: 18 },
      loiGiai: B(L_6[0], L_6[1]),
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: B(L_6[0], nhieu(['# đi tới sau lưng R1'], L_6[1])) },
      congThucKhac: [],
      loiSai: [
        { moTa: 'R2 đếm bước theo sân ngắn: sân dài R2 rẽ sớm, đâm tường', baiLam: B(L_6[0], ['for i in range(4):', '    move()', 'turn_left()', 'move()']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Cảm biến của R2 cũng thấy R1: go_wall() của R2 dừng ngay sau lưng R1.', 'R2 dừng đúng dưới hốc, quay trái rồi tiến một ô.']
    }),

    /* ------------------------------------------------------------ hàng 3: biến thể */
    man({
      so: 7, ten: 'Dọn hai dãy', hang: 'bien-the',
      hamCuaEmCan: ['put_right', 'move'],
      mucTieu: 'dua-vat',
      deBai: 'Mỗi làn có một dãy vật, số vật mỗi sân khác nhau. Dọn hết vật sang cột ô đích bên phải. Hai robot làm cùng lúc.',
      san: SAN_7, bd: BD_7,
      sao: { o: 27, nhip: 40 },
      loiGiai: B(L_7, L_7),
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: B(L_7, nhieu(['# dọn làn của R2'], L_7)) },
      congThucKhac: [],
      loiSai: [
        { moTa: 'Chỉ dọn một vật', baiLam: B(['put_right()'], ['put_right()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Trước mặt còn vật thì còn việc: while not front_clear().', 'Mỗi vòng: đặt vật sang phải rồi tiến lên một ô.']
    }),

    man({
      so: 8, ten: 'Nhường lối', hang: 'bien-the',
      hamCuaEmCan: ['pick', 'go_wall', 'back', 'drop', 'move', 'turn_right'],
      mucTieu: 'dua-vat',
      deBai: 'Hành lang chỉ rộng một ô. R1 mang vật tới ô đích ở cuối hành lang, nhưng R2 đang đứng chắn lối. Giữa hành lang có một hốc: R2 vào hốc nhường lối cho R1.',
      san: SAN_8, bd: [{ x: 0, y: 1, huong: 1 }, { x: 5, y: 1, huong: 3 }],
      sao: { o: 28, nhip: 10 },
      loiGiai: B(L_8[0], L_8[1]),
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: B(L_8[0], nhieu(['# vào hốc nhường lối'], L_8[1])) },
      congThucKhac: [],
      loiSai: [
        { moTa: 'R2 đứng yên: R1 dừng trước mặt R2, đặt vật giữa hành lang', baiLam: B(L_8[0], []), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'R2 lùi về ô đích: R1 không còn chỗ đặt vật', baiLam: B(L_8[0], ['back()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['R2 đi tới ngay dưới hốc, quay mặt lên rồi tiến vào hốc.', 'R1 dùng go_wall(): R2 còn đứng trong hành lang thì go_wall() dừng trước mặt R2.']
    }),

    man({
      so: 9, ten: 'Làm mốc', hang: 'bien-the',
      hamCuaEmCan: ['pick', 'go_wall', 'back', 'drop'],
      mucTieu: 'dua-vat',
      deBai: 'Ô đích nằm giữa đường, không có tường nào để R1 biết lúc nào dừng. R2 tới đứng ngay sau ô đích làm mốc. Mỗi sân ô đích ở một chỗ khác.',
      san: SAN_9, bd: BD_9,
      sao: { o: 23, nhip: 21 },
      loiGiai: B(L_9[0], L_9[1]),
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: B(L_9[0], ['# xuống đứng làm mốc', 'go_wall()']) },
      congThucKhac: [],
      loiSai: [
        { moTa: 'R2 đứng yên: R1 chạy quá ô đích tới cuối đường', baiLam: B(L_9[0], []), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'R1 quên lùi: ô trước mặt là R2 nên không đặt được', baiLam: B(['pick()', 'go_wall()', 'drop()'], L_9[1]), phaiCoMa: ['tha-bi-chan', 'chua-dua-vat'] }
      ],
      goiY: ['Cảm biến của R1 thấy R2 như thấy tường: go_wall() dừng ngay trước R2.', 'R2 chỉ cần go_wall() là xuống tới ngay sau ô đích. R1 dừng trên ô đích thì lùi một ô rồi đặt.']
    }),

    /* ------------------------------------------------------------ trùm */
    man({
      so: 10, ten: 'Ca làm đôi', hang: 'trum',
      hamCuaEmCan: ['go_wall', 'pick', 'u_turn', 'turn_right', 'drop', 'back'],
      mucTieu: 'dua-vat',
      deBai: 'R1 xuống cuối làn lấy vật, mang về ô giao. R2 nhận vật rồi mang tới ô đích ở cuối hàng trên. Làn của R1 và đường của R2 ở mỗi sân dài ngắn khác nhau.',
      san: SAN_10, bd: BD_10,
      sao: { o: 36, nhip: 51 },
      loiGiai: B(L_10[0], L_10[1]),
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: B(L_10[0], nhieu(['# chờ vật, mang tới cuối hàng'], L_10[1])) },
      congThucKhac: [],
      loiSai: [
        { moTa: 'R2 đặt vật ngay khi tới tường: ô trước mặt là tường', baiLam: B(L_10[0], nhieu(CHO_THAY, ['pick()', 'u_turn()', 'go_wall()', 'drop()'])), phaiCoMa: ['tha-bi-chan', 'chua-dua-vat'] },
        { moTa: 'R2 đếm nhịp chờ theo sân ngắn', baiLam: B(L_10[0], ['for i in range(8):', '    wait()', 'pick()', 'u_turn()', 'go_wall()', 'back()', 'drop()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['R1: đi tới vật, nhặt, quay đầu, đi về tới tường, quay phải, đặt.', 'R2: chờ thấy vật, nhặt, quay đầu, đi tới tường, lùi một ô rồi đặt.'],
      huyHieu: { ma: 'hai-robot', ten: 'Huy hiệu Đội hai robot' }
    })
  ];

  ManHoc.them(DS);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();
