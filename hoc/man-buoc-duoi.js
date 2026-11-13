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
  var ROBOT_DUOI = { than: 'xuong', tay: 'day-keo', camBien: [{ ma: 'dong-chay', o: 'tren' }], cuonDay: true };
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

  // tether_grab() chỉ RA LỆNH cuộn (không wait): tời cuộn chạy chung nhịp với lệnh chạy ngay sau (như lift_anchor() gói 5).
  var T_TETHER_GRAB = ['reel_in()'];
  var T_TETHER_DROP = ['drop_net()', 'wait()'];
  var T_TOW_TO_TAIL = ['tow_grab()', 'tether_grab()'];
  var T_TUG_CORNER = ['tow_to_tail()', 'pair_step(d, n)'];
  var T_DELIVER_TAIL = ['tug_corner(d, n)', 'tether_drop()'];
  var T_REEL_HOME = ['for i in range(n):', '    reel_in()', '    back()'];
  var T_FIX_TAIL_SAI = ['tug_corner(d, n)'];
  var T_FIX_TAIL_DUNG = ['tug_corner(d, n)', 'tether_drop()'];

  function hTetherGrab(than) { return H('tether_grab', [], than || T_TETHER_GRAB); }
  function hTetherDrop(than) { return H('tether_drop', [], than || T_TETHER_DROP); }
  function hTowToTail(than) { return H('tow_to_tail', [], than || T_TOW_TO_TAIL); }
  function hTugCorner(than) { return H('tug_corner', ['d', 'n'], than || T_TUG_CORNER); }
  function hDeliverTail(than) { return H('deliver_tail', ['d', 'n'], than || T_DELIVER_TAIL); }
  function hReelHome(than) { return H('reel_home', ['n'], than || T_REEL_HOME); }
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
      loaiRobot: 'xuong', robot: ROBOT_DUOI, chinhLuoi: false, cuonDay: true, vo: 'song', mucTieu: 'dua-vat',
      hamGoc: GOC_DUOI, bienDem: true, cauTruc: CAU_TRUC,
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
       tether_grab() = reel_in() (không wait: tời cuộn ghép với lệnh chạy ngay sau) · reel_home(n) = n nhịp cuộn + lùi
       4 chế reel_home · 5 ép (lục bình chắn đường lùi) · 6–10 tug_corner / deliver_tail ghép cuộn + quay mũi
       ======================================================================== */
    manCheBuocDuoi({
      so: 1, ten: 'Chế hàm cuộn dây tether_grab()', hang: 'lam-quen',
      taoHam: ['tether_grab'],
      deBai: 'Sola dạy chế hàm. Hàm tether_grab() chỉ có 1 dòng: reel_in(). Trong hàm không có wait(). Nhờ vậy tời cuộn chạy chung nhịp với lệnh chạy ngay sau nó. Hãy chế hàm, rồi gọi tow_grab(), tether_grab(), pair_step("R", 3). Kéo bè B vào bến q ở (3, 3).',
      veMaMau: 'Viết hàm tether_grab() gồm 1 dòng: reel_in().',
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
      sao: { o: 20, nhip: 5 },
      loiGiaiKhac: {
        moTa: 'Tách pair_step("R", 3) thành turn_right() và forward(3)',
        baiLam: bai(['tow_grab()', 'tether_grab()', 'turn_right()', 'forward(3)']),
        hamCuaEmMoi: [hTetherGrab()]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm tether_grab()', baiLam: bai(['tow_grab()', 'tether_grab()', 'pair_step("R", 3)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Thêm wait() vào tether_grab() nên cuộn dây tốn một nhịp riêng', baiLam: bai(['tow_grab()', 'tether_grab()', 'pair_step("R", 3)']), hamCuaEmMoi: [hTetherGrab(['reel_in()', 'wait()'])], phaiCoMa: [] }
      ],
      goiY: ['Luna: Thân hàm tether_grab() chỉ có reel_in(). Không viết wait().', 'Luna: Lần quay đầu tiên trong pair_step("R", 3) chạy chung nhịp với tời cuộn.']
    }),

    manCheBuocDuoi({
      so: 2, ten: 'Chế hàm tháo lưới tether_drop()', hang: 'lam-quen',
      hamCuaEmCan: KHO_TRUOC.concat(['tether_grab']),
      taoHam: ['tether_drop'],
      deBai: 'Hàm tether_drop() gồm drop_net() và wait(). Lần này sau tether_grab() không có lệnh chạy. Hai lệnh dây trong một nhịp thì lệnh sau bị bỏ. Nên cần một wait() cho tời cuộn xong. Hãy chế hàm, kéo bè B về ô dòng chảy (4, 1), rồi thả lưới. Dòng nước đưa B vào bến q ở (4, 2).',
      veMaMau: 'Viết hàm tether_drop() gồm 2 dòng: drop_net() và wait(). Nhớ wait() sau tether_grab().',
      san: [
        '#######',
        '#~~~~B#',
        '####q##',
        '#######'
      ],
      dong: [{ x: 4, y: 1, huong: 2, suc: 1 }],
      batDau: { x: 3, y: 1, huong: 1 },
      maMau: bai(['tow_grab()', 'tether_grab()', 'wait()', 'tether_drop()']),
      loiGiai: bai(['tow_grab()', 'tether_grab()', 'wait()', 'tether_drop()'], { hamCuaEmMoi: [hTetherDrop()] }),
      sao: { o: 9, nhip: 3 },
      loiGiaiKhac: {
        moTa: 'Dùng cast_net(), wait() thay cho tow_grab()',
        baiLam: bai(['cast_net()', 'wait()', 'tether_grab()', 'wait()', 'tether_drop()']),
        hamCuaEmMoi: [hTetherDrop()]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm tether_drop()', baiLam: bai(['tow_grab()', 'tether_grab()', 'wait()', 'tether_drop()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên wait() sau tether_grab() nên drop_net() chung nhịp với reel_in() và bị bỏ', baiLam: bai(['tow_grab()', 'tether_grab()', 'tether_drop()']), hamCuaEmMoi: [hTetherDrop()], phaiCoMa: ['phao-goi-lai', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Tời chỉ làm một lệnh mỗi nhịp. reel_in() và drop_net() phải ở hai nhịp khác nhau.', 'Luna: Thả lưới xong, dòng ở (4, 1) tự đẩy B xuống bến (4, 2).']
    }),

    manCheBuocDuoi({
      so: 3, ten: 'Chế hàm bắt và cuộn dây tow_to_tail()', hang: 'lam-quen',
      hamCuaEmCan: KHO_TRUOC.concat(['tether_grab', 'tether_drop']),
      taoHam: ['tow_to_tail'],
      deBai: 'Tung lưới rồi cuộn 1 ô là việc hay làm. Hãy gói tow_grab() và tether_grab() vào hàm tow_to_tail(). Hàm kết thúc bằng tether_grab(), nên tời cuộn chạy chung nhịp với turn_right() ngay sau. Kéo lục bình L từ (5, 1) qua góc cua xuống bến q ở (3, 3).',
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
      sao: { o: 15, nhip: 5 },
      loiGiaiKhac: {
        moTa: 'Dùng pair_step("R", 3) thay cho turn_right() và forward(3)',
        baiLam: bai(['tow_to_tail()', 'pair_step("R", 3)']),
        hamCuaEmMoi: [hTowToTail()]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm tow_to_tail()', baiLam: bai(['tow_to_tail()', 'turn_right()', 'forward(3)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Gọi tether_grab() trước tow_grab() nên cuộn và tung lưới chung một nhịp, lệnh tung lưới bị bỏ', baiLam: bai(['tow_to_tail()', 'turn_right()', 'forward(3)']), hamCuaEmMoi: [hTowToTail(['tether_grab()', 'tow_grab()'])], phaiCoMa: ['phao-goi-lai', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Trong tow_to_tail(), dòng 1 là tow_grab(), dòng 2 là tether_grab().', 'Luna: Quay tại chỗ thì dây dưới nước đứng yên, nên cuộn và quay cùng nhịp được.']
    }),

    manCheBuocDuoi({
      so: 4, ten: 'Chế hàm cuộn lùi reel_home(n)', hang: 'luyen',
      hamCuaEmCan: KHO_TRUOC.concat(['tether_grab', 'tether_drop', 'tow_to_tail']),
      taoHam: ['reel_home'],
      deBai: 'Cuộn và lùi cùng nhịp, lặp n lần. Hãy chế hàm reel_home(n): vòng lặp n lần, mỗi vòng có reel_in() rồi back(). Xuồng nhìn lên Bắc. Nhả dây, bắt bè B ở (2, 2). Rồi gọi reel_home(2) kéo B vào bến q ở (2, 6).',
      veMaMau: 'Viết hàm reel_home(n): for i in range(n): reel_in() rồi back().',
      san: [
        '#####',
        '##~##',
        '##B##',
        '##~##',
        '##~##',
        '##~##',
        '##q##',
        '##~##',
        '#####'
      ],
      dong: [],
      batDau: { x: 2, y: 5, huong: 0 },
      maMau: bai(['reel_out()', 'wait()', 'tow_grab()', 'reel_home(2)']),
      loiGiai: bai(['reel_out()', 'wait()', 'tow_grab()', 'reel_home(2)'], { hamCuaEmMoi: [hReelHome()] }),
      sao: { o: 12, nhip: 4 },
      loiGiaiKhac: {
        moTa: 'Viết thân hàm bằng lệnh gốc: reel_in(), left_back(), right_back(), wait()',
        baiLam: bai(['reel_out()', 'wait()', 'tow_grab()', 'reel_home(2)']),
        hamCuaEmMoi: [hReelHome(['for i in range(n):', '    reel_in()', '    left_back()', '    right_back()', '    wait()'])]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm reel_home(n)', baiLam: bai(['reel_out()', 'wait()', 'tow_grab()', 'reel_home(2)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên back() trong vòng lặp nên xuồng đứng yên, bè chỉ về (2, 4)', baiLam: bai(['reel_out()', 'wait()', 'tow_grab()', 'reel_home(2)']), hamCuaEmMoi: [hReelHome(['for i in range(n):', '    reel_in()', '    wait()'])], phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Mỗi vòng, tời cuộn 1 ô và xuồng lùi 1 ô trong cùng một nhịp.', 'Luna: Bè về gần 2 ô mỗi vòng. Hai vòng là tới bến.']
    }),

    manCheBuocDuoi({
      so: 5, ten: 'Lục bình trồi lên chắn đường lùi', hang: 'luyen',
      hamCuaEmCan: KHO_TRUOC.concat(['tether_grab', 'tether_drop', 'tow_to_tail', 'reel_home']),
      deBai: 'Xuồng nhìn về Tây. Lục bình L trôi lên bến q của nó ở (7, 1). Nó tới đó thì chắn đường lùi. Hãy nhả dây, bắt bè B ở (2, 1). Gọi reel_home(1) để cuộn và lùi cùng nhịp. Rồi lùi thêm 2 ô. Kéo B vào bến q ở (6, 1).',
      veMaMau: 'Sau tow_grab(), gọi reel_home(1) rồi back() hai lần.',
      san: [
        '##########',
        '##B~~~qq~#',
        '#######~##',
        '#######~##',
        '#######~##',
        '#######L##',
        '##########'
      ],
      dong: [{ x: 7, y: 2, huong: 0, suc: 1 }, { x: 7, y: 3, huong: 0, suc: 1 }, { x: 7, y: 4, huong: 0, suc: 1 }, { x: 7, y: 5, huong: 0, suc: 1 }],
      batDau: { x: 5, y: 1, huong: 3 },
      maMau: bai(['reel_out()', 'wait()', 'tow_grab()']),
      loiGiai: bai(['reel_out()', 'wait()', 'tow_grab()', 'reel_home(1)', 'back()', 'back()']),
      sao: { o: 14, nhip: 5 },
      loiGiaiKhac: {
        moTa: 'Dùng vòng lặp lùi 2 lần sau reel_home(1)',
        baiLam: bai(['reel_out()', 'wait()', 'tow_grab()', 'reel_home(1)', 'for i in range(2):', '    back()'])
      },
      loiSai: [
        { moTa: 'Cuộn một nhịp riêng rồi mới lùi nên lục bình tới (7, 1) trước, chắn đường lùi', baiLam: bai(['reel_out()', 'wait()', 'tow_grab()', 'reel_in()', 'wait()', 'back()', 'back()', 'back()']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'Gọi reel_home(2) nên bè đi quá, lấn vào bến của lục bình', baiLam: bai(['reel_out()', 'wait()', 'tow_grab()', 'reel_home(2)', 'back()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Tách cuộn và lùi thì chậm 1 nhịp. Lục bình kịp chắn ô (7, 1).', 'Luna: Bè chỉ cần cuộn 1 nấc. Còn lại là lùi.']
    }),

    manCheBuocDuoi({
      so: 6, ten: 'Chế hàm kéo bè qua góc cua tug_corner(d, n)', hang: 'luyen',
      hamCuaEmCan: KHO_TRUOC.concat(['tether_grab', 'tether_drop', 'tow_to_tail', 'reel_home']),
      taoHam: ['tug_corner'],
      deBai: 'Đứng ở ngã rẽ: bắt bè phía trước, cuộn 1 ô, rồi rẽ hướng d đi n bước. Hãy chế hàm tug_corner(d, n) gồm tow_to_tail() và pair_step(d, n). Tời cuộn chạy chung nhịp với lần quay đầu. Từ (2, 1), gọi move() tới ngã rẽ (3, 1), rồi gọi tug_corner("R", 3). Kéo bè B vào bến q ở (3, 3).',
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
      sao: { o: 23, nhip: 6 },
      loiGiaiKhac: {
        moTa: 'Gọi forward(1) thay cho move() trước tug_corner("R", 3)',
        baiLam: bai(['forward(1)', 'tug_corner("R", 3)']),
        hamCuaEmMoi: [hTugCorner()]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm tug_corner(d, n)', baiLam: bai(['move()', 'tug_corner("R", 3)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Viết cố định pair_step(d, 1) thay vì pair_step(d, n) nên bè chưa tới bến', baiLam: bai(['move()', 'tug_corner("R", 3)']), hamCuaEmMoi: [hTugCorner(['tow_to_tail()', 'pair_step(d, 1)'])], phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Thân hàm tug_corner(d, n) gồm 2 dòng: tow_to_tail() rồi pair_step(d, n).', 'Luna: move() đưa xuồng tới (3, 1). tug_corner("R", 3) kéo B qua góc cua xuống (3, 3).']
    }),

    manCheBuocDuoi({
      so: 7, ten: 'Chế hàm kéo qua cua rồi thả lưới deliver_tail(d, n)', hang: 'bien-the',
      hamCuaEmCan: KHO_TRUOC.concat(['tether_grab', 'tether_drop', 'tow_to_tail', 'reel_home', 'tug_corner']),
      taoHam: ['deliver_tail'],
      deBai: 'Có 2 kiện hàng. Kéo kiện thứ nhất vào bến xong phải tháo lưới, lưới mới rảnh bắt kiện thứ hai. Hãy chế hàm deliver_tail(d, n) gồm tug_corner(d, n) và tether_drop(). Rồi gọi deliver_tail("R", 2), turn_left() và tow_pair(0, 1). Giao bè B và lục bình L vào 2 bến q.',
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
      sao: { o: 41, nhip: 8 },
      loiGiaiKhac: {
        moTa: 'Dùng pair_step("L", 0) thay cho turn_left()',
        baiLam: bai(['deliver_tail("R", 2)', 'pair_step("L", 0)', 'tow_pair(0, 1)']),
        hamCuaEmMoi: [hDeliverTail()]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm deliver_tail(d, n)', baiLam: bai(['deliver_tail("R", 2)', 'turn_left()', 'tow_pair(0, 1)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên tether_drop() trong deliver_tail(d, n) nên lưới vẫn giữ B khi tung lưới bắt L', baiLam: bai(['deliver_tail("R", 2)', 'turn_left()', 'tow_pair(0, 1)']), hamCuaEmMoi: [hDeliverTail(['tug_corner(d, n)'])], phaiCoMa: ['dang-keo', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Trong deliver_tail(d, n), dòng 1 là tug_corner(d, n), dòng 2 là tether_drop().', 'Luna: Sau deliver_tail("R", 2), B nằm trên bến (3, 2). Xuồng ở (3, 3) quay trái để kéo L ở (5, 3) về bến (4, 3).']
    }),

    manCheBuocDuoi({
      so: 8, ten: 'Sửa hàm quên tháo lưới fix_tail_drop()', hang: 'bien-the',
      chinhCoDinh: true,
      hamCuaEmCan: KHO_TRUOC.concat(['tether_grab', 'tether_drop', 'tow_to_tail', 'reel_home', 'tug_corner', 'deliver_tail']),
      deBai: 'Sola phát hiện lỗi. Chương trình chính gọi fix_tail_drop("R", 2) kéo bè B vào bến q ở (3, 2). Rồi turn_left() và tow_pair(0, 1) kéo lục bình L về bến q ở (4, 3). Nhưng fix_tail_drop(d, n) mới có tug_corner(d, n), quên tether_drop() nên lưới còn giữ B. Hãy thêm tether_drop() vào cuối hàm.',
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
      sao: { o: 41, nhip: 8 },
      loiSai: [
        { moTa: 'Chưa thêm tether_drop() vào cuối hàm fix_tail_drop(d, n)', baiLam: bai(['fix_tail_drop("R", 2)', 'turn_left()', 'tow_pair(0, 1)'], { hamCuaMan: [hFixTailDrop(T_FIX_TAIL_SAI)] }), phaiCoMa: ['dang-keo', 'chua-dua-vat'] },
        { moTa: 'Gọi tether_drop() trước tug_corner(d, n) nên tháo lưới khi chưa bắt bè', baiLam: bai(['fix_tail_drop("R", 2)', 'turn_left()', 'tow_pair(0, 1)'], { hamCuaMan: [hFixTailDrop(['tether_drop()', 'tug_corner(d, n)'])] }), phaiCoMa: ['khong-keo', 'dang-keo', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau tug_corner(d, n), bè B nằm đúng bến (3, 2) nhưng lưới còn giữ B.', 'Luna: Thêm tether_drop() vào dòng 2 của fix_tail_drop(d, n).']
    }),

    manCheBuocDuoi({
      so: 9, ten: 'Đọc dòng chảy chọn nhánh cho kiện hàng thứ hai', hang: 'bien-the', nhipTheo: 'tong',
      hamCuaEmCan: KHO_TRUOC.concat(['tether_grab', 'tether_drop', 'tow_to_tail', 'reel_home', 'tug_corner', 'deliver_tail']),
      deBai: 'Bài 2 sân. Từ (3, 1) hướng Đông, gọi deliver_tail("R", 2) giao bè B vào bến (3, 2). Xuồng tới ngã tư (3, 3), hướng Nam. Ô trước mũi (3, 4) có dòng chỉ chỗ lục bình L. Sân 1 dòng chảy sang Đông ("left"): L ở nhánh Đông. Sân 2 dòng chảy sang Tây ("right"): L ở nhánh Tây. Đọc h = flow_dir(), quay đúng hướng, rồi gọi tow_pair(0, 1).',
      veMaMau: 'Gọi deliver_tail("R", 2), rồi h = flow_dir(), if h == "left": turn_left() else: turn_right(), cuối cùng tow_pair(0, 1).',
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
      sao: { o: 45, nhip: 16 },
      loiGiaiKhac: {
        moTa: 'Hỏi if h == "right": turn_right() else: turn_left()',
        baiLam: bai(['deliver_tail("R", 2)', 'h = flow_dir()', 'if h == "right":', '    turn_right()', 'else:', '    turn_left()', 'tow_pair(0, 1)'])
      },
      loiSai: [
        { moTa: 'Luôn quay trái sau deliver_tail("R", 2) nên ở sân 2 tung lưới vào bờ', baiLam: bai(['deliver_tail("R", 2)', 'turn_left()', 'tow_pair(0, 1)']), phaiCoMa: ['keo-hut', 'chua-dua-vat'] },
        { moTa: 'Quên tow_pair(0, 1) sau khối if / else nên chưa giao lục bình L', baiLam: bai(['deliver_tail("R", 2)', 'h = flow_dir()', 'if h == "left":', '    turn_left()', 'else:', '    turn_right()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Xuồng ở (3, 3) hướng Nam. Dòng chảy sang Đông là bên trái mũi xuồng ("left").', 'Luna: Sau khối if / else, gọi tow_pair(0, 1) để bắt L và kéo lùi 1 ô vào bến q.']
    }),

    manCheBuocDuoi({
      so: 10, ten: 'Trùm: Điều phối lai dắt hai kiện hàng qua kênh đôi', hang: 'trum', nhipTheo: 'tong',
      huyHieu: { ma: 'che-buoc-duoi', ten: 'Huy hiệu Chế lệnh: kéo bè qua khúc cua' },
      hamCuaEmCan: KHO_TRUOC.concat(['tether_grab', 'tether_drop', 'tow_to_tail', 'reel_home', 'tug_corner', 'deliver_tail']),
      deBai: 'Thử thách khép lại Gói 6, 2 sân. Từ (3, 1) hướng Đông, gọi deliver_tail("R", 2) giao bè B vào bến (3, 2). Rồi turn_left() ở ngã tư (3, 3) để nhìn sang Đông. Nếu is_calm_front() đúng (sân 2): lục bình L ở nhánh Tây, gọi u_turn() rồi deliver_tail("L", 2). Ngược lại (sân 1): L ở nhánh Đông, gọi deliver_tail("R", 2). Kéo L xuống bến q ở (3, 4).',
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
      sao: { o: 39, nhip: 21 },
      loiGiaiKhac: {
        moTa: 'Kiểm tra if not is_calm_front(): deliver_tail("R", 2) else: u_turn(), deliver_tail("L", 2)',
        baiLam: bai(['deliver_tail("R", 2)', 'turn_left()', 'if not is_calm_front():', '    deliver_tail("R", 2)', 'else:', '    u_turn()', '    deliver_tail("L", 2)'])
      },
      loiSai: [
        { moTa: 'Luôn gọi deliver_tail("R", 2) cho kiện thứ hai nên ở sân 2 tung lưới hụt về phía Đông', baiLam: bai(['deliver_tail("R", 2)', 'turn_left()', 'deliver_tail("R", 2)']), phaiCoMa: ['keo-hut', 'chua-dua-vat'] },
        { moTa: 'Ở sân 2 sau u_turn() lại gọi deliver_tail("R", 2) nên rẽ nhầm lên nhánh Bắc', baiLam: bai(['deliver_tail("R", 2)', 'turn_left()', 'if is_calm_front():', '    u_turn()', '    deliver_tail("R", 2)', 'else:', '    deliver_tail("R", 2)']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau deliver_tail("R", 2) và turn_left(), xuồng ở (3, 3) nhìn sang Đông, vào ô (4, 3).', 'Luna: Nước êm trước mũi là sân 2: u_turn() rồi deliver_tail("L", 2). Còn lại gọi deliver_tail("R", 2).']
    })
  ];

  if (M && M.them) M.manBuocDuoi = MAN;
  if (typeof module !== 'undefined' && module.exports) module.exports = M;
})();
