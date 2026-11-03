/* ============================================================================
   man-buoc-duoi.js — Mùa 5 (Bến sông) · Gói 6: Nâng cấp tay Cuộn / Thả dây lưới
   Chương 1: buoc-duoi (10 màn) — Cuộn / Thả dây lưới (set_length)
   Chương 2: che-buoc-duoi (10 màn) — Chế lệnh: kéo bè qua khúc cua
   ========================================================================== */
(function () {
  'use strict';

  var M = (typeof window !== 'undefined' && window.ManHoc) ||
    (typeof require === 'function' ? require('./man-chuoi-1.js') : null);

  var GOC_DUOI = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'cast_net', 'drop_net', 'flow_dir', 'anchor', 'unanchor', 'set_length'];
  var ROBOT_DUOI = { than: 'xuong', tay: 'day-keo', camBien: [{ ma: 'dong-chay', o: 'tren' }], chinhLuoi: true };
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
      loaiRobot: 'xuong', robot: ROBOT_DUOI, chinhLuoi: true, vo: 'song', mucTieu: 'dua-vat',
      hamGoc: GOC_DUOI, bienDem: true, cauTruc: CAU_TRUC,
      khung: { chinh: 10, moiHam: 10, cauTruc: CAU_TRUC },
      hamCuaEmCan: KHO_TRUOC, taoHam: []
    }, c, { ma: 'buoc-duoi.' + c.so });
  }

  function manCheBuocDuoi(c) {
    return Object.assign({
      chuong: 'che-buoc-duoi', tenChuong: 'Chế lệnh: kéo bè qua khúc cua',
      loaiRobot: 'xuong', robot: ROBOT_DUOI, chinhLuoi: true, vo: 'song', mucTieu: 'dua-vat',
      hamGoc: GOC_DUOI, bienDem: true, cauTruc: CAU_TRUC,
      khung: { chinh: 10, moiHam: 10, cauTruc: CAU_TRUC },
      hamCuaEmCan: KHO_TRUOC, taoHam: []
    }, c, { ma: 'che-buoc-duoi.' + c.so });
  }

  var MAN = [
    /* ========================================================================
       CHƯƠNG 1: buoc-duoi (10 màn) — Cuộn / Thả dây lưới (set_length)
       ======================================================================== */
    manBuocDuoi({
      so: 1, ten: 'Làm quen thu ngắn dây lưới set_length(1)', hang: 'lam-quen',
      chiChay: true,
      deBai: 'Sola giới thiệu nâng cấp tang tời lưới: lệnh set_length(n) (với n từ 0 tới 3) giúp điều chỉnh độ dài dây lưới! Khi đang giữ bè ở tầm 2 ô, gọi set_length(1) kèm wait() sẽ thu ngắn dây lưới về 1 ô sát mạn xuồng. Hãy bấm Chạy xem xuồng ở (3, 1) bắt bè B ở (5, 1), thu dây về 1 ô đưa B vào đúng dòng chảy ở (4, 1), rồi tháo lưới để dòng nước đưa B xuống bến q ở (4, 2)!',
      veMaMau: 'Màn làm quen chỉ chạy: bấm Chạy để quan sát set_length(1) thu ngắn dây lưới.',
      san: [
        '#######',
        '#~~~~B#',
        '####q##',
        '#######'
      ],
      dong: [{ x: 4, y: 1, huong: 2, suc: 1 }],
      batDau: { x: 3, y: 1, huong: 1 },
      maMau: bai(['tow_grab()', 'set_length(1)', 'wait()', 'tow_drop()']),
      loiGiai: bai(['tow_grab()', 'set_length(1)', 'wait()', 'tow_drop()']),
      sao: { o: 7, nhip: 3 },
      loiSai: [],
      goiY: ['Luna: Bấm nút Chạy để xem set_length(1) và wait() thu ngắn dây lưới, kéo bè từ (5, 1) về (4, 1) mà xuồng không cần lùi.']
    }),

    manBuocDuoi({
      so: 2, ten: 'Vươn lưới xa ba ô bằng set_length(3)', hang: 'lam-quen',
      deBai: 'Sola chỉ thêm: khi chưa quăng lưới, gọi set_length(3) sẽ đặt sẵn độ dài lưới là 3 ô cho lần tung lưới kế tiếp! Chiếc bè B đang nằm ở (5, 1), cách xuồng ở (2, 1) tới 3 ô. Hãy gọi set_length(3), gọi tow_grab() để tung lưới bắt B ở cách 3 ô, sau đó gọi set_length(1) và wait() để cuộn dây thu B thẳng về bến q ở (3, 1)!',
      veMaMau: 'Gọi set_length(3), tow_grab(), rồi thu ngắn dây bằng set_length(1) và wait().',
      san: [
        '#######',
        '#~~q~B#',
        '#######'
      ],
      dong: [],
      batDau: { x: 2, y: 1, huong: 1 },
      maMau: bai(['set_length(3)', 'tow_grab()']),
      loiGiai: bai(['set_length(3)', 'tow_grab()', 'set_length(1)', 'wait()']),
      sao: { o: 6, nhip: 2 },
      loiGiaiKhac: {
        moTa: 'Dùng cast_net(), wait() trực tiếp thay cho tow_grab()',
        baiLam: bai(['set_length(3)', 'cast_net()', 'wait()', 'set_length(1)', 'wait()'])
      },
      loiSai: [
        { moTa: 'Quên gọi set_length(3) trước tow_grab() nên lưới chỉ bay 2 ô, hụt bè ở (5, 1)', baiLam: bai(['tow_grab()', 'set_length(1)', 'wait()']), phaiCoMa: ['keo-hut', 'chua-dua-vat'] },
        { moTa: 'Mới bắt bè ở (5, 1) mà chưa gọi set_length(1), wait() để cuộn dây đưa bè về bến (3, 1)', baiLam: bai(['set_length(3)', 'tow_grab()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Khi chưa giữ vật, set_length(3) chỉnh ngay tầm tung lưới thành 3 ô.', 'Luna: Sau khi tow_grab() bắt được B ở (5, 1), gọi set_length(1) và wait() để cuộn dây đưa B về (3, 1).']
    }),

    manBuocDuoi({
      so: 3, ten: 'Thu ngắn lưới kéo bè qua khúc cua hẹp', hang: 'lam-quen',
      deBai: 'Sola giải thích ưu thế của dây lưới ngắn 1 ô khi qua khúc cua hẹp: nếu để dây dài 2 ô, xuồng rẽ vào nhánh ngắn sẽ chạm bờ trước khi bè kịp vào bến! Từ (3, 1) hướng Đông, hãy gọi tow_grab() bắt bè B ở (5, 1), gọi set_length(1) và wait() thu ngắn dây đưa B về (4, 1), rồi gọi pair_step("R", 3) để rẽ xuống nhánh dọc kéo B vào bến q ở (3, 3)!',
      veMaMau: 'Gọi tow_grab(), set_length(1), wait() rồi pair_step("R", 3).',
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
      maMau: bai(['tow_grab()', 'set_length(1)', 'wait()']),
      loiGiai: bai(['tow_grab()', 'set_length(1)', 'wait()', 'pair_step("R", 3)']),
      sao: { o: 19, nhip: 6 },
      loiGiaiKhac: {
        moTa: 'Tách pair_step("R", 3) thành turn_right() và forward(3)',
        baiLam: bai(['tow_grab()', 'set_length(1)', 'wait()', 'turn_right()', 'forward(3)'])
      },
      loiSai: [
        { moTa: 'Quên thu ngắn lưới bằng set_length(1), wait() nên khi xuồng xuống (3, 4) bè B mới tới (3, 2)', baiLam: bai(['tow_grab()', 'pair_step("R", 3)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Mới thu ngắn lưới mà chưa gọi pair_step("R", 3)', baiLam: bai(['tow_grab()', 'set_length(1)', 'wait()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau tow_grab(), set_length(1), wait(), bè B đã thu về sát mạn xuồng tại (4, 1).', 'Luna: Gọi pair_step("R", 3) để xuồng rẽ xuống (3, 4), kéo B theo sát 1 ô sau đuôi vào đúng (3, 3).']
    }),

    manBuocDuoi({
      so: 4, ten: 'Kéo bè vào khoang set_length(0) mở lối qua kênh', hang: 'luyen', mucTieu: 'toi-co',
      deBai: 'Sola chỉ ra bí quyết thông luồng độc đạo: bè B ở (4, 1) đang chắn ngang con kênh hẹp dẫn tới cờ Q ở (6, 1). Nếu để bè dưới nước trước mặt thì xuồng tiến tới sẽ vướng lưới (luoi-vuong)! Hãy gọi tow_grab() bắt B ở (4, 1), dùng set_length(0) và wait() để cuộn hết dây kéo hẳn B lên khoang xuồng, rồi gọi forward(4) lướt thẳng tới cờ Q!',
      veMaMau: 'Gọi tow_grab(), set_length(0), wait() rồi forward(4).',
      san: [
        '########',
        '#~~~B~Q#',
        '########'
      ],
      dong: [],
      batDau: { x: 2, y: 1, huong: 1 },
      maMau: bai(['tow_grab()', 'set_length(0)', 'wait()']),
      loiGiai: bai(['tow_grab()', 'set_length(0)', 'wait()', 'forward(4)']),
      sao: { o: 11, nhip: 6 },
      loiGiaiKhac: {
        moTa: 'Dùng cast_net(), wait() thay cho tow_grab()',
        baiLam: bai(['cast_net()', 'wait()', 'set_length(0)', 'wait()', 'forward(4)'])
      },
      loiSai: [
        { moTa: 'Quên kéo bè vào khoang bằng set_length(0), wait() nên khi tiến tới bị vướng dây lưới', baiLam: bai(['tow_grab()', 'forward(4)']), phaiCoMa: ['luoi-vuong', 'chua-toi-co'] },
        { moTa: 'Chỉ tiến 3 ô sau khi thu bè vào khoang nên xuồng chưa tới cờ Q ở (6, 1)', baiLam: bai(['tow_grab()', 'set_length(0)', 'wait()', 'forward(3)']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Luna: Khi gọi set_length(0) và wait(), vật nổi được kéo gọn lên khoang xuồng nên mặt nước phía trước hoàn toàn trống.', 'Luna: Gọi tiếp forward(4) để xuồng từ (2, 1) tiến thẳng tới cờ Q ở (6, 1).']
    }),

    manBuocDuoi({
      so: 5, ten: 'Đẩy vật từ khoang ra dòng nước rồi tháo lưới', hang: 'luyen',
      deBai: 'Sola hướng dẫn: đám lục bình L ở (3, 1) đang chắn giữa xuồng (1, 1) và nhánh nước chảy ở (5, 1) dẫn xuống bến q (5, 2). Hãy gọi tow_grab() bắt L, gọi set_length(0) và wait() thu L vào khoang để xuồng đi qua được, gọi forward(3) tiến tới (4, 1), sau đó gọi set_length(1) và wait() đẩy L từ khoang ra ô dòng chảy (5, 1) trước mũi, rồi gọi tow_drop() thả cho dòng nước đưa L xuống bến q!',
      veMaMau: 'Sau khi thu L vào khoang và forward(3), hãy gọi set_length(1), wait() rồi tow_drop().',
      san: [
        '#######',
        '#~~L~~#',
        '#####q#',
        '#######'
      ],
      dong: [{ x: 5, y: 1, huong: 2, suc: 1 }],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['tow_grab()', 'set_length(0)', 'wait()', 'forward(3)']),
      loiGiai: bai(['tow_grab()', 'set_length(0)', 'wait()', 'forward(3)', 'set_length(1)', 'wait()', 'tow_drop()']),
      sao: { o: 16, nhip: 7 },
      loiGiaiKhac: {
        moTa: 'Dùng drop_net(), wait() thay cho tow_drop() ở cuối',
        baiLam: bai(['tow_grab()', 'set_length(0)', 'wait()', 'forward(3)', 'set_length(1)', 'wait()', 'drop_net()', 'wait()'])
      },
      loiSai: [
        { moTa: 'Gọi tow_drop() ngay khi L còn đang ở trong khoang (chưa gọi set_length(1), wait() đẩy ra mặt nước)', baiLam: bai(['tow_grab()', 'set_length(0)', 'wait()', 'forward(3)', 'tow_drop()']), phaiCoMa: ['trong-khoang', 'chua-dua-vat'] },
        { moTa: 'Đẩy L ra ô (5, 1) bằng set_length(1), wait() nhưng quên gọi tow_drop() nên L vẫn vướng lưới không trôi xuống bến (5, 2)', baiLam: bai(['tow_grab()', 'set_length(0)', 'wait()', 'forward(3)', 'set_length(1)', 'wait()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Khi L đang ở trong khoang (độ dài 0), phải gọi set_length(1) và wait() để đẩy L ra mặt nước ở (5, 1) trước.', 'Luna: Cuối cùng gọi tow_drop() để tháo lưới cho dòng nước đẩy L xuống bến (5, 2).']
    }),

    manBuocDuoi({
      so: 6, ten: 'Luồn lách khúc cua chữ Z với dây lưới ngắn', hang: 'luyen',
      deBai: 'Sola thử thách tay lái lụa: con kênh gấp khúc chữ Z liên tiếp chỉ rộng đúng 1 ô! Từ (3, 1) hướng Đông, hãy gọi tow_grab(), set_length(1), wait() để bắt bè B ở (5, 1) và thu ngắn dây về (4, 1), rồi lần lượt gọi pair_step("R", 2), pair_step("L", 1) và pair_step("R", 2) để dắt B qua cả 3 góc cua vào bến q ở (4, 4)!',
      veMaMau: 'Gọi tow_grab(), set_length(1), wait(), pair_step("R", 2), pair_step("L", 1), pair_step("R", 2).',
      san: [
        '#######',
        '#~~~~B#',
        '###~###',
        '###~~##',
        '####q##',
        '####~##',
        '#######'
      ],
      dong: [],
      batDau: { x: 3, y: 1, huong: 1 },
      maMau: bai(['tow_grab()', 'set_length(1)', 'wait()', 'pair_step("R", 2)']),
      loiGiai: bai(['tow_grab()', 'set_length(1)', 'wait()', 'pair_step("R", 2)', 'pair_step("L", 1)', 'pair_step("R", 2)']),
      sao: { o: 20, nhip: 10 },
      loiGiaiKhac: {
        moTa: 'Tách pair_step("L", 1) ở giữa thành turn_left() và move()',
        baiLam: bai(['tow_grab()', 'set_length(1)', 'wait()', 'pair_step("R", 2)', 'turn_left()', 'move()', 'pair_step("R", 2)'])
      },
      loiSai: [
        { moTa: 'Ở góc cuối chỉ đi 1 bước pair_step("R", 1) nên xuồng mới tới (4, 4) còn bè B vẫn ở (4, 3)', baiLam: bai(['tow_grab()', 'set_length(1)', 'wait()', 'pair_step("R", 2)', 'pair_step("L", 1)', 'pair_step("R", 1)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên thu ngắn lưới bằng set_length(1), wait() nên bè B đi trễ 1 ô, chưa vào tới bến (4, 4)', baiLam: bai(['tow_grab()', 'pair_step("R", 2)', 'pair_step("L", 1)', 'pair_step("R", 2)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau pair_step("R", 2) đầu tiên, xuồng ở (3, 3) còn bè B theo sát ở (3, 2).', 'Luna: Gọi tiếp pair_step("L", 1) sang (4, 3) và pair_step("R", 2) xuống (4, 5) để kéo B vào (4, 4).']
    }),

    manBuocDuoi({
      so: 7, ten: 'Đọc dòng chảy chọn nhánh rẽ ở ngã ba', hang: 'bien-the', nhipTheo: 'tong',
      deBai: 'Sola đưa bài toán 2 sân: xuồng đang ở ngã tư (4, 3) hướng Đông, bè B ở (6, 3). Hãy gọi tow_grab(), set_length(1), wait() để bắt B và thu về ô (5, 3) trước mũi. Tại (4, 3), hãy đọc chong chóng ở ô (5, 3): nếu flow_dir() == "left" thì bến q nằm ở nhánh Bắc (gọi pair_step("L", 3)); ngược lại bến q nằm ở nhánh Nam (gọi pair_step("R", 3))!',
      veMaMau: 'Bắt bè và thu ngắn lưới về 1 ô, rồi dùng if flow_dir() == "left": pair_step("L", 3) else: pair_step("R", 3).',
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
      maMau: bai(['tow_grab()', 'set_length(1)', 'wait()', 'h = flow_dir()', 'if h == "left":', '    pair_step("L", 3)']),
      loiGiai: bai(['tow_grab()', 'set_length(1)', 'wait()', 'h = flow_dir()', 'if h == "left":', '    pair_step("L", 3)', 'else:', '    pair_step("R", 3)']),
      sao: { o: 24, nhip: 12 },
      loiGiaiKhac: {
        moTa: 'Kiểm tra if flow_dir() == "right": pair_step("R", 3) else: pair_step("L", 3)',
        baiLam: bai(['tow_grab()', 'set_length(1)', 'wait()', 'h = flow_dir()', 'if h == "right":', '    pair_step("R", 3)', 'else:', '    pair_step("L", 3)'])
      },
      loiSai: [
        { moTa: 'Chỉ rẽ trái cho cả 2 sân nên ở sân 2 bè đi nhầm lên nhánh Bắc', baiLam: bai(['tow_grab()', 'set_length(1)', 'wait()', 'pair_step("L", 3)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Thiếu nhánh else cho sân 2', baiLam: bai(['tow_grab()', 'set_length(1)', 'wait()', 'h = flow_dir()', 'if h == "left":', '    pair_step("L", 3)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Khi xuồng ở (4, 3) hướng Đông, dòng chảy hướng Bắc ở (5, 3) cho flow_dir() == "left".', 'Luna: Thêm nhánh else: pair_step("R", 3) để kéo B xuống bến Nam (4, 5) ở sân 2.']
    }),

    manBuocDuoi({
      so: 8, ten: 'Thả neo thu ngắn lưới trước khi trôi xuống hẻm', hang: 'bien-the',
      deBai: 'Sola kết hợp mỏ neo và tang tời lưới: xuồng ở (2, 1) đang đứng trên dòng chảy xuống hẻm hẹp (2, 2), còn bè B ở (5, 1) đang trôi về Tây. Hãy gọi drop_anchor() giữ xuồng 1 nhịp chờ B trôi về (4, 1), gọi tow_grab() bắt B, gọi set_length(1) và wait() thu ngắn dây đưa B về (3, 1) sát xuồng, rồi gọi lift_anchor() để dòng nước đẩy cả cụm vào hẻm và gọi pair_step("R", 2) đưa B tới bến q ở (2, 3)!',
      veMaMau: 'Gọi drop_anchor(), tow_grab(), set_length(1), wait(), lift_anchor() rồi pair_step("R", 2).',
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
      maMau: bai(['drop_anchor()', 'tow_grab()', 'set_length(1)', 'wait()']),
      loiGiai: bai(['drop_anchor()', 'tow_grab()', 'set_length(1)', 'wait()', 'lift_anchor()', 'pair_step("R", 2)']),
      sao: { o: 25, nhip: 7 },
      loiGiaiKhac: {
        moTa: 'Tách pair_step("R", 2) thành turn_right() và forward(2)',
        baiLam: bai(['drop_anchor()', 'tow_grab()', 'set_length(1)', 'wait()', 'lift_anchor()', 'turn_right()', 'forward(2)'])
      },
      loiSai: [
        { moTa: 'Chỉ gọi pair_step("R", 1) nên bè B mới tới (2, 2), chưa vào bến (2, 3)', baiLam: bai(['drop_anchor()', 'tow_grab()', 'set_length(1)', 'wait()', 'lift_anchor()', 'pair_step("R", 1)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên gọi lift_anchor() trước khi rẽ xuống hẻm', baiLam: bai(['drop_anchor()', 'tow_grab()', 'set_length(1)', 'wait()', 'pair_step("R", 2)']), phaiCoMa: ['dang-neo', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Khi B đã thu về (3, 1) với dây dài 1 ô, gọi lift_anchor() sẽ giúp dòng nước ở (2, 1) đẩy xuồng xuống (2, 2) và kéo B theo vào (2, 1).', 'Luna: Sau đó gọi pair_step("R", 2) để xuồng quay xuống Nam và tiến 2 ô tới (2, 4), kéo B vào bến (2, 3).']
    }),

    manBuocDuoi({
      so: 9, ten: 'Đo dòng sau góc cua để chọn số bước kéo', hang: 'bien-the', nhipTheo: 'tong',
      deBai: 'Sola thử thách trên 2 sân: từ góc (4, 1) hướng Đông, hãy gọi tow_grab(), set_length(1), wait() và turn_right() để bắt đám lục bình L ở (6, 1), thu ngắn dây về (5, 1) và quay mặt xuống nhánh Nam. Lúc này ô trước mũi là (4, 2): ở sân 1 ô (4, 2) là nước êm (is_calm_front() là True) nên cần forward(3) để kéo L vào bến q ở (4, 3); ở sân 2 ô (4, 2) có dòng chảy thuận nên chỉ cần forward(2)!',
      veMaMau: 'Sau khi bắt L, thu ngắn dây và turn_right(), dùng if is_calm_front(): forward(3) else: forward(2).',
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
      maMau: bai(['tow_grab()', 'set_length(1)', 'wait()', 'turn_right()']),
      loiGiai: bai(['tow_grab()', 'set_length(1)', 'wait()', 'turn_right()', 'if is_calm_front():', '    forward(3)', 'else:', '    forward(2)']),
      sao: { o: 18, nhip: 11 },
      loiGiaiKhac: {
        moTa: 'Dùng flow_step() và move() cho cả 2 sân sau khi quay phải',
        baiLam: bai(['tow_grab()', 'set_length(1)', 'wait()', 'turn_right()', 'flow_step()', 'move()'])
      },
      loiSai: [
        { moTa: 'Quên thu ngắn lưới bằng set_length(1), wait() nên lục bình L đi trễ 1 ô, chưa tới bến (4, 3)', baiLam: bai(['tow_grab()', 'turn_right()', 'if is_calm_front():', '    forward(3)', 'else:', '    forward(2)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Luôn gọi forward(2) nên ở sân 1 lục bình L mới tới (4, 2), chưa vào bến (4, 3)', baiLam: bai(['tow_grab()', 'set_length(1)', 'wait()', 'turn_right()', 'forward(2)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Khi xuồng ở (4, 1) đã turn_right() quay xuống Nam, is_calm_front() kiểm tra đúng ô (4, 2).', 'Luna: Nếu is_calm_front() đúng thì gọi forward(3), ngược lại gọi forward(2) (hoặc dùng flow_step() kèm move()).']
    }),

    manBuocDuoi({
      so: 10, ten: 'Trùm: Hoa tiêu điều chỉnh lưới qua kênh hẹp', hang: 'trum', nhipTheo: 'tong',
      huyHieu: { ma: 'buoc-duoi', ten: 'Huy hiệu Cuộn / Thả dây lưới' },
      deBai: 'Sola giao bài kiểm tra Trùm chương 1 trên 2 sân: xuồng ở (2, 1) đứng trên dòng chảy xuống hẻm (2, 2), còn bè B ở (5, 1) đang trôi về Tây. Hãy gọi drop_anchor(), tow_grab(), set_length(1), wait(), lift_anchor() để đón B, thu ngắn dây về 1 ô rồi thả cho dòng nước đưa cả cụm vào hẻm (2, 2). Tại (2, 2), hãy gọi turn_right() quay xuống Nam rồi kiểm tra if is_calm_front(): forward(3) else: forward(2) để đưa B vào bến q ở (2, 4)!',
      veMaMau: 'Kết hợp drop_anchor(), tow_grab(), set_length(1), wait(), lift_anchor(), turn_right() và if is_calm_front(): forward(3) else: forward(2).',
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
        'set_length(1)',
        'wait()',
        'lift_anchor()',
        'turn_right()'
      ]),
      loiGiai: bai([
        'drop_anchor()',
        'tow_grab()',
        'set_length(1)',
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
          'set_length(1)',
          'wait()',
          'lift_anchor()',
          'turn_right()',
          'flow_step()',
          'move()'
        ])
      },
      loiSai: [
        { moTa: 'Chỉ gọi forward(1) sau khi quay phải nên bè B chưa tới bến (2, 4)', baiLam: bai(['drop_anchor()', 'tow_grab()', 'set_length(1)', 'wait()', 'lift_anchor()', 'turn_right()', 'forward(1)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên gọi lift_anchor() trước khi quay phải và tiến xuống hẻm', baiLam: bai(['drop_anchor()', 'tow_grab()', 'set_length(1)', 'wait()', 'turn_right()', 'forward(3)']), phaiCoMa: ['dang-neo', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau lift_anchor() và turn_right(), xuồng đang ở (2, 2) hướng Nam và bè B đang ở (2, 1).', 'Luna: Kiểm tra if is_calm_front(): forward(3) else: forward(2) để đưa B tới đúng bến (2, 4) trên cả 2 sân.']
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
      maMau: bai(['h = flow_dir()', 'if h == "left":', '    tug_corner("L", 3)']),
      loiGiai: bai(['h = flow_dir()', 'if h == "left":', '    tug_corner("L", 3)', 'else:', '    tug_corner("R", 3)']),
      sao: { o: 27, nhip: 12 },
      loiGiaiKhac: {
        moTa: 'Kiểm tra if flow_dir() == "right": tug_corner("R", 3) else: tug_corner("L", 3)',
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
      deBai: 'Sola giao bài toán 2 sân: từ (3, 1) hướng Đông, hãy gọi deliver_tail("R", 2) để giao bè B vào bến (3, 2) và đưa xuồng tới ngã tư (3, 3) hướng Nam. Tại (3, 3), ô trước mũi (3, 4) có dòng chảy chỉ hướng của lục bình L: ở sân 1 dòng chảy sang Đông (flow_dir() == "left") báo L nằm bên trái (nhánh Đông); ở sân 2 dòng chảy sang Tây (flow_dir() == "right") báo L nằm bên phải (nhánh Tây). Hãy dùng if/else quay đúng hướng rồi gọi tow_pair(0, 1) kéo L vào bến q thứ hai!',
      veMaMau: 'Gọi deliver_tail("R", 2), rồi if flow_dir() == "left": turn_left() else: turn_right(), và cuối cùng tow_pair(0, 1).',
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
        moTa: 'Kiểm tra if flow_dir() == "right": turn_right() else: turn_left()',
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
