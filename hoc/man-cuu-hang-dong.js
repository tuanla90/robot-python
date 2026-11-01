/* ============================================================================
   man-cuu-hang-dong.js - Mùa 9 CLB Sáng Tạo: Gói 8 "Giải cứu Hang động"
   20 màn (10 màn cuu-hang-dong + 10 màn lap-hang-dong):
   - R1 (.1..9): Robot Hang động Mùa 8 (than: 'gai', tay: 'loa', camBien: am-thanh + phanAm)
   - R2: Robot các mùa 1, 2, 3, 6, 7 chi viện (banh, xich, nhen, drone, omni)
   - Ôn sâu dict, set, cảm biến âm thanh (hear, listen), loa phát nốt (note, beat),
     đàn dơi phát sóng âm định vị trong hang tối (danDoi) và nhũ đá cộng hưởng (daChuong).
   - Màn 10 mỗi chương (hang: 'trum', 3 sân, nhipTheo: 'tong'): Hợp tấu 2 bè
     Đoạn 8 "Khúc ngân vang hang đá" sau khi cứu hộ xong Hang động Đá vôi.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var HAM_GAI = BANH.concat(['retract_spikes', 'extend_spikes', 'beat', 'note', 'hear', 'listen']);
  var HAM_BANH = BANH.concat(['arm_down', 'arm_up', 'arm_left', 'arm_right', 'grab', 'release', 'front_clear', 'left_clear', 'right_clear']);
  var HAM_XICH = BANH.concat(['spray', 'spray_back', 'distance', 'warm']);
  var HAM_XICH_LOA = BANH.concat(['beat', 'note', 'distance', 'warm']);
  var HAM_NHEN = ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'crouch', 'stand', 'magnet_n', 'magnet_s', 'magnet_off', 'front_metal', 'front_pole'];
  var HAM_DRONE = ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'land', 'take_off', 'dot', 'pen_down', 'pen_up', 'ink', 'color'];
  var HAM_OMNI = BANH.concat(['slide_left', 'slide_right', 'load', 'throw', 'radar', 'diag_left', 'diag_right', 'aim', 'shape']);

  var R1_GAI = {
    loaiRobot: 'gai', thuGai: true, phatNot: true, phanAm: true,
    robot: { than: 'gai', tay: 'loa', camBien: [{ ma: 'am-thanh', o: 'tren', phanAm: true }] },
    hamGoc: HAM_GAI
  };
  var R2_LOA = {
    loaiRobot: 'xich', phatNot: true,
    robot: { than: 'xich', tay: 'loa', camBien: [{ ma: 'hong-ngoai', o: 'tren' }], son: 'lam' },
    hamGoc: HAM_XICH_LOA
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
  var R_NHEN = {
    loaiRobot: 'nhen',
    robot: { than: 'nhen', tay: 'nam-cham', camBien: [{ ma: 'tu', o: 'hong' }], son: 'lam' },
    hamGoc: HAM_NHEN
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

  var SAN_HANG = [
    '########',
    '#..C..F#',
    '#.####.#',
    '#..o..D#',
    '########'
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
  function xe(mau, bd, them) { return Object.assign({}, mau, { batDau: bd }, them || {}); }

  function manCH(chuong, so, hang, p) {
    var r1 = xe(p.r1 || R1_GAI, p.bd[0], p.r1Them);
    var r2 = xe(p.r2 || R_OMNI, p.bd[1], p.r2Them);
    var kq = {
      ma: chuong + '.' + so, ten: p.ten, chuong: chuong, so: so, hang: hang,
      vo: 'hang-dong', loaiRobot: r1.loaiRobot, robot: r1.robot, hamGoc: r1.hamGoc,
      thuGai: true, phatNot: true, phanAm: true, daLapHo: true,
      mucTieu: p.mucTieu || 'toi-co',
      deBai: p.deBai,san: p.san || SAN_HANG,
      batDau: p.bd[0], doi: [r1, r2],
      khung: p.khung || { chinh: 10, moiHam: 8 },
      cauTruc: ['for', 'if', 'while', 'list', 'dict', 'set'],
      vaHoac: true, moXuong: true, camHamCuaEm: false, bienDem: true, nhipTheoLoiGiai: true,
      taoHam: p.taoHam || [],
      hamCuaEmCan: p.hamCuaEmCan || [],
      maMau: p.maMau, loiGiai: p.loiGiai, loiSai: p.loiSai || [],
      sao: p.sao || { o: 6, nhip: 8 }, goiY: p.goiY
    };
    ['chiChay', 'chinhCoDinh', 'noi', 'cuaNhip', 'mau', 'vatMau', 'vatChat', 'vatDang', 'vatCan', 'hinh', 'dieu', 'danDoi', 'daChuong', 'ngachHang', 'nhipTheo'].forEach(function (k) {
      if (p[k] !== undefined) kq[k] = p[k];
    });
    return ManHoc.chuanHoa(kq);
  }

  ManHoc.manCuuHangDong = [
    // ==================== CHƯƠNG 1: cuu-hang-dong (10 màn) ====================
    manCH('cuu-hang-dong', 1, 'lam-quen', {
      ten: 'Sóng âm đàn dơi mở lối hang đá',
      chiChay: true, chinhCoDinh: true, r2: R_BANH,
      hamCuaEmCan: ['move', 'forward', 'go_echo', 'play_note', 'echo_crack_step', 'grab_clear'],
      deBai: 'Hang động Đá vôi bị sạt lở! Trong vòm hang tối, đàn dơi phát sóng âm định vị ở (3, 1) giúp R1 dò đường và phá nhũ đá cộng hưởng ở (4, 1) bằng echo_crack_step(), trong khi R2 (xe hai bánh Mùa 1) gọi grab_clear() dọn tảng đá chắn lối dưới rồi tiến về cờ. Bấm Chạy thử để xem hai robot phối hợp.',
      san: [
        '########',
        '#.....F#',
        '########',
        '#..o..F#',
        '########'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 3, huong: 1 }],
      r1Them: { co: [{ x: 6, y: 1 }] }, r2Them: { co: [{ x: 6, y: 3 }] },
      danDoi: [{ x: 3, y: 1, not: 4 }],
      daChuong: [{ x: 4, y: 1, not: 4 }],
      maMau: baiDoi(['echo_crack_step()', 'forward(2)'], ['grab_clear()', 'forward(5)']),
      loiGiai: baiDoi(['echo_crack_step()', 'forward(2)'], ['grab_clear()', 'forward(5)']),
      sao: { o: 25, nhip: 8 },
      goiY: ['Màn trình diễn: bấm Chạy thử để xem R1 nghe sóng âm đàn dơi phá nhũ đá và R2 dọn đá tảng.']
    }),

    manCH('cuu-hang-dong', 2, 'lam-quen', {
      ten: 'Xích phun van mở cửa cho bánh gai lướt đá ướt',
      r2: R_XICH,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'squirt', 'valve_step', 'go_echo', 'glide_tunnel'],
      deBai: 'Đàn dơi phát sóng âm định vị ở (3, 1) báo vị trí ngay sau cửa C. R2 (xe xích Mùa 2) gọi valve_step(1) phun van N ở (4, 3) mở cửa C rồi tiến vào cờ (3, 3); R1 chờ 1 nhịp cho cửa mở, gọi go_echo() tiến tới chỗ đàn dơi rồi gọi glide_tunnel() thu gai trượt qua dải đá vôi ướt I tới cờ.',
      san: [
        '########',
        '#.C.I.F#',
        '#.####.#',
        '#..FN..#',
        '########'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 3, huong: 1 }],
      r1Them: { co: [{ x: 6, y: 1 }] }, r2Them: { co: [{ x: 3, y: 3 }] },
      danDoi: [{ x: 3, y: 1, not: 3 }],
      noi: [{ nut: { x: 4, y: 3 }, cua: [{ x: 2, y: 1 }] }],
      maMau: baiDoi(['wait_n(1)', 'go_echo()'], ['valve_step(1)']),
      loiGiai: baiDoi(['wait_n(1)', 'go_echo()', 'glide_tunnel()'], ['valve_step(1)']),
      loiSai: [
        { moTa: 'R1 quên glide_tunnel(): dừng lại ở (3, 1) trước thềm đá vôi ướt', baiLam: baiDoi(['wait_n(1)', 'go_echo()'], ['valve_step(1)']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 20, nhip: 5 },
      goiY: ['R2 gọi valve_step(1) bắn van N ở (4, 3) mở cửa C ở (2, 1) và tiến vào cờ (3, 3).', 'R1 chờ 1 nhịp, gọi go_echo() tiến tới đàn dơi (3, 1), rồi gọi glide_tunnel() thu gai trượt qua đá ướt I ở (4, 1) và bước vào cờ (6, 1).']
    }),

    manCH('cuu-hang-dong', 3, 'lam-quen', {
      ten: 'Phá nhũ đá cộng hưởng mở đường cho nhện kéo sắt',
      r2: R_NHEN, mucTieu: 'dua-vat', vatCan: 'sat',
      hamCuaEmCan: ['move', 'forward', 'go_echo', 'play_note', 'crack_for_mate', 'clear_iron'],
      deBai: 'Khối nhũ đá cộng hưởng ở (4, 3) đang chặn đường vận chuyển quặng sắt của R2 (nhện từ tính Mùa 3). Đàn dơi phát sóng âm định vị ở (3, 1) mang đúng tần số nốt 5: hãy để R1 gọi crack_for_mate() phá nhũ đá, giúp R2 gọi clear_iron("R") kéo quặng sắt qua (4, 3) về đích D ở (5, 3).',
      san: [
        '########',
        '#....F.#',
        '########',
        '#.o..D.#',
        '########'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 3, huong: 1 }],
      vatChat: ['........', '........', '........', '..s.....', '........'],
      danDoi: [{ x: 3, y: 1, not: 5 }],
      daChuong: [{ x: 4, y: 3, not: 5 }],
      maMau: baiDoi(['go_echo()', 'move()'], ['go_right()', 'clear_iron("R")', 'go_right()', 'go_right()', 'magnet_off()', 'wait()']),
      loiGiai: baiDoi(['crack_for_mate()', 'move()'], ['go_right()', 'clear_iron("R")', 'go_right()', 'go_right()', 'magnet_off()', 'wait()']),
      loiSai: [
        { moTa: 'R1 chưa phát nốt phá nhũ đá ở (4, 3): R2 đâm vào nhũ đá', baiLam: baiDoi(['go_echo()', 'move()'], ['go_right()', 'clear_iron("R")', 'go_right()', 'go_right()', 'magnet_off()', 'wait()']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      sao: { o: 31, nhip: 10 },
      goiY: ['Khi R1 tới (3, 1), khối nhũ đá ở (4, 3) cách đúng 3 ô Manhattan nên nằm trong tầm loa cộng hưởng.', 'Thay go_echo() của R1 bằng crack_for_mate() để R1 vừa nghe đàn dơi vừa phá nhũ đá cho R2.']
    }),

    manCH('cuu-hang-dong', 4, 'cung-co', {
      ten: 'Omni hất đá lấp hố sâu trong hang tối',
      r2: R_OMNI,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'fill_for_mate', 'echo_crack_step'],
      deBai: 'Trước mặt R1 là hố sụt u ở (2, 1), tiếp đến là đàn dơi phát sóng âm định vị ở (3, 1) và nhũ đá cộng hưởng ở (4, 1). R2 (xe omni Mùa 7) gọi fill_for_mate(3) hất đá qua rào lấp hố u cho R1 rồi trượt sang cờ; R1 chờ 2 nhịp rồi gọi echo_crack_step() và move() về cờ.',
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
      danDoi: [{ x: 3, y: 1, not: 6 }],
      daChuong: [{ x: 4, y: 1, not: 6 }],
      maMau: baiDoi(['wait_n(2)', 'forward(4)'], ['fill_for_mate(3)']),
      loiGiai: baiDoi(['wait_n(2)', 'echo_crack_step()', 'move()'], ['fill_for_mate(3)']),
      loiSai: [
        { moTa: 'R1 chỉ gọi forward(4): đâm vào nhũ đá cộng hưởng ở (4, 1)', baiLam: baiDoi(['wait_n(2)', 'forward(4)'], ['fill_for_mate(3)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 28, nhip: 7 },
      goiY: ['Sau khi hố (2, 1) được lấp, R1 gọi echo_crack_step() để tiến 2 ô tới đàn dơi (3, 1), phát nốt 6 phá nhũ đá (4, 1) và bước lên (4, 1).', 'Cuối cùng R1 gọi move() để vào cờ (5, 1).']
    }),

    manCH('cuu-hang-dong', 5, 'cung-co', {
      ten: 'Lướt đá ướt đè công tắc cho drone gieo rêu phát sáng',
      r2: R_DRONE, mucTieu: 'to-hinh',
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'tunnel_crack_glide', 'span_sow'],
      deBai: 'Thảm rêu phát sáng trong hang cần R2 (drone Mùa 6) gieo 3 ô màu "green". R1 nghe đàn dơi phát sóng âm ở (3, 1), gọi tunnel_crack_glide() để phá nhũ đá ở (4, 1) và thu gai trượt qua đá ướt I ở (4, 1) đè lên nút M ở (5, 1), mở cửa C cho R2 bay qua gieo hạt.',
      san: [
        '########',
        '#...IM.#',
        '########',
        '#.C....#',
        '########'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 3, huong: 1 }],
      hinh: ['........', '........', '........', '...ggg..', '........'],
      danDoi: [{ x: 3, y: 1, not: 2 }],
      daChuong: [{ x: 4, y: 1, not: 2 }],
      noi: [{ nut: { x: 5, y: 1 }, cua: [{ x: 2, y: 3 }] }],
      maMau: baiDoi(['go_echo()'], ['wait_n(7)', 'go_right()', 'go_right()', 'span_sow("green", 3)']),
      loiGiai: baiDoi(['tunnel_crack_glide()'], ['wait_n(7)', 'go_right()', 'go_right()', 'span_sow("green", 3)']),
      loiSai: [
        { moTa: 'R1 chưa gọi tunnel_crack_glide(): không đè được nút M ở (5, 1) nên cửa C đóng', baiLam: baiDoi(['go_echo()'], ['wait_n(7)', 'go_right()', 'go_right()', 'span_sow("green", 3)']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 30, nhip: 11 },
      goiY: ['Hàm tunnel_crack_glide() giúp R1 tiến tới đàn dơi (3, 1), phát nốt phá nhũ đá (4, 1), thu gai lướt qua đá ướt I (4, 1) tới đè nút M (5, 1).', 'Thay go_echo() của R1 bằng tunnel_crack_glide().']
    }),

    manCH('cuu-hang-dong', 6, 'cung-co', {
      ten: 'Dọn đá chắn và phá hai tầng nhũ đá cộng hưởng',
      r2: R_BANH,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'grab_clear', 'echo_crack_step'],
      deBai: 'Tảng đá o ở (2, 1) đang chắn trước hai đàn dơi phát sóng âm định vị ở (3, 1) và (5, 1). R2 (xe hai bánh Mùa 1) ở (2, 2) gọi grab_clear() nhặt tảng đá lùi về cờ (2, 3); R1 chờ 2 nhịp rồi gọi echo_crack_step() 2 lần liên tiếp để phá cả hai khối nhũ đá cộng hưởng và tiến về cờ.',
      san: [
        '#########',
        '#.o....F#',
        '##.######',
        '##F######',
        '#########'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 2, huong: 0 }],
      r1Them: { co: [{ x: 7, y: 1 }] }, r2Them: { co: [{ x: 2, y: 3 }] },
      danDoi: [{ x: 3, y: 1, not: 3 }, { x: 5, y: 1, not: 7 }],
      daChuong: [{ x: 4, y: 1, not: 3 }, { x: 6, y: 1, not: 7 }],
      maMau: baiDoi(['wait_n(2)', 'echo_crack_step()', 'move()'], ['grab_clear()']),
      loiGiai: baiDoi(['wait_n(2)', 'echo_crack_step()', 'echo_crack_step()', 'move()'], ['grab_clear()']),
      loiSai: [
        { moTa: 'R1 chỉ gọi echo_crack_step() 1 lần: dừng trước nhũ đá thứ hai ở (6, 1)', baiLam: baiDoi(['wait_n(2)', 'echo_crack_step()', 'move()'], ['grab_clear()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 28, nhip: 10 },
      goiY: ['Sau khi R2 gọi grab_clear() nhặt tảng đá ở (2, 1) lùi về cờ (2, 3), đường ngang đã thông.', 'R1 gọi echo_crack_step() lần 1 lên (4, 1), gọi echo_crack_step() lần 2 lên (6, 1), rồi move() vào cờ (7, 1).']
    }),

    manCH('cuu-hang-dong', 7, 'cung-co', {
      ten: 'Xích đẩy thùng đè công tắc mở cửa ngách hang',
      r2: R_XICH,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'push_valve', 'echo_crack_step'],
      deBai: 'Cửa C ở (2, 1) cần R2 (xe xích Mùa 2) gọi push_valve(1) đẩy thùng nặng H đè lên công tắc M rồi lùi về cờ. Sau khi chờ 2 nhịp, R1 đi qua cửa C, lắng nghe đàn dơi phát sóng âm ở (3, 1), gọi echo_crack_step() phá nhũ đá ở (4, 1), rồi bước vào ngách hang ngầm ở (5, 1) để chui sang cờ (6, 1).',
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
      danDoi: [{ x: 3, y: 1, not: 5 }],
      daChuong: [{ x: 4, y: 1, not: 5 }],
      ngachHang: [{ a: { x: 5, y: 1 }, b: { x: 6, y: 1 } }],
      maMau: baiDoi(['wait_n(2)', 'echo_crack_step()', 'move()'], ['move()']),
      loiGiai: baiDoi(['wait_n(2)', 'echo_crack_step()', 'move()'], ['push_valve(1)', 'back()']),
      loiSai: [
        { moTa: 'R2 chưa đẩy thùng đè nút M: cửa C đóng chặn R1 và R2 chưa về cờ', baiLam: baiDoi(['wait_n(2)', 'echo_crack_step()', 'move()'], ['move()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 23, nhip: 7 },
      goiY: ['R2 gọi push_valve(1) để đẩy thùng H từ (4, 3) sang đè nút M ở (5, 3) rồi lùi 1 ô, sau đó gọi thêm back() để về cờ (2, 3).', 'Khi R1 bước vào đầu ngách hang ở (5, 1), ngách ngầm đưa R1 sang thẳng cờ (6, 1).']
    }),

    manCH('cuu-hang-dong', 8, 'cung-co', {
      ten: 'Chế hàm: Chờ đồng đội mở đường rồi nghe dơi phá đá',
      taoHam: ['bat_wait_crack'], r2: R_OMNI,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'fill_for_mate', 'echo_crack_step'],
      deBai: 'Để R1 chủ động đợi đồng đội mở đường rồi mới nghe sóng âm đàn dơi và phá nhũ đá cộng hưởng, hãy viết hàm bat_wait_crack(w): gọi wait_n(w) rồi gọi echo_crack_step(). Áp dụng bat_wait_crack(2) cho R1 khi R2 gọi fill_for_mate(3) lấp hố u ở (2, 1).',
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
      danDoi: [{ x: 3, y: 1, not: 8 }],
      daChuong: [{ x: 4, y: 1, not: 8 }],
      maMau: baiDoi(['bat_wait_crack(2)', 'move()'], ['fill_for_mate(3)'], [ham('bat_wait_crack', [], ['w'])]),
      loiGiai: baiDoi(['bat_wait_crack(2)', 'move()'], ['fill_for_mate(3)'], [], [ham('bat_wait_crack', ['wait_n(w)', 'echo_crack_step()'], ['w'])]),
      loiSai: [
        { moTa: 'Để trống bat_wait_crack(w): R1 không đi qua được nhũ đá', baiLam: baiDoi(['bat_wait_crack(2)', 'move()'], ['fill_for_mate(3)'], [ham('bat_wait_crack', [], ['w'])]), phaiCoMa: ['loi-cu-phap'] },
        { moTa: 'Quên wait_n(w) trong bat_wait_crack(w): R1 lao xuống hố u trước khi R2 kịp lấp', baiLam: baiDoi(['bat_wait_crack(2)', 'move()'], ['fill_for_mate(3)'], [], [ham('bat_wait_crack', ['echo_crack_step()'], ['w'])]), phaiCoMa: ['roi-ho', 'chua-toi-co'] }
      ],
      sao: { o: 29, nhip: 7 },
      goiY: ['Trong thân hàm bat_wait_crack(w), viết 2 dòng: wait_n(w) và echo_crack_step().', 'Hàm này giúp R1 chờ w nhịp rồi tự động tiến tới đàn dơi, phát nốt phá nhũ đá và bước lên.']
    }),

    manCH('cuu-hang-dong', 9, 'on-tap', {
      ten: 'Nhện kéo sắt mở cổng cho R1 lướt qua hang ướt',
      r2: R_NHEN,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'bat_wait_crack', 'glide_tunnel', 'pull_s'],
      deBai: 'Cửa C ở (2, 1) nối với công tắc M ở (4, 3). R2 (nhện từ tính Mùa 3) kéo khối sắt ở (3, 3) đè lên công tắc M rồi thả nam châm và tiến về cờ. R1 gọi bat_wait_crack(5) đợi cửa mở, nghe sóng âm đàn dơi ở (3, 1) phá nhũ đá ở (4, 1), rồi gọi glide_tunnel() trượt qua đá vôi ướt I vào cờ.',
      san: [
        '#########',
        '#.C..I.F#',
        '#.#####.#',
        '#..oM.F.#',
        '#########'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 3, huong: 1 }],
      r1Them: { co: [{ x: 7, y: 1 }] }, r2Them: { co: [{ x: 6, y: 3 }] },
      vatChat: ['.........', '.........', '.........', '...s.....', '.........'],
      noi: [{ nut: { x: 4, y: 3 }, cua: [{ x: 2, y: 1 }] }],
      danDoi: [{ x: 3, y: 1, not: 4 }],
      daChuong: [{ x: 4, y: 1, not: 4 }],
      maMau: baiDoi(['bat_wait_crack(5)'], ['go_right()', 'pull_s()', 'go_right()', 'magnet_off()', 'wait()', 'go_right()', 'go_right()']),
      loiGiai: baiDoi(['bat_wait_crack(5)', 'glide_tunnel()'], ['go_right()', 'pull_s()', 'go_right()', 'magnet_off()', 'wait()', 'go_right()', 'go_right()']),
      loiSai: [
        { moTa: 'R1 quên glide_tunnel() sau bat_wait_crack(5): dừng lại ở (4, 1)', baiLam: baiDoi(['bat_wait_crack(5)'], ['go_right()', 'pull_s()', 'go_right()', 'magnet_off()', 'wait()', 'go_right()', 'go_right()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 30, nhip: 11 },
      goiY: ['Sau khi bat_wait_crack(5) đưa R1 tới (4, 1), trước mặt là đá ướt I (5, 1), sàn (6, 1) và cờ (7, 1).', 'Thêm glide_tunnel() ở cuối chương trình R1 để thu gai trượt qua đá ướt vào thẳng cờ.']
    }),

    manCH('cuu-hang-dong', 10, 'trum', {
      ten: 'Trùm Chương 1: Khúc ngân vang vòm hang đá vôi',
      r2: R2_LOA, mucTieu: 'choi-dieu', nhipTheo: 'tong',
      hamCuaEmCan: ['play_note', 'play_part'],
      deBai: 'Hành lang Hang động Đá vôi đã thông suốt! Giữa vòm đá vang vọng tiếng sóng âm của đàn dơi, R1 và R2 cùng hợp tấu 2 bè qua 3 sân liên tiếp:\n- Bè 1 (R1): [1, 3, 5, 8, 5, 3, 1, 5]\n- Bè 2 (R2): [1, 1, 3, 5, 3, 1, 5, 1]\nHãy dùng hàm play_part(notes) cho cả hai robot.',
      san: SAN_DUET_3,
      bd: [{ x: 2, y: 1, huong: 1 }, { x: 2, y: 2, huong: 1 }],
      dieu: { r1: '13585315', r2: '11353151' },
      maMau: baiDoi(['play_part([1, 3, 5, 8, 5, 3, 1, 5])'], ['play_part([1, 1, 3, 5])']),
      loiGiai: baiDoi(['play_part([1, 3, 5, 8, 5, 3, 1, 5])'], ['play_part([1, 1, 3, 5, 3, 1, 5, 1])']),
      loiSai: [
        { moTa: 'R2 chỉ phát 4 nốt đầu: chưa đủ 8 nốt của bè 2 trên 3 sân', baiLam: baiDoi(['play_part([1, 3, 5, 8, 5, 3, 1, 5])'], ['play_part([1, 1, 3, 5])']), phaiCoMa: ['lo-nhip'] }
      ],
      sao: { o: 6, nhip: 24 },
      goiY: ['Điền đủ danh sách 8 nốt [1, 1, 3, 5, 3, 1, 5, 1] vào lệnh play_part(...) của R2.', 'Cả 3 sân đều kiểm tra sự hòa âm chính xác của 2 bè nhạc.']
    }),

    // ==================== CHƯƠNG 2: lap-hang-dong (10 màn) ====================
    manCH('lap-hang-dong', 1, 'lam-quen', {
      ten: 'Từ điển giải mã sóng âm đàn dơi',
      chiChay: true, chinhCoDinh: true, r2: R_OMNI,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'fill_for_mate', 'decode_glide'],
      deBai: 'Trong hang sâu, sóng âm định vị của đàn dơi bị vách đá vôi phản xạ lệch tần số! R1 dùng từ điển d = {2: 5, 4: 7} và hàm decode_glide(d, 1) để đổi nốt nghe được từ đàn dơi sang đúng tần số cộng hưởng của nhũ đá rồi thu gai lướt qua đá ướt, trong khi R2 (xe omni) lấp hố giúp bạn. Bấm Chạy thử để quan sát.',
      san: [
        '########',
        '#.u.I.F#',
        '##=#####',
        '##o#####',
        '#..F####',
        '########'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 4, huong: 0 }],
      r1Them: { co: [{ x: 6, y: 1 }] }, r2Them: { co: [{ x: 3, y: 4 }] },
      danDoi: [{ x: 3, y: 1, not: 2 }],
      daChuong: [{ x: 4, y: 1, not: 5 }],
      maMau: baiDoi(['d = {2: 5, 4: 7}', 'wait_n(2)', 'forward(2)', 'decode_glide(d, 1)', 'turn_left()', 'move()'], ['fill_for_mate(3)']),
      loiGiai: baiDoi(['d = {2: 5, 4: 7}', 'wait_n(2)', 'forward(2)', 'decode_glide(d, 1)', 'turn_left()', 'move()'], ['fill_for_mate(3)']),
      sao: { o: 37, nhip: 9 },
      goiY: ['Màn trình diễn: bấm Chạy thử để xem R1 tra từ điển d[listen()] giải mã sóng âm đàn dơi.']
    }),

    manCH('lap-hang-dong', 2, 'lam-quen', {
      ten: 'Chế hàm: Tra từ điển sóng âm dơi và tiến bước',
      taoHam: ['bat_dict_crack'], r2: R_XICH,
      hamCuaEmCan: ['move', 'forward', 'go_echo', 'play_note', 'valve_step'],
      deBai: 'Khi đàn dơi phát sóng âm định vị ở phía trước, R1 có thể tiến tới chỗ đàn dơi bằng go_echo(), tra từ điển d[listen()] để phát đúng nốt cộng hưởng phá nhũ đá ngay trước mặt rồi bước lên. Hãy viết hàm bat_dict_crack(d): gọi go_echo(), gọi play_note(d[listen()]), rồi gọi move().',
      san: [
        '########',
        '#..C..F#',
        '#.####.#',
        '#..FN..#',
        '########'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 3, huong: 1 }],
      r1Them: { co: [{ x: 6, y: 1 }] }, r2Them: { co: [{ x: 3, y: 3 }] },
      noi: [{ nut: { x: 4, y: 3 }, cua: [{ x: 3, y: 1 }] }],
      danDoi: [{ x: 4, y: 1, not: 3 }],
      daChuong: [{ x: 5, y: 1, not: 6 }],
      maMau: baiDoi(['d = {3: 6, 4: 8}', 'bat_dict_crack(d)', 'move()'], ['valve_step(1)'], [ham('bat_dict_crack', [], ['d'])]),
      loiGiai: baiDoi(['d = {3: 6, 4: 8}', 'bat_dict_crack(d)', 'move()'], ['valve_step(1)'], [], [ham('bat_dict_crack', ['go_echo()', 'play_note(d[listen()])', 'move()'], ['d'])]),
      loiSai: [
        { moTa: 'Để trống bat_dict_crack(d): R1 không đi qua được nhũ đá (5, 1)', baiLam: baiDoi(['d = {3: 6, 4: 8}', 'bat_dict_crack(d)', 'move()'], ['valve_step(1)'], [ham('bat_dict_crack', [], ['d'])]), phaiCoMa: ['loi-cu-phap'] },
        { moTa: 'Dùng play_note(listen()) thay vì play_note(d[listen()]): phát nốt 3 không phá được nhũ đá nốt 6', baiLam: baiDoi(['d = {3: 6, 4: 8}', 'bat_dict_crack(d)', 'move()'], ['valve_step(1)'], [], [ham('bat_dict_crack', ['go_echo()', 'play_note(listen())', 'move()'], ['d'])]), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 19, nhip: 6 },
      goiY: ['Trong bat_dict_crack(d), viết 3 dòng: go_echo(), play_note(d[listen()]) và move().', 'Khi đứng ở (4, 1), listen() trả về 3, d[3] là 6 — đúng tần số phá nhũ đá ở (5, 1).']
    }),

    manCH('lap-hang-dong', 3, 'lam-quen', {
      ten: 'Giải mã hai bầy dơi liên tiếp trong hành lang hẹp',
      r2: R_BANH,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'grab_clear', 'bat_dict_crack'],
      deBai: 'Hành lang có 2 bầy dơi phát sóng âm định vị ở (3, 1) và (5, 1) ứng với 2 khối nhũ đá cộng hưởng ở (4, 1) và (6, 1). R2 gọi grab_clear() dọn tảng đá o ở (2, 1) rồi lùi về cờ; R1 chờ 2 nhịp, khai báo d = {2: 5, 4: 8} rồi gọi bat_dict_crack(d) 2 lần liên tiếp để phá cả 2 nhũ đá và tiến vào cờ.',
      san: [
        '#########',
        '#.o....F#',
        '##.######',
        '##F######',
        '#########'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 2, huong: 0 }],
      r1Them: { co: [{ x: 7, y: 1 }] }, r2Them: { co: [{ x: 2, y: 3 }] },
      danDoi: [{ x: 3, y: 1, not: 2 }, { x: 5, y: 1, not: 4 }],
      daChuong: [{ x: 4, y: 1, not: 5 }, { x: 6, y: 1, not: 8 }],
      maMau: baiDoi(['d = {2: 5, 4: 8}', 'wait_n(2)', 'bat_dict_crack(d)', 'move()'], ['grab_clear()']),
      loiGiai: baiDoi(['d = {2: 5, 4: 8}', 'wait_n(2)', 'bat_dict_crack(d)', 'bat_dict_crack(d)', 'move()'], ['grab_clear()']),
      loiSai: [
        { moTa: 'R1 chỉ gọi bat_dict_crack(d) 1 lần: dừng trước nhũ đá thứ hai ở (6, 1)', baiLam: baiDoi(['d = {2: 5, 4: 8}', 'wait_n(2)', 'bat_dict_crack(d)', 'move()'], ['grab_clear()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 29, nhip: 10 },
      goiY: ['Mỗi lệnh bat_dict_crack(d) đưa R1 tới bầy dơi, tra từ điển phát nốt phá nhũ đá và bước lên ô nhũ đá vừa vỡ.', 'Gọi bat_dict_crack(d) 2 lần rồi move() vào cờ (7, 1).']
    }),

    manCH('lap-hang-dong', 4, 'cung-co', {
      ten: 'Chế hàm: Tập hợp (set) lọc tiếng vọng dơi trùng lặp',
      taoHam: ['bat_set_march'], r2: R_NHEN,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'listen_unique_step', 'pull_s'],
      deBai: 'Trong hang vòm tròn, sóng âm của đàn dơi dội lại tạo thành các nốt trùng lặp dọc hành lang. Để R1 đi qua n ô mà chỉ phát mỗi nốt mới đúng 1 lần nhờ tập hợp s (set), hãy viết hàm bat_set_march(s, n): lặp n lần (for i in range(n):) gọi listen_unique_step(s).',
      san: [
        '#########',
        '#.C....F#',
        '#.#####.#',
        '#..oM.F.#',
        '#########'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 3, huong: 1 }],
      r1Them: { co: [{ x: 7, y: 1 }] }, r2Them: { co: [{ x: 6, y: 3 }] },
      vatChat: ['.........', '.........', '.........', '...s.....', '.........'],
      noi: [{ nut: { x: 4, y: 3 }, cua: [{ x: 2, y: 1 }] }],
      danDoi: [{ x: 3, y: 1, not: 4, phamVi: 1 }, { x: 4, y: 1, not: 4, phamVi: 1 }, { x: 5, y: 1, not: 7, phamVi: 1 }],
      daChuong: [{ x: 4, y: 1, not: 4 }, { x: 6, y: 1, not: 7 }],
      maMau: baiDoi(['s = set()', 'wait_n(5)', 'forward(2)', 'bat_set_march(s, 3)', 'move()'], ['go_right()', 'pull_s()', 'go_right()', 'magnet_off()', 'wait()', 'go_right()', 'go_right()'], [ham('bat_set_march', [], ['s', 'n'])]),
      loiGiai: baiDoi(['s = set()', 'wait_n(5)', 'forward(2)', 'bat_set_march(s, 3)', 'move()'], ['go_right()', 'pull_s()', 'go_right()', 'magnet_off()', 'wait()', 'go_right()', 'go_right()'], [], [ham('bat_set_march', ['for i in range(n):', '    listen_unique_step(s)'], ['s', 'n'])]),
      loiSai: [
        { moTa: 'Để trống bat_set_march(s, n): R1 đứng yên ở (3, 1)', baiLam: baiDoi(['s = set()', 'wait_n(5)', 'forward(2)', 'bat_set_march(s, 3)', 'move()'], ['go_right()', 'pull_s()', 'go_right()', 'magnet_off()', 'wait()', 'go_right()', 'go_right()'], [ham('bat_set_march', [], ['s', 'n'])]), phaiCoMa: ['loi-cu-phap'] },
        { moTa: 'Chỉ gọi listen_unique_step(s) 1 lần không có vòng lặp: R1 chưa tới được cờ', baiLam: baiDoi(['s = set()', 'wait_n(5)', 'forward(2)', 'bat_set_march(s, 3)', 'move()'], ['go_right()', 'pull_s()', 'go_right()', 'magnet_off()', 'wait()', 'go_right()', 'go_right()'], [], [ham('bat_set_march', ['listen_unique_step(s)'], ['s', 'n'])]), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 30, nhip: 13 },
      goiY: ['Trong bat_set_march(s, n), viết vòng lặp: for i in range(n): rồi thụt lề gọi listen_unique_step(s).', 'Ở (3, 1) nốt 4 mới được thêm vào s và phát loa phá nhũ đá (4, 1); ở (4, 1) nốt 4 đã có trong s nên R1 đi thẳng không tốn nhịp phát lại!']
    }),

    manCH('lap-hang-dong', 5, 'cung-co', {
      ten: 'Lọc sóng âm đàn dơi và mở cổng cho drone tô màu',
      r2: R_DRONE, mucTieu: 'to-hinh',
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'bat_set_march', 'span_sow'],
      deBai: 'R1 khởi tạo s = set(), gọi bat_set_march(s, 3) để lọc sóng âm của đàn dơi dọc hành lang và bước lên công tắc M ở (4, 1) mở cửa C cho R2 (drone Mùa 6) bay vào gieo 3 ô rêu phát sáng màu "blue".',
      san: [
        '#######',
        '#...M.#',
        '#######',
        '#.C...#',
        '#######'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 3, huong: 1 }],
      hinh: ['.......', '.......', '.......', '...bbb.', '.......'],
      noi: [{ nut: { x: 4, y: 1 }, cua: [{ x: 2, y: 3 }] }],
      danDoi: [{ x: 1, y: 1, not: 3, phamVi: 1 }, { x: 2, y: 1, not: 3, phamVi: 1 }, { x: 3, y: 1, not: 6, phamVi: 1 }],
      daChuong: [{ x: 2, y: 1, not: 3 }, { x: 4, y: 1, not: 6 }],
      maMau: baiDoi(['s = set()', 'bat_set_march(s, 2)'], ['wait_n(6)', 'go_right()', 'go_right()', 'span_sow("blue", 3)']),
      loiGiai: baiDoi(['s = set()', 'bat_set_march(s, 3)'], ['wait_n(6)', 'go_right()', 'go_right()', 'span_sow("blue", 3)']),
      loiSai: [
        { moTa: 'R1 chỉ gọi bat_set_march(s, 2): chưa tới được nút M ở (4, 1) nên cửa C đóng', baiLam: baiDoi(['s = set()', 'bat_set_march(s, 2)'], ['wait_n(6)', 'go_right()', 'go_right()', 'span_sow("blue", 3)']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 25, nhip: 10 },
      goiY: ['Từ (1, 1) tới nút M ở (4, 1) là 3 bước: đổi đối số thứ hai của bat_set_march(s, ...) thành 3.', 'Khi R1 đè nút M ở nhịp 5, R2 chờ xong 6 nhịp sẽ bay qua cửa C và gieo 3 ô màu "blue".']
    }),

    manCH('lap-hang-dong', 6, 'cung-co', {
      ten: 'Chế hàm: Chờ cầu đá rồi phá nhũ đá trượt sàn ướt',
      taoHam: ['echo_glide_pass'], r2: R_OMNI,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'go_echo', 'crack_tunnel', 'radar_front_lob'],
      deBai: 'Khi R2 (xe omni Mùa 7) dùng radar quét và hất đá tròn lấp hố sụt u ở (2, 1), R1 cần chờ w nhịp, gọi go_echo() tiến tới đàn dơi (3, 1) rồi gọi crack_tunnel() để phá nhũ đá ở (4, 1) và thu gai trượt qua dải đá vôi ướt I tới cờ. Hãy viết hàm echo_glide_pass(w): gọi wait_n(w), gọi go_echo(), rồi gọi crack_tunnel().',
      san: [
        '########',
        '#.u.I.F#',
        '##=#####',
        '##o#####',
        '#..F####',
        '########'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 4, huong: 0 }],
      r1Them: { co: [{ x: 6, y: 1 }] }, r2Them: { co: [{ x: 3, y: 4 }] },
      vatDang: ['........', '........', '........', '..r.....', '........', '........'],
      danDoi: [{ x: 3, y: 1, not: 7 }],
      daChuong: [{ x: 4, y: 1, not: 7 }],
      maMau: baiDoi(['echo_glide_pass(2)'], ['radar_front_lob(3)'], [ham('echo_glide_pass', [], ['w'])]),
      loiGiai: baiDoi(['echo_glide_pass(2)'], ['radar_front_lob(3)'], [], [ham('echo_glide_pass', ['wait_n(w)', 'go_echo()', 'crack_tunnel()'], ['w'])]),
      loiSai: [
        { moTa: 'Để trống echo_glide_pass(w): R1 đứng yên tại chỗ', baiLam: baiDoi(['echo_glide_pass(2)'], ['radar_front_lob(3)'], [ham('echo_glide_pass', [], ['w'])]), phaiCoMa: ['loi-cu-phap'] },
        { moTa: 'Quên wait_n(w) trong echo_glide_pass(w): R1 rơi xuống hố u trước khi R2 lấp hố', baiLam: baiDoi(['echo_glide_pass(2)'], ['radar_front_lob(3)'], [], [ham('echo_glide_pass', ['go_echo()', 'crack_tunnel()'], ['w'])]), phaiCoMa: ['roi-ho', 'chua-toi-co'] }
      ],
      sao: { o: 34, nhip: 7 },
      goiY: ['Trong thân hàm echo_glide_pass(w), viết 3 dòng: wait_n(w), go_echo() và crack_tunnel().', 'Khi R1 thu gai bước lên (4, 1) là đá ướt I, R1 sẽ trượt sang (5, 1) rồi bước vào cờ (6, 1).']
    }),

    manCH('lap-hang-dong', 7, 'cung-co', {
      ten: 'Kết hợp giải mã từ điển và lướt đá ướt qua hai vòm hang',
      r2: R_XICH,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'valve_step', 'bat_dict_crack', 'echo_glide_pass'],
      deBai: 'Vòm hang đầu có đàn dơi ở (2, 1) cần tra từ điển d = {2: 6, 5: 8} bằng bat_dict_crack(d) để phá nhũ đá ở (3, 1); vòm hang sau có cửa C ở (4, 1) do R2 bắn van N mở. Sau khi gọi bat_dict_crack(d) và move() qua cửa C, R1 gọi echo_glide_pass(1) để tiến tới đàn dơi thứ hai ở (5, 1), phá nhũ đá (6, 1) và trượt qua đá ướt I về cờ.',
      san: [
        '##########',
        '#...C.I.F#',
        '#.######.#',
        '#..FN....#',
        '##########'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 3, huong: 1 }],
      r1Them: { co: [{ x: 8, y: 1 }] }, r2Them: { co: [{ x: 3, y: 3 }] },
      noi: [{ nut: { x: 4, y: 3 }, cua: [{ x: 4, y: 1 }] }],
      danDoi: [{ x: 2, y: 1, not: 2, phamVi: 1 }, { x: 5, y: 1, not: 5, phamVi: 2 }],
      daChuong: [{ x: 3, y: 1, not: 6 }, { x: 6, y: 1, not: 5 }],
      maMau: baiDoi(['d = {2: 6, 5: 8}', 'bat_dict_crack(d)', 'move()'], ['valve_step(1)']),
      loiGiai: baiDoi(['d = {2: 6, 5: 8}', 'bat_dict_crack(d)', 'move()', 'echo_glide_pass(1)'], ['valve_step(1)']),
      loiSai: [
        { moTa: 'R1 quên gọi echo_glide_pass(1) sau khi qua cửa C: dừng ở (4, 1)', baiLam: baiDoi(['d = {2: 6, 5: 8}', 'bat_dict_crack(d)', 'move()'], ['valve_step(1)']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 31, nhip: 9 },
      goiY: ['Sau bat_dict_crack(d) và move(), R1 đang đứng ở (4, 1) trước đàn dơi thứ hai (5, 1).', 'Thêm echo_glide_pass(1) để R1 tiến tới đàn dơi (5, 1), phá nhũ đá (6, 1) và lướt qua đá ướt I về cờ (8, 1).']
    }),

    manCH('lap-hang-dong', 8, 'cung-co', {
      ten: 'Chế hàm: Phối hợp giải mã sóng âm dơi và trượt ngách hang',
      taoHam: ['cave_team_clear'], r2: R_BANH,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'bat_dict_crack', 'glide_tunnel', 'grab_clear'],
      deBai: 'Để R1 phối hợp nhịp nhàng với đồng đội dọn đường, hãy viết hàm cave_team_clear(w, d): gọi wait_n(w), gọi bat_dict_crack(d), rồi gọi glide_tunnel() để thu gai lướt qua dải đá vôi ướt I tới đích. Áp dụng cave_team_clear(2, d) cho R1 khi R2 gọi grab_clear() dọn đá tảng ở (2, 1).',
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
      maMau: baiDoi(['d = {4: 7}', 'cave_team_clear(2, d)'], ['grab_clear()'], [ham('cave_team_clear', [], ['w', 'd'])]),
      loiGiai: baiDoi(['d = {4: 7}', 'cave_team_clear(2, d)'], ['grab_clear()'], [], [ham('cave_team_clear', ['wait_n(w)', 'bat_dict_crack(d)', 'glide_tunnel()'], ['w', 'd'])]),
      loiSai: [
        { moTa: 'Để trống cave_team_clear(w, d): R1 đứng yên tại chỗ', baiLam: baiDoi(['d = {4: 7}', 'cave_team_clear(2, d)'], ['grab_clear()'], [ham('cave_team_clear', [], ['w', 'd'])]), phaiCoMa: ['loi-cu-phap'] },
        { moTa: 'Quên glide_tunnel() trong cave_team_clear(w, d): R1 dừng lại ở (4, 1) chưa tới cờ', baiLam: baiDoi(['d = {4: 7}', 'cave_team_clear(2, d)'], ['grab_clear()'], [], [ham('cave_team_clear', ['wait_n(w)', 'bat_dict_crack(d)'], ['w', 'd'])]), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 33, nhip: 8 },
      goiY: ['Trong cave_team_clear(w, d), viết 3 dòng: wait_n(w), bat_dict_crack(d) và glide_tunnel().', 'Sau khi bat_dict_crack(d) đưa R1 lên (4, 1), glide_tunnel() sẽ thu gai trượt qua đá ướt I ở (5, 1) rồi tiến vào cờ (7, 1).']
    }),

    manCH('lap-hang-dong', 9, 'on-tap', {
      ten: 'Đại hợp đồng cứu hộ lòng hang đá vôi',
      r2: R_OMNI,
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'cave_team_clear', 'bat_set_march', 'radar_front_lob'],
      deBai: 'Cửa ải cuối trong lòng Hang động Đá vôi! R2 (xe omni Mùa 7) gọi radar_front_lob(3) hất đá tròn lấp hố sụt u ở (2, 1). R1 khởi tạo d = {3: 6} và s = set(), gọi cave_team_clear(2, d) để chờ cầu đá, giải mã đàn dơi thứ nhất (3, 1), phá nhũ đá (4, 1) và trượt qua đá ướt I (5, 1) tới (7, 1), rồi gọi bat_set_march(s, 2) lọc sóng âm đàn dơi cuối cùng vào cờ!',
      san: [
        '###########',
        '#.u..I...F#',
        '##=########',
        '##o########',
        '#..F#######',
        '###########'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 4, huong: 0 }],
      r1Them: { co: [{ x: 9, y: 1 }] }, r2Them: { co: [{ x: 3, y: 4 }] },
      vatDang: ['...........', '...........', '...........', '..r........', '...........', '...........'],
      danDoi: [{ x: 3, y: 1, not: 3, phamVi: 2 }, { x: 7, y: 1, not: 5, phamVi: 1 }, { x: 8, y: 1, not: 5, phamVi: 1 }],
      daChuong: [{ x: 4, y: 1, not: 6 }, { x: 8, y: 1, not: 5 }],
      maMau: baiDoi(['d = {3: 6}', 's = set()', 'cave_team_clear(2, d)'], ['radar_front_lob(3)']),
      loiGiai: baiDoi(['d = {3: 6}', 's = set()', 'cave_team_clear(2, d)', 'bat_set_march(s, 2)'], ['radar_front_lob(3)']),
      loiSai: [
        { moTa: 'R1 quên gọi bat_set_march(s, 2) ở đoạn cuối: dừng tại (7, 1) trước nhũ đá cuối', baiLam: baiDoi(['d = {3: 6}', 's = set()', 'cave_team_clear(2, d)'], ['radar_front_lob(3)']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 45, nhip: 11 },
      goiY: ['Sau cave_team_clear(2, d), R1 đang đứng ở (7, 1) ngay chỗ đàn dơi nốt 5.', 'Thêm bat_set_march(s, 2) để R1 phát nốt 5 phá nhũ đá (8, 1) và bước liền 2 ô vào cờ (9, 1).']
    }),

    manCH('lap-hang-dong', 10, 'trum', {
      ten: 'Trùm Chương 2: Bản hòa âm giải cứu Hang động Đá vôi',
      r2: R2_LOA, mucTieu: 'choi-dieu', nhipTheo: 'tong',
      hamCuaEmCan: ['play_note', 'play_part'],
      deBai: 'Toàn bộ Hang động Đá vôi đã được cứu hộ thành công! Dưới ánh rêu phát sáng và tiếng vỗ cánh của đàn dơi, R1 và R2 cùng tấu vang bản hòa âm khải hoàn qua 3 sân liên tiếp:\n- Bè 1 (R1): [5, 5, 6, 5, 8, 7, 5, 8]\n- Bè 2 (R2): [3, 3, 4, 3, 5, 5, 3, 5]\nHãy dùng play_part(notes) cho cả hai robot.',
      san: SAN_DUET_3,
      bd: [{ x: 2, y: 1, huong: 1 }, { x: 2, y: 2, huong: 1 }],
      dieu: { r1: '55658758', r2: '33435535' },
      maMau: baiDoi(['play_part([5, 5, 6, 5, 8, 7, 5, 8])'], ['play_part([3, 3, 4, 3])']),
      loiGiai: baiDoi(['play_part([5, 5, 6, 5, 8, 7, 5, 8])'], ['play_part([3, 3, 4, 3, 5, 5, 3, 5])']),
      loiSai: [
        { moTa: 'R2 chỉ phát 4 nốt đầu: chưa hoàn thành bè 2 trên 3 sân', baiLam: baiDoi(['play_part([5, 5, 6, 5, 8, 7, 5, 8])'], ['play_part([3, 3, 4, 3])']), phaiCoMa: ['lo-nhip'] }
      ],
      sao: { o: 6, nhip: 24 },
      goiY: ['Truyền đủ danh sách [3, 3, 4, 3, 5, 5, 3, 5] vào lệnh play_part(...) của R2.', 'Khi cả 3 sân đều vang đủ 8 nhịp hòa âm 2 bè, chiến dịch Giải cứu Hang động hoàn tất!']
    })
  ];
})();
