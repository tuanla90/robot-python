/* ============================================================================
   man-dong-chay.js — Mùa 5 (Bến sông) · Gói 3: Cảm biến Chong chóng dòng chảy
   Chương 1: dong-chay (10 màn) — Đo hướng nước chảy (flow_dir)
   Chương 2: che-dong-chay (10 màn) — Chế lệnh: lựa chiều nước
   ========================================================================== */
(function () {
  'use strict';

  var M = (typeof window !== 'undefined' && window.ManHoc) ||
    (typeof require === 'function' ? require('./man-chuoi-1.js') : null);

  var GOC_DONG = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'cast_net', 'drop_net', 'flow_dir'];
  var ROBOT_DONG = { than: 'xuong', tay: 'day-keo', camBien: [{ ma: 'dong-chay', o: 'tren' }] };
  var CAU_TRUC = ['for', 'if', 'while', 'list', 'def', 'return', 'tuple'];

  var KHO_TRUOC = [
    'move', 'turn_left', 'turn_right', 'u_turn', 'back', 'forward',
    'span_dist', 'round_steps', 'calm_bonus', 'turn_code', 'sail_to',
    'tow_grab', 'tow_drop', 'pull_back', 'pair_step', 'tow_pair'
  ];

  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function bai(chinh, phu) {
    var kq = { chinh: chinh.slice(), hamCuaMan: [], hamCuaEmMoi: [] };
    if (phu && phu.hamCuaMan) kq.hamCuaMan = phu.hamCuaMan;
    if (phu && phu.hamCuaEmMoi) kq.hamCuaEmMoi = phu.hamCuaEmMoi;
    return kq;
  }

  // 5 hàm mới của Gói 3 chương che-dong-chay + 1 hàm sửa lỗi
  var T_IS_CALM_FRONT = [
    'return flow_dir() == "none"'
  ];
  var T_FLOW_STEP = [
    'if flow_dir() == "front":',
    '    move()',
    'else:',
    '    forward(2)'
  ];
  var T_SCAN_CALM_SIDE = [
    'turn_left()',
    'if not is_calm_front():',
    '    u_turn()'
  ];
  var T_TOW_IN_CALM = [
    'scan_calm_side()',
    'tow_pair(1, n)'
  ];
  var T_FIX_FLOW_SAI = [
    'if flow_dir() == "back":',
    '    move()',
    'else:',
    '    forward(2)'
  ];
  var T_FIX_FLOW_DUNG = [
    'if flow_dir() == "front":',
    '    move()',
    'else:',
    '    forward(2)'
  ];
  var T_PICK_CALM_LANE = [
    'if not is_calm_front():',
    '    pair_step("R", 1)',
    '    turn_left()',
    'forward(n)'
  ];

  function hIsCalmFront(than) { return H('is_calm_front', [], than || T_IS_CALM_FRONT); }
  function hFlowStep(than) { return H('flow_step', [], than || T_FLOW_STEP); }
  function hScanCalmSide(than) { return H('scan_calm_side', [], than || T_SCAN_CALM_SIDE); }
  function hTowInCalm(than) { return H('tow_in_calm', ['n'], than || T_TOW_IN_CALM); }
  function hFixFlowRead(than) { return H('fix_flow_read', [], than || T_FIX_FLOW_DUNG); }
  function hPickCalmLane(than) { return H('pick_calm_lane', ['n'], than || T_PICK_CALM_LANE); }

  function manDongChay(cfg) {
    return Object.assign({
      chuong: 'dong-chay',
      loaiRobot: 'xuong',
      robot: ROBOT_DONG,
      vo: 'song',
      hamGoc: GOC_DONG.slice(),
      bienDem: true,
      cauTruc: CAU_TRUC,
      khung: { chinh: 10, moiHam: 10, cauTruc: CAU_TRUC },
      mucTieu: 'toi-co',
      hamCuaEmCan: KHO_TRUOC.slice(),
      taoHam: []
    }, cfg);
  }

  function manCheDongChay(cfg) {
    return Object.assign({
      chuong: 'che-dong-chay',
      loaiRobot: 'xuong',
      robot: ROBOT_DONG,
      vo: 'song',
      hamGoc: GOC_DONG.slice(),
      bienDem: true,
      cauTruc: CAU_TRUC,
      khung: { chinh: 10, moiHam: 10, cauTruc: CAU_TRUC },
      mucTieu: 'toi-co',
      hamCuaEmCan: KHO_TRUOC.slice(),
      taoHam: []
    }, cfg);
  }

  var DS = [
    /* ========================================================================
       CHƯƠNG 1: dong-chay (10 màn) — Đo hướng nước chảy
       ======================================================================== */
    manDongChay({
      so: 1, ten: 'Thử chong chóng flow_dir()', hang: 'lam-quen',
      chiChay: true, chinhCoDinh: true,
      deBai: 'Sola làm mẫu: mũi xuồng gắn cảm biến chong chóng flow_dir() đọc hướng dòng nước ở ô ngay trước mũi theo hướng xuồng ("front", "back", "left", "right", hoặc "none" khi nước êm), không tốn nhịp. Khi bước vào ô dòng chảy xuôi ("front") sức 1, nước đẩy xuồng trôi thêm 1 ô nữa. Bấm Chạy để xem xuồng lướt tới Q.',
      veMaMau: 'Chương trình mẫu đã khóa. Bấm Chạy để quan sát flow_dir() đọc dòng xuôi trước mũi.',
      san: [
        '########',
        '#~~~~Q~#',
        '########'
      ],
      dong: [{ x: 2, y: 1, huong: 1, suc: 1 }],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai([
        'if flow_dir() == "front":',
        '    move()',
        'else:',
        '    forward(2)',
        'forward(2)'
      ]),
      loiGiai: bai([
        'if flow_dir() == "front":',
        '    move()',
        'else:',
        '    forward(2)',
        'forward(2)'
      ]),
      sao: { o: 10, nhip: 3 },
      loiSai: [],
      goiY: ['Luna: Bấm Chạy để xem chong chóng đọc dòng nước tại ô (2, 1) trước mũi xuồng.', 'Luna: Bước vào ô dòng xuôi giúp xuồng tiến 1 ô rồi trôi thêm 1 ô trong cùng một nhịp.']
    }),

    manDongChay({
      so: 2, ten: 'Xuôi dòng tiến nhanh', hang: 'lam-quen', nhipTheo: 'tong',
      deBai: 'Sola nhờ bạn: trên hai sân, ô nước (2, 1) trước mũi xuồng có thể chảy xuôi ("front") hoặc đứng êm ("none"). Nếu flow_dir() == "front" thì chỉ cần move() một nhịp là qua 2 ô, ngược lại gọi forward(2). Sau đó tiến thêm 2 ô tới Q.',
      veMaMau: 'Viết thêm nhánh else với forward(2) rồi tiến 2 ô cuối.',
      san: [
        [
          '########',
          '#~~~~Q~#',
          '########'
        ],
        [
          '########',
          '#~~~~Q~#',
          '########'
        ]
      ],
      dong: [
        [{ x: 2, y: 1, huong: 1, suc: 1 }],
        []
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      maMau: bai([
        'if flow_dir() == "front":',
        '    move()'
      ]),
      loiGiai: bai([
        'if flow_dir() == "front":',
        '    move()',
        'else:',
        '    forward(2)',
        'forward(2)'
      ]),
      sao: { o: 10, nhip: 7 },
      loiGiaiKhac: {
        moTa: 'Kiểm tra flow_dir() == "none" trước rồi mới else sang move()',
        baiLam: bai([
          'if flow_dir() == "none":',
          '    forward(2)',
          'else:',
          '    move()',
          'forward(2)'
        ])
      },
      loiSai: [
        { moTa: 'Thiếu nhánh else nên sân nước êm bị thiếu bước', baiLam: bai(['if flow_dir() == "front":', '    move()', 'forward(2)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Viết cứng forward(3) nên sân nước êm đi thiếu 1 ô tới Q', baiLam: bai(['forward(3)']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Luna: Trong nhánh else, gọi forward(2) để đi đủ 2 ô khi nước êm.', 'Luna: Sau khối if / else, gọi thêm forward(2) để cập phao Q.']
    }),

    manDongChay({
      so: 3, ten: 'Né dòng nước ngược', hang: 'lam-quen', nhipTheo: 'tong',
      deBai: 'Sola nhờ bạn: nếu ô trước mũi chảy ngược chiều xuồng (flow_dir() == "back"), bước vào đó sẽ bị đẩy lùi về chỗ cũ. Hãy kiểm tra: nếu gặp dòng "back" thì vòng xuống làn dưới bằng pair_step("R", 1), pair_step("L", 3) rồi pair_step("L", 1); ngược lại đi thẳng forward(3) tới Q.',
      veMaMau: 'Kiểm tra flow_dir() == "back" để vòng xuống làn dưới hoặc đi thẳng.',
      san: [
        [
          '######',
          '#~~~Q#',
          '#~~~~#',
          '######'
        ],
        [
          '######',
          '#~~~Q#',
          '#~~~~#',
          '######'
        ]
      ],
      dong: [
        [{ x: 2, y: 1, huong: 3, suc: 1 }],
        []
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      maMau: bai([
        'if flow_dir() == "back":',
        '    pair_step("R", 1)'
      ]),
      loiGiai: bai([
        'if flow_dir() == "back":',
        '    pair_step("R", 1)',
        '    pair_step("L", 3)',
        '    pair_step("L", 1)',
        'else:',
        '    forward(3)'
      ]),
      sao: { o: 21, nhip: 11 },
      loiGiaiKhac: {
        moTa: 'Dùng turn_right(), move(), turn_left() thay cho pair_step đầu',
        baiLam: bai([
          'if flow_dir() == "back":',
          '    turn_right()',
          '    move()',
          '    pair_step("L", 3)',
          '    pair_step("L", 1)',
          'else:',
          '    forward(3)'
        ])
      },
      loiSai: [
        { moTa: 'Cứ đi thẳng forward(3) vào dòng ngược nên bị đẩy lùi tại chỗ', baiLam: bai(['forward(3)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Thiếu nhánh else cho sân nước êm', baiLam: bai(['if flow_dir() == "back":', '    pair_step("R", 1)', '    pair_step("L", 3)', '    pair_step("L", 1)']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Luna: Sau pair_step("R", 1), xuồng đã ở (1, 2) và quay mặt xuống.', 'Luna: Gọi tiếp pair_step("L", 3) và pair_step("L", 1) trong nhánh if, còn nhánh else chỉ cần forward(3).']
    }),

    manDongChay({
      so: 4, ten: 'Mượn dòng nước ngang', hang: 'luyen', nhipTheo: 'tong',
      deBai: 'Sola nhờ bạn: xuồng đang ở (1, 2) hướng sang phải, cần tới Q ở (4, 3). Nếu ô trước mũi (2, 2) có dòng chảy sang phải của mũi xuồng (flow_dir() == "right"), bước vào đó sẽ tự trôi xuống hàng 3 nên chỉ cần forward(3). Ngược lại khi nước êm, hãy dùng sail_to(1, 1) rồi pair_step("L", 2).',
      veMaMau: 'Kiểm tra flow_dir() == "right" để tận dụng dòng đẩy ngang.',
      san: [
        [
          '######',
          '#~~~~#',
          '#~~~~#',
          '#~~~Q#',
          '######'
        ],
        [
          '######',
          '#~~~~#',
          '#~~~~#',
          '#~~~Q#',
          '######'
        ]
      ],
      dong: [
        [{ x: 2, y: 2, huong: 2, suc: 1 }],
        []
      ],
      batDau: [{ x: 1, y: 2, huong: 1 }, { x: 1, y: 2, huong: 1 }],
      maMau: bai([
        'if flow_dir() == "right":',
        '    forward(3)'
      ]),
      loiGiai: bai([
        'if flow_dir() == "right":',
        '    forward(3)',
        'else:',
        '    sail_to(1, 1)',
        '    pair_step("L", 2)'
      ]),
      sao: { o: 24, nhip: 9 },
      loiGiaiKhac: {
        moTa: 'Kiểm tra flow_dir() != "right" trước rồi mới else',
        baiLam: bai([
          'if flow_dir() != "right":',
          '    sail_to(1, 1)',
          '    pair_step("L", 2)',
          'else:',
          '    forward(3)'
        ])
      },
      loiSai: [
        { moTa: 'Dùng sail_to(1, 1) trên cả hai sân nên sân có dòng ngang bị trôi đâm bờ', baiLam: bai(['sail_to(1, 1)', 'pair_step("L", 2)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Thiếu nhánh else cho sân nước êm', baiLam: bai(['if flow_dir() == "right":', '    forward(3)']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Luna: Khi xuồng hướng sang Đông, dòng chảy xuống Nam chính là bên phải mũi xuồng ("right").', 'Luna: Ở nhánh else, gọi sail_to(1, 1) để tới (2, 3) rồi gọi pair_step("L", 2) tới Q.']
    }),

    manDongChay({
      so: 5, ten: 'Đo hai chặng nước liên tiếp', hang: 'luyen', nhipTheo: 'tong',
      deBai: 'Sola nhờ bạn: luồng kênh dài 6 ô tới Q ở (7, 1) được chia làm 2 chặng, mỗi chặng 3 ô. Ở đầu mỗi chặng, hãy kiểm tra: nếu flow_dir() == "front" thì gọi forward(2), ngược lại gọi forward(3). Dùng vòng lặp for 2 lần.',
      veMaMau: 'Đặt câu lệnh if / else kiểm tra flow_dir() == "front" bên trong vòng lặp for i in range(2).',
      san: [
        [
          '##########',
          '#~~~~~~Q~#',
          '##########'
        ],
        [
          '##########',
          '#~~~~~~Q~#',
          '##########'
        ]
      ],
      dong: [
        [{ x: 2, y: 1, huong: 1, suc: 1 }],
        [{ x: 5, y: 1, huong: 1, suc: 1 }]
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      maMau: bai([
        'for i in range(2):',
        '    if flow_dir() == "front":',
        '        forward(2)'
      ]),
      loiGiai: bai([
        'for i in range(2):',
        '    if flow_dir() == "front":',
        '        forward(2)',
        '    else:',
        '        forward(3)'
      ]),
      sao: { o: 10, nhip: 10 },
      loiGiaiKhac: {
        moTa: 'Kiểm tra flow_dir() == "none" trước trong vòng lặp',
        baiLam: bai([
          'for i in range(2):',
          '    if flow_dir() == "none":',
          '        forward(3)',
          '    else:',
          '        forward(2)'
        ])
      },
      loiSai: [
        { moTa: 'Thiếu nhánh else nên chặng nước êm chỉ đi 0 ô', baiLam: bai(['for i in range(2):', '    if flow_dir() == "front":', '        forward(2)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Luôn gọi forward(2) ở cả hai chặng nên chặng nước êm đi thiếu 1 ô', baiLam: bai(['for i in range(2):', '    forward(2)']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Luna: Chặng có dòng xuôi chỉ cần forward(2) là đi hết 3 ô.', 'Luna: Thêm nhánh else: forward(3) bên trong vòng lặp for.']
    }),

    manDongChay({
      so: 6, ten: 'Đọc chiều dòng ngang ở ngã ba', hang: 'luyen', nhipTheo: 'tong',
      deBai: 'Sola nhờ bạn: xuồng ở (2, 2) hướng lên trên, cần tới Q ở (4, 1). Ô trước mũi (2, 1) có dòng chảy ngang: nếu chảy sang phải (flow_dir() == "right") thì chỉ cần move() để dòng đẩy sang (3, 1) rồi gọi pair_step("R", 1); ngược lại nếu chảy sang trái ("left") thì tránh ô đó bằng pair_step("R", 2) rồi pair_step("L", 1).',
      veMaMau: 'Kiểm tra flow_dir() == "right" trước khi quyết định tiến vào ô (2, 1).',
      san: [
        [
          '######',
          '#~~~Q#',
          '#~~~~#',
          '######'
        ],
        [
          '######',
          '#~~~Q#',
          '#~~~~#',
          '######'
        ]
      ],
      dong: [
        [{ x: 2, y: 1, huong: 1, suc: 1 }],
        [{ x: 2, y: 1, huong: 3, suc: 1 }]
      ],
      batDau: [{ x: 2, y: 2, huong: 0 }, { x: 2, y: 2, huong: 0 }],
      maMau: bai([
        'if flow_dir() == "right":',
        '    move()',
        '    pair_step("R", 1)'
      ]),
      loiGiai: bai([
        'if flow_dir() == "right":',
        '    move()',
        '    pair_step("R", 1)',
        'else:',
        '    pair_step("R", 2)',
        '    pair_step("L", 1)'
      ]),
      sao: { o: 21, nhip: 8 },
      loiGiaiKhac: {
        moTa: 'Kiểm tra flow_dir() == "left" trước rồi mới else',
        baiLam: bai([
          'if flow_dir() == "left":',
          '    pair_step("R", 2)',
          '    pair_step("L", 1)',
          'else:',
          '    move()',
          '    pair_step("R", 1)'
        ])
      },
      loiSai: [
        { moTa: 'Cứ bước lên (2, 1) ở sân dòng chảy trái nên bị đẩy dạt về (1, 1)', baiLam: bai(['move()', 'pair_step("R", 1)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đi vòng dưới ở cả hai sân nên tốn thêm nhịp ở sân có dòng thuận', baiLam: bai(['pair_step("R", 2)', 'pair_step("L", 1)']), phaiCoMa: [] }
      ],
      goiY: ['Luna: Khi dòng chảy sang phải ("right"), bước vào (2, 1) sẽ tự trôi sang (3, 1).', 'Luna: Trong nhánh else, gọi pair_step("R", 2) rồi pair_step("L", 1) để đi dọc hàng dưới lên Q.']
    }),

    manDongChay({
      so: 7, ten: 'Tiến tới mép dòng chảy bằng while', hang: 'bien-the', nhipTheo: 'tong',
      deBai: 'Sola nhờ bạn: trên hai sân, ô dòng chảy ngược nằm ở vị trí khác nhau trên hàng 1, còn phao Q nằm ngay bên dưới ô trước dòng chảy đó. Hãy dùng while flow_dir() == "none": để tiến cho tới sát mép dòng chảy, rồi gọi pair_step("R", 1) rẽ phải cập Q.',
      veMaMau: 'Dùng vòng lặp while flow_dir() == "none": move() rồi rẽ phải vào Q.',
      san: [
        [
          '#######',
          '#~~~~~#',
          '#~~Q~~#',
          '#######'
        ],
        [
          '#######',
          '#~~~~~#',
          '#~~~Q~#',
          '#######'
        ]
      ],
      dong: [
        [{ x: 4, y: 1, huong: 3, suc: 1 }],
        [{ x: 5, y: 1, huong: 3, suc: 1 }]
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      maMau: bai([
        'while flow_dir() == "none":',
        '    move()'
      ]),
      loiGiai: bai([
        'while flow_dir() == "none":',
        '    move()',
        'pair_step("R", 1)'
      ]),
      sao: { o: 16, nhip: 9 },
      loiGiaiKhac: {
        moTa: 'Dùng turn_right() và move() sau vòng lặp while',
        baiLam: bai([
          'while flow_dir() == "none":',
          '    move()',
          'turn_right()',
          'move()'
        ])
      },
      loiSai: [
        { moTa: 'Quên rẽ phải xuống Q sau khi dừng trước dòng chảy', baiLam: bai(['while flow_dir() == "none":', '    move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đếm cứng forward(2) nên chỉ đúng sân đầu', baiLam: bai(['forward(2)', 'pair_step("R", 1)']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Luna: Khi ô trước mũi là dòng chảy, flow_dir() khác "none" nên vòng while tự dừng đúng cột của Q.', 'Luna: Sau vòng while, gọi pair_step("R", 1) để rẽ phải tiến 1 ô xuống Q.']
    }),

    manDongChay({
      so: 8, ten: 'Lướt qua dòng đón bè gỗ', hang: 'bien-the', mucTieu: 'dua-vat', nhipTheo: 'tong',
      deBai: 'Sola nhờ bạn: bè gỗ B đang đợi ở (7, 1) và bến q ở (6, 1). Đoạn đầu ở (2, 1) có thể có dòng xuôi ("front") hoặc nước êm. Hãy kiểm tra flow_dir() để tiến tới (3, 1), rồi dùng tow_pair(2, 1) tiến tới (5, 1), tung lưới bắt bè ở (7, 1) và kéo lùi vào bến (6, 1).',
      veMaMau: 'Kiểm tra flow_dir() == "front" để tới (3, 1), sau đó gọi tow_pair(2, 1).',
      san: [
        [
          '#########',
          '#~~~~~qB#',
          '#########'
        ],
        [
          '#########',
          '#~~~~~qB#',
          '#########'
        ]
      ],
      dong: [
        [{ x: 2, y: 1, huong: 1, suc: 1 }],
        []
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      maMau: bai([
        'if flow_dir() == "front":',
        '    move()',
        'else:',
        '    forward(2)'
      ]),
      loiGiai: bai([
        'if flow_dir() == "front":',
        '    move()',
        'else:',
        '    forward(2)',
        'tow_pair(2, 1)'
      ]),
      sao: { o: 17, nhip: 10 },
      loiGiaiKhac: {
        moTa: 'Kiểm tra flow_dir() == "none" trước khi gọi tow_pair(2, 1)',
        baiLam: bai([
          'if flow_dir() == "none":',
          '    forward(2)',
          'else:',
          '    move()',
          'tow_pair(2, 1)'
        ])
      },
      loiSai: [
        { moTa: 'Quên gọi tow_pair(2, 1) sau khi tới (3, 1)', baiLam: bai(['if flow_dir() == "front":', '    move()', 'else:', '    forward(2)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Chỉ gọi move() ở cả hai sân nên sân nước êm tung lưới hụt bè', baiLam: bai(['move()', 'tow_pair(2, 1)']), phaiCoMa: ['keo-hut', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau khối if / else, xuồng dừng ở (3, 1) trên cả hai sân.', 'Luna: Gọi tow_pair(2, 1) để tiến 2 ô tới (5, 1), bắt bè ở (7, 1) và kéo lùi 1 ô về (6, 1).']
    }),

    manDongChay({
      so: 9, ten: 'Lựa làn êm dọn lục bình', hang: 'bien-the', mucTieu: 'dua-vat', nhipTheo: 'tong',
      deBai: 'Sola nhờ bạn: trên hai sân, lục bình L và bến q nằm ở làn nước êm (hàng 1 hoặc hàng 2). Nếu ô trước mũi (2, 1) có dòng ngược (flow_dir() == "back"), hãy chuyển xuống hàng 2 bằng pair_step("R", 1) và turn_left(); sau đó gọi tow_pair(2, 2) để đưa lục bình về bến q.',
      veMaMau: 'Nếu flow_dir() == "back" thì chuyển xuống hàng 2, rồi gọi tow_pair(2, 2).',
      san: [
        [
          '#######',
          '#~~~~~#',
          '#~~q~L#',
          '#######'
        ],
        [
          '#######',
          '#~~q~L#',
          '#~~~~~#',
          '#######'
        ]
      ],
      dong: [
        [{ x: 2, y: 1, huong: 3, suc: 1 }],
        []
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      maMau: bai([
        'if flow_dir() == "back":',
        '    pair_step("R", 1)',
        '    turn_left()'
      ]),
      loiGiai: bai([
        'if flow_dir() == "back":',
        '    pair_step("R", 1)',
        '    turn_left()',
        'tow_pair(2, 2)'
      ]),
      sao: { o: 26, nhip: 12 },
      loiGiaiKhac: {
        moTa: 'Dùng turn_right(), move(), turn_left() khi gặp dòng ngược',
        baiLam: bai([
          'if flow_dir() == "back":',
          '    turn_right()',
          '    move()',
          '    turn_left()',
          'tow_pair(2, 2)'
        ])
      },
      loiSai: [
        { moTa: 'Quên gọi tow_pair(2, 2) sau khi chọn làn', baiLam: bai(['if flow_dir() == "back":', '    pair_step("R", 1)', '    turn_left()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Không chuyển làn khi gặp dòng ngược nên tung lưới hụt ở hàng 1', baiLam: bai(['tow_pair(2, 2)']), phaiCoMa: ['keo-hut', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Khi hàng 1 có dòng ngược, lục bình nằm ở hàng 2 nên pair_step("R", 1) và turn_left() đưa xuồng xuống đúng làn.', 'Luna: Sau khối if, gọi tow_pair(2, 2) để tiến 2 ô, bắt lục bình và kéo lùi 2 ô vào q.']
    }),

    manDongChay({
      so: 10, ten: 'Trùm: Vượt luồng nước đôi đưa hai bè về bến', hang: 'trum', mucTieu: 'dua-vat', nhipTheo: 'tong',
      huyHieu: { ma: 'dong-chay', ten: 'Huy hiệu Đo hướng nước chảy' },
      deBai: 'Sola giao nhiệm vụ lớn: mỗi sân có 2 bè gỗ ở hai luồng nước ngược chiều nhau (hàng 1 đi sang Đông, hàng 3 đi sang Tây). Dùng vòng lặp for 2 lần: mỗi lượt kiểm tra flow_dir() == "front" để tiến 2 ô (move() hoặc forward(2)), gọi tow_pair(1, 1) đưa bè vào bến, rồi chuyển luồng bằng pair_step("R", 2) và turn_right().',
      veMaMau: 'Hoàn thiện vòng lặp 2 lượt kết hợp đọc dòng chảy và kéo bè.',
      san: [
        [
          '###########',
          '#~~~~~~~qB#',
          '#~~~~~~~~~#',
          '#Bq~~~~~~~#',
          '###########'
        ],
        [
          '###########',
          '#~~~~~~~qB#',
          '#~~~~~~~~~#',
          '#Bq~~~~~~~#',
          '###########'
        ]
      ],
      dong: [
        [{ x: 5, y: 1, huong: 1, suc: 1 }],
        [{ x: 5, y: 3, huong: 3, suc: 1 }]
      ],
      batDau: [{ x: 4, y: 1, huong: 1 }, { x: 4, y: 1, huong: 1 }],
      maMau: bai([
        'for i in range(2):',
        '    if flow_dir() == "front":',
        '        move()',
        '    else:',
        '        forward(2)'
      ]),
      loiGiai: bai([
        'for i in range(2):',
        '    if flow_dir() == "front":',
        '        move()',
        '    else:',
        '        forward(2)',
        '    tow_pair(1, 1)',
        '    pair_step("R", 2)',
        '    turn_right()'
      ]),
      sao: { o: 30, nhip: 28 },
      loiGiaiKhac: {
        moTa: 'Kiểm tra flow_dir() == "none" trước trong vòng lặp',
        baiLam: bai([
          'for i in range(2):',
          '    if flow_dir() == "none":',
          '        forward(2)',
          '    else:',
          '        move()',
          '    tow_pair(1, 1)',
          '    pair_step("R", 2)',
          '    turn_right()'
        ])
      },
      loiSai: [
        { moTa: 'Thiếu tow_pair(1, 1) và bước chuyển luồng trong vòng lặp', baiLam: bai(['for i in range(2):', '    if flow_dir() == "front":', '        move()', '    else:', '        forward(2)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên turn_right() cuối mỗi lượt nên lượt hai không hướng dọc hàng 3', baiLam: bai(['for i in range(2):', '    if flow_dir() == "front":', '        move()', '    else:', '        forward(2)', '    tow_pair(1, 1)', '    pair_step("R", 2)']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau khối if / else, gọi tow_pair(1, 1) để tiến 1 ô, bắt bè và kéo lùi 1 ô vào bến.', 'Luna: Gọi tiếp pair_step("R", 2) và turn_right() để sang luồng đối diện.']
    }),

    /* ========================================================================
       CHƯƠNG 2: che-dong-chay (10 màn) — Chế lệnh: lựa chiều nước
       ======================================================================== */
    manCheDongChay({
      so: 1, ten: 'Chế hàm kiểm tra nước êm is_calm_front()', hang: 'lam-quen', nhipTheo: 'tong',
      taoHam: ['is_calm_front'],
      deBai: 'Sola hướng dẫn: ta thường xuyên cần hỏi xem ô trước mũi có phải nước êm hay không. Hãy chế hàm is_calm_front() trả về kết quả so sánh return flow_dir() == "none", rồi dùng while is_calm_front(): move() để tiến tới trước dòng chảy và gọi pair_step("R", 1) vào Q.',
      veMaMau: 'Viết return flow_dir() == "none" trong thân hàm is_calm_front().',
      san: [
        [
          '#######',
          '#~~~~~#',
          '#~~Q~~#',
          '#######'
        ],
        [
          '#######',
          '#~~~~~#',
          '#~~~Q~#',
          '#######'
        ]
      ],
      dong: [
        [{ x: 4, y: 1, huong: 3, suc: 1 }],
        [{ x: 5, y: 1, huong: 3, suc: 1 }]
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      maMau: bai([
        'while is_calm_front():',
        '    move()',
        'pair_step("R", 1)'
      ]),
      loiGiai: bai([
        'while is_calm_front():',
        '    move()',
        'pair_step("R", 1)'
      ], { hamCuaEmMoi: [hIsCalmFront()] }),
      sao: { o: 17, nhip: 9 },
      loiGiaiKhac: {
        moTa: 'Dùng turn_right() và move() sau vòng lặp while is_calm_front()',
        baiLam: bai([
          'while is_calm_front():',
          '    move()',
          'turn_right()',
          'move()'
        ]),
        hamCuaEmMoi: [hIsCalmFront()]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm is_calm_front()', baiLam: bai(['while is_calm_front():', '    move()', 'pair_step("R", 1)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'So sánh với "front" thay vì "none"', baiLam: bai(['while is_calm_front():', '    move()', 'pair_step("R", 1)']), hamCuaEmMoi: [hIsCalmFront(['return flow_dir() == "front"'])], phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Luna: Nước êm là khi flow_dir() trả về chuỗi "none".', 'Luna: Trong hàm is_calm_front(), chỉ cần viết một dòng return flow_dir() == "none".']
    }),

    manCheDongChay({
      so: 2, ten: 'Dùng is_calm_front() chọn đường thẳng hay vòng', hang: 'lam-quen', nhipTheo: 'tong',
      hamCuaEmCan: KHO_TRUOC.concat(['is_calm_front']),
      deBai: 'Sola nhờ bạn: dùng hàm is_calm_front() vừa chế để kiểm tra ô (2, 1) trước mũi. Nếu nước êm (is_calm_front()) thì đi thẳng forward(3) tới Q; ngược lại vòng xuống hàng 2 bằng pair_step("R", 1), pair_step("L", 3) rồi pair_step("L", 1) lên Q.',
      veMaMau: 'Dùng if is_calm_front(): forward(3) kết hợp nhánh else đi vòng.',
      san: [
        [
          '######',
          '#~~~Q#',
          '#~~~~#',
          '######'
        ],
        [
          '######',
          '#~~~Q#',
          '#~~~~#',
          '######'
        ]
      ],
      dong: [
        [{ x: 2, y: 1, huong: 3, suc: 1 }],
        []
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      maMau: bai([
        'if is_calm_front():',
        '    forward(3)'
      ]),
      loiGiai: bai([
        'if is_calm_front():',
        '    forward(3)',
        'else:',
        '    pair_step("R", 1)',
        '    pair_step("L", 3)',
        '    pair_step("L", 1)'
      ]),
      sao: { o: 22, nhip: 11 },
      loiGiaiKhac: {
        moTa: 'Kiểm tra if not is_calm_front(): trước rồi mới else',
        baiLam: bai([
          'if not is_calm_front():',
          '    pair_step("R", 1)',
          '    pair_step("L", 3)',
          '    pair_step("L", 1)',
          'else:',
          '    forward(3)'
        ])
      },
      loiSai: [
        { moTa: 'Thiếu nhánh else nên sân có dòng ngược không đi vòng', baiLam: bai(['if is_calm_front():', '    forward(3)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên gọi is_calm_front() mà đi vòng cả hai sân nên tốn thêm nhịp', baiLam: bai(['pair_step("R", 1)', 'pair_step("L", 3)', 'pair_step("L", 1)']), phaiCoMa: [] }
      ],
      goiY: ['Luna: Nếu is_calm_front() đúng thì gọi forward(3).', 'Luna: Trong nhánh else, gọi pair_step("R", 1), pair_step("L", 3), rồi pair_step("L", 1).']
    }),

    manCheDongChay({
      so: 3, ten: 'Chế hàm bước đều hai ô flow_step()', hang: 'lam-quen', nhipTheo: 'tong',
      hamCuaEmCan: KHO_TRUOC.concat(['is_calm_front']),
      taoHam: ['flow_step'],
      deBai: 'Sola hướng dẫn: mỗi chặng 2 ô trên kênh có thể là dòng xuôi ("front") hoặc nước êm. Hãy chế hàm flow_step(): nếu flow_dir() == "front" thì gọi move(), ngược lại gọi forward(2). Nhờ vậy mỗi lần gọi flow_step() xuồng luôn tiến đúng 2 ô! Lặp 3 lần để tới Q ở (7, 1).',
      veMaMau: 'Hoàn thiện hàm flow_step() để tiến đúng 2 ô dù có dòng xuôi hay nước êm.',
      san: [
        [
          '##########',
          '#~~~~~~Q~#',
          '##########'
        ],
        [
          '##########',
          '#~~~~~~Q~#',
          '##########'
        ]
      ],
      dong: [
        [{ x: 2, y: 1, huong: 1, suc: 1 }, { x: 6, y: 1, huong: 1, suc: 1 }],
        [{ x: 4, y: 1, huong: 1, suc: 1 }]
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      maMau: bai([
        'for i in range(3):',
        '    flow_step()'
      ]),
      loiGiai: bai([
        'for i in range(3):',
        '    flow_step()'
      ], { hamCuaEmMoi: [hFlowStep()] }),
      sao: { o: 11, nhip: 9 },
      loiGiaiKhac: {
        moTa: 'Gọi flow_step() ba dòng liên tiếp',
        baiLam: bai([
          'flow_step()',
          'flow_step()',
          'flow_step()'
        ]),
        hamCuaEmMoi: [hFlowStep()]
      },
      loiSai: [
        { moTa: 'Thiếu nhánh else: forward(2) trong hàm flow_step()', baiLam: bai(['for i in range(3):', '    flow_step()']), hamCuaEmMoi: [hFlowStep(['if flow_dir() == "front":', '    move()'])], phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Trong hàm flow_step() chỉ gọi move() nên chặng nước êm đi thiếu bước', baiLam: bai(['for i in range(3):', '    flow_step()']), hamCuaEmMoi: [hFlowStep(['move()'])], phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Luna: Khi có dòng xuôi "front", một lệnh move() đã đi được 2 ô (1 bước + 1 trôi).', 'Luna: Thêm nhánh else: forward(2) vào cuối hàm flow_step().']
    }),

    manCheDongChay({
      so: 4, ten: 'Kết hợp flow_step() và tow_pair()', hang: 'luyen', mucTieu: 'dua-vat', nhipTheo: 'tong',
      hamCuaEmCan: KHO_TRUOC.concat(['is_calm_front', 'flow_step']),
      deBai: 'Sola nhờ bạn: bè gỗ B nằm ở (8, 1) và bến nhận q ở (7, 1). Từ (1, 1), hãy gọi flow_step() hai lần để vượt 4 ô đầu (bất kể dòng xuôi nằm ở chặng 1 hay chặng 2) tới (5, 1), rồi gọi tow_pair(1, 1) đưa bè vào bến.',
      veMaMau: 'Gọi flow_step() hai lần rồi gọi tow_pair(1, 1).',
      san: [
        [
          '##########',
          '#~~~~~~qB#',
          '##########'
        ],
        [
          '##########',
          '#~~~~~~qB#',
          '##########'
        ]
      ],
      dong: [
        [{ x: 2, y: 1, huong: 1, suc: 1 }],
        [{ x: 4, y: 1, huong: 1, suc: 1 }]
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      maMau: bai([
        'flow_step()'
      ]),
      loiGiai: bai([
        'flow_step()',
        'flow_step()',
        'tow_pair(1, 1)'
      ]),
      sao: { o: 19, nhip: 12 },
      loiGiaiKhac: {
        moTa: 'Dùng vòng lặp for 2 lần gọi flow_step() rồi tow_pair(1, 1)',
        baiLam: bai([
          'for i in range(2):',
          '    flow_step()',
          'tow_pair(1, 1)'
        ])
      },
      loiSai: [
        { moTa: 'Chỉ gọi flow_step() một lần nên lưới chưa vươn tới bè ở (8, 1)', baiLam: bai(['flow_step()', 'tow_pair(1, 1)']), phaiCoMa: ['keo-hut', 'chua-dua-vat'] },
        { moTa: 'Gọi tow_pair(0, 1) thay vì tow_pair(1, 1) nên tung lưới hụt bè', baiLam: bai(['flow_step()', 'flow_step()', 'tow_pair(0, 1)']), phaiCoMa: ['keo-hut', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Hai lần flow_step() đưa xuồng từ (1, 1) tới đúng (5, 1) trên cả hai sân.', 'Luna: Từ (5, 1), gọi tow_pair(1, 1) để tiến tới (6, 1), bắt bè ở (8, 1) và kéo lùi vào (7, 1).']
    }),

    manCheDongChay({
      so: 5, ten: 'Chế hàm chọn ngả nước êm scan_calm_side()', hang: 'luyen', nhipTheo: 'tong',
      hamCuaEmCan: KHO_TRUOC.concat(['is_calm_front', 'flow_step']),
      taoHam: ['scan_calm_side'],
      deBai: 'Sola hướng dẫn: khi đứng ở ngã ba (3, 2) hướng lên trên, một trong hai nhánh trái hoặc phải là nước êm, nhánh kia có dòng ngược. Hãy chế hàm scan_calm_side(): đầu tiên gọi turn_left() để nhìn sang trái; nếu not is_calm_front() thì gọi u_turn() quay sang phải. Sau đó tiến 2 ô tới Q.',
      veMaMau: 'Trong scan_calm_side(), gọi turn_left() rồi nếu not is_calm_front() thì u_turn().',
      san: [
        [
          '#######',
          '#~~~~~#',
          '#Q~~~~#',
          '#######'
        ],
        [
          '#######',
          '#~~~~~#',
          '#~~~~Q#',
          '#######'
        ]
      ],
      dong: [
        [{ x: 4, y: 2, huong: 3, suc: 1 }],
        [{ x: 2, y: 2, huong: 1, suc: 1 }]
      ],
      batDau: [{ x: 3, y: 2, huong: 0 }, { x: 3, y: 2, huong: 0 }],
      maMau: bai([
        'scan_calm_side()',
        'forward(2)'
      ]),
      loiGiai: bai([
        'scan_calm_side()',
        'forward(2)'
      ], { hamCuaEmMoi: [hScanCalmSide()] }),
      sao: { o: 16, nhip: 7 },
      loiGiaiKhac: {
        moTa: 'Gọi move() hai lần sau scan_calm_side()',
        baiLam: bai([
          'scan_calm_side()',
          'move()',
          'move()'
        ]),
        hamCuaEmMoi: [hScanCalmSide()]
      },
      loiSai: [
        { moTa: 'Quên kiểm tra if not is_calm_front(): u_turn() nên sân 2 đi vào dòng ngược', baiLam: bai(['scan_calm_side()', 'forward(2)']), hamCuaEmMoi: [hScanCalmSide(['turn_left()'])], phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Dùng turn_right() thay vì u_turn() nên chỉ quay về hướng Bắc ban đầu', baiLam: bai(['scan_calm_side()', 'forward(2)']), hamCuaEmMoi: [hScanCalmSide(['turn_left()', 'if not is_calm_front():', '    turn_right()'])], phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['Luna: Sau turn_left(), xuồng đang nhìn nhánh bên trái.', 'Luna: Nếu not is_calm_front(), gọi u_turn() để quay 180 độ sang nhánh bên phải.']
    }),

    manCheDongChay({
      so: 6, ten: 'Chế hàm kéo bè nhánh êm tow_in_calm(n)', hang: 'luyen', mucTieu: 'dua-vat', nhipTheo: 'tong',
      hamCuaEmCan: KHO_TRUOC.concat(['is_calm_front', 'flow_step', 'scan_calm_side']),
      taoHam: ['tow_in_calm'],
      deBai: 'Sola hướng dẫn: tại ngã ba (4, 2), bè gỗ B và bến q luôn nằm ở nhánh nước êm (trái hoặc phải). Hãy chế hàm tow_in_calm(n): gọi scan_calm_side() để quay về nhánh nước êm, rồi gọi tow_pair(1, n) để tiến 1 ô, tung lưới bắt bè và kéo lùi n ô vào bến. Gọi tow_in_calm(1).',
      veMaMau: 'Viết hàm tow_in_calm(n) gồm scan_calm_side() và tow_pair(1, n).',
      san: [
        [
          '#########',
          '#~~~~~~~#',
          '#Bq~~~~~#',
          '#########'
        ],
        [
          '#########',
          '#~~~~~~~#',
          '#~~~~~qB#',
          '#########'
        ]
      ],
      dong: [
        [{ x: 5, y: 2, huong: 3, suc: 1 }],
        [{ x: 3, y: 2, huong: 1, suc: 1 }]
      ],
      batDau: [{ x: 4, y: 2, huong: 0 }, { x: 4, y: 2, huong: 0 }],
      maMau: bai([
        'tow_in_calm(1)'
      ]),
      loiGiai: bai([
        'tow_in_calm(1)'
      ], { hamCuaEmMoi: [hTowInCalm()] }),
      sao: { o: 24, nhip: 9 },
      loiGiaiKhac: {
        moTa: 'Dùng move(), pull_back(n), tow_drop() trong hàm tow_in_calm(n)',
        baiLam: bai([
          'tow_in_calm(1)'
        ]),
        hamCuaEmMoi: [hTowInCalm(['scan_calm_side()', 'move()', 'pull_back(n)', 'tow_drop()'])]
      },
      loiSai: [
        { moTa: 'Thiếu tow_pair(1, n) trong hàm tow_in_calm(n)', baiLam: bai(['tow_in_calm(1)']), hamCuaEmMoi: [hTowInCalm(['scan_calm_side()'])], phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Viết nhầm tow_pair(0, n) thay vì tow_pair(1, n) nên tung lưới hụt bè', baiLam: bai(['tow_in_calm(1)']), hamCuaEmMoi: [hTowInCalm(['scan_calm_side()', 'tow_pair(0, n)'])], phaiCoMa: ['keo-hut', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau scan_calm_side(), mũi xuồng đã hướng thẳng vào bè gỗ ở nhánh nước êm.', 'Luna: Gọi tiếp tow_pair(1, n) ở dòng thứ hai của hàm tow_in_calm(n).']
    }),

    manCheDongChay({
      so: 7, ten: 'Sửa hàm đọc nhầm chiều nước fix_flow_read()', hang: 'bien-the',
      chinhCoDinh: true, nhipTheo: 'tong',
      hamCuaEmCan: KHO_TRUOC.concat(['is_calm_front', 'flow_step', 'scan_calm_side', 'tow_in_calm']),
      deBai: 'Sola phát hiện lỗi: chương trình chính gọi fix_flow_read() 2 lần để đi 4 ô từ (1, 1) tới (5, 1) rồi gọi pair_step("R", 1) rẽ xuống Q ở (5, 2). Nhưng hàm fix_flow_read() lại kiểm tra nhầm flow_dir() == "back" thay vì "front", nên khi gặp dòng xuôi vẫn gọi forward(2) và bị trôi lố sang cột 6. Hãy sửa lại điều kiện trong hàm!',
      veMaMau: 'Chương trình chính đã khóa. Hãy sửa "back" thành "front" trong hàm fix_flow_read().',
      san: [
        [
          '########',
          '#~~~~~~#',
          '#~~~~Q~#',
          '########'
        ],
        [
          '########',
          '#~~~~~~#',
          '#~~~~Q~#',
          '########'
        ]
      ],
      dong: [
        [{ x: 2, y: 1, huong: 1, suc: 1 }],
        [{ x: 4, y: 1, huong: 1, suc: 1 }]
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      maMau: bai([
        'for i in range(2):',
        '    fix_flow_read()',
        'pair_step("R", 1)'
      ], { hamCuaMan: [hFixFlowRead(T_FIX_FLOW_SAI)] }),
      loiGiai: bai([
        'for i in range(2):',
        '    fix_flow_read()',
        'pair_step("R", 1)'
      ], { hamCuaMan: [hFixFlowRead(T_FIX_FLOW_DUNG)] }),
      sao: { o: 20, nhip: 10 },
      loiSai: [
        { moTa: 'Chưa sửa "back" thành "front" nên xuồng đi lố sang cột 6', baiLam: bai(['for i in range(2):', '    fix_flow_read()', 'pair_step("R", 1)'], { hamCuaMan: [hFixFlowRead(T_FIX_FLOW_SAI)] }), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đổi forward(2) thành move() ở nhánh else nên đoạn nước êm đi thiếu bước', baiLam: bai(['for i in range(2):', '    fix_flow_read()', 'pair_step("R", 1)'], { hamCuaMan: [hFixFlowRead(['if flow_dir() == "front":', '    move()', 'else:', '    move()'])] }), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Luna: Dòng nước chảy xuôi theo mũi xuồng được trả về là "front" chứ không phải "back".', 'Luna: Đổi dòng đầu của fix_flow_read() thành if flow_dir() == "front":.']
    }),

    manCheDongChay({
      so: 8, ten: 'Chế hàm chuyển làn nước êm pick_calm_lane(n)', hang: 'bien-the', nhipTheo: 'tong',
      hamCuaEmCan: KHO_TRUOC.concat(['is_calm_front', 'flow_step', 'scan_calm_side', 'tow_in_calm']),
      taoHam: ['pick_calm_lane'],
      deBai: 'Sola hướng dẫn: khi đi dọc hàng 1, nếu phía trước không êm (not is_calm_front()) thì xuồng cần lách sang hàng 2 bằng pair_step("R", 1) và turn_left() rồi mới tiến n ô bằng forward(n). Hãy chế hàm pick_calm_lane(n) thực hiện việc đó và gọi pick_calm_lane(4) để tới Q.',
      veMaMau: 'Trong pick_calm_lane(n), kiểm tra if not is_calm_front(): chuyển xuống hàng 2, sau đó gọi forward(n).',
      san: [
        [
          '#######',
          '#~~~~~#',
          '#~~~~Q#',
          '#######'
        ],
        [
          '#######',
          '#~~~~Q#',
          '#~~~~~#',
          '#######'
        ]
      ],
      dong: [
        [{ x: 2, y: 1, huong: 3, suc: 1 }],
        []
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      maMau: bai([
        'pick_calm_lane(4)'
      ]),
      loiGiai: bai([
        'pick_calm_lane(4)'
      ], { hamCuaEmMoi: [hPickCalmLane()] }),
      sao: { o: 21, nhip: 11 },
      loiGiaiKhac: {
        moTa: 'Dùng turn_right(), move(), turn_left() trong nhánh if của pick_calm_lane(n)',
        baiLam: bai([
          'pick_calm_lane(4)'
        ]),
        hamCuaEmMoi: [hPickCalmLane(['if not is_calm_front():', '    turn_right()', '    move()', '    turn_left()', 'forward(n)'])]
      },
      loiSai: [
        { moTa: 'Quên gọi forward(n) ở cuối hàm pick_calm_lane(n)', baiLam: bai(['pick_calm_lane(4)']), hamCuaEmMoi: [hPickCalmLane(['if not is_calm_front():', '    pair_step("R", 1)', '    turn_left()'])], phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Viết if is_calm_front(): thay vì if not is_calm_front(): nên chọn ngược làn', baiLam: bai(['pick_calm_lane(4)']), hamCuaEmMoi: [hPickCalmLane(['if is_calm_front():', '    pair_step("R", 1)', '    turn_left()', 'forward(n)'])], phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Luna: Sau khối if not is_calm_front():, xuồng đã nằm ở làn nước êm và hướng sang phải.', 'Luna: Thêm dòng forward(n) ở cuối hàm pick_calm_lane(n) (ngoài khối if).']
    }),

    manCheDongChay({
      so: 9, ten: 'Phối hợp pick_calm_lane, flow_step và tow_pair', hang: 'bien-the', mucTieu: 'dua-vat', nhipTheo: 'tong',
      hamCuaEmCan: KHO_TRUOC.concat(['is_calm_front', 'flow_step', 'scan_calm_side', 'tow_in_calm', 'pick_calm_lane']),
      deBai: 'Sola nhờ bạn: từ (1, 1), hãy gọi pick_calm_lane(2) để chọn làn không có dòng ngược và tiến 2 ô tới cột 3; tiếp theo gọi flow_step() để vượt 2 ô nữa tới cột 5 (có thể có dòng xuôi trợ lực); cuối cùng gọi tow_pair(1, 1) đưa lục bình L ở cột 8 vào bến q ở cột 7.',
      veMaMau: 'Ghép 3 hàm pick_calm_lane(2), flow_step() và tow_pair(1, 1).',
      san: [
        [
          '##########',
          '#~~~~~~~~#',
          '#~~~~~~qL#',
          '##########'
        ],
        [
          '##########',
          '#~~~~~~qL#',
          '#~~~~~~~~#',
          '##########'
        ]
      ],
      dong: [
        [{ x: 2, y: 1, huong: 3, suc: 1 }],
        [{ x: 4, y: 1, huong: 1, suc: 1 }]
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      maMau: bai([
        'pick_calm_lane(2)'
      ]),
      loiGiai: bai([
        'pick_calm_lane(2)',
        'flow_step()',
        'tow_pair(1, 1)'
      ]),
      sao: { o: 34, nhip: 16 },
      loiGiaiKhac: {
        moTa: 'Dùng move(), pull_back(1), tow_drop() ở bước cuối',
        baiLam: bai([
          'pick_calm_lane(2)',
          'flow_step()',
          'move()',
          'pull_back(1)',
          'tow_drop()'
        ])
      },
      loiSai: [
        { moTa: 'Thiếu flow_step() nên lưới chưa vươn tới lục bình ở cột 8', baiLam: bai(['pick_calm_lane(2)', 'tow_pair(1, 1)']), phaiCoMa: ['keo-hut', 'chua-dua-vat'] },
        { moTa: 'Dùng forward(2) thay vì flow_step() nên ở sân 2 bị dòng xuôi đẩy lệch nhịp', baiLam: bai(['pick_calm_lane(2)', 'forward(2)', 'tow_pair(1, 1)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau pick_calm_lane(2), xuồng đang ở cột 3 trên làn đúng.', 'Luna: Gọi tiếp flow_step() để tới cột 5 rồi gọi tow_pair(1, 1).']
    }),

    manCheDongChay({
      so: 10, ten: 'Trùm: Điều phối hai tuyến nước đưa bè về bến', hang: 'trum', mucTieu: 'dua-vat', nhipTheo: 'tong',
      huyHieu: { ma: 'che-dong-chay', ten: 'Huy hiệu Chế lệnh: lựa chiều nước' },
      hamCuaEmCan: KHO_TRUOC.concat(['is_calm_front', 'flow_step', 'scan_calm_side', 'tow_in_calm', 'pick_calm_lane']),
      deBai: 'Sola giao thử thách cuối Gói 3: mỗi sân có 2 bè gỗ. Bè 1 nằm ở (7, 1) trên luồng ngang đầu: từ (1, 1), hãy gọi flow_step() để tới (3, 1) và gọi tow_pair(2, 1) đưa bè 1 vào bến (6, 1) (xuồng lùi về (4, 1)). Sau đó gọi pair_step("R", 2) xuống ngã ba (4, 3) và gọi tow_in_calm(1) để tự dò nhánh êm đưa bè 2 vào bến!',
      veMaMau: 'Kết hợp flow_step(), tow_pair(2, 1), pair_step("R", 2) và tow_in_calm(1).',
      san: [
        [
          '#########',
          '#~~~~~qB#',
          '#~~~~~~~#',
          '#Bq~~~~~#',
          '#########'
        ],
        [
          '#########',
          '#~~~~~qB#',
          '#~~~~~~~#',
          '#~~~~~qB#',
          '#########'
        ]
      ],
      dong: [
        [{ x: 2, y: 1, huong: 1, suc: 1 }, { x: 5, y: 3, huong: 3, suc: 1 }],
        [{ x: 3, y: 3, huong: 1, suc: 1 }]
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      maMau: bai([
        'flow_step()',
        'tow_pair(2, 1)'
      ]),
      loiGiai: bai([
        'flow_step()',
        'tow_pair(2, 1)',
        'pair_step("R", 2)',
        'tow_in_calm(1)'
      ]),
      sao: { o: 41, nhip: 26 },
      loiGiaiKhac: {
        moTa: 'Gọi trực tiếp scan_calm_side() và tow_pair(1, 1) ở ngã ba dưới',
        baiLam: bai([
          'flow_step()',
          'tow_pair(2, 1)',
          'pair_step("R", 2)',
          'scan_calm_side()',
          'tow_pair(1, 1)'
        ])
      },
      loiSai: [
        { moTa: 'Chưa đi xuống ngã ba (4, 3) để cứu bè thứ hai', baiLam: bai(['flow_step()', 'tow_pair(2, 1)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Gọi pair_step("R", 1) thay vì pair_step("R", 2) nên chưa tới hàng 3', baiLam: bai(['flow_step()', 'tow_pair(2, 1)', 'pair_step("R", 1)', 'tow_in_calm(1)']), phaiCoMa: ['keo-hut', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau tow_pair(2, 1), xuồng đang ở (4, 1) hướng sang phải.', 'Luna: Gọi pair_step("R", 2) để rẽ phải đi 2 ô xuống (4, 3), rồi gọi tow_in_calm(1).']
    })
  ];

  if (M && M.them) M.manDongChay = DS;
  if (typeof module !== 'undefined' && module.exports) module.exports = M;
})();
