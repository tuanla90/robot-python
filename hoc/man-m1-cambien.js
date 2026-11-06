/* ============================================================================
   man-m1-cambien.js — diem10code-python: MÙA 1 Kho hàng, CỘT 3 "+Cảm biến khoảng cách" (combo đầy đủ của mùa).
   front_clear() / left_clear() / right_clear() trả True / False, không tốn nhịp. Dạy if / while:
   từ hàng 6 có màn hai sân để code đếm cứng số ô không qua được.
   8 hàng theo khuôn ManHoc.khuon (hoc/KE-HOACH-4-MUA-COT-LOI.md).
   ========================================================================== */
(function () {
  'use strict';
  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-co-so.js') : window.ManHoc;

  var HAM_GOC = ['forward', 'backward', 'turn_left', 'turn_right', 'arm_down', 'arm_up', 'grab', 'release', 'front_clear', 'left_clear', 'right_clear'];
  var T_PICK = ['arm_down()', 'grab()', 'arm_up()'];
  var T_DROP = ['arm_down()', 'release()', 'arm_up()'];
  var DO = ['while front_clear():', '    forward()'];
  function H(ten, than) { return { ten: ten, thamSo: [], than: than.slice() }; }

  function man(so, m) {
    m.chuong = 'm1-c3-cam-bien';
    m.loaiRobot = 'banh'; m.robot = { than: 'hai-banh', tay: 'kep', camBien: [{ ma: 'khoang-cach', o: 'hong' }] };
    m.hamGoc = HAM_GOC.slice(); m.khung = Object.assign({ chinh: 10, moiHam: 10 }, m.khung);
    m.cauTruc = ['for', 'if', 'while'];
    m.moXuong = true;
    m.phienBanNoiDung = 2;                     // lệnh tay tự chiếm nhịp, bỏ wait(): bản nháp cũ không dùng nữa
    ManHoc.khuon(so, m);
    m.camHamCuaEm = m.moXuong === false;
    return ManHoc.chuanHoa(m);
  }

  ManHoc.them([
    man(1, { ten: 'Đi tới khi gặp tường',
      deBai: 'Bấm Chạy và xem: front_clear() hỏi ô trước mặt có trống không. while lặp lại chừng nào câu trả lời còn là True.',
      san: ['.#..', '.F..', '....', '....'],
      batDau: { x: 1, y: 3, huong: 0 },
      sao: { o: 2, nhip: 2 },
      loiGiai: { chinh: DO.slice() } }),

    man(2, { ten: 'Tới tường rồi sao',
      deBai: 'Thêm if: chỉ làm khi điều kiện đúng. Đọc code và nhìn sân, đoán rồi bấm Chạy.',
      san: ['.#..', '..F.', '....', '....', '....'],
      batDau: { x: 1, y: 4, huong: 0 },
      duDoan: { hoi: 'Khi xe đã sát tường, xe làm gì tiếp?', luaChon: ['Đứng yên', 'Rẽ phải, đi 1 ô', 'Rẽ trái, đi 1 ô'], dung: 1, xacMinh: { x: 2, y: 1, huong: 1 } },
      sao: { o: 5, nhip: 5 },
      loiGiai: { chinh: DO.concat(['if right_clear():', '    turn_right()', '    forward()']) } }),

    man(3, { ten: 'Dò tới sát thùng',
      deBai: 'Vật cũng chặn cảm biến. Thân vòng while đang trống: điền lệnh để xe dò tới sát thùng, rồi nhặt và mang tới ô đích.',
      san: ['.D..', '....', '.o..', '....', '....', '....'],
      batDau: { x: 1, y: 5, huong: 0 },
      mucTieu: 'dua-vat',
      maMau: { chinh: ['while front_clear():', '    ', 'pick()', 'forward()', 'forward()', 'drop()'] },
      goiY: ['Trong khi trước mặt còn trống thì xe làm gì?'],
      sao: { o: 12, nhip: 9 },
      loiGiai: { chinh: DO.concat(['pick()', 'forward()', 'forward()', 'drop()']), hamCuaMan: [H('pick', T_PICK), H('drop', T_DROP)] } }),

    man(4, { ten: 'Hai lần rẽ đổi chỗ',
      deBai: 'Đủ lệnh nhưng hai lần rẽ đang đứng sai chỗ. Giữ một dòng rồi kéo sang chỗ đúng để xe tới cờ.',
      san: ['#..F.', '....#', '.....', '.....', '.....'],
      batDau: { x: 0, y: 4, huong: 0 },
      maMau: { chinh: DO.concat(['turn_left()'], DO, ['turn_right()'], DO) },
      goiY: ['Nhìn đoạn thứ hai của đường: xe phải đi sang bên nào trước?'],
      sao: { o: 8, nhip: 9 },
      loiGiai: { chinh: DO.concat(['turn_right()'], DO, ['turn_left()'], DO) } }),

    man(5, { ten: 'Chỉ đi được một ô',
      deBai: 'Code này sai đúng 1 chỗ: xe chỉ tiến 1 ô rồi rẽ luôn. Tìm rồi sửa để xe đi tới sát tường mới rẽ.',
      san: ['.#....', '....F#', '......', '......', '......'],
      batDau: { x: 1, y: 4, huong: 0 },
      maMau: { chinh: ['if front_clear():', '    forward()', 'turn_right()'].concat(DO) },
      goiY: ['if chỉ hỏi một lần. Khối nào hỏi lại sau mỗi bước đi?'],
      sao: { o: 5, nhip: 7 },
      loiGiai: { chinh: DO.concat(['turn_right()'], DO) } }),

    man(6, { ten: 'Hai sân, một chương trình',
      deBai: 'Chạm ảnh nhỏ để xem hai sân: tường và cờ khác chỗ nhau. Tự viết một chương trình đưa xe tới cờ ở cả hai sân.',
      san: [
        ['.#.', '..F', '...', '...', '...', '...'],
        ['...', '...', '.#.', 'F.#', '...', '...']
      ],
      batDau: [{ x: 1, y: 5, huong: 0 }, { x: 1, y: 5, huong: 0 }],
      goiY: ['Không đếm số ô được: mỗi sân đường dài khác nhau. Dò bằng while.', 'Sát tường rồi, hỏi bên phải có trống không. Nếu không thì rẽ bên kia: if ... else.', 'Rẽ xong còn phải tiến thêm 1 ô.'],
      sao: { o: 7, nhip: 6 },
      loiGiai: { chinh: DO.concat(['if right_clear():', '    turn_right()', 'else:', '    turn_left()', 'forward()']) } }),

    man(7, { ten: 'Hành lang vuông: tự viết hàm',
      deBai: 'Vòng while dò tường cứ lặp lại mỗi đoạn hành lang. Tạo một hàm tên tùy em để gọi lại. Chương trình chính chỉ có 5 ô.',
      san: ['.....', '.###.', '.###F', '.####', '.####'],
      batDau: { x: 0, y: 4, huong: 0 },
      khung: { chinh: 5 },
      goiY: ['Một đoạn hành lang: dò tới sát tường. Gom hai dòng đó vào hàm.', 'Chương trình chính: gọi hàm, rẽ phải, gọi hàm, rẽ phải, gọi hàm.'],
      sao: { o: 7, nhip: 12 },
      loiGiai: { chinh: ['do_tuong()', 'turn_right()', 'do_tuong()', 'turn_right()', 'do_tuong()'], hamCuaEmMoi: [H('do_tuong', DO)] } }),

    man(8, { ten: 'Xưởng tối',
      deBai: 'Thùng và ô đích mỗi sân một chỗ. Dò tới thùng, nhặt, mang tới ô đích. Chương trình chính chỉ có 10 ô.',
      san: [
        ['.....', 'o..D.', '....#', '.....', '.....', '.....'],
        ['.....', '.....', '.....', 'o.D..', '...#.', '.....']
      ],
      batDau: [{ x: 0, y: 5, huong: 0 }, { x: 0, y: 5, huong: 0 }],
      mucTieu: 'dua-vat',
      sao: { o: 14, nhip: 13 },
      loiGiai: {
        chinh: DO.concat(['nhat()', 'turn_right()'], DO, ['turn_left()', 'dat()']),
        hamCuaEmMoi: [H('nhat', T_PICK), H('dat', T_DROP)]
      },
      huyHieu: { ma: 'khoang-cach', ten: 'Thợ dò đường' } })
  ]);

  if (laNode) module.exports = ManHoc;
})();
