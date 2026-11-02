/* ============================================================================
   man-tha-neo.js — Mùa 5 (Bến sông) · Gói 5: Nâng cấp thân Mỏ neo chống trôi
   Chương 1: tha-neo (10 màn) — Thả neo giữ nhịp
   Chương 2: che-tha-neo (10 màn) — Chế lệnh: neo giữa dòng xiết
   ========================================================================== */
(function () {
  'use strict';

  var M = (typeof window !== 'undefined' && window.ManHoc) ||
    (typeof require === 'function' ? require('./man-chuoi-1.js') : null);

  var GOC_NEO = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'cast_net', 'drop_net', 'flow_dir', 'anchor', 'unanchor'];
  var ROBOT_NEO = { than: 'xuong', tay: 'day-keo', camBien: [{ ma: 'dong-chay', o: 'tren' }] };
  var CAU_TRUC = ['for', 'if', 'while', 'list', 'def', 'return', 'tuple'];

  var KHO_TRUOC = [
    'move', 'turn_left', 'turn_right', 'u_turn', 'back', 'forward',
    'span_dist', 'round_steps', 'calm_bonus', 'turn_code', 'sail_to',
    'tow_grab', 'tow_drop', 'pull_back', 'pair_step', 'tow_pair',
    'is_calm_front', 'flow_step', 'scan_calm_side', 'tow_in_calm', 'pick_calm_lane',
    'flip_valve', 'open_gate_pass', 'shut_stream_tow', 'valve_and_back', 'lock_rescue'
  ];

  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function bai(chinh, phu) {
    var kq = { chinh: chinh.slice(), hamCuaMan: [], hamCuaEmMoi: [] };
    if (phu && phu.hamCuaMan) kq.hamCuaMan = phu.hamCuaMan;
    if (phu && phu.hamCuaEmMoi) kq.hamCuaEmMoi = phu.hamCuaEmMoi;
    return kq;
  }

  var T_DROP_ANCHOR = ['anchor()', 'wait()'];
  var T_LIFT_ANCHOR = ['unanchor()', 'wait()'];
  var T_ANCHOR_WAIT = ['drop_anchor()', 'for i in range(n):', '    wait()', 'lift_anchor()'];
  var T_ANCHOR_TOW = ['drop_anchor()', 'tow_grab()', 'lift_anchor()'];
  var T_HOLD_AND_VALVE = ['drop_anchor()', 'for i in range(n):', '    wait()', 'tow_grab()', 'lift_anchor()'];
  var T_FIX_ANCHOR_SAI = ['drop_anchor()', 'tow_grab()'];
  var T_FIX_ANCHOR_DUNG = ['drop_anchor()', 'tow_grab()', 'lift_anchor()'];

  function hDropAnchor(than) { return H('drop_anchor', [], than || T_DROP_ANCHOR); }
  function hLiftAnchor(than) { return H('lift_anchor', [], than || T_LIFT_ANCHOR); }
  function hAnchorWait(than) { return H('anchor_wait', ['n'], than || T_ANCHOR_WAIT); }
  function hAnchorTow(than) { return H('anchor_tow', [], than || T_ANCHOR_TOW); }
  function hHoldAndValve(than) { return H('hold_and_valve', ['n'], than || T_HOLD_AND_VALVE); }
  function hFixAnchorTow(than) { return H('fix_anchor_tow', [], than || T_FIX_ANCHOR_DUNG); }

  function manThaNeo(cfg) {
    return Object.assign({
      chuong: 'tha-neo',
      loaiRobot: 'xuong',
      robot: ROBOT_NEO,
      vo: 'song',
      hamGoc: GOC_NEO.slice(),
      bienDem: true,
      cauTruc: CAU_TRUC,
      khung: { chinh: 10, moiHam: 10, cauTruc: CAU_TRUC },
      mucTieu: 'dua-vat',
      hamCuaEmCan: KHO_TRUOC.slice(),
      taoHam: []
    }, cfg);
  }

  function manCheThaNeo(cfg) {
    return Object.assign({
      chuong: 'che-tha-neo',
      loaiRobot: 'xuong',
      robot: ROBOT_NEO,
      vo: 'song',
      hamGoc: GOC_NEO.slice(),
      bienDem: true,
      cauTruc: CAU_TRUC,
      khung: { chinh: 10, moiHam: 10, cauTruc: CAU_TRUC },
      mucTieu: 'dua-vat',
      hamCuaEmCan: KHO_TRUOC.slice(),
      taoHam: []
    }, cfg);
  }

  var DS = [
    /* ========================================================================
       CHƯƠNG 1: tha-neo (10 màn) — Thả neo giữ nhịp
       ======================================================================== */
    manThaNeo({
      so: 1, ten: 'Thử thả neo chờ bè trôi tới', hang: 'lam-quen',
      chiChay: true, chinhCoDinh: true,
      deBai: 'Sola làm mẫu: xuồng đứng ở (1, 1) trên ô dòng chảy đẩy xuống Nam, còn bè B ở (4, 1) đang trôi về phía Tây. Nhờ gọi anchor() rồi wait(), mỏ neo giữ chặt xuồng tại (1, 1) chờ B trôi vào tầm lưới (3, 1). Sau khi bắt bè bằng tow_grab(), xuồng gọi unanchor() và wait() để dòng đẩy xuống luồng êm hàng 2 rồi tiến 4 ô kéo bè vào bến q ở (3, 2)! Bấm Chạy để xem.',
      veMaMau: 'Chương trình mẫu đã khóa. Bấm Chạy để quan sát anchor() và unanchor() giữ nhịp trên dòng chảy.',
      san: [
        '########',
        '#~~~B~~#',
        '#~~q~~~#',
        '########'
      ],
      dong: [{ x: 1, y: 1, huong: 2, suc: 1 }, { x: 4, y: 1, huong: 3, suc: 1 }],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['anchor()', 'wait()', 'tow_grab()', 'unanchor()', 'wait()', 'forward(4)']),
      loiGiai: bai(['anchor()', 'wait()', 'tow_grab()', 'unanchor()', 'wait()', 'forward(4)']),
      sao: { o: 13, nhip: 7 },
      loiGiaiKhac: {
        moTa: 'Dùng cast_net() và wait() trực tiếp thay cho tow_grab()',
        baiLam: bai(['anchor()', 'wait()', 'cast_net()', 'wait()', 'unanchor()', 'wait()', 'forward(4)'])
      },
      loiSai: [],
      goiY: ['Luna: Bấm nút Chạy để xem mỏ neo giữ xuồng đứng yên trên dòng chảy.', 'Luna: Trước khi chạy chân vịt, xuồng luôn phải nhổ neo bằng unanchor() và wait().']
    }),

    manThaNeo({
      so: 2, ten: 'Thả neo đón lục bình trôi ngang', hang: 'lam-quen',
      deBai: 'Sola hướng dẫn: đám lục bình L ở (3, 1) đang trôi từ nhánh Bắc xuống ngã ba (3, 2). Xuồng đang ở (1, 2) trên dòng chảy hướng Nam. Hãy gọi anchor(), wait() để giữ vị trí chờ L trôi xuống (3, 2); gọi tow_grab() tung lưới bắt L; rồi gọi unanchor(), wait() để dòng đưa xuồng xuống hàng 3 và tiến 3 ô kéo L tới bến q ở (2, 3).',
      veMaMau: 'Gọi anchor(), wait(), tow_grab(), rồi nhổ neo bằng unanchor(), wait() và forward(3).',
      san: [
        '#######',
        '###L###',
        '#~~~~~#',
        '#~q~~~#',
        '#######'
      ],
      dong: [{ x: 1, y: 2, huong: 2, suc: 1 }, { x: 3, y: 1, huong: 2, suc: 1 }, { x: 3, y: 2, huong: 2, suc: 1 }],
      batDau: { x: 1, y: 2, huong: 1 },
      maMau: bai(['anchor()', 'wait()', 'tow_grab()']),
      loiGiai: bai(['anchor()', 'wait()', 'tow_grab()', 'unanchor()', 'wait()', 'forward(3)']),
      sao: { o: 13, nhip: 6 },
      loiGiaiKhac: {
        moTa: 'Viết cast_net(), wait() rồi nhổ neo và tiến 3 ô',
        baiLam: bai(['anchor()', 'wait()', 'cast_net()', 'wait()', 'unanchor()', 'wait()', 'forward(3)'])
      },
      loiSai: [
        { moTa: 'Mới bắt lục bình mà chưa nhổ neo và kéo vào bến', baiLam: bai(['anchor()', 'wait()', 'tow_grab()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Gọi forward(3) khi đang thả neo nên bị báo lỗi dang-neo', baiLam: bai(['anchor()', 'wait()', 'tow_grab()', 'forward(3)']), phaiCoMa: ['dang-neo', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau tow_grab(), hãy gọi unanchor() và wait() để nhổ neo.', 'Luna: Khi nhổ neo, dòng ở (1, 2) đẩy xuồng xuống hàng 3, chỉ cần thêm forward(3).']
    }),

    manThaNeo({
      so: 3, ten: 'Nhổ neo để dòng đẩy lùi vào bến', hang: 'lam-quen',
      deBai: 'Sola chỉ bạn: xuồng đang ở (3, 1) hướng sang Đông, ngay trên dòng chảy ngược về Tây, còn bè B ở (6, 1) cũng đang trôi về Tây. Hãy gọi anchor(), wait() để giữ xuồng tại (3, 1) chờ B trôi vào (5, 1); gọi tow_grab() bắt B; sau đó gọi unanchor(), wait() để dòng đẩy cả cụm lùi 1 ô và gọi back() đưa B vào bến q ở (3, 1)!',
      veMaMau: 'Thả neo chờ 1 nhịp, gọi tow_grab(), nhổ neo bằng unanchor(), wait() rồi gọi back().',
      san: [
        '#########',
        '#~~q~~B~#',
        '#########'
      ],
      dong: [{ x: 3, y: 1, huong: 3, suc: 1 }, { x: 6, y: 1, huong: 3, suc: 1 }],
      batDau: { x: 3, y: 1, huong: 1 },
      maMau: bai(['anchor()', 'wait()']),
      loiGiai: bai(['anchor()', 'wait()', 'tow_grab()', 'unanchor()', 'wait()', 'back()']),
      sao: { o: 11, nhip: 4 },
      loiGiaiKhac: {
        moTa: 'Dùng cast_net(), wait() thay cho tow_grab()',
        baiLam: bai(['anchor()', 'wait()', 'cast_net()', 'wait()', 'unanchor()', 'wait()', 'back()'])
      },
      loiSai: [
        { moTa: 'Quên gọi tow_grab() và nhổ neo sau khi thả neo', baiLam: bai(['anchor()', 'wait()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên gọi anchor() nên nhịp đầu xuồng bị đẩy lùi về (2, 1) làm lưới không tới bè', baiLam: bai(['wait()', 'tow_grab()', 'back()']), phaiCoMa: ['keo-hut', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau anchor() và wait(), bè B đã trôi tới (5, 1) cách mũi xuồng đúng 2 ô.', 'Luna: Gọi tow_grab(), rồi unanchor(), wait() và back() để kéo bè vào bến (3, 1).']
    }),

    manThaNeo({
      so: 4, ten: 'Neo giữ nhịp chờ hai nhịp nước', hang: 'lam-quen',
      deBai: 'Sola lưu ý: một khi đã thả neo bằng anchor(), mỏ neo sẽ giữ chặt xuồng qua nhiều nhịp wait() liên tiếp cho tới khi gọi unanchor(). Bè B ở (6, 1) cần 2 nhịp trôi mới vào tới (4, 1) (tầm lưới từ xuồng ở (2, 1)). Hãy gọi anchor(), chờ 2 nhịp wait(), gọi tow_grab(), rồi nhổ neo bằng unanchor(), wait() và tiến 3 ô kéo B tới q ở (3, 2)!',
      veMaMau: 'Gọi anchor(), hai lần wait(), tow_grab(), unanchor(), wait() rồi forward(3).',
      san: [
        '#########',
        '#~~~~~B~#',
        '#~~q~~~~#',
        '#########'
      ],
      dong: [{ x: 2, y: 1, huong: 2, suc: 1 }, { x: 6, y: 1, huong: 3, suc: 1 }, { x: 5, y: 1, huong: 3, suc: 1 }, { x: 4, y: 1, huong: 2, suc: 1 }],
      batDau: { x: 2, y: 1, huong: 1 },
      maMau: bai(['anchor()', 'wait()', 'wait()']),
      loiGiai: bai(['anchor()', 'wait()', 'wait()', 'tow_grab()', 'unanchor()', 'wait()', 'forward(3)']),
      sao: { o: 14, nhip: 7 },
      loiGiaiKhac: {
        moTa: 'Dùng vòng lặp for i in range(2): wait() sau anchor()',
        baiLam: bai(['anchor()', 'for i in range(2):', '    wait()', 'tow_grab()', 'unanchor()', 'wait()', 'forward(3)'])
      },
      loiSai: [
        { moTa: 'Chỉ chờ 1 nhịp wait() nên bè B mới ở (5, 1), ngoài tầm lưới 2 ô', baiLam: bai(['anchor()', 'wait()', 'tow_grab()', 'unanchor()', 'wait()', 'forward(3)']), phaiCoMa: ['keo-hut', 'chua-dua-vat'] },
        { moTa: 'Chờ xong nhưng chưa gọi tow_grab(), unanchor(), wait(), forward(3)', baiLam: bai(['anchor()', 'wait()', 'wait()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau 2 nhịp wait() khi đang neo, bè B đã trôi từ (6, 1) qua (5, 1) tới (4, 1).', 'Luna: Gọi tiếp tow_grab(), unanchor(), wait() và forward(3).']
    }),

    manThaNeo({
      so: 5, ten: 'Vòng lặp chờ bè trôi xa', hang: 'luyen',
      deBai: 'Sola thử thách: đám lục bình L ở tận (7, 1) cần 3 nhịp trôi mới về tới (4, 1). Hãy gọi anchor(), dùng vòng lặp for i in range(3): wait() để giữ xuồng tại (2, 1) suốt 3 nhịp, sau đó gọi tow_grab(), nhổ neo bằng unanchor(), wait() rồi gọi forward(3) đưa L vào bến q ở (3, 2)!',
      veMaMau: 'Dùng anchor(), for i in range(3): wait(), tow_grab(), unanchor(), wait() và forward(3).',
      san: [
        '##########',
        '#~~~~~~L~#',
        '#~~q~~~~~#',
        '##########'
      ],
      dong: [{ x: 2, y: 1, huong: 2, suc: 1 }, { x: 7, y: 1, huong: 3, suc: 1 }, { x: 6, y: 1, huong: 3, suc: 1 }, { x: 5, y: 1, huong: 3, suc: 1 }, { x: 4, y: 1, huong: 2, suc: 1 }],
      batDau: { x: 2, y: 1, huong: 1 },
      maMau: bai(['anchor()', 'for i in range(3):', '    wait()']),
      loiGiai: bai(['anchor()', 'for i in range(3):', '    wait()', 'tow_grab()', 'unanchor()', 'wait()', 'forward(3)']),
      sao: { o: 14, nhip: 8 },
      loiGiaiKhac: {
        moTa: 'Gọi move() ba lần ở cuối thay cho forward(3)',
        baiLam: bai(['anchor()', 'for i in range(3):', '    wait()', 'tow_grab()', 'unanchor()', 'wait()', 'move()', 'move()', 'move()'])
      },
      loiSai: [
        { moTa: 'Mới chờ 3 nhịp mà chưa kéo lục bình và nhổ neo', baiLam: bai(['anchor()', 'for i in range(3):', '    wait()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Chỉ lặp range(2) nên lục bình chưa trôi tới tầm lưới', baiLam: bai(['anchor()', 'for i in range(2):', '    wait()', 'tow_grab()', 'unanchor()', 'wait()', 'forward(3)']), phaiCoMa: ['keo-hut', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Lệnh wait() đầu tiên trong vòng lặp for sẽ thực thi lệnh anchor() vừa gọi.', 'Luna: Sau vòng lặp for, thêm tow_grab(), unanchor(), wait() và forward(3).']
    }),

    manThaNeo({
      so: 6, ten: 'Neo giữ vị trí chờ gạt van cống', hang: 'luyen', mucTieu: 'toi-co',
      deBai: 'Sola hướng dẫn: xuồng ở (1, 1) đang hướng lên van V ở (1, 0). Trên kênh Đông, bè B ở (3, 1) đang chắn đường nhưng dòng chảy sẽ đẩy B qua (4, 1) rồi tụt xuống hốc (4, 2) sau 2 nhịp! Nếu gạt van V quá sớm, dòng tắt khi B còn chắn ngang kênh. Hãy gọi anchor(), chờ 2 nhịp wait() cho B trôi xuống (4, 2), rồi gọi tow_grab() gạt van V (mở cống K và tắt dòng), nhổ neo bằng unanchor(), wait() và gọi pair_step("R", 4) tới Q!',
      veMaMau: 'Gọi anchor(), chờ 2 nhịp wait(), gọi tow_grab() gạt van V, rồi unanchor(), wait() và pair_step("R", 4).',
      san: [
        '#V#####',
        '#~KB~Q#',
        '#~~~~##',
        '#######'
      ],
      dong: [{ x: 1, y: 1, huong: 2, suc: 1 }, { x: 3, y: 1, huong: 1, suc: 1 }, { x: 4, y: 1, huong: 2, suc: 1 }],
      noi: [{ nut: { x: 1, y: 0 }, cong: [{ x: 2, y: 1 }], dong: [{ x: 1, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 }] }],
      batDau: { x: 1, y: 1, huong: 0 },
      maMau: bai(['anchor()', 'wait()', 'wait()', 'tow_grab()']),
      loiGiai: bai(['anchor()', 'wait()', 'wait()', 'tow_grab()', 'unanchor()', 'wait()', 'pair_step("R", 4)']),
      sao: { o: 22, nhip: 9 },
      loiGiaiKhac: {
        moTa: 'Dùng turn_right() và forward(4) sau khi nhổ neo',
        baiLam: bai(['anchor()', 'wait()', 'wait()', 'tow_grab()', 'unanchor()', 'wait()', 'turn_right()', 'forward(4)'])
      },
      loiSai: [
        { moTa: 'Gạt van ngay ở nhịp 1 nên bè B dừng lại giữa kênh chắn lối đi', baiLam: bai(['tow_grab()', 'pair_step("R", 4)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Quên nhổ neo trước khi gọi pair_step("R", 4)', baiLam: bai(['anchor()', 'wait()', 'wait()', 'tow_grab()', 'pair_step("R", 4)']), phaiCoMa: ['dang-neo', 'chua-toi-co'] }
      ],
      goiY: ['Luna: Khi đang neo, bạn vẫn bắn dây phao tow_grab() vào van V được nhưng không thể quay mũi.', 'Luna: Sau tow_grab(), dòng ở (1, 1) đã tắt; hãy gọi unanchor(), wait() rồi pair_step("R", 4).']
    }),

    manThaNeo({
      so: 7, ten: 'Đọc dòng trước mũi để quyết định chờ thêm', hang: 'bien-the', nhipTheo: 'tong',
      deBai: 'Sola thử thách trên 2 sân: từ (1, 1), hãy gọi anchor() và wait() trước. Sau nhịp đầu, nếu ô trước mũi (2, 1) vẫn có dòng chảy ngược (if flow_dir() == "back":) tức là bè B xuất phát từ xa (5, 1), hãy gọi thêm 1 lệnh wait() nữa! Cuối cùng gọi tow_grab(), unanchor(), wait() và forward(3) đưa bè tới bến q ở (2, 2).',
      veMaMau: 'Sau anchor() và wait(), kiểm tra if flow_dir() == "back": wait(), rồi tow_grab(), unanchor(), wait(), forward(3).',
      san: [
        [
          '########',
          '#~~~~B~#',
          '#~q~~~~#',
          '########'
        ],
        [
          '########',
          '#~~~B~~#',
          '#~q~~~~#',
          '########'
        ]
      ],
      dong: [
        [{ x: 1, y: 1, huong: 2, suc: 1 }, { x: 2, y: 1, huong: 3, suc: 1 }, { x: 5, y: 1, huong: 3, suc: 1 }, { x: 4, y: 1, huong: 3, suc: 1 }, { x: 3, y: 1, huong: 2, suc: 1 }],
        [{ x: 1, y: 1, huong: 2, suc: 1 }, { x: 4, y: 1, huong: 3, suc: 1 }, { x: 3, y: 1, huong: 2, suc: 1 }]
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      maMau: bai(['anchor()', 'wait()', 'if flow_dir() == "back":', '    wait()']),
      loiGiai: bai(['anchor()', 'wait()', 'if flow_dir() == "back":', '    wait()', 'tow_grab()', 'unanchor()', 'wait()', 'forward(3)']),
      sao: { o: 15, nhip: 13 },
      loiGiaiKhac: {
        moTa: 'Dùng if not is_calm_front(): wait() thay cho so sánh chuỗi "back"',
        baiLam: bai(['anchor()', 'wait()', 'if not is_calm_front():', '    wait()', 'tow_grab()', 'unanchor()', 'wait()', 'forward(3)'])
      },
      loiSai: [
        { moTa: 'Không chờ thêm ở sân 1 nên bè B chưa vào tầm lưới 2 ô', baiLam: bai(['anchor()', 'wait()', 'tow_grab()', 'unanchor()', 'wait()', 'forward(3)']), phaiCoMa: ['keo-hut', 'chua-dua-vat'] },
        { moTa: 'Chờ cứng 2 nhịp ở cả hai sân nên ở sân 2 bè B trôi tuột xuống hàng 2 mất', baiLam: bai(['anchor()', 'wait()', 'wait()', 'tow_grab()', 'unanchor()', 'wait()', 'forward(3)']), phaiCoMa: ['keo-hut', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Ở sân 1, ô (2, 1) có dòng ngược ("back") báo hiệu bè ở xa cần thêm 1 nhịp wait().', 'Luna: Sau khối if, gọi tow_grab(), unanchor(), wait() và forward(3).']
    }),

    manThaNeo({
      so: 8, ten: 'Gạt van giữ bè ở ngã tư rồi kéo về bến', hang: 'bien-the',
      deBai: 'Sola chỉ điểm: bè B ở hốc Bắc (5, 1) đang trôi xuống ngã tư (5, 2). Nếu không tắt dòng ở (5, 2) kịp lúc, nhịp sau B sẽ trôi tuột xuống hốc Nam (5, 3)! Xuồng ở (1, 2) đang nhìn lên van V ở (1, 1). Hãy gọi anchor(), wait() để B trôi vừa tới (5, 2); lập tức gọi tow_grab() gạt van V (mở cống K và tắt mọi dòng chảy để giữ B đứng yên tại (5, 2)); sau đó nhổ neo bằng unanchor(), wait(), quay phải (turn_right()) và gọi tow_pair(2, 1) đưa B vào bến q ở (4, 2)!',
      veMaMau: 'Gọi anchor(), wait(), tow_grab() vào van V, rồi unanchor(), wait(), turn_right() và tow_pair(2, 1).',
      san: [
        '########',
        '#V###B##',
        '#~K~q~~#',
        '#~###~##',
        '########'
      ],
      dong: [{ x: 1, y: 2, huong: 2, suc: 1 }, { x: 5, y: 1, huong: 2, suc: 1 }, { x: 5, y: 2, huong: 2, suc: 1 }],
      noi: [{ nut: { x: 1, y: 1 }, cong: [{ x: 2, y: 2 }], dong: [{ x: 1, y: 2 }, { x: 5, y: 1 }, { x: 5, y: 2 }] }],
      batDau: { x: 1, y: 2, huong: 0 },
      maMau: bai(['anchor()', 'wait()', 'tow_grab()', 'unanchor()', 'wait()']),
      loiGiai: bai(['anchor()', 'wait()', 'tow_grab()', 'unanchor()', 'wait()', 'turn_right()', 'tow_pair(2, 1)']),
      sao: { o: 21, nhip: 8 },
      loiGiaiKhac: {
        moTa: 'Dùng pair_step("R", 2) và tow_pair(0, 1) sau khi nhổ neo',
        baiLam: bai(['anchor()', 'wait()', 'tow_grab()', 'unanchor()', 'wait()', 'pair_step("R", 2)', 'tow_pair(0, 1)'])
      },
      loiSai: [
        { moTa: 'Gạt van ngay từ đầu nên bè B bị kẹt lại trong hốc Bắc (5, 1)', baiLam: bai(['tow_grab()', 'turn_right()', 'tow_pair(2, 1)']), phaiCoMa: ['keo-hut', 'chua-dua-vat'] },
        { moTa: 'Chưa quay phải và gọi tow_pair(2, 1) sau khi nhổ neo', baiLam: bai(['anchor()', 'wait()', 'tow_grab()', 'unanchor()', 'wait()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau anchor(), wait() và tow_grab(), bè B đã dừng ngay tại (5, 2) và cống (2, 2) đã mở.', 'Luna: Sau unanchor() và wait(), thêm turn_right() và tow_pair(2, 1).']
    }),

    manThaNeo({
      so: 9, ten: 'Thả neo đón lục bình rồi vượt dòng thuận', hang: 'bien-the', nhipTheo: 'tong',
      deBai: 'Sola nhờ bạn phối hợp trên 2 sân: từ (1, 1), hãy gọi anchor(), wait() để giữ xuồng chờ lục bình L ở (4, 1) trôi về (3, 1); gọi tow_grab() tung lưới bắt L; rồi gọi unanchor(), wait() để dòng ở (1, 1) đưa xuồng xuống hàng 2 tại (1, 2). Cuối cùng gọi hai lần flow_step() để vượt qua đoạn nước êm hoặc dòng thuận trên hàng 2 và kéo L vào bến q ở (3, 2)!',
      veMaMau: 'Gọi anchor(), wait(), tow_grab(), unanchor(), wait() rồi hai lần flow_step().',
      san: [
        [
          '########',
          '#~~~L~~#',
          '#~~q~~~#',
          '########'
        ],
        [
          '########',
          '#~~~L~~#',
          '#~~q~~~#',
          '########'
        ]
      ],
      dong: [
        [{ x: 1, y: 1, huong: 2, suc: 1 }, { x: 4, y: 1, huong: 3, suc: 1 }, { x: 2, y: 2, huong: 1, suc: 1 }],
        [{ x: 1, y: 1, huong: 2, suc: 1 }, { x: 4, y: 1, huong: 3, suc: 1 }, { x: 4, y: 2, huong: 1, suc: 1 }]
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      maMau: bai(['anchor()', 'wait()', 'tow_grab()', 'unanchor()', 'wait()']),
      loiGiai: bai(['anchor()', 'wait()', 'tow_grab()', 'unanchor()', 'wait()', 'flow_step()', 'flow_step()']),
      sao: { o: 18, nhip: 12 },
      loiGiaiKhac: {
        moTa: 'Dùng cast_net(), wait() rồi nhổ neo và gọi hai lần flow_step()',
        baiLam: bai(['anchor()', 'wait()', 'cast_net()', 'wait()', 'unanchor()', 'wait()', 'flow_step()', 'flow_step()'])
      },
      loiSai: [
        { moTa: 'Quên gọi anchor() ở đầu nên xuồng trôi xuống hàng 2 trước khi bắt lục bình', baiLam: bai(['wait()', 'tow_grab()', 'flow_step()', 'flow_step()']), phaiCoMa: ['keo-hut', 'chua-dua-vat'] },
        { moTa: 'Mới nhổ neo xuống hàng 2 mà chưa gọi flow_step() để đưa L về bến', baiLam: bai(['anchor()', 'wait()', 'tow_grab()', 'unanchor()', 'wait()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau unanchor() và wait(), xuồng ở (1, 2) còn L đi theo dây lưới.', 'Luna: Gọi tiếp hai lần flow_step() để xuồng tiến 4 ô tới (5, 2), kéo L vào bến (3, 2) trên cả 2 sân.']
    }),

    manThaNeo({
      so: 10, ten: 'Trùm: Giữ nhịp neo trên bến sông đôi', hang: 'trum', nhipTheo: 'tong',
      huyHieu: { ma: 'tha-neo', ten: 'Huy hiệu Thả neo giữ nhịp' },
      deBai: 'Sola giao thử thách Trùm chương 1 trên 2 sân: xuồng ở (1, 3) hướng lên van V ở (1, 0). Hãy gọi anchor() và wait() trước; nếu thấy ô trước mũi (1, 2) có dòng chảy (if flow_dir() == "front":) báo hiệu bè B xuất phát từ xa (7, 1), hãy gọi thêm 1 lệnh wait() nữa! Khi B đã xuống đúng ngã tư (7, 3), gọi tow_grab() gạt van V (mở cống K ở (2, 3) và tắt dòng giữ B lại), rồi gọi unanchor(), wait(), pair_step("R", 1), flow_step() để tiến tới (4, 3), và gọi tow_pair(1, 1) đưa B vào bến q ở (6, 3)!',
      veMaMau: 'Kết hợp anchor(), wait(), if flow_dir() == "front": wait(), tow_grab(), unanchor(), wait(), pair_step("R", 1), flow_step() và tow_pair(1, 1).',
      san: [
        [
          '#V########',
          '#~#####B##',
          '#~#####~##',
          '#~K~~~q~~#',
          '#~#####~##',
          '##########'
        ],
        [
          '#V########',
          '#~########',
          '#~#####B##',
          '#~K~~~q~~#',
          '#~#####~##',
          '##########'
        ]
      ],
      dong: [
        [
          { x: 1, y: 3, huong: 2, suc: 1 },
          { x: 1, y: 2, huong: 0, suc: 1 },
          { x: 7, y: 1, huong: 2, suc: 1 },
          { x: 7, y: 2, huong: 2, suc: 1 },
          { x: 7, y: 3, huong: 2, suc: 1 },
          { x: 3, y: 3, huong: 1, suc: 1 }
        ],
        [
          { x: 1, y: 3, huong: 2, suc: 1 },
          { x: 7, y: 2, huong: 2, suc: 1 },
          { x: 7, y: 3, huong: 2, suc: 1 }
        ]
      ],
      noi: [
        [{ nut: { x: 1, y: 0 }, cong: [{ x: 2, y: 3 }], dong: [{ x: 1, y: 3 }, { x: 1, y: 2 }, { x: 7, y: 1 }, { x: 7, y: 2 }, { x: 7, y: 3 }] }],
        [{ nut: { x: 1, y: 0 }, cong: [{ x: 2, y: 3 }], dong: [{ x: 1, y: 3 }, { x: 7, y: 2 }, { x: 7, y: 3 }] }]
      ],
      batDau: [{ x: 1, y: 3, huong: 0 }, { x: 1, y: 3, huong: 0 }],
      maMau: bai([
        'anchor()',
        'wait()',
        'if flow_dir() == "front":',
        '    wait()',
        'tow_grab()'
      ]),
      loiGiai: bai([
        'anchor()',
        'wait()',
        'if flow_dir() == "front":',
        '    wait()',
        'tow_grab()',
        'unanchor()',
        'wait()',
        'pair_step("R", 1)',
        'flow_step()',
        'tow_pair(1, 1)'
      ]),
      sao: { o: 34, nhip: 20 },
      loiGiaiKhac: {
        moTa: 'Dùng if not is_calm_front(): wait() thay cho if flow_dir() == "front": wait()',
        baiLam: bai([
          'anchor()',
          'wait()',
          'if not is_calm_front():',
          '    wait()',
          'tow_grab()',
          'unanchor()',
          'wait()',
          'pair_step("R", 1)',
          'flow_step()',
          'tow_pair(1, 1)'
        ])
      },
      loiSai: [
        { moTa: 'Không kiểm tra dòng chảy để chờ thêm 1 nhịp ở sân 1 nên bè B chưa xuống tới ngã tư', baiLam: bai(['anchor()', 'wait()', 'tow_grab()', 'unanchor()', 'wait()', 'pair_step("R", 1)', 'flow_step()', 'tow_pair(1, 1)']), phaiCoMa: ['keo-hut', 'chua-dua-vat'] },
        { moTa: 'Quên gọi unanchor(), wait() trước khi quay phải', baiLam: bai(['anchor()', 'wait()', 'if flow_dir() == "front":', '    wait()', 'tow_grab()', 'pair_step("R", 1)', 'flow_step()', 'tow_pair(1, 1)']), phaiCoMa: ['dang-neo', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau tow_grab(), bè B đã dừng ngay tại (7, 3) trên cả 2 sân và cống (2, 3) đã mở.', 'Luna: Gọi unanchor(), wait(), pair_step("R", 1), flow_step() và tow_pair(1, 1) để đưa B tới bến (6, 3).']
    }),

    /* ========================================================================
       CHƯƠNG 2: che-tha-neo (10 màn) — Chế lệnh: neo giữa dòng xiết
       ======================================================================== */
    manCheThaNeo({
      so: 1, ten: 'Chế hàm thả neo drop_anchor()', hang: 'lam-quen',
      taoHam: ['drop_anchor'],
      deBai: 'Sola hướng dẫn: lệnh gốc anchor() luôn phải đi kèm wait() để mỏ neo kịp cắm xuống đáy sông. Hãy đóng gói cặp lệnh anchor(), wait() thành hàm drop_anchor(), rồi dùng nó giữ xuồng tại (1, 1) chờ bè B trôi vào tầm lưới!',
      veMaMau: 'Viết hàm drop_anchor() gồm 2 dòng: anchor() và wait().',
      san: [
        '########',
        '#~~~B~~#',
        '#~q~~~~#',
        '########'
      ],
      dong: [{ x: 1, y: 1, huong: 2, suc: 1 }, { x: 4, y: 1, huong: 3, suc: 1 }],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['drop_anchor()', 'tow_grab()', 'unanchor()', 'wait()', 'forward(3)']),
      loiGiai: bai(['drop_anchor()', 'tow_grab()', 'unanchor()', 'wait()', 'forward(3)'], { hamCuaEmMoi: [hDropAnchor()] }),
      sao: { o: 14, nhip: 6 },
      loiGiaiKhac: {
        moTa: 'Gọi move() ba lần thay cho forward(3)',
        baiLam: bai(['drop_anchor()', 'tow_grab()', 'unanchor()', 'wait()', 'move()', 'move()', 'move()']),
        hamCuaEmMoi: [hDropAnchor()]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm drop_anchor()', baiLam: bai(['drop_anchor()', 'tow_grab()', 'unanchor()', 'wait()', 'forward(3)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên gọi wait() trong drop_anchor() nên tung lưới ngay ở nhịp 1 khi bè chưa trôi tới', baiLam: bai(['drop_anchor()', 'tow_grab()', 'unanchor()', 'wait()', 'forward(3)']), hamCuaEmMoi: [hDropAnchor(['anchor()'])], phaiCoMa: ['keo-hut', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Thân hàm drop_anchor() chỉ gồm 2 dòng: anchor() rồi wait().', 'Luna: Chương trình chính đã gọi sẵn drop_anchor(), tow_grab(), unanchor(), wait(), forward(3).']
    }),

    manCheThaNeo({
      so: 2, ten: 'Chế hàm nhổ neo lift_anchor()', hang: 'lam-quen',
      hamCuaEmCan: KHO_TRUOC.concat(['drop_anchor']),
      taoHam: ['lift_anchor'],
      deBai: 'Sola hướng dẫn tiếp: tương tự khi thả neo, lệnh nhổ neo unanchor() cũng luôn đi kèm wait(). Hãy chế hàm lift_anchor() gồm unanchor() và wait(), rồi kết hợp drop_anchor(), tow_grab(), lift_anchor() và back() để kéo bè B lùi vào bến q ở (3, 1)!',
      veMaMau: 'Viết hàm lift_anchor() gồm 2 dòng: unanchor() và wait().',
      san: [
        '#########',
        '#~~q~~B~#',
        '#########'
      ],
      dong: [{ x: 3, y: 1, huong: 3, suc: 1 }, { x: 6, y: 1, huong: 3, suc: 1 }],
      batDau: { x: 3, y: 1, huong: 1 },
      maMau: bai(['drop_anchor()', 'tow_grab()', 'lift_anchor()', 'back()']),
      loiGiai: bai(['drop_anchor()', 'tow_grab()', 'lift_anchor()', 'back()'], { hamCuaEmMoi: [hLiftAnchor()] }),
      sao: { o: 13, nhip: 4 },
      loiGiaiKhac: {
        moTa: 'Dùng cast_net(), wait() thay cho tow_grab()',
        baiLam: bai(['drop_anchor()', 'cast_net()', 'wait()', 'lift_anchor()', 'back()']),
        hamCuaEmMoi: [hLiftAnchor()]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm lift_anchor()', baiLam: bai(['drop_anchor()', 'tow_grab()', 'lift_anchor()', 'back()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Gọi nhầm anchor() thay vì unanchor() trong lift_anchor() nên xuồng vẫn bị neo', baiLam: bai(['drop_anchor()', 'tow_grab()', 'lift_anchor()', 'back()']), hamCuaEmMoi: [hLiftAnchor(['anchor()', 'wait()'])], phaiCoMa: ['dang-neo', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Trong lift_anchor(), dòng 1 là unanchor(), dòng 2 là wait().', 'Luna: Sau lift_anchor(), dòng ở (3, 1) đẩy xuồng về (2, 1), rồi back() kéo bè vào đúng (3, 1).']
    }),

    manCheThaNeo({
      so: 3, ten: 'Chế hàm neo đợi n nhịp anchor_wait(n)', hang: 'lam-quen', mucTieu: 'toi-co',
      hamCuaEmCan: KHO_TRUOC.concat(['drop_anchor', 'lift_anchor']),
      taoHam: ['anchor_wait'],
      deBai: 'Sola hướng dẫn: khi cần thả neo đứng yên chờ dòng nước cuốn chướng ngại vật đi khỏi luồng kênh rồi nhổ neo đi tiếp, ta dùng hàm anchor_wait(n) gồm: drop_anchor(), vòng lặp for i in range(n): wait(), và cuối cùng là lift_anchor(). Hãy chế hàm anchor_wait(n) rồi gọi anchor_wait(1) và forward(3) để chờ bè B trôi khỏi ngã tư (3, 1) xuống hốc (3, 2) rồi tiến thẳng tới Q!',
      veMaMau: 'Viết hàm anchor_wait(n) gồm drop_anchor(), for i in range(n): wait(), và lift_anchor().',
      san: [
        '#######',
        '#~~B~Q#',
        '###~###',
        '#######'
      ],
      dong: [{ x: 1, y: 1, huong: 1, suc: 1 }, { x: 3, y: 1, huong: 2, suc: 1 }],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['anchor_wait(1)', 'forward(3)']),
      loiGiai: bai(['anchor_wait(1)', 'forward(3)'], { hamCuaEmMoi: [hAnchorWait()] }),
      sao: { o: 15, nhip: 6 },
      loiGiaiKhac: {
        moTa: 'Gọi move() ba lần sau anchor_wait(1)',
        baiLam: bai(['anchor_wait(1)', 'move()', 'move()', 'move()']),
        hamCuaEmMoi: [hAnchorWait()]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm anchor_wait(n)', baiLam: bai(['anchor_wait(1)', 'forward(3)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên gọi lift_anchor() ở cuối anchor_wait(n)', baiLam: bai(['anchor_wait(1)', 'forward(3)']), hamCuaEmMoi: [hAnchorWait(['drop_anchor()', 'for i in range(n):', '    wait()'])], phaiCoMa: ['dang-neo', 'chua-toi-co'] }
      ],
      goiY: ['Luna: Trong anchor_wait(n), sau drop_anchor() là vòng lặp for i in range(n): wait().', 'Luna: Dòng cuối của anchor_wait(n) (ngoài vòng lặp for) là lift_anchor().']
    }),

    manCheThaNeo({
      so: 4, ten: 'Chế hàm thả neo móc vật anchor_tow()', hang: 'luyen',
      hamCuaEmCan: KHO_TRUOC.concat(['drop_anchor', 'lift_anchor', 'anchor_wait']),
      taoHam: ['anchor_tow'],
      deBai: 'Sola hướng dẫn: tổ hợp 3 bước drop_anchor(), tow_grab(), lift_anchor() xuất hiện ở hầu hết các trạm đón bè trôi. Hãy đóng gói chúng thành hàm anchor_tow() (không tham số), rồi gọi anchor_tow() và forward(3) để đón lục bình L và đưa về bến q ở (2, 3)!',
      veMaMau: 'Viết hàm anchor_tow() gồm 3 dòng: drop_anchor(), tow_grab(), lift_anchor().',
      san: [
        '########',
        '###L####',
        '#~~~~~~#',
        '#~q~~~~#',
        '########'
      ],
      dong: [{ x: 1, y: 2, huong: 2, suc: 1 }, { x: 3, y: 1, huong: 2, suc: 1 }, { x: 3, y: 2, huong: 2, suc: 1 }],
      batDau: { x: 1, y: 2, huong: 1 },
      maMau: bai(['anchor_tow()', 'forward(3)']),
      loiGiai: bai(['anchor_tow()', 'forward(3)'], { hamCuaEmMoi: [hAnchorTow()] }),
      sao: { o: 16, nhip: 6 },
      loiGiaiKhac: {
        moTa: 'Dùng flow_step() và move() sau anchor_tow()',
        baiLam: bai(['anchor_tow()', 'flow_step()', 'move()']),
        hamCuaEmMoi: [hAnchorTow()]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm anchor_tow()', baiLam: bai(['anchor_tow()', 'forward(3)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Gọi tow_grab() trước drop_anchor() nên tung lưới khi lục bình chưa trôi xuống (3, 2)', baiLam: bai(['anchor_tow()', 'forward(3)']), hamCuaEmMoi: [hAnchorTow(['tow_grab()', 'drop_anchor()', 'lift_anchor()'])], phaiCoMa: ['keo-hut', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Trong anchor_tow(), gọi đúng thứ tự: drop_anchor(), tow_grab(), rồi lift_anchor().', 'Luna: Khi lift_anchor() chạy, dòng ở (1, 2) đưa xuồng xuống (1, 3), rồi forward(3) kéo L tới (2, 3).']
    }),

    manCheThaNeo({
      so: 5, ten: 'Dùng anchor_tow() giải cứu liên hoàn', hang: 'luyen', nhipTheo: 'tong',
      hamCuaEmCan: KHO_TRUOC.concat(['drop_anchor', 'lift_anchor', 'anchor_wait', 'anchor_tow']),
      deBai: 'Sola thử thách trên 2 sân: từ (1, 1), hãy gọi anchor_tow() để thả neo chờ bè B trôi về (3, 1), bắt bè rồi nhổ neo (dòng ở (1, 1) sẽ đưa xuồng xuống hàng 2 tại (1, 2)). Ở hàng 2, hãy gọi liên tiếp hai lần flow_step() để vượt qua đoạn nước êm hoặc dòng thuận và kéo B vào bến q ở (3, 2)!',
      veMaMau: 'Gọi anchor_tow(), rồi hai lần flow_step().',
      san: [
        [
          '########',
          '#~~~B~~#',
          '#~~q~~~#',
          '########'
        ],
        [
          '####V###',
          '#~~~B~~#',
          '#~~q~~~#',
          '########'
        ]
      ],
      dong: [
        [{ x: 1, y: 1, huong: 2, suc: 1 }, { x: 4, y: 1, huong: 3, suc: 1 }, { x: 2, y: 2, huong: 1, suc: 1 }],
        [{ x: 1, y: 1, huong: 2, suc: 1 }, { x: 4, y: 1, huong: 3, suc: 1 }, { x: 4, y: 2, huong: 1, suc: 1 }]
      ],
      noi: [[], [{ nut: { x: 4, y: 0 }, cong: [], dong: [] }]],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      maMau: bai(['anchor_tow()', 'flow_step()']),
      loiGiai: bai(['anchor_tow()', 'flow_step()', 'flow_step()']),
      sao: { o: 21, nhip: 12 },
      loiGiaiKhac: {
        moTa: 'Viết drop_anchor(), tow_grab(), lift_anchor() rồi hai lần flow_step()',
        baiLam: bai(['drop_anchor()', 'tow_grab()', 'lift_anchor()', 'flow_step()', 'flow_step()'])
      },
      loiSai: [
        { moTa: 'Mới gọi 1 lần flow_step() nên bè mới tới (1, 2), chưa tới bến (3, 2)', baiLam: bai(['anchor_tow()', 'flow_step()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Dùng forward(2) thay vì hai lần flow_step() nên bè chưa tới bến (3, 2)', baiLam: bai(['anchor_tow()', 'forward(2)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau anchor_tow(), xuồng ở (1, 2) còn bè B đi theo dây lưới.', 'Luna: Hai lần gọi flow_step() giúp xuồng tiến 4 ô tới (5, 2), kéo B vào bến (3, 2) trên cả 2 sân!']
    }),

    manCheThaNeo({
      so: 6, ten: 'Chế hàm neo đợi rồi gạt van hold_and_valve(n)', hang: 'luyen',
      hamCuaEmCan: KHO_TRUOC.concat(['drop_anchor', 'lift_anchor', 'anchor_wait', 'anchor_tow']),
      taoHam: ['hold_and_valve'],
      deBai: 'Sola hướng dẫn: khi mũi xuồng đang hướng thẳng vào van V và cần giữ neo chờ vật nổi trôi đúng vị trí rồi mới tung lưới gạt van và nhổ neo, ta dùng hàm hold_and_valve(n) gồm: drop_anchor(), vòng lặp for i in range(n): wait(), tow_grab(), và lift_anchor(). Hãy chế hàm hold_and_valve(n), rồi gọi hold_and_valve(0), turn_right() và tow_pair(2, 1) để giữ bè B tại (5, 3) và đưa vào bến q ở (4, 3)!',
      veMaMau: 'Viết hàm hold_and_valve(n) gồm drop_anchor(), for i in range(n): wait(), tow_grab(), lift_anchor().',
      san: [
        '########',
        '#V######',
        '#~###B##',
        '#~K~q~~#',
        '#~###~##',
        '########'
      ],
      dong: [{ x: 1, y: 3, huong: 2, suc: 1 }, { x: 5, y: 2, huong: 2, suc: 1 }, { x: 5, y: 3, huong: 2, suc: 1 }],
      noi: [{ nut: { x: 1, y: 1 }, cong: [{ x: 2, y: 3 }], dong: [{ x: 1, y: 3 }, { x: 5, y: 2 }, { x: 5, y: 3 }] }],
      batDau: { x: 1, y: 3, huong: 0 },
      maMau: bai(['hold_and_valve(0)', 'turn_right()', 'tow_pair(2, 1)']),
      loiGiai: bai(['hold_and_valve(0)', 'turn_right()', 'tow_pair(2, 1)'], { hamCuaEmMoi: [hHoldAndValve()] }),
      sao: { o: 26, nhip: 8 },
      loiGiaiKhac: {
        moTa: 'Dùng pair_step("R", 2) và tow_pair(0, 1) sau hold_and_valve(0)',
        baiLam: bai(['hold_and_valve(0)', 'pair_step("R", 2)', 'tow_pair(0, 1)']),
        hamCuaEmMoi: [hHoldAndValve()]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm hold_and_valve(n)', baiLam: bai(['hold_and_valve(0)', 'turn_right()', 'tow_pair(2, 1)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên gọi tow_grab() trong hold_and_valve(n) nên van V không đổi và cống K vẫn đóng', baiLam: bai(['hold_and_valve(0)', 'turn_right()', 'tow_pair(2, 1)']), hamCuaEmMoi: [hHoldAndValve(['drop_anchor()', 'for i in range(n):', '    wait()', 'lift_anchor()'])], phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Trong hold_and_valve(n), viết lần lượt drop_anchor(), for i in range(n): wait(), tow_grab(), lift_anchor().', 'Luna: Với n = 0, nhịp drop_anchor() đã đủ 1 nhịp để B trôi từ (5, 2) xuống (5, 3), ngay sau đó tow_grab() gạt van V ở (1, 1).']
    }),

    manCheThaNeo({
      so: 7, ten: 'Sửa hàm quên nhổ neo fix_anchor_tow()', hang: 'bien-the',
      chinhCoDinh: true,
      hamCuaEmCan: KHO_TRUOC.concat(['drop_anchor', 'lift_anchor', 'anchor_wait', 'anchor_tow', 'hold_and_valve']),
      deBai: 'Sola phát hiện lỗi: chương trình chính gọi fix_anchor_tow() để thả neo đón bè B rồi gọi forward(3) kéo bè tới bến q. Nhưng trong hàm fix_anchor_tow() lại chỉ có drop_anchor() và tow_grab(), quên mất lift_anchor() ở cuối nên khi gọi forward(3) xuồng bị kẹt neo! Hãy thêm lift_anchor() vào cuối hàm fix_anchor_tow().',
      veMaMau: 'Chương trình chính đã khóa. Hãy thêm lift_anchor() vào cuối hàm fix_anchor_tow().',
      san: [
        '########',
        '#~~~B~~#',
        '#~q~~~~#',
        '########'
      ],
      dong: [{ x: 1, y: 1, huong: 2, suc: 1 }, { x: 4, y: 1, huong: 3, suc: 1 }],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['fix_anchor_tow()', 'forward(3)'], { hamCuaMan: [hFixAnchorTow(T_FIX_ANCHOR_SAI)] }),
      loiGiai: bai(['fix_anchor_tow()', 'forward(3)'], { hamCuaMan: [hFixAnchorTow(T_FIX_ANCHOR_DUNG)] }),
      sao: { o: 16, nhip: 6 },
      loiSai: [
        { moTa: 'Chưa thêm lift_anchor() vào cuối hàm fix_anchor_tow()', baiLam: bai(['fix_anchor_tow()', 'forward(3)'], { hamCuaMan: [hFixAnchorTow(T_FIX_ANCHOR_SAI)] }), phaiCoMa: ['dang-neo', 'chua-dua-vat'] },
        { moTa: 'Xóa mất drop_anchor() nên xuồng trôi xuống hàng 2 trước khi bắt bè', baiLam: bai(['fix_anchor_tow()', 'forward(3)'], { hamCuaMan: [hFixAnchorTow(['tow_grab()', 'lift_anchor()'])] }), phaiCoMa: ['keo-hut', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau drop_anchor() và tow_grab(), mỏ neo vẫn đang cắm dưới đáy sông.', 'Luna: Thêm dòng lift_anchor() vào dòng thứ 3 của fix_anchor_tow().']
    }),

    manCheThaNeo({
      so: 8, ten: 'Gạt van giữ lục bình sau hai nhịp trôi', hang: 'bien-the',
      hamCuaEmCan: KHO_TRUOC.concat(['drop_anchor', 'lift_anchor', 'anchor_wait', 'anchor_tow', 'hold_and_valve']),
      deBai: 'Sola thử thách: đám lục bình L ở tận (5, 1) cần 2 nhịp trôi mới xuống tới ngã tư (5, 3). Xuồng ở (1, 3) đang hướng lên van V ở (1, 1). Hãy gọi hold_and_valve(1) (1 nhịp của drop_anchor() cộng 1 nhịp trong vòng lặp là đủ 2 nhịp!) để khóa L ngay tại (5, 3) và mở cống K ở (2, 3), rồi quay phải và gọi tow_pair(2, 1) đưa L vào bến q ở (4, 3)!',
      veMaMau: 'Gọi hold_and_valve(1), turn_right() và tow_pair(2, 1).',
      san: [
        '########',
        '#V###L##',
        '#~###~##',
        '#~K~q~~#',
        '#~###~##',
        '########'
      ],
      dong: [{ x: 1, y: 3, huong: 2, suc: 1 }, { x: 5, y: 1, huong: 2, suc: 1 }, { x: 5, y: 2, huong: 2, suc: 1 }, { x: 5, y: 3, huong: 2, suc: 1 }],
      noi: [{ nut: { x: 1, y: 1 }, cong: [{ x: 2, y: 3 }], dong: [{ x: 1, y: 3 }, { x: 5, y: 1 }, { x: 5, y: 2 }, { x: 5, y: 3 }] }],
      batDau: { x: 1, y: 3, huong: 0 },
      maMau: bai(['hold_and_valve(1)']),
      loiGiai: bai(['hold_and_valve(1)', 'turn_right()', 'tow_pair(2, 1)']),
      sao: { o: 26, nhip: 9 },
      loiGiaiKhac: {
        moTa: 'Dùng pair_step("R", 2) và tow_pair(0, 1) sau hold_and_valve(1)',
        baiLam: bai(['hold_and_valve(1)', 'pair_step("R", 2)', 'tow_pair(0, 1)'])
      },
      loiSai: [
        { moTa: 'Truyền hold_and_valve(0) nên lục bình mới trôi tới (5, 2), chưa xuống tới (5, 3)', baiLam: bai(['hold_and_valve(0)', 'turn_right()', 'tow_pair(2, 1)']), phaiCoMa: ['keo-hut', 'chua-dua-vat'] },
        { moTa: 'Mới gọi hold_and_valve(1) mà chưa quay phải và kéo lục bình về bến', baiLam: bai(['hold_and_valve(1)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau hold_and_valve(1), lục bình L đã nằm ngay tại (5, 3) và cống (2, 3) đã mở.', 'Luna: Thêm turn_right() và tow_pair(2, 1) để hoàn thành nhiệm vụ.']
    }),

    manCheThaNeo({
      so: 9, ten: 'Chọn số nhịp chờ van theo dòng chảy trước mũi', hang: 'bien-the', nhipTheo: 'tong',
      hamCuaEmCan: KHO_TRUOC.concat(['drop_anchor', 'lift_anchor', 'anchor_wait', 'anchor_tow', 'hold_and_valve']),
      deBai: 'Sola giao bài toán 2 sân: xuồng ở (1, 3) hướng lên van V ở (1, 0). Ô ngay trước mũi xuồng là (1, 2). Ở sân 1, ô (1, 2) có dòng chảy ("front") báo hiệu bè B xuất phát từ xa (5, 1) nên cần gọi hold_and_valve(1); ở sân 2, ô (1, 2) là nước êm ("none") báo hiệu bè B xuất phát gần ở (5, 2) nên chỉ cần gọi hold_and_valve(0)! Sau khối if/else, hãy gọi turn_right() và tow_pair(2, 1) đưa B tới bến q ở (4, 3).',
      veMaMau: 'Dùng if flow_dir() == "front": hold_and_valve(1) else: hold_and_valve(0), rồi turn_right() và tow_pair(2, 1).',
      san: [
        [
          '#V######',
          '#~###B##',
          '#~###~##',
          '#~K~q~~#',
          '#~###~##',
          '########'
        ],
        [
          '#V######',
          '#~######',
          '#~###B##',
          '#~K~q~~#',
          '#~###~##',
          '########'
        ]
      ],
      dong: [
        [{ x: 1, y: 3, huong: 2, suc: 1 }, { x: 1, y: 2, huong: 0, suc: 1 }, { x: 5, y: 1, huong: 2, suc: 1 }, { x: 5, y: 2, huong: 2, suc: 1 }, { x: 5, y: 3, huong: 2, suc: 1 }],
        [{ x: 1, y: 3, huong: 2, suc: 1 }, { x: 5, y: 2, huong: 2, suc: 1 }, { x: 5, y: 3, huong: 2, suc: 1 }]
      ],
      noi: [
        [{ nut: { x: 1, y: 0 }, cong: [{ x: 2, y: 3 }], dong: [{ x: 1, y: 3 }, { x: 1, y: 2 }, { x: 5, y: 1 }, { x: 5, y: 2 }, { x: 5, y: 3 }] }],
        [{ nut: { x: 1, y: 0 }, cong: [{ x: 2, y: 3 }], dong: [{ x: 1, y: 3 }, { x: 5, y: 2 }, { x: 5, y: 3 }] }]
      ],
      batDau: [{ x: 1, y: 3, huong: 0 }, { x: 1, y: 3, huong: 0 }],
      maMau: bai(['if flow_dir() == "front":', '    hold_and_valve(1)', 'else:', '    hold_and_valve(0)']),
      loiGiai: bai(['if flow_dir() == "front":', '    hold_and_valve(1)', 'else:', '    hold_and_valve(0)', 'turn_right()', 'tow_pair(2, 1)']),
      sao: { o: 29, nhip: 17 },
      loiGiaiKhac: {
        moTa: 'Kiểm tra if is_calm_front(): hold_and_valve(0) else: hold_and_valve(1)',
        baiLam: bai(['if is_calm_front():', '    hold_and_valve(0)', 'else:', '    hold_and_valve(1)', 'turn_right()', 'tow_pair(2, 1)'])
      },
      loiSai: [
        { moTa: 'Luôn gọi hold_and_valve(1) nên ở sân 2 bè B trôi tuột xuống hốc Nam (5, 4)', baiLam: bai(['hold_and_valve(1)', 'turn_right()', 'tow_pair(2, 1)']), phaiCoMa: ['keo-hut', 'chua-dua-vat'] },
        { moTa: 'Luôn gọi hold_and_valve(0) nên ở sân 1 bè B chưa xuống tới ngã tư (5, 3)', baiLam: bai(['hold_and_valve(0)', 'turn_right()', 'tow_pair(2, 1)']), phaiCoMa: ['keo-hut', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau khối if/else, trên cả 2 sân bè B đều đã dừng tại (5, 3) và cống (2, 3) đã mở.', 'Luna: Thêm turn_right() và tow_pair(2, 1) ở cuối chương trình chính.']
    }),

    manCheThaNeo({
      so: 10, ten: 'Trùm: Điều phối neo và van giữa dòng xiết', hang: 'trum', nhipTheo: 'tong',
      huyHieu: { ma: 'che-tha-neo', ten: 'Huy hiệu Chế lệnh: neo giữa dòng xiết' },
      hamCuaEmCan: KHO_TRUOC.concat(['drop_anchor', 'lift_anchor', 'anchor_wait', 'anchor_tow', 'hold_and_valve']),
      deBai: 'Sola giao thử thách khép lại Gói 5 trên 2 sân: từ (1, 3) hướng lên van V ở (1, 0), hãy kiểm tra if is_calm_front(): hold_and_valve(0) else: hold_and_valve(1) để giữ bè B đúng tại ngã tư (7, 3) và mở cống K ở (2, 3). Sau đó gọi turn_right(), move(), flow_step() để vượt qua đoạn kênh tới (4, 3), rồi gọi tow_pair(1, 1) đưa bè B vào bến q ở (6, 3)!',
      veMaMau: 'Kết hợp if/else với hold_and_valve(0) / hold_and_valve(1), rồi turn_right(), move(), flow_step() và tow_pair(1, 1).',
      san: [
        [
          '#V########',
          '#~#####B##',
          '#~#####~##',
          '#~K~~~q~~#',
          '#~#####~##',
          '##########'
        ],
        [
          '#V########',
          '#~########',
          '#~#####B##',
          '#~K~~~q~~#',
          '#~#####~##',
          '##########'
        ]
      ],
      dong: [
        [
          { x: 1, y: 3, huong: 2, suc: 1 },
          { x: 1, y: 2, huong: 0, suc: 1 },
          { x: 7, y: 1, huong: 2, suc: 1 },
          { x: 7, y: 2, huong: 2, suc: 1 },
          { x: 7, y: 3, huong: 2, suc: 1 },
          { x: 3, y: 3, huong: 1, suc: 1 }
        ],
        [
          { x: 1, y: 3, huong: 2, suc: 1 },
          { x: 7, y: 2, huong: 2, suc: 1 },
          { x: 7, y: 3, huong: 2, suc: 1 }
        ]
      ],
      noi: [
        [{ nut: { x: 1, y: 0 }, cong: [{ x: 2, y: 3 }], dong: [{ x: 1, y: 3 }, { x: 1, y: 2 }, { x: 7, y: 1 }, { x: 7, y: 2 }, { x: 7, y: 3 }] }],
        [{ nut: { x: 1, y: 0 }, cong: [{ x: 2, y: 3 }], dong: [{ x: 1, y: 3 }, { x: 7, y: 2 }, { x: 7, y: 3 }] }]
      ],
      batDau: [{ x: 1, y: 3, huong: 0 }, { x: 1, y: 3, huong: 0 }],
      maMau: bai(['if is_calm_front():', '    hold_and_valve(0)', 'else:', '    hold_and_valve(1)']),
      loiGiai: bai(['if is_calm_front():', '    hold_and_valve(0)', 'else:', '    hold_and_valve(1)', 'turn_right()', 'move()', 'flow_step()', 'tow_pair(1, 1)']),
      sao: { o: 36, nhip: 20 },
      loiGiaiKhac: {
        moTa: 'Dùng if flow_dir() == "front": hold_and_valve(1) else: hold_and_valve(0)',
        baiLam: bai(['if flow_dir() == "front":', '    hold_and_valve(1)', 'else:', '    hold_and_valve(0)', 'turn_right()', 'move()', 'flow_step()', 'tow_pair(1, 1)'])
      },
      loiSai: [
        { moTa: 'Dùng hold_and_valve(0) cho cả 2 sân nên ở sân 1 bè B chưa xuống tới (7, 3)', baiLam: bai(['hold_and_valve(0)', 'turn_right()', 'move()', 'flow_step()', 'tow_pair(1, 1)']), phaiCoMa: ['keo-hut', 'chua-dua-vat'] },
        { moTa: 'Thiếu tow_pair(1, 1) cuối cùng nên chưa đưa bè B vào bến (6, 3)', baiLam: bai(['if is_calm_front():', '    hold_and_valve(0)', 'else:', '    hold_and_valve(1)', 'turn_right()', 'move()', 'flow_step()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau khối if/else với hold_and_valve, bè B đã dừng ngay tại (7, 3) trên cả 2 sân.', 'Luna: Gọi turn_right(), move(), flow_step() và tow_pair(1, 1) để đưa B tới bến (6, 3).']
    })
  ];

  if (M && M.them) M.manThaNeo = DS;
  if (typeof module !== 'undefined' && module.exports) module.exports = M;
})();
