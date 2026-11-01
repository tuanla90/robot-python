/* ============================================================================
   man-cuu-kho-hang.js - Mùa 9 CLB Sáng Tạo: Gói 1 "Cứu hộ Kho hàng"
   20 màn (10 màn cuu-kho-hang + 10 màn lap-kho-hang):
   - R1: Robot hai bánh Mùa 1 (than: 'hai-banh', tay: 'xoay', camBien: khoang-cach)
   - R2: Robot các mùa khác đến chi viện (xich, nhen, omni, gai)
   - Màn 10 mỗi chương (hang: 'trum'): Hợp tấu 2 bè Đoạn 1 "Kìa con bướm vàng"
     (Bè 1: 1 1 5 5 6 6 5 5 | Bè 2: 1 3 5 3 4 4 1 1)
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var HAM_BANH = BANH.concat(['arm_down', 'arm_up', 'arm_left', 'arm_right', 'grab', 'release', 'front_clear', 'left_clear', 'right_clear']);
  var HAM_BANH_LOA = BANH.concat(['beat', 'note', 'front_clear', 'left_clear', 'right_clear']);
  var HAM_XICH = BANH.concat(['spray', 'spray_back', 'distance', 'warm']);
  var HAM_NHEN = ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'crouch', 'stand', 'magnet_n', 'magnet_s', 'magnet_off', 'front_metal', 'front_pole'];
  var HAM_OMNI = BANH.concat(['slide_left', 'slide_right', 'load', 'throw', 'radar', 'diag_left', 'diag_right', 'aim', 'shape']);
  var HAM_GAI = BANH.concat(['retract_spikes', 'extend_spikes', 'beat', 'note', 'hear', 'listen']);

  var R1_KHO = {
    loaiRobot: 'banh',
    robot: { than: 'hai-banh', tay: 'xoay', camBien: [{ ma: 'khoang-cach', o: 'hong' }] },
    hamGoc: HAM_BANH
  };
  var R1_KHO_LOA = {
    loaiRobot: 'banh', phatNot: true,
    robot: { than: 'hai-banh', tay: 'loa', camBien: [{ ma: 'khoang-cach', o: 'hong' }] },
    hamGoc: HAM_BANH_LOA
  };
  var R_XICH = {
    loaiRobot: 'xich', xichDay: true, lucBan: true,
    robot: { than: 'xich', tay: 'hoi', camBien: [{ ma: 'hong-ngoai', o: 'tren' }], son: 'lam' },
    hamGoc: HAM_XICH
  };
  var R_NHEN = {
    loaiRobot: 'nhen',
    robot: { than: 'nhen', tay: 'nam-cham', camBien: [{ ma: 'tu', o: 'hong' }], son: 'lam' },
    hamGoc: HAM_NHEN
  };
  var R_OMNI = {
    loaiRobot: 'omni', omniCheo: true, chinhLuc: true, nhanDang: true, tamNemMacDinh: 2, daLapHo: true,
    robot: { than: 'omni', tay: 'nem', camBien: [{ ma: 'radar', o: 'tren', nhanDang: true }], son: 'lam' },
    hamGoc: HAM_OMNI
  };
  var R_GAI = {
    loaiRobot: 'gai', thuGai: true, phatNot: true, phanAm: true,
    robot: { than: 'gai', tay: 'loa', camBien: [{ ma: 'am-thanh', o: 'tren', phanAm: true }], son: 'lam' },
    hamGoc: HAM_GAI
  };

  var H_SIDE_UNLOCK = {
    ten: 'side_unlock', thamSo: ['n'],
    than: ['lob()', 'slide_r(n)']
  };
  var H_SPRAY_PUSH = {
    ten: 'spray_push', thamSo: ['n'],
    than: ['squirt("low")', 'forward(n)']
  };
  var H_ECHO_GLIDE = {
    ten: 'echo_glide', thamSo: [],
    than: ['play_note(listen())', 'slide_stop()']
  };
  var H_PLAY_PART = {
    ten: 'play_part', thamSo: ['notes'],
    than: ['for n in notes:', '    play_note(n)']
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function baiDoi(r1Chinh, r2Chinh, hamEm, hamMan) {
    return {
      doi: [{ chinh: r1Chinh.slice() }, { chinh: r2Chinh.slice() }],
      hamCuaMan: hamMan ? clone(hamMan) : [],
      hamCuaEmMoi: hamEm ? clone(hamEm) : []
    };
  }

  function manCK(chuong, so, hang, cfg) {
    var r1 = clone(cfg.r1 || R1_KHO);
    var r2 = clone(cfg.r2 || R_XICH);
    r1.batDau = cfg.bd[0];
    r2.batDau = cfg.bd[1];
    if (cfg.coDinhR1) r1.coDinh = true;
    if (cfg.coDinhR2) r2.coDinh = true;
    if (cfg.co) {
      r1.co = cfg.co[0];
      r2.co = cfg.co[1];
    }
    var m = {
      chuong: chuong,
      so: so,
      ten: cfg.ten,
      hang: hang,
      vo: 'kho',
      loaiRobot: r1.loaiRobot,
      daLapHo: true,
      robot: clone(r1.robot),
      hamGoc: r1.hamGoc.slice(),
      cauTruc: cfg.cauTruc || ['for', 'if', 'while', 'list'],
      vaHoac: true,
      moXuong: true,
      camHamCuaEm: false,
      hamCuaEmCan: cfg.hamCuaEmCan || ['move', 'forward', 'wait_n'],
      taoHam: cfg.taoHam || [],
      khung: cfg.khung || { chinh: 10, moiHam: 8 },
      mucTieu: cfg.mucTieu || 'toi-co',
      deBai: cfg.deBai,
      veMaMau: cfg.veMaMau || '',
      san: cfg.san,
      batDau: cfg.bd[0],
      doi: [r1, r2],
      maMau: cfg.maMau,
      loiGiai: cfg.loiGiai,
      loiSai: cfg.loiSai || [],
      sao: cfg.sao || { o: 16, nhip: 10 },
      goiY: cfg.goiY || []
    };
    if (cfg.chiChay) { m.chiChay = true; m.chinhCoDinh = true; }
    if (cfg.noi) m.noi = cfg.noi;
    if (cfg.dieu) m.dieu = cfg.dieu;
    if (cfg.vatChat) m.vatChat = cfg.vatChat;
    if (cfg.chuongDa) m.chuongDa = cfg.chuongDa;
    if (cfg.daChuong) m.daChuong = cfg.daChuong;
    return ManHoc.chuanHoa(m);
  }

  ManHoc.manCuuKhoHang = [
    /* ========================================================================
       CHƯƠNG 1: cuu-kho-hang (10 màn)
       ======================================================================== */
    manCK('cuu-kho-hang', 1, 'lam-quen', {
      ten: 'Xe xích phun van mở cửa kho',
      chiChay: true, r2: R_XICH,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'squirt'],
      deBai: 'Chào mừng em đến Mùa 9: CLB Sáng Tạo! Tại Kho hàng Mùa 1, cánh cửa sắt C(3, 1) đang đóng kín. Robot bánh xích R2 từ Nhà máy (Mùa 2) đến chi viện: R2 gọi squirt("low") phun tia hơi vào van N(3, 2) mở cửa C(3, 1) rồi lùi về cờ F(1, 2), giúp R1 tiến thẳng tới cờ F(4, 1). Nhấn Chạy để quan sát!',
      veMaMau: 'Quan sát R2 phun van hơi N mở cửa C cho R1.',
      san: ['######', '#..CF#', '#F.N.#', '######'],
      noi: [{ nut: { x: 3, y: 2 }, cua: [{ x: 3, y: 1 }] }],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 2, huong: 1 }],
      co: [[{ x: 4, y: 1 }], [{ x: 1, y: 2 }]],
      maMau: baiDoi(['wait()', 'forward(3)'], ['squirt("low")', 'back()']),
      loiGiai: baiDoi(['wait()', 'forward(3)'], ['squirt("low")', 'back()']),
      sao: { o: 12, nhip: 4 },
      goiY: ['Nhấn Chạy để xem R2 phun van N mở cửa C cho R1 tiến về cờ.']
    }),

    manCK('cuu-kho-hang', 2, 'lam-quen', {
      ten: 'Nhện chui gầm thấp giữ nút đè M',
      r2: R_NHEN,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'walk', 'go'],
      deBai: 'Cửa C ở (3, 1) chắn trước cờ của R1, còn nút đè M ở (3, 2) nằm sau gầm thấp n ở (2, 2) mà xe bánh không chui qua được. Hãy lập trình cho R2 (robot nhện Mùa 3) dùng walk("RR") bò qua gầm thấp đè lên nút M(3, 2), chờ 1 nhịp cho R1 đi qua cửa C(3, 1) rồi gọi go("R") sang cờ F(4, 2)!',
      veMaMau: 'R2 chưa bước qua gầm thấp n lên nút M(3, 2) và sang cờ F(4, 2).',
      san: ['######', '#..CF#', '#.nMF#', '######'],
      noi: [{ nut: { x: 3, y: 2 }, cua: [{ x: 3, y: 1 }] }],
      bd: [{ x: 2, y: 1, huong: 1 }, { x: 1, y: 2, huong: 1, chan: 'co' }],
      co: [[{ x: 4, y: 1 }], [{ x: 4, y: 2 }]],
      maMau: baiDoi(['wait_n(4)', 'forward(2)'], ['walk("R")']),
      loiGiai: baiDoi(['wait_n(4)', 'forward(2)'], ['walk("RR")', 'wait()', 'go("R")']),
      loiSai: [
        { moTa: 'R2 mới đi 1 bước tới gầm thấp n, chưa đè nút M nên R1 đâm vào cửa C', baiLam: baiDoi(['wait_n(4)', 'forward(2)'], ['walk("R")']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 16, nhip: 7 },
      goiY: ['Ở chương trình R2, viết walk("RR"), wait(), go("R") để đè nút M(3, 2) cho R1 qua cửa rồi bước vào F(4, 2).']
    }),

    manCK('cuu-kho-hang', 3, 'luyen', {
      ten: 'Xích đẩy thùng nặng H đè nút mở kho',
      r2: R_XICH,
      hamCuaEmCan: ['move', 'forward', 'wait_n'],
      deBai: 'Thùng nặng H ở (2, 2) chỉ có thân bánh xích của R2 mới đẩy nổi! Hãy cho R2 tiến 1 ô đẩy thùng H đè lên nút M(3, 2) để mở cửa C(3, 1), rồi lùi 1 ô về cờ F(1, 2). R1 chờ 1 nhịp cho cửa mở rồi tiến 3 ô tới cờ F(4, 1).',
      veMaMau: 'R2 chưa đẩy thùng nặng H lên nút M và lùi về cờ F(1, 2).',
      san: ['######', '#..CF#', '#FHm.#', '######'].map(function (r) { return r.replace('m', 'M'); }),
      noi: [{ nut: { x: 3, y: 2 }, cua: [{ x: 3, y: 1 }] }],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 2, huong: 1 }],
      co: [[{ x: 4, y: 1 }], [{ x: 1, y: 2 }]],
      maMau: baiDoi(['wait()', 'forward(3)'], ['wait()']),
      loiGiai: baiDoi(['wait()', 'forward(3)'], ['move()', 'back()']),
      loiSai: [
        { moTa: 'R2 đứng yên không đẩy thùng H lên nút M nên cửa C vẫn đóng', baiLam: baiDoi(['wait()', 'forward(3)'], ['wait()']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 11, nhip: 4 },
      goiY: ['Ở chương trình R2, gọi move() để đẩy thùng H đè lên nút M(3, 2), sau đó gọi back() lùi về cờ F(1, 2).']
    }),

    manCK('cuu-kho-hang', 4, 'luyen', {
      ten: 'Tay hất lấp hố sâu trong kho',
      r2: R_OMNI,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'lob', 'slide_r'],
      deBai: 'Sàn kho bị sụt một hố sâu u ở (2, 1) chắn đường R1. Robot omni R2 (Mùa 7 Mỏ đá) đứng ở (2, 3) ngay sau viên đá tròn o ở (2, 2). Hãy cho R2 gọi lob() để nạp và hất viên đá lấp đầy hố u(2, 1), rồi gọi slide_r(1) trượt sang cờ F(3, 3); R1 chờ 2 nhịp rồi tiến 3 ô qua ô hố đã lấp tới cờ F(4, 1).',
      veMaMau: 'R2 chưa gọi lob() để hất đá lấp hố u(2, 1).',
      san: ['######', '#.u.F#', '##o###', '##.F##', '######'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 3, huong: 0 }],
      co: [[{ x: 4, y: 1 }], [{ x: 3, y: 3 }]],
      maMau: baiDoi(['wait_n(2)', 'forward(3)'], ['slide_r(1)']),
      loiGiai: baiDoi(['wait_n(2)', 'forward(3)'], ['lob()', 'slide_r(1)']),
      loiSai: [
        { moTa: 'R2 quên gọi lob() lấp hố nên R1 rơi xuống hố u(2, 1)', baiLam: baiDoi(['wait_n(2)', 'forward(3)'], ['slide_r(1)']), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 18, nhip: 5 },
      goiY: ['R2 gọi lob() để nạp viên đá ở (2, 2) và hất tầm 2 ô vào hố u(2, 1), sau đó gọi slide_r(1) sang F(3, 3).']
    }),

    manCK('cuu-kho-hang', 5, 'cung-co', {
      ten: 'Tay xoay chuyền kiện hàng qua vách',
      r2: R1_KHO, mucTieu: 'dua-vat',
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'pick', 'drop_right'],
      deBai: 'Kiện hàng o nằm ở (1, 1) phía trước R1, còn ô đích D nằm ở (3, 3) bên phải R2. R1 ở (1, 2) hướng lên đã gọi pick(), wait(), drop_right() thả kiện hàng sang ô trung chuyển (2, 2). Hãy viết lệnh cho R2 ở (2, 3) hướng lên: chờ 5 nhịp bằng wait_n(5), gọi pick(), wait() rồi gọi drop_right() thả vào D(3, 3).',
      veMaMau: 'R2 chưa gọi wait() và drop_right() để thả kiện hàng vào ô đích D(3, 3).',
      san: ['#####', '#o###', '#...#', '##.D#', '#####'],
      bd: [{ x: 1, y: 2, huong: 0 }, { x: 2, y: 3, huong: 0 }],
      maMau: baiDoi(['pick()', 'wait()', 'drop_right()'], ['wait_n(5)', 'pick()']),
      loiGiai: baiDoi(['pick()', 'wait()', 'drop_right()'], ['wait_n(5)', 'pick()', 'wait()', 'drop_right()']),
      loiSai: [
        { moTa: 'R2 chỉ gắp mà chưa gọi wait(), drop_right() thả sang ô đích D(3, 3)', baiLam: baiDoi(['pick()', 'wait()', 'drop_right()'], ['wait_n(5)', 'pick()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 21, nhip: 9 },
      goiY: ['Sau khi gọi pick() gắp kiện hàng ở (2, 2), R2 gọi wait() rồi drop_right() để xoay tay sang phải và thả vào D(3, 3).']
    }),

    manCK('cuu-kho-hang', 6, 'cung-co', {
      ten: 'Bánh gai phá đá chuông mở hành lang kho',
      r2: R_GAI,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'play_note'],
      deBai: 'Một tảng đá chuông nốt 4 chắn hành lang kho ở (3, 1). R2 (xe bánh gai gắn loa Mùa 8) đứng ở (3, 2) hướng lên ngay sát tảng đá chuông: hãy cho R2 gọi play_note(listen()) phá đá chuông giúp R1 rồi gọi turn_right(), move() sang cờ F(4, 2); R1 chờ 1 nhịp rồi tiến 3 ô vào cờ F(4, 1).',
      veMaMau: 'R2 chưa gọi play_note(listen()) nên đá chuông vẫn chắn đường R1.',
      san: ['######', '#...F#', '###.F#', '######'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 3, y: 2, huong: 0 }],
      co: [[{ x: 4, y: 1 }], [{ x: 4, y: 2 }]],
      daChuong: [{ x: 3, y: 1, not: 4, ben: 1 }],
      maMau: baiDoi(['wait()', 'forward(3)'], ['turn_right()', 'move()']),
      loiGiai: baiDoi(['wait()', 'forward(3)'], ['play_note(listen())', 'turn_right()', 'move()']),
      loiSai: [
        { moTa: 'R2 không phát nốt phá đá chuông: R1 đâm vào đá chuông ở (3, 1)', baiLam: baiDoi(['wait()', 'forward(3)'], ['turn_right()', 'move()']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 13, nhip: 4 },
      goiY: ['R2 gọi play_note(listen()) để đọc tần số và phá đá chuông (3, 1), rồi gọi turn_right(), move() sang F(4, 2).']
    }),

    manCK('cuu-kho-hang', 7, 'van-dung', {
      ten: 'Omni trượt ngang mở nút cho xe kho lấy hàng',
      r2: R_OMNI, mucTieu: 'dua-vat',
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'pick', 'drop', 'slide_r'],
      deBai: 'R1 cần đi qua cửa C(2, 1) để gắp kiện hàng o(3, 1), lùi 1 ô và xoay tay thả vào D(2, 2)? Không, ô đích D ở ngay (1, 1) sau lưng R1! R1 chờ 2 nhịp cho cửa mở, tiến 1 ô lên (2, 1), gắp kiện hàng o(3, 1), lùi 1 ô về (1, 1) rồi xoay tay thả vào D(1, 2). Để mở cửa C(2, 1), R2 (robot omni) ở (2, 3) hướng lên hãy gọi slide_r(1) rồi move() đè lên nút M(3, 2)!',
      veMaMau: 'R2 chưa trượt ngang và tiến lên nút M(3, 2) để mở cửa C(2, 1).',
      san: ['######', '#.Co.#', '#D.M.#', '##..##', '######'],
      noi: [{ nut: { x: 3, y: 2 }, cua: [{ x: 2, y: 1 }] }],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 3, huong: 0 }],
      maMau: baiDoi(['wait_n(2)', 'move()', 'pick()', 'back()', 'drop_right()'], ['slide_r(1)']),
      loiGiai: baiDoi(['wait_n(2)', 'move()', 'pick()', 'back()', 'drop_right()'], ['slide_r(1)', 'move()']),
      loiSai: [
        { moTa: 'R2 mới trượt sang phải 1 ô, chưa tiến lên nút M(3, 2) nên cửa C không mở', baiLam: baiDoi(['wait_n(2)', 'move()', 'pick()', 'back()', 'drop_right()'], ['slide_r(1)']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      sao: { o: 21, nhip: 8 },
      goiY: ['Sau slide_r(1), R2 gọi thêm move() để tiến lên đè nút M(3, 2).']
    }),

    manCK('cuu-kho-hang', 8, 'van-dung', {
      ten: 'Cảm biến khoảng cách phối hợp xe xích mở van',
      r2: R_XICH,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'squirt'],
      deBai: 'R2 (xe xích) tiến 1 ô rồi gọi squirt("low") phun vào van N(3, 2) để mở cửa C(3, 1), sau đó lùi về cờ F(1, 2). R1 ở (1, 1) tiến 1 ô tới trước cửa C(3, 1), dùng vòng lặp while not front_clear(): wait() chờ tới khi cửa mở rồi tiến 2 ô vào cờ F(4, 1)!',
      veMaMau: 'R1 chưa tiến 2 ô qua cửa C sau vòng lặp chờ.',
      san: ['######', '#..CF#', '#F.N.#', '######'],
      noi: [{ nut: { x: 3, y: 2 }, cua: [{ x: 3, y: 1 }] }],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 2, huong: 1 }],
      co: [[{ x: 4, y: 1 }], [{ x: 1, y: 2 }]],
      maMau: baiDoi(['move()', 'while not front_clear():', '    wait()'], ['move()', 'squirt("low")', 'back()']),
      loiGiai: baiDoi(['move()', 'while not front_clear():', '    wait()', 'forward(2)'], ['move()', 'squirt("low")', 'back()']),
      loiSai: [
        { moTa: 'R1 chờ cửa mở xong nhưng chưa gọi forward(2) để vào cờ F(4, 1)', baiLam: baiDoi(['move()', 'while not front_clear():', '    wait()'], ['move()', 'squirt("low")', 'back()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 15, nhip: 5 },
      goiY: ['Thêm forward(2) ở cuối chương trình R1 sau vòng lặp while.']
    }),

    manCK('cuu-kho-hang', 9, 'bien-the', {
      ten: 'Mở khóa liên hoàn cứu kiện hàng cổ',
      r2: R_GAI, mucTieu: 'dua-vat',
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'pick', 'drop', 'play_note', 'slide_stop'],
      deBai: 'Thử thách phối hợp Kho hàng và Hang động! R2 (bánh gai) đứng ở (2, 2) hướng lên trước tảng đá chuông nốt 5 ở (2, 1): hãy cho R2 gọi play_note(listen()) phá đá chuông cho R1, rồi rẽ phải và gọi slide_stop() trượt qua dải đá ướt I(3, 2) tiến lên đè nút M(5, 2) mở cửa C(4, 1). R1 chờ 2 nhịp, tiến lên (2, 1), gắp kiện hàng o(3, 1), tiến 2 ô qua cửa C(4, 1) rồi thả vào D(5, 1)!',
      veMaMau: 'Hoàn thiện lệnh cho R1 và R2 để phá đá chuông, trượt đè nút M và đưa kiện hàng vào D(5, 1).',
      san: ['#######', '#..oCD#', '##.I.M#', '#######'],
      noi: [{ nut: { x: 5, y: 2 }, cua: [{ x: 4, y: 1 }] }],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 2, huong: 0 }],
      daChuong: [{ x: 2, y: 1, not: 5, ben: 1 }],
      maMau: baiDoi(['wait_n(2)', 'move()', 'pick()', 'forward(2)'], ['play_note(listen())', 'turn_right()']),
      loiGiai: baiDoi(['wait_n(2)', 'move()', 'pick()', 'forward(2)', 'drop()'], ['play_note(listen())', 'turn_right()', 'slide_stop()']),
      loiSai: [
        { moTa: 'R2 chưa gọi slide_stop() đè nút M(5, 2) và R1 chưa gọi drop()', baiLam: baiDoi(['wait_n(2)', 'move()', 'pick()', 'forward(2)'], ['play_note(listen())', 'turn_right()']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      sao: { o: 21, nhip: 8 },
      goiY: ['R2 thêm slide_stop() sau turn_right() để trượt qua I(3, 2) và dừng trên nút M(5, 2); R1 thêm drop() ở cuối.']
    }),

    manCK('cuu-kho-hang', 10, 'trum', {
      ten: 'Hợp tấu nhà kho: Đoạn 1 Kìa con bướm vàng',
      r1: R1_KHO_LOA, r2: R_GAI, mucTieu: 'choi-dieu',
      dieu: { r1: '1 1 5 5 6 6 5 5', r2: '1 3 5 3 4 4 1 1' },
      hamCuaEmCan: ['play_note'],
      deBai: 'Màn kết chương Cứu hộ Kho hàng! Để mừng kho hàng hoạt động trở lại, R1 (gắn loa) và R2 cùng hợp tấu Đoạn 1 bài "Kìa con bướm vàng" ("Kìa con bướm vàng, kìa con bướm vàng") gồm 8 nhịp 2 bè: Bè 1 (R1) chơi giai điệu chính [1, 1, 5, 5, 6, 6, 5, 5], còn Bè 2 (R2) đệm hòa âm [1, 3, 5, 3, 4, 4, 1, 1]. Hãy hoàn thiện vòng lặp phát nốt của R2!',
      veMaMau: 'R2 mới chơi 4 nốt đầu, hãy điền đủ danh sách 8 nốt bè 2.',
      san: ['#####', '#...#', '#####'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 3, y: 1, huong: 3 }],
      maMau: baiDoi(
        ['for n in [1, 1, 5, 5, 6, 6, 5, 5]:', '    play_note(n)'],
        ['for n in [1, 3, 5, 3]:', '    play_note(n)']
      ),
      loiGiai: baiDoi(
        ['for n in [1, 1, 5, 5, 6, 6, 5, 5]:', '    play_note(n)'],
        ['for n in [1, 3, 5, 3, 4, 4, 1, 1]:', '    play_note(n)']
      ),
      loiSai: [
        { moTa: 'R2 chỉ chơi 4 nốt đầu [1, 3, 5, 3], thiếu 4 nốt sau [4, 4, 1, 1]', baiLam: baiDoi(['for n in [1, 1, 5, 5, 6, 6, 5, 5]:', '    play_note(n)'], ['for n in [1, 3, 5, 3]:', '    play_note(n)']), phaiCoMa: ['lo-nhip'] }
      ],
      sao: { o: 26, nhip: 8 },
      goiY: ['Sửa danh sách của R2 thành [1, 3, 5, 3, 4, 4, 1, 1] để hai robot hòa âm đủ 8 nhịp.']
    }),

    /* ========================================================================
       CHƯƠNG 2: lap-kho-hang (10 màn)
       ======================================================================== */
    manCK('lap-kho-hang', 1, 'lam-quen', {
      ten: 'Quan sát hàm side_unlock mở cửa nhanh',
      chiChay: true, r2: R_OMNI,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'lob', 'slide_r'],
      deBai: 'Trong chương Lập trình cứu Kho hàng, em sẽ viết các hàm phối hợp cho đội robot liên mùa! Hãy nhấn Chạy để xem R2 (robot omni) gọi hàm side_unlock(1) vừa hất viên đá o(2, 3) lên nút M(2, 2) mở cửa C(3, 1), vừa trượt ngang sang phải vào cờ F(3, 4), giúp R1 tiến thẳng về cờ F(4, 1).',
      veMaMau: 'Quan sát hàm side_unlock(n) giúp R2 hất đá lên nút M và trượt ngang về cờ.',
      san: ['######', '#..CF#', '##M###', '##o###', '##.F##', '######'],
      noi: [{ nut: { x: 2, y: 2 }, cua: [{ x: 3, y: 1 }] }],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 4, huong: 0 }],
      co: [[{ x: 4, y: 1 }], [{ x: 3, y: 4 }]],
      maMau: baiDoi(['wait_n(2)', 'forward(3)'], ['side_unlock(1)'], [], [H_SIDE_UNLOCK]),
      loiGiai: baiDoi(['wait_n(2)', 'forward(3)'], ['side_unlock(1)'], [], [H_SIDE_UNLOCK]),
      sao: { o: 19, nhip: 5 },
      goiY: ['Nhấn Chạy để xem R2 gọi side_unlock(1) hất đá đè nút M(2, 2) mở cửa C(3, 1) cho R1.']
    }),

    manCK('lap-kho-hang', 2, 'lam-quen', {
      ten: 'Chế tạo hàm side_unlock cho R2',
      r2: R_OMNI,
      taoHam: ['side_unlock'],
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'lob', 'slide_r'],
      deBai: 'Hãy định nghĩa hàm side_unlock(n) gồm 2 lệnh: lob() để nạp và hất viên đá phía trước lên nút M (hoặc hố sâu), rồi slide_r(n) để trượt ngang sang phải n ô về cờ! Sau đó gọi side_unlock(1) cho R2 để mở cửa C(3, 1) cho R1 chờ 2 nhịp rồi tiến 3 ô tới cờ F(4, 1).',
      veMaMau: 'Hoàn thiện thân hàm side_unlock(n) gồm lob() và slide_r(n).',
      san: ['######', '#..CF#', '##M###', '##o###', '##.F##', '######'],
      noi: [{ nut: { x: 2, y: 2 }, cua: [{ x: 3, y: 1 }] }],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 4, huong: 0 }],
      co: [[{ x: 4, y: 1 }], [{ x: 3, y: 4 }]],
      maMau: baiDoi(['wait_n(2)', 'forward(3)'], ['side_unlock(1)']),
      loiGiai: baiDoi(['wait_n(2)', 'forward(3)'], ['side_unlock(1)'], [H_SIDE_UNLOCK]),
      loiSai: [
        { moTa: 'Hàm side_unlock(n) thiếu lệnh lob() nên chưa hất đá lên nút M(2, 2)', baiLam: baiDoi(['wait_n(2)', 'forward(3)'], ['side_unlock(1)']), hamCuaEmMoi: [{ ten: 'side_unlock', thamSo: ['n'], than: ['slide_r(n)'] }], phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 19, nhip: 5 },
      goiY: ['Trong hàm side_unlock(n), thêm lob() ở dòng đầu tiên trước slide_r(n).']
    }),

    manCK('lap-kho-hang', 3, 'luyen', {
      ten: 'Tái sử dụng side_unlock mở cửa kho xa',
      r2: R_OMNI,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'lob', 'slide_r', 'side_unlock'],
      deBai: 'Cờ của R2 nay nằm ở (4, 4), cách cột xuất phát của R2 2 ô sang phải. Hãy dùng lại hàm side_unlock(2) cho R2 để hất đá lên nút M(2, 2) rồi trượt phải 2 ô vào cờ F(4, 4), giúp R1 chờ 2 nhịp rồi tiến 4 ô qua cửa C(4, 1) vào cờ F(5, 1)!',
      veMaMau: 'Gọi side_unlock(2) cho R2.',
      san: ['#######', '#...CF#', '##M####', '##o####', '##..F##', '#######'],
      noi: [{ nut: { x: 2, y: 2 }, cua: [{ x: 4, y: 1 }] }],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 4, huong: 0 }],
      co: [[{ x: 5, y: 1 }], [{ x: 4, y: 4 }]],
      maMau: baiDoi(['wait_n(2)', 'forward(4)'], ['side_unlock(1)']),
      loiGiai: baiDoi(['wait_n(2)', 'forward(4)'], ['side_unlock(2)']),
      loiSai: [
        { moTa: 'Truyền nhầm side_unlock(1) nên R2 dừng ở (3, 4), chưa tới cờ F(4, 4)', baiLam: baiDoi(['wait_n(2)', 'forward(4)'], ['side_unlock(1)']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 19, nhip: 6 },
      goiY: ['Sửa side_unlock(1) thành side_unlock(2) ở chương trình của R2.']
    }),

    manCK('lap-kho-hang', 4, 'luyen', {
      ten: 'Chế tạo hàm spray_push cho xe xích tiếp viện',
      r2: R_XICH,
      taoHam: ['spray_push'],
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'squirt'],
      deBai: 'Hãy định nghĩa hàm spray_push(n) cho R2 (robot bánh xích): gọi squirt("low") để phun van hơi N mở cửa C, rồi gọi forward(n) để tiến n ô về cờ! Ở chương trình chính, R2 ở (2, 2) hướng phải gọi spray_push(1) phun van N(4, 2) mở cửa C(2, 1), rồi tiến 1 ô vào cờ F(3, 2); R1 chờ 1 nhịp rồi tiến 3 ô vào F(4, 1).',
      veMaMau: 'Hoàn thiện hàm spray_push(n) gồm squirt("low") và forward(n).',
      san: ['######', '#.C.F#', '#..FN#', '######'],
      noi: [{ nut: { x: 4, y: 2 }, cua: [{ x: 2, y: 1 }] }],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 2, huong: 1 }],
      co: [[{ x: 4, y: 1 }], [{ x: 3, y: 2 }]],
      maMau: baiDoi(['wait()', 'forward(3)'], ['spray_push(1)']),
      loiGiai: baiDoi(['wait()', 'forward(3)'], ['spray_push(1)'], [H_SPRAY_PUSH]),
      loiSai: [
        { moTa: 'Hàm spray_push(n) thiếu forward(n) nên R2 chưa tiến vào cờ F(3, 2)', baiLam: baiDoi(['wait()', 'forward(3)'], ['spray_push(1)']), hamCuaEmMoi: [{ ten: 'spray_push', thamSo: ['n'], than: ['squirt("low")'] }], phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 19, nhip: 4 },
      goiY: ['Trong hàm spray_push(n), thêm lệnh forward(n) sau squirt("low").']
    }),

    manCK('lap-kho-hang', 5, 'cung-co', {
      ten: 'Sửa lỗi hàm spray_push mở đường giao hàng',
      r2: R_XICH, mucTieu: 'dua-vat',
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'pick', 'drop', 'squirt'],
      deBai: 'Hàm spray_push(n) trong màn này đang bị lỗi thứ tự: gọi forward(n) trước squirt("low") khiến R2 tiến quá tầm van N(4, 2) và đâm vào van! Hãy sửa lại thân hàm spray_push(n) cho đúng thứ tự squirt("low") rồi forward(n), đồng thời viết tiếp lệnh drop() cho R1 để đặt kiện hàng o vào ô đích D(4, 1).',
      veMaMau: 'Sửa thứ tự lệnh trong spray_push(n) và thêm drop() cho R1.',
      san: ['######', '#.oCD#', '#..FN#', '######'],
      noi: [{ nut: { x: 4, y: 2 }, cua: [{ x: 3, y: 1 }] }],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 2, huong: 1 }],
      maMau: baiDoi(['pick()', 'forward(2)'], ['spray_push(1)'], [], [
        { ten: 'spray_push', thamSo: ['n'], than: ['forward(n)', 'squirt("low")'] }
      ]),
      loiGiai: baiDoi(['pick()', 'forward(2)', 'drop()'], ['spray_push(1)'], [], [H_SPRAY_PUSH]),
      loiSai: [
        { moTa: 'Chưa thêm drop() cho R1 nên kiện hàng chưa được đặt xuống ô đích D(4, 1)', baiLam: baiDoi(['pick()', 'forward(2)'], ['spray_push(1)'], [], [H_SPRAY_PUSH]), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 24, nhip: 6 },
      goiY: ['Trong spray_push(n), đặt squirt("low") trước forward(n); ở chương trình R1 thêm drop() ở cuối.']
    }),

    manCK('lap-kho-hang', 6, 'cung-co', {
      ten: 'Chế tạo hàm echo_glide cho bánh gai',
      r2: R_GAI,
      taoHam: ['echo_glide'],
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'play_note', 'slide_stop'],
      deBai: 'Hãy định nghĩa hàm echo_glide() cho R2 (robot bánh gai Mùa 8) gồm 2 lệnh: play_note(listen()) để đọc tần số và phá cặp đá chuông ở cả hai làn, sau đó gọi slide_stop() để thu gai trượt qua dải đá ướt I(3, 2) vào cờ F(4, 2)! Ở chương trình chính, R2 gọi echo_glide(), còn R1 chờ 1 nhịp rồi tiến 3 ô vào cờ F(4, 1).',
      veMaMau: 'Hoàn thiện hàm echo_glide() gồm play_note(listen()) và slide_stop().',
      san: ['######', '#...F#', '##.IF#', '######'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 2, huong: 1 }],
      co: [[{ x: 4, y: 1 }], [{ x: 4, y: 2 }]],
      daChuong: [{ x: 3, y: 1, not: 2, ben: 1 }, { x: 3, y: 2, not: 2, ben: 1 }],
      maMau: baiDoi(['wait()', 'forward(3)'], ['echo_glide()']),
      loiGiai: baiDoi(['wait()', 'forward(3)'], ['echo_glide()'], [H_ECHO_GLIDE]),
      loiSai: [
        { moTa: 'Hàm echo_glide() thiếu slide_stop() nên R2 chưa trượt qua băng I(3, 2) tới F(4, 2)', baiLam: baiDoi(['wait()', 'forward(3)'], ['echo_glide()']), hamCuaEmMoi: [{ ten: 'echo_glide', thamSo: [], than: ['play_note(listen())'] }], phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 24, nhip: 4 },
      goiY: ['Trong hàm echo_glide(), thêm slide_stop() ngay dưới play_note(listen()).']
    }),

    manCK('lap-kho-hang', 7, 'van-dung', {
      ten: 'Kết hợp echo_glide trên dải đá ướt dài',
      r2: R_GAI,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'play_note', 'slide_stop', 'echo_glide'],
      deBai: 'Cặp đá chuông nốt 6 ở cột 3 chắn cả hai làn. Hãy cho R2 gọi echo_glide() để phá cả 2 tảng đá chuông và trượt qua dải băng I(3, 2)..I(4, 2) vào cờ F(5, 2); còn R1 chờ 1 nhịp rồi gọi forward(4) tiến thẳng về cờ F(5, 1)!',
      veMaMau: 'Gọi echo_glide() cho R2 và hoàn thiện lệnh tiến cho R1.',
      san: ['#######', '#....F#', '##.IIF#', '#######'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 2, huong: 1 }],
      co: [[{ x: 5, y: 1 }], [{ x: 5, y: 2 }]],
      daChuong: [{ x: 3, y: 1, not: 6, ben: 1 }, { x: 3, y: 2, not: 6, ben: 1 }],
      maMau: baiDoi(['wait()'], ['echo_glide()']),
      loiGiai: baiDoi(['wait()', 'forward(4)'], ['echo_glide()']),
      loiSai: [
        { moTa: 'R1 chỉ chờ mà chưa gọi forward(4) tới F(5, 1)', baiLam: baiDoi(['wait()'], ['echo_glide()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 24, nhip: 5 },
      goiY: ['Sau wait(), R1 gọi forward(4) để đi tới F(5, 1).']
    }),

    manCK('lap-kho-hang', 8, 'van-dung', {
      ten: 'Chế tạo hàm play_part cho dàn nhạc robot',
      r1: R1_KHO_LOA, r2: R_GAI,
      taoHam: ['play_part'],
      hamCuaEmCan: ['move', 'play_note'],
      deBai: 'Để chuẩn bị cho các màn hợp tấu 2 bè xuyên suốt Mùa 9, hãy định nghĩa hàm play_part(notes): dùng vòng lặp for n in notes: và gọi play_note(n) để phát lần lượt từng nốt trong danh sách! Trong màn thử loa này, R1 gọi play_part([1, 5]) phá tảng đá chuông nốt 5 ở (2, 1) rồi tiến vào F(2, 1), còn R2 gọi play_part([1, 3]) phá đá chuông nốt 3 ở (4, 1) rồi tiến vào F(4, 1).',
      veMaMau: 'Hoàn thiện thân hàm play_part(notes) với vòng lặp for n in notes:.',
      san: ['#######', '#.F.F.#', '#######'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 5, y: 1, huong: 3 }],
      co: [[{ x: 2, y: 1 }], [{ x: 4, y: 1 }]],
      daChuong: [{ x: 2, y: 1, not: 5, ben: 1 }, { x: 4, y: 1, not: 3, ben: 1 }],
      maMau: baiDoi(['play_part([1, 5])', 'move()'], ['play_part([1, 3])', 'move()']),
      loiGiai: baiDoi(['play_part([1, 5])', 'move()'], ['play_part([1, 3])', 'move()'], [H_PLAY_PART]),
      loiSai: [
        { moTa: 'Thân vòng lặp trong play_part(notes) để trống gây lỗi cú pháp', baiLam: baiDoi(['play_part([1, 5])', 'move()'], ['play_part([1, 3])', 'move()']), hamCuaEmMoi: [{ ten: 'play_part', thamSo: ['notes'], than: ['for n in notes:'] }], phaiCoMa: ['loi-cu-phap'] }
      ],
      sao: { o: 24, nhip: 3 },
      goiY: ['Bên trong for n in notes:, thụt lề 4 dấu cách và viết play_note(n).']
    }),

    manCK('lap-kho-hang', 9, 'bien-the', {
      ten: 'Tổng duyệt cứu hộ kho hàng liên mùa',
      r2: R_OMNI, mucTieu: 'dua-vat',
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'pick', 'drop', 'lob', 'side_unlock'],
      deBai: 'Tổng duyệt trước màn hợp tấu! Hành lang của R1 vừa có hố sâu u(2, 1) vừa có cửa C(3, 1) khóa trước kiện hàng o(4, 1) và ô đích D(5, 1). R2 (robot omni) ở (2, 3) hướng lên hãy gọi side_unlock(1) để vừa hất viên đá o(2, 2) lấp hố u(2, 1) vừa trượt sang (3, 3), sau đó gọi move() tiến lên đè nút M(3, 2) mở cửa C(3, 1)! R1 chờ 4 nhịp rồi tiến 2 ô tới (3, 1), gắp kiện hàng o(4, 1), tiến 1 ô và thả vào D(5, 1).',
      veMaMau: 'Hoàn thiện chương trình cho cả R1 và R2.',
      san: ['#######', '#.uCoD#', '##oM###', '##..###', '#######'],
      noi: [{ nut: { x: 3, y: 2 }, cua: [{ x: 3, y: 1 }] }],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 3, huong: 0 }],
      maMau: baiDoi(['wait_n(4)', 'forward(2)', 'pick()'], ['side_unlock(1)']),
      loiGiai: baiDoi(['wait_n(4)', 'forward(2)', 'pick()', 'move()', 'drop()'], ['side_unlock(1)', 'move()']),
      loiSai: [
        { moTa: 'R2 chưa gọi move() lên nút M(3, 2) và R1 chưa đặt kiện hàng vào D(5, 1)', baiLam: baiDoi(['wait_n(4)', 'forward(2)', 'pick()'], ['side_unlock(1)']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      sao: { o: 28, nhip: 10 },
      goiY: ['R2 gọi side_unlock(1) rồi move(); R1 sau pick() gọi thêm move() và drop().']
    }),

    manCK('lap-kho-hang', 10, 'trum', {
      ten: 'Hợp tấu hàm play_part: Đoạn 1 Kìa con bướm vàng',
      r1: R1_KHO_LOA, r2: R_GAI, mucTieu: 'choi-dieu',
      dieu: { r1: '1 1 5 5 6 6 5 5', r2: '1 3 5 3 4 4 1 1' },
      hamCuaEmCan: ['play_note', 'play_part'],
      deBai: 'Màn kết Gói 1: Hãy dùng hàm play_part(notes) vừa chế tạo để R1 và R2 cùng biểu diễn Đoạn 1 bài "Kìa con bướm vàng" với 2 bè hòa âm 8 nhịp: R1 gọi play_part([1, 1, 5, 5, 6, 6, 5, 5]), còn R2 gọi play_part([1, 3, 5, 3, 4, 4, 1, 1])!',
      veMaMau: 'Gọi hàm play_part([1, 3, 5, 3, 4, 4, 1, 1]) cho R2.',
      san: ['#####', '#...#', '#####'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 3, y: 1, huong: 3 }],
      maMau: baiDoi(['play_part([1, 1, 5, 5, 6, 6, 5, 5])'], ['play_part([1, 3, 5, 3])']),
      loiGiai: baiDoi(['play_part([1, 1, 5, 5, 6, 6, 5, 5])'], ['play_part([1, 3, 5, 3, 4, 4, 1, 1])']),
      loiSai: [
        { moTa: 'R2 truyền thiếu 4 nốt cuối trong play_part(...)', baiLam: baiDoi(['play_part([1, 1, 5, 5, 6, 6, 5, 5])'], ['play_part([1, 3, 5, 3])']), phaiCoMa: ['lo-nhip'] }
      ],
      sao: { o: 24, nhip: 8 },
      goiY: ['Ở chương trình R2, gọi play_part([1, 3, 5, 3, 4, 4, 1, 1]).']
    })
  ];
})();
