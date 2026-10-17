/* ============================================================================
   man-che-mau.js — "Đường học": CHƯƠNG `che-mau` · CHẾ LỆNH MÀU (10 màn). Kế hoạch "Chế lệnh" (KE-HOACH-CHE-LENH.md, mục 5c.4, 15/10 tối): chương chế lệnh đi sau chương `mau`.
   Robot là XE HAI BÁNH gắn CẢM BIẾN MÀU Ở BỤNG (đọc màu SÀN ô xe đang đứng; xe vẫn đọc được lúc đang mang vật):
   robot { than: 'hai-banh', tay: null | 'kep', camBien: [{ ma: 'mau', o: 'hong' }] }. Hai ngoại lệ:
     · màn 6 gắn CAMERA thay cho cảm biến bụng (camBien [{ ma: 'camera', o: 'tren' }]): color() đọc Ô TRƯỚC MẶT (có vật thì màu vật, không thì màu sàn);
     · màn 9 là màn HỎNG: cảm biến màu hỏng (phanCung và hamGoc không có color), xe chỉ còn cảm biến khoảng cách (camBien [mau, khoang-cach], canhBao 'Cảm biến màu hỏng').
   Luật màu (san-hoc.js, phần CẢM BIẾN MÀU / CAMERA): ô sàn màu ký hiệu r g b y trong sân (đi lại như sàn thường); vật có màu khai bằng lớp `vatMau`; color() trả chuỗi chữ thường
   "red" "green" "blue" "yellow" "none"; đọc không tốn nhịp. Vật mờ có màu: bongMo.vat = [{ x, y, mau }].
   Luật thiết kế như che-xe, che-tay, che-lap, che-cam-bien: lệnh gốc chỉ đổi MỘT trạng thái; lệnh biết nhìn màu và biết theo vạch là thứ NGƯỜI CHƠI TỰ CHẾ.
   Mỗi lệnh chế được ít nhất hai cách và cả hai đều thắng: `congThucKhac: [{ moTa, hamCuaEmMoi }]` (hay `baiLam` cho hàm của màn); máy kiểm: kiem-che-mau.mjs.

   Màn chế lệnh dùng BA SÂN (man.san là MẢNG 3 sân, batDau và bongMo song song, nhipTheo 'tong'): chương trình viết cứng số bước chỉ đúng một sân.
   Chương trình chính cố định (chinhCoDinh) ở mọi màn trừ 3 (Đường ba đoạn) và 10 (Kho màu, trùm): người chơi tự viết chương trình chính ở hai màn đó.
   Mục tiêu 'bong-mo' (xe mờ) ở 1, 2, 4, 5, 6, 7, 10; tới cờ ở 3, 8, 9. Sân tối đa 7×9. Hướng: 0 lên, 1 phải, 2 xuống, 3 trái. (x, y) với y = 0 ở hàng trên.
   Sao: sao.nhip = TỔNG nhịp ba sân; = đường ngắn nhất của bộ dò do-duong-che-mau.mjs ở 1, 2, 3, 5, 7, 8, 9; nhipTheoLoiGiai ở 4 (xe không nhìn trước được vạch đỏ: phải đứng lên vạch rồi mới
   lùi lại, nên chương trình đúng luôn dài hơn đường ngắn nhất của người biết sân), 6 và 10 (pick() / drop() mất 2 nhịp, bộ dò gộp nâng tay vào nhịp kế).
   KHÔNG dùng hàm có tham số chuỗi màu (kiểu stop_on(c) với c là "red"): khay chỉ có bộ chọn chữ U D L R cho đối số chuỗi của lời gọi hàm (thanh-phan.js, chonChuoi), chưa có bộ chọn
   màu cho đối số, nên người chơi không gõ được stop_on("red"). Mỗi màu có lệnh riêng (to_red…) hay đặt màu vào thân hàm.

   Hàm của em MỚI (tên cốt truyện, khóa trong kho; mô tả ở so-lenh.js, nhóm 'mau'):
     che-mau.1 to_red()      = while color() != "red": move()                       đi thẳng cho tới khi xe ĐỨNG TRÊN ô đỏ
     che-mau.2 cross()       = c = color(), while color() == c: move()              đi thẳng qua hết dải ô cùng màu với ô đang đứng; dừng ở ô đầu tiên sau dải
     che-mau.4 stop_line()   = to_red(), back()                                      dừng SÁT TRƯỚC vạch đỏ (cảm biến bụng chỉ biết ô đang đứng, nên phải lên vạch rồi lùi lại một ô)
     che-mau.5 follow_line() = while color() != "yellow": read_turn(), move()        đi theo vạch kẻ (đỏ rẽ phải, xanh dương rẽ trái) cho tới khi xe đứng trên ô vàng
     che-mau.6 sort_color()  = c = color(), pick(), (đỏ: turn_right, drop, turn_left · khác: turn_left, drop, turn_right)   camera: vật đỏ chuyền sang phải, vật xanh dương sang trái (đúng 10 dòng)
   HÀM CỦA MÀN (15/10: hàm chỉ đúng cho MỘT màn thì không vào kho, người chơi tự viết / sửa thân trong màn; `maMau.hamCuaMan`, không `taoHam`, không có trong Sổ lệnh):
     che-mau.7 go_out() = while color() != "yellow": read_turn(), move()  (khóa, xem được); come_back() thân ban đầu `pass`; lời giải while color() != "green": (đỏ: turn_left · xanh dương: turn_right), back()
               = đi NGƯỢC lại go_out(): mỗi lệnh thành lệnh ngược (move ↔ back, turn_right ↔ turn_left); xe lùi trên đường cũ nên về ô xanh lá vẫn đúng hướng xuất phát
     che-mau.8 line_step() thân ban đầu so "green" thay cho "blue" (nhìn nhầm màu); lời giải sửa thành "blue"
     che-mau.9 trace() thân ban đầu `follow_line()` (cần color(): cảm biến màu hỏng → lenh-goc-hong); lời giải for i in range(40): follow_right() (bám tường bằng cảm biến khoảng cách)

   Nối tiếp man-mau.js vào cùng window.ManHoc. Thứ tự chương: thu-tu-chuong.js.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-mau.js') : window.ManHoc;

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var TAY = ['arm_down', 'arm_up', 'grab', 'release'];
  var KHOANG_CACH = ['front_clear', 'left_clear', 'right_clear'];

  function H(ten, than) { return { ten: ten, thamSo: [], than: than.slice() }; }
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  /** Vòng for lặp các lệnh `lenh` (chuỗi hoặc mảng) `n` lần. */
  function LAP(n, lenh) {
    var ds = Array.isArray(lenh) ? lenh : [lenh];
    return ['for i in range(' + n + '):'].concat(ds.map(function (s) { return '    ' + s; }));
  }
  function thut(ds) { return ds.map(function (s) { return '    ' + s; }); }

  // thân các hàm chế (cách 1, cách người chơi thường chọn)
  var T_TO_RED = ['while color() != "red":', '    move()'];
  var T_CROSS = ['c = color()', 'while color() == c:', '    move()'];
  var T_STOP_LINE = ['to_red()', 'back()'];
  var T_FOLLOW_LINE = ['while color() != "yellow":', '    read_turn()', '    move()'];
  var T_SORT_COLOR = ['c = color()', 'pick()', 'if c == "red":', '    turn_right()', '    drop()', '    turn_left()', 'else:', '    turn_left()', '    drop()', '    turn_right()'];
  // 7: go_out() của màn (khóa) và come_back() (thân ban đầu: pass)
  var T_GO_OUT = T_FOLLOW_LINE;
  var T_COME_BACK_TRONG = ['pass'];
  var T_COME_BACK = ['while color() != "green":', '    if color() == "red":', '        turn_left()', '    elif color() == "blue":', '        turn_right()', '    back()'];
  // 8: line_step() nhìn nhầm màu (so "green" thay cho "blue") và bản sửa
  var T_LINE_STEP_HONG = ['if color() == "red":', '    turn_right()', 'elif color() == "green":', '    turn_left()', 'move()'];
  var T_LINE_STEP = ['if color() == "red":', '    turn_right()', 'elif color() == "blue":', '    turn_left()', 'move()'];
  // 9: trace() thân ban đầu (dùng follow_line() cần color()) và bản dùng cảm biến khoảng cách
  var T_TRACE_CU = ['follow_line()'];
  var T_TRACE = LAP(40, 'follow_right()');
  // thân lệnh bánh viết thẳng (không gọi hàm của em)
  var W_MOVE = ['left_move()', 'right_move()', 'wait()'];

  // chương trình chính của từng màn (cố định hay lời giải)
  var C_1 = ['to_red()'];
  var C_2 = ['cross()'];
  var L_3 = ['cross()', 'turn_right()', 'to_red()', 'turn_left()', 'move()', 'move()'];
  var C_4 = ['stop_line()'];
  var C_5 = ['follow_line()'];
  var C_6 = ['sort_color()'];
  var C_7 = ['go_out()', 'come_back()'];
  var C_8 = LAP(30, 'line_step()');
  var C_9 = ['trace()'];
  var L_10 = ['pick()', 'follow_line()', 'stop_line()', 'drop()'];

  /**
   * m.tay: true thì có tay kẹp (6, 10); m.camera: true thì gắn camera thay cho cảm biến bụng (6); m.kc: true thì thêm cảm biến khoảng cách (front_clear…);
   * m.hong: true thì cảm biến màu hỏng (9: hamGoc = phanCung, không có color, có cảm biến khoảng cách); m.coCo: true thì mục tiêu tới cờ (mặc định bóng mờ). Các trường này bị bỏ sau khi dùng.
   */
  function man(m) {
    var o = { tay: m.tay, camera: m.camera, kc: m.kc, hong: m.hong, coCo: m.coCo };
    delete m.tay; delete m.camera; delete m.kc; delete m.hong; delete m.coCo;
    m.chuong = 'che-mau';
    m.cauTruc = ['for', 'if', 'while'];
    m.loaiRobot = 'banh';
    var cam = [o.camera ? { ma: 'camera', o: 'tren' } : { ma: 'mau', o: 'hong' }];
    if (o.kc || o.hong) cam.push({ ma: 'khoang-cach', o: 'hong' });
    m.robot = { than: 'hai-banh', tay: o.tay ? 'kep' : null, camBien: cam };
    m.hamGoc = nhieu(BANH, o.tay ? TAY : [], o.hong ? [] : ['color'], o.kc || o.hong ? KHOANG_CACH : []);
    if (o.hong) { m.phanCung = m.hamGoc.slice(); m.canhBao = 'Cảm biến màu hỏng'; }
    if (!o.coCo) m.mucTieu = 'bong-mo';
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    m.nhipTheo = 'tong';
    if (!Array.isArray(m.batDau)) m.batDau = m.san.map(function () { return Object.assign({}, m.batDau); });
    return ManHoc.chuanHoa(m);
  }

  /* ------------------------------------------------------------------- sân (dựng từ đường đi, kiểm bằng tay và bằng bộ dò) */

  // 1: ba hành lang đứng 3×7, xe ở (1,6) quay lên; ô đỏ cách 2 / 4 / 5 ô, có ô màu khác làm nhiễu trên đường
  var SAN_1 = [
    ['#.#', '#.#', '#.#', '#.#', '#r#', '#.#', '#.#'],
    ['#.#', '#.#', '#r#', '#.#', '#.#', '#g#', '#.#'],
    ['#.#', '#r#', '#.#', '#b#', '#y#', '#.#', '#.#']
  ];
  var BD_DUNG = { x: 1, y: 6, huong: 0 };
  var BM_1 = [{ x: 1, y: 4, huong: 0 }, { x: 1, y: 2, huong: 0 }, { x: 1, y: 1, huong: 0 }];

  // 2: xe đứng trên đầu một dải ô cùng màu (xanh lá 3 ô, vàng 4 ô, xanh dương 5 ô); ô sau dải: không màu / đỏ / xanh lá
  var SAN_2 = [
    ['#.#', '#.#', '#.#', '#.#', '#g#', '#g#', '#g#'],
    ['#.#', '#.#', '#r#', '#y#', '#y#', '#y#', '#y#'],
    ['#.#', '#g#', '#b#', '#b#', '#b#', '#b#', '#b#']
  ];
  var BM_2 = [{ x: 1, y: 3, huong: 0 }, { x: 1, y: 2, huong: 0 }, { x: 1, y: 1, huong: 0 }];

  // 3: ba đường 7×7: dải ô cùng màu ở chân (hai / ba / bốn ô), hết dải thì rẽ phải, ô đỏ cách ô đầu sau dải 2 / 3 / 1 ô (có ô màu nhiễu ở giữa), rẽ trái đi hai ô tới cờ F
  var SAN_3 = [
    ['#######', '#######', '###F###', '###.###', '#.gr###', '#g#####', '#g#####'],
    ['#######', '####F##', '####.##', '#.ybr##', '#b#####', '#b#####', '#b#####'],
    ['##F####', '##.####', '#.r####', '#y#####', '#y#####', '#y#####', '#y#####']
  ];

  // 4: ba hành lang đứng 3×7; vạch đỏ ở y = 3 / 1 / 2 (sân giữa có hai vạch đỏ liền nhau, xe dừng trước vạch đầu); xe dừng sát trước vạch
  var SAN_4 = [
    ['#.#', '#.#', '#.#', '#r#', '#.#', '#g#', '#.#'],
    ['#r#', '#r#', '#.#', '#y#', '#b#', '#.#', '#.#'],
    ['#.#', '#.#', '#r#', '#.#', '#g#', '#.#', '#.#']
  ];
  var BM_4 = [{ x: 1, y: 4, huong: 0 }, { x: 1, y: 2, huong: 0 }, { x: 1, y: 3, huong: 0 }];

  // 5: ba vạch kẻ 7×7, hành lang một lối (ô màu chỉ là tín hiệu): đỏ rẽ phải, xanh dương rẽ trái, ô vàng ở cuối vạch
  var SAN_5 = [
    ['#######', '####y##', '####.##', '#r..b##', '#.#####', '#.#####', '#######'],
    ['#######', '##y####', '##.####', '##r..b#', '#####.#', '#####.#', '#######'],
    ['#######', '####y##', '##r.b##', '#rb####', '#.#####', '#.#####', '#######']
  ];
  var BD_5 = [{ x: 1, y: 5, huong: 0 }, { x: 5, y: 5, huong: 0 }, { x: 1, y: 5, huong: 0 }];
  var BM_5 = [{ x: 4, y: 1, huong: 0 }, { x: 2, y: 1, huong: 0 }, { x: 4, y: 1, huong: 0 }];

  // 6: ba sân thoáng 5×5, xe (2,3) quay lên (camera), vật ở ô trước mặt (2,2): vật đỏ, xanh dương, đỏ
  var SAN_6 = [
    ['.....', '.....', '..o..', '.....', '.....'],
    ['.....', '.....', '..o..', '.....', '.....'],
    ['.....', '.....', '..o..', '.....', '.....']
  ];
  var VAT_MAU_6 = [
    ['.....', '.....', '..r..', '.....', '.....'],
    ['.....', '.....', '..b..', '.....', '.....'],
    ['.....', '.....', '..r..', '.....', '.....']
  ];
  var BD_6 = { x: 2, y: 3, huong: 0 };
  var BM_6 = [
    { x: 2, y: 3, huong: 0, vat: [{ x: 3, y: 3, mau: 'red' }] },
    { x: 2, y: 3, huong: 0, vat: [{ x: 1, y: 3, mau: 'blue' }] },
    { x: 2, y: 3, huong: 0, vat: [{ x: 3, y: 3, mau: 'red' }] }
  ];

  // 7: ba vạch kẻ 7×8 từ ô xanh lá (chỗ xe xuất phát) tới ô vàng; ◆ ở ô vàng
  var SAN_7 = [
    ['#######', '####y##', '####.##', '#r..b##', '#.#####', '#.#####', '#g#####', '#######'],
    ['#######', '##y####', '##.####', '##.####', '##r..b#', '#####.#', '#####g#', '#######'],
    ['#######', '#####y#', '###r.b#', '###.###', '#r.b###', '#.#####', '#g#####', '#######']
  ];
  var BD_7 = [{ x: 1, y: 6, huong: 0 }, { x: 5, y: 6, huong: 0 }, { x: 1, y: 6, huong: 0 }];
  var BM_7 = [
    { x: 1, y: 6, huong: 0, diQua: [{ x: 4, y: 1 }] },
    { x: 5, y: 6, huong: 0, diQua: [{ x: 2, y: 1 }] },
    { x: 1, y: 6, huong: 0, diQua: [{ x: 5, y: 1 }] }
  ];

  // 8: ba vạch kẻ 7×7 tới cờ F; sân 1 chỉ có ô đỏ và xanh dương, sân 2 và 3 có thêm ô xanh lá nhiễu trên đoạn thẳng (hàm nhìn nhầm xanh lá thành xanh dương sẽ rẽ trái nhầm ở đó)
  var SAN_8 = [
    ['#######', '###F###', '###.###', '#r.b###', '#.#####', '#.#####', '#######'],
    ['#######', '###F###', '###.###', '###rgb#', '#####g#', '#####.#', '#######'],
    ['#######', '####F##', '####.##', '#rg.b##', '#g#####', '#.#####', '#######']
  ];
  var BD_8 = [{ x: 1, y: 5, huong: 0 }, { x: 5, y: 5, huong: 0 }, { x: 1, y: 5, huong: 0 }];

  // 9: ba hành lang một lối 7×7 tới cờ F, có ô màu (cảm biến màu hỏng nên vô dụng): xe bám tường bằng cảm biến khoảng cách
  var SAN_9 = [
    ['#######', '#####F#', '#####.#', '###r.b#', '###.###', '###.###', '#######'],
    ['#######', '##F####', '##.####', '##r..b#', '#####.#', '#####.#', '#######'],
    ['#######', '###r.F#', '###.###', '#r.b###', '#.#####', '#.#####', '#######']
  ];
  var BD_9 = [{ x: 3, y: 5, huong: 0 }, { x: 5, y: 5, huong: 0 }, { x: 1, y: 5, huong: 0 }];

  // 10: ba kho 7×9: hàng 'o' ngay trước mặt xe ở chân vạch kẻ; vạch kẻ tới ô vàng, đi thẳng tiếp tới vạch đỏ (cách ô vàng 2 / 3 / 1 ô); đặt hàng lên vạch đỏ, xe dừng sát trước vạch
  var SAN_10 = [
    ['#######', '####r##', '####.##', '####y##', '####.##', '#r..b##', '#o#####', '#.#####', '#######'],
    ['#######', '##r####', '##.####', '##.####', '##y####', '##r..b#', '#####o#', '#####.#', '#######'],
    ['#######', '###r###', '###y###', '###r.b#', '#####.#', '###r.b#', '###o###', '###.###', '#######']
  ];
  var BD_10 = [{ x: 1, y: 7, huong: 0 }, { x: 5, y: 7, huong: 0 }, { x: 3, y: 7, huong: 0 }];
  var BM_10 = [
    { x: 4, y: 2, huong: 0, vat: [{ x: 4, y: 1 }] },
    { x: 2, y: 2, huong: 0, vat: [{ x: 2, y: 1 }] },
    { x: 3, y: 2, huong: 0, vat: [{ x: 3, y: 1 }] }
  ];

  var DS = [
    /* ------------------------------------------------------------ hàng 1: làm quen */
    man({
      so: 1, ten: 'Dừng ở ô đỏ', hang: 'lam-quen', taoHam: ['to_red'],
      hamCuaEmCan: ['move'],
      deBai: 'Cảm biến màu ở bụng xe cho biết màu của ô xe đang đứng. Chế lệnh to_red(): xe đi thẳng cho tới khi đứng trên ô đỏ. Ô đỏ ở ba sân xa gần khác nhau, xe phải dừng đúng chỗ bóng mờ.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi to_red(). Mở Xưởng hàm, tạo to_red() rồi bấm Chạy.',
      san: SAN_1, batDau: BD_DUNG, bongMo: BM_1,
      chinhCoDinh: true,
      maMau: { chinh: C_1.slice() },
      sao: { o: 6, nhip: 11 },
      loiGiai: { chinh: C_1.slice(), hamCuaEmMoi: [H('to_red', T_TO_RED)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_1.slice() },
        hamCuaEmMoi: [H('to_red', nhieu(['# đi tới ô đỏ'], T_TO_RED))]
      },
      congThucKhac: [
        { moTa: 'Viết thẳng lệnh bánh trong vòng while, không gọi move()', hamCuaEmMoi: [H('to_red', nhieu(['while color() != "red":'], thut(W_MOVE)))] },
        { moTa: 'Ghi màu vào biến rồi đọc lại sau mỗi bước', hamCuaEmMoi: [H('to_red', ['c = color()', 'while c != "red":', '    move()', '    c = color()'])] },
        { moTa: 'Vòng for chứa if: lặp tối đa 6 lần, chưa đứng trên ô đỏ thì tiến', hamCuaEmMoi: [H('to_red', LAP(6, ['if color() != "red":', '    move()']))] }
      ],
      loiSai: [
        { moTa: 'Đếm cứng hai ô theo sân đầu: hai sân sau xe dừng quá sớm', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [H('to_red', ['move()', 'move()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đảo so sánh thành == : ô đầu không đỏ nên vòng không chạy lần nào', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [H('to_red', ['while color() == "red":', '    move()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Thân vòng chỉ chờ, không tiến: điều kiện không bao giờ đổi', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [H('to_red', ['while color() != "red":', '    wait()'])], phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Viết hoa chữ đầu "Red": không màu nào khớp nên xe đi quá ô đỏ', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [H('to_red', ['while color() != "Red":', '    move()'])], phaiCoMa: ['ten-mau-sai'] },
        { moTa: 'Quên dấu nháy quanh tên màu: Python tưởng red là một biến', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [H('to_red', ['while color() != red:', '    move()'])], phaiCoMa: ['mau-thieu-nhay'] },
        { moTa: 'Gọi to_red() mà chưa chế hàm', baiLam: { chinh: C_1.slice() }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Vòng while lặp chừng nào điều kiện còn đúng: ở đây là color() còn khác "red".', 'Ô nào không màu thì color() trả về "none". Xe dừng ngay khi đứng trên ô đỏ.']
    }),

    man({
      so: 2, ten: 'Qua dải màu', hang: 'lam-quen', taoHam: ['cross'],
      hamCuaEmCan: ['move'],
      deBai: 'Xe đứng trên đầu một dải ô cùng màu, mỗi sân dải dài ngắn và màu khác nhau. Chế lệnh cross(): xe đi thẳng cho tới khi ra khỏi dải, tức là màu dưới xe khác màu lúc đầu. Xe dừng ở ô đầu tiên sau dải, như bóng mờ.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi cross(). Mở Xưởng hàm, tạo cross() rồi bấm Chạy.',
      san: SAN_2, batDau: BD_DUNG, bongMo: BM_2,
      chinhCoDinh: true,
      maMau: { chinh: C_2.slice() },
      sao: { o: 7, nhip: 12 },
      loiGiai: { chinh: C_2.slice(), hamCuaEmMoi: [H('cross', T_CROSS)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_2.slice() },
        hamCuaEmMoi: [H('cross', nhieu(['# ghi nhớ màu của dải'], T_CROSS))]
      },
      congThucKhac: [
        { moTa: 'Viết thẳng lệnh bánh trong vòng while, không gọi move()', hamCuaEmMoi: [H('cross', nhieu(['c = color()', 'while color() == c:'], thut(W_MOVE)))] },
        { moTa: 'Vòng for chứa if: lặp tối đa 6 lần, còn đứng trên màu cũ thì tiến', hamCuaEmMoi: [H('cross', nhieu(['c = color()'], LAP(6, ['if color() == c:', '    move()'])))] }
      ],
      loiSai: [
        { moTa: 'Viết cứng "green" theo sân đầu: hai sân sau là dải màu khác nên xe không đi', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [H('cross', ['while color() == "green":', '    move()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đi tới khi hết màu ("none"): sân giữa và sân cuối có ô màu ngay sau dải nên xe đi quá', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [H('cross', ['while color() != "none":', '    move()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đảo so sánh thành != : đang đứng trên dải nên vòng không chạy lần nào', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [H('cross', ['c = color()', 'while color() != c:', '    move()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Thân vòng chỉ chờ, không tiến: màu dưới xe không bao giờ đổi', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [H('cross', ['c = color()', 'while color() == c:', '    wait()'])], phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Gọi cross() mà chưa chế hàm', baiLam: { chinh: C_2.slice() }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Dải mỗi sân một màu, nên đừng viết tên màu vào hàm: đọc màu lúc đầu rồi ghi vào một biến, ví dụ c = color().', 'Rồi đi tiếp chừng nào color() còn bằng c.']
    }),

    man({
      so: 3, ten: 'Đường ba đoạn', hang: 'lam-quen', coCo: true,
      hamCuaEmCan: ['cross', 'to_red', 'turn_right', 'turn_left', 'move'],
      deBai: 'Mỗi sân có một dải ô cùng màu ở chân đường. Hết dải thì rẽ phải, đi tới ô đỏ, rồi rẽ trái và đi hai ô tới cờ. Dùng cross() và to_red() em đã chế để tới cờ ở cả ba sân; chương trình chỉ có 10 ô.',
      san: SAN_3, batDau: BD_DUNG,
      maMau: { chinh: [] },
      sao: { o: 18, nhip: 27 },
      loiGiai: { chinh: L_3.slice() },
      loiGiaiKhac: {
        moTa: 'Cùng đường đi, thêm một dòng chú thích',
        baiLam: { chinh: nhieu(['# hết dải thì rẽ phải, tới ô đỏ thì rẽ trái'], L_3) }
      },
      congThucKhac: [
        { moTa: 'Hai ô cuối đi bằng vòng for thay cho hai lệnh move()', baiLam: { chinh: ['cross()', 'turn_right()', 'to_red()', 'turn_left()'].concat(LAP(2, 'move()')) } },
        { moTa: 'Rẽ trái bằng ba lần rẽ phải (chậm hơn hai nhịp mỗi sân)', baiLam: { chinh: ['cross()', 'turn_right()', 'to_red()', 'turn_right()', 'turn_right()', 'turn_right()', 'move()', 'move()'] } }
      ],
      loiSai: [
        { moTa: 'Quên cross(): xe rẽ phải ngay ở chân dải, trước mặt là tường nên to_red() chạy mãi', baiLam: { chinh: ['turn_right()', 'to_red()', 'turn_left()', 'move()', 'move()'] }, phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Quên to_red(): xe rẽ trái ngay ở ô sau dải rồi đâm tường', baiLam: { chinh: ['cross()', 'turn_right()', 'turn_left()', 'move()', 'move()'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Quên rẽ phải ở ô sau dải: to_red() đi thẳng vào tường mãi', baiLam: { chinh: ['cross()', 'to_red()', 'turn_left()', 'move()', 'move()'] }, phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Quên rẽ trái ở ô đỏ: xe húc tường ở cuối đường ngang', baiLam: { chinh: ['cross()', 'turn_right()', 'to_red()', 'move()', 'move()'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Rẽ trái xong chỉ đi một ô: cờ cách ô đỏ hai ô', baiLam: { chinh: ['cross()', 'turn_right()', 'to_red()', 'turn_left()', 'move()'] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Viết từng bước, không dùng lệnh đã chế: quá 10 ô', baiLam: { chinh: Array(11).fill('move()') }, phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['Có ba đoạn: ra khỏi dải rồi rẽ phải, tới ô đỏ, rẽ trái đi tới cờ.', 'Dải mỗi sân một độ dài, nên đừng đếm ô: hai lệnh em đã chế lo việc đó.']
    }),

    /* ------------------------------------------------------------ hàng 2: luyện */
    man({
      so: 4, ten: 'Dừng sát vạch', hang: 'luyen', nhipTheoLoiGiai: true, taoHam: ['stop_line'],
      hamCuaEmCan: ['to_red', 'back'],
      deBai: 'Cảm biến ở bụng xe chỉ biết màu ô xe đang đứng, nên xe không nhìn trước được vạch đỏ. Chế lệnh stop_line(): xe dừng ngay trước vạch đỏ, không đè lên vạch. Vạch ở xa gần khác nhau, xe phải dừng đúng chỗ bóng mờ.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi stop_line(). Mở Xưởng hàm, tạo stop_line() rồi bấm Chạy.',
      san: SAN_4, batDau: BD_DUNG, bongMo: BM_4,
      chinhCoDinh: true,
      maMau: { chinh: C_4.slice() },
      sao: { o: 11, nhip: 15 },
      loiGiai: { chinh: C_4.slice(), hamCuaEmMoi: [H('stop_line', T_STOP_LINE)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_4.slice() },
        hamCuaEmMoi: [H('stop_line', nhieu(['# lên vạch rồi lùi lại'], T_STOP_LINE))]
      },
      congThucKhac: [
        { moTa: 'Viết thẳng vòng while rồi lùi, không gọi to_red()', hamCuaEmMoi: [H('stop_line', ['while color() != "red":', '    move()', 'back()'])] },
        { moTa: 'Quay đầu, lùi một ô bằng tiến, quay đầu lại (chậm hơn nhưng vẫn đúng)', hamCuaEmMoi: [H('stop_line', ['to_red()', 'u_turn()', 'move()', 'u_turn()'])] }
      ],
      loiSai: [
        { moTa: 'Chỉ tới ô đỏ, không lùi: xe đè lên vạch', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [H('stop_line', ['to_red()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Lùi trước rồi mới tới ô đỏ: back() chạy ngay từ chỗ xuất phát, xe ra ngoài sân', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [H('stop_line', ['back()', 'to_red()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Lùi hai ô thay vì một: xe dừng cách vạch hai ô', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [H('stop_line', ['to_red()', 'back()', 'back()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đếm cứng hai ô theo sân đầu: hai sân sau xe dừng quá sớm', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [H('stop_line', ['move()', 'move()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Gọi stop_line() mà chưa chế hàm', baiLam: { chinh: C_4.slice() }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Cảm biến chỉ cho biết màu ô xe đang đứng, nên muốn biết đâu là vạch thì xe phải đứng lên nó.', 'Biết rồi thì lùi lại một ô. Em đã có to_red() và back().']
    }),

    man({
      so: 5, ten: 'Theo vạch kẻ', hang: 'luyen', taoHam: ['follow_line'],
      hamCuaEmCan: ['read_turn', 'move'],
      deBai: 'Mỗi sân có một vạch kẻ: ô đỏ rẽ phải, ô xanh dương rẽ trái, và vạch kết thúc ở ô vàng. Chế lệnh follow_line(): xe đi theo vạch cho tới khi đứng trên ô vàng, như bóng mờ. Ba sân có ba đường khác nhau.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi follow_line(). Mở Xưởng hàm, tạo follow_line() rồi bấm Chạy.',
      san: SAN_5, batDau: BD_5, bongMo: BM_5,
      chinhCoDinh: true,
      maMau: { chinh: C_5.slice() },
      sao: { o: 15, nhip: 29 },
      loiGiai: { chinh: C_5.slice(), hamCuaEmMoi: [H('follow_line', T_FOLLOW_LINE)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_5.slice() },
        hamCuaEmMoi: [H('follow_line', nhieu(['# theo vạch tới ô vàng'], T_FOLLOW_LINE))]
      },
      congThucKhac: [
        { moTa: 'Không dùng read_turn(): hỏi màu ngay trong vòng while', hamCuaEmMoi: [H('follow_line', ['while color() != "yellow":', '    if color() == "red":', '        turn_right()', '    elif color() == "blue":', '        turn_left()', '    move()'])] },
        { moTa: 'Vòng for chứa if: lặp tối đa 20 lần, chưa đứng trên ô vàng thì rẽ nếu cần rồi tiến', hamCuaEmMoi: [H('follow_line', LAP(20, ['if color() != "yellow":', '    read_turn()', '    move()']))] }
      ],
      loiSai: [
        { moTa: 'Quên move() trong vòng: xe rẽ rồi đứng tại chỗ mãi', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [H('follow_line', ['while color() != "yellow":', '    read_turn()'])], phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Quên read_turn(): xe đi thẳng húc tường ở khúc quẹo đầu tiên', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [H('follow_line', ['while color() != "yellow":', '    move()'])], phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Chỉ rẽ ở ô đỏ, quên ô xanh dương: xe húc tường ở khúc rẽ trái', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [H('follow_line', ['while color() != "yellow":', '    if color() == "red":', '        turn_right()', '    move()'])], phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Viết hoa "Yellow": không màu nào khớp nên xe không dừng ở ô vàng', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [H('follow_line', ['while color() != "Yellow":', '    read_turn()', '    move()'])], phaiCoMa: ['ten-mau-sai'] },
        { moTa: 'Đảo so sánh thành == : ô đầu không vàng nên vòng không chạy lần nào', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [H('follow_line', ['while color() == "yellow":', '    read_turn()', '    move()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Gọi follow_line() mà chưa chế hàm', baiLam: { chinh: C_5.slice() }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Em đã có read_turn(): nó rẽ đúng ở ô đỏ và ô xanh dương. Việc còn lại là đi tiếp và biết lúc nào dừng.', 'Đi theo vạch chừng nào xe chưa đứng trên ô vàng.']
    }),

    man({
      so: 6, ten: 'Phân loại theo màu', hang: 'luyen', nhipTheoLoiGiai: true, tay: true, camera: true, taoHam: ['sort_color'],
      hamCuaEmCan: ['pick', 'drop', 'turn_right', 'turn_left'],
      deBai: 'Xe màn này gắn camera: color() cho biết màu của thứ ở ô trước mặt xe. Chế lệnh sort_color(): vật đỏ chuyền sang ô bên phải xe, vật xanh dương sang ô bên trái, xe giữ chỗ và hướng. Vật mờ cho biết chỗ đặt.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi sort_color(). Mở Xưởng hàm, tạo sort_color() rồi bấm Chạy. Chạm ảnh nhỏ để xem từng sân.',
      san: SAN_6, vatMau: VAT_MAU_6, batDau: BD_6, bongMo: BM_6,
      chinhCoDinh: true,
      maMau: { chinh: C_6.slice() },
      sao: { o: 25, nhip: 18 },
      loiGiai: { chinh: C_6.slice(), hamCuaEmMoi: [H('sort_color', T_SORT_COLOR)] },
      loiGiaiKhac: {
        moTa: 'Vật đỏ dùng put_right() đã chế ở chương Chế lệnh tay (nhiều ô hơn, cùng nhịp)',
        baiLam: { chinh: C_6.slice() },
        hamCuaEmMoi: [H('sort_color', ['c = color()', 'if c == "red":', '    put_right()', 'else:', '    pick()', '    turn_left()', '    drop()', '    turn_right()'])]
      },
      congThucKhac: [
        { moTa: 'Nhìn màu ngay trong điều kiện, nhặt và đặt ở cả hai nhánh', hamCuaEmMoi: [H('sort_color', ['if color() == "red":', '    pick()', '    turn_right()', '    drop()', '    turn_left()', 'else:', '    pick()', '    turn_left()', '    drop()', '    turn_right()'])] }
      ],
      loiSai: [
        { moTa: 'Luôn chuyền sang phải: vật xanh dương nằm sai bên', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [H('sort_color', ['pick()', 'turn_right()', 'drop()', 'turn_left()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Nhìn màu SAU khi nhặt: ô trước mặt đã trống, camera chỉ thấy sàn không màu nên chạy nhánh else cho cả vật đỏ', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [H('sort_color', ['pick()', 'c = color()', 'if c == "red":', '    turn_right()', '    drop()', '    turn_left()', 'else:', '    turn_left()', '    drop()', '    turn_right()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Chuyền xong không quay về: xe quay mặt sang bên', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [H('sort_color', ['c = color()', 'pick()', 'if c == "red":', '    turn_right()', '    drop()', 'else:', '    turn_left()', '    drop()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Viết hoa "Red": vật đỏ không khớp nên luôn rẽ trái', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [H('sort_color', ['c = color()', 'pick()', 'if c == "Red":', '    turn_right()', '    drop()', '    turn_left()', 'else:', '    turn_left()', '    drop()', '    turn_right()'])], phaiCoMa: ['ten-mau-sai', 'lech-bong-mo'] },
        { moTa: 'Gọi sort_color() mà chưa chế hàm', baiLam: { chinh: C_6.slice() }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Camera nhìn ô ngay trước mặt. Nhặt vật xong thì ô đó trống, nên màu vật phải được ghi vào một biến TRƯỚC khi nhặt.', 'Vật đỏ đặt sang phải, còn lại sang trái. Đặt xong thì quay xe về như cũ.']
    }),

    /* ------------------------------------------------------------ hàng 3: biến thể */
    man({
      so: 7, ten: 'Đường về', hang: 'bien-the',
      hamCuaEmCan: ['read_turn', 'move', 'back', 'turn_left', 'turn_right'],
      deBai: 'Hàm go_out() của màn đưa xe đi theo vạch kẻ từ ô xanh lá tới ô vàng. Viết thân hàm come_back() của màn để xe về lại ô xanh lá, mặt quay như lúc xuất phát. Điểm ◆ là ô vàng, xe phải ghé.',
      veMaMau: 'Chương trình chính bị khóa: go_out() rồi come_back(). Hàm go_out() cũng bị khóa, em chỉ xem được thân hàm. Thân hàm come_back() đang chỉ có dòng pass, nghĩa là chưa làm gì: em viết lệnh thay cho nó.',
      san: SAN_7, batDau: BD_7, bongMo: BM_7,
      chinhCoDinh: true, khoaHamMan: ['go_out'],
      maMau: { chinh: C_7.slice(), hamCuaMan: [H('go_out', T_GO_OUT), H('come_back', T_COME_BACK_TRONG)] },
      sao: { o: 25, nhip: 66 },
      loiGiai: { chinh: C_7.slice(), hamCuaMan: [H('go_out', T_GO_OUT), H('come_back', T_COME_BACK)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách viết, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_7.slice(), hamCuaMan: [H('go_out', T_GO_OUT), H('come_back', nhieu(['# làm ngược lại go_out()'], T_COME_BACK))] }
      },
      congThucKhac: [
        { moTa: 'Quay đầu, đi lại bằng move() với luật rẽ đảo chiều, rồi quay đầu lần nữa (chậm hơn hai nhịp mỗi lần quay đầu)', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('go_out', T_GO_OUT), H('come_back', ['u_turn()', 'while color() != "green":', '    if color() == "red":', '        turn_left()', '    elif color() == "blue":', '        turn_right()', '    move()', 'u_turn()'])] } },
        { moTa: 'Đảo thứ tự hỏi: xanh dương trước, đỏ sau', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('go_out', T_GO_OUT), H('come_back', ['while color() != "green":', '    if color() == "blue":', '        turn_right()', '    elif color() == "red":', '        turn_left()', '    back()'])] } }
      ],
      loiSai: [
        { moTa: 'Để nguyên thân pass: xe còn đứng ở ô vàng', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('go_out', T_GO_OUT), H('come_back', T_COME_BACK_TRONG)] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Lùi mà không đảo luật rẽ (đỏ vẫn rẽ phải, xanh dương vẫn rẽ trái): xe lùi vào tường ở khúc quẹo', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('go_out', T_GO_OUT), H('come_back', ['while color() != "green":', '    read_turn()', '    back()'])] }, phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Lùi mà không rẽ: xe lùi thẳng vào tường ở khúc quẹo đầu tiên', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('go_out', T_GO_OUT), H('come_back', ['while color() != "green":', '    back()'])] }, phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Chỉ lùi một ô: xe dừng ngay cạnh ô vàng', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('go_out', T_GO_OUT), H('come_back', ['back()'])] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Viết hoa "Green": không màu nào khớp nên xe không dừng ở ô xanh lá', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('go_out', T_GO_OUT), H('come_back', ['while color() != "Green":', '    if color() == "red":', '        turn_left()', '    elif color() == "blue":', '        turn_right()', '    back()'])] }, phaiCoMa: ['ten-mau-sai'] },
        { moTa: 'Xóa mất hàm come_back() của màn: lệnh gọi nó không còn hàm nào', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('go_out', T_GO_OUT)] }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Đi về là làm ngược lại từng lệnh: tiến thì lùi, rẽ phải thì rẽ trái.', 'Xe lùi trên đường cũ, nên không cần quay đầu. Dừng khi color() là "green".']
    }),

    man({
      so: 8, ten: 'Nhìn nhầm màu', hang: 'bien-the', coCo: true,
      hamCuaEmCan: ['move', 'turn_right', 'turn_left'],
      deBai: 'Hàm line_step() của màn đi theo vạch: ô đỏ rẽ phải, ô xanh dương rẽ trái. Nhưng nó nhìn nhầm một màu nên xe lạc đường. Tìm chỗ sai và sửa line_step() để xe tới cờ ở cả ba sân.',
      veMaMau: 'Chương trình chính bị khóa, lặp line_step() ba mươi lần. Mở hàm line_step() của màn trong Xưởng hàm: thử nó trong sân thử, xem xe rẽ nhầm ở ô màu nào.',
      san: SAN_8, batDau: BD_8,
      chinhCoDinh: true,
      maMau: { chinh: C_8.slice(), hamCuaMan: [H('line_step', T_LINE_STEP_HONG)] },
      sao: { o: 14, nhip: 25 },
      loiGiai: { chinh: C_8.slice(), hamCuaMan: [H('line_step', T_LINE_STEP)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách sửa, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_8.slice(), hamCuaMan: [H('line_step', nhieu(['# xanh dương rẽ trái'], T_LINE_STEP))] }
      },
      congThucKhac: [
        { moTa: 'Sửa bằng cách ghi màu vào biến rồi so sánh', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('line_step', ['c = color()', 'if c == "red":', '    turn_right()', 'elif c == "blue":', '    turn_left()', 'move()'])] } },
        { moTa: 'Viết lại bằng hai if liền nhau', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('line_step', ['if color() == "red":', '    turn_right()', 'if color() == "blue":', '    turn_left()', 'move()'])] } }
      ],
      loiSai: [
        { moTa: 'Chưa sửa gì: hàm so với "green" nên xe không rẽ trái ở ô xanh dương, lại rẽ trái nhầm ở ô xanh lá', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('line_step', T_LINE_STEP_HONG)] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đổi cả hai hướng rẽ, không đổi màu: đỏ rẽ trái, xanh lá rẽ phải', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('line_step', ['if color() == "red":', '    turn_left()', 'elif color() == "green":', '    turn_right()', 'move()'])] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Sửa màu nhưng bỏ mất move(): xe chỉ rẽ tại chỗ', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('line_step', ['if color() == "red":', '    turn_right()', 'elif color() == "blue":', '    turn_left()'])] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Viết hoa "Blue": không màu nào khớp nên xe không rẽ trái', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('line_step', ['if color() == "red":', '    turn_right()', 'elif color() == "Blue":', '    turn_left()', 'move()'])] }, phaiCoMa: ['ten-mau-sai', 'chua-toi-co'] },
        { moTa: 'Xóa mất hàm line_step() của màn: lệnh gọi nó không còn hàm nào', baiLam: { chinh: C_8.slice() }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Thử line_step() trong sân thử của Xưởng hàm: ô màu nào làm xe rẽ nhầm?', 'Đề nói ô xanh dương rẽ trái. Hàm đang so với màu nào?']
    }),

    man({
      so: 9, ten: 'Cảm biến màu hỏng', hang: 'bien-the', coCo: true, hong: true,
      hamCuaEmCan: ['follow_line', 'follow_right'],
      deBai: 'Cảm biến màu của xe hỏng: color() không chạy được. Hàm trace() của màn đang đi theo vạch màu nên bị lỗi. Viết lại trace() bằng cảm biến khoảng cách để xe tới cờ; đường vẫn là hành lang một lối.',
      veMaMau: 'Chương trình chính bị khóa, chỉ gọi trace(). Thân hàm trace() đang gọi follow_line(), mà follow_line() cần cảm biến màu. Chạy thử, đọc lời báo rồi viết lại trace().',
      san: SAN_9, batDau: BD_9,
      chinhCoDinh: true,
      maMau: { chinh: C_9.slice(), hamCuaMan: [H('trace', T_TRACE_CU)] },
      sao: { o: 17, nhip: 28 },
      loiGiai: { chinh: C_9.slice(), hamCuaMan: [H('trace', T_TRACE)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách viết, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_9.slice(), hamCuaMan: [H('trace', nhieu(['# bám tường bên phải'], T_TRACE))] }
      },
      congThucKhac: [
        { moTa: 'Tự viết bước bám tường trong vòng for, không gọi follow_right()', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('trace', LAP(40, ['if right_clear():', '    turn_right()', '    move()', 'elif front_clear():', '    move()', 'else:', '    turn_left()']))] } },
        { moTa: 'Vòng for lặp 30 lần thay cho 40', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('trace', LAP(30, 'follow_right()'))] } }
      ],
      loiSai: [
        { moTa: 'Để nguyên thân cũ: follow_line() gọi color() mà cảm biến màu hỏng', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('trace', T_TRACE_CU)] }, phaiCoMa: ['lenh-goc-hong'] },
        { moTa: 'Tự gọi color() trong hàm: cảm biến màu hỏng', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('trace', LAP(40, ['if color() == "red":', '    turn_right()', 'move()']))] }, phaiCoMa: ['lenh-goc-hong'] },
        { moTa: 'Chỉ đi thẳng bằng move(): xe húc tường ở khúc quẹo', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('trace', LAP(40, 'move()'))] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Lặp follow_right() quá ít lần: xe chưa tới cờ', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('trace', LAP(3, 'follow_right()'))] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Xóa mất hàm trace() của màn: lệnh gọi nó không còn hàm nào', baiLam: { chinh: C_9.slice() }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Cảm biến khoảng cách của xe vẫn tốt: hỏi tường thay cho hỏi màu.', 'Em đã chế follow_right() ở chương trước: nó bám tường bên tay phải.']
    }),

    /* ------------------------------------------------------------ trùm */
    man({
      so: 10, ten: 'Kho màu', hang: 'trum', nhipTheoLoiGiai: true, tay: true,
      hamCuaEmCan: ['pick', 'follow_line', 'stop_line', 'drop'], gioiHanHam: 4,
      huyHieu: { ma: 'che-mau', ten: 'Huy hiệu Chế lệnh màu' },
      deBai: 'Hàng nằm ngay trước mặt xe. Mang hàng đi theo vạch kẻ tới ô vàng, đi tiếp thẳng tới vạch đỏ, dừng sát trước vạch rồi đặt hàng lên vạch đỏ, giống bóng mờ. Chương trình chỉ được gọi tối đa 4 hàm của em.',
      san: SAN_10, batDau: BD_10, bongMo: BM_10,
      maMau: { chinh: [] },
      sao: { o: 35, nhip: 51 },
      loiGiai: { chinh: L_10.slice() },
      loiGiaiKhac: {
        moTa: 'Cùng cách làm, thêm một dòng chú thích',
        baiLam: { chinh: nhieu(['# nhặt, theo vạch, dừng sát vạch đỏ, đặt'], L_10) }
      },
      congThucKhac: [
        { moTa: 'Đặt hàng bằng lệnh tay gốc, không gọi drop(): chỉ còn 3 hàm của em', baiLam: { chinh: ['pick()', 'follow_line()', 'stop_line()', 'arm_down()', 'release()', 'wait()', 'arm_up()', 'wait()'] } }
      ],
      loiSai: [
        { moTa: 'Quên nhặt hàng: hàng chắn lối nên xe không đi được', baiLam: { chinh: ['follow_line()', 'stop_line()', 'drop()'] }, phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Quên stop_line(): xe đặt hàng ngay sau ô vàng, chưa tới vạch đỏ', baiLam: { chinh: ['pick()', 'follow_line()', 'drop()'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Dùng to_red() thay stop_line(): xe đứng đè lên vạch đỏ và đặt hàng ra sau vạch', baiLam: { chinh: ['pick()', 'follow_line()', 'to_red()', 'drop()'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quên đặt hàng xuống: xe tới đúng chỗ nhưng hàng vẫn trên tay', baiLam: { chinh: ['pick()', 'follow_line()', 'stop_line()'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Gọi thêm to_red() và back() riêng: vượt quá 4 hàm của em', baiLam: { chinh: ['pick()', 'follow_line()', 'to_red()', 'back()', 'drop()'] }, phaiCoMa: ['qua-gioi-han-ham'] }
      ],
      goiY: ['Có bốn việc: nhặt hàng, theo vạch, dừng sát vạch đỏ, đặt hàng. Em đã chế lệnh cho từng việc.', 'Cảm biến ở bụng xe vẫn đọc được màu sàn khi xe đang mang hàng. Vạch đỏ ở xa gần khác nhau, nên đừng đếm bước.']
    })
  ];

  ManHoc.them(DS);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();
