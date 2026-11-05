/* ============================================================================
   man-m1-than.js — diem10code-python: MÙA 1 Kho hàng, GÓI 1 "Thân gốc" (hai bánh).
   Chương 1 `m1-than`: left_move/right_move/wait, chưa tạo hàm (camHamCuaEm true).
   Chương 2 `m1-che-than`: tạo hàm move/turn_right/turn_left/u_turn (def).
   ========================================================================== */
(function () {
  'use strict';
  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-co-so.js') : window.ManHoc;

  var HAM_GOC = ['left_move', 'right_move', 'wait'];
  var TIEN = ['left_move()', 'right_move()', 'wait()'];
  var QUAY_PHAI = ['left_move()', 'wait()'];
  var QUAY_TRAI = ['right_move()', 'wait()'];
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
      deBai: 'Xe hai bánh đứng trước lá cờ. Đưa xe tới cờ.',
      san: ['...', '...', '.F.', '...'],
      batDau: { x: 1, y: 3, huong: 0 },
      maMau: { chinh: TIEN.slice() },
      sao: { o: 3, nhip: 1 },
      loiGiai: { chinh: TIEN.slice() } }),
    man({ so: 2, ten: 'Ba bước', hang: 'lam-quen',
      deBai: 'Lá cờ cách xe ba ô. Đưa xe tới cờ.',
      san: ['...', '.F.', '...', '...', '...'],
      batDau: { x: 1, y: 4, huong: 0 },
      maMau: { chinh: TIEN.slice() },
      sao: { o: 9, nhip: 3 },
      loiGiai: { chinh: lap(TIEN, 3) } }),
    man({ so: 3, ten: 'Rẽ phải', hang: 'lam-quen',
      deBai: 'Lá cờ ở bên phải xe, cách hai ô. Đưa xe tới cờ.',
      san: ['.....', '.....', '.....', '..F..', '.....'],
      batDau: { x: 0, y: 3, huong: 0 },
      maMau: { chinh: QUAY_PHAI.slice() },
      sao: { o: 8, nhip: 3 },
      loiGiai: { chinh: nhieu(QUAY_PHAI, lap(TIEN, 2)) } }),
    man({ so: 4, ten: 'Rẽ trái', hang: 'lam-quen',
      deBai: 'Lá cờ ở bên trái xe, cách hai ô. Đưa xe tới cờ.',
      san: ['.....', '.....', '.....', '..F..', '.....'],
      batDau: { x: 4, y: 3, huong: 0 },
      maMau: { chinh: QUAY_TRAI.slice() },
      sao: { o: 8, nhip: 3 },
      loiGiai: { chinh: nhieu(QUAY_TRAI, lap(TIEN, 2)) } }),
    man({ so: 5, ten: 'Đi dài bằng for', hang: 'luyen', cauTruc: ['for'],
      deBai: 'Lá cờ cách xe năm ô. Dùng vòng for cho gọn.',
      san: ['...', 'F..', '...', '...', '...', '...', '...'],
      batDau: { x: 0, y: 6, huong: 0 },
      maMau: { chinh: FOR(2, TIEN) },
      sao: { o: 5, nhip: 5 },
      loiGiai: { chinh: FOR(5, TIEN) },
      loiSai: [{ moTa: 'Quên wait(), bánh không quay', baiLam: { chinh: FOR(5, ['left_move()', 'right_move()']) }, phaiCoMa: ['chua-toi-co'] }] }),
    man({ so: 6, ten: 'Trùm: chữ L', hang: 'trum', cauTruc: ['for'],
      deBai: 'Đi thẳng ba ô, rẽ phải, đi thẳng hai ô nữa tới cờ.',
      san: ['...', '...', '...', '..F'],
      batDau: { x: 0, y: 0, huong: 2 },
      maMau: { chinh: TIEN.slice() },
      sao: { o: 9, nhip: 6 },
      loiGiai: { chinh: nhieu(FOR(3, TIEN), QUAY_TRAI, FOR(2, TIEN)) },
      huyHieu: 'm1-than' })
  ]);

  function manChe(m) {
    m.chuong = 'm1-che-than';
    m.loaiRobot = 'banh'; m.robot = { than: 'hai-banh', tay: null };
    m.hamGoc = HAM_GOC.slice(); m.khung = { chinh: 10, moiHam: 10 }; m.cauTruc = ['for'];
    m.moXuong = true; m.camHamCuaEm = false;
    return ManHoc.chuanHoa(m);
  }
  var T_MOVE = TIEN.slice();
  var T_TURN_R = QUAY_PHAI.slice();
  var T_TURN_L = QUAY_TRAI.slice();
  var T_UTURN = nhieu(QUAY_PHAI, QUAY_PHAI);
  function hMove() { return H('move', [], T_MOVE); }
  function hTurnR() { return H('turn_right', [], T_TURN_R); }
  function hTurnL() { return H('turn_left', [], T_TURN_L); }
  function hUTurn() { return H('u_turn', [], T_UTURN); }

  ManHoc.them([
    manChe({ so: 1, ten: 'Chế lệnh: move()', hang: 'lam-quen', taoHam: ['move'],
      deBai: 'Tạo hàm move() gồm left_move(), right_move(), wait() rồi gọi move() ba lần tới cờ.',
      san: ['...', '.F.', '...', '...', '...'],
      batDau: { x: 1, y: 4, huong: 0 },
      maMau: { chinh: ['move()'], hamCuaMan: [] },
      sao: { o: 4, nhip: 3 },
      loiGiai: { chinh: ['move()', 'move()', 'move()'], hamCuaEmMoi: [hMove()] } }),
    manChe({ so: 2, ten: 'Chế lệnh: turn_right()', hang: 'lam-quen', hamCuaEmCan: ['move'], taoHam: ['turn_right'],
      deBai: 'Tạo hàm turn_right() rồi rẽ phải, đi hai ô tới cờ.',
      san: ['.....', '.....', '..F..', '.....'],
      batDau: { x: 0, y: 2, huong: 0 },
      maMau: { chinh: ['move()'], hamCuaMan: [] },
      sao: { o: 4, nhip: 3 },
      loiGiai: { chinh: ['turn_right()', 'move()', 'move()'], hamCuaEmMoi: [hTurnR()] } }),
    manChe({ so: 3, ten: 'Chế lệnh: turn_left()', hang: 'lam-quen', hamCuaEmCan: ['move', 'turn_right'], taoHam: ['turn_left'],
      deBai: 'Tạo hàm turn_left() rồi rẽ trái, đi hai ô tới cờ.',
      san: ['.....', '.....', '..F..', '.....'],
      batDau: { x: 4, y: 2, huong: 0 },
      maMau: { chinh: ['move()'], hamCuaMan: [] },
      sao: { o: 4, nhip: 3 },
      loiGiai: { chinh: ['turn_left()', 'move()', 'move()'], hamCuaEmMoi: [hTurnL()] } }),
    manChe({ so: 4, ten: 'Chế lệnh: u_turn()', hang: 'luyen', hamCuaEmCan: ['move', 'turn_right', 'turn_left'], taoHam: ['u_turn'],
      deBai: 'Tạo hàm u_turn() (quay ngược, 2 lần turn_right()) rồi quay lại, đi hai ô tới cờ.',
      san: ['..F..', '.....'],
      batDau: { x: 2, y: 1, huong: 2 },
      maMau: { chinh: ['move()'], hamCuaMan: [] },
      sao: { o: 4, nhip: 2 },
      loiGiai: { chinh: ['u_turn()', 'move()'], hamCuaEmMoi: [hUTurn()] } }),
    manChe({ so: 5, ten: 'Dùng lại hàm trong for', hang: 'luyen', hamCuaEmCan: ['move', 'turn_right'], cauTruc: ['for'],
      deBai: 'Đường chữ L: đi 2, rẽ phải, đi 2 tới cờ.',
      san: ['.....', '...F.', '.....', '.....'],
      batDau: { x: 1, y: 3, huong: 0 },
      maMau: { chinh: ['move()'], hamCuaMan: [] },
      sao: { o: 5, nhip: 4 },
      loiGiai: { chinh: nhieu(FOR(2, ['move()']), ['turn_right()'], FOR(2, ['move()'])) } }),
    manChe({ so: 6, ten: 'Trùm: về đúng hướng cũ', hang: 'trum', hamCuaEmCan: ['move', 'turn_right', 'turn_left', 'u_turn'],
      deBai: 'Đi 2 ô, rẽ trái, đi 2 ô, u_turn(), đi 1 ô tới cờ.',
      san: ['...F.', '.....'],
      batDau: { x: 4, y: 1, huong: 0 },
      maMau: { chinh: ['move()'], hamCuaMan: [] },
      sao: { o: 6, nhip: 5 },
      loiGiai: { chinh: ['move()', 'turn_left()', 'move()', 'move()', 'u_turn()', 'move()'] },
      huyHieu: 'm1-che-than' })
  ]);

  if (laNode) module.exports = ManHoc;
})();
