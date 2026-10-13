/* ============================================================================
   man-khoang-cach.js — "Đường học": CHƯƠNG `khoang-cach` · CẢM BIẾN KHOẢNG CÁCH (10 màn).
   Robot là XE HAI BÁNH (loaiRobot 'banh') gắn CẢM BIẾN KHOẢNG CÁCH ở hai bên hông, mặt đo hướng ra trước:
   robot { than: 'hai-banh', tay: null | 'kep', camBien: [{ ma: 'khoang-cach', o: 'hong' }] }.
   hamGoc có thêm hàm cảm biến (luật đầy đủ ở san-hoc.js, phần CẢM BIẾN KHOẢNG CÁCH):
       front_clear()   True nếu ô NGAY TRƯỚC MẶT đi vào được; False nếu là tường, mép sân, thùng nặng hay bậc thang S
       left_clear()    cùng phép đo cho ô bên TRÁI so với hướng mặt  \
       right_clear()   cùng phép đo cho ô bên PHẢI so với hướng mặt  / chỉ mở ở 7 (bám tường) và 10 (trùm)
   Đọc cảm biến KHÔNG tốn nhịp, nhưng ghi sự kiện 'doc-cam-bien' để giao diện nháy cảm biến.
   Quyết định: có thêm left_clear() / right_clear() vì bám tường tay phải (màn 7) cần biết bên phải có trống không;
   chỉ front_clear() thì phải quay xe để hỏi, tốn nhịp và làm bài lẫn với kỹ thuật khác. 1–6, 8, 9 chỉ có front_clear().

   Đây là chương ĐẦU TIÊN dạy `while` (cauTruc ['for', 'if', 'while']; màn 1 chưa dạy nên khung chanWhile báo
   'cau-truc-chua-hoc') và chấm trên NHIỀU SÂN: từ hàng Luyện (màn 4) mỗi màn có `san` là MẢNG 3 sân khác nhau
   (cùng khung; hành lang dài ngắn khác, tường đặt khác), `batDau` là mảng song song. Thắng khi thắng TẤT CẢ sân.
   Viết cứng số bước thì: số bước thiếu → trượt sân dài hơn; số bước thừa (đủ cho sân dài nhất) → thắng nhưng xe húc tường
   ở sân ngắn nên mất nhịp. Muốn sao nhịp, `sao.nhip` tính theo TỔNG nhịp mọi sân (man.nhipTheo = 'tong', cham.js):
   chương trình đọc cảm biến (while front_clear()) đi đúng số ô ở từng sân; chương trình cứng số thì không.
   (Với MỘT sân — màn 1, 2, 3 — chương trình cứng số vẫn thắng; đó là các màn làm quen.)

   Mục tiêu: tới cờ ('toi-co'), riêng 9 là 'dua-vat' (tay kẹp). Mục BFS (kiem-hoc.mjs): nhịp ngắn nhất tính TRÊN TỪNG SÂN rồi cộng lại;
   sao.nhip = đúng tổng đó ở 1–6, 8, 10 (hành lang một lối, chỉ có đường duy nhất). Riêng 7 (bám tường: đi vào ngõ cụt rồi quay ra)
   và 9 (pick() / drop() chưa gộp nhịp) khai nhipTheoLoiGiai: sao.nhip là nhịp của lời giải chuẩn, BFS ≤ sao.nhip.

   Hàm của em MỚI (tên cốt truyện, bị khóa trong kho, xem KhoHam.datTenCoDinh):
     khoang-cach.5   go_wall() = while front_clear(): move()      (2 ô)
         Đi thẳng tới khi trước mặt là tường. Dùng ở 5, 9, 10.
   Tên không trùng hàm cốt truyện chương trước và không phải hàm gốc.

   Trường riêng của chương này:
   - canHam: 'mat-sao' — 5: viết thẳng hai vòng while (không dùng go_wall) vẫn vừa khung nhưng nhiều ô hơn → mất sao ô.
   - robot.camBien, nhipTheo 'tong' (màn nhiều sân), khung.chanWhile (màn 1).
   - loiSai có lời cứng số trượt ở sân khác và lời có `while` chạy mãi (mã vong-vo-han).

   Nối tiếp man-chuoi-1.js vào cùng window.ManHoc. Thứ tự chương: thu-tu-chuong.js.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var TAY = ['arm_down', 'arm_up', 'grab', 'release'];
  var FRONT = ['front_clear'];
  var BA_HUONG = ['front_clear', 'left_clear', 'right_clear'];

  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  function lap(s, n) { var kq = []; for (var i = 0; i < n; i++) kq.push(s); return kq; }
  /** Vòng for lặp các lệnh `lenh` (chuỗi hoặc mảng) `n` lần. */
  function LAP(n, lenh) {
    var ds = Array.isArray(lenh) ? lenh : [lenh];
    return ['for i in range(' + n + '):'].concat(ds.map(function (s) { return '    ' + s; }));
  }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }

  // thân các hàm của chương
  var T_GO_WALL = ['while front_clear():', '    move()'];
  function hGoWall(than) { return H('go_wall', [], than || T_GO_WALL); }

  /**
   * m.cam: hamGoc của cảm biến (FRONT mặc định, hay BA_HUONG); m.tay: true thì có tay kẹp (màn 9). Hai trường này bị bỏ sau khi dùng.
   * Màn 1 khai khung.chanWhile (chưa dạy while). Màn nhiều sân tự có nhipTheo 'tong' và batDau song song.
   */
  function man(m) {
    var tuyChon = { cam: m.cam, tay: m.tay };
    delete m.cam; delete m.tay;
    var cam = tuyChon.cam || FRONT;
    m.chuong = 'khoang-cach';
    m.cauTruc = m.so === 1 ? ['for', 'if'] : ['for', 'if', 'while'];       // while bắt đầu từ màn 2
    m.loaiRobot = 'banh';
    m.robot = { than: 'hai-banh', tay: tuyChon.tay ? 'kep' : null, camBien: [{ ma: 'khoang-cach', o: 'hong' }] };
    m.hamGoc = nhieu(BANH, tuyChon.tay ? TAY : [], cam);
    if (tuyChon.tay) m.mucTieu = 'dua-vat';
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    if (m.so === 1) m.khung.chanWhile = true;
    if (Array.isArray(m.san[0])) {
      m.nhipTheo = 'tong';
      if (!Array.isArray(m.batDau)) m.batDau = m.san.map(function () { return Object.assign({}, m.batDau); });
    }
    return ManHoc.chuanHoa(m);
  }

  /* ------------------------------------------------------------------- sân (dựng từ đường đi, kiểm bằng tay) */

  // 1: hành lang đứng, cờ cách xe 3 ô
  var SAN_1 = ['###', '#F#', '#.#', '#.#', '#.#'];
  // 2: hành lang ngang, cờ sát tường cuối
  var SAN_2 = ['#######', '#....F#', '#######'];
  // 3: đi lên tới tường (3 ô), rẽ phải, đi tiếp 4 ô tới cờ
  var SAN_3 = ['#######', '#....F#', '#.#####', '#.#####', '#.#####', '#######'];
  // 4: ba hành lang chữ L: đoạn lên dài 2 / 4 / 5 ô, rẽ phải, hai ô tới cờ
  var SAN_4 = [
    ['#####', '#####', '#####', '#####', '#..F#', '#.###', '#.###'],
    ['#####', '#####', '#..F#', '#.###', '#.###', '#.###', '#.###'],
    ['#####', '#..F#', '#.###', '#.###', '#.###', '#.###', '#.###']
  ];
  // 5: ba hành lang chữ U/S: lên, rẽ phải, đi, rẽ phải, xuống tới cờ (độ dài từng đoạn khác nhau)
  var SAN_5 = [
    ['#######', '#######', '#...###', '#.#.###', '#.#F###', '#.#####', '#######'],
    ['#######', '#....##', '#.##.##', '#.##.##', '#.##F##', '#.#####', '#######'],
    ['#######', '#######', '#######', '#.....#', '#.###.#', '#.###.#', '#####F#']
  ];
  // 6: ba hành lang chỉ rẽ phải: một khúc quẹo, hai khúc quẹo, ba khúc quẹo
  var SAN_6 = [
    ['#######', '#######', '#...F##', '#.#####', '#.#####', '#.#####', '#######'],
    ['#######', '#...###', '#.#.###', '#.#F###', '#.#####', '#.#####', '#######'],
    ['#######', '#.....#', '#.###.#', '#.###.#', '#.###.#', '#.#F..#', '#######']
  ];
  // 7: ba mê cung nhỏ (không vòng, có ngõ cụt); bám tường tay phải luôn tới cờ
  var SAN_7 = [
    ['#######', '#.....#', '#.#####', '#...#F#', '#.#.#.#', '#.#...#', '#######'],
    ['#######', '#.#..F#', '#.#.###', '#...#.#', '#.#.#.#', '#.#...#', '#######'],
    ['#######', '#.....#', '###.#.#', '#.#.#.#', '#.#.#.#', '#...#F#', '#######']
  ];
  var BD_7 = [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 5, huong: 0 }, { x: 1, y: 3, huong: 0 }];
  // 8: ba hành lang chữ L (đoạn lên 2 / 5 / 3 ô, đoạn ngang 4 / 2 / 5 ô)
  var SAN_8 = [
    ['#######', '#######', '#######', '#....F#', '#.#####', '#.#####', '#######'],
    ['#..F###', '#.#####', '#.#####', '#.#####', '#.#####', '#.#####', '#######'],
    ['#######', '#######', '#.....F', '#.#####', '#.#####', '#.#####', '#######']
  ];
  // 9: hành lang đứng, vật nằm dưới chân xe, ô đích D sát tường cuối (dài 2 / 4 / 6 ô)
  var SAN_9 = [
    ['###', '###', '###', '###', '#D#', '#.#', '#o#'],
    ['###', '###', '#D#', '#.#', '#.#', '#.#', '#o#'],
    ['#D#', '#.#', '#.#', '#.#', '#.#', '#.#', '#o#']
  ];
  // 10: ba mê cung hành lang: rẽ trái / phải xen kẽ, có ngõ cụt giả ở chỗ rẽ và dọc đường
  var SAN_10 = [
    ['####.##', '.....##', '#.##.##', '..##.##', '#..#..#', '#.###F#', '#######'],
    ['#######', '#######', '##....#', '##.##.#', '#...#..', '#F###.#', '#######'],
    ['#######', '#.#####', '#.###.F', '#.###.#', '#.#.#.#', '#.....#', '###.###']
  ];
  var BD_10 = [{ x: 1, y: 5, huong: 0 }, { x: 5, y: 5, huong: 0 }, { x: 1, y: 1, huong: 2 }];
  var BD_DUNG = { x: 1, y: 6, huong: 0 };       // xe đứng ở chân hành lang đứng, quay lên

  /* ------------------------------------------------------------- chương trình dùng lại */

  var VONG_WHILE = T_GO_WALL.slice();
  // 1: ba lần "hỏi rồi tiến"
  var CHINH_1 = LAP(3, ['if front_clear():', '    move()']);
  // 2: đi tới khi trước mặt là tường
  var CHINH_2 = VONG_WHILE.slice();
  // 3: tới tường, rẽ phải, lại tới tường
  var CHINH_3 = nhieu(VONG_WHILE, ['turn_right()'], VONG_WHILE);
  // 4: tới tường rồi rẽ phải đi hai ô
  var CHINH_4 = nhieu(VONG_WHILE, ['turn_right()', 'move()', 'move()']);
  // 5: ba đoạn, cách nhau bằng rẽ phải
  var CHINH_5 = ['go_wall()', 'turn_right()', 'go_wall()', 'turn_right()', 'go_wall()'];
  // 6: gặp tường thì rẽ phải
  var CHINH_6 = LAP(30, ['if front_clear():', '    move()', 'else:', '    turn_right()']);
  // 7: bám tường tay phải
  var CHINH_7 = LAP(60, ['if right_clear():', '    turn_right()', '    move()', 'elif front_clear():', '    move()', 'else:', '    turn_left()']);
  // 8: sửa True → front_clear()
  var CHINH_8 = nhieu(VONG_WHILE, ['turn_right()'], VONG_WHILE);
  // 9: nhặt vật, đi tới tường, thả
  var CHINH_9 = ['pick()', 'go_wall()', 'drop()'];
  // 10: tới tường, rồi lặp: rẽ về phía còn trống (ưu tiên bên phải), lại tới tường
  var CHINH_10 = nhieu(['go_wall()'], LAP(20, ['if right_clear():', '    turn_right()', 'else:', '    turn_left()', 'go_wall()']));

  var DS = [
    /* ------------------------------------------------ hàng 1: làm quen */
    man({
      so: 1, ten: 'Hỏi trước khi đi', hang: 'lam-quen', hamCuaEmCan: ['move'],
      deBai: 'Cảm biến khoảng cách ở hông xe đo ô ngay trước mặt: front_clear() là True khi ô đó đi vào được, False khi là tường. Đưa xe tới cờ.',
      veMaMau: 'Chương trình có sẵn hỏi cảm biến một lần rồi mới tiến. Chạy thử, xem xe đi được mấy ô rồi viết tiếp.',
      san: SAN_1,
      batDau: { x: 1, y: 4, huong: 0 },
      maMau: { chinh: ['if front_clear():', '    move()'] },
      sao: { o: 6, nhip: 3 },
      loiGiai: { chinh: CHINH_1.slice() },
      loiGiaiKhac: { moTa: 'Ba lần if viết liền nhau thay cho vòng for', baiLam: { chinh: nhieu(['if front_clear():', '    move()'], ['if front_clear():', '    move()'], ['if front_clear():', '    move()']) } },
      loiSai: [
        { moTa: 'Chỉ hỏi cảm biến một lần: xe mới đi được một ô', baiLam: { chinh: ['if front_clear():', '    move()'] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đảo điều kiện bằng not: ô trước mặt trống nên xe đứng yên', baiLam: { chinh: LAP(3, ['if not front_clear():', '    move()']) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Lặp hai lần thay vì ba: xe dừng trước cờ một ô', baiLam: { chinh: LAP(2, ['if front_clear():', '    move()']) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Dùng while ở màn chưa học while', baiLam: { chinh: ['while front_clear():', '    move()'] }, phaiCoMa: ['cau-truc-chua-hoc'] }
      ],
      goiY: ['Lệnh if chỉ hỏi một lần rồi thôi; muốn hỏi nhiều lần thì cho nó nằm trong vòng lặp.',
        'Cờ cách xe ba ô.']
    }),

    man({
      so: 2, ten: 'Đi tới tường', hang: 'lam-quen', hamCuaEmCan: ['move'],
      deBai: 'Lệnh while lặp lại chừng nào điều kiện còn đúng. Cho xe đi thẳng tới sát tường, nơi có lá cờ.',
      veMaMau: 'Chương trình có sẵn dùng if nên xe chỉ đi được một ô. Chạy thử rồi sửa.',
      san: SAN_2,
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: { chinh: ['if front_clear():', '    move()'] },
      sao: { o: 5, nhip: 4 },
      loiGiai: { chinh: CHINH_2.slice() },
      loiGiaiKhac: { moTa: 'Vòng for lặp thừa, mỗi vòng hỏi cảm biến bằng if', baiLam: { chinh: LAP(9, ['if front_clear():', '    move()']) } },
      loiSai: [
        { moTa: 'Giữ nguyên if: xe chỉ đi được một ô', baiLam: { chinh: ['if front_clear():', '    move()'] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đảo điều kiện bằng not: ô trước mặt trống nên vòng không chạy lần nào', baiLam: { chinh: ['while not front_clear():', '    move()'] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Thân vòng while chỉ chờ, không tiến: điều kiện không bao giờ sai', baiLam: { chinh: ['while front_clear():', '    wait()'] }, phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Thiếu dấu hai chấm sau điều kiện while', baiLam: { chinh: ['while front_clear()', '    move()'] }, phaiCoMa: ['loi-cu-phap'] }
      ],
      goiY: ['if hỏi một lần rồi thôi, còn while hỏi lại sau mỗi vòng cho tới khi điều kiện sai.',
        'Xe dừng khi ô trước mặt là tường: lúc đó front_clear() trả về False.']
    }),

    man({
      so: 3, ten: 'Tới tường rồi rẽ', hang: 'lam-quen', hamCuaEmCan: ['move', 'turn_right'],
      deBai: 'Đi thẳng tới tường, rẽ phải, rồi đi tiếp tới cờ. Mỗi đoạn đường chạy đến khi trước mặt là tường.',
      veMaMau: 'Chương trình có sẵn đi hết đoạn đầu rồi dừng. Chạy thử rồi viết tiếp.',
      san: SAN_3,
      batDau: { x: 1, y: 4, huong: 0 },
      maMau: { chinh: VONG_WHILE.slice() },
      sao: { o: 10, nhip: 8 },
      loiGiai: { chinh: CHINH_3.slice() },
      loiGiaiKhac: { moTa: 'Đoạn sau dùng vòng for chứa if thay cho while', baiLam: { chinh: nhieu(VONG_WHILE, ['turn_right()'], LAP(9, ['if front_clear():', '    move()'])) } },
      loiSai: [
        { moTa: 'Đi hết đoạn đầu rồi dừng, quên rẽ', baiLam: { chinh: VONG_WHILE.slice() }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Rẽ phải xong không đi tiếp', baiLam: { chinh: nhieu(VONG_WHILE, ['turn_right()']) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Rẽ trái thay vì rẽ phải: xe quay mặt vào tường', baiLam: { chinh: nhieu(VONG_WHILE, ['turn_left()'], VONG_WHILE) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Rẽ phải trước khi đi: xe quay mặt vào tường ngay từ đầu', baiLam: { chinh: nhieu(['turn_right()'], VONG_WHILE) }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Mỗi đoạn đường dùng một vòng while; giữa hai đoạn là lệnh rẽ.',
        'Xe đang quay mặt lên; muốn đi sang phải thì phải rẽ phải khi trước mặt là tường.']
    }),

    /* ------------------------------------------------------------- hàng 2: luyện (nhiều sân) */
    man({
      so: 4, ten: 'Hành lang dài ngắn', hang: 'luyen', hamCuaEmCan: ['move', 'turn_right'],
      deBai: 'Ba hành lang có đoạn đầu dài ngắn khác nhau, sau đó rẽ phải đi hai ô tới cờ. Một chương trình phải đưa xe tới cờ ở cả ba sân.',
      veMaMau: 'Chương trình có sẵn đi hết đoạn đầu rồi dừng. Chạy thử, xem xe dừng ở đâu ở từng sân rồi viết tiếp.',
      san: SAN_4,
      batDau: { x: 1, y: 6, huong: 0 },
      maMau: { chinh: VONG_WHILE.slice() },
      sao: { o: 10, nhip: 20 },
      loiGiai: { chinh: CHINH_4.slice() },
      loiGiaiKhac: { moTa: 'Hai ô cuối đi bằng vòng for chứa if', baiLam: { chinh: nhieu(VONG_WHILE, ['turn_right()'], LAP(9, ['if front_clear():', '    move()'])) } },
      loiSai: [
        { moTa: 'Đếm cứng theo sân đầu (2 ô): sân dài hơn xe chưa tới tường đã rẽ', baiLam: { chinh: ['move()', 'move()', 'turn_right()', 'move()', 'move()'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Đếm cứng theo sân dài nhất (5 ô): thắng cả ba sân nhưng xe húc tường ở sân ngắn nên mất nhịp', baiLam: { chinh: nhieu(LAP(5, 'move()'), ['turn_right()', 'move()', 'move()']) }, phaiCoMa: ['dam-tuong'] },
        { moTa: 'Dùng if thay while: xe chỉ đi được một ô', baiLam: { chinh: nhieu(['if front_clear():', '    move()'], ['turn_right()', 'move()', 'move()']) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên rẽ phải sau vòng while', baiLam: { chinh: nhieu(VONG_WHILE, ['move()', 'move()']) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Đoạn đầu mỗi sân dài khác nhau, nên đừng đếm số ô: để cảm biến báo khi nào tới tường.',
        'Đoạn sau rẽ phải rồi đi hai ô, giống nhau ở cả ba sân.']
    }),

    man({
      so: 5, ten: 'Hàm go_wall()', hang: 'luyen', canHam: 'mat-sao', hamCuaEmCan: ['move', 'turn_right'], taoHam: ['go_wall'],
      deBai: 'Tạo hàm go_wall() đi thẳng tới khi trước mặt là tường. Dùng nó cho ba hành lang uốn khúc: mỗi đoạn dài khác nhau, giữa các đoạn xe rẽ phải.',
      veMaMau: 'Chương trình có sẵn gọi go_wall(), nhưng em chưa có hàm đó. Tạo hàm go_wall trong Xưởng hàm rồi chạy lại.',
      san: SAN_5,
      batDau: { x: 1, y: 5, huong: 0 },
      maMau: { chinh: CHINH_5.slice() },
      sao: { o: 12, nhip: 32 },
      loiGiai: { chinh: CHINH_5.slice(), hamCuaEmMoi: [hGoWall()] },
      loiGiaiKhac: {
        moTa: 'Đoạn giữa viết thẳng vòng while thay cho go_wall()',
        baiLam: { chinh: nhieu(['go_wall()', 'turn_right()'], VONG_WHILE, ['turn_right()', 'go_wall()']) },
        hamCuaEmMoi: [hGoWall()]
      },
      loiSai: [
        { moTa: 'Gọi go_wall() mà chưa tạo hàm', baiLam: { chinh: CHINH_5.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'go_wall dùng if thay while: xe chỉ đi được một ô mỗi đoạn', baiLam: { chinh: CHINH_5.slice() }, hamCuaEmMoi: [hGoWall(['if front_clear():', '    move()'])], phaiCoMa: ['chua-toi-co'] },
        { moTa: 'go_wall quên move() trong thân vòng: vòng while chạy mãi', baiLam: { chinh: CHINH_5.slice() }, hamCuaEmMoi: [hGoWall(['while front_clear():', '    wait()'])], phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Quên một lệnh rẽ giữa hai đoạn', baiLam: { chinh: ['go_wall()', 'turn_right()', 'go_wall()', 'go_wall()'] }, hamCuaEmMoi: [hGoWall()], phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Không dùng hàm: viết thẳng ba vòng while, vừa khung nhưng nhiều ô hơn', baiLam: { chinh: nhieu(VONG_WHILE, ['turn_right()'], VONG_WHILE, ['turn_right()'], VONG_WHILE) }, phaiCoMa: [] }
      ],
      goiY: ['Thân go_wall chỉ có một vòng while: còn đi được thì tiến một ô.',
        'Ba đoạn đường cách nhau bằng hai lệnh rẽ phải.']
    }),

    man({
      so: 6, ten: 'Gặp tường thì rẽ', hang: 'luyen', hamCuaEmCan: ['move', 'turn_right'],
      deBai: 'Ba hành lang chỉ có khúc quẹo phải, số khúc và độ dài mỗi đoạn khác nhau. Mỗi lượt: nếu trước mặt trống thì tiến, không thì rẽ phải.',
      veMaMau: 'Chương trình có sẵn mới làm đúng một lượt. Chạy thử, xem xe dừng ở đâu rồi viết tiếp.',
      san: SAN_6,
      batDau: { x: 1, y: 5, huong: 0 },
      maMau: { chinh: ['if front_clear():', '    move()', 'else:', '    turn_right()'] },
      sao: { o: 10, nhip: 34 },
      loiGiai: { chinh: CHINH_6.slice() },
      loiGiaiKhac: { moTa: 'Ghi kết quả cảm biến vào biến rồi mới hỏi', baiLam: { chinh: LAP(30, ['co_duong = front_clear()', 'if co_duong:', '    move()', 'else:', '    turn_right()']) } },
      loiSai: [
        { moTa: 'Quên nhánh else: gặp tường xe đứng yên mãi', baiLam: { chinh: LAP(30, ['if front_clear():', '    move()']) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Rẽ trái thay vì rẽ phải: xe quay vòng tại chỗ', baiLam: { chinh: LAP(30, ['if front_clear():', '    move()', 'else:', '    turn_left()']) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đảo điều kiện bằng not: xe đâm đầu vào tường', baiLam: { chinh: LAP(30, ['if not front_clear():', '    move()', 'else:', '    turn_right()']) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Lặp quá ít lượt: chưa kịp tới cờ', baiLam: { chinh: LAP(8, ['if front_clear():', '    move()', 'else:', '    turn_right()']) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Viết cứng đường đi của sân đầu: các sân sau còn khúc quẹo khác', baiLam: { chinh: ['move()', 'move()', 'move()', 'turn_right()', 'move()', 'move()', 'move()'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Mỗi lượt xe làm đúng một việc: hoặc tiến một ô, hoặc rẽ phải. Dùng if ... else.',
        'Cho cả đoạn if / else nằm trong một vòng for đủ dài; xe tới cờ là chương trình dừng ngay.']
    }),

    /* ------------------------------------------------------------- hàng 3: biến thể */
    man({
      so: 7, ten: 'Bám tường tay phải', hang: 'bien-the', hamCuaEmCan: ['move', 'turn_right', 'turn_left'], nhipTheoLoiGiai: true,
      cam: BA_HUONG,
      deBai: 'Cảm biến còn đo được ô bên phải xe: right_clear(), và bên trái: left_clear(). Đi qua ba mê cung nhỏ bằng cách luôn bám tường bên tay phải.',
      veMaMau: 'Chương trình có sẵn chỉ biết tiến hay rẽ phải khi gặp tường. Chạy thử, xem xe kẹt ở đâu rồi viết lại.',
      san: SAN_7,
      batDau: BD_7,
      maMau: { chinh: CHINH_6.slice() },
      sao: { o: 15, nhip: 70 },
      loiGiai: { chinh: CHINH_7.slice() },
      loiGiaiKhac: { moTa: 'Gói phần front_clear / turn_left vào else rồi lồng một if', baiLam: { chinh: LAP(60, ['if right_clear():', '    turn_right()', '    move()', 'else:', '    if front_clear():', '        move()', '    else:', '        turn_left()']) } },
      loiSai: [
        { moTa: 'Dùng lại cách của màn 6 (chỉ rẽ phải khi gặp tường): xe lạc vào ngõ cụt', baiLam: { chinh: CHINH_6.slice() }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Thiếu nhánh else: gặp ngõ cụt xe đứng yên mãi', baiLam: { chinh: LAP(60, ['if right_clear():', '    turn_right()', '    move()', 'elif front_clear():', '    move()']) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Bên phải trống mà không rẽ phải, chỉ tiến: xe bỏ qua lối rẽ', baiLam: { chinh: LAP(60, ['if right_clear():', '    move()', 'elif front_clear():', '    move()', 'else:', '    turn_left()']) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Dùng while True mà không có nhánh else: gặp ngõ cụt thì vòng while chạy mãi', baiLam: { chinh: ['while True:', '    if right_clear():', '        turn_right()', '        move()', '    elif front_clear():', '        move()'] }, phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Gọi hàm cảm biến chưa có: left_clear sai tên lệnh ở màn này', baiLam: { chinh: LAP(60, ['if rigth_clear():', '    turn_right()', '    move()', 'else:', '    turn_left()']) }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Thứ tự hỏi quan trọng: bên phải trước, rồi phía trước, cuối cùng mới tới quay lại.',
        'Rẽ phải xong thì tiến luôn một ô để vào lối vừa tìm thấy, nếu không xe sẽ quay tại chỗ mãi.']
    }),

    man({
      so: 8, ten: 'Vòng while chạy mãi', hang: 'bien-the', hamCuaEmCan: ['move', 'turn_right'],
      deBai: 'Ba hành lang chữ L, mỗi đoạn dài khác nhau. Chương trình có sẵn chạy mãi không dừng: tìm điều kiện sai trong vòng while và sửa lại cho xe tới cờ.',
      veMaMau: 'Chạy thử chương trình có sẵn: xe tới tường rồi cứ húc mãi. Xem vòng while nào không bao giờ dừng.',
      san: SAN_8,
      batDau: { x: 1, y: 5, huong: 0 },
      maMau: { chinh: nhieu(['while True:', '    move()'], ['turn_right()'], VONG_WHILE) },
      sao: { o: 10, nhip: 24 },
      loiGiai: { chinh: CHINH_8.slice() },
      loiGiaiKhac: { moTa: 'Đoạn đầu giữ while, đoạn sau thành vòng for chứa if', baiLam: { chinh: nhieu(VONG_WHILE, ['turn_right()'], LAP(9, ['if front_clear():', '    move()'])) } },
      loiSai: [
        { moTa: 'Chưa sửa gì: while True chạy mãi, xe húc tường không dừng', baiLam: { chinh: nhieu(['while True:', '    move()'], ['turn_right()'], VONG_WHILE) }, phaiCoMa: ['vong-vo-han', 'dam-tuong'] },
        { moTa: 'Điều kiện đảo bằng not: vòng không chạy lần nào, xe không đi', baiLam: { chinh: nhieu(['while not front_clear():', '    move()'], ['turn_right()'], VONG_WHILE) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Sửa điều kiện nhưng thân vòng chỉ chờ: điều kiện không bao giờ đổi', baiLam: { chinh: nhieu(['while front_clear():', '    wait()'], ['turn_right()'], VONG_WHILE) }, phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Bỏ vòng đầu, chỉ còn vòng sau: xe quay phải ngay tại chỗ', baiLam: { chinh: nhieu(['turn_right()'], VONG_WHILE) }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Vòng while dừng khi điều kiện sai. Điều kiện True thì sai lúc nào?',
        'Chỗ nào cho xe biết nó đã tới tường? Hãy hỏi cảm biến.']
    }),

    man({
      so: 9, ten: 'Mang vật tới tường', hang: 'bien-the', hamCuaEmCan: ['pick', 'drop', 'go_wall'], nhipTheoLoiGiai: true,
      tay: true,
      deBai: 'Một vật nằm dưới chân xe, ô đích ở sát tường cuối hành lang. Hành lang dài ngắn khác nhau ở ba sân: nhặt vật, mang tới tường rồi thả xuống ô đích.',
      veMaMau: 'Chương trình có sẵn mới nhặt vật. Chạy thử rồi viết tiếp.',
      san: SAN_9,
      batDau: BD_DUNG,
      maMau: { chinh: ['pick()'] },
      sao: { o: 18, nhip: 21 },
      loiGiai: { chinh: CHINH_9.slice() },
      loiGiaiKhac: { moTa: 'Đi tới tường bằng vòng for chứa biến cảm biến thay cho go_wall()', baiLam: { chinh: nhieu(['pick()'], LAP(9, ['co_duong = front_clear()', 'if co_duong:', '    move()']), ['drop()']) } },
      loiSai: [
        { moTa: 'Quên nhặt vật: thả xuống ô đích không có gì', baiLam: { chinh: ['go_wall()', 'drop()'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Đếm cứng theo sân đầu (2 ô): sân dài hơn vật bị thả giữa đường', baiLam: { chinh: ['pick()', 'move()', 'move()', 'drop()'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Đếm cứng theo sân dài nhất (6 ô): thắng cả ba sân nhưng xe húc tường ở sân ngắn nên mất nhịp', baiLam: { chinh: nhieu(['pick()'], LAP(6, 'move()'), ['drop()']) }, phaiCoMa: ['dam-tuong'] },
        { moTa: 'Quên thả vật ở cuối', baiLam: { chinh: ['pick()', 'go_wall()'] }, phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Nhặt xong thì đưa xe tới tường rồi mới thả; hàm em đã có sẵn cho cả ba việc.',
        'Ô đích nằm sát tường cuối hành lang ở cả ba sân.']
    }),

    /* ------------------------------------------------------------- trùm */
    man({
      so: 10, ten: 'Mê cung', hang: 'trum', hamCuaEmCan: ['move', 'turn_right', 'turn_left', 'go_wall'],
      cam: BA_HUONG,
      deBai: 'Ba mê cung hành lang: có lối rẽ trái, rẽ phải xen kẽ và vài ngõ cụt giả. Đi tới tường rồi chọn lối còn trống, ưu tiên bên phải, cho đến cờ.',
      veMaMau: 'Chương trình có sẵn mới đi hết đoạn đầu. Chạy thử, xem xe dừng ở chỗ rẽ nào rồi viết tiếp.',
      san: SAN_10,
      batDau: BD_10,
      maMau: { chinh: ['go_wall()'] },
      sao: { o: 16, nhip: 45 },
      huyHieu: { ma: 'khoang-cach', ten: 'Huy hiệu Cảm biến khoảng cách' },
      loiGiai: { chinh: CHINH_10.slice() },
      loiGiaiKhac: { moTa: 'Đoạn đầu viết thẳng vòng while thay cho go_wall() đầu tiên', baiLam: { chinh: nhieu(VONG_WHILE, LAP(20, ['if right_clear():', '    turn_right()', 'else:', '    turn_left()', 'go_wall()'])) } },
      loiSai: [
        { moTa: 'Luôn rẽ phải: ở chỗ chỉ rẽ trái được xe quay mặt vào tường rồi đứng đó', baiLam: { chinh: nhieu(['go_wall()'], LAP(20, ['turn_right()', 'go_wall()'])) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Chỉ rẽ phải khi bên phải trống, không thì không rẽ: gặp chỗ chỉ rẽ trái được xe đứng yên', baiLam: { chinh: nhieu(['go_wall()'], LAP(20, ['if right_clear():', '    turn_right()', 'go_wall()'])) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Rẽ xong quên đi tiếp tới tường: go_wall() chỉ gọi một lần ở đầu', baiLam: { chinh: nhieu(['go_wall()'], LAP(20, ['if right_clear():', '    turn_right()', 'else:', '    turn_left()'])) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Cứng số: đi tới tường, rẽ phải, đi tới tường, rẽ trái…: chỉ đúng một sân', baiLam: { chinh: ['go_wall()', 'turn_right()', 'go_wall()', 'turn_right()', 'go_wall()', 'turn_left()', 'go_wall()', 'turn_right()', 'go_wall()'] }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Sau mỗi lần go_wall(), xe đứng trước tường: hỏi right_clear() xem bên phải có lối không, nếu không thì rẽ trái.',
        'Ngõ cụt giả nằm bên trái chỗ rẽ phải đúng, và hai bên lối đi dọc đường: go_wall() bỏ qua chúng.']
    })
  ];

  ManHoc.them(DS);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();
