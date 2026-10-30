/* ============================================================================
   man-net-lien.js — "Mật Lệnh Robot": NGÂN HÀNG MÀN MỚI của mùa 4, gói 6 "Nét liền" (KE-HOACH-MUA-4.md; phiên "Mùa 4" tự viết, 30/10).
   Khung mùa 4 (lo-trinh-hoc.js, khối "MÙA 4 = 10 GÓI", mảng MUA_4) xếp màn: dòng chương trong MUA_4 khai ĐỦ thứ tự 10 màn.
     - `net-lien`: chương 1 "Kẻ nét liền": màn có sẵn may-son.3, .4, .5, .8, .9, .10 (bút liền) + màn mới net-lien.1 … .4 (chương mới nên mã từ 1).
       Thứ tự: net-lien.1 (trình diễn) · may-son.3 · may-son.4 · net-lien.2 · may-son.5 · may-son.8 · may-son.9 · net-lien.3 · net-lien.4 · may-son.10 (trùm).
       Cái mới của gói: NÂNG CẤP máy sơn thành bút liền: pen_down() hạ đầu sơn và giữ, xe đi tới đâu tô tới đó; pen_up() nhấc đầu sơn. Gói 2 chỉ có dot().
     - `che-may-son`: chương 2 "Chế lệnh: vẽ hoa văn": màn có sẵn che-may-son.1 … .6, .9, .10 + màn mới che-may-son.11, .12 (cầu nối nhịp).
       Thứ tự: 1 · 9 · 2 · 11 · 4 · 3 · 12 · 6 · 5 · 10 (trùm). che-may-son.7 Lưới chấm và .8 Khung lồng khung (37 / 44 nhịp, sân 49 ô, khó hơn cả trùm)
       sang mùa 5 (ẩn, chương che-may-son-cu; nghiệm thu 30/10: lạc robot của gói 10, to hơn trùm cuối mùa).
   Luật máy sơn (san-hoc.js phần MÁY SƠN): mục tiêu 'to-hinh': tô đủ hình mờ đúng màu, tô ngoài hình là thua ngay ('to-thua'); ô cuối của hình được tô là thắng ngay.
   Máy kiểm: hoc/kiem-man-mua-4.mjs, hoc/kiem-lo-trinh.mjs mục mùa 4, hoc/kiem-may-son.mjs (chương net-lien).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  // Khay bút liền: như các màn may-son có sẵn (man-may-son.js).
  var KHAY = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'ink', 'dot', 'pen_down', 'pen_up'];
  function bai(chinh, them) { return Object.assign({ chinh: chinh.slice() }, them || {}); }

  function H(ten, than, thamSo) { return { ten: ten, thamSo: (thamSo || []).slice(), than: than.slice() }; }
  // Màn mới chương che-may-son (như man-che-may-son.js): chương trình chính khoá, em chế hàm; mã từ 11.
  function manChe(m) {
    m.chuong = 'che-may-son';
    m.loaiRobot = 'banh';
    m.robot = { than: 'hai-banh', tay: 'son', camBien: [] };
    m.hamGoc = KHAY.slice();
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    m.cauTruc = ['for', 'if', 'while', 'list'];
    m.mucTieu = 'to-hinh';
    m.nhipTheoLoiGiai = true;
    m.chinhCoDinh = true;
    return ManHoc.chuanHoa(m);
  }
  var C_11 = ['bend("red", 3)', 'bend("blue", 3)'];
  var T_BEND = ['color_line(c, n)', 'turn_right()'];
  var C_12 = ['checker("red", "blue", 2)', 'next_row(4)', 'checker("blue", "red", 2)'];
  var T_CHECKER = ['for i in range(n):', '    ink(a)', '    dot()', '    move()', '    ink(b)', '    dot()', '    move()'];

  function man(m) {
    m.chuong = 'net-lien';
    m.loaiRobot = 'banh';
    m.robot = { than: 'hai-banh', tay: 'son', camBien: [] };
    m.hamGoc = KHAY.slice();
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    m.cauTruc = ['for', 'if', 'while', 'list'];
    m.mucTieu = 'to-hinh';
    m.nhipTheoLoiGiai = true;
    m.loiSai = m.loiSai || [];
    return ManHoc.chuanHoa(m);
  }

  var DS = [
    man({
      so: 1, ten: 'Bút liền', hang: 'lam-quen', chiChay: true, chinhCoDinh: true, hamCuaEmCan: ['forward'],
      deBai: 'Em nâng cấp máy sơn thành bút liền. pen_down() hạ đầu sơn và giữ luôn: xe đi tới đâu, ô đó được tô. pen_up() nhấc đầu sơn lên. ' +
        'Bấm Chạy xem xe kẻ một nét xanh dài ba ô, nhấc bút đi qua một ô trống, rồi hạ bút tô ô cuối.',
      veMaMau: 'Chương trình đã viết sẵn và khoá. Bấm Chạy, nhìn nét xanh kéo dài theo xe, ngừng khi bút được nhấc, rồi tô lại khi bút hạ xuống.',
      san: ['......', '......', '......'],
      hinh: ['......', 'bbb.b.', '......'],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(['ink("blue")', 'pen_down()', 'forward(2)', 'pen_up()', 'forward(2)', 'pen_down()', 'wait()']),
      loiGiai: bai(['ink("blue")', 'pen_down()', 'forward(2)', 'pen_up()', 'forward(2)', 'pen_down()', 'wait()']),
      sao: { o: 12, nhip: 5 },
      goiY: ['dot() chỉ chấm một ô; pen_down() giữ sơn suốt đường đi.', 'Sau pen_up() xe đi qua ô nào cũng không tô; pen_down() lại thì tô tiếp từ ô đang đứng.']
    }),

    man({
      so: 2, ten: 'Nét đứt', hang: 'luyen', hamCuaEmCan: ['move', 'forward'],
      deBai: 'Vạch kẻ đường là nét đứt: hai ô đỏ, một ô trống, hai ô đỏ. Hạ bút kẻ đoạn đầu, nhấc bút qua ô trống, hạ bút lại kẻ đoạn sau.',
      veMaMau: 'Chương trình có sẵn giữ bút suốt nên tô cả ô trống. Thêm pen_up() và pen_down() đúng chỗ.',
      san: ['.......', '.......', '.......'],
      hinh: ['.......', 'rr.rr..', '.......'],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: bai(['pen_down()', 'forward(4)']),
      loiGiai: bai(['pen_down()', 'move()', 'pen_up()', 'forward(2)', 'pen_down()', 'move()']),
      sao: { o: 11, nhip: 4 },
      loiSai: [
        { moTa: 'Không nhấc bút: ô trống giữa hai đoạn bị tô', baiLam: bai(['pen_down()', 'forward(4)']), phaiCoMa: ['to-thua'] },
        { moTa: 'Nhấc bút mà quên hạ lại: đoạn sau không được tô', baiLam: bai(['pen_down()', 'move()', 'pen_up()', 'forward(3)']), phaiCoMa: [] }
      ],
      goiY: ['Nhấc bút ngay sau đoạn đầu, đi qua ô trống, rồi hạ bút ở ô đầu đoạn sau.', 'pen_down() tô luôn ô xe đang đứng.']
    }),

    man({
      so: 3, ten: 'Khung chữ nhật', hang: 'bien-the', hamCuaEmCan: ['forward', 'turn_right'],
      deBai: 'Hình mờ là một khung chữ nhật xanh dương: cạnh ngang bốn ô, cạnh dọc ba ô. Kẻ khung bằng một nét liền. Hai cạnh kề nhau dài khác nhau, nên mỗi lần lặp vẽ một cạnh ngang và một cạnh dọc.',
      veMaMau: 'Khung vuông lặp bốn lần một cạnh. Khung chữ nhật lặp hai lần một cặp cạnh: ngang rồi dọc.',
      san: ['......', '......', '......', '......', '......'],
      hinh: ['......', '.bbbb.', '.b..b.', '.bbbb.', '......'],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['ink("blue")', 'pen_down()']),
      loiGiai: bai(['ink("blue")', 'pen_down()', 'for i in range(2):', '    forward(3)', '    turn_right()', '    forward(2)', '    turn_right()']),
      sao: { o: 14, nhip: 12 },
      loiSai: [
        { moTa: 'Cạnh ngang cũng chỉ đi hai bước: khung vuông lệch ra ngoài hình', baiLam: bai(['ink("blue")', 'pen_down()', 'for i in range(4):', '    forward(2)', '    turn_right()']), phaiCoMa: ['to-thua'] },
        { moTa: 'Lặp một lần: mới được nửa khung', baiLam: bai(['ink("blue")', 'pen_down()', 'for i in range(1):', '    forward(3)', '    turn_right()', '    forward(2)', '    turn_right()']), phaiCoMa: [] }
      ],
      goiY: ['Cạnh bốn ô thì đi ba bước, cạnh ba ô thì đi hai bước.', 'Ô cuối được tô là thắng ngay, không cần về đúng chỗ cũ.']
    }),

    man({
      so: 4, ten: 'Dấu bằng hai màu', hang: 'bien-the', hamCuaEmCan: ['forward', 'turn_right'],
      deBai: 'Vẽ dấu bằng: nét trên đỏ, nét dưới xanh dương, mỗi nét bốn ô, cách nhau một hàng trống. Lặp qua danh sách màu, mỗi màu kẻ một nét rồi nhấc bút xuống nét sau.',
      veMaMau: 'Chương trình có sẵn đã lặp qua hai màu. Thân vòng lặp: chọn màu, hạ bút, kẻ nét, nhấc bút, rẽ xuống hai hàng.',
      san: ['......', '......', '......', '......', '......'],
      hinh: ['......', '.rrrr.', '......', '.bbbb.', '......'],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['for c in ["red", "blue"]:', '    ink(c)']),
      loiGiai: bai(['for c in ["red", "blue"]:', '    ink(c)', '    pen_down()', '    forward(3)', '    pen_up()', '    turn_right()', '    forward(2)', '    turn_right()']),
      sao: { o: 15, nhip: 10 },
      loiSai: [
        { moTa: 'Không nhấc bút khi xuống hàng: tô cả hàng trống ở giữa', baiLam: bai(['for c in ["red", "blue"]:', '    ink(c)', '    pen_down()', '    forward(3)', '    turn_right()', '    forward(2)', '    turn_right()']), phaiCoMa: ['to-thua'] },
        { moTa: 'Xuống một hàng: nét dưới nằm sát nét trên, ra ngoài hình', baiLam: bai(['for c in ["red", "blue"]:', '    ink(c)', '    pen_down()', '    forward(3)', '    pen_up()', '    turn_right()', '    move()', '    turn_right()']), phaiCoMa: ['to-thua'] }
      ],
      goiY: ['Rẽ phải hai lần thì xe quay ngược lại: nét dưới kẻ từ phải sang trái.', 'Nhấc bút trước khi đi xuống, kẻo hàng trống bị tô.']
    }),

    manChe({
      so: 11, ten: 'Nét gập hai màu', hang: 'lam-quen', hamCuaEmCan: ['turn_right', 'line', 'color_line'], taoHam: ['bend'],
      deBai: 'Chế bend(c, n): vẽ nét màu c bằng color_line(c, n) rồi rẽ phải. Chương trình chính gọi bend hai lần: nét đỏ sang phải, nét xanh dương đi xuống. ' +
        'Ô góc được tô hai lần: màu sau phủ lên màu trước.',
      veMaMau: 'Chương trình chính bị khóa. Tạo bend với hai đối số c và n, dùng color_line của em.',
      san: ['.....', '.....', '.....', '.....', '.....'],
      hinh: ['.....', 'rrrb.', '...b.', '...b.', '...b.'],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: { chinh: C_11.slice() },
      sao: { o: 17, nhip: 8 },
      loiGiai: { chinh: C_11.slice(), hamCuaEmMoi: [H('bend', T_BEND, ['c', 'n'])] },
      congThucKhac: [
        { moTa: 'Viết ink(c) và line(n) thay cho color_line', hamCuaEmMoi: [H('bend', ['ink(c)', 'line(n)', 'turn_right()'], ['c', 'n'])] }
      ],
      loiSai: [
        { moTa: 'Gọi bend mà chưa chế hàm', baiLam: { chinh: C_11.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Rẽ trái: nét xanh đi lên, ra ngoài hình', baiLam: { chinh: C_11.slice() }, hamCuaEmMoi: [H('bend', ['color_line(c, n)', 'turn_left()'], ['c', 'n'])], phaiCoMa: ['to-thua'] },
        { moTa: 'Quên rẽ: nét xanh vẽ tiếp sang phải, ra ngoài hình', baiLam: { chinh: C_11.slice() }, hamCuaEmMoi: [H('bend', ['color_line(c, n)'], ['c', 'n'])], phaiCoMa: ['to-thua'] }
      ],
      goiY: ['color_line(c, n) đã hạ bút, vẽ và nhấc bút. bend chỉ cần thêm một lần rẽ.', 'Nét xanh bắt đầu ở ô góc, nên ô góc mang màu xanh.']
    }),

    manChe({
      so: 12, ten: 'Ô cờ hai màu', hang: 'luyen', hamCuaEmCan: ['move', 'next_row'], taoHam: ['checker'],
      deBai: 'Hai hàng ô cờ: hàng trên đỏ, xanh dương, đỏ, xanh dương; hàng dưới bắt đầu bằng xanh dương. Chế checker(a, b, n): lặp n lần, chấm màu a, đi, chấm màu b, đi. ' +
        'Chương trình chính gọi checker cho hàng trên, next_row(4), rồi checker với hai màu đổi chỗ.',
      veMaMau: 'Chương trình chính bị khóa. Hàm có ba đối số: hai màu và số lần lặp.',
      san: ['......', '......', '......', '......'],
      hinh: ['......', 'rbrb..', 'brbr..', '......'],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: { chinh: C_12.slice() },
      sao: { o: 25, nhip: 15 },
      loiGiai: { chinh: C_12.slice(), hamCuaEmMoi: [H('checker', T_CHECKER, ['a', 'b', 'n'])] },
      congThucKhac: [
        { moTa: 'Lặp qua danh sách hai màu bên trong vòng lặp', hamCuaEmMoi: [H('checker', ['for i in range(n):', '    for c in [a, b]:', '        ink(c)', '        dot()', '        move()'], ['a', 'b', 'n'])] }
      ],
      loiSai: [
        { moTa: 'Gọi checker mà chưa chế hàm', baiLam: { chinh: C_12.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Chỉ dùng màu a: hàng nào cũng một màu', baiLam: { chinh: C_12.slice() }, hamCuaEmMoi: [H('checker', ['for i in range(n):', '    ink(a)', '    dot()', '    move()', '    dot()', '    move()'], ['a', 'b', 'n'])], phaiCoMa: [] },
        { moTa: 'Bỏ bước đi sau chấm màu b: chấm đè lên nhau', baiLam: { chinh: C_12.slice() }, hamCuaEmMoi: [H('checker', ['for i in range(n):', '    ink(a)', '    dot()', '    move()', '    ink(b)', '    dot()'], ['a', 'b', 'n'])], phaiCoMa: [] }
      ],
      goiY: ['Mỗi lần lặp chấm hai ô: một ô màu a, một ô màu b.', 'Hàng dưới chỉ cần đổi chỗ hai màu khi gọi hàm.']
    })
  ];

  ManHoc.manNetLien = DS;
  if (laNode) module.exports = ManHoc;
})();
