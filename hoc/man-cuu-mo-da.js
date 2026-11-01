/* ============================================================================
   man-cuu-mo-da.js — Mùa 9 (CLB Lập trình) · Gói 7: "Cứu hộ Mỏ đá"
   20 màn (2 chương × 10 màn):
   - Chương 1 (cuu-mo-da): Xe omni máy ném Mùa 7 (R1) phối hợp đồng đội R2
     (xe hai bánh Mùa 1, xe xích Mùa 2, nhện Mùa 3, drone Mùa 6, bánh gai Mùa 8).
     Màn 8 tạo hàm mới quarry_wait_lob; Màn 10 hợp tấu 2 bè (R1 + R2).
   - Chương 2 (lap-mo-da): Ôn sâu danh sách 2 chiều (lưới 2D g = radar(), g[r][c])
     và nhận dạng shape() qua 4 hàm mới: radar_front_lob (.2), radar_side_lob (.4),
     shape_bridge_lob (.6), grid_clear_pass (.8). Màn 10 hợp tấu 2 bè kết gói.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var R1_OMNI = {
    loaiRobot: 'omni',
    omniCheo: true,
    chinhLuc: true,
    nhanDang: true,
    tamNemMacDinh: 2,
    daLapHo: true,
    robot: { than: 'omni', tay: 'nem', camBien: [{ ma: 'radar', o: 'tren', nhanDang: true }] },
    hamGoc: ['left_move', 'right_move', 'left_back', 'right_back', 'slide_left', 'slide_right', 'wait', 'load', 'throw', 'radar', 'diag_left', 'diag_right', 'aim', 'shape']
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

  var R_DRONE = {
    loaiRobot: 'drone',
    robot: { than: 'drone', tay: 'son', camBien: [{ ma: 'camera-4', o: 'tren', taiCho: true }], son: 'lam' },
    hamGoc: ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'ink', 'dot', 'pen_down', 'pen_up', 'color', 'land', 'take_off']
  };

  var R_GAI = {
    loaiRobot: 'gai',
    thuGai: true,
    phatNot: true,
    phanAm: true,
    robot: { than: 'gai', tay: 'loa', camBien: [{ ma: 'am-thanh', o: 'tren', phanAm: true }], son: 'lam' },
    hamGoc: ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'retract_spikes', 'extend_spikes', 'beat', 'note', 'hear', 'listen']
  };

  var H_QUARRY_WAIT_LOB = {
    ten: 'quarry_wait_lob', thamSo: ['w', 'n'],
    than: ['wait_n(w)', 'forward(2)', 'aim_lob(n)']
  };
  var H_RADAR_FRONT_LOB = {
    ten: 'radar_front_lob', thamSo: ['n'],
    than: ['g = radar()', 'if g[0][1] == "V":', '    aim_lob(n)', 'slide_r(1)']
  };
  var H_RADAR_SIDE_LOB = {
    ten: 'radar_side_lob', thamSo: ['n'],
    than: ['g = radar()', 'if g[0][0] == "V":', '    slide_l(1)', 'else:', '    slide_r(1)', 'aim_lob(n)']
  };
  var H_SHAPE_BRIDGE_LOB = {
    ten: 'shape_bridge_lob', thamSo: [],
    than: ['if shape("front") == "round":', '    fill_pit()', '    lob()']
  };
  var H_GRID_CLEAR_PASS = {
    ten: 'grid_clear_pass', thamSo: ['w', 'n'],
    than: ['wait_n(w)', 'for i in range(2):', '    radar_front_lob(n)']
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function baiDoi(r1Chinh, r2Chinh, hamEm, hamMan) {
    return {
      doi: [{ chinh: r1Chinh.slice() }, { chinh: r2Chinh.slice() }],
      hamCuaMan: hamMan ? clone(hamMan) : [],
      hamCuaEmMoi: hamEm ? clone(hamEm) : []
    };
  }

  function manMD(chuong, so, hang, cfg) {
    var r1 = clone(cfg.r1 || R1_OMNI);
    var r2 = clone(cfg.r2 || R_BANH);
    r1.batDau = cfg.bd[0];
    r2.batDau = cfg.bd[1];
    if (cfg.coDinhR1) r1.coDinh = true;
    if (cfg.coDinhR2) r2.coDinh = true;
    var m = {
      chuong: chuong,
      so: so,
      ten: cfg.ten,
      hang: hang,
      vo: 'mo-da',
      loaiRobot: r1.loaiRobot,
      daLapHo: true,
      tamNemMacDinh: 2,
      omniCheo: true,
      chinhLuc: true,
      nhanDang: true,
      robot: clone(r1.robot),
      hamGoc: r1.hamGoc.slice(),
      cauTruc: cfg.cauTruc || ['for', 'if', 'while', 'list'],
      vaHoac: true,
      moXuong: true,
      camHamCuaEm: false,
      bienDem: true,
      nhipTheoLoiGiai: true,
      hamCuaEmCan: cfg.hamCuaEmCan || ['lob', 'aim_lob', 'wait_n', 'forward', 'move'],
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
    if (cfg.vatDang) m.vatDang = cfg.vatDang;
    if (cfg.vatChat) m.vatChat = cfg.vatChat;
    if (cfg.noi) m.noi = cfg.noi;
    if (cfg.dieu) m.dieu = cfg.dieu;
    if (cfg.chuongDa) m.chuongDa = cfg.chuongDa;
    if (cfg.daChuong) m.daChuong = cfg.daChuong;
    return ManHoc.chuanHoa(m);
  }

  ManHoc.manCuuMoDa = [
    /* ========================================================================
       CHUONG 1: cuu-mo-da (10 man)
       ======================================================================== */
    manMD('cuu-mo-da', 1, 'lam-quen', {
      ten: 'Hất đá tròn lấp hố sâu cho xe kho qua mỏ',
      chiChay: true, r2: R_BANH,
      hamCuaEmCan: ['lob', 'wait_n', 'forward', 'move', 'pick', 'drop'],
      deBai: 'Sạt lở làm xuất hiện hố sâu u(3, 2) chắn ngang đường vận chuyển ở Mỏ đá (Mùa 7)! Máy khai mỏ R1 (thân omni + tay ném) ở (1, 2) gọi lob() hất tảng đá tròn o(2, 2) bay 2 ô lấp phẳng hố u(3, 2) thành đường đi. Xe hai bánh R2 (Mùa 1) ở (3, 1) chờ 2 nhịp rồi tiến 2 ô qua hố đã lấp xuống (3, 3), nhặt kiện hàng o(3, 4) và tiến lên đặt vào D(3, 5). Nhấn Chạy để xem!',
      veMaMau: 'Quan sát R1 hất đá tròn lấp hố u(3, 2) mở đường cho R2.',
      san: ['#######', '#..=..#', '#.ou..#', '#=..=.#', '#..o..#', '#..D..#', '#######'].map(function (r, idx) { return idx === 1 ? '#=..=.#' : r; }),
      vatDang: ['.......', '.......', '..r....', '.......', '.......', '.......', '.......'],
      bd: [{ x: 1, y: 2, huong: 1 }, { x: 3, y: 1, huong: 2 }],
      maMau: baiDoi(['lob()'], ['wait_n(2)', 'forward(2)', 'pick()', 'move()', 'drop()']),
      loiGiai: baiDoi(['lob()'], ['wait_n(2)', 'forward(2)', 'pick()', 'move()', 'drop()']),
      sao: { o: 24, nhip: 8 },
      goiY: ['Nhấn Chạy để xem R1 hất đá tròn lấp hố u(3, 2) cho R2 đi qua.']
    }),

    manMD('cuu-mo-da', 2, 'lam-quen', {
      ten: 'Chỉnh lực hất đá xa lấp hố cho xe xích đẩy thùng',
      r2: R_XICH, mucTieu: 'day-thung',
      hamCuaEmCan: ['aim_lob', 'lob', 'wait_n', 'forward', 'move'],
      deBai: 'Hố sâu u(4, 2) nằm cách R1 ở (1, 2) tới 3 ô, chắn đường xe bánh xích R2 (Mùa 2) từ (4, 1) tiến xuống đẩy thùng máy H(4, 4) vào bệ đích D(4, 5)! Hãy cho R1 gọi aim_lob(3) hất viên đá tròn o(2, 2) bay xa 3 ô lấp phẳng hố u(4, 2). R2 ở (4, 1) gọi wait_n(2) chờ lấp hố xong rồi gọi forward(3) tiến qua đẩy H(4, 4) vào D(4, 5)!',
      veMaMau: 'R1 chưa gọi aim_lob(3) để lấp hố u(4, 2) cho R2.',
      san: ['#######', '#=...=#', '#.o.u.#', '#=...=#', '#...H.#', '#...D.#', '#######'],
      vatDang: ['.......', '.......', '..r....', '.......', '.......', '.......', '.......'],
      bd: [{ x: 1, y: 2, huong: 1 }, { x: 4, y: 1, huong: 2 }],
      maMau: baiDoi(['lob()'], ['wait_n(2)', 'forward(3)']),
      loiGiai: baiDoi(['aim_lob(3)'], ['wait_n(2)', 'forward(3)']),
      loiSai: [
        { moTa: 'R1 chỉ dùng lob() tầm 2 nên viên đá rơi xuống (3, 2), hố u(4, 2) chưa được lấp và R2 rơi xuống hố', baiLam: baiDoi(['lob()'], ['wait_n(2)', 'forward(3)']), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 20, nhip: 4 },
      goiY: ['Ở chương trình R1, thay lob() bằng aim_lob(3) để hất đá xa 3 ô tới hố u(4, 2).']
    }),

    manMD('cuu-mo-da', 3, 'luyen', {
      ten: 'Nhện chui gầm đè nút mở cổng cho omni hất quặng',
      r2: R_NHEN,
      hamCuaEmCan: ['wait_n', 'forward', 'move', 'aim_lob', 'lob', 'crawl'],
      deBai: 'Tảng quặng quý o(4, 1) cần được hất vào máng thu D(6, 1), nhưng cổng sắt C(2, 1) đang đóng trước mặt R1(1, 1)! Ở làn dưới, hãy cho nhện R2 (Mùa 3) tại (1, 3) gọi crawl("R") chui qua gầm thấp n(2, 3) tới đứng đè nút M(3, 3) mở cổng C(2, 1) ở cuối nhịp 5. R1 ở (1, 1) gọi wait_n(5), tiến 2 ô forward(2) qua cổng tới (3, 1) rồi gọi aim_lob(3) hất quặng o(4, 1) vào D(6, 1)!',
      veMaMau: 'R1 chưa chờ 5 nhịp rồi tiến qua cổng hất quặng vào D(6, 1).',
      san: ['########', '#.C.o.D#', '########', '#.nM...#', '########'],
      vatDang: ['........', '....q...', '........', '........', '........'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 3, huong: 1 }],
      maMau: baiDoi(['wait_n(5)', 'forward(2)'], ['crawl("R")']),
      loiGiai: baiDoi(['wait_n(5)', 'forward(2)', 'aim_lob(3)'], ['crawl("R")']),
      loiSai: [
        { moTa: 'R1 tiến qua cổng tới (3, 1) nhưng quên gọi aim_lob(3) để hất quặng vào D(6, 1)', baiLam: baiDoi(['wait_n(5)', 'forward(2)'], ['crawl("R")']), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 28, nhip: 9 },
      goiY: ['Ở chương trình R1, sau wait_n(5) và forward(2), gọi thêm aim_lob(3).']
    }),

    manMD('cuu-mo-da', 4, 'luyen', {
      ten: 'Đi chéo lấp hố sâu mở lối cho xe kho',
      r2: R_BANH,
      hamCuaEmCan: ['sort_lob', 'aim_lob', 'lob', 'wait_n', 'forward', 'move', 'pick', 'drop'],
      deBai: 'Hố sâu u(2, 1) đang chắn ngang đường xe kho R2 đi lấy kiện hàng o(4, 1) đưa về D(5, 1). Hãy cho R1 ở (1, 4) hướng Bắc gọi diag_right() lách chéo lên (2, 3) đối diện tảng đá tròn o(2, 2), rồi gọi sort_lob() để tự nhận dạng đá tròn và hất 2 ô lấp phẳng hố u(2, 1)! R2 ở (1, 1) gọi wait_n(3) chờ lấp hố xong, gọi forward(2) qua (2, 1) tới (3, 1), pick() nhặt o(4, 1), move() sang (4, 1) và drop() vào D(5, 1)!',
      veMaMau: 'R1 gọi diag_right() và sort_lob(); R2 chờ lấp hố rồi nhặt hàng đưa vào D(5, 1).',
      san: ['#######', '#.u.oD#', '#.o...#', '#.....#', '#.....#', '#######'],
      vatDang: ['.......', '.......', '..r....', '.......', '.......', '.......'],
      bd: [{ x: 1, y: 4, huong: 0 }, { x: 1, y: 1, huong: 1 }],
      maMau: baiDoi(['diag_right()'], ['wait_n(3)', 'forward(2)', 'pick()', 'move()', 'drop()']),
      loiGiai: baiDoi(['diag_right()', 'sort_lob()'], ['wait_n(3)', 'forward(2)', 'pick()', 'move()', 'drop()']),
      loiSai: [
        { moTa: 'R1 mới đi chéo lên (2, 3) mà chưa gọi sort_lob() hất đá lấp hố u(2, 1)', baiLam: baiDoi(['diag_right()'], ['wait_n(3)', 'forward(2)', 'pick()', 'move()', 'drop()']), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 28, nhip: 8 },
      goiY: ['Ở chương trình R1, thêm sort_lob() sau diag_right().']
    }),

    manMD('cuu-mo-da', 5, 'cung-co', {
      ten: 'Bánh gai phá đá chuông mở đường ném quặng',
      r2: R_GAI,
      hamCuaEmCan: ['wait_n', 'move', 'aim_lob', 'lob', 'play_note'],
      deBai: 'Trên đường hất quặng của R1, ô (2, 1) đang bị tảng đá chuông nốt 3 chắn kín trước viên quặng o(3, 1)! Hãy cho R2 (bánh gai Mùa 8) ở (2, 2) cạnh chuông đá (3, 2) gọi play_note(listen()) phá vỡ tảng đá chuông tại (2, 1) ngay nhịp 1. R1 ở (1, 1) hướng Đông gọi wait(), tiến 1 ô move() vào (2, 1) rồi gọi aim_lob(3) hất viên quặng o(3, 1) vào máng D(5, 1)!',
      veMaMau: 'R1 chưa chờ phá đá chuông rồi tiến lên hất quặng vào D(5, 1).',
      san: ['#######', '#..o.D#', '#.....#', '#######'],
      vatDang: ['.......', '...q...', '.......', '.......'],
      chuongDa: [{ x: 3, y: 2, not: 3, phamVi: 3 }],
      daChuong: [{ x: 2, y: 1, not: 3, ben: 1 }],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 2, huong: 1 }],
      maMau: baiDoi(['wait()'], ['play_note(listen())']),
      loiGiai: baiDoi(['wait()', 'move()', 'aim_lob(3)'], ['play_note(listen())']),
      loiSai: [
        { moTa: 'R1 chỉ chờ mà chưa tiến vào (2, 1) và gọi aim_lob(3)', baiLam: baiDoi(['wait()'], ['play_note(listen())']), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 22, nhip: 4 },
      goiY: ['Ở chương trình R1, sau wait() hãy gọi move() và aim_lob(3).']
    }),

    manMD('cuu-mo-da', 6, 'cung-co', {
      ten: 'Lấp hai hố sâu liên tiếp mở đường cho nhện hút sắt',
      r2: R_NHEN,
      hamCuaEmCan: ['fill_pit', 'lob', 'forward', 'move', 'wait_n', 'walk', 'go', 'pull_s', 'pull_deliver'],
      deBai: 'Trước mặt R1 ở (1, 1) có viên đá tròn o(2, 1) và hố sâu u(3, 1), tiếp theo là viên đá tròn thứ hai o(4, 1) và hố sâu u(5, 1) chắn lối của nhện R2! Hãy cho R1 gọi fill_pit() (hất o(2, 1) lấp hố u(3, 1) rồi tiến 2 ô lên (3, 1)) và gọi lob() hất viên đá o(4, 1) lấp nốt hố u(5, 1) (tổng cộng 6 nhịp). R2 ở (5, 0) gọi wait_n(6), walk("DD") qua hố đã lấp (5, 1) xuống (5, 2) rồi gọi pull_deliver("R") đưa sắt o(5, 2) vào D(6, 2)!',
      veMaMau: 'R1 gọi fill_pit() và lob(); R2 chờ 6 nhịp rồi đi qua (5, 1) hút sắt đưa vào D(6, 2).',
      san: ['#####.##', '#.ouou.#', '####.oD#', '########'],
      vatDang: ['........', '..r.r...', '........', '........'],
      vatChat: ['........', '........', '.....s..', '........'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 5, y: 0, huong: 2 }],
      maMau: baiDoi(['fill_pit()'], ['wait_n(6)', 'walk("DD")', 'pull_deliver("R")']),
      loiGiai: baiDoi(['fill_pit()', 'lob()'], ['wait_n(6)', 'walk("DD")', 'pull_deliver("R")']),
      loiSai: [
        { moTa: 'R1 mới lấp hố u(3, 1) mà quên gọi lob() để lấp hố u(5, 1) cho R2 đi qua', baiLam: baiDoi(['fill_pit()'], ['wait_n(6)', 'walk("DD")', 'pull_deliver("R")']), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 30, nhip: 12 },
      goiY: ['Ở chương trình R1, sau fill_pit() hãy gọi thêm lob() để hất o(4, 1) lấp hố u(5, 1).']
    }),

    manMD('cuu-mo-da', 7, 'van-dung', {
      ten: 'Xe xích bắn van mở cửa hầm cho omni lấp hố đẩy đá',
      r2: R_XICH,
      hamCuaEmCan: ['wait_n', 'move', 'fill_pit', 'lob', 'forward', 'squirt'],
      deBai: 'Cửa hầm mỏ C(2, 1) nối với nút van nước N(4, 3). Hãy cho xe xích R2 ở (2, 3) hướng Đông gọi squirt("low") bắn tia nước mở cửa C(2, 1) ngay nhịp 1. R1 ở (1, 1) gọi wait(), move() tiến vào (2, 1), gọi fill_pit() hất đá tròn o(3, 1) lấp hố u(4, 1) rồi tiến lên (4, 1), cuối cùng gọi lob() hất viên đá o(5, 1) vào đích D(6, 1)!',
      veMaMau: 'R1 chưa gọi fill_pit() và lob() sau khi qua cửa C(2, 1).',
      san: ['########', '#.CouoD#', '########', '#...N..#', '########'],
      vatDang: ['........', '...r.r..', '........', '........', '........'],
      noi: [{ nut: { x: 4, y: 3 }, cua: [{ x: 2, y: 1 }] }],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 3, huong: 1 }],
      maMau: baiDoi(['wait()', 'move()'], ['squirt("low")']),
      loiGiai: baiDoi(['wait()', 'move()', 'fill_pit()', 'lob()'], ['squirt("low")']),
      loiSai: [
        { moTa: 'R1 mới bước vào cửa C(2, 1) mà chưa gọi fill_pit() và lob()', baiLam: baiDoi(['wait()', 'move()'], ['squirt("low")']), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 28, nhip: 8 },
      goiY: ['Ở chương trình R1, sau wait() và move(), gọi thêm fill_pit() rồi lob().']
    }),

    manMD('cuu-mo-da', 8, 'van-dung', {
      ten: 'Chế hàm chờ mở cổng rồi tiến qua hất quặng',
      r2: R_NHEN, taoHam: ['quarry_wait_lob'],
      hamCuaEmCan: ['wait_n', 'forward', 'move', 'aim_lob', 'lob', 'walk', 'go'],
      deBai: 'Hãy tạo hàm mới quarry_wait_lob(w, n) cho R1 gồm 3 dòng: wait_n(w), forward(2), aim_lob(n). Ở làn dưới, nhện R2 tại (1, 3) gọi walk("RR") bước 2 ô tới đứng đè nút M(3, 3) mở cổng C(2, 1) sau 4 nhịp; R1 ở (1, 1) gọi quarry_wait_lob(4, 3) để chờ 4 nhịp, tiến 2 ô qua cổng tới (3, 1) và hất viên quặng o(4, 1) xa 3 ô vào máng D(6, 1)!',
      veMaMau: 'Định nghĩa hàm quarry_wait_lob(w, n) và gọi cho R1.',
      san: ['########', '#.C.o.D#', '########', '#..M...#', '########'],
      vatDang: ['........', '....q...', '........', '........', '........'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 3, huong: 1 }],
      maMau: baiDoi(['forward(2)', 'aim_lob(3)'], ['walk("RR")']),
      loiGiai: baiDoi(['quarry_wait_lob(4, 3)'], ['walk("RR")'], [H_QUARRY_WAIT_LOB]),
      loiSai: [
        { moTa: 'R1 không chờ 4 nhịp nên đâm vào cổng C(2, 1) khi chưa mở', baiLam: baiDoi(['quarry_wait_lob(0, 3)'], ['walk("RR")'], [H_QUARRY_WAIT_LOB]), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      sao: { o: 28, nhip: 8 },
      goiY: ['Tạo hàm quarry_wait_lob(w, n) gồm: wait_n(w), forward(2), aim_lob(n); ở R1 gọi quarry_wait_lob(4, 3).']
    }),

    manMD('cuu-mo-da', 9, 'bien-the', {
      ten: 'Phá đá chuông trên nút cổng cho hàm quarry_wait_lob',
      r2: R_GAI,
      hamCuaEmCan: ['quarry_wait_lob', 'wait_n', 'forward', 'move', 'aim_lob', 'lob', 'play_note'],
      deBai: 'Dùng lại hàm quarry_wait_lob(w, n) vừa chế! Ở làn dưới, nút đè M(3, 3) mở cổng C(2, 1) đang bị tảng đá chuông nốt 5 che khuất. Hãy cho R2 (bánh gai Mùa 8) ở (2, 3) hướng Đông gọi play_note(listen()) phá đá chuông rồi gọi move() bước lên đè nút M(3, 3) (mất 2 nhịp). R1 ở (1, 1) gọi quarry_wait_lob(2, 2) chờ 2 nhịp, tiến qua cổng tới (3, 1) và hất viên đá o(4, 1) vào D(5, 1)!',
      veMaMau: 'R2 phá đá chuông và bước lên nút M(3, 3); R1 gọi quarry_wait_lob(2, 2).',
      san: ['#######', '#.C.oD#', '#######', '#..M..#', '#######'],
      chuongDa: [{ x: 2, y: 3, not: 5, phamVi: 3 }],
      daChuong: [{ x: 3, y: 3, not: 5, ben: 1 }],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 3, huong: 1 }],
      maMau: baiDoi(['quarry_wait_lob(2, 2)'], ['play_note(listen())']),
      loiGiai: baiDoi(['quarry_wait_lob(2, 2)'], ['play_note(listen())', 'move()']),
      loiSai: [
        { moTa: 'R2 phá đá chuông ở (3, 3) nhưng quên gọi move() tiến lên đè nút M(3, 3)', baiLam: baiDoi(['quarry_wait_lob(2, 2)'], ['play_note(listen())']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      sao: { o: 28, nhip: 6 },
      goiY: ['Ở chương trình R2, sau play_note(listen()) hãy gọi thêm move().']
    }),

    manMD('cuu-mo-da', 10, 'trum', {
      ten: 'Tiếng vọng đại ngàn mỏ đá Chấn Hưng',
      r1: R1_LOA, r2: R_GAI, mucTieu: 'choi-dieu',
      dieu: { r1: '5 3 5 8', r2: '1 5 3 5' },
      hamCuaEmCan: ['play_part', 'play_note'],
      deBai: 'Tuyến đường mỏ đá đã thông suốt! Dàn nhạc robot R1 và R2 cùng hòa tấu bản nhạc "Tiếng vọng đại ngàn" gồm 4 nhịp 2 bè: R1 tấu bè [5, 3, 5, 8], còn R2 tấu bè [1, 5, 3, 5]. Hãy gọi play_part([1, 5, 3, 5]) cho R2!',
      veMaMau: 'R2 chưa gọi play_part([1, 5, 3, 5]).',
      san: ['#####', '#...#', '#####'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 3, y: 1, huong: 3 }],
      maMau: baiDoi(['play_part([5, 3, 5, 8])'], ['play_note(1)']),
      loiGiai: baiDoi(['play_part([5, 3, 5, 8])'], ['play_part([1, 5, 3, 5])']),
      loiSai: [
        { moTa: 'R2 chỉ phát 1 nốt đầu nên thiếu 3 nhịp hòa âm', baiLam: baiDoi(['play_part([5, 3, 5, 8])'], ['play_note(1)']), phaiCoMa: ['lo-nhip'] }
      ],
      sao: { o: 18, nhip: 4 },
      goiY: ['Ở chương trình R2, gọi play_part([1, 5, 3, 5]).']
    }),

    /* ========================================================================
       CHUONG 2: lap-mo-da (10 man)
       ======================================================================== */
    manMD('lap-mo-da', 1, 'lam-quen', {
      ten: 'Quét lưới 2D radar tìm đá lấp hố cho xe kho',
      chiChay: true, r2: R_BANH,
      hamCuaEmCan: ['slide_r', 'lob', 'wait_n', 'forward', 'move', 'pick', 'drop'],
      deBai: 'Sang Chương 2, đội cứu hộ ôn sâu về danh sách 2 chiều (lưới 2D g = radar(), truy cập g[r][c]) và nhận dạng shape() của Mùa 7! Ở màn làm mẫu này, R1 tại (1, 3) hướng Bắc gọi g = radar() quét lưới 3x3 quanh xe: thấy ô chéo trước-phải g[0][2] == "V" có tảng đá tròn o(2, 2), R1 trượt phải slide_r(1) sang (2, 3) rồi gọi lob() hất đá lấp hố u(2, 1) mở đường cho R2 đi qua! Nhấn Chạy để xem!',
      veMaMau: 'Quan sát R1 đọc lưới 2D g = radar() tại g[0][2] rồi trượt sang hất đá lấp hố.',
      san: ['#######', '#.u.oD#', '#.o...#', '#...==#', '#######'],
      vatDang: ['.......', '.......', '..r....', '.......', '.......'],
      bd: [{ x: 1, y: 3, huong: 0 }, { x: 1, y: 1, huong: 1 }],
      maMau: baiDoi(['g = radar()', 'if g[0][2] == "V":', '    slide_r(1)', 'lob()'], ['wait_n(3)', 'forward(2)', 'pick()', 'move()', 'drop()']),
      loiGiai: baiDoi(['g = radar()', 'if g[0][2] == "V":', '    slide_r(1)', 'lob()'], ['wait_n(3)', 'forward(2)', 'pick()', 'move()', 'drop()']),
      sao: { o: 24, nhip: 8 },
      goiY: ['Nhấn Chạy để xem R1 đọc g[0][2] == "V" trên lưới 2D radar() và lấp hố cho R2.']
    }),

    manMD('lap-mo-da', 2, 'lam-quen', {
      ten: 'Chế hàm quét ô trước mũi g[0][1] để hất đá và trượt ngang',
      r2: R_XICH, mucTieu: 'day-thung', taoHam: ['radar_front_lob'],
      hamCuaEmCan: ['aim_lob', 'lob', 'slide_r', 'wait_n', 'forward', 'move'],
      deBai: 'Trong lưới 3x3 trả về từ g = radar(), phần tử g[0][1] là ô ngay trước mũi xe! Hãy tạo hàm mới radar_front_lob(n) cho R1 gồm: g = radar(), nếu g[0][1] == "V" thì gọi aim_lob(n), sau đó (ngoài if) gọi slide_r(1) trượt phải 1 cột. R1 ở (2, 3) hướng Bắc gọi radar_front_lob(2) để hất đá tròn o(2, 2) lấp hố u(2, 1) rồi trượt sang (3, 3); xe xích R2 ở (1, 1) gọi wait_n(2) rồi forward(3) qua hố đã lấp đẩy thùng H(3, 1) vào D(4, 1)!',
      veMaMau: 'Định nghĩa hàm radar_front_lob(n) kiểm tra g[0][1] == "V".',
      san: ['######', '#.uHD#', '#.o..#', '#....#', '######'],
      vatDang: ['......', '......', '..r...', '......', '......'],
      bd: [{ x: 2, y: 3, huong: 0 }, { x: 1, y: 1, huong: 1 }],
      maMau: baiDoi(['slide_r(1)'], ['wait_n(2)', 'forward(3)']),
      loiGiai: baiDoi(['radar_front_lob(2)'], ['wait_n(2)', 'forward(3)'], [H_RADAR_FRONT_LOB]),
      loiSai: [
        { moTa: 'R1 chỉ trượt phải mà không kiểm tra g[0][1] == "V" để hất đá lấp hố u(2, 1)', baiLam: baiDoi(['slide_r(1)'], ['wait_n(2)', 'forward(3)']), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 28, nhip: 5 },
      goiY: ['Tạo hàm radar_front_lob(n) gồm: g = radar(), if g[0][1] == "V": aim_lob(n), và slide_r(1); ở R1 gọi radar_front_lob(2).']
    }),

    manMD('lap-mo-da', 3, 'luyen', {
      ten: 'Lặp quét dọc vách đá bằng hàm radar_front_lob',
      r2: R_NHEN,
      hamCuaEmCan: ['radar_front_lob', 'aim_lob', 'lob', 'slide_r', 'wait_n', 'walk', 'go', 'pull_s', 'pull_deliver'],
      deBai: 'Dùng lại hàm radar_front_lob(n) vừa chế! Trên 2 cột 2 và 3, tại (2, 2) có viên đá tròn cần hất lấp hố u(2, 1) mở đường cho nhện R2, và tại (3, 2) có viên quặng cần hất vào máng D(3, 1). Hãy cho R1 ở (2, 3) hướng Bắc lặp for i in range(2): gọi radar_front_lob(2)! Nhện R2 ở (1, 1) gọi wait_n(2) chờ hố u(2, 1) được lấp, gọi walk("RRRR") băng qua tới (5, 1) rồi gọi pull_deliver("R") đưa sắt o(5, 1) vào D(6, 1)!',
      veMaMau: 'R1 lặp 2 lần gọi radar_front_lob(2); R2 qua hố đã lấp hút sắt vào D(6, 1).',
      san: ['########', '#.uD.oD#', '#.oo...#', '#......#', '########'],
      vatDang: ['........', '........', '..rq....', '........', '........'],
      vatChat: ['........', '.....s..', '........', '........', '........'],
      bd: [{ x: 2, y: 3, huong: 0 }, { x: 1, y: 1, huong: 1 }],
      maMau: baiDoi(['for i in range(2):', '    radar_front_lob(2)'], ['wait_n(2)', 'walk("RRRR")']),
      loiGiai: baiDoi(['for i in range(2):', '    radar_front_lob(2)'], ['wait_n(2)', 'walk("RRRR")', 'pull_deliver("R")']),
      loiSai: [
        { moTa: 'R2 băng qua tới (5, 1) nhưng quên gọi pull_deliver("R") để đưa sắt vào D(6, 1)', baiLam: baiDoi(['for i in range(2):', '    radar_front_lob(2)'], ['wait_n(2)', 'walk("RRRR")']), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 34, nhip: 9 },
      goiY: ['Ở chương trình R2, sau wait_n(2) và walk("RRRR"), gọi thêm pull_deliver("R").']
    }),

    manMD('lap-mo-da', 4, 'luyen', {
      ten: 'Chế hàm dò hai góc chéo g[0][0] và g[0][2] trên lưới radar',
      r2: R_BANH, taoHam: ['radar_side_lob'],
      hamCuaEmCan: ['slide_l', 'slide_r', 'aim_lob', 'lob', 'wait_n', 'forward', 'move', 'pick', 'drop'],
      deBai: 'Khi viên đá nằm lệch ở góc chéo trước-trái g[0][0] hoặc trước-phải g[0][2], hãy tạo hàm mới radar_side_lob(n) cho R1: đọc g = radar(), nếu g[0][0] == "V" thì gọi slide_l(1), ngược lại (else:) gọi slide_r(1), cuối cùng ngoài if/else gọi aim_lob(n)! R1 ở (2, 3) hướng Bắc gọi radar_side_lob(2) để trượt sang cột có đá o(3, 2) và hất lấp hố u(3, 1); R2 ở (2, 1) gọi wait_n(3), forward(2) qua hố đã lấp tới (4, 1), pick() nhặt o(5, 1), move() và drop() vào D(6, 1)!',
      veMaMau: 'Định nghĩa hàm radar_side_lob(n) kiểm tra g[0][0] == "V".',
      san: ['########', '#..u.oD#', '#..o...#', '#......#', '########'],
      vatDang: ['........', '........', '...r....', '........', '........'],
      bd: [{ x: 2, y: 3, huong: 0 }, { x: 2, y: 1, huong: 1 }],
      maMau: baiDoi(['slide_r(1)'], ['wait_n(3)', 'forward(2)', 'pick()', 'move()', 'drop()']),
      loiGiai: baiDoi(['radar_side_lob(2)'], ['wait_n(3)', 'forward(2)', 'pick()', 'move()', 'drop()'], [H_RADAR_SIDE_LOB]),
      loiSai: [
        { moTa: 'R1 mới trượt phải mà chưa gọi aim_lob(2) để lấp hố u(3, 1)', baiLam: baiDoi(['slide_r(1)'], ['wait_n(3)', 'forward(2)', 'pick()', 'move()', 'drop()'], [H_RADAR_SIDE_LOB]), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 34, nhip: 8 },
      goiY: ['Tạo hàm radar_side_lob(n) gồm: g = radar(), if g[0][0] == "V": slide_l(1), else: slide_r(1), rồi aim_lob(n); ở R1 gọi radar_side_lob(2).']
    }),

    manMD('lap-mo-da', 5, 'cung-co', {
      ten: 'Dò góc chéo bằng radar_side_lob kết hợp bánh gai phá đá chuông',
      r2: R_GAI,
      hamCuaEmCan: ['radar_side_lob', 'slide_l', 'slide_r', 'aim_lob', 'lob', 'play_note'],
      deBai: 'Viên quặng o(1, 2) nằm ở góc chéo trước-trái g[0][0] của R1 (đang đứng ở (2, 3) hướng Bắc), nhưng ô (1, 3) bên trái R1 đang bị tảng đá chuông nốt 4 chắn không cho trượt sang! Hãy cho R2 (bánh gai Mùa 8) ở (1, 4) hướng Bắc gọi play_note(listen()) phá đá chuông tại (1, 3) ngay nhịp 1; R1 ở (2, 3) gọi wait() chờ 1 nhịp rồi gọi radar_side_lob(2) trượt sang (1, 3) và hất quặng o(1, 2) vào D(1, 1)!',
      veMaMau: 'R1 gọi wait() và radar_side_lob(2); R2 gọi play_note(listen()) phá đá chuông tại (1, 3).',
      san: ['######', '#D...#', '#o...#', '#....#', '#....#', '######'],
      vatDang: ['......', '......', '.q....', '......', '......', '......'],
      chuongDa: [{ x: 2, y: 4, not: 4, phamVi: 3 }],
      daChuong: [{ x: 1, y: 3, not: 4, ben: 1 }],
      bd: [{ x: 2, y: 3, huong: 0 }, { x: 1, y: 4, huong: 0 }],
      maMau: baiDoi(['wait()', 'radar_side_lob(2)'], []),
      loiGiai: baiDoi(['wait()', 'radar_side_lob(2)'], ['play_note(listen())']),
      loiSai: [
        { moTa: 'R2 chưa gọi play_note(listen()) phá đá chuông tại (1, 3) nên R1 không trượt trái sang cột 1 được', baiLam: baiDoi(['wait()', 'radar_side_lob(2)'], []), phaiCoMa: ['dam-tuong', 'nap-hut', 'chua-dua-vat'] }
      ],
      sao: { o: 24, nhip: 4 },
      goiY: ['Ở chương trình R2, gọi play_note(listen()) để phá tảng đá chuông tại (1, 3).']
    }),

    manMD('lap-mo-da', 6, 'cung-co', {
      ten: 'Chế hàm kiểm tra đá tròn lấp hố rồi hất tiếp',
      r2: R_XICH, mucTieu: 'day-thung', taoHam: ['shape_bridge_lob'],
      hamCuaEmCan: ['fill_pit', 'lob', 'forward', 'move', 'wait_n'],
      deBai: 'Chỉ có đá tròn ("round") mới lấp được hố sâu u! Hãy tạo hàm mới shape_bridge_lob() (không tham số) cho R1: kiểm tra if shape("front") == "round": bên trong gọi fill_pit() (hất đá tròn lấp hố rồi tiến 2 ô lên hố đã lấp) và gọi lob() hất viên đá kế tiếp lên đè nút M! R1 ở (1, 1) hướng Đông gọi shape_bridge_lob() lấp hố u(3, 1) và hất o(4, 1) đè nút M(5, 1) mở cửa C(2, 3); xe xích R2 ở (1, 3) gọi wait_n(6) rồi forward(3) qua cửa đẩy thùng H(3, 3) vào D(4, 3)!',
      veMaMau: 'Định nghĩa hàm shape_bridge_lob() kiểm tra shape("front") == "round".',
      san: ['#######', '#.ouoM#', '#######', '#.CHD.#', '#######'],
      vatDang: ['.......', '..r.r..', '.......', '.......', '.......'],
      noi: [{ nut: { x: 5, y: 1 }, cua: [{ x: 2, y: 3 }] }],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 3, huong: 1 }],
      maMau: baiDoi(['fill_pit()'], ['wait_n(6)', 'forward(3)']),
      loiGiai: baiDoi(['shape_bridge_lob()'], ['wait_n(6)', 'forward(3)'], [H_SHAPE_BRIDGE_LOB]),
      loiSai: [
        { moTa: 'R1 mới lấp hố mà chưa gọi lob() hất viên đá thứ hai lên nút M(5, 1) nên cửa C(2, 3) đóng chặt', baiLam: baiDoi(['fill_pit()'], ['wait_n(6)', 'forward(3)'], [H_SHAPE_BRIDGE_LOB]), phaiCoMa: ['dam-tuong', 'chua-day-thung'] }
      ],
      sao: { o: 28, nhip: 9 },
      goiY: ['Tạo hàm shape_bridge_lob() gồm: if shape("front") == "round": bên trong gọi fill_pit() và lob(); ở R1 gọi shape_bridge_lob().']
    }),

    manMD('lap-mo-da', 7, 'van-dung', {
      ten: 'Xe xích bắn van mở cửa cho hàm shape_bridge_lob',
      r2: R_XICH,
      hamCuaEmCan: ['shape_bridge_lob', 'fill_pit', 'lob', 'forward', 'move', 'squirt'],
      deBai: 'Dùng lại hàm shape_bridge_lob() vừa chế! Cửa hầm C(2, 1) trước mặt R1(1, 1) được nối với nút van N(4, 3). Hãy cho xe xích R2 ở (2, 3) hướng Đông gọi squirt("low") bắn van N(4, 3) mở cửa C(2, 1) ngay nhịp 1; R1 ở (1, 1) gọi wait(), move() tiến vào (2, 1) rồi gọi shape_bridge_lob() để kiểm tra đá tròn o(3, 1), lấp hố u(4, 1) và hất viên đá thứ hai o(5, 1) vào đích D(6, 1)!',
      veMaMau: 'R1 gọi wait(), move(), shape_bridge_lob(); R2 gọi squirt("low").',
      san: ['########', '#.CouoD#', '########', '#...N..#', '########'],
      vatDang: ['........', '...r.r..', '........', '........', '........'],
      noi: [{ nut: { x: 4, y: 3 }, cua: [{ x: 2, y: 1 }] }],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 3, huong: 1 }],
      maMau: baiDoi(['wait()', 'move()'], ['squirt("low")']),
      loiGiai: baiDoi(['wait()', 'move()', 'shape_bridge_lob()'], ['squirt("low")']),
      loiSai: [
        { moTa: 'R1 bước vào (2, 1) nhưng quên gọi shape_bridge_lob()', baiLam: baiDoi(['wait()', 'move()'], ['squirt("low")']), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 28, nhip: 8 },
      goiY: ['Ở chương trình R1, sau wait() và move(), gọi thêm shape_bridge_lob().']
    }),

    manMD('lap-mo-da', 8, 'van-dung', {
      ten: 'Chế hàm chờ đồng đội rồi quét lưới 2 cột liên tiếp',
      r2: R_BANH, taoHam: ['grid_clear_pass'],
      hamCuaEmCan: ['wait_n', 'radar_front_lob', 'aim_lob', 'lob', 'slide_r', 'forward', 'move'],
      deBai: 'R1 đang đứng ở (1, 3) hướng Bắc cần quét 2 cột liên tiếp (cột 1 trống và cột 2 có quặng o(2, 2)) để trượt qua cổng C(2, 3) sang (2, 3) rồi hất quặng vào đích D(2, 1)! Hãy tạo hàm mới grid_clear_pass(w, n) cho R1 gồm: wait_n(w), lặp for i in range(2): gọi radar_front_lob(n). R2 ở (4, 3) hướng Đông gọi move() tiến lên đứng đè nút M(5, 3) mở cổng C(2, 3) ở cuối nhịp 1; R1 ở (1, 3) gọi grid_clear_pass(1, 2)!',
      veMaMau: 'Định nghĩa hàm grid_clear_pass(w, n) và gọi cho R1.',
      san: ['#######', '##D####', '#.o...#', '#.C..M#', '#######'],
      vatDang: ['.......', '.......', '..q....', '.......', '.......'],
      noi: [{ nut: { x: 5, y: 3 }, cua: [{ x: 2, y: 3 }] }],
      bd: [{ x: 1, y: 3, huong: 0 }, { x: 4, y: 3, huong: 1 }],
      maMau: baiDoi(['for i in range(2):', '    radar_front_lob(2)'], ['move()']),
      loiGiai: baiDoi(['grid_clear_pass(1, 2)'], ['move()'], [H_GRID_CLEAR_PASS]),
      loiSai: [
        { moTa: 'R1 không chờ 1 nhịp nên trượt phải đâm vào cổng C(2, 3) khi chưa kịp mở', baiLam: baiDoi(['grid_clear_pass(0, 2)'], ['move()'], [H_GRID_CLEAR_PASS]), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      sao: { o: 36, nhip: 5 },
      goiY: ['Tạo hàm grid_clear_pass(w, n) gồm: wait_n(w), for i in range(2): radar_front_lob(n); ở R1 gọi grid_clear_pass(1, 2).']
    }),

    manMD('lap-mo-da', 9, 'bien-the', {
      ten: 'Nhện chui gầm giữ cổng cho hàm grid_clear_pass',
      r2: R_NHEN,
      hamCuaEmCan: ['grid_clear_pass', 'wait_n', 'radar_front_lob', 'aim_lob', 'lob', 'slide_r', 'crawl'],
      deBai: 'Dùng lại hàm grid_clear_pass(w, n) vừa chế! Cổng C(2, 3) trên đường trượt ngang của R1 được nối với nút đè M(6, 3) sau gầm thấp n(5, 3). Hãy cho nhện R2 ở (4, 3) gọi crawl("R") chui qua gầm thấp n(5, 3) tới đứng đè nút M(6, 3) mở cổng C(2, 3) ở cuối nhịp 5; R1 ở (1, 3) hướng Bắc gọi grid_clear_pass(5, 2) để chờ 5 nhịp rồi quét 2 cột liên tiếp, trượt qua cổng sang (2, 3) và hất quặng o(2, 2) vào đích D(2, 1)!',
      veMaMau: 'R1 gọi grid_clear_pass(5, 2); R2 gọi crawl("R") mở cổng C(2, 3).',
      san: ['########', '##D#####', '#.o....#', '#.C..nM#', '########'],
      vatDang: ['........', '........', '..q.....', '........', '........'],
      noi: [{ nut: { x: 6, y: 3 }, cua: [{ x: 2, y: 3 }] }],
      bd: [{ x: 1, y: 3, huong: 0 }, { x: 4, y: 3, huong: 1 }],
      maMau: baiDoi(['grid_clear_pass(5, 2)'], []),
      loiGiai: baiDoi(['grid_clear_pass(5, 2)'], ['crawl("R")']),
      loiSai: [
        { moTa: 'R2 chưa gọi crawl("R") để đè nút M(6, 3) mở cổng C(2, 3)', baiLam: baiDoi(['grid_clear_pass(5, 2)'], []), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      sao: { o: 32, nhip: 9 },
      goiY: ['Ở chương trình R2, gọi crawl("R") để chui qua gầm thấp n(5, 3) tới đè nút M(6, 3).']
    }),

    manMD('lap-mo-da', 10, 'trum', {
      ten: 'Khúc khải hoàn mỏ đá kim cương',
      r1: R1_LOA, r2: R_GAI, mucTieu: 'choi-dieu',
      dieu: { r1: '1 5 3 8 5 8', r2: '3 1 5 3 1 5' },
      hamCuaEmCan: ['play_part', 'play_note'],
      deBai: 'Khép lại toàn bộ chiến dịch cứu hộ Mỏ đá, những mẻ quặng quý đã về kho an toàn! Hai robot R1 và R2 cùng hòa tấu khúc khải hoàn 6 nhịp: R1 chơi bè [1, 5, 3, 8, 5, 8], còn R2 chơi bè [3, 1, 5, 3, 1, 5]. Hãy gọi play_part([3, 1, 5, 3, 1, 5]) cho R2!',
      veMaMau: 'R2 chưa gọi play_part([3, 1, 5, 3, 1, 5]).',
      san: ['#####', '#...#', '#####'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 3, y: 1, huong: 3 }],
      maMau: baiDoi(['play_part([1, 5, 3, 8, 5, 8])'], ['play_note(3)']),
      loiGiai: baiDoi(['play_part([1, 5, 3, 8, 5, 8])'], ['play_part([3, 1, 5, 3, 1, 5])']),
      loiSai: [
        { moTa: 'R2 chỉ phát 1 nốt nhạc nên thiếu 5 nhịp hòa âm', baiLam: baiDoi(['play_part([1, 5, 3, 8, 5, 8])'], ['play_note(3)']), phaiCoMa: ['lo-nhip'] }
      ],
      sao: { o: 22, nhip: 6 },
      goiY: ['Ở chương trình R2, gọi play_part([3, 1, 5, 3, 1, 5]).']
    })
  ];
})();
