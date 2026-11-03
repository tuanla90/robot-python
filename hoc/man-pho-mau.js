/* ============================================================================
   man-pho-mau.js — "Mật Lệnh Robot": NGÂN HÀNG MÀN MỚI của mùa 4, gói 4 "Phố màu" (KE-HOACH-MUA-4.md). HIỆN CHƯA CÓ MÀN.
   Khung mùa 4 (lo-trinh-hoc.js, khối "MÙA 4 = 10 GÓI", mảng MUA_4) đã chừa chỗ: tệp đã có trong danh sách require của lo-trinh-hoc.js và
   thẻ <script> của game/choi.html. Gói sau CHỈ việc thêm màn vào mảng DS dưới đây; màn tự hiện đúng chương, đúng gói.
     - `pho-mau`: chương 1 "Đi giữa phố màu" (chưa có màn)
     - `che-pho-mau`: chương 2 "Chế lệnh: qua phố" (chưa có màn)
   Mỗi màn khai `chuong` (một trong các mã trên) và `so` (thứ tự trong phần màn mới của chương); mã `ma` = chuong + '.' + so là khóa lưu sao,
   KHÔNG đổi sau khi xuất bản, KHÔNG trùng mã đã có (chương dùng lại mã cũ như drone, may-son, mau, flycam: khai so từ 11). Gọi ManHoc.chuanHoa(m)
   như các tệp màn khác. Màn mới nối SAU các màn có sẵn của chương (chen trước màn trùm có sẵn nếu màn cuối có sẵn là trùm). Chương còn trống thì chưa hiện.
   Ràng buộc mùa 4 (hoc/kiem-lo-trinh.mjs mục mùa 4): được dùng mọi part mùa 1–3 + drone, máy sơn, camera; KHÔNG omni, máy ném, bánh gai, loa;
   bút liền (pen_down / pen_up) chỉ từ gói 6; ô sạc P chỉ từ gói 5. Tên chương và lời theo KE-HOACH-7-MUA.md "Quy tắc đặt tên và giọng kể".
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var BAY = ['go_up', 'go_down', 'go_left', 'go_right', 'wait'];
  var SON = ['ink', 'dot'];
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  function bai(chinh, them) { return Object.assign({ chinh: chinh.slice() }, them || {}); }
  function thut(ds) { return ds.map(function (s) { return '    ' + s; }); }

  /** Drone gắn bộ gieo hạt dưới bụng + camera bốn hướng (color("up") …); m.nam: true thì mục tiêu to-hinh (gieo hạt đúng ô màu). */
  function man(m) {
    var nam = m.nam;
    delete m.nam;
    m.chuong = m.chuong || 'pho-mau';
    m.cauTruc = ['for', 'if', 'while', 'list'];
    m.loaiRobot = 'drone';
    m.robot = { than: 'drone', tay: 'son', camBien: [{ ma: 'camera-4', o: 'tren' }] };
    m.hamGoc = m.hamGoc || nhieu(BAY, SON, ['color']);
    if (nam) { m.mucTieu = 'to-hinh'; m.nhipTheoLoiGiai = true; }
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = m.khung || { chinh: 10, moiHam: 10 };
    m.loiSai = m.loiSai || [];
    return ManHoc.chuanHoa(m);
  }

  // Gieo một ô theo thẻ mẫu: đọc màu thẻ bên phải, nạp màu, bay tới ô gieo; thẻ đỏ thì bay thêm một ô (ô đỏ ở xa hơn ô xanh), gieo hạt.
  var CHO_1 = ['c = color("right")', 'ink(c)', 'go_right()', 'go_right()', 'if c == "red":', '    go_right()', 'dot()', 'wait()'];
  var DO_DUONG = ['for i in range(6):', '    m = color("right")', '    if m == "green":', '        go_right()', '    else:', '        go_down()'];
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  /** Màn chương che-pho-mau: chương trình chính khóa, em chế hàm (như che-may-son). */
  function manChe(m) { m.chuong = 'che-pho-mau'; if (m.chinhCoDinh !== false) m.chinhCoDinh = true; else delete m.chinhCoDinh; return man(m); }
  var T_TIM = ['m = color("right")', 'while m == "none":', '    go_right()', '    m = color("right")'];
  var C_TIM = ['find_bag()', 'm = color("right")', 'ink(m)', 'go_right()', 'go_right()', 'dot()', 'wait()'];
  var T_BAY = ['m = color("right")', 'while m != col:', '    go_right()', '    m = color("right")'];
  var C_BAY = ['fly_to("yellow")', 'go_right()'];
  var T_GHI = ['for i in range(n):', '    go_right()', '    m = color("up")', '    a.append(m)'];
  var C_GHI = ['a = []', 'read_row(a, 2)', 'for c in a:', '    if c == "red":', '        go_down()', '    else:', '        go_right()'];
  var T_THEO = ['for c in a:', '    if c == "red":', '        go_down()', '    else:', '        go_right()'];
  var C_THEO = ['a = []', 'read_row(a, 3)', 'follow_code(a)'];
  var T_THA = ['for i in range(n):', '    go_down()', 'ink("yellow")', 'dot()', 'wait()'];
  var C_THA = ['n = 0', 'for i in range(3):', '    go_right()', '    m = color("up")', '    if m == "red":', '        n = n + 1', 'drop_down(n)'];
  var T_DEM = ['for i in range(n):', '    go_right()', '    m = color("up")', '    if m == "red":', '        a.append("red")'];      // ghi màu thật (nghiệm thu 30/10: mẹo append(1) chỉ dạy một lần ở che-cam-bon.3)
  var C_DEM = ['a = []', 'red_count(a, 3)', 'drop_down(len(a))'];
  var C_XEP = ['find_bag()', 'place_bag()'];

  var DS = [
    man({
      so: 1, ten: 'Hạt về đúng màu', hang: 'lam-quen', nam: true, chiChay: true, chinhCoDinh: true, hamCuaEmCan: [],
      deBai: 'Luống màu có thẻ mẫu và ô gieo hạt: ô gieo xanh dương ngay sau thẻ, ô gieo đỏ xa thêm một ô. Camera bốn hướng nhìn ô bên cạnh: color("right") đọc màu thẻ bên phải drone. ' +
        'Bấm Chạy xem drone đọc màu thẻ, nạp hạt, rồi bay tới gieo đúng ô đỏ.',
      veMaMau: 'Chương trình đã viết sẵn và khoá. Bấm Chạy, nhìn tia camera đọc màu thẻ trước khi drone bay tới.',
      san: ['.r..'],
      hinh: ['...r'],
      batDau: { x: 0, y: 0 },
      maMau: bai(CHO_1),
      loiGiai: bai(CHO_1),
      sao: { o: 8, nhip: 4 },
      goiY: ['color("right") không tốn nhịp: đọc trước rồi mới bay.', 'Thẻ đỏ thì bay thêm một ô so với thẻ xanh dương.']
    }),

    man({
      so: 2, ten: 'Thẻ nào cũng đúng', hang: 'lam-quen', nam: true, hamCuaEmCan: [],
      deBai: 'Hai luống giống nhau, chỉ khác màu thẻ mẫu: luống thứ nhất thẻ đỏ, luống thứ hai thẻ xanh dương. Cùng một chương trình phải gieo hạt đúng ô ở cả hai luống. ' +
        'Đọc màu thẻ bằng color("right") trước khi bay tới.',
      veMaMau: 'Chương trình có sẵn lúc nào cũng gieo hạt đỏ ở ô xa: đúng ở luống thứ nhất, sai ở luống thứ hai. Thêm phần đọc màu và chọn ô gieo.',
      san: [['.r..'], ['.b..']],
      hinh: [['...r'], ['..b.']],
      batDau: { x: 0, y: 0 },
      maMau: bai(['ink("red")', 'go_right()', 'go_right()', 'go_right()', 'dot()', 'wait()']),
      loiGiai: bai(CHO_1),
      sao: { o: 8, nhip: 4 },
      loiSai: [
        { moTa: 'Không đọc màu: luống thứ hai bị gieo hạt đỏ ra ngoài ô', baiLam: bai(['ink("red")', 'go_right()', 'go_right()', 'go_right()', 'dot()', 'wait()']), phaiCoMa: ['to-thua'] },
        { moTa: 'Đọc màu SAU khi đã bay tới thẻ: bên phải lúc đó trống ("none")', baiLam: bai(['go_right()', 'c = color("right")', 'ink(c)', 'go_right()', 'if c == "red":', '    go_right()', 'dot()', 'wait()']), phaiCoMa: ['mau-son-sai'] }
      ],
      goiY: ['Đọc màu khi thẻ còn nằm bên phải drone.', 'Ghi màu vào biến c, nạp ink(c), rồi dùng if c == "red": để bay thêm một ô.']
    }),

    man({
      so: 3, ten: 'Phố đèn xanh', hang: 'luyen', hamCuaEmCan: [],
      deBai: 'Drone đứng ở ngã ba. Ô ngay trên và ô ngay dưới có một ô xanh lá (phố mở) và một ô đỏ (phố cấm). Rẽ vào phố xanh rồi bay thẳng tới cờ. ' +
        'Hai sân, phố xanh nằm ở hai phía khác nhau.',
      veMaMau: 'Chương trình có sẵn luôn rẽ lên: đúng ở sân thứ nhất. Hỏi camera ô phía trên có xanh không.',
      san: [['g..F', '.###', 'r...'], ['r...', '.###', 'g..F']],
      batDau: { x: 0, y: 1 },
      mucTieu: 'toi-co',
      maMau: bai(['go_up()', 'for i in range(3):', '    go_right()']),
      loiGiai: bai(['m = color("up")', 'if m == "green":', '    go_up()', 'else:', '    go_down()', 'for i in range(3):', '    go_right()']),
      sao: { o: 6, nhip: 4 },
      loiSai: [
        { moTa: 'Luôn rẽ lên: sân thứ hai vào phố cấm, không tới cờ', baiLam: bai(['go_up()', 'for i in range(3):', '    go_right()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Hỏi nhầm hướng color("right"): bên phải là tường, luôn rẽ xuống', baiLam: bai(['m = color("right")', 'if m == "green":', '    go_up()', 'else:', '    go_down()', 'for i in range(3):', '    go_right()']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['color("up") đọc ô ngay phía trên drone.', 'Phố nào xanh thì phố đó có cờ.']
    }),

    man({
      so: 4, ten: 'Theo vạch xanh', hang: 'luyen', hamCuaEmCan: [],
      deBai: 'Vạch xanh lá chỉ đường tới cờ qua các dãy nhà, chỉ đi sang phải hoặc xuống. Mỗi bước: ô bên phải xanh thì bay sang phải, không thì bay xuống. ' +
        'Hai sân, hai đường vạch khác nhau, mỗi đường đúng sáu bước.',
      veMaMau: 'Chương trình có sẵn bay đúng đường của sân thứ nhất. Sân thứ hai đường khác: dùng camera để dò.',
      san: [['.gg#', '##gg', '###g', '###F'], ['.###', 'ggg#', '##gg', '###F']],
      batDau: { x: 0, y: 0 },
      mucTieu: 'toi-co',
      maMau: bai(['go_right()', 'go_right()', 'go_down()', 'go_right()', 'go_down()', 'go_down()']),
      loiGiai: bai(DO_DUONG),
      sao: { o: 5, nhip: 6 },
      loiSai: [
        { moTa: 'Bay theo đường của sân thứ nhất: sân thứ hai lạc vạch', baiLam: bai(['go_right()', 'go_right()', 'go_down()', 'go_right()', 'go_down()', 'go_down()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Hỏi ô bên dưới thay vì bên phải: rẽ sai ngay bước đầu', baiLam: bai(['for i in range(6):', '    m = color("down")', '    if m == "green":', '        go_right()', '    else:', '        go_down()']), phaiCoMa: [] }
      ],
      goiY: ['Mỗi bước chỉ có hai lựa chọn: phải hoặc xuống.', 'Ở mép phải sân, ô bên phải nằm ngoài sân: color("right") là "none", nên drone bay xuống.']
    }),

    man({
      so: 5, ten: 'Tìm thẻ trên luống', hang: 'luyen', nam: true, hamCuaEmCan: [],
      deBai: 'Thẻ mẫu nằm đâu đó trên luống, xa gần mỗi sân một khác; ô gieo hạt nằm ngay sau thẻ. Bay sang phải cho tới khi camera thấy thẻ ở ô bên phải, rồi gieo hạt cùng màu vào ô gieo.',
      veMaMau: 'Chương trình có sẵn bay đúng hai ô rồi mới nạp màu: đúng ở sân thứ nhất. Dùng while với color("right") để bay cho tới khi gặp thẻ.',
      san: [['...y..'], ['..g...']],
      hinh: [['....y.'], ['...g..']],
      batDau: { x: 0, y: 0 },
      maMau: bai(['go_right()', 'go_right()', 'm = color("right")', 'ink(m)', 'go_right()', 'go_right()', 'dot()', 'wait()']),
      loiGiai: bai(['m = color("right")', 'while m == "none":', '    go_right()', '    m = color("right")', 'm = color("right")', 'ink(m)', 'go_right()', 'go_right()', 'dot()', 'wait()']),
      sao: { o: 7, nhip: 5 },
      loiSai: [
        { moTa: 'Bay một số ô cố định: sân thứ hai bay quá thẻ mẫu', baiLam: bai(['go_right()', 'go_right()', 'ink("yellow")', 'go_right()', 'go_right()', 'dot()', 'wait()']), phaiCoMa: ['to-thua'] },
        { moTa: 'Điều kiện ngược (!=): drone không bay tới thẻ mẫu', baiLam: bai(['m = color("right")', 'while m != "none":', '    go_right()', '    m = color("right")', 'ink("yellow")', 'go_right()', 'go_right()', 'dot()', 'wait()']), phaiCoMa: ['to-thua'] }
      ],
      goiY: ['Ô luống trống không có màu: color("right") là "none". Thẻ mẫu có màu.', 'Hết vòng while thì thẻ nằm ngay bên phải drone.']
    }),

    man({
      so: 6, ten: 'Tìm thẻ, chọn ô gieo', hang: 'luyen', nam: true, hamCuaEmCan: [], khung: { chinh: 12, moiHam: 10 },
      deBai: 'Tìm thẻ như màn trước, rồi gieo hạt vào đúng ô: ngay sau thẻ là ô xanh dương, xa thêm một ô là ô đỏ. Mỗi sân thẻ nằm một chỗ, màu một khác.',
      veMaMau: 'Chương trình có sẵn đã tìm được thẻ. Thêm phần đọc màu thẻ và chọn ô gieo.',
      san: [['...r..'], ['.b....']],
      hinh: [['.....r'], ['..b...']],
      batDau: { x: 0, y: 0 },
      maMau: bai(['m = color("right")', 'while m == "none":', '    go_right()', '    m = color("right")', 'ink("blue")', 'go_right()', 'go_right()', 'dot()', 'wait()']),
      loiGiai: bai(['m = color("right")', 'while m == "none":', '    go_right()', '    m = color("right")', 'c = color("right")', 'ink(c)', 'go_right()', 'go_right()', 'if c == "red":', '    go_right()', 'dot()', 'wait()']),
      sao: { o: 10, nhip: 6 },
      loiSai: [
        { moTa: 'Không đọc màu thẻ: thẻ đỏ bị gieo vào ô xanh', baiLam: bai(['m = color("right")', 'while m == "none":', '    go_right()', '    m = color("right")', 'ink("blue")', 'go_right()', 'go_right()', 'dot()', 'wait()']), phaiCoMa: ['to-thua'] }
      ],
      goiY: ['Đọc màu ngay khi vòng while vừa dừng: lúc đó thẻ nằm bên phải.', 'Thẻ đỏ đi thêm một ô so với thẻ xanh.']
    }),

    man({
      so: 7, ten: 'Đếm nhà đỏ', hang: 'bien-the', bienDem: true, hamCuaEmCan: [],
      deBai: 'Dãy ba ngôi nhà nằm phía trên phố. Đếm số nhà màu đỏ khi bay ngang qua: có bao nhiêu nhà đỏ thì cờ nằm ở tầng hầm thứ bấy nhiêu, phía dưới cuối phố.',
      veMaMau: 'Chương trình có sẵn đã có biến n = 0 và bay qua ba nhà. Mỗi lần thấy nhà đỏ ở phía trên thì cộng n thêm 1, cuối cùng bay xuống n tầng.',
      san: [['.rgr', '....', '###.', '###F'], ['.grb', '....', '###F', '###.']],
      batDau: { x: 0, y: 1 },
      mucTieu: 'toi-co',
      maMau: bai(['n = 0', 'for i in range(3):', '    go_right()', 'for i in range(n):', '    go_down()']),
      loiGiai: bai(['n = 0', 'for i in range(3):', '    go_right()', '    m = color("up")', '    if m == "red":', '        n = n + 1', 'for i in range(n):', '    go_down()']),
      sao: { o: 7, nhip: 5 },
      loiSai: [
        { moTa: 'Đếm nhà xanh lá thay vì nhà đỏ', baiLam: bai(['n = 0', 'for i in range(3):', '    go_right()', '    m = color("up")', '    if m == "green":', '        n = n + 1', 'for i in range(n):', '    go_down()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đọc màu trước khi bay sang nhà: đếm lệch một nhà', baiLam: bai(['n = 0', 'for i in range(3):', '    m = color("up")', '    if m == "red":', '        n = n + 1', '    go_right()', 'for i in range(n):', '    go_down()']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Bay sang trước, rồi mới hỏi color("up") về ngôi nhà ngay trên.', 'n = n + 1 nằm trong if, thụt vào thêm một bậc.']
    }),

    man({
      so: 8, ten: 'Mật lệnh màu', hang: 'bien-the', hamCuaEmCan: [],
      deBai: 'Ba ngôi nhà phía trên phố là một mật lệnh: nhà đỏ nghĩa là "bay xuống", nhà màu khác nghĩa là "bay sang phải". Bay qua ba nhà, ghi màu vào danh sách a, ' +
        'rồi đi theo mật lệnh để tới cờ. Hai sân, hai mật lệnh.',
      veMaMau: 'Chương trình có sẵn đã ghi màu ba nhà vào a. Viết phần đi theo mật lệnh: duyệt từng màu trong a.',
      san: [['.rgr..', '......', '###..#', '####F#'], ['.grg..', '......', '###..F', '######']],
      batDau: { x: 0, y: 1 },
      mucTieu: 'toi-co',
      maMau: bai(['a = []', 'for i in range(3):', '    go_right()', '    m = color("up")', '    a.append(m)']),
      loiGiai: bai(['a = []', 'for i in range(3):', '    go_right()', '    m = color("up")', '    a.append(m)', 'for c in a:', '    if c == "red":', '        go_down()', '    else:', '        go_right()']),
      sao: { o: 9, nhip: 6 },
      loiSai: [
        { moTa: 'Đi ngược mật lệnh (đỏ là sang phải)', baiLam: bai(['a = []', 'for i in range(3):', '    go_right()', '    m = color("up")', '    a.append(m)', 'for c in a:', '    if c == "red":', '        go_right()', '    else:', '        go_down()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đọc ô dưới thay vì nhà phía trên: mật lệnh toàn "none"', baiLam: bai(['a = []', 'for i in range(3):', '    go_right()', '    m = color("down")', '    a.append(m)', 'for c in a:', '    if c == "red":', '        go_down()', '    else:', '        go_right()']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['a.append(color("up")) ghi màu nhà vào cuối danh sách.', 'for c in a: lấy lần lượt từng màu; mỗi màu là một bước bay.']
    }),

    man({
      so: 9, ten: 'Mật lệnh đọc ngược', hang: 'bien-the', hamCuaEmCan: [],
      deBai: 'Bốn ngôi nhà là mật lệnh: nhà đỏ là "bay xuống", nhà màu khác là "bay sang phải". Chương trình có sẵn ghi đúng mật lệnh nhưng làm ngược nghĩa nên lạc đường. Sửa cho drone tới cờ ở cả hai sân.',
      veMaMau: 'Chạy thử ở sân thứ nhất: nhà đầu đỏ mà drone lại bay sang phải. Đổi lại hai nhánh của if.',
      san: [['.rbrr###', '......##', '####....', '#####.##', '#####F##'], ['.grgg###', '......##', '####...F', '#####.##', '#####.##']],
      batDau: { x: 0, y: 1 },
      mucTieu: 'toi-co',
      maMau: bai(['a = []', 'for i in range(4):', '    go_right()', '    m = color("up")', '    a.append(m)', 'for c in a:', '    if c == "red":', '        go_right()', '    else:', '        go_down()']),
      loiGiai: bai(['a = []', 'for i in range(4):', '    go_right()', '    m = color("up")', '    a.append(m)', 'for c in a:', '    if c == "red":', '        go_down()', '    else:', '        go_right()']),
      sao: { o: 9, nhip: 8 },
      loiSai: [
        { moTa: 'Không sửa gì: đi ngược mật lệnh', baiLam: bai(['a = []', 'for i in range(4):', '    go_right()', '    m = color("up")', '    a.append(m)', 'for c in a:', '    if c == "red":', '        go_right()', '    else:', '        go_down()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Chỉ đọc ba nhà: thiếu một bước mật lệnh', baiLam: bai(['a = []', 'for i in range(3):', '    go_right()', '    m = color("up")', '    a.append(m)', 'for c in a:', '    if c == "red":', '        go_down()', '    else:', '        go_right()']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Nhà đỏ là bay xuống: go_down() phải nằm trong nhánh if c == "red":.', 'Phần ghi mật lệnh đã đúng, chỉ phần đi theo mật lệnh sai.']
    }),

    man({
      so: 10, ten: 'Gieo hạt theo số nhà đỏ', hang: 'trum', nam: true, bienDem: true, hamCuaEmCan: [], khung: { chinh: 12, moiHam: 10 },
      deBai: 'Cuối phố là lối xuống vườn ươm: có bao nhiêu nhà đỏ trong ba nhà phía trên phố thì ô gieo hạt vàng nằm ở hàng dưới thứ bấy nhiêu. ' +
        'Bay qua ba nhà và đếm nhà đỏ, rồi bay xuống đúng số hàng để gieo hạt vàng.',
      veMaMau: 'Chương trình có sẵn đếm nhà đỏ. Viết tiếp: bay xuống n hàng, nạp hạt vàng rồi chấm.',
      san: [['.rrg', '....', '###.', '###.'], ['.grb', '....', '###.', '###.']],
      hinh: [['....', '....', '....', '...y'], ['....', '....', '...y', '....']],
      batDau: { x: 0, y: 1 },
      maMau: bai(['n = 0', 'for i in range(3):', '    go_right()', '    m = color("up")', '    if m == "red":', '        n = n + 1']),
      loiGiai: bai(['n = 0', 'for i in range(3):', '    go_right()', '    m = color("up")', '    if m == "red":', '        n = n + 1', 'for i in range(n):', '    go_down()', 'ink("yellow")', 'dot()', 'wait()']),
      sao: { o: 10, nhip: 6 },
      loiSai: [
        { moTa: 'Quên chấm hạt ở cuối luống', baiLam: bai(['n = 0', 'for i in range(3):', '    go_right()', '    m = color("up")', '    if m == "red":', '        n = n + 1', 'for i in range(n):', '    go_down()']), phaiCoMa: [] },
        { moTa: 'Bay xuống cố định hai hàng: sân thứ hai gieo nhầm hàng', baiLam: bai(['n = 0', 'for i in range(3):', '    go_right()', '    m = color("up")', '    if m == "red":', '        n = n + 1', 'go_down()', 'go_down()', 'ink("yellow")', 'dot()', 'wait()']), phaiCoMa: ['to-thua'] }
      ],
      goiY: ['Bay xuống bằng vòng for i in range(n): như màn Đếm nhà đỏ.', 'Tới đúng hàng thì ink("yellow"), dot() rồi wait().']
    }),

    /* ================================================= chương che-pho-mau "Chế lệnh: qua phố" ================================================= */
    manChe({
      so: 1, ten: 'Hàm tìm thẻ', hang: 'lam-quen', nam: true, taoHam: ['find_bag'], hamCuaEmCan: [],
      deBai: 'Chương trình chính đã khóa: find_bag() rồi gieo hạt cùng màu vào ô ngay sau thẻ. Chế find_bag(): bay sang phải cho tới khi camera thấy thẻ ở ô bên phải. Hai sân, thẻ nằm xa gần khác nhau.',
      veMaMau: 'Mở Xưởng hàm, tạo find_bag() không có đối số. Thân hàm là vòng while như màn Tìm thẻ trên luống.',
      san: [['...y..'], ['..g...']],
      hinh: [['....y.'], ['...g..']],
      batDau: { x: 0, y: 0 },
      maMau: bai(C_TIM),
      loiGiai: bai(C_TIM, { hamCuaEmMoi: [H('find_bag', [], T_TIM)] }),
      sao: { o: 8, nhip: 5 },
      congThucKhac: [{ moTa: 'Điều kiện viết ngược lại bằng not', hamCuaEmMoi: [H('find_bag', [], ['m = color("right")', 't = m != "none"', 'while not t:', '    go_right()', '    m = color("right")', '    t = m != "none"'])] }],
      loiSai: [
        { moTa: 'Gọi find_bag() mà chưa chế hàm', baiLam: bai(C_TIM), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'find_bag() bay cố định hai ô: sân thứ hai bay quá thẻ', baiLam: bai(C_TIM), hamCuaEmMoi: [H('find_bag', [], ['go_right()', 'go_right()'])], phaiCoMa: ['mau-son-sai'] }
      ],
      goiY: ['Ô luống trống có màu "none"; thẻ có màu.', 'Hàm dừng đúng lúc thẻ nằm bên phải drone.']
    }),

    manChe({
      so: 2, ten: 'Bay tới màu', hang: 'lam-quen', taoHam: ['fly_to'], hamCuaEmCan: [],
      deBai: 'Chế fly_to(col): bay sang phải cho tới khi ô bên phải có màu col. Chương trình chính gọi fly_to("yellow") rồi bay thêm một ô vào cờ vàng. Hai sân, cờ vàng ở hai chỗ, giữa đường có ô màu khác.',
      veMaMau: 'Tạo fly_to với một đối số col. So color("right") với col, không so với một màu viết sẵn.',
      san: [['.r.gF'], ['.gF.r']],
      mau: [['....y'], ['..y..']],
      batDau: { x: 0, y: 0 },
      mucTieu: 'toi-co',
      maMau: bai(C_BAY),
      loiGiai: bai(C_BAY, { hamCuaEmMoi: [H('fly_to', ['col'], T_BAY)] }),
      sao: { o: 4, nhip: 4 },
      congThucKhac: [{ moTa: 'So bằng not và ==', hamCuaEmMoi: [H('fly_to', ['col'], ['m = color("right")', 't = m == col', 'while not t:', '    go_right()', '    m = color("right")', '    t = m == col'])] }],
      loiSai: [
        { moTa: 'Gọi fly_to mà chưa chế hàm', baiLam: bai(C_BAY), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Bay tới ô có màu bất kỳ: dừng ở ô đỏ, ô xanh', baiLam: bai(C_BAY), hamCuaEmMoi: [H('fly_to', ['col'], ['m = color("right")', 'while m == "none":', '    go_right()', '    m = color("right")'])], phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Điều kiện while là: màu bên phải còn KHÁC col.', 'Chương trình chính truyền "yellow" vào col.']
    }),

    manChe({
      so: 3, ten: 'Hàm ghi mật lệnh', hang: 'lam-quen', taoHam: ['read_row'], hamCuaEmCan: [],
      deBai: 'Chế read_row(a, n): bay sang phải n ô, mỗi ô ghi màu ngôi nhà phía trên vào cuối danh sách a. Chương trình chính đã khóa: ghi mật lệnh hai nhà rồi đi theo (đỏ là xuống, màu khác là sang phải).',
      veMaMau: 'Tạo read_row với hai đối số a và n. Thân hàm giống phần ghi mật lệnh ở màn Mật lệnh màu.',
      san: [['.rr##', '.....', '##.##', '##F##'], ['.gg##', '....F', '##.##', '##.##']],
      batDau: { x: 0, y: 1 },
      mucTieu: 'toi-co',
      maMau: bai(C_GHI),
      loiGiai: bai(C_GHI, { hamCuaEmMoi: [H('read_row', ['a', 'n'], T_GHI)] }),
      sao: { o: 10, nhip: 4 },
      congThucKhac: [{ moTa: 'Ghi màu vào biến rồi mới thêm vào danh sách', hamCuaEmMoi: [H('read_row', ['a', 'n'], ['for i in range(n):', '    go_right()', '    c = color("up")', '    a.append(c)'])] }],
      loiSai: [
        { moTa: 'Gọi read_row mà chưa chế hàm', baiLam: bai(C_GHI), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Ghi màu trước khi bay sang nhà: mật lệnh lệch một nhà', baiLam: bai(C_GHI), hamCuaEmMoi: [H('read_row', ['a', 'n'], ['for i in range(n):', '    m = color("up")', '    a.append(m)', '    go_right()'])], phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Mỗi vòng: bay sang một ô rồi mới đọc nhà phía trên.', 'a.append(…) thêm vào cuối danh sách a mà chương trình chính đưa vào.']
    }),

    manChe({
      so: 4, ten: 'Hàm đi theo mật lệnh', hang: 'luyen', taoHam: ['follow_code'], hamCuaEmCan: ['read_row'],
      deBai: 'Chế follow_code(a): duyệt từng màu trong a, đỏ thì bay xuống, màu khác thì bay sang phải. Chương trình chính đã khóa: ghi mật lệnh ba nhà bằng read_row rồi gọi follow_code.',
      veMaMau: 'Tạo follow_code với một đối số a. Thân hàm là vòng for c in a: có if / else bên trong.',
      san: [['.rgr..', '......', '###..#', '####F#'], ['.grg..', '......', '###..F', '######']],
      batDau: { x: 0, y: 1 },
      mucTieu: 'toi-co',
      maMau: bai(C_THEO),
      loiGiai: bai(C_THEO, { hamCuaEmMoi: [H('follow_code', ['a'], T_THEO)] }),
      sao: { o: 11, nhip: 6 },
      congThucKhac: [{ moTa: 'Hỏi màu khác đỏ trước', hamCuaEmMoi: [H('follow_code', ['a'], ['for c in a:', '    if c != "red":', '        go_right()', '    else:', '        go_down()'])] }],
      loiSai: [
        { moTa: 'Gọi follow_code mà chưa chế hàm', baiLam: bai(C_THEO), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Đảo hai nhánh: đi ngược mật lệnh', baiLam: bai(C_THEO), hamCuaEmMoi: [H('follow_code', ['a'], ['for c in a:', '    if c == "red":', '        go_right()', '    else:', '        go_down()'])], phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['for c in a: lấy lần lượt từng màu mà read_row đã ghi.', 'Mỗi màu là đúng một bước bay.']
    }),

    manChe({
      so: 5, ten: 'Hàm bay xuống gieo', hang: 'luyen', nam: true, bienDem: true, taoHam: ['drop_down'], hamCuaEmCan: [],
      deBai: 'Như màn Gieo hạt theo số nhà đỏ, nhưng phần bay xuống gieo nằm trong hàm. Chế drop_down(n): bay xuống n hàng rồi gieo hạt vàng tại chỗ. Chương trình chính đã khóa: đếm nhà đỏ vào n rồi gọi drop_down(n).',
      veMaMau: 'Tạo drop_down với một đối số n. Thân hàm: lặp n lần bay xuống, nạp hạt vàng, chấm rồi chờ.',
      san: [['.rrg', '....', '###.', '###.'], ['.grb', '....', '###.', '###.']],
      hinh: [['....', '....', '....', '...y'], ['....', '....', '...y', '....']],
      batDau: { x: 0, y: 1 },
      maMau: bai(C_THA),
      loiGiai: bai(C_THA, { hamCuaEmMoi: [H('drop_down', ['n'], T_THA)] }),
      sao: { o: 11, nhip: 6 },
      congThucKhac: [{ moTa: 'Bay xuống bằng go_down() trong while đếm ngược', hamCuaEmMoi: [H('drop_down', ['n'], ['while n > 0:', '    go_down()', '    n = n - 1', 'ink("yellow")', 'dot()', 'wait()'])] }],
      loiSai: [
        { moTa: 'Gọi drop_down mà chưa chế hàm', baiLam: bai(C_THA), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Bay xuống hai hàng cố định: sân thứ hai gieo nhầm hàng', baiLam: bai(C_THA), hamCuaEmMoi: [H('drop_down', ['n'], ['go_down()', 'go_down()', 'ink("yellow")', 'dot()', 'wait()'])], phaiCoMa: ['to-thua'] }
      ],
      goiY: ['Số hàng bay xuống chính là n mà chương trình chính đưa vào.', 'Bay xuống xong mới chấm hạt vàng.']
    }),

    manChe({
      so: 6, ten: 'Hàm gieo theo thẻ', hang: 'luyen', nam: true, taoHam: ['place_bag'], hamCuaEmCan: ['find_bag'],
      deBai: 'Chế place_bag(): đọc màu thẻ bên phải, nạp màu rồi bay tới gieo đúng ô (ô xanh dương ngay sau thẻ, ô đỏ xa thêm một ô). Chương trình chính đã khóa: find_bag() rồi place_bag().',
      veMaMau: 'Tạo place_bag() không có đối số. Thân hàm giống chương trình của màn Thẻ nào cũng đúng.',
      san: [['...r..'], ['.b....']],
      hinh: [['.....r'], ['..b...']],
      batDau: { x: 0, y: 0 },
      maMau: bai(C_XEP),
      loiGiai: bai(C_XEP, { hamCuaEmMoi: [H('place_bag', [], CHO_1)] }),
      sao: { o: 12, nhip: 6 },
      congThucKhac: [{ moTa: 'Hỏi thẻ khác xanh dương', hamCuaEmMoi: [H('place_bag', [], ['c = color("right")', 'ink(c)', 'go_right()', 'go_right()', 'if c != "blue":', '    go_right()', 'dot()', 'wait()'])] }],
      loiSai: [
        { moTa: 'Gọi place_bag() mà chưa chế hàm', baiLam: bai(C_XEP), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Không đọc màu: thẻ nào cũng gieo ở ô xanh', baiLam: bai(C_XEP), hamCuaEmMoi: [H('place_bag', [], ['ink("blue")', 'go_right()', 'go_right()', 'dot()', 'wait()'])], phaiCoMa: ['to-thua'] }
      ],
      goiY: ['Đọc màu thẻ NGAY đầu hàm, khi thẻ còn ở bên phải.', 'Thẻ đỏ bay thêm một ô so với thẻ xanh.']
    }),

    manChe({
      so: 7, ten: 'Sửa hàm dò phố', hang: 'bien-the', nam: true, hamCuaEmCan: ['place_bag'],
      deBai: 'Hàm của màn scan_path() phải bay tới khi gặp thẻ mẫu, nhưng điều kiện viết ngược nên drone không bay ô nào. Sửa scan_path(); chương trình chính đã khóa: scan_path() rồi place_bag().',
      veMaMau: 'Chạy thử: drone đứng yên và gieo lệch. Mở scan_path() trong Xưởng hàm, đổi phép so sánh.',
      san: [['....b..'], ['..r....']],
      hinh: [['.....b.'], ['....r..']],
      batDau: { x: 0, y: 0 },
      maMau: bai(['scan_path()', 'place_bag()'], { hamCuaMan: [H('scan_path', [], ['m = color("right")', 'while m != "none":', '    go_right()', '    m = color("right")'])] }),
      loiGiai: bai(['scan_path()', 'place_bag()'], { hamCuaMan: [H('scan_path', [], ['m = color("right")', 'while m == "none":', '    go_right()', '    m = color("right")'])] }),
      sao: { o: 12, nhip: 6 },
      loiSai: [
        { moTa: 'Không sửa: drone không bay tới thẻ, nạp nhầm màu "none"', baiLam: bai(['scan_path()', 'place_bag()'], { hamCuaMan: [H('scan_path', [], ['m = color("right")', 'while m != "none":', '    go_right()', '    m = color("right")'])] }), phaiCoMa: ['mau-son-sai'] }
      ],
      goiY: ['Còn bay khi ô bên phải TRỐNG, tức là màu bằng "none".', 'Chỉ cần đổi != thành ==.']
    }),

    manChe({
      so: 8, ten: 'Đếm bằng danh sách', hang: 'bien-the', nam: true, taoHam: ['red_count'], hamCuaEmCan: ['drop_down'],
      deBai: 'Đếm nhà đỏ mà không cần biến đếm: chế red_count(a, n) bay qua n nhà, gặp nhà đỏ thì ghi "red" vào a. Số nhà đỏ là len(a). Chương trình chính đã khóa: red_count(a, 3) rồi drop_down(len(a)).',
      veMaMau: 'Tạo red_count với hai đối số a và n. Mỗi nhà đỏ ghi đúng một lần a.append("red").',
      san: [['.rrr', '....', '###.', '###.', '###.'], ['.gbr', '....', '###.', '###.', '###.']],
      hinh: [['....', '....', '....', '....', '...y'], ['....', '....', '...y', '....', '....']],
      batDau: { x: 0, y: 1 },
      maMau: bai(C_DEM),
      loiGiai: bai(C_DEM, { hamCuaEmMoi: [H('red_count', ['a', 'n'], T_DEM)] }),
      sao: { o: 12, nhip: 7 },
      congThucKhac: [{ moTa: 'Thêm số 1 thay cho màu: len(a) vẫn đúng', hamCuaEmMoi: [H('red_count', ['a', 'n'], ['for i in range(n):', '    go_right()', '    m = color("up")', '    if m == "red":', '        a.append(1)'])] }],
      loiSai: [
        { moTa: 'Gọi red_count mà chưa chế hàm', baiLam: bai(C_DEM), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Thêm mọi nhà vào a: len(a) luôn là 3', baiLam: bai(C_DEM), hamCuaEmMoi: [H('red_count', ['a', 'n'], ['for i in range(n):', '    go_right()', '    m = color("up")', '    a.append(m)'])], phaiCoMa: ['to-thua'] }
      ],
      goiY: ['len(a) là số phần tử của a.', 'Chỉ thêm vào a khi color("up") == "red".']
    }),

    manChe({
      so: 9, ten: 'Sửa hàm đi mật lệnh', hang: 'bien-the', hamCuaEmCan: ['read_row'],
      deBai: 'Mật lệnh bốn nhà. Hàm của màn walk_code(a) đi ngược luật (đỏ phải là bay xuống). Sửa walk_code(a); chương trình chính đã khóa: read_row(a, 4) rồi walk_code(a).',
      veMaMau: 'Chạy thử ở sân thứ nhất: nhà đầu đỏ mà drone bay sang phải. Đổi lại hai nhánh trong walk_code.',
      san: [['.rbrr###', '......##', '####....', '#####.##', '#####F##'], ['.grgg###', '......##', '####...F', '#####.##', '#####.##']],
      batDau: { x: 0, y: 1 },
      mucTieu: 'toi-co',
      maMau: bai(['a = []', 'read_row(a, 4)', 'walk_code(a)'], { hamCuaMan: [H('walk_code', ['a'], ['for c in a:', '    if c == "red":', '        go_right()', '    else:', '        go_down()'])] }),
      loiGiai: bai(['a = []', 'read_row(a, 4)', 'walk_code(a)'], { hamCuaMan: [H('walk_code', ['a'], T_THEO)] }),
      sao: { o: 11, nhip: 8 },
      loiSai: [
        { moTa: 'Không sửa: đi ngược mật lệnh', baiLam: bai(['a = []', 'read_row(a, 4)', 'walk_code(a)'], { hamCuaMan: [H('walk_code', ['a'], ['for c in a:', '    if c == "red":', '        go_right()', '    else:', '        go_down()'])] }), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Nhà đỏ là bay xuống.', 'Đổi chỗ go_right() và go_down() giữa hai nhánh.']
    }),

    manChe({
      so: 10, ten: 'Thành phố mật lệnh', hang: 'trum', nam: true, chinhCoDinh: false, hamCuaEmCan: ['read_row', 'follow_code', 'place_bag'],
      deBai: 'Ba ngôi nhà đầu phố là mật lệnh dẫn tới chỗ thẻ mẫu. Ghi mật lệnh, đi theo nó, tới nơi thì thẻ nằm ngay bên phải: gieo hạt đúng ô màu bằng place_bag(). ' +
        'Tự viết chương trình chính, chỉ dùng các hàm em đã chế. Hai sân, mật lệnh và màu thẻ khác nhau.',
      veMaMau: 'Chương trình có sẵn mới ghi mật lệnh. Viết tiếp bằng follow_code và place_bag.',
      san: [['.rgr#####', '.....####', '###..####', '####.r..#'], ['.grg#####', '.....####', '####..b..', '#########']],
      hinh: [['.........', '.........', '.........', '.......r.'], ['.........', '.........', '.......b.', '.........']],
      batDau: { x: 0, y: 1 },
      maMau: bai(['a = []', 'read_row(a, 3)']),
      loiGiai: bai(['a = []', 'read_row(a, 3)', 'follow_code(a)', 'place_bag()']),
      sao: { o: 20, nhip: 10 },
      loiSai: [
        { moTa: 'Quên đi theo mật lệnh: drone đứng đầu phố, nạp nhầm màu "none"', baiLam: bai(['a = []', 'read_row(a, 3)', 'place_bag()']), phaiCoMa: ['mau-son-sai'] },
        { moTa: 'Đi theo mật lệnh mà không gieo hạt', baiLam: bai(['a = []', 'read_row(a, 3)', 'follow_code(a)']), phaiCoMa: [] }
      ],
      goiY: ['Ba hàm, đúng thứ tự: ghi mật lệnh, đi theo, gieo hạt theo thẻ.', 'follow_code(a) dừng đúng chỗ thẻ nằm bên phải drone.']
    })
  ];

  ManHoc.manPhoMau = DS;
  if (laNode) module.exports = ManHoc;
})();
