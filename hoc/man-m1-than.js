/* ============================================================================
   man-m1-than.js — diem10code-python: MÙA 1 Kho hàng, GÓI 1 "Thân" (hai bánh).
   4 lệnh gốc up()/down()/turn_left()/turn_right(), mỗi lệnh 1 nhịp (san-hoc.js
   HAM_GOC.banh). Chương `m1-than` (gốc, đủ 4 lệnh ngay từ màn 1, chưa tạo hàm),
   `m1-che-than` (tạo hàm gộp nhiều lệnh — def).
   ========================================================================== */
(function () {
  'use strict';
  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-co-so.js') : window.ManHoc;

  var HAM_GOC = ['up', 'down', 'turn_left', 'turn_right', 'wait'];
  function lap(ds, n) { var kq = []; for (var i = 0; i < n; i++) kq = kq.concat(ds); return kq; }
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  function FOR(n, than) { return ['for i in range(' + n + '):'].concat((Array.isArray(than) ? than : [than]).map(function (s) { return '    ' + s; })); }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: (thamSo || []).slice(), than: than.slice() }; }

  function man(m) {
    m.chuong = 'm1-than';
    m.loaiRobot = 'banh'; m.robot = { than: 'hai-banh', tay: null };
    m.hamGoc = HAM_GOC.slice(); m.khung = { chinh: 10, moiHam: 10 };
    m.moXuong = false; m.camHamCuaEm = true;
    return ManHoc.chuanHoa(m);
  }

  ManHoc.them([
    man({ so: 1, ten: 'Bước đầu tiên', hang: 'lam-quen',
      deBai: 'up() cho xe tiến một ô. Đưa xe tới cờ.',
      san: ['...', '.F.', '...'],
      batDau: { x: 1, y: 2, huong: 0 },
      maMau: { chinh: ['up()'] },
      sao: { o: 1, nhip: 1 },
      loiGiai: { chinh: ['up()'] } }),
    man({ so: 2, ten: 'Ba bước', hang: 'lam-quen',
      deBai: 'Lá cờ cách xe ba ô. Gọi up() ba lần.',
      san: ['...', '.F.', '...', '...', '...'],
      batDau: { x: 1, y: 4, huong: 0 },
      maMau: { chinh: ['up()'] },
      sao: { o: 3, nhip: 3 },
      loiGiai: { chinh: ['up()', 'up()', 'up()'] } }),
    man({ so: 3, ten: 'Rẽ phải', hang: 'lam-quen',
      deBai: 'turn_right() quay xe sang phải 90° tại chỗ. Rẽ phải rồi đi hai ô tới cờ.',
      san: ['.....', '.....', '.....', '..F..', '.....'],
      batDau: { x: 0, y: 3, huong: 0 },
      maMau: { chinh: ['turn_right()'] },
      sao: { o: 3, nhip: 3 },
      loiGiai: { chinh: ['turn_right()', 'up()', 'up()'] } }),
    man({ so: 4, ten: 'Rẽ trái', hang: 'lam-quen',
      deBai: 'turn_left() quay xe sang trái 90° tại chỗ. Rẽ trái rồi đi hai ô tới cờ.',
      san: ['.....', '.....', '.....', '..F..', '.....'],
      batDau: { x: 4, y: 3, huong: 0 },
      maMau: { chinh: ['turn_left()'] },
      sao: { o: 3, nhip: 3 },
      loiGiai: { chinh: ['turn_left()', 'up()', 'up()'] } }),
    man({ so: 5, ten: 'Đi lùi', hang: 'luyen',
      deBai: 'down() cho xe lùi một ô, không cần quay. Lùi hai ô về cờ phía sau.',
      san: ['.....', '.....', '.....', '..F..'],
      batDau: { x: 2, y: 1, huong: 0 },
      maMau: { chinh: ['down()'] },
      sao: { o: 2, nhip: 2 },
      loiGiai: { chinh: ['down()', 'down()'] } }),
    man({ so: 6, ten: 'Đi dài bằng for', hang: 'luyen', cauTruc: ['for'],
      deBai: 'Lá cờ cách xe năm ô. Dùng vòng for cho gọn.',
      san: ['...', 'F..', '...', '...', '...', '...', '...'],
      batDau: { x: 0, y: 6, huong: 0 },
      maMau: { chinh: FOR(2, ['up()']) },
      sao: { o: 2, nhip: 5 },
      loiGiai: { chinh: FOR(5, ['up()']) } }),
    man({ so: 7, ten: 'Trùm: chữ L', hang: 'trum', cauTruc: ['for'],
      deBai: 'Đi thẳng ba ô, rẽ trái, đi thẳng hai ô nữa tới cờ.',
      san: ['...', '...', '...', '..F'],
      batDau: { x: 0, y: 0, huong: 2 },
      maMau: { chinh: ['up()'] },
      sao: { o: 6, nhip: 5 },
      loiGiai: { chinh: nhieu(FOR(3, ['up()']), ['turn_left()'], FOR(2, ['up()'])) },
      huyHieu: 'm1-than' })
  ]);

  function manChe(m) {
    m.chuong = 'm1-che-than';
    m.loaiRobot = 'banh'; m.robot = { than: 'hai-banh', tay: null };
    m.hamGoc = HAM_GOC.slice(); m.khung = { chinh: 10, moiHam: 10 }; m.cauTruc = ['for'];
    m.moXuong = true; m.camHamCuaEm = false;
    return ManHoc.chuanHoa(m);
  }
  function hUTurn() { return H('u_turn', [], ['turn_right()', 'turn_right()']); }
  function hStepRight() { return H('step_right', [], ['turn_right()', 'up()', 'turn_left()']); }
  function hStepLeft() { return H('step_left', [], ['turn_left()', 'up()', 'turn_right()']); }

  ManHoc.them([
    manChe({ so: 1, ten: 'Chế lệnh: u_turn()', hang: 'lam-quen', taoHam: ['u_turn'],
      deBai: 'Tạo hàm u_turn() = turn_right(), turn_right() (quay ngược 180°) rồi quay lại, đi một ô tới cờ.',
      san: ['.....', '..F..', '.....'],
      batDau: { x: 2, y: 0, huong: 0 },
      maMau: { chinh: ['up()'], hamCuaMan: [] },
      sao: { o: 3, nhip: 3 },
      loiGiai: { chinh: ['u_turn()', 'up()'], hamCuaEmMoi: [hUTurn()] } }),
    manChe({ so: 2, ten: 'Chế lệnh: step_right()', hang: 'lam-quen', hamCuaEmCan: ['u_turn'], taoHam: ['step_right'],
      deBai: 'Tạo hàm step_right() = turn_right(), up(), turn_left() (tạt sang phải một ô, vẫn quay mặt như cũ) rồi dùng để né sang làn bên phải, đi tiếp tới cờ.',
      san: ['..F..', '.....', '.....'],
      batDau: { x: 1, y: 2, huong: 0 },
      maMau: { chinh: ['up()'], hamCuaMan: [] },
      sao: { o: 5, nhip: 5 },
      loiGiai: { chinh: ['step_right()', 'up()', 'up()'], hamCuaEmMoi: [hStepRight()] } }),
    manChe({ so: 3, ten: 'Chế lệnh: step_left()', hang: 'lam-quen', hamCuaEmCan: ['step_right'], taoHam: ['step_left'],
      deBai: 'Tạo hàm step_left() rồi tạt sang trái một ô, đi tiếp tới cờ.',
      san: ['..F..', '.....', '.....'],
      batDau: { x: 3, y: 2, huong: 0 },
      maMau: { chinh: ['up()'], hamCuaMan: [] },
      sao: { o: 5, nhip: 5 },
      loiGiai: { chinh: ['step_left()', 'up()', 'up()'], hamCuaEmMoi: [hStepLeft()] } }),
    manChe({ so: 4, ten: 'Dùng lại hàm trong for', hang: 'luyen', hamCuaEmCan: ['step_right'], cauTruc: ['for'],
      deBai: 'Đường bậc thang: tạt phải rồi đi lên, lặp lại ba lần tới cờ.',
      san: ['...F', '....', '....', '....'],
      batDau: { x: 0, y: 3, huong: 0 },
      maMau: { chinh: ['step_right()'], hamCuaMan: [] },
      sao: { o: 2, nhip: 15 },
      loiGiai: { chinh: FOR(3, ['step_right()', 'up()']) } }),
    manChe({ so: 5, ten: 'Trùm: về đúng hướng cũ', hang: 'trum', hamCuaEmCan: ['u_turn', 'step_right', 'step_left'],
      deBai: 'Đi 2 ô, tạt trái, u_turn(), đi 2 ô tới cờ.',
      san: ['..F..', '.....', '.....'],
      batDau: { x: 2, y: 1, huong: 1 },
      maMau: { chinh: ['up()'], hamCuaMan: [] },
      sao: { o: 6, nhip: 7 },
      loiGiai: { chinh: ['up()', 'up()', 'step_left()', 'u_turn()', 'up()', 'up()'] },
      huyHieu: 'm1-che-than' })
  ]);

  if (laNode) module.exports = ManHoc;
})();
