/* ============================================================================
   man-cham-son.js — "Mật Lệnh Robot": NGÂN HÀNG MÀN MỚI của mùa 4, gói 2 "Chấm sơn" (KE-HOACH-MUA-4.md; phiên "Mùa 4" tự viết, 29/10).
   Khung mùa 4 (lo-trinh-hoc.js, khối "MÙA 4 = 10 GÓI", mảng MUA_4) xếp màn: dòng chương trong MUA_4 khai ĐỦ thứ tự 10 màn.
     - `may-son`: chương 1 "Chấm từng ô": màn mới khai so từ 11 (may-son.1 … .10 đã có; gói này giữ .1, .2, .6, .7 dùng dot(), các màn nét liền về gói 6).
       Thứ tự: 11 (trình diễn) · 1 · 2 · 12 · 6 · 7 · 14 · 15 · 13 · 16 (trùm) (xếp theo đường cong nhịp).
       Cái mới của gói: em lắp MÁY SƠN cho R1 (xe hai bánh, như các màn may-son có sẵn): ink(c) chọn màu, dot() chấm ô đang đứng. CHƯA có bút liền
       pen_down / pen_up (gói 6 Nét liền). Python mùa 4: danh sách màu (for c in [...]).
     - `che-list`: chương 2 "Chế lệnh: đi theo danh sách" (10 màn có sẵn che-list.1 … .10), thứ tự 1 · 2 · 3 · 4 · 5 · 6 · 8 · 9 · 7 · 10
       (Đường về 26 nhịp dời sau hai màn sửa 18 nhịp cho khỏi nhảy).
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
    })
  ];

  ManHoc.manChamSon = DS;
  if (laNode) module.exports = ManHoc;
})();
