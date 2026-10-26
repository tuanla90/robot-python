/* Lộ trình xuất bản. Các man-*.js là ngân hàng bài gốc; nạp tệp này SAU
 * toàn bộ ngân hàng, TRƯỚC giao diện. Node cũng dùng đúng điểm vào này.
 * Giữ ma lưu tiến độ; so/id chỉ là vị trí hiển thị. Không chạy lời giải lúc nạp. */
(function () {
  'use strict';
  var node = typeof module !== 'undefined' && module.exports;
  var M, TT, SL;
  if (node) {
    ['chuoi-1', 'chuoi-2', 'che-xe', 'tay-gap', 'che-tay', 'nut-de', 'vong-lap', 'che-lap',
      'bang-chuyen', 'tham-so', 'nhen', 'che-nhen', 'doi-ho-bang', 'list', 'che-list', 'xich', 'che-xich',
      'omni', 'che-omni', 'sung-hoi', 'che-sung-hoi', 'luc-ban', 'khoang-cach', 'che-cam-bien',
      'robot-hoan-thien', 'hai-robot', 'mau', 'che-mau', 'may-son', 'che-may-son', 'rap-nao', 'nam-cham',
      'che-nam-cham', 'tay-xoay', 'che-tay-xoay', 'may-nem', 'che-may-nem', 'rap-tay', 'doi-gap-nem',
      'che-drone', 'drone', 'flycam', 'rap-du',
      // gói đội hai robot còn đang làm (tệp có thể chưa có màn)
      'doi-xich', 'doi-omni', 'doi-sung-hoi', 'doi-mau', 'doi-nam-cham', 'doi-tay-xoay', 'doi-drone',
      'ban-xoay', 'dua-robot', 'doi-thu-manh',
      // 7 màn mới của gói 3 Cảm biến khoảng cách (chỉ khai, lộ trình thêm vào chương bên dưới)
      'cam-bien-them'].forEach(function (n) { require('./man-' + n + '.js'); });
    M = require('./man-chuoi-1.js'); TT = require('./thu-tu-chuong.js'); SL = require('./so-lenh.js');
  } else { M = window.ManHoc; TT = window.ThuTuChuong; SL = window.SoLenh; }
  if (M.phienBanLoTrinh === 2) { if (node) module.exports = M; return; }
  function copy(x) { return JSON.parse(JSON.stringify(x)); }
  function get(ma) { return M.timMa(ma); }
  var nguon = {};
  M.danhSach.forEach(function (m) { nguon[m.ma] = copy(m); });
  function bai(chinh, ham) { return { chinh: chinh, hamCuaMan: ham || [], hamCuaEmMoi: [] }; }
  function ham(ten, than, thamSo) { return { ten: ten, than: than, thamSo: thamSo || [] }; }
  function lap(n, ds) { return ['for i in range(' + n + '):'].concat(ds.map(function (s) { return '    ' + s; })); }
  function sua(ma, ds) {
    var m = get(ma);
    Object.assign(m, ds);
    m.phienBanNoiDung = 2;
    // Ví dụ phụ của bài cũ không còn mô tả nội dung mới.
    delete m.loiGiaiKhac; delete m.congThucKhac;
    m.loiSai = ds.loiSai || [];
    return m;
  }
  var lop = ['mau', 'vatMau', 'vatChat', 'vatThem', 'cuaNhip', 'noi', 'bongMo', 'hinh', 'sonBanDau'];
  function motSan(m, i) {
    if (!Array.isArray(m.san[0])) return;
    m.san = copy(m.san[i]);
    lop.concat(['batDau', 'pin', 'pinDrone', 'roBanDau']).forEach(function (k) {
      if (Array.isArray(m[k])) m[k] = copy(m[k][i]);
    });
    (m.doi || []).forEach(function (d) {
      ['batDau', 'pin', 'roBanDau'].forEach(function (k) { if (Array.isArray(d[k])) d[k] = copy(d[k][i]); });
    });
    delete m.nhipTheo;
    m.phienBanNoiDung = 2;
    function vanBan(s) {
      return s.replace(/Ở cả ba sân/g, 'Trên sân này').replace(/ở cả ba sân/g, 'trên sân này')
        .replace(/cả ba sân/g, 'sân này').replace(/cả hai sân/g, 'sân này')
        .replace(/Ba mê cung nhỏ/g, 'Một hành lang').replace(/ba mê cung nhỏ/g, 'một hành lang')
        .replace(/Ba sân giống nhau nhưng pin khác nhau: 7, 5 và 4\./g, 'Sân này có pin 5.')
        .replace(/Ba sân giống nhau, chỉ khác pin: 7, 6 và 5\./g, 'Sân này có pin 6.')
        .replace(/Ba sân khác nhau:/g, 'Trên sân này:').replace(/Ba sân/g, 'Sân này').replace(/ba sân/g, 'sân này')
        .replace(/hai sân/g, 'sân này').replace(/ba hành lang/g, 'hành lang').replace(/Ba hành lang/g, 'Hành lang')
        .replace(/Ba mê cung/g, 'Mê cung').replace(/ba mê cung/g, 'mê cung')
        .replace(/Số nhịp tính theo tổng sân này\./g, 'Số nhịp tính trên sân đang thấy.');
    }
    m.deBai = vanBan(m.deBai);
    m.veMaMau = vanBan(m.veMaMau || '');
    m.goiY = (m.goiY || []).map(vanBan);
  }
  // Luyện trên một tình huống đủ tiêu biểu; phần khái quát hóa dành cho trùm.
  M.danhSach.forEach(function (m) { if (m.so < 10) motSan(m, 1); });

  // Cảm biến: sửa while trước, quan sát cảm biến hông sau; chưa học tìm đường.
  sua('khoang-cach.7', {
    ten: 'Nhìn lối bên phải', deBai: 'right_clear() hỏi ô bên phải theo hướng xe đang quay. Nếu bên phải trống, rẽ phải rồi đi tới cờ. Chỉ cần xử lý một góc, chưa cần dò mê cung.',
    veMaMau: 'Điền lệnh rẽ và tiến vào nhánh if.', san: ['#####', '#..F#', '#####'],
    batDau: { x: 1, y: 1, huong: 0 }, maMau: bai(['if right_clear():', '    wait()']),
    loiGiai: bai(['if right_clear():', '    turn_right()', '    go_wall()']),
    hamCuaEmCan: ['move', 'turn_right', 'go_wall'],
    goiY: ['Bên phải được tính theo mặt xe, không phải luôn là bên phải màn hình.', 'Rẽ phải trước rồi dùng go_wall().']
  });
  // Trùm cảm biến: giao hàng qua ba hành lang; không giấu một thuật toán mê cung.
  var giao = nguon['khoang-cach.9'];
  sua('khoang-cach.10', {
    ten: 'Ba chuyến giao hàng', deBai: 'Ba hành lang dài ngắn khác nhau. Một chương trình phải nhặt hộp, đi tới cuối hành lang, quay phải rồi đặt hộp vào đích trên cả ba sân. Dùng cảm biến thay cho đếm cứng số bước.',
    san: copy(giao.san), batDau: copy(giao.batDau), mucTieu: 'dua-vat', robot: copy(giao.robot),
    hamGoc: copy(giao.hamGoc), hamCuaEmCan: copy(giao.hamCuaEmCan), nhipTheo: 'tong', nhipTheoLoiGiai: true,
    maMau: bai(['pick()']), loiGiai: copy(giao.loiGiai),
    goiY: ['Nhặt hộp trước khi đi, vì hộp đang chặn ngay trước mặt.', 'Cùng một go_wall() phải dừng đúng ở cả hành lang ngắn và dài.']
  });

  // Bước đệm cho biến đếm: sửa một hàm cục bộ trước khi tự chế bounce().
  var dem = nguon['che-cam-bien.5'];
  sua('che-cam-bien.6', {
    ten: 'Đếm bước để trở về', deBai: 'Xe đi tới tường rồi lùi về đúng vị trí cũ. Hàm count_return() đã có biến n, nhưng đang quên đếm mỗi bước đi. Sửa đúng một dòng để vòng for biết cần lùi bao nhiêu bước.',
    san: copy(dem.san[1]), batDau: copy(dem.batDau[1]), bongMo: copy(dem.bongMo[1]), mucTieu: 'bong-mo',
    taoHam: [], hamCuaEmCan: ['move', 'back'], chinhCoDinh: true,
    maMau: bai(['count_return()'], [ham('count_return', ['n = 0', 'while front_clear():', '    move()', '    n = 0', 'for i in range(n):', '    back()'])]),
    loiGiai: bai(['count_return()'], [ham('count_return', ['n = 0', 'while front_clear():', '    move()', '    n = n + 1', 'for i in range(n):', '    back()'])]),
    goiY: ['n bắt đầu bằng 0. Mỗi lần move(), n cần tăng một đơn vị.', 'Dùng n = n + 1 trong thân while.']
  });
  // Sắp lại mà không đổi khóa ma: các bản lưu vẫn thuộc đúng bài của chúng.
  function xep(chuong, ds) {
    ds.forEach(function (soCu, i) {
      var m = get(chuong + '.' + soCu); m.so = i + 1;
      m.hang = i < 3 ? 'lam-quen' : i < 6 ? 'luyen' : i < 9 ? 'bien-the' : 'trum';
    });
  }
  xep('khoang-cach', [1, 2, 3, 8, 5, 4, 7, 6, 9, 10]);
  xep('che-cam-bien', [1, 2, 7, 3, 4, 8, 6, 5, 9, 10]);

  // Sau cảm biến là gói Dò đường gồm hai chương: Cảm biến hai bên (left_clear, chọn hướng) rồi Mê cung (follow_right được học ở đây).
  // Mã gói giữ 'me-cung' như bản trước để không đổi khóa của gói đã có.
  TT.thuTu.splice(TT.thuTu.indexOf('che-cam-bien') + 1, 0, 'cam-bien-ben', 'me-cung');
  TT.ten['cam-bien-ben'] = 'Cảm biến hai bên';
  TT.ten['me-cung'] = 'Mê cung';
  // Gói mới không đẩy tăng ngưỡng sao của những gói cũ đã mở.
  TT.goi.splice(TT.goi.findIndex(function (g) { return g.ma === 'cam-bien'; }) + 1, 0,
    { ma: 'me-cung', ten: 'Dò đường', loai: 'khai-niem', sao: 135, mua: 'mua-1', chuong: ['cam-bien-ben', 'me-cung'], hinh: 'me-cung', khongTangNguong: true });
  var FOLLOW = ['if right_clear():', '    turn_right()', '    move()', 'elif front_clear():', '    move()', 'else:', '    turn_left()'];
  var A = ['#####', '#..F#', '#####'];
  var B = ['###', '#F#', '#.#', '###'];
  var C = ['#####', '##.##', '#..F#', '#####'];
  var D = ['#####', '#..F#', '#.###', '#.###', '#####'];
  var E = ['#######', '#.....#', '#.#.#F#', '#.#.###', '#######'];
  // Bài một xe cảm biến dựng trên khung của 8.7 gốc (xe hai bánh, ba cảm biến khoảng cách).
  function baiCamBien(chuong, huyHieu, so, ten, deBai, san, bd, lg, mau, goiY) {
    var m = copy(nguon['khoang-cach.7']);
    Object.assign(m, { chuong: chuong, so: so, ten: ten, deBai: deBai, san: copy(san), batDau: copy(bd),
      hang: so <= 3 ? 'lam-quen' : so <= 6 ? 'luyen' : so <= 9 ? 'bien-the' : 'trum',
      loiGiai: lg, maMau: mau, loiSai: [], hamCuaEmCan: ['move', 'turn_left', 'turn_right'], taoHam: [],
      goiY: goiY, veMaMau: 'Chạy thử, quan sát hướng xe rồi hoàn thành quy tắc đang học.', phienBanNoiDung: 2 });
    delete m.ma; delete m.id; delete m.loiGiaiKhac; delete m.huyHieu; delete m.nhipTheo;
    if (so === 10) {
      m.nhipTheo = 'tong';
      m.huyHieu = { ma: chuong, ten: huyHieu };
    }
    return M.chuanHoa(m);
  }
  function maze(so, ten, deBai, san, bd, lg, mau, goiY) {
    return baiCamBien('me-cung', 'Huy hiệu Mê cung', so, ten, deBai, san, bd, lg, mau, goiY);
  }
  var ds = [
    maze(1, 'Bên phải của xe', 'Xe quay lên. Hỏi right_clear(), nếu bên phải trống thì rẽ phải và tiến một ô tới cờ.', ['####', '#.F#', '####'], { x: 1, y: 1, huong: 0 },
      bai(['if right_clear():', '    turn_right()', '    move()']), bai(['if right_clear():', '    wait()']), ['Bên phải xe đang quay lên là ô ở phía phải màn hình.']),
    maze(2, 'Rẽ rồi đi', 'Lối bên phải dài hơn một ô. Rẽ vào lối mở, rồi đi tới tường bằng while front_clear().', A, { x: 1, y: 1, huong: 0 },
      bai(['if right_clear():', '    turn_right()', 'while front_clear():', '    move()']), bai(['if right_clear():', '    turn_right()']), ['Sau khi rẽ, cảm biến phía trước nhìn theo hướng mới.']),
    maze(3, 'Không rẽ thì tiến', 'Bên phải bị chặn nhưng phía trước còn trống. Thêm nhánh elif front_clear() để xe tiến tới cờ.', B, { x: 1, y: 2, huong: 0 },
      bai(FOLLOW.slice(0, 5)), bai(FOLLOW.slice(0, 3)), ['Chỉ xét phía trước khi nhánh bên phải không được chọn.']),
    maze(4, 'Hai phía đều bị chặn', 'Bên phải và phía trước đều là tường. Nhánh else cần quay trái; lượt sau xe sẽ nhìn thấy lối tới cờ.', ['####', '#F.#', '####'], { x: 2, y: 1, huong: 0 },
      bai(lap(2, FOLLOW)), bai(lap(2, FOLLOW.slice(0, 5))), ['Thêm else: turn_left() vào cuối quy tắc.', 'Mỗi lượt có thể chỉ quay, lượt kế mới tiến.']),
    maze(5, 'Ưu tiên ở ngã ba', 'Cả bên phải và trước mặt đều có lối. Quy tắc bám tường chọn bên phải trước. Dùng if/elif để mỗi lượt chỉ chọn một nhánh.', C, { x: 2, y: 2, huong: 0 },
      bai(FOLLOW), bai(['if front_clear():', '    move()', 'elif right_clear():', '    turn_right()', '    move()', 'else:', '    turn_left()']), ['Đổi thứ tự câu hỏi: phải trước, rồi mới phía trước.']),
    maze(6, 'Chế một bước bám tường', 'Em đã biết ba trường hợp. Gom chúng vào hàm follow_right(): rẽ phải và tiến, hoặc tiến thẳng, hoặc quay trái.', C, { x: 2, y: 2, huong: 0 },
      Object.assign(bai(['follow_right()']), { hamCuaEmMoi: [ham('follow_right', FOLLOW)] }), bai(['follow_right()']), ['Thân hàm là đúng quy tắc ba nhánh ở màn trước.']),
    maze(7, 'Lặp những bước nhỏ', 'Hành lang có một góc rẽ. Lặp follow_right() để xe tự xử lý từng ô tới cờ.', D, { x: 1, y: 3, huong: 0 },
      bai(lap(20, ['follow_right()'])), bai(['follow_right()']), ['Một lần gọi chỉ xử lý một bước. Đặt lời gọi trong vòng for.']),
    maze(8, 'Đi vào rồi ra ngõ cụt', 'Lối bên phải dẫn vào ngõ cụt. Tiếp tục áp dụng cùng quy tắc để xe quay ra, rồi tới cờ. Quan sát hai lần quay trái khi phải quay đầu.', E, { x: 1, y: 3, huong: 0 },
      bai(lap(60, ['follow_right()'])), bai(lap(4, ['follow_right()'])), ['Không cần một thuật toán mới cho ngõ cụt: tiếp tục lặp quy tắc đã học.']),
    maze(9, 'Sửa quy tắc ưu tiên', 'Hàm maze_step() hỏi phía trước trước nên có thể bỏ qua ngã rẽ bên phải. Sửa thứ tự ưu tiên, không thay hàm follow_right() trong kho.', nguon['khoang-cach.7'].san[0], nguon['khoang-cach.7'].batDau[0],
      bai(lap(60, ['maze_step()']), [ham('maze_step', FOLLOW)]), bai(lap(60, ['maze_step()']), [ham('maze_step', ['if front_clear():', '    move()', 'elif right_clear():', '    turn_right()', '    move()', 'else:', '    turn_left()'])]), ['Bên phải trống thì phải vào lối đó ngay, kể cả khi phía trước còn đường.']),
    maze(10, 'Chinh phục ba mê cung', 'Dùng cùng một chương trình giải ba mê cung khác nhau. Có ngã rẽ và ngõ cụt; hãy dùng quy tắc bám tường đã luyện, không ghi cứng đường đi.', nguon['khoang-cach.7'].san, nguon['khoang-cach.7'].batDau,
      bai(lap(60, ['follow_right()'])), bai(['follow_right()']), ['Thử chương trình trên cả ba sân.', 'Mỗi bước ưu tiên bên phải, rồi phía trước, cuối cùng quay trái.'])
  ];
  ds[5].taoHam = ['follow_right'];
  ds[5].chinhCoDinh = true;
  [6, 7, 9].forEach(function (i) { ds[i].hamCuaEmCan.push('follow_right'); });
  M.them(ds);
  // Gói Cảm biến hai bên: left_clear() mới, chọn bên, rời cửa rồi mới hỏi, ngõ cụt; quy tắc bám tường để dành cho gói Mê cung.
  function ben(so, ten, deBai, veMaMau, san, bd, lg, mau, goiY) {
    var m = baiCamBien('cam-bien-ben', 'Huy hiệu Cảm biến hai bên', so, ten, deBai, san, bd, lg, mau, goiY);
    m.veMaMau = veMaMau;
    return m;
  }
  function thut(ds) { return ds.map(function (s) { return '    ' + s; }); }
  var CHON = ['if left_clear():', '    turn_left()', 'else:', '    turn_right()'];
  var CHON3 = ['if left_clear():', '    turn_left()', 'elif right_clear():', '    turn_right()', 'else:', '    u_turn()'];
  var SAN_TRUM = [
    ['#######', '#F..###', '###.###', '###...#', '#####.#', '#####.#', '#######'],
    ['########', '######F#', '#......#', '###.####', '###.####', '###.####', '########'],
    ['######', '#.####', '#.####', '#.####', '#.####', '#...F#', '######']
  ];
  var dsBen = [
    ben(1, 'Lối bên trái', 'left_clear() hỏi ô bên trái theo hướng xe đang quay. Xe đi tới tường; nếu bên trái trống thì rẽ trái và đi tiếp tới cờ.',
      'Điền lệnh rẽ và đi vào nhánh if.', ['#####', '#F..#', '###.#', '###.#', '#####'], { x: 3, y: 3, huong: 0 },
      bai(['go_wall()', 'if left_clear():', '    turn_left()', '    go_wall()']), bai(['go_wall()', 'if left_clear():', '    wait()']),
      ['Xe đang quay lên nên bên trái xe trùng phía trái màn hình.', 'Trong nhánh if: turn_left() rồi go_wall().']),
    ben(2, 'Trái hay phải', 'Cuối hành lang chỉ mở một phía. Nếu bên trái trống thì rẽ trái, còn không thì rẽ phải, rồi đi tới cờ.',
      'Chương trình mới biết rẽ trái. Thêm nhánh else cho trường hợp còn lại.', ['#####', '#..F#', '#.###', '#.###', '#####'], { x: 1, y: 3, huong: 0 },
      bai(['go_wall()'].concat(CHON, ['go_wall()'])), bai(['go_wall()', 'if left_clear():', '    turn_left()', 'go_wall()']),
      ['left_clear() trả False thì nhánh else chạy.', 'Thêm else: rồi turn_right() thụt vào trong.']),
    ben(3, 'Cửa bên trái', 'Hành lang còn kéo dài qua khỏi cửa. Đi tới khi bên trái trống, rẽ trái vào cửa rồi tới cờ.',
      'Thêm vòng while ở đầu để xe dừng đúng cửa bên trái.', ['#####', '###.#', '###.#', '#F..#', '###.#', '###.#', '#####'], { x: 3, y: 5, huong: 0 },
      bai(['while not left_clear():', '    move()', 'turn_left()', 'go_wall()']), bai(['turn_left()', 'go_wall()']),
      ['go_wall() sẽ chạy quá cửa.', 'Giống to_gap() nhưng hỏi bên trái: while not left_clear(): move()']),
    ben(4, 'Rời cửa rồi mới hỏi', 'Vào cửa bên phải, rồi tìm cửa bên trái ở hành lang kế tiếp. Ngay sau khi rẽ, ô hành lang cũ nằm cạnh xe nên cảm biến vẫn thấy trống.',
      'Chạy thử: xe rẽ xong là dừng tìm ngay. Sửa để xe rời cửa trước khi hỏi bên trái.',
      ['########', '#.###F##', '#.###.##', '#.###.##', '#......#', '#.######', '#.######', '########'], { x: 1, y: 6, huong: 0 },
      bai(['to_gap()', 'turn_right()', 'move()', 'while not left_clear():', '    move()', 'turn_left()', 'go_wall()']),
      bai(['to_gap()', 'turn_right()', 'while not left_clear():', '    move()', 'turn_left()', 'go_wall()']),
      ['Sau turn_right(), bên trái xe là đoạn hành lang vừa đi.', 'Thêm move() ngay sau turn_right().']),
    ben(5, 'Chế to_left_gap()', 'Tự chế to_left_gap(): đi thẳng cho tới khi bên trái trống. Chương trình chính đã có, dùng hàm hai lần để xoắn vào cờ.',
      'Chương trình chính đã cố định. Viết thân hàm to_left_gap() trong Xưởng.',
      ['#######', '#####.#', '#####.#', '#####.#', '#.....#', '##.##.#', '##F##.#', '#######'], { x: 5, y: 6, huong: 0 },
      Object.assign(bai(['to_left_gap()', 'turn_left()', 'move()', 'to_left_gap()', 'turn_left()', 'go_wall()']),
        { hamCuaEmMoi: [ham('to_left_gap', ['while not left_clear():', '    move()'])] }),
      bai(['to_left_gap()', 'turn_left()', 'move()', 'to_left_gap()', 'turn_left()', 'go_wall()']),
      ['Thân hàm giống bài Cửa bên trái.', 'move() sau mỗi lần rẽ đã có sẵn trong chương trình chính.']),
    ben(6, 'Khúc quanh liên tiếp', 'Hành lang có năm khúc quanh, lúc trái lúc phải. Viết thẳng từng đoạn sẽ tràn khung. Lặp: đi tới tường rồi rẽ về phía còn trống.',
      'Chương trình xử lý được một khúc quanh. Đặt nó trong vòng for.',
      ['########', '##...F##', '##.#####', '##.....#', '######.#', '####...#', '####.###', '####.###', '########'], { x: 4, y: 7, huong: 0 },
      bai(['for i in range(5):', '    go_wall()'].concat(thut(CHON), ['go_wall()'])), bai(['go_wall()'].concat(CHON)),
      ['Đếm số khúc quanh để chọn số lần lặp.', 'Sau vòng for còn một đoạn thẳng tới cờ.']),
    ben(7, 'Sửa hàm tìm cửa', 'Hàm door_left() phải đưa xe tới cửa bên trái, nhưng xe không nhúc nhích. Sửa hàm cho đúng; cửa bên phải chỉ là ngõ cụt.',
      'Chương trình chính đã cố định. Sửa điều kiện trong door_left().',
      ['#####', '##.##', '#F.##', '##.##', '##..#', '##.##', '##.##', '#####'], { x: 2, y: 6, huong: 0 },
      bai(['door_left()', 'turn_left()', 'go_wall()'], [ham('door_left', ['while not left_clear():', '    move()'])]),
      bai(['door_left()', 'turn_left()', 'go_wall()'], [ham('door_left', ['while left_clear():', '    move()'])]),
      ['Vòng while chạy khi điều kiện đúng. Lúc xuất phát bên trái là tường.', 'Thiếu chữ not.']),
    ben(8, 'Ngõ cụt thì quay đầu', 'Xe xuất phát quay mặt vào một ngõ cụt. Thêm nhánh cho trường hợp hai bên đều là tường: quay đầu, rồi vòng lặp đưa xe qua khúc quanh tới cờ.',
      'Chạy thử để thấy xe kẹt ở ngõ cụt. Thêm nhánh else.', ['#####', '#.###', '#.###', '#.###', '#..F#', '#####'], { x: 1, y: 2, huong: 0 },
      bai(['for i in range(3):', '    go_wall()'].concat(thut(CHON3))),
      bai(['for i in range(3):', '    go_wall()'].concat(thut(CHON3.slice(0, 4)))),
      ['Hai bên đều chặn thì không rẽ được.', 'else: u_turn(). Lượt sau go_wall() đi ngược lại hành lang.']),
    ben(9, 'Mang hộp qua khúc quanh', 'Nhặt hộp trước mặt, mang qua các khúc quanh rồi thả vào đích ở hốc cuối đường. Hốc đích cũng là một lối bên cạnh xe.',
      'Bọc phần chọn hướng trong vòng for, giữ pick() ở đầu và drop() ở cuối.',
      ['#######', '#....##', '#.##.##', '#.##.D#', '#o#####', '#.#####', '#######'], { x: 1, y: 5, huong: 0 },
      bai(['pick()', 'for i in range(3):', '    go_wall()'].concat(thut(CHON), ['drop()'])),
      bai(['pick()', 'go_wall()'].concat(CHON, ['drop()'])),
      ['Lần rẽ thứ ba đưa mũi xe vào hốc đích.', 'Hộp đang cầm không làm cảm biến thấy vướng.']),
    ben(10, 'Hành lang tự lái', 'Ba hành lang có khúc quanh khác nhau, có cả ngõ cụt. Một chương trình phải tới cờ ở cả ba sân: đi tới tường, hỏi hai bên để chọn hướng, hai bên đều chặn thì quay đầu.',
      'Chương trình mới chọn được một lần. Lặp nó đủ số lần cho sân dài nhất.', SAN_TRUM, [{ x: 5, y: 5, huong: 0 }, { x: 3, y: 5, huong: 0 }, { x: 1, y: 3, huong: 0 }],
      bai(['for i in range(4):', '    go_wall()'].concat(thut(CHON3))), bai(['go_wall()'].concat(CHON3)),
      ['Một chương trình chung, không đếm khúc quanh của riêng sân nào.', 'Hai bên đều là tường thì u_turn().'])
  ];
  dsBen[3].hamCuaEmCan.push('to_gap');
  dsBen[4].taoHam = ['to_left_gap']; dsBen[4].chinhCoDinh = true;
  dsBen[6].chinhCoDinh = true;
  [7, 9].forEach(function (i) { dsBen[i].hamCuaEmCan.push('u_turn'); });
  var tay = nguon['khoang-cach.9'];
  Object.assign(dsBen[8], { mucTieu: 'dua-vat', robot: copy(tay.robot), hamGoc: copy(tay.hamGoc).concat(['left_clear', 'right_clear']) });
  dsBen[8].hamCuaEmCan.push('pick', 'drop');
  dsBen.forEach(function (m) { m.hamCuaEmCan.push('go_wall'); });
  M.them(dsBen);

  // ---------------------------------------------------------------- MÙA 1 = 10 GÓI (26/10, KE-HOACH-MUA-1.md, KE-HOACH-7-MUA.md "Bố cục chuẩn")
  // Chỉ dùng màn đã có. Đổi m.chuong / so / hang và vị trí; KHÔNG đổi `ma` (khóa lưu sao). Chương chưa có màn nào (gói 4 chương nút đè, gói 5 phần màn mới,
  // gói 8 chương 2, gói 10 chương 2) chưa tạo; gói 9 (Combo) chưa có màn nên chưa tạo. Chương mới chỉ có ở lộ trình (như cam-bien-ben / me-cung):
  // kho-hang, banh-lui, che-banh-lui (mùa 1) và bien (đầu mùa 2). Chương cũ hết màn (che-xe, che-tay, che-lap) rời khỏi thuTu (không thành gói "Sắp có").
  // Thứ tự màn trong chương: thứ tự cũ của lộ trình, trùm của chương gốc đứng cuối. Mã gói giữ như cũ khi được (cờ goi-mo:<mã> không khóa lại).
  // Ngưỡng sao khai cứng = TI_LE_SAO (0,5) × tổng sao tối đa các gói trước trong mùa, làm tròn xuống bội 5 (mo-goi.js); thêm màn mới thì tính lại.
  function day(chuong, so) { return so.map(function (n) { return chuong + '.' + n; }); }
  var MUOI = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  // Gói 4 chương 1 "Nút đè" (man-nut-de.js, màn mới viết cho lộ trình): chương chưa có trong thu-tu-chuong.js nên chèn tạm vào cuối thuTu
  // cho ManHoc.them nhận; thuTu mùa 1 được dựng lại theo MUA_1 bên dưới. `nguon` giữ bản gốc như mọi màn khác (dungChuong đọc hang gốc).
  TT.thuTu.push('nut-de');
  TT.ten['nut-de'] = 'Nút đè';
  M.them(M.manNutDe || []);
  (M.manNutDe || []).forEach(function (m) { nguon[m.ma] = copy(m); });
  // Gói 3: 7 màn mới (man-cam-bien-them.js, mã khoang-cach.11 và che-cam-bien.11–16, mã mới không trùng màn cất). Thêm vào hai chương có sẵn rồi
  // MUA_1 xếp chỗ; `nguon` giữ bản gốc như mọi màn khác.
  M.them(M.manCamBienThem || []);
  (M.manCamBienThem || []).forEach(function (m) { nguon[m.ma] = copy(m); });
  var MUA_1 = [
    { ma: 'xe', ten: 'Xe hai bánh', sao: 0, hinh: 'hai-banh',
      chuong: [['hai-banh', day('hai-banh', MUOI)], ['xuong-ham', day('xuong-ham', MUOI)]] },
    { ma: 'tay-gap', ten: 'Tay gắp', loai: 'bo-phan', sao: 30,
      chuong: [['tay-gap', day('tay-gap', MUOI)], ['vong-lap', day('vong-lap', [1, 2, 3, 4, 5, 6, 8, 9]).concat(['che-lap.5', 'vong-lap.10'])]] },
    { ma: 'cam-bien', ten: 'Cảm biến khoảng cách', loai: 'bo-phan', sao: 60,
      chuong: [['khoang-cach', day('khoang-cach', [1, 2, 3, 8, 4, 11, 5, 6, 9, 10])], ['che-cam-bien', day('che-cam-bien', [1, 2, 7, 11, 3])]] },
    { ma: 'kho-hang', ten: 'Kho hàng', sao: 75, hinh: 'che-tay',
      chuong: [['nut-de', day('nut-de', MUOI)], ['kho-hang', day('che-xe', [1, 2, 3]).concat(day('che-tay', [1, 2, 3, 4, 6, 8, 10]))]] },
    { ma: 'banh-lui', ten: 'Bánh lùi', loai: 'bo-phan', sao: 105, hinh: 'che-xe',
      chuong: [['banh-lui', day('che-xe', [4, 5, 6, 7, 8, 9])], ['che-banh-lui', day('che-tay', [5, 7, 9]).concat(['che-lap.7', 'che-lap.9', 'che-xe.10'])]] },
    { ma: 'tay-xoay', ten: 'Tay xoay', loai: 'bo-phan', sao: 125,
      chuong: [['tay-xoay', day('tay-xoay', MUOI)], ['che-tay-xoay', day('che-tay-xoay', MUOI)]] },
    { ma: 'me-cung', ten: 'Cảm biến bên', loai: 'bo-phan', sao: 155, hinh: 'cam-bien-ben',
      chuong: [['cam-bien-ben', ['che-cam-bien.4'].concat(day('cam-bien-ben', [1, 2, 3, 4, 5, 6, 7, 8, 9]))], ['me-cung', day('me-cung', MUOI)]] },
    { ma: 'hai-robot', ten: 'Đội hai robot', loai: 'thu-thach', sao: 185,
      chuong: [['hai-robot', day('hai-robot', MUOI)]] },
    { ma: 'robot', ten: 'R1 xuất xưởng', loai: 'thu-thach', sao: 200, hinh: 'robot-hoan-thien',
      chuong: [['robot-hoan-thien', day('robot-hoan-thien', [1, 2, 3, 4, 5, 6, 7, 8]).concat(['cam-bien-ben.10', 'robot-hoan-thien.10'])]] }
  ];
  // Bốn màn dùng biến đếm sang đầu mùa 2 (chương tạm, mùa 2 dựng lại sau): count_return sửa trước, rồi bounce, fetch_back.
  var BIEN = { ma: 'bien', ten: 'Biến', loai: 'khai-niem', mua: 'mua-2', sao: 0, hinh: 'che-cam-bien',
    chuong: [['bien', ['che-cam-bien.6', 'che-cam-bien.5', 'che-cam-bien.9', 'robot-hoan-thien.9']]] };
  // Cất khỏi lộ trình xuất bản (ngân hàng man-*.js giữ nguyên, `nguon` còn bản gốc): trùng ý, dư so với khuôn, hay dùng cảm biến bên quá sớm.
  // che-cam-bien.10 chỉ cất tạm: chờ gói 9 (Combo) có màn.
  var CAT = ['vong-lap.7', 'che-lap.1', 'che-lap.2', 'che-lap.3', 'che-lap.4', 'che-lap.6', 'che-lap.8', 'che-lap.10',
    'khoang-cach.7', 'che-cam-bien.8', 'che-cam-bien.10'];
  /** Bỏ các màn `dsMa` khỏi M.danhSach (chỉ lộ trình; ngân hàng và bản lưu sao theo `ma` không đổi). */
  function cat(dsMa) {
    dsMa.forEach(function (ma) {
      var i = M.danhSach.indexOf(get(ma));
      if (i < 0) throw new Error('Cất màn không có trong lộ trình: ' + ma);
      M.danhSach.splice(i, 1);
    });
  }
  /** Dựng một chương từ các màn `dsMa` theo thứ tự: chương, số 1..n, hàng. Trùm: màn cuối của chương đủ 10, hay màn cuối vốn là trùm. */
  function dungChuong(chuong, dsMa) {
    if (dsMa.length > 10) throw new Error('Chương quá 10 màn: ' + chuong);
    dsMa.forEach(function (ma, i) {
      var m = get(ma);
      if (!m) throw new Error('Màn không có: ' + ma);
      var cuoi = i === dsMa.length - 1 && (dsMa.length === 10 || nguon[ma].hang === 'trum');
      m.chuong = chuong; m.so = i + 1;
      m.hang = cuoi ? 'trum' : i < 3 ? 'lam-quen' : i < 6 ? 'luyen' : 'bien-the';
    });
  }
  cat(CAT);
  var chuongMua1 = [], daDung = {};
  MUA_1.concat([BIEN]).forEach(function (g) {
    g.chuong.forEach(function (c) {
      c[1].forEach(function (ma) { if (daDung[ma]) throw new Error('Màn xếp hai lần: ' + ma); daDung[ma] = true; });
      dungChuong(c[0], c[1]);
      if (g !== BIEN) chuongMua1.push(c[0]);
    });
  });
  ['kho-hang', 'banh-lui', 'che-banh-lui', 'bien'].forEach(function (c) { TT.ten[c] = c === 'kho-hang' ? 'Kho hàng' : c === 'banh-lui' ? 'Bánh lùi' : c === 'che-banh-lui' ? 'Hàm có lùi' : 'Biến'; });
  // Gói của mùa 1 cũ (và hai gói dời về mùa 1) thay bằng MUA_1; gói Biến đứng đầu mùa 2.
  var goiDoi = ['hai-robot', 'tay-xoay'];
  for (var gi = TT.goi.length - 1; gi >= 0; gi--) {
    var gc = TT.goi[gi];
    if (!gc.mua || gc.mua === 'mua-1' || goiDoi.indexOf(gc.ma) >= 0) TT.goi.splice(gi, 1);
  }
  var dauMua2 = TT.goi.findIndex(function (g) { return g.mua === 'mua-2'; });
  TT.goi.splice(dauMua2, 0, { ma: BIEN.ma, ten: BIEN.ten, loai: BIEN.loai, mua: BIEN.mua, sao: BIEN.sao, hinh: BIEN.hinh, chuong: ['bien'] });
  TT.goi.splice.apply(TT.goi, [0, 0].concat(MUA_1.map(function (g) {
    var x = { ma: g.ma, ten: g.ten, sao: g.sao, mua: 'mua-1', chuong: g.chuong.map(function (c) { return c[0]; }) };
    if (g.loai) x.loai = g.loai;
    if (g.hinh) x.hinh = g.hinh;
    return x;
  })));
  // Mùa 2 mất gói đầu Đội hai robot (30 ★), thêm gói Biến (4 màn, 12 ★); mùa 4 mất gói đầu Tay xoay: tính lại theo cùng luật, gói đầu mùa cần 0 ★.
  // Chỉ hạ ngưỡng (gói đã mở vẫn mở). Gói đội chèn sau (dưới) tự tính từ các ngưỡng này.
  var NGUONG_MUA_SAU = { 'bang-chuyen': 5, nhen: 35, list: 65, xich: 95, omni: 125, 'may-nem': 0, 'rap-tay': 30, drone: 45, flycam: 75, 'rap-du': 90 };
  TT.goi.forEach(function (g) { if (NGUONG_MUA_SAU[g.ma] !== undefined) g.sao = NGUONG_MUA_SAU[g.ma]; });
  var boChuong = chuongMua1.concat(['che-xe', 'che-tay', 'che-lap', 'bien']);
  var chuongSau = TT.thuTu.filter(function (c) { return boChuong.indexOf(c) < 0; });
  chuongSau.splice(chuongSau.indexOf(TT.goi[dauMua2 + MUA_1.length + 1].chuong[0]), 0, 'bien');
  TT.thuTu.splice.apply(TT.thuTu, [0, TT.thuTu.length].concat(chuongMua1, chuongSau));
  // dot2 chỉ còn là nhãn (lớp dot2 của hộp gói): ba chương dời về mùa 1 không còn là đợt 2.
  ['hai-robot', 'tay-xoay', 'che-tay-xoay'].forEach(function (c) { var i = TT.dot2.indexOf(c); if (i >= 0) TT.dot2.splice(i, 1); });
  M.manCat = CAT.slice();
  M.tinhLai();
  // Khay theo gói: trước gói Bánh lùi chưa có left_back / right_back, trước gói Cảm biến bên chưa có left_clear / right_clear.
  // Chỉ bớt lệnh trên khay (hamGoc); phần cứng vẫn đủ nên hàm của em chế ở gói sau vẫn chạy khi chơi lại màn cũ.
  var viTri = MUA_1.map(function (g) { return g.ma; });
  MUA_1.forEach(function (g, i) {
    var bo = (i < viTri.indexOf('banh-lui') ? ['left_back', 'right_back'] : []).concat(i < viTri.indexOf('me-cung') ? ['left_clear', 'right_clear'] : []);
    g.chuong.forEach(function (c) {
      c[1].forEach(function (ma) {
        var m = get(ma);
        if (m.hamGoc && m.hamGoc.some(function (h) { return bo.indexOf(h) >= 0; })) m.hamGoc = m.hamGoc.filter(function (h) { return bo.indexOf(h) < 0; });
        // Biến sang mùa 2: khay mùa 1 không hiện nhóm ĐẾM (che-cam-bien.7, hai-robot, robot-hoan-thien vốn bật mà lời giải không dùng biến).
        delete m.bienDem;
      });
    });
  });
  // Gói Kho hàng đứng trước gói Bánh lùi: u_turn() lúc đó còn là bản hai lần turn_right() (xuong-ham.7), chưa phải bản một nhịp có lùi (che-xe.5).
  // Lời giải không đổi nhưng số nhịp / ô đổi: đánh dấu nội dung bản 2 để tools/do-lo-trinh.mjs đo lại ngưỡng sao (nháp cũ của các màn này bị bỏ).
  ['che-tay.1', 'che-tay.3', 'che-tay.4', 'che-tay.6', 'che-tay.10'].forEach(function (ma) { get(ma).phienBanNoiDung = 2; });
  // Màn trùm của gói R1 xuất xưởng cần bounce() và fetch_back(), nhưng hai màn chế chúng (dùng biến đếm) đã sang mùa 2: đưa sẵn thành hàm của màn, khóa (chỉ xem).
  // Chương trình còn gọi 4 hàm của em khác nhau (go_wall, pass_back, to_gap, turn_right) nên giới hạn hàm hạ từ 6 xuống 4; khay không mở nhóm ĐẾM.
  (function () {
    var m = get('robot-hoan-thien.10');
    var hm = ['che-cam-bien.5', 'che-cam-bien.9'].map(function (ma) { return copy(nguon[ma].loiGiai.hamCuaEmMoi[0]); });
    m.maMau.hamCuaMan = copy(hm);
    m.loiGiai.hamCuaMan = copy(hm);
    if (m.loiGiaiKhac) m.loiGiaiKhac.baiLam.hamCuaMan = copy(hm);
    (m.congThucKhac || []).forEach(function (c) { c.baiLam.hamCuaMan = copy(hm); c.moTa = 'Rẽ phải bằng lệnh bánh viết thẳng, chỉ còn 3 hàm của em'; });
    m.loiSai.forEach(function (ls) { ls.baiLam.hamCuaMan = copy(hm); });
    m.loiSai[2].moTa = 'Dùng thêm turn_left(): hàm thứ năm, vượt giới hạn 4 hàm';
    m.khoaHamMan = ['bounce', 'fetch_back'];
    m.hamCuaEmCan = m.hamCuaEmCan.filter(function (h) { return hm.every(function (x) { return x.ten !== h; }); })
      .concat(['move', 'back', 'pick', 'drop']);                         // thân hai hàm của màn gọi các hàm của em này
    m.gioiHanHam = 4;
    delete m.bienDem;
    m.deBai = m.deBai.replace('Chương trình chỉ được gọi 6 hàm của em khác nhau.',
      'bounce() (đi tới tường rồi lùi về chỗ cũ) và fetch_back() (đi tới thùng, nhặt, lùi về rồi đặt) là hàm của màn, đã viết sẵn. Chương trình chỉ được gọi 4 hàm của em khác nhau.');
  })();
  // Hàm của màn side_pick / side_drop gọi các hàm của em này mà ngân hàng chưa khai (khóa đúng màn khi kho thiếu, mo-goi.js luật 3 / 3b).
  get('che-tay-xoay.9').hamCuaEmCan = get('che-tay-xoay.9').hamCuaEmCan.concat(['turn_left', 'turn_right', 'pick', 'drop']);
  // Game bỏ bậc thang: xuong-ham.6 dùng ô S như tường (xe hai bánh không leo), đổi thành tường thường. Sửa thẳng sân (không qua sua()) để giữ lỗi mẫu của bài.
  get('xuong-ham.6').san = get('xuong-ham.6').san.map(function (d) { return d.replace(/S/g, '#'); });

  // Gói đội hai robot (man-doi-*.js, hoc/KE-HOACH-PHOI-HOP.md) chỉ khai báo trong ngân hàng: chèn các chương của gói ngay sau chương c.sau
  // (cuối gói part) và gói ngay sau gói chứa chương đó. Chương chưa có màn thì chưa chèn. Ngưỡng sao mặc định: gói part +30 (đã chơi kha khá gói part), không vượt gói kế tiếp.
  // Gói neo sau chương của một gói thêm khác (doi-thu-manh sau che-dua-robot) có thể được nạp trước gói đó (tệp nạp theo vần): chương neo chưa có thì để lượt sau.
  var choChen = (M.chuongThem || []).concat(M.chuongCoChe || []);
  while (choChen.length) {
    var conLai = choChen.filter(function (c) { return !TT.goi.some(function (g) { return g.chuong.indexOf(c.sau) >= 0; }); });
    if (conLai.length === choChen.length) throw new Error('Gói thêm neo sau chương không có: ' + conLai.map(function (c) { return c.sau; }).join(', '));
    choChen.filter(function (c) { return conLai.indexOf(c) < 0; }).forEach(chenGoi);
    choChen = conLai;
  }
  function chenGoi(c) {
    var ma = c.chuong.map(function (x) { return x.ma; }).filter(function (k) { return c.ds.some(function (m) { return m.chuong === k; }); });
    if (!ma.length) return;
    TT.thuTu.splice.apply(TT.thuTu, [TT.thuTu.indexOf(c.sau) + 1, 0].concat(ma));
    TT.dot2.splice.apply(TT.dot2, [TT.dot2.indexOf(c.sau) + 1, 0].concat(ma));
    c.chuong.forEach(function (x) { TT.ten[x.ma] = x.ten; });
    var truoc = TT.goi.findIndex(function (g) { return g.chuong.indexOf(c.sau) >= 0; });
    var sau = TT.goi[truoc + 1];
    var sao = Math.min(TT.goi[truoc].sao + 30, sau && sau.mua === TT.goi[truoc].mua ? sau.sao : Infinity);
    // Gói đội thuộc cùng mùa với gói part đứng trước (mùa bán riêng, thu-tu-chuong.js).
    TT.goi.splice(truoc + 1, 0, Object.assign({ loai: 'thu-thach', sao: sao, khongTangNguong: true, mua: TT.goi[truoc].mua }, c.goi, { chuong: ma }));
    M.them(c.ds);
  }
  if (SL && SL.ds) SL.ds.forEach(function (h) { if (h.ten === 'follow_right') { h.chuong = 'me-cung'; h.man = 'me-cung.6'; } });
  // Sổ lệnh: hàm được chế ở màn đã dời chương (che-xe.4 → banh-lui…) ghi theo chương mới của màn đó; màn đã cất thì giữ như ngân hàng.
  if (SL && SL.ds) SL.ds.forEach(function (h) { var m = h.man && get(h.man); if (m) h.chuong = m.chuong; });

  // Trùm máy ném: đọc màu TRƯỚC khi nạp; ba kho đổi thứ tự màu/tầm.
  var nem = get('may-nem.10');
  var orders = [['r', 'b', 'y'], ['b', 'y', 'r'], ['y', 'r', 'b']];
  var sans = [], vm = [], mau = [];
  orders.forEach(function (o) {
    var s = ['.......', '.o.....', '.......', '.o.....', '.......', '.o.....', '#######'];
    var v = ['.......', '.......', '.......', '.......', '.......', '.......', '.......'];
    var colors = copy(v);
    o.forEach(function (c, i) {
      var x = c === 'r' ? 3 : c === 'b' ? 4 : 2;
      if (x > 2) s[i * 2] = s[i * 2].slice(0, 2) + '=' + s[i * 2].slice(3);
      s[i * 2] = s[i * 2].slice(0, x) + 'D' + s[i * 2].slice(x + 1);
      v[i * 2 + 1] = '.' + c + '.....';
      colors[i * 2] = colors[i * 2].slice(0, x) + c + colors[i * 2].slice(x + 1);
    });
    sans.push(s); vm.push(v); mau.push(colors);
  });
  sua(nem.ma, {
    ten: 'Ba kho ném theo màu', deBai: 'Ba kho có ba hộp theo thứ tự màu khác nhau. Đỏ ném 2 ô, xanh dương 3 ô, vàng 1 ô. Chọn một chương trình cho cả ba kho: nhìn màu trước khi nạp, quay sang phải rồi ném đúng tầm. Các tầm đều đã học.',
    san: sans, vatMau: vm, mau: mau, batDau: sans.map(function () { return { x: 1, y: 0, huong: 2 }; }),
    robot: { than: 'hai-banh', tay: 'nem', camBien: [{ ma: 'camera', o: 'tren' }] },
    hamGoc: nem.hamGoc.concat(['color']), hamCuaEmCan: ['turn_left', 'turn_right', 'forward'], nhipTheo: 'tong', nhipTheoLoiGiai: true,
    maMau: bai([], [ham('toss_color', ['if c == "red":', '    aim(2)', 'elif c == "blue":', '    aim(3)', 'else:', '    aim(1)', 'throw()', 'wait()'], ['c'])]),
    loiGiai: bai(lap(3, ['c = color()', 'load()', 'wait()', 'turn_left()', 'toss_color(c)', 'turn_right()', 'forward(2)']),
      [ham('toss_color', ['if c == "red":', '    aim(2)', 'elif c == "blue":', '    aim(3)', 'else:', '    aim(1)', 'throw()', 'wait()'], ['c'])]),
    goiY: ['Hàm toss_color(c) đã cho sẵn cách chọn tầm; em ghép chu trình nạp, quay, ném và sang hàng.', 'Nhớ màu vào biến c trước load().']
  });

  // Trùm drone: hai kiện hàng, một đường ray sạc; ba mức pin buộc thử nhiều cấu hình.
  var rail = ['PPPPPPP', 'o=D.o=D', '#######'];
  var chat = ['.......', 's...s..', '.......'];
  var charge = ham('charge_for_trip', ['if battery() < 5:', '    go_up()', '    go_down()']);
  sua('drone.10', {
    ten: 'Giao hàng với ba mức pin', deBai: 'Giao hai hộp sắt tới hai đích trên cùng đường bay. Ba sân có pin 5, 6 và 7. Dải P nằm ngay phía trên. Tạo ship(path) như đã luyện; dùng charge_for_trip() trước mỗi chuyến và ghé sạc sau chuyến đầu để đủ pin đi lấy hộp tiếp.',
    san: [copy(rail), copy(rail), copy(rail)], vatChat: [copy(chat), copy(chat), copy(chat)], pin: [5, 6, 7],
    batDau: [0, 1, 2].map(function () { return { x: 0, y: 1, huong: 0 }; }), nhipTheo: 'tong', nhipTheoLoiGiai: true,
    maMau: bai([], [copy(charge)]),
    loiGiai: Object.assign(bai(['charge_for_trip()', 'ship("RR")', 'go_up()', 'go_down()', 'walk("RR")', 'charge_for_trip()', 'ship("RR")'], [copy(charge)]),
      { hamCuaEmMoi: copy(nguon['drone.10'].loiGiai.hamCuaEmMoi) }),
    goiY: ['ship(path) hút, bay theo path rồi thả; giữ đúng chức năng để dùng lại ở chương sau.', 'Khi đang ở trên hộp đầu, đường sạc nằm ngay phía trên.']
  });
  var relay = ham('cargo_trip', ['magnet_n()', 'wait()', 'fly("RR")', 'recharge()', 'magnet_off()', 'wait()', 'fly("LL")']);
  sua('che-drone.10', {
    ten: 'Kho hàng bay có sạc', deBai: 'Hai hộp phải tới hai bóng hộp, sau cùng drone trở về ô (4, 1). Ba sân có pin 5, 6 và 7. Tự hoàn thành cargo_trip(): hút hộp, bay sang phải hai ô bằng fly(), xét sạc trước khi thả, rồi bay về. Dùng lại fly(path) đã chế để thích nghi với pin.',
    san: [copy(rail), copy(rail), copy(rail)], vatChat: [copy(chat), copy(chat), copy(chat)], pin: [5, 6, 7],
    batDau: [0, 1, 2].map(function () { return { x: 0, y: 1, huong: 0 }; }),
    bongMo: [0, 1, 2].map(function () { return { x: 4, y: 1, vat: [{ x: 2, y: 1 }, { x: 6, y: 1 }] }; }),
    robot: { than: 'drone', tay: 'nam-cham', camBien: [{ ma: 'pin', o: 'than' }] },
    hamGoc: get('che-drone.10').hamGoc.concat(['battery']), hamCuaEmCan: ['fly', 'recharge'],
    nhipTheo: 'tong', nhipTheoLoiGiai: true, gioiHanHam: 3,
    maMau: bai([], [ham('cargo_trip', ['magnet_n()', 'wait()'])]),
    loiGiai: bai(['cargo_trip()', 'fly("RRRR")', 'cargo_trip()'], [relay]),
    goiY: ['fly() đã biết ghé sạc sau mỗi bước; không thay nó bằng walk().', 'Xét sạc trước khi thả để còn đủ pin bay về.']
  });

  // Lắp ráp cuối: ba kho, hai hộp/mỗi kho, camera và lựa chọn tay/ngân sách.
  var end = copy(nguon['rap-du.8']);
  var kho = ['.......', '..o....', '.D.D.D.', '....o..', '.......'];
  var endColors = ['.......', '.......', '.r.b.r.', '.......', '.......'];
  var boxes = [['r', 'b'], ['b', 'r'], ['r', 'r']].map(function (cs) { return ['.......', '..' + cs[0] + '....', '.......', '....' + cs[1] + '..', '.......']; });
  // Đi vòng phía trên để không đâm vào hộp đã đặt ở đích giữa hai cột.
  var sortArm = ham('sort_box', ['c = color()', 'pick()', 'if c == "red":', '    arm_left()', 'else:', '    arm_right()', 'drop()', 'restore_box(c)']);
  var sortGrip = ham('sort_box', ['c = color()', 'pick()', 'if c == "red":', '    turn_left()', 'else:', '    turn_right()', 'drop()', 'restore_box(c)']);
  var restoreArm = ham('restore_box', ['if c == "red":', '    arm_right()', 'else:', '    arm_left()', 'wait()'], ['c']);
  var restoreGrip = ham('restore_box', ['if c == "red":', '    turn_right()', 'else:', '    turn_left()'], ['c']);
  var endMain = ['sort_box()', 'move()', 'turn_right()', 'forward(2)', 'turn_right()', 'move()', 'sort_box()'];
  end.lapRap.cachLap.forEach(function (cl) {
    cl.loiGiai = bai(copy(endMain), [copy(cl.tay === 'xoay' ? sortArm : sortGrip), copy(cl.tay === 'xoay' ? restoreArm : restoreGrip)]);
    delete cl.loiGiaiPhu;
  });
  // Hộp thứ hai ở phía dưới; xe quay xuống nên cùng quy tắc trái/phải vẫn đúng màu.
  sua('rap-du.10', {
    ten: 'Chinh phục ba kho hàng', mucTieu: 'dua-vat',
    deBai: 'Chọn một bộ thân, tay và cảm biến trong 7 xu, rồi dùng cùng chương trình phân loại hai hộp trên cả ba kho. Hộp đỏ tới đích đỏ, xanh dương tới đích xanh dương. Camera phải nhìn màu trước khi nhặt; tay xoay hoặc tay kẹp đều có cách giải.',
    veMaMau: 'Hàm sort_box() còn trống. Hoàn thành việc phân loại một hộp, rồi dùng lại khi chuyển sang cột kế.',
    san: [copy(kho), copy(kho), copy(kho)], mau: [copy(endColors), copy(endColors), copy(endColors)], vatMau: boxes,
    batDau: [0, 1, 2].map(function () { return { x: 2, y: 2, huong: 0 }; }),
    lapRap: end.lapRap, nhipTheo: 'tong', nhipTheoLoiGiai: true,
    khung: { chinh: 10, moiHam: 10, cauTruc: ['for', 'if', 'while'] },
    maMau: bai([], [ham('sort_box', []), ham('restore_box', [], ['c'])]), loiGiai: copy(end.lapRap.cachLap[0].loiGiai),
    goiY: ['Tới hộp đầu với mặt quay lên; tới hộp thứ hai với mặt quay xuống. Đỏ luôn ở bên trái xe, xanh ở bên phải xe.', 'Sau khi thả, khôi phục hướng tay hoặc thân bằng restore_box(c). Đi vòng phía trên, tránh đích giữa đã có hộp.']
  });
  var final = get('rap-du.10');
  // Part áp dụng lại cấu hình mặc định sau khi thay cả lapRap (không giữ tay súng cũ).
  var LR = node ? require('./lap-rap.js') : window.LapRap;
  delete final.pin; delete final.pinDrone;
  delete final.robot; delete final.hamGoc; delete final.loaiRobot; delete final.loiGiai;
  LR.macDinh(final);
  final.hamCuaEmCan = ['pick', 'drop', 'turn_left', 'turn_right', 'move', 'forward'];
  final.sao.re = { gia: 6, o: 38 };

  // Bỏ kiểu màn "dây / bộ phận lắp ngược" (daoChieu): mỗi màn thành một lỗi code thật hay một bài mới cùng robot, cùng chỗ trong chương.
  function thay(ma, ds) {
    var m = sua(ma, ds);
    delete m.daoChieu; delete m.canhBao; delete m.khoaHamMan;
    return m;
  }
  thay('che-xe.8', {
    ten: 'Hai bánh cùng nhịp', chinhCoDinh: true, hamCuaEmCan: ['move'],
    deBai: 'Hàm go_one() của màn ra lệnh cho hai bánh ở hai nhịp khác nhau nên xe chỉ lắc qua lắc lại. Sửa hàm để xe tiến thẳng đúng một ô, rồi đưa xe tới cờ.',
    veMaMau: 'Chương trình chính bị khóa, gọi go_one() ba lần. Thử go_one() trong sân thử của Xưởng hàm trước để thấy xe làm gì.',
    maMau: bai(['go_one()', 'go_one()', 'go_one()'], [ham('go_one', ['left_move()', 'wait()', 'right_move()', 'wait()'])]),
    loiGiai: bai(['go_one()', 'go_one()', 'go_one()'], [ham('go_one', ['left_move()', 'right_move()', 'wait()'])]),
    goiY: ['Một bánh quay một mình thì xe xoay, không tiến.', 'Hai lệnh bánh phải nằm trong cùng một nhịp: đặt chúng liền nhau, rồi mới wait().']
  });
  thay('che-tay.8', {
    ten: 'Thứ tự của tay', chinhCoDinh: true, hamCuaEmCan: ['move'],
    deBai: 'Hai hàm lift() và put() của màn viết sai thứ tự lệnh: tay kẹp vào không khí, còn vật bị thả từ trên cao. Sửa chúng để chương trình đưa vật lên hai ô như vật mờ.',
    veMaMau: 'Chương trình chính bị khóa: nhặt, tiến hai ô, đặt. Thử lift() và put() trong sân thử của Xưởng hàm để thấy tay làm gì.',
    maMau: bai(['lift()', 'move()', 'move()', 'put()'], [ham('lift', ['grab()', 'arm_down()', 'wait()', 'arm_up()', 'wait()']), ham('put', ['arm_down()', 'wait()', 'arm_up()', 'release()', 'wait()'])]),
    loiGiai: bai(['lift()', 'move()', 'move()', 'put()'], [ham('lift', ['arm_down()', 'grab()', 'wait()', 'arm_up()', 'wait()']), ham('put', ['arm_down()', 'release()', 'wait()', 'arm_up()', 'wait()'])]),
    goiY: ['Phải hạ tay xuống trước rồi mới kẹp được vật.', 'Thả vật khi tay còn đang hạ, rồi mới nâng tay lên.']
  });
  thay('che-cam-bien.7', {
    ten: 'Thừa chữ not', chinhCoDinh: true, hamCuaEmCan: ['move'],
    deBai: 'Hàm safe_move2() của màn phải tiến một ô khi trước mặt trống và đứng yên khi bị chắn, nhưng xe không nhúc nhích. Sửa điều kiện trong hàm.',
    veMaMau: 'Chương trình chính bị khóa, gọi safe_move2() ba lần. Thử safe_move2() trong sân thử của Xưởng hàm.',
    maMau: bai(['safe_move2()', 'safe_move2()', 'safe_move2()'], [ham('safe_move2', ['if not front_clear():', '    move()'])]),
    loiGiai: bai(['safe_move2()', 'safe_move2()', 'safe_move2()'], [ham('safe_move2', ['if front_clear():', '    move()'])]),
    goiY: ['not đảo ngược câu trả lời: trước mặt trống thì not front_clear() là False.', 'Bỏ chữ not để xe chỉ tiến khi trước mặt trống.']
  });
  thay('robot-hoan-thien.7', {
    ten: 'Mang thùng về nhà', hamCuaEmCan: ['move', 'pick', 'back', 'drop', 'u_turn', 'go_wall'],
    deBai: 'Thùng hàng nằm giữa hành lang. Đi tới thùng, nhặt lên, mang về đặt sát tường ở đầu hành lang nơi xe xuất phát, giống vật mờ và xe mờ.',
    veMaMau: 'Dùng cảm biến để dừng trước thùng và trước tường, không đếm số ô.',
    san: ['#######', '#..o..#', '#######'], batDau: { x: 1, y: 1, huong: 1 }, bongMo: { x: 2, y: 1, huong: 3, vat: [{ x: 1, y: 1 }] },
    maMau: bai([]), loiGiai: bai(['go_wall()', 'pick()', 'u_turn()', 'go_wall()', 'back()', 'drop()']),
    goiY: ['Thùng cũng chắn cảm biến như tường: go_wall() dừng ngay trước thùng.', 'Tới sát tường thì không còn chỗ đặt: lùi một ô rồi mới drop().']
  });
  thay('robot-hoan-thien.8', {
    ten: 'Dọn sang trái rồi về', hamCuaEmCan: ['go_wall', 'move', 'turn_right', 'turn_left', 'u_turn', 'pick', 'drop'],
    deBai: 'Ba thùng xếp dọc hành lang. Dời từng thùng sang ô bên trái xe, rồi đưa xe về chỗ xuất phát, quay mặt xuống, giống vật mờ và xe mờ.',
    veMaMau: 'Ba thùng làm giống nhau: viết một lần trong vòng for.',
    san: ['####', '#.##', '.o##', '.o##', '.o##', '#.##', '#.##'], batDau: { x: 1, y: 6, huong: 0 },
    bongMo: { x: 1, y: 6, huong: 2, vat: [{ x: 0, y: 2 }, { x: 0, y: 3 }, { x: 0, y: 4 }] },
    maMau: bai([]), loiGiai: bai(['go_wall()', 'for i in range(3):', '    pick()', '    move()', '    turn_left()', '    drop()', '    turn_right()', 'u_turn()', 'go_wall()']),
    goiY: ['Nhặt thùng trước mặt, tiến vào chỗ trống của nó, quay trái rồi thả.', 'Thả xong quay lại hướng cũ để lượt sau thấy thùng kế tiếp.']
  });
  thay('che-nhen.8', {
    ten: 'Cú nhảy thiếu nhịp', chinhCoDinh: true,
    deBai: 'Hàm fixed_jump(d) của màn co rồi duỗi chân trong cùng một nhịp nên nhện không lấy được đà và rơi xuống hố. Sửa nó để nhện nhảy qua cả hai hố.',
    veMaMau: 'Chương trình chính bị khóa: fixed_jump("R") hai lần. Sửa thân hàm trong Xưởng.',
    maMau: bai(['fixed_jump("R")', 'fixed_jump("R")'], [ham('fixed_jump', ['crouch()', 'stand()', 'go(d)'], ['d'])]),
    loiGiai: bai(['fixed_jump("R")', 'fixed_jump("R")'], [ham('fixed_jump', ['crouch()', 'wait()', 'stand()', 'go(d)'], ['d'])]),
    goiY: ['Chân cần một nhịp ngồi xuống trước khi bật lên.', 'Thêm wait() giữa crouch() và stand().']
  });
  thay('che-list.9', {
    ten: 'Đếm lại từ đầu', chinhCoDinh: true,
    deBai: 'Hàm scan3(seen) của màn đặt n = 0 bên trong vòng while nên lần nào cũng ghi số 1. Sửa scan3(seen) để đo đúng và về đúng xe mờ.',
    veMaMau: 'Chương trình chính bị khóa: scan3(seen) hai lần, rồi route(seen). Chạy thử, xem seen ghi số nào rồi sửa thân hàm scan3.',
    maMau: bai(['seen = []', 'scan3(seen)', 'turn_right()', 'scan3(seen)', 'turn_right()', 'route(seen)'], [ham('scan3', ['while front_clear():', '    n = 0', '    move()', '    n = n + 1', 'seen.append(n)'], ['seen'])]),
    loiGiai: bai(['seen = []', 'scan3(seen)', 'turn_right()', 'scan3(seen)', 'turn_right()', 'route(seen)'], [ham('scan3', ['n = 0', 'while front_clear():', '    move()', '    n = n + 1', 'seen.append(n)'], ['seen'])]),
    goiY: ['Mỗi vòng lặp n lại bị đặt về 0 trước khi cộng.', 'Đưa n = 0 ra ngoài, trước vòng while.']
  });
  thay('che-xich.8', {
    ten: 'Quay chưa đủ', chinhCoDinh: true,
    deBai: 'Hàm fixed_turn() của màn chỉ quay xích một nhịp, nên xe mới quay được nửa vòng thì đi tiếp và phần quay dở bị mất. Sửa nó để xe đi hết đường như xe mờ.',
    veMaMau: 'Chương trình chính bị khóa: đi ba ô, rẽ phải, đi hai ô. Thử fixed_turn() trong sân thử của Xưởng hàm.',
    maMau: bai(['fixed_drive()', 'fixed_drive()', 'fixed_drive()', 'fixed_turn()', 'fixed_drive()', 'fixed_drive()'],
      [ham('fixed_drive', ['left_move()', 'right_move()', 'wait()']), ham('fixed_turn', ['for i in range(1):', '    left_move()', '    wait()'])]),
    loiGiai: bai(['fixed_drive()', 'fixed_drive()', 'fixed_drive()', 'fixed_turn()', 'fixed_drive()', 'fixed_drive()'],
      [ham('fixed_drive', ['left_move()', 'right_move()', 'wait()']), ham('fixed_turn', ['for i in range(2):', '    left_move()', '    wait()'])]),
    goiY: ['Xe xích cần hai nhịp liền nhau để rẽ một góc vuông.', 'Đổi số lần lặp trong fixed_turn().']
  });
  thay('che-sung-hoi.7', {
    ten: 'Đá hai bên', chinhCoDinh: true,
    deBai: 'Hai thùng nặng nằm hai bên xe. Hàm kick_both() của màn mới đá được thùng bên trái. Sửa nó để đá cả hai thùng ra xa như thùng mờ, xe giữ chỗ và hướng.',
    veMaMau: 'Chương trình chính bị khóa, chỉ gọi kick_both(). Thử nó trong sân thử của Xưởng hàm.',
    san: ['.....', '.....', '.H.H.', '.....', '.....'], bongMo: { x: 2, y: 2, huong: 0, thung: [{ x: 0, y: 2 }, { x: 4, y: 2 }] },
    maMau: bai(['kick_both()'], [ham('kick_both', ['turn_left()', 'shoot()', 'wait()', 'turn_right()'])]),
    loiGiai: bai(['kick_both()'], [ham('kick_both', ['turn_left()', 'shoot()', 'wait()', 'shoot_back()', 'wait()', 'turn_right()'])]),
    goiY: ['Khi xe quay trái, thùng bên phải nằm ngay sau lưng xe.', 'Thêm shoot_back() và wait() trước khi quay lại.']
  });
  thay('che-nam-cham.7', {
    ten: 'Hút hay đẩy', chinhCoDinh: true,
    deBai: 'Hàm fixed_grip() của màn bật cùng cực với vật nên vật bị đẩy ra xa. Sửa fixed_grip() cho vật bị kéo về, để chương trình chuyền vật sang phải như vật mờ.',
    veMaMau: 'Chương trình chính bị khóa: kéo vật bằng fixed_grip(), rẽ phải, ngắt điện. Thử fixed_grip() trong sân thử của Xưởng hàm để thấy vật đi đâu.',
    maMau: bai(['fixed_grip()', 'turn_right()', 'magnet_off()', 'wait()'], [ham('fixed_grip', ['if front_pole() == "N":', '    magnet_n()', 'else:', '    magnet_s()', 'wait()'])]),
    loiGiai: bai(['fixed_grip()', 'turn_right()', 'magnet_off()', 'wait()'], [ham('fixed_grip', ['if front_pole() == "N":', '    magnet_s()', 'else:', '    magnet_n()', 'wait()'])]),
    goiY: ['Hai cực giống nhau thì đẩy nhau, khác nhau thì hút nhau.', 'Vật cực N cần nam châm cực S, và ngược lại.']
  });
  thay('tay-xoay.7', {
    ten: 'Đố: quên hạ tay',
    deBai: 'Vật nằm ngay bên trái xe, ô đích nằm ngay trước mặt xe. Chương trình có sẵn kẹp vào không khí. Sửa lại để đưa vật tới ô đích.',
    veMaMau: 'Chạy thử, xem tay đang ở trên cao hay đã hạ xuống lúc kẹp.',
    maMau: bai(['arm_left()', 'grab()', 'wait()', 'arm_up()', 'arm_right()', 'wait()', 'arm_down()', 'release()', 'wait()']),
    loiGiai: bai(['arm_left()', 'arm_down()', 'grab()', 'wait()', 'arm_up()', 'arm_right()', 'wait()', 'arm_down()', 'release()', 'wait()']),
    goiY: ['Tay phải hạ xuống thì mới kẹp được vật nằm dưới đất.', 'Thêm arm_down() trước grab().']
  });
  thay('che-tay-xoay.8', {
    ten: 'Tay chưa về giữa', chinhCoDinh: true,
    deBai: 'Hàm fixed_pick_left() của màn nhặt vật bên trái nhưng quên xoay tay về giữa, nên fixed_drop_right() đặt vật sai chỗ. Sửa để chuyển vật từ trái sang phải như vật mờ.',
    veMaMau: 'Chương trình chính bị khóa: nhặt bên trái rồi đặt sang phải. Thử từng hàm trong sân thử của Xưởng hàm để xem tay đang chỉ về đâu.',
    maMau: bai(['fixed_pick_left()', 'fixed_drop_right()'], [ham('fixed_pick_left', ['arm_left()', 'arm_down()', 'grab()', 'wait()', 'arm_up()', 'wait()']),
      ham('fixed_drop_right', ['arm_right()', 'arm_down()', 'release()', 'wait()', 'arm_up()', 'arm_left()', 'wait()'])]),
    loiGiai: bai(['fixed_pick_left()', 'fixed_drop_right()'], [ham('fixed_pick_left', ['arm_left()', 'arm_down()', 'grab()', 'wait()', 'arm_up()', 'arm_right()', 'wait()']),
      ham('fixed_drop_right', ['arm_right()', 'arm_down()', 'release()', 'wait()', 'arm_up()', 'arm_left()', 'wait()'])]),
    goiY: ['Từ bên trái, một lần arm_right() chỉ đưa tay về giữa.', 'Thêm arm_right() trước wait() cuối của fixed_pick_left().']
  });

  // Viết lại các đoạn mô tả vốn so sánh nhiều sân thành yêu cầu luyện một tình huống.
  var deLuyen = {
    'khoang-cach.4': 'Hành lang có một góc rẽ phải. Đi tới tường bằng cảm biến, rẽ phải rồi đi hai ô tới cờ.',
    'khoang-cach.9': 'Nhặt hộp ngay trước mặt, mang tới cuối hành lang bằng go_wall(), quay phải rồi thả vào đích.',
    'che-cam-bien.4': 'Hành lang có một cửa mở bên phải. Chế to_gap(): đi thẳng cho tới khi bên phải trống và dừng đúng bóng mờ.',
    'che-cam-bien.5': 'Tự chế bounce(): đi tới tường rồi lùi về đúng chỗ cũ. Dùng biến n đếm bước như bài count_return() vừa sửa; mỗi bước đi tăng n một đơn vị, rồi lùi n bước.',
    'che-cam-bien.9': 'Hộp ở cuối hành lang. Chế fetch_back(): đếm bước khi đi tới hộp, nhặt, lùi về đúng chỗ cũ rồi đặt hộp xuống trước mặt như bóng mờ.',
    'robot-hoan-thien.1': 'Thùng hàng nằm giữa hành lang. Đưa thùng tới ô cuối hành lang, sát tường, giống vật mờ.',
    'robot-hoan-thien.3': 'Nhặt thùng trước mặt, mang dọc hành lang tới ngăn kệ bên phải rồi đặt vào ngăn như vật mờ.',
    'robot-hoan-thien.5': 'Dãy thùng chắn hành lang. Dời từng thùng sang ô bên phải xe, rồi đưa xe tới cuối hành lang như vật mờ và xe mờ.',
    'hai-robot.4': 'R1 mang vật lên ô giao trước mặt R2; R2 nhận và mang vật tới đích. Dùng cảm biến để R2 chờ đúng lúc hàng tới.',
    'hai-robot.5': 'Hai đường cắt nhau ở ngã tư. R2 chờ R1 đi qua rồi mới tiến; cùng vào một ô thì cả hai đứng yên.',
    'hai-robot.6': 'Hai robot chung một làn, R1 đi trước. Cờ R2 ở hốc ngay trước cờ R1. Cho cả hai tới đúng cờ mà không chặn nhau.',
    'hai-robot.7': 'Mỗi robot dọn một dãy vật sang cột đích bên phải. Hai robot làm cùng lúc cho tới khi hết vật.',
    'hai-robot.9': 'Đích nằm giữa đường, không có tường để R1 biết lúc nào dừng. Cho R2 đứng ngay sau đích làm mốc, rồi để R1 giao hàng.',
    'che-list.4': 'Xe đo hai cạnh đầu bằng cảm biến rồi đi hai cạnh sau theo danh sách seen. Chế scan(seen): đi tới tường, đếm số ô và ghi một số vào seen.',
    'che-list.5': 'Xe đã đo cạnh đầu của bãi hình vuông vào seen. Chế box(seen): đi ba cạnh còn lại theo số đã ghi, về đúng xe mờ.',
    'che-list.6': 'Đo hai cạnh đầu của bãi chữ nhật vào danh sách rồi đi hai cạnh sau, về đúng xe mờ. Dùng scan() và route() đã chế.',
    'che-list.8': 'Hàm scan2(seen) ghi nhiều số thừa khiến xe đi sai hai cạnh sau. Sửa chỗ ghi số để xe về đúng xe mờ.',
    'mau.4': 'Đi theo vạch tới cờ: ô đỏ rẽ phải, ô xanh dương rẽ trái, màu khác đi thẳng.',
    'mau.5': 'Tạo read_turn(): đỏ thì rẽ phải, xanh dương thì rẽ trái, màu khác không quay. Dùng hàm ở mỗi bước trên vạch tới cờ.',
    'mau.6': 'Đi tới ô vàng, rẽ phải rồi đi tới ô xanh dương có cờ. Dùng màu để quyết định điểm dừng.',
    'che-mau.1': 'Cảm biến màu đọc ô dưới xe. Chế to_red(): đi thẳng cho tới khi đứng trên ô đỏ như bóng mờ.',
    'che-mau.2': 'Xe đứng đầu một dải màu. Chế cross(): nhớ màu lúc đầu, đi tới ô đầu tiên có màu khác như bóng mờ.',
    'che-mau.3': 'Hết dải màu ở chân đường thì rẽ phải, đi tới ô đỏ, rồi rẽ trái và đi hai ô tới cờ. Ghép cross() và to_red() trong 10 ô.',
    'che-mau.4': 'Cảm biến bụng không nhìn được ô phía trước. Chế stop_line(): đi tìm vạch đỏ rồi dừng ngay trước vạch, không đè lên vạch.',
    'che-mau.5': 'Chế follow_line(): ô đỏ rẽ phải, xanh dương rẽ trái, tiếp tục theo vạch cho tới khi đứng trên ô vàng như bóng mờ.',
    'rap-nao.5': 'Cửa hông dẫn tới cờ. Lắp robot trong 5 xu rồi dùng cảm biến tìm cửa và tới cờ.',
    'nam-cham.6': 'front_pole() đọc cực N hoặc S của vật phía trước. Chế grip() bật cực khác vật để hút; tiến tới khi thấy vật, hút, rẽ phải và thả vào đích.',
    'che-nam-cham.5': 'Chế sort(): đọc cực vật trước mặt, vật N chuyền sang phải, vật S sang trái, xe giữ vị trí và hướng. Dùng lane() đã chế để mỗi hàm vừa 10 ô.',
    'may-nem.6': 'Hàng rào chắn trước xe, đích ở phía sau hàng rào. Hỏi front_clear() để chọn tầm 2 hoặc 3 rồi ném vật vào đích.',
    'drone.6': 'Drone có pin 5. Dùng recharge() để ghé sạc khi pin thấp, tiếp tục bay tới cờ; quan sát pin sau mỗi lần bay hai ô.',
    'flycam.1': 'look() đọc màu ô dưới drone. Chế seek_red(): bay sang phải tới khi thấy ô đỏ như bóng mờ.',
    'flycam.6': 'Ô vàng là cuối hành lang, dải sạc P ở phía trên. Chế patrol(seen): ghi các ô đã qua vào seen, rồi bay về đúng nhà, ghé sạc khi pin thấp.',
    'flycam.7': 'go_out(seen) đã bay xuống cầu thang tới ô vàng và ghi từng bậc vào seen. Viết come_back(seen) để đi ngược các bậc về đúng nhà.',
    'rap-du.3': 'Hành lang có hàng rào và một chỗ hở. Lắp robot trong 4 xu rồi dùng cảm biến tìm lối tới cờ.',
    'rap-du.8': 'Hộp phải vào đích cùng màu. Lắp robot trong 7 xu có thể nhìn màu hộp trước khi nhặt, rồi phân loại nó vào đích đỏ hoặc xanh dương.',
    'rap-du.9': 'Hộp nam châm cách xe ba ô. Lắp robot trong 7 xu, đọc cực của hộp để chọn cực hút; hút về rồi thả vào đích sau lưng xe.'
  };
  Object.keys(deLuyen).forEach(function (ma) { get(ma).deBai = deLuyen[ma]; });
  get('khoang-cach.4').ten = 'Hành lang một góc';
  get('che-cam-bien.3').ten = 'Ghép những góc rẽ';
  get('drone.6').ten = 'Theo dõi pin';
  // Kho thật có u_turn() một nhịp (thêm một dòng so với kho cổ điển).
  // Trùm nam châm phải cho đủ sao ô với chính kho người chơi đã học.
  get('nam-cham.10').sao.o = 23;

  // Ngưỡng sao được đo offline bằng máy chấm trên lộ trình mới, không chia tổng 3 sân.
  var nguong = node ? require('./lo-trinh-sao.js') : window.NguongSaoLoTrinh;
  M.danhSach.forEach(function (m) {
    if (nguong && nguong[m.ma]) m.sao = Object.assign({}, m.sao, nguong[m.ma]);
  });
  M.phienBanLoTrinh = 2;
  M.tinhLai();
  if (node) module.exports = M;
})();
