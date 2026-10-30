/* ============================================================================
   man-son-tren-cao.js — "Mật Lệnh Robot": NGÂN HÀNG MÀN MỚI của mùa 4, gói 9 "Sơn từ trên cao" (KE-HOACH-MUA-4.md; phiên "Mùa 4" tự viết, 30/10).
   Gói COMBO (user 29/10: "combo nên đủ phong phú"): drone nâng cấp đáp đất (gói 5) gắn MÁY SƠN treo dưới bụng (lõi N3) và camera bốn hướng bản nâng cấp
   ({ ma: 'camera-4', taiCho: true }, gói 7). Mọi màn dùng mục tiêu 'to-hinh' (tô đủ hình mờ đúng màu, tô ra ngoài hình là thua).
     - `son-tren-cao`: chương 1 "Kẻ vạch qua rào": drone sơn ở chỗ xe không tới (băng chuyền, hàng rào, hố), nhấc bút khi bay qua rào / hố,
       đọc màu rồi sơn (color("here"), color("up")), danh sách màu (gói 1, 2), sơn tốn thêm pin nên phải đáp trạm sạc (dock() của gói 5).
     - `che-son-tren-cao`: chương 2 "Chế lệnh: tranh tường".
   Luật drone sơn (san-hoc.js phần MÁY SƠN, N3): đầu sơn tô ô NGAY DƯỚI drone; dot() / pen_down() / pen_up() làm ở nhịp kế, TRƯỚC khi bay; bút hạ tô thêm ô drone
   tới cuối nhịp; nhịp có tô ô (ô đổi màu) tốn thêm 1 pin. Không đi chung nam châm (một bụng một món).
   Máy kiểm: hoc/kiem-man-mua-4.mjs, hoc/kiem-lo-trinh.mjs mục mùa 4, hoc/kiem-drone-son.mjs (lõi).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var BAY = ['go_up', 'go_down', 'go_left', 'go_right', 'wait'];
  var SON = ['ink', 'dot', 'pen_down', 'pen_up'];
  var DAP = ['land', 'take_off'];
  function bai(chinh, them) { return Object.assign({ chinh: chinh.slice() }, them || {}); }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function thut(ds) { return ds.map(function (s) { return '    ' + s; }); }
  function LAP(n, than, bien) { return ['for ' + (bien || 'i') + ' in range(' + n + '):'].concat(thut(Array.isArray(than) ? than : [than])); }
  function MAU(ds, than) { return ['for c in [' + ds.map(function (c) { return '"' + c + '"'; }).join(', ') + ']:'].concat(thut(than)); }
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }

  /** Drone nâng cấp đáp đất + máy sơn dưới bụng + camera bốn hướng nâng cấp "here". Có m.pin thì khay thêm battery(). */
  function man(m) {
    m.chuong = m.chuong || 'son-tren-cao';
    m.cauTruc = ['for', 'if', 'while', 'list'];
    m.loaiRobot = 'drone';
    m.robot = { than: 'drone', tay: 'son', camBien: [{ ma: 'camera-4', o: 'tren', taiCho: true }] };
    m.hamGoc = m.hamGoc || nhieu(BAY, SON, ['color'], DAP, m.pin !== undefined ? ['battery'] : []);
    m.mucTieu = 'to-hinh';
    m.nhipTheoLoiGiai = true;
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = m.khung || { chinh: 10, moiHam: 10 };
    m.loiSai = m.loiSai || [];
    return ManHoc.chuanHoa(m);
  }
  function manChe(m) { m.chuong = 'che-son-tren-cao'; if (m.chinhCoDinh !== false) m.chinhCoDinh = true; else delete m.chinhCoDinh; return man(m); }

  var C_DEMO = ['ink("yellow")', 'pen_down()', 'go_right()', 'go_right()', 'pen_up()', 'go_right()', 'go_right()', 'pen_down()', 'go_right()'];
  var C_RAO = ['ink("blue")', 'pen_down()', 'go_right()', 'pen_up()', 'go_right()', 'go_right()', 'pen_down()', 'go_right()'];
  var C_DUT = ['ink("blue")'].concat(LAP(3, ['pen_down()', 'go_right()', 'pen_up()', 'go_right()', 'go_right()']));
  var LE = ['red', 'yellow', 'red', 'yellow', 'red'];
  var C_LE = MAU(LE, ['ink(c)', 'dot()', 'go_right()']);
  var C_MO = LAP(5, ['ink(color("here"))', 'dot()', 'go_right()']);
  var C_CHEP = LAP(5, ['c = color("up")', 'if c != "none":', '    ink(c)', '    dot()', 'go_right()']);
  var C_PIN = nhieu(['ink("yellow")', 'pen_down()'], LAP(4, 'go_right()'), ['dock()'], LAP(3, 'go_right()'));
  var C_AO = nhieu(['ink("green")', 'pen_down()'], LAP(3, 'go_right()'), LAP(2, 'go_down()'), LAP(3, 'go_left()'), ['go_up()']);
  var BANG_MAU = 'a = ["blue", "yellow", "green", "red"]';
  var C_COT = [BANG_MAU, 'for c in a:', '    ink(c)', '    dot()', '    go_down()'];
  var C_DAU = ['for k in range(3):'].concat(thut(LAP(3, ['if color("here") == "yellow":', '    dot()', 'go_right()'], 'j')), thut(['if battery() < 4:', '    dock()']));
  // chương 2
  var T_STRIPE = ['ink(c)', 'pen_down()', 'for i in range(n):', '    go_right()', 'pen_up()'];
  var C_STRIPE = ['stripe("red", 2)', 'go_right()', 'go_right()', 'stripe("blue", 2)'];
  var T_RETRACE = ['for i in range(n):', '    ink(color("here"))', '    dot()', '    go_right()'];
  var C_RETRACE = ['retrace(3)', 'go_down()', 'retrace(2)'];
  var T_LIST = ['for c in a:', '    ink(c)', '    dot()', '    go_right()'];
  var C_LIST = ['a = ["green", "yellow", "green"]', 'b = ["blue", "blue"]', 'paint_list(a)', 'go_right()', 'paint_list(b)'];
  var T_DASH = ['for j in range(n):', '    stripe(c, 2)', '    go_right()', '    go_right()'];
  var T_HOP = ['pen_up()', 'go_right()', 'go_right()', 'pen_down()'];
  var C_HOP = ['ink("blue")', 'pen_down()', 'go_right()', 'hop_fence()', 'go_right()', 'hop_fence()', 'go_right()'];
  var T_MARK = ['for i in range(n):', '    c = color("up")', '    if c != "none":', '        ink(c)', '        dot()', '    go_right()'];
  var C_MARK = ['trace_marks(5)'];
  var T_COPY = ['read_below(a, n)', 'go_down()', 'go_down()', 'for i in range(n):', '    go_left()', 'paint_list(a)'];
  var C_COPY = ['a = []', 'copy_down(a, 3)'];
  var T_MURAL = ['paint_list(a)', 'go_down()', 'for c in b:', '    go_left()', '    ink(c)', '    dot()', 'wait()'];
  var C_MURAL = ['a = ["red", "yellow", "red"]', 'b = ["green", "green", "blue"]', 'mural(a, b)'];
  var T_LINE = ['pen_down()', 'for i in range(n):', '    go_right()', 'dock()'];
  var T_LINE_SAI = ['pen_down()', 'for i in range(n):', '    go_right()', '    dock()'];
  var C_LINE = ['ink("yellow")', 'line_dock(4)', 'line_dock(4)'];
  var C_TRUM = ['retrace(4)', 'dock()', 'go_down()', 'stripe("blue", 1)', 'go_right()', 'go_right()', 'stripe("blue", 1)'];

  var DS = [
    man({
      so: 1, ten: 'Sơn từ trên cao', hang: 'lam-quen', chiChay: true, chinhCoDinh: true, hamCuaEmCan: [],
      deBai: 'Em gắn máy sơn dưới bụng drone. Drone sơn được ô ngay dưới mình, cả những chỗ xe không tới: băng chuyền đẩy xe đi, hàng rào chắn xe. ' +
        'Bấm Chạy xem drone kẻ vạch vàng trên băng chuyền, nhấc bút bay qua hàng rào, rồi hạ bút kẻ tiếp.',
      veMaMau: 'Chương trình đã viết sẵn và khoá. Bấm Chạy, nhìn vạch vàng hiện dưới bụng drone, và ô hàng rào không bị tô.',
      san: ['.>>=..'],
      hinh: ['yyy.yy'],
      batDau: { x: 0, y: 0 },
      maMau: bai(C_DEMO),
      loiGiai: bai(C_DEMO),
      sao: { o: 9, nhip: 5 },
      goiY: ['pen_down() hạ bút, drone bay tới đâu tô tới đó.', 'pen_up() nhấc bút trước khi bay qua hàng rào: tô lên rào là tô ra ngoài hình.']
    }),

    man({
      so: 2, ten: 'Nhấc bút qua rào', hang: 'lam-quen', hamCuaEmCan: [],
      deBai: 'Kẻ vạch xanh dương hai bên hàng rào. Chương trình có sẵn giữ bút suốt đường nên tô cả hàng rào. Nhấc bút trước rào, hạ bút sau rào.',
      veMaMau: 'Thêm pen_up() và pen_down() đúng chỗ.',
      san: ['..=..'],
      hinh: ['bb.bb'],
      batDau: { x: 0, y: 0 },
      maMau: bai(['ink("blue")', 'pen_down()', 'go_right()', 'go_right()', 'go_right()', 'go_right()']),
      loiGiai: bai(C_RAO),
      sao: { o: 8, nhip: 4 },
      loiSai: [
        { moTa: 'Giữ bút suốt: tô lên hàng rào', baiLam: bai(['ink("blue")', 'pen_down()', 'go_right()', 'go_right()', 'go_right()', 'go_right()']), phaiCoMa: ['to-thua'] },
        { moTa: 'Nhấc bút rồi quên hạ lại', baiLam: bai(['ink("blue")', 'pen_down()', 'go_right()', 'pen_up()', 'go_right()', 'go_right()', 'go_right()']), phaiCoMa: [] }
      ],
      goiY: ['pen_up() làm ở nhịp kế, trước khi bay: "pen_up(); go_right()" bay qua rào mà không tô.', 'Bay khỏi rào rồi mới pen_down(): pen_down() tô luôn ô đang ở.']
    }),

    man({
      so: 3, ten: 'Vạch đứt qua rào và hố', hang: 'lam-quen', hamCuaEmCan: [],
      deBai: 'Đường dài có một hàng rào và một hố. Kẻ vạch đứt xanh dương: hai ô tô, một ô bỏ trống, lặp ba lần. Dùng vòng lặp.',
      veMaMau: 'Chương trình có sẵn kẻ được đoạn đầu. Đưa các lệnh của một đoạn vào vòng for lặp ba lần.',
      san: ['..=..u..'],
      hinh: ['bb.bb.bb'],
      batDau: { x: 0, y: 0 },
      maMau: bai(['ink("blue")', 'pen_down()', 'go_right()', 'pen_up()', 'go_right()', 'go_right()']),
      loiGiai: bai(C_DUT),
      sao: { o: 7, nhip: 7 },
      loiSai: [
        { moTa: 'Quên nhấc bút trong vòng lặp', baiLam: bai(['ink("blue")'].concat(LAP(3, ['pen_down()', 'go_right()', 'go_right()', 'go_right()']))), phaiCoMa: ['to-thua'] }
      ],
      goiY: ['Một đoạn: hạ bút, bay một ô, nhấc bút, bay hai ô.', 'Drone bay qua hố được; ô hố không nằm trong hình.']
    }),

    man({
      so: 4, ten: 'Lề đường đỏ vàng', hang: 'luyen', hamCuaEmCan: [],
      deBai: 'Trên băng chuyền, chấm lề đường xen màu: đỏ, vàng, đỏ, vàng, đỏ. Duyệt danh sách màu, mỗi màu chấm một ô rồi bay sang phải.',
      veMaMau: 'Chương trình có sẵn chấm năm ô nhưng không đổi màu sơn (mặc định đỏ). Dùng for c in [...] và ink(c).',
      san: ['>>>>>.'],
      hinh: ['ryryr.'],
      batDau: { x: 0, y: 0 },
      maMau: bai(LAP(5, ['dot()', 'go_right()'])),
      loiGiai: bai(C_LE),
      sao: { o: 4, nhip: 5 },
      loiSai: [
        { moTa: 'Chấm trước rồi mới đổi màu: chấm theo màu cũ', baiLam: bai(MAU(LE, ['dot()', 'ink(c)', 'go_right()'])), phaiCoMa: ['chua-to-hinh'] }
      ],
      goiY: ['ink(c) đổi màu ngay, không tốn nhịp.', 'dot() tô bằng màu lúc gọi: đổi màu TRƯỚC khi chấm.']
    }),

    man({
      so: 5, ten: 'Tô lại vạch mờ', hang: 'luyen', hamCuaEmCan: [],
      deBai: 'Vạch sơn cũ đã mờ, chỉ còn màu nhạt trên đường. Bay qua năm ô, đọc màu ô dưới chân rồi chấm đúng màu đó. Hai sân, vạch mờ khác màu.',
      veMaMau: 'Chương trình có sẵn chấm theo màu của sân thứ nhất. Dùng ink(color("here")) để lấy màu ô dưới chân.',
      san: [['......'], ['......']],
      mau: [['rgbyr.'], ['yybgg.']],
      hinh: [['rgbyr.'], ['yybgg.']],
      batDau: { x: 0, y: 0 },
      maMau: bai(MAU(['red', 'green', 'blue', 'yellow', 'red'], ['ink(c)', 'dot()', 'go_right()'])),
      loiGiai: bai(C_MO),
      sao: { o: 4, nhip: 5 },
      loiSai: [
        { moTa: 'Chấm theo màu sân thứ nhất', baiLam: bai(MAU(['red', 'green', 'blue', 'yellow', 'red'], ['ink(c)', 'dot()', 'go_right()'])), phaiCoMa: ['chua-to-hinh'] },
        { moTa: 'Đọc "right": lấy màu ô kế bên, lệch một ô', baiLam: bai(LAP(5, ['ink(color("right"))', 'dot()', 'go_right()'])), phaiCoMa: [] }
      ],
      goiY: ['color("here") trả về tên màu ô dưới chân: đưa thẳng vào ink(…).', 'Đọc và chọn màu không tốn nhịp; dot() mới tốn.']
    }),

    man({
      so: 6, ten: 'Chép màu hàng trên', hang: 'luyen', hamCuaEmCan: [],
      deBai: 'Hàng trên là bảng màu mẫu, có ô trống. Drone bay ở hàng dưới, nhìn lên ô mẫu: ô mẫu có màu thì chấm đúng màu đó, ô mẫu trống thì bỏ qua. Hai sân.',
      veMaMau: 'Chương trình có sẵn chấm mọi ô nên gặp ô trống thì ink("none") báo lỗi. Hỏi màu trước: khác "none" mới chấm.',
      san: [['......', '......'], ['......', '......']],
      mau: [['rg.b..', '......'], ['.yy.r.', '......']],
      hinh: [['......', 'rg.b..'], ['......', '.yy.r.']],
      batDau: { x: 0, y: 1 },
      maMau: bai(LAP(5, ['ink(color("up"))', 'dot()', 'go_right()'])),
      loiGiai: bai(C_CHEP),
      sao: { o: 6, nhip: 5 },
      loiSai: [
        { moTa: 'Không hỏi ô trống: ink("none") lỗi', baiLam: bai(LAP(5, ['ink(color("up"))', 'dot()', 'go_right()'])), phaiCoMa: ['mau-son-sai'] },
        { moTa: 'Đọc "here": ô dưới chân chưa có màu, không chấm gì', baiLam: bai(LAP(5, ['c = color("here")', 'if c != "none":', '    ink(c)', '    dot()', 'go_right()'])), phaiCoMa: [] }
      ],
      goiY: ['"up" là ô phía trên trên bản đồ.', 'c = color("up") rồi if c != "none": mới ink(c) và dot().']
    }),

    man({
      so: 7, ten: 'Sơn tốn pin', hang: 'bien-the', pin: 10, hamCuaEmCan: ['dock'],
      deBai: 'Nhịp nào có tô ô thì drone tốn thêm 1 pin. Kẻ vạch vàng dài tám ô: pin 10 không đủ kẻ một mạch. Ô thứ năm là trạm sạc: tới đó gọi dock() (hàm em chế ở gói Trạm sạc) rồi kẻ tiếp.',
      veMaMau: 'Chương trình có sẵn kẻ một mạch nên hết pin giữa đường. Chen dock() khi drone tới trạm sạc.',
      san: ['....P...'],
      hinh: ['yyyyyyyy'],
      batDau: { x: 0, y: 0 },
      maMau: bai(nhieu(['ink("yellow")', 'pen_down()'], LAP(7, 'go_right()'))),
      loiGiai: bai(C_PIN),
      sao: { o: 9, nhip: 9 },
      loiSai: [
        { moTa: 'Kẻ một mạch: hết pin', baiLam: bai(nhieu(['ink("yellow")', 'pen_down()'], LAP(7, 'go_right()'))), phaiCoMa: ['het-pin'] },
        { moTa: 'Đáp sạc rồi quên cất cánh', baiLam: bai(nhieu(['ink("yellow")', 'pen_down()'], LAP(4, 'go_right()'), ['land()'], LAP(3, 'go_right()'))), phaiCoMa: ['dang-dau'] }
      ],
      goiY: ['Bay kèm bút hạ: mỗi nhịp tốn 2 pin.', 'dock() là land() rồi take_off(); đáp trên ô sạc thì pin đầy ngay. Bút vẫn hạ khi đáp.']
    }),

    man({
      so: 8, ten: 'Khung quanh ao', hang: 'bien-the', hamCuaEmCan: [],
      deBai: 'Giữa sân là ao (hai ô hố). Kẻ khung xanh lá quanh ao bằng một nét liền: sang phải, xuống, sang trái, lên. Ô hố không được tô.',
      veMaMau: 'Chương trình có sẵn mới kẻ cạnh trên. Viết tiếp ba cạnh còn lại.',
      san: ['....', '.uu.', '....'],
      hinh: ['gggg', 'g..g', 'gggg'],
      batDau: { x: 0, y: 0 },
      maMau: bai(nhieu(['ink("green")', 'pen_down()'], LAP(3, 'go_right()'))),
      loiGiai: bai(C_AO),
      sao: { o: 9, nhip: 9 },
      loiSai: [
        { moTa: 'Cắt ngang qua ao', baiLam: bai(['ink("green")', 'pen_down()', 'go_down()', 'go_right()']), phaiCoMa: ['to-thua'] },
        { moTa: 'Thiếu cạnh cuối', baiLam: bai(nhieu(['ink("green")', 'pen_down()'], LAP(3, 'go_right()'), LAP(2, 'go_down()'), LAP(3, 'go_left()'))), phaiCoMa: [] }
      ],
      goiY: ['Bốn cạnh: phải ba ô, xuống hai ô, trái ba ô, lên một ô.', 'Ô xuất phát đã tô từ đầu: cạnh cuối chỉ cần một ô.']
    }),

    man({
      so: 9, ten: 'Sửa cột màu', hang: 'bien-the', hamCuaEmCan: [],
      deBai: 'Chương trình có sẵn chấm cột màu trên băng chuyền theo danh sách a, nhưng màu bị lệch: ô nào cũng mang màu của ô trước. Sửa cho đúng.',
      veMaMau: 'Chạy thử, nhìn ô đầu bị chấm đỏ. Đổi thứ tự hai lệnh trong vòng lặp.',
      san: ['.', '>', '>', '.', '.'],
      hinh: ['b', 'y', 'g', 'r', '.'],
      batDau: { x: 0, y: 0 },
      maMau: bai([BANG_MAU, 'for c in a:', '    dot()', '    ink(c)', '    go_down()']),
      loiGiai: bai(C_COT),
      sao: { o: 5, nhip: 4 },
      loiSai: [
        { moTa: 'Không sửa: chấm theo màu cũ', baiLam: bai([BANG_MAU, 'for c in a:', '    dot()', '    ink(c)', '    go_down()']), phaiCoMa: ['chua-to-hinh'] },
        { moTa: 'Bỏ ink(c): cột toàn màu đỏ', baiLam: bai([BANG_MAU, 'for c in a:', '    dot()', '    go_down()']), phaiCoMa: ['chua-to-hinh'] }
      ],
      goiY: ['dot() lấy màu ngay lúc gọi.', 'Chưa ink lần nào thì máy sơn đang là màu đỏ.']
    }),

    man({
      so: 10, ten: 'Kẻ vạch theo dấu', hang: 'trum', pin: 7, hamCuaEmCan: ['dock'], khung: { chinh: 12, moiHam: 10 },
      deBai: 'Con phố có hàng rào, hố và hai trạm sạc (ô thứ tư và ô thứ bảy). Dấu vàng nhạt trên đường chỉ chỗ cần chấm. Bay chín ô, ô nào có dấu vàng thì chấm vàng. ' +
        'Chấm tốn pin: mỗi lần tới trạm, pin dưới 4 thì dock(). Hai sân, dấu khác nhau.',
      veMaMau: 'Chương trình có sẵn đã chọn màu vàng. Ba chặng, mỗi chặng ba ô; cuối chặng là trạm sạc.',
      san: [['.=.P..Pu..'], ['..uP.=P...']],
      mau: [['y.y.yy..y.'], ['yy..y..yy.']],
      hinh: [['y.y.yy..y.'], ['yy..y..yy.']],
      batDau: { x: 0, y: 0 },
      maMau: bai(['ink("yellow")']),
      loiGiai: bai(['ink("yellow")'].concat(C_DAU)),
      sao: { o: 10, nhip: 13 },
      loiSai: [
        { moTa: 'Không đáp sạc: hết pin', baiLam: bai(['ink("yellow")'].concat(LAP(9, ['if color("here") == "yellow":', '    dot()', 'go_right()']))), phaiCoMa: ['het-pin'] },
        { moTa: 'Chấm mọi ô: tô ra ngoài dấu', baiLam: bai(['ink("yellow")', 'for k in range(3):'].concat(thut(LAP(3, ['dot()', 'go_right()'], 'j')), thut(['if battery() < 4:', '    dock()']))), phaiCoMa: ['to-thua'] }
      ],
      goiY: ['Vòng ngoài ba chặng, vòng trong ba ô.', 'Hỏi pin ở cuối chặng, khi drone đứng trên trạm sạc.']
    }),

    /* ================================================= chương che-son-tren-cao "Chế lệnh: tranh tường" ================================================= */
    manChe({
      so: 1, ten: 'Hàm kẻ vạch', hang: 'lam-quen', taoHam: ['stripe'], hamCuaEmCan: [],
      deBai: 'Chế stripe(c, n): chọn sơn màu c, hạ bút, bay sang phải n ô, rồi nhấc bút. Chương trình chính đã khóa: vạch đỏ, bay qua hàng rào, vạch xanh dương.',
      veMaMau: 'Mở Xưởng hàm, tạo stripe với hai đối số c và n. Bút hạ thì ô xuất phát cũng được tô: n ô bay là n + 1 ô vạch.',
      san: ['...=...'],
      hinh: ['rrr.bbb'],
      batDau: { x: 0, y: 0 },
      maMau: bai(C_STRIPE),
      loiGiai: bai(C_STRIPE, { hamCuaEmMoi: [H('stripe', ['c', 'n'], T_STRIPE)] }),
      sao: { o: 9, nhip: 6 },
      loiSai: [
        { moTa: 'Gọi stripe mà chưa chế hàm', baiLam: bai(C_STRIPE), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên nhấc bút cuối hàm: tô lên hàng rào', baiLam: bai(C_STRIPE), hamCuaEmMoi: [H('stripe', ['c', 'n'], T_STRIPE.slice(0, -1))], phaiCoMa: ['to-thua'] }
      ],
      goiY: ['ink(c) trước pen_down(): pen_down() tô ô đang ở bằng màu lúc gọi.', 'pen_up() cuối hàm làm ở nhịp bay kế tiếp, trước khi bay.']
    }),

    manChe({
      so: 2, ten: 'Hàm tô lại vạch mờ', hang: 'lam-quen', taoHam: ['retrace'], hamCuaEmCan: [],
      deBai: 'Chế retrace(n): bay qua n ô, mỗi ô chấm đúng màu vạch mờ dưới chân. Chương trình chính đã khóa: tô ba ô hàng trên, xuống một hàng, tô hai ô hàng dưới. Hai sân.',
      veMaMau: 'Tạo retrace với một đối số n. Như màn Tô lại vạch mờ ở chương trước.',
      san: [['......', '......'], ['......', '......']],
      mau: [['rgb...', '...yg.'], ['bby...', '...rr.']],
      hinh: [['rgb...', '...yg.'], ['bby...', '...rr.']],
      batDau: { x: 0, y: 0 },
      maMau: bai(C_RETRACE),
      loiGiai: bai(C_RETRACE, { hamCuaEmMoi: [H('retrace', ['n'], T_RETRACE)] }),
      sao: { o: 7, nhip: 6 },
      congThucKhac: [{ moTa: 'Đọc màu vào biến trước', hamCuaEmMoi: [H('retrace', ['n'], ['for i in range(n):', '    c = color("here")', '    ink(c)', '    dot()', '    go_right()'])] }],
      loiSai: [
        { moTa: 'Gọi retrace mà chưa chế hàm', baiLam: bai(C_RETRACE), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Một màu cố định: sai màu', baiLam: bai(C_RETRACE), hamCuaEmMoi: [H('retrace', ['n'], ['for i in range(n):', '    ink("red")', '    dot()', '    go_right()'])], phaiCoMa: ['chua-to-hinh'] }
      ],
      goiY: ['ink(color("here")) lấy màu ô dưới chân.', 'Mỗi ô: chọn màu, chấm, bay.']
    }),

    manChe({
      so: 3, ten: 'Hàm sơn theo danh sách', hang: 'lam-quen', taoHam: ['paint_list'], hamCuaEmCan: [],
      deBai: 'Chế paint_list(a): mỗi màu c trong danh sách a, chấm một ô màu c rồi bay sang phải. Chương trình chính đã khóa: sơn danh sách a, bay qua rào, sơn danh sách b.',
      veMaMau: 'Tạo paint_list với một đối số a (danh sách màu).',
      san: ['...=...'],
      hinh: ['gyg.bb.'],
      batDau: { x: 0, y: 0 },
      maMau: bai(C_LIST),
      loiGiai: bai(C_LIST, { hamCuaEmMoi: [H('paint_list', ['a'], T_LIST)] }),
      sao: { o: 9, nhip: 6 },
      loiSai: [
        { moTa: 'Gọi paint_list mà chưa chế hàm', baiLam: bai(C_LIST), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Chấm trước rồi mới đổi màu', baiLam: bai(C_LIST), hamCuaEmMoi: [H('paint_list', ['a'], ['for c in a:', '    dot()', '    ink(c)', '    go_right()'])], phaiCoMa: ['chua-to-hinh'] }
      ],
      goiY: ['for c in a: duyệt từng màu.', 'Hàm dừng ở ô ngay sau ô cuối đã chấm.']
    }),

    manChe({
      so: 4, ten: 'Hàm vạch đứt', hang: 'luyen', taoHam: ['dashes'], hamCuaEmCan: ['stripe'],
      deBai: 'Chế dashes(c, n): n đoạn vạch màu c, mỗi đoạn ba ô, giữa hai đoạn là một ô bỏ trống (hàng rào hay hố). Dùng stripe em vừa chế. Chương trình chính đã khóa: dashes("blue", 3).',
      veMaMau: 'Tạo dashes với hai đối số c và n. Mỗi vòng: stripe(c, 2) rồi bay qua ô trống.',
      san: ['...=...u...'],
      hinh: ['bbb.bbb.bbb'],
      batDau: { x: 0, y: 0 },
      maMau: bai(['dashes("blue", 3)']),
      loiGiai: bai(['dashes("blue", 3)'], { hamCuaEmMoi: [H('dashes', ['c', 'n'], T_DASH)] }),
      sao: { o: 10, nhip: 10 },
      loiSai: [
        { moTa: 'Gọi dashes mà chưa chế hàm', baiLam: bai(['dashes("blue", 3)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Bay một ô giữa hai đoạn: hạ bút trên hàng rào', baiLam: bai(['dashes("blue", 3)']), hamCuaEmMoi: [H('dashes', ['c', 'n'], ['for j in range(n):', '    stripe(c, 2)', '    go_right()'])], phaiCoMa: ['to-thua'] }
      ],
      goiY: ['stripe(c, 2) kẻ ba ô và dừng ở ô thứ ba.', 'Bay hai ô: qua ô trống rồi tới đầu đoạn sau.']
    }),

    manChe({
      so: 5, ten: 'Sửa hàm nhảy rào', hang: 'luyen', hamCuaEmCan: [],
      deBai: 'Hàm của màn hop_fence() phải đưa drone qua hàng rào mà không tô lên rào, nhưng nó quên nhấc bút. Sửa hop_fence; chương trình chính đã khóa.',
      veMaMau: 'Chạy thử: vạch tô lên hàng rào. Nhấc bút trước khi bay, hạ bút lại sau rào.',
      san: ['..=..=..'],
      hinh: ['bb.bb.bb'],
      batDau: { x: 0, y: 0 },
      maMau: bai(C_HOP, { hamCuaMan: [H('hop_fence', [], ['go_right()', 'go_right()'])] }),
      loiGiai: bai(C_HOP, { hamCuaMan: [H('hop_fence', [], T_HOP)] }),
      sao: { o: 11, nhip: 7 },
      loiSai: [
        { moTa: 'Không sửa: tô lên rào', baiLam: bai(C_HOP, { hamCuaMan: [H('hop_fence', [], ['go_right()', 'go_right()'])] }), phaiCoMa: ['to-thua'] },
        { moTa: 'Nhấc bút mà quên hạ lại', baiLam: bai(C_HOP, { hamCuaMan: [H('hop_fence', [], ['pen_up()', 'go_right()', 'go_right()'])] }), phaiCoMa: [] }
      ],
      goiY: ['pen_up() đầu hàm, pen_down() cuối hàm.', 'pen_down() cuối hàm tô ô sau rào ở nhịp bay kế tiếp.']
    }),

    manChe({
      so: 6, ten: 'Hàm chép dấu hàng trên', hang: 'luyen', taoHam: ['trace_marks'], hamCuaEmCan: [],
      deBai: 'Chế trace_marks(n): bay qua n ô, mỗi ô nhìn lên ô mẫu phía trên: có màu thì chấm đúng màu đó, trống thì bỏ qua. Chương trình chính đã khóa: trace_marks(5). Hai sân, bảng mẫu khác nhau.',
      veMaMau: 'Tạo trace_marks với một đối số n. Như màn Chép màu hàng trên ở chương trước.',
      san: [['......', '......'], ['......', '......']],
      mau: [['r.gg..', '......'], ['.b.yr.', '......']],
      hinh: [['......', 'r.gg..'], ['......', '.b.yr.']],
      batDau: { x: 0, y: 1 },
      maMau: bai(C_MARK),
      loiGiai: bai(C_MARK, { hamCuaEmMoi: [H('trace_marks', ['n'], T_MARK)] }),
      sao: { o: 7, nhip: 5 },
      congThucKhac: [{ moTa: 'Hỏi bằng ==', hamCuaEmMoi: [H('trace_marks', ['n'], ['for i in range(n):', '    c = color("up")', '    if c == "none":', '        wait()', '    else:', '        ink(c)', '        dot()', '    go_right()'])] }],
      loiSai: [
        { moTa: 'Gọi trace_marks mà chưa chế hàm', baiLam: bai(C_MARK), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Không hỏi ô trống: ink("none") lỗi', baiLam: bai(C_MARK), hamCuaEmMoi: [H('trace_marks', ['n'], ['for i in range(n):', '    ink(color("up"))', '    dot()', '    go_right()'])], phaiCoMa: ['mau-son-sai'] }
      ],
      goiY: ['c = color("up") trong vòng lặp, rồi if c != "none":.', 'go_right() nằm ngoài if: ô trống vẫn phải bay qua.']
    }),

    manChe({
      so: 8, ten: 'Hàm chép bức tranh', hang: 'bien-the', taoHam: ['copy_down'], hamCuaEmCan: ['read_below', 'paint_list'],
      deBai: 'Chế copy_down(a, n): ghi màu n ô của bức tranh mẫu bằng read_below (gói Nhìn dưới chân), bay xuống qua hàng rào, quay về đầu hàng rồi sơn lại bằng paint_list. ' +
        'Chương trình chính đã khóa: a = [] rồi copy_down(a, 3). Hai sân, tranh mẫu khác nhau.',
      veMaMau: 'Tạo copy_down với hai đối số a và n. Ghép hai hàm em đã chế: read_below rồi paint_list.',
      san: [['....', '====', '....'], ['....', '====', '....']],
      mau: [['.rgy', '....', '....'], ['.bbr', '....', '....']],
      hinh: [['....', '....', 'rgy.'], ['....', '....', 'bbr.']],
      batDau: { x: 0, y: 0 },
      maMau: bai(C_COPY),
      loiGiai: bai(C_COPY, { hamCuaEmMoi: [H('copy_down', ['a', 'n'], T_COPY)] }),
      sao: { o: 15, nhip: 11 },
      loiSai: [
        { moTa: 'Gọi copy_down mà chưa chế hàm', baiLam: bai(C_COPY), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên bay về đầu hàng: sơn ra ngoài tranh', baiLam: bai(C_COPY), hamCuaEmMoi: [H('copy_down', ['a', 'n'], ['read_below(a, n)', 'go_down()', 'go_down()', 'paint_list(a)'])], phaiCoMa: ['to-thua'] }
      ],
      goiY: ['read_below(a, n) bay n ô và ghi màu vào a.', 'Bay trái n ô về đầu hàng dưới rồi paint_list(a).']
    }),

    manChe({
      so: 7, ten: 'Hàm tranh hai hàng', hang: 'bien-the', taoHam: ['mural'], hamCuaEmCan: ['paint_list'],
      deBai: 'Chế mural(a, b): sơn hàng trên theo a từ trái sang phải bằng paint_list, xuống một hàng, rồi sơn hàng dưới theo b từ PHẢI sang TRÁI. Chương trình chính đã khóa.',
      veMaMau: 'Tạo mural với hai đối số a và b. Hàng dưới: mỗi màu bay trái một ô rồi mới chấm; chấm cuối cần một nhịp wait().',
      san: ['....', '....'],
      hinh: ['ryr.', 'bgg.'],
      batDau: { x: 0, y: 0 },
      maMau: bai(C_MURAL),
      loiGiai: bai(C_MURAL, { hamCuaEmMoi: [H('mural', ['a', 'b'], T_MURAL)] }),
      sao: { o: 14, nhip: 8 },
      loiSai: [
        { moTa: 'Gọi mural mà chưa chế hàm', baiLam: bai(C_MURAL), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Chấm trước rồi mới bay trái: lệch một ô', baiLam: bai(C_MURAL), hamCuaEmMoi: [H('mural', ['a', 'b'], ['paint_list(a)', 'go_down()', 'for c in b:', '    ink(c)', '    dot()', '    go_left()'])], phaiCoMa: ['to-thua'] },
        { moTa: 'Quên wait(): chấm cuối không kịp tô', baiLam: bai(C_MURAL), hamCuaEmMoi: [H('mural', ['a', 'b'], T_MURAL.slice(0, -1))], phaiCoMa: [] }
      ],
      goiY: ['paint_list(a) dừng ở ô ngay sau hàng trên.', 'dot() làm ở nhịp kế: sau dot() cuối, wait() cho nó một nhịp.']
    }),

    manChe({
      so: 9, ten: 'Sửa hàm kẻ rồi sạc', hang: 'bien-the', pin: 10, hamCuaEmCan: ['dock'],
      deBai: 'Hàm của màn line_dock(n) phải kẻ vạch n ô rồi đáp sạc một lần ở trạm, nhưng dock() đặt nhầm chỗ: drone đáp ở mọi ô, hết pin. Sửa line_dock; chương trình chính đã khóa.',
      veMaMau: 'Chạy thử: drone đáp xuống ngay ô thứ hai, không phải trạm sạc. Đưa dock() ra ngoài vòng lặp.',
      san: ['....P...P'],
      hinh: ['yyyyyyyyy'],
      batDau: { x: 0, y: 0 },
      maMau: bai(C_LINE, { hamCuaMan: [H('line_dock', ['n'], T_LINE_SAI)] }),
      loiGiai: bai(C_LINE, { hamCuaMan: [H('line_dock', ['n'], T_LINE)] }),
      sao: { o: 9, nhip: 10 },
      loiSai: [
        { moTa: 'Không sửa: đáp ở mọi ô, hết pin', baiLam: bai(C_LINE, { hamCuaMan: [H('line_dock', ['n'], T_LINE_SAI)] }), phaiCoMa: ['het-pin'] },
        { moTa: 'Bỏ hẳn dock(): hết pin', baiLam: bai(C_LINE, { hamCuaMan: [H('line_dock', ['n'], ['pen_down()', 'for i in range(n):', '    go_right()'])] }), phaiCoMa: ['het-pin'] }
      ],
      goiY: ['dock() thụt ra ngoài vòng lặp: kẻ đủ n ô rồi mới đáp.', 'Hai trạm cách nhau bốn ô.']
    }),

    manChe({
      so: 10, ten: 'Tranh tường thành phố', hang: 'trum', pin: 10, chinhCoDinh: false, hamCuaEmCan: ['retrace', 'stripe', 'dock'], khung: { chinh: 12, moiHam: 10 },
      deBai: 'Bức tường của thành phố: hàng trên là vạch mờ bốn ô cần tô lại đúng màu, tới cuối vạch là trạm sạc; hàng dưới là vạch xanh dương bị hàng rào cắt đôi. ' +
        'Tự viết chương trình chính bằng các hàm em đã chế: retrace, dock, stripe. Hai sân, vạch mờ khác màu.',
      veMaMau: 'Chương trình có sẵn đã tô lại vạch mờ. Viết tiếp: sạc, xuống hàng dưới, kẻ hai đoạn vạch hai bên rào.',
      san: [['....P....', '......=..'], ['....P....', '......=..']],
      mau: [['rgby.....', '.........'], ['yybr.....', '.........']],
      hinh: [['rgby.....', '....bb.bb'], ['yybr.....', '....bb.bb']],
      batDau: { x: 0, y: 0 },
      maMau: bai(['retrace(4)']),
      loiGiai: bai(C_TRUM),
      sao: { o: 18, nhip: 11 },
      loiSai: [
        { moTa: 'Không đáp sạc: hết pin', baiLam: bai(['retrace(4)', 'go_down()', 'stripe("blue", 1)', 'go_right()', 'go_right()', 'stripe("blue", 1)']), phaiCoMa: ['het-pin'] },
        { moTa: 'Một vạch dài xuyên rào', baiLam: bai(['retrace(4)', 'dock()', 'go_down()', 'stripe("blue", 4)']), phaiCoMa: ['to-thua'] }
      ],
      goiY: ['retrace(4) dừng đúng trên trạm sạc.', 'stripe("blue", 1) kẻ hai ô; bay hai ô qua rào rồi kẻ đoạn sau.']
    })
  ];

  ManHoc.manSonTrenCao = DS;
  if (laNode) module.exports = ManHoc;
})();
