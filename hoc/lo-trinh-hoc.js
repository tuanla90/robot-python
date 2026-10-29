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
      'cam-bien-them',
      // 8 màn mới của gói 5 Bánh lùi (chỉ khai, lộ trình thêm vào hai chương bên dưới)
      'banh-lui-them',
      // 10 màn mới của gói 8 Đội hai robot, chương 2 "Đội phối hợp" (chỉ khai, lộ trình thêm chương bên dưới)
      'doi-mua-1',
      // 19 màn mới của gói 9 Combo (tay xoay + cảm biến bên), hai chương combo / che-combo (chỉ khai, lộ trình thêm chương bên dưới)
      'combo-mua-1',
      // 11 màn mới của gói 10 R1 xuất xưởng: robot-hoan-thien.11 (thay robot-hoan-thien.10) + chương 2 trum-mua-1 "Trùm mùa" (chỉ khai, lộ trình thêm bên dưới)
      'trum-mua-1',
      // MÙA 2 (KE-HOACH-MUA-2.md): mỗi gói có màn mới một tệp ngân hàng (chỉ khai ManHoc.man…, lộ trình thêm vào chương của MUA_2 bên dưới)
      'bien-xich', 'hong-ngoai', 'day-thung', 'che-luc-ban', 'do-nhiet', 'doi-mua-2', 'be-sung', 'trum-mua-2',
      // MÙA 3 (KE-HOACH-MUA-3.md): mỗi gói một tệp ngân hàng màn mới (chỉ khai ManHoc.man…, lộ trình thêm vào chương của MUA_3 bên dưới)
      'than-nhen', 'nam-cham-n', 'cam-ung-tu', 'bai-tu', 'nhay', 'dao-cuc', 'doc-cuc', 'doi-xich-nhen', 'bung-nhen', 'trum-mua-3'].forEach(function (n) { require('./man-' + n + '.js'); });
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
  // Gói 2 chương 2 Vòng lặp (KE-HOACH-MUA-1.md, Vướng 4): hai màn gần cuối chương thêm TAY KẸP để chương đúng "hàm cho tay" (che-lap.5 Dọn hàng đã có tay).
  // Chỉ dùng thứ của gói 1–2 (for, pick / drop, move / rẽ). vong-lap.10 không đổi (nó tạo row / bend_left / bend_right cho màn khác).
  // Cỡ sân / nhịp đặt giữa vong-lap.6 và che-lap.5 cho đường cong chương (luật đo: n ≤ max(1,5 × n−1, n−1 + bù)).
  (function () {
    var vl8 = ['pick()', 'for i in range(6):', '    move()', 'turn_left()', 'for i in range(4):', '    move()', 'drop()'];
    sua('vong-lap.8', {
      ten: 'Thụt lề', mucTieu: 'dua-vat', canFor: 'tran-khung', hamCuaEmCan: ['pick', 'move', 'turn_left', 'drop'],
      deBai: 'Nhặt thùng ngay trước mặt, mang nó sang phải sáu ô, rẽ trái, đi lên bốn ô rồi đặt vào ô đích ở đầu đường.',
      veMaMau: 'Chương trình có sẵn đủ lệnh nhưng xe cứ quay vòng thay vì đi thẳng. Thụt vào là nằm trong vòng lặp, thụt ra là nằm ngoài: có dòng nào đang đứng sai chỗ?',
      san: ['######D', '######.', '######.', '######.', '######.', '.o.....'], batDau: { x: 0, y: 5, huong: 1 },
      maMau: bai(['pick()', 'for i in range(6):', '    move()', '    turn_left()', 'for i in range(4):', '    move()', 'drop()']),
      loiGiai: bai(vl8),
      loiSai: [
        { moTa: 'Không sửa gì: turn_left() nằm trong vòng lặp nên xe quay vòng, đâm tường', baiLam: bai(['pick()', 'for i in range(6):', '    move()', '    turn_left()', 'for i in range(4):', '    move()', 'drop()']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'drop() thụt vào vòng for thứ hai: thùng bị đặt ngay sau bước đầu', baiLam: bai(['pick()', 'for i in range(6):', '    move()', 'turn_left()', 'for i in range(4):', '    move()', '    drop()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên nhặt thùng: thùng chắn ngay trước mặt', baiLam: bai(vl8.slice(1)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Chạy thử và xem xe làm gì ở nhịp sau khi nhặt: nó rẽ sớm hơn dự định.', 'Dòng rẽ chỉ chạy một lần, sau khi vòng lặp đầu đã đi xong; drop() cũng nằm ngoài vòng lặp.']
    }).loiGiaiKhac = { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: bai(['# nhặt, sang phải, lên, đặt'].concat(vl8)) };
    var vl9 = ['pick()', 'for i in range(3):', '    for j in range(5):', '        move()', '    turn_right()', 'drop()'];
    sua('vong-lap.9', {
      ten: 'Vòng lặp lồng nhau', mucTieu: 'dua-vat', canFor: 'tran-khung', hamCuaEmCan: ['pick', 'move', 'turn_right', 'drop'],
      deBai: 'Nhặt thùng ngay trước mặt rồi đi hành lang hình chữ U úp ngược: lên năm ô, rẽ phải, sang năm ô, rẽ phải, xuống năm ô, rẽ phải, rồi đặt thùng vào ô đích. Ba đoạn giống hệt nhau là "đi năm ô rồi rẽ phải", mà đi năm ô cũng là một vòng lặp.',
      san: ['......', '.####.', '.####.', '.####.', 'o####.', '.###D.'], batDau: { x: 0, y: 5, huong: 0 },
      maMau: bai([]), loiGiai: bai(vl9),
      loiSai: [
        { moTa: 'Vòng ngoài chỉ lặp hai lần: xe đặt thùng xuống giữa đường', baiLam: bai(['pick()', 'for i in range(2):', '    for j in range(5):', '        move()', '    turn_right()', 'drop()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Vòng trong lặp bốn lần: xe rẽ sớm một ô rồi đâm tường', baiLam: bai(['pick()', 'for i in range(3):', '    for j in range(4):', '        move()', '    turn_right()', 'drop()']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'Quên nhặt thùng: thùng chắn ngay trước mặt', baiLam: bai(vl9.slice(1)), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Vòng lặp có thể nằm trong thân một vòng lặp khác, thụt vào thêm một bậc.', 'Lần rẽ phải thứ ba đưa mũi xe về phía ô đích: đặt thùng sau vòng ngoài.']
    }).loiGiaiKhac = { moTa: 'Không lồng vòng lặp: vòng ngoài gọi move() năm lần rồi rẽ', baiLam: bai(['pick()', 'for i in range(3):', '    move()', '    move()', '    move()', '    move()', '    move()', '    turn_right()', 'drop()']) };
  })();
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
    // HD1 (29/10): ba sân, mỗi sân một nhánh (bên phải trống / chỉ phía trước / hai phía đều chặn): một sân thì thân hàm chỉ có nhánh đầu cũng 3 sao.
    maze(6, 'Chế một bước bám tường', 'Em đã biết ba trường hợp. Gom chúng vào hàm follow_right(): rẽ phải và tiến, hoặc tiến thẳng, hoặc quay trái. Ba sân, mỗi sân một trường hợp; chương trình gọi hàm hai lượt.',
      [['#####', '##.##', '#..F#', '#####'], ['#####', '##F##', '##.##', '#####'], ['#####', '##F.#', '#####', '#####']], [{ x: 2, y: 2, huong: 0 }, { x: 2, y: 2, huong: 0 }, { x: 3, y: 1, huong: 0 }],
      Object.assign(bai(lap(2, ['follow_right()'])), { hamCuaEmMoi: [ham('follow_right', FOLLOW)] }), bai(lap(2, ['follow_right()'])), ['Thân hàm là đúng quy tắc ba nhánh ở màn trước.', 'Sân ba: lượt đầu chỉ quay trái, lượt sau mới tiến.']),
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
  ds[5].nhipTheo = 'tong';
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
      ['#######', '#####.#', '#####.#', '#####.#', '#.....#', '#.###.#', '#F###.#', '#######'], { x: 5, y: 6, huong: 0 },           // HD1: hai cửa cách 2 và 3 ô, đếm cứng không qua
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
      [['#####', '##.##', '#F.##', '##.##', '##..#', '##.##', '##.##', '#####'], ['#####', '##.##', '##.##', '##.##', '#F.##', '##.##', '##.##', '#####']], [{ x: 2, y: 6, huong: 0 }, { x: 2, y: 6, huong: 0 }],     // HD1: hai sân, cửa trái cách 4 và 2 ô
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
  dsBen[6].nhipTheo = 'tong';
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
  // 27/10: gói 3 đủ 20 màn (thêm khoang-cach.11, che-cam-bien.11–16 của man-cam-bien-them.js) nên ngưỡng gói 4–10 tính lại (+15 / +10 ★).
  // khoang-cach: kc.4 đứng trước kc.5 (chưa có go_wall thì viết while thẳng không mất sao ô), kc.11 ngay trước kc.5.
  // che-cam-bien: 3 màn mới (.11–.13) làm mượt chỗ nhảy từ 1–2 nhịp lên 17 nhịp của che-cam-bien.3, rồi .14, .15 và trùm .16.
  // 27/10: gói 5 đủ 20 màn (banh-lui.1–4, che-banh-lui.1–4 của man-banh-lui-them.js) nên ngưỡng gói 6–9 tính lại (+15 ★): 150, 180, 210, 225.
  // banh-lui: màn mới chen giữa màn cũ (thứ tự cũ giữ nguyên) để dòng / nhịp / cỡ sân không nhảy vọt; trùm mới banh-lui.4 (huy hiệu banh-lui).
  // che-banh-lui: che-banh-lui.1 đệm giữa che-tay.7 (8 nhịp) và che-tay.9 (14 nhịp); .2–.4 là biến thể trước trùm che-xe.10.
  // 27/10: gói 8 đủ 20 màn (che-hai-robot.1–10 của man-doi-mua-1.js) nên ngưỡng gói 10 tính lại (+15 ★): 240.
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
  // HD1 (29/10, user: "show don't tell"): màn đầu của mỗi khối mới là MÀN TRÌNH DIỄN (chiChay: chương trình khoá, chỉ bấm Chạy là thấy khối chạy),
  // màn kế tiếp ÉP dùng khối đó (khoang-cach.12 ép if, khoang-cach.13 ép while: hai sân dài ngắn khác nhau, man-cam-bien-them.js). khoang-cach.4 (trùng ý
  // kc.3) và khoang-cach.9 (bản một sân của trùm kc.10) cất để chương giữ 10 màn. Máy dò lời giải lách: hoc/kiem-lach-mua-1.mjs.
  /** Lấy lại bản nhiều sân của ngân hàng cho màn CHẾ HÀM có while / if: hàm phải chạy đúng ở mọi sân nên thân hàm đếm cứng không qua. */
  function nhieuSan(ma) {
    var m = get(ma), g = nguon[ma];
    ['san', 'batDau', 'bongMo', 'nhipTheo', 'deBai', 'veMaMau', 'goiY', 'sao'].forEach(function (k) { if (g[k] !== undefined) m[k] = copy(g[k]); });
    m.phienBanNoiDung = 2;
  }
  ['che-cam-bien.1', 'che-cam-bien.2', 'che-cam-bien.4'].forEach(nhieuSan);
  sua('khoang-cach.1', {
    ten: 'Hỏi trước khi đi', chiChay: true, chinhCoDinh: true,
    deBai: 'Cảm biến khoảng cách ở hông xe đo ô ngay trước mặt: front_clear() là True khi ô đó đi vào được, False khi là tường. Chương trình lặp 5 lần, mỗi lần hỏi front_clear() rồi mới move(). Bấm Chạy xem xe tới chỗ xe mờ thế nào.',
    veMaMau: 'Chương trình đã viết sẵn và khoá. Bấm Chạy: vòng for lặp 5 lần nhưng xe chỉ đi 3 ô rồi dừng trước tường, không húc.',
    san: ['###', '#.#', '#.#', '#.#', '#.#'], batDau: { x: 1, y: 4, huong: 0 }, mucTieu: 'bong-mo', bongMo: { x: 1, y: 1, huong: 0 },      // xe mờ thay cờ: tới cờ là dừng ngay, không thấy if chặn húc tường
    maMau: bai(['for i in range(5):', '    if front_clear():', '        move()']),
    loiGiai: bai(['for i in range(5):', '    if front_clear():', '        move()']),
    sao: { o: 6, nhip: 3 },
    goiY: ['Hai lần lặp cuối front_clear() trả về False nên move() không chạy.', 'Không có if thì xe húc tường hai lần.']
  });
  sua('khoang-cach.2', {
    ten: 'Đi tới tường', chiChay: true, chinhCoDinh: true,
    deBai: 'Lệnh while lặp lại chừng nào điều kiện còn đúng: while front_clear() cho xe đi tới sát tường mà không cần đếm số ô. Bấm Chạy xem xe đi hết hành lang.',
    veMaMau: 'Chương trình đã viết sẵn và khoá: chỉ hai dòng, không có số ô nào. Bấm Chạy.',
    san: ['#########', '#......F#', '#########'], batDau: { x: 1, y: 1, huong: 1 },
    maMau: bai(['while front_clear():', '    move()']),
    loiGiai: bai(['while front_clear():', '    move()']),
    sao: { o: 5, nhip: 6 },
    goiY: ['Xe dừng khi ô trước mặt là tường: lúc đó front_clear() trả về False.', 'Hành lang dài bao nhiêu cũng chỉ cần hai dòng này.']
  });
  // HD2 (29/10, đề xuất 3c của HD1): vong-lap.1 là màn TRÌNH DIỄN for (chiChay, range(6) thắng ngay khi bấm Chạy); việc tự đổi số dời sang vong-lap.2
  // (hướng dẫn vong-lap.2 đã có bước đổi số). Ngân hàng man-vong-lap.js giữ bản range(2) cho máy kiểm cũ.
  sua('vong-lap.1', {
    ten: 'Lặp lại', chiChay: true, chinhCoDinh: true,
    deBai: 'Lá cờ nằm thẳng phía trước xe, cách sáu ô. Vòng for lặp lại các dòng thụt vào bên dưới nó: range(6) là lặp sáu lần. Bấm Chạy xem xe đi tới cờ chỉ với một dòng move().',
    veMaMau: 'Chương trình đã viết sẵn và khoá: move() chỉ viết một lần nhưng chạy sáu lần. Bấm Chạy.',
    maMau: bai(lap(6, ['move()'])),
    loiGiai: bai(lap(6, ['move()'])),
    goiY: ['Số trong range() là số lần lặp.', 'Không có vòng for thì phải viết move() sáu dòng.']
  });
  // HD2 việc 4 (29/10): màn ĐẦU của gói 4 / 6 thành màn TRÌNH DIỄN (chiChay) cho cái mới của gói, màn kế tiếp ép dùng nó:
  // gói 4 nut-de.1: cơ chế NÚT ĐÈ / THÙNG GIỮ CỬA (bấm Chạy thấy carry() đặt thùng lên M, cửa C mở); nut-de.2 phải tự đặt thùng lên nút (cửa đóng là cách duy nhất).
  // gói 6 tay-xoay.1: lệnh arm_left / arm_right (bấm Chạy thấy tay xoay sang hông nhặt vật rồi xoay về trước đặt); tay-xoay.2 mã mẫu sai bên, phải sửa arm_left → arm_right.
  // gói 7 cam-bien-ben.1 (đưa lên đầu chương, xem MUA_1): lệnh left_clear (bấm Chạy thấy xe tới tường, hỏi bên trái trống thì rẽ trái); che-cam-bien.4 kế tiếp chế to_gap() với right_clear.
  // Gói 5 (bánh lùi): HD3 thêm màn trình diễn banh-lui.5 (man-banh-lui-them.js) đứng trước che-xe.4 (chế back()). Gói 8: hai-robot.1 (HD3, xem dưới).
  sua('cam-bien-ben.1', {
    ten: 'Lối bên trái', chiChay: true, chinhCoDinh: true,
    deBai: 'Cảm biến bên hỏi ô cạnh xe theo hướng xe đang quay: left_clear() là True khi ô bên trái trống. Xe đi tới tường; nếu bên trái trống thì rẽ trái và đi tiếp tới cờ. Bấm Chạy xem xe rẽ đúng lối.',
    veMaMau: 'Chương trình đã viết sẵn và khoá. Bấm Chạy: go_wall() tới tường, if left_clear() hỏi bên trái, trống thì turn_left() rồi go_wall() tới cờ.',
    maMau: bai(['go_wall()', 'if left_clear():', '    turn_left()', '    go_wall()']),
    loiGiai: bai(['go_wall()', 'if left_clear():', '    turn_left()', '    go_wall()']),
    goiY: ['left_clear() và right_clear() hỏi hai ô bên hông, không tốn nhịp.', 'Màn sau em chế to_gap(): đi tới khi bên phải trống.']
  });
  sua('nut-de.1', {
    ten: 'Thùng giữ cửa', chiChay: true, chinhCoDinh: true,
    deBai: 'Cửa C đang đóng. Nút đè M nằm bên trái thùng gỗ: có thùng nằm trên M thì cửa C mở. Chương trình gọi carry() để đặt thùng lên M rồi đi qua cửa tới cờ. Bấm Chạy xem cửa mở thế nào.',
    veMaMau: 'Chương trình đã viết sẵn và khoá. Bấm Chạy: carry() nhặt thùng, tiến một ô, đặt thùng sang trái lên nút M; thùng đè nút thì cửa C mở.',
    maMau: bai(['carry()', 'move()', 'move()', 'move()']),
    loiGiai: bai(['carry()', 'move()', 'move()', 'move()']),
    goiY: ['Nút M chỉ mở cửa khi có thùng nằm đè lên.', 'Màn sau em tự nhặt thùng và đặt lên nút.']
  });
  sua('tay-xoay.1', {
    ten: 'Xoay sang trái', chiChay: true, chinhCoDinh: true,
    deBai: 'Một vật nằm ngay bên trái xe, ô đích nằm ngay trước mặt xe. Tay xoay nhặt được vật ở bên hông mà xe không cần quay: arm_left() xoay tay sang trái, arm_right() xoay sang phải. Bấm Chạy xem tay đưa vật tới ô đích.',
    veMaMau: 'Chương trình đã viết sẵn và khoá. Bấm Chạy: tay xoay sang trái, hạ xuống kẹp vật, nâng lên, xoay về trước rồi hạ xuống thả vào ô đích.',
    maMau: bai(['arm_left()', 'arm_down()', 'grab()', 'wait()', 'arm_up()', 'arm_right()', 'wait()', 'arm_down()', 'release()', 'wait()']),
    loiGiai: bai(['arm_left()', 'arm_down()', 'grab()', 'wait()', 'arm_up()', 'arm_right()', 'wait()', 'arm_down()', 'release()', 'wait()']),
    goiY: ['Xoay tay chỉ được khi tay đang nâng (arm_up).', 'Màn sau vật nằm bên phải: em tự đổi lệnh xoay.']
  });
  // HD3 (29/10, phương án 3b-A của HD2): hai-robot.1 là màn TRÌNH DIỄN hai robot (chiChay): R1 và R2 đều có go_wall() khoá, bấm Chạy thấy hai robot chạy
  // cùng lúc (cham.js chamDoi dùng maMau.doi[i] khi chiChay). Việc "chạm thẻ R2 rồi viết cho R2" dời sang hai-robot.2: R1 viết sẵn lời giải, R2 trống.
  sua('hai-robot.1', {
    ten: 'Hai lá cờ', chiChay: true, chinhCoDinh: true,
    deBai: 'Hai robot, mỗi robot một chương trình riêng. R1 và R2 đều đã có go_wall(). Bấm Chạy xem hai robot chạy cùng lúc, mỗi robot tới cờ của nó.',
    veMaMau: 'Chương trình của cả hai robot đã viết sẵn và khoá. Chạm R1 / R2 ở đầu khung chương trình để xem chương trình từng robot.',
    maMau: { doi: [{ chinh: ['go_wall()'] }, { chinh: ['go_wall()'] }], hamCuaMan: [] },
    loiGiai: { doi: [{ chinh: ['go_wall()'] }, { chinh: ['go_wall()'] }], hamCuaMan: [], hamCuaEmMoi: [] },
    goiY: ['Hai robot cùng chạy một nhịp chung: mỗi nhịp cả hai cùng làm một bước.', 'Màn sau em chạm thẻ R2 để tự viết chương trình cho R2.']
  });
  (function (m) {
    m.maMau = { doi: [{ chinh: m.loiGiai.doi[0].chinh.slice() }, { chinh: [] }], hamCuaMan: [] };
    m.deBai = 'Mỗi làn có một vật trước mặt robot và một ô đích sau lưng. R1 đã có chương trình: nhặt vật, quay đầu, đặt xuống. Chạm thẻ R2 rồi viết chương trình cho R2 để hai robot cùng làm.';
    m.veMaMau = 'Chạm R1 / R2 ở đầu khung chương trình để đổi robot.';
    m.phienBanNoiDung = 2;
  })(get('hai-robot.2'));
  // Gói 5: 8 màn mới (man-banh-lui-them.js, mã banh-lui.1–4 và che-banh-lui.1–4). Hai chương chỉ có ở lộ trình nên chèn tạm vào cuối thuTu
  // cho ManHoc.them nhận (như nut-de); thuTu mùa 1 được dựng lại theo MUA_1 bên dưới. `nguon` giữ bản gốc như mọi màn khác.
  TT.thuTu.push('banh-lui', 'che-banh-lui');
  M.them(M.manBanhLuiThem || []);
  (M.manBanhLuiThem || []).forEach(function (m) { nguon[m.ma] = copy(m); });
  // Gói 8: chương 2 "Đội phối hợp" (man-doi-mua-1.js, mã che-hai-robot.1–10; R1 tay kẹp, R2 tay xoay, cảm biến bên, nút đè, bánh lùi).
  // Chương chỉ có ở lộ trình nên chèn tạm vào cuối thuTu cho ManHoc.them nhận (như nut-de); thuTu mùa 1 dựng lại theo MUA_1 bên dưới.
  TT.thuTu.push('che-hai-robot');
  TT.ten['che-hai-robot'] = 'Đội phối hợp';
  M.them(M.manDoiMua1 || []);
  (M.manDoiMua1 || []).forEach(function (m) { nguon[m.ma] = copy(m); });
  // Gói 9 "Combo" (man-combo-mua-1.js, mã combo.1–10 và che-combo.1–9; tay xoay + cảm biến bên). Hai chương chỉ có ở lộ trình nên chèn tạm vào cuối
  // thuTu cho ManHoc.them nhận (như nut-de); thuTu mùa 1 dựng lại theo MUA_1 bên dưới. Mã gói `combo` khớp phim gói (game/phim-mua-1.js).
  TT.thuTu.push('combo', 'che-combo');
  TT.ten['combo'] = 'Nhìn bên, nhặt bên';
  TT.ten['che-combo'] = 'Combo mở rộng';
  M.them(M.manComboMua1 || []);
  (M.manComboMua1 || []).forEach(function (m) { nguon[m.ma] = copy(m); });
  var COMBO_1 = (M.manComboMua1 || []).filter(function (m) { return m.chuong === 'combo'; }).map(function (m) { return m.ma; });
  var COMBO_2 = (M.manComboMua1 || []).filter(function (m) { return m.chuong === 'che-combo'; }).map(function (m) { return m.ma; });
  // che-cam-bien.10 "Kho hàng" (cất tạm từ 26/10) về đứng thứ 8 chương che-combo: sửa thành một sân, không biến (xem dưới, sau khi dựng chương).
  if (COMBO_2.length === 9) COMBO_2.splice(7, 0, 'che-cam-bien.10');
  // Gói 10 "R1 xuất xưởng" (man-trum-mua-1.js): robot-hoan-thien.11 "Giao ca ở kho" (mã mới, chương robot-hoan-thien có sẵn) thay robot-hoan-thien.10 (cất:
  // hai hàm của màn bounce / fetch_back có biến đếm) làm trùm chương 1 Tổng hợp; chương 2 `trum-mua-1` "Trùm mùa" (trum-mua-1.1–10, trùm cuối mùa .10 huy hiệu
  // xuat-xuong) chỉ có ở lộ trình nên chèn tạm vào cuối thuTu cho ManHoc.them nhận (như nut-de); thuTu mùa 1 dựng lại theo MUA_1 bên dưới.
  TT.thuTu.push('trum-mua-1');
  TT.ten['trum-mua-1'] = 'Trùm mùa';
  M.them(M.manTrumMua1 || []);
  (M.manTrumMua1 || []).forEach(function (m) { nguon[m.ma] = copy(m); });
  var TRUM_1 = day('robot-hoan-thien', [1, 2, 3, 4, 5, 6, 7, 8]).concat(['cam-bien-ben.10'],
    (M.manTrumMua1 || []).filter(function (m) { return m.chuong === 'robot-hoan-thien'; }).map(function (m) { return m.ma; }));
  var TRUM_2 = (M.manTrumMua1 || []).filter(function (m) { return m.chuong === 'trum-mua-1'; }).map(function (m) { return m.ma; });
  var MUA_1 = [
    { ma: 'xe', ten: 'Xe hai bánh', sao: 0, hinh: 'hai-banh',
      chuong: [['hai-banh', day('hai-banh', MUOI)], ['xuong-ham', day('xuong-ham', MUOI)]] },
    { ma: 'tay-gap', ten: 'Tay gắp', loai: 'bo-phan', sao: 30,
      chuong: [['tay-gap', day('tay-gap', MUOI)], ['vong-lap', day('vong-lap', [1, 2, 3, 4, 5, 6, 8, 9]).concat(['che-lap.5', 'vong-lap.10'])]] },
    { ma: 'cam-bien', ten: 'Cảm biến khoảng cách', loai: 'bo-phan', sao: 60,
      chuong: [['khoang-cach', day('khoang-cach', [1, 12, 2, 13, 3, 11, 8, 5, 6, 10])], ['che-cam-bien', day('che-cam-bien', [1, 2, 7, 11, 12, 13, 3, 14, 15, 16])]] },
    { ma: 'kho-hang', ten: 'Kho hàng', sao: 90, hinh: 'che-tay',
      chuong: [['nut-de', day('nut-de', MUOI)], ['kho-hang', day('che-xe', [1, 2, 3]).concat(day('che-tay', [1, 2, 3, 4, 6, 8, 10]))]] },
    { ma: 'banh-lui', ten: 'Bánh lùi', loai: 'bo-phan', sao: 120, hinh: 'che-xe',
      // HD3 (29/10): banh-lui.5 (trình diễn lệnh lùi, chiChay) đứng đầu chương, trước che-xe.4 chế back(); che-xe.8 (sửa nhịp hai bánh, ý của gói 1) cất;
      // che-xe.9 (sân 21 ô) lên trước banh-lui.3 (10 ô) để cỡ sân không nhảy vọt (thứ tự màn cũ giữ nguyên: che-xe.7 rồi che-xe.9).
      chuong: [['banh-lui', ['banh-lui.5'].concat(day('che-xe', [4, 5, 6]), ['banh-lui.1', 'banh-lui.2', 'che-xe.7', 'che-xe.9', 'banh-lui.3', 'banh-lui.4'])],
        ['che-banh-lui', ['che-tay.5', 'che-tay.7', 'che-banh-lui.1', 'che-tay.9', 'che-lap.7', 'che-lap.9', 'che-banh-lui.2', 'che-banh-lui.3', 'che-banh-lui.4', 'che-xe.10']]] },
    { ma: 'tay-xoay', ten: 'Tay xoay', loai: 'bo-phan', sao: 150,
      chuong: [['tay-xoay', day('tay-xoay', MUOI)], ['che-tay-xoay', day('che-tay-xoay', MUOI)]] },
    { ma: 'me-cung', ten: 'Cảm biến bên', loai: 'bo-phan', sao: 180, hinh: 'cam-bien-ben',
      // HD2 việc 4 (gói 7): cam-bien-ben.1 (trình diễn left_clear, chiChay) lên đầu chương, rồi che-cam-bien.4 chế to_gap() với right_clear (ép, ba sân).
      chuong: [['cam-bien-ben', ['cam-bien-ben.1', 'che-cam-bien.4'].concat(day('cam-bien-ben', [2, 3, 4, 5, 6, 7, 8, 9]))], ['me-cung', day('me-cung', MUOI)]] },
    { ma: 'hai-robot', ten: 'Đội hai robot', loai: 'thu-thach', sao: 210,
      chuong: [['hai-robot', day('hai-robot', MUOI)], ['che-hai-robot', (M.manDoiMua1 || []).map(function (m) { return m.ma; })]] },
    { ma: 'combo', ten: 'Combo', loai: 'thu-thach', sao: 240, hinh: 'combo',
      chuong: [['combo', COMBO_1], ['che-combo', COMBO_2]] },
    { ma: 'robot', ten: 'R1 xuất xưởng', loai: 'thu-thach', sao: 270, hinh: 'robot-hoan-thien',
      chuong: [['robot-hoan-thien', TRUM_1], ['trum-mua-1', TRUM_2]] }
  ];
  // Bốn màn dùng biến đếm sang đầu mùa 2 (chương tạm, mùa 2 dựng lại sau): count_return sửa trước, rồi bounce, fetch_back.
  var BIEN = { ma: 'bien', ten: 'Biến', loai: 'khai-niem', mua: 'mua-2', sao: 0, hinh: 'che-cam-bien',
    chuong: [['bien', ['che-cam-bien.6', 'che-cam-bien.5', 'che-cam-bien.9', 'robot-hoan-thien.9']]] };
  // Cất khỏi lộ trình xuất bản (ngân hàng man-*.js giữ nguyên, `nguon` còn bản gốc): trùng ý, dư so với khuôn, hay dùng cảm biến bên quá sớm.
  // che-cam-bien.10 (cất tạm 26/10) đã về gói 9 Combo, chương che-combo. robot-hoan-thien.10 (bounce / fetch_back có biến) cất, robot-hoan-thien.11 thay chỗ.
  var CAT = ['vong-lap.7', 'che-lap.1', 'che-lap.2', 'che-lap.3', 'che-lap.4', 'che-lap.6', 'che-lap.8', 'che-lap.10',
    'khoang-cach.7', 'che-cam-bien.8', 'robot-hoan-thien.10',
    // HD1 (29/10): kc.4 trùng ý kc.3, kc.9 là bản một sân của trùm kc.10; nhường chỗ cho hai màn ép khoang-cach.12 / .13
    'khoang-cach.4', 'khoang-cach.9',
    // HD3 (29/10): che-xe.8 "Hai bánh cùng nhịp" (sửa lệnh bánh ở hai nhịp: ý của gói 1, không dùng lệnh lùi) nhường chỗ cho màn trình diễn banh-lui.5
    'che-xe.8'];
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
  // Gói 10 chương 1 Tổng hợp: robot-hoan-thien.10 (bounce / fetch_back có biến đếm) đã cất, robot-hoan-thien.11 (man-trum-mua-1.js, không biến) là trùm.
  // cam-bien-ben.10 (trùm cũ của Cảm biến hai bên) đứng thứ 9 Tổng hợp, không còn là trùm: huy hiệu cam-bien-ben về trùm mới của chương đó, cam-bien-ben.9.
  get('cam-bien-ben.9').huyHieu = copy(get('cam-bien-ben.10').huyHieu);
  delete get('cam-bien-ben.10').huyHieu;
  // Kiểu bài (máy kiểm gói 9 + 10, kiem-trum-mua-1.mjs: không hai màn liền nhau cùng kiểu) cho các màn có sẵn của chương Tổng hợp.
  var KIEU_TONG_HOP = { 'robot-hoan-thien.1': 'giao-hang', 'robot-hoan-thien.2': 'do-nhip', 'robot-hoan-thien.3': 'do-duong', 'robot-hoan-thien.4': 'giao-hang',
    'robot-hoan-thien.5': 'do-duong', 'robot-hoan-thien.6': 'do-nhip', 'robot-hoan-thien.7': 'giao-hang', 'robot-hoan-thien.8': 'do-nhip', 'cam-bien-ben.10': 'do-duong' };
  Object.keys(KIEU_TONG_HOP).forEach(function (ma) { get(ma).kieuBai = KIEU_TONG_HOP[ma]; });
  // Gói 9 Combo, chương che-combo màn 8: che-cam-bien.10 "Kho hàng" cần fetch_back() của che-cam-bien.9 (biến đếm, đã sang mùa 2). Không đưa bản có biến thành hàm
  // của màn khóa như robot-hoan-thien.10 (người chơi vẫn thấy biến): viết lại fetch_back() KHÔNG BIẾN thành hàm của màn người chơi viết tiếp — đi tới hàng, nhặt,
  // LÙI tới khi bên phải trống (đúng chỗ rẽ: trong nhánh hai bên là tường), đặt. Cảm biến bên thay biến đếm.
  // Không còn là trùm nên bỏ huy hiệu (huy hiệu che-cam-bien là của trùm che-cam-bien.16). Chương trình chính gọi 2 hàm của em (to_gap, turn_right): giới hạn 2.
  // HD2 (29/10, phương án 3b-B của HD1): HAI KHO dài ngắn khác nhau để thân fetch_back() đếm cứng không thắng cả hai. Kho 1 = sân giữa của ngân hàng (nhánh 2 ô);
  // kho 2 mới: nhánh 1 ô và hốc trái nằm ĐỐI DIỆN cửa, nên lùi quá một ô là xe lọt vào hốc rồi đặt hàng lệch (húc tường chỉ mất nhịp, không tự chặn đếm thừa).
  // Số nhịp tính theo sân dài nhất (mặc định) nên nhịp của màn không đổi (phanh đường cong kiem-combo-mua-1).
  (function () {
    var m = get('che-cam-bien.10');
    motSan(m, 1);
    m.san = [m.san, ['##.####', '##.####', '#...o##', '##.####', '##.####', '##.####', '##.####']];
    m.bongMo = [m.bongMo, { x: 2, y: 2, huong: 1, vat: [{ x: 3, y: 2 }] }];
    var FB = ['go_wall()', 'pick()', 'while not right_clear():', '    back()', 'drop()'];
    var CHINH = ['to_gap()', 'turn_right()', 'fetch_back()'];
    function lam(chinh, than) { return bai(chinh, [ham('fetch_back', than)]); }
    Object.assign(m, {
      kieuBai: 'do-duong', gioiHanHam: 2,
      deBai: 'Hai kho, nhánh dài ngắn khác nhau. Hàng nằm cuối một nhánh bên phải của kho. Đi lên hành lang tới cửa bên phải (hốc bên trái chỉ là mồi), vào nhánh, lấy hàng rồi đặt nó ngay trong cửa nhánh, giống bóng mờ. ' +
        'fetch_back() là hàm của màn: đi tới hàng và nhặt đã có; viết tiếp phần lùi về chỗ rẽ (bên phải trống) rồi đặt. Chương trình chỉ được gọi 2 hàm của em.',
      veMaMau: 'Viết chương trình chính (tới cửa, rẽ, gọi fetch_back()), rồi viết tiếp thân fetch_back() trong Xưởng hàm.',
      maMau: lam([], ['go_wall()', 'pick()']),
      loiGiai: lam(CHINH, FB),
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: lam(['# lên cửa, vào nhánh, lấy hàng'].concat(CHINH), FB) },
      loiSai: [
        { moTa: 'Quên rẽ phải vào nhánh: fetch_back() chạy dọc hành lang', baiLam: lam(['to_gap()', 'fetch_back()'], FB), phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Dùng thêm go_wall() trong chương trình chính: vượt quá 2 hàm của em', baiLam: lam(['to_gap()', 'turn_right()', 'go_wall()', 'fetch_back()'], FB), phaiCoMa: ['qua-gioi-han-ham'] },
        { moTa: 'Lùi khi bên phải trống (thiếu chữ not): xe không lùi, đặt thùng về chỗ cũ', baiLam: lam(CHINH, ['go_wall()', 'pick()', 'while right_clear():', '    back()', 'drop()']), phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đếm cứng hai bước lùi: đúng kho 1, ở kho 2 xe lùi lọt vào hốc trái rồi đặt hàng lệch', baiLam: lam(CHINH, ['go_wall()', 'pick()', 'for i in range(2):', '    back()', 'drop()']), phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đếm cứng một bước lùi: đúng kho 2, ở kho 1 chưa về tới cửa', baiLam: lam(CHINH, ['go_wall()', 'pick()', 'back()', 'drop()']), phaiCoMa: ['lech-bong-mo'] }
      ],
      hamCuaEmCan: ['turn_right', 'to_gap', 'go_wall', 'pick', 'back', 'drop', 'move'],
      goiY: ['Trong nhánh, bên phải xe là tường; về tới chỗ rẽ thì bên phải là hành lang trống.', 'while not right_clear(): back() rồi drop().', 'Hai kho nhánh dài khác nhau: đếm số bước lùi thì chỉ đúng một kho.']
    });
    delete m.congThucKhac; delete m.huyHieu;
    m.phienBanNoiDung = 2;
  })();
  // HD2 (29/10, user: ở màn ép, húc tường thì THUA): cờ damLaThua (san-hoc.js cfg.damLaThua, cham.js) cho đúng các màn ÉP theo định nghĩa của máy dò
  // hoc/kiem-lach-mua-1.mjs (khái niệm cấu trúc mới ở màn ≤ 4 của chương đầu tiên dùng nó; thân hàm người chơi viết phải dùng lại được; taoHam), trừ màn
  // trình diễn chiChay (chương trình khoá). Lời giải chuẩn của mọi màn này không đâm tường ở sân nào (máy dò kiểm). Mùa 2 không gắn (phiên mùa 2 tự quyết).
  // Lời giải lách (đếm cứng thay if / while) thường húc tường ở sân ngắn: nay là THUA chứ không còn 1–2 sao. Giao diện: nhãn trên sân + câu trong đề bài (man-choi.js).
  var DAM_LA_THUA = ['xuong-ham.1', 'xuong-ham.2', 'xuong-ham.3', 'xuong-ham.4', 'xuong-ham.5', 'xuong-ham.7', 'xuong-ham.9', 'xuong-ham.10',
    'tay-gap.5', 'tay-gap.6', 'tay-gap.10', 'vong-lap.2', 'vong-lap.3', 'vong-lap.4', 'vong-lap.6', 'che-lap.5', 'vong-lap.10',
    'khoang-cach.12', 'khoang-cach.13', 'khoang-cach.5', 'che-cam-bien.1', 'che-cam-bien.2', 'che-cam-bien.7', 'che-cam-bien.13', 'che-cam-bien.15',
    'che-xe.1', 'che-xe.2', 'che-tay.1', 'che-tay.2', 'che-tay.4', 'che-tay.6', 'che-xe.4', 'che-xe.6', 'che-tay.5', 'che-lap.7', 'che-lap.9',
    'tay-xoay.6', 'tay-xoay.10', 'che-tay-xoay.1', 'che-tay-xoay.2', 'che-tay-xoay.4', 'che-tay-xoay.5', 'che-tay-xoay.6',
    'che-cam-bien.4', 'cam-bien-ben.5', 'cam-bien-ben.7', 'me-cung.6', 'me-cung.9', 'combo.3', 'combo.7', 'combo.8', 'che-combo.3', 'che-combo.7', 'che-cam-bien.10', 'che-combo.9',
    'robot-hoan-thien.11', 'trum-mua-1.3', 'trum-mua-1.6', 'trum-mua-1.9', 'trum-mua-1.10'];
  DAM_LA_THUA.forEach(function (ma) { get(ma).damLaThua = true; });
  M.manDamLaThua = DAM_LA_THUA.slice();
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

  // ---------------------------------------------------------------- MÙA 2 = 10 GÓI (27/10, KE-HOACH-MUA-2.md; cùng cách MÙA 1 ở trên)
  // Dựng SAU khi chèn các gói đội (chenGoi): gói đội neo sau chương mùa 2 (doi-xich sau che-xich, doi-sung-hoi sau luc-ban, ban-xoay sau tham-so) đã vào
  // TT.goi, rồi mới được dời ra mùa ẩn. Đổi m.chuong / so / hang và vị trí; KHÔNG đổi `ma` (khóa lưu sao). Mã gói giữ như cũ khi được (cờ goi-mo:<mã>).
  // Mỗi gói [mã, tên, loại, [[chương 1, màn có sẵn], [chương 2, màn có sẵn]]]. Chương chưa có màn nào thì CHƯA hiện (không vào thuTu, không thành "Sắp có");
  // gói không còn chương nào có màn thì cũng chưa hiện. Ngưỡng sao gói mùa 2 KHAI CỨNG (29/10, mùa 2 "Ghi nhớ" đủ 200 màn và hiện ở màn chọn gói), như mùa 1:
  // tính một lần bằng công thức của mo-goi.js (TI_LE_SAO 0,5 × tổng sao tối đa các gói trước trong mùa, làm tròn xuống bội 5) trên 10 gói × 20 màn
  // = 0, 30, …, 270; thêm / bớt màn sau này không làm đổi ngưỡng đã công bố (kiem-lo-trinh.mjs mục mùa 2 (a) kiểm khớp công thức).
  // Chương đã có ở mùa 2 cũ mà không thuộc bảng (ban-xoay, nhen, doi-ho-bang, list, doi-xich, omni, doi-omni và chương 2 của chúng) dời ra đầu mùa 3 (ẩn),
  // giữ thứ tự cũ: vẫn chơi được bằng "Mở hết", hàm chúng cần vẫn được tạo ở màn đứng trước.
  var MUA_2 = [
    { ma: 'xich', ten: 'Bánh xích', loai: 'bo-phan', hinh: 'xich', sao: 0,
      // Chương 2 "Biến cho xích": hàm cho xích (spin, sidestep, sửa fixed_turn, pick_behind: 29/10 fixed_turn lên trước pick_behind cho nhịp tăng dần) rồi biến đếm (count_return sửa trước, bounce, fetch_back), che-xich.9 cuối.
      // Màn mới (đếm nhịp quay) của man-bien-xich.js nối vào cuối chương và thành trùm (màn thứ 10).
      chuong: [['xich', day('xich', MUOI)], ['bien-xich', ['che-xich.1', 'che-xich.2', 'che-xich.8', 'che-xich.6', 'che-cam-bien.6', 'che-cam-bien.5',
        'che-cam-bien.9', 'robot-hoan-thien.9', 'che-xich.9']]] },
    { ma: 'sung-hoi', ten: 'Vòi phun', loai: 'bo-phan', hinh: 'sung-hoi', sao: 30,
      // 29/10 (đường cong): sung-hoi.9 (8 dòng) lên sau sung-hoi.6 (5 dòng); sung-hoi.8 thành mốc của tham-so.1 (nhịp 8 → 11 trong lề).
      chuong: [['sung-hoi', day('sung-hoi', [1, 2, 3, 4, 5, 6, 9, 7, 8, 10])], ['tham-so', day('tham-so', MUOI)]] },
    { ma: 'hong-ngoai', ten: 'Hồng ngoại', loai: 'bo-phan', sao: 60,
      chuong: [['hong-ngoai', []], ['che-hong-ngoai', []]] },
    { ma: 'nha-may', ten: 'Nhà máy', hinh: 'bang-chuyen', sao: 90,
      // 29/10 (đường cong): bang-chuyen 1, 2, 6, 5, 7, 8, 3, 4, 9 (bc.8 hẹp lại làm mốc cho bc.3, bc.3 làm mốc cho bc.4 rộng);
      // che-sung-hoi 1–6, 8, 7, 9: che-sung-hoi.9 (8 dòng, 8 nhịp) sau che-sung-hoi.7 (6 dòng).
      chuong: [['bang-chuyen', day('bang-chuyen', [1, 2, 6, 5, 7, 8, 3, 4, 9, 10])], ['che-sung-hoi', day('che-sung-hoi', [1, 2, 3, 4, 5, 6, 8, 7, 9, 10])]] },
    { ma: 'day-thung', ten: 'Đẩy thùng', sao: 120,
      chuong: [['day-thung', []], ['che-day-thung', []]] },
    { ma: 'luc-ban', ten: 'Lực bắn', hinh: 'luc-ban', sao: 150,
      chuong: [['luc-ban', day('luc-ban', MUOI)], ['che-luc-ban', []]] },
    { ma: 'do-nhiet', ten: 'Đo nhiệt', sao: 180,
      chuong: [['do-nhiet', []], ['che-do-nhiet', []]] },
    { ma: 'doi-mua-2', ten: 'Đội', loai: 'thu-thach', sao: 210,
      chuong: [['doi-mua-2', []], ['che-doi-mua-2', []]] },
    { ma: 'be-sung', ten: 'Bệ vòi xích', loai: 'thu-thach', sao: 240,
      chuong: [['be-sung', []], ['che-be-sung', []]] },
    { ma: 'nha-may-chay', ten: 'Xe cứu hỏa R1 xuất xưởng', loai: 'thu-thach', sao: 270,
      chuong: [['tong-hop-2', []], ['trum-mua-2', []]] }
  ];
  var TEN_MUA_2 = { 'bien-xich': 'Biến cho xích', 'hong-ngoai': 'Hồng ngoại', 'che-hong-ngoai': 'Hàm cho hồng ngoại', 'day-thung': 'Đẩy thùng',
    'che-day-thung': 'Hàm đẩy thùng', 'che-luc-ban': 'Hàm lực bắn', 'do-nhiet': 'Đo nhiệt', 'che-do-nhiet': 'Hàm đo nhiệt', 'doi-mua-2': 'Đội',
    'che-doi-mua-2': 'Đội phối hợp', 'be-sung': 'Bệ vòi xích', 'che-be-sung': 'Hàm bệ vòi', 'tong-hop-2': 'Tổng hợp', 'trum-mua-2': 'Trùm mùa' };
  // Rời mùa 2: che-xich 3, 4, 5, 7, 10 dùng bậc thang (game đã bỏ) và hàm có tham số trước gói 2. KHÔNG cất hẳn: che-xich.4 tạo climb() mà
  // che-doi-xich.1, .2 và che-doi-omni.5 (mùa ẩn) cần; năm màn thành chương `che-xich` (5 màn) đứng trước gói Đội xích và nhện ở mùa 3 (ẩn).
  // Gói 5 Đẩy thùng có thể lấy lại màn nào cứu được (bỏ bậc thang) về chương của mình.
  var XICH_CU = ['che-xich.3', 'che-xich.4', 'che-xich.5', 'che-xich.7', 'che-xich.10'];
  // Gói 2 chương 1 Súng hơi đứng TRƯỚC chương 2 Hàm có tham số (tham-so.3 tạo forward(n)): ba màn gọi forward(n) đổi sang move() lặp bằng for
  // (không gọi hàm có tham số). Lời giải đổi thì nội dung bản 2, đo lại sao (tools/do-lo-trinh.mjs --ghi-sao).
  (function () {
    var BAN = ['shoot()', 'wait()'], BAN_SAU = ['shoot_back()', 'wait()'];
    var di = function (n) { return lap(n, ['move()']); };
    sua('sung-hoi.3', {
      hamCuaEmCan: ['move'], maMau: bai(BAN_SAU.slice()), loiGiai: bai(BAN_SAU.concat(di(3))),
      loiSai: [
        { moTa: 'Không bắn van: cửa vẫn đóng nên xe đâm vào cửa', baiLam: bai(di(3)), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Bắn ra trước bằng shoot(): tia nước bay về phía cửa chứ không tới van, cửa vẫn đóng', baiLam: bai(BAN.concat(di(3))), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Đi thiếu một ô: xe dừng ngay trước cờ', baiLam: bai(BAN_SAU.concat(di(2))), phaiCoMa: ['chua-toi-co'] }
      ]
    }).loiGiaiKhac = { moTa: 'Gọi move() ba lần viết thẳng', baiLam: bai(BAN_SAU.concat(['move()', 'move()', 'move()'])) };
    // sung-hoi.4: lời giải chỉ bắn; mã mẫu (tiến hai ô cho thấy húc thùng vô ích) đổi forward(2) thành hai move(). Lời giải không đổi: không đo lại.
    var m4 = get('sung-hoi.4');
    m4.maMau = bai(['move()', 'move()']);
    m4.hamCuaEmCan = ['u_turn', 'move'];
    sua('sung-hoi.8', {
      hamCuaEmCan: ['move'], maMau: bai(di(10)), loiGiai: bai(BAN.concat(di(7))),
      loiSai: [
        { moTa: 'Không tắt băng: xe vẫn tới cờ nhưng chậm hơn nhiều', baiLam: bai(di(10)), phaiCoMa: [] },
        { moTa: 'Quên wait() sau shoot(): bước đầu của xe bị bỏ', baiLam: bai(['shoot()'].concat(di(7))), phaiCoMa: ['ban-dung-yen'] },
        { moTa: 'Dùng shoot_back(): tia nước bay ra sau tới tường, không tới van, băng vẫn chạy', baiLam: bai(BAN_SAU.concat(di(10))), phaiCoMa: [] }
      ]
    }).loiGiaiKhac = { moTa: 'Đi bằng move() bảy lần viết thẳng', baiLam: bai(BAN.concat(['move()', 'move()', 'move()', 'move()', 'move()', 'move()', 'move()'])) };
  })();
  // Game bỏ bậc thang, hố / gầm là của mùa 3 (KE-HOACH-MUA-2.md mục 1). Sửa thẳng sân (không qua sua()) để giữ lỗi mẫu; lời giải, số nhịp, số ô không đổi
  // (xích leo S như đi trên sàn; hố / gầm chỉ chắn lối tắt nên thay bằng chướng ngại chung) nên không đo lại sao.
  (function () {
    function sanThay(ma, tu, den) { var m = get(ma); m.san = m.san.map(function (d) { return d.split(tu).join(den); }); return m; }
    // xich.5, .7, .10: ô S thành sàn, hành lang giữ nguyên hình nên đường đi và lời giải không đổi.
    Object.assign(sanThay('xich.5', 'S', '.'), {
      ten: 'Trái rồi phải',
      deBai: 'Hành lang quẹo trái rồi quẹo phải. Đưa xe xích tới cờ, dùng tr_left() ở khúc quẹo trái và tr_right() ở khúc quẹo phải.',
      goiY: ['Mỗi khúc quẹo của xe xích là một lần gọi hàm quay; đoạn thẳng thì lặp move().',
        'Chỗ nào quẹo trái gọi tr_left(), quẹo phải gọi tr_right(); hàm turn_left() cũ không dùng cho xe xích.']
    });
    Object.assign(sanThay('xich.7', 'S', '.'), {
      deBai: 'Xe xích gắn tay kẹp, dùng pick() và drop() như xe hai bánh: nhặt và thả ở ô ngay trước mũi xe, còn vật nằm đất chiếm ô nên xe phải dừng sát vật. Nhặt vật, mang qua khúc quẹo, dừng sát ô đích (khung vàng) rồi thả.',
      goiY: ['pick() và drop() tự hạ tay, kẹp hoặc thả rồi nâng tay lên lại, nên xe quay và đi được ngay sau đó.',
        'Dừng sát vật mới nhặt được, và dừng sát ô đích (mũi xe hướng về nó) mới thả đúng chỗ.']
    });
    // xich.10 giữ băng chuyền: băng không đẩy được xích là đặc tính của part (như xich.6), trùm nhắc lại.
    Object.assign(sanThay('xich.10', 'S', '.'), {
      ten: 'Đường bậc thềm',
      deBai: 'Mang vật qua con đường gấp khúc như bậc thềm, có băng chuyền, tới ô đích: nhặt và thả đều ở ô ngay trước mũi xe, nên xe dừng sát vật và dừng sát ô đích. Dùng vòng lặp cùng các hàm quay của xe xích cho gọn.',
      veMaMau: 'Chương trình có sẵn đưa xe tới sát vật rồi nhặt nó. Viết tiếp phần đi lên sát ô đích và thả vật.',
      goiY: ['Mỗi bậc là: quẹo trái, đi một ô, quẹo phải, đi một ô. Đặt bốn dòng đó vào một vòng for.',
        'Băng chuyền không đẩy được xe xích; nhớ pick() trước khi đi và drop() khi tới ô đích.']
    });
    // xich.6 đứng trước gói 4 (Nhà máy, nơi học băng chuyền): đề bài tự giới thiệu băng chuyền thay vì nhắc chương đã học.
    get('xich.6').deBai = 'Ô mũi tên là băng chuyền: nó đẩy xe hai bánh trôi theo chiều mũi tên (gói Nhà máy sẽ gặp lại). Xe xích bám chắc nên băng chuyền, xuôi hay ngược chiều, đều không đẩy được nó. Đi qua các băng chuyền tới cờ như đi trên sàn.';
    // tham-so.3: hố u (mùa 3) thành hàng rào = (chướng ngại chung); tham-so.7: gầm n (mùa 3) thành tường. Hai ô đó chỉ chắn lối tắt.
    sanThay('tham-so.3', 'u', '=');
    sanThay('tham-so.7', 'n', '#');
  })();
  // MÙA 2 XONG (29/10): làm mượt đường cong ở các chương DÙNG LẠI (luật đo KE-HOACH-MUA-1.md: màn n ≤ max(1,5 × mốc, mốc + lề), lề dòng 3 / nhịp 4 / ô 6;
  // phanh: kiem-lo-trinh.mjs mục mùa 2 (g)). Giữ `ma` và ý bài; lời giải đổi thì sua() (nội dung bản 2, đo lại sao bằng tools/do-lo-trinh.mjs --ghi-sao).
  (function () {
    var di = function (n) { return lap(n, ['move()']); };
    var QUAY_P = ['for i in range(2):', '    left_move()', '    wait()'];
    // xich.2 (sau xich.1 hai dòng): bỏ đoạn đầu, xe đứng sát tường nên quay trước rồi đi; lời giải 7 → 5 dòng, ý bài (xích quay hai nhịp) giữ.
    sua('xich.2', {
      san: ['#####', '....F', '#####'], batDau: { x: 0, y: 1, huong: 0 },
      deBai: 'Xe xích đứng ở đầu hành lang, mặt quay vào tường. Quay phải rồi đi tới cờ. Hàm turn_right() của em chỉ đúng với xe hai bánh, còn xe xích quay chậm hơn.',
      veMaMau: 'Chương trình có sẵn gọi turn_right() của em rồi đi. Chạy thử, xem xe làm gì ở chỗ quay.',
      maMau: bai(['turn_right()'].concat(di(4))), loiGiai: bai(QUAY_P.concat(di(4))),
      loiSai: [
        { moTa: 'Không sửa gì: turn_right() chỉ quay nửa vòng, xe đâm tường', baiLam: bai(['turn_right()'].concat(di(4))), phaiCoMa: ['xich-quay-do', 'dam-tuong', 'chua-toi-co'] },
        { moTa: 'Hai nhịp quay dùng hai lệnh khác nhau: không cộng lại thành 90°', baiLam: bai(['left_move()', 'wait()', 'right_back()', 'wait()'].concat(di(4))), phaiCoMa: ['xich-quay-do', 'dam-tuong', 'chua-toi-co'] },
        { moTa: 'Chen wait() giữa hai nhịp quay: phần quay dở mất', baiLam: bai(['left_move()', 'wait()', 'wait()', 'left_move()', 'wait()'].concat(di(4))), phaiCoMa: ['xich-quay-do', 'dam-tuong', 'chua-toi-co'] },
        { moTa: 'Quay nhầm sang trái: xe đâm tường', baiLam: bai(['for i in range(2):', '    right_move()', '    wait()'].concat(di(4))), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ]
    }).loiGiaiKhac = { moTa: 'Viết hai nhịp quay thẳng bốn dòng, không dùng vòng lặp', baiLam: bai(['left_move()', 'wait()', 'left_move()', 'wait()'].concat(di(4))) };
    // xich.3 (sau xich.2 năm dòng): một khúc quẹo thay hai; lời giải 11 → 8 dòng (thân tr_right ba dòng), nhịp 11 → 8 (xich.4 mười hai nhịp vẫn trong lề).
    var C3 = di(3).concat(['tr_right()'], di(3));
    sua('xich.3', {
      san: ['...F', '.###', '.###', '.###'], batDau: { x: 0, y: 3, huong: 0 },
      deBai: 'Mỗi thân robot cần bộ hàm quay riêng. Tạo hàm tr_right() quay phải 90° cho xe xích, rồi đưa xe qua khúc quẹo phải tới cờ.',
      veMaMau: 'Chương trình có sẵn đã gọi tr_right() ở chỗ quẹo, nhưng em chưa có hàm đó. Tạo hàm tr_right không có đối số.',
      maMau: bai(C3), loiGiai: { chinh: C3.slice(), hamCuaMan: [], hamCuaEmMoi: [{ ten: 'tr_right', thamSo: [], than: QUAY_P.slice() }] },
      loiSai: [
        { moTa: 'Gọi tr_right() mà chưa tạo hàm', baiLam: bai(C3), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'tr_right() chỉ có một nhịp quay (như turn_right() cũ): xe quay nửa vòng', baiLam: bai(C3), hamCuaEmMoi: [{ ten: 'tr_right', thamSo: [], than: ['left_move()', 'wait()'] }], phaiCoMa: ['xich-quay-do', 'dam-tuong', 'chua-toi-co'] },
        { moTa: 'tr_right() quên wait() trong vòng lặp: các lệnh left_move() dồn vào một nhịp', baiLam: bai(C3), hamCuaEmMoi: [{ ten: 'tr_right', thamSo: [], than: ['for i in range(2):', '    left_move()'] }], phaiCoMa: ['banh-goi-lai', 'chua-toi-co'] },
        { moTa: 'tr_right() dùng right_move(): xe quay sang trái', baiLam: bai(C3), hamCuaEmMoi: [{ ten: 'tr_right', thamSo: [], than: ['for i in range(2):', '    right_move()', '    wait()'] }], phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ]
    }).loiGiaiKhac = { moTa: 'Hàm tr_right() gọi turn_right() cũ hai lần liền (hai nhịp quay cùng lệnh)', baiLam: bai(C3), hamCuaEmMoi: [{ ten: 'tr_right', thamSo: [], than: ['turn_right()', 'turn_right()'] }] };
    // xich.9 (sau xich.8 mười một ô): bỏ hai hàng giữa của đường dài, sân 20 → 16 ô; đường bậc thang y nguyên (19 nhịp), đường dài 17 → 13 nhịp nên vẫn nhanh hơn.
    var BAC = ['tr_right()', 'move()', 'move()', 'for i in range(2):', '    tr_left()', '    move()', '    tr_right()', '    move()', 'tr_left()', 'move()'];
    sua('xich.9', {
      san: ['.....#', '.###F#', '.##..#', '.#..##', '...###'], batDau: { x: 0, y: 4, huong: 0 },
      maMau: bai(BAC), loiGiai: bai(di(4).concat(['tr_right()'], di(4), ['tr_right()', 'move()'])),
      loiSai: [
        { moTa: 'Đi đường ngắn gấp khúc: tới cờ nhưng mất 19 nhịp, nhiều hơn đường dài', baiLam: bai(BAC), phaiCoMa: [] },
        { moTa: 'Đi đường dài nhưng quên ô cuối: xe dừng sát cờ', baiLam: bai(di(4).concat(['tr_right()'], di(4), ['tr_right()'])), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đi đường dài nhưng dùng turn_right() cũ: xe quay nửa vòng rồi đâm tường', baiLam: bai(di(4).concat(['turn_right()'], di(4), ['turn_right()', 'move()'])), phaiCoMa: ['xich-quay-do', 'dam-tuong', 'chua-toi-co'] }
      ]
    }).loiGiaiKhac = { moTa: 'Đoạn đầu chia làm hai vòng lặp', baiLam: bai(di(2).concat(di(2), ['tr_right()'], di(4), ['tr_right()', 'move()'])) };
    // che-xich.1, .2, .6 (chương bien-xich): sân 5 × 5 trống của màn chế lệnh một dòng thu bằng tường còn 3 × 3 quanh chỗ xe (25 → 9 ô). Xe quay / né tại chỗ nên
    // lời giải, nhịp, bóng mờ không đổi (không đo lại sao).
    get('che-xich.1').san = ['#####', '#...#', '#...#', '#...#', '#####'];
    get('che-xich.2').san = ['#####', '#####', '#...#', '#...#', '#...#'];
    get('che-xich.6').san = ['#####', '#...#', '#...#', '#.o.#', '#####'];
    // che-xich.2: lời giải khác cũ gọi forward(1), hàm có tham số chỉ có từ gói 2 (tham-so), nên ở gói 1 bị ham-chua-co (0 sao). Thay bằng thêm chú thích (2 sao).
    get('che-xich.2').loiGiaiKhac = { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: bai(['sidestep()']), hamCuaEmMoi: [{ ten: 'sidestep', thamSo: [], than: ['# né sang phải một ô', 'tr_right()', 'move()', 'tr_left()'] }] };
    // sung-hoi.6 (sau sung-hoi.5 bảy ô): sân 5 × 5 trống thu bằng tường còn hai làn thùng trượt (25 → 6 ô). Thùng trượt tới mép như cũ: lời giải, nhịp không đổi.
    get('sung-hoi.6').san = ['##D##', '##.##', '##H##', '##.HD', '#####'];
    // tham-so.5 (sau tham-so.4 mười ô): bỏ hàng cuối, đoạn đầu ngắn một ô (forward(4) → forward(3)); sân 17 → 16 ô, nhịp 20 → 19.
    var F5 = function (a, b, c, d, e, r2) { return ['forward(' + a + ')', 'turn_right()', 'forward(' + b + ')', r2 || 'turn_left()', 'forward(' + c + ')', 'turn_right()', 'forward(' + d + ')', 'turn_right()', 'forward(' + e + ')']; };
    var mv = function (n) { var k = []; for (var i = 0; i < n; i++) k.push('move()'); return k; };
    sua('tham-so.5', {
      san: ['###....', '###.##.', '....##.', '.#####.', '.#####F', '.######'], batDau: { x: 0, y: 5, huong: 0 },
      loiGiai: bai(F5(3, 3, 2, 3, 4)),
      loiSai: [
        { moTa: 'Đoạn thứ ba đi dư một ô: xe đâm mép sân một nhịp, tới cờ chậm hơn', baiLam: bai(F5(3, 3, 3, 3, 4)), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Khúc rẽ thứ hai rẽ nhầm sang phải: xe đâm tường', baiLam: bai(F5(3, 3, 2, 3, 4, 'turn_right()')), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Đoạn cuối thiếu một ô: xe dừng ngay trước cờ', baiLam: bai(F5(3, 3, 2, 3, 3)), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Không dùng forward(), viết move() từng lần: mười chín dòng', baiLam: bai([].concat(mv(3), ['turn_right()'], mv(3), ['turn_left()'], mv(2), ['turn_right()'], mv(3), ['turn_right()'], mv(4))), phaiCoMa: ['tran-khung'] }
      ]
    }).loiGiaiKhac = { moTa: 'Mọi khúc rẽ phải gọi qua right(1)', baiLam: bai(['forward(3)', 'right(1)', 'forward(3)', 'turn_left()', 'forward(2)', 'right(1)', 'forward(3)', 'right(1)', 'forward(4)']) };
    // bang-chuyen.2 (sau bang-chuyen.1 bốn nhịp): dải băng ngược năm ô → bốn ô; nhịp 10 → 8, lời giải lặp tám lần.
    sua('bang-chuyen.2', {
      san: ['######', 'F>>>>.', '######'], batDau: { x: 5, y: 1, huong: 3 },
      loiGiai: bai(di(8)),
      loiSai: [
        { moTa: 'Đếm theo số ô: lặp năm lần, xe chưa qua hết băng', baiLam: bai(di(5)), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Lặp thiếu một lần: range(7)', baiLam: bai(di(7)), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Thêm một vòng lặp dư: vẫn tới nhưng tốn ô hơn', baiLam: bai(di(8).concat(di(2))), phaiCoMa: [] }
      ]
    }).loiGiaiKhac = { moTa: 'Vòng lặp bốn lần, mỗi lần hai move()', baiLam: bai(['for i in range(4):', '    move()', '    move()']) };
    // bang-chuyen.8 (sau bang-chuyen.7 mười lăm nhịp, mười một ô): ba hàng băng bảy ô → năm ô; nhịp 26 → 20, sân 23 → 17 ô (lặp 3, 6, 3 thay 4, 10, 4).
    var RAN = function (a, b, c, re2) { return di(a).concat(['bend_right()'], di(b), [re2 || 'bend_left()'], di(c)); };
    sua('bang-chuyen.8', {
      san: ['.>>>.', '####.', '.>>>.', '.####', '.>>>F'],
      loiGiai: bai(RAN(3, 6, 3)),
      loiSai: [
        { moTa: 'Đếm hàng giữa theo số ô: lặp bốn lần, xe dừng giữa hàng', baiLam: bai(RAN(3, 4, 3)), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Cả ba hàng đều lặp ba lần: hàng giữa đi ngược băng nên thiếu nhiều', baiLam: bai(RAN(3, 3, 3)), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Rẽ nhầm hướng ở chỗ nối thứ hai: xe đâm tường', baiLam: bai(RAN(3, 6, 3, 'bend_right()')), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Không dùng vòng lặp: hơn 10 dòng', baiLam: bai(['move()', 'move()', 'move()', 'bend_right()', 'move()', 'move()', 'move()', 'move()', 'move()', 'move()', 'bend_left()', 'move()', 'move()', 'move()']), phaiCoMa: ['tran-khung'] }
      ]
    }).loiGiaiKhac = { moTa: 'Hàng giữa viết thành ba lần hai move()', baiLam: bai(di(3).concat(['bend_right()', 'for i in range(3):', '    move()', '    move()', 'bend_left()'], di(3))) };
    // bang-chuyen.4 (sau bang-chuyen.3 hai mươi ô): ô xe không bao giờ tới (băng đẩy sang phải) thành tường; 35 → 27 ô, lời giải / nhịp không đổi.
    get('bang-chuyen.4').san = ['###F..#', '###...#', '#>>>>>#', '#>>>>>#', '#>>>>>#', '#>>>>>#', '###.###'];
    // che-sung-hoi: sân 5 × 5 trống của các màn chế lệnh thu bằng tường còn đúng làn xe giật / thùng trượt (25 → 6–9 ô). Lời giải, nhịp, bóng mờ không đổi.
    // .1, .2: phòng 3 × 3 + hai ô đầu cột giữa (lời sai "bắn hai phát" phải đi được hai ô mới lệch bóng mờ). .7 thu ở lệnh thay('che-sung-hoi.7') cuối tệp
    // (lệnh đó đặt lại sân sau khối này).
    var PHONG_GIAT = ['##.##', '#...#', '#...#', '#...#', '##.##'];
    get('che-sung-hoi.1').san = PHONG_GIAT.slice();
    get('che-sung-hoi.2').san = PHONG_GIAT.slice();
    get('che-sung-hoi.4').san = ['#####', '##.##', '...H.', '##.##', '#####'];
    get('che-sung-hoi.6').san = ['#####', '##.##', '.H.H.', '##.##', '#####'];
    get('che-sung-hoi.8').san = ['##.##', '##H##', '.....', '##.##', '#####'];
    get('che-sung-hoi.9').san = ['#####', '#...#', '#...#', '#####', '#####'];
  })();
  // TỆP NGÂN HÀNG MÀN MỚI MÙA 2 (quy ước cho các gói sau): mỗi gói có màn mới MỘT tệp hoc/man-<tệp>.js khai ManHoc.<biến> = [màn…], mỗi màn khai
  // `chuong` (mã chương trong MUA_2) và `so`; tệp đã có trong danh sách require ở đầu tệp này và thẻ <script> của game/choi.html. Màn mới của một chương
  // nối SAU các màn có sẵn của chương đó trong MUA_2, theo `so` (muốn xen giữa thì sửa đúng dòng chương đó trong MUA_2). Màn cuối của chương đủ 10 là trùm.
  //   man-bien-xich.js   manBienXich   gói 1 chương 2 bien-xich (1 màn mới, thành trùm)
  //   man-hong-ngoai.js  manHongNgoai  gói 3 hong-ngoai · che-hong-ngoai
  //   man-day-thung.js   manDayThung   gói 5 day-thung · che-day-thung
  //   man-che-luc-ban.js manCheLucBan  gói 6 chương 2 che-luc-ban
  //   man-do-nhiet.js    manDoNhiet    gói 7 do-nhiet · che-do-nhiet
  //   man-doi-mua-2.js   manDoiMua2    gói 8 doi-mua-2 · che-doi-mua-2
  //   man-be-sung.js     manBeSung     gói 9 be-sung · che-be-sung
  //   man-trum-mua-2.js  manTrumMua2   gói 10 tong-hop-2 · trum-mua-2
  var TEP_MUA_2 = ['manBienXich', 'manHongNgoai', 'manDayThung', 'manCheLucBan', 'manDoNhiet', 'manDoiMua2', 'manBeSung', 'manTrumMua2'];
  (function () {
    Object.keys(TEN_MUA_2).forEach(function (c) { TT.ten[c] = TEN_MUA_2[c]; });
    var moi = [], chuong = [];
    MUA_2.forEach(function (g) { g.chuong.forEach(function (c) { chuong.push(c[0]); }); });
    TEP_MUA_2.forEach(function (k) { moi = moi.concat(M[k] || []); });
    moi.forEach(function (m) { if (chuong.indexOf(m.chuong) < 0) throw new Error('Màn mới mùa 2 thuộc chương không có trong MUA_2: ' + m.chuong + '.' + m.so); });
    // Chương mới chưa có trong thuTu: chèn tạm vào cuối cho ManHoc.them nhận (như nut-de); thuTu được dựng lại ngay dưới.
    chuong.forEach(function (c) { if (TT.thuTu.indexOf(c) < 0) TT.thuTu.push(c); });
    M.them(moi);
    moi.forEach(function (m) { nguon[m.ma] = copy(m); });
    MUA_2.forEach(function (g) {
      g.chuong.forEach(function (c) {
        c[1] = c[1].concat(moi.filter(function (m) { return m.chuong === c[0]; }).sort(function (a, b) { return a.so - b.so; }).map(function (m) { return m.ma; }));
      });
    });
    dungChuong('che-xich', XICH_CU);
    var chuongMua2 = [], coMan = [], da = {};
    MUA_2.forEach(function (g) {
      g.chuong.forEach(function (c) {
        chuongMua2.push(c[0]);
        c[1].forEach(function (ma) { if (da[ma]) throw new Error('Màn xếp hai lần (mùa 2): ' + ma); da[ma] = true; });
        if (c[1].length) { dungChuong(c[0], c[1]); coMan.push(c[0]); }
      });
    });
    // Chương tạm bien đã trống (4 màn sang bien-xich) nên rời thuTu; gói cũ chứa chương mùa 2 (bien, Đường dài, Bánh xích, Súng hơi) thay bằng gói MUA_2.
    var bo = chuongMua2.concat(['bien']);
    var c1 = [];
    TT.goi.forEach(function (g) { if (g.mua === 'mua-1') c1 = c1.concat(g.chuong); });
    var goi1 = TT.goi.filter(function (g) { return g.mua === 'mua-1'; });
    var conLai = TT.goi.filter(function (g) { return g.mua !== 'mua-1' && !g.chuong.some(function (c) { return bo.indexOf(c) >= 0 || c === 'che-xich'; }); });
    // sao 95: ngưỡng cũ của gói Bánh xích (mùa 2 cũ) chứa che-xich, nằm giữa List (65) và Đội xích và nhện (125) nên thứ tự ngưỡng mùa 3 không lùi.
    conLai.push({ ma: 'che-xich', ten: 'Chế lệnh xích', loai: 'bo-phan', mua: 'mua-3', sao: 95, chuong: ['che-xich'] });
    conLai.forEach(function (g) { if (g.mua === 'mua-2') g.mua = 'mua-3'; });
    var sau = TT.thuTu.filter(function (c) { return c1.indexOf(c) < 0 && bo.indexOf(c) < 0; });
    TT.thuTu.splice.apply(TT.thuTu, [0, TT.thuTu.length].concat(c1, coMan, sau));
    conLai.sort(function (a, b) { return TT.thuTu.indexOf(a.chuong[0]) - TT.thuTu.indexOf(b.chuong[0]); });
    var goi2 = [];
    MUA_2.forEach(function (g) {
      var ch = g.chuong.map(function (c) { return c[0]; }).filter(function (c) { return coMan.indexOf(c) >= 0; });
      if (!ch.length) return;
      var x = { ma: g.ma, ten: g.ten, mua: 'mua-2', chuong: ch };
      if (g.loai) x.loai = g.loai;
      if (g.hinh) x.hinh = g.hinh;
      if (typeof g.sao === 'number') x.sao = g.sao;             // ngưỡng khai cứng (29/10)
      goi2.push(x);
    });
    TT.goi.splice.apply(TT.goi, [0, TT.goi.length].concat(goi1, goi2, conLai));
    // Gói đầu mùa 3 giờ là Sân cơ khí (dời từ mùa 2): cần 0 ★. Các ngưỡng khác của mùa 3 giữ, vì gói đứng trước chỉ thêm sao.
    var dau3 = TT.goi.filter(function (g) { return g.mua === 'mua-3'; })[0];
    if (dau3) dau3.sao = 0;
    M.mua2 = MUA_2;
    M.tinhLai();
  })();

  // ---------------------------------------------------------------- MÙA 3 = 10 GÓI (29/10, KE-HOACH-MUA-3.md; cùng cách MÙA 2 ở trên)
  // Dựng SAU khối mùa 2 (lúc đó mọi gói ngoài mùa 1, 2 đã nằm ở mùa 3 cũ). Đổi m.chuong / so / hang và vị trí; KHÔNG đổi `ma` (khóa lưu sao).
  // Mỗi gói { ma, ten, loai, hinh, chuong: [[chương 1, màn có sẵn], [chương 2, màn có sẵn]] }. Chương chưa có màn thì CHƯA hiện; gói không còn chương
  // nào có màn cũng chưa hiện. Ngưỡng sao gói mùa 3 KHÔNG khai cứng (mo-goi.js tính TI_LE_SAO trong mùa, gói đầu 0 ★), như P0 mùa 2; khai khi mở mùa.
  // Mùa 3 vẫn ẩn (`an: true` ở thu-tu-chuong.js), hiện khi bật Gỡ lỗi "Mở hết".
  // Xếp màn có sẵn theo part mở dần (kiem-lo-trinh.mjs mục mùa 3 (e)): gốc → nâng cấp, nên vài màn rời chương brief đề xuất:
  //   - che-nam-cham.2, .3, .4, .9 gọi grip() (nam-cham.6, gói 7: front_pole + magnet_s) → chương che-doc-cuc (gói 7), không ở logic-nam-cham (gói 2).
  //   - che-nam-cham.7 có hàm của màn đọc front_pole() → che-doc-cuc (gói 7), không ở che-dao-cuc (gói 6).
  //   - che-doi-xich: hai màn không bậc thang (.4, .5) cần pause() / hop_box() của che-doi-ho-bang (rời mùa 3) → cả chương che-doi-xich sang mùa 4.
  // Thứ tự trong chương: dễ trước khó (luật đo đường cong của mục mùa 2 (g)), màn khó nhất có sẵn đứng cuối.
  var MUA_3 = [
    { ma: 'nhen', ten: 'Nhện', loai: 'bo-phan', hinh: 'nhen',
      // 29/10 (phiên Mùa 3): khai đủ thứ tự, màn mới (man-than-nhen.js) xen giữa màn có sẵn; màn mới chưa khai ở đây thì nối cuối như cũ.
      chuong: [['nhen', ['nhen.11', 'nhen.1', 'nhen.12', 'nhen.13', 'nhen.14', 'nhen.15', 'nhen.8', 'nhen.16', 'nhen.17', 'nhen.18']], ['chuoi-nhen', ['chuoi-nhen.1', 'chuoi-nhen.2', 'chuoi-nhen.3', 'nhen.4', 'nhen.7', 'chuoi-nhen.4', 'chuoi-nhen.5', 'chuoi-nhen.6', 'chuoi-nhen.7', 'chuoi-nhen.8']]] },
    { ma: 'nam-cham', ten: 'Nam châm', loai: 'bo-phan', hinh: 'nam-cham',
      chuong: [['nam-cham', ['nam-cham.11', 'nam-cham.12', 'nam-cham.1', 'nam-cham.4', 'nam-cham.7', 'nam-cham.8', 'nam-cham.14', 'nam-cham.13', 'nam-cham.5', 'nam-cham.15']], ['logic-nam-cham', ['logic-nam-cham.1', 'che-nam-cham.1', 'logic-nam-cham.2', 'logic-nam-cham.3', 'logic-nam-cham.4', 'logic-nam-cham.5', 'che-nam-cham.8', 'logic-nam-cham.6', 'logic-nam-cham.7', 'logic-nam-cham.8']]] },
    { ma: 'cam-ung-tu', ten: 'Cảm biến từ', loai: 'bo-phan',      // user 29/10: theo tên thẻ part (gioi-thieu-part.js), trước: Cảm ứng từ
      chuong: [['cam-ung-tu', ['cam-ung-tu.1', 'cam-ung-tu.2', 'cam-ung-tu.3', 'cam-ung-tu.4', 'cam-ung-tu.6', 'cam-ung-tu.5', 'cam-ung-tu.7', 'cam-ung-tu.8', 'cam-ung-tu.9', 'cam-ung-tu.10']], ['che-cam-ung-tu', ['che-cam-ung-tu.1', 'che-cam-ung-tu.2', 'che-cam-ung-tu.3', 'che-cam-ung-tu.4', 'che-cam-ung-tu.8', 'che-cam-ung-tu.5', 'che-cam-ung-tu.6', 'che-cam-ung-tu.7', 'che-cam-ung-tu.9', 'che-cam-ung-tu.10']]] },
    { ma: 'bai-tu', ten: 'Bãi từ',
      chuong: [['bai-tu', []], ['che-bai-tu', []]] },
    { ma: 'nhay', ten: 'Nhảy', loai: 'bo-phan', hinh: 'che-nhen',
      // che-nhen (đường cong): sửa cú nhảy (.8), bò rồi nhảy (.5), sửa bò (.9) lên trước Đá lót đường (.4) và Hang động (.3); Nhện giao hàng (.6) sau Đường về (.7).
      chuong: [['nhay', ['nhay.1', 'nhen.3', 'nhen.2', 'nhay.2', 'nhen.9', 'nhay.3', 'nhay.4', 'nhen.5', 'nhen.6', 'nhen.10']], ['che-nhen', day('che-nhen', [1, 2, 8, 5, 9, 4, 3, 7, 6, 10])]] },
    { ma: 'dao-cuc', ten: 'Đảo cực', loai: 'bo-phan',
      chuong: [['dao-cuc', ['dao-cuc.1', 'dao-cuc.2', 'nam-cham.3', 'dao-cuc.3', 'dao-cuc.4', 'dao-cuc.5', 'nam-cham.2', 'dao-cuc.6', 'dao-cuc.7', 'dao-cuc.8']], ['che-dao-cuc', ['che-nam-cham.6']]] },
    { ma: 'doc-cuc', ten: 'Đọc cực', loai: 'bo-phan', hinh: 'che-nam-cham',
      chuong: [['doc-cuc', ['nam-cham.6', 'nam-cham.10']], ['che-doc-cuc', ['che-nam-cham.2', 'che-nam-cham.7', 'che-nam-cham.4', 'che-nam-cham.5', 'che-nam-cham.9', 'che-nam-cham.3', 'che-nam-cham.10']]] },
    { ma: 'doi-xich', ten: 'Đội xích và nhện', loai: 'thu-thach',
      chuong: [['doi-xich', ['doi-xich.3', 'doi-xich.9']], ['che-doi-xich', []]] },
    { ma: 'bung-nhen', ten: 'Nam châm bụng nhện', loai: 'thu-thach',
      chuong: [['bung-nhen', []], ['che-bung-nhen', []]] },
    { ma: 'tong-hop-3', ten: 'Tổng hợp', loai: 'thu-thach',
      chuong: [['tong-hop-3', []], ['trum-mua-3', []]] }
  ];
  var TEN_MUA_3 = { nhen: 'Thân nhện', 'chuoi-nhen': 'Chuỗi cho nhện', 'nam-cham': 'Nam châm', 'logic-nam-cham': 'Logic cho nam châm',
    'cam-ung-tu': 'Dò sắt', 'che-cam-ung-tu': 'Chế lệnh: dò sắt', 'bai-tu': 'Bãi từ', 'che-bai-tu': 'Hàm cho bãi từ', nhay: 'Nhảy',
    'che-nhen': 'Chế lệnh nhện', 'dao-cuc': 'Đảo cực', 'che-dao-cuc': 'Hàm đảo cực', 'doc-cuc': 'Đọc cực', 'che-doc-cuc': 'Hàm đọc cực',
    'doi-xich': 'Đội xích và nhện', 'che-doi-xich': 'Đội xích và nhện phối hợp', 'bung-nhen': 'Nam châm bụng nhện', 'che-bung-nhen': 'Hàm cho bụng nhện',
    'tong-hop-3': 'Tổng hợp', 'trum-mua-3': 'Trùm mùa' };
  // Rời mùa 3 (mùa 4, ẩn, giữ thứ tự cũ, vẫn chơi được bằng "Mở hết"): màn của chương mùa 3 dùng lại mã mà không thuộc MUA_3 thành chương riêng, đứng đúng
  // chỗ chương cũ trong thuTu (THAY_CU). nam-cham.9 (omni, mùa 5); doi-xich 8 màn bậc thang S; che-doi-xich cả 10 (bậc thang S, hay cần hàm của
  // che-doi-ho-bang). Gói cũ đổi mã khi mã cũ đã thuộc gói mùa 3 (cờ goi-mo:<mã> của gói mùa 3).
  var ROI_MUA_3 = { 'doi-xich-bac': day('doi-xich', [1, 2, 4, 5, 6, 7, 8, 10]), 'che-doi-xich-bac': day('che-doi-xich', MUOI), 'nam-cham-omni': ['nam-cham.9'] };
  var TEN_ROI_3 = { 'doi-xich-bac': 'Đội xích leo bậc', 'che-doi-xich-bac': 'Hàm đội xích leo bậc', 'nam-cham-omni': 'Nam châm trên omni' };
  var THAY_CU = { 'doi-xich': ['doi-xich-bac'], 'che-doi-xich': ['che-doi-xich-bac'], 'nam-cham': ['nam-cham-omni'] };
  var GOI_DOI_MA = { 'doi-xich': { ma: 'doi-xich-bac', ten: 'Đội xích leo bậc' }, 'nam-cham': { ma: 'nam-cham-omni', ten: 'Nam châm trên omni' } };
  // Sửa màn có sẵn (bảng P0): game bỏ bậc thang. nhen.8, che-nhen.6: ô S thành sàn; nhện bước lên S như sàn (2 nhịp mỗi bước) nên lời giải, nhịp, ô
  // không đổi: sửa thẳng sân (không qua sua()), không đo lại sao.
  (function () {
    function sanThay(ma, tu, den) { var m = get(ma); m.san = m.san.map(function (d) { return d.split(tu).join(den); }); return m; }
    Object.assign(sanThay('nhen.8', 'S', '.'), {
      deBai: 'Hàng băng chuyền chạy ngược hướng nhện muốn đi: nhện bước vào là bị đẩy lùi lại, không qua được. Tìm đường vòng phía trên để tới cờ.',
      goiY: ['Băng chuyền đẩy theo mũi tên: nhện bước ngược mũi tên thì bị đẩy lùi đúng bằng quãng vừa bước.',
        'Thử đi vào băng một lần để thấy nó chặn thế nào, rồi tìm lối khác vòng phía trên.']
    });
    sanThay('che-nhen.6', 'S', '.');
    // Gói 1 chương 1 đứng trước chuoi-nhen (nhen.4 tạo go(d)): lời giải khác cũ đi theo chuỗi bằng go() thành đi thẳng từng bước (không chuỗi, không hàm).
    get('nhen.8').loiGiaiKhac = { moTa: 'Bước lên viết thẳng ba lần, rồi lặp sang phải và xuống', baiLam: bai(['go_up()', 'go_up()', 'go_up()', 'for i in range(6):', '    go_right()', 'for i in range(3):', '    go_down()']), hamCuaEmMoi: [] };
    // Gói 2 chỉ có cực N (magnet_s mở ở gói 6) và chưa có grip() (gói 7): bỏ các lời sai mẫu dựa vào cực S / grip() (chúng chỉ còn báo "hàm chưa có").
    [['nam-cham.4', 'Bật cực S'], ['che-nam-cham.1', 'Bật cực S'], ['che-nam-cham.8', 'Dùng grip()']].forEach(function (x) {
      var m = get(x[0]);
      m.loiSai = (m.loiSai || []).filter(function (s) { return s.moTa.indexOf(x[1]) !== 0; });
    });
    // nam-cham.10 (trùm Đọc cực): bỏ cảm biến màu và color() (mùa 4). Ô vàng thành sàn; xe dừng ở chỗ bên phải có lối mở (ô đích ngay phía trên)
    // bằng right_clear() của cảm biến bên (mùa 1). Lời giải đổi: nội dung bản 2, đo lại sao (tools/do-lo-trinh.mjs --ghi-sao).
    var m10 = get('nam-cham.10');
    var VE = ['go_wall()', 'grip()', 'u_turn()', 'while not right_clear():', '    move()', 'turn_right()', 'magnet_off()', 'wait()'];
    sua('nam-cham.10', {
      deBai: 'Ba hành lang trong kho, mỗi nơi có một vật cần mang về: vật sắt, vật nam châm N hoặc vật nam châm S, kèm vật gỗ phía sau. Tiến sát vật, kéo nó về bằng grip(), ' +
        'mang tới chỗ bên phải hành lang có lối mở (ô đích ngay phía trên) rồi thả vào ô đích. Dùng cảm biến, đừng đếm ô: mỗi kho ô đích ở một chỗ khác.',
      san: m10.san.map(function (s) { return s.map(function (d) { return d.replace(/y/g, '.'); }); }),
      robot: { than: 'hai-banh', tay: 'nam-cham', camBien: [{ ma: 'khoang-cach', o: 'hong' }] },
      hamGoc: m10.hamGoc.filter(function (h) { return h !== 'color'; }).concat(['left_clear', 'right_clear']),
      maMau: bai(['go_wall()', 'magnet_n()', 'wait()', 'u_turn()', 'while not right_clear():', '    move()', 'turn_right()', 'magnet_off()', 'wait()']),
      loiGiai: bai(VE.slice()),
      loiSai: [
        { moTa: 'Viết cứng số bước theo sân đầu: các sân khác vật và ô đích nằm chỗ khác', baiLam: bai(['forward(4)', 'grip()', 'u_turn()', 'forward(2)', 'turn_right()', 'magnet_off()', 'wait()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Lúc nào cũng bật cực N: gặp vật nam châm chữ N thì cùng cực nên vật bị đẩy đi', baiLam: bai(['go_wall()', 'magnet_n()', 'wait()'].concat(VE.slice(2))), phaiCoMa: ['day-bi-chan', 'chua-dua-vat'] },
        { moTa: 'Thiếu chữ not: bên phải đang là tường nên xe không đi bước nào, thả vật ngay chỗ hút', baiLam: bai(['go_wall()', 'grip()', 'u_turn()', 'while right_clear():', '    move()', 'turn_right()', 'magnet_off()', 'wait()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên rẽ phải ở chỗ có lối mở: ô trước mũi xe không phải ô đích', baiLam: bai(['go_wall()', 'grip()', 'u_turn()', 'while not right_clear():', '    move()', 'magnet_off()', 'wait()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Hút rồi rẽ phải thả ngay, không mang về chỗ có lối mở: ô trước mũi xe không phải ô đích', baiLam: bai(['go_wall()', 'grip()', 'turn_right()', 'magnet_off()', 'wait()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Dùng go_wall() để tiến sát vật, rồi grip() chọn đúng cực: vật sắt hay vật nam châm đều kéo về được.',
        'Quay đầu rồi đi tới khi bên phải trống: while not right_clear(). Ở đó rẽ phải thì mũi xe quay đúng vào ô đích; rồi mới ngắt điện.']
    }).loiGiaiKhac = { moTa: 'Mỗi bước tiến dùng forward(1) thay cho move()', baiLam: bai(['go_wall()', 'grip()', 'u_turn()', 'while not right_clear():', '    forward(1)', 'turn_right()', 'magnet_off()', 'wait()']) };
    get('nam-cham.10').hamCuaEmCan = ['go_wall', 'u_turn', 'grip', 'move', 'turn_right'];
  })();
  // TỆP NGÂN HÀNG MÀN MỚI MÙA 3 (như mùa 2): mỗi gói MỘT tệp hoc/man-<tệp>.js khai ManHoc.<biến> = [màn…], mỗi màn khai `chuong` (mã chương trong MUA_3)
  // và `so`; tệp đã có trong danh sách require ở đầu tệp này và thẻ <script> của game/choi.html. Màn mới của một chương nối SAU các màn có sẵn của chương
  // đó theo `so`; màn cuối có sẵn là trùm (nhen.10, nam-cham.10, che-nam-cham.10) thì màn mới CHEN TRƯỚC nó. Muốn xen giữa thì sửa đúng dòng chương đó trong
  // MUA_3. Mã màn = chuong + '.' + so không được trùng mã đã có: chương nhen, nam-cham, doi-xich, che-doi-xich dùng lại mã chương cũ nên màn mới khai so từ 11.
  //   man-than-nhen.js      manThanNhen     gói 1  nhen · chuoi-nhen
  //   man-nam-cham-n.js     manNamChamN     gói 2  nam-cham · logic-nam-cham
  //   man-cam-ung-tu.js     manCamUngTu     gói 3  cam-ung-tu · che-cam-ung-tu
  //   man-bai-tu.js         manBaiTu        gói 4  bai-tu · che-bai-tu
  //   man-nhay.js           manNhay         gói 5  nhay (che-nhen đủ 10 màn có sẵn)
  //   man-dao-cuc.js        manDaoCuc       gói 6  dao-cuc · che-dao-cuc
  //   man-doc-cuc.js        manDocCuc       gói 7  doc-cuc · che-doc-cuc
  //   man-doi-xich-nhen.js  manDoiXichNhen  gói 8  doi-xich · che-doi-xich
  //   man-bung-nhen.js      manBungNhen     gói 9  bung-nhen · che-bung-nhen
  //   man-trum-mua-3.js     manTrumMua3     gói 10 tong-hop-3 · trum-mua-3
  var TEP_MUA_3 = ['manThanNhen', 'manNamChamN', 'manCamUngTu', 'manBaiTu', 'manNhay', 'manDaoCuc', 'manDocCuc', 'manDoiXichNhen', 'manBungNhen', 'manTrumMua3'];
  (function () {
    Object.keys(TEN_MUA_3).forEach(function (c) { TT.ten[c] = TEN_MUA_3[c]; });
    Object.keys(TEN_ROI_3).forEach(function (c) { TT.ten[c] = TEN_ROI_3[c]; });
    // Màn gói đội (chenGoi, nạp sau `nguon`) chưa có bản gốc: dungChuong cần hạng gốc (trùm) của chúng.
    M.danhSach.forEach(function (m) { if (!nguon[m.ma]) nguon[m.ma] = copy(m); });
    var coTruoc = TT.thuTu.filter(function (c) { return M.danhSach.some(function (m) { return m.chuong === c; }); });
    var moi = [], chuong = [];
    MUA_3.forEach(function (g) { g.chuong.forEach(function (c) { chuong.push(c[0]); }); });
    TEP_MUA_3.forEach(function (k) { moi = moi.concat(M[k] || []); });
    moi.forEach(function (m) { if (chuong.indexOf(m.chuong) < 0) throw new Error('Màn mới mùa 3 thuộc chương không có trong MUA_3: ' + m.chuong + '.' + m.so); });
    // Chương mới chưa có trong thuTu: chèn tạm vào cuối cho ManHoc.them nhận; thuTu được dựng lại ngay dưới.
    chuong.concat(Object.keys(ROI_MUA_3)).forEach(function (c) { if (TT.thuTu.indexOf(c) < 0) TT.thuTu.push(c); });
    M.them(moi);
    moi.forEach(function (m) { nguon[m.ma] = copy(m); });
    MUA_3.forEach(function (g) {
      g.chuong.forEach(function (c) {
        var them = moi.filter(function (m) { return m.chuong === c[0] && c[1].indexOf(m.ma) < 0; }).sort(function (a, b) { return a.so - b.so; }).map(function (m) { return m.ma; });   // màn mới đã khai thứ tự trong MUA_3 thì không nối thêm
        var cuoi = c[1][c[1].length - 1];
        c[1] = cuoi && (nguon[cuoi] || get(cuoi)).hang === 'trum' ? c[1].slice(0, -1).concat(them, [cuoi]) : c[1].concat(them);
      });
    });
    var chuongMua3 = [], coMan = [], da = {};
    MUA_3.forEach(function (g) {
      g.chuong.forEach(function (c) {
        chuongMua3.push(c[0]);
        c[1].forEach(function (ma) { if (da[ma]) throw new Error('Màn xếp hai lần (mùa 3): ' + ma); da[ma] = true; });
        if (c[1].length) { dungChuong(c[0], c[1]); coMan.push(c[0]); }
      });
    });
    Object.keys(ROI_MUA_3).forEach(function (c) {
      ROI_MUA_3[c].forEach(function (ma) { if (da[ma]) throw new Error('Màn vừa ở mùa 3 vừa rời mùa 3: ' + ma); });
      dungChuong(c, ROI_MUA_3[c]);
    });
    // Màn còn sót ở chương cũ (không thuộc MUA_3, không thuộc ROI_MUA_3) là lỗi dữ liệu.
    M.danhSach.forEach(function (m) {
      if (chuongMua3.indexOf(m.chuong) >= 0 && !da[m.ma]) throw new Error('Màn ' + m.ma + ' nằm ở chương mùa 3 ' + m.chuong + ' mà không có trong MUA_3 / ROI_MUA_3');
    });
    // Chương cũ đã hết màn (che-nam-cham: mười màn chia vào logic-nam-cham, che-dao-cuc, che-doc-cuc) rời thuTu và gói, như chương mùa 3 không có chương thay.
    coTruoc.forEach(function (c) { if (chuongMua3.indexOf(c) < 0 && !M.danhSach.some(function (m) { return m.chuong === c; })) chuongMua3.push(c); });
    // thuTu: mùa 1, mùa 2, chương mùa 3 có màn, rồi phần còn lại giữ thứ tự cũ (chương cũ mùa 3 thay bằng chương rời ở đúng chỗ).
    var goi12 = TT.goi.filter(function (g) { return g.mua === 'mua-1' || g.mua === 'mua-2'; });
    var c12 = [];
    goi12.forEach(function (g) { c12 = c12.concat(g.chuong); });
    var sau = [];
    TT.thuTu.forEach(function (c) {
      if (c12.indexOf(c) >= 0 || ROI_MUA_3[c]) return;
      if (chuongMua3.indexOf(c) >= 0) { (THAY_CU[c] || []).forEach(function (x) { sau.push(x); }); return; }
      sau.push(c);
    });
    TT.thuTu.splice.apply(TT.thuTu, [0, TT.thuTu.length].concat(c12, coMan, sau));
    // Gói: mùa 1, mùa 2, MUA_3, rồi các gói còn lại (mùa 3 cũ → đầu mùa 4, giữ thứ tự; mùa 4 cũ sau đó). Gói dời tính lại ngưỡng (dưới).
    var conLai = [], doi4 = [];
    TT.goi.forEach(function (g) {
      if (goi12.indexOf(g) >= 0) return;
      var ch = [];
      g.chuong.forEach(function (c) { if (chuongMua3.indexOf(c) >= 0) ch = ch.concat(THAY_CU[c] || []); else ch.push(c); });
      if (!ch.length) return;
      g.chuong = ch;
      if (g.mua === 'mua-3') {
        g.mua = 'mua-4';
        doi4.push(g);
        if (GOI_DOI_MA[g.ma]) Object.assign(g, GOI_DOI_MA[g.ma]);
      }
      conLai.push(g);
    });
    conLai.sort(function (a, b) { return TT.thuTu.indexOf(a.chuong[0]) - TT.thuTu.indexOf(b.chuong[0]); });
    // Ngưỡng gói dời sang mùa 4 (ẩn), tính một lần theo luật mo-goi.js trong mùa mới: gói thường 0,5 × tổng sao tối đa các gói thường dời đứng trước,
    // làm tròn xuống bội 5 (gói đầu 0 ★); gói đội (khongTangNguong) = gói đứng trước + 30, như chenGoi. Gói mùa 4 cũ giữ ngưỡng khai cứng.
    var tr4 = 0, truoc4 = null;
    conLai.filter(function (g) { return doi4.indexOf(g) >= 0; }).forEach(function (g) {
      g.sao = g.khongTangNguong && truoc4 ? truoc4.sao + 30 : Math.floor(0.5 * tr4 / 5) * 5;
      if (!g.khongTangNguong) tr4 += 3 * g.chuong.reduce(function (s, c) { return s + M.danhSach.filter(function (m) { return m.chuong === c; }).length; }, 0);
      truoc4 = g;
    });
    var goi3 = [];
    MUA_3.forEach(function (g) {
      var ch = g.chuong.map(function (c) { return c[0]; }).filter(function (c) { return coMan.indexOf(c) >= 0; });
      if (!ch.length) return;
      var x = { ma: g.ma, ten: g.ten, mua: 'mua-3', chuong: ch };
      if (g.loai) x.loai = g.loai;
      if (g.hinh) x.hinh = g.hinh;
      goi3.push(x);
    });
    TT.goi.splice.apply(TT.goi, [0, TT.goi.length].concat(goi12, goi3, conLai));
    // Gói đầu mùa 4 giờ là Sân cơ khí (dời từ mùa 3 cũ): cần 0 ★.
    var dau4 = TT.goi.filter(function (g) { return g.mua === 'mua-4'; })[0];
    if (dau4) dau4.sao = 0;
    // Khay theo gói (như mùa 1): part mở dần gốc → nâng cấp. Trước gói 3 chưa có front_metal, trước gói 5 chưa có crouch / stand, trước gói 6 chưa có
    // magnet_s, trước gói 7 chưa có front_pole. Chỉ bớt lệnh trên khay (hamGoc), phần cứng vẫn đủ.
    MUA_3.forEach(function (g, i) {
      var so = i + 1;
      var bo = (so < 3 ? ['front_metal'] : []).concat(so < 5 ? ['crouch', 'stand'] : [], so < 6 ? ['magnet_s'] : [], so < 7 ? ['front_pole'] : []);
      g.chuong.forEach(function (c) {
        c[1].forEach(function (ma) {
          var m = get(ma);
          if (m.hamGoc && m.hamGoc.some(function (h) { return bo.indexOf(h) >= 0; })) m.hamGoc = m.hamGoc.filter(function (h) { return bo.indexOf(h) < 0; });
          (m.doi || []).forEach(function (d) { if (d.hamGoc) d.hamGoc = d.hamGoc.filter(function (h) { return bo.indexOf(h) < 0; }); });
        });
      });
    });
    M.mua3 = MUA_3;
    M.roiMua3 = ROI_MUA_3;
    M.tinhLai();
  })();
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
  if (get('che-xe.8')) thay('che-xe.8', {     // HD3: che-xe.8 đã cất (CAT) nên không còn trong lộ trình; giữ bản viết lại cho lần đưa về
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
    // 29/10 mùa 2 xong (đường cong): sân 5 × 5 thu bằng tường còn làn thùng trượt (25 → 7 ô), như che-sung-hoi.6.
    san: ['#####', '##.##', '.H.H.', '##.##', '#####'], bongMo: { x: 2, y: 2, huong: 0, thung: [{ x: 0, y: 2 }, { x: 4, y: 2 }] },
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
  Object.keys(deLuyen).forEach(function (ma) { var mk = get(ma); if (mk) mk.deBai = deLuyen[ma]; });        // màn đã cất (HD1: khoang-cach.4, .9) không còn trong lộ trình
  if (get('khoang-cach.4')) get('khoang-cach.4').ten = 'Hành lang một góc';
  get('che-cam-bien.3').ten = 'Ghép những góc rẽ';
  get('drone.6').ten = 'Theo dõi pin';
  // Kho thật có u_turn() một nhịp (thêm một dòng so với kho cổ điển).
  // Trùm nam châm phải cho đủ sao ô với chính kho người chơi đã học.
  get('nam-cham.10').sao.o = 23;

  // ---------------------------------------------------------------- GÓI T MÙA 2 (29/10, user "show don't tell", đúng việc HD1 / HD2 đã làm cho mùa 1)
  // Mỗi chương mùa 2 giới thiệu khối / part / cơ chế mới: màn ĐẦU là màn TRÌNH DIỄN (chiChay: chương trình khoá, bấm Chạy là 3 sao, đề chỉ nói "Bấm Chạy, xem…"),
  // màn KẾ ép dùng nó (nhiều sân của ngân hàng / mã mẫu sai một chỗ / giấu lệnh cũ có thể lách) + hướng dẫn từng bước (huong-dan-man.js khối "gói T mùa 2"), rồi thả.
  // Máy dò lách mùa 2: hoc/kiem-lach-mua-2.mjs (A1 / A2 / B + C hằng thay biến, D hàm có tham số, E hằng thay cảm biến số, F đảo lực); bảng: ban-giao/bang-t-mua-2.md.
  // Khối này đặt SAU deLuyen (deLuyen ghi đề một sân cho che-cam-bien.5 / .9 mà gói T lấy lại ba sân) và TRƯỚC khi gán ngưỡng sao. Chỉ sửa màn mùa 2 qua lộ trình, giữ `ma`;
  // lời giải đổi thì đo lại sao (tools/do-lo-trinh.mjs --ghi-sao). Lộ trình chương không đổi (10 màn, không cất màn nào).
  (function () {
    var di = function (n) { return lap(n, ['move()']); };
    var QUAY_P = ['for i in range(2):', '    left_move()', '    wait()'];
    // Gói 1 chương xich: cái mới là THÂN XÍCH quay bằng một bên xích, HAI nhịp liền mới đủ 90°. xich.1 trình diễn đúng việc đó (khoá); xich.2 ép: mã mẫu quay MỘT nhịp
    // (range(1)), người chơi đổi số thành 2 (hướng dẫn từng bước); turn_right() của em rút khỏi khay (hamCuaEmCan) để không lách bằng hàm cũ. xich.3 tạo tr_right (ép def).
    sua('xich.1', {
      ten: 'Xích quay hai nhịp', chiChay: true, chinhCoDinh: true,
      deBai: 'Xe xích không có bánh: hai dải xích nhận cùng các lệnh left_move, right_move, wait như xe hai bánh. Muốn quay 90°, chỉ một bên xích quay và phải quay HAI nhịp liền. Xe đang quay mặt vào tường: bấm Chạy xem xe quay phải rồi đi tới cờ.',
      veMaMau: 'Chương trình đã viết sẵn và khoá. Bấm Chạy: left_move() rồi wait() lặp hai lần là quay phải đủ 90°, rồi move() đi ba ô.',
      san: ['####', '...F', '####'], batDau: { x: 0, y: 1, huong: 0 },
      maMau: bai(QUAY_P.concat(di(3))), loiGiai: bai(QUAY_P.concat(di(3))),
      goiY: ['turn_right() của xe hai bánh chỉ quay một nhịp: với xe xích chưa đủ 90°.', 'Màn sau em tự đổi số nhịp quay.']
    });
    (function () {
      var m = get('xich.2'), MOT = ['for i in range(1):', '    left_move()', '    wait()'].concat(di(4));
      m.deBai = 'Xe xích đứng ở đầu hành lang, mặt quay vào tường. Quay phải rồi đi tới cờ. Chương trình có sẵn chỉ cho xích quay MỘT nhịp: chạy thử xem xe quay được bao nhiêu.';
      m.veMaMau = 'Chạy thử: một nhịp left_move chỉ quay được nửa góc, xe đâm tường. Đổi số lần lặp của vòng quay cho đủ hai nhịp.';
      m.maMau = bai(MOT.slice());
      m.hamCuaEmCan = ['move'];
      m.goiY = ['Chạy từng nhịp và nhìn xe ở chỗ quẹo: một nhịp left_move quay được bao nhiêu độ?', 'Xe xích cần hai nhịp liên tiếp cùng một lệnh mới quay đủ 90°: đổi số trong range().'];
      m.loiSai[0] = { moTa: 'Không sửa gì: xích quay một nhịp chưa đủ 90°, xe đâm tường', baiLam: bai(MOT.slice()), phaiCoMa: ['xich-quay-do', 'dam-tuong', 'chua-toi-co'] };
    })();
    // Gói 1 chương bien-xich: BIẾN ĐẾM xuất hiện ở màn 5. che-cam-bien.6 thành màn TRÌNH DIỄN (count_return() đúng sẵn, hàm của màn khoá, bấm Chạy thấy xe đi tới tường rồi
    // lùi về đúng n bước); che-cam-bien.5 (bounce), .9 (fetch_back) và robot-hoan-thien.9 (biến ở main) lấy lại ba sân của ngân hàng để đếm cứng không qua (máy dò: lỗ B / C).
    var DEM = ['n = 0', 'while front_clear():', '    move()', '    n = n + 1', 'for i in range(n):', '    back()'];
    sua('che-cam-bien.6', {
      ten: 'Đếm bước để trở về', chiChay: true, chinhCoDinh: true, khoaHamMan: ['count_return'],
      deBai: 'Biến n là một ô nhớ: n = 0 đặt nó bằng 0, n = n + 1 tăng nó thêm một. count_return() đi tới tường, mỗi bước tăng n, rồi lùi đúng n bước về chỗ cũ. Bấm Chạy xem xe về đúng xe mờ.',
      veMaMau: 'Chương trình đã viết sẵn và khoá. Bấm Chạy: xe đi bốn ô thì n = 4, nên vòng for lùi bốn lần.',
      maMau: bai(['count_return()'], [ham('count_return', DEM)]), loiGiai: bai(['count_return()'], [ham('count_return', DEM)]),
      goiY: ['Không có biến n thì hàm không biết đã đi mấy ô.', 'Màn sau em tự chế bounce() với ba khối đếm.']
    });
    // Nhịp sao theo sân DÀI NHẤT (bỏ nhipTheo 'tong' của ngân hàng) để đường cong nhịp của chương không nhảy gấp ba.
    ['che-cam-bien.5', 'che-cam-bien.9', 'robot-hoan-thien.9'].forEach(function (ma) { nhieuSan(ma); delete get(ma).nhipTheo; });
    // Cờ đâm-là-thua (HD2) cho màn ÉP mùa 2 mà đếm thừa vẫn 3 sao nhờ húc tường hai đầu hành lang (máy dò: lỗ B2 ở che-cam-bien.9); gắn cả ba màn ép biến đếm cho
    // nhất quán. Lời giải chuẩn không đâm tường ở sân nào (máy dò kiểm). Danh sách riêng của mùa 2, nối vào M.manDamLaThua.
    var DAM_LA_THUA_2 = ['che-cam-bien.5', 'che-cam-bien.9', 'robot-hoan-thien.9'];
    DAM_LA_THUA_2.forEach(function (ma) { get(ma).damLaThua = true; });
    M.manDamLaThua = M.manDamLaThua.concat(DAM_LA_THUA_2);
    // Gói 2 chương sung-hoi: cái mới là SÚNG HƠI (shoot() bắn ra trước, cú giật đẩy xe lùi). sung-hoi.1 trình diễn (khoá, ba phát lùi ba ô); sung-hoi.2 ép shoot_back (H đã có).
    sua('sung-hoi.1', {
      ten: 'Bắn là lùi', chiChay: true, chinhCoDinh: true,
      deBai: 'Xe có vòi phun ở mũi. shoot() bắn một tia nước ra phía trước, và cú giật làm xe lùi một ô; sau shoot() phải có wait() thì nhịp mới trôi. Lá cờ nằm phía sau xe ba ô: bấm Chạy xem ba phát bắn đưa xe lùi tới cờ.',
      veMaMau: 'Chương trình đã viết sẵn và khoá. Bấm Chạy: mỗi vòng lặp bắn một phát rồi chờ một nhịp, xe lùi một ô.',
      maMau: bai(['for i in range(3):', '    shoot()', '    wait()']), loiGiai: bai(['for i in range(3):', '    shoot()', '    wait()']),
      goiY: ['Bắn ra trước thì xe bị giật lùi một ô.', 'Màn sau em dùng shoot_back(): bắn ra sau, xe giật tới.']
    });
    // Gói 2 chương tham-so: cái mới là HÀM CÓ THAM SỐ. tham-so.1 trình diễn (forward(n) của màn khoá, main khoá: bấm Chạy thấy forward(4) đi bốn ô, forward(3) đi ba ô);
    // tham-so.2 ép: thân forward(n) của màn đang lặp cứng range(2), người chơi đổi số 2 thành biến n (hướng dẫn từng bước); tham-so.3 tạo forward(n) (ép def + tham số).
    sua('tham-so.1', {
      ten: 'Gọi hàm có số', chiChay: true, chinhCoDinh: true, khoaHamMan: ['forward'],
      deBai: 'Hàm có tham số: forward(n) nhận một số n trong ngoặc và tiến đúng n ô. Chương trình gọi forward(4), forward(3), forward(2) cho ba đoạn đường dài khác nhau, cùng một hàm. Bấm Chạy xem xe tới cờ.',
      veMaMau: 'Chương trình đã viết sẵn và khoá. Bấm Chạy: số trong ngoặc là số ô của đoạn đường đó.',
      maMau: bai(['forward(4)', 'turn_right()', 'forward(3)', 'turn_left()', 'forward(2)'], [ham('forward', ['for i in range(n):', '    move()'], ['n'])]),
      loiGiai: bai(['forward(4)', 'turn_right()', 'forward(3)', 'turn_left()', 'forward(2)'], [ham('forward', ['for i in range(n):', '    move()'], ['n'])]),
      goiY: ['Mỗi lần gọi, n mang một số khác: 4, rồi 3, rồi 2.', 'Màn sau thân hàm forward(n) chưa dùng n: em sửa.']
    });
    (function () {
      var m = get('tham-so.2');
      m.deBai = 'Hàm forward(n) của màn phải tiến đúng n ô, nhưng thân hàm đang lặp cứng hai lần, không nhìn tới n. Sửa thân hàm để xe đi hết đường tới cờ.';
      m.veMaMau = 'Chương trình chính đã gọi forward(n) với đúng số ô của từng đoạn. Chạy thử: n bằng 3 hay 5 thì xe cũng chỉ đi hai ô. Mở thân hàm, đổi số 2 trong range thành n.';
      m.maMau = bai(['forward(3)', 'turn_right()', 'forward(5)', 'turn_right()', 'forward(2)'], [ham('forward', ['for i in range(2):', '    move()'], ['n'])]);
      m.goiY = ['Chạy thử bản có sẵn: n bằng 3 mà xe đi được mấy ô?', 'Số lần lặp phải là n: chạm số 2 trong range rồi chọn biến n.'];
    })();
    /** Màn mới của mùa 2 (ngân hàng có loiSai / loiGiaiKhac mà máy kiểm chương đòi): thành màn trình diễn bằng get() (không qua sua(), giữ lời sai / lời giải khác),
     *  mã mẫu = lời giải (không đổi nên không đo lại sao). */
    function trinhDien(ma, ten, deBai, veMaMau, goiY) {
      var m = get(ma);
      m.chiChay = true; m.chinhCoDinh = true; m.maMau = copy(m.loiGiai);
      delete m.maMau.hamCuaEmMoi;
      if (ten) m.ten = ten;
      m.deBai = deBai; m.veMaMau = veMaMau; m.goiY = goiY;
      return m;
    }
    // Gói 3 chương hong-ngoai: cái mới là MẮT HỒNG NGOẠI distance() (số ô trống phía trước). hong-ngoai.1 trình diễn (đọc d = distance() rồi đi đúng d ô, ba đoạn dài ngắn khác nhau);
    // hong-ngoai.2 ép range(distance()) (mã mẫu lặp cứng 3; bộ dò lời né của kiem-hong-ngoai.mjs chứng minh đếm cứng không đủ sao; H từng bước). che-hong-ngoai.1 tạo go_to_wall() (H).
    trinhDien('hong-ngoai.1', 'Mỗi ô là 10 cm',
      'Xe có mắt hồng ngoại ở mũi: distance() cho biết phía trước còn bao nhiêu ô trống tới tường, mỗi ô là 10 cm. Đường có ba đoạn dài ngắn khác nhau: ở đầu mỗi đoạn, chương trình đọc số vào biến d rồi đi đúng d ô, rẽ phải và làm lại. Bấm Chạy xem tia đo và xe tới cờ.',
      'Chương trình đã viết sẵn và khoá. Bấm Chạy: d = distance() đọc số ô trống, for j in range(d) đi đúng chừng ấy ô.',
      ['distance() đếm số ô trống phía trước mũi xe. Xe đứng sát tường thì distance() là 0.', 'Màn sau em đặt thẳng distance() vào range().']);
    // Gói 4 chương bang-chuyen: cái mới là BĂNG CHUYỀN (sàn đẩy xe một ô mỗi hai nhịp). bang-chuyen.1 trình diễn: bốn nhịp đứng yên mà xe trôi hai ô, rồi ba bước tới cờ
    // (lời giải đổi, đo lại sao; ngân hàng man-bang-chuyen.js giữ bản cũ cho kiem-bang-chuyen); bang-chuyen.2 ép đi ngược băng (H). Chương che-sung-hoi.1 chế jet_back (H đã có).
    sua('bang-chuyen.1', {
      ten: 'Lên băng', chiChay: true, chinhCoDinh: true,
      deBai: 'Ô mũi tên là băng chuyền: xe đứng trên băng thì cứ hai nhịp lại bị đẩy đi một ô theo chiều mũi tên, dù không bước. Chương trình đứng yên bốn nhịp rồi mới bước ba lần. Bấm Chạy xem băng đưa xe tới cờ.',
      veMaMau: 'Chương trình đã viết sẵn và khoá. Bấm Chạy: bốn wait() mà xe trôi hai ô, rồi ba move() tới cờ.',
      maMau: bai(['for i in range(4):', '    wait()', 'for i in range(3):', '    move()']), loiGiai: bai(['for i in range(4):', '    wait()', 'for i in range(3):', '    move()']),
      goiY: ['Băng chuyền đẩy xe một ô sau mỗi hai nhịp đứng trên nó.', 'Màn sau băng chạy ngược chiều xe: mỗi hai nhịp bị kéo lùi một ô.']
    });
    // Gói 5 chương day-thung: cái mới là XÍCH ĐẨY THÙNG NẶNG (tiến vào thùng thì thùng trượt một ô). day-thung.1 trình diễn (hai move(), thùng vào đích); day-thung.2 ép đẩy cả đoạn
    // (mã mẫu lặp 3, người chơi đổi số: H). che-day-thung.1 chế push(n) (H).
    trinhDien('day-thung.1', null,
      'Xích của xe đã được nâng cấp: tiến vào thùng nặng thì thùng trượt đi một ô, xe tiến theo. Thùng cách ô đích khung vàng hai ô. Bấm Chạy xem hai bước tiến đẩy thùng vào đích.',
      'Chương trình đã viết sẵn và khoá. Bấm Chạy: mỗi move() vào thùng là thùng dời một ô.',
      ['Xe lùi thì không kéo được thùng: chỉ tiến mới đẩy.', 'Màn sau thùng ở xa hơn: em tự lặp move() đủ số lần.']);
    // Gói 6 chương luc-ban: cái mới là CHỌN LỰC BẮN shoot("fast") / shoot("charge"). luc-ban.1 trình diễn bắn nhanh (nút gần, thùng sau lưng nằm yên);
    // luc-ban.2 ép: mã mẫu bắn nhanh không tới nút cách ba ô, người chơi đổi chữ "fast" thành "charge" (H). che-luc-ban.1 chế aim_fire() (H).
    trinhDien('luc-ban.1', null,
      'Vòi phun giờ chọn được lực: shoot("charge") bắn tụ như mọi khi (tia nước bay xa, xe bị giật lùi); shoot("fast") bắn nhanh (tia nước chỉ bay hai ô, xe đứng yên). Van cách xe hai ô, thùng nằm ngay sau lưng. Bấm Chạy xem bắn nhanh mở cửa mà thùng không bị xô.',
      'Chương trình đã viết sẵn và khoá. Bấm Chạy: chữ "fast" trong ngoặc là lực bắn nhanh.',
      ['Bắn tụ thì cú giật hất thùng sau lưng trượt đi.', 'Màn sau van ở xa: em tự chọn lực.']);
    // Gói 7 chương do-nhiet: cái mới là ĐO NHIỆT warm() (nút bắn đang bật thì nóng). do-nhiet.1 trình diễn (if not warm(): fire("fast") ở mỗi khúc quanh);
    // do-nhiet.2 ép while not warm(): turn_right() (H). che-do-nhiet.1 chế switch_on() (H).
    trinhDien('do-nhiet.1', null,
      'Mắt hồng ngoại vừa được nâng cấp ĐO NHIỆT: warm() là True khi vật cản trước mũi xe đang nóng. Van hơi đang mở thì nóng (có quầng đỏ), van đóng thì không. Đường xoắn có ba khúc quanh, cuối mỗi khúc một van; van đóng nào cũng mở cửa của khúc sau. Bấm Chạy xem xe hỏi warm() ở mỗi khúc: van chưa nóng thì bắn nhanh cho mở, rồi rẽ phải đi tới tường.',
      'Chương trình đã viết sẵn và khoá. Bấm Chạy: if not warm() chỉ bắn khi van trước mặt chưa nóng.',
      ['Bắn van đang mở là đóng nó: phải hỏi warm() trước.', 'Màn sau bốn van nóng làm đèn chỉ đường: em quay cho tới khi warm() là True.']);
    // Gói 9 chương be-sung: cái mới là BỆ SÚNG XÍCH (xích + súng hơi: bắn tụ không giật). be-sung.1 trình diễn (bắn nút rồi rẽ phải, không cần move() bù giật);
    // be-sung.2 ép: mã mẫu của Sola có back() bù giật thừa, người chơi bỏ dòng đó (H). che-be-sung.1 chế blast_left() (H).
    trinhDien('be-sung.1', null,
      'Xe xích của em đã gắn vòi phun thành BỆ VÒI: xích bám chắc nên bắn tụ không giật, không như xe hai bánh lùi một ô sau mỗi phát. Bấm Chạy xem xe bắn van cuối hành lang cho cửa bên phải mở, rồi rẽ phải tới cờ mà không phải bù cú giật.',
      'Chương trình đã viết sẵn và khoá. Bấm Chạy: sau shoot() và wait(), xe vẫn đứng nguyên ô.',
      ['Xe hai bánh bắn tụ thì giật lùi một ô; bệ vòi xích thì không.', 'Màn sau Sola viết cho xe hai bánh có dòng bù giật thừa: em bỏ nó.']);
  })();

  // ---------------------------------------------------------------- TÊN HIỂN THỊ THEO QUY TẮC ĐẶT TÊN (user duyệt 29/10, hội đồng 20261029-1738; KE-HOACH-7-MUA.md mục "Quy tắc đặt tên")
  // Tên mùa = nơi robot làm việc; tên gói = món mới hay tình huống mới (cùng tên với thẻ bộ phận); tên chương = việc em làm, không lặp tên gói,
  // không "Hàm cho…"; chương tạo hàm thì "Chế lệnh: …". Chỉ đổi CHỮ HIỂN THỊ: mã gói / chương (khoá lưu tiến độ) giữ nguyên.
  // Mùa 2 đổi 29/10 sau khi vòi phun / van hơi gộp (bắn → phun ở tên và phim; chữ trong màn đổi ở đợt riêng).
  (function () {
    var TEN_MUA = { 'mua-1': 'Kho hàng',      // user 29/10: mùa 1 là xe bê vác làm ở kho (trước: Xưởng R1)
                     'mua-2': 'Nhà máy', 'mua-3': 'Mỏ quặng', 'mua-4': 'Thành phố' };
    TT.mua.forEach(function (m) { if (TEN_MUA[m.ma]) m.ten = TEN_MUA[m.ma]; });
    var TEN_GOI_1 = { 'tay-gap': 'Tay kẹp', 'kho-hang': 'Nút đè', 'hai-robot': 'Gặp R2', 'combo': 'Nhìn bên, nhặt bên' };
    TT.goi.forEach(function (g) { if (g.mua === 'mua-1' && TEN_GOI_1[g.ma]) g.ten = TEN_GOI_1[g.ma]; });
    var TEN_CHUONG_1 = {
      'hai-banh': 'Lăn bánh', 'xuong-ham': 'Xưởng hàm',
      'tay-gap': 'Gắp thùng', 'vong-lap': 'Lặp cho gọn',
      'khoang-cach': 'Dừng trước tường', 'che-cam-bien': 'Chế lệnh: tự dừng',
      'nut-de': 'Thùng giữ cửa', 'kho-hang': 'Chế lệnh: né thùng',
      'banh-lui': 'Lùi khỏi ngõ cụt', 'che-banh-lui': 'Chế lệnh: lùi',
      'tay-xoay': 'Nhặt bên hông', 'che-tay-xoay': 'Chế lệnh: xoay tay',
      'cam-bien-ben': 'Nhìn hai bên', 'me-cung': 'Mê cung',
      'hai-robot': 'Chia việc', 'che-hai-robot': 'Phối hợp ăn ý',
      'combo': 'Dừng cạnh thùng', 'che-combo': 'Trực kho',
      'robot-hoan-thien': 'Đủ bộ', 'trum-mua-1': 'Ngày xuất xưởng'
    };
    Object.keys(TEN_CHUONG_1).forEach(function (c) { TT.ten[c] = TEN_CHUONG_1[c]; });
    var TEN_GOI_2 = { 'nha-may': 'Băng chuyền', 'hong-ngoai': 'Cảm biến hồng ngoại', 'luc-ban': 'Lực phun', 'doi-mua-2': 'R2 trở lại', 'nha-may-chay': 'Xe cứu hỏa R1' };
    TT.goi.forEach(function (g) { if (g.mua === 'mua-2' && TEN_GOI_2[g.ma]) g.ten = TEN_GOI_2[g.ma]; });
    var TEN_CHUONG_2 = {
      'xich': 'Quay hai nhịp', 'bien-xich': 'Đếm bước để về',
      'sung-hoi': 'Phun là lùi', 'tham-so': 'Đi mấy ô tùy em',
      'hong-ngoai': 'Còn mấy ô?', 'che-hong-ngoai': 'Chế lệnh: tới sát tường',
      'bang-chuyen': 'Lên băng chuyền', 'che-sung-hoi': 'Chế lệnh: phun để đi',
      'day-thung': 'Đẩy thùng nặng', 'che-day-thung': 'Chế lệnh: đẩy n ô',
      'luc-ban': 'Phun nhanh, phun tụ', 'che-luc-ban': 'Chế lệnh: chọn lực',
      'do-nhiet': 'Tìm van nóng', 'che-do-nhiet': 'Chế lệnh: mở van',
      'doi-mua-2': 'Nhường đường', 'che-doi-mua-2': 'Chế lệnh: chờ bạn',
      'be-sung': 'Phun không lùi', 'che-be-sung': 'Chế lệnh: phun ba hướng',
      'tong-hop-2': 'Đủ bộ', 'trum-mua-2': 'Nhà máy chạy lại'
    };
    Object.keys(TEN_CHUONG_2).forEach(function (c) { TT.ten[c] = TEN_CHUONG_2[c]; });
    // Mùa 3: gói 3 đổi tên ngay trong MUA_3 ("Cảm biến từ", user 29/10); các tên khác của mùa 3 đặt theo quy tắc khi làm P2.
  })();

  // Ngưỡng sao được đo offline bằng máy chấm trên lộ trình mới, không chia tổng 3 sân.
  var nguong = node ? require('./lo-trinh-sao.js') : window.NguongSaoLoTrinh;
  M.danhSach.forEach(function (m) {
    if (nguong && nguong[m.ma]) m.sao = Object.assign({}, m.sao, nguong[m.ma]);
  });
  M.phienBanLoTrinh = 2;
  M.tinhLai();
  if (node) module.exports = M;
})();
