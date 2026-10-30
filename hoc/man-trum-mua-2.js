/* ============================================================================
   man-trum-mua-2.js — "Robot Chấn Hưng": NGÂN HÀNG MÀN MỚI của mùa 2, gói 10 "Nhà máy chạy lại" (gói cuối mùa, KE-HOACH-MUA-2.md).
   Khung mùa 2 (lo-trinh-hoc.js, khối "MÙA 2 = 10 GÓI", mảng MUA_2) đã chừa chỗ: tệp đã có trong danh sách require của lo-trinh-hoc.js và
   thẻ <script> của game/choi.html. Gói sau CHỈ việc thêm màn vào mảng DS dưới đây; màn tự hiện đúng chương, đúng gói.
     - `tong-hop-2` (mã tong-hop-2.1 … tong-hop-2.10): chương 1 "Tổng hợp" (màn 10 trùm, huy hiệu tong-hop-2)
     - `trum-mua-2` (mã trum-mua-2.1 … trum-mua-2.10): chương 2 "Trùm mùa" (màn 10 là TRÙM CUỐI MÙA 2, huy hiệu nha-may-chay)
   Mỗi màn khai `chuong` (một trong các mã trên) và `so` (1, 2, …: thứ tự trong phần màn mới của chương); mã `ma` = chuong + '.' + so là khóa lưu sao,
   KHÔNG đổi sau khi xuất bản. Gọi ManHoc.chuanHoa(m) như các tệp màn khác. Chương còn trống thì chưa hiện; gói chưa có chương nào có màn thì chưa hiện.
   Ràng buộc mùa 2 (hoc/kiem-lo-trinh.mjs): robot chỉ dùng part mùa 1 + xích + súng hơi (+ hồng ngoại khi lõi có); không bậc thang S, hố u, gầm n;
   biến chỉ từ gói 1 chương 2, hàm có tham số chỉ từ gói 2 chương 2 (tham-so); hàm của em cần phải được tạo ở màn đứng trước.
   Tệp này KHÔNG tự thêm màn vào ManHoc: danh sách nằm ở ManHoc.manTrumMua2, lo-trinh-hoc.js thêm vào chương rồi xếp chỗ (so, hang do dungChuong đặt).

   30/10 GÓI LỬA (user: "làm thêm gói lửa nhé, k thì tên gọi ko còn khớp nữa"; hoc/KE-HOACH-GOI-LUA.md): gói 10 "Xe cứu hỏa R1" thành gói lửa. Chương tong-hop-2
   "Dập lửa": màn 1 trình diễn đám cháy (chiChay), màn 2 lửa to (trúng nhiều lần), màn 3, 4, 5 thêm lửa vào sân cũ, màn 7 hai đám cháy cỡ khác nhau (hàm của màn
   douse(): while warm()), trùm ba hành lang cháy. Lửa: cfg.lua = [{ x, y, suc }] (luật ở san-hoc.js, mục SÚNG BÓNG, đoạn LỬA).
   NỘI DUNG (28/10): "Nhà máy chạy lại": nhà máy của Sola hồi phục, mỗi màn ghép lại 2–4 thứ của mùa 2 (bảng recall ở kiem-trum-mua-2.mjs):
   gói 1 xích + biến + sidestep / spin · gói 2 hàm có tham số forward(n) · gói 3 hồng ngoại distance() · gói 4 van + cửa, băng chuyền, nút đè M · gói 5 xích đẩy thùng (xichDay)
   · gói 6 lực phun squirt("low" / "high") · gói 7 đo nhiệt warm() + nút bật sẵn · gói 8 đội hai robot (hàm của gói 8: wait_clear, step_clear…) · gói 9 bệ súng xích (beSung: phun mạnh không giật).
   Robot: XE XÍCH gắn SÚNG HƠI (+ mắt hồng ngoại khi m.mat), beSung + xichDay + lucBan ở mọi màn. Màn hai robot (m.bd): R1 xích bệ súng + mắt, R2 xích + mắt (+ xichDay),
   cả hai chương trình KHÓA như gói 8 (chưa có bộ dò chung hai robot cho màn mở), người chơi viết thân MỘT hàm; bộ dò gói 8 (do-duong-doi-mua-2.mjs) kiểm thân cố định.
   Luật như gói 9: màn mở một sân KHÔNG đọc cảm biến (lời cố định phải thua ở màn đọc cảm biến); nhiều sân chỉ ở trùm; không return.
   Chương tong-hop-2: ôn từng cặp; chương trum-mua-2: chế / sửa hàm của em cho dây chuyền, trùm cuối ba sân dùng gần hết.
   Hướng: 0 lên, 1 phải, 2 xuống, 3 trái. (x, y) với y = 0 ở hàng trên.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'spray', 'spray_back'];
  var MAT = ['distance', 'warm'];
  var HN = [{ ma: 'hong-ngoai', o: 'tren' }];

  function sao(x) { return JSON.parse(JSON.stringify(x)); }
  /** Thụt mọi dòng vào một bậc (4 dấu cách). */
  function thut(ds) { return ds.map(function (s) { return '    ' + s; }); }
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  function FOR(n, than, bien) { return ['for ' + (bien || 'i') + ' in range(' + n + '):'].concat(thut(than)); }
  function WHILE(dk, than) { return ['while ' + dk + ':'].concat(thut(than)); }
  function IF(dk, co, khong) { return ['if ' + dk + ':'].concat(thut(co), khong ? ['else:'].concat(thut(khong)) : []); }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function bai(chinh, hamCuaMan) { return { chinh: chinh.slice(), hamCuaMan: sao(hamCuaMan || []) }; }
  function o(x, y) { return { x: x, y: y }; }
  /** Đám cháy ở (x, y), cỡ suc (số lần tia nước trúng mới tắt). */
  function lua(x, y, suc) { return { x: x, y: y, suc: suc }; }
  /** Nhóm nối: nút (x, y) mở các cửa [[x, y], …]. */
  function noi(x, y, cua) { return { nut: o(x, y), cua: cua.map(function (c) { return o(c[0], c[1]); }) }; }
  function CHO(n) { return FOR(n, ['wait()']); }
  /** Bài làm hai robot: chương trình khóa [R1, R2] + hàm của màn (hm) hay hàm của em mới (em). */
  function B(c, hm, em) {
    var b = { doi: [{ chinh: c[0].slice() }, { chinh: c[1].slice() }], hamCuaMan: sao(hm || []) };
    if (em) b.hamCuaEmMoi = sao(em);
    return b;
  }

  /**
   * Điền trường chung. m.mat: gắn mắt hồng ngoại. Mọi màn: xích + súng hơi, beSung, xichDay, lucBan.
   * Màn hai robot: m.bd = [batDau R1, batDau R2], m.co = [cờ R1, cờ R2], m.chinh = [chương trình R1, R2] (KHÓA cả hai), m.hamMau / m.ham (hàm của màn)
   * hay m.hamEm (hàm của em mới); lời giải khác / công thức khác / lời sai khai { moTa, ham | hamEm, phaiCoMa }.
   */
  function man(m) {
    var mat = !!m.mat;
    delete m.mat;
    m.hang = m.hang || (m.so <= 3 ? 'lam-quen' : m.so <= 6 ? 'luyen' : m.so <= 9 ? 'bien-the' : 'trum');
    m.cauTruc = ['for', 'if', 'while'];
    m.loaiRobot = 'xich';
    m.robot = { than: 'xich', tay: 'hoi', camBien: mat ? HN : [] };
    m.hamGoc = mat ? BANH.concat(MAT) : BANH;
    m.beSung = true;
    m.xichDay = true;
    m.lucBan = true;
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    if (!m.mucTieu) m.mucTieu = 'toi-co';
    if (Array.isArray(m.san[0])) m.nhipTheo = 'tong';
    if (m.bd) {
      var bd = m.bd, co = m.co, chinh = m.chinh;
      var R1 = { loaiRobot: 'xich', robot: { than: 'xich', tay: 'hoi', camBien: HN }, hamGoc: BANH.concat(MAT), lucBan: true, xichDay: false };   // bệ súng: không đẩy thùng
      var R2 = { loaiRobot: 'xich', robot: { than: 'xich', tay: null, camBien: HN }, hamGoc: ['left_move', 'right_move', 'left_back', 'right_back', 'wait'].concat(MAT), xichDay: true };
      delete m.lucBan; delete m.xichDay;                                   // cờ theo từng xe (lucBan chỉ cho xe có súng)
      var cung = function (x) { return x.ham !== undefined || x.hamEm !== undefined ? B(chinh, x.ham || [], x.hamEm) : x.baiLam; };
      m.doi = [Object.assign({ batDau: bd[0] }, sao(R1)), Object.assign({ batDau: bd[1] }, sao(R2))];
      m.doi.forEach(function (d, i) { d.coDinh = true; if (co && co[i]) d.co = sao(co[i]); });
      m.batDau = bd[0]; m.robot = sao(R1.robot); m.hamGoc = R1.hamGoc.slice();   // cấp ngoài = R1
      m.maMau = B(chinh, m.hamMau || []);
      m.loiGiai = B(chinh, m.ham || [], m.hamEm);
      if (m.loiGiaiKhac) m.loiGiaiKhac = { moTa: m.loiGiaiKhac.moTa, baiLam: cung(m.loiGiaiKhac) };
      if (m.congThucKhac) m.congThucKhac = m.congThucKhac.map(function (x) { return { moTa: x.moTa, baiLam: cung(x) }; });
      m.loiSai = (m.loiSai || []).map(function (x) { return { moTa: x.moTa, baiLam: cung(x), phaiCoMa: x.phaiCoMa }; });
      ['bd', 'co', 'chinh', 'hamMau', 'ham', 'hamEm'].forEach(function (k) { delete m[k]; });
    }
    m.taoHam = m.taoHam || [];
    return ManHoc.chuanHoa(m);
  }

  /* ------------------------------------------------------------------- sân chương tong-hop-2 */

  // tong-hop-2.1 (trình diễn): hành lang (1..6, 1), xe (1,1) quay phải; đám cháy cỡ 1 ở (3,1), cách hai ô: phun nhẹ là tới; cờ (6,1).
  var SAN_T1 = ['########', '#.....F#', '########'];
  var LUA_T1 = [lua(3, 1, 1)];
  // tong-hop-2.2: hành lang (1..6, 1), xe (1,1) quay phải; đám cháy cỡ 2 ở (2,1) sát mũi: phải trúng hai lần; cờ (6,1).
  var SAN_T2 = ['########', '#.....F#', '########'];
  var LUA_T2 = [lua(2, 1, 2)];
  // tong-hop-2.3: xe (2,2) quay lên; nút (2,5) ở cuối giếng SAU LƯNG (ba ô: phải phun mạnh ra sau); trên đầu xe là hốc (2,1): xe hai bánh phun ra sau thì giật TỚI vào hốc.
  //   Nút mở cửa (3,2) bên phải xe; cờ (7,2). Gói lửa: đám cháy cỡ 1 ở (5,2) giữa hành lang, cách xe ba ô: phun nhẹ không tới, phun mạnh mới tới.
  var SAN_T3 = ['#########', '##.######', '##.C...F#', '##.######', '##.######', '##N######', '#########'];
  var LUA_T3 = [lua(5, 2, 1)];
  // tong-hop-2.4: xe (1,1) quay phải ở làn trên; thùng (2,2) và ô đích (7,2) ở làn dưới. Né sang phải (sidestep: xuống làn dưới) rồi đẩy thùng năm ô.
  //   Gói lửa: đám cháy cỡ 1 ở (1,2), đúng chỗ xe né xuống: quay xuống, phun nhẹ dập lửa, rồi mới xuống làn dưới.
  var SAN_T4 = ['#########', '#.......#', '#.H....D#', '#########'];
  var LUA_T4 = [lua(1, 2, 1)];
  // tong-hop-2.5: xe (2,3) quay lên; nút (2,0) cách ba ô; SAU LƯNG xe là thùng (2,4), rồi hai ô trống, cửa (2,7) đóng, ô đích (2,8). Phun mở cửa, quay nửa vòng (spin), đẩy thùng bốn ô.
  //   Gói lửa: đám cháy cỡ 1 ở (2,1) chắn tia nước trước van: dập lửa trước (phun nhẹ là tới), phun mạnh mở van sau.
  var SAN_T5 = ['##N##', '##.##', '##.##', '##.##', '##H##', '##.##', '##.##', '##C##', '##D##', '#####'];
  var LUA_T5 = [lua(2, 1, 1)];
  // tong-hop-2.6: hành lang (1..6, 3), xe (1,3) quay phải. Trạm (3,3): một nút ở cuối giếng phía trên (3,0), một ở cuối giếng phía dưới (3,6), đều cách ba ô. Xe quay lên ở trạm:
  //   nút trên là trước mặt, nút dưới là sau lưng. Nút (3,0) mở cửa (4,3), nút (3,6) mở cửa (5,3); cờ (6,3). pair_spray() của Sola phun hai lần ra trước: nút trên bị phun hai lần thì tắt lại.
  //   Gói lửa: đám cháy cỡ 1 ở (3,2) trong giếng trên, sát trạm: chắn tia nước tới van trên. pair_spray() của Sola viết lúc chưa có lửa.
  var SAN_T6 = ['###N####', '###.####', '###.####', '#...CCF#', '###.####', '###.####', '###N####', '########'];
  var LUA_T6 = [lua(3, 2, 1)];
  // tong-hop-2.7: hành lang (1..6, 1), xe (1,1) quay phải; đám cháy cỡ 1 ở (3,1); ở góc (6,1) rẽ xuống, đám cháy cỡ 3 ở (6,3); cuối giếng là phòng nhỏ, cờ (6,5).
  //   Hai đám cháy không cùng một đường thẳng: dập xong đám đầu thì warm() nhìn thấy tường góc, không thấy đám sau (cùng hàng thì while warm() phun nhẹ mãi vào đám xa).
  //   Chương trình chính khóa gọi douse() trước mỗi đám: thân cố định (phun một số lần cố định) hoặc hụt ở đám to, hoặc phí nhịp ở đám nhỏ; while warm() phun tới khi hết nóng.
  var SAN_T7 = ['########', '#......#', '######.#', '######.#', '######.#', '####..F#', '####...#', '########'];
  var LUA_T7 = [lua(3, 1, 1), lua(6, 3, 3)];
  // tong-hop-2.8 (hai robot): R2 (xe đẩy, không súng) đi hành lang trên (hàng 1) từ (1,1) tới cờ (7,1), đứng ở giếng đầu (2,1) bốn nhịp. R1 (bệ súng) ở hành lang dưới (hàng 3): tại trạm (2,3) và (5,3)
  //   quay lên phun mạnh nút (2,0), (5,0) cách ba ô, qua giếng (·,1), (·,2); R2 đứng trong giếng thì bóng trúng bạn. Nút mở cửa (3,3), (6,3); cờ R1 (8,3). Hốc (2,4), (5,4) dưới trạm.
  var SAN_T8 = ['##N##N####', '#......F##', '##.##.####', '#..C..C.F#', '##.##.####', '##########'];
  // tong-hop-2.9 (hai robot): R2 (xe đẩy, xichDay) ở (4,1) quay xuống, thùng (4,2) trước mũi: đẩy thùng xuống qua ngã tư (4,3), dừng ba nhịp, rồi đẩy tiếp xuống hốc (4,5), đứng ở cờ (4,4).
  //   R1 (bệ súng) đi hành lang (hàng 3) từ (1,3) tới cờ (7,3), mỗi bước gọi box_step(): thùng không nóng (warm() không thấy), phải đo distance().
  var SAN_T9 = ['#########', '####.####', '####H####', '#......F#', '####F####', '####.####', '#########'];
  // tong-hop-2.10 (trùm, ba sân, một chương trình): xe (1,3) quay phải; thùng cách xa gần khác nhau (p = 2 / 3 / 6); đẩy thùng một ô thì xe đứng đúng trạm (p,3) có nút xa phía trên (p,0),
  //   hốc phía dưới (p,4); nút mở cửa (p+2,3) ngay sau thùng; ô đích (p+3,3). Sân 3: nút ĐANG BẬT, cửa đã mở sẵn (thùng ở xa nhất: dãy cố định đếm bước cho hai sân đầu thì hụt).
  //   push(1), valve_left(), push(2).
  // tong-hop-2.10 (trùm, gói lửa, ba sân, một chương trình): xe (1,1) quay phải ở đầu hành lang cháy; đám cháy cỡ 1 / 2 / 3, gần xa khác nhau; hành lang dài 5 / 7 / 9 ô
  //   rồi tường; cờ ở cuối giếng hai ô phía dưới đầu kia. while warm(): squirt("high") (phun mạnh tới mọi khoảng cách), go_to_wall(), tr_right(), forward(2).
  var SAN_T10 = [
    ['#######', '#.....#', '#####.#', '#####F#', '#######'],
    ['#########', '#.......#', '#######.#', '#######F#', '#########'],
    ['###########', '#.........#', '#########.#', '#########F#', '###########']
  ];
  var LUA_T10 = [[lua(3, 1, 1)], [lua(5, 1, 2)], [lua(2, 1, 3)]];

  /* ------------------------------------------------------------- chương trình chương tong-hop-2 */

  var L_T1 = ['squirt("low")', 'forward(5)'];
  var L_T2 = ['squirt("low")', 'squirt("low")', 'forward(5)'];
  var L_T3 = ['squirt_back("high")', 'tr_right()', 'squirt("high")', 'forward(5)'];
  var L_T4 = ['tr_right()', 'squirt("low")', 'move()', 'tr_left()', 'forward(5)'];
  var L_T5 = ['squirt("low")', 'squirt("high")', 'spin()', 'forward(4)'];
  var C_T6 = ['forward(2)', 'tr_left()', 'pair_spray()', 'tr_right()', 'forward(3)'];
  var T_PAIR = ['squirt("low")', 'squirt("high")', 'squirt_back("high")'];      // dập lửa sát trạm, mở van trên, mở van dưới
  var T_PAIR_LOI = ['squirt("high")', 'squirt("high")'];
  var C_T7 = ['move()', 'douse()', 'forward(4)', 'tr_right()', 'douse()', 'forward(4)'];
  var T_DOUSE = WHILE('warm()', ['squirt("low")']);                         // douse(): còn nóng (còn lửa trước mũi) thì phun nhẹ
  var R1_T8 = nhieu(['squirt("low")', 'move()'], FOR(2, ['tr_left()', 'cover_spray()', 'tr_right()', 'forward(3)']));   // gói lửa: dập lửa ở trạm đầu trước khi đi
  var R2_T8 = nhieu(['move()'], CHO(4), ['forward(5)']);
  var T_COVER = ['clear_squirt("high")'];                                  // cover_spray(): chờ bạn đi khỏi đường bóng rồi phun mạnh (gói 8)
  var R1_T9 = ['squirt("low")'].concat(FOR(6, ['box_step()']));                  // gói lửa: dập lửa giữa hành lang trước khi đi (không dập thì box_step() chờ mãi)
  var R2_T9 = nhieu(['move()'], CHO(3), ['forward(2)']);
  var T_BOX = ['step_clear()'];                                            // box_step(): còn sát vật cản (thùng hay bạn) thì chờ, rồi tiến (gói 8)
  var L_T10 = WHILE('warm()', ['squirt("high")']).concat(['go_to_wall()', 'tr_right()', 'forward(2)']);

  /* ------------------------------------------------------------------- sân chương trum-mua-2 (30/10 gói lửa: "Chế lệnh: dập lửa") */

  // trum-mua-2.1: xe (1,1) quay phải; đám cháy cỡ 3 ở (2,1) sát mũi; hành lang tới góc (4,1), rẽ xuống: đám cháy cỡ 1 ở (4,2) sát mũi; cờ (4,4).
  //   put_out() = while warm(): squirt("low"): thân cố định hoặc hụt ở đám to, hoặc phí nhịp ở đám nhỏ. Hai đám không cùng đường thẳng (dập xong thì warm() thấy tường).
  var SAN_U1 = ['######', '#....#', '####.#', '####.#', '####F#', '######'];
  var LUA_U1 = [lua(2, 1, 3), lua(4, 2, 1)];
  // trum-mua-2.2 (mục tiêu dap-lua): hành lang (1..6, 3), xe (1,3) quay phải; hai giếng bên trái (phía trên): đám cháy cỡ 1 ở (3,2) sát hành lang, cỡ 2 ở (6,1) cách một ô; cờ (7,3).
  //   Lửa không chắn đường: phải dập hết mới thắng. put_out_left() = tr_left(), put_out(), tr_right().
  var SAN_U2 = ['#########', '######.##', '###.##.##', '#......F#', '#########'];
  var LUA_U2 = [lua(3, 2, 1), lua(6, 1, 2)];
  // trum-mua-2.3: hành lang (1..7, 1), xe (1,1) quay phải; đám cháy cỡ 2 ở (4,1) cách hai ô trống (phun nhẹ không tới); góc (7,1) rẽ xuống: đám cháy cỡ 1 ở (7,5)
  //   cách ba ô; cờ (7,6). put_far() của Sola phun nhẹ tới khi hết nóng: lửa ngoài tầm nên lặp mãi. Sửa: phun mạnh.
  var SAN_U3 = ['#########', '#.......#', '#######.#', '#######.#', '#######.#', '#######.#', '#######F#', '#########'];
  var LUA_U3 = [lua(4, 1, 2), lua(7, 5, 1)];
  // trum-mua-2.4 (dap-lua): hành lang (1..7, 3), xe (1,3) quay phải; ba giếng bên trái cách đều hai ô: đám cháy cỡ 1 ở (3,2), cỡ 2 ở (5,1), cỡ 1 ở (7,2); cờ (8,3).
  //   clear_row(n): n lần forward(2) rồi put_out_left().
  var SAN_U4 = ['##########', '###.#.####', '###.#.#.##', '#.......F#', '##########'];
  var LUA_U4 = [lua(3, 2, 1), lua(5, 1, 2), lua(7, 2, 1)];
  // trum-mua-2.5 (hai robot): R2 (xe đẩy) ở (1,1), thùng (2,1) nằm sẵn TRONG giếng đầu; R2 chờ bốn nhịp rồi đẩy thùng dọc hành lang trên tới cờ R2 (6,1), thùng dừng ở (7,1).
  //   R1 (bệ súng) ở hành lang dưới (hàng 3): trạm (2,3), (5,3) quay lên phun mạnh nút (2,0), (5,0) qua giếng; thùng hay bạn còn trong giếng thì bóng bị chắn. Nút mở cửa (3,3), (6,3); cờ R1 (7,3). Hốc (2,4).
  //   box_spray(): còn thấy gì gần (distance() < 2: thùng không nóng, warm() không thấy) thì chờ, rồi phun mạnh. Gói lửa: đám cháy cỡ 1 ở trạm đầu (2,3), R1 put_out() trước khi đi.
  var SAN_U5 = ['##N##N####', '#.H...F.##', '##.##.####', '#..C..CF##', '##.#######', '##########'];
  // trum-mua-2.6: hai làn gấp khúc. Làn 1 (hàng 2): xe (1,2), thùng (3,2) cách một ô, cửa (4,2), ô đích (5,2); trạm (2,2) có nút (2,0) xa phía trên, hốc (2,3). Làn 2 (cột 4, đi xuống từ (4,2)):
  //   thùng (4,5) cách hai ô, cửa (4,6), ô đích (4,7); trạm (4,4) có nút (7,4) xa bên trái xe (phía đông), hốc (3,4). gate_push(): go_spray() (tới sát thùng, phun nút mở cửa) rồi push(2).
  //   Gói lửa: đám cháy cỡ 2 ở (2,2) giữa xe và thùng: put_out() trước.
  var SAN_U6 = ['##N######', '##.######', '#..HCD###', '##.#.####', '###....N#', '####H####', '####C####', '####D####', '#########'];
  // trum-mua-2.7: hành lang (1..7, 3), xe (1,3) quay phải; hai trạm (3,3), (6,3): giếng bên trái có đám cháy (cỡ 1 ở (3,2), cỡ 2 ở (6,2)) đứng trước van (3,0), (6,0);
  //   van mở cửa (4,3), (7,3) ngay sau trạm; cờ (8,3). fire_valve() = tr_left(), put_out(), squirt("high"), tr_right(): dập lửa rồi phun mạnh mở van (cách ba ô).
  var SAN_U7 = ['###N##N###', '###.##.###', '###.##.###', '#...C..CF#', '##########'];
  var LUA_U7 = [lua(3, 2, 1), lua(6, 2, 2)];
  // trum-mua-2.8 (đố, dap-lua): xe (1,3) quay phải; giếng bên trái ở (3,·): đám cháy cỡ 1 ở (3,2), van (3,0) ở cuối giếng nối cánh cửa (4,3) đang MỞ trên hành lang; cờ (6,3).
  //   Sola phun mạnh hai lần cho chắc: lần thừa bay qua chỗ lửa đã tắt, trúng van, cửa đóng lại.
  var SAN_U8 = ['###N####', '###.####', '###.####', '#...c.F#', '########'];
  var LUA_U8 = [lua(3, 2, 1)];
  // trum-mua-2.9: đường rắn. Xe (4,4) quay lên: thùng (4,2) cách một ô, ô đích (4,1) cách thùng một ô; đẩy xong xe đứng ở (4,2). Quay phải: thùng (7,2) cách hai ô, ô đích (9,2) cách thùng hai ô;
  //   xe đứng ở (8,2) (đẩy d ô thì xe đi quá chỗ thùng cũ d - 1 ô). Quay phải (đi xuống): thùng (8,4) cách một ô, ô đích (8,5). far_push(): d = distance() rồi push(d): thùng ở xa bao nhiêu thì đẩy đi bấy nhiêu.
  //   Gói lửa: đám cháy cỡ 2 ở (4,3) giữa xe và thùng đầu: put_out() trước (lửa còn thì distance() đo tới lửa).
  var SAN_U9 = ['###########', '####D######', '####H..H.D#', '####.###.##', '####.###H##', '########D##', '###########'];
  // trum-mua-2.10 (TRÙM CUỐI MÙA 2, hai sân, một chương trình): hành lang trên (hàng 3): trạm có nút xa phía trên (hốc phía dưới) rồi cửa, xa gần khác nhau (1 / 5 ô): go_spray(). Hành lang hết ở tường
  //   (sau cửa 7 / 1 ô):
  //   go_to_wall(). Né xuống làn dưới (sidestep), ở đó nút xa phía trên (sân 2 ĐANG BẬT, cửa mở sẵn), hốc phía dưới: valve_left(). Thùng ở xa gần khác nhau (1 / 4 ô), cửa ngay sau thùng, ô đích sau cửa: push(2).
  //   Hai sân khác nhau nhiều ở mọi đoạn để dãy cố định (đếm cứng, húc tường chờ) tốn hơn ngưỡng nhịp (bộ dò dayChung kiểm).
  //   Gói lửa: đám cháy ở (2,3) sát mũi lúc xuất phát, cỡ 1 / 3: put_out() trước.
  var SAN_U10 = [
    ['##N#######N#####', '##.#######.#####', '##.#######.#####', '#..C.......#####', '##.#######..HCD#', '##########.#####', '################'],
    ['######N#N########', '######.#.########', '######.#.########', '#......C.########', '######.#.....HcD#', '########.########', '#################']
  ];

  /* ------------------------------------------------------------- chương trình chương trum-mua-2 */

  var C_U1 = ['put_out()', 'forward(3)', 'tr_right()', 'put_out()', 'forward(3)'];
  var T_PUT = WHILE('warm()', ['squirt("low")']);                          // put_out(): còn nóng (còn lửa trước mũi) thì phun nhẹ
  var C_U2 = ['forward(2)', 'put_out_left()', 'forward(3)', 'put_out_left()', 'move()'];
  var T_PUTL = ['tr_left()', 'put_out()', 'tr_right()'];                    // put_out_left(): quay trái, dập lửa, quay lại
  var C_U3 = ['put_far()', 'forward(6)', 'tr_right()', 'put_far()', 'forward(5)'];
  var T_PUTFAR_LOI = WHILE('warm()', ['squirt("low")']);                    // put_far() của Sola: phun nhẹ, lửa ngoài tầm nên lặp mãi
  var T_PUTFAR = WHILE('warm()', ['squirt("high")']);
  var C_U4 = ['clear_row(3)', 'move()'];
  var T_ROW = FOR('n', ['forward(2)', 'put_out_left()']);                  // clear_row(n): n giếng cháy cách đều hai ô
  var R1_U5 = nhieu(['put_out()', 'move()'], FOR(2, ['tr_left()', 'box_spray()', 'tr_right()', 'forward(3)']));
  var R2_U5 = nhieu(CHO(4), ['forward(5)']);
  var T_BOXS = WHILE('distance() < 2', ['wait()']).concat(['squirt("high")']);   // box_spray(): thùng hay bạn còn trong giếng thì chờ, rồi phun mạnh
  var C_U6 = ['put_out()', 'gate_push()', 'tr_right()', 'gate_push()'];
  var T_GATE = ['go_spray()', 'push(2)'];                                  // gate_push(): tới sát thùng, phun nút mở cửa, đẩy thùng hai ô qua cửa
  var C_U7 = ['forward(2)', 'fire_valve()', 'forward(3)', 'fire_valve()', 'forward(2)'];
  var T_FV = ['tr_left()', 'put_out()', 'squirt("high")', 'tr_right()'];     // fire_valve(): dập lửa trước van rồi phun mạnh mở van
  var M_U8 = ['forward(2)', 'tr_left()', 'squirt("high")', 'squirt("high")', 'tr_right()', 'forward(3)'];
  var L_U8 = ['forward(2)', 'tr_left()', 'squirt("high")', 'tr_right()', 'forward(3)'];
  var C_U9 = ['put_out()', 'far_push()', 'tr_right()', 'far_push()', 'tr_right()', 'far_push()'];
  var T_FAR = ['d = distance()', 'push(d)'];                              // far_push(): thùng cách d ô thì đẩy nó đi d ô
  var L_U10 = ['put_out()', 'go_spray()', 'go_to_wall()', 'sidestep()', 'valve_left()', 'push(2)'];

  var DS = [
    /* ================================================================ chương tong-hop-2: Dập lửa */
    man({
      chuong: 'tong-hop-2', so: 1, ten: 'Đám cháy đầu tiên', yMoi: 'trình diễn: đám cháy chắn lối như tường; tia nước trúng thì lửa tắt hẳn, xe đi qua được',
      kieuBai: 'trinh-dien', chiChay: true, chinhCoDinh: true, hamCuaEmCan: ['squirt', 'squirt_back', 'forward', 'move'],
      deBai: 'Nhà máy của Sola bốc cháy! Đám cháy chắn ngang hành lang: còn cháy thì xe không đi qua được, như gặp tường. Lửa này có một ngọn: tia nước trúng một lần là tắt hẳn, ' +
        'không cháy lại. Bấm Chạy xem squirt("low") dập lửa rồi xe đi tới cờ.',
      veMaMau: 'Chương trình đã viết sẵn và khoá. Bấm Chạy: lửa cách hai ô, phun nhẹ là tới.',
      san: SAN_T1, batDau: { x: 1, y: 1, huong: 1 }, lua: LUA_T1,
      maMau: bai(L_T1),
      sao: { o: 9, nhip: 6 },
      loiGiai: bai(L_T1),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# dập lửa trước, đi sau'].concat(L_T1)) },
      loiSai: [
        { moTa: 'Đi ngay chưa dập lửa: xe đâm vào đám cháy', baiLam: bai(['forward(5)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Phun ra sau: lửa phía trước vẫn cháy', baiLam: bai(['squirt_back("low")', 'forward(5)']), phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['Số ngọn lửa là số lần tia nước phải trúng.', 'Màn sau lửa to hơn: em tự đếm số lần phun.']
    }),

    man({
      chuong: 'tong-hop-2', so: 2, ten: 'Lửa to', yMoi: 'lửa có hai ngọn: phải trúng hai lần mới tắt (đếm ngọn lửa)',
      kieuBai: 'lua-to', hamCuaEmCan: ['squirt', 'forward', 'move'],
      deBai: 'Đám cháy này to hơn: hai ngọn lửa. Mỗi lần tia nước trúng, lửa nhỏ đi một ngọn; hết ngọn thì tắt hẳn. Lửa ở ngay trước mũi xe. Dập tắt rồi đi tới cờ.',
      veMaMau: 'Chương trình có sẵn phun một lần rồi đi: lửa còn một ngọn, xe đâm vào.',
      san: SAN_T2, batDau: { x: 1, y: 1, huong: 1 }, lua: LUA_T2,
      maMau: bai(['squirt("low")', 'forward(5)']),
      sao: { o: 10, nhip: 7 },
      loiGiai: bai(L_T2),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# hai ngọn: phun hai lần'].concat(L_T2)) },
      congThucKhac: [{ moTa: 'Phun hai lần bằng vòng for', baiLam: bai(FOR(2, ['squirt("low")']).concat(['forward(5)'])) }],
      loiSai: [
        { moTa: 'Để nguyên một lần phun: lửa còn một ngọn, xe đâm vào', baiLam: bai(['squirt("low")', 'forward(5)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Đi trước rồi mới phun: xe đâm vào lửa ngay bước đầu', baiLam: bai(['forward(5)', 'squirt("low")', 'squirt("low")']), phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['Đếm ngọn lửa: mỗi ngọn là một lần trúng.', 'squirt("low") hai lần, rồi forward(5).']
    }),

    man({
      chuong: 'tong-hop-2', so: 3, ten: 'Giếng sau lưng', yMoi: 'ôn: squirt_back("high") trên bệ vòi mở cửa sau lưng; lửa giữa hành lang cách ba ô: phải phun mạnh (gói 6 + gói 9)',
      kieuBai: 'ban-sau', hamCuaEmCan: ['squirt', 'squirt_back', 'tr_right', 'forward', 'move', 'back'],
      deBai: 'Van mở cửa nằm ở cuối giếng sau lưng xe, cách ba ô: phun nhẹ không tới, phải phun mạnh ra sau bằng squirt_back("high"). Trên đầu xe là hốc: xe hai bánh phun ra sau ' +
        'thì giật tới vào hốc, còn bệ vòi xích đứng yên. Mở cửa bên phải. Giữa hành lang bên phải có một đám cháy cách ba ô: dập nó rồi đi tới cờ.',
      veMaMau: 'Sola viết cho xe hai bánh: phun xong back() để về chỗ cũ. Trên bệ vòi, back() làm xe tụt xuống giếng.',
      san: SAN_T3, batDau: { x: 2, y: 2, huong: 0 }, noi: [noi(2, 5, [[3, 2]])], lua: LUA_T3,
      maMau: bai(['squirt_back("high")', 'back()', 'tr_right()', 'squirt("high")', 'forward(5)']),
      sao: { o: 16, nhip: 9 },
      loiGiai: bai(L_T3),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# phun mạnh ra sau, bệ vòi không trôi'].concat(L_T3)) },
      loiSai: [
        { moTa: 'Để nguyên back() của Sola: xe tụt xuống giếng, rẽ phải đâm tường', baiLam: bai(['squirt_back("high")', 'back()', 'tr_right()', 'squirt("high")', 'forward(5)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Phun nhẹ vào lửa: lửa cách ba ô, tia nước rơi trước lửa', baiLam: bai(['squirt_back("high")', 'tr_right()', 'squirt("low")', 'forward(5)']), phaiCoMa: ['ban-ngan', 'dam-tuong'] },
        { moTa: 'Phun nhẹ ra sau: van cách ba ô, tia nước rơi giữa giếng', baiLam: bai(['squirt_back("low")', 'tr_right()', 'squirt("high")', 'forward(5)']), phaiCoMa: ['ban-ngan', 'dam-tuong'] }
      ],
      goiY: ['squirt_back("high") phun mạnh ra sau đuôi xe và chờ một nhịp.', 'Lửa cách ba ô: phun nhẹ chỉ bay hai ô.', 'Phun ra sau, tr_right(), phun mạnh dập lửa, forward(5).']
    }),

    man({
      chuong: 'tong-hop-2', so: 4, ten: 'Thùng ở làn dưới', yMoi: 'ôn: quay xích, dập lửa ở chỗ né xuống, xích đẩy thùng (gói 1 + gói 5 + gói 6)',
      kieuBai: 'day-thung', mucTieu: 'day-thung', hamCuaEmCan: ['sidestep', 'squirt', 'tr_right', 'tr_left', 'forward', 'move'],
      deBai: 'Thùng hàng nằm ở làn dưới, xe xích đứng ở làn trên. Sola né xuống bằng sidestep() như mọi khi, nhưng đúng chỗ xe né xuống đang có lửa. ' +
        'Quay xuống, dập lửa, xuống làn dưới, quay lại hướng cũ rồi đẩy thùng năm ô vào ô đích: xích tiến là thùng trượt.',
      veMaMau: 'Chương trình có sẵn né xuống như cũ: chỗ né đang cháy, xe đâm vào lửa.',
      san: SAN_T4, batDau: { x: 1, y: 1, huong: 1 }, lua: LUA_T4,
      maMau: bai(['sidestep()', 'forward(5)']),
      sao: { o: 18, nhip: 11 },
      loiGiai: bai(L_T4),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# dập lửa chỗ né rồi mới xuống'].concat(L_T4)) },
      loiSai: [
        { moTa: 'Né xuống như cũ: chỗ né đang cháy, xe đâm vào lửa', baiLam: bai(['sidestep()', 'forward(5)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Phun mà chưa quay xuống: tia nước bay dọc làn trên', baiLam: bai(['squirt("low")', 'sidestep()', 'forward(5)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Dập lửa rồi quên quay lại: xe đi xuống tường', baiLam: bai(['tr_right()', 'squirt("low")', 'move()', 'forward(5)']), phaiCoMa: ['chua-day-thung'] }
      ],
      goiY: ['sidestep() = tr_right(), move(), tr_left(): chen một lần phun vào giữa.', 'tr_right(), squirt("low"), move(), tr_left(), forward(5).']
    }),

    man({
      chuong: 'tong-hop-2', so: 5, ten: 'Mở cửa cho thùng sau lưng', yMoi: 'ôn: lửa chắn trước van: phun nhẹ dập lửa, phun mạnh mở van, spin() rồi đẩy thùng qua cửa (gói 1 + gói 5 + gói 6)',
      kieuBai: 'mo-cua', mucTieu: 'day-thung', hamCuaEmCan: ['squirt', 'spin', 'tr_right', 'tr_left', 'forward', 'move'],
      deBai: 'Van ở cuối giếng trước mặt, cách ba ô, nhưng giữa đường có một đám cháy chắn tia nước. Sau lưng xe là thùng, xa hơn là cánh cửa đóng rồi ô đích. ' +
        'Dập lửa trước, rồi phun mạnh mở cửa, quay nửa vòng bằng spin() của gói Bánh xích, ' +
        'rồi đẩy thùng bốn ô qua cửa vào ô đích.',
      veMaMau: 'Chương trình có sẵn quay lại đẩy ngay: cửa còn đóng, thùng kẹt.',
      san: SAN_T5, batDau: { x: 2, y: 3, huong: 0 }, noi: [noi(2, 0, [[2, 7]])], lua: LUA_T5,
      maMau: bai(['spin()', 'forward(4)']),
      sao: { o: 16, nhip: 10 },
      loiGiai: bai(L_T5),
      congThucKhac: [{ moTa: 'Phun mạnh cả hai lần', baiLam: bai(['squirt("high")', 'squirt("high")', 'spin()', 'forward(4)']) }],
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# dập lửa, mở cửa, quay lại đẩy'].concat(L_T5)) },
      loiSai: [
        { moTa: 'Quay lại đẩy ngay, chưa mở cửa: thùng vướng cửa đóng', baiLam: bai(['spin()', 'forward(4)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Phun một lần: tia nước trúng lửa, van chưa mở', baiLam: bai(['squirt("high")', 'spin()', 'forward(4)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Dập lửa rồi phun nhẹ: van cách ba ô, tia nước rơi giữa giếng', baiLam: bai(['squirt("low")', 'squirt("low")', 'spin()', 'forward(4)']), phaiCoMa: ['ban-ngan', 'dam-tuong'] }
      ],
      goiY: ['Lửa chắn tia: lần phun đầu trúng lửa chứ không trúng van.', 'squirt("low"), squirt("high"), spin(), forward(4).']
    }),

    man({
      chuong: 'tong-hop-2', so: 6, ten: 'Sửa hàm pair_spray()', yMoi: 'sửa hàm lỗi: lửa chắn tia trước van trên; dập lửa, mở van trên, rồi phun ra sau mở van dưới (gói 4 + gói 6)',
      kieuBai: 'sua-ham', chinhCoDinh: true, hamCuaEmCan: ['squirt', 'squirt_back', 'tr_left', 'tr_right', 'forward', 'move'],
      deBai: 'Ở trạm có hai van: một ở cuối giếng phía trên, một ở cuối giếng phía dưới, đều cách ba ô; mỗi van mở một cánh cửa phía trước. Xe quay lên ở trạm: van trên trước mặt, van dưới sau lưng. ' +
        'Sola chế pair_spray() từ trước khi nhà máy cháy: hai lần squirt("high") ra trước. Nay giếng trên có một đám cháy sát trạm, chắn tia nước tới van trên. ' +
        'Chương trình chính đã khóa. Chạy thử rồi sửa hàm cho cả hai cửa đều mở.',
      veMaMau: 'Chạy thử. Hai cánh cửa: cánh nào mở, cánh nào không?',
      san: SAN_T6, batDau: { x: 1, y: 3, huong: 1 }, noi: [noi(3, 0, [[4, 3]]), noi(3, 6, [[5, 3]])], lua: LUA_T6,
      maMau: bai(C_T6, [H('pair_spray', [], T_PAIR_LOI)]),
      sao: { o: 23, nhip: 12 },
      loiGiai: bai(C_T6, [H('pair_spray', [], T_PAIR)]),
      loiGiaiKhac: { moTa: 'Cùng cách sửa, thêm một dòng chú thích trong hàm', baiLam: bai(C_T6, [H('pair_spray', [], ['# dập lửa, van trên, van dưới'].concat(T_PAIR))]) },
      congThucKhac: [{ moTa: 'Phun ra sau trước, rồi dập lửa và mở van trên', baiLam: bai(C_T6, [H('pair_spray', [], ['squirt_back("high")', 'squirt("low")', 'squirt("high")'])]) }],
      loiSai: [
        { moTa: 'Để nguyên bản của Sola: lần đầu trúng lửa, lần sau mở van trên, van dưới không ai phun', baiLam: bai(C_T6, [H('pair_spray', [], T_PAIR_LOI)]), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Quên dập lửa: phun trên rồi phun ra sau, tia trên trúng lửa nên van trên chưa mở', baiLam: bai(C_T6, [H('pair_spray', [], ['squirt("high")', 'squirt_back("high")'])]), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Phun nhẹ ra sau: van cách ba ô, tia nước rơi giữa giếng', baiLam: bai(C_T6, [H('pair_spray', [], ['squirt("low")', 'squirt("high")', 'squirt_back("low")'])]), phaiCoMa: ['ban-ngan', 'dam-tuong'] }
      ],
      goiY: ['Lửa chắn tia: lần phun đầu trúng lửa chứ không trúng van.', 'squirt("low"), squirt("high"), squirt_back("high").']
    }),

    man({
      chuong: 'tong-hop-2', so: 7, ten: 'Hai đám cháy', yMoi: 'hàm của màn douse(): while warm() phun tới khi hết nóng; hai đám cháy cỡ khác nhau, chương trình chính khóa',
      kieuBai: 'doc-nhiet', mat: true, chinhCoDinh: true, hamCuaEmCan: ['squirt', 'tr_right', 'forward', 'move'],
      deBai: 'Hành lang có hai đám cháy: đám đầu một ngọn, đám sau góc rẽ ba ngọn. Chương trình chính đã khóa: tới gần mỗi đám cháy thì gọi douse(). ' +
        'Viết thân douse() để lần nào gọi cũng dập tắt hẳn lửa trước mũi xe, dù lửa to hay nhỏ. Mắt hồng ngoại có warm(): lửa còn cháy thì nóng.',
      veMaMau: 'Chương trình chính bị khóa. douse() có sẵn phun một lần: đám cháy thứ hai còn hai ngọn.',
      san: SAN_T7, batDau: { x: 1, y: 1, huong: 1 }, lua: LUA_T7,
      maMau: bai(C_T7, [H('douse', [], ['squirt("low")'])]),
      sao: { o: 18, nhip: 15 },
      loiGiai: bai(C_T7, [H('douse', [], T_DOUSE)]),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(C_T7, [H('douse', [], ['# còn nóng là còn lửa'].concat(T_DOUSE))]) },
      congThucKhac: [
        { moTa: 'Phun mạnh tới khi hết nóng', baiLam: bai(C_T7, [H('douse', [], WHILE('warm()', ['squirt("high")']))]) },
        { moTa: 'Phun cố định ba lần: tắt được cả hai đám nhưng phí hai nhịp ở đám nhỏ', baiLam: bai(C_T7, [H('douse', [], FOR(3, ['squirt("low")']))]) }
      ],
      loiSai: [
        { moTa: 'Để nguyên một lần phun: đám thứ hai còn hai ngọn, xe đâm vào lửa', baiLam: bai(C_T7, [H('douse', [], ['squirt("low")'])]), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Viết if warm(): chỉ phun một lần như cũ', baiLam: bai(C_T7, [H('douse', [], IF('warm()', ['squirt("low")']))]), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Viết while not warm(): lửa đang nóng nên không phun lần nào', baiLam: bai(C_T7, [H('douse', [], WHILE('not warm()', ['squirt("low")']))]), phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['warm() là True khi trước mũi xe còn lửa.', 'Thân douse(): while warm(): squirt("low").']
    }),

    man({
      chuong: 'tong-hop-2', so: 8, ten: 'Bệ vòi và xe đẩy', yMoi: 'ôn gói Đội: hai robot, bệ vòi chờ bạn đi khỏi đường tia nước rồi phun (clear_squirt của gói 8); cả hai chương trình khóa',
      kieuBai: 'doi-ban', hamCuaEmCan: ['clear_squirt', 'wait_clear', 'wait_mate', 'squirt', 'tr_left', 'tr_right', 'forward', 'move'],
      deBai: 'Đội hai xe xích: R1 là bệ vòi, R2 là xe đẩy đi hành lang trên và đứng lại ở giếng đầu một lúc. R1 ở mỗi trạm quay lên phun mạnh van cuối giếng cho cửa mở; ' +
        'R2 còn đứng trong giếng thì tia nước trúng bạn. Đám cháy ở trạm đầu đã có lệnh dập sẵn. Hai chương trình đã khóa. ' +
        'Viết cover_spray(): chờ bạn đi khỏi rồi phun mạnh. clear_squirt(p) của gói Đội làm đúng việc đó.',
      veMaMau: 'Hai chương trình bị khóa. cover_spray() có sẵn phun ngay: tia nước trúng R2 ở trạm đầu.',
      san: SAN_T8, noi: [noi(2, 0, [[3, 3]]), noi(5, 0, [[6, 3]])], bd: [{ x: 1, y: 3, huong: 1 }, { x: 1, y: 1, huong: 1 }], co: [[o(8, 3)], [o(7, 1)]], lua: [lua(2, 3, 1)],
      chinh: [R1_T8, R2_T8],
      hamMau: [H('cover_spray', [], ['squirt("high")'])],
      ham: [H('cover_spray', [], T_COVER)],
      sao: { o: 29, nhip: 20 },
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', ham: [H('cover_spray', [], ['# bạn đi khỏi rồi mới phun'].concat(T_COVER))] },
      congThucKhac: [{ moTa: 'Viết wait_clear() rồi squirt("high")', ham: [H('cover_spray', [], ['wait_clear()', 'squirt("high")'])] }],
      loiSai: [
        { moTa: 'Phun ngay: tia nước trúng R2 đang đứng trong giếng đầu', ham: [H('cover_spray', [], ['squirt("high")'])], phaiCoMa: ['ban-bi-chan', 'dam-tuong'] },
        { moTa: 'Chờ bạn TỚI (wait_mate) rồi phun: ở trạm sau R2 đã đi qua, chờ mãi', ham: [H('cover_spray', [], ['wait_mate()', 'squirt("high")'])], phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Chờ đúng nhưng phun nhẹ: van cách ba ô', ham: [H('cover_spray', [], ['clear_squirt("low")'])], phaiCoMa: ['ban-ngan', 'dam-tuong'] }
      ],
      goiY: ['warm() thấy R2 trong giếng; wait_clear() chờ tới khi hết thấy.', 'Thân cover_spray(): clear_squirt("high").']
    }),

    man({
      chuong: 'tong-hop-2', so: 9, ten: 'Thùng qua ngã tư', yMoi: 'ôn gói Đội + Đẩy thùng: R2 đẩy thùng qua ngã tư; thùng không nóng nên R1 phải đo distance() (step_clear của gói 8)',
      kieuBai: 'doi-thung', hamCuaEmCan: ['step_clear', 'yield_step', 'wait_clear', 'squirt', 'forward', 'move', 'tr_right'],
      deBai: 'R2 (xe đẩy) đẩy thùng nặng xuống qua ngã tư rồi dừng một lúc; R1 (bệ vòi) đi hành lang cắt ngang ngã tư đó, mỗi bước gọi box_step(). ' +
        'Thùng không nóng nên warm() không thấy nó; phải đo distance(): có gì sát mũi xe thì chờ, không thì tiến. step_clear() của gói Đội làm đúng việc đó. ' +
        'Đám cháy giữa hành lang đã có lệnh dập sẵn ở đầu chương trình R1. Hai chương trình đã khóa.',
      veMaMau: 'Hai chương trình bị khóa. box_step() có sẵn chỉ tiến: R1 húc vào thùng.',
      san: SAN_T9, bd: [{ x: 1, y: 3, huong: 1 }, { x: 4, y: 1, huong: 2 }], co: [[o(7, 3)], [o(4, 4)]], lua: [lua(3, 3, 1)],
      chinh: [R1_T9, R2_T9],
      hamMau: [H('box_step', [], ['move()'])],
      ham: [H('box_step', [], T_BOX)],
      sao: { o: 18, nhip: 10 },
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', ham: [H('box_step', [], ['# thùng hay bạn sát mũi thì chờ'].concat(T_BOX))] },
      congThucKhac: [{ moTa: 'Viết thẳng while distance() == 0: wait() rồi move()', ham: [H('box_step', [], WHILE('distance() == 0', ['wait()']).concat(['move()']))] }],
      loiSai: [
        { moTa: 'Chỉ tiến: R1 húc vào thùng đang nằm trong ngã tư', ham: [H('box_step', [], ['move()'])], phaiCoMa: ['dam-tuong'] },
        { moTa: 'Dùng yield_step() (chờ khi warm()): thùng không nóng, R1 vẫn húc thùng', ham: [H('box_step', [], ['yield_step()'])], phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['distance() là 0 khi ngay trước mũi có thùng hay bạn.', 'Thân box_step(): step_clear().']
    }),

    man({
      chuong: 'tong-hop-2', so: 10, ten: 'Trùm: Ba hành lang cháy', yMoi: 'một chương trình cho ba sân: while warm() dập lửa cỡ và xa gần khác nhau, go_to_wall() tới cuối hành lang, rẽ xuống cờ',
      hang: 'trum', kieuBai: 'trum', mat: true, hamCuaEmCan: ['go_to_wall', 'squirt', 'tr_right', 'forward', 'move'],
      huyHieu: { ma: 'tong-hop-2', ten: 'Huy hiệu Dập lửa' },
      deBai: 'Ba hành lang đang cháy, một chương trình. Đám cháy to nhỏ khác nhau, xa gần khác nhau; hành lang dài ngắn khác nhau. Dập tắt lửa, đi tới cuối hành lang, ' +
        'rẽ phải rồi xuống hai ô tới cờ. Phun mạnh thì tia bay tới lửa ở mọi khoảng cách; warm() còn True là còn lửa.',
      veMaMau: 'Chương trình có sẵn đếm cứng theo sân đầu: sân sau lửa to hơn, hành lang dài hơn.',
      san: SAN_T10, batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }], lua: LUA_T10,
      maMau: bai(['squirt("high")', 'forward(4)', 'tr_right()', 'forward(2)']),
      sao: { o: 17, nhip: 36 },
      loiGiai: bai(L_T10),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# dập hết lửa, tới tường, rẽ xuống cờ'].concat(L_T10)) },
      congThucKhac: [{ moTa: 'Phun mạnh ba lần cố định: vẫn tới cờ nhưng phí nhịp ở lửa nhỏ', baiLam: bai(FOR(3, ['squirt("high")']).concat(['go_to_wall()', 'tr_right()', 'forward(2)'])) }],
      loiSai: [
        { moTa: 'Đếm cứng theo sân đầu: sân sau lửa còn cháy, xe đâm vào', baiLam: bai(['squirt("high")', 'forward(4)', 'tr_right()', 'forward(2)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Phun nhẹ: lửa ở xa, tia nước rơi trước lửa', baiLam: bai(WHILE('warm()', ['squirt("low")']).concat(['go_to_wall()', 'tr_right()', 'forward(2)'])), phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Đi tới tường trước rồi mới dập: go_to_wall() dừng ngay trước lửa, rẽ xuống tường', baiLam: bai(['go_to_wall()'].concat(WHILE('warm()', ['squirt("high")']), ['tr_right()', 'forward(2)'])), phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['while warm(): squirt("high") dập lửa to nhỏ, xa gần đều được.', 'Rồi go_to_wall(), tr_right(), forward(2).']
    }),

    /* ================================================================ chương trum-mua-2: Chế lệnh: dập lửa */
    man({
      chuong: 'trum-mua-2', so: 1, ten: 'Hàm put_out()', yMoi: 'chế hàm put_out(): while warm() phun nhẹ tới khi hết nóng; chương trình chính khóa gọi ở hai đám cháy to nhỏ khác nhau',
      kieuBai: 'che-ham', mat: true, chinhCoDinh: true, taoHam: ['put_out'], hamCuaEmCan: ['squirt', 'tr_right', 'forward', 'move'],
      deBai: 'Từ giờ em chế lệnh dập lửa cho xe cứu hỏa. put_out(): còn nóng (còn lửa trước mũi) thì phun nhẹ, tới khi hết nóng. Hàm này sẽ theo em suốt chương. ' +
        'Chương trình chính đã khóa: dập đám ba ngọn, đi tới góc, quay phải, dập đám một ngọn rồi xuống cờ.',
      veMaMau: 'Chương trình chính bị khóa. Mở Xưởng hàm, tạo put_out() hai dòng.',
      san: SAN_U1, batDau: { x: 1, y: 1, huong: 1 }, lua: LUA_U1,
      maMau: bai(C_U1),
      sao: { o: 17, nhip: 12 },
      loiGiai: { chinh: C_U1.slice(), hamCuaEmMoi: [H('put_out', [], T_PUT)] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: bai(C_U1), hamCuaEmMoi: [H('put_out', [], ['# còn nóng là còn lửa'].concat(T_PUT))] },
      congThucKhac: [{ moTa: 'Phun mạnh tới khi hết nóng', baiLam: bai(C_U1), hamCuaEmMoi: [H('put_out', [], WHILE('warm()', ['squirt("high")']))] }],
      loiSai: [
        { moTa: 'Phun một lần: đám ba ngọn còn hai ngọn, xe đâm vào lửa', baiLam: bai(C_U1), hamCuaEmMoi: [H('put_out', [], ['squirt("low")'])], phaiCoMa: ['dam-tuong'] },
        { moTa: 'Viết if warm(): chỉ phun một lần', baiLam: bai(C_U1), hamCuaEmMoi: [H('put_out', [], IF('warm()', ['squirt("low")']))], phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['warm() là True khi trước mũi xe còn lửa.', 'Thân put_out(): while warm(): squirt("low").']
    }),

    man({
      chuong: 'trum-mua-2', so: 2, ten: 'Hàm put_out_left()', yMoi: 'mục tiêu dập hết lửa: lửa trong giếng bên trái không chắn đường; chế put_out_left() gọi put_out()',
      kieuBai: 'ban-ben', mucTieu: 'dap-lua', mat: true, chinhCoDinh: true, taoHam: ['put_out_left'], hamCuaEmCan: ['put_out', 'squirt', 'tr_left', 'tr_right', 'forward', 'move'],
      deBai: 'Dọc hành lang có hai giếng bên trái đang cháy. Lửa không chắn đường đi, nhưng màn này phải dập hết lửa rồi mới về cờ. ' +
        'Em chế put_out_left(): quay trái, gọi put_out() của em, quay lại. Chương trình chính đã khóa.',
      veMaMau: 'Chương trình chính bị khóa. Tạo put_out_left() ba dòng.',
      san: SAN_U2, batDau: { x: 1, y: 3, huong: 1 }, lua: LUA_U2,
      maMau: bai(C_U2),
      sao: { o: 23, nhip: 17 },
      loiGiai: { chinh: C_U2.slice(), hamCuaEmMoi: [H('put_out_left', [], T_PUTL)] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: bai(C_U2), hamCuaEmMoi: [H('put_out_left', [], ['# quay trái, dập, quay lại'].concat(T_PUTL))] },
      congThucKhac: [{ moTa: 'Viết thẳng vòng while trong hàm', baiLam: bai(C_U2), hamCuaEmMoi: [H('put_out_left', [], ['tr_left()'].concat(WHILE('warm()', ['squirt("low")']), ['tr_right()']))] }],
      loiSai: [
        { moTa: 'Phun cố định một lần: đám hai ngọn còn một ngọn', baiLam: bai(C_U2), hamCuaEmMoi: [H('put_out_left', [], ['tr_left()', 'squirt("low")', 'tr_right()'])], phaiCoMa: ['con-lua'] },
        { moTa: 'Quên quay lại: xe đi vào giếng', baiLam: bai(C_U2), hamCuaEmMoi: [H('put_out_left', [], ['tr_left()', 'put_out()'])], phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['Giống spray_left() của gói Bệ vòi, nhưng giữa hai lần quay là put_out().', 'tr_left(), put_out(), tr_right().']
    }),

    man({
      chuong: 'trum-mua-2', so: 3, ten: 'Sửa hàm put_far()', yMoi: 'sửa hàm lỗi: lửa ở xa, phun nhẹ không tới nên while warm() lặp mãi; phải phun mạnh',
      kieuBai: 'sua-ham', mat: true, chinhCoDinh: true, hamCuaEmCan: ['auto_spray', 'squirt', 'tr_right', 'forward', 'move'],
      deBai: 'Sola chép put_out() thành put_far() cho những đám cháy ở xa. Chạy thử: xe đứng phun mãi, lửa không nhỏ đi. Lửa cách xe hai, ba ô trống: phun nhẹ chỉ bay hai ô. ' +
        'Chương trình chính đã khóa. Sửa put_far() cho tia nước tới được lửa.',
      veMaMau: 'Chạy thử. Tia nước rơi ở đâu?',
      san: SAN_U3, batDau: { x: 1, y: 1, huong: 1 }, lua: LUA_U3,
      maMau: bai(C_U3, [H('put_far', [], T_PUTFAR_LOI)]),
      sao: { o: 17, nhip: 16 },
      loiGiai: bai(C_U3, [H('put_far', [], T_PUTFAR)]),
      loiGiaiKhac: { moTa: 'Cùng cách sửa, thêm một dòng chú thích trong hàm', baiLam: bai(C_U3, [H('put_far', [], ['# lửa ở xa: phun mạnh'].concat(T_PUTFAR))]) },
      congThucKhac: [{ moTa: 'Để auto_spray() chọn lực theo xa gần', baiLam: bai(C_U3, [H('put_far', [], WHILE('warm()', ['auto_spray()']))]) }],
      loiSai: [
        { moTa: 'Để nguyên bản của Sola: phun nhẹ không tới lửa, lặp mãi', baiLam: bai(C_U3, [H('put_far', [], T_PUTFAR_LOI)]), phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Phun mạnh một lần, bỏ vòng lặp: đám hai ngọn còn một ngọn', baiLam: bai(C_U3, [H('put_far', [], ['squirt("high")'])]), phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['Phun nhẹ bay tối đa hai ô; phun mạnh bay tới vật cản đầu tiên.', 'Đổi "low" thành "high".']
    }),

    man({
      chuong: 'trum-mua-2', so: 4, ten: 'Hàm clear_row(n)', yMoi: 'hàm có tham số gọi hàm của em: n lần forward(2) rồi put_out_left(); ba giếng cháy to nhỏ khác nhau',
      kieuBai: 'tham-so', mucTieu: 'dap-lua', mat: true, chinhCoDinh: true, taoHam: ['clear_row'], hamCuaEmCan: ['put_out_left', 'put_out', 'squirt', 'tr_left', 'tr_right', 'forward', 'move'],
      deBai: 'Ba giếng bên trái hành lang đang cháy, cách đều nhau hai ô, lửa to nhỏ khác nhau. Em chế clear_row(n): n lần đi hai ô rồi put_out_left(). ' +
        'Chương trình chính đã khóa: clear_row(3) rồi một bước tới cờ. Phải dập hết lửa.',
      veMaMau: 'Chương trình chính bị khóa. Tạo clear_row(n) có tham số n.',
      san: SAN_U4, batDau: { x: 1, y: 3, huong: 1 }, lua: LUA_U4,
      maMau: bai(C_U4),
      sao: { o: 23, nhip: 23 },
      loiGiai: { chinh: C_U4.slice(), hamCuaEmMoi: [H('clear_row', ['n'], T_ROW)] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: bai(C_U4), hamCuaEmMoi: [H('clear_row', ['n'], ['# n giếng, mỗi giếng cách hai ô'].concat(T_ROW))] },
      loiSai: [
        { moTa: 'Viết cứng range(2): giếng thứ ba còn cháy', baiLam: bai(C_U4), hamCuaEmMoi: [H('clear_row', ['n'], FOR(2, ['forward(2)', 'put_out_left()']))], phaiCoMa: ['con-lua'] },
        { moTa: 'Quên đi hai ô: xe đứng nguyên ở đầu hành lang', baiLam: bai(C_U4), hamCuaEmMoi: [H('clear_row', ['n'], FOR('n', ['put_out_left()']))], phaiCoMa: ['con-lua'] }
      ],
      goiY: ['Tham số n là số giếng.', 'for i in range(n): forward(2), put_out_left().']
    }),

    man({
      chuong: 'trum-mua-2', so: 5, ten: 'Hàm box_spray() cho đội', yMoi: 'hàm của em cho đội: thùng không nóng nên chờ bằng distance() < 2 rồi phun mạnh; R1 dập lửa ở trạm đầu bằng put_out() trước khi đi',
      kieuBai: 'doi-ban', taoHam: ['box_spray'], hamCuaEmCan: ['put_out', 'clear_squirt', 'wait_clear', 'step_clear', 'squirt', 'tr_left', 'tr_right', 'forward', 'move'],
      deBai: 'Thùng của R2 (xe đẩy) đang nằm trong giếng đầu; một lúc sau R2 mới đẩy nó đi dọc hành lang trên. R1 (bệ vòi) ở mỗi trạm quay lên phun mạnh van cuối giếng: thùng hay bạn còn trong giếng thì tia nước bị chắn. ' +
        'Thùng không nóng nên warm() không thấy nó. Em chế box_spray(): còn thấy gì cách dưới hai ô (distance() < 2) thì chờ, rồi phun mạnh. ' +
        'Trạm đầu đang cháy: R1 gọi put_out() của em trước khi đi. Hai chương trình đã khóa.',
      veMaMau: 'Hai chương trình bị khóa. Tạo box_spray() ba dòng.',
      san: SAN_U5, noi: [noi(2, 0, [[3, 3]]), noi(5, 0, [[6, 3]])], bd: [{ x: 1, y: 3, huong: 1 }, { x: 1, y: 1, huong: 1 }], co: [[o(7, 3)], [o(6, 1)]], lua: [lua(2, 3, 1)],
      chinh: [R1_U5, R2_U5],
      hamEm: [H('box_spray', [], T_BOXS)],
      sao: { o: 28, nhip: 19 },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', hamEm: [H('box_spray', [], ['# thùng hay bạn còn trong giếng thì chờ'].concat(T_BOXS))] },
      loiSai: [
        { moTa: 'Dùng clear_squirt("high") (chờ bằng warm): thùng không nóng, tia nước trúng thùng', hamEm: [H('box_spray', [], ['clear_squirt("high")'])], phaiCoMa: ['ban-bi-chan', 'dam-tuong'] },
        { moTa: 'Phun ngay: tia nước trúng thùng trong giếng đầu', hamEm: [H('box_spray', [], ['squirt("high")'])], phaiCoMa: ['ban-bi-chan', 'dam-tuong'] },
        { moTa: 'Chờ khi distance() == 0: trong giếng cách một ô nên không chờ, tia nước trúng thùng', hamEm: [H('box_spray', [], WHILE('distance() == 0', ['wait()']).concat(['squirt("high")']))], phaiCoMa: ['ban-bi-chan', 'dam-tuong'] }
      ],
      goiY: ['Giếng trống thì distance() là 2 (tới van); có thùng hay bạn thì là 1.', 'while distance() < 2: wait(), rồi squirt("high").']
    }),

    man({
      chuong: 'trum-mua-2', so: 6, ten: 'Hàm gate_push()', yMoi: 'hàm gọi hàm: go_spray() (tới sát thùng, phun van mở cửa) rồi push(2); hai làn gấp khúc, thùng xa gần khác nhau; put_out() dập lửa trước thùng',
      kieuBai: 'cam-bien-xa', mucTieu: 'day-thung', mat: true, chinhCoDinh: true, taoHam: ['gate_push'], hamCuaEmCan: ['put_out', 'go_spray', 'go_to_wall', 'spray_left', 'push', 'squirt', 'tr_left', 'tr_right', 'forward', 'move'],
      deBai: 'Hai làn gấp khúc. Trên mỗi làn: thùng xa gần khác nhau, sau thùng là cánh cửa đóng rồi ô đích; van mở cửa ở xa bên trái xe khi xe đứng sát thùng, phía sau lưng là hốc. ' +
        'Giữa xe và thùng đầu có một đám cháy: chương trình chính gọi put_out() của em trước. Em chế gate_push(): go_spray() của gói Bệ vòi (go_to_wall() tới sát thùng, ' +
        'spray_left() mở cửa) rồi push(2). Chương trình chính đã khóa: put_out(), gate_push(), quay phải, gate_push().',
      veMaMau: 'Chương trình chính bị khóa. Tạo gate_push() hai dòng.',
      san: SAN_U6, batDau: { x: 1, y: 2, huong: 1 }, noi: [noi(2, 0, [[4, 2]]), noi(7, 4, [[4, 6]])], lua: [lua(2, 2, 2)],
      maMau: bai(C_U6),
      sao: { o: 29, nhip: 21 },
      loiGiai: { chinh: C_U6.slice(), hamCuaEmMoi: [H('gate_push', [], T_GATE)] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: bai(C_U6), hamCuaEmMoi: [H('gate_push', [], ['# tới sát thùng, mở cửa, đẩy qua'].concat(T_GATE))] },
      congThucKhac: [{ moTa: 'Viết thẳng go_to_wall(), spray_left(), push(2)', baiLam: bai(C_U6), hamCuaEmMoi: [H('gate_push', [], ['go_to_wall()', 'spray_left()', 'push(2)'])] }],
      loiSai: [
        { moTa: 'Đi cứng một ô rồi phun: làn dưới thùng cách hai ô, phun trúng tường', baiLam: bai(C_U6), hamCuaEmMoi: [H('gate_push', [], ['move()', 'spray_left()', 'push(2)'])], phaiCoMa: ['chua-day-thung'] },
        { moTa: 'Đẩy trước rồi mới phun: thùng vướng cửa đóng', baiLam: bai(C_U6), hamCuaEmMoi: [H('gate_push', [], ['push(2)', 'spray_left()'])], phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['Thùng cũng là vật cản: go_to_wall() dừng sát thùng.', 'go_spray(), push(2).']
    }),

    man({
      chuong: 'trum-mua-2', so: 7, ten: 'Hàm fire_valve()', yMoi: 'hàm gọi hàm: dập lửa chắn trước van bằng put_out() rồi phun mạnh mở van; hai trạm, lửa to nhỏ khác nhau',
      kieuBai: 'doc-nhiet', mat: true, chinhCoDinh: true, taoHam: ['fire_valve'], hamCuaEmCan: ['put_out', 'squirt', 'tr_left', 'tr_right', 'forward', 'move'],
      deBai: 'Hai trạm, mỗi trạm có giếng bên trái: cuối giếng là van mở cánh cửa ngay phía trước, nhưng giữa giếng đang cháy, lửa chắn tia nước. ' +
        'Em chế fire_valve(): quay trái, put_out() dập lửa, phun mạnh mở van (van cách ba ô), quay lại. Chương trình chính đã khóa.',
      veMaMau: 'Chương trình chính bị khóa. Tạo fire_valve() bốn dòng.',
      san: SAN_U7, batDau: { x: 1, y: 3, huong: 1 }, noi: [noi(3, 0, [[4, 3]]), noi(6, 0, [[7, 3]])], lua: LUA_U7,
      maMau: bai(C_U7),
      sao: { o: 24, nhip: 20 },
      loiGiai: { chinh: C_U7.slice(), hamCuaEmMoi: [H('fire_valve', [], T_FV)] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: bai(C_U7), hamCuaEmMoi: [H('fire_valve', [], ['# dập lửa trước, mở van sau'].concat(T_FV))] },
      loiSai: [
        { moTa: 'Quên dập lửa: tia nước trúng lửa, van chưa mở', baiLam: bai(C_U7), hamCuaEmMoi: [H('fire_valve', [], ['tr_left()', 'squirt("high")', 'tr_right()'])], phaiCoMa: ['dam-tuong'] },
        { moTa: 'Phun nhẹ mở van: van cách ba ô, tia nước rơi giữa giếng', baiLam: bai(C_U7), hamCuaEmMoi: [H('fire_valve', [], ['tr_left()', 'put_out()', 'squirt("low")', 'tr_right()'])], phaiCoMa: ['ban-ngan', 'dam-tuong'] }
      ],
      goiY: ['Lửa chắn tia: dập trước, mở van sau.', 'tr_left(), put_out(), squirt("high"), tr_right().']
    }),

    man({
      chuong: 'trum-mua-2', so: 8, ten: 'Đố: phun thừa một lần', yMoi: 'tìm lỗi: lửa một ngọn mà phun hai lần; lần thừa bay qua chỗ lửa đã tắt, trúng van, cửa đóng lại',
      kieuBai: 'do', mucTieu: 'dap-lua', hamCuaEmCan: ['squirt', 'tr_left', 'tr_right', 'forward', 'move'],
      deBai: 'Sola phun mạnh hai lần vào đám cháy trong giếng cho chắc. Chạy thử: lửa tắt, nhưng cánh cửa trên hành lang lại đóng. Vì sao? Lửa chỉ có một ngọn: ' +
        'lần phun thứ hai bay qua chỗ lửa đã tắt, trúng van cuối giếng, van đóng cửa lại. Sửa cho lửa tắt mà cửa vẫn mở.',
      veMaMau: 'Chạy thử chương trình của Sola. Lần phun thứ hai trúng gì?',
      san: SAN_U8, batDau: { x: 1, y: 3, huong: 1 }, noi: [noi(3, 0, [[4, 3]])], lua: LUA_U8,
      maMau: bai(M_U8),
      sao: { o: 18, nhip: 10 },
      loiGiai: bai(L_U8),
      loiGiaiKhac: { moTa: 'Cùng cách sửa, thêm một dòng chú thích', baiLam: bai(['# một ngọn: phun một lần'].concat(L_U8)) },
      congThucKhac: [{ moTa: 'Phun nhẹ một lần (lửa sát xe)', baiLam: bai(['forward(2)', 'tr_left()', 'squirt("low")', 'tr_right()', 'forward(3)']) }],
      loiSai: [
        { moTa: 'Để nguyên hai lần phun của Sola: van đóng cửa lại', baiLam: bai(M_U8), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Bỏ hẳn lần phun: tới cờ mà lửa còn cháy', baiLam: bai(['forward(5)']), phaiCoMa: ['con-lua'] }
      ],
      goiY: ['Đếm ngọn lửa: một ngọn, một lần phun.', 'Bỏ một dòng squirt("high").']
    }),

    man({
      chuong: 'trum-mua-2', so: 9, ten: 'Hàm far_push()', yMoi: 'biến d = distance() dùng làm tham số: thùng cách d ô thì push(d); ba phía xa gần khác nhau; put_out() dập lửa trước thùng đầu',
      kieuBai: 'bien', mucTieu: 'day-thung', mat: true, chinhCoDinh: true, taoHam: ['far_push'], hamCuaEmCan: ['put_out', 'push', 'go_to_wall', 'tr_right', 'forward', 'move'],
      deBai: 'Đường rắn ba đoạn, mỗi đoạn một thùng. Thùng cách xe bao nhiêu ô thì ô đích cũng cách thùng bấy nhiêu. Em chế far_push(): đo d = distance() rồi push(d) của gói Đẩy thùng. ' +
        'Giữa xe và thùng đầu có một đám cháy: lửa còn thì distance() đo tới lửa. Chương trình chính đã khóa: put_out(), rồi far_push(), quay phải, far_push(), quay phải, far_push().',
      veMaMau: 'Chương trình chính bị khóa. Tạo far_push() hai dòng, có biến d.',
      san: SAN_U9, batDau: { x: 4, y: 4, huong: 0 }, lua: [lua(4, 3, 2)],
      maMau: bai(C_U9),
      sao: { o: 21, nhip: 14 },
      loiGiai: { chinh: C_U9.slice(), hamCuaEmMoi: [H('far_push', [], T_FAR)] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: bai(C_U9), hamCuaEmMoi: [H('far_push', [], ['# xa bao nhiêu, đẩy bấy nhiêu'].concat(T_FAR))] },
      congThucKhac: [{ moTa: 'Viết thẳng push(distance())', baiLam: bai(C_U9), hamCuaEmMoi: [H('far_push', [], ['push(distance())'])] }],
      loiSai: [
        { moTa: 'Đẩy cứng một ô: thùng bên phải cách hai ô, chưa tới ô đích', baiLam: bai(C_U9), hamCuaEmMoi: [H('far_push', [], ['push(1)'])], phaiCoMa: ['chua-day-thung'] },
        { moTa: 'Đo sau khi đã tới sát thùng: d luôn là 0, không đẩy', baiLam: bai(C_U9), hamCuaEmMoi: [H('far_push', [], ['go_to_wall()', 'd = distance()', 'push(d)'])], phaiCoMa: ['chua-day-thung'] }
      ],
      goiY: ['Đo trước khi đi: d = distance() ở đầu đoạn.', 'push(d) tới sát thùng rồi đẩy đúng d ô.']
    }),

    man({
      chuong: 'trum-mua-2', so: 10, ten: 'Trùm: Nhà máy chạy lại', yMoi: 'trùm cuối mùa 2: một chương trình cho hai dây chuyền, nối sáu hàm của em: put_out, go_spray, go_to_wall, sidestep, valve_left, push',
      hang: 'trum', kieuBai: 'trum', mat: true, mucTieu: 'day-thung',
      hamCuaEmCan: ['go_spray', 'go_to_wall', 'spray_left', 'sidestep', 'valve_left', 'valve_on', 'push', 'put_out', 'gate_push', 'squirt', 'tr_left', 'tr_right', 'forward', 'move'],
      huyHieu: { ma: 'nha-may-chay', ten: 'Huy hiệu Nhà máy chạy lại' },
      deBai: 'Dập đám cháy cuối cùng là nhà máy của Sola chạy lại trọn vẹn: hai dây chuyền, một chương trình. Đám cháy sát mũi xe lúc xuất phát to nhỏ khác nhau. Hành lang trên có trạm phun mở cửa, xa gần khác nhau, rồi hết ở tường. Né xuống làn dưới: ở đó van trên cao ' +
        'mở cửa sau thùng (một dây chuyền van đang mở, cửa mở sẵn), thùng xa gần khác nhau, ô đích sau cửa. Nối các hàm của em: put_out(), go_spray(), go_to_wall(), sidestep(), valve_left(), push(2).',
      veMaMau: 'Chương trình có sẵn đếm cứng ở làn dưới theo dây chuyền đầu: dây chuyền sau thùng ở xa hơn.',
      san: SAN_U10, batDau: [{ x: 1, y: 3, huong: 1 }, { x: 1, y: 3, huong: 1 }],
      noi: [[noi(2, 0, [[3, 3]]), noi(10, 0, [[13, 4]])], [noi(6, 0, [[7, 3]])]], lua: [[lua(2, 3, 1)], [lua(2, 3, 3)]],
      nutBat: [[], [o(8, 0)]],
      maMau: bai(['put_out()', 'go_spray()', 'go_to_wall()', 'sidestep()', 'valve_left()', 'forward(3)']),
      sao: { o: 37, nhip: 58 },
      loiGiai: bai(L_U10),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# mở cửa trên, né xuống, mở cửa dưới nếu cần, đẩy'].concat(L_U10)) },
      congThucKhac: [
        { moTa: 'Phun mọi van làn dưới bằng spray_left(): vẫn xong nhưng dây chuyền sau đóng van đang mở, phí một nhịp', baiLam: bai(['put_out()', 'go_spray()', 'go_to_wall()', 'sidestep()', 'spray_left()', 'push(2)']) },
        { moTa: 'Viết thẳng go_to_wall() rồi spray_left() thay cho go_spray()', baiLam: bai(['put_out()', 'go_to_wall()', 'spray_left()', 'go_to_wall()', 'sidestep()', 'valve_left()', 'push(2)']) }
      ],
      loiSai: [
        { moTa: 'Đếm cứng forward(3) ở làn dưới: dây chuyền sau thùng ở xa hơn, chưa tới ô đích', baiLam: bai(['put_out()', 'go_spray()', 'go_to_wall()', 'sidestep()', 'valve_left()', 'forward(3)']), phaiCoMa: ['chua-day-thung'] },
        { moTa: 'Quên valve_left(): dây chuyền đầu cửa sau thùng còn đóng', baiLam: bai(['put_out()', 'go_spray()', 'go_to_wall()', 'sidestep()', 'push(2)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Quên go_spray(): cửa hành lang trên còn đóng, go_to_wall() dừng ngay trước cửa', baiLam: bai(['put_out()', 'go_to_wall()', 'sidestep()', 'valve_left()', 'push(2)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Phun một lần thay put_out(): sân sau lửa ba ngọn còn cháy', baiLam: bai(['squirt("low")', 'go_spray()', 'go_to_wall()', 'sidestep()', 'valve_left()', 'push(2)']), phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['Dập lửa trước: put_out(). Hành lang trên: go_spray() mở cửa, go_to_wall() tới tường. Làn dưới: sidestep(), valve_left(), push(2).', 'Mỗi hàm lo một đoạn; nối đúng thứ tự.']
    })
  ];

  ManHoc.manTrumMua2 = DS;
  if (laNode) module.exports = ManHoc;
})();
