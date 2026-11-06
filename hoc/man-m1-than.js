/* ============================================================================
   man-m1-than.js — diem10code-python: MÙA 1 Kho hàng, CỘT 1 "Thân" (hai bánh một mình).
   Chưa có tay, chưa có cảm biến. 4 lệnh gốc up()/down()/turn_left()/turn_right(), mỗi
   lệnh tự chiếm 1 nhịp nên khay không có wait(). Dạy for; hàng 7 lần đầu mở Xưởng hàm.
   8 hàng theo khuôn ManHoc.khuon (hoc/KE-HOACH-4-MUA-COT-LOI.md).
   ========================================================================== */
(function () {
  'use strict';
  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-co-so.js') : window.ManHoc;

  var HAM_GOC = ['up', 'down', 'turn_left', 'turn_right'];
  function FOR(n, than) { return ['for i in range(' + n + '):'].concat(than.map(function (s) { return '    ' + s; })); }
  function H(ten, than) { return { ten: ten, thamSo: [], than: than.slice() }; }

  function man(so, m) {
    m.chuong = 'm1-c1-than';
    m.loaiRobot = 'banh'; m.robot = { than: 'hai-banh', tay: null };
    m.hamGoc = HAM_GOC.slice(); m.khung = Object.assign({ chinh: 10, moiHam: 10 }, m.khung);
    m.cauTruc = so === 1 ? [] : ['for'];
    m.moXuong = false;
    ManHoc.khuon(so, m);
    m.camHamCuaEm = m.moXuong === false;
    return ManHoc.chuanHoa(m);
  }

  ManHoc.them([
    man(1, { ten: 'Xe lăn bánh',
      deBai: 'Bấm Chạy và xem: up() cho xe tiến 1 ô, turn_right() quay xe sang phải tại chỗ. Mỗi lệnh đúng 1 nhịp.',
      san: ['....', '..F.', '....', '....'],
      batDau: { x: 0, y: 3, huong: 0 },
      sao: { o: 5, nhip: 5 },
      loiGiai: { chinh: ['up()', 'up()', 'turn_right()', 'up()', 'up()'] } }),

    man(2, { ten: 'Vòng for chạy mấy lần',
      deBai: 'Khối for lặp lại các dòng thụt vào bên trong nó. Đọc code, đoán trước rồi bấm Chạy để kiểm tra.',
      san: ['.....', '..F..', '.....', '.....', '.....'],
      batDau: { x: 3, y: 4, huong: 0 },
      duDoan: { hoi: 'Chạy xong, up() đã chạy tổng cộng mấy lần?', luaChon: ['3 lần', '4 lần', '5 lần'], dung: 1, xacMinh: { lenh: { up: 4 } } },
      sao: { o: 4, nhip: 5 },
      loiGiai: { chinh: FOR(3, ['up()']).concat(['turn_left()', 'up()']) } }),

    man(3, { ten: 'Lùi một ô',
      deBai: 'Phía trước là tường. Điền một lệnh vào ô trống để xe xuống đúng hàng có cờ. down() lùi 1 ô mà không quay.',
      san: ['..#', '...', 'F..'],
      batDau: { x: 2, y: 1, huong: 0 },
      maMau: { chinh: [''].concat(['turn_left()'], FOR(2, ['up()'])) },
      goiY: ['Cờ ở hàng dưới xe một ô. Xe đang quay mặt lên, vậy lệnh nào đưa xe xuống mà không cần quay?'],
      sao: { o: 4, nhip: 4 },
      loiGiai: { chinh: ['down()', 'turn_left()'].concat(FOR(2, ['up()'])) } }),

    man(4, { ten: 'Xếp lại đường đi',
      deBai: 'Đủ lệnh rồi nhưng sai thứ tự. Giữ một dòng rồi kéo sang chỗ đúng để xe tới cờ.',
      san: ['....', '..F.', '....', '....'],
      batDau: { x: 0, y: 3, huong: 0 },
      maMau: { chinh: ['up()', 'turn_left()', 'up()', 'turn_right()', 'up()', 'up()'] },
      goiY: ['Đi theo từng đoạn: nhìn sân rồi đọc xe phải quay lúc nào.'],
      sao: { o: 6, nhip: 6 },
      loiGiai: { chinh: ['up()', 'turn_right()', 'up()', 'up()', 'turn_left()', 'up()'] } }),

    man(5, { ten: 'Thiếu một bước',
      deBai: 'Code này sai đúng 1 chỗ nên xe đi lệch hàng. Tìm rồi sửa. Chạm con số trong range(...) là đổi được số.',
      san: ['.....', '...F.', '.....', '.....', '.....'],
      batDau: { x: 0, y: 4, huong: 0 },
      maMau: { chinh: FOR(2, ['up()']).concat(['turn_right()'], FOR(3, ['up()'])) },
      goiY: ['Đếm số ô từ xe lên tới hàng có cờ rồi so với số trong for đầu tiên.'],
      sao: { o: 5, nhip: 7 },
      loiGiai: { chinh: FOR(3, ['up()']).concat(['turn_right()'], FOR(3, ['up()'])) } }),

    man(6, { ten: 'Đi vòng qua kệ hàng',
      deBai: 'Màn trống, em tự viết từ đầu: đưa xe men theo lối đi tới cờ.',
      san: ['F....', '####.', '####.', '####.', '####.'],
      batDau: { x: 4, y: 4, huong: 0 },
      goiY: ['Đường đi gồm hai đoạn thẳng, giữa hai đoạn là một lần rẽ.', 'Đi thẳng nhiều ô thì dùng for cho ngắn: for i in range(n).', 'Đếm đúng số ô của từng đoạn, không tính ô xe đang đứng.'],
      sao: { o: 5, nhip: 9 },
      loiGiai: { chinh: FOR(4, ['up()']).concat(['turn_left()'], FOR(4, ['up()'])) } }),

    man(7, { ten: 'Bậc thang: tự đặt tên hàm',
      deBai: 'Thao tác "sang phải 1 ô, lên 1 ô" cứ lặp lại. Bấm Hàm mới, đặt tên tùy em, gom thao tác đó vào hàm rồi gọi trong for. Chương trình chính chỉ có 3 ô.',
      san: ['###F', '##..', '#..#', '..##'],
      batDau: { x: 0, y: 3, huong: 0 },
      khung: { chinh: 3 },
      goiY: ['Một bậc thang gồm 4 lệnh: quay phải, tiến, quay trái, tiến.', 'Có 3 bậc. Chương trình chính chỉ cần một for gọi hàm của em.'],
      sao: { o: 6, nhip: 12 },
      loiGiai: { chinh: FOR(3, ['step()']), hamCuaEmMoi: [H('step', ['turn_right()', 'up()', 'turn_left()', 'up()'])] } }),

    man(8, { ten: 'Lối đi ngoằn ngoèo',
      deBai: 'Tới cờ qua lối đi ngoằn ngoèo. Chương trình chính chỉ có 10 ô, em tự tìm cách viết gọn.',
      san: ['...#..F', '.#.#.##', '.#...##'],
      batDau: { x: 0, y: 2, huong: 0 },
      sao: { o: 14, nhip: 17 },
      loiGiai: {
        chinh: ['hop()', 'turn_right()', 'up()', 'up()', 'turn_left()', 'up()', 'up()', 'turn_left()', 'hop()'],
        hamCuaEmMoi: [H('hop', ['up()', 'up()', 'turn_right()', 'up()', 'up()'])]
      },
      huyHieu: { ma: 'hai-banh', ten: 'Tay lái hai bánh' } })
  ]);

  if (laNode) module.exports = ManHoc;
})();
