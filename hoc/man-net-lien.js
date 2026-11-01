/* ============================================================================
   man-net-lien.js — "Mật Lệnh Robot": NGÂN HÀNG MÀN MỚI của mùa 4, gói 6 "Nét liền" (KE-HOACH-MUA-4.md; PDM4b 31/10 dựng lại trên drone nông nghiệp).
   Khung mùa 4 (lo-trinh-hoc.js, khối "MÙA 4 = 10 GÓI", mảng MUA_4) xếp màn: dòng chương trong MUA_4 khai ĐỦ thứ tự 10 màn.
     - `net-lien`: chương 1 "Gieo liền một hàng": màn có sẵn may-son.3, .4, .5, .8, .9, .10 (nâng cấp sang drone qua SUA_NET_LIEN) + màn mới net-lien.1 … .4.
       Thứ tự: net-lien.1 (trình diễn) · may-son.3 · may-son.4 · net-lien.2 · may-son.5 · may-son.8 · may-son.9 · net-lien.3 · net-lien.4 · may-son.10 (trùm).
       Cái mới của gói: NÂNG CẤP bộ gieo hạt dưới bụng drone thành gieo liền: pen_down() hạ miệng gieo và giữ, drone bay tới đâu gieo tới đó; pen_up() nhấc miệng gieo.
     - `che-may-son`: chương 2 "Chế lệnh: bồn hoa": màn có sẵn che-may-son.1 … .6, .9, .10 (nâng cấp sang drone qua SUA_NET_LIEN) + màn mới che-may-son.11, .12.
       Thứ tự: 1 · 9 · 2 · 11 · 4 · 3 · 12 · 6 · 5 · 10 (trùm). che-may-son.7 Lưới chấm và .8 Khung lồng khung sang mùa 5 (ẩn, chương che-may-son-cu).
   Luật máy sơn (san-hoc.js phần MÁY SƠN): mục tiêu 'to-hinh': tô đủ hình mờ đúng màu, tô ngoài hình là thua ngay ('to-thua'); ô cuối của hình được tô là thắng ngay.
   Máy kiểm: hoc/kiem-man-mua-4.mjs, hoc/kiem-lo-trinh.mjs mục mùa 4, hoc/kiem-may-son.mjs (chương net-lien).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var ROBOT_G6 = { than: 'drone', tay: 'son', camBien: [{ ma: 'camera-4', o: 'tren' }] };
  var KHAY = ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'ink', 'dot', 'pen_down', 'pen_up', 'color'];
  function bai(chinh, them) { return Object.assign({ chinh: chinh.slice() }, them || {}); }
  function H(ten, than, thamSo) { return { ten: ten, thamSo: (thamSo || []).slice(), than: than.slice() }; }
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }

  // Màn mới chương che-may-son: chương trình chính khoá, em chế hàm; mã từ 11.
  function manChe(m) {
    m.chuong = 'che-may-son';
    m.loaiRobot = 'drone';
    m.robot = { than: 'drone', tay: 'son', camBien: [{ ma: 'camera-4', o: 'tren' }] };
    m.hamGoc = KHAY.slice();
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    m.cauTruc = ['for', 'if', 'while', 'list'];
    m.mucTieu = 'to-hinh';
    m.nhipTheoLoiGiai = true;
    m.chinhCoDinh = true;
    return ManHoc.chuanHoa(m);
  }
  var C_11 = ['bend("red", 2)', 'bend("blue", 2)'];
  var T_BEND = ['color_line(c, n)', 'go_down()'];
  var C_12 = ['checker("red", "blue", 2)', 'next_row(4)', 'checker("blue", "red", 2)'];
  var T_CHECKER = ['for i in range(n):', '    ink(a)', '    dot()', '    go_right()', '    ink(b)', '    dot()', '    go_right()'];

  function man(m) {
    m.chuong = 'net-lien';
    m.loaiRobot = 'drone';
    m.robot = { than: 'drone', tay: 'son', camBien: [{ ma: 'camera-4', o: 'tren' }] };
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
      so: 1, ten: 'Bút liền', hang: 'lam-quen', chiChay: true, chinhCoDinh: true, hamCuaEmCan: [],
      deBai: 'Em nâng cấp bộ gieo hạt dưới bụng drone thành bút liền. pen_down() hạ đầu sơn và giữ luôn: drone bay tới đâu, ô đó được tô. pen_up() nhấc đầu sơn lên. ' +
        'Bấm Chạy xem drone kẻ một nét xanh dài ba ô, nhấc bút bay qua một ô trống, rồi hạ bút tô ô cuối.',
      veMaMau: 'Chương trình đã viết sẵn và khoá. Bấm Chạy, nhìn nét xanh kéo dài theo drone, ngừng khi bút được nhấc, rồi tô lại khi bút hạ xuống.',
      san: ['......', '......', '......'],
      hinh: ['......', 'bbb.b.', '......'],
      batDau: { x: 0, y: 1, huong: 0 },
      maMau: bai(['ink("blue")', 'pen_down()', 'go_right()', 'go_right()', 'pen_up()', 'go_right()', 'go_right()', 'pen_down()', 'wait()']),
      loiGiai: bai(['ink("blue")', 'pen_down()', 'go_right()', 'go_right()', 'pen_up()', 'go_right()', 'go_right()', 'pen_down()', 'wait()']),
      sao: { o: 9, nhip: 5 },
      goiY: ['dot() chỉ chấm một ô; pen_down() giữ sơn suốt đường bay.', 'Sau pen_up() drone bay qua ô nào cũng không tô; pen_down() lại thì tô tiếp từ ô đang ở.']
    }),

    man({
      so: 2, ten: 'Nét đứt', hang: 'luyen', hamCuaEmCan: [],
      deBai: 'Vạch kẻ đường là nét đứt: hai ô đỏ, một ô trống, hai ô đỏ. Hạ bút kẻ đoạn đầu, nhấc bút bay qua ô trống, hạ bút lại kẻ đoạn sau.',
      veMaMau: 'Chương trình có sẵn giữ bút suốt nên tô cả ô trống. Thêm pen_up() và pen_down() đúng chỗ.',
      san: ['.......', '.......', '.......'],
      hinh: ['.......', 'rr.rr..', '.......'],
      batDau: { x: 0, y: 1, huong: 0 },
      maMau: bai(['pen_down()', 'for i in range(4):', '    go_right()']),
      loiGiai: bai(['pen_down()', 'go_right()', 'pen_up()', 'go_right()', 'go_right()', 'pen_down()', 'go_right()']),
      sao: { o: 7, nhip: 4 },
      loiSai: [
        { moTa: 'Không nhấc bút: ô trống giữa hai đoạn bị tô', baiLam: bai(['pen_down()', 'for i in range(4):', '    go_right()']), phaiCoMa: ['to-thua'] },
        { moTa: 'Nhấc bút mà quên hạ lại: đoạn sau không được tô', baiLam: bai(['pen_down()', 'go_right()', 'pen_up()', 'go_right()', 'go_right()', 'go_right()']), phaiCoMa: [] }
      ],
      goiY: ['Nhấc bút ngay sau đoạn đầu, bay qua ô trống, rồi hạ bút ở ô đầu đoạn sau.', 'pen_down() tô luôn ô drone đang ở.']
    }),

    man({
      so: 3, ten: 'Khung chữ nhật', hang: 'bien-the', hamCuaEmCan: [],
      deBai: 'Hình mờ là một khung chữ nhật xanh dương: cạnh ngang bốn ô, cạnh dọc ba ô. Kẻ khung bằng một nét liền: bay sang phải ba bước, xuống hai bước, sang trái ba bước, rồi lên.',
      veMaMau: 'Hạ bút rồi bay vòng quanh bốn cạnh chữ nhật.',
      san: ['......', '......', '......', '......', '......'],
      hinh: ['......', '.bbbb.', '.b..b.', '.bbbb.', '......'],
      batDau: { x: 1, y: 1, huong: 0 },
      maMau: bai(['ink("blue")', 'pen_down()']),
      loiGiai: bai(['ink("blue")', 'pen_down()', 'for i in range(3):', '    go_right()', 'go_down()', 'go_down()', 'for i in range(3):', '    go_left()', 'go_up()']),
      sao: { o: 9, nhip: 9 },
      loiSai: [
        { moTa: 'Cạnh ngang chỉ bay hai bước: đi xuống giữa khung, tô ra ngoài hình', baiLam: bai(['ink("blue")', 'pen_down()', 'go_right()', 'go_right()', 'go_down()']), phaiCoMa: ['to-thua'] },
        { moTa: 'Mới bay hai cạnh: thiếu nửa khung dưới', baiLam: bai(['ink("blue")', 'pen_down()', 'for i in range(3):', '    go_right()', 'go_down()', 'go_down()']), phaiCoMa: [] }
      ],
      goiY: ['Cạnh bốn ô thì bay ba bước, cạnh ba ô thì bay hai bước.', 'Ô cuối được tô là thắng ngay, không cần về đúng chỗ cũ.']
    }),

    man({
      so: 4, ten: 'Dấu bằng hai màu', hang: 'bien-the', hamCuaEmCan: [],
      deBai: 'Vẽ dấu bằng: nét trên đỏ, nét dưới xanh dương, mỗi nét bốn ô, cách nhau một hàng trống. Lặp qua danh sách màu: mỗi màu kẻ một nét sang phải, nhấc bút, bay xuống hai hàng và bay sang trái về đầu nét sau.',
      veMaMau: 'Chương trình có sẵn đã lặp qua hai màu. Thân vòng lặp: chọn màu, hạ bút, bay sang phải ba bước, nhấc bút, bay xuống hai hàng rồi bay trái ba bước.',
      san: ['......', '......', '......', '......', '......'],
      hinh: ['......', '.rrrr.', '......', '.bbbb.', '......'],
      batDau: { x: 1, y: 1, huong: 0 },
      maMau: bai(['for c in ["red", "blue"]:', '    ink(c)']),
      loiGiai: bai(['for c in ["red", "blue"]:', '    ink(c)', '    pen_down()', '    for i in range(3):', '        go_right()', '    pen_up()', '    go_down()', '    go_down()', '    for i in range(3):', '        go_left()']),
      sao: { o: 10, nhip: 11 },
      loiSai: [
        { moTa: 'Không nhấc bút khi xuống hàng: tô cả hàng trống ở giữa', baiLam: bai(['for c in ["red", "blue"]:', '    ink(c)', '    pen_down()', '    for i in range(3):', '        go_right()', '    go_down()', '    go_down()']), phaiCoMa: ['to-thua'] },
        { moTa: 'Chỉ xuống một hàng: nét dưới nằm sát nét trên, ra ngoài hình', baiLam: bai(['for c in ["red", "blue"]:', '    ink(c)', '    pen_down()', '    for i in range(3):', '        go_right()', '    pen_up()', '    go_down()', '    for i in range(3):', '        go_left()']), phaiCoMa: ['to-thua'] }
      ],
      goiY: ['Mỗi nét dài bốn ô: hạ bút rồi bay sang phải ba bước.', 'Nhấc bút trước khi bay xuống hai hàng và bay trái ba bước về đầu hàng dưới.']
    }),

    manChe({
      so: 11, ten: 'Nét bậc hai màu', hang: 'lam-quen', hamCuaEmCan: ['line', 'color_line'], taoHam: ['bend'],
      deBai: 'Chế bend(c, n): vẽ nét màu c bằng color_line(c, n) rồi bay xuống một ô. Chương trình chính gọi bend hai lần: nét đỏ ở hàng trên, rồi nét xanh dương nối bậc ở hàng dưới.',
      veMaMau: 'Chương trình chính bị khóa. Tạo bend với hai đối số c và n, dùng color_line của em.',
      san: ['......', '......', '......', '......'],
      hinh: ['......', 'rrr...', '..bbb.', '......'],
      batDau: { x: 0, y: 1, huong: 0 },
      maMau: { chinh: C_11.slice() },
      sao: { o: 11, nhip: 6 },
      loiGiai: { chinh: C_11.slice(), hamCuaEmMoi: [H('bend', T_BEND, ['c', 'n'])] },
      congThucKhac: [
        { moTa: 'Viết ink(c) và line(n) thay cho color_line', hamCuaEmMoi: [H('bend', ['ink(c)', 'line(n)', 'go_down()'], ['c', 'n'])] }
      ],
      loiSai: [
        { moTa: 'Gọi bend mà chưa chế hàm', baiLam: { chinh: C_11.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Bay lên thay vì bay xuống: nét xanh ra ngoài hình', baiLam: { chinh: C_11.slice() }, hamCuaEmMoi: [H('bend', ['color_line(c, n)', 'go_up()'], ['c', 'n'])], phaiCoMa: ['to-thua'] },
        { moTa: 'Quên bay xuống: nét xanh vẽ tiếp sang phải, ra ngoài hình', baiLam: { chinh: C_11.slice() }, hamCuaEmMoi: [H('bend', ['color_line(c, n)'], ['c', 'n'])], phaiCoMa: ['to-thua'] }
      ],
      goiY: ['color_line(c, n) đã hạ bút, vẽ sang phải n bước và nhấc bút. bend chỉ cần thêm go_down().', 'Hết nét đỏ ở cột 3, bay xuống một ô là đúng đầu nét xanh dương.']
    }),

    manChe({
      so: 12, ten: 'Ô cờ hai màu', hang: 'luyen', hamCuaEmCan: ['next_row'], taoHam: ['checker'],
      deBai: 'Hai hàng ô cờ: hàng trên đỏ, xanh dương, đỏ, xanh dương; hàng dưới bắt đầu bằng xanh dương. Chế checker(a, b, n): lặp n lần, chấm màu a, bay sang phải, chấm màu b, bay sang phải. ' +
        'Chương trình chính gọi checker cho hàng trên, next_row(4), rồi checker với hai màu đổi chỗ.',
      veMaMau: 'Chương trình chính bị khóa. Hàm có ba đối số: hai màu và số lần lặp.',
      san: ['......', '......', '......', '......'],
      hinh: ['......', 'rbrb..', 'brbr..', '......'],
      batDau: { x: 0, y: 1, huong: 0 },
      maMau: { chinh: C_12.slice() },
      sao: { o: 13, nhip: 13 },
      loiGiai: { chinh: C_12.slice(), hamCuaEmMoi: [H('checker', T_CHECKER, ['a', 'b', 'n'])] },
      congThucKhac: [
        { moTa: 'Lặp qua danh sách hai màu bên trong vòng lặp', hamCuaEmMoi: [H('checker', ['for i in range(n):', '    for c in [a, b]:', '        ink(c)', '        dot()', '        go_right()'], ['a', 'b', 'n'])] }
      ],
      loiSai: [
        { moTa: 'Gọi checker mà chưa chế hàm', baiLam: { chinh: C_12.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Chỉ dùng màu a: hàng nào cũng một màu', baiLam: { chinh: C_12.slice() }, hamCuaEmMoi: [H('checker', ['for i in range(n):', '    ink(a)', '    dot()', '    go_right()', '    dot()', '    go_right()'], ['a', 'b', 'n'])], phaiCoMa: [] },
        { moTa: 'Bỏ bước bay sau chấm màu b: chấm đè lên nhau', baiLam: { chinh: C_12.slice() }, hamCuaEmMoi: [H('checker', ['for i in range(n):', '    ink(a)', '    dot()', '    go_right()', '    ink(b)', '    dot()'], ['a', 'b', 'n'])], phaiCoMa: [] }
      ],
      goiY: ['Mỗi lần lặp chấm hai ô: một ô màu a, một ô màu b.', 'Hàng dưới chỉ cần đổi chỗ hai màu khi gọi hàm.']
    })
  ];

  // PDM4b (31/10): nâng cấp 14 màn có sẵn của gói 6 (may-son.3, 4, 5, 8, 9, 10 và che-may-son.1, 2, 3, 4, 5, 6, 9, 10) sang drone nông nghiệp.
  var T_FRAME = ['go_right()', 'go_right()', 'go_down()', 'go_down()', 'go_left()', 'go_left()', 'go_up()', 'go_up()'];
  var L_MS10 = ['for c in ["red", "blue"]:', '    ink(c)', '    pen_down()', '    frame()', '    pen_up()', '    for i in range(3):', '        go_right()'];
  var T_LINE = ['pen_down()', 'for i in range(n):', '    go_right()', 'pen_up()', 'wait()'];
  var T_COLOR_LINE = ['ink(c)', 'line(n)'];
  var T_NEXT_ROW = ['for i in range(n):', '    go_left()', 'go_down()'];
  var STEP_SAI = ['go_down()', 'go_right()'];
  var STEP_DUNG = ['go_right()', 'go_down()'];
  var T_STRIPES = ['for c in colors:', '    color_line(c, 3)', '    next_row(3)'];
  var T_COPY_ROW = ['seen = []', 'for i in range(n):', '    seen.append(color("up"))', '    go_right()', 'next_row(n)', 'for c in seen:', '    ink(c)', '    dot()', '    go_right()'];
  var T_FILL_GAPS = ['ink(c)', 'for i in range(n):', '    if color("right") == "none":', '        go_right()', '        dot()', '    else:', '        go_right()'];
  var C_1 = ['line(3)'];
  var C_2 = ['color_line("red", 2)', 'go_right()', 'color_line("blue", 2)'];
  var C_3 = ['color_line("red", 3)', 'next_row(3)', 'color_line("blue", 3)'];
  var C_4 = ['pen_down()', 'for i in range(3):', '    stair_step()'];
  var C_5 = ['sow_rows(["red", "yellow", "blue"])'];
  var C_6 = ['go_right()', 'copy_row(4)'];
  var C_9 = ['fill_gaps("green", 5)'];
  var L_CMS10 = ['copy_row(4)', 'next_row(5)', 'for c in ["red", "yellow", "blue"]:', '    fill_gaps(c, 4)', '    next_row(4)'];

  var SUA_NET_LIEN = {
    'may-son.3': {
      loaiRobot: 'drone', robot: ROBOT_G6, hamGoc: KHAY.slice(), hamCuaEmCan: [],
      deBai: 'pen_down() hạ đầu sơn và giữ luôn: drone bay tới đâu, ô đó được tô. Hình mờ là một nét đỏ dài bốn ô, chương trình có sẵn mới tô được ba ô. Sửa cho đủ nét.',
      veMaMau: 'Chạy thử và đếm số ô được tô. Đầu sơn tô cả ô xuất phát.',
      batDau: { x: 1, y: 1, huong: 0 },
      maMau: { chinh: ['pen_down()', 'go_right()', 'go_right()'] },
      sao: { o: 4, nhip: 3 },
      loiGiai: { chinh: ['pen_down()', 'go_right()', 'go_right()', 'go_right()'] },
      loiGiaiKhac: {
        moTa: 'Dùng vòng for lặp ba bước bay sang phải',
        baiLam: { chinh: ['pen_down()', 'for i in range(3):', '    go_right()'] }
      },
      loiSai: [
        { moTa: 'Không sửa gì: nét mới ba ô', baiLam: { chinh: ['pen_down()', 'go_right()', 'go_right()'] }, phaiCoMa: ['chua-to-hinh'] },
        { moTa: 'Bay một bước rồi mới hạ đầu sơn: nét lệch ra ngoài hình', baiLam: { chinh: ['go_right()', 'pen_down()', 'go_right()', 'go_right()', 'go_right()'] }, phaiCoMa: ['to-thua'] },
        { moTa: 'Dùng dot() thay pen_down(): chỉ một chấm, không giữ sơn', baiLam: { chinh: ['dot()', 'go_right()', 'go_right()', 'go_right()'] }, phaiCoMa: ['chua-to-hinh'] }
      ],
      goiY: ['Nét bốn ô thì drone bay ba bước: ô xuất phát đã được tô lúc hạ đầu sơn.',
        'pen_down() rồi go_right() là một nhịp: hạ đầu sơn, tô ô đang ở, bay sang phải, tô ô mới.']
    },
    'may-son.4': {
      loaiRobot: 'drone', robot: ROBOT_G6, hamGoc: KHAY.slice(), hamCuaEmCan: [],
      deBai: 'Hình mờ là một nét gập góc: ba ô sang phải rồi hai ô xuống. Chương trình có sẵn nhấc đầu sơn ở góc nên nét bị đứt. Giữ đầu sơn hạ suốt lúc drone đổi hướng bay xuống.',
      veMaMau: 'Bỏ lệnh pen_up() ở góc để đầu sơn vẫn hạ khi drone bay xuống.',
      batDau: { x: 1, y: 1, huong: 0 },
      maMau: { chinh: ['pen_down()', 'go_right()', 'go_right()', 'pen_up()', 'go_down()', 'go_down()'] },
      sao: { o: 5, nhip: 4 },
      loiGiai: { chinh: ['pen_down()', 'go_right()', 'go_right()', 'go_down()', 'go_down()'] },
      loiGiaiKhac: {
        moTa: 'Viết hai vòng for cho hai đoạn',
        baiLam: { chinh: ['pen_down()', 'for i in range(2):', '    go_right()', 'for i in range(2):', '    go_down()'] }
      },
      loiSai: [
        { moTa: 'Không sửa gì: nhấc đầu sơn ở góc, đoạn dưới không được tô', baiLam: { chinh: ['pen_down()', 'go_right()', 'go_right()', 'pen_up()', 'go_down()', 'go_down()'] }, phaiCoMa: ['chua-to-hinh'] },
        { moTa: 'Bay nhầm lên trên thay vì xuống: tô ra ngoài hình', baiLam: { chinh: ['pen_down()', 'go_right()', 'go_right()', 'go_up()', 'go_up()'] }, phaiCoMa: ['to-thua'] },
        { moTa: 'Bay sang phải ba bước trước khi xuống: tô ra ngoài hình', baiLam: { chinh: ['pen_down()', 'go_right()', 'go_right()', 'go_right()', 'go_down()', 'go_down()'] }, phaiCoMa: ['to-thua'] }
      ],
      goiY: ['pen_up() nhấc đầu sơn: các ô drone bay sau đó không được tô nữa.',
        'Bỏ dòng pen_up() để nét tiếp nối qua góc.']
    },
    'may-son.5': {
      loaiRobot: 'drone', robot: ROBOT_G6, hamGoc: KHAY.slice(), hamCuaEmCan: [],
      deBai: 'Hình mờ là chữ U màu đỏ: xuống hai ô, sang phải hai ô, lên hai ô. Vẽ chữ U bằng một nét liền.',
      veMaMau: 'Hạ đầu sơn rồi bay ba đoạn: xuống hai bước, sang phải hai bước, lên hai bước.',
      batDau: { x: 1, y: 1, huong: 0 },
      maMau: { chinh: ['pen_down()'] },
      sao: { o: 7, nhip: 6 },
      loiGiai: { chinh: ['pen_down()', 'go_down()', 'go_down()', 'go_right()', 'go_right()', 'go_up()', 'go_up()'] },
      loiGiaiKhac: {
        moTa: 'Dùng vòng for cho từng đoạn',
        baiLam: { chinh: ['pen_down()', 'for i in range(2):', '    go_down()', 'for i in range(2):', '    go_right()', 'for i in range(2):', '    go_up()'] }
      },
      loiSai: [
        { moTa: 'Bay sang trái thay vì sang phải: tô ra ngoài hình', baiLam: { chinh: ['pen_down()', 'go_down()', 'go_down()', 'go_left()', 'go_left()'] }, phaiCoMa: ['to-thua'] },
        { moTa: 'Thiếu đoạn bay lên: mới được hai cạnh', baiLam: { chinh: ['pen_down()', 'go_down()', 'go_down()', 'go_right()', 'go_right()'] }, phaiCoMa: ['chua-to-hinh'] },
        { moTa: 'Quên hạ đầu sơn: chưa tô ô nào', baiLam: { chinh: ['go_down()', 'go_down()', 'go_right()', 'go_right()', 'go_up()', 'go_up()'] }, phaiCoMa: ['chua-to-hinh'] }
      ],
      goiY: ['Ba đoạn nối tiếp: hai bước xuống, hai bước sang phải, hai bước lên.',
        'Đầu sơn hạ suốt đường bay nên các ô góc đều được tô liền.']
    },
    'may-son.8': {
      loaiRobot: 'drone', robot: ROBOT_G6, hamGoc: KHAY.slice(), hamCuaEmCan: [],
      deBai: 'Hình mờ có hai hàng: hàng trên đỏ, hàng dưới xanh dương. Vẽ cả hai hàng bằng một nét liền, đổi màu ngay trước khi drone bay xuống hàng dưới.',
      veMaMau: 'Đầu sơn đang hạ thì cuối mỗi nhịp tô ô drone vừa tới bằng màu đang chọn.',
      batDau: { x: 1, y: 1, huong: 0 },
      maMau: { chinh: ['pen_down()', 'go_right()', 'go_right()', 'go_down()', 'go_left()', 'go_left()'] },
      sao: { o: 7, nhip: 5 },
      loiGiai: { chinh: ['pen_down()', 'go_right()', 'go_right()', 'ink("blue")', 'go_down()', 'go_left()', 'go_left()'] },
      loiGiaiKhac: {
        moTa: 'Ghi chú chỗ đổi màu bằng một dòng chú thích',
        baiLam: { chinh: ['pen_down()', 'go_right()', 'go_right()', '# hàng dưới màu xanh dương', 'ink("blue")', 'go_down()', 'go_left()', 'go_left()'] }
      },
      loiSai: [
        { moTa: 'Không đổi màu: cả hai hàng đỏ', baiLam: { chinh: ['pen_down()', 'go_right()', 'go_right()', 'go_down()', 'go_left()', 'go_left()'] }, phaiCoMa: ['chua-to-hinh'] },
        { moTa: 'Đổi màu sớm một bước: ô góc hàng trên bị tô xanh', baiLam: { chinh: ['pen_down()', 'go_right()', 'ink("blue")', 'go_right()', 'go_down()', 'go_left()', 'go_left()'] }, phaiCoMa: ['chua-to-hinh'] },
        { moTa: 'Bay sang phải ở hàng dưới: tô ra ngoài hình', baiLam: { chinh: ['pen_down()', 'go_right()', 'go_right()', 'ink("blue")', 'go_down()', 'go_right()'] }, phaiCoMa: ['to-thua'] }
      ],
      goiY: ['Bay hết hàng trên rồi mới đổi màu: bước go_down() sẽ tô ô đầu hàng dưới bằng màu mới.', 'Hàng dưới bay từ phải sang trái bằng hai lần go_left().']
    },
    'may-son.9': {
      loaiRobot: 'drone', robot: ROBOT_G6, hamGoc: KHAY.slice(), hamCuaEmCan: [],
      deBai: 'Hình mờ là một khung vuông màu vàng, mỗi cạnh ba ô. Vẽ khung bằng một nét liền, quay về chỗ xuất phát.',
      veMaMau: 'Chọn màu vàng, hạ đầu sơn, rồi bay bốn cạnh: phải, xuống, trái, lên, mỗi cạnh hai bước.',
      batDau: { x: 1, y: 1, huong: 0 },
      maMau: { chinh: ['ink("yellow")', 'pen_down()'] },
      sao: { o: 10, nhip: 7 },
      loiGiai: { chinh: ['ink("yellow")', 'pen_down()', 'go_right()', 'go_right()', 'go_down()', 'go_down()', 'go_left()', 'go_left()', 'go_up()', 'go_up()'] },
      loiGiaiKhac: {
        moTa: 'Cạnh cuối chỉ bay một bước tới ô cuối của khung',
        baiLam: { chinh: ['ink("yellow")', 'pen_down()', 'go_right()', 'go_right()', 'go_down()', 'go_down()', 'go_left()', 'go_left()', 'go_up()'] }
      },
      loiSai: [
        { moTa: 'Quên chọn màu vàng: khung màu đỏ', baiLam: { chinh: ['pen_down()', 'go_right()', 'go_right()', 'go_down()', 'go_down()', 'go_left()', 'go_left()', 'go_up()'] }, phaiCoMa: ['chua-to-hinh'] },
        { moTa: 'Cạnh dài ba bước: tô ra ngoài hình', baiLam: { chinh: ['ink("yellow")', 'pen_down()', 'go_right()', 'go_right()', 'go_right()'] }, phaiCoMa: ['to-thua'] },
        { moTa: 'Chỉ bay hai cạnh: thiếu hai cạnh', baiLam: { chinh: ['ink("yellow")', 'pen_down()', 'go_right()', 'go_right()', 'go_down()', 'go_down()'] }, phaiCoMa: ['chua-to-hinh'] }
      ],
      goiY: ['Khung vuông có bốn cạnh, mỗi cạnh ba ô nên drone bay hai bước mỗi hướng.', 'Ô cuối được tô là thắng ngay.']
    },
    'may-son.10': {
      loaiRobot: 'drone', robot: ROBOT_G6, hamGoc: KHAY.slice(), hamCuaEmCan: [], taoHam: ['frame'],
      deBai: 'Hai khung vuông nằm cạnh nhau: khung trái đỏ, khung phải xanh dương. Chế frame() vẽ một khung vuông cạnh ba ô rồi quay về đúng góc cũ. Chương trình lặp qua danh sách màu, mỗi màu vẽ một khung.',
      veMaMau: 'Chương trình có sẵn đã lặp qua hai màu và gọi frame(). Tạo frame() trong Xưởng hàm: bay phải, xuống, trái, lên mỗi hướng hai bước.',
      batDau: { x: 0, y: 1, huong: 0 },
      maMau: { chinh: L_MS10.slice() },
      sao: { o: 15, nhip: 18 },
      khongDoBFS: true,
      loiGiai: { chinh: L_MS10.slice(), hamCuaEmMoi: [H('frame', T_FRAME)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách làm, thêm một dòng chú thích trong frame()',
        baiLam: { chinh: L_MS10.slice() },
        hamCuaEmMoi: [H('frame', nhieu(['# bốn cạnh, mỗi cạnh ba ô'], T_FRAME))]
      },
      loiSai: [
        { moTa: 'Gọi frame() mà chưa chế hàm', baiLam: { chinh: L_MS10.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên chọn màu trong vòng lặp: cả hai khung đỏ', baiLam: { chinh: ['for c in ["red", "blue"]:', '    pen_down()', '    frame()', '    pen_up()', '    for i in range(3):', '        go_right()'] }, hamCuaEmMoi: [H('frame', T_FRAME)], phaiCoMa: ['chua-to-hinh'] },
        { moTa: 'frame() chỉ ba cạnh: khung hở, drone không về chỗ cũ', baiLam: { chinh: L_MS10.slice() }, hamCuaEmMoi: [H('frame', ['go_right()', 'go_right()', 'go_down()', 'go_down()', 'go_left()', 'go_left()'])], phaiCoMa: ['to-thua'] }
      ],
      goiY: ['frame() phải đưa drone về đúng góc xuất phát (hai bước go_up() ở cạnh cuối), như vậy bay phải ba bước mới tới góc khung kế.',
        'Trong frame() lần lượt bay phải 2, xuống 2, trái 2, lên 2.']
    },
    'che-may-son.1': {
      loaiRobot: 'drone', robot: ROBOT_G6, hamGoc: KHAY.slice(), hamCuaEmCan: [], taoHam: ['line'],
      deBai: 'Chương trình chính chỉ gọi line(3). Chế line(n): hạ đầu sơn, bay sang phải n bước, rồi nhấc đầu sơn. Hình mờ là nét đỏ bốn ô.',
      veMaMau: 'Chương trình chính bị khóa. Mở Xưởng hàm, tạo line với đối số n rồi bấm Chạy.',
      batDau: { x: 1, y: 1, huong: 0 },
      maMau: { chinh: C_1.slice() },
      sao: { o: 6, nhip: 3 },
      loiGiai: { chinh: C_1.slice(), hamCuaEmMoi: [H('line', T_LINE, ['n'])] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [H('line', nhieu(['# hạ, bay sang phải, nhấc'], T_LINE), ['n'])] },
      congThucKhac: [
        { moTa: 'Không ghi wait() ở cuối hàm', hamCuaEmMoi: [H('line', ['pen_down()', 'for i in range(n):', '    go_right()', 'pen_up()'], ['n'])] }
      ],
      loiSai: [
        { moTa: 'Gọi line(3) mà chưa chế hàm', baiLam: { chinh: C_1.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Bay thiếu một bước: nét ba ô', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [H('line', ['pen_down()', 'for i in range(n - 1):', '    go_right()', 'pen_up()'], ['n'])], phaiCoMa: ['chua-to-hinh'] },
        { moTa: 'Chấm thay vì hạ đầu sơn: chỉ một chấm', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [H('line', ['dot()', 'for i in range(n):', '    go_right()', 'pen_up()'], ['n'])], phaiCoMa: ['chua-to-hinh'] }
      ],
      goiY: ['line(n) tô n + 1 ô: ô xuất phát và n ô bay sang phải.', 'Nhấc đầu sơn ở cuối để lần bay sau không vẽ bậy.']
    },
    'che-may-son.2': {
      loaiRobot: 'drone', robot: ROBOT_G6, hamGoc: KHAY.slice(), hamCuaEmCan: ['line'], taoHam: ['color_line'],
      deBai: 'Chế color_line(c, n): chọn màu c rồi vẽ nét bằng line(n). Chương trình chính vẽ một nét đỏ, bay sang phải một bước, rồi vẽ một nét xanh dương.',
      veMaMau: 'Tạo color_line với hai đối số c và n. Dùng ink(c) và line(n) của em.',
      batDau: { x: 0, y: 1, huong: 0 },
      maMau: { chinh: C_2.slice() },
      sao: { o: 10, nhip: 6 },
      loiGiai: { chinh: C_2.slice(), hamCuaEmMoi: [H('color_line', T_COLOR_LINE, ['c', 'n'])] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [H('color_line', nhieu(['# chọn màu rồi vẽ'], T_COLOR_LINE), ['c', 'n'])] },
      congThucKhac: [
        { moTa: 'Viết thẳng các lệnh của line(n) vào hàm', hamCuaEmMoi: [H('color_line', ['ink(c)', 'pen_down()', 'for i in range(n):', '    go_right()', 'pen_up()', 'wait()'], ['c', 'n'])] }
      ],
      loiSai: [
        { moTa: 'Gọi color_line mà chưa chế hàm', baiLam: { chinh: C_2.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Chọn màu sau khi vẽ: nét nào cũng mang màu cũ', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [H('color_line', ['line(n)', 'ink(c)'], ['c', 'n'])], phaiCoMa: ['chua-to-hinh'] },
        { moTa: 'Quên chọn màu: cả hai nét đỏ', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [H('color_line', ['line(n)'], ['c', 'n'])], phaiCoMa: ['chua-to-hinh'] }
      ],
      goiY: ['Đối số c là tên màu: đưa nó vào ink(c).', 'Màu phải chọn TRƯỚC khi hạ đầu sơn.']
    },
    'che-may-son.3': {
      loaiRobot: 'drone', robot: ROBOT_G6, hamGoc: KHAY.slice(), hamCuaEmCan: ['color_line'], taoHam: ['next_row'],
      deBai: 'Vẽ xong nét đỏ, drone ở cuối hàng. Chế next_row(n): bay sang trái n ô về đầu hàng, rồi bay xuống hàng dưới một ô. Nét xanh dương sẽ nằm ngay dưới nét đỏ.',
      veMaMau: 'Chương trình chính: nét đỏ, next_row(3), nét xanh dương. Đầu sơn đã nhấc nên bay về không vẽ.',
      batDau: { x: 1, y: 1, huong: 0 },
      maMau: { chinh: C_3.slice() },
      sao: { o: 13, nhip: 11 },
      loiGiai: { chinh: C_3.slice(), hamCuaEmMoi: [H('next_row', T_NEXT_ROW, ['n'])] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: { chinh: C_3.slice() }, hamCuaEmMoi: [H('next_row', nhieu(['# về đầu hàng, xuống một hàng'], T_NEXT_ROW), ['n'])] },
      congThucKhac: [
        { moTa: 'Bay xuống hàng dưới trước rồi mới bay trái về đầu hàng', hamCuaEmMoi: [H('next_row', ['go_down()', 'for i in range(n):', '    go_left()'], ['n'])] }
      ],
      loiSai: [
        { moTa: 'Gọi next_row mà chưa chế hàm', baiLam: { chinh: C_3.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên bay về đầu hàng: nét xanh vẽ ra ngoài hình', baiLam: { chinh: C_3.slice() }, hamCuaEmMoi: [H('next_row', ['go_down()'], ['n'])], phaiCoMa: ['to-thua'] },
        { moTa: 'Bay lên thay vì bay xuống: tô lên hàng trên, ra ngoài hình', baiLam: { chinh: C_3.slice() }, hamCuaEmMoi: [H('next_row', ['for i in range(n):', '    go_left()', 'go_up()'], ['n'])], phaiCoMa: ['to-thua'] }
      ],
      goiY: ['Lặp n lần go_left() để bay về đầu hàng.', 'Sau vòng lặp thêm go_down() để xuống hàng dưới.']
    },
    'che-may-son.4': {
      loaiRobot: 'drone', robot: ROBOT_G6, hamGoc: KHAY.slice(), hamCuaEmCan: [],
      deBai: 'Hình mờ là bậc thang đi xuống bên phải. Hàm của màn stair_step() vẽ một bậc nhưng đang bay xuống trước nên lệch ra ngoài hình. Sửa stair_step() để vẽ đúng bậc thang.',
      veMaMau: 'Chạy thử: drone bay xuống ngay từ ô đầu nên tô trúng ô trống. Đầu sơn hạ suốt nên mỗi bước bay đều tô.',
      batDau: { x: 0, y: 0, huong: 0 },
      maMau: { chinh: C_4.slice(), hamCuaMan: [H('stair_step', STEP_SAI)] },
      sao: { o: 5, nhip: 6 },
      loiGiai: { chinh: C_4.slice(), hamCuaMan: [H('stair_step', STEP_DUNG)] },
      loiGiaiKhac: { moTa: 'Cùng cách sửa, thêm một dòng chú thích trong hàm', baiLam: { chinh: C_4.slice(), hamCuaMan: [H('stair_step', nhieu(['# sang phải rồi xuống dưới'], STEP_DUNG))] } },
      congThucKhac: [
        { moTa: 'Chọn màu đỏ ở đầu hàm', baiLam: { chinh: C_4.slice(), hamCuaMan: [H('stair_step', ['ink("red")', 'go_right()', 'go_down()'])] } }
      ],
      loiSai: [
        { moTa: 'Không sửa gì: bay xuống trước, ra ngoài hình', baiLam: { chinh: C_4.slice(), hamCuaMan: [H('stair_step', STEP_SAI)] }, phaiCoMa: ['to-thua'] },
        { moTa: 'Thiếu bước bay xuống: drone bay thẳng sang phải ra ngoài hình', baiLam: { chinh: C_4.slice(), hamCuaMan: [H('stair_step', ['go_right()'])] }, phaiCoMa: ['to-thua'] }
      ],
      goiY: ['Mỗi bậc: bay sang phải một ô rồi bay xuống một ô.', 'Đổi thứ tự hai lệnh trong stair_step(): go_right() trước, go_down() sau.']
    },
    'che-may-son.5': {
      loaiRobot: 'drone', robot: ROBOT_G6, hamGoc: KHAY.slice(), hamCuaEmCan: ['color_line', 'next_row'], taoHam: ['sow_rows'],
      deBai: 'Chế sow_rows(colors): mỗi màu trong danh sách vẽ một sọc bốn ô, sọc sau nằm ngay dưới sọc trước. Chương trình chính gọi sow_rows với ba màu đỏ, vàng, xanh dương.',
      veMaMau: 'Tạo sow_rows với đối số colors. Lặp qua danh sách: color_line(c, 3) rồi next_row(3).',
      batDau: { x: 1, y: 1, huong: 0 },
      maMau: { chinh: C_5.slice() },
      sao: { o: 14, nhip: 19 },
      khongDoBFS: true,
      loiGiai: { chinh: C_5.slice(), hamCuaEmMoi: [H('sow_rows', T_STRIPES, ['colors'])] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [H('sow_rows', nhieu(['# mỗi màu một sọc'], T_STRIPES), ['colors'])] },
      congThucKhac: [
        { moTa: 'Lặp theo chỉ số: colors[i]', hamCuaEmMoi: [H('sow_rows', ['for i in range(len(colors)):', '    color_line(colors[i], 3)', '    next_row(3)'], ['colors'])] }
      ],
      loiSai: [
        { moTa: 'Gọi sow_rows mà chưa chế hàm', baiLam: { chinh: C_5.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên xuống hàng: các sọc vẽ nối tiếp ra ngoài hình', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [H('sow_rows', ['for c in colors:', '    color_line(c, 3)'], ['colors'])], phaiCoMa: ['to-thua'] },
        { moTa: 'Vẽ màu đỏ cho mọi sọc', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [H('sow_rows', ['for c in colors:', '    color_line("red", 3)', '    next_row(3)'], ['colors'])], phaiCoMa: ['chua-to-hinh'] }
      ],
      goiY: ['for c in colors: c lần lượt là từng màu trong danh sách.', 'Sọc cuối vẽ xong là thắng ngay.']
    },
    'che-may-son.6': {
      loaiRobot: 'drone', robot: ROBOT_G6, hamGoc: KHAY.slice(), hamCuaEmCan: ['next_row'], taoHam: ['copy_row'],
      deBai: 'Hàng trên đã sơn sẵn bốn màu, drone ở hàng giữa, bay sang phải một bước là ngang ô đầu. Chế copy_row(n): bay dọc hàng giữa, ghi màu ô phía trên từng bước vào danh sách, ' +
        'rồi xuống hàng dưới chép lại đúng các màu đó. Hai sân, hai hàng màu khác nhau: ghi cứng bốn màu thì hỏng một sân.',
      veMaMau: 'Ô hàng trên nằm ở hướng "up". seen.append(color("up")) ghi màu ô đó vào danh sách seen.',
      batDau: { x: 0, y: 1, huong: 0 },
      maMau: { chinh: C_6.slice() },
      sao: { o: 14, nhip: 14 },
      loiGiai: { chinh: C_6.slice(), hamCuaEmMoi: [H('copy_row', T_COPY_ROW, ['n'])] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [H('copy_row', nhieu(['# đọc hàng trên, chép xuống hàng dưới'], T_COPY_ROW), ['n'])] },
      congThucKhac: [
        { moTa: 'Chép theo chỉ số: seen[i]', hamCuaEmMoi: [H('copy_row', ['seen = []', 'for i in range(n):', '    seen.append(color("up"))', '    go_right()', 'next_row(n)', 'for i in range(n):', '    ink(seen[i])', '    dot()', '    go_right()'], ['n'])] }
      ],
      loiSai: [
        { moTa: 'Gọi copy_row mà chưa chế hàm', baiLam: { chinh: C_6.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Bay rồi mới đọc màu: lệch một ô, đọc phải ô không màu', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [H('copy_row', ['seen = []', 'for i in range(n):', '    go_right()', '    seen.append(color("up"))', 'next_row(n)', 'for c in seen:', '    ink(c)', '    dot()', '    go_right()'], ['n'])], phaiCoMa: ['mau-son-sai'] },
        { moTa: 'Ghi cứng bốn màu của sân 1: sân 2 màu khác', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [H('copy_row', ['for i in range(n):', '    go_right()', 'next_row(n)', 'for c in ["red", "yellow", "blue", "red"]:', '    ink(c)', '    dot()', '    go_right()'], ['n'])], phaiCoMa: ['chua-to-hinh'] },
        { moTa: 'Quên xuống hàng: chép đè lên hàng giữa', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [H('copy_row', ['seen = []', 'for i in range(n):', '    seen.append(color("up"))', '    go_right()', 'for c in seen:', '    ink(c)', '    dot()', '    go_right()'], ['n'])], phaiCoMa: ['to-thua'] }
      ],
      goiY: ['Đọc màu TRƯỚC khi bay: color("up") đọc ô hàng trên ngay phía trên drone.', 'Xuống hàng bằng next_row(n) rồi lặp qua seen: chọn màu, chấm, bay sang phải.']
    },
    'che-may-son.9': {
      loaiRobot: 'drone', robot: ROBOT_G6, hamGoc: KHAY.slice(), hamCuaEmCan: [], taoHam: ['fill_gaps'],
      deBai: 'Vạch đã có vài ô sơn sẵn đỏ, xanh dương, vàng. Chế fill_gaps(c, n): bay sang phải qua n ô, trước mỗi bước nhìn ô bên phải; ô chưa có sơn thì bay tới đó chấm màu c, ô đã có sơn thì chỉ bay qua.',
      veMaMau: 'color("right") trả "none" khi ô bên phải chưa có sơn. Tô đè lên ô đã sơn là làm hỏng màu của nó.',
      batDau: { x: 0, y: 1, huong: 0 },
      maMau: { chinh: C_9.slice() },
      sao: { o: 8, nhip: 5 },
      loiGiai: { chinh: C_9.slice(), hamCuaEmMoi: [H('fill_gaps', T_FILL_GAPS, ['c', 'n'])] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: { chinh: C_9.slice() }, hamCuaEmMoi: [H('fill_gaps', nhieu(['# chỉ chấm ô chưa có sơn'], T_FILL_GAPS), ['c', 'n'])] },
      congThucKhac: [
        { moTa: 'Hỏi ngược lại: ô bên phải đã có sơn thì chỉ bay tiếp', hamCuaEmMoi: [H('fill_gaps', ['ink(c)', 'for i in range(n):', '    if color("right") != "none":', '        go_right()', '    else:', '        go_right()', '        dot()'], ['c', 'n'])] },
        { moTa: 'Ghi màu ô bên phải vào biến rồi mới bay', hamCuaEmMoi: [H('fill_gaps', ['ink(c)', 'for i in range(n):', '    m = color("right")', '    go_right()', '    if m == "none":', '        dot()'], ['c', 'n'])] }
      ],
      loiSai: [
        { moTa: 'Gọi fill_gaps mà chưa chế hàm', baiLam: { chinh: C_9.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Chấm mọi ô: đè mất màu sơn sẵn', baiLam: { chinh: C_9.slice() }, hamCuaEmMoi: [H('fill_gaps', ['ink(c)', 'for i in range(n):', '    go_right()', '    dot()'], ['c', 'n'])], phaiCoMa: ['chua-to-hinh'] },
        { moTa: 'Hỏi "khác màu c": ô đỏ, xanh, vàng cũng bị chấm đè', baiLam: { chinh: C_9.slice() }, hamCuaEmMoi: [H('fill_gaps', ['ink(c)', 'for i in range(n):', '    if color("right") != c:', '        go_right()', '        dot()', '    else:', '        go_right()'], ['c', 'n'])], phaiCoMa: ['chua-to-hinh'] },
        { moTa: 'Gọi color() không hướng: camera bốn hướng cần biết nhìn phía nào', baiLam: { chinh: C_9.slice() }, hamCuaEmMoi: [H('fill_gaps', ['ink(c)', 'for i in range(n):', '    if color() == "none":', '        go_right()', '        dot()', '    else:', '        go_right()'], ['c', 'n'])], phaiCoMa: ['loi-chay'] }
      ],
      goiY: ['Hỏi color("right") == "none" để biết ô bên phải còn trống.', 'Chọn màu một lần ở đầu hàm là đủ.']
    },
    'che-may-son.10': {
      loaiRobot: 'drone', robot: ROBOT_G6, hamGoc: KHAY.slice(), hamCuaEmCan: ['copy_row', 'next_row', 'fill_gaps'],
      gioiHanHam: 3,
      deBai: 'Ba bức tranh: hàng trên cùng là viền hoa văn bốn màu, chép nó xuống hàng thứ ba; dưới đó ba sọc đỏ, vàng, xanh dương có vài ô hoa văn xanh lá sơn sẵn ở chỗ khác nhau. ' +
        'Một chương trình phải làm đủ cả ba bức mà không đè lên hoa văn. Chỉ được gọi 3 hàm của em khác nhau.',
      veMaMau: 'Bấm Sân 1, 2, 3 để xem từng bức. copy_row(n) chép hàng trên, fill_gaps(c, n) chỉ chấm ô còn trống, next_row(n) xuống hàng.',
      batDau: [{ x: 1, y: 1, huong: 0 }, { x: 1, y: 1, huong: 0 }, { x: 1, y: 1, huong: 0 }],
      maMau: { chinh: [] },
      sao: { o: 24, nhip: 42 },
      khongDoBFS: true,
      loiGiai: { chinh: L_CMS10.slice() },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: nhieu(['# chép viền, rồi mỗi sọc: lấp ô trống rồi xuống hàng'], L_CMS10) } },
      loiSai: [
        { moTa: 'Vẽ sọc bằng sow_rows: đè mất hoa văn', baiLam: { chinh: ['copy_row(4)', 'next_row(5)', 'sow_rows(["red", "yellow", "blue"])'] }, phaiCoMa: ['to-thua'] },
        { moTa: 'Quên xuống hàng: drone bay ra ngoài tranh', baiLam: { chinh: ['copy_row(4)', 'next_row(5)', 'for c in ["red", "yellow", "blue"]:', '    fill_gaps(c, 4)'] }, phaiCoMa: ['to-thua'] },
        { moTa: 'Sai thứ tự màu', baiLam: { chinh: ['copy_row(4)', 'next_row(5)', 'for c in ["red", "blue", "yellow"]:', '    fill_gaps(c, 4)', '    next_row(4)'] }, phaiCoMa: ['chua-to-hinh'] },
        { moTa: 'Quên chép viền', baiLam: { chinh: ['next_row(0)', 'next_row(0)', 'for c in ["red", "yellow", "blue"]:', '    fill_gaps(c, 4)', '    next_row(4)'] }, phaiCoMa: ['to-thua'] }
      ],
      goiY: ['copy_row(4) xong thì drone ở cuối hàng thứ ba: next_row(5) bay trái về mép trái rồi xuống sọc đầu.', 'Lặp qua danh sách ba màu: mỗi sọc fill_gaps rồi next_row(4).']
    }
  };

  ManHoc.manNetLien = DS;
  ManHoc.suaNetLien = SUA_NET_LIEN;
  if (laNode) module.exports = ManHoc;
})();
