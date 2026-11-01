/* ============================================================================
   man-cuu-bai-tai-che.js - Mùa 9 CLB Sáng Tạo: Gói 3 "Cứu hộ Bãi tái chế"
   20 màn (10 màn cuu-bai-tai-che + 10 màn lap-bai-tai-che):
   - R1 (.1..9): Robot nhện Bãi tái chế Mùa 3 (than: 'nhen', tay: 'nam-cham', camBien: tu)
   - R2: Robot các mùa khác đến chi viện (xich, banh, omni, gai)
   - Màn 10 mỗi chương (hang: 'trum'): Hợp tấu 2 bè Đoạn 3 "Kìa con bướm vàng"
     (Bè 1: 5 5 4 4 3 3 2 2 | Bè 2: 3 1 2 4 1 3 5 5)
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var HAM_NHEN = ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'crouch', 'stand', 'magnet_n', 'magnet_s', 'magnet_off', 'front_metal', 'front_pole'];
  var HAM_XICH = BANH.concat(['spray', 'spray_back', 'distance', 'warm']);
  var HAM_XICH_LOA = BANH.concat(['beat', 'note', 'distance', 'warm']);
  var HAM_BANH = BANH.concat(['arm_down', 'arm_up', 'arm_left', 'arm_right', 'grab', 'release', 'front_clear', 'left_clear', 'right_clear']);
  var HAM_OMNI = BANH.concat(['slide_left', 'slide_right', 'load', 'throw', 'radar', 'diag_left', 'diag_right', 'aim', 'shape']);
  var HAM_GAI = BANH.concat(['retract_spikes', 'extend_spikes', 'beat', 'note', 'hear', 'listen']);

  var R1_NHEN = {
    loaiRobot: 'nhen',
    robot: { than: 'nhen', tay: 'nam-cham', camBien: [{ ma: 'tu', o: 'hong' }] },
    hamGoc: HAM_NHEN
  };
  var R1_LOA = {
    loaiRobot: 'xich', phatNot: true,
    robot: { than: 'xich', tay: 'loa', camBien: [{ ma: 'hong-ngoai', o: 'tren' }] },
    hamGoc: HAM_XICH_LOA
  };
  var R_XICH = {
    loaiRobot: 'xich', xichDay: true, lucBan: true,
    robot: { than: 'xich', tay: 'hoi', camBien: [{ ma: 'hong-ngoai', o: 'tren' }], son: 'lam' },
    hamGoc: HAM_XICH
  };
  var R_BANH = {
    loaiRobot: 'banh',
    robot: { than: 'hai-banh', tay: 'xoay', camBien: [{ ma: 'khoang-cach', o: 'hong' }], son: 'lam' },
    hamGoc: HAM_BANH
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

  var H_CLEAR_IRON = {
    ten: 'clear_iron', thamSo: ['d'],
    than: ['pull_s()', 'go(d)']
  };
  var H_HOP_OVER = {
    ten: 'hop_over', thamSo: ['d'],
    than: ['jump(d)', 'go(d)']
  };
  var H_PULL_DELIVER = {
    ten: 'pull_deliver', thamSo: ['d'],
    than: ['pull_s()', 'go(d)', 'magnet_off()', 'wait()']
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function baiDoi(r1Chinh, r2Chinh, hamEm, hamMan) {
    return {
      doi: [{ chinh: r1Chinh.slice() }, { chinh: r2Chinh.slice() }],
      hamCuaMan: hamMan ? clone(hamMan) : [],
      hamCuaEmMoi: hamEm ? clone(hamEm) : []
    };
  }

  function manTC(chuong, so, hang, cfg) {
    var r1 = clone(cfg.r1 || R1_NHEN);
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
      vo: 'tai-che',
      loaiRobot: r1.loaiRobot,
      daLapHo: true,
      robot: clone(r1.robot),
      hamGoc: r1.hamGoc.slice(),
      cauTruc: cfg.cauTruc || ['for', 'if', 'while', 'list'],
      vaHoac: true,
      moXuong: true,
      camHamCuaEm: false,
      hamCuaEmCan: cfg.hamCuaEmCan || ['go', 'walk', 'wait_n'],
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
    if (cfg.vatCan) m.vatCan = cfg.vatCan;
    if (cfg.noi) m.noi = cfg.noi;
    if (cfg.dieu) m.dieu = cfg.dieu;
    if (cfg.vatChat) m.vatChat = cfg.vatChat;
    if (cfg.vatThem) m.vatThem = cfg.vatThem;
    if (cfg.chuongDa) m.chuongDa = cfg.chuongDa;
    if (cfg.daChuong) m.daChuong = cfg.daChuong;
    return ManHoc.chuanHoa(m);
  }

  ManHoc.manCuuBaiTaiChe = [
    /* ========================================================================
       CHƯƠNG 1: cuu-bai-tai-che (10 màn)
       ======================================================================== */
    manTC('cuu-bai-tai-che', 1, 'lam-quen', {
      ten: 'Nhện hút sắt dọn đường cho xe xích',
      chiChay: true, r2: R_XICH,
      hamCuaEmCan: ['go', 'pull_s', 'move', 'forward', 'wait_n'],
      deBai: 'Chào mừng em đến Gói 3: Cứu hộ Bãi tái chế! R1 là robot nhện nam châm bụng Mùa 3, còn R2 là xe bánh xích Mùa 2. Mẩu sắt vụn tại (2, 1) đang cản đường R2: R1 gọi pull_s() hút sắt vào bụng rồi gọi go("D") bước xuống cờ F(2, 2), mở đường cho R2 chờ 3 nhịp rồi tiến thẳng 3 ô tới cờ F(4, 1). Nhấn Chạy để quan sát!',
      veMaMau: 'Quan sát R1 hút sắt dưới bụng nhường đường cho R2.',
      san: ['######', '#...F#', '##F###', '######'],
      bd: [{ x: 2, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      co: [[{ x: 2, y: 2 }], [{ x: 4, y: 1 }]],
      vatThem: [{ x: 2, y: 1, chat: 'sat' }],
      maMau: baiDoi(['pull_s()', 'go("D")'], ['wait_n(3)', 'forward(3)']),
      loiGiai: baiDoi(['pull_s()', 'go("D")'], ['wait_n(3)', 'forward(3)']),
      sao: { o: 14, nhip: 6 },
      goiY: ['Nhấn Chạy để xem R1 hút sắt ở (2, 1) rồi bước xuống F(2, 2) nhường đường cho R2.']
    }),

    manTC('cuu-bai-tai-che', 2, 'lam-quen', {
      ten: 'Nhện nhảy qua hố và xe xích phun van',
      r2: R_XICH,
      hamCuaEmCan: ['jump', 'walk', 'squirt'],
      deBai: 'Trên làn của R1 có hố sâu u(2, 1) và cửa C(4, 1). R2 (xe xích) đã gọi squirt("low") phun vào van N(4, 2) để mở cửa C(4, 1) rồi lùi về cờ F(1, 2). Hãy viết lệnh cho R1: sau jump("R") nhảy qua hố u(2, 1) sang (3, 1), gọi tiếp walk("RR") để đi qua cửa C(4, 1) vào cờ F(5, 1)!',
      veMaMau: 'R1 mới nhảy qua hố tới (3, 1), chưa gọi walk("RR") vào cờ F(5, 1).',
      san: ['#######', '#.u.CF#', '#F.N..#', '#######'],
      noi: [{ nut: { x: 3, y: 2 }, cua: [{ x: 4, y: 1 }] }],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 2, huong: 1 }],
      co: [[{ x: 5, y: 1 }], [{ x: 1, y: 2 }]],
      maMau: baiDoi(['jump("R")'], ['squirt("low")', 'back()']),
      loiGiai: baiDoi(['jump("R")', 'walk("RR")'], ['squirt("low")', 'back()']),
      loiSai: [
        { moTa: 'R1 mới nhảy qua hố sang (3, 1) mà chưa bước tiếp vào cờ F(5, 1)', baiLam: baiDoi(['jump("R")'], ['squirt("low")', 'back()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 18, nhip: 7 },
      goiY: ['Thêm walk("RR") sau jump("R") ở chương trình R1.']
    }),

    manTC('cuu-bai-tai-che', 3, 'luyen', {
      ten: 'Đảo cực hút nam châm chữ N mở lối cho xe kho',
      r2: R_BANH,
      hamCuaEmCan: ['go', 'pull_n', 'move', 'forward', 'wait_n'],
      deBai: 'Trên hành lang của R2 (xe hai bánh) có mẩu nam châm chữ N màu đỏ tại (2, 1). Để hút mẩu nam châm cực N, R1 đang đứng ở (2, 1) phải bật cực S bằng pull_n(), sau đó gọi go("D") bước xuống cờ F(2, 2)! R2 chờ 3 nhịp rồi tiến 3 ô tới cờ F(4, 1).',
      veMaMau: 'R1 chưa gọi pull_n() và go("D") để dọn mẩu nam châm chữ N cho R2.',
      san: ['######', '#...F#', '##F###', '######'],
      bd: [{ x: 2, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      co: [[{ x: 2, y: 2 }], [{ x: 4, y: 1 }]],
      vatThem: [{ x: 2, y: 1, chat: 'nam-cham', cuc: 'N' }],
      maMau: baiDoi(['go("D")'], ['wait_n(3)', 'forward(3)']),
      loiGiai: baiDoi(['pull_n()', 'go("D")'], ['wait_n(3)', 'forward(3)']),
      loiSai: [
        { moTa: 'R1 quên gọi pull_n() nên mẩu nam châm chữ N vẫn nằm ở (2, 1) chặn R2', baiLam: baiDoi(['go("D")'], ['wait_n(3)', 'forward(3)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 14, nhip: 6 },
      goiY: ['Ở chương trình R1, gọi pull_n() trước go("D") để hút mẩu nam châm cực N ở (2, 1).']
    }),

    manTC('cuu-bai-tai-che', 4, 'luyen', {
      ten: 'Omni hất đá lấp hố thứ hai cho nhện',
      r2: R_OMNI,
      hamCuaEmCan: ['jump', 'walk', 'lob', 'slide_r'],
      deBai: 'Hành lang của R1 có 2 hố liên tiếp u(2, 1) và u(3, 1) mà nhện không thể nhảy qua 2 hố liền nhau! R2 (robot omni) đứng ở (3, 3) sau viên đá tròn o(3, 2): hãy cho R2 gọi lob() lấp hố u(3, 1) thành mặt sàn rồi gọi slide_r(1) sang F(4, 3). Khi đó R1 chỉ cần gọi jump("R") nhảy qua hố u(2, 1) đáp xuống ô (3, 1) đã lấp, rồi gọi go("R") vào cờ F(4, 1)!',
      veMaMau: 'R2 chưa gọi lob() lấp hố u(3, 1) nên R1 nhảy hụt.',
      san: ['######', '#.uuF#', '###o##', '###.F#', '######'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 3, y: 3, huong: 0 }],
      co: [[{ x: 4, y: 1 }], [{ x: 4, y: 3 }]],
      maMau: baiDoi(['jump("R")', 'go("R")'], ['slide_r(1)']),
      loiGiai: baiDoi(['jump("R")', 'go("R")'], ['lob()', 'slide_r(1)']),
      loiSai: [
        { moTa: 'R2 quên gọi lob() nên ô (3, 1) vẫn là hố, R1 đáp xuống bị rơi hố', baiLam: baiDoi(['jump("R")', 'go("R")'], ['slide_r(1)']), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 18, nhip: 5 },
      goiY: ['R2 gọi lob() trước slide_r(1) để hất viên đá o(3, 2) lấp hố u(3, 1) ngay ở nhịp 2, trước khi R1 nhảy tới ở nhịp 3!']
    }),

    manTC('cuu-bai-tai-che', 5, 'cung-co', {
      ten: 'Chui gầm thấp mang sắt về đích D',
      r2: R_XICH, mucTieu: 'dua-vat', vatCan: 'sat',
      hamCuaEmCan: ['go', 'walk', 'pull_s', 'move'],
      deBai: 'Mẩu sắt vụn nằm ở (1, 1) ngay dưới bụng R1, còn ô đích D ở (4, 1) bên kia gầm thấp n(2, 1) và cửa C(3, 1). R2 (xe xích) ở (1, 2) tiến 1 ô đẩy thùng nặng H(2, 2) đè lên nút M(3, 2) để mở cửa C(3, 1). Hãy viết lệnh cho R1: gọi pull_s() hút sắt, gọi walk("RRR") bò qua gầm thấp n và cửa C tới D(4, 1), rồi gọi magnet_off(), wait() thả sắt xuống D!',
      veMaMau: 'R1 chưa gọi walk("RRR") và magnet_off(), wait() để đặt sắt vào D(4, 1).',
      san: ['######', '#.nCD#', '#.HM.#', '######'],
      noi: [{ nut: { x: 3, y: 2 }, cua: [{ x: 3, y: 1 }] }],
      bd: [{ x: 1, y: 1, huong: 1, chan: 'co' }, { x: 1, y: 2, huong: 1 }],
      vatThem: [{ x: 1, y: 1, chat: 'sat' }],
      maMau: baiDoi(['pull_s()'], ['move()']),
      loiGiai: baiDoi(['pull_s()', 'walk("RRR")', 'magnet_off()', 'wait()'], ['move()']),
      loiSai: [
        { moTa: 'R1 mới hút sắt mà chưa mang tới D(4, 1) và thả xuống', baiLam: baiDoi(['pull_s()'], ['move()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 15, nhip: 10 },
      goiY: ['Sau pull_s(), R1 gọi walk("RRR"), magnet_off(), wait() để mang sắt tới D(4, 1) và thả xuống.']
    }),

    manTC('cuu-bai-tai-che', 6, 'cung-co', {
      ten: 'Bánh gai phá đá chuông cho nhện qua gầm thấp',
      r2: R_GAI,
      hamCuaEmCan: ['walk', 'play_note', 'move'],
      deBai: 'Trên đường của R1 có gầm thấp n(2, 1) và tảng đá chuông nốt 4 ở (3, 1). R2 (bánh gai gắn loa) đứng ở (3, 2) hướng lên: hãy cho R2 gọi play_note(listen()) phá đá chuông (3, 1) cho R1, rồi rẽ phải tiến 1 ô vào cờ F(4, 2); R1 chỉ cần gọi walk("RRR") bò qua gầm thấp n(2, 1) và ô (3, 1) vào cờ F(4, 1)!',
      veMaMau: 'R2 chưa gọi play_note(listen()) để phá đá chuông (3, 1) cho R1.',
      san: ['######', '#.n.F#', '###.F#', '######'],
      bd: [{ x: 1, y: 1, huong: 1, chan: 'co' }, { x: 3, y: 2, huong: 0 }],
      co: [[{ x: 4, y: 1 }], [{ x: 4, y: 2 }]],
      daChuong: [{ x: 3, y: 1, not: 4, ben: 1 }],
      maMau: baiDoi(['walk("RRR")'], ['turn_right()', 'move()']),
      loiGiai: baiDoi(['walk("RRR")'], ['play_note(listen())', 'turn_right()', 'move()']),
      loiSai: [
        { moTa: 'R2 quên phá đá chuông nên R1 đâm vào đá chuông (3, 1)', baiLam: baiDoi(['walk("RRR")'], ['turn_right()', 'move()']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 13, nhip: 8 },
      goiY: ['Thêm play_note(listen()) ở đầu chương trình R2.']
    }),

    manTC('cuu-bai-tai-che', 7, 'van-dung', {
      ten: 'Cảm biến từ đọc cực nam châm mở đường',
      r2: R_BANH,
      hamCuaEmCan: ['go', 'grab_pole', 'move', 'forward', 'wait_n'],
      deBai: 'Trên hành lang dọc của R2 ở (2, 2) có một mẩu nam châm đang chắn đường! Nhờ hàm grab_pole() đã học ở Mùa 3, R1 xuất phát ở (1, 2) với huong = 1 (nhìn sang phải về (2, 2)) có thể gọi grab_pole() để đọc cực, bật cực trái dấu và bước sang (2, 2) hút mẩu nam châm vào bụng, rồi gọi go("R") bước vào cờ F(3, 2) nhường đường cho R2 tiến lên cờ F(2, 1)!',
      veMaMau: 'R1 chưa gọi go("R") vào F(3, 2) sau khi bước sang hút mẩu nam châm ở (2, 2).',
      san: ['#####', '##F##', '#..F#', '##.##', '#####'],
      bd: [{ x: 1, y: 2, huong: 1 }, { x: 2, y: 3, huong: 0 }],
      co: [[{ x: 3, y: 2 }], [{ x: 2, y: 1 }]],
      vatThem: [{ x: 2, y: 2, chat: 'nam-cham', cuc: 'S' }],
      maMau: baiDoi(['grab_pole()'], ['wait_n(5)', 'forward(2)']),
      loiGiai: baiDoi(['grab_pole()', 'go("R")'], ['wait_n(5)', 'forward(2)']),
      loiSai: [
        { moTa: 'R1 bước sang (2, 2) hút nam châm nhưng quên gọi go("R") sang F(3, 2) nên chắn đường R2', baiLam: baiDoi(['grab_pole()'], ['wait_n(5)', 'forward(2)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 16, nhip: 7 },
      goiY: ['Thêm go("R") ở cuối chương trình R1 để bước sang cờ F(3, 2) sau khi hút mẩu nam châm.']
    }),

    manTC('cuu-bai-tai-che', 8, 'van-dung', {
      ten: 'Nhện giữ nút đè M cho omni trượt ngang',
      r2: R_OMNI,
      hamCuaEmCan: ['jump', 'go', 'wait_n', 'slide_r'],
      deBai: 'Cửa C(3, 2) chắn đường trượt ngang của R2 (robot omni). Nút đè M(3, 1) nằm bên kia hàng rào sắt =(2, 1): hãy cho R1 gọi jump("R") nhảy qua hàng rào sắt =(2, 1) đáp lên nút M(3, 1), chờ 2 nhịp bằng wait_n(2) cho R2 trượt qua cửa C(3, 2), rồi gọi go("R") vào cờ F(4, 1)!',
      veMaMau: 'R1 chưa nhảy qua rào sắt =(2, 1) giữ nút M(3, 1) rồi bước vào F(4, 1).',
      san: ['######', '#.=MF#', '##.CF#', '######'],
      noi: [{ nut: { x: 3, y: 1 }, cua: [{ x: 3, y: 2 }] }],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 2, huong: 0 }],
      co: [[{ x: 4, y: 1 }], [{ x: 4, y: 2 }]],
      maMau: baiDoi(['jump("R")'], ['wait_n(3)', 'slide_r(2)']),
      loiGiai: baiDoi(['jump("R")', 'wait_n(2)', 'go("R")'], ['wait_n(3)', 'slide_r(2)']),
      loiSai: [
        { moTa: 'R1 nhảy lên nút M(3, 1) nhưng chưa chờ R2 qua cửa rồi bước vào cờ F(4, 1)', baiLam: baiDoi(['jump("R")'], ['wait_n(3)', 'slide_r(2)']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 16, nhip: 7 },
      goiY: ['Sau jump("R"), R1 gọi wait_n(2) giữ cửa mở cho R2 qua, rồi gọi go("R") vào cờ F(4, 1).']
    }),

    manTC('cuu-bai-tai-che', 9, 'bien-the', {
      ten: 'Phối hợp ba nhịp: Phá đá, hút sắt và đẩy thùng',
      r2: R_GAI, mucTieu: 'dua-vat', vatCan: 'sat',
      hamCuaEmCan: ['pull_s', 'walk', 'play_note', 'slide_stop'],
      deBai: 'Thử thách Bãi tái chế và Hang động! R1 đứng trên mẩu sắt ở (1, 1) cần mang sắt qua gầm thấp n(2, 1) và cửa C(3, 1) tới ô đích D(4, 1). R2 (bánh gai) đứng ở (2, 2) hướng phải trước tảng đá chuông nốt 6 ở (3, 2): hãy cho R2 gọi play_note(listen()) phá đá chuông (3, 2) rồi gọi slide_stop() trượt qua I(3, 2) dừng trên nút M(5, 2) mở cửa C(3, 1)! R1 gọi pull_s(), walk("RRR"), magnet_off(), wait() để đặt sắt vào D(4, 1).',
      veMaMau: 'Hoàn thiện lệnh cho R1 và R2 để mở cửa C(3, 1) và đưa sắt về D(4, 1).',
      san: ['#######', '#.nCD.#', '##.I.M#', '#######'],
      noi: [{ nut: { x: 5, y: 2 }, cua: [{ x: 3, y: 1 }] }],
      bd: [{ x: 1, y: 1, huong: 1, chan: 'co' }, { x: 2, y: 2, huong: 1 }],
      vatThem: [{ x: 1, y: 1, chat: 'sat' }],
      daChuong: [{ x: 3, y: 2, not: 6, ben: 1 }],
      maMau: baiDoi(['pull_s()', 'walk("RRR")'], ['play_note(listen())']),
      loiGiai: baiDoi(['pull_s()', 'walk("RRR")', 'magnet_off()', 'wait()'], ['play_note(listen())', 'slide_stop()']),
      loiSai: [
        { moTa: 'R2 chưa gọi slide_stop() lên nút M(5, 2) và R1 chưa thả sắt ở D(4, 1)', baiLam: baiDoi(['pull_s()', 'walk("RRR")'], ['play_note(listen())']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      sao: { o: 23, nhip: 10 },
      goiY: ['R2 thêm slide_stop() sau play_note(listen()); R1 thêm magnet_off() và wait() sau walk("RRR").']
    }),

    manTC('cuu-bai-tai-che', 10, 'trum', {
      ten: 'Hợp tấu bãi tái chế: Đoạn 3 Kìa con bướm vàng',
      r1: R1_LOA, r2: R_GAI, mucTieu: 'choi-dieu',
      dieu: { r1: '5 5 4 4 3 3 2 2', r2: '3 1 2 4 1 3 5 5' },
      hamCuaEmCan: ['play_note', 'play_part'],
      deBai: 'Khép lại chương Cứu hộ Bãi tái chế, dàn nhạc robot biểu diễn Đoạn 3 bài "Kìa con bướm vàng" ("Xoè đôi cánh, xoè đôi cánh") gồm 8 nhịp 2 bè: Bè 1 (R1) chơi giai điệu [5, 5, 4, 4, 3, 3, 2, 2], còn Bè 2 (R2) chơi bè đối âm [3, 1, 2, 4, 1, 3, 5, 5]. Hãy gọi play_part([3, 1, 2, 4, 1, 3, 5, 5]) cho R2!',
      veMaMau: 'R2 chưa chơi đủ bè 2 [3, 1, 2, 4, 1, 3, 5, 5].',
      san: ['#####', '#...#', '#####'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 3, y: 1, huong: 3 }],
      maMau: baiDoi(['play_part([5, 5, 4, 4, 3, 3, 2, 2])'], ['play_note(3)']),
      loiGiai: baiDoi(['play_part([5, 5, 4, 4, 3, 3, 2, 2])'], ['play_part([3, 1, 2, 4, 1, 3, 5, 5])']),
      loiSai: [
        { moTa: 'R2 chỉ phát 1 nốt thay vì gọi play_part([3, 1, 2, 4, 1, 3, 5, 5])', baiLam: baiDoi(['play_part([5, 5, 4, 4, 3, 3, 2, 2])'], ['play_note(3)']), phaiCoMa: ['lo-nhip'] }
      ],
      sao: { o: 24, nhip: 8 },
      goiY: ['Ở chương trình R2, gọi play_part([3, 1, 2, 4, 1, 3, 5, 5]).']
    }),

    /* ========================================================================
       CHƯƠNG 2: lap-bai-tai-che (10 màn)
       ======================================================================== */
    manTC('lap-bai-tai-che', 1, 'lam-quen', {
      ten: 'Quan sát hàm clear_iron dọn sắt nhanh',
      chiChay: true, r2: R_XICH,
      hamCuaEmCan: ['go', 'pull_s', 'move', 'forward', 'wait_n'],
      deBai: 'Sang chương Lập trình cứu Bãi tái chế, em sẽ chế tạo các hàm điều khiển nhện nam châm phối hợp cùng đồng đội! Hãy nhấn Chạy để xem R1 gọi clear_iron("D") vừa hút mẩu sắt ở (2, 1) vừa bước xuống F(2, 2), nhường đường cho R2 tiến thẳng tới cờ F(4, 1).',
      veMaMau: 'Quan sát hàm clear_iron(d) giúp R1 hút sắt và tránh đường gọn gàng.',
      san: ['######', '#...F#', '##F###', '######'],
      bd: [{ x: 2, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      co: [[{ x: 2, y: 2 }], [{ x: 4, y: 1 }]],
      vatThem: [{ x: 2, y: 1, chat: 'sat' }],
      maMau: baiDoi(['clear_iron("D")'], ['wait_n(3)', 'forward(3)'], [], [H_CLEAR_IRON]),
      loiGiai: baiDoi(['clear_iron("D")'], ['wait_n(3)', 'forward(3)'], [], [H_CLEAR_IRON]),
      sao: { o: 17, nhip: 6 },
      goiY: ['Nhấn Chạy để xem hàm clear_iron("D") hoạt động.']
    }),

    manTC('lap-bai-tai-che', 2, 'lam-quen', {
      ten: 'Chế tạo hàm clear_iron cho robot nhện',
      r2: R_BANH,
      taoHam: ['clear_iron'],
      hamCuaEmCan: ['go', 'pull_s', 'move', 'forward', 'wait_n'],
      deBai: 'Hãy định nghĩa hàm clear_iron(d) cho R1 gồm 2 lệnh: pull_s() để hút sắt vụn dưới bụng, rồi go(d) để bước sang hướng d nhường đường! Ở chương trình chính, R1 gọi clear_iron("U") hút sắt ở (2, 2) rồi bước lên cờ F(2, 1), mở đường cho R2 (xe hai bánh) chờ 3 nhịp rồi tiến 3 ô tới F(4, 2).',
      veMaMau: 'Hoàn thiện thân hàm clear_iron(d) gồm pull_s() và go(d).',
      san: ['######', '##F###', '#...F#', '######'],
      bd: [{ x: 2, y: 2, huong: 1 }, { x: 1, y: 2, huong: 1 }],
      co: [[{ x: 2, y: 1 }], [{ x: 4, y: 2 }]],
      vatThem: [{ x: 2, y: 2, chat: 'sat' }],
      maMau: baiDoi(['clear_iron("U")'], ['wait_n(3)', 'forward(3)']),
      loiGiai: baiDoi(['clear_iron("U")'], ['wait_n(3)', 'forward(3)'], [H_CLEAR_IRON]),
      loiSai: [
        { moTa: 'Hàm clear_iron(d) thiếu go(d) nên R1 vẫn đứng ở (2, 2) chắn đường R2', baiLam: baiDoi(['clear_iron("U")'], ['wait_n(3)', 'forward(3)']), hamCuaEmMoi: [{ ten: 'clear_iron', thamSo: ['d'], than: ['pull_s()'] }], phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 17, nhip: 6 },
      goiY: ['Trong hàm clear_iron(d), thêm go(d) ngay dưới pull_s().']
    }),

    manTC('lap-bai-tai-che', 3, 'luyen', {
      ten: 'Dọn sắt và đè nút mở cửa bằng clear_iron',
      r2: R_XICH,
      hamCuaEmCan: ['go', 'pull_s', 'move', 'forward', 'wait_n', 'clear_iron'],
      deBai: 'Trên đường tiến về cờ F(4, 2) của R2 có mẩu sắt tại (2, 2) và cửa C(3, 2). Hãy cho R1 ở (2, 2) gọi clear_iron("U") để vừa hút mẩu sắt ở (2, 2) vừa bước lên đè nút M(2, 1), chờ 2 nhịp bằng wait_n(2) cho R2 đi qua cửa C(3, 2), rồi gọi go("R") sang cờ F(3, 1)!',
      veMaMau: 'Gọi clear_iron("U"), wait_n(2), go("R") cho R1.',
      san: ['######', '##MF##', '#..CF#', '######'],
      noi: [{ nut: { x: 2, y: 1 }, cua: [{ x: 3, y: 2 }] }],
      bd: [{ x: 2, y: 2, huong: 1 }, { x: 1, y: 2, huong: 1 }],
      co: [[{ x: 3, y: 1 }], [{ x: 4, y: 2 }]],
      vatThem: [{ x: 2, y: 2, chat: 'sat' }],
      maMau: baiDoi(['go("U")', 'wait_n(2)', 'go("R")'], ['wait_n(3)', 'forward(3)']),
      loiGiai: baiDoi(['clear_iron("U")', 'wait_n(2)', 'go("R")'], ['wait_n(3)', 'forward(3)']),
      loiSai: [
        { moTa: 'R1 chỉ gọi go("U") mà quên hút sắt nên mẩu sắt ở (2, 2) vẫn chặn R2', baiLam: baiDoi(['go("U")', 'wait_n(2)', 'go("R")'], ['wait_n(3)', 'forward(3)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 17, nhip: 7 },
      goiY: ['Thay go("U") của R1 bằng clear_iron("U").']
    }),

    manTC('lap-bai-tai-che', 4, 'luyen', {
      ten: 'Chế tạo hàm hop_over nhảy vượt rào và bước tới',
      r2: R_OMNI,
      taoHam: ['hop_over'],
      hamCuaEmCan: ['jump', 'go', 'wait_n', 'slide_r'],
      deBai: 'Hãy định nghĩa hàm hop_over(d) cho R1 gồm 2 lệnh: jump(d) để nhảy qua hố hoặc hàng rào theo hướng d, rồi go(d) để bước thêm 1 ô nữa! Ở chương trình chính, R2 trượt sang đè nút M(3, 2) mở cửa C(3, 1) để R1 gọi hop_over("R") nhảy qua hố u(2, 1) đáp lên C(3, 1) rồi bước tiếp vào cờ F(4, 1).',
      veMaMau: 'Hoàn thiện hàm hop_over(d) gồm jump(d) và go(d).',
      san: ['######', '#.uCF#', '##.MF#', '######'],
      noi: [{ nut: { x: 3, y: 2 }, cua: [{ x: 3, y: 1 }] }],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 2, huong: 0 }],
      co: [[{ x: 4, y: 1 }], [{ x: 4, y: 2 }]],
      maMau: baiDoi(['hop_over("R")'], ['slide_r(1)', 'wait_n(2)', 'slide_r(1)']),
      loiGiai: baiDoi(['hop_over("R")'], ['slide_r(1)', 'wait_n(2)', 'slide_r(1)'], [H_HOP_OVER]),
      loiSai: [
        { moTa: 'Hàm hop_over(d) thiếu go(d) nên R1 dừng ở (3, 1), chưa vào cờ F(4, 1)', baiLam: baiDoi(['hop_over("R")'], ['slide_r(1)', 'wait_n(2)', 'slide_r(1)']), hamCuaEmMoi: [{ ten: 'hop_over', thamSo: ['d'], than: ['jump(d)'] }], phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 21, nhip: 8 },
      goiY: ['Trong hàm hop_over(d), thêm go(d) ngay dưới jump(d).']
    }),

    manTC('lap-bai-tai-che', 5, 'cung-co', {
      ten: 'Sửa lỗi hàm hop_over phối hợp xe xích phun van',
      r2: R_XICH,
      hamCuaEmCan: ['jump', 'go', 'squirt'],
      deBai: 'Trong màn này hàm hop_over(d) bị viết ngược thứ tự (gọi go(d) trước jump(d) khiến R1 bước thẳng xuống hố u(2, 1) trước khi nhảy!). Hãy sửa lại hàm hop_over(d) cho đúng thứ tự jump(d) rồi go(d), đồng thời cho R2 gọi squirt("low") phun van N(3, 2) mở cửa C(3, 1) rồi lùi về F(1, 2)!',
      veMaMau: 'Sửa lại thứ tự lệnh trong hop_over(d) và thêm squirt("low") cho R2.',
      san: ['######', '#.uCF#', '#F.N.#', '######'],
      noi: [{ nut: { x: 3, y: 2 }, cua: [{ x: 3, y: 1 }] }],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 2, huong: 1 }],
      co: [[{ x: 4, y: 1 }], [{ x: 1, y: 2 }]],
      maMau: baiDoi(['hop_over("R")'], ['back()'], [], [
        { ten: 'hop_over', thamSo: ['d'], than: ['go(d)', 'jump(d)'] }
      ]),
      loiGiai: baiDoi(['hop_over("R")'], ['squirt("low")', 'back()'], [], [H_HOP_OVER]),
      loiSai: [
        { moTa: 'Chưa sửa thứ tự lệnh trong hop_over(d) nên R1 bước thẳng xuống hố u(2, 1)', baiLam: baiDoi(['hop_over("R")'], ['squirt("low")', 'back()'], [], [{ ten: 'hop_over', thamSo: ['d'], than: ['go(d)', 'jump(d)'] }]), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 20, nhip: 5 },
      goiY: ['Đổi thứ tự trong hop_over(d) thành jump(d) rồi go(d); ở R2 thêm squirt("low") trước back().']
    }),

    manTC('lap-bai-tai-che', 6, 'cung-co', {
      ten: 'Chế tạo hàm pull_deliver giao sắt vào đích',
      r2: R_OMNI, mucTieu: 'dua-vat', vatCan: 'sat',
      taoHam: ['pull_deliver'],
      hamCuaEmCan: ['go', 'walk', 'pull_s', 'wait_n', 'slide_r'],
      deBai: 'Hãy chế tạo hàm pull_deliver(d) cho R1 gồm 4 lệnh: pull_s(), go(d), magnet_off(), wait() để hút mẩu sắt dưới bụng, bước 1 ô theo hướng d tới ô đích D rồi tắt nam châm thả sắt xuống! Ở chương trình chính, R2 (omni) gọi slide_r(1) đè nút M(2, 2) mở cửa C(2, 1), còn R1 chờ 2 nhịp, gọi walk("RR") qua cửa C(2, 1) tới ô (3, 1) có mẩu sắt rồi gọi pull_deliver("R") giao sắt vào D(4, 1)!',
      veMaMau: 'Hoàn thiện hàm pull_deliver(d) cho R1.',
      san: ['######', '#.C.D#', '#.M..#', '######'],
      noi: [{ nut: { x: 2, y: 2 }, cua: [{ x: 2, y: 1 }] }],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 2, huong: 0 }],
      vatThem: [{ x: 3, y: 1, chat: 'sat' }],
      maMau: baiDoi(['wait_n(2)', 'walk("RR")', 'pull_deliver("R")'], ['slide_r(1)']),
      loiGiai: baiDoi(['wait_n(2)', 'walk("RR")', 'pull_deliver("R")'], ['slide_r(1)'], [H_PULL_DELIVER]),
      loiSai: [
        { moTa: 'Hàm pull_deliver(d) thiếu magnet_off() và wait() nên sắt vẫn dính dưới bụng R1', baiLam: baiDoi(['wait_n(2)', 'walk("RR")', 'pull_deliver("R")'], ['slide_r(1)']), hamCuaEmMoi: [{ ten: 'pull_deliver', thamSo: ['d'], than: ['pull_s()', 'go(d)'] }], phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 19, nhip: 9 },
      goiY: ['Trong hàm pull_deliver(d), thêm magnet_off() và wait() sau go(d).']
    }),

    manTC('lap-bai-tai-che', 7, 'van-dung', {
      ten: 'Kết hợp lob_clear và pull_deliver qua hố sâu',
      r2: R_OMNI, mucTieu: 'dua-vat', vatCan: 'sat',
      hamCuaEmCan: ['go', 'pull_s', 'lob_clear', 'pull_deliver'],
      deBai: 'Mẩu sắt nằm ở (1, 1) dưới bụng R1, còn ô đích D ở (3, 1) bên kia hố sâu u(2, 1). Hãy cho R2 (robot omni) ở (2, 3) gọi lob_clear(2) để hất đá o(2, 2) lấp hố u(2, 1) rồi trượt sang phải; R1 chờ 2 nhịp cho hố lấp xong, gọi clear_iron("R") mang sắt lên (2, 1) rồi gọi pull_deliver("R") giao sắt vào D(3, 1)!',
      veMaMau: 'Phối hợp lob_clear(2) của R2 cùng clear_iron("R") và pull_deliver("R") của R1.',
      san: ['#####', '#.uD#', '##o##', '##..#', '#####'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 3, huong: 0 }],
      vatThem: [{ x: 1, y: 1, chat: 'sat' }],
      maMau: baiDoi(['wait_n(2)', 'clear_iron("R")'], ['lob_clear(2)']),
      loiGiai: baiDoi(['wait_n(2)', 'clear_iron("R")', 'pull_deliver("R")'], ['lob_clear(2)']),
      loiSai: [
        { moTa: 'R1 mới mang sắt tới (2, 1), chưa gọi pull_deliver("R") giao vào D(3, 1)', baiLam: baiDoi(['wait_n(2)', 'clear_iron("R")'], ['lob_clear(2)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 29, nhip: 9 },
      goiY: ['Ở chương trình R1, thêm pull_deliver("R") sau clear_iron("R").']
    }),

    manTC('lap-bai-tai-che', 8, 'van-dung', {
      ten: 'Xe kho chuyền kiện gỗ và nhện giao sắt',
      r2: R_BANH, mucTieu: 'dua-vat',
      hamCuaEmCan: ['go', 'pull_s', 'pick', 'drop_right', 'pull_deliver'],
      deBai: 'Màn này yêu cầu đưa cả mẩu sắt ở (1, 1) và kiện gỗ o ở (3, 2) về 2 ô đích D! R1 đứng ở (1, 1) gọi pull_deliver("R") để giao mẩu sắt vào D(2, 1). Cùng lúc đó, R2 (xe hai bánh gắn tay xoay) ở (3, 3) hướng lên hãy gọi pick(), wait() rồi gọi drop_right() thả kiện gỗ o(3, 2) vào D(4, 3)!',
      veMaMau: 'R2 chưa gọi wait() và drop_right() để thả kiện gỗ vào D(4, 3).',
      san: ['######', '#.D###', '###o##', '###.D#', '######'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 3, y: 3, huong: 0 }],
      vatThem: [{ x: 1, y: 1, chat: 'sat' }],
      maMau: baiDoi(['pull_deliver("R")'], ['pick()']),
      loiGiai: baiDoi(['pull_deliver("R")'], ['pick()', 'wait()', 'drop_right()']),
      loiSai: [
        { moTa: 'R2 chỉ gắp kiện gỗ o(3, 2) mà chưa gọi wait(), drop_right() thả vào D(4, 3)', baiLam: baiDoi(['pull_deliver("R")'], ['pick()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 22, nhip: 5 },
      goiY: ['Thêm wait() và drop_right() sau pick() ở chương trình R2.']
    }),

    manTC('lap-bai-tai-che', 9, 'bien-the', {
      ten: 'Tổng duyệt Bãi tái chế - Hang động',
      r2: R_GAI,
      hamCuaEmCan: ['jump', 'go', 'play_note', 'echo_glide', 'hop_over', 'clear_iron'],
      deBai: 'Tổng duyệt trước màn hợp tấu! R1 đứng trên mẩu sắt ở (2, 2) chắn đầu dải băng I(2, 2) của R2 (bánh gai ở (2, 3) hướng lên). Hãy cho R1 ở (2, 2) gọi clear_iron("R") sang (3, 2) rồi gọi hop_over("R") nhảy qua hố u(4, 2) và bước vào cờ F(6, 2); còn R2 chờ 3 nhịp cho R1 dọn sắt khỏi (2, 2) rồi gọi echo_glide() phá đá chuông ở (2, 1) và trượt qua I(2, 2) lên F(2, 1)!',
      veMaMau: 'Phối hợp clear_iron("R"), hop_over("R") của R1 và echo_glide() của R2.',
      san: ['########', '##F#####', '##I.u.F#', '##.#####', '########'],
      bd: [{ x: 2, y: 2, huong: 1 }, { x: 2, y: 3, huong: 0 }],
      co: [[{ x: 6, y: 2 }], [{ x: 2, y: 1 }]],
      vatThem: [{ x: 2, y: 2, chat: 'sat' }],
      daChuong: [{ x: 2, y: 1, not: 5, ben: 1 }],
      maMau: baiDoi(['clear_iron("R")'], ['wait_n(3)']),
      loiGiai: baiDoi(['clear_iron("R")', 'hop_over("R")'], ['wait_n(3)', 'echo_glide()']),
      loiSai: [
        { moTa: 'R1 chưa gọi hop_over("R") và R2 chưa gọi echo_glide()', baiLam: baiDoi(['clear_iron("R")'], ['wait_n(3)']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 28, nhip: 8 },
      goiY: ['R1 gọi clear_iron("R") rồi hop_over("R"); R2 gọi wait_n(3) rồi echo_glide().']
    }),

    manTC('lap-bai-tai-che', 10, 'trum', {
      ten: 'Hợp tấu hàm play_part: Đoạn 3 Kìa con bướm vàng',
      r1: R1_LOA, r2: R_GAI, mucTieu: 'choi-dieu',
      dieu: { r1: '5 5 4 4 3 3 2 2', r2: '3 1 2 4 1 3 5 5' },
      hamCuaEmCan: ['play_note', 'play_part'],
      deBai: 'Màn kết Gói 3: Hãy dùng hàm play_part(notes) cho cả R1 và R2 để biểu diễn Đoạn 3 bài "Kìa con bướm vàng" ("Xoè đôi cánh, xoè đôi cánh") với 2 bè 8 nhịp: R1 gọi play_part([5, 5, 4, 4, 3, 3, 2, 2]), còn R2 gọi play_part([3, 1, 2, 4, 1, 3, 5, 5])!',
      veMaMau: 'Gọi play_part([3, 1, 2, 4, 1, 3, 5, 5]) cho R2 để hoàn thành bản hợp tấu.',
      san: ['#####', '#...#', '#####'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 3, y: 1, huong: 3 }],
      maMau: baiDoi(['play_part([5, 5, 4, 4, 3, 3, 2, 2])'], ['play_part([3, 1, 2, 4])']),
      loiGiai: baiDoi(['play_part([5, 5, 4, 4, 3, 3, 2, 2])'], ['play_part([3, 1, 2, 4, 1, 3, 5, 5])']),
      loiSai: [
        { moTa: 'Danh sách nốt của R2 mới có 4 nốt, thiếu 4 nốt cuối [1, 3, 5, 5]', baiLam: baiDoi(['play_part([5, 5, 4, 4, 3, 3, 2, 2])'], ['play_part([3, 1, 2, 4])']), phaiCoMa: ['lo-nhip'] }
      ],
      sao: { o: 24, nhip: 8 },
      goiY: ['Điền đủ 8 nốt [3, 1, 2, 4, 1, 3, 5, 5] vào lệnh play_part(...) của R2.']
    })
  ];
})();
