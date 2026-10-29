/* ============================================================================
   man-do-nhiet.js — "Robot Chấn Hưng": NGÂN HÀNG MÀN MỚI của mùa 2, gói 7 "Đo nhiệt" (KE-HOACH-MUA-2.md).
   Khung mùa 2 (lo-trinh-hoc.js, khối "MÙA 2 = 10 GÓI", mảng MUA_2) đã chừa chỗ: tệp đã có trong danh sách require của lo-trinh-hoc.js và
   thẻ <script> của game/choi.html. Gói sau CHỈ việc thêm màn vào mảng DS dưới đây; màn tự hiện đúng chương, đúng gói.
     - `do-nhiet` (mã do-nhiet.1 … do-nhiet.10): chương 1: warm() (robot, nút đang bật)
     - `che-do-nhiet` (mã che-do-nhiet.1 … che-do-nhiet.10): chương 2 "Hàm đo nhiệt"
   Mỗi màn khai `chuong` (một trong các mã trên) và `so` (1, 2, …: thứ tự trong phần màn mới của chương); mã `ma` = chuong + '.' + so là khóa lưu sao,
   KHÔNG đổi sau khi xuất bản. Gọi ManHoc.chuanHoa(m) như các tệp màn khác. Chương còn trống thì chưa hiện; gói chưa có chương nào có màn thì chưa hiện.
   Ràng buộc mùa 2 (hoc/kiem-lo-trinh.mjs): robot chỉ dùng part mùa 1 + xích + súng hơi (+ hồng ngoại khi lõi có); không bậc thang S, hố u, gầm n;
   biến chỉ từ gói 1 chương 2, hàm có tham số chỉ từ gói 2 chương 2 (tham-so); hàm của em cần phải được tạo ở màn đứng trước.
   Tệp này KHÔNG tự thêm màn vào ManHoc: danh sách nằm ở ManHoc.manDoNhiet, lo-trinh-hoc.js thêm vào chương rồi xếp chỗ (so, hang do dungChuong đặt).

   NỘI DUNG (27/10): XE HAI BÁNH gắn SÚNG HƠI + MẮT HỒNG NGOẠI có NÂNG CẤP ĐO NHIỆT (robot { than: 'hai-banh', tay: 'hoi', camBien: [hong-ngoai] }, khay có distance + warm), mọi màn lucBan.
   warm() = True khi vật cản đầu tiên trên tia phía trước NÓNG: nút bắn ĐANG BẬT (quầng đỏ). Hồng ngoại chỉ đo xa gần rồi nhiệt, KHÔNG nhận dạng vật: nút tắt, cửa, thùng, tường
   đều "không nóng" như nhau, distance() của chúng cũng như nhau (luật ở san-hoc.js, mục HỒNG NGOẠI). Robot khác cũng nóng nhưng để gói 8 Đội.
   NÚT BẬT SẴN (cfg.nutBat, san-hoc.js mục SÚNG BÓNG): nút nóng từ đầu màn, KHÔNG nối cửa / băng (lõi cấm), nên mọi sân có cửa đều khai noi cho các nút tắt.
   Bắn nút là ĐỔI trạng thái: bắn nút đang bật thì tắt nó; bắn lại nút mình vừa bật thì cửa của nó đóng lại (bẫy của Sola).
   Chương do-nhiet: đọc nóng / không nóng rồi quyết (if not warm(), while not warm(), kết hợp distance() và lực bắn). Chương che-do-nhiet: chế hàm đọc warm() (switch_on, find_warm…),
   chương trình chính KHÓA và gọi hàm ở nhiều chỗ, nên thân hàm cố định không thắng được. MỘT SÂN mỗi màn, nhiều sân chỉ ở trùm.
   Màn mở: sân có nhiều chỗ quyết định không đều (nút nóng / tắt xen nhau), nên một vòng lặp đọc warm() ngắn hơn viết cứng theo quầng đỏ nhìn thấy.
   kiem-do-nhiet.mjs + do-duong-do-nhiet.mjs kiểm: không lời cố định nào (không đọc cảm biến) được 3 sao. Không beSung (gói 9), không nhiều robot (gói 8).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var HAM_GOC = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'spray', 'spray_back', 'distance', 'warm'];

  /** Thụt mọi dòng vào một bậc (4 dấu cách). */
  function thut(ds) { return ds.map(function (s) { return '    ' + s; }); }
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  function FOR(n, than, bien) { return ['for ' + (bien || 'i') + ' in range(' + n + '):'].concat(thut(than)); }
  function WHILE(dk, than) { return ['while ' + dk + ':'].concat(thut(than)); }
  function IF(dk, co, khong) { return ['if ' + dk + ':'].concat(thut(co), khong ? ['else:'].concat(thut(khong)) : []); }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function bai(chinh, hamCuaMan) { return { chinh: chinh.slice(), hamCuaMan: (hamCuaMan || []).slice() }; }
  function o(x, y) { return { x: x, y: y }; }
  /** Nhóm nối: nút (x, y) mở các cửa [[x, y], …]. */
  function noi(x, y, cua) { return { nut: o(x, y), cua: cua.map(function (c) { return o(c[0], c[1]); }) }; }

  /** Điền trường chung: xe hai bánh, súng hơi, mắt hồng ngoại có đo nhiệt; mọi màn chọn được lực bắn. */
  function man(m) {
    m.cauTruc = ['for', 'if', 'while'];
    m.loaiRobot = 'banh';
    m.robot = { than: 'hai-banh', tay: 'hoi', camBien: [{ ma: 'hong-ngoai', o: 'tren' }] };
    m.hamGoc = HAM_GOC;
    m.lucBan = true;
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    if (!m.mucTieu) m.mucTieu = 'toi-co';
    if (Array.isArray(m.san[0])) m.nhipTheo = 'tong';
    return ManHoc.chuanHoa(m);
  }

  // khối hay dùng
  var BAT = IF('not warm()', ['squirt("low")']);                         // nút chưa nóng thì bắn nhanh cho bật
  var TIM = nhieu(['turn_right()'], WHILE('not warm()', ['turn_right()']));   // quay khỏi nút vừa tới rồi quay tới khi thấy nút nóng

  /* ------------------------------------------------------------------- sân */

  // do-nhiet.1: đường xoắn rẽ phải. Xe (1,2) quay lên, sát nút (1,1) TẮT, nút đó mở cửa (2,2). Khúc 2 tới sát nút (4,2) ĐANG BẬT. Khúc 3 xuống tới sát nút (3,5) TẮT,
  //   nút đó mở cửa (2,4). Khúc 4 sang trái qua cửa tới cờ (1,4).
  var SAN_D1 = ['######', '##N###', '##.CN#', '###.##', '#F#.##', 'N.C.##', '###N##', '######'];
  // do-nhiet.2: bốn nút đều ĐANG BẬT, làm đèn chỉ đường. Xe (2,1) quay lên. Mỗi ngã: quay khỏi nút vừa tới, quay tiếp tới khi thấy nút nóng, đi tới sát nó.
  //   Ngã (4,3) phải quay ba lần (bên trái là tường, phía sau là đường cũ). Cờ (5,4) nằm trước nút cuối (5,5).
  var SAN_D2 = ['########', '##...N##', '####.###', '####..N#', '####NF##', '#####N##', '########'];

  // do-nhiet.3: đường bậc thang lên phải, như do-nhiet.2, nhưng ở ngã có vật cản khác cách xe như nút nóng: cửa đóng không ai mở (2,7), thùng (4,6), nút TẮT (1,4), tường.
  //   Xe (1,5) quay lên. Đèn nóng: (3,5), (2,3), (5,4), (4,1); cờ (4,2) nằm trước đèn cuối. Ngã (2,5) và (4,4) phải quay ba lần.
  var SAN_D3 = ['#######', '####N##', '####F##', '##N#.##', '#N...N#', '#..N.##', '##.#H##', '##C####', '#######'];
  // do-nhiet.4: hành lang (1..6, 2) đi sang phải, năm nút trên tường (1..5, 1). Nút TẮT (1,1), (3,1), (4,1) mở cửa ngay sau nó (2,2), (4,2), (5,2); (2,1), (5,1) ĐANG BẬT. Cờ (6,2).
  var SAN_D4 = ['########', '#NNNNN##', '#.C.CCF#', '########'];
  // do-nhiet.5: như do-nhiet.4 nhưng nút xa gần khác nhau và dưới hành lang có hai hốc (2,4), (3,4). Nút (1,0) TẮT cách 2 ô: bắn tụ, xe giật xuống tường nên đứng yên;
  //   (2,0) ĐANG BẬT cách 2 ô, dưới là hốc: bắn tụ thì xe giật xuống hốc; (3,2) TẮT sát mũi, dưới là hốc: phải bắn nhanh; (4,2) TẮT sát mũi; (5,2) ĐANG BẬT. Cửa (2,3), (4,3), (5,3).
  var SAN_D5 = ['########', '#NN#####', '#..#####', '#..NNN##', '#.C.CCF#', '##..####', '########'];
  // do-nhiet.6: hành lang (1..6, 2), nút ở CẢ HAI bên: trên (1..4, 1), dưới (1..4, 3). Nút TẮT (1,1) mở cửa (2,2), (2,3) mở cửa (3,2), (4,3) mở cửa (5,2); các nút khác ĐANG BẬT. Cờ (6,2).
  var SAN_D6 = ['########', '#NNNN###', '#.CC.CF#', '#NNNN###', '########'];
  // do-nhiet.7: đi rồi về. Lượt đi (2..5, 1) sang phải, lượt về (5..1, 3) sang trái; ba nút (2..4, 2) nằm trên bức tường GIỮA, lượt nào cũng ở bên phải xe.
  //   (2,2) ĐANG BẬT; (3,2) TẮT mở cửa (2,3); (4,2) TẮT mở cửa (3,3). Lượt về, hai nút mình đã bật cũng nóng: bắn lại thì cửa đóng.
  var SAN_D7 = ['#######', '##....#', '##NNN.#', '#FCC..#', '#######'];
  // do-nhiet.8: hành lang (1..5, 2) sang phải, nút ở bên phải (phía dưới), xa gần khác nhau; phía trên có hai hốc (2,1), (3,1). (1,5) TẮT cách 2 ô mở cửa (2,2);
  //   (2,5) ĐANG BẬT cách 2 ô, trên là hốc; (3,3) TẮT sát mũi mở cửa (4,2); (4,3) ĐANG BẬT. Xe mờ (5,2) quay phải.
  var SAN_D8 = ['#######', '##..###', '#.C.C.#', '#..NN##', '#..####', '#NN####', '#######'];
  // do-nhiet.9: hành lang (1..5, 2), bốn nút phía trên. (1,1) TẮT nối hai ô băng chuyền chạy ngược (2,2), (3,2): bắn thì băng dừng; (3,1) TẮT mở cửa (4,2); (2,1), (4,1) ĐANG BẬT.
  var SAN_D9 = ['#######', '#NNNN##', '#.<<CF#', '#######'];
  // do-nhiet.10: ba mê cung đèn nóng, mỗi sân bốn ngã: sân 1 của do-nhiet.2, sân 2 của do-nhiet.3 (có cửa, thùng, nút tắt làm mồi), sân 3 là đường xoắn của do-nhiet.1
  //   với cửa đã mở, bốn đèn nóng (4,2), (3,6), (0,5), (1,3) và nút TẮT (2,1) làm mồi.
  var SAN_D10 = [SAN_D2, SAN_D3, ['######', '##N###', '##..N#', '#N#.##', '#F#.##', 'N...##', '###N##', '######']];

  // che-do-nhiet.1: hành lang (1..5, 2), bốn nút phía trên: (1,1), (3,1) TẮT mở cửa (2,2), (4,2); (2,1), (4,1) ĐANG BẬT. Cờ (5,2).
  var SAN_C1 = ['#######', '#NNNN##', '#.C.CF#', '#######'];
  // che-do-nhiet.2: hành lang (1..6, 2), năm nút phía trên: (2,1), (3,1) TẮT mở cửa (3,2), (4,2); (1,1), (4,1), (5,1) ĐANG BẬT. Cờ (6,2).
  var SAN_C2 = ['########', '#NNNNN##', '#..CC.F#', '########'];
  // che-do-nhiet.4: mê cung của do-nhiet.3 lật trái phải: ngã nào cần quay một lần thì nay quay ba lần và ngược lại. Xe (5,5) quay lên.
  var SAN_C4 = ['#######', '##N####', '##F####', '##.#N##', '#N...N#', '##.N..#', '##H#.##', '####C##', '#######'];
  // che-do-nhiet.5: do-nhiet.5 lật trên dưới: hành lang (1..6, 2), nút ở bên phải (phía dưới), hai hốc phía trên (2,1), (3,1).
  var SAN_C5 = ['########', '##..####', '#.C.CCF#', '#..NNN##', '#..#####', '#NN#####', '########'];
  // che-do-nhiet.6: hành lang gấp khúc. Đoạn đầu (1..4, 4) sang phải, nút (1..3, 3) phía trên; đoạn sau (4, 3..1) đi lên, nút (3,3), (3,2) bên trái.
  //   Nút góc (3,3) được đo hai lần: TẮT, mở cửa (4,4) và (4,2); (1,3) TẮT mở cửa (2,4); (2,3), (3,2) ĐANG BẬT. Cờ (4,1).
  var SAN_C6 = ['######', '####F#', '###NC#', '#NNN.#', '#.C.C#', '######'];
  // che-do-nhiet.8: sân thứ hai của trùm hành lang cũ: hành lang (1..6, 4), nút xa hàng 1, nút sát mũi hàng 3, hốc (1,5), (3,5).
  //   (1,3) ĐANG BẬT, dưới là hốc; (2,1) TẮT cách 2 ô mở cửa (3,4); (3,1) ĐANG BẬT cách 2 ô, dưới là hốc; (4,3) TẮT mở cửa (5,4); (5,3) ĐANG BẬT. Xe mờ (6,4) quay phải.
  var SAN_C8 = ['########', '##NN####', '##..####', '#N..NN##', '#..C.C.#', '#.#.####', '########'];
  // che-do-nhiet.10: ba sân, hành lang ba nút rồi ngã rẽ. Sân 1: rẽ xuống (đèn (4,5)); sân 2: rẽ lên, phải quay ba lần (đèn (4,1)); sân 3: rẽ xuống xa hơn, thùng (5,2) chắn phía trước.
  var SAN_C10 = [
    ['#######', '#NNN###', '#.C.C##', '####.##', '####F##', '####N##', '#######'],
    ['#######', '####N##', '####F##', '#NNN.##', '#..CC##', '#######'],
    ['#######', '#NNN###', '#.CC.H#', '####.##', '####.##', '####F##', '####N##', '#######']
  ];

  /* ------------------------------------------------------------- chương trình */

  var L_D1 = FOR(4, nhieu(BAT, ['turn_right()', 'go_to_wall()']));
  var L_D2 = FOR(4, nhieu(TIM, ['go_to_wall()']));
  var L_D4 = FOR(5, nhieu(['turn_left()'], BAT, ['turn_right()', 'move()']));
  var C_D5 = FOR(5, ['turn_left()', 'check_hot()', 'turn_right()', 'move()']);
  var T_D5 = IF('not warm()', ['auto_spray()']);
  var C_D6 = FOR(4, ['turn_left()', 'check_side()', 'u_turn()', 'check_side()', 'turn_left()', 'move()']).concat(['move()']);
  var C_D7 = nhieu(FOR(3, ['check_right()', 'move()']), ['turn_right()', 'forward(2)', 'turn_right()'], FOR(3, ['move()', 'check_right()']), ['move()']);
  var T_D7 = nhieu(['turn_right()'], BAT, ['turn_left()']);
  var C_D8 = FOR(4, ['turn_right()', 'scan_hot()', 'turn_left()', 'move()']);
  var C_D9 = FOR(4, ['turn_left()', 'check_belt()', 'turn_right()', 'move()']);
  var C_C1 = FOR(4, ['turn_left()', 'switch_on()', 'turn_right()', 'move()']);
  var C_C2 = FOR(5, ['switch_left()', 'move()']);
  var T_SL = ['turn_left()', 'switch_on()', 'turn_right()'];
  var C_C3 = FOR(4, ['light()', 'turn_right()', 'go_to_wall()']);
  var C_C4 = FOR(4, ['find_warm()', 'go_to_wall()']);
  var C_C5 = FOR(5, ['turn_right()', 'auto_on()', 'turn_left()', 'move()']);
  var C_C6 = ['scan_on(3)', 'turn_left()', 'move()', 'scan_on(2)'];
  var C_C7 = nhieu(FOR(3, ['switch_right()', 'move()']), ['turn_right()', 'forward(2)', 'turn_right()'], FOR(3, ['move()', 'switch_right()']), ['move()']);
  var T_SR = ['turn_right()', 'switch_on()', 'turn_left()'];
  var C_C8 = FOR(5, ['auto_left_on()', 'move()']);
  var T_AL = ['turn_left()', 'auto_on()', 'turn_right()'];
  var C_C9 = FOR(4, ['find_hot()', 'go_to_wall()']);
  var L_C10 = FOR(3, ['switch_left()', 'move()']).concat(['find_warm()', 'go_to_wall()']);

  var DS = [
    /* ================================================================ chương do-nhiet: đọc nóng / không nóng rồi quyết */
    man({
      chuong: 'do-nhiet', so: 1, ten: 'Van nào đang nóng', yMoi: 'warm(): vật cản phía trước nóng (van đang mở) thì True; if not warm(): bắn',
      hamCuaEmCan: ['squirt', 'turn_right', 'turn_left', 'go_to_wall', 'move'],
      deBai: 'Mắt hồng ngoại vừa được nâng cấp ĐO NHIỆT: warm() là True khi vật cản trước mũi xe đang nóng. Van hơi đang mở thì nóng (có quầng đỏ), van đóng thì không. ' +
        'Đường xoắn có ba khúc quanh, cuối mỗi khúc là một van; van đóng nào cũng mở cánh cửa của khúc sau. Ở mỗi khúc quanh: van chưa nóng thì bắn nhanh cho nó mở, rồi rẽ phải và đi tới sát tường. ' +
        'Bắn van đang mở là đóng nó, phí một nhịp.',
      veMaMau: 'Chương trình có sẵn chỉ rẽ và đi. Thêm if not warm(): squirt("low") vào đầu vòng lặp.',
      san: SAN_D1, batDau: { x: 2, y: 2, huong: 0 }, noi: [noi(2, 1, [[3, 2]]), noi(3, 6, [[2, 5]])], nutBat: [o(4, 2), o(0, 5)],
      maMau: bai(FOR(4, ['turn_right()', 'go_to_wall()'])),
      sao: { o: 14, nhip: 13 },
      loiGiai: bai(L_D1),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# van chưa nóng thì bắn cho mở'].concat(L_D1)) },
      congThucKhac: [{ moTa: 'Bắn mọi van không cần đo: vẫn tới cờ nhưng đóng mất van đang mở, phí một nhịp', baiLam: bai(FOR(4, ['squirt("low")', 'turn_right()', 'go_to_wall()'])) }],
      loiSai: [
        { moTa: 'Viết if warm(): bắn van đang mở, bỏ qua van đóng, cửa vẫn đóng', baiLam: bai(FOR(4, nhieu(IF('warm()', ['squirt("low")']), ['turn_right()', 'go_to_wall()']))), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Bắn tụ squirt("high"): ở khúc quanh thứ ba cú giật đẩy xe lùi khỏi chỗ rẽ', baiLam: bai(FOR(4, nhieu(IF('not warm()', ['squirt("high")']), ['turn_right()', 'go_to_wall()']))), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Rẽ trái thay vì rẽ phải: xe đi vào ngõ cụt', baiLam: bai(FOR(4, nhieu(BAT, ['turn_left()', 'go_to_wall()']))), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['warm() chỉ trả lời có nóng hay không, như front_clear() trả lời có trống hay không.',
        'Trong vòng lặp: if not warm(): squirt("low"), rồi turn_right() và go_to_wall().']
    }),

    man({
      chuong: 'do-nhiet', so: 2, ten: 'Đèn nóng chỉ đường', yMoi: 'while not warm(): quay tới khi mắt hồng ngoại thấy van nóng',
      hamCuaEmCan: ['turn_right', 'go_to_wall', 'move'],
      deBai: 'Bốn van đang mở làm đèn chỉ đường: ở mỗi ngã, đường đi tiếp là hướng có van nóng ở cuối. Mỗi ngã, quay khỏi van vừa tới, rồi quay tiếp cho tới khi warm() là True, ' +
        'rồi go_to_wall(). Làm bốn lần thì tới cờ.',
      veMaMau: 'Chương trình có sẵn ngã nào cũng chỉ quay phải một lần. Thêm vòng while not warm(): turn_right().',
      san: SAN_D2, batDau: { x: 2, y: 1, huong: 0 }, nutBat: [o(5, 1), o(4, 4), o(6, 3), o(5, 5)],
      maMau: bai(FOR(4, ['turn_right()', 'go_to_wall()'])),
      sao: { o: 12, nhip: 12 },
      loiGiai: bai(L_D2),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# ngã nào cũng tìm van nóng'].concat(L_D2)) },
      loiSai: [
        { moTa: 'Quên quay khỏi van vừa tới: xe đang nhìn đúng một van nóng nên đứng yên', baiLam: bai(FOR(4, nhieu(WHILE('not warm()', ['turn_right()']), ['go_to_wall()']))), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Viết while warm(): xe quay khỏi van nóng thì dừng ngay, đi sai hướng', baiLam: bai(FOR(4, nhieu(['turn_right()'], WHILE('warm()', ['turn_right()']), ['go_to_wall()']))), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['while not warm(): turn_right() quay cho tới khi phía trước là một van nóng.',
        'Tới sát van rồi thì xe đang nhìn chính van đó: quay phải một lần trước khi tìm tiếp.']
    }),

    man({
      chuong: 'do-nhiet', so: 3, ten: 'Cửa, thùng hay đèn', yMoi: 'distance() không phân biệt được: cửa, thùng, van đóng, van nóng cùng cách 1 ô, chỉ warm() khác',
      hamCuaEmCan: ['turn_right', 'go_to_wall', 'move'],
      deBai: 'Lại đi theo đèn nóng, nhưng ở các ngã có thêm cửa đóng, thùng nặng và van đóng, cùng cách xe một ô như van nóng. Mắt hồng ngoại chỉ đo xa gần và đo nhiệt, không biết vật cản là gì: ' +
        'distance() của chúng như nhau, chỉ warm() khác. Đi bốn ngã tới cờ.',
      veMaMau: 'Bản của Sola tìm đường bằng distance(): gặp vật cản không sát mũi là đi. Ở ngã thứ hai, cửa đóng cũng cách 1 ô: Sola đi nhầm. Đổi điều kiện sang warm().',
      san: SAN_D3, batDau: { x: 1, y: 5, huong: 0 }, noi: [], nutBat: [o(3, 5), o(2, 3), o(5, 4), o(4, 1)],
      maMau: bai(FOR(4, nhieu(['turn_right()'], WHILE('distance() == 0', ['turn_right()']), ['go_to_wall()']))),
      sao: { o: 12, nhip: 14 },
      loiGiai: bai(L_D2),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# chỉ van đang mở mới nóng'].concat(L_D2)) },
      loiSai: [
        { moTa: 'Để nguyên bản của Sola: cửa đóng cũng cách 1 ô nên xe đi nhầm về phía cửa', baiLam: bai(FOR(4, nhieu(['turn_right()'], WHILE('distance() == 0', ['turn_right()']), ['go_to_wall()']))), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Bỏ dòng quay đầu tiên: tới ngã thứ hai xe đang nhìn đúng van nóng vừa tới nên đứng yên', baiLam: bai(FOR(4, nhieu(WHILE('not warm()', ['turn_right()']), ['go_to_wall()']))), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Cửa đóng, thùng, van đóng hay van nóng đều là vật cản: distance() chỉ cho biết cách mấy ô.',
        'Chương trình của màn trước dùng lại được nguyên vẹn.']
    }),

    man({
      chuong: 'do-nhiet', so: 4, ten: 'Hành lang năm van', yMoi: 'vòng lặp đi dọc hành lang: quay trái đo, van đóng thì bắn, quay lại rồi tiến',
      hamCuaEmCan: ['squirt', 'turn_left', 'turn_right', 'move'],
      deBai: 'Năm van nằm trên tường phía trên hành lang, ngay bên trái xe. Van đóng nào cũng mở cánh cửa ngay trước nó; van đang mở thì cửa trước nó đã mở sẵn. ' +
        'Ở mỗi ô: quay trái đo nhiệt, van chưa nóng thì bắn nhanh, quay lại rồi tiến một ô. Đi tới cờ.',
      veMaMau: 'Chương trình có sẵn quay trái, quay lại rồi tiến, chưa bắn gì. Thêm if not warm(): squirt("low").',
      san: SAN_D4, batDau: { x: 1, y: 2, huong: 1 }, noi: [noi(1, 1, [[2, 2]]), noi(3, 1, [[4, 2]]), noi(4, 1, [[5, 2]])], nutBat: [o(2, 1), o(5, 1)],
      maMau: bai(FOR(5, ['turn_left()', 'turn_right()', 'move()'])),
      sao: { o: 15, nhip: 18 },
      loiGiai: bai(L_D4),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# van đóng thì bắn, van nóng để yên'].concat(L_D4)) },
      loiSai: [
        { moTa: 'Quên quay lại: xe tiến thẳng vào tường phía trên', baiLam: bai(FOR(5, nhieu(['turn_left()'], BAT, ['move()']))), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Viết if warm(): đóng hai van đang mở, ba van đóng vẫn đóng', baiLam: bai(FOR(5, nhieu(['turn_left()'], IF('warm()', ['squirt("low")']), ['turn_right()', 'move()']))), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Mắt hồng ngoại ở mũi xe: muốn đo van phía trên thì phải quay mặt về phía van.',
        'Thân vòng lặp: turn_left(), if not warm(): squirt("low"), turn_right(), move().']
    }),

    man({
      chuong: 'do-nhiet', so: 5, ten: 'Xa gần và nóng lạnh', yMoi: 'kết hợp: warm() chọn có bắn không, auto_spray() (distance()) chọn lực',
      hamCuaEmCan: ['auto_spray', 'squirt', 'turn_left', 'turn_right', 'move'], chinhCoDinh: true,
      deBai: 'Hành lang như màn trước, nhưng các van xa gần khác nhau, và dưới hành lang có hai hốc. Nhớ gói Lực bắn: bắn tụ thì xe giật lùi, sau lưng là tường thì đứng yên, là hốc thì rơi xuống hốc. ' +
        'Chương trình chính đã khóa: ở mỗi ô quay trái, gọi check_hot(), quay lại, tiến. Viết thân check_hot(): warm() cho biết có cần bắn không, auto_spray() của em chọn lực theo distance().',
      veMaMau: 'Chương trình chính bị khóa. check_hot() có sẵn bắn nhanh mọi van: van đầu cách 2 ô, tia nước rơi giữa đường.',
      san: SAN_D5, batDau: { x: 1, y: 4, huong: 1 }, noi: [noi(1, 1, [[2, 4]]), noi(3, 3, [[4, 4]]), noi(4, 3, [[5, 4]])], nutBat: [o(2, 1), o(5, 3)],
      maMau: bai(C_D5, [H('check_hot', [], ['squirt("low")'])]),
      sao: { o: 20, nhip: 18 },
      loiGiai: bai(C_D5, [H('check_hot', [], T_D5)]),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(C_D5, [H('check_hot', [], ['# warm() chọn có bắn không, auto_spray() chọn lực'].concat(T_D5))]) },
      congThucKhac: [{ moTa: 'Viết thẳng if / else theo distance() thay cho auto_spray()', baiLam: bai(C_D5, [H('check_hot', [], IF('not warm()', IF('distance() > 1', ['squirt("high")'], ['squirt("low")'])))]) }],
      loiSai: [
        { moTa: 'Để nguyên bắn nhanh: van đầu cách 2 ô, tia nước rơi giữa đường', baiLam: bai(C_D5, [H('check_hot', [], ['squirt("low")'])]), phaiCoMa: ['ban-ngan', 'chua-toi-co'] },
        { moTa: 'Bỏ warm(), van nào cũng auto_spray(): van nóng thứ hai cách 2 ô, bắn tụ, xe giật xuống hốc', baiLam: bai(C_D5, [H('check_hot', [], ['auto_spray()'])]), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Luôn bắn tụ: van thứ ba sát mũi, xe giật xuống hốc', baiLam: bai(C_D5, [H('check_hot', [], IF('not warm()', ['squirt("high")']))]), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['auto_spray() đo distance(): từ 2 ô trống trở lên thì bắn tụ, gần hơn thì bắn nhanh.',
        'Thân check_hot(): if not warm(): rồi thụt vào auto_spray().']
    }),

    /* ------------------------------------------------ hàng 2 tiếp: luyện */
    man({
      chuong: 'do-nhiet', so: 6, ten: 'Van hai bên đường', yMoi: 'đo cả hai bên: gọi cùng một thân hàm sau turn_left() và sau u_turn()',
      hamCuaEmCan: ['squirt', 'turn_left', 'u_turn', 'move'], chinhCoDinh: true,
      deBai: 'Hành lang có van ở cả hai bên. Ở mỗi ô, chỉ một van đóng (hay không van nào) mở cánh cửa phía trước; các van khác đang mở. Chương trình chính đã khóa: ' +
        'quay trái, check_side(), quay đầu, check_side(), quay trái, tiến. Viết thân check_side(): van chưa nóng thì bắn nhanh.',
      veMaMau: 'Chương trình chính bị khóa. check_side() có sẵn chưa làm gì. Viết thân của nó.',
      san: SAN_D6, batDau: { x: 1, y: 2, huong: 1 }, noi: [noi(1, 1, [[2, 2]]), noi(2, 3, [[3, 2]]), noi(4, 3, [[5, 2]])], nutBat: [o(2, 1), o(3, 1), o(4, 1), o(1, 3), o(3, 3)],
      maMau: bai(C_D6, [H('check_side', [], ['pass'])]),
      sao: { o: 20, nhip: 20 },
      loiGiai: bai(C_D6, [H('check_side', [], BAT)]),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(C_D6, [H('check_side', [], ['# van chưa nóng thì bắn cho mở'].concat(BAT))]) },
      congThucKhac: [{ moTa: 'Bắn mọi van không cần đo: vẫn tới cờ nhưng đóng năm van đang mở, phí năm nhịp', baiLam: bai(C_D6, [H('check_side', [], ['squirt("low")'])]) }],
      loiSai: [
        { moTa: 'Viết if warm(): chỉ đóng van đang mở, ba van đóng vẫn đóng', baiLam: bai(C_D6, [H('check_side', [], IF('warm()', ['squirt("low")']))]), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Để thân trống: không van nào được mở, cửa đầu tiên vẫn đóng', baiLam: bai(C_D6, [H('check_side', [], ['pass'])]), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Cùng một thân hàm chạy tám lần, mỗi lần mắt hồng ngoại nhìn một van khác.',
        'Thân check_side(): if not warm(): squirt("low").']
    }),

    /* ------------------------------------------------ hàng 3: biến thể */
    man({
      chuong: 'do-nhiet', so: 7, ten: 'Đi rồi về qua van cũ', yMoi: 'van mình vừa mở cũng nóng: lượt về warm() là True, bắn lại thì cửa đóng',
      hamCuaEmCan: ['squirt', 'turn_left', 'turn_right', 'forward', 'move'], chinhCoDinh: true,
      deBai: 'Ba van nằm trên bức tường giữa hai lượt đi: lượt đi và lượt về, van nào cũng ở bên phải xe. Van đóng mở cửa ở lượt về. Chương trình chính đã khóa, gọi check_right() ở cả hai lượt. ' +
        'Bắn là ĐỔI trạng thái: lượt về mà bắn lại van mình vừa mở thì nó đóng, cửa của nó đóng lại. Sửa thân check_right() cho đúng.',
      veMaMau: 'Chương trình chính bị khóa. check_right() có sẵn bắn mọi van. Chạy thử: lượt về cửa nào đóng lại?',
      san: SAN_D7, batDau: { x: 2, y: 1, huong: 1 }, noi: [noi(3, 2, [[2, 3]]), noi(4, 2, [[3, 3]])], nutBat: [o(2, 2)],
      maMau: bai(C_D7, [H('check_right', [], ['turn_right()', 'squirt("low")', 'turn_left()'])]),
      sao: { o: 25, nhip: 25 },
      loiGiai: bai(C_D7, [H('check_right', [], T_D7)]),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(C_D7, [H('check_right', [], ['# van đã nóng thì để yên'].concat(T_D7))]) },
      loiSai: [
        { moTa: 'Để nguyên bắn mọi van: lượt về bắn lại van vừa mở, cửa đóng trước mũi xe', baiLam: bai(C_D7, [H('check_right', [], ['turn_right()', 'squirt("low")', 'turn_left()'])]), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đo mà quên quay: mắt hồng ngoại nhìn dọc đường đi, không nhìn van', baiLam: bai(C_D7, [H('check_right', [], BAT)]), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Lượt về, van mình đã bắn ở lượt đi đang mở nên nóng.',
        'Thân check_right(): turn_right(), if not warm(): squirt("low"), turn_left().']
    }),

    man({
      chuong: 'do-nhiet', so: 8, ten: 'Đố: Sola bắn mọi van', yMoi: 'tìm lỗi: thiếu if not warm(), van nóng ở xa bị bắn tụ, cú giật đẩy xe xuống hốc',
      mucTieu: 'bong-mo', hamCuaEmCan: ['auto_spray', 'squirt', 'turn_left', 'turn_right', 'move'], chinhCoDinh: true,
      deBai: 'Sola viết scan_hot(): van nào cũng auto_spray(), tự chọn lực theo xa gần. Chương trình chính đã khóa. Chạy thử: tới van thứ hai xe rơi xuống hốc. Vì sao? ' +
        'Van đó đang mở sẵn, không cần bắn. Sửa scan_hot() để chỉ bắn van chưa nóng, đưa xe tới chỗ xe mờ.',
      veMaMau: 'Chạy thử. Van thứ hai cách mấy ô, auto_spray() chọn lực gì, sau lưng xe là gì?',
      san: SAN_D8, batDau: { x: 1, y: 2, huong: 1 }, noi: [noi(1, 5, [[2, 2]]), noi(3, 3, [[4, 2]])], nutBat: [o(2, 5), o(4, 3)],
      bongMo: { x: 5, y: 2, huong: 1 },
      maMau: bai(C_D8, [H('scan_hot', [], ['auto_spray()'])]),
      sao: { o: 20, nhip: 14 },
      loiGiai: bai(C_D8, [H('scan_hot', [], T_D5)]),
      loiGiaiKhac: { moTa: 'Cùng cách sửa, thêm một dòng chú thích', baiLam: bai(C_D8, [H('scan_hot', [], ['# van nóng thì không bắn'].concat(T_D5))]) },
      loiSai: [
        { moTa: 'Để nguyên bản của Sola: van nóng cách 2 ô bị bắn tụ, xe giật lên hốc', baiLam: bai(C_D8, [H('scan_hot', [], ['auto_spray()'])]), phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Sửa thành if warm(): bắn van nóng, bỏ van đóng', baiLam: bai(C_D8, [H('scan_hot', [], IF('warm()', ['auto_spray()']))]), phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Bỏ auto_spray(), bắn nhanh: van đóng đầu tiên cách 2 ô, tia nước rơi giữa đường', baiLam: bai(C_D8, [H('scan_hot', [], BAT)]), phaiCoMa: ['ban-ngan', 'lech-bong-mo'] }
      ],
      goiY: ['Van đang mở thì không cần bắn: bắn chỉ đóng nó, mà bắn tụ còn làm xe giật.',
        'Bọc auto_spray() trong if not warm():.']
    }),

    man({
      chuong: 'do-nhiet', so: 9, ten: 'Băng chuyền và van nóng', yMoi: 'van đóng nối băng chuyền: bắn thì băng dừng; van nóng để yên',
      hamCuaEmCan: ['squirt', 'turn_left', 'turn_right', 'move'], chinhCoDinh: true,
      deBai: 'Hai ô băng chuyền chạy ngược chắn đường: đứng trên băng hai nhịp là bị đẩy lùi. Van đóng đầu tiên nối với băng, bắn thì băng dừng; van đóng thứ hai mở cửa. ' +
        'Hai van còn lại đang mở. Chương trình chính đã khóa, gọi check_belt() ở bốn ô. Viết thân check_belt().',
      veMaMau: 'Chương trình chính bị khóa. check_belt() có sẵn chỉ bắn khi van nóng. Chạy thử xem băng có dừng không.',
      san: SAN_D9, batDau: { x: 1, y: 2, huong: 1 }, noi: [{ nut: o(1, 1), bang: [o(2, 2), o(3, 2)] }, noi(3, 1, [[4, 2]])], nutBat: [o(2, 1), o(4, 1)],
      maMau: bai(C_D9, [H('check_belt', [], IF('warm()', ['squirt("low")']))]),
      sao: { o: 16, nhip: 14 },
      loiGiai: bai(C_D9, [H('check_belt', [], BAT)]),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(C_D9, [H('check_belt', [], ['# van đóng thì bắn: băng dừng, cửa mở'].concat(BAT))]) },
      loiSai: [
        { moTa: 'Để nguyên if warm(): băng vẫn chạy, xe bị đẩy lùi', baiLam: bai(C_D9, [H('check_belt', [], IF('warm()', ['squirt("low")']))]), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Không bắn gì: băng chạy, cửa đóng', baiLam: bai(C_D9, [H('check_belt', [], ['pass'])]), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Băng chuyền nối với van: van đổi trạng thái thì băng đổi theo ngay.',
        'Thân check_belt(): if not warm(): squirt("low").']
    }),

    /* ------------------------------------------------ trùm */
    man({
      chuong: 'do-nhiet', so: 10, ten: 'Trùm: Ba mê cung đèn nóng', yMoi: 'một chương trình cho ba mê cung: quay tìm đèn nóng ở mỗi ngã',
      hang: 'trum', hamCuaEmCan: ['turn_right', 'go_to_wall', 'move'],
      huyHieu: { ma: 'do-nhiet', ten: 'Huy hiệu Đo nhiệt' },
      deBai: 'Ba mê cung, một chương trình. Mê cung nào cũng có bốn ngã, ở mỗi ngã đường đi tiếp là hướng có đèn nóng ở cuối, nhưng đèn nằm bên phải hay bên trái, xa hay gần thì mỗi sân một khác, ' +
        'lại có cửa, thùng, van đóng đứng gần như đèn. Viết một chương trình tới cờ ở cả ba mê cung.',
      veMaMau: 'Chương trình có sẵn ngã nào cũng rẽ phải một lần: chỉ đúng ở mê cung thứ ba.',
      san: SAN_D10, batDau: [{ x: 2, y: 1, huong: 0 }, { x: 1, y: 5, huong: 0 }, { x: 2, y: 2, huong: 0 }],
      noi: [[], [], []],
      nutBat: [[o(5, 1), o(4, 4), o(6, 3), o(5, 5)], [o(3, 5), o(2, 3), o(5, 4), o(4, 1)], [o(4, 2), o(3, 6), o(0, 5), o(1, 3)]],
      maMau: bai(FOR(4, ['turn_right()', 'go_to_wall()'])),
      sao: { o: 12, nhip: 37 },
      loiGiai: bai(L_D2),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# ngã nào cũng tìm đèn nóng'].concat(L_D2)) },
      loiSai: [
        { moTa: 'Ngã nào cũng rẽ phải một lần: chỉ đúng ở mê cung thứ ba', baiLam: bai(FOR(4, ['turn_right()', 'go_to_wall()'])), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Tìm bằng distance() như Sola: cửa đóng cách 1 ô cũng bị chọn', baiLam: bai(FOR(4, nhieu(['turn_right()'], WHILE('distance() == 0', ['turn_right()']), ['go_to_wall()']))), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Bỏ dòng quay đầu tiên: xe đang nhìn đúng đèn vừa tới nên đứng yên', baiLam: bai(FOR(4, nhieu(WHILE('not warm()', ['turn_right()']), ['go_to_wall()']))), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Ở mỗi ngã: quay khỏi đèn vừa tới, quay tiếp cho tới khi warm() là True, rồi go_to_wall().',
        'Chương trình của màn Đèn nóng chỉ đường chạy được ở cả ba mê cung.']
    }),

    /* ================================================================ chương che-do-nhiet: Hàm đo nhiệt */
    man({
      chuong: 'che-do-nhiet', so: 1, ten: 'Hàm switch_on()', yMoi: 'chế hàm đọc warm(): van chưa nóng thì bắn nhanh cho mở',
      hamCuaEmCan: ['squirt', 'turn_left', 'turn_right', 'move'], taoHam: ['switch_on'], chinhCoDinh: true,
      deBai: 'Em chế hàm switch_on(): mắt hồng ngoại đo van trước mũi xe, van chưa nóng thì bắn nhanh cho nó mở, van đang mở thì để yên. Hàm này sẽ theo em suốt gói. ' +
        'Chương trình chính đã khóa: bốn ô, mỗi ô quay trái, switch_on(), quay lại, tiến. Van đóng mở cánh cửa ngay sau nó.',
      veMaMau: 'Chương trình chính bị khóa. Mở Xưởng hàm, tạo switch_on() hai dòng.',
      san: SAN_C1, batDau: { x: 1, y: 2, huong: 1 }, noi: [noi(1, 1, [[2, 2]]), noi(3, 1, [[4, 2]])], nutBat: [o(2, 1), o(4, 1)],
      maMau: bai(C_C1),
      sao: { o: 16, nhip: 14 },
      loiGiai: { chinh: C_C1.slice(), hamCuaEmMoi: [H('switch_on', [], BAT)] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: bai(C_C1), hamCuaEmMoi: [H('switch_on', [], ['# van chưa nóng thì bắn cho mở'].concat(BAT))] },
      congThucKhac: [{ moTa: 'Viết if warm(): pass, else: squirt("low")', baiLam: bai(C_C1), hamCuaEmMoi: [H('switch_on', [], IF('warm()', ['pass'], ['squirt("low")']))] }],
      loiSai: [
        { moTa: 'Viết if warm(): đóng van đang mở, van đóng vẫn đóng', baiLam: bai(C_C1), hamCuaEmMoi: [H('switch_on', [], IF('warm()', ['squirt("low")']))], phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quay thêm trong hàm: chương trình chính đã quay trái rồi, mắt hồng ngoại nhìn ngược lại', baiLam: bai(C_C1), hamCuaEmMoi: [H('switch_on', [], ['turn_left()'].concat(BAT))], phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Hàm switch_on() không quay: nó đo và bắn van ngay trước mũi xe.',
        'Hai dòng: if not warm(): rồi thụt vào squirt("low").']
    }),

    man({
      chuong: 'che-do-nhiet', so: 2, ten: 'Hàm switch_left()', yMoi: 'hàm gọi hàm đọc warm(): quay trái, switch_on(), quay lại',
      hamCuaEmCan: ['switch_on', 'squirt', 'turn_left', 'turn_right', 'move'], taoHam: ['switch_left'], chinhCoDinh: true,
      deBai: 'Năm van trên tường bên trái hành lang. Em chế switch_left(): quay trái, gọi switch_on() của em, rồi quay lại. Chương trình chính đã khóa: năm lần switch_left() rồi tiến.',
      veMaMau: 'Chương trình chính bị khóa. Tạo switch_left() ba dòng.',
      san: SAN_C2, batDau: { x: 1, y: 2, huong: 1 }, noi: [noi(2, 1, [[3, 2]]), noi(3, 1, [[4, 2]])], nutBat: [o(1, 1), o(4, 1), o(5, 1)],
      maMau: bai(C_C2),
      sao: { o: 17, nhip: 17 },
      loiGiai: { chinh: C_C2.slice(), hamCuaEmMoi: [H('switch_left', [], T_SL)] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: bai(C_C2), hamCuaEmMoi: [H('switch_left', [], ['# quay về phía van, mở nếu còn đóng, quay lại'].concat(T_SL))] },
      congThucKhac: [{ moTa: 'Viết thẳng if not warm(): trong switch_left() thay cho gọi switch_on()', baiLam: bai(C_C2), hamCuaEmMoi: [H('switch_left', [], nhieu(['turn_left()'], BAT, ['turn_right()']))] }],
      loiSai: [
        { moTa: 'Quên quay lại: xe tiến thẳng vào tường', baiLam: bai(C_C2), hamCuaEmMoi: [H('switch_left', [], ['turn_left()', 'switch_on()'])], phaiCoMa: ['dam-tuong'] },
        { moTa: 'Quay phải thay vì quay trái: mắt hồng ngoại nhìn bức tường không có van', baiLam: bai(C_C2), hamCuaEmMoi: [H('switch_left', [], ['turn_right()', 'switch_on()', 'turn_left()'])], phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Hàm của em gọi được hàm của em khác: switch_on() đã làm ở màn trước.',
        'turn_left(), switch_on(), turn_right().']
    }),

    man({
      chuong: 'che-do-nhiet', so: 3, ten: 'Sửa hàm light()', yMoi: 'sửa hàm lỗi: if warm() thành if not warm()',
      hamCuaEmCan: ['switch_on', 'squirt', 'turn_right', 'go_to_wall', 'move'], chinhCoDinh: true,
      deBai: 'Sola chế light() để mở van ở mỗi khúc quanh của đường xoắn, nhưng viết if warm(): squirt("low"). Chương trình chính đã khóa: light(), rẽ phải, go_to_wall(), bốn lần. ' +
        'Chạy thử xem van nào bị bắn, rồi sửa một dòng trong light().',
      veMaMau: 'Chạy thử. Van nào đang nóng, van nào cần bắn?',
      san: SAN_D1, batDau: { x: 2, y: 2, huong: 0 }, noi: [noi(2, 1, [[3, 2]]), noi(3, 6, [[2, 5]])], nutBat: [o(4, 2), o(0, 5)],
      maMau: bai(C_C3, [H('light', [], IF('warm()', ['squirt("low")']))]),
      sao: { o: 15, nhip: 13 },
      loiGiai: bai(C_C3, [H('light', [], BAT)]),
      loiGiaiKhac: { moTa: 'Cùng cách sửa, thêm một dòng chú thích trong hàm', baiLam: bai(C_C3, [H('light', [], ['# chưa nóng mới bắn'].concat(BAT))]) },
      congThucKhac: [{ moTa: 'Gọi switch_on() của em trong light()', baiLam: bai(C_C3, [H('light', [], ['switch_on()'])]) }],
      loiSai: [
        { moTa: 'Để nguyên bản của Sola: đóng van đang mở, van đóng vẫn đóng, cửa đóng', baiLam: bai(C_C3, [H('light', [], IF('warm()', ['squirt("low")']))]), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Sửa nhầm thành bắn tụ: ở khúc quanh thứ ba cú giật đẩy xe lùi', baiLam: bai(C_C3, [H('light', [], IF('not warm()', ['squirt("high")']))]), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['warm() là True khi van đang mở. Van đang mở thì không cần bắn.',
        'Thêm chữ not: if not warm():.']
    }),

    /* ------------------------------------------------ hàng 2: luyện */
    man({
      chuong: 'che-do-nhiet', so: 4, ten: 'Hàm find_warm()', yMoi: 'hàm có vòng while not warm() bên trong: quay khỏi van vừa tới rồi quay tới khi thấy đèn nóng',
      hamCuaEmCan: ['turn_right', 'go_to_wall', 'move'], taoHam: ['find_warm'], chinhCoDinh: true,
      deBai: 'Mê cung đèn nóng, có cửa, thùng, van đóng làm mồi. Em chế find_warm(): quay phải một lần cho khỏi đèn vừa tới, rồi quay tiếp cho tới khi warm() là True. ' +
        'Chương trình chính đã khóa: find_warm(), go_to_wall(), bốn lần.',
      veMaMau: 'Chương trình chính bị khóa. Tạo find_warm() ba dòng.',
      san: SAN_C4, batDau: { x: 5, y: 5, huong: 0 }, noi: [], nutBat: [o(3, 5), o(4, 3), o(1, 4), o(2, 1)],
      maMau: bai(C_C4),
      sao: { o: 13, nhip: 14 },
      loiGiai: { chinh: C_C4.slice(), hamCuaEmMoi: [H('find_warm', [], TIM)] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: bai(C_C4), hamCuaEmMoi: [H('find_warm', [], ['# quay khỏi đèn cũ rồi tìm đèn mới'].concat(TIM))] },
      loiSai: [
        { moTa: 'Bỏ dòng quay đầu tiên: xe đang nhìn đúng đèn vừa tới nên không quay', baiLam: bai(C_C4), hamCuaEmMoi: [H('find_warm', [], WHILE('not warm()', ['turn_right()']))], phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Tìm bằng distance(): cửa đóng cách 1 ô cũng bị chọn', baiLam: bai(C_C4), hamCuaEmMoi: [H('find_warm', [], nhieu(['turn_right()'], WHILE('distance() == 0', ['turn_right()'])))], phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Thân hàm chứa được vòng lặp while, như go_to_wall() của gói Hồng ngoại.',
        'turn_right(), rồi while not warm(): turn_right().']
    }),

    man({
      chuong: 'che-do-nhiet', so: 5, ten: 'Hàm auto_on()', yMoi: 'hàm đọc cả hai: warm() chọn có bắn, auto_spray() chọn lực',
      hamCuaEmCan: ['switch_on', 'auto_spray', 'squirt', 'turn_left', 'turn_right', 'move'], taoHam: ['auto_on'], chinhCoDinh: true,
      deBai: 'Van nằm bên phải hành lang, xa gần khác nhau; phía trên hành lang có hai hốc. Em chế auto_on(): van chưa nóng thì auto_spray() cho mắt hồng ngoại tự chọn lực. ' +
        'Chương trình chính đã khóa: quay phải, auto_on(), quay lại, tiến, năm lần.',
      veMaMau: 'Chương trình chính bị khóa. Tạo auto_on() hai dòng.',
      san: SAN_C5, batDau: { x: 1, y: 2, huong: 1 }, noi: [noi(1, 5, [[2, 2]]), noi(3, 3, [[4, 2]]), noi(4, 3, [[5, 2]])], nutBat: [o(2, 5), o(5, 3)],
      maMau: bai(C_C5),
      sao: { o: 20, nhip: 18 },
      loiGiai: { chinh: C_C5.slice(), hamCuaEmMoi: [H('auto_on', [], T_D5)] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: bai(C_C5), hamCuaEmMoi: [H('auto_on', [], ['# nóng thì để yên, lạnh thì tự chọn lực'].concat(T_D5))] },
      loiSai: [
        { moTa: 'Gọi switch_on(): luôn bắn nhanh, van đóng đầu tiên cách 2 ô', baiLam: bai(C_C5), hamCuaEmMoi: [H('auto_on', [], ['switch_on()'])], phaiCoMa: ['ban-ngan', 'chua-toi-co'] },
        { moTa: 'Bỏ warm(): van nóng ở xa bị bắn tụ, xe giật lên hốc', baiLam: bai(C_C5), hamCuaEmMoi: [H('auto_on', [], ['auto_spray()'])], phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['auto_spray() của gói Lực bắn đã biết chọn lực theo distance().',
        'if not warm(): rồi thụt vào auto_spray().']
    }),

    man({
      chuong: 'che-do-nhiet', so: 6, ten: 'Hàm scan_on(n)', yMoi: 'hàm có tham số n: lặp n lần switch_left() rồi tiến; một van được đo hai lần',
      hamCuaEmCan: ['switch_left', 'switch_on', 'squirt', 'turn_left', 'turn_right', 'move'], taoHam: ['scan_on'], chinhCoDinh: true,
      deBai: 'Hành lang gấp khúc, van ở bên trái cả hai đoạn. Van ở góc được đo hai lần: đoạn đầu nhìn nó từ dưới lên, đoạn sau nhìn từ bên phải. ' +
        'Em chế scan_on(n): n lần switch_left() rồi tiến. Chương trình chính đã khóa: scan_on(3), quay trái, tiến, scan_on(2).',
      veMaMau: 'Chương trình chính bị khóa. Tạo scan_on(n) với for i in range(n): trong thân.',
      san: SAN_C6, batDau: { x: 1, y: 4, huong: 1 }, noi: [noi(1, 3, [[2, 4]]), noi(3, 3, [[4, 4], [4, 2]])], nutBat: [o(2, 3), o(3, 2)],
      maMau: bai(C_C6),
      sao: { o: 21, nhip: 19 },
      loiGiai: { chinh: C_C6.slice(), hamCuaEmMoi: [H('scan_on', ['n'], FOR('n', ['switch_left()', 'move()']))] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: bai(C_C6), hamCuaEmMoi: [H('scan_on', ['n'], ['# n ô, ô nào cũng đo bên trái'].concat(FOR('n', ['switch_left()', 'move()'])))] },
      loiSai: [
        { moTa: 'Bắn mọi van không đo: van ở góc bị bắn lần hai, hai cửa của nó đóng lại', baiLam: bai(C_C6), hamCuaEmMoi: [H('scan_on', ['n'], FOR('n', ['turn_left()', 'squirt("low")', 'turn_right()', 'move()']))], phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên move() trong vòng lặp: xe đo n lần cùng một van rồi mới đi', baiLam: bai(C_C6), hamCuaEmMoi: [H('scan_on', ['n'], FOR('n', ['switch_left()']))], phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['scan_on(3) thì n là 3, scan_on(2) thì n là 2.',
        'Van mình đã mở thì nóng: switch_left() tự để yên.']
    }),

    /* ------------------------------------------------ hàng 3: biến thể */
    man({
      chuong: 'che-do-nhiet', so: 7, ten: 'Hàm switch_right()', yMoi: 'hàm đối xứng: quay phải, switch_on(), quay trái; dùng ở cả lượt đi và lượt về',
      hamCuaEmCan: ['switch_on', 'switch_left', 'squirt', 'turn_left', 'turn_right', 'forward', 'move'], taoHam: ['switch_right'], chinhCoDinh: true,
      deBai: 'Lại là đường đi rồi về qua bức tường van. Em chế switch_right(): quay phải, switch_on(), quay trái. Chương trình chính đã khóa, gọi switch_right() ở cả hai lượt. ' +
        'Lượt về, van em đã mở đang nóng nên switch_on() để yên.',
      veMaMau: 'Chương trình chính bị khóa. Tạo switch_right() ba dòng.',
      san: SAN_D7, batDau: { x: 2, y: 1, huong: 1 }, noi: [noi(3, 2, [[2, 3]]), noi(4, 2, [[3, 3]])], nutBat: [o(2, 2)],
      maMau: bai(C_C7),
      sao: { o: 26, nhip: 25 },
      loiGiai: { chinh: C_C7.slice(), hamCuaEmMoi: [H('switch_right', [], T_SR)] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: bai(C_C7), hamCuaEmMoi: [H('switch_right', [], ['# quay phải, bật nếu còn tắt, quay lại'].concat(T_SR))] },
      loiSai: [
        { moTa: 'Bắn không đo: lượt về bắn lại van vừa mở, cửa đóng', baiLam: bai(C_C7), hamCuaEmMoi: [H('switch_right', [], ['turn_right()', 'squirt("low")', 'turn_left()'])], phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Gọi switch_left() thay vì quay phải: mắt hồng ngoại nhìn bức tường ngoài', baiLam: bai(C_C7), hamCuaEmMoi: [H('switch_right', [], ['switch_left()'])], phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['switch_right() giống switch_left() nhưng quay về phía bên phải.',
        'turn_right(), switch_on(), turn_left().']
    }),

    man({
      chuong: 'che-do-nhiet', so: 8, ten: 'Hàm auto_left_on()', yMoi: 'hàm gọi hàm hai tầng: quay trái, auto_on(), quay lại',
      mucTieu: 'bong-mo', hamCuaEmCan: ['auto_on', 'auto_spray', 'squirt', 'turn_left', 'turn_right', 'move', 'switch_left', 'auto_left'], taoHam: ['auto_left_on'], chinhCoDinh: true,
      deBai: 'Hành lang có van bên trái, xa gần khác nhau, dưới là hốc. Em chế auto_left_on(): quay trái, auto_on() của em, quay lại. Chương trình chính đã khóa: năm lần auto_left_on() rồi tiến. Đưa xe tới chỗ xe mờ.',
      veMaMau: 'Chương trình chính bị khóa. Tạo auto_left_on() ba dòng.',
      san: SAN_C8, batDau: { x: 1, y: 4, huong: 1 }, noi: [noi(2, 1, [[3, 4]]), noi(4, 3, [[5, 4]])], nutBat: [o(1, 3), o(3, 1), o(5, 3)],
      bongMo: { x: 6, y: 4, huong: 1 },
      maMau: bai(C_C8),
      sao: { o: 21, nhip: 17 },
      loiGiai: { chinh: C_C8.slice(), hamCuaEmMoi: [H('auto_left_on', [], T_AL)] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: bai(C_C8), hamCuaEmMoi: [H('auto_left_on', [], ['# quay trái, đo nóng lạnh và xa gần'].concat(T_AL))] },
      loiSai: [
        { moTa: 'Gọi switch_left(): bắn nhanh van đóng ở xa, tia nước rơi giữa đường', baiLam: bai(C_C8), hamCuaEmMoi: [H('auto_left_on', [], ['switch_left()'])], phaiCoMa: ['ban-ngan', 'lech-bong-mo'] },
        { moTa: 'Gọi auto_left() của gói Lực bắn: bắn cả van nóng ở xa, xe giật xuống hốc', baiLam: bai(C_C8), hamCuaEmMoi: [H('auto_left_on', [], ['auto_left()'])], phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['auto_on() đã biết đo nhiệt và chọn lực; auto_left_on() chỉ cần quay.',
        'turn_left(), auto_on(), turn_right().']
    }),

    man({
      chuong: 'che-do-nhiet', so: 9, ten: 'Sửa hàm find_hot()', yMoi: 'sửa hàm lỗi: thiếu dòng quay đầu tiên nên xe nhìn mãi đèn vừa tới',
      hamCuaEmCan: ['find_warm', 'turn_right', 'go_to_wall', 'move'], chinhCoDinh: true,
      deBai: 'Sola chế find_hot() để tìm đèn nóng ở mỗi ngã: while not warm(): turn_right(). Chương trình chính đã khóa: find_hot(), go_to_wall(), bốn lần. ' +
        'Ngã đầu thì đúng, tới ngã thứ hai xe đứng yên. Thêm một dòng vào find_hot().',
      veMaMau: 'Chạy thử. Tới ngã thứ hai, mũi xe đang nhìn gì?',
      san: SAN_D3, batDau: { x: 1, y: 5, huong: 0 }, noi: [], nutBat: [o(3, 5), o(2, 3), o(5, 4), o(4, 1)],
      maMau: bai(C_C9, [H('find_hot', [], WHILE('not warm()', ['turn_right()']))]),
      sao: { o: 13, nhip: 14 },
      loiGiai: bai(C_C9, [H('find_hot', [], TIM)]),
      loiGiaiKhac: { moTa: 'Cùng cách sửa, thêm một dòng chú thích trong hàm', baiLam: bai(C_C9, [H('find_hot', [], ['# quay khỏi đèn vừa tới trước đã'].concat(TIM))]) },
      congThucKhac: [{ moTa: 'Gọi find_warm() của em trong find_hot()', baiLam: bai(C_C9, [H('find_hot', [], ['find_warm()'])]) }],
      loiSai: [
        { moTa: 'Để nguyên bản của Sola: tới ngã thứ hai xe nhìn đúng đèn vừa tới', baiLam: bai(C_C9, [H('find_hot', [], WHILE('not warm()', ['turn_right()']))]), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Thêm dòng quay vào trong vòng lặp: thân while quay hai lần, ở ngã đầu xe quay mãi không thấy đèn', baiLam: bai(C_C9, [H('find_hot', [], WHILE('not warm()', ['turn_right()', 'turn_right()']))]), phaiCoMa: ['vong-vo-han'] }
      ],
      goiY: ['Tới sát đèn rồi thì warm() đang là True ngay: vòng while không chạy lần nào.',
        'Thêm turn_right() ở đầu hàm, TRƯỚC vòng while.']
    }),

    /* ------------------------------------------------ trùm */
    man({
      chuong: 'che-do-nhiet', so: 10, ten: 'Trùm: Hành lang và ngã rẽ', yMoi: 'một chương trình cho ba sân: switch_left() dọc hành lang, find_warm() ở ngã rẽ',
      hang: 'trum', hamCuaEmCan: ['switch_left', 'switch_on', 'scan_on', 'find_warm', 'go_to_wall', 'squirt', 'turn_left', 'turn_right', 'move'],
      huyHieu: { ma: 'che-do-nhiet', ten: 'Huy hiệu Hàm đo nhiệt' },
      deBai: 'Ba sân, một chương trình. Sân nào cũng là hành lang ba van bên trái rồi một ngã rẽ: van nào nóng mỗi sân một khác, ngã rẽ đi lên hay đi xuống cũng mỗi sân một khác, ' +
        'đèn nóng ở cuối đường cho biết lối ra. Dùng các hàm của em để tới cờ trên cả ba sân.',
      veMaMau: 'Chương trình có sẵn bắn mọi van rồi rẽ phải theo sân thứ nhất.',
      san: SAN_C10, batDau: [{ x: 1, y: 2, huong: 1 }, { x: 1, y: 4, huong: 1 }, { x: 1, y: 2, huong: 1 }],
      noi: [[noi(1, 1, [[2, 2]]), noi(3, 1, [[4, 2]])], [noi(2, 3, [[3, 4]]), noi(3, 3, [[4, 4]])], [noi(1, 1, [[2, 2]]), noi(2, 1, [[3, 2]])]],
      nutBat: [[o(2, 1), o(4, 5)], [o(1, 3), o(4, 1)], [o(3, 1), o(4, 6)]],
      maMau: bai(nhieu(FOR(3, ['turn_left()', 'squirt("low")', 'turn_right()', 'move()']), ['turn_right()', 'go_to_wall()'])),
      sao: { o: 24, nhip: 45 },
      loiGiai: bai(L_C10),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# mở van còn đóng, rồi tìm đèn nóng ở ngã rẽ'].concat(L_C10)) },
      congThucKhac: [{ moTa: 'Gọi scan_on(3) thay cho vòng lặp', baiLam: bai(['scan_on(3)', 'find_warm()', 'go_to_wall()']) }],
      loiSai: [
        { moTa: 'Bắn mọi van rồi rẽ phải theo sân thứ nhất: sân khác van nóng bị đóng cũng được, nhưng lối ra ở hướng khác', baiLam: bai(nhieu(FOR(3, ['turn_left()', 'squirt("low")', 'turn_right()', 'move()']), ['turn_right()', 'go_to_wall()'])), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên find_warm(): xe đi thẳng vào tường cuối hành lang', baiLam: bai(nhieu(FOR(3, ['switch_left()', 'move()']), ['go_to_wall()'])), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên mở van: cửa trong hành lang vẫn đóng, xe kẹt trước cửa quay mãi không thấy đèn', baiLam: bai(nhieu(FOR(3, ['move()']), ['find_warm()', 'go_to_wall()'])), phaiCoMa: ['vong-vo-han'] }
      ],
      goiY: ['Dọc hành lang: switch_left() rồi move(), ba lần.',
        'Ở ngã rẽ: find_warm() quay tới đèn nóng, go_to_wall() đi tới cờ.']
    })
  ];

  ManHoc.manDoNhiet = DS;
  if (laNode) module.exports = ManHoc;
})();
