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
  var NC = ['magnet_n', 'magnet_s', 'magnet_off'];
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  function bai(chinh, them) { return Object.assign({ chinh: chinh.slice() }, them || {}); }
  function thut(ds) { return ds.map(function (s) { return '    ' + s; }); }

  /** Drone gắn camera bốn hướng (color("up") …); m.nam: true thì treo thêm nam châm (chở hộp màu tới đích cùng màu). */
  function man(m) {
    var nam = m.nam;
    delete m.nam;
    m.chuong = m.chuong || 'pho-mau';
    m.cauTruc = ['for', 'if', 'while', 'list'];
    m.loaiRobot = 'drone';
    m.robot = { than: 'drone', tay: nam ? 'nam-cham' : null, camBien: [{ ma: 'camera-4', o: 'tren' }] };
    m.hamGoc = m.hamGoc || nhieu(BAY, nam ? NC : [], ['color']);
    if (nam) { m.mucTieu = 'dua-vat'; m.vatCan = 'sat'; m.nhipTheoLoiGiai = true; }
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = m.khung || { chinh: 10, moiHam: 10 };
    m.loiSai = m.loiSai || [];
    return ManHoc.chuanHoa(m);
  }

  // Chở một hộp: đọc màu hộp bên phải, bay tới, hút; hộp đỏ thì bay thêm một ô (đích đỏ ở xa hơn đích xanh), thả.
  var CHO_1 = ['c = color("right")', 'go_right()', 'magnet_n()', 'wait()', 'go_right()', 'if c == "red":', '    go_right()', 'magnet_off()', 'wait()'];
  var DO_DUONG = ['for i in range(6):', '    if color("right") == "green":', '        go_right()', '    else:', '        go_down()'];
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  /** Màn chương che-pho-mau: chương trình chính khóa, em chế hàm (như che-may-son). */
  function manChe(m) { m.chuong = 'che-pho-mau'; if (m.chinhCoDinh !== false) m.chinhCoDinh = true; else delete m.chinhCoDinh; return man(m); }
  var T_TIM = ['while color("right") == "none":', '    go_right()'];
  var C_TIM = ['find_box()', 'go_right()', 'magnet_n()', 'wait()', 'go_right()', 'magnet_off()', 'wait()'];
  var T_BAY = ['while color("right") != col:', '    go_right()'];
  var C_BAY = ['fly_to("yellow")', 'go_right()'];
  var T_GHI = ['for i in range(n):', '    go_right()', '    a.append(color("up"))'];
  var C_GHI = ['a = []', 'read_row(a, 2)', 'for c in a:', '    if c == "red":', '        go_down()', '    else:', '        go_right()'];
  var T_THEO = ['for c in a:', '    if c == "red":', '        go_down()', '    else:', '        go_right()'];
  var C_THEO = ['a = []', 'read_row(a, 3)', 'follow_code(a)'];
  var T_THA = ['magnet_n()', 'wait()', 'for i in range(n):', '    go_down()', 'magnet_off()', 'wait()'];
  var C_THA = ['n = 0', 'for i in range(3):', '    go_right()', '    if color("up") == "red":', '        n = n + 1', 'drop_down(n)'];
  var T_DEM = ['for i in range(n):', '    go_right()', '    if color("up") == "red":', '        a.append(1)'];
  var C_DEM = ['a = []', 'red_count(a, 3)', 'drop_down(len(a))'];
  var C_XEP = ['find_box()', 'place_box()'];

  var DS = [
    man({
      so: 1, ten: 'Hộp về đúng màu', hang: 'lam-quen', nam: true, chiChay: true, chinhCoDinh: true, hamCuaEmCan: [],
      deBai: 'Phố màu có hộp màu và ô đích màu: ô đích chỉ nhận hộp CÙNG MÀU. Camera bốn hướng nhìn ô bên cạnh: color("right") đọc màu hộp bên phải drone. ' +
        'Bấm Chạy xem drone đọc màu hộp, hút hộp, rồi chở tới đúng ô đích đỏ.',
      veMaMau: 'Chương trình đã viết sẵn và khoá. Bấm Chạy, nhìn tia camera đọc màu hộp trước khi drone bay tới.',
      san: ['.oDD'],
      mau: ['..br'],
      vatMau: ['.r..'],
      vatChat: ['.s..'],
      batDau: { x: 0, y: 0 },
      maMau: bai(CHO_1),
      loiGiai: bai(CHO_1),
      sao: { o: 9, nhip: 5 },
      goiY: ['color("right") không tốn nhịp: đọc trước rồi mới bay.', 'Ô đích xanh dương không nhận hộp đỏ.']
    }),

    man({
      so: 2, ten: 'Hộp nào cũng đúng', hang: 'lam-quen', nam: true, hamCuaEmCan: [],
      deBai: 'Hai phố giống nhau, chỉ khác màu hộp: phố thứ nhất hộp đỏ, phố thứ hai hộp xanh dương. Cùng một chương trình phải đưa hộp về đúng ô đích ở cả hai phố. ' +
        'Đọc màu hộp bằng color("right") trước khi bay tới.',
      veMaMau: 'Chương trình có sẵn lúc nào cũng chở hộp tới ô đỏ: đúng ở phố thứ nhất, sai ở phố thứ hai. Thêm phần đọc màu và chọn đường.',
      san: [['.oDD'], ['.oDD']],
      mau: [['..br'], ['..br']],
      vatMau: [['.r..'], ['.b..']],
      vatChat: [['.s..'], ['.s..']],
      batDau: { x: 0, y: 0 },
      maMau: bai(['go_right()', 'magnet_n()', 'wait()', 'go_right()', 'go_right()', 'magnet_off()', 'wait()']),
      loiGiai: bai(CHO_1),
      sao: { o: 9, nhip: 5 },
      loiSai: [
        { moTa: 'Không đọc màu: hộp xanh bị chở tới ô đỏ', baiLam: bai(['go_right()', 'magnet_n()', 'wait()', 'go_right()', 'go_right()', 'magnet_off()', 'wait()']), phaiCoMa: [] },
        { moTa: 'Đọc màu SAU khi đã bay tới hộp: bên phải lúc đó là ô đích', baiLam: bai(['go_right()', 'c = color("right")', 'magnet_n()', 'wait()', 'go_right()', 'if c == "red":', '    go_right()', 'magnet_off()', 'wait()']), phaiCoMa: [] }
      ],
      goiY: ['Đọc màu khi hộp còn nằm bên phải drone.', 'Ghi màu vào biến c, rồi dùng if c == "red": để bay thêm một ô.']
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
      loiGiai: bai(['if color("up") == "green":', '    go_up()', 'else:', '    go_down()', 'for i in range(3):', '    go_right()']),
      sao: { o: 6, nhip: 4 },
      loiSai: [
        { moTa: 'Luôn rẽ lên: sân thứ hai vào phố cấm, không tới cờ', baiLam: bai(['go_up()', 'for i in range(3):', '    go_right()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Hỏi nhầm hướng color("right"): bên phải là tường, luôn rẽ xuống', baiLam: bai(['if color("right") == "green":', '    go_up()', 'else:', '    go_down()', 'for i in range(3):', '    go_right()']), phaiCoMa: ['chua-toi-co'] }
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
        { moTa: 'Hỏi ô bên dưới thay vì bên phải: rẽ sai ngay bước đầu', baiLam: bai(['for i in range(6):', '    if color("down") == "green":', '        go_right()', '    else:', '        go_down()']), phaiCoMa: [] }
      ],
      goiY: ['Mỗi bước chỉ có hai lựa chọn: phải hoặc xuống.', 'Ở mép phải sân, ô bên phải nằm ngoài sân: color("right") là "none", nên drone bay xuống.']
    }),

    man({
      so: 5, ten: 'Tìm hộp trên phố', hang: 'luyen', nam: true, hamCuaEmCan: [],
      deBai: 'Hộp nằm đâu đó trên phố, xa gần mỗi sân một khác; ô đích nằm ngay sau hộp. Bay sang phải cho tới khi camera thấy hộp ở ô bên phải, rồi chở hộp tới ô đích.',
      veMaMau: 'Chương trình có sẵn bay đúng hai ô rồi mới hút: đúng ở sân thứ nhất. Dùng while với color("right") để bay cho tới khi gặp hộp.',
      san: [['...oD.'], ['..oD..']],
      vatMau: [['...y..'], ['..g...']],
      vatChat: [['...s..'], ['..s...']],
      batDau: { x: 0, y: 0 },
      maMau: bai(['go_right()', 'go_right()', 'go_right()', 'magnet_n()', 'wait()', 'go_right()', 'magnet_off()', 'wait()']),
      loiGiai: bai(['while color("right") == "none":', '    go_right()', 'go_right()', 'magnet_n()', 'wait()', 'go_right()', 'magnet_off()', 'wait()']),
      sao: { o: 8, nhip: 6 },
      loiSai: [
        { moTa: 'Bay một số ô cố định: sân thứ hai bay quá hộp', baiLam: bai(['go_right()', 'go_right()', 'go_right()', 'magnet_n()', 'wait()', 'go_right()', 'magnet_off()', 'wait()']), phaiCoMa: [] },
        { moTa: 'Điều kiện ngược (!=): drone không bay ô nào', baiLam: bai(['while color("right") != "none":', '    go_right()', 'go_right()', 'magnet_n()', 'wait()', 'go_right()', 'magnet_off()', 'wait()']), phaiCoMa: [] }
      ],
      goiY: ['Ô phố trống không có màu: color("right") là "none". Hộp có màu.', 'Hết vòng while thì hộp nằm ngay bên phải drone.']
    }),

    man({
      so: 6, ten: 'Tìm hộp, chọn đích', hang: 'luyen', nam: true, hamCuaEmCan: [], khung: { chinh: 12, moiHam: 10 },
      deBai: 'Tìm hộp như màn trước, rồi đưa về đúng ô đích: sau hộp là ô đích xanh dương, xa thêm một ô là ô đích đỏ. Mỗi sân hộp nằm một chỗ, màu một khác.',
      veMaMau: 'Chương trình có sẵn đã tìm được hộp. Thêm phần đọc màu hộp và chọn ô đích.',
      san: [['...oDD'], ['.oDD..']],
      mau: [['....br'], ['..br..']],
      vatMau: [['...r..'], ['.b....']],
      vatChat: [['...s..'], ['.s....']],
      batDau: { x: 0, y: 0 },
      maMau: bai(['while color("right") == "none":', '    go_right()', 'go_right()', 'magnet_n()', 'wait()', 'go_right()', 'magnet_off()', 'wait()']),
      loiGiai: bai(['while color("right") == "none":', '    go_right()', 'c = color("right")', 'go_right()', 'magnet_n()', 'wait()', 'go_right()', 'if c == "red":', '    go_right()', 'magnet_off()', 'wait()']),
      sao: { o: 11, nhip: 7 },
      loiSai: [
        { moTa: 'Không đọc màu hộp: hộp đỏ bị thả xuống ô xanh', baiLam: bai(['while color("right") == "none":', '    go_right()', 'go_right()', 'magnet_n()', 'wait()', 'go_right()', 'magnet_off()', 'wait()']), phaiCoMa: [] }
      ],
      goiY: ['Đọc màu ngay khi vòng while vừa dừng: lúc đó hộp nằm bên phải.', 'Hộp đỏ đi thêm một ô so với hộp xanh.']
    }),

    man({
      so: 7, ten: 'Đếm nhà đỏ', hang: 'bien-the', bienDem: true, hamCuaEmCan: [],
      deBai: 'Dãy ba ngôi nhà nằm phía trên phố. Đếm số nhà màu đỏ khi bay ngang qua: có bao nhiêu nhà đỏ thì cờ nằm ở tầng hầm thứ bấy nhiêu, phía dưới cuối phố.',
      veMaMau: 'Chương trình có sẵn đã có biến n = 0 và bay qua ba nhà. Mỗi lần thấy nhà đỏ ở phía trên thì cộng n thêm 1, cuối cùng bay xuống n tầng.',
      san: [['.rgr', '....', '###.', '###F'], ['.grb', '....', '###F', '###.']],
      batDau: { x: 0, y: 1 },
      mucTieu: 'toi-co',
      maMau: bai(['n = 0', 'for i in range(3):', '    go_right()', 'for i in range(n):', '    go_down()']),
      loiGiai: bai(['n = 0', 'for i in range(3):', '    go_right()', '    if color("up") == "red":', '        n = n + 1', 'for i in range(n):', '    go_down()']),
      sao: { o: 7, nhip: 5 },
      loiSai: [
        { moTa: 'Đếm nhà xanh lá thay vì nhà đỏ', baiLam: bai(['n = 0', 'for i in range(3):', '    go_right()', '    if color("up") == "green":', '        n = n + 1', 'for i in range(n):', '    go_down()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đọc màu trước khi bay sang nhà: đếm lệch một nhà', baiLam: bai(['n = 0', 'for i in range(3):', '    if color("up") == "red":', '        n = n + 1', '    go_right()', 'for i in range(n):', '    go_down()']), phaiCoMa: ['chua-toi-co'] }
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
      maMau: bai(['a = []', 'for i in range(3):', '    go_right()', '    a.append(color("up"))']),
      loiGiai: bai(['a = []', 'for i in range(3):', '    go_right()', '    a.append(color("up"))', 'for c in a:', '    if c == "red":', '        go_down()', '    else:', '        go_right()']),
      sao: { o: 9, nhip: 6 },
      loiSai: [
        { moTa: 'Đi ngược mật lệnh (đỏ là sang phải)', baiLam: bai(['a = []', 'for i in range(3):', '    go_right()', '    a.append(color("up"))', 'for c in a:', '    if c == "red":', '        go_right()', '    else:', '        go_down()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đọc ô dưới thay vì nhà phía trên: mật lệnh toàn "none"', baiLam: bai(['a = []', 'for i in range(3):', '    go_right()', '    a.append(color("down"))', 'for c in a:', '    if c == "red":', '        go_down()', '    else:', '        go_right()']), phaiCoMa: ['chua-toi-co'] }
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
      maMau: bai(['a = []', 'for i in range(4):', '    go_right()', '    a.append(color("up"))', 'for c in a:', '    if c == "red":', '        go_right()', '    else:', '        go_down()']),
      loiGiai: bai(['a = []', 'for i in range(4):', '    go_right()', '    a.append(color("up"))', 'for c in a:', '    if c == "red":', '        go_down()', '    else:', '        go_right()']),
      sao: { o: 9, nhip: 8 },
      loiSai: [
        { moTa: 'Không sửa gì: đi ngược mật lệnh', baiLam: bai(['a = []', 'for i in range(4):', '    go_right()', '    a.append(color("up"))', 'for c in a:', '    if c == "red":', '        go_right()', '    else:', '        go_down()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Chỉ đọc ba nhà: thiếu một bước mật lệnh', baiLam: bai(['a = []', 'for i in range(3):', '    go_right()', '    a.append(color("up"))', 'for c in a:', '    if c == "red":', '        go_down()', '    else:', '        go_right()']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Nhà đỏ là bay xuống: go_down() phải nằm trong nhánh if c == "red":.', 'Phần ghi mật lệnh đã đúng, chỉ phần đi theo mật lệnh sai.']
    }),

    man({
      so: 10, ten: 'Giao hàng theo số nhà đỏ', hang: 'trum', nam: true, bienDem: true, hamCuaEmCan: [], khung: { chinh: 12, moiHam: 10 },
      deBai: 'Cuối phố có một hộp hàng. Khách ở tầng hầm: có bao nhiêu nhà đỏ trong ba nhà phía trên phố thì ô đích nằm ở tầng hầm thứ bấy nhiêu. ' +
        'Bay qua ba nhà và đếm nhà đỏ, hút hộp ngay dưới drone ở cuối phố, bay xuống đúng số tầng rồi thả.',
      veMaMau: 'Chương trình có sẵn đếm nhà đỏ. Viết tiếp: hút hộp, bay xuống n tầng, thả hộp.',
      san: [['.rrg', '...o', '###.', '###D'], ['.grb', '...o', '###D', '###.']],
      vatChat: [['....', '...s', '....', '....'], ['....', '...s', '....', '....']],
      vatMau: [['....', '...y', '....', '....'], ['....', '...y', '....', '....']],
      batDau: { x: 0, y: 1 },
      maMau: bai(['n = 0', 'for i in range(3):', '    go_right()', '    if color("up") == "red":', '        n = n + 1']),
      loiGiai: bai(['n = 0', 'for i in range(3):', '    go_right()', '    if color("up") == "red":', '        n = n + 1', 'magnet_n()', 'wait()', 'for i in range(n):', '    go_down()', 'magnet_off()', 'wait()']),
      sao: { o: 11, nhip: 7 },
      loiSai: [
        { moTa: 'Quên bật nam châm: hộp nằm lại cuối phố', baiLam: bai(['n = 0', 'for i in range(3):', '    go_right()', '    if color("up") == "red":', '        n = n + 1', 'for i in range(n):', '    go_down()', 'magnet_off()', 'wait()']), phaiCoMa: [] },
        { moTa: 'Bay xuống cố định hai tầng: sân thứ hai thả nhầm tầng', baiLam: bai(['n = 0', 'for i in range(3):', '    go_right()', '    if color("up") == "red":', '        n = n + 1', 'magnet_n()', 'wait()', 'go_down()', 'go_down()', 'magnet_off()', 'wait()']), phaiCoMa: [] }
      ],
      goiY: ['Hộp nằm ngay dưới drone ở cuối phố: bật nam châm rồi wait() là hút.', 'Bay xuống bằng vòng for i in range(n): như màn Đếm nhà đỏ.']
    }),

    /* ================================================= chương che-pho-mau "Chế lệnh: qua phố" ================================================= */
    manChe({
      so: 1, ten: 'Hàm tìm hộp', hang: 'lam-quen', nam: true, taoHam: ['find_box'], hamCuaEmCan: [],
      deBai: 'Chương trình chính đã khóa: find_box() rồi chở hộp sang ô đích ngay sau. Chế find_box(): bay sang phải cho tới khi camera thấy hộp ở ô bên phải. Hai sân, hộp nằm xa gần khác nhau.',
      veMaMau: 'Mở Xưởng hàm, tạo find_box() không có đối số. Thân hàm là vòng while như màn Tìm hộp trên phố.',
      san: [['...oD.'], ['..oD..']],
      vatMau: [['...y..'], ['..g...']],
      vatChat: [['...s..'], ['..s...']],
      batDau: { x: 0, y: 0 },
      maMau: bai(C_TIM),
      loiGiai: bai(C_TIM, { hamCuaEmMoi: [H('find_box', [], T_TIM)] }),
      sao: { o: 9, nhip: 6 },
      congThucKhac: [{ moTa: 'Điều kiện viết ngược lại bằng not', hamCuaEmMoi: [H('find_box', [], ['while not color("right") != "none":', '    go_right()'])] }],
      loiSai: [
        { moTa: 'Gọi find_box() mà chưa chế hàm', baiLam: bai(C_TIM), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'find_box() bay cố định hai ô: sân thứ hai bay quá hộp', baiLam: bai(C_TIM), hamCuaEmMoi: [H('find_box', [], ['go_right()', 'go_right()'])], phaiCoMa: [] }
      ],
      goiY: ['Ô phố trống có màu "none"; hộp có màu.', 'Hàm dừng đúng lúc hộp nằm bên phải drone.']
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
      congThucKhac: [{ moTa: 'So bằng not và ==', hamCuaEmMoi: [H('fly_to', ['col'], ['while not color("right") == col:', '    go_right()'])] }],
      loiSai: [
        { moTa: 'Gọi fly_to mà chưa chế hàm', baiLam: bai(C_BAY), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Bay tới ô có màu bất kỳ: dừng ở ô đỏ, ô xanh', baiLam: bai(C_BAY), hamCuaEmMoi: [H('fly_to', ['col'], ['while color("right") == "none":', '    go_right()'])], phaiCoMa: ['chua-toi-co'] }
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
        { moTa: 'Ghi màu trước khi bay sang nhà: mật lệnh lệch một nhà', baiLam: bai(C_GHI), hamCuaEmMoi: [H('read_row', ['a', 'n'], ['for i in range(n):', '    a.append(color("up"))', '    go_right()'])], phaiCoMa: ['chua-toi-co'] }
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
      so: 5, ten: 'Hàm thả xuống tầng', hang: 'luyen', nam: true, bienDem: true, taoHam: ['drop_down'], hamCuaEmCan: [],
      deBai: 'Như màn Giao hàng theo số nhà đỏ, nhưng phần giao hàng nằm trong hàm. Chế drop_down(n): hút hộp ngay dưới drone, bay xuống n tầng rồi thả. Chương trình chính đã khóa: đếm nhà đỏ vào n rồi gọi drop_down(n).',
      veMaMau: 'Tạo drop_down với một đối số n. Thân hàm: bật nam châm, chờ, lặp n lần bay xuống, tắt nam châm, chờ.',
      san: [['.rrg', '...o', '###.', '###D'], ['.grb', '...o', '###D', '###.']],
      vatChat: [['....', '...s', '....', '....'], ['....', '...s', '....', '....']],
      vatMau: [['....', '...y', '....', '....'], ['....', '...y', '....', '....']],
      batDau: { x: 0, y: 1 },
      maMau: bai(C_THA),
      loiGiai: bai(C_THA, { hamCuaEmMoi: [H('drop_down', ['n'], T_THA)] }),
      sao: { o: 12, nhip: 7 },
      congThucKhac: [{ moTa: 'Bay xuống bằng go_down() trong while đếm ngược', hamCuaEmMoi: [H('drop_down', ['n'], ['magnet_n()', 'wait()', 'while n > 0:', '    go_down()', '    n = n - 1', 'magnet_off()', 'wait()'])] }],
      loiSai: [
        { moTa: 'Gọi drop_down mà chưa chế hàm', baiLam: bai(C_THA), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Bay xuống hai tầng cố định: sân thứ hai thả nhầm tầng', baiLam: bai(C_THA), hamCuaEmMoi: [H('drop_down', ['n'], ['magnet_n()', 'wait()', 'go_down()', 'go_down()', 'magnet_off()', 'wait()'])], phaiCoMa: [] }
      ],
      goiY: ['Số tầng bay xuống chính là n mà chương trình chính đưa vào.', 'Hút trước khi bay, thả sau khi tới tầng.']
    }),

    manChe({
      so: 6, ten: 'Hàm xếp hộp', hang: 'luyen', nam: true, taoHam: ['place_box'], hamCuaEmCan: ['find_box'],
      deBai: 'Chế place_box(): đọc màu hộp bên phải, bay tới hút hộp, rồi đưa về ô đích cùng màu (ô đích xanh dương ngay sau hộp, ô đích đỏ xa thêm một ô). Chương trình chính đã khóa: find_box() rồi place_box().',
      veMaMau: 'Tạo place_box() không có đối số. Thân hàm giống chương trình của màn Hộp nào cũng đúng.',
      san: [['...oDD'], ['.oDD..']],
      mau: [['....br'], ['..br..']],
      vatMau: [['...r..'], ['.b....']],
      vatChat: [['...s..'], ['.s....']],
      batDau: { x: 0, y: 0 },
      maMau: bai(C_XEP),
      loiGiai: bai(C_XEP, { hamCuaEmMoi: [H('place_box', [], CHO_1)] }),
      sao: { o: 13, nhip: 7 },
      congThucKhac: [{ moTa: 'Hỏi hộp khác xanh dương', hamCuaEmMoi: [H('place_box', [], ['c = color("right")', 'go_right()', 'magnet_n()', 'wait()', 'go_right()', 'if c != "blue":', '    go_right()', 'magnet_off()', 'wait()'])] }],
      loiSai: [
        { moTa: 'Gọi place_box() mà chưa chế hàm', baiLam: bai(C_XEP), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Không đọc màu: hộp nào cũng tới ô xanh', baiLam: bai(C_XEP), hamCuaEmMoi: [H('place_box', [], ['go_right()', 'magnet_n()', 'wait()', 'go_right()', 'magnet_off()', 'wait()'])], phaiCoMa: [] }
      ],
      goiY: ['Đọc màu hộp NGAY đầu hàm, khi hộp còn ở bên phải.', 'Hộp đỏ bay thêm một ô so với hộp xanh.']
    }),

    manChe({
      so: 7, ten: 'Sửa hàm dò phố', hang: 'bien-the', nam: true, hamCuaEmCan: ['place_box'],
      deBai: 'Hàm của màn scan_street() phải bay tới khi gặp hộp, nhưng điều kiện viết ngược nên drone không bay ô nào. Sửa scan_street(); chương trình chính đã khóa: scan_street() rồi place_box().',
      veMaMau: 'Chạy thử: drone đứng yên và hút hụt. Mở scan_street() trong Xưởng hàm, đổi phép so sánh.',
      san: [['....oDD'], ['..oDD..']],
      mau: [['.....br'], ['...br..']],
      vatMau: [['....b..'], ['..r....']],
      vatChat: [['....s..'], ['..s....']],
      batDau: { x: 0, y: 0 },
      maMau: bai(['scan_street()', 'place_box()'], { hamCuaMan: [H('scan_street', [], ['while color("right") != "none":', '    go_right()'])] }),
      loiGiai: bai(['scan_street()', 'place_box()'], { hamCuaMan: [H('scan_street', [], ['while color("right") == "none":', '    go_right()'])] }),
      sao: { o: 13, nhip: 7 },
      loiSai: [
        { moTa: 'Không sửa: drone không bay, hút hụt', baiLam: bai(['scan_street()', 'place_box()'], { hamCuaMan: [H('scan_street', [], ['while color("right") != "none":', '    go_right()'])] }), phaiCoMa: [] }
      ],
      goiY: ['Còn bay khi ô bên phải TRỐNG, tức là màu bằng "none".', 'Chỉ cần đổi != thành ==.']
    }),

    manChe({
      so: 8, ten: 'Đếm bằng danh sách', hang: 'bien-the', nam: true, taoHam: ['red_count'], hamCuaEmCan: ['drop_down'],
      deBai: 'Đếm nhà đỏ mà không cần biến đếm: chế red_count(a, n) bay qua n nhà, gặp nhà đỏ thì thêm một phần tử vào a. Số nhà đỏ là len(a). Chương trình chính đã khóa: red_count(a, 3) rồi drop_down(len(a)).',
      veMaMau: 'Tạo red_count với hai đối số a và n. Thêm gì vào a cũng được, miễn mỗi nhà đỏ thêm đúng một lần.',
      san: [['.rrr', '...o', '###.', '###.', '###D'], ['.gbr', '...o', '###D', '###.', '###.']],
      vatChat: [['....', '...s', '....', '....', '....'], ['....', '...s', '....', '....', '....']],
      vatMau: [['....', '...g', '....', '....', '....'], ['....', '...g', '....', '....', '....']],
      batDau: { x: 0, y: 1 },
      maMau: bai(C_DEM),
      loiGiai: bai(C_DEM, { hamCuaEmMoi: [H('red_count', ['a', 'n'], T_DEM)] }),
      sao: { o: 13, nhip: 8 },
      congThucKhac: [{ moTa: 'Ghi luôn màu đỏ vào danh sách', hamCuaEmMoi: [H('red_count', ['a', 'n'], ['for i in range(n):', '    go_right()', '    if color("up") == "red":', '        a.append("red")'])] }],
      loiSai: [
        { moTa: 'Gọi red_count mà chưa chế hàm', baiLam: bai(C_DEM), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Thêm mọi nhà vào a: len(a) luôn là 3', baiLam: bai(C_DEM), hamCuaEmMoi: [H('red_count', ['a', 'n'], ['for i in range(n):', '    go_right()', '    a.append(color("up"))'])], phaiCoMa: [] }
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
      so: 10, ten: 'Thành phố mật lệnh', hang: 'trum', nam: true, chinhCoDinh: false, hamCuaEmCan: ['read_row', 'follow_code', 'place_box'],
      deBai: 'Ba ngôi nhà đầu phố là mật lệnh dẫn tới chỗ hộp hàng. Ghi mật lệnh, đi theo nó, tới nơi thì hộp nằm ngay bên phải: xếp hộp về đúng ô đích màu. ' +
        'Tự viết chương trình chính, chỉ dùng các hàm em đã chế. Hai sân, mật lệnh và màu hộp khác nhau.',
      veMaMau: 'Chương trình có sẵn mới ghi mật lệnh. Viết tiếp bằng follow_code và place_box.',
      san: [['.rgr#####', '.....####', '###..####', '####.oDD#'], ['.grg#####', '.....####', '####..oDD', '#########']],
      mau: [['.........', '.........', '.........', '......br.'], ['.........', '.........', '.......br', '.........']],
      vatMau: [['.........', '.........', '.........', '.....r...'], ['.........', '.........', '......b..', '.........']],
      vatChat: [['.........', '.........', '.........', '.....s...'], ['.........', '.........', '......s..', '.........']],
      batDau: { x: 0, y: 1 },
      maMau: bai(['a = []', 'read_row(a, 3)']),
      loiGiai: bai(['a = []', 'read_row(a, 3)', 'follow_code(a)', 'place_box()']),
      sao: { o: 21, nhip: 11 },
      loiSai: [
        { moTa: 'Quên đi theo mật lệnh: drone đứng đầu phố, hút hụt', baiLam: bai(['a = []', 'read_row(a, 3)', 'place_box()']), phaiCoMa: [] },
        { moTa: 'Đi theo mật lệnh mà không xếp hộp', baiLam: bai(['a = []', 'read_row(a, 3)', 'follow_code(a)']), phaiCoMa: [] }
      ],
      goiY: ['Ba hàm, đúng thứ tự: ghi mật lệnh, đi theo, xếp hộp.', 'follow_code(a) dừng đúng chỗ hộp nằm bên phải drone.']
    })
  ];

  ManHoc.manPhoMau = DS;
  if (laNode) module.exports = ManHoc;
})();
