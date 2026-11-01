/* ============================================================================
   man-cuu-ben-song.js - Mua 9: CLB Sang Tao - Goi 5: Cuu ho Ben song
   20 man: R1 Xuong thuy loi Ben song (Mua 5) phoi hop R2 tu cac mua khac.
   Chuong 1 (cuu-ben-song): 10 man phoi hop 2 robot cuu ho ben song.
   Chuong 2 (lap-ben-song): 10 man on return, tuple, min/max va che ham moi.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var R1_XUONG = {
    loaiRobot: 'xuong',
    robot: { than: 'xuong', tay: 'day-keo', camBien: [{ ma: 'dong-chay', o: 'tren' }] },
    hamGoc: ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'tow', 'drop_tow', 'flow_dir', 'anchor', 'unanchor', 'tether', 'untether', 'flow']
  };

  var R1_LOA = {
    loaiRobot: 'xich',
    phatNot: true,
    robot: { than: 'xich', tay: 'loa', camBien: [{ ma: 'hong-ngoai', o: 'tren' }] },
    hamGoc: ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'beat', 'note', 'distance', 'warm']
  };

  var R_BANH = {
    loaiRobot: 'banh',
    robot: { than: 'hai-banh', tay: 'xoay', camBien: [{ ma: 'khoang-cach', o: 'truoc', ben: true }], son: 'lam' },
    hamGoc: ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'arm_down', 'arm_up', 'grab', 'release', 'arm_left', 'arm_right', 'front_clear', 'left_clear', 'right_clear']
  };

  var R_XICH = {
    loaiRobot: 'xich',
    xichDay: true,
    lucBan: true,
    beSung: true,
    robot: { than: 'xich', tay: 'hoi', camBien: [{ ma: 'hong-ngoai', o: 'truoc', doNhiet: true }], son: 'lam' },
    hamGoc: ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'spray', 'spray_back', 'distance', 'warm']
  };

  var R_NHEN = {
    loaiRobot: 'nhen',
    daoCuc: true,
    docCuc: true,
    robot: { than: 'nhen', tay: 'nam-cham', camBien: [{ ma: 'tu', o: 'hong', docCuc: true }], son: 'lam' },
    hamGoc: ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'crouch', 'stand', 'magnet_n', 'magnet_s', 'magnet_off', 'front_metal', 'front_pole']
  };

  var R_OMNI = {
    loaiRobot: 'omni',
    omniCheo: true,
    chinhLuc: true,
    nhanDang: true,
    tamNemMacDinh: 2,
    daLapHo: true,
    robot: { than: 'omni', tay: 'nem', camBien: [{ ma: 'radar', o: 'tren', nhanDang: true }], son: 'lam' },
    hamGoc: ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'slide_left', 'slide_right', 'load', 'throw', 'radar', 'diag_left', 'diag_right', 'aim', 'shape']
  };

  var R_GAI = {
    loaiRobot: 'gai',
    thuGai: true,
    phatNot: true,
    phanAm: true,
    robot: { than: 'gai', tay: 'loa', camBien: [{ ma: 'am-thanh', o: 'tren', phanAm: true }], son: 'lam' },
    hamGoc: ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'retract_spikes', 'extend_spikes', 'beat', 'note', 'hear', 'listen']
  };

  var H_CALM_BRIDGE_LAY = { ten: 'calm_bridge_lay', thamSo: ['n'], than: ['if flow_power() > 0:', '    flip_valve()', 'bridge_lay(n)'] };
  var H_CALMER_BRIDGE = { ten: 'calmer_bridge', thamSo: ['a', 'n'], than: ['s = calmer_power(a)', 'bridge_lay(n)', 'return s'] };
  var H_TUPLE_GATE_TOW = { ten: 'tuple_gate_tow', thamSo: ['n'], than: ['h, s = flow()', 'if s > 0:', '    flip_valve()', 'pull_back(n)'] };
  var H_MAX_STREAM_TOW = { ten: 'max_stream_tow', thamSo: ['a'], than: ['b = flow_power()', 'n = max(a, b)', 'pull_back(n)', 'return n'] };
  var H_TETHER_CALM_RUN = { ten: 'tether_calm_run', thamSo: ['d', 'n'], than: ['calm_tug_run(d, n)', 'move()'] };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function baiDoi(r1Lines, r2Lines, hamEmMoi) {
    return {
      doi: [{ chinh: r1Lines }, { chinh: r2Lines }],
      hamCuaMan: [],
      hamCuaEmMoi: hamEmMoi ? clone(hamEmMoi) : []
    };
  }

  function manBS(chuong, so, hang, cfg) {
    var r1 = clone(cfg.r1 || R1_XUONG);
    var r2 = clone(cfg.r2 || R_BANH);
    r1.batDau = cfg.bd[0];
    r2.batDau = cfg.bd[1];
    if (cfg.co) {
      r1.co = cfg.co[0];
      r2.co = cfg.co[1];
    }
    var m = {
      chuong: chuong,
      so: so,
      ten: cfg.ten,
      hang: hang,
      vo: 'song',
      bienDem: true,
      loaiRobot: r1.loaiRobot,
      daLapHo: true,
      robot: clone(r1.robot),
      hamGoc: r1.hamGoc.slice(),
      cauTruc: cfg.cauTruc || ['for', 'if', 'while', 'list', 'def', 'return', 'tuple'],
      vaHoac: true,
      moXuong: true,
      camHamCuaEm: false,
      hamCuaEmCan: cfg.hamCuaEmCan || ['move', 'forward', 'wait_n', 'bridge_lay'],
      taoHam: cfg.taoHam || [],
      khung: cfg.khung || { chinh: 10, moiHam: 8 },
      mucTieu: cfg.mucTieu || 'dua-vat',
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
    if (cfg.dong) m.dong = cfg.dong;
    if (cfg.noi) m.noi = cfg.noi;
    if (cfg.dieu) m.dieu = cfg.dieu;
    if (cfg.vatChat) m.vatChat = cfg.vatChat;
    if (cfg.vatDang) m.vatDang = cfg.vatDang;
    if (cfg.chuongDa) m.chuongDa = cfg.chuongDa;
    if (cfg.daChuong) m.daChuong = cfg.daChuong;
    return ManHoc.chuanHoa(m);
  }

  ManHoc.manCuuBenSong = [
    /* ========================================================================
       CHUONG 1: cuu-ben-song (10 man)
       ======================================================================== */
    manBS('cuu-ben-song', 1, 'lam-quen', {
      ten: 'Xuồng kéo bè ghép cầu phao cho xe kho',
      chiChay: true, r2: R_BANH,
      hamCuaEmCan: ['bridge_lay', 'pull_back', 'tow_grab', 'tow_drop', 'back', 'wait_n', 'forward', 'move', 'pick', 'drop', 'turn_right'],
      deBai: 'Bão làm trôi cầu phao ở Bến sông (Mùa 5)! Xuồng R1 tại (3, 2) gọi bridge_lay(1) kéo bè gỗ B từ (5, 2) về bến nước êm q(3, 2) rồi tháo dây làm cầu phao. Xe hai bánh R2 (Mùa 1) ở bờ Bắc (3, 1) chờ 2 nhịp rồi tiến 2 ô qua cầu phao sang bờ Nam nhặt kiện hàng o(3, 4) đặt vào đích D(2, 3). Nhấn Chạy để quan sát!',
      veMaMau: 'Quan sát R1 ghép cầu phao B(3, 2) cho R2 qua sông cứu hàng.',
      san: ['#######', '#=..=.#', '#~~q~B#', '#.D...#', '#..o..#', '#######'],
      bd: [{ x: 3, y: 2, huong: 1 }, { x: 3, y: 1, huong: 2 }],
      maMau: baiDoi(['bridge_lay(1)'], ['wait_n(2)', 'forward(2)', 'pick()', 'turn_right()', 'drop()']),
      loiGiai: baiDoi(['bridge_lay(1)'], ['wait_n(2)', 'forward(2)', 'pick()', 'turn_right()', 'drop()']),
      sao: { o: 24, nhip: 8 },
      goiY: ['Nhấn Chạy để xem R1 kéo bè B về q(3, 2) làm cầu phao cho R2 qua sông.']
    }),

    manBS('cuu-ben-song', 2, 'lam-quen', {
      ten: 'Nhện chui gầm thấp vượt cầu phao hút sắt',
      r2: R_NHEN,
      hamCuaEmCan: ['bridge_lay', 'pull_back', 'tow_grab', 'tow_drop', 'back', 'crawl', 'walk', 'go', 'pull_s', 'pull_deliver'],
      deBai: 'Kiện sắt vụn o(3, 3) nằm bên bờ Nam, còn đường ra bờ Bắc bị chắn bởi gầm thấp n(2, 1). Trong lúc R1 ở (3, 2) gọi bridge_lay(1) kéo bè B(5, 2) về ghép cầu phao q(3, 2), hãy lập trình cho R2 (nhện nam châm Mùa 3) gọi crawl("R") chui qua gầm thấp tới (3, 1), rồi gọi walk("DD") qua cầu phao xuống (3, 3) và pull_deliver("R") đưa kiện sắt o(3, 3) sang đích D(4, 3)!',
      veMaMau: 'R2 chưa đi qua cầu phao và đưa kiện sắt o(3, 3) vào D(4, 3).',
      san: ['#######', '#.n...#', '#~~q~B#', '#..oD.#', '#######'],
      vatChat: ['.......', '.......', '.......', '...s...', '.......'],
      bd: [{ x: 3, y: 2, huong: 1 }, { x: 1, y: 1, huong: 2, chan: 'co' }],
      maMau: baiDoi(['bridge_lay(1)'], ['crawl("R")']),
      loiGiai: baiDoi(['bridge_lay(1)'], ['crawl("R")', 'walk("DD")', 'pull_deliver("R")']),
      loiSai: [
        { moTa: 'R2 mới chui qua gầm thấp, chưa qua cầu phao lấy kiện sắt o(3, 3)', baiLam: baiDoi(['bridge_lay(1)'], ['crawl("R")']), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 24, nhip: 12 },
      goiY: ['Ở chương trình R2, sau crawl("R"), viết thêm walk("DD") và pull_deliver("R").']
    }),

    manBS('cuu-ben-song', 3, 'luyen', {
      ten: 'Xích vượt cầu phao đẩy thùng nặng vào đích',
      r2: R_XICH, mucTieu: 'day-thung',
      hamCuaEmCan: ['bridge_lay', 'pull_back', 'tow_grab', 'tow_drop', 'back', 'wait_n', 'forward', 'move'],
      deBai: 'Trên bờ Nam có thùng máy nặng H(3, 4) cần đẩy vào bệ đích D(3, 5). Hãy cho R1 ở (3, 2) gọi bridge_lay(1) kéo bè B(5, 2) về q(3, 2) làm cầu phao; R2 (xe bánh xích Mùa 2) ở (3, 1) gọi wait_n(2) chờ ghép cầu rồi gọi forward(3) vượt sông đẩy thẳng thùng H vào D(3, 5)!',
      veMaMau: 'R2 chưa chờ cầu phao và tiến 3 ô qua sông đẩy thùng H.',
      san: ['#######', '#=..=.#', '#~~q~B#', '#=..=.#', '#..H..#', '#..D..#', '#######'],
      bd: [{ x: 3, y: 2, huong: 1 }, { x: 3, y: 1, huong: 2 }],
      maMau: baiDoi(['bridge_lay(1)'], ['wait_n(2)']),
      loiGiai: baiDoi(['bridge_lay(1)'], ['wait_n(2)', 'forward(3)']),
      loiSai: [
        { moTa: 'R2 chỉ chờ mà chưa gọi forward(3) để qua cầu đẩy thùng H', baiLam: baiDoi(['bridge_lay(1)'], ['wait_n(2)']), phaiCoMa: ['chua-day-thung'] }
      ],
      sao: { o: 20, nhip: 5 },
      goiY: ['Ở chương trình R2, sau wait_n(2) hãy gọi forward(3) để đi qua B(3, 2) và đẩy H(3, 4) vào D(3, 5).']
    }),

    manBS('cuu-ben-song', 4, 'luyen', {
      ten: 'Mở cống tắt dòng cho omni qua cầu hất đá',
      r2: R_OMNI,
      hamCuaEmCan: ['open_gate_pass', 'flip_valve', 'tow_grab', 'pull_back', 'back', 'turn_left', 'turn_right', 'move', 'forward', 'wait_n', 'aim_lob', 'lob'],
      deBai: 'Bè B đã nằm ở q(2, 2) nhưng dưới gầm bè đang có dòng chảy nên xe chưa qua được! R1 ở (4, 2) hãy gọi open_gate_pass(1) để quăng dây gạt van V(4, 1) (vừa tắt dòng dưới B(2, 2), vừa mở cống K(5, 2)) rồi gọi pull_back(2) kéo lục bình L(7, 2) về bến q(4, 2). R2 (xe omni Mùa 7) ở (2, 1) gọi wait_n(2), tiến 2 ô qua cầu phao tới (2, 3) rồi gọi aim_lob(3) hất viên đá o(2, 4) vào đích D(2, 6)!',
      veMaMau: 'R1 chưa kéo lục bình L về q(4, 2); R2 chưa hất đá vào D(2, 6).',
      san: ['#########', '#=.=V===#', '#Bq~qK~L#', '#=.===..#', '#.o.....#', '#.......#', '#.D.....#', '#########'],
      dong: [{ x: 1, y: 2, huong: 1, suc: 1 }, { x: 2, y: 2, huong: 2, suc: 1 }],
      noi: [{ nut: { x: 4, y: 1 }, cong: [{ x: 5, y: 2 }], dong: [{ x: 1, y: 2 }, { x: 2, y: 2 }] }],
      bd: [{ x: 4, y: 2, huong: 1 }, { x: 2, y: 1, huong: 2 }],
      maMau: baiDoi(['open_gate_pass(1)'], ['wait_n(2)', 'forward(2)']),
      loiGiai: baiDoi(['open_gate_pass(1)', 'pull_back(2)'], ['wait_n(2)', 'forward(2)', 'aim_lob(3)']),
      loiSai: [
        { moTa: 'R1 quên pull_back(2) và R2 quên aim_lob(3)', baiLam: baiDoi(['open_gate_pass(1)'], ['wait_n(2)', 'forward(2)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 30, nhip: 8 },
      goiY: ['R1 thêm pull_back(2) sau open_gate_pass(1); R2 thêm aim_lob(3) sau forward(2).']
    }),

    manBS('cuu-ben-song', 5, 'cung-co', {
      ten: 'Bánh gai tấu nhạc phá thạch nhũ chắn luồng',
      r2: R_GAI,
      hamCuaEmCan: ['move', 'pull_back', 'tow_grab', 'back', 'play_note'],
      deBai: 'Một khối đá chuông ngầm ở (3, 2) chắn ngang luồng kênh khiến xuồng R1 ở (2, 2) không thể tiến tới kéo bè B(6, 2) về bến q(2, 2). Hãy cho R2 (robot bánh gai Mùa 8) ở (2, 1) gọi play_note(listen()) cộng hưởng với chuông đá cạnh bờ để phá khối đá chuông (3, 2); R1 chờ 1 nhịp wait(), tiến 1 ô move() vào (3, 2) rồi gọi pull_back(2) kéo bè B về q(2, 2)!',
      veMaMau: 'R1 chưa chờ đá vỡ rồi tiến lên kéo bè B về q(2, 2).',
      san: ['########', '#=....=#', '#~q~~~B#', '########'],
      chuongDa: [{ x: 2, y: 1, not: 3, phamVi: 4 }],
      daChuong: [{ x: 3, y: 2, not: 3, ben: 1 }],
      bd: [{ x: 2, y: 2, huong: 1 }, { x: 2, y: 1, huong: 1 }],
      maMau: baiDoi(['wait()'], ['play_note(listen())']),
      loiGiai: baiDoi(['wait()', 'move()', 'pull_back(2)'], ['play_note(listen())']),
      loiSai: [
        { moTa: 'R1 chỉ chờ mà chưa tiến lên kéo bè B về q(2, 2)', baiLam: baiDoi(['wait()'], ['play_note(listen())']), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 20, nhip: 5 },
      goiY: ['Ở chương trình R1, sau wait() hãy gọi move() và pull_back(2).']
    }),

    manBS('cuu-ben-song', 6, 'cung-co', {
      ten: 'Xe tay xoay qua bè trước khi xuồng rút cầu',
      r2: R_BANH,
      hamCuaEmCan: ['wait_n', 'pull_back', 'tow_grab', 'back', 'forward', 'move', 'pick_left', 'drop'],
      deBai: 'Bè B đang bắc ngang khe nước ở (2, 2) cho R2 từ (2, 1) sang bờ Nam, nhưng bến nhận cuối cùng của bè B lại là q(5, 2)! Hãy cho R2 đi ngay từ nhịp 1: gọi forward(2) qua bè xuống (2, 3), dùng tay xoay gọi pick_left() nhặt kiện hàng o(3, 3) bên trái rồi drop() thẳng vào D(2, 4). R1 ở (4, 2) hướng Tây gọi wait_n(2) chờ R2 qua khỏi bè rồi mới gọi pull_back(2) kéo B về q(5, 2)!',
      veMaMau: 'R1 chưa kéo bè B về q(5, 2); R2 chưa dùng pick_left() và drop().',
      san: ['########', '#=.====#', '#~B~~q~#', '#..o...#', '#.D....#', '########'],
      bd: [{ x: 4, y: 2, huong: 3 }, { x: 2, y: 1, huong: 2 }],
      maMau: baiDoi(['wait_n(2)'], ['forward(2)']),
      loiGiai: baiDoi(['wait_n(2)', 'pull_back(2)'], ['forward(2)', 'pick_left()', 'drop()']),
      loiSai: [
        { moTa: 'R1 kéo bè ngay nhịp 1 khi R2 đang bước lên làm R2 đâm xuống nước', baiLam: baiDoi(['pull_back(2)'], ['forward(2)', 'pick_left()', 'drop()']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      sao: { o: 25, nhip: 7 },
      goiY: ['R1 gọi wait_n(2) rồi pull_back(2); R2 gọi forward(2), pick_left(), drop().']
    }),

    manBS('cuu-ben-song', 7, 'van-dung', {
      ten: 'Xích phun van mở cửa bờ Nam rồi qua cầu đẩy thùng',
      r2: R_XICH, mucTieu: 'day-thung',
      hamCuaEmCan: ['bridge_lay', 'pull_back', 'tow_grab', 'tow_drop', 'back', 'squirt', 'tr_right', 'forward', 'move'],
      deBai: 'Cửa C(3, 3) trên bờ Nam đang đóng kín trước thùng nặng H(3, 4), còn nút van N(5, 1) nằm trên bờ Bắc. Trong lúc R1 ở (3, 2) gọi bridge_lay(1) kéo bè B(5, 2) về q(3, 2) làm cầu phao, hãy cho R2 ở (3, 1) hướng Đông gọi squirt("low") bắn nút N(5, 1) mở cửa C(3, 3), gọi tr_right() quay mặt xuống Nam rồi gọi forward(3) qua cầu phao đẩy thùng H vào D(3, 5)!',
      veMaMau: 'R2 chưa quay xuống và tiến 3 ô qua cầu phao đẩy thùng H.',
      san: ['#######', '#=..=N#', '#~~q~B#', '#=.C=.#', '#..H..#', '#..D..#', '#######'],
      noi: [{ nut: { x: 5, y: 1 }, cua: [{ x: 3, y: 3 }] }],
      bd: [{ x: 3, y: 2, huong: 1 }, { x: 3, y: 1, huong: 1 }],
      maMau: baiDoi(['bridge_lay(1)'], ['squirt("low")', 'tr_right()']),
      loiGiai: baiDoi(['bridge_lay(1)'], ['squirt("low")', 'tr_right()', 'forward(3)']),
      loiSai: [
        { moTa: 'R2 mới bắn van và quay phải, chưa tiến qua cầu phao đẩy thùng H', baiLam: baiDoi(['bridge_lay(1)'], ['squirt("low")', 'tr_right()']), phaiCoMa: ['chua-day-thung'] }
      ],
      sao: { o: 24, nhip: 6 },
      goiY: ['Ở chương trình R2, sau squirt("low") và tr_right(), gọi thêm forward(3).']
    }),

    manBS('cuu-ben-song', 8, 'van-dung', {
      ten: 'Chế hàm tắt dòng ghép cầu phao',
      r2: R_BANH, taoHam: ['calm_bridge_lay'],
      hamCuaEmCan: ['flow_power', 'flip_valve', 'bridge_lay', 'pull_back', 'tow_grab', 'tow_drop', 'back', 'turn_left', 'turn_right', 'sync_dock_pass', 'wait_n', 'cross_and_pick', 'forward', 'move', 'pick', 'drop'],
      deBai: 'Dòng nước tại (5, 2) đang chảy mạnh. Hãy tạo hàm mới calm_bridge_lay(n) cho R1: nếu flow_power() > 0 thì gọi flip_valve() gạt van V(4, 1) tắt dòng, sau đó gọi bridge_lay(n) kéo bè về ghép cầu phao. R1 ở (4, 2) gọi calm_bridge_lay(2) kéo B(6, 2) về q(3, 2); R2 ở (3, 1) gọi sync_dock_pass(7, 2) chờ 7 nhịp rồi qua cầu nhặt o(3, 4), quay phải và drop() vào D(2, 3)!',
      veMaMau: 'Định nghĩa hàm calm_bridge_lay(n) và gọi cho R1.',
      san: ['########', '#=..V=.#', '#~~q~~B#', '#.D....#', '#..o...#', '########'],
      dong: [{ x: 5, y: 2, huong: 1, suc: 1 }],
      noi: [{ nut: { x: 4, y: 1 }, cong: [], dong: [{ x: 5, y: 2 }] }],
      bd: [{ x: 4, y: 2, huong: 1 }, { x: 3, y: 1, huong: 2 }],
      maMau: baiDoi(['bridge_lay(2)'], ['sync_dock_pass(7, 2)', 'turn_right()', 'drop()']),
      loiGiai: baiDoi(['calm_bridge_lay(2)'], ['sync_dock_pass(7, 2)', 'turn_right()', 'drop()'], [H_CALM_BRIDGE_LAY]),
      loiSai: [
        { moTa: 'R2 quên gọi drop() sau khi quay phải nên kiện hàng chưa vào D(2, 3)', baiLam: baiDoi(['calm_bridge_lay(2)'], ['sync_dock_pass(7, 2)', 'turn_right()'], [H_CALM_BRIDGE_LAY]), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 34, nhip: 12 },
      goiY: ['Tạo hàm calm_bridge_lay(n): nếu flow_power() > 0 thì gọi flip_valve(), sau đó gọi bridge_lay(n).']
    }),

    manBS('cuu-ben-song', 9, 'bien-the', {
      ten: 'Tắt dòng ghép cầu phao xa cho nhện hút sắt',
      r2: R_NHEN,
      hamCuaEmCan: ['calm_bridge_lay', 'flow_power', 'flip_valve', 'bridge_lay', 'pull_back', 'tow_grab', 'tow_drop', 'back', 'turn_left', 'turn_right', 'wait_n', 'walk', 'go', 'pull_s', 'pull_deliver'],
      deBai: 'Bè B nằm ở tận (7, 2), còn dòng nước ở (5, 2) đang chảy. Hãy dùng hàm calm_bridge_lay(2) vừa chế để R1 ở (4, 2) gạt van V(4, 1) tắt dòng rồi kéo B(7, 2) lùi 2 ô về q(3, 2) và tháo dây. R2 (nhện Mùa 3) ở (3, 1) gọi wait_n(7) chờ cầu ghép xong, gọi walk("DD") qua sông tới (3, 3) và pull_deliver("R") đưa sắt o(3, 3) vào D(4, 3)!',
      veMaMau: 'R1 gọi calm_bridge_lay(2); R2 chờ 7 nhịp rồi qua cầu phao lấy sắt.',
      san: ['#########', '#=..V=..#', '#~~q~~~B#', '#..oD...#', '#########'],
      vatChat: ['.........', '.........', '.........', '...s.....', '.........'],
      dong: [{ x: 5, y: 2, huong: 1, suc: 1 }],
      noi: [{ nut: { x: 4, y: 1 }, cong: [], dong: [{ x: 5, y: 2 }] }],
      bd: [{ x: 4, y: 2, huong: 1 }, { x: 3, y: 1, huong: 2 }],
      maMau: baiDoi(['calm_bridge_lay(2)'], ['wait_n(7)', 'walk("DD")']),
      loiGiai: baiDoi(['calm_bridge_lay(2)'], ['wait_n(7)', 'walk("DD")', 'pull_deliver("R")']),
      loiSai: [
        { moTa: 'R2 qua cầu phao nhưng quên gọi pull_deliver("R") để đưa sắt vào D(4, 3)', baiLam: baiDoi(['calm_bridge_lay(2)'], ['wait_n(7)', 'walk("DD")']), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 32, nhip: 15 },
      goiY: ['Ở chương trình R2, sau wait_n(7) và walk("DD"), gọi thêm pull_deliver("R").']
    }),

    manBS('cuu-ben-song', 10, 'trum', {
      ten: 'Hòa tấu còi xuồng mừng bến sông thông luồng',
      r1: R1_LOA, r2: R_GAI, mucTieu: 'choi-dieu',
      dieu: { r1: '1 3 5 3', r2: '3 5 8 5' },
      hamCuaEmCan: ['play_part', 'play_note'],
      deBai: 'Bến sông đã thông luồng an toàn! Trên lễ đài nổi, R1 và R2 cùng hòa tấu bản nhạc 4 nhịp mừng chiến thắng: R1 tấu bè [1, 3, 5, 3], còn R2 tấu bè [3, 5, 8, 5]. Hãy gọi play_part([3, 5, 8, 5]) cho R2!',
      veMaMau: 'R2 chưa gọi play_part([3, 5, 8, 5]).',
      san: ['#####', '#...#', '#####'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 3, y: 1, huong: 3 }],
      maMau: baiDoi(['play_part([1, 3, 5, 3])'], ['play_note(3)']),
      loiGiai: baiDoi(['play_part([1, 3, 5, 3])'], ['play_part([3, 5, 8, 5])']),
      loiSai: [
        { moTa: 'R2 chỉ phát 1 nốt đầu nên thiếu 3 nhịp hòa âm', baiLam: baiDoi(['play_part([1, 3, 5, 3])'], ['play_note(3)']), phaiCoMa: ['lo-nhip'] }
      ],
      sao: { o: 18, nhip: 4 },
      goiY: ['Ở chương trình R2, gọi play_part([3, 5, 8, 5]).']
    }),

    /* ========================================================================
       CHUONG 2: lap-ben-song (10 man)
       ======================================================================== */
    manBS('lap-ben-song', 1, 'lam-quen', {
      ten: 'Ghép cầu phao cho omni qua sông hất đá',
      chiChay: true, r2: R_OMNI,
      hamCuaEmCan: ['calm_bridge_lay', 'flow_power', 'flip_valve', 'bridge_lay', 'pull_back', 'tow_grab', 'tow_drop', 'back', 'turn_left', 'turn_right', 'wait_n', 'forward', 'move', 'aim_lob', 'lob'],
      deBai: 'Sang Chương 2, đội cứu hộ ôn lại hàm trả kết quả (return), bộ cố định (tuple) và min/max của Mùa 5! Ở màn làm mẫu này, R1 tại (4, 2) gọi calm_bridge_lay(2) gạt van V(4, 1) tắt dòng và kéo bè B(6, 2) về q(3, 2); R2 (xe omni Mùa 7) ở bờ Bắc (3, 1) chờ 7 nhịp rồi tiến 2 ô qua cầu phao xuống bờ Nam (3, 3) và gọi aim_lob(3) hất viên đá o(3, 4) vào đích D(3, 6). Nhấn Chạy để xem!',
      veMaMau: 'Quan sát R1 tắt dòng ghép cầu cho R2 qua sông hất đá.',
      san: ['#########', '#=..V===#', '#~~q~~B~#', '#=..====#', '#..o....#', '#.......#', '#..D....#', '#########'],
      dong: [{ x: 5, y: 2, huong: 1, suc: 1 }],
      noi: [{ nut: { x: 4, y: 1 }, cong: [], dong: [{ x: 5, y: 2 }] }],
      bd: [{ x: 4, y: 2, huong: 1 }, { x: 3, y: 1, huong: 2 }],
      maMau: baiDoi(['calm_bridge_lay(2)'], ['wait_n(7)', 'forward(2)', 'aim_lob(3)']),
      loiGiai: baiDoi(['calm_bridge_lay(2)'], ['wait_n(7)', 'forward(2)', 'aim_lob(3)']),
      sao: { o: 30, nhip: 11 },
      goiY: ['Nhấn Chạy để xem R1 và R2 phối hợp qua sông.']
    }),

    manBS('lap-ben-song', 2, 'lam-quen', {
      ten: 'Chế hàm đo dòng êm hơn và ghép cầu trả kết quả',
      r2: R_BANH, taoHam: ['calmer_bridge'],
      hamCuaEmCan: ['calmer_power', 'flow_power', 'bridge_lay', 'pull_back', 'tow_grab', 'tow_drop', 'back', 'sync_dock_pass', 'wait_n', 'cross_and_pick', 'forward', 'move', 'pick', 'turn_right', 'drop'],
      deBai: 'Hãy ôn lại return và min(a, b) qua hàm calmer_power(a): tạo hàm mới calmer_bridge(a, n) thực hiện s = calmer_power(a) (so sánh sức nước trước mũi với a để lấy số nhỏ hơn), gọi bridge_lay(n) ghép cầu phao rồi return s! R1 ở (3, 2) gọi s = calmer_bridge(2, 1) kéo B(5, 2) về q(3, 2); R2 ở (3, 1) gọi sync_dock_pass(2, 2), turn_right(), drop() đưa o(3, 4) vào D(2, 3).',
      veMaMau: 'Định nghĩa hàm calmer_bridge(a, n) có return s cho R1.',
      san: ['#######', '#=..=.#', '#~~q~B#', '#.D...#', '#..o..#', '#######'],
      dong: [{ x: 4, y: 2, huong: 1, suc: 1 }],
      bd: [{ x: 3, y: 2, huong: 1 }, { x: 3, y: 1, huong: 2 }],
      maMau: baiDoi(['bridge_lay(1)'], ['sync_dock_pass(2, 2)', 'turn_right()', 'drop()']),
      loiGiai: baiDoi(['s = calmer_bridge(2, 1)'], ['sync_dock_pass(2, 2)', 'turn_right()', 'drop()'], [H_CALMER_BRIDGE]),
      loiSai: [
        { moTa: 'R2 quên gọi drop() sau khi quay phải nên kiện hàng chưa đặt vào D(2, 3)', baiLam: baiDoi(['s = calmer_bridge(2, 1)'], ['sync_dock_pass(2, 2)', 'turn_right()'], [H_CALMER_BRIDGE]), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 34, nhip: 8 },
      goiY: ['Tạo hàm calmer_bridge(a, n) gồm: s = calmer_power(a), bridge_lay(n), return s; ở R1 viết s = calmer_bridge(2, 1).']
    }),

    manBS('lap-ben-song', 3, 'luyen', {
      ten: 'Dùng kết quả trả về để ghép cầu cho nhện hút sắt',
      r2: R_NHEN,
      hamCuaEmCan: ['calmer_bridge', 'calmer_power', 'flow_power', 'bridge_lay', 'pull_back', 'tow_grab', 'tow_drop', 'back', 'wait_n', 'walk', 'go', 'pull_s', 'pull_deliver'],
      deBai: 'Tại (4, 2) có dòng chảy sức 1 nên calmer_bridge(2, 2) sẽ trả về 1 (giá trị nhỏ hơn giữa 2 và 1) đồng thời kéo bè B(6, 2) về ghép cầu tại q(3, 2). Hãy cho R1 ở (4, 2) gọi s = calmer_bridge(2, 2); R2 (nhện Mùa 3) ở (3, 1) gọi wait_n(4) chờ ghép cầu, walk("DD") qua cầu xuống (3, 3) và pull_deliver("R") đưa sắt o(3, 3) sang D(4, 3)!',
      veMaMau: 'R2 chưa gọi pull_deliver("R") sau khi qua cầu phao.',
      san: ['########', '#=..=..#', '#~~q~~B#', '#..oD..#', '########'],
      vatChat: ['........', '........', '........', '...s....', '........'],
      dong: [{ x: 5, y: 2, huong: 1, suc: 1 }],
      bd: [{ x: 4, y: 2, huong: 1 }, { x: 3, y: 1, huong: 2 }],
      maMau: baiDoi(['s = calmer_bridge(2, 2)'], ['wait_n(4)', 'walk("DD")']),
      loiGiai: baiDoi(['s = calmer_bridge(2, 2)'], ['wait_n(4)', 'walk("DD")', 'pull_deliver("R")']),
      loiSai: [
        { moTa: 'R2 chưa gọi pull_deliver("R") để đưa kiện sắt o(3, 3) vào D(4, 3)', baiLam: baiDoi(['s = calmer_bridge(2, 2)'], ['wait_n(4)', 'walk("DD")']), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 34, nhip: 12 },
      goiY: ['Ở chương trình R2, thêm pull_deliver("R") sau walk("DD").']
    }),

    manBS('lap-ben-song', 4, 'luyen', {
      ten: 'Chế hàm tách bộ tuple dòng chảy mở cống',
      r2: R_XICH, mucTieu: 'day-thung', taoHam: ['tuple_gate_tow'],
      hamCuaEmCan: ['flip_valve', 'pull_back', 'tow_grab', 'back', 'turn_left', 'turn_right', 'wait_n', 'forward', 'move'],
      deBai: 'Cảm biến flow() trả về bộ cố định 2 phần (hướng, sức). Hãy tạo hàm mới tuple_gate_tow(n) cho R1: tách h, s = flow(), nếu s > 0 thì gọi flip_valve() gạt van V(4, 1) (tắt dòng dưới bè B(2, 2) và mở cống K(5, 2)), sau đó gọi pull_back(n). R1 ở (4, 2) gọi tuple_gate_tow(1) kéo L(6, 2) qua cống về q(4, 2); R2 (xe xích) ở (2, 1) gọi wait_n(2) rồi forward(3) qua bè B(2, 2) đẩy thùng H(2, 4) vào D(2, 5)!',
      veMaMau: 'Định nghĩa hàm tuple_gate_tow(n) tách h, s = flow() cho R1.',
      san: ['########', '#=.=V==#', '#Bq~qKL#', '#=.===.#', '#.H....#', '#.D....#', '########'],
      dong: [{ x: 1, y: 2, huong: 1, suc: 1 }, { x: 2, y: 2, huong: 2, suc: 1 }, { x: 5, y: 2, huong: 1, suc: 2 }],
      noi: [{ nut: { x: 4, y: 1 }, cong: [{ x: 5, y: 2 }], dong: [{ x: 1, y: 2 }, { x: 2, y: 2 }, { x: 5, y: 2 }] }],
      bd: [{ x: 4, y: 2, huong: 1 }, { x: 2, y: 1, huong: 2 }],
      maMau: baiDoi(['pull_back(1)'], ['wait_n(2)', 'forward(3)']),
      loiGiai: baiDoi(['tuple_gate_tow(1)'], ['wait_n(2)', 'forward(3)'], [H_TUPLE_GATE_TOW]),
      loiSai: [
        { moTa: 'R1 không kiểm tra flow() để gạt van V nên dòng chảy dưới bè B(2, 2) chưa tắt, R2 lao xuống nước', baiLam: baiDoi(['pull_back(1)'], ['wait_n(2)', 'forward(3)']), phaiCoMa: ['dam-tuong', 'chua-day-thung'] }
      ],
      sao: { o: 30, nhip: 5 },
      goiY: ['Tạo hàm tuple_gate_tow(n) gồm: h, s = flow(), if s > 0: flip_valve(), rồi pull_back(n); gọi tuple_gate_tow(1) cho R1.']
    }),

    manBS('lap-ben-song', 5, 'cung-co', {
      ten: 'Tách tuple mở cống kéo lục bình và cứu hàng bờ Nam',
      r2: R_BANH,
      hamCuaEmCan: ['tuple_gate_tow', 'flip_valve', 'pull_back', 'tow_grab', 'back', 'turn_left', 'turn_right', 'sync_dock_pass', 'wait_n', 'cross_and_pick', 'forward', 'move', 'pick', 'drop'],
      deBai: 'Dùng lại hàm tuple_gate_tow(n) vừa chế: R1 ở (4, 2) gọi tuple_gate_tow(1) để đọc h, s = flow() tại ô (5, 2), gạt van V(4, 1) tắt dòng dưới cầu phao B(2, 2) và mở cống K(5, 2), rồi kéo lục bình L(6, 2) về bến q(4, 2)! Cùng lúc đó, R2 ở (2, 1) gọi sync_dock_pass(2, 2) qua cầu phao B(2, 2) nhặt kiện hàng o(2, 4), gọi turn_left() và drop() vào đích D(3, 3).',
      veMaMau: 'R2 chưa gọi turn_left() và drop() để đặt kiện hàng vào D(3, 3).',
      san: ['########', '#=.=V==#', '#Bq~qKL#', '#..D===#', '#.o....#', '########'],
      dong: [{ x: 1, y: 2, huong: 1, suc: 1 }, { x: 2, y: 2, huong: 2, suc: 1 }, { x: 5, y: 2, huong: 1, suc: 1 }],
      noi: [{ nut: { x: 4, y: 1 }, cong: [{ x: 5, y: 2 }], dong: [{ x: 1, y: 2 }, { x: 2, y: 2 }, { x: 5, y: 2 }] }],
      bd: [{ x: 4, y: 2, huong: 1 }, { x: 2, y: 1, huong: 2 }],
      maMau: baiDoi(['tuple_gate_tow(1)'], ['sync_dock_pass(2, 2)']),
      loiGiai: baiDoi(['tuple_gate_tow(1)'], ['sync_dock_pass(2, 2)', 'turn_left()', 'drop()']),
      loiSai: [
        { moTa: 'R2 nhặt kiện hàng o(2, 4) nhưng chưa quay trái và thả vào D(3, 3)', baiLam: baiDoi(['tuple_gate_tow(1)'], ['sync_dock_pass(2, 2)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 34, nhip: 8 },
      goiY: ['Ở chương trình R2, sau sync_dock_pass(2, 2) hãy gọi turn_left() và drop().']
    }),

    manBS('lap-ben-song', 6, 'cung-co', {
      ten: 'Chế hàm dùng max chọn quãng kéo bè và hất đá',
      r2: R_OMNI, taoHam: ['max_stream_tow'],
      hamCuaEmCan: ['flow_power', 'pull_back', 'tow_grab', 'back', 'lob_clear', 'aim_lob', 'lob', 'slide_r'],
      deBai: 'Hãy ôn lại hàm max(a, b) và return: tạo hàm mới max_stream_tow(a) cho R1 thực hiện b = flow_power(), tính n = max(a, b), gọi pull_back(n) rồi return n! Tại (4, 2) có dòng chảy sức 2 nên khi R1 ở (3, 2) gọi s = max_stream_tow(1), xuồng sẽ kéo bè B(6, 2) lùi đúng 2 ô về q(2, 2). Cùng lúc đó, R2 (xe omni) ở bờ Nam (2, 3) gọi lob_clear(3) hất viên đá o(2, 4) vào đích D(2, 6)!',
      veMaMau: 'Định nghĩa hàm max_stream_tow(a) dùng max(a, b) và return n.',
      san: ['########', '#=....=#', '#~q~~~B#', '#..===.#', '#.o....#', '#......#', '#.D....#', '########'],
      dong: [{ x: 4, y: 2, huong: 1, suc: 2 }],
      bd: [{ x: 3, y: 2, huong: 1 }, { x: 2, y: 3, huong: 2 }],
      maMau: baiDoi(['pull_back(1)'], ['lob_clear(3)']),
      loiGiai: baiDoi(['s = max_stream_tow(1)'], ['lob_clear(3)'], [H_MAX_STREAM_TOW]),
      loiSai: [
        { moTa: 'R1 chỉ kéo lùi 1 ô nên bè B mới về tới (3, 2), chưa tới bến q(2, 2)', baiLam: baiDoi(['pull_back(1)'], ['lob_clear(3)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 30, nhip: 5 },
      goiY: ['Tạo hàm max_stream_tow(a) gồm: b = flow_power(), n = max(a, b), pull_back(n), return n; ở R1 gọi s = max_stream_tow(1).']
    }),

    manBS('lap-ben-song', 7, 'van-dung', {
      ten: 'Phá đá chuông mở luồng rồi kéo bè theo max',
      r2: R_GAI,
      hamCuaEmCan: ['max_stream_tow', 'flow_power', 'pull_back', 'tow_grab', 'back', 'move', 'sonic_rail', 'play_note'],
      deBai: 'Khối đá chuông ngầm ở (3, 2) đang chắn trước mũi xuồng R1(2, 2), còn tại (4, 2) có dòng chảy sức 2. Hãy cho R2 (bánh gai Mùa 8) ở (2, 1) gọi sonic_rail() để thẩm âm chuông đá, phát nốt phá vỡ khối đá (3, 2) rồi lùi về (1, 1). R1 chờ 1 nhịp wait(), tiến 1 ô move() vào (3, 2) rồi gọi s = max_stream_tow(1) kéo bè B(6, 2) về bến q(2, 2)!',
      veMaMau: 'R1 chưa gọi s = max_stream_tow(1) sau khi tiến vào (3, 2).',
      san: ['########', '#..=...#', '#~q~~~B#', '########'],
      dong: [{ x: 4, y: 2, huong: 1, suc: 2 }],
      chuongDa: [{ x: 2, y: 1, not: 5, phamVi: 4 }],
      daChuong: [{ x: 3, y: 2, not: 5, ben: 1 }],
      bd: [{ x: 2, y: 2, huong: 1 }, { x: 2, y: 1, huong: 1 }],
      maMau: baiDoi(['wait()', 'move()'], ['sonic_rail()']),
      loiGiai: baiDoi(['wait()', 'move()', 's = max_stream_tow(1)'], ['sonic_rail()']),
      loiSai: [
        { moTa: 'R1 mới tiến vào (3, 2), quên gọi s = max_stream_tow(1) để kéo bè B về q(2, 2)', baiLam: baiDoi(['wait()', 'move()'], ['sonic_rail()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 28, nhip: 5 },
      goiY: ['Ở chương trình R1, sau wait() và move(), gọi thêm s = max_stream_tow(1).']
    }),

    manBS('lap-ben-song', 8, 'van-dung', {
      ten: 'Chế hàm buộc đuôi kéo bè qua khúc cua ghép cầu',
      r2: R_BANH, taoHam: ['tether_calm_run'],
      hamCuaEmCan: ['calm_tug_run', 'tail_over_calm', 'flow_power', 'flip_valve', 'tug_corner', 'tow_to_tail', 'tow_grab', 'tether_grab', 'pair_step', 'tether_drop', 'turn_right', 'turn_left', 'forward', 'move', 'sync_dock_pass', 'wait_n', 'cross_and_pick', 'pick', 'drop'],
      deBai: 'Kênh sông rẽ góc vuông tại (2, 2) nên phải buộc bè vào đuôi xuồng mới qua cua được! Hãy tạo hàm mới tether_calm_run(d, n) cho R1 gồm: gọi calm_tug_run(d, n) (dắt bè theo đuôi qua khúc cua d đi n ô rồi cởi dây) và gọi move() tiến thêm 1 ô nhường mặt cầu. R1 ở (2, 2) gọi tether_calm_run("R", 2) đưa bè B(4, 2) vào q(2, 3) rồi tiến xuống (2, 5); R2 ở (1, 3) gọi sync_dock_pass(6, 2) qua cầu nhặt o(4, 3), quay phải và drop() vào D(3, 4)!',
      veMaMau: 'Định nghĩa hàm tether_calm_run(d, n) và gọi cho R1.',
      san: ['#######', '#=====#', '#~~~B.#', '#.q.o.#', '#.~D..#', '#.~...#', '#######'],
      bd: [{ x: 2, y: 2, huong: 1 }, { x: 1, y: 3, huong: 1 }],
      maMau: baiDoi(['calm_tug_run("R", 2)'], ['sync_dock_pass(6, 2)', 'turn_right()', 'drop()']),
      loiGiai: baiDoi(['tether_calm_run("R", 2)'], ['sync_dock_pass(6, 2)', 'turn_right()', 'drop()'], [H_TETHER_CALM_RUN]),
      loiSai: [
        { moTa: 'R2 quên gọi drop() sau khi quay phải', baiLam: baiDoi(['tether_calm_run("R", 2)'], ['sync_dock_pass(6, 2)', 'turn_right()'], [H_TETHER_CALM_RUN]), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 40, nhip: 11 },
      goiY: ['Tạo hàm tether_calm_run(d, n) gồm 2 dòng: calm_tug_run(d, n) và move(); ở R1 gọi tether_calm_run("R", 2).']
    }),

    manBS('lap-ben-song', 9, 'bien-the', {
      ten: 'Dắt bè qua khúc cua cho nhện vượt sông hút sắt',
      r2: R_NHEN,
      hamCuaEmCan: ['tether_calm_run', 'calm_tug_run', 'tail_over_calm', 'flow_power', 'flip_valve', 'tug_corner', 'tow_to_tail', 'tow_grab', 'tether_grab', 'pair_step', 'tether_drop', 'turn_right', 'turn_left', 'forward', 'move', 'wait_n', 'walk', 'go', 'pull_s', 'pull_deliver'],
      deBai: 'Dùng lại hàm tether_calm_run("R", 2) vừa chế để R1 ở (2, 2) buộc bè B(4, 2) vào đuôi, dắt qua khúc cua xuống ghép cầu phao tại q(2, 3) rồi tiến xuống (2, 5). R2 (nhện Mùa 3) ở bờ Tây (1, 3) gọi wait_n(6) chờ bè ghép xong, gọi walk("RR") bước qua cầu phao sang bờ Đông (3, 3) rồi gọi pull_deliver("D") hút kiện sắt o(3, 3) đưa xuống đích D(3, 4)!',
      veMaMau: 'R2 chưa gọi pull_deliver("D") sau khi bước qua cầu phao.',
      san: ['#######', '#=====#', '#~~~B.#', '#.qo..#', '#.~D..#', '#.~...#', '#######'],
      vatChat: ['.......', '.......', '.......', '...s...', '.......', '.......', '.......'],
      bd: [{ x: 2, y: 2, huong: 1 }, { x: 1, y: 3, huong: 1 }],
      maMau: baiDoi(['tether_calm_run("R", 2)'], ['wait_n(6)', 'walk("RR")']),
      loiGiai: baiDoi(['tether_calm_run("R", 2)'], ['wait_n(6)', 'walk("RR")', 'pull_deliver("D")']),
      loiSai: [
        { moTa: 'R2 bước qua cầu phao nhưng quên gọi pull_deliver("D") để đưa sắt vào D(3, 4)', baiLam: baiDoi(['tether_calm_run("R", 2)'], ['wait_n(6)', 'walk("RR")']), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 38, nhip: 14 },
      goiY: ['Ở chương trình R2, sau wait_n(6) và walk("RR"), gọi thêm pull_deliver("D").']
    }),

    manBS('lap-ben-song', 10, 'trum', {
      ten: 'Bản hợp xướng sóng nước Chấn Hưng',
      r1: R1_LOA, r2: R_GAI, mucTieu: 'choi-dieu',
      dieu: { r1: '5 3 1 3 5 5', r2: '3 1 5 1 3 3' },
      hamCuaEmCan: ['play_part', 'play_note'],
      deBai: 'Khép lại chiến dịch cứu hộ Bến sông, hai robot R1 và R2 cùng hòa tấu khúc ca sóng nước 6 nhịp: R1 phát bè [5, 3, 1, 3, 5, 5], còn R2 phát bè [3, 1, 5, 1, 3, 3]. Hãy gọi play_part([3, 1, 5, 1, 3, 3]) cho R2!',
      veMaMau: 'R2 chưa gọi play_part([3, 1, 5, 1, 3, 3]).',
      san: ['#####', '#...#', '#####'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 3, y: 1, huong: 3 }],
      maMau: baiDoi(['play_part([5, 3, 1, 3, 5, 5])'], ['play_note(3)']),
      loiGiai: baiDoi(['play_part([5, 3, 1, 3, 5, 5])'], ['play_part([3, 1, 5, 1, 3, 3])']),
      loiSai: [
        { moTa: 'R2 chỉ phát 1 nốt nhạc nên thiếu 5 nhịp hòa âm', baiLam: baiDoi(['play_part([5, 3, 1, 3, 5, 5])'], ['play_note(3)']), phaiCoMa: ['lo-nhip'] }
      ],
      sao: { o: 22, nhip: 6 },
      goiY: ['Ở chương trình R2, gọi play_part([3, 1, 5, 1, 3, 3]).']
    })
  ];
})();
