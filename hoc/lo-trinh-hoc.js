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
      'bien-xich', 'hong-ngoai', 'day-thung', 'che-luc-ban', 'do-nhiet', 'kho-cu', 'doi-mua-2', 'be-sung', 'trum-mua-2',
      // MÙA 3 (KE-HOACH-MUA-3.md): mỗi gói một tệp ngân hàng màn mới (chỉ khai ManHoc.man…, lộ trình thêm vào chương của MUA_3 bên dưới)
      'than-nhen', 'nam-cham-n', 'cam-ung-tu', 'bai-tu', 'nhay', 'dao-cuc', 'doc-cuc', 'bang-cu', 'doi-xich-nhen', 'bung-nhen', 'trum-mua-3',
      // MÙA 4 (KE-HOACH-MUA-4.md): mỗi gói một tệp ngân hàng màn mới (chỉ khai ManHoc.man…, lộ trình thêm vào chương của MUA_4 bên dưới)
      'cat-canh', 'cham-son', 'camera-bon-huong', 'pho-mau', 'tram-sac', 'net-lien', 'nhin-duoi-chan', 'vuon-cu', 'doi-chia-hang', 'son-tren-cao', 'trum-mua-4',
      // MÙA 6 (Mỏ đá): ngân hàng màn mới gói 1–10
      'luoi-2d', 'hat-da', 'radar-tron', 'san-mo-da', 'di-cheo', 'chinh-luc', 'nhan-dang', 'mo-cu', 'doi-omni-moi', 'trum-mua-6',
      // MÙA CẢNG SÔNG (mua-4): ngân hàng màn mới gói 1–6
      'can-cau', 'moc-cau', 'quet-ma', 'ben-tau', 'duong-ray', 'nhac-doi'].forEach(function (n) { require('./man-' + n + '.js'); });
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
  var lop = ['mau', 'vatMau', 'vatChat', 'vatDang', 'vatThem', 'cuaNhip', 'noi', 'bongMo', 'hinh', 'sonBanDau'];
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
  // Trừ che-may-son.6 (mùa 4 gói 6, nghiệm thu 30/10): hai hàng màu khác nhau để danh sách màu ghi cứng không thắng.
  var GIU_NHIEU_SAN = { 'che-may-son.6': true };
  M.danhSach.forEach(function (m) { if (m.so < 10 && !GIU_NHIEU_SAN[m.ma]) motSan(m, 1); });

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
    'robot-hoan-thien.11', 'trum-mua-1.3', 'trum-mua-1.4', 'trum-mua-1.6', 'trum-mua-1.9', 'trum-mua-1.10'];
  // PDM1 (31/10): trum-mua-1.4 thành màn MỘT robot viết thân deliver() (hàm của màn, có while): màn ép theo kiem-lach-mua-1.mjs nên có cờ.
  DAM_LA_THUA.forEach(function (ma) { get(ma).damLaThua = true; });
  M.manDamLaThua = DAM_LA_THUA.slice();
  // 31/10 (KE-HOACH-PART-DUNG-MUA.md, user: "part là bản nâng cấp, sau khi nâng cấp thì luôn được dùng bản full"): từ gói 7 mùa 1 (sau gói 6 Tay xoay)
  // R1 đang gắn tay kẹp thì gắn tay xoay (đủ bốn lệnh kẹp + arm_left / arm_right), lời giải giữ nguyên. Đội: chỉ R1 (doi[0]); R2 giữ cấu hình của màn.
  function lenTayXoay(r, goc) {
    if (r && r.tay === 'kep') r.tay = 'xoay';
    if (goc.indexOf('arm_down') < 0 || goc.indexOf('arm_left') >= 0) return goc;
    var i = goc.indexOf('arm_up') + 1;
    return goc.slice(0, i).concat(['arm_left', 'arm_right'], goc.slice(i));
  }
  ['cam-bien-ben', 'me-cung', 'hai-robot', 'che-hai-robot', 'combo', 'che-combo', 'robot-hoan-thien', 'trum-mua-1'].forEach(function (c) {
    M.danhSach.filter(function (m) { return m.chuong === c; }).forEach(function (m) {
      if (m.robot && m.robot.tay && m.robot.tay !== 'kep') return;
      if (m.hamGoc.indexOf('arm_down') < 0) return;
      m.hamGoc = lenTayXoay(m.robot, m.hamGoc);
      if (m.doi && m.doi[0] && m.doi[0].hamGoc) m.doi[0].hamGoc = lenTayXoay(m.doi[0].robot, m.doi[0].hamGoc);
    });
  });
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
  // PDM2a 31/10 (xích quay hai nhịp): .9 lên ngay sau .8 (11 → 14 nhịp), .7 (một van hai cửa) thành màn 9 làm mốc cho trùm.
  var THU_TU_SUNG_HOI = [1, 2, 3, 4, 5, 6, 8, 9, 7, 10];               // trước PDM2a: [1, 2, 3, 4, 5, 6, 8, 7, 9, 10] (sung-hoi.8 9 dòng sau .6 6 dòng)
  var THU_TU_CHE_SUNG_HOI = [1, 2, 3, 4, 5, 6, 7, 9, 8, 10];        // che-sung-hoi.9 (21 ô, có hàm của màn) đứng sau .7 (15 ô) cho đường cong ô
  var MUA_2 = [
    { ma: 'xich', ten: 'Bánh xích', loai: 'bo-phan', hinh: 'xich', sao: 0,
      // Chương 2 "Biến cho xích": hàm cho xích (spin, sidestep, sửa fixed_turn, pick_behind: 29/10 fixed_turn lên trước pick_behind cho nhịp tăng dần) rồi biến đếm (count_return sửa trước, bounce, fetch_back), che-xich.9 cuối.
      // Màn mới (đếm nhịp quay) của man-bien-xich.js nối vào cuối chương và thành trùm (màn thứ 10).
      chuong: [['xich', day('xich', MUOI)], ['bien-xich', ['che-xich.1', 'che-xich.2', 'che-xich.8', 'che-xich.6', 'che-cam-bien.6', 'che-cam-bien.5',
        'che-cam-bien.9', 'robot-hoan-thien.9', 'che-xich.9']]] },
    { ma: 'sung-hoi', ten: 'Vòi phun', loai: 'bo-phan', hinh: 'sung-hoi', sao: 30,
      // 29/10 (phun nhẹ): chương sung-hoi dựng lại, thứ tự theo đường cong đo bằng kiem-lo-trinh.
      chuong: [['sung-hoi', day('sung-hoi', THU_TU_SUNG_HOI)], ['tham-so', day('tham-so', MUOI)]] },
    { ma: 'hong-ngoai', ten: 'Hồng ngoại', loai: 'bo-phan', sao: 60,
      chuong: [['hong-ngoai', []], ['che-hong-ngoai', []]] },
    { ma: 'nha-may', ten: 'Nhà máy', hinh: 'bang-chuyen', sao: 90,
      // 29/10 (đường cong): bang-chuyen 1, 2, 6, 5, 7, 8, 3, 4, 9 (bc.8 hẹp lại làm mốc cho bc.3, bc.3 làm mốc cho bc.4 rộng);
      // che-sung-hoi: 30/10 dựng lại theo phun nhẹ, thứ tự theo đường cong (THU_TU_CHE_SUNG_HOI).
      chuong: [['bang-chuyen', day('bang-chuyen', [1, 2, 6, 5, 7, 8, 3, 4, 9, 10])], ['che-sung-hoi', day('che-sung-hoi', THU_TU_CHE_SUNG_HOI)]] },
    { ma: 'day-thung', ten: 'Đẩy thùng', sao: 120,
      chuong: [['day-thung', []], ['che-day-thung', []]] },
    { ma: 'luc-ban', ten: 'Lực phun', hinh: 'luc-ban', sao: 150,
      chuong: [['luc-ban', day('luc-ban', MUOI)], ['che-luc-ban', []]] },
    { ma: 'do-nhiet', ten: 'Đo nhiệt', sao: 180,
      chuong: [['do-nhiet', []], ['che-do-nhiet', []]] },
    // PDM2b 31/10 (khuôn mới KE-HOACH-PART-DUNG-MUA.md mục 1): gói 8 = cỗ máy mùa gặp yếu tố mùa trước ("Góc kho cũ": nút đè, hàng rào, thùng gỗ của Kho hàng).
    // Gói Đội (doi-mua-2 / che-doi-mua-2) rời gói 8; PDM2c 31/10: thành GÓI 9 (R1 xe cứu hỏa đầy đủ, R2 xe chở hàng mùa 1). Bệ vòi xích (be-sung) cất ra mùa ẩn (CAT_MUA_2, giữ ngân hàng).
    { ma: 'kho-cu', ten: 'Góc kho cũ', loai: 'thu-thach', sao: 210,
      chuong: [['kho-cu', []], ['che-kho-cu', []]] },
    { ma: 'doi-mua-2', ten: 'Đội', loai: 'thu-thach', sao: 240,
      chuong: [['doi-mua-2', []], ['che-doi-mua-2', []]] },
    { ma: 'nha-may-chay', ten: 'Xe cứu hỏa R1 xuất xưởng', loai: 'thu-thach', sao: 270,
      chuong: [['tong-hop-2', []], ['trum-mua-2', []]] }
  ];
  var TEN_MUA_2 = { 'bien-xich': 'Biến cho xích', 'hong-ngoai': 'Hồng ngoại', 'che-hong-ngoai': 'Hàm cho hồng ngoại', 'day-thung': 'Đẩy thùng',
    'che-day-thung': 'Hàm đẩy thùng', 'che-luc-ban': 'Hàm lực phun', 'do-nhiet': 'Đo nhiệt', 'che-do-nhiet': 'Hàm đo nhiệt', 'doi-mua-2': 'Đội',
    'kho-cu': 'Lách qua kho cũ', 'che-kho-cu': 'Chế lệnh: dọn kho cũ',
    'che-doi-mua-2': 'Đội phối hợp', 'be-sung': 'Bệ vòi xích', 'che-be-sung': 'Hàm bệ vòi', 'tong-hop-2': 'Tổng hợp', 'trum-mua-2': 'Trùm mùa' };
  // Rời mùa 2: che-xich 3, 4, 5, 7, 10 dùng bậc thang (game đã bỏ) và hàm có tham số trước gói 2. KHÔNG cất hẳn: che-xich.4 tạo climb() mà
  // che-doi-xich.1, .2 và che-doi-omni.5 (mùa ẩn) cần; năm màn thành chương `che-xich` (5 màn) đứng trước gói Đội xích và nhện ở mùa 3 (ẩn).
  // Gói 5 Đẩy thùng có thể lấy lại màn nào cứu được (bỏ bậc thang) về chương của mình.
  var XICH_CU = ['che-xich.3', 'che-xich.4', 'che-xich.5', 'che-xich.7', 'che-xich.10'];
  // Gói 2 chương 1 Vòi phun đứng TRƯỚC chương 2 Hàm có tham số (tham-so.3 tạo forward(n)): 29/10 ngân hàng man-sung-hoi.js dựng lại theo phun nhẹ,
  // không gọi forward(n) nên không còn ghi đè ở đây.
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
    get('xich.6').deBai = 'Ô mũi tên là băng chuyền: nó đẩy xe hai bánh trôi theo chiều mũi tên (gói Băng chuyền sẽ gặp lại). Xe xích bám chắc nên băng chuyền, xuôi hay ngược chiều, đều không đẩy được nó. Đi qua các băng chuyền tới cờ như đi trên sàn.';
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
    // che-sung-hoi: 30/10 ngân hàng dựng lại theo phun nhẹ (sân đã gọn), không còn thu sân ở đây.
  })();
  // TỆP NGÂN HÀNG MÀN MỚI MÙA 2 (quy ước cho các gói sau): mỗi gói có màn mới MỘT tệp hoc/man-<tệp>.js khai ManHoc.<biến> = [màn…], mỗi màn khai
  // `chuong` (mã chương trong MUA_2) và `so`; tệp đã có trong danh sách require ở đầu tệp này và thẻ <script> của game/choi.html. Màn mới của một chương
  // nối SAU các màn có sẵn của chương đó trong MUA_2, theo `so` (muốn xen giữa thì sửa đúng dòng chương đó trong MUA_2). Màn cuối của chương đủ 10 là trùm.
  //   man-bien-xich.js   manBienXich   gói 1 chương 2 bien-xich (1 màn mới, thành trùm)
  //   man-hong-ngoai.js  manHongNgoai  gói 3 hong-ngoai · che-hong-ngoai
  //   man-day-thung.js   manDayThung   gói 5 day-thung · che-day-thung
  //   man-che-luc-ban.js manCheLucBan  gói 6 chương 2 che-luc-ban
  //   man-do-nhiet.js    manDoNhiet    gói 7 do-nhiet · che-do-nhiet
  //   man-doi-mua-2.js   manDoiMua2    gói 9 doi-mua-2 · che-doi-mua-2 (PDM2c 31/10, trước: gói 8)
  //   man-be-sung.js     manBeSung     be-sung · che-be-sung (PDM2c: CẤT ra mùa ẩn, CAT_MUA_2)
  //   man-trum-mua-2.js  manTrumMua2   gói 10 tong-hop-2 · trum-mua-2
  //   man-kho-cu.js      manKhoCu      gói 8 kho-cu · che-kho-cu (PDM2b 31/10, thay gói Đội)
  var TEP_MUA_2 = ['manBienXich', 'manHongNgoai', 'manDayThung', 'manCheLucBan', 'manDoNhiet', 'manKhoCu', 'manDoiMua2', 'manBeSung', 'manTrumMua2'];
  // Chương mùa 2 CẤT khỏi lộ trình mùa 2 (PDM2c 31/10, phương án A của người giao): gói Bệ vòi xích (gói 9 cũ; luật cfg.beSung đã bỏ theo part đúng mùa, gói Đội về gói 9).
  // Màn vẫn vào ngân hàng và lộ trình (gói ẩn đầu mùa 3, chơi bằng "Mở hết"), mã không đổi.
  var CAT_MUA_2 = { ma: 'be-sung', ten: 'Bệ vòi xích (cất)', loai: 'thu-thach', chuong: ['be-sung', 'che-be-sung'] };
  (function () {
    Object.keys(TEN_MUA_2).forEach(function (c) { TT.ten[c] = TEN_MUA_2[c]; });
    var moi = [], chuong = [];
    MUA_2.forEach(function (g) { g.chuong.forEach(function (c) { chuong.push(c[0]); }); });
    TEP_MUA_2.forEach(function (k) { moi = moi.concat(M[k] || []); });
    moi.forEach(function (m) { if (chuong.indexOf(m.chuong) < 0 && CAT_MUA_2.chuong.indexOf(m.chuong) < 0) throw new Error('Màn mới mùa 2 thuộc chương không có trong MUA_2: ' + m.chuong + '.' + m.so); });
    // Chương mới chưa có trong thuTu: chèn tạm vào cuối cho ManHoc.them nhận (như nut-de); thuTu được dựng lại ngay dưới.
    chuong.concat(CAT_MUA_2.chuong).forEach(function (c) { if (TT.thuTu.indexOf(c) < 0) TT.thuTu.push(c); });
    M.them(moi);
    moi.forEach(function (m) { nguon[m.ma] = copy(m); });
    CAT_MUA_2.chuong.forEach(function (c) {
      dungChuong(c, moi.filter(function (m) { return m.chuong === c; }).sort(function (a, b) { return a.so - b.so; }).map(function (m) { return m.ma; }));
    });
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
    // PDM2b: gói cất của mùa 2 (PDM2c: Bệ vòi xích) ra sau che-xich (ngưỡng = gói trước + 30 khi dời sang mùa ẩn, khongTangNguong).
    conLai.push(Object.assign({ mua: 'mua-3', sao: 125, khongTangNguong: true }, CAT_MUA_2));
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
  // Mùa 3 hiện ở màn chọn gói từ 30/10 (bỏ `an: true` ở thu-tu-chuong.js).
  // Xếp màn có sẵn theo part mở dần (kiem-lo-trinh.mjs mục mùa 3 (e)): gốc → nâng cấp, nên vài màn rời chương brief đề xuất:
  //   - che-nam-cham.2, .3, .4, .9 gọi grip() (nam-cham.6, gói 7: front_pole + magnet_s) → chương che-doc-cuc (gói 7), không ở logic-nam-cham (gói 2).
  //   - che-nam-cham.7 có hàm của màn đọc front_pole() → che-doc-cuc (gói 7), không ở che-dao-cuc (gói 6).
  //   - che-doi-xich: hai màn không bậc thang (.4, .5) cần pause() / hop_box() của che-doi-ho-bang (rời mùa 3) → cả chương che-doi-xich sang mùa 4.
  // Thứ tự trong chương: dễ trước khó (luật đo đường cong của mục mùa 2 (g)), màn khó nhất có sẵn đứng cuối.
  var MUA_3 = [
    { ma: 'nhen', ten: 'Nhện', loai: 'bo-phan', hinh: 'nhen',
      // 29/10 (phiên Mùa 3): khai đủ thứ tự, màn mới (man-than-nhen.js) xen giữa màn có sẵn; màn mới chưa khai ở đây thì nối cuối như cũ.
      chuong: [['nhen', ['nhen.11', 'nhen.1', 'nhen.12', 'nhen.13', 'nhen.14', 'nhen.15', 'nhen.8', 'nhen.16', 'nhen.17', 'nhen.18']], ['chuoi-nhen', ['chuoi-nhen.1', 'chuoi-nhen.2', 'chuoi-nhen.3', 'nhen.4', 'nhen.7', 'chuoi-nhen.4', 'chuoi-nhen.5', 'chuoi-nhen.6', 'chuoi-nhen.7', 'chuoi-nhen.8']]] },
    // PDM3a 31/10 (part đúng mùa): gói 2 toàn màn mới trên nhện + nam châm bụng (man-nam-cham-n.js); màn xe cũ nam-cham.1 .4 .5 .7 .8 và che-nam-cham.1 .8
    // cất ra chương rời nam-cham-xe / che-nam-cham-xe (ROI_MUA_3, mùa ẩn, mã giữ).
    { ma: 'nam-cham', ten: 'Nam châm', loai: 'bo-phan', hinh: 'nam-cham',
      chuong: [['nam-cham', day('nam-cham', [11, 12, 13, 14, 15, 16, 17, 18, 19, 20])], ['logic-nam-cham', day('logic-nam-cham', MUOI)]] },
    { ma: 'cam-ung-tu', ten: 'Cảm biến từ', loai: 'bo-phan',      // user 29/10: theo tên thẻ part (gioi-thieu-part.js), trước: Cảm ứng từ
      // PDM3a 31/10: 20 màn viết lại thẳng ngân hàng (mã giữ) trên nhện + nam châm bụng + cảm biến từ hông, thứ tự 1 … 10.
      chuong: [['cam-ung-tu', day('cam-ung-tu', MUOI)], ['che-cam-ung-tu', day('che-cam-ung-tu', MUOI)]] },
    { ma: 'bai-tu', ten: 'Bãi từ',
      chuong: [['bai-tu', []], ['che-bai-tu', []]] },
    { ma: 'nhay', ten: 'Nhảy', loai: 'bo-phan', hinh: 'che-nhen',
      // che-nhen (đường cong): sửa cú nhảy (.8), bò rồi nhảy (.5), sửa bò (.9) lên trước Đá lót đường (.4) và Hang động (.3); Nhện giao hàng (.6) sau Đường về (.7).
      chuong: [['nhay', ['nhay.1', 'nhen.3', 'nhen.2', 'nhay.2', 'nhen.9', 'nhay.3', 'nhay.4', 'nhen.5', 'nhen.6', 'nhen.10']], ['che-nhen', day('che-nhen', [1, 2, 8, 5, 9, 4, 3, 7, 6, 10])]] },
    { ma: 'dao-cuc', ten: 'Đảo cực', loai: 'bo-phan',
      chuong: [['dao-cuc', []], ['che-dao-cuc', []]] },
    { ma: 'doc-cuc', ten: 'Đọc cực', loai: 'bo-phan', hinh: 'che-nam-cham',
      chuong: [['doc-cuc', []], ['che-doc-cuc', []]] },
    { ma: 'bang-cu', ten: 'Băng chuyền cũ', loai: 'thu-thach',
      chuong: [['bang-cu', []], ['che-bang-cu', []]] },
    { ma: 'doi-xich', ten: 'Đội xích và nhện', loai: 'thu-thach',
      chuong: [['doi-xich', day('doi-xich', [11, 12, 13, 15, 14, 16, 18, 17, 19, 20])], ['che-doi-xich', day('che-doi-xich', [11, 12, 14, 15, 16, 13, 18, 17, 19, 20])]] },
    { ma: 'tong-hop-3', ten: 'Tổng hợp', loai: 'thu-thach',
      chuong: [['tong-hop-3', day('tong-hop-3', [1, 2, 4, 6, 3, 8, 5, 7, 9, 10])], ['trum-mua-3', day('trum-mua-3', [8, 4, 7, 1, 3, 6, 2, 5, 9, 10])]] }
  ];
  // PDM3b2 31/10: gói Nam châm bụng nhện (gói 9 cũ; nam châm bụng nhện đã dạy từ gói 2) CẤT ra mùa ẩn (như CAT_MUA_2 be-sung), gói Đội về gói 9, gói 8 là Băng chuyền cũ.
  var CAT_MUA_3 = { ma: 'bung-nhen', ten: 'Nam châm bụng nhện (cất)', loai: 'thu-thach',
    chuong: [['bung-nhen', ['bung-nhen.1', 'bung-nhen.2', 'bung-nhen.3', 'bung-nhen.4', 'bung-nhen.5', 'bung-nhen.6', 'bung-nhen.7', 'bung-nhen.9', 'bung-nhen.8', 'bung-nhen.10']], ['che-bung-nhen', ['che-bung-nhen.1', 'che-bung-nhen.2', 'che-bung-nhen.3', 'che-bung-nhen.4', 'che-bung-nhen.8', 'che-bung-nhen.7', 'che-bung-nhen.5', 'che-bung-nhen.6', 'che-bung-nhen.9', 'che-bung-nhen.10']]] };
  var TEN_MUA_3 = { nhen: 'Thân nhện', 'chuoi-nhen': 'Chuỗi cho nhện', 'nam-cham': 'Nam châm', 'logic-nam-cham': 'Logic cho nam châm',
    'cam-ung-tu': 'Dò sắt', 'che-cam-ung-tu': 'Chế lệnh: dò sắt', 'bai-tu': 'Bãi từ', 'che-bai-tu': 'Hàm cho bãi từ', nhay: 'Nhảy',
    'che-nhen': 'Chế lệnh nhện', 'dao-cuc': 'Đảo cực', 'che-dao-cuc': 'Hàm đảo cực', 'doc-cuc': 'Đọc cực', 'che-doc-cuc': 'Hàm đọc cực',
    'bang-cu': 'Né băng, mở cổng', 'che-bang-cu': 'Chế lệnh: qua băng cũ',
    'doi-xich': 'Đội xích và nhện', 'che-doi-xich': 'Đội xích và nhện phối hợp', 'bung-nhen': 'Nam châm bụng nhện', 'che-bung-nhen': 'Hàm cho bụng nhện',
    'tong-hop-3': 'Tổng hợp', 'trum-mua-3': 'Trùm mùa' };
  /** Đổi một chuỗi lời mùa 3 sang bãi tái chế + giọng CLB: sắt vụn, "em" → "bạn" (trừ nhãn "hàm của em"), chương trình Sola viết. */
  function chuBaiTaiChe(s) {
    if (typeof s !== 'string') return s;
    return s.replace(/(V|v)ật sắt/g, function (a, v) { return v === 'V' ? 'Mẩu sắt vụn' : 'mẩu sắt vụn'; })
      .replace(/quặng sắt/g, 'sắt vụn').replace(/quặng/g, 'sắt vụn')
      .replace(/Chương trình có sẵn/g, 'Chương trình Sola viết sẵn').replace(/chương trình có sẵn/g, 'chương trình Sola viết sẵn')
      .replace(/(^|[^\p{L}])(E|e)m(?=[^\p{L}]|$)/gu, function (a, truoc, e, vt, chuoi) {
        return /hàm của $/i.test(chuoi.slice(0, vt + truoc.length)) ? a : truoc + (e === 'E' ? 'Bạn' : 'bạn');
      });
  }
  /** Lời một màn mùa 3: đề (mở bằng lời Sola), lời mã mẫu, gợi ý (Luna nói), lời sai, tên. Chạy một lần mỗi màn. */
  function loiBaiTaiChe(m) {
    if (!m || m._loiBaiTaiChe) return;
    m._loiBaiTaiChe = true;
    ['ten', 'deBai', 'veMaMau'].forEach(function (k) { if (m[k]) m[k] = chuBaiTaiChe(m[k]); });
    if (m.deBai) m.deBai = (m.chiChay ? 'Sola làm mẫu. ' : /^Sửa/.test(m.ten || '') ? 'Sola viết vội, sửa giúp nhé. ' : 'Giúp Sola với! ') + m.deBai;
    if (m.goiY) m.goiY = m.goiY.map(function (s) { return 'Luna: ' + chuBaiTaiChe(s); });
    (m.loiSai || []).forEach(function (x) { if (x.moTa) x.moTa = chuBaiTaiChe(x.moTa); });
    if (m.loiGiaiKhac && m.loiGiaiKhac.moTa) m.loiGiaiKhac.moTa = chuBaiTaiChe(m.loiGiaiKhac.moTa);
  }
  // Mã huy hiệu của trùm mỗi chương mùa 3 (tên huy hiệu = tên chương, như mùa 1, 2 từ 30/10); hai chương đội dùng mã mới (doi-xich / che-doi-xich là bí danh hai-robot ở huy-hieu-vector.js).
  var HUY_HIEU_3 = { nhen: 'nhen', 'chuoi-nhen': 'chuoi-nhen', 'nam-cham': 'nam-cham', 'logic-nam-cham': 'logic-nam-cham', 'cam-ung-tu': 'cam-ung-tu',
    'che-cam-ung-tu': 'che-cam-ung-tu', 'bai-tu': 'bai-tu', 'che-bai-tu': 'che-bai-tu', nhay: 'nhay', 'che-nhen': 'che-nhen', 'dao-cuc': 'dao-cuc',
    'che-dao-cuc': 'che-dao-cuc', 'doc-cuc': 'doc-cuc', 'che-doc-cuc': 'che-doc-cuc', 'bang-cu': 'bang-cu', 'che-bang-cu': 'che-bang-cu',
    'doi-xich': 'doi-xich-nhen', 'che-doi-xich': 'che-doi-xich-nhen',
    'bung-nhen': 'bung-nhen', 'che-bung-nhen': 'che-bung-nhen', 'tong-hop-3': 'tong-hop-3', 'trum-mua-3': 'xe-tham-do' };
  // Rời mùa 3 (mùa 4, ẩn, giữ thứ tự cũ, vẫn chơi được bằng "Mở hết"): màn của chương mùa 3 dùng lại mã mà không thuộc MUA_3 thành chương riêng, đứng đúng
  // chỗ chương cũ trong thuTu (THAY_CU). nam-cham.9 (omni, mùa 5); doi-xich 8 màn bậc thang S; che-doi-xich cả 10 (bậc thang S, hay cần hàm của
  // che-doi-ho-bang). Gói cũ đổi mã khi mã cũ đã thuộc gói mùa 3 (cờ goi-mo:<mã> của gói mùa 3).
  // PDM3a 31/10: nam-cham-xe (nam-cham.1 .4 .5 .7 .8) và che-nam-cham-xe (che-nam-cham.1 .8): màn nam châm mũi xe hai bánh rời gói 2 (gói 2 nay là nhện + nam châm bụng).
  var ROI_MUA_3 = { 'doi-xich-bac': day('doi-xich', MUOI), 'che-doi-xich-bac': day('che-doi-xich', MUOI), 'nam-cham-omni': ['nam-cham.9', 'nam-cham.10'],     // 30/10 nghiệm thu: nam-cham.10 thôi làm trùm Đọc cực (thay bằng doc-cuc.9)
    'nam-cham-xe': day('nam-cham', [1, 2, 3, 4, 5, 6, 7, 8]), 'che-nam-cham-xe': day('che-nam-cham', MUOI) };
  var TEN_ROI_3 = { 'doi-xich-bac': 'Đội xích leo bậc', 'che-doi-xich-bac': 'Hàm đội xích leo bậc', 'nam-cham-omni': 'Nam châm trên omni', 'nam-cham-xe': 'Nam châm mũi xe', 'che-nam-cham-xe': 'Chế lệnh nam châm mũi xe' };
  var THAY_CU = { 'doi-xich': ['doi-xich-bac'], 'che-doi-xich': ['che-doi-xich-bac'], 'nam-cham': ['nam-cham-omni', 'nam-cham-xe'], 'che-nam-cham': ['che-nam-cham-xe'] };
  var GOI_DOI_MA = { 'doi-xich': { ma: 'doi-xich-bac', ten: 'Đội xích leo bậc' }, 'nam-cham': { ma: 'nam-cham-omni', ten: 'Nam châm trên xe' } };
  // Sửa màn có sẵn (bảng P0): game bỏ bậc thang. nhen.8, che-nhen.6: ô S thành sàn; nhện bước lên S như sàn (2 nhịp mỗi bước) nên lời giải, nhịp, ô
  // không đổi: sửa thẳng sân (không qua sua()), không đo lại sao.
  (function () {
    function sanThay(ma, tu, den) { var m = get(ma); m.san = m.san.map(function (d) { return d.split(tu).join(den); }); return m; }
    Object.assign(sanThay('nhen.8', 'S', '.'), {
      deBai: 'Hàng băng chuyền chạy ngược hướng nhện muốn đi: nhện bước vào là bị đẩy lùi lại, không qua được. Tìm đường vòng phía trên để tới cờ.',
      goiY: ['Băng chuyền đẩy theo mũi tên: nhện bước ngược mũi tên thì bị đẩy lùi đúng bằng quãng vừa bước.',
        'Thử đi vào băng một lần để thấy nó chặn thế nào, rồi tìm lối khác vòng phía trên.']
    });
    // PDM3b 31/10 (part đúng mùa): che-nhen.6 đổi từ tay kẹp (pick / drop) sang nam châm bụng nhện (magnet_n / magnet_off, hút / thả ở ô dưới bụng).
    // Bản tay kẹp cũ của bring(path) cấp lại qua DAY_CU (capCu) cho che-doi-xich.6 (chương rời che-doi-xich-bac, mùa ẩn).
    var T_BRING_3 = ['magnet_n()', 'wait()', 'walk(path)', 'magnet_off()', 'wait()'];
    var C_N6 = ['walk("DRRDDDR")', 'bring("DLL")'];
    sua('che-nhen.6', {
      san: ['.###', '...#', '##.#', '##..', '#..o', '#...'], vatChat: ['....', '....', '....', '....', '...s', '....'],
      robot: { than: 'nhen', tay: 'nam-cham' },
      hamGoc: ['go_up', 'go_down', 'go_left', 'go_right', 'crouch', 'stand', 'wait', 'magnet_n', 'magnet_off'],
      bongMo: { x: 1, y: 5, huong: 0, vat: [{ x: 1, y: 5 }], chan: 'dung' },
      hamCuaEmCan: ['go', 'walk'],
      deBai: 'Nhện gắn nam châm dưới bụng: hút và thả đều ở ô ngay dưới bụng. Chương trình chính đưa nhện tới đứng trên mẩu sắt vụn rồi gọi bring("DLL"). Chế bring(path): hút mẩu sắt, đi theo path rồi thả xuống đúng chỗ bóng mờ.',
      veMaMau: 'Chương trình chính bị khóa: walk("DRRDDDR") rồi bring("DLL"). Mở Xưởng hàm, tạo bring(path) rồi bấm Chạy.',
      maMau: { chinh: C_N6.slice(), hamCuaMan: [] },
      loiGiai: { chinh: C_N6.slice(), hamCuaMan: [], hamCuaEmMoi: [{ ten: 'bring', thamSo: ['path'], than: T_BRING_3.slice() }] },
      congThucKhac: [
        { moTa: 'Đi bằng vòng for c in path: go(c) thay cho walk(path)', hamCuaEmMoi: [{ ten: 'bring', thamSo: ['path'], than: ['magnet_n()', 'wait()', 'for c in path:', '    go(c)', 'magnet_off()', 'wait()'] }] }
      ],
      loiSai: [
        { moTa: 'Gọi bring("DLL") mà chưa chế hàm', baiLam: { chinh: C_N6.slice(), hamCuaMan: [] }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên magnet_off(): mẩu sắt còn dính dưới bụng', baiLam: { chinh: C_N6.slice(), hamCuaMan: [] }, hamCuaEmMoi: [{ ten: 'bring', thamSo: ['path'], than: ['magnet_n()', 'wait()', 'walk(path)'] }], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quên magnet_n(): nhện đi một mình, mẩu sắt nằm lại', baiLam: { chinh: C_N6.slice(), hamCuaMan: [] }, hamCuaEmMoi: [{ ten: 'bring', thamSo: ['path'], than: ['walk(path)', 'magnet_off()', 'wait()'] }], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đi trước rồi mới hút: nhện hút ở chỗ trống', baiLam: { chinh: C_N6.slice(), hamCuaMan: [] }, hamCuaEmMoi: [{ ten: 'bring', thamSo: ['path'], than: ['walk(path)', 'magnet_n()', 'wait()', 'magnet_off()', 'wait()'] }], phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Việc của bring(): bật nam châm hút mẩu sắt dưới bụng, đi theo path bằng walk(path), rồi ngắt nam châm thả xuống.',
        'Lệnh nam châm chỉ ra lệnh: nhớ wait() sau magnet_n() và magnet_off().']
    }).loiGiaiKhac = { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: { chinh: C_N6.slice(), hamCuaMan: [] }, hamCuaEmMoi: [{ ten: 'bring', thamSo: ['path'], than: ['# hút, mang, thả'].concat(T_BRING_3) }] };
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
  //   man-bang-cu.js        manBangCu       gói 8  bang-cu · che-bang-cu (PDM3b2 31/10, thay gói Đội)
  //   man-doi-xich-nhen.js  manDoiXichNhen  gói 9  doi-xich · che-doi-xich (PDM3b2 31/10, trước: gói 8)
  //   man-bung-nhen.js      manBungNhen     bung-nhen · che-bung-nhen (PDM3b2: CẤT ra mùa ẩn, CAT_MUA_3)
  //   man-trum-mua-3.js     manTrumMua3     gói 10 tong-hop-3 · trum-mua-3
  var TEP_MUA_3 = ['manThanNhen', 'manNamChamN', 'manCamUngTu', 'manBaiTu', 'manNhay', 'manDaoCuc', 'manDocCuc', 'manBangCu', 'manDoiXichNhen', 'manBungNhen', 'manTrumMua3'];
  (function () {
    Object.keys(TEN_MUA_3).forEach(function (c) { TT.ten[c] = TEN_MUA_3[c]; });
    Object.keys(TEN_ROI_3).forEach(function (c) { TT.ten[c] = TEN_ROI_3[c]; });
    // Màn gói đội (chenGoi, nạp sau `nguon`) chưa có bản gốc: dungChuong cần hạng gốc (trùm) của chúng.
    M.danhSach.forEach(function (m) { if (!nguon[m.ma]) nguon[m.ma] = copy(m); });
    var coTruoc = TT.thuTu.filter(function (c) { return M.danhSach.some(function (m) { return m.chuong === c; }); });
    var moi = [], chuong = [], chuongCat3 = CAT_MUA_3.chuong.map(function (c) { return c[0]; });
    MUA_3.forEach(function (g) { g.chuong.forEach(function (c) { chuong.push(c[0]); }); });
    TEP_MUA_3.forEach(function (k) { moi = moi.concat(M[k] || []); });
    moi.forEach(function (m) { if (chuong.indexOf(m.chuong) < 0 && chuongCat3.indexOf(m.chuong) < 0) throw new Error('Màn mới mùa 3 thuộc chương không có trong MUA_3: ' + m.chuong + '.' + m.so); });
    // Chương mới chưa có trong thuTu: chèn tạm vào cuối cho ManHoc.them nhận; thuTu được dựng lại ngay dưới.
    chuong.concat(Object.keys(ROI_MUA_3), chuongCat3).forEach(function (c) { if (TT.thuTu.indexOf(c) < 0) TT.thuTu.push(c); });
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
    CAT_MUA_3.chuong.forEach(function (c) {
      c[1].forEach(function (ma) { if (da[ma]) throw new Error('Màn xếp hai lần (cất mùa 3): ' + ma); da[ma] = true; });
      dungChuong(c[0], c[1]);
    });
    Object.keys(ROI_MUA_3).forEach(function (c) {
      ROI_MUA_3[c].forEach(function (ma) { if (da[ma]) throw new Error('Màn vừa ở mùa 3 vừa rời mùa 3: ' + ma); });
      dungChuong(c, ROI_MUA_3[c]);
    });
    // Huy hiệu mùa 3 (user 30/10 "vẽ 20 huy hiệu"): màn cuối mỗi chương (trùm) mang huy hiệu của chương, như mùa 2; màn khác của chương bỏ huy hiệu.
    // Màn có sẵn đổi huy hiệu theo chương mới: nhen.10 (trùm Nhảy) nhen → nhay, nam-cham.10 → doc-cuc, che-nam-cham.10 → che-doc-cuc; hình ở huy-hieu-vector.js.
    MUA_3.concat([CAT_MUA_3]).forEach(function (g) {
      g.chuong.forEach(function (c) {
        var ds = c[1];
        if (!ds.length) return;
        ds.forEach(function (ma) { delete get(ma).huyHieu; });
        get(ds[ds.length - 1]).huyHieu = { ma: HUY_HIEU_3[c[0]], ten: 'Huy hiệu ' + TEN_MUA_3[c[0]].replace(': ', ' ').replace(/\?$/, '') };
      });
    });
    // Lời mùa 3 "Bãi tái chế" (user 30/10: mùa 3 đổi từ mỏ quặng sang bãi tái chế phế liệu, luật giữ; giọng kể CLB, KE-HOACH-PHIM-CLB.md mục 1):
    // đề do Sola giao ("Giúp Sola với!"; màn sửa lỗi "Sola viết vội, sửa giúp nhé."; màn trình diễn "Sola làm mẫu."), gợi ý do Luna nói, người chơi là "bạn".
    // Làm ở lộ trình cho mọi màn mùa 3 (màn có sẵn lẫn màn mới) để ngân hàng và máy kiểm của ngân hàng giữ nguyên. Từ của lõi (hố, gầm, đệm từ, vật nam châm)
    // giữ như lời chẩn đoán của cham.js (dùng chung mùa 2, 4); vật sắt của sân là sắt vụn. "Hàm của em" là nhãn giao diện nên giữ.
    MUA_3.concat([CAT_MUA_3]).forEach(function (g) { g.chuong.forEach(function (c) { c[1].forEach(function (ma) { loiBaiTaiChe(get(ma)); }); }); });
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
    // PDM3b2: gói cất của mùa 3 (Nam châm bụng nhện) sang mùa ẩn như CAT_MUA_2 (khongTangNguong: ngưỡng = gói trước + 30).
    var goiCat3 = { ma: CAT_MUA_3.ma, ten: CAT_MUA_3.ten, loai: CAT_MUA_3.loai, mua: 'mua-4', khongTangNguong: true, chuong: chuongCat3 };
    conLai.push(goiCat3);
    doi4.push(goiCat3);
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
          // 30/10 nghiệm thu: màn cũ có front_metal / front_pole trên khay mà robot chưa gắn part cảm biến từ ('tu', gói 3) thì gắn vào hông (lõi chỉ nhìn
          // hamGoc nên luật y nguyên; hình robot nay khớp bài học). Nhện không gắn được cảm biến (không hướng mặt).
          var cam = m.robot && m.robot.camBien;
          if (m.loaiRobot !== 'nhen' && m.hamGoc && m.hamGoc.some(function (h) { return h === 'front_metal' || h === 'front_pole'; }) && Array.isArray(cam) && !cam.some(function (b) { return b.ma === 'tu'; })) {
            m.robot = Object.assign({}, m.robot, { camBien: cam.concat([{ ma: 'tu', o: 'hong' }]) });
          }
        });
      });
    });
    M.mua3 = MUA_3;
    M.roiMua3 = ROI_MUA_3;
    M.tinhLai();
  })();
  // ---------------------------------------------------------------- MÙA 4 = 10 GÓI (29/10, KE-HOACH-MUA-4.md; cùng cách MÙA 3 ở trên, phiên "Mùa 4" tự làm)
  // Dựng SAU khối mùa 3 (lúc đó mọi gói ngoài mùa 1–3 nằm ở mùa 4 cũ). Đổi m.chuong / so / hang và vị trí; KHÔNG đổi `ma` (khóa lưu sao).
  // Chương chưa có màn thì CHƯA hiện; gói không còn chương nào có màn cũng chưa hiện. Ngưỡng sao gói mùa 4 KHÔNG khai cứng (mo-goi.js tính), gói đầu 0 ★.
  // Mùa 4 vẫn ẩn (`an: true`). Gói cũ không thuộc MUA_4 (omni, máy ném, bàn xoay, lắp ráp, đua, các gói đội…) dời sang mùa 5 (ẩn), giữ thứ tự.
  // Xếp màn có sẵn theo part mở dần (KE-HOACH-MUA-4.md mục 2): drone dùng ô sạc P về gói 5 Trạm sạc (đáp đất sạc là nâng cấp, lõi N1 ở P1);
  // máy sơn chấm ô (dot) về gói 2, nét liền (pen_down) về gói 6. Màn camera (mau, che-mau, flycam) tạm giữ color() / look() cũ, dựng lại sau lõi N2.
  var MUA_4 = [
    { ma: 'drone', ten: 'Cất cánh', loai: 'bo-phan', hinh: 'drone',
      // drone: đủ thứ tự 10 màn (man-cat-canh.js): 11 trình diễn · 1 · 2 · 12 · 3 · 13 · 7 · 8 · 9 · 14 trùm
      // list: list.1 thành màn trình diễn (dưới), list.11 màn ép sửa một số (man-cat-canh.js), list.2 (xoắn ốc 28 ô, nhảy đường cong) cất khỏi lộ trình
      chuong: [['drone', day('drone', [11, 1, 2, 12, 3, 13, 7, 8, 9, 14])], ['list', day('list', [1, 11, 3, 6, 4, 7, 9, 5, 8, 10])]] },
    { ma: 'may-son', ten: 'Gieo hạt', loai: 'bo-phan', hinh: 'may-son',
      chuong: [['may-son', day('may-son', [11, 1, 2, 12, 6, 7, 14, 15, 13, 16])], ['che-list', day('che-list', [11, 12, 13, 14, 15, 16, 17, 18, 19, 20])]] },
    // gói 3, 5, 7 (user 30/10 chọn A): màn cũ dạy cảm biến bụng / camera trước / look() / sạc tự động trên P dời sang mùa 5 (gói mau, flycam cũ và MUA_4_CU
    // bên dưới), ba gói dựng bằng màn mới theo luật mới (camera bốn hướng, đáp đất sạc, camera nhìn "here").
    { ma: 'cam-bon', ten: 'Camera bốn hướng', loai: 'bo-phan', hinh: 'cam-bon',
      chuong: [['cam-bon', day('cam-bon', [1, 2, 3, 4, 5, 8, 6, 7, 9, 10])], ['che-cam-bon', day('che-cam-bon', [2, 9, 1, 3, 4, 5, 6, 8, 7, 10])]] },
    { ma: 'pho-mau', ten: 'Luống màu', hinh: 'pho-mau',
      chuong: [['pho-mau', []], ['che-pho-mau', []]] },
    { ma: 'tram-sac', ten: 'Trạm sạc', loai: 'bo-phan', hinh: 'tram-sac',
      chuong: [['tram-sac', []], ['che-drone', day('che-drone', [1, 2, 11, 4, 13, 15, 12, 7, 16, 14])]] },
    { ma: 'net-lien', ten: 'Gieo liền hàng', loai: 'bo-phan', hinh: 'net-lien',
      chuong: [['net-lien', day('net-lien', [1]).concat(day('may-son', [3, 4]), day('net-lien', [2]), day('may-son', [5, 8, 9]), day('net-lien', [3, 4]), day('may-son', [10]))], ['che-may-son', day('che-may-son', [1, 9, 2, 11, 4, 3, 12, 6, 5, 10])]] },
    { ma: 'nhin-duoi', ten: 'Nhìn dưới chân', loai: 'bo-phan', hinh: 'nhin-duoi',
      chuong: [['nhin-duoi', []], ['che-nhin-duoi', day('che-nhin-duoi', [1, 2, 3, 4, 5, 6, 9, 7, 8, 10])]] },
    { ma: 'vuon-cu', ten: 'Vườn cũ rào sắt', loai: 'thu-thach', hinh: 'vuon-cu',
      chuong: [['vuon-cu', []], ['che-vuon-cu', []]] },
    { ma: 'doi-nam-cham', ten: 'Đội chia hàng', loai: 'thu-thach', hinh: 'doi-nam-cham',
      chuong: [['doi-nam-cham', []], ['che-doi-nam-cham', []]] },
    { ma: 'drone-ke-vach', ten: 'Drone nông nghiệp R1', loai: 'thu-thach', hinh: 'drone-ke-vach',
      chuong: [['tong-hop-4', []], ['trum-mua-4', day('trum-mua-4', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])]] }
  ];
  // PDM4c 31/10: gói Gieo từ trên cao (gói 9 cũ; bộ gieo hạt đã gắn dưới bụng drone từ gói 2) CẤT ra mùa ẩn (như CAT_MUA_2 be-sung, CAT_MUA_3 bung-nhen), gói Đội về gói 9, gói 8 là Vườn cũ rào sắt.
  var CAT_MUA_4 = { ma: 'son-tren-cao', ten: 'Gieo từ trên cao (cất)', loai: 'thu-thach', hinh: 'son-tren-cao',
    chuong: [['son-tren-cao', []], ['che-son-tren-cao', []]] };
  // Màn drone cũ dựng quanh sạc tự động trên P và hàm cốt truyện recharge() (bay lên P rồi xuống), cùng che-drone.3 / .6 (nhảy đường cong gói 5): sang mùa 5 (ẩn), đứng TRƯỚC flycam và đội drone vì
  // flycam.6, doi-drone.6, .10, che-doi-drone.10 còn dùng recharge() mà drone.5 tạo. Dựng lại khi tới mùa có đội drone.
  var MUA_4_CU = [
    { ma: 'drone-sac-cu', ten: 'Drone sạc tự động',
      chuong: [['drone-sac-cu', day('drone', [4, 5, 6, 10])], ['che-drone-sac-cu', day('che-drone', [3, 5, 6, 8, 9, 10])]] },
    // Gói 8 (30/10, user: "tối ưu cho hợp tính giáo dục nhất"): giữ thang kỹ năng gốc + bốn màn mới (man-doi-chia-hang.js); bốn màn cũ nhường chỗ sang mùa 5 (ẩn):
    // doi-nam-cham.6 Hai chuyến tự động, .9 Ba trạm (vòng lặp cả đội nay ở che-doi-nam-cham.11), che-doi-nam-cham.4 Ba trạm có hạn, .9 Hốc nhường đường.
    // Gói 2 (30/10, nghiệm thu độc lập + user "làm cả A, B, C"): chương che-list dựng lại trên xe máy sơn (che-list.11 … .20, man-cham-son.js);
    // mười màn đo bãi cũ bằng cảm biến khoảng cách (route, scan, box) sang mùa 5 (ẩn).
    { ma: 'che-list-cu', ten: 'Đo bãi bằng cảm biến',
      chuong: [['che-list-cu', day('che-list', [1, 2, 3, 4, 6, 5, 8, 9, 7, 10])]] },
    // Gói 10 (30/10, nghiệm thu độc lập): hai màn xe cũ che-may-son.7 Lưới chấm, .8 Khung lồng khung (nhịp 37, 44, to hơn trùm cuối mùa, lạc robot của gói)
    // nhường chỗ cho trum-mua-4.8, .9 (drone kẻ vạch: hàm gọi hàm của em) sang mùa 5 (ẩn).
    { ma: 'che-may-son-cu', ten: 'Hoa văn lớn',
      chuong: [['che-may-son-cu', day('che-may-son', [7, 8])]] },
    { ma: 'doi-nam-cham-cu', ten: 'Đội chia hàng: màn dư',
      chuong: [['doi-nam-cham-cu', day('doi-nam-cham', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])], ['che-doi-nam-cham-cu', day('che-doi-nam-cham', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])]] }
  ];
  // Tên chương: việc em làm (KE-HOACH-7-MUA.md "Quy tắc đặt tên và giọng kể").
  var TEN_MUA_4 = { drone: 'Bay lần đầu', list: 'Lập danh sách', 'may-son': 'Gieo từng ô', 'che-list': 'Chế lệnh: gieo theo danh sách', 'che-list-cu': 'Chế lệnh: đi theo danh sách', 'che-may-son-cu': 'Chế lệnh: hoa văn lớn',
    'cam-bon': 'Đọc màu bốn phía', 'che-cam-bon': 'Chế lệnh: dò màu', 'pho-mau': 'Bay giữa luống màu', 'che-pho-mau': 'Chế lệnh: qua luống',
    'tram-sac': 'Đáp đất sạc pin', 'che-drone': 'Chế lệnh: bay xa', 'net-lien': 'Gieo liền một hàng', 'che-may-son': 'Chế lệnh: bồn hoa',
    'nhin-duoi': 'Nhìn xuống đọc màu', 'che-nhin-duoi': 'Chế lệnh: đọc đơn hàng', 'vuon-cu': 'Bay qua vườn cũ', 'che-vuon-cu': 'Chế lệnh: qua vườn cũ',
    'drone-sac-cu': 'Ghé ô sạc', 'che-drone-sac-cu': 'Chế lệnh: sạc dọc đường', 'doi-nam-cham-cu': 'Chia hàng: màn ôn', 'che-doi-nam-cham-cu': 'Chế lệnh: màn ôn', 'doi-nam-cham': 'Chia hàng theo màu', 'che-doi-nam-cham': 'Chế lệnh: giao cho kịp',
    'son-tren-cao': 'Gieo hàng qua rào', 'che-son-tren-cao': 'Chế lệnh: vườn hoa', 'tong-hop-4': 'Đủ bộ', 'trum-mua-4': 'Nông trại mới' };
  // TỆP NGÂN HÀNG MÀN MỚI MÙA 4 (như mùa 3): mỗi gói một tệp hoc/man-<tệp>.js khai ManHoc.<biến> = [màn…], mỗi màn khai `chuong` và `so`.
  //   man-cat-canh.js manCatCanh (1) · man-cham-son.js manChamSon (2) · man-camera-bon-huong.js manCameraBonHuong (3) · man-pho-mau.js manPhoMau (4)
  //   man-tram-sac.js manTramSac (5) · man-net-lien.js manNetLien (6) · man-nhin-duoi-chan.js manNhinDuoiChan (7) · man-vuon-cu.js manVuonCu (8)
  //   man-doi-chia-hang.js manDoiChiaHang (9) · man-son-tren-cao.js manSonTrenCao (cất) · man-trum-mua-4.js manTrumMua4 (10)
  var TEP_MUA_4 = ['manCatCanh', 'manChamSon', 'manCameraBonHuong', 'manPhoMau', 'manTramSac', 'manNetLien', 'manNhinDuoiChan', 'manVuonCu', 'manDoiChiaHang', 'manSonTrenCao', 'manTrumMua4'];
  (function () {
    Object.keys(TEN_MUA_4).forEach(function (c) { TT.ten[c] = TEN_MUA_4[c]; });
    // Cất khỏi lộ trình (ngân hàng giữ nguyên): list.2 xoắn ốc 28 ô ngay màn 2 (nhảy đường cong), trùng ý list.1.
    cat(['list.2']);
    // PDM4a / PDM4b (31/10): nâng cấp drone.7, 8, 9, list.1..10, may-son.1..10 và che-may-son.1..6, 9, 10 sang thân drone R1.
    var SUA_MUA_4 = Object.assign({}, M.suaCatCanh || {}, M.suaChamSon || {}, M.suaNetLien || {});
    Object.keys(SUA_MUA_4).forEach(function (ma) {
      var m = get(ma), s = SUA_MUA_4[ma];
      delete m.vatChat; delete m.vatMau; delete m.vatCan; delete m.chinhCoDinh; delete m.chiChay; delete m.pin;
      delete m.loiGiaiKhac; delete m.congThucKhac;
      sua(ma, s);
      if (s.loiGiaiKhac) m.loiGiaiKhac = s.loiGiaiKhac;
      if (s.congThucKhac) m.congThucKhac = s.congThucKhac;
      if (m.chuong === 'che-may-son' && m.so < 10) m.chinhCoDinh = true;
      M.chuanHoa(m);
    });
    // PDM4b (31/10): các màn có sẵn của che-drone ở gói 5 gắn đủ thân drone + bộ gieo hạt bụng + camera-4.
    ['che-drone.1', 'che-drone.2', 'che-drone.4', 'che-drone.7'].forEach(function (ma) {
      var m = get(ma);
      m.robot = { than: 'drone', tay: 'son', camBien: [{ ma: 'camera-4', o: 'tren' }] };
      m.hamGoc = ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'ink', 'dot', 'land', 'take_off', 'color'];
    });
    M.danhSach.forEach(function (m) { if (!nguon[m.ma]) nguon[m.ma] = copy(m); });
    var moi = [], chuong = [], chuongCat4 = CAT_MUA_4.chuong.map(function (c) { return c[0]; });
    MUA_4.concat([CAT_MUA_4]).forEach(function (g) { g.chuong.forEach(function (c) { chuong.push(c[0]); }); });
    TEP_MUA_4.forEach(function (k) { moi = moi.concat(M[k] || []); });
    moi.forEach(function (m) { if (chuong.indexOf(m.chuong) < 0) throw new Error('Màn mới mùa 4 thuộc chương không có trong MUA_4: ' + m.chuong + '.' + m.so); });
    chuong.forEach(function (c) { if (TT.thuTu.indexOf(c) < 0) TT.thuTu.push(c); });
    M.them(moi);
    moi.forEach(function (m) { nguon[m.ma] = copy(m); });
    MUA_4.concat([CAT_MUA_4]).forEach(function (g) {
      g.chuong.forEach(function (c) {
        var them = moi.filter(function (m) { return m.chuong === c[0] && c[1].indexOf(m.ma) < 0; }).sort(function (a, b) { return a.so - b.so; }).map(function (m) { return m.ma; });
        var cuoi = c[1][c[1].length - 1];
        c[1] = cuoi && (nguon[cuoi] || get(cuoi)).hang === 'trum' ? c[1].slice(0, -1).concat(them, [cuoi]) : c[1].concat(them);
      });
    });
    var chuongMua4 = [], coMan = [], da = {}, chuongCu = {};
    MUA_4.concat(MUA_4_CU, [CAT_MUA_4]).forEach(function (g) {
      g.chuong.forEach(function (c) {
        if (MUA_4.indexOf(g) >= 0) chuongMua4.push(c[0]);
        c[1].forEach(function (ma) { if (da[ma]) throw new Error('Màn xếp hai lần (mùa 4): ' + ma); da[ma] = true; chuongCu[get(ma).chuong] = true; });
      });
    });
    MUA_4.forEach(function (g) { g.chuong.forEach(function (c) { if (c[1].length) { dungChuong(c[0], c[1]); coMan.push(c[0]); } }); });
    CAT_MUA_4.chuong.forEach(function (c) { dungChuong(c[0], c[1]); });
    // (Từ 30/10 tối các màn này nằm ở che-list-cu, mùa 5 ẩn; giữ bãi khít cho khớp ngưỡng sao trong lo-trinh-sao.js.)
    // Gói 2 (30/10, đường cong): màn đo bằng cảm biến ở che-list (bản một sân của lộ trình) đứng trên bãi trống 7 × 7 dù xe chỉ đi một vòng chữ nhật nhỏ,
    // nên số ô nhảy 12 → 47 ngay màn đầu. Bãi thu vừa khít (giữ luật của PHONG ở man-che-list.js: tường mốc cuối hai cạnh đầu, ô ngay sau chỗ dừng ở hai cạnh sau
    // vẫn trống để cảm biến không dừng được xe, nên vẫn phải nhớ số đã đo) và lớn dần theo thứ tự 4 → 6 → 5 → 8 → 9: bãi 2×1, 4×1, vuông 2, 2×3, 4×3.
    // Vuông cạnh 2 (không phải 3): lời sai "đi cố định 3 ô mỗi cạnh" của che-list.5 phải thua (bản ba sân trong man-che-list.js có cạnh 2, 3, 4).
    var BAI_KHIT = {
      "che-list.4": {"san":[".....","....#",".....","...#."],"batDau":{"x":1,"y":1,"huong":1},"bongMo":{"x":1,"y":1,"huong":1,"diQua":[{"x":3,"y":1},{"x":3,"y":2},{"x":1,"y":2}]}},
      "che-list.6": {"san":[".......","......#",".......",".....#."],"batDau":{"x":1,"y":1,"huong":1},"bongMo":{"x":1,"y":1,"huong":1,"diQua":[{"x":5,"y":1},{"x":5,"y":2},{"x":1,"y":2}]}},
      "che-list.5": {"san":[".....","....#",".....","....."],"batDau":{"x":1,"y":1,"huong":1},"bongMo":{"x":1,"y":1,"huong":0,"diQua":[{"x":3,"y":1},{"x":3,"y":3},{"x":1,"y":3}]}},
      "che-list.8": {"san":[".....","....#",".....",".....",".....","...#."],"batDau":{"x":1,"y":1,"huong":1},"bongMo":{"x":1,"y":1,"huong":1,"diQua":[{"x":3,"y":1},{"x":3,"y":4},{"x":1,"y":4}]}},
      "che-list.9": {"san":[".......","......#",".......",".......",".......",".....#."],"batDau":{"x":1,"y":1,"huong":1},"bongMo":{"x":1,"y":1,"huong":1,"diQua":[{"x":5,"y":1},{"x":5,"y":4},{"x":1,"y":4}]}}
    };
    Object.keys(BAI_KHIT).forEach(function (ma) { Object.assign(get(ma), copy(BAI_KHIT[ma])); });
    // Ranh gói 5 / 6 (30/10): đầu chương net-lien là sân trống rộng hơn bài cần (may-son.3 6 × 3 chỉ kẻ một nét hàng giữa; may-son.4 5 × 5 kẻ một góc vuông).
    // Bít góc xe không đi tới: may-son.3 hai góc trên (18 → 16 ô, sau che-drone.16 10 ô), may-son.4 góc dưới trái (25 → 24 ô). Lời giải và lời sai giữ nguyên.
    get('may-son.3').san = ['#....#', '......', '......'];
    get('may-son.4').san = ['.....', '.....', '.....', '.....', '#....'];
    // Gói 8 (30/10, đường cong): doi-nam-cham.8 Bó tay cho sớm mở hai ô THỪA cạnh R2 (robot không đi tới, không nằm trên đường tránh của R1; 6 → 8 ô)
    // cho che-doi-nam-cham.11 (14 ô) đứng sau không nhảy.
    get('doi-nam-cham.8').san = ['#####', '##D##', '##..#', '##..#', '#..##', '##o##', '#####'];
    // Vỏ hình mùa 4 (30/10, user: "Đổi sang nông nghiệp"): Nông trại hoa, luật giữ nguyên; san-ve.js đọc vo: cỏ, luống hoa, bụi cây, bao hạt (ve-vector-nong-trai.js).
    MUA_4.concat([CAT_MUA_4]).forEach(function (g) { g.chuong.forEach(function (c) { c[1].forEach(function (ma) { get(ma).vo = 'nong-trai'; }); }); });
    // Lời mùa 4 theo vỏ Nông trại hoa (30/10) + giọng CLB (Sola nhờ, Luna gợi ý, gọi người chơi là "bạn"; hoc/KE-HOACH-PHIM-CLB.md mục 1): bảng từ theo thứ tự
    // (cụm dài trước), khớp trọn từ; chữ đầu viết hoa giữ hoa. LOI_NONG_TRAI (bên dưới) thay hẳn câu nào bảng từ làm vụng.
    var TU_NONG_TRAI = [
      ['gói Nét liền', 'gói Gieo liền hàng'], ['gói Phố màu', 'gói Luống màu'], ['gói Chấm sơn', 'gói Gieo hạt'], ['gói Sơn từ trên cao', 'gói Gieo từ trên cao'],
      ['lá cờ trên tường nhà', 'bồn hoa hình lá cờ'], ['biển báo phố', 'bồn hoa cổng trại'], ['vạch sọc', 'luống xen màu'], ['chọn sơn', 'chọn hạt'], ['sang sơn', 'sang hạt'],
      ['hộp hàng', 'bao hạt'], ['tầng hầm', 'hàng dưới'], ['tầng thượng', 'nóc kho'], ['ngôi nhà', 'luống hoa'], ['dãy nhà', 'dãy luống hoa'],
      ['drone kẻ vạch R1', 'drone nông nghiệp R1'], ['bức tường', 'vườn hoa'], ['bức tranh hoa văn', 'bồn hoa'], ['hoa văn xanh lá', 'cỏ ba lá'], ['viền hoa văn', 'viền hoa'], ['hoa văn', 'cỏ ba lá'],
      ['mái nhà', 'mái kho'], ['vạch kẻ đường', 'luống hoa'], ['có sơn', 'có hoa'], ['vẽ bậy', 'gieo nhầm'], ['thành phố', 'nông trại'], ['tranh tường', 'vườn hoa'], ['bức tranh', 'bồn hoa'], ['tranh', 'bồn hoa'], ['biển báo', 'bồn hoa'],
      ['máy sơn', 'bộ gieo hạt'], ['đầu sơn', 'miệng gieo'], ['màu sơn', 'loại hạt'], ['chấm sơn', 'gieo hạt'], ['sơn sẵn', 'gieo sẵn'], ['ô đã sơn', 'ô đã gieo'],
      ['kẻ vạch', 'gieo luống'], ['vạch kẻ', 'luống'], ['vạch đứt', 'luống đứt quãng'], ['vạch mờ', 'luống mờ'], ['lề đường', 'bờ luống'], ['con phố', 'lối đi'], ['dải phân cách', 'hàng rào'],
      ['nét liền', 'hàng liền'], ['bút liền', 'gieo liền'], ['hạ bút', 'hạ miệng gieo'], ['nhấc bút', 'nhấc miệng gieo'], ['hình mờ', 'luống mờ'], ['khung vuông', 'viền vuông'],
      ['khung chữ nhật', 'viền chữ nhật'], ['khung quanh', 'viền quanh'], ['tô lại', 'gieo lại'],
      ['chấm đỏ', 'gieo hoa đỏ'], ['chấm vàng', 'gieo hoa vàng'], ['chấm xanh', 'gieo hoa xanh'], ['nhà cao', 'bụi cây cao'], ['ngoài hình', 'ngoài luống'],
      ['sơn', 'gieo'], ['tô', 'gieo'], ['chấm', 'gieo'], ['kẻ', 'gieo'], ['vạch', 'luống'], ['phố', 'lối đi'], ['nhà', 'luống'], ['nét', 'hàng'], ['bút', 'miệng gieo'], ['sọc', 'hàng'],
      ['hộp', 'bao hạt'], ['tường', 'bụi cây'], ['vẽ', 'gieo'], ['khung', 'viền'], ['bức', 'bồn'],
      ['chương trình có sẵn', 'chương trình Sola viết sẵn']
    ];
    var CHU_CAI = '\\p{L}';      // biên từ tiếng Việt (cờ u)
    function hoaDau(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
    function chuNongTrai(s) {
      if (typeof s !== 'string') return s;
      // "chấm" là DANH TỪ (một chấm, chấm thứ hai…) thì thành "bông" (bông hoa), trước khi bảng từ đổi động từ "chấm" thành "gieo"
      s = s.replace(/(^|[^\p{L}])(một|hai|ba|bốn|năm|sáu|bảy|tám|chín|mười|n|mỗi|các|những|từng|đủ|mấy|vài) chấm(?![\p{L}])/giu, '$1$2 bông')
        .replace(/(^|[^\p{L}])(C|c)hấm (thứ|cuối|đầu|nọ|kia)(?![\p{L}])/gu, function (a, truoc, c, sau) { return truoc + (c === 'C' ? 'Bông ' : 'bông ') + sau; });
      TU_NONG_TRAI.forEach(function (c) {
        [[c[0], c[1]], [hoaDau(c[0]), hoaDau(c[1])]].forEach(function (d) {
          s = s.replace(new RegExp('(^|[^' + CHU_CAI + '])' + d[0] + '(?![' + CHU_CAI + '])', 'gu'), function (a, truoc) { return truoc + d[1]; });
        });
      });
      s = s.replace(/ — /g, ': ');      // không gạch dài trong chữ hiển thị
      s = s.replace(/(H|h)ạ miệng gieo gieo/g, '$1ạ miệng gieo rồi gieo').replace(/Miệng gieo gieo/g, 'Miệng gieo hạ là gieo');
      return s.replace(/(^|[^\p{L}])(E|e)m(?=[^\p{L}]|$)/gu, function (a, truoc, e, vt, chuoi) {
        return /hàm của $/i.test(chuoi.slice(0, vt + truoc.length)) ? a : truoc + (e === 'E' ? 'Bạn' : 'bạn');
      });
    }
    function loiNongTrai(m) {
      if (!m || m._loiNongTrai) return;
      m._loiNongTrai = true;
      var rieng = LOI_NONG_TRAI[m.ma] || {};
      ['ten', 'deBai', 'veMaMau'].forEach(function (k) { if (rieng[k]) m[k] = rieng[k]; else if (m[k]) m[k] = chuNongTrai(m[k]); });
      if (m.deBai && !rieng.deBai) {
        var d = m.deBai, mo = m.chiChay ? 'Sola làm mẫu: ' : /^Sửa/.test(m.ten || '') ? 'Sola viết vội, nhờ bạn sửa: ' : 'Sola nhờ bạn: ';
        if (/^\p{Lu}/u.test(d) && !/^\p{Lu}[\p{Lu}\d]/u.test(d) && !/^(Sola|Luna)(?!\p{L})/u.test(d)) d = d.charAt(0).toLowerCase() + d.slice(1);
        m.deBai = mo + d;
      }
      if (m.goiY) m.goiY = (rieng.goiY || m.goiY.map(chuNongTrai)).map(function (s) { return 'Luna: ' + s; });
      (m.loiSai || []).forEach(function (x) { if (x.moTa) x.moTa = chuNongTrai(x.moTa); });
      if (m.loiGiaiKhac && m.loiGiaiKhac.moTa) m.loiGiaiKhac.moTa = chuNongTrai(m.loiGiaiKhac.moTa);
      (m.congThucKhac || []).forEach(function (x) { if (x.moTa) x.moTa = chuNongTrai(x.moTa); });
    }
    var LOI_NONG_TRAI = {
      // Bốn màn cuối chương trùm: "phố" ở đây là LUỐNG hoa drone gieo (field_row = gieo một luống rồi về đầu hàng dưới), không phải lối đi.
      'trum-mua-4.7': { ten: 'Hàm gieo luống', deBai: 'Sola nhờ bạn: hai ngày làm việc, chế field_row(c, n): gieo luống màu c bằng span_sow(c, n), bay xuống hai ô, rồi bay trái n ô về đầu hàng. Chương trình chính đã khóa: đọc màu c ở ô đầu, gieo ba luống c, xanh dương, c.' },
      'trum-mua-4.8': { ten: 'Luống có trạm sạc', deBai: 'Sola nhờ bạn: hai ngày làm việc, chế field_dock(c, n): gieo một luống bằng field_row(c, n), rồi gọi charge_if(9) ở đầu hàng mới. Chương trình chính đã khóa: luống vàng, luống xanh dương, rồi hàng vàng cuối. ' +
        'Hai sân cùng cánh đồng, drone pin 20 và pin 40: sân pin ít phải ghé trạm, sân pin nhiều thì bay luôn.' },
      'trum-mua-4.9': { ten: 'Hai luống theo dấu' },
      'trum-mua-4.10': { deBai: 'Sola nhờ bạn: trùm cuối mùa, hai ngày làm việc, Drone nông nghiệp R1 nhận ca đầu tiên ở nông trại mới. Chép bảng mẫu hàng trên xuống bằng sow_up(4), sạc khi pin yếu ở trạm, gieo hoa vàng các dấu trên luống, sạc lần nữa, ' +
        'gieo hoa đỏ, vàng, đỏ ở hàng dưới từ phải sang trái, bay trái thêm một ô tới trạm thứ ba, sạc, rồi gieo luống xanh dương năm ô ở hàng cuối bằng span_sow("blue", 4). Tự viết chương trình chính bằng các hàm bạn đã chế.' },
      'che-may-son.10': { ten: 'Ba bồn hoa' }
    };
    MUA_4.concat([CAT_MUA_4]).forEach(function (g) { g.chuong.forEach(function (c) { c[1].forEach(function (ma) { loiNongTrai(get(ma)); }); }); });
    // Huy hiệu (30/10): mỗi chương mùa 4 trao huy hiệu MÃ CHƯƠNG ở màn trùm (cuối chương), như mùa 2; chương trum-mua-4 trao huy hiệu cỗ máy drone-ke-vach
    // (trùm cuối mùa). Màn khác trong chương không trao (màn có sẵn mang huy hiệu cũ, vd may-son.10 ở chương net-lien, đổi theo chương mới).
    MUA_4.concat([CAT_MUA_4]).forEach(function (g) {
      g.chuong.forEach(function (c) {
        c[1].forEach(function (ma, i) {
          var m = get(ma);
          if (i < c[1].length - 1) { delete m.huyHieu; return; }
          m.huyHieu = c[0] === 'trum-mua-4' ? { ma: 'drone-ke-vach', ten: 'Huy hiệu Drone nông nghiệp R1' } : { ma: c[0], ten: 'Huy hiệu ' + TEN_MUA_4[c[0]] };
        });
      });
    });
    // Gói 8 Đội chia hàng (30/10, phương án A): camera trước cũ (color() đọc ô trước mặt) thành camera bốn hướng mùa 4: mọi chữ trong màn đổi color() → color("front"),
    // hàm cốt truyện sort_color (che-mau.6, nay ở mùa 5) → sort_by_color (gói 3 che-cam-bon tạo, cùng việc); robot gắn camera-4 thay camera. Gói đội mùa 5 vẫn dùng sort_color cũ.
    function doiChu(x) {
      if (typeof x === 'string') return x.replace(/sort_color/g, 'sort_by_color').replace(/\bcolor\(\)/g, 'color("front")');
      if (Array.isArray(x)) return x.map(doiChu);
      if (x && typeof x === 'object') { Object.keys(x).forEach(function (k) { x[k] = doiChu(x[k]); }); return x; }
      return x;
    }
    function doiCam(r) { if (r && r.camBien) r.camBien = r.camBien.map(function (c) { return c && c.ma === 'camera' ? { ma: 'camera-4', o: c.o } : c; }); }
    M.danhSach.forEach(function (m) {
      if (!/^(?:che-)?doi-nam-cham\.(?:[1-9]|10)$/.test(m.ma)) return;
      ['deBai', 'veMaMau', 'goiY', 'maMau', 'loiGiai', 'loiGiaiKhac', 'loiSai', 'congThucKhac', 'hamCuaEmCan', 'doi'].forEach(function (k) { if (m[k] !== undefined) m[k] = doiChu(m[k]); });
      doiCam(m.robot);
      (m.doi || []).forEach(function (d) { doiCam(d.robot); if (d.camBien) doiCam(d); });
      if (m.camBien) doiCam(m);
    });
    // Màn cũ dời sang mùa 5 (MUA_4_CU): chương chứa đứng trước gói cũ đầu tiên có flycam / mau (thứ tự lộ trình), gói vào TT.goi như gói mùa 4 cũ (vòng dưới dời sang mùa 5).
    MUA_4_CU.forEach(function (g) {
      var chCu = g.chuong.map(function (c) { dungChuong(c[0], c[1]); return c[0]; });
      var mocC = TT.thuTu.indexOf('flycam') >= 0 ? TT.thuTu.indexOf('flycam') : TT.thuTu.length;
      TT.thuTu.splice.apply(TT.thuTu, [mocC, 0].concat(chCu));
      chCu.forEach(function (c) { if (TEN_MUA_4[c]) TT.ten[c] = TEN_MUA_4[c]; });
      var mocG = TT.goi.findIndex(function (x) { return x.chuong.indexOf('flycam') >= 0; });
      TT.goi.splice(mocG >= 0 ? mocG : TT.goi.length, 0, { ma: g.ma, ten: g.ten, mua: 'mua-4', chuong: chCu });
    });
    // Chương cũ bị chia (drone → drone + tram-sac, may-son → may-son + net-lien) không được còn sót màn ngoài MUA_4.
    M.danhSach.forEach(function (m) {
      if ((chuongCu[m.chuong] || chuongMua4.indexOf(m.chuong) >= 0) && !da[m.ma]) throw new Error('Màn ' + m.ma + ' nằm ở chương mùa 4 ' + m.chuong + ' mà không có trong MUA_4');
    });
    // thuTu: mùa 1–3, chương mùa 4 có màn, rồi phần còn lại giữ thứ tự cũ.
    var goi123 = TT.goi.filter(function (g) { return g.mua === 'mua-1' || g.mua === 'mua-2' || g.mua === 'mua-3'; });
    var c123 = [];
    goi123.forEach(function (g) { c123 = c123.concat(g.chuong); });
    var sau = TT.thuTu.filter(function (c) { return c123.indexOf(c) < 0 && chuongMua4.indexOf(c) < 0; });
    TT.thuTu.splice.apply(TT.thuTu, [0, TT.thuTu.length].concat(c123, coMan, sau));
    // Gói: mùa 1–3, MUA_4, rồi gói còn lại (mùa 4 cũ → mùa 8, ẩn; gói cũ chỉ còn chương không thuộc mùa 4).
    var conLai = [], doi5 = [];
    TT.goi.forEach(function (g) {
      if (goi123.indexOf(g) >= 0) return;
      var ch = g.chuong.filter(function (c) { return chuongMua4.indexOf(c) < 0; });
      if (!ch.length) return;
      g.chuong = ch;
      if (g.mua === 'mua-4') { g.mua = 'mua-8'; doi5.push(g); }
      conLai.push(g);
    });
    // PDM4c: gói cất của mùa 4 (Gieo từ trên cao) sang mùa 8 ẩn như CAT_MUA_2, CAT_MUA_3 (khongTangNguong: ngưỡng = gói trước + 30).
    var goiCat4 = { ma: CAT_MUA_4.ma, ten: CAT_MUA_4.ten, loai: CAT_MUA_4.loai, hinh: CAT_MUA_4.hinh, mua: 'mua-8', khongTangNguong: true, chuong: chuongCat4 };
    conLai.push(goiCat4);
    doi5.push(goiCat4);
    conLai.sort(function (a, b) { return TT.thuTu.indexOf(a.chuong[0]) - TT.thuTu.indexOf(b.chuong[0]); });
    // Ngưỡng gói dời sang mùa 8 (ẩn): như mùa 3 làm với gói dời sang mùa 4 (0,5 × tổng sao tối đa các gói thường đứng trước, bội 5; gói đội = trước + 30).
    var tr5 = 0, truoc5 = null;
    doi5.forEach(function (g) {
      g.sao = g.khongTangNguong && truoc5 ? truoc5.sao + 30 : Math.floor(0.5 * tr5 / 5) * 5;
      if (!g.khongTangNguong) tr5 += 3 * g.chuong.reduce(function (s, c) { return s + M.danhSach.filter(function (m) { return m.chuong === c; }).length; }, 0);
      truoc5 = g;
    });
    var goi4 = [];
    MUA_4.forEach(function (g) {
      var ch = g.chuong.map(function (c) { return c[0]; }).filter(function (c) { return coMan.indexOf(c) >= 0; });
      if (!ch.length) return;
      var x = { ma: g.ma, ten: g.ten, mua: 'mua-6', chuong: ch };
      if (g.loai) x.loai = g.loai;
      if (g.hinh) x.hinh = g.hinh;
      goi4.push(x);
    });
    TT.goi.splice.apply(TT.goi, [0, TT.goi.length].concat(goi123, goi4, conLai));
    var dau5 = TT.goi.filter(function (g) { return g.mua === 'mua-8'; })[0];
    if (dau5) dau5.sao = 0;
    // Khay theo gói (như mùa 3): bút liền (pen_down / pen_up) chỉ từ gói 6. Chỉ bớt lệnh trên khay (hamGoc), phần cứng vẫn đủ.
    MUA_4.forEach(function (g, i) {
      if (i + 1 >= 6) return;
      var bo = ['pen_down', 'pen_up'];
      g.chuong.forEach(function (c) {
        c[1].forEach(function (ma) {
          var m = get(ma);
          if (m.hamGoc && m.hamGoc.some(function (h) { return bo.indexOf(h) >= 0; })) m.hamGoc = m.hamGoc.filter(function (h) { return bo.indexOf(h) < 0; });
        });
      });
    });
    // may-son.6 ở gói 2 (Chấm sơn, chưa có bút liền): bỏ lời sai mẫu "hạ đầu sơn" (nó chỉ còn báo "hàm chưa có").
    get('may-son.6').loiSai = (get('may-son.6').loiSai || []).filter(function (x) { return !/^Hạ (đầu sơn|miệng gieo)/.test(x.moTa); });      // 30/10 vỏ nông trại: lời đã đổi sang miệng gieo
    M.mua4 = MUA_4;
    M.tinhLai();
  })();

  // ================================================================ MÙA 6 "MỎ ĐÁ" = 10 GÓI (PDM6a 31/10: gói 1–4 dựng trên Máy mỏ đá R1 thân omni)
  var MUA_6 = [
    { ma: 'omni', ten: 'Bánh omni', loai: 'bo-phan', hinh: 'omni',
      chuong: [['omni', day('omni', [11, 1, 2, 3, 4, 5, 7, 8, 9, 12])], ['luoi-2d', []]] },
    { ma: 'may-nem', ten: 'Tay hất đá', loai: 'bo-phan', hinh: 'may-nem',
      chuong: [['may-nem', []], ['che-may-nem', []]] },
    { ma: 'radar-tron', ten: 'Radar tròn', loai: 'bo-phan', hinh: 'radar-tron',
      chuong: [['radar-tron', []], ['che-radar-tron', []]] },
    { ma: 'ban-xoay', ten: 'Bàn xoay & Sàn dốc', hinh: 'ban-xoay',
      chuong: [['ban-xoay', []], ['che-ban-xoay', []]] },
    { ma: 'di-cheo', ten: 'Đi chéo', loai: 'bo-phan', hinh: 'di-cheo',
      chuong: [['di-cheo', []], ['che-di-cheo', []]] },
    { ma: 'chinh-luc', ten: 'Chỉnh lực hất', loai: 'bo-phan', hinh: 'chinh-luc',
      chuong: [['chinh-luc', []], ['che-chinh-luc', []]] },
    { ma: 'nhan-dang', ten: 'Nhận dạng mỏ', loai: 'bo-phan', hinh: 'nhan-dang',
      chuong: [['nhan-dang', []], ['che-nhan-dang', []]] },
    { ma: 'mo-cu', ten: 'Mỏ đá cũ', loai: 'thu-thach', hinh: 'mo-cu',
      chuong: [['mo-cu', []], ['che-mo-cu', []]] },
    { ma: 'doi-omni', ten: 'R2 ở mỏ đá', loai: 'thu-thach', hinh: 'doi-omni',
      chuong: [['doi-omni', []], ['che-doi-omni', []]] },
    { ma: 'may-mo-da', ten: 'Máy mỏ đá R1', loai: 'thu-thach', hinh: 'may-mo-da',
      chuong: [['tong-hop-6', []], ['trum-mua-6', []]] }
  ];
  var MUA_6_CU = [
    { ma: 'ban-xoay-cu', ten: 'Bàn xoay xe cũ', moc: 'doi-ho-bang', khongTangNguong: true,
      chuong: [['ban-xoay-cu', day('ban-xoay', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])], ['che-ban-xoay-cu', day('che-ban-xoay', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])]] },
    { ma: 'omni-cu', ten: 'Omni gắp cũ', moc: 'doi-omni',
      chuong: [['omni-cu', day('omni', [6, 10])], ['che-omni', day('che-omni', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])]] },
    { ma: 'doi-omni-cu', ten: 'Đội omni xích cũ', moc: 'doi-omni', khongTangNguong: true,
      chuong: [['doi-omni-cu', day('doi-omni', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])], ['che-doi-omni-cu', day('che-doi-omni', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])]] },
    { ma: 'may-nem-xe', ten: 'Máy ném xe cũ', moc: 'doi-gap-nem',
      chuong: [['may-nem-xe', day('may-nem', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])], ['che-may-nem-xe', day('che-may-nem', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])]] }
  ];
  var TEN_MUA_6 = {
    omni: 'Trượt ngang bậc đá', 'luoi-2d': 'Đọc bản đồ mỏ',
    'may-nem': 'Hất đá qua rào', 'che-may-nem': 'Chế lệnh: hất đá',
    'radar-tron': 'Quét quanh một vòng', 'che-radar-tron': 'Chế lệnh: quét mỏ',
    'ban-xoay': 'Lấp hố, trượt dốc', 'che-ban-xoay': 'Chế lệnh: vượt mỏ đá',
    'di-cheo': 'Lách chéo vách đá', 'che-di-cheo': 'Chế lệnh: đi chéo',
    'chinh-luc': 'Hất gần, hất xa', 'che-chinh-luc': 'Chế lệnh: hất đúng tầm',
    'nhan-dang': 'Đá tròn hay quặng?', 'che-nhan-dang': 'Chế lệnh: lọc quặng',
    'mo-cu': 'Vượt mỏ đá cũ', 'che-mo-cu': 'Chế lệnh: mở cổng mỏ',
    'doi-omni': 'Drone dò vách đá', 'che-doi-omni': 'Chế lệnh: đội mỏ đá',
    'tong-hop-6': 'Tổng hợp mỏ đá', 'trum-mua-6': 'Máy mỏ đá R1',
    'omni-cu': 'Omni gắp cũ', 'doi-omni-cu': 'Đội omni và xích cũ', 'che-doi-omni-cu': 'Chế lệnh: đội omni cũ',
    'may-nem-xe': 'Máy ném xe cũ', 'che-may-nem-xe': 'Chế lệnh: máy ném xe cũ',
    'ban-xoay-cu': 'Bàn xoay xe cũ', 'che-ban-xoay-cu': 'Chế lệnh: bàn xoay xe cũ'
  };
  var TEP_MUA_6 = ['manLuoi2D', 'manHatDa', 'manRadarTron', 'manSanMoDa', 'manDiCheo', 'manChinhLuc', 'manNhanDang', 'manMoCu', 'manDoiOmniMoi', 'manTrumMua6'];
  (function () {
    Object.keys(TEN_MUA_6).forEach(function (c) { TT.ten[c] = TEN_MUA_6[c]; });
    var moi = [], chuong = [];
    MUA_6.forEach(function (g) { g.chuong.forEach(function (c) { chuong.push(c[0]); }); });
    TEP_MUA_6.forEach(function (k) { moi = moi.concat(M[k] || []); });
    moi.forEach(function (m) {
      if (chuong.indexOf(m.chuong) < 0) throw new Error('Màn mới mùa 6 thuộc chương không có trong MUA_6: ' + m.chuong + '.' + m.so);
      if (TT.thuTu.indexOf(m.chuong) < 0) TT.thuTu.push(m.chuong);
    });
    M.them(moi);
    moi.forEach(function (m) { nguon[m.ma] = copy(m); });
    MUA_6.forEach(function (g) {
      g.chuong.forEach(function (c) {
        var them = moi.filter(function (m) { return m.chuong === c[0] && c[1].indexOf(m.ma) < 0; }).sort(function (a, b) { return a.so - b.so; }).map(function (m) { return m.ma; });
        var cuoi = c[1][c[1].length - 1];
        c[1] = cuoi && (nguon[cuoi] || get(cuoi)).hang === 'trum' ? c[1].slice(0, -1).concat(them, [cuoi]) : c[1].concat(them);
      });
    });
    // Chuẩn hóa robot của các màn omni có sẵn ở gói 1 (thân omni nguyên bản, không tay, không cảm biến).
    day('omni', [1, 2, 3, 4, 5, 7, 8, 9]).forEach(function (ma) {
      var m = get(ma);
      if (m) m.robot = { than: 'omni', tay: null, camBien: [] };
    });
    var coMan6 = [];
    MUA_6.forEach(function (g) {
      g.chuong.forEach(function (c) {
        if (!c[1].length) return;
        if (TT.thuTu.indexOf(c[0]) < 0) TT.thuTu.push(c[0]);
        dungChuong(c[0], c[1]);
        coMan6.push(c[0]);
        c[1].forEach(function (ma, i) {
          var m = get(ma);
          if (i < c[1].length - 1) delete m.huyHieu;
          else m.huyHieu = { ma: c[0], ten: 'Huy hiệu ' + TEN_MUA_6[c[0]] };
        });
      });
    });
    MUA_6_CU.forEach(function (g) {
      var chCu = g.chuong.map(function (c) {
        if (TT.thuTu.indexOf(c[0]) < 0) TT.thuTu.push(c[0]);
        dungChuong(c[0], c[1]);
        return c[0];
      });
      chCu.forEach(function (c) {
        var idx = TT.thuTu.indexOf(c);
        if (idx >= 0) TT.thuTu.splice(idx, 1);
      });
      var mocC = TT.thuTu.indexOf(g.moc) >= 0 ? TT.thuTu.indexOf(g.moc) : TT.thuTu.length;
      TT.thuTu.splice.apply(TT.thuTu, [mocC, 0].concat(chCu));
      var mocG = TT.goi.findIndex(function (x) { return x.chuong.indexOf(g.moc) >= 0; });
      TT.goi.splice(mocG >= 0 ? mocG : TT.goi.length, 0, { ma: g.ma, ten: g.ten, mua: 'mua-8', chuong: chCu, khongTangNguong: g.khongTangNguong });
    });
    var goiTruoc6 = TT.goi.filter(function (g) { return g.mua === 'mua-1' || g.mua === 'mua-2' || g.mua === 'mua-3' || g.mua === 'mua-6'; });
    var cTruoc6 = [];
    goiTruoc6.forEach(function (g) { cTruoc6 = cTruoc6.concat(g.chuong); });
    var sau6 = TT.thuTu.filter(function (c) { return cTruoc6.indexOf(c) < 0 && coMan6.indexOf(c) < 0; });
    TT.thuTu.splice.apply(TT.thuTu, [0, TT.thuTu.length].concat(cTruoc6, coMan6, sau6));
    var chCuAll = [];
    MUA_6_CU.forEach(function (g) { g.chuong.forEach(function (c) { chCuAll.push(c[0]); }); });
    var conLai6 = [];
    TT.goi.forEach(function (g) {
      if (goiTruoc6.indexOf(g) >= 0) return;
      var laGoiCu = MUA_6_CU.some(function (x) { return x.ma === g.ma; });
      var ch = g.chuong.filter(function (c) { return coMan6.indexOf(c) < 0 && (laGoiCu || chCuAll.indexOf(c) < 0); });
      if (!ch.length) return;
      g.chuong = ch;
      conLai6.push(g);
    });
    conLai6.sort(function (a, b) { return TT.thuTu.indexOf(a.chuong[0]) - TT.thuTu.indexOf(b.chuong[0]); });
    var tr7 = 0, truoc7 = null;
    conLai6.forEach(function (g) {
      g.sao = g.khongTangNguong && truoc7 ? truoc7.sao + 30 : Math.floor(0.5 * tr7 / 5) * 5;
      if (!g.khongTangNguong) tr7 += 3 * g.chuong.reduce(function (s, c) { return s + M.danhSach.filter(function (m) { return m.chuong === c; }).length; }, 0);
      truoc7 = g;
    });
    if (conLai6[0]) conLai6[0].sao = 0;
    var goi6 = [];
    MUA_6.forEach(function (g) {
      var ch = g.chuong.map(function (c) { return c[0]; }).filter(function (c) { return coMan6.indexOf(c) >= 0; });
      if (!ch.length) return;
      var x = { ma: g.ma, ten: g.ten, mua: 'mua-7', chuong: ch };
      if (g.loai) x.loai = g.loai;
      if (g.hinh) x.hinh = g.hinh;
      goi6.push(x);
    });
    TT.goi.splice.apply(TT.goi, [0, TT.goi.length].concat(goiTruoc6, goi6, conLai6));
    var dau7 = TT.goi.filter(function (g) { return g.mua === 'mua-8'; })[0];
    if (dau7) dau7.sao = 0;
    M.mua6 = MUA_6;
    M.tinhLai();
  })();
  // ========================================================================= MÙA CẢNG SÔNG (mua-4, Cần cẩu container R1)
  var MUA_CANG = [
    { ma: 'can-cau', ten: 'Cần cẩu cảng', loai: 'bo-phan', hinh: 'can-cau',
      chuong: [['can-cau', []], ['so-am', []]] },
    { ma: 'moc-cau', ten: 'Móc cẩu container', loai: 'bo-phan', hinh: 'moc-cau',
      chuong: [['moc-cau', []], ['chia-du', []]] },
    { ma: 'quet-ma', ten: 'Đầu đọc mã container', loai: 'bo-phan', hinh: 'quet-ma',
      chuong: [['quet-ma', []], ['che-quet-ma', []]] },
    { ma: 'ben-tau', ten: 'Tàu cập bến', hinh: 'ben-tau',
      chuong: [['ben-tau', []], ['che-ben-tau', []]] },
    { ma: 'duong-ray', ten: 'Đường ray cảng', loai: 'bo-phan', hinh: 'duong-ray',
      chuong: [['duong-ray', []], ['che-duong-ray', []]] },
    { ma: 'nhac-doi', ten: 'Móc cẩu đôi', loai: 'bo-phan', hinh: 'nhac-doi',
      chuong: [['nhac-doi', []], ['che-nhac-doi', []]] }
  ];
  var TEN_MUA_CANG = {
    'can-cau': 'Quay cần vươn tầm', 'so-am': 'Số âm và khoảng cách',
    'moc-cau': 'Nhấc container', 'chia-du': 'Chia lấy phần nguyên, phần dư',
    'quet-ma': 'Đọc mã số', 'che-quet-ma': 'Chế lệnh: phân loại theo mã',
    'ben-tau': 'Tàu cập bến', 'che-ben-tau': 'Chế lệnh: giao đúng tàu',
    'duong-ray': 'Chạy dọc đường ray', 'che-duong-ray': 'Chế lệnh: dời bệ cẩu',
    'nhac-doi': 'Móc đôi hai tầng', 'che-nhac-doi': 'Chế lệnh: bốc nhanh'
  };
  var TEP_MUA_CANG = ['manCanCau', 'manMocCau', 'manQuetMa', 'manBenTau', 'manDuongRay', 'manNhacDoi'];
  (function () {
    Object.keys(TEN_MUA_CANG).forEach(function (c) { TT.ten[c] = TEN_MUA_CANG[c]; });
    var moi = [], chuong = [];
    MUA_CANG.forEach(function (g) { g.chuong.forEach(function (c) { chuong.push(c[0]); }); });
    TEP_MUA_CANG.forEach(function (k) { moi = moi.concat(M[k] || []); });
    moi.forEach(function (m) {
      if (chuong.indexOf(m.chuong) < 0) throw new Error('Màn mới mùa cảng thuộc chương không có trong MUA_CANG: ' + m.chuong + '.' + m.so);
      if (TT.thuTu.indexOf(m.chuong) < 0) TT.thuTu.push(m.chuong);
    });
    M.them(moi);
    moi.forEach(function (m) { nguon[m.ma] = copy(m); });
    MUA_CANG.forEach(function (g) {
      g.chuong.forEach(function (c) {
        var them = moi.filter(function (m) { return m.chuong === c[0] && c[1].indexOf(m.ma) < 0; }).sort(function (a, b) { return a.so - b.so; }).map(function (m) { return m.ma; });
        var cuoi = c[1][c[1].length - 1];
        c[1] = cuoi && (nguon[cuoi] || get(cuoi)).hang === 'trum' ? c[1].slice(0, -1).concat(them, [cuoi]) : c[1].concat(them);
      });
    });
    var coManCang = [];
    MUA_CANG.forEach(function (g) {
      g.chuong.forEach(function (c) {
        if (!c[1].length) return;
        if (TT.thuTu.indexOf(c[0]) < 0) TT.thuTu.push(c[0]);
        dungChuong(c[0], c[1]);
        coManCang.push(c[0]);
        c[1].forEach(function (ma, i) {
          var m = get(ma);
          if (i < c[1].length - 1) delete m.huyHieu;
          else m.huyHieu = { ma: c[0], ten: 'Huy hiệu ' + TEN_MUA_CANG[c[0]] };
        });
      });
    });
    var goiTruoc = TT.goi.filter(function (g) { return g.mua === 'mua-1' || g.mua === 'mua-2' || g.mua === 'mua-3' || g.mua === 'mua-6' || g.mua === 'mua-7'; });
    var cTruoc = [];
    goiTruoc.forEach(function (g) { cTruoc = cTruoc.concat(g.chuong); });
    var sau = TT.thuTu.filter(function (c) { return cTruoc.indexOf(c) < 0 && coManCang.indexOf(c) < 0; });
    TT.thuTu.splice.apply(TT.thuTu, [0, TT.thuTu.length].concat(cTruoc, coManCang, sau));
    var conLai = TT.goi.filter(function (g) { return goiTruoc.indexOf(g) < 0 && g.mua !== 'mua-4'; });
    var goiCang = [];
    MUA_CANG.forEach(function (g) {
      var ch = g.chuong.map(function (c) { return c[0]; }).filter(function (c) { return coManCang.indexOf(c) >= 0; });
      if (!ch.length) return;
      var x = { ma: g.ma, ten: g.ten, mua: 'mua-4', chuong: ch };
      if (g.loai) x.loai = g.loai;
      if (g.hinh) x.hinh = g.hinh;
      goiCang.push(x);
    });
    TT.goi.splice.apply(TT.goi, [0, TT.goi.length].concat(goiTruoc, goiCang, conLai));
    M.muaCang = MUA_CANG;
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
  var high = ham('charge_for_trip', ['if battery() < 5:', '    go_up()', '    go_down()']);
  sua('drone.10', {
    ten: 'Giao hàng với ba mức pin', deBai: 'Giao hai hộp sắt tới hai đích trên cùng đường bay. Ba sân có pin 5, 6 và 7. Dải P nằm ngay phía trên. Tạo ship(path) như đã luyện; dùng charge_for_trip() trước mỗi chuyến và ghé sạc sau chuyến đầu để đủ pin đi lấy hộp tiếp.',
    san: [copy(rail), copy(rail), copy(rail)], vatChat: [copy(chat), copy(chat), copy(chat)], pin: [5, 6, 7],
    batDau: [0, 1, 2].map(function () { return { x: 0, y: 1, huong: 0 }; }), nhipTheo: 'tong', nhipTheoLoiGiai: true,
    maMau: bai([], [copy(high)]),
    loiGiai: Object.assign(bai(['charge_for_trip()', 'ship("RR")', 'go_up()', 'go_down()', 'walk("RR")', 'charge_for_trip()', 'ship("RR")'], [copy(high)]),
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

  // ---------------------------------------------------------------- PDM1 (31/10, KE-HOACH-PART-DUNG-MUA.md): gói 10 mùa 1 "R1 chạy một mình"
  // R1 xuất xưởng ở lại kho làm việc bằng mật lệnh đã viết: MỌI màn của gói nhiều sân, mỗi sân là một "ngày làm việc" (thùng / hốc / cửa ở chỗ khác),
  // một chương trình đúng mọi ngày; lời đếm cứng của một ngày nằm trong loiSai (thua ở ngày khác). Nhịp sao tính TỔNG mọi ngày (nhipTheo: 'tong') ở cả 20 màn.
  // robot-hoan-thien.1–6: lấy lại ba sân của ngân hàng (cùng lời giải, đã dùng cảm biến); .7, .8 (bài viết lại ở thay() trên) thêm ngày.
  (function () {
    var NGAY = ' Mỗi ngày kho xếp khác: viết một chương trình chạy đúng mọi ngày.';
    function nhieuNgay(ma, ds) {
      var m = get(ma), g = nguon[ma];
      ['san', 'batDau', 'bongMo', 'vatMau'].forEach(function (k) { if (g[k] !== undefined) m[k] = copy(g[k]); });
      m.nhipTheo = 'tong';
      Object.assign(m, ds);
      m.phienBanNoiDung = 2;
    }
    nhieuNgay('robot-hoan-thien.1', {
      deBai: 'R1 ở lại kho làm một mình. Ba ngày làm việc: mỗi ngày thùng hàng nằm xa gần khác nhau, hành lang dài ngắn khác nhau. Đưa thùng tới ô cuối hành lang, sát tường, giống vật mờ.' + NGAY
    });
    nhieuNgay('robot-hoan-thien.2', {
      deBai: 'Ba ngày làm việc, hành lang mỗi ngày dài ngắn khác nhau. Ngày nào cũng có người bỏ quên một thùng hàng ngay sau lưng xe. Đưa thùng tới ô cuối hành lang, sát tường, giống vật mờ.' + NGAY
    });
    get('robot-hoan-thien.2').loiSai.push({ moTa: 'Đếm cứng theo ngày đầu: đi hai ô rồi đặt, ngày khác hành lang dài hơn hay ngắn hơn', baiLam: bai(['grab_back()', 'move()', 'move()', 'drop()']), phaiCoMa: ['lech-bong-mo'] });
    nhieuNgay('robot-hoan-thien.3', {
      deBai: 'Ba ngày làm việc, mỗi ngày ngăn kệ trống ở một chỗ khác. Thùng hàng nằm ngay trước mặt xe: mang nó dọc hành lang tới ngăn kệ mở ra bên phải rồi đặt vào ngăn, giống vật mờ.' + NGAY
    });
    nhieuNgay('robot-hoan-thien.4', {
      deBai: 'Ba ngày làm việc, mỗi ngày thùng đỏ chắn hành lang ở một chỗ khác; thùng xanh dương nằm bên phải chỗ xe dừng lại. Đổi chỗ hai thùng cho nhau, rồi cho xe về chỗ xuất phát, mặt quay xuống như xe mờ.' + NGAY
    });
    get('robot-hoan-thien.4').loiSai.push({ moTa: 'Đếm cứng theo ngày thứ ba: tiến một ô rồi đổi, ngày khác thùng đỏ còn xa hơn', baiLam: bai(['move()', 'swap()', 'u_turn()', 'go_wall()']), phaiCoMa: ['lech-bong-mo'] });
    // .5: số thùng 2 / 3 / 1, vòng thừa lượt chỉ kẹp hụt (không hỏng gì): giữ nhịp TỔNG ba ngày của ngân hàng để vòng for đếm cứng ba lần mất sao.
    nhieuNgay('robot-hoan-thien.5', {
      nhipTheo: 'tong',
      deBai: 'Ba ngày làm việc, mỗi ngày dãy thùng chắn hành lang dài ngắn khác nhau. Dời từng thùng sang ô bên phải xe, rồi đưa xe tới cuối hành lang, giống vật mờ và xe mờ.' + NGAY + ' Số nhịp tính tổng cả ba ngày.'
    });
    get('robot-hoan-thien.5').loiSai[3] = { moTa: 'Đếm cứng hai lần (vòng for): ngày có ba thùng còn một thùng chắn lối', baiLam: bai(['go_wall()'].concat(lap(2, ['put_right()', 'move()']), ['go_wall()'])), phaiCoMa: ['lech-bong-mo'] };
    nhieuNgay('robot-hoan-thien.6', {
      deBai: 'Ba ngày làm việc, mỗi ngày hành lang chữ L rẽ ở một chỗ khác. Thùng hàng nằm ngay trước mặt xe: mang nó đi hết hành lang, rẽ phải ở góc, đi tới cuối đoạn kia và đặt xuống sát tường, giống vật mờ. Chương trình chỉ được gọi 5 hàm của em khác nhau.' + NGAY
    });
    get('robot-hoan-thien.6').loiSai.push({ moTa: 'Đếm cứng theo ngày đầu: năm ô lên, một ô sang, ngày khác góc rẽ ở chỗ khác', baiLam: bai(['pick()'].concat(lap(5, ['move()']), ['turn_right()', 'move()', 'drop()'])), phaiCoMa: ['lech-bong-mo'] });
    // .7 "Mang thùng về nhà": ba ngày, thùng cách xe 2 / 4 / 1 ô (hành lang dài ngắn khác); về tới tường đầu hành lang rồi lùi một ô, đặt.
    (function () {
      var m = get('robot-hoan-thien.7'), BM = { x: 2, y: 1, huong: 3, vat: [{ x: 1, y: 1 }] };
      Object.assign(m, {
        deBai: 'Ba ngày làm việc, mỗi ngày thùng hàng nằm ở một chỗ khác trong hành lang. Đi tới thùng, nhặt lên, mang về đặt sát tường ở đầu hành lang nơi xe xuất phát, giống vật mờ và xe mờ.' + NGAY,
        san: [['#######', '#..o..#', '#######'], ['########', '#....o.#', '########'], ['######', '#.o..#', '######']],
        batDau: [0, 1, 2].map(function () { return { x: 1, y: 1, huong: 1 }; }), bongMo: [0, 1, 2].map(function () { return copy(BM); }),
        loiSai: [
          { moTa: 'Đếm cứng theo ngày đầu: tiến một ô rồi nhặt, ngày khác thùng ở chỗ khác', baiLam: bai(['move()', 'pick()', 'u_turn()', 'drop()']), phaiCoMa: ['lech-bong-mo'] },
          { moTa: 'Về tới tường thì thả ngay: ô trước mặt là tường nên không đặt được', baiLam: bai(['go_wall()', 'pick()', 'u_turn()', 'go_wall()', 'drop()']), phaiCoMa: ['tha-bi-chan', 'lech-bong-mo'] },
          { moTa: 'Quên quay đầu: lùi mãi, thùng vẫn trên tay', baiLam: bai(['go_wall()', 'pick()', 'go_wall()', 'back()', 'drop()']), phaiCoMa: ['lech-bong-mo'] }
        ]
      });
    })();
    // .8 "Dọn sang trái rồi về": ba ngày, dãy 3 / 2 / 1 thùng; lời giải đổi vòng for (đếm cứng 3 thùng) thành while not front_clear() (hết thùng thì trước mặt trống).
    (function () {
      var m = get('robot-hoan-thien.8');
      var DON = ['go_wall()', 'while not front_clear():', '    pick()', '    move()', '    turn_left()', '    drop()', '    turn_right()', 'u_turn()', 'go_wall()'];
      function bm(ys) { return { x: 1, y: 6, huong: 2, vat: ys.map(function (y) { return { x: 0, y: y }; }) }; }
      Object.assign(m, {
        deBai: 'Ba ngày làm việc, mỗi ngày dãy thùng xếp dọc hành lang dài ngắn khác nhau. Dời từng thùng sang ô bên trái xe, rồi đưa xe về chỗ xuất phát, quay mặt xuống, giống vật mờ và xe mờ.' + NGAY,
        veMaMau: 'Còn thùng chắn trước mặt thì dời tiếp: vòng while hỏi cảm biến, không đếm số thùng.',
        san: [['####', '#.##', '.o##', '.o##', '.o##', '#.##', '#.##'], ['####', '#.##', '#.##', '.o##', '.o##', '#.##', '#.##'], ['####', '#.##', '.o##', '#.##', '#.##', '#.##', '#.##']],
        batDau: [0, 1, 2].map(function () { return { x: 1, y: 6, huong: 0 }; }), bongMo: [bm([2, 3, 4]), bm([3, 4]), bm([2])],
        loiGiai: bai(DON),
        loiSai: [
          { moTa: 'Đếm cứng hai thùng (vòng for): ngày có ba thùng còn một thùng nằm lại', baiLam: bai(['go_wall()'].concat(lap(2, ['pick()', 'move()', 'turn_left()', 'drop()', 'turn_right()']), ['u_turn()', 'go_wall()'])), phaiCoMa: ['lech-bong-mo'] },
          { moTa: 'Quên move() trong vòng while: dời xong thùng đầu thì trước mặt đã trống, các thùng sau còn nguyên', baiLam: bai(['go_wall()', 'while not front_clear():', '    pick()', '    turn_left()', '    drop()', '    turn_right()', 'u_turn()', 'go_wall()']), phaiCoMa: ['lech-bong-mo'] },
          { moTa: 'Dời xong quên về chỗ xuất phát', baiLam: bai(DON.slice(0, 7)), phaiCoMa: ['lech-bong-mo'] }
        ],
        goiY: ['Nhặt thùng trước mặt, tiến vào chỗ trống của nó, quay trái rồi thả, quay lại hướng cũ.', 'Hết thùng thì ô trước mặt trống: while not front_clear() tự dừng, ngày nào cũng đúng.']
      });
    })();
    ['robot-hoan-thien.7', 'robot-hoan-thien.8'].forEach(function (ma) { get(ma).nhipTheo = 'tong'; get(ma).phienBanNoiDung = 2; });
  })();

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
    // Gói 2 chương sung-hoi: cái mới là VÒI PHUN (29/10: phun nhẹ, không giật). sung-hoi.1 trình diễn (khoá: phun mở van rồi qua cửa); sung-hoi.2 ép spray_back (H).
    sua('sung-hoi.1', {
      ten: 'Phun mở van', chiChay: true, chinhCoDinh: true,
      deBai: 'Xe có vòi phun ở mũi. spray() phun một tia nước ra phía trước, bay xa nhất hai ô; tia trúng van thì van quay, cửa mở. Sau spray() phải có wait() thì nhịp mới trôi. Bấm Chạy xem xe phun mở cửa rồi tới cờ.',
      veMaMau: 'Chương trình đã viết sẵn và khoá. Bấm Chạy: spray() rồi wait(), cửa bên phải mở ở cuối nhịp.',
      maMau: bai(['spray()', 'wait()', 'turn_right()', 'move()', 'move()']), loiGiai: bai(['spray()', 'wait()', 'turn_right()', 'move()', 'move()']),
      goiY: ['Tia nước bay thẳng theo mũi xe, xa nhất hai ô.', 'Màn sau van ở sau lưng: em dùng spray_back().']
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
    // Gói 6 chương luc-ban (30/10): cái mới là PHUN MẠNH spray("high"): tia bay xa và xe GIẬT lùi một ô (lần đầu trong mùa có cú giật). luc-ban.1 trình diễn
    // (van cách ba ô, phun mạnh mở cửa, cú giật đưa xe tới hàng cửa); luc-ban.2 ép: mã mẫu phun nhẹ không tới van xa, người chơi đổi "low" thành "high" (H). che-luc-ban.1 chế auto_spray() (H).
    trinhDien('luc-ban.1', null,
      'Vòi phun giờ có lực mạnh: spray("high") phun tia nước bay xa tới vật cản đầu tiên, nhưng cú phun mạnh làm xe giật lùi một ô. Van cách xe ba ô, phun nhẹ không tới. Bấm Chạy xem phun mạnh mở cửa và cú giật đưa xe tới hàng cửa.',
      'Chương trình đã viết sẵn và khoá. Bấm Chạy: chữ "high" trong ngoặc là lực phun mạnh.',
      ['Phun mạnh thì tia bay xa, xe giật lùi một ô.', 'Màn sau van ở xa: em tự chọn lực.']);
    // Gói 7 chương do-nhiet: cái mới là ĐO NHIỆT warm() (van đang bật thì nóng). do-nhiet.1 trình diễn (if not warm(): squirt("low") ở mỗi khúc quanh);
    // do-nhiet.2 ép while not warm(): turn_right() (H). che-do-nhiet.1 chế switch_on() (H).
    trinhDien('do-nhiet.1', null,
      'Mắt hồng ngoại vừa được nâng cấp ĐO NHIỆT: warm() là True khi vật cản trước mũi xe đang nóng. Van hơi đang mở thì nóng (có quầng đỏ), van đóng thì không. Đường xoắn có ba khúc quanh, cuối mỗi khúc một van; van đóng nào cũng mở cửa của khúc sau. Bấm Chạy xem xe hỏi warm() ở mỗi khúc: van chưa nóng thì phun nhẹ cho mở, rồi rẽ phải đi tới tường.',
      'Chương trình đã viết sẵn và khoá. Bấm Chạy: if not warm() chỉ phun khi van trước mặt chưa nóng.',
      ['Phun van đang mở là đóng nó: phải hỏi warm() trước.', 'Màn sau bốn van nóng làm đèn chỉ đường: em quay cho tới khi warm() là True.']);
    // Gói 9 chương be-sung: cái mới là BỆ SÚNG XÍCH (xích + súng hơi: phun mạnh không giật). be-sung.1 trình diễn (phun nút rồi rẽ phải, không cần move() bù giật);
    // be-sung.2 ép: mã mẫu của Sola có back() bù giật thừa, người chơi bỏ dòng đó (H). che-be-sung.1 chế spray_left() (H).
    trinhDien('be-sung.1', null,
      'Xe xích của em đã gắn vòi phun thành BỆ VÒI: xích bám chắc nên phun mạnh không giật, không như xe hai bánh lùi một ô sau mỗi lần phun mạnh. Bấm Chạy xem xe phun van cuối hành lang cho cửa bên phải mở, rồi rẽ phải tới cờ mà không phải bù cú giật.',
      'Chương trình đã viết sẵn và khoá. Bấm Chạy: sau spray("high") và wait(), xe vẫn đứng nguyên ô.',
      ['Xe hai bánh phun mạnh thì giật lùi một ô; bệ vòi xích thì không.', 'Màn sau Sola viết cho xe hai bánh có dòng bù giật thừa: em bỏ nó.']);
  })();

  // ---------------------------------------------------------------- PART ĐÚNG MÙA 2 (PDM2a, 31/10, KE-HOACH-PART-DUNG-MUA.md mục 3): R1 = xe cứu hỏa
  // Gói 1 chỉ xích; gói 2 xích + vòi; gói 3–4 xích + vòi + hồng ngoại (bớt part chưa cần). Không tay kẹp, không cảm biến khoảng cách, không thân hai bánh.
  // Xích quay hai nhịp nên hàm quay là tr_right / tr_left (tạo ở xich.3 / xich.4). Giữ `ma`; nội dung bản 2 (sua) nên ngưỡng sao đo lại ở lo-trinh-sao.js.
  // Khối đặt SAU gói T mùa 2 (ghi đè màn trình diễn / màn ép cũ còn dùng hai bánh) và trước tên hiển thị, lucBan, ngưỡng sao.
  var XICH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  /** Màn thành xe xích (tay / cảm biến theo `r`), bỏ các khoá cũ không còn hợp (bo: tên trường). */
  function xeCuuHoa(ma, r, ds, bo) {
    var m = sua(ma, Object.assign({ loaiRobot: 'xich', robot: Object.assign({ than: 'xich', tay: null }, r || {}) }, ds));
    (bo || []).forEach(function (k) { delete m[k]; });
    return m;
  }
  (function () {
    var di = function (n) { return lap(n, ['move()']); };
    // ---- Gói 1 chương xich: xich.7, xich.10 bỏ tay kẹp (mang vật) → đường vòng / bậc thềm tới cờ.
    // xich.7 (biến thể sau xich.6 băng chuyền): vòng qua đầu vách sang làn dưới, hai lần quẹo CÙNG chiều (xich.5 khác chiều); làn dưới có băng ngược chiều (nhắc xich.6).
    var VONG = di(4).concat(['tr_right()', 'move()', 'move()', 'tr_right()'], di(4));
    xeCuuHoa('xich.7', null, {
      ten: 'Vòng qua vách', hamGoc: XICH.slice(), hamCuaEmCan: ['move', 'tr_right', 'tr_left'],
      san: ['.....', '####.', 'F>>>.'], batDau: { x: 0, y: 0, huong: 1 },
      deBai: 'Vách ngăn chia hai làn. Đi hết làn trên, vòng qua đầu vách rồi chạy ngược về làn dưới tới cờ. Băng chuyền ở làn dưới chạy ngược chiều xe, nhưng xích bám chắc nên băng không đẩy được.',
      veMaMau: 'Chương trình có sẵn đưa xe hết làn trên. Viết tiếp: quẹo hai lần cùng một phía để vòng qua đầu vách.',
      goiY: ['Hai khúc quẹo đều quẹo phải: gọi tr_right() ở cả hai chỗ.', 'Giữa hai lần quẹo, xe đi hai ô xuống dưới.'],
      maMau: bai(di(4)), loiGiai: bai(VONG),
      loiSai: [
        { moTa: 'Quẹo trái ở đầu vách: xe đâm mép sân', baiLam: bai(di(4).concat(['tr_left()', 'move()', 'move()', 'tr_left()'], di(4))), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Đi xuống một ô rồi quẹo: xe đâm vách', baiLam: bai(di(4).concat(['tr_right()', 'move()', 'tr_right()'], di(4))), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Làn dưới đi thiếu một ô: xe dừng trước cờ', baiLam: bai(di(4).concat(['tr_right()', 'move()', 'move()', 'tr_right()'], di(3))), phaiCoMa: ['chua-toi-co'] }
      ]
    }, ['mucTieu', 'vatChat', 'nhipTheoLoiGiai']);
    // xich.10 (trùm): bậc thềm có băng chuyền tới cờ; xe xuất phát mặt quay lên nên quay phải trước (nhắc xich.1–3), rồi vòng lặp bậc thềm (tr_left / tr_right).
    var BAC = ['for i in range(3):', '    tr_left()', '    move()', '    tr_right()', '    move()'];
    xeCuuHoa('xich.10', null, {
      hamGoc: XICH.slice(), hamCuaEmCan: ['move', 'tr_right', 'tr_left'],
      san: ['####.>F', '###.^##', '##.<###', '...####'], batDau: { x: 0, y: 3, huong: 0 },
      deBai: 'Con đường gấp khúc như bậc thềm, có băng chuyền, dẫn lên cờ. Xe xích đang quay mặt lên. Quay đúng hướng, đi tới chân bậc rồi dùng vòng lặp cùng các hàm quay của xe xích để leo hết bậc tới cờ.',
      veMaMau: 'Chương trình có sẵn quay xe sang phải và đi tới chân bậc. Viết tiếp phần leo bậc.',
      goiY: ['Mỗi bậc là: quẹo trái, đi một ô, quẹo phải, đi một ô. Đặt bốn dòng đó vào một vòng for.', 'Băng chuyền không đẩy được xe xích; hết bậc thì còn một ô nữa tới cờ.'],
      maMau: bai(['tr_right()', 'move()', 'move()']), loiGiai: bai(['tr_right()', 'move()', 'move()'].concat(BAC, ['move()'])),
      loiSai: [
        { moTa: 'Dùng turn_left() và turn_right() cũ: xe chỉ quay nửa vòng, đâm tường', baiLam: bai(['tr_right()', 'move()', 'move()', 'for i in range(3):', '    turn_left()', '    move()', '    turn_right()', '    move()', 'move()']), phaiCoMa: ['xich-quay-do', 'dam-tuong', 'chua-toi-co'] },
        { moTa: 'Đổi thứ tự quay trong vòng lặp (phải rồi trái): xe đâm tường', baiLam: bai(['tr_right()', 'move()', 'move()', 'for i in range(3):', '    tr_right()', '    move()', '    tr_left()', '    move()', 'move()']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Quên ô cuối sau bậc thềm: xe dừng sát cờ', baiLam: bai(['tr_right()', 'move()', 'move()'].concat(BAC)), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Không dùng vòng lặp cho bậc thềm: quá 10 ô', baiLam: bai(['tr_right()', 'move()', 'move()', 'tr_left()', 'move()', 'tr_right()', 'move()', 'tr_left()', 'move()', 'tr_right()', 'move()', 'tr_left()', 'move()', 'tr_right()', 'move()', 'move()']), phaiCoMa: ['tran-khung'] }
      ]
    }, ['mucTieu', 'vatChat', 'nhipTheoLoiGiai']);
    // ---- Gói 1 chương bien-xich ("Đi xoắn ốc"): chưa có cảm biến nên biến không đếm bước tới tường nữa mà ĐẾM ĐỘ DÀI ĐOẠN: n tăng (giảm) sau mỗi khúc quẹo,
    // đường xoắn ốc / bậc thang lớn dần. Viết cứng từng đoạn thì dài (ô) nên không đủ sao; thay n bằng một số thì xe đi hình vuông, đâm tường.
    // che-xich.6 (màn 4, chế lệnh): next_lane() sang làn bên quay đầu (thay pick_behind của tay kẹp).
    var LAN = di(3).concat(['next_lane()'], di(3));
    xeCuuHoa('che-xich.6', null, {
      ten: 'Sang làn bên', hamGoc: XICH.slice(), hamCuaEmCan: ['tr_right', 'move'], taoHam: ['next_lane'], chinhCoDinh: true,
      san: ['####', '#..#', '#..#', '#..#', '#..#', '####'], batDau: { x: 1, y: 4, huong: 0 },
      mucTieu: 'bong-mo', bongMo: { x: 2, y: 4, huong: 2 },
      deBai: 'Hai làn dọc. Chương trình chính đưa xe lên hết làn trái, gọi next_lane() để sang làn phải và quay đầu, rồi đi xuống tới chỗ xe mờ. Em tự chế lệnh next_lane() cho xe xích.',
      veMaMau: 'Chương trình chính bị khóa và đã gọi next_lane(). Mở Xưởng hàm, tạo next_lane() rồi bấm Chạy.',
      goiY: ['Quẹo phải, đi một ô, quẹo phải lần nữa là xe đứng ở làn bên, mặt quay ngược lại.', 'Xe xích quay bằng tr_right(), không dùng turn_right() của xe hai bánh.'],
      maMau: bai(LAN),
      loiGiai: { chinh: LAN.slice(), hamCuaMan: [], hamCuaEmMoi: [{ ten: 'next_lane', thamSo: [], than: ['tr_right()', 'move()', 'tr_right()'] }] },
      loiSai: [
        { moTa: 'Gọi next_lane() mà chưa chế hàm', baiLam: bai(LAN), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Chỉ quẹo một lần: xe sang làn bên nhưng mặt quay sang phải', baiLam: bai(LAN), hamCuaEmMoi: [{ ten: 'next_lane', thamSo: [], than: ['tr_right()', 'move()'] }], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quẹo trái: xe sang làn bên trái', baiLam: bai(LAN), hamCuaEmMoi: [{ ten: 'next_lane', thamSo: [], than: ['tr_left()', 'move()', 'tr_left()'] }], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quay bằng turn_right() của xe hai bánh: xích mới quay nửa góc', baiLam: bai(LAN), hamCuaEmMoi: [{ ten: 'next_lane', thamSo: [], than: ['turn_right()', 'move()', 'turn_right()'] }], phaiCoMa: ['lech-bong-mo'] }
      ]
    }, ['vatChat', 'nhipTheoLoiGiai']);
    get('che-xich.6').loiGiaiKhac = { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: bai(LAN), hamCuaEmMoi: [{ ten: 'next_lane', thamSo: [], than: ['# sang làn bên phải, quay đầu', 'tr_right()', 'move()', 'tr_right()'] }] };
    var BIEN = { bienDem: true, hamGoc: XICH.slice(), taoHam: [] };
    var BO_CU = ['mucTieu', 'bongMo', 'vatChat', 'vatThem', 'nhipTheo', 'nhipTheoLoiGiai', 'khoaHamMan', 'kieuBai'];
    var XOAN = function (k, tang) { return ['n = ' + (tang ? 1 : k), 'for i in range(' + k + '):', '    for j in range(n):', '        move()', '    tr_right()', '    n = n ' + (tang ? '+' : '-') + ' 1']; };
    // che-cam-bien.6 (màn 5, TRÌNH DIỄN biến): xoắn ốc 1, 2, 3 ô; main khoá, bấm Chạy thấy n lớn dần sau mỗi khúc quẹo.
    xeCuuHoa('che-cam-bien.6', null, Object.assign({}, BIEN, {
      ten: 'Biến lớn dần', chiChay: true, chinhCoDinh: true, hamCuaEmCan: ['move', 'tr_right'],
      san: ['#####', '#...#', '#.#.#', '###.#', '###F#'], batDau: { x: 1, y: 2, huong: 0 },
      deBai: 'Biến n là một ô nhớ: n = 1 đặt nó bằng 1, n = n + 1 tăng nó thêm một. Đường xoắn ốc có ba đoạn dài 1, 2, 3 ô: mỗi vòng xe đi n ô, quẹo phải rồi tăng n. Bấm Chạy xem đoạn sau dài hơn đoạn trước.',
      veMaMau: 'Chương trình đã viết sẵn và khoá. Bấm Chạy: vòng thứ nhất n = 1, vòng thứ hai n = 2, vòng thứ ba n = 3.',
      maMau: bai(XOAN(3, true)), loiGiai: bai(XOAN(3, true)),
      goiY: ['Không có biến n thì mỗi đoạn phải viết một vòng for riêng.', 'Màn sau em tự thêm dòng tăng n.']
    }), BO_CU);
    // che-cam-bien.5 (màn 6, ÉP biến): xoắn ốc 1, 2, 3, 4 ô; mã mẫu thiếu n = n + 1 (xe đi hình vuông, đâm tường), người chơi thêm dòng tăng n (H).
    var X4 = XOAN(4, true);
    xeCuuHoa('che-cam-bien.5', null, Object.assign({}, BIEN, {
      ten: 'Tăng n mỗi vòng', chinhCoDinh: false, hamCuaEmCan: ['move', 'tr_right'],
      san: ['##...', '##.#.', '####.', 'F....'], batDau: { x: 2, y: 1, huong: 0 },
      deBai: 'Đường xoắn ốc bốn đoạn dài 1, 2, 3, 4 ô tới cờ. Chương trình có sẵn lặp bốn vòng, mỗi vòng đi n ô rồi quẹo phải, nhưng quên tăng n: chạy thử xem xe đi hình gì.',
      veMaMau: 'Chạy thử: n cứ bằng 1 nên xe đi hình vuông rồi đâm tường. Thêm n = n + 1 vào cuối thân vòng lặp ngoài.',
      goiY: ['Mỗi vòng đoạn đường dài thêm một ô: sau khi quẹo, tăng n thêm 1.', 'Dòng n = n + 1 thụt vào cùng hàng với tr_right(), nằm trong vòng lặp ngoài.'],
      maMau: bai(X4.slice(0, 5)), loiGiai: bai(X4),
      loiSai: [
        { moTa: 'Không tăng n: xe đi hình vuông rồi đâm tường', baiLam: bai(X4.slice(0, 5)), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Bắt đầu n = 0: vòng đầu xe không đi mà quẹo luôn, đâm tường', baiLam: bai(['n = 0'].concat(X4.slice(1))), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Tăng n trong vòng lặp trong: đoạn đường dài ra quá nhanh, đâm tường', baiLam: bai(['n = 1', 'for i in range(4):', '    for j in range(n):', '        move()', '        n = n + 1', '    tr_right()']), phaiCoMa: ['dam-tuong'] }
      ]
    }), BO_CU);
    // che-cam-bien.9 (màn 7, biến thể): xoắn ốc VÀO TRONG 4, 3, 2, 1 ô: n bắt đầu 4, giảm một mỗi vòng (n = n - 1). Mã mẫu là xoắn ốc ra của màn trước.
    var X4G = XOAN(4, false);
    xeCuuHoa('che-cam-bien.9', null, Object.assign({}, BIEN, {
      ten: 'Xoắn ốc vào trong', chinhCoDinh: false, hamCuaEmCan: ['move', 'tr_right'],
      san: ['.....', '####.', '##F#.', '##...'], batDau: { x: 0, y: 0, huong: 1 },
      deBai: 'Lần này đường xoắn VÀO trong: các đoạn dài 4, 3, 2, 1 ô. Chương trình có sẵn là xoắn ốc ra của màn trước. Sửa để n bắt đầu từ 4 và mỗi vòng GIẢM một.',
      veMaMau: 'Chạy thử: đoạn đầu chỉ một ô rồi xe quẹo, đâm tường. Đổi số đầu của n, và đổi + thành - ở dòng cuối.',
      goiY: ['Đoạn đầu dài 4 ô nên n = 4.', 'n = n - 1 làm n nhỏ đi một sau mỗi khúc quẹo.'],
      maMau: bai(X4.slice()), loiGiai: bai(X4G),
      loiSai: [
        { moTa: 'Giữ xoắn ốc ra: đoạn đầu một ô, xe đâm tường', baiLam: bai(X4.slice()), phaiCoMa: ['dam-tuong'] },
        { moTa: 'n = 4 nhưng vẫn tăng n: đoạn thứ hai năm ô, đâm tường', baiLam: bai(['n = 4'].concat(X4.slice(1))), phaiCoMa: ['dam-tuong'] },
        { moTa: 'n = 4 mà không đổi n: đoạn thứ hai bốn ô, đâm tường', baiLam: bai(X4G.slice(0, 5)), phaiCoMa: ['dam-tuong'] }
      ]
    }), BO_CU);
    // robot-hoan-thien.9 (màn 8, biến thể): bậc thang lớn dần: mỗi bậc đi n ô, leo một ô, rồi n tăng (nhắc bậc thềm xich.10 với biến).
    var BAC_N = ['n = 1', 'for i in range(3):', '    for j in range(n):', '        move()', '    tr_left()', '    move()', '    tr_right()', '    n = n + 1'];
    xeCuuHoa('robot-hoan-thien.9', null, Object.assign({}, BIEN, {
      ten: 'Bậc thang lớn dần', chinhCoDinh: false, hamCuaEmCan: ['move', 'tr_right', 'tr_left'],
      san: ['######F', '###....', '#...###', '..#####'], batDau: { x: 0, y: 3, huong: 1 },
      deBai: 'Cầu thang lên cờ có bậc rộng dần: bậc đầu một ô, bậc sau hai ô, bậc thứ ba ba ô. Mỗi bậc: đi hết mặt bậc, quẹo trái leo một ô, quẹo phải. Dùng biến n cho độ rộng mặt bậc.',
      veMaMau: 'Chương trình có sẵn leo được một bậc. Đặt nó vào vòng lặp ba lần và dùng biến n cho số ô của mặt bậc.',
      goiY: ['Mặt bậc rộng n ô: for j in range(n) rồi move().', 'Sau mỗi bậc, n = n + 1.'],
      maMau: bai(['move()', 'tr_left()', 'move()', 'tr_right()']), loiGiai: bai(BAC_N),
      loiSai: [
        { moTa: 'Mọi bậc đều một ô: xe đâm tường ở bậc thứ hai', baiLam: bai(['for i in range(3):', '    move()', '    tr_left()', '    move()', '    tr_right()']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Quên tăng n: các bậc đều một ô', baiLam: bai(BAC_N.slice(0, 7)), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Quẹo phải trước khi leo: xe đâm tường', baiLam: bai(['n = 1', 'for i in range(3):', '    for j in range(n):', '        move()', '    tr_right()', '    move()', '    tr_left()', '    n = n + 1']), phaiCoMa: ['dam-tuong'] }
      ]
    }), BO_CU.concat(['phanCung', 'canhBao']));      // bản cũ "Kẹt số lùi": phần cứng thiếu right_back
    // ---- Gói 2 (sung-hoi, tham-so): xích + vòi phun. Màn giữ ý: đổi thân (xichHoa: turn_right / turn_left → tr_right / tr_left ở mọi bài và chữ, khay bỏ lệnh tay kẹp).
    // Màn mất ý trên xích (băng chuyền không đẩy xích; tay kẹp mang vật) viết lại cùng vị trí trong đường cong.
    var VOI = XICH.concat(['spray', 'spray_back']);
    var THAN_CU = [];      // [mã màn, hàm của em bản cũ] mà xichHoa đổi thân (vd right(k), step(a, b): turn_right() → tr_right())
    function doiQuay(x) {
      if (typeof x === 'string') return x.replace(/\bturn_right\(\)/g, 'tr_right()').replace(/\bturn_left\(\)/g, 'tr_left()');
      if (Array.isArray(x)) return x.map(doiQuay);
      if (x && typeof x === 'object') { var o = {}; Object.keys(x).forEach(function (k) { o[k] = doiQuay(x[k]); }); return o; }
      return x;
    }
    /** Giữ ý màn, đổi R1 sang xe cứu hỏa (xích + vòi): hàm quay hai bánh → hàm quay xích ở mọi bài (mẫu, giải, sai, khác) và chữ; khay = bánh xích + lệnh vòi đang có. */
    function xichHoa(ma, khay, camBien) {
      var m = get(ma);
      ((m.loiGiai || {}).hamCuaEmMoi || []).forEach(function (h) { if (JSON.stringify(doiQuay(h)) !== JSON.stringify(h)) THAN_CU.push([ma, copy(h)]); });
      ['maMau', 'loiGiai', 'loiSai', 'loiGiaiKhac', 'congThucKhac', 'deBai', 'veMaMau', 'goiY'].forEach(function (k) { if (m[k] !== undefined) m[k] = doiQuay(m[k]); });
      var can = [];
      (m.hamCuaEmCan || []).forEach(function (t) { t = t === 'turn_right' ? 'tr_right' : t === 'turn_left' ? 'tr_left' : t; if (can.indexOf(t) < 0) can.push(t); });
      m.hamCuaEmCan = can;
      m.loaiRobot = 'xich'; m.robot = { than: 'xich', tay: 'hoi' };
      if (camBien) m.robot.camBien = camBien;
      m.hamGoc = khay || ((m.hamGoc || []).indexOf('left_move') < 0 ? m.hamGoc.slice() : VOI.slice());
      delete m.phanCung;
      m.phienBanNoiDung = 2;
      return m;
    }
    ['sung-hoi.1', 'sung-hoi.2', 'sung-hoi.3', 'sung-hoi.4', 'sung-hoi.5', 'sung-hoi.7', 'sung-hoi.8', 'sung-hoi.9', 'sung-hoi.10'].forEach(function (ma) { xichHoa(ma); });
    // Đường cong nhịp (xích quay hai nhịp nên sung-hoi.3 thành 8 nhịp): sung-hoi.2 dài thêm một ô (cửa lùi xuống, xe đi ba ô), 3 → 4 nhịp làm mốc.
    (function () {
      var m = get('sung-hoi.2');
      m.san = ['###', '#F#', '#.#', '#C#', '#.#', '#.#', '#N#', '###']; m.batDau = { x: 1, y: 4, huong: 0 };
      [m.maMau, m.loiGiai, m.loiGiaiKhac && m.loiGiaiKhac.baiLam].concat(m.loiSai.map(function (x) { return x.baiLam; })).forEach(function (b) { if (b) b.chinh.push('move()'); });
      // sung-hoi.7 (màn 9 của chương, mốc cho tham-so.2 qua ranh chương): hành lang sau hai cửa dài thêm ba ô (range(4) → range(7)), 7 → 10 nhịp.
      m = get('sung-hoi.7');
      m.san = ['#N########', '#.########', '#.C.C...F#', '##########'];
      ['maMau', 'loiGiai', 'loiSai', 'loiGiaiKhac'].forEach(function (k) { m[k] = JSON.parse(JSON.stringify(m[k]).replace(/range\(4\)/g, 'range(7)')); });
      m.goiY = m.goiY.map(function (g) { return g.replace('tiến bốn ô', 'tiến bảy ô'); });
    })();
    // sung-hoi.6 (cũ "Tắt băng": băng đẩy xe lùi, phun van tắt băng) mất ý vì băng không đẩy được xích: van bên phải mở cửa ở cuối hành lang dài.
    xeCuuHoa('sung-hoi.6', { tay: 'hoi' }, {
      ten: 'Cửa cuối hành lang', hamGoc: VOI.slice(), hamCuaEmCan: ['tr_right', 'tr_left', 'move'],
      san: ['###', '#F#', '#C#', '#.#', '#.#', '#.#', '#.#', '#.N', '###'], batDau: { x: 1, y: 7, huong: 0 },
      deBai: 'Hành lang dài, cửa ở tận cuối. Van mở cửa nằm ngay bên phải xe. Quay về phía van mà phun, quay lại rồi đi hết hành lang tới cờ.',
      veMaMau: 'Chương trình có sẵn đi thẳng lên. Chạy thử: cửa còn đóng nên xe dừng trước cửa.',
      goiY: ['Tia nước chỉ bay theo mũi xe: tr_right() cho mũi xe hướng vào van.', 'Phun xong thì tr_left() để quay mặt lên lại.'],
      maMau: bai(lap(6, ['move()'])), loiGiai: bai(['tr_right()', 'spray()', 'wait()', 'tr_left()'].concat(lap(6, ['move()']))),
      loiSai: [
        { moTa: 'Không phun: cửa còn đóng, xe húc cửa', baiLam: bai(lap(6, ['move()'])), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Phun khi mũi xe còn hướng lên: tia nước không trúng van', baiLam: bai(['spray()', 'wait()'].concat(lap(6, ['move()']))), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên wait() sau spray(): lệnh phun dồn vào nhịp quay', baiLam: bai(['tr_right()', 'spray()', 'tr_left()'].concat(lap(6, ['move()']))), phaiCoMa: ['chua-toi-co'] }
      ]
    }, ['noi', 'vatThem', 'nhipTheoLoiGiai']);
    // tham-so: R1 xích + vòi (bỏ tay kẹp). .1–.5, .7, .8 giữ ý (right(k) của tham-so.4 thân lặp tr_right()).
    ['tham-so.1', 'tham-so.2', 'tham-so.3', 'tham-so.4', 'tham-so.5', 'tham-so.7', 'tham-so.8'].forEach(function (ma) { xichHoa(ma, VOI.slice()); });
    // PDM2a2: hàm hai tham số của tham-so.8 đổi tên step → stair_down (một bậc thang đi xuống). Tên step còn là hàm của màn (bản hai bánh, THAN_CU) ở màn ẩn
    // mùa sau (che-doi-nam-cham.11 / .12, che-may-son.8 cũ, doi-nam-cham.9 cũ): giữ tên step ở kho của em thì hàm của màn che hàm của em (ham-man-che-ham-em).
    // Không lấy stair (hàm của em xuong-ham.10) hay stair_step (hàm của màn che-may-son.4).
    (function () {
      var m = get('tham-so.8');
      ['maMau', 'loiGiai', 'loiSai', 'loiGiaiKhac', 'congThucKhac', 'deBai', 'veMaMau', 'goiY', 'taoHam', 'hamCuaEmCan'].forEach(function (k) {
        if (m[k] !== undefined) m[k] = JSON.parse(JSON.stringify(m[k]).replace(/\bstep\b/g, 'stair_down'));
      });
    })();
    // Đường cong nhịp sau khi xích quay hai nhịp: tham-so.3 đoạn cuối dài thêm một ô (forward(1) → forward(2)): 13 → 14 nhịp làm mốc cho tham-so.4 (right(3) sáu nhịp, 21).
    (function () {
      var m = get('tham-so.3');
      m.san = ['###F..', '####=.', '####=.', '......'];
      ['maMau', 'loiGiai', 'loiSai', 'loiGiaiKhac'].forEach(function (k) { m[k] = JSON.parse(JSON.stringify(m[k]).replace(/forward\(1\)/g, 'forward(2)')); });
      m.loiSai.forEach(function (x) { if (x.phaiCoMa.indexOf('tran-khung') >= 0) x.baiLam.chinh.push('move()'); });
    })();
    // tham-so.6 (cũ deliver(n) bằng tay kẹp): tạo open_at(n): tiến n ô rồi phun van trước mũi. Hai van, mỗi van mở cửa của đoạn sau.
    var OPEN = { ten: 'open_at', thamSo: ['n'], than: ['forward(n)', 'spray()', 'wait()'] };
    var C6 = ['open_at(5)', 'tr_right()', 'open_at(3)', 'tr_right()', 'forward(5)'];
    xeCuuHoa('tham-so.6', { tay: 'hoi' }, {
      ten: 'Tới van rồi phun', hamGoc: VOI.slice(), hamCuaEmCan: ['move', 'forward', 'tr_right'], taoHam: ['open_at'],
      san: ['......N', '#####C#', '#####.#', 'F...C.#', '#####N#'], batDau: { x: 0, y: 0, huong: 1 },
      noi: [{ nut: { x: 6, y: 0 }, cua: [{ x: 5, y: 1 }], bang: [] }, { nut: { x: 5, y: 4 }, cua: [{ x: 4, y: 3 }], bang: [] }],
      deBai: 'Mỗi đoạn đường kết thúc trước một van, van mở cửa của đoạn sau. Tạo hàm open_at(n): tiến n ô rồi phun van trước mũi xe. Dùng nó cho hai đoạn đầu, rồi đi tới cờ.',
      veMaMau: 'Chương trình chính đã gọi open_at(5) và open_at(3), nhưng em chưa có hàm đó. Tạo hàm open_at có đối số n.',
      goiY: ['Thân hàm: forward(n), rồi spray(), rồi wait().', 'open_at(5) đi năm ô rồi phun; open_at(3) đi ba ô rồi phun.'],
      maMau: bai(C6), loiGiai: { chinh: C6.slice(), hamCuaMan: [], hamCuaEmMoi: [copy(OPEN)] },
      loiSai: [
        { moTa: 'Gọi open_at() mà chưa tạo hàm', baiLam: bai(C6), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Thân hàm đi cứng năm ô (không dùng n): đoạn thứ hai xe húc van hai nhịp, mất sao', baiLam: bai(C6), hamCuaEmMoi: [{ ten: 'open_at', thamSo: ['n'], than: ['forward(5)', 'spray()', 'wait()'] }], phaiCoMa: ['dam-tuong'] },
        { moTa: 'Thân hàm quên phun: cửa không mở', baiLam: bai(C6), hamCuaEmMoi: [{ ten: 'open_at', thamSo: ['n'], than: ['forward(n)', 'wait()'] }], phaiCoMa: ['chua-toi-co'] }
      ]
    }, ['mucTieu', 'vatChat', 'vatThem', 'nhipTheoLoiGiai']);
    // tham-so.9 (cũ: băng chuyền làm số lần đi khác số ô; xích không bị băng đẩy nên mất ý): quay đầu bằng right(2) của tham-so.4 (xích quay đầu bốn nhịp).
    var C9 = ['forward(4)', 'spray()', 'wait()', 'right(2)', 'forward(3)', 'tr_right()', 'forward(2)'];
    xeCuuHoa('tham-so.9', { tay: 'hoi' }, {
      ten: 'Quay đầu bằng right(2)', hamGoc: VOI.slice(), hamCuaEmCan: ['move', 'forward', 'tr_right', 'right'],
      san: ['#F####', '#C####', '.....N'], batDau: { x: 0, y: 2, huong: 1 },
      deBai: 'Van ở cuối ngõ cụt mở cửa phía trên, gần đầu hành lang. Đi tới van, phun, quay đầu rồi quay lại tìm cửa. Quay đầu là quay phải hai lần: dùng hàm right(k) em đã có.',
      veMaMau: 'Chương trình có sẵn đi tới van và phun. Viết tiếp: quay đầu, đi về chỗ cửa, quẹo lên tới cờ.',
      goiY: ['right(2) quay phải hai lần, tức là quay đầu.', 'Từ cuối ngõ đi ngược lại ba ô thì tới ngay dưới cửa.'],
      maMau: bai(C9.slice(0, 3)), loiGiai: bai(C9),
      loiSai: [
        { moTa: 'Quay đầu bằng right(1): xe mới quay một góc vuông, đâm tường', baiLam: bai(C9.slice(0, 3).concat(['right(1)'], C9.slice(4))), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Đi ngược lại hai ô: quẹo lên trúng tường', baiLam: bai(C9.slice(0, 4).concat(['forward(2)'], C9.slice(5))), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Quên phun: cửa không mở', baiLam: bai(['forward(4)', 'right(2)', 'forward(3)', 'tr_right()', 'forward(2)']), phaiCoMa: ['chua-toi-co'] }
      ]
    }, ['mucTieu', 'vatChat', 'vatThem', 'nhipTheoLoiGiai']);
    // tham-so.10 (trùm; cũ: deliver(n) qua băng chuyền): nhà máy ba van ba cửa, mỗi van mở cửa đoạn sau; open_at(n) với n khác nhau, tr_right / tr_left, forward.
    var C10 = ['open_at(3)', 'tr_right()', 'open_at(2)', 'tr_left()', 'open_at(3)', 'tr_left()', 'forward(2)'];
    xeCuuHoa('tham-so.10', { tay: 'hoi' }, {
      ten: 'Ba van ba cửa', hamGoc: VOI.slice(), hamCuaEmCan: ['move', 'forward', 'tr_right', 'tr_left', 'open_at'],
      san: ['....N#F#', '###C##C#', '###.C..N', '###N####'], batDau: { x: 0, y: 0, huong: 1 },
      noi: [{ nut: { x: 4, y: 0 }, cua: [{ x: 3, y: 1 }], bang: [] }, { nut: { x: 3, y: 3 }, cua: [{ x: 4, y: 2 }], bang: [] }, { nut: { x: 7, y: 2 }, cua: [{ x: 6, y: 1 }], bang: [] }],
      deBai: 'Ba đoạn đường dài ngắn khác nhau, đoạn nào cũng kết thúc trước một van; van mở cửa của đoạn kế tiếp. Dùng open_at(n) cho mỗi đoạn có van, quẹo đúng phía, rồi đi tới cờ.',
      veMaMau: 'Viết cả chương trình: open_at(n) với số ô của từng đoạn, xen giữa là hàm quay của xe xích.',
      goiY: ['Đếm số ô của từng đoạn tới sát van: 3, 2, 3.', 'Sau van thứ nhất quẹo phải; sau van thứ hai và thứ ba quẹo trái.'],
      maMau: bai([]), loiGiai: bai(C10),
      loiSai: [
        { moTa: 'Đoạn thứ hai gọi open_at(3): xe húc van một nhịp, mất sao', baiLam: bai(['open_at(3)', 'tr_right()', 'open_at(3)', 'tr_left()', 'open_at(3)', 'tr_left()', 'forward(2)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Sau van thứ hai quẹo phải: xe đâm tường', baiLam: bai(['open_at(3)', 'tr_right()', 'open_at(2)', 'tr_right()', 'open_at(3)', 'tr_left()', 'forward(2)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Không dùng hàm open_at: viết forward(), spray(), wait() từng đoạn thì quá 10 ô', baiLam: bai(['forward(3)', 'spray()', 'wait()', 'tr_right()', 'forward(2)', 'spray()', 'wait()', 'tr_left()', 'forward(3)', 'spray()', 'wait()', 'tr_left()', 'forward(2)']), phaiCoMa: [] }
      ]
    }, ['mucTieu', 'vatChat', 'vatThem', 'nhipTheoLoiGiai']);
    // ---- Gói 3 (hong-ngoai, che-hong-ngoai): xích + hồng ngoại (+ vòi khi màn cần). Màn chỉ đo và đi: tay bớt (không vòi), khay = bánh xích + distance.
    // Bốn màn tay kẹp (mang vật rồi về) viết lại trên vòi phun: tới van, phun, quay đầu (spin() của che-xich.1, thay u_turn hai bánh), về đúng d ô.
    var HN = [{ ma: 'hong-ngoai', o: 'tren' }];
    var DO = XICH.concat(['distance']), DO_VOI = VOI.concat(['distance']);
    function hongNgoai(ma) { var m = xichHoa(ma, DO.slice(), copy(HN)); m.robot.tay = null; return m; }
    ['hong-ngoai.1', 'hong-ngoai.2', 'hong-ngoai.3', 'hong-ngoai.4', 'hong-ngoai.5', 'hong-ngoai.6', 'hong-ngoai.7', 'hong-ngoai.8', 'hong-ngoai.10',
      'che-hong-ngoai.1', 'che-hong-ngoai.2', 'che-hong-ngoai.3', 'che-hong-ngoai.5', 'che-hong-ngoai.6', 'che-hong-ngoai.8', 'che-hong-ngoai.10'].forEach(hongNgoai);
    // hong-ngoai.6: hành lang đầu dài thêm một ô (18 → 19 nhịp) làm mốc cho hong-ngoai.7 (forward(3) và tr_right hai nhịp: 28).
    get('hong-ngoai.6').san.splice(1, 0, '#######.#');
    var BO_KEP = ['vatChat', 'vatThem', 'nhipTheoLoiGiai', 'bongMo'];
    // hong-ngoai.9 "Nhớ số để quay về": ngã ba, mỗi ngả một van xa gần khác nhau. Mỗi chuyến đo d, tới van, phun, quay đầu, về đúng d ô, rẽ trái sang ngả kế;
    // hai van mở hai cửa dưới ngã ba.
    var VE9 = ['for i in range(2):', '    d = distance()', '    forward(d)', '    spray()', '    wait()', '    spin()', '    forward(d)', '    tr_left()', 'forward(3)'];
    xeCuuHoa('hong-ngoai.9', { tay: 'hoi', camBien: copy(HN) }, {
      mucTieu: 'toi-co',
      hamGoc: DO_VOI.slice(), hamCuaEmCan: ['move', 'tr_left', 'spin', 'forward'],
      san: ['#N###', '#.###', '#.###', '#.###', '#...N', '#C###', '#C###', '#F###'], batDau: { x: 1, y: 4, huong: 0 },
      noi: [{ nut: { x: 1, y: 0 }, cua: [{ x: 1, y: 5 }], bang: [] }, { nut: { x: 4, y: 4 }, cua: [{ x: 1, y: 6 }], bang: [] }],
      deBai: 'Xe đứng ở ngã ba. Mỗi ngả có một van ở cuối, xa gần khác nhau; hai van mở hai cửa ở ngả dưới. Mỗi chuyến: đo khoảng cách vào d, tiến tới sát van, phun, quay đầu, đi về đúng d ô rồi rẽ trái sang ngả kế. Xong hai chuyến thì đi xuống qua hai cửa tới cờ.',
      veMaMau: 'Chương trình có sẵn đi về cố định hai ô nên chuyến đầu xe chưa về tới ngã ba. Biến d vẫn còn nhớ số đã đo: dùng lại nó.',
      goiY: ['Biến d giữ số đã đo cho tới khi em gán số khác vào nó.', 'Đi tới mấy ô thì đi về bấy nhiêu ô: đường về cũng dài d ô.'],
      maMau: bai(VE9.slice(0, 6).concat(['    forward(2)'], VE9.slice(7))), loiGiai: bai(VE9),
      loiSai: [
        { moTa: 'Đi về cố định hai ô: chuyến đầu xe chưa về tới ngã ba', baiLam: bai(VE9.slice(0, 6).concat(['    forward(2)'], VE9.slice(7))), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đo lại sau khi quay đầu: d thành số ô tới cửa phía sau, xe đi sai chỗ', baiLam: bai(VE9.slice(0, 6).concat(['    d = distance()'], VE9.slice(6))), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên phun: cửa không mở', baiLam: bai(VE9.slice(0, 3).concat(VE9.slice(5))), phaiCoMa: ['chua-toi-co'] }
      ]
    }, BO_KEP);
    get('hong-ngoai.9').loiGiaiKhac = { moTa: 'Thêm một dòng chú thích trước vòng lặp', baiLam: bai(['# mỗi ngả: đo, tới van, phun, về'].concat(VE9)) };
    // che-hong-ngoai.4 "Đi phun rồi lùi về: go_open()" (cũ go_get() tay kẹp): hàm đo d, tới van, phun, LÙI về đúng d ô bằng back() (xích lùi thẳng, khỏi quay đầu);
    // main khoá. Hai van cách 3 và 0 ô trống (tia nước bay hai ô): số cố định thay d thì hoặc tia không tới van ngả xa, hoặc húc van ngả gần
    // (mỗi cú húc mất một nhịp, hai chiều) nên không đủ sao (kiem-lach-mua-2 C / E).
    var GO_OPEN = ['d = distance()', 'forward(d)', 'spray()', 'wait()', 'for i in range(d):', '    back()'];
    var C4 = ['go_open()', 'tr_right()', 'go_open()', 'tr_right()', 'forward(3)'];
    xeCuuHoa('che-hong-ngoai.4', { tay: 'hoi', camBien: copy(HN) }, {
      mucTieu: 'toi-co',
      ten: 'Đi phun rồi lùi về: go_open()', hamGoc: DO_VOI.slice(), hamCuaEmCan: ['move', 'tr_right', 'forward', 'back'], taoHam: ['go_open'], chinhCoDinh: true,
      san: ['#N##', '#.##', '#.##', '#.##', '#.N#', '#C##', '#C##', '#F##'], batDau: { x: 1, y: 4, huong: 0 },
      noi: [{ nut: { x: 1, y: 0 }, cua: [{ x: 1, y: 5 }], bang: [] }, { nut: { x: 2, y: 4 }, cua: [{ x: 1, y: 6 }], bang: [] }],
      deBai: 'Tạo hàm go_open(): đo khoảng cách vào d, tới sát van, phun, rồi lùi về đúng d ô bằng back(). Chương trình chính đã khóa: go_open(), rẽ phải, go_open(), rẽ phải, rồi đi qua hai cửa tới cờ. Một van ở xa, một van sát mũi xe (d bằng 0).',
      veMaMau: 'Hàm go_open() chưa có. Tạo nó giống màn "Nhớ số để quay về", nhưng xe không quay đầu mà lùi: for i in range(d) rồi back().',
      goiY: ['Biến d trong hàm giữ số đo của lần gọi đó; lần gọi sau đo lại từ đầu.', 'Tiến d ô thì lùi cũng d ô: for i in range(d): back().'],
      maMau: bai(C4), loiGiai: { chinh: C4.slice(), hamCuaMan: [], hamCuaEmMoi: [{ ten: 'go_open', thamSo: [], than: GO_OPEN.slice() }] },
      loiSai: [
        { moTa: 'Gọi go_open() mà chưa tạo hàm', baiLam: bai(C4), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Lùi cố định một ô: ngả đầu xe chưa về tới ngã ba', baiLam: bai(C4), hamCuaEmMoi: [{ ten: 'go_open', thamSo: [], than: GO_OPEN.slice(0, 4).concat(['back()']) }], phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên phun: cửa không mở', baiLam: bai(C4), hamCuaEmMoi: [{ ten: 'go_open', thamSo: [], than: ['d = distance()', 'forward(d)', 'for i in range(d):', '    back()'] }], phaiCoMa: ['chua-toi-co'] }
      ]
    }, BO_KEP);
    get('che-hong-ngoai.4').loiGiaiKhac = { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: bai(C4), hamCuaEmMoi: [{ ten: 'go_open', thamSo: [], than: ['# đo, tới van, phun, lùi về'].concat(GO_OPEN) }] };
    // che-hong-ngoai.7 "Sửa hàm visit()" (cũ take() tay kẹp đo lại sau khi quay đầu): hàm của màn đo lại SAU KHI PHUN (van sát mũi nên d thành 0, xe không lùi về);
    // xoá dòng đo thứ hai. Hai van cách 0 và 3 ô trống (ngược thứ tự với che-hong-ngoai.4).
    var VISIT = GO_OPEN.slice();
    var VISIT_SAI = VISIT.slice(0, 4).concat(['d = distance()'], VISIT.slice(4));
    var C7 = ['visit()', 'tr_left()', 'visit()', 'tr_left()', 'forward(3)'];
    xeCuuHoa('che-hong-ngoai.7', { tay: 'hoi', camBien: copy(HN) }, {
      mucTieu: 'toi-co',
      ten: 'Sửa hàm visit()', hamGoc: DO_VOI.slice(), hamCuaEmCan: ['move', 'tr_left', 'forward', 'back'], chinhCoDinh: true,
      san: ['##...', '####N', 'N....', '####C', '####C', '####F'], batDau: { x: 4, y: 2, huong: 0 },
      noi: [{ nut: { x: 4, y: 1 }, cua: [{ x: 4, y: 3 }], bang: [] }, { nut: { x: 0, y: 2 }, cua: [{ x: 4, y: 4 }], bang: [] }],
      deBai: 'Hàm visit() của màn này tới van, phun rồi lùi về, nhưng nó đo lại sau khi phun: lúc đó van sát mũi xe nên d thành 0 và xe không lùi về. Chương trình chính đã khóa: visit(), rẽ trái, visit(), rẽ trái, rồi qua hai cửa tới cờ. Sửa hàm visit.',
      veMaMau: 'Chạy thử: sau khi phun, d = distance() đo được bao nhiêu?',
      goiY: ['Gán d = distance() lần hai thì số cũ mất. Đường về cần số cũ.', 'Chỉ cần xóa một dòng trong hàm visit.'],
      maMau: bai(C7, [ham('visit', VISIT_SAI)]), loiGiai: bai(C7, [ham('visit', VISIT)]),
      loiSai: [
        { moTa: 'Để nguyên: đo lại sau khi phun, d bằng 0 nên xe không lùi về', baiLam: bai(C7, [ham('visit', VISIT_SAI)]), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Bỏ luôn dòng đo đầu hàm: Python chưa biết d', baiLam: bai(C7, [ham('visit', VISIT.slice(1))]), phaiCoMa: ['loi-chay'] }
      ]
    }, BO_KEP);
    get('che-hong-ngoai.7').loiGiaiKhac = { moTa: 'Sửa xong, thêm một dòng chú thích trong hàm', baiLam: bai(C7, [ham('visit', ['# đường về dùng số đo cũ'].concat(VISIT))]) };
    // che-hong-ngoai.9 "Ngõ hẹp có cửa" (cũ: nhặt vật, chở qua ba đoạn, đặt xuống): ba đoạn bằng go_safe(1), rồi phun van sau lưng mở cửa trước mặt, đi hai ô tới cờ.
    var C9N = ['spray_back()', 'wait()', 'for i in range(3):', '    go_safe(1)', '    tr_right()'];
    xeCuuHoa('che-hong-ngoai.9', { tay: 'hoi', camBien: copy(HN) }, {
      mucTieu: 'toi-co',
      ten: 'Ngõ hẹp có cửa', hamGoc: DO_VOI.slice(), hamCuaEmCan: ['go_safe', 'tr_right', 'move'],
      san: ['#######', '#######', '#.#####', '#.....#', '#.##C##', '#.##F##', '#.##.##', '#.#####', '#N#####'], batDau: { x: 1, y: 7, huong: 0 },
      noi: [{ nut: { x: 1, y: 8 }, cua: [{ x: 4, y: 4 }], bang: [] }],
      deBai: 'Ba đoạn đường, mỗi chỗ rẽ cách tường 1 ô; cờ nằm giữa đoạn thứ ba, sau một cánh cửa. Van mở cửa ở ngay sau lưng xe: phun ra sau trước khi đi.',
      veMaMau: 'Chương trình có sẵn đi bằng go_safe(2) nên rẽ sớm, và chưa mở cửa. Sửa mức an toàn, thêm phần phun ở đầu.',
      goiY: ['Mỗi chỗ rẽ cách tường 1 ô: go_safe(1).', 'Van ở sau lưng: spray_back() rồi wait(), làm trước vòng lặp.'],
      maMau: bai(['for i in range(3):', '    go_safe(2)', '    tr_right()']), loiGiai: bai(C9N),
      loiSai: [
        { moTa: 'go_safe(2): rẽ sớm một ô', baiLam: bai(['spray_back()', 'wait()', 'for i in range(3):', '    go_safe(2)', '    tr_right()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Phun ra trước bằng spray(): tia không trúng van sau lưng, cửa còn đóng', baiLam: bai(['spray()'].concat(C9N.slice(1))), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên phun: cửa còn đóng, xe đứng trước cửa', baiLam: bai(C9N.slice(2)), phaiCoMa: ['chua-toi-co'] }
      ]
    }, BO_KEP);
    get('che-hong-ngoai.9').loiGiaiKhac = { moTa: 'Thêm một dòng chú thích trước vòng lặp', baiLam: bai(['# ba đoạn, mỗi chỗ rẽ cách tường 1 ô'].concat(C9N)) };
    // ---- Gói 4 chương 2 che-sung-hoi (chế lệnh vòi phun): xích + vòi, giữ ý cả mười màn (khay giữ nguyên: lệnh bánh của xích trùng xe hai bánh,
    // che-sung-hoi.8 vẫn thiếu spray_back vì "đầu phun sau hỏng"). u_turn() hai bánh → spin() của xích (che-xich.1).
    ['che-sung-hoi.1', 'che-sung-hoi.2', 'che-sung-hoi.3', 'che-sung-hoi.4', 'che-sung-hoi.5', 'che-sung-hoi.6', 'che-sung-hoi.7', 'che-sung-hoi.8', 'che-sung-hoi.9', 'che-sung-hoi.10'].forEach(function (ma) {
      var pc = get(ma).phanCung;      // che-sung-hoi.8: phần cứng có spray_back (đầu phun sau hỏng: lenh-goc-hong), khay không có
      var m = xichHoa(ma, get(ma).hamGoc.slice());
      if (pc) m.phanCung = pc.slice();
      ['maMau', 'loiGiai', 'loiSai', 'loiGiaiKhac', 'congThucKhac', 'deBai', 'veMaMau', 'goiY'].forEach(function (k) { if (m[k] !== undefined) m[k] = JSON.parse(JSON.stringify(m[k]).replace(/\bu_turn\(\)/g, 'spin()')); });
      m.hamCuaEmCan = m.hamCuaEmCan.map(function (t) { return t === 'u_turn' ? 'spin' : t; });
    });
    // Đường cong nhịp: open_left() của xích tốn sáu nhịp, che-sung-hoi.5 (hai lần open_left) thành 14 nhịp; che-sung-hoi.4 hành lang sau cửa dài thêm hai ô
    // (main khoá thêm hai move(), xe mờ dời theo): 8 → 10 nhịp làm mốc.
    (function () {
      var m = get('che-sung-hoi.4');
      m.san = ['##N#####', '##.#####', '#..C...#', '########']; m.bongMo = Object.assign({}, m.bongMo, { x: 6 });
      [m.maMau, m.loiGiai, m.loiGiaiKhac && m.loiGiaiKhac.baiLam].concat(m.loiSai.map(function (x) { return x.baiLam; })).forEach(function (b) { if (b) b.chinh.push('move()', 'move()'); });
    })();
    // ---- Gói 4 chương 1 bang-chuyen (PDM2a2, 31/10): "Canh băng chở thùng". Băng chuyền không đẩy được xích, nên ý cũ "trôi theo băng" mất; nay băng chở THÙNG NẶNG
    // (man.thungThem: thùng đặt sẵn trên ô băng) tới ô đích, mục tiêu 'day-thung'. Gói 4 chưa có xích đẩy thùng (gói 5) hay phun mạnh (gói 6): xe chỉ đứng chắn / tránh
    // đường thùng (thùng không vào ô có xe), đi ngang băng mà không trôi, và phun van tắt / bật băng (noi) hay mở cửa. Thắng ngay khi mọi thùng nằm trên ô đích, nên
    // chờ dư không tốn nhịp: ngưỡng nhịp đo việc xe nhường đường kịp. Thứ tự chương giữ MUA_2: bang-chuyen 1, 2, 6, 5, 7, 8, 3, 4, 9, 10 (màn 1..10 theo vị trí).
    var CHO = function (n) { return lap(n, ['wait()']); };
    function bangThung(ma, hang, ds) {
      var m = xeCuuHoa(ma, { tay: 'hoi' }, Object.assign({
        hang: hang, hamGoc: VOI.slice(), mucTieu: 'day-thung', taoHam: [], cauTruc: ['for'], khung: { chinh: 10, moiHam: 10, cauTruc: ['for'] }
      }, ds), ['canFor', 'vatChat', 'vatThem', 'nhipTheoLoiGiai', 'bongMo', 'huyHieu'].concat(ds.chiChay ? [] : ['chiChay', 'chinhCoDinh']).concat(ds.noi ? [] : ['noi']));
      if (ds.huyHieu) m.huyHieu = ds.huyHieu;
      return m;
    }
    // Màn 1 (bang-chuyen.1, TRÌNH DIỄN): thùng trên băng tới ô đích sau tám nhịp; xe xích đứng trên băng bên dưới mà không trôi.
    bangThung('bang-chuyen.1', 'lam-quen', {
      ten: 'Băng chở thùng', chiChay: true, chinhCoDinh: true, hamCuaEmCan: [],
      san: ['>>>>D', '.>>>.'], batDau: { x: 1, y: 1, huong: 1 }, thungThem: [{ x: 0, y: 0 }],
      deBai: 'Thùng nặng nằm trên băng chuyền: cứ hai nhịp băng đẩy thùng đi một ô theo mũi tên. Thùng tới ô đích khung vàng là xong. Xe xích đứng trên băng bên dưới nhưng bám chắc nên không trôi. Bấm Chạy xem băng chở thùng.',
      veMaMau: 'Chương trình đã viết sẵn và khoá. Bấm Chạy: xe chỉ chờ, băng làm hết việc.',
      maMau: bai(CHO(8)), loiGiai: bai(CHO(8)),
      goiY: ['Thùng cách ô đích bốn ô, mỗi ô hai nhịp: tám nhịp.', 'Xe xích đứng trên băng không bị đẩy đi; xe hai bánh thì trôi.']
    });
    // Màn 2 (bang-chuyen.2, ÉP): xe đứng giữa đường băng, thùng không vào được ô có xe. Mã mẫu chỉ chờ nên thùng kẹt sau xe; thêm move() vào hốc phía trên.
    bangThung('bang-chuyen.2', 'lam-quen', {
      ten: 'Tránh đường thùng', hamCuaEmCan: ['move'],
      san: ['###.###', '>>>>>>D', '#######'], batDau: { x: 3, y: 1, huong: 0 }, thungThem: [{ x: 0, y: 1 }],
      deBai: 'Xe đang đứng trên băng, ngay đường thùng đi tới ô đích. Thùng không vào được ô có xe. Cho xe tránh vào hốc phía trên rồi chờ thùng qua.',
      veMaMau: 'Chạy thử: xe đứng yên nên thùng kẹt lại sau xe. Thêm một dòng ở đầu chương trình.',
      maMau: bai(CHO(12)), loiGiai: bai(['move()'].concat(CHO(12))),
      loiSai: [
        { moTa: 'Chỉ chờ: thùng kẹt sau xe', baiLam: bai(CHO(12)), phaiCoMa: ['chua-day-thung'] },
        { moTa: 'Lùi xuống: sau lưng là tường', baiLam: bai(['back()'].concat(CHO(12))), phaiCoMa: ['dam-tuong', 'chua-day-thung'] },
        { moTa: 'Chờ quá ít: thùng còn trên băng khi chương trình hết', baiLam: bai(['move()'].concat(CHO(6))), phaiCoMa: ['chua-day-thung'] }
      ],
      goiY: ['Hốc ở ngay trên đầu xe: một move() là ra khỏi băng.', 'Thùng cách ô đích sáu ô: chờ đủ mười hai nhịp.']
    });
    // Màn 3 (bang-chuyen.6): xe đứng ngay trên ô đích, mặt quay vào băng. Quay phải rồi đi lên hốc; đi thẳng là leo lên băng, lại chắn thùng.
    bangThung('bang-chuyen.6', 'lam-quen', {
      ten: 'Rời ô đích', hamCuaEmCan: ['move', 'tr_right', 'tr_left'],
      san: ['######.', '>>>>>>D', '#######'], batDau: { x: 6, y: 1, huong: 3 }, thungThem: [{ x: 1, y: 1 }],
      deBai: 'Xe đỗ ngay trên ô đích nên thùng không có chỗ vào. Rời ô đích lên hốc phía trên, rồi chờ băng chở thùng tới.',
      veMaMau: 'Xe đang quay mặt vào băng. Đi thẳng thì xe lại đứng chắn trên băng.',
      maMau: bai(CHO(10)), loiGiai: bai(['tr_right()', 'move()'].concat(CHO(10))),
      loiSai: [
        { moTa: 'Chỉ chờ: xe đỗ trên ô đích', baiLam: bai(CHO(10)), phaiCoMa: ['chua-day-thung'] },
        { moTa: 'Đi thẳng lên băng: xe chắn thùng', baiLam: bai(['move()'].concat(CHO(10))), phaiCoMa: ['chua-day-thung'] },
        { moTa: 'Quay trái: xe đâm tường, vẫn đỗ trên ô đích', baiLam: bai(['tr_left()', 'move()'].concat(CHO(10))), phaiCoMa: ['dam-tuong', 'chua-day-thung'] }
      ],
      goiY: ['Hốc ở phía trên ô đích. Xe đang quay mặt sang trái: quay phải là mặt hướng lên.', 'Xe xích quay bằng tr_right(), mất hai nhịp.']
    });
    // Màn 4 (bang-chuyen.5): hai băng song song, xe đứng chắn băng trên; hốc ở dưới băng dưới: xích đi ngang băng dưới mà không trôi. Dừng trên băng dưới là chắn thùng kia.
    bangThung('bang-chuyen.5', 'luyen', {
      ten: 'Đi ngang băng', hamCuaEmCan: ['move'],
      san: ['>>>>>D', '>>>>>D', '###.##'], batDau: { x: 3, y: 0, huong: 2 }, thungThem: [{ x: 0, y: 0 }, { x: 0, y: 1 }],
      deBai: 'Hai băng chở hai thùng tới hai ô đích. Xe đứng chắn trên băng thứ nhất; hốc trống nằm dưới băng thứ hai. Đi thẳng xuống, ngang qua băng thứ hai, vào hốc rồi chờ.',
      veMaMau: 'Chương trình có sẵn chỉ chờ. Xe xích đi ngang băng không bị trôi, nhưng đứng lại trên băng nào là chắn thùng của băng đó.',
      maMau: bai(CHO(10)), loiGiai: bai(['move()', 'move()'].concat(CHO(10))),
      loiSai: [
        { moTa: 'Chỉ chờ: xe chắn băng trên', baiLam: bai(CHO(10)), phaiCoMa: ['chua-day-thung'] },
        { moTa: 'Một move(): xe đứng trên băng dưới, chắn thùng thứ hai', baiLam: bai(['move()'].concat(CHO(10))), phaiCoMa: ['chua-day-thung'] }
      ],
      goiY: ['Từ chỗ xe tới hốc là hai ô thẳng xuống.', 'Hai thùng cách ô đích năm ô: mười nhịp.']
    });
    // Màn 5 (bang-chuyen.7): xe đỗ trên ô đích, lối ra là cửa đóng ngay dưới; van bên phải mở cửa (nhắc gói 2). Phun, quay xuống, vào cửa.
    bangThung('bang-chuyen.7', 'luyen', {
      ten: 'Mở cửa nhường đường', hamCuaEmCan: ['move', 'tr_right'],
      san: ['>>>>DN', '####C#'], batDau: { x: 4, y: 0, huong: 1 }, thungThem: [{ x: 0, y: 0 }],
      noi: [{ nut: { x: 5, y: 0 }, cua: [{ x: 4, y: 1 }], bang: [] }],
      deBai: 'Xe đỗ trên ô đích, lối ra duy nhất là cánh cửa đóng ngay dưới xe. Van trước mũi xe mở cửa đó. Phun van, quay xuống, đi vào ô cửa rồi chờ thùng tới.',
      veMaMau: 'Chạy thử: cửa còn đóng nên xe không ra được, thùng không có chỗ vào.',
      maMau: bai(['tr_right()', 'move()'].concat(CHO(8))), loiGiai: bai(['spray()', 'wait()', 'tr_right()', 'move()'].concat(CHO(8))),
      loiSai: [
        { moTa: 'Quên phun: cửa còn đóng, xe húc cửa', baiLam: bai(['tr_right()', 'move()'].concat(CHO(8))), phaiCoMa: ['dam-tuong', 'chua-day-thung'] },
        { moTa: 'Quay trái lên trên: xe húc tường, vẫn đỗ trên ô đích', baiLam: bai(['spray()', 'wait()', 'tr_left()', 'move()'].concat(CHO(8))), phaiCoMa: ['dam-tuong', 'chua-day-thung'] },
        { moTa: 'Đi lùi ra băng: xe chắn thùng', baiLam: bai(['spray()', 'wait()', 'back()'].concat(CHO(8))), phaiCoMa: ['chua-day-thung'] }
      ],
      goiY: ['spray() rồi wait() là phun một lần.', 'Mở cửa xong thì tr_right() cho mũi xe hướng xuống cửa.']
    });
    // Màn 6 (bang-chuyen.8): hai thùng. Xe đỗ trên ô đích dưới, lối ra đi qua ô đích trên mà thùng trên chỉ cần hai nhịp là vào: phun van trên tắt băng trước,
    // đi qua, rồi phun van cuối hành lang bật băng lại (open_at của gói 2). Không tắt thì thùng trên chặn đường, xe kẹt trên ô đích dưới.
    bangThung('bang-chuyen.8', 'luyen', {
      ten: 'Tắt băng cho xe qua', hamCuaEmCan: ['tr_right', 'open_at'],
      san: ['#Nv##', '#DD.N', '#^###', '#^###'], batDau: { x: 1, y: 1, huong: 0 }, thungThem: [{ x: 2, y: 0 }, { x: 1, y: 3 }],
      noi: [{ nut: { x: 1, y: 0 }, cua: [], bang: [{ x: 2, y: 0 }] }, { nut: { x: 4, y: 1 }, cua: [], bang: [{ x: 2, y: 0 }] }],
      deBai: 'Xe đỗ trên một ô đích, chắn thùng từ dưới lên. Lối ra đi qua ô đích bên cạnh, mà thùng trên băng chỉ còn một ô là vào đó. Phun van trước mũi xe để tắt băng đó, đi qua, rồi phun van cuối hành lang để bật lại băng. Chờ thùng vào.',
      veMaMau: 'Chạy thử: xe quay chưa xong thì thùng đã vào ô đích bên cạnh và chắn lối ra.',
      maMau: bai(['tr_right()', 'open_at(2)', 'wait()', 'wait()']), loiGiai: bai(['spray()', 'wait()', 'tr_right()', 'open_at(2)', 'wait()', 'wait()']),
      loiSai: [
        { moTa: 'Không tắt băng: thùng chắn lối ra, xe kẹt', baiLam: bai(['tr_right()', 'open_at(2)', 'wait()', 'wait()']), phaiCoMa: ['dam-tuong', 'chua-day-thung'] },
        { moTa: 'Quên bật lại băng: thùng trên đứng yên', baiLam: bai(['spray()', 'wait()', 'tr_right()', 'forward(2)', 'wait()', 'wait()', 'wait()']), phaiCoMa: ['chua-day-thung'] },
        { moTa: 'Bật lại băng rồi thôi chờ: chương trình hết trước khi thùng vào', baiLam: bai(['spray()', 'wait()', 'tr_right()', 'open_at(2)']), phaiCoMa: ['chua-day-thung'] }
      ],
      goiY: ['Van trên tắt băng, van cuối hành lang bật lại cùng băng đó.', 'open_at(2) đi hai ô rồi phun van trước mũi; bật băng xong còn chờ hai nhịp.']
    });
    // Màn 7 (bang-chuyen.3, biến thể): van mở cửa ở bên kia băng, thùng trên băng đang nằm ngay trước mũi xe nên tia nước trúng thùng. Chờ thùng đi qua rồi mới phun.
    var CHO_QUA = CHO(2).concat(['spray()', 'wait()', 'tr_left()', 'move()']);
    bangThung('bang-chuyen.3', 'bien-the', {
      ten: 'Chờ thùng qua rồi phun', hamCuaEmCan: ['move', 'tr_left'],
      san: ['##N##', '>>>>D', '#CD##', '##^##', '##^##'], batDau: { x: 2, y: 2, huong: 0 }, thungThem: [{ x: 2, y: 1 }, { x: 2, y: 4 }],
      noi: [{ nut: { x: 2, y: 0 }, cua: [{ x: 1, y: 2 }], bang: [] }],
      deBai: 'Xe đỗ trên ô đích, lối ra là cửa bên trái. Van mở cửa nằm bên kia băng, ngay trước mũi xe, nhưng một thùng trên băng đang chắn giữa: tia nước trúng thùng thì không tới van. Chờ thùng đi qua rồi phun, quay trái, vào ô cửa.',
      veMaMau: 'Chạy thử: phun ngay thì tia nước trúng thùng, cửa vẫn đóng.',
      maMau: bai(['spray()', 'wait()', 'tr_left()', 'move()'].concat(CHO(2))), loiGiai: bai(CHO_QUA),
      loiSai: [
        { moTa: 'Phun ngay: tia nước trúng thùng, cửa đóng', baiLam: bai(['spray()', 'wait()', 'tr_left()', 'move()'].concat(CHO(2))), phaiCoMa: ['ban-bi-chan', 'chua-day-thung'] },
        { moTa: 'Chờ một nhịp: thùng vẫn còn trước mũi xe', baiLam: bai(['wait()', 'spray()', 'wait()', 'tr_left()', 'move()', 'wait()']), phaiCoMa: ['ban-bi-chan', 'chua-day-thung'] },
        { moTa: 'Quay phải: lối ra ở bên trái', baiLam: bai(CHO(2).concat(['spray()', 'wait()', 'tr_right()', 'move()'])), phaiCoMa: ['dam-tuong', 'chua-day-thung'] }
      ],
      goiY: ['Băng đẩy thùng đi một ô mỗi hai nhịp: chờ hai nhịp là thùng qua khỏi trước mũi xe.', 'Tia nước bay qua ô băng trống, không bay qua thùng.']
    });
    // Màn 8 (bang-chuyen.4, biến thể): như "Tắt băng cho xe qua" nhưng lối ra đi qua HAI ô đích, mỗi ô một băng; một van tắt cả hai băng, van cuối hành lang bật lại cả hai.
    bangThung('bang-chuyen.4', 'bien-the', {
      ten: 'Một van hai băng', hamCuaEmCan: ['tr_right', 'open_at'],
      san: ['#Nvv##', '#DDD.N', '#^####', '#^####'], batDau: { x: 1, y: 1, huong: 0 }, thungThem: [{ x: 2, y: 0 }, { x: 3, y: 0 }, { x: 1, y: 3 }],
      noi: [{ nut: { x: 1, y: 0 }, cua: [], bang: [{ x: 2, y: 0 }, { x: 3, y: 0 }] }, { nut: { x: 5, y: 1 }, cua: [], bang: [{ x: 2, y: 0 }, { x: 3, y: 0 }] }],
      deBai: 'Ba thùng, ba ô đích. Xe đỗ trên ô đích bên trái; lối ra đi qua hai ô đích kia, mỗi ô có một thùng sắp rơi xuống. Van trước mũi xe tắt cùng lúc cả hai băng, van cuối hành lang bật lại cả hai.',
      veMaMau: 'Chương trình của màn "Tắt băng cho xe qua" chỉ đi hai ô: lần này hành lang dài hơn.',
      maMau: bai(['spray()', 'wait()', 'tr_right()', 'open_at(2)', 'wait()', 'wait()']), loiGiai: bai(['spray()', 'wait()', 'tr_right()', 'open_at(3)', 'wait()', 'wait()']),
      loiSai: [
        { moTa: 'Đi hai ô như màn trước: xe đứng trên ô đích thứ ba, tia nước không tới van', baiLam: bai(['spray()', 'wait()', 'tr_right()', 'open_at(2)', 'wait()', 'wait()']), phaiCoMa: ['chua-day-thung'] },
        { moTa: 'Không tắt băng: thùng chắn lối ra', baiLam: bai(['tr_right()', 'open_at(3)', 'wait()', 'wait()']), phaiCoMa: ['dam-tuong', 'chua-day-thung'] },
        { moTa: 'Quên bật lại: hai thùng đứng yên trên băng', baiLam: bai(['spray()', 'wait()', 'tr_right()', 'forward(3)'].concat(CHO(3))), phaiCoMa: ['chua-day-thung'] }
      ],
      goiY: ['Một van có thể điều khiển nhiều băng.', 'Từ ô đích bên trái tới ô sát van cuối là ba ô: open_at(3).']
    });
    // Màn 9 (bang-chuyen.9, biến thể): van SAU LƯNG (spray_back, gói 2) làm hai việc: mở cửa trước mũi xe và tắt băng dưới ô đích kế cửa. Xe không cần quay.
    bangThung('bang-chuyen.9', 'bien-the', {
      ten: 'Một lần phun hai việc', hamCuaEmCan: ['open_at'],
      san: ['NDCD.N', '#^#^##', '#^####'], batDau: { x: 1, y: 0, huong: 1 }, thungThem: [{ x: 3, y: 1 }, { x: 1, y: 2 }],
      noi: [{ nut: { x: 0, y: 0 }, cua: [{ x: 2, y: 0 }], bang: [{ x: 3, y: 1 }] }, { nut: { x: 5, y: 0 }, cua: [], bang: [{ x: 3, y: 1 }] }],
      deBai: 'Xe đỗ trên ô đích, mũi quay vào cánh cửa đóng. Van sau lưng xe làm hai việc: mở cửa và tắt băng dưới ô đích ngay sau cửa. Phun ra sau, đi qua cửa và ô đích, phun van cuối hành lang bật lại băng rồi chờ.',
      veMaMau: 'Chạy thử: phun ra trước thì tia nước trúng cánh cửa đóng.',
      maMau: bai(['spray()', 'wait()', 'open_at(3)', 'wait()', 'wait()']), loiGiai: bai(['spray_back()', 'wait()', 'open_at(3)', 'wait()', 'wait()']),
      loiSai: [
        { moTa: 'Phun ra trước: tia nước trúng cửa đóng', baiLam: bai(['spray()', 'wait()', 'open_at(3)', 'wait()', 'wait()']), phaiCoMa: ['ban-bi-chan', 'chua-day-thung'] },
        { moTa: 'Quên bật lại băng: thùng đứng yên', baiLam: bai(['spray_back()', 'wait()', 'forward(3)'].concat(CHO(3))), phaiCoMa: ['chua-day-thung'] },
        { moTa: 'Đi hai ô: xe đứng trên ô đích kế cửa, chắn thùng', baiLam: bai(['spray_back()', 'wait()', 'open_at(2)', 'wait()', 'wait()']), phaiCoMa: ['chua-day-thung'] }
      ],
      goiY: ['spray_back() phun ra sau đuôi xe.', 'Một lần phun van sau lưng vừa mở cửa vừa tắt băng.']
    });
    // Màn 10 (bang-chuyen.10, TRÙM): ba thùng. Chờ thùng trên băng đi qua tầm phun (màn 7), phun van làm hai việc: mở cửa bên trái và tắt băng của ô đích sau cửa
    // (màn 9), quay trái, đi qua cửa và ô đích, phun van cuối bật lại băng (màn 6, 8), chờ. Phun ngay thì trúng thùng; chờ dư một nhịp thì mất sao nhịp.
    var TRUM_BC = CHO(2).concat(['spray()', 'wait()', 'tr_left()', 'open_at(3)', 'wait()', 'wait()']);
    bangThung('bang-chuyen.10', 'trum', {
      ten: 'Trùm: Ba thùng ba đích', huyHieu: { ma: 'bang-chuyen', ten: 'Huy hiệu Canh băng chở thùng' }, hamCuaEmCan: ['tr_left', 'open_at'],
      san: ['####N#', '#>>>>D', 'N.DCD#', '##^#^#', '##^###'], batDau: { x: 4, y: 2, huong: 0 }, thungThem: [{ x: 4, y: 1 }, { x: 2, y: 4 }, { x: 4, y: 3 }],
      noi: [{ nut: { x: 4, y: 0 }, cua: [{ x: 3, y: 2 }], bang: [{ x: 2, y: 3 }, { x: 2, y: 4 }] }, { nut: { x: 0, y: 2 }, cua: [], bang: [{ x: 2, y: 3 }, { x: 2, y: 4 }] }],
      deBai: 'Ba thùng, ba ô đích. Xe đỗ trên một ô đích. Van trước mũi xe, bên kia băng, làm hai việc: mở cửa bên trái và tắt băng dưới ô đích sau cửa. Một thùng trên băng đang chắn tầm phun. Mở đường ra, đi qua ô đích, bật lại băng ở van cuối rồi chờ cả ba thùng vào đích.',
      veMaMau: 'Viết cả chương trình. Nhớ lại: chờ thùng qua rồi phun, van làm hai việc, đi qua ô đích rồi bật lại băng.',
      maMau: bai([]), loiGiai: bai(TRUM_BC),
      loiSai: [
        { moTa: 'Phun ngay: tia nước trúng thùng, cửa đóng, băng vẫn chạy', baiLam: bai(TRUM_BC.slice(2)), phaiCoMa: ['ban-bi-chan', 'chua-day-thung'] },
        { moTa: 'Dừng ở ô cửa, không bật lại băng: thùng dưới đứng yên', baiLam: bai(CHO(2).concat(['spray()', 'wait()', 'tr_left()', 'move()'], CHO(6))), phaiCoMa: ['chua-day-thung'] },
        { moTa: 'Quay phải: bên phải là tường', baiLam: bai(CHO(2).concat(['spray()', 'wait()', 'tr_right()', 'open_at(3)', 'wait()', 'wait()'])), phaiCoMa: ['dam-tuong', 'chua-day-thung'] },
        { moTa: 'Đi qua cửa nhưng quên bật lại băng', baiLam: bai(CHO(2).concat(['spray()', 'wait()', 'tr_left()', 'forward(3)'], CHO(3))), phaiCoMa: ['chua-day-thung'] }
      ],
      goiY: ['Thùng trên băng cần hai nhịp để đi qua khỏi trước mũi xe.', 'Sau cửa là ô đích rồi một ô trống; đứng ở ô trống đó thì van cuối ngay trước mũi: open_at(3).']
    });
    // Hàm của em mà bản cũ của một màn mùa 2 dạy (tay kẹp / cảm biến khoảng cách / băng đẩy xe) nay không màn nào dạy nữa (DAY_CU: [mã màn, tên hàm]).
    // Màn mùa ẩn còn gọi chúng (đội cũ, chế lệnh xích cũ…) nhận hàm đó thành HÀM CỦA MÀN (thân như bản cũ), bỏ khỏi hamCuaEmCan: vẫn chạy được
    // bằng "Mở hết", lời giải / ngưỡng sao không đổi. Không sửa gì khác ở màn ẩn.
    // Hàm vẫn dạy nhưng thân đổi sang hàm quay của xích (THAN_CU: right(k), step(a, b)…): màn ẩn hai bánh gọi chúng nhận bản cũ thành hàm của màn, che hàm của em.
    var HAM_CU = {}, DAY_CU = [['che-xich.6', 'pick_behind'], ['che-cam-bien.5', 'bounce'], ['che-cam-bien.9', 'fetch_back'], ['tham-so.6', 'deliver']];
    // PDM2c 31/10: gói Đội về gói 9 mùa 2 (gói 10 gọi hàm nó dạy như hàm của em bình thường); gói Bệ vòi xích CẤT (CAT_MUA_2).
    // PDM2c2 31/10: gói 10 dựng lại không gọi hàm Bệ vòi xích nữa: bỏ CAP_HAM_CU (cấp bản cũ cho gói 10) và các mục DAY_CU của che-be-sung.
    var chuongAn = {};
    TT.goi.forEach(function (g) { if (TT.mua.some(function (x) { return x.ma === g.mua && x.an; })) g.chuong.forEach(function (c) { chuongAn[c] = true; }); });
    // PDM3a / PDM3b2 / PDM4c 31/10 (mùa 3, 4 part đúng mùa): mọi gói mùa 3, 4 đã dựng lại; màn xe cũ ở mùa ẩn dùng DAY_CU bên dưới.
    CAT_MUA_3.chuong.forEach(function (c) { delete chuongAn[c[0]]; });
    CAT_MUA_4.chuong.forEach(function (c) { delete chuongAn[c[0]]; });
    MUA_4.forEach(function (g) { g.chuong.forEach(function (c) { delete chuongAn[c[0]]; }); });
    MUA_6.forEach(function (g) { g.chuong.forEach(function (c) { delete chuongAn[c[0]]; }); });
    if (nguon['che-nam-cham.1']) DAY_CU.push(['che-nam-cham.1', 'kick']);
    if (nguon['nam-cham.6']) DAY_CU.push(['nam-cham.6', 'grip']);
    if (nguon['che-nam-cham.2']) DAY_CU.push(['che-nam-cham.2', 'reel']);
    if (nguon['che-nam-cham.4']) DAY_CU.push(['che-nam-cham.4', 'lane']);
    if (nguon['che-nam-cham.5']) DAY_CU.push(['che-nam-cham.5', 'sort']);
    if (nguon['che-nam-cham.6']) DAY_CU.push(['che-nam-cham.6', 'fling']);
    if (nguon['che-nhen.6']) DAY_CU.push(['che-nhen.6', 'bring']);
    if (nguon['che-son-tren-cao.1']) DAY_CU.push(['che-son-tren-cao.1', 'sow_line']);
    if (nguon['che-son-tren-cao.2']) DAY_CU.push(['che-son-tren-cao.2', 'retrace']);
    if (nguon['che-son-tren-cao.3']) DAY_CU.push(['che-son-tren-cao.3', 'plant_list']);
    if (nguon['che-son-tren-cao.6']) DAY_CU.push(['che-son-tren-cao.6', 'trace_marks']);
    DAY_CU.forEach(function (x) {
      HAM_CU[x[1]] = copy(nguon[x[0]].loiGiai.hamCuaEmMoi.filter(function (h) { return h.ten === x[1]; })[0]);
    });
    // PDM2b 31/10: gói 6–7 (luc-ban, che-luc-ban, do-nhiet, che-do-nhiet) đổi thẳng ở NGÂN HÀNG sang xích (turn_* → tr_*, u_turn → spin, front_clear → distance),
    // nên bản hai bánh của các hàm của em đó không còn trong `nguon`: khai cứng ở đây cho màn ẩn (doi-sung-hoi gọi squirt_left, be-sung gọi switch_left…).
    [['luc-ban.8', { ten: 'smart_spray', thamSo: [], than: ['if front_clear():', '    squirt("high")', 'else:', '    squirt("low")'] }],
      ['che-luc-ban.2', { ten: 'auto_left', thamSo: [], than: ['turn_left()', 'auto_spray()', 'turn_right()'] }],
      ['che-luc-ban.4', { ten: 'auto_right', thamSo: [], than: ['turn_right()', 'auto_spray()', 'turn_left()'] }],
      ['che-luc-ban.5', { ten: 'squirt_left', thamSo: ['p'], than: ['turn_left()', 'squirt(p)', 'turn_right()'] }],
      ['che-luc-ban.8', { ten: 'auto_turn', thamSo: [], than: ['auto_spray()', 'turn_left()'] }],
      ['che-do-nhiet.2', { ten: 'switch_left', thamSo: [], than: ['turn_left()', 'switch_on()', 'turn_right()'] }],
      ['che-do-nhiet.4', { ten: 'find_warm', thamSo: [], than: ['turn_right()', 'while not warm():', '    turn_right()'] }],
      ['che-do-nhiet.7', { ten: 'switch_right', thamSo: [], than: ['turn_right()', 'switch_on()', 'turn_left()'] }],
      ['che-do-nhiet.8', { ten: 'auto_left_on', thamSo: [], than: ['turn_left()', 'auto_on()', 'turn_right()'] }],
      ['may-son.6', { ten: 'dots', thamSo: ['n'], than: ['for i in range(n):', '    dot()', '    move()', '    move()'] }],
      ['che-cam-bon.2', { ten: 'go_to', thamSo: ['col'], than: ['while color("front") != col:', '    move()'] }],
      ['che-cam-bon.4', { ten: 'green_step', thamSo: [], than: ['if color("front") == "green":', '    move()', 'elif color("left") == "green":', '    turn_left()', 'else:', '    turn_right()'] }],
      ['che-cam-bon.6', { ten: 'sort_by_color', thamSo: [], than: ['c = color("front")', 'pick()', 'if c == "red":', '    turn_right()', '    drop()', '    turn_left()', 'else:', '    turn_left()', '    drop()', '    turn_right()'] }],
      ['may-son.10', { ten: 'frame', thamSo: [], than: ['for i in range(4):', '    forward(2)', '    turn_right()'] }],
      ['che-may-son.1', { ten: 'line', thamSo: ['n'], than: ['pen_down()', 'forward(n)', 'pen_up()', 'wait()'] }],
      ['che-may-son.2', { ten: 'color_line', thamSo: ['c', 'n'], than: ['ink(c)', 'line(n)'] }],
      ['che-may-son.3', { ten: 'next_row', thamSo: ['n'], than: ['for i in range(n):', '    back()', 'turn_right()', 'move()', 'turn_left()'] }],
      ['che-may-son.5', { ten: 'sow_rows', thamSo: ['colors'], than: ['for c in colors:', '    color_line(c, 3)', '    next_row(3)'] }],
      ['che-may-son.6', { ten: 'copy_row', thamSo: ['n'], than: ['seen = []', 'for i in range(n):', '    seen.append(color("left"))', '    move()', 'next_row(n)', 'for c in seen:', '    ink(c)', '    dot()', '    move()'] }],
      ['che-may-son.9', { ten: 'fill_gaps', thamSo: ['c', 'n'], than: ['ink(c)', 'for i in range(n):', '    if color("front") == "none":', '        move()', '        dot()', '    else:', '        move()'] }],
      ['che-nhin-duoi.5', { ten: 'deliver_up', thamSo: ['n'], than: ['magnet_n()', 'wait()', 'for i in range(n):', '    go_up()', 'magnet_off()', 'wait()'] }],
      ['che-nhin-duoi.6', { ten: 'lift_by_color', thamSo: [], than: ['c = color("here")', 'magnet_n()', 'wait()', 'if c == "red":', '    go_up()', 'else:', '    go_down()', 'magnet_off()', 'wait()'] }]
    ].forEach(function (x) { THAN_CU.push(x); });
    THAN_CU.forEach(function (x) { HAM_CU[x[1].ten] = copy(x[1]); DAY_CU.push([x[0], x[1].ten]); });
    // Dò bắc cầu: màn gọi thẳng, hay gọi hàm của em (kho cộng dồn theo lời giải các màn trước) mà thân nó gọi tới các hàm cũ.
    var khoEm = {};
    var thanCua = function (ds) { return (ds || []).reduce(function (a, h) { return a.concat(h.than); }, []); };
    var dongBai = function (b) { return b ? [].concat(b.chinh || [], (b.doi || []).reduce(function (a, d) { return a.concat(d.chinh || []); }, []), thanCua(b.hamCuaMan)) : []; };
    /** Các hàm cũ (HAM_CU) mà các dòng `dong` (cùng tên `batDau`) chạy tới, bắc cầu qua kho; trừ tên `tuCo` (bài tự có, kể cả hàm của em mới). */
    function hamCuToi(dong, batDau, tuCo) {
      var da = {}, cho = batDau.slice();
      dong.forEach(function (l) { (l.match(/[A-Za-z_]\w*(?=\s*\()/g) || []).forEach(function (t) { cho.push(t); }); });
      while (cho.length) {
        var t = cho.pop();
        if (da[t]) continue;
        da[t] = true;
        var th = khoEm[t] || (HAM_CU[t] && HAM_CU[t].than);
        if (th && tuCo.indexOf(t) < 0) th.forEach(function (l) { (l.match(/[A-Za-z_]\w*(?=\s*\()/g) || []).forEach(function (x) { cho.push(x); }); });
      }
      return Object.keys(HAM_CU).filter(function (t) { return da[t] && tuCo.indexOf(t) < 0; });
    }
    M.danhSach.forEach(function (m) {
      var lg = m.loiGiai || {}, tuCo = (lg.hamCuaMan || []).concat(lg.hamCuaEmMoi || []).map(function (h) { return h.ten; });
      var cachLap = ((m.lapRap || {}).cachLap || []).map(function (c) { return c.loiGiai; }).filter(Boolean);      // màn lắp ráp: mỗi cách lắp có lời giải riêng
      var dong = [].concat(lg.chinh || [], (m.maMau || {}).chinh || [], (lg.doi || []).reduce(function (a, d) { return a.concat(d.chinh || []); }, []),
        thanCua((lg.hamCuaMan || []).concat(lg.hamCuaEmMoi || [])),
        cachLap.reduce(function (a, b) { return a.concat(b.chinh || [], thanCua(b.hamCuaMan)); }, []));
      var can = hamCuToi(dong, m.hamCuaEmCan || [], tuCo);
      // PDM2a2: lời sai / công thức khác gọi hàm cũ mà lời giải không gọi (doi-nam-cham.7 #3 "R2 tự lái đi lấy": fetch_back) cũng tính: bản cũ người chơi có hàm đó
      // trong kho ở mọi màn sau, nên màn ẩn cấp nó (hàm của màn) cho mọi bài, kể cả mã mẫu.
      (m.loiSai || []).concat(m.congThucKhac || []).forEach(function (s) {
        var b = s.baiLam || {}, tu = (b.hamCuaMan || []).concat(s.hamCuaEmMoi || []).map(function (h) { return h.ten; });
        hamCuToi(dongBai(b).concat(thanCua(s.hamCuaEmMoi)), [], tu.concat(tuCo)).forEach(function (t) { if (can.indexOf(t) < 0) can.push(t); });
      });
      if (!m.tietKiemNhip) (lg.hamCuaEmMoi || []).forEach(function (h) { khoEm[h.ten] = h.than; });
      if (!can.length || !chuongAn[m.chuong] || DAY_CU.some(function (x) { return x[0] === m.ma; })) return;
      m.hamCuaEmCan = m.hamCuaEmCan.filter(function (t) { return !HAM_CU[t]; });
      var coWhile = can.some(function (t) { return HAM_CU[t].than.some(function (l) { return /^\s*while\b/.test(l); }); });
      [m.maMau, m.loiGiai, m.loiGiaiKhac && m.loiGiaiKhac.baiLam].concat((m.loiSai || []).concat(m.congThucKhac || []).map(function (s) { return s.baiLam; }), cachLap).forEach(function (b) {
        if (!b) return;
        b.hamCuaMan = (b.hamCuaMan || []).concat(can.map(function (t) { return Object.assign(copy(HAM_CU[t]), { capCu: true }); }));   // capCu: bản cũ cấp lại, không phải dòng người chơi viết (kiem-lo-trinh (g) bỏ qua)
      });
      // Hàm của màn có `while` (fetch_back, bounce…): chương trình có vòng while nên chạy quá nhịp là vong-vo-han (cham.js coWhile xét mọi dòng của chương trình
      // + hàm của màn; hàm của em không tính). Bản cũ hàm đó là hàm của em nên lời sai "chờ mãi" ra qua-nhieu-nhip; nay người chơi thấy vong-vo-han (cùng ý: chạy mãi).
      if (coWhile) (m.loiSai || []).forEach(function (s) {
        var i = s.phaiCoMa ? s.phaiCoMa.indexOf('qua-nhieu-nhip') : -1;
        if (i >= 0) s.phaiCoMa = s.phaiCoMa.slice(0, i).concat(s.phaiCoMa.indexOf('vong-vo-han') < 0 ? ['vong-vo-han'] : [], s.phaiCoMa.slice(i + 1));
      });
    });
  })();

  // ---------------------------------------------------------------- TÊN HIỂN THỊ THEO QUY TẮC ĐẶT TÊN (user duyệt 29/10, hội đồng 20261029-1738; KE-HOACH-7-MUA.md mục "Quy tắc đặt tên")
  // Tên mùa = nơi robot làm việc; tên gói = món mới hay tình huống mới (cùng tên với thẻ bộ phận); tên chương = việc em làm, không lặp tên gói,
  // không "Hàm cho…"; chương tạo hàm thì "Chế lệnh: …". Chỉ đổi CHỮ HIỂN THỊ: mã gói / chương (khoá lưu tiến độ) giữ nguyên.
  // Mùa 2 đổi 29/10 sau khi vòi phun / van hơi gộp (phun → phun ở tên và phim; chữ trong màn đổi ở đợt riêng).
  (function () {
    var TEN_MUA = { 'mua-1': 'Kho hàng',      // user 29/10: mùa 1 là xe bê vác làm ở kho (trước: Xưởng R1)
                     'mua-2': 'Nhà máy', 'mua-3': 'Bãi tái chế',      // user 30/10: bãi tái chế phế liệu (trước: Mỏ quặng)
                     'mua-4': 'Cảng sông', 'mua-5': 'Bến sông', 'mua-6': 'Nông trại', 'mua-7': 'Mỏ đá', 'mua-8': 'Hang động', 'mua-9': 'CLB' };      // 31/10: đúng thứ tự 9 mùa (mùa 4 Cảng sông, mùa 5 Bến sông, mùa 6 Nông trại, mùa 7 Mỏ đá, mùa 8 Hang động, mùa 9 CLB)
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
      'xich': 'Quay hai nhịp', 'bien-xich': 'Đi xoắn ốc',       // PDM2a 31/10: gói 1 chưa cảm biến, biến đếm độ dài đoạn xoắn ốc (trước: Đếm bước để về)
      'sung-hoi': 'Phun mở van', 'tham-so': 'Đi mấy ô tùy em',
      'hong-ngoai': 'Còn mấy ô?', 'che-hong-ngoai': 'Chế lệnh: tới sát tường',
      'bang-chuyen': 'Canh băng chở thùng',      // PDM2a2 31/10: băng chở thùng, xích không trôi (trước: Trôi theo băng)
      'che-sung-hoi': 'Chế lệnh: mở van',
      'day-thung': 'Đưa thùng vào đích', 'che-day-thung': 'Chế lệnh: đẩy n ô',
      'luc-ban': 'Phun mạnh, phun nhẹ', 'che-luc-ban': 'Chế lệnh: chọn lực',
      'do-nhiet': 'Tìm van nóng', 'che-do-nhiet': 'Chế lệnh: mở van nguội',
      'doi-mua-2': 'Nhường đường', 'che-doi-mua-2': 'Chế lệnh: chờ bạn',
      'kho-cu': 'Lách qua kho cũ', 'che-kho-cu': 'Chế lệnh: dọn kho cũ',      // PDM2b 31/10: gói 8 Góc kho cũ (xe cứu hỏa gặp nút đè, hàng rào, thùng gỗ)
      'be-sung': 'Phun không lùi', 'che-be-sung': 'Chế lệnh: phun ba hướng',
      'tong-hop-2': 'Thử mọi món', 'trum-mua-2': 'Nhà máy chạy lại'
    };
    Object.keys(TEN_CHUONG_2).forEach(function (c) { TT.ten[c] = TEN_CHUONG_2[c]; });
    // 30/10 (user: "Đổi huy hiệu"): huy hiệu mùa 1, 2 mang tên chương chứa màn trùm ("Chế lệnh: x" → "Chế lệnh x", bỏ dấu hỏi cuối). Chỉ đổi tên; mã huy hiệu (hình vẽ) giữ.
    var chuong12 = {};
    TT.goi.forEach(function (g) { if (g.mua === 'mua-1' || g.mua === 'mua-2') g.chuong.forEach(function (c) { chuong12[c] = true; }); });
    M.danhSach.forEach(function (m) {
      if (m.huyHieu && chuong12[m.chuong] && TT.ten[m.chuong]) m.huyHieu.ten = 'Huy hiệu ' + TT.ten[m.chuong].replace(': ', ' ').replace(/\?$/, '');
    });
    // Mùa 3: gói 3 đổi tên ngay trong MUA_3 ("Cảm biến từ", user 29/10); các tên khác của mùa 3 đặt theo quy tắc khi làm P2.
  })();

  // 29/10 (user chốt): PHUN NHẸ LÀ MẶC ĐỊNH, lực mạnh spray("high") mở khoá từ gói 6 Lực phun. Mọi màn từ luc-ban.1 trở đi (và từng robot của màn đội)
  // được chọn lực, trừ màn khai lucBan: false; lõi bỏ qua cờ ở robot không có vòi phun. Màn trước đó chỉ phun nhẹ (spray() không đối số).
  (function () {
    var i0 = M.danhSach.indexOf(get('luc-ban.1'));
    M.danhSach.forEach(function (m, i) {
      if (i < i0) return;
      if (m.doi) m.doi.forEach(function (r) { if (r && r.lucBan === undefined) r.lucBan = true; });      // màn đội: cờ khai theo từng xe
      else if (m.lucBan === undefined) m.lucBan = true;
    });
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
