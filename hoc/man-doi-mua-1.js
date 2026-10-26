/* ============================================================================
   man-doi-mua-1.js — "Robot Chấn Hưng": 10 MÀN MỚI cho mùa 1, gói 8 "Đội hai robot", CHƯƠNG 2 `che-hai-robot` "Đội phối hợp"
   (KE-HOACH-MUA-1.md, bảng 10 gói: "10 mới: hai robot dùng tay xoay / cảm biến bên"). Đứng ngay sau chương `hai-robot` (man-hai-robot.js).

   Đội: R1 (sơn vàng) = xe hai bánh + TAY KẸP + cảm biến khoảng cách; R2 (sơn lam) = xe hai bánh + TAY XOAY + cảm biến khoảng cách.
   Mỗi robot một chương trình, nhịp chung, không có lệnh báo nhau (KE-HOACH-HAI-ROBOT.md): muốn chờ đồng đội thì hỏi cảm biến
   (trước mặt hay HAI BÊN: đồng đội và vật đều làm front_clear() / left_clear() / right_clear() trả False). Cửa C mở khi có xe hay vật đè nút M.
   Gói 8 đứng sau gói 1–7 nên chương này dùng thứ chương 1 chưa dùng: tay xoay (pick_left, drop_right…), cảm biến bên (left_clear, right_clear,
   to_gap), nút đè M + cửa C, bánh lùi (back, park). Ràng buộc mùa 1: không biến (khung.chanBien), không hàm có tham số, không bậc thang, không part mùa sau.
   Không tạo hàm của em mới: chỉ dùng kho đã có (pick / drop 2 nhịp; pick_left / drop_right… 2 nhịp; move / back / turn_* / u_turn 1 nhịp).

   Mười màn (lời giải chuẩn):
     1  Tay xoay vào đội     dua-vat   R1 đã có chương trình; R2 chuyền vật bên trái sang ô đích bên phải: pick_left(), drop_right()
     2  Nhìn bên hông        toi-co    R1 tìm lối rẽ bên phải bằng to_gap(); R2 đi thẳng tới cờ
     (các màn sau: xem DS)

   Dữ liệu màn nhiều robot như man-hai-robot.js: man.doi = [phần riêng R1, phần riêng R2] (batDau, loaiRobot, robot, hamGoc, coDinh); cấp ngoài là của R1.
   Bài làm: { doi: [{ chinh }, { chinh }], hamCuaMan }. Ô = tổng hai chương trình chính + thân mỗi hàm được gọi (mỗi hàm một lần).
   Sao: sao.o / sao.nhip đo bằng cham.js trên lời giải (kiem-doi-mua-1.mjs so khớp đúng từng số).
   Tệp này KHÔNG tự thêm màn vào ManHoc: danh sách nằm ở ManHoc.manDoiMua1, lo-trinh-hoc.js thêm chương che-hai-robot vào gói hai-robot.
   Hướng: 0 lên, 1 phải, 2 xuống, 3 trái. (x, y) với y = 0 ở hàng trên.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var BA_HUONG = ['front_clear', 'left_clear', 'right_clear'];
  var CAM = [{ ma: 'khoang-cach', o: 'hong' }];
  var KEP = { loaiRobot: 'banh', robot: { than: 'hai-banh', tay: 'kep', camBien: CAM, son: 'vang' }, hamGoc: BANH.concat(['arm_down', 'arm_up', 'grab', 'release'], BA_HUONG) };
  var XOAY = { loaiRobot: 'banh', robot: { than: 'hai-banh', tay: 'xoay', camBien: CAM, son: 'lam' }, hamGoc: BANH.concat(['arm_down', 'arm_up', 'arm_left', 'arm_right', 'grab', 'release'], BA_HUONG) };

  function sao(x) { return JSON.parse(JSON.stringify(x)); }
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  function FOR(n, than) { return ['for i in range(' + n + '):'].concat(than.map(function (s) { return '    ' + s; })); }
  /** Bài làm hai robot. */
  function B(c1, c2) { return { doi: [{ chinh: c1.slice() }, { chinh: c2.slice() }] }; }

  /**
   * Trường chung. m.bd: [batDau R1, batDau R2] (ô hay mảng ô theo sân); m.khoa: chỉ số robot tự động (chương trình khóa, maMau.doi[i] = lời giải.doi[i]);
   * m.co: [cờ riêng R1, cờ riêng R2] (mục tiêu toi-co: mỗi robot chỉ dừng ở cờ của mình).
   */
  function man(m) {
    var bd = m.bd, khoa = m.khoa, co = m.co;
    delete m.bd; delete m.khoa; delete m.co;
    m.chuong = 'che-hai-robot';
    m.hang = m.so <= 3 ? 'lam-quen' : m.so <= 6 ? 'luyen' : m.so <= 9 ? 'bien-the' : 'trum';
    m.cauTruc = ['for', 'if', 'while'];
    m.mucTieu = m.mucTieu || 'toi-co';
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10, chanBien: true };
    if (Array.isArray(m.san[0])) m.nhipTheo = 'tong';
    m.nhipTheoLoiGiai = true;
    m.doi = [Object.assign({ batDau: bd[0] }, sao(KEP)), Object.assign({ batDau: bd[1] }, sao(XOAY))];
    if (khoa !== undefined) m.doi[khoa].coDinh = true;
    if (co) { m.doi[0].co = co[0]; m.doi[1].co = co[1]; }
    m.batDau = bd[0]; m.loaiRobot = KEP.loaiRobot; m.robot = sao(KEP.robot); m.hamGoc = KEP.hamGoc.slice();   // cấp ngoài = R1
    m.maMau = m.maMau || B([], []);
    m.taoHam = [];
    return ManHoc.chuanHoa(m);
  }

  /* ------------------------------------------------------------------- sân */

  // 1: làn R1 dọc (x = 0): vật trước mặt, ô đích sau lưng. Làn R2: R2 ở (3,1) quay lên, vật bên trái (2,1), ô đích bên phải (4,1)
  var SAN_1 = ['o####', '.#o.D', 'D####'];

  // 2: hành lang trên của R1 (hàng 1), lối rẽ xuống ở (3,2), cờ R1 ở (3,3); hành lang dưới của R2 (hàng 5), cờ R2 ở (1,5)
  var SAN_2 = ['#######', '#.....#', '###.###', '###F###', '#######', '#F....#', '#######'];

  // 3: R1 ở (3,1) quay phải, nút đè M ngay trước mặt (4,1). R2 ở (1,3) quay phải, vật bên trái (1,2), cửa C (2,3) chắn hành lang, ô đích (5,4) ở bên phải cuối hành lang
  var SAN_3 = ['#######', '###.M##', '#o#####', '#.C...#', '#####D#', '#######'];

  // 4: R1 ở (1,2) quay lên, vật trước mặt (1,1); ô bàn giao (2,2) bên phải R1 = bên trái R2; R2 ở (3,2) quay lên, ô đích (4,2) bên phải R2.
  //    Ô đích chỉ tay xoay của R2 với tới; vật chỉ R1 lấy được.
  var SAN_4 = ['######', '#o####', '#...D#', '######'];

  // 5: như 4 nhưng ô đích (4,3) ở bên phải, hai ô phía sau R2 (R2 ở (3,1) quay lên, ngõ dọc (3,1)–(3,3)). Lối duy nhất là một đường cụt: R1 không vượt được R2.
  var SAN_5 = ['#o####', '#...##', '###.##', '###.D#', '######'];

  var DS = [
    /* ------------------------------------------------------------ hàng 1: làm quen */
    man({
      so: 1, ten: 'Tay xoay vào đội',
      hamCuaEmCan: ['pick', 'u_turn', 'drop', 'pick_left', 'drop_right', 'drop_left'],
      mucTieu: 'dua-vat',
      deBai: 'R2 đổi sang tay xoay: nhặt và đặt được ở hai bên mà không quay xe. R1 đã có chương trình. Viết chương trình cho R2 chuyển vật bên trái sang ô đích bên phải.',
      veMaMau: 'Chạm thẻ R2: tay xoay có lệnh arm_left() / arm_right(), kho có pick_left() và drop_right().',
      san: SAN_1, bd: [{ x: 0, y: 1, huong: 0 }, { x: 3, y: 1, huong: 0 }],
      maMau: B(['pick()', 'u_turn()', 'drop()'], []),
      sao: { o: 32, nhip: 4 },
      loiGiai: B(['pick()', 'u_turn()', 'drop()'], ['pick_left()', 'drop_right()']),
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: B(['pick()', 'u_turn()', 'drop()'], ['# trái sang phải', 'pick_left()', 'drop_right()']) },
      loiSai: [
        { moTa: 'Quên viết chương trình cho R2', baiLam: B(['pick()', 'u_turn()', 'drop()'], []), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'R2 đặt vật về lại bên trái', baiLam: B(['pick()', 'u_turn()', 'drop()'], ['pick_left()', 'drop_left()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Tay xoay nhặt được vật bên trái: pick_left().', 'Đặt sang bên phải: drop_right(). Xe không cần quay.']
    }),

    man({
      so: 2, ten: 'Nhìn bên hông',
      hamCuaEmCan: ['to_gap', 'turn_right', 'go_wall', 'turn_left'],
      deBai: 'Lối vào cờ của R1 nằm ở bên phải hành lang, giữa đường. go_wall() sẽ chạy quá lối rẽ. R1 hỏi cảm biến bên phải để dừng đúng chỗ; R2 đi thẳng tới cờ của nó.',
      veMaMau: 'R2 đã có chương trình. Viết chương trình R1: to_gap() đi tới khi bên phải trống.',
      san: SAN_2, bd: [{ x: 1, y: 1, huong: 1 }, { x: 5, y: 5, huong: 3 }],
      maMau: B([], ['go_wall()']),
      sao: { o: 13, nhip: 5 },
      loiGiai: B(['to_gap()', 'turn_right()', 'go_wall()'], ['go_wall()']),
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: B(['# tìm lối bên phải', 'to_gap()', 'turn_right()', 'go_wall()'], ['go_wall()']) },
      loiSai: [
        { moTa: 'R1 đi tới tường: chạy quá lối rẽ', baiLam: B(['go_wall()', 'turn_right()', 'go_wall()'], ['go_wall()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'R1 rẽ trái ở lối rẽ: nhìn vào tường', baiLam: B(['to_gap()', 'turn_left()', 'go_wall()'], ['go_wall()']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['to_gap() đi thẳng cho tới khi bên phải trống.', 'Dừng ở lối rẽ rồi turn_right() và go_wall().']
    }),

    man({
      so: 3, ten: 'Giữ cửa cho bạn',
      hamCuaEmCan: ['move', 'pick_left', 'go_wall', 'drop_right', 'drop'],
      mucTieu: 'dua-vat',
      deBai: 'Cửa C chắn hành lang của R2. Xe hay vật đè lên nút M thì cửa mở; rời nút thì cửa đóng. R2 đã có chương trình mang vật qua cửa. Cho R1 đứng lên nút M giữ cửa mở.',
      veMaMau: 'Chạy thử: R2 dừng trước cửa đóng. Viết chương trình R1.',
      san: SAN_3, bd: [{ x: 3, y: 1, huong: 1 }, { x: 1, y: 3, huong: 1 }],
      maMau: B([], ['pick_left()', 'go_wall()', 'drop_right()']),
      sao: { o: 23, nhip: 7 },
      loiGiai: B(['move()'], ['pick_left()', 'go_wall()', 'drop_right()']),
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: B(['# đứng lên nút đè', 'move()'], ['pick_left()', 'go_wall()', 'drop_right()']) },
      loiSai: [
        { moTa: 'R1 đứng yên: cửa vẫn đóng, R2 dừng trước cửa', baiLam: B([], ['pick_left()', 'go_wall()', 'drop_right()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'R2 đặt vật ra trước mặt: trước mặt là tường', baiLam: B(['move()'], ['pick_left()', 'go_wall()', 'drop()']), phaiCoMa: ['tha-bi-chan', 'chua-dua-vat'] }
      ],
      goiY: ['Nút M ở ngay trước mặt R1.', 'R1 chỉ cần move() lên nút và đứng yên ở đó.']
    }),

    /* ------------------------------------------------------------ hàng 2: luyện */
    man({
      so: 4, ten: 'Chờ hàng bên hông',
      hamCuaEmCan: ['pick', 'turn_right', 'drop', 'pick_left', 'drop_right'],
      mucTieu: 'dua-vat',
      deBai: 'Chỉ R1 lấy được vật, chỉ tay xoay của R2 với tới ô đích. R1 đặt vật vào ô ngay bên trái R2. R2 phải chờ tới khi thấy vật bên trái rồi mới nhặt.',
      veMaMau: 'Chạy thử: R2 nhặt khi vật chưa tới. Thêm vòng chờ cho R2.',
      san: SAN_4, bd: [{ x: 1, y: 2, huong: 0 }, { x: 3, y: 2, huong: 0 }],
      maMau: B(['pick()', 'turn_right()', 'drop()'], ['pick_left()', 'drop_right()']),
      sao: { o: 33, nhip: 7 },
      loiGiai: B(['pick()', 'turn_right()', 'drop()'], ['while left_clear():', '    wait()', 'pick_left()', 'drop_right()']),
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: B(['pick()', 'turn_right()', 'drop()'], ['# chờ vật tới bên trái', 'while left_clear():', '    wait()', 'pick_left()', 'drop_right()']) },
      loiSai: [
        { moTa: 'R2 không chờ: kẹp khi vật chưa tới', baiLam: B(['pick()', 'turn_right()', 'drop()'], ['pick_left()', 'drop_right()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'R2 chờ ngược điều kiện: thừa chữ not', baiLam: B(['pick()', 'turn_right()', 'drop()'], ['while not left_clear():', '    wait()', 'pick_left()', 'drop_right()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Bên trái còn trống thì left_clear() trả True: R2 còn phải chờ.', 'while left_clear(): wait() rồi pick_left(), drop_right().']
    }),

    man({
      so: 5, ten: 'Lùi mang hàng',
      hamCuaEmCan: ['pick', 'turn_right', 'drop', 'pick_left', 'back', 'drop_right', 'u_turn', 'move'],
      mucTieu: 'dua-vat',
      deBai: 'Ô đích ở bên phải, hai ô phía sau lưng R2. Nhận vật xong, R2 lùi về cạnh ô đích rồi đặt vật sang phải. Lùi thì bên phải vẫn là bên phải; quay đầu thì bên phải thành bên trái.',
      veMaMau: 'R1 và phần nhận vật của R2 đã có. Viết tiếp chương trình R2.',
      san: SAN_5, bd: [{ x: 1, y: 1, huong: 0 }, { x: 3, y: 1, huong: 0 }],
      maMau: B(['pick()', 'turn_right()', 'drop()'], ['while left_clear():', '    wait()', 'pick_left()']),
      sao: { o: 38, nhip: 9 },
      loiGiai: B(['pick()', 'turn_right()', 'drop()'], nhieu(['while left_clear():', '    wait()', 'pick_left()'], FOR(2, ['back()']), ['drop_right()'])),
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: B(['pick()', 'turn_right()', 'drop()'], nhieu(['while left_clear():', '    wait()', 'pick_left()', '# lùi về cạnh ô đích'], FOR(2, ['back()']), ['drop_right()'])) },
      loiSai: [
        { moTa: 'R2 quay đầu rồi tiến: ô đích sang bên trái', baiLam: B(['pick()', 'turn_right()', 'drop()'], ['while left_clear():', '    wait()', 'pick_left()', 'u_turn()', 'move()', 'move()', 'drop_right()']), phaiCoMa: ['tha-bi-chan', 'chua-dua-vat'] },
        { moTa: 'R2 lùi một ô: bên phải là tường', baiLam: B(['pick()', 'turn_right()', 'drop()'], ['while left_clear():', '    wait()', 'pick_left()', 'back()', 'drop_right()']), phaiCoMa: ['tha-bi-chan', 'chua-dua-vat'] }
      ],
      goiY: ['back() lùi một ô, mặt xe và tay xoay vẫn như cũ.', 'Lùi hai ô (for i in range(2): back()) rồi drop_right().']
    })
  ];

  ManHoc.manDoiMua1 = DS;
  if (laNode) module.exports = ManHoc;
})();
