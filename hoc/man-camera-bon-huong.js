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

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var KEP = ['arm_down', 'arm_up', 'grab', 'release'];
  function bai(chinh, them) { return Object.assign({ chinh: chinh.slice() }, them || {}); }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }

  /** Xe hai bánh gắn camera bốn hướng; m.kep: true thì gắn thêm tay kẹp. */
  function man(m) {
    var kep = m.kep;
    delete m.kep;
    m.chuong = m.chuong || 'cam-bon';
    m.cauTruc = ['for', 'if', 'while', 'list'];
    m.loaiRobot = 'banh';
    m.robot = { than: 'hai-banh', tay: kep ? 'kep' : null, camBien: [{ ma: 'camera-4', o: 'tren' }] };
    m.hamGoc = m.hamGoc || BANH.concat(kep ? KEP : [], ['color']);
    m.mucTieu = m.mucTieu || 'toi-co';
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = m.khung || { chinh: 10, moiHam: 10 };
    m.loiSai = m.loiSai || [];
    return ManHoc.chuanHoa(m);
  }
  function manChe(m) { m.chuong = 'che-cam-bon'; if (m.chinhCoDinh !== false) m.chinhCoDinh = true; else delete m.chinhCoDinh; return man(m); }

  var RE_TRAI_PHAI = ['if color("left") == "green":', '    turn_left()', 'else:', '    turn_right()', 'forward(2)'];
  var NGA_TU = ['if color("left") == "green":', '    turn_left()', 'elif color("right") == "green":', '    turn_right()', 'forward(2)'];
  var THEO_XANH = ['    if color("front") == "green":', '        move()', '    elif color("left") == "green":', '        turn_left()', '    else:', '        turn_right()'];
  // sân theo vạch xanh (chương 1 màn 6, 9): xe đi theo ô xanh lá, gặp góc thì rẽ; ô cờ tô xanh bằng lớp màu để camera thấy
  var SAN_THEO = [['#####', '##ggF', '##g##', '.gg##', '#####'], ['#####', '.gg##', '##g##', '##ggF', '#####']];
  var MAU_THEO = [['.....', '....g', '.....', '.....', '.....'], ['.....', '.....', '.....', '....g', '.....']];
  var SAN_NGA_TU = [['##F##', '##g##', '.r.b.', '#####'], ['##.##', '##r##', 'Fg.b.', '#####'], ['##.##', '##b##', '.r.gF', '#####']];
  var SAN_VANG = [['####F', '#ryb.', '.....', '#gyb#'], ['####.', '#rgbF', '.....', '#byr#']];
  // thân hàm của chương che-cam-bon
  var T_RE_XANH = ['if color("left") == "green":', '    turn_left()', 'elif color("right") == "green":', '    turn_right()'];
  var T_TOI_MAU = ['while color("front") != col:', '    move()'];
  var T_VANG = ['if color("left") == "yellow":', '    a.append(1)', 'if color("right") == "yellow":', '    a.append(1)'];
  var C_VANG = ['a = []', 'for i in range(4):', '    move()', '    yellow_sides(a)', 'turn_left()', 'forward(len(a))'];
  var T_BUOC_XANH = THEO_XANH.map(function (s) { return s.slice(4); });
  var WALK_SAI = ['if color("front") == "green":', '    move()', 'elif color("right") == "green":', '    turn_left()', 'else:', '    turn_right()'];
  var T_NGA_TU = ['if color("front") == "green":', '    forward(2)', 'elif color("left") == "green":', '    turn_left()', '    forward(2)', 'else:', '    turn_right()', '    forward(2)'];
  var T_XEP = ['c = color("front")', 'pick()', 'if c == "red":', '    turn_right()', '    drop()', '    turn_left()', 'else:', '    turn_left()', '    drop()', '    turn_right()'];

  var DS = [
    man({
      so: 1, ten: 'Camera bốn hướng', hang: 'lam-quen', chiChay: true, chinhCoDinh: true, hamCuaEmCan: ['turn_left', 'turn_right', 'forward'],
      deBai: 'Em lắp camera bốn hướng lên nóc xe: color("left") đọc màu ô bên trái xe, color("right") ô bên phải, color("front") ô trước mặt, color("back") ô sau lưng. ' +
        'Bấm Chạy xem xe hỏi màu ô bên trái, thấy xanh lá thì rẽ trái vào phố mở và chạy tới cờ.',
      veMaMau: 'Chương trình đã viết sẵn và khoá. Bấm Chạy, nhìn tia camera chiếu sang trái trước khi xe rẽ.',
      san: ['#####', 'Fg.r.', '#####'],
      batDau: { x: 2, y: 1, huong: 0 },
      maMau: bai(RE_TRAI_PHAI),
      loiGiai: bai(RE_TRAI_PHAI),
      sao: { o: 12, nhip: 3 },
      goiY: ['Hướng của camera tính theo mũi xe: xe quay lên thì "left" là ô bên trái màn hình.', 'Đọc màu không tốn nhịp.']
    }),

    man({
      so: 2, ten: 'Rẽ về phía xanh', hang: 'lam-quen', hamCuaEmCan: ['turn_left', 'turn_right', 'forward'],
      deBai: 'Hai ngã ba: ở sân thứ nhất phố xanh bên trái, ở sân thứ hai phố xanh bên phải. Cùng một chương trình phải rẽ đúng phía ở cả hai sân rồi chạy tới cờ.',
      veMaMau: 'Chương trình có sẵn luôn rẽ trái: đúng ở sân thứ nhất. Hỏi camera ô bên trái có xanh không.',
      san: [['#####', 'Fg.r.', '#####'], ['#####', '.r.gF', '#####']],
      batDau: { x: 2, y: 1, huong: 0 },
      maMau: bai(['turn_left()', 'forward(2)']),
      loiGiai: bai(RE_TRAI_PHAI),
      sao: { o: 14, nhip: 3 },
      loiSai: [
        { moTa: 'Luôn rẽ trái: sân thứ hai vào phố đỏ', baiLam: bai(['turn_left()', 'forward(2)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Hỏi ô phía trước: trước mặt là tường, luôn rẽ phải', baiLam: bai(['if color("front") == "green":', '    turn_left()', 'else:', '    turn_right()', 'forward(2)']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['color("left") đọc ô bên trái xe.', 'Không phải bên trái thì là bên phải: dùng else.']
    }),

    man({
      so: 3, ten: 'Dừng trước vạch đỏ', hang: 'lam-quen', mucTieu: 'bong-mo', hamCuaEmCan: ['move'],
      deBai: 'Xe chạy thẳng và phải dừng ngay trước vạch đỏ, đúng chỗ xe mờ. Vạch đỏ xa gần mỗi sân một khác: hỏi camera ô phía trước.',
      veMaMau: 'Chương trình có sẵn chạy đúng ba ô: đúng ở sân thứ nhất. Dùng while với color("front").',
      san: [['....r.'], ['..r...']],
      batDau: [{ x: 0, y: 0, huong: 1 }, { x: 0, y: 0, huong: 1 }],
      bongMo: [{ x: 3, y: 0, huong: 1 }, { x: 1, y: 0, huong: 1 }],
      maMau: bai(['move()', 'move()', 'move()']),
      loiGiai: bai(['while color("front") != "red":', '    move()']),
      sao: { o: 5, nhip: 3 },
      loiSai: [
        { moTa: 'Chạy cố định ba ô: sân thứ hai đè lên vạch đỏ', baiLam: bai(['move()', 'move()', 'move()']), phaiCoMa: [] },
        { moTa: 'Hỏi ô bên phải: không bao giờ đỏ, xe chạy tới mép sân', baiLam: bai(['while color("right") != "red":', '    move()']), phaiCoMa: [] }
      ],
      goiY: ['Còn chạy khi ô phía trước CHƯA đỏ.', 'Xe mờ đứng sát vạch đỏ, không đứng trên vạch.']
    }),

    man({
      so: 4, ten: 'Nhìn sau lưng', hang: 'luyen', hamCuaEmCan: ['back', 'forward'],
      deBai: 'Xe đứng giữa con phố. Ô ngay sau lưng xe cho biết cờ ở đâu: xanh lá thì cờ ở phía sau, lùi hai ô; màu khác thì cờ ở phía trước, tiến hai ô. Hai sân.',
      veMaMau: 'Chương trình có sẵn luôn tiến: đúng ở sân thứ hai. Hỏi color("back").',
      san: [['Fg...'], ['.r..F']],
      batDau: { x: 2, y: 0, huong: 1 },
      maMau: bai(['forward(2)']),
      loiGiai: bai(['if color("back") == "green":', '    back()', '    back()', 'else:', '    forward(2)']),
      sao: { o: 13, nhip: 2 },
      loiSai: [
        { moTa: 'Luôn tiến: sân thứ nhất chạy xa khỏi cờ', baiLam: bai(['forward(2)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Hỏi ô phía trước thay vì sau lưng', baiLam: bai(['if color("front") == "green":', '    back()', '    back()', 'else:', '    forward(2)']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['color("back") đọc ô ngay sau đuôi xe.', 'back() lùi một ô mà không quay xe.']
    }),

    man({
      so: 5, ten: 'Ngã tư', hang: 'luyen', hamCuaEmCan: ['turn_left', 'turn_right', 'forward'],
      deBai: 'Xe đứng giữa ngã tư, mũi quay lên. Một trong ba phố trước, trái, phải có ô xanh lá: phố đó dẫn tới cờ. Ba sân, phố xanh ở ba phía khác nhau.',
      veMaMau: 'Xanh bên trái thì rẽ trái, xanh bên phải thì rẽ phải, còn lại là phía trước: không cần rẽ.',
      san: SAN_NGA_TU,
      batDau: { x: 2, y: 2, huong: 0 },
      maMau: bai(['forward(2)']),
      loiGiai: bai(NGA_TU),
      sao: { o: 14, nhip: 3 },
      loiSai: [
        { moTa: 'Chỉ hỏi bên trái: sân thứ ba rẽ nhầm', baiLam: bai(RE_TRAI_PHAI), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Luôn đi thẳng', baiLam: bai(['forward(2)']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['if … elif … : hai câu hỏi, xe chỉ rẽ khi thấy xanh ở bên đó.', 'Rẽ xong (hay không rẽ) đều tiến hai ô.']
    }),

    man({
      so: 6, ten: 'Theo vạch xanh có rẽ', hang: 'luyen', hamCuaEmCan: ['move', 'turn_left', 'turn_right'],
      deBai: 'Vạch xanh lá dẫn tới cờ, có góc rẽ. Mỗi bước: trước mặt xanh thì đi, không thì bên trái xanh thì rẽ trái, còn lại rẽ phải. Tám bước là tới cờ. Hai sân, hai đường khác nhau.',
      veMaMau: 'Chương trình có sẵn đã có vòng lặp tám bước. Viết thân vòng lặp bằng if / elif / else.',
      san: SAN_THEO, mau: MAU_THEO,
      batDau: [{ x: 0, y: 3, huong: 1 }, { x: 0, y: 1, huong: 1 }],
      maMau: bai(['for i in range(8):', '    move()']),
      loiGiai: bai(['for i in range(8):'].concat(THEO_XANH)),
      sao: { o: 14, nhip: 8 },
      loiSai: [
        { moTa: 'Chỉ đi thẳng: đâm tường ở góc đầu tiên', baiLam: bai(['for i in range(8):', '    move()']), phaiCoMa: [] },
        { moTa: 'Gặp góc thì luôn rẽ trái: sân thứ hai lạc vạch', baiLam: bai(['for i in range(8):', '    if color("front") == "green":', '        move()', '    else:', '        turn_left()']), phaiCoMa: [] }
      ],
      goiY: ['Mỗi bước chỉ làm một việc: đi, hoặc rẽ.', 'Ô cờ cũng được tô xanh nên camera thấy được.']
    }),

    man({
      so: 7, ten: 'Đếm ô vàng hai bên', hang: 'bien-the', bienDem: true, hamCuaEmCan: ['move', 'turn_left', 'forward'],
      deBai: 'Xe chạy bốn ô dọc phố. Hai bên phố có ô màu; đếm số ô VÀNG ở cả bên trái lẫn bên phải. Hết phố, rẽ trái rồi tiến đúng bằng số ô vàng đếm được để tới cờ.',
      veMaMau: 'Chương trình có sẵn đã có n = 0, chạy bốn ô, rẽ trái và tiến n ô. Thêm phần đếm ô vàng hai bên.',
      san: SAN_VANG,
      batDau: { x: 0, y: 2, huong: 1 },
      maMau: bai(['n = 0', 'for i in range(4):', '    move()', 'turn_left()', 'forward(n)']),
      loiGiai: bai(['n = 0', 'for i in range(4):', '    move()', '    if color("left") == "yellow":', '        n = n + 1', '    if color("right") == "yellow":', '        n = n + 1', 'turn_left()', 'forward(n)']),
      sao: { o: 16, nhip: 7 },
      loiSai: [
        { moTa: 'Chỉ đếm bên trái: sân thứ hai đếm thiếu', baiLam: bai(['n = 0', 'for i in range(4):', '    move()', '    if color("left") == "yellow":', '        n = n + 1', 'turn_left()', 'forward(n)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Dùng elif: ô vàng hai bên cùng chỗ chỉ đếm một', baiLam: bai(['n = 0', 'for i in range(4):', '    move()', '    if color("left") == "yellow":', '        n = n + 1', '    elif color("right") == "yellow":', '        n = n + 1', 'turn_left()', 'forward(n)']), phaiCoMa: [] }
      ],
      goiY: ['Hai câu if riêng: bên trái vàng cộng 1, bên phải vàng cũng cộng 1.', 'Đọc màu sau khi đã chạy tới ô mới.']
    }),

    man({
      so: 8, ten: 'Hai ngã rẽ', hang: 'bien-the', hamCuaEmCan: ['turn_left', 'turn_right', 'forward'],
      deBai: 'Đường tới cờ đi qua hai ngã ba liền nhau, mỗi ngã ba cách nhau hai ô. Ở mỗi ngã ba, rẽ về phía có ô xanh lá. Lặp hai lần cùng một cách làm.',
      veMaMau: 'Chương trình có sẵn qua được ngã ba thứ nhất. Đưa nó vào vòng lặp hai lần.',
      san: [['#####', '####F', '####g', '.r.g.', '##.#b'], ['#####', 'F####', 'g####', '.g.r.', 'r#.##']],
      batDau: { x: 2, y: 4, huong: 0 },
      maMau: bai(['forward(1)'].concat(RE_TRAI_PHAI)),
      loiGiai: bai(['forward(1)', 'for i in range(2):', '    if color("left") == "green":', '        turn_left()', '    else:', '        turn_right()', '    forward(2)']),
      sao: { o: 16, nhip: 7 },
      loiSai: [
        { moTa: 'Chỉ qua một ngã ba', baiLam: bai(['forward(1)'].concat(RE_TRAI_PHAI)), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Sau mỗi lần rẽ và tiến hai ô, xe đứng đúng ở ngã ba kế tiếp.', 'Thân vòng lặp: if / else rồi forward(2).']
    }),

    man({
      so: 9, ten: 'Camera nhìn nhầm phía', hang: 'bien-the', hamCuaEmCan: ['move', 'turn_left', 'turn_right'],
      deBai: 'Chương trình theo vạch xanh có sẵn hỏi nhầm phía: gặp góc thì nó hỏi bên phải thay vì bên trái nên rẽ sai. Sửa một chữ trong lệnh camera để xe tới cờ ở cả hai sân.',
      veMaMau: 'Chạy thử ở sân thứ nhất, xem xe rẽ sai ở góc nào. Chạm chữ hướng trong color(…) để đổi.',
      san: SAN_THEO, mau: MAU_THEO,
      batDau: [{ x: 0, y: 3, huong: 1 }, { x: 0, y: 1, huong: 1 }],
      maMau: bai(['for i in range(8):', '    if color("front") == "green":', '        move()', '    elif color("right") == "green":', '        turn_left()', '    else:', '        turn_right()']),
      loiGiai: bai(['for i in range(8):'].concat(THEO_XANH)),
      sao: { o: 14, nhip: 8 },
      loiSai: [
        { moTa: 'Không sửa: hỏi bên phải mà lại rẽ trái', baiLam: bai(['for i in range(8):', '    if color("front") == "green":', '        move()', '    elif color("right") == "green":', '        turn_left()', '    else:', '        turn_right()']), phaiCoMa: [] }
      ],
      goiY: ['Câu hỏi và cú rẽ phải cùng một phía.', 'Hỏi "left" thì rẽ trái.']
    }),

    man({
      so: 10, ten: 'Đường xanh tới ô vàng', hang: 'trum', hamCuaEmCan: ['move', 'turn_left', 'turn_right'],
      deBai: 'Vạch xanh lá dài, rẽ nhiều góc, kết thúc ở ô cờ vàng. Không biết trước bao nhiêu bước: dùng while, đi theo vạch xanh cho tới khi ô phía trước là ô vàng, rồi vào cờ. Ba sân.',
      veMaMau: 'Chương trình có sẵn mới đi theo vạch được tám bước. Đổi vòng for thành while dừng trước ô vàng.',
      san: [['.gg##', '##g##', '##ggg', '####g', '####F'], ['#####', '.ggg#', '###g#', '#Fgg#', '#####'], ['.g###', '#gg##', '##g##', '##gg#', '###F#']],
      mau: [['.....', '.....', '.....', '.....', '....y'], ['.....', '.....', '.....', '.y...', '.....'], ['.....', '.....', '.....', '.....', '...y.']],
      batDau: [{ x: 0, y: 0, huong: 1 }, { x: 0, y: 1, huong: 1 }, { x: 0, y: 0, huong: 1 }],
      maMau: bai(['for i in range(8):'].concat(THEO_XANH)),
      loiGiai: bai(['while color("front") != "yellow":'].concat(THEO_XANH, ['move()'])),
      sao: { o: 15, nhip: 12 },
      loiSai: [
        { moTa: 'Lặp cố định tám bước: sân dài chưa tới cờ', baiLam: bai(['for i in range(8):'].concat(THEO_XANH)), phaiCoMa: [] },
        { moTa: 'Quên bước cuối vào ô cờ', baiLam: bai(['while color("front") != "yellow":'].concat(THEO_XANH)), phaiCoMa: [] }
      ],
      goiY: ['while dừng khi ô phía trước là ô vàng; lúc đó cần thêm một move() vào cờ.', 'Thân vòng lặp giống màn Theo vạch xanh có rẽ.']
    }),

    /* ================================================= chương che-cam-bon "Chế lệnh: dò màu" ================================================= */
    manChe({
      so: 1, ten: 'Hàm rẽ về phía xanh', hang: 'lam-quen', taoHam: ['turn_green'], hamCuaEmCan: ['turn_left', 'turn_right', 'forward'],
      deBai: 'Chế turn_green(): bên trái xanh lá thì rẽ trái, bên phải xanh lá thì rẽ phải, còn lại giữ hướng. Chương trình chính đã khóa: turn_green() rồi tiến hai ô. Ba ngã tư.',
      veMaMau: 'Mở Xưởng hàm, tạo turn_green() không có đối số. Thân hàm giống màn Ngã tư, chỉ bỏ forward(2).',
      san: SAN_NGA_TU, batDau: { x: 2, y: 2, huong: 0 },
      maMau: bai(['turn_green()', 'forward(2)']),
      loiGiai: bai(['turn_green()', 'forward(2)'], { hamCuaEmMoi: [H('turn_green', [], T_RE_XANH)] }),
      sao: { o: 99, nhip: 99 },
      congThucKhac: [{ moTa: 'Hỏi bên phải trước', hamCuaEmMoi: [H('turn_green', [], ['if color("right") == "green":', '    turn_right()', 'elif color("left") == "green":', '    turn_left()'])] }],
      loiSai: [
        { moTa: 'Gọi turn_green() mà chưa chế hàm', baiLam: bai(['turn_green()', 'forward(2)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Không xanh hai bên thì vẫn rẽ phải: sân thứ nhất lạc phố', baiLam: bai(['turn_green()', 'forward(2)']), hamCuaEmMoi: [H('turn_green', [], ['if color("left") == "green":', '    turn_left()', 'else:', '    turn_right()'])], phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Phía trước xanh thì không cần rẽ: hàm không làm gì.', 'Hai câu hỏi: if rồi elif.']
    }),

    manChe({
      so: 2, ten: 'Hàm chạy tới màu', hang: 'lam-quen', mucTieu: 'bong-mo', taoHam: ['go_to'], hamCuaEmCan: ['move'],
      deBai: 'Chế go_to(col): chạy thẳng cho tới khi ô phía trước có màu col. Chương trình chính đã khóa: go_to("red"), xe phải dừng đúng chỗ xe mờ trước vạch đỏ. Hai sân.',
      veMaMau: 'Tạo go_to với một đối số col. So color("front") với col.',
      san: [['....r.'], ['..r...']],
      batDau: [{ x: 0, y: 0, huong: 1 }, { x: 0, y: 0, huong: 1 }],
      bongMo: [{ x: 3, y: 0, huong: 1 }, { x: 1, y: 0, huong: 1 }],
      maMau: bai(['go_to("red")']),
      loiGiai: bai(['go_to("red")'], { hamCuaEmMoi: [H('go_to', ['col'], T_TOI_MAU)] }),
      sao: { o: 99, nhip: 99 },
      congThucKhac: [{ moTa: 'Viết bằng not và ==', hamCuaEmMoi: [H('go_to', ['col'], ['while not color("front") == col:', '    move()'])] }],
      loiSai: [
        { moTa: 'Gọi go_to mà chưa chế hàm', baiLam: bai(['go_to("red")']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'So với "red" viết sẵn: vẫn đúng ở màn này nhưng không dùng đối số', baiLam: bai(['go_to("red")']), hamCuaEmMoi: [H('go_to', ['col'], ['while color("front") != "red":', '    move()'])], phaiCoMa: [] }
      ],
      goiY: ['Còn chạy khi màu phía trước KHÁC col.', 'Chương trình chính đưa "red" vào col.']
    }),

    manChe({
      so: 3, ten: 'Hàm ghi ô vàng', hang: 'lam-quen', taoHam: ['yellow_sides'], hamCuaEmCan: ['move', 'turn_left', 'forward'],
      deBai: 'Đếm ô vàng hai bên bằng danh sách: chế yellow_sides(a): bên trái vàng thì thêm một phần tử vào a, bên phải vàng cũng thêm một phần tử. Số ô vàng là len(a). Chương trình chính đã khóa.',
      veMaMau: 'Tạo yellow_sides với một đối số a. Hai câu if riêng, mỗi câu một a.append(…).',
      san: SAN_VANG, batDau: { x: 0, y: 2, huong: 1 },
      maMau: bai(C_VANG),
      loiGiai: bai(C_VANG, { hamCuaEmMoi: [H('yellow_sides', ['a'], T_VANG)] }),
      sao: { o: 99, nhip: 99 },
      congThucKhac: [{ moTa: 'Ghi luôn chữ "yellow" vào danh sách', hamCuaEmMoi: [H('yellow_sides', ['a'], ['if color("left") == "yellow":', '    a.append("yellow")', 'if color("right") == "yellow":', '    a.append("yellow")'])] }],
      loiSai: [
        { moTa: 'Gọi yellow_sides mà chưa chế hàm', baiLam: bai(C_VANG), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Dùng elif: ô vàng hai bên cùng chỗ chỉ ghi một', baiLam: bai(C_VANG), hamCuaEmMoi: [H('yellow_sides', ['a'], ['if color("left") == "yellow":', '    a.append(1)', 'elif color("right") == "yellow":', '    a.append(1)'])], phaiCoMa: [] }
      ],
      goiY: ['len(a) là số phần tử của a.', 'Hai bên có thể cùng vàng: dùng hai câu if.']
    }),

    manChe({
      so: 4, ten: 'Hàm một bước theo vạch', hang: 'luyen', taoHam: ['green_step'], hamCuaEmCan: ['move', 'turn_left', 'turn_right'],
      deBai: 'Chế green_step(): một bước theo vạch xanh: trước mặt xanh thì đi, không thì bên trái xanh thì rẽ trái, còn lại rẽ phải. Chương trình chính đã khóa: lặp green_step() tám lần.',
      veMaMau: 'Tạo green_step() không có đối số. Thân hàm là if / elif / else như màn Theo vạch xanh có rẽ.',
      san: SAN_THEO, mau: MAU_THEO,
      batDau: [{ x: 0, y: 3, huong: 1 }, { x: 0, y: 1, huong: 1 }],
      maMau: bai(['for i in range(8):', '    green_step()']),
      loiGiai: bai(['for i in range(8):', '    green_step()'], { hamCuaEmMoi: [H('green_step', [], T_BUOC_XANH)] }),
      sao: { o: 99, nhip: 99 },
      congThucKhac: [{ moTa: 'Hỏi rẽ phải trước, rẽ trái là trường hợp còn lại', hamCuaEmMoi: [H('green_step', [], ['if color("front") == "green":', '    move()', 'elif color("right") == "green":', '    turn_right()', 'else:', '    turn_left()'])] }],
      loiSai: [
        { moTa: 'Gọi green_step() mà chưa chế hàm', baiLam: bai(['for i in range(8):', '    green_step()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Luôn rẽ trái ở góc: sân thứ nhất lạc vạch', baiLam: bai(['for i in range(8):', '    green_step()']), hamCuaEmMoi: [H('green_step', [], ['if color("front") == "green":', '    move()', 'else:', '    turn_left()'])], phaiCoMa: [] }
      ],
      goiY: ['Mỗi lần gọi chỉ làm một việc: đi, hoặc rẽ.', 'Đúng tám lần gọi là tới cờ.']
    }),

    manChe({
      so: 5, ten: 'Hàm qua ngã tư', hang: 'luyen', taoHam: ['cross4'], hamCuaEmCan: ['turn_left', 'turn_right', 'forward'],
      deBai: 'Chế cross4(): ở ngã tư, đi về phía có ô xanh lá (trước, trái hay phải) rồi tiến hai ô tới cờ. Viết đủ ba trường hợp trong một hàm. Chương trình chính đã khóa: cross4().',
      veMaMau: 'Tạo cross4() không có đối số. Mỗi nhánh đều kết thúc bằng forward(2).',
      san: SAN_NGA_TU, batDau: { x: 2, y: 2, huong: 0 },
      maMau: bai(['cross4()']),
      loiGiai: bai(['cross4()'], { hamCuaEmMoi: [H('cross4', [], T_NGA_TU)] }),
      sao: { o: 99, nhip: 99 },
      congThucKhac: [{ moTa: 'Dùng turn_green() em đã chế rồi tiến hai ô', hamCuaEmMoi: [H('cross4', [], ['turn_green()', 'forward(2)'])] }],
      loiSai: [
        { moTa: 'Gọi cross4() mà chưa chế hàm', baiLam: bai(['cross4()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên trường hợp phía trước xanh', baiLam: bai(['cross4()']), hamCuaEmMoi: [H('cross4', [], ['if color("left") == "green":', '    turn_left()', 'else:', '    turn_right()', 'forward(2)'])], phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Ba phía: trước, trái, phải. Phía trước xanh thì chỉ cần tiến.', 'Có thể gọi turn_green() em đã chế.']
    }),

    manChe({
      so: 6, ten: 'Hàm xếp hàng theo màu', hang: 'luyen', kep: true, mucTieu: 'bong-mo', taoHam: ['sort_by_color'], hamCuaEmCan: ['pick', 'drop', 'turn_right', 'turn_left'],
      deBai: 'Xe gắn thêm tay kẹp. Chế sort_by_color(): đọc màu hộp trước mặt, gắp lên; hộp đỏ đặt sang ô bên phải xe, hộp khác đặt sang ô bên trái; xe quay về hướng cũ. ' +
        'Chương trình chính đã khóa. Hộp mờ chỉ chỗ đặt; hai sân, hộp hai màu.',
      veMaMau: 'Tạo sort_by_color() không có đối số. Đọc màu TRƯỚC khi gắp: gắp lên rồi thì ô trước mặt trống.',
      san: [['.....', '..o..', '.....'], ['.....', '..o..', '.....']],
      vatMau: [['.....', '..r..', '.....'], ['.....', '..b..', '.....']],
      batDau: { x: 2, y: 2, huong: 0 },
      bongMo: [{ x: 2, y: 2, huong: 0, vat: [{ x: 3, y: 2, mau: 'red' }] }, { x: 2, y: 2, huong: 0, vat: [{ x: 1, y: 2, mau: 'blue' }] }],
      maMau: bai(['sort_by_color()']),
      loiGiai: bai(['sort_by_color()'], { hamCuaEmMoi: [H('sort_by_color', [], T_XEP)] }),
      sao: { o: 99, nhip: 99 },
      congThucKhac: [{ moTa: 'Hỏi màu khác đỏ trước', hamCuaEmMoi: [H('sort_by_color', [], ['c = color("front")', 'pick()', 'if c != "red":', '    turn_left()', '    drop()', '    turn_right()', 'else:', '    turn_right()', '    drop()', '    turn_left()'])] }],
      loiSai: [
        { moTa: 'Gọi sort_by_color() mà chưa chế hàm', baiLam: bai(['sort_by_color()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Gắp trước rồi mới đọc màu: trước mặt đã trống, hộp nào cũng sang trái', baiLam: bai(['sort_by_color()']), hamCuaEmMoi: [H('sort_by_color', [], ['pick()', 'c = color("front")', 'if c == "red":', '    turn_right()', '    drop()', '    turn_left()', 'else:', '    turn_left()', '    drop()', '    turn_right()'])], phaiCoMa: [] }
      ],
      goiY: ['c = color("front") phải đứng TRƯỚC pick().', 'Đặt xong thì quay ngược lại để xe về hướng cũ.']
    }),

    manChe({
      so: 7, ten: 'Sửa bước theo vạch', hang: 'bien-the', hamCuaEmCan: ['move', 'turn_left', 'turn_right'],
      deBai: 'Hàm của màn walk_green() đi theo vạch xanh nhưng ở góc lại hỏi nhầm phía. Sửa walk_green(); chương trình chính đã khóa: lặp walk_green() tám lần.',
      veMaMau: 'Chạy thử, xem xe rẽ sai ở góc nào. Mở walk_green() trong Xưởng hàm, đổi chữ hướng trong color(…).',
      san: SAN_THEO, mau: MAU_THEO,
      batDau: [{ x: 0, y: 3, huong: 1 }, { x: 0, y: 1, huong: 1 }],
      maMau: bai(['for i in range(8):', '    walk_green()'], { hamCuaMan: [H('walk_green', [], WALK_SAI)] }),
      loiGiai: bai(['for i in range(8):', '    walk_green()'], { hamCuaMan: [H('walk_green', [], T_BUOC_XANH)] }),
      sao: { o: 99, nhip: 99 },
      loiSai: [
        { moTa: 'Không sửa: hỏi bên phải mà rẽ trái', baiLam: bai(['for i in range(8):', '    walk_green()'], { hamCuaMan: [H('walk_green', [], WALK_SAI)] }), phaiCoMa: [] }
      ],
      goiY: ['Câu hỏi và cú rẽ phải cùng một phía.', 'Chỉ cần đổi "right" thành "left".']
    }),

    manChe({
      so: 8, ten: 'Xếp hai hộp', hang: 'bien-the', kep: true, mucTieu: 'bong-mo', chinhCoDinh: false, hamCuaEmCan: ['sort_by_color', 'move'],
      deBai: 'Hai hộp xếp hàng dọc trước mũi xe. Xếp hộp gần trước, rồi tiến một ô, xếp hộp xa. Tự viết chương trình chính bằng sort_by_color() em đã chế. Hai sân, màu hộp khác nhau.',
      veMaMau: 'Chương trình có sẵn mới xếp hộp gần. Viết tiếp cho hộp xa.',
      san: [['.....', '..o..', '..o..', '.....'], ['.....', '..o..', '..o..', '.....']],
      vatMau: [['.....', '..b..', '..r..', '.....'], ['.....', '..r..', '..r..', '.....']],
      batDau: { x: 2, y: 3, huong: 0 },
      bongMo: [{ x: 2, y: 2, huong: 0, vat: [{ x: 3, y: 3, mau: 'red' }, { x: 1, y: 2, mau: 'blue' }] }, { x: 2, y: 2, huong: 0, vat: [{ x: 3, y: 3, mau: 'red' }, { x: 3, y: 2, mau: 'red' }] }],
      maMau: bai(['sort_by_color()']),
      loiGiai: bai(['sort_by_color()', 'move()', 'sort_by_color()']),
      sao: { o: 99, nhip: 99 },
      loiSai: [
        { moTa: 'Chỉ xếp hộp gần', baiLam: bai(['sort_by_color()']), phaiCoMa: [] },
        { moTa: 'Quên tiến một ô: hộp xa còn cách một ô, gắp hụt', baiLam: bai(['sort_by_color()', 'sort_by_color()']), phaiCoMa: [] }
      ],
      goiY: ['Xếp xong hộp gần, ô trước mặt trống: tiến một ô là tới sát hộp xa.', 'Xe mờ đứng ở chỗ xếp hộp xa.']
    }),

    manChe({
      so: 9, ten: 'Sửa hàm chạy tới màu', hang: 'bien-the', mucTieu: 'bong-mo', hamCuaEmCan: ['move'],
      deBai: 'Hàm của màn go_until(col) phải chạy tới khi ô phía trước có màu col, nhưng phép so viết ngược nên xe không chạy ô nào. Sửa go_until; chương trình chính đã khóa: go_until("yellow"). Hai sân.',
      veMaMau: 'Chạy thử: xe đứng yên. Đổi == thành != trong điều kiện while.',
      san: [['.g...y'], ['...y..']],
      batDau: [{ x: 0, y: 0, huong: 1 }, { x: 0, y: 0, huong: 1 }],
      bongMo: [{ x: 4, y: 0, huong: 1 }, { x: 2, y: 0, huong: 1 }],
      maMau: bai(['go_until("yellow")'], { hamCuaMan: [H('go_until', ['col'], ['while color("front") == col:', '    move()'])] }),
      loiGiai: bai(['go_until("yellow")'], { hamCuaMan: [H('go_until', ['col'], T_TOI_MAU)] }),
      sao: { o: 99, nhip: 99 },
      loiSai: [
        { moTa: 'Không sửa: xe đứng yên', baiLam: bai(['go_until("yellow")'], { hamCuaMan: [H('go_until', ['col'], ['while color("front") == col:', '    move()'])] }), phaiCoMa: [] }
      ],
      goiY: ['Còn chạy khi màu phía trước KHÁC col.', 'Ô xanh lá giữa đường không làm xe dừng.']
    }),

    manChe({
      so: 10, ten: 'Đường xanh tới hộp', hang: 'trum', kep: true, mucTieu: 'bong-mo', chinhCoDinh: false, hamCuaEmCan: ['green_step', 'sort_by_color'],
      deBai: 'Vạch xanh dẫn tới một hộp hàng. Đi theo vạch bảy bước thì hộp nằm ngay trước mũi xe: xếp hộp về đúng phía theo màu. Tự viết chương trình chính bằng các hàm em đã chế. Hai sân, hai đường, hai màu hộp.',
      veMaMau: 'Chương trình có sẵn mới đi được bảy bước. Viết tiếp phần xếp hộp.',
      san: [['###.#', '##ggo', '##g.#', '.gg##', '#####'], ['#####', '.gg##', '##g.#', '##ggo', '###.#']],
      vatMau: [['.....', '....r', '.....', '.....', '.....'], ['.....', '.....', '.....', '....b', '.....']],
      batDau: [{ x: 0, y: 3, huong: 1 }, { x: 0, y: 1, huong: 1 }],
      bongMo: [{ x: 3, y: 1, huong: 1, vat: [{ x: 3, y: 2, mau: 'red' }] }, { x: 3, y: 3, huong: 1, vat: [{ x: 3, y: 2, mau: 'blue' }] }],
      maMau: bai(['for i in range(7):', '    green_step()']),
      loiGiai: bai(['for i in range(7):', '    green_step()', 'sort_by_color()']),
      sao: { o: 99, nhip: 99 },
      loiSai: [
        { moTa: 'Đi tám bước: bước cuối đâm vào hộp', baiLam: bai(['for i in range(8):', '    green_step()', 'sort_by_color()']), phaiCoMa: [] },
        { moTa: 'Không xếp hộp', baiLam: bai(['for i in range(7):', '    green_step()']), phaiCoMa: [] }
      ],
      goiY: ['Hết bảy bước, hộp nằm ngay trước mũi xe.', 'sort_by_color() đọc màu, gắp rồi đặt sang bên.']
    })
  ];

  ManHoc.manCameraBonHuong = DS;
  if (laNode) module.exports = ManHoc;
})();
