/* ============================================================================
   man-buoc-duoi.js — Mùa 5 (Bến sông) · Gói 6: Nâng cấp tay Tời cuộn dây lưới
   Chương 1: buoc-duoi (10 màn) — Cuộn / Thả dây lưới (reel_in / reel_out, cuộn + chạy máy cùng nhịp)
   Chương 2: che-buoc-duoi (10 màn) — Chế lệnh: kéo bè qua khúc cua
   ========================================================================== */
(function () {
  'use strict';

  var M = (typeof window !== 'undefined' && window.ManHoc) ||
    (typeof require === 'function' ? require('./man-chuoi-1.js') : null);

  // Tời cuộn (KE-HOACH-GHEP-NHIP.md mục 4c): reel_in() / reel_out() thay set_length (thôi dạy). chinhLuoi: false để lộ trình không tự bật set_length.
  var GOC_DUOI = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'cast_net', 'drop_net', 'flow_dir', 'anchor', 'unanchor', 'reel_in', 'reel_out'];
  var GOC_KHONG_NEO = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'cast_net', 'drop_net', 'flow_dir', 'reel_in', 'reel_out'];
  var ROBOT_DUOI = { than: 'xuong', tay: 'day-keo', camBien: [{ ma: 'dong-chay', o: 'tren' }], cuonDay: true };
  var GOC_CU = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'cast_net', 'drop_net', 'flow_dir', 'anchor', 'unanchor', 'set_length'];
  var ROBOT_CU = { than: 'xuong', tay: 'day-keo', camBien: [{ ma: 'dong-chay', o: 'tren' }], chinhLuoi: true };
  var CAU_TRUC = ['for', 'if', 'while', 'list', 'def', 'return', 'tuple'];

  var KHO_TRUOC = [
    'move', 'turn_left', 'turn_right', 'u_turn', 'back', 'forward',
    'span_dist', 'round_steps', 'calm_bonus', 'turn_code', 'sail_to',
    'tow_grab', 'tow_drop', 'pull_back', 'pair_step', 'tow_pair',
    'is_calm_front', 'flow_step', 'scan_calm_side', 'tow_in_calm', 'pick_calm_lane',
    'flip_valve', 'open_gate_pass', 'shut_stream_tow', 'valve_and_back', 'lock_rescue',
    'drop_anchor', 'lift_anchor', 'anchor_wait', 'anchor_tow', 'hold_and_valve', 'anchor_net'
  ];

  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function bai(chinh, phu) {
    var kq = { chinh: chinh.slice(), hamCuaMan: [], hamCuaEmMoi: [] };
    if (phu && phu.hamCuaMan) kq.hamCuaMan = phu.hamCuaMan;
    if (phu && phu.hamCuaEmMoi) kq.hamCuaEmMoi = phu.hamCuaEmMoi;
    return kq;
  }

  var T_TETHER_GRAB = ['set_length(1)', 'wait()'];
  var T_TETHER_DROP = ['drop_net()', 'wait()'];
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
      chuong: 'buoc-duoi', tenChuong: 'Cuộn / Thả dây lưới',
      loaiRobot: 'xuong', robot: ROBOT_DUOI, chinhLuoi: false, cuonDay: true, vo: 'song', mucTieu: 'dua-vat',
      hamGoc: GOC_DUOI, bienDem: true, cauTruc: CAU_TRUC,
      khung: { chinh: 10, moiHam: 10, cauTruc: CAU_TRUC },
      hamCuaEmCan: KHO_TRUOC, taoHam: []
    }, c, { ma: 'buoc-duoi.' + c.so });
  }

  function manCheBuocDuoi(c) {
    return Object.assign({
      chuong: 'che-buoc-duoi', tenChuong: 'Chế lệnh: kéo bè qua khúc cua',
      loaiRobot: 'xuong', robot: ROBOT_CU, chinhLuoi: true, vo: 'song', mucTieu: 'dua-vat',
      hamGoc: GOC_CU, bienDem: true, cauTruc: CAU_TRUC,
      khung: { chinh: 10, moiHam: 10, cauTruc: CAU_TRUC },
      hamCuaEmCan: KHO_TRUOC, taoHam: []
    }, c, { ma: 'che-buoc-duoi.' + c.so });
  }

  var MAN = [
    /* ========================================================================
       CHƯƠNG 1: buoc-duoi (10 màn) — Cuộn / Thả dây lưới (reel_in / reel_out)
       1 xem cuộn từng ô · 2 nhả dây · 3 xem cuộn + lùi cùng nhịp · 4 ép (lục bình chắn đường lùi)
       5 giấu hàm, tự viết cuộn + lùi · 6 nấc cuối + tiến (cán dây) · 7–10 dùng lại cùng neo, rẽ, dòng
       ======================================================================== */
    manBuocDuoi({
      so: 1, ten: 'Xem tời cuộn dây từng ô', hang: 'lam-quen', mucTieu: 'toi-co',
      chiChay: true, chinhCoDinh: true,
      deBai: 'Sola lắp tời cuộn cho tay lưới. Lệnh reel_in() cuộn dây ngắn đi 1 ô. Bè trong lưới về gần xuồng 1 ô. Dây còn 1 ô mà cuộn nữa thì bè lên khoang xuồng. Bấm Chạy xem: cuộn 2 lần, bè B lên khoang, xuồng chạy tới cờ Q.',
      veMaMau: 'Chương trình mẫu đã khóa. Đếm xem bè B đi mấy ô sau mỗi reel_in() và wait().',
      san: [
        '########',
        '#~~~B~Q#',
        '########'
      ],
      dong: [],
      batDau: { x: 2, y: 1, huong: 1 },
      maMau: bai(['tow_grab()', 'reel_in()', 'wait()', 'reel_in()', 'wait()', 'forward(4)']),
      loiGiai: bai(['tow_grab()', 'reel_in()', 'wait()', 'reel_in()', 'wait()', 'forward(4)']),
      sao: { o: 13, nhip: 7 },
      loiSai: [],
      goiY: ['Luna: Lưới bắt bè ở (4, 1), dây dài 2 ô.', 'Luna: Cuộn lần 1, bè về (3, 1). Cuộn lần 2, bè lên khoang. Mặt nước trước mũi trống.']
    }),

    manBuocDuoi({
      so: 2, ten: 'Nhả dây xa ba ô bằng reel_out()', hang: 'lam-quen',
      deBai: 'Lưới mặc định bay 2 ô. Bè B ở (5, 1), cách xuồng 3 ô. Lệnh reel_out() nhả dây dài thêm 1 ô. Hãy nhả dây, tung lưới bắt B. Rồi cuộn 2 lần để kéo B về bến q ở (3, 1).',
      veMaMau: 'Viết reel_out() và wait() trước tow_grab(). Sau đó cuộn dây 2 lần.',
      san: [
        '#######',
        '#~~q~B#',
        '#######'
      ],
      dong: [],
      batDau: { x: 2, y: 1, huong: 1 },
      maMau: bai(['reel_out()', 'wait()', 'tow_grab()']),
      loiGiai: bai(['reel_out()', 'wait()', 'tow_grab()', 'reel_in()', 'wait()', 'reel_in()', 'wait()']),
      sao: { o: 9, nhip: 4 },
      loiGiaiKhac: {
        moTa: 'Dùng vòng lặp cuộn dây 2 lần',
        baiLam: bai(['reel_out()', 'wait()', 'tow_grab()', 'for i in range(2):', '    reel_in()', '    wait()'])
      },
      loiSai: [
        { moTa: 'Quên reel_out() nên lưới chỉ bay 2 ô, hụt bè ở (5, 1)', baiLam: bai(['tow_grab()', 'reel_in()', 'wait()', 'reel_in()', 'wait()']), phaiCoMa: ['keo-hut', 'chua-dua-vat'] },
        { moTa: 'Chỉ cuộn 1 lần nên bè dừng ở (4, 1), chưa tới bến', baiLam: bai(['reel_out()', 'wait()', 'tow_grab()', 'reel_in()', 'wait()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Chưa bắt gì thì reel_out() chỉ nhả dây sẵn cho lần tung sau.', 'Luna: Bè ở 3 ô, bến ở 1 ô. Cuộn 2 lần là vừa.']
    }),

    manBuocDuoi({
      so: 3, ten: 'Xem cuộn dây và lùi cùng một nhịp', hang: 'lam-quen',
      chiChay: true, chinhCoDinh: true,
      deBai: 'Sola làm mẫu. Xuồng bắt bè B ở (7, 1). Sau đó gọi reel_in() rồi back() ngay, không có wait() xen giữa. Tời cuộn và chân vịt lùi chạy chung một nhịp. Bè về gần 2 ô chỉ trong 1 nhịp. Bấm Chạy để xem.',
      veMaMau: 'Chương trình mẫu đã khóa. Để ý: reel_in() đứng ngay trước back(), hai việc chạy chung một nhịp.',
      san: [
        '#########',
        '#~~~q~~B#',
        '#########'
      ],
      dong: [],
      batDau: { x: 5, y: 1, huong: 1 },
      maMau: bai(['tow_grab()', 'reel_in()', 'back()', 'back()']),
      loiGiai: bai(['tow_grab()', 'reel_in()', 'back()', 'back()']),
      sao: { o: 9, nhip: 3 },
      loiSai: [],
      goiY: ['Luna: reel_in() chỉ ra lệnh cuộn. Tời chạy ở wait() kế tiếp.', 'Luna: back() có sẵn wait() bên trong. Tời cuộn trước, chân vịt lùi sau, cùng một nhịp.']
    }),

    manBuocDuoi({
      so: 4, ten: 'Lục bình trôi chắn đường lùi', hang: 'luyen',
      deBai: 'Lục bình L đang trôi xuống bến q của nó ở (4, 4). Nó tới đó thì chắn đường lùi của xuồng. Hãy nhả dây, bắt bè B ở (8, 4). Rồi cuộn và lùi cùng một nhịp, lùi thêm 1 ô. Kéo B vào bến q ở (5, 4) trước khi L tới.',
      veMaMau: 'Viết reel_in() ngay trước back() đầu tiên, đừng chen wait() vào giữa.',
      san: [
        '##########',
        '####L#####',
        '####~#####',
        '####~#####',
        '##~~qq~~B#',
        '##########'
      ],
      dong: [{ x: 4, y: 1, huong: 2, suc: 1 }, { x: 4, y: 2, huong: 2, suc: 1 }, { x: 4, y: 3, huong: 2, suc: 1 }],
      batDau: { x: 5, y: 4, huong: 1 },
      maMau: bai(['reel_out()', 'wait()', 'tow_grab()']),
      loiGiai: bai(['reel_out()', 'wait()', 'tow_grab()', 'reel_in()', 'back()', 'back()']),
      sao: { o: 11, nhip: 4 },
      loiGiaiKhac: {
        moTa: 'Dùng vòng lặp lùi 2 lần ngay sau reel_in()',
        baiLam: bai(['reel_out()', 'wait()', 'tow_grab()', 'reel_in()', 'for i in range(2):', '    back()'])
      },
      loiSai: [
        { moTa: 'Cuộn một nhịp riêng nên lục bình tới (4, 4) trước, chắn đường lùi', baiLam: bai(['reel_out()', 'wait()', 'tow_grab()', 'reel_in()', 'wait()', 'back()', 'back()']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'Cuộn và lùi hai lần nên bè lấn vào bến của lục bình', baiLam: bai(['reel_out()', 'wait()', 'tow_grab()', 'reel_in()', 'back()', 'reel_in()', 'back()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Thử viết reel_in() rồi wait() xem: lục bình tới trước, xuồng hết đường lùi.', 'Luna: Cuộn và lùi cùng lúc thì bè về 2 ô trong 1 nhịp. Bỏ wait() sau reel_in().']
    }),

    manBuocDuoi({
      so: 5, ten: 'Tự viết cuộn lùi bằng lệnh gốc', hang: 'luyen',
      camHamCuaEm: true,
      deBai: 'Sola giấu các hàm có sẵn. Hãy dùng lệnh gốc. Nhả dây, tung lưới bắt bè B ở (8, 1). Rồi lặp 2 lần: reel_in(), left_back(), right_back() và chỉ một wait(). Ba lệnh đó chạy cùng một nhịp. Kéo B vào bến q ở (4, 1).',
      veMaMau: 'Hàm có sẵn đang bị giấu. Mỗi vòng lặp có reel_in(), left_back(), right_back(), wait().',
      san: [
        '##########',
        '#~~~q~~~B#',
        '##########'
      ],
      dong: [],
      batDau: { x: 5, y: 1, huong: 1 },
      maMau: bai(['reel_out()', 'wait()', 'cast_net()', 'wait()']),
      loiGiai: bai(['reel_out()', 'wait()', 'cast_net()', 'wait()', 'for i in range(2):', '    reel_in()', '    left_back()', '    right_back()', '    wait()']),
      sao: { o: 9, nhip: 4 },
      loiSai: [
        { moTa: 'Có wait() riêng sau reel_in() nên mỗi vòng tốn 2 nhịp', baiLam: bai(['reel_out()', 'wait()', 'cast_net()', 'wait()', 'for i in range(2):', '    reel_in()', '    wait()', '    left_back()', '    right_back()', '    wait()']), phaiCoMa: [] },
        { moTa: 'Chỉ lùi bánh trái nên xuồng quay chứ không lùi', baiLam: bai(['reel_out()', 'wait()', 'cast_net()', 'wait()', 'for i in range(2):', '    reel_in()', '    left_back()', '    wait()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Một nhịp chạy được nhiều bộ phận: tời cuộn, chân vịt trái, chân vịt phải.', 'Luna: Tời làm trước, chân vịt làm sau. Bè về gần 2 ô mỗi vòng.']
    }),

    manBuocDuoi({
      so: 6, ten: 'Cuộn nấc cuối rồi chạy qua', hang: 'luyen', mucTieu: 'toi-co',
      deBai: 'Lục bình L ở (3, 1) chắn kênh hẹp tới cờ Q. Tiến về phía bè trong lúc cuộn thì xuồng cán lên dây. Chỉ nấc cuối là khác: lục bình lên khoang trước, rồi xuồng mới chạy. Hãy bắt L, cuộn 1 lần. Rồi viết reel_in() ngay trước forward(6) để cuộn nấc cuối và chạy cùng nhịp.',
      veMaMau: 'Sau tow_grab(), cuộn 1 lần có wait(). Lần cuộn thứ hai viết sát trước forward(6).',
      san: [
        '#########',
        '#~~L~~~Q#',
        '#########'
      ],
      dong: [],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['tow_grab()', 'reel_in()', 'wait()']),
      loiGiai: bai(['tow_grab()', 'reel_in()', 'wait()', 'reel_in()', 'forward(6)']),
      sao: { o: 12, nhip: 8 },
      loiGiaiKhac: {
        moTa: 'Dùng vòng lặp move() thay cho forward(6)',
        baiLam: bai(['tow_grab()', 'reel_in()', 'wait()', 'reel_in()', 'for i in range(6):', '    move()'])
      },
      loiSai: [
        { moTa: 'Tiến ngay khi dây còn 2 ô nên xuồng cán lên dây, đứng yên', baiLam: bai(['tow_grab()', 'reel_in()', 'forward(6)']), phaiCoMa: ['luoi-vuong', 'chua-toi-co'] },
        { moTa: 'Cuộn nấc cuối một nhịp riêng nên tốn thêm 1 nhịp', baiLam: bai(['tow_grab()', 'reel_in()', 'wait()', 'reel_in()', 'wait()', 'forward(6)']), phaiCoMa: [] }
      ],
      goiY: ['Luna: Dây còn 2 ô mà tiến thì mũi xuồng đè lên dây lưới.', 'Luna: Dây còn 1 ô thì cuộn nấc cuối: lục bình lên khoang trước, chân vịt chạy sau.']
    }),

    manBuocDuoi({
      so: 7, ten: 'Đọc dòng chảy chọn nhánh rẽ ở ngã tư', hang: 'bien-the', nhipTheo: 'tong',
      deBai: 'Bài 2 sân. Xuồng ở ngã tư (4, 3) hướng Đông, bè B ở (6, 3). Hãy bắt B rồi cuộn 1 ô. Đọc h = flow_dir() ở ô trước mũi. Nếu h == "left" thì bến q ở nhánh Bắc: pair_step("L", 3). Ngược lại bến ở nhánh Nam: pair_step("R", 3). Tời cuộn chạy chung nhịp với lần quay đầu tiên.',
      veMaMau: 'Viết reel_in() không kèm wait(). Rồi đọc h = flow_dir() và dùng if / else.',
      san: [
        [
          '####~###',
          '####q###',
          '####~###',
          '#~~~~~B#',
          '####~###',
          '####~###',
          '####~###'
        ],
        [
          '####~###',
          '####~###',
          '####~###',
          '#~~~~~B#',
          '####~###',
          '####q###',
          '####~###'
        ]
      ],
      dong: [
        [{ x: 5, y: 3, huong: 0, suc: 1 }],
        [{ x: 5, y: 3, huong: 2, suc: 1 }]
      ],
      batDau: [{ x: 4, y: 3, huong: 1 }, { x: 4, y: 3, huong: 1 }],
      maMau: bai(['tow_grab()', 'reel_in()', 'h = flow_dir()', 'if h == "left":', '    pair_step("L", 3)']),
      loiGiai: bai(['tow_grab()', 'reel_in()', 'h = flow_dir()', 'if h == "left":', '    pair_step("L", 3)', 'else:', '    pair_step("R", 3)']),
      sao: { o: 25, nhip: 10 },
      loiGiaiKhac: {
        moTa: 'Hỏi if h == "right": pair_step("R", 3) else: pair_step("L", 3)',
        baiLam: bai(['tow_grab()', 'reel_in()', 'h = flow_dir()', 'if h == "right":', '    pair_step("R", 3)', 'else:', '    pair_step("L", 3)'])
      },
      loiSai: [
        { moTa: 'Chỉ rẽ trái cho cả 2 sân nên ở sân 2 bè đi nhầm lên nhánh Bắc', baiLam: bai(['tow_grab()', 'reel_in()', 'pair_step("L", 3)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Thiếu nhánh else cho sân 2', baiLam: bai(['tow_grab()', 'reel_in()', 'h = flow_dir()', 'if h == "left":', '    pair_step("L", 3)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Xuồng nhìn hướng Đông. Dòng ở (5, 3) chảy lên Bắc thì flow_dir() trả "left".', 'Luna: Thêm else: pair_step("R", 3) cho sân 2.']
    }),

    manBuocDuoi({
      so: 8, ten: 'Nhổ neo, cuộn dây, quay mũi cùng một nhịp', hang: 'bien-the',
      deBai: 'Xuồng ở (2, 1) đứng trên dòng chảy xuống hẻm (2, 2). Bè B ở (5, 1) đang trôi về Tây. Hãy thả neo chờ B trôi tới (4, 1), rồi bắt B. Sau đó viết reel_in(), lift_anchor() ngay trước pair_step("R", 2). Tời cuộn, nhổ neo và quay mũi chạy cùng một nhịp. Dòng đẩy cả cụm vào hẻm. Kéo B tới bến q ở (2, 3).',
      veMaMau: 'Sau tow_grab(), viết reel_in() và lift_anchor() sát trước pair_step("R", 2).',
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
      maMau: bai(['drop_anchor()', 'tow_grab()']),
      loiGiai: bai(['drop_anchor()', 'tow_grab()', 'reel_in()', 'lift_anchor()', 'pair_step("R", 2)']),
      sao: { o: 24, nhip: 5 },
      loiGiaiKhac: {
        moTa: 'Tách pair_step("R", 2) thành turn_right() và forward(2)',
        baiLam: bai(['drop_anchor()', 'tow_grab()', 'reel_in()', 'lift_anchor()', 'turn_right()', 'forward(2)'])
      },
      loiSai: [
        { moTa: 'Chỉ gọi pair_step("R", 1) nên bè B mới tới (2, 2), chưa vào bến (2, 3)', baiLam: bai(['drop_anchor()', 'tow_grab()', 'reel_in()', 'lift_anchor()', 'pair_step("R", 1)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên lift_anchor() nên xuồng còn neo, không quay được', baiLam: bai(['drop_anchor()', 'tow_grab()', 'reel_in()', 'pair_step("R", 2)']), phaiCoMa: ['dang-neo', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Một nhịp có thể chạy ba bộ phận: mỏ neo, tời cuộn, chân vịt.', 'Luna: Neo nhổ trước, tời cuộn sau, chân vịt quay cuối cùng. Rồi dòng đẩy xuồng xuống hẻm.']
    }),

    manBuocDuoi({
      so: 9, ten: 'Đo dòng sau góc cua để chọn số bước kéo', hang: 'bien-the', nhipTheo: 'tong',
      deBai: 'Bài 2 sân. Xuồng ở góc (4, 1) hướng Đông. Hãy bắt lục bình L ở (6, 1), viết reel_in() ngay trước turn_right(): cuộn dây và quay mũi cùng một nhịp. Ô trước mũi giờ là (4, 2). Sân 1 ô đó nước êm: forward(3). Sân 2 ô đó có dòng xuôi: forward(2). Kéo L vào bến q ở (4, 3).',
      veMaMau: 'Sau tow_grab(), viết reel_in() rồi turn_right(). Dùng if is_calm_front(): forward(3) else: forward(2).',
      san: [
        [
          '########',
          '#~~~~~L#',
          '####~###',
          '####q###',
          '####~###',
          '########'
        ],
        [
          '########',
          '#~~~~~L#',
          '####~###',
          '####q###',
          '####~###',
          '########'
        ]
      ],
      dong: [
        [],
        [{ x: 4, y: 2, huong: 2, suc: 1 }]
      ],
      batDau: [{ x: 4, y: 1, huong: 1 }, { x: 4, y: 1, huong: 1 }],
      maMau: bai(['tow_grab()', 'reel_in()', 'turn_right()']),
      loiGiai: bai(['tow_grab()', 'reel_in()', 'turn_right()', 'if is_calm_front():', '    forward(3)', 'else:', '    forward(2)']),
      sao: { o: 18, nhip: 9 },
      loiGiaiKhac: {
        moTa: 'Dùng flow_step() và move() cho cả 2 sân sau khi quay phải',
        baiLam: bai(['tow_grab()', 'reel_in()', 'turn_right()', 'flow_step()', 'move()'])
      },
      loiSai: [
        { moTa: 'Quên cuộn dây nên lục bình L đi trễ 1 ô, chưa tới bến (4, 3)', baiLam: bai(['tow_grab()', 'turn_right()', 'if is_calm_front():', '    forward(3)', 'else:', '    forward(2)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Luôn gọi forward(2) nên ở sân 1 lục bình L mới tới (4, 2)', baiLam: bai(['tow_grab()', 'reel_in()', 'turn_right()', 'forward(2)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Quay tại chỗ thì dây dưới nước đứng yên, nên cuộn và quay cùng nhịp được.', 'Luna: Nước êm thì forward(3). Có dòng xuôi thì forward(2).']
    }),

    manBuocDuoi({
      so: 10, ten: 'Trùm: Hoa tiêu cuộn dây qua hẻm hẹp', hang: 'trum', nhipTheo: 'tong',
      huyHieu: { ma: 'buoc-duoi', ten: 'Huy hiệu Cuộn / Thả dây lưới' },
      deBai: 'Bài kiểm tra Trùm, 2 sân. Xuồng ở (2, 1) đứng trên dòng chảy xuống hẻm. Bè B ở (5, 1) đang trôi về Tây. Thả neo, bắt B. Rồi cuộn dây, nhổ neo và quay phải cùng một nhịp. Dòng đẩy cụm xuống (2, 2). Sân 1 ô trước mũi nước êm: forward(3). Sân 2 có dòng xuôi: forward(2). Kéo B vào bến q ở (2, 4).',
      veMaMau: 'Viết reel_in(), lift_anchor() sát trước turn_right(). Rồi dùng if is_calm_front().',
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
        'reel_in()',
        'lift_anchor()',
        'turn_right()'
      ]),
      loiGiai: bai([
        'drop_anchor()',
        'tow_grab()',
        'reel_in()',
        'lift_anchor()',
        'turn_right()',
        'if is_calm_front():',
        '    forward(3)',
        'else:',
        '    forward(2)'
      ]),
      sao: { o: 23, nhip: 11 },
      loiGiaiKhac: {
        moTa: 'Dùng flow_step() và move() sau khi quay phải ở (2, 2)',
        baiLam: bai([
          'drop_anchor()',
          'tow_grab()',
          'reel_in()',
          'lift_anchor()',
          'turn_right()',
          'flow_step()',
          'move()'
        ])
      },
      loiSai: [
        { moTa: 'Chỉ gọi forward(1) sau khi quay phải nên bè B chưa tới bến (2, 4)', baiLam: bai(['drop_anchor()', 'tow_grab()', 'reel_in()', 'lift_anchor()', 'turn_right()', 'forward(1)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên lift_anchor() nên xuồng còn neo, không quay được', baiLam: bai(['drop_anchor()', 'tow_grab()', 'reel_in()', 'turn_right()', 'forward(3)']), phaiCoMa: ['dang-neo', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Nhịp thứ ba chạy ba bộ phận: nhổ neo, cuộn dây, quay mũi.', 'Luna: Sau đó xuồng ở (2, 2) hướng Nam, bè B ở (2, 1). Kiểm tra is_calm_front() rồi tiến.']
    }),

    /* ========================================================================
       CHƯƠNG 2: che-buoc-duoi (10 màn) — Chế lệnh: kéo bè qua khúc cua
       ======================================================================== */
    manCheBuocDuoi({
      so: 1, ten: 'Chế hàm thu ngắn dây lưới tether_grab()', hang: 'lam-quen',
      taoHam: ['tether_grab'],
      deBai: 'Sola hướng dẫn: lệnh thu ngắn dây lưới set_length(1) luôn đi kèm wait() để hoàn tất nhịp kéo vật về sát mạn xuồng (độ dài 1 ô). Hãy đóng gói cặp lệnh set_length(1), wait() thành hàm tether_grab(), rồi kết hợp tow_grab(), tether_grab() và pair_step("R", 3) để bắt bè B ở (5, 1), thu ngắn dây và kéo B qua góc cua vào bến q ở (3, 3)!',
      veMaMau: 'Viết hàm tether_grab() gồm 2 dòng: set_length(1) và wait().',
      san: [
        '#######',
        '#~~~~B#',
        '###~###',
        '###q###',
        '###~###',
        '#######'
      ],
      dong: [],
      batDau: { x: 3, y: 1, huong: 1 },
      maMau: bai(['tow_grab()', 'tether_grab()', 'pair_step("R", 3)']),
      loiGiai: bai(['tow_grab()', 'tether_grab()', 'pair_step("R", 3)'], { hamCuaEmMoi: [hTetherGrab()] }),
      sao: { o: 21, nhip: 6 },
      loiGiaiKhac: {
        moTa: 'Tách pair_step("R", 3) thành turn_right() và forward(3)',
        baiLam: bai(['tow_grab()', 'tether_grab()', 'turn_right()', 'forward(3)']),
        hamCuaEmMoi: [hTetherGrab()]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm tether_grab()', baiLam: bai(['tow_grab()', 'tether_grab()', 'pair_step("R", 3)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Gọi nhầm drop_net() thay vì set_length(1) trong tether_grab() nên tháo mất lưới trước khi rẽ', baiLam: bai(['tow_grab()', 'tether_grab()', 'pair_step("R", 3)']), hamCuaEmMoi: [hTetherGrab(['drop_net()', 'wait()'])], phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Trong hàm tether_grab(), dòng 1 là set_length(1), dòng 2 là wait().', 'Luna: Chương trình chính đã gọi sẵn tow_grab(), tether_grab() và pair_step("R", 3).']
    }),

    manCheBuocDuoi({
      so: 2, ten: 'Chế hàm tháo lưới tether_drop()', hang: 'lam-quen',
      hamCuaEmCan: KHO_TRUOC.concat(['tether_grab']),
      taoHam: ['tether_drop'],
      deBai: 'Sola hướng dẫn tiếp: sau khi thu ngắn lưới và lai dắt bè tới điểm giao, lệnh tháo lưới drop_net() luôn đi kèm wait(). Hãy đóng gói drop_net(), wait() thành hàm tether_drop(), rồi kết hợp tow_grab(), tether_grab() và tether_drop() để kéo bè B từ (5, 1) về ô dòng chảy (4, 1) và thả cho dòng nước đưa B vào bến q ở (4, 2)!',
      veMaMau: 'Viết hàm tether_drop() gồm 2 dòng: drop_net() và wait().',
      san: [
        '#######',
        '#~~~~B#',
        '####q##',
        '#######'
      ],
      dong: [{ x: 4, y: 1, huong: 2, suc: 1 }],
      batDau: { x: 3, y: 1, huong: 1 },
      maMau: bai(['tow_grab()', 'tether_grab()', 'tether_drop()']),
      loiGiai: bai(['tow_grab()', 'tether_grab()', 'tether_drop()'], { hamCuaEmMoi: [hTetherDrop()] }),
      sao: { o: 9, nhip: 3 },
      loiGiaiKhac: {
        moTa: 'Dùng cast_net(), wait() thay cho tow_grab()',
        baiLam: bai(['cast_net()', 'wait()', 'tether_grab()', 'tether_drop()']),
        hamCuaEmMoi: [hTetherDrop()]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm tether_drop()', baiLam: bai(['tow_grab()', 'tether_grab()', 'tether_drop()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên gọi wait() trong tether_drop()', baiLam: bai(['tow_grab()', 'tether_grab()', 'tether_drop()']), hamCuaEmMoi: [hTetherDrop(['drop_net()'])], phaiCoMa: ['quen-wait'] }
      ],
      goiY: ['Luna: Thân hàm tether_drop() chỉ gồm 2 dòng: drop_net() rồi wait().', 'Luna: Sau khi tether_drop() chạy, dòng nước ở (4, 1) tự đẩy B xuống bến (4, 2).']
    }),

    manCheBuocDuoi({
      so: 3, ten: 'Chế hàm bắt và thu ngắn lưới tow_to_tail()', hang: 'lam-quen',
      hamCuaEmCan: KHO_TRUOC.concat(['tether_grab', 'tether_drop']),
      taoHam: ['tow_to_tail'],
      deBai: 'Sola hướng dẫn: thao tác tung lưới bắt vật ở tầm 2 ô rồi lập tức thu ngắn dây lưới về 1 ô gồm 2 hàm: tow_grab() và tether_grab(). Hãy đóng gói chúng thành hàm tow_to_tail() (không tham số), rồi gọi tow_to_tail(), turn_right() và forward(3) để kéo đám lục bình L từ (5, 1) qua góc cua (3, 1) xuống bến q ở (3, 3)!',
      veMaMau: 'Viết hàm tow_to_tail() gồm 2 dòng: tow_grab() và tether_grab().',
      san: [
        '#######',
        '#~~~~L#',
        '###~###',
        '###q###',
        '###~###',
        '#######'
      ],
      dong: [],
      batDau: { x: 3, y: 1, huong: 1 },
      maMau: bai(['tow_to_tail()', 'turn_right()', 'forward(3)']),
      loiGiai: bai(['tow_to_tail()', 'turn_right()', 'forward(3)'], { hamCuaEmMoi: [hTowToTail()] }),
      sao: { o: 16, nhip: 6 },
      loiGiaiKhac: {
        moTa: 'Dùng pair_step("R", 3) thay cho turn_right() và forward(3)',
        baiLam: bai(['tow_to_tail()', 'pair_step("R", 3)']),
        hamCuaEmMoi: [hTowToTail()]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm tow_to_tail()', baiLam: bai(['tow_to_tail()', 'turn_right()', 'forward(3)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Gọi ngược tether_grab() trước tow_grab() nên đặt độ dài lưới thành 1 trước khi tung, làm hụt L ở (5, 1)', baiLam: bai(['tow_to_tail()', 'turn_right()', 'forward(3)']), hamCuaEmMoi: [hTowToTail(['tether_grab()', 'tow_grab()'])], phaiCoMa: ['keo-hut', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Trong tow_to_tail(), gọi tow_grab() ở dòng 1 và tether_grab() ở dòng 2.', 'Luna: Sau tow_to_tail(), lục bình L đã được thu về (4, 1) với dây ngắn 1 ô, sẵn sàng rẽ xuống bến (3, 3).']
    }),

    manCheBuocDuoi({
      so: 4, ten: 'Chế hàm kéo bè qua góc cua tug_corner(d, n)', hang: 'luyen',
      hamCuaEmCan: KHO_TRUOC.concat(['tether_grab', 'tether_drop', 'tow_to_tail']),
      taoHam: ['tug_corner'],
      deBai: 'Sola hướng dẫn: khi đứng ở ngã rẽ và cần tung lưới bắt bè phía trước, thu ngắn dây về 1 ô rồi rẽ theo hướng d ("L", "R") đi n bước, ta dùng hàm tug_corner(d, n) gồm 2 dòng: tow_to_tail() và pair_step(d, n). Hãy chế hàm tug_corner(d, n), rồi từ (2, 1) gọi move() tới ngã rẽ (3, 1) và gọi tug_corner("R", 3) kéo bè B vào bến q ở (3, 3)!',
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
      deBai: 'Sola thử thách trên 2 sân: xuồng đang ở ngã tư (3, 3) hướng Đông, bè B ở (5, 3). Ô ngay trước mũi (4, 3) có dòng chảy báo hướng bến q: ở sân 1 dòng chảy hướng Bắc ("left") báo bến q ở (3, 1); ở sân 2 dòng chảy hướng Nam ("right") báo bến q ở (3, 5). Hãy đọc h = flow_dir() rồi dùng if/else gọi tug_corner("L", 3) hoặc tug_corner("R", 3) để đưa B vào bến!',
      veMaMau: 'Đã có h = flow_dir() và if h == "left": tug_corner("L", 3). Thêm else: tug_corner("R", 3).',
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
      maMau: bai(['h = flow_dir()', 'if h == "left":', '    tug_corner("L", 3)']),
      loiGiai: bai(['h = flow_dir()', 'if h == "left":', '    tug_corner("L", 3)', 'else:', '    tug_corner("R", 3)']),
      sao: { o: 27, nhip: 12 },
      loiGiaiKhac: {
        moTa: 'Hỏi if h == "right": tug_corner("R", 3) else: tug_corner("L", 3)',
        baiLam: bai(['h = flow_dir()', 'if h == "right":', '    tug_corner("R", 3)', 'else:', '    tug_corner("L", 3)'])
      },
      loiSai: [
        { moTa: 'Luôn gọi tug_corner("L", 3) nên ở sân 2 kéo bè đi nhầm lên nhánh Bắc', baiLam: bai(['tug_corner("L", 3)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Thiếu nhánh else cho sân 2', baiLam: bai(['h = flow_dir()', 'if h == "left":', '    tug_corner("L", 3)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Lưu ý phải đọc flow_dir() ngay đầu chương trình trước khi gọi tug_corner.', 'Luna: Thêm nhánh else: tug_corner("R", 3) để xử lý sân 2.']
    }),

    manCheBuocDuoi({
      so: 6, ten: 'Chế hàm kéo qua cua rồi thả lưới deliver_tail(d, n)', hang: 'luyen',
      hamCuaEmCan: KHO_TRUOC.concat(['tether_grab', 'tether_drop', 'tow_to_tail', 'tug_corner']),
      taoHam: ['deliver_tail'],
      deBai: 'Sola hướng dẫn: khi cần giao nhiều vật nổi trên cùng một màn, sau khi dùng tug_corner(d, n) kéo vật thứ nhất vào đúng ô bến q, ta phải gọi tether_drop() tháo lưới để vật thứ nhất nằm lại trên bến và giải phóng lưới đi bắt vật thứ hai! Hãy chế hàm deliver_tail(d, n) gồm tug_corner(d, n) và tether_drop(), rồi gọi deliver_tail("R", 2), turn_left() và tow_pair(0, 1) để giao cả bè B lẫn lục bình L vào 2 bến q!',
      veMaMau: 'Viết hàm deliver_tail(d, n) gồm tug_corner(d, n) và tether_drop().',
      san: [
        '#######',
        '#~~~~B#',
        '###q###',
        '##~~qL#',
        '#######'
      ],
      dong: [],
      batDau: { x: 3, y: 1, huong: 1 },
      maMau: bai(['deliver_tail("R", 2)', 'turn_left()', 'tow_pair(0, 1)']),
      loiGiai: bai(['deliver_tail("R", 2)', 'turn_left()', 'tow_pair(0, 1)'], { hamCuaEmMoi: [hDeliverTail()] }),
      sao: { o: 38, nhip: 9 },
      loiGiaiKhac: {
        moTa: 'Dùng pair_step("L", 0) thay cho turn_left()',
        baiLam: bai(['deliver_tail("R", 2)', 'pair_step("L", 0)', 'tow_pair(0, 1)']),
        hamCuaEmMoi: [hDeliverTail()]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm deliver_tail(d, n)', baiLam: bai(['deliver_tail("R", 2)', 'turn_left()', 'tow_pair(0, 1)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên gọi tether_drop() trong deliver_tail(d, n) nên lưới vẫn giữ bè B khi tung lưới bắt L', baiLam: bai(['deliver_tail("R", 2)', 'turn_left()', 'tow_pair(0, 1)']), hamCuaEmMoi: [hDeliverTail(['tug_corner(d, n)'])], phaiCoMa: ['dang-keo', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Trong deliver_tail(d, n), dòng 1 là tug_corner(d, n), dòng 2 là tether_drop().', 'Luna: Sau deliver_tail("R", 2), bè B đã nằm yên trên bến (3, 2) và xuồng ở (3, 3) sẵn sàng quay trái kéo L ở (5, 3) về bến (4, 3).']
    }),

    manCheBuocDuoi({
      so: 7, ten: 'Sửa hàm quên tháo lưới fix_tail_drop()', hang: 'bien-the',
      chinhCoDinh: true,
      hamCuaEmCan: KHO_TRUOC.concat(['tether_grab', 'tether_drop', 'tow_to_tail', 'tug_corner', 'deliver_tail']),
      deBai: 'Sola phát hiện lỗi: chương trình chính gọi fix_tail_drop("R", 2) để kéo bè B từ (5, 1) qua góc cua vào bến q thứ nhất ở (3, 2), rồi gọi turn_left() và tow_pair(0, 1) để kéo lục bình L từ (5, 3) về bến q thứ hai ở (4, 3). Nhưng trong fix_tail_drop(d, n) lại mới chỉ có tug_corner(d, n), quên mất tether_drop() ở cuối nên lưới vẫn giữ chặt B! Hãy thêm tether_drop() vào cuối hàm fix_tail_drop(d, n).',
      veMaMau: 'Chương trình chính đã khóa. Hãy thêm tether_drop() vào cuối hàm fix_tail_drop(d, n).',
      san: [
        '#######',
        '#~~~~B#',
        '###q###',
        '##~~qL#',
        '#######'
      ],
      dong: [],
      batDau: { x: 3, y: 1, huong: 1 },
      maMau: bai(['fix_tail_drop("R", 2)', 'turn_left()', 'tow_pair(0, 1)'], { hamCuaMan: [hFixTailDrop(T_FIX_TAIL_SAI)] }),
      loiGiai: bai(['fix_tail_drop("R", 2)', 'turn_left()', 'tow_pair(0, 1)'], { hamCuaMan: [hFixTailDrop(T_FIX_TAIL_DUNG)] }),
      sao: { o: 38, nhip: 9 },
      loiSai: [
        { moTa: 'Chưa thêm tether_drop() vào cuối hàm fix_tail_drop(d, n)', baiLam: bai(['fix_tail_drop("R", 2)', 'turn_left()', 'tow_pair(0, 1)'], { hamCuaMan: [hFixTailDrop(T_FIX_TAIL_SAI)] }), phaiCoMa: ['dang-keo', 'chua-dua-vat'] },
        { moTa: 'Gọi tether_drop() trước tug_corner(d, n) nên tháo lưới khi chưa bắt bè', baiLam: bai(['fix_tail_drop("R", 2)', 'turn_left()', 'tow_pair(0, 1)'], { hamCuaMan: [hFixTailDrop(['tether_drop()', 'tug_corner(d, n)'])] }), phaiCoMa: ['khong-keo', 'dang-keo', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau tug_corner(d, n), bè B đã nằm đúng trên bến (3, 2) nhưng lưới vẫn đang giữ B.', 'Luna: Thêm dòng tether_drop() vào dòng 2 của fix_tail_drop(d, n).']
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
        { moTa: 'Quên gọi turn_left() ở (3, 3) nên tung lưới xuống phía Nam thay vì phía Đông lấy L', baiLam: bai(['deliver_tail("R", 2)', 'deliver_tail("R", 2)']), phaiCoMa: ['keo-hut', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau deliver_tail("R", 2) đầu tiên và turn_left(), xuồng ở (3, 3) đã hướng thẳng vào L ở (5, 3).', 'Luna: Gọi thêm deliver_tail("R", 2) để kéo L qua góc (3, 3) xuống bến (3, 4).']
    }),

    manCheBuocDuoi({
      so: 9, ten: 'Đọc dòng chảy chọn nhánh cho kiện hàng thứ hai', hang: 'bien-the', nhipTheo: 'tong',
      hamCuaEmCan: KHO_TRUOC.concat(['tether_grab', 'tether_drop', 'tow_to_tail', 'tug_corner', 'deliver_tail']),
      deBai: 'Sola giao bài toán 2 sân: từ (3, 1) hướng Đông, hãy gọi deliver_tail("R", 2) để giao bè B vào bến (3, 2) và đưa xuồng tới ngã tư (3, 3) hướng Nam. Tại (3, 3), ô trước mũi (3, 4) có dòng chảy chỉ hướng của lục bình L: ở sân 1 dòng chảy sang Đông ("left") báo L nằm bên trái (nhánh Đông); ở sân 2 dòng chảy sang Tây ("right") báo L nằm bên phải (nhánh Tây). Hãy đọc h = flow_dir() rồi dùng if/else quay đúng hướng rồi gọi tow_pair(0, 1) kéo L vào bến q thứ hai!',
      veMaMau: 'Gọi deliver_tail("R", 2), rồi h = flow_dir(), if h == "left": turn_left() else: turn_right(), và cuối cùng tow_pair(0, 1).',
      san: [
        [
          '#######',
          '#~~~~B#',
          '###q###',
          '##~~qL#',
          '###~###',
          '#######'
        ],
        [
          '#######',
          '#~~~~B#',
          '###q###',
          '#Lq~~##',
          '###~###',
          '#######'
        ]
      ],
      dong: [
        [{ x: 3, y: 4, huong: 1, suc: 1 }],
        [{ x: 3, y: 4, huong: 3, suc: 1 }]
      ],
      batDau: [{ x: 3, y: 1, huong: 1 }, { x: 3, y: 1, huong: 1 }],
      maMau: bai(['deliver_tail("R", 2)', 'h = flow_dir()', 'if h == "left":', '    turn_left()']),
      loiGiai: bai(['deliver_tail("R", 2)', 'h = flow_dir()', 'if h == "left":', '    turn_left()', 'else:', '    turn_right()', 'tow_pair(0, 1)']),
      sao: { o: 41, nhip: 18 },
      loiGiaiKhac: {
        moTa: 'Hỏi if h == "right": turn_right() else: turn_left()',
        baiLam: bai(['deliver_tail("R", 2)', 'h = flow_dir()', 'if h == "right":', '    turn_right()', 'else:', '    turn_left()', 'tow_pair(0, 1)'])
      },
      loiSai: [
        { moTa: 'Luôn quay trái sau deliver_tail("R", 2) nên ở sân 2 tung lưới vào bờ kè phía Đông', baiLam: bai(['deliver_tail("R", 2)', 'turn_left()', 'tow_pair(0, 1)']), phaiCoMa: ['keo-hut', 'chua-dua-vat'] },
        { moTa: 'Quên gọi tow_pair(0, 1) sau khối if/else nên chưa giao lục bình L', baiLam: bai(['deliver_tail("R", 2)', 'h = flow_dir()', 'if h == "left":', '    turn_left()', 'else:', '    turn_right()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Khi xuồng ở (3, 3) hướng Nam, dòng chảy hướng Đông ở (3, 4) là bên trái mũi xuồng ("left").', 'Luna: Sau khối if/else quay hướng, gọi tow_pair(0, 1) để bắt và kéo L lùi 1 ô vào bến q.']
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
        { moTa: 'Luôn gọi deliver_tail("R", 2) cho kiện hàng thứ hai nên ở sân 2 tung lưới hụt về phía Đông', baiLam: bai(['deliver_tail("R", 2)', 'turn_left()', 'deliver_tail("R", 2)']), phaiCoMa: ['keo-hut', 'chua-dua-vat'] },
        { moTa: 'Ở sân 2 sau khi u_turn() lại gọi deliver_tail("R", 2) nên rẽ nhầm lên nhánh Bắc thay vì xuống nhánh Nam', baiLam: bai(['deliver_tail("R", 2)', 'turn_left()', 'if is_calm_front():', '    u_turn()', '    deliver_tail("R", 2)', 'else:', '    deliver_tail("R", 2)']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau deliver_tail("R", 2) đầu tiên và turn_left(), xuồng ở (3, 3) đang hướng Đông nhìn vào (4, 3).', 'Luna: Nếu is_calm_front() đúng (sân 2), gọi u_turn() quay sang Tây rồi gọi deliver_tail("L", 2) để rẽ trái xuống Nam; ngược lại (sân 1) gọi deliver_tail("R", 2).']
    })
  ];

  if (M && M.them) M.manBuocDuoi = MAN;
  if (typeof module !== 'undefined' && module.exports) module.exports = M;
})();
