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
    })
  ];

  ManHoc.manPhoMau = DS;
  if (laNode) module.exports = ManHoc;
})();
