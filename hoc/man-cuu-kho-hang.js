/* ============================================================================
   man-cuu-kho-hang.js - Mùa 9 Về CLB: Gói 1 "Kho hàng sau bão" (M9M1 5/11; MẪU cho 9 gói sau)
   Câu đố: hoc/MUA-9-200-CAU-DO.md mục G1 (20 dòng); luật: hoc/KE-HOACH-MUA-9-TO-HOP.md. Bão: bùn trơn I, kệ sập thành hố u, thùng đổ.
   - Chương 1 cuu-kho-hang: CHỌN ĐỘI (man.chonDoi, cỗ máy CoMay.dung); màn 7–9 có R3 máy khách khoá (coDinh, chạy maMau.doi[2]).
   - Chương 2 lap-kho-hang: R1 xe chở hàng đặt sẵn, Luna TỰ LẮP R2 (man.lapRap.robot = 1).
   - Mỗi màn khai man.cauDo (dấu câu đố, máy kiểm hoc/kiem-cau-do-mua-9.mjs). Ôn Python G1: def (hàm tự đặt ở Xưởng), for (đếm ô).
   - Màn 10 mỗi chương: song ca đoạn 1 "Kìa con bướm vàng" (Bè 1: 1 1 5 5 6 6 5 5 | Bè 2: 1 3 5 3 4 4 1 1), giữ để gói 10 ghép bài.
   Khung một màn: man9(chuong, so, hang, cfg) bên dưới; cfg.doi = mảng robot (CoMay.dung cho màn đội cố định, hay { batDau, co } cho màn chọn đội / khe lắp).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;
  var CoMay = laNode ? require('./co-may.js') : window.CoMay;

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

  /* ---- M9M1: khung màn mùa 9 (chép sang 9 gói sau) ------------------------------------------------
     cfg: ten, deBai, veMaMau, goiY, san, noi?, mucTieu?, doi: [robot…], chonDoi? | lapRap?, maMau, loiGiai? (màn chọn đội / lắp: lấy từ cách mẫu đầu),
          loiSai?, sao, cauDo, chiChay?, taoHam?, hamCuaEmCan?, khung?, them? (trường lõi khác: nguoi, tramCuu, dieu, daChuong…). */
  var HAM_EM = ['move', 'turn_right', 'turn_left', 'back', 'pick', 'drop', 'forward', 'wait_n', 'fly_right'];
  /** Robot của màn: cỗ máy `ma` (CoMay.dung) ở ô xuất phát bd, cờ riêng co, đế son ('lam' Luna, 'tim' máy khách). */
  function may(ma, bd, them) {
    var t = them || {};
    var r = CoMay.dung(ma, { batDau: bd, son: t.son, pin: t.pin });
    if (t.co) r.co = t.co;
    if (t.coDinh) r.coDinh = true;
    if (t.tay) { r.robot.tay = t.tay; r.hamGoc = r.hamGoc.filter(function (h) { return (t.boHam || []).indexOf(h) < 0; }).concat(t.themHam || []); }
    if (t.phatNot) r.phatNot = true;
    return r;
  }
  /** Khe robot em lập trình ở màn chọn đội / khe lắp: chỉ ô xuất phát, cờ, pin (drone), đế. */
  function khe(bd, them) { return Object.assign({ batDau: bd }, them || {}); }
  function doiBai(ds, hamMan, hamEm) {
    return { doi: ds.map(function (c) { return { chinh: c.slice() }; }), hamCuaMan: clone(hamMan || []), hamCuaEmMoi: clone(hamEm || []) };
  }
  /** R2 đã lắp sẵn (màn show chương 2): bánh gai + kẹp xoay + khoảng cách, như LapRap.apDung lắp ra. */
  var GAI_XOAY = {
    loaiRobot: 'gai', robot: { than: 'gai', tay: 'xoay', camBien: [{ ma: 'khoang-cach', o: 'hong' }], son: 'lam' },
    hamGoc: BANH.concat(['retract_spikes', 'extend_spikes', 'arm_down', 'arm_up', 'grab', 'release', 'arm_left', 'arm_right', 'front_clear', 'left_clear', 'right_clear'])
  };
  /** Một cách lắp mẫu (màn tự lắp, lapRap.robot = 1): part của R2 + lời giải cả đội. */
  function cach(than, tay, cam, ds, hamEm) { return { than: than, tay: tay || null, camBien: cam || null, loiGiai: doiBai(ds, [], hamEm) }; }
  /** lapRap của chương 2: Luna lắp R2; lời giải mẫu chạy trên kho hàm của em (dungKho). */
  function lapR2(than, tay, cam, nganSach, cachLap, them) {
    return Object.assign({ robot: 1, than: than, tay: tay, camBien: cam, nganSach: nganSach, dungKho: true, cachLap: cachLap }, them || {});
  }
  function man9(chuong, so, hang, cfg) {
    var r1 = cfg.doi[0];
    var m = {
      chuong: chuong, so: so, ten: cfg.ten, hang: hang, vo: 'kho',
      cauTruc: ['for', 'if', 'while', 'list'], vaHoac: true, moXuong: true, camHamCuaEm: false,
      hamCuaEmCan: cfg.hamCuaEmCan || HAM_EM, taoHam: cfg.taoHam || [],
      khung: cfg.khung || { chinh: 12, moiHam: 8 }, mucTieu: cfg.mucTieu || 'toi-co',
      deBai: cfg.deBai, veMaMau: cfg.veMaMau || '', san: cfg.san, batDau: clone(r1.batDau),
      doi: cfg.doi.map(clone), maMau: cfg.maMau, loiSai: cfg.loiSai || [], sao: cfg.sao, goiY: cfg.goiY || [], cauDo: cfg.cauDo
    };
    if (r1.loaiRobot) { m.loaiRobot = r1.loaiRobot; m.robot = clone(r1.robot); m.hamGoc = r1.hamGoc.slice(); }   // trường đầu màn = R1 (màn chọn đội: macDinh điền)
    if (cfg.loiGiai) m.loiGiai = cfg.loiGiai;
    if (cfg.chonDoi) m.chonDoi = cfg.chonDoi;
    if (cfg.lapRap) m.lapRap = cfg.lapRap;
    if (cfg.noi) m.noi = cfg.noi;
    if (cfg.chiChay) { m.chiChay = true; m.chinhCoDinh = true; }
    Object.keys(cfg.them || {}).forEach(function (k) { m[k] = cfg.them[k]; });
    return ManHoc.chuanHoa(m);
  }

  ManHoc.manCuuKhoHang = [
    /* ========================================================================
       CHƯƠNG 1: cuu-kho-hang (10 màn)
       ======================================================================== */
    // 1 · show: drone rắc cát 3 ô bùn, xe chở thùng qua (chạy sẵn, khoá). Đội cố định CH + DR (màn chạy sẵn không qua bảng chọn: chọn ngược thì chương trình khoá sai robot).
    man9('cuu-kho-hang', 1, 'lam-quen', {
      ten: 'Cát trên bùn',
      chiChay: true, mucTieu: 'dua-vat',
      deBai: 'Bão làm sàn kho thành bùn trơn. Drone rắc cát, xe chở thùng qua. Bấm Chạy.',
      veMaMau: 'Bấm Chạy xem mỗi bạn làm gì.',
      san: ['####.##', '#o.IIIu', '#####.#', '#####D#'],
      doi: [may('CH', { x: 2, y: 1, huong: 3 }), may('DR', { x: 6, y: 1 }, { son: 'lam' })],
      maMau: doiBai([
        ['pick()', 'turn_right()', 'turn_right()', 'forward(3)', 'turn_right()', 'move()', 'drop()'],
        ['for i in range(3):', '    go_left()', '    dot()', 'go_right()', 'go_up()', 'land()']]),
      loiGiai: doiBai([
        ['pick()', 'turn_right()', 'turn_right()', 'forward(3)', 'turn_right()', 'move()', 'drop()'],
        ['for i in range(3):', '    go_left()', '    dot()', 'go_right()', 'go_up()', 'land()']]),
      sao: { o: 36, nhip: 12 },
      goiY: ['Không có cát, xe trượt trên bùn rơi xuống hố.'],
      cauDo: { doi: ['CH', 'DR'], lap: null, coChe: ['bun', 'rac-cat', 'ho'], cuu: 'hang', meo: 'lam-cau' }
    }),

    // 2 · ép for: drone chỉ đủ pin rắc một lối; lối trên 3 ô bùn (vừa pin), lối dưới 6 ô (hết pin). for đếm ô, khung 6 dòng buộc dùng vòng lặp.
    man9('cuu-kho-hang', 2, 'lam-quen', {
      ten: 'Lối nào ngắn',
      mucTieu: 'dua-vat', khung: { chinh: 6, moiHam: 8 },
      deBai: 'Pin drone chỉ đủ rắc một lối rồi đáp xuống ô sạc P. Đếm ô bùn, rắc lối ngắn.',
      veMaMau: 'Drone mới rắc một ô. Dùng for.',
      san: ['####P#####', '#.IIID####', '#o########', '#.IIIIIID#', '##########'],
      doi: [khe({ x: 1, y: 3, huong: 0 }), khe({ x: 1, y: 1, huong: 1 }, { pin: 6 })],
      chonDoi: {
        menu: ['CH', 'DR'],
        cachMau: [{ chon: ['CH', 'DR'], ghiChu: 'đôi tốt', loiGiai: doiBai([
          ['pick()', 'forward(2)', 'turn_right()', 'forward(3)', 'drop()'],
          ['for i in range(3):', '    go_right()', '    dot()', 'go_up()', 'land()']]) }]
      },
      maMau: doiBai([
        ['pick()', 'forward(2)', 'turn_right()', 'forward(3)', 'drop()'],
        ['go_right()', 'dot()', 'go_up()', 'land()']]),
      loiSai: [
        { moTa: 'Rắc lối dưới 6 ô: drone hết pin giữa đường', baiLam: doiBai([['pick()', 'turn_right()', 'forward(6)', 'drop()'], ['go_down()', 'go_down()', 'for i in range(6):', '    go_right()', '    dot()', 'land()']]), phaiCoMa: ['het-pin'] }
      ],
      sao: { o: 33, nhip: 11 },
      goiY: ['Lối trên có 3 ô bùn: for i in range(3).'],
      cauDo: { doi: ['CH', 'DR'], lap: null, coChe: ['bun', 'rac-cat', 'pin'], cuu: 'hang', meo: 'doc-roi-chon' }
    }),

    // 3 · bánh gai bám bùn, dừng giữa dải để rẽ xuống nút đè M giữ cửa; xe chở hàng mang thùng qua cửa. Xe thường vào dải là trượt tới hố.
    man9('cuu-kho-hang', 3, 'luyen', {
      ten: 'Gai giữ cửa',
      mucTieu: 'dua-vat',
      deBai: 'Nút M nằm dưới dải bùn. Bánh gai bám bùn, dừng được giữa dải. Ai giữ cửa?',
      veMaMau: 'Robot dưới chưa qua cửa C.',
      san: ['########', '#.IIIu##', '###M####', '#.o.C.D#', '########'],
      noi: [{ nut: { x: 3, y: 2 }, cua: [{ x: 4, y: 3 }] }],
      doi: [khe({ x: 1, y: 1, huong: 1 }), khe({ x: 1, y: 3, huong: 1 })],
      chonDoi: {
        menu: ['CH', 'HD'],
        cachMau: [{ chon: ['HD', 'CH'], ghiChu: 'đôi tốt', loiGiai: doiBai([
          ['forward(2)', 'turn_right()', 'move()'],
          ['pick()', 'forward(4)', 'drop()']]) }]
      },
      maMau: doiBai([['forward(2)'], ['pick()', 'forward(4)', 'drop()']]),
      loiSai: [
        { moTa: 'Bánh gai chưa rẽ xuống nút M: cửa C đóng', baiLam: doiBai([['forward(2)'], ['pick()', 'forward(4)', 'drop()']]), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      sao: { o: 28, nhip: 9 },
      goiY: ['Bánh gai lên dải bùn, xe chở hàng ở dưới.'],
      cauDo: { doi: ['CH', 'HD'], lap: null, coChe: ['bun', 'nut-de', 'cua'], cuu: 'hang', meo: 'giu-cua' }
    }),

    // 4 · song song: drone phải rắc ô rẽ của dải xa TRƯỚC khi xe trượt qua dải gần tới đó (chờ thì quá trần). Bẫy: xe cứu hỏa (xích cũng trượt, không rắc được).
    man9('cuu-kho-hang', 4, 'luyen', {
      ten: 'Rắc kịp',
      mucTieu: 'dua-vat',
      deBai: 'Xe trượt qua dải gần. Ô rẽ ở dải xa phải có cát trước khi xe tới.',
      veMaMau: 'Hai bạn cùng chạy ngay từ đầu.',
      san: ['####....##', '#o.II.IIu#', '#######D##', '##########'],
      doi: [khe({ x: 2, y: 1, huong: 3 }), khe({ x: 4, y: 0, huong: 1 })],
      chonDoi: {
        menu: ['CH', 'DR', 'CU'],
        cachMau: [{ chon: ['CH', 'DR'], ghiChu: 'đôi tốt', loiGiai: doiBai([
          ['pick()', 'turn_right()', 'turn_right()', 'forward(2)', 'turn_right()', 'drop()'],
          ['fly_right(3)', 'go_down()', 'dot()', 'go_up()']]) }]
      },
      maMau: doiBai([['pick()', 'turn_right()', 'turn_right()'], ['fly_right(3)']]),
      sao: { o: 35, nhip: 10 },
      goiY: ['Trên bùn, một bước move() trượt tới hết dải.'],
      cauDo: { doi: ['CH', 'DR'], lap: null, coChe: ['bun', 'rac-cat', 'ho'], cuu: 'hang', meo: 'song-song' }
    }),

    // 5 · cứu người: thùng đổ chắn lối tới nút; xe chở hàng nhấc thùng (dọn lối), bánh gai qua ô đó, dừng giữa dải bùn, rẽ xuống nút M giữ cửa cho thủ kho ra trạm cứu.
    man9('cuu-kho-hang', 5, 'cung-co', {
      ten: 'Thủ kho kẹt',
      mucTieu: 'cuu-nguoi',
      deBai: 'Thủ kho kẹt sau cửa C. Thùng chắn lối tới nút M. Mở cửa cho bác ra trạm cứu.',
      veMaMau: 'Xe chở hàng chưa làm gì.',
      san: ['##########', '#..oIIIu##', '###.#M####', '#..C....##', '##########'],
      noi: [{ nut: { x: 5, y: 2 }, cua: [{ x: 3, y: 3 }] }],
      doi: [khe({ x: 3, y: 2, huong: 0 }), khe({ x: 1, y: 1, huong: 1 })],
      them: { nguoi: [{ x: 1, y: 3 }], tramCuu: [{ x: 7, y: 3 }] },
      chonDoi: {
        menu: ['CH', 'HD', 'DR'],
        cachMau: [{ chon: ['CH', 'HD'], ghiChu: 'đôi tốt', loiGiai: doiBai([
          ['pick()'],
          ['forward(4)', 'turn_right()', 'move()', 'wait_n(5)']]) }]
      },
      maMau: doiBai([[], ['forward(4)', 'turn_right()', 'move()', 'wait_n(5)']]),
      loiSai: [
        { moTa: 'Không ai nhấc thùng: bánh gai đụng thùng', baiLam: doiBai([[], ['forward(4)', 'turn_right()', 'move()', 'wait_n(5)']]), phaiCoMa: ['dam-tuong', 'chua-cuu-nguoi'] }
      ],
      sao: { o: 23, nhip: 13 },
      goiY: ['Xe chở hàng nhấc thùng: pick().'],
      cauDo: { doi: ['CH', 'HD'], lap: null, coChe: ['bun', 'nut-de', 'cua', 'thung'], cuu: 'nguoi', meo: 'don-loi' }
    }),

    // 6 · cứu người, hai khách: drone rắc cát ô rẽ (10, 1); bánh gai THU GAI trượt cả dải trong một nhịp, dừng ở ô cát, rẽ xuống nút M, hát nốt 3 phá đá chuông chắn lối người.
    //     Đi bộ bung gai từng ô cũng tới nhưng quá trần nhịp; xe chở hàng (bẫy) trượt tới được nhưng không có loa.
    man9('cuu-kho-hang', 6, 'cung-co', {
      ten: 'Trượt cho nhanh',
      mucTieu: 'cuu-nguoi',
      deBai: 'Cứu người thật nhanh. Bánh gai thu gai thì trượt cả dải. Cát giúp dừng đúng ô.',
      veMaMau: 'Bánh gai đi từng ô: chậm quá.',
      san: ['#############', '#.IIIIIIIIIu#', '##########M##', '#######.C..##', '#############'],
      noi: [{ nut: { x: 10, y: 2 }, cua: [{ x: 8, y: 3 }] }],
      doi: [khe({ x: 1, y: 1, huong: 1 }), khe({ x: 10, y: 1, huong: 3 })],
      them: { nguoi: [{ x: 7, y: 3 }], tramCuu: [{ x: 10, y: 3 }], daChuong: [{ x: 9, y: 3, not: 3, ben: 1 }] },
      chonDoi: {
        menu: ['CH', 'DR', 'HD'],
        cachMau: [{ chon: ['HD', 'DR'], ghiChu: 'đôi tốt', loiGiai: doiBai([
          ['wait()', 'retract_spikes()', 'move()', 'turn_right()', 'move()', 'note(3)', 'wait()'],
          ['dot()', 'go_right()']]) }]
      },
      maMau: doiBai([['forward(9)', 'turn_right()', 'move()', 'note(3)', 'wait()'], []]),
      loiSai: [
        { moTa: 'Thu gai mà chưa có cát: trượt rơi hố', baiLam: doiBai([['retract_spikes()', 'move()', 'turn_right()', 'move()', 'note(3)', 'wait()'], []]), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 17, nhip: 8 },
      goiY: ['retract_spikes() rồi move(): trượt tới ô có cát.'],
      cauDo: { doi: ['DR', 'HD'], lap: null, coChe: ['bun', 'rac-cat', 'nut-de', 'da-chuong'], cuu: 'nguoi', meo: 'lam-cau' }
    }),

    // 7 · cứu máy: R3 xe chở hàng (khoá) chờ cửa C mở ("tiến khi trước trống") rồi đi qua ô bùn sát hố; drone rắc cát ô đó, bánh gai đè nút M giữ cửa. Chờ tín hiệu: R3 tự đọc cảm biến.
    man9('cuu-kho-hang', 7, 'van-dung', {
      ten: 'Xe kẹt mép hố',
      deBai: 'Xe chở hàng kẹt sau cửa, chờ phía trước trống thì tiến. Mở cửa, rắc cát ô bùn sát hố. Ba bạn về cờ.',
      veMaMau: 'Đọc chương trình của xe khoá.',
      san: ['##########', '#.CIu.F###', '###.##MF##', '###F.IIIu#', '##########'],
      noi: [{ nut: { x: 6, y: 2 }, cua: [{ x: 2, y: 1 }] }],
      doi: [khe({ x: 5, y: 1, huong: 3 }, { co: [{ x: 6, y: 1 }] }), khe({ x: 4, y: 3, huong: 1 }, { co: [{ x: 7, y: 2 }] }),
        may('CH', { x: 1, y: 1, huong: 1 }, { son: 'tim', coDinh: true, co: [{ x: 3, y: 3 }] })],
      chonDoi: {
        menu: ['DR', 'HD', 'CU'],
        cachMau: [{ chon: ['DR', 'HD'], ghiChu: 'đôi tốt', loiGiai: doiBai([
          ['for i in range(2):', '    go_left()', 'dot()', 'for i in range(3):', '    go_right()'],
          ['forward(2)', 'turn_left()', 'move()', 'wait_n(2)', 'turn_right()', 'move()']]) }]
      },
      maMau: doiBai([[], [], ['while not front_clear():', '    wait()', 'forward(2)', 'turn_right()', 'forward(2)']]),
      loiSai: [
        { moTa: 'Không rắc cát: xe khoá trượt rơi hố', baiLam: doiBai([['fly_right(1)'], ['forward(2)', 'turn_left()', 'move()', 'wait_n(2)', 'turn_right()', 'move()'], ['while not front_clear():', '    wait()', 'forward(2)', 'turn_right()', 'forward(2)']]), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 32, nhip: 11 },
      goiY: ['Xe khoá chỉ tiến khi cửa mở. Rời nút sớm thì cửa đóng lại.'],
      cauDo: { doi: ['DR', 'HD'], lap: null, coChe: ['bun', 'rac-cat', 'nut-de', 'cua', 'r3'], cuu: 'may', meo: 'cho-tin-hieu' }
    }),

    // 8 · cứu máy: kệ đổ (thùng nặng H) chắn trước mũi R3 (khoá, chờ phía trước trống). Drone rắc cát ô rẽ cho xe cứu hỏa; xích ủi kệ vào hốc trên, lùi ra cho R3 đi.
    //     Bẫy: máy khai thác (omni không ủi được thùng nặng, cũng trượt bùn).
    man9('cuu-kho-hang', 8, 'van-dung', {
      ten: 'Kệ đổ chắn xe',
      deBai: 'Kệ đổ chắn trước xe chở hàng. Ủi kệ vào hốc. Xích cũng trượt bùn. Ba bạn về cờ.',
      veMaMau: 'Xe khoá chờ phía trước trống.',
      san: ['###.######', '#..H...F##', '###.F#####', '#.IIIuF###', '##########'],
      doi: [khe({ x: 1, y: 3, huong: 1 }, { co: [{ x: 4, y: 2 }] }), khe({ x: 4, y: 3, huong: 1 }, { co: [{ x: 6, y: 3 }] }),
        may('CH', { x: 2, y: 1, huong: 1 }, { son: 'tim', coDinh: true, co: [{ x: 7, y: 1 }] })],
      chonDoi: {
        menu: ['CU', 'DR', 'KT'],
        cachMau: [{ chon: ['CU', 'DR'], ghiChu: 'đôi tốt', loiGiai: doiBai([
          ['wait_n(2)', 'move()', 'tr_left()', 'forward(2)', 'back()', 'tr_right()', 'move()'],
          ['go_left()', 'dot()', 'for i in range(3):', '    go_right()']]) }]
      },
      maMau: doiBai([[], [], ['while not front_clear():', '    wait()', 'forward(5)']]),
      loiSai: [
        { moTa: 'Không rắc cát: xích trượt rơi hố', baiLam: doiBai([['wait_n(2)', 'move()', 'tr_left()', 'forward(2)', 'back()', 'tr_right()', 'move()'], ['for i in range(2):', '    go_right()'], ['while not front_clear():', '    wait()', 'forward(5)']]), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 36, nhip: 15 },
      goiY: ['Xích quay: tr_left(), tr_right().'],
      cauDo: { doi: ['CU', 'DR'], lap: null, coChe: ['bun', 'rac-cat', 'thung-nang', 'r3'], cuu: 'may', meo: 'don-loi' }
    }),

    // 9 · cứu máy, phong phú: hố sụt chia kho, hai cửa trên lối R3 (khoá, for hai chặng "chờ trống rồi tiến"). Bánh gai qua bùn giữ nút gần M (3, 2);
    //     nhện nhảy qua hố giữ nút xa M (7, 2). Rời nút sớm thì cửa đóng trước mũi R3. Bẫy: máy khai thác (omni trượt bùn, không nhảy hố).
    man9('cuu-kho-hang', 9, 'bien-the', {
      ten: 'Hai nút hai bên',
      deBai: 'Xe chở hàng phải qua hai cửa. Mỗi cửa một nút. Một nút bên kia hố. Ba bạn về cờ.',
      veMaMau: 'Xe khoá: hai lần chờ trống rồi tiến 3 ô.',
      san: ['##########', '#..C..C.F#', '###M#.uMF#', '#.IIF#####', '##########'],
      noi: [{ nut: { x: 3, y: 2 }, cua: [{ x: 3, y: 1 }] }, { nut: { x: 7, y: 2 }, cua: [{ x: 6, y: 1 }] }],
      doi: [khe({ x: 1, y: 3, huong: 1 }, { co: [{ x: 4, y: 3 }] }), khe({ x: 5, y: 2, huong: 1 }, { co: [{ x: 8, y: 2 }] }),
        may('CH', { x: 2, y: 1, huong: 1 }, { son: 'tim', coDinh: true, co: [{ x: 8, y: 1 }] })],
      chonDoi: {
        menu: ['PL', 'KT', 'HD'],
        cachMau: [{ chon: ['HD', 'PL'], ghiChu: 'đôi tốt', loiGiai: doiBai([
          ['forward(2)', 'turn_left()', 'move()', 'wait_n(2)', 'back()', 'turn_right()', 'move()'],
          ['jump("R")', 'wait_n(4)', 'go_right()']]) }]
      },
      maMau: doiBai([[], [], ['for i in range(2):', '    while not front_clear():', '        wait()', '    forward(3)']]),
      loiSai: [
        { moTa: 'Nhện rời nút xa sớm: cửa thứ hai đóng', baiLam: doiBai([['forward(2)', 'turn_left()', 'move()', 'wait_n(2)', 'back()', 'turn_right()', 'move()'], ['jump("R")', 'go_right()'], ['for i in range(2):', '    while not front_clear():', '        wait()', '    forward(3)']]), phaiCoMa: ['qua-nhieu-nhip'] }
      ],
      sao: { o: 48, nhip: 12 },
      goiY: ['Nhện nhảy hố: jump("R").'],
      cauDo: { doi: ['HD', 'PL'], lap: null, coChe: ['bun', 'ho', 'nut-de', 'cua', 'hai-nut', 'r3'], cuu: 'may', meo: 'giu-cua' }
    }),

    // 10 · song ca đoạn 1 (giữ bài "Kìa con bướm vàng" cho gói 10 ghép): xe chở hàng lắp loa thay tay kẹp, xe hang động hát bè 2.
    //     Tiếng hát đúng nốt làm vỡ đá chuông kệ sập trước mũi mỗi xe (nốt 5 của bè 1, nốt 4 của bè 2). Đội cố định (tay loa không có trên bảng chọn).
    man9('cuu-kho-hang', 10, 'trum', {
      ten: 'Song ca nhà kho',
      mucTieu: 'choi-dieu',
      deBai: 'Mừng kho sạch bùn! Sola bè 1, Luna bè 2. Hát đúng nốt, đá chuông vỡ.',
      veMaMau: 'Bè 2 mới có 4 nốt.',
      hamCuaEmCan: ['play_note'],
      san: ['#######', '#.....#', '#.....#', '#######'],
      doi: [may('CH', { x: 1, y: 1, huong: 1 }, { tay: 'loa', boHam: ['arm_down', 'arm_up', 'arm_left', 'arm_right', 'grab', 'release'], themHam: ['note', 'beat'], phatNot: true }),
        may('HD', { x: 1, y: 2, huong: 1 }, { son: 'lam' })],
      them: { dieu: { r1: '1 1 5 5 6 6 5 5', r2: '1 3 5 3 4 4 1 1' }, daChuong: [{ x: 5, y: 1, not: 5, ben: 1 }, { x: 5, y: 2, not: 4, ben: 1 }] },
      maMau: doiBai([['for n in [1, 1, 5, 5, 6, 6, 5, 5]:', '    play_note(n)'], ['for n in [1, 3, 5, 3]:', '    play_note(n)']]),
      loiGiai: doiBai([['for n in [1, 1, 5, 5, 6, 6, 5, 5]:', '    play_note(n)'], ['for n in [1, 3, 5, 3, 4, 4, 1, 1]:', '    play_note(n)']]),
      loiSai: [
        { moTa: 'Bè 2 thiếu 4 nốt cuối', baiLam: doiBai([['for n in [1, 1, 5, 5, 6, 6, 5, 5]:', '    play_note(n)'], ['for n in [1, 3, 5, 3]:', '    play_note(n)']]), phaiCoMa: ['lo-nhip'] }
      ],
      sao: { o: 7, nhip: 9 },
      goiY: ['Bè 2: [1, 3, 5, 3, 4, 4, 1, 1].'],
      cauDo: { doi: ['CH', 'HD'], lap: null, coChe: ['loa', 'da-chuong'], cuu: null, meo: 'song-song' }
    }),

    /* ========================================================================
       CHƯƠNG 2: lap-kho-hang (10 màn)
       ======================================================================== */
    // 11 · show: R2 đã lắp sẵn bánh gai + kẹp xoay + khoảng cách (chạy sẵn, khoá). Gắp thùng ở hốc bên, chạy qua bùn tới khi gặp tường, đặt thùng sang phải cho xe chở hàng.
    man9('lap-kho-hang', 1, 'lam-quen', {
      ten: 'Xe gai chở hàng',
      chiChay: true, mucTieu: 'dua-vat',
      hamCuaEmCan: HAM_EM.concat(['pick_left', 'drop_right']),
      deBai: 'Luna lắp xe: bánh gai, kẹp xoay, mắt khoảng cách. Xe gai đưa thùng qua bùn cho xe chở hàng. Bấm Chạy.',
      veMaMau: 'Bấm Chạy xem xe gai làm gì.',
      san: ['########', '#o######', '#.IIII.#', '######.#', '######.#', '######D#'],
      doi: [may('CH', { x: 6, y: 4, huong: 0 }), Object.assign({ batDau: { x: 1, y: 2, huong: 1 } }, clone(GAI_XOAY))],
      maMau: doiBai([
        ['wait_n(8)', 'pick()', 'turn_right()', 'turn_right()', 'drop()'],
        ['pick_left()', 'while front_clear():', '    move()', 'drop_right()']]),
      loiGiai: doiBai([
        ['wait_n(8)', 'pick()', 'turn_right()', 'turn_right()', 'drop()'],
        ['pick_left()', 'while front_clear():', '    move()', 'drop_right()']]),
      sao: { o: 47, nhip: 15 },
      goiY: ['Kẹp xoay gắp thùng bên trái: pick_left().'],
      cauDo: { doi: null, lap: 'gai+xoay+khoang-cach', coChe: ['bun', 'tay-ben', 'cam-bien'], cuu: 'hang', meo: 'tiep-suc' }
    }),

    // 12 · ép đổi thân: R2 phải dừng giữa dải bùn rẽ xuống; hai bánh trượt rơi hố, chỉ bánh gai dừng được. Nhấc thùng chắn lối, đặt sang bên, đi tiếp về cờ.
    //      Kẹp xoay đặt sang bên không cần quay (nhanh); kẹp thường rẻ hơn mà phải quay đi quay lại.
    man9('lap-kho-hang', 2, 'lam-quen', {
      ten: 'Bánh nào qua bùn',
      hamCuaEmCan: HAM_EM.concat(['drop_left']),
      deBai: 'Thùng chắn lối xe chở hàng. Lắp xe cho Luna: rẽ giữa dải bùn, dọn thùng, về cờ.',
      veMaMau: 'Xe của Luna chưa có lệnh.',
      san: ['##########', '#.IIIIIu##', '####..####', '#...o..F##', '####F#####', '##########'],
      doi: [may('CH', { x: 1, y: 3, huong: 1 }, { co: [{ x: 7, y: 3 }] }), khe({ x: 1, y: 1, huong: 1 }, { son: 'lam', co: [{ x: 4, y: 4 }] })],
      lapRap: lapR2(['hai-banh', 'gai'], ['kep', 'xoay'], [], 7, [
        cach('gai', 'xoay', null, [['wait_n(4)', 'forward(6)'], ['forward(3)', 'turn_right()', 'move()', 'pick()', 'drop_left()', 'forward(2)']]),
        cach('gai', 'kep', null, [['wait_n(5)', 'forward(6)'], ['forward(3)', 'turn_right()', 'move()', 'pick()', 'turn_left()', 'drop()', 'turn_right()', 'forward(2)']])
      ]),
      maMau: doiBai([['wait_n(4)', 'forward(6)'], []]),
      loiSai: [
        { moTa: 'Xe của Luna không nhấc thùng: xe chở hàng đụng thùng', baiLam: doiBai([['wait_n(4)', 'forward(6)'], ['forward(3)', 'turn_right()']]), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 34, nhip: 13 },
      goiY: ['Hai bánh vào bùn là trượt tới hố. Thử thân khác.'],
      cauDo: { doi: null, lap: 'gai+xoay', coChe: ['bun', 'ho', 'thung', 'doi-than'], cuu: 'hang', meo: 'don-loi' }
    }),

    // 13 · kẹp xoay gắp bên: R2 dừng trên bùn ngay trên thùng chắn lối, gắp sang phải không cần quay rồi lên cờ; kẹp thường phải quay xuống, quay về (chậm hơn, rẻ hơn).
    man9('lap-kho-hang', 3, 'luyen', {
      ten: 'Gắp bên hông',
      hamCuaEmCan: HAM_EM.concat(['pick_right']),
      deBai: 'Thùng nằm ngay dưới dải bùn, chắn lối xe chở hàng. Gắp thùng rồi lên cờ.',
      veMaMau: 'Xe của Luna chưa có lệnh.',
      san: ['###F####', '#.IIIIu#', '#..o..F#', '########'],
      doi: [may('CH', { x: 1, y: 2, huong: 1 }, { co: [{ x: 6, y: 2 }] }), khe({ x: 1, y: 1, huong: 1 }, { son: 'lam', co: [{ x: 3, y: 0 }] })],
      lapRap: lapR2(['gai'], ['kep', 'xoay'], [], 7, [
        cach('gai', 'xoay', null, [['wait_n(2)', 'forward(5)'], ['forward(2)', 'pick_right()', 'turn_left()', 'move()']]),
        cach('gai', 'kep', null, [['wait_n(3)', 'forward(5)'], ['forward(2)', 'turn_right()', 'pick()', 'turn_left()', 'turn_left()', 'move()']])
      ]),
      maMau: doiBai([['wait_n(2)', 'forward(5)'], ['forward(2)']]),
      sao: { o: 26, nhip: 8 },
      goiY: ['Kẹp xoay gắp bên phải: pick_right().'],
      cauDo: { doi: null, lap: 'gai+xoay', coChe: ['bun', 'thung', 'tay-ben'], cuu: 'hang', meo: 'don-loi' }
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
