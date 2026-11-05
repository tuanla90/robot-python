/* ============================================================================
   man-m1-tay.js — diem10code-python: MÙA 1 Kho hàng, GÓI 2 "Tay kẹp".
   Chương `m1-tay` (gốc, khung lớn hơn vì chưa có hàm pick/drop), `m1-che-tay`
   (tạo pick/drop/carry, khung về lại 10). LUẬT: grab()/release() tác động vào
   Ô TRƯỚC MẶT — robot phải đứng CẠNH vật/đích, KHÔNG đứng lên vật.
   ========================================================================== */
(function () {
  'use strict';
  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-co-so.js') : window.ManHoc;

  var HAM_GOC = ['left_move', 'right_move', 'wait', 'arm_down', 'arm_up', 'grab', 'release'];
  function H(ten, thamSo, than) { return { ten: ten, thamSo: (thamSo || []).slice(), than: than.slice() }; }
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }

  function man(m) {
    m.chuong = 'm1-tay';
    m.loaiRobot = 'banh'; m.robot = { than: 'hai-banh', tay: 'kep' };
    m.hamGoc = HAM_GOC.slice(); m.khung = { chinh: 16, moiHam: 10 };
    m.moXuong = true; m.camHamCuaEm = false;
    m.hamCuaEmCan = ['move', 'turn_right', 'turn_left', 'u_turn'];
    m.mucTieu = 'dua-vat';
    return ManHoc.chuanHoa(m);
  }
  var T_PICK = ['arm_down()', 'grab()', 'wait()', 'arm_up()', 'wait()'];
  var T_DROP = ['arm_down()', 'release()', 'wait()', 'arm_up()', 'wait()'];

  ManHoc.them([
    man({ so: 1, ten: 'Nhặt thùng', hang: 'lam-quen',
      deBai: 'Thùng gỗ o nằm ngay trước mặt xe. Đứng sát, hạ tay, kẹp, nâng tay rồi mang tới ô đích D (cũng đứng sát, quay mặt về D).',
      san: ['..D..', '.....', '..o..', '.....'],
      batDau: { x: 2, y: 3, huong: 0 },
      maMau: { chinh: T_PICK.slice() },
      sao: { o: 12, nhip: 12 },
      loiGiai: { chinh: nhieu(T_PICK, ['move()', 'move()'], T_DROP) } }),
    man({ so: 2, ten: 'Mang xa hơn', hang: 'lam-quen',
      deBai: 'Nhặt thùng, đi tiếp ba ô nữa, đặt xuống đích D.',
      san: ['..D..', '.....', '.....', '.....', '..o..', '.....'],
      batDau: { x: 2, y: 5, huong: 0 },
      maMau: { chinh: T_PICK.slice() },
      sao: { o: 14, nhip: 14 },
      loiGiai: { chinh: nhieu(T_PICK, ['move()', 'move()', 'move()', 'move()'], T_DROP) } }),
    man({ so: 3, ten: 'Tay bận thì không đi', hang: 'luyen',
      deBai: 'Nhớ nâng tay (arm_up) trước khi di chuyển, không thì xe không đi được.',
      san: ['..D..', '.....', '..o..', '.....'],
      batDau: { x: 2, y: 3, huong: 0 },
      maMau: { chinh: nhieu(['arm_down()', 'grab()', 'wait()'], ['move()']) },
      sao: { o: 12, nhip: 12 },
      loiGiai: { chinh: nhieu(T_PICK, ['move()', 'move()'], T_DROP) },
      loiSai: [{ moTa: 'Quên arm_up() trước khi đi', baiLam: { chinh: nhieu(['arm_down()', 'grab()', 'wait()'], ['move()']) }, phaiCoMa: ['tay-ban'] }] }),
    man({ so: 4, ten: 'Trùm: quay phải rồi mang', hang: 'trum',
      deBai: 'Nhặt thùng, quay phải, đi hai ô, đặt xuống đích (đứng sát D, quay mặt về nó).',
      san: ['.......', '..o....', '.....D.'],
      batDau: { x: 2, y: 2, huong: 0 },
      maMau: { chinh: T_PICK.slice() },
      sao: { o: 13, nhip: 13 },
      loiGiai: { chinh: nhieu(T_PICK, ['turn_right()', 'move()', 'move()'], T_DROP) },
      huyHieu: 'm1-tay' })
  ]);

  function manChe(m) {
    m.chuong = 'm1-che-tay';
    m.loaiRobot = 'banh'; m.robot = { than: 'hai-banh', tay: 'kep' };
    m.hamGoc = HAM_GOC.slice(); m.khung = { chinh: 10, moiHam: 10 };
    m.moXuong = true; m.camHamCuaEm = false;
    m.hamCuaEmCan = ['move', 'turn_right', 'turn_left', 'u_turn'];
    m.mucTieu = 'dua-vat';
    return ManHoc.chuanHoa(m);
  }
  function hPick() { return H('pick', [], T_PICK); }
  function hDrop() { return H('drop', [], T_DROP); }

  ManHoc.them([
    manChe({ so: 1, ten: 'Chế lệnh: pick()', hang: 'lam-quen', taoHam: ['pick'],
      deBai: 'Tạo hàm pick() (arm_down, grab, wait, arm_up, wait) rồi nhặt thùng, mang tới đích.',
      san: ['..D..', '.....', '..o..', '.....'],
      batDau: { x: 2, y: 3, huong: 0 },
      maMau: { chinh: ['move()'], hamCuaMan: [] },
      sao: { o: 5, nhip: 12 },
      loiGiai: { chinh: ['pick()', 'move()', 'move()', 'arm_down()', 'release()', 'wait()', 'arm_up()', 'wait()'], hamCuaEmMoi: [hPick()] } }),
    manChe({ so: 2, ten: 'Chế lệnh: drop()', hang: 'lam-quen', hamCuaEmCan: ['pick'], taoHam: ['drop'],
      deBai: 'Tạo hàm drop() rồi nhặt, đi hai ô, thả xuống đích.',
      san: ['..D..', '.....', '..o..', '.....'],
      batDau: { x: 2, y: 3, huong: 0 },
      maMau: { chinh: ['pick()'], hamCuaMan: [] },
      sao: { o: 4, nhip: 12 },
      loiGiai: { chinh: ['pick()', 'move()', 'move()', 'drop()'], hamCuaEmMoi: [hDrop()] } }),
    manChe({ so: 3, ten: 'Chế lệnh: carry()', hang: 'luyen', hamCuaEmCan: ['pick', 'drop', 'turn_right'], taoHam: ['carry'],
      deBai: 'Tạo hàm carry() = pick(), move(), turn_right(), drop() (mang vật trước mặt rồi đặt sang ô bên phải).',
      san: ['..oD...', '.......'],
      batDau: { x: 2, y: 1, huong: 0 },
      maMau: { chinh: ['pick()'], hamCuaMan: [] },
      sao: { o: 1, nhip: 9 },
      loiGiai: { chinh: ['carry()'], hamCuaEmMoi: [H('carry', [], ['pick()', 'move()', 'turn_right()', 'drop()'])] } }),
    manChe({ so: 4, ten: 'Trùm: dùng carry() hai lần', hang: 'trum', hamCuaEmCan: ['pick', 'drop', 'carry'],
      deBai: 'Hai thùng giống hệt cách lấy. Gọi carry() hai lần.',
      san: ['..oD...', '.......', '.Do....', '.......'],
      batDau: { x: 2, y: 1, huong: 0 },
      maMau: { chinh: ['carry()'], hamCuaMan: [] },
      sao: { o: 4, nhip: 20 },
      loiGiai: { chinh: ['carry()', 'turn_right()', 'move()', 'carry()'] },
      huyHieu: 'm1-che-tay' })
  ]);

  if (laNode) module.exports = ManHoc;
})();
