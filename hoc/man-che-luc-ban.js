/* ============================================================================
   man-che-luc-ban.js — "Robot Chấn Hưng": NGÂN HÀNG MÀN MỚI của mùa 2, gói 6 "Lực phun" (KE-HOACH-MUA-2.md).
   Khung mùa 2 (lo-trinh-hoc.js, khối "MÙA 2 = 10 GÓI", mảng MUA_2) đã chừa chỗ: tệp đã có trong danh sách require của lo-trinh-hoc.js và
   thẻ <script> của game/choi.html. Gói sau CHỈ việc thêm màn vào mảng DS dưới đây; màn tự hiện đúng chương, đúng gói.
     - `che-luc-ban` (mã che-luc-ban.1 … che-luc-ban.10): chương 2 "Hàm lực phun" (chương 1 là luc-ban có sẵn, man-luc-ban.js)
   Mỗi màn khai `chuong` (một trong các mã trên) và `so` (1, 2, …: thứ tự trong phần màn mới của chương); mã `ma` = chuong + '.' + so là khóa lưu sao,
   KHÔNG đổi sau khi xuất bản. Gọi ManHoc.chuanHoa(m) như các tệp màn khác. Chương còn trống thì chưa hiện; gói chưa có chương nào có màn thì chưa hiện.
   Ràng buộc mùa 2 (hoc/kiem-lo-trinh.mjs): robot chỉ dùng part mùa 1 + xích + súng hơi (+ hồng ngoại khi lõi có); không bậc thang S, hố u, gầm n;
   biến chỉ từ gói 1 chương 2, hàm có tham số chỉ từ gói 2 chương 2 (tham-so); hàm của em cần phải được tạo ở màn đứng trước.
   Tệp này KHÔNG tự thêm màn vào ManHoc: danh sách nằm ở ManHoc.manCheLucBan, lo-trinh-hoc.js thêm vào chương rồi xếp chỗ (so, hang do dungChuong đặt).

   NỘI DUNG (27/10; PDM2b 31/10 đổi sang XE CỨU HỎA R1: thân XÍCH + VÒI PHUN + MẮT HỒNG NGOẠI, robot { than: 'xich', tay: 'hoi', camBien: [hong-ngoai] }), mọi màn lucBan: true.
   Xích quay hai nhịp (tr_left / tr_right), quay đầu spin() bốn nhịp; băng chuyền không đẩy xích nên màn 5 đổi băng thành cửa; sao đo lại. Trước: xe hai bánh (turn_left / u_turn).
   Đi tiếp chương luc-ban (squirt(p), squirt_back(p), smart_spray() đọc distance() > 0): phun nhẹ "low" bay TỐI ĐA 2 Ô, không giật; phun mạnh "high" bay tới vật cản, xe giật một ô
   (luật ở san-hoc.js, mục LỰC PHUN). Mắt hồng ngoại đếm được số ô trống tới nút: distance() là 0 hay 1 thì phun nhẹ tới, từ 2 trở lên phải phun mạnh.
   Nên điều kiện đúng là distance() > 1 (không phải > 2: nút cách 3 ô có distance() = 2, phun nhẹ rơi giữa đường; cũng không phải > 0 như smart_spray:
   nút cách 2 ô thì smart_spray phun mạnh, xe giật lùi).
   Màn chọn lực bằng cảm biến đều KHÓA chương trình chính và gọi hàm ở nhiều chỗ xa gần khác nhau (hay trùm nhiều sân): thân hàm cố định không thắng được.
   MỘT SÂN mỗi màn (luật lộ trình: nhiều sân chỉ ở trùm). kiem-che-luc-ban.mjs + do-duong-che-luc-ban.mjs kiểm.
   Không beSung (gói 9), không warm() (gói 7).
   GHÉP NHỊP (14/11, KE-HOACH-GHEP-NHIP.md mục 2; lộ trình bật ghiXich cả chương, phunKhiChay từ màn 6):
     5  chương trình chính gọi brace_spray() (ghì xích, hàm của em luc-ban.9) ở van B.
     6  TRÌNH DIỄN vừa chạy vừa phun (chiChay): spray() + left_move() + right_move() trước một wait() = xe đi một ô rồi phun nhẹ từ ô mới. Thay "Hàm close_spray()" (hàm close_spray đã bỏ).
     9  MÀN ÉP vừa chạy vừa phun "Đố: nhịp bị tách": hàm của màn spray_go() bị một wait() tách hai nhịp; hai cửa nhịp chỉ mở đúng một nhịp nên tách nhịp là thua. Thay "Đố: lực bị viết cứng".
     10 trùm: van cuối hành lang mở bằng brace_spray().
   Màn 1–4, 7, 8 (chọn lực bằng distance()) KHÔNG ghép: sân các màn này dùng cú giật làm bước đi (phun mạnh thì xe sang làn bên); ghì xích ở đó phá ý chọn lực.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var HAM_GOC = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'spray', 'spray_back', 'distance'];

  /** Thụt mọi dòng vào một bậc (4 dấu cách). */
  function thut(ds) { return ds.map(function (s) { return '    ' + s; }); }
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  function FOR(n, than, bien) { return ['for ' + (bien || 'i') + ' in range(' + n + '):'].concat(thut(than)); }
  function IF(dk, co, khong) { return ['if ' + dk + ':'].concat(thut(co), khong ? ['else:'].concat(thut(khong)) : []); }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function bai(chinh, hamCuaMan) { return { chinh: chinh.slice(), hamCuaMan: (hamCuaMan || []).slice() }; }

  // thân các hàm (cách chuẩn)
  var T_AIM = IF('distance() > 1', ['squirt("high")'], ['squirt("low")']);
  var AIM = function () { return H('auto_spray', [], T_AIM); };
  var T_AIM_LEFT = ['tr_left()', 'auto_spray()', 'tr_right()'];

  /** Điền trường chung: xe xích, vòi phun, mắt hồng ngoại; mọi màn chọn được lực phun. */
  function man(m) {
    m.chuong = 'che-luc-ban';
    m.cauTruc = ['for', 'if', 'while'];
    m.loaiRobot = 'xich';
    m.robot = { than: 'xich', tay: 'hoi', camBien: [{ ma: 'hong-ngoai', o: 'tren' }] };
    m.hamGoc = HAM_GOC;
    m.lucBan = true;
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    if (!m.mucTieu) m.mucTieu = 'toi-co';
    if (Array.isArray(m.san[0])) m.nhipTheo = 'tong';
    return ManHoc.chuanHoa(m);
  }

  /* ------------------------------------------------------------------- sân */

  // 1: xe (3,4) quay lên, nút xa (3,1) có distance() = 2: phun mạnh, xe giật xuống (3,5). Quay phải: nút gần (5,5) có distance() = 1, thùng (2,5) sau lưng.
  //    Cửa (3,6) theo nút gần, cửa (3,7) theo nút xa, xe mờ (3,8) quay xuống, thùng phải nằm yên.
  var SAN_1 = ['#######', '###N###', '###.###', '###.###', '###.###', '#.H..N#', '###C###', '###C###', '###.###', '#######'];
  var NOI_1 = [{ nut: { x: 5, y: 5 }, cua: [{ x: 3, y: 6 }] }, { nut: { x: 3, y: 1 }, cua: [{ x: 3, y: 7 }] }];
  // 2: xe (1,4) quay phải. Trạm 1: nút trên (1,1), distance() = 2: phun mạnh, xe giật xuống làn dưới (1,5). Trạm 2 (2,5) là cửa của nút 1:
  //    nút trên (2,3), distance() = 1: phun nhẹ (phun mạnh thì xe giật xuống hốc (2,6)). Nút 2 mở cửa (3,5), xe mờ (4,5) quay phải.
  var SAN_2 = ['#######', '#N#####', '#.#####', '#.N####', '#..####', '#.CC.##', '##.####', '#######'];
  var NOI_2 = [{ nut: { x: 1, y: 1 }, cua: [{ x: 2, y: 5 }] }, { nut: { x: 2, y: 3 }, cua: [{ x: 3, y: 5 }] }];
  // 3: xe (3,5) quay trái: nút gần (1,5), distance() = 1, thùng (4,5) sau lưng. Quay trái (mặt xuống): nút xa (3,8), distance() = 2, phun mạnh thì xe giật lên (3,4).
  //    Cửa (3,3) theo nút gần, cửa (3,2) theo nút xa; xe mờ (3,0) quay phải, thùng nằm yên. Hàm quick_pick() của Sola so với 2.
  var SAN_3 = ['###.###', '###.###', '###C###', '###C###', '###.###', '#N..H.#', '###.###', '###.###', '###N###', '#######'];
  var NOI_3 = [{ nut: { x: 1, y: 5 }, cua: [{ x: 3, y: 3 }] }, { nut: { x: 3, y: 8 }, cua: [{ x: 3, y: 2 }] }];
  // 4: xe (1,3) quay phải, nút ở bên PHẢI (phía dưới). Trạm 1: nút (1,6), distance() = 2: phun mạnh, xe giật lên làn trên (1,2). Trạm 2 (2,2), trạm 3 (3,2):
  //    nút (2,4), (3,4) có distance() = 1: phun nhẹ (phun mạnh thì xe giật lên hốc). Mỗi nút mở cửa kế tiếp trên làn trên, xe mờ (5,2) quay phải.
  var SAN_4 = ['#######', '##..###', '#.CCC.#', '#...###', '#.NN###', '#.#####', '#N#####', '#######'];
  var NOI_4 = [{ nut: { x: 1, y: 6 }, cua: [{ x: 2, y: 2 }] }, { nut: { x: 2, y: 4 }, cua: [{ x: 3, y: 2 }] }, { nut: { x: 3, y: 4 }, cua: [{ x: 4, y: 2 }] }];
  // 5: xe (2,3) quay phải, trước mặt là cửa (3,3) chắn hành lang rồi nút B (7,3). Nút A (2,1) bên trái, distance() = 1, mở cửa (3,3) (dưới xe là hốc (2,4)).
  //    Phun mạnh nút B (tia bay qua cửa đã mở): xe giật lùi về (1,3). Cuối hành lang, nút C (6,0) bên trái có distance() = 2: phun mạnh, xe giật xuống (6,4). B mở cửa (6,5), C mở cửa (6,6), cờ (6,7).
  //    PDM2b 31/10: trước là bốn ô băng chuyền chạy ngược mà A tắt; xích không bị băng đẩy nên băng thành cửa.
  var SAN_5 = ['######N##', '##N###.##', '##.###.##', '#..C...N#', '##.###.##', '######C##', '######C##', '######F##', '#########'];
  var NOI_5 = [{ nut: { x: 2, y: 1 }, cua: [{ x: 3, y: 3 }] }, { nut: { x: 7, y: 3 }, cua: [{ x: 6, y: 5 }] }, { nut: { x: 6, y: 0 }, cua: [{ x: 6, y: 6 }] }];
  // 6 (14/11, trình diễn VỪA CHẠY VỪA PHUN, KE-HOACH-GHEP-NHIP.md mục 2b; thay "Hàm close_spray()"): đường xoắn ba đoạn, cuối mỗi đoạn là một van cách đầu đoạn 3 ô
  //    (phun nhẹ đứng yên chỉ bay 2 ô). Xe (1,5) quay phải: chạy sang (2,5) và phun cùng nhịp trúng van (4,5), mở cửa (3,6); tiến tới (3,5), quay phải.
  //    Đoạn 2 đi xuống qua cửa (3,6), van (3,8) mở cửa (2,7) và (1,6); đoạn 3 sang trái qua cửa (2,7), van (0,7) mở cửa (1,4). Rồi đi lên sáu ô qua (1,6), (1,4) tới cờ (1,1).
  //    Cửa (1,4) và (1,6) kẹp ô xuất phát: không qua đủ ba van thì không có đường tắt lên cờ.
  var SAN_6 = ['######', '#F####', '#.####', '#.####', '#C####', '#...N#', '#C#C##', 'N.C.##', '###N##', '######'];
  var NOI_6 = [{ nut: { x: 4, y: 5 }, cua: [{ x: 3, y: 6 }] }, { nut: { x: 3, y: 8 }, cua: [{ x: 2, y: 7 }, { x: 1, y: 6 }] }, { nut: { x: 0, y: 7 }, cua: [{ x: 1, y: 4 }] }];
  // 7: hai hành lang nối nhau, nút bên TRÁI đường đi. Hành lang 1 (đi sang phải): trạm (1,3) nút (1,0) xa: phun mạnh, xe giật xuống (1,4); trạm (2,4) nút (2,2) gần.
  //    Rẽ phải (đi xuống): trạm (3,4) nút (5,4) gần; trạm (3,5) nút (6,5) xa: phun mạnh, xe giật sang trái (2,5). Xe mờ (2,6) quay xuống. Mỗi nút mở một cửa kế tiếp.
  var SAN_7 = ['#N######', '#.######', '#.N#####', '#..#####', '#.CC.N##', '##.C..N#', '##C#####', '########'];
  var NOI_7 = [{ nut: { x: 1, y: 0 }, cua: [{ x: 2, y: 4 }] }, { nut: { x: 2, y: 2 }, cua: [{ x: 3, y: 4 }] }, { nut: { x: 5, y: 4 }, cua: [{ x: 3, y: 5 }] }, { nut: { x: 6, y: 5 }, cua: [{ x: 2, y: 6 }] }];
  // 8 (luật giật một ô, 29/10): xe (3,3) quay lên, thùng (3,4) ngay sau lưng. Nút trên (3,0) xa: phun mạnh, cú giật đẩy thùng sau lưng nhích xuống (3,5), xe theo vào (3,4).
  //    Quay trái: nút (1,4) gần, thùng (4,4) giờ ở sau lưng: phun nhẹ cho thùng nằm yên (phun mạnh thì nó bị đẩy sang (5,4)). Quay trái (mặt xuống): xe mờ (3,4) quay xuống.
  //    (2,3), (4,3) và (3,6) trống để thân auto_turn cố định (không mắt hồng ngoại: phun mạnh cả hai lần, hay quay rồi phun ra sau) giật lệch chỗ xe mờ / đẩy thùng quá ô thùng mờ.
  var SAN_8 = ['###N###', '###.###', '###.###', '##...##', '#N.HH.#', '###.###', '###.###', '#######'];
  var BM_8 = { x: 3, y: 4, huong: 2, thung: [{ x: 4, y: 4 }, { x: 3, y: 5 }] };          // sau hai lần auto_turn xe ở (3,4) quay xuống (30/10: bỏ hai back() thừa)
  // 9 (14/11, màn ÉP vừa chạy vừa phun; thay "Đố: lực bị viết cứng"): xe (1,1) quay phải, van 1 (4,1) cách 3 ô mở cửa (2,2); quay xuống, van 2 (2,4) cách 3 ô mở cửa (3,2) sang cờ (8,2).
  //    Trước mỗi van là một cửa NHỊP chỉ mở đúng MỘT nhịp: (3,1) mở nhịp 1, (2,3) mở nhịp 4 (đúng lúc lời giải phun), rồi đóng hẳn. Đứng yên phun nhẹ thì tia rơi ngay ô cửa nhịp;
  //    chạy rồi nhịp sau mới phun thì cửa nhịp đã đóng; chỉ chạy + phun MỘT nhịp (xe sang ô kế, tia từ ô mới bay 2 ô) mới trúng van.
  //    Chương trình chính khóa: ghì xích phun mạnh cũng trúng van 1 nhưng xe còn ở (1,1), quay xuống là tường. 12 nhịp (mốc đường cong cho do-nhiet.2, 18 nhịp).
  var SAN_9 = ['##########', '#..cN#####', '##CC....F#', '##c#######', '##N#######', '##########'];
  var NOI_9 = [{ nut: { x: 4, y: 1 }, cua: [{ x: 2, y: 2 }] }, { nut: { x: 2, y: 4 }, cua: [{ x: 3, y: 2 }] }];
  var NHIP_9 = [{ x: 3, y: 1, mo: 1, dong: 60, pha: 0 }, { x: 2, y: 3, mo: 1, dong: 60, pha: 58 }];
  // 10: ba sân, xe (1,3) quay phải. Ba trạm nút bên trái, mỗi sân đúng MỘT nút xa (phun mạnh, xe giật xuống làn dưới) ở trạm khác nhau; mỗi nút mở cửa trạm kế.
  //     Cuối hành lang làn dưới là nút sát tường cách xa gần khác nhau: ghì xích phun mạnh (14/11; trước: tới sát rồi phun nhẹ) mở cửa phía dưới, tới tường, rẽ phải đi xuống cờ.
  var SAN_10 = [
    ['#N######', '#.######', '#.NN####', '#...####', '#.CCC.N#', '#####C##', '#####F##', '########'],
    ['##N######', '#N.######', '#..N#####', '#.C.#####', '##.CC..N#', '######C##', '######.##', '######F##', '#########'],
    ['###N###', '#NN.###', '#...###', '#.CC###', '###.CN#', '####C##', '####F##', '#######']
  ];
  var BD_10 = [{ x: 1, y: 3, huong: 1 }, { x: 1, y: 3, huong: 1 }, { x: 1, y: 3, huong: 1 }];
  var NOI_10 = [
    [{ nut: { x: 1, y: 0 }, cua: [{ x: 2, y: 4 }] }, { nut: { x: 2, y: 2 }, cua: [{ x: 3, y: 4 }] }, { nut: { x: 3, y: 2 }, cua: [{ x: 4, y: 4 }] }, { nut: { x: 6, y: 4 }, cua: [{ x: 5, y: 5 }] }],
    [{ nut: { x: 1, y: 1 }, cua: [{ x: 2, y: 3 }] }, { nut: { x: 2, y: 0 }, cua: [{ x: 3, y: 4 }] }, { nut: { x: 3, y: 2 }, cua: [{ x: 4, y: 4 }] }, { nut: { x: 7, y: 4 }, cua: [{ x: 6, y: 5 }] }],
    [{ nut: { x: 1, y: 1 }, cua: [{ x: 2, y: 3 }] }, { nut: { x: 2, y: 1 }, cua: [{ x: 3, y: 3 }] }, { nut: { x: 3, y: 0 }, cua: [{ x: 4, y: 4 }] }, { nut: { x: 5, y: 4 }, cua: [{ x: 4, y: 5 }] }]
  ];

  /* ------------------------------------------------------------- chương trình */

  var C_1 = ['auto_spray()', 'tr_right()', 'auto_spray()', 'tr_right()', 'forward(3)'];
  var C_2 = ['auto_left()', 'move()', 'auto_left()', 'forward(2)'];

  var C_3 = ['quick_pick()', 'tr_left()', 'quick_pick()', 'spin()', 'forward(4)', 'tr_right()'];
  var C_4 = FOR(3, ['auto_right()', 'move()']).concat(['move()']);
  var C_5 = ['squirt_left("low")', 'brace_spray()', 'forward(4)', 'squirt_left("high")', 'tr_right()', 'forward(3)'];   // 14/11: van B ghì xích (brace_spray, luc-ban.9) nên xe không lùi, forward(4)
  var T_FIRE_LEFT = ['tr_left()', 'squirt(p)', 'tr_right()'];

  var CHAY_PHUN = ['spray()', 'left_move()', 'right_move()', 'wait()'];                  // một nhịp vừa chạy vừa phun: phun nhẹ + hai xích tiến
  var L_6 = FOR(3, CHAY_PHUN.concat(['move()', 'tr_right()'])).concat(['forward(6)']);
  var C_7 = ['scan_left()', 'tr_right()', 'scan_left()'];
  var C_8 = ['back()', 'back()', 'auto_turn()', 'auto_turn()'];               // luật giật một ô: xe theo thùng xuống một ô. PDM2b 31/10: xe xuất phát (3,1), lùi hai ô tới sát thùng (đường cong nhịp xích: màn 9 lên 12 nhịp)
  var C_9 = ['spray_go()', 'tr_right()', 'spray_go()', 'tr_left()', 'forward(6)'];
  var T_GO_CU = ['spray()', 'wait()', 'left_move()', 'right_move()', 'wait()'];             // Sola tách thành hai nhịp: phun đứng yên (tia rơi), rồi mới chạy

  // 14/11: van cuối hành lang xa gần khác nhau: brace_spray() ghì xích phun mạnh từ chỗ đang đứng (trước là close_spray(): tới sát rồi phun nhẹ; hàm đó đã nhường chỗ cho màn 6 mới)
  var L_10 = FOR(3, ['auto_left()', 'move()']).concat(['brace_spray()', 'go_to_wall()', 'tr_right()', 'go_to_wall()']);

  var DS = [
    /* ------------------------------------------------ hàng 1: làm quen */
    man({
      so: 1, ten: 'Hàm auto_spray()', yMoi: 'chọn lực bằng mắt hồng ngoại: distance() > 1 thì phun mạnh, còn không thì phun nhẹ',
      mucTieu: 'bong-mo', hamCuaEmCan: ['squirt', 'tr_right', 'forward', 'move'], taoHam: ['auto_spray'], chinhCoDinh: true,
      deBai: 'Phun nhẹ bay tối đa 2 ô, nên van có distance() là 0 hay 1 thì phun nhẹ tới, từ 2 trở lên phải phun mạnh. ' +
        'Em chế auto_spray(): đo bằng mắt hồng ngoại rồi tự chọn lực. Chương trình chính đã khóa, gọi auto_spray() hai lần: một van xa, một van gần có thùng sau lưng. Thùng phải nằm yên.',
      veMaMau: 'Chương trình chính bị khóa. Mở Xưởng hàm, tạo auto_spray() với if distance() > 1: … else: … dùng squirt(p) của em.',
      san: SAN_1, batDau: { x: 3, y: 4, huong: 0 }, noi: NOI_1,
      bongMo: { x: 3, y: 8, huong: 2, thung: [{ x: 2, y: 5 }] },
      maMau: bai(C_1),
      sao: { o: 19, nhip: 9 },
      loiGiai: { chinh: C_1.slice(), hamCuaEmMoi: [AIM()] },
      loiGiaiKhac: { moTa: 'Viết điều kiện distance() >= 2 kèm một dòng chú thích: đúng, thêm một ô', baiLam: bai(C_1), hamCuaEmMoi: [H('auto_spray', [], ['# 2 ô trở lên thì phun mạnh'].concat(IF('distance() >= 2', ['squirt("high")'], ['squirt("low")'])))] },
      loiSai: [
        { moTa: 'So với 0 như smart_spray: van cách 2 ô cũng bị phun mạnh, xe giật lùi xô thùng', baiLam: bai(C_1), hamCuaEmMoi: [H('auto_spray', [], IF('distance() > 0', ['squirt("high")'], ['squirt("low")']))], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'So với 2: van xa có distance() đúng bằng 2 nên bị phun nhẹ, tia nước rơi giữa đường', baiLam: bai(C_1), hamCuaEmMoi: [H('auto_spray', [], IF('distance() > 2', ['squirt("high")'], ['squirt("low")']))], phaiCoMa: ['ban-ngan'] },
        { moTa: 'Đảo hai nhánh: van xa bị phun nhẹ, van gần bị phun mạnh', baiLam: bai(C_1), hamCuaEmMoi: [H('auto_spray', [], IF('distance() > 1', ['squirt("low")'], ['squirt("high")']))], phaiCoMa: ['ban-ngan'] }
      ],
      goiY: ['Tia nước phun nhẹ đi qua ô thứ nhất, ô thứ hai rồi rơi. Van ở ô thứ hai thì distance() là 1.',
        'if distance() > 1: squirt("high") còn else: squirt("low").']
    }),

    man({
      so: 2, ten: 'Hàm auto_left()', yMoi: 'hàm gọi hàm có cảm biến: quay trái, auto_spray(), quay lại',
      mucTieu: 'bong-mo', hamCuaEmCan: ['auto_spray', 'squirt', 'tr_left', 'tr_right', 'forward', 'move'], taoHam: ['auto_left'], chinhCoDinh: true,
      deBai: 'Hành lang có hai van ở bên trái, xa gần khác nhau; mỗi van mở một cánh cửa phía trước. Đưa xe tới chỗ xe mờ. Em chế auto_left(): quay trái, gọi auto_spray() của em, rồi quay lại. ' +
        'Chương trình chính đã khóa, gọi auto_left() ở hai chỗ.',
      veMaMau: 'Chương trình chính bị khóa. Tạo auto_left() trong Xưởng hàm: ba dòng.',
      san: SAN_2, batDau: { x: 1, y: 4, huong: 1 }, noi: NOI_2,
      bongMo: { x: 4, y: 5, huong: 1 },
      maMau: bai(C_2),
      sao: { o: 24, nhip: 13 },
      loiGiai: { chinh: C_2.slice(), hamCuaEmMoi: [H('auto_left', [], T_AIM_LEFT)] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: bai(C_2), hamCuaEmMoi: [H('auto_left', [], ['# quay về phía van rồi tự chọn lực'].concat(T_AIM_LEFT))] },
      congThucKhac: [{ moTa: 'Viết thẳng if / else trong auto_left() thay cho gọi auto_spray()', baiLam: bai(C_2), hamCuaEmMoi: [H('auto_left', [], nhieu(['tr_left()'], T_AIM, ['tr_right()']))] }],
      loiSai: [
        { moTa: 'Viết cứng squirt("high"): ở van gần xe giật lùi xuống hốc', baiLam: bai(C_2), hamCuaEmMoi: [H('auto_left', [], ['tr_left()', 'squirt("high")', 'tr_right()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Viết cứng squirt("low"): van đầu cách 3 ô, tia nước rơi giữa đường', baiLam: bai(C_2), hamCuaEmMoi: [H('auto_left', [], ['tr_left()', 'squirt("low")', 'tr_right()'])], phaiCoMa: ['ban-ngan'] },
        { moTa: 'Quên quay lại: xe vẫn quay mặt lên, đi vào tường', baiLam: bai(C_2), hamCuaEmMoi: [H('auto_left', [], ['tr_left()', 'auto_spray()'])], phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Hàm của em gọi được hàm của em khác: auto_spray() đã làm ở màn trước.',
        'Quay trái thì mắt hồng ngoại nhìn về phía van; phun xong quay phải để đi tiếp.']
    }),

    man({
      so: 3, ten: 'Sửa hàm quick_pick()', yMoi: 'sửa hàm lỗi: so với tầm phun nhẹ, distance() > 2 thành distance() > 1',
      mucTieu: 'bong-mo', hamCuaEmCan: ['auto_spray', 'squirt', 'tr_left', 'tr_right', 'spin', 'forward', 'move'], chinhCoDinh: true,
      deBai: 'Sola cũng viết một hàm tự chọn lực, quick_pick(), nhưng so distance() với 2. Chương trình chính đã khóa, gọi quick_pick() hai lần: van gần có thùng sau lưng, rồi van xa có distance() đúng bằng 2. ' +
        'Chạy thử xem lần phun nào hỏng, rồi sửa một dòng trong quick_pick(). Thùng phải nằm yên.',
      veMaMau: 'Chạy thử. Van xa có distance() bằng mấy? Phun nhẹ bay được mấy ô?',
      san: SAN_3, batDau: { x: 3, y: 5, huong: 3 }, noi: NOI_3,
      bongMo: { x: 3, y: 0, huong: 1, thung: [{ x: 4, y: 5 }] },
      maMau: bai(C_3, [H('quick_pick', [], IF('distance() > 2', ['squirt("high")'], ['squirt("low")']))]),
      sao: { o: 25, nhip: 14 },
      loiGiai: bai(C_3, [H('quick_pick', [], T_AIM)]),
      loiGiaiKhac: { moTa: 'Sửa thành distance() >= 2 kèm một dòng chú thích: đúng, thêm một ô', baiLam: bai(C_3, [H('quick_pick', [], ['# từ 2 trở lên thì phun mạnh'].concat(IF('distance() >= 2', ['squirt("high")'], ['squirt("low")'])))]) },
      congThucKhac: [{ moTa: 'Gọi auto_spray() của em trong quick_pick()', baiLam: bai(C_3, [H('quick_pick', [], ['auto_spray()'])]) }],
      loiSai: [
        { moTa: 'Để nguyên bản của Sola: van xa bị phun nhẹ, tia nước rơi giữa đường', baiLam: bai(C_3, [H('quick_pick', [], IF('distance() > 2', ['squirt("high")'], ['squirt("low")']))]), phaiCoMa: ['ban-ngan'] },
        { moTa: 'Sửa thành distance() > 0: van gần cũng bị phun mạnh, xe giật lùi xô thùng', baiLam: bai(C_3, [H('quick_pick', [], IF('distance() > 0', ['squirt("high")'], ['squirt("low")']))]), phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Sửa nhầm chỗ: đổi chỗ hai lực, van gần bị phun mạnh', baiLam: bai(C_3, [H('quick_pick', [], IF('distance() > 2', ['squirt("low")'], ['squirt("high")']))]), phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Phun nhẹ tới được van có distance() là 0 hay 1. Van có distance() = 2 thì phải phun mạnh.',
        'Chỉ cần sửa số trong phép so sánh.']
    }),

    /* ------------------------------------------------ hàng 2: luyện */
    man({
      so: 4, ten: 'Hàm auto_right() trong vòng lặp', yMoi: 'chương trình chính gọi hàm có cảm biến trong vòng for, mỗi lần một van xa gần khác',
      mucTieu: 'bong-mo', hamCuaEmCan: ['auto_spray', 'squirt', 'tr_left', 'tr_right', 'move'], taoHam: ['auto_right'], chinhCoDinh: true,
      deBai: 'Ba van nằm bên PHẢI đường đi, van đầu xa, hai van sau gần. Chương trình chính đã khóa: vòng lặp ba lần gọi auto_right() rồi tiến một ô. ' +
        'Em chế auto_right(): quay phải, auto_spray(), quay lại. Phun mạnh thì xe giật sang làn trên, phun nhẹ thì xe đứng yên. Đưa xe tới chỗ xe mờ.',
      veMaMau: 'Chương trình chính bị khóa. Tạo auto_right() như auto_left() nhưng quay về phía bên phải.',
      san: SAN_4, batDau: { x: 1, y: 3, huong: 1 }, noi: NOI_4,
      bongMo: { x: 5, y: 2, huong: 1 },
      maMau: bai(C_4),
      sao: { o: 22, nhip: 19 },
      loiGiai: { chinh: C_4.slice(), hamCuaEmMoi: [H('auto_right', [], ['tr_right()', 'auto_spray()', 'tr_left()'])] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: bai(C_4), hamCuaEmMoi: [H('auto_right', [], ['# quay phải, tự chọn lực, quay lại', 'tr_right()', 'auto_spray()', 'tr_left()'])] },
      loiSai: [
        { moTa: 'Quay trái thay vì quay phải: mắt hồng ngoại nhìn vào tường', baiLam: bai(C_4), hamCuaEmMoi: [H('auto_right', [], ['tr_left()', 'auto_spray()', 'tr_right()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Viết cứng squirt("low"): van đầu cách 3 ô, tia nước rơi giữa đường', baiLam: bai(C_4), hamCuaEmMoi: [H('auto_right', [], ['tr_right()', 'squirt("low")', 'tr_left()'])], phaiCoMa: ['ban-ngan'] },
        { moTa: 'Viết cứng squirt("high"): ở van gần xe giật lên hốc', baiLam: bai(C_4), hamCuaEmMoi: [H('auto_right', [], ['tr_right()', 'squirt("high")', 'tr_left()'])], phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Cùng một hàm chạy ba lần, mỗi lần mắt hồng ngoại đo lại nên lực tự đổi.',
        'Thân hàm ba dòng: tr_right(), auto_spray(), tr_left().']
    }),

    man({
      so: 5, ten: 'Hàm squirt_left(p)', yMoi: 'hàm có tham số lực p, truyền tiếp p cho squirt(p) (hàm gọi hàm)',
      hamCuaEmCan: ['squirt', 'brace_spray', 'tr_left', 'tr_right', 'forward', 'move'], taoHam: ['squirt_left'], chinhCoDinh: true,
      deBai: 'Một cánh cửa chắn ngay đầu hành lang; van A bên trái mở cửa đó, van B cuối hành lang và van C bên trái ở cuối đường mở hai cửa xuống cờ. Van B thì ghì xích bằng brace_spray() cho xe khỏi lùi. ' +
        'Em chế squirt_left(p): quay trái, phun với lực p bằng squirt(p), quay lại. Chương trình chính đã khóa, gọi squirt_left("low") rồi squirt_left("high").',
      veMaMau: 'Chương trình chính bị khóa. Tạo squirt_left(p): trong thân, gọi squirt(p) để truyền tiếp lực p.',
      san: SAN_5, batDau: { x: 2, y: 3, huong: 1 }, noi: NOI_5,
      maMau: bai(C_5),
      sao: { o: 26, nhip: 20 },
      loiGiai: { chinh: C_5.slice(), hamCuaEmMoi: [H('squirt_left', ['p'], T_FIRE_LEFT)] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: bai(C_5), hamCuaEmMoi: [H('squirt_left', ['p'], ['# quay trái, phun lực p, quay lại'].concat(T_FIRE_LEFT))] },
      congThucKhac: [{ moTa: 'Viết spray(p), wait() thay cho squirt(p)', baiLam: bai(C_5), hamCuaEmMoi: [H('squirt_left', ['p'], ['tr_left()', 'spray(p)', 'wait()', 'tr_right()'])] }],
      loiSai: [
        { moTa: 'Viết cứng squirt("low"): van C cách 3 ô, tia nước rơi giữa đường', baiLam: bai(C_5), hamCuaEmMoi: [H('squirt_left', ['p'], ['tr_left()', 'squirt("low")', 'tr_right()'])], phaiCoMa: ['ban-ngan'] },
        { moTa: 'Viết cứng squirt("high"): ở van A xe giật lùi xuống hốc', baiLam: bai(C_5), hamCuaEmMoi: [H('squirt_left', ['p'], ['tr_left()', 'squirt("high")', 'tr_right()'])], phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên quay lại: xe quay mặt lên, lần phun van B đi sai hướng', baiLam: bai(C_5), hamCuaEmMoi: [H('squirt_left', ['p'], ['tr_left()', 'squirt(p)'])], phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['squirt_left("low") thì p là "low"; trong thân, squirt(p) nhận đúng chữ đó.',
        'Thân hàm ba dòng: tr_left(), squirt(p), tr_right().']
    }),

    man({
      so: 6, ten: 'Vừa chạy vừa phun', yMoi: 'ghép nhịp: phun nhẹ không giật nên xe chạy được trong lúc phun; xích chạy trước, tia nước phun từ ô mới',
      hamCuaEmCan: ['tr_right', 'forward', 'move'], chiChay: true, chinhCoDinh: true,
      deBai: 'Phun nhẹ không giật, nên xe vừa chạy vừa phun được: cùng một nhịp, hai xích đưa xe tới một ô rồi vòi phun từ ô mới. ' +
        'Van nào cũng cách xe 3 ô, đứng yên phun nhẹ thì không tới. Bấm Chạy xem xe chạy và phun cùng lúc ở ba đoạn đường.',
      veMaMau: 'Chương trình có sẵn. Bấm Chạy: trong vòng lặp có spray() cùng left_move() và right_move() trước một wait().',
      san: SAN_6, batDau: { x: 1, y: 5, huong: 1 }, noi: NOI_6,
      maMau: bai(L_6),
      sao: { o: 16, nhip: 18 },
      loiGiai: bai(L_6),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# chạy và phun trong một nhịp'].concat(L_6)) },
      loiSai: [],
      goiY: ['Ba lệnh đứng trước một wait() thì chạy cùng một nhịp: vòi phun, xích trái, xích phải.',
        'Phun mạnh thì khác: nước đẩy xe lùi, muốn đứng vững phải ghì xích bằng brace_spray().']
    }),

    /* ------------------------------------------------ hàng 3: biến thể */
    man({
      so: 7, ten: 'Hàm scan_left()', yMoi: 'hàm có vòng lặp bên trong: mỗi vòng auto_left() rồi tiến, gọi ở hai hành lang',
      mucTieu: 'bong-mo', hamCuaEmCan: ['auto_left', 'auto_spray', 'squirt', 'squirt_left', 'tr_left', 'tr_right', 'move'], taoHam: ['scan_left'], chinhCoDinh: true,
      deBai: 'Hai hành lang nối nhau, mỗi hành lang có hai van bên trái, xa gần khác nhau. Em chế scan_left(): vòng lặp hai lần, mỗi lần auto_left() rồi tiến một ô. ' +
        'Chương trình chính đã khóa: scan_left(), quay phải, scan_left(). Phun mạnh thì xe giật sang làn bên cạnh. Đưa xe tới chỗ xe mờ.',
      veMaMau: 'Chương trình chính bị khóa. Tạo scan_left() với for i in range(2): trong thân hàm.',
      san: SAN_7, batDau: { x: 1, y: 3, huong: 1 }, noi: NOI_7,
      bongMo: { x: 2, y: 6, huong: 2 },
      maMau: bai(C_7),
      sao: { o: 24, nhip: 26 },
      loiGiai: { chinh: C_7.slice(), hamCuaEmMoi: [H('scan_left', [], FOR(2, ['auto_left()', 'move()']))] },
      loiGiaiKhac: { moTa: 'Viết hai lần auto_left(), move() không dùng vòng lặp: đúng, thêm một ô', baiLam: bai(C_7), hamCuaEmMoi: [H('scan_left', [], ['auto_left()', 'move()', 'auto_left()', 'move()'])] },
      loiSai: [
        { moTa: 'Vòng lặp ba lần: xe đi quá cuối hành lang', baiLam: bai(C_7), hamCuaEmMoi: [H('scan_left', [], FOR(3, ['auto_left()', 'move()']))], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quên move(): xe phun hai lần một van', baiLam: bai(C_7), hamCuaEmMoi: [H('scan_left', [], FOR(2, ['auto_left()']))], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Viết cứng squirt_left("high"): ở van gần xe giật vào hốc', baiLam: bai(C_7), hamCuaEmMoi: [H('scan_left', [], FOR(2, ['squirt_left("high")', 'move()']))], phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Thân hàm cũng chứa được vòng lặp for, như chương trình chính.',
        'for i in range(2): rồi thụt vào hai dòng auto_left() và move().']
    }),

    man({
      so: 8, ten: 'Hàm auto_turn()', yMoi: 'cú giật của lần phun mạnh đẩy thùng sau lưng vào chỗ thùng mờ; lần phun nhẹ giữ thùng kia nằm yên',
      mucTieu: 'bong-mo', hamCuaEmCan: ['auto_spray', 'squirt', 'tr_left', 'back', 'move'], taoHam: ['auto_turn'], chinhCoDinh: true,
      deBai: 'Hai thùng nặng: thùng sau lưng phải nhích xuống chỗ thùng mờ (xe theo một ô), thùng kia phải nằm yên. Nhớ lại gói Lực phun: phun mạnh thì cú giật đẩy thùng sau lưng nhích một ô, phun nhẹ thì không giật. ' +
        'Em chế auto_turn(): auto_spray() rồi quay trái. Chương trình chính đã khóa: lùi hai ô tới sát thùng, rồi auto_turn() hai lần.',
      veMaMau: 'Chương trình chính bị khóa. Tạo auto_turn(): hai dòng.',
      san: SAN_8, batDau: { x: 3, y: 1, huong: 0 },
      bongMo: BM_8,
      maMau: bai(C_8),
      sao: { o: 18, nhip: 8 },
      loiGiai: { chinh: C_8.slice(), hamCuaEmMoi: [H('auto_turn', [], ['auto_spray()', 'tr_left()'])] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: bai(C_8), hamCuaEmMoi: [H('auto_turn', [], ['# đo, phun, rồi quay trái', 'auto_spray()', 'tr_left()'])] },
      loiSai: [
        { moTa: 'Viết cứng squirt("high"): lần phun thứ hai đẩy luôn thùng bên phải', baiLam: bai(C_8), hamCuaEmMoi: [H('auto_turn', [], ['squirt("high")', 'tr_left()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Viết cứng squirt("low"): không có cú giật, thùng sau lưng nằm yên chắn đường', baiLam: bai(C_8), hamCuaEmMoi: [H('auto_turn', [], ['squirt("low")', 'tr_left()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quay trước rồi mới phun: lần đầu mắt hồng ngoại nhìn về van gần', baiLam: bai(C_8), hamCuaEmMoi: [H('auto_turn', [], ['tr_left()', 'auto_spray()'])], phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Cú giật của lần phun mạnh đẩy thùng ngay sau lưng nhích một ô, xe theo một ô; phun nhẹ thì không giật.',
        'Thân hàm: auto_spray() rồi tr_left().']
    }),

    man({
      so: 9, ten: 'Đố: nhịp bị tách', yMoi: 'sửa hàm lỗi: lệnh phun và lệnh xích bị một wait() tách thành hai nhịp; ghép lại một nhịp thì tia mới kịp lọt cửa nhịp',
      hamCuaEmCan: ['squirt', 'brace_spray', 'tr_left', 'tr_right', 'forward', 'move'], chinhCoDinh: true, cuaNhip: NHIP_9,
      deBai: 'Van nào cũng cách xe 3 ô, trước van có tấm chắn chỉ mở đúng một nhịp. Sola chế spray_go() để vừa chạy vừa phun, ' +
        'nhưng xe phun xong mới chạy: tia nước rơi trước van. Tìm và sửa một dòng trong spray_go().',
      veMaMau: 'Chạy thử. Trong spray_go() có mấy wait()? Mỗi wait() là hết một nhịp.',
      san: SAN_9, batDau: { x: 1, y: 1, huong: 1 }, noi: NOI_9,
      maMau: bai(C_9, [H('spray_go', [], T_GO_CU)]),
      sao: { o: 20, nhip: 12 },
      loiGiai: bai(C_9, [H('spray_go', [], CHAY_PHUN)]),
      loiGiaiKhac: { moTa: 'Cùng cách sửa, thêm một dòng chú thích trong hàm', baiLam: bai(C_9, [H('spray_go', [], ['# chạy và phun trong một nhịp'].concat(CHAY_PHUN))]) },
      congThucKhac: [{ moTa: 'Viết lệnh xích trước lệnh phun: trong một nhịp thứ tự viết không quan trọng', baiLam: bai(C_9, [H('spray_go', [], ['left_move()', 'right_move()', 'spray()', 'wait()'])]) }],
      loiSai: [
        { moTa: 'Để nguyên bản của Sola: phun khi còn đứng yên, tia nước rơi sau 2 ô', baiLam: bai(C_9, [H('spray_go', [], T_GO_CU)]), phaiCoMa: ['ban-ngan', 'chua-toi-co'] },
        { moTa: 'Đổi thứ tự mà vẫn hai nhịp: chạy trước, nhịp sau mới phun thì tấm chắn đã đóng', baiLam: bai(C_9, [H('spray_go', [], ['move()', 'squirt("low")'])]), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Ghì xích phun mạnh: trúng van đầu nhưng xe đứng yên, quay xuống là tường', baiLam: bai(C_9, [H('spray_go', [], ['brace_spray()'])]), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Lệnh phun và lệnh xích phải đứng trước CÙNG một wait() thì mới chạy cùng nhịp.',
        'Xóa wait() nằm giữa spray() và left_move().']
    }),

    /* ------------------------------------------------ trùm */
    man({
      so: 10, ten: 'Trùm: Ba hành lang van', yMoi: 'một chương trình cho ba sân: auto_left() trong vòng lặp, brace_spray() ghì xích mở van cuối hành lang',
      hang: 'trum', hamCuaEmCan: ['auto_left', 'auto_spray', 'brace_spray', 'scan_left', 'go_to_wall', 'squirt', 'squirt_left', 'tr_left', 'tr_right', 'move'],
      huyHieu: { ma: 'che-luc-ban', ten: 'Huy hiệu Hàm lực phun' },
      deBai: 'Ba sân, một chương trình. Sân nào cũng có ba van bên trái hành lang, mỗi van mở cửa trạm kế, nhưng van xa nằm ở trạm khác nhau. ' +
        'Cuối hành lang là một van nữa, xa gần khác nhau, mở cửa xuống cờ. Dùng các hàm của em để tới cờ trên cả ba sân.',
      veMaMau: 'Chương trình có sẵn phun cứng theo sân thứ nhất. Hãy để mắt hồng ngoại chọn lực.',
      san: SAN_10, batDau: BD_10, noi: NOI_10,
      maMau: bai(nhieu(['squirt_left("high")', 'move()'], FOR(2, ['squirt_left("low")', 'move()']), ['brace_spray()', 'go_to_wall()', 'tr_right()', 'go_to_wall()'])),
      sao: { o: 31, nhip: 73 },
      loiGiai: bai(L_10),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# mắt hồng ngoại chọn lực ở mỗi trạm'].concat(L_10)) },
      congThucKhac: [{ moTa: 'Gọi scan_left() rồi thêm một lần auto_left() thay cho vòng lặp ba lần', baiLam: bai(['scan_left()', 'auto_left()', 'move()', 'brace_spray()', 'go_to_wall()', 'tr_right()', 'go_to_wall()']) },
        { moTa: 'Tới sát van cuối rồi phun nhẹ thay cho ghì xích', baiLam: bai(FOR(3, ['auto_left()', 'move()']).concat(['go_to_wall()', 'squirt("low")', 'tr_right()', 'go_to_wall()'])) }],
      loiSai: [
        { moTa: 'Phun cứng theo sân thứ nhất: ở sân khác van xa nằm chỗ khác', baiLam: bai(nhieu(['squirt_left("high")', 'move()'], FOR(2, ['squirt_left("low")', 'move()']), ['brace_spray()', 'go_to_wall()', 'tr_right()', 'go_to_wall()'])), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Luôn phun nhẹ: van xa cách 3 ô, tia nước rơi giữa đường', baiLam: bai(nhieu(FOR(3, ['squirt_left("low")', 'move()']), ['brace_spray()', 'go_to_wall()', 'tr_right()', 'go_to_wall()'])), phaiCoMa: ['ban-ngan', 'chua-toi-co'] },
        { moTa: 'Quên mở van cuối hành lang: cửa phía dưới còn đóng', baiLam: bai(nhieu(FOR(3, ['auto_left()', 'move()']), ['go_to_wall()', 'tr_right()', 'go_to_wall()'])), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Ở mỗi trạm, auto_left() quay về phía van và tự chọn lực theo distance().',
        'Cuối hành lang: brace_spray() ghì xích phun mạnh tới van dù xa hay gần, go_to_wall(), quay phải, go_to_wall() xuống cờ.']
    })
  ];

  ManHoc.manCheLucBan = DS;
  if (laNode) module.exports = ManHoc;
})();
