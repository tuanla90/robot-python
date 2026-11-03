/* ============================================================================
   man-cong-thuy-loi.js — Mùa 5 (Bến sông) · Gói 4: Cống thủy lợi K/k, Van cống V & Dòng chảy
   Chương 1: cong-thuy-loi (10 màn) — Mở cống dẫn nước
   Chương 2: che-cong (10 màn) — Chế lệnh: điều tiết dòng
   ========================================================================== */
(function () {
  'use strict';

  var M = (typeof window !== 'undefined' && window.ManHoc) ||
    (typeof require === 'function' ? require('./man-chuoi-1.js') : null);

  var GOC_CONG = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'cast_net', 'drop_net', 'flow_dir'];
  var ROBOT_CONG = { than: 'xuong', tay: 'day-keo', camBien: [{ ma: 'dong-chay', o: 'tren' }] };
  var CAU_TRUC = ['for', 'if', 'while', 'list', 'def', 'return', 'tuple'];

  var KHO_TRUOC = [
    'move', 'turn_left', 'turn_right', 'u_turn', 'back', 'forward',
    'span_dist', 'round_steps', 'calm_bonus', 'turn_code', 'sail_to',
    'tow_grab', 'tow_drop', 'pull_back', 'pair_step', 'tow_pair',
    'is_calm_front', 'flow_step', 'scan_calm_side', 'tow_in_calm', 'pick_calm_lane'
  ];

  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function bai(chinh, phu) {
    var kq = { chinh: chinh.slice(), hamCuaMan: [], hamCuaEmMoi: [] };
    if (phu && phu.hamCuaMan) kq.hamCuaMan = phu.hamCuaMan;
    if (phu && phu.hamCuaEmMoi) kq.hamCuaEmMoi = phu.hamCuaEmMoi;
    return kq;
  }

  // 5 hàm mới của Gói 4 chương che-cong + 1 hàm sửa lỗi
  var T_FLIP_VALVE = [
    'turn_left()',
    'tow_grab()',
    'turn_right()'
  ];
  var T_OPEN_GATE_PASS = [
    'flip_valve()',
    'forward(n)'
  ];
  var T_SHUT_STREAM_TOW = [
    'h = flow_dir()',
    'if h == "back":',
    '    flip_valve()',
    'tow_pair(1, n)'
  ];
  var T_VALVE_AND_BACK = [
    'forward(n)',
    'tow_grab()',
    'for i in range(n):',
    '    back()'
  ];
  var T_FIX_GATE_SAI = [
    'turn_left()',
    'tow_grab()',
    'turn_left()'
  ];
  var T_FIX_GATE_DUNG = [
    'turn_left()',
    'tow_grab()',
    'turn_right()'
  ];
  var T_LOCK_RESCUE = [
    'open_gate_pass(1)',
    'pull_back(n)'
  ];

  function hFlipValve(than) { return H('flip_valve', [], than || T_FLIP_VALVE); }
  function hOpenGatePass(than) { return H('open_gate_pass', ['n'], than || T_OPEN_GATE_PASS); }
  function hShutStreamTow(than) { return H('shut_stream_tow', ['n'], than || T_SHUT_STREAM_TOW); }
  function hValveAndBack(than) { return H('valve_and_back', ['n'], than || T_VALVE_AND_BACK); }
  function hFixGateTow(than) { return H('fix_gate_tow', [], than || T_FIX_GATE_DUNG); }
  function hLockRescue(than) { return H('lock_rescue', ['n'], than || T_LOCK_RESCUE); }

  function manCongThuyLoi(cfg) {
    return Object.assign({
      chuong: 'cong-thuy-loi',
      loaiRobot: 'xuong',
      robot: ROBOT_CONG,
      vo: 'song',
      hamGoc: GOC_CONG.slice(),
      bienDem: true,
      cauTruc: CAU_TRUC,
      khung: { chinh: 10, moiHam: 10, cauTruc: CAU_TRUC },
      mucTieu: 'toi-co',
      hamCuaEmCan: KHO_TRUOC.slice(),
      taoHam: []
    }, cfg);
  }

  function manCheCong(cfg) {
    return Object.assign({
      chuong: 'che-cong',
      loaiRobot: 'xuong',
      robot: ROBOT_CONG,
      vo: 'song',
      hamGoc: GOC_CONG.slice(),
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
       CHƯƠNG 1: cong-thuy-loi (10 màn) — Mở cống dẫn nước
       ======================================================================== */
    manCongThuyLoi({
      so: 1, ten: 'Thử gạt van mở cống', hang: 'lam-quen',
      chiChay: true, chinhCoDinh: true,
      deBai: 'Sola làm mẫu: cửa cống đóng K chắn ngang kênh nước, còn cần gạt van V nằm trên bờ Bắc ở (1, 0). Khi mũi xuồng hướng về van V và quăng dây phao bằng tow_grab(), dây trúng van sẽ gạt mở cửa cống K ở cuối nhịp! Bấm Chạy để xem xuồng mở cống và tiến tới Q.',
      veMaMau: 'Chương trình mẫu đã khóa. Bấm Chạy để quan sát dây phao gạt van V mở cống K.',
      san: [
        '#V####',
        '#~K~Q#',
        '######'
      ],
      noi: [{ nut: { x: 1, y: 0 }, cong: [{ x: 2, y: 1 }], dong: [] }],
      batDau: { x: 1, y: 1, huong: 0 },
      maMau: bai([
        'tow_grab()',
        'pair_step("R", 3)'
      ]),
      loiGiai: bai([
        'tow_grab()',
        'pair_step("R", 3)'
      ]),
      sao: { o: 17, nhip: 5 },
      loiSai: [],
      goiY: ['Luna: Bấm Chạy để xem tow_grab() quăng dây trúng van V trên bờ.', 'Luna: Khi cống K mở ra, pair_step("R", 3) đưa xuồng rẽ phải đi xuyên qua cống tới Q.']
    }),

    manCongThuyLoi({
      so: 2, ten: 'Quăng dây xa gạt van trên bờ', hang: 'lam-quen',
      deBai: 'Sola nhờ bạn: dây phao có tầm xa 3 ô nên xuồng đứng ở (1, 3) hướng lên Bắc vẫn quăng dây trúng van V ở (1, 0) cách 3 ô! Hãy gọi tow_grab() để mở cống K ở (2, 3), rồi gọi pair_step("R", 3) tới phao Q.',
      veMaMau: 'Gọi tow_grab() để gạt van từ xa rồi gọi pair_step("R", 3).',
      san: [
        '#V####',
        '#~####',
        '#~####',
        '#~K~Q#',
        '######'
      ],
      noi: [{ nut: { x: 1, y: 0 }, cong: [{ x: 2, y: 3 }], dong: [] }],
      batDau: { x: 1, y: 3, huong: 0 },
      maMau: bai([
        'tow_grab()'
      ]),
      loiGiai: bai([
        'tow_grab()',
        'pair_step("R", 3)'
      ]),
      sao: { o: 17, nhip: 5 },
      loiGiaiKhac: {
        moTa: 'Dùng turn_right() và forward(3) sau khi gạt van',
        baiLam: bai([
          'tow_grab()',
          'turn_right()',
          'forward(3)'
        ])
      },
      loiSai: [
        { moTa: 'Mới gạt van mở cống, chưa rẽ phải tiến tới Q', baiLam: bai(['tow_grab()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên gạt van nên đâm vào cửa cống đóng K', baiLam: bai(['pair_step("R", 3)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Luna: Không cần tiến lên sát bờ vì dây phao ở (1, 3) đã vươn tới (1, 0).', 'Luna: Sau tow_grab(), gọi pair_step("R", 3) để rẽ phải qua cống tới Q.']
    }),

    manCongThuyLoi({
      so: 3, ten: 'Tắt dòng nước ngược bằng van', hang: 'lam-quen',
      deBai: 'Sola nhờ bạn: ô nước (2, 1) đang có dòng chảy ngược cực mạnh chặn đường tới Q, nhưng van V ở (1, 0) được nối với dòng chảy đó. Hãy gọi tow_grab() để gạt van tắt dòng chảy ngay lập tức, rồi gọi pair_step("R", 3) lướt tới Q.',
      veMaMau: 'Gọi tow_grab() tắt dòng chảy rồi gọi pair_step("R", 3).',
      san: [
        '#V####',
        '#~~~Q#',
        '######'
      ],
      dong: [{ x: 2, y: 1, huong: 3, suc: 1 }],
      noi: [{ nut: { x: 1, y: 0 }, cong: [], dong: [{ x: 2, y: 1 }] }],
      batDau: { x: 1, y: 1, huong: 0 },
      maMau: bai([
        'pair_step("R", 3)'
      ]),
      loiGiai: bai([
        'tow_grab()',
        'pair_step("R", 3)'
      ]),
      sao: { o: 17, nhip: 5 },
      loiGiaiKhac: {
        moTa: 'Dùng turn_right() và forward(3) sau khi tắt dòng',
        baiLam: bai([
          'tow_grab()',
          'turn_right()',
          'forward(3)'
        ])
      },
      loiSai: [
        { moTa: 'Chưa gạt van tắt dòng nên bị dòng ngược đẩy lùi về (1, 1)', baiLam: bai(['pair_step("R", 3)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Gạt van hai lần làm dòng ngược bật lại', baiLam: bai(['tow_grab()', 'tow_grab()', 'pair_step("R", 3)']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Luna: Thêm lệnh tow_grab() ở dòng đầu tiên trước khi gọi pair_step("R", 3).', 'Luna: Khi van V đổi trạng thái, dòng chảy ở (2, 1) tắt ngay lập tức.']
    }),

    manCongThuyLoi({
      so: 4, ten: 'Một van vừa mở cống vừa tắt dòng', hang: 'luyen',
      deBai: 'Sola nhờ bạn: xuồng đang ở (1, 1) hướng sang phải. Phía trước có cống đóng K ở (3, 1) và dòng chảy ngược ở (4, 1); cả hai đều nối với van V trên bờ Bắc (2, 0). Hãy tiến 1 ô tới (2, 1), quay trái nhìn van V, gọi tow_grab(), rồi gọi pair_step("R", 3) tới Q.',
      veMaMau: 'Tiến tới (2, 1), quay trái gạt van V rồi rẽ phải đi 3 ô tới Q.',
      san: [
        '##V####',
        '#~~K~Q#',
        '#######'
      ],
      dong: [{ x: 4, y: 1, huong: 3, suc: 1 }],
      noi: [{ nut: { x: 2, y: 0 }, cong: [{ x: 3, y: 1 }], dong: [{ x: 4, y: 1 }] }],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai([
        'move()',
        'turn_left()',
        'tow_grab()'
      ]),
      loiGiai: bai([
        'move()',
        'turn_left()',
        'tow_grab()',
        'pair_step("R", 3)'
      ]),
      sao: { o: 21, nhip: 7 },
      loiGiaiKhac: {
        moTa: 'Dùng turn_right() và forward(3) ở cuối',
        baiLam: bai([
          'move()',
          'turn_left()',
          'tow_grab()',
          'turn_right()',
          'forward(3)'
        ])
      },
      loiSai: [
        { moTa: 'Chưa rẽ phải đi qua cống sau khi gạt van', baiLam: bai(['move()', 'turn_left()', 'tow_grab()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Gạt van ngay tại (1, 1) nên dây phao trúng bờ tường thay vì van (2, 0)', baiLam: bai(['turn_left()', 'tow_grab()', 'pair_step("R", 4)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Luna: Tại (2, 1), quay trái sẽ hướng thẳng vào van V ở (2, 0).', 'Luna: Sau tow_grab(), gọi pair_step("R", 3) để qua cống (3, 1) và ô (4, 1) tới Q ở (5, 1).']
    }),

    manCongThuyLoi({
      so: 5, ten: 'Mở hai cống liên tiếp bằng vòng lặp', hang: 'luyen',
      deBai: 'Sola nhờ bạn: trên kênh có 2 cửa cống đóng ở (3, 1) và (6, 1) kèm 2 van trên bờ Bắc ở (2, 0) và (5, 0). Hãy dùng vòng lặp for 2 lần: mỗi lượt tiến 1 ô (move()), quay trái (turn_left()), gạt van (tow_grab()), rồi rẽ phải tiến 2 ô bằng pair_step("R", 2).',
      veMaMau: 'Đặt chuỗi move(), turn_left(), tow_grab(), pair_step("R", 2) vào vòng lặp for i in range(2).',
      san: [
        '##V##V###',
        '#~~K~~KQ#',
        '#########'
      ],
      noi: [
        { nut: { x: 2, y: 0 }, cong: [{ x: 3, y: 1 }], dong: [] },
        { nut: { x: 5, y: 0 }, cong: [{ x: 6, y: 1 }], dong: [] }
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai([
        'for i in range(2):',
        '    move()',
        '    turn_left()',
        '    tow_grab()'
      ]),
      loiGiai: bai([
        'for i in range(2):',
        '    move()',
        '    turn_left()',
        '    tow_grab()',
        '    pair_step("R", 2)'
      ]),
      sao: { o: 22, nhip: 12 },
      loiGiaiKhac: {
        moTa: 'Dùng turn_right() và forward(2) cuối mỗi vòng lặp',
        baiLam: bai([
          'for i in range(2):',
          '    move()',
          '    turn_left()',
          '    tow_grab()',
          '    turn_right()',
          '    forward(2)'
        ])
      },
      loiSai: [
        { moTa: 'Thiếu pair_step("R", 2) nên xuồng đứng yên sau khi mở cống đầu', baiLam: bai(['for i in range(2):', '    move()', '    turn_left()', '    tow_grab()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Chỉ tiến 1 ô sau khi mở cống nên lượt hai quay trái không trúng van thứ hai', baiLam: bai(['for i in range(2):', '    move()', '    turn_left()', '    tow_grab()', '    pair_step("R", 1)']), phaiCoMa: ['keo-hut', 'chua-toi-co'] }
      ],
      goiY: ['Luna: Cuối lượt 1, pair_step("R", 2) đưa xuồng từ (2, 1) qua cống (3, 1) tới (4, 1).', 'Luna: Ở lượt 2, move() đưa xuồng từ (4, 1) tới (5, 1) ngay dưới van thứ hai.']
    }),

    manCongThuyLoi({
      so: 6, ten: 'Mở cống thả bè trôi theo dòng vào bến', hang: 'luyen', mucTieu: 'dua-vat',
      deBai: 'Sola nhờ bạn: ở kênh dưới (hàng 3), bè gỗ B đang nằm trên dòng nước chảy sang phải nhưng bị cống đóng K ở (4, 3) chặn lại trước bến q (5, 3). Từ kênh trên (1, 1), hãy tiến 1 ô tới (2, 1), gọi tow_grab() gạt van V ở (4, 1) để mở cống K, rồi chờ 2 nhịp (wait() hai lần) cho dòng nước tự đẩy bè vào bến!',
      veMaMau: 'Tiến 1 ô, gọi tow_grab() mở cống rồi gọi wait() hai lần.',
      san: [
        '#######',
        '#~~~V~#',
        '#######',
        '#~~BKq#',
        '#######'
      ],
      dong: [
        { x: 3, y: 3, huong: 1, suc: 1 },
        { x: 4, y: 3, huong: 1, suc: 1 }
      ],
      noi: [{ nut: { x: 4, y: 1 }, cong: [{ x: 4, y: 3 }], dong: [] }],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai([
        'move()',
        'tow_grab()'
      ]),
      loiGiai: bai([
        'move()',
        'tow_grab()',
        'wait()',
        'wait()'
      ]),
      sao: { o: 9, nhip: 4 },
      loiGiaiKhac: {
        moTa: 'Dùng vòng lặp for 2 lần gọi wait() sau khi mở cống',
        baiLam: bai([
          'move()',
          'tow_grab()',
          'for i in range(2):',
          '    wait()'
        ])
      },
      loiSai: [
        { moTa: 'Mới mở cống mà chưa chờ đủ 2 nhịp nên bè chưa trôi tới bến q', baiLam: bai(['move()', 'tow_grab()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Chỉ chờ 1 nhịp nên bè mới trôi tới ô cống (4, 3)', baiLam: bai(['move()', 'tow_grab()', 'wait()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Khi cống (4, 3) mở ở cuối nhịp tow_grab(), bè B bắt đầu trôi từ nhịp kế tiếp.', 'Luna: Thêm hai dòng wait() để bè trôi qua (4, 3) vào bến q ở (5, 3).']
    }),

    manCongThuyLoi({
      so: 7, ten: 'Đo dòng chảy để quyết định gạt van', hang: 'bien-the', nhipTheo: 'tong',
      deBai: 'Sola nhờ bạn: trên hai sân, ô nước (3, 1) trước mũi xuồng có thể chảy ngược ("back") hoặc chảy xuôi ("front"). Van V ở (2, 0) điều khiển dòng chảy đó. Đọc h = flow_dir(): nếu h == "back" thì hãy quay trái (turn_left()), gạt van tắt dòng (tow_grab()) rồi gọi pair_step("R", 3) tới Q; ngược lại nếu dòng xuôi thì giữ nguyên dòng và chỉ cần gọi forward(2)!',
      veMaMau: 'Đã có h = flow_dir() và if h == "back": tắt dòng. Thêm nhánh else khi dòng xuôi.',
      san: [
        [
          '##V####',
          '#~~~~Q#',
          '#######'
        ],
        [
          '##V####',
          '#~~~~Q#',
          '#######'
        ]
      ],
      dong: [
        [{ x: 3, y: 1, huong: 3, suc: 1 }],
        [{ x: 3, y: 1, huong: 1, suc: 1 }]
      ],
      noi: [
        [{ nut: { x: 2, y: 0 }, cong: [], dong: [{ x: 3, y: 1 }] }],
        [{ nut: { x: 2, y: 0 }, cong: [], dong: [{ x: 3, y: 1 }] }]
      ],
      batDau: [{ x: 2, y: 1, huong: 1 }, { x: 2, y: 1, huong: 1 }],
      maMau: bai([
        'h = flow_dir()',
        'if h == "back":',
        '    turn_left()',
        '    tow_grab()',
        '    pair_step("R", 3)'
      ]),
      loiGiai: bai([
        'h = flow_dir()',
        'if h == "back":',
        '    turn_left()',
        '    tow_grab()',
        '    pair_step("R", 3)',
        'else:',
        '    forward(2)'
      ]),
      sao: { o: 23, nhip: 8 },
      loiGiaiKhac: {
        moTa: 'Hỏi h == "front" trước rồi mới else',
        baiLam: bai([
          'h = flow_dir()',
          'if h == "front":',
          '    forward(2)',
          'else:',
          '    turn_left()',
          '    tow_grab()',
          '    pair_step("R", 3)'
        ])
      },
      loiSai: [
        { moTa: 'Thiếu nhánh else cho sân có dòng chảy xuôi', baiLam: bai(['h = flow_dir()', 'if h == "back":', '    turn_left()', '    tow_grab()', '    pair_step("R", 3)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Không tắt dòng ở sân dòng ngược mà đi thẳng forward(2)', baiLam: bai(['forward(2)']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Luna: Ở sân 2, dòng chảy xuôi giúp bước đầu đi được 2 ô nên chỉ cần forward(2) là tới (5, 1).', 'Luna: Thêm nhánh else: forward(2) vào cuối chương trình.']
    }),

    manCongThuyLoi({
      so: 8, ten: 'Mở cống rồi kéo bè qua cống', hang: 'bien-the', mucTieu: 'dua-vat',
      deBai: 'Sola nhờ bạn: bè gỗ B nằm bên kia cửa cống đóng K ở (3, 1). Từ (1, 1) hướng sang phải, hãy quay trái (turn_left()), gạt van V ở (1, 0) bằng tow_grab(), quay phải trở lại (turn_right()), rồi gọi tow_pair(2, 1) để tiến 2 ô vào cống mở, tung lưới bắt bè ở (5, 1) và kéo lùi 1 ô tới bến q ở (4, 1).',
      veMaMau: 'Quay trái gạt van, quay phải rồi gọi tow_pair(2, 1).',
      san: [
        '#V#####',
        '#~~KqB#',
        '#######'
      ],
      noi: [{ nut: { x: 1, y: 0 }, cong: [{ x: 3, y: 1 }], dong: [] }],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai([
        'turn_left()',
        'tow_grab()',
        'turn_right()'
      ]),
      loiGiai: bai([
        'turn_left()',
        'tow_grab()',
        'turn_right()',
        'tow_pair(2, 1)'
      ]),
      sao: { o: 20, nhip: 7 },
      loiGiaiKhac: {
        moTa: 'Dùng pair_step("R", 2) rồi tow_pair(0, 1)',
        baiLam: bai([
          'turn_left()',
          'tow_grab()',
          'pair_step("R", 2)',
          'tow_pair(0, 1)'
        ])
      },
      loiSai: [
        { moTa: 'Mới mở cống, chưa gọi tow_pair(2, 1) để đưa bè về bến', baiLam: bai(['turn_left()', 'tow_grab()', 'turn_right()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Gọi tow_pair(1, 1) nên mới tới (2, 1), tung lưới hụt bè ở (5, 1)', baiLam: bai(['turn_left()', 'tow_grab()', 'turn_right()', 'tow_pair(1, 1)']), phaiCoMa: ['keo-hut', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau turn_right(), xuồng ở (1, 1) hướng sang phải và cống (3, 1) đã mở.', 'Luna: Gọi tow_pair(2, 1) để tiến 2 ô tới (3, 1), bắt bè ở (5, 1) và kéo lùi 1 ô về (4, 1).']
    }),

    manCongThuyLoi({
      so: 9, ten: 'Kéo lùi bè qua cống về bến', hang: 'bien-the', mucTieu: 'dua-vat',
      deBai: 'Sola nhờ bạn: bến nhận q nằm ở (3, 1), còn bè gỗ B bị nhốt ở (5, 1) sau cống đóng K (4, 1). Hãy quay trái gạt van V ở (2, 0) (turn_left(), tow_grab()), rẽ phải tiến 1 ô tới (3, 1) bằng pair_step("R", 1), rồi gọi pull_back(2) để tung lưới qua cống bắt bè ở (5, 1) và kéo lùi 2 ô về đúng bến (3, 1)!',
      veMaMau: 'Quay trái gạt van, gọi pair_step("R", 1) rồi gọi pull_back(2).',
      san: [
        '##V####',
        '#~~qKB#',
        '#######'
      ],
      noi: [{ nut: { x: 2, y: 0 }, cong: [{ x: 4, y: 1 }], dong: [] }],
      batDau: { x: 2, y: 1, huong: 1 },
      maMau: bai([
        'turn_left()',
        'tow_grab()',
        'pair_step("R", 1)'
      ]),
      loiGiai: bai([
        'turn_left()',
        'tow_grab()',
        'pair_step("R", 1)',
        'pull_back(2)'
      ]),
      sao: { o: 27, nhip: 7 },
      loiGiaiKhac: {
        moTa: 'Dùng turn_right(), move() rồi pull_back(2)',
        baiLam: bai([
          'turn_left()',
          'tow_grab()',
          'turn_right()',
          'move()',
          'pull_back(2)'
        ])
      },
      loiSai: [
        { moTa: 'Chưa gọi pull_back(2) sau khi tiến tới (3, 1)', baiLam: bai(['turn_left()', 'tow_grab()', 'pair_step("R", 1)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Chỉ gọi pull_back(1) nên bè mới lùi tới (4, 1), chưa về tới (3, 1)', baiLam: bai(['turn_left()', 'tow_grab()', 'pair_step("R", 1)', 'pull_back(1)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau pair_step("R", 1), xuồng đứng ở (3, 1) cách bè (5, 1) đúng 2 ô qua cống mở (4, 1).', 'Luna: Gọi pull_back(2) để bắt bè ở (5, 1) và lùi 2 ô kéo bè về (3, 1).']
    }),

    manCongThuyLoi({
      so: 10, ten: 'Trùm: Mở hai đập cống giải cứu hai bè', hang: 'trum', mucTieu: 'dua-vat', nhipTheo: 'tong',
      huyHieu: { ma: 'cong-thuy-loi', ten: 'Huy hiệu Mở cống dẫn nước' },
      deBai: 'Sola giao nhiệm vụ lớn: mỗi sân có 2 cửa cống đóng ở hai luồng kênh (hàng 1 đi sang Đông, hàng 3 đi sang Tây), kèm dòng chảy ngược chắn ngay tại cống. Dùng vòng lặp for 2 lần: mỗi lượt quay trái gạt van (turn_left(), tow_grab(), turn_right()) để vừa mở cống vừa tắt dòng, gọi tow_pair(1, 1) đưa vật nổi vào bến, rồi chuyển luồng bằng pair_step("R", 2) và turn_right().',
      veMaMau: 'Viết vòng lặp 2 lượt: gạt van bên trái, gọi tow_pair(1, 1), rồi chuyển luồng.',
      san: [
        [
          '####V####',
          '#~~~~KqB#',
          '#~~~~~~~#',
          '#LqK~~~~#',
          '####V####'
        ],
        [
          '####V####',
          '#~~~~KqL#',
          '#~~~~~~~#',
          '#BqK~~~~#',
          '####V####'
        ]
      ],
      dong: [
        [{ x: 5, y: 1, huong: 3, suc: 1 }],
        [{ x: 3, y: 3, huong: 1, suc: 1 }]
      ],
      noi: [
        [
          { nut: { x: 4, y: 0 }, cong: [{ x: 5, y: 1 }], dong: [{ x: 5, y: 1 }] },
          { nut: { x: 4, y: 4 }, cong: [{ x: 3, y: 3 }], dong: [] }
        ],
        [
          { nut: { x: 4, y: 0 }, cong: [{ x: 5, y: 1 }], dong: [] },
          { nut: { x: 4, y: 4 }, cong: [{ x: 3, y: 3 }], dong: [{ x: 3, y: 3 }] }
        ]
      ],
      batDau: [{ x: 4, y: 1, huong: 1 }, { x: 4, y: 1, huong: 1 }],
      maMau: bai([
        'for i in range(2):',
        '    turn_left()',
        '    tow_grab()',
        '    turn_right()'
      ]),
      loiGiai: bai([
        'for i in range(2):',
        '    turn_left()',
        '    tow_grab()',
        '    turn_right()',
        '    tow_pair(1, 1)',
        '    pair_step("R", 2)',
        '    turn_right()'
      ]),
      sao: { o: 31, nhip: 34 },
      loiGiaiKhac: {
        moTa: 'Dùng move(), pull_back(1), tow_drop() sau khi gạt van',
        baiLam: bai([
          'for i in range(2):',
          '    turn_left()',
          '    tow_grab()',
          '    turn_right()',
          '    move()',
          '    pull_back(1)',
          '    tow_drop()',
          '    pair_step("R", 2)',
          '    turn_right()'
        ])
      },
      loiSai: [
        { moTa: 'Mới gạt van mà chưa kéo vật nổi và chuyển luồng', baiLam: bai(['for i in range(2):', '    turn_left()', '    tow_grab()', '    turn_right()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên gạt van mở cống nên đâm vào cống đóng K', baiLam: bai(['for i in range(2):', '    tow_pair(1, 1)', '    pair_step("R", 2)', '    turn_right()']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau turn_right(), gọi tow_pair(1, 1) để tiến vào ô cống mở, bắt vật nổi và kéo lùi 1 ô vào bến.', 'Luna: Cuối mỗi lượt, gọi pair_step("R", 2) và turn_right() để sang luồng đối diện.']
    }),

    /* ========================================================================
       CHƯƠNG 2: che-cong (10 màn) — Chế lệnh: điều tiết dòng
       ======================================================================== */
    manCheCong({
      so: 1, ten: 'Chế hàm gạt van bờ trái flip_valve()', hang: 'lam-quen',
      taoHam: ['flip_valve'],
      deBai: 'Sola hướng dẫn: khi đi dọc kênh, các van V thường đặt trên bờ bên trái xuồng. Hãy chế hàm flip_valve() gồm 3 bước: turn_left(), tow_grab(), turn_right() để quay sang gạt van rồi nhìn lại hướng kênh cũ. Dùng nó để mở cống (3, 1) và tiến tới Q.',
      veMaMau: 'Viết hàm flip_valve() gồm turn_left(), tow_grab(), turn_right().',
      san: [
        '##V###',
        '#~~KQ#',
        '######'
      ],
      noi: [{ nut: { x: 2, y: 0 }, cong: [{ x: 3, y: 1 }], dong: [] }],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai([
        'move()',
        'flip_valve()',
        'forward(2)'
      ]),
      loiGiai: bai([
        'move()',
        'flip_valve()',
        'forward(2)'
      ], { hamCuaEmMoi: [hFlipValve()] }),
      sao: { o: 17, nhip: 6 },
      loiGiaiKhac: {
        moTa: 'Gọi move() hai lần sau flip_valve()',
        baiLam: bai([
          'move()',
          'flip_valve()',
          'move()',
          'move()'
        ]),
        hamCuaEmMoi: [hFlipValve()]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm flip_valve()', baiLam: bai(['move()', 'flip_valve()', 'forward(2)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên turn_right() cuối hàm flip_valve() nên xuồng đâm lên bờ Bắc', baiLam: bai(['move()', 'flip_valve()', 'forward(2)']), hamCuaEmMoi: [hFlipValve(['turn_left()', 'tow_grab()'])], phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Luna: Trong flip_valve(), gọi lần lượt turn_left(), tow_grab(), rồi turn_right().', 'Luna: Chương trình chính đã gọi sẵn move(), flip_valve(), forward(2).']
    }),

    manCheCong({
      so: 2, ten: 'Dùng flip_valve() vượt hai trạm cống', hang: 'lam-quen',
      hamCuaEmCan: KHO_TRUOC.concat(['flip_valve']),
      deBai: 'Sola nhờ bạn: dùng hàm flip_valve() vừa chế trong vòng lặp for 2 lần để mở liên tiếp 2 trạm cống ở (3, 1) và (6, 1) rồi cập phao Q ở (7, 1).',
      veMaMau: 'Trong vòng lặp for i in range(2), gọi move(), flip_valve(), rồi forward(2).',
      san: [
        '##V##V###',
        '#~~K~~KQ#',
        '#########'
      ],
      noi: [
        { nut: { x: 2, y: 0 }, cong: [{ x: 3, y: 1 }], dong: [] },
        { nut: { x: 5, y: 0 }, cong: [{ x: 6, y: 1 }], dong: [] }
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai([
        'for i in range(2):',
        '    move()',
        '    flip_valve()'
      ]),
      loiGiai: bai([
        'for i in range(2):',
        '    move()',
        '    flip_valve()',
        '    forward(2)'
      ]),
      sao: { o: 18, nhip: 12 },
      loiGiaiKhac: {
        moTa: 'Tách hai lần mở cống liên tiếp',
        baiLam: bai([
          'move()',
          'flip_valve()',
          'forward(3)',
          'flip_valve()',
          'forward(2)'
        ])
      },
      loiSai: [
        { moTa: 'Thiếu forward(2) cuối vòng lặp nên xuồng chưa đi qua cống', baiLam: bai(['for i in range(2):', '    move()', '    flip_valve()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Gọi forward(1) thay vì forward(2) nên lượt hai gạt nhầm chỗ', baiLam: bai(['for i in range(2):', '    move()', '    flip_valve()', '    forward(1)']), phaiCoMa: ['keo-hut', 'chua-toi-co'] }
      ],
      goiY: ['Luna: Sau flip_valve(), cửa cống ngay trước mũi đã mở.', 'Luna: Thêm dòng forward(2) vào cuối thân vòng lặp for.']
    }),

    manCheCong({
      so: 3, ten: 'Chế hàm mở cống và tiến open_gate_pass(n)', hang: 'lam-quen',
      hamCuaEmCan: KHO_TRUOC.concat(['flip_valve']),
      taoHam: ['open_gate_pass'],
      deBai: 'Sola hướng dẫn: khi đứng ngay cạnh van, ta luôn gọi flip_valve() rồi tiến n ô qua cống bằng forward(n). Hãy đóng gói 2 bước đó thành hàm open_gate_pass(n), rồi gọi open_gate_pass(3) và open_gate_pass(2) để vượt qua hai cống tới Q!',
      veMaMau: 'Viết hàm open_gate_pass(n) gồm flip_valve() và forward(n).',
      san: [
        '##V##V###',
        '#~~K~~KQ#',
        '#########'
      ],
      noi: [
        { nut: { x: 2, y: 0 }, cong: [{ x: 3, y: 1 }], dong: [] },
        { nut: { x: 5, y: 0 }, cong: [{ x: 6, y: 1 }], dong: [] }
      ],
      batDau: { x: 2, y: 1, huong: 1 },
      maMau: bai([
        'open_gate_pass(3)',
        'open_gate_pass(2)'
      ]),
      loiGiai: bai([
        'open_gate_pass(3)',
        'open_gate_pass(2)'
      ], { hamCuaEmMoi: [hOpenGatePass()] }),
      sao: { o: 18, nhip: 11 },
      loiGiaiKhac: {
        moTa: 'Viết trực tiếp turn_left(), tow_grab(), turn_right(), forward(n) trong open_gate_pass(n)',
        baiLam: bai([
          'open_gate_pass(3)',
          'open_gate_pass(2)'
        ]),
        hamCuaEmMoi: [hOpenGatePass(['turn_left()', 'tow_grab()', 'turn_right()', 'forward(n)'])]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm open_gate_pass(n)', baiLam: bai(['open_gate_pass(3)', 'open_gate_pass(2)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Viết cứng forward(2) thay vì forward(n) nên chặng đầu chưa tới van thứ hai', baiLam: bai(['open_gate_pass(3)', 'open_gate_pass(2)']), hamCuaEmMoi: [hOpenGatePass(['flip_valve()', 'forward(2)'])], phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Luna: Dòng đầu của open_gate_pass(n) là flip_valve().', 'Luna: Dòng thứ hai của open_gate_pass(n) là forward(n).']
    }),

    manCheCong({
      so: 4, ten: 'Chế hàm tắt dòng ngược rồi kéo bè shut_stream_tow(n)', hang: 'luyen', mucTieu: 'dua-vat', nhipTheo: 'tong',
      hamCuaEmCan: KHO_TRUOC.concat(['flip_valve', 'open_gate_pass']),
      taoHam: ['shut_stream_tow'],
      deBai: 'Sola hướng dẫn: trước khi tiến vào ô (3, 1) để kéo bè, đọc h = flow_dir(), nếu thấy dòng chảy ngược (if h == "back":) thì cần gọi flip_valve() tắt dòng, sau đó gọi tow_pair(1, n) để tiến 1 ô, tung lưới bắt bè và kéo lùi n ô vào bến. Hãy chế hàm shut_stream_tow(n) và gọi shut_stream_tow(2).',
      veMaMau: 'Trong shut_stream_tow(n), đọc h = flow_dir(), kiểm tra if h == "back": flip_valve(), rồi gọi tow_pair(1, n).',
      san: [
        [
          '##V#####',
          '#~~q~B~#',
          '########'
        ],
        [
          '##V#####',
          '#~~q~B~#',
          '########'
        ]
      ],
      dong: [
        [{ x: 3, y: 1, huong: 3, suc: 1 }],
        []
      ],
      noi: [
        [{ nut: { x: 2, y: 0 }, cong: [], dong: [{ x: 3, y: 1 }] }],
        [{ nut: { x: 2, y: 0 }, cong: [], dong: [] }]
      ],
      batDau: [{ x: 2, y: 1, huong: 1 }, { x: 2, y: 1, huong: 1 }],
      maMau: bai([
        'shut_stream_tow(2)'
      ]),
      loiGiai: bai([
        'shut_stream_tow(2)'
      ], { hamCuaEmMoi: [hShutStreamTow()] }),
      sao: { o: 23, nhip: 11 },
      loiGiaiKhac: {
        moTa: 'Dùng if not is_calm_front(): flip_valve() trong shut_stream_tow(n)',
        baiLam: bai([
          'shut_stream_tow(2)'
        ]),
        hamCuaEmMoi: [hShutStreamTow(['if not is_calm_front():', '    flip_valve()', 'tow_pair(1, n)'])]
      },
      loiSai: [
        { moTa: 'Quên gọi tow_pair(1, n) ở cuối hàm shut_stream_tow(n)', baiLam: bai(['shut_stream_tow(2)']), hamCuaEmMoi: [hShutStreamTow(['h = flow_dir()', 'if h == "back":', '    flip_valve()'])], phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Không tắt dòng ngược trước khi gọi tow_pair(1, n)', baiLam: bai(['shut_stream_tow(2)']), hamCuaEmMoi: [hShutStreamTow(['tow_pair(1, n)'])], phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Đọc h = flow_dir(); nếu h == "back" thì gọi flip_valve() để tắt dòng ở (3, 1).', 'Luna: Cuối hàm shut_stream_tow(n), gọi tow_pair(1, n) (ngoài khối if).']
    }),

    manCheCong({
      so: 5, ten: 'Chế hàm vào ngách gạt van rồi lùi ra valve_and_back(n)', hang: 'luyen',
      hamCuaEmCan: KHO_TRUOC.concat(['flip_valve', 'open_gate_pass', 'shut_stream_tow']),
      taoHam: ['valve_and_back'],
      deBai: 'Sola hướng dẫn: nhiều van V nằm sâu trong ngách nhỏ. Hãy chế hàm valve_and_back(n): tiến n ô bằng forward(n), gọi tow_grab() gạt van trước mũi, rồi lặp n lần lệnh back() để lùi về đúng ngã ba! Gọi valve_and_back(1) rồi pair_step("R", 3) tới Q.',
      veMaMau: 'Viết hàm valve_and_back(n) gồm forward(n), tow_grab() và vòng lặp n lần back().',
      san: [
        '##V####',
        '##~####',
        '#~~K~Q#',
        '#######'
      ],
      noi: [{ nut: { x: 2, y: 0 }, cong: [{ x: 3, y: 2 }], dong: [] }],
      batDau: { x: 2, y: 2, huong: 0 },
      maMau: bai([
        'valve_and_back(1)',
        'pair_step("R", 3)'
      ]),
      loiGiai: bai([
        'valve_and_back(1)',
        'pair_step("R", 3)'
      ], { hamCuaEmMoi: [hValveAndBack()] }),
      sao: { o: 24, nhip: 7 },
      loiGiaiKhac: {
        moTa: 'Dùng turn_right() và forward(3) sau valve_and_back(1)',
        baiLam: bai([
          'valve_and_back(1)',
          'turn_right()',
          'forward(3)'
        ]),
        hamCuaEmMoi: [hValveAndBack()]
      },
      loiSai: [
        { moTa: 'Quên lùi về trong valve_and_back(n) nên khi rẽ phải đâm bờ trong ngách', baiLam: bai(['valve_and_back(1)', 'pair_step("R", 3)']), hamCuaEmMoi: [hValveAndBack(['forward(n)', 'tow_grab()'])], phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Quên gọi tow_grab() trong valve_and_back(n) nên cống K vẫn đóng', baiLam: bai(['valve_and_back(1)', 'pair_step("R", 3)']), hamCuaEmMoi: [hValveAndBack(['forward(n)', 'for i in range(n):', '    back()'])], phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Luna: Trong valve_and_back(n), sau forward(n) và tow_grab(), hãy viết for i in range(n): back().', 'Luna: Nhờ lùi về (2, 2), lệnh pair_step("R", 3) đi thẳng qua cống (3, 2) tới Q.']
    }),

    manCheCong({
      so: 6, ten: 'Kết hợp valve_and_back(2) và tow_pair()', hang: 'luyen', mucTieu: 'dua-vat',
      hamCuaEmCan: KHO_TRUOC.concat(['flip_valve', 'open_gate_pass', 'shut_stream_tow', 'valve_and_back']),
      deBai: 'Sola nhờ bạn: xuồng đang ở ngã ba (2, 3) hướng lên ngách Bắc dài 2 ô dẫn tới van V ở (2, 0). Van này vừa mở cống K ở (3, 3) vừa tắt dòng chảy ngược ở (3, 3). Hãy gọi valve_and_back(2) để lên gạt van rồi lùi về (2, 3), quay phải (turn_right()), rồi gọi tow_pair(1, 1) đưa bè B ở (5, 3) vào bến q ở (4, 3)!',
      veMaMau: 'Gọi valve_and_back(2), turn_right() rồi tow_pair(1, 1).',
      san: [
        '##V####',
        '##~####',
        '##~####',
        '#~~KqB#',
        '#######'
      ],
      dong: [{ x: 3, y: 3, huong: 3, suc: 1 }],
      noi: [{ nut: { x: 2, y: 0 }, cong: [{ x: 3, y: 3 }], dong: [{ x: 3, y: 3 }] }],
      batDau: { x: 2, y: 3, huong: 0 },
      maMau: bai([
        'valve_and_back(2)'
      ]),
      loiGiai: bai([
        'valve_and_back(2)',
        'turn_right()',
        'tow_pair(1, 1)'
      ]),
      sao: { o: 24, nhip: 9 },
      loiGiaiKhac: {
        moTa: 'Dùng pair_step("R", 1) và tow_pair(0, 1) sau valve_and_back(2)',
        baiLam: bai([
          'valve_and_back(2)',
          'pair_step("R", 1)',
          'tow_pair(0, 1)'
        ])
      },
      loiSai: [
        { moTa: 'Mới gạt van lùi về mà chưa kéo bè tới bến', baiLam: bai(['valve_and_back(2)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên gọi turn_right() sau valve_and_back(2) nên xuồng lại đi lên ngách Bắc', baiLam: bai(['valve_and_back(2)', 'tow_pair(1, 1)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau valve_and_back(2), xuồng ở (2, 3) vẫn đang hướng lên Bắc.', 'Luna: Gọi turn_right() để hướng sang phải rồi gọi tow_pair(1, 1).']
    }),

    manCheCong({
      so: 7, ten: 'Sửa hàm gạt van quay nhầm hướng fix_gate_tow()', hang: 'bien-the',
      chinhCoDinh: true, mucTieu: 'dua-vat',
      hamCuaEmCan: KHO_TRUOC.concat(['flip_valve', 'open_gate_pass', 'shut_stream_tow', 'valve_and_back']),
      deBai: 'Sola phát hiện lỗi: chương trình chính gọi fix_gate_tow() để mở cống (3, 1) rồi gọi tow_pair(1, 1) đưa bè B vào bến q. Nhưng cuối hàm fix_gate_tow() lại gọi turn_left() thay vì turn_right(), làm xuồng quay ngược về bên trái! Hãy sửa lại dòng cuối của fix_gate_tow().',
      veMaMau: 'Chương trình chính đã khóa. Hãy đổi dòng cuối của fix_gate_tow() thành turn_right().',
      san: [
        '##V####',
        '#~~KqB#',
        '#######'
      ],
      noi: [{ nut: { x: 2, y: 0 }, cong: [{ x: 3, y: 1 }], dong: [] }],
      batDau: { x: 2, y: 1, huong: 1 },
      maMau: bai([
        'fix_gate_tow()',
        'tow_pair(1, 1)'
      ], { hamCuaMan: [hFixGateTow(T_FIX_GATE_SAI)] }),
      loiGiai: bai([
        'fix_gate_tow()',
        'tow_pair(1, 1)'
      ], { hamCuaMan: [hFixGateTow(T_FIX_GATE_DUNG)] }),
      sao: { o: 21, nhip: 6 },
      loiSai: [
        { moTa: 'Chưa sửa turn_left() cuối hàm nên xuồng đi ngược sang trái', baiLam: bai(['fix_gate_tow()', 'tow_pair(1, 1)'], { hamCuaMan: [hFixGateTow(T_FIX_GATE_SAI)] }), phaiCoMa: ['keo-hut', 'chua-dua-vat'] },
        { moTa: 'Xóa mất tow_grab() nên cửa cống K không mở', baiLam: bai(['fix_gate_tow()', 'tow_pair(1, 1)'], { hamCuaMan: [hFixGateTow(['turn_left()', 'turn_right()'])] }), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau khi turn_left() để nhìn lên van Bắc, cần turn_right() để quay lại hướng Đông.', 'Luna: Đổi dòng thứ ba của fix_gate_tow() từ turn_left() thành turn_right().']
    }),

    manCheCong({
      so: 8, ten: 'Chế hàm mở cống kéo lùi bè lock_rescue(n)', hang: 'bien-the', mucTieu: 'dua-vat',
      hamCuaEmCan: KHO_TRUOC.concat(['flip_valve', 'open_gate_pass', 'shut_stream_tow', 'valve_and_back']),
      taoHam: ['lock_rescue'],
      deBai: 'Sola hướng dẫn: để giải cứu chiếc bè bị kẹt sau cửa cống và kéo lùi về bến, hãy chế hàm lock_rescue(n) gồm 2 dòng: gọi open_gate_pass(1) để mở cống và tiến 1 ô tới bến (3, 1), rồi gọi pull_back(n) để tung lưới qua cống bắt bè và kéo lùi n ô về bến! Gọi lock_rescue(2).',
      veMaMau: 'Viết hàm lock_rescue(n) gồm open_gate_pass(1) và pull_back(n).',
      san: [
        '##V####',
        '#~~qKB#',
        '#######'
      ],
      noi: [{ nut: { x: 2, y: 0 }, cong: [{ x: 4, y: 1 }], dong: [] }],
      batDau: { x: 2, y: 1, huong: 1 },
      maMau: bai([
        'lock_rescue(2)'
      ]),
      loiGiai: bai([
        'lock_rescue(2)'
      ], { hamCuaEmMoi: [hLockRescue()] }),
      sao: { o: 25, nhip: 7 },
      loiGiaiKhac: {
        moTa: 'Gọi flip_valve(), move(), pull_back(n) trong lock_rescue(n)',
        baiLam: bai([
          'lock_rescue(2)'
        ]),
        hamCuaEmMoi: [hLockRescue(['flip_valve()', 'move()', 'pull_back(n)'])]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm lock_rescue(n)', baiLam: bai(['lock_rescue(2)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Truyền pull_back(1) thay vì pull_back(n) nên bè chưa lùi tới bến q', baiLam: bai(['lock_rescue(2)']), hamCuaEmMoi: [hLockRescue(['open_gate_pass(1)', 'pull_back(1)'])], phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: open_gate_pass(1) giúp mở cống (4, 1) và đưa xuồng tiến vào (3, 1).', 'Luna: Dòng thứ hai của lock_rescue(n) là pull_back(n).']
    }),

    manCheCong({
      so: 9, ten: 'Phối hợp open_gate_pass, flow_step và shut_stream_tow', hang: 'bien-the', mucTieu: 'dua-vat', nhipTheo: 'tong',
      hamCuaEmCan: KHO_TRUOC.concat(['flip_valve', 'open_gate_pass', 'shut_stream_tow', 'valve_and_back', 'lock_rescue']),
      deBai: 'Sola nhờ bạn: từ (1, 1), hãy gọi open_gate_pass(1) để mở cống (2, 1) và tiến vào (2, 1); tiếp theo gọi flow_step() để vượt 2 ô tới (4, 1); cuối cùng gọi shut_stream_tow(1) để kiểm tra tắt dòng ngược ở (5, 1) (nếu có) và đưa lục bình L ở (7, 1) vào bến q ở (6, 1)!',
      veMaMau: 'Ghép 3 hàm open_gate_pass(1), flow_step() và shut_stream_tow(1).',
      san: [
        [
          '#V##V####',
          '#~K~~~qL#',
          '#########'
        ],
        [
          '#V##V####',
          '#~K~~~qL#',
          '#########'
        ]
      ],
      dong: [
        [{ x: 3, y: 1, huong: 1, suc: 1 }],
        [{ x: 5, y: 1, huong: 3, suc: 1 }]
      ],
      noi: [
        [
          { nut: { x: 1, y: 0 }, cong: [{ x: 2, y: 1 }], dong: [] },
          { nut: { x: 4, y: 0 }, cong: [], dong: [] }
        ],
        [
          { nut: { x: 1, y: 0 }, cong: [{ x: 2, y: 1 }], dong: [] },
          { nut: { x: 4, y: 0 }, cong: [], dong: [{ x: 5, y: 1 }] }
        ]
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      maMau: bai([
        'open_gate_pass(1)'
      ]),
      loiGiai: bai([
        'open_gate_pass(1)',
        'flow_step()',
        'shut_stream_tow(1)'
      ]),
      sao: { o: 31, nhip: 20 },
      loiGiaiKhac: {
        moTa: 'Viết flip_valve(), move() thay cho open_gate_pass(1)',
        baiLam: bai([
          'flip_valve()',
          'move()',
          'flow_step()',
          'shut_stream_tow(1)'
        ])
      },
      loiSai: [
        { moTa: 'Thiếu shut_stream_tow(1) nên chưa đưa lục bình vào bến', baiLam: bai(['open_gate_pass(1)', 'flow_step()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Gọi tow_pair(1, 1) thay vì shut_stream_tow(1) nên ở sân 2 bị dòng ngược đẩy lùi', baiLam: bai(['open_gate_pass(1)', 'flow_step()', 'tow_pair(1, 1)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau open_gate_pass(1) và flow_step(), xuồng đứng tại (4, 1) ngay cạnh van thứ hai.', 'Luna: Gọi shut_stream_tow(1) để tự động tắt dòng ngược (nếu có) và đưa L vào bến.']
    }),

    manCheCong({
      so: 10, ten: 'Trùm: Vận hành âu thuyền kép', hang: 'trum', mucTieu: 'dua-vat', nhipTheo: 'tong',
      huyHieu: { ma: 'che-cong', ten: 'Huy hiệu Chế lệnh: điều tiết dòng' },
      hamCuaEmCan: KHO_TRUOC.concat(['flip_valve', 'open_gate_pass', 'shut_stream_tow', 'valve_and_back', 'lock_rescue']),
      deBai: 'Sola giao thử thách khép lại Gói 4: trên mỗi sân có 2 bè gỗ ở hai luồng kênh. Từ (1, 1), hãy gọi open_gate_pass(1), flow_step() và shut_stream_tow(1) để đưa bè 1 vào bến (6, 1) (xuồng lùi về (4, 1)). Sau đó chuyển xuống luồng kênh dưới bằng pair_step("R", 2) và turn_right(), rồi gọi tiếp shut_stream_tow(1) để đưa bè 2 vào bến (2, 3)!',
      veMaMau: 'Kết hợp open_gate_pass(1), flow_step(), shut_stream_tow(1), pair_step("R", 2), turn_right() và shut_stream_tow(1).',
      san: [
        [
          '#V##V####',
          '#~K~~~qB#',
          '#~~~~~~~#',
          '#Bq~~~~~#',
          '####V####'
        ],
        [
          '#V##V####',
          '#~K~~~qB#',
          '#~~~~~~~#',
          '#Bq~~~~~#',
          '####V####'
        ]
      ],
      dong: [
        [{ x: 3, y: 1, huong: 1, suc: 1 }, { x: 3, y: 3, huong: 1, suc: 1 }],
        [{ x: 5, y: 1, huong: 3, suc: 1 }]
      ],
      noi: [
        [
          { nut: { x: 1, y: 0 }, cong: [{ x: 2, y: 1 }], dong: [] },
          { nut: { x: 4, y: 0 }, cong: [], dong: [] },
          { nut: { x: 4, y: 4 }, cong: [], dong: [{ x: 3, y: 3 }] }
        ],
        [
          { nut: { x: 1, y: 0 }, cong: [{ x: 2, y: 1 }], dong: [] },
          { nut: { x: 4, y: 0 }, cong: [], dong: [{ x: 5, y: 1 }] },
          { nut: { x: 4, y: 4 }, cong: [], dong: [] }
        ]
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      maMau: bai([
        'open_gate_pass(1)',
        'flow_step()',
        'shut_stream_tow(1)'
      ]),
      loiGiai: bai([
        'open_gate_pass(1)',
        'flow_step()',
        'shut_stream_tow(1)',
        'pair_step("R", 2)',
        'turn_right()',
        'shut_stream_tow(1)'
      ]),
      sao: { o: 42, nhip: 39 },
      loiGiaiKhac: {
        moTa: 'Viết flip_valve(), move() ở đầu rồi thực hiện phần còn lại',
        baiLam: bai([
          'flip_valve()',
          'move()',
          'flow_step()',
          'shut_stream_tow(1)',
          'pair_step("R", 2)',
          'turn_right()',
          'shut_stream_tow(1)'
        ])
      },
      loiSai: [
        { moTa: 'Mới giải cứu bè 1 ở hàng 1, chưa xuống hàng 3 giải cứu bè 2', baiLam: bai(['open_gate_pass(1)', 'flow_step()', 'shut_stream_tow(1)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Ở hàng 3 quên gọi turn_right() trước shut_stream_tow(1)', baiLam: bai(['open_gate_pass(1)', 'flow_step()', 'shut_stream_tow(1)', 'pair_step("R", 2)', 'shut_stream_tow(1)']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau shut_stream_tow(1) đầu tiên, xuồng đang ở (4, 1) hướng sang phải.', 'Luna: Gọi pair_step("R", 2), turn_right() để xuống (4, 3) hướng sang Tây, rồi gọi shut_stream_tow(1).']
    })
  ];

  if (M && M.them) M.manCongThuyLoi = DS;
  if (typeof module !== 'undefined' && module.exports) module.exports = M;
})();
