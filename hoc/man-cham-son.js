/* ============================================================================
   man-cham-son.js — "Mật Lệnh Robot": NGÂN HÀNG MÀN MỚI của mùa 4, gói 2 "Chấm sơn" (KE-HOACH-MUA-4.md; phiên "Mùa 4" tự viết, 29/10).
   Khung mùa 4 (lo-trinh-hoc.js, khối "MÙA 4 = 10 GÓI", mảng MUA_4) xếp màn: dòng chương trong MUA_4 khai ĐỦ thứ tự 10 màn.
     - `may-son`: chương 1 "Chấm từng ô": màn mới khai so từ 11 (may-son.1 … .10 đã có; gói này giữ .1, .2, .6, .7 dùng dot(), các màn nét liền về gói 6).
       Thứ tự: 11 (trình diễn) · 1 · 2 · 12 · 6 · 7 · 14 · 15 · 13 · 16 (trùm) (xếp theo đường cong nhịp).
       Cái mới của gói: em lắp MÁY SƠN cho R1 (xe hai bánh, như các màn may-son có sẵn): ink(c) chọn màu, dot() chấm ô đang đứng. CHƯA có bút liền
       pen_down / pen_up (gói 6 Nét liền). Python mùa 4: danh sách màu (for c in [...]).
     - `che-list`: chương 2 "Chế lệnh: sơn theo danh sách" DỰNG LẠI 30/10 (nghiệm thu độc lập: chương cũ đo bãi bằng cảm biến khoảng cách không dính máy sơn):
       che-list.11 … .20 trên xe máy sơn, Python B: append (trình diễn) · lặp để thêm · chế dot_row · chế stripes_row (append trong hàm) · nhân đôi màu · bỏ màu xanh
       · sửa double_up · hai hàng đối xứng · sửa keep_warm · trùm biển báo hai tầng. Mười màn cũ sang mùa 5 (che-list-cu, ẩn).
   Luật máy sơn (san-hoc.js phần MÁY SƠN): mục tiêu 'to-hinh': tô đủ hình mờ (man.hinh, chữ r g b y) đúng màu, KHÔNG tô ra ngoài hình (tô ngoài là thua ngay,
   'to-thua'); dot() chỉ ra lệnh, có hiệu lực ở nhịp kế (move() hay wait()); ink(c) đổi màu ngay, không tốn nhịp.
   Máy kiểm: hoc/kiem-man-mua-4.mjs, hoc/kiem-lo-trinh.mjs mục mùa 4, hoc/kiem-may-son.mjs.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  // Khay gói 2: bánh + ink / dot (bút liền mở ở gói 6, khối MUA_4 cũng bớt pen_down / pen_up khỏi khay gói 1–5).
  var KHAY = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'ink', 'dot'];
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  function bai(chinh, them) { return Object.assign({ chinh: chinh.slice() }, them || {}); }
  /** for c in danh sách màu: thân (mảng dòng). */
  function MAU(ds, than) { return ['for c in [' + ds.map(function (c) { return '"' + c + '"'; }).join(', ') + ']:'].concat(than.map(function (s) { return '    ' + s; })); }
  var CHAM = ['ink(c)', 'dot()', 'move()', 'move()'];
  var T_PAINT_ROW = ['for c in colors:', '    ink(c)', '    dot()', '    move()', '    move()'];

  function man(m) {
    m.chuong = 'may-son';
    m.loaiRobot = 'banh';
    m.robot = { than: 'hai-banh', tay: 'son', camBien: [] };
    m.hamGoc = m.hamGoc || KHAY.slice();
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = m.khung || { chinh: 10, moiHam: 10 };
    m.cauTruc = ['for', 'if', 'while', 'list'];
    m.mucTieu = 'to-hinh';
    m.nhipTheoLoiGiai = true;
    m.loiSai = m.loiSai || [];
    return ManHoc.chuanHoa(m);
  }

  /** Màn chương che-list (dựng lại 30/10): xe máy sơn của gói, Python B (for c in a, append, hàm nhận danh sách); chương trình chính khoá trừ khi khai chinhCoDinh: false. */
  function manL(m) {
    var mo = m.chinhCoDinh;
    var r = man(m);
    r.chuong = 'che-list';
    if (mo === false) delete r.chinhCoDinh; else r.chinhCoDinh = true;
    return r;
  }
  var T_DOT_ROW = ['for c in colors:', '    ink(c)', '    dot()', '    move()'];
  var CHAM_A = ['for c in a:', '    ink(c)', '    dot()', '    move()'];
  var C_L1 = ['a = []', 'a.append("red")', 'a.append("yellow")', 'a.append("red")'].concat(CHAM_A);
  var C_L2 = ['a = []', 'for i in range(3):', '    a.append("red")', '    a.append("blue")'].concat(CHAM_A);
  var C_L3 = ['dot_row(["red", "blue"])', 'move()', 'dot_row(["yellow", "yellow", "red"])'];
  var T_STRIPES = ['a = []', 'for i in range(n):', '    a.append(c1)', '    a.append(c2)', 'dot_row(a)'];
  var C_L4 = ['stripes_row("red", "yellow", 2)', 'stripes_row("blue", "blue", 1)'];
  var C_L5 = ['a = ["red", "blue", "yellow"]', 'b = []', 'for c in a:', '    b.append(c)', '    b.append(c)', 'dot_row(b)'];
  var C_L6 = ['a = ["red", "blue", "red", "yellow", "blue", "yellow", "red"]', 'b = []', 'for c in a:', '    if c != "blue":', '        b.append(c)', 'dot_row(b)'];
  var T_DOUBLE = ['for c in a:', '    b.append(c)', '    b.append(c)'];
  var C_L7 = ['a = ["yellow", "red", "blue", "red"]', 'b = []', 'double_up(a, b)', 'dot_row(b)'];
  var C_L8 = ['a = ["red", "green", "blue", "yellow"]', 'dot_row(a)', 'turn_right()', 'move()', 'turn_right()', 'move()', 'dot_row(a)'];
  var T_KEEP = ['for c in a:', '    if c != "blue":', '        b.append(c)'];
  var C_L9 = ['a = ["red", "blue", "yellow", "yellow", "blue", "red"]', 'b = []', 'keep_warm(a, b)', 'dot_row(b)'];
  var C_L10 = ['a = ["red", "blue", "red", "yellow"]', 'b = []', 'for c in a:', '    b.append(c)', '    b.append(c)', 'dot_row(b)', 'turn_right()', 'move()', 'turn_right()', 'move()',
    'd = []', 'for c in a:', '    if c != "blue":', '        d.append(c)', 'dot_row(d)'];

  var DS = [
    man({
      so: 11, ten: 'Máy sơn chấm màu', hang: 'lam-quen', chiChay: true, chinhCoDinh: true, hamCuaEmCan: ['move'],
      deBai: 'Em lắp máy sơn vào mũi xe. ink("blue") chọn sơn xanh dương, dot() chấm một chấm vào ô xe đang đứng. ' +
        'Bấm Chạy xem xe chấm một chấm xanh, đi một ô, đổi sang sơn đỏ rồi chấm chấm thứ hai đúng hình mờ.',
      veMaMau: 'Chương trình đã viết sẵn và khoá. Bấm Chạy, nhìn hai chấm hiện lên đúng hai ô của hình mờ.',
      san: ['...', '...', '...'],
      hinh: ['...', 'br.', '...'],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(['ink("blue")', 'dot()', 'move()', 'ink("red")', 'dot()', 'wait()']),
      loiGiai: bai(['ink("blue")', 'dot()', 'move()', 'ink("red")', 'dot()', 'wait()']),
      sao: { o: 9, nhip: 2 },
      goiY: ['ink() đổi màu ngay, không mất nhịp.', 'dot() chấm vào ô xe đang đứng, ở nhịp kế tiếp.']
    }),

    man({
      so: 12, ten: 'Bốn chấm một hàng', hang: 'lam-quen', hamCuaEmCan: ['move'],
      deBai: 'Hình mờ là bốn chấm đỏ cách nhau một ô trên cùng một hàng. Chấm, đi hai ô, chấm tiếp: lặp cho gọn. Đừng chấm vào ô trống giữa hai chấm.',
      veMaMau: 'Chương trình có sẵn mới chấm một chấm. Dùng vòng for để chấm đủ bốn chấm.',
      san: ['.......', '.......', '.......'],
      hinh: ['.......', 'r.r.r.r', '.......'],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(['dot()', 'wait()']),
      loiGiai: bai(['for i in range(3):', '    dot()', '    move()', '    move()', 'dot()', 'wait()']),
      sao: { o: 9, nhip: 7 },
      loiGiaiKhac: { moTa: 'Chấm cuối đi kèm một bước move() thay cho wait(): thêm một nhịp', baiLam: bai(['for i in range(3):', '    dot()', '    move()', '    move()', 'dot()', 'move()']) },
      loiSai: [
        { moTa: 'Chỉ đi một ô giữa hai chấm: chấm trúng ô trống ngoài hình', baiLam: bai(['for i in range(4):', '    dot()', '    move()']), phaiCoMa: ['to-thua'] },
        { moTa: 'Lặp bốn lần cả bước đi: thiếu chấm cuối vì chấm cuối chưa kịp có nhịp', baiLam: bai(['for i in range(3):', '    dot()', '    move()', '    move()']), phaiCoMa: [] }
      ],
      goiY: ['Mỗi chấm cách nhau một ô trống: sau dot() phải đi hai ô.', 'Ba lần lặp được ba chấm; chấm thứ tư viết sau vòng lặp, kèm wait() cho nhịp trôi.']
    }),

    man({
      so: 13, ten: 'Hai hàng chấm', hang: 'bien-the', hamCuaEmCan: ['move', 'turn_right', 'dots'],
      deBai: 'Hai hàng chấm đỏ: hàng trên chấm ở cột 1, 3; hàng dưới chấm ở cột 3, 5. Dùng hàm dots(n) em đã chế để chấm mỗi hàng, ' +
        'giữa hai hàng thì quay xe xuống rồi quay ngược lại.',
      veMaMau: 'Chương trình có sẵn chấm xong hàng trên. Viết tiếp để xe xuống hàng dưới và chấm theo chiều ngược lại.',
      san: ['.......', '.......', '.......'],
      hinh: ['r.r....', '..r.r..', '.......'],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(['dots(2)']),
      loiGiai: bai(['dots(2)', 'turn_right()', 'move()', 'turn_right()', 'dots(2)']),
      sao: { o: 14, nhip: 10 },
      loiGiaiKhac: { moTa: 'Xuống hàng bằng turn_left() ba lần thay cho turn_right()', baiLam: bai(['dots(2)', 'turn_right()', 'move()', 'turn_left()', 'turn_left()', 'turn_left()', 'dots(2)']) },
      loiSai: [
        { moTa: 'Quay sai chiều ở hàng dưới: xe chấm ra ngoài sân hình', baiLam: bai(['dots(2)', 'turn_right()', 'move()', 'turn_left()', 'dots(2)']), phaiCoMa: [] },
        { moTa: 'Quên xuống hàng: xe quay đầu chấm lại hàng trên, trúng ô trống', baiLam: bai(['dots(2)', 'turn_right()', 'turn_right()', 'dots(2)']), phaiCoMa: ['to-thua'] }
      ],
      goiY: ['dots(2) chấm hai chấm, mỗi chấm đi hai ô: hết hàng xe đứng ngay sau chấm cuối một ô.', 'Quay phải, đi một ô, quay phải lần nữa là xe quay ngược chiều ở hàng dưới.']
    }),

    man({
      so: 14, ten: 'Cờ ba màu', hang: 'luyen', hamCuaEmCan: ['move'],
      deBai: 'Lá cờ trên tường phố có ba dải màu đỏ, vàng, xanh dương; mỗi dải là hai ô liền nhau, giữa hai dải là một ô trống. ' +
        'Ghi ba màu vào danh sách rồi dùng for c in ...: mỗi màu chấm hai ô.',
      veMaMau: 'Chương trình có sẵn chỉ có hai màu trong danh sách. Thêm màu còn thiếu cho đúng thứ tự.',
      san: ['.........', '.........', '.........'],
      hinh: ['.........', 'rr.yy.bb.', '.........'],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(MAU(['red', 'yellow'], ['ink(c)', 'dot()', 'move()', 'dot()', 'move()', 'move()'])),
      loiGiai: bai(MAU(['red', 'yellow', 'blue'], ['ink(c)', 'dot()', 'move()', 'dot()', 'move()', 'move()'])),
      sao: { o: 10, nhip: 8 },
      loiSai: [
        { moTa: 'Đảo thứ tự màu: dải đầu thành xanh dương', baiLam: bai(MAU(['blue', 'yellow', 'red'], ['ink(c)', 'dot()', 'move()', 'dot()', 'move()', 'move()'])), phaiCoMa: [] },
        { moTa: 'Mỗi màu chỉ chấm một ô: dải nào cũng thiếu một ô', baiLam: bai(MAU(['red', 'yellow', 'blue'], ['ink(c)', 'dot()', 'move()', 'move()'])), phaiCoMa: ['to-thua'] }
      ],
      goiY: ['Danh sách giữ thứ tự: màu đứng trước được chấm trước.', 'Mỗi lần lặp: chọn màu, chấm, đi một ô, chấm, rồi đi hai ô để bỏ ô trống giữa hai dải.']
    }),

    man({
      so: 15, ten: 'Sửa danh sách màu', hang: 'bien-the', hamCuaEmCan: ['move'],
      deBai: 'Biển báo có bốn chấm màu theo thứ tự xanh dương, đỏ, vàng, xanh lá. Sola ghi danh sách màu nhưng đảo nhầm hai màu ở giữa. Sửa danh sách cho đúng.',
      veMaMau: 'Chương trình của Sola chấm sai màu hai chấm giữa. Chạy thử, so màu với hình mờ, rồi đổi chỗ hai màu trong danh sách.',
      san: ['.........', '.........', '.........'],
      hinh: ['.........', 'b.r.y.g..', '.........'],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(MAU(['blue', 'yellow', 'red', 'green'], CHAM)),
      loiGiai: bai(MAU(['blue', 'red', 'yellow', 'green'], CHAM)),
      sao: { o: 8, nhip: 7 },
      loiSai: [
        { moTa: 'Bỏ màu cuối: chấm xanh lá còn thiếu', baiLam: bai(MAU(['blue', 'red', 'yellow'], CHAM)), phaiCoMa: [] }
      ],
      goiY: ['So từng chấm với hình mờ từ trái sang phải.', 'Chỉ cần đổi chỗ hai chữ màu trong danh sách, thân vòng lặp giữ nguyên.']
    }),

    man({
      so: 16, ten: 'Biển báo phố', hang: 'trum', hamCuaEmCan: ['move', 'turn_right'], taoHam: ['paint_row'],
      deBai: 'Biển báo hai hàng: hàng trên đỏ, xanh dương, đỏ; hàng dưới cũng vậy nhưng lệch sang phải hai ô. Chế hàm paint_row(colors): ' +
        'với mỗi màu trong colors thì chọn màu, chấm, đi hai ô. Gọi hàm cho hai hàng, giữa hai hàng quay xe xuống hàng dưới.',
      veMaMau: 'Chương trình có sẵn đã ghi danh sách màu a. Chế hàm paint_row(colors) rồi gọi nó cho cả hai hàng.',
      san: ['.......', '.......', '.......'],
      hinh: ['r.b.r..', '..r.b.r', '.......'],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(['a = ["red", "blue", "red"]']),
      loiGiai: bai(['a = ["red", "blue", "red"]', 'paint_row(a)', 'turn_right()', 'move()', 'turn_right()', 'paint_row(a)'],
        { hamCuaEmMoi: [H('paint_row', ['colors'], T_PAINT_ROW)] }),
      sao: { o: 16, nhip: 14 },
      loiSai: [
        { moTa: 'Gọi hàm hai lần liền, quên xuống hàng: hàng trên bị chấm đè ra ô trống', baiLam: bai(['a = ["red", "blue", "red"]', 'paint_row(a)', 'paint_row(a)'], { hamCuaEmMoi: [H('paint_row', ['colors'], T_PAINT_ROW)] }), phaiCoMa: [] }
      ],
      goiY: ['Thân hàm giống vòng chấm màu ở màn Cờ ba màu, chỉ thay danh sách bằng tham số colors.',
        'Hết hàng trên xe đứng sau chấm cuối: quay phải, đi một ô, quay phải là xe quay ngược chiều ở hàng dưới.']
    }),

    /* ================================================= chương che-list "Chế lệnh: sơn theo danh sách" (dựng lại 30/10) =================================================
       Nghiệm thu độc lập 30/10 + user "làm cả A, B, C": chương Python B (duyệt for c in a, append, hàm nhận danh sách) nay chạy trên XE MÁY SƠN của gói, không cảm biến.
       Mười màn đo bãi cũ (che-list.1 … .10, cảm biến khoảng cách) sang mùa 5 (ẩn). Mã màn mới từ 11. */
    manL({
      so: 11, ten: 'Thêm vào cuối danh sách', hang: 'lam-quen', chiChay: true, hamCuaEmCan: ['move'],
      deBai: 'Khối mới: a.append(x) thêm x vào CUỐI danh sách a. Bấm Chạy xem: a bắt đầu rỗng, thêm đỏ, vàng, đỏ, rồi xe chấm lần lượt từng màu trong a.',
      veMaMau: 'Chương trình đã viết sẵn và khoá. Bấm Chạy, đếm xem a có mấy màu và theo thứ tự nào.',
      san: ['....'],
      hinh: ['ryr.'],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(C_L1),
      loiGiai: bai(C_L1),
      sao: { o: 11, nhip: 3 },
      goiY: ['a = [] là danh sách rỗng.', 'append luôn thêm vào cuối: thứ tự thêm cũng là thứ tự chấm.']
    }),

    manL({
      so: 12, ten: 'Danh sách sọc', hang: 'lam-quen', chinhCoDinh: false, hamCuaEmCan: ['move'],
      deBai: 'Vạch sọc sáu ô: đỏ, xanh dương, đỏ, xanh dương, đỏ, xanh dương. Dùng vòng for ba lần, mỗi lần thêm "red" rồi "blue" vào a; sau đó xe chấm theo a.',
      veMaMau: 'Chương trình có sẵn tạo a rỗng và đã có vòng chấm. Viết vòng for thêm màu vào a ở giữa.',
      san: ['.......'],
      hinh: ['rbrbrb.'],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(['a = []'].concat(CHAM_A)),
      loiGiai: bai(C_L2),
      sao: { o: 11, nhip: 6 },
      congThucKhac: [{ moTa: 'Viết thẳng cả danh sách', baiLam: bai(['a = ["red", "blue", "red", "blue", "red", "blue"]'].concat(CHAM_A)) }],
      loiSai: [
        { moTa: 'Thêm blue trước red: sọc ngược màu', baiLam: bai(['a = []', 'for i in range(3):', '    a.append("blue")', '    a.append("red")'].concat(CHAM_A)), phaiCoMa: [] },
        { moTa: 'append nằm ngoài vòng: a chỉ có hai màu', baiLam: bai(['a = []', 'for i in range(3):', '    pass', 'a.append("red")', 'a.append("blue")'].concat(CHAM_A)), phaiCoMa: [] }
      ],
      goiY: ['Mỗi vòng thêm hai màu: a.append("red") rồi a.append("blue").', 'Vòng chấm đặt SAU vòng thêm: a phải đủ màu trước khi chấm.']
    }),

    manL({
      so: 13, ten: 'Hàm chấm một hàng', hang: 'lam-quen', taoHam: ['dot_row'], hamCuaEmCan: ['move'],
      deBai: 'Chế dot_row(colors): với mỗi màu c trong colors, chọn màu c, chấm, đi một ô. Chương trình chính đã khóa: chấm đỏ xanh dương, bỏ một ô, rồi chấm vàng vàng đỏ.',
      veMaMau: 'Mở Xưởng hàm, tạo dot_row với một đối số colors. Khác paint_row: dot_row đi MỘT ô sau mỗi chấm.',
      san: ['.......'],
      hinh: ['rb.yyr.'],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(C_L3),
      loiGiai: bai(C_L3, { hamCuaEmMoi: [H('dot_row', ['colors'], T_DOT_ROW)] }),
      sao: { o: 10, nhip: 6 },
      loiSai: [
        { moTa: 'Gọi dot_row mà chưa chế hàm', baiLam: bai(C_L3), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Đi hai ô sau mỗi chấm như paint_row', baiLam: bai(C_L3), hamCuaEmMoi: [H('dot_row', ['colors'], T_PAINT_ROW)], phaiCoMa: [] }
      ],
      goiY: ['Thân hàm là vòng for c in colors.', 'Hàm dừng ở ô ngay sau chấm cuối.']
    }),

    manL({
      so: 14, ten: 'Hàm vạch sọc', hang: 'luyen', taoHam: ['stripes_row'], hamCuaEmCan: ['dot_row'],
      deBai: 'Chế stripes_row(c1, c2, n): tạo danh sách a rỗng, lặp n lần thêm c1 rồi c2 vào cuối a, rồi dot_row(a). Chương trình chính đã khóa: hai cặp đỏ vàng, rồi một cặp xanh dương xanh dương nối tiếp.',
      veMaMau: 'Tạo stripes_row với ba đối số c1, c2, n. Trong hàm gọi dot_row em vừa chế.',
      san: ['.......'],
      hinh: ['ryrybb.'],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(C_L4),
      loiGiai: bai(C_L4, { hamCuaEmMoi: [H('stripes_row', ['c1', 'c2', 'n'], T_STRIPES)] }),
      sao: { o: 14, nhip: 6 },
      loiSai: [
        { moTa: 'Gọi stripes_row mà chưa chế hàm', baiLam: bai(C_L4), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Chỉ thêm c1: thiếu màu thứ hai', baiLam: bai(C_L4), hamCuaEmMoi: [H('stripes_row', ['c1', 'c2', 'n'], ['a = []', 'for i in range(n):', '    a.append(c1)', 'dot_row(a)'])], phaiCoMa: [] }
      ],
      goiY: ['Mỗi vòng hai lệnh append: c1 rồi c2.', 'Dựng xong a mới gọi dot_row(a), ngoài vòng lặp.']
    }),

    manL({
      so: 15, ten: 'Nhân đôi màu', hang: 'luyen', chinhCoDinh: false, hamCuaEmCan: ['dot_row'],
      deBai: 'Mỗi màu trong a được chấm HAI ô liền nhau. Duyệt a, mỗi màu c thêm vào b hai lần, rồi dot_row(b).',
      veMaMau: 'Chương trình có sẵn có a và b rỗng, gọi dot_row(b). Viết vòng for c in a ở giữa.',
      san: ['.......'],
      hinh: ['rrbbyy.'],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(['a = ["red", "blue", "yellow"]', 'b = []', 'dot_row(b)']),
      loiGiai: bai(C_L5),
      sao: { o: 13, nhip: 6 },
      loiSai: [
        { moTa: 'Chấm thẳng a: mỗi màu một ô', baiLam: bai(['a = ["red", "blue", "yellow"]', 'dot_row(a)']), phaiCoMa: [] },
        { moTa: 'Thêm a vào b hai lần nối tiếp: đỏ xanh vàng đỏ xanh vàng', baiLam: bai(['a = ["red", "blue", "yellow"]', 'b = []', 'for c in a:', '    b.append(c)', 'for c in a:', '    b.append(c)', 'dot_row(b)']), phaiCoMa: [] }
      ],
      goiY: ['Trong vòng for c in a: hai dòng b.append(c).', 'Gọi dot_row(b) sau vòng lặp.']
    }),

    manL({
      so: 16, ten: 'Bỏ màu xanh', hang: 'luyen', chinhCoDinh: false, hamCuaEmCan: ['dot_row'],
      deBai: 'Danh sách a có lẫn màu xanh dương mà vạch này không dùng. Duyệt a, màu nào KHÁC "blue" thì thêm vào b, rồi dot_row(b).',
      veMaMau: 'Chương trình có sẵn chấm thẳng a nên chấm cả màu xanh ra ngoài hình. Lọc qua b trước.',
      san: ['......'],
      hinh: ['rryyr.'],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(['a = ["red", "blue", "red", "yellow", "blue", "yellow", "red"]', 'dot_row(a)']),
      loiGiai: bai(C_L6),
      sao: { o: 13, nhip: 5 },
      loiSai: [
        { moTa: 'Chấm thẳng a', baiLam: bai(['a = ["red", "blue", "red", "yellow", "blue", "yellow", "red"]', 'dot_row(a)']), phaiCoMa: [] },
        { moTa: 'Giữ lại màu xanh thay vì bỏ', baiLam: bai(['a = ["red", "blue", "red", "yellow", "blue", "yellow", "red"]', 'b = []', 'for c in a:', '    if c == "blue":', '        b.append(c)', 'dot_row(b)']), phaiCoMa: [] }
      ],
      goiY: ['if c != "blue": rồi mới b.append(c).', 'b chỉ có những màu được giữ, theo đúng thứ tự trong a.']
    }),

    manL({
      so: 17, ten: 'Sửa hàm nhân đôi', hang: 'bien-the', chinhCoDinh: false, hamCuaEmCan: ['dot_row'],
      deBai: 'Hàm của màn double_up(a, b) phải thêm mỗi màu của a vào b hai lần, nhưng một dòng append nằm ngoài vòng lặp nên chỉ màu cuối được đôi. Sửa double_up; chương trình chính đã đúng.',
      veMaMau: 'Chạy thử: vạch thiếu ô. Thụt dòng append thứ hai vào trong vòng for.',
      san: ['.........'],
      hinh: ['yyrrbbrr.'],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(C_L7, { hamCuaMan: [H('double_up', ['a', 'b'], ['for c in a:', '    b.append(c)', 'b.append(c)'])] }),
      loiGiai: bai(C_L7, { hamCuaMan: [H('double_up', ['a', 'b'], T_DOUBLE)] }),
      sao: { o: 11, nhip: 8 },
      loiSai: [
        { moTa: 'Không sửa', baiLam: bai(C_L7, { hamCuaMan: [H('double_up', ['a', 'b'], ['for c in a:', '    b.append(c)', 'b.append(c)'])] }), phaiCoMa: [] }
      ],
      goiY: ['Dòng nằm ngoài vòng chỉ chạy một lần, sau khi vòng xong.', 'Hai dòng append cùng thụt vào trong for.']
    }),

    manL({
      so: 18, ten: 'Hai hàng đối xứng', hang: 'bien-the', chinhCoDinh: false, hamCuaEmCan: ['dot_row', 'turn_right', 'move'],
      deBai: 'Hai hàng đối xứng như soi gương. Chấm hàng trên theo a bằng dot_row(a), xuống hàng dưới quay ngược chiều, rồi dot_row(a) lần nữa: xe đi ngược nên hàng dưới thành ảnh gương.',
      veMaMau: 'Chương trình có sẵn đã chấm hàng trên. Viết tiếp: quay xuống hàng dưới, đi thêm một ô cho đúng chỗ rồi chấm.',
      san: ['......', '......'],
      hinh: ['.rgby.', '.ybgr.'],
      batDau: { x: 1, y: 0, huong: 1 },
      maMau: bai(['a = ["red", "green", "blue", "yellow"]', 'dot_row(a)']),
      loiGiai: bai(C_L8),
      sao: { o: 16, nhip: 12 },
      loiSai: [
        { moTa: 'Quên đi thêm một ô: hàng dưới lệch ra ngoài hình', baiLam: bai(['a = ["red", "green", "blue", "yellow"]', 'dot_row(a)', 'turn_right()', 'move()', 'turn_right()', 'dot_row(a)']), phaiCoMa: [] }
      ],
      goiY: ['Hết hàng trên xe đứng sau chấm cuối: quay phải, đi một ô, quay phải.', 'Lúc đó xe ở ngoài hình một ô: đi thêm một ô rồi mới dot_row(a).']
    }),

    manL({
      so: 19, ten: 'Sửa hàm lọc màu', hang: 'bien-the', hamCuaEmCan: ['dot_row'],
      deBai: 'Hàm của màn keep_warm(a, b) phải giữ các màu ấm (khác "blue") nhưng lại so ngược. Sửa keep_warm; chương trình chính đã khóa: lọc a vào b rồi dot_row(b).',
      veMaMau: 'Chạy thử: chỉ màu xanh được chấm. Đổi phép so trong if.',
      san: ['.....'],
      hinh: ['ryyr.'],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(C_L9, { hamCuaMan: [H('keep_warm', ['a', 'b'], ['for c in a:', '    if c == "blue":', '        b.append(c)'])] }),
      loiGiai: bai(C_L9, { hamCuaMan: [H('keep_warm', ['a', 'b'], T_KEEP)] }),
      sao: { o: 11, nhip: 4 },
      loiSai: [
        { moTa: 'Không sửa: giữ màu xanh', baiLam: bai(C_L9, { hamCuaMan: [H('keep_warm', ['a', 'b'], ['for c in a:', '    if c == "blue":', '        b.append(c)'])] }), phaiCoMa: [] }
      ],
      goiY: ['!= nghĩa là khác.', 'Màu ấm: đỏ, vàng.']
    }),

    manL({
      so: 20, ten: 'Biển báo hai tầng', hang: 'trum', chinhCoDinh: false, hamCuaEmCan: ['dot_row', 'turn_right', 'move'], khung: { chinh: 16, moiHam: 10 },
      deBai: 'Biển báo hai tầng theo cùng danh sách a. Tầng trên: mỗi màu của a chấm hai ô liền nhau. Tầng dưới (xe đi ngược lại): chỉ các màu khác "blue", mỗi màu một ô. ' +
        'Tự viết: dựng danh sách cho từng tầng bằng for và append, rồi dot_row.',
      veMaMau: 'Chương trình có sẵn chỉ có a. Viết cả hai tầng.',
      san: ['.........', '.........'],
      hinh: ['rrbbrryy.', '.....yrr.'],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: bai(['a = ["red", "blue", "red", "yellow"]']),
      loiGiai: bai(C_L10),
      sao: { o: 24, nhip: 15 },
      loiSai: [
        { moTa: 'Tầng dưới chấm cả màu xanh', baiLam: bai(['a = ["red", "blue", "red", "yellow"]', 'b = []', 'for c in a:', '    b.append(c)', '    b.append(c)', 'dot_row(b)', 'turn_right()', 'move()', 'turn_right()', 'move()', 'dot_row(a)']), phaiCoMa: [] },
        { moTa: 'Tầng trên mỗi màu một ô', baiLam: bai(['a = ["red", "blue", "red", "yellow"]', 'dot_row(a)']), phaiCoMa: [] }
      ],
      goiY: ['Tầng trên: như màn Nhân đôi màu. Tầng dưới: như màn Bỏ màu xanh.', 'Giữa hai tầng: quay phải, đi một ô, quay phải, đi một ô.']
    })
  ];

  ManHoc.manChamSon = DS;
  if (laNode) module.exports = ManHoc;
})();
