/* ============================================================================
   man-luc-ban.js — "Robot Chấn Hưng": CHƯƠNG `luc-ban` · LỰC BẮN (10 màn, 26/10). Chương thứ ba của gói Súng hơi, sau `che-sung-hoi` (KE-HOACH-MUA.md mục 10).
   Robot là XE HAI BÁNH gắn SÚNG HƠI: robot { than: 'hai-banh', tay: 'hoi', camBien: [] } (8–10 thêm cảm biến khoảng cách ở hông). Mọi màn khai lucBan: true.
   Ý mới (luật ở san-hoc.js, phần THÙNG NẶNG + SÚNG HƠI, mục LỰC BẮN): spray(p) / spray_back(p) nhận một CHUỖI p:
       "high"  BẮN TỤ:    bóng bay tới vật cản đầu tiên, xe GIẬT một ô (như hai chương trước; spray() không đối số cũng là bắn tụ)
       "low"    BẮN NHANH: bóng bay TỐI ĐA 2 Ô rồi rơi, xe KHÔNG GIẬT
   Lý do phải chọn: nút gần mà sau lưng xe là thùng đang ở đúng chỗ (thùng mờ, ô đích) thì bắn tụ sẽ hất thùng đi → bắn nhanh; nút xa hơn 2 ô, hay cần cú giật để đẩy thùng → bắn tụ.
   Ý Python: CHUỖI làm đối số (1–3) · THAM SỐ mang chuỗi (4 squirt(p), 5 squirt_back(p)) · dùng lại hàm có tham số (6) · tham số bị bỏ quên (7) · if / else chọn đối số theo cảm biến (8 smart_spray, 9) · trùm 3 sân (10).

   HÀM CỦA EM MỚI (tên cốt truyện, khóa trong kho, có mục Sổ lệnh):
     luc-ban.4 squirt(p)      = spray(p), wait()                                                     bắn ra trước với lực p (1 nhịp)
     luc-ban.5 squirt_back(p) = spray_back(p), wait()                                                bắn ra sau với lực p (1 nhịp)
     luc-ban.8 smart_spray() = if front_clear(): squirt("high") / else: squirt("low")                trước mũi trống (nút ở xa) thì bắn tụ, vật sát mũi thì bắn nhanh (1 nhịp)
   HÀM CỦA MÀN: luc-ban.7 tap_left(p) thân ban đầu bỏ quên p (spray()), sửa thành spray(p) · luc-ban.9 pick_spray() thân ban đầu đảo hai nhánh, sửa lại cho đúng.

   Sao: sao.nhip = số nhịp của lời giải chuẩn = đường ngắn nhất (BFS do-duong-sung-hoi.mjs có thêm hai hành động bắn nhanh khi man.lucBan); sao.o = ô của lời giải chuẩn.
   Hướng: 0 lên, 1 phải, 2 xuống, 3 trái. (x, y) với y = 0 ở hàng trên. Nối tiếp man-chuoi-1.js vào cùng window.ManHoc. Thứ tự chương: thu-tu-chuong.js.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var KHAY = BANH.concat(['spray', 'spray_back']);
  var KHAY_CAM = KHAY.concat(['front_clear']);                       // 8–10: thêm cảm biến khoảng cách
  var CAM = [{ ma: 'khoang-cach', o: 'hong' }];

  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo, than: than.slice() }; }

  // thân các hàm (cách chuẩn)
  var T_FIRE = ['spray(p)', 'wait()'];
  var T_FIRE_BACK = ['spray_back(p)', 'wait()'];
  var T_SMART = ['if front_clear():', '    squirt("high")', 'else:', '    squirt("low")'];
  var T_TAP_CU = ['turn_left()', 'spray()', 'wait()', 'turn_right()'];          // 7: quên dùng p
  var T_TAP = ['turn_left()', 'spray(p)', 'wait()', 'turn_right()'];
  var T_PICK_CU = ['if front_clear():', '    squirt("low")', 'else:', '    squirt("high")'];   // 9: đảo nhánh
  var FIRE = function () { return H('squirt', ['p'], T_FIRE); };
  var FIRE_BACK = function () { return H('squirt_back', ['p'], T_FIRE_BACK); };
  var SMART = function () { return H('smart_spray', [], T_SMART); };

  /** Điền các trường chung của chương (không đụng tới trường màn đã khai). */
  function man(m) {
    m.chuong = 'luc-ban';
    m.cauTruc = ['for', 'if', 'while'];
    m.loaiRobot = 'banh';
    m.robot = { than: 'hai-banh', tay: 'hoi', camBien: m.coCam ? CAM.slice() : [] };
    m.hamGoc = m.hamGoc || (m.coCam ? KHAY_CAM : KHAY);
    delete m.coCam;
    m.lucBan = true;
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    if (m.mucTieu === 'toi-co') delete m.mucTieu;                    // mặc định của lõi
    return ManHoc.chuanHoa(m);
  }

  /* ------------------------------------------------------------------- sân */

  // 1: xe (3,1) quay trái, nút (1,1) cách 2 ô; thùng (4,1) ngay sau lưng, có chỗ trượt tới (5,1); cửa (3,2) dưới xe, xe mờ (3,4)
  var SAN_1 = ['#######', '#N..H.#', '###C###', '###.###', '###.###', '#######'];
  // 2: xe (4,1) quay trái, nút (1,1) cách 3 ô; cú giật đưa xe lùi tới (5,1), ngay trên cửa (5,2); cờ (5,3)
  var SAN_2 = ['#######', '#N....#', '#####C#', '#####F#', '#######'];
  // 3: xe (3,3) quay trái; nút gần (1,3) cách 2 ô, thùng (4,3) sau lưng; nút xa (3,0) cách 3 ô; cửa 1 (3,4) theo nút gần, cửa 2 (3,6) theo nút xa; xe mờ (3,7)
  var SAN_3 = ['###N###', '###.###', '###.###', '#N..H.#', '###C###', '###.###', '###C###', '###.###', '#######'];
  var NOI_3 = [{ nut: { x: 1, y: 3 }, cua: [{ x: 3, y: 4 }] }, { nut: { x: 3, y: 0 }, cua: [{ x: 3, y: 6 }] }];
  // 4: như 3 nhưng soi gương: xe (3,3) quay phải, nút gần (5,3), thùng (2,3) sau lưng; nút xa (3,0)
  var SAN_4 = ['###N###', '###.###', '###.###', '#.H..N#', '###C###', '###.###', '###C###', '###.###', '#######'];
  var NOI_4 = [{ nut: { x: 5, y: 3 }, cua: [{ x: 3, y: 4 }] }, { nut: { x: 3, y: 0 }, cua: [{ x: 3, y: 6 }] }];
  // 5: xe (2,3) quay lên; nút (2,5) SAU LƯNG cách 2 ô; thùng (2,2) trước mũi, có chỗ trượt tới (2,1); cửa (3,3) bên phải, xe mờ (5,3)
  var SAN_5 = ['#######', '##.####', '##H####', '##.C..#', '##.####', '##N####', '#######'];
  // 6: xe (3,1) quay trái, nút (1,1) cách 2 ô; thùng (4,1) đã nằm trên đích sau lưng (bị giật thì kẹt góc (5,1)); cửa (3,2); thùng (2,3) cạnh ô đích (1,3)
  var SAN_6 = ['#######', '#N..h.#', '###C###', '#DH...#', '#######'];
  // 7: xe (3,3) quay lên; nút (1,3) bên trái cách 2 ô, thùng (4,3) bên phải; cửa (3,2) trước mũi; xe mờ (3,0)
  var SAN_7 = ['###.###', '###.###', '###C###', '#N..H.#', '#######'];
  // 8: xe (3,3) quay phải; nút (4,3) SÁT mũi, thùng (2,3) sau lưng; nút xa (3,0) cách 3 ô; cửa 1 (3,4), cửa 2 (3,6), xe mờ (3,7)
  var SAN_8 = ['###N###', '###.###', '###.###', '#.H.N##', '###C###', '###.###', '###C###', '###.###', '#######'];
  var NOI_8 = [{ nut: { x: 4, y: 3 }, cua: [{ x: 3, y: 4 }] }, { nut: { x: 3, y: 0 }, cua: [{ x: 3, y: 6 }] }];
  // 9: lật dọc 8: xe (3,5) quay trái; nút (2,5) sát mũi, thùng (4,5) sau lưng; nút xa (3,8) cách 3 ô bên dưới; cửa 1 (3,4), cửa 2 (3,2), xe mờ (3,1)
  var SAN_9 = ['#######', '###.###', '###C###', '###.###', '###C###', '##N.H.#', '###.###', '###.###', '###N###'];
  var NOI_9 = [{ nut: { x: 2, y: 5 }, cua: [{ x: 3, y: 4 }] }, { nut: { x: 3, y: 8 }, cua: [{ x: 3, y: 2 }] }];
  // 10: ba sân, xe quay trái ở hàng 1. A: nút SÁT mũi, thùng sau lưng có chỗ trượt. B: nút cách 3 ô, cửa dưới ô xe giật tới, thùng (4,3) nằm ngoài đường.
  //     C: nút sát mũi, thùng sau lưng sát tường (bắn tụ cũng không xô được).
  var SAN_10 = [
    ['#######', '#N.H..#', '##C####', '##.####', '##.####', '#######'],
    ['#######', '#N....#', '#####C#', '####H.#', '#####.#', '#######'],
    ['######', '##N.H#', '###C##', '###.##', '###.##', '###.##', '######']
  ];
  var BD_10 = [{ x: 2, y: 1, huong: 3 }, { x: 4, y: 1, huong: 3 }, { x: 3, y: 1, huong: 3 }];
  var BM_10 = [{ x: 2, y: 4, huong: 2, thung: [{ x: 3, y: 1 }] }, { x: 5, y: 4, huong: 2, thung: [{ x: 4, y: 3 }] }, { x: 3, y: 5, huong: 2, thung: [{ x: 4, y: 1 }] }];

  /* ------------------------------------------------------------- chương trình */

  var L_1 = ['spray("low")', 'wait()', 'turn_left()', 'forward(3)'];
  var L_2 = ['spray("high")', 'wait()', 'turn_left()', 'forward(2)'];
  var L_3 = ['spray("low")', 'wait()', 'turn_right()', 'spray("high")', 'wait()', 'u_turn()', 'forward(3)'];
  var C_4 = ['squirt("low")', 'turn_left()', 'squirt("high")', 'u_turn()', 'forward(3)'];
  var C_5 = ['squirt_back("low")', 'turn_right()', 'forward(3)'];
  var L_6 = ['squirt("low")', 'turn_left()', 'forward(2)', 'turn_left()', 'squirt("high")'];
  var C_7 = ['tap_left("low")', 'forward(3)'];
  var C_8 = ['smart_spray()', 'turn_left()', 'smart_spray()', 'u_turn()', 'forward(3)'];
  var C_9 = ['pick_spray()', 'turn_left()', 'pick_spray()', 'u_turn()', 'forward(3)'];
  var L_10 = ['smart_spray()', 'turn_left()', 'go_wall()'];

  var DS = [
    /* ------------------------------------------------ hàng 1: làm quen */
    man({
      so: 1, ten: 'Bắn nhanh', hang: 'lam-quen', mucTieu: 'bong-mo', hamCuaEmCan: ['turn_left', 'forward', 'move'],
      deBai: 'spray("high") bắn tụ như mọi khi: tia nước bay xa, xe bị giật. spray("low") bắn nhanh: tia nước chỉ bay 2 ô nhưng xe đứng yên. ' +
        'Van cách xe 2 ô, thùng nằm ngay sau lưng: mở cửa mà không làm xô thùng, rồi đưa xe tới chỗ xe mờ.',
      veMaMau: 'Chương trình có sẵn bắn tụ. Chạy thử xem thùng sau lưng bị xô đi đâu, rồi chạm chữ "high" để đổi sang "low".',
      san: SAN_1, batDau: { x: 3, y: 1, huong: 3 },
      bongMo: { x: 3, y: 4, huong: 2, thung: [{ x: 4, y: 1 }] },
      maMau: { chinh: ['spray("high")', 'wait()', 'turn_left()', 'forward(3)'] },
      sao: { o: 11, nhip: 5 },
      loiGiai: { chinh: L_1.slice() },
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: { chinh: ['# bắn nhanh cho thùng nằm yên'].concat(L_1) } },
      loiSai: [
        { moTa: 'Bắn tụ: cú giật hất thùng sau lưng nhích sang phải, xe theo một ô', baiLam: { chinh: ['spray("high")', 'wait()', 'turn_left()', 'forward(3)'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Viết lực bằng chữ hoa: "Fast" không phải tên lực', baiLam: { chinh: ['spray("Fast")', 'wait()', 'turn_left()', 'forward(3)'] }, phaiCoMa: ['luc-ban-sai'] },
        { moTa: 'Quên dấu nháy: Python tưởng low là tên một biến', baiLam: { chinh: ['spray(low)', 'wait()', 'turn_left()', 'forward(3)'] }, phaiCoMa: ['loi-chay'] }
      ],
      goiY: ['Bắn tụ thì xe giật lùi đúng vào thùng sau lưng.', 'Van chỉ cách 2 ô, vừa tầm bắn nhanh: spray("low").']
    }),

    man({
      so: 2, ten: 'Van ở xa', hang: 'lam-quen', hamCuaEmCan: ['turn_left', 'forward', 'move'],
      deBai: 'Lần này van cách xe 3 ô, mà bắn nhanh chỉ bay được 2 ô. Chọn lực bắn tới được van, mở cửa rồi đưa xe tới cờ.',
      veMaMau: 'Chương trình có sẵn bắn nhanh. Chạy thử xem tia nước rơi ở đâu, rồi sửa.',
      san: SAN_2, batDau: { x: 4, y: 1, huong: 3 },
      maMau: { chinh: ['spray("low")', 'wait()'] },
      sao: { o: 11, nhip: 4 },
      loiGiai: { chinh: L_2.slice() },
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: { chinh: ['# van xa thì bắn tụ'].concat(L_2) } },
      loiSai: [
        { moTa: 'Bắn nhanh: tia nước rơi sau 2 ô, cửa vẫn đóng', baiLam: { chinh: ['spray("low")', 'wait()', 'turn_left()', 'forward(2)'] }, phaiCoMa: ['ban-ngan', 'chua-toi-co'] },
        { moTa: 'Lực lạ: "strong" không phải tên lực', baiLam: { chinh: ['spray("strong")', 'wait()', 'turn_left()', 'forward(2)'] }, phaiCoMa: ['luc-ban-sai'] }
      ],
      goiY: ['Bắn nhanh chỉ bay 2 ô. Van cách 3 ô.', 'Bắn tụ thì xe giật lùi một ô, vừa đúng ô ngay trên cửa.']
    }),

    man({
      so: 3, ten: 'Nhanh hay tụ', hang: 'lam-quen', mucTieu: 'bong-mo', hamCuaEmCan: ['turn_right', 'u_turn', 'forward', 'move'],
      deBai: 'Hai van, hai cửa: van bên trái mở cửa gần, van phía trên mở cửa xa. Thùng sau lưng phải nằm yên. Mỗi phát bắn chọn đúng lực, rồi đưa xe tới chỗ xe mờ.',
      veMaMau: 'Chương trình có sẵn bắn van bên trái. Viết tiếp: quay lên, bắn van trên, rồi đi xuống.',
      san: SAN_3, batDau: { x: 3, y: 3, huong: 3 }, noi: NOI_3, nhipTheoLoiGiai: true,
      bongMo: { x: 3, y: 7, huong: 2, thung: [{ x: 4, y: 3 }] },
      maMau: { chinh: ['spray("low")', 'wait()'] },
      sao: { o: 17, nhip: 7 },
      loiGiai: { chinh: L_3.slice() },
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: { chinh: ['# trái gần: nhanh, trên xa: tụ'].concat(L_3) } },
      loiSai: [
        { moTa: 'Bắn nhanh cả hai: van trên cách 3 ô nên tia nước rơi giữa đường', baiLam: { chinh: ['spray("low")', 'wait()', 'turn_right()', 'spray("low")', 'wait()', 'u_turn()', 'forward(3)'] }, phaiCoMa: ['ban-ngan', 'lech-bong-mo'] },
        { moTa: 'Bắn tụ cả hai: phát đầu hất thùng sau lưng đi', baiLam: { chinh: ['spray("high")', 'wait()', 'turn_right()', 'spray("high")', 'wait()', 'u_turn()', 'forward(3)'] }, phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Van trái cách 2 ô và sau lưng có thùng: bắn nhanh. Van trên cách 3 ô: chỉ bắn tụ mới tới.', 'Bắn tụ lên trên thì xe giật xuống một ô, qua cửa gần vừa mở.']
    }),

    /* ------------------------------------------------ hàng 2: luyện */
    man({
      so: 4, ten: 'Hàm squirt(p)', hang: 'luyen', mucTieu: 'bong-mo', hamCuaEmCan: ['turn_left', 'u_turn', 'forward', 'move'], taoHam: ['squirt'],
      deBai: 'Chương trình chính gọi squirt("low") rồi squirt("high"). Em tự chế squirt(p): bắn ra trước với lực p mà lời gọi đưa vào, rồi chờ một nhịp. Thùng sau lưng phải nằm yên.',
      veMaMau: 'Chương trình chính bị khóa. Mở Xưởng hàm, tạo squirt(p): trong thân, chạm ô lực của spray() để chọn p.',
      san: SAN_4, batDau: { x: 3, y: 3, huong: 1 }, noi: NOI_4, nhipTheoLoiGiai: true,
      bongMo: { x: 3, y: 7, huong: 2, thung: [{ x: 2, y: 3 }] },
      chinhCoDinh: true,
      maMau: { chinh: C_4.slice() },
      sao: { o: 17, nhip: 7 },
      loiGiai: { chinh: C_4.slice(), hamCuaEmMoi: [FIRE()] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [H('squirt', ['p'], ['# bắn với lực p', 'spray(p)', 'wait()'])] },
      loiSai: [
        { moTa: 'Quên dùng p: spray() luôn bắn tụ nên phát đầu hất thùng', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [H('squirt', ['p'], ['spray()', 'wait()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Viết cứng "low" trong hàm: phát thứ hai không tới van trên', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [H('squirt', ['p'], ['spray("low")', 'wait()'])], phaiCoMa: ['ban-ngan', 'lech-bong-mo'] },
        { moTa: 'Gọi squirt() mà chưa chế hàm', baiLam: { chinh: C_4.slice() }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['p là tên tạm cho lực mà lời gọi đưa vào: squirt("low") thì p là "low".', 'Thân hàm: spray(p) rồi wait().']
    }),

    man({
      so: 5, ten: 'Bắn nhanh ra sau', hang: 'luyen', mucTieu: 'bong-mo', hamCuaEmCan: ['turn_right', 'forward', 'move'], taoHam: ['squirt_back'],
      deBai: 'Van nằm sau lưng xe, cách 2 ô. Thùng nặng nằm ngay trước mũi: bắn tụ ra sau thì xe giật tới, đẩy thùng đi. Chương trình chính gọi squirt_back("low"): em chế squirt_back(p) như squirt(p) nhưng bắn ra sau.',
      veMaMau: 'Chương trình chính bị khóa. Tạo squirt_back(p) trong Xưởng hàm rồi bấm Chạy.',
      san: SAN_5, batDau: { x: 2, y: 3, huong: 0 },
      bongMo: { x: 5, y: 3, huong: 1, thung: [{ x: 2, y: 2 }] },
      chinhCoDinh: true,
      maMau: { chinh: C_5.slice() },
      sao: { o: 12, nhip: 5 },
      loiGiai: { chinh: C_5.slice(), hamCuaEmMoi: [FIRE_BACK()] },
      loiGiaiKhac: { moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [H('squirt_back', ['p'], ['# bắn ra sau với lực p', 'spray_back(p)', 'wait()'])] },
      loiSai: [
        { moTa: 'Bắn ra trước: tia nước không tới van sau lưng', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [H('squirt_back', ['p'], ['spray(p)', 'wait()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quên dùng p: spray_back() bắn tụ, xe giật tới đẩy thùng', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [H('squirt_back', ['p'], ['spray_back()', 'wait()'])], phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['spray_back(p) cũng nhận lực như spray(p).', 'Bắn nhanh ra sau thì xe không giật tới, thùng trước mũi nằm yên.']
    }),

    man({
      so: 6, ten: 'Nhanh để bấm, tụ để đẩy', hang: 'luyen', mucTieu: 'day-thung', hamCuaEmCan: ['squirt', 'turn_left', 'forward', 'move'],
      deBai: 'Một thùng đã nằm trên ô đích ngay sau lưng xe, thùng kia nằm dưới cạnh ô đích của nó. Mở cửa mà không làm xô thùng đã xếp, rồi dùng cú giật đẩy thùng kia vào đích. Dùng squirt(p) của em.',
      veMaMau: 'Tự viết chương trình. squirt(p) đã có trong kho.',
      san: SAN_6, batDau: { x: 3, y: 1, huong: 3 },
      maMau: { chinh: [] },
      sao: { o: 14, nhip: 6 },
      loiGiai: { chinh: L_6.slice() },
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: { chinh: ['# nhanh để bấm, tụ để đẩy'].concat(L_6) } },
      loiSai: [
        { moTa: 'Bắn tụ để mở cửa: thùng đã xếp bị hất vào góc', baiLam: { chinh: ['squirt("high")', 'turn_left()', 'forward(2)', 'turn_left()', 'squirt("high")'] }, phaiCoMa: ['thung-ket'] },
        { moTa: 'Bắn nhanh để đẩy: không có cú giật nên thùng nằm yên', baiLam: { chinh: ['squirt("low")', 'turn_left()', 'forward(2)', 'turn_left()', 'squirt("low")'] }, phaiCoMa: ['chua-day-thung'] }
      ],
      goiY: ['Mở cửa thì không được giật. Đẩy thùng thì phải giật.', 'Ở dưới, xe quay mặt sang phải rồi bắn tụ: cú giật đẩy thùng bên trái nhích vào đích.']
    }),

    /* ------------------------------------------------ hàng 3: biến thể */
    man({
      so: 7, ten: 'Đố: quên dùng p', hang: 'bien-the', mucTieu: 'bong-mo', hamCuaEmCan: ['turn_left', 'turn_right', 'forward', 'move'],
      deBai: 'Chương trình chính gọi tap_left("low"): quay trái, bắn van, quay lại. Nhưng hàm tap_left(p) của màn đang có lỗi nên thùng bên phải bị hất đi. Tìm và sửa một dòng trong tap_left(p).',
      veMaMau: 'Chạy thử. Hàm tap_left(p) nhận p mà có dùng p ở đâu không?',
      san: SAN_7, batDau: { x: 3, y: 3, huong: 0 },
      bongMo: { x: 3, y: 0, huong: 0, thung: [{ x: 4, y: 3 }] },
      chinhCoDinh: true,
      maMau: { chinh: C_7.slice(), hamCuaMan: [H('tap_left', ['p'], T_TAP_CU)] },
      sao: { o: 15, nhip: 6 },
      loiGiai: { chinh: C_7.slice(), hamCuaMan: [H('tap_left', ['p'], T_TAP)] },
      loiGiaiKhac: { moTa: 'Viết cứng "low" trong hàm (đúng ở màn này, nhưng p thành vô dụng)', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('tap_left', ['p'], ['# p chưa dùng', 'turn_left()', 'spray("low")', 'wait()', 'turn_right()'])] } },
      loiSai: [
        { moTa: 'Để nguyên: spray() bỏ quên p nên vẫn bắn tụ', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('tap_left', ['p'], T_TAP_CU)] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Bỏ quay lại: xe vẫn quay mặt sang trái nên đi vào tường', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('tap_left', ['p'], ['turn_left()', 'spray(p)', 'wait()'])] }, phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Hàm có tham số p mà thân không dùng p thì lời gọi đưa "low" vào cũng như không.', 'Đổi spray() thành spray(p).']
    }),

    man({
      so: 8, ten: 'Hàm smart_spray()', hang: 'bien-the', mucTieu: 'bong-mo', coCam: true, hamCuaEmCan: ['squirt', 'turn_left', 'u_turn', 'forward', 'move'], taoHam: ['smart_spray'],
      deBai: 'Van sát mũi thì front_clear() là False, nên bắn nhanh cho khỏi giật; trước mũi trống là van ở xa, phải bắn tụ. Em chế smart_spray() tự chọn lực theo cảm biến khoảng cách. Chương trình chính gọi nó hai lần.',
      veMaMau: 'Chương trình chính bị khóa. Tạo smart_spray() với if front_clear(): … else: … dùng squirt(p) của em.',
      san: SAN_8, batDau: { x: 3, y: 3, huong: 1 }, noi: NOI_8, nhipTheoLoiGiai: true,
      bongMo: { x: 3, y: 7, huong: 2, thung: [{ x: 2, y: 3 }] },
      chinhCoDinh: true,
      maMau: { chinh: C_8.slice() },
      sao: { o: 21, nhip: 7 },
      loiGiai: { chinh: C_8.slice(), hamCuaEmMoi: [SMART()] },
      loiGiaiKhac: { moTa: 'Hỏi ngược: if not front_clear() thì bắn nhanh, còn không thì bắn tụ', baiLam: { chinh: C_8.slice() }, hamCuaEmMoi: [H('smart_spray', [], ['if not front_clear():', '    squirt("low")', 'else:', '    squirt("high")', '# vật sát mũi thì bắn nhanh'])] },
      loiSai: [
        { moTa: 'Đảo hai nhánh: van sát mũi lại bắn tụ', baiLam: { chinh: C_8.slice() }, hamCuaEmMoi: [H('smart_spray', [], T_PICK_CU)], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Không hỏi cảm biến, luôn bắn tụ', baiLam: { chinh: C_8.slice() }, hamCuaEmMoi: [H('smart_spray', [], ['squirt("high")'])], phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['front_clear() là True khi ô trước mũi trống.', 'Trống thì van ở xa: squirt("high"). Không trống thì van sát mũi: squirt("low").']
    }),

    man({
      so: 9, ten: 'Đố: đảo nhánh', hang: 'bien-the', mucTieu: 'bong-mo', coCam: true, hamCuaEmCan: ['squirt', 'turn_left', 'u_turn', 'forward', 'move'],
      deBai: 'Hàm pick_spray() của màn cũng chọn lực theo cảm biến, nhưng đang chọn sai. Chương trình chính gọi nó hai lần: một van sát mũi, một van ở xa bên dưới. Sửa pick_spray() cho đúng.',
      veMaMau: 'Chạy thử, xem phát bắn nào làm hỏng việc, rồi sửa thân pick_spray().',
      san: SAN_9, batDau: { x: 3, y: 5, huong: 3 }, noi: NOI_9, nhipTheoLoiGiai: true,
      bongMo: { x: 3, y: 1, huong: 0, thung: [{ x: 4, y: 5 }] },
      chinhCoDinh: true,
      maMau: { chinh: C_9.slice(), hamCuaMan: [H('pick_spray', [], T_PICK_CU)] },
      sao: { o: 21, nhip: 7 },
      loiGiai: { chinh: C_9.slice(), hamCuaMan: [H('pick_spray', [], T_SMART)] },
      loiGiaiKhac: { moTa: 'Gọi smart_spray() của em trong pick_spray()', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('pick_spray', [], ['# dùng hàm của em', 'smart_spray()'])] } },
      loiSai: [
        { moTa: 'Để nguyên: van sát mũi bị bắn tụ, thùng sau lưng bị hất', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('pick_spray', [], T_PICK_CU)] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Luôn bắn nhanh: van bên dưới cách 3 ô, tia nước rơi giữa đường', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('pick_spray', [], ['squirt("low")'])] }, phaiCoMa: ['ban-ngan', 'lech-bong-mo'] }
      ],
      goiY: ['Nhánh if chạy khi trước mũi TRỐNG: lúc đó van ở xa.', 'Đổi chỗ "low" và "high" cho nhau.']
    }),

    /* ------------------------------------------------ trùm */
    man({
      so: 10, ten: 'Trùm: Ba cửa ba lực', hang: 'trum', mucTieu: 'bong-mo', coCam: true, nhipTheo: 'tong', hamCuaEmCan: ['smart_spray', 'squirt', 'turn_left', 'go_wall', 'move'],
      deBai: 'Ba sân, một chương trình. Sân nào cũng có van bên trái và cửa đi xuống, nhưng van lúc thì sát mũi, lúc thì cách 3 ô, và có sân có thùng sau lưng. Mở cửa, đi xuống tới chỗ xe mờ trên cả ba sân.',
      veMaMau: 'Tự viết chương trình. Ở mỗi sân xe đứng chỗ khác sau khi bắn: dùng go_wall() để đi tới hết đường.',
      san: SAN_10, batDau: BD_10,
      bongMo: BM_10,
      maMau: { chinh: [] },
      sao: { o: 16, nhip: 16 },
      loiGiai: { chinh: L_10.slice() },
      loiGiaiKhac: { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: { chinh: ['# để cảm biến chọn lực'].concat(L_10) } },
      congThucKhac: [{ moTa: 'Viết thẳng if / else ở chương trình chính thay cho smart_spray()', baiLam: { chinh: ['if front_clear():', '    squirt("high")', 'else:', '    squirt("low")', 'turn_left()', 'go_wall()'] } }],
      loiSai: [
        { moTa: 'Luôn bắn nhanh: ở sân thứ hai van cách 3 ô, cửa không mở', baiLam: { chinh: ['squirt("low")', 'turn_left()', 'go_wall()'] }, phaiCoMa: ['ban-ngan', 'lech-bong-mo'] },
        { moTa: 'Luôn bắn tụ: ở sân thứ nhất thùng sau lưng bị hất', baiLam: { chinh: ['squirt("high")', 'turn_left()', 'go_wall()'] }, phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Không sân nào đi cùng một lực: hãy để cảm biến chọn.', 'Sau phát bắn, quay mặt xuống rồi go_wall().'],
      huyHieu: { ma: 'luc-ban', ten: 'Huy hiệu Lực bắn' }
    })
  ];

  ManHoc.them(DS);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();
