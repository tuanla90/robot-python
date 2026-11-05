/* ============================================================================
   man-m1-trum.js — diem10code-python: MÙA 1 Kho hàng, GÓI 6 "Trùm mùa".
   Ôn lại mọi hàm đã chế (move, turn_*, u_turn, pick, drop, carry, go_wall, back)
   cộng nút đè. Màn cuối là trùm mùa (huyHieu riêng).
   ========================================================================== */
(function () {
  'use strict';
  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-co-so.js') : window.ManHoc;

  var HAM_GOC = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'arm_down', 'arm_up', 'grab', 'release', 'front_clear', 'left_clear', 'right_clear'];
  var CAN = ['move', 'turn_right', 'turn_left', 'u_turn', 'pick', 'drop', 'carry', 'go_wall', 'back'];

  function man(m) {
    m.chuong = 'm1-trum';
    m.loaiRobot = 'banh'; m.robot = { than: 'hai-banh', tay: 'kep', camBien: [{ ma: 'khoang-cach', o: 'hong' }] };
    m.hamGoc = HAM_GOC.slice(); m.khung = { chinh: 12, moiHam: 10 }; m.cauTruc = ['for', 'if', 'while'];
    m.moXuong = true; m.camHamCuaEm = false;
    m.hamCuaEmCan = CAN.slice();
    return ManHoc.chuanHoa(m);
  }

  ManHoc.them([
    man({ so: 1, ten: 'Ôn: đi và rẽ', hang: 'lam-quen',
      deBai: 'Đi hai ô, rẽ phải, đi một ô tới cờ.',
      san: ['.F', '..'],
      batDau: { x: 0, y: 1, huong: 0 },
      maMau: { chinh: ['move()'], hamCuaMan: [] },
      sao: { o: 3, nhip: 2 },
      loiGiai: { chinh: ['move()', 'turn_right()', 'move()'] } }),
    man({ so: 2, ten: 'Ôn: nhặt và mang', hang: 'lam-quen', mucTieu: 'dua-vat',
      deBai: 'Dùng pick(), drop() để mang thùng tới đích.',
      san: ['..D..', '.....', '..o..', '.....'],
      batDau: { x: 2, y: 3, huong: 0 },
      maMau: { chinh: ['pick()'], hamCuaMan: [] },
      sao: { o: 4, nhip: 12 },
      loiGiai: { chinh: ['pick()', 'move()', 'move()', 'drop()'] } }),
    man({ so: 3, ten: 'Ôn: cửa nút đè', hang: 'luyen',
      deBai: 'Mang thùng lên nút M để mở cửa C, đi qua tới cờ.',
      san: ['#####', '##F##', '##C##', '#Mo##', '##.##'],
      batDau: { x: 2, y: 4, huong: 0 },
      maMau: { chinh: ['move()'], hamCuaMan: [] },
      sao: { o: 7, nhip: 12 },
      loiGiai: { chinh: ['pick()', 'move()', 'turn_left()', 'drop()', 'turn_right()', 'move()', 'move()'] } }),
    man({ so: 4, ten: 'Ôn: dò hành lang tối', hang: 'luyen', cauTruc: ['while'],
      deBai: 'Không biết hành lang dài bao nhiêu — go_wall() lo chuyện đó.',
      san: ['.#..', '.F..', '....', '....', '....'],
      batDau: { x: 1, y: 4, huong: 0 },
      maMau: { chinh: ['move()'], hamCuaMan: [] },
      sao: { o: 2, nhip: 3 },
      loiGiai: { chinh: ['go_wall()'] } }),
    man({ so: 5, ten: 'Đố: tự chọn hàm', hang: 'bien-the', cauTruc: ['for', 'if', 'while'],
      deBai: 'Mở nút, mang thùng, đi qua cửa tới cờ.',
      san: ['#####', '##F##', '##.##', '##C##', '#Mo##', '##.##'],
      batDau: { x: 2, y: 5, huong: 0 },
      maMau: { chinh: ['move()'], hamCuaMan: [] },
      sao: { o: 7, nhip: 16 },
      loiGiai: { chinh: ['pick()', 'move()', 'turn_left()', 'drop()', 'turn_right()', 'go_wall()'] } }),
    man({ so: 6, ten: 'TRÙM: Kho hàng xuất xưởng', hang: 'trum', cauTruc: ['for', 'if', 'while'],
      deBai: 'Màn trùm mùa Kho hàng: mở nút, mang thùng, đi qua cửa, rẽ phải, dò tiếp tới cờ.',
      san: ['######', '....F#', '##.###', '##C###', '#Mo###', '##.###'],
      batDau: { x: 2, y: 5, huong: 0 },
      maMau: { chinh: ['move()'], hamCuaMan: [] },
      sao: { o: 8, nhip: 10 },
      loiGiai: { chinh: ['pick()', 'move()', 'turn_left()', 'drop()', 'turn_right()', 'go_wall()', 'turn_right()', 'go_wall()'] },
      huyHieu: 'mua-1-kho-hang' })
  ]);

  if (laNode) module.exports = ManHoc;
})();
