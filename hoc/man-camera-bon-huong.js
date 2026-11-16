/* ============================================================================
   man-camera-bon-huong.js — "Mật Lệnh Robot": NGÂN HÀNG MÀN MỚI của mùa 4, gói 3 "Camera bốn hướng" (KE-HOACH-MUA-4.md; phiên "Mùa 4" tự viết, 30/10).
   User 30/10 chọn phương án A: màn cũ mau / che-mau (cảm biến màu ở bụng, camera trước) sang mùa 5; gói 3 dựng toàn màn mới.
     - `cam-bon`: chương 1 "Đọc màu bốn phía": xe hai bánh gắn camera bốn hướng, color("front") / color("left") / color("right") / color("back") theo mũi xe.
     - `che-cam-bon`: chương 2 "Chế lệnh: dò màu".
   Cái mới của gói: camera bốn hướng (part camera-4, san-hoc.js phần CẢM BIẾN MÀU / CAMERA): một lệnh color(huong) đọc ô kề theo hướng, không tốn nhịp.
   Màn đọc camera có hai, ba sân khác màu để chương trình viết cứng không qua (ngoại lệ NHIEU_SAN_KHONG_TRUM của kiem-lo-trinh.mjs).
   Máy kiểm: hoc/kiem-man-mua-4.mjs, hoc/kiem-lo-trinh.mjs mục mùa 4, hoc/kiem-cam-4.mjs (lõi).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var KHAY = ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'ink', 'dot', 'color'];
  function bai(chinh, them) { return Object.assign({ chinh: chinh.slice() }, them || {}); }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }

  /** Drone nông nghiệp R1 gắn bộ gieo hạt dưới bụng + camera bốn hướng. */
  function man(m) {
    delete m.kep;
    m.chuong = m.chuong || 'cam-bon';
    m.cauTruc = ['for', 'if', 'while', 'list'];
    m.loaiRobot = 'drone';
    m.robot = { than: 'drone', tay: 'son', camBien: [{ ma: 'camera-4', o: 'tren' }] };
    m.hamGoc = m.hamGoc || KHAY.slice();
    m.mucTieu = m.mucTieu || 'toi-co';
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = m.khung || { chinh: 10, moiHam: 10 };
    m.loiSai = m.loiSai || [];
    return ManHoc.chuanHoa(m);
  }
  function manChe(m) { m.chuong = 'che-cam-bon'; if (m.chinhCoDinh !== false) m.chinhCoDinh = true; else delete m.chinhCoDinh; return man(m); }

  var RE_TRAI_PHAI = ['m = color("left")', 'if m == "green":', '    go_left()', '    go_left()', 'else:', '    go_right()', '    go_right()'];
  var NGA_TU = ['m = color("left")', 't = color("right")', 'if m == "green":', '    go_left()', '    go_left()', 'elif t == "green":', '    go_right()', '    go_right()', 'else:', '    go_up()', '    go_up()'];
  var THEO_XANH = ['    m = color("right")', '    t = color("down")', '    if m == "green":', '        go_right()', '    elif t == "green":', '        go_down()', '    else:', '        go_up()'];
  // sân theo vạch xanh (chương 1 màn 6, 9; chương 2 màn 4, 7): drone bay theo ô xanh lá (phải, xuống, hoặc lên 1 bước rồi phải); ô cờ tô xanh bằng lớp màu
  var SAN_THEO = [['#####', '###gF', '#ggg#', '.g###', '#####'], ['#####', '.g###', '#gg##', '##ggF', '#####']];
  var MAU_THEO = [['.....', '....g', '.....', '.....', '.....'], ['.....', '.....', '.....', '....g', '.....']];
  // ba sân vạch xanh dài kết thúc ở ô cờ vàng bên phải (chương 1 trùm)
  var SAN_DAI = [['.gg##', '##g##', '##gg#', '###g#', '###gF'], ['#####', '###gF', '#ggg#', '.g###', '#####'], ['#####', '.gg##', '##g##', '##ggF', '#####']];
  var MAU_DAI = [['.....', '.....', '.....', '.....', '....y'], ['.....', '....y', '.....', '.....', '.....'], ['.....', '.....', '.....', '....y', '.....']];
  var BD_DAI = [{ x: 0, y: 0, huong: 0 }, { x: 0, y: 3, huong: 0 }, { x: 0, y: 1, huong: 0 }];
  var SAN_NGA_TU = [['##F##', '##g##', '.r.b.', '#####'], ['##.##', '##r##', 'Fg.b.', '#####'], ['##.##', '##b##', '.r.gF', '#####']];
  var MAU_NGA_TU = [['..g..', '.....', '.....', '.....'], ['.....', '.....', 'g....', '.....'], ['.....', '.....', '....g', '.....']];
  var SAN_VANG = [['####F', '#ryb.', '.....', '#gyb#'], ['####.', '#rgbF', '.....', '#byr#']];
  // thân hàm của chương che-cam-bon
  var T_RE_XANH = ['m = color("left")', 't = color("right")', 'if m == "green":', '    go_left()', 'elif t == "green":', '    go_right()', 'else:', '    go_up()'];
  var T_TOI_MAU = ['m = color("right")', 'while m != col:', '    go_right()', '    m = color("right")'];
  var T_VANG = ['m = color("up")', 'if m == "yellow":', '    a.append(1)', 'm = color("down")', 'if m == "yellow":', '    a.append(1)'];
  var C_VANG = ['a = []', 'for i in range(4):', '    go_right()', '    yellow_sides(a)', 'for i in range(len(a)):', '    go_up()'];
  var T_BUOC_XANH = THEO_XANH.map(function (s) { return s.slice(4); });
  var WALK_SAI = ['m = color("right")', 't = color("up")', 'if m == "green":', '    go_right()', 'elif t == "green":', '    go_down()', 'else:', '    go_up()'];
  var T_NGA_TU = NGA_TU.slice();
  var C_DAI = ['for i in range(6):', '    walk_green()'];
  var T_XEP = ['c = color("up")', 'ink(c)', 'if c == "red":', '    go_right()', '    dot()', '    go_left()', 'else:', '    go_left()', '    dot()', '    go_right()'];

  var DS = [
    man({
      so: 1, ten: 'Camera bốn hướng', hang: 'lam-quen', chiChay: true, chinhCoDinh: true, hamCuaEmCan: [],
      deBai: 'Em lắp camera bốn hướng cho drone: color("left") đọc màu ô bên trái, color("right") ô bên phải, color("up") ô phía trên, color("down") ô phía dưới. ' +
        'Bấm Chạy xem drone hỏi màu ô bên trái, thấy xanh lá thì bay sang trái hai ô tới cờ.',
      veMaMau: 'Chương trình đã viết sẵn và khoá. Bấm Chạy, nhìn tia camera chiếu sang trái trước khi drone bay.',
      san: ['#####', 'Fg.r.', '#####'],
      batDau: { x: 2, y: 1, huong: 0 },
      maMau: bai(RE_TRAI_PHAI),
      loiGiai: bai(RE_TRAI_PHAI),
      sao: { o: 6, nhip: 2 },
      goiY: ['Trên drone, bốn hướng của camera là "up", "down", "left", "right" theo bản đồ.', 'Đọc màu không tốn nhịp.']
    }),

    man({
      so: 2, ten: 'Rẽ về phía xanh', hang: 'lam-quen', hamCuaEmCan: [],
      deBai: 'Hai ngã ba: ở sân thứ nhất lối xanh ở bên trái, ở sân thứ hai lối xanh ở bên phải. Cùng một chương trình phải bay đúng phía ở cả hai sân để tới cờ.',
      veMaMau: 'Chương trình có sẵn luôn bay sang trái: đúng ở sân thứ nhất. Hỏi camera ô bên trái có xanh không.',
      san: [['#####', 'Fg.r.', '#####'], ['#####', '.r.gF', '#####']],
      batDau: { x: 2, y: 1, huong: 0 },
      maMau: bai(['go_left()', 'go_left()']),
      loiGiai: bai(RE_TRAI_PHAI),
      sao: { o: 6, nhip: 2 },
      loiSai: [
        { moTa: 'Luôn bay sang trái: sân thứ hai bay vào lối đỏ', baiLam: bai(['go_left()', 'go_left()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Hỏi ô phía trên: phía trên là tường, luôn bay sang phải', baiLam: bai(['m = color("up")', 'if m == "green":', '    go_left()', '    go_left()', 'else:', '    go_right()', '    go_right()']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['color("left") đọc ô bên trái drone.', 'Không phải bên trái thì là bên phải: dùng else.']
    }),

    man({
      so: 3, ten: 'Dừng trước vạch đỏ', hang: 'lam-quen', mucTieu: 'bong-mo', hamCuaEmCan: [],
      deBai: 'Drone bay sang phải và phải dừng ngay trước ô đỏ, đúng chỗ bóng mờ. Ô đỏ xa gần mỗi sân một khác: hỏi camera ô bên phải.',
      veMaMau: 'Chương trình có sẵn bay đúng ba ô: đúng ở sân thứ nhất. Dùng while với color("right").',
      san: [['....r.'], ['..r...']],
      batDau: [{ x: 0, y: 0, huong: 0 }, { x: 0, y: 0, huong: 0 }],
      bongMo: [{ x: 3, y: 0 }, { x: 1, y: 0 }],
      maMau: bai(['go_right()', 'go_right()', 'go_right()']),
      loiGiai: bai(['m = color("right")', 'while m != "red":', '    go_right()', '    m = color("right")']),
      sao: { o: 2, nhip: 3 },
      loiSai: [
        { moTa: 'Bay cố định ba ô: sân thứ hai đè lên ô đỏ', baiLam: bai(['go_right()', 'go_right()', 'go_right()']), phaiCoMa: [] },
        { moTa: 'Hỏi ô phía dưới: không bao giờ đỏ, drone bay tới mép sân', baiLam: bai(['m = color("down")', 'while m != "red":', '    go_right()', '    m = color("down")']), phaiCoMa: [] }
      ],
      goiY: ['Còn bay sang phải khi ô bên phải CHƯA đỏ.', 'Bóng mờ đứng sát bên trái ô đỏ, không đè lên ô đỏ.']
    }),

    man({
      so: 4, ten: 'Nhìn trên và dưới', hang: 'luyen', hamCuaEmCan: [],
      deBai: 'Drone đứng giữa lối dọc. Ô ngay phía trên cho biết cờ ở đâu: xanh lá thì cờ ở phía trên, bay lên hai ô; màu khác thì cờ ở phía dưới, bay xuống hai ô. Hai sân.',
      veMaMau: 'Chương trình có sẵn luôn bay xuống: đúng ở sân thứ hai. Hỏi color("up").',
      san: [['F', 'g', '.', '.', '.'], ['.', 'r', '.', '.', 'F']],
      batDau: { x: 0, y: 2, huong: 0 },
      maMau: bai(['go_down()', 'go_down()']),
      loiGiai: bai(['m = color("up")', 'if m == "green":', '    go_up()', '    go_up()', 'else:', '    go_down()', '    go_down()']),
      sao: { o: 6, nhip: 2 },
      loiSai: [
        { moTa: 'Luôn bay xuống: sân thứ nhất bay xa khỏi cờ', baiLam: bai(['go_down()', 'go_down()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Hỏi ô phía dưới thay vì phía trên', baiLam: bai(['m = color("down")', 'if m == "green":', '    go_up()', '    go_up()', 'else:', '    go_down()', '    go_down()']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['color("up") đọc ô ngay phía trên drone.', 'Xanh lá thì bay lên hai ô, ngược lại bay xuống hai ô.']
    }),

    man({
      so: 5, ten: 'Ngã tư', hang: 'luyen', hamCuaEmCan: [],
      deBai: 'Drone đứng giữa ngã tư. Một trong ba phía trái, phải, trên có ô xanh lá: phía đó dẫn tới cờ. Ba sân, ô xanh ở ba phía khác nhau.',
      veMaMau: 'Xanh bên trái thì bay trái hai ô, xanh bên phải thì bay phải hai ô, còn lại là phía trên: bay lên hai ô.',
      san: SAN_NGA_TU,
      batDau: { x: 2, y: 2, huong: 0 },
      maMau: bai(['go_up()', 'go_up()']),
      loiGiai: bai(NGA_TU),
      sao: { o: 9, nhip: 2 },
      loiSai: [
        { moTa: 'Chỉ hỏi bên trái và phải: sân thứ nhất bay nhầm sang phải', baiLam: bai(RE_TRAI_PHAI), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Luôn bay lên', baiLam: bai(['go_up()', 'go_up()']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['if … elif … else: hỏi bên trái, rồi bên phải, còn lại là phía trên.', 'Mỗi nhánh bay hai ô theo hướng đó.']
    }),

    man({
      so: 6, ten: 'Theo vạch xanh có rẽ', hang: 'luyen', hamCuaEmCan: [],
      deBai: 'Vạch xanh lá dẫn tới cờ qua nhiều khúc gấp. Mỗi bước: bên phải xanh thì bay phải, không thì phía dưới xanh thì bay xuống, còn lại bay lên. Sáu bước là tới cờ. Hai sân.',
      veMaMau: 'Chương trình có sẵn đã có vòng lặp sáu bước. Viết thân vòng lặp bằng if / elif / else.',
      san: SAN_THEO, mau: MAU_THEO,
      batDau: [{ x: 0, y: 3, huong: 0 }, { x: 0, y: 1, huong: 0 }],
      maMau: bai(['for i in range(6):', '    go_right()']),
      loiGiai: bai(['for i in range(6):'].concat(THEO_XANH)),
      sao: { o: 7, nhip: 6 },
      loiSai: [
        { moTa: 'Chỉ bay sang phải: đâm bụi cây ở góc đầu tiên', baiLam: bai(['for i in range(6):', '    go_right()']), phaiCoMa: [] },
        { moTa: 'Không hỏi phía dưới: sân thứ hai bay nhầm lên trên', baiLam: bai(['for i in range(6):', '    m = color("right")', '    if m == "green":', '        go_right()', '    else:', '        go_up()']), phaiCoMa: [] }
      ],
      goiY: ['Mỗi bước chỉ bay một ô: sang phải, xuống dưới, hoặc lên trên.', 'Ô cờ cũng được tô xanh nên camera thấy được.']
    }),

    man({
      so: 7, ten: 'Đếm ô vàng hai bên', hang: 'bien-the', bienDem: true, hamCuaEmCan: [],
      deBai: 'Drone bay bốn ô sang phải dọc lối đi. Phía trên và phía dưới lối đi có các ô màu; đếm số ô VÀNG ở cả phía trên lẫn phía dưới. Hết lối, bay lên đúng bằng số ô vàng đếm được để tới cờ.',
      veMaMau: 'Chương trình có sẵn đã có n = 0, bay bốn ô sang phải rồi bay lên n ô. Thêm phần đếm ô vàng phía trên và phía dưới.',
      san: SAN_VANG,
      batDau: { x: 0, y: 2, huong: 0 },
      maMau: bai(['n = 0', 'for i in range(4):', '    go_right()', 'for i in range(n):', '    go_up()']),
      loiGiai: bai(['n = 0', 'for i in range(4):', '    go_right()', '    m = color("up")', '    if m == "yellow":', '        n = n + 1', '    m = color("down")', '    if m == "yellow":', '        n = n + 1', 'for i in range(n):', '    go_up()']),
      sao: { o: 9, nhip: 6 },
      loiSai: [
        { moTa: 'Chỉ đếm phía trên: sân thứ hai đếm thiếu', baiLam: bai(['n = 0', 'for i in range(4):', '    go_right()', '    m = color("up")', '    if m == "yellow":', '        n = n + 1', 'for i in range(n):', '    go_up()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Dùng elif: hai ô vàng cùng cột chỉ đếm một', baiLam: bai(['n = 0', 'for i in range(4):', '    go_right()', '    m = color("up")', '    t = color("down")', '    if m == "yellow":', '        n = n + 1', '    elif t == "yellow":', '        n = n + 1', 'for i in range(n):', '    go_up()']), phaiCoMa: [] }
      ],
      goiY: ['Hai câu if riêng: phía trên vàng cộng 1, phía dưới vàng cũng cộng 1.', 'Đọc màu sau mỗi bước bay sang phải.']
    }),

    man({
      so: 8, ten: 'Hai ngã rẽ', hang: 'bien-the', hamCuaEmCan: [],
      deBai: 'Đường lên cờ đi qua hai bậc liền nhau. Ở mỗi bậc: bay lên một ô, rồi nhìn hai bên và bay sang phía có ô xanh lá. Lặp hai lần cùng một cách làm.',
      veMaMau: 'Chương trình có sẵn mới qua được bậc thứ nhất. Đưa nó vào vòng lặp hai lần.',
      san: [['##r.F', '#r.g#', '##.##'], ['F.r##', '#g.r#', '##.##']],
      mau: [['....g', '.....', '.....'], ['g....', '.....', '.....']],
      batDau: { x: 2, y: 2, huong: 0 },
      maMau: bai(['go_up()', 'm = color("left")', 'if m == "green":', '    go_left()', 'else:', '    go_right()']),
      loiGiai: bai(['for i in range(2):', '    go_up()', '    m = color("left")', '    if m == "green":', '        go_left()', '    else:', '        go_right()']),
      sao: { o: 6, nhip: 4 },
      loiSai: [
        { moTa: 'Chỉ qua một bậc', baiLam: bai(['go_up()', 'm = color("left")', 'if m == "green":', '    go_left()', 'else:', '    go_right()']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Mỗi vòng: bay lên một ô, đọc m = color("left"), rồi hỏi m == "green" để chọn trái hay phải.', 'Hai bậc làm giống hệt nhau: dùng for i in range(2).']
    }),

    man({
      so: 9, ten: 'Camera nhìn nhầm phía', hang: 'bien-the', hamCuaEmCan: [],
      deBai: 'Chương trình theo vạch xanh có sẵn hỏi nhầm phía: ở nhánh elif nó hỏi phía trên thay vì phía dưới nên bay sai hướng. Sửa một chữ trong lệnh camera để drone tới cờ ở cả hai sân.',
      veMaMau: 'Chạy thử ở sân thứ hai, xem drone bay sai ở chỗ nào. Chạm chữ hướng trong color(…) để đổi.',
      san: SAN_THEO, mau: MAU_THEO,
      batDau: [{ x: 0, y: 3, huong: 0 }, { x: 0, y: 1, huong: 0 }],
      maMau: bai(['for i in range(6):', '    m = color("right")', '    t = color("up")', '    if m == "green":', '        go_right()', '    elif t == "green":', '        go_down()', '    else:', '        go_up()']),
      loiGiai: bai(['for i in range(6):'].concat(THEO_XANH)),
      sao: { o: 7, nhip: 6 },
      loiSai: [
        { moTa: 'Không sửa: hỏi phía trên mà lại bay xuống', baiLam: bai(['for i in range(6):', '    m = color("right")', '    t = color("up")', '    if m == "green":', '        go_right()', '    elif t == "green":', '        go_down()', '    else:', '        go_up()']), phaiCoMa: [] }
      ],
      goiY: ['Câu hỏi và lệnh bay phải cùng một phía.', 'Bay xuống (go_down) thì phải hỏi "down".']
    }),

    man({
      so: 10, ten: 'Đường xanh tới ô vàng', hang: 'trum', hamCuaEmCan: [],
      deBai: 'Vạch xanh lá dài ngắn khác nhau, kết thúc ngay bên trái ô cờ vàng. Không biết trước bao nhiêu bước: dùng while, bay theo vạch xanh cho tới khi ô bên phải là ô vàng, rồi bay sang phải vào cờ. Ba sân.',
      veMaMau: 'Chương trình có sẵn mới bay theo vạch được sáu bước. Đổi vòng for thành while dừng khi bên phải là ô vàng.',
      san: SAN_DAI, mau: MAU_DAI,
      batDau: BD_DAI,
      maMau: bai(['for i in range(6):'].concat(THEO_XANH)),
      loiGiai: bai(['m = color("right")', 'while m != "yellow":'].concat(THEO_XANH.slice(1), ['    m = color("right")', 'go_right()'])),
      sao: { o: 8, nhip: 8 },
      loiSai: [
        { moTa: 'Lặp cố định sáu bước: sân dài chưa tới cờ', baiLam: bai(['for i in range(6):'].concat(THEO_XANH)), phaiCoMa: [] },
        { moTa: 'Quên bước cuối bay sang phải vào ô cờ', baiLam: bai(['m = color("right")', 'while m != "yellow":'].concat(THEO_XANH.slice(1), ['    m = color("right")'])), phaiCoMa: [] }
      ],
      goiY: ['while dừng khi ô bên phải là ô vàng; lúc đó cần thêm một go_right() vào cờ.', 'Thân vòng lặp giống màn Theo vạch xanh có rẽ.']
    }),

    /* ================================================= chương che-cam-bon "Chế lệnh: dò màu" ================================================= */
    manChe({
      so: 1, ten: 'Hàm rẽ về phía xanh', hang: 'lam-quen', taoHam: ['turn_green'], hamCuaEmCan: [],
      deBai: 'Chế turn_green(): bên trái xanh lá thì bay trái một ô, bên phải xanh lá thì bay phải một ô, còn lại bay lên một ô. Chương trình chính đã khóa: gọi turn_green() hai lần. Ba ngã tư.',
      veMaMau: 'Mở Xưởng hàm, tạo turn_green() không có đối số. Thân hàm dùng if / elif / else.',
      san: SAN_NGA_TU, mau: MAU_NGA_TU, batDau: { x: 2, y: 2, huong: 0 },
      maMau: bai(['turn_green()', 'turn_green()']),
      loiGiai: bai(['turn_green()', 'turn_green()'], { hamCuaEmMoi: [H('turn_green', [], T_RE_XANH)] }),
      sao: { o: 8, nhip: 2 },
      congThucKhac: [{ moTa: 'Hỏi bên phải trước', hamCuaEmMoi: [H('turn_green', [], ['m = color("right")', 't = color("left")', 'if m == "green":', '    go_right()', 'elif t == "green":', '    go_left()', 'else:', '    go_up()'])] }],
      loiSai: [
        { moTa: 'Gọi turn_green() mà chưa chế hàm', baiLam: bai(['turn_green()', 'turn_green()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên nhánh bay lên: sân thứ nhất bay nhầm sang phải', baiLam: bai(['turn_green()', 'turn_green()']), hamCuaEmMoi: [H('turn_green', [], ['m = color("left")', 'if m == "green":', '    go_left()', 'else:', '    go_right()'])], phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Ba phía: trái, phải, trên. Dùng if, elif và else.', 'Ô cờ cũng mang màu xanh nên gọi hai lần là tới cờ.']
    }),

    manChe({
      so: 2, ten: 'Hàm chạy tới màu', hang: 'lam-quen', mucTieu: 'bong-mo', taoHam: ['go_to'], hamCuaEmCan: [],
      deBai: 'Chế go_to(col): bay sang phải cho tới khi ô bên phải có màu col. Chương trình chính đã khóa: go_to("red"), drone phải dừng đúng chỗ bóng mờ trước ô đỏ. Hai sân.',
      veMaMau: 'Tạo go_to với một đối số col. Đọc m = color("right") rồi so m với col.',
      san: [['....r.'], ['..r...']],
      batDau: [{ x: 0, y: 0, huong: 0 }, { x: 0, y: 0, huong: 0 }],
      bongMo: [{ x: 3, y: 0 }, { x: 1, y: 0 }],
      maMau: bai(['go_to("red")']),
      loiGiai: bai(['go_to("red")'], { hamCuaEmMoi: [H('go_to', ['col'], T_TOI_MAU)] }),
      sao: { o: 3, nhip: 3 },
      congThucKhac: [{ moTa: 'Viết bằng not và ==', hamCuaEmMoi: [H('go_to', ['col'], ['m = color("right")', 't = m == col', 'while not t:', '    go_right()', '    m = color("right")', '    t = m == col'])] }],
      loiSai: [
        { moTa: 'Gọi go_to mà chưa chế hàm', baiLam: bai(['go_to("red")']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Điều kiện ngược (==): drone không bay ô nào', baiLam: bai(['go_to("red")']), hamCuaEmMoi: [H('go_to', ['col'], ['m = color("right")', 'while m == col:', '    go_right()', '    m = color("right")'])], phaiCoMa: [] }
      ],
      goiY: ['Còn bay khi màu bên phải KHÁC col.', 'Chương trình chính đưa "red" vào col.']
    }),

    manChe({
      so: 3, ten: 'Hàm ghi ô vàng', hang: 'lam-quen', taoHam: ['yellow_sides'], hamCuaEmCan: [],
      deBai: 'Đếm ô vàng hai bên bằng danh sách: chế yellow_sides(a): phía trên vàng thì thêm một phần tử vào a, phía dưới vàng cũng thêm một phần tử. Số ô vàng là len(a). Chương trình chính đã khóa.',
      veMaMau: 'Tạo yellow_sides với một đối số a. Hai câu if riêng, mỗi câu một a.append(…).',
      san: SAN_VANG, batDau: { x: 0, y: 2, huong: 0 },
      maMau: bai(C_VANG),
      loiGiai: bai(C_VANG, { hamCuaEmMoi: [H('yellow_sides', ['a'], T_VANG)] }),
      sao: { o: 10, nhip: 6 },
      congThucKhac: [{ moTa: 'Ghi luôn chữ "yellow" vào danh sách', hamCuaEmMoi: [H('yellow_sides', ['a'], ['m = color("up")', 'if m == "yellow":', '    a.append("yellow")', 'm = color("down")', 'if m == "yellow":', '    a.append("yellow")'])] }],
      loiSai: [
        { moTa: 'Gọi yellow_sides mà chưa chế hàm', baiLam: bai(C_VANG), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Dùng elif: hai ô vàng cùng cột chỉ ghi một', baiLam: bai(C_VANG), hamCuaEmMoi: [H('yellow_sides', ['a'], ['m = color("up")', 't = color("down")', 'if m == "yellow":', '    a.append(1)', 'elif t == "yellow":', '    a.append(1)'])], phaiCoMa: [] }
      ],
      goiY: ['len(a) là số phần tử của a.', 'Phía trên và phía dưới có thể cùng vàng: dùng hai câu if.']
    }),

    manChe({
      so: 4, ten: 'Hàm một bước theo vạch', hang: 'luyen', taoHam: ['green_step'], hamCuaEmCan: [],
      deBai: 'Chế green_step(): một bước theo vạch xanh: bên phải xanh thì bay phải, không thì phía dưới xanh thì bay xuống, còn lại bay lên. Chương trình chính đã khóa: lặp green_step() sáu lần.',
      veMaMau: 'Tạo green_step() không có đối số. Thân hàm là if / elif / else như màn Theo vạch xanh có rẽ.',
      san: SAN_THEO, mau: MAU_THEO,
      batDau: [{ x: 0, y: 3, huong: 0 }, { x: 0, y: 1, huong: 0 }],
      maMau: bai(['for i in range(6):', '    green_step()']),
      loiGiai: bai(['for i in range(6):', '    green_step()'], { hamCuaEmMoi: [H('green_step', [], T_BUOC_XANH)] }),
      sao: { o: 8, nhip: 6 },
      congThucKhac: [{ moTa: 'Hỏi phía trên trước phía dưới ở nhánh elif', hamCuaEmMoi: [H('green_step', [], ['m = color("right")', 't = color("up")', 'if m == "green":', '    go_right()', 'elif t == "green":', '    go_up()', 'else:', '    go_down()'])] }],
      loiSai: [
        { moTa: 'Gọi green_step() mà chưa chế hàm', baiLam: bai(['for i in range(6):', '    green_step()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Không hỏi phía dưới: sân thứ hai bay nhầm lên trên', baiLam: bai(['for i in range(6):', '    green_step()']), hamCuaEmMoi: [H('green_step', [], ['m = color("right")', 'if m == "green":', '    go_right()', 'else:', '    go_up()'])], phaiCoMa: [] }
      ],
      goiY: ['Mỗi lần gọi chỉ bay một ô: phải, xuống, hoặc lên.', 'Đúng sáu lần gọi là tới cờ.']
    }),

    manChe({
      so: 5, ten: 'Hàm qua ngã tư', hang: 'luyen', taoHam: ['cross4'], hamCuaEmCan: ['turn_green'],
      deBai: 'Chế cross4(): ở ngã tư, bay hai ô về phía có ô xanh lá (trái, phải hay trên) để tới cờ. Chương trình chính đã khóa: cross4().',
      veMaMau: 'Tạo cross4() không có đối số. Mỗi nhánh bay hai ô, hoặc gọi turn_green() hai lần.',
      san: SAN_NGA_TU, mau: MAU_NGA_TU, batDau: { x: 2, y: 2, huong: 0 },
      maMau: bai(['cross4()']),
      loiGiai: bai(['cross4()'], { hamCuaEmMoi: [H('cross4', [], T_NGA_TU)] }),
      sao: { o: 10, nhip: 2 },
      congThucKhac: [{ moTa: 'Gọi turn_green() hai lần', hamCuaEmMoi: [H('cross4', [], ['turn_green()', 'turn_green()'])] }],
      loiSai: [
        { moTa: 'Gọi cross4() mà chưa chế hàm', baiLam: bai(['cross4()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên trường hợp phía trên xanh', baiLam: bai(['cross4()']), hamCuaEmMoi: [H('cross4', [], ['m = color("left")', 'if m == "green":', '    go_left()', '    go_left()', 'else:', '    go_right()', '    go_right()'])], phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Ba phía: trái, phải, trên.', 'Có thể viết if / elif / else hoặc gọi turn_green() đã chế.']
    }),

    manChe({
      so: 6, ten: 'Hàm gieo hạt theo màu mẫu', hang: 'luyen', mucTieu: 'to-hinh', taoHam: ['sort_by_color'], hamCuaEmCan: [],
      deBai: 'Chế sort_by_color(): đọc màu ô mẫu ngay phía trên vào c, chọn hạt màu c; nếu c là "red" thì bay phải một ô, chấm rồi bay trái về chỗ cũ; ' +
        'màu khác thì bay trái một ô, chấm rồi bay phải về chỗ cũ. Chương trình chính đã khóa. Hai sân, hai màu mẫu.',
      veMaMau: 'Tạo sort_by_color() không có đối số. Đọc c = color("up") TRƯỚC khi bay sang bên.',
      san: [['...', '.r.', '...'], ['...', '.b.', '...']],
      hinh: [['...', '...', '..r'], ['...', '...', 'b..']],
      batDau: { x: 1, y: 2, huong: 0 },
      maMau: bai(['sort_by_color()']),
      loiGiai: bai(['sort_by_color()'], { hamCuaEmMoi: [H('sort_by_color', [], T_XEP)] }),
      sao: { o: 11, nhip: 2 },
      congThucKhac: [{ moTa: 'Hỏi màu khác đỏ trước', hamCuaEmMoi: [H('sort_by_color', [], ['c = color("up")', 'ink(c)', 'if c != "red":', '    go_left()', '    dot()', '    go_right()', 'else:', '    go_right()', '    dot()', '    go_left()'])] }],
      loiSai: [
        { moTa: 'Gọi sort_by_color() mà chưa chế hàm', baiLam: bai(['sort_by_color()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Luôn gieo sang bên phải: sân thứ hai gieo ra ngoài hình', baiLam: bai(['sort_by_color()']), hamCuaEmMoi: [H('sort_by_color', [], ['c = color("up")', 'ink(c)', 'go_right()', 'dot()', 'go_left()'])], phaiCoMa: ['to-thua'] }
      ],
      goiY: ['c = color("up") đọc ô mẫu ngay phía trên chỗ drone đang đứng.', 'Chấm xong bay ngược lại một ô để vừa chốt nhịp gieo vừa về chỗ cũ.']
    }),

    manChe({
      so: 7, ten: 'Sửa bước theo vạch', hang: 'bien-the', hamCuaEmCan: [],
      deBai: 'Hàm của màn walk_green() đi theo vạch xanh nhưng ở nhánh elif lại hỏi nhầm phía trên thay vì phía dưới. Sửa walk_green(); chương trình chính đã khóa: lặp walk_green() sáu lần.',
      veMaMau: 'Chạy thử, xem drone bay sai ở chỗ nào. Mở walk_green() trong Xưởng hàm, đổi chữ hướng trong color(…).',
      san: SAN_THEO, mau: MAU_THEO,
      batDau: [{ x: 0, y: 3, huong: 0 }, { x: 0, y: 1, huong: 0 }],
      maMau: bai(C_DAI, { hamCuaMan: [H('walk_green', [], WALK_SAI)] }),
      loiGiai: bai(C_DAI, { hamCuaMan: [H('walk_green', [], T_BUOC_XANH)] }),
      sao: { o: 8, nhip: 6 },
      loiSai: [
        { moTa: 'Không sửa: hỏi phía trên mà bay xuống', baiLam: bai(C_DAI, { hamCuaMan: [H('walk_green', [], WALK_SAI)] }), phaiCoMa: [] }
      ],
      goiY: ['Câu hỏi và lệnh bay phải cùng một phía.', 'Chỉ cần đổi "up" thành "down" ở dòng elif.']
    }),

    manChe({
      so: 8, ten: 'Bay tới mẫu màu rồi gieo', hang: 'bien-the', mucTieu: 'to-hinh', chinhCoDinh: false, hamCuaEmCan: ['sort_by_color'],
      deBai: 'Ô mẫu màu nằm ở hàng trên, xa gần mỗi sân một khác. Bay sang phải cho tới khi ô phía trên có màu (khác "none"), rồi gieo hạt đúng phía bằng sort_by_color(). Tự viết chương trình chính. Hai sân.',
      veMaMau: 'Chương trình có sẵn mới gọi sort_by_color(). Đọc m = color("up"), thêm vòng while bay sang phải khi m == "none".',
      san: [['...r.', '.....'], ['..b..', '.....']],
      hinh: [['.....', '....r'], ['.....', '.b...']],
      batDau: { x: 0, y: 1, huong: 0 },
      maMau: bai(['sort_by_color()']),
      loiGiai: bai(['m = color("up")', 'while m == "none":', '    go_right()', '    m = color("up")', 'sort_by_color()']),
      sao: { o: 13, nhip: 5 },
      loiSai: [
        { moTa: 'Gieo ngay từ đầu: phía trên chưa có màu mẫu', baiLam: bai(['sort_by_color()']), phaiCoMa: [] },
        { moTa: 'Chỉ bay cố định một ô: chưa tới dưới ô mẫu', baiLam: bai(['go_right()', 'sort_by_color()']), phaiCoMa: [] }
      ],
      goiY: ['Còn bay khi ô phía trên chưa có màu: m == "none". Bay xong một ô thì đọc lại m = color("up").', 'Dừng rồi thì ô mẫu nằm ngay phía trên drone: gọi sort_by_color().']
    }),

    manChe({
      so: 9, ten: 'Sửa hàm chạy tới màu', hang: 'bien-the', mucTieu: 'bong-mo', hamCuaEmCan: [],
      deBai: 'Hàm của màn go_until(col) phải bay sang phải tới khi ô bên phải có màu col, nhưng phép so viết ngược nên drone không bay ô nào. Sửa go_until; chương trình chính đã khóa: go_until("yellow"). Hai sân.',
      veMaMau: 'Chạy thử: drone đứng yên. Đổi == thành != trong điều kiện while.',
      san: [['.g...y'], ['...y..']],
      batDau: [{ x: 0, y: 0, huong: 0 }, { x: 0, y: 0, huong: 0 }],
      bongMo: [{ x: 4, y: 0 }, { x: 2, y: 0 }],
      maMau: bai(['go_until("yellow")'], { hamCuaMan: [H('go_until', ['col'], ['m = color("right")', 'while m == col:', '    go_right()', '    m = color("right")'])] }),
      loiGiai: bai(['go_until("yellow")'], { hamCuaMan: [H('go_until', ['col'], T_TOI_MAU)] }),
      sao: { o: 3, nhip: 4 },
      loiSai: [
        { moTa: 'Không sửa: drone đứng yên', baiLam: bai(['go_until("yellow")'], { hamCuaMan: [H('go_until', ['col'], ['m = color("right")', 'while m == col:', '    go_right()', '    m = color("right")'])] }), phaiCoMa: [] }
      ],
      goiY: ['Còn bay khi màu bên phải KHÁC col.', 'Ô xanh lá giữa đường không làm drone dừng.']
    }),

    manChe({
      so: 10, ten: 'Đường xanh tới mẫu màu', hang: 'trum', mucTieu: 'to-hinh', chinhCoDinh: false, hamCuaEmCan: ['green_step', 'sort_by_color'],
      deBai: 'Vạch xanh dẫn tới ngay dưới một ô mẫu màu. Bay theo vạch sáu bước bằng green_step() thì ô mẫu nằm ngay phía trên drone: gọi sort_by_color() để gieo hạt đúng phía theo màu mẫu. Hai sân.',
      veMaMau: 'Chương trình có sẵn mới bay sáu bước theo vạch. Viết tiếp lệnh gieo hạt theo màu mẫu.',
      san: [['####r.', '###...', '#gggg#', '.g####', '######'], ['######', '.g#b##', '#g...#', '#ggg##', '######']],
      hinh: [['......', '.....r', '......', '......', '......'], ['......', '......', '..b...', '......', '......']],
      batDau: [{ x: 0, y: 3, huong: 0 }, { x: 0, y: 1, huong: 0 }],
      maMau: bai(['for i in range(6):', '    green_step()']),
      loiGiai: bai(['for i in range(6):', '    green_step()', 'sort_by_color()']),
      sao: { o: 19, nhip: 8 },
      loiSai: [
        { moTa: 'Chỉ bay năm bước: chưa tới dưới ô mẫu màu', baiLam: bai(['for i in range(5):', '    green_step()', 'sort_by_color()']), phaiCoMa: [] },
        { moTa: 'Không gọi sort_by_color()', baiLam: bai(['for i in range(6):', '    green_step()']), phaiCoMa: [] }
      ],
      goiY: ['Hết sáu bước green_step(), ô mẫu nằm ngay phía trên drone.', 'sort_by_color() đọc màu phía trên rồi gieo sang phải (đỏ) hoặc trái (xanh dương).']
    })
  ];

  ManHoc.manCameraBonHuong = DS;
  if (laNode) module.exports = ManHoc;
})();
