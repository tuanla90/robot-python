/* ============================================================================
   man-m1-nangcap.js — diem10code-python: MÙA 1 Kho hàng, GÓI 5 "Nâng cấp".
   Gộp hai nâng cấp vào một chương `m1-nangcap`: đi lùi (left_back/right_back)
   và cảm biến bên (left_clear/right_clear). Đào sâu dành cho mùa Tổ hợp sau.
   ========================================================================== */
(function () {
  'use strict';
  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-co-so.js') : window.ManHoc;

  var HAM_GOC = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'arm_down', 'arm_up', 'grab', 'release', 'front_clear', 'left_clear', 'right_clear'];
  function H(ten, thamSo, than) { return { ten: ten, thamSo: (thamSo || []).slice(), than: than.slice() }; }

  function man(m) {
    m.chuong = 'm1-nangcap';
    m.loaiRobot = 'banh'; m.robot = { than: 'hai-banh', tay: 'kep', camBien: [{ ma: 'khoang-cach', o: 'hong' }] };
    m.hamGoc = HAM_GOC.slice(); m.khung = { chinh: 10, moiHam: 10 }; m.cauTruc = ['if', 'while'];
    m.moXuong = true; m.camHamCuaEm = false;
    m.hamCuaEmCan = ['move', 'turn_right', 'turn_left', 'u_turn', 'pick', 'drop', 'go_wall'];
    return ManHoc.chuanHoa(m);
  }
  var T_BACK = ['left_back()', 'right_back()', 'wait()'];
  function hBack() { return H('back', [], T_BACK); }

  ManHoc.them([
    man({ so: 1, ten: 'Đi lùi', hang: 'lam-quen',
      deBai: 'left_back() và right_back() cho xe lùi một ô (không cần quay). Xe đang quay lưng về cờ — lùi hai ô về cờ.',
      san: ['.....', '..F..', '.....', '.....'],
      batDau: { x: 2, y: 3, huong: 2 },
      maMau: { chinh: T_BACK.slice() },
      sao: { o: 6, nhip: 2 },
      loiGiai: { chinh: ['left_back()', 'right_back()', 'wait()', 'left_back()', 'right_back()', 'wait()'] } }),
    man({ so: 2, ten: 'Chế lệnh: back()', hang: 'lam-quen', taoHam: ['back'],
      deBai: 'Tạo hàm back() rồi lùi hai lần về cờ phía sau.',
      san: ['.....', '..F..', '.....', '.....'],
      batDau: { x: 2, y: 3, huong: 2 },
      maMau: { chinh: ['back()'], hamCuaMan: [] },
      sao: { o: 4, nhip: 4 },
      loiGiai: { chinh: ['back()', 'back()'], hamCuaEmMoi: [hBack()] } }),
    man({ so: 3, ten: 'Cảm biến bên trái', hang: 'luyen', hamCuaEmCan: ['back'], cauTruc: ['if'],
      deBai: 'left_clear() cho biết bên trái (theo hướng mặt) có trống không. Bên trái đang trống — rẽ trái rồi đi tới cờ.',
      san: ['....', 'F...'],
      batDau: { x: 1, y: 1, huong: 0 },
      maMau: { chinh: ['if left_clear():', '    turn_left()'] },
      sao: { o: 4, nhip: 2 },
      loiGiai: { chinh: ['if left_clear():', '    turn_left()', '    move()'] } }),
    man({ so: 4, ten: 'Trùm: lùi để tránh thùng', hang: 'trum', hamCuaEmCan: ['back', 'pick', 'drop'], mucTieu: 'dua-vat',
      deBai: 'Nhặt thùng, lùi hai ô (đỡ phải quay người), đặt xuống đích.',
      san: ['......', '......', '..D...', '......', '..o...'],
      batDau: { x: 2, y: 3, huong: 2 },
      maMau: { chinh: ['pick()'], hamCuaMan: [] },
      sao: { o: 8, nhip: 11 },
      loiGiai: { chinh: ['pick()', 'back()', 'back()', 'drop()'] },
      huyHieu: 'm1-nangcap' })
  ]);

  if (laNode) module.exports = ManHoc;
})();
