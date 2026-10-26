/* ============================================================================
   man-combo-mua-1.js — "Robot Chấn Hưng": 19 MÀN MỚI cho mùa 1, gói 9 "Combo" (KE-HOACH-MUA-1.md, bảng 10 gói:
   "10 mới: tay xoay + cảm biến bên" · "che-cam-bien.10 + 9 mới"). Mã gói `combo` (phim gói ở game/phim-mua-1.js tự chiếu).

   Ý chính của gói (combo): CẢM BIẾN BÊN hỏi bên nào có thùng (thùng làm left_clear() / right_clear() trả False), rồi TAY XOAY nhặt / đặt
   đúng bên đó mà KHÔNG QUAY XE (pick_left / pick_right / drop_left / drop_right của chương che-tay-xoay).
   Robot: xe hai bánh + TAY XOAY + cảm biến khoảng cách ba hướng (như R2 của chương che-hai-robot). Màn hai robot: R1 tay kẹp (vàng), R2 tay xoay (lam).

   - Chương `combo` "Nhìn bên, nhặt bên" (mã combo.1 … .10; .10 trùm ba sân, huy hiệu 'combo'): combo cốt lõi.
   - Chương `che-combo` "Combo mở rộng" (mã che-combo.1 … .9 + che-cam-bien.10 do lo-trinh-hoc.js chèn; trùm che-combo.9 ba sân,
     huy hiệu 'che-combo'): ghép combo với từng gói cũ (hàm, vòng for, front_clear / go_wall, nút đè, bánh lùi, đội hai robot).
   Mỗi màn khai `kieuBai` (giao-hang · do-duong · sua-ham · che-ham · do-nhip · nhieu-san · hai-robot): kiem-combo-mua-1.mjs kiểm
   không hai màn liền nhau cùng kiểu, và in BẢNG RECALL (gói 1–8 nào được dùng, đọc từ lời giải).

   Ràng buộc mùa 1: không biến (khung.chanBien), không hàm có tham số, không bậc thang, không part mùa sau. Không tạo hàm của em mới:
   màn "chế hàm" / "sửa hàm" dùng HÀM CỦA MÀN (maMau.hamCuaMan) mà chương trình chính bị khóa (chinhCoDinh) gọi.
   Hàm của em dùng được: mọi hàm chế ở gói 1–8 (go_wall, back, to_gap, pick_left, drop_right, pick_right, drop_left, put_right…).

   Sao: sao.o / sao.nhip đo bằng cham.js trên lời giải (kiem-combo-mua-1.mjs so khớp đúng từng số).
   Tệp này KHÔNG tự thêm màn vào ManHoc: danh sách nằm ở ManHoc.manComboMua1, lo-trinh-hoc.js thêm hai chương vào gói combo.
   Hướng: 0 lên, 1 phải, 2 xuống, 3 trái. (x, y) với y = 0 ở hàng trên. Xe quay lên thì bên trái là x − 1, bên phải là x + 1.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var BA_HUONG = ['front_clear', 'left_clear', 'right_clear'];
  var CAM = [{ ma: 'khoang-cach', o: 'hong' }];
  var XOAY = { loaiRobot: 'banh', robot: { than: 'hai-banh', tay: 'xoay', camBien: CAM }, hamGoc: BANH.concat(['arm_down', 'arm_up', 'arm_left', 'arm_right', 'grab', 'release'], BA_HUONG) };
  var KEP = { loaiRobot: 'banh', robot: { than: 'hai-banh', tay: 'kep', camBien: CAM }, hamGoc: BANH.concat(['arm_down', 'arm_up', 'grab', 'release'], BA_HUONG) };

  function sao(x) { return JSON.parse(JSON.stringify(x)); }
  function H(ten, than) { return { ten: ten, thamSo: [], than: than.slice() }; }
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  function FOR(n, than) { return ['for i in range(' + n + '):'].concat(than.map(function (s) { return '    ' + s; })); }
  function THUT(ds) { return ds.map(function (s) { return '    ' + s; }); }
  /** if <dk>: a else: b (a, b là mảng dòng). */
  function IF(dk, a, b) { return ['if ' + dk + ':'].concat(THUT(a), b ? ['else:'].concat(THUT(b)) : []); }
  /** Nhặt bên có thùng: bên trái trống thì thùng ở bên phải. */
  var NHAT_BEN = IF('left_clear()', ['pick_right()'], ['pick_left()']);
  /** Bài làm hai robot. */
  function B(c1, c2, hm) { return { doi: [{ chinh: c1.slice() }, { chinh: c2.slice() }], hamCuaMan: hm || [] }; }

  /**
   * Trường chung. m.c: 1 (chương combo) hay 2 (chương che-combo). Màn hai robot: m.bd = [batDau R1, batDau R2], m.khoa = chỉ số robot khóa.
   */
  function man(m) {
    var c = m.c, bd = m.bd, khoa = m.khoa;
    delete m.c; delete m.bd; delete m.khoa;
    m.chuong = c === 1 ? 'combo' : 'che-combo';
    m.hang = m.so <= 3 ? 'lam-quen' : m.so <= 6 ? 'luyen' : m.so <= 9 ? 'bien-the' : 'trum';
    m.cauTruc = ['for', 'if', 'while'];
    m.mucTieu = m.mucTieu || 'toi-co';
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10, chanBien: true };
    m.nhipTheoLoiGiai = true;
    if (bd) {
      m.doi = [Object.assign({ batDau: bd[0] }, sao(KEP), { robot: Object.assign(sao(KEP.robot), { son: 'vang' }) }),
        Object.assign({ batDau: bd[1] }, sao(XOAY), { robot: Object.assign(sao(XOAY.robot), { son: 'lam' }) })];
      if (khoa !== undefined) m.doi[khoa].coDinh = true;
      m.batDau = bd[0]; m.loaiRobot = KEP.loaiRobot; m.robot = sao(m.doi[0].robot); m.hamGoc = KEP.hamGoc.slice();   // cấp ngoài = R1
    } else {
      m.loaiRobot = XOAY.loaiRobot; m.robot = sao(XOAY.robot); m.hamGoc = XOAY.hamGoc.slice();
    }
    if (Array.isArray(m.san[0])) {
      m.nhipTheo = 'tong';
      if (!bd && !Array.isArray(m.batDau)) m.batDau = m.san.map(function () { return Object.assign({}, m.batDau); });
    }
    m.taoHam = [];
    return ManHoc.chuanHoa(m);
  }

  /* ================================================================ chương combo "Nhìn bên, nhặt bên" */

  // 1: xe (2,2) quay lên, đi tới tường ở (2,1); thùng ở bên trái (1,1), bên phải (3,1) trống; ô đích (2,3) phía sau
  var L_1 = nhieu(['go_wall()'], NHAT_BEN, ['u_turn()', 'move()', 'drop()']);
  // 2: làn x = 2, kệ phải x = 3 (sàn trống); thùng ở (3,2); ô đích (3,5) ngay bên phải chỗ xuất phát (2,5). Đi tới khi bên phải có thùng, nhặt,
  //    lùi về chỗ cũ (ba ô), đặt sang phải. Đi tắt qua kệ (vào kệ, nhặt phía trước, quay xuống đặt) cũng 10 nhịp: không nhanh hơn.
  var L_2 = nhieu(['while right_clear():', '    move()', 'pick_right()'], FOR(3, ['back()']), ['drop_right()']);

  var DS = [
    man({
      c: 1, so: 1, ten: 'Thùng nằm bên nào', kieuBai: 'giao-hang', mucTieu: 'dua-vat',
      hamCuaEmCan: ['go_wall', 'pick_right', 'pick_left', 'u_turn', 'move', 'drop'],
      deBai: 'Xe có tay xoay và cảm biến hai bên. Đi tới tường, hỏi cảm biến xem thùng nằm bên trái hay bên phải, xoay tay nhặt đúng bên đó mà không quay xe, rồi mang thùng về đặt vào ô đích sau lưng.',
      veMaMau: 'Chương trình mới biết nhặt bên phải. Thêm nhánh else cho trường hợp thùng ở bên trái.',
      san: ['#####', '#o..#', '##.##', '##D##', '#####'], batDau: { x: 2, y: 2, huong: 0 },
      maMau: { chinh: ['go_wall()', 'if left_clear():', '    pick_right()', 'u_turn()', 'move()', 'drop()'] },
      sao: { o: 28, nhip: 6 },
      loiGiai: { chinh: L_1 },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: ['# thùng ở bên nào?'].concat(L_1) } },
      loiSai: [
        { moTa: 'Chỉ biết nhặt bên phải: thùng nằm bên trái nên tay kẹp vào chỗ trống', baiLam: { chinh: ['go_wall()', 'if left_clear():', '    pick_right()', 'u_turn()', 'move()', 'drop()'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Đảo hai nhánh: bên trái có thùng lại đi nhặt bên phải', baiLam: { chinh: nhieu(['go_wall()'], IF('left_clear()', ['pick_left()'], ['pick_right()']), ['u_turn()', 'move()', 'drop()']) }, phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Thùng nằm cạnh xe thì cảm biến bên đó trả False, giống như gặp tường.', 'if left_clear(): pick_right() — còn không (else) thì pick_left().']
    }),

    man({
      c: 1, so: 2, ten: 'Dừng cạnh thùng', kieuBai: 'do-duong', mucTieu: 'dua-vat',
      hamCuaEmCan: ['move', 'pick_right', 'back', 'drop_right', 'go_wall', 'u_turn'],
      deBai: 'Dọc lối đi, kệ bên phải còn trống nhiều ngăn, chỉ một ngăn có thùng. Đi tới khi thấy thùng ở bên phải, nhặt nó, rồi lùi về chỗ xuất phát và đặt thùng vào ô đích ở kệ bên phải. go_wall() sẽ đi quá chỗ thùng.',
      veMaMau: 'Xe đã dừng đúng cạnh thùng và nhặt được. Viết tiếp: lùi ba ô bằng vòng for, đặt sang phải.',
      san: ['#####', '##.##', '##.o#', '##..#', '##..#', '##.D#', '#####'], batDau: { x: 2, y: 5, huong: 0 },
      maMau: { chinh: ['while right_clear():', '    move()', 'pick_right()'] },
      sao: { o: 26, nhip: 9 },
      loiGiai: { chinh: L_2 },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: ['# tới khi bên phải có thùng'].concat(L_2) } },
      loiSai: [
        { moTa: 'Đi tới tường: chạy quá chỗ thùng, tay kẹp vào ngăn trống', baiLam: { chinh: nhieu(['go_wall()', 'pick_right()'], FOR(3, ['back()']), ['drop_right()']) }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quay đầu rồi đi ba ô: ô đích chuyển sang bên trái xe', baiLam: { chinh: nhieu(['while right_clear():', '    move()', 'pick_right()', 'u_turn()'], FOR(3, ['move()']), ['drop_right()']) }, phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Ngăn kệ trống thì right_clear() trả True: đi tiếp. Gặp thùng thì dừng.', 'Lùi thì mặt xe và bên phải vẫn như cũ: for i in range(3): back().']
    })
  ];

  ManHoc.manComboMua1 = DS;
  if (laNode) module.exports = ManHoc;
})();
