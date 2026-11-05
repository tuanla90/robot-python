/* ============================================================================
   man-m1-san.js — diem10code-python: MÙA 1 Kho hàng, GÓI 4 "Sân: nút đè".
   M = nút đè (vật/xe trên M thì bật); C = cửa đóng lúc đầu (bật nút thì mở);
   c = cửa mở lúc đầu (bật nút thì đóng). Mẹo: đặt THÙNG lên nút để giữ cửa mở
   lâu dài rồi đi qua tự do. Chương `m1-san` (gốc), `m1-che-san`.
   ========================================================================== */
(function () {
  'use strict';
  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-co-so.js') : window.ManHoc;

  var HAM_GOC = ['left_move', 'right_move', 'wait', 'arm_down', 'arm_up', 'grab', 'release', 'front_clear'];
  function H(ten, thamSo, than) { return { ten: ten, thamSo: (thamSo || []).slice(), than: than.slice() }; }

  function man(m) {
    m.chuong = 'm1-san';
    m.loaiRobot = 'banh'; m.robot = { than: 'hai-banh', tay: 'kep', camBien: [{ ma: 'khoang-cach', o: 'hong' }] };
    m.hamGoc = HAM_GOC.slice(); m.khung = { chinh: 12, moiHam: 10 }; m.cauTruc = ['if', 'while'];
    m.moXuong = true; m.camHamCuaEm = false;
    m.hamCuaEmCan = ['move', 'turn_right', 'turn_left', 'u_turn', 'pick', 'drop', 'go_wall'];
    return ManHoc.chuanHoa(m);
  }

  ManHoc.them([
    man({ so: 1, ten: 'Thùng giữ cửa', hang: 'lam-quen',
      deBai: 'Nút M nằm bên trái cửa. Mang thùng o lên M để giữ cửa C mở, rồi đi qua tới cờ.',
      san: ['#####', '##F##', '##C##', '#Mo##', '##.##'],
      batDau: { x: 2, y: 4, huong: 0 },
      maMau: { chinh: ['move()'], hamCuaMan: [] },
      sao: { o: 7, nhip: 12 },
      loiGiai: { chinh: ['pick()', 'move()', 'turn_left()', 'drop()', 'turn_right()', 'move()', 'move()'] } }),
    man({ so: 2, ten: 'Đứng lên nút', hang: 'lam-quen',
      deBai: 'Nút M ở ngay dưới chân. Xe đứng lên M là nút bật, cửa C mở ngay bên trên.',
      san: ['###', '#F#', '#C#', '#M#', '#.#'],
      batDau: { x: 1, y: 4, huong: 0 },
      maMau: { chinh: ['move()'], hamCuaMan: [] },
      sao: { o: 3, nhip: 3 },
      loiGiai: { chinh: ['move()', 'move()', 'move()'] } }),
    man({ so: 3, ten: 'Cửa mở sẵn c', hang: 'luyen',
      deBai: 'Cửa c đang mở sẵn. Đi thẳng qua, ĐỪNG đứng lên nút M bên cạnh kẻo cửa đóng lại.',
      san: ['####', '#F##', '#c##', '#.M#', '#..#'],
      batDau: { x: 1, y: 4, huong: 0 },
      maMau: { chinh: ['move()'], hamCuaMan: [] },
      sao: { o: 3, nhip: 3 },
      loiGiai: { chinh: ['move()', 'move()', 'move()'] } }),
    man({ so: 4, ten: 'Trùm: hành lang dài hơn', hang: 'trum',
      deBai: 'Mang thùng lên nút M để mở cửa C, đi qua hành lang dài hơn tới cờ.',
      san: ['#####', '##F##', '##.##', '##C##', '#Mo##', '##.##'],
      batDau: { x: 2, y: 5, huong: 0 },
      maMau: { chinh: ['move()'], hamCuaMan: [] },
      sao: { o: 7, nhip: 14 },
      loiGiai: { chinh: ['pick()', 'move()', 'turn_left()', 'drop()', 'turn_right()', 'move()', 'move()', 'move()'] },
      huyHieu: 'm1-san' })
  ]);

  function manChe(m) {
    m.chuong = 'm1-che-san';
    m.loaiRobot = 'banh'; m.robot = { than: 'hai-banh', tay: 'kep', camBien: [{ ma: 'khoang-cach', o: 'hong' }] };
    m.hamGoc = HAM_GOC.slice(); m.khung = { chinh: 10, moiHam: 10 }; m.cauTruc = ['if', 'while'];
    m.moXuong = true; m.camHamCuaEm = false;
    m.hamCuaEmCan = ['move', 'turn_right', 'turn_left', 'u_turn', 'pick', 'drop', 'go_wall'];
    return ManHoc.chuanHoa(m);
  }
  function hPressOpen() { return H('press_open', [], ['pick()', 'move()', 'turn_left()', 'drop()', 'turn_right()']); }

  ManHoc.them([
    manChe({ so: 1, ten: 'Chế lệnh: press_open()', hang: 'lam-quen', hamCuaEmCan: ['pick', 'drop'], taoHam: ['press_open'],
      deBai: 'Tạo hàm press_open() (nhặt thùng, tiến 1, quay trái, đặt lên nút, quay lại) rồi đi qua cửa.',
      san: ['#####', '##F##', '##C##', '#Mo##', '##.##'],
      batDau: { x: 2, y: 4, huong: 0 },
      maMau: { chinh: ['move()'], hamCuaMan: [] },
      sao: { o: 3, nhip: 12 },
      loiGiai: { chinh: ['press_open()', 'move()', 'move()'], hamCuaEmMoi: [hPressOpen()] } }),
    manChe({ so: 2, ten: 'go_wall() qua cửa', hang: 'luyen', hamCuaEmCan: ['press_open', 'go_wall'],
      deBai: 'press_open() rồi go_wall() đi thẳng qua cửa tới sát tường trên.',
      san: ['#####', '##F##', '##.##', '##.##', '##C##', '#Mo##', '##.##'],
      batDau: { x: 2, y: 6, huong: 0 },
      maMau: { chinh: ['move()'], hamCuaMan: [] },
      sao: { o: 2, nhip: 16 },
      loiGiai: { chinh: ['press_open()', 'go_wall()'] } }),
    manChe({ so: 3, ten: 'Trùm: kho hàng khoá kỹ', hang: 'trum', hamCuaEmCan: ['press_open', 'go_wall'],
      deBai: 'Mở cửa bằng nút, đi qua hành lang dài tới cờ.',
      san: ['#####', '##F##', '##.##', '##.##', '##C##', '#Mo##', '##.##'],
      batDau: { x: 2, y: 6, huong: 0 },
      maMau: { chinh: ['move()'], hamCuaMan: [] },
      sao: { o: 2, nhip: 17 },
      loiGiai: { chinh: ['press_open()', 'go_wall()'] },
      huyHieu: 'm1-che-san' })
  ]);

  if (laNode) module.exports = ManHoc;
})();
