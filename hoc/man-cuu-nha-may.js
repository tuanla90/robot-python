/* ============================================================================
   man-cuu-nha-may.js - Mùa 9 Về CLB: Gói 2 "Nhà máy sau bão" (M9M2 5/11; dựng lại theo khuôn G1 hoc/man-cuu-kho-hang.js)
   Câu đố: hoc/MUA-9-200-CAU-DO.md mục G2 (20 dòng); luật: hoc/KE-HOACH-MUA-9-TO-HOP.md. Bão: container văng chắn lối, sắt vụn rơi vào khe máy, vệt dầu trơn (ô I).
   - Chương 1 cuu-nha-may: CHỌN ĐỘI (man.chonDoi); bảng có cần cẩu thì mọi khe em lập trình đứng trên MỘT dải ray R, mặt hướng lên (huong 0):
     cần cẩu của CoMay có rail() nên phải xuất phát trên R, và không nhận huong khác 0 — đặt cỗ máy nào vào khe nào cũng không vỡ màn.
   - Chương 2 lap-nha-may: R1 xe cứu hỏa đặt sẵn, Luna TỰ LẮP R2 (man.lapRap.robot = 1). Lai ra mắt: L1 cẩu + nam châm, L8 cẩu + gầu, L13 cẩu + cảm biến từ.
   - Mỗi màn khai man.cauDo (máy kiểm hoc/kiem-cau-do-mua-9.mjs). Ôn Python G2: BIẾN (giữ số đọc được, số ô), THAM SỐ (hàm có n).
   - Hàm của em do gói này tạo mà gói sau gọi: valve_step(n) [squirt("low"), forward(n)], push_valve(n) [forward(n), back()] (man-cuu-clb.js, man-cuu-hang-dong.js).
   - WIP 5/11 (M9M2 dừng chờ user): mới dựng cuu-nha-may.1–5; .6–10 và lap-nha-may.1–10 còn bản CŨ (manNM bên dưới).
     LÕI CHƯA CHO CONTAINER CHẮN: chồng container (cfg.chong) không chặn xe, thùng nặng hay tia phun (san-hoc.js), nên ở #1, #2, #3, #5 việc cẩu nhấc container
     chưa thật sự cần (bẫy drone ở #3 vẫn thắng). Chờ user quyết (xem báo cáo M9M2) rồi dựng tiếp.
   - Màn 10 mỗi chương: song ca đoạn 2 "Kìa con bướm vàng" (Bè 1: 4 4 3 3 2 2 1 1 | Bè 2: 2 4 1 3 5 5 1 1), giữ để gói 10 ghép bài.
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

  /* ---- M9M2: khung màn mùa 9 (chép từ man-cuu-kho-hang.js) --------------------------------------------- */
  var CoMay = laNode ? require('./co-may.js') : window.CoMay;
  var HAM_EM = ['move', 'back', 'forward', 'wait_n', 'tr_left', 'tr_right', 'squirt', 'pick', 'drop', 'swing_l', 'swing_r', 'fly_right'];
  /** Robot của màn: cỗ máy `ma` (CoMay.dung) ở ô xuất phát bd, cờ riêng co, đế son ('lam' Luna, 'tim' máy khách). */
  function may(ma, bd, them) {
    var t = them || {};
    var r = CoMay.dung(ma, { batDau: bd, son: t.son, pin: t.pin });
    if (t.co) r.co = t.co;
    if (t.coDinh) r.coDinh = true;
    if (t.tay) r.robot.tay = t.tay;
    if (t.tay || t.boHam || t.themHam) r.hamGoc = r.hamGoc.filter(function (h) { return (t.boHam || []).indexOf(h) < 0; }).concat(t.themHam || []);
    if (t.phatNot) r.phatNot = true;
    return r;
  }
  /** Khe robot em lập trình ở màn chọn đội / khe lắp: chỉ ô xuất phát, cờ, pin (drone), đế. */
  function khe(bd, them) { return Object.assign({ batDau: bd }, them || {}); }
  function doiBai(ds, hamMan, hamEm) {
    return { doi: ds.map(function (c) { return { chinh: c.slice() }; }), hamCuaMan: clone(hamMan || []), hamCuaEmMoi: clone(hamEm || []) };
  }
  /** Hàm của em tạo ở gói này (gói sau còn gọi: man-cuu-clb.js, man-cuu-hang-dong.js). */
  var H_VALVE_STEP9 = { ten: 'valve_step', thamSo: ['n'], than: ['squirt("low")', 'forward(n)'] };
  var H_PUSH_VALVE9 = { ten: 'push_valve', thamSo: ['n'], than: ['forward(n)', 'back()'] };
  /** Một cách lắp mẫu (màn tự lắp, lapRap.robot = 1): part của R2 + lời giải cả đội. */
  function cach(than, tay, cam, ds, hamEm) { return { than: than, tay: tay || null, camBien: cam || null, loiGiai: doiBai(ds, [], hamEm) }; }
  function lapR2(than, tay, cam, nganSach, cachLap, them) {
    return Object.assign({ robot: 1, than: than, tay: tay, camBien: cam, nganSach: nganSach, dungKho: true, cachLap: cachLap }, them || {});
  }
  /** R2 đã lắp sẵn (màn show chương 2, lai L1): cần cẩu + nam châm trên đầu cần (cầu trục từ), như LapRap.apDung lắp ra; màn khai moLai ['L1']. */
  var CAU_TU = {
    loaiRobot: 'cau', robot: { than: 'cau', tay: 'nam-cham', camBien: [], son: 'lam' },
    hamGoc: ['swing_left', 'swing_right', 'extend', 'retract', 'wait', 'magnet_n', 'magnet_s', 'magnet_off']
  };
  function man9(chuong, so, hang, cfg) {
    var r1 = cfg.doi[0];
    var m = {
      chuong: chuong, so: so, ten: cfg.ten, hang: hang, vo: 'nha-may',
      cauTruc: ['for', 'if', 'while', 'list'], vaHoac: true, moXuong: true, camHamCuaEm: false,
      hamCuaEmCan: cfg.hamCuaEmCan || HAM_EM, taoHam: cfg.taoHam || [],
      khung: cfg.khung || { chinh: 12, moiHam: 8 }, mucTieu: cfg.mucTieu || 'toi-co',
      deBai: cfg.deBai, veMaMau: cfg.veMaMau || '', san: cfg.san, batDau: clone(r1.batDau),
      doi: cfg.doi.map(clone), maMau: cfg.maMau, loiSai: cfg.loiSai || [], sao: cfg.sao, goiY: cfg.goiY || [], cauDo: cfg.cauDo
    };
    if (r1.loaiRobot) { m.loaiRobot = r1.loaiRobot; m.robot = clone(r1.robot); m.hamGoc = r1.hamGoc.slice(); }
    if (cfg.loiGiai) m.loiGiai = cfg.loiGiai;
    if (cfg.chonDoi) m.chonDoi = cfg.chonDoi;
    if (cfg.lapRap) m.lapRap = cfg.lapRap;
    if (cfg.noi) m.noi = cfg.noi;
    if (cfg.chiChay) { m.chiChay = true; m.chinhCoDinh = true; }
    Object.keys(cfg.them || {}).forEach(function (k) { m[k] = cfg.them[k]; });
    return ManHoc.chuanHoa(m);
  }

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
    // 1 · show: cần cẩu nhấc container chắn lối (treo luôn trên móc), xe cứu hỏa ủi thùng nặng vào ô đích (chạy sẵn, khoá). Đội cố định CU + CC (màn chạy sẵn không qua bảng chọn).
    man9('cuu-nha-may', 1, 'lam-quen', {
      ten: 'Cẩu mở lối',
      chiChay: true, mucTieu: 'day-thung',
      deBai: 'Bão hất container chắn lối. Cẩu nhấc container, xe cứu hỏa ủi thùng vào ô đích. Bấm Chạy.',
      veMaMau: 'Bấm Chạy xem mỗi bạn làm gì.',
      san: ['##########', '#..H....D#', '#####R.###', '#####R####', '##########'],
      doi: [may('CU', { x: 1, y: 1, huong: 1 }), may('CC', { x: 5, y: 3, nac: 0, tam: 2 }, { son: 'lam' })],
      them: { contChan: true, chong: [{ x: 5, y: 1, cont: [{ so: 7 }] }] },
      maMau: doiBai([['forward(6)'], ['pick_up()', 'swing_right()']]),
      loiGiai: doiBai([['forward(6)'], ['pick_up()', 'swing_right()']]),
      sao: { o: 10, nhip: 7 },
      goiY: ['Còn container, thùng nặng không qua được.'],
      cauDo: { doi: ['CU', 'CC'], lap: null, coChe: ['container', 'thung-nang'], cuu: 'hang', meo: 'don-loi' }
    }),

    // 2 · chờ tín hiệu: băng chuyền đưa thùng nặng tới; container chặn băng. Cẩu nhấc container; xe cứu hỏa đọc hồng ngoại distance(), thùng tới sát mũi thì ủi vào đích.
    //     Hai khe đứng trên dải ray, mặt hướng lên (bảng có cần cẩu).
    man9('cuu-nha-may', 2, 'lam-quen', {
      ten: 'Chờ thùng tới',
      mucTieu: 'day-thung',
      deBai: 'Băng chuyền đưa thùng nặng tới. Container chặn băng. Thùng tới sát mũi xe thì ủi vào đích.',
      veMaMau: 'Xe chưa biết chờ thùng.',
      san: ['########', '###D####', '#>>....#', '###RR###', '########'],
      doi: [khe({ x: 3, y: 3, huong: 0 }), khe({ x: 4, y: 3, huong: 0 })],
      them: { contChan: true, chong: [{ x: 3, y: 2, cont: [{ so: 4 }] }], thungThem: [{ x: 1, y: 2 }] },
      chonDoi: {
        menu: ['CU', 'CC'],
        cachMau: [{ chon: ['CU', 'CC'], ghiChu: 'đôi tốt', loiGiai: doiBai([
          ['wait_n(2)', 'while distance() > 0:', '    wait()', 'move()'],
          ['swing_left()', 'pick_up()', 'swing_right()', 'set_down()']]) }]
      },
      maMau: doiBai([['wait_n(2)', 'move()'], ['swing_left()', 'pick_up()', 'swing_right()', 'set_down()']]),
      loiSai: [
        { moTa: 'Xe ủi ngay khi thùng chưa tới', baiLam: doiBai([['wait_n(2)', 'move()'], ['swing_left()', 'pick_up()', 'swing_right()', 'set_down()']]), phaiCoMa: ['chua-day-thung'] }
      ],
      sao: { o: 16, nhip: 6 },
      goiY: ['distance() > 0: trước mũi còn ô trống.'],
      cauDo: { doi: ['CU', 'CC'], lap: null, coChe: ['bang-chuyen', 'container', 'thung-nang'], cuu: 'hang', meo: 'cho-tin-hieu' }
    }),

    // 3 · đọc rồi chọn: chồng giữa (2 container) chắn lối thùng; chồng trên đã đầy 4, chồng dưới còn chỗ. Cẩu vươn / thu cần chuyển container sang chồng còn chỗ (biến n = số container).
    //     Bẫy: drone (bay qua được nhưng không nhấc container, không ủi thùng).
    man9('cuu-nha-may', 3, 'luyen', {
      ten: 'Chồng nào còn chỗ',
      mucTieu: 'day-thung',
      deBai: 'Chồng giữa chắn lối thùng. Một chồng tối đa 4 container. Chuyển sang chồng còn chỗ.',
      veMaMau: 'Cẩu mới vươn tới chồng giữa.',
      san: ['#########', '#####.###', '#..H...D#', '#.###.###', '#RRRRR###', '#########'],
      doi: [khe({ x: 1, y: 4, huong: 0 }), khe({ x: 5, y: 4, huong: 0 })],
      them: { contChan: true, chong: [{ x: 5, y: 1, cont: [{ so: 11 }, { so: 12 }, { so: 13 }, { so: 14 }] }, { x: 5, y: 2, cont: [{ so: 21 }, { so: 22 }] }, { x: 5, y: 3, cont: [{ so: 31 }] }] },
      chonDoi: {
        menu: ['CU', 'CC', 'DR'],
        cachMau: [{ chon: ['CU', 'CC'], ghiChu: 'đôi tốt', loiGiai: doiBai([
          ['forward(2)', 'tr_right()', 'forward(5)'],
          ['n = 2', 'for i in range(n):', '    extend()', '    pick_up()', '    retract()', '    set_down()']]) }]
      },
      maMau: doiBai([['forward(2)', 'tr_right()', 'forward(5)'], ['extend()']]),
      loiSai: [
        { moTa: 'Hạ container lên chồng trên đã đầy', baiLam: doiBai([['forward(2)', 'tr_right()', 'forward(5)'], ['n = 2', 'for i in range(n):', '    extend()', '    pick_up()', '    extend()', '    set_down()', '    retract()', '    retract()']]), phaiCoMa: ['ha-bi-chan'] }
      ],
      sao: { o: 22, nhip: 11 },
      goiY: ['extend() vươn lên, retract() thu về.', 'Đếm container mỗi chồng.'],
      cauDo: { doi: ['CU', 'CC'], lap: null, coChe: ['container', 'chong-day', 'thung-nang'], cuu: 'hang', meo: 'doc-roi-chon' }
    }),

    // 4 · làm cầu: vệt dầu trơn trước thùng nặng; xích vào dầu là trượt tới hố. Drone bay fly_right(n) tới ô rẽ, rắc cát; xích dừng ở ô cát, quay, ủi thùng vào đích.
    man9('cuu-nha-may', 4, 'luyen', {
      ten: 'Cát trên vệt dầu',
      mucTieu: 'day-thung',
      deBai: 'Vệt dầu trơn: xích vào là trượt tới hố. Rắc cát ô nằm dưới thùng để xích dừng lại.',
      veMaMau: 'Drone chưa tới ô rẽ.',
      san: ['########', '####D###', '####H###', '#.IIIIu#', '#......#', '########'],
      doi: [khe({ x: 1, y: 3, huong: 1 }), khe({ x: 1, y: 4, huong: 1 })],
      chonDoi: {
        menu: ['CU', 'DR'],
        cachMau: [{ chon: ['CU', 'DR'], ghiChu: 'đôi tốt', loiGiai: doiBai([
          ['wait_n(5)', 'move()', 'tr_left()', 'move()'],
          ['fly_right(3)', 'go_up()', 'dot()', 'go_down()']]) }]
      },
      maMau: doiBai([['wait_n(5)', 'move()', 'tr_left()', 'move()'], []]),
      loiSai: [
        { moTa: 'Không rắc cát: xích trượt rơi hố', baiLam: doiBai([['wait_n(5)', 'move()', 'tr_left()', 'move()'], ['fly_right(3)']]), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 18, nhip: 11 },
      goiY: ['fly_right(3): bay 3 ô sang phải.'],
      cauDo: { doi: ['CU', 'DR'], lap: null, coChe: ['dau-tron', 'rac-cat', 'ho', 'thung-nang'], cuu: 'hang', meo: 'lam-cau' }
    }),

    // 5 · cứu người + tạo hàm valve_step(n): công nhân kẹt trong phòng điều khiển sau cửa C. Container chắn ngách van; cẩu nhấc container,
    //     xích vào ngách, valve_step(1): phun nhẹ trúng van N mở cửa C rồi tiến 1 ô. Bẫy: máy khai thác (không nhấc container, không phun).
    man9('cuu-nha-may', 5, 'cung-co', {
      ten: 'Phòng điều khiển',
      mucTieu: 'cuu-nguoi',
      taoHam: ['valve_step'],
      deBai: 'Công nhân kẹt sau cửa C. Van N mở cửa. Viết hàm valve_step(n): phun nhẹ, rồi tiến n ô.',
      veMaMau: 'Hàm valve_step chưa có.',
      san: ['#########', '#..C...N#', '#######.#', '######..#', '#####RRR#', '#########'],
      noi: [{ nut: { x: 7, y: 1 }, cua: [{ x: 3, y: 1 }] }],
      doi: [khe({ x: 7, y: 4, huong: 0 }), khe({ x: 5, y: 4, huong: 0 })],
      them: { contChan: true, chong: [{ x: 7, y: 2, cont: [{ so: 5 }] }], nguoi: [{ x: 1, y: 1 }], tramCuu: [{ x: 5, y: 1 }] },
      chonDoi: {
        menu: ['CU', 'CC', 'KT'],
        cachMau: [{ chon: ['CU', 'CC'], ghiChu: 'đôi tốt', loiGiai: doiBai([
          ['move()', 'wait_n(2)', 'valve_step(1)'],
          ['swing_right()', 'extend()', 'pick_up()', 'retract()', 'set_down()']], [], [H_VALVE_STEP9]) }]
      },
      maMau: doiBai([['move()', 'wait_n(2)', 'valve_step(1)'], ['swing_right()', 'extend()', 'pick_up()', 'retract()', 'set_down()']]),
      loiSai: [
        { moTa: 'Thân valve_step thiếu lệnh phun', baiLam: doiBai([['move()', 'wait_n(2)', 'valve_step(1)'], ['swing_right()', 'extend()', 'pick_up()', 'retract()', 'set_down()']]), hamCuaEmMoi: [{ ten: 'valve_step', thamSo: ['n'], than: ['forward(n)'] }], phaiCoMa: ['chua-cuu-nguoi'] }
      ],
      sao: { o: 23, nhip: 9 },
      goiY: ['Trong valve_step(n): squirt("low") rồi forward(n).'],
      cauDo: { doi: ['CU', 'CC'], lap: null, coChe: ['container', 'van', 'cua'], cuu: 'nguoi', meo: 'don-loi' }
    }),

    // 6 · dọn lối: băng chuyền đưa thanh sắt tới mép hố; ô bên kia hố có chồng container (nhện đáp vào là hụt). Cẩu nhấc chồng, nhện hút sắt, nhảy hố, thả sắt vào ô đích.
    //     Bẫy: xe cứu hỏa (không qua hố, không nhấc container).
    man9('cuu-nha-may', 6, 'cung-co', {
      ten: 'Sắt trên băng',
      mucTieu: 'dua-vat',
      deBai: 'Băng chuyền đưa thanh sắt tới mép hố. Bên kia hố có chồng container. Đưa sắt vào ô đích.',
      veMaMau: 'Nhện chưa có lệnh.',
      san: ['#########', '#>>>.u.D#', '####.#..#', '####RRR##', '#########'],
      doi: [khe({ x: 4, y: 3, huong: 0 }), khe({ x: 6, y: 3, huong: 0 })],
      them: { contChan: true, chong: [{ x: 6, y: 1, cont: [{ so: 6 }] }], vatThem: [{ x: 3, y: 1, chat: 'sat' }] },
      chonDoi: {
        menu: ['CU', 'PL', 'CC'],
        cachMau: [{ chon: ['PL', 'CC'], ghiChu: 'đôi tốt', loiGiai: doiBai([
          ['go_up()', 'go_up()', 'magnet_n()', 'go_left()', 'wait()', 'jump("R")', 'go_right()', 'magnet_off()', 'wait()'],
          ['extend()', 'pick_up()', 'retract()', 'set_down()']]) }]
      },
      maMau: doiBai([['go_up()', 'go_up()'], []]),
      loiSai: [
        { moTa: 'Cẩu không nhấc container: nhện nhảy hụt', baiLam: doiBai([['go_up()', 'go_up()', 'magnet_n()', 'go_left()', 'wait()', 'jump("R")', 'go_right()', 'magnet_off()', 'wait()'], []]), phaiCoMa: ['nhay-hut'] }
      ],
      sao: { o: 30, nhip: 16 },
      goiY: ['Nhện nhảy qua hố: jump("R").', 'magnet_n() hút sắt dưới bụng.'],
      cauDo: { doi: ['PL', 'CC'], lap: null, coChe: ['bang-chuyen', 'sat', 'ho', 'container'], cuu: 'hang', meo: 'don-loi' }
    }),

    // 7 · cứu máy: xe cứu hỏa khách (R3, khoá) kẹt giữa hai chồng container, đang đẩy kệ hàng về kho. Cẩu nhấc chồng trước mũi R3 đặt lên chồng kia;
    //     nhện đè nút M giữ cửa C. R3 tự chờ phía trước trống rồi ủi kệ vào ô đích. Bẫy: drone (không nhấc, không đè nút).
    //     Đội có cẩu nên mục tiêu là day-thung (cẩu không tới cờ): R3 ủi kệ vào đích là R3 thoát kẹt.
    man9('cuu-nha-may', 7, 'van-dung', {
      ten: 'Xe kẹt giữa chồng',
      mucTieu: 'day-thung',
      deBai: 'Xe cứu hỏa kẹt giữa hai chồng container. Xe chờ phía trước trống thì tiến. Mở lối cho xe ủi kệ vào kho.',
      veMaMau: 'Đọc chương trình của xe khoá.',
      san: ['#########', '#..C.HD##', '#.#M#####', '#RRR#####', '#########'],
      noi: [{ nut: { x: 3, y: 2 }, cua: [{ x: 3, y: 1 }] }],
      doi: [khe({ x: 2, y: 3, huong: 0 }), khe({ x: 3, y: 3, huong: 0 }),
        may('CU', { x: 1, y: 1, huong: 1 }, { son: 'tim', coDinh: true })],
      them: { contChan: true, chong: [{ x: 2, y: 1, cont: [{ so: 7 }] }, { x: 1, y: 2, cont: [{ so: 8 }] }] },
      chonDoi: {
        menu: ['CC', 'DR', 'PL'],
        cachMau: [{ chon: ['CC', 'PL'], ghiChu: 'đôi tốt', loiGiai: doiBai([
          ['extend()', 'pick_up()', 'retract()', 'swing_left()', 'set_down()'],
          ['go_up()']]) }]
      },
      maMau: doiBai([[], [], ['while distance() == 0:', '    wait()', 'forward(4)']]),
      loiSai: [
        { moTa: 'Cẩu nhấc chồng dưới: xe vẫn kẹt', baiLam: doiBai([['swing_left()', 'pick_up()', 'swing_right()', 'extend()', 'set_down()'], ['go_up()'], ['while distance() == 0:', '    wait()', 'forward(4)']]), phaiCoMa: ['vong-vo-han'] }
      ],
      sao: { o: 17, nhip: 7 },
      goiY: ['Xe khoá đọc distance(): chồng container như tường.', 'Cẩu đặt container lên chồng kia.'],
      cauDo: { doi: ['CC', 'PL'], lap: null, coChe: ['container', 'nut-de', 'cua', 'r3'], cuu: 'may', meo: 'don-loi' }
    }),

    // 8 · cứu máy, song song: xe cứu hỏa khách (R3, khoá) đã nổ máy, tiến ngay 4 ô ủi kệ về kho. Trên lối: thùng gỗ (ô ray) rồi chồng container.
    //     Nhịp 1 xe chở hàng gắp thùng bên phải (kẹp xoay, không quay); nhịp 2 cẩu quay cần nhấc chồng. Chậm một nhịp là R3 đâm.
    //     Bẫy: máy khai thác (phải quay rồi mới nạp được thùng: R3 đâm thùng).
    man9('cuu-nha-may', 8, 'van-dung', {
      ten: 'Dọn cùng lúc',
      mucTieu: 'day-thung',
      deBai: 'Xe cứu hỏa đã nổ máy, tiến ngay 4 ô. Thùng gỗ và chồng container chắn lối. Hai bạn dọn cùng lúc.',
      veMaMau: 'Đọc chương trình của xe khoá.',
      san: ['#######', '###D###', '###H###', '###.###', '###..##', '##RRR##', '###.###', '#######'],
      doi: [khe({ x: 4, y: 5, huong: 0 }), khe({ x: 2, y: 5, huong: 0 }),
        may('CU', { x: 3, y: 6, huong: 0 }, { son: 'tim', coDinh: true })],
      them: { contChan: true, chong: [{ x: 3, y: 4, cont: [{ so: 9 }] }], vatThem: [{ x: 3, y: 5 }] },
      chonDoi: {
        menu: ['CC', 'CH', 'KT'],
        cachMau: [{ chon: ['CC', 'CH'], ghiChu: 'đôi tốt', loiGiai: doiBai([
          ['swing_left()', 'pick_up()', 'swing_right()', 'set_down()'],
          ['pick_right()']]) }]
      },
      maMau: doiBai([[], [], ['forward(4)']]),
      loiSai: [
        { moTa: 'Cẩu chậm một nhịp: xe khoá đâm chồng', baiLam: doiBai([['wait()', 'swing_left()', 'pick_up()', 'swing_right()', 'set_down()'], ['pick_right()'], ['forward(4)']]), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 22, nhip: 5 },
      goiY: ['pick_right(): gắp thùng bên phải.', 'Xe khoá không chờ ai.'],
      cauDo: { doi: ['CC', 'CH'], lap: null, coChe: ['container', 'thung', 'r3'], cuu: 'may', meo: 'song-song' }
    }),

    // 9 · cứu máy, phong phú (nước, bè, chồng container, thùng nặng, R3): xưởng ngập. Xe cứu hỏa khách (R3, khoá) chờ 3 nhịp rồi tiến (cảm biến không thấy cầu phao: nước như tường) ủi kệ về kho.
    //     Xuồng kéo bè làm cầu phao qua rãnh nước; cẩu nhấc chồng container chắn sau cầu. Đội cố định: xuồng cần khe nước, cẩu cần khe ray, nên không chung một bảng chọn.
    man9('cuu-nha-may', 9, 'bien-the', {
      ten: 'Xưởng ngập',
      mucTieu: 'day-thung',
      deBai: 'Xưởng ngập nước. Xe cứu hỏa chờ 3 nhịp rồi tiến 3 ô. Kịp kéo bè làm cầu, nhấc chồng container.',
      veMaMau: 'Đọc chương trình của xe khoá.',
      hamCuaEmCan: HAM_EM.concat(['bridge_lay', 'pull_back', 'tow_grab', 'tow_drop']),
      san: ['#######', '###.###', '#~~qB~#', '#R....#', '#R.H..#', '###D###', '#######'],
      doi: [may('XU', { x: 2, y: 2, huong: 1 }), may('CC', { x: 1, y: 3, nac: 2, tam: 2 }, { son: 'lam' }),
        may('CU', { x: 3, y: 1, huong: 2 }, { son: 'tim', coDinh: true })],
      them: { contChan: true, chong: [{ x: 3, y: 3, cont: [{ so: 2 }] }] },
      maMau: doiBai([['bridge_lay(1)'], [], ['wait_n(3)', 'forward(3)']]),
      loiGiai: doiBai([['bridge_lay(1)'], ['pick_up()', 'retract()', 'set_down()'], ['wait_n(3)', 'forward(3)']]),
      loiSai: [
        { moTa: 'Cẩu không nhấc chồng: xe khoá đâm container', baiLam: doiBai([['bridge_lay(1)'], [], ['wait_n(3)', 'forward(3)']]), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 30, nhip: 7 },
      goiY: ['bridge_lay(1): kéo bè về ô q.', 'Cẩu: pick_up(), retract(), set_down().'],
      cauDo: { doi: ['CC', 'XU'], lap: null, coChe: ['nuoc', 'be', 'container', 'thung-nang', 'r3'], cuu: 'may', meo: 'lam-cau' }
    }),

    // 10 · song ca đoạn 2 "Kìa con bướm vàng" (Bè 1: 4 4 3 3 2 2 1 1 | Bè 2: 2 4 1 3 5 5 1 1), giữ cho gói 10 ghép bài; dùng play_part (cuu-kho-hang.10 tạo).
    //      Xe cứu hỏa lắp loa thay vòi phun hát bè 1; bè 2 do xe hang động hát (cẩu không gắn được loa, mà song ca cần đủ hai bè: lệch bảng "cẩu quay cần theo nhịp").
    //      Hát đúng nốt làm vỡ đá chuông chắn cửa xưởng (nốt 1 cuối mỗi bè). Đội cố định (tay loa không có trên bảng chọn).
    man9('cuu-nha-may', 10, 'trum', {
      ten: 'Song ca nhà máy',
      mucTieu: 'choi-dieu',
      deBai: 'Nhà máy chạy lại rồi! Hai xe song ca đoạn 2. Mỗi bạn gọi play_part với bè của mình.',
      veMaMau: 'Bè 2 mới có một nốt.',
      hamCuaEmCan: ['play_note', 'play_part'],
      san: ['#######', '#.....#', '#.....#', '#######'],
      doi: [may('CU', { x: 1, y: 1, huong: 1 }, { tay: 'loa', boHam: ['spray', 'spray_back'], themHam: ['note', 'beat'], phatNot: true }),
        may('HD', { x: 1, y: 2, huong: 1 }, { son: 'lam' })],
      them: { dieu: { r1: '4 4 3 3 2 2 1 1', r2: '2 4 1 3 5 5 1 1' }, daChuong: [{ x: 2, y: 1, not: 1, ben: 1 }, { x: 2, y: 2, not: 1, ben: 1 }] },
      maMau: doiBai([['play_part([4, 4, 3, 3, 2, 2, 1, 1])'], ['play_note(2)']]),
      loiGiai: doiBai([['play_part([4, 4, 3, 3, 2, 2, 1, 1])'], ['play_part([2, 4, 1, 3, 5, 5, 1, 1])']]),
      loiSai: [
        { moTa: 'Bè 2 mới phát một nốt', baiLam: doiBai([['play_part([4, 4, 3, 3, 2, 2, 1, 1])'], ['play_note(2)']]), phaiCoMa: ['lo-nhip'] },
        { moTa: 'Bè 2 thiếu 4 nốt cuối', baiLam: doiBai([['play_part([4, 4, 3, 3, 2, 2, 1, 1])'], ['play_part([2, 4, 1, 3])']]), phaiCoMa: ['lo-nhip'] }
      ],
      sao: { o: 7, nhip: 9 },
      goiY: ['Bè 2: play_part([2, 4, 1, 3, 5, 5, 1, 1]).'],
      cauDo: { doi: ['CU', 'HD'], lap: null, coChe: ['loa', 'da-chuong'], cuu: null, meo: 'song-song' }
    }),

    /* ========================================================================
       CHƯƠNG 2: lap-nha-may (10 màn)
       ======================================================================== */
    // 11 · show (lai L1): Luna lắp sẵn cẩu + nam châm (cầu trục từ, khoá). Thanh sắt vụn rơi chắn lối xe cứu hỏa; cầu trục hút sắt, vươn cần thả vào khe máy;
    //      xe cứu hỏa ủi thùng nặng vào ô đích. Bấm Chạy là thấy. Cẩu không tới cờ nên mục tiêu day-thung.
    man9('lap-nha-may', 1, 'lam-quen', {
      ten: 'Cầu trục từ',
      chiChay: true, mucTieu: 'day-thung',
      deBai: 'Luna lắp cẩu với nam châm: cầu trục từ. Cầu trục hút sắt vụn khỏi lối. Bấm Chạy.',
      veMaMau: 'Bấm Chạy xem cầu trục làm gì.',
      san: ['###.###', '#..o.HD', '###.###', '###.###', '#######'],
      doi: [may('CU', { x: 1, y: 1, huong: 1 }), Object.assign({ batDau: { x: 3, y: 3, nac: 0, tam: 2 } }, clone(CAU_TU))],
      them: { moLai: ['L1'], vatChat: ['.......', '...s...', '.......', '.......', '.......'] },
      maMau: doiBai([['wait()', 'forward(4)'], ['magnet_n()', 'extend()', 'magnet_off()']]),
      loiGiai: doiBai([['wait()', 'forward(4)'], ['magnet_n()', 'extend()', 'magnet_off()']]),
      sao: { o: 12, nhip: 6 },
      goiY: ['Nam châm trên đầu cần hút sắt ở ô dưới đầu cần.'],
      cauDo: { doi: null, lap: 'cau+nam-cham', coChe: ['sat', 'thung-nang', 'qua-tuong'], cuu: 'hang', meo: 'don-loi' }
    }),

    // 12 · ép đổi tay: thanh sắt rơi vào khe máy sau hàng rào. Đặt sắt lên nút M thì cửa C mở cho xe cứu hỏa ủi thùng. Móc cẩu chỉ nhấc container (sắt: móc hụt);
    //      nam châm hút sắt. Cẩu + nam châm (nhanh, đắt) hay drone + nam châm (rẻ, bay vòng qua rào, chậm).
    man9('lap-nha-may', 2, 'lam-quen', {
      ten: 'Móc hay nam châm',
      mucTieu: 'day-thung',
      deBai: 'Thanh sắt rơi vào khe máy. Đặt sắt lên nút M để mở cửa C. Lắp tay nào cho cẩu?',
      veMaMau: 'Xe cứu hỏa chờ cửa mở.',
      san: ['#########', '##o=M####', '##==.####', '####.####', '#...C.HD#', '#########'],
      noi: [{ nut: { x: 4, y: 1 }, cua: [{ x: 4, y: 4 }] }],
      doi: [may('CU', { x: 1, y: 4, huong: 1 }), khe({ x: 4, y: 3, huong: 0 }, { son: 'lam' })],
      them: { vatChat: ['.........', '..s......', '.........', '.........', '.........', '.........'] },
      lapRap: lapR2(['cau', 'drone'], ['moc-cau', 'nam-cham'], [], 9, [
        cach('cau', 'nam-cham', null, [['wait_n(4)', 'forward(5)'], ['extend()', 'swing_left()', 'magnet_n()', 'swing_right()', 'magnet_off()']]),
        cach('drone', 'nam-cham', null, [['wait_n(6)', 'forward(5)'], ['go_up()', 'go_up()', 'go_left()', 'go_left()', 'magnet_n()', 'wait()', 'go_right()', 'go_right()', 'magnet_off()', 'wait()']])
      ], { moLai: ['L1'] }),
      maMau: doiBai([['wait_n(4)', 'forward(5)'], []]),
      loiSai: [
        { moTa: 'Hút sắt rồi thả ngay tại khe: cửa đóng', baiLam: doiBai([['wait_n(4)', 'forward(5)'], ['extend()', 'swing_left()', 'magnet_n()', 'magnet_off()']]), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 17, nhip: 11 },
      goiY: ['Sắt không phải container.', 'magnet_n() hút, magnet_off() thả.'],
      cauDo: { doi: null, lap: 'cau+nam-cham', coChe: ['sat', 'nut-de', 'cua', 'thung-nang', 'doi-tay'], cuu: 'hang', meo: 'doc-roi-chon' }
    }),

    // 13 · lai L13 cẩu + nam châm + cảm biến từ: quanh bệ cẩu là đống lẫn sắt và gỗ. Sắt nằm trên lối xe cứu hỏa; hút nhầm gỗ là lỗi.
    //      Quét năm ô quanh bệ, front_metal() đọc ô đầu cần: sắt thì hút, vươn cần thả ra ngoài lối; biến n đếm số sắt đã dọn.
    //      Cách hai rẻ hơn: không lắp cảm biến, nhìn sân rồi quay thẳng tới từng thanh sắt.
    man9('lap-nha-may', 3, 'luyen', {
      ten: 'Sắt hay gỗ',
      mucTieu: 'day-thung',
      khung: { chinh: 16, moiHam: 8 },
      deBai: 'Sắt và gỗ lẫn quanh cẩu. Sắt chắn lối xe cứu hỏa. Chỉ hút sắt, thả ra ngoài lối.',
      veMaMau: 'Cẩu mới quét một ô.',
      san: ['#.#.#.###', '#.ooo.HD#', '##o.o####', '#########'],
      doi: [may('CU', { x: 1, y: 1, huong: 1 }), khe({ x: 3, y: 2, huong: 0 }, { son: 'lam' })],
      them: { vatChat: ['.........', '..sss....', '..g.g....', '.........'] },
      lapRap: lapR2(['cau'], ['moc-cau', 'nam-cham'], ['tu'], 11, [
        cach('cau', 'nam-cham', 'tu', [['wait_n(12)', 'forward(5)'],
          ['n = 0', 'swing_left()', 'swing_left()', 'for i in range(5):', '    if front_metal():', '        magnet_n()', '        extend()', '        magnet_off()', '        retract()', '        n = n + 1', '    swing_right()']]),
        cach('cau', 'nam-cham', null, [['wait_n(10)', 'forward(5)'],
          ['swing_left()', 'magnet_n()', 'extend()', 'magnet_off()', 'retract()', 'swing_right()', 'magnet_n()', 'extend()', 'magnet_off()', 'retract()', 'swing_right()', 'magnet_n()', 'extend()', 'magnet_off()']])
      ], { moLai: ['L1', 'L13'] }),
      maMau: doiBai([['wait_n(12)', 'forward(5)'], ['swing_left()', 'swing_left()', 'if front_metal():', '    magnet_n()']]),
      loiSai: [
        { moTa: 'Không đọc cảm biến: nam châm hút cả gỗ', baiLam: doiBai([['wait_n(12)', 'forward(5)'], ['swing_left()', 'swing_left()', 'for i in range(5):', '    magnet_n()', '    extend()', '    magnet_off()', '    retract()', '    swing_right()']]), phaiCoMa: ['hut-go'] }
      ],
      sao: { o: 24, nhip: 20 },
      goiY: ['front_metal(): ô đầu cần có sắt không.', 'n = n + 1: đếm thêm một thanh.'],
      cauDo: { doi: null, lap: 'cau+nam-cham+tu', coChe: ['sat', 'go', 'cam-bien', 'thung-nang'], cuu: 'hang', meo: 'doc-roi-chon' }
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
