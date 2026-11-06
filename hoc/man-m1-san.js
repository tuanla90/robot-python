/* ============================================================================
   man-m1-san.js — diem10code-python: MÙA 1 Kho hàng, CỘT 4 "+Sân" (combo đầy đủ + môi trường kho hàng).
   M = nút đè (vật / xe nằm trên M thì bật); C = cửa đóng lúc đầu (nút bật thì mở); c = cửa mở lúc đầu
   (nút bật thì đóng). Đặt THÙNG lên nút để giữ cửa mở sau khi xe đi khỏi. Hàng 8 là TRÙM CỦA MÙA.
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
    m.chuong = 'm1-c4-san';
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
    man(1, { ten: 'Thùng giữ cửa',
      deBai: 'Có xe hay thùng đè lên nút M thì cửa C mở ra. Ở đây xe không đứng lại trên nút mà cửa vẫn phải mở. Đọc code và nhìn sân, đoán rồi bấm Chạy.',
      san: ['#####', '##F##', '##C##', '#Mo##', '##.##'],
      batDau: { x: 2, y: 4, huong: 0 },
      duDoan: { hoi: 'Lúc xe đi qua cửa C, cái gì đang đè lên nút M?', luaChon: ['Xe', 'Thùng', 'Không có gì'], dung: 1, xacMinh: { vat: [{ x: 1, y: 3 }] } },
      sao: { o: 7, nhip: 11 },
      loiGiai: { chinh: ['pick()', 'forward()', 'turn_left()', 'drop()', 'turn_right()', 'forward()', 'forward()'] } }),

    man(2, { ten: 'Nút bên phải', dangBai: 'sap-xep',
      deBai: 'Đủ lệnh nhưng sai thứ tự. Giữ một dòng rồi kéo sang chỗ đúng: nhặt thùng, đặt lên nút M, rồi đi qua cửa.',
      san: ['#####', '##F##', '##C##', '##oM#', '##.##'],
      batDau: { x: 2, y: 4, huong: 0 },
      maMau: { chinh: ['turn_right()', 'pick()', 'forward()', 'turn_left()', 'drop()', 'forward()', 'forward()'] },
      goiY: ['Xe phải đứng ở ô thùng cũ, quay mặt vào M rồi mới đặt.'],
      sao: { o: 7, nhip: 11 },
      loiGiai: { chinh: ['pick()', 'forward()', 'turn_right()', 'drop()', 'turn_left()', 'forward()', 'forward()'] } }),

    man(3, { ten: 'Đặt nhầm phía',
      deBai: 'Code này sai đúng 1 chỗ: xe không đặt được thùng lên nút M. Bấm Chạy xem lỗi, rồi sửa dòng sai.',
      san: ['#####', '##F##', '##.##', '##C##', '#Mo##', '##.##'],
      batDau: { x: 2, y: 5, huong: 0 },
      maMau: { chinh: ['pick()', 'forward()', 'turn_right()', 'drop()', 'turn_right()', 'forward()', 'forward()', 'forward()'] },
      goiY: ['Nhìn sân: nút M nằm bên nào của xe lúc xe đứng ở ô thùng?'],
      sao: { o: 8, nhip: 12 },
      loiGiai: { chinh: ['pick()', 'forward()', 'turn_left()', 'drop()', 'turn_right()', 'forward()', 'forward()', 'forward()'] } }),

    man(4, { ten: 'Một nút, hai cửa',
      deBai: 'Màn trống, em tự viết: tới cờ. Nút M mở cửa C nhưng lại đóng cửa c đang mở sẵn.',
      san: ['####', '#F##', '#C##', '#.M#', '#c##', '#o##', '#.##'],
      batDau: { x: 1, y: 6, huong: 0 },
      goiY: ['Đè nút thì c đóng, nên phải đi qua c TRƯỚC khi đè nút.', 'Mang thùng qua c rồi đặt lên M, cửa C mới mở.'],
      sao: { o: 9, nhip: 13 },
      loiGiai: { chinh: ['pick()', 'forward()', 'forward()', 'forward()', 'turn_right()', 'drop()', 'turn_left()', 'forward()', 'forward()'] } }),

    man(5, { ten: 'Mở cửa hay đi vòng',
      deBai: 'Tới cờ bằng đường vòng quanh kho, hoặc mở cửa C đi thẳng qua giữa. Một sao cho bài gọn, một sao cho bài nhanh, có thể lấy bằng hai bài khác nhau.',
      san: ['.......', '.#####.', '.#####.', '.M####.', '.o..C.F', '.######', '.######', '.######'],
      batDau: { x: 0, y: 7, huong: 0 },
      goiY: ['Đường vòng chỉ cần dò tới tường rồi rẽ, viết gọn nhưng đi xa.', 'Qua cửa thì gần hơn, nhưng phải đặt thùng lên nút M trước.'],
      sao: { o: 8, nhip: 19 },
      doiCho: true,
      loiGiai: { chinh: DO.concat(['turn_right()'], DO, ['turn_right()'], DO) },
      cachKhac: [{ chinh: FOR(3, ['forward()']).concat(['turn_right()', 'pick()', 'forward()', 'turn_left()', 'drop()', 'turn_right()'], FOR(5, ['forward()'])) }] }),

    man(6, { ten: 'Hai cổng: tự viết hàm',
      deBai: 'Hai cổng giống hệt nhau, mỗi cổng một thùng một nút. Tự viết hàm tên tùy em cho một lượt qua cổng rồi gọi trong for. Chương trình chính chỉ có 3 ô.',
      san: ['#####', '##F##', '##C##', '#Mo##', '##.##', '##C##', '#Mo##', '##.##'],
      batDau: { x: 2, y: 7, huong: 0 },
      noi: [{ nut: { x: 1, y: 6 }, cua: [{ x: 2, y: 5 }] }, { nut: { x: 1, y: 3 }, cua: [{ x: 2, y: 2 }] }],
      khung: { chinh: 3 },
      goiY: ['Một lượt: nhặt thùng, tiến, quay vào nút, đặt, quay lại, tiến qua cửa.'],
      sao: { o: 9, nhip: 22 },
      loiGiai: {
        chinh: FOR(2, ['qua_cong()']),
        hamCuaEmMoi: [H('qua_cong', ['pick()', 'forward()', 'turn_left()', 'drop()', 'turn_right()', 'forward()', 'forward()'])]
      } }),

    man(7, { ten: 'Hai cổng hay đường vòng',
      deBai: 'Cờ nằm sau hai cổng, nhưng cũng có đường vòng rất xa. Hàm nào cũng được, tên tùy em. Một sao cho bài gọn, một sao cho bài nhanh.',
      san: ['.......', '.#####.', '.#####.', '.#####.', '.#####.', '.#####.', '.M##M#.', '.oC.oCF'],
      batDau: { x: 0, y: 7, huong: 1 },
      noi: [{ nut: { x: 1, y: 6 }, cua: [{ x: 2, y: 7 }] }, { nut: { x: 4, y: 6 }, cua: [{ x: 5, y: 7 }] }],
      goiY: ['Dò tới tường lặp lại ba lần: viết thành hàm thì đường vòng rất gọn.', 'Mỗi lượt qua cổng giống nhau: hàm cho một lượt, gọi hai lần là tới cờ nhanh hơn.'],
      sao: { o: 8, nhip: 22 },
      doiCho: true,
      loiGiai: {
        chinh: ['turn_left()', 'do_tuong()', 'turn_right()', 'do_tuong()', 'turn_right()', 'do_tuong()'],
        hamCuaEmMoi: [H('do_tuong', DO)]
      },
      cachKhac: [{
        chinh: ['qua_cong()', 'qua_cong()'],
        hamCuaEmMoi: [H('qua_cong', ['pick()', 'forward()', 'turn_left()', 'drop()', 'turn_right()', 'forward()', 'forward()'])]
      }] }),

    man(8, { ten: 'TRÙM: Kho hàng xuất xưởng',
      deBai: 'Màn trùm của mùa. Hai sân khác nhau: dò tới thùng, đặt lên nút M để mở cửa, đi hết hành lang, rẽ về phía còn trống rồi dò tới cờ. Chương trình chính chỉ có 10 ô.',
      san: [
        ['######', '##..F#', '##C###', '#Mo###', '##.###', '##.###', '##.###'],
        ['######', 'F..###', '##.###', '##.###', '##C###', '#Mo###', '##.###']
      ],
      batDau: [{ x: 2, y: 6, huong: 0 }, { x: 2, y: 6, huong: 0 }],
      sao: { o: 15, nhip: 17 },
      loiGiai: {
        chinh: ['do_tuong()', 'de_nut()', 'do_tuong()', 'if right_clear():', '    turn_right()', 'else:', '    turn_left()', 'do_tuong()'],
        hamCuaEmMoi: [H('do_tuong', DO), H('de_nut', ['pick()', 'forward()', 'turn_left()', 'drop()', 'turn_right()'])]
      },
      huyHieu: { ma: 'kho-cu', ten: 'Kho hàng xuất xưởng' } })
  ]);

  if (laNode) module.exports = ManHoc;
})();
