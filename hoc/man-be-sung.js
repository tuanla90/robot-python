/* ============================================================================
   man-be-sung.js — "Robot Chấn Hưng": NGÂN HÀNG MÀN MỚI của mùa 2, gói 9 "Bệ súng xích" (combo) (KE-HOACH-MUA-2.md).
   Khung mùa 2 (lo-trinh-hoc.js, khối "MÙA 2 = 10 GÓI", mảng MUA_2) đã chừa chỗ: tệp đã có trong danh sách require của lo-trinh-hoc.js và
   thẻ <script> của game/choi.html. Gói sau CHỈ việc thêm màn vào mảng DS dưới đây; màn tự hiện đúng chương, đúng gói.
     - `be-sung` (mã be-sung.1 … be-sung.10): chương 1: xích bắn tụ không giật
     - `che-be-sung` (mã che-be-sung.1 … che-be-sung.10): chương 2 "Hàm bệ súng"
   Mỗi màn khai `chuong` (một trong các mã trên) và `so` (1, 2, …: thứ tự trong phần màn mới của chương); mã `ma` = chuong + '.' + so là khóa lưu sao,
   KHÔNG đổi sau khi xuất bản. Gọi ManHoc.chuanHoa(m) như các tệp màn khác. Chương còn trống thì chưa hiện; gói chưa có chương nào có màn thì chưa hiện.
   Ràng buộc mùa 2 (hoc/kiem-lo-trinh.mjs): robot chỉ dùng part mùa 1 + xích + súng hơi (+ hồng ngoại khi lõi có); không bậc thang S, hố u, gầm n;
   biến chỉ từ gói 1 chương 2, hàm có tham số chỉ từ gói 2 chương 2 (tham-so); hàm của em cần phải được tạo ở màn đứng trước.
   Tệp này KHÔNG tự thêm màn vào ManHoc: danh sách nằm ở ManHoc.manBeSung, lo-trinh-hoc.js thêm vào chương rồi xếp chỗ (so, hang do dungChuong đặt).

   NỘI DUNG (28/10): COMBO của mùa 2 = XE BÁNH XÍCH (gói 1) gắn SÚNG HƠI (gói 2) thành BỆ SÚNG (cfg.beSung, luật ở san-hoc.js mục BỆ SÚNG XÍCH):
   xích bắn TỤ (shoot(), shoot("charge"), fire("charge"), jet_back()…) thì bóng bay tới vật cản như cũ nhưng xe KHÔNG GIẬT (thùng sau xe không bị hất);
   bắn nhanh "fast" như cũ (bay tối đa 2 ô, không giật). Xe hai bánh hay xích không khai cờ thì vẫn giật. Mọi màn còn khai xichDay (gói 5: xích tiến vào thùng nặng thì đẩy).
   Ý gói: lúc nào cú giật có hại (sau lưng là hốc, thùng, chỗ rẽ; bắn tụ nhiều phát liền) và bệ súng giải được. MỖI MÀN CẦN BỆ SÚNG: bộ dò (do-duong-be-sung.mjs)
   chứng minh cùng sân trên xích không bệ súng (giật) không có đường nào trong sao.nhip. Xích quay chậm: tr_right() / tr_left() hai nhịp; turn_right() / turn_left()
   của xe hai bánh chỉ quay nửa vòng trên xích (bẫy che-be-sung.3).
   Chương be-sung: chương trình mở, đếm cứng (không cảm biến) ở màn 1–5; từ màn 6, màn đọc cảm biến KHÓA chương trình chính và gọi hàm của màn ở nhiều chỗ.
   Chương che-be-sung: chế hàm của em cho bệ súng (blast_left…), chương trình chính KHÓA, gọi hàm ở nhiều chỗ. MỘT SÂN mỗi màn, nhiều sân chỉ ở trùm.
   Không nhiều robot (gói 8 viết song song), không return (mùa 5). kiem-be-sung.mjs + do-duong-be-sung.mjs kiểm (cả BẢNG RECALL gói 1–7 mùa 2).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'shoot', 'shoot_back'];
  var BANH_MAT = BANH.concat(['distance', 'warm']);

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

  /** Điền trường chung: xe bánh xích gắn súng hơi thành bệ súng (beSung), xích đẩy thùng (xichDay); m.mat: gắn mắt hồng ngoại (distance, warm). */
  function man(m) {
    var mat = !!m.mat;
    delete m.mat;
    m.cauTruc = ['for', 'if', 'while'];
    m.loaiRobot = 'xich';
    m.robot = { than: 'xich', tay: 'hoi', camBien: mat ? [{ ma: 'hong-ngoai', o: 'tren' }] : [] };
    m.hamGoc = mat ? BANH_MAT : BANH;
    m.beSung = true;
    m.xichDay = true;
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    if (!m.mucTieu) m.mucTieu = 'toi-co';
    if (Array.isArray(m.san[0])) m.nhipTheo = 'tong';
    return ManHoc.chuanHoa(m);
  }

  /* ------------------------------------------------------------------- sân */

  // be-sung.1: xe (1,3) quay lên, nút (1,0) cuối hành lang mở cửa (2,3) ngay bên phải xe; cờ (4,3). Dưới xe là ô trống (1,4): xích không bệ súng giật xuống đó, lệch khỏi cửa.
  var SAN_B1 = ['#N####', '#.####', '#.####', '#.C.F#', '#.####', '######'];
  // be-sung.2: xe (4,1) quay phải, nút (0,1) ở đầu kia hành lang, SAU LƯNG xe; cửa (4,2) ngay dưới xe; cờ (4,3). Không bệ súng: bắn ra sau thì xe giật TỚI (5,1), lệch khỏi cửa.
  var SAN_B2 = ['########', 'N......#', '####C###', '####F###', '########'];
  // be-sung.3: xe (2,3) quay lên. Nút A (2,0) mở cửa (3,3) bên phải xe; nút B (5,3) cuối hành lang phải (bóng bay qua cửa (3,3) đã mở) mở cửa (2,4) dưới xe; cờ (2,5).
  //   Không bệ súng: phát thứ hai (quay phải) giật xe sang trái (1,3).
  var SAN_B3 = ['##N####', '##.####', '##.####', '#..C.N#', '##C####', '##F####', '#######'];
  // be-sung.4: xe (2,2) quay lên, nút (2,0) mở cửa (3,2) bên phải xe. Ngay sau lưng xe là thùng nặng (2,3), dưới thùng là cờ (2,4).
  //   Đường tới cờ đi vòng: (3,2) → (3,3) → (3,4) → (2,4). Không bệ súng: cú giật hất thùng trượt xuống nằm đè lên cờ.
  var SAN_B4 = ['##N###', '##.###', '##.C##', '##H.##', '##F.##', '######'];
  // be-sung.5: hành lang (1..6, 3) đi sang phải; hai trạm (2,3), (4,3), mỗi trạm có nút xa phía trên ((2,0), (4,0), giếng hai ô) mở cửa ngay sau trạm ((3,3), (5,3)),
  //   dưới mỗi trạm là một hốc ((2,4), (4,4)): xích không bệ súng bắn lên thì giật xuống hốc. Cờ (6,3).
  var SAN_B5 = ['##N#N###', '##.#.###', '##.#.###', '#..C.CF#', '##.#.###', '########'];
  // be-sung.6: hành lang (1..7, 3), ba trạm LIỀN NHAU (2,3), (3,3), (4,3), mỗi trạm một nút xa phía trên ((2,0), (3,0), (4,0)), dưới là hốc. Nút (2,0) ĐANG BẬT (nutBat);
  //   nút (3,0), (4,0) TẮT mở hai cửa nối tiếp ở cuối hành lang (5,3), (6,3). Cờ (7,3).
  var SAN_B6 = ['##NNN####', '##...####', '##...####', '#....CCF#', '##...####', '#########'];
  // be-sung.7: xe (1,3) quay phải, nút (1,0) xa phía trên mở cửa (2,3) trước mặt; dưới xe là hốc (1,4). Qua cửa tới (3,3), dịch xuống làn dưới (3,4) rồi đi tiếp tới cờ (5,4).
  var SAN_B7 = ['#N#####', '#.#####', '#.#####', '#.C.###', '#.#..F#', '#######'];
  // be-sung.8: xe (1,3) quay phải, ngay trước mũi là thùng (2,3), sau thùng là cửa đóng (3,3) rồi ô đích (5,3), sau ô đích còn một ô (6,3). Nút (1,0) xa phía trên mở cửa;
  //   dưới xe là hốc (1,4). Không bệ súng: cú giật hất thùng trượt quá ô đích vào góc (6,3).
  var SAN_B8 = ['#N######', '#.######', '#.######', '#.HC.D.#', '#.######', '########'];
  // be-sung.9: xe ở ngã tư (3,3) quay lên. Nút trên (3,0) mở cửa phải (4,3); nút phải (6,3) mở cửa dưới (3,4); nút dưới (3,6) mở cửa trái (2,3); cờ (1,3).
  //   Không bệ súng: phát thứ ba (bắn xuống) giật xe lên (3,2).
  var SAN_B9 = ['###N###', '###.###', '###.###', '#FC.C.N', '###C###', '###.###', '###N###'];
  // be-sung.10: ba hành lang trạm như be-sung.6 (ba trạm liền nhau (2..4, 3), nút xa phía trên, hốc phía dưới, hai cửa nối tiếp (5,3), (6,3) ở cuối). Nút đang bật mỗi sân một chỗ:
  //   sân 1 trạm đầu, sân 2 trạm giữa, sân 3 trạm cuối; sau cửa, cờ xa dần (sân 1 sát cửa, sân 3 cách hai ô).
  var SAN_B10 = [
    ['##NNN####', '##...####', '##...####', '#....CCF#', '##...####', '#########'],
    ['##NNN#####', '##...#####', '##...#####', '#....CC.F#', '##...#####', '##########'],
    ['##NNN######', '##...######', '##...######', '#....CC..F#', '##...######', '###########']
  ];

  // che-be-sung.2: hành lang (1..6, 2) sang phải, thùng (2,2) trước mũi xe, hai cửa (3,2), (5,2), ô đích (6,2). Hai trạm (1,2), (3,2): nút xa phía DƯỚI ((1,5), (3,5)),
  //   hốc phía trên ((1,1), (3,1)). Nút (1,5) mở cửa (3,2), nút (3,5) mở cửa (5,2).
  var SAN_C2 = ['########', '#.#.####', '#.HC.CD#', '#.#.####', '#.#.####', '#N#N####', '########'];
  // che-be-sung.3: ba trạm (1,3), (3,3), (5,3), nút xa phía trên, hốc phía dưới, cửa ngay sau mỗi trạm (2,3), (4,3), (6,3); cờ (7,3).
  var SAN_C3 = ['#N#N#N###', '#.#.#.###', '#.#.#.###', '#.C.C.CF#', '#.#.#.###', '#########'];
  // che-be-sung.4: be-sung.6 lật trên dưới: hành lang (1..7, 2), ba trạm liền nhau (2..4, 2), nút xa phía DƯỚI ((2,5), (3,5), (4,5)), hốc phía trên.
  //   Nút (2,5), (3,5) TẮT mở hai cửa (5,2), (6,2); nút (4,5) ĐANG BẬT. Cờ (7,2).
  var SAN_C4 = ['#########', '##...####', '#....CCF#', '##...####', '##...####', '##NNN####', '#########'];
  // che-be-sung.5: bốn trạm liền nhau (2..5, 3), nút xa phía trên, hốc phía dưới, ba cửa nối tiếp (6..8, 3), cờ (9,3). Nút (3,0) ĐANG BẬT; (2,0), (4,0), (5,0) TẮT.
  var SAN_C5 = ['##NNNN#####', '##....#####', '##....#####', '#.....CCCF#', '##....#####', '###########'];
  // che-be-sung.6: hành lang gấp khúc. Đoạn đầu (1..4, 4) sang phải, hai trạm (2,4), (3,4) có nút xa phía trên ((2,1) TẮT, (3,1) ĐANG BẬT), hốc phía dưới.
  //   Đoạn sau (4, 4..10) đi xuống, ba trạm (4,4), (4,5), (4,6) có nút xa bên trái xe (phía đông: (7,4), (7,5) TẮT, (7,6) ĐANG BẬT), hốc phía tây.
  //   Ba nút tắt mở ba cửa nối tiếp (4,7), (4,8), (4,9); cờ (4,10).
  // che-be-sung.7: hành lang (1..11, 3) sang phải, ba cửa (3,3), (7,3), (10,3) xa gần khác nhau; trước mỗi cửa là một trạm ((2,3), (6,3), (9,3)) có nút xa phía trên
  //   mở đúng cánh cửa đó, hốc phía dưới. Cờ (11,3).
  var SAN_C7 = ['##N###N##N###', '##.###.##.###', '##.###.##.###', '#..C...C..CF#', '##.###.##.###', '#############'];
  // che-be-sung.8: hành lang (4..10, 4) sang phải, hai ngõ cụt đi lên: ngõ 1 (4, 3..2) sâu 2 ô, ngõ 2 (8, 3..1) sâu 3 ô. Ở đáy mỗi ngõ, nút xa bên trái ((1,2), (5,1))
  //   mở một cánh cửa của hành lang ((6,4), (9,4)); bên phải đáy ngõ là hốc ((5,2), (9,1)). Cờ (10,4).
  var SAN_C8 = ['############', '#####N....##', '#N....##.###', '####.###.###', '####..C..CF#', '############'];
  // che-be-sung.9: thùng (3,3) trên hành lang, hai cửa nối tiếp (5,3), (6,3), ô đích (7,3). Trạm (3,3), (4,3) có nút xa phía trên ((3,0), (4,0)) mở cửa (5,3), (6,3); hốc phía dưới.
  var SAN_C9 = ['###NN####', '###..####', '###..####', '#..H.CCD#', '###..####', '#########'];
  var SAN_C6 = ['#########', '##NN#####', '##..#####', '##..#####', '#......N#', '##.....N#', '###....N#', '####C####', '####C####', '####C####', '####F####', '#########'];
  // che-be-sung.10 (trùm, HAI sân, MỘT chương trình): dây chuyền đi sang phải, xe (1,3). Đoạn 1: hai trạm liền nhau (2,3), (3,3), nút xa phía trên, hốc phía dưới: nút TẮT mở cửa
  //   ngay sau trạm (4,3); nút ĐANG BẬT mỗi sân một chỗ (sân 1 trạm đầu, sân 2 trạm sau). Đoạn 2: cửa thứ hai XA GẦN KHÁC NHAU ((6,3) / (8,3)), trước cửa là trạm có nút xa phía trên
  //   mở nó (go_fire). Đoạn 3: hành lang tới sát cửa cuối; ngay trước cửa, một ngõ cụt đi lên SÂU KHÁC NHAU (2 / 3 ô); ở đáy ngõ, nút xa bên trái mở cửa cuối, bên phải đáy là hốc (visit).
  //   Sau cửa cuối là cờ. Hai sân đủ nhỏ để bộ dò dãy chung (do-duong-be-sung.mjs) chạy hết trong giới hạn trạng thái.
  var SAN_C10 = [
    ['##NN#N######', '##..#.N...##', '##..#.##.###', '#...C.C..CF#', '##..#.######', '############'],
    ['##NN###N#N...##', '##..###.###.###', '##..###.###.###', '#...C...C...CF#', '##..###.#######', '###############']
  ];
  /* ------------------------------------------------------------- chương trình */

  var L_B1 = ['shoot()', 'wait()', 'tr_right()', 'forward(3)'];
  var L_B2 = ['shoot_back()', 'wait()', 'tr_right()', 'forward(2)'];
  var L_B3 = FOR(2, ['shoot()', 'wait()', 'tr_right()']).concat(['forward(2)']);
  var L_B4 = ['shoot()', 'wait()', 'tr_right()', 'move()', 'tr_right()', 'forward(2)', 'tr_right()', 'move()'];
  var L_B5 = ['move()'].concat(FOR(2, ['tr_left()', 'fire("charge")', 'tr_right()', 'forward(2)']));
  var C_B6 = ['move()'].concat(FOR(3, ['check()', 'move()']), ['forward(2)']);
  var T_B6 = ['tr_left()'].concat(IF('not warm()', ['fire("charge")']), ['tr_right()']);
  var BAT_TU = IF('not warm()', ['fire("charge")']);                      // nút chưa nóng thì bắn tụ cho bật (bệ súng: không giật)
  var L_B7 = ['tr_left()', 'fire("charge")', 'tr_right()', 'forward(2)', 'sidestep()', 'forward(2)'];
  var M_B7 = ['turn_left()', 'fire("charge")', 'move()', 'turn_right()', 'forward(2)', 'sidestep()', 'forward(2)'];
  var L_B8 = ['tr_left()', 'fire("charge")', 'tr_right()', 'forward(3)'];
  var L_B9 = FOR(3, ['fire("charge")', 'tr_right()']).concat(['forward(2)']);
  var L_B10 = ['move()'].concat(FOR(3, T_B6.concat(['move()'])), ['go_to_wall()']);
  var T_BL = ['tr_left()', 'fire("charge")', 'tr_right()'];               // blast_left(): quay trái, bắn tụ, quay lại
  var T_BR = ['tr_right()', 'fire("charge")', 'tr_left()'];               // blast_right()
  var C_C1 = ['move()'].concat(FOR(2, ['blast_left()', 'forward(2)']));
  var C_C2 = FOR(2, ['blast_right()', 'forward(2)']);
  var C_C3 = FOR(3, ['left_shot()', 'forward(2)']);
  var T_LO = IF('not warm()', ['fire("charge")']);                         // lock_on(): nút chưa nóng thì bắn tụ
  var T_LL = ['tr_left()', 'lock_on()', 'tr_right()'];                     // lock_left()
  var C_C4 = ['move()'].concat(FOR(3, ['tr_right()', 'lock_on()', 'tr_left()', 'move()']), ['forward(2)']);
  var C_C5 = ['move()'].concat(FOR(4, ['lock_left()', 'move()']), ['forward(3)']);
  var C_C6 = ['move()', 'lock_row(2)', 'tr_right()', 'lock_row(3)', 'forward(3)'];
  var T_LR = FOR('n', ['lock_left()', 'move()']);                          // lock_row(n)
  var T_GF = ['go_to_wall()', 'blast_left()'];                             // go_fire()
  var C_C7 = FOR(3, ['go_fire()']).concat(['go_to_wall()']);
  var T_VI = ['d = distance()', 'forward(d)', 'blast_left()'].concat(FOR('d', ['back()']));   // visit(): vào ngõ cụt, bắn, lùi ra đúng chừng ấy ô
  var C_C8 = ['tr_left()', 'visit()', 'tr_right()', 'forward(4)', 'tr_left()', 'visit()', 'tr_right()', 'forward(2)'];
  var T_PB = ['push(1)', 'blast_left()'];                                  // push_blast()
  var C_C9 = FOR(2, ['push_blast()']).concat(['push(2)']);
  var L_C10 = ['move()', 'lock_row(2)', 'go_fire()', 'go_to_wall()', 'tr_left()', 'visit()', 'tr_right()', 'go_to_wall()'];   // trùm che-be-sung.10: ba hàm của em nối nhau

  var DS = [
    /* ================================================================ chương be-sung: xích bắn tụ không giật */
    man({
      chuong: 'be-sung', so: 1, ten: 'Bệ vòi không giật', yMoi: 'beSung: xích gắn vòi phun bắn tụ thì xe đứng yên, không giật lùi',
      kieuBai: 'sua-thua', hamCuaEmCan: ['tr_right', 'forward', 'move'],
      deBai: 'Xe hai bánh bắn tụ thì giật lùi một ô, nên Sola quen thêm move() sau mỗi phát để quay về chỗ cũ. Xe xích của em đã gắn vòi phun thành BỆ VÒI: ' +
        'xích bám chắc, bắn tụ không giật. Bắn nút cuối hành lang cho cửa bên phải mở, rồi rẽ phải tới cờ.',
      veMaMau: 'Chương trình của Sola có thêm move() sau phát bắn. Chạy thử: xe xích có giật không? Bỏ dòng thừa.',
      san: SAN_B1, batDau: { x: 1, y: 3, huong: 0 },
      maMau: bai(['shoot()', 'wait()', 'move()', 'tr_right()', 'forward(3)']),
      sao: { o: 12, nhip: 6 },
      loiGiai: bai(L_B1),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# bệ vòi: bắn tụ không giật'].concat(L_B1)) },
      loiSai: [
        { moTa: 'Để nguyên move() của Sola: xe không giật nên tiến lên quá chỗ rẽ', baiLam: bai(['shoot()', 'wait()', 'move()', 'tr_right()', 'forward(3)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Rẽ trước khi bắn: vòi phun chĩa vào cửa, nút không đổi', baiLam: bai(['tr_right()', 'shoot()', 'wait()', 'forward(3)']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Bệ vòi xích: bắn tụ xong xe vẫn ở đúng chỗ cũ.', 'shoot(), wait(), rồi rẽ phải và đi ba ô.']
    }),

    man({
      chuong: 'be-sung', so: 2, ten: 'Nút sau lưng', yMoi: 'shoot_back() trên bệ vòi: bắn ra sau, xe không giật tới',
      kieuBai: 'ban-sau', hamCuaEmCan: ['tr_right', 'forward', 'move', 'back'],
      deBai: 'Nút nằm ở đầu kia hành lang, ngay sau lưng xe; cánh cửa nó mở nằm ngay dưới xe. Bắn ra sau bằng shoot_back(). Xe hai bánh bắn ra sau thì giật TỚI một ô, ' +
        'còn bệ vòi xích thì đứng yên. Mở cửa rồi rẽ phải đi xuống tới cờ.',
      veMaMau: 'Sola viết cho xe hai bánh: bắn ra sau rồi back() để lùi về chỗ cũ. Trên bệ vòi, dòng back() làm xe lệch khỏi cửa.',
      san: SAN_B2, batDau: { x: 4, y: 1, huong: 1 },
      maMau: bai(['shoot_back()', 'wait()', 'back()', 'tr_right()', 'forward(2)']),
      sao: { o: 12, nhip: 5 },
      loiGiai: bai(L_B2),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# bắn ra sau, bệ vòi không trôi tới'].concat(L_B2)) },
      loiSai: [
        { moTa: 'Để nguyên back() của Sola: xe lùi khỏi chỗ đứng trên cửa, đi xuống đâm tường', baiLam: bai(['shoot_back()', 'wait()', 'back()', 'tr_right()', 'forward(2)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Bắn ra trước bằng shoot(): tia nước trúng tường cuối hành lang, nút không đổi', baiLam: bai(['shoot()', 'wait()', 'tr_right()', 'forward(2)']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['shoot_back() bắn ra sau đuôi xe; bệ vòi giữ xe đứng yên.', 'Bắn, rồi rẽ phải và đi hai ô.']
    }),

    man({
      chuong: 'be-sung', so: 3, ten: 'Hai phát một chỗ', yMoi: 'bắn tụ hai phát liền từ cùng một ô: quay giữa hai phát, xe không xê dịch',
      kieuBai: 'mo-cua', hamCuaEmCan: ['tr_right', 'tr_left', 'spin', 'forward', 'move'],
      deBai: 'Hai nút ở xa: nút trên mở cánh cửa bên phải xe, nút bên phải (sau cánh cửa đó) mở cánh cửa dưới xe. Đứng yên một chỗ mà bắn cả hai: bắn, quay phải, bắn, quay phải, ' +
        'rồi đi xuống tới cờ. Bệ vòi không giật nên phát sau vẫn bắn từ đúng chỗ phát trước.',
      veMaMau: 'Chương trình có sẵn mới bắn một phát. Dùng vòng lặp cho hai lần "bắn rồi quay phải".',
      san: SAN_B3, batDau: { x: 2, y: 3, huong: 0 }, noi: [noi(2, 0, [[3, 3]]), noi(5, 3, [[2, 4]])],
      maMau: bai(['shoot()', 'wait()', 'tr_right()', 'tr_right()', 'forward(2)']),
      sao: { o: 13, nhip: 8 },
      loiGiai: bai(L_B3),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# hai phát, không xê dịch'].concat(L_B3)) },
      loiSai: [
        { moTa: 'Bắn nút bên phải trước: cửa bên phải còn đóng, tia nước dừng ở cửa', baiLam: bai(['tr_right()', 'shoot()', 'wait()', 'tr_left()', 'shoot()', 'wait()', 'spin()', 'forward(2)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên quay sau phát thứ hai: xe tiến vào hành lang bên phải', baiLam: bai(['shoot()', 'wait()', 'tr_right()', 'shoot()', 'wait()', 'forward(2)']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Phát trên mở cửa bên phải, nên phát bên phải phải bắn sau.', 'for i in range(2): bắn, wait(), tr_right(); rồi forward(2).']
    }),

    /* ------------------------------------------------ hàng 2: luyện */
    man({
      chuong: 'be-sung', so: 4, ten: 'Thùng nằm yên', yMoi: 'cú giật hất thùng sau lưng đi xa; bệ vòi giữ thùng nằm yên',
      kieuBai: 'thung', hamCuaEmCan: ['tr_right', 'tr_left', 'spin', 'forward', 'move'],
      deBai: 'Ngay sau lưng xe là một thùng nặng, dưới thùng là lá cờ. Nhớ gói Vòi phun: bắn tụ thì cú giật hất thùng sau lưng trượt đi tới khi gặp vật cản. ' +
        'Bắn nút phía trên cho cửa bên phải mở, rồi đi vòng qua cửa xuống tới cờ. Bệ vòi giữ thùng nằm yên nên cờ vẫn trống.',
      veMaMau: 'Chương trình có sẵn bắn rồi mới đi được nửa đường. Viết tiếp đoạn vòng xuống cờ.',
      san: SAN_B4, batDau: { x: 2, y: 2, huong: 0 },
      maMau: bai(['shoot()', 'wait()', 'tr_right()', 'move()']),
      sao: { o: 16, nhip: 11 },
      loiGiai: bai(L_B4),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# bệ vòi giữ thùng nằm yên'].concat(L_B4)) },
      loiSai: [
        { moTa: 'Quay lại đẩy thùng xuống cờ: thùng vướng cờ, ô sau cờ là tường', baiLam: bai(['shoot()', 'wait()', 'spin()', 'move()', 'move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Rẽ phải lần cuối thay vì rẽ phải: xe quay sai hướng, đâm tường', baiLam: bai(['shoot()', 'wait()', 'tr_right()', 'move()', 'tr_right()', 'forward(2)', 'tr_left()', 'move()']), phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['Thùng không cần dời: chỉ cần nó đừng trượt lên cờ.', 'Bắn, rẽ phải, đi một ô, rẽ phải, đi hai ô, rẽ phải, đi một ô.']
    }),

    man({
      chuong: 'be-sung', so: 5, ten: 'Hành lang có hốc', yMoi: 'bắn tụ fire("charge") ở nhiều trạm; dưới trạm là hốc mà bệ vòi không giật xuống',
      kieuBai: 'hanh-lang', hamCuaEmCan: ['tr_left', 'tr_right', 'fire', 'forward', 'move'], lucBan: true,
      deBai: 'Hành lang có hai trạm. Ở mỗi trạm, nút ở cuối cái giếng phía trên, cách xa: bắn nhanh không tới, phải bắn tụ. Nút mở cánh cửa ngay sau trạm. ' +
        'Dưới mỗi trạm là một cái hốc: xe hai bánh bắn lên thì giật tụt xuống hốc. Bệ vòi xích thì không. Đi tới cờ.',
      veMaMau: 'Chương trình có sẵn bắn nhanh fire("fast"): tia nước rơi giữa giếng. Đổi lực bắn.',
      san: SAN_B5, batDau: { x: 1, y: 3, huong: 1 }, noi: [noi(2, 0, [[3, 3]]), noi(4, 0, [[5, 3]])],
      maMau: bai(['move()'].concat(FOR(2, ['tr_left()', 'fire("fast")', 'tr_right()', 'forward(2)']))),
      sao: { o: 19, nhip: 15 },
      loiGiai: bai(L_B5),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# bắn tụ, bệ vòi không tụt xuống hốc'].concat(L_B5)) },
      loiSai: [
        { moTa: 'Để nguyên bắn nhanh: nút cách ba ô, tia nước rơi giữa giếng', baiLam: bai(['move()'].concat(FOR(2, ['tr_left()', 'fire("fast")', 'tr_right()', 'forward(2)']))), phaiCoMa: ['ban-ngan', 'chua-toi-co'] },
        { moTa: 'Quên quay lại sau khi bắn: xe đi lên giếng', baiLam: bai(['move()'].concat(FOR(2, ['tr_left()', 'fire("charge")', 'forward(2)']))), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Nút cách ba ô: bắn nhanh chỉ bay hai ô.', 'Thân vòng lặp: tr_left(), fire("charge"), tr_right(), forward(2).']
    }),

    man({
      chuong: 'be-sung', so: 6, ten: 'Trạm nào còn tắt', yMoi: 'hàm của màn đọc warm(): nút đang bật thì khỏi bắn; chương trình chính khóa',
      kieuBai: 'doc-nhiet', mat: true, chinhCoDinh: true, hamCuaEmCan: ['tr_left', 'tr_right', 'fire', 'forward', 'move'], lucBan: true,
      deBai: 'Ba trạm liền nhau, mỗi trạm một nút xa phía trên. Mỗi nút tắt mở một trong hai cánh cửa cuối hành lang; nút đang bật (quầng đỏ) không mở gì, bắn nó chỉ tắt nó và phí một nhịp. ' +
        'Xe đã gắn mắt hồng ngoại đo nhiệt. Chương trình chính đã khóa, ở mỗi trạm gọi check(). Sửa thân check(): quay lên, nút chưa nóng thì bắn tụ, quay lại.',
      veMaMau: 'Chương trình chính bị khóa. check() có sẵn quay lên bắn nhanh: tia nước không tới nút.',
      san: SAN_B6, batDau: { x: 1, y: 3, huong: 1 }, noi: [noi(3, 0, [[5, 3]]), noi(4, 0, [[6, 3]])], nutBat: [o(2, 0)],
      maMau: bai(C_B6, [H('check', [], ['tr_left()', 'fire("fast")', 'tr_right()'])]),
      sao: { o: 22, nhip: 20 },
      loiGiai: bai(C_B6, [H('check', [], T_B6)]),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(C_B6, [H('check', [], ['# nút chưa nóng thì bắn tụ'].concat(T_B6))]) },
      congThucKhac: [{ moTa: 'Bắn mọi nút không đo: vẫn tới cờ nhưng tắt nút đang bật, phí một nhịp', baiLam: bai(C_B6, [H('check', [], ['tr_left()', 'fire("charge")', 'tr_right()'])]) }],
      loiSai: [
        { moTa: 'Để nguyên bắn nhanh: tia nước rơi giữa giếng', baiLam: bai(C_B6, [H('check', [], ['tr_left()', 'fire("fast")', 'tr_right()'])]), phaiCoMa: ['ban-ngan', 'chua-toi-co'] },
        { moTa: 'Viết if warm(): chỉ tắt nút đang bật, hai nút tắt vẫn tắt', baiLam: bai(C_B6, [H('check', [], ['tr_left()'].concat(IF('warm()', ['fire("charge")']), ['tr_right()']))]), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đo trước khi quay lên: mắt hồng ngoại nhìn dọc hành lang', baiLam: bai(C_B6, [H('check', [], IF('not warm()', ['fire("charge")']).concat(['tr_left()', 'tr_right()']))]), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['warm() là True khi nút trước mũi xe đang bật.', 'Thân check(): tr_left(), if not warm(): fire("charge"), tr_right().']
    }),

    /* ------------------------------------------------ hàng 3: biến thể */
    man({
      chuong: 'be-sung', so: 7, ten: 'Đố: Sola quay nửa vòng', yMoi: 'tìm lỗi: turn_left() của xe hai bánh chỉ quay nửa vòng trên xích, move() bù giật là thừa',
      kieuBai: 'do', lucBan: true, hamCuaEmCan: ['tr_left', 'tr_right', 'turn_left', 'turn_right', 'fire', 'forward', 'sidestep', 'move'],
      deBai: 'Sola chép chương trình của xe hai bánh sang xe xích: turn_left() để quay lên bắn nút xa, move() để về chỗ cũ sau cú giật. Chạy thử: tia nước bay vào cửa, xe đâm cửa. Vì sao? ' +
        'Xích quay chậm: turn_left() chỉ quay nửa vòng, nhịp sau làm việc khác là mất. Còn bệ vòi thì không giật. Sửa để xe qua cửa, dịch xuống làn dưới rồi tới cờ.',
      veMaMau: 'Chạy thử chương trình của Sola. Phát bắn bay về hướng nào?',
      san: SAN_B7, batDau: { x: 1, y: 3, huong: 1 }, noi: [noi(1, 0, [[2, 3]])],
      maMau: bai(M_B7),
      sao: { o: 22, nhip: 14 },
      loiGiai: bai(L_B7),
      loiGiaiKhac: { moTa: 'Cùng cách sửa, thêm một dòng chú thích', baiLam: bai(['# xích: tr_left() hai nhịp, bệ vòi: không bù giật'].concat(L_B7)) },
      loiSai: [
        { moTa: 'Để nguyên bản của Sola: nửa vòng quay bị mất, tia nước bay vào cửa', baiLam: bai(M_B7), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Chỉ sửa turn_left() thành tr_left(), còn giữ move() bù giật: xe tiến lên giếng', baiLam: bai(['tr_left()', 'fire("charge")', 'move()', 'tr_right()', 'forward(2)', 'sidestep()', 'forward(2)']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Trên xích, quay đủ một góc vuông cần tr_left() hay tr_right(): hai nhịp liền.', 'Bệ vòi không giật nên bỏ move() sau phát bắn.']
    }),

    man({
      chuong: 'be-sung', so: 8, ten: 'Đẩy thùng qua cửa', yMoi: 'bắn mở cửa rồi xích đẩy thùng qua cửa vào ô đích',
      kieuBai: 'day-thung', mucTieu: 'day-thung', lucBan: true, hamCuaEmCan: ['tr_left', 'tr_right', 'fire', 'forward', 'move'],
      deBai: 'Ngay trước mũi xe là thùng nặng, sau thùng là cánh cửa đóng, ô đích nằm sau cửa. Nhớ gói Đẩy thùng: xích tiến vào thùng thì đẩy thùng đi một ô, nhưng cửa đóng thì thùng không qua. ' +
        'Nút mở cửa ở xa phía trên, dưới xe là hốc. Bắn mở cửa trước, rồi đẩy thùng vào ô đích.',
      veMaMau: 'Chương trình có sẵn đẩy ngay: thùng vướng cửa đóng.',
      san: SAN_B8, batDau: { x: 1, y: 3, huong: 1 }, noi: [noi(1, 0, [[3, 3]])],
      maMau: bai(['forward(3)']),
      sao: { o: 17, nhip: 8 },
      loiGiai: bai(L_B8),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# mở cửa trước, đẩy thùng sau'].concat(L_B8)) },
      loiSai: [
        { moTa: 'Đẩy ngay khi cửa còn đóng: thùng không qua được', baiLam: bai(['forward(3)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Đẩy thiếu một ô: thùng nằm trước ô đích', baiLam: bai(['tr_left()', 'fire("charge")', 'tr_right()', 'forward(2)']), phaiCoMa: ['chua-day-thung'] }
      ],
      goiY: ['Cửa đóng chặn cả thùng: bắn mở cửa trước.', 'Thùng cách ô đích ba ô.']
    }),

    man({
      chuong: 'be-sung', so: 9, ten: 'Ba phát quanh mình', yMoi: 'ba phát tụ liền từ ngã tư: mỗi phát mở cửa cho phát sau',
      kieuBai: 'mo-cua', lucBan: true, hamCuaEmCan: ['tr_right', 'tr_left', 'fire', 'forward', 'move'],
      deBai: 'Xe đứng giữa ngã tư, bốn phía là bốn hành lang. Nút trên mở cửa bên phải, nút bên phải mở cửa phía dưới, nút dưới mở cửa bên trái, cờ ở bên trái. ' +
        'Đứng yên giữa ngã tư mà bắn đủ ba nút, rồi đi tới cờ. Nhớ: cửa đóng chặn cả tia nước.',
      veMaMau: 'Chương trình có sẵn bắn một phát rồi đi. Lặp "bắn rồi quay phải" mấy lần?',
      san: SAN_B9, batDau: { x: 3, y: 3, huong: 0 }, noi: [noi(3, 0, [[4, 3]]), noi(6, 3, [[3, 4]]), noi(3, 6, [[2, 3]])],
      maMau: bai(['fire("charge")', 'tr_left()', 'forward(2)']),
      sao: { o: 14, nhip: 11 },
      loiGiai: bai(L_B9),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# ba phát, mỗi phát mở cửa cho phát sau'].concat(L_B9)) },
      loiSai: [
        { moTa: 'Quay trái thay vì quay phải: tia nước thứ hai dừng ở cửa trái còn đóng', baiLam: bai(FOR(3, ['fire("charge")', 'tr_left()']).concat(['forward(2)'])), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Chỉ bắn hai phát: cửa trái còn đóng', baiLam: bai(FOR(2, ['fire("charge")', 'tr_right()']).concat(['tr_right()', 'forward(2)'])), phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['Thứ tự: trên, phải, dưới; mỗi lần quay phải.', 'for i in range(3): fire("charge"), tr_right(); rồi forward(2).']
    }),

    /* ------------------------------------------------ trùm */
    man({
      chuong: 'be-sung', so: 10, ten: 'Trùm: Ba hành lang trạm', yMoi: 'một chương trình cho ba hành lang: đo nhiệt từng trạm, bắn tụ nút còn tắt, go_to_wall() tới cờ',
      hang: 'trum', kieuBai: 'trum', mat: true, lucBan: true, hamCuaEmCan: ['tr_left', 'tr_right', 'fire', 'go_to_wall', 'forward', 'move'],
      huyHieu: { ma: 'be-sung', ten: 'Huy hiệu Bệ vòi xích' },
      deBai: 'Ba hành lang, một chương trình. Hành lang nào cũng có ba trạm liền nhau với nút xa phía trên và hốc phía dưới, cuối hành lang là hai cánh cửa nối tiếp. ' +
        'Nút đang bật mỗi sân nằm một chỗ, cờ sau cửa cũng xa gần khác nhau. Ở mỗi trạm: quay lên, nút chưa nóng thì bắn tụ, quay lại, tiến. Qua cửa thì đi tới sát tường.',
      veMaMau: 'Chương trình có sẵn bắn mọi nút rồi đi hai ô: tắt mất nút đang bật, và sân 2, sân 3 chưa tới cờ.',
      san: SAN_B10, batDau: [{ x: 1, y: 3, huong: 1 }, { x: 1, y: 3, huong: 1 }, { x: 1, y: 3, huong: 1 }],
      noi: [[noi(3, 0, [[5, 3]]), noi(4, 0, [[6, 3]])], [noi(2, 0, [[5, 3]]), noi(4, 0, [[6, 3]])], [noi(2, 0, [[5, 3]]), noi(3, 0, [[6, 3]])]],
      nutBat: [[o(2, 0)], [o(3, 0)], [o(4, 0)]],
      maMau: bai(['move()'].concat(FOR(3, ['tr_left()', 'fire("charge")', 'tr_right()', 'move()']), ['forward(2)'])),
      sao: { o: 21, nhip: 63 },
      loiGiai: bai(L_B10),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# đo nhiệt từng trạm, bắn tụ nút còn tắt'].concat(L_B10)) },
      congThucKhac: [{ moTa: 'Bắn mọi nút không đo: vẫn tới cờ nhưng mỗi sân tắt một nút đang bật, phí ba nhịp', baiLam: bai(['move()'].concat(FOR(3, ['tr_left()', 'fire("charge")', 'tr_right()', 'move()']), ['go_to_wall()'])) }],
      loiSai: [
        { moTa: 'Đi hai ô sau cửa như sân 1: sân 2, sân 3 chưa tới cờ', baiLam: bai(['move()'].concat(FOR(3, T_B6.concat(['move()'])), ['forward(2)'])), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Bắn nhanh: nút cách ba ô, tia nước rơi giữa giếng', baiLam: bai(['move()'].concat(FOR(3, ['tr_left()'].concat(IF('not warm()', ['fire("fast")']), ['tr_right()', 'move()'])), ['go_to_wall()'])), phaiCoMa: ['ban-ngan', 'chua-toi-co'] },
        { moTa: 'Viết if warm(): bắn nút đang bật, bỏ nút tắt', baiLam: bai(['move()'].concat(FOR(3, ['tr_left()'].concat(IF('warm()', ['fire("charge")']), ['tr_right()', 'move()'])), ['go_to_wall()'])), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Thân vòng lặp như hàm check() của màn Trạm nào còn tắt, thêm move().', 'Sau vòng lặp, go_to_wall() đưa xe qua hai cửa đã mở tới cờ.']
    }),

    /* ================================================================ chương che-be-sung: Hàm bệ súng */
    man({
      chuong: 'che-be-sung', so: 1, ten: 'Hàm blast_left()', yMoi: 'chế hàm cho bệ vòi: quay trái, bắn tụ, quay lại',
      kieuBai: 'hanh-lang', lucBan: true, chinhCoDinh: true, taoHam: ['blast_left'], hamCuaEmCan: ['tr_left', 'tr_right', 'fire', 'forward', 'move'],
      deBai: 'Em chế hàm blast_left() cho bệ vòi: quay trái, bắn tụ nút bên trái, quay lại. Bệ vòi không giật nên quay lại là xe đúng chỗ cũ, đi tiếp được ngay. ' +
        'Hàm này sẽ theo em suốt chương. Chương trình chính đã khóa: tiến một ô, rồi hai lần blast_left() và forward(2), dọc hành lang có hốc của màn trước.',
      veMaMau: 'Chương trình chính bị khóa. Mở Xưởng hàm, tạo blast_left() ba dòng.',
      san: SAN_B5, batDau: { x: 1, y: 3, huong: 1 }, noi: [noi(2, 0, [[3, 3]]), noi(4, 0, [[5, 3]])],
      maMau: bai(C_C1),
      sao: { o: 20, nhip: 15 },
      loiGiai: { chinh: C_C1.slice(), hamCuaEmMoi: [H('blast_left', [], T_BL)] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: bai(C_C1), hamCuaEmMoi: [H('blast_left', [], ['# quay trái, bắn tụ, quay lại'].concat(T_BL))] },
      loiSai: [
        { moTa: 'Bắn nhanh trong hàm: nút cách ba ô, tia nước rơi giữa giếng', baiLam: bai(C_C1), hamCuaEmMoi: [H('blast_left', [], ['tr_left()', 'fire("fast")', 'tr_right()'])], phaiCoMa: ['ban-ngan', 'chua-toi-co'] },
        { moTa: 'Quên quay lại: xe đi lên giếng', baiLam: bai(C_C1), hamCuaEmMoi: [H('blast_left', [], ['tr_left()', 'fire("charge")'])], phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Thân hàm ba dòng: tr_left(), fire("charge"), tr_right().', 'Bệ vòi không giật: không cần dòng nào bù cú giật.']
    }),

    man({
      chuong: 'che-be-sung', so: 2, ten: 'Hàm blast_right()', yMoi: 'hàm đối xứng blast_right(); bắn mở cửa rồi đẩy thùng qua cửa',
      kieuBai: 'day-thung', mucTieu: 'day-thung', lucBan: true, chinhCoDinh: true, taoHam: ['blast_right'], hamCuaEmCan: ['blast_left', 'tr_left', 'tr_right', 'fire', 'forward', 'move'],
      deBai: 'Thùng nặng nằm trước mũi xe, sau thùng là hai cánh cửa đóng rồi ô đích. Nút của mỗi cửa ở xa phía dưới, bên phải xe; phía trên là hốc. ' +
        'Em chế blast_right(): quay phải, bắn tụ, quay lại. Chương trình chính đã khóa: hai lần blast_right() rồi forward(2) đẩy thùng qua cửa vừa mở.',
      veMaMau: 'Chương trình chính bị khóa. Tạo blast_right() ba dòng.',
      san: SAN_C2, batDau: { x: 1, y: 2, huong: 1 }, noi: [noi(1, 5, [[3, 2]]), noi(3, 5, [[5, 2]])],
      maMau: bai(C_C2),
      sao: { o: 19, nhip: 14 },
      loiGiai: { chinh: C_C2.slice(), hamCuaEmMoi: [H('blast_right', [], T_BR)] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: bai(C_C2), hamCuaEmMoi: [H('blast_right', [], ['# quay phải, bắn tụ, quay lại'].concat(T_BR))] },
      loiSai: [
        { moTa: 'Gọi blast_left(): bắn vào hốc phía trên, cửa vẫn đóng', baiLam: bai(C_C2), hamCuaEmMoi: [H('blast_right', [], ['blast_left()'])], phaiCoMa: ['chua-day-thung'] },
        { moTa: 'Quay lại sai phía: tr_right() hai lần, xe quay ngược hành lang', baiLam: bai(C_C2), hamCuaEmMoi: [H('blast_right', [], ['tr_right()', 'fire("charge")', 'tr_right()'])], phaiCoMa: ['chua-day-thung'] }
      ],
      goiY: ['blast_right() giống blast_left() nhưng quay về bên phải.', 'Cửa đóng chặn thùng: bắn trước, đẩy sau.']
    }),

    man({
      chuong: 'che-be-sung', so: 3, ten: 'Sửa hàm left_shot()', yMoi: 'sửa hàm lỗi: turn_left() chỉ quay nửa vòng trên xích, đổi thành tr_left()',
      kieuBai: 'sua-ham', lucBan: true, chinhCoDinh: true, hamCuaEmCan: ['blast_left', 'tr_left', 'tr_right', 'turn_left', 'turn_right', 'fire', 'forward', 'move'],
      deBai: 'Sola chế left_shot() để bắn nút bên trái ở mỗi trạm, nhưng chép thói quen xe hai bánh: turn_left() rồi turn_right(). Trên xích, mỗi lệnh đó chỉ quay nửa vòng, ' +
        'nhịp sau làm việc khác là mất. Chương trình chính đã khóa: ba lần left_shot() rồi forward(2). Chạy thử rồi sửa hàm.',
      veMaMau: 'Chạy thử. Tia nước bay về hướng nào?',
      san: SAN_C3, batDau: { x: 1, y: 3, huong: 1 }, noi: [noi(1, 0, [[2, 3]]), noi(3, 0, [[4, 3]]), noi(5, 0, [[6, 3]])],
      maMau: bai(C_C3, [H('left_shot', [], ['turn_left()', 'fire("charge")', 'turn_right()'])]),
      sao: { o: 19, nhip: 21 },
      loiGiai: bai(C_C3, [H('left_shot', [], T_BL)]),
      loiGiaiKhac: { moTa: 'Cùng cách sửa, thêm một dòng chú thích trong hàm', baiLam: bai(C_C3, [H('left_shot', [], ['# xích quay đủ góc vuông bằng tr_left()'].concat(T_BL))]) },
      congThucKhac: [{ moTa: 'Gọi blast_left() của em trong left_shot()', baiLam: bai(C_C3, [H('left_shot', [], ['blast_left()'])]) }],
      loiSai: [
        { moTa: 'Để nguyên bản của Sola: nửa vòng quay bị mất, tia nước bay vào cửa trước mặt', baiLam: bai(C_C3, [H('left_shot', [], ['turn_left()', 'fire("charge")', 'turn_right()'])]), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Chỉ sửa turn_left(): còn turn_right() quay nửa vòng, xe đi lên giếng', baiLam: bai(C_C3, [H('left_shot', [], ['tr_left()', 'fire("charge")', 'turn_right()'])]), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Xích quay đủ một góc vuông bằng tr_left() hay tr_right().', 'Đổi cả turn_left() và turn_right().']
    }),

    /* ------------------------------------------------ hàng 2: luyện */
    man({
      chuong: 'che-be-sung', so: 4, ten: 'Hàm lock_on()', yMoi: 'chế hàm đọc warm() cho bệ vòi: nút chưa nóng thì bắn tụ',
      kieuBai: 'doc-nhiet', mat: true, lucBan: true, chinhCoDinh: true, taoHam: ['lock_on'], hamCuaEmCan: ['switch_on', 'tr_left', 'tr_right', 'fire', 'forward', 'move'],
      deBai: 'Ba trạm liền nhau, nút ở xa phía dưới. Hai nút tắt mở hai cánh cửa cuối hành lang, nút còn lại đang bật. Em chế lock_on(): mắt hồng ngoại đo nút trước mũi xe, ' +
        'chưa nóng thì bắn TỤ. switch_on() của gói Đo nhiệt bắn nhanh, không tới nút xa; bệ vòi bắn tụ không giật nên tụ là đủ. Chương trình chính đã khóa.',
      veMaMau: 'Chương trình chính bị khóa. Tạo lock_on() hai dòng.',
      san: SAN_C4, batDau: { x: 1, y: 2, huong: 1 }, noi: [noi(2, 5, [[5, 2]]), noi(3, 5, [[6, 2]])], nutBat: [o(4, 5)],
      maMau: bai(C_C4),
      sao: { o: 22, nhip: 20 },
      loiGiai: { chinh: C_C4.slice(), hamCuaEmMoi: [H('lock_on', [], T_LO)] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: bai(C_C4), hamCuaEmMoi: [H('lock_on', [], ['# chưa nóng thì bắn tụ'].concat(T_LO))] },
      congThucKhac: [{ moTa: 'Viết if warm(): pass, else: fire("charge")', baiLam: bai(C_C4), hamCuaEmMoi: [H('lock_on', [], IF('warm()', ['pass'], ['fire("charge")']))] }],
      loiSai: [
        { moTa: 'Gọi switch_on(): bắn nhanh, nút cách ba ô, tia nước rơi giữa giếng', baiLam: bai(C_C4), hamCuaEmMoi: [H('lock_on', [], ['switch_on()'])], phaiCoMa: ['ban-ngan', 'chua-toi-co'] },
        { moTa: 'Viết if warm(): tắt nút đang bật, hai nút tắt vẫn tắt', baiLam: bai(C_C4), hamCuaEmMoi: [H('lock_on', [], IF('warm()', ['fire("charge")']))], phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Như switch_on() nhưng bắn tụ.', 'if not warm(): rồi thụt vào fire("charge").']
    }),

    man({
      chuong: 'che-be-sung', so: 5, ten: 'Hàm lock_left()', yMoi: 'hàm gọi hàm đọc warm(): quay trái, lock_on(), quay lại',
      kieuBai: 'hanh-lang', mat: true, lucBan: true, chinhCoDinh: true, taoHam: ['lock_left'], hamCuaEmCan: ['lock_on', 'blast_left', 'switch_on', 'tr_left', 'tr_right', 'fire', 'forward', 'move'],
      deBai: 'Bốn trạm liền nhau, nút xa phía trên, hốc phía dưới; ba nút tắt mở ba cánh cửa cuối hành lang, một nút đang bật. Em chế lock_left(): quay trái, gọi lock_on() của em, quay lại. ' +
        'Chương trình chính đã khóa: bốn lần lock_left() rồi tiến.',
      veMaMau: 'Chương trình chính bị khóa. Tạo lock_left() ba dòng.',
      san: SAN_C5, batDau: { x: 1, y: 3, huong: 1 }, noi: [noi(2, 0, [[6, 3]]), noi(4, 0, [[7, 3]]), noi(5, 0, [[8, 3]])], nutBat: [o(3, 0)],
      maMau: bai(C_C5),
      sao: { o: 23, nhip: 27 },
      loiGiai: { chinh: C_C5.slice(), hamCuaEmMoi: [H('lock_left', [], T_LL)] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: bai(C_C5), hamCuaEmMoi: [H('lock_left', [], ['# quay trái, bật nút nếu còn tắt, quay lại'].concat(T_LL))] },
      congThucKhac: [
        { moTa: 'Viết thẳng if not warm(): trong lock_left() thay cho gọi lock_on()', baiLam: bai(C_C5), hamCuaEmMoi: [H('lock_left', [], ['tr_left()'].concat(T_LO, ['tr_right()']))] },
        { moTa: 'Gọi blast_left(): vẫn tới cờ nhưng tắt nút đang bật, phí một nhịp', baiLam: bai(C_C5), hamCuaEmMoi: [H('lock_left', [], ['blast_left()'])] }
      ],
      loiSai: [
        { moTa: 'Gọi switch_on() thay cho lock_on(): bắn nhanh, tia nước rơi giữa giếng', baiLam: bai(C_C5), hamCuaEmMoi: [H('lock_left', [], ['tr_left()', 'switch_on()', 'tr_right()'])], phaiCoMa: ['ban-ngan', 'chua-toi-co'] },
        { moTa: 'Quên quay lại: xe đi lên giếng', baiLam: bai(C_C5), hamCuaEmMoi: [H('lock_left', [], ['tr_left()', 'lock_on()'])], phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Hàm của em gọi được hàm của em khác: lock_on() làm ở màn trước.', 'tr_left(), lock_on(), tr_right().']
    }),

    man({
      chuong: 'che-be-sung', so: 6, ten: 'Hàm lock_row(n)', yMoi: 'hàm có tham số n: n lần lock_left() rồi tiến; hành lang gấp khúc',
      kieuBai: 'tham-so', mat: true, lucBan: true, chinhCoDinh: true, taoHam: ['lock_row'], hamCuaEmCan: ['lock_left', 'lock_on', 'blast_left', 'switch_left', 'switch_on', 'turn_left', 'turn_right', 'tr_left', 'tr_right', 'fire', 'forward', 'move'],
      deBai: 'Hành lang gấp khúc: đoạn đầu hai trạm, đoạn sau đi xuống ba trạm; nút nào cũng ở xa bên trái xe. Ba nút tắt mở ba cánh cửa cuối đường. ' +
        'Em chế lock_row(n): n lần lock_left() rồi tiến. Chương trình chính đã khóa: lock_row(2), rẽ phải, lock_row(3), rồi đi qua cửa.',
      veMaMau: 'Chương trình chính bị khóa. Tạo lock_row(n) với for i in range(n): trong thân.',
      san: SAN_C6, batDau: { x: 1, y: 4, huong: 1 }, noi: [noi(2, 1, [[4, 7]]), noi(7, 4, [[4, 8]]), noi(7, 5, [[4, 9]])], nutBat: [o(3, 1), o(7, 6)],
      maMau: bai(C_C6),
      sao: { o: 26, nhip: 34 },
      loiGiai: { chinh: C_C6.slice(), hamCuaEmMoi: [H('lock_row', ['n'], T_LR)] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: bai(C_C6), hamCuaEmMoi: [H('lock_row', ['n'], ['# n trạm, trạm nào cũng đo bên trái'].concat(T_LR))] },
      congThucKhac: [{ moTa: 'Bắn mọi nút bằng blast_left(): vẫn tới cờ nhưng tắt hai nút đang bật, phí hai nhịp', baiLam: bai(C_C6), hamCuaEmMoi: [H('lock_row', ['n'], FOR('n', ['blast_left()', 'move()']))] }],
      loiSai: [
        { moTa: 'Gọi switch_left() của xe hai bánh: turn_left() chỉ quay nửa vòng trên xích', baiLam: bai(C_C6), hamCuaEmMoi: [H('lock_row', ['n'], FOR('n', ['switch_left()', 'move()']))], phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên move() trong vòng lặp: xe đo n lần cùng một nút', baiLam: bai(C_C6), hamCuaEmMoi: [H('lock_row', ['n'], FOR('n', ['lock_left()']))], phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['lock_row(2) thì n là 2, lock_row(3) thì n là 3.', 'for i in range(n): lock_left(), move().']
    }),

    /* ------------------------------------------------ hàng 3: biến thể */
    man({
      chuong: 'che-be-sung', so: 7, ten: 'Hàm go_fire()', yMoi: 'hàm gọi hàm cảm biến: go_to_wall() tới sát cửa đóng, rồi blast_left() mở nó',
      kieuBai: 'cam-bien-xa', mat: true, lucBan: true, chinhCoDinh: true, taoHam: ['go_fire'], hamCuaEmCan: ['go_to_wall', 'blast_left', 'tr_left', 'tr_right', 'fire', 'forward', 'move'],
      deBai: 'Ba cánh cửa đóng trên hành lang, xa gần khác nhau. Trước mỗi cửa là một trạm: nút xa phía trên mở đúng cánh cửa đó, phía dưới là hốc. Mắt hồng ngoại coi cửa đóng là vật cản, ' +
        'nên go_to_wall() dừng ngay trước cửa. Em chế go_fire(): go_to_wall() rồi blast_left(). Chương trình chính đã khóa: ba lần go_fire(), rồi go_to_wall() tới cờ.',
      veMaMau: 'Chương trình chính bị khóa. Tạo go_fire() hai dòng.',
      san: SAN_C7, batDau: { x: 1, y: 3, huong: 1 }, noi: [noi(2, 0, [[3, 3]]), noi(6, 0, [[7, 3]]), noi(9, 0, [[10, 3]])],
      maMau: bai(C_C7),
      sao: { o: 21, nhip: 25 },
      loiGiai: { chinh: C_C7.slice(), hamCuaEmMoi: [H('go_fire', [], T_GF)] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: bai(C_C7), hamCuaEmMoi: [H('go_fire', [], ['# tới sát cửa, bắn nút mở cửa'].concat(T_GF))] },
      loiSai: [
        { moTa: 'Đi cứng forward(3): trạm đầu chỉ cách một ô, trạm sau cách bốn ô', baiLam: bai(C_C7), hamCuaEmMoi: [H('go_fire', [], ['forward(3)', 'blast_left()'])], phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Bắn trước rồi mới đi: phát đầu bắn từ chỗ xuất phát, trúng tường', baiLam: bai(C_C7), hamCuaEmMoi: [H('go_fire', [], ['blast_left()', 'go_to_wall()'])], phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['go_to_wall() của gói Hồng ngoại dừng khi phía trước là vật cản, kể cả cửa đóng.', 'go_to_wall(), rồi blast_left().']
    }),

    man({
      chuong: 'che-be-sung', so: 8, ten: 'Hàm visit()', yMoi: 'biến d = distance(): vào ngõ cụt d ô, bắn, lùi ra đúng d ô; bệ vòi giữ số đo đúng',
      kieuBai: 'bien', mat: true, lucBan: true, chinhCoDinh: true, taoHam: ['visit'], hamCuaEmCan: ['blast_left', 'go_to_wall', 'tr_left', 'tr_right', 'fire', 'forward', 'back', 'move'],
      deBai: 'Hai ngõ cụt đi lên từ hành lang, sâu nông khác nhau. Ở đáy mỗi ngõ, nút xa bên trái mở một cánh cửa của hành lang. Em chế visit(): đo d = distance() tới đáy ngõ, ' +
        'đi vào d ô, blast_left(), rồi lùi ra đúng d ô. Bệ vòi không giật nên lùi d ô là về đúng cửa ngõ. Chương trình chính đã khóa.',
      veMaMau: 'Chương trình chính bị khóa. Tạo visit() với biến d.',
      san: SAN_C8, batDau: { x: 4, y: 4, huong: 1 }, noi: [noi(1, 2, [[6, 4]]), noi(5, 1, [[9, 4]])],
      maMau: bai(C_C8),
      sao: { o: 32, nhip: 34 },
      loiGiai: { chinh: C_C8.slice(), hamCuaEmMoi: [H('visit', [], T_VI)] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: bai(C_C8), hamCuaEmMoi: [H('visit', [], ['# đo ngõ, vào, bắn, lùi ra đúng chừng ấy'].concat(T_VI))] },
      loiSai: [
        { moTa: 'Lùi ra bằng go_to_wall() sau khi quay đầu: thiếu dòng quay, xe đâm đáy ngõ', baiLam: bai(C_C8), hamCuaEmMoi: [H('visit', [], ['go_to_wall()', 'blast_left()', 'go_to_wall()'])], phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đi vào và lùi ra cứng hai ô: ngõ thứ hai sâu ba ô', baiLam: bai(C_C8), hamCuaEmMoi: [H('visit', [], ['forward(2)', 'blast_left()', 'back()', 'back()'])], phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Đo trước khi đi: d = distance() ở cửa ngõ.', 'forward(d), blast_left(), rồi for i in range(d): back().']
    }),

    man({
      chuong: 'che-be-sung', so: 9, ten: 'Hàm push_blast()', yMoi: 'đẩy thùng rồi bắn tại chỗ: push(1) rồi blast_left()',
      kieuBai: 'day-thung', mucTieu: 'day-thung', mat: true, lucBan: true, chinhCoDinh: true, taoHam: ['push_blast'], hamCuaEmCan: ['push', 'blast_left', 'tr_left', 'tr_right', 'fire', 'forward', 'move'],
      deBai: 'Thùng nặng trên hành lang, sau thùng là hai cánh cửa đóng rồi ô đích. Mỗi lần đẩy thùng tới sát một cửa, xe đứng đúng trạm có nút mở cửa đó (xa phía trên, phía dưới là hốc). ' +
        'Em chế push_blast(): push(1) của gói Đẩy thùng (tới sát thùng rồi đẩy một ô), rồi blast_left(). Chương trình chính đã khóa: hai lần push_blast(), rồi push(2).',
      veMaMau: 'Chương trình chính bị khóa. Tạo push_blast() hai dòng.',
      san: SAN_C9, batDau: { x: 1, y: 3, huong: 1 }, noi: [noi(3, 0, [[5, 3]]), noi(4, 0, [[6, 3]])],
      maMau: bai(C_C9),
      sao: { o: 22, nhip: 15 },
      loiGiai: { chinh: C_C9.slice(), hamCuaEmMoi: [H('push_blast', [], T_PB)] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: bai(C_C9), hamCuaEmMoi: [H('push_blast', [], ['# đẩy thùng một ô, bắn mở cửa trước thùng'].concat(T_PB))] },
      loiSai: [
        { moTa: 'Bắn trước rồi mới đẩy: phát đầu bắn từ chỗ xuất phát, trúng tường', baiLam: bai(C_C9), hamCuaEmMoi: [H('push_blast', [], ['blast_left()', 'push(1)'])], phaiCoMa: ['chua-day-thung'] },
        { moTa: 'Quên blast_left(): cửa không mở, thùng vướng cửa đóng, không tới ô đích', baiLam: bai(C_C9), hamCuaEmMoi: [H('push_blast', [], ['push(1)'])], phaiCoMa: ['chua-day-thung'] }
      ],
      goiY: ['push(1) đo distance() tới thùng, đi tới sát rồi đẩy một ô.', 'push(1), rồi blast_left().']
    }),

    /* ------------------------------------------------ trùm */
    man({
      chuong: 'che-be-sung', so: 10, ten: 'Trùm: Hai dây chuyền', yMoi: 'một chương trình nối ba hàm của em: lock_row(2), go_fire(), visit(); hai dây chuyền khác nút bật, khoảng cách cửa, độ sâu ngõ',
      hang: 'trum', kieuBai: 'trum', mat: true, lucBan: true,
      hamCuaEmCan: ['lock_row', 'lock_left', 'lock_on', 'go_fire', 'visit', 'blast_left', 'go_to_wall', 'tr_left', 'tr_right', 'fire', 'forward', 'back', 'move'],
      huyHieu: { ma: 'che-be-sung', ten: 'Huy hiệu Hàm bệ vòi' },
      deBai: 'Hai dây chuyền, một chương trình, toàn hàm của em. Đoạn đầu: hai trạm liền nhau, nút xa phía trên, nút nào tắt thì mở cửa ngay sau trạm, nút đang bật mỗi sân một chỗ. ' +
        'Đoạn giữa: một cánh cửa xa gần khác nhau, trước cửa là trạm có nút mở nó. Đoạn cuối: ngay trước cửa cuối là ngõ cụt đi lên, sâu khác nhau; nút ở đáy ngõ, phía bên trái, mở cửa cuối. ' +
        'Sau cửa, cờ ở cuối hành lang. Nối lock_row(2), go_fire() và visit() cho đúng chỗ.',
      veMaMau: 'Chương trình có sẵn qua hai cửa đầu rồi đứng trước cửa cuối: nút mở nó nằm dưới đáy ngõ cụt phía trên xe.',
      san: SAN_C10, batDau: [{ x: 1, y: 3, huong: 1 }, { x: 1, y: 3, huong: 1 }],
      noi: [
        [noi(3, 0, [[4, 3]]), noi(5, 0, [[6, 3]]), noi(6, 1, [[9, 3]])],
        [noi(2, 0, [[4, 3]]), noi(7, 0, [[8, 3]]), noi(9, 0, [[12, 3]])]
      ],
      nutBat: [[o(2, 0)], [o(3, 0)]],
      maMau: bai(['move()', 'lock_row(2)', 'go_fire()', 'go_to_wall()']),
      sao: { o: 44, nhip: 77 },
      loiGiai: bai(L_C10),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# ba hàm của em nối nhau: trạm, cửa xa, ngõ cụt'].concat(L_C10)) },
      congThucKhac: [
        { moTa: 'Bắn mọi nút đoạn đầu bằng blast_left(): vẫn tới cờ nhưng tắt nút đang bật, phí nhịp', baiLam: bai(['move()'].concat(FOR(2, ['blast_left()', 'move()']), ['go_fire()', 'go_to_wall()', 'tr_left()', 'visit()', 'tr_right()', 'go_to_wall()'])) },
        { moTa: 'Viết thẳng go_to_wall() rồi blast_left() thay cho go_fire()', baiLam: bai(['move()', 'lock_row(2)', 'go_to_wall()', 'blast_left()', 'go_to_wall()', 'tr_left()', 'visit()', 'tr_right()', 'go_to_wall()']) }
      ],
      loiSai: [
        { moTa: 'Đi cứng forward(1) tới trạm cửa giữa như sân 1: sân 2 trạm xa hơn, bắn trúng tường', baiLam: bai(['move()', 'lock_row(2)', 'forward(1)', 'blast_left()', 'go_to_wall()', 'tr_left()', 'visit()', 'tr_right()', 'go_to_wall()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên tr_right() sau visit(): xe còn quay lên, go_to_wall() đi vào ngõ cụt', baiLam: bai(['move()', 'lock_row(2)', 'go_fire()', 'go_to_wall()', 'tr_left()', 'visit()', 'go_to_wall()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Thiếu move() đầu: lock_row(2) đo ngay chỗ xuất phát, trạm sau bị bỏ, cửa đầu không mở', baiLam: bai(['lock_row(2)', 'go_fire()', 'go_to_wall()', 'tr_left()', 'visit()', 'tr_right()', 'go_to_wall()']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Ba đoạn, ba hàm: lock_row(2) cho hai trạm đầu, go_fire() cho cửa giữa, visit() cho ngõ cụt.', 'Sau go_fire() xe còn đứng ở trạm: go_to_wall() tới miệng ngõ, quay lên, visit(), quay lại, go_to_wall() tới cờ.']
    })
  ];

  ManHoc.manBeSung = DS;
  if (laNode) module.exports = ManHoc;
})();
