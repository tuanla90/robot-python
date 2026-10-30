/* ============================================================================
   man-doi-mua-2.js — "Robot Chấn Hưng": NGÂN HÀNG MÀN MỚI của mùa 2, gói 9 "R2 trở lại" (mã gói doi-mua-2; KE-HOACH-PART-DUNG-MUA.md mục 1, PDM2c 31/10).
   Khung mùa 2 (lo-trinh-hoc.js, khối "MÙA 2 = 10 GÓI", mảng MUA_2) đã chừa chỗ: tệp đã có trong danh sách require của lo-trinh-hoc.js và
   thẻ <script> của game/choi.html. Gói sau CHỈ việc thêm màn vào mảng DS dưới đây; màn tự hiện đúng chương, đúng gói.
     - `doi-mua-2` (mã doi-mua-2.1 … doi-mua-2.10): chương 1 "Nhường đường": hàm của màn, cảm biến thấy đồng đội
     - `che-doi-mua-2` (mã che-doi-mua-2.1 … che-doi-mua-2.10): chương 2 "Chế lệnh: chờ bạn": hàm của em
   Mỗi màn khai `chuong` (một trong các mã trên) và `so` (1, 2, …: thứ tự trong phần màn mới của chương); mã `ma` = chuong + '.' + so là khóa lưu sao,
   KHÔNG đổi sau khi xuất bản. Gọi ManHoc.chuanHoa(m) như các tệp màn khác. Chương còn trống thì chưa hiện; gói chưa có chương nào có màn thì chưa hiện.
   Ràng buộc mùa 2 (hoc/kiem-lo-trinh.mjs): không bậc thang S, hố u, gầm n; biến chỉ từ gói 1 chương 2, hàm có tham số chỉ từ gói 2 chương 2 (tham-so);
   hàm của em cần phải được tạo ở màn đứng trước. Tệp này KHÔNG tự thêm màn vào ManHoc: danh sách nằm ở ManHoc.manDoiMua2, lo-trinh-hoc.js thêm vào chương rồi xếp chỗ.

   NỘI DUNG (PDM2c 31/10, luật part đúng mùa): ĐỘI HAI ROBOT, mỗi robot một chương trình, nhịp chung (luật nhiều robot của san-hoc.js: đồng đội là vật cản,
   đi lần lượt R1 rồi R2 trong mỗi nhịp).
     R1 (sơn vàng) = XE CỨU HỎA đầy đủ của mùa 2: thân XÍCH (quay hai nhịp tr_right / tr_left; màn có thùng nặng khai xichDay) + VÒI PHUN (lucBan: squirt("low" / "high"),
        phun mạnh thì giật như mọi xe) + mắt HỒNG NGOẠI (distance, warm).
     R2 (sơn lam, Luna mang tới) = XE CHỞ HÀNG mùa 1 đầy đủ: HAI BÁNH (có lùi, quay một nhịp) + TAY XOAY (pick / drop, gắp thùng gỗ o mà xích không gắp được)
        + CẢM BIẾN KHOẢNG CÁCH ba hướng (front_clear / left_clear / right_clear). R2 KHÔNG có part mùa 2 (kiem-part-mua.mjs chặn).
   Ý của gói: cảm biến THẤY ĐỒNG ĐỘI. Hồng ngoại của R1: warm() là True khi vật cản đầu tiên trước mũi xe là robot đồng đội (robot đang chạy thì nóng) hay van đang bật;
   distance() đếm số ô trống tới đồng đội / thùng gỗ như tới tường. Cảm biến khoảng cách của R2: front_clear() là False khi R1 đứng ngay trước mũi (như mùa 1 thấy tường).
   Mỗi xe làm việc xe kia không làm được: R1 phun van mở cửa, đẩy thùng nặng; R2 gắp thùng gỗ o chắn đường (thùng gỗ chắn cả xe lẫn tia nước, không nóng).
   MỌI màn KHÓA chương trình chính của CẢ HAI robot (doi[i].coDinh: người chơi xem được, không sửa); người chơi viết / sửa thân MỘT hàm mà chương trình khóa
   gọi ở nhiều chỗ (hay nhiều lượt), mỗi chỗ đồng đội chắn lâu chóng khác nhau: thân cố định (không đọc cảm biến) chạy y nhau ở mọi lần gọi nên không thắng
   được trong ngưỡng nhịp. Chương 1: hàm của màn (không vào kho). Chương 2 "Chế lệnh: chờ bạn": hàm của em (taoHam, vào kho): hàm gọi hàm, hàm có tham số, sửa hàm lỗi.
   kiem-doi-mua-2.mjs + do-duong-doi-mua-2.mjs kiểm: mọi thân cố định đủ ngắn đều không thắng trong sao.nhip (liệt kê đủ, chấm thật bằng cham.js).
   Một sân mỗi màn, nhiều sân chỉ ở trùm. Đường cong: doi-mua-2.1 nối sau che-kho-cu.9 (7 nhịp, 7 ô) nên các màn đầu rất nhỏ rồi lớn dần (kiem-lo-trinh (g)).
   Dữ liệu: man.doi = [phần riêng R1, phần riêng R2] (batDau, loaiRobot, robot, hamGoc, co, coDinh; R1 có lucBan, xichDay); cấp ngoài là của R1.
   Bài làm: { doi: [{ chinh }, { chinh }], hamCuaMan }; sao.o / sao.nhip đo bằng cham.js trên lời giải. Hướng: 0 lên, 1 phải, 2 xuống, 3 trái.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var HN = [{ ma: 'hong-ngoai', o: 'tren' }];
  var KC = [{ ma: 'khoang-cach', o: 'hong' }];
  var CUU_HOA = { loaiRobot: 'xich', robot: { than: 'xich', tay: 'hoi', camBien: HN, son: 'vang' }, hamGoc: BANH.concat(['spray', 'spray_back', 'distance', 'warm']), lucBan: true };
  var CHO_HANG = { loaiRobot: 'banh', robot: { than: 'hai-banh', tay: 'xoay', camBien: KC, son: 'lam' },
    hamGoc: BANH.concat(['arm_down', 'arm_up', 'arm_left', 'arm_right', 'grab', 'release', 'front_clear', 'left_clear', 'right_clear']) };

  function sao(x) { return JSON.parse(JSON.stringify(x)); }
  /** Thụt mọi dòng vào một bậc (4 dấu cách). */
  function thut(ds) { return ds.map(function (s) { return '    ' + s; }); }
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  function FOR(n, than, bien) { return ['for ' + (bien || 'i') + ' in range(' + n + '):'].concat(thut(than)); }
  function WHILE(dk, than) { return ['while ' + dk + ':'].concat(thut(than)); }
  function IF(dk, co, khong) { return ['if ' + dk + ':'].concat(thut(co), khong ? ['else:'].concat(thut(khong)) : []); }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function o(x, y) { return { x: x, y: y }; }
  /** Nhóm nối: van (x, y) đổi các cửa [[x, y], …]. */
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
    m.doi = [Object.assign({ batDau: bd[0] }, sao(CUU_HOA)), Object.assign({ batDau: bd[1] }, sao(CHO_HANG))];
    // Màn R1 không phun (khongPhun): khay R1 không có spray / spray_back (vòi vẫn gắn): squirt_back("high") giật tới là một bước đi "không húc" nên thân cố định né được cảm biến.
    if (m.khongPhun) m.doi[0].hamGoc = m.doi[0].hamGoc.filter(function (t) { return t !== 'spray' && t !== 'spray_back'; });
    m.doi.forEach(function (d, i) { d.coDinh = true; if (co && co[i]) d.co = sao(co[i]); });
    if (xichDay) m.doi[0].xichDay = true;
    m.batDau = bd[0]; m.loaiRobot = CUU_HOA.loaiRobot; m.robot = sao(CUU_HOA.robot); m.hamGoc = m.doi[0].hamGoc.slice(); m.lucBan = true;   // cấp ngoài = R1
    m.maMau = B(chinh, m.hamMau || []);
    m.loiGiai = B(chinh, m.ham || [], m.hamEm);
    if (m.loiGiaiKhac) m.loiGiaiKhac = { moTa: m.loiGiaiKhac.moTa, baiLam: cung(m.loiGiaiKhac) };
    if (m.congThucKhac) m.congThucKhac = m.congThucKhac.map(function (x) { return { moTa: x.moTa, baiLam: cung(x) }; });
    m.loiSai = (m.loiSai || []).map(function (x) { return { moTa: x.moTa, baiLam: cung(x), phaiCoMa: x.phaiCoMa }; });
    ['bd', 'co', 'chinh', 'xichDay', 'hamMau', 'ham', 'hamEm', 'khongPhun'].forEach(function (k) { delete m[k]; });
    m.taoHam = m.taoHam || [];
    return ManHoc.chuanHoa(m);
  }

  /* ------------------------------------------------------------------- sân */

  // doi-mua-2.1: giếng nhỏ. R2 đứng chắn trong giếng (1,1) rồi đi; R1 (1,2) nhìn lên van (1,0) qua giếng, phun mạnh (sau lưng là tường nên không giật) mở cửa (2,2) rồi quẹo phải tới cờ.
  //   wait_cool() gọi hai lần: trước khi phun (R2 chắn 5 nhịp) và trước khi đi (không ai chắn): thân chờ cố định đủ cho lần đầu thì lần sau chờ thừa.
  var SAN_1 = ['#N###', '#...F', '#.CF#'];
  var NOI_1 = [noi(1, 0, [[2, 2]])];
  var R1_1 = ['wait_cool()', 'squirt("high")', 'tr_right()', 'wait_cool()', 'forward(2)'];
  var R2_1 = nhieu(CHO(4), ['forward(3)']);

  // doi-mua-2.2: hành lang chữ Z. R1 xích đi trước, tới góc đầu dừng một nhịp rồi quay (hai nhịp), góc sau quay ngay; R2 đi sau, mỗi bước gọi keep_gap() rồi tiến. Cờ R1 (5,2), cờ R2 (4,2).
  var SAN_2 = ['......', '###.##', '###.FF', '###..#'];
  var R1_2 = ['move()', 'wait()', 'tr_right()', 'forward(2)', 'tr_left()', 'forward(2)'];
  var R2_2 = nhieu(FOR(2, ['keep_gap()', 'move()']), ['turn_right()'], FOR(2, ['keep_gap()', 'move()']), ['turn_left()', 'keep_gap()', 'move()']);

  // doi-mua-2.3: hành lang ngang (hàng 2) của R1 cắt đường chữ U của R2 ở hai ngã tư (2,2) và (5,2). R2 xuất phát ngay trong ngã tư đầu, đứng ba nhịp rồi đi vòng
  //   xuống hàng 4, lên lại qua ngã tư hai tới cờ (5,0). R1 gọi wait_cross() trước mỗi bước; húc vào R2 thì mất bước. Cờ R1 (7,3).
  var SAN_3 = ['#####F###', '##.##.###', '#........', '##.##.#F#', '##....###'];     // (8,2): đi quá chỗ rẽ thì tr_right / move đâm tường (thân cố định đi dư không thắng)
  var R1_3 = nhieu(FOR(6, ['wait_cross()', 'move()']), ['tr_right()', 'move()']);
  var R2_3 = nhieu(CHO(3), ['forward(2)', 'turn_left()', 'forward(3)', 'turn_left()', 'forward(4)']);

  // doi-mua-2.4: hai khoang hai cửa trên hành lang của R2 (hàng 0): cửa vào (1,0), (4,0) đang mở, cửa ra (3,0), (6,0) đang đóng, khoang (2,0), (5,0).
  //   Van (2,3), (5,3) sau lưng R1 đổi CẢ HAI cửa của một khoang: cửa vào đóng, cửa ra mở. R1 nhìn lên giếng thấy khoang, phun ngược squirt_back("low") (không giật).
  //   Phun sớm khi R2 chưa vào khoang thì cửa vào đóng trước mặt R2, R2 kẹt mãi. R2 chất hàng ba nhịp rồi mới chạy; tới khoang sau thì đã đứng chờ sẵn. Cờ R1 (6,2), cờ R2 (7,0).
  var SAN_4 = ['.c.Cc.CF', '##.##.##', '##....F#', '##N##N##'];
  var NOI_4 = [noi(2, 3, [[1, 0], [3, 0]]), noi(5, 3, [[4, 0], [6, 0]])];
  var R1_4 = ['mate_in()', 'squirt_back("low")', 'tr_right()', 'forward(3)', 'tr_left()', 'mate_in()', 'squirt_back("low")', 'tr_right()', 'move()'];
  var R2_4 = nhieu(CHO(3), FOR(2, nhieu(['go_wall()'], WHILE('not front_clear()', ['wait()']))), ['go_wall()']);

  // doi-mua-2.5: hai khoang có CỬA SỔ trên hành lang của R2 (hàng 1): cửa vào (3,1), (6,1) đang mở; cửa sổ (4,1), (7,1) ngay trên giếng của R1. Van (4,0), (7,0) ở tường trên,
  //   phun qua cửa sổ mới trúng: van đổi cửa vào của R2 (mở thành đóng) và cửa của R1 ở hành lang dưới (5,3), (8,3) (đóng thành mở).
  //   Phun trước khi R2 qua cửa vào thì cửa đóng trước mặt R2; phun khi R2 còn đứng ở cửa sổ thì tia nước trúng R2. R2 đứng ở cửa sổ 1 bốn nhịp, cửa sổ 2 tám nhịp.
  var SAN_5 = ['####N##N###', '#..c..c..F#', '####.##.###', '####.C..CF#'];
  var NOI_5 = [noi(4, 0, [[3, 1], [5, 3]]), noi(7, 0, [[6, 1], [8, 3]])];
  var R1_5 = ['after_pass()', 'squirt("high")', 'tr_right()', 'forward(3)', 'tr_left()', 'after_pass()', 'squirt("high")', 'tr_right()', 'forward(2)'];
  var R2_5 = nhieu(['forward(3)'], CHO(4), ['forward(3)'], CHO(8), ['forward(2)']);

  // doi-mua-2.6: như doi-mua-2.5 nhưng một THÙNG GỖ (4,2) nằm ngay ngã giếng đầu trên hành lang của R2: R2 tới sát, gắp thùng (pick) rồi mang theo qua các giếng.
  //   Thùng gỗ không nóng: warm() không thấy, tia nước phun lúc thùng còn trong giếng thì trúng thùng. Giếng trống thì R1 đo được 3 ô tới van. R2 đứng ở giếng hai ba nhịp.
  var SAN_6 = ['####N##N###', '####.##.###', '#...o...F##', '####.##.###', '####.C..CF#'];
  var NOI_6 = [noi(4, 0, [[5, 4]]), noi(7, 0, [[8, 4]])];
  var R1_6 = ['clear_line()', 'squirt("high")', 'tr_right()', 'forward(3)', 'tr_left()', 'clear_line()', 'squirt("high")', 'tr_right()', 'forward(2)'];
  var R2_6 = nhieu(['forward(2)', 'pick()'], CHO(3), ['forward(4)'], CHO(3), ['move()']);

  // doi-mua-2.7: hành lang ngang (hàng 3) của R1, cuối hành lang là đèn nóng (van bật sẵn (11,3), không nối gì). R2 đi dọc xuống, cắt ngang ở ngã tư (4,3) và dừng ở đó ba nhịp.
  //   R1 gọi pass_safe() trước mỗi bước (chín bước rồi quay xuống cờ (10,4)). Đèn nóng nên warm() luôn True: bản của Sola (while warm()) chờ mãi. Cờ R2 (4,5).
  var SAN_7 = ['#############', '####.########', '####.########', '#..........N#', '####.#####F##', '####F########', '#############'];
  var R1_7 = nhieu(FOR(9, ['pass_safe()', 'move()']), ['tr_right()', 'move()']);
  var R2_7 = nhieu(['forward(2)'], CHO(3), ['forward(2)']);

  // doi-mua-2.8: hai giếng phun. Giếng đầu (3,·): van xa (3,1), sau lưng R1 là tường: phun mạnh. Giếng sau (5,·): van gần (5,2), sau lưng R1 là hốc (5,5): phun mạnh thì xe giật xuống hốc,
  //   phải phun nhẹ. R2 đi hành lang (hàng 3) ngang qua hai giếng, dừng ở giếng đầu ba nhịp. Van mở cửa của R1 (4,4), (6,4). Cờ R1 (7,4), cờ R2 (8,3).
  var SAN_8 = ['##########', '###N######', '###.#N####', '#.......F#', '##..C.CF##', '#####.####', '##########'];
  var NOI_8 = [noi(3, 1, [[4, 4]]), noi(5, 2, [[6, 4]])];
  var R1_8 = nhieu(FOR(2, ['move()', 'tr_left()', 'wait_auto()', 'tr_right()', 'move()']), ['move()']);
  var R2_8 = nhieu(['forward(2)'], CHO(3), ['forward(5)']);

  // doi-mua-2.9: hành lang (hàng 1) của R1 có một THÙNG GỖ (4,1) chắn giữa đường. R2 đứng bên kia thùng (6,1), chờ hai nhịp, tới sát gắp thùng rồi quẹo trái xuống ngã (5,·) tới cờ (5,3).
  //   Thùng rồi tới R2 chắn trước mũi R1. R1 gọi cross_safe() 13 lượt, mỗi lượt làm một việc: đi một ô hay chờ một nhịp (if / else). Húc vào thùng hay vào R2 đều mất bước. Cờ R1 (11,1).
  var SAN_9 = ['##############', '#...o......F.#', '#####.########', '#####F########'];     // (12,1) sau cờ: đi dư là qua mất cờ
  var R1_9 = FOR(14, ['cross_safe()']);
  var R2_9 = nhieu(CHO(2), ['move()', 'pick()', 'turn_left()', 'forward(2)']);

  // doi-mua-2.10 (trùm, ba sân): cùng hành lang của R1 (hàng 3, quay xuống cờ (9,4)); R2 đi dọc xuống cắt ngang ở ngã tư khác nhau, cùng một chương trình (hai ô, dừng ba nhịp, hai ô):
  //   sân 1: R2 (5,1) vào ngã tư (5,3) rồi dừng ba nhịp ngay trong ngã tư; cuối hành lang là đèn nóng (10,3);
  //   sân 2: R2 (3,0) dừng ba nhịp ở (3,2) TRÊN ngã tư (R1 qua trước được), rồi đi xuống cờ (3,4);
  //   sân 3: R2 (9,1) qua ngã tư cuối (9,3) từ sớm, R1 tới nơi thì bạn đã đi khỏi.
  var SAN_10 = [
    ['###########', '#####.#####', '#####.#####', '#.........N', '#####.###F#', '#####F#####', '###########'],
    ['###.#######', '###.#######', '###.#######', '#.........#', '###F#####F#', '###########', '###########'],
    ['###########', '#########.#', '#########.#', '#.........#', '#########F#', '#########F#', '###########']
  ];
  var BD_10 = [[0, 1, 2].map(function () { return { x: 1, y: 3, huong: 1 }; }), [o(5, 1), o(3, 0), o(9, 1)].map(function (p) { return { x: p.x, y: p.y, huong: 2 }; })];
  var R1_10 = nhieu(FOR(8, ['safe_step()', 'move()']), ['tr_right()', 'move()']);
  var R2_10 = nhieu(['forward(2)'], CHO(3), ['forward(2)']);

  // che-doi-mua-2.1: hai giếng phun (2,·), (4,·). R2 đi hành lang giữa (hàng 2), đứng ở giếng đầu (2,2) bốn nhịp rồi chạy về cờ (7,2). R1 ở hàng 4 quay lên từng giếng, phun mạnh mở cửa (3,4), (5,4), cờ (6,4).
  var SAN_C1 = ['##N#N####', '##.#.####', '#......F#', '##.#.####', '#..C.CF##', '#########'];
  var NOI_C1 = [noi(2, 0, [[3, 4]]), noi(4, 0, [[5, 4]])];
  var R1_C1 = nhieu(FOR(2, ['move()', 'tr_left()', 'wait_clear()', 'squirt("high")', 'tr_right()', 'move()']), ['move()']);
  var R2_C1 = nhieu(['move()'], CHO(4), ['forward(5)']);

  // che-doi-mua-2.2: sân của doi-mua-2.3; R1 đi từng bước bằng yield_step() của em (wait_clear() rồi move()); R2 đứng trong ngã tư đầu năm nhịp rồi đi vòng.
  var R1_C2 = nhieu(FOR(6, ['yield_step()']), ['tr_right()', 'move()']);
  var R2_C2 = nhieu(CHO(5), ['forward(2)', 'turn_left()', 'forward(3)', 'turn_left()', 'forward(4)']);

  // che-doi-mua-2.3: hành lang chữ L (phải tới (9,1), xuống tới cờ). R1 xích đi trước, tới góc dừng hai nhịp rồi quay (hai nhịp nữa); R2 theo sau, mỗi bước gọi keep_close()
  //   của Sola rồi tiến. Cờ R2 (9,4), cờ R1 (9,5).
  var SAN_C3 = ['############', '#.........##', '#########.##', '#########.##', '#########F##', '#########F##', '############'];
  var R1_C3 = nhieu(['forward(6)'], CHO(2), ['tr_right()', 'forward(4)']);
  var R2_C3 = nhieu(FOR(8, ['keep_close()', 'move()']), ['turn_right()'], FOR(3, ['keep_close()', 'move()']));

  // che-doi-mua-2.4: hai khoang hai cửa như doi-mua-2.4; R2 chất hàng năm nhịp rồi mới chạy. wait_mate() của em: chờ tới khi thấy bạn.
  var R1_C4 = ['wait_mate()', 'squirt_back("low")', 'tr_right()', 'forward(3)', 'tr_left()', 'wait_mate()', 'squirt_back("low")', 'tr_right()', 'move()'];
  var R2_C4 = nhieu(CHO(5), FOR(2, nhieu(['go_wall()'], WHILE('not front_clear()', ['wait()']))), ['go_wall()']);

  // che-doi-mua-2.5: sân của doi-mua-2.5 (hai khoang có cửa sổ), R2 đứng ở cửa sổ 1 ba nhịp, cửa sổ 2 tám nhịp. pass_mate() của em = wait_mate() rồi wait_clear().
  var R1_C5 = ['pass_mate()', 'squirt("high")', 'tr_right()', 'forward(3)', 'tr_left()', 'pass_mate()', 'squirt("high")', 'tr_right()', 'forward(2)'];
  var R2_C5 = nhieu(['forward(2)'], CHO(3), ['forward(3)'], CHO(8), ['forward(2)']);     // R2 xuất phát ngay trước cửa vào (2,1)

  // che-doi-mua-2.6: hai giếng của doi-mua-2.8 (van xa: phun mạnh; van gần, sau lưng là hốc: phun nhẹ). clear_squirt(p) của em = wait_clear() rồi squirt(p).
  var R1_C6 = ['move()', 'tr_left()', 'clear_squirt("high")', 'tr_right()', 'forward(2)', 'tr_left()', 'clear_squirt("low")', 'tr_right()', 'forward(2)'];

  // che-doi-mua-2.7: như doi-mua-2.7, hành lang dài hơn (đèn nóng (13,3) ở cuối). R1 đi mười một bước bằng step_clear() của em rồi quay xuống cờ (12,4);
  //   R2 đi hai ô vào ngã tư (4,3), dừng bốn nhịp, rồi hai ô xuống cờ (4,5).
  var SAN_C7 = ['###############', '####.##########', '####.##########', '#............N#', '####.#######F##', '####F##########', '###############'];
  var R1_C7 = nhieu(FOR(11, ['step_clear()']), ['tr_right()', 'move()']);
  var R2_C7 = nhieu(['forward(2)'], CHO(4), ['forward(2)']);

  // che-doi-mua-2.8: sân của doi-mua-2.5, R2 đứng ở cửa sổ 1 ba nhịp, cửa sổ 2 sáu nhịp. cover() của em = pass_mate() rồi phun mạnh: hàm gọi hàm gọi hàm.
  var R1_C8 = ['cover()', 'tr_right()', 'forward(3)', 'tr_left()', 'cover()', 'tr_right()', 'forward(2)'];
  var R2_C8 = nhieu(['forward(3)'], CHO(3), ['forward(3)'], CHO(6), ['forward(2)']);

  // che-doi-mua-2.9: sân của doi-mua-2.9 (thùng gỗ giữa hành lang, R2 gắp rồi quẹo xuống). cross_ok() của Sola gọi wait_clear(): thùng không nóng nên R1 húc thùng.
  var R1_C9 = FOR(10, ['cross_ok()', 'move()']);
  var R2_C9 = nhieu(CHO(3), ['move()', 'pick()', 'turn_left()', 'forward(2)']);

  // che-doi-mua-2.10 (trùm, hai sân): hai khoang có cửa sổ, cùng hai chương trình. Sân 1 là sân của doi-mua-2.5 (cửa sổ cách R1 một ô giếng: van ở xa, sau lưng R1 là tường:
  //   phun mạnh). Sân 2: hành lang của R2 ngay trên đầu R1 (hàng 2), van ngay sau cửa sổ (hàng 1): van gần, dưới chân R1 là hốc (4,4), (7,4): phun mạnh thì xe giật xuống hốc.
  var SAN_C10 = [SAN_5, ['###########', '####N##N###', '#..c..c..F#', '####.C..CF#', '####.##.###']];
  var NOI_C10 = [NOI_5, [noi(4, 1, [[3, 2], [5, 3]]), noi(7, 1, [[6, 2], [8, 3]])]];
  var R1_C10 = ['guard()', 'tr_right()', 'forward(3)', 'tr_left()', 'guard()', 'tr_right()', 'forward(2)'];
  var R2_C10 = nhieu(['forward(2)'], CHO(3), ['forward(3)'], CHO(8), ['forward(2)']);

  /* ------------------------------------------------------------- thân hàm hay dùng */
  var CHO_DI = WHILE('warm()', ['wait()']);              // R1: còn thấy đồng đội (hay van nóng) trước mũi xe thì chờ
  var CHO_TOI = WHILE('not warm()', ['wait()']);         // R1: chờ tới khi thấy đồng đội trước mũi xe
  var CHO_SAT = WHILE('distance() == 0', ['wait()']);    // R1: sát vật cản (đồng đội, thùng gỗ) thì chờ
  var CHO_RONG = WHILE('not front_clear()', ['wait()']); // R2: ô trước mũi còn bị chắn (bạn) thì chờ
  var BUOC_SAT = IF('distance() > 0', ['move()'], ['wait()']);   // doi-mua-2.9: mỗi lượt một việc, còn trống thì đi, sát vật cản thì chờ
  var BUOC_DI = IF('not warm()', ['move()'], ['wait()']);        // bản của Sola: hỏi warm() nên không thấy thùng gỗ
  var CHO_QUA = CHO_TOI.concat(CHO_DI);                  // chờ bạn tới rồi chờ bạn đi khỏi
  var CHO_GIENG = WHILE('distance() < 3', ['wait()']);   // giếng chưa trống (thùng gỗ hay bạn còn ở ngã giếng) thì chờ

  var DS = [
    /* ================================================================ chương doi-mua-2: Nhường đường (hàm của màn) */
    man({
      chuong: 'doi-mua-2', so: 1, ten: 'Bạn chắn tia nước', yMoi: 'warm() thấy đồng đội: robot trước mũi xe là nóng; while warm(): wait()',
      hamCuaEmCan: ['squirt', 'tr_right', 'forward'],
      deBai: 'Luna mang xe chở hàng R2 của Kho hàng tới giúp. Mắt hồng ngoại của R1 thấy cả ROBOT ĐỒNG ĐỘI: robot đang chạy thì nóng, warm() là True. ' +
        'Chương trình hai xe đã khóa. R2 đang đứng trong giếng, một lúc nữa mới đi. R1 nhìn lên giếng: phun mạnh vào van để mở cửa, nhưng R2 còn đứng đó thì tia nước trúng R2. ' +
        'Viết thân wait_cool(): còn thấy bạn trước mũi xe thì chờ.',
      veMaMau: 'Hai chương trình bị khóa, chạm thẻ R1 / R2 để đọc. wait_cool() còn trống: chạy thử xem tia nước đầu tiên trúng gì.',
      san: SAN_1, noi: NOI_1, bd: [{ x: 1, y: 2, huong: 0 }, { x: 1, y: 1, huong: 1 }], co: [[o(3, 2)], [o(4, 1)]],
      chinh: [R1_1, R2_1],
      hamMau: [H('wait_cool', [], ['pass'])],
      ham: [H('wait_cool', [], CHO_DI)],
      sao: { o: 20, nhip: 10 },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', ham: [H('wait_cool', [], ['# bạn còn trước mũi xe thì chờ'].concat(CHO_DI))] },
      loiSai: [
        { moTa: 'Để trống: phun ngay, tia nước trúng R2, cửa vẫn đóng', ham: [H('wait_cool', [], ['pass'])], phaiCoMa: ['ban-bi-chan', 'chua-toi-co'] },
        { moTa: 'Chờ cố định hai nhịp: R2 còn đứng trong giếng', ham: [H('wait_cool', [], CHO(2))], phaiCoMa: ['ban-bi-chan', 'chua-toi-co'] },
        { moTa: 'Viết while not warm(): bạn đang ở trước mũi xe thì không chờ, phun ngay', ham: [H('wait_cool', [], CHO_TOI)], phaiCoMa: ['ban-bi-chan'] }
      ],
      goiY: ['R2 đứng trong giếng thì warm() là True: tia nước phun lúc đó sẽ trúng R2.', 'Thân wait_cool(): while warm(): wait().']
    }),

    man({
      chuong: 'doi-mua-2', so: 2, ten: 'Theo sau xe cứu hỏa', khongPhun: true, yMoi: 'cảm biến khoảng cách của R2 thấy đồng đội: R1 ngay trước mũi thì front_clear() là False',
      hamCuaEmCan: ['move', 'tr_right', 'tr_left', 'forward', 'turn_right', 'turn_left'],
      deBai: 'Hành lang gấp khúc hẹp. R1 xe cứu hỏa đi trước, tới mỗi khúc quẹo phải quay mất hai nhịp. R2 xe chở hàng đi sau: mỗi bước gọi keep_gap() rồi tiến một ô. ' +
        'R2 húc vào R1 thì bước đó mất, R2 không tới được cờ. Cảm biến khoảng cách của R2 thấy đồng đội như thấy tường. Viết thân keep_gap(): ô trước mũi còn bị chắn thì chờ.',
      veMaMau: 'Hai chương trình bị khóa. keep_gap() còn trống: chạy thử xem R2 húc R1 ở góc nào.',
      san: SAN_2, bd: [{ x: 2, y: 0, huong: 1 }, { x: 1, y: 0, huong: 1 }], co: [[o(5, 2)], [o(4, 2)]],
      chinh: [R1_2, R2_2],
      hamMau: [H('keep_gap', [], ['pass'])],
      ham: [H('keep_gap', [], CHO_RONG)],
      sao: { o: 33, nhip: 12 },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', ham: [H('keep_gap', [], ['# bạn chắn trước mũi thì chờ'].concat(CHO_RONG))] },
      loiSai: [
        { moTa: 'Để trống: tới góc thứ nhất R2 húc vào R1 đang quay', ham: [H('keep_gap', [], ['pass'])], phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Dùng if thay cho while: chỉ chờ một nhịp, R1 quay chưa xong', ham: [H('keep_gap', [], IF('not front_clear()', ['wait()']))], phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Viết while front_clear(): trước mũi trống thì chờ, R2 đứng mãi', ham: [H('keep_gap', [], WHILE('front_clear()', ['wait()']))], phaiCoMa: ['vong-vo-han'] }
      ],
      goiY: ['R1 ngay trước mũi R2 thì front_clear() là False, như gặp tường ở mùa 1.', 'Thân keep_gap(): while not front_clear(): wait().']
    }),

    man({
      chuong: 'doi-mua-2', so: 3, ten: 'Xích nhường ở ngã tư', khongPhun: true, yMoi: 'hàm do R1 gọi trước mỗi bước: thấy bạn ở ngã tư thì chờ, rồi mới tiến',
      hamCuaEmCan: ['move', 'forward', 'turn_left', 'tr_right'],
      deBai: 'R1 đi dọc hành lang, trước mỗi bước gọi wait_cross() rồi tiến một ô. R2 đang đứng ngay trong ngã tư đầu, một lúc nữa mới đi vòng xuống rồi lên lại qua ngã tư thứ hai. ' +
        'R1 húc vào R2 thì mất bước đó, không tới được cờ. Viết thân wait_cross(): còn thấy bạn trước mũi xe thì chờ.',
      veMaMau: 'Hai chương trình bị khóa. wait_cross() còn trống: chạy thử xem R1 húc R2 ở đâu.',
      san: SAN_3, bd: [{ x: 1, y: 2, huong: 1 }, { x: 2, y: 2, huong: 2 }], co: [[o(7, 3)], [o(5, 0)]],
      chinh: [R1_3, R2_3],
      hamMau: [H('wait_cross', [], ['pass'])],
      ham: [H('wait_cross', [], CHO_DI)],
      sao: { o: 24, nhip: 14 },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', ham: [H('wait_cross', [], ['# bạn đang ở ngã tư thì chờ'].concat(CHO_DI))] },
      congThucKhac: [{ moTa: 'Chờ khi sát vật cản (while distance() == 0): ở đây cũng đúng', ham: [H('wait_cross', [], CHO_SAT)] }],
      loiSai: [
        { moTa: 'Để trống: R1 húc vào R2 đang đứng ở ngã tư', ham: [H('wait_cross', [], ['pass'])], phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Chờ cố định một nhịp mỗi bước: vẫn húc R2 ở ngã tư đầu', ham: [H('wait_cross', [], ['wait()'])], phaiCoMa: ['dam-tuong'] },
        { moTa: 'Viết while not warm(): hành lang trống thì R1 chờ mãi', ham: [H('wait_cross', [], CHO_TOI)], phaiCoMa: ['vong-vo-han'] }
      ],
      goiY: ['R2 đứng ở ngã tư trước mặt thì warm() là True.', 'Thân wait_cross(): while warm(): wait().']
    }),

    /* ------------------------------------------------ hàng 2: luyện */
    man({
      chuong: 'doi-mua-2', so: 4, ten: 'Đón bạn vào khoang', yMoi: 'while not warm(): wait(): chờ tới khi thấy đồng đội đã vào khoang rồi mới phun',
      hamCuaEmCan: ['go_wall', 'squirt_back', 'tr_right', 'tr_left', 'forward', 'move'],
      deBai: 'R2 đi qua hai khoang hai cửa: cửa vào đang mở, cửa ra đang đóng. Mỗi khoang có một van ngay sau lưng R1; R1 phun ngược squirt_back("low") thì cửa vào đóng lại và cửa ra mở. ' +
        'Phun sớm khi R2 chưa vào khoang thì cửa vào đóng ngay trước mặt R2, R2 kẹt mãi. R1 nhìn lên giếng thấy khoang. Viết thân mate_in(): chờ tới khi thấy R2 trong khoang.',
      veMaMau: 'Hai chương trình bị khóa. mate_in() còn trống: chạy thử xem cửa nào đóng trước mặt R2.',
      san: SAN_4, noi: NOI_4, bd: [{ x: 2, y: 2, huong: 0 }, { x: 0, y: 0, huong: 1 }], co: [[o(6, 2)], [o(7, 0)]],
      chinh: [R1_4, R2_4],
      hamMau: [H('mate_in', [], ['pass'])],
      ham: [H('mate_in', [], CHO_TOI)],
      sao: { o: 33, nhip: 17 },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', ham: [H('mate_in', [], ['# chờ tới khi thấy bạn trong khoang'].concat(CHO_TOI))] },
      loiSai: [
        { moTa: 'Để trống: phun ngay, cửa vào đóng trước mặt R2', ham: [H('mate_in', [], ['pass'])], phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Viết while warm(): khoang còn trống thì không nóng, R1 phun ngay', ham: [H('mate_in', [], CHO_DI)], phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Chờ cố định hai nhịp: R2 còn đang chất hàng, chưa vào khoang', ham: [H('mate_in', [], CHO(2))], phaiCoMa: ['vong-vo-han'] }
      ],
      goiY: ['Khoang trống thì mắt hồng ngoại thấy tường phía trên: không nóng. R2 vào khoang thì warm() là True.', 'Thân mate_in(): while not warm(): wait().']
    }),

    man({
      chuong: 'doi-mua-2', so: 5, ten: 'Bạn qua rồi mới phun', yMoi: 'hai vòng chờ nối nhau trong một hàm: chờ bạn tới cửa sổ, rồi chờ bạn đi khỏi đường tia nước',
      hamCuaEmCan: ['squirt', 'tr_right', 'tr_left', 'forward'],
      deBai: 'Mỗi van ở tường trên đổi hai cửa: cửa vào của R2 (đang mở thành đóng) và cửa của R1 ở hành lang dưới (đang đóng thành mở). R1 phun qua giếng và ô cửa sổ trên đường R2. ' +
        'Phun khi R2 chưa qua cửa vào thì cửa đóng ngay trước mặt R2. Phun khi R2 còn đứng ở cửa sổ thì tia nước trúng R2. R2 đứng ở các cửa sổ lâu chóng khác nhau. ' +
        'Viết thân after_pass(): chờ tới khi thấy R2 ở cửa sổ, rồi chờ tới khi R2 đi khỏi.',
      veMaMau: 'Hai chương trình bị khóa. after_pass() còn trống: chạy thử xem cửa nào đóng trước mặt R2.',
      san: SAN_5, noi: NOI_5, bd: [{ x: 4, y: 3, huong: 0 }, { x: 1, y: 1, huong: 1 }], co: [[o(9, 3)], [o(9, 1)]],
      chinh: [R1_5, R2_5],
      hamMau: [H('after_pass', [], ['pass'])],
      ham: [H('after_pass', [], CHO_QUA)],
      sao: { o: 33, nhip: 24 },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', ham: [H('after_pass', [], ['# chờ bạn tới rồi chờ bạn đi'].concat(CHO_QUA))] },
      loiSai: [
        { moTa: 'Để trống: phun ngay, cửa vào đóng trước mặt R2', ham: [H('after_pass', [], ['pass'])], phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Chỉ chờ bạn tới: phun lúc R2 còn đứng ở cửa sổ, tia nước trúng R2', ham: [H('after_pass', [], CHO_TOI)], phaiCoMa: ['ban-bi-chan'] },
        { moTa: 'Chỉ chờ bạn đi khỏi: cửa sổ còn trống nên phun ngay, cửa vào đóng trước mặt R2', ham: [H('after_pass', [], CHO_DI)], phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Hai vòng while nối nhau: vòng đầu chờ warm() thành True, vòng sau chờ nó thành False.', 'while not warm(): wait() rồi while warm(): wait().']
    }),

    man({
      chuong: 'doi-mua-2', so: 6, ten: 'Thùng gỗ trong giếng', yMoi: 'thùng gỗ không nóng: warm() không thấy nó, distance() thì thấy cả thùng lẫn bạn; R2 gắp thùng mang đi',
      hamCuaEmCan: ['squirt', 'tr_right', 'tr_left', 'forward', 'pick', 'move'],
      deBai: 'Một thùng gỗ nằm ngay ngã giếng đầu trên hành lang của R2. Xích không gắp được, nhưng R2 có tay: R2 tới sát, gắp thùng rồi mang theo qua các giếng. ' +
        'Thùng gỗ không nóng: warm() không thấy nó, tia nước phun lúc thùng còn trong giếng thì trúng thùng. Giếng trống thì mắt hồng ngoại của R1 đo được 3 ô tới van. ' +
        'Viết thân clear_line(): giếng chưa trống thì chờ.',
      veMaMau: 'Hai chương trình bị khóa. clear_line() viết bằng warm(): chạy thử xem tia nước đầu tiên trúng gì.',
      san: SAN_6, noi: NOI_6, bd: [{ x: 4, y: 4, huong: 0 }, { x: 1, y: 2, huong: 1 }], co: [[o(9, 4)], [o(8, 2)]],
      chinh: [R1_6, R2_6],
      hamMau: [H('clear_line', [], CHO_DI)],
      ham: [H('clear_line', [], CHO_GIENG)],
      sao: { o: 37, nhip: 20 },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', ham: [H('clear_line', [], ['# giếng trống thì đo được 3 ô'].concat(CHO_GIENG))] },
      loiSai: [
        { moTa: 'Để nguyên while warm(): thùng gỗ không nóng, tia nước trúng thùng', ham: [H('clear_line', [], CHO_DI)], phaiCoMa: ['ban-bi-chan', 'chua-toi-co'] },
        { moTa: 'Để trống: phun ngay khi thùng còn trong giếng', ham: [H('clear_line', [], ['pass'])], phaiCoMa: ['ban-bi-chan', 'chua-toi-co'] },
        { moTa: 'Viết while distance() < 1: thùng ở ngã giếng cách 1 ô nên không chờ', ham: [H('clear_line', [], WHILE('distance() < 1', ['wait()']))], phaiCoMa: ['ban-bi-chan'] }
      ],
      goiY: ['Giếng trống: distance() là 3. Thùng gỗ hay R2 ở ngã giếng: distance() là 1.', 'Thân clear_line(): while distance() < 3: wait().']
    }),

    /* ------------------------------------------------ hàng 3: biến thể */
    man({
      chuong: 'doi-mua-2', so: 7, ten: 'Đố: Sola chờ mãi', khongPhun: true, yMoi: 'tìm lỗi: đèn nóng cuối hành lang cũng làm warm() True, phải đo distance() tới bạn',
      hamCuaEmCan: ['forward', 'move', 'tr_right'], nutBat: [o(11, 3)],
      deBai: 'Sola viết pass_safe() cho R1: while warm(): wait(), để chờ R2 đi qua ngã tư. Chạy thử: R1 không nhúc nhích. Cuối hành lang có một đèn nóng (van đang mở). ' +
        'Mắt hồng ngoại chỉ đo xa gần và nóng lạnh: đèn nóng cũng nóng như đồng đội. Sửa pass_safe() để R1 chỉ chờ khi bạn đứng sát mũi xe.',
      veMaMau: 'Chạy thử. Khi ngã tư trống, mắt hồng ngoại của R1 thấy gì ở cuối hành lang?',
      san: SAN_7, bd: [{ x: 1, y: 3, huong: 1 }, { x: 4, y: 1, huong: 2 }], co: [[o(10, 4)], [o(4, 5)]],
      chinh: [R1_7, R2_7],
      hamMau: [H('pass_safe', [], CHO_DI)],
      ham: [H('pass_safe', [], CHO_SAT)],
      sao: { o: 19, nhip: 16 },
      loiGiaiKhac: { moTa: 'Cùng cách sửa, thêm một dòng chú thích', ham: [H('pass_safe', [], ['# chỉ chờ khi bạn đứng sát mũi xe'].concat(CHO_SAT))] },
      loiSai: [
        { moTa: 'Để nguyên bản của Sola: đèn nóng nên warm() luôn True, R1 chờ mãi', ham: [H('pass_safe', [], CHO_DI)], phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Bỏ hết chờ: R1 húc vào R2 đang đứng ở ngã tư', ham: [H('pass_safe', [], ['pass'])], phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Đèn ở xa, đồng đội ở ngã tư thì sát mũi xe: distance() khác nhau.', 'Thân pass_safe(): while distance() == 0: wait().']
    }),

    man({
      chuong: 'doi-mua-2', so: 8, ten: 'Chờ bạn rồi chọn lực', yMoi: 'hàm chờ bạn đi khỏi rồi gọi auto_spray(): đo xa gần khi đường tia nước đã trống',
      hamCuaEmCan: ['move', 'tr_left', 'tr_right', 'forward', 'auto_spray', 'squirt'],
      deBai: 'Hai giếng phun. Giếng đầu van ở xa, sau lưng R1 là tường: phun mạnh được. Giếng sau van ở gần, sau lưng R1 là một hốc: phun mạnh thì xe giật xuống hốc, phải phun nhẹ. ' +
        'R2 đi hành lang giữa và dừng ở giếng đầu một lúc. auto_spray() của gói Lực phun tự chọn lực theo distance(), nhưng R2 đứng chắn thì nó đo nhầm. Viết thân wait_auto(): chờ bạn đi khỏi rồi auto_spray().',
      veMaMau: 'Hai chương trình bị khóa. wait_auto() có sẵn chỉ gọi auto_spray(): chạy thử xem tia nước đầu tiên trúng gì.',
      san: SAN_8, noi: NOI_8, bd: [{ x: 2, y: 4, huong: 1 }, { x: 1, y: 3, huong: 1 }], co: [[o(7, 4)], [o(8, 3)]],
      chinh: [R1_8, R2_8],
      hamMau: [H('wait_auto', [], ['auto_spray()'])],
      ham: [H('wait_auto', [], CHO_DI.concat(['auto_spray()']))],
      sao: { o: 31, nhip: 18 },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', ham: [H('wait_auto', [], ['# bạn đi rồi mới đo và phun'].concat(CHO_DI, ['auto_spray()']))] },
      loiSai: [
        { moTa: 'Để nguyên auto_spray(): R2 đứng chắn, tia nước phun nhẹ trúng R2', ham: [H('wait_auto', [], ['auto_spray()'])], phaiCoMa: ['ban-bi-chan', 'chua-toi-co'] },
        { moTa: 'Chờ rồi luôn phun mạnh: ở giếng sau xe giật xuống hốc', ham: [H('wait_auto', [], CHO_DI.concat(['squirt("high")']))], phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Chờ rồi luôn phun nhẹ: van giếng đầu ở xa, tia nước rơi giữa đường', ham: [H('wait_auto', [], CHO_DI.concat(['squirt("low")']))], phaiCoMa: ['ban-ngan', 'chua-toi-co'] }
      ],
      goiY: ['Đo xa gần khi R2 còn đứng chắn thì distance() là 0.', 'while warm(): wait() rồi auto_spray().']
    }),

    man({
      chuong: 'doi-mua-2', so: 9, ten: 'Thùng gỗ giữa hành lang', khongPhun: true, yMoi: 'mỗi lượt một việc với if / else: còn trống (distance() > 0) thì đi, không thì chờ; thùng gỗ hay bạn trước mũi đều làm distance() bằng 0',
      hamCuaEmCan: ['move', 'pick', 'turn_left', 'forward'],
      deBai: 'Một thùng gỗ chắn giữa hành lang của R1. R2 đứng bên kia thùng: chờ một lúc, tới sát gắp thùng rồi quẹo xuống ngã rẽ. Thùng rồi tới R2 chắn trước mũi R1. ' +
        'R1 gọi cross_safe() mười bốn lượt, mỗi lượt làm một việc: đi một ô hay chờ một nhịp. Húc vào thùng hay vào R2 đều mất bước và mất sao. Viết thân cross_safe() thấy được cả thùng lẫn bạn.',
      veMaMau: 'Hai chương trình bị khóa. cross_safe() hỏi warm(): chạy thử xem R1 húc vào gì.',
      san: SAN_9, bd: [{ x: 1, y: 1, huong: 1 }, { x: 6, y: 1, huong: 3 }], co: [[o(11, 1)], [o(5, 3)]],
      chinh: [R1_9, R2_9],
      hamMau: [H('cross_safe', [], BUOC_DI)],
      ham: [H('cross_safe', [], BUOC_SAT)],
      sao: { o: 24, nhip: 14 },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', ham: [H('cross_safe', [], ['# còn trống thì đi, không thì chờ'].concat(BUOC_SAT))] },
      loiSai: [
        { moTa: 'Để nguyên bản hỏi warm(): thùng gỗ không nóng, R1 húc vào thùng', ham: [H('cross_safe', [], BUOC_DI)], phaiCoMa: ['dam-tuong'] },
        { moTa: 'Đổi hai nhánh: còn trống lại chờ, R1 không tới cờ', ham: [H('cross_safe', [], IF('distance() > 0', ['wait()'], ['move()']))], phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Chỉ wait(): R1 đứng mãi, không tới cờ', ham: [H('cross_safe', [], ['wait()'])], phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Thùng gỗ hay đồng đội ngay trước mũi xe đều làm distance() bằng 0.', 'Thân cross_safe(): if distance() > 0: move(), else: wait().']
    }),

    /* ------------------------------------------------ trùm */
    man({
      chuong: 'doi-mua-2', so: 10, ten: 'Trùm: Ba ngã tư', khongPhun: true, yMoi: 'một hàm cho ba sân: bạn dừng trong ngã tư, dừng trên ngã tư, hay đã đi qua trước',
      hang: 'trum', hamCuaEmCan: ['move', 'forward', 'tr_right'],
      huyHieu: { ma: 'doi-mua-2', ten: 'Huy hiệu Đội' },
      deBai: 'Ba sân, cùng hai chương trình khóa. R2 đi dọc xuống, cắt ngang hành lang của R1 ở một ngã tư mỗi sân một chỗ: sân thứ nhất R2 dừng ngay trong ngã tư và cuối hành lang có đèn nóng, ' +
        'sân thứ hai R2 dừng phía trên ngã tư nên R1 qua trước được, sân thứ ba R2 đã qua ngã tư cuối từ sớm. R1 gọi safe_step() trước mỗi bước. Viết safe_step() cho cả ba sân.',
      veMaMau: 'Hai chương trình bị khóa. safe_step() còn trống: chạy thử từng sân.',
      san: SAN_10, bd: BD_10, nutBat: [[o(10, 3)], [], []],
      co: [[[o(9, 4)], [o(9, 4)], [o(9, 4)]], [[o(5, 5)], [o(3, 4)], [o(9, 5)]]],
      chinh: [R1_10, R2_10],
      hamMau: [H('safe_step', [], ['pass'])],
      ham: [H('safe_step', [], CHO_SAT)],
      sao: { o: 19, nhip: 36 },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', ham: [H('safe_step', [], ['# chỉ chờ khi có gì sát mũi xe'].concat(CHO_SAT))] },
      loiSai: [
        { moTa: 'Viết while warm(): sân thứ nhất có đèn nóng, R1 chờ mãi', ham: [H('safe_step', [], CHO_DI)], phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Để trống: sân thứ nhất R1 húc vào R2 đang đứng trong ngã tư', ham: [H('safe_step', [], ['pass'])], phaiCoMa: ['dam-tuong'] },
        { moTa: 'Chờ cố định hai nhịp mỗi bước: sân thứ hai R1 tới ngã tư đúng lúc R2 đi xuống', ham: [H('safe_step', [], CHO(2))], phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['Sân nào cũng vậy: có gì sát mũi xe thì chờ, không thì đi.', 'Thân safe_step(): while distance() == 0: wait().']
    }),

    /* ================================================================ chương che-doi-mua-2: Chế lệnh: chờ bạn (hàm của em) */
    man({
      chuong: 'che-doi-mua-2', so: 1, ten: 'Hàm wait_clear()', yMoi: 'chế hàm của em đọc warm(): còn thấy bạn trước mũi xe thì chờ',
      hamCuaEmCan: ['move', 'tr_left', 'tr_right', 'forward', 'squirt'], taoHam: ['wait_clear'],
      deBai: 'Em chế wait_clear(): còn thấy đồng đội (hay vật nóng) trước mũi xe thì chờ. Hàm này sẽ theo đội suốt chương. ' +
        'Chương trình hai xe đã khóa: R1 ở mỗi giếng quay lên, gọi wait_clear() rồi phun mạnh mở cửa. R2 đứng ở giếng đầu một lúc.',
      veMaMau: 'Hai chương trình bị khóa. Mở Xưởng hàm, tạo wait_clear() hai dòng.',
      san: SAN_C1, noi: NOI_C1, bd: [{ x: 1, y: 4, huong: 1 }, { x: 1, y: 2, huong: 1 }], co: [[o(6, 4)], [o(7, 2)]],
      chinh: [R1_C1, R2_C1],
      hamEm: [H('wait_clear', [], CHO_DI)],
      sao: { o: 27, nhip: 18 },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', hamEm: [H('wait_clear', [], ['# còn thấy bạn thì chờ'].concat(CHO_DI))] },
      loiSai: [
        { moTa: 'Thân chỉ có pass: phun ngay, tia nước trúng R2', hamEm: [H('wait_clear', [], ['pass'])], phaiCoMa: ['ban-bi-chan', 'chua-toi-co'] },
        { moTa: 'Dùng if thay cho while: chỉ chờ một nhịp, R2 còn đứng đó', hamEm: [H('wait_clear', [], IF('warm()', ['wait()']))], phaiCoMa: ['ban-bi-chan', 'chua-toi-co'] }
      ],
      goiY: ['Hàm của em vào kho, các màn sau gọi lại được.', 'Thân wait_clear(): while warm(): wait().']
    }),

    man({
      chuong: 'che-doi-mua-2', so: 2, ten: 'Hàm yield_step()', khongPhun: true, yMoi: 'hàm của em gọi hàm của em: yield_step() = wait_clear() rồi tiến một ô',
      hamCuaEmCan: ['wait_clear', 'move', 'tr_right', 'turn_left', 'forward'], taoHam: ['yield_step'],
      deBai: 'R1 đi từng bước bằng một hàm của em: yield_step() = wait_clear() rồi tiến một ô. R2 đứng trong ngã tư đầu một lúc rồi đi vòng, lên lại qua ngã tư thứ hai. ' +
        'Xe tới sau phải nhường. Chương trình hai xe đã khóa.',
      veMaMau: 'Hai chương trình bị khóa. Tạo yield_step() hai dòng.',
      san: SAN_3, bd: [{ x: 1, y: 2, huong: 1 }, { x: 2, y: 2, huong: 2 }], co: [[o(7, 3)], [o(5, 0)]],
      chinh: [R1_C2, R2_C2],
      hamEm: [H('yield_step', [], ['wait_clear()', 'move()'])],
      sao: { o: 25, nhip: 16 },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', hamEm: [H('yield_step', [], ['# nhường bạn rồi mới đi', 'wait_clear()', 'move()'])] },
      congThucKhac: [{ moTa: 'Viết thẳng while warm(): wait() thay cho gọi wait_clear()', hamEm: [H('yield_step', [], CHO_DI.concat(['move()']))] }],
      loiSai: [
        { moTa: 'Chỉ có move(): R1 húc vào R2 ở ngã tư', hamEm: [H('yield_step', [], ['move()'])], phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Chờ ngược điều kiện (while not warm()): bạn đang trước mũi thì không chờ, R1 húc R2', hamEm: [H('yield_step', [], CHO_TOI.concat(['move()']))], phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Hàm của em gọi được hàm của em: wait_clear() đã chế ở màn trước.', 'Thân yield_step(): wait_clear() rồi move().']
    }),

    man({
      chuong: 'che-doi-mua-2', so: 3, ten: 'Sửa hàm keep_close()', khongPhun: true, yMoi: 'sửa hàm lỗi của R2: if chỉ chờ một nhịp, bạn quay lâu hơn thì phải while',
      hamCuaEmCan: ['move', 'forward', 'tr_right', 'turn_right'],
      deBai: 'Sola chế keep_close() để R2 đi sát sau R1: if not front_clear(): wait(). Chương trình hai xe đã khóa. Ở góc, R1 dừng rồi quay, mất bốn nhịp: R2 chờ một nhịp rồi húc vào R1. ' +
        'Sửa một chữ trong keep_close().',
      veMaMau: 'Chạy thử. Ở góc, R2 chờ được mấy nhịp?',
      san: SAN_C3, bd: [{ x: 3, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }], co: [[o(9, 5)], [o(9, 4)]],
      chinh: [R1_C3, R2_C3],
      hamMau: [H('keep_close', [], IF('not front_clear()', ['wait()']))],
      ham: [H('keep_close', [], CHO_RONG)],
      sao: { o: 24, nhip: 16 },
      loiGiaiKhac: { moTa: 'Cùng cách sửa, thêm một dòng chú thích trong hàm', ham: [H('keep_close', [], ['# chờ tới khi bạn đi khỏi'].concat(CHO_RONG))] },
      loiSai: [
        { moTa: 'Để nguyên bản của Sola: ở góc R2 húc vào R1', ham: [H('keep_close', [], IF('not front_clear()', ['wait()']))], phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Sửa thành while front_clear(): còn trống thì chờ, R2 đứng mãi', ham: [H('keep_close', [], WHILE('front_clear()', ['wait()']))], phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Bỏ hết: R2 húc vào R1 ngay bước đầu', ham: [H('keep_close', [], ['pass'])], phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['if chỉ hỏi một lần; while hỏi lại sau mỗi nhịp chờ.', 'Đổi if thành while.']
    }),

    /* ------------------------------------------------ hàng 2: luyện */
    man({
      chuong: 'che-doi-mua-2', so: 4, ten: 'Hàm wait_mate()', yMoi: 'chế hàm chờ tới khi thấy bạn; phun ngược squirt_back("low") để không phải quay',
      hamCuaEmCan: ['go_wall', 'squirt_back', 'tr_right', 'tr_left', 'forward', 'move', 'wait_clear'], taoHam: ['wait_mate'],
      deBai: 'Hai khoang hai cửa như màn Đón bạn vào khoang. R1 nhìn lên khoang; van ở ngay sau lưng nên R1 phun ngược squirt_back("low"), không cần quay, không bị giật. ' +
        'R2 chất hàng xong mới đi. Em chế wait_mate(): chờ tới khi thấy đồng đội trước mũi xe. Chương trình hai xe đã khóa.',
      veMaMau: 'Hai chương trình bị khóa. Tạo wait_mate() hai dòng.',
      san: SAN_4, noi: NOI_4, bd: [{ x: 2, y: 2, huong: 0 }, { x: 0, y: 0, huong: 1 }], co: [[o(6, 2)], [o(7, 0)]],
      chinh: [R1_C4, R2_C4],
      hamEm: [H('wait_mate', [], CHO_TOI)],
      sao: { o: 33, nhip: 19 },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', hamEm: [H('wait_mate', [], ['# chờ tới khi thấy bạn'].concat(CHO_TOI))] },
      loiSai: [
        { moTa: 'Thân chỉ có pass: phun ngay, cửa vào đóng trước mặt R2', hamEm: [H('wait_mate', [], ['pass'])], phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Gọi wait_clear(): khoang trống không nóng nên phun ngay', hamEm: [H('wait_mate', [], ['wait_clear()'])], phaiCoMa: ['vong-vo-han'] }
      ],
      goiY: ['wait_mate() ngược với wait_clear(): chờ cho tới KHI thấy bạn.', 'Thân wait_mate(): while not warm(): wait().']
    }),

    man({
      chuong: 'che-doi-mua-2', so: 5, ten: 'Hàm pass_mate()', yMoi: 'hàm gọi HAI hàm của em nối nhau: wait_mate() rồi wait_clear()',
      hamCuaEmCan: ['wait_mate', 'wait_clear', 'squirt', 'tr_right', 'tr_left', 'forward'], taoHam: ['pass_mate'],
      deBai: 'Lại là hai khoang có cửa sổ: phun trước khi R2 qua cửa vào thì cửa đóng trước mặt R2, phun khi R2 còn đứng ở cửa sổ thì tia nước trúng R2. ' +
        'Em đã có wait_mate() và wait_clear(). Chế pass_mate(): gọi lần lượt hai hàm đó. Chương trình hai xe đã khóa.',
      veMaMau: 'Hai chương trình bị khóa. Tạo pass_mate() hai dòng, mỗi dòng gọi một hàm của em.',
      san: SAN_5, noi: NOI_5, bd: [{ x: 4, y: 3, huong: 0 }, { x: 2, y: 1, huong: 1 }], co: [[o(9, 3)], [o(9, 1)]],
      chinh: [R1_C5, R2_C5],
      hamEm: [H('pass_mate', [], ['wait_mate()', 'wait_clear()'])],
      sao: { o: 35, nhip: 22 },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', hamEm: [H('pass_mate', [], ['# chờ bạn tới rồi chờ bạn đi', 'wait_mate()', 'wait_clear()'])] },
      congThucKhac: [{ moTa: 'Viết thẳng hai vòng while thay cho gọi hai hàm', hamEm: [H('pass_mate', [], CHO_QUA)] }],
      loiSai: [
        { moTa: 'Gọi ngược thứ tự: wait_clear() trước thì không chờ gì, rồi wait_mate() phun đúng lúc bạn ở cửa sổ', hamEm: [H('pass_mate', [], ['wait_clear()', 'wait_mate()'])], phaiCoMa: ['ban-bi-chan'] },
        { moTa: 'Chỉ gọi wait_mate(): phun lúc R2 còn ở cửa sổ', hamEm: [H('pass_mate', [], ['wait_mate()'])], phaiCoMa: ['ban-bi-chan'] }
      ],
      goiY: ['Thứ tự quan trọng: chờ bạn tới trước, rồi mới chờ bạn đi.', 'Thân pass_mate(): wait_mate() rồi wait_clear().']
    }),

    man({
      chuong: 'che-doi-mua-2', so: 6, ten: 'Hàm clear_squirt(p)', yMoi: 'hàm có tham số lực p: chờ bạn đi khỏi đường tia nước rồi phun với lực p',
      hamCuaEmCan: ['wait_clear', 'move', 'tr_left', 'tr_right', 'forward', 'squirt'], taoHam: ['clear_squirt'],
      deBai: 'Hai giếng phun: giếng đầu van ở xa, sau lưng là tường; giếng sau van ở gần, sau lưng là hốc. R2 đứng ở giếng đầu một lúc. ' +
        'Em chế clear_squirt(p): chờ bạn đi khỏi đường tia nước (wait_clear()), rồi phun với lực p. Chương trình R1 đã khóa, gọi clear_squirt("high") ở giếng đầu và clear_squirt("low") ở giếng sau.',
      veMaMau: 'Hai chương trình bị khóa. Tạo clear_squirt(p) hai dòng: hàm có một tham số p.',
      san: SAN_8, noi: NOI_8, bd: [{ x: 2, y: 4, huong: 1 }, { x: 1, y: 3, huong: 1 }], co: [[o(7, 4)], [o(8, 3)]],
      chinh: [R1_C6, R2_8],
      hamEm: [H('clear_squirt', ['p'], ['wait_clear()', 'squirt(p)'])],
      sao: { o: 30, nhip: 18 },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', hamEm: [H('clear_squirt', ['p'], ['# bạn đi rồi mới phun', 'wait_clear()', 'squirt(p)'])] },
      loiSai: [
        { moTa: 'Phun ngay không chờ: tia nước trúng R2 ở giếng đầu', hamEm: [H('clear_squirt', ['p'], ['squirt(p)'])], phaiCoMa: ['ban-bi-chan', 'chua-toi-co'] },
        { moTa: 'Quên tham số, luôn phun mạnh: ở giếng sau xe giật xuống hốc', hamEm: [H('clear_squirt', ['p'], ['wait_clear()', 'squirt("high")'])], phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['clear_squirt("low") thì p là "low"; squirt(p) phun đúng lực đó.', 'Thân clear_squirt(p): wait_clear() rồi squirt(p).']
    }),

    /* ------------------------------------------------ hàng 3: biến thể */
    man({
      chuong: 'che-doi-mua-2', so: 7, ten: 'Hàm step_clear()', khongPhun: true, yMoi: 'hàm bước đi bằng distance(): đèn nóng làm warm() vô dụng, đo khoảng cách thì không nhầm',
      hamCuaEmCan: ['move', 'tr_right', 'forward', 'yield_step', 'wait_clear'], taoHam: ['step_clear'], nutBat: [o(13, 3)],
      deBai: 'Cuối hành lang của R1 có đèn nóng: yield_step() của em dựa vào warm() nên R1 sẽ chờ mãi. R2 vẫn cắt ngang ở ngã tư và dừng ở đó một lúc. ' +
        'Em chế step_clear(): còn sát vật cản (bạn) thì chờ, rồi tiến một ô. Chương trình hai xe đã khóa.',
      veMaMau: 'Hai chương trình bị khóa. Tạo step_clear() ba dòng bằng distance().',
      san: SAN_C7, bd: [{ x: 1, y: 3, huong: 1 }, { x: 4, y: 1, huong: 2 }], co: [[o(12, 4)], [o(4, 5)]],
      chinh: [R1_C7, R2_C7],
      hamEm: [H('step_clear', [], CHO_SAT.concat(['move()']))],
      sao: { o: 19, nhip: 19 },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', hamEm: [H('step_clear', [], ['# sát bạn thì chờ, rồi tiến'].concat(CHO_SAT, ['move()']))] },
      loiSai: [
        { moTa: 'Gọi yield_step(): đèn nóng nên warm() luôn True, R1 chờ mãi', hamEm: [H('step_clear', [], ['yield_step()'])], phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Chỉ có move(): R1 húc vào R2 đang đứng ở ngã tư', hamEm: [H('step_clear', [], ['move()'])], phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Đèn ở xa, bạn ở ngã tư thì sát mũi xe: distance() phân biệt được.', 'Thân step_clear(): while distance() == 0: wait() rồi move().']
    }),

    man({
      chuong: 'che-doi-mua-2', so: 8, ten: 'Hàm cover()', yMoi: 'hàm gọi hàm gọi hàm: cover() gọi pass_mate(), pass_mate() gọi wait_mate() và wait_clear()',
      hamCuaEmCan: ['pass_mate', 'wait_mate', 'wait_clear', 'squirt', 'tr_right', 'tr_left', 'forward'], taoHam: ['cover'],
      deBai: 'Hai khoang có cửa sổ, R2 đứng ở cửa sổ sau lâu hơn. Mỗi giếng, R1 làm cùng một việc: chờ bạn qua cửa sổ rồi phun mạnh. Em chế cover(): gọi pass_mate() của em rồi phun mạnh. ' +
        'Chương trình R1 đã khóa: cover() rồi sang giếng kế.',
      veMaMau: 'Hai chương trình bị khóa. Tạo cover() hai dòng.',
      san: SAN_5, noi: NOI_5, bd: [{ x: 4, y: 3, huong: 0 }, { x: 1, y: 1, huong: 1 }], co: [[o(9, 3)], [o(9, 1)]],
      chinh: [R1_C8, R2_C8],
      hamEm: [H('cover', [], ['pass_mate()', 'squirt("high")'])],
      sao: { o: 35, nhip: 21 },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', hamEm: [H('cover', [], ['# bạn qua rồi mới phun', 'pass_mate()', 'squirt("high")'])] },
      congThucKhac: [{ moTa: 'Gọi thẳng wait_mate() và wait_clear() rồi phun', hamEm: [H('cover', [], ['wait_mate()', 'wait_clear()', 'squirt("high")'])] }],
      loiSai: [
        { moTa: 'Phun trước rồi mới chờ: cửa vào đóng trước mặt R2', hamEm: [H('cover', [], ['squirt("high")', 'pass_mate()'])], phaiCoMa: ['dam-tuong'] },
        { moTa: 'Chỉ chờ bạn tới: phun lúc R2 còn ở cửa sổ', hamEm: [H('cover', [], ['wait_mate()', 'squirt("high")'])], phaiCoMa: ['ban-bi-chan'] }
      ],
      goiY: ['pass_mate() đã biết chờ bạn tới rồi chờ bạn đi.', 'Thân cover(): pass_mate() rồi squirt("high").']
    }),

    man({
      chuong: 'che-doi-mua-2', so: 9, ten: 'Sửa hàm cross_ok()', khongPhun: true, yMoi: 'sửa hàm lỗi: wait_clear() không thấy thùng gỗ, phải đo distance()',
      hamCuaEmCan: ['wait_clear', 'wait_mate', 'move', 'pick', 'turn_left', 'forward'],
      deBai: 'Thùng gỗ lại chắn giữa hành lang của R1; R2 tới gắp rồi quẹo xuống. Sola chế cross_ok() cho R1: gọi wait_clear() của em. Chạy thử: R1 húc vào thùng. ' +
        'Sửa cross_ok() để R1 chờ được cả thùng lẫn bạn.',
      veMaMau: 'Chạy thử. Thùng gỗ có nóng không?',
      san: SAN_9, bd: [{ x: 1, y: 1, huong: 1 }, { x: 6, y: 1, huong: 3 }], co: [[o(11, 1)], [o(5, 3)]],
      chinh: [R1_C9, R2_C9],
      hamMau: [H('cross_ok', [], ['wait_clear()'])],
      ham: [H('cross_ok', [], CHO_SAT)],
      sao: { o: 23, nhip: 15 },
      loiGiaiKhac: { moTa: 'Cùng cách sửa, thêm một dòng chú thích trong hàm', ham: [H('cross_ok', [], ['# thùng hay bạn sát mũi xe thì chờ'].concat(CHO_SAT))] },
      loiSai: [
        { moTa: 'Để nguyên bản của Sola: thùng gỗ không nóng, R1 húc thùng', ham: [H('cross_ok', [], ['wait_clear()'])], phaiCoMa: ['dam-tuong'] },
        { moTa: 'Đổi sang wait_mate(): trước mũi chưa có gì nóng, R1 chờ mãi', ham: [H('cross_ok', [], ['wait_mate()'])], phaiCoMa: ['vong-vo-han'] }
      ],
      goiY: ['warm() chỉ thấy vật nóng; distance() thấy mọi vật cản.', 'Thân cross_ok(): while distance() == 0: wait().']
    }),

    /* ------------------------------------------------ trùm */
    man({
      chuong: 'che-doi-mua-2', so: 10, ten: 'Trùm: Canh cửa sổ', yMoi: 'một hàm của em cho hai sân: chờ bạn qua cửa sổ (pass_mate) rồi tự chọn lực (auto_spray)',
      hang: 'trum', hamCuaEmCan: ['pass_mate', 'cover', 'wait_mate', 'wait_clear', 'auto_spray', 'squirt', 'tr_right', 'tr_left', 'forward'], taoHam: ['guard'],
      huyHieu: { ma: 'che-doi-mua-2', ten: 'Huy hiệu Đội phối hợp' },
      deBai: 'Hai sân, cùng hai chương trình khóa. Sân nào cũng hai khoang có cửa sổ: phun trước khi R2 qua cửa vào thì cửa đóng trước mặt R2, phun khi R2 còn ở cửa sổ thì tia nước trúng R2. ' +
        'Sân thứ nhất van ở xa, sau lưng R1 là tường: phải phun mạnh. Sân thứ hai van ở gần, dưới chân R1 là hốc: phun mạnh thì xe giật xuống hốc. Em chế guard() cho cả hai sân.',
      veMaMau: 'Hai chương trình bị khóa. Tạo guard() hai dòng bằng các hàm của em và của gói Lực phun.',
      san: SAN_C10, noi: NOI_C10,
      bd: [[{ x: 4, y: 3, huong: 0 }, { x: 4, y: 3, huong: 0 }], [{ x: 2, y: 1, huong: 1 }, { x: 2, y: 2, huong: 1 }]],
      co: [[[o(9, 3)], [o(9, 3)]], [[o(9, 1)], [o(9, 2)]]],
      chinh: [R1_C10, R2_C10],
      hamEm: [H('guard', [], ['pass_mate()', 'auto_spray()'])],
      sao: { o: 39, nhip: 44 },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', hamEm: [H('guard', [], ['# bạn qua rồi mới đo và phun', 'pass_mate()', 'auto_spray()'])] },
      loiSai: [
        { moTa: 'Luôn phun mạnh (gọi cover()): sân thứ hai xe giật xuống hốc, lệch chỗ rồi chờ bạn mãi', hamEm: [H('guard', [], ['cover()'])], phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Luôn phun nhẹ: sân thứ nhất tia nước rơi giữa giếng', hamEm: [H('guard', [], ['pass_mate()', 'squirt("low")'])], phaiCoMa: ['ban-ngan'] },
        { moTa: 'Chỉ auto_spray() không chờ: cửa vào đóng trước mặt R2', hamEm: [H('guard', [], ['auto_spray()'])], phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['pass_mate() lo phần chờ bạn; auto_spray() đo xa gần rồi chọn lực.', 'Thân guard(): pass_mate() rồi auto_spray().']
    })
  ];

  ManHoc.manDoiMua2 = DS;
  if (laNode) module.exports = ManHoc;
})();
