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
    than: ['wait_n(t)', 'slide_load(s, 2)']
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

  /* ---- M9M4: khung màn mùa 9 (chép từ man-cuu-bai-tai-che.js) ------------------------------------------ */
  var CoMay = laNode ? require('./co-may.js') : window.CoMay;
  var HAM_EM = ['move', 'back', 'forward', 'wait_n', 'tr_left', 'tr_right', 'turn_left', 'turn_right', 'pick', 'drop', 'go', 'walk', 'jump', 'crawl', 'pull_s'];
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
  /** Khe robot em lập trình ở màn chọn đội / khe lắp: ô xuất phát trên cạn, batDauNuoc (ô trên nước khi cỗ máy là xuồng), cờ, pin (drone), đế. */
  function khe(bd, them) { return Object.assign({ batDau: bd }, them || {}); }
  function doiBai(ds, hamMan, hamEm) {
    return { doi: ds.map(function (c) { return { chinh: c.slice() }; }), hamCuaMan: clone(hamMan || []), hamCuaEmMoi: clone(hamEm || []) };
  }
  /** Một cách lắp mẫu (màn tự lắp, lapRap.robot = 1): part của R2 + lời giải cả đội. */
  function cach(than, tay, cam, ds, hamEm) { return { than: than, tay: tay || null, camBien: cam || null, loiGiai: doiBai(ds, [], hamEm) }; }
  function lapR2(than, tay, cam, nganSach, cachLap, them) {
    return Object.assign({ robot: 1, than: than, tay: tay, camBien: cam, nganSach: nganSach, dungKho: true, cachLap: cachLap }, them || {});
  }
  function man9(chuong, so, hang, cfg) {
    var r1 = cfg.doi[0];
    var m = {
      chuong: chuong, so: so, ten: cfg.ten, hang: hang, vo: 'cang',
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

  ManHoc.manCuuCangSong = [
    /* ========================================================================
       CHƯƠNG 1: cuu-cang-song (10 màn)
       ======================================================================== */
    // 1 · show (tiếp sức): bão đánh rơi container 12 xuống sông, nằm ngoài tầm cần. Xuồng tung lưới bắt container, cuộn dây kéo về một ô, nhả lưới;
    //     cẩu chạy ray sang phải rail(2), nhấc container, chạy ray về rail(-2) (số âm: sang trái), vươn cần hạ lên boong tàu (chạy sẵn, khoá). Đội cố định CC + XU.
    man9('cuu-cang-song', 1, 'lam-quen', {
      ten: 'Container rơi xuống sông',
      chiChay: true, mucTieu: 'giao-tau',
      deBai: 'Bão đánh rơi container xuống sông, ngoài tầm cần. Xuồng kéo nó về, cẩu nhấc lên tàu. Bấm Chạy.',
      veMaMau: 'Bấm Chạy xem mỗi bạn làm gì.',
      san: ['~~~T~~~~', '~~~~~~B~', '~~~~~~~~', '..RRRR..', '########'],
      doi: [may('CC', { x: 3, y: 3, nac: 0, tam: 2 }), may('XU', { x: 4, y: 1, huong: 1 }, { son: 'lam' })],
      them: { contTroi: [{ x: 6, y: 1, so: 12 }], tau: [{ o: [{ x: 3, y: 0 }], co: 8, vang: 4 }], giao: [{ tau: 0, so: [12] }] },
      maMau: doiBai([['rail(2)', 'wait()', 'pick_up()', 'rail(-2)', 'extend()', 'set_down()'], ['cast_net()', 'wait()', 'reel_in()', 'wait()', 'drop_net()', 'wait()']]),
      loiGiai: doiBai([['rail(2)', 'wait()', 'pick_up()', 'rail(-2)', 'extend()', 'set_down()'], ['cast_net()', 'wait()', 'reel_in()', 'wait()', 'drop_net()', 'wait()']]),
      sao: { o: 14, nhip: 10 },
      goiY: ['rail(-2): số âm, bệ cẩu chạy sang trái 2 ô.'],
      cauDo: { doi: ['CC', 'XU'], lap: null, coChe: ['nuoc', 'cont-troi', 'luoi', 'tau'], cuu: 'hang', meo: 'tiep-suc' }
    }),

    // 2 · cứu kịp: tàu chỉ đậu tới hết nhịp 9 rồi đi luôn. Container 25 trôi xa, ngoài tầm cần. Xuồng tung lưới bắt container, lùi 3 ô kéo nó về cột 3,
    //     nhả lưới. Cẩu phải chạy ray rail(-4) (số âm: sang trái) NGAY từ đầu, trong lúc xuồng kéo; nhấc, rail(-1), vươn cần, hạ lên boong cột 2.
    //     Cẩu chờ xuồng xong mới chạy ray thì tàu đã đi. Bảng 2 cỗ máy (đúng đôi tốt); khe trên ray, batDauNuoc cho xuồng.
    man9('cuu-cang-song', 2, 'lam-quen', {
      ten: 'Tàu không chờ lâu',
      mucTieu: 'giao-tau',
      deBai: 'Tàu chỉ đậu tới hết nhịp 9. Xuồng kéo container về, cẩu chạy ray sang trái cùng lúc rồi nhấc lên tàu.',
      veMaMau: 'Cẩu chờ xuồng xong mới chạy ray: tàu đi mất.',
      san: ['~~T~~~~~~', 'B~~~~~~~~', '~~~~~~~~~', '..RRRRRR.', '#########'],
      doi: [khe({ x: 7, y: 3, huong: 0, nac: 0, tam: 2 }, { batDauNuoc: { x: 7, y: 2, huong: 3 } }), khe({ x: 6, y: 3, huong: 0 }, { batDauNuoc: { x: 2, y: 1, huong: 3 } })],
      them: { contTroi: [{ x: 0, y: 1, so: 25 }], tau: [{ o: [{ x: 2, y: 0 }], co: 9, vang: 40 }], giao: [{ tau: 0, so: [25] }] },
      chonDoi: {
        menu: ['CC', 'XU'],
        cachMau: [{ chon: ['CC', 'XU'], ghiChu: 'đôi tốt', loiGiai: doiBai([
          ['rail(-4)', 'wait()', 'pick_up()', 'rail(-1)', 'extend()', 'set_down()'],
          ['cast_net()', 'wait()', 'for i in range(3):', '    back()', 'drop_net()', 'wait()']]) }]
      },
      maMau: doiBai([['wait_n(5)', 'rail(-4)', 'pick_up()', 'rail(-1)', 'extend()', 'set_down()'], ['cast_net()', 'wait()', 'for i in range(3):', '    back()', 'drop_net()', 'wait()']]),
      loiSai: [
        { moTa: 'Cẩu chờ xuồng xong mới chạy ray: tàu đã đi', baiLam: doiBai([['wait_n(5)', 'rail(-4)', 'pick_up()', 'rail(-1)', 'extend()', 'set_down()'], ['cast_net()', 'wait()', 'for i in range(3):', '    back()', 'drop_net()', 'wait()']]), phaiCoMa: ['chua-giao-tau'] },
        { moTa: 'Không nhả lưới: cẩu không nhấc được', baiLam: doiBai([['rail(-4)', 'wait()', 'pick_up()', 'rail(-1)', 'extend()', 'set_down()'], ['cast_net()', 'wait()', 'for i in range(3):', '    back()']]), phaiCoMa: ['chua-giao-tau'] }
      ],
      sao: { o: 18, nhip: 11 },
      goiY: ['rail(-4): số âm, bệ chạy sang trái 4 ô.', 'Hai bạn làm cùng lúc.'],
      cauDo: { doi: ['CC', 'XU'], lap: null, coChe: ['nuoc', 'cont-troi', 'luoi', 'tau', 'ray'], cuu: 'hang', meo: 'cuu-kip' }
    }),

    // 3 · đọc rồi chọn: ba container trôi, tàu chỉ nhận 14 và 32 (27 là của tàu khác). Container 32 trôi xa, ngoài tầm cần: xuồng bắt, lùi, cuộn dây kéo về cột 6, nhả lưới.
    //     Cẩu chạy ray từng ô, read_code() đọc ô đầu cần (ô trống trả -1, số âm): số dương và khác 27 thì nhấc, vươn cần hạ lên boong.
    //     (Bảng ghi "xuồng thả cái sai": xuồng không có đầu đọc mã, không biết cái nào sai; cái sai nằm yên, cẩu đọc rồi bỏ qua.) Bẫy: robot phân loại (không xuống nước).
    man9('cuu-cang-song', 3, 'luyen', {
      ten: 'Số nào lên tàu',
      mucTieu: 'giao-tau',
      deBai: 'Tàu chỉ nhận container 14 và 32. Container 27 của tàu khác, để yên. read_code() trả -1 khi ô trống.',
      veMaMau: 'Cẩu nhấc cả container 27.',
      san: ['~TTTTTT~~', '~BB~~~~~B', '~~~~~~~~~', '.RRRRRRR.', '#########'],
      doi: [khe({ x: 1, y: 3, huong: 0, nac: 0, tam: 2 }, { batDauNuoc: { x: 4, y: 2, huong: 1 } }), khe({ x: 7, y: 3, huong: 0 }, { batDauNuoc: { x: 6, y: 1, huong: 1 } })],
      them: { contTroi: [{ x: 1, y: 1, so: 14 }, { x: 2, y: 1, so: 27 }, { x: 8, y: 1, so: 32 }], tau: [{ o: [1, 2, 3, 4, 5, 6].map(function (x) { return { x: x, y: 0 }; }), co: 14, vang: 40 }],
        giao: [{ tau: 0, so: [14, 32] }] },
      chonDoi: {
        menu: ['CC', 'XU', 'PL'],
        cachMau: [{ chon: ['CC', 'XU'], ghiChu: 'đôi tốt', loiGiai: doiBai([
          ['for i in range(6):', '    c = read_code()', '    if c > 0 and c != 27:', '        pick_up()', '        extend()', '        set_down()', '        retract()', '    rail(1)'],
          ['cast_net()', 'wait()', 'back()', 'reel_in()', 'wait()', 'drop_net()', 'wait()']]) }]
      },
      maMau: doiBai([['for i in range(6):', '    rail(1)'], ['cast_net()', 'wait()', 'back()', 'reel_in()', 'wait()', 'drop_net()', 'wait()']]),
      loiSai: [
        { moTa: 'Không đọc số: nhấc cả container 27 lên tàu', baiLam: doiBai([['for i in range(6):', '    c = read_code()', '    if c > 0:', '        pick_up()', '        extend()', '        set_down()', '        retract()', '    rail(1)'], ['cast_net()', 'wait()', 'back()', 'reel_in()', 'wait()', 'drop_net()', 'wait()']]), phaiCoMa: ['giao-nham'] },
        { moTa: 'Xuồng không kéo container 32 về: thiếu hàng', baiLam: doiBai([['for i in range(6):', '    c = read_code()', '    if c > 0 and c != 27:', '        pick_up()', '        extend()', '        set_down()', '        retract()', '    rail(1)'], []]), phaiCoMa: ['chua-giao-tau'] }
      ],
      sao: { o: 22, nhip: 17 },
      goiY: ['read_code() == -1: ô đầu cần trống.', 'if c > 0 and c != 27: có container và không phải 27.'],
      cauDo: { doi: ['CC', 'XU'], lap: null, coChe: ['nuoc', 'cont-troi', 'luoi', 'tau', 'doc-ma'], cuu: 'hang', meo: 'doc-roi-chon' }
    }),

    // 4 · chờ tín hiệu: dòng xiết, container 40 trôi nhanh qua tầm cần. Hàng 2 chảy mạnh (2 ô / nhịp): xuồng phải anchor() mới đứng được.
    //     Xuồng neo, tung lưới dài 1 ô giữ container lại, đợi cẩu chạy ray tới cột 6 rồi nhả. Cẩu không đoán giờ: chờ tới khi read_code()
    //     khác -1 (số âm: ô trống) mới nhấc, vươn cần, hạ lên boong. Tàu đầu hàng rời bến ngay khi nhận container (hangTau).
    //     Bảng 2 cỗ máy; khe trên ray, batDauNuoc cho xuồng.
    man9('cuu-cang-song', 4, 'lam-quen', {
      ten: 'Dòng xiết',
      mucTieu: 'giao-tau',
      deBai: 'Dòng xiết cuốn container 40 qua bến. Xuồng neo lại, giữ container chờ cẩu. Cẩu chờ tới khi đọc được số mới nhấc lên tàu.',
      veMaMau: 'Xuồng không neo: dòng cuốn xuồng đi mất.',
      san: ['~~~~~~T~~', '~B~~~~~~~', '~~~~~~~~~', 'RRRRRRR..', '#########'],
      doi: [khe({ x: 0, y: 3, huong: 0, nac: 0, tam: 2 }, { batDauNuoc: { x: 3, y: 2, huong: 0 } }), khe({ x: 1, y: 3, huong: 0 }, { batDauNuoc: { x: 4, y: 2, huong: 0 } })],
      them: { contTroi: [{ x: 1, y: 1, so: 40 }], hangTau: { o: [{ x: 6, y: 0 }], can: [40] }, thac: [{ x: 8, y: 1 }],
        dong: [0, 1, 2, 3, 4, 5, 6, 7, 8].map(function (x) { return { x: x, y: 1, huong: 1, suc: 1 }; })
          .concat([0, 1, 2, 3, 4, 5, 6, 7, 8].map(function (x) { return { x: x, y: 2, huong: 1, suc: 2 }; })) },
      chonDoi: {
        menu: ['CC', 'XU'],
        cachMau: [{ chon: ['CC', 'XU'], ghiChu: 'đôi tốt', loiGiai: doiBai([
          ['rail(6)', 'while read_code() == -1:', '    wait()', 'pick_up()', 'extend()', 'set_down()'],
          ['set_length(1)', 'anchor()', 'wait_n(2)', 'cast_net()', 'wait_n(3)', 'drop_net()', 'wait()']]) }]
      },
      maMau: doiBai([['rail(6)', 'while read_code() == -1:', '    wait()', 'pick_up()', 'extend()', 'set_down()'], ['set_length(1)', 'wait_n(2)', 'cast_net()', 'wait_n(3)', 'drop_net()', 'wait()']]),
      loiSai: [
        { moTa: 'Xuồng không neo: bị dòng cuốn, container trôi mất', baiLam: doiBai([['rail(6)', 'while read_code() == -1:', '    wait()', 'pick_up()', 'extend()', 'set_down()'], ['set_length(1)', 'wait_n(2)', 'cast_net()', 'wait_n(3)', 'drop_net()', 'wait()']]), phaiCoMa: ['qua-nhieu-nhip'] },
        { moTa: 'Cẩu không chờ tín hiệu: nhấc vào ô trống', baiLam: doiBai([['rail(6)', 'pick_up()', 'extend()', 'set_down()'], ['set_length(1)', 'anchor()', 'wait_n(2)', 'cast_net()', 'wait_n(3)', 'drop_net()', 'wait()']]), phaiCoMa: ['chua-giao-tau'] }
      ],
      sao: { o: 18, nhip: 13 },
      goiY: ['read_code() == -1: dưới móc chưa có container.', 'anchor(): xuồng đứng yên giữa dòng.'],
      cauDo: { doi: ['CC', 'XU'], lap: null, coChe: ['nuoc', 'dong', 'neo', 'cont-troi', 'luoi', 'tau'], cuu: 'hang', meo: 'cho-tin-hieu' }
    }),

    // 5 · cứu người, cứu kịp: thủy thủ rơi xuống luồng nước chảy (hàng 1), trôi mỗi nhịp một ô về mép sân. Người ở cột 1, xuồng ở cột 5: d = 1 - 5 âm; xuồng chờ abs(d) - 1 nhịp (lưới tung ở nhịp kế) cho người trôi tới ngay dưới mũi,
    //     tung lưới dài 1 ô kéo người sát bờ, người tự lên bờ. Container đổ chắn lối về trạm cứu: cẩu nhấc đi. Khe trên ray (cẩu), batDauNuoc cho xuồng.
    //     Bẫy: xe cứu hỏa (không xuống nước, không nhấc container).
    man9('cuu-cang-song', 5, 'cung-co', {
      ten: 'Thủy thủ trôi theo dòng',
      mucTieu: 'cuu-nguoi',
      deBai: 'Thủy thủ trôi theo dòng, mỗi nhịp một ô. Kéo người vào bờ kịp lúc, dọn container chắn lối về trạm cứu.',
      veMaMau: 'Xuồng tung lưới sớm quá.',
      san: ['~~~~~~~~~', '~~~~~~~~~', '###...###', '###.#####', '#..RRR..#', '#########'],
      doi: [khe({ x: 4, y: 4, huong: 0, nac: 0, tam: 2 }, { batDauNuoc: { x: 2, y: 0, huong: 2 } }), khe({ x: 5, y: 4, huong: 0 }, { batDauNuoc: { x: 5, y: 0, huong: 2 } })],
      them: { contChan: true, chong: [{ x: 4, y: 2, cont: [{ so: 9 }] }], nguoi: [{ x: 1, y: 1 }], tramCuu: [{ x: 3, y: 3 }],
        dong: [0, 1, 2, 3, 4, 5, 6, 7, 8].map(function (x) { return { x: x, y: 1, huong: 1, suc: 1 }; }) },
      chonDoi: {
        menu: ['CC', 'XU', 'CU'],
        cachMau: [{ chon: ['CC', 'XU'], ghiChu: 'đôi tốt', loiGiai: doiBai([
          ['pick_up()', 'swing_right()', 'set_down()'],
          ['set_length(1)', 'd = 1 - 5', 'wait_n(abs(d) - 1)', 'cast_net()', 'wait()']]) }]
      },
      maMau: doiBai([['pick_up()', 'swing_right()', 'set_down()'], ['set_length(1)', 'cast_net()', 'wait()']]),
      loiSai: [
        { moTa: 'Tung lưới ngay: người chưa tới, trôi xa', baiLam: doiBai([['pick_up()', 'swing_right()', 'set_down()'], ['set_length(1)', 'cast_net()', 'wait()']]), phaiCoMa: ['nguoi-troi-xa'] },
        { moTa: 'Cẩu không nhấc container: người đứng chờ', baiLam: doiBai([[], ['set_length(1)', 'd = 1 - 5', 'wait_n(abs(d) - 1)', 'cast_net()', 'wait()']]), phaiCoMa: ['chua-cuu-nguoi'] }
      ],
      sao: { o: 13, nhip: 9 },
      goiY: ['d = 1 - 5 = -4: người ở bên trái xuồng 4 ô. abs(d) = 4.', 'set_length(1): lưới dài 1 ô.'],
      cauDo: { doi: ['CC', 'XU'], lap: null, coChe: ['nuoc', 'dong', 'nguoi', 'luoi', 'container'], cuu: 'nguoi', meo: 'cuu-kip' }
    }),

    // 6 · dọn lối: container đổ giữa lối duy nhất từ kho ra bến. Cẩu nhấc nó đặt vào hốc bên cạnh (ba lệnh); xe chở hàng đi lên lấy thùng gỗ,
    //     chạy ngang qua chỗ cẩu vừa dọn, quay lên đặt thùng vào ô bến D. Mọi khe trên dải ray R, mặt hướng lên (bảng có cần cẩu).
    //     Bẫy: drone (không nhấc thùng gỗ, không nhấc container). Bảng ghi bẫy máy khai thác: nó nạp / ném chở thùng được như xe, nên đổi thành drone.
    man9('cuu-cang-song', 6, 'cung-co', {
      ten: 'Container chắn lối',
      mucTieu: 'dua-vat',
      deBai: 'Container đổ chắn lối ra bến. Cẩu dọn lối, xe chở thùng gỗ ra ô bến D.',
      veMaMau: 'Xe chạy thẳng vào container.',
      san: ['~~~~~~~~', '#o####D#', '#......#', '#.##.###', '#RRRRR##', '########'],
      doi: [khe({ x: 4, y: 4, huong: 0, nac: 0, tam: 2 }), khe({ x: 1, y: 4, huong: 0 })],
      them: { contChan: true, chong: [{ x: 4, y: 2, cont: [{ so: 7 }] }] },
      chonDoi: {
        menu: ['CC', 'CH', 'DR'],
        cachMau: [{ chon: ['CC', 'CH'], ghiChu: 'đôi tốt', loiGiai: doiBai([
          ['pick_up()', 'retract()', 'set_down()'],
          ['forward(2)', 'pick()', 'turn_right()', 'forward(5)', 'turn_left()', 'drop()']]) }]
      },
      maMau: doiBai([[], ['forward(2)', 'pick()', 'turn_right()', 'forward(5)', 'turn_left()', 'drop()']]),
      loiSai: [
        { moTa: 'Cẩu không dọn: xe đâm container', baiLam: doiBai([[], ['forward(2)', 'pick()', 'turn_right()', 'forward(5)', 'turn_left()', 'drop()']]), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Xe quên lấy thùng', baiLam: doiBai([['pick_up()', 'retract()', 'set_down()'], ['forward(2)', 'turn_right()', 'forward(5)', 'turn_left()']]), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 34, nhip: 14 },
      goiY: ['retract(): cần ngắn lại, móc về ô gần bệ.'],
      cauDo: { doi: ['CC', 'CH'], lap: null, coChe: ['container', 'thung-go', 'dich'], cuu: 'hang', meo: 'don-loi' }
    }),

    // 7 · cứu máy: cần cẩu khách (R3, khoá) hỏng khớp quay: chờ 3 nhịp, chạy ray rail(5) tới cột 6, chờ tới khi dưới móc có container (read_code() khác -1)
    //     rồi nhấc, vươn cần, hạ lên tàu. Sắt vụn nằm trên ray chắn bệ R3: nhện bước lên ô sắt, hút (pull_s: nam châm bụng), bước xuống bãi, thả ra. Container 31 nổi ở cột 2:
    //     xuồng tung lưới, lùi 6 - 2 = 4 ô kéo nó về đúng ô dưới móc R3, nhả lưới. Bẫy: xe cứu hỏa (không hút sắt, không xuống nước).
    man9('cuu-cang-song', 7, 'van-dung', {
      ten: 'Cẩu khách kẹt khớp',
      mucTieu: 'giao-tau',
      deBai: 'Cần cẩu khách chờ 3 nhịp rồi chạy ray, chỉ nhấc được ở cột 6. Sắt vụn chắn ray của nó, container nổi ở xa. Giúp cẩu khách đưa container lên tàu.',
      veMaMau: 'Đọc chương trình của cẩu khoá.',
      san: ['~~~~~~T~~', '~~B~~~~~~', '~~~~~~~~~', 'RRRRRRR..', '.........', '.........', '#########'],
      doi: [khe({ x: 3, y: 4, huong: 0 }, { batDauNuoc: { x: 4, y: 1, huong: 3 } }), khe({ x: 4, y: 4, huong: 0 }, { batDauNuoc: { x: 5, y: 2, huong: 3 } }),
        may('CC', { x: 1, y: 3, huong: 0, nac: 0, tam: 2 }, { son: 'tim', coDinh: true })],
      them: { contTroi: [{ x: 2, y: 1, so: 31 }], hangTau: { o: [{ x: 6, y: 0 }], can: [31] }, vatThem: [VS(4, 3)] },
      chonDoi: {
        menu: ['XU', 'PL', 'CU'],
        cachMau: [{ chon: ['XU', 'PL'], ghiChu: 'đôi tốt', loiGiai: doiBai([
          ['cast_net()', 'wait()', 'for i in range(6 - 2):', '    back()', 'drop_net()', 'wait()'],
          ['go_up()', 'pull_s()', 'go_down()', 'magnet_off()', 'wait()'],
          ['wait_n(3)', 'rail(5)', 'while read_code() == -1:', '    wait()', 'pick_up()', 'extend()', 'set_down()']]) }]
      },
      maMau: doiBai([[], [], ['wait_n(3)', 'rail(5)', 'while read_code() == -1:', '    wait()', 'pick_up()', 'extend()', 'set_down()']]),
      loiSai: [
        { moTa: 'Không dọn sắt: cẩu khách kẹt trên ray', baiLam: doiBai([['cast_net()', 'wait()', 'for i in range(6 - 2):', '    back()', 'drop_net()', 'wait()'], [], ['wait_n(3)', 'rail(5)', 'while read_code() == -1:', '    wait()', 'pick_up()', 'extend()', 'set_down()']]), phaiCoMa: ['het-ray'] },
        { moTa: 'Xuồng kéo thiếu một ô: container không tới dưới móc', baiLam: doiBai([['cast_net()', 'wait()', 'for i in range(3):', '    back()', 'drop_net()', 'wait()'], ['go_up()', 'pull_s()', 'go_down()', 'magnet_off()', 'wait()'], ['wait_n(3)', 'rail(5)', 'while read_code() == -1:', '    wait()', 'pick_up()', 'extend()', 'set_down()']]), phaiCoMa: ['qua-nhieu-nhip'] }
      ],
      sao: { o: 30, nhip: 13 },
      goiY: ['Cẩu khách chỉ nhấc ở cột 6: kéo container 6 - 2 ô.', 'pull_s(): nhện hút sắt ở ô dưới bụng.'],
      cauDo: { doi: ['XU', 'PL'], lap: null, coChe: ['nuoc', 'cont-troi', 'luoi', 'sat', 'ray', 'r3', 'tau'], cuu: 'may', meo: 'tiep-suc' }
    }),

    // 8 · cứu máy, dọn lối: cần cẩu khách (R3, khoá) chờ 5 nhịp, rail(-3) (số âm: sang trái) tới chồng container 15, nhấc, rail(6) sang phải hạ lên tàu.
    //     Sắt vụn nằm trên ray bên trái, thùng nặng trên ray bên phải. Nhện bước lên ô sắt, hút, bước xuống bãi thả ra; xe cứu hỏa ủi thùng nặng
    //     lên ô trống phía trên rồi lùi khỏi ray. Bẫy: drone (không hút sắt, không ủi thùng). Bảng ghi bẫy máy khai thác: nó nạp (load) được sắt vụn
    //     như vật thường, đôi xe cứu hỏa + máy khai thác cũng thắng, nên đổi thành drone.
    man9('cuu-cang-song', 8, 'van-dung', {
      ten: 'Ray hai đầu bị chắn',
      mucTieu: 'giao-tau',
      deBai: 'Cần cẩu khách chờ 5 nhịp, chạy ray sang trái lấy container rồi sang phải lên tàu. Sắt vụn và thùng nặng chắn ray. Dọn cả hai.',
      veMaMau: 'Đọc chương trình của cẩu khoá: rail(-3) rồi rail(6).',
      san: ['~~~~~~~~~~', '#.#####T~~', '#####.####', '#RRRRRRR##', '##.##.####', '##########'],
      doi: [khe({ x: 2, y: 4, huong: 0 }), khe({ x: 5, y: 4, huong: 0 }),
        may('CC', { x: 4, y: 3, huong: 0, nac: 0, tam: 2 }, { son: 'tim', coDinh: true })],
      them: { chong: [{ x: 1, y: 1, cont: [{ so: 15 }] }], hangTau: { o: [{ x: 7, y: 1 }], can: [15] }, vatThem: [VS(2, 3)], thungThem: [{ x: 5, y: 3 }] },
      chonDoi: {
        menu: ['PL', 'CU', 'DR'],
        cachMau: [{ chon: ['PL', 'CU'], ghiChu: 'đôi tốt', loiGiai: doiBai([
          ['go_up()', 'pull_s()', 'go_down()', 'magnet_off()', 'wait()'],
          ['move()', 'back()'],
          ['wait_n(5)', 'rail(-3)', 'pick_up()', 'rail(6)', 'set_down()']]) }]
      },
      maMau: doiBai([[], [], ['wait_n(5)', 'rail(-3)', 'pick_up()', 'rail(6)', 'set_down()']]),
      loiSai: [
        { moTa: 'Chỉ dọn sắt: cẩu khách mang container đâm thùng nặng', baiLam: doiBai([['go_up()', 'pull_s()', 'go_down()', 'magnet_off()', 'wait()'], [], ['wait_n(5)', 'rail(-3)', 'pick_up()', 'rail(6)', 'set_down()']]), phaiCoMa: ['het-ray', 'chua-giao-tau'] },
        { moTa: 'Xe ủi thùng rồi đứng lại trên ray', baiLam: doiBai([['go_up()', 'pull_s()', 'go_down()', 'magnet_off()', 'wait()'], ['move()'], ['wait_n(5)', 'rail(-3)', 'pick_up()', 'rail(6)', 'set_down()']]), phaiCoMa: ['het-ray', 'chua-giao-tau'] }
      ],
      sao: { o: 26, nhip: 19 },
      goiY: ['rail(-3): bệ chạy sang trái 3 ô; rail(6): sang phải 6 ô.', 'Ủi thùng xong thì back() ra khỏi ray.'],
      cauDo: { doi: ['PL', 'CU'], lap: null, coChe: ['ray', 'sat', 'thung-nang', 'container', 'r3', 'tau'], cuu: 'may', meo: 'don-loi' }
    }),

    // 9 · cứu máy, làm cầu: cần cẩu khách (R3, khoá) đứng trên bãi giữa sông, nhấc container 23 rồi chờ 6 nhịp, chạy ray rail(6), vươn cần hạ lên tàu.
    //     Tảng đá đổ trên ray chắn bệ. Máy khai thác ở bờ dưới, cách bãi một luồng nước: xuồng tung lưới kéo bè về ô (4, 4) làm cầu phao,
    //     máy khai thác chờ cầu, đi qua bè lên bãi, nạp tảng đá vào rổ. Bẫy: drone (không nạp đá, không kéo bè).
    //     Bảng ghi "máy khai thác lăn đá lấp hố trên ray": hố lấp xong thành sàn '.', không thành ray, nên đổi thành đá chắn ray + cầu phao (mẹo làm cầu giữ nguyên).
    man9('cuu-cang-song', 9, 'van-dung', {
      ten: 'Cầu phao ra bãi giữa sông',
      mucTieu: 'giao-tau',
      deBai: 'Tảng đá chắn ray của cẩu khách trên bãi giữa sông. Kéo bè làm cầu phao cho máy khai thác sang dọn đá.',
      veMaMau: 'Đọc chương trình của cẩu khoá: nhấc, chờ 6 nhịp rồi chạy ray.',
      san: ['~~~~~~~T~', '~.~~~~~~~', '~RRRRRRR~', '~.......~', '~~~~~~B~~', '#.......#', '#########'],
      doi: [khe({ x: 2, y: 5, huong: 0 }, { batDauNuoc: { x: 4, y: 4, huong: 1 } }), khe({ x: 4, y: 5, huong: 0 }, { batDauNuoc: { x: 2, y: 4, huong: 1 } }),
        may('CC', { x: 1, y: 2, huong: 0, nac: 0, tam: 1 }, { son: 'tim', coDinh: true })],
      them: { chong: [{ x: 1, y: 1, cont: [{ so: 23 }] }], hangTau: { o: [{ x: 7, y: 0 }], can: [23] }, vatThem: [{ x: 4, y: 2 }] },
      chonDoi: {
        menu: ['XU', 'KT', 'DR'],
        cachMau: [{ chon: ['XU', 'KT'], ghiChu: 'đôi tốt', loiGiai: doiBai([
          ['cast_net()', 'wait()', 'back()', 'back()', 'drop_net()', 'wait()'],
          ['wait_n(4)', 'move()', 'move()', 'load()', 'wait()'],
          ['pick_up()', 'wait_n(6)', 'rail(6)', 'extend()', 'set_down()']]) }]
      },
      maMau: doiBai([[], [], ['pick_up()', 'wait_n(6)', 'rail(6)', 'extend()', 'set_down()']]),
      loiSai: [
        { moTa: 'Máy khai thác đi ngay: chưa có cầu, đâm nước', baiLam: doiBai([['cast_net()', 'wait()', 'back()', 'back()', 'drop_net()', 'wait()'], ['move()', 'move()', 'load()', 'wait()'], ['pick_up()', 'wait_n(6)', 'rail(6)', 'extend()', 'set_down()']]), phaiCoMa: ['het-ray', 'chua-giao-tau'] },
        { moTa: 'Xuồng kéo bè thiếu một ô', baiLam: doiBai([['cast_net()', 'wait()', 'back()', 'drop_net()', 'wait()'], ['wait_n(4)', 'move()', 'move()', 'load()', 'wait()'], ['pick_up()', 'wait_n(6)', 'rail(6)', 'extend()', 'set_down()']]), phaiCoMa: ['het-ray', 'chua-giao-tau'] }
      ],
      sao: { o: 29, nhip: 18 },
      goiY: ['Bè nổi trên nước là cầu phao: xe đi qua được.', 'Máy khai thác chờ xuồng kéo bè xong mới đi.'],
      cauDo: { doi: ['XU', 'KT'], lap: null, coChe: ['nuoc', 'be', 'luoi', 'da', 'ray', 'r3', 'tau'], cuu: 'may', meo: 'lam-cau' }
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
      deBai: 'Sang chương Lập trình cứu Cảng sông, em sẽ chế tạo các hàm phối hợp giữa cần cẩu R1 và đội robot chi viện R2! Hãy nhấn Chạy để xem R2 (bánh gai) gọi hàm sonic_rail() vừa phá đá chuông ở (2, 3) vừa lùi khỏi đường ray, giúp R1 gọi slide_load(1, 2) giao kiện 18 lên tàu.',
      veMaMau: 'Quan sát hàm sonic_rail() của R2 phối hợp cùng slide_load(1, 2) của R1.',
      bd: [{ x: 1, y: 3, nac: 2, tam: 1 }, { x: 3, y: 3, huong: 3 }],
      chong: [CW(2, 4, [[18, 2]])],
      daChuong: [{ x: 2, y: 3, not: 4, ben: 1 }],
      tau: tauDon(6, 2),
      giao: [{ tau: 0, so: [18] }],
      maMau: baiDoi(['wait()', 'slide_load(1, 2)'], ['sonic_rail()'], [], [H_SONIC_RAIL]),
      loiGiai: baiDoi(['wait()', 'slide_load(1, 2)'], ['sonic_rail()'], [], [H_SONIC_RAIL]),
      sao: { o: 22, nhip: 6 },
      goiY: ['Nhấn Chạy để xem hàm sonic_rail() hoạt động.']
    }),

    manCS('lap-cang-song', 2, 'lam-quen', {
      ten: 'Chế tạo hàm sonic_rail cho bánh gai ở cảng',
      r2: R_GAI,
      taoHam: ['sonic_rail'],
      hamCuaEmCan: ['slide_load', 'play_note', 'back', 'wait_n'],
      deBai: 'Hãy định nghĩa hàm sonic_rail() cho R2 gồm 2 lệnh: play_note(listen()) để phá tảng đá chuông trước mặt, rồi back() để lùi 1 ô nhường đường ray cho cần cẩu! Ở chương trình chính, R2 đứng ở (3, 3) hướng trái gọi sonic_rail() phá đá chuông (2, 3) rồi lùi sang (4, 3), để R1 chờ 2 nhịp rồi gọi slide_load(2, 2) bốc kiện 27 ở (3, 4) lên tàu.',
      veMaMau: 'Hoàn thiện thân hàm sonic_rail() gồm play_note(listen()) và back().',
      bd: [{ x: 1, y: 3, nac: 2, tam: 1 }, { x: 3, y: 3, huong: 3 }],
      chong: [CW(3, 4, [[27, 2]])],
      daChuong: [{ x: 2, y: 3, not: 5, ben: 1 }],
      tau: tauDon(8, 2),
      giao: [{ tau: 0, so: [27] }],
      maMau: baiDoi(['wait_n(2)', 'slide_load(2, 2)'], ['sonic_rail()']),
      loiGiai: baiDoi(['wait_n(2)', 'slide_load(2, 2)'], ['sonic_rail()'], [H_SONIC_RAIL]),
      loiSai: [
        { moTa: 'Hàm sonic_rail() thiếu back() nên R2 vẫn đứng ở (3, 3) chặn R1 trượt rail(2)', baiLam: baiDoi(['wait_n(2)', 'slide_load(2, 2)'], ['sonic_rail()']), hamCuaEmMoi: [{ ten: 'sonic_rail', thamSo: [], than: ['play_note(listen())'] }], phaiCoMa: ['het-ray'] }
      ],
      sao: { o: 24, nhip: 8 },
      goiY: ['Trong hàm sonic_rail(), thêm back() ngay dưới play_note(listen()).']
    }),

    manCS('lap-cang-song', 3, 'luyen', {
      ten: 'Tái sử dụng sonic_rail phá 2 lớp đá trên ray',
      r2: R_GAI,
      hamCuaEmCan: ['slide_load2', 'play_note', 'back', 'wait_n', 'sonic_rail'],
      deBai: 'Trên đường ray có tảng đá chuông ở (3, 3), còn R2 đứng ở (4, 3) hướng trái. Hãy gọi sonic_rail() cho R2 để phá đá chuông ở (3, 3) và lùi sang (5, 3), giúp R1 ở (1, 3) chờ 2 nhịp rồi gọi slide_load2(3, 2) trượt 3 ô sang cột 4 bốc đôi cặp kiện [20, 40] ở (4, 4) lên tàu!',
      veMaMau: 'Gọi sonic_rail() cho R2 và slide_load2(3, 2) cho R1.',
      bd: [{ x: 1, y: 3, nac: 2, tam: 1 }, { x: 4, y: 3, huong: 3 }],
      chong: [CW(4, 4, [[20, 1], [40, 2]])],
      daChuong: [{ x: 3, y: 3, not: 7, ben: 1 }],
      tau: tauDon(9, 2),
      giao: [{ tau: 0, so: [20, 40] }],
      maMau: baiDoi(['wait_n(2)', 'slide_load2(3, 2)'], ['wait()']),
      loiGiai: baiDoi(['wait_n(2)', 'slide_load2(3, 2)'], ['sonic_rail()']),
      loiSai: [
        { moTa: 'R2 đứng yên không gọi sonic_rail() nên R1 vướng cả đá chuông (3, 3) lẫn R2 (4, 3)', baiLam: baiDoi(['wait_n(2)', 'slide_load2(3, 2)'], ['wait()']), phaiCoMa: ['het-ray'] }
      ],
      sao: { o: 24, nhip: 9 },
      goiY: ['Thay wait() của R2 bằng sonic_rail().']
    }),

    manCS('lap-cang-song', 4, 'luyen', {
      ten: 'Chế tạo hàm grab_clear cho xe kho dọn bãi',
      r2: R_BANH,
      taoHam: ['grab_clear'],
      hamCuaEmCan: ['slide_load', 'pick', 'back', 'wait_n'],
      deBai: 'Hãy định nghĩa hàm grab_clear() cho R2 (xe hai bánh) gồm 2 lệnh: pick() để gắp kiện gỗ trước mặt, rồi back() để lùi 1 ô nhường chỗ cho cần cẩu! Ở chương trình chính, R2 ở (3, 3) hướng trái gọi grab_clear() để gắp kiện gỗ tại (2, 3) và lùi sang (4, 3); R1 chờ 3 nhịp rồi gọi slide_load(2, 2) bốc kiện 33 ở (3, 4) lên tàu.',
      veMaMau: 'Hoàn thiện hàm grab_clear() gồm pick() và back().',
      bd: [{ x: 1, y: 3, nac: 2, tam: 1 }, { x: 3, y: 3, huong: 3 }],
      chong: [CW(3, 4, [[33, 2]])],
      vatThem: [{ x: 2, y: 3 }],
      tau: tauDon(9, 2),
      giao: [{ tau: 0, so: [33] }],
      maMau: baiDoi(['wait_n(3)', 'slide_load(2, 2)'], ['grab_clear()']),
      loiGiai: baiDoi(['wait_n(3)', 'slide_load(2, 2)'], ['grab_clear()'], [H_GRAB_CLEAR]),
      loiSai: [
        { moTa: 'Hàm grab_clear() thiếu lệnh back() nên R2 vẫn đứng ở (3, 3) chặn R1', baiLam: baiDoi(['wait_n(3)', 'slide_load(2, 2)'], ['grab_clear()']), hamCuaEmMoi: [{ ten: 'grab_clear', thamSo: [], than: ['pick()'] }], phaiCoMa: ['het-ray'] }
      ],
      sao: { o: 27, nhip: 9 },
      goiY: ['Trong hàm grab_clear(), thêm back() ngay dưới pick().']
    }),

    manCS('lap-cang-song', 5, 'cung-co', {
      ten: 'Sửa lỗi hàm grab_clear giải phóng bãi trung chuyển',
      r2: R_BANH, taiToiDa: 4,
      hamCuaEmCan: ['swing_by', 'carry2_by', 'pick', 'back'],
      deBai: 'Trong màn này hàm grab_clear() của R2 bị viết ngược thứ tự (gọi back() trước pick() nên R2 lùi ra xa không gắp được kiện gỗ ở (3, 4)!). Hãy sửa lại hàm grab_clear() thành pick() rồi back(), giúp R2 ở (4, 4) hướng trái (huong = 3) gắp kiện gỗ ở (3, 4) và lùi sang (5, 4) nhường ô trung chuyển (3, 4) cho R1 gom 2 kiện [18, 36] từ (3, 5) về (3, 4) rồi bốc đôi lên tàu!',
      veMaMau: 'Sửa lại thứ tự lệnh trong grab_clear() thành pick() rồi back().',
      bd: [{ x: 3, y: 3, nac: 2, tam: 1 }, { x: 4, y: 4, huong: 3 }],
      chong: [CW(3, 5, [[18, 2], [36, 2]])],
      vatThem: [{ x: 3, y: 4 }],
      tau: tauDon(12, 2),
      giao: [{ tau: 0, so: [36, 18] }],
      maMau: baiDoi(['for i in range(2):', '    extend()', '    pick_up()', '    retract()', '    set_down()', 'carry2_by(2)'], ['grab_clear()'], [], [
        { ten: 'grab_clear', thamSo: [], than: ['back()', 'pick()'] }
      ]),
      loiGiai: baiDoi(['for i in range(2):', '    extend()', '    pick_up()', '    retract()', '    set_down()', 'carry2_by(2)'], ['grab_clear()'], [], [H_GRAB_CLEAR]),
      loiSai: [
        { moTa: 'Chưa sửa thứ tự lệnh trong grab_clear() nên kiện gỗ vẫn nằm ở (3, 4) chặn R1 hạ hàng', baiLam: baiDoi(['for i in range(2):', '    extend()', '    pick_up()', '    retract()', '    set_down()', 'carry2_by(2)'], ['grab_clear()'], [], [{ ten: 'grab_clear', thamSo: [], than: ['back()', 'pick()'] }]), phaiCoMa: ['ha-bi-chan'] }
      ],
      sao: { o: 27, nhip: 12 },
      goiY: ['Trong hàm grab_clear(), đổi thứ tự thành pick() trước rồi back() sau.']
    }),

    manCS('lap-cang-song', 6, 'cung-co', {
      ten: 'Chế tạo hàm wait_slide_load cho cần cẩu',
      r2: R_NHEN,
      taoHam: ['wait_slide_load'],
      hamCuaEmCan: ['slide_load', 'clear_rail', 'wait_n'],
      deBai: 'Hãy định nghĩa hàm wait_slide_load(t, s) cho R1 gồm 2 lệnh: wait_n(t) để chờ đồng đội dọn đường ray trong t nhịp, rồi slide_load(s, 2) để trượt s bước và bốc container ở tầm 1 lên tàu! Ở chương trình chính, R2 (nhện) gọi clear_rail("R") dọn sắt ở (2, 3), còn R1 gọi wait_slide_load(3, 1) để giao kiện 45 lên tàu.',
      veMaMau: 'Hoàn thiện hàm wait_slide_load(t, s) gồm wait_n(t) và slide_load(s, 2).',
      bd: [{ x: 1, y: 3, nac: 2, tam: 1 }, { x: 2, y: 3, huong: 1 }],
      chong: [CW(2, 4, [[45, 2]])],
      vatThem: [VS(2, 3)],
      tau: tauDon(8, 2),
      giao: [{ tau: 0, so: [45] }],
      maMau: baiDoi(['wait_slide_load(3, 1)'], ['clear_rail("L")']),
      loiGiai: baiDoi(['wait_slide_load(3, 1)'], ['clear_rail("R")'], [H_WAIT_SLIDE_LOAD]),
      loiSai: [
        { moTa: 'Hàm wait_slide_load(t, s) thiếu slide_load(s, 2) nên R1 chưa trượt và bốc hàng', baiLam: baiDoi(['wait_slide_load(3, 1)'], ['clear_rail("R")']), hamCuaEmMoi: [{ ten: 'wait_slide_load', thamSo: ['t', 's'], than: ['wait_n(t)'] }], phaiCoMa: ['chua-giao-tau'] }
      ],
      sao: { o: 30, nhip: 8 },
      goiY: ['Trong wait_slide_load(t, s) thêm slide_load(s, 2); ở R2 sửa clear_rail("L") thành clear_rail("R") để bước sang (3, 3).']
    }),

    manCS('lap-cang-song', 7, 'van-dung', {
      ten: 'Kết hợp wait_slide_load và sonic_rail',
      r2: R_GAI,
      hamCuaEmCan: ['slide_load', 'wait_n', 'sonic_rail', 'wait_slide_load'],
      deBai: 'Tảng đá chuông nốt 2 nằm ở (2, 3) và R2 (bánh gai) đứng ở (3, 3) hướng trái. Hãy cho R2 gọi sonic_rail() để phá đá chuông ở (2, 3) và lùi sang (4, 3); cùng lúc đó R1 ở (1, 3) gọi wait_slide_load(2, 2) để chờ 2 nhịp rồi trượt 2 ô sang cột 3 bốc kiện 52 ở (3, 4) lên tàu!',
      veMaMau: 'Gọi wait_slide_load(2, 2) cho R1 và sonic_rail() cho R2.',
      bd: [{ x: 1, y: 3, nac: 2, tam: 1 }, { x: 3, y: 3, huong: 3 }],
      chong: [CW(3, 4, [[52, 2]])],
      daChuong: [{ x: 2, y: 3, not: 2, ben: 1 }],
      tau: tauDon(8, 2),
      giao: [{ tau: 0, so: [52] }],
      maMau: baiDoi(['wait_slide_load(2, 1)'], ['sonic_rail()']),
      loiGiai: baiDoi(['wait_slide_load(2, 2)'], ['sonic_rail()']),
      loiSai: [
        { moTa: 'Truyền nhầm wait_slide_load(2, 1) nên R1 dừng ở cột 2, không có hàng để nhấc', baiLam: baiDoi(['wait_slide_load(2, 1)'], ['sonic_rail()']), phaiCoMa: ['moc-hut', 'chua-giao-tau'] }
      ],
      sao: { o: 25, nhip: 8 },
      goiY: ['Sửa wait_slide_load(2, 1) thành wait_slide_load(2, 2) ở chương trình R1.']
    }),

    manCS('lap-cang-song', 8, 'van-dung', {
      ten: 'Dây chuyền 2 nhịp với wait_slide_load và grab_clear',
      r2: R_BANH,
      hamCuaEmCan: ['swing_by', 'slide_load', 'wait_n', 'grab_clear', 'wait_slide_load'],
      deBai: 'Trên đường ray có kiện gỗ o ở (2, 3), còn R2 (xe hai bánh) đứng ở (3, 3) hướng trái. R1 cần bốc lần lượt kiện 23 ở (2, 4) rồi kiện 37 ở (3, 4) lên tàu! Hãy cho R2 gọi grab_clear() để gắp kiện gỗ ở (2, 3) và lùi sang (4, 3); còn R1 gọi wait_slide_load(3, 1) để bốc kiện 23 ở cột 2, gọi swing_by(2) quay cần về hướng Nam rồi gọi tiếp slide_load(1, 2) sang cột 3 bốc nốt kiện 37!',
      veMaMau: 'Thêm swing_by(2) và slide_load(1, 2) cho R1 để giao kiện thứ hai ở cột 3.',
      bd: [{ x: 1, y: 3, nac: 2, tam: 1 }, { x: 3, y: 3, huong: 3 }],
      chong: [CW(2, 4, [[23, 1]]), CW(3, 4, [[37, 2]])],
      vatThem: [{ x: 2, y: 3 }],
      tau: tauDon(15, 2),
      giao: [{ tau: 0, so: [23, 37] }],
      maMau: baiDoi(['wait_slide_load(3, 1)'], ['grab_clear()']),
      loiGiai: baiDoi(['wait_slide_load(3, 1)', 'swing_by(2)', 'slide_load(1, 2)'], ['grab_clear()']),
      loiSai: [
        { moTa: 'R1 mới giao kiện 23 ở cột 2, chưa quay cần và gọi slide_load(1, 2) để giao kiện 37 ở cột 3', baiLam: baiDoi(['wait_slide_load(3, 1)'], ['grab_clear()']), phaiCoMa: ['chua-giao-tau'] }
      ],
      sao: { o: 30, nhip: 15 },
      goiY: ['Ở chương trình R1, thêm swing_by(2) và slide_load(1, 2) ngay dưới wait_slide_load(3, 1).']
    }),

    manCS('lap-cang-song', 9, 'bien-the', {
      ten: 'Tổng duyệt Cảng sông - Hang động',
      r2: R_GAI,
      hamCuaEmCan: ['swing_by', 'slide_load', 'slide_load2', 'wait_n', 'sonic_rail', 'wait_slide_load'],
      deBai: 'Tổng duyệt trước màn hợp tấu! Trên đường ray tại (2, 3) có tảng đá chuông nốt 6, còn R2 (bánh gai) đứng ở (3, 3) hướng trái. R1 cần giao kiện đơn [17] ở (2, 4) rồi trượt sang cột 4 bốc đôi cặp kiện [26, 38] ở (4, 4)! Hãy cho R2 gọi sonic_rail() rồi back() (lùi tiếp từ (4, 3) sang (5, 3) nhường cột 4 cho R1); còn R1 gọi wait_slide_load(2, 1) bốc kiện [17] ở cột 2, gọi swing_by(2) quay cần về hướng Nam rồi gọi slide_load2(2, 2) sang cột 4 bốc đôi [26, 38]!',
      veMaMau: 'Phối hợp wait_slide_load(2, 1), swing_by(2), slide_load2(2, 2) của R1 và sonic_rail(), back() của R2.',
      bd: [{ x: 1, y: 3, nac: 2, tam: 1 }, { x: 3, y: 3, huong: 3 }],
      chong: [CW(2, 4, [[17, 1]]), CW(4, 4, [[26, 2], [38, 2]])],
      daChuong: [{ x: 2, y: 3, not: 6, ben: 1 }],
      tau: tauDon(15, 2),
      giao: [{ tau: 0, so: [17, 26, 38] }],
      maMau: baiDoi(['wait_slide_load(2, 1)'], ['sonic_rail()']),
      loiGiai: baiDoi(['wait_slide_load(2, 1)', 'swing_by(2)', 'slide_load2(2, 2)'], ['sonic_rail()', 'back()']),
      loiSai: [
        { moTa: 'R2 chưa lùi thêm 1 ô sang (5, 3) và R1 chưa gọi swing_by(2), slide_load2(2, 2)', baiLam: baiDoi(['wait_slide_load(2, 1)'], ['sonic_rail()']), phaiCoMa: ['chua-giao-tau'] }
      ],
      sao: { o: 33, nhip: 15 },
      goiY: ['R1 thêm swing_by(2) và slide_load2(2, 2); R2 thêm back() sau sonic_rail().']
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
