/* ============================================================================
   man-cham-son.js — "Mật Lệnh Robot": NGÂN HÀNG MÀN MỚI của mùa 4, gói 2 "Chấm sơn" (KE-HOACH-MUA-4.md; phiên "Mùa 4" tự viết, 29/10).
   Khung mùa 4 (lo-trinh-hoc.js, khối "MÙA 4 = 10 GÓI", mảng MUA_4) xếp màn: dòng chương trong MUA_4 khai ĐỦ thứ tự 10 màn.
     - `may-son`: chương 1 "Chấm từng ô": màn mới khai so từ 11 (may-son.1 … .10 đã có; gói này giữ .1, .2, .6, .7 dùng dot(), các màn nét liền về gói 6).
       Thứ tự: 11 (trình diễn) · 1 · 2 · 12 · 6 · 7 · 14 · 15 · 13 · 16 (trùm) (xếp theo đường cong nhịp).
       Cái mới của gói: em lắp MÁY SƠN cho R1 (xe hai bánh, như các màn may-son có sẵn): ink(c) chọn màu, dot() chấm ô đang đứng. CHƯA có bút liền
       pen_down / pen_up (gói 6 Nét liền). Python mùa 4: danh sách màu (for c in [...]).
     - `che-list`: chương 2 "Chế lệnh: sơn theo danh sách" DỰNG LẠI 30/10 (nghiệm thu độc lập: chương cũ đo bãi bằng cảm biến khoảng cách không dính máy sơn):
       che-list.11 … .20 trên xe máy sơn, Python B: append (trình diễn) · lặp để thêm · chế dot_row · chế mix_row (append trong hàm) · nhân đôi màu · bỏ màu xanh
       · sửa double_up · hai hàng đối xứng · sửa keep_warm · trùm biển báo hai tầng. Mười màn cũ sang mùa 5 (che-list-cu, ẩn).
   Luật máy sơn (san-hoc.js phần MÁY SƠN): mục tiêu 'to-hinh': tô đủ hình mờ (man.hinh, chữ r g b y) đúng màu, KHÔNG tô ra ngoài hình (tô ngoài là thua ngay,
   'to-thua'); dot() chỉ ra lệnh, có hiệu lực ở nhịp kế (move() hay wait()); ink(c) đổi màu ngay, không tốn nhịp.
   Máy kiểm: hoc/kiem-man-mua-4.mjs, hoc/kiem-lo-trinh.mjs mục mùa 4, hoc/kiem-may-son.mjs.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  // Khay gói 2: drone + ink / dot (bút liền mở ở gói 6, khối MUA_4 cũng bớt pen_down / pen_up khỏi khay gói 1–5).
  var KHAY = ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'ink', 'dot'];
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  function bai(chinh, them) { return Object.assign({ chinh: chinh.slice() }, them || {}); }
  /** for c in danh sách màu: thân (mảng dòng). */
  function MAU(ds, than) { return ['for c in [' + ds.map(function (c) { return '"' + c + '"'; }).join(', ') + ']:'].concat(than.map(function (s) { return '    ' + s; })); }
  var CHAM = ['ink(c)', 'dot()', 'go_right()', 'go_right()'];
  var T_PAINT_ROW = ['for c in colors:', '    ink(c)', '    dot()', '    go_right()', '    go_right()'];
  var T_DOTS = ['for i in range(n):', '    dot()', '    go_right()', '    go_right()'];

  function man(m) {
    m.chuong = 'may-son';
    m.loaiRobot = 'drone';
    m.robot = { than: 'drone', tay: 'son', camBien: [] };
    m.hamGoc = m.hamGoc || KHAY.slice();
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = m.khung || { chinh: 10, moiHam: 10 };
    m.cauTruc = ['for', 'if', 'while', 'list'];
    m.mucTieu = 'to-hinh';
    m.nhipTheoLoiGiai = true;
    m.loiSai = m.loiSai || [];
    return ManHoc.chuanHoa(m);
  }

  /** Màn chương che-list (dựng lại 31/10): drone gắn bộ gieo hạt dưới bụng, Python B (for c in a, append, hàm nhận danh sách); chương trình chính khoá trừ khi khai chinhCoDinh: false. */
  function manL(m) {
    var mo = m.chinhCoDinh;
    var r = man(m);
    r.chuong = 'che-list';
    if (mo === false) delete r.chinhCoDinh; else r.chinhCoDinh = true;
    return r;
  }
  var T_DOT_ROW = ['for c in colors:', '    ink(c)', '    dot()', '    go_right()'];
  var CHAM_A = ['for c in a:', '    ink(c)', '    dot()', '    go_right()'];
  var C_L1 = ['a = []', 'a.append("red")', 'a.append("yellow")', 'a.append("red")'].concat(CHAM_A);
  var C_L2 = ['a = []', 'for i in range(3):', '    a.append("red")', '    a.append("blue")'].concat(CHAM_A);
  var C_L3 = ['dot_row(["red", "blue"])', 'go_right()', 'dot_row(["yellow", "yellow", "red"])'];
  var T_STRIPES = ['a = []', 'for i in range(n):', '    a.append(c1)', '    a.append(c2)', 'dot_row(a)'];
  var C_L4 = ['mix_row("red", "yellow", 2)', 'mix_row("blue", "blue", 1)'];
  var C_L5 = ['a = ["red", "blue", "yellow"]', 'b = []', 'for c in a:', '    b.append(c)', '    b.append(c)', 'dot_row(b)'];
  var C_L6 = ['a = ["red", "blue", "red", "yellow", "blue", "yellow", "red"]', 'b = []', 'for c in a:', '    if c != "blue":', '        b.append(c)', 'dot_row(b)'];
  var T_DOUBLE = ['for c in a:', '    b.append(c)', '    b.append(c)'];
  var C_L7 = ['a = ["yellow", "red", "blue", "red"]', 'b = []', 'double_up(a, b)', 'dot_row(b)'];
  var C_L8 = ['a = ["red", "green", "blue", "yellow"]', 'dot_row(a)', 'go_down()', 'go_left()', 'go_left()', 'dot_row(a)'];
  var T_KEEP = ['for c in a:', '    if c != "blue":', '        b.append(c)'];
  var C_L9 = ['a = ["red", "blue", "yellow", "yellow", "blue", "red"]', 'b = []', 'keep_warm(a, b)', 'dot_row(b)'];
  var C_L10 = ['a = ["red", "blue", "red", "yellow"]', 'b = []', 'for c in a:', '    b.append(c)', '    b.append(c)', 'dot_row(b)', 'go_down()',
    'd = []', 'for c in a:', '    if c != "blue":', '        d.append(c)', 'dot_row(d)'];

  var DS = [
    man({
      so: 11, ten: 'Máy sơn chấm màu', hang: 'lam-quen', chiChay: true, chinhCoDinh: true, hamCuaEmCan: [],
      deBai: 'Em lắp bộ gieo hạt dưới bụng drone. ink("blue") chọn hạt xanh dương, dot() gieo một bông vào ô ngay dưới bụng drone. ' +
        'Bấm Chạy xem drone chấm một chấm xanh, bay sang phải một ô, đổi sang hạt đỏ rồi chấm chấm thứ hai đúng hình mờ.',
      veMaMau: 'Chương trình đã viết sẵn và khoá. Bấm Chạy, nhìn hai chấm hiện lên đúng hai ô của hình mờ.',
      san: ['...', '...', '...'],
      hinh: ['...', 'br.', '...'],
      batDau: { x: 0, y: 1, huong: 0 },
      maMau: bai(['ink("blue")', 'dot()', 'go_right()', 'ink("red")', 'dot()', 'wait()']),
      loiGiai: bai(['ink("blue")', 'dot()', 'go_right()', 'ink("red")', 'dot()', 'wait()']),
      sao: { o: 6, nhip: 2 },
      goiY: ['ink() đổi màu ngay, không mất nhịp.', 'dot() chấm vào ô dưới bụng drone ở nhịp kế tiếp, trước khi bay.']
    }),

    man({
      so: 12, ten: 'Bốn chấm một hàng', hang: 'lam-quen', hamCuaEmCan: [],
      deBai: 'Hình mờ là bốn chấm đỏ cách nhau một ô trên cùng một hàng. Chấm, bay sang phải hai ô, chấm tiếp: lặp cho gọn. Đừng chấm vào ô trống giữa hai chấm.',
      veMaMau: 'Chương trình có sẵn mới chấm một chấm. Dùng vòng for để chấm đủ bốn chấm.',
      san: ['.......', '.......', '.......'],
      hinh: ['.......', 'r.r.r.r', '.......'],
      batDau: { x: 0, y: 1, huong: 0 },
      maMau: bai(['dot()', 'wait()']),
      loiGiai: bai(['for i in range(3):', '    dot()', '    go_right()', '    go_right()', 'dot()', 'wait()']),
      sao: { o: 6, nhip: 7 },
      loiGiaiKhac: { moTa: 'Chấm cuối đi kèm một bước go_right() thay cho wait()', baiLam: bai(['for i in range(3):', '    dot()', '    go_right()', '    go_right()', 'dot()', 'go_right()']) },
      loiSai: [
        { moTa: 'Chỉ bay một ô giữa hai chấm: chấm trúng ô trống ngoài hình', baiLam: bai(['for i in range(4):', '    dot()', '    go_right()']), phaiCoMa: ['to-thua'] },
        { moTa: 'Lặp ba lần mà thiếu chấm thứ tư', baiLam: bai(['for i in range(3):', '    dot()', '    go_right()', '    go_right()']), phaiCoMa: [] }
      ],
      goiY: ['Mỗi chấm cách nhau một ô trống: sau dot() phải bay sang phải hai ô.', 'Ba lần lặp được ba chấm; chấm thứ tư viết sau vòng lặp, kèm wait() cho nhịp trôi.']
    }),

    man({
      so: 13, ten: 'Hai hàng chấm', hang: 'bien-the', hamCuaEmCan: ['dots'],
      deBai: 'Hai hàng chấm đỏ: hàng trên chấm ở cột 1, 3; hàng dưới chấm ở cột 3, 5. Dùng hàm dots(n) em đã chế để chấm mỗi hàng, ' +
        'giữa hai hàng bay xuống rồi bay trái hai ô về đầu hàng dưới.',
      veMaMau: 'Chương trình có sẵn chấm xong hàng trên. Viết tiếp để drone xuống hàng dưới, lùi sang trái hai ô rồi gọi dots(2).',
      san: ['.......', '.......', '.......'],
      hinh: ['r.r....', '..r.r..', '.......'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: bai(['dots(2)']),
      loiGiai: bai(['dots(2)', 'go_down()', 'go_left()', 'go_left()', 'dots(2)']),
      sao: { o: 9, nhip: 10 },
      loiGiaiKhac: { moTa: 'Bay trái hai ô trước rồi mới bay xuống hàng dưới', baiLam: bai(['dots(2)', 'go_left()', 'go_left()', 'go_down()', 'dots(2)']) },
      loiSai: [
        { moTa: 'Chỉ bay trái một ô ở hàng dưới: chấm trúng ô trống', baiLam: bai(['dots(2)', 'go_down()', 'go_left()', 'dots(2)']), phaiCoMa: ['to-thua'] },
        { moTa: 'Quên xuống hàng: chấm lại hàng trên, trúng ô trống', baiLam: bai(['dots(2)', 'go_left()', 'go_left()', 'dots(2)']), phaiCoMa: ['to-thua'] }
      ],
      goiY: ['dots(2) chấm hai chấm, mỗi chấm bay sang phải hai ô: hết hàng trên drone đứng ở cột 5.', 'Bay xuống một ô rồi bay trái hai ô là tới đúng cột 3 của hàng dưới.']
    }),

    man({
      so: 14, ten: 'Cờ ba màu', hang: 'luyen', hamCuaEmCan: [],
      deBai: 'Lá cờ trên tường phố có ba dải màu đỏ, vàng, xanh dương; mỗi dải là hai ô liền nhau, giữa hai dải là một ô trống. ' +
        'Ghi ba màu vào danh sách rồi dùng for c in ...: mỗi màu chấm hai ô.',
      veMaMau: 'Chương trình có sẵn chỉ có hai màu trong danh sách. Thêm màu còn thiếu cho đúng thứ tự.',
      san: ['.........', '.........', '.........'],
      hinh: ['.........', 'rr.yy.bb.', '.........'],
      batDau: { x: 0, y: 1, huong: 0 },
      maMau: bai(MAU(['red', 'yellow'], ['ink(c)', 'dot()', 'go_right()', 'dot()', 'go_right()', 'go_right()'])),
      loiGiai: bai(MAU(['red', 'yellow', 'blue'], ['ink(c)', 'dot()', 'go_right()', 'dot()', 'go_right()', 'go_right()'])),
      sao: { o: 7, nhip: 8 },
      loiSai: [
        { moTa: 'Đảo thứ tự màu: dải đầu thành xanh dương', baiLam: bai(MAU(['blue', 'yellow', 'red'], ['ink(c)', 'dot()', 'go_right()', 'dot()', 'go_right()', 'go_right()'])), phaiCoMa: [] },
        { moTa: 'Mỗi màu chỉ chấm một ô: dải nào cũng thiếu một ô', baiLam: bai(MAU(['red', 'yellow', 'blue'], ['ink(c)', 'dot()', 'go_right()', 'go_right()'])), phaiCoMa: ['to-thua'] }
      ],
      goiY: ['Danh sách giữ thứ tự: màu đứng trước được chấm trước.', 'Mỗi lần lặp: chọn màu, chấm, bay phải một ô, chấm, rồi bay phải hai ô để bỏ ô trống giữa hai dải.']
    }),

    man({
      so: 15, ten: 'Sửa danh sách màu', hang: 'bien-the', hamCuaEmCan: [],
      deBai: 'Biển báo có bốn chấm màu theo thứ tự xanh dương, đỏ, vàng, xanh lá. Sola ghi danh sách màu nhưng đảo nhầm hai màu ở giữa. Sửa danh sách cho đúng.',
      veMaMau: 'Chương trình của Sola chấm sai màu hai chấm giữa. Chạy thử, so màu với hình mờ, rồi đổi chỗ hai màu trong danh sách.',
      san: ['.........', '.........', '.........'],
      hinh: ['.........', 'b.r.y.g..', '.........'],
      batDau: { x: 0, y: 1, huong: 0 },
      maMau: bai(MAU(['blue', 'yellow', 'red', 'green'], CHAM)),
      loiGiai: bai(MAU(['blue', 'red', 'yellow', 'green'], CHAM)),
      sao: { o: 5, nhip: 7 },
      loiSai: [
        { moTa: 'Bỏ màu cuối: chấm xanh lá còn thiếu', baiLam: bai(MAU(['blue', 'red', 'yellow'], CHAM)), phaiCoMa: [] }
      ],
      goiY: ['So từng chấm với hình mờ từ trái sang phải.', 'Chỉ cần đổi chỗ hai chữ màu trong danh sách, thân vòng lặp giữ nguyên.']
    }),

    man({
      so: 16, ten: 'Biển báo phố', hang: 'trum', hamCuaEmCan: [], taoHam: ['plant_row'],
      deBai: 'Biển báo hai hàng: hàng trên đỏ, xanh dương, đỏ; hàng dưới cũng vậy nhưng lệch sang phải bốn ô. Chế hàm plant_row(colors): ' +
        'với mỗi màu trong colors thì chọn màu, chấm, bay sang phải hai ô. Gọi hàm cho hai hàng, giữa hai hàng bay xuống rồi bay trái hai ô.',
      veMaMau: 'Chương trình có sẵn đã ghi danh sách màu a. Chế hàm plant_row(colors) rồi gọi nó cho cả hai hàng.',
      san: ['.......###', '..........', '###.......'],
      hinh: ['r.b.r.....', '....r.b.r.', '..........'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: bai(['a = ["red", "blue", "red"]']),
      loiGiai: bai(['a = ["red", "blue", "red"]', 'plant_row(a)', 'go_down()', 'go_left()', 'go_left()', 'plant_row(a)'],
        { hamCuaEmMoi: [H('plant_row', ['colors'], T_PAINT_ROW)] }),
      sao: { o: 11, nhip: 14 },
      loiSai: [
        { moTa: 'Gọi hàm hai lần liền, quên xuống hàng: chấm ra ngoài hình', baiLam: bai(['a = ["red", "blue", "red"]', 'plant_row(a)', 'plant_row(a)'], { hamCuaEmMoi: [H('plant_row', ['colors'], T_PAINT_ROW)] }), phaiCoMa: [] }
      ],
      goiY: ['Thân hàm giống vòng chấm màu ở màn Sửa danh sách màu, chỉ thay danh sách bằng tham số colors.',
        'Hết hàng trên drone đứng ở cột 7: bay xuống một ô, bay trái hai ô là tới cột 5 của hàng dưới.']
    }),

    /* ================================================= chương che-list "Chế lệnh: sơn theo danh sách" (dựng lại 31/10) =================================================
       Chương Python B (duyệt for c in a, append, hàm nhận danh sách) chạy trên DRONE GIEO HẠT của gói 2, không cảm biến.
       Mười màn đo bãi cũ (che-list.1 … .10, cảm biến khoảng cách) sang mùa 5 (ẩn). Mã màn mới từ 11. */
    manL({
      so: 11, ten: 'Thêm vào cuối danh sách', hang: 'lam-quen', chiChay: true, hamCuaEmCan: [],
      deBai: 'Khối mới: a.append(x) thêm x vào CUỐI danh sách a. Bấm Chạy xem: a bắt đầu rỗng, thêm đỏ, vàng, đỏ, rồi drone chấm lần lượt từng màu trong a.',
      veMaMau: 'Chương trình đã viết sẵn và khoá. Bấm Chạy, đếm xem a có mấy màu và theo thứ tự nào.',
      san: ['....'],
      hinh: ['ryr.'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: bai(C_L1),
      loiGiai: bai(C_L1),
      sao: { o: 8, nhip: 3 },
      goiY: ['a = [] là danh sách rỗng.', 'append luôn thêm vào cuối: thứ tự thêm cũng là thứ tự chấm.']
    }),

    manL({
      so: 12, ten: 'Danh sách sọc', hang: 'lam-quen', chinhCoDinh: false, hamCuaEmCan: [],
      deBai: 'Vạch sọc sáu ô: đỏ, xanh dương, đỏ, xanh dương, đỏ, xanh dương. Dùng vòng for ba lần, mỗi lần thêm "red" rồi "blue" vào a; sau đó drone chấm theo a.',
      veMaMau: 'Chương trình có sẵn tạo a rỗng và đã có vòng chấm. Viết vòng for thêm màu vào a ở giữa.',
      san: ['.......'],
      hinh: ['rbrbrb.'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: bai(['a = []'].concat(CHAM_A)),
      loiGiai: bai(C_L2),
      sao: { o: 8, nhip: 6 },
      congThucKhac: [{ moTa: 'Viết thẳng cả danh sách', baiLam: bai(['a = ["red", "blue", "red", "blue", "red", "blue"]'].concat(CHAM_A)) }],
      loiSai: [
        { moTa: 'Thêm blue trước red: sọc ngược màu', baiLam: bai(['a = []', 'for i in range(3):', '    a.append("blue")', '    a.append("red")'].concat(CHAM_A)), phaiCoMa: [] },
        { moTa: 'append nằm ngoài vòng: a chỉ có hai màu', baiLam: bai(['a = []', 'for i in range(3):', '    pass', 'a.append("red")', 'a.append("blue")'].concat(CHAM_A)), phaiCoMa: [] }
      ],
      goiY: ['Mỗi vòng thêm hai màu: a.append("red") rồi a.append("blue").', 'Vòng chấm đặt SAU vòng thêm: a phải đủ màu trước khi chấm.']
    }),

    manL({
      so: 13, ten: 'Hàm chấm một hàng', hang: 'lam-quen', taoHam: ['dot_row'], hamCuaEmCan: [],
      deBai: 'Chế dot_row(colors): với mỗi màu c trong colors, chọn màu c, chấm, bay sang phải một ô. Chương trình chính đã khóa: chấm đỏ xanh dương, bỏ một ô, rồi chấm vàng vàng đỏ.',
      veMaMau: 'Mở Xưởng hàm, tạo dot_row với một đối số colors. Khác plant_row: dot_row chỉ bay MỘT ô sau mỗi chấm.',
      san: ['.......'],
      hinh: ['rb.yyr.'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: bai(C_L3),
      loiGiai: bai(C_L3, { hamCuaEmMoi: [H('dot_row', ['colors'], T_DOT_ROW)] }),
      sao: { o: 7, nhip: 6 },
      loiSai: [
        { moTa: 'Gọi dot_row mà chưa chế hàm', baiLam: bai(C_L3), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Bay hai ô sau mỗi chấm như plant_row', baiLam: bai(C_L3), hamCuaEmMoi: [H('dot_row', ['colors'], T_PAINT_ROW)], phaiCoMa: [] }
      ],
      goiY: ['Thân hàm là vòng for c in colors.', 'Hàm dừng ở ô ngay bên phải chấm cuối.']
    }),

    manL({
      so: 14, ten: 'Hàm vạch sọc', hang: 'luyen', taoHam: ['mix_row'], hamCuaEmCan: ['dot_row'],
      deBai: 'Chế mix_row(c1, c2, n): tạo danh sách a rỗng, lặp n lần thêm c1 rồi c2 vào cuối a, rồi dot_row(a). Chương trình chính đã khóa: hai cặp đỏ vàng, rồi một cặp xanh dương xanh dương nối tiếp.',
      veMaMau: 'Tạo mix_row với ba đối số c1, c2, n. Trong hàm gọi dot_row em vừa chế.',
      san: ['.......'],
      hinh: ['ryrybb.'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: bai(C_L4),
      loiGiai: bai(C_L4, { hamCuaEmMoi: [H('mix_row', ['c1', 'c2', 'n'], T_STRIPES)] }),
      sao: { o: 11, nhip: 6 },
      loiSai: [
        { moTa: 'Gọi mix_row mà chưa chế hàm', baiLam: bai(C_L4), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Chỉ thêm c1: thiếu màu thứ hai', baiLam: bai(C_L4), hamCuaEmMoi: [H('mix_row', ['c1', 'c2', 'n'], ['a = []', 'for i in range(n):', '    a.append(c1)', 'dot_row(a)'])], phaiCoMa: [] }
      ],
      goiY: ['Mỗi vòng hai lệnh append: c1 rồi c2.', 'Dựng xong a mới gọi dot_row(a), ngoài vòng lặp.']
    }),

    manL({
      so: 15, ten: 'Nhân đôi màu', hang: 'luyen', chinhCoDinh: false, hamCuaEmCan: ['dot_row'],
      deBai: 'Mỗi màu trong a được chấm HAI ô liền nhau. Duyệt a, mỗi màu c thêm vào b hai lần, rồi dot_row(b).',
      veMaMau: 'Chương trình có sẵn có a và b rỗng, gọi dot_row(b). Viết vòng for c in a ở giữa.',
      san: ['.......'],
      hinh: ['rrbbyy.'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: bai(['a = ["red", "blue", "yellow"]', 'b = []', 'dot_row(b)']),
      loiGiai: bai(C_L5),
      sao: { o: 10, nhip: 6 },
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
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: bai(['a = ["red", "blue", "red", "yellow", "blue", "yellow", "red"]', 'dot_row(a)']),
      loiGiai: bai(C_L6),
      sao: { o: 10, nhip: 5 },
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
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: bai(C_L7, { hamCuaMan: [H('double_up', ['a', 'b'], ['for c in a:', '    b.append(c)', 'b.append(c)'])] }),
      loiGiai: bai(C_L7, { hamCuaMan: [H('double_up', ['a', 'b'], T_DOUBLE)] }),
      sao: { o: 8, nhip: 8 },
      loiSai: [
        { moTa: 'Không sửa', baiLam: bai(C_L7, { hamCuaMan: [H('double_up', ['a', 'b'], ['for c in a:', '    b.append(c)', 'b.append(c)'])] }), phaiCoMa: [] }
      ],
      goiY: ['Dòng nằm ngoài vòng chỉ chạy một lần, sau khi vòng xong.', 'Hai dòng append cùng thụt vào trong for.']
    }),

    manL({
      so: 18, ten: 'Hai hàng lệch bậc', hang: 'bien-the', chinhCoDinh: false, hamCuaEmCan: ['dot_row'],
      deBai: 'Hai hàng bốn màu theo cùng danh sách a, hàng dưới lệch sang phải hai ô so với hàng trên. Chấm hàng trên bằng dot_row(a), bay xuống hàng dưới, bay trái hai ô về đầu hàng dưới rồi dot_row(a) lần nữa.',
      veMaMau: 'Chương trình có sẵn đã chấm hàng trên. Viết tiếp: bay xuống hàng dưới, lùi sang trái hai ô cho đúng chỗ rồi chấm.',
      san: ['.......', '.......'],
      hinh: ['rgby...', '..rgby.'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: bai(['a = ["red", "green", "blue", "yellow"]', 'dot_row(a)']),
      loiGiai: bai(C_L8),
      sao: { o: 10, nhip: 11 },
      loiSai: [
        { moTa: 'Chỉ bay trái một ô: hàng dưới lệch ra ngoài hình', baiLam: bai(['a = ["red", "green", "blue", "yellow"]', 'dot_row(a)', 'go_down()', 'go_left()', 'dot_row(a)']), phaiCoMa: [] }
      ],
      goiY: ['Hết hàng trên drone đứng ở cột 5: bay xuống một ô là ở hàng dưới.', 'Từ cột 5 bay trái hai ô tới cột 3 rồi mới gọi dot_row(a).']
    }),

    manL({
      so: 19, ten: 'Sửa hàm lọc màu', hang: 'bien-the', hamCuaEmCan: ['dot_row'],
      deBai: 'Hàm của màn keep_warm(a, b) phải giữ các màu ấm (khác "blue") nhưng lại so ngược. Sửa keep_warm; chương trình chính đã khóa: lọc a vào b rồi dot_row(b).',
      veMaMau: 'Chạy thử: chỉ màu xanh được chấm. Đổi phép so trong if.',
      san: ['.....'],
      hinh: ['ryyr.'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: bai(C_L9, { hamCuaMan: [H('keep_warm', ['a', 'b'], ['for c in a:', '    if c == "blue":', '        b.append(c)'])] }),
      loiGiai: bai(C_L9, { hamCuaMan: [H('keep_warm', ['a', 'b'], T_KEEP)] }),
      sao: { o: 8, nhip: 4 },
      loiSai: [
        { moTa: 'Không sửa: giữ màu xanh', baiLam: bai(C_L9, { hamCuaMan: [H('keep_warm', ['a', 'b'], ['for c in a:', '    if c == "blue":', '        b.append(c)'])] }), phaiCoMa: [] }
      ],
      goiY: ['!= nghĩa là khác.', 'Màu ấm: đỏ, vàng.']
    }),

    manL({
      so: 20, ten: 'Biển báo hai tầng', hang: 'trum', chinhCoDinh: false, hamCuaEmCan: ['dot_row'], khung: { chinh: 16, moiHam: 10 },
      deBai: 'Biển báo hai tầng theo cùng danh sách a. Tầng trên: mỗi màu của a chấm hai ô liền nhau. Hết tầng trên thì bay xuống một ô để chấm tầng dưới nối tiếp sang phải: chỉ các màu khác "blue", mỗi màu một ô. ' +
        'Tự viết: dựng danh sách cho từng tầng bằng for và append, rồi dot_row.',
      veMaMau: 'Chương trình có sẵn chỉ có a. Viết cả hai tầng.',
      san: ['.........###', '............'],
      hinh: ['rrbbrryy....', '........rry.'],
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: bai(['a = ["red", "blue", "red", "yellow"]']),
      loiGiai: bai(C_L10),
      sao: { o: 16, nhip: 12 },
      loiSai: [
        { moTa: 'Tầng dưới chấm cả màu xanh', baiLam: bai(['a = ["red", "blue", "red", "yellow"]', 'b = []', 'for c in a:', '    b.append(c)', '    b.append(c)', 'dot_row(b)', 'go_down()', 'dot_row(a)']), phaiCoMa: [] },
        { moTa: 'Tầng trên mỗi màu một ô', baiLam: bai(['a = ["red", "blue", "red", "yellow"]', 'dot_row(a)']), phaiCoMa: [] }
      ],
      goiY: ['Tầng trên: như màn Nhân đôi màu. Tầng dưới: như màn Bỏ màu xanh.', 'Hết tầng trên drone đứng ngay trên đầu tầng dưới: chỉ cần một lần go_down().']
    })
  ];

  // PDM4a (31/10): nâng cấp 4 màn cũ may-son.1, .2, .6, .7 sang drone gắn bộ gieo hạt dưới bụng (ngân hàng man-may-son.js giữ nguyên cho kiem-hoc.mjs).
  var SUA_CHAM_SON = {
    'may-son.1': {
      loaiRobot: 'drone', robot: { than: 'drone', tay: 'son', camBien: [] }, hamGoc: KHAY.slice(), hamCuaEmCan: [],
      deBai: 'Drone gắn bộ gieo hạt dưới bụng: dot() chấm vào ô ngay dưới drone. Hình mờ có hai chấm đỏ cách nhau một ô. Chấm đủ hai chấm, không chấm ra ngoài hình.',
      veMaMau: 'Chương trình có sẵn chấm được chấm thứ nhất. Viết tiếp để drone bay tới chấm thứ hai rồi chấm.',
      batDau: { x: 0, y: 1, huong: 0 },
      maMau: { chinh: ['dot()', 'wait()'] },
      sao: { o: 5, nhip: 3 },
      loiGiai: { chinh: ['dot()', 'go_right()', 'go_right()', 'dot()', 'wait()'] },
      loiGiaiKhac: {
        moTa: 'Chấm ở một nhịp riêng rồi mới bay (thêm dòng wait())',
        baiLam: { chinh: ['dot()', 'wait()', 'go_right()', 'go_right()', 'dot()', 'wait()'] }
      },
      loiSai: [
        { moTa: 'Không viết thêm: mới có một chấm', baiLam: { chinh: ['dot()', 'wait()'] }, phaiCoMa: ['chua-to-hinh'] },
        { moTa: 'Chấm ở mọi ô: chấm ra ngoài hình', baiLam: { chinh: ['dot()', 'go_right()', 'dot()', 'go_right()', 'dot()', 'wait()'] }, phaiCoMa: ['to-thua'] },
        { moTa: 'Quên wait() sau chấm cuối: lệnh chấm chưa chạy', baiLam: { chinh: ['dot()', 'go_right()', 'go_right()', 'dot()'] }, phaiCoMa: ['quen-wait', 'chua-to-hinh'] }
      ],
      goiY: ['dot() chỉ ra lệnh: cần wait() hay một lệnh bay như go_right() để nhịp chạy.',
        'dot() rồi go_right() là một nhịp: chấm xong drone mới bay.']
    },
    'may-son.2': {
      loaiRobot: 'drone', robot: { than: 'drone', tay: 'son', camBien: [] }, hamGoc: KHAY.slice(), hamCuaEmCan: [],
      deBai: 'Hình mờ có một chấm đỏ và một chấm xanh dương. Chương trình có sẵn chấm cả hai bằng màu đỏ. Thêm ink("blue") đúng chỗ để chấm thứ hai màu xanh dương.',
      veMaMau: 'Lúc đầu bộ gieo hạt mang màu đỏ. ink(c) đổi màu ngay, không tốn nhịp.',
      batDau: { x: 0, y: 1, huong: 0 },
      maMau: { chinh: ['dot()', 'go_right()', 'go_right()', 'dot()', 'wait()'] },
      sao: { o: 6, nhip: 3 },
      loiGiai: { chinh: ['dot()', 'go_right()', 'go_right()', 'ink("blue")', 'dot()', 'wait()'] },
      loiGiaiKhac: {
        moTa: 'Chọn lại màu đỏ cho chấm đầu cho chắc (thêm ink("red"))',
        baiLam: { chinh: ['ink("red")', 'dot()', 'go_right()', 'go_right()', 'ink("blue")', 'dot()', 'wait()'] }
      },
      loiSai: [
        { moTa: 'Không sửa gì: chấm thứ hai vẫn đỏ', baiLam: { chinh: ['dot()', 'go_right()', 'go_right()', 'dot()', 'wait()'] }, phaiCoMa: ['chua-to-hinh'] },
        { moTa: 'Viết hoa tên màu: ink("Blue")', baiLam: { chinh: ['dot()', 'go_right()', 'go_right()', 'ink("Blue")', 'dot()', 'wait()'] }, phaiCoMa: ['mau-son-sai'] },
        { moTa: 'Đổi màu ngay từ đầu: cả hai chấm xanh dương', baiLam: { chinh: ['ink("blue")', 'dot()', 'go_right()', 'go_right()', 'dot()', 'wait()'] }, phaiCoMa: ['chua-to-hinh'] }
      ],
      goiY: ['ink(c) đổi màu ngay lúc chạy tới dòng đó, các chấm sau mới mang màu mới.',
        'Tên màu viết chữ thường, trong dấu nháy: "blue".']
    },
    'may-son.6': {
      loaiRobot: 'drone', robot: { than: 'drone', tay: 'son', camBien: [] }, hamGoc: KHAY.slice(), hamCuaEmCan: [], taoHam: ['dots'],
      deBai: 'Hình mờ là ba chấm đỏ, chấm nọ cách chấm kia một ô. Chế dots(n): chấm n chấm cách quãng như vậy sang phải. Chương trình gọi dots(3).',
      veMaMau: 'Chương trình đã gọi dots(3). Mở Xưởng hàm, tạo dots với đối số n rồi viết thân hàm.',
      batDau: { x: 0, y: 1, huong: 0 },
      maMau: { chinh: ['dots(3)'] },
      sao: { o: 5, nhip: 5 },
      loiGiai: { chinh: ['dots(3)'], hamCuaEmMoi: [H('dots', ['n'], T_DOTS)] },
      loiGiaiKhac: {
        moTa: 'Thêm một dòng chú thích trong dots()',
        baiLam: { chinh: ['dots(3)'] },
        hamCuaEmMoi: [H('dots', ['n'], ['# chấm rồi bay hai ô sang phải'].concat(T_DOTS))]
      },
      loiSai: [
        { moTa: 'Gọi dots(3) mà chưa chế hàm', baiLam: { chinh: ['dots(3)'] }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Chỉ bay một ô giữa hai chấm: chấm ra ngoài hình', baiLam: { chinh: ['dots(3)'] }, hamCuaEmMoi: [H('dots', ['n'], ['for i in range(n):', '    dot()', '    go_right()'])], phaiCoMa: ['to-thua'] }
      ],
      goiY: ['Mỗi lần lặp: chấm, rồi bay sang phải hai ô.', 'dot() và bước bay đầu tiên chạy chung một nhịp.']
    },
    'may-son.7': {
      loaiRobot: 'drone', robot: { than: 'drone', tay: 'son', camBien: [] }, hamGoc: KHAY.slice(), hamCuaEmCan: [],
      deBai: 'Hình mờ là ba chấm cách quãng: đỏ, xanh dương, đỏ. Vòng for đi qua danh sách màu, mỗi lần chọn màu c rồi chấm. Sửa danh sách cho đúng thứ tự màu.',
      veMaMau: 'for c in [...]: lặp một lần cho mỗi màu trong danh sách, c lần lượt là từng màu.',
      batDau: { x: 0, y: 1, huong: 0 },
      maMau: { chinh: ['for c in ["red", "red", "red"]:', '    ink(c)', '    dot()', '    go_right()', '    go_right()'] },
      sao: { o: 5, nhip: 5 },
      loiGiai: { chinh: ['for c in ["red", "blue", "red"]:', '    ink(c)', '    dot()', '    go_right()', '    go_right()'] },
      loiGiaiKhac: {
        moTa: 'Đặt tên cho danh sách màu trước khi lặp',
        baiLam: { chinh: ['colors = ["red", "blue", "red"]', 'for c in colors:', '    ink(c)', '    dot()', '    go_right()', '    go_right()'] }
      },
      loiSai: [
        { moTa: 'Không sửa danh sách: cả ba chấm đỏ', baiLam: { chinh: ['for c in ["red", "red", "red"]:', '    ink(c)', '    dot()', '    go_right()', '    go_right()'] }, phaiCoMa: ['chua-to-hinh'] },
        { moTa: 'Chọn màu sau khi chấm: mỗi chấm mang màu của lần trước', baiLam: { chinh: ['for c in ["red", "blue", "red"]:', '    dot()', '    ink(c)', '    go_right()', '    go_right()'] }, phaiCoMa: ['chua-to-hinh'] },
        { moTa: 'Viết hoa tên màu trong danh sách', baiLam: { chinh: ['for c in ["red", "Blue", "red"]:', '    ink(c)', '    dot()', '    go_right()', '    go_right()'] }, phaiCoMa: ['mau-son-sai'] }
      ],
      goiY: ['Chạm vào từng màu trong danh sách để đổi màu đó.', 'ink(c) phải chạy trước dot() để chấm mang màu mới.']
    }
  };

  ManHoc.manChamSon = DS;
  ManHoc.suaChamSon = SUA_CHAM_SON;
  if (laNode) module.exports = ManHoc;
})();
