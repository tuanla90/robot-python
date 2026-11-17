/* ============================================================================
   man-m1-cambien.js — diem10code-python: MÙA 1 Kho hàng, CỘT 3 "+Cảm biến khoảng cách" (combo đầy đủ của mùa).
   front_clear() / left_clear() / right_clear() trả True / False, không tốn nhịp. Dạy if / while:
   từ hàng 4 có màn hai sân để code đếm cứng số ô không qua được.
   8 hàng theo khuôn mới ManHoc.khuonMoi (hoc/KE-HOACH-4-MUA-COT-LOI.md).
   ========================================================================== */
(function () {
  'use strict';
  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-co-so.js') : window.ManHoc;

  var HAM_GOC = ['forward', 'backward', 'turn_left', 'turn_right', 'pick', 'drop', 'front_clear', 'left_clear', 'right_clear'];
  var DO = ['while front_clear():', '    forward()'];
  function H(ten, than) { return { ten: ten, thamSo: [], than: than.slice() }; }
  function FOR(n, than) { return ['for i in range(' + n + '):'].concat(than.map(function (s) { return '    ' + s; })); }

  function man(so, m) {
    m.chuong = 'm1-c3-cam-bien';
    m.loaiRobot = 'banh'; m.robot = { than: 'hai-banh', tay: 'kep', camBien: [{ ma: 'khoang-cach', o: 'hong' }] };
    m.hamGoc = HAM_GOC.slice(); m.khung = Object.assign({ chinh: 10, moiHam: 10 }, m.khung);
    m.cauTruc = ['for', 'if', 'while'];
    m.moXuong = true;
    m.phienBanNoiDung = 4;                     // khuôn mới: đánh số lại các màn, bản nháp cũ không dùng nữa
    ManHoc.khuonMoi(so, m);
    m.camHamCuaEm = m.moXuong === false;
    return ManHoc.chuanHoa(m);
  }

  ManHoc.them([
    man(1, { ten: 'Tới tường rồi sao',
      deBai: 'front_clear() hỏi ô trước mặt có trống không, while lặp lại chừng nào câu trả lời còn là True. if chỉ làm khi điều kiện đúng. Đọc code và nhìn sân, đoán rồi bấm Chạy.',
      san: ['.#..', '..F.', '....', '....', '....'],
      batDau: { x: 1, y: 4, huong: 0 },
      duDoan: { hoi: 'Khi xe đã sát tường, xe làm gì tiếp?', luaChon: ['Đứng yên', 'Rẽ phải, đi 1 ô', 'Rẽ trái, đi 1 ô'], dung: 1, xacMinh: { x: 2, y: 1, huong: 1 } },
      sao: { o: 5, nhip: 6 },
      loiGiai: { chinh: DO.concat(['if right_clear():', '    turn_right()', '    forward()']) } }),

    man(2, { ten: 'Dò tới sát thùng',
      deBai: 'Vật cũng chặn cảm biến. Thân vòng while đang trống: điền lệnh để xe dò tới sát thùng, rồi nhặt và mang tới ô đích.',
      san: ['.D..', '....', '.o..', '....', '....', '....'],
      batDau: { x: 1, y: 5, huong: 0 },
      mucTieu: 'dua-vat',
      maMau: { chinh: ['while front_clear():', '    ', 'pick()', 'forward()', 'forward()', 'drop()'] },
      goiY: ['Trong khi trước mặt còn trống thì xe làm gì?'],
      sao: { o: 6, nhip: 8 },
      loiGiai: { chinh: DO.concat(['pick()', 'forward()', 'forward()', 'drop()']) } }),

    man(3, { ten: 'Chỉ đi được một ô',
      deBai: 'Code này sai đúng 1 chỗ: xe chỉ tiến 1 ô rồi rẽ luôn. Tìm rồi sửa để xe đi tới sát tường mới rẽ.',
      san: ['.#....', '....F#', '......', '......', '......'],
      batDau: { x: 1, y: 4, huong: 0 },
      maMau: { chinh: ['if front_clear():', '    forward()', 'turn_right()'].concat(DO) },
      goiY: ['if chỉ hỏi một lần. Khối nào hỏi lại sau mỗi bước đi?'],
      sao: { o: 5, nhip: 8 },
      loiGiai: { chinh: DO.concat(['turn_right()'], DO) } }),

    man(4, { ten: 'Hai sân, một chương trình',
      deBai: 'Chạm ảnh nhỏ để xem hai sân: tường và cờ khác chỗ nhau. Tự viết một chương trình đưa xe tới cờ ở cả hai sân.',
      san: [
        ['.#.', '..F', '...', '...', '...', '...'],
        ['...', '...', '.#.', 'F.#', '...', '...']
      ],
      batDau: [{ x: 1, y: 5, huong: 0 }, { x: 1, y: 5, huong: 0 }],
      goiY: ['Không đếm số ô được: mỗi sân đường dài khác nhau. Dò bằng while.', 'Sát tường rồi, hỏi bên phải có trống không. Nếu không thì rẽ bên kia: if ... else.', 'Rẽ xong còn phải tiến thêm 1 ô.'],
      sao: { o: 7, nhip: 7 },
      loiGiai: { chinh: DO.concat(['if right_clear():', '    turn_right()', 'else:', '    turn_left()', 'forward()']) } }),

    man(5, { ten: 'Đường vòng hay lối tắt',
      deBai: 'Có đường vòng quanh kho và một lối tắt giữa kho. Một sao cho bài gọn, một sao cho bài nhanh, có thể lấy bằng hai bài khác nhau.',
      san: ['.......', '.#####.', '.##...F', '.##.###', '.##.###', '....###', '.######'],
      batDau: { x: 0, y: 6, huong: 0 },
      goiY: ['Đường vòng chỉ cần dò tới tường rồi rẽ, viết rất gọn nhưng đi xa.', 'Lối tắt ngắn hơn, nhưng phải rẽ đúng chỗ nên viết nhiều dòng hơn.'],
      sao: { o: 8, nhip: 16 },
      doiCho: true,
      loiGiai: { chinh: DO.concat(['turn_right()'], DO, ['turn_right()'], DO) },
      cachKhac: [{ chinh: ['forward()', 'turn_right()'].concat(DO, ['turn_left()'], DO, ['turn_right()'], DO) }] }),

    man(6, { ten: 'Hành lang gấp khúc: tự viết hàm',
      deBai: 'Vòng while dò tường cứ lặp lại mỗi đoạn hành lang, nhưng lúc rẽ phải, lúc rẽ trái, lại có hốc cụt hai bên nên không lặp bằng for được. Tạo một hàm tên tùy em để gọi lại. Chương trình chính chỉ có 5 ô.',
      san: ['#######F', '#######.', '#.#####.', '........', '.####.##', '.#######', '.#######'],
      batDau: { x: 0, y: 6, huong: 0 },
      khung: { chinh: 5 },
      goiY: ['Một đoạn hành lang: dò tới sát tường. Gom hai dòng đó vào hàm.', 'Chương trình chính: gọi hàm, rẽ phải, gọi hàm, rẽ trái, gọi hàm.'],
      sao: { o: 7, nhip: 17 },
      loiGiai: { chinh: ['do_tuong()', 'turn_right()', 'do_tuong()', 'turn_left()', 'do_tuong()'], hamCuaEmMoi: [H('do_tuong', DO)] } }),

    man(7, { ten: 'Lặp cho gọn hay viết đủ',
      deBai: 'Hai sân khác hướng rẽ, mỗi sân có một hốc bên phải. Cách nào cũng được, miễn chạy xong xe đứng trên cờ ở cả hai sân. Một sao cho bài gọn, một sao cho bài nhanh.',
      san: [
        ['.####', 'F..##', '.#.##', '##.##', '##..#', '##.##'],
        ['####.', '##..F', '##.#.', '##.##', '##..#', '##.##']
      ],
      batDau: [{ x: 2, y: 5, huong: 0 }, { x: 2, y: 5, huong: 0 }],
      goiY: ['Dò thẳng tới tường rồi mới hỏi nên rẽ bên nào, xe khỏi chui vào hốc.', 'Hai đoạn giống nhau thì lặp được cho gọn, nhưng lần lặp cuối xe vẫn xoay thêm một nhịp trên cờ.'],
      sao: { o: 7, nhip: 8 },
      doiCho: true,
      loiGiai: { chinh: FOR(2, DO.concat(['if right_clear():', '    turn_right()', 'else:', '    turn_left()'])) },
      cachKhac: [{ chinh: DO.concat(['if right_clear():', '    turn_right()', 'else:', '    turn_left()'], DO) }] }),

    man(8, { ten: 'Xưởng tối',
      deBai: 'Thùng và ô đích mỗi sân một chỗ. Dò tới thùng, nhặt, mang tới ô đích. Chương trình chính chỉ có 10 ô.',
      san: [
        ['.....', 'o..D.', '....#', '.....', '.....', '.....'],
        ['.....', '.....', '.....', 'o.D..', '...#.', '.....']
      ],
      batDau: [{ x: 0, y: 5, huong: 0 }, { x: 0, y: 5, huong: 0 }],
      mucTieu: 'dua-vat',
      sao: { o: 8, nhip: 14 },
      loiGiai: {
        chinh: DO.concat(['pick()', 'turn_right()'], DO, ['turn_left()', 'drop()'])
      },
      huyHieu: { ma: 'm1-c3-cam-bien', ten: 'Thợ dò đường' } })
  ]);

  if (laNode) module.exports = ManHoc;
})();
