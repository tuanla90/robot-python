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

   NỘI DUNG (27/10): XE HAI BÁNH gắn SÚNG HƠI + MẮT HỒNG NGOẠI (robot { than: 'hai-banh', tay: 'hoi', camBien: [hong-ngoai] }), mọi màn lucBan: true.
   Đi tiếp chương luc-ban (squirt(p), squirt_back(p), smart_spray() đọc front_clear()): phun nhẹ "low" bay TỐI ĐA 2 Ô, không giật; phun mạnh "high" bay tới vật cản, xe giật một ô
   (luật ở san-hoc.js, mục LỰC PHUN). Mắt hồng ngoại đếm được số ô trống tới nút: distance() là 0 hay 1 thì phun nhẹ tới, từ 2 trở lên phải phun mạnh.
   Nên điều kiện đúng là distance() > 1 (không phải > 2: nút cách 3 ô có distance() = 2, phun nhẹ rơi giữa đường; cũng không phải > 0 như smart_spray:
   nút cách 2 ô thì smart_spray phun mạnh, xe giật lùi).
   Màn chọn lực bằng cảm biến đều KHÓA chương trình chính và gọi hàm ở nhiều chỗ xa gần khác nhau (hay trùm nhiều sân): thân hàm cố định không thắng được.
   MỘT SÂN mỗi màn (luật lộ trình: nhiều sân chỉ ở trùm). kiem-che-luc-ban.mjs + do-duong-che-luc-ban.mjs kiểm.
   Không beSung (gói 9), không warm() (gói 7).
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
  var T_AIM_LEFT = ['turn_left()', 'auto_spray()', 'turn_right()'];

  /** Điền trường chung: xe hai bánh, súng hơi, mắt hồng ngoại; mọi màn chọn được lực phun. */
  function man(m) {
    m.chuong = 'che-luc-ban';
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
  // 5: xe (2,3) quay phải, trước mặt là bốn ô băng chuyền chạy ngược (<) rồi nút B (7,3). Nút A (2,1) bên trái, distance() = 1, tắt băng (dưới xe là hốc (2,4)).
  //    Phun mạnh nút B: xe giật lùi về (1,3). Cuối băng, nút C (6,0) bên trái có distance() = 2: phun mạnh, xe giật xuống (6,4). B mở cửa (6,5), C mở cửa (6,6), cờ (6,7).
  var SAN_5 = ['######N##', '##N###.##', '##.###.##', '#..<<<<N#', '##.###.##', '######C##', '######C##', '######F##', '#########'];
  var NOI_5 = [{ nut: { x: 2, y: 1 }, bang: [{ x: 3, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 3 }, { x: 6, y: 3 }] }, { nut: { x: 7, y: 3 }, cua: [{ x: 6, y: 5 }] }, { nut: { x: 6, y: 0 }, cua: [{ x: 6, y: 6 }] }];
  // 6: ba đoạn đường dài ngắn khác nhau, mỗi đoạn tận cùng là một nút. Đoạn 1: xe (1,1) quay phải, nút (5,1); go_to_wall() dừng sát nút ở (4,1), phun nhẹ mở cửa (4,2).
  //    Đoạn 2: xuống, nút (4,4), dừng ở (4,3), mở cửa (3,3). Đoạn 3: sang trái ba ô tới (1,3), xe mờ quay trái. Phun mạnh sát nút thì xe giật lùi khỏi chỗ rẽ.
  var SAN_6 = ['#######', '#....N#', '####C##', '#..C.##', '####N##', '#######'];
  var NOI_6 = [{ nut: { x: 5, y: 1 }, cua: [{ x: 4, y: 2 }] }, { nut: { x: 4, y: 4 }, cua: [{ x: 3, y: 3 }] }];
  // 7: hai hành lang nối nhau, nút bên TRÁI đường đi. Hành lang 1 (đi sang phải): trạm (1,3) nút (1,0) xa: phun mạnh, xe giật xuống (1,4); trạm (2,4) nút (2,2) gần.
  //    Rẽ phải (đi xuống): trạm (3,4) nút (5,4) gần; trạm (3,5) nút (6,5) xa: phun mạnh, xe giật sang trái (2,5). Xe mờ (2,6) quay xuống. Mỗi nút mở một cửa kế tiếp.
  var SAN_7 = ['#N######', '#.######', '#.N#####', '#..#####', '#.CC.N##', '##.C..N#', '##C#####', '########'];
  var NOI_7 = [{ nut: { x: 1, y: 0 }, cua: [{ x: 2, y: 4 }] }, { nut: { x: 2, y: 2 }, cua: [{ x: 3, y: 4 }] }, { nut: { x: 5, y: 4 }, cua: [{ x: 3, y: 5 }] }, { nut: { x: 6, y: 5 }, cua: [{ x: 2, y: 6 }] }];
  // 8 (luật giật một ô, 29/10): xe (3,3) quay lên, thùng (3,4) ngay sau lưng. Nút trên (3,0) xa: phun mạnh, cú giật đẩy thùng sau lưng nhích xuống (3,5), xe theo vào (3,4).
  //    Quay trái: nút (1,4) gần, thùng (4,4) giờ ở sau lưng: phun nhẹ cho thùng nằm yên (phun mạnh thì nó bị đẩy sang (5,4)). Quay trái (mặt xuống): xe mờ (3,4) quay xuống.
  //    (2,3), (4,3) và (3,6) trống để thân auto_turn cố định (không mắt hồng ngoại: phun mạnh cả hai lần, hay quay rồi phun ra sau) giật lệch chỗ xe mờ / đẩy thùng quá ô thùng mờ.
  var SAN_8 = ['###N###', '###.###', '###.###', '##...##', '#N.HH.#', '###.###', '###.###', '#######'];
  var BM_8 = { x: 3, y: 4, huong: 2, thung: [{ x: 4, y: 4 }, { x: 3, y: 5 }] };          // sau hai lần auto_turn xe ở (3,4) quay xuống (30/10: bỏ hai back() thừa)
  // 9: xe (5,3) quay TRÁI, nút ở bên phải (phía trên). Trạm 1: nút (5,0) xa: phun mạnh, xe giật xuống (5,4). Trạm 2 (4,4): nút (4,2) gần, dưới là hốc (4,5).
  //    Nút 1 mở cửa (4,4), nút 2 mở cửa (3,4); xe mờ (2,4) quay trái. Hàm squirt_right(p) của Sola viết cứng "high".
  var SAN_9 = ['#####N#', '#####.#', '####N.#', '####..#', '###CC.#', '####.##', '#######'];     // 30/10: bỏ ô cuối hành lang, xe mờ đứng trên cửa thứ hai (màn 8 bỏ back(), màn 9 bớt một nhịp)
  var NOI_9 = [{ nut: { x: 5, y: 0 }, cua: [{ x: 4, y: 4 }] }, { nut: { x: 4, y: 2 }, cua: [{ x: 3, y: 4 }] }];
  // 10: ba sân, xe (1,3) quay phải. Ba trạm nút bên trái, mỗi sân đúng MỘT nút xa (phun mạnh, xe giật xuống làn dưới) ở trạm khác nhau; mỗi nút mở cửa trạm kế.
  //     Cuối hành lang làn dưới là nút sát tường cách xa gần khác nhau: tới sát rồi phun nhẹ mở cửa phía dưới, rẽ phải đi xuống cờ.
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

  var C_1 = ['auto_spray()', 'turn_right()', 'auto_spray()', 'turn_right()', 'forward(3)'];
  var C_2 = ['auto_left()', 'move()', 'auto_left()', 'forward(2)'];

  var C_3 = ['quick_pick()', 'turn_left()', 'quick_pick()', 'u_turn()', 'forward(4)', 'turn_right()'];
  var C_4 = FOR(3, ['auto_right()', 'move()']).concat(['move()']);
  var C_5 = ['squirt_left("low")', 'squirt("high")', 'forward(5)', 'squirt_left("high")', 'turn_right()', 'forward(3)'];
  var T_FIRE_LEFT = ['turn_left()', 'squirt(p)', 'turn_right()'];

  var C_6 = ['close_spray()', 'turn_right()', 'close_spray()', 'turn_right()', 'forward(3)'];
  var C_7 = ['scan_left()', 'turn_right()', 'scan_left()'];
  var C_8 = ['auto_turn()', 'auto_turn()'];                                   // luật giật một ô: xe theo thùng xuống một ô; 30/10 bỏ hai back() chỉ để khớp đường cong
  var C_9 = ['squirt_right("high")', 'move()', 'squirt_right("low")', 'move()'];

  var L_10 = FOR(3, ['auto_left()', 'move()']).concat(['close_spray()', 'turn_right()', 'go_to_wall()']);

  var DS = [
    /* ------------------------------------------------ hàng 1: làm quen */
    man({
      so: 1, ten: 'Hàm auto_spray()', yMoi: 'chọn lực bằng mắt hồng ngoại: distance() > 1 thì phun mạnh, còn không thì phun nhẹ',
      mucTieu: 'bong-mo', hamCuaEmCan: ['squirt', 'turn_right', 'forward', 'move'], taoHam: ['auto_spray'], chinhCoDinh: true,
      deBai: 'Phun nhẹ bay tối đa 2 ô, nên van có distance() là 0 hay 1 thì phun nhẹ tới, từ 2 trở lên phải phun mạnh. ' +
        'Em chế auto_spray(): đo bằng mắt hồng ngoại rồi tự chọn lực. Chương trình chính đã khóa, gọi auto_spray() hai lần: một van xa, một van gần có thùng sau lưng. Thùng phải nằm yên.',
      veMaMau: 'Chương trình chính bị khóa. Mở Xưởng hàm, tạo auto_spray() với if distance() > 1: … else: … dùng squirt(p) của em.',
      san: SAN_1, batDau: { x: 3, y: 4, huong: 0 }, noi: NOI_1,
      bongMo: { x: 3, y: 8, huong: 2, thung: [{ x: 2, y: 5 }] },
      maMau: bai(C_1),
      sao: { o: 18, nhip: 7 },
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
      mucTieu: 'bong-mo', hamCuaEmCan: ['auto_spray', 'squirt', 'turn_left', 'turn_right', 'forward', 'move'], taoHam: ['auto_left'], chinhCoDinh: true,
      deBai: 'Hành lang có hai van ở bên trái, xa gần khác nhau; mỗi van mở một cánh cửa phía trước. Đưa xe tới chỗ xe mờ. Em chế auto_left(): quay trái, gọi auto_spray() của em, rồi quay lại. ' +
        'Chương trình chính đã khóa, gọi auto_left() ở hai chỗ.',
      veMaMau: 'Chương trình chính bị khóa. Tạo auto_left() trong Xưởng hàm: ba dòng.',
      san: SAN_2, batDau: { x: 1, y: 4, huong: 1 }, noi: NOI_2,
      bongMo: { x: 4, y: 5, huong: 1 },
      maMau: bai(C_2),
      sao: { o: 22, nhip: 9 },
      loiGiai: { chinh: C_2.slice(), hamCuaEmMoi: [H('auto_left', [], T_AIM_LEFT)] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: bai(C_2), hamCuaEmMoi: [H('auto_left', [], ['# quay về phía van rồi tự chọn lực'].concat(T_AIM_LEFT))] },
      congThucKhac: [{ moTa: 'Viết thẳng if / else trong auto_left() thay cho gọi auto_spray()', baiLam: bai(C_2), hamCuaEmMoi: [H('auto_left', [], nhieu(['turn_left()'], T_AIM, ['turn_right()']))] }],
      loiSai: [
        { moTa: 'Viết cứng squirt("high"): ở van gần xe giật lùi xuống hốc', baiLam: bai(C_2), hamCuaEmMoi: [H('auto_left', [], ['turn_left()', 'squirt("high")', 'turn_right()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Viết cứng squirt("low"): van đầu cách 3 ô, tia nước rơi giữa đường', baiLam: bai(C_2), hamCuaEmMoi: [H('auto_left', [], ['turn_left()', 'squirt("low")', 'turn_right()'])], phaiCoMa: ['ban-ngan'] },
        { moTa: 'Quên quay lại: xe vẫn quay mặt lên, đi vào tường', baiLam: bai(C_2), hamCuaEmMoi: [H('auto_left', [], ['turn_left()', 'auto_spray()'])], phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Hàm của em gọi được hàm của em khác: auto_spray() đã làm ở màn trước.',
        'Quay trái thì mắt hồng ngoại nhìn về phía van; phun xong quay phải để đi tiếp.']
    }),

    man({
      so: 3, ten: 'Sửa hàm quick_pick()', yMoi: 'sửa hàm lỗi: so với tầm phun nhẹ, distance() > 2 thành distance() > 1',
      mucTieu: 'bong-mo', hamCuaEmCan: ['auto_spray', 'squirt', 'turn_left', 'turn_right', 'u_turn', 'forward', 'move'], chinhCoDinh: true,
      deBai: 'Sola cũng viết một hàm tự chọn lực, quick_pick(), nhưng so distance() với 2. Chương trình chính đã khóa, gọi quick_pick() hai lần: van gần có thùng sau lưng, rồi van xa có distance() đúng bằng 2. ' +
        'Chạy thử xem phát nào hỏng, rồi sửa một dòng trong quick_pick(). Thùng phải nằm yên.',
      veMaMau: 'Chạy thử. Van xa có distance() bằng mấy? Phun nhẹ bay được mấy ô?',
      san: SAN_3, batDau: { x: 3, y: 5, huong: 3 }, noi: NOI_3,
      bongMo: { x: 3, y: 0, huong: 1, thung: [{ x: 4, y: 5 }] },
      maMau: bai(C_3, [H('quick_pick', [], IF('distance() > 2', ['squirt("high")'], ['squirt("low")']))]),
      sao: { o: 24, nhip: 9 },
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
      mucTieu: 'bong-mo', hamCuaEmCan: ['auto_spray', 'squirt', 'turn_left', 'turn_right', 'move'], taoHam: ['auto_right'], chinhCoDinh: true,
      deBai: 'Ba van nằm bên PHẢI đường đi, van đầu xa, hai van sau gần. Chương trình chính đã khóa: vòng lặp ba lần gọi auto_right() rồi tiến một ô. ' +
        'Em chế auto_right(): quay phải, auto_spray(), quay lại. Phun mạnh thì xe giật sang làn trên, phun nhẹ thì xe đứng yên. Đưa xe tới chỗ xe mờ.',
      veMaMau: 'Chương trình chính bị khóa. Tạo auto_right() như auto_left() nhưng quay về phía bên phải.',
      san: SAN_4, batDau: { x: 1, y: 3, huong: 1 }, noi: NOI_4,
      bongMo: { x: 5, y: 2, huong: 1 },
      maMau: bai(C_4),
      sao: { o: 20, nhip: 13 },
      loiGiai: { chinh: C_4.slice(), hamCuaEmMoi: [H('auto_right', [], ['turn_right()', 'auto_spray()', 'turn_left()'])] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: bai(C_4), hamCuaEmMoi: [H('auto_right', [], ['# quay phải, tự chọn lực, quay lại', 'turn_right()', 'auto_spray()', 'turn_left()'])] },
      loiSai: [
        { moTa: 'Quay trái thay vì quay phải: mắt hồng ngoại nhìn vào tường', baiLam: bai(C_4), hamCuaEmMoi: [H('auto_right', [], ['turn_left()', 'auto_spray()', 'turn_right()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Viết cứng squirt("low"): van đầu cách 3 ô, tia nước rơi giữa đường', baiLam: bai(C_4), hamCuaEmMoi: [H('auto_right', [], ['turn_right()', 'squirt("low")', 'turn_left()'])], phaiCoMa: ['ban-ngan'] },
        { moTa: 'Viết cứng squirt("high"): ở van gần xe giật lên hốc', baiLam: bai(C_4), hamCuaEmMoi: [H('auto_right', [], ['turn_right()', 'squirt("high")', 'turn_left()'])], phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Cùng một hàm chạy ba lần, mỗi lần mắt hồng ngoại đo lại nên lực tự đổi.',
        'Thân hàm ba dòng: turn_right(), auto_spray(), turn_left().']
    }),

    man({
      so: 5, ten: 'Hàm squirt_left(p)', yMoi: 'hàm có tham số lực p, truyền tiếp p cho squirt(p) (hàm gọi hàm)',
      hamCuaEmCan: ['squirt', 'turn_left', 'turn_right', 'forward', 'move'], taoHam: ['squirt_left'], chinhCoDinh: true,
      deBai: 'Băng chuyền chạy ngược chắn đường; van A bên trái tắt băng, van B cuối băng và van C bên trái ở cuối đường mở hai cửa xuống cờ. ' +
        'Em chế squirt_left(p): quay trái, phun với lực p bằng squirt(p), quay lại. Chương trình chính đã khóa, gọi squirt_left("low") rồi squirt_left("high").',
      veMaMau: 'Chương trình chính bị khóa. Tạo squirt_left(p): trong thân, gọi squirt(p) để truyền tiếp lực p.',
      san: SAN_5, batDau: { x: 2, y: 3, huong: 1 }, noi: NOI_5,
      maMau: bai(C_5),
      sao: { o: 20, nhip: 16 },
      loiGiai: { chinh: C_5.slice(), hamCuaEmMoi: [H('squirt_left', ['p'], T_FIRE_LEFT)] },
      loiGiaiKhac: { moTa: 'Viết spray(p), wait() thay cho squirt(p): đúng, thêm một ô', baiLam: bai(C_5), hamCuaEmMoi: [H('squirt_left', ['p'], ['turn_left()', 'spray(p)', 'wait()', 'turn_right()'])] },
      loiSai: [
        { moTa: 'Viết cứng squirt("low"): van C cách 3 ô, tia nước rơi giữa đường', baiLam: bai(C_5), hamCuaEmMoi: [H('squirt_left', ['p'], ['turn_left()', 'squirt("low")', 'turn_right()'])], phaiCoMa: ['ban-ngan'] },
        { moTa: 'Viết cứng squirt("high"): ở van A xe giật lùi xuống hốc', baiLam: bai(C_5), hamCuaEmMoi: [H('squirt_left', ['p'], ['turn_left()', 'squirt("high")', 'turn_right()'])], phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên quay lại: xe quay mặt lên, lần phun van B đi sai hướng', baiLam: bai(C_5), hamCuaEmMoi: [H('squirt_left', ['p'], ['turn_left()', 'squirt(p)'])], phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['squirt_left("low") thì p là "low"; trong thân, squirt(p) nhận đúng chữ đó.',
        'Thân hàm ba dòng: turn_left(), squirt(p), turn_right().']
    }),

    man({
      so: 6, ten: 'Hàm close_spray()', yMoi: 'hàm dùng go_to_wall(): đi tới sát van rồi phun nhẹ để xe đứng yên ở chỗ rẽ',
      mucTieu: 'bong-mo', hamCuaEmCan: ['go_to_wall', 'squirt', 'turn_right', 'forward', 'move'], taoHam: ['close_spray'], chinhCoDinh: true,
      deBai: 'Ba đoạn đường dài ngắn khác nhau; cuối mỗi đoạn có một van mở cửa ở chỗ rẽ. Em chế close_spray(): đi tới sát van bằng go_to_wall() của gói Hồng ngoại rồi phun nhẹ. ' +
        'Sát van mà phun mạnh thì xe giật lùi khỏi chỗ rẽ. Chương trình chính đã khóa. Đưa xe tới chỗ xe mờ.',
      veMaMau: 'Chương trình chính bị khóa. Tạo close_spray(): hai dòng.',
      san: SAN_6, batDau: { x: 1, y: 1, huong: 1 }, noi: NOI_6,
      bongMo: { x: 1, y: 3, huong: 3 },
      maMau: bai(C_6),
      sao: { o: 18, nhip: 12 },
      loiGiai: { chinh: C_6.slice(), hamCuaEmMoi: [H('close_spray', [], ['go_to_wall()', 'squirt("low")'])] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: bai(C_6), hamCuaEmMoi: [H('close_spray', [], ['# tới sát van rồi phun nhẹ', 'go_to_wall()', 'squirt("low")'])] },
      congThucKhac: [{ moTa: 'Viết thẳng vòng while distance() > 0: move() trong hàm', baiLam: bai(C_6), hamCuaEmMoi: [H('close_spray', [], ['while distance() > 0:', '    move()', 'squirt("low")'])] }],
      loiSai: [
        { moTa: 'Phun mạnh khi đã sát van: xe giật lùi một ô, rẽ sai chỗ', baiLam: bai(C_6), hamCuaEmMoi: [H('close_spray', [], ['go_to_wall()', 'squirt("high")'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đếm cứng forward(2): ở đoạn đầu xe dừng sớm, rẽ vào tường', baiLam: bai(C_6), hamCuaEmMoi: [H('close_spray', [], ['forward(2)', 'squirt("low")'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Phun trước rồi mới đi: tia nước phun nhẹ chưa tới van', baiLam: bai(C_6), hamCuaEmMoi: [H('close_spray', [], ['squirt("low")', 'go_to_wall()'])], phaiCoMa: ['ban-ngan'] }
      ],
      goiY: ['go_to_wall() đi cho tới khi distance() là 0: van ở ngay trước mũi.',
        'Sát van rồi thì phun nhẹ là tới, xe lại không giật.']
    }),

    /* ------------------------------------------------ hàng 3: biến thể */
    man({
      so: 7, ten: 'Hàm scan_left()', yMoi: 'hàm có vòng lặp bên trong: mỗi vòng auto_left() rồi tiến, gọi ở hai hành lang',
      mucTieu: 'bong-mo', hamCuaEmCan: ['auto_left', 'auto_spray', 'squirt', 'squirt_left', 'turn_left', 'turn_right', 'move'], taoHam: ['scan_left'], chinhCoDinh: true,
      deBai: 'Hai hành lang nối nhau, mỗi hành lang có hai van bên trái, xa gần khác nhau. Em chế scan_left(): vòng lặp hai lần, mỗi lần auto_left() rồi tiến một ô. ' +
        'Chương trình chính đã khóa: scan_left(), quay phải, scan_left(). Phun mạnh thì xe giật sang làn bên cạnh. Đưa xe tới chỗ xe mờ.',
      veMaMau: 'Chương trình chính bị khóa. Tạo scan_left() với for i in range(2): trong thân hàm.',
      san: SAN_7, batDau: { x: 1, y: 3, huong: 1 }, noi: NOI_7,
      bongMo: { x: 2, y: 6, huong: 2 },
      maMau: bai(C_7),
      sao: { o: 22, nhip: 17 },
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
      so: 8, ten: 'Hàm auto_turn()', yMoi: 'cú giật của phát phun mạnh đẩy thùng sau lưng vào chỗ thùng mờ; phát phun nhẹ giữ thùng kia nằm yên',
      mucTieu: 'bong-mo', hamCuaEmCan: ['auto_spray', 'squirt', 'turn_left', 'back', 'move'], taoHam: ['auto_turn'], chinhCoDinh: true,
      deBai: 'Hai thùng nặng: thùng sau lưng phải nhích xuống chỗ thùng mờ (xe theo một ô), thùng kia phải nằm yên. Nhớ lại gói Nhà máy: phun mạnh thì cú giật đẩy thùng sau lưng nhích một ô, phun nhẹ thì không giật. ' +
        'Em chế auto_turn(): auto_spray() rồi quay trái. Chương trình chính đã khóa: auto_turn() hai lần.',
      veMaMau: 'Chương trình chính bị khóa. Tạo auto_turn(): hai dòng.',
      san: SAN_8, batDau: { x: 3, y: 3, huong: 0 },
      bongMo: BM_8,
      maMau: bai(C_8),
      sao: { o: 12, nhip: 4 },
      loiGiai: { chinh: C_8.slice(), hamCuaEmMoi: [H('auto_turn', [], ['auto_spray()', 'turn_left()'])] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: bai(C_8), hamCuaEmMoi: [H('auto_turn', [], ['# đo, phun, rồi quay trái', 'auto_spray()', 'turn_left()'])] },
      loiSai: [
        { moTa: 'Viết cứng squirt("high"): phát thứ hai đẩy luôn thùng bên phải', baiLam: bai(C_8), hamCuaEmMoi: [H('auto_turn', [], ['squirt("high")', 'turn_left()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Viết cứng squirt("low"): không có cú giật, thùng sau lưng nằm yên chắn đường', baiLam: bai(C_8), hamCuaEmMoi: [H('auto_turn', [], ['squirt("low")', 'turn_left()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quay trước rồi mới phun: lần đầu mắt hồng ngoại nhìn về van gần', baiLam: bai(C_8), hamCuaEmMoi: [H('auto_turn', [], ['turn_left()', 'auto_spray()'])], phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Cú giật của phát phun mạnh đẩy thùng ngay sau lưng nhích một ô, xe theo một ô; phun nhẹ thì không giật.',
        'Thân hàm: auto_spray() rồi turn_left().']
    }),

    man({
      so: 9, ten: 'Đố: lực bị viết cứng', yMoi: 'sửa hàm lỗi: tham số p bị bỏ quên, thân hàm viết cứng "high"',
      mucTieu: 'bong-mo', hamCuaEmCan: ['auto_spray', 'squirt', 'turn_left', 'turn_right', 'forward', 'move'], chinhCoDinh: true,
      deBai: 'Sola chế squirt_right(p): quay phải, phun, quay lại. Chương trình chính đã khóa, gọi squirt_right("high") rồi squirt_right("low"). ' +
        'Nhưng ở van thứ hai xe vẫn giật lùi xuống hốc. Tìm và sửa một dòng trong squirt_right(p).',
      veMaMau: 'Chạy thử. Lời gọi đưa "low" vào p, mà thân hàm có dùng p không?',
      san: SAN_9, batDau: { x: 5, y: 3, huong: 3 }, noi: NOI_9,
      bongMo: { x: 3, y: 4, huong: 3 },
      maMau: bai(C_9, [H('squirt_right', ['p'], ['turn_right()', 'squirt("high")', 'turn_left()'])]),
      sao: { o: 16, nhip: 8 },
      loiGiai: bai(C_9, [H('squirt_right', ['p'], ['turn_right()', 'squirt(p)', 'turn_left()'])]),
      loiGiaiKhac: { moTa: 'Cùng cách sửa, thêm một dòng chú thích trong hàm', baiLam: bai(C_9, [H('squirt_right', ['p'], ['# dùng lực của lời gọi', 'turn_right()', 'squirt(p)', 'turn_left()'])]) },
      congThucKhac: [{ moTa: 'Viết spray(p), wait() thay cho squirt(p)', baiLam: bai(C_9, [H('squirt_right', ['p'], ['turn_right()', 'spray(p)', 'wait()', 'turn_left()'])]) }, { moTa: 'Dùng auto_spray() cho mắt hồng ngoại tự chọn lực (p thành thừa)', baiLam: bai(C_9, [H('squirt_right', ['p'], ['turn_right()', 'auto_spray()', 'turn_left()'])]) }],
      loiSai: [
        { moTa: 'Để nguyên bản của Sola: van gần cũng bị phun mạnh, xe giật xuống hốc', baiLam: bai(C_9, [H('squirt_right', ['p'], ['turn_right()', 'squirt("high")', 'turn_left()'])]), phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Sửa thành "low": van đầu cách 3 ô, tia nước rơi giữa đường', baiLam: bai(C_9, [H('squirt_right', ['p'], ['turn_right()', 'squirt("low")', 'turn_left()'])]), phaiCoMa: ['ban-ngan'] },
        { moTa: 'Viết squirt("p"): có dấu nháy thì p là chữ p, không phải tham số', baiLam: bai(C_9, [H('squirt_right', ['p'], ['turn_right()', 'squirt("p")', 'turn_left()'])]), phaiCoMa: ['luc-ban-sai'] }
      ],
      goiY: ['Tham số p nhận chữ trong ngoặc của lời gọi: squirt_right("low") thì p là "low".',
        'Đổi squirt("high") thành squirt(p), không có dấu nháy.']
    }),

    /* ------------------------------------------------ trùm */
    man({
      so: 10, ten: 'Trùm: Ba hành lang van', yMoi: 'một chương trình cho ba sân: auto_left() trong vòng lặp, close_spray() ở cuối hành lang',
      hang: 'trum', hamCuaEmCan: ['auto_left', 'auto_spray', 'close_spray', 'scan_left', 'go_to_wall', 'squirt', 'squirt_left', 'turn_left', 'turn_right', 'move'],
      huyHieu: { ma: 'che-luc-ban', ten: 'Huy hiệu Hàm lực phun' },
      deBai: 'Ba sân, một chương trình. Sân nào cũng có ba van bên trái hành lang, mỗi van mở cửa trạm kế, nhưng van xa nằm ở trạm khác nhau. ' +
        'Cuối hành lang là một van nữa, xa gần khác nhau, mở cửa xuống cờ. Dùng các hàm của em để tới cờ trên cả ba sân.',
      veMaMau: 'Chương trình có sẵn phun cứng theo sân thứ nhất. Hãy để mắt hồng ngoại chọn lực.',
      san: SAN_10, batDau: BD_10, noi: NOI_10,
      maMau: bai(nhieu(['squirt_left("high")', 'move()'], FOR(2, ['squirt_left("low")', 'move()']), ['close_spray()', 'turn_right()', 'go_to_wall()'])),
      sao: { o: 26, nhip: 52 },
      loiGiai: bai(L_10),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# mắt hồng ngoại chọn lực ở mỗi trạm'].concat(L_10)) },
      congThucKhac: [{ moTa: 'Gọi scan_left() rồi thêm một lần auto_left() thay cho vòng lặp ba lần', baiLam: bai(['scan_left()', 'auto_left()', 'move()', 'close_spray()', 'turn_right()', 'go_to_wall()']) }],
      loiSai: [
        { moTa: 'Phun cứng theo sân thứ nhất: ở sân khác van xa nằm chỗ khác', baiLam: bai(nhieu(['squirt_left("high")', 'move()'], FOR(2, ['squirt_left("low")', 'move()']), ['close_spray()', 'turn_right()', 'go_to_wall()'])), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Luôn phun nhẹ: van xa cách 3 ô, tia nước rơi giữa đường', baiLam: bai(nhieu(FOR(3, ['squirt_left("low")', 'move()']), ['close_spray()', 'turn_right()', 'go_to_wall()'])), phaiCoMa: ['ban-ngan', 'chua-toi-co'] },
        { moTa: 'Quên close_spray(): xe rẽ ngay khi cửa phía dưới còn đóng', baiLam: bai(nhieu(FOR(3, ['auto_left()', 'move()']), ['turn_right()', 'go_to_wall()'])), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Ở mỗi trạm, auto_left() quay về phía van và tự chọn lực theo distance().',
        'Cuối hành lang: close_spray() đi tới sát van rồi phun nhẹ, quay phải, go_to_wall() xuống cờ.']
    })
  ];

  ManHoc.manCheLucBan = DS;
  if (laNode) module.exports = ManHoc;
})();
