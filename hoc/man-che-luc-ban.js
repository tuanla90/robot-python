/* ============================================================================
   man-che-luc-ban.js — "Robot Chấn Hưng": NGÂN HÀNG MÀN MỚI của mùa 2, gói 6 "Lực bắn" (KE-HOACH-MUA-2.md).
   Khung mùa 2 (lo-trinh-hoc.js, khối "MÙA 2 = 10 GÓI", mảng MUA_2) đã chừa chỗ: tệp đã có trong danh sách require của lo-trinh-hoc.js và
   thẻ <script> của game/choi.html. Gói sau CHỈ việc thêm màn vào mảng DS dưới đây; màn tự hiện đúng chương, đúng gói.
     - `che-luc-ban` (mã che-luc-ban.1 … che-luc-ban.10): chương 2 "Hàm lực bắn" (chương 1 là luc-ban có sẵn, man-luc-ban.js)
   Mỗi màn khai `chuong` (một trong các mã trên) và `so` (1, 2, …: thứ tự trong phần màn mới của chương); mã `ma` = chuong + '.' + so là khóa lưu sao,
   KHÔNG đổi sau khi xuất bản. Gọi ManHoc.chuanHoa(m) như các tệp màn khác. Chương còn trống thì chưa hiện; gói chưa có chương nào có màn thì chưa hiện.
   Ràng buộc mùa 2 (hoc/kiem-lo-trinh.mjs): robot chỉ dùng part mùa 1 + xích + súng hơi (+ hồng ngoại khi lõi có); không bậc thang S, hố u, gầm n;
   biến chỉ từ gói 1 chương 2, hàm có tham số chỉ từ gói 2 chương 2 (tham-so); hàm của em cần phải được tạo ở màn đứng trước.
   Tệp này KHÔNG tự thêm màn vào ManHoc: danh sách nằm ở ManHoc.manCheLucBan, lo-trinh-hoc.js thêm vào chương rồi xếp chỗ (so, hang do dungChuong đặt).

   NỘI DUNG (27/10): XE HAI BÁNH gắn SÚNG HƠI + MẮT HỒNG NGOẠI (robot { than: 'hai-banh', tay: 'hoi', camBien: [hong-ngoai] }), mọi màn lucBan: true.
   Đi tiếp chương luc-ban (fire(p), fire_back(p), smart_fire() đọc front_clear()): bắn nhanh "fast" bay TỐI ĐA 2 Ô, không giật; bắn tụ "charge" bay tới vật cản, xe giật một ô
   (luật ở san-hoc.js, mục LỰC BẮN). Mắt hồng ngoại đếm được số ô trống tới nút: distance() là 0 hay 1 thì bắn nhanh tới, từ 2 trở lên phải bắn tụ.
   Nên điều kiện đúng là distance() > 1 (không phải > 2: nút cách 3 ô có distance() = 2, bắn nhanh rơi giữa đường; cũng không phải > 0 như smart_fire:
   nút cách 2 ô thì smart_fire bắn tụ, xe giật lùi).
   Màn chọn lực bằng cảm biến đều KHÓA chương trình chính và gọi hàm ở nhiều chỗ xa gần khác nhau (hay trùm nhiều sân): thân hàm cố định không thắng được.
   MỘT SÂN mỗi màn (luật lộ trình: nhiều sân chỉ ở trùm). kiem-che-luc-ban.mjs + do-duong-che-luc-ban.mjs kiểm.
   Không beSung (gói 9), không warm() (gói 7).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var HAM_GOC = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'shoot', 'shoot_back', 'distance'];

  /** Thụt mọi dòng vào một bậc (4 dấu cách). */
  function thut(ds) { return ds.map(function (s) { return '    ' + s; }); }
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  function FOR(n, than, bien) { return ['for ' + (bien || 'i') + ' in range(' + n + '):'].concat(thut(than)); }
  function IF(dk, co, khong) { return ['if ' + dk + ':'].concat(thut(co), khong ? ['else:'].concat(thut(khong)) : []); }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function bai(chinh, hamCuaMan) { return { chinh: chinh.slice(), hamCuaMan: (hamCuaMan || []).slice() }; }

  // thân các hàm (cách chuẩn)
  var T_AIM = IF('distance() > 1', ['fire("charge")'], ['fire("fast")']);
  var AIM = function () { return H('aim_fire', [], T_AIM); };
  var T_AIM_LEFT = ['turn_left()', 'aim_fire()', 'turn_right()'];

  /** Điền trường chung: xe hai bánh, súng hơi, mắt hồng ngoại; mọi màn chọn được lực bắn. */
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

  // 1: xe (3,4) quay lên, nút xa (3,1) có distance() = 2: bắn tụ, xe giật xuống (3,5). Quay phải: nút gần (5,5) có distance() = 1, thùng (2,5) sau lưng.
  //    Cửa (3,6) theo nút gần, cửa (3,7) theo nút xa, xe mờ (3,8) quay xuống, thùng phải nằm yên.
  var SAN_1 = ['#######', '###N###', '###.###', '###.###', '###.###', '#.H..N#', '###C###', '###C###', '###.###', '#######'];
  var NOI_1 = [{ nut: { x: 5, y: 5 }, cua: [{ x: 3, y: 6 }] }, { nut: { x: 3, y: 1 }, cua: [{ x: 3, y: 7 }] }];
  // 2: xe (1,4) quay phải. Trạm 1: nút trên (1,1), distance() = 2: bắn tụ, xe giật xuống làn dưới (1,5). Trạm 2 (2,5) là cửa của nút 1:
  //    nút trên (2,3), distance() = 1: bắn nhanh (bắn tụ thì xe giật xuống hốc (2,6)). Nút 2 mở cửa (3,5), xe mờ (4,5) quay phải.
  var SAN_2 = ['#######', '#N#####', '#.#####', '#.N####', '#..####', '#.CC.##', '##.####', '#######'];
  var NOI_2 = [{ nut: { x: 1, y: 1 }, cua: [{ x: 2, y: 5 }] }, { nut: { x: 2, y: 3 }, cua: [{ x: 3, y: 5 }] }];
  // 3: xe (3,5) quay trái: nút gần (1,5), distance() = 1, thùng (4,5) sau lưng. Quay trái (mặt xuống): nút xa (3,8), distance() = 2, bắn tụ thì xe giật lên (3,4).
  //    Cửa (3,3) theo nút gần, cửa (3,2) theo nút xa; xe mờ (3,0) quay phải, thùng nằm yên. Hàm quick_aim() của Sola so với 2.
  var SAN_3 = ['###.###', '###.###', '###C###', '###C###', '###.###', '#N..H.#', '###.###', '###.###', '###N###', '#######'];
  var NOI_3 = [{ nut: { x: 1, y: 5 }, cua: [{ x: 3, y: 3 }] }, { nut: { x: 3, y: 8 }, cua: [{ x: 3, y: 2 }] }];
  // 4: xe (1,3) quay phải, nút ở bên PHẢI (phía dưới). Trạm 1: nút (1,6), distance() = 2: bắn tụ, xe giật lên làn trên (1,2). Trạm 2 (2,2), trạm 3 (3,2):
  //    nút (2,4), (3,4) có distance() = 1: bắn nhanh (bắn tụ thì xe giật lên hốc). Mỗi nút mở cửa kế tiếp trên làn trên, xe mờ (5,2) quay phải.
  var SAN_4 = ['#######', '##..###', '#.CCC.#', '#...###', '#.NN###', '#.#####', '#N#####', '#######'];
  var NOI_4 = [{ nut: { x: 1, y: 6 }, cua: [{ x: 2, y: 2 }] }, { nut: { x: 2, y: 4 }, cua: [{ x: 3, y: 2 }] }, { nut: { x: 3, y: 4 }, cua: [{ x: 4, y: 2 }] }];
  // 5: xe (2,3) quay phải, trước mặt là bốn ô băng chuyền chạy ngược (<) rồi nút B (7,3). Nút A (2,1) bên trái, distance() = 1, tắt băng (dưới xe là hốc (2,4)).
  //    Bắn tụ nút B: xe giật lùi về (1,3). Cuối băng, nút C (6,0) bên trái có distance() = 2: bắn tụ, xe giật xuống (6,4). B mở cửa (6,5), C mở cửa (6,6), cờ (6,7).
  var SAN_5 = ['######N##', '##N###.##', '##.###.##', '#..<<<<N#', '##.###.##', '######C##', '######C##', '######F##', '#########'];
  var NOI_5 = [{ nut: { x: 2, y: 1 }, bang: [{ x: 3, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 3 }, { x: 6, y: 3 }] }, { nut: { x: 7, y: 3 }, cua: [{ x: 6, y: 5 }] }, { nut: { x: 6, y: 0 }, cua: [{ x: 6, y: 6 }] }];
  // 6: ba đoạn đường dài ngắn khác nhau, mỗi đoạn tận cùng là một nút. Đoạn 1: xe (1,1) quay phải, nút (5,1); go_to_wall() dừng sát nút ở (4,1), bắn nhanh mở cửa (4,2).
  //    Đoạn 2: xuống, nút (4,4), dừng ở (4,3), mở cửa (3,3). Đoạn 3: sang trái ba ô tới (1,3), xe mờ quay trái. Bắn tụ sát nút thì xe giật lùi khỏi chỗ rẽ.
  var SAN_6 = ['#######', '#....N#', '####C##', '#..C.##', '####N##', '#######'];
  var NOI_6 = [{ nut: { x: 5, y: 1 }, cua: [{ x: 4, y: 2 }] }, { nut: { x: 4, y: 4 }, cua: [{ x: 3, y: 3 }] }];
  // 7: hai hành lang nối nhau, nút bên TRÁI đường đi. Hành lang 1 (đi sang phải): trạm (1,3) nút (1,0) xa: bắn tụ, xe giật xuống (1,4); trạm (2,4) nút (2,2) gần.
  //    Rẽ phải (đi xuống): trạm (3,4) nút (5,4) gần; trạm (3,5) nút (6,5) xa: bắn tụ, xe giật sang trái (2,5). Xe mờ (2,6) quay xuống. Mỗi nút mở một cửa kế tiếp.
  var SAN_7 = ['#N######', '#.######', '#.N#####', '#..#####', '#.CC.N##', '##.C..N#', '##C#####', '########'];
  var NOI_7 = [{ nut: { x: 1, y: 0 }, cua: [{ x: 2, y: 4 }] }, { nut: { x: 2, y: 2 }, cua: [{ x: 3, y: 4 }] }, { nut: { x: 5, y: 4 }, cua: [{ x: 3, y: 5 }] }, { nut: { x: 6, y: 5 }, cua: [{ x: 2, y: 6 }] }];
  // 8: xe (3,3) quay lên, thùng (3,4) ngay sau lưng, thùng (4,3) bên phải. Nút trên (3,0) xa: bắn tụ, cú giật đẩy thùng sau lưng trượt xuống (3,6).
  //    Quay trái: nút (1,3) gần, thùng (4,3) giờ ở sau lưng: bắn nhanh cho thùng nằm yên. Quay trái (mặt xuống), tiến hai ô tới xe mờ (3,5).
  var SAN_8 = ['###N###', '###.###', '###.###', '#N..H.#', '###H###', '###.###', '###.###', '#######'];
  // 9: xe (5,3) quay TRÁI, nút ở bên phải (phía trên). Trạm 1: nút (5,0) xa: bắn tụ, xe giật xuống (5,4). Trạm 2 (4,4): nút (4,2) gần, dưới là hốc (4,5).
  //    Nút 1 mở cửa (4,4), nút 2 mở cửa (3,4); xe mờ (2,4) quay trái. Hàm shot_right(p) của Sola viết cứng "charge".
  var SAN_9 = ['#####N#', '#####.#', '####N.#', '####..#', '##.CC.#', '####.##', '#######'];
  var NOI_9 = [{ nut: { x: 5, y: 0 }, cua: [{ x: 4, y: 4 }] }, { nut: { x: 4, y: 2 }, cua: [{ x: 3, y: 4 }] }];
  // 10: ba sân, xe (1,3) quay phải. Ba trạm nút bên trái, mỗi sân đúng MỘT nút xa (bắn tụ, xe giật xuống làn dưới) ở trạm khác nhau; mỗi nút mở cửa trạm kế.
  //     Cuối hành lang làn dưới là nút sát tường cách xa gần khác nhau: tới sát rồi bắn nhanh mở cửa phía dưới, rẽ phải đi xuống cờ.
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

  var C_1 = ['aim_fire()', 'turn_right()', 'aim_fire()', 'turn_right()', 'forward(3)'];
  var C_2 = ['aim_left()', 'move()', 'aim_left()', 'forward(2)'];

  var C_3 = ['quick_aim()', 'turn_left()', 'quick_aim()', 'u_turn()', 'forward(4)', 'turn_right()'];
  var C_4 = FOR(3, ['aim_right()', 'move()']).concat(['move()']);
  var C_5 = ['fire_left("fast")', 'fire("charge")', 'forward(5)', 'fire_left("charge")', 'turn_right()', 'forward(3)'];
  var T_FIRE_LEFT = ['turn_left()', 'fire(p)', 'turn_right()'];

  var C_6 = ['close_fire()', 'turn_right()', 'close_fire()', 'turn_right()', 'forward(3)'];
  var C_7 = ['scan_left()', 'turn_right()', 'scan_left()'];
  var C_8 = ['aim_turn()', 'aim_turn()', 'forward(2)'];
  var C_9 = ['shot_right("charge")', 'move()', 'shot_right("fast")', 'forward(2)'];

  var L_10 = FOR(3, ['aim_left()', 'move()']).concat(['close_fire()', 'turn_right()', 'go_to_wall()']);

  var DS = [
    /* ------------------------------------------------ hàng 1: làm quen */
    man({
      so: 1, ten: 'Hàm aim_fire()', yMoi: 'chọn lực bằng mắt hồng ngoại: distance() > 1 thì bắn tụ, còn không thì bắn nhanh',
      mucTieu: 'bong-mo', hamCuaEmCan: ['fire', 'turn_right', 'forward', 'move'], taoHam: ['aim_fire'], chinhCoDinh: true,
      deBai: 'Bắn nhanh bay tối đa 2 ô, nên nút có distance() là 0 hay 1 thì bắn nhanh tới, từ 2 trở lên phải bắn tụ. ' +
        'Em chế aim_fire(): đo bằng mắt hồng ngoại rồi tự chọn lực. Chương trình chính đã khóa, gọi aim_fire() hai lần: một nút xa, một nút gần có thùng sau lưng. Thùng phải nằm yên.',
      veMaMau: 'Chương trình chính bị khóa. Mở Xưởng hàm, tạo aim_fire() với if distance() > 1: … else: … dùng fire(p) của em.',
      san: SAN_1, batDau: { x: 3, y: 4, huong: 0 }, noi: NOI_1,
      bongMo: { x: 3, y: 8, huong: 2, thung: [{ x: 2, y: 5 }] },
      maMau: bai(C_1),
      sao: { o: 18, nhip: 7 },
      loiGiai: { chinh: C_1.slice(), hamCuaEmMoi: [AIM()] },
      loiGiaiKhac: { moTa: 'Viết điều kiện distance() >= 2 kèm một dòng chú thích: đúng, thêm một ô', baiLam: bai(C_1), hamCuaEmMoi: [H('aim_fire', [], ['# 2 ô trở lên thì bắn tụ'].concat(IF('distance() >= 2', ['fire("charge")'], ['fire("fast")'])))] },
      loiSai: [
        { moTa: 'So với 0 như smart_fire: nút cách 2 ô cũng bị bắn tụ, xe giật lùi xô thùng', baiLam: bai(C_1), hamCuaEmMoi: [H('aim_fire', [], IF('distance() > 0', ['fire("charge")'], ['fire("fast")']))], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'So với 2: nút xa có distance() đúng bằng 2 nên bị bắn nhanh, bóng rơi giữa đường', baiLam: bai(C_1), hamCuaEmMoi: [H('aim_fire', [], IF('distance() > 2', ['fire("charge")'], ['fire("fast")']))], phaiCoMa: ['ban-ngan'] },
        { moTa: 'Đảo hai nhánh: nút xa bị bắn nhanh, nút gần bị bắn tụ', baiLam: bai(C_1), hamCuaEmMoi: [H('aim_fire', [], IF('distance() > 1', ['fire("fast")'], ['fire("charge")']))], phaiCoMa: ['ban-ngan'] }
      ],
      goiY: ['Bóng bắn nhanh đi qua ô thứ nhất, ô thứ hai rồi rơi. Nút ở ô thứ hai thì distance() là 1.',
        'if distance() > 1: fire("charge") còn else: fire("fast").']
    }),

    man({
      so: 2, ten: 'Hàm aim_left()', yMoi: 'hàm gọi hàm có cảm biến: quay trái, aim_fire(), quay lại',
      mucTieu: 'bong-mo', hamCuaEmCan: ['aim_fire', 'fire', 'turn_left', 'turn_right', 'forward', 'move'], taoHam: ['aim_left'], chinhCoDinh: true,
      deBai: 'Hành lang có hai nút ở bên trái, xa gần khác nhau; mỗi nút mở một cánh cửa phía trước. Đưa xe tới chỗ xe mờ. Em chế aim_left(): quay trái, gọi aim_fire() của em, rồi quay lại. ' +
        'Chương trình chính đã khóa, gọi aim_left() ở hai chỗ.',
      veMaMau: 'Chương trình chính bị khóa. Tạo aim_left() trong Xưởng hàm: ba dòng.',
      san: SAN_2, batDau: { x: 1, y: 4, huong: 1 }, noi: NOI_2,
      bongMo: { x: 4, y: 5, huong: 1 },
      maMau: bai(C_2),
      sao: { o: 22, nhip: 9 },
      loiGiai: { chinh: C_2.slice(), hamCuaEmMoi: [H('aim_left', [], T_AIM_LEFT)] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: bai(C_2), hamCuaEmMoi: [H('aim_left', [], ['# quay về phía nút rồi tự chọn lực'].concat(T_AIM_LEFT))] },
      congThucKhac: [{ moTa: 'Viết thẳng if / else trong aim_left() thay cho gọi aim_fire()', baiLam: bai(C_2), hamCuaEmMoi: [H('aim_left', [], nhieu(['turn_left()'], T_AIM, ['turn_right()']))] }],
      loiSai: [
        { moTa: 'Viết cứng fire("charge"): ở nút gần xe giật lùi xuống hốc', baiLam: bai(C_2), hamCuaEmMoi: [H('aim_left', [], ['turn_left()', 'fire("charge")', 'turn_right()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Viết cứng fire("fast"): nút đầu cách 3 ô, bóng rơi giữa đường', baiLam: bai(C_2), hamCuaEmMoi: [H('aim_left', [], ['turn_left()', 'fire("fast")', 'turn_right()'])], phaiCoMa: ['ban-ngan'] },
        { moTa: 'Quên quay lại: xe vẫn quay mặt lên, đi vào tường', baiLam: bai(C_2), hamCuaEmMoi: [H('aim_left', [], ['turn_left()', 'aim_fire()'])], phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Hàm của em gọi được hàm của em khác: aim_fire() đã làm ở màn trước.',
        'Quay trái thì mắt hồng ngoại nhìn về phía nút; bắn xong quay phải để đi tiếp.']
    }),

    man({
      so: 3, ten: 'Sửa hàm quick_aim()', yMoi: 'sửa hàm lỗi: so với tầm bắn nhanh, distance() > 2 thành distance() > 1',
      mucTieu: 'bong-mo', hamCuaEmCan: ['aim_fire', 'fire', 'turn_left', 'turn_right', 'u_turn', 'forward', 'move'], chinhCoDinh: true,
      deBai: 'Sola cũng viết một hàm tự chọn lực, quick_aim(), nhưng so distance() với 2. Chương trình chính đã khóa, gọi quick_aim() hai lần: nút gần có thùng sau lưng, rồi nút xa có distance() đúng bằng 2. ' +
        'Chạy thử xem phát nào hỏng, rồi sửa một dòng trong quick_aim(). Thùng phải nằm yên.',
      veMaMau: 'Chạy thử. Nút xa có distance() bằng mấy? Bắn nhanh bay được mấy ô?',
      san: SAN_3, batDau: { x: 3, y: 5, huong: 3 }, noi: NOI_3,
      bongMo: { x: 3, y: 0, huong: 1, thung: [{ x: 4, y: 5 }] },
      maMau: bai(C_3, [H('quick_aim', [], IF('distance() > 2', ['fire("charge")'], ['fire("fast")']))]),
      sao: { o: 24, nhip: 9 },
      loiGiai: bai(C_3, [H('quick_aim', [], T_AIM)]),
      loiGiaiKhac: { moTa: 'Sửa thành distance() >= 2 kèm một dòng chú thích: đúng, thêm một ô', baiLam: bai(C_3, [H('quick_aim', [], ['# từ 2 trở lên thì bắn tụ'].concat(IF('distance() >= 2', ['fire("charge")'], ['fire("fast")'])))]) },
      congThucKhac: [{ moTa: 'Gọi aim_fire() của em trong quick_aim()', baiLam: bai(C_3, [H('quick_aim', [], ['aim_fire()'])]) }],
      loiSai: [
        { moTa: 'Để nguyên bản của Sola: nút xa bị bắn nhanh, bóng rơi giữa đường', baiLam: bai(C_3, [H('quick_aim', [], IF('distance() > 2', ['fire("charge")'], ['fire("fast")']))]), phaiCoMa: ['ban-ngan'] },
        { moTa: 'Sửa thành distance() > 0: nút gần cũng bị bắn tụ, xe giật lùi xô thùng', baiLam: bai(C_3, [H('quick_aim', [], IF('distance() > 0', ['fire("charge")'], ['fire("fast")']))]), phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Sửa nhầm chỗ: đổi chỗ hai lực, nút gần bị bắn tụ', baiLam: bai(C_3, [H('quick_aim', [], IF('distance() > 2', ['fire("fast")'], ['fire("charge")']))]), phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Bắn nhanh tới được nút có distance() là 0 hay 1. Nút có distance() = 2 thì phải bắn tụ.',
        'Chỉ cần sửa số trong phép so sánh.']
    }),

    /* ------------------------------------------------ hàng 2: luyện */
    man({
      so: 4, ten: 'Hàm aim_right() trong vòng lặp', yMoi: 'chương trình chính gọi hàm có cảm biến trong vòng for, mỗi lần một nút xa gần khác',
      mucTieu: 'bong-mo', hamCuaEmCan: ['aim_fire', 'fire', 'turn_left', 'turn_right', 'move'], taoHam: ['aim_right'], chinhCoDinh: true,
      deBai: 'Ba nút nằm bên PHẢI đường đi, nút đầu xa, hai nút sau gần. Chương trình chính đã khóa: vòng lặp ba lần gọi aim_right() rồi tiến một ô. ' +
        'Em chế aim_right(): quay phải, aim_fire(), quay lại. Bắn tụ thì xe giật sang làn trên, bắn nhanh thì xe đứng yên. Đưa xe tới chỗ xe mờ.',
      veMaMau: 'Chương trình chính bị khóa. Tạo aim_right() như aim_left() nhưng quay về phía bên phải.',
      san: SAN_4, batDau: { x: 1, y: 3, huong: 1 }, noi: NOI_4,
      bongMo: { x: 5, y: 2, huong: 1 },
      maMau: bai(C_4),
      sao: { o: 20, nhip: 13 },
      loiGiai: { chinh: C_4.slice(), hamCuaEmMoi: [H('aim_right', [], ['turn_right()', 'aim_fire()', 'turn_left()'])] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: bai(C_4), hamCuaEmMoi: [H('aim_right', [], ['# quay phải, tự chọn lực, quay lại', 'turn_right()', 'aim_fire()', 'turn_left()'])] },
      loiSai: [
        { moTa: 'Quay trái thay vì quay phải: mắt hồng ngoại nhìn vào tường', baiLam: bai(C_4), hamCuaEmMoi: [H('aim_right', [], ['turn_left()', 'aim_fire()', 'turn_right()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Viết cứng fire("fast"): nút đầu cách 3 ô, bóng rơi giữa đường', baiLam: bai(C_4), hamCuaEmMoi: [H('aim_right', [], ['turn_right()', 'fire("fast")', 'turn_left()'])], phaiCoMa: ['ban-ngan'] },
        { moTa: 'Viết cứng fire("charge"): ở nút gần xe giật lên hốc', baiLam: bai(C_4), hamCuaEmMoi: [H('aim_right', [], ['turn_right()', 'fire("charge")', 'turn_left()'])], phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Cùng một hàm chạy ba lần, mỗi lần mắt hồng ngoại đo lại nên lực tự đổi.',
        'Thân hàm ba dòng: turn_right(), aim_fire(), turn_left().']
    }),

    man({
      so: 5, ten: 'Hàm fire_left(p)', yMoi: 'hàm có tham số lực p, truyền tiếp p cho fire(p) (hàm gọi hàm)',
      hamCuaEmCan: ['fire', 'turn_left', 'turn_right', 'forward', 'move'], taoHam: ['fire_left'], chinhCoDinh: true,
      deBai: 'Băng chuyền chạy ngược chắn đường; nút A bên trái tắt băng, nút B cuối băng và nút C bên trái ở cuối đường mở hai cửa xuống cờ. ' +
        'Em chế fire_left(p): quay trái, bắn với lực p bằng fire(p), quay lại. Chương trình chính đã khóa, gọi fire_left("fast") rồi fire_left("charge").',
      veMaMau: 'Chương trình chính bị khóa. Tạo fire_left(p): trong thân, gọi fire(p) để truyền tiếp lực p.',
      san: SAN_5, batDau: { x: 2, y: 3, huong: 1 }, noi: NOI_5,
      maMau: bai(C_5),
      sao: { o: 20, nhip: 16 },
      loiGiai: { chinh: C_5.slice(), hamCuaEmMoi: [H('fire_left', ['p'], T_FIRE_LEFT)] },
      loiGiaiKhac: { moTa: 'Viết shoot(p), wait() thay cho fire(p): đúng, thêm một ô', baiLam: bai(C_5), hamCuaEmMoi: [H('fire_left', ['p'], ['turn_left()', 'shoot(p)', 'wait()', 'turn_right()'])] },
      loiSai: [
        { moTa: 'Viết cứng fire("fast"): nút C cách 3 ô, bóng rơi giữa đường', baiLam: bai(C_5), hamCuaEmMoi: [H('fire_left', ['p'], ['turn_left()', 'fire("fast")', 'turn_right()'])], phaiCoMa: ['ban-ngan'] },
        { moTa: 'Viết cứng fire("charge"): ở nút A xe giật lùi xuống hốc', baiLam: bai(C_5), hamCuaEmMoi: [H('fire_left', ['p'], ['turn_left()', 'fire("charge")', 'turn_right()'])], phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên quay lại: xe quay mặt lên, phát bắn nút B đi sai hướng', baiLam: bai(C_5), hamCuaEmMoi: [H('fire_left', ['p'], ['turn_left()', 'fire(p)'])], phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['fire_left("fast") thì p là "fast"; trong thân, fire(p) nhận đúng chữ đó.',
        'Thân hàm ba dòng: turn_left(), fire(p), turn_right().']
    }),

    man({
      so: 6, ten: 'Hàm close_fire()', yMoi: 'hàm dùng go_to_wall(): đi tới sát nút rồi bắn nhanh để xe đứng yên ở chỗ rẽ',
      mucTieu: 'bong-mo', hamCuaEmCan: ['go_to_wall', 'fire', 'turn_right', 'forward', 'move'], taoHam: ['close_fire'], chinhCoDinh: true,
      deBai: 'Ba đoạn đường dài ngắn khác nhau; cuối mỗi đoạn có một nút mở cửa ở chỗ rẽ. Em chế close_fire(): đi tới sát nút bằng go_to_wall() của gói Hồng ngoại rồi bắn nhanh. ' +
        'Sát nút mà bắn tụ thì xe giật lùi khỏi chỗ rẽ. Chương trình chính đã khóa. Đưa xe tới chỗ xe mờ.',
      veMaMau: 'Chương trình chính bị khóa. Tạo close_fire(): hai dòng.',
      san: SAN_6, batDau: { x: 1, y: 1, huong: 1 }, noi: NOI_6,
      bongMo: { x: 1, y: 3, huong: 3 },
      maMau: bai(C_6),
      sao: { o: 18, nhip: 12 },
      loiGiai: { chinh: C_6.slice(), hamCuaEmMoi: [H('close_fire', [], ['go_to_wall()', 'fire("fast")'])] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: bai(C_6), hamCuaEmMoi: [H('close_fire', [], ['# tới sát nút rồi bắn nhanh', 'go_to_wall()', 'fire("fast")'])] },
      congThucKhac: [{ moTa: 'Viết thẳng vòng while distance() > 0: move() trong hàm', baiLam: bai(C_6), hamCuaEmMoi: [H('close_fire', [], ['while distance() > 0:', '    move()', 'fire("fast")'])] }],
      loiSai: [
        { moTa: 'Bắn tụ khi đã sát nút: xe giật lùi một ô, rẽ sai chỗ', baiLam: bai(C_6), hamCuaEmMoi: [H('close_fire', [], ['go_to_wall()', 'fire("charge")'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đếm cứng forward(2): ở đoạn đầu xe dừng sớm, rẽ vào tường', baiLam: bai(C_6), hamCuaEmMoi: [H('close_fire', [], ['forward(2)', 'fire("fast")'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Bắn trước rồi mới đi: bóng nhanh chưa tới nút', baiLam: bai(C_6), hamCuaEmMoi: [H('close_fire', [], ['fire("fast")', 'go_to_wall()'])], phaiCoMa: ['ban-ngan'] }
      ],
      goiY: ['go_to_wall() đi cho tới khi distance() là 0: nút ở ngay trước mũi.',
        'Sát nút rồi thì bắn nhanh là tới, xe lại không giật.']
    }),

    /* ------------------------------------------------ hàng 3: biến thể */
    man({
      so: 7, ten: 'Hàm scan_left()', yMoi: 'hàm có vòng lặp bên trong: mỗi vòng aim_left() rồi tiến, gọi ở hai hành lang',
      mucTieu: 'bong-mo', hamCuaEmCan: ['aim_left', 'aim_fire', 'fire', 'fire_left', 'turn_left', 'turn_right', 'move'], taoHam: ['scan_left'], chinhCoDinh: true,
      deBai: 'Hai hành lang nối nhau, mỗi hành lang có hai nút bên trái, xa gần khác nhau. Em chế scan_left(): vòng lặp hai lần, mỗi lần aim_left() rồi tiến một ô. ' +
        'Chương trình chính đã khóa: scan_left(), quay phải, scan_left(). Bắn tụ thì xe giật sang làn bên cạnh. Đưa xe tới chỗ xe mờ.',
      veMaMau: 'Chương trình chính bị khóa. Tạo scan_left() với for i in range(2): trong thân hàm.',
      san: SAN_7, batDau: { x: 1, y: 3, huong: 1 }, noi: NOI_7,
      bongMo: { x: 2, y: 6, huong: 2 },
      maMau: bai(C_7),
      sao: { o: 22, nhip: 17 },
      loiGiai: { chinh: C_7.slice(), hamCuaEmMoi: [H('scan_left', [], FOR(2, ['aim_left()', 'move()']))] },
      loiGiaiKhac: { moTa: 'Viết hai lần aim_left(), move() không dùng vòng lặp: đúng, thêm một ô', baiLam: bai(C_7), hamCuaEmMoi: [H('scan_left', [], ['aim_left()', 'move()', 'aim_left()', 'move()'])] },
      loiSai: [
        { moTa: 'Vòng lặp ba lần: xe đi quá cuối hành lang', baiLam: bai(C_7), hamCuaEmMoi: [H('scan_left', [], FOR(3, ['aim_left()', 'move()']))], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quên move(): xe bắn hai lần một nút', baiLam: bai(C_7), hamCuaEmMoi: [H('scan_left', [], FOR(2, ['aim_left()']))], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Viết cứng fire_left("charge"): ở nút gần xe giật vào hốc', baiLam: bai(C_7), hamCuaEmMoi: [H('scan_left', [], FOR(2, ['fire_left("charge")', 'move()']))], phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Thân hàm cũng chứa được vòng lặp for, như chương trình chính.',
        'for i in range(2): rồi thụt vào hai dòng aim_left() và move().']
    }),

    man({
      so: 8, ten: 'Hàm aim_turn()', yMoi: 'cú giật của phát bắn tụ đẩy thùng sau lưng vào chỗ thùng mờ; phát bắn nhanh giữ thùng kia nằm yên',
      mucTieu: 'bong-mo', hamCuaEmCan: ['aim_fire', 'fire', 'turn_left', 'forward', 'move'], taoHam: ['aim_turn'], chinhCoDinh: true,
      deBai: 'Hai thùng nặng: một thùng phải trượt xuống chỗ thùng mờ, thùng kia phải nằm yên. Nhớ lại gói Nhà máy: bắn tụ thì cú giật đẩy thùng sau lưng trượt đi. ' +
        'Em chế aim_turn(): aim_fire() rồi quay trái. Chương trình chính đã khóa: aim_turn() hai lần rồi forward(2).',
      veMaMau: 'Chương trình chính bị khóa. Tạo aim_turn(): hai dòng.',
      san: SAN_8, batDau: { x: 3, y: 3, huong: 0 },
      bongMo: { x: 3, y: 5, huong: 2, thung: [{ x: 4, y: 3 }, { x: 3, y: 6 }] },
      maMau: bai(C_8),
      sao: { o: 18, nhip: 6 },
      loiGiai: { chinh: C_8.slice(), hamCuaEmMoi: [H('aim_turn', [], ['aim_fire()', 'turn_left()'])] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: bai(C_8), hamCuaEmMoi: [H('aim_turn', [], ['# đo, bắn, rồi quay trái', 'aim_fire()', 'turn_left()'])] },
      loiSai: [
        { moTa: 'Viết cứng fire("charge"): phát thứ hai đẩy luôn thùng bên phải', baiLam: bai(C_8), hamCuaEmMoi: [H('aim_turn', [], ['fire("charge")', 'turn_left()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Viết cứng fire("fast"): không có cú giật, thùng sau lưng nằm yên chắn đường', baiLam: bai(C_8), hamCuaEmMoi: [H('aim_turn', [], ['fire("fast")', 'turn_left()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quay trước rồi mới bắn: lần đầu mắt hồng ngoại nhìn về nút gần', baiLam: bai(C_8), hamCuaEmMoi: [H('aim_turn', [], ['turn_left()', 'aim_fire()'])], phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Cú giật của phát bắn tụ đẩy thùng ngay sau lưng trượt tới khi gặp tường.',
        'Thân hàm: aim_fire() rồi turn_left().']
    }),

    man({
      so: 9, ten: 'Đố: lực bị viết cứng', yMoi: 'sửa hàm lỗi: tham số p bị bỏ quên, thân hàm viết cứng "charge"',
      mucTieu: 'bong-mo', hamCuaEmCan: ['aim_fire', 'fire', 'turn_left', 'turn_right', 'forward', 'move'], chinhCoDinh: true,
      deBai: 'Sola chế shot_right(p): quay phải, bắn, quay lại. Chương trình chính đã khóa, gọi shot_right("charge") rồi shot_right("fast"). ' +
        'Nhưng ở nút thứ hai xe vẫn giật lùi xuống hốc. Tìm và sửa một dòng trong shot_right(p).',
      veMaMau: 'Chạy thử. Lời gọi đưa "fast" vào p, mà thân hàm có dùng p không?',
      san: SAN_9, batDau: { x: 5, y: 3, huong: 3 }, noi: NOI_9,
      bongMo: { x: 2, y: 4, huong: 3 },
      maMau: bai(C_9, [H('shot_right', ['p'], ['turn_right()', 'fire("charge")', 'turn_left()'])]),
      sao: { o: 18, nhip: 9 },
      loiGiai: bai(C_9, [H('shot_right', ['p'], ['turn_right()', 'fire(p)', 'turn_left()'])]),
      loiGiaiKhac: { moTa: 'Cùng cách sửa, thêm một dòng chú thích trong hàm', baiLam: bai(C_9, [H('shot_right', ['p'], ['# dùng lực của lời gọi', 'turn_right()', 'fire(p)', 'turn_left()'])]) },
      congThucKhac: [{ moTa: 'Viết shoot(p), wait() thay cho fire(p)', baiLam: bai(C_9, [H('shot_right', ['p'], ['turn_right()', 'shoot(p)', 'wait()', 'turn_left()'])]) }, { moTa: 'Dùng aim_fire() cho mắt hồng ngoại tự chọn lực (p thành thừa)', baiLam: bai(C_9, [H('shot_right', ['p'], ['turn_right()', 'aim_fire()', 'turn_left()'])]) }],
      loiSai: [
        { moTa: 'Để nguyên bản của Sola: nút gần cũng bị bắn tụ, xe giật xuống hốc', baiLam: bai(C_9, [H('shot_right', ['p'], ['turn_right()', 'fire("charge")', 'turn_left()'])]), phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Sửa thành "fast": nút đầu cách 3 ô, bóng rơi giữa đường', baiLam: bai(C_9, [H('shot_right', ['p'], ['turn_right()', 'fire("fast")', 'turn_left()'])]), phaiCoMa: ['ban-ngan'] },
        { moTa: 'Viết fire("p"): có dấu nháy thì p là chữ p, không phải tham số', baiLam: bai(C_9, [H('shot_right', ['p'], ['turn_right()', 'fire("p")', 'turn_left()'])]), phaiCoMa: ['luc-ban-sai'] }
      ],
      goiY: ['Tham số p nhận chữ trong ngoặc của lời gọi: shot_right("fast") thì p là "fast".',
        'Đổi fire("charge") thành fire(p), không có dấu nháy.']
    }),

    /* ------------------------------------------------ trùm */
    man({
      so: 10, ten: 'Trùm: Ba hành lang nút', yMoi: 'một chương trình cho ba sân: aim_left() trong vòng lặp, close_fire() ở cuối hành lang',
      hang: 'trum', hamCuaEmCan: ['aim_left', 'aim_fire', 'close_fire', 'scan_left', 'go_to_wall', 'fire', 'fire_left', 'turn_left', 'turn_right', 'move'],
      huyHieu: { ma: 'che-luc-ban', ten: 'Huy hiệu Hàm lực bắn' },
      deBai: 'Ba sân, một chương trình. Sân nào cũng có ba nút bên trái hành lang, mỗi nút mở cửa trạm kế, nhưng nút xa nằm ở trạm khác nhau. ' +
        'Cuối hành lang là một nút nữa, xa gần khác nhau, mở cửa xuống cờ. Dùng các hàm của em để tới cờ trên cả ba sân.',
      veMaMau: 'Chương trình có sẵn bắn cứng theo sân thứ nhất. Hãy để mắt hồng ngoại chọn lực.',
      san: SAN_10, batDau: BD_10, noi: NOI_10,
      maMau: bai(nhieu(['fire_left("charge")', 'move()'], FOR(2, ['fire_left("fast")', 'move()']), ['close_fire()', 'turn_right()', 'go_to_wall()'])),
      sao: { o: 26, nhip: 52 },
      loiGiai: bai(L_10),
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: bai(['# mắt hồng ngoại chọn lực ở mỗi trạm'].concat(L_10)) },
      congThucKhac: [{ moTa: 'Gọi scan_left() rồi thêm một lần aim_left() thay cho vòng lặp ba lần', baiLam: bai(['scan_left()', 'aim_left()', 'move()', 'close_fire()', 'turn_right()', 'go_to_wall()']) }],
      loiSai: [
        { moTa: 'Bắn cứng theo sân thứ nhất: ở sân khác nút xa nằm chỗ khác', baiLam: bai(nhieu(['fire_left("charge")', 'move()'], FOR(2, ['fire_left("fast")', 'move()']), ['close_fire()', 'turn_right()', 'go_to_wall()'])), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Luôn bắn nhanh: nút xa cách 3 ô, bóng rơi giữa đường', baiLam: bai(nhieu(FOR(3, ['fire_left("fast")', 'move()']), ['close_fire()', 'turn_right()', 'go_to_wall()'])), phaiCoMa: ['ban-ngan', 'chua-toi-co'] },
        { moTa: 'Quên close_fire(): xe rẽ ngay khi cửa phía dưới còn đóng', baiLam: bai(nhieu(FOR(3, ['aim_left()', 'move()']), ['turn_right()', 'go_to_wall()'])), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Ở mỗi trạm, aim_left() quay về phía nút và tự chọn lực theo distance().',
        'Cuối hành lang: close_fire() đi tới sát nút rồi bắn nhanh, quay phải, go_to_wall() xuống cờ.']
    })
  ];

  ManHoc.manCheLucBan = DS;
  if (laNode) module.exports = ManHoc;
})();
