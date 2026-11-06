/* ============================================================================
   man-m1-san.js — diem10code-python: MÙA 1 Kho hàng, CỘT 4 "+Sân" (combo đầy đủ + môi trường kho hàng).
   M = nút đè (vật / xe nằm trên M thì bật); C = cửa đóng lúc đầu (nút bật thì mở); c = cửa mở lúc đầu
   (nút bật thì đóng). Đặt THÙNG lên nút để giữ cửa mở sau khi xe đi khỏi. Hàng 8 là TRÙM CỦA MÙA.
   8 hàng theo khuôn ManHoc.khuon (hoc/KE-HOACH-4-MUA-COT-LOI.md).
   ========================================================================== */
(function () {
  'use strict';
  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-co-so.js') : window.ManHoc;

  var HAM_GOC = ['up', 'down', 'turn_left', 'turn_right', 'wait', 'arm_down', 'arm_up', 'grab', 'release', 'front_clear', 'left_clear', 'right_clear'];
  var T_PICK = ['arm_down()', 'grab()', 'wait()', 'arm_up()', 'wait()'];
  var T_DROP = ['arm_down()', 'release()', 'wait()', 'arm_up()', 'wait()'];
  var DO = ['while front_clear():', '    up()'];
  function H(ten, than) { return { ten: ten, thamSo: [], than: than.slice() }; }
  function HAM() { return [H('pick', T_PICK), H('drop', T_DROP)]; }
  function FOR(n, than) { return ['for i in range(' + n + '):'].concat(than.map(function (s) { return '    ' + s; })); }

  function man(so, m) {
    m.chuong = 'm1-c4-san';
    m.loaiRobot = 'banh'; m.robot = { than: 'hai-banh', tay: 'kep', camBien: [{ ma: 'khoang-cach', o: 'hong' }] };
    m.hamGoc = HAM_GOC.slice(); m.khung = Object.assign({ chinh: 10, moiHam: 10 }, m.khung);
    m.cauTruc = ['for', 'if', 'while'];
    m.moXuong = true;
    ManHoc.khuon(so, m);
    m.camHamCuaEm = m.moXuong === false;
    return ManHoc.chuanHoa(m);
  }

  ManHoc.them([
    man(1, { ten: 'Đứng lên nút',
      deBai: 'Bấm Chạy và xem: xe đứng lên nút M thì cửa C phía trên mở ra.',
      san: ['###', '#F#', '#C#', '#M#', '#.#'],
      batDau: { x: 1, y: 4, huong: 0 },
      sao: { o: 3, nhip: 3 },
      loiGiai: { chinh: ['up()', 'up()', 'up()'] } }),

    man(2, { ten: 'Thùng giữ cửa',
      deBai: 'Xe không đứng lại trên nút mà cửa vẫn phải mở. Đọc code và nhìn sân, đoán rồi bấm Chạy.',
      san: ['#####', '##F##', '##C##', '#Mo##', '##.##'],
      batDau: { x: 2, y: 4, huong: 0 },
      duDoan: { hoi: 'Lúc xe đi qua cửa C, cái gì đang đè lên nút M?', luaChon: ['Xe', 'Thùng', 'Không có gì'], dung: 1, xacMinh: { vat: [{ x: 1, y: 3 }] } },
      sao: { o: 17, nhip: 9 },
      loiGiai: { chinh: ['pick()', 'up()', 'turn_left()', 'drop()', 'turn_right()', 'up()', 'up()'], hamCuaMan: HAM() } }),

    man(3, { ten: 'Quay mặt vào nút',
      deBai: 'Thiếu một lệnh ở ô trống, nên thùng chưa lên được nút M. Điền vào để cửa C mở rồi đi qua hành lang tới cờ.',
      san: ['#####', '##F##', '##.##', '##C##', '#Mo##', '##.##'],
      batDau: { x: 2, y: 5, huong: 0 },
      maMau: { chinh: ['pick()', 'up()', '', 'drop()', 'turn_right()', 'up()', 'up()', 'up()'] },
      goiY: ['Tay đặt thùng vào ô trước mũi xe, mà nút M nằm bên trái xe.'],
      sao: { o: 18, nhip: 10 },
      loiGiai: { chinh: ['pick()', 'up()', 'turn_left()', 'drop()', 'turn_right()', 'up()', 'up()', 'up()'], hamCuaMan: HAM() } }),

    man(4, { ten: 'Nút bên phải',
      deBai: 'Đủ lệnh nhưng sai thứ tự. Giữ một dòng rồi kéo sang chỗ đúng: nhặt thùng, đặt lên nút M, rồi đi qua cửa.',
      san: ['#####', '##F##', '##C##', '##oM#', '##.##'],
      batDau: { x: 2, y: 4, huong: 0 },
      maMau: { chinh: ['turn_right()', 'pick()', 'up()', 'turn_left()', 'drop()', 'up()', 'up()'] },
      goiY: ['Xe phải đứng ở ô thùng cũ, quay mặt vào M rồi mới đặt.'],
      sao: { o: 17, nhip: 9 },
      loiGiai: { chinh: ['pick()', 'up()', 'turn_right()', 'drop()', 'turn_left()', 'up()', 'up()'], hamCuaMan: HAM() } }),

    man(5, { ten: 'Đặt nhầm phía',
      deBai: 'Code này sai đúng 1 chỗ: xe không đặt được thùng lên nút M. Bấm Chạy xem lỗi, rồi sửa dòng sai.',
      san: ['#####', '##F##', '##.##', '##C##', '#Mo##', '##.##'],
      batDau: { x: 2, y: 5, huong: 0 },
      maMau: { chinh: ['pick()', 'up()', 'turn_right()', 'drop()', 'turn_right()', 'up()', 'up()', 'up()'] },
      goiY: ['Nhìn sân: nút M nằm bên nào của xe lúc xe đứng ở ô thùng?'],
      sao: { o: 18, nhip: 10 },
      loiGiai: { chinh: ['pick()', 'up()', 'turn_left()', 'drop()', 'turn_right()', 'up()', 'up()', 'up()'], hamCuaMan: HAM() } }),

    man(6, { ten: 'Một nút, hai cửa',
      deBai: 'Màn trống, em tự viết: tới cờ. Nút M mở cửa C nhưng lại đóng cửa c đang mở sẵn. Hàm pick() và drop() của màn có sẵn trong khay.',
      san: ['####', '#F##', '#C##', '#.M#', '#c##', '#o##', '#.##'],
      batDau: { x: 1, y: 6, huong: 0 },
      goiY: ['Đè nút thì c đóng, nên phải đi qua c TRƯỚC khi đè nút.', 'Mang thùng qua c rồi đặt lên M, cửa C mới mở.'],
      sao: { o: 19, nhip: 11 },
      loiGiai: { chinh: ['pick()', 'up()', 'up()', 'up()', 'turn_right()', 'drop()', 'turn_left()', 'up()', 'up()'], hamCuaMan: HAM() } }),

    man(7, { ten: 'Hai cổng: tự viết hàm',
      deBai: 'Hai cổng giống hệt nhau, mỗi cổng một thùng một nút. Tự viết hàm tên tùy em cho một lượt qua cổng rồi gọi trong for. Chương trình chính chỉ có 3 ô.',
      san: ['#####', '##F##', '##C##', '#Mo##', '##.##', '##C##', '#Mo##', '##.##'],
      batDau: { x: 2, y: 7, huong: 0 },
      noi: [{ nut: { x: 1, y: 6 }, cua: [{ x: 2, y: 5 }] }, { nut: { x: 1, y: 3 }, cua: [{ x: 2, y: 2 }] }],
      khung: { chinh: 3 },
      goiY: ['Một lượt: nhặt thùng, tiến, quay vào nút, đặt, quay lại, tiến qua cửa.', 'Hàm được gọi hàm khác: có thể tách riêng hàm nhặt và hàm đặt.'],
      sao: { o: 19, nhip: 18 },
      loiGiai: {
        chinh: FOR(2, ['qua_cong()']),
        hamCuaEmMoi: [H('nhat', T_PICK), H('dat', T_DROP), H('qua_cong', ['nhat()', 'up()', 'turn_left()', 'dat()', 'turn_right()', 'up()', 'up()'])]
      } }),

    man(8, { ten: 'TRÙM: Kho hàng xuất xưởng',
      deBai: 'Màn trùm của mùa. Hai sân khác nhau: dò tới thùng, đặt lên nút M để mở cửa, đi hết hành lang, rẽ về phía còn trống rồi dò tới cờ. Chương trình chính chỉ có 10 ô.',
      san: [
        ['######', '##..F#', '##C###', '#Mo###', '##.###', '##.###', '##.###'],
        ['######', 'F..###', '##.###', '##.###', '##C###', '#Mo###', '##.###']
      ],
      batDau: [{ x: 2, y: 6, huong: 0 }, { x: 2, y: 6, huong: 0 }],
      sao: { o: 25, nhip: 14 },
      loiGiai: {
        chinh: ['do_tuong()', 'de_nut()', 'do_tuong()', 'if right_clear():', '    turn_right()', 'else:', '    turn_left()', 'do_tuong()'],
        hamCuaEmMoi: [H('do_tuong', DO), H('nhat', T_PICK), H('dat', T_DROP), H('de_nut', ['nhat()', 'up()', 'turn_left()', 'dat()', 'turn_right()'])]
      },
      huyHieu: { ma: 'kho-cu', ten: 'Kho hàng xuất xưởng' } })
  ]);

  if (laNode) module.exports = ManHoc;
})();
