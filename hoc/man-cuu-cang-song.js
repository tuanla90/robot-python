/* ============================================================================
   man-cuu-cang-song.js - Mùa 9 CLB Sáng Tạo: Gói 4 "Cứu hộ Cảng sông"
   20 màn (10 màn cuu-cang-song + 10 màn lap-cang-song):
   - R1 (.1..9): Cần cẩu Cảng sông Mùa 4 (than: 'cau', tay: 'moc-cau', camBien: quet-ma)
   - R2: Robot các mùa khác đến chi viện (nhen, banh, xich, omni, gai)
   - Màn 10 mỗi chương (hang: 'trum'): Hợp tấu 2 bè Đoạn 4 "Kìa con bướm vàng"
     (Bè 1: 5 5 4 4 3 3 2 2 | Bè 2: 1 3 2 4 3 5 4 2)
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var CAU_HAM = ['swing_left', 'swing_right', 'extend', 'retract', 'pick_up', 'set_down', 'pick_up2', 'read_code', 'weight', 'rail', 'wait'];
  var HAM_NHEN = ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'crouch', 'stand', 'magnet_n', 'magnet_s', 'magnet_off', 'front_metal', 'front_pole'];
  var HAM_BANH = BANH.concat(['arm_down', 'arm_up', 'arm_left', 'arm_right', 'grab', 'release', 'front_clear', 'left_clear', 'right_clear']);
  var HAM_XICH = BANH.concat(['spray', 'spray_back', 'distance', 'warm']);
  var HAM_XICH_LOA = BANH.concat(['beat', 'note', 'distance', 'warm']);
  var HAM_OMNI = BANH.concat(['slide_left', 'slide_right', 'load', 'throw', 'radar', 'diag_left', 'diag_right', 'aim', 'shape']);
  var HAM_GAI = BANH.concat(['retract_spikes', 'extend_spikes', 'beat', 'note', 'hear', 'listen']);

  var R1_CAU = {
    loaiRobot: 'cau',
    robot: { than: 'cau', tay: 'moc-cau', camBien: [{ ma: 'quet-ma', o: 'tren' }] },
    hamGoc: CAU_HAM
  };
  var R1_LOA = {
    loaiRobot: 'xich', phatNot: true,
    robot: { than: 'xich', tay: 'loa', camBien: [{ ma: 'hong-ngoai', o: 'tren' }] },
    hamGoc: HAM_XICH_LOA
  };
  var R_NHEN = {
    loaiRobot: 'nhen',
    robot: { than: 'nhen', tay: 'nam-cham', camBien: [{ ma: 'tu', o: 'hong' }], son: 'lam' },
    hamGoc: HAM_NHEN
  };
  var R_BANH = {
    loaiRobot: 'banh',
    robot: { than: 'hai-banh', tay: 'xoay', camBien: [{ ma: 'khoang-cach', o: 'hong' }], son: 'lam' },
    hamGoc: HAM_BANH
  };
  var R_XICH = {
    loaiRobot: 'xich', xichDay: true, lucBan: true,
    robot: { than: 'xich', tay: 'hoi', camBien: [{ ma: 'hong-ngoai', o: 'tren' }], son: 'lam' },
    hamGoc: HAM_XICH
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

  var SAN_CANG = [
    '~~~~~~~',
    '~~~~~~~',
    '~DTTTD~',
    '.RRRRR.',
    '.DDDDD.',
    '.DDDDD.',
    '.......'
  ];

  var O_TAU_1 = [{ x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 }];

  function tauDon(co, vang) {
    return [{ o: O_TAU_1, co: co, vang: vang }];
  }
  function CW(x, y, ds) {
    return {
      x: x, y: y,
      cont: ds.map(function (p) { return { so: p[0], tan: p[1] }; })
    };
  }
  function VS(x, y) { return { x: x, y: y, chat: 'sat' }; }
  function VN(x, y, cuc) { return { x: x, y: y, chat: 'nam-cham', cuc: cuc }; }

  var H_SONIC_RAIL = {
    ten: 'sonic_rail', thamSo: [],
    than: ['play_note(listen())', 'back()']
  };
  var H_GRAB_CLEAR = {
    ten: 'grab_clear', thamSo: [],
    than: ['pick()', 'back()']
  };
  var H_WAIT_SLIDE_LOAD = {
    ten: 'wait_slide_load', thamSo: ['t', 's'],
    than: ['wait_n(t)', 'slide_load(s, 4)']
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function baiDoi(r1Chinh, r2Chinh, hamEm, hamMan) {
    return {
      doi: [{ chinh: r1Chinh.slice() }, { chinh: r2Chinh.slice() }],
      hamCuaMan: hamMan ? clone(hamMan) : [],
      hamCuaEmMoi: hamEm ? clone(hamEm) : []
    };
  }

  function manCS(chuong, so, hang, cfg) {
    var r1 = clone(cfg.r1 || R1_CAU);
    var r2 = clone(cfg.r2 || R_NHEN);
    r1.batDau = cfg.bd[0];
    r2.batDau = cfg.bd[1];
    if (cfg.coDinhR1) r1.coDinh = true;
    if (cfg.coDinhR2) r2.coDinh = true;
    var m = {
      chuong: chuong,
      so: so,
      ten: cfg.ten,
      hang: hang,
      vo: 'cang',
      loaiRobot: r1.loaiRobot,
      daLapHo: true,
      robot: clone(r1.robot),
      hamGoc: r1.hamGoc.slice(),
      cauTruc: cfg.cauTruc || ['for', 'if', 'while', 'list'],
      vaHoac: true,
      moXuong: true,
      camHamCuaEm: false,
      hamCuaEmCan: cfg.hamCuaEmCan || ['swing_by', 'carry_by', 'wait_n'],
      taoHam: cfg.taoHam || [],
      khung: cfg.khung || { chinh: 10, moiHam: 8 },
      mucTieu: cfg.mucTieu || 'giao-tau',
      deBai: cfg.deBai,
      veMaMau: cfg.veMaMau || '',
      san: cfg.san || SAN_CANG,
      batDau: cfg.bd[0],
      doi: [r1, r2],
      maMau: cfg.maMau,
      loiGiai: cfg.loiGiai,
      loiSai: cfg.loiSai || [],
      sao: cfg.sao || { o: 16, nhip: 10 },
      goiY: cfg.goiY || []
    };
    if (r1.loaiRobot === 'cau') m.taiToiDa = cfg.taiToiDa || 6;
    if (cfg.chiChay) { m.chiChay = true; m.chinhCoDinh = true; }
    if (cfg.chong) m.chong = cfg.chong;
    if (cfg.vatThem) m.vatThem = cfg.vatThem;
    if (cfg.tau) m.tau = cfg.tau;
    if (cfg.giao) m.giao = cfg.giao;
    if (cfg.dieu) m.dieu = cfg.dieu;
    if (cfg.chuongDa) m.chuongDa = cfg.chuongDa;
    if (cfg.daChuong) m.daChuong = cfg.daChuong;
    return ManHoc.chuanHoa(m);
  }

  ManHoc.manCuuCangSong = [
    /* ========================================================================
       CHƯƠNG 1: cuu-cang-song (10 màn)
       ======================================================================== */
    manCS('cuu-cang-song', 1, 'lam-quen', {
      ten: 'Bánh gai phá đá chuông trên đường ray cẩu',
      chiChay: true, r2: R_GAI,
      hamCuaEmCan: ['swing_by', 'play_note', 'back'],
      deBai: 'Chào mừng em đến Gói 4: Cứu hộ Cảng sông! R1 là cần cẩu container Mùa 4 ở (1, 3), còn R2 là robot bánh gai gắn loa Mùa 8 đang đứng ở (2, 4) hướng lên. Trên đường ray tại (2, 3) có tảng đá chuông nốt 4 chắn lối trượt của R1: R2 gọi play_note(listen()) phá đá chuông ngay nhịp đầu, trong lúc R1 nhấc kiện 15 ở (1, 4), quay swing_by(4), trượt rail(1) sang cột 2 rồi hạ hàng lên tàu! Nhấn Chạy để quan sát!',
      veMaMau: 'Quan sát R2 phá đá chuông trên ray để R1 trượt sang giao container lên tàu.',
      bd: [{ x: 1, y: 3, nac: 4, tam: 1 }, { x: 2, y: 4, huong: 0 }],
      chong: [CW(1, 4, [[15, 1]])],
      daChuong: [{ x: 2, y: 3, not: 4, ben: 1 }],
      tau: tauDon(7, 2),
      giao: [{ tau: 0, so: [15] }],
      maMau: baiDoi(['pick_up()', 'swing_by(4)', 'rail(1)', 'set_down()'], ['play_note(listen())']),
      loiGiai: baiDoi(['pick_up()', 'swing_by(4)', 'rail(1)', 'set_down()'], ['play_note(listen())']),
      sao: { o: 18, nhip: 7 },
      goiY: ['Nhấn Chạy để xem R2 phá đá chuông ở (2, 3) giúp R1 trượt sang cột 2 giao kiện 15 lên tàu.']
    }),

    manCS('cuu-cang-song', 2, 'lam-quen', {
      ten: 'Xe kho gắp kiện gỗ dọn đường ray',
      r2: R_BANH,
      hamCuaEmCan: ['swing_by', 'pick', 'back'],
      deBai: 'Trên đường ray tại (2, 3) có một kiện gỗ o rơi xuống chắn bánh ray của R1! R2 (xe hai bánh Mùa 1) đứng ở (2, 4) hướng lên: hãy cho R2 gọi pick() để gắp kiện gỗ ở (2, 3) lên tay, giúp R1 ở (1, 3) nhấc kiện container 21 ở (1, 4), quay swing_by(4), trượt rail(1) rồi gọi set_down() giao hàng lên tàu!',
      veMaMau: 'R2 chưa gọi pick() để nhấc kiện gỗ trên đường ray (2, 3).',
      bd: [{ x: 1, y: 3, nac: 4, tam: 1 }, { x: 2, y: 4, huong: 0 }],
      chong: [CW(1, 4, [[21, 2]])],
      vatThem: [{ x: 2, y: 3 }],
      tau: tauDon(7, 2),
      giao: [{ tau: 0, so: [21] }],
      maMau: baiDoi(['pick_up()', 'swing_by(4)', 'rail(1)', 'set_down()'], ['wait()']),
      loiGiai: baiDoi(['pick_up()', 'swing_by(4)', 'rail(1)', 'set_down()'], ['pick()']),
      loiSai: [
        { moTa: 'R2 đứng yên không gắp kiện gỗ ở (2, 3) nên R1 bị kẹt khi trượt rail(1)', baiLam: baiDoi(['pick_up()', 'swing_by(4)', 'rail(1)', 'set_down()'], ['wait()']), phaiCoMa: ['het-ray'] }
      ],
      sao: { o: 16, nhip: 7 },
      goiY: ['Ở chương trình R2, thay wait() bằng pick() để gắp kiện gỗ tại (2, 3) lên tay.']
    }),

    manCS('cuu-cang-song', 3, 'luyen', {
      ten: 'Nhện dọn sắt trên ray cho cẩu bốc đôi',
      r2: R_NHEN,
      hamCuaEmCan: ['carry2_by', 'pull_s', 'go', 'wait_n'],
      deBai: 'R1 ở (1, 3) cần trượt sang cột 2 để bốc đôi cặp container [14, 28] tại (2, 4) lên tàu bằng carry2_by(4). Nhưng trên đường ray (2, 3) đang có mẩu sắt vụn và R2 (robot nhện)! Hãy cho R2 gọi pull_s() rồi go("R") sang (3, 3) nhường ô ray (2, 3) cho R1! R1 gọi wait_n(3), rail(1), carry2_by(4).',
      veMaMau: 'R2 chưa gọi pull_s() và go("R") để dọn sắt và nhường ô ray (2, 3).',
      bd: [{ x: 1, y: 3, nac: 4, tam: 1 }, { x: 2, y: 3, huong: 1 }],
      chong: [CW(2, 4, [[14, 1], [28, 2]])],
      vatThem: [VS(2, 3)],
      tau: tauDon(10, 2),
      giao: [{ tau: 0, so: [14, 28] }],
      maMau: baiDoi(['wait_n(3)', 'rail(1)', 'carry2_by(4)'], ['pull_s()']),
      loiGiai: baiDoi(['wait_n(3)', 'rail(1)', 'carry2_by(4)'], ['pull_s()', 'go("R")']),
      loiSai: [
        { moTa: 'R2 hút sắt nhưng quên bước sang (3, 3) nên R1 đâm phải R2 trên ray', baiLam: baiDoi(['wait_n(3)', 'rail(1)', 'carry2_by(4)'], ['pull_s()']), phaiCoMa: ['het-ray'] }
      ],
      sao: { o: 24, nhip: 10 },
      goiY: ['Thêm go("R") sau pull_s() ở chương trình R2.']
    }),

    manCS('cuu-cang-song', 4, 'luyen', {
      ten: 'Omni trượt ngang nhường bãi trung chuyển',
      r2: R_OMNI, taiToiDa: 4,
      hamCuaEmCan: ['swing_by', 'carry2_by', 'slide_r'],
      deBai: 'Tải tối đa của cẩu ở màn này là 4 tấn (taiToiDa = 4), nên R1 ở (3, 3) cần đưa từng kiện 2 tấn [16, 32] từ tầm 2 (3, 5) về ô bãi trung chuyển (3, 4) rồi mới gọi carry2_by(4) bốc đôi lên tàu! Nhưng R2 (robot omni) đang đứng ở (3, 4): hãy cho R2 gọi slide_r(1) trượt sang (4, 4) nhường bãi ngay từ đầu!',
      veMaMau: 'R2 chưa trượt khỏi ô bãi trung chuyển (3, 4).',
      bd: [{ x: 3, y: 3, nac: 4, tam: 1 }, { x: 3, y: 4, huong: 0 }],
      chong: [CW(3, 5, [[16, 2], [32, 2]])],
      tau: tauDon(14, 2),
      giao: [{ tau: 0, so: [32, 16] }],
      maMau: baiDoi(['for i in range(2):', '    extend()', '    pick_up()', '    retract()', '    set_down()', 'carry2_by(4)'], ['wait()']),
      loiGiai: baiDoi(['for i in range(2):', '    extend()', '    pick_up()', '    retract()', '    set_down()', 'carry2_by(4)'], ['slide_r(1)']),
      loiSai: [
        { moTa: 'R2 đứng yên ở (3, 4) nên R1 hạ container trúng R2', baiLam: baiDoi(['for i in range(2):', '    extend()', '    pick_up()', '    retract()', '    set_down()', 'carry2_by(4)'], ['wait()']), phaiCoMa: ['ha-bi-chan'] }
      ],
      sao: { o: 25, nhip: 14 },
      goiY: ['Thay wait() của R2 bằng slide_r(1) để R2 trượt sang (4, 4) ngay nhịp đầu.']
    }),

    manCS('cuu-cang-song', 5, 'cung-co', {
      ten: 'Bánh gai phá đá chuông giải phóng container',
      r2: R_GAI,
      hamCuaEmCan: ['carry_by', 'play_note', 'forward', 'wait_n'],
      deBai: 'Container 25 nằm ở (3, 4), còn đường ray (3, 3) bị tảng đá chuông nốt 5 chắn trước mặt R2 (bánh gai đang đứng ở (2, 3) hướng phải)! Hãy cho R2 gọi play_note(listen()) phá đá chuông ở (3, 3) rồi gọi forward(2) tiến sang (4, 3) nhường đường ray cho R1 trượt rail(2) từ (1, 3) sang (3, 3) và gọi carry_by(4) bốc kiện 25 lên tàu!',
      veMaMau: 'R2 chưa gọi play_note(listen()) và forward(2) để phá đá chuông và nhường đường ray (3, 3).',
      bd: [{ x: 1, y: 3, nac: 4, tam: 1 }, { x: 2, y: 3, huong: 1 }],
      chong: [CW(3, 4, [[25, 2]])],
      daChuong: [{ x: 3, y: 3, not: 5, ben: 1 }],
      tau: tauDon(11, 2),
      giao: [{ tau: 0, so: [25] }],
      maMau: baiDoi(['wait_n(3)', 'rail(2)', 'carry_by(4)'], ['play_note(listen())']),
      loiGiai: baiDoi(['wait_n(3)', 'rail(2)', 'carry_by(4)'], ['play_note(listen())', 'forward(2)']),
      loiSai: [
        { moTa: 'R2 phá đá chuông ở (3, 3) nhưng chưa gọi forward(2) sang (4, 3) nên R1 trượt rail(2) đâm phải R2', baiLam: baiDoi(['wait_n(3)', 'rail(2)', 'carry_by(4)'], ['play_note(listen())']), phaiCoMa: ['het-ray'] }
      ],
      sao: { o: 21, nhip: 11 },
      goiY: ['Ở chương trình R2, thêm forward(2) sau play_note(listen()) để tiến sang (4, 3).']
    }),

    manCS('cuu-cang-song', 6, 'cung-co', {
      ten: 'Quét mã phân loại kết hợp nhện dọn cực từ',
      r2: R_NHEN,
      hamCuaEmCan: ['carry_by', 'grab_pole', 'go', 'wait_n'],
      deBai: 'R1 ở (1, 3) cần trượt 2 ô sang (3, 3) để bốc kiện hàng 36 tại (3, 4) lên tàu. Nhưng trên ô ray (3, 3) có một mẩu nam châm! R2 (robot nhện) đứng ở (2, 3) với huong = 1 (nhìn sang phải về (3, 3)): hãy cho R2 gọi grab_pole() để tự đọc cực nam châm ở (3, 3), bật cực trái dấu và bước sang (3, 3) hút nam châm, sau đó gọi go("R") bước tiếp sang (4, 3) nhường ray cho R1!',
      veMaMau: 'R2 chưa gọi grab_pole() và go("R") để dọn nam châm trên ray (3, 3).',
      bd: [{ x: 1, y: 3, nac: 4, tam: 1 }, { x: 2, y: 3, huong: 1 }],
      chong: [CW(3, 4, [[36, 2]])],
      vatThem: [VN(3, 3, 'N')],
      tau: tauDon(12, 2),
      giao: [{ tau: 0, so: [36] }],
      maMau: baiDoi(['wait_n(4)', 'rail(2)', 'carry_by(4)'], ['grab_pole()']),
      loiGiai: baiDoi(['wait_n(4)', 'rail(2)', 'carry_by(4)'], ['grab_pole()', 'go("R")']),
      loiSai: [
        { moTa: 'R2 gọi grab_pole() bước lên (3, 3) nhưng quên gọi go("R") sang (4, 3) nên R1 đâm phải R2', baiLam: baiDoi(['wait_n(4)', 'rail(2)', 'carry_by(4)'], ['grab_pole()']), phaiCoMa: ['het-ray'] }
      ],
      sao: { o: 24, nhip: 12 },
      goiY: ['Thêm go("R") sau grab_pole() ở chương trình R2 để R2 bước sang (4, 3).']
    }),

    manCS('cuu-cang-song', 7, 'van-dung', {
      ten: 'Xe xích lùi nhường ray cho cẩu trượt dài',
      r2: R_XICH,
      hamCuaEmCan: ['slide_load', 'move', 'back', 'wait_n'],
      deBai: 'R1 ở (1, 3) cần dùng hàm slide_load(2, 4) (trượt rail(2) sang cột 3 rồi gọi carry_by(4)) để bốc kiện 42 ở (3, 4) lên tàu. Nhưng trên ô ray (2, 3) đang có R2 (xe bánh xích) đứng hướng lên! Hãy cho R2 gọi back() lùi 1 ô xuống (2, 4), còn R1 chờ 1 nhịp bằng wait() rồi gọi slide_load(2, 4)!',
      veMaMau: 'R2 chưa lùi khỏi đường ray (2, 3) và R1 chưa gọi slide_load(2, 4).',
      bd: [{ x: 1, y: 3, nac: 4, tam: 1 }, { x: 2, y: 3, huong: 0 }],
      chong: [CW(3, 4, [[42, 2]])],
      tau: tauDon(9, 2),
      giao: [{ tau: 0, so: [42] }],
      maMau: baiDoi(['wait()'], ['wait()']),
      loiGiai: baiDoi(['wait()', 'slide_load(2, 4)'], ['back()']),
      loiSai: [
        { moTa: 'R2 đứng yên trên ray (2, 3) và R1 chưa gọi slide_load(2, 4)', baiLam: baiDoi(['wait()'], ['wait()']), phaiCoMa: ['chua-giao-tau'] }
      ],
      sao: { o: 19, nhip: 9 },
      goiY: ['R1 gọi wait() rồi slide_load(2, 4); R2 gọi back().']
    }),

    manCS('cuu-cang-song', 8, 'van-dung', {
      ten: 'Dọn sắt và nhường ray cho cẩu giao hai chuyến',
      r2: R_NHEN,
      hamCuaEmCan: ['swing_by', 'slide_load', 'clear_rail', 'go', 'wait_n'],
      deBai: 'Trên đường ray có mẩu sắt tại (2, 3), ứng với 2 kiện hàng [19] ở (2, 4) và [29] ở (3, 4). R2 (robot nhện) ở (2, 3) gọi clear_rail("R") để hút sắt ở (2, 3) và bước sang (3, 3), sau đó gọi tiếp go("R") sang (4, 3) nhường cả 2 cột ray cho R1! Cùng lúc đó, R1 chờ 3 nhịp bằng wait_n(3), gọi slide_load(1, 4) bốc kiện [19], gọi swing_by(4) quay cần về hướng Nam rồi gọi tiếp slide_load(1, 4) bốc kiện [29]!',
      veMaMau: 'Hoàn thiện lệnh cho R2 bước sang (4, 3) nhường cột 3 cho R1.',
      bd: [{ x: 1, y: 3, nac: 4, tam: 1 }, { x: 2, y: 3, huong: 1 }],
      chong: [CW(2, 4, [[19, 1]]), CW(3, 4, [[29, 2]])],
      vatThem: [VS(2, 3)],
      tau: tauDon(21, 2),
      giao: [{ tau: 0, so: [19, 29] }],
      maMau: baiDoi(['wait_n(3)', 'slide_load(1, 4)', 'swing_by(4)', 'slide_load(1, 4)'], ['clear_rail("R")']),
      loiGiai: baiDoi(['wait_n(3)', 'slide_load(1, 4)', 'swing_by(4)', 'slide_load(1, 4)'], ['clear_rail("R")', 'go("R")']),
      loiSai: [
        { moTa: 'R2 mới dọn ô (2, 3) sang (3, 3) mà chưa gọi go("R") sang (4, 3) nên chặn R1 ở chuyến thứ hai', baiLam: baiDoi(['wait_n(3)', 'slide_load(1, 4)', 'swing_by(4)', 'slide_load(1, 4)'], ['clear_rail("R")']), phaiCoMa: ['het-ray'] }
      ],
      sao: { o: 29, nhip: 21 },
      goiY: ['Thêm go("R") sau clear_rail("R") ở chương trình R2 để bước sang (4, 3).']
    }),

    manCS('cuu-cang-song', 9, 'bien-the', {
      ten: 'Phối hợp bánh gai và cần cẩu bốc cặp hàng nặng',
      r2: R_GAI,
      hamCuaEmCan: ['slide_load2', 'play_note', 'move', 'forward', 'wait_n'],
      deBai: 'Thử thách Cảng sông và Hang động! Trên đường ray tại (3, 3) và (4, 3) có 2 tảng đá chuông nốt 3 và nốt 6 chắn đường R1. R2 (bánh gai) đứng ở (2, 3) hướng phải: hãy cho R2 gọi play_note(listen()) phá đá chuông (3, 3), tiến 1 ô bằng move(), gọi play_note(listen()) phá tiếp đá chuông (4, 3) rồi gọi forward(2) tiến sang (5, 3) nhường đường ray! R1 ở (1, 3) chờ 5 nhịp bằng wait_n(5) rồi gọi slide_load2(3, 4) trượt 3 ô sang cột 4 bốc đôi cặp kiện [31, 41] ở (4, 4) lên tàu!',
      veMaMau: 'Hoàn thiện chuỗi lệnh của R2 để phá đá chuông (4, 3) và tiến sang (5, 3).',
      bd: [{ x: 1, y: 3, nac: 4, tam: 1 }, { x: 2, y: 3, huong: 1 }],
      chong: [CW(4, 4, [[31, 2], [41, 2]])],
      daChuong: [{ x: 3, y: 3, not: 3, ben: 1 }, { x: 4, y: 3, not: 6, ben: 1 }],
      tau: tauDon(14, 2),
      giao: [{ tau: 0, so: [31, 41] }],
      maMau: baiDoi(['wait_n(5)', 'slide_load2(3, 4)'], ['play_note(listen())', 'move()']),
      loiGiai: baiDoi(['wait_n(5)', 'slide_load2(3, 4)'], ['play_note(listen())', 'move()', 'play_note(listen())', 'forward(2)']),
      loiSai: [
        { moTa: 'R2 mới phá tảng đá chuông đầu tiên và đứng ở (3, 3) nên chặn đường R1', baiLam: baiDoi(['wait_n(5)', 'slide_load2(3, 4)'], ['play_note(listen())', 'move()']), phaiCoMa: ['het-ray'] }
      ],
      sao: { o: 28, nhip: 14 },
      goiY: ['Thêm play_note(listen()) rồi forward(2) ở cuối chương trình R2 để phá đá chuông (4, 3) và tiến sang (5, 3).']
    }),

    manCS('cuu-cang-song', 10, 'trum', {
      ten: 'Hợp tấu bến cảng: Đoạn 4 Kìa con bướm vàng',
      r1: R1_LOA, r2: R_GAI, mucTieu: 'choi-dieu',
      dieu: { r1: '5 5 4 4 3 3 2 2', r2: '1 3 2 4 3 5 4 2' },
      hamCuaEmCan: ['play_note', 'play_part'],
      deBai: 'Khép lại chương Cứu hộ Cảng sông, dàn nhạc robot biểu diễn Đoạn 4 bài "Kìa con bướm vàng" ("Bươm bướm bay, đôi ba vòng") gồm 8 nhịp 2 bè: Bè 1 (R1) chơi giai điệu [5, 5, 4, 4, 3, 3, 2, 2], còn Bè 2 (R2) chơi bè hòa âm [1, 3, 2, 4, 3, 5, 4, 2]. Hãy gọi play_part([1, 3, 2, 4, 3, 5, 4, 2]) cho R2!',
      veMaMau: 'R2 chưa chơi đủ bè 2 [1, 3, 2, 4, 3, 5, 4, 2].',
      san: ['#####', '#...#', '#####'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 3, y: 1, huong: 3 }],
      maMau: baiDoi(['play_part([5, 5, 4, 4, 3, 3, 2, 2])'], ['play_note(1)']),
      loiGiai: baiDoi(['play_part([5, 5, 4, 4, 3, 3, 2, 2])'], ['play_part([1, 3, 2, 4, 3, 5, 4, 2])']),
      loiSai: [
        { moTa: 'R2 chỉ phát 1 nốt thay vì gọi play_part([1, 3, 2, 4, 3, 5, 4, 2])', baiLam: baiDoi(['play_part([5, 5, 4, 4, 3, 3, 2, 2])'], ['play_note(1)']), phaiCoMa: ['lo-nhip'] }
      ],
      sao: { o: 24, nhip: 8 },
      goiY: ['Ở chương trình R2, gọi play_part([1, 3, 2, 4, 3, 5, 4, 2]).']
    }),

    /* ========================================================================
       CHƯƠNG 2: lap-cang-song (10 màn)
       ======================================================================== */
    manCS('lap-cang-song', 1, 'lam-quen', {
      ten: 'Quan sát hàm sonic_rail dọn đá chuông trên ray',
      chiChay: true, r2: R_GAI,
      hamCuaEmCan: ['slide_load', 'play_note', 'back', 'wait_n'],
      deBai: 'Sang chương Lập trình cứu Cảng sông, em sẽ chế tạo các hàm phối hợp giữa cần cẩu R1 và đội robot chi viện R2! Hãy nhấn Chạy để xem R2 (bánh gai) gọi hàm sonic_rail() vừa phá đá chuông ở (2, 3) vừa lùi khỏi đường ray, giúp R1 gọi slide_load(1, 4) giao kiện 18 lên tàu.',
      veMaMau: 'Quan sát hàm sonic_rail() của R2 phối hợp cùng slide_load(1, 4) của R1.',
      bd: [{ x: 1, y: 3, nac: 4, tam: 1 }, { x: 3, y: 3, huong: 3 }],
      chong: [CW(2, 4, [[18, 2]])],
      daChuong: [{ x: 2, y: 3, not: 4, ben: 1 }],
      tau: tauDon(8, 2),
      giao: [{ tau: 0, so: [18] }],
      maMau: baiDoi(['wait()', 'slide_load(1, 4)'], ['sonic_rail()'], [], [H_SONIC_RAIL]),
      loiGiai: baiDoi(['wait()', 'slide_load(1, 4)'], ['sonic_rail()'], [], [H_SONIC_RAIL]),
      sao: { o: 23, nhip: 8 },
      goiY: ['Nhấn Chạy để xem hàm sonic_rail() hoạt động.']
    }),

    manCS('lap-cang-song', 2, 'lam-quen', {
      ten: 'Chế tạo hàm sonic_rail cho bánh gai ở cảng',
      r2: R_GAI,
      taoHam: ['sonic_rail'],
      hamCuaEmCan: ['slide_load', 'play_note', 'back', 'wait_n'],
      deBai: 'Hãy định nghĩa hàm sonic_rail() cho R2 gồm 2 lệnh: play_note(listen()) để phá tảng đá chuông trước mặt, rồi back() để lùi 1 ô nhường đường ray cho cần cẩu! Ở chương trình chính, R2 đứng ở (3, 3) hướng trái gọi sonic_rail() phá đá chuông (2, 3) rồi lùi sang (4, 3), để R1 chờ 2 nhịp rồi gọi slide_load(2, 4) bốc kiện 27 ở (3, 4) lên tàu.',
      veMaMau: 'Hoàn thiện thân hàm sonic_rail() gồm play_note(listen()) và back().',
      bd: [{ x: 1, y: 3, nac: 4, tam: 1 }, { x: 3, y: 3, huong: 3 }],
      chong: [CW(3, 4, [[27, 2]])],
      daChuong: [{ x: 2, y: 3, not: 5, ben: 1 }],
      tau: tauDon(10, 2),
      giao: [{ tau: 0, so: [27] }],
      maMau: baiDoi(['wait_n(2)', 'slide_load(2, 4)'], ['sonic_rail()']),
      loiGiai: baiDoi(['wait_n(2)', 'slide_load(2, 4)'], ['sonic_rail()'], [H_SONIC_RAIL]),
      loiSai: [
        { moTa: 'Hàm sonic_rail() thiếu back() nên R2 vẫn đứng ở (3, 3) chặn R1 trượt rail(2)', baiLam: baiDoi(['wait_n(2)', 'slide_load(2, 4)'], ['sonic_rail()']), hamCuaEmMoi: [{ ten: 'sonic_rail', thamSo: [], than: ['play_note(listen())'] }], phaiCoMa: ['het-ray'] }
      ],
      sao: { o: 24, nhip: 10 },
      goiY: ['Trong hàm sonic_rail(), thêm back() ngay dưới play_note(listen()).']
    }),

    manCS('lap-cang-song', 3, 'luyen', {
      ten: 'Tái sử dụng sonic_rail phá 2 lớp đá trên ray',
      r2: R_GAI,
      hamCuaEmCan: ['slide_load2', 'play_note', 'back', 'wait_n', 'sonic_rail'],
      deBai: 'Trên đường ray có tảng đá chuông ở (3, 3), còn R2 đứng ở (4, 3) hướng trái. Hãy gọi sonic_rail() cho R2 để phá đá chuông ở (3, 3) và lùi sang (5, 3), giúp R1 ở (1, 3) chờ 2 nhịp rồi gọi slide_load2(3, 4) trượt 3 ô sang cột 4 bốc đôi cặp kiện [20, 40] ở (4, 4) lên tàu!',
      veMaMau: 'Gọi sonic_rail() cho R2 và slide_load2(3, 4) cho R1.',
      bd: [{ x: 1, y: 3, nac: 4, tam: 1 }, { x: 4, y: 3, huong: 3 }],
      chong: [CW(4, 4, [[20, 1], [40, 2]])],
      daChuong: [{ x: 3, y: 3, not: 7, ben: 1 }],
      tau: tauDon(11, 2),
      giao: [{ tau: 0, so: [20, 40] }],
      maMau: baiDoi(['wait_n(2)', 'slide_load2(3, 4)'], ['wait()']),
      loiGiai: baiDoi(['wait_n(2)', 'slide_load2(3, 4)'], ['sonic_rail()']),
      loiSai: [
        { moTa: 'R2 đứng yên không gọi sonic_rail() nên R1 vướng cả đá chuông (3, 3) lẫn R2 (4, 3)', baiLam: baiDoi(['wait_n(2)', 'slide_load2(3, 4)'], ['wait()']), phaiCoMa: ['het-ray'] }
      ],
      sao: { o: 24, nhip: 11 },
      goiY: ['Thay wait() của R2 bằng sonic_rail().']
    }),

    manCS('lap-cang-song', 4, 'luyen', {
      ten: 'Chế tạo hàm grab_clear cho xe kho dọn bãi',
      r2: R_BANH,
      taoHam: ['grab_clear'],
      hamCuaEmCan: ['slide_load', 'pick', 'back', 'wait_n'],
      deBai: 'Hãy định nghĩa hàm grab_clear() cho R2 (xe hai bánh) gồm 2 lệnh: pick() để gắp kiện gỗ trước mặt, rồi back() để lùi 1 ô nhường chỗ cho cần cẩu! Ở chương trình chính, R2 ở (3, 3) hướng trái gọi grab_clear() để gắp kiện gỗ tại (2, 3) và lùi sang (4, 3); R1 chờ 3 nhịp rồi gọi slide_load(2, 4) bốc kiện 33 ở (3, 4) lên tàu.',
      veMaMau: 'Hoàn thiện hàm grab_clear() gồm pick() và back().',
      bd: [{ x: 1, y: 3, nac: 4, tam: 1 }, { x: 3, y: 3, huong: 3 }],
      chong: [CW(3, 4, [[33, 2]])],
      vatThem: [{ x: 2, y: 3 }],
      tau: tauDon(11, 2),
      giao: [{ tau: 0, so: [33] }],
      maMau: baiDoi(['wait_n(3)', 'slide_load(2, 4)'], ['grab_clear()']),
      loiGiai: baiDoi(['wait_n(3)', 'slide_load(2, 4)'], ['grab_clear()'], [H_GRAB_CLEAR]),
      loiSai: [
        { moTa: 'Hàm grab_clear() thiếu lệnh back() nên R2 vẫn đứng ở (3, 3) chặn R1', baiLam: baiDoi(['wait_n(3)', 'slide_load(2, 4)'], ['grab_clear()']), hamCuaEmMoi: [{ ten: 'grab_clear', thamSo: [], than: ['pick()'] }], phaiCoMa: ['het-ray'] }
      ],
      sao: { o: 24, nhip: 11 },
      goiY: ['Trong hàm grab_clear(), thêm back() ngay dưới pick().']
    }),

    manCS('lap-cang-song', 5, 'cung-co', {
      ten: 'Sửa lỗi hàm grab_clear giải phóng bãi trung chuyển',
      r2: R_BANH, taiToiDa: 4,
      hamCuaEmCan: ['swing_by', 'carry2_by', 'pick', 'back'],
      deBai: 'Trong màn này hàm grab_clear() của R2 bị viết ngược thứ tự (gọi back() trước pick() nên R2 lùi ra xa không gắp được kiện gỗ ở (3, 4)!). Hãy sửa lại hàm grab_clear() thành pick() rồi back(), giúp R2 ở (4, 4) hướng trái (huong = 3) gắp kiện gỗ ở (3, 4) và lùi sang (5, 4) nhường ô trung chuyển (3, 4) cho R1 gom 2 kiện [18, 36] từ (3, 5) về (3, 4) rồi bốc đôi lên tàu!',
      veMaMau: 'Sửa lại thứ tự lệnh trong grab_clear() thành pick() rồi back().',
      bd: [{ x: 3, y: 3, nac: 4, tam: 1 }, { x: 4, y: 4, huong: 3 }],
      chong: [CW(3, 5, [[18, 2], [36, 2]])],
      vatThem: [{ x: 3, y: 4 }],
      tau: tauDon(14, 2),
      giao: [{ tau: 0, so: [36, 18] }],
      maMau: baiDoi(['for i in range(2):', '    extend()', '    pick_up()', '    retract()', '    set_down()', 'carry2_by(4)'], ['grab_clear()'], [], [
        { ten: 'grab_clear', thamSo: [], than: ['back()', 'pick()'] }
      ]),
      loiGiai: baiDoi(['for i in range(2):', '    extend()', '    pick_up()', '    retract()', '    set_down()', 'carry2_by(4)'], ['grab_clear()'], [], [H_GRAB_CLEAR]),
      loiSai: [
        { moTa: 'Chưa sửa thứ tự lệnh trong grab_clear() nên kiện gỗ vẫn nằm ở (3, 4) chặn R1 hạ hàng', baiLam: baiDoi(['for i in range(2):', '    extend()', '    pick_up()', '    retract()', '    set_down()', 'carry2_by(4)'], ['grab_clear()'], [], [{ ten: 'grab_clear', thamSo: [], than: ['back()', 'pick()'] }]), phaiCoMa: ['ha-bi-chan'] }
      ],
      sao: { o: 29, nhip: 14 },
      goiY: ['Trong hàm grab_clear(), đổi thứ tự thành pick() trước rồi back() sau.']
    }),

    manCS('lap-cang-song', 6, 'cung-co', {
      ten: 'Chế tạo hàm wait_slide_load cho cần cẩu',
      r2: R_NHEN,
      taoHam: ['wait_slide_load'],
      hamCuaEmCan: ['slide_load', 'clear_rail', 'wait_n'],
      deBai: 'Hãy định nghĩa hàm wait_slide_load(t, s) cho R1 gồm 2 lệnh: wait_n(t) để chờ đồng đội dọn đường ray trong t nhịp, rồi slide_load(s, 4) để trượt s bước và bốc container ở tầm 1 lên tàu! Ở chương trình chính, R2 (nhện) gọi clear_rail("R") dọn sắt ở (2, 3), còn R1 gọi wait_slide_load(3, 1) để giao kiện 45 lên tàu.',
      veMaMau: 'Hoàn thiện hàm wait_slide_load(t, s) gồm wait_n(t) và slide_load(s, 4).',
      bd: [{ x: 1, y: 3, nac: 4, tam: 1 }, { x: 2, y: 3, huong: 1 }],
      chong: [CW(2, 4, [[45, 2]])],
      vatThem: [VS(2, 3)],
      tau: tauDon(10, 2),
      giao: [{ tau: 0, so: [45] }],
      maMau: baiDoi(['wait_slide_load(3, 1)'], ['clear_rail("L")']),
      loiGiai: baiDoi(['wait_slide_load(3, 1)'], ['clear_rail("R")'], [H_WAIT_SLIDE_LOAD]),
      loiSai: [
        { moTa: 'Hàm wait_slide_load(t, s) thiếu slide_load(s, 4) nên R1 chưa trượt và bốc hàng', baiLam: baiDoi(['wait_slide_load(3, 1)'], ['clear_rail("R")']), hamCuaEmMoi: [{ ten: 'wait_slide_load', thamSo: ['t', 's'], than: ['wait_n(t)'] }], phaiCoMa: ['chua-giao-tau'] }
      ],
      sao: { o: 25, nhip: 10 },
      goiY: ['Trong wait_slide_load(t, s) thêm slide_load(s, 4); ở R2 sửa clear_rail("L") thành clear_rail("R") để bước sang (3, 3).']
    }),

    manCS('lap-cang-song', 7, 'van-dung', {
      ten: 'Kết hợp wait_slide_load và sonic_rail',
      r2: R_GAI,
      hamCuaEmCan: ['slide_load', 'wait_n', 'sonic_rail', 'wait_slide_load'],
      deBai: 'Tảng đá chuông nốt 2 nằm ở (2, 3) và R2 (bánh gai) đứng ở (3, 3) hướng trái. Hãy cho R2 gọi sonic_rail() để phá đá chuông ở (2, 3) và lùi sang (4, 3); cùng lúc đó R1 ở (1, 3) gọi wait_slide_load(2, 2) để chờ 2 nhịp rồi trượt 2 ô sang cột 3 bốc kiện 52 ở (3, 4) lên tàu!',
      veMaMau: 'Gọi wait_slide_load(2, 2) cho R1 và sonic_rail() cho R2.',
      bd: [{ x: 1, y: 3, nac: 4, tam: 1 }, { x: 3, y: 3, huong: 3 }],
      chong: [CW(3, 4, [[52, 2]])],
      daChuong: [{ x: 2, y: 3, not: 2, ben: 1 }],
      tau: tauDon(10, 2),
      giao: [{ tau: 0, so: [52] }],
      maMau: baiDoi(['wait_slide_load(2, 1)'], ['sonic_rail()']),
      loiGiai: baiDoi(['wait_slide_load(2, 2)'], ['sonic_rail()']),
      loiSai: [
        { moTa: 'Truyền nhầm wait_slide_load(2, 1) nên R1 dừng ở cột 2, không có hàng để nhấc', baiLam: baiDoi(['wait_slide_load(2, 1)'], ['sonic_rail()']), phaiCoMa: ['moc-hut', 'chua-giao-tau'] }
      ],
      sao: { o: 26, nhip: 10 },
      goiY: ['Sửa wait_slide_load(2, 1) thành wait_slide_load(2, 2) ở chương trình R1.']
    }),

    manCS('lap-cang-song', 8, 'van-dung', {
      ten: 'Dây chuyền 2 nhịp với wait_slide_load và grab_clear',
      r2: R_BANH,
      hamCuaEmCan: ['swing_by', 'slide_load', 'wait_n', 'grab_clear', 'wait_slide_load'],
      deBai: 'Trên đường ray có kiện gỗ o ở (2, 3), còn R2 (xe hai bánh) đứng ở (3, 3) hướng trái. R1 cần bốc lần lượt kiện 23 ở (2, 4) rồi kiện 37 ở (3, 4) lên tàu! Hãy cho R2 gọi grab_clear() để gắp kiện gỗ ở (2, 3) và lùi sang (4, 3); còn R1 gọi wait_slide_load(3, 1) để bốc kiện 23 ở cột 2, gọi swing_by(4) quay cần về hướng Nam rồi gọi tiếp slide_load(1, 4) sang cột 3 bốc nốt kiện 37!',
      veMaMau: 'Thêm swing_by(4) và slide_load(1, 4) cho R1 để giao kiện thứ hai ở cột 3.',
      bd: [{ x: 1, y: 3, nac: 4, tam: 1 }, { x: 3, y: 3, huong: 3 }],
      chong: [CW(2, 4, [[23, 1]]), CW(3, 4, [[37, 2]])],
      vatThem: [{ x: 2, y: 3 }],
      tau: tauDon(21, 2),
      giao: [{ tau: 0, so: [23, 37] }],
      maMau: baiDoi(['wait_slide_load(3, 1)'], ['grab_clear()']),
      loiGiai: baiDoi(['wait_slide_load(3, 1)', 'swing_by(4)', 'slide_load(1, 4)'], ['grab_clear()']),
      loiSai: [
        { moTa: 'R1 mới giao kiện 23 ở cột 2, chưa quay cần và gọi slide_load(1, 4) để giao kiện 37 ở cột 3', baiLam: baiDoi(['wait_slide_load(3, 1)'], ['grab_clear()']), phaiCoMa: ['chua-giao-tau'] }
      ],
      sao: { o: 29, nhip: 21 },
      goiY: ['Ở chương trình R1, thêm swing_by(4) và slide_load(1, 4) ngay dưới wait_slide_load(3, 1).']
    }),

    manCS('lap-cang-song', 9, 'bien-the', {
      ten: 'Tổng duyệt Cảng sông - Hang động',
      r2: R_GAI,
      hamCuaEmCan: ['swing_by', 'slide_load', 'slide_load2', 'wait_n', 'sonic_rail', 'wait_slide_load'],
      deBai: 'Tổng duyệt trước màn hợp tấu! Trên đường ray tại (2, 3) có tảng đá chuông nốt 6, còn R2 (bánh gai) đứng ở (3, 3) hướng trái. R1 cần giao kiện đơn [17] ở (2, 4) rồi trượt sang cột 4 bốc đôi cặp kiện [26, 38] ở (4, 4)! Hãy cho R2 gọi sonic_rail() rồi back() (lùi tiếp từ (4, 3) sang (5, 3) nhường cột 4 cho R1); còn R1 gọi wait_slide_load(2, 1) bốc kiện [17] ở cột 2, gọi swing_by(4) quay cần về hướng Nam rồi gọi slide_load2(2, 4) sang cột 4 bốc đôi [26, 38]!',
      veMaMau: 'Phối hợp wait_slide_load(2, 1), swing_by(4), slide_load2(2, 4) của R1 và sonic_rail(), back() của R2.',
      bd: [{ x: 1, y: 3, nac: 4, tam: 1 }, { x: 3, y: 3, huong: 3 }],
      chong: [CW(2, 4, [[17, 1]]), CW(4, 4, [[26, 2], [38, 2]])],
      daChuong: [{ x: 2, y: 3, not: 6, ben: 1 }],
      tau: tauDon(21, 2),
      giao: [{ tau: 0, so: [17, 26, 38] }],
      maMau: baiDoi(['wait_slide_load(2, 1)'], ['sonic_rail()']),
      loiGiai: baiDoi(['wait_slide_load(2, 1)', 'swing_by(4)', 'slide_load2(2, 4)'], ['sonic_rail()', 'back()']),
      loiSai: [
        { moTa: 'R2 chưa lùi thêm 1 ô sang (5, 3) và R1 chưa gọi swing_by(4), slide_load2(2, 4)', baiLam: baiDoi(['wait_slide_load(2, 1)'], ['sonic_rail()']), phaiCoMa: ['chua-giao-tau'] }
      ],
      sao: { o: 33, nhip: 21 },
      goiY: ['R1 thêm swing_by(4) và slide_load2(2, 4); R2 thêm back() sau sonic_rail().']
    }),

    manCS('lap-cang-song', 10, 'trum', {
      ten: 'Hợp tấu hàm play_part: Đoạn 4 Kìa con bướm vàng',
      r1: R1_LOA, r2: R_GAI, mucTieu: 'choi-dieu',
      dieu: { r1: '5 5 4 4 3 3 2 2', r2: '1 3 2 4 3 5 4 2' },
      hamCuaEmCan: ['play_note', 'play_part'],
      deBai: 'Màn kết Gói 4: Hãy dùng hàm play_part(notes) cho cả R1 và R2 để biểu diễn trọn vẹn Đoạn 4 bài "Kìa con bướm vàng" ("Bươm bướm bay, đôi ba vòng") với 2 bè 8 nhịp: R1 gọi play_part([5, 5, 4, 4, 3, 3, 2, 2]), còn R2 gọi play_part([1, 3, 2, 4, 3, 5, 4, 2])!',
      veMaMau: 'Gọi play_part([1, 3, 2, 4, 3, 5, 4, 2]) cho R2 để hoàn thành bản hợp tấu.',
      san: ['#####', '#...#', '#####'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 3, y: 1, huong: 3 }],
      maMau: baiDoi(['play_part([5, 5, 4, 4, 3, 3, 2, 2])'], ['play_part([1, 3, 2, 4])']),
      loiGiai: baiDoi(['play_part([5, 5, 4, 4, 3, 3, 2, 2])'], ['play_part([1, 3, 2, 4, 3, 5, 4, 2])']),
      loiSai: [
        { moTa: 'Danh sách nốt của R2 mới có 4 nốt, thiếu 4 nốt cuối [3, 5, 4, 2]', baiLam: baiDoi(['play_part([5, 5, 4, 4, 3, 3, 2, 2])'], ['play_part([1, 3, 2, 4])']), phaiCoMa: ['lo-nhip'] }
      ],
      sao: { o: 24, nhip: 8 },
      goiY: ['Điền đủ 8 nốt [1, 3, 2, 4, 3, 5, 4, 2] vào lệnh play_part(...) của R2.']
    })
  ];
})();
