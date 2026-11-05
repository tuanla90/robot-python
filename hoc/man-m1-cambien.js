/* ============================================================================
   man-m1-cambien.js — diem10code-python: MÙA 1 Kho hàng, GÓI 3 "Cảm biến khoảng cách".
   front_clear() trả True/False. Dạy if/while. Chương `m1-cam-bien` (gốc),
   `m1-che-cam-bien` (tạo hàm go_wall = while front_clear(): up()).
   ========================================================================== */
(function () {
  'use strict';
  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-co-so.js') : window.ManHoc;

  var HAM_GOC = ['up', 'down', 'turn_left', 'turn_right', 'wait', 'arm_down', 'arm_up', 'grab', 'release', 'front_clear', 'left_clear', 'right_clear'];
  function H(ten, thamSo, than) { return { ten: ten, thamSo: (thamSo || []).slice(), than: than.slice() }; }

  function man(m) {
    m.chuong = 'm1-cam-bien';
    m.loaiRobot = 'banh'; m.robot = { than: 'hai-banh', tay: 'kep', camBien: [{ ma: 'khoang-cach', o: 'hong' }] };
    m.hamGoc = HAM_GOC.slice(); m.khung = { chinh: 10, moiHam: 10 }; m.cauTruc = ['if', 'while'];
    m.moXuong = true; m.camHamCuaEm = false;
    m.hamCuaEmCan = ['pick', 'drop'];
    return ManHoc.chuanHoa(m);
  }

  ManHoc.them([
    man({ so: 1, ten: 'Trước mặt có trống không', hang: 'lam-quen', cauTruc: ['if'],
      deBai: 'front_clear() cho biết trước mặt có trống không. Nếu đúng thì up() hai lần tới cờ.',
      san: ['....', '.F..', '....', '....'],
      batDau: { x: 1, y: 3, huong: 0 },
      maMau: { chinh: ['if front_clear():', '    up()'] },
      sao: { o: 4, nhip: 2 },
      loiGiai: { chinh: ['if front_clear():', '    up()', '    up()'] } }),
    man({ so: 2, ten: 'Đi tới khi gặp tường', hang: 'lam-quen', cauTruc: ['while'],
      deBai: 'Dùng while front_clear(): up() để đi thẳng tới sát tường. Cờ nằm ngay trước tường.',
      san: ['.#..', '.F..', '....', '....'],
      batDau: { x: 1, y: 3, huong: 0 },
      maMau: { chinh: ['up()'] },
      sao: { o: 2, nhip: 2 },
      loiGiai: { chinh: ['while front_clear():', '    up()'] } }),
    man({ so: 3, ten: 'Dò rồi nhặt', hang: 'luyen', cauTruc: ['while'], mucTieu: 'dua-vat',
      deBai: 'Dùng while front_clear(): up() để dò tới sát thùng (vật cũng chặn cảm biến), nhặt, đi tiếp hai ô tới đích.',
      san: ['.D..', '....', '.o..', '....', '....', '....'],
      batDau: { x: 1, y: 5, huong: 0 },
      maMau: { chinh: ['up()'] },
      sao: { o: 6, nhip: 9 },
      loiGiai: { chinh: ['while front_clear():', '    up()', 'pick()', 'up()', 'up()', 'drop()'] } }),
    man({ so: 4, ten: 'Bên trái có trống không', hang: 'luyen', cauTruc: ['if'],
      deBai: 'left_clear() cho biết bên trái (theo hướng mặt) có trống không. Bên trái đang trống — rẽ trái rồi đi tới cờ.',
      san: ['...', 'F..'],
      batDau: { x: 1, y: 1, huong: 0 },
      maMau: { chinh: ['if left_clear():', '    turn_left()'] },
      sao: { o: 2, nhip: 1 },
      loiGiai: { chinh: ['if left_clear():', '    turn_left()', '    up()'] } }),
    man({ so: 5, ten: 'Bên phải có trống không', hang: 'luyen', cauTruc: ['if'],
      deBai: 'right_clear() cho biết bên phải có trống không. Bên phải đang trống — rẽ phải rồi đi một ô tới cờ.',
      san: ['...', '..F'],
      batDau: { x: 1, y: 1, huong: 0 },
      maMau: { chinh: ['if right_clear():', '    turn_right()'] },
      sao: { o: 2, nhip: 1 },
      loiGiai: { chinh: ['if right_clear():', '    turn_right()', '    up()'] } }),
    man({ so: 6, ten: 'Trùm: hành lang rồi rẽ', hang: 'trum', cauTruc: ['while'],
      deBai: 'Dò tới sát tường, rẽ phải, dò tiếp tới cờ (cờ nằm ngay trước tường thứ hai).',
      san: ['.#....', '....F#', '......', '......', '......'],
      batDau: { x: 1, y: 4, huong: 0 },
      maMau: { chinh: ['up()'] },
      sao: { o: 5, nhip: 6 },
      loiGiai: { chinh: ['while front_clear():', '    up()', 'turn_right()', 'while front_clear():', '    up()'] },
      huyHieu: 'm1-cam-bien' })
  ]);

  function manChe(m) {
    m.chuong = 'm1-che-cam-bien';
    m.loaiRobot = 'banh'; m.robot = { than: 'hai-banh', tay: 'kep', camBien: [{ ma: 'khoang-cach', o: 'hong' }] };
    m.hamGoc = HAM_GOC.slice(); m.khung = { chinh: 10, moiHam: 10 }; m.cauTruc = ['if', 'while'];
    m.moXuong = true; m.camHamCuaEm = false;
    m.hamCuaEmCan = ['pick', 'drop'];
    return ManHoc.chuanHoa(m);
  }
  function hGoWall() { return H('go_wall', [], ['while front_clear():', '    up()']); }

  ManHoc.them([
    manChe({ so: 1, ten: 'Chế lệnh: go_wall()', hang: 'lam-quen', taoHam: ['go_wall'],
      deBai: 'Tạo hàm go_wall() = while front_clear(): up(). Dùng nó đi tới sát tường.',
      san: ['.#..', '.F..', '....', '....'],
      batDau: { x: 1, y: 3, huong: 0 },
      maMau: { chinh: ['up()'], hamCuaMan: [] },
      sao: { o: 3, nhip: 2 },
      loiGiai: { chinh: ['go_wall()'], hamCuaEmMoi: [hGoWall()] } }),
    manChe({ so: 2, ten: 'go_wall() rồi rẽ', hang: 'lam-quen', hamCuaEmCan: ['go_wall'],
      deBai: 'Đi tới sát tường bằng go_wall(), rẽ phải, go_wall() lần nữa tới cờ.',
      san: ['.#....', '....F#', '......', '......'],
      batDau: { x: 1, y: 3, huong: 0 },
      maMau: { chinh: ['go_wall()'], hamCuaMan: [] },
      sao: { o: 3, nhip: 5 },
      loiGiai: { chinh: ['go_wall()', 'turn_right()', 'go_wall()'] } }),
    manChe({ so: 3, ten: 'Nhặt rồi dò tiếp', hang: 'luyen', hamCuaEmCan: ['go_wall', 'pick', 'drop'], mucTieu: 'dua-vat',
      deBai: 'go_wall() tới sát thùng (vật cũng chặn cảm biến), nhặt, đi hai ô, thả xuống đích.',
      san: ['.D..', '....', '.o..', '....', '....'],
      batDau: { x: 1, y: 4, huong: 0 },
      maMau: { chinh: ['go_wall()'], hamCuaMan: [] },
      sao: { o: 5, nhip: 8 },
      loiGiai: { chinh: ['go_wall()', 'pick()', 'up()', 'up()', 'drop()'] } }),
    manChe({ so: 4, ten: 'Chế lệnh: bump_right()', hang: 'luyen', taoHam: ['bump_right'],
      deBai: 'Tạo hàm bump_right() = if right_clear(): turn_right(); up() (rẽ phải nếu trống rồi đi) và dùng nó để tới cờ.',
      san: ['...', '..F'],
      batDau: { x: 1, y: 1, huong: 0 },
      maMau: { chinh: ['up()'], hamCuaMan: [] },
      sao: { o: 1, nhip: 1 },
      loiGiai: { chinh: ['bump_right()'], hamCuaEmMoi: [H('bump_right', [], ['if right_clear():', '    turn_right()', '    up()'])] } }),
    manChe({ so: 5, ten: 'go_wall() và bump_right() nối nhau', hang: 'luyen', hamCuaEmCan: ['go_wall', 'bump_right'],
      deBai: 'go_wall() tới sát tường, bump_right() rẽ sang hành lang bên phải, go_wall() lần nữa tới cờ.',
      san: ['.#....', '....F#', '......', '......'],
      batDau: { x: 1, y: 3, huong: 0 },
      maMau: { chinh: ['go_wall()'], hamCuaMan: [] },
      sao: { o: 3, nhip: 5 },
      loiGiai: { chinh: ['go_wall()', 'bump_right()', 'go_wall()'] } }),
    manChe({ so: 6, ten: 'Trùm: xưởng tối', hang: 'trum', hamCuaEmCan: ['go_wall', 'bump_right', 'pick', 'drop'], cauTruc: ['while'], mucTieu: 'dua-vat',
      deBai: 'go_wall() đi ngang tới sát tường trái, bump_right(), go_wall() lần nữa tới sát thùng, nhặt, đi hai ô, đặt xuống đích.',
      san: ['.D....', '......', '.o....', '......', '#.....'],
      batDau: { x: 5, y: 4, huong: 3 },
      maMau: { chinh: ['go_wall()'], hamCuaMan: [] },
      sao: { o: 6, nhip: 8 },
      loiGiai: { chinh: ['go_wall()', 'bump_right()', 'go_wall()', 'pick()', 'up()', 'up()', 'drop()'] },
      huyHieu: 'm1-che-cam-bien' })
  ]);

  if (laNode) module.exports = ManHoc;
})();
