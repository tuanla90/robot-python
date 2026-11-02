/* ============================================================================
   man-cuu-clb.js - Mùa 9 CLB Sáng Tạo: Gói 9 "Giải cứu Khuôn viên CLB"
   20 màn (10 màn cuu-clb + 10 màn lap-clb):
   - R1 & R2 phối hợp giữa đầy đủ 8 dòng robot của 8 mùa (banh, xich, nhen, cau,
     xuong, drone, omni, gai) để khôi phục Khuôn viên CLB Sáng Tạo.
   - Màn 10 mỗi chương (hang: 'trum', 3 sân, nhipTheo: 'tong'): Hợp tấu 2 bè
     Đoạn 9 "Khúc ca Khuôn viên CLB" trước thềm Ngày hội.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var HAM_BANH = BANH.concat(['arm_down', 'arm_up', 'arm_left', 'arm_right', 'grab', 'release', 'front_clear', 'left_clear', 'right_clear']);
  var HAM_XICH = BANH.concat(['spray', 'spray_back', 'distance', 'warm']);
  var HAM_XICH_LOA = BANH.concat(['beat', 'note', 'distance', 'warm']);
  var HAM_NHEN = ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'crouch', 'stand', 'magnet_n', 'magnet_s', 'magnet_off', 'front_metal', 'front_pole'];
  var HAM_CAU = ['swing_left', 'swing_right', 'extend', 'retract', 'pick_up', 'set_down', 'pick_up2', 'read_code', 'weight', 'rail', 'wait'];
  var HAM_XUONG = BANH.concat(['anchor', 'unanchor', 'cast_net', 'drop_net', 'set_length', 'flow', 'flow_dir']);
  var HAM_DRONE = ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'land', 'take_off', 'dot', 'pen_down', 'pen_up', 'ink', 'color'];
  var HAM_OMNI = BANH.concat(['slide_left', 'slide_right', 'load', 'throw', 'radar', 'diag_left', 'diag_right', 'aim', 'shape']);
  var HAM_GAI = BANH.concat(['retract_spikes', 'extend_spikes', 'beat', 'note', 'hear', 'listen']);

  var R_BANH = {
    loaiRobot: 'banh',
    robot: { than: 'hai-banh', tay: 'xoay', camBien: [{ ma: 'khoang-cach', o: 'hong' }] },
    hamGoc: HAM_BANH
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
  var R_CAU = {
    loaiRobot: 'cau',
    robot: { than: 'cau', tay: 'moc-cau', camBien: [{ ma: 'quet-ma', o: 'tren' }] },
    hamGoc: HAM_CAU
  };
  var R_XUONG = {
    loaiRobot: 'xuong',
    robot: { than: 'xuong', tay: 'day-keo', camBien: [{ ma: 'dong-chay', o: 'tren' }] },
    hamGoc: HAM_XUONG
  };
  var R_DRONE = {
    loaiRobot: 'drone',
    robot: { than: 'drone', tay: 'son', camBien: [{ ma: 'camera-4', o: 'tren', taiCho: true }], son: 'lam' },
    hamGoc: HAM_DRONE
  };
  var R_OMNI = {
    loaiRobot: 'omni', omniCheo: true, chinhLuc: true, nhanDang: true, tamNemMacDinh: 2, daLapHo: true,
    robot: { than: 'omni', tay: 'nem', camBien: [{ ma: 'radar', o: 'tren', nhanDang: true }], son: 'lam' },
    hamGoc: HAM_OMNI
  };
  var R_GAI = {
    loaiRobot: 'gai', thuGai: true, phatNot: true, phanAm: true,
    robot: { than: 'gai', tay: 'loa', camBien: [{ ma: 'am-thanh', o: 'tren', phanAm: true }] },
    hamGoc: HAM_GAI
  };
  var R2_LOA = {
    loaiRobot: 'xich', phatNot: true,
    robot: { than: 'xich', tay: 'loa', camBien: [{ ma: 'hong-ngoai', o: 'tren' }], son: 'lam' },
    hamGoc: HAM_XICH_LOA
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
  var SAN_DUET_3 = [
    ['########', '#......#', '#......#', '########'],
    ['########', '#..##..#', '#......#', '########'],
    ['########', '#......#', '#..##..#', '########']
  ];

  function ham(ten, than, thamSo) { return { ten: ten, thamSo: thamSo || [], than: than }; }
  function baiDoi(r1, r2, hm, moi) {
    var kq = { doi: [{ chinh: r1 }, { chinh: r2 }], hamCuaMan: hm || [] };
    if (moi) kq.hamCuaEmMoi = moi;
    return kq;
  }
  function xe(mau, bd, them) { return Object.assign({}, JSON.parse(JSON.stringify(mau)), { batDau: bd }, them || {}); }

  function manCLB(chuong, so, hang, p) {
    var r1 = xe(p.r1 || R_GAI, p.bd[0], p.r1Them);
    var r2 = xe(p.r2 || R_OMNI, p.bd[1], p.r2Them);
    var kq = {
      ma: chuong + '.' + so, ten: p.ten, chuong: chuong, so: so, hang: hang,
      vo: p.vo || 'hang-dong', loaiRobot: r1.loaiRobot, robot: r1.robot, hamGoc: r1.hamGoc,
      daLapHo: true,
      mucTieu: p.mucTieu || 'toi-co',
      deBai: p.deBai, san: p.san,
      batDau: p.bd[0], doi: [r1, r2],
      khung: p.khung || { chinh: 10, moiHam: 8 },
      cauTruc: ['for', 'if', 'while', 'list', 'dict', 'set', 'tuple'],
      vaHoac: true, moXuong: true, camHamCuaEm: false, bienDem: true, nhipTheoLoiGiai: true,
      taoHam: p.taoHam || [],
      hamCuaEmCan: p.hamCuaEmCan || [],
      maMau: p.maMau, loiGiai: p.loiGiai, loiSai: p.loiSai || [],
      sao: p.sao || { o: 20, nhip: 8 }, goiY: p.goiY
    };
    ['thuGai', 'phatNot', 'phanAm', 'omniCheo', 'chinhLuc', 'nhanDang', 'tamNemMacDinh', 'xichDay', 'lucBan'].forEach(function (k) {
      if (r1[k] !== undefined) kq[k] = r1[k];
    });
    if (r1.loaiRobot === 'cau') kq.taiToiDa = 6;
    ['chiChay', 'chinhCoDinh', 'noi', 'cuaNhip', 'mau', 'vatMau', 'vatChat', 'vatDang', 'vatCan', 'vatThem', 'hinh', 'dieu', 'danDoi', 'daChuong', 'ngachHang', 'dong', 'chong', 'tau', 'giao', 'nhipTheo'].forEach(function (k) {
      if (p[k] !== undefined) kq[k] = p[k];
    });
    return ManHoc.chuanHoa(kq);
  }

  ManHoc.manCuuClb = [
    // ==================== CHƯƠNG 1: cuu-clb (10 màn) ====================
    manCLB('cuu-clb', 1, 'lam-quen', {
      ten: 'Mở cổng chính Khuôn viên CLB Sáng Tạo',
      chiChay: true, chinhCoDinh: true, vo: 'kho-hang', r1: R_BANH, r2: R_XICH,
      hamCuaEmCan: ['move', 'forward', 'grab_clear', 'valve_step'],
      deBai: 'Đội robot từ khắp 8 khu vực đã hội quân về Khuôn viên CLB Sáng Tạo! Ngay cổng chính, R1 (xe hai bánh Mùa 1) gọi grab_clear() dọn kiện gỗ chắn lối rồi tiến qua cửa C, trong lúc R2 (xe xích Mùa 2) gọi valve_step(1) bắn van N mở cửa C và tiến vào cờ. Bấm Chạy thử để quan sát!',
      san: [
        '########',
        '#..oC.F#',
        '#.####.#',
        '#..FN..#',
        '########'
      ],
      bd: [{ x: 2, y: 1, huong: 1 }, { x: 2, y: 3, huong: 1 }],
      r1Them: { co: [{ x: 6, y: 1 }] }, r2Them: { co: [{ x: 3, y: 3 }] },
      noi: [{ nut: { x: 4, y: 3 }, cua: [{ x: 4, y: 1 }] }],
      maMau: baiDoi(['grab_clear()', 'forward(5)'], ['valve_step(1)']),
      loiGiai: baiDoi(['grab_clear()', 'forward(5)'], ['valve_step(1)']),
      sao: { o: 22, nhip: 8 },
      goiY: ['Màn trình diễn: bấm Chạy thử để xem R1 và R2 phối hợp mở cổng chính CLB.']
    }),

    manCLB('cuu-clb', 2, 'lam-quen', {
      ten: 'Xưởng cơ khí CLB: Xích mở van cho nhện kéo lõi sắt',
      vo: 'nha-may', r1: R_XICH, r2: R_NHEN, mucTieu: 'dua-vat', vatCan: 'sat',
      hamCuaEmCan: ['move', 'forward', 'valve_step', 'clear_iron'],
      deBai: 'Trong Xưởng cơ khí CLB, cửa C ở (4, 3) đang chặn đường vận chuyển lõi sắt của R2 (nhện từ tính Mùa 3). Hãy để R1 (xe xích Mùa 2) gọi valve_step(1) bắn van N ở (4, 1) mở cửa C, giúp R2 đi tới (2, 3), gọi clear_iron("R") và kéo lõi sắt qua cửa C về đích D ở (5, 3).',
      san: [
        '########',
        '#..FN..#',
        '#.####.#',
        '#.o.CD.#',
        '########'
      ],
      bd: [{ x: 2, y: 1, huong: 1 }, { x: 1, y: 3, huong: 1 }],
      vatChat: ['........', '........', '........', '..s.....', '........'],
      noi: [{ nut: { x: 4, y: 1 }, cua: [{ x: 4, y: 3 }] }],
      maMau: baiDoi(['move()'], ['go_right()', 'clear_iron("R")', 'go_right()', 'go_right()', 'magnet_off()', 'wait()']),
      loiGiai: baiDoi(['valve_step(1)'], ['go_right()', 'clear_iron("R")', 'go_right()', 'go_right()', 'magnet_off()', 'wait()']),
      loiSai: [
        { moTa: 'R1 chưa bắn van N mở cửa C: R2 đâm vào cửa đóng ở (4, 3)', baiLam: baiDoi(['move()'], ['go_right()', 'clear_iron("R")', 'go_right()', 'go_right()', 'magnet_off()', 'wait()']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      sao: { o: 28, nhip: 10 },
      goiY: ['Thay move() của R1 bằng valve_step(1) để R1 phun van N ở (4, 1) mở cửa C ngay nhịp đầu.', 'R2 sẽ kéo lõi sắt qua cửa C vừa mở và thả xuống D(5, 3).']
    }),

    manCLB('cuu-clb', 3, 'lam-quen', {
      ten: 'Hồ nước CLB: Xuồng ghép cầu phao cho xe kho qua kênh',
      vo: 'song', r1: R_XUONG, r2: R_BANH, mucTieu: 'dua-vat',
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'bridge_lay', 'pick', 'drop', 'turn_right'],
      deBai: 'Kênh nước giữa Khuôn viên CLB bị trôi cầu phao! Xuồng R1 (Mùa 5) tại (2, 2) gọi bridge_lay(1) kéo bè gỗ B(4, 2) về ghép cầu phao ở q(3, 2). Hãy lập trình cho R2 (xe hai bánh Mùa 1) ở (3, 1) chờ 2 nhịp, tiến 2 ô qua cầu phao sang bờ Nam nhặt kiện thiết bị o(3, 4) rồi quay phải thả vào D(2, 3).',
      san: ['#######', '#=..=.#', '#~~qB~#', '#.D...#', '#..o..#', '#######'],
      bd: [{ x: 2, y: 2, huong: 1 }, { x: 3, y: 1, huong: 2 }],
      maMau: baiDoi(['bridge_lay(1)'], ['wait_n(2)', 'forward(2)']),
      loiGiai: baiDoi(['bridge_lay(1)'], ['wait_n(2)', 'forward(2)', 'pick()', 'turn_right()', 'drop()']),
      loiSai: [
        { moTa: 'R2 mới qua cầu phao, chưa nhặt kiện thiết bị o(3, 4) đặt vào D(2, 3)', baiLam: baiDoi(['bridge_lay(1)'], ['wait_n(2)', 'forward(2)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 37, nhip: 8 },
      goiY: ['Sau forward(2), R2 đang đứng ở (3, 3) đối diện kiện hàng o(3, 4).', 'Viết thêm pick(), turn_right(), drop() cho R2 để hoàn thành nhiệm vụ.']
    }),

    manCLB('cuu-clb', 4, 'cung-co', {
      ten: 'Bến tàu CLB: Bánh gai phá nhũ đá nhường ray cho cần cẩu',
      vo: 'cang-song', r1: R_CAU, r2: R_GAI, mucTieu: 'giao-tau',
      hamCuaEmCan: ['swing_by', 'play_note', 'move', 'wait_n'],
      deBai: 'Tại Bến tàu CLB, cần cẩu R1 (Mùa 4) ở (1, 3) cần trượt sang cột 2 để giao kiện hàng 18 lên tàu, nhưng R2 (bánh gai Mùa 8) đang đứng ở (2, 3) trước khối nhũ đá cộng hưởng nốt 5 tại (3, 3). Hãy để R2 gọi play_note(listen()) phá nhũ đá rồi move() sang (3, 3) nhường ray cho R1!',
      san: SAN_CANG,
      bd: [{ x: 1, y: 3, nac: 4, tam: 1 }, { x: 2, y: 3, huong: 1 }],
      chong: [{ x: 1, y: 4, cont: [{ so: 18, tan: 1 }] }],
      daChuong: [{ x: 3, y: 3, not: 5, ben: 1 }],
      tau: [{ o: [{ x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 }], co: 7, vang: 2 }],
      giao: [{ tau: 0, so: [18] }],
      maMau: baiDoi(['pick_up()', 'swing_by(4)', 'rail(1)', 'set_down()'], ['play_note(listen())']),
      loiGiai: baiDoi(['pick_up()', 'swing_by(4)', 'rail(1)', 'set_down()'], ['play_note(listen())', 'move()']),
      loiSai: [
        { moTa: 'R2 mới phá nhũ đá mà chưa gọi move() sang (3, 3) nhường ray cho R1', baiLam: baiDoi(['pick_up()', 'swing_by(4)', 'rail(1)', 'set_down()'], ['play_note(listen())']), phaiCoMa: ['het-ray'] }
      ],
      sao: { o: 17, nhip: 7 },
      goiY: ['Sau play_note(listen()), thêm move() cho R2 để R2 tiến sang (3, 3), nhường ô ray (2, 3) cho R1.']
    }),

    manCLB('cuu-clb', 5, 'cung-co', {
      ten: 'Vườn thực nghiệm CLB: Bánh gai đè nút mở cửa cho drone',
      vo: 'nong-trai', r1: R_GAI, r2: R_DRONE, mucTieu: 'to-hinh',
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'tunnel_crack_glide', 'span_sow'],
      deBai: 'Vườn thực nghiệm CLB cần R2 (drone Mùa 6) gieo 3 luống hoa màu "yellow". Ở hành lang trên, đàn dơi phát sóng âm định vị ở (3, 1) giúp R1 (bánh gai Mùa 8) gọi tunnel_crack_glide() phá nhũ đá (4, 1) và trượt qua đá ướt I đè nút M(5, 1), mở cửa C cho R2 bay vào gieo hạt.',
      san: [
        '########',
        '#...IM.#',
        '########',
        '#.C....#',
        '########'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 3, huong: 1 }],
      hinh: ['........', '........', '........', '...yyy..', '........'],
      danDoi: [{ x: 3, y: 1, not: 4 }],
      daChuong: [{ x: 4, y: 1, not: 4 }],
      noi: [{ nut: { x: 5, y: 1 }, cua: [{ x: 2, y: 3 }] }],
      maMau: baiDoi(['go_echo()'], ['wait_n(7)', 'go_right()', 'go_right()', 'span_sow("yellow", 3)']),
      loiGiai: baiDoi(['tunnel_crack_glide()'], ['wait_n(7)', 'go_right()', 'go_right()', 'span_sow("yellow", 3)']),
      loiSai: [
        { moTa: 'R1 chưa gọi tunnel_crack_glide(): không đè được nút M nên cửa C đóng', baiLam: baiDoi(['go_echo()'], ['wait_n(7)', 'go_right()', 'go_right()', 'span_sow("yellow", 3)']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 30, nhip: 11 },
      goiY: ['Thay go_echo() của R1 bằng tunnel_crack_glide() để R1 phá nhũ đá và trượt lên đè nút M(5, 1).', 'R2 chờ 7 nhịp rồi bay qua cửa C gieo 3 ô màu "yellow".']
    }),

    manCLB('cuu-clb', 6, 'cung-co', {
      ten: 'Sân thử nghiệm địa hình: Omni lấp hố cho bánh gai',
      vo: 'mo-da', r1: R_GAI, r2: R_OMNI,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'echo_crack_step', 'radar_front_lob'],
      deBai: 'Trên sân thử nghiệm địa hình CLB, R2 (xe omni Mùa 7) dùng radar quét và hất đá tròn lấp hố sụt u(2, 1) bằng radar_front_lob(3). R1 (bánh gai Mùa 8) chờ 2 nhịp, nghe đàn dơi phát sóng âm ở (3, 1), gọi echo_crack_step() phá nhũ đá ở (4, 1) rồi tiến vào cờ.',
      san: [
        '#######',
        '#.u..F#',
        '##=####',
        '##o####',
        '#..F###',
        '#######'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 4, huong: 0 }],
      r1Them: { co: [{ x: 5, y: 1 }] }, r2Them: { co: [{ x: 3, y: 4 }] },
      vatDang: ['.......', '.......', '.......', '..r....', '.......', '.......'],
      danDoi: [{ x: 3, y: 1, not: 5 }],
      daChuong: [{ x: 4, y: 1, not: 5 }],
      maMau: baiDoi(['wait_n(2)', 'echo_crack_step()', 'move()'], ['slide_r(1)']),
      loiGiai: baiDoi(['wait_n(2)', 'echo_crack_step()', 'move()'], ['radar_front_lob(3)']),
      loiSai: [
        { moTa: 'R2 chưa gọi radar_front_lob(3) lấp hố u(2, 1): R1 rơi xuống hố', baiLam: baiDoi(['wait_n(2)', 'echo_crack_step()', 'move()'], ['slide_r(1)']), phaiCoMa: ['roi-ho', 'chua-toi-co'] }
      ],
      sao: { o: 30, nhip: 7 },
      goiY: ['Thay slide_r(1) của R2 bằng radar_front_lob(3) để R2 kiểm tra radar, hất đá tròn bay 3 ô lấp hố u(2, 1) rồi trượt sang cờ (3, 4).']
    }),

    manCLB('cuu-clb', 7, 'cung-co', {
      ten: 'Phòng âm học CLB: Xe kho dọn đá cho bánh gai phá nhũ đá kép',
      vo: 'hang-dong', r1: R_GAI, r2: R_BANH,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'grab_clear', 'echo_crack_step'],
      deBai: 'Trong Phòng âm học CLB, hai đàn dơi phát sóng âm định vị ở (3, 1) và (5, 1) báo vị trí hai khối nhũ đá cộng hưởng. R2 (xe hai bánh Mùa 1) gọi grab_clear() dọn tảng đá o(2, 1) lùi về cờ; R1 chờ 2 nhịp rồi gọi echo_crack_step() 2 lần liên tiếp và move() vào cờ.',
      san: [
        '#########',
        '#.o....F#',
        '##.######',
        '##F######',
        '#########'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 2, huong: 0 }],
      r1Them: { co: [{ x: 7, y: 1 }] }, r2Them: { co: [{ x: 2, y: 3 }] },
      danDoi: [{ x: 3, y: 1, not: 2 }, { x: 5, y: 1, not: 6 }],
      daChuong: [{ x: 4, y: 1, not: 2 }, { x: 6, y: 1, not: 6 }],
      maMau: baiDoi(['wait_n(2)', 'echo_crack_step()', 'move()'], ['grab_clear()']),
      loiGiai: baiDoi(['wait_n(2)', 'echo_crack_step()', 'echo_crack_step()', 'move()'], ['grab_clear()']),
      loiSai: [
        { moTa: 'R1 chỉ gọi echo_crack_step() 1 lần: dừng trước nhũ đá thứ hai ở (6, 1)', baiLam: baiDoi(['wait_n(2)', 'echo_crack_step()', 'move()'], ['grab_clear()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 28, nhip: 10 },
      goiY: ['Gọi echo_crack_step() 2 lần liên tiếp cho R1 trước khi gọi move() vào cờ (7, 1).']
    }),

    manCLB('cuu-clb', 8, 'cung-co', {
      ten: 'Chế hàm: Tiếp sức mở đường qua hành lang CLB',
      taoHam: ['clb_relay_pass'], vo: 'hang-dong', r1: R_GAI, r2: R_XICH,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'push_valve', 'echo_crack_step'],
      deBai: 'Để R1 chờ đồng đội mở cổng rồi lập tức nghe đàn dơi phá nhũ đá và bước qua ngách hang tới đích, hãy viết hàm clb_relay_pass(w): gọi wait_n(w), gọi echo_crack_step(), rồi gọi move(). Dùng clb_relay_pass(2) cho R1 khi R2 gọi push_valve(1) đẩy thùng H đè nút M.',
      san: [
        '########',
        '#.C...F#',
        '#.####.#',
        '#.F.HM.#',
        '########'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 3, y: 3, huong: 1 }],
      r1Them: { co: [{ x: 6, y: 1 }] }, r2Them: { co: [{ x: 2, y: 3 }] },
      noi: [{ nut: { x: 5, y: 3 }, cua: [{ x: 2, y: 1 }] }],
      danDoi: [{ x: 3, y: 1, not: 4 }],
      daChuong: [{ x: 4, y: 1, not: 4 }],
      ngachHang: [{ a: { x: 5, y: 1 }, b: { x: 6, y: 1 } }],
      maMau: baiDoi(['clb_relay_pass(2)'], ['push_valve(1)', 'back()'], [ham('clb_relay_pass', [], ['w'])]),
      loiGiai: baiDoi(['clb_relay_pass(2)'], ['push_valve(1)', 'back()'], [], [ham('clb_relay_pass', ['wait_n(w)', 'echo_crack_step()', 'move()'], ['w'])]),
      loiSai: [
        { moTa: 'Để trống clb_relay_pass(w): R1 đứng yên tại chỗ', baiLam: baiDoi(['clb_relay_pass(2)'], ['push_valve(1)', 'back()'], [ham('clb_relay_pass', [], ['w'])]), phaiCoMa: ['loi-cu-phap'] },
        { moTa: 'Quên move() cuối hàm clb_relay_pass(w): R1 dừng ở (4, 1) chưa vào ngách hang', baiLam: baiDoi(['clb_relay_pass(2)'], ['push_valve(1)', 'back()'], [], [ham('clb_relay_pass', ['wait_n(w)', 'echo_crack_step()'], ['w'])]), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 24, nhip: 7 },
      goiY: ['Trong thân hàm clb_relay_pass(w), viết 3 dòng: wait_n(w), echo_crack_step() và move().', 'Bước move() cuối đưa R1 vào đầu ngách hang (5, 1) để sang thẳng cờ (6, 1).']
    }),

    manCLB('cuu-clb', 9, 'on-tap', {
      ten: 'Phối hợp liên hoàn mở thông Quảng trường CLB',
      vo: 'hang-dong', r1: R_GAI, r2: R_OMNI,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'clb_relay_pass', 'glide_tunnel', 'radar_front_lob'],
      deBai: 'Trước Quảng trường CLB là hố sụt u(2, 1), đàn dơi phát sóng âm ở (3, 1), nhũ đá cộng hưởng ở (4, 1) và thềm đá vôi ướt I(6, 1). R2 (xe omni) gọi radar_front_lob(3) lấp hố; R1 gọi clb_relay_pass(2) để vượt lên (5, 1) rồi gọi glide_tunnel() trượt qua đá ướt I vào cờ (8, 1)!',
      san: [
        '##########',
        '#.u...I.F#',
        '##=#######',
        '##o#######',
        '#..F######',
        '##########'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 4, huong: 0 }],
      r1Them: { co: [{ x: 8, y: 1 }] }, r2Them: { co: [{ x: 3, y: 4 }] },
      vatDang: ['..........', '..........', '..........', '..r.......', '..........', '..........'],
      danDoi: [{ x: 3, y: 1, not: 7 }],
      daChuong: [{ x: 4, y: 1, not: 7 }],
      maMau: baiDoi(['clb_relay_pass(2)'], ['radar_front_lob(3)']),
      loiGiai: baiDoi(['clb_relay_pass(2)', 'glide_tunnel()'], ['radar_front_lob(3)']),
      loiSai: [
        { moTa: 'R1 quên gọi glide_tunnel() sau clb_relay_pass(2): dừng ở (5, 1)', baiLam: baiDoi(['clb_relay_pass(2)'], ['radar_front_lob(3)']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 36, nhip: 9 },
      goiY: ['Sau clb_relay_pass(2), R1 đang đứng ở (5, 1) ngay trước ô đá ướt I(6, 1).', 'Thêm glide_tunnel() để R1 thu gai trượt qua (6, 1) sang (7, 1) rồi bước vào cờ (8, 1).']
    }),

    manCLB('cuu-clb', 10, 'trum', {
      ten: 'Trùm Chương 1: Hòa tấu Quảng trường CLB',
      r1: R_GAI, r2: R2_LOA, mucTieu: 'choi-dieu', nhipTheo: 'tong',
      hamCuaEmCan: ['play_note', 'play_part'],
      deBai: 'Quảng trường CLB Sáng Tạo đã bừng sáng! Trên sân khấu trung tâm qua 3 sân liên tiếp, R1 và R2 cùng hợp tấu 2 bè:\n- Bè 1 (R1): [1, 2, 3, 5, 5, 6, 5, 8]\n- Bè 2 (R2): [1, 1, 1, 3, 3, 4, 3, 5]\nHãy dùng play_part(notes) cho cả hai robot.',
      san: SAN_DUET_3,
      bd: [{ x: 2, y: 1, huong: 1 }, { x: 2, y: 2, huong: 1 }],
      dieu: { r1: '12355658', r2: '11133435' },
      maMau: baiDoi(['play_part([1, 2, 3, 5, 5, 6, 5, 8])'], ['play_part([1, 1, 1, 3])']),
      loiGiai: baiDoi(['play_part([1, 2, 3, 5, 5, 6, 5, 8])'], ['play_part([1, 1, 1, 3, 3, 4, 3, 5])']),
      loiSai: [
        { moTa: 'R2 chỉ phát 4 nốt đầu: chưa đủ 8 nốt của bè 2 trên 3 sân', baiLam: baiDoi(['play_part([1, 2, 3, 5, 5, 6, 5, 8])'], ['play_part([1, 1, 1, 3])']), phaiCoMa: ['lo-nhip'] }
      ],
      sao: { o: 6, nhip: 24 },
      goiY: ['Điền đủ danh sách [1, 1, 1, 3, 3, 4, 3, 5] vào lệnh play_part(...) của R2.']
    }),

    // ==================== CHƯƠNG 2: lap-clb (10 màn) ====================
    manCLB('lap-clb', 1, 'lam-quen', {
      ten: 'Lắp đặt dây chuyền liên hợp Khuôn viên CLB',
      chiChay: true, chinhCoDinh: true, vo: 'hang-dong', r1: R_GAI, r2: R_BANH,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'cave_team_clear', 'grab_clear'],
      deBai: 'Sang Chương 2, đội robot lắp đặt hệ thống tự động cho toàn Khuôn viên CLB! R2 (xe hai bánh Mùa 1) gọi grab_clear() dọn đá tảng, trong khi R1 (bánh gai Mùa 8) dùng từ điển d = {4: 7} và hàm cave_team_clear(2, d) giải mã sóng âm đàn dơi, phá nhũ đá cộng hưởng và trượt qua sàn đá ướt về cờ. Bấm Chạy thử để xem!',
      san: [
        '#########',
        '#.o..I.F#',
        '##.######',
        '##F######',
        '#########'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 2, huong: 0 }],
      r1Them: { co: [{ x: 7, y: 1 }] }, r2Them: { co: [{ x: 2, y: 3 }] },
      danDoi: [{ x: 3, y: 1, not: 4 }],
      daChuong: [{ x: 4, y: 1, not: 7 }],
      maMau: baiDoi(['d = {4: 7}', 'cave_team_clear(2, d)'], ['grab_clear()']),
      loiGiai: baiDoi(['d = {4: 7}', 'cave_team_clear(2, d)'], ['grab_clear()']),
      sao: { o: 33, nhip: 8 },
      goiY: ['Màn trình diễn: bấm Chạy thử để xem R1 và R2 vận hành dây chuyền tự động của CLB.']
    }),

    manCLB('lap-clb', 2, 'lam-quen', {
      ten: 'Chế hàm: Xích phun van mở cổng rồi lùi về vị trí trực',
      taoHam: ['clb_spray_open'], vo: 'nha-may', r1: R_GAI, r2: R_XICH,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'valve_step', 'back', 'bat_dict_crack'],
      deBai: 'Ở trạm trực CLB, R2 (xe xích Mùa 2) cần phun van N mở cửa C cho đồng đội, tiến n ô kiểm tra rồi lùi 1 ô về phía cờ trực. Hãy viết hàm clb_spray_open(n): gọi valve_step(n) rồi gọi back(). Áp dụng clb_spray_open(1) kèm back() cho R2 khi R1 gọi bat_dict_crack(d) giải mã sóng âm đàn dơi.',
      san: [
        '########',
        '#..C..F#',
        '#.####.#',
        '#F..N..#',
        '########'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 3, huong: 1 }],
      r1Them: { co: [{ x: 6, y: 1 }] }, r2Them: { co: [{ x: 1, y: 3 }] },
      noi: [{ nut: { x: 4, y: 3 }, cua: [{ x: 3, y: 1 }] }],
      danDoi: [{ x: 4, y: 1, not: 2 }],
      daChuong: [{ x: 5, y: 1, not: 5 }],
      maMau: baiDoi(['d = {2: 5}', 'bat_dict_crack(d)', 'move()'], ['clb_spray_open(1)', 'back()'], [ham('clb_spray_open', [], ['n'])]),
      loiGiai: baiDoi(['d = {2: 5}', 'bat_dict_crack(d)', 'move()'], ['clb_spray_open(1)', 'back()'], [], [ham('clb_spray_open', ['valve_step(n)', 'back()'], ['n'])]),
      loiSai: [
        { moTa: 'Để trống clb_spray_open(n): cửa C không mở', baiLam: baiDoi(['d = {2: 5}', 'bat_dict_crack(d)', 'move()'], ['clb_spray_open(1)', 'back()'], [ham('clb_spray_open', [], ['n'])]), phaiCoMa: ['loi-cu-phap'] },
        { moTa: 'Quên back() trong clb_spray_open(n): R2 chỉ lùi tới (2, 3) chưa về cờ (1, 3)', baiLam: baiDoi(['d = {2: 5}', 'bat_dict_crack(d)', 'move()'], ['clb_spray_open(1)', 'back()'], [], [ham('clb_spray_open', ['valve_step(n)'], ['n'])]), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 25, nhip: 6 },
      goiY: ['Trong thân hàm clb_spray_open(n), viết 2 dòng: valve_step(n) và back().', 'valve_step(1) phun nhẹ tầm 2 trúng van N(4, 3), tiến lên (3, 3), rồi back() lùi về (2, 3) trước khi lùi tiếp vào cờ (1, 3).']
    }),

    manCLB('lap-clb', 3, 'lam-quen', {
      ten: 'Vận hành trạm van kép mở lối cho bánh gai lướt đá ướt',
      vo: 'hang-dong', r1: R_GAI, r2: R_XICH,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'clb_spray_open', 'echo_glide_pass'],
      deBai: 'R2 gọi clb_spray_open(1) để bắn van N(4, 3) mở cửa C(2, 1) rồi lùi về cờ trực (2, 3). R1 gọi echo_glide_pass(1) để chờ cửa mở, tiến tới đàn dơi (3, 1), phá nhũ đá (4, 1) và thu gai trượt qua đá vôi ướt I tới cờ (6, 1).',
      san: [
        '########',
        '#.C.I.F#',
        '#.####.#',
        '#.F.N..#',
        '########'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 3, huong: 1 }],
      r1Them: { co: [{ x: 6, y: 1 }] }, r2Them: { co: [{ x: 2, y: 3 }] },
      noi: [{ nut: { x: 4, y: 3 }, cua: [{ x: 2, y: 1 }] }],
      danDoi: [{ x: 3, y: 1, not: 6 }],
      daChuong: [{ x: 4, y: 1, not: 6 }],
      maMau: baiDoi(['echo_glide_pass(1)'], ['move()']),
      loiGiai: baiDoi(['echo_glide_pass(1)'], ['clb_spray_open(1)']),
      loiSai: [
        { moTa: 'R2 chưa gọi clb_spray_open(1): cửa C đóng chặn R1', baiLam: baiDoi(['echo_glide_pass(1)'], ['move()']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 27, nhip: 6 },
      goiY: ['Thay move() của R2 bằng clb_spray_open(1) để R2 bắn van N(4, 3) mở cửa C và lùi về cờ (2, 3).']
    }),

    manCLB('lap-clb', 4, 'cung-co', {
      ten: 'Chế hàm: Nhện kéo lõi sắt đè công tắc giữ cổng CLB',
      taoHam: ['clb_magnet_hold'], vo: 'bai-tai-che', r1: R_GAI, r2: R_NHEN,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'pull_s', 'bat_wait_crack'],
      deBai: 'Để R2 (nhện từ tính Mùa 3) tự động bước lên khối sắt trước mặt, hút sắt kéo sang phải 1 ô đè lên công tắc M rồi nhả nam châm, hãy viết hàm clb_magnet_hold(): gọi go_right(), pull_s(), go_right(), magnet_off(), wait(). Sau đó R2 gọi thêm go_right() về cờ, giúp R1 gọi bat_wait_crack(5) và move() về đích.',
      san: [
        '########',
        '#.C...F#',
        '#.####.#',
        '#..oMF.#',
        '########'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 3, huong: 1 }],
      r1Them: { co: [{ x: 6, y: 1 }] }, r2Them: { co: [{ x: 5, y: 3 }] },
      vatChat: ['........', '........', '........', '...s....', '........'],
      noi: [{ nut: { x: 4, y: 3 }, cua: [{ x: 2, y: 1 }] }],
      danDoi: [{ x: 3, y: 1, not: 5 }],
      daChuong: [{ x: 4, y: 1, not: 5 }],
      ngachHang: [{ a: { x: 5, y: 1 }, b: { x: 6, y: 1 } }],
      maMau: baiDoi(['bat_wait_crack(5)', 'move()'], ['clb_magnet_hold()', 'go_right()'], [ham('clb_magnet_hold', [], [])]),
      loiGiai: baiDoi(['bat_wait_crack(5)', 'move()'], ['clb_magnet_hold()', 'go_right()'], [], [ham('clb_magnet_hold', ['go_right()', 'pull_s()', 'go_right()', 'magnet_off()', 'wait()'], [])]),
      loiSai: [
        { moTa: 'Để trống clb_magnet_hold(): R2 không kéo sắt đè nút M nên cửa C đóng', baiLam: baiDoi(['bat_wait_crack(5)', 'move()'], ['clb_magnet_hold()', 'go_right()'], [ham('clb_magnet_hold', [], [])]), phaiCoMa: ['loi-cu-phap'] },
        { moTa: 'Quên go_right() thứ hai trong clb_magnet_hold(): sắt chưa tới nút M nên cửa C đóng', baiLam: baiDoi(['bat_wait_crack(5)', 'move()'], ['clb_magnet_hold()', 'go_right()'], [], [ham('clb_magnet_hold', ['go_right()', 'pull_s()', 'magnet_off()', 'wait()'], [])]), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 26, nhip: 10 },
      goiY: ['Trong thân hàm clb_magnet_hold(), viết 5 dòng: go_right(), pull_s(), go_right(), magnet_off(), wait().']
    }),

    manCLB('lap-clb', 5, 'cung-co', {
      ten: 'Giữ công tắc từ tính cho bánh gai lọc sóng âm đàn dơi',
      vo: 'hang-dong', r1: R_GAI, r2: R_NHEN,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'clb_magnet_hold', 'bat_set_march'],
      deBai: 'R2 gọi clb_magnet_hold() và go_right() để đặt khối sắt giữ công tắc M(4, 3) mở cửa C(2, 1). R1 khởi tạo s = set(), chờ 5 nhịp, tiến 2 ô qua cửa C tới (3, 1), rồi gọi bat_set_march(s, 3) và move() để lọc sóng âm đàn dơi phá 2 nhũ đá về cờ!',
      san: [
        '#########',
        '#.C....F#',
        '#.#####.#',
        '#..oMF..#',
        '#########'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 3, huong: 1 }],
      r1Them: { co: [{ x: 7, y: 1 }] }, r2Them: { co: [{ x: 5, y: 3 }] },
      vatChat: ['.........', '.........', '.........', '...s.....', '.........'],
      noi: [{ nut: { x: 4, y: 3 }, cua: [{ x: 2, y: 1 }] }],
      danDoi: [{ x: 3, y: 1, not: 3, phamVi: 1 }, { x: 4, y: 1, not: 3, phamVi: 1 }, { x: 5, y: 1, not: 8, phamVi: 1 }],
      daChuong: [{ x: 4, y: 1, not: 3 }, { x: 6, y: 1, not: 8 }],
      maMau: baiDoi(['s = set()', 'wait_n(5)', 'forward(2)', 'bat_set_march(s, 3)', 'move()'], ['go_right()']),
      loiGiai: baiDoi(['s = set()', 'wait_n(5)', 'forward(2)', 'bat_set_march(s, 3)', 'move()'], ['clb_magnet_hold()', 'go_right()']),
      loiSai: [
        { moTa: 'R2 chưa gọi clb_magnet_hold(): cửa C đóng chặn R1', baiLam: baiDoi(['s = set()', 'wait_n(5)', 'forward(2)', 'bat_set_march(s, 3)', 'move()'], ['go_right()']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 30, nhip: 13 },
      goiY: ['Ở chương trình R2, gọi clb_magnet_hold() trước go_right() để giữ mở cửa C(2, 1) cho R1.']
    }),

    manCLB('lap-clb', 6, 'cung-co', {
      ten: 'Chế hàm: Omni quét radar hất cầu đá rồi trượt thêm',
      taoHam: ['clb_lob_bridge'], vo: 'mo-da', r1: R_GAI, r2: R_OMNI,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'radar_front_lob', 'slide_r', 'echo_glide_pass'],
      deBai: 'Để R2 (xe omni Mùa 7) dùng radar kiểm tra, hất đá tròn xa n ô lấp hố giúp R1 rồi trượt sang phải thêm 1 ô nữa vào cờ xa, hãy viết hàm clb_lob_bridge(n): gọi radar_front_lob(n) rồi gọi slide_r(1). Dùng clb_lob_bridge(3) cho R2 khi R1 gọi echo_glide_pass(2).',
      san: [
        '########',
        '#.u.I.F#',
        '##=#####',
        '##o#####',
        '#...F###',
        '########'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 4, huong: 0 }],
      r1Them: { co: [{ x: 6, y: 1 }] }, r2Them: { co: [{ x: 4, y: 4 }] },
      vatDang: ['........', '........', '........', '..r.....', '........', '........'],
      danDoi: [{ x: 3, y: 1, not: 4 }],
      daChuong: [{ x: 4, y: 1, not: 4 }],
      maMau: baiDoi(['echo_glide_pass(2)'], ['clb_lob_bridge(3)'], [ham('clb_lob_bridge', [], ['n'])]),
      loiGiai: baiDoi(['echo_glide_pass(2)'], ['clb_lob_bridge(3)'], [], [ham('clb_lob_bridge', ['radar_front_lob(n)', 'slide_r(1)'], ['n'])]),
      loiSai: [
        { moTa: 'Để trống clb_lob_bridge(n): R2 không lấp hố, R1 rơi xuống hố', baiLam: baiDoi(['echo_glide_pass(2)'], ['clb_lob_bridge(3)'], [ham('clb_lob_bridge', [], ['n'])]), phaiCoMa: ['loi-cu-phap'] },
        { moTa: 'Quên slide_r(1) trong clb_lob_bridge(n): R2 dừng ở (3, 4) chưa tới cờ (4, 4)', baiLam: baiDoi(['echo_glide_pass(2)'], ['clb_lob_bridge(3)'], [], [ham('clb_lob_bridge', ['radar_front_lob(n)'], ['n'])]), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 36, nhip: 7 },
      goiY: ['Trong thân hàm clb_lob_bridge(n), viết 2 dòng: radar_front_lob(n) và slide_r(1).']
    }),

    manCLB('lap-clb', 7, 'cung-co', {
      ten: 'Bắc cầu đá cho bánh gai giải mã sóng âm dơi trượt sàn ướt',
      vo: 'hang-dong', r1: R_GAI, r2: R_OMNI,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'clb_lob_bridge', 'cave_team_clear'],
      deBai: 'R2 gọi clb_lob_bridge(3) để hất đá tròn lấp hố u(2, 1) và trượt về cờ (4, 4). R1 khai báo từ điển d = {5: 8} và gọi cave_team_clear(2, d) để chờ cầu đá, giải mã sóng âm đàn dơi (3, 1), phá nhũ đá (4, 1) rồi trượt qua đá ướt I(5, 1) vào cờ (7, 1)!',
      san: [
        '#########',
        '#.u..I.F#',
        '##=######',
        '##o######',
        '#...F####',
        '#########'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 4, huong: 0 }],
      r1Them: { co: [{ x: 7, y: 1 }] }, r2Them: { co: [{ x: 4, y: 4 }] },
      vatDang: ['.........', '.........', '.........', '..r......', '.........', '.........'],
      danDoi: [{ x: 3, y: 1, not: 5 }],
      daChuong: [{ x: 4, y: 1, not: 8 }],
      maMau: baiDoi(['d = {5: 8}', 'cave_team_clear(2, d)'], ['slide_r(1)']),
      loiGiai: baiDoi(['d = {5: 8}', 'cave_team_clear(2, d)'], ['clb_lob_bridge(3)']),
      loiSai: [
        { moTa: 'R2 chưa gọi clb_lob_bridge(3): hố u(2, 1) chưa được lấp nên R1 rơi xuống hố', baiLam: baiDoi(['d = {5: 8}', 'cave_team_clear(2, d)'], ['slide_r(1)']), phaiCoMa: ['roi-ho', 'chua-toi-co'] }
      ],
      sao: { o: 38, nhip: 8 },
      goiY: ['Thay slide_r(1) của R2 bằng clb_lob_bridge(3) để R2 lấp hố u(2, 1) và trượt về cờ (4, 4).']
    }),

    manCLB('lap-clb', 8, 'cung-co', {
      ten: 'Chế hàm: Đợi đồng đội mở cổng rồi giải mã sóng âm tiến bước',
      taoHam: ['clb_sonic_clear'], vo: 'hang-dong', r1: R_GAI, r2: R_XICH,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'bat_dict_crack', 'clb_spray_open'],
      deBai: 'Để R1 chờ w nhịp cho đồng đội mở cổng, sau đó gọi bat_dict_crack(d) giải mã sóng âm đàn dơi phá nhũ đá và tiến thêm 1 ô vào đích, hãy viết hàm clb_sonic_clear(w, d): gọi wait_n(w), gọi bat_dict_crack(d), rồi gọi move(). Dùng clb_sonic_clear(1, d) cho R1 khi R2 gọi clb_spray_open(1).',
      san: [
        '########',
        '#.C...F#',
        '#.####.#',
        '#.F.N..#',
        '########'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 3, huong: 1 }],
      r1Them: { co: [{ x: 6, y: 1 }] }, r2Them: { co: [{ x: 2, y: 3 }] },
      noi: [{ nut: { x: 4, y: 3 }, cua: [{ x: 2, y: 1 }] }],
      danDoi: [{ x: 3, y: 1, not: 3 }],
      daChuong: [{ x: 4, y: 1, not: 7 }],
      ngachHang: [{ a: { x: 5, y: 1 }, b: { x: 6, y: 1 } }],
      maMau: baiDoi(['d = {3: 7}', 'clb_sonic_clear(1, d)'], ['clb_spray_open(1)'], [ham('clb_sonic_clear', [], ['w', 'd'])]),
      loiGiai: baiDoi(['d = {3: 7}', 'clb_sonic_clear(1, d)'], ['clb_spray_open(1)'], [], [ham('clb_sonic_clear', ['wait_n(w)', 'bat_dict_crack(d)', 'move()'], ['w', 'd'])]),
      loiSai: [
        { moTa: 'Để trống clb_sonic_clear(w, d): R1 đứng yên tại chỗ', baiLam: baiDoi(['d = {3: 7}', 'clb_sonic_clear(1, d)'], ['clb_spray_open(1)'], [ham('clb_sonic_clear', [], ['w', 'd'])]), phaiCoMa: ['loi-cu-phap'] },
        { moTa: 'Quên move() cuối hàm clb_sonic_clear(w, d): R1 dừng ở (4, 1) chưa vào ngách hang', baiLam: baiDoi(['d = {3: 7}', 'clb_sonic_clear(1, d)'], ['clb_spray_open(1)'], [], [ham('clb_sonic_clear', ['wait_n(w)', 'bat_dict_crack(d)'], ['w', 'd'])]), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 25, nhip: 6 },
      goiY: ['Trong thân hàm clb_sonic_clear(w, d), viết 3 dòng: wait_n(w), bat_dict_crack(d) và move().']
    }),

    manCLB('lap-clb', 9, 'on-tap', {
      ten: 'Tổng duyệt dây chuyền liên hoàn Khuôn viên CLB',
      vo: 'hang-dong', r1: R_GAI, r2: R_NHEN,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'clb_sonic_clear', 'echo_glide_pass', 'clb_magnet_hold'],
      deBai: 'Cửa ải cuối cùng để hoàn thiện Khuôn viên CLB! R2 (nhện từ tính) gọi clb_magnet_hold() và go_right() để giữ mở cửa C(2, 1). R1 khai báo d = {2: 6}, gọi clb_sonic_clear(5, d) để qua cửa, giải mã đàn dơi thứ nhất (3, 1), phá nhũ đá (4, 1) và tiến lên (5, 1), rồi gọi echo_glide_pass(1) phá nhũ đá thứ hai (7, 1) và trượt qua đá ướt I vào cờ (9, 1)!',
      san: [
        '###########',
        '#.C....I.F#',
        '#.#######.#',
        '#..oMF....#',
        '###########'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 3, huong: 1 }],
      r1Them: { co: [{ x: 9, y: 1 }] }, r2Them: { co: [{ x: 5, y: 3 }] },
      vatChat: ['...........', '...........', '...........', '...s.......', '...........'],
      noi: [{ nut: { x: 4, y: 3 }, cua: [{ x: 2, y: 1 }] }],
      danDoi: [{ x: 3, y: 1, not: 2 }, { x: 6, y: 1, not: 8 }],
      daChuong: [{ x: 4, y: 1, not: 6 }, { x: 7, y: 1, not: 8 }],
      maMau: baiDoi(['d = {2: 6}', 'clb_sonic_clear(5, d)'], ['clb_magnet_hold()', 'go_right()']),
      loiGiai: baiDoi(['d = {2: 6}', 'clb_sonic_clear(5, d)', 'echo_glide_pass(1)'], ['clb_magnet_hold()', 'go_right()']),
      loiSai: [
        { moTa: 'R1 quên gọi echo_glide_pass(1) ở chặng cuối: dừng ở (5, 1)', baiLam: baiDoi(['d = {2: 6}', 'clb_sonic_clear(5, d)'], ['clb_magnet_hold()', 'go_right()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 37, nhip: 15 },
      goiY: ['Sau clb_sonic_clear(5, d), R1 đang đứng ở (5, 1) ngay trước đàn dơi thứ hai (6, 1).', 'Thêm echo_glide_pass(1) vào chương trình R1 để phá nhũ đá (7, 1) và trượt qua đá ướt I vào cờ (9, 1).']
    }),

    manCLB('lap-clb', 10, 'trum', {
      ten: 'Trùm Chương 2: Khúc dạo đầu Ngày hội CLB Sáng Tạo',
      r1: R_GAI, r2: R2_LOA, mucTieu: 'choi-dieu', nhipTheo: 'tong',
      hamCuaEmCan: ['play_note', 'play_part'],
      deBai: 'Toàn bộ Khuôn viên CLB Sáng Tạo đã sẵn sàng đón Ngày hội! Qua 3 sân khấu liên tiếp, R1 và R2 cùng hợp tấu 2 bè mở màn Ngày hội:\n- Bè 1 (R1): [3, 5, 6, 8, 8, 6, 5, 8]\n- Bè 2 (R2): [1, 3, 4, 5, 5, 4, 3, 5]\nHãy dùng play_part(notes) cho cả hai robot.',
      san: SAN_DUET_3,
      bd: [{ x: 2, y: 1, huong: 1 }, { x: 2, y: 2, huong: 1 }],
      dieu: { r1: '35688658', r2: '13455435' },
      maMau: baiDoi(['play_part([3, 5, 6, 8, 8, 6, 5, 8])'], ['play_part([1, 3, 4, 5])']),
      loiGiai: baiDoi(['play_part([3, 5, 6, 8, 8, 6, 5, 8])'], ['play_part([1, 3, 4, 5, 5, 4, 3, 5])']),
      loiSai: [
        { moTa: 'R2 chỉ phát 4 nốt đầu: chưa hoàn thành bè 2 trên 3 sân', baiLam: baiDoi(['play_part([3, 5, 6, 8, 8, 6, 5, 8])'], ['play_part([1, 3, 4, 5])']), phaiCoMa: ['lo-nhip'] }
      ],
      sao: { o: 6, nhip: 24 },
      goiY: ['Truyền đủ danh sách [1, 3, 4, 5, 5, 4, 3, 5] vào lệnh play_part(...) của R2.']
    })
  ];
})();
