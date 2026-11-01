/* ============================================================================
   man-trum-mua-song.js - Mua 5 (Ben song) · Goi 10: Xuong thuy loi R1
   Chuong 1: tong-hop-song (10 man) - Tong hop ben song
   Chuong 2: trum-mua-song (10 man) - Trum mua ben song
   ========================================================================== */
(function () {
  'use strict';

  var M = (typeof window !== 'undefined' && window.ManHoc) ||
    (typeof require === 'function' ? require('./man-chuoi-1.js') : null);

  var GOC_TRUM_SONG = [
    'left_move', 'right_move', 'left_back', 'right_back', 'wait',
    'tow', 'drop_tow', 'flow_dir', 'anchor', 'unanchor',
    'tether', 'untether', 'flow'
  ];
  var ROBOT_TRUM_SONG = { than: 'xuong', tay: 'day-keo', camBien: [{ ma: 'dong-chay', o: 'tren' }] };
  var CAU_TRUC = ['for', 'if', 'while', 'list', 'def', 'return', 'tuple'];

  var KHO_TRUOC = [
    'move', 'turn_left', 'turn_right', 'u_turn', 'back', 'forward',
    'span_dist', 'round_steps', 'calm_bonus', 'turn_code', 'sail_to',
    'tow_grab', 'tow_drop', 'pull_back', 'pair_step', 'tow_pair',
    'is_calm_front', 'flow_step', 'scan_calm_side', 'tow_in_calm', 'pick_calm_lane',
    'flip_valve', 'open_gate_pass', 'shut_stream_tow', 'valve_and_back', 'lock_rescue',
    'drop_anchor', 'lift_anchor', 'anchor_wait', 'anchor_tow', 'hold_and_valve',
    'tether_grab', 'tether_drop', 'tow_to_tail', 'tug_corner', 'deliver_tail',
    'flow_power', 'calmer_power', 'faster_power', 'turn_to_calmer', 'best_branch',
    'calm_gate_pass', 'dock_tow_back', 'rescue_old_dock', 'anchor_flip', 'tail_over_calm',
    'bridge_lay', 'cross_and_pick', 'ferry_drop', 'sync_dock_pass', 'clear_river_bridge'
  ];

  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function bai(chinh, phu) {
    var kq = { chinh: chinh.slice(), hamCuaMan: [], hamCuaEmMoi: [] };
    if (phu && phu.hamCuaMan) kq.hamCuaMan = phu.hamCuaMan;
    if (phu && phu.hamCuaEmMoi) kq.hamCuaEmMoi = phu.hamCuaEmMoi;
    return kq;
  }
  function cung(moTa, baiLam, phaiCoMa, them) {
    return Object.assign({ moTa: moTa, baiLam: baiLam, phaiCoMa: phaiCoMa, cung: true }, them || {});
  }

  var T_FIX_RIVER_ROUTE_SAI = [
    'rescue_old_dock(a, b)'
  ];
  var T_FIX_RIVER_ROUTE_DUNG = [
    'rescue_old_dock(a, b)',
    'tow_drop()'
  ];

  var T_RIVER_SPAN_PASS = [
    'calm_gate_pass(a + b)'
  ];
  var T_CALM_TUG_RUN = [
    'tail_over_calm(d, n)',
    'tether_drop()'
  ];
  var T_FIX_CALM_TUG_SAI = [
    'if flow_power() == 0:',
    '    flip_valve()',
    'tug_corner(d, n)',
    'tether_drop()'
  ];
  var T_FIX_CALM_TUG_DUNG = [
    'if flow_power() > 0:',
    '    flip_valve()',
    'tug_corner(d, n)',
    'tether_drop()'
  ];
  var T_ANCHOR_GATE_TOW = [
    'anchor_flip(t)',
    'pull_back(n)'
  ];
  var T_MASTER_RIVER_DOCK = [
    'river_span_pass(a, b)',
    'bridge_lay(n)'
  ];

  function hFixRiverRoute(than) { return H('fix_river_route', ['a', 'b'], than || T_FIX_RIVER_ROUTE_DUNG); }
  function hRiverSpanPass(than) { return H('river_span_pass', ['a', 'b'], than || T_RIVER_SPAN_PASS); }
  function hCalmTugRun(than) { return H('calm_tug_run', ['d', 'n'], than || T_CALM_TUG_RUN); }
  function hFixCalmTug(than) { return H('fix_calm_tug', ['d', 'n'], than || T_FIX_CALM_TUG_DUNG); }
  function hAnchorGateTow(than) { return H('anchor_gate_tow', ['t', 'n'], than || T_ANCHOR_GATE_TOW); }
  function hMasterRiverDock(than) { return H('master_river_dock', ['a', 'b', 'n'], than || T_MASTER_RIVER_DOCK); }

  function manTongHop(cfg) {
    return M.chuanHoa(Object.assign({
      chuong: 'tong-hop-song', tenChuong: 'Tổng hợp bến sông',
      loaiRobot: 'xuong',
      robot: JSON.parse(JSON.stringify(ROBOT_TRUM_SONG)),
      vo: 'song',
      hamGoc: GOC_TRUM_SONG.slice(),
      bienDem: true,
      vaHoac: true,
      cauTruc: CAU_TRUC,
      khung: { chinh: 10, moiHam: 10, cauTruc: CAU_TRUC },
      mucTieu: 'dua-vat',
      nhipTheo: 'tong',
      hamCuaEmCan: KHO_TRUOC.slice(),
      taoHam: [],
      loiSai: []
    }, cfg, { ma: 'tong-hop-song.' + cfg.so }));
  }

  function manTrumSong(cfg) {
    return M.chuanHoa(Object.assign({
      chuong: 'trum-mua-song', tenChuong: 'Trùm mùa bến sông',
      loaiRobot: 'xuong',
      robot: JSON.parse(JSON.stringify(ROBOT_TRUM_SONG)),
      vo: 'song',
      hamGoc: GOC_TRUM_SONG.slice(),
      bienDem: true,
      vaHoac: true,
      cauTruc: CAU_TRUC,
      khung: { chinh: 10, moiHam: 10, cauTruc: CAU_TRUC },
      mucTieu: 'dua-vat',
      nhipTheo: 'tong',
      hamCuaEmCan: KHO_TRUOC.slice(),
      taoHam: [],
      loiSai: []
    }, cfg, { ma: 'trum-mua-song.' + cfg.so }));
  }

  var DS = [
    /* ========================================================================
       CHUONG 1: tong-hop-song (10 man) - Tong hop ben song
       ======================================================================== */
    manTongHop({
      so: 1, ten: 'Làm mẫu xuồng thủy lợi R1 tổng hợp', hang: 'lam-quen',
      chiChay: true, chinhCoDinh: true,
      deBai: 'Sola đưa xuồng thủy lợi R1 hoàn thiện ra kiểm tra trên 2 sân: ở sân 1 cống K ở (2, 1) đang đóng kèm dòng chảy ngược, ở sân 2 cống k đã mở sẵn và nước êm. Hãy bấm Chạy để xem hàm clear_river_bridge(2, 1) tự động đo dòng nước mở cống khi cần, tiến 2 ô tới (3, 1) rồi kéo bè B ở (6, 1) về thả đúng tại bến q (3, 1)!',
      veMaMau: 'Bấm Chạy để xem hàm clear_river_bridge(2, 1) hoạt động trên cả 2 sân.',
      san: [
        ['#V======', '#~Kq~~B#', '#=u==H=#', '########'],
        ['#V======', '#~kq~~B#', '#=u==H=#', '########']
      ],
      dong: [
        [{ x: 2, y: 1, huong: 3, suc: 1 }],
        []
      ],
      noi: [
        [{ nut: { x: 1, y: 0 }, cong: [{ x: 2, y: 1 }], dong: [{ x: 2, y: 1 }] }],
        [{ nut: { x: 1, y: 0 }, cong: [{ x: 2, y: 1 }], dong: [] }]
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      maMau: bai(['clear_river_bridge(2, 1)']),
      loiGiai: bai(['clear_river_bridge(2, 1)']),
      sao: { o: 30, nhip: 11 },
      goiY: ['Luna: Chỉ cần bấm nút Chạy để quan sát clear_river_bridge(2, 1) tự thích ứng với cả 2 sân!']
    }),

    manTongHop({
      so: 2, ten: 'Đo sức nước chọn nhịp cứu hộ bến sông', hang: 'luyen',
      deBai: 'Sola thử thách trên 2 sân: từ (1, 1) hướng Đông, ô cống K ở (2, 1) có sức nước s = flow_power() (s = 1 ở sân 1 khi bè B ở (4, 1); s = 2 ở sân 2 khi bè B ở xa tại (7, 1)). Hãy đọc s = flow_power() rồi gọi clear_river_bridge(s + 1, s) để xuồng mở cống, tiến s + 1 ô và kéo bè lùi s ô về thả tại bến q (3, 1)!',
      veMaMau: 'Đọc s = flow_power() rồi gọi clear_river_bridge(s + 1, s).',
      san: [
        ['#V=======', '#~KqB~~~#', '#=u===H=#', '#########'],
        ['#V=======', '#~Kq~~~B#', '#=u===H=#', '#########']
      ],
      dong: [
        [{ x: 2, y: 1, huong: 3, suc: 1 }],
        [{ x: 2, y: 1, huong: 3, suc: 2 }]
      ],
      noi: [
        [{ nut: { x: 1, y: 0 }, cong: [{ x: 2, y: 1 }], dong: [{ x: 2, y: 1 }] }],
        [{ nut: { x: 1, y: 0 }, cong: [{ x: 2, y: 1 }], dong: [{ x: 2, y: 1 }] }]
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      maMau: bai(['s = flow_power()']),
      loiGiai: bai(['s = flow_power()', 'clear_river_bridge(s + 1, s)']),
      sao: { o: 31, nhip: 16 },
      loiGiaiKhac: {
        moTa: 'Gọi rescue_old_dock(s + 1, s) thay cho clear_river_bridge(s + 1, s)',
        baiLam: bai(['s = flow_power()', 'rescue_old_dock(s + 1, s)'])
      },
      loiSai: [
        cung('Truyền cố định clear_river_bridge(2, 1) theo sân 1 nên ở sân 2 dây phao không vươn tới bè ở (7, 1)', bai(['clear_river_bridge(2, 1)']), ['chua-dua-vat']),
        { moTa: 'Đảo ngược hai tham số thành clear_river_bridge(s, s + 1) nên kéo bè lùi quá bến q', baiLam: bai(['s = flow_power()', 'clear_river_bridge(s, s + 1)']), phaiCoMa: ['chua-dua-vat', 'dam-tuong'] }
      ],
      goiY: ['Luna: Sau khi đọc s = flow_power(), gọi clear_river_bridge(s + 1, s).', 'Luna: Ở sân 1 (s = 1) xuồng tiến 2 ô tới (3, 1) rồi kéo lùi 1 ô; ở sân 2 (s = 2) xuồng tiến 3 ô tới (4, 1) rồi kéo lùi 2 ô đều đưa B về đúng (3, 1)!']
    }),

    manTongHop({
      so: 3, ten: 'Chọn nhánh nước êm hơn vượt qua bến cũ', hang: 'luyen', mucTieu: 'toi-co',
      deBai: 'Sola dẫn xuồng tới ngã ba kênh sau cống: từ (1, 3) hướng Đông, hãy gọi calm_gate_pass(2) để kiểm tra mở cống ở (2, 3) rồi tiến tới ngã ba (3, 3). Tại (3, 3), một trong hai nhánh Bắc (3, 2) hoặc Nam (3, 4) có dòng chảy xiết ngược chiều còn nhánh kia nước êm dẫn tới cờ Q. Hãy gọi tiếp best_branch(2) để chọn nhánh êm hơn và tiến 2 ô tới Q!',
      veMaMau: 'Gọi calm_gate_pass(2) rồi best_branch(2).',
      san: [
        ['######', '#==Q=#', '#V=~=#', '#~K~~#', '#==~=#', '#=uH=#', '######'],
        ['######', '#=uH=#', '#V=~=#', '#~k~~#', '#==~=#', '#==Q=#', '######']
      ],
      dong: [
        [{ x: 2, y: 3, huong: 3, suc: 1 }, { x: 3, y: 4, huong: 0, suc: 2 }],
        [{ x: 3, y: 2, huong: 2, suc: 2 }]
      ],
      noi: [
        [{ nut: { x: 1, y: 2 }, cong: [{ x: 2, y: 3 }], dong: [{ x: 2, y: 3 }] }],
        [{ nut: { x: 1, y: 2 }, cong: [{ x: 2, y: 3 }], dong: [] }]
      ],
      batDau: [{ x: 1, y: 3, huong: 1 }, { x: 1, y: 3, huong: 1 }],
      maMau: bai(['calm_gate_pass(2)']),
      loiGiai: bai(['calm_gate_pass(2)', 'best_branch(2)']),
      sao: { o: 33, nhip: 16 },
      loiGiaiKhac: {
        moTa: 'Gọi turn_to_calmer() và forward(2) thay cho best_branch(2)',
        baiLam: bai(['calm_gate_pass(2)', 'turn_to_calmer()', 'forward(2)'])
      },
      loiSai: [
        cung('Rẽ trái cố định pair_step("L", 2) theo sân 1 nên ở sân 2 đi vào nhánh Bắc có dòng xiết ngược', bai(['calm_gate_pass(2)', 'pair_step("L", 2)']), ['chua-toi-co']),
        { moTa: 'Dùng open_gate_pass(2) thay vì calm_gate_pass(2) nên ở sân 2 làm đóng cống k', baiLam: bai(['open_gate_pass(2)', 'best_branch(2)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Luna: Bước 1 gọi calm_gate_pass(2) để vượt qua cống ở (2, 3) tới ngã ba (3, 3).', 'Luna: Bước 2 gọi best_branch(2) để xuồng tự so sánh hai nhánh Bắc - Nam và tiến 2 ô theo nhánh nước êm tới Q!']
    }),

    manTongHop({
      so: 4, ten: 'Neo xuồng mở cống rồi kéo bè về bến', hang: 'luyen',
      deBai: 'Sola thử thách phối hợp neo xuồng trên 2 sân: ở kênh dưới, bè B1 ở (1, 3) đang trôi về bến q (4, 3); ở kênh trên, từ (1, 1) hướng Đông ô (2, 1) có sức nước s = flow_power() (1 ở sân 1, 2 ở sân 2). Hãy đọc s = flow_power(), gọi turn_left() nhìn van V (1, 0), gọi anchor_flip(2 - s) để chờ đúng nhịp tắt dòng cho B1 dừng tại (4, 3) rồi tiến qua cống tới (3, 1), cuối cùng gọi bridge_lay(1) kéo B2 ở (5, 1) về (3, 1)!',
      veMaMau: 'Đọc s = flow_power(), gọi turn_left(), anchor_flip(2 - s) rồi bridge_lay(1).',
      san: [
        ['#V======', '#~Kq~B~#', '#=u==H=#', '#B~~q~~#', '########'],
        ['#V======', '#~Kq~B~#', '#=u==H=#', '#B~~q~~#', '########']
      ],
      dong: [
        [{ x: 2, y: 1, huong: 3, suc: 1 }, { x: 1, y: 3, huong: 1, suc: 1 }, { x: 2, y: 3, huong: 1, suc: 1 }, { x: 3, y: 3, huong: 1, suc: 1 }, { x: 4, y: 3, huong: 1, suc: 1 }],
        [{ x: 2, y: 1, huong: 3, suc: 2 }, { x: 1, y: 3, huong: 1, suc: 2 }, { x: 3, y: 3, huong: 1, suc: 1 }, { x: 4, y: 3, huong: 1, suc: 1 }]
      ],
      noi: [
        [{ nut: { x: 1, y: 0 }, cong: [{ x: 2, y: 1 }], dong: [{ x: 2, y: 1 }, { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 3 }] }],
        [{ nut: { x: 1, y: 0 }, cong: [{ x: 2, y: 1 }], dong: [{ x: 2, y: 1 }, { x: 1, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 3 }] }]
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      maMau: bai(['s = flow_power()', 'turn_left()', 'anchor_flip(2 - s)']),
      loiGiai: bai(['s = flow_power()', 'turn_left()', 'anchor_flip(2 - s)', 'bridge_lay(1)']),
      sao: { o: 42, nhip: 19 },
      loiGiaiKhac: {
        moTa: 'Gọi pull_back(1) thay cho bridge_lay(1) ở bước cuối',
        baiLam: bai(['s = flow_power()', 'turn_left()', 'anchor_flip(2 - s)', 'pull_back(1)'])
      },
      loiSai: [
        cung('Truyền cố định anchor_flip(1) theo sân 1 nên ở sân 2 tắt dòng trễ làm bè dưới trôi lố qua (4, 3)', bai(['turn_left()', 'anchor_flip(1)', 'bridge_lay(1)']), ['chua-dua-vat']),
        { moTa: 'Quên gọi bridge_lay(1) ở cuối nên bè trên ở (5, 1) chưa về bến (3, 1)', baiLam: bai(['s = flow_power()', 'turn_left()', 'anchor_flip(2 - s)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Đọc s = flow_power(), quay trái rồi gọi anchor_flip(2 - s) để canh chuẩn nhịp bè dưới trôi vào (4, 3) trên cả 2 sân.', 'Luna: Sau anchor_flip(2 - s) xuồng đang ở (3, 1); gọi tiếp bridge_lay(1) để kéo bè ở (5, 1) về (3, 1)!']
    }),

    manTongHop({
      so: 5, ten: 'Mở cống rồi lai dắt lục bình qua cua hẹp', hang: 'luyen',
      deBai: 'Sola giao nhiệm vụ dọn cả lục bình L lẫn bè B: từ (2, 1) hướng Đông trước L ở (3, 1), hãy gọi tail_over_calm("R", 4) và tether_drop() để mở cống (2, 3) khi cần, lai dắt L qua cua xuống thả tại bến q (2, 4) trong khi xuồng dừng ở (2, 5). Tiếp theo gọi turn_left() hướng Đông rồi gọi bridge_lay(0) để ngoắc bè B ở (4, 5) về ngay mũi xuồng tại bến q (3, 5)!',
      veMaMau: 'Gọi tail_over_calm("R", 4), tether_drop(), turn_left() rồi bridge_lay(0).',
      san: [
        ['##V####', '#~~L~~#', '#=~~~=#', '#uK~~H#', '#~q~~~#', '#~~qB~#', '#######'],
        ['##V####', '#~~L~~#', '#=~~~=#', '#uk~~H#', '#~q~~~#', '#~~qB~#', '#######']
      ],
      dong: [
        [{ x: 3, y: 1, huong: 1, suc: 1 }],
        []
      ],
      noi: [
        [{ nut: { x: 2, y: 0 }, cong: [{ x: 2, y: 3 }], dong: [{ x: 3, y: 1 }] }],
        [{ nut: { x: 2, y: 0 }, cong: [{ x: 2, y: 3 }], dong: [] }]
      ],
      batDau: [{ x: 2, y: 1, huong: 1 }, { x: 2, y: 1, huong: 1 }],
      maMau: bai(['tail_over_calm("R", 4)', 'tether_drop()']),
      loiGiai: bai(['tail_over_calm("R", 4)', 'tether_drop()', 'turn_left()', 'bridge_lay(0)']),
      sao: { o: 42, nhip: 23 },
      loiGiaiKhac: {
        moTa: 'Gọi tow_grab() thay cho bridge_lay(0) ở bước cuối',
        baiLam: bai(['tail_over_calm("R", 4)', 'tether_drop()', 'turn_left()', 'tow_grab()'])
      },
      loiSai: [
        cung('Gọi flip_valve() cố định rồi deliver_tail("R", 4) theo sân 1 nên ở sân 2 làm đóng cống k ở (2, 3)', bai(['flip_valve()', 'deliver_tail("R", 4)', 'turn_left()', 'bridge_lay(0)']), ['dam-tuong', 'chua-dua-vat']),
        { moTa: 'Quên gọi tether_drop() sau tail_over_calm("R", 4) nên khi ngoắc bè B bị báo lỗi đang kéo vật', baiLam: bai(['tail_over_calm("R", 4)', 'turn_left()', 'bridge_lay(0)']), phaiCoMa: ['dang-keo', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau tail_over_calm("R", 4), nhớ gọi tether_drop() để thả L tại (2, 4) trước khi xoay mũi.', 'Luna: Tại (2, 5) gọi turn_left() nhìn về Đông rồi gọi bridge_lay(0) (hoặc tow_grab()) để kéo B từ (4, 5) về (3, 5)!']
    }),

    manTongHop({
      so: 6, ten: 'Sửa hàm cứu hộ hai nhánh fix_river_route(a, b)', hang: 'luyen',
      deBai: 'Kíp trực viết hàm fix_river_route(a, b) để mở cống khi có dòng chảy, tiến a ô và kéo bè lùi b ô về bến, nhưng quên lệnh tháo dây tow_drop() ở cuối hàm làm xuồng vướng bè đầu khi rẽ sang nhánh thứ hai! Hãy thêm tow_drop() vào cuối hàm fix_river_route(a, b) để cứu cả 2 bè trên 2 sân.',
      veMaMau: 'Thêm tow_drop() vào cuối hàm fix_river_route(a, b).',
      san: [
        ['#V======', '#~Kq~B~#', '#=~===H#', '#=~q~B=#', '########'],
        ['#V======', '#~kq~B~#', '#=~===H#', '#=~q~B=#', '########']
      ],
      dong: [
        [{ x: 2, y: 1, huong: 3, suc: 1 }],
        []
      ],
      noi: [
        [{ nut: { x: 1, y: 0 }, cong: [{ x: 2, y: 1 }], dong: [{ x: 2, y: 1 }] }],
        [{ nut: { x: 1, y: 0 }, cong: [{ x: 2, y: 1 }], dong: [] }]
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      maMau: bai([
        'fix_river_route(2, 1)',
        'pair_step("R", 2)',
        'turn_left()',
        'fix_river_route(1, 1)'
      ], { hamCuaEmMoi: [hFixRiverRoute(T_FIX_RIVER_ROUTE_SAI)] }),
      loiGiai: bai([
        'fix_river_route(2, 1)',
        'pair_step("R", 2)',
        'turn_left()',
        'fix_river_route(1, 1)'
      ], { hamCuaEmMoi: [hFixRiverRoute(T_FIX_RIVER_ROUTE_DUNG)] }),
      sao: { o: 41, nhip: 27 },
      loiGiaiKhac: {
        moTa: 'Viết clear_river_bridge(a, b) trong thân hàm fix_river_route(a, b)',
        baiLam: bai([
          'fix_river_route(2, 1)',
          'pair_step("R", 2)',
          'turn_left()',
          'fix_river_route(1, 1)'
        ]),
        hamCuaEmMoi: [hFixRiverRoute(['clear_river_bridge(a, b)'])]
      },
      loiSai: [
        { moTa: 'Để nguyên hàm mẫu quên tow_drop() nên khi quay phải ở (2, 1) bị vướng bè đang kéo ở mũi', baiLam: bai(['fix_river_route(2, 1)', 'pair_step("R", 2)', 'turn_left()', 'fix_river_route(1, 1)']), hamCuaEmMoi: [hFixRiverRoute(T_FIX_RIVER_ROUTE_SAI)], phaiCoMa: ['mui-vuong', 'dang-keo', 'chua-dua-vat'] },
        cung('Bỏ điều kiện dòng chảy, gọi open_gate_pass(a) cố định theo sân 1 nên ở sân 2 làm đóng cống k', bai(['fix_river_route(2, 1)', 'pair_step("R", 2)', 'turn_left()', 'fix_river_route(1, 1)']), ['dam-tuong', 'chua-dua-vat'], { hamCuaEmMoi: [hFixRiverRoute(['open_gate_pass(a)', 'bridge_lay(b)'])] })
      ],
      goiY: ['Luna: Hàm rescue_old_dock(a, b) chưa tháo dây phao sau khi kéo bè về bến.', 'Luna: Chỉ cần thêm dòng tow_drop() ngay dưới rescue_old_dock(a, b) trong hàm fix_river_route(a, b)!']
    }),

    manTongHop({
      so: 7, ten: 'Vòng lặp dọn hai luồng cống liên tiếp', hang: 'luyen',
      deBai: 'Sola dẫn xuồng qua kênh dài có 2 trạm cống ở (2, 1) và (4, 1): ở sân 1 cống đầu đóng và cống hai mở, ở sân 2 cống đầu mở và cống hai đóng. Hãy dùng vòng lặp for i in range(2): gọi calm_gate_pass(2) để vượt qua cả 2 trạm cống tới (5, 1), sau đó gọi bridge_lay(1) kéo bè B ở (7, 1) về bến q (5, 1)!',
      veMaMau: 'Dùng for i in range(2): gọi calm_gate_pass(2), sau vòng lặp gọi bridge_lay(1).',
      san: [
        ['#V=V=====', '#~K~kq~B#', '#=u===H=#', '#########'],
        ['#V=V=====', '#~k~Kq~B#', '#=u===H=#', '#########']
      ],
      dong: [
        [{ x: 2, y: 1, huong: 3, suc: 1 }],
        [{ x: 4, y: 1, huong: 3, suc: 1 }]
      ],
      noi: [
        [{ nut: { x: 1, y: 0 }, cong: [{ x: 2, y: 1 }], dong: [{ x: 2, y: 1 }] }, { nut: { x: 3, y: 0 }, cong: [{ x: 4, y: 1 }], dong: [] }],
        [{ nut: { x: 1, y: 0 }, cong: [{ x: 2, y: 1 }], dong: [] }, { nut: { x: 3, y: 0 }, cong: [{ x: 4, y: 1 }], dong: [{ x: 4, y: 1 }] }]
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      maMau: bai(['for i in range(2):', '    calm_gate_pass(2)']),
      loiGiai: bai(['for i in range(2):', '    calm_gate_pass(2)', 'bridge_lay(1)']),
      sao: { o: 30, nhip: 18 },
      loiGiaiKhac: {
        moTa: 'Gọi calm_gate_pass(2) rồi rescue_old_dock(2, 1)',
        baiLam: bai(['calm_gate_pass(2)', 'rescue_old_dock(2, 1)'])
      },
      loiSai: [
        cung('Gọi open_gate_pass(2) ở trạm 1 và forward(2) ở trạm 2 theo sân 1 nên hỏng ở sân 2', bai(['open_gate_pass(2)', 'forward(2)', 'bridge_lay(1)']), ['dam-tuong', 'chua-dua-vat']),
        { moTa: 'Quên gọi bridge_lay(1) sau vòng lặp nên bè B ở (7, 1) chưa về bến (5, 1)', baiLam: bai(['for i in range(2):', '    calm_gate_pass(2)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Mỗi bước calm_gate_pass(2) sẽ tự kiểm tra cống trước mặt và tiến 2 ô tới trước trạm kế tiếp.', 'Luna: Sau 2 vòng lặp xuồng đứng ở (5, 1); gọi bridge_lay(1) để kéo B từ (7, 1) về (5, 1)!']
    }),

    manTongHop({
      so: 8, ten: 'Đọc tuple dòng chảy chọn hướng cứu hộ', hang: 'luyen',
      deBai: 'Sola đưa xuồng tới ngã tư thủy lợi: từ (1, 3) hướng Đông, ô (2, 3) trước mặt có dòng chảy báo cả hướng nhánh có bè lẫn số bước kéo lùi! Ở sân 1 dòng chảy hướng Bắc ("left", sức 1) và bè ở nhánh Bắc (2, 1); ở sân 2 dòng chảy hướng Nam ("right", sức 2) và bè ở nhánh Nam (2, 6). Hãy đọc h, s = flow() trước, gọi calm_gate_pass(1) để tắt dòng và tiến vào (2, 3), sau đó nếu h == "left" thì turn_left() ngược lại turn_right(), rồi gọi bridge_lay(s) đưa bè về bến q!',
      veMaMau: 'Đọc h, s = flow(), gọi calm_gate_pass(1), rẽ theo h rồi gọi bridge_lay(s).',
      san: [
        ['######', '#=B==#', '#V~H=#', '#~q~~#', '#=~u=#', '#=~==#', '#=~==#', '######'],
        ['######', '#=~==#', '#VqH=#', '#~~~~#', '#=~u=#', '#=~==#', '#=B==#', '######']
      ],
      dong: [
        [{ x: 2, y: 3, huong: 0, suc: 1 }],
        [{ x: 2, y: 3, huong: 2, suc: 2 }]
      ],
      noi: [
        [{ nut: { x: 1, y: 2 }, cong: [], dong: [{ x: 2, y: 3 }] }],
        [{ nut: { x: 1, y: 2 }, cong: [], dong: [{ x: 2, y: 3 }] }]
      ],
      batDau: [{ x: 1, y: 3, huong: 1 }, { x: 1, y: 3, huong: 1 }],
      maMau: bai(['h, s = flow()', 'calm_gate_pass(1)']),
      loiGiai: bai([
        'h, s = flow()',
        'calm_gate_pass(1)',
        'if h == "left":',
        '    turn_left()',
        'else:',
        '    turn_right()',
        'bridge_lay(s)'
      ]),
      sao: { o: 34, nhip: 15 },
      loiGiaiKhac: {
        moTa: 'Gọi pull_back(s) thay cho bridge_lay(s) ở cuối chương trình',
        baiLam: bai([
          'h, s = flow()',
          'calm_gate_pass(1)',
          'if h == "left":',
          '    turn_left()',
          'else:',
          '    turn_right()',
          'pull_back(s)'
        ])
      },
      loiSai: [
        cung('Rẽ trái cố định turn_left() và kéo bridge_lay(1) theo sân 1 nên ở sân 2 quay sai hướng', bai(['calm_gate_pass(1)', 'turn_left()', 'bridge_lay(1)']), ['chua-dua-vat']),
        { moTa: 'Đọc h, s = flow() SAU khi đã gọi calm_gate_pass(1) nên dòng chảy đã tắt (h = "none", s = 0)', baiLam: bai(['calm_gate_pass(1)', 'h, s = flow()', 'if h == "left":', '    turn_left()', 'else:', '    turn_right()', 'bridge_lay(s)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Phải đọc h, s = flow() ngay từ đầu tại (1, 3) trước khi calm_gate_pass(1) gạt van tắt dòng ở (2, 3)!', 'Luna: Lưu ý ở sân 1 bến q ở (2, 3) còn ở sân 2 bến q ở (2, 2), nên bridge_lay(s) sẽ kéo bè về đúng bến trên cả 2 sân.']
    }),

    manTongHop({
      so: 9, ten: 'Phối hợp dọn cống và lai dắt hai bè về bến', hang: 'luyen',
      deBai: 'Sola giao nhiệm vụ giải cứu liên hoàn 2 kênh trên 2 sân: từ (2, 1) hướng Đông, hãy gọi clear_river_bridge(1, 2) để kiểm tra mở cống (3, 1), tiến 1 ô rồi kéo bè B ở (5, 1) lùi 2 ô thả vào bến q (2, 1) (xuồng lùi về (1, 1)). Tiếp theo gọi pair_step("R", 2) và pair_step("L", 1) để sang (2, 3) hướng Đông, rồi gọi tail_over_calm("R", 3) và tether_drop() đưa lục bình L ở (3, 3) qua cống (2, 4) về bến q (2, 5)!',
      veMaMau: 'Gọi clear_river_bridge(1, 2), pair_step("R", 2), pair_step("L", 1), tail_over_calm("R", 3) và tether_drop().',
      san: [
        ['##V#####', '#~qK~B~#', '#~V====#', '#~~L===#', '#=K=uH=#', '#=q====#', '#=~====#', '########'],
        ['##V#####', '#~qk~B~#', '#~V====#', '#~~L===#', '#=k=uH=#', '#=q====#', '#=~====#', '########']
      ],
      dong: [
        [{ x: 3, y: 1, huong: 3, suc: 1 }, { x: 3, y: 3, huong: 1, suc: 1 }],
        []
      ],
      noi: [
        [{ nut: { x: 2, y: 0 }, cong: [{ x: 3, y: 1 }], dong: [{ x: 3, y: 1 }] }, { nut: { x: 2, y: 2 }, cong: [{ x: 2, y: 4 }], dong: [{ x: 3, y: 3 }] }],
        [{ nut: { x: 2, y: 0 }, cong: [{ x: 3, y: 1 }], dong: [] }, { nut: { x: 2, y: 2 }, cong: [{ x: 2, y: 4 }], dong: [] }]
      ],
      batDau: [{ x: 2, y: 1, huong: 1 }, { x: 2, y: 1, huong: 1 }],
      maMau: bai([
        'clear_river_bridge(1, 2)',
        'pair_step("R", 2)',
        'pair_step("L", 1)'
      ]),
      loiGiai: bai([
        'clear_river_bridge(1, 2)',
        'pair_step("R", 2)',
        'pair_step("L", 1)',
        'tail_over_calm("R", 3)',
        'tether_drop()'
      ]),
      sao: { o: 51, nhip: 38 },
      loiGiaiKhac: {
        moTa: 'Gọi rescue_old_dock(1, 2) kèm tow_drop() thay cho clear_river_bridge(1, 2)',
        baiLam: bai([
          'rescue_old_dock(1, 2)',
          'tow_drop()',
          'pair_step("R", 2)',
          'pair_step("L", 1)',
          'tail_over_calm("R", 3)',
          'tether_drop()'
        ])
      },
      loiSai: [
        cung('Gọi open_gate_pass(1) và flip_valve() cố định theo sân 1 nên ở sân 2 làm đóng cả hai cống k', bai(['open_gate_pass(1)', 'bridge_lay(2)', 'pair_step("R", 2)', 'pair_step("L", 1)', 'flip_valve()', 'deliver_tail("R", 3)']), ['dam-tuong', 'chua-dua-vat']),
        { moTa: 'Đi thiếu bước tail_over_calm("R", 2) nên lục bình L mới tới cống (2, 4), chưa vào bến (2, 5)', baiLam: bai(['clear_river_bridge(1, 2)', 'pair_step("R", 2)', 'pair_step("L", 1)', 'tail_over_calm("R", 2)', 'tether_drop()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau clear_river_bridge(1, 2), bè B đã nằm ở (2, 1) còn xuồng ở (1, 1); đi xuống (1, 3) rồi rẽ trái sang (2, 3).', 'Luna: Tại (2, 3) gọi tail_over_calm("R", 3) rồi tether_drop() để đưa L qua cống (2, 4) vào bến (2, 5)!']
    }),

    manTongHop({
      so: 10, ten: 'Trùm tổng hợp bến sông: giải cứu ba luồng nước', hang: 'trum', huyHieu: 'tong-hop-song',
      deBai: 'Trùm chương 1 trên 3 sân liên tiếp! Trạng thái đóng mở của 2 cống (3, 1) và (2, 4) thay đổi khác nhau ở cả 3 sân, và vị trí bè B ở kênh trên cũng thay đổi theo sức nước s ở (1, 2) khi xuồng đi qua! Từ (2, 1) hướng Đông, hãy gọi clear_river_bridge(1, 2) cứu bè B về (2, 1), gọi pair_step("R", 2) và pair_step("L", 1) sang (2, 3), sau đó gọi tail_over_calm("R", 3) và tether_drop() đưa L về (2, 5) để giành Huy hiệu Tổng hợp Bến sông!',
      veMaMau: 'Kết hợp clear_river_bridge(1, 2), di chuyển sang (2, 3) rồi gọi tail_over_calm("R", 3) và tether_drop().',
      san: [
        ['##V#####', '#~qK~B~#', '#~V====#', '#~~L===#', '#=K=uH=#', '#=q====#', '#=~====#', '########'],
        ['##V#####', '#~qk~B~#', '#~V====#', '#~~L===#', '#=K=uH=#', '#=q====#', '#=~====#', '########'],
        ['##V#####', '#~qK~B~#', '#~V====#', '#~~L===#', '#=k=uH=#', '#=q====#', '#=~====#', '########']
      ],
      dong: [
        [{ x: 3, y: 1, huong: 3, suc: 1 }, { x: 3, y: 3, huong: 1, suc: 1 }],
        [{ x: 3, y: 3, huong: 1, suc: 2 }],
        [{ x: 3, y: 1, huong: 3, suc: 2 }]
      ],
      noi: [
        [{ nut: { x: 2, y: 0 }, cong: [{ x: 3, y: 1 }], dong: [{ x: 3, y: 1 }] }, { nut: { x: 2, y: 2 }, cong: [{ x: 2, y: 4 }], dong: [{ x: 3, y: 3 }] }],
        [{ nut: { x: 2, y: 0 }, cong: [{ x: 3, y: 1 }], dong: [] }, { nut: { x: 2, y: 2 }, cong: [{ x: 2, y: 4 }], dong: [{ x: 3, y: 3 }] }],
        [{ nut: { x: 2, y: 0 }, cong: [{ x: 3, y: 1 }], dong: [{ x: 3, y: 1 }] }, { nut: { x: 2, y: 2 }, cong: [{ x: 2, y: 4 }], dong: [] }]
      ],
      batDau: [{ x: 2, y: 1, huong: 1 }, { x: 2, y: 1, huong: 1 }, { x: 2, y: 1, huong: 1 }],
      maMau: bai([
        'clear_river_bridge(1, 2)',
        'pair_step("R", 2)'
      ]),
      loiGiai: bai([
        'clear_river_bridge(1, 2)',
        'pair_step("R", 2)',
        'pair_step("L", 1)',
        'tail_over_calm("R", 3)',
        'tether_drop()'
      ]),
      sao: { o: 51, nhip: 60 },
      loiGiaiKhac: {
        moTa: 'Dùng turn_right(), forward(2), turn_left(), forward(1) để di chuyển sang (2, 3)',
        baiLam: bai([
          'clear_river_bridge(1, 2)',
          'turn_right()',
          'forward(2)',
          'turn_left()',
          'forward(1)',
          'tail_over_calm("R", 3)',
          'tether_drop()'
        ])
      },
      loiSai: [
        cung('Gọi cố định open_gate_pass(1) ở kênh trên theo sân 1 nên hỏng ở sân 2 khi cống k đã mở sẵn', bai(['open_gate_pass(1)', 'bridge_lay(2)', 'pair_step("R", 2)', 'pair_step("L", 1)', 'tail_over_calm("R", 3)', 'tether_drop()']), ['dam-tuong', 'chua-dua-vat']),
        cung('Gọi cố định flip_valve() ở kênh dưới theo sân 1 và 2 nên hỏng ở sân 3 khi cống dưới đã mở', bai(['clear_river_bridge(1, 2)', 'pair_step("R", 2)', 'pair_step("L", 1)', 'flip_valve()', 'deliver_tail("R", 3)']), ['dam-tuong', 'chua-dua-vat'])
      ],
      goiY: ['Luna: Cả 3 sân đều giải được bằng cùng 5 dòng lệnh nếu em dùng clear_river_bridge(1, 2) và tail_over_calm("R", 3)!', 'Luna: Đừng quên gọi tether_drop() ở dòng cuối cùng để thả L vào bến (2, 5).']
    }),

    /* ========================================================================
       CHUONG 2: trum-mua-song (10 man) - Trum mua ben song
       ======================================================================== */
    manTrumSong({
      so: 1, ten: 'Chế hàm thông luồng tổng hai nhịp river_span_pass(a, b)', hang: 'luyen', mucTieu: 'toi-co',
      taoHam: ['river_span_pass'],
      deBai: 'Bước vào chương Trùm mùa Bến sông, Sola hướng dẫn chế hàm đầu tiên: river_span_pass(a, b) giúp kiểm tra mở cống khi có dòng chảy rồi tiến thẳng tổng hai chặng a + b ô bằng cách gọi calm_gate_pass(a + b). Trên 2 sân, hãy đọc s = flow_power() tại (2, 1) rồi gọi river_span_pass(s, 2) để xuồng tiến s + 2 ô tới đúng phao đích Q!',
      veMaMau: 'Trong river_span_pass(a, b), viết calm_gate_pass(a + b). Ở chương trình chính đọc s = flow_power() rồi gọi river_span_pass(s, 2).',
      san: [
        ['#V======', '#~kQ~~~#', '#=u==H=#', '########'],
        ['#V======', '#~K~~Q~#', '#=u==H=#', '########']
      ],
      dong: [
        [],
        [{ x: 2, y: 1, huong: 3, suc: 2 }]
      ],
      noi: [
        [{ nut: { x: 1, y: 0 }, cong: [{ x: 2, y: 1 }], dong: [] }],
        [{ nut: { x: 1, y: 0 }, cong: [{ x: 2, y: 1 }], dong: [{ x: 2, y: 1 }] }]
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      maMau: bai(['s = flow_power()', 'river_span_pass(s, 2)']),
      loiGiai: bai(['s = flow_power()', 'river_span_pass(s, 2)'], { hamCuaEmMoi: [hRiverSpanPass()] }),
      sao: { o: 22, nhip: 9 },
      loiGiaiKhac: {
        moTa: 'Kiểm tra if flow_power() > 0: flip_valve() rồi gọi span_dist(a, b) trong thân hàm',
        baiLam: bai(['s = flow_power()', 'river_span_pass(s, 2)']),
        hamCuaEmMoi: [hRiverSpanPass(['if flow_power() > 0:', '    flip_valve()', 'span_dist(a, b)'])]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm river_span_pass(a, b)', baiLam: bai(['s = flow_power()', 'river_span_pass(s, 2)']), phaiCoMa: ['ham-chua-co'] },
        cung('Truyền cố định river_span_pass(0, 2) theo sân 1 nên ở sân 2 đâm vào cống K và đi thiếu bước', bai(['river_span_pass(0, 2)']), ['chua-toi-co'], { hamCuaEmMoi: [hRiverSpanPass()] }),
        { moTa: 'Chỉ truyền calm_gate_pass(a) thay vì calm_gate_pass(a + b) trong hàm', baiLam: bai(['s = flow_power()', 'river_span_pass(s, 2)']), hamCuaEmMoi: [hRiverSpanPass(['calm_gate_pass(a)'])], phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Luna: Hàm river_span_pass(a, b) chỉ cần 1 dòng: calm_gate_pass(a + b).', 'Luna: Ở sân 1 (s = 0) xuồng đi 0 + 2 = 2 ô tới (3, 1); ở sân 2 (s = 2) xuồng mở cống rồi đi 2 + 2 = 4 ô tới (5, 1)!']
    }),

    manTrumSong({
      so: 2, ten: 'Dùng river_span_pass(a, b) vượt cống kéo bè xa', hang: 'luyen',
      hamCuaEmCan: KHO_TRUOC.concat(['river_span_pass']),
      deBai: 'Sola kết hợp hàm river_span_pass(a, b) vừa chế với bridge_lay(1): từ (1, 1) hướng Đông, hãy đọc s = flow_power() tại (2, 1), gọi river_span_pass(s, 2) để tiến s + 2 ô qua cống tới đúng vị trí bến q, sau đó gọi bridge_lay(1) để kéo bè B về thả vào bến q trên cả 2 sân!',
      veMaMau: 'Đọc s = flow_power(), gọi river_span_pass(s, 2) rồi bridge_lay(1).',
      san: [
        ['#V=======', '#~kqB~~~#', '#=u===H=#', '#########'],
        ['#V=======', '#~K~~q~B#', '#=u===H=#', '#########']
      ],
      dong: [
        [],
        [{ x: 2, y: 1, huong: 3, suc: 2 }]
      ],
      noi: [
        [{ nut: { x: 1, y: 0 }, cong: [{ x: 2, y: 1 }], dong: [] }],
        [{ nut: { x: 1, y: 0 }, cong: [{ x: 2, y: 1 }], dong: [{ x: 2, y: 1 }] }]
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      maMau: bai(['s = flow_power()', 'river_span_pass(s, 2)']),
      loiGiai: bai(['s = flow_power()', 'river_span_pass(s, 2)', 'bridge_lay(1)']),
      sao: { o: 31, nhip: 13 },
      loiGiaiKhac: {
        moTa: 'Gọi pull_back(1) thay cho bridge_lay(1) ở bước cuối',
        baiLam: bai(['s = flow_power()', 'river_span_pass(s, 2)', 'pull_back(1)'])
      },
      loiSai: [
        cung('Truyền cố định river_span_pass(0, 2) theo sân 1 nên ở sân 2 dừng ở (3, 1), dây phao không vươn tới bè ở (7, 1)', bai(['river_span_pass(0, 2)', 'bridge_lay(1)']), ['chua-dua-vat']),
        { moTa: 'Quên gọi bridge_lay(1) sau khi tới bến q nên chưa kéo bè B về bến', baiLam: bai(['s = flow_power()', 'river_span_pass(s, 2)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Đọc s = flow_power() rồi gọi river_span_pass(s, 2) sẽ đưa xuồng tới (3, 1) ở sân 1 và (5, 1) ở sân 2.', 'Luna: Gọi tiếp bridge_lay(1) để kéo bè B về đúng ô bến q!']
    }),

    manTrumSong({
      so: 3, ten: 'Chế hàm lai dắt trọn gói qua cống calm_tug_run(d, n)', hang: 'luyen',
      hamCuaEmCan: KHO_TRUOC.concat(['river_span_pass']),
      taoHam: ['calm_tug_run'],
      deBai: 'Sola hướng dẫn chế hàm thứ 2 của chương Trùm: calm_tug_run(d, n) thực hiện trọn gói việc kiểm tra mở cống, buộc vật nổi ra sau đuôi, rẽ hướng d đi n ô rồi tháo dây thả vật tại bến! Hãy chế hàm calm_tug_run(d, n) gồm 2 dòng: tail_over_calm(d, n) và tether_drop(). Ở chương trình chính, đọc s = flow_power() tại (3, 1) rồi gọi calm_tug_run("R", s + 3) đưa lục bình L về bến q!',
      veMaMau: 'Trong calm_tug_run(d, n), viết tail_over_calm(d, n) và tether_drop(). Ở main đọc s = flow_power() rồi gọi calm_tug_run("R", s + 3).',
      san: [
        ['##V###', '#~~L~#', '#=k~=#', '#uq~H#', '#~~~~#', '#~~~~#', '######'],
        ['##V###', '#~~L~#', '#=K~=#', '#u~~H#', '#~q~~#', '#~~~~#', '######']
      ],
      dong: [
        [],
        [{ x: 3, y: 1, huong: 1, suc: 1 }]
      ],
      noi: [
        [{ nut: { x: 2, y: 0 }, cong: [{ x: 2, y: 2 }], dong: [] }],
        [{ nut: { x: 2, y: 0 }, cong: [{ x: 2, y: 2 }], dong: [{ x: 3, y: 1 }] }]
      ],
      batDau: [{ x: 2, y: 1, huong: 1 }, { x: 2, y: 1, huong: 1 }],
      maMau: bai(['s = flow_power()', 'calm_tug_run("R", s + 3)']),
      loiGiai: bai(['s = flow_power()', 'calm_tug_run("R", s + 3)'], { hamCuaEmMoi: [hCalmTugRun()] }),
      sao: { o: 35, nhip: 16 },
      loiGiaiKhac: {
        moTa: 'Gọi deliver_tail(d, n) sau khi kiểm tra dòng chảy trong thân hàm calm_tug_run(d, n)',
        baiLam: bai(['s = flow_power()', 'calm_tug_run("R", s + 3)']),
        hamCuaEmMoi: [hCalmTugRun(['if flow_power() > 0:', '    flip_valve()', 'deliver_tail(d, n)'])]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm calm_tug_run(d, n)', baiLam: bai(['s = flow_power()', 'calm_tug_run("R", s + 3)']), phaiCoMa: ['ham-chua-co'] },
        cung('Truyền cố định calm_tug_run("R", 3) theo sân 1 nên ở sân 2 L dừng ở (2, 3), chưa tới bến (2, 4)', bai(['calm_tug_run("R", 3)']), ['chua-dua-vat'], { hamCuaEmMoi: [hCalmTugRun()] }),
        { moTa: 'Chỉ đi cố định 2 ô tail_over_calm(d, 2) trong hàm nên L chưa tới bến q', baiLam: bai(['s = flow_power()', 'calm_tug_run("R", s + 3)']), hamCuaEmMoi: [hCalmTugRun(['tail_over_calm(d, 2)', 'tether_drop()'])], phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Hàm calm_tug_run(d, n) gồm 2 dòng: tail_over_calm(d, n) và tether_drop().', 'Luna: Ở sân 1 (s = 0) xuồng đi 3 ô thả L ở (2, 3); ở sân 2 (s = 1) xuồng mở cống rồi đi 4 ô thả L ở (2, 4)!']
    }),

    manTrumSong({
      so: 4, ten: 'Sửa hàm lai dắt qua cống fix_calm_tug(d, n)', hang: 'luyen',
      hamCuaEmCan: KHO_TRUOC.concat(['river_span_pass', 'calm_tug_run']),
      deBai: 'Kíp trực viết hàm fix_calm_tug(d, n) để lai dắt lục bình L qua cống rồi thả tại bến (2, 4), sau đó xuồng xoay trái kéo tiếp bè B ở (4, 5) về (3, 5). Nhưng điều kiện trong hàm bị viết ngược thành if flow_power() == 0: nên ở sân 1 không mở cống K còn ở sân 2 lại đóng cống k! Hãy sửa điều kiện thành if flow_power() > 0: trong fix_calm_tug(d, n).',
      veMaMau: 'Sửa dòng if flow_power() == 0: thành if flow_power() > 0: trong hàm fix_calm_tug(d, n).',
      san: [
        ['##V####', '#~~L~~#', '#=K~~=#', '#u~~~H#', '#~q~~~#', '#~~qB~#', '#######'],
        ['##V####', '#~~L~~#', '#=k~~=#', '#u~~~H#', '#~q~~~#', '#~~qB~#', '#######']
      ],
      dong: [
        [{ x: 3, y: 1, huong: 1, suc: 1 }],
        []
      ],
      noi: [
        [{ nut: { x: 2, y: 0 }, cong: [{ x: 2, y: 2 }], dong: [{ x: 3, y: 1 }] }],
        [{ nut: { x: 2, y: 0 }, cong: [{ x: 2, y: 2 }], dong: [] }]
      ],
      batDau: [{ x: 2, y: 1, huong: 1 }, { x: 2, y: 1, huong: 1 }],
      maMau: bai([
        'fix_calm_tug("R", 4)',
        'turn_left()',
        'bridge_lay(0)'
      ], { hamCuaEmMoi: [hFixCalmTug(T_FIX_CALM_TUG_SAI)] }),
      loiGiai: bai([
        'fix_calm_tug("R", 4)',
        'turn_left()',
        'bridge_lay(0)'
      ], { hamCuaEmMoi: [hFixCalmTug(T_FIX_CALM_TUG_DUNG)] }),
      sao: { o: 42, nhip: 23 },
      loiGiaiKhac: {
        moTa: 'Gọi calm_tug_run(d, n) trong thân hàm fix_calm_tug(d, n)',
        baiLam: bai([
          'fix_calm_tug("R", 4)',
          'turn_left()',
          'bridge_lay(0)'
        ]),
        hamCuaEmMoi: [hFixCalmTug(['calm_tug_run(d, n)'])]
      },
      loiSai: [
        { moTa: 'Để nguyên hàm mẫu có điều kiện ngược if flow_power() == 0: nên đâm vào cống K', baiLam: bai(['fix_calm_tug("R", 4)', 'turn_left()', 'bridge_lay(0)']), hamCuaEmMoi: [hFixCalmTug(T_FIX_CALM_TUG_SAI)], phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        cung('Xóa điều kiện if, luôn gọi flip_valve() theo sân 1 nên ở sân 2 làm đóng cống k', bai(['fix_calm_tug("R", 4)', 'turn_left()', 'bridge_lay(0)']), ['dam-tuong', 'chua-dua-vat'], { hamCuaEmMoi: [hFixCalmTug(['flip_valve()', 'tug_corner(d, n)', 'tether_drop()'])] })
      ],
      goiY: ['Luna: Chỉ cần đổi dấu == 0 thành > 0 ở dòng if đầu tiên của hàm fix_calm_tug(d, n).', 'Luna: Em cũng có thể gọi thẳng calm_tug_run(d, n) bên trong fix_calm_tug(d, n)!']
    }),

    manTrumSong({
      so: 5, ten: 'Chế hàm neo xuồng mở cống kéo bè anchor_gate_tow(t, n)', hang: 'luyen',
      hamCuaEmCan: KHO_TRUOC.concat(['river_span_pass', 'calm_tug_run']),
      taoHam: ['anchor_gate_tow'],
      deBai: 'Sola hướng dẫn chế hàm thứ 3 của chương Trùm: anchor_gate_tow(t, n) giúp neo xuồng chờ t nhịp rồi gạt van mở cống tiến sang phải 2 ô bằng anchor_flip(t), sau đó gọi ngay pull_back(n) kéo bè phía trước lùi n ô về bến! Hãy chế hàm anchor_gate_tow(t, n), rồi ở main đọc s = flow_power(), gọi turn_left() và anchor_gate_tow(2 - s, 1) để cứu cả 2 bè trên 2 sân!',
      veMaMau: 'Trong anchor_gate_tow(t, n), viết anchor_flip(t) và pull_back(n). Ở main đọc s = flow_power(), gọi turn_left() và anchor_gate_tow(2 - s, 1).',
      san: [
        ['#V======', '#~Kq~B~#', '#=u==H=#', '#B~~q~~#', '########'],
        ['#V======', '#~Kq~B~#', '#=u==H=#', '#B~~q~~#', '########']
      ],
      dong: [
        [{ x: 2, y: 1, huong: 3, suc: 1 }, { x: 1, y: 3, huong: 1, suc: 1 }, { x: 2, y: 3, huong: 1, suc: 1 }, { x: 3, y: 3, huong: 1, suc: 1 }, { x: 4, y: 3, huong: 1, suc: 1 }],
        [{ x: 2, y: 1, huong: 3, suc: 2 }, { x: 1, y: 3, huong: 1, suc: 2 }, { x: 3, y: 3, huong: 1, suc: 1 }, { x: 4, y: 3, huong: 1, suc: 1 }]
      ],
      noi: [
        [{ nut: { x: 1, y: 0 }, cong: [{ x: 2, y: 1 }], dong: [{ x: 2, y: 1 }, { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 3 }] }],
        [{ nut: { x: 1, y: 0 }, cong: [{ x: 2, y: 1 }], dong: [{ x: 2, y: 1 }, { x: 1, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 3 }] }]
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      maMau: bai(['s = flow_power()', 'turn_left()', 'anchor_gate_tow(2 - s, 1)']),
      loiGiai: bai(['s = flow_power()', 'turn_left()', 'anchor_gate_tow(2 - s, 1)'], { hamCuaEmMoi: [hAnchorGateTow()] }),
      sao: { o: 41, nhip: 19 },
      loiGiaiKhac: {
        moTa: 'Gọi bridge_lay(n) thay cho pull_back(n) trong thân hàm anchor_gate_tow(t, n)',
        baiLam: bai(['s = flow_power()', 'turn_left()', 'anchor_gate_tow(2 - s, 1)']),
        hamCuaEmMoi: [hAnchorGateTow(['anchor_flip(t)', 'bridge_lay(n)'])]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm anchor_gate_tow(t, n)', baiLam: bai(['s = flow_power()', 'turn_left()', 'anchor_gate_tow(2 - s, 1)']), phaiCoMa: ['ham-chua-co'] },
        cung('Truyền cố định anchor_gate_tow(1, 1) theo sân 1 nên ở sân 2 tắt dòng trễ làm bè dưới trôi lố', bai(['turn_left()', 'anchor_gate_tow(1, 1)']), ['chua-dua-vat'], { hamCuaEmMoi: [hAnchorGateTow()] }),
        { moTa: 'Quên gọi pull_back(n) trong anchor_gate_tow(t, n) nên bè trên ở (5, 1) chưa về bến', baiLam: bai(['s = flow_power()', 'turn_left()', 'anchor_gate_tow(2 - s, 1)']), hamCuaEmMoi: [hAnchorGateTow(['anchor_flip(t)'])], phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Hàm anchor_gate_tow(t, n) gồm 2 dòng: anchor_flip(t) và pull_back(n).', 'Luna: Ở main đọc s = flow_power(), gọi turn_left() rồi gọi anchor_gate_tow(2 - s, 1)!']
    }),

    manTrumSong({
      so: 6, ten: 'Kết hợp anchor_gate_tow và calm_tug_run cứu hai bè', hang: 'luyen',
      hamCuaEmCan: KHO_TRUOC.concat(['river_span_pass', 'calm_tug_run', 'anchor_gate_tow']),
      deBai: 'Sola thử thách phối hợp cả hai hàm mới trên 2 sân: từ (2, 1) hướng Bắc nhìn thẳng vào van V1 (2, 0) giữa dòng nước chảy về Tây, hãy gọi anchor_gate_tow(0, 1) và tow_drop() để neo xuồng mở cống (3, 1), tiến tới (4, 1) và kéo bè B từ (6, 1) về thả tại (4, 1) (xuồng lùi về (3, 1)). Tiếp theo gọi pair_step("R", 2) và pair_step("L", 1) sang (4, 3), rồi gọi calm_tug_run("R", 3) đưa lục bình L ở (5, 3) qua cống (4, 4) về bến (4, 5)!',
      veMaMau: 'Gọi anchor_gate_tow(0, 1), tow_drop(), pair_step("R", 2), pair_step("L", 1) rồi calm_tug_run("R", 3).',
      san: [
        ['##V#####', '#~~Kq~B#', '#==~V==#', '#=~~~L=#', '#=u=K=H#', '#===q==#', '#===~~~#', '########'],
        ['##V#####', '#~~Kq~B#', '#==~V==#', '#=~~~L=#', '#=u=k=H#', '#===q==#', '#===~~~#', '########']
      ],
      dong: [
        [{ x: 2, y: 1, huong: 3, suc: 1 }, { x: 5, y: 3, huong: 1, suc: 1 }],
        [{ x: 2, y: 1, huong: 3, suc: 1 }]
      ],
      noi: [
        [{ nut: { x: 2, y: 0 }, cong: [{ x: 3, y: 1 }], dong: [{ x: 2, y: 1 }] }, { nut: { x: 4, y: 2 }, cong: [{ x: 4, y: 4 }], dong: [{ x: 5, y: 3 }] }],
        [{ nut: { x: 2, y: 0 }, cong: [{ x: 3, y: 1 }], dong: [{ x: 2, y: 1 }] }, { nut: { x: 4, y: 2 }, cong: [{ x: 4, y: 4 }], dong: [] }]
      ],
      batDau: [{ x: 2, y: 1, huong: 0 }, { x: 2, y: 1, huong: 0 }],
      maMau: bai([
        'anchor_gate_tow(0, 1)',
        'tow_drop()',
        'pair_step("R", 2)'
      ]),
      loiGiai: bai([
        'anchor_gate_tow(0, 1)',
        'tow_drop()',
        'pair_step("R", 2)',
        'pair_step("L", 1)',
        'calm_tug_run("R", 3)'
      ]),
      sao: { o: 59, nhip: 43 },
      loiGiaiKhac: {
        moTa: 'Gọi tail_over_calm("R", 3) kèm tether_drop() thay cho calm_tug_run("R", 3)',
        baiLam: bai([
          'anchor_gate_tow(0, 1)',
          'tow_drop()',
          'pair_step("R", 2)',
          'pair_step("L", 1)',
          'tail_over_calm("R", 3)',
          'tether_drop()'
        ])
      },
      loiSai: [
        cung('Ở kênh dưới gọi flip_valve() và deliver_tail("R", 3) cố định theo sân 1 nên ở sân 2 làm đóng cống k (4, 4)', bai(['anchor_gate_tow(0, 1)', 'tow_drop()', 'pair_step("R", 2)', 'pair_step("L", 1)', 'flip_valve()', 'deliver_tail("R", 3)']), ['dam-tuong', 'chua-dua-vat']),
        { moTa: 'Quên gọi tow_drop() sau anchor_gate_tow(0, 1) nên khi rẽ xuống kênh dưới bị vướng bè B ở mũi', baiLam: bai(['anchor_gate_tow(0, 1)', 'pair_step("R", 2)', 'pair_step("L", 1)', 'calm_tug_run("R", 3)']), phaiCoMa: ['mui-vuong', 'dang-keo', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau anchor_gate_tow(0, 1), nhớ gọi tow_drop() để thả bè B tại (4, 1) trong khi xuồng đang ở (3, 1).', 'Luna: Từ (3, 1) gọi pair_step("R", 2), pair_step("L", 1) tới (4, 3) rồi gọi calm_tug_run("R", 3)!']
    }),

    manTrumSong({
      so: 7, ten: 'Chế hàm tổng lực cứu hộ bến sông master_river_dock(a, b, n)', hang: 'luyen',
      hamCuaEmCan: KHO_TRUOC.concat(['river_span_pass', 'calm_tug_run', 'anchor_gate_tow']),
      taoHam: ['master_river_dock'],
      deBai: 'Sola hướng dẫn chế hàm thứ 4 hoàn thiện kho lệnh mùa 5: master_river_dock(a, b, n) kết hợp river_span_pass(a, b) (mở cống khi có dòng chảy rồi tiến a + b ô) và bridge_lay(n) (kéo bè lùi n ô về bến rồi tháo dây)! Hãy chế hàm master_river_dock(a, b, n), rồi ở main đọc s = flow_power() và gọi master_river_dock(s, 2, 1) trên 2 sân!',
      veMaMau: 'Trong master_river_dock(a, b, n), viết river_span_pass(a, b) và bridge_lay(n). Ở main đọc s = flow_power() rồi gọi master_river_dock(s, 2, 1).',
      san: [
        ['#V=======', '#~kqB~~~#', '#=u===H=#', '#########'],
        ['#V=======', '#~K~~q~B#', '#=u===H=#', '#########']
      ],
      dong: [
        [],
        [{ x: 2, y: 1, huong: 3, suc: 2 }]
      ],
      noi: [
        [{ nut: { x: 1, y: 0 }, cong: [{ x: 2, y: 1 }], dong: [] }],
        [{ nut: { x: 1, y: 0 }, cong: [{ x: 2, y: 1 }], dong: [{ x: 2, y: 1 }] }]
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      maMau: bai(['s = flow_power()', 'master_river_dock(s, 2, 1)']),
      loiGiai: bai(['s = flow_power()', 'master_river_dock(s, 2, 1)'], { hamCuaEmMoi: [hMasterRiverDock()] }),
      sao: { o: 32, nhip: 13 },
      loiGiaiKhac: {
        moTa: 'Gọi clear_river_bridge(a + b, n) trong thân hàm master_river_dock(a, b, n)',
        baiLam: bai(['s = flow_power()', 'master_river_dock(s, 2, 1)']),
        hamCuaEmMoi: [hMasterRiverDock(['clear_river_bridge(a + b, n)'])]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm master_river_dock(a, b, n)', baiLam: bai(['s = flow_power()', 'master_river_dock(s, 2, 1)']), phaiCoMa: ['ham-chua-co'] },
        cung('Truyền cố định master_river_dock(0, 2, 1) theo sân 1 nên ở sân 2 dừng ở (3, 1), không vươn tới bè ở (7, 1)', bai(['master_river_dock(0, 2, 1)']), ['chua-dua-vat'], { hamCuaEmMoi: [hMasterRiverDock()] }),
        { moTa: 'Quên gọi bridge_lay(n) trong master_river_dock(a, b, n) nên chưa kéo bè về bến', baiLam: bai(['s = flow_power()', 'master_river_dock(s, 2, 1)']), hamCuaEmMoi: [hMasterRiverDock(['river_span_pass(a, b)'])], phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Hàm master_river_dock(a, b, n) gồm 2 dòng: river_span_pass(a, b) và bridge_lay(n).', 'Luna: Ở main chỉ cần đọc s = flow_power() rồi gọi master_river_dock(s, 2, 1)!']
    }),

    manTrumSong({
      so: 8, ten: 'Dùng master_river_dock dọn hai nhánh bến sông', hang: 'luyen',
      hamCuaEmCan: KHO_TRUOC.concat(['river_span_pass', 'calm_tug_run', 'anchor_gate_tow', 'master_river_dock']),
      deBai: 'Sola giao nhiệm vụ dọn cả 2 nhánh kênh bằng hàm master_river_dock(a, b, n): từ (1, 1) hướng Đông, hãy gọi master_river_dock(1, 1, 1) để vượt cống (2, 1) tới (3, 1) và kéo bè B1 ở (5, 1) về thả tại (3, 1) (xuồng lùi về (2, 1)). Tiếp theo gọi pair_step("R", 2) và pair_step("L", 1) sang (3, 3) hướng Đông, đọc s = flow_power() tại (4, 3) rồi gọi master_river_dock(s, 2, 1) kéo bè B2 về bến!',
      veMaMau: 'Gọi master_river_dock(1, 1, 1), pair_step("R", 2), pair_step("L", 1), đọc s = flow_power() rồi gọi master_river_dock(s, 2, 1).',
      san: [
        ['#V=========', '#~Kq~B~~~~#', '#=~V======#', '#=~~kqB~~~#', '#=u=====H=#', '###########'],
        ['#V=========', '#~kq~B~~~~#', '#=~V======#', '#=~~K~~q~B#', '#=u=====H=#', '###########']
      ],
      dong: [
        [{ x: 2, y: 1, huong: 3, suc: 1 }],
        [{ x: 4, y: 3, huong: 3, suc: 2 }]
      ],
      noi: [
        [{ nut: { x: 1, y: 0 }, cong: [{ x: 2, y: 1 }], dong: [{ x: 2, y: 1 }] }, { nut: { x: 3, y: 2 }, cong: [{ x: 4, y: 3 }], dong: [] }],
        [{ nut: { x: 1, y: 0 }, cong: [{ x: 2, y: 1 }], dong: [] }, { nut: { x: 3, y: 2 }, cong: [{ x: 4, y: 3 }], dong: [{ x: 4, y: 3 }] }]
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      maMau: bai([
        'master_river_dock(1, 1, 1)',
        'pair_step("R", 2)',
        'pair_step("L", 1)'
      ]),
      loiGiai: bai([
        'master_river_dock(1, 1, 1)',
        'pair_step("R", 2)',
        'pair_step("L", 1)',
        's = flow_power()',
        'master_river_dock(s, 2, 1)'
      ]),
      sao: { o: 43, nhip: 36 },
      loiGiaiKhac: {
        moTa: 'Gọi clear_river_bridge(2, 1) ở nhánh trên thay cho master_river_dock(1, 1, 1)',
        baiLam: bai([
          'clear_river_bridge(2, 1)',
          'pair_step("R", 2)',
          'pair_step("L", 1)',
          's = flow_power()',
          'master_river_dock(s, 2, 1)'
        ])
      },
      loiSai: [
        cung('Ở nhánh dưới truyền cố định master_river_dock(0, 2, 1) theo sân 1 nên ở sân 2 dừng ở (5, 3), không vươn tới B2 ở (9, 3)', bai(['master_river_dock(1, 1, 1)', 'pair_step("R", 2)', 'pair_step("L", 1)', 'master_river_dock(0, 2, 1)']), ['chua-dua-vat']),
        { moTa: 'Đọc s = flow_power() khi còn ở (2, 3) thay vì sau khi đã tiến tới (3, 3)', baiLam: bai(['master_river_dock(1, 1, 1)', 'pair_step("R", 2)', 's = flow_power()', 'pair_step("L", 1)', 'master_river_dock(s, 2, 1)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau master_river_dock(1, 1, 1), xuồng đang ở (2, 1); gọi pair_step("R", 2) và pair_step("L", 1) để tới (3, 3) hướng Đông.', 'Luna: Tại (3, 3) đọc s = flow_power() của ô (4, 3) rồi gọi master_river_dock(s, 2, 1)!']
    }),

    manTrumSong({
      so: 9, ten: 'Phối hợp master_river_dock và calm_tug_run toàn tuyến', hang: 'luyen',
      hamCuaEmCan: KHO_TRUOC.concat(['river_span_pass', 'calm_tug_run', 'anchor_gate_tow', 'master_river_dock']),
      deBai: 'Sola tổng duyệt trước trận Trùm cuối: từ (2, 1) hướng Đông, hãy gọi master_river_dock(1, 1, 1) để kiểm tra mở cống (3, 1), tiến tới (4, 1) và kéo bè B ở (6, 1) về thả tại (4, 1) (xuồng lùi về (3, 1)). Sau đó gọi pair_step("R", 2) và pair_step("L", 1) sang (4, 3), rồi gọi calm_tug_run("R", 3) đưa lục bình L ở (5, 3) qua cống (4, 4) về bến (4, 5)!',
      veMaMau: 'Gọi master_river_dock(1, 1, 1), pair_step("R", 2), pair_step("L", 1) rồi calm_tug_run("R", 3).',
      san: [
        ['##V#####', '#~~Kq~B#', '#==~V==#', '#=~~~L=#', '#=u=k=H#', '#===q==#', '#===~~~#', '########'],
        ['##V#####', '#~~kq~B#', '#==~V==#', '#=~~~L=#', '#=u=K=H#', '#===q==#', '#===~~~#', '########']
      ],
      dong: [
        [{ x: 3, y: 1, huong: 3, suc: 1 }],
        [{ x: 5, y: 3, huong: 1, suc: 1 }]
      ],
      noi: [
        [{ nut: { x: 2, y: 0 }, cong: [{ x: 3, y: 1 }], dong: [{ x: 3, y: 1 }] }, { nut: { x: 4, y: 2 }, cong: [{ x: 4, y: 4 }], dong: [] }],
        [{ nut: { x: 2, y: 0 }, cong: [{ x: 3, y: 1 }], dong: [] }, { nut: { x: 4, y: 2 }, cong: [{ x: 4, y: 4 }], dong: [{ x: 5, y: 3 }] }]
      ],
      batDau: [{ x: 2, y: 1, huong: 1 }, { x: 2, y: 1, huong: 1 }],
      maMau: bai([
        'master_river_dock(1, 1, 1)',
        'pair_step("R", 2)'
      ]),
      loiGiai: bai([
        'master_river_dock(1, 1, 1)',
        'pair_step("R", 2)',
        'pair_step("L", 1)',
        'calm_tug_run("R", 3)'
      ]),
      sao: { o: 53, nhip: 38 },
      loiGiaiKhac: {
        moTa: 'Gọi clear_river_bridge(2, 1) và tail_over_calm("R", 3) kèm tether_drop()',
        baiLam: bai([
          'clear_river_bridge(2, 1)',
          'pair_step("R", 2)',
          'pair_step("L", 1)',
          'tail_over_calm("R", 3)',
          'tether_drop()'
        ])
      },
      loiSai: [
        cung('Ở kênh trên gọi open_gate_pass(2) cố định theo sân 1 nên ở sân 2 làm đóng cống k (3, 1)', bai(['open_gate_pass(2)', 'bridge_lay(1)', 'pair_step("R", 2)', 'pair_step("L", 1)', 'calm_tug_run("R", 3)']), ['dam-tuong', 'chua-dua-vat']),
        cung('Ở kênh dưới gọi deliver_tail("R", 3) không mở cống theo sân 1 nên ở sân 2 đâm vào cống K (4, 4)', bai(['master_river_dock(1, 1, 1)', 'pair_step("R", 2)', 'pair_step("L", 1)', 'deliver_tail("R", 3)']), ['dam-tuong', 'chua-dua-vat'])
      ],
      goiY: ['Luna: Chỉ với 4 dòng lệnh: master_river_dock(1, 1, 1), pair_step("R", 2), pair_step("L", 1) và calm_tug_run("R", 3)!', 'Luna: Cả hai hàm đều tự kiểm tra flow_power() > 0 trước khi gạt van nên chạy mượt trên cả 2 sân.']
    }),

    manTrumSong({
      so: 10, ten: 'Trùm mùa bến sông: sứ mệnh thủy lợi toàn tuyến', hang: 'trum', huyHieu: 'trum-mua-song',
      hamCuaEmCan: KHO_TRUOC.concat(['river_span_pass', 'calm_tug_run', 'anchor_gate_tow', 'master_river_dock']),
      deBai: 'Trận Trùm cuối cùng khép lại Mùa 5 (Bến sông) trên 3 sân liên tiếp! Từ (2, 1) hướng Đông, hãy gọi master_river_dock(1, 1, 1) để cứu bè B ở kênh trên về bến (4, 1), sau đó gọi pair_step("R", 2) và pair_step("L", 1) sang (4, 3) hướng Đông. Tại (4, 3), sức nước s = flow_power() ở ô (5, 3) vừa cho biết có cần mở cống (4, 4) hay không, vừa cho biết bến q của lục bình L cách đó s + 3 ô về phía Nam (s = 1 ở sân 1, s = 2 ở sân 2, s = 0 ở sân 3). Hãy đọc s = flow_power() rồi gọi calm_tug_run("R", s + 3) để hoàn thành sứ mệnh và nhận Huy hiệu Trùm mùa Bến sông!',
      veMaMau: 'Gọi master_river_dock(1, 1, 1), sang (4, 3) đọc s = flow_power() rồi gọi calm_tug_run("R", s + 3).',
      san: [
        ['##V#####', '#~~Kq~B#', '#==~V==#', '#=~~~L=#', '#=u=K=H#', '#===~==#', '#===q==#', '#===~~~#', '#===~~~#', '########'],
        ['##V#####', '#~~kq~B#', '#==~V==#', '#=~~~L=#', '#=u=K=H#', '#===~==#', '#===~==#', '#===q==#', '#===~~~#', '########'],
        ['##V#####', '#~~Kq~B#', '#==~V==#', '#=~~~L=#', '#=u=k=H#', '#===q==#', '#===~~~#', '#===~~~#', '#===~~~#', '########']
      ],
      dong: [
        [{ x: 3, y: 1, huong: 3, suc: 1 }, { x: 5, y: 3, huong: 1, suc: 1 }],
        [{ x: 5, y: 3, huong: 1, suc: 2 }],
        [{ x: 3, y: 1, huong: 3, suc: 2 }]
      ],
      noi: [
        [{ nut: { x: 2, y: 0 }, cong: [{ x: 3, y: 1 }], dong: [{ x: 3, y: 1 }] }, { nut: { x: 4, y: 2 }, cong: [{ x: 4, y: 4 }], dong: [{ x: 5, y: 3 }] }],
        [{ nut: { x: 2, y: 0 }, cong: [{ x: 3, y: 1 }], dong: [] }, { nut: { x: 4, y: 2 }, cong: [{ x: 4, y: 4 }], dong: [{ x: 5, y: 3 }] }],
        [{ nut: { x: 2, y: 0 }, cong: [{ x: 3, y: 1 }], dong: [{ x: 3, y: 1 }] }, { nut: { x: 4, y: 2 }, cong: [{ x: 4, y: 4 }], dong: [] }]
      ],
      batDau: [{ x: 2, y: 1, huong: 1 }, { x: 2, y: 1, huong: 1 }, { x: 2, y: 1, huong: 1 }],
      maMau: bai([
        'master_river_dock(1, 1, 1)',
        'pair_step("R", 2)',
        'pair_step("L", 1)'
      ]),
      loiGiai: bai([
        'master_river_dock(1, 1, 1)',
        'pair_step("R", 2)',
        'pair_step("L", 1)',
        's = flow_power()',
        'calm_tug_run("R", s + 3)'
      ]),
      sao: { o: 54, nhip: 63 },
      loiGiaiKhac: {
        moTa: 'Gọi tail_over_calm("R", s + 3) kèm tether_drop() thay cho calm_tug_run("R", s + 3)',
        baiLam: bai([
          'master_river_dock(1, 1, 1)',
          'pair_step("R", 2)',
          'pair_step("L", 1)',
          's = flow_power()',
          'tail_over_calm("R", s + 3)',
          'tether_drop()'
        ])
      },
      loiSai: [
        cung('Truyền cố định calm_tug_run("R", 4) theo sân 1 nên ở sân 2 đi thiếu bước và ở sân 3 đi lố bến', bai(['master_river_dock(1, 1, 1)', 'pair_step("R", 2)', 'pair_step("L", 1)', 'calm_tug_run("R", 4)']), ['chua-dua-vat']),
        { moTa: 'Đọc s = flow_power() trước khi sang tới (4, 3) nên luôn đọc được s = 0', baiLam: bai(['master_river_dock(1, 1, 1)', 'pair_step("R", 2)', 's = flow_power()', 'pair_step("L", 1)', 'calm_tug_run("R", s + 3)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau khi sang tới (4, 3) hướng Đông, hãy đọc s = flow_power() của ô (5, 3) trước mặt.', 'Luna: Cuối cùng gọi calm_tug_run("R", s + 3) để đưa L về đúng bến q trên cả 3 sân!']
    })
  ];

  if (M) M.manTrumMuaSong = DS;
  if (typeof module !== 'undefined' && module.exports) module.exports = M;
})();
