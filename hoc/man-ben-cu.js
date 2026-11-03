/* ============================================================================
   man-ben-cu.js - Mua 5 (Ben song) · Goi 8: Ben song cu
   Chuong 1: ben-cu (10 man) - Don luong ben cu
   Chuong 2: che-ben-cu (10 man) - Che lenh: cuu ho ben cu
   ========================================================================== */
(function () {
  'use strict';

  var M = (typeof window !== 'undefined' && window.ManHoc) ||
    (typeof require === 'function' ? require('./man-chuoi-1.js') : null);

  var GOC_BEN_CU = [
    'left_move', 'right_move', 'left_back', 'right_back', 'wait',
    'cast_net', 'drop_net', 'flow_dir', 'anchor', 'unanchor',
    'set_length', 'flow'
  ];
  var ROBOT_BEN_CU = { than: 'xuong', tay: 'day-keo', camBien: [{ ma: 'dong-chay', o: 'tren' }] };
  var CAU_TRUC = ['for', 'if', 'while', 'list', 'def', 'return', 'tuple'];

  var KHO_TRUOC = [
    'move', 'turn_left', 'turn_right', 'u_turn', 'back', 'forward',
    'span_dist', 'round_steps', 'calm_bonus', 'turn_code', 'sail_to',
    'tow_grab', 'tow_drop', 'pull_back', 'pair_step', 'tow_pair',
    'is_calm_front', 'flow_step', 'scan_calm_side', 'tow_in_calm', 'pick_calm_lane',
    'flip_valve', 'open_gate_pass', 'shut_stream_tow', 'valve_and_back', 'lock_rescue',
    'drop_anchor', 'lift_anchor', 'anchor_wait', 'anchor_tow', 'hold_and_valve',
    'tether_grab', 'tether_drop', 'tow_to_tail', 'tug_corner', 'deliver_tail',
    'flow_power', 'calmer_power', 'faster_power', 'turn_to_calmer', 'best_branch'
  ];

  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function bai(chinh, phu) {
    var kq = { chinh: chinh.slice(), hamCuaMan: [], hamCuaEmMoi: [] };
    if (phu && phu.hamCuaMan) kq.hamCuaMan = phu.hamCuaMan;
    if (phu && phu.hamCuaEmMoi) kq.hamCuaEmMoi = phu.hamCuaEmMoi;
    return kq;
  }

  var T_CALM_GATE_PASS = [
    'p = flow_power()',
    'if p > 0:',
    '    flip_valve()',
    'forward(n)'
  ];
  var T_DOCK_TOW_BACK = [
    'forward(a)',
    'pull_back(b)'
  ];
  var T_RESCUE_OLD_DOCK = [
    'calm_gate_pass(a)',
    'pull_back(b)'
  ];
  var T_ANCHOR_FLIP = [
    'hold_and_valve(n)',
    'pair_step("R", 2)'
  ];
  var T_TAIL_OVER_CALM = [
    'p = flow_power()',
    'if p > 0:',
    '    flip_valve()',
    'tug_corner(d, n)'
  ];
  var T_FIX_OLD_DOCK_SAI = [
    'p = flow_power()',
    'if p == 0:',
    '    flip_valve()',
    'forward(a)',
    'pull_back(b)'
  ];
  var T_FIX_OLD_DOCK_DUNG = [
    'p = flow_power()',
    'if p > 0:',
    '    flip_valve()',
    'forward(a)',
    'pull_back(b)'
  ];

  function hCalmGatePass(than) { return H('calm_gate_pass', ['n'], than || T_CALM_GATE_PASS); }
  function hDockTowBack(than) { return H('dock_tow_back', ['a', 'b'], than || T_DOCK_TOW_BACK); }
  function hRescueOldDock(than) { return H('rescue_old_dock', ['a', 'b'], than || T_RESCUE_OLD_DOCK); }
  function hAnchorFlip(than) { return H('anchor_flip', ['n'], than || T_ANCHOR_FLIP); }
  function hTailOverCalm(than) { return H('tail_over_calm', ['d', 'n'], than || T_TAIL_OVER_CALM); }
  function hFixOldDock(than) { return H('fix_old_dock', ['a', 'b'], than || T_FIX_OLD_DOCK_DUNG); }

  function manBenCu(cfg) {
    return Object.assign({
      chuong: 'ben-cu', tenChuong: 'Dọn luồng bến cũ',
      loaiRobot: 'xuong',
      robot: ROBOT_BEN_CU,
      vo: 'song',
      hamGoc: GOC_BEN_CU.slice(),
      bienDem: true,
      cauTruc: CAU_TRUC,
      khung: { chinh: 10, moiHam: 10, cauTruc: CAU_TRUC },
      mucTieu: 'toi-co',
      hamCuaEmCan: KHO_TRUOC.slice(),
      taoHam: []
    }, cfg, { ma: 'ben-cu.' + cfg.so });
  }

  function manCheBenCu(cfg) {
    return Object.assign({
      chuong: 'che-ben-cu', tenChuong: 'Chế lệnh: cứu hộ bến cũ',
      loaiRobot: 'xuong',
      robot: ROBOT_BEN_CU,
      vo: 'song',
      hamGoc: GOC_BEN_CU.slice(),
      bienDem: true,
      cauTruc: CAU_TRUC,
      khung: { chinh: 10, moiHam: 10, cauTruc: CAU_TRUC },
      mucTieu: 'toi-co',
      hamCuaEmCan: KHO_TRUOC.slice(),
      taoHam: []
    }, cfg, { ma: 'che-ben-cu.' + cfg.so });
  }

  var DS = [
    /* ========================================================================
       CHUONG 1: ben-cu (10 man) - Don luong ben cu
       ======================================================================== */
    manBenCu({
      so: 1, ten: 'Làm mẫu dọn luồng bến sông cũ', hang: 'lam-quen',
      chiChay: true, chinhCoDinh: true, mucTieu: 'dua-vat',
      deBai: 'Sola đưa xuồng vào khu bến sông cũ: dọc hai bờ còn nguyên hàng rào =, hố cạn u và thùng nặng H từ các mùa trước. Hãy bấm Chạy để xem hàm lock_rescue(3) xoay trái gạt van V mở cống K, tiến qua cống rồi kéo bè B lùi về bến q!',
      veMaMau: 'Bấm Chạy để xem xuồng mở cống K và kéo bè B qua khu bờ rào cũ về bến q.',
      san: [
        '###V====',
        '#~~qK~B#',
        '#=u==H=#',
        '########'
      ],
      noi: [{ nut: { x: 3, y: 0 }, cong: [{ x: 4, y: 1 }], dong: [] }],
      batDau: { x: 3, y: 1, huong: 1 },
      maMau: bai(['lock_rescue(3)']),
      loiGiai: bai(['lock_rescue(3)']),
      sao: { o: 25, nhip: 8 },
      loiSai: [],
      goiY: ['Luna: Chỉ cần bấm Chạy để quan sát xuồng mở cống K và kéo bè gỗ B về bến q.']
    }),

    manBenCu({
      so: 2, ten: 'Neo xuồng gạt van trước kè đá cũ', hang: 'lam-quen', mucTieu: 'dua-vat',
      deBai: 'Sola nhắc: dải bờ rào = và hố u chắn sát mép kênh. Xuồng đang đứng ở (3, 1) hướng Bắc nhìn thẳng vào van V ở (3, 0), trên dòng chảy sang Tây. Hãy gọi hold_and_valve(0) (hoặc anchor_tow()) để neo xuồng gạt van V tắt dòng chảy kiêm mở cống K ở (4, 1), sau đó gọi pair_step("R", 1) tiến qua cống và pull_back(3) đưa bè B về bến q ở (3, 1)!',
      veMaMau: 'Gọi anchor_tow() để neo xuồng gạt van V, rồi gọi pair_step("R", 1) và pull_back(3).',
      san: [
        '###V====',
        '#~~qK~B#',
        '#=u==H=#',
        '########'
      ],
      dong: [{ x: 3, y: 1, huong: 3, suc: 1 }],
      noi: [{ nut: { x: 3, y: 0 }, cong: [{ x: 4, y: 1 }], dong: [{ x: 3, y: 1 }] }],
      batDau: { x: 3, y: 1, huong: 0 },
      maMau: bai(['anchor_tow()', 'pair_step("R", 1)']),
      loiGiai: bai(['anchor_tow()', 'pair_step("R", 1)', 'pull_back(3)']),
      sao: { o: 31, nhip: 9 },
      loiGiaiKhac: {
        moTa: 'Dùng turn_right() và move() thay cho pair_step("R", 1)',
        baiLam: bai(['anchor_tow()', 'turn_right()', 'move()', 'pull_back(3)'])
      },
      loiSai: [
        { moTa: 'Quên gạt van mở cống nên khi rẽ phải tiến vào (4, 1) bị cống đóng K chặn', baiLam: bai(['pair_step("R", 1)', 'pull_back(3)']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'Chỉ lùi 1 ô pull_back(1) nên bè B còn ở (5, 1), chưa về bến (3, 1)', baiLam: bai(['anchor_tow()', 'pair_step("R", 1)', 'pull_back(1)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Vì mũi xuồng đang hướng thẳng vào van V ở (3, 0), gọi anchor_tow() sẽ neo lại, tung lưới trúng van V tắt dòng và mở cống K, rồi thu neo.', 'Luna: Sau đó gọi pair_step("R", 1) sang (4, 1) và pull_back(3) để kéo bè B về bến (3, 1).']
    }),

    manBenCu({
      so: 3, ten: 'Lách đảo rào cũ bằng best_branch(n)', hang: 'lam-quen', nhipTheo: 'tong',
      deBai: 'Sola dẫn xuồng tới ngã ba (4, 2) trước đảo cạn có hàng rào = và thùng H cũ kỹ. Một nhánh bên có dòng xuôi sức 1 dẫn tới phao Q, nhánh kia chảy xiết sức 2. Hãy gọi move() tiến lên ngã ba (4, 2) rồi gọi best_branch(2) để rẽ vào nhánh êm hơn và cập phao Q!',
      veMaMau: 'Gọi move() tiến lên ngã ba (4, 2), rồi gọi best_branch(2).',
      san: [
        ['#########', '#=u===H=#', '#Q~~~~~~#', '####~####', '#########'],
        ['#########', '#=u===H=#', '#~~~~~~Q#', '####~####', '#########']
      ],
      dong: [
        [{ x: 3, y: 2, huong: 3, suc: 1 }, { x: 5, y: 2, huong: 1, suc: 2 }],
        [{ x: 3, y: 2, huong: 3, suc: 2 }, { x: 5, y: 2, huong: 1, suc: 1 }]
      ],
      batDau: [{ x: 4, y: 3, huong: 0 }, { x: 4, y: 3, huong: 0 }],
      maMau: bai(['move()']),
      loiGiai: bai(['move()', 'best_branch(2)']),
      sao: { o: 23, nhip: 11 },
      loiGiaiKhac: {
        moTa: 'Gọi turn_to_calmer() rồi forward(2) sau khi tiến lên ngã ba',
        baiLam: bai(['move()', 'turn_to_calmer()', 'forward(2)'])
      },
      loiSai: [
        { moTa: 'Cố định rẽ trái nên ở sân 2 lao vào dòng nước xiết sức 2', baiLam: bai(['move()', 'turn_left()', 'forward(2)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Gọi best_branch(2) ngay ở (4, 3) trước khi tiến lên ngã ba (4, 2)', baiLam: bai(['best_branch(2)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Luna: Tiến 1 ô bằng move() từ (4, 3) lên ngã ba (4, 2) trước bờ rào cũ.', 'Luna: Sau đó gọi best_branch(2) để xuồng tự chọn nhánh sức 1 và cập phao Q.']
    }),

    manBenCu({
      so: 4, ten: 'Lai dắt lục bình qua góc tường cửa cũ', hang: 'luyen', mucTieu: 'dua-vat',
      deBai: 'Sola chỉ vào góc tường có hố u, hàng rào = và thùng H từ xưởng cũ: đám lục bình L đang kẹt ở ngách (4, 1), còn bến nhận q nằm ở (2, 4) sau cống đóng K (2, 3). Từ (2, 1) hướng Đông, hãy gọi flip_valve() mở cống K bằng van V ở (2, 0), rồi gọi tug_corner("R", 4) để thu L về sát mũi, rẽ phải đi xuyên qua cống đưa L vào bến (2, 4)!',
      veMaMau: 'Gọi flip_valve() để mở cống rồi gọi tug_corner("R", 4).',
      san: [
        '##V###',
        '#~~~L#',
        '#=~~=#',
        '#uK~H#',
        '#~q~~#',
        '#~~~~#',
        '######'
      ],
      noi: [{ nut: { x: 2, y: 0 }, cong: [{ x: 2, y: 3 }], dong: [] }],
      batDau: { x: 2, y: 1, huong: 1 },
      maMau: bai(['flip_valve()']),
      loiGiai: bai(['flip_valve()', 'tug_corner("R", 4)']),
      sao: { o: 28, nhip: 10 },
      loiGiaiKhac: {
        moTa: 'Gọi deliver_tail("R", 4) để tháo lưới sau khi L vào bến q',
        baiLam: bai(['flip_valve()', 'deliver_tail("R", 4)'])
      },
      loiSai: [
        { moTa: 'Quên gọi flip_valve() nên cống K ở (2, 3) vẫn đóng chặn xuồng', baiLam: bai(['tug_corner("R", 4)']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'Chỉ đi 3 bước tug_corner("R", 3) nên L mới ở (2, 3), chưa tới bến (2, 4)', baiLam: bai(['flip_valve()', 'tug_corner("R", 3)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Gọi flip_valve() tại (2, 1) để gạt van V ở (2, 0), mở cống K ở (2, 3).', 'Luna: Sau đó gọi tug_corner("R", 4) để xuồng đi từ (2, 1) xuống (2, 5), kéo L theo sau vào đúng bến q ở (2, 4).']
    }),

    manBenCu({
      so: 5, ten: 'Bù sức nước dọc bờ kè cũ để mở cống', hang: 'luyen', nhipTheo: 'tong',
      deBai: 'Sola thử thách trên 2 sân: dọc bờ kè cũ có hàng rào = và thùng H, xuồng ở (1, 1) cần tiến tới (4, 1) để quay lên gạt van V ở (4, 0) mở cống K ở (5, 1) rồi vào phao Q ở (6, 1). Ô (2, 1) trước mũi có dòng xuôi sức 1 hoặc 2; hãy tách h, s = flow(), tính t = 3 - s, gọi forward(t) tới đúng (4, 1), rồi gọi open_gate_pass(2) vượt cống tới Q!',
      veMaMau: 'Đã có h, s = flow(), t = 3 - s và forward(t). Thêm open_gate_pass(2).',
      san: [
        ['####V####', '#~~~~KQ~#', '#=u===H=#', '#########'],
        ['####V####', '#~~~~KQ~#', '#=u===H=#', '#########']
      ],
      dong: [
        [{ x: 2, y: 1, huong: 1, suc: 1 }],
        [{ x: 2, y: 1, huong: 1, suc: 2 }]
      ],
      noi: [
        [{ nut: { x: 4, y: 0 }, cong: [{ x: 5, y: 1 }], dong: [] }],
        [{ nut: { x: 4, y: 0 }, cong: [{ x: 5, y: 1 }], dong: [] }]
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      maMau: bai(['h, s = flow()', 't = 3 - s', 'forward(t)']),
      loiGiai: bai(['h, s = flow()', 't = 3 - s', 'forward(t)', 'open_gate_pass(2)']),
      sao: { o: 19, nhip: 13 },
      loiGiaiKhac: {
        moTa: 'Dùng flow_power() thay vì tách h, s = flow()',
        baiLam: bai(['p = flow_power()', 't = 3 - p', 'forward(t)', 'open_gate_pass(2)'])
      },
      loiSai: [
        { moTa: 'Chỉ tiến 1 bước forward(1) nên ở sân 1 chưa tới dưới van V đã gạt dây hụt', baiLam: bai(['forward(1)', 'open_gate_pass(2)']), phaiCoMa: ['keo-hut', 'dam-tuong', 'chua-toi-co'] },
        { moTa: 'Chưa gọi open_gate_pass(2) sau khi tới dưới van V ở (4, 1)', baiLam: bai(['h, s = flow()', 't = 3 - s', 'forward(t)']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Luna: Từ (1, 1) tới (4, 1) là 3 ô, có dòng xuôi sức s ở (2, 1) nên chỉ cần tính t = 3 - s rồi gọi forward(t).', 'Luna: Tại (4, 1), gọi open_gate_pass(2) để gạt van V ở (4, 0) và đi 2 ô tới Q ở (6, 1).']
    }),

    manBenCu({
      so: 6, ten: 'Chọn nhánh êm rồi mở cống bến cũ', hang: 'luyen', nhipTheo: 'tong',
      deBai: 'Sola dẫn xuồng tới ngã ba (4, 1) giữa hai nhánh bờ rào = và hố u: một nhánh có dòng sức 1, nhánh kia chảy xiết sức 2; ở cuối nhánh êm có van V điều khiển cống đóng K trước phao Q. Hãy gọi turn_left(), đọc p = flow_power() rồi kiểm tra if p == 1: để đi nhánh trái (move(), tow_grab(), pair_step("L", 2)), ngược lại quay đầu u_turn() đi nhánh phải (move(), tow_grab(), pair_step("R", 2))!',
      veMaMau: 'Quay trái, đọc p = flow_power(), kiểm tra if p == 1: để chọn nhánh êm, gạt van V và rẽ xuống Q.',
      san: [
        ['#########', '#V~~~~~V#', '#~K~~~K~#', '#~Q#=uH~#', '#########'],
        ['#########', '#V~~~~~V#', '#~K~~~K~#', '#~H#=uQ~#', '#########']
      ],
      dong: [
        [{ x: 3, y: 1, huong: 3, suc: 1 }, { x: 5, y: 1, huong: 1, suc: 2 }],
        [{ x: 3, y: 1, huong: 3, suc: 2 }, { x: 5, y: 1, huong: 1, suc: 1 }]
      ],
      noi: [
        [{ nut: { x: 1, y: 1 }, cong: [{ x: 2, y: 2 }], dong: [] }, { nut: { x: 7, y: 1 }, cong: [{ x: 6, y: 2 }], dong: [] }],
        [{ nut: { x: 1, y: 1 }, cong: [{ x: 2, y: 2 }], dong: [] }, { nut: { x: 7, y: 1 }, cong: [{ x: 6, y: 2 }], dong: [] }]
      ],
      batDau: [{ x: 4, y: 1, huong: 0 }, { x: 4, y: 1, huong: 0 }],
      maMau: bai(['turn_left()', 'p = flow_power()', 'if p == 1:', '    move()', '    tow_grab()']),
      loiGiai: bai([
        'turn_left()',
        'p = flow_power()',
        'if p == 1:',
        '    move()',
        '    tow_grab()',
        '    pair_step("L", 2)',
        'else:',
        '    u_turn()',
        '    move()',
        '    tow_grab()',
        '    pair_step("R", 2)'
      ]),
      sao: { o: 32, nhip: 13 },
      loiGiaiKhac: {
        moTa: 'Kiểm tra sức nước nhánh phải trước thay vì nhánh trái',
        baiLam: bai([
          'turn_right()',
          'p = flow_power()',
          'if p == 1:',
          '    move()',
          '    tow_grab()',
          '    pair_step("R", 2)',
          'else:',
          '    u_turn()',
          '    move()',
          '    tow_grab()',
          '    pair_step("L", 2)'
        ])
      },
      loiSai: [
        { moTa: 'Luôn rẽ phải nên ở sân 1 đi nhầm sang nhánh cống không dẫn tới phao Q', baiLam: bai(['turn_right()', 'move()', 'tow_grab()', 'pair_step("R", 2)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Quên gọi tow_grab() mở cống K nên xuồng bị cống chặn trước phao Q', baiLam: bai(['turn_left()', 'p = flow_power()', 'if p == 1:', '    move()', '    pair_step("L", 2)', 'else:', '    u_turn()', '    move()', '    pair_step("R", 2)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Luna: Quay trái bằng turn_left(), đọc p = flow_power() rồi kiểm tra if p == 1: để biết nhánh trái có phải nhánh êm không.', 'Luna: Ở nhánh trái gọi move(), tow_grab(), pair_step("L", 2); ở nhánh phải gọi u_turn(), move(), tow_grab(), pair_step("R", 2).']
    }),

    manBenCu({
      so: 7, ten: 'Neo xuồng chờ bè trôi qua bờ tường cũ', hang: 'bien-the', mucTieu: 'dua-vat', nhipTheo: 'tong',
      deBai: 'Sola chỉ ra khe nước hẹp giữa hai bờ rào =, hố u và thùng H cũ: xuồng ở (2, 1) hướng Đông trên dòng chảy Nam sức 1, còn bè B ở (6, 1) đang trôi về Tây với sức nước s (1 hoặc 2) giống như ô (3, 1) trước mũi xuồng. Hãy đọc s = flow_power(), gọi drop_anchor(), nếu s == 1 thì gọi wait() thêm 1 nhịp cho B tới (4, 1), sau đó gọi tow_to_tail(), lift_anchor() và pair_step("R", 2) đưa B vào bến (2, 3)!',
      veMaMau: 'Đọc s = flow_power(), gọi drop_anchor(), nếu s == 1: wait(), rồi tow_to_tail(), lift_anchor() và pair_step("R", 2).',
      san: [
        ['#########', '#~~~~~B~#', '#=~=~===#', '##q#u#H##', '##~######', '#########'],
        ['#########', '#~~~~~B~#', '#=~=~===#', '##q#u#H##', '##~######', '#########']
      ],
      dong: [
        [{ x: 2, y: 1, huong: 2, suc: 1 }, { x: 3, y: 1, huong: 3, suc: 1 }, { x: 5, y: 1, huong: 3, suc: 1 }, { x: 6, y: 1, huong: 3, suc: 1 }, { x: 4, y: 1, huong: 2, suc: 1 }],
        [{ x: 2, y: 1, huong: 2, suc: 1 }, { x: 3, y: 1, huong: 3, suc: 2 }, { x: 6, y: 1, huong: 3, suc: 2 }, { x: 4, y: 1, huong: 2, suc: 1 }]
      ],
      batDau: [{ x: 2, y: 1, huong: 1 }, { x: 2, y: 1, huong: 1 }],
      maMau: bai(['s = flow_power()', 'drop_anchor()', 'if s == 1:', '    wait()']),
      loiGiai: bai([
        's = flow_power()',
        'drop_anchor()',
        'if s == 1:',
        '    wait()',
        'tow_to_tail()',
        'lift_anchor()',
        'pair_step("R", 2)'
      ]),
      sao: { o: 32, nhip: 15 },
      loiGiaiKhac: {
        moTa: 'Tách h, s = flow() thay vì gọi flow_power()',
        baiLam: bai([
          'h, s = flow()',
          'drop_anchor()',
          'if s == 1:',
          '    wait()',
          'tow_to_tail()',
          'lift_anchor()',
          'pair_step("R", 2)'
        ])
      },
      loiSai: [
        { moTa: 'Không chờ thêm 1 nhịp khi s == 1 nên ở sân 1 bè B còn ở (5, 1) ngoài tầm lưới', baiLam: bai(['drop_anchor()', 'tow_to_tail()', 'lift_anchor()', 'pair_step("R", 2)']), phaiCoMa: ['keo-hut', 'chua-dua-vat'] },
        { moTa: 'Luôn gọi wait() trên cả hai sân nên ở sân 2 bè B trôi tới (4, 1) rồi tụt xuống ngách (4, 2)', baiLam: bai(['drop_anchor()', 'wait()', 'tow_to_tail()', 'lift_anchor()', 'pair_step("R", 2)']), phaiCoMa: ['keo-hut', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Ở sân 1 (s == 1), bè B ở (6, 1) cần 2 nhịp trôi về (4, 1) trong tầm lưới của xuồng ở (2, 1).', 'Luna: Ở sân 2 (s == 2), chỉ sau nhịp drop_anchor() bè B đã trôi 2 ô về (4, 1) nên gọi tow_to_tail() ngay!']
    }),

    manBenCu({
      so: 8, ten: 'Mở cống rồi lai dắt bè qua kênh biến thiên', hang: 'bien-the', mucTieu: 'dua-vat', nhipTheo: 'tong',
      deBai: 'Sola giao nhiệm vụ tại kênh đá cổ có cửa C và rào = trên bờ: từ (2, 1) hướng Đông, hãy gọi open_gate_pass(1) để gạt van V ở (2, 0) mở cống K ở (3, 1) và tiến vào (3, 1), rồi gọi tug_corner("R", 1) để thu đám lục bình L ở (5, 1) ra đuôi và rẽ xuống (3, 2) hướng Nam. Ô (3, 3) trước mũi có dòng xuôi sức 1 hoặc 2; hãy đọc p = flow_power(), tính t = 4 - p rồi gọi forward(t) để đưa L vào bến q ở (3, 5)!',
      veMaMau: 'Gọi open_gate_pass(1), tug_corner("R", 1), rồi p = flow_power(), t = 4 - p, forward(t).',
      san: [
        ['##V####', '#~~K~L#', '#=C~H=#', '###~###', '###~###', '###q###', '###~###', '#######'],
        ['##V####', '#~~K~L#', '#=C~H=#', '###~###', '###~###', '###q###', '###~###', '#######']
      ],
      dong: [
        [{ x: 3, y: 3, huong: 2, suc: 1 }],
        [{ x: 3, y: 3, huong: 2, suc: 2 }]
      ],
      noi: [
        [{ nut: { x: 2, y: 0 }, cong: [{ x: 3, y: 1 }], dong: [] }],
        [{ nut: { x: 2, y: 0 }, cong: [{ x: 3, y: 1 }], dong: [] }]
      ],
      batDau: [{ x: 2, y: 1, huong: 1 }, { x: 2, y: 1, huong: 1 }],
      maMau: bai(['open_gate_pass(1)', 'tug_corner("R", 1)']),
      loiGiai: bai(['open_gate_pass(1)', 'tug_corner("R", 1)', 'p = flow_power()', 't = 4 - p', 'forward(t)']),
      sao: { o: 33, nhip: 21 },
      loiGiaiKhac: {
        moTa: 'Tách h, s = flow() thay cho p = flow_power() ở nhánh dọc',
        baiLam: bai(['open_gate_pass(1)', 'tug_corner("R", 1)', 'h, s = flow()', 't = 4 - s', 'forward(t)'])
      },
      loiSai: [
        { moTa: 'Đếm cứng forward(2) ở nhánh dọc nên ở sân 1 lục bình L chưa tới bến q', baiLam: bai(['open_gate_pass(1)', 'tug_corner("R", 1)', 'forward(2)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên gọi open_gate_pass(1) nên cống K chặn không cho xuồng qua', baiLam: bai(['tug_corner("R", 1)', 'p = flow_power()', 't = 4 - p', 'forward(t)']), phaiCoMa: ['keo-hut', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau open_gate_pass(1), xuồng đứng ở (3, 1) hướng Đông, cách L ở (5, 1) đúng 2 ô trong tầm dây.', 'Luna: Gọi tug_corner("R", 1) để chuyển L ra đuôi và xuống (3, 2), rồi đọc p = flow_power(), t = 4 - p và gọi forward(t).']
    }),

    manBenCu({
      so: 9, ten: 'Đo dòng chảy trước cống cũ để quyết định gạt van', hang: 'bien-the', mucTieu: 'dua-vat', nhipTheo: 'tong',
      deBai: 'Sola chỉ vào cống nước ở (4, 1) giữa khu bến cũ: ở sân 1 ô (3, 1) có dòng chảy ngược sức 2 và cống K đang đóng; ở sân 2 nước phẳng lặng (sức 0) và cống k đã mở sẵn! Nếu gạt van V ở (2, 0) vào ngày cống đã mở thì cống sẽ đóng sập lại. Hãy đọc p = flow_power(), kiểm tra if p > 0: để chỉ gọi flip_valve() khi có dòng chảy, sau đó gọi forward(2) và pull_back(3) kéo bè B về bến q ở (3, 1)!',
      veMaMau: 'Đã có p = flow_power() và if p > 0: flip_valve(). Thêm forward(2) và pull_back(3).',
      san: [
        ['##V=====', '#~~qK~B#', '#=u==H=#', '########'],
        ['##V=====', '#~~qk~B#', '#=u==H=#', '########']
      ],
      dong: [
        [{ x: 3, y: 1, huong: 3, suc: 2 }],
        []
      ],
      noi: [
        [{ nut: { x: 2, y: 0 }, cong: [{ x: 4, y: 1 }], dong: [{ x: 3, y: 1 }] }],
        [{ nut: { x: 2, y: 0 }, cong: [{ x: 4, y: 1 }], dong: [] }]
      ],
      batDau: [{ x: 2, y: 1, huong: 1 }, { x: 2, y: 1, huong: 1 }],
      maMau: bai(['p = flow_power()', 'if p > 0:', '    flip_valve()']),
      loiGiai: bai([
        'p = flow_power()',
        'if p > 0:',
        '    flip_valve()',
        'forward(2)',
        'pull_back(3)'
      ]),
      sao: { o: 26, nhip: 15 },
      loiGiaiKhac: {
        moTa: 'Dùng điều kiện if not is_calm_front(): flip_valve()',
        baiLam: bai([
          'if not is_calm_front():',
          '    flip_valve()',
          'forward(2)',
          'pull_back(3)'
        ])
      },
      loiSai: [
        { moTa: 'Luôn gọi flip_valve() không kiểm tra dòng nên ở sân 2 làm đóng cống k', baiLam: bai(['flip_valve()', 'forward(2)', 'pull_back(3)']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'Không gạt van ở sân 1 nên bị dòng ngược sức 2 đẩy lùi và cống K vẫn đóng', baiLam: bai(['forward(2)', 'pull_back(3)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Ô (3, 1) nằm ngay trước mũi xuồng nên flow_power() trả về 2 ở sân 1 và 0 ở sân 2.', 'Luna: Sau khối if p > 0: flip_valve(), gọi forward(2) tới (4, 1) rồi pull_back(3) đưa bè B về (3, 1).']
    }),

    manBenCu({
      so: 10, ten: 'Trùm: Dọn luồng bến sông cũ liên hoàn', hang: 'trum', mucTieu: 'dua-vat', nhipTheo: 'tong',
      huyHieu: { ma: 'ben-cu', ten: 'Huy hiệu Dọn luồng bến cũ' },
      deBai: 'Sola giao bài kiểm tra Trùm chương 1 tại khu bến sông cũ: từ (4, 5) hướng Bắc với bè B ở (4, 6) sau đuôi, hãy gọi cast_net("back") và tether_grab() để bắt B ở sát đuôi. Kênh dọc có dòng xuôi ở (4, 4) mạnh 1 hoặc 2 đưa xuồng lên ngã ba (4, 1) nơi hai bên có rào cũ =, hố u và thùng H. Hãy đọc p = flow_power(), tính t = 4 - p, gọi forward(t) để lên đúng ngã ba (4, 1), gọi turn_to_calmer() chọn nhánh êm hơn (sức 1 ở sân 1, sức 0 ở sân 2), rồi đọc lại p, tính t = 3 - p và gọi forward(t) kéo B vào bến q!',
      veMaMau: 'Đã có chặng đầu (p = flow_power(), t = 4 - p, forward(t)). Thêm turn_to_calmer(), rồi đọc lại p, t = 3 - p, forward(t).',
      san: [
        ['#########', '#~q~~~~~#', '#=u=~=H=#', '####~####', '####~####', '####~####', '####B####', '#########'],
        ['#########', '#~~~~~q~#', '#=u=~=H=#', '####~####', '####~####', '####~####', '####B####', '#########']
      ],
      dong: [
        [{ x: 4, y: 4, huong: 0, suc: 1 }, { x: 3, y: 1, huong: 3, suc: 1 }, { x: 5, y: 1, huong: 1, suc: 2 }],
        [{ x: 4, y: 4, huong: 0, suc: 2 }, { x: 3, y: 1, huong: 3, suc: 1 }]
      ],
      batDau: [{ x: 4, y: 5, huong: 0 }, { x: 4, y: 5, huong: 0 }],
      maMau: bai(['cast_net("back")', 'tether_grab()', 'p = flow_power()', 't = 4 - p', 'forward(t)']),
      loiGiai: bai([
        'cast_net("back")',
        'tether_grab()',
        'p = flow_power()',
        't = 4 - p',
        'forward(t)',
        'turn_to_calmer()',
        'p = flow_power()',
        't = 3 - p',
        'forward(t)'
      ]),
      sao: { o: 27, nhip: 17 },
      loiGiaiKhac: {
        moTa: 'Lưu sức nước vào biến s1 và s2 ở từng chặng trước khi gọi forward',
        baiLam: bai([
          'cast_net("back")',
          'tether_grab()',
          's1 = flow_power()',
          't = 4 - s1',
          'forward(t)',
          'turn_to_calmer()',
          's2 = flow_power()',
          't = 3 - s2',
          'forward(t)'
        ])
      },
      loiSai: [
        { moTa: 'Chỉ tiến 2 bước forward(2) ở chặng dọc nên ở sân 1 chưa lên tới ngã ba đã rẽ đâm vào rào cũ', baiLam: bai(['cast_net("back")', 'tether_grab()', 'forward(2)', 'turn_to_calmer()', 'p = flow_power()', 't = 3 - p', 'forward(t)']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'Dùng best_branch(2) cố định ở ngã ba nên ở sân 2 nhánh sức 0 đi thiếu 1 ô', baiLam: bai(['cast_net("back")', 'tether_grab()', 'p = flow_power()', 't = 4 - p', 'forward(t)', 'best_branch(2)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Gọi cast_net("back") và tether_grab() để bắt bè B ở sát đuôi (4, 6), rồi p = flow_power(), t = 4 - p, forward(t) lên ngã ba (4, 1).', 'Luna: Tại ngã ba (4, 1), gọi turn_to_calmer() rồi p = flow_power(), t = 3 - p, forward(t) để đưa bè B vào đúng bến q.']
    }),

    /* ========================================================================
       CHUONG 2: che-ben-cu (10 man) - Che lenh: cuu ho ben cu
       ======================================================================== */
    manCheBenCu({
      so: 1, ten: 'Chế hàm mở cống thông minh calm_gate_pass(n)', hang: 'lam-quen', nhipTheo: 'tong',
      taoHam: ['calm_gate_pass'],
      deBai: 'Sola hướng dẫn: ở khu bến sông cũ, có ngày trạm cống K đóng kèm dòng chảy ngược ở ô trước mũi, có ngày cống k đã mở sẵn và nước phẳng lặng. Hãy chế hàm calm_gate_pass(n): đọc p = flow_power(), if p > 0: flip_valve(), rồi gọi forward(n) để vượt qua trạm cống tới phao Q!',
      veMaMau: 'Trong hàm calm_gate_pass(n), viết p = flow_power(), if p > 0: flip_valve() rồi forward(n).',
      san: [
        ['##V=====', '#~~~K~Q#', '#=u==H=#', '########'],
        ['##V=====', '#~~~k~Q#', '#=u==H=#', '########']
      ],
      dong: [
        [{ x: 3, y: 1, huong: 3, suc: 2 }],
        []
      ],
      noi: [
        [{ nut: { x: 2, y: 0 }, cong: [{ x: 4, y: 1 }], dong: [{ x: 3, y: 1 }] }],
        [{ nut: { x: 2, y: 0 }, cong: [{ x: 4, y: 1 }], dong: [] }]
      ],
      batDau: [{ x: 2, y: 1, huong: 1 }, { x: 2, y: 1, huong: 1 }],
      maMau: bai(['calm_gate_pass(4)']),
      loiGiai: bai(['calm_gate_pass(4)'], { hamCuaEmMoi: [hCalmGatePass()] }),
      sao: { o: 20, nhip: 11 },
      loiGiaiKhac: {
        moTa: 'Dùng điều kiện if not is_calm_front(): flip_valve() trong calm_gate_pass(n)',
        baiLam: bai(['calm_gate_pass(4)']),
        hamCuaEmMoi: [hCalmGatePass(['if not is_calm_front():', '    flip_valve()', 'forward(n)'])]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm calm_gate_pass(n)', baiLam: bai(['calm_gate_pass(4)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Luôn gọi flip_valve() không kiểm tra flow_power() nên ở sân 2 làm đóng cống k', baiLam: bai(['calm_gate_pass(4)']), hamCuaEmMoi: [hCalmGatePass(['flip_valve()', 'forward(n)'])], phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Luna: Trong calm_gate_pass(n), đọc p = flow_power(), kiểm tra if p > 0: flip_valve() rồi gọi forward(n).', 'Luna: Chương trình chính đã gọi sẵn calm_gate_pass(4).']
    }),

    manCheBenCu({
      so: 2, ten: 'Chế hàm tiến vào kéo lùi dock_tow_back(a, b)', hang: 'lam-quen', mucTieu: 'dua-vat',
      hamCuaEmCan: KHO_TRUOC.concat(['calm_gate_pass']),
      taoHam: ['dock_tow_back'],
      deBai: 'Sola hướng dẫn: ở các hốc bến cũ chật hẹp có tường # và rào =, xuồng phải tiến a ô vào áp sát vật nổi rồi kéo lùi b ô về bến q. Hãy chế hàm dock_tow_back(a, b) gồm 2 dòng: forward(a) và pull_back(b), rồi gọi dock_tow_back(2, 3) để đưa bè B về bến q ở (3, 1)!',
      veMaMau: 'Trong hàm dock_tow_back(a, b), viết forward(a) và pull_back(b).',
      san: [
        '########',
        '#~~q~~B#',
        '#=u==H=#',
        '########'
      ],
      batDau: { x: 2, y: 1, huong: 1 },
      maMau: bai(['dock_tow_back(2, 3)']),
      loiGiai: bai(['dock_tow_back(2, 3)'], { hamCuaEmMoi: [hDockTowBack()] }),
      sao: { o: 16, nhip: 6 },
      loiGiaiKhac: {
        moTa: 'Viết tách tow_grab() và vòng lặp back() trong dock_tow_back(a, b)',
        baiLam: bai(['dock_tow_back(2, 3)']),
        hamCuaEmMoi: [hDockTowBack(['forward(a)', 'tow_grab()', 'for i in range(b):', '    back()'])]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm dock_tow_back(a, b)', baiLam: bai(['dock_tow_back(2, 3)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Truyền nhầm pull_back(a) thay vì pull_back(b) nên kéo bè lùi thiếu 1 ô', baiLam: bai(['dock_tow_back(2, 3)']), hamCuaEmMoi: [hDockTowBack(['forward(a)', 'pull_back(a)'])], phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Hàm dock_tow_back(a, b) chỉ gồm 2 dòng: forward(a) và pull_back(b).', 'Luna: Khi xuồng tiến 2 ô tới (4, 1) rồi kéo lùi 3 ô về (1, 1), bè B sẽ dừng đúng tại bến q ở (3, 1).']
    }),

    manCheBenCu({
      so: 3, ten: 'Chế hàm mở cống cứu hộ bến cũ rescue_old_dock(a, b)', hang: 'co-ban', mucTieu: 'dua-vat', nhipTheo: 'tong',
      hamCuaEmCan: KHO_TRUOC.concat(['calm_gate_pass', 'dock_tow_back']),
      taoHam: ['rescue_old_dock'],
      deBai: 'Sola hướng dẫn: hãy ghép calm_gate_pass(a) và pull_back(b) thành hàm rescue_old_dock(a, b) để xuồng tự kiểm tra dòng chảy mở cống, tiến a ô qua cống rồi kéo vật nổi lùi b ô về bến q! Gọi rescue_old_dock(2, 3) để cứu hộ bè B qua 2 sân!',
      veMaMau: 'Trong hàm rescue_old_dock(a, b), viết calm_gate_pass(a) và pull_back(b).',
      san: [
        ['##V=====', '#~~qK~B#', '#=u==H=#', '########'],
        ['##V=====', '#~~qk~B#', '#=u==H=#', '########']
      ],
      dong: [
        [{ x: 3, y: 1, huong: 3, suc: 2 }],
        []
      ],
      noi: [
        [{ nut: { x: 2, y: 0 }, cong: [{ x: 4, y: 1 }], dong: [{ x: 3, y: 1 }] }],
        [{ nut: { x: 2, y: 0 }, cong: [{ x: 4, y: 1 }], dong: [] }]
      ],
      batDau: [{ x: 2, y: 1, huong: 1 }, { x: 2, y: 1, huong: 1 }],
      maMau: bai(['rescue_old_dock(2, 3)']),
      loiGiai: bai(['rescue_old_dock(2, 3)'], { hamCuaEmMoi: [hRescueOldDock()] }),
      sao: { o: 28, nhip: 15 },
      loiGiaiKhac: {
        moTa: 'Đọc p = flow_power(), if p > 0: flip_valve() rồi gọi dock_tow_back(a, b)',
        baiLam: bai(['rescue_old_dock(2, 3)']),
        hamCuaEmMoi: [hRescueOldDock(['p = flow_power()', 'if p > 0:', '    flip_valve()', 'dock_tow_back(a, b)'])]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm rescue_old_dock(a, b)', baiLam: bai(['rescue_old_dock(2, 3)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên gọi pull_back(b) trong rescue_old_dock(a, b) nên chỉ tiến tới bè mà chưa kéo về', baiLam: bai(['rescue_old_dock(2, 3)']), hamCuaEmMoi: [hRescueOldDock(['calm_gate_pass(a)'])], phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Trong rescue_old_dock(a, b), dòng 1 là calm_gate_pass(a) và dòng 2 là pull_back(b).', 'Luna: Chương trình chính đã có sẵn rescue_old_dock(2, 3).']
    }),

    manCheBenCu({
      so: 4, ten: 'Chế hàm neo chờ gạt van rồi rẽ anchor_flip(n)', hang: 'co-ban',
      hamCuaEmCan: KHO_TRUOC.concat(['calm_gate_pass', 'dock_tow_back', 'rescue_old_dock']),
      taoHam: ['anchor_flip'],
      deBai: 'Sola hướng dẫn: khi xuồng đứng trên dòng chảy hướng thẳng vào van V, ta dùng hold_and_valve(n) để neo xuồng chờ n nhịp rồi gạt van, sau đó gọi pair_step("R", 2) để rẽ phải vượt qua cống! Hãy đóng gói 2 dòng đó thành hàm anchor_flip(n) và gọi anchor_flip(0) hai lần để vượt 2 trạm cống cũ tới Q!',
      veMaMau: 'Trong hàm anchor_flip(n), viết hold_and_valve(n) và pair_step("R", 2).',
      san: [
        '#V#V====',
        '#~K~KQ~#',
        '#=u==H=#',
        '########'
      ],
      dong: [{ x: 1, y: 1, huong: 3, suc: 1 }],
      noi: [
        { nut: { x: 1, y: 0 }, cong: [{ x: 2, y: 1 }], dong: [{ x: 1, y: 1 }] },
        { nut: { x: 3, y: 0 }, cong: [{ x: 4, y: 1 }], dong: [] }
      ],
      batDau: { x: 1, y: 1, huong: 0 },
      maMau: bai(['anchor_flip(0)', 'turn_left()', 'anchor_flip(0)']),
      loiGiai: bai(['anchor_flip(0)', 'turn_left()', 'anchor_flip(0)'], { hamCuaEmMoi: [hAnchorFlip()] }),
      sao: { o: 31, nhip: 13 },
      loiGiaiKhac: {
        moTa: 'Dùng turn_right() và forward(2) sau hold_and_valve(n) trong anchor_flip(n)',
        baiLam: bai(['anchor_flip(0)', 'turn_left()', 'anchor_flip(0)']),
        hamCuaEmMoi: [hAnchorFlip(['hold_and_valve(n)', 'turn_right()', 'forward(2)'])]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm anchor_flip(n)', baiLam: bai(['anchor_flip(0)', 'turn_left()', 'anchor_flip(0)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên gọi pair_step("R", 2) trong anchor_flip(n) nên xuồng đứng yên sau khi mở cống', baiLam: bai(['anchor_flip(0)', 'turn_left()', 'anchor_flip(0)']), hamCuaEmMoi: [hAnchorFlip(['hold_and_valve(n)'])], phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Luna: Hàm anchor_flip(n) gồm 2 dòng: hold_and_valve(n) và pair_step("R", 2).', 'Luna: Sau lần gọi đầu xuồng tới (3, 1); quay trái hướng Bắc nhìn van thứ hai ở (3, 0) rồi gọi anchor_flip(0) lần hai tới Q.']
    }),

    manCheBenCu({
      so: 5, ten: 'Dùng anchor_flip(n) canh bè trôi vào bến cũ', hang: 'luyen', mucTieu: 'dua-vat', nhipTheo: 'tong',
      hamCuaEmCan: KHO_TRUOC.concat(['calm_gate_pass', 'dock_tow_back', 'rescue_old_dock', 'anchor_flip']),
      deBai: 'Sola thử thách trên 2 sân: ở kênh dưới, bè B ở (1, 3) đang trôi về Đông qua các ô (2, 3), (3, 3) hướng vào bến q ở (4, 3), nhưng nếu dòng chảy ở (4, 3) không tắt đúng lúc thì B sẽ trôi lố sang (5, 3)! Từ (1, 1) hướng Đông, ô (2, 1) trước mũi có sức nước s (1 ở sân 1, 2 ở sân 2). Hãy đọc s = flow_power(), quay trái hướng lên van V ở (1, 0) rồi tính t = 2 - s và gọi anchor_flip(t) để chờ đúng nhịp tắt dòng cho B dừng ngay tại q (4, 3), đồng thời mở cống K ở (2, 1) cho xuồng đi qua kéo B thứ hai ở (5, 1) về q (4, 1)!',
      veMaMau: 'Đã có s = flow_power(), turn_left(), t = 2 - s và anchor_flip(t). Thêm pull_back(1).',
      san: [
        ['#V======', '#~K~qB~#', '#=u==H=#', '#B~~q~~#', '########'],
        ['#V======', '#~K~qB~#', '#=u==H=#', '#B~~q~~#', '########']
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
      maMau: bai(['s = flow_power()', 'turn_left()', 't = 2 - s', 'anchor_flip(t)']),
      loiGiai: bai(['s = flow_power()', 'turn_left()', 't = 2 - s', 'anchor_flip(t)', 'pull_back(1)']),
      sao: { o: 40, nhip: 19 },
      loiGiaiKhac: {
        moTa: 'Tách h, s = flow() thay cho s = flow_power() trước khi quay trái',
        baiLam: bai(['h, s = flow()', 'turn_left()', 't = 2 - s', 'anchor_flip(t)', 'pull_back(1)'])
      },
      loiSai: [
        { moTa: 'Truyền cố định anchor_flip(0) nên ở sân 1 tắt dòng quá sớm khi bè dưới mới ở (3, 3)', baiLam: bai(['turn_left()', 'anchor_flip(0)', 'pull_back(1)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên gọi pull_back(1) ở cuối nên bè trên ở (5, 1) chưa về bến (4, 1)', baiLam: bai(['s = flow_power()', 'turn_left()', 't = 2 - s', 'anchor_flip(t)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Trong nhịp turn_left() và nhịp drop_anchor() đầu của anchor_flip, bè dưới đã trôi tới (4, 3) ở sân 2 (s == 2), còn ở sân 1 (s == 1) cần chờ thêm 1 nhịp (t = 2 - s = 1).', 'Luna: Sau anchor_flip(t), xuồng đang ở (3, 1) hướng Đông; gọi pull_back(1) sẽ tung lưới bắt bè ở (5, 1) rồi kéo lùi 1 ô vào bến (4, 1)!']
    }),

    manCheBenCu({
      so: 6, ten: 'Chế hàm mở cống rồi lai dắt qua cua tail_over_calm(d, n)', hang: 'luyen', mucTieu: 'dua-vat', nhipTheo: 'tong',
      hamCuaEmCan: KHO_TRUOC.concat(['calm_gate_pass', 'dock_tow_back', 'rescue_old_dock', 'anchor_flip']),
      taoHam: ['tail_over_calm'],
      deBai: 'Sola hướng dẫn chế hàm thứ 5 của gói: tại góc cua trước đám lục bình L, có ngày ô trước mũi có dòng chảy và cống K ở nhánh rẽ đang đóng, có ngày nước êm và cống k đã mở sẵn. Hãy chế hàm tail_over_calm(d, n) gồm: p = flow_power(), if p > 0: flip_valve() rồi gọi tug_corner(d, n). Dùng tail_over_calm("R", 4) đưa L vào bến q ở (2, 4)!',
      veMaMau: 'Trong hàm tail_over_calm(d, n), viết p = flow_power(), if p > 0: flip_valve() và tug_corner(d, n).',
      san: [
        ['##V###', '#~~~L#', '#=~~=#', '#uK~H#', '#~q~~#', '#~~~~#', '######'],
        ['##V###', '#~~~L#', '#=~~=#', '#uk~H#', '#~q~~#', '#~~~~#', '######']
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
      maMau: bai(['tail_over_calm("R", 4)']),
      loiGiai: bai(['tail_over_calm("R", 4)'], { hamCuaEmMoi: [hTailOverCalm()] }),
      sao: { o: 32, nhip: 17 },
      loiGiaiKhac: {
        moTa: 'Gọi deliver_tail(d, n) thay cho tug_corner(d, n) trong tail_over_calm(d, n)',
        baiLam: bai(['tail_over_calm("R", 4)']),
        hamCuaEmMoi: [hTailOverCalm(['p = flow_power()', 'if p > 0:', '    flip_valve()', 'deliver_tail(d, n)'])]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm tail_over_calm(d, n)', baiLam: bai(['tail_over_calm("R", 4)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Luôn gọi flip_valve() không kiểm tra flow_power() nên ở sân 2 làm đóng cống k', baiLam: bai(['tail_over_calm("R", 4)']), hamCuaEmMoi: [hTailOverCalm(['flip_valve()', 'tug_corner(d, n)'])], phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Lục bình L ở (4, 1) cách mũi xuồng ở (2, 1) đúng 2 ô trong tầm lưới.', 'Luna: Trong tail_over_calm(d, n), viết p = flow_power(), if p > 0: flip_valve() rồi gọi tug_corner(d, n).']
    }),

    manCheBenCu({
      so: 7, ten: 'Sửa hàm fix_old_dock() viết ngược điều kiện dòng chảy', hang: 'sua-ham', mucTieu: 'dua-vat', nhipTheo: 'tong',
      chinhCoDinh: true,
      hamCuaEmCan: KHO_TRUOC.concat(['calm_gate_pass', 'dock_tow_back', 'rescue_old_dock', 'anchor_flip', 'tail_over_calm']),
      deBai: 'Sola phát hiện lỗi trong hàm fix_old_dock(a, b) của màn: hàm này cần gạt van V khi ô trước mũi có dòng chảy (p > 0 với p = flow_power()), nhưng ai đó lại viết nhầm if p == 0: khiến ngày cống đóng thì không mở, còn ngày cống mở sẵn thì lại đóng sập lại! Hãy sửa lại hàm fix_old_dock(a, b) cho đúng!',
      veMaMau: 'Đổi điều kiện p == 0 thành p > 0 (hoặc gọi rescue_old_dock(a, b)).',
      san: [
        ['##V=====', '#~~qK~B#', '#=u==H=#', '########'],
        ['##V=====', '#~~qk~B#', '#=u==H=#', '########']
      ],
      dong: [
        [{ x: 3, y: 1, huong: 3, suc: 2 }],
        []
      ],
      noi: [
        [{ nut: { x: 2, y: 0 }, cong: [{ x: 4, y: 1 }], dong: [{ x: 3, y: 1 }] }],
        [{ nut: { x: 2, y: 0 }, cong: [{ x: 4, y: 1 }], dong: [] }]
      ],
      batDau: [{ x: 2, y: 1, huong: 1 }, { x: 2, y: 1, huong: 1 }],
      maMau: bai(['fix_old_dock(2, 3)'], { hamCuaMan: [hFixOldDock(T_FIX_OLD_DOCK_SAI)] }),
      loiGiai: bai(['fix_old_dock(2, 3)'], { hamCuaMan: [hFixOldDock(T_FIX_OLD_DOCK_DUNG)] }),
      sao: { o: 27, nhip: 15 },
      loiGiaiKhac: {
        moTa: 'Rút gọn thân hàm fix_old_dock(a, b) bằng rescue_old_dock(a, b)',
        baiLam: bai(['fix_old_dock(2, 3)'], { hamCuaMan: [hFixOldDock(['rescue_old_dock(a, b)'])] })
      },
      loiSai: [
        { moTa: 'Để nguyên điều kiện p == 0 chưa sửa nên cả hai sân đều hỏng', baiLam: bai(['fix_old_dock(2, 3)'], { hamCuaMan: [hFixOldDock(T_FIX_OLD_DOCK_SAI)] }), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Xóa mất pull_back(b) ở cuối hàm fix_old_dock(a, b)', baiLam: bai(['fix_old_dock(2, 3)'], { hamCuaMan: [hFixOldDock(['calm_gate_pass(a)'])] }), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Đổi dấu == 0 thành > 0 ở dòng đầu của fix_old_dock(a, b).', 'Luna: Hoặc thay cả thân hàm bằng một dòng rescue_old_dock(a, b).']
    }),

    manCheBenCu({
      so: 8, ten: 'Kết hợp tail_over_calm() và bù sức nước nhánh dọc', hang: 'bien-the', mucTieu: 'dua-vat', nhipTheo: 'tong',
      hamCuaEmCan: KHO_TRUOC.concat(['calm_gate_pass', 'dock_tow_back', 'rescue_old_dock', 'anchor_flip', 'tail_over_calm']),
      deBai: 'Sola giao bài phối hợp tại khu tường cửa cũ: từ (2, 1) hướng Đông, hãy gọi tail_over_calm("R", 1) để tự kiểm tra dòng chảy ở (3, 1), gạt van V mở cống K ở (2, 3) khi cần, đồng thời thu đám lục bình L ở (4, 1) về sát mũi và rẽ xuống (2, 2) hướng Nam. Ô (2, 3) trước mũi có dòng xuôi sức 1 hoặc 2; hãy đọc p = flow_power(), tính t = 4 - p rồi gọi forward(t) để kéo L vào bến q ở (2, 5)!',
      veMaMau: 'Gọi tail_over_calm("R", 1), rồi p = flow_power(), t = 4 - p, forward(t).',
      san: [
        ['##V###', '#~~~L#', '#=~H=#', '#uK=C#', '#~~~~#', '#~q~~#', '#~~~~#', '######'],
        ['##V###', '#~~~L#', '#=~H=#', '#uk=C#', '#~~~~#', '#~q~~#', '#~~~~#', '######']
      ],
      dong: [
        [{ x: 3, y: 1, huong: 1, suc: 1 }, { x: 2, y: 3, huong: 2, suc: 1 }],
        [{ x: 2, y: 3, huong: 2, suc: 2 }]
      ],
      noi: [
        [{ nut: { x: 2, y: 0 }, cong: [{ x: 2, y: 3 }], dong: [{ x: 3, y: 1 }] }],
        [{ nut: { x: 2, y: 0 }, cong: [{ x: 2, y: 3 }], dong: [] }]
      ],
      batDau: [{ x: 2, y: 1, huong: 1 }, { x: 2, y: 1, huong: 1 }],
      maMau: bai(['tail_over_calm("R", 1)']),
      loiGiai: bai(['tail_over_calm("R", 1)', 'p = flow_power()', 't = 4 - p', 'forward(t)']),
      sao: { o: 33, nhip: 16 },
      loiGiaiKhac: {
        moTa: 'Tách h, s = flow() thay cho p = flow_power() sau tail_over_calm("R", 1)',
        baiLam: bai(['tail_over_calm("R", 1)', 'h, s = flow()', 't = 4 - s', 'forward(t)'])
      },
      loiSai: [
        { moTa: 'Đếm cứng forward(2) ở nhánh dọc nên ở sân 1 lục bình L dừng trước bến q', baiLam: bai(['tail_over_calm("R", 1)', 'forward(2)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Gọi tug_corner("R", 1) mà không dùng tail_over_calm nên ở sân 1 cống K chưa mở', baiLam: bai(['tug_corner("R", 1)', 'p = flow_power()', 't = 4 - p', 'forward(t)']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Lệnh tail_over_calm("R", 1) vừa đảm bảo cống (2, 3) mở trên cả hai sân, vừa đưa xuồng xuống (2, 2) với L theo sau ở (2, 1).', 'Luna: Sau đó đọc p = flow_power(), t = 4 - p, gọi forward(t) để bù đúng sức chảy ở (2, 3).']
    }),

    manCheBenCu({
      so: 9, ten: 'Mở cống vượt luồng rồi chọn nhánh êm giao bè', hang: 'bien-the', mucTieu: 'dua-vat', nhipTheo: 'tong',
      hamCuaEmCan: KHO_TRUOC.concat(['calm_gate_pass', 'dock_tow_back', 'rescue_old_dock', 'anchor_flip', 'tail_over_calm']),
      deBai: 'Sola tăng độ khó: xuồng ở (2, 3) hướng Đông trước cống K/k ở (3, 3) và bè B ở (6, 3), bên trái là van V ở (2, 2) điều khiển dòng chảy và cống ở (3, 3). Hãy gọi calm_gate_pass(2) để tự mở cống khi có dòng và tiến tới ngã rẽ (4, 3), gọi tow_to_tail() thu B về (5, 3), gọi pair_step("L", 2) rẽ trái lên ngã ba (4, 1), rồi gọi best_branch(2) đưa B vào bến q ở nhánh êm (sức 1)!',
      veMaMau: 'Gọi calm_gate_pass(2), tow_to_tail(), pair_step("L", 2) rồi best_branch(2).',
      san: [
        ['#########', '#~q~~~~~#', '##V=~=H=#', '#~~K~~B~#', '#=u=====#', '#########'],
        ['#########', '#~~~~~q~#', '##V=~=H=#', '#~~k~~B~#', '#=u=====#', '#########']
      ],
      dong: [
        [{ x: 3, y: 3, huong: 3, suc: 1 }, { x: 3, y: 1, huong: 3, suc: 1 }, { x: 5, y: 1, huong: 1, suc: 2 }],
        [{ x: 3, y: 1, huong: 3, suc: 2 }, { x: 5, y: 1, huong: 1, suc: 1 }]
      ],
      noi: [
        [{ nut: { x: 2, y: 2 }, cong: [{ x: 3, y: 3 }], dong: [{ x: 3, y: 3 }] }],
        [{ nut: { x: 2, y: 2 }, cong: [{ x: 3, y: 3 }], dong: [] }]
      ],
      batDau: [{ x: 2, y: 3, huong: 1 }, { x: 2, y: 3, huong: 1 }],
      maMau: bai(['calm_gate_pass(2)', 'tow_to_tail()']),
      loiGiai: bai(['calm_gate_pass(2)', 'tow_to_tail()', 'pair_step("L", 2)', 'best_branch(2)']),
      sao: { o: 40, nhip: 24 },
      loiGiaiKhac: {
        moTa: 'Gọi tug_corner("L", 2) thay cho tow_to_tail() và pair_step("L", 2)',
        baiLam: bai(['calm_gate_pass(2)', 'tug_corner("L", 2)', 'best_branch(2)'])
      },
      loiSai: [
        { moTa: 'Gọi open_gate_pass(2) thay vì calm_gate_pass(2) nên ở sân 2 làm đóng cống k', baiLam: bai(['open_gate_pass(2)', 'tow_to_tail()', 'pair_step("L", 2)', 'best_branch(2)']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'Quên gọi pair_step("L", 2) lên ngã ba (4, 1) trước khi gọi best_branch(2)', baiLam: bai(['calm_gate_pass(2)', 'tow_to_tail()', 'best_branch(2)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Gọi calm_gate_pass(2) ở (2, 3) để tiến qua cống tới (4, 3), rồi gọi tow_to_tail() thu bè B ở (6, 3) về sát mũi.', 'Luna: Gọi pair_step("L", 2) lên ngã ba (4, 1) rồi gọi best_branch(2) để đưa B vào bến q.']
    }),

    manCheBenCu({
      so: 10, ten: 'Trùm: Cứu hộ liên hoàn hai luồng bến cũ', hang: 'trum', mucTieu: 'dua-vat', nhipTheo: 'tong',
      huyHieu: { ma: 'che-ben-cu', ten: 'Huy hiệu Chế lệnh: cứu hộ bến cũ' },
      hamCuaEmCan: KHO_TRUOC.concat(['calm_gate_pass', 'dock_tow_back', 'rescue_old_dock', 'anchor_flip', 'tail_over_calm']),
      deBai: 'Sola giao bài kiểm tra Trùm Gói 8: tại khu bến cổ 2 luồng ngăn bởi bờ rào =, hố u và thùng H, luồng Bắc có bè B ở (7, 1) sau cống K/k ở (3, 1) cần về bến q ở (4, 1), còn luồng Nam có lục bình L ở (7, 3) cần về bến q ở (4, 3). Từ (2, 1) hướng Đông, hãy gọi rescue_old_dock(3, 3) để kéo B lùi về bến (4, 1) (xuồng lùi về (2, 1)) rồi gọi tow_drop() thả B tại bến! Sau đó gọi pair_step("R", 2) xuống luồng Nam (2, 3), turn_left() và dock_tow_back(3, 3) kéo nốt L về bến (4, 3)!',
      veMaMau: 'Kết hợp rescue_old_dock(3, 3), tow_drop(), vòng xuống luồng Nam rồi gọi dock_tow_back(3, 3).',
      san: [
        ['##V======', '#~~Kq~~B#', '#=~~#uH=#', '#~~~q~~L#', '#########'],
        ['##V======', '#~~kq~~B#', '#=~~#uH=#', '#~~~q~~L#', '#########']
      ],
      dong: [
        [{ x: 3, y: 1, huong: 3, suc: 2 }],
        []
      ],
      noi: [
        [{ nut: { x: 2, y: 0 }, cong: [{ x: 3, y: 1 }], dong: [{ x: 3, y: 1 }] }],
        [{ nut: { x: 2, y: 0 }, cong: [{ x: 3, y: 1 }], dong: [] }]
      ],
      batDau: [{ x: 2, y: 1, huong: 1 }, { x: 2, y: 1, huong: 1 }],
      maMau: bai([
        'rescue_old_dock(3, 3)',
        'tow_drop()',
        'pair_step("R", 2)'
      ]),
      loiGiai: bai([
        'rescue_old_dock(3, 3)',
        'tow_drop()',
        'pair_step("R", 2)',
        'turn_left()',
        'dock_tow_back(3, 3)'
      ]),
      sao: { o: 40, nhip: 39 },
      loiGiaiKhac: {
        moTa: 'Tách forward(3) và pull_back(3) ở luồng Nam sau khi quay trái',
        baiLam: bai([
          'rescue_old_dock(3, 3)',
          'tow_drop()',
          'pair_step("R", 2)',
          'turn_left()',
          'forward(3)',
          'pull_back(3)'
        ])
      },
      loiSai: [
        { moTa: 'Dùng open_gate_pass(3) và pull_back(3) thay vì rescue_old_dock(3, 3) nên ở sân 2 làm đóng cống k', baiLam: bai(['open_gate_pass(3)', 'pull_back(3)', 'tow_drop()', 'pair_step("R", 2)', 'turn_left()', 'dock_tow_back(3, 3)']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'Quên gọi tow_drop() sau khi kéo B về bến (4, 1) nên khi rẽ xuống luồng Nam kéo lệch B khỏi bến', baiLam: bai(['rescue_old_dock(3, 3)', 'pair_step("R", 2)', 'turn_left()', 'dock_tow_back(3, 3)']), phaiCoMa: ['dang-keo', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau rescue_old_dock(3, 3), xuồng ở (2, 1) và B đã nằm ở bến (4, 1); gọi tow_drop() để thả lưới!', 'Luna: Tiếp theo gọi pair_step("R", 2), turn_left() và dock_tow_back(3, 3) để kéo L về bến (4, 3).']
    })
  ];

  if (M && M.them) M.manBenCu = DS;
  if (typeof module !== 'undefined' && module.exports) module.exports = M;
})();
