/* ============================================================================
   man-robot-hoan-thien.js — "Đường học": CHƯƠNG `robot-hoan-thien` · ROBOT HOÀN THIỆN (10 màn). Kế hoạch "Chế lệnh" 14/10 (KE-HOACH-CHE-LENH.md, mục 5.4).
   Chương thứ 10, CUỐI đợt 1: thắng trùm của chương này thì mở khóa đợt 2 (ThuTuChuong.congDot2 = 'robot-hoan-thien', bảng "Mở khóa bộ phận mới!").
   Robot là XE HAI BÁNH gắn TAY KẸP và CẢM BIẾN KHOẢNG CÁCH ở hông: robot { than: 'hai-banh', tay: 'kep', camBien: [{ ma: 'khoang-cach', o: 'hong' }] }.
   Chương này chủ yếu ÁP DỤNG: mỗi màn là một NHIỆM VỤ ghép cả ba bộ phận (đi, cầm nắm, cảm biến) bằng các hàm em đã chế ở chương 2 đến 9 (go_wall, pick, drop, back, pass_back,
   grab_back, put_right, swap, to_gap, bounce, fetch_back, u_turn…); KHÔNG màn nào bắt chế hàm mới (taoHam rỗng, Sổ lệnh không thêm mục). Người chơi TỰ VIẾT chương trình chính
   ở mọi màn (không chinhCoDinh, maMau.chinh rỗng); bản rỗng không thắng. Hướng: 0 lên, 1 phải, 2 xuống, 3 trái. (x, y) với y = 0 ở hàng trên.

   Mọi màn là MẢNG 3 SÂN cùng khung (man.san, batDau, bongMo song song; nhipTheo 'tong'): hành lang dài ngắn khác, thùng nằm gần xa khác, số thùng khác… nên một chương trình
   viết cứng số bước chỉ đúng một sân (hay thắng nhưng thừa nhịp, thiếu sao). Sao: sao.nhip = TỔNG nhịp ba sân của lời giải chuẩn (nhipTheoLoiGiai: pick() / drop() mất 2 nhịp nên đường
   ngắn nhất của bộ dò do-duong-robot-hoan-thien.mjs, gộp nâng tay vào nhịp bánh, luôn ngắn hơn hay bằng); sao.o = ô của lời giải chuẩn (chương trình + thân các hàm được gọi).

   Mười nhiệm vụ (lời giải chuẩn; kho = các hàm của em lúc tới màn, đã gồm bản sửa u_turn / turn_right / turn_left của che-xe và che-tay):
     1  Giao hàng             go_wall, pick, go_wall, back, drop              thùng giữa hành lang → ô cuối hành lang
     2  Hàng bỏ quên          grab_back, go_wall, back, drop                  thùng sau lưng xe → ô cuối hành lang
     3  Xếp ngăn kệ           pick, to_gap, turn_right, drop                  thùng trước mặt → ngăn kệ bên phải (cửa ngăn xa gần khác nhau)
     4  Đổi thùng             go_wall, swap, u_turn, go_wall                  đổi chỗ thùng đỏ và thùng xanh (vật mờ có màu) rồi về chỗ xuất phát
     5  Dọn dãy thùng         go_wall, while not front_clear(): put_right, move, go_wall      số thùng mỗi sân một khác (cảm biến phân biệt thùng với chỗ trống)
     6  Giao hàng quanh góc   pick, go_wall, face_open, go_wall, back, drop    hành lang chữ L
     7  Mắt xe lắp ngược      daoChieu ['cam']: tự viết hai vòng while … not front_clear() (go_wall cũ sai)
     8  Tay xe lắp ngược      daoChieu ['tay']: fixed_pick / fixed_drop (che-tay.8) dựng lại việc quét ba thùng
     9  Kẹt số lùi            phanCung không có right_back: back() hỏng; đếm bước bằng biến n, quay đầu rồi đi lại
     10 Ca làm ở kho (trùm)    go_wall, pass_back, bounce, to_gap, turn_right, fetch_back    gioiHanHam 6; huy hiệu `robot-hoan-thien`

   Nối tiếp man-chuoi-1.js vào cùng window.ManHoc. Thứ tự chương: thu-tu-chuong.js.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var BANH_HONG = ['left_move', 'right_move', 'left_back', 'wait'];              // màn 9: bánh phải kẹt số lùi (không có right_back)
  var TAY = ['arm_down', 'arm_up', 'grab', 'release'];
  var BA_HUONG = ['front_clear', 'left_clear', 'right_clear'];

  function H(ten, than) { return { ten: ten, thamSo: [], than: than.slice() }; }
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  function lap(s, n) { var kq = []; for (var i = 0; i < n; i++) kq.push(s); return kq; }
  /** Vòng for lặp các lệnh `lenh` (chuỗi hoặc mảng) `n` lần. */
  function LAP(n, lenh) {
    var ds = Array.isArray(lenh) ? lenh : [lenh];
    return ['for i in range(' + n + '):'].concat(ds.map(function (s) { return '    ' + s; }));
  }
  function thut(ds) { return ds.map(function (s) { return '    ' + s; }); }

  // lệnh bánh viết thẳng
  var W_BACK = ['left_back()', 'right_back()', 'wait()'];
  var W_MOVE = ['left_move()', 'right_move()', 'wait()'];
  var W_U_TURN = ['left_back()', 'right_move()', 'wait()'];
  var W_RIGHT = ['left_move()', 'wait()'];

  // chương trình chính của từng màn (lời giải chuẩn)
  var L_1 = ['go_wall()', 'pick()', 'go_wall()', 'back()', 'drop()'];
  var L_2 = ['grab_back()', 'go_wall()', 'back()', 'drop()'];
  var L_3 = ['pick()', 'to_gap()', 'turn_right()', 'drop()'];
  var L_4 = ['go_wall()', 'swap()', 'u_turn()', 'go_wall()'];
  var L_5 = nhieu(['go_wall()', 'while not front_clear():', '    put_right()', '    move()'], ['go_wall()']);
  var L_6 = ['pick()', 'go_wall()', 'face_open()', 'go_wall()', 'back()', 'drop()'];
  // 7: cảm biến báo ngược nên điều kiện đảo bằng not
  var L_7 = nhieu(['while not front_clear():', '    move()', 'pick()', 'while not front_clear():', '    move()', 'back()', 'drop()']);
  var L_8 = nhieu(['go_wall()'], LAP(3, ['fixed_pick()', 'move()', 'turn_right()', 'fixed_drop()', 'turn_left()']), ['u_turn()', 'go_wall()']);
  // 9: không lùi được → quay đầu rồi đi lại n ô
  var L_9 = ['n = 0', 'while front_clear():', '    move()', '    n = n + 1', 'pick()', 'u_turn()', 'for i in range(n):', '    move()', 'drop()'];
  var L_10 = ['go_wall()', 'pass_back()', 'bounce()', 'to_gap()', 'turn_right()', 'fetch_back()'];

  /**
   * m.hong: true thì khay là BANH_HONG (không có right_back) và phanCung bằng khay (màn 9). Trường này bị bỏ sau khi dùng.
   * Mọi màn: mục tiêu bóng mờ (trừ khai khác), mảng 3 sân, nhipTheo 'tong', nhipTheoLoiGiai, biến đếm mở (man.bienDem), chương trình chính tự viết.
   */
  function man(m) {
    var hong = m.hong;
    delete m.hong;
    m.chuong = 'robot-hoan-thien';
    m.cauTruc = ['for', 'if', 'while'];
    m.loaiRobot = 'banh';
    m.robot = { than: 'hai-banh', tay: 'kep', camBien: [{ ma: 'khoang-cach', o: 'hong' }] };
    m.hamGoc = nhieu(hong ? BANH_HONG : BANH, TAY, BA_HUONG);
    if (hong) m.phanCung = m.hamGoc.slice();
    m.mucTieu = 'bong-mo';
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    m.bienDem = true;
    m.nhipTheo = 'tong';
    m.nhipTheoLoiGiai = true;
    m.maMau = m.maMau || { chinh: [] };
    if (!Array.isArray(m.batDau)) m.batDau = m.san.map(function () { return Object.assign({}, m.batDau); });
    return ManHoc.chuanHoa(m);
  }

  /* ------------------------------------------------------------------- sân (dựng từ đường đi, kiểm bằng bộ dò và bằng chạy thật) */

  // 1: hành lang đứng 3×7, xe ở (1,6) quay lên; thùng nằm ở y = 4 / 2 / 5; ô cuối hành lang ở y = 1 / 0 / 2
  var SAN_1 = [
    ['###', '#.#', '#.#', '#.#', '#o#', '#.#', '#.#'],
    ['#.#', '#.#', '#o#', '#.#', '#.#', '#.#', '#.#'],
    ['###', '###', '#.#', '#.#', '#.#', '#o#', '#.#']
  ];
  var BD_1 = { x: 1, y: 6, huong: 0 };
  var BM_1 = [
    { x: 1, y: 2, huong: 0, vat: [{ x: 1, y: 1 }] },
    { x: 1, y: 1, huong: 0, vat: [{ x: 1, y: 0 }] },
    { x: 1, y: 3, huong: 0, vat: [{ x: 1, y: 2 }] }
  ];

  // 2: hành lang đứng 3×7, xe ở (1,4) quay lên, thùng bỏ quên ngay sau lưng ở (1,5); ô cuối hành lang ở y = 1 / 0 / 2
  var SAN_2 = [
    ['###', '#.#', '#.#', '#.#', '#.#', '#o#', '###'],
    ['#.#', '#.#', '#.#', '#.#', '#.#', '#o#', '###'],
    ['###', '###', '#.#', '#.#', '#.#', '#o#', '###']
  ];
  var BD_2 = { x: 1, y: 4, huong: 0 };
  var BM_2 = [
    { x: 1, y: 2, huong: 0, vat: [{ x: 1, y: 1 }] },
    { x: 1, y: 1, huong: 0, vat: [{ x: 1, y: 0 }] },
    { x: 1, y: 3, huong: 0, vat: [{ x: 1, y: 2 }] }
  ];

  // 3: hành lang đứng, xe ở (1,6) quay lên, thùng ngay trước mặt ở (1,5); ngăn kệ mở ra bên phải ở y = 1 / 3 / 4
  var SAN_3 = [
    ['####', '#..#', '#.##', '#.##', '#.##', '#o##', '#.##'],
    ['####', '#.##', '#.##', '#..#', '#.##', '#o##', '#.##'],
    ['####', '#.##', '#.##', '#.##', '#..#', '#o##', '#.##']
  ];
  var BD_3 = { x: 1, y: 6, huong: 0 };
  var BM_3 = [
    { x: 1, y: 1, huong: 1, vat: [{ x: 2, y: 1 }] },
    { x: 1, y: 3, huong: 1, vat: [{ x: 2, y: 3 }] },
    { x: 1, y: 4, huong: 1, vat: [{ x: 2, y: 4 }] }
  ];

  // 4: thùng đỏ A chắn hành lang ở (1,2) / (1,3) / (1,4), thùng xanh B ở bên phải chỗ xe dừng sát A; xe ở (1,6) quay lên. Sau khi đổi: B ở (1,ya), A ở (2,ya+1); xe về (1,6) quay xuống
  var SAN_4 = [
    ['####', '#.##', '#o##', '#.o#', '#.##', '#.##', '#.##'],
    ['####', '####', '#.##', '#o##', '#.o#', '#.##', '#.##'],
    ['####', '####', '####', '####', '#o##', '#.o#', '#.##']
  ];
  var MAU_4 = [
    ['....', '....', '.r..', '..b.', '....', '....', '....'],
    ['....', '....', '....', '.r..', '..b.', '....', '....'],
    ['....', '....', '....', '....', '.r..', '..b.', '....']
  ];
  var BD_4 = { x: 1, y: 6, huong: 0 };
  var BM_4 = [
    { x: 1, y: 6, huong: 2, vat: [{ x: 1, y: 2, mau: 'blue' }, { x: 2, y: 3, mau: 'red' }] },
    { x: 1, y: 6, huong: 2, vat: [{ x: 1, y: 3, mau: 'blue' }, { x: 2, y: 4, mau: 'red' }] },
    { x: 1, y: 6, huong: 2, vat: [{ x: 1, y: 4, mau: 'blue' }, { x: 2, y: 5, mau: 'red' }] }
  ];

  // 5: dãy 2 / 3 / 1 thùng thẳng hàng chắn hành lang (cột x = 1), bên phải mỗi thùng có ô trống để dời thùng sang; xe ở (1,6) quay lên; hết dãy là ô trống rồi tường
  var SAN_5 = [
    ['####', '#.##', '#.##', '#o##', '#o.#', '#..#', '#.##'],
    ['####', '#.##', '#o##', '#o.#', '#o.#', '#..#', '#.##'],
    ['####', '#.##', '#.##', '#.##', '#.##', '#o##', '#..#']
  ];
  var BD_5 = { x: 1, y: 6, huong: 0 };
  var BM_5 = [
    { x: 1, y: 1, huong: 0, vat: [{ x: 2, y: 5 }, { x: 2, y: 4 }] },
    { x: 1, y: 1, huong: 0, vat: [{ x: 2, y: 5 }, { x: 2, y: 4 }, { x: 2, y: 3 }] },
    { x: 1, y: 1, huong: 0, vat: [{ x: 2, y: 6 }] }
  ];

  // 6: hành lang chữ L, xe ở (1,6) quay lên, thùng ngay trước mặt (1,5): đi lên tới y = 1 / 3 / 5 rồi rẽ phải đi tới x = 3 / 4 / 2
  var SAN_6 = [
    ['######', '#...##', '#.####', '#.####', '#.####', '#o####', '#.####'],
    ['######', '######', '######', '#....#', '#.####', '#o####', '#.####'],
    ['######', '######', '######', '######', '######', '#o.###', '#.####']
  ];
  var BD_6 = { x: 1, y: 6, huong: 0 };
  var BM_6 = [
    { x: 2, y: 1, huong: 1, vat: [{ x: 3, y: 1 }] },
    { x: 3, y: 3, huong: 1, vat: [{ x: 4, y: 3 }] },
    { x: 1, y: 5, huong: 1, vat: [{ x: 2, y: 5 }] }
  ];

  // 7: hành lang ngang 7×3, xe ở (0,1) quay phải, thùng ở x = 3 / 2 / 1, ô cuối hành lang ở x = 6 / 4 / 5
  var SAN_7 = [
    ['#######', '...o...', '#######'],
    ['#######', '..o..##', '#######'],
    ['#######', '.o....#', '#######']
  ];
  var BD_7 = { x: 0, y: 1, huong: 1 };
  var BM_7 = [
    { x: 5, y: 1, huong: 1, vat: [{ x: 6, y: 1 }] },
    { x: 3, y: 1, huong: 1, vat: [{ x: 4, y: 1 }] },
    { x: 4, y: 1, huong: 1, vat: [{ x: 5, y: 1 }] }
  ];

  // 8: ba thùng thẳng hàng ở cột x = 1 (y = 1–3 / 2–4 / 3–5), ô trống bên phải mỗi thùng; xe ở (1,6) quay lên. Sau khi dời: ba thùng ở cột x = 2, xe về (1,6) quay xuống
  var SAN_8 = [
    ['####', '#o.#', '#o.#', '#o.#', '#.##', '#.##', '#.##'],
    ['####', '#.##', '#o.#', '#o.#', '#o.#', '#.##', '#.##'],
    ['####', '#.##', '#.##', '#o.#', '#o.#', '#o.#', '#.##']
  ];
  var BD_8 = { x: 1, y: 6, huong: 0 };
  var BM_8 = [
    { x: 1, y: 6, huong: 2, vat: [{ x: 2, y: 1 }, { x: 2, y: 2 }, { x: 2, y: 3 }] },
    { x: 1, y: 6, huong: 2, vat: [{ x: 2, y: 2 }, { x: 2, y: 3 }, { x: 2, y: 4 }] },
    { x: 1, y: 6, huong: 2, vat: [{ x: 2, y: 3 }, { x: 2, y: 4 }, { x: 2, y: 5 }] }
  ];

  // 9: hành lang đứng 3×7, xe ở (1,5) quay lên, sau lưng còn ô (1,6) trống; thùng ở cuối hành lang (xe đi 3 / 2 / 1 ô tới sát thùng; hàng trên cùng luôn là tường để nhãn ⚠ không che thùng). Xong: xe về (1,5) quay xuống, thùng ở (1,6)
  var SAN_9 = [
    ['###', '#o#', '#.#', '#.#', '#.#', '#.#', '#.#'],
    ['###', '###', '#o#', '#.#', '#.#', '#.#', '#.#'],
    ['###', '###', '###', '#o#', '#.#', '#.#', '#.#']
  ];
  var BD_9 = { x: 1, y: 5, huong: 0 };
  var BM_9 = [1, 2, 3].map(function () { return { x: 1, y: 5, huong: 2, vat: [{ x: 1, y: 6 }] }; });

  // 10: ba kho 7×7: hành lang đứng (x = 2), xe ở (2,6) quay lên; thùng chắn lối ở y = 4 / 3 / 4, cửa nhánh bên phải ở y = 2 / 1 / 3 (dài 2 / 3 / 3 ô, thùng hàng ở cuối nhánh),
  // hốc cụt bên trái làm mồi; ◆ ở đầu hành lang (2,0). Sau khi xong: thùng chắn lối ở sau xe, thùng nhánh ở ô đầu nhánh, xe ở cửa nhánh quay phải
  var SAN_10 = [
    ['##.####', '#..####', '##..o##', '##.####', '##o####', '##.####', '##.####'],
    ['##.####', '##...o#', '#..####', '##o####', '##.####', '##.####', '##.####'],
    ['##.####', '##.####', '#..####', '##...o#', '##o####', '##.####', '##.####']
  ];
  var BD_10 = { x: 2, y: 6, huong: 0 };
  var BM_10 = [
    { x: 2, y: 2, huong: 1, diQua: [{ x: 2, y: 0 }], vat: [{ x: 2, y: 6 }, { x: 3, y: 2 }] },
    { x: 2, y: 1, huong: 1, diQua: [{ x: 2, y: 0 }], vat: [{ x: 2, y: 5 }, { x: 3, y: 1 }] },
    { x: 2, y: 3, huong: 1, diQua: [{ x: 2, y: 0 }], vat: [{ x: 2, y: 6 }, { x: 3, y: 3 }] }
  ];

  var DS = [
    /* ------------------------------------------------------------ hàng 1: làm quen */
    man({
      so: 1, ten: 'Giao hàng', hang: 'lam-quen',
      hamCuaEmCan: ['go_wall', 'pick', 'back', 'drop'],
      deBai: 'Một thùng hàng nằm giữa hành lang, sân nào cũng xa gần khác nhau. Đưa thùng hàng tới ô cuối hành lang, sát tường, giống vật mờ.',
      san: SAN_1, batDau: BD_1, bongMo: BM_1,
      sao: { o: 23, nhip: 30 },
      loiGiai: { chinh: L_1.slice() },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: nhieu(['# lấy hàng, mang tới cuối đường'], L_1) } },
      congThucKhac: [
        { moTa: 'Lùi bằng lệnh bánh viết thẳng, không gọi back()', baiLam: { chinh: ['go_wall()', 'pick()', 'go_wall()'].concat(W_BACK, ['drop()']) } },
        { moTa: 'Quay đầu, đi một ô, quay đầu lại thay cho back() (đúng chỗ nhưng chậm hơn nên ít sao hơn)', baiLam: { chinh: ['go_wall()', 'pick()', 'go_wall()', 'u_turn()', 'move()', 'u_turn()', 'drop()'] } }
      ],
      loiSai: [
        { moTa: 'Thả ngay khi tới tường: ô trước mặt là tường nên không đặt được', baiLam: { chinh: ['go_wall()', 'pick()', 'go_wall()', 'drop()'] }, phaiCoMa: ['tha-bi-chan', 'lech-bong-mo'] },
        { moTa: 'Quên nhặt thùng: xe đi tới tường tay không', baiLam: { chinh: ['go_wall()', 'go_wall()', 'back()', 'drop()'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đếm cứng bước theo sân đầu: hai sân sau xe dừng sai chỗ', baiLam: { chinh: ['move()', 'pick()', 'move()', 'move()', 'move()', 'move()', 'back()', 'drop()'] }, phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Đi tới khi trước mặt bị chắn, nhặt thùng, rồi lại đi tới khi trước mặt bị chắn.', 'Xe phải lùi một ô trước khi đặt, để thùng nằm ở ô sát tường.']
    }),

    man({
      so: 2, ten: 'Hàng bỏ quên', hang: 'lam-quen',
      hamCuaEmCan: ['grab_back', 'go_wall', 'back', 'drop'],
      deBai: 'Có người bỏ quên một thùng hàng ngay sau lưng xe. Đưa thùng hàng tới ô cuối hành lang, sát tường, giống vật mờ.',
      san: SAN_2, batDau: BD_2, bongMo: BM_2,
      sao: { o: 28, nhip: 30 },
      loiGiai: { chinh: L_2.slice() },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: nhieu(['# nhặt hàng sau lưng, mang tới cuối đường'], L_2) } },
      congThucKhac: [
        { moTa: 'Quay lưng, nhặt, quay về bằng u_turn() và pick(), không gọi grab_back()', baiLam: { chinh: ['u_turn()', 'pick()', 'u_turn()', 'go_wall()', 'back()', 'drop()'] } }
      ],
      loiSai: [
        { moTa: 'Quên nhặt thùng sau lưng: xe đi tới tường tay không', baiLam: { chinh: ['go_wall()', 'back()', 'drop()'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Nhặt xong không quay về hướng cũ: xe quay mặt xuống', baiLam: { chinh: ['u_turn()', 'pick()', 'go_wall()', 'back()', 'drop()'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Thả ngay khi tới tường: ô trước mặt là tường nên không đặt được', baiLam: { chinh: ['grab_back()', 'go_wall()', 'drop()'] }, phaiCoMa: ['tha-bi-chan', 'lech-bong-mo'] }
      ],
      goiY: ['Thùng nằm sau lưng thì cần một lệnh em đã chế để nhặt rồi quay về.', 'Đi tới tường, lùi một ô rồi đặt thùng xuống.']
    }),

    man({
      so: 3, ten: 'Xếp ngăn kệ', hang: 'lam-quen',
      hamCuaEmCan: ['pick', 'to_gap', 'turn_right', 'drop'],
      deBai: 'Thùng hàng nằm ngay trước mặt xe. Mang nó đi dọc hành lang tới ngăn kệ mở ra bên phải, rồi đặt vào ngăn, giống vật mờ. Ngăn kệ mỗi sân ở một chỗ.',
      san: SAN_3, batDau: BD_3, bongMo: BM_3,
      sao: { o: 21, nhip: 25 },
      loiGiai: { chinh: L_3.slice() },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: nhieu(['# nhặt hàng, tìm ngăn kệ, bỏ vào'], L_3) } },
      congThucKhac: [
        { moTa: 'Viết thẳng vòng while hỏi cảm biến bên phải, không gọi to_gap()', baiLam: { chinh: ['pick()', 'while not right_clear():', '    move()', 'turn_right()', 'drop()'] } },
        { moTa: 'Rẽ phải bằng ba lần quay trái (đúng chỗ nhưng chậm hơn nên ít sao hơn)', baiLam: { chinh: ['pick()', 'to_gap()', 'turn_left()', 'turn_left()', 'turn_left()', 'drop()'] } }
      ],
      loiSai: [
        { moTa: 'Quên rẽ phải: thùng đặt ngay trước mặt, trong hành lang', baiLam: { chinh: ['pick()', 'to_gap()', 'drop()'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quên nhặt thùng: thùng vẫn chắn ngay trước mặt, to_gap() cứ húc vào nó mãi', baiLam: { chinh: ['to_gap()', 'turn_right()', 'drop()'] }, phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Đếm cứng bước theo sân đầu: hai sân sau xe dừng sai chỗ', baiLam: { chinh: ['pick()', 'move()', 'move()', 'move()', 'move()', 'move()', 'turn_right()', 'drop()'] }, phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Cảm biến bên phải báo khi nào có ngăn kệ mở ra.', 'Tới ngăn kệ thì quay mặt vào ngăn rồi mới đặt.']
    }),

    /* ------------------------------------------------------------ hàng 2: luyện */
    man({
      so: 4, ten: 'Đổi thùng', hang: 'luyen',
      hamCuaEmCan: ['go_wall', 'swap', 'u_turn'],
      deBai: 'Cuối hành lang có thùng đỏ chắn lối, và thùng xanh dương nằm bên phải chỗ xe dừng lại. Đổi chỗ hai thùng cho nhau, rồi cho xe về chỗ xuất phát, mặt quay xuống như xe mờ.',
      san: SAN_4, batDau: BD_4, bongMo: BM_4, vatMau: MAU_4,
      sao: { o: 40, nhip: 72 },
      loiGiai: { chinh: L_4.slice() },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: nhieu(['# đổi thùng rồi về'], L_4) } },
      congThucKhac: [
        { moTa: 'Quay đầu bằng hai lần quay phải (đúng chỗ nhưng chậm hơn một nhịp nên ít sao hơn)', baiLam: { chinh: ['go_wall()', 'swap()', 'turn_right()', 'turn_right()', 'go_wall()'] } }
      ],
      loiSai: [
        { moTa: 'Đổi thùng ngay chỗ xuất phát: thùng đỏ không nằm trước mặt', baiLam: { chinh: ['swap()', 'u_turn()', 'go_wall()'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đổi xong không đưa xe về: xe vẫn đứng cuối hành lang', baiLam: { chinh: ['go_wall()', 'swap()'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Chỉ cất thùng đỏ ra sau lưng: hai thùng chưa đổi chỗ', baiLam: { chinh: ['go_wall()', 'pass_back()', 'u_turn()', 'go_wall()'] }, phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Đi tới khi thùng đỏ chắn trước mặt, rồi đổi chỗ hai thùng.', 'Xong việc thì quay đầu và đi về tới khi trước mặt là tường.']
    }),

    man({
      so: 5, ten: 'Dọn dãy thùng', hang: 'luyen',
      hamCuaEmCan: ['go_wall', 'put_right', 'move'],
      deBai: 'Một dãy thùng xếp thẳng hàng chắn hành lang, mỗi sân dãy dài ngắn khác nhau. Dời từng thùng sang ô bên phải xe, rồi đưa xe tới cuối hành lang, giống vật mờ và xe mờ.',
      san: SAN_5, batDau: BD_5, bongMo: BM_5,
      sao: { o: 28, nhip: 51 },
      loiGiai: { chinh: L_5.slice() },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: nhieu(['# còn thùng chắn thì dời sang bên phải'], L_5) } },
      congThucKhac: [
        { moTa: 'Viết thẳng các lệnh nhặt, quay, đặt trong vòng while, không gọi put_right()', baiLam: { chinh: ['go_wall()', 'while not front_clear():', '    pick()', '    turn_right()', '    drop()', '    turn_left()', '    move()', 'go_wall()'] } }
      ],
      loiSai: [
        { moTa: 'Không dùng vòng while, dời đúng một thùng: hai sân còn lại chưa dọn xong', baiLam: { chinh: ['go_wall()', 'put_right()', 'move()', 'go_wall()'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quên move() trong vòng while: dời xong thùng đầu thì trước mặt đã trống, vòng dừng, các thùng sau còn nguyên', baiLam: { chinh: ['go_wall()', 'while not front_clear():', '    put_right()', 'go_wall()'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Vòng while chỉ chờ, không dời thùng: trước mặt luôn bị chắn', baiLam: { chinh: ['go_wall()', 'while not front_clear():', '    wait()', 'go_wall()'] }, phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Đếm cứng ba lần: sân có ít thùng hơn thì thừa nhịp, xe vẫn thắng nhưng thiếu sao', baiLam: { chinh: ['go_wall()'].concat(LAP(3, ['put_right()', 'move()']), ['go_wall()']) }, phaiCoMa: ['kep-hut'] }
      ],
      goiY: ['Còn thùng chắn trước mặt thì cảm biến báo bị chắn.', 'Dời một thùng xong thì tiến một ô, để thùng kế tiếp nằm ngay trước mặt.']
    }),

    man({
      so: 6, ten: 'Giao hàng quanh góc', hang: 'luyen',
      hamCuaEmCan: ['pick', 'go_wall', 'face_open', 'back', 'drop'], gioiHanHam: 5,
      deBai: 'Thùng hàng nằm ngay trước mặt xe. Mang nó đi hết hành lang, rẽ phải ở góc, đi tới cuối đoạn kia và đặt xuống sát tường, giống vật mờ. Chương trình chỉ được gọi 5 hàm của em khác nhau.',
      san: SAN_6, batDau: BD_6, bongMo: BM_6,
      sao: { o: 28, nhip: 33 },
      loiGiai: { chinh: L_6.slice() },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: nhieu(['# hàng đi qua một góc'], L_6) } },
      congThucKhac: [
        { moTa: 'Rẽ phải bằng turn_right(), không gọi face_open() (khúc quẹo nào cũng rẽ phải)', baiLam: { chinh: ['pick()', 'go_wall()', 'turn_right()', 'go_wall()', 'back()', 'drop()'] } }
      ],
      loiSai: [
        { moTa: 'Quên rẽ ở góc: xe đứng đó và đặt thùng vào tường', baiLam: { chinh: ['pick()', 'go_wall()', 'back()', 'drop()'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đi tiếp xong thả ngay ở tường: ô trước mặt là tường nên không đặt được', baiLam: { chinh: ['pick()', 'go_wall()', 'face_open()', 'go_wall()', 'drop()'] }, phaiCoMa: ['tha-bi-chan', 'lech-bong-mo'] },
        { moTa: 'Quên nhặt thùng: thùng vẫn chắn ngay trước mặt, face_open() quay mãi không thấy chỗ trống', baiLam: { chinh: ['go_wall()', 'face_open()', 'go_wall()', 'back()', 'drop()'] }, phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Dùng thêm turn_right(): hàm thứ sáu, vượt giới hạn 5 hàm', baiLam: { chinh: ['pick()', 'go_wall()', 'turn_right()', 'face_open()', 'go_wall()', 'back()', 'drop()'] }, phaiCoMa: ['qua-gioi-han-ham'] }
      ],
      goiY: ['Đoạn đầu đi thẳng tới tường, đoạn sau cũng vậy, chỗ nối là một lần rẽ.', 'Hết đường thì lùi một ô để thùng nằm ở ô sát tường.']
    }),

    /* ------------------------------------------------------------ hàng 3: biến thể */
    man({
      so: 7, ten: 'Mắt xe lắp ngược', hang: 'bien-the',
      daoChieu: ['cam'], canhBao: 'Cảm biến lắp ngược',
      hamCuaEmCan: ['move', 'pick', 'back', 'drop'],
      deBai: 'Cảm biến của xe bị lắp ngược: front_clear() báo True khi trước mặt bị chắn và False khi trống. Vẫn phải đưa thùng hàng tới ô cuối hành lang, sát tường, giống vật mờ.',
      san: SAN_7, batDau: BD_7, bongMo: BM_7,
      sao: { o: 23, nhip: 30 },
      loiGiai: { chinh: L_7.slice() },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: nhieu(['# cảm biến báo ngược nên có not'], L_7) } },
      congThucKhac: [
        { moTa: 'Quay đầu, đi một ô, quay đầu lại thay cho back() (đúng chỗ nhưng chậm hơn nên ít sao hơn)', baiLam: { chinh: ['while not front_clear():', '    move()', 'pick()', 'while not front_clear():', '    move()', 'u_turn()', 'move()', 'u_turn()', 'drop()'] } }
      ],
      loiSai: [
        { moTa: 'Dùng go_wall() cũ: cảm biến báo ngược nên xe đứng yên ở chỗ trống', baiLam: { chinh: ['go_wall()', 'pick()', 'go_wall()', 'back()', 'drop()'] }, phaiCoMa: ['lech-bong-mo', 'cam-bien-nguoc'] },
        { moTa: 'Viết vòng while nhưng quên chữ not: vòng không chạy lần nào', baiLam: { chinh: ['while front_clear():', '    move()', 'pick()', 'while front_clear():', '    move()', 'back()', 'drop()'] }, phaiCoMa: ['lech-bong-mo', 'cam-bien-nguoc'] },
        { moTa: 'Vòng while chỉ chờ, không tiến: điều kiện không bao giờ đổi', baiLam: { chinh: ['while not front_clear():', '    wait()'] }, phaiCoMa: ['vong-vo-han'] }
      ],
      goiY: ['Thử front_clear() trong sân thử của Xưởng hàm: nó báo True ở chỗ nào?', 'go_wall() cũ hỏi cảm biến theo cách cũ, nên em tự viết vòng while có chữ not.']
    }),

    man({
      so: 8, ten: 'Tay xe lắp ngược', hang: 'bien-the',
      daoChieu: ['tay'], canhBao: 'Dây tay đấu ngược',
      hamCuaEmCan: ['go_wall', 'fixed_pick', 'fixed_drop', 'move', 'turn_right', 'turn_left', 'u_turn'],
      deBai: 'Dây tay kẹp bị đấu ngược nên pick() và drop() chạy sai. Dùng fixed_pick() và fixed_drop() em đã chế để dời ba thùng sang bên phải rồi đưa xe về chỗ xuất phát, giống vật mờ và xe mờ.',
      san: SAN_8, batDau: BD_8, bongMo: BM_8,
      sao: { o: 31, nhip: 81 },
      loiGiai: { chinh: L_8.slice() },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: nhieu(['# tay đấu ngược nên dùng fixed_pick và fixed_drop'], L_8) } },
      congThucKhac: [
        { moTa: 'Quay đầu bằng hai lần quay phải (đúng chỗ nhưng chậm hơn một nhịp nên ít sao hơn)', baiLam: { chinh: nhieu(['go_wall()'], LAP(3, ['fixed_pick()', 'move()', 'turn_right()', 'fixed_drop()', 'turn_left()']), ['turn_right()', 'turn_right()', 'go_wall()']) } }
      ],
      loiSai: [
        { moTa: 'Dùng pick() và drop() cũ: tay đi ngược nên kẹp hụt', baiLam: { chinh: nhieu(['go_wall()'], LAP(3, ['pick()', 'move()', 'turn_right()', 'drop()', 'turn_left()']), ['u_turn()', 'go_wall()']) }, phaiCoMa: ['kep-hut', 'lech-bong-mo'] },
        { moTa: 'Chỉ dời hai thùng rồi về: thùng cuối còn nguyên chỗ cũ', baiLam: { chinh: nhieu(['go_wall()'], LAP(2, ['fixed_pick()', 'move()', 'turn_right()', 'fixed_drop()', 'turn_left()']), ['u_turn()', 'go_wall()']) }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Dời ba thùng nhưng quên đưa xe về chỗ xuất phát', baiLam: { chinh: nhieu(['go_wall()'], LAP(3, ['fixed_pick()', 'move()', 'turn_right()', 'fixed_drop()', 'turn_left()'])) }, phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Cách làm vẫn là nhặt, tiến, rẽ phải, đặt, quay lại, chỉ đổi hai lệnh tay thành hai lệnh sửa dây.', 'Nhặt xong một thùng thì thùng kế tiếp phải nằm ngay trước mặt.']
    }),

    man({
      so: 9, ten: 'Kẹt số lùi', hang: 'bien-the', hong: true,
      canhBao: 'Bánh phải kẹt số lùi',
      hamCuaEmCan: ['move', 'pick', 'drop', 'u_turn'],
      deBai: 'Bánh phải của xe kẹt số lùi nên back() không chạy được. Lấy thùng hàng ở cuối hành lang mang về chỗ xuất phát, xe quay mặt xuống và đặt thùng ngay trước mặt, giống xe mờ.',
      san: SAN_9, batDau: BD_9, bongMo: BM_9,
      sao: { o: 25, nhip: 27 },
      loiGiai: { chinh: L_9.slice() },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: nhieu(['# không lùi được nên quay đầu rồi đi lại'], L_9) } },
      congThucKhac: [
        { moTa: 'Quay đầu bằng hai lần turn_right(), không gọi u_turn() (đúng chỗ nhưng chậm hơn một nhịp nên ít sao hơn)', baiLam: { chinh: ['n = 0', 'while front_clear():', '    move()', '    n = n + 1', 'pick()', 'turn_right()', 'turn_right()', 'for i in range(n):', '    move()', 'drop()'] } }
      ],
      loiSai: [
        { moTa: 'Dùng fetch_back() cũ: hàm đó lùi bằng bánh phải đã hỏng', baiLam: { chinh: ['fetch_back()'] }, phaiCoMa: ['lenh-goc-hong'] },
        { moTa: 'Lùi bằng back(): bánh phải không chạy được số lùi', baiLam: { chinh: ['n = 0', 'while front_clear():', '    move()', '    n = n + 1', 'pick()', 'for i in range(n):', '    back()', 'drop()'] }, phaiCoMa: ['lenh-goc-hong'] },
        { moTa: 'Quên đếm: đi về một số ô cứng, hai sân còn lại xe dừng sai chỗ', baiLam: { chinh: ['while front_clear():', '    move()', 'pick()', 'u_turn()', 'move()', 'move()', 'drop()'] }, phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Không lùi được thì quay đầu rồi đi lại đúng số ô đã đi, biến n nhớ số ô đó.', 'Quay đầu u_turn() em đã chế vẫn chạy được ở xe này.']
    }),

    /* ------------------------------------------------------------ trùm */
    man({
      so: 10, ten: 'Ca làm ở kho', hang: 'trum',
      hamCuaEmCan: ['go_wall', 'pass_back', 'bounce', 'to_gap', 'turn_right', 'fetch_back'], gioiHanHam: 6,
      huyHieu: { ma: 'robot-hoan-thien', ten: 'Huy hiệu Robot hoàn thiện' },
      deBai: 'Một thùng hàng chắn hành lang kho, thùng kia nằm cuối một nhánh bên phải. Dọn thùng chắn lối ra sau lưng xe, đi tới ◆ ở đầu hành lang rồi về, rồi lấy thùng ở nhánh đặt ngay trước cửa nhánh, giống vật mờ. Chương trình chỉ được gọi 6 hàm của em khác nhau.',
      san: SAN_10, batDau: BD_10, bongMo: BM_10,
      sao: { o: 49, nhip: 83 },
      loiGiai: { chinh: L_10.slice() },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: nhieu(['# dọn lối, đi kiểm tra, lấy hàng ở nhánh'], L_10) } },
      congThucKhac: [
        { moTa: 'Rẽ phải bằng lệnh bánh viết thẳng, chỉ còn 5 hàm của em', baiLam: { chinh: ['go_wall()', 'pass_back()', 'bounce()', 'to_gap()'].concat(W_RIGHT, ['fetch_back()']) } }
      ],
      loiSai: [
        { moTa: 'Bỏ qua bounce(): xe làm đúng mọi việc khác nhưng chưa tới ◆ ở đầu hành lang', baiLam: { chinh: ['go_wall()', 'pass_back()', 'to_gap()', 'turn_right()', 'fetch_back()'] }, phaiCoMa: ['chua-qua-diem'] },
        { moTa: 'Quên dọn thùng chắn lối: to_gap() cứ húc vào thùng, vòng while chạy mãi', baiLam: { chinh: ['go_wall()', 'bounce()', 'to_gap()', 'turn_right()', 'fetch_back()'] }, phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Dùng thêm turn_left(): hàm thứ bảy, vượt giới hạn 6 hàm', baiLam: { chinh: ['go_wall()', 'pass_back()', 'bounce()', 'to_gap()', 'turn_right()', 'fetch_back()', 'turn_left()'] }, phaiCoMa: ['qua-gioi-han-ham'] },
        { moTa: 'Quên rẽ phải vào nhánh: fetch_back() chạy dọc hành lang', baiLam: { chinh: ['go_wall()', 'pass_back()', 'bounce()', 'to_gap()', 'fetch_back()'] }, phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Mỗi việc em đã có một lệnh: dọn lối, đi kiểm tra, tìm cửa nhánh, lấy hàng.', 'Dọn thùng chắn lối xong rồi mới đi kiểm tra được, không thì xe bị chặn.']
    })
  ];

  ManHoc.them(DS);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();
