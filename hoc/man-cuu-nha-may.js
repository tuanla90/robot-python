/* ============================================================================
   man-cuu-nha-may.js - Mùa 9 CLB Sáng Tạo: Gói 2 "Cứu hộ Nhà máy"
   20 màn (10 màn cuu-nha-may + 10 màn lap-nha-may):
   - R1: Robot xích Nhà máy Mùa 2 (than: 'xich', tay: 'hoi', camBien: hong-ngoai)
   - R2: Robot các mùa khác đến chi viện (banh, nhen, omni, gai)
   - Màn 10 mỗi chương (hang: 'trum'): Hợp tấu 2 bè Đoạn 2 "Kìa con bướm vàng"
     (Bè 1: 4 4 3 3 2 2 1 1 | Bè 2: 2 4 1 3 5 5 1 1)
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var HAM_XICH = BANH.concat(['spray', 'spray_back', 'distance', 'warm']);
  var HAM_XICH_LOA = BANH.concat(['beat', 'note', 'distance', 'warm']);
  var HAM_BANH = BANH.concat(['arm_down', 'arm_up', 'arm_left', 'arm_right', 'grab', 'release', 'front_clear', 'left_clear', 'right_clear']);
  var HAM_NHEN = ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'crouch', 'stand', 'magnet_n', 'magnet_s', 'magnet_off', 'front_metal', 'front_pole'];
  var HAM_OMNI = BANH.concat(['slide_left', 'slide_right', 'load', 'throw', 'radar', 'diag_left', 'diag_right', 'aim', 'shape']);
  var HAM_GAI = BANH.concat(['retract_spikes', 'extend_spikes', 'beat', 'note', 'hear', 'listen']);

  var R1_XICH = {
    loaiRobot: 'xich', xichDay: true, lucBan: true,
    robot: { than: 'xich', tay: 'hoi', camBien: [{ ma: 'hong-ngoai', o: 'tren' }] },
    hamGoc: HAM_XICH
  };
  var R1_XICH_LOA = {
    loaiRobot: 'xich', phatNot: true,
    robot: { than: 'xich', tay: 'loa', camBien: [{ ma: 'hong-ngoai', o: 'tren' }] },
    hamGoc: HAM_XICH_LOA
  };
  var R_BANH = {
    loaiRobot: 'banh',
    robot: { than: 'hai-banh', tay: 'xoay', camBien: [{ ma: 'khoang-cach', o: 'hong' }], son: 'lam' },
    hamGoc: HAM_BANH
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

  var H_VALVE_STEP = {
    ten: 'valve_step', thamSo: ['n'],
    than: ['squirt("low")', 'forward(n)']
  };
  var H_PUSH_VALVE = {
    ten: 'push_valve', thamSo: ['n'],
    than: ['forward(n)', 'back()']
  };
  var H_LOB_CLEAR = {
    ten: 'lob_clear', thamSo: ['d'],
    than: ['aim_lob(d)', 'slide_r(1)']
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function baiDoi(r1Chinh, r2Chinh, hamEm, hamMan) {
    return {
      doi: [{ chinh: r1Chinh.slice() }, { chinh: r2Chinh.slice() }],
      hamCuaMan: hamMan ? clone(hamMan) : [],
      hamCuaEmMoi: hamEm ? clone(hamEm) : []
    };
  }

  function manNM(chuong, so, hang, cfg) {
    var r1 = clone(cfg.r1 || R1_XICH);
    var r2 = clone(cfg.r2 || R_BANH);
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
      vo: 'nha-may',
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
    if (cfg.vatThem) m.vatThem = cfg.vatThem;
    if (cfg.chuongDa) m.chuongDa = cfg.chuongDa;
    if (cfg.daChuong) m.daChuong = cfg.daChuong;
    return ManHoc.chuanHoa(m);
  }

  ManHoc.manCuuNhaMay = [
    /* ========================================================================
       CHƯƠNG 1: cuu-nha-may (10 màn)
       ======================================================================== */
    manNM('cuu-nha-may', 1, 'lam-quen', {
      ten: 'Vòi hơi mở cửa cho xe kho',
      chiChay: true, r2: R_BANH,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'squirt'],
      deBai: 'Chào mừng em đến Gói 2: Cứu hộ Nhà máy! R1 là robot bánh xích gắn vòi hơi và hồng ngoại của Nhà máy, còn R2 là robot hai bánh từ Kho hàng sang tiếp viện. R1 gọi squirt("low") phun vào van N(4, 1) để mở cửa C(3, 2) cho R2 rồi tiến 2 ô vào cờ F(3, 1); R2 chờ 1 nhịp rồi tiến 3 ô qua cửa C tới F(4, 2). Nhấn Chạy để quan sát!',
      veMaMau: 'Quan sát R1 phun van hơi mở cửa C cho R2 cùng tiến về cờ.',
      san: ['######', '#..FN#', '#..CF#', '######'],
      noi: [{ nut: { x: 4, y: 1 }, cua: [{ x: 3, y: 2 }] }],
      bd: [{ x: 2, y: 1, huong: 1 }, { x: 1, y: 2, huong: 1 }],
      co: [[{ x: 3, y: 1 }], [{ x: 4, y: 2 }]],
      maMau: baiDoi(['squirt("low")', 'move()'], ['wait()', 'forward(3)']),
      loiGiai: baiDoi(['squirt("low")', 'move()'], ['wait()', 'forward(3)']),
      sao: { o: 12, nhip: 4 },
      goiY: ['Nhấn Chạy để xem R1 phun van N(4, 1) mở cửa C(3, 2) cho R2 về đích.']
    }),

    manNM('cuu-nha-may', 2, 'lam-quen', {
      ten: 'Xích đẩy thùng nặng mở cửa cho nhện',
      r2: R_NHEN,
      hamCuaEmCan: ['move', 'forward', 'walk'],
      deBai: 'R1 (bánh xích) đứng trước thùng nặng H ở (2, 1) và nút đè M ở (3, 1). Khi R1 tiến 1 ô đẩy thùng H đè lên nút M, cửa C(3, 2) ở hành lang dưới sẽ mở ra cho R2 (robot nhện Bãi tái chế) bò qua gầm thấp n(2, 2) và cửa C(3, 2) tới cờ F(4, 2). Hãy viết lệnh cho R2 đợi 1 nhịp rồi gọi walk("RRR") sang phải 3 ô.',
      veMaMau: 'R2 chưa bước qua gầm thấp n và cửa C tới cờ F(4, 2).',
      san: ['######', '#FHm.#', '#.nCF#', '######'].map(function (r) { return r.replace('m', 'M'); }),
      noi: [{ nut: { x: 3, y: 1 }, cua: [{ x: 3, y: 2 }] }],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 2, huong: 1, chan: 'co' }],
      co: [[{ x: 1, y: 1 }], [{ x: 4, y: 2 }]],
      maMau: baiDoi(['move()', 'back()'], ['wait()']),
      loiGiai: baiDoi(['move()', 'back()'], ['wait()', 'walk("RRR")']),
      loiSai: [
        { moTa: 'R2 chỉ chờ mà chưa gọi walk("RRR") sang phải 3 ô', baiLam: baiDoi(['move()', 'back()'], ['wait()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 12, nhip: 10 },
      goiY: ['Sau lệnh wait(), R2 gọi walk("RRR") để bò qua gầm thấp n(2, 2), cửa C(3, 2) và vào cờ F(4, 2).']
    }),

    manNM('cuu-nha-may', 3, 'luyen', {
      ten: 'Tay hất lấp hố cho xe xích qua băng chuyền',
      r2: R_OMNI,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'lob', 'slide_r'],
      deBai: 'Đường của R1 có hố sâu u(2, 1) và dải băng chuyền ngược <(3, 1). R2 (robot omni gắn tay hất) đứng ở (2, 3) trước viên đá o(2, 2): hãy cho R2 gọi lob() lấp hố u(2, 1) rồi trượt phải sang F(3, 3), để R1 chờ 2 nhịp rồi tiến 3 ô vượt qua hố đã lấp và băng chuyền ngược (thân xích không bị băng chuyền đẩy!) vào F(4, 1).',
      veMaMau: 'R2 chưa gọi lob() lấp hố u(2, 1) cho R1.',
      san: ['######', '#.u<F#', '##o###', '##.F##', '######'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 3, huong: 0 }],
      co: [[{ x: 4, y: 1 }], [{ x: 3, y: 3 }]],
      maMau: baiDoi(['wait_n(2)', 'forward(3)'], ['slide_r(1)']),
      loiGiai: baiDoi(['wait_n(2)', 'forward(3)'], ['lob()', 'slide_r(1)']),
      loiSai: [
        { moTa: 'R2 quên gọi lob() nên R1 lao xuống hố u(2, 1)', baiLam: baiDoi(['wait_n(2)', 'forward(3)'], ['slide_r(1)']), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 18, nhip: 5 },
      goiY: ['R2 gọi lob() để nạp đá ở (2, 2) và hất tầm 2 ô lấp hố u(2, 1), sau đó gọi slide_r(1) sang F(3, 3).']
    }),

    manNM('cuu-nha-may', 4, 'luyen', {
      ten: 'Xe kho gắp kiện gỗ mở đường tia hơi',
      r2: R_BANH,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'pick', 'drop_right', 'squirt'],
      deBai: 'R1 cần phun tia hơi vào van N(5, 1) để mở cửa C(2, 2) cho R2, nhưng kiện gỗ o(3, 1) đang chắn trước van N! R2 ở (3, 2) hướng lên hãy gọi pick(), wait(), drop_right() để gắp kiện gỗ o(3, 1) cất sang (4, 2). R1 chờ 3 nhịp cho kiện gỗ được nhấc lên, tiến 1 ô, gọi squirt("low") phun van N(5, 1) mở cửa C(2, 2), rồi tiến 1 ô vào F(4, 1); sau đó R2 rẽ trái tiến 2 ô qua cửa C(2, 2) tới F(1, 2)!',
      veMaMau: 'R2 chưa rẽ trái và tiến 2 ô qua cửa C(2, 2) về cờ F(1, 2).',
      san: ['#######', '#..oFN#', '#FC...#', '#######'],
      noi: [{ nut: { x: 5, y: 1 }, cua: [{ x: 2, y: 2 }] }],
      bd: [{ x: 2, y: 1, huong: 1 }, { x: 3, y: 2, huong: 0 }],
      co: [[{ x: 4, y: 1 }], [{ x: 1, y: 2 }]],
      maMau: baiDoi(['wait_n(3)', 'move()', 'squirt("low")', 'move()'], ['pick()', 'wait()', 'drop_right()']),
      loiGiai: baiDoi(['wait_n(3)', 'move()', 'squirt("low")', 'move()'], ['pick()', 'wait()', 'drop_right()', 'turn_left()', 'forward(2)']),
      loiSai: [
        { moTa: 'R2 gắp cất kiện gỗ xong nhưng chưa rẽ trái đi qua cửa C(2, 2) tới F(1, 2)', baiLam: baiDoi(['wait_n(3)', 'move()', 'squirt("low")', 'move()'], ['pick()', 'wait()', 'drop_right()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 25, nhip: 8 },
      goiY: ['Sau drop_right(), R2 gọi turn_left() rồi forward(2) để đi qua cửa C(2, 2) vào cờ F(1, 2).']
    }),

    manNM('cuu-nha-may', 5, 'cung-co', {
      ten: 'Nhện hút sắt trên đường đẩy thùng nặng',
      r2: R_NHEN,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'pull_s', 'go', 'walk'],
      deBai: 'R1 ở (2, 1) cần tiến 1 ô đẩy thùng nặng H(3, 1) đè lên nút M(4, 1) để mở cửa C(5, 2) cho R2 rồi lùi 2 ô về cờ F(1, 1), nhưng trên ô nút M(4, 1) đang có mẩu sắt vụn chắn thùng! R2 (robot nhện) đứng ngay trên mẩu sắt tại (4, 1): hãy cho R2 gọi pull_s() hút sắt vào bụng, gọi go("R") bước sang (5, 1), chờ 1 nhịp cho R1 đẩy thùng H đè nút M(4, 1) mở cửa C(5, 2), rồi gọi walk("DD") xuống cờ F(5, 3)!',
      veMaMau: 'R2 chưa hút sắt ở (4, 1) và bước xuống hành lang dưới qua cửa C(5, 2).',
      san: ['#######', '#F.HM.#', '#####C#', '#####F#', '#######'],
      noi: [{ nut: { x: 4, y: 1 }, cua: [{ x: 5, y: 2 }] }],
      bd: [{ x: 2, y: 1, huong: 1 }, { x: 4, y: 1, huong: 1 }],
      co: [[{ x: 1, y: 1 }], [{ x: 5, y: 3 }]],
      vatThem: [{ x: 4, y: 1, chat: 'sat' }],
      maMau: baiDoi(['wait_n(3)', 'move()', 'back()', 'back()'], ['pull_s()']),
      loiGiai: baiDoi(['wait_n(3)', 'move()', 'back()', 'back()'], ['pull_s()', 'go("R")', 'wait()', 'walk("DD")']),
      loiSai: [
        { moTa: 'R2 chỉ hút sắt mà chưa bước sang phải nhường ô M(4, 1) cho R1 đẩy thùng H', baiLam: baiDoi(['wait_n(3)', 'move()', 'back()', 'back()'], ['pull_s()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 24, nhip: 8 },
      goiY: ['Sau pull_s(), R2 gọi go("R") sang (5, 1), gọi wait() chờ R1 đẩy thùng H lên M(4, 1), rồi gọi walk("DD") xuống cờ F(5, 3).']
    }),

    manNM('cuu-nha-may', 6, 'cung-co', {
      ten: 'Sóng âm phá đá chuông trước van hơi',
      r2: R_GAI,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'play_note', 'squirt'],
      deBai: 'Trên đường của R1 có tảng đá chuông nốt 5 ở (2, 1) chắn trước van hơi N(3, 1). R2 (robot bánh gai gắn loa) đứng ở (2, 2) hướng lên: hãy cho R2 gọi play_note(listen()) phá đá chuông cho R1, rồi rẽ phải tiến 2 ô qua cửa C(3, 2) tới F(4, 2); R1 chờ 1 nhịp, gọi squirt("low") phun van N(3, 1) mở cửa C(3, 2) rồi tiến 1 ô vào F(2, 1).',
      veMaMau: 'R2 chưa gọi play_note(listen()) để phá tảng đá chuông (2, 1).',
      san: ['######', '#.FN.#', '##.CF#', '######'],
      noi: [{ nut: { x: 3, y: 1 }, cua: [{ x: 3, y: 2 }] }],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 2, huong: 0 }],
      co: [[{ x: 2, y: 1 }], [{ x: 4, y: 2 }]],
      daChuong: [{ x: 2, y: 1, not: 5, ben: 1 }],
      maMau: baiDoi(['wait()', 'squirt("low")', 'move()'], ['turn_right()', 'forward(2)']),
      loiGiai: baiDoi(['wait()', 'squirt("low")', 'move()'], ['play_note(listen())', 'turn_right()', 'forward(2)']),
      loiSai: [
        { moTa: 'R2 quên phá đá chuông nên tia nước của R1 bị đá chuông (2, 1) chặn, cửa C(3, 2) không mở', baiLam: baiDoi(['wait()', 'squirt("low")', 'move()'], ['turn_right()', 'forward(2)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 18, nhip: 4 },
      goiY: ['R2 gọi play_note(listen()) để phá đá chuông (2, 1), sau đó rẽ phải tiến 2 ô qua cửa C(3, 2) vào F(4, 2).']
    }),

    manNM('cuu-nha-may', 7, 'van-dung', {
      ten: 'Trượt ngang giữ nút cho xích đẩy thùng nặng',
      r2: R_OMNI,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'slide_r'],
      deBai: 'R1 cần đi qua cửa C(3, 1) tới cờ F(4, 1)! Nút M điều khiển cửa C(3, 1) nằm ở (3, 2): hãy cho R2 (robot omni) ở (1, 2) hướng lên gọi slide_r(2) trượt ngang sang đè nút M(3, 2), chờ 2 nhịp bằng wait_n(2) cho R1 đi qua cửa C(3, 1) vào F(4, 1), rồi trượt tiếp slide_r(1) vào cờ F(4, 2)!',
      veMaMau: 'R2 chưa chờ R1 qua cửa và trượt tiếp sang cờ F(4, 2).',
      san: ['######', '#..CF#', '#..MF#', '######'],
      noi: [{ nut: { x: 3, y: 2 }, cua: [{ x: 3, y: 1 }] }],
      bd: [{ x: 2, y: 1, huong: 1 }, { x: 1, y: 2, huong: 0 }],
      co: [[{ x: 4, y: 1 }], [{ x: 4, y: 2 }]],
      maMau: baiDoi(['wait_n(2)', 'forward(2)'], ['slide_r(2)']),
      loiGiai: baiDoi(['wait_n(2)', 'forward(2)'], ['slide_r(2)', 'wait_n(2)', 'slide_r(1)']),
      loiSai: [
        { moTa: 'R2 đè nút M(3, 2) nhưng chưa chờ R1 qua cửa và trượt tiếp vào F(4, 2)', baiLam: baiDoi(['wait_n(2)', 'forward(2)'], ['slide_r(2)']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 12, nhip: 5 },
      goiY: ['Sau slide_r(2), R2 gọi wait_n(2) rồi slide_r(1) để vào cờ F(4, 2).']
    }),

    manNM('cuu-nha-may', 8, 'van-dung', {
      ten: 'Hồng ngoại đợi đồng đội đi qua ngã tư',
      r2: R_BANH,
      hamCuaEmCan: ['move', 'forward', 'wait_n'],
      deBai: 'R2 (xe hai bánh) đang đi ngang qua trước mũi R1 ở (2, 1) hướng xuống cờ F(2, 2). Khi đồng đội đứng ngay trước mũi, cảm biến hồng ngoại warm() của R1 trả về True! Hãy cho R1 dùng while warm(): wait() để chờ R2 đi khỏi rồi tiến 2 ô tới cờ F(3, 1); còn R2 tiến 1 ô xuống cờ F(2, 2).',
      veMaMau: 'Viết lệnh move() cho R2 để R2 tiến xuống cờ F(2, 2) và nhường đường cho R1.',
      san: ['#####', '#..F#', '##F##', '#####'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 1, huong: 2 }],
      co: [[{ x: 3, y: 1 }], [{ x: 2, y: 2 }]],
      maMau: baiDoi(['while warm():', '    wait()', 'forward(2)'], ['wait()']),
      loiGiai: baiDoi(['while warm():', '    wait()', 'forward(2)'], ['move()']),
      loiSai: [
        { moTa: 'R2 đứng yên trước mũi R1 khiến R1 chờ mãi', baiLam: baiDoi(['while warm():', '    wait()', 'forward(2)'], ['wait()']), phaiCoMa: ['vong-vo-han'] }
      ],
      sao: { o: 10, nhip: 3 },
      goiY: ['Ở chương trình R2, thay wait() bằng move() để R2 tiến vào cờ F(2, 2).']
    }),

    manNM('cuu-nha-may', 9, 'bien-the', {
      ten: 'Phá đá chuông và trượt băng tiếp ứng lò cao',
      r2: R_GAI,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'play_note', 'slide_stop', 'squirt'],
      deBai: 'Thử thách phối hợp Nhà máy và Hang động! R2 (bánh gai) đứng ở (2, 2) hướng lên trước tảng đá chuông nốt 3 ở (2, 1): hãy cho R2 gọi play_note(listen()) phá đá chuông cho R1, rồi rẽ phải, chờ 1 nhịp cho cửa C(3, 2) mở, tiến 1 ô qua cửa C(3, 2) và gọi slide_stop() trượt qua dải đá ướt I(4, 2) dừng tại F(5, 2). R1 chờ 1 nhịp, tiến lên (2, 1), gọi squirt("low") phun van N(4, 1) mở cửa C(3, 2) rồi tiến 1 ô vào F(3, 1).',
      veMaMau: 'Hoàn thiện lệnh cho cả R1 và R2 để phá đá chuông, phun van mở cửa và trượt băng về cờ.',
      san: ['#######', '#..FN.#', '##.CIF#', '#######'],
      noi: [{ nut: { x: 4, y: 1 }, cua: [{ x: 3, y: 2 }] }],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 2, huong: 0 }],
      co: [[{ x: 3, y: 1 }], [{ x: 5, y: 2 }]],
      daChuong: [{ x: 2, y: 1, not: 3, ben: 1 }],
      maMau: baiDoi(['wait()', 'move()', 'squirt("low")'], ['play_note(listen())', 'turn_right()', 'wait()']),
      loiGiai: baiDoi(['wait()', 'move()', 'squirt("low")', 'move()'], ['play_note(listen())', 'turn_right()', 'wait()', 'move()', 'slide_stop()']),
      loiSai: [
        { moTa: 'R1 quên tiến vào cờ sau khi phun van và R2 quên bước qua cửa C rồi gọi slide_stop()', baiLam: baiDoi(['wait()', 'move()', 'squirt("low")'], ['play_note(listen())', 'turn_right()', 'wait()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 22, nhip: 5 },
      goiY: ['R1 thêm move() ở cuối để vào F(3, 1); R2 thêm move() và slide_stop() ở cuối để bước qua C(3, 2) rồi trượt qua I(4, 2) vào F(5, 2).']
    }),

    manNM('cuu-nha-may', 10, 'trum', {
      ten: 'Hợp tấu phân xưởng: Đoạn 2 Kìa con bướm vàng',
      r1: R1_XICH_LOA, r2: R_GAI, mucTieu: 'choi-dieu',
      dieu: { r1: '4 4 3 3 2 2 1 1', r2: '2 4 1 3 5 5 1 1' },
      hamCuaEmCan: ['play_note', 'play_part'],
      deBai: 'Khép lại chương Cứu hộ Nhà máy, R1 và R2 cùng hòa tấu Đoạn 2 bài "Kìa con bướm vàng" ("Em ngồi xem, em ngồi xem") với 2 bè 8 nhịp: Bè 1 (R1) chơi chuỗi nốt [4, 4, 3, 3, 2, 2, 1, 1], còn Bè 2 (R2) chơi bè trầm [2, 4, 1, 3, 5, 5, 1, 1]. Hãy gọi play_part([2, 4, 1, 3, 5, 5, 1, 1]) cho R2!',
      veMaMau: 'R2 chưa gọi play_part([2, 4, 1, 3, 5, 5, 1, 1]) để hòa âm cùng R1.',
      san: ['#####', '#...#', '#####'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 3, y: 1, huong: 3 }],
      maMau: baiDoi(['play_part([4, 4, 3, 3, 2, 2, 1, 1])'], ['play_note(2)']),
      loiGiai: baiDoi(['play_part([4, 4, 3, 3, 2, 2, 1, 1])'], ['play_part([2, 4, 1, 3, 5, 5, 1, 1])']),
      loiSai: [
        { moTa: 'R2 mới phát 1 nốt thay vì chơi trọn bè 2 dài 8 nhịp', baiLam: baiDoi(['play_part([4, 4, 3, 3, 2, 2, 1, 1])'], ['play_note(2)']), phaiCoMa: ['lo-nhip'] }
      ],
      sao: { o: 24, nhip: 8 },
      goiY: ['Ở chương trình R2, gọi play_part([2, 4, 1, 3, 5, 5, 1, 1]).']
    }),

    /* ========================================================================
       CHƯƠNG 2: lap-nha-may (10 màn)
       ======================================================================== */
    manNM('lap-nha-may', 1, 'lam-quen', {
      ten: 'Quan sát hàm valve_step mở van tiến bước',
      chiChay: true, r2: R_OMNI,
      hamCuaEmCan: ['move', 'forward', 'lob', 'slide_r', 'squirt'],
      deBai: 'Sang chương Lập trình cứu Nhà máy, em sẽ chế tạo các hàm phối hợp cho đội cứu hộ! Trong màn làm quen này, R2 gọi lob() lấp hố u(2, 1) trước cho R1 rồi trượt sang F(3, 3), trong khi R1 chờ 2 nhịp rồi tiến 2 ô qua ô hố đã lấp (2, 1) vào F(3, 1). Nhấn Chạy để xem!',
      veMaMau: 'Quan sát R1 tiến qua hố nhờ lệnh lob() của R2.',
      san: ['######', '#.uFF#', '##o###', '##.F##', '######'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 3, huong: 0 }],
      co: [[{ x: 3, y: 1 }], [{ x: 3, y: 3 }]],
      maMau: baiDoi(['wait_n(2)', 'forward(2)'], ['lob()', 'slide_r(1)']),
      loiGiai: baiDoi(['wait_n(2)', 'forward(2)'], ['lob()', 'slide_r(1)']),
      sao: { o: 18, nhip: 5 },
      goiY: ['Nhấn Chạy để xem R2 lấp hố cho R1 tiến về cờ.']
    }),

    manNM('lap-nha-may', 2, 'lam-quen', {
      ten: 'Chế tạo hàm valve_step cho xe xích',
      r2: R_BANH,
      taoHam: ['valve_step'],
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'squirt'],
      deBai: 'Hãy định nghĩa hàm valve_step(n) cho R1 gồm 2 lệnh: squirt("low") để phun van hơi N mở cửa C cho đồng đội, sau đó gọi forward(n) để tiến n ô về cờ! Ở chương trình chính, R1 gọi valve_step(1) phun van N(3, 1) mở cửa C(3, 2) rồi tiến vào F(2, 1); R2 chờ 1 nhịp rồi tiến 3 ô qua cửa C(3, 2) tới F(4, 2).',
      veMaMau: 'Hoàn thiện thân hàm valve_step(n) gồm squirt("low") và forward(n).',
      san: ['######', '#.FN.#', '#..CF#', '######'],
      noi: [{ nut: { x: 3, y: 1 }, cua: [{ x: 3, y: 2 }] }],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 2, huong: 1 }],
      co: [[{ x: 2, y: 1 }], [{ x: 4, y: 2 }]],
      maMau: baiDoi(['valve_step(1)'], ['wait()', 'forward(3)']),
      loiGiai: baiDoi(['valve_step(1)'], ['wait()', 'forward(3)'], [H_VALVE_STEP]),
      loiSai: [
        { moTa: 'Hàm valve_step(n) thiếu forward(n) nên R1 chưa tiến vào cờ F(2, 1)', baiLam: baiDoi(['valve_step(1)'], ['wait()', 'forward(3)']), hamCuaEmMoi: [{ ten: 'valve_step', thamSo: ['n'], than: ['squirt("low")'] }], phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 19, nhip: 4 },
      goiY: ['Trong hàm valve_step(n), thêm forward(n) ngay sau squirt("low").']
    }),

    manNM('lap-nha-may', 3, 'luyen', {
      ten: 'Tái sử dụng valve_step mở lối cho nhện',
      r2: R_NHEN,
      hamCuaEmCan: ['move', 'forward', 'walk', 'squirt', 'valve_step'],
      deBai: 'Van hơi N(4, 1) điều khiển cửa C(4, 2) trên làn của R2 (robot nhện). R1 đứng ở (2, 1) hướng phải: hãy gọi valve_step(1) để phun van N(4, 1) và tiến vào F(3, 1); đồng thời viết lệnh cho R2 đợi 1 nhịp rồi gọi walk("RRRR") bò qua dãy gầm thấp n và cửa C(4, 2) tới F(5, 2).',
      veMaMau: 'Gọi valve_step(1) cho R1 và walk("RRRR") cho R2.',
      san: ['#######', '#..FN.#', '#.nnCF#', '#######'],
      noi: [{ nut: { x: 4, y: 1 }, cua: [{ x: 4, y: 2 }] }],
      bd: [{ x: 2, y: 1, huong: 1 }, { x: 1, y: 2, huong: 1, chan: 'co' }],
      co: [[{ x: 3, y: 1 }], [{ x: 5, y: 2 }]],
      maMau: baiDoi(['move()'], ['wait()', 'walk("RRRR")']),
      loiGiai: baiDoi(['valve_step(1)'], ['wait()', 'walk("RRRR")']),
      loiSai: [
        { moTa: 'R1 gọi move() thay vì valve_step(1) nên cửa C(4, 2) không mở cho R2', baiLam: baiDoi(['move()'], ['wait()', 'walk("RRRR")']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 21, nhip: 12 },
      goiY: ['Thay move() của R1 bằng valve_step(1).']
    }),

    manNM('lap-nha-may', 4, 'luyen', {
      ten: 'Chế tạo hàm push_valve đẩy thùng giữ nút rồi lùi về',
      r2: R_OMNI,
      taoHam: ['push_valve'],
      hamCuaEmCan: ['move', 'forward', 'back', 'wait_n', 'slide_r'],
      deBai: 'Hãy chế tạo hàm push_valve(n) cho R1 gồm 2 lệnh: forward(n) để tiến n ô đẩy thùng nặng H đè lên nút M(3, 1), rồi back() để lùi về cờ F(1, 1)! Ở chương trình chính, R1 gọi push_valve(1) đẩy thùng H giữ cửa C(3, 2) mở cho R2 (robot omni) chờ 1 nhịp rồi trượt phải 3 ô vào F(4, 2).',
      veMaMau: 'Hoàn thiện hàm push_valve(n) gồm forward(n) và back().',
      san: ['######', '#FHM.#', '#..CF#', '######'],
      noi: [{ nut: { x: 3, y: 1 }, cua: [{ x: 3, y: 2 }] }],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 2, huong: 0 }],
      co: [[{ x: 1, y: 1 }], [{ x: 4, y: 2 }]],
      maMau: baiDoi(['push_valve(1)'], ['wait()', 'slide_r(3)']),
      loiGiai: baiDoi(['push_valve(1)'], ['wait()', 'slide_r(3)'], [H_PUSH_VALVE]),
      loiSai: [
        { moTa: 'Hàm push_valve(n) thiếu lệnh back() nên R1 chưa lùi về cờ F(1, 1)', baiLam: baiDoi(['push_valve(1)'], ['wait()', 'slide_r(3)']), hamCuaEmMoi: [{ ten: 'push_valve', thamSo: ['n'], than: ['forward(n)'] }], phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 19, nhip: 5 },
      goiY: ['Trong hàm push_valve(n), thêm lệnh back() ngay sau forward(n).']
    }),

    manNM('lap-nha-may', 5, 'cung-co', {
      ten: 'Sửa lỗi hàm push_valve phối hợp bánh gai phá đá',
      r2: R_GAI,
      hamCuaEmCan: ['move', 'forward', 'back', 'play_note'],
      deBai: 'Trong màn này hàm push_valve(n) của R1 bị viết ngược thứ tự (gọi back() trước khi gọi forward(n) nên R1 lùi đâm tường rồi mới đẩy thùng và không về lại cờ F(1, 1)). Hãy sửa lại hàm push_valve(n) cho đúng thứ tự forward(n) rồi back(), đồng thời cho R2 (bánh gai) ở (2, 2) hướng phải gọi play_note(listen()) phá đá chuông ở (3, 2) rồi tiến 3 ô qua cửa C(4, 2) vào F(5, 2)!',
      veMaMau: 'Sửa lại thứ tự lệnh trong push_valve(n) và thêm play_note(listen()) cho R2.',
      san: ['#######', '#FHM..#', '##..CF#', '#######'],
      noi: [{ nut: { x: 3, y: 1 }, cua: [{ x: 4, y: 2 }] }],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 2, huong: 1 }],
      co: [[{ x: 1, y: 1 }], [{ x: 5, y: 2 }]],
      daChuong: [{ x: 3, y: 2, not: 2, ben: 1 }],
      maMau: baiDoi(['push_valve(1)'], ['forward(3)'], [], [
        { ten: 'push_valve', thamSo: ['n'], than: ['back()', 'forward(n)'] }
      ]),
      loiGiai: baiDoi(['push_valve(1)'], ['play_note(listen())', 'forward(3)'], [], [H_PUSH_VALVE]),
      loiSai: [
        { moTa: 'Chưa sửa thứ tự lệnh trong push_valve(n) và chưa phá đá chuông', baiLam: baiDoi(['push_valve(1)'], ['forward(3)'], [], [{ ten: 'push_valve', thamSo: ['n'], than: ['back()', 'forward(n)'] }]), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 21, nhip: 4 },
      goiY: ['Đổi thứ tự trong push_valve(n) thành forward(n) rồi back(); ở R2 thêm play_note(listen()) trước forward(3).']
    }),

    manNM('lap-nha-may', 6, 'cung-co', {
      ten: 'Chế tạo hàm lob_clear lấp hố theo tầm',
      r2: R_OMNI,
      taoHam: ['lob_clear'],
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'aim_lob', 'slide_r', 'valve_step'],
      deBai: 'Hãy chế tạo hàm lob_clear(d) cho R2 (robot omni) gồm 2 lệnh: aim_lob(d) để nạp đá phía trước và hất đúng tầm d lấp hố cho R1, rồi slide_r(1) để trượt sang cờ F! Ở chương trình chính, R2 gọi lob_clear(2) lấp hố u(2, 1) và về F(3, 3); R1 chờ 2 nhịp rồi tiến 3 ô qua ô hố đã lấp về F(4, 1).',
      veMaMau: 'Hoàn thiện hàm lob_clear(d) và gọi lob_clear(2) cho R2.',
      san: ['######', '#.u.F#', '##o###', '##.F##', '######'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 3, huong: 0 }],
      co: [[{ x: 4, y: 1 }], [{ x: 3, y: 3 }]],
      maMau: baiDoi(['wait_n(2)', 'forward(3)'], ['lob_clear(2)']),
      loiGiai: baiDoi(['wait_n(2)', 'forward(3)'], ['lob_clear(2)'], [H_LOB_CLEAR]),
      loiSai: [
        { moTa: 'Hàm lob_clear(d) thiếu aim_lob(d) nên hố u(2, 1) chưa được lấp', baiLam: baiDoi(['wait_n(2)', 'forward(3)'], ['lob_clear(2)']), hamCuaEmMoi: [{ ten: 'lob_clear', thamSo: ['d'], than: ['slide_r(1)'] }], phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 21, nhip: 5 },
      goiY: ['Trong hàm lob_clear(d), gọi aim_lob(d) trước rồi gọi slide_r(1).']
    }),

    manNM('lap-nha-may', 7, 'van-dung', {
      ten: 'Hất đá qua rào sắt kết hợp valve_step',
      r2: R_OMNI,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'aim_lob', 'slide_r', 'valve_step', 'lob_clear'],
      deBai: 'Hố sâu u(2, 1) trên hành lang của R1 nằm cách R2 3 ô qua hàng rào sắt =(2, 2). Hãy cho R2 gọi lob_clear(3) để hất viên đá o(2, 3) bay 3 ô qua rào sắt lấp hố u(2, 1) rồi trượt sang F(3, 4); R1 chờ 2 nhịp, tiến 1 ô lên (2, 1) rồi gọi valve_step(1) phun van N(4, 1) và tiến vào F(3, 1)!',
      veMaMau: 'Gọi lob_clear(3) cho R2 và valve_step(1) cho R1.',
      san: ['######', '#.uFN#', '##=###', '##o###', '##.F##', '######'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 4, huong: 0 }],
      co: [[{ x: 3, y: 1 }], [{ x: 3, y: 4 }]],
      maMau: baiDoi(['wait_n(2)', 'move()'], ['lob_clear(2)']),
      loiGiai: baiDoi(['wait_n(2)', 'move()', 'valve_step(1)'], ['lob_clear(3)']),
      loiSai: [
        { moTa: 'Dùng lob_clear(2) nên đá rơi trúng hàng rào =(2, 2), hố u(2, 1) chưa lấp', baiLam: baiDoi(['wait_n(2)', 'move()', 'valve_step(1)'], ['lob_clear(2)']), phaiCoMa: ['nem-vo', 'roi-ho'] }
      ],
      sao: { o: 28, nhip: 5 },
      goiY: ['Sửa lob_clear(2) thành lob_clear(3) ở R2, và thêm valve_step(1) ở cuối R1.']
    }),

    manNM('lap-nha-may', 8, 'van-dung', {
      ten: 'Đội cứu hộ đưa kiện hàng qua cửa nút đè',
      r2: R_BANH, mucTieu: 'dua-vat',
      hamCuaEmCan: ['move', 'forward', 'back', 'pick', 'drop', 'push_valve'],
      deBai: 'Nhà máy cần đưa kiện hàng o(2, 2) qua cánh cửa C(3, 2) vào ô đích D(4, 2). R1 ở (1, 1) gọi push_valve(1) để đẩy thùng nặng H(2, 1) đè nút M(3, 1) mở cửa C(3, 2) rồi lùi về! Hãy viết lệnh cho R2 ở (1, 2): gắp kiện o(2, 2), tiến 2 ô bằng forward(2) lên C(3, 2) rồi thả vào D(4, 2).',
      veMaMau: 'R2 chưa tiến 2 ô và thả kiện hàng o vào D(4, 2).',
      san: ['######', '#.HM.#', '#.oCD#', '######'],
      noi: [{ nut: { x: 3, y: 1 }, cua: [{ x: 3, y: 2 }] }],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 2, huong: 1 }],
      maMau: baiDoi(['push_valve(1)'], ['pick()', 'forward(2)']),
      loiGiai: baiDoi(['push_valve(1)'], ['pick()', 'forward(2)', 'drop()']),
      loiSai: [
        { moTa: 'R2 mới tiến 2 ô và chưa thả kiện o vào D(4, 2)', baiLam: baiDoi(['push_valve(1)'], ['pick()', 'forward(2)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 22, nhip: 6 },
      goiY: ['Sau khi pick() kiện hàng o(2, 2) và forward(2) lên (3, 2), R2 gọi drop() để đặt kiện hàng vào D(4, 2).']
    }),

    manNM('lap-nha-may', 9, 'bien-the', {
      ten: 'Tổng duyệt liên quân Nhà máy - Hang động',
      r2: R_GAI,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'play_note', 'echo_glide', 'valve_step'],
      deBai: 'Tổng duyệt trước màn hợp tấu! R2 (bánh gai) đứng ở (2, 2) hướng lên gọi play_note(listen()) phá đá chuông (2, 1) cho R1, rồi quay đầu u_turn(), tiến xuống (2, 3), rẽ trái và tiến 2 ô qua cửa C(3, 3) vào F(4, 3). Còn R1 chờ 1 nhịp, tiến lên (2, 1) rồi gọi valve_step(1) phun van N(4, 1) mở cửa C(3, 3) cho R2 và tiến vào F(3, 1)!',
      veMaMau: 'Phối hợp play_note(listen()) của R2 và valve_step(1) của R1.',
      san: ['######', '#..FN#', '##.###', '##.CF#', '######'],
      noi: [{ nut: { x: 4, y: 1 }, cua: [{ x: 3, y: 3 }] }],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 2, huong: 0 }],
      co: [[{ x: 3, y: 1 }], [{ x: 4, y: 3 }]],
      daChuong: [{ x: 2, y: 1, not: 6, ben: 1 }],
      maMau: baiDoi(['wait()', 'move()'], ['play_note(listen())', 'u_turn()', 'move()', 'turn_left()']),
      loiGiai: baiDoi(['wait()', 'move()', 'valve_step(1)'], ['play_note(listen())', 'u_turn()', 'move()', 'turn_left()', 'forward(2)']),
      loiSai: [
        { moTa: 'R1 chưa gọi valve_step(1) mở cửa C(3, 3) và R2 chưa đi qua cửa C vào F(4, 3)', baiLam: baiDoi(['wait()', 'move()'], ['play_note(listen())']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 25, nhip: 6 },
      goiY: ['R1 gọi wait(), move(), valve_step(1); R2 gọi play_note(listen()), u_turn(), move(), turn_left(), forward(2).']
    }),

    manNM('lap-nha-may', 10, 'trum', {
      ten: 'Hợp tấu hàm play_part: Đoạn 2 Kìa con bướm vàng',
      r1: R1_XICH_LOA, r2: R_GAI, mucTieu: 'choi-dieu',
      dieu: { r1: '4 4 3 3 2 2 1 1', r2: '2 4 1 3 5 5 1 1' },
      hamCuaEmCan: ['play_note', 'play_part'],
      deBai: 'Màn kết Gói 2: Hãy dùng hàm play_part(notes) cho cả R1 và R2 để biểu diễn trọn vẹn Đoạn 2 bài "Kìa con bướm vàng" ("Em ngồi xem, em ngồi xem"): R1 gọi play_part([4, 4, 3, 3, 2, 2, 1, 1]), còn R2 gọi play_part([2, 4, 1, 3, 5, 5, 1, 1])!',
      veMaMau: 'Gọi play_part([2, 4, 1, 3, 5, 5, 1, 1]) cho R2 để hoàn thành bản hợp tấu.',
      san: ['#####', '#...#', '#####'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 3, y: 1, huong: 3 }],
      maMau: baiDoi(['play_part([4, 4, 3, 3, 2, 2, 1, 1])'], ['play_part([2, 4, 1, 3])']),
      loiGiai: baiDoi(['play_part([4, 4, 3, 3, 2, 2, 1, 1])'], ['play_part([2, 4, 1, 3, 5, 5, 1, 1])']),
      loiSai: [
        { moTa: 'Danh sách nốt của R2 mới có 4 nốt, thiếu 4 nốt cuối [5, 5, 1, 1]', baiLam: baiDoi(['play_part([4, 4, 3, 3, 2, 2, 1, 1])'], ['play_part([2, 4, 1, 3])']), phaiCoMa: ['lo-nhip'] }
      ],
      sao: { o: 24, nhip: 8 },
      goiY: ['Điền đủ 8 nốt [2, 4, 1, 3, 5, 5, 1, 1] vào lệnh play_part(...) của R2.']
    })
  ];
})();
