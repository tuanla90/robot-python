/* ============================================================================
   man-cuu-nong-trai.js — Mùa 9 (CLB Lập trình) · Gói 6: "Cứu hộ Nông trại"
   20 màn (2 chương × 10 màn):
   - Chương 1 (cuu-nong-trai): Drone nông nghiệp Mùa 6 (R1) phối hợp đồng đội R2
     (nhện Mùa 3, bánh xích Mùa 2, omni Mùa 7, bánh xe Mùa 1, bánh gai Mùa 8).
     Màn 8 tạo hàm mới farm_wait_sow; Màn 10 hợp tấu 2 bè (R1 + R2).
   - Chương 2 (lap-nong-trai): Ôn sâu danh sách (list) và .append() qua 4 hàm mới:
     collect_seeds (.2), sow_collected (.4), dock_span_sow (.6), gate_collect_sow (.8).
     Màn 10 hợp tấu 2 bè kết gói.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var BAY = ['go_up', 'go_down', 'go_left', 'go_right', 'wait'];
  var SON = ['ink', 'dot', 'pen_down', 'pen_up'];
  var DAP = ['land', 'take_off', 'battery'];
  var CAM_DUOI = { ma: 'camera-4', o: 'tren', taiCho: true };

  function R1_DRONE(pin) {
    var coPin = pin !== undefined;
    var d = {
      loaiRobot: 'drone',
      robot: { than: 'drone', tay: 'son', camBien: [CAM_DUOI] },
      hamGoc: BAY.concat(SON, ['color'], coPin ? DAP : ['land', 'take_off'])
    };
    if (coPin) d.pin = pin;
    return d;
  }

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

  var H_FARM_WAIT_SOW = {
    ten: 'farm_wait_sow', thamSo: ['w', 'c', 'n'],
    than: ['wait_n(w)', 'fly_right(2)', 'span_sow(c, n)']
  };
  var H_COLLECT_SEEDS = {
    ten: 'collect_seeds', thamSo: ['n'],
    than: ['a = []', 'for i in range(n):', '    a.append(color("here"))', '    go_right()', 'return a']
  };
  var H_SOW_COLLECTED = {
    ten: 'sow_collected', thamSo: ['n'],
    than: ['a = collect_seeds(n)', 'dot_row(a)']
  };
  var H_DOCK_SPAN_SOW = {
    ten: 'dock_span_sow', thamSo: ['n'],
    than: ['c = color("up")', 'dock()', 'fly_right(2)', 'span_sow(c, n)']
  };
  var H_GATE_COLLECT_SOW = {
    ten: 'gate_collect_sow', thamSo: ['w', 'n'],
    than: ['wait_n(w)', 'fly_right(2)', 'sow_collected(n)']
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function baiDoi(r1Chinh, r2Chinh, hamEm, hamMan) {
    return {
      doi: [{ chinh: r1Chinh.slice() }, { chinh: r2Chinh.slice() }],
      hamCuaMan: hamMan ? clone(hamMan) : [],
      hamCuaEmMoi: hamEm ? clone(hamEm) : []
    };
  }

  function manNT(chuong, so, hang, cfg) {
    var r1 = clone(cfg.r1 || R1_DRONE(cfg.pin));
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
      vo: 'vuon',
      loaiRobot: r1.loaiRobot,
      daLapHo: true,
      robot: clone(r1.robot),
      hamGoc: r1.hamGoc.slice(),
      cauTruc: cfg.cauTruc || ['for', 'if', 'while', 'list'],
      vaHoac: true,
      moXuong: true,
      camHamCuaEm: false,
      bienDem: true,
      nhipTheoLoiGiai: true,
      hamCuaEmCan: cfg.hamCuaEmCan || ['wait_n', 'fly_right', 'span_sow'],
      taoHam: cfg.taoHam || [],
      khung: cfg.khung || { chinh: 10, moiHam: 8 },
      mucTieu: cfg.mucTieu || 'to-hinh',
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
    if (cfg.hinh) m.hinh = cfg.hinh;
    if (cfg.mau) m.mau = cfg.mau;
    if (cfg.vatChat) m.vatChat = cfg.vatChat;
    if (cfg.vatMau) m.vatMau = cfg.vatMau;
    if (cfg.vatThem) m.vatThem = cfg.vatThem;
    if (cfg.noi) m.noi = cfg.noi;
    if (cfg.dieu) m.dieu = cfg.dieu;
    if (cfg.chuongDa) m.chuongDa = cfg.chuongDa;
    if (cfg.daChuong) m.daChuong = cfg.daChuong;
    return ManHoc.chuanHoa(m);
  }

  ManHoc.manCuuNongTrai = [
    /* ========================================================================
       CHUONG 1: cuu-nong-trai (10 man)
       ======================================================================== */
    manNT('cuu-nong-trai', 1, 'lam-quen', {
      ten: 'Nhện chui gầm đè nút mở cổng nhà kính',
      chiChay: true, r2: R_NHEN,
      hamCuaEmCan: ['wait_n', 'fly_right', 'span_sow', 'crawl'],
      deBai: 'Bão quét qua Nông trại thông minh (Mùa 6) làm sập cổng nhà kính! Drone nông nghiệp R1 ở (1, 1) không thể tự đè nút M(3, 3) dưới đất. Nhện phân loại R2 (Mùa 3) ở (1, 3) gọi crawl("R") chui qua gầm thấp n(2, 3) tới đứng đè nút M(3, 3) mở cổng C(2, 1), để R1 chờ 5 nhịp rồi bay qua cổng gieo luống 3 bông hoa đỏ. Nhấn Chạy để quan sát!',
      veMaMau: 'Quan sát R2 chui gầm đè nút M mở cổng cho drone R1 gieo hoa.',
      san: ['########', '#.C....#', '########', '#.nM...#', '########'],
      hinh: ['........', '...rrr..', '........', '........', '........'],
      bd: [{ x: 1, y: 1 }, { x: 1, y: 3, huong: 1 }],
      maMau: baiDoi(['wait_n(5)', 'fly_right(2)', 'span_sow("red", 2)'], ['crawl("R")']),
      loiGiai: baiDoi(['wait_n(5)', 'fly_right(2)', 'span_sow("red", 2)'], ['crawl("R")']),
      sao: { o: 26, nhip: 9 },
      goiY: ['Nhấn Chạy để xem R2 mở cổng C(2, 1) cho R1 bay qua gieo hoa đỏ.']
    }),

    manNT('cuu-nong-trai', 2, 'lam-quen', {
      ten: 'Xe xích đẩy thùng nặng giữ cổng vườn ươm',
      r2: R_XICH,
      hamCuaEmCan: ['wait_n', 'fly_right', 'span_sow', 'forward', 'move'],
      deBai: 'Cổng nhà kính C(2, 1) nối với nút đè M(4, 3), còn trước mặt xe bánh xích R2 (Mùa 2) ở (2, 3) có thùng nặng H(3, 3). Hãy lập trình cho R2 gọi move() đẩy thùng H(3, 3) lên đè nút M(4, 3) ngay ở nhịp 1; R1 ở (1, 1) gọi wait(), fly_right(2) qua cổng rồi gọi span_sow("yellow", 2) gieo 3 bông hoa vàng!',
      veMaMau: 'R2 chưa đẩy thùng H lên nút M(4, 3) để mở cổng cho R1.',
      san: ['########', '#.C....#', '########', '#..HM..#', '########'],
      hinh: ['........', '...yyy..', '........', '........', '........'],
      bd: [{ x: 1, y: 1 }, { x: 2, y: 3, huong: 1 }],
      maMau: baiDoi(['wait()', 'fly_right(2)', 'span_sow("yellow", 2)'], []),
      loiGiai: baiDoi(['wait()', 'fly_right(2)', 'span_sow("yellow", 2)'], ['move()']),
      loiSai: [
        { moTa: 'R2 chưa gọi move() để đẩy thùng H đè lên nút M nên cổng C đóng chặt', baiLam: baiDoi(['wait()', 'fly_right(2)', 'span_sow("yellow", 2)'], []), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 22, nhip: 5 },
      goiY: ['Ở chương trình R2, gọi move() để đẩy thùng H(3, 3) sang đè nút M(4, 3).']
    }),

    manNT('cuu-nong-trai', 3, 'luyen', {
      ten: 'Omni hất đá lấp hố rồi bước lên đè nút cổng',
      r2: R_OMNI,
      hamCuaEmCan: ['wait_n', 'fly_right', 'span_sow', 'lob', 'forward', 'move'],
      deBai: 'Ở làn dưới, giữa xe omni R2 tại (1, 3) và nút đè M(4, 3) có viên đá o(2, 3) cùng cái hố sâu u(3, 3)! Hãy cho R2 gọi lob() hất viên đá o(2, 3) lấp đầy hố u(3, 3) (mất 2 nhịp), rồi gọi forward(3) tiến thẳng qua hố đã lấp tới đứng đè nút M(4, 3). R1 ở (1, 1) gọi wait_n(5) chờ cổng C(2, 1) mở rồi gọi fly_right(2) và span_sow("blue", 2)!',
      veMaMau: 'R2 mới hất đá lấp hố, chưa gọi forward(3) để tiến lên đè nút M(4, 3).',
      san: ['########', '#.C....#', '########', '#.ouM..#', '########'],
      hinh: ['........', '...bbb..', '........', '........', '........'],
      bd: [{ x: 1, y: 1 }, { x: 1, y: 3, huong: 1 }],
      maMau: baiDoi(['wait_n(5)', 'fly_right(2)', 'span_sow("blue", 2)'], ['lob()']),
      loiGiai: baiDoi(['wait_n(5)', 'fly_right(2)', 'span_sow("blue", 2)'], ['lob()', 'forward(3)']),
      loiSai: [
        { moTa: 'R2 mới lấp hố u(3, 3) mà chưa gọi forward(3) tới đè nút M(4, 3)', baiLam: baiDoi(['wait_n(5)', 'fly_right(2)', 'span_sow("blue", 2)'], ['lob()']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 28, nhip: 9 },
      goiY: ['Ở chương trình R2, sau lob() hãy gọi forward(3) để bước tới nút M(4, 3).']
    }),

    manNT('cuu-nong-trai', 4, 'luyen', {
      ten: 'Xe tay xoay dọn kiện hàng trên trạm sạc P',
      pin: 7, r2: R_BANH,
      hamCuaEmCan: ['fly_dock', 'fly_right', 'span_sow', 'pick', 'drop_right'],
      deBai: 'Drone R1 chỉ có 7 pin nên phải bay tới đáp sạc tại trạm P(3, 1) bằng fly_dock(2), sau đó bay qua cổng C(4, 1) gieo 3 bông hoa đỏ. Nhưng trên trạm P(3, 1) đang có kiện hàng o(3, 1) chắn chỗ đáp, còn nút đè M(2, 2) nằm ngay bên phải xe tay xoay R2 (đang đứng ở (2, 1) hướng Đông)! Hãy cho R2 gọi pick() nhặt o(3, 1) rồi gọi drop_right() đặt xuống nút M(2, 2) mở cổng!',
      veMaMau: 'R2 chưa nhặt kiện hàng trên trạm sạc P(3, 1) đặt sang nút M(2, 2).',
      san: ['##########', '#..PC....#', '##M#######', '##########'],
      vatThem: [{ x: 3, y: 1 }],
      hinh: ['..........', '.....rrr..', '..........', '..........'],
      bd: [{ x: 1, y: 1 }, { x: 2, y: 1, huong: 1 }],
      maMau: baiDoi(['fly_dock(2)', 'fly_right(2)', 'span_sow("red", 2)'], []),
      loiGiai: baiDoi(['fly_dock(2)', 'fly_right(2)', 'span_sow("red", 2)'], ['pick()', 'drop_right()']),
      loiSai: [
        { moTa: 'R2 chưa dọn kiện hàng trên trạm P(3, 1) và chưa đè nút M(2, 2)', baiLam: baiDoi(['fly_dock(2)', 'fly_right(2)', 'span_sow("red", 2)'], []), phaiCoMa: ['dap-bi-chan', 'dam-tuong'] }
      ],
      sao: { o: 28, nhip: 8 },
      goiY: ['Ở chương trình R2, gọi pick() để nhặt kiện hàng ở P(3, 1) rồi gọi drop_right() thả xuống nút M(2, 2).']
    }),

    manNT('cuu-nong-trai', 5, 'cung-co', {
      ten: 'Bánh gai phá đá chuông giải cứu trạm sạc drone',
      pin: 7, r2: R_GAI,
      hamCuaEmCan: ['fly_dock', 'fly_right', 'span_sow', 'play_note'],
      deBai: 'Trên trạm sạc P(3, 1) có một tảng đá chuông nốt 4 chắn không cho drone R1 đáp sạc! R2 (robot bánh gai gắn loa Mùa 8) đang đứng ở (2, 2) cạnh chuông đá nốt 4 tại (3, 2). Hãy cho R2 gọi play_note(listen()) phá vỡ đá chuông trên P(3, 1) ngay nhịp 1; R1 ở (1, 1) gọi fly_dock(2) tới P(3, 1) đáp sạc rồi gọi go_right() và span_sow("yellow", 2) gieo 3 bông hoa vàng!',
      veMaMau: 'R1 chưa bay sang phải và gieo luống hoa vàng sau khi đáp sạc tại P(3, 1).',
      san: ['#########', '#..P....#', '#.......#', '#########'],
      chuongDa: [{ x: 3, y: 2, not: 4, phamVi: 3 }],
      daChuong: [{ x: 3, y: 1, not: 4, ben: 1 }],
      hinh: ['.........', '....yyy..', '.........', '.........'],
      bd: [{ x: 1, y: 1 }, { x: 2, y: 2, huong: 1 }],
      maMau: baiDoi(['fly_dock(2)'], ['play_note(listen())']),
      loiGiai: baiDoi(['fly_dock(2)', 'go_right()', 'span_sow("yellow", 2)'], ['play_note(listen())']),
      loiSai: [
        { moTa: 'R1 đáp sạc xong nhưng quên bay sang phải gieo 3 bông hoa vàng', baiLam: baiDoi(['fly_dock(2)'], ['play_note(listen())']), phaiCoMa: ['chua-to-hinh'] }
      ],
      sao: { o: 24, nhip: 7 },
      goiY: ['Ở chương trình R1, sau fly_dock(2) hãy thêm go_right() và span_sow("yellow", 2).']
    }),

    manNT('cuu-nong-trai', 6, 'cung-co', {
      ten: 'Nhện đọc cực từ đưa bao hạt mẫu lên nút cổng',
      r2: R_NHEN,
      hamCuaEmCan: ['fly_right', 'wait_n', 'span_sow', 'grab_pole', 'go'],
      deBai: 'Bao hạt giống đặt tại (2, 2) gắn nam châm cực N (màu đỏ). Nhện R2 ở (1, 2) gọi grab_pole() đọc cực, bật nam châm trái dấu và bước sang (2, 2) hút bao hạt; sau đó gọi go("R"), magnet_off(), wait(), go("R") để thả bao hạt đè lên nút M(3, 2) mở cổng C(4, 1) rồi bước sang (4, 2) lộ màu bao hạt! R1 ở (1, 1) gọi fly_right(2), wait_n(5), đọc c = color("down") rồi gọi fly_right(2) và span_sow(c, 1)!',
      veMaMau: 'R1 chưa đọc màu bao hạt và chưa bay qua cổng gieo hoa.',
      san: ['#########', '#...C...#', '#.oM....#', '#########'],
      vatChat: ['.........', '.........', '..N......', '.........'],
      vatMau: ['.........', '.........', '..r......', '.........'],
      hinh: ['.........', '.....rr..', '.........', '.........'],
      bd: [{ x: 1, y: 1 }, { x: 1, y: 2, huong: 1 }],
      maMau: baiDoi(['fly_right(2)', 'wait_n(5)'], ['grab_pole()', 'go("R")', 'magnet_off()', 'wait()', 'go("R")']),
      loiGiai: baiDoi(['fly_right(2)', 'wait_n(5)', 'c = color("down")', 'fly_right(2)', 'span_sow(c, 1)'], ['grab_pole()', 'go("R")', 'magnet_off()', 'wait()', 'go("R")']),
      loiSai: [
        { moTa: 'R1 chưa đọc màu bao hạt và chưa bay qua cổng gieo hoa', baiLam: baiDoi(['fly_right(2)', 'wait_n(5)'], ['grab_pole()', 'go("R")', 'magnet_off()', 'wait()', 'go("R")']), phaiCoMa: ['chua-to-hinh'] }
      ],
      sao: { o: 32, nhip: 10 },
      goiY: ['Ở chương trình R1, sau wait_n(5) hãy viết: c = color("down"), fly_right(2), span_sow(c, 1).']
    }),

    manNT('cuu-nong-trai', 7, 'van-dung', {
      ten: 'Xe xích bắn van nước mở cổng cho drone đọc dấu màu',
      r2: R_XICH,
      hamCuaEmCan: ['wait_n', 'fly_right', 'sow_up', 'squirt'],
      deBai: 'Cổng nhà kính C(2, 1) được điều khiển bởi van nước N(4, 3). Hãy cho xe bánh xích R2 ở (2, 3) hướng Đông gọi squirt("low") bắn tia nước kích hoạt van N(4, 3) mở cổng C(2, 1) ngay nhịp 1. Drone R1 ở (1, 1) gọi wait(), fly_right(2) qua cổng tới (3, 1) rồi gọi sow_up(3) để đọc 3 dấu màu hàng trên (0) và gieo đúng 3 bông hoa đỏ, vàng, lam!',
      veMaMau: 'R1 chưa gọi sow_up(3) sau khi bay qua cổng; R2 chưa gọi squirt("low").',
      san: ['###...##', '#.C....#', '########', '#...N..#', '########'],
      noi: [{ nut: { x: 4, y: 3 }, cua: [{ x: 2, y: 1 }], bang: [] }],
      mau: ['...ryb..', '........', '........', '........', '........'],
      hinh: ['........', '...ryb..', '........', '........', '........'],
      bd: [{ x: 1, y: 1 }, { x: 2, y: 3, huong: 1 }],
      maMau: baiDoi(['wait()', 'fly_right(2)'], []),
      loiGiai: baiDoi(['wait()', 'fly_right(2)', 'sow_up(3)'], ['squirt("low")']),
      loiSai: [
        { moTa: 'R2 quên gọi squirt("low") nên cổng C(2, 1) không mở', baiLam: baiDoi(['wait()', 'fly_right(2)', 'sow_up(3)'], []), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 24, nhip: 6 },
      goiY: ['R2 gọi squirt("low"); R1 sau fly_right(2) gọi thêm sow_up(3).']
    }),

    manNT('cuu-nong-trai', 8, 'van-dung', {
      ten: 'Chế hàm chờ mở cổng và bay qua gieo luống hoa',
      r2: R_NHEN, taoHam: ['farm_wait_sow'],
      hamCuaEmCan: ['wait_n', 'fly_right', 'span_sow', 'hold_gate'],
      deBai: 'Thao tác chờ đồng đội mở cổng rồi bay 2 ô qua cổng gieo luống hoa lặp lại rất nhiều lần! Hãy tạo hàm mới farm_wait_sow(w, c, n) cho R1 gồm 3 dòng: wait_n(w), fly_right(2), span_sow(c, n). Ở làn dưới, nhện R2 tại (2, 3) gọi hold_gate("R") đặt sắt lên nút M(3, 3) ở nhịp 3; R1 tại (1, 1) gọi farm_wait_sow(3, "red", 2) chờ 3 nhịp rồi bay qua cổng C(2, 1) gieo 3 bông hoa đỏ!',
      veMaMau: 'Định nghĩa hàm farm_wait_sow(w, c, n) và gọi cho R1.',
      san: ['########', '#.C....#', '########', '#.oM...#', '########'],
      vatChat: ['........', '........', '........', '..s.....', '........'],
      hinh: ['........', '...rrr..', '........', '........', '........'],
      bd: [{ x: 1, y: 1 }, { x: 2, y: 3, huong: 1 }],
      maMau: baiDoi(['fly_right(2)', 'span_sow("red", 2)'], ['hold_gate("R")']),
      loiGiai: baiDoi(['farm_wait_sow(3, "red", 2)'], ['hold_gate("R")'], [H_FARM_WAIT_SOW]),
      loiSai: [
        { moTa: 'R1 không chờ 3 nhịp nên đâm vào cổng C(2, 1) khi chưa mở', baiLam: baiDoi(['farm_wait_sow(0, "red", 2)'], ['hold_gate("R")'], [H_FARM_WAIT_SOW]), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 28, nhip: 7 },
      goiY: ['Tạo hàm farm_wait_sow(w, c, n) gồm: wait_n(w), fly_right(2), span_sow(c, n); ở R1 gọi farm_wait_sow(3, "red", 2).']
    }),

    manNT('cuu-nong-trai', 9, 'bien-the', {
      ten: 'Omni hất đá lên nút cổng cho hàm farm_wait_sow',
      r2: R_OMNI,
      hamCuaEmCan: ['farm_wait_sow', 'wait_n', 'fly_right', 'span_sow', 'aim_lob', 'lob'],
      deBai: 'Dùng lại hàm farm_wait_sow(w, c, n) vừa chế! Ở làn dưới, xe omni R2 tại (1, 3) cần hất viên đá o(2, 3) bay xa 3 ô rơi trúng nút đè M(4, 3) để giữ cổng C(2, 1) mở. Hãy cho R2 gọi aim_lob(3) (tốn 2 nhịp); R1 ở (1, 1) gọi farm_wait_sow(2, "blue", 3) chờ 2 nhịp rồi bay qua cổng gieo luống 4 bông hoa xanh dương!',
      veMaMau: 'R1 và R2 phối hợp bằng farm_wait_sow(2, "blue", 3) và aim_lob(3).',
      san: ['#########', '#.C.....#', '#########', '#.o.M...#', '#########'],
      hinh: ['.........', '...bbbb..', '.........', '.........', '.........'],
      bd: [{ x: 1, y: 1 }, { x: 1, y: 3, huong: 1 }],
      maMau: baiDoi(['farm_wait_sow(2, "blue", 3)'], []),
      loiGiai: baiDoi(['farm_wait_sow(2, "blue", 3)'], ['aim_lob(3)']),
      loiSai: [
        { moTa: 'R2 chưa gọi aim_lob(3) để hất đá lên nút M(4, 3) nên cổng C đóng chặt', baiLam: baiDoi(['farm_wait_sow(2, "blue", 3)'], []), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 26, nhip: 7 },
      goiY: ['Ở chương trình R2, gọi aim_lob(3) để hất đá từ (1, 3) tới nút M(4, 3).']
    }),

    manNT('cuu-nong-trai', 10, 'trum', {
      ten: 'Khúc nhạc mùa gieo hạt trên cánh đồng Chấn Hưng',
      r1: R1_LOA, r2: R_GAI, mucTieu: 'choi-dieu',
      dieu: { r1: '1 2 3 5', r2: '3 4 5 8' },
      hamCuaEmCan: ['play_part', 'play_note'],
      deBai: 'Những luống hoa đầu tiên đã nở rộ trong nhà kính! Dàn nhạc robot R1 và R2 cùng hòa tấu khúc ca mùa gieo hạt gồm 4 nhịp: R1 chơi bè [1, 2, 3, 5], còn R2 chơi bè hòa âm [3, 4, 5, 8]. Hãy gọi play_part([3, 4, 5, 8]) cho R2!',
      veMaMau: 'R2 chưa gọi play_part([3, 4, 5, 8]).',
      san: ['#####', '#...#', '#####'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 3, y: 1, huong: 3 }],
      maMau: baiDoi(['play_part([1, 2, 3, 5])'], ['play_note(3)']),
      loiGiai: baiDoi(['play_part([1, 2, 3, 5])'], ['play_part([3, 4, 5, 8])']),
      loiSai: [
        { moTa: 'R2 chỉ phát 1 nốt đầu nên thiếu 3 nhịp hòa âm', baiLam: baiDoi(['play_part([1, 2, 3, 5])'], ['play_note(3)']), phaiCoMa: ['lo-nhip'] }
      ],
      sao: { o: 18, nhip: 4 },
      goiY: ['Ở chương trình R2, gọi play_part([3, 4, 5, 8]).']
    }),

    /* ========================================================================
       CHUONG 2: lap-nong-trai (10 man)
       ======================================================================== */
    manNT('lap-nong-trai', 1, 'lam-quen', {
      ten: 'Sao chép dãy màu mẫu và chờ cổng mở để gieo lại',
      chiChay: true, r2: R_XICH,
      hamCuaEmCan: ['wait_n', 'fly_right', 'dot_row', 'squirt'],
      deBai: 'Sang Chương 2, đội cứu hộ ôn sâu về danh sách (list) và lệnh .append() của Mùa 6! Ở màn làm mẫu này, drone R1 đọc 2 dấu màu mẫu tại (1, 1) và (2, 1) lưu vào danh sách a bằng a.append(color("here")), chờ xe xích R2 bắn van nước N(4, 3) mở cổng C(3, 1) rồi bay qua cổng gọi dot_row(a) gieo lại đúng thứ tự màu đã thu! Nhấn Chạy để xem!',
      veMaMau: 'Quan sát R1 thu màu vào danh sách a rồi qua cổng gieo theo dot_row(a).',
      san: ['########', '#..C...#', '########', '#...N..#', '########'],
      noi: [{ nut: { x: 4, y: 3 }, cua: [{ x: 3, y: 1 }], bang: [] }],
      mau: ['........', '.ry.....', '........', '........', '........'],
      hinh: ['........', '....ry..', '........', '........', '........'],
      bd: [{ x: 1, y: 1 }, { x: 2, y: 3, huong: 1 }],
      maMau: baiDoi(['a = []', 'a.append(color("here"))', 'go_right()', 'a.append(color("here"))', 'fly_right(2)', 'dot_row(a)'], ['squirt("low")']),
      loiGiai: baiDoi(['a = []', 'a.append(color("here"))', 'go_right()', 'a.append(color("here"))', 'fly_right(2)', 'dot_row(a)'], ['squirt("low")']),
      sao: { o: 24, nhip: 6 },
      goiY: ['Nhấn Chạy để xem R1 dùng a.append(color("here")) thu mẫu màu và gieo lại sau cổng.']
    }),

    manNT('lap-nong-trai', 2, 'lam-quen', {
      ten: 'Chế hàm thu mẫu hạt giống vào danh sách bằng append',
      r2: R_NHEN, taoHam: ['collect_seeds'],
      hamCuaEmCan: ['dot_row', 'hold_gate'],
      deBai: 'Hãy đóng gói thao tác thu mẫu màu thành hàm mới collect_seeds(n) cho R1: khởi tạo a = [], lặp for i in range(n): gọi a.append(color("here")) rồi go_right(), cuối cùng return a! Trong lúc nhện R2 ở (2, 3) gọi hold_gate("R") đặt sắt lên nút M(3, 3) mở cổng C(4, 1), hãy cho R1 ở (1, 1) gọi wait(), a = collect_seeds(3) thu 3 màu tại (1..3, 1), gọi go_right() qua cổng C(4, 1) tới (5, 1) rồi gọi dot_row(a)!',
      veMaMau: 'Định nghĩa hàm collect_seeds(n) dùng .append() và return a.',
      san: ['#########', '#...C...#', '#########', '#.oM....#', '#########'],
      vatChat: ['.........', '.........', '.........', '..s......', '.........'],
      mau: ['.........', '.ryb.....', '.........', '.........', '.........'],
      hinh: ['.........', '.....ryb.', '.........', '.........', '.........'],
      bd: [{ x: 1, y: 1 }, { x: 2, y: 3, huong: 1 }],
      maMau: baiDoi(['wait()', 'a = ["red", "yellow", "blue"]', 'go_right()', 'dot_row(a)'], ['hold_gate("R")']),
      loiGiai: baiDoi(['wait()', 'a = collect_seeds(3)', 'go_right()', 'dot_row(a)'], ['hold_gate("R")'], [H_COLLECT_SEEDS]),
      loiSai: [
        { moTa: 'R1 chưa bay qua 3 ô mẫu nên gieo sai vị trí trước cổng C(4, 1)', baiLam: baiDoi(['wait()', 'a = ["red", "yellow", "blue"]', 'go_right()', 'dot_row(a)'], ['hold_gate("R")'], [H_COLLECT_SEEDS]), phaiCoMa: ['to-thua'] }
      ],
      sao: { o: 30, nhip: 8 },
      goiY: ['Tạo hàm collect_seeds(n) gồm: a = [], for i in range(n): a.append(color("here")) và go_right(), rồi return a.']
    }),

    manNT('lap-nong-trai', 3, 'luyen', {
      ten: 'Thu mẫu hạt giống kết hợp bánh gai phá đá chuông',
      r2: R_GAI,
      hamCuaEmCan: ['collect_seeds', 'dot_row', 'play_note'],
      deBai: 'Tại ô (4, 1) giữa khu mẫu hạt và luống gieo có tảng đá chuông nốt 5 chắn lối bay của R1! Hãy cho R2 (bánh gai Mùa 8) ở (3, 2) cạnh chuông đá tại (4, 2) gọi play_note(listen()) phá vỡ tảng đá chuông (4, 1) ngay nhịp 1. R1 ở (1, 1) gọi a = collect_seeds(3) thu 3 màu tại (1..3, 1), gọi go_right() bay qua ô (4, 1) vừa dọn sạch tới (5, 1) rồi gọi dot_row(a)!',
      veMaMau: 'R1 dùng collect_seeds(3) và dot_row(a); R2 phá đá chuông ở (4, 1).',
      san: ['#########', '#.......#', '#.......#', '#########'],
      chuongDa: [{ x: 4, y: 2, not: 5, phamVi: 3 }],
      daChuong: [{ x: 4, y: 1, not: 5, ben: 1 }],
      mau: ['.........', '.byr.....', '.........', '.........'],
      hinh: ['.........', '.....byr.', '.........', '.........'],
      bd: [{ x: 1, y: 1 }, { x: 3, y: 2, huong: 1 }],
      maMau: baiDoi(['a = collect_seeds(3)', 'go_right()'], ['play_note(listen())']),
      loiGiai: baiDoi(['a = collect_seeds(3)', 'go_right()', 'dot_row(a)'], ['play_note(listen())']),
      loiSai: [
        { moTa: 'R1 thu mẫu xong nhưng quên gọi dot_row(a) để gieo 3 bông hoa', baiLam: baiDoi(['a = collect_seeds(3)', 'go_right()'], ['play_note(listen())']), phaiCoMa: ['chua-to-hinh'] }
      ],
      sao: { o: 28, nhip: 8 },
      goiY: ['Ở chương trình R1, sau go_right() hãy gọi thêm dot_row(a).']
    }),

    manNT('lap-nong-trai', 4, 'luyen', {
      ten: 'Chế hàm thu mẫu và gieo nối tiếp trên cùng luống',
      r2: R_BANH, taoHam: ['sow_collected'],
      hamCuaEmCan: ['collect_seeds', 'dot_row', 'pick', 'drop_left'],
      deBai: 'Khi khu gieo hạt nằm ngay sát sau khu mẫu màu, R1 chỉ cần thu n mẫu rồi gieo nối tiếp luôn! Hãy tạo hàm mới sow_collected(n) gồm 2 dòng: a = collect_seeds(n) và dot_row(a). Ở màn này, kiện hàng màu vàng đang nằm ở (3, 2); hãy cho xe tay xoay R2 ở (2, 2) hướng Đông gọi pick() nhặt o(3, 2) rồi gọi drop_left() đặt lên ô (2, 1) làm mẫu thứ 2 trước khi R1 bay tới! R1 ở (1, 1) gọi wait_n(2) rồi gọi sow_collected(3) thu 3 mẫu tại (1..3, 1) và gieo vào (4..6, 1)!',
      veMaMau: 'Định nghĩa hàm sow_collected(n) và phối hợp với R2 đặt mẫu hạt.',
      san: ['########', '#......#', '#..o...#', '########'],
      vatMau: ['........', '........', '...y....', '........'],
      mau: ['........', '.r.b....', '........', '........'],
      hinh: ['........', '....ryb.', '........', '........'],
      bd: [{ x: 1, y: 1 }, { x: 2, y: 2, huong: 1 }],
      maMau: baiDoi(['wait_n(2)', 'a = collect_seeds(3)'], ['pick()', 'drop_left()']),
      loiGiai: baiDoi(['wait_n(2)', 'sow_collected(3)'], ['pick()', 'drop_left()'], [H_SOW_COLLECTED]),
      loiSai: [
        { moTa: 'R1 không chờ 2 nhịp nên đọc ô (2, 1) trước khi R2 kịp đặt mẫu vàng lên', baiLam: baiDoi(['sow_collected(3)'], ['pick()', 'drop_left()'], [H_SOW_COLLECTED]), phaiCoMa: ['mau-son-sai', 'chua-to-hinh'] }
      ],
      sao: { o: 30, nhip: 10 },
      goiY: ['Tạo hàm sow_collected(n) gồm: a = collect_seeds(n) và dot_row(a); ở R1 viết wait_n(2) rồi sow_collected(3).']
    }),

    manNT('lap-nong-trai', 5, 'cung-co', {
      ten: 'Đặt mẫu hạt bằng nam châm cho hàm sow_collected',
      r2: R_NHEN,
      hamCuaEmCan: ['sow_collected', 'collect_seeds', 'dot_row', 'wait_n', 'pull_deliver', 'pull_s'],
      deBai: 'Bao hạt sắt màu xanh dương đang nằm ở (2, 2) dưới bụng nhện R2. Hãy cho R2 gọi pull_deliver("U") đưa bao hạt lên ô (2, 1) rồi thả xuống (mất 4 nhịp). Drone R1 ở (1, 1) gọi wait_n(4) chờ R2 đặt xong mẫu rồi gọi sow_collected(3) thu 3 màu tại (1..3, 1) và gieo tiếp vào (4..6, 1)!',
      veMaMau: 'R2 chưa gọi pull_deliver("U") để đưa mẫu hạt sắt lên (2, 1).',
      san: ['########', '#......#', '#.o....#', '########'],
      vatChat: ['........', '........', '..s.....', '........'],
      vatMau: ['........', '........', '..b.....', '........'],
      mau: ['........', '.r.y....', '........', '........'],
      hinh: ['........', '....rby.', '........', '........'],
      bd: [{ x: 1, y: 1 }, { x: 2, y: 2, huong: 1 }],
      maMau: baiDoi(['wait_n(4)', 'sow_collected(3)'], ['pull_s()']),
      loiGiai: baiDoi(['wait_n(4)', 'sow_collected(3)'], ['pull_deliver("U")']),
      loiSai: [
        { moTa: 'R2 mới hút bao hạt tại (2, 2) mà chưa đưa lên (2, 1) nên R1 đọc thiếu màu xanh dương', baiLam: baiDoi(['wait_n(4)', 'sow_collected(3)'], ['pull_s()']), phaiCoMa: ['mau-son-sai', 'chua-to-hinh'] }
      ],
      sao: { o: 32, nhip: 12 },
      goiY: ['Ở chương trình R2, thay pull_s() bằng pull_deliver("U") để đưa bao hạt lên (2, 1).']
    }),

    manNT('lap-nong-trai', 6, 'cung-co', {
      ten: 'Chế hàm đọc màu mẫu trên trạm sạc rồi gieo luống',
      pin: 7, r2: R_NHEN, taoHam: ['dock_span_sow'],
      hamCuaEmCan: ['dock', 'span_sow', 'fly_right', 'hold_gate'],
      deBai: 'Tại trạm sạc P(3, 1), phía trên ở (3, 0) có gắn bảng màu chỉ định màu hoa của luống kế tiếp! Hãy tạo hàm mới dock_span_sow(n) cho R1 gồm: c = color("up"), dock(), fly_right(2), span_sow(c, n). Nhện R2 đứng trên trạm P(3, 1) gọi hold_gate("D") nhấc mẩu sắt khỏi P(3, 1) đem xuống đè nút M(3, 2) mở cổng C(4, 1); R1 ở (1, 1) gọi fly_right(2) tới P(3, 1) rồi gọi dock_span_sow(2)!',
      veMaMau: 'Định nghĩa hàm dock_span_sow(n) và gọi cho R1 sau khi bay tới P(3, 1).',
      san: ['###.#####', '#..PC...#', '###M#####', '#########'],
      vatThem: [{ x: 3, y: 1, chat: 'sat' }],
      mau: ['...r.....', '.........', '.........', '.........'],
      hinh: ['.........', '.....rrr.', '.........', '.........'],
      bd: [{ x: 1, y: 1 }, { x: 3, y: 1, huong: 1 }],
      maMau: baiDoi(['fly_right(2)', 'dock()'], ['hold_gate("D")']),
      loiGiai: baiDoi(['fly_right(2)', 'dock_span_sow(2)'], ['hold_gate("D")'], [H_DOCK_SPAN_SOW]),
      loiSai: [
        { moTa: 'R1 mới đáp sạc tại P(3, 1) mà chưa bay qua cổng gieo luống hoa theo màu trên (3, 0)', baiLam: baiDoi(['fly_right(2)', 'dock()'], ['hold_gate("D")'], [H_DOCK_SPAN_SOW]), phaiCoMa: ['chua-to-hinh'] }
      ],
      sao: { o: 30, nhip: 7 },
      goiY: ['Tạo hàm dock_span_sow(n) gồm: c = color("up"), dock(), fly_right(2), span_sow(c, n); ở R1 gọi fly_right(2) rồi dock_span_sow(2).']
    }),

    manNT('lap-nong-trai', 7, 'van-dung', {
      ten: 'Sạc pin đọc màu mẫu kết hợp omni hất đá giữ cổng',
      pin: 8, r2: R_OMNI,
      hamCuaEmCan: ['dock_span_sow', 'dock', 'span_sow', 'fly_right', 'aim_lob', 'lob'],
      deBai: 'Dùng lại hàm dock_span_sow(n) vừa chế! Trên ô (3, 0) phía trên trạm sạc P(3, 1) có dấu màu vàng, còn cổng C(4, 1) nối với nút đè M(4, 3). Hãy cho xe omni R2 ở (1, 3) gọi aim_lob(3) hất viên đá o(2, 3) bay 3 ô lên đè nút M(4, 3) mở cổng C(4, 1). R1 (pin 8) ở (1, 1) gọi fly_right(2) tới P(3, 1) rồi gọi dock_span_sow(3) để đọc màu vàng, sạc pin và bay qua cổng gieo 4 bông hoa vàng!',
      veMaMau: 'R1 gọi fly_right(2) và dock_span_sow(3); R2 gọi aim_lob(3).',
      san: ['###.#######', '#..PC.....#', '###########', '#.o.M.....#', '###########'],
      mau: ['...y.......', '...........', '...........', '...........', '...........'],
      hinh: ['...........', '.....yyyy..', '...........', '...........', '...........'],
      bd: [{ x: 1, y: 1 }, { x: 1, y: 3, huong: 1 }],
      maMau: baiDoi(['fly_right(2)'], ['aim_lob(3)']),
      loiGiai: baiDoi(['fly_right(2)', 'dock_span_sow(3)'], ['aim_lob(3)']),
      loiSai: [
        { moTa: 'R1 bay tới P(3, 1) nhưng quên gọi dock_span_sow(3)', baiLam: baiDoi(['fly_right(2)'], ['aim_lob(3)']), phaiCoMa: ['chua-to-hinh'] }
      ],
      sao: { o: 28, nhip: 8 },
      goiY: ['Ở chương trình R1, sau fly_right(2) hãy gọi dock_span_sow(3).']
    }),

    manNT('lap-nong-trai', 8, 'van-dung', {
      ten: 'Chế hàm chờ cổng mở rồi thu mẫu và gieo chuỗi hoa',
      r2: R_NHEN, taoHam: ['gate_collect_sow'],
      hamCuaEmCan: ['wait_n', 'fly_right', 'sow_collected', 'collect_seeds', 'dot_row', 'crawl'],
      deBai: 'Phía sau cổng C(2, 1) là khu mẫu hạt giống 2 màu tại (3, 1) và (4, 1), tiếp nối ngay sau đó là luống đất cần gieo tại (5, 1) và (6, 1)! Hãy tạo hàm mới gate_collect_sow(w, n) cho R1 gồm: wait_n(w), fly_right(2), sow_collected(n). Ở làn dưới, nhện R2 tại (1, 3) gọi crawl("R") chui qua gầm thấp n(2, 3) tới đè nút M(3, 3) ở cuối nhịp 5; R1 ở (1, 1) gọi gate_collect_sow(5, 2)!',
      veMaMau: 'Định nghĩa hàm gate_collect_sow(w, n) và gọi cho R1.',
      san: ['#########', '#.C.....#', '#########', '#.nM....#', '#########'],
      mau: ['.........', '...by....', '.........', '.........', '.........'],
      hinh: ['.........', '.....by..', '.........', '.........', '.........'],
      bd: [{ x: 1, y: 1 }, { x: 1, y: 3, huong: 1 }],
      maMau: baiDoi(['fly_right(2)', 'sow_collected(2)'], ['crawl("R")']),
      loiGiai: baiDoi(['gate_collect_sow(5, 2)'], ['crawl("R")'], [H_GATE_COLLECT_SOW]),
      loiSai: [
        { moTa: 'R1 chờ chưa đủ 5 nhịp nên đâm vào cổng C(2, 1)', baiLam: baiDoi(['gate_collect_sow(2, 2)'], ['crawl("R")'], [H_GATE_COLLECT_SOW]), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 34, nhip: 11 },
      goiY: ['Tạo hàm gate_collect_sow(w, n) gồm: wait_n(w), fly_right(2), sow_collected(n); ở R1 gọi gate_collect_sow(5, 2).']
    }),

    manNT('lap-nong-trai', 9, 'bien-the', {
      ten: 'Phá đá chuông mở nút cổng cho hàm gate_collect_sow',
      r2: R_GAI,
      hamCuaEmCan: ['gate_collect_sow', 'wait_n', 'fly_right', 'sow_collected', 'collect_seeds', 'dot_row', 'play_note', 'move'],
      deBai: 'Ở làn dưới, nút đè M(3, 3) mở cổng C(2, 1) đang bị tảng đá chuông nốt 6 che kín! Hãy cho R2 (bánh gai Mùa 8) ở (2, 3) hướng Đông gọi play_note(listen()) phá vỡ đá chuông tại (3, 3) rồi gọi move() tiến lên đè nút M(3, 3) (tổng cộng 2 nhịp). R1 ở (1, 1) gọi gate_collect_sow(2, 3) chờ 2 nhịp, bay qua cổng thu 3 mẫu màu tại (3..5, 1) và gieo vào (6..8, 1)!',
      veMaMau: 'R2 phá đá chuông rồi tiến lên nút M(3, 3); R1 gọi gate_collect_sow(2, 3).',
      san: ['###########', '#.C.......#', '###########', '#..M......#', '###########'],
      chuongDa: [{ x: 2, y: 3, not: 6, phamVi: 3 }],
      daChuong: [{ x: 3, y: 3, not: 6, ben: 1 }],
      mau: ['...........', '...ryb.....', '...........', '...........', '...........'],
      hinh: ['...........', '......ryb..', '...........', '...........', '...........'],
      bd: [{ x: 1, y: 1 }, { x: 2, y: 3, huong: 1 }],
      maMau: baiDoi(['gate_collect_sow(2, 3)'], ['play_note(listen())']),
      loiGiai: baiDoi(['gate_collect_sow(2, 3)'], ['play_note(listen())', 'move()']),
      loiSai: [
        { moTa: 'R2 mới phá đá chuông ở (3, 3) nhưng quên gọi move() tiến lên đè nút M(3, 3)', baiLam: baiDoi(['gate_collect_sow(2, 3)'], ['play_note(listen())']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 36, nhip: 10 },
      goiY: ['Ở chương trình R2, sau play_note(listen()) hãy gọi thêm move() để bước lên nút M(3, 3).']
    }),

    manNT('lap-nong-trai', 10, 'trum', {
      ten: 'Bản giao hưởng mùa hoa nở rộ',
      r1: R1_LOA, r2: R_GAI, mucTieu: 'choi-dieu',
      dieu: { r1: '1 3 5 8 5 3', r2: '3 5 8 5 3 1' },
      hamCuaEmCan: ['play_part', 'play_note'],
      deBai: 'Khép lại chiến dịch cứu hộ Nông trại thông minh, những cánh đồng hoa rực rỡ đã nở khắp thung lũng! Hai robot R1 và R2 cùng hòa tấu bản giao hưởng 6 nhịp: R1 chơi bè [1, 3, 5, 8, 5, 3], còn R2 chơi bè [3, 5, 8, 5, 3, 1]. Hãy gọi play_part([3, 5, 8, 5, 3, 1]) cho R2!',
      veMaMau: 'R2 chưa gọi play_part([3, 5, 8, 5, 3, 1]).',
      san: ['#####', '#...#', '#####'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 3, y: 1, huong: 3 }],
      maMau: baiDoi(['play_part([1, 3, 5, 8, 5, 3])'], ['play_note(3)']),
      loiGiai: baiDoi(['play_part([1, 3, 5, 8, 5, 3])'], ['play_part([3, 5, 8, 5, 3, 1])']),
      loiSai: [
        { moTa: 'R2 chỉ phát 1 nốt nhạc nên thiếu 5 nhịp hòa âm', baiLam: baiDoi(['play_part([1, 3, 5, 8, 5, 3])'], ['play_note(3)']), phaiCoMa: ['lo-nhip'] }
      ],
      sao: { o: 22, nhip: 6 },
      goiY: ['Ở chương trình R2, gọi play_part([3, 5, 8, 5, 3, 1]).']
    })
  ];
})();
