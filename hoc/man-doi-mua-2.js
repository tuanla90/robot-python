/* ============================================================================
   man-doi-mua-2.js — "Robot Chấn Hưng": NGÂN HÀNG MÀN MỚI của mùa 2, gói 8 "Đội" (KE-HOACH-MUA-2.md).
   Khung mùa 2 (lo-trinh-hoc.js, khối "MÙA 2 = 10 GÓI", mảng MUA_2) đã chừa chỗ: tệp đã có trong danh sách require của lo-trinh-hoc.js và
   thẻ <script> của game/choi.html. Gói sau CHỈ việc thêm màn vào mảng DS dưới đây; màn tự hiện đúng chương, đúng gói.
     - `doi-mua-2` (mã doi-mua-2.1 … doi-mua-2.10): chương 1: đội xích + súng hơi, hồng ngoại thấy robot
     - `che-doi-mua-2` (mã che-doi-mua-2.1 … che-doi-mua-2.10): chương 2 "Đội phối hợp"
   Mỗi màn khai `chuong` (một trong các mã trên) và `so` (1, 2, …: thứ tự trong phần màn mới của chương); mã `ma` = chuong + '.' + so là khóa lưu sao,
   KHÔNG đổi sau khi xuất bản. Gọi ManHoc.chuanHoa(m) như các tệp màn khác. Chương còn trống thì chưa hiện; gói chưa có chương nào có màn thì chưa hiện.
   Ràng buộc mùa 2 (hoc/kiem-lo-trinh.mjs): robot chỉ dùng part mùa 1 + xích + súng hơi (+ hồng ngoại khi lõi có); không bậc thang S, hố u, gầm n;
   biến chỉ từ gói 1 chương 2, hàm có tham số chỉ từ gói 2 chương 2 (tham-so); hàm của em cần phải được tạo ở màn đứng trước.
   Tệp này KHÔNG tự thêm màn vào ManHoc: danh sách nằm ở ManHoc.manDoiMua2, lo-trinh-hoc.js thêm vào chương rồi xếp chỗ (so, hang do dungChuong đặt).

   NỘI DUNG (28/10): ĐỘI HAI ROBOT, mỗi robot một chương trình, nhịp chung (luật nhiều robot của san-hoc.js: đồng đội là vật cản, đi lần lượt R1 rồi R2).
     R1 (sơn vàng) = XE XÍCH + mắt hồng ngoại (distance, warm); quay bằng tr_right() / tr_left() (2 nhịp); màn có thùng khai xichDay (xích tiến là đẩy thùng).
     R2 (sơn lam)  = XE HAI BÁNH + SÚNG HƠI + mắt hồng ngoại (distance, warm); lucBan (fire("fast") / fire("charge")).
   Ý của gói: hồng ngoại THẤY ROBOT. warm() là True khi vật cản đầu tiên trước mũi xe là robot đồng đội (robot đang chạy thì nóng), hay nút bắn đang bật;
   distance() đếm số ô trống tới đồng đội như tới tường. Robot dùng chúng để biết đồng đội đang đứng trước mặt: chờ bạn đi khỏi đường bóng, chờ bạn tới,
   nhường đường, bắn nút mở cửa cho bạn, xích đẩy thùng dọn đường cho xe súng, đứng thành hàng.
   MỌI màn KHÓA chương trình chính của CẢ HAI robot (doi[i].coDinh: người chơi xem được, không sửa); người chơi viết / sửa thân MỘT hàm mà chương trình
   khóa gọi ở nhiều chỗ, mỗi chỗ đồng đội chắn lâu chóng khác nhau (hay không chắn): thân cố định (không đọc cảm biến) chạy y nhau ở mọi lần gọi nên
   không thắng được trong ngưỡng nhịp. Chương 1: hàm của màn (không vào kho). Chương 2 "Đội phối hợp": hàm của em (taoHam, vào kho), có hàm cả hai
   robot cùng gọi (thân chỉ dùng lệnh xe nào cũng có), hàm gọi hàm, hàm có tham số, sửa hàm lỗi.
   kiem-doi-mua-2.mjs + do-duong-doi-mua-2.mjs kiểm: mọi thân cố định đủ ngắn đều không thắng trong sao.nhip (liệt kê đủ, chấm thật bằng cham.js).
   Không beSung (gói 9). Một sân mỗi màn, nhiều sân chỉ ở trùm.
   Dữ liệu: man.doi = [phần riêng R1, phần riêng R2] (batDau, loaiRobot, robot, hamGoc, co, coDinh; R2 có lucBan, R1 có xichDay); cấp ngoài là của R1.
   Bài làm: { doi: [{ chinh }, { chinh }], hamCuaMan }; sao.o / sao.nhip đo bằng cham.js trên lời giải. Hướng: 0 lên, 1 phải, 2 xuống, 3 trái.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var MAT = ['distance', 'warm'];
  var HN = [{ ma: 'hong-ngoai', o: 'tren' }];
  var XICH = { loaiRobot: 'xich', robot: { than: 'xich', tay: null, camBien: HN, son: 'vang' }, hamGoc: BANH.concat(MAT) };
  var SUNG = { loaiRobot: 'banh', robot: { than: 'hai-banh', tay: 'hoi', camBien: HN, son: 'lam' }, hamGoc: BANH.concat(['shoot', 'shoot_back'], MAT), lucBan: true };

  function sao(x) { return JSON.parse(JSON.stringify(x)); }
  /** Thụt mọi dòng vào một bậc (4 dấu cách). */
  function thut(ds) { return ds.map(function (s) { return '    ' + s; }); }
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  function FOR(n, than, bien) { return ['for ' + (bien || 'i') + ' in range(' + n + '):'].concat(thut(than)); }
  function WHILE(dk, than) { return ['while ' + dk + ':'].concat(thut(than)); }
  function IF(dk, co, khong) { return ['if ' + dk + ':'].concat(thut(co), khong ? ['else:'].concat(thut(khong)) : []); }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function o(x, y) { return { x: x, y: y }; }
  /** Nhóm nối: nút (x, y) mở các cửa [[x, y], …]. */
  function noi(x, y, cua) { return { nut: o(x, y), cua: cua.map(function (c) { return o(c[0], c[1]); }) }; }
  function CHO(n) { return FOR(n, ['wait()']); }

  /**
   * Bài làm của màn: chương trình khóa hai robot (c = [R1, R2]) + hàm của màn (chương 1) hay hàm của em mới (chương 2).
   * hm: [H(...)] hàm của màn; em: [H(...)] hàm của em mới (chỉ ở lời giải / lời giải khác / lời sai của màn tạo hàm).
   */
  function B(c, hm, em) {
    var b = { doi: [{ chinh: c[0].slice() }, { chinh: c[1].slice() }], hamCuaMan: sao(hm || []) };
    if (em) b.hamCuaEmMoi = sao(em);
    return b;
  }

  /**
   * Trường chung. m.bd: [batDau R1, batDau R2] (trùm: mỗi phần là mảng ô theo sân); m.co: [cờ riêng R1, cờ riêng R2];
   * m.chinh: [chương trình R1, chương trình R2] (KHÓA: mã mẫu = lời giải ở phần chương trình chính); m.xichDay: xích đẩy thùng.
   * m.hamMau: hàm của màn ở mã mẫu (bản sửa / bản trống); m.ham: hàm của màn ở lời giải; m.hamEm: hàm của em mới ở lời giải (taoHam).
   * Lời giải khác, công thức khác, lời sai khai { moTa, ham | hamEm, phaiCoMa } (chương trình chính luôn là chương trình khóa).
   */
  function man(m) {
    var bd = m.bd, co = m.co, chinh = m.chinh, xichDay = m.xichDay;
    var cung = function (x) { return x.ham !== undefined || x.hamEm !== undefined ? B(chinh, x.ham || [], x.hamEm) : x.baiLam; };
    m.hang = m.so <= 3 ? 'lam-quen' : m.so <= 6 ? 'luyen' : m.so <= 9 ? 'bien-the' : 'trum';
    m.cauTruc = ['for', 'if', 'while'];
    m.mucTieu = m.mucTieu || 'toi-co';
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    if (Array.isArray(m.san[0])) m.nhipTheo = 'tong';
    m.doi = [Object.assign({ batDau: bd[0] }, sao(XICH)), Object.assign({ batDau: bd[1] }, sao(SUNG))];
    m.doi.forEach(function (d, i) { d.coDinh = true; if (co && co[i]) d.co = sao(co[i]); });
    if (xichDay) m.doi[0].xichDay = true;
    m.batDau = bd[0]; m.loaiRobot = XICH.loaiRobot; m.robot = sao(XICH.robot); m.hamGoc = XICH.hamGoc.slice();   // cấp ngoài = R1
    m.maMau = B(chinh, m.hamMau || []);
    m.loiGiai = B(chinh, m.ham || [], m.hamEm);
    if (m.loiGiaiKhac) m.loiGiaiKhac = { moTa: m.loiGiaiKhac.moTa, baiLam: cung(m.loiGiaiKhac) };
    if (m.congThucKhac) m.congThucKhac = m.congThucKhac.map(function (x) { return { moTa: x.moTa, baiLam: cung(x) }; });
    m.loiSai = (m.loiSai || []).map(function (x) { return { moTa: x.moTa, baiLam: cung(x), phaiCoMa: x.phaiCoMa }; });
    ['bd', 'co', 'chinh', 'xichDay', 'hamMau', 'ham', 'hamEm'].forEach(function (k) { delete m[k]; });
    m.taoHam = m.taoHam || [];
    return ManHoc.chuanHoa(m);
  }

  /* ------------------------------------------------------------------- sân */

  // doi-mua-2.1: hành lang dưới (hàng 5) của R2 có ba cửa (3,5), (5,5), (7,5); mỗi cửa mở bằng nút ở đầu một giếng dọc (2,1), (4,1), (6,1).
  //   Hành lang giữa (hàng 3) của R1 cắt ngang ba giếng. R2 ở mỗi giếng quay lên bắn tụ (sau lưng là tường: giật chặn, xe đứng yên).
  //   R1 đứng ở trạm (2,3) năm nhịp, ở trạm (6,3) bốn nhịp: đứng trong giếng thì bóng trúng R1. Cờ R1 (8,3), cờ R2 (8,5).
  var SAN_1 = ['##########', '##N#N#N###', '##.#.#.###', '##......F#', '##.#.#.###', '#..C.C.CF#', '##########'];
  var NOI_1 = [noi(2, 1, [[3, 5]]), noi(4, 1, [[5, 5]]), noi(6, 1, [[7, 5]])];
  var R1_1 = nhieu(CHO(5), ['forward(4)'], CHO(4), ['forward(2)']);
  var R2_1 = nhieu(FOR(3, ['move()', 'turn_left()', 'clear_shot()', 'fire("charge")', 'turn_right()', 'move()']), ['move()']);

  // doi-mua-2.2: ba khoang hai cửa trên hành lang trên (hàng 1) của R1: cửa vào (6,1), (10,1), (14,1) đang mở, cửa ra (8,1), (12,1), (16,1) đang đóng, khoang ở giữa
  //   (7,1), (11,1), (15,1). Một nút dưới chân R2 (7,4), (11,4), (15,4) đổi CẢ HAI cửa của một khoang: cửa vào đóng, cửa ra mở. R1 đi tới cửa ra rồi chờ nó mở.
  //   R2 ở hành lang dưới (hàng 3), nhìn lên giếng thấy khoang. Bắn sớm khi R1 chưa vào khoang thì cửa vào đóng trước mặt R1, R1 kẹt mãi.
  //   R1 xuất phát xa khoang đầu (phải chờ lâu), tới hai khoang sau thì R1 đã đứng chờ sẵn. Cờ R1 (17,1), cờ R2 (16,3).
  var SAN_2 = ['###################', '#.....c.C.c.C.c.CF#', '#######.###.###.###', '#######.........F##', '#######N###N###N###', '###################'];
  var NOI_2 = [noi(7, 4, [[6, 1], [8, 1]]), noi(11, 4, [[10, 1], [12, 1]]), noi(15, 4, [[14, 1], [16, 1]])];
  var R1_2 = nhieu(FOR(3, nhieu(['go_to_wall()'], WHILE('distance() == 0', ['wait()']))), ['go_to_wall()']);
  var R2_2 = FOR(3, ['mate_in()', 'u_turn()', 'fire("fast")', 'turn_left()', 'forward(4)', 'turn_left()']);

  // doi-mua-2.3: hành lang bậc thang (phải 3, xuống 2, ba lần). R1 xích đi trước, mỗi góc quay mất hai nhịp (tr_right / tr_left); R2 đi sau, mỗi bước gọi keep_gap()
  //   rồi tiến một ô. R2 húc vào R1 thì mất bước đó (chương trình khóa đếm đúng số bước). Cờ R2 (10,7) ở chân bậc cuối, cờ R1 (12,7) phía trước.
  var SAN_3 = ['###############', '#....##########', '####.##########', '####....#######', '#######.#######', '#######....####', '##########.####', '##########F.F##', '###############'];
  var R1_3 = nhieu(['move()'], FOR(3, ['tr_right()', 'forward(2)', 'tr_left()', 'forward(3)']));
  var R2_3 = FOR(3, nhieu(FOR(3, ['keep_gap()', 'move()'], 'j'), ['turn_right()'], FOR(2, ['keep_gap()', 'move()'], 'j'), ['turn_left()']));

  // doi-mua-2.4: ba khoang: cửa vào của R1 (3,1), (6,1), (9,1) đang mở; R1 đi qua ô cửa sổ (4,1), (7,1), (10,1) ngay trên giếng của R2. Nút (4,0), (7,0), (10,0) ở tường trên,
  //   bắn qua cửa sổ mới trúng: nút đổi cửa vào của R1 (mở thành đóng) và cửa của R2 ở hành lang dưới (5,3), (8,3), (11,3) (đóng thành mở).
  //   Bắn trước khi R1 qua cửa vào thì cửa đóng trước mặt R1; bắn khi R1 còn đứng ở cửa sổ thì bóng trúng R1. R1 đứng ở cửa sổ 2 tám nhịp, cửa sổ 3 năm nhịp.
  var SAN_4 = ['####N##N##N###', '#..c..c..c..F#', '####.##.##.###', '####.C..C..CF#', '##############'];
  var NOI_4 = [noi(4, 0, [[3, 1], [5, 3]]), noi(7, 0, [[6, 1], [8, 3]]), noi(10, 0, [[9, 1], [11, 3]])];
  var R1_4 = nhieu(['forward(6)'], CHO(8), ['forward(3)'], CHO(5), ['forward(2)']);
  var R2_4 = FOR(3, ['after_pass()', 'fire("charge")', 'turn_right()', 'forward(3)', 'turn_left()']);

  /* ------------------------------------------------------------- thân hàm hay dùng */
  var CHO_DI = WHILE('warm()', ['wait()']);              // còn thấy đồng đội (hay nút nóng) trước mũi xe thì chờ
  var CHO_TOI = WHILE('not warm()', ['wait()']);         // chờ tới khi thấy đồng đội trước mũi xe
  var CHO_SAT = WHILE('distance() == 0', ['wait()']);    // sát vật cản (đồng đội) thì chờ
  var CHO_QUA = CHO_TOI.concat(CHO_DI);                  // chờ bạn tới rồi chờ bạn đi khỏi

  var DS = [
    /* ================================================================ chương doi-mua-2: hồng ngoại thấy robot */
    man({
      chuong: 'doi-mua-2', so: 1, ten: 'Bạn chắn đường bóng', yMoi: 'warm() thấy đồng đội: robot trước mũi xe là nóng; while warm(): wait()',
      hamCuaEmCan: ['move', 'forward', 'turn_left', 'turn_right', 'fire'],
      deBai: 'Gói Đội: R1 là xe xích, R2 là xe súng, xe nào cũng có mắt hồng ngoại. warm() là True cả khi vật cản trước mũi xe là ROBOT ĐỒNG ĐỘI: robot đang chạy thì nóng. ' +
        'Chương trình hai xe đã khóa. R2 đi dọc hành lang dưới, ở mỗi giếng quay lên bắn nút để mở cửa phía trước. R1 chạy hành lang giữa, dừng ở các trạm lâu chóng khác nhau: ' +
        'R1 đứng trong giếng thì bóng trúng R1, nút không đổi. Viết thân clear_shot(): còn thấy bạn trước mũi xe thì chờ.',
      veMaMau: 'Hai chương trình bị khóa, chạm thẻ R1 / R2 để đọc. clear_shot() còn trống: chạy thử xem bóng đầu tiên trúng gì.',
      san: SAN_1, noi: NOI_1, bd: [{ x: 2, y: 3, huong: 1 }, { x: 1, y: 5, huong: 1 }], co: [[o(8, 3)], [o(8, 5)]],
      chinh: [R1_1, R2_1],
      hamMau: [H('clear_shot', [], ['pass'])],
      ham: [H('clear_shot', [], CHO_DI)],
      sao: { o: 27, nhip: 20 },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', ham: [H('clear_shot', [], ['# bạn còn trước mũi xe thì chờ'].concat(CHO_DI))] },
      loiSai: [
        { moTa: 'Để trống: bắn ngay, bóng trúng R1, cửa đầu tiên vẫn đóng', ham: [H('clear_shot', [], ['pass'])], phaiCoMa: ['ban-bi-chan', 'chua-toi-co'] },
        { moTa: 'Chờ cố định hai nhịp: ở giếng đầu R1 còn đứng đó', ham: [H('clear_shot', [], CHO(2))], phaiCoMa: ['ban-bi-chan', 'chua-toi-co'] },
        { moTa: 'Viết while not warm(): giếng trống thì nút tắt không nóng, R2 chờ mãi', ham: [H('clear_shot', [], CHO_TOI)], phaiCoMa: ['vong-vo-han'] }
      ],
      goiY: ['R1 đứng trong giếng thì warm() là True: bóng bắn lúc đó sẽ trúng R1.', 'Thân clear_shot(): while warm(): wait().']
    }),

    man({
      chuong: 'doi-mua-2', so: 2, ten: 'Đón bạn vào khoang', yMoi: 'while not warm(): wait(): chờ tới khi thấy đồng đội đã vào khoang rồi mới bắn',
      hamCuaEmCan: ['go_to_wall', 'move', 'u_turn', 'turn_left', 'forward', 'fire'],
      deBai: 'R1 đi qua ba khoang hai cửa: cửa vào đang mở, cửa ra đang đóng. Mỗi khoang có một nút dưới chân R2; bắn nút thì cửa vào đóng lại và cửa ra mở. ' +
        'Bắn sớm khi R1 chưa vào khoang thì cửa vào đóng ngay trước mặt R1, R1 kẹt mãi. R2 nhìn lên giếng thấy khoang. Viết thân mate_in(): chờ tới khi thấy R1 trong khoang.',
      veMaMau: 'Hai chương trình bị khóa. mate_in() còn trống: chạy thử xem cửa nào đóng trước mặt R1.',
      san: SAN_2, noi: NOI_2, bd: [{ x: 1, y: 1, huong: 1 }, { x: 7, y: 3, huong: 0 }], co: [[o(17, 1)], [o(16, 3)]],
      chinh: [R1_2, R2_2],
      hamMau: [H('mate_in', [], ['pass'])],
      ham: [H('mate_in', [], CHO_TOI)],
      sao: { o: 28, nhip: 26 },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', ham: [H('mate_in', [], ['# chờ tới khi thấy bạn trong khoang'].concat(CHO_TOI))] },
      loiSai: [
        { moTa: 'Để trống: bắn ngay, cửa vào đóng trước mặt R1', ham: [H('mate_in', [], ['pass'])], phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Viết while warm(): khoang còn trống thì không nóng, R2 bắn ngay', ham: [H('mate_in', [], CHO_DI)], phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Chờ cố định hai nhịp: R1 còn chưa tới cửa vào khoang đầu', ham: [H('mate_in', [], CHO(2))], phaiCoMa: ['vong-vo-han'] }
      ],
      goiY: ['Khoang trống thì mắt hồng ngoại thấy tường phía trên: không nóng. R1 vào khoang thì warm() là True.', 'Thân mate_in(): while not warm(): wait().']
    }),

    man({
      chuong: 'doi-mua-2', so: 3, ten: 'Theo sau xe xích', yMoi: 'distance() đếm ô trống tới đồng đội: sát bạn (distance() == 0) thì chờ, không húc vào bạn',
      hamCuaEmCan: ['move', 'tr_right', 'tr_left', 'forward', 'turn_right', 'turn_left', 'back'],
      deBai: 'Hành lang bậc thang hẹp. R1 xe xích đi trước, tới mỗi góc phải quay mất hai nhịp. R2 đi sau: mỗi bước gọi keep_gap() rồi tiến một ô. ' +
        'R2 húc vào R1 thì bước đó mất, R2 không tới được cờ. distance() đếm cả số ô trống tới đồng đội. Viết thân keep_gap(): còn sát bạn thì chờ.',
      veMaMau: 'Hai chương trình bị khóa. keep_gap() còn trống: chạy thử xem R2 húc R1 ở góc nào.',
      san: SAN_3, bd: [{ x: 3, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }], co: [[o(12, 7)], [o(10, 7)]],
      chinh: [R1_3, R2_3],
      hamMau: [H('keep_gap', [], ['pass'])],
      ham: [H('keep_gap', [], CHO_SAT)],
      sao: { o: 32, nhip: 27 },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', ham: [H('keep_gap', [], ['# sát bạn thì chờ'].concat(CHO_SAT))] },
      congThucKhac: [{ moTa: 'Chờ khi còn thấy bạn trước mặt (while warm()): vẫn tới cờ nhưng chậm hơn một nhịp', ham: [H('keep_gap', [], CHO_DI)] }],
      loiSai: [
        { moTa: 'Để trống: tới góc thứ nhất R2 húc vào R1 đang quay', ham: [H('keep_gap', [], ['pass'])], phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Sát bạn thì lùi một ô: R2 mất một bước, dừng trước cờ', ham: [H('keep_gap', [], IF('distance() == 0', ['back()']))], phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Viết while distance() > 0: còn khoảng trống thì chờ, R2 đứng mãi', ham: [H('keep_gap', [], WHILE('distance() > 0', ['wait()']))], phaiCoMa: ['vong-vo-han'] }
      ],
      goiY: ['R1 ngay trước mũi R2 thì distance() là 0.', 'Thân keep_gap(): while distance() == 0: wait().']
    }),

    /* ------------------------------------------------ hàng 2: luyện */
    man({
      chuong: 'doi-mua-2', so: 4, ten: 'Bạn qua rồi mới bắn', yMoi: 'hai vòng chờ nối nhau trong một hàm: chờ bạn tới cửa sổ, rồi chờ bạn đi khỏi đường bóng',
      hamCuaEmCan: ['forward', 'move', 'turn_right', 'turn_left', 'fire'],
      deBai: 'Mỗi nút ở tường trên đổi hai cửa: cửa vào của R1 (đang mở thành đóng) và cửa của R2 ở hành lang dưới (đang đóng thành mở). R2 bắn qua giếng và ô cửa sổ trên đường R1. ' +
        'Bắn khi R1 chưa qua cửa vào thì cửa đóng ngay trước mặt R1. Bắn khi R1 còn đứng ở cửa sổ thì bóng trúng R1. R1 đứng ở các cửa sổ lâu chóng khác nhau. ' +
        'Viết thân after_pass(): chờ tới khi thấy R1 ở cửa sổ, rồi chờ tới khi R1 đi khỏi.',
      veMaMau: 'Hai chương trình bị khóa. after_pass() còn trống: chạy thử xem cửa nào đóng trước mặt R1.',
      san: SAN_4, noi: NOI_4, bd: [{ x: 1, y: 1, huong: 1 }, { x: 4, y: 3, huong: 0 }], co: [[o(12, 1)], [o(12, 3)]],
      chinh: [R1_4, R2_4],
      hamMau: [H('after_pass', [], ['pass'])],
      ham: [H('after_pass', [], CHO_QUA)],
      sao: { o: 28, nhip: 27 },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', ham: [H('after_pass', [], ['# chờ bạn tới rồi chờ bạn đi'].concat(CHO_QUA))] },
      loiSai: [
        { moTa: 'Để trống: bắn ngay, cửa vào đóng trước mặt R1', ham: [H('after_pass', [], ['pass'])], phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Chỉ chờ bạn tới: bắn lúc R1 còn đứng ở cửa sổ, bóng trúng R1', ham: [H('after_pass', [], CHO_TOI)], phaiCoMa: ['ban-bi-chan'] },
        { moTa: 'Chỉ chờ bạn đi khỏi: cửa sổ còn trống nên bắn ngay, cửa vào đóng trước mặt R1', ham: [H('after_pass', [], CHO_DI)], phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Hai vòng while nối nhau: vòng đầu chờ warm() thành True, vòng sau chờ nó thành False.', 'while not warm(): wait() rồi while warm(): wait().']
    })
  ];

  ManHoc.manDoiMua2 = DS;
  if (laNode) module.exports = ManHoc;
})();
