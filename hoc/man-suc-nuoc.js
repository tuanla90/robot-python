/* ============================================================================
   man-suc-nuoc.js - Mua 5 (Ben song) · Goi 7: Nang cap cam bien Do suc nuoc
   Chuong 1: suc-nuoc (10 man) - Do suc nuoc chay (flow + min / max)
   Chuong 2: che-suc-nuoc (10 man) - Che lenh: chon nhanh em nhat
   ========================================================================== */
(function () {
  'use strict';

  var M = (typeof window !== 'undefined' && window.ManHoc) ||
    (typeof require === 'function' ? require('./man-chuoi-1.js') : null);

  var GOC_SUC = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'cast_net', 'drop_net', 'flow_dir', 'anchor', 'unanchor', 'set_length', 'flow'];
  var ROBOT_SUC = { than: 'xuong', tay: 'day-keo', camBien: [{ ma: 'dong-chay', o: 'tren' }] };
  var CAU_TRUC = ['for', 'if', 'while', 'list', 'def', 'return', 'tuple'];

  var KHO_TRUOC = [
    'move', 'turn_left', 'turn_right', 'u_turn', 'back', 'forward',
    'span_dist', 'round_steps', 'calm_bonus', 'turn_code', 'sail_to',
    'tow_grab', 'tow_drop', 'pull_back', 'pair_step', 'tow_pair',
    'is_calm_front', 'flow_step', 'scan_calm_side', 'tow_in_calm', 'pick_calm_lane',
    'flip_valve', 'open_gate_pass', 'shut_stream_tow', 'valve_and_back', 'lock_rescue',
    'drop_anchor', 'lift_anchor', 'anchor_wait', 'anchor_tow', 'hold_and_valve',
    'tether_grab', 'tether_drop', 'tow_to_tail', 'tug_corner', 'deliver_tail'
  ];

  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function bai(chinh, phu) {
    var kq = { chinh: chinh.slice(), hamCuaMan: [], hamCuaEmMoi: [] };
    if (phu && phu.hamCuaMan) kq.hamCuaMan = phu.hamCuaMan;
    if (phu && phu.hamCuaEmMoi) kq.hamCuaEmMoi = phu.hamCuaEmMoi;
    return kq;
  }

  var T_FLOW_POWER = [
    'h, s = flow()',
    'return s'
  ];
  var T_CALMER_POWER = [
    'b = flow_power()',
    'return min(a, b)'
  ];
  var T_FASTER_POWER = [
    'b = flow_power()',
    'return max(a, b)'
  ];
  var T_TURN_TO_CALMER = [
    'turn_left()',
    'a = flow_power()',
    'u_turn()',
    't = calmer_power(a)',
    'if a == t:',
    '    u_turn()'
  ];
  var T_BEST_BRANCH = [
    'turn_to_calmer()',
    'forward(n)'
  ];
  var T_FIX_MIN_SAI = [
    'turn_left()',
    'a = flow_power()',
    'u_turn()',
    't = faster_power(a)',
    'if a == t:',
    '    u_turn()',
    'forward(n)'
  ];
  var T_FIX_MIN_DUNG = [
    'turn_left()',
    'a = flow_power()',
    'u_turn()',
    't = calmer_power(a)',
    'if a == t:',
    '    u_turn()',
    'forward(n)'
  ];

  function hFlowPower(than) { return H('flow_power', [], than || T_FLOW_POWER); }
  function hCalmerPower(than) { return H('calmer_power', ['a'], than || T_CALMER_POWER); }
  function hFasterPower(than) { return H('faster_power', ['a'], than || T_FASTER_POWER); }
  function hTurnToCalmer(than) { return H('turn_to_calmer', [], than || T_TURN_TO_CALMER); }
  function hBestBranch(than) { return H('best_branch', ['n'], than || T_BEST_BRANCH); }
  function hFixMinFlow(than) { return H('fix_min_flow', ['n'], than || T_FIX_MIN_DUNG); }

  function manSucNuoc(cfg) {
    return Object.assign({
      chuong: 'suc-nuoc', tenChuong: 'Đo sức nước chảy',
      loaiRobot: 'xuong',
      robot: ROBOT_SUC,
      vo: 'song',
      hamGoc: GOC_SUC.slice(),
      bienDem: true,
      cauTruc: CAU_TRUC,
      khung: { chinh: 10, moiHam: 10, cauTruc: CAU_TRUC },
      mucTieu: 'toi-co',
      hamCuaEmCan: KHO_TRUOC.slice(),
      taoHam: []
    }, cfg, { ma: 'suc-nuoc.' + cfg.so });
  }

  function manCheSucNuoc(cfg) {
    return Object.assign({
      chuong: 'che-suc-nuoc', tenChuong: 'Chế lệnh: chọn nhánh êm nhất',
      loaiRobot: 'xuong',
      robot: ROBOT_SUC,
      vo: 'song',
      hamGoc: GOC_SUC.slice(),
      bienDem: true,
      cauTruc: CAU_TRUC,
      khung: { chinh: 10, moiHam: 10, cauTruc: CAU_TRUC },
      mucTieu: 'toi-co',
      hamCuaEmCan: KHO_TRUOC.slice(),
      taoHam: []
    }, cfg, { ma: 'che-suc-nuoc.' + cfg.so });
  }

  var DS = [
    /* ========================================================================
       CHUONG 1: suc-nuoc (10 man) - Do suc nuoc chay
       ======================================================================== */
    manSucNuoc({
      so: 1, ten: 'Thử bộ đôi hướng và sức chảy flow()', hang: 'lam-quen',
      chiChay: true, chinhCoDinh: true,
      deBai: 'Sola giới thiệu nâng cấp cảm biến chong chóng: lệnh flow() trả về bộ đôi (huong, suc) của ô ngay trước mũi xuồng, trong đó huong là hướng chảy và suc là sức đẩy 0, 1 hoặc 2. Khi bước vào ô dòng xuôi sức 2 ở (2, 1), nước đẩy xuồng trôi thêm 2 ô liền! Hãy bấm Chạy để xem cách tách h, s = flow(), tính t = 6 - s rồi gọi forward(t) cập phao Q.',
      veMaMau: 'Bấm Chạy để xem xuồng đọc h, s = flow() và bù đúng số bước tới Q.',
      san: ['#########', '#~~~~~~Q#', '#########'],
      dong: [{ x: 2, y: 1, huong: 1, suc: 2 }],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['h, s = flow()', 't = 6 - s', 'forward(t)']),
      loiGiai: bai(['h, s = flow()', 't = 6 - s', 'forward(t)']),
      sao: { o: 7, nhip: 4 },
      loiGiaiKhac: { moTa: 'Lấy phần tử thứ hai của tuple: t = flow() rồi s = t[1]', baiLam: bai(['t = flow()', 's = t[1]', 'k = 6 - s', 'forward(k)']) },
      loiSai: [],
      goiY: ['Luna: Chỉ cần bấm nút Chạy để quan sát cảm biến flow() trả về bộ đôi ("front", 2).']
    }),

    manSucNuoc({
      so: 2, ten: 'Tách biến h, s = flow() để bù đúng số bước', hang: 'lam-quen', nhipTheo: 'tong',
      deBai: 'Sola thử thách trên 2 sân: xuồng xuất phát ở (1, 1) cần tới phao Q ở (7, 1) cách đó 6 ô. Ô trước mũi (2, 1) có dòng chảy xuôi sức 1 ở sân 1 và sức 2 ở sân 2. Hãy tách h, s = flow(), tính t = 6 - s rồi gọi forward(t) để xuồng dừng đúng tại Q trên cả hai sân!',
      veMaMau: 'Đã có h, s = flow(). Viết t = 6 - s rồi gọi forward(t).',
      san: [['#########', '#~~~~~~Q#', '#########'], ['#########', '#~~~~~~Q#', '#########']],
      dong: [[{ x: 2, y: 1, huong: 1, suc: 1 }], [{ x: 2, y: 1, huong: 1, suc: 2 }]],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      maMau: bai(['h, s = flow()']),
      loiGiai: bai(['h, s = flow()', 't = 6 - s', 'forward(t)']),
      sao: { o: 7, nhip: 9 },
      loiGiaiKhac: { moTa: 'Dùng chỉ số: t = flow(), s = t[1]', baiLam: bai(['t = flow()', 's = t[1]', 'k = 6 - s', 'forward(k)']) },
      loiSai: [
        { moTa: 'Đếm cứng forward(4) nên ở sân 1 dòng sức 1 đẩy thiếu 1 ô', baiLam: bai(['forward(4)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Truyền nhầm forward(s) thay vì forward(6 - s) nên xuồng dừng giữa kênh', baiLam: bai(['h, s = flow()', 'forward(s)']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Luna: Ô (2, 1) đẩy thêm s ô nên tổng số bước tự đi chỉ còn 6 - s.', 'Luna: Sau dòng h, s = flow(), viết t = 6 - s rồi gọi forward(t).']
    }),

    manSucNuoc({
      so: 3, ten: 'Đo hai chặng dòng chảy sức 1 và sức 2', hang: 'lam-quen', nhipTheo: 'tong',
      deBai: 'Sola chia kênh dài 8 ô tới Q ở (9, 1) thành 2 chặng, mỗi chặng 4 ô. Ở đầu mỗi chặng ((2, 1) và (6, 1)) đều có dòng xuôi có sức đẩy 1 hoặc 2. Hãy dùng vòng lặp for i in range(2): để đọc h, s = flow(), tính t = 4 - s và gọi forward(t) vượt qua từng chặng!',
      veMaMau: 'Trong vòng lặp for i in range(2):, đã có h, s = flow(). Viết thêm t = 4 - s và forward(t).',
      san: [['###########', '#~~~~~~~~Q#', '###########'], ['###########', '#~~~~~~~~Q#', '###########']],
      dong: [
        [{ x: 2, y: 1, huong: 1, suc: 2 }, { x: 6, y: 1, huong: 1, suc: 1 }],
        [{ x: 2, y: 1, huong: 1, suc: 1 }, { x: 6, y: 1, huong: 1, suc: 2 }]
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      maMau: bai(['for i in range(2):', '    h, s = flow()']),
      loiGiai: bai(['for i in range(2):', '    h, s = flow()', '    t = 4 - s', '    forward(t)']),
      sao: { o: 8, nhip: 10 },
      loiGiaiKhac: {
        moTa: 'Đo và đi từng chặng 4 ô mà không dùng vòng lặp',
        baiLam: bai(['h, s = flow()', 't = 4 - s', 'forward(t)', 'h, s = flow()', 't = 4 - s', 'forward(t)'])
      },
      loiSai: [
        { moTa: 'Luôn gọi forward(2) trong vòng lặp nên chặng sức 1 đi thiếu bước', baiLam: bai(['for i in range(2):', '    forward(2)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Chỉ đo và đi 1 chặng ngoài vòng lặp nên mới tới giữa kênh', baiLam: bai(['h, s = flow()', 't = 4 - s', 'forward(t)']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Luna: Mỗi chặng dài đúng 4 ô, nên bước vào ô đầu chặng có sức đẩy s sẽ cần t = 4 - s rồi forward(t).', 'Luna: Sau chặng 1 xuồng dừng đúng tại (5, 1) để đo tiếp ô (6, 1) ở chặng 2.']
    }),

    manSucNuoc({
      so: 4, ten: 'Bù sức nước khi lai dắt bè ngắn dây', hang: 'luyen', mucTieu: 'dua-vat', nhipTheo: 'tong',
      deBai: 'Sola nhờ bạn kéo bè B đang nằm ở (1, 1) vào bến q ở (6, 1). Xuồng xuất phát ở (3, 1) hướng Tây (nhìn về B). Hãy gọi tow_to_tail() để bắt B và thu dây về 1 ô, gọi u_turn() quay mũi sang Đông, rồi đọc h, s = flow() ở ô (4, 1), tính t = 4 - s và gọi forward(t) để xuồng tiến tới (7, 1), kéo B vào đúng bến (6, 1)!',
      veMaMau: 'Đã có tow_to_tail(), u_turn(), h, s = flow(). Viết t = 4 - s rồi gọi forward(t).',
      san: [['#########', '#B~~~~q~#', '#########'], ['#########', '#B~~~~q~#', '#########']],
      dong: [[{ x: 4, y: 1, huong: 1, suc: 1 }], [{ x: 4, y: 1, huong: 1, suc: 2 }]],
      batDau: [{ x: 3, y: 1, huong: 3 }, { x: 3, y: 1, huong: 3 }],
      maMau: bai(['tow_to_tail()', 'u_turn()', 'h, s = flow()']),
      loiGiai: bai(['tow_to_tail()', 'u_turn()', 'h, s = flow()', 't = 4 - s', 'forward(t)']),
      sao: { o: 16, nhip: 10 },
      loiGiaiKhac: { moTa: 'Dùng hai lần turn_right() thay cho u_turn()', baiLam: bai(['tow_to_tail()', 'turn_right()', 'turn_right()', 'h, s = flow()', 't = 4 - s', 'forward(t)']) },
      loiSai: [
        { moTa: 'Đếm cứng forward(2) sau khi quay đầu nên ở sân 1 bè B dừng trước bến', baiLam: bai(['tow_to_tail()', 'u_turn()', 'forward(2)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên gọi tow_to_tail() nên bè B vẫn nằm lại ở (1, 1)', baiLam: bai(['u_turn()', 'h, s = flow()', 't = 4 - s', 'forward(t)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau tow_to_tail() và u_turn(), xuồng ở (3, 1) hướng Đông còn bè B ở (2, 1) cách 1 ô.', 'Luna: Để kéo B vào (6, 1), xuồng cần tới (7, 1) cách 4 ô, nên tính t = 4 - s rồi gọi forward(t).']
    }),

    manSucNuoc({
      so: 5, ten: 'Làm quen hàm min(a, b) chọn nhánh nước êm hơn', hang: 'luyen', nhipTheo: 'tong',
      deBai: 'Sola hướng dẫn: ở ngã ba (3, 2), cả hai nhánh trái (2, 2) và phải (4, 2) đều có dòng chảy nhưng một nhánh êm hơn (sức 1) dẫn vào Q, nhánh kia chảy xiết (sức 2). Hãy gọi turn_left() đo h, a = flow(), gọi u_turn() đo h, b = flow(); nếu a == min(a, b) thì gọi u_turn() quay lại nhánh trái, cuối cùng gọi move() lướt vào Q!',
      veMaMau: 'So sánh if a == min(a, b): u_turn() rồi gọi move().',
      san: [['#######', '#~~~~~#', '#Q~~~~#', '#######'], ['#######', '#~~~~~#', '#~~~~Q#', '#######']],
      dong: [
        [{ x: 2, y: 2, huong: 3, suc: 1 }, { x: 4, y: 2, huong: 1, suc: 2 }],
        [{ x: 2, y: 2, huong: 3, suc: 2 }, { x: 4, y: 2, huong: 1, suc: 1 }]
      ],
      batDau: [{ x: 3, y: 2, huong: 0 }, { x: 3, y: 2, huong: 0 }],
      maMau: bai(['turn_left()', 'h, a = flow()', 'u_turn()', 'h, b = flow()']),
      loiGiai: bai(['turn_left()', 'h, a = flow()', 'u_turn()', 'h, b = flow()', 't = min(a, b)', 'if a == t:', '    u_turn()', 'move()']),
      sao: { o: 15, nhip: 7 },
      loiGiaiKhac: {
        moTa: 'Dùng điều kiện if a < b: u_turn() trước khi gọi move()',
        baiLam: bai(['turn_left()', 'h, a = flow()', 'u_turn()', 'h, b = flow()', 'if a < b:', '    u_turn()', 'move()'])
      },
      loiSai: [
        { moTa: 'Dùng max(a, b) thay vì min(a, b) nên rẽ nhầm sang nhánh nước xiết', baiLam: bai(['turn_left()', 'h, a = flow()', 'u_turn()', 'h, b = flow()', 't = max(a, b)', 'if a == t:', '    u_turn()', 'move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên gọi move() sau khi chọn hướng nhánh êm', baiLam: bai(['turn_left()', 'h, a = flow()', 'u_turn()', 'h, b = flow()', 't = min(a, b)', 'if a == t:', '    u_turn()']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Luna: Hàm min(a, b) trả về số nhỏ hơn giữa hai sức nước a và b.', 'Luna: Nếu a == min(a, b) thì nhánh trái êm hơn nên cần gọi u_turn() quay lại hướng trái rồi gọi move().']
    }),

    manSucNuoc({
      so: 6, ten: 'Làm quen hàm max(a, b) chọn luồng nước xiết lướt nhanh', hang: 'luyen', nhipTheo: 'tong',
      deBai: 'Sola đổi bài toán: lần này phao Q nằm cách ngã ba (4, 2) tới 3 ô ở phía có dòng chảy xiết sức 2! Hãy quét hai bên lấy sức nước a và b, dùng if a == max(a, b): u_turn() để hướng mặt về nhánh có sức nước lớn hơn, rồi chỉ cần gọi move() một nhịp là dòng sức 2 đẩy xuồng tới thẳng Q!',
      veMaMau: 'Kiểm tra if a == max(a, b): u_turn() rồi gọi move().',
      san: [['#########', '#~~~~~~~#', '#Q~~~~~~#', '#########'], ['#########', '#~~~~~~~#', '#~~~~~~Q#', '#########']],
      dong: [
        [{ x: 3, y: 2, huong: 3, suc: 2 }, { x: 5, y: 2, huong: 1, suc: 1 }],
        [{ x: 3, y: 2, huong: 3, suc: 1 }, { x: 5, y: 2, huong: 1, suc: 2 }]
      ],
      batDau: [{ x: 4, y: 2, huong: 0 }, { x: 4, y: 2, huong: 0 }],
      maMau: bai(['turn_left()', 'h, a = flow()', 'u_turn()', 'h, b = flow()']),
      loiGiai: bai(['turn_left()', 'h, a = flow()', 'u_turn()', 'h, b = flow()', 't = max(a, b)', 'if a == t:', '    u_turn()', 'move()']),
      sao: { o: 15, nhip: 7 },
      loiGiaiKhac: {
        moTa: 'So sánh if a > b: u_turn() rồi gọi move()',
        baiLam: bai(['turn_left()', 'h, a = flow()', 'u_turn()', 'h, b = flow()', 'if a > b:', '    u_turn()', 'move()'])
      },
      loiSai: [
        { moTa: 'Dùng min(a, b) thay vì max(a, b) nên đi nhầm vào nhánh chảy chậm', baiLam: bai(['turn_left()', 'h, a = flow()', 'u_turn()', 'h, b = flow()', 't = min(a, b)', 'if a == t:', '    u_turn()', 'move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Chỉ rẽ trái rồi move() mà không đo nhánh phải', baiLam: bai(['turn_left()', 'move()']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Luna: Hàm max(a, b) trả về giá trị lớn hơn giữa a và b (tức là dòng sức 2).', 'Luna: Sau khi hướng về dòng sức 2, một lệnh move() giúp xuồng tiến 1 ô và trôi thêm 2 ô tới Q.']
    }),

    manSucNuoc({
      so: 7, ten: 'Đo sức dòng ngang để kéo bè vào nhánh êm', hang: 'bien-the', mucTieu: 'dua-vat', nhipTheo: 'tong',
      deBai: 'Sola nhờ bạn lai dắt bè B từ (4, 1) vào bến q nằm ở nhánh nước êm hơn (sức 1). Từ (4, 3) hướng Bắc, hãy gọi tow_to_tail() bắt B và thu dây về 1 ô, quét trái và phải tìm nhánh có min(a, b), rồi gọi forward(2) để kéo B vào đúng bến q!',
      veMaMau: 'Gọi tow_to_tail(), quét a và b chọn nhánh min(a, b), rồi gọi forward(2).',
      san: [
        ['#########', '#~~~B~~~#', '#~~~~~~~#', '#~q~~~~~#', '#########'],
        ['#########', '#~~~B~~~#', '#~~~~~~~#', '#~~~~~q~#', '#########']
      ],
      dong: [
        [{ x: 3, y: 3, huong: 3, suc: 1 }, { x: 5, y: 3, huong: 1, suc: 2 }],
        [{ x: 3, y: 3, huong: 3, suc: 2 }, { x: 5, y: 3, huong: 1, suc: 1 }]
      ],
      batDau: [{ x: 4, y: 3, huong: 0 }, { x: 4, y: 3, huong: 0 }],
      maMau: bai(['tow_to_tail()', 'turn_left()', 'h, a = flow()', 'u_turn()', 'h, b = flow()']),
      loiGiai: bai(['tow_to_tail()', 'turn_left()', 'h, a = flow()', 'u_turn()', 'h, b = flow()', 't = min(a, b)', 'if a == t:', '    u_turn()', 'forward(2)']),
      sao: { o: 24, nhip: 13 },
      loiGiaiKhac: {
        moTa: 'Quét chọn nhánh min(a, b) bằng if a < b: u_turn()',
        baiLam: bai(['tow_to_tail()', 'turn_left()', 'h, a = flow()', 'u_turn()', 'h, b = flow()', 'if a < b:', '    u_turn()', 'forward(2)'])
      },
      loiSai: [
        { moTa: 'Chỉ gọi move() thay vì forward(2) nên bè B mới tới (3, 3) hoặc (5, 3), chưa vào bến q', baiLam: bai(['tow_to_tail()', 'turn_left()', 'h, a = flow()', 'u_turn()', 'h, b = flow()', 't = min(a, b)', 'if a == t:', '    u_turn()', 'move()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Chọn nhầm nhánh max(a, b) nên kéo bè sang phía không có bến q', baiLam: bai(['tow_to_tail()', 'turn_left()', 'h, a = flow()', 'u_turn()', 'h, b = flow()', 't = max(a, b)', 'if a == t:', '    u_turn()', 'forward(2)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau tow_to_tail(), B ở (4, 2) cách xuồng 1 ô nên xuồng quay tại chỗ ở (4, 3) không làm vướng bè.', 'Luna: Sau khối if a == min(a, b): u_turn(), gọi forward(2) để kéo B vào bến q.']
    }),

    manSucNuoc({
      so: 8, ten: 'Thả neo chờ bè trôi theo sức nước 1 hoặc 2', hang: 'bien-the', mucTieu: 'dua-vat', nhipTheo: 'tong',
      deBai: 'Sola kết hợp mỏ neo và cảm biến sức nước: xuồng ở (2, 1) đứng trên dòng chảy xuống hẻm (2, 2), còn bè B ở (6, 1) đang trôi về Tây với sức nước s bằng 1 (sân 1) hoặc 2 (sân 2) giống như ô (3, 1) trước mũi. Hãy đọc h, s = flow(), gọi drop_anchor(); nếu s == 1 thì gọi thêm wait() 1 nhịp cho B kịp tới (4, 1), sau đó gọi tow_to_tail(), lift_anchor() và pair_step("R", 2) đưa B vào bến (2, 3)!',
      veMaMau: 'Đọc h, s = flow(), gọi drop_anchor(), nếu s == 1: wait(), rồi tow_to_tail(), lift_anchor(), pair_step("R", 2).',
      san: [
        ['########', '#~~~~~B#', '##~#~###', '##q#####', '##~#####', '########'],
        ['########', '#~~~~~B#', '##~#~###', '##q#####', '##~#####', '########']
      ],
      dong: [
        [{ x: 2, y: 1, huong: 2, suc: 1 }, { x: 3, y: 1, huong: 3, suc: 1 }, { x: 5, y: 1, huong: 3, suc: 1 }, { x: 6, y: 1, huong: 3, suc: 1 }, { x: 4, y: 1, huong: 2, suc: 1 }],
        [{ x: 2, y: 1, huong: 2, suc: 1 }, { x: 3, y: 1, huong: 3, suc: 2 }, { x: 6, y: 1, huong: 3, suc: 2 }, { x: 4, y: 1, huong: 2, suc: 1 }]
      ],
      batDau: [{ x: 2, y: 1, huong: 1 }, { x: 2, y: 1, huong: 1 }],
      maMau: bai(['h, s = flow()', 'drop_anchor()', 'if s == 1:', '    wait()']),
      loiGiai: bai(['h, s = flow()', 'drop_anchor()', 'if s == 1:', '    wait()', 'tow_to_tail()', 'lift_anchor()', 'pair_step("R", 2)']),
      sao: { o: 30, nhip: 15 },
      loiGiaiKhac: {
        moTa: 'Tính t = 2 - s rồi lặp for i in range(t): wait() sau khi thả neo',
        baiLam: bai(['h, s = flow()', 'drop_anchor()', 't = 2 - s', 'for i in range(t):', '    wait()', 'tow_to_tail()', 'lift_anchor()', 'pair_step("R", 2)'])
      },
      loiSai: [
        { moTa: 'Không chờ thêm nhịp khi s == 1 nên ở sân 1 bè B còn ở (5, 1) ngoài tầm lưới', baiLam: bai(['drop_anchor()', 'tow_to_tail()', 'lift_anchor()', 'pair_step("R", 2)']), phaiCoMa: ['keo-hut', 'chua-dua-vat'] },
        { moTa: 'Luôn gọi wait() trên cả hai sân nên ở sân 2 bè B ở (4, 1) bị cuốn tụt xuống ngách (4, 2)', baiLam: bai(['drop_anchor()', 'wait()', 'tow_to_tail()', 'lift_anchor()', 'pair_step("R", 2)']), phaiCoMa: ['keo-hut', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Trong nhịp drop_anchor(), bè B đã trôi được s ô (về (5, 1) ở sân 1, hoặc về thẳng (4, 1) ở sân 2).', 'Luna: Vì vậy chỉ khi s == 1 mới cần wait() thêm 1 nhịp trước khi gọi tow_to_tail(), lift_anchor() và pair_step("R", 2).']
    }),

    manSucNuoc({
      so: 9, ten: 'Lai dắt qua khúc cua rồi đo sức nước nhánh dọc', hang: 'bien-the', mucTieu: 'dua-vat', nhipTheo: 'tong',
      deBai: 'Sola nhờ bạn kéo đám lục bình L ở (4, 1) qua góc cua (2, 1) xuống bến q ở (2, 5): từ (2, 1) hướng Đông, hãy gọi tug_corner("R", 1) để bắt L, thu dây về 1 ô và tiến xuống (2, 2) hướng Nam. Lúc này ô (2, 3) trước mũi có dòng xuôi sức 1 hoặc 2; hãy đọc h, s = flow(), tính t = 4 - s rồi gọi forward(t) đưa L vào bến (2, 5)!',
      veMaMau: 'Đã có tug_corner("R", 1) và h, s = flow(). Viết t = 4 - s rồi gọi forward(t).',
      san: [
        ['######', '#~~~L#', '##~###', '##~###', '##~###', '##q###', '##~###', '######'],
        ['######', '#~~~L#', '##~###', '##~###', '##~###', '##q###', '##~###', '######']
      ],
      dong: [[{ x: 2, y: 3, huong: 2, suc: 1 }], [{ x: 2, y: 3, huong: 2, suc: 2 }]],
      batDau: [{ x: 2, y: 1, huong: 1 }, { x: 2, y: 1, huong: 1 }],
      maMau: bai(['tug_corner("R", 1)', 'h, s = flow()']),
      loiGiai: bai(['tug_corner("R", 1)', 'h, s = flow()', 't = 4 - s', 'forward(t)']),
      sao: { o: 24, nhip: 13 },
      loiGiaiKhac: {
        moTa: 'Viết tách tow_to_tail() và pair_step("R", 1) trước khi đo dòng',
        baiLam: bai(['tow_to_tail()', 'pair_step("R", 1)', 'h, s = flow()', 't = 4 - s', 'forward(t)'])
      },
      loiSai: [
        { moTa: 'Đếm cứng forward(2) sau khi vào nhánh dọc nên ở sân 1 lục bình L chưa tới bến', baiLam: bai(['tug_corner("R", 1)', 'forward(2)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên gọi forward(4 - s) sau khi đo dòng', baiLam: bai(['tug_corner("R", 1)', 'h, s = flow()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau tug_corner("R", 1), xuồng ở (2, 2) hướng Nam còn L ở (2, 1).', 'Luna: Xuồng cần tới (2, 6) cách 4 ô để kéo L vào (2, 5), nên tính t = 4 - s rồi gọi forward(t).']
    }),

    manSucNuoc({
      so: 10, ten: 'Trùm: Chọn nhánh êm bằng min(a, b) rồi bù sức nước giao bè', hang: 'trum', mucTieu: 'dua-vat', nhipTheo: 'tong',
      huyHieu: { ma: 'suc-nuoc', ten: 'Huy hiệu Đo sức nước' },
      deBai: 'Sola giao bài kiểm tra Trùm chương 1: từ ngã ba (4, 3) hướng Bắc, hãy gọi tow_to_tail() bắt bè B ở (4, 1) và thu dây về 1 ô, rồi quét hai nhánh trái (3, 3) và phải (5, 3) lấy sức nước a và b. Ở sân 1 nhánh êm có sức 1 (so với 2), còn ở sân 2 nhánh êm có sức 0 (so với 2)! Hãy quay về nhánh có min(a, b) rồi gọi forward(3 - min(a, b)) để kéo B vào đúng bến q!',
      veMaMau: 'Kết hợp tow_to_tail(), quét a và b chọn nhánh min(a, b), rồi gọi forward(3 - min(a, b)).',
      san: [
        ['#########', '#~~~B~~~#', '#~~~~~~~#', '#~q~~~~~#', '#########'],
        ['#########', '#~~~B~~~#', '#~~~~~~~#', '#~~~~~q~#', '#########']
      ],
      dong: [
        [{ x: 3, y: 3, huong: 3, suc: 1 }, { x: 5, y: 3, huong: 1, suc: 2 }],
        [{ x: 3, y: 3, huong: 3, suc: 2 }]
      ],
      batDau: [{ x: 4, y: 3, huong: 0 }, { x: 4, y: 3, huong: 0 }],
      maMau: bai(['tow_to_tail()', 'turn_left()', 'h, a = flow()', 'u_turn()', 'h, b = flow()']),
      loiGiai: bai(['tow_to_tail()', 'turn_left()', 'h, a = flow()', 'u_turn()', 'h, b = flow()', 't = min(a, b)', 'if a == t:', '    u_turn()', 't = min(a, b)', 'k = 3 - t', 'forward(k)']),
      sao: { o: 24, nhip: 14 },
      loiGiaiKhac: {
        moTa: 'Đọc lại h, s = flow() sau khi đã quay về nhánh êm rồi t = 3 - s, forward(t)',
        baiLam: bai(['tow_to_tail()', 'turn_left()', 'h, a = flow()', 'u_turn()', 'h, b = flow()', 't = min(a, b)', 'if a == t:', '    u_turn()', 'h, s = flow()', 't = 3 - s', 'forward(t)'])
      },
      loiSai: [
        { moTa: 'Đếm cứng forward(2) cho cả hai sân nên ở sân 2 nhánh nước êm sức 0 đi thiếu 1 ô', baiLam: bai(['tow_to_tail()', 'turn_left()', 'h, a = flow()', 'u_turn()', 'h, b = flow()', 't = min(a, b)', 'if a == t:', '    u_turn()', 'forward(2)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Chọn nhầm nhánh max(a, b) nên kéo bè vào dòng nước xiết sức 2', baiLam: bai(['tow_to_tail()', 'turn_left()', 'h, a = flow()', 'u_turn()', 'h, b = flow()', 't = max(a, b)', 'if a == t:', '    u_turn()', 'forward(2)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau khi kiểm tra if a == min(a, b): u_turn(), xuồng đã hướng về nhánh êm có sức đẩy đúng bằng min(a, b).', 'Luna: Gọi forward(3 - min(a, b)) để xuồng đi đủ 3 ô kéo B vào bến q trên cả hai sân.']
    }),

    /* ========================================================================
       CHUONG 2: che-suc-nuoc (10 man) - Che lenh: chon nhanh em nhat
       ======================================================================== */
    manCheSucNuoc({
      so: 1, ten: 'Chế hàm lấy sức nước flow_power()', hang: 'lam-quen', nhipTheo: 'tong',
      taoHam: ['flow_power'],
      deBai: 'Sola hướng dẫn: nhiều khi ta chỉ cần con số sức chảy s (0, 1 hoặc 2) của ô trước mũi. Hãy chế hàm flow_power() gồm 2 dòng: h, s = flow() và return s, rồi dùng vòng lặp 2 lần: p = flow_power(), t = 4 - p, forward(t) để vượt 2 chặng tới Q ở (9, 1)!',
      veMaMau: 'Viết h, s = flow() và return s trong hàm flow_power().',
      san: [['###########', '#~~~~~~~~Q#', '###########'], ['###########', '#~~~~~~~~Q#', '###########']],
      dong: [
        [{ x: 2, y: 1, huong: 1, suc: 2 }, { x: 6, y: 1, huong: 1, suc: 1 }],
        [{ x: 2, y: 1, huong: 1, suc: 1 }, { x: 6, y: 1, huong: 1, suc: 2 }]
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      maMau: bai(['for i in range(2):', '    p = flow_power()', '    t = 4 - p', '    forward(t)']),
      loiGiai: bai(['for i in range(2):', '    p = flow_power()', '    t = 4 - p', '    forward(t)'], { hamCuaEmMoi: [hFlowPower()] }),
      sao: { o: 9, nhip: 10 },
      loiGiaiKhac: {
        moTa: 'Viết t = flow() rồi return t[1] trong hàm flow_power()',
        baiLam: bai(['for i in range(2):', '    p = flow_power()', '    t = 4 - p', '    forward(t)']),
        hamCuaEmMoi: [hFlowPower(['t = flow()', 'return t[1]'])]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm flow_power()', baiLam: bai(['for i in range(2):', '    p = flow_power()', '    t = 4 - p', '    forward(t)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trả về cố định return 2 trong hàm flow_power() nên chặng sức 1 đi thiếu bước', baiLam: bai(['for i in range(2):', '    p = flow_power()', '    t = 4 - p', '    forward(t)']), hamCuaEmMoi: [hFlowPower(['h, s = flow()', 'return 2'])], phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Luna: Trong hàm flow_power(), dòng đầu tách h, s = flow() và dòng thứ hai trả về return s.', 'Luna: Chương trình chính đã có sẵn vòng lặp: p = flow_power(), t = 4 - p, forward(t).']
    }),

    manCheSucNuoc({
      so: 2, ten: 'Chế hàm tìm sức nước êm hơn calmer_power(a)', hang: 'lam-quen', nhipTheo: 'tong',
      hamCuaEmCan: KHO_TRUOC.concat(['flow_power']),
      taoHam: ['calmer_power'],
      deBai: 'Sola hướng dẫn: sau khi đọc sức nước nhánh trái a và quay sang nhánh phải, hãy đóng gói bước đọc nhánh phải b = flow_power() và trả về return min(a, b) vào hàm calmer_power(a). Dùng nó tại ngã ba (3, 2) để rẽ vào nhánh sức 1 và gọi move() tới Q!',
      veMaMau: 'Trong hàm calmer_power(a), viết b = flow_power() và return min(a, b).',
      san: [['#######', '#~~~~~#', '#Q~~~~#', '#######'], ['#######', '#~~~~~#', '#~~~~Q#', '#######']],
      dong: [
        [{ x: 2, y: 2, huong: 3, suc: 1 }, { x: 4, y: 2, huong: 1, suc: 2 }],
        [{ x: 2, y: 2, huong: 3, suc: 2 }, { x: 4, y: 2, huong: 1, suc: 1 }]
      ],
      batDau: [{ x: 3, y: 2, huong: 0 }, { x: 3, y: 2, huong: 0 }],
      maMau: bai(['turn_left()', 'a = flow_power()', 'u_turn()', 't = calmer_power(a)', 'if a == t:', '    u_turn()', 'move()']),
      loiGiai: bai(['turn_left()', 'a = flow_power()', 'u_turn()', 't = calmer_power(a)', 'if a == t:', '    u_turn()', 'move()'], { hamCuaEmMoi: [hCalmerPower()] }),
      sao: { o: 18, nhip: 7 },
      loiGiaiKhac: {
        moTa: 'Đặt tên biến p thay cho b trong calmer_power(a)',
        baiLam: bai(['turn_left()', 'a = flow_power()', 'u_turn()', 't = calmer_power(a)', 'if a == t:', '    u_turn()', 'move()']),
        hamCuaEmMoi: [hCalmerPower(['p = flow_power()', 'return min(a, p)'])]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm calmer_power(a)', baiLam: bai(['turn_left()', 'a = flow_power()', 'u_turn()', 't = calmer_power(a)', 'if a == t:', '    u_turn()', 'move()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Viết nhầm return max(a, b) trong calmer_power(a)', baiLam: bai(['turn_left()', 'a = flow_power()', 'u_turn()', 't = calmer_power(a)', 'if a == t:', '    u_turn()', 'move()']), hamCuaEmMoi: [hCalmerPower(['b = flow_power()', 'return max(a, b)'])], phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Luna: Hàm calmer_power(a) gồm 2 dòng: b = flow_power() và return min(a, b).', 'Luna: Giữ nguyên chương trình chính đã viết sẵn để kiểm tra hàm mới.']
    }),

    manCheSucNuoc({
      so: 3, ten: 'Chế hàm tìm sức nước mạnh hơn faster_power(a)', hang: 'co-ban', nhipTheo: 'tong',
      hamCuaEmCan: KHO_TRUOC.concat(['flow_power', 'calmer_power']),
      taoHam: ['faster_power'],
      deBai: 'Sola hướng dẫn: tương tự calmer_power(a), hãy chế hàm faster_power(a) gồm b = flow_power() và return max(a, b) khi cần mượn dòng chảy xiết để lướt nhanh. Dùng nó tại ngã ba (4, 2) để chọn luồng sức 2 và gọi move() lướt 3 ô tới thẳng Q!',
      veMaMau: 'Trong hàm faster_power(a), viết b = flow_power() và return max(a, b).',
      san: [['#########', '#~~~~~~~#', '#Q~~~~~~#', '#########'], ['#########', '#~~~~~~~#', '#~~~~~~Q#', '#########']],
      dong: [
        [{ x: 3, y: 2, huong: 3, suc: 2 }, { x: 5, y: 2, huong: 1, suc: 1 }],
        [{ x: 3, y: 2, huong: 3, suc: 1 }, { x: 5, y: 2, huong: 1, suc: 2 }]
      ],
      batDau: [{ x: 4, y: 2, huong: 0 }, { x: 4, y: 2, huong: 0 }],
      maMau: bai(['turn_left()', 'a = flow_power()', 'u_turn()', 't = faster_power(a)', 'if a == t:', '    u_turn()', 'move()']),
      loiGiai: bai(['turn_left()', 'a = flow_power()', 'u_turn()', 't = faster_power(a)', 'if a == t:', '    u_turn()', 'move()'], { hamCuaEmMoi: [hFasterPower()] }),
      sao: { o: 18, nhip: 7 },
      loiGiaiKhac: {
        moTa: 'Đặt tên biến p thay cho b trong faster_power(a)',
        baiLam: bai(['turn_left()', 'a = flow_power()', 'u_turn()', 't = faster_power(a)', 'if a == t:', '    u_turn()', 'move()']),
        hamCuaEmMoi: [hFasterPower(['p = flow_power()', 'return max(a, p)'])]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm faster_power(a)', baiLam: bai(['turn_left()', 'a = flow_power()', 'u_turn()', 't = faster_power(a)', 'if a == t:', '    u_turn()', 'move()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Viết nhầm return min(a, b) trong faster_power(a)', baiLam: bai(['turn_left()', 'a = flow_power()', 'u_turn()', 't = faster_power(a)', 'if a == t:', '    u_turn()', 'move()']), hamCuaEmMoi: [hFasterPower(['b = flow_power()', 'return min(a, b)'])], phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Luna: Hàm faster_power(a) gồm 2 dòng: b = flow_power() và return max(a, b).', 'Luna: Sau khi chọn được nhánh sức 2, lệnh move() đưa xuồng tới thẳng Q.']
    }),

    manCheSucNuoc({
      so: 4, ten: 'Chế hàm tự quay về nhánh êm hơn turn_to_calmer()', hang: 'co-ban', nhipTheo: 'tong',
      hamCuaEmCan: KHO_TRUOC.concat(['flow_power', 'calmer_power', 'faster_power']),
      taoHam: ['turn_to_calmer'],
      deBai: 'Sola hướng dẫn: thao tác quét nhánh trái a = flow_power(), gọi u_turn() rồi kiểm tra if a == calmer_power(a): u_turn() lặp lại ở mọi ngã ba. Hãy đóng gói cả 5 dòng đó vào hàm turn_to_calmer(), rồi ở chương trình chính chỉ cần gọi turn_to_calmer() và forward(2) để tới Q!',
      veMaMau: 'Viết hàm turn_to_calmer() quét hai bên và hướng mũi về phía calmer_power(a).',
      san: [['#########', '#~~~~~~~#', '#Q~~~~~~#', '#########'], ['#########', '#~~~~~~~#', '#~~~~~~Q#', '#########']],
      dong: [
        [{ x: 3, y: 2, huong: 3, suc: 1 }, { x: 5, y: 2, huong: 1, suc: 2 }],
        [{ x: 3, y: 2, huong: 3, suc: 2 }, { x: 5, y: 2, huong: 1, suc: 1 }]
      ],
      batDau: [{ x: 4, y: 2, huong: 0 }, { x: 4, y: 2, huong: 0 }],
      maMau: bai(['turn_to_calmer()', 'forward(2)']),
      loiGiai: bai(['turn_to_calmer()', 'forward(2)'], { hamCuaEmMoi: [hTurnToCalmer()] }),
      sao: { o: 21, nhip: 9 },
      loiGiaiKhac: {
        moTa: 'Gọi move() hai lần thay cho forward(2) sau turn_to_calmer()',
        baiLam: bai(['turn_to_calmer()', 'move()', 'move()']),
        hamCuaEmMoi: [hTurnToCalmer()]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm turn_to_calmer()', baiLam: bai(['turn_to_calmer()', 'forward(2)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên kiểm tra if a == calmer_power(a): u_turn() ở cuối turn_to_calmer()', baiLam: bai(['turn_to_calmer()', 'forward(2)']), hamCuaEmMoi: [hTurnToCalmer(['turn_left()', 'a = flow_power()', 'u_turn()'])], phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Luna: Trong turn_to_calmer(), viết lần lượt: turn_left(), a = flow_power(), u_turn(), rồi if a == calmer_power(a): u_turn().', 'Luna: Ở chương trình chính chỉ cần gọi turn_to_calmer() và forward(2).']
    }),

    manCheSucNuoc({
      so: 5, ten: 'Dùng turn_to_calmer() lai dắt bè vào nhánh êm', hang: 'luyen', mucTieu: 'dua-vat', nhipTheo: 'tong',
      hamCuaEmCan: KHO_TRUOC.concat(['flow_power', 'calmer_power', 'faster_power', 'turn_to_calmer']),
      deBai: 'Sola cho bạn thấy sức mạnh của hàm vừa chế: bài toán kéo bè B ở (4, 1) vào nhánh êm (sức 1) lúc trước cần 8 dòng lệnh, nay chỉ cần 3 dòng! Từ (4, 3) hướng Bắc, hãy gọi tow_to_tail(), turn_to_calmer() rồi forward(2) để đưa B vào bến q trên cả hai sân!',
      veMaMau: 'Gọi tow_to_tail(), turn_to_calmer() và forward(2).',
      san: [
        ['#########', '#~~~B~~~#', '#~~~~~~~#', '#~q~~~~~#', '#########'],
        ['#########', '#~~~B~~~#', '#~~~~~~~#', '#~~~~~q~#', '#########']
      ],
      dong: [
        [{ x: 3, y: 3, huong: 3, suc: 1 }, { x: 5, y: 3, huong: 1, suc: 2 }],
        [{ x: 3, y: 3, huong: 3, suc: 2 }, { x: 5, y: 3, huong: 1, suc: 1 }]
      ],
      batDau: [{ x: 4, y: 3, huong: 0 }, { x: 4, y: 3, huong: 0 }],
      maMau: bai(['tow_to_tail()', 'turn_to_calmer()']),
      loiGiai: bai(['tow_to_tail()', 'turn_to_calmer()', 'forward(2)']),
      sao: { o: 28, nhip: 13 },
      loiGiaiKhac: {
        moTa: 'Dùng hai lần move() thay cho forward(2)',
        baiLam: bai(['tow_to_tail()', 'turn_to_calmer()', 'move()', 'move()'])
      },
      loiSai: [
        { moTa: 'Gọi turn_to_calmer() trước tow_to_tail() nên khi tung lưới mũi xuồng đã xoay ngang, tung lưới hụt bè B', baiLam: bai(['turn_to_calmer()', 'tow_to_tail()', 'forward(2)']), phaiCoMa: ['keo-hut', 'chua-dua-vat'] },
        { moTa: 'Chỉ gọi move() thay vì forward(2) nên bè B chưa tới bến q', baiLam: bai(['tow_to_tail()', 'turn_to_calmer()', 'move()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Phải gọi tow_to_tail() lúc đầu khi mũi xuồng đang hướng về bè B ở (4, 1).', 'Luna: Sau turn_to_calmer(), gọi thêm forward(2) là hoàn tất.']
    }),

    manCheSucNuoc({
      so: 6, ten: 'Chế hàm chọn nhánh êm và tiến best_branch(n)', hang: 'luyen', nhipTheo: 'tong',
      hamCuaEmCan: KHO_TRUOC.concat(['flow_power', 'calmer_power', 'faster_power', 'turn_to_calmer']),
      taoHam: ['best_branch'],
      deBai: 'Sola hướng dẫn chế hàm thứ 5 của gói: hãy ghép turn_to_calmer() và forward(n) thành hàm best_branch(n). Từ (4, 4) hướng Bắc, hãy gọi move() tiến lên ngã ba (4, 3) rồi gọi best_branch(2) để rẽ vào nhánh êm và cập phao Q!',
      veMaMau: 'Viết hàm best_branch(n) gồm 2 dòng: turn_to_calmer() và forward(n).',
      san: [
        ['#########', '#~~~~~~~#', '#~~~~~~~#', '#Q~~~~~~#', '#~~~~~~~#', '#########'],
        ['#########', '#~~~~~~~#', '#~~~~~~~#', '#~~~~~~Q#', '#~~~~~~~#', '#########']
      ],
      dong: [
        [{ x: 3, y: 3, huong: 3, suc: 1 }, { x: 5, y: 3, huong: 1, suc: 2 }],
        [{ x: 3, y: 3, huong: 3, suc: 2 }, { x: 5, y: 3, huong: 1, suc: 1 }]
      ],
      batDau: [{ x: 4, y: 4, huong: 0 }, { x: 4, y: 4, huong: 0 }],
      maMau: bai(['move()', 'best_branch(2)']),
      loiGiai: bai(['move()', 'best_branch(2)'], { hamCuaEmMoi: [hBestBranch()] }),
      sao: { o: 23, nhip: 11 },
      loiGiaiKhac: {
        moTa: 'Dùng vòng lặp for i in range(n): move() trong best_branch(n)',
        baiLam: bai(['move()', 'best_branch(2)']),
        hamCuaEmMoi: [hBestBranch(['turn_to_calmer()', 'for i in range(n):', '    move()'])]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm best_branch(n)', baiLam: bai(['move()', 'best_branch(2)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên gọi forward(n) trong hàm best_branch(n)', baiLam: bai(['move()', 'best_branch(2)']), hamCuaEmMoi: [hBestBranch(['turn_to_calmer()'])], phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Luna: Trong best_branch(n), dòng 1 là turn_to_calmer() và dòng 2 là forward(n).', 'Luna: Chương trình chính đã có sẵn move() và best_branch(2).']
    }),

    manCheSucNuoc({
      so: 7, ten: 'Sửa hàm fix_min_flow() chọn nhầm dòng nước xiết', hang: 'sua-ham', mucTieu: 'dua-vat', nhipTheo: 'tong',
      chinhCoDinh: true,
      hamCuaEmCan: KHO_TRUOC.concat(['flow_power', 'calmer_power', 'faster_power', 'turn_to_calmer', 'best_branch']),
      deBai: 'Sola phát hiện lỗi trong hàm fix_min_flow(n) của màn: hàm này cần chọn nhánh êm hơn để kéo bè B vào bến q, nhưng ai đó lại gọi nhầm faster_power(a) thay vì calmer_power(a) khiến xuồng rẽ sang nhánh nước xiết sức 2! Hãy sửa lại hàm fix_min_flow(n) cho đúng!',
      veMaMau: 'Sửa faster_power(a) thành calmer_power(a) (hoặc rút gọn bằng best_branch(n)) trong fix_min_flow(n).',
      san: [
        ['#########', '#~~~B~~~#', '#~~~~~~~#', '#~q~~~~~#', '#########'],
        ['#########', '#~~~B~~~#', '#~~~~~~~#', '#~~~~~q~#', '#########']
      ],
      dong: [
        [{ x: 3, y: 3, huong: 3, suc: 1 }, { x: 5, y: 3, huong: 1, suc: 2 }],
        [{ x: 3, y: 3, huong: 3, suc: 2 }, { x: 5, y: 3, huong: 1, suc: 1 }]
      ],
      batDau: [{ x: 4, y: 3, huong: 0 }, { x: 4, y: 3, huong: 0 }],
      maMau: bai(['tow_to_tail()', 'fix_min_flow(2)'], { hamCuaMan: [hFixMinFlow(T_FIX_MIN_SAI)] }),
      loiGiai: bai(['tow_to_tail()', 'fix_min_flow(2)'], { hamCuaMan: [hFixMinFlow(T_FIX_MIN_DUNG)] }),
      sao: { o: 28, nhip: 13 },
      loiGiaiKhac: {
        moTa: 'Rút gọn thân hàm fix_min_flow(n) bằng cách gọi best_branch(n)',
        baiLam: bai(['tow_to_tail()', 'fix_min_flow(2)'], { hamCuaMan: [hFixMinFlow(['best_branch(n)'])] })
      },
      loiSai: [
        { moTa: 'Giữ nguyên faster_power(a) chưa sửa nên kéo bè sang nhánh nước xiết', baiLam: bai(['tow_to_tail()', 'fix_min_flow(2)'], { hamCuaMan: [hFixMinFlow(T_FIX_MIN_SAI)] }), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Xóa mất forward(n) ở cuối hàm fix_min_flow(n)', baiLam: bai(['tow_to_tail()', 'fix_min_flow(2)'], { hamCuaMan: [hFixMinFlow(['turn_to_calmer()'])] }), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Nhìn dòng if a == faster_power(a): trong hàm fix_min_flow(n).', 'Luna: Đổi faster_power(a) thành calmer_power(a) để xuồng quay về nhánh êm hơn.']
    }),

    manCheSucNuoc({
      so: 8, ten: 'Kết hợp tow_to_tail() và best_branch(n) tại ngã ba', hang: 'bien-the', mucTieu: 'dua-vat', nhipTheo: 'tong',
      hamCuaEmCan: KHO_TRUOC.concat(['flow_power', 'calmer_power', 'faster_power', 'turn_to_calmer', 'best_branch']),
      deBai: 'Sola nhờ bạn cứu hộ bè B đang nằm ở (4, 1) phía trên ngã ba (4, 3): xuồng xuất phát ở (4, 3) hướng Bắc. Hãy gọi tow_to_tail() để bắt B ở (4, 1) và thu dây về 1 ô tại (4, 2), rồi gọi best_branch(2) đưa B vào bến q ở nhánh êm!',
      veMaMau: 'Gọi tow_to_tail() rồi best_branch(2).',
      san: [
        ['#########', '#~~~B~~~#', '#~~~~~~~#', '#~q~~~~~#', '#~~~~~~~#', '#########'],
        ['#########', '#~~~B~~~#', '#~~~~~~~#', '#~~~~~q~#', '#~~~~~~~#', '#########']
      ],
      dong: [
        [{ x: 3, y: 3, huong: 3, suc: 1 }, { x: 5, y: 3, huong: 1, suc: 2 }],
        [{ x: 3, y: 3, huong: 3, suc: 2 }, { x: 5, y: 3, huong: 1, suc: 1 }]
      ],
      batDau: [{ x: 4, y: 3, huong: 0 }, { x: 4, y: 3, huong: 0 }],
      maMau: bai(['tow_to_tail()']),
      loiGiai: bai(['tow_to_tail()', 'best_branch(2)']),
      sao: { o: 29, nhip: 13 },
      loiGiaiKhac: {
        moTa: 'Dùng turn_to_calmer() và forward(2) thay cho best_branch(2)',
        baiLam: bai(['tow_to_tail()', 'turn_to_calmer()', 'forward(2)'])
      },
      loiSai: [
        { moTa: 'Mới gọi tow_to_tail() mà chưa gọi best_branch(2) để kéo bè vào nhánh êm', baiLam: bai(['tow_to_tail()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Gọi best_branch(1) nên bè B mới tới (3, 3) hoặc (5, 3), chưa vào bến q', baiLam: bai(['tow_to_tail()', 'best_branch(1)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau tow_to_tail(), xuồng đứng tại ngã ba (4, 3) còn bè B ở (4, 2).', 'Luna: Gọi tiếp best_branch(2) để chọn nhánh êm và kéo B vào bến q.']
    }),

    manCheSucNuoc({
      so: 9, ten: 'Bù sức nước biến thiên sau khi rẽ vào nhánh êm', hang: 'bien-the', mucTieu: 'dua-vat', nhipTheo: 'tong',
      hamCuaEmCan: KHO_TRUOC.concat(['flow_power', 'calmer_power', 'faster_power', 'turn_to_calmer', 'best_branch']),
      deBai: 'Sola tăng độ khó: ở sân 1 nhánh êm hơn có sức đẩy 1 (so với 2), còn ở sân 2 nhánh êm hơn là nước lặng sức 0 (so với 1)! Từ (4, 3) hướng Bắc, hãy gọi tow_to_tail() bắt bè B ở (4, 1) và thu dây về 1 ô, gọi turn_to_calmer() để hướng về nhánh êm hơn, rồi đọc p = flow_power(), tính t = 3 - p và gọi forward(t) để bù đúng số bước đưa B vào bến q!',
      veMaMau: 'Đã có tow_to_tail(), turn_to_calmer(). Viết p = flow_power(), t = 3 - p rồi forward(t).',
      san: [
        ['#########', '#~~~B~~~#', '#~~~~~~~#', '#~q~~~~~#', '#########'],
        ['#########', '#~~~B~~~#', '#~~~~~~~#', '#~~~~~q~#', '#########']
      ],
      dong: [
        [{ x: 3, y: 3, huong: 3, suc: 1 }, { x: 5, y: 3, huong: 1, suc: 2 }],
        [{ x: 3, y: 3, huong: 3, suc: 1 }]
      ],
      batDau: [{ x: 4, y: 3, huong: 0 }, { x: 4, y: 3, huong: 0 }],
      maMau: bai(['tow_to_tail()', 'turn_to_calmer()']),
      loiGiai: bai(['tow_to_tail()', 'turn_to_calmer()', 'p = flow_power()', 't = 3 - p', 'forward(t)']),
      sao: { o: 28, nhip: 14 },
      loiGiaiKhac: {
        moTa: 'Đặt tên biến s thay cho p sau khi quay về nhánh êm',
        baiLam: bai(['tow_to_tail()', 'turn_to_calmer()', 's = flow_power()', 't = 3 - s', 'forward(t)'])
      },
      loiSai: [
        { moTa: 'Gọi best_branch(2) cố định nên ở sân 2 nhánh sức 0 đi thiếu 1 ô', baiLam: bai(['tow_to_tail()', 'best_branch(2)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên gọi tow_to_tail() trước khi rẽ vào nhánh êm nên bè B bị bỏ lại', baiLam: bai(['turn_to_calmer()', 'p = flow_power()', 't = 3 - p', 'forward(t)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau khi turn_to_calmer() chạy xong, mũi xuồng đang nhìn thẳng vào nhánh êm đã chọn.', 'Luna: Đọc p = flow_power(), t = 3 - p rồi forward(t) để đi 2 bước khi sức nước là 1 và 3 bước khi sức nước là 0.']
    }),

    manCheSucNuoc({
      so: 10, ten: 'Trùm: Vượt kênh biến thiên và chọn nhánh êm giao bè', hang: 'trum', mucTieu: 'dua-vat', nhipTheo: 'tong',
      huyHieu: { ma: 'che-suc-nuoc', ten: 'Huy hiệu Chế lệnh: chọn nhánh êm nhất' },
      hamCuaEmCan: KHO_TRUOC.concat(['flow_power', 'calmer_power', 'faster_power', 'turn_to_calmer', 'best_branch']),
      deBai: 'Sola giao bài kiểm tra Trùm Gói 7: xuồng xuất phát ở (4, 6) hướng Nam với bè B ở (4, 8). Hãy gọi tow_to_tail() bắt B và thu dây về 1 ô, rồi gọi u_turn() quay lên Bắc. Chặng dọc dài 4 ô lên ngã ba (4, 2) có dòng xuôi ở (4, 5) mạnh 1 hoặc 2; tại ngã ba (4, 2), nhánh êm hơn có sức đẩy 1 (sân 1) hoặc 0 (sân 2). Mỗi chặng đọc p = flow_power(), tính t (4 - p ở chặng dọc, 3 - p sau turn_to_calmer()) rồi forward(t) để đưa B vào bến q!',
      veMaMau: 'Đã có chặng dọc (p = flow_power(), t = 4 - p, forward(t)). Thêm turn_to_calmer(), rồi đọc lại p, t = 3 - p, forward(t).',
      san: [
        ['#########', '#~~~~~~~#', '#~q~~~~~#', '####~####', '####~####', '####~####', '####~####', '####~####', '####B####', '#########'],
        ['#########', '#~~~~~~~#', '#~~~~~q~#', '####~####', '####~####', '####~####', '####~####', '####~####', '####B####', '#########']
      ],
      dong: [
        [{ x: 4, y: 5, huong: 0, suc: 1 }, { x: 3, y: 2, huong: 3, suc: 1 }, { x: 5, y: 2, huong: 1, suc: 2 }],
        [{ x: 4, y: 5, huong: 0, suc: 2 }, { x: 3, y: 2, huong: 3, suc: 1 }]
      ],
      batDau: [{ x: 4, y: 6, huong: 2 }, { x: 4, y: 6, huong: 2 }],
      maMau: bai(['tow_to_tail()', 'u_turn()', 'p = flow_power()', 't = 4 - p', 'forward(t)']),
      loiGiai: bai(['tow_to_tail()', 'u_turn()', 'p = flow_power()', 't = 4 - p', 'forward(t)', 'turn_to_calmer()', 'p = flow_power()', 't = 3 - p', 'forward(t)']),
      sao: { o: 31, nhip: 21 },
      loiGiaiKhac: {
        moTa: 'Tách biến s1 và s2 ở hai chặng dọc và ngang',
        baiLam: bai(['tow_to_tail()', 'u_turn()', 's1 = flow_power()', 't = 4 - s1', 'forward(t)', 'turn_to_calmer()', 's2 = flow_power()', 't = 3 - s2', 'forward(t)'])
      },
      loiSai: [
        { moTa: 'Đếm cứng forward(3) ở chặng dọc nên ở sân 2 đi lố qua ngã ba, rẽ lệch khỏi bến q', baiLam: bai(['tow_to_tail()', 'u_turn()', 'forward(3)', 'turn_to_calmer()', 'p = flow_power()', 't = 3 - p', 'forward(t)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Dùng best_branch(2) cố định ở ngã ba nên sân 2 nhánh nước êm sức 0 đi thiếu 1 ô', baiLam: bai(['tow_to_tail()', 'u_turn()', 'p = flow_power()', 't = 4 - p', 'forward(t)', 'best_branch(2)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau tow_to_tail(), u_turn() và chặng p = flow_power(), t = 4 - p, forward(t), xuồng dừng đúng tại ngã ba (4, 2) trên cả hai sân.', 'Luna: Gọi tiếp turn_to_calmer() rồi p = flow_power(), t = 3 - p, forward(t) để kéo bè B vào bến q.']
    })
  ];

  if (M && M.them) M.manSucNuoc = DS;
  if (typeof module !== 'undefined' && module.exports) module.exports = M;
})();
