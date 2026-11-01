/* ============================================================================
   man-buoc-duoi.js — Mùa 5 (Bến sông) · Gói 6: Nâng cấp tay Lai dắt theo đuôi
   Chương 1: buoc-duoi (10 màn) — Lai dắt theo đuôi
   Chương 2: che-buoc-duoi (10 màn) — Chế lệnh: kéo bè qua khúc cua
   ========================================================================== */
(function () {
  'use strict';

  var M = (typeof window !== 'undefined' && window.ManHoc) ||
    (typeof require === 'function' ? require('./man-chuoi-1.js') : null);

  var GOC_DUOI = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'tow', 'drop_tow', 'flow_dir', 'anchor', 'unanchor', 'tether', 'untether'];
  var ROBOT_DUOI = { than: 'xuong', tay: 'day-keo', camBien: [{ ma: 'dong-chay', o: 'tren' }] };
  var CAU_TRUC = ['for', 'if', 'while', 'list', 'def', 'return', 'tuple'];

  var KHO_TRUOC = [
    'move', 'turn_left', 'turn_right', 'u_turn', 'back', 'forward',
    'span_dist', 'round_steps', 'calm_bonus', 'turn_code', 'sail_to',
    'tow_grab', 'tow_drop', 'pull_back', 'pair_step', 'tow_pair',
    'is_calm_front', 'flow_step', 'scan_calm_side', 'tow_in_calm', 'pick_calm_lane',
    'flip_valve', 'open_gate_pass', 'shut_stream_tow', 'valve_and_back', 'lock_rescue',
    'drop_anchor', 'lift_anchor', 'anchor_wait', 'anchor_tow', 'hold_and_valve'
  ];

  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function bai(chinh, phu) {
    var kq = { chinh: chinh.slice(), hamCuaMan: [], hamCuaEmMoi: [] };
    if (phu && phu.hamCuaMan) kq.hamCuaMan = phu.hamCuaMan;
    if (phu && phu.hamCuaEmMoi) kq.hamCuaEmMoi = phu.hamCuaEmMoi;
    return kq;
  }

  var T_TETHER_GRAB = ['tether()', 'wait()'];
  var T_TETHER_DROP = ['untether()', 'wait()'];
  var T_TOW_TO_TAIL = ['tow_grab()', 'tether_grab()'];
  var T_TUG_CORNER = ['tow_to_tail()', 'pair_step(d, n)'];
  var T_DELIVER_TAIL = ['tug_corner(d, n)', 'tether_drop()'];
  var T_FIX_TAIL_SAI = ['tug_corner(d, n)'];
  var T_FIX_TAIL_DUNG = ['tug_corner(d, n)', 'tether_drop()'];

  function hTetherGrab(than) { return H('tether_grab', [], than || T_TETHER_GRAB); }
  function hTetherDrop(than) { return H('tether_drop', [], than || T_TETHER_DROP); }
  function hTowToTail(than) { return H('tow_to_tail', [], than || T_TOW_TO_TAIL); }
  function hTugCorner(than) { return H('tug_corner', ['d', 'n'], than || T_TUG_CORNER); }
  function hDeliverTail(than) { return H('deliver_tail', ['d', 'n'], than || T_DELIVER_TAIL); }
  function hFixTailDrop(than) { return H('fix_tail_drop', ['d', 'n'], than || T_FIX_TAIL_DUNG); }

  function manBuocDuoi(c) {
    return Object.assign({
      chuong: 'buoc-duoi', tenChuong: 'Lai dắt theo đuôi',
      loaiRobot: 'xuong', robot: ROBOT_DUOI, mucTieu: 'dua-vat',
      hamGoc: GOC_DUOI, hamCuaEmCan: KHO_TRUOC, cauTruc: CAU_TRUC
    }, c, { ma: 'buoc-duoi.' + c.so });
  }

  function manCheBuocDuoi(c) {
    return Object.assign({
      chuong: 'che-buoc-duoi', tenChuong: 'Chế lệnh: kéo bè qua khúc cua',
      loaiRobot: 'xuong', robot: ROBOT_DUOI, mucTieu: 'dua-vat',
      hamGoc: GOC_DUOI, hamCuaEmCan: KHO_TRUOC, cauTruc: CAU_TRUC
    }, c, { ma: 'che-buoc-duoi.' + c.so });
  }

  var MAN = [
    /* ========================================================================
       CHƯƠNG 1: buoc-duoi (10 màn) — Lai dắt theo đuôi
       ======================================================================== */
    manBuocDuoi({
      so: 1, ten: 'Làm quen buộc bè sau đuôi tether()', hang: 'lam-quen',
      chiChay: true,
      deBai: 'Sola giới thiệu nâng cấp dây phao: lệnh tether() (kèm wait()) chuyển bè đang kéo ở mũi ra ô ngay sau đuôi xuồng, còn untether() (kèm wait()) tháo dây thả bè ra. Hãy bấm Chạy xem xuồng kéo bè B ở (5, 1) về mũi, chuyển B ra sau đuôi (1, 1) rồi tháo dây để dòng nước ở (1, 1) đưa B vào bến q ở (1, 2)!',
      veMaMau: 'Màn làm quen chỉ chạy: bấm Chạy để quan sát tether() và untether().',
      san: [
        '#######',
        '#~~~~B#',
        '#q#####',
        '#######'
      ],
      dong: [{ x: 1, y: 1, huong: 2, suc: 1 }],
      batDau: { x: 2, y: 1, huong: 1 },
      maMau: bai(['tow_grab()', 'tether()', 'wait()', 'untether()', 'wait()']),
      loiGiai: bai(['tow_grab()', 'tether()', 'wait()', 'untether()', 'wait()']),
      sao: { o: 7, nhip: 3 },
      loiSai: [],
      goiY: ['Luna: Bấm nút Chạy để xem tether() chuyển bè từ mũi ra sau đuôi và untether() tháo dây thả bè.']
    }),

    manBuocDuoi({
      so: 2, ten: 'Buộc bè ngay sau đuôi', hang: 'lam-quen',
      deBai: 'Sola chỉ thêm: khi mũi xuồng chưa kéo gì mà ở ô ngay sau đuôi có sẵn vật nổi, gọi tether() rồi wait() sẽ buộc luôn vật đó vào đuôi mà không cần quay đầu! Bè B đang nằm ở (1, 1) ngay sau đuôi xuồng (2, 1). Hãy gọi tether(), wait() rồi forward(3) để kéo B theo sau vào bến q ở (4, 1)!',
      veMaMau: 'Gọi tether(), wait() rồi forward(3).',
      san: [
        '########',
        '#B~~q~~#',
        '########'
      ],
      dong: [],
      batDau: { x: 2, y: 1, huong: 1 },
      maMau: bai(['tether()', 'wait()']),
      loiGiai: bai(['tether()', 'wait()', 'forward(3)']),
      sao: { o: 8, nhip: 4 },
      loiGiaiKhac: {
        moTa: 'Gọi move() ba lần sau khi buộc đuôi',
        baiLam: bai(['tether()', 'wait()', 'move()', 'move()', 'move()'])
      },
      loiSai: [
        { moTa: 'Dùng tow_grab() thay vì tether(), wait() khi bè đang nằm sau đuôi nên bắn dây hụt về phía trước', baiLam: bai(['tow_grab()', 'forward(3)']), phaiCoMa: ['keo-hut', 'chua-dua-vat'] },
        { moTa: 'Chỉ tiến 2 ô nên bè B mới tới (3, 1), chưa vào bến (4, 1)', baiLam: bai(['tether()', 'wait()', 'forward(2)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Khi bè buộc ở đuôi, bè luôn đi sau xuồng 1 ô như toa tàu.', 'Luna: Muốn bè B vào ô (4, 1), xuồng cần tiến 3 ô từ (2, 1) sang (5, 1) bằng forward(3).']
    }),

    manBuocDuoi({
      so: 3, ten: 'Kéo bè qua khúc cua hẹp chữ L', hang: 'lam-quen',
      deBai: 'Sola giải thích ưu thế lớn nhất của lai dắt theo đuôi: khi bè ở mũi, xuồng không thể quay 90 độ trong góc kênh hẹp 1 ô vì bè sẽ đập tường (mui-vuong). Nhưng khi bè buộc ở đuôi, xuồng quay tại chỗ thoải mái rồi tiến tiếp, kéo bè đi theo đúng quỹ đạo! Hãy gọi tow_grab(), tether(), wait(), rồi forward(2) và pair_step("R", 3) để đưa bè B qua góc cua (4, 1) xuống bến q ở (4, 3)!',
      veMaMau: 'Gọi tow_grab(), tether(), wait(), forward(2) và pair_step("R", 3).',
      san: [
        '######',
        '#~~~B#',
        '####~#',
        '####q#',
        '####~#',
        '######'
      ],
      dong: [],
      batDau: { x: 2, y: 1, huong: 1 },
      maMau: bai(['tow_grab()', 'tether()', 'wait()']),
      loiGiai: bai(['tow_grab()', 'tether()', 'wait()', 'forward(2)', 'pair_step("R", 3)']),
      sao: { o: 20, nhip: 8 },
      loiGiaiKhac: {
        moTa: 'Tách pair_step("R", 3) thành turn_right() và forward(3)',
        baiLam: bai(['tow_grab()', 'tether()', 'wait()', 'forward(2)', 'turn_right()', 'forward(3)'])
      },
      loiSai: [
        { moTa: 'Không chuyển bè ra đuôi bằng tether() nên khi quay phải ở góc hẹp bị vướng mũi', baiLam: bai(['tow_grab()', 'move()', 'turn_right()', 'forward(2)']), phaiCoMa: ['mui-vuong', 'chua-dua-vat'] },
        { moTa: 'Mới chuyển bè ra đuôi mà chưa tiến tới góc cua và rẽ phải', baiLam: bai(['tow_grab()', 'tether()', 'wait()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau tow_grab(), tether(), wait(), bè B đã chuyển ra sau đuôi tại (1, 1).', 'Luna: Gọi forward(2) để xuồng tới góc (4, 1), rồi pair_step("R", 3) để rẽ xuống (4, 4) kéo B vào (4, 3).']
    }),

    manBuocDuoi({
      so: 4, ten: 'Mở lối qua kênh hẹp bị bè chắn', hang: 'luyen', mucTieu: 'toi-co',
      deBai: 'Sola chỉ ra mẹo thông luồng: bè B ở (5, 1) đang chắn ngang con kênh độc đạo dẫn tới cờ Q ở (7, 1). Nếu chỉ kéo B ở mũi rồi tiến tới thì B sẽ bị kẹt cứng vào bờ tường sau cờ Q khiến xuồng không vào được Q! Hãy gọi tow_grab() kéo B về mũi (3, 1), dùng tether() và wait() chuyển B ra sau đuôi (1, 1), rồi gọi forward(5) lướt thẳng tới cờ Q!',
      veMaMau: 'Gọi tow_grab(), tether(), wait() rồi forward(5).',
      san: [
        '#########',
        '#~~~~B~Q#',
        '#########'
      ],
      dong: [],
      batDau: { x: 2, y: 1, huong: 1 },
      maMau: bai(['tow_grab()', 'tether()', 'wait()']),
      loiGiai: bai(['tow_grab()', 'tether()', 'wait()', 'forward(5)']),
      sao: { o: 11, nhip: 7 },
      loiGiaiKhac: {
        moTa: 'Dùng tow(), wait() thay cho tow_grab()',
        baiLam: bai(['tow()', 'wait()', 'tether()', 'wait()', 'forward(5)'])
      },
      loiSai: [
        { moTa: 'Quên chuyển bè ra đuôi nên đẩy bè B chắn mất ô cờ Q', baiLam: bai(['tow_grab()', 'forward(5)']), phaiCoMa: ['mui-vuong', 'chua-toi-co'] },
        { moTa: 'Chỉ tiến 4 ô sau khi chuyển bè ra đuôi nên xuồng chưa tới cờ Q ở (7, 1)', baiLam: bai(['tow_grab()', 'tether()', 'wait()', 'forward(4)']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Luna: Khi chuyển B ra sau đuôi (1, 1) bằng tether() và wait(), đường phía trước mũi xuồng hoàn toàn trống trải.', 'Luna: Gọi tiếp forward(5) để xuồng từ (2, 1) tiến thẳng tới cờ Q ở (7, 1).']
    }),

    manBuocDuoi({
      so: 5, ten: 'Thả bè vào nhánh nước chảy bằng untether()', hang: 'luyen',
      deBai: 'Sola hướng dẫn: đám lục bình L đang nằm ở (1, 1) ngay sau đuôi xuồng (2, 1). Ô (3, 1) có dòng chảy sang Đông, còn ô (4, 1) có dòng chảy rẽ xuống bến q ở (4, 2). Khi L đang buộc vào xuồng, L đi theo xuồng chứ không tự trôi theo dòng ở (4, 1). Hãy gọi tether(), wait() buộc L vào đuôi, gọi move() hai lần để đưa xuồng sang vùng nước êm (5, 1) và kéo L vào đúng ô dòng (4, 1), rồi gọi untether(), wait() thả L trôi xuống bến q!',
      veMaMau: 'Gọi tether(), wait(), hai lần move(), rồi untether(), wait().',
      san: [
        '#######',
        '#L~~~~#',
        '####q##',
        '#######'
      ],
      dong: [{ x: 3, y: 1, huong: 1, suc: 1 }, { x: 4, y: 1, huong: 2, suc: 1 }],
      batDau: { x: 2, y: 1, huong: 1 },
      maMau: bai(['tether()', 'wait()', 'move()', 'move()']),
      loiGiai: bai(['tether()', 'wait()', 'move()', 'move()', 'untether()', 'wait()']),
      sao: { o: 9, nhip: 4 },
      loiGiaiKhac: {
        moTa: 'Dùng forward(2) thay cho hai lệnh move()',
        baiLam: bai(['tether()', 'wait()', 'forward(2)', 'untether()', 'wait()'])
      },
      loiSai: [
        { moTa: 'Quên gọi untether(), wait() ở cuối nên lục bình vẫn buộc vào xuồng và không trôi xuống bến (4, 2)', baiLam: bai(['tether()', 'wait()', 'move()', 'move()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên gọi wait() sau untether() nên lệnh tháo dây chưa kịp chạy', baiLam: bai(['tether()', 'wait()', 'move()', 'move()', 'untether()']), phaiCoMa: ['quen-wait'] }
      ],
      goiY: ['Luna: Sau hai lần move(), xuồng đã ở vùng nước êm (5, 1) và L đang nằm ngay trên dòng chảy (4, 1).', 'Luna: Thêm untether() và wait() ở cuối để tháo dây cho dòng nước đẩy L xuống bến (4, 2).']
    }),

    manBuocDuoi({
      so: 6, ten: 'Luồn lách khúc cua chữ Z', hang: 'luyen',
      deBai: 'Sola thử thách tay lái lụa: con kênh gấp khúc chữ Z liên tiếp chỉ rộng đúng 1 ô! Hãy gọi tow_grab(), tether(), wait() để chuyển bè B từ (4, 1) ra sau đuôi (1, 1), rồi lần lượt gọi forward(2), pair_step("R", 2), pair_step("L", 1) và pair_step("R", 2) để dắt B qua cả 3 góc cua vào bến q ở (5, 4)!',
      veMaMau: 'Gọi tow_grab(), tether(), wait(), forward(2), pair_step("R", 2), pair_step("L", 1), pair_step("R", 2).',
      san: [
        '#######',
        '#~~~B##',
        '####~##',
        '####~~#',
        '#####q#',
        '#####~#',
        '#######'
      ],
      dong: [],
      batDau: { x: 2, y: 1, huong: 1 },
      maMau: bai(['tow_grab()', 'tether()', 'wait()', 'forward(2)']),
      loiGiai: bai(['tow_grab()', 'tether()', 'wait()', 'forward(2)', 'pair_step("R", 2)', 'pair_step("L", 1)', 'pair_step("R", 2)']),
      sao: { o: 24, nhip: 12 },
      loiGiaiKhac: {
        moTa: 'Tách forward(2) đầu tiên thành hai lệnh move()',
        baiLam: bai(['tow_grab()', 'tether()', 'wait()', 'move()', 'move()', 'pair_step("R", 2)', 'pair_step("L", 1)', 'pair_step("R", 2)'])
      },
      loiSai: [
        { moTa: 'Ở góc cuối chỉ đi 1 bước pair_step("R", 1) nên xuồng mới tới (5, 4) còn bè B vẫn ở (5, 3)', baiLam: bai(['tow_grab()', 'tether()', 'wait()', 'forward(2)', 'pair_step("R", 2)', 'pair_step("L", 1)', 'pair_step("R", 1)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên chuyển bè ra sau đuôi nên bị vướng mũi ngay góc cua đầu tiên', baiLam: bai(['tow_grab()', 'forward(2)', 'pair_step("R", 2)', 'pair_step("L", 1)', 'pair_step("R", 2)']), phaiCoMa: ['mui-vuong', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau forward(2), xuồng đang ở góc cua thứ nhất (4, 1).', 'Luna: Gọi tiếp pair_step("R", 2) xuống (4, 3), pair_step("L", 1) sang (5, 3), và pair_step("R", 2) xuống (5, 5) để kéo B vào (5, 4).']
    }),

    manBuocDuoi({
      so: 7, ten: 'Đọc dòng chảy chọn nhánh rẽ ở ngã ba', hang: 'bien-the', nhipTheo: 'tong',
      deBai: 'Sola đưa bài toán 2 sân: bè B đang ở (1, 3) ngay sau đuôi xuồng (2, 3). Hãy buộc B vào đuôi bằng tether(), wait() rồi gọi forward(2) tới ngã ba (4, 3). Tại (4, 3), hãy đọc chong chóng ở ô (5, 3) trước mũi: nếu flow_dir() == "left" thì bến q nằm ở nhánh Bắc (gọi pair_step("L", 3)); ngược lại bến q nằm ở nhánh Nam (gọi pair_step("R", 3))!',
      veMaMau: 'Buộc đuôi, tiến 2 ô tới ngã ba, rồi dùng if flow_dir() == "left": pair_step("L", 3) else: pair_step("R", 3).',
      san: [
        [
          '####~##',
          '####q##',
          '####~##',
          '#B~~~~#',
          '####~##',
          '####~##',
          '####~##'
        ],
        [
          '####~##',
          '####~##',
          '####~##',
          '#B~~~~#',
          '####~##',
          '####q##',
          '####~##'
        ]
      ],
      dong: [
        [{ x: 5, y: 3, huong: 0, suc: 1 }],
        [{ x: 5, y: 3, huong: 2, suc: 1 }]
      ],
      batDau: [{ x: 2, y: 3, huong: 1 }, { x: 2, y: 3, huong: 1 }],
      maMau: bai(['tether()', 'wait()', 'forward(2)', 'if flow_dir() == "left":', '    pair_step("L", 3)']),
      loiGiai: bai(['tether()', 'wait()', 'forward(2)', 'if flow_dir() == "left":', '    pair_step("L", 3)', 'else:', '    pair_step("R", 3)']),
      sao: { o: 22, nhip: 14 },
      loiGiaiKhac: {
        moTa: 'Kiểm tra if flow_dir() == "right": pair_step("R", 3) else: pair_step("L", 3)',
        baiLam: bai(['tether()', 'wait()', 'forward(2)', 'if flow_dir() == "right":', '    pair_step("R", 3)', 'else:', '    pair_step("L", 3)'])
      },
      loiSai: [
        { moTa: 'Chỉ rẽ trái cho cả 2 sân nên ở sân 2 bè đi nhầm lên nhánh Bắc', baiLam: bai(['tether()', 'wait()', 'forward(2)', 'pair_step("L", 3)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Thiếu nhánh else cho sân 2', baiLam: bai(['tether()', 'wait()', 'forward(2)', 'if flow_dir() == "left":', '    pair_step("L", 3)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Khi xuồng ở (4, 3) hướng Đông, dòng chảy hướng Bắc ở (5, 3) cho flow_dir() == "left".', 'Luna: Thêm nhánh else: pair_step("R", 3) để kéo B xuống bến Nam (4, 5) ở sân 2.']
    }),

    manBuocDuoi({
      so: 8, ten: 'Thả neo chuyển bè ra đuôi trước khi trôi xuống hẻm', hang: 'bien-the',
      deBai: 'Sola kết hợp mỏ neo và dây đuôi: xuồng ở (2, 1) đang đứng trên dòng chảy xuống hẻm hẹp (2, 2), còn bè B ở (5, 1) đang trôi về Tây. Nếu nhổ neo khi B còn ở mũi (3, 1), B sẽ vướng bờ kè (3, 2) khiến cả cụm không trôi xuống hẻm được! Hãy gọi drop_anchor() giữ xuồng 1 nhịp chờ B trôi về (4, 1), gọi tow_grab() kéo B về mũi, gọi tether() và wait() chuyển B sang đuôi (1, 1), rồi mới gọi lift_anchor() để dòng nước đưa cả cụm vào hẻm và gọi pair_step("R", 2) đưa B tới bến q ở (2, 3)!',
      veMaMau: 'Gọi drop_anchor(), tow_grab(), tether(), wait(), lift_anchor() rồi pair_step("R", 2).',
      san: [
        '#######',
        '#~~~~B#',
        '##~####',
        '##q####',
        '##~####',
        '#######'
      ],
      dong: [{ x: 2, y: 1, huong: 2, suc: 1 }, { x: 5, y: 1, huong: 3, suc: 1 }],
      batDau: { x: 2, y: 1, huong: 1 },
      maMau: bai(['drop_anchor()', 'tow_grab()', 'tether()', 'wait()']),
      loiGiai: bai(['drop_anchor()', 'tow_grab()', 'tether()', 'wait()', 'lift_anchor()', 'pair_step("R", 2)']),
      sao: { o: 25, nhip: 7 },
      loiGiaiKhac: {
        moTa: 'Tách pair_step("R", 2) thành turn_right() và forward(2)',
        baiLam: bai(['drop_anchor()', 'tow_grab()', 'tether()', 'wait()', 'lift_anchor()', 'turn_right()', 'forward(2)'])
      },
      loiSai: [
        { moTa: 'Chỉ gọi pair_step("R", 1) nên bè B mới tới (2, 2), chưa vào bến (2, 3)', baiLam: bai(['drop_anchor()', 'tow_grab()', 'tether()', 'wait()', 'lift_anchor()', 'pair_step("R", 1)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên gọi lift_anchor() trước khi rẽ xuống hẻm', baiLam: bai(['drop_anchor()', 'tow_grab()', 'tether()', 'wait()', 'pair_step("R", 2)']), phaiCoMa: ['dang-neo', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Khi B đã chuyển ra sau đuôi (1, 1), gọi lift_anchor() sẽ giúp dòng nước ở (2, 1) đẩy xuồng xuống (2, 2) và kéo B theo vào (2, 1).', 'Luna: Sau đó gọi pair_step("R", 2) để xuồng quay xuống Nam và tiến 2 ô tới (2, 4), kéo B vào bến (2, 3).']
    }),

    manBuocDuoi({
      so: 9, ten: 'Đo dòng sau góc cua để chọn số bước kéo', hang: 'bien-the', nhipTheo: 'tong',
      deBai: 'Sola thử thách trên 2 sân: từ (2, 1), hãy gọi tow_grab(), tether(), wait(), forward(2) và turn_right() để kéo đám lục bình L tới góc (4, 1) và quay mặt xuống nhánh Nam. Lúc này ô trước mũi là (4, 2): ở sân 1 ô (4, 2) là nước êm (is_calm_front() là True) nên cần forward(3) để kéo L vào bến q ở (4, 3); ở sân 2 ô (4, 2) có dòng chảy thuận nên chỉ cần forward(2)!',
      veMaMau: 'Sau khi kéo L tới (4, 1) và turn_right(), dùng if is_calm_front(): forward(3) else: forward(2).',
      san: [
        [
          '######',
          '#~~~L#',
          '####~#',
          '####q#',
          '####~#',
          '######'
        ],
        [
          '######',
          '#~~~L#',
          '####~#',
          '####q#',
          '####~#',
          '######'
        ]
      ],
      dong: [
        [],
        [{ x: 4, y: 2, huong: 2, suc: 1 }]
      ],
      batDau: [{ x: 2, y: 1, huong: 1 }, { x: 2, y: 1, huong: 1 }],
      maMau: bai(['tow_grab()', 'tether()', 'wait()', 'forward(2)', 'turn_right()']),
      loiGiai: bai(['tow_grab()', 'tether()', 'wait()', 'forward(2)', 'turn_right()', 'if is_calm_front():', '    forward(3)', 'else:', '    forward(2)']),
      sao: { o: 19, nhip: 15 },
      loiGiaiKhac: {
        moTa: 'Dùng flow_step() và move() cho cả 2 sân sau khi quay phải',
        baiLam: bai(['tow_grab()', 'tether()', 'wait()', 'forward(2)', 'turn_right()', 'flow_step()', 'move()'])
      },
      loiSai: [
        { moTa: 'Quên chuyển lục bình ra đuôi bằng tether(), wait() nên khi quay phải ở góc hẹp bị vướng mũi', baiLam: bai(['tow_grab()', 'forward(2)', 'turn_right()', 'if is_calm_front():', '    forward(3)', 'else:', '    forward(2)']), phaiCoMa: ['mui-vuong', 'chua-dua-vat'] },
        { moTa: 'Luôn gọi forward(2) nên ở sân 1 lục bình L mới tới (4, 2), chưa vào bến (4, 3)', baiLam: bai(['tow_grab()', 'tether()', 'wait()', 'forward(2)', 'turn_right()', 'forward(2)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Khi xuồng ở (4, 1) đã turn_right() quay xuống Nam, is_calm_front() kiểm tra đúng ô (4, 2).', 'Luna: Nếu is_calm_front() đúng thì gọi forward(3), ngược lại gọi forward(2) (hoặc dùng flow_step() kèm move()).']
    }),

    manBuocDuoi({
      so: 10, ten: 'Trùm: Hoa tiêu lai dắt qua kênh hẹp', hang: 'trum', nhipTheo: 'tong',
      huyHieu: { ma: 'buoc-duoi', ten: 'Huy hiệu Lai dắt theo đuôi' },
      deBai: 'Sola giao bài kiểm tra Trùm chương 1 trên 2 sân: xuồng ở (2, 1) đứng trên dòng chảy xuống hẻm (2, 2), còn bè B ở (5, 1) đang trôi về Tây. Hãy gọi drop_anchor(), tow_grab(), tether(), wait(), lift_anchor() để đón B, chuyển B ra sau đuôi (1, 1) rồi thả cho dòng nước đưa cả cụm vào hẻm (2, 2). Tại (2, 2), hãy gọi turn_right() quay xuống Nam rồi kiểm tra if is_calm_front(): forward(3) else: forward(2) để đưa B vào bến q ở (2, 4)!',
      veMaMau: 'Kết hợp drop_anchor(), tow_grab(), tether(), wait(), lift_anchor(), turn_right() và if is_calm_front(): forward(3) else: forward(2).',
      san: [
        [
          '#######',
          '#~~~~B#',
          '##~####',
          '##~####',
          '##q####',
          '##~####',
          '#######'
        ],
        [
          '#######',
          '#~~~~B#',
          '##~####',
          '##~####',
          '##q####',
          '##~####',
          '#######'
        ]
      ],
      dong: [
        [{ x: 2, y: 1, huong: 2, suc: 1 }, { x: 5, y: 1, huong: 3, suc: 1 }],
        [{ x: 2, y: 1, huong: 2, suc: 1 }, { x: 5, y: 1, huong: 3, suc: 1 }, { x: 2, y: 3, huong: 2, suc: 1 }]
      ],
      batDau: [{ x: 2, y: 1, huong: 1 }, { x: 2, y: 1, huong: 1 }],
      maMau: bai([
        'drop_anchor()',
        'tow_grab()',
        'tether()',
        'wait()',
        'lift_anchor()',
        'turn_right()'
      ]),
      loiGiai: bai([
        'drop_anchor()',
        'tow_grab()',
        'tether()',
        'wait()',
        'lift_anchor()',
        'turn_right()',
        'if is_calm_front():',
        '    forward(3)',
        'else:',
        '    forward(2)'
      ]),
      sao: { o: 24, nhip: 15 },
      loiGiaiKhac: {
        moTa: 'Dùng flow_step() và move() sau khi quay phải ở (2, 2)',
        baiLam: bai([
          'drop_anchor()',
          'tow_grab()',
          'tether()',
          'wait()',
          'lift_anchor()',
          'turn_right()',
          'flow_step()',
          'move()'
        ])
      },
      loiSai: [
        { moTa: 'Chỉ gọi forward(1) sau khi quay phải nên bè B chưa tới bến (2, 4)', baiLam: bai(['drop_anchor()', 'tow_grab()', 'tether()', 'wait()', 'lift_anchor()', 'turn_right()', 'forward(1)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên gọi lift_anchor() trước khi quay phải và tiến xuống hẻm', baiLam: bai(['drop_anchor()', 'tow_grab()', 'tether()', 'wait()', 'turn_right()', 'forward(3)']), phaiCoMa: ['dang-neo', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau lift_anchor() và turn_right(), xuồng đang ở (2, 2) hướng Nam và bè B đang ở (2, 1).', 'Luna: Kiểm tra if is_calm_front(): forward(3) else: forward(2) để đưa B tới đúng bến (2, 4) trên cả 2 sân.']
    }),

    /* ========================================================================
       CHƯƠNG 2: che-buoc-duoi (10 màn) — Chế lệnh: kéo bè qua khúc cua
       ======================================================================== */
    manCheBuocDuoi({
      so: 1, ten: 'Chế hàm buộc đuôi tether_grab()', hang: 'lam-quen',
      taoHam: ['tether_grab'],
      deBai: 'Sola hướng dẫn: lệnh gốc tether() luôn đi kèm wait() để hoàn tất nhịp buộc bè vào đuôi xuồng. Hãy đóng gói cặp lệnh tether(), wait() thành hàm tether_grab(), rồi dùng nó buộc bè B đang nằm ở (1, 1) sau đuôi xuồng (2, 1) và gọi forward(4) kéo B vào bến q ở (5, 1)!',
      veMaMau: 'Viết hàm tether_grab() gồm 2 dòng: tether() và wait().',
      san: [
        '#########',
        '#B~~~q~~#',
        '#########'
      ],
      dong: [],
      batDau: { x: 2, y: 1, huong: 1 },
      maMau: bai(['tether_grab()', 'forward(4)']),
      loiGiai: bai(['tether_grab()', 'forward(4)'], { hamCuaEmMoi: [hTetherGrab()] }),
      sao: { o: 9, nhip: 5 },
      loiGiaiKhac: {
        moTa: 'Dùng hai lần flow_step() thay cho forward(4)',
        baiLam: bai(['tether_grab()', 'flow_step()', 'flow_step()']),
        hamCuaEmMoi: [hTetherGrab()]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm tether_grab()', baiLam: bai(['tether_grab()', 'forward(4)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Gọi nhầm untether() thay vì tether() trong tether_grab()', baiLam: bai(['tether_grab()', 'forward(4)']), hamCuaEmMoi: [hTetherGrab(['untether()', 'wait()'])], phaiCoMa: ['khong-keo', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Trong hàm tether_grab(), dòng 1 là tether(), dòng 2 là wait().', 'Luna: Chương trình chính đã gọi sẵn tether_grab() và forward(4).']
    }),

    manCheBuocDuoi({
      so: 2, ten: 'Chế hàm tháo dây đuôi tether_drop()', hang: 'lam-quen',
      hamCuaEmCan: KHO_TRUOC.concat(['tether_grab']),
      taoHam: ['tether_drop'],
      deBai: 'Sola hướng dẫn tiếp: tương tự khi buộc đuôi, lệnh tháo dây đuôi untether() luôn đi kèm wait(). Hãy đóng gói untether(), wait() thành hàm tether_drop(), rồi kết hợp tow_grab(), tether_grab() và tether_drop() để chuyển bè B từ (5, 1) ra dòng chảy sau đuôi (1, 1) và thả cho dòng nước đưa B vào bến q ở (1, 2)!',
      veMaMau: 'Viết hàm tether_drop() gồm 2 dòng: untether() và wait().',
      san: [
        '#######',
        '#~~~~B#',
        '#q#####',
        '#######'
      ],
      dong: [{ x: 1, y: 1, huong: 2, suc: 1 }],
      batDau: { x: 2, y: 1, huong: 1 },
      maMau: bai(['tow_grab()', 'tether_grab()', 'tether_drop()']),
      loiGiai: bai(['tow_grab()', 'tether_grab()', 'tether_drop()'], { hamCuaEmMoi: [hTetherDrop()] }),
      sao: { o: 9, nhip: 3 },
      loiGiaiKhac: {
        moTa: 'Dùng tow(), wait() thay cho tow_grab()',
        baiLam: bai(['tow()', 'wait()', 'tether_grab()', 'tether_drop()']),
        hamCuaEmMoi: [hTetherDrop()]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm tether_drop()', baiLam: bai(['tow_grab()', 'tether_grab()', 'tether_drop()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên gọi wait() trong tether_drop()', baiLam: bai(['tow_grab()', 'tether_grab()', 'tether_drop()']), hamCuaEmMoi: [hTetherDrop(['untether()'])], phaiCoMa: ['quen-wait'] }
      ],
      goiY: ['Luna: Thân hàm tether_drop() chỉ gồm 2 dòng: untether() rồi wait().', 'Luna: Sau khi tether_drop() chạy, dòng nước ở (1, 1) tự đẩy B xuống bến (1, 2).']
    }),

    manCheBuocDuoi({
      so: 3, ten: 'Chế hàm kéo mũi chuyển ra đuôi tow_to_tail()', hang: 'lam-quen', mucTieu: 'toi-co',
      hamCuaEmCan: KHO_TRUOC.concat(['tether_grab', 'tether_drop']),
      taoHam: ['tow_to_tail'],
      deBai: 'Sola hướng dẫn: thao tác phóng dây kéo vật ở phía trước về mũi rồi lập tức chuyển ra sau đuôi gồm 2 hàm: tow_grab() và tether_grab(). Hãy đóng gói chúng thành hàm tow_to_tail() (không tham số), rồi gọi tow_to_tail() và forward(5) để dọn đám lục bình L đang chắn ngang kênh hẹp và tiến thẳng tới cờ Q ở (7, 1)!',
      veMaMau: 'Viết hàm tow_to_tail() gồm 2 dòng: tow_grab() và tether_grab().',
      san: [
        '#########',
        '#~~~~L~Q#',
        '#########'
      ],
      dong: [],
      batDau: { x: 2, y: 1, huong: 1 },
      maMau: bai(['tow_to_tail()', 'forward(5)']),
      loiGiai: bai(['tow_to_tail()', 'forward(5)'], { hamCuaEmMoi: [hTowToTail()] }),
      sao: { o: 13, nhip: 7 },
      loiGiaiKhac: {
        moTa: 'Dùng forward(3) rồi forward(2) sau tow_to_tail()',
        baiLam: bai(['tow_to_tail()', 'forward(3)', 'forward(2)']),
        hamCuaEmMoi: [hTowToTail()]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm tow_to_tail()', baiLam: bai(['tow_to_tail()', 'forward(5)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Gọi ngược tether_grab() trước tow_grab() nên lúc gọi tether_grab() chưa có vật ở mũi hay sau đuôi', baiLam: bai(['tow_to_tail()', 'forward(5)']), hamCuaEmMoi: [hTowToTail(['tether_grab()', 'tow_grab()'])], phaiCoMa: ['buoc-hut', 'mui-vuong', 'chua-toi-co'] }
      ],
      goiY: ['Luna: Trong tow_to_tail(), gọi tow_grab() ở dòng 1 và tether_grab() ở dòng 2.', 'Luna: Sau tow_to_tail(), lục bình L đã nằm sau đuôi ở (1, 1), nhường đường cho forward(5) tới Q.']
    }),

    manCheBuocDuoi({
      so: 4, ten: 'Chế hàm kéo bè qua góc cua tug_corner(d, n)', hang: 'luyen',
      hamCuaEmCan: KHO_TRUOC.concat(['tether_grab', 'tether_drop', 'tow_to_tail']),
      taoHam: ['tug_corner'],
      deBai: 'Sola hướng dẫn: khi đứng ở ngã rẽ và cần phóng dây lấy bè phía trước, chuyển ra sau đuôi rồi rẽ theo hướng d ("L", "R", "U", "F") đi n bước, ta dùng hàm tug_corner(d, n) gồm 2 dòng: tow_to_tail() và pair_step(d, n). Hãy chế hàm tug_corner(d, n), rồi từ (2, 1) gọi move() tới ngã rẽ (3, 1) và gọi tug_corner("R", 3) kéo bè B vào bến q ở (3, 3)!',
      veMaMau: 'Viết hàm tug_corner(d, n) gồm tow_to_tail() và pair_step(d, n).',
      san: [
        '#######',
        '#~~~~B#',
        '###~###',
        '###q###',
        '###~###',
        '#######'
      ],
      dong: [],
      batDau: { x: 2, y: 1, huong: 1 },
      maMau: bai(['move()', 'tug_corner("R", 3)']),
      loiGiai: bai(['move()', 'tug_corner("R", 3)'], { hamCuaEmMoi: [hTugCorner()] }),
      sao: { o: 23, nhip: 7 },
      loiGiaiKhac: {
        moTa: 'Gọi forward(1) thay cho move() trước tug_corner("R", 3)',
        baiLam: bai(['forward(1)', 'tug_corner("R", 3)']),
        hamCuaEmMoi: [hTugCorner()]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm tug_corner(d, n)', baiLam: bai(['move()', 'tug_corner("R", 3)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Truyền cố định pair_step(d, 1) thay vì pair_step(d, n) trong tug_corner nên bè chưa tới bến', baiLam: bai(['move()', 'tug_corner("R", 3)']), hamCuaEmMoi: [hTugCorner(['tow_to_tail()', 'pair_step(d, 1)'])], phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Thân hàm tug_corner(d, n) gồm 2 dòng: tow_to_tail() rồi pair_step(d, n).', 'Luna: Ở chương trình chính, move() đưa xuồng tới (3, 1), rồi tug_corner("R", 3) kéo B từ (5, 1) qua góc cua xuống (3, 3).']
    }),

    manCheBuocDuoi({
      so: 5, ten: 'Dùng tug_corner() rẽ nhánh theo dòng chảy', hang: 'luyen', nhipTheo: 'tong',
      hamCuaEmCan: KHO_TRUOC.concat(['tether_grab', 'tether_drop', 'tow_to_tail', 'tug_corner']),
      deBai: 'Sola thử thách trên 2 sân: xuồng đang ở ngã tư (3, 3) hướng Đông, bè B ở (5, 3). Ô ngay trước mũi (4, 3) có dòng chảy báo hướng bến q: ở sân 1 dòng chảy hướng Bắc (flow_dir() == "left") báo bến q ở (3, 1); ở sân 2 dòng chảy hướng Nam (flow_dir() == "right") báo bến q ở (3, 5). Hãy dùng if/else gọi tug_corner("L", 3) hoặc tug_corner("R", 3) để đưa B vào bến!',
      veMaMau: 'Dùng if flow_dir() == "left": tug_corner("L", 3) else: tug_corner("R", 3).',
      san: [
        [
          '###~###',
          '###q###',
          '###~###',
          '#~~~~B#',
          '###~###',
          '###~###',
          '###~###'
        ],
        [
          '###~###',
          '###~###',
          '###~###',
          '#~~~~B#',
          '###~###',
          '###q###',
          '###~###'
        ]
      ],
      dong: [
        [{ x: 4, y: 3, huong: 0, suc: 1 }],
        [{ x: 4, y: 3, huong: 2, suc: 1 }]
      ],
      batDau: [{ x: 3, y: 3, huong: 1 }, { x: 3, y: 3, huong: 1 }],
      maMau: bai(['if flow_dir() == "left":', '    tug_corner("L", 3)']),
      loiGiai: bai(['if flow_dir() == "left":', '    tug_corner("L", 3)', 'else:', '    tug_corner("R", 3)']),
      sao: { o: 27, nhip: 12 },
      loiGiaiKhac: {
        moTa: 'Kiểm tra if flow_dir() == "right": tug_corner("R", 3) else: tug_corner("L", 3)',
        baiLam: bai(['if flow_dir() == "right":', '    tug_corner("R", 3)', 'else:', '    tug_corner("L", 3)'])
      },
      loiSai: [
        { moTa: 'Luôn gọi tug_corner("L", 3) nên ở sân 2 kéo bè đi nhầm lên nhánh Bắc', baiLam: bai(['tug_corner("L", 3)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Thiếu nhánh else cho sân 2', baiLam: bai(['if flow_dir() == "left":', '    tug_corner("L", 3)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Lưu ý phải đọc flow_dir() ngay đầu chương trình trước khi gọi tug_corner.', 'Luna: Thêm nhánh else: tug_corner("R", 3) để xử lý sân 2.']
    }),

    manCheBuocDuoi({
      so: 6, ten: 'Chế hàm kéo qua cua rồi thả bè deliver_tail(d, n)', hang: 'luyen',
      hamCuaEmCan: KHO_TRUOC.concat(['tether_grab', 'tether_drop', 'tow_to_tail', 'tug_corner']),
      taoHam: ['deliver_tail'],
      deBai: 'Sola hướng dẫn: khi cần giao nhiều vật nổi trên cùng một màn, sau khi dùng tug_corner(d, n) kéo vật thứ nhất vào đúng ô bến q, ta phải gọi tether_drop() tháo dây đuôi để vật thứ nhất nằm lại trên bến và giải phóng dây phao đi lấy vật thứ hai! Hãy chế hàm deliver_tail(d, n) gồm tug_corner(d, n) và tether_drop(), rồi gọi deliver_tail("R", 2), turn_left() và tow_pair(0, 1) để giao cả bè B lẫn lục bình L vào 2 bến q!',
      veMaMau: 'Viết hàm deliver_tail(d, n) gồm tug_corner(d, n) và tether_drop().',
      san: [
        '#######',
        '#~~~~B#',
        '###q###',
        '###~Lq#',
        '#######'
      ],
      dong: [],
      batDau: { x: 3, y: 1, huong: 1 },
      maMau: bai(['deliver_tail("R", 2)', 'turn_left()', 'tow_pair(0, 1)']),
      loiGiai: bai(['deliver_tail("R", 2)', 'turn_left()', 'tow_pair(0, 1)'], { hamCuaEmMoi: [hDeliverTail()] }),
      sao: { o: 35, nhip: 9 },
      loiGiaiKhac: {
        moTa: 'Dùng pair_step("L", 0) thay cho turn_left()',
        baiLam: bai(['deliver_tail("R", 2)', 'pair_step("L", 0)', 'tow_pair(0, 1)']),
        hamCuaEmMoi: [hDeliverTail()]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm deliver_tail(d, n)', baiLam: bai(['deliver_tail("R", 2)', 'turn_left()', 'tow_pair(0, 1)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên gọi tether_drop() trong deliver_tail(d, n) nên dây vẫn vướng bè B khi bắn dây lấy L', baiLam: bai(['deliver_tail("R", 2)', 'turn_left()', 'tow_pair(0, 1)']), hamCuaEmMoi: [hDeliverTail(['tug_corner(d, n)'])], phaiCoMa: ['dang-keo', 'dam-tuong', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Trong deliver_tail(d, n), dòng 1 là tug_corner(d, n), dòng 2 là tether_drop().', 'Luna: Sau deliver_tail("R", 2), bè B đã nằm yên trên bến (3, 2) và xuồng ở (3, 3) sẵn sàng quay trái lấy L.']
    }),

    manCheBuocDuoi({
      so: 7, ten: 'Sửa hàm quên tháo dây đuôi fix_tail_drop()', hang: 'bien-the',
      chinhCoDinh: true,
      hamCuaEmCan: KHO_TRUOC.concat(['tether_grab', 'tether_drop', 'tow_to_tail', 'tug_corner', 'deliver_tail']),
      deBai: 'Sola phát hiện lỗi: chương trình chính gọi fix_tail_drop("R", 2) để kéo bè B từ (5, 1) qua góc cua vào bến q thứ nhất ở (3, 2), rồi gọi turn_left() và tow_pair(0, 1) để đưa lục bình L vào bến q thứ hai ở (5, 3). Nhưng trong fix_tail_drop(d, n) lại mới chỉ có tug_corner(d, n), quên mất tether_drop() ở cuối nên dây vẫn buộc chặt vào B! Hãy thêm tether_drop() vào cuối hàm fix_tail_drop(d, n).',
      veMaMau: 'Chương trình chính đã khóa. Hãy thêm tether_drop() vào cuối hàm fix_tail_drop(d, n).',
      san: [
        '#######',
        '#~~~~B#',
        '###q###',
        '###~Lq#',
        '#######'
      ],
      dong: [],
      batDau: { x: 3, y: 1, huong: 1 },
      maMau: bai(['fix_tail_drop("R", 2)', 'turn_left()', 'tow_pair(0, 1)'], { hamCuaMan: [hFixTailDrop(T_FIX_TAIL_SAI)] }),
      loiGiai: bai(['fix_tail_drop("R", 2)', 'turn_left()', 'tow_pair(0, 1)'], { hamCuaMan: [hFixTailDrop(T_FIX_TAIL_DUNG)] }),
      sao: { o: 35, nhip: 9 },
      loiSai: [
        { moTa: 'Chưa thêm tether_drop() vào cuối hàm fix_tail_drop(d, n)', baiLam: bai(['fix_tail_drop("R", 2)', 'turn_left()', 'tow_pair(0, 1)'], { hamCuaMan: [hFixTailDrop(T_FIX_TAIL_SAI)] }), phaiCoMa: ['dang-keo', 'dam-tuong', 'chua-dua-vat'] },
        { moTa: 'Gọi tether_drop() trước tug_corner(d, n) nên tháo dây khi chưa kéo bè', baiLam: bai(['fix_tail_drop("R", 2)', 'turn_left()', 'tow_pair(0, 1)'], { hamCuaMan: [hFixTailDrop(['tether_drop()', 'tug_corner(d, n)'])] }), phaiCoMa: ['khong-keo', 'dang-keo', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau tug_corner(d, n), bè B đã nằm đúng trên bến (3, 2) nhưng dây đuôi vẫn đang buộc.', 'Luna: Thêm dòng tether_drop() vào dòng 2 của fix_tail_drop(d, n).']
    }),

    manCheBuocDuoi({
      so: 8, ten: 'Giao hai kiện hàng liên tiếp qua hai khúc cua', hang: 'bien-the',
      hamCuaEmCan: KHO_TRUOC.concat(['tether_grab', 'tether_drop', 'tow_to_tail', 'tug_corner', 'deliver_tail']),
      deBai: 'Sola thử thách: trên kênh có 2 kiện hàng (bè B ở (5, 1) và lục bình L ở (5, 3)) cùng 2 bến q ở (3, 2) và (3, 4). Từ (3, 1) hướng Đông, hãy gọi deliver_tail("R", 2) để giao B vào bến (3, 2) và dừng ở (3, 3), sau đó gọi turn_left() quay lại hướng Đông và gọi tiếp deliver_tail("R", 2) lần thứ hai để giao L vào bến (3, 4)!',
      veMaMau: 'Gọi deliver_tail("R", 2), turn_left(), rồi deliver_tail("R", 2).',
      san: [
        '#######',
        '#~~~~B#',
        '###q###',
        '##~~~L#',
        '###q###',
        '###~###',
        '#######'
      ],
      dong: [],
      batDau: { x: 3, y: 1, huong: 1 },
      maMau: bai(['deliver_tail("R", 2)', 'turn_left()']),
      loiGiai: bai(['deliver_tail("R", 2)', 'turn_left()', 'deliver_tail("R", 2)']),
      sao: { o: 30, nhip: 12 },
      loiGiaiKhac: {
        moTa: 'Dùng tug_corner("R", 2) ở bước cuối thay cho deliver_tail("R", 2)',
        baiLam: bai(['deliver_tail("R", 2)', 'turn_left()', 'tug_corner("R", 2)'])
      },
      loiSai: [
        { moTa: 'Mới giao kiện hàng thứ nhất mà chưa gọi deliver_tail("R", 2) lần hai', baiLam: bai(['deliver_tail("R", 2)', 'turn_left()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên gọi turn_left() ở (3, 3) nên bắn dây xuống phía Nam thay vì phía Đông lấy L', baiLam: bai(['deliver_tail("R", 2)', 'deliver_tail("R", 2)']), phaiCoMa: ['keo-hut', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau deliver_tail("R", 2) đầu tiên và turn_left(), xuồng ở (3, 3) đã hướng thẳng vào L ở (5, 3) và có ô trống (2, 3) sau đuôi.', 'Luna: Gọi thêm deliver_tail("R", 2) để kéo L qua góc (3, 3) xuống bến (3, 4).']
    }),

    manCheBuocDuoi({
      so: 9, ten: 'Đọc dòng chảy chọn nhánh cho kiện hàng thứ hai', hang: 'bien-the', nhipTheo: 'tong',
      hamCuaEmCan: KHO_TRUOC.concat(['tether_grab', 'tether_drop', 'tow_to_tail', 'tug_corner', 'deliver_tail']),
      deBai: 'Sola giao bài toán 2 sân: từ (3, 1) hướng Đông, hãy gọi deliver_tail("R", 2) để giao bè B vào bến (3, 2) và đưa xuồng tới ngã tư (3, 3) hướng Nam. Tại (3, 3), ô trước mũi (3, 4) có dòng chảy chỉ hướng của lục bình L: ở sân 1 dòng chảy sang Đông (flow_dir() == "left") báo L nằm bên trái (nhánh Đông); ở sân 2 dòng chảy sang Tây (flow_dir() == "right") báo L nằm bên phải (nhánh Tây). Hãy dùng if/else quay đúng hướng rồi gọi tow_pair(0, 1) đẩy L vào bến q thứ hai!',
      veMaMau: 'Gọi deliver_tail("R", 2), rồi if flow_dir() == "left": turn_left() else: turn_right(), và cuối cùng tow_pair(0, 1).',
      san: [
        [
          '#######',
          '#~~~~B#',
          '###q###',
          '###~Lq#',
          '###~###',
          '#######'
        ],
        [
          '#######',
          '#~~~~B#',
          '###q###',
          '#qL~###',
          '###~###',
          '#######'
        ]
      ],
      dong: [
        [{ x: 3, y: 4, huong: 1, suc: 1 }],
        [{ x: 3, y: 4, huong: 3, suc: 1 }]
      ],
      batDau: [{ x: 3, y: 1, huong: 1 }, { x: 3, y: 1, huong: 1 }],
      maMau: bai(['deliver_tail("R", 2)', 'if flow_dir() == "left":', '    turn_left()']),
      loiGiai: bai(['deliver_tail("R", 2)', 'if flow_dir() == "left":', '    turn_left()', 'else:', '    turn_right()', 'tow_pair(0, 1)']),
      sao: { o: 38, nhip: 18 },
      loiGiaiKhac: {
        moTa: 'Kiểm tra if flow_dir() == "right": turn_right() else: turn_left()',
        baiLam: bai(['deliver_tail("R", 2)', 'if flow_dir() == "right":', '    turn_right()', 'else:', '    turn_left()', 'tow_pair(0, 1)'])
      },
      loiSai: [
        { moTa: 'Luôn quay trái sau deliver_tail("R", 2) nên ở sân 2 bắn dây vào bờ kè phía Đông', baiLam: bai(['deliver_tail("R", 2)', 'turn_left()', 'tow_pair(0, 1)']), phaiCoMa: ['keo-hut', 'chua-dua-vat'] },
        { moTa: 'Quên gọi tow_pair(0, 1) sau khối if/else nên chưa giao lục bình L', baiLam: bai(['deliver_tail("R", 2)', 'if flow_dir() == "left":', '    turn_left()', 'else:', '    turn_right()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Khi xuồng ở (3, 3) hướng Nam, dòng chảy hướng Đông ở (3, 4) là bên trái mũi xuồng ("left").', 'Luna: Sau khối if/else quay hướng, gọi tow_pair(0, 1) để kéo và đẩy L vào bến q.']
    }),

    manCheBuocDuoi({
      so: 10, ten: 'Trùm: Điều phối lai dắt hai kiện hàng qua kênh đôi', hang: 'trum', nhipTheo: 'tong',
      huyHieu: { ma: 'che-buoc-duoi', ten: 'Huy hiệu Chế lệnh: kéo bè qua khúc cua' },
      hamCuaEmCan: KHO_TRUOC.concat(['tether_grab', 'tether_drop', 'tow_to_tail', 'tug_corner', 'deliver_tail']),
      deBai: 'Sola giao thử thách khép lại Gói 6 trên 2 sân: từ (3, 1) hướng Đông, hãy gọi deliver_tail("R", 2) giao bè B vào bến (3, 2) rồi gọi turn_left() tại ngã tư (3, 3) để quay mặt sang Đông. Lúc này ô trước mũi là (4, 3): nếu is_calm_front() là True (sân 2), đám lục bình L nằm ở nhánh Tây (1, 3) nên hãy gọi u_turn() rồi deliver_tail("L", 2); ngược lại (sân 1), L nằm ngay ở nhánh Đông (5, 3) nên hãy gọi deliver_tail("R", 2) để kéo L xuống bến q thứ hai ở (3, 4)!',
      veMaMau: 'Gọi deliver_tail("R", 2), turn_left(), rồi if is_calm_front(): u_turn(), deliver_tail("L", 2) else: deliver_tail("R", 2).',
      san: [
        [
          '#######',
          '#~~~~B#',
          '###q###',
          '##~~~L#',
          '###q###',
          '###~###',
          '#######'
        ],
        [
          '#######',
          '#~~~~B#',
          '###q###',
          '#L~~~##',
          '###q###',
          '###~###',
          '#######'
        ]
      ],
      dong: [
        [{ x: 4, y: 3, huong: 3, suc: 1 }],
        []
      ],
      batDau: [{ x: 3, y: 1, huong: 1 }, { x: 3, y: 1, huong: 1 }],
      maMau: bai(['deliver_tail("R", 2)', 'turn_left()', 'if is_calm_front():', '    u_turn()']),
      loiGiai: bai(['deliver_tail("R", 2)', 'turn_left()', 'if is_calm_front():', '    u_turn()', '    deliver_tail("L", 2)', 'else:', '    deliver_tail("R", 2)']),
      sao: { o: 38, nhip: 25 },
      loiGiaiKhac: {
        moTa: 'Kiểm tra if not is_calm_front(): deliver_tail("R", 2) else: u_turn(), deliver_tail("L", 2)',
        baiLam: bai(['deliver_tail("R", 2)', 'turn_left()', 'if not is_calm_front():', '    deliver_tail("R", 2)', 'else:', '    u_turn()', '    deliver_tail("L", 2)'])
      },
      loiSai: [
        { moTa: 'Luôn gọi deliver_tail("R", 2) cho kiện hàng thứ hai nên ở sân 2 bắn dây hụt về phía Đông', baiLam: bai(['deliver_tail("R", 2)', 'turn_left()', 'deliver_tail("R", 2)']), phaiCoMa: ['keo-hut', 'buoc-hut', 'chua-dua-vat'] },
        { moTa: 'Ở sân 2 sau khi u_turn() lại gọi deliver_tail("R", 2) nên rẽ nhầm lên nhánh Bắc thay vì xuống nhánh Nam', baiLam: bai(['deliver_tail("R", 2)', 'turn_left()', 'if is_calm_front():', '    u_turn()', '    deliver_tail("R", 2)', 'else:', '    deliver_tail("R", 2)']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau deliver_tail("R", 2) đầu tiên và turn_left(), xuồng ở (3, 3) đang hướng Đông nhìn vào (4, 3).', 'Luna: Nếu is_calm_front() đúng (sân 2), gọi u_turn() quay sang Tây rồi gọi deliver_tail("L", 2) để rẽ trái xuống Nam; ngược lại (sân 1) gọi deliver_tail("R", 2).']
    })
  ];

  if (M && M.them) M.manBuocDuoi = MAN;
  if (typeof module !== 'undefined' && module.exports) module.exports = M;
})();
