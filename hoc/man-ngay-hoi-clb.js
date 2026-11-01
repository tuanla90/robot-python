/* ============================================================================
   man-ngay-hoi-clb.js — Mùa 9 CLB Sáng Tạo · Gói 10: Ngày hội Chấn Hưng
   20 màn (2 chương × 10):
   - Chương 1 (tong-hop-clb): Tổng duyệt ngày hội (10 màn 3 sân, nhipTheo: 'tong')
   - Chương 2 (trum-mua-clb): Bản giao hưởng Chấn Hưng (10 màn 3 sân, nhipTheo: 'tong')
   Khép lại trọn bộ 9 mùa (1.800 màn) Đội Robot Chấn Hưng.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = typeof module !== 'undefined' && module.exports;
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var HAM_BANH = BANH.concat(['arm_down', 'arm_up', 'arm_left', 'arm_right', 'grab', 'release', 'front_clear', 'left_clear', 'right_clear']);
  var HAM_XICH = BANH.concat(['spray', 'spray_back', 'distance', 'warm']);
  var HAM_XICH_LOA = BANH.concat(['beat', 'note', 'distance', 'warm']);
  var HAM_NHEN = ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'crouch', 'stand', 'magnet_n', 'magnet_s', 'magnet_off', 'front_metal', 'front_pole'];
  var HAM_CAU = ['swing_left', 'swing_right', 'extend', 'retract', 'pick_up', 'set_down', 'pick_up2', 'read_code', 'weight', 'rail', 'wait'];
  var HAM_XUONG = BANH.concat(['anchor', 'unanchor', 'tow', 'drop_tow', 'tether', 'untether', 'flow', 'flow_dir']);
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

  function ba(v) { return [v, v, v]; }
  function doi3(x, y, n1, n2, n3, them) {
    return [n1, n2, n3].map(function (n) {
      return [Object.assign({ x: x, y: y, not: n }, them || {})];
    });
  }
  function cap3(x1, y1, a1, a2, a3, x2, y2, b1, b2, b3) {
    var a = [a1, a2, a3], b = [b1, b2, b3];
    return [0, 1, 2].map(function (i) {
      return [{ x: x1, y: y1, not: a[i] }, { x: x2, y: y2, not: b[i] }];
    });
  }
  function ham(ten, than, thamSo) { return { ten: ten, thamSo: thamSo || [], than: than }; }
  function baiDoi(r1, r2, hm, moi) {
    var kq = { doi: [{ chinh: r1 }, { chinh: r2 }], hamCuaMan: hm || [] };
    if (moi) kq.hamCuaEmMoi = moi;
    return kq;
  }
  function xe(mau, bd, them) { return Object.assign({}, JSON.parse(JSON.stringify(mau)), { batDau: bd }, them || {}); }

  function manNH(chuong, so, hang, p) {
    var r1 = xe(p.r1 || R_GAI, p.bd[0], p.r1Them);
    var r2 = xe(p.r2 || R_OMNI, p.bd[1], p.r2Them);
    var san3 = Array.isArray(p.san[0]) ? p.san : ba(p.san);
    var kq = {
      chuong: chuong, so: so, ten: p.ten, hang: hang,
      vo: p.vo || 'hang-dong', loaiRobot: r1.loaiRobot, robot: r1.robot, hamGoc: r1.hamGoc,
      daLapHo: true, nhipTheo: 'tong',
      mucTieu: p.mucTieu || 'toi-co',
      deBai: p.deBai, san: san3,
      batDau: p.bd[0], doi: [r1, r2],
      khung: p.khung || { chinh: 10, moiHam: 8 },
      cauTruc: ['for', 'if', 'while', 'list', 'dict', 'set', 'tuple'],
      vaHoac: true, moXuong: true, camHamCuaEm: false, bienDem: true, nhipTheoLoiGiai: true,
      taoHam: p.taoHam || [],
      hamCuaEmCan: p.hamCuaEmCan || [],
      maMau: p.maMau, loiGiai: p.loiGiai, loiSai: p.loiSai || [],
      sao: p.sao || { o: 24, nhip: 24 }, goiY: p.goiY
    };
    ['thuGai', 'phatNot', 'phanAm', 'omniCheo', 'chinhLuc', 'nhanDang', 'tamNemMacDinh', 'xichDay', 'lucBan'].forEach(function (k) {
      if (r1[k] !== undefined) kq[k] = r1[k];
    });
    if (r1.loaiRobot === 'cau') kq.taiToiDa = 6;
    ['chiChay', 'chinhCoDinh', 'vatCan', 'dieu', 'danDoi', 'daChuong', 'ngachHang'].forEach(function (k) {
      if (p[k] !== undefined) kq[k] = p[k];
    });
    ['noi', 'cuaNhip', 'mau', 'vatMau', 'vatChat', 'vatDang', 'vatThem', 'hinh', 'dong', 'chong', 'tau', 'giao'].forEach(function (k) {
      if (p[k] !== undefined) kq[k] = ba(p[k]);
    });
    return ManHoc.chuanHoa(kq);
  }

  ManHoc.manNgayHoiClb = [
    // ==================== CHƯƠNG 1: tong-hop-clb (10 màn, 3 sân) ====================
    manNH('tong-hop-clb', 1, 'lam-quen', {
      ten: 'Tổng duyệt khai màn Ngày hội Chấn Hưng',
      chiChay: true, chinhCoDinh: true, vo: 'hang-dong', r1: R_GAI, r2: R_BANH,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'grab_clear', 'bat_wait_crack'],
      deBai: 'Chào mừng đến Gói 10: Ngày hội Chấn Hưng! Mọi màn trong gói này đều diễn ra qua 3 ca tổng duyệt liên tiếp (3 sân). R2 (xe hai bánh Mùa 1) gọi grab_clear() dọn đá tảng o(2, 1) lùi về cờ (2, 3), trong khi R1 (bánh gai Mùa 8) gọi bat_wait_crack(2) và move() lắng nghe đàn dơi phát sóng âm định vị để phá nhũ đá cộng hưởng trên cả 3 sân. Bấm Chạy thử để quan sát!',
      san: [
        '#######',
        '#.o..F#',
        '##.####',
        '##F####',
        '#######'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 2, huong: 0 }],
      r1Them: { co: [{ x: 5, y: 1 }] }, r2Them: { co: [{ x: 2, y: 3 }] },
      danDoi: doi3(3, 1, 3, 5, 7),
      daChuong: doi3(4, 1, 3, 5, 7),
      maMau: baiDoi(['bat_wait_crack(2)', 'move()'], ['grab_clear()']),
      loiGiai: baiDoi(['bat_wait_crack(2)', 'move()'], ['grab_clear()']),
      sao: { o: 28, nhip: 21 },
      goiY: ['Màn trình diễn 3 sân: bấm Chạy thử để xem R1 và R2 phối hợp qua cả 3 ca tổng duyệt.']
    }),

    manNH('tong-hop-clb', 2, 'lam-quen', {
      ten: 'Chế hàm: Chờ mở cổng rồi nghe dơi phá đá tiến bước',
      taoHam: ['fest_echo_step'], vo: 'nha-may', r1: R_GAI, r2: R_XICH,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'bat_wait_crack', 'clb_spray_open', 'back'],
      deBai: 'Để R1 chờ w nhịp cho đồng đội mở cổng rồi tự động nghe đàn dơi phá nhũ đá và tiến thêm 1 ô vào ngách hang qua cả 3 sân, hãy viết hàm fest_echo_step(w): gọi bat_wait_crack(w) rồi gọi move(). Dùng fest_echo_step(1) cho R1 khi R2 gọi clb_spray_open(1) và back().',
      san: [
        '########',
        '#.C...F#',
        '#.####.#',
        '#F..N..#',
        '########'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 3, huong: 1 }],
      r1Them: { co: [{ x: 6, y: 1 }] }, r2Them: { co: [{ x: 1, y: 3 }] },
      noi: [{ nut: { x: 4, y: 3 }, cua: [{ x: 2, y: 1 }] }],
      danDoi: doi3(3, 1, 2, 4, 6),
      daChuong: doi3(4, 1, 2, 4, 6),
      ngachHang: [{ a: { x: 5, y: 1 }, b: { x: 6, y: 1 } }],
      maMau: baiDoi(['fest_echo_step(1)'], ['clb_spray_open(1)', 'back()'], [ham('fest_echo_step', [], ['w'])]),
      loiGiai: baiDoi(['fest_echo_step(1)'], ['clb_spray_open(1)', 'back()'], [], [ham('fest_echo_step', ['bat_wait_crack(w)', 'move()'], ['w'])]),
      loiSai: [
        { moTa: 'Để trống fest_echo_step(w): R1 đứng yên tại chỗ', baiLam: baiDoi(['fest_echo_step(1)'], ['clb_spray_open(1)', 'back()'], [ham('fest_echo_step', [], ['w'])]), phaiCoMa: ['loi-cu-phap'] },
        { moTa: 'Quên move() trong fest_echo_step(w): R1 dừng ở (4, 1) chưa vào ngách hang (5, 1)', baiLam: baiDoi(['fest_echo_step(1)'], ['clb_spray_open(1)', 'back()'], [], [ham('fest_echo_step', ['bat_wait_crack(w)'], ['w'])]), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 29, nhip: 18 },
      goiY: ['Trong thân hàm fest_echo_step(w), viết 2 dòng: bat_wait_crack(w) và move().']
    }),

    manNH('tong-hop-clb', 3, 'lam-quen', {
      ten: 'Nhện từ tính giữ cổng cho bánh gai vượt ngách 3 ca',
      vo: 'bai-tai-che', r1: R_GAI, r2: R_NHEN,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'fest_echo_step', 'clb_magnet_hold'],
      deBai: 'Qua 3 ca tổng duyệt ở khu tái chế, R2 (nhện từ tính Mùa 3) gọi clb_magnet_hold() và go_right() để kéo khối sắt đè lên nút M(4, 3), giữ mở cửa C(2, 1). Hãy lập trình cho R1 gọi fest_echo_step(5) để chờ cửa mở, nghe đàn dơi phá nhũ đá cộng hưởng và bước vào ngách hang tới cờ!',
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
      danDoi: doi3(3, 1, 4, 6, 8),
      daChuong: doi3(4, 1, 4, 6, 8),
      ngachHang: [{ a: { x: 5, y: 1 }, b: { x: 6, y: 1 } }],
      maMau: baiDoi(['wait_n(5)'], ['clb_magnet_hold()', 'go_right()']),
      loiGiai: baiDoi(['fest_echo_step(5)'], ['clb_magnet_hold()', 'go_right()']),
      loiSai: [
        { moTa: 'R1 mới chờ 5 nhịp mà chưa gọi fest_echo_step(5)', baiLam: baiDoi(['wait_n(5)'], ['clb_magnet_hold()', 'go_right()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 27, nhip: 30 },
      goiY: ['Thay wait_n(5) của R1 bằng fest_echo_step(5) để R1 chờ 5 nhịp rồi tự động phá nhũ đá tiến vào ngách hang.']
    }),

    manNH('tong-hop-clb', 4, 'cung-co', {
      ten: 'Chế hàm: Giải mã sóng âm đàn dơi rồi trượt đá ướt',
      taoHam: ['fest_dict_glide'], vo: 'mo-da', r1: R_GAI, r2: R_OMNI,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'clb_sonic_clear', 'glide_tunnel', 'clb_lob_bridge'],
      deBai: 'Ở 3 sân khấu đá vôi, đàn dơi tại (3, 1) lần lượt phát nốt 2, 4, 6 ứng với nhũ đá cộng hưởng nốt 5, 7, 8 tại (4, 1), tiếp theo là thềm đá vôi ướt I(6, 1). Hãy viết hàm fest_dict_glide(w, d): gọi clb_sonic_clear(w, d) rồi gọi glide_tunnel(). Dùng fest_dict_glide(2, d) với d = {2: 5, 4: 7, 6: 8} khi R2 gọi clb_lob_bridge(3).',
      san: [
        '##########',
        '#.u...I.F#',
        '##=#######',
        '##o#######',
        '#...F#####',
        '##########'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 4, huong: 0 }],
      r1Them: { co: [{ x: 8, y: 1 }] }, r2Them: { co: [{ x: 4, y: 4 }] },
      vatDang: ['..........', '..........', '..........', '..r.......', '..........', '..........'],
      danDoi: doi3(3, 1, 2, 4, 6),
      daChuong: doi3(4, 1, 5, 7, 8),
      maMau: baiDoi(['d = {2: 5, 4: 7, 6: 8}', 'fest_dict_glide(2, d)'], ['clb_lob_bridge(3)'], [ham('fest_dict_glide', [], ['w', 'd'])]),
      loiGiai: baiDoi(['d = {2: 5, 4: 7, 6: 8}', 'fest_dict_glide(2, d)'], ['clb_lob_bridge(3)'], [], [ham('fest_dict_glide', ['clb_sonic_clear(w, d)', 'glide_tunnel()'], ['w', 'd'])]),
      loiSai: [
        { moTa: 'Để trống fest_dict_glide(w, d): R1 đứng yên tại chỗ', baiLam: baiDoi(['d = {2: 5, 4: 7, 6: 8}', 'fest_dict_glide(2, d)'], ['clb_lob_bridge(3)'], [ham('fest_dict_glide', [], ['w', 'd'])]), phaiCoMa: ['loi-cu-phap'] },
        { moTa: 'Quên glide_tunnel() trong fest_dict_glide(w, d): R1 dừng ở (5, 1) trước đá ướt I', baiLam: baiDoi(['d = {2: 5, 4: 7, 6: 8}', 'fest_dict_glide(2, d)'], ['clb_lob_bridge(3)'], [], [ham('fest_dict_glide', ['clb_sonic_clear(w, d)'], ['w', 'd'])]), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 40, nhip: 27 },
      goiY: ['Trong thân hàm fest_dict_glide(w, d), viết 2 dòng: clb_sonic_clear(w, d) và glide_tunnel().']
    }),

    manNH('tong-hop-clb', 5, 'cung-co', {
      ten: 'Cầu phao Ngày hội: Xuồng ghép cầu cho xe kho chuyển quà',
      vo: 'song', r1: R_XUONG, r2: R_BANH, mucTieu: 'dua-vat',
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'bridge_lay', 'pick', 'drop', 'turn_right'],
      deBai: 'Qua 3 lượt vận chuyển trên kênh Ngày hội, xuồng R1 (Mùa 5) ở (3, 2) gọi bridge_lay(1) kéo bè gỗ B(5, 2) về ghép cầu phao tại q(3, 2). Hãy lập trình cho R2 (xe hai bánh Mùa 1) ở (3, 1) chờ 2 nhịp, tiến 2 ô qua cầu phao nhặt kiện quà o(3, 4) rồi quay phải thả vào D(2, 3)!',
      san: ['#######', '#=..=.#', '#~~q~B#', '#.D...#', '#..o..#', '#######'],
      bd: [{ x: 3, y: 2, huong: 1 }, { x: 3, y: 1, huong: 2 }],
      maMau: baiDoi(['bridge_lay(1)'], ['wait_n(2)', 'forward(2)']),
      loiGiai: baiDoi(['bridge_lay(1)'], ['wait_n(2)', 'forward(2)', 'pick()', 'turn_right()', 'drop()']),
      loiSai: [
        { moTa: 'R2 mới qua cầu phao, chưa nhặt kiện quà o(3, 4) đặt vào D(2, 3)', baiLam: baiDoi(['bridge_lay(1)'], ['wait_n(2)', 'forward(2)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 37, nhip: 24 },
      goiY: ['Thêm pick(), turn_right(), drop() sau forward(2) ở chương trình của R2.']
    }),

    manNH('tong-hop-clb', 6, 'cung-co', {
      ten: 'Chế hàm: Chờ mở cổng rồi lọc sóng âm đàn dơi',
      taoHam: ['fest_set_pass'], vo: 'hang-dong', r1: R_GAI, r2: R_XICH,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'bat_set_march', 'clb_spray_open', 'back'],
      deBai: 'Để R1 chờ w nhịp cho cửa C(2, 1) mở, tiến 2 ô tới (3, 1), dùng tập hợp s lọc n ô sóng âm đàn dơi liên tiếp rồi bước vào cờ qua cả 3 sân, hãy viết hàm fest_set_pass(w, s, n): gọi wait_n(w), forward(2), bat_set_march(s, n) rồi move(). Dùng fest_set_pass(1, s, 3) cho R1 khi R2 gọi clb_spray_open(1) và back().',
      san: [
        '#########',
        '#.C....F#',
        '#.#####.#',
        '#F..N...#',
        '#########'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 3, huong: 1 }],
      r1Them: { co: [{ x: 7, y: 1 }] }, r2Them: { co: [{ x: 1, y: 3 }] },
      noi: [{ nut: { x: 4, y: 3 }, cua: [{ x: 2, y: 1 }] }],
      danDoi: [{ x: 3, y: 1, not: 4, phamVi: 1 }, { x: 4, y: 1, not: 4, phamVi: 1 }, { x: 5, y: 1, not: 7, phamVi: 1 }],
      daChuong: [{ x: 4, y: 1, not: 4 }, { x: 6, y: 1, not: 7 }],
      maMau: baiDoi(['s = set()', 'fest_set_pass(1, s, 3)'], ['clb_spray_open(1)', 'back()'], [ham('fest_set_pass', [], ['w', 's', 'n'])]),
      loiGiai: baiDoi(['s = set()', 'fest_set_pass(1, s, 3)'], ['clb_spray_open(1)', 'back()'], [], [ham('fest_set_pass', ['wait_n(w)', 'forward(2)', 'bat_set_march(s, n)', 'move()'], ['w', 's', 'n'])]),
      loiSai: [
        { moTa: 'Để trống fest_set_pass(w, s, n): R1 đứng yên tại chỗ', baiLam: baiDoi(['s = set()', 'fest_set_pass(1, s, 3)'], ['clb_spray_open(1)', 'back()'], [ham('fest_set_pass', [], ['w', 's', 'n'])]), phaiCoMa: ['loi-cu-phap'] },
        { moTa: 'Quên move() cuối hàm fest_set_pass(w, s, n): R1 dừng ở (6, 1) chưa tới cờ (7, 1)', baiLam: baiDoi(['s = set()', 'fest_set_pass(1, s, 3)'], ['clb_spray_open(1)', 'back()'], [], [ham('fest_set_pass', ['wait_n(w)', 'forward(2)', 'bat_set_march(s, n)'], ['w', 's', 'n'])]), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 33, nhip: 27 },
      goiY: ['Trong thân hàm fest_set_pass(w, s, n), viết 4 dòng: wait_n(w), forward(2), bat_set_march(s, n) và move().']
    }),

    manNH('tong-hop-clb', 7, 'cung-co', {
      ten: 'Bến cảng Ngày hội: Bánh gai mở ray cho cần cẩu đón tàu hoa',
      vo: 'cang-song', r1: R_CAU, r2: R_GAI, mucTieu: 'giao-tau',
      hamCuaEmCan: ['swing_by', 'play_note', 'move'],
      deBai: 'Tại Bến cảng Ngày hội qua 3 chuyến tàu liên tiếp, R2 (bánh gai Mùa 8) đứng ở (2, 3) trước khối nhũ đá cộng hưởng tại (3, 3) (nốt 3, 5, 7 theo từng sân). Hãy cho R2 gọi play_note(listen()) phá nhũ đá rồi move() sang (3, 3) nhường ray cho cần cẩu R1 (Mùa 4) giao kiện hàng 25 lên tàu!',
      san: SAN_CANG,
      bd: [{ x: 1, y: 3, nac: 4, tam: 1 }, { x: 2, y: 3, huong: 1 }],
      chong: [{ x: 1, y: 4, cont: [{ so: 25, tan: 1 }] }],
      daChuong: doi3(3, 3, 3, 5, 7, { ben: 1 }),
      tau: [{ o: [{ x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 }], co: 7, vang: 2 }],
      giao: [{ tau: 0, so: [25] }],
      maMau: baiDoi(['pick_up()', 'swing_by(4)', 'rail(1)', 'set_down()'], ['play_note(listen())']),
      loiGiai: baiDoi(['pick_up()', 'swing_by(4)', 'rail(1)', 'set_down()'], ['play_note(listen())', 'move()']),
      loiSai: [
        { moTa: 'R2 mới phá nhũ đá mà chưa gọi move() sang (3, 3) nhường ray cho R1', baiLam: baiDoi(['pick_up()', 'swing_by(4)', 'rail(1)', 'set_down()'], ['play_note(listen())']), phaiCoMa: ['het-ray'] }
      ],
      sao: { o: 17, nhip: 21 },
      goiY: ['Thêm move() sau play_note(listen()) ở chương trình của R2 để nhường ô ray (2, 3) cho R1.']
    }),

    manNH('tong-hop-clb', 8, 'cung-co', {
      ten: 'Chế hàm: Bánh gai lướt đá ướt giữ nút cho drone gieo hoa',
      taoHam: ['fest_duet_open'], vo: 'nong-trai', r1: R_GAI, r2: R_DRONE, mucTieu: 'to-hinh',
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'tunnel_crack_glide', 'span_sow'],
      deBai: 'Để R1 nghe đàn dơi phát sóng âm ở (3, 1), phá nhũ đá (4, 1), trượt qua đá ướt I lên đè nút M(5, 1) rồi đứng yên giữ cổng mở cho drone R2 (Mùa 6) bay qua gieo 3 luống hoa "red" trên cả 3 sân, hãy viết hàm fest_duet_open(): gọi tunnel_crack_glide() rồi gọi wait().',
      san: [
        '########',
        '#...IM.#',
        '########',
        '#.C....#',
        '########'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 3, huong: 1 }],
      hinh: ['........', '........', '........', '...rrr..', '........'],
      danDoi: doi3(3, 1, 3, 6, 8),
      daChuong: doi3(4, 1, 3, 6, 8),
      noi: [{ nut: { x: 5, y: 1 }, cua: [{ x: 2, y: 3 }] }],
      maMau: baiDoi(['fest_duet_open()'], ['wait_n(7)', 'go_right()', 'go_right()', 'span_sow("red", 3)'], [ham('fest_duet_open', [], [])]),
      loiGiai: baiDoi(['fest_duet_open()'], ['wait_n(7)', 'go_right()', 'go_right()', 'span_sow("red", 3)'], [], [ham('fest_duet_open', ['tunnel_crack_glide()', 'wait()'], [])]),
      loiSai: [
        { moTa: 'Để trống fest_duet_open(): R1 không mở được cửa C cho drone', baiLam: baiDoi(['fest_duet_open()'], ['wait_n(7)', 'go_right()', 'go_right()', 'span_sow("red", 3)'], [ham('fest_duet_open', [], [])]), phaiCoMa: ['loi-cu-phap'] },
        { moTa: 'Chỉ gọi go_echo() trong fest_duet_open(): R1 chưa phá nhũ đá và chưa đè nút M(5, 1)', baiLam: baiDoi(['fest_duet_open()'], ['wait_n(7)', 'go_right()', 'go_right()', 'span_sow("red", 3)'], [], [ham('fest_duet_open', ['go_echo()'], [])]), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 32, nhip: 33 },
      goiY: ['Trong thân hàm fest_duet_open(), viết 2 dòng: tunnel_crack_glide() và wait().']
    }),

    manNH('tong-hop-clb', 9, 'on-tap', {
      ten: 'Tổng duyệt đại cảnh: Nhện giữ cổng cho bánh gai giải mã trượt băng',
      vo: 'hang-dong', r1: R_GAI, r2: R_NHEN,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'fest_dict_glide', 'clb_magnet_hold'],
      deBai: 'Bài kiểm tra tổng hợp trước màn Trùm Chương 1! Qua 3 sân, R2 (nhện từ tính) gọi clb_magnet_hold() và go_right() để giữ mở cửa C(2, 1). R1 khai báo từ điển d = {2: 5, 4: 7, 6: 8} và gọi fest_dict_glide(5, d) để chờ cửa mở, giải mã sóng âm đàn dơi (3, 1), phá nhũ đá (4, 1) và trượt qua đá ướt I(6, 1) về cờ (8, 1)!',
      san: [
        '##########',
        '#.C...I.F#',
        '#.######.#',
        '#..oMF...#',
        '##########'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 3, huong: 1 }],
      r1Them: { co: [{ x: 8, y: 1 }] }, r2Them: { co: [{ x: 5, y: 3 }] },
      vatChat: ['..........', '..........', '..........', '...s......', '..........'],
      noi: [{ nut: { x: 4, y: 3 }, cua: [{ x: 2, y: 1 }] }],
      danDoi: doi3(3, 1, 2, 4, 6),
      daChuong: doi3(4, 1, 5, 7, 8),
      maMau: baiDoi(['d = {2: 5, 4: 7, 6: 8}', 'wait_n(5)'], ['clb_magnet_hold()', 'go_right()']),
      loiGiai: baiDoi(['d = {2: 5, 4: 7, 6: 8}', 'fest_dict_glide(5, d)'], ['clb_magnet_hold()', 'go_right()']),
      loiSai: [
        { moTa: 'R1 chưa gọi fest_dict_glide(5, d): dừng ở vị trí xuất phát', baiLam: baiDoi(['d = {2: 5, 4: 7, 6: 8}', 'wait_n(5)'], ['clb_magnet_hold()', 'go_right()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 33, nhip: 36 },
      goiY: ['Thay wait_n(5) của R1 bằng fest_dict_glide(5, d) để R1 hoàn thành hành trình trên cả 3 sân.']
    }),

    manNH('tong-hop-clb', 10, 'trum', {
      ten: 'Trùm Chương 1: Hòa tấu Tổng duyệt Ngày hội Chấn Hưng',
      r1: R_GAI, r2: R2_LOA, mucTieu: 'choi-dieu',
      hamCuaEmCan: ['play_note', 'play_part'],
      deBai: 'Buổi tổng duyệt Ngày hội Chấn Hưng khép lại bằng màn song tấu 2 bè vang dội qua 3 sân khấu:\n- Bè 1 (R1): [1, 3, 5, 6, 5, 6, 8, 8]\n- Bè 2 (R2): [1, 1, 3, 4, 3, 4, 5, 5]\nHãy dùng play_part(notes) cho cả hai robot.',
      san: SAN_DUET_3,
      bd: [{ x: 2, y: 1, huong: 1 }, { x: 2, y: 2, huong: 1 }],
      dieu: { r1: '13565688', r2: '11343455' },
      maMau: baiDoi(['play_part([1, 3, 5, 6, 5, 6, 8, 8])'], ['play_part([1, 1, 3, 4])']),
      loiGiai: baiDoi(['play_part([1, 3, 5, 6, 5, 6, 8, 8])'], ['play_part([1, 1, 3, 4, 3, 4, 5, 5])']),
      loiSai: [
        { moTa: 'R2 chỉ phát 4 nốt đầu: chưa đủ 8 nốt của bè 2 trên 3 sân', baiLam: baiDoi(['play_part([1, 3, 5, 6, 5, 6, 8, 8])'], ['play_part([1, 1, 3, 4])']), phaiCoMa: ['lo-nhip'] }
      ],
      sao: { o: 6, nhip: 24 },
      goiY: ['Điền đủ danh sách [1, 1, 3, 4, 3, 4, 5, 5] vào lệnh play_part(...) của R2.']
    }),

    // ==================== CHƯƠNG 2: trum-mua-clb (10 màn, 3 sân) ====================
    manNH('trum-mua-clb', 1, 'lam-quen', {
      ten: 'Khai màn Đêm hội Bản giao hưởng Chấn Hưng',
      chiChay: true, chinhCoDinh: true, vo: 'mo-da', r1: R_GAI, r2: R_OMNI,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'fest_dict_glide', 'clb_lob_bridge'],
      deBai: 'Đêm hội Bản giao hưởng Chấn Hưng chính thức bắt đầu! Qua 3 sân khấu liên tiếp, R2 (xe omni Mùa 7) gọi clb_lob_bridge(3) hất đá tròn lấp hố sụt u(2, 1) và trượt về cờ (4, 4), trong khi R1 (bánh gai Mùa 8) dùng từ điển d = {2: 5, 4: 7, 6: 8} và hàm fest_dict_glide(2, d) giải mã sóng âm đàn dơi, phá nhũ đá cộng hưởng và trượt qua sàn đá ướt về cờ (8, 1). Bấm Chạy thử để thưởng thức!',
      san: [
        '##########',
        '#.u...I.F#',
        '##=#######',
        '##o#######',
        '#...F#####',
        '##########'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 4, huong: 0 }],
      r1Them: { co: [{ x: 8, y: 1 }] }, r2Them: { co: [{ x: 4, y: 4 }] },
      vatDang: ['..........', '..........', '..........', '..r.......', '..........', '..........'],
      danDoi: doi3(3, 1, 2, 4, 6),
      daChuong: doi3(4, 1, 5, 7, 8),
      maMau: baiDoi(['d = {2: 5, 4: 7, 6: 8}', 'fest_dict_glide(2, d)'], ['clb_lob_bridge(3)']),
      loiGiai: baiDoi(['d = {2: 5, 4: 7, 6: 8}', 'fest_dict_glide(2, d)'], ['clb_lob_bridge(3)']),
      sao: { o: 40, nhip: 27 },
      goiY: ['Màn trình diễn 3 sân: bấm Chạy thử để xem R1 và R2 mở màn Đêm hội.']
    }),

    manNH('trum-mua-clb', 2, 'lam-quen', {
      ten: 'Chế hàm: Phá hai tầng nhũ đá cộng hưởng tiến vào lễ đài',
      taoHam: ['anthem_crack_go'], vo: 'hang-dong', r1: R_GAI, r2: R_BANH,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'bat_wait_crack', 'echo_crack_step', 'grab_clear'],
      deBai: 'Trên đường tiến vào lễ đài trung tâm có hai tầng nhũ đá cộng hưởng liên tiếp ở (4, 1) và (6, 1) được báo hiệu bởi hai đàn dơi ở (3, 1) và (5, 1). Hãy viết hàm anthem_crack_go(w): gọi bat_wait_crack(w), gọi echo_crack_step(), rồi gọi move(). Dùng anthem_crack_go(2) cho R1 khi R2 gọi grab_clear().',
      san: [
        '#########',
        '#.o....F#',
        '##.######',
        '##F######',
        '#########'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 2, huong: 0 }],
      r1Them: { co: [{ x: 7, y: 1 }] }, r2Them: { co: [{ x: 2, y: 3 }] },
      danDoi: cap3(3, 1, 2, 4, 6, 5, 1, 5, 7, 8),
      daChuong: cap3(4, 1, 2, 4, 6, 6, 1, 5, 7, 8),
      maMau: baiDoi(['anthem_crack_go(2)'], ['grab_clear()'], [ham('anthem_crack_go', [], ['w'])]),
      loiGiai: baiDoi(['anthem_crack_go(2)'], ['grab_clear()'], [], [ham('anthem_crack_go', ['bat_wait_crack(w)', 'echo_crack_step()', 'move()'], ['w'])]),
      loiSai: [
        { moTa: 'Để trống anthem_crack_go(w): R1 đứng yên tại chỗ', baiLam: baiDoi(['anthem_crack_go(2)'], ['grab_clear()'], [ham('anthem_crack_go', [], ['w'])]), phaiCoMa: ['loi-cu-phap'] },
        { moTa: 'Quên echo_crack_step() và move() trong anthem_crack_go(w): R1 dừng ở (4, 1) trước nhũ đá thứ hai', baiLam: baiDoi(['anthem_crack_go(2)'], ['grab_clear()'], [], [ham('anthem_crack_go', ['bat_wait_crack(w)'], ['w'])]), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 30, nhip: 30 },
      goiY: ['Trong thân hàm anthem_crack_go(w), viết 3 dòng: bat_wait_crack(w), echo_crack_step() và move().']
    }),

    manNH('trum-mua-clb', 3, 'lam-quen', {
      ten: 'Mở cổng lễ đài cho bánh gai phá hai tầng nhũ đá',
      vo: 'nha-may', r1: R_GAI, r2: R_XICH,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'anthem_crack_go', 'clb_spray_open', 'back'],
      deBai: 'Qua 3 sân lễ đài, R2 (xe xích Mùa 2) gọi clb_spray_open(1) và back() để bắn van N(4, 3) mở cửa C(2, 1) rồi lùi về cờ (1, 3). Hãy lập trình cho R1 gọi anthem_crack_go(1) để chờ cửa mở, phá hai tầng nhũ đá cộng hưởng ở (4, 1) và (6, 1) rồi tiến vào cờ (7, 1)!',
      san: [
        '#########',
        '#.C....F#',
        '#.#####.#',
        '#F..N...#',
        '#########'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 3, huong: 1 }],
      r1Them: { co: [{ x: 7, y: 1 }] }, r2Them: { co: [{ x: 1, y: 3 }] },
      noi: [{ nut: { x: 4, y: 3 }, cua: [{ x: 2, y: 1 }] }],
      danDoi: cap3(3, 1, 3, 5, 7, 5, 1, 4, 6, 8),
      daChuong: cap3(4, 1, 3, 5, 7, 6, 1, 4, 6, 8),
      maMau: baiDoi(['wait_n(1)'], ['clb_spray_open(1)', 'back()']),
      loiGiai: baiDoi(['anthem_crack_go(1)'], ['clb_spray_open(1)', 'back()']),
      loiSai: [
        { moTa: 'R1 chưa gọi anthem_crack_go(1): dừng ở vị trí xuất phát', baiLam: baiDoi(['wait_n(1)'], ['clb_spray_open(1)', 'back()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 30, nhip: 27 },
      goiY: ['Thay wait_n(1) của R1 bằng anthem_crack_go(1) để R1 vượt qua cả hai tầng nhũ đá trên 3 sân.']
    }),

    manNH('trum-mua-clb', 4, 'cung-co', {
      ten: 'Chế hàm: Giải mã sóng âm rồi phá tiếp tầng nhũ đá thứ hai',
      taoHam: ['anthem_team_pass'], vo: 'mo-da', r1: R_GAI, r2: R_OMNI,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'clb_sonic_clear', 'echo_crack_step', 'clb_lob_bridge'],
      deBai: 'Ở hành lang lễ hội 3 sân, đàn dơi thứ nhất tại (3, 1) phát nốt mã hóa 2, 4, 5 ứng với nhũ đá (4, 1) nốt 6, 7, 8 (tra qua d = {2: 6, 4: 7, 5: 8}), còn đàn dơi thứ hai tại (6, 1) phát trực tiếp nốt cộng hưởng của nhũ đá (7, 1). Hãy viết hàm anthem_team_pass(w, d): gọi clb_sonic_clear(w, d), gọi echo_crack_step(), rồi gọi move().',
      san: [
        '##########',
        '#.u.....F#',
        '##=#######',
        '##o#######',
        '#...F#####',
        '##########'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 4, huong: 0 }],
      r1Them: { co: [{ x: 8, y: 1 }] }, r2Them: { co: [{ x: 4, y: 4 }] },
      vatDang: ['..........', '..........', '..........', '..r.......', '..........', '..........'],
      danDoi: cap3(3, 1, 2, 4, 5, 6, 1, 3, 5, 7),
      daChuong: cap3(4, 1, 6, 7, 8, 7, 1, 3, 5, 7),
      maMau: baiDoi(['d = {2: 6, 4: 7, 5: 8}', 'anthem_team_pass(2, d)'], ['clb_lob_bridge(3)'], [ham('anthem_team_pass', [], ['w', 'd'])]),
      loiGiai: baiDoi(['d = {2: 6, 4: 7, 5: 8}', 'anthem_team_pass(2, d)'], ['clb_lob_bridge(3)'], [], [ham('anthem_team_pass', ['clb_sonic_clear(w, d)', 'echo_crack_step()', 'move()'], ['w', 'd'])]),
      loiSai: [
        { moTa: 'Để trống anthem_team_pass(w, d): R1 đứng yên tại chỗ', baiLam: baiDoi(['d = {2: 6, 4: 7, 5: 8}', 'anthem_team_pass(2, d)'], ['clb_lob_bridge(3)'], [ham('anthem_team_pass', [], ['w', 'd'])]), phaiCoMa: ['loi-cu-phap'] },
        { moTa: 'Quên echo_crack_step() và move() trong anthem_team_pass(w, d): R1 dừng ở (5, 1)', baiLam: baiDoi(['d = {2: 6, 4: 7, 5: 8}', 'anthem_team_pass(2, d)'], ['clb_lob_bridge(3)'], [], [ham('anthem_team_pass', ['clb_sonic_clear(w, d)'], ['w', 'd'])]), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 40, nhip: 33 },
      goiY: ['Trong thân hàm anthem_team_pass(w, d), viết 3 dòng: clb_sonic_clear(w, d), echo_crack_step() và move().']
    }),

    manNH('trum-mua-clb', 5, 'cung-co', {
      ten: 'Nhện từ tính giữ cổng cho bánh gai vượt hai tầng nhũ đá',
      vo: 'bai-tai-che', r1: R_GAI, r2: R_NHEN,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'anthem_team_pass', 'clb_magnet_hold'],
      deBai: 'Qua 3 sân, R2 (nhện từ tính Mùa 3) gọi clb_magnet_hold() và go_right() để kéo lõi sắt đè nút M(4, 3) mở cửa C(2, 1). R1 khai báo từ điển d = {2: 6, 4: 7, 5: 8} và gọi anthem_team_pass(5, d) để chờ cửa mở, giải mã nhũ đá (4, 1), phá tiếp nhũ đá (7, 1) và về cờ (8, 1)!',
      san: [
        '##########',
        '#.C.....F#',
        '#.######.#',
        '#..oMF...#',
        '##########'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 3, huong: 1 }],
      r1Them: { co: [{ x: 8, y: 1 }] }, r2Them: { co: [{ x: 5, y: 3 }] },
      vatChat: ['..........', '..........', '..........', '...s......', '..........'],
      noi: [{ nut: { x: 4, y: 3 }, cua: [{ x: 2, y: 1 }] }],
      danDoi: cap3(3, 1, 2, 4, 5, 6, 1, 3, 5, 7),
      daChuong: cap3(4, 1, 6, 7, 8, 7, 1, 3, 5, 7),
      maMau: baiDoi(['d = {2: 6, 4: 7, 5: 8}', 'wait_n(5)'], ['clb_magnet_hold()', 'go_right()']),
      loiGiai: baiDoi(['d = {2: 6, 4: 7, 5: 8}', 'anthem_team_pass(5, d)'], ['clb_magnet_hold()', 'go_right()']),
      loiSai: [
        { moTa: 'R1 chưa gọi anthem_team_pass(5, d): dừng ở vị trí xuất phát', baiLam: baiDoi(['d = {2: 6, 4: 7, 5: 8}', 'wait_n(5)'], ['clb_magnet_hold()', 'go_right()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 33, nhip: 42 },
      goiY: ['Thay wait_n(5) của R1 bằng anthem_team_pass(5, d).']
    }),

    manNH('trum-mua-clb', 6, 'cung-co', {
      ten: 'Chế hàm: Vượt nhũ đá rồi lướt băng qua hành lang lễ hội',
      taoHam: ['anthem_glide_clear'], vo: 'hang-dong', r1: R_GAI, r2: R_XICH,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'clb_sonic_clear', 'echo_glide_pass', 'clb_spray_open', 'back'],
      deBai: 'Để R1 chờ w nhịp qua cổng, giải mã đàn dơi thứ nhất (3, 1) bằng từ điển d để phá nhũ đá (4, 1) và tiến lên (5, 1), rồi gọi tiếp echo_glide_pass(1) phá nhũ đá thứ hai (7, 1) và trượt qua đá ướt I(8, 1) vào cờ (9, 1) trên cả 3 sân, hãy viết hàm anthem_glide_clear(w, d): gọi clb_sonic_clear(w, d) rồi gọi echo_glide_pass(1).',
      san: [
        '###########',
        '#.C....I.F#',
        '#.#######.#',
        '#F..N.....#',
        '###########'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 3, huong: 1 }],
      r1Them: { co: [{ x: 9, y: 1 }] }, r2Them: { co: [{ x: 1, y: 3 }] },
      noi: [{ nut: { x: 4, y: 3 }, cua: [{ x: 2, y: 1 }] }],
      danDoi: cap3(3, 1, 3, 4, 5, 6, 1, 4, 6, 8),
      daChuong: cap3(4, 1, 6, 7, 8, 7, 1, 4, 6, 8),
      maMau: baiDoi(['d = {3: 6, 4: 7, 5: 8}', 'anthem_glide_clear(1, d)'], ['clb_spray_open(1)', 'back()'], [ham('anthem_glide_clear', [], ['w', 'd'])]),
      loiGiai: baiDoi(['d = {3: 6, 4: 7, 5: 8}', 'anthem_glide_clear(1, d)'], ['clb_spray_open(1)', 'back()'], [], [ham('anthem_glide_clear', ['clb_sonic_clear(w, d)', 'echo_glide_pass(1)'], ['w', 'd'])]),
      loiSai: [
        { moTa: 'Để trống anthem_glide_clear(w, d): R1 đứng yên tại chỗ', baiLam: baiDoi(['d = {3: 6, 4: 7, 5: 8}', 'anthem_glide_clear(1, d)'], ['clb_spray_open(1)', 'back()'], [ham('anthem_glide_clear', [], ['w', 'd'])]), phaiCoMa: ['loi-cu-phap'] },
        { moTa: 'Quên echo_glide_pass(1) trong anthem_glide_clear(w, d): R1 dừng ở (5, 1)', baiLam: baiDoi(['d = {3: 6, 4: 7, 5: 8}', 'anthem_glide_clear(1, d)'], ['clb_spray_open(1)', 'back()'], [], [ham('anthem_glide_clear', ['clb_sonic_clear(w, d)'], ['w', 'd'])]), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 40, nhip: 33 },
      goiY: ['Trong thân hàm anthem_glide_clear(w, d), viết 2 dòng: clb_sonic_clear(w, d) và echo_glide_pass(1).']
    }),

    manNH('trum-mua-clb', 7, 'cung-co', {
      ten: 'Omni bắc cầu đá cho bánh gai lướt qua đại sảnh lễ hội',
      vo: 'mo-da', r1: R_GAI, r2: R_OMNI,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'anthem_glide_clear', 'clb_lob_bridge'],
      deBai: 'Qua 3 sân đại sảnh, R2 (xe omni Mùa 7) gọi clb_lob_bridge(3) để hất đá tròn lấp hố sụt u(2, 1) và trượt về cờ (4, 4). R1 khai báo từ điển d = {3: 6, 4: 7, 5: 8} và gọi anthem_glide_clear(2, d) để vượt qua hai tầng nhũ đá cộng hưởng và trượt qua đá ướt I(8, 1) về cờ (9, 1)!',
      san: [
        '###########',
        '#.u....I.F#',
        '##=########',
        '##o########',
        '#...F######',
        '###########'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 4, huong: 0 }],
      r1Them: { co: [{ x: 9, y: 1 }] }, r2Them: { co: [{ x: 4, y: 4 }] },
      vatDang: ['...........', '...........', '...........', '..r........', '...........', '...........'],
      danDoi: cap3(3, 1, 3, 4, 5, 6, 1, 4, 6, 8),
      daChuong: cap3(4, 1, 6, 7, 8, 7, 1, 4, 6, 8),
      maMau: baiDoi(['d = {3: 6, 4: 7, 5: 8}', 'wait_n(2)'], ['clb_lob_bridge(3)']),
      loiGiai: baiDoi(['d = {3: 6, 4: 7, 5: 8}', 'anthem_glide_clear(2, d)'], ['clb_lob_bridge(3)']),
      loiSai: [
        { moTa: 'R1 chưa gọi anthem_glide_clear(2, d): dừng ở vị trí xuất phát', baiLam: baiDoi(['d = {3: 6, 4: 7, 5: 8}', 'wait_n(2)'], ['clb_lob_bridge(3)']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 45, nhip: 36 },
      goiY: ['Thay wait_n(2) của R1 bằng anthem_glide_clear(2, d).']
    }),

    manNH('trum-mua-clb', 8, 'cung-co', {
      ten: 'Chế hàm: Lọc sóng âm đàn dơi rồi trượt băng về lễ đài',
      taoHam: ['anthem_finale_step'], vo: 'hang-dong', r1: R_GAI, r2: R_BANH,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'fest_set_pass', 'glide_tunnel', 'grab_clear'],
      deBai: 'Để R1 chờ w nhịp cho đường thông, dùng tập hợp s lọc n ô sóng âm đàn dơi phá hai khối nhũ đá (4, 1) và (6, 1), bước lên (7, 1) rồi trượt qua đá ướt I(8, 1) vào cờ (10, 1) trên cả 3 sân, hãy viết hàm anthem_finale_step(w, s, n): gọi fest_set_pass(w, s, n) rồi gọi glide_tunnel().',
      san: [
        '############',
        '#.o.....I.F#',
        '##.#########',
        '##F#########',
        '############'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 2, huong: 0 }],
      r1Them: { co: [{ x: 10, y: 1 }] }, r2Them: { co: [{ x: 2, y: 3 }] },
      danDoi: [{ x: 3, y: 1, not: 3, phamVi: 1 }, { x: 4, y: 1, not: 3, phamVi: 1 }, { x: 5, y: 1, not: 7, phamVi: 1 }],
      daChuong: [{ x: 4, y: 1, not: 3 }, { x: 6, y: 1, not: 7 }],
      maMau: baiDoi(['s = set()', 'anthem_finale_step(2, s, 3)'], ['grab_clear()'], [ham('anthem_finale_step', [], ['w', 's', 'n'])]),
      loiGiai: baiDoi(['s = set()', 'anthem_finale_step(2, s, 3)'], ['grab_clear()'], [], [ham('anthem_finale_step', ['fest_set_pass(w, s, n)', 'glide_tunnel()'], ['w', 's', 'n'])]),
      loiSai: [
        { moTa: 'Để trống anthem_finale_step(w, s, n): R1 đứng yên tại chỗ', baiLam: baiDoi(['s = set()', 'anthem_finale_step(2, s, 3)'], ['grab_clear()'], [ham('anthem_finale_step', [], ['w', 's', 'n'])]), phaiCoMa: ['loi-cu-phap'] },
        { moTa: 'Quên glide_tunnel() trong anthem_finale_step(w, s, n): R1 dừng ở (7, 1) trước đá ướt I', baiLam: baiDoi(['s = set()', 'anthem_finale_step(2, s, 3)'], ['grab_clear()'], [], [ham('anthem_finale_step', ['fest_set_pass(w, s, n)'], ['w', 's', 'n'])]), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 39, nhip: 36 },
      goiY: ['Trong thân hàm anthem_finale_step(w, s, n), viết 2 dòng: fest_set_pass(w, s, n) và glide_tunnel().']
    }),

    manNH('trum-mua-clb', 9, 'on-tap', {
      ten: 'Tổng tiến công trước giờ G: Mở cổng Đại nhạc hội Chấn Hưng',
      vo: 'hang-dong', r1: R_GAI, r2: R_NHEN,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'anthem_finale_step', 'clb_magnet_hold'],
      deBai: 'Thử thách phối hợp cuối cùng trước màn Trùm Đại nhạc hội! Qua 3 sân, R2 (nhện từ tính Mùa 3) gọi clb_magnet_hold() và go_right() để giữ mở cửa C(2, 1). R1 khởi tạo s = set() và gọi anthem_finale_step(5, s, 3) để chờ cửa mở, lọc sóng âm đàn dơi phá hai tầng nhũ đá rồi trượt qua đá ướt I(8, 1) về cờ (10, 1)!',
      san: [
        '############',
        '#.C.....I.F#',
        '#.########.#',
        '#..oMF.....#',
        '############'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 3, huong: 1 }],
      r1Them: { co: [{ x: 10, y: 1 }] }, r2Them: { co: [{ x: 5, y: 3 }] },
      vatChat: ['............', '............', '............', '...s........', '............'],
      noi: [{ nut: { x: 4, y: 3 }, cua: [{ x: 2, y: 1 }] }],
      danDoi: [{ x: 3, y: 1, not: 5, phamVi: 1 }, { x: 4, y: 1, not: 5, phamVi: 1 }, { x: 5, y: 1, not: 8, phamVi: 1 }],
      daChuong: [{ x: 4, y: 1, not: 5 }, { x: 6, y: 1, not: 8 }],
      maMau: baiDoi(['s = set()', 'wait_n(5)'], ['clb_magnet_hold()', 'go_right()']),
      loiGiai: baiDoi(['s = set()', 'anthem_finale_step(5, s, 3)'], ['clb_magnet_hold()', 'go_right()']),
      loiSai: [
        { moTa: 'R1 chưa gọi anthem_finale_step(5, s, 3): dừng ở vị trí xuất phát', baiLam: baiDoi(['s = set()', 'wait_n(5)'], ['clb_magnet_hold()', 'go_right()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 37, nhip: 45 },
      goiY: ['Thay wait_n(5) của R1 bằng anthem_finale_step(5, s, 3) để R1 về đích trên cả 3 sân.']
    }),

    manNH('trum-mua-clb', 10, 'trum', {
      ten: 'Trùm Cuối Mùa 9: Bản giao hưởng Chấn Hưng',
      r1: R_GAI, r2: R2_LOA, mucTieu: 'choi-dieu',
      hamCuaEmCan: ['play_note', 'play_part'],
      deBai: 'Chúc mừng em đã đi tới màn thứ 1.800 — đỉnh cao khép lại toàn bộ 9 mùa Đội Robot Chấn Hưng! Trên sân khấu Đại nhạc hội qua 3 sân liên tiếp, R1 và R2 cùng hòa tấu Bản giao hưởng Chấn Hưng 2 bè:\n- Bè 1 (R1): [1, 3, 5, 8, 6, 8, 5, 8]\n- Bè 2 (R2): [1, 1, 3, 5, 4, 5, 3, 5]\nHãy dùng play_part(notes) cho cả hai robot để khép lại hành trình!',
      san: SAN_DUET_3,
      bd: [{ x: 2, y: 1, huong: 1 }, { x: 2, y: 2, huong: 1 }],
      dieu: { r1: '13586858', r2: '11354535' },
      maMau: baiDoi(['play_part([1, 3, 5, 8, 6, 8, 5, 8])'], ['play_part([1, 1, 3, 5])']),
      loiGiai: baiDoi(['play_part([1, 3, 5, 8, 6, 8, 5, 8])'], ['play_part([1, 1, 3, 5, 4, 5, 3, 5])']),
      loiSai: [
        { moTa: 'R2 chỉ phát 4 nốt đầu: chưa hoàn thành Bản giao hưởng Chấn Hưng trên 3 sân', baiLam: baiDoi(['play_part([1, 3, 5, 8, 6, 8, 5, 8])'], ['play_part([1, 1, 3, 5])']), phaiCoMa: ['lo-nhip'] }
      ],
      sao: { o: 6, nhip: 24 },
      goiY: ['Truyền đủ danh sách [1, 1, 3, 5, 4, 5, 3, 5] vào lệnh play_part(...) của R2 để hoàn thành màn 1.800!']
    })
  ];
})();
