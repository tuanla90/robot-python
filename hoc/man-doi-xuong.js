/* ============================================================================
   man-doi-xuong.js - Mua 5 (Ben song) · Goi 9: Doi xuong va xe
   Chuong 1: doi-xuong (10 man) - Doi xuong bac cau phao
   Chuong 2: che-doi-xuong (10 man) - Che lenh: doi xuong phoi hop
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var XUONG_HAM = [
    'left_move', 'right_move', 'left_back', 'right_back', 'wait',
    'cast_net', 'drop_net', 'flow_dir', 'anchor', 'unanchor',
    'set_length', 'flow'
  ];
  var BANH_HAM = [
    'left_move', 'right_move', 'left_back', 'right_back', 'wait',
    'arm_down', 'arm_up', 'grab', 'release', 'front_clear'
  ];
  var CAU_TRUC = ['for', 'if', 'while', 'list', 'def', 'return', 'tuple'];

  var KHO_TRUOC = [
    'move', 'turn_left', 'turn_right', 'u_turn', 'back', 'forward',
    'pick', 'drop', 'wait_n',
    'span_dist', 'round_steps', 'calm_bonus', 'turn_code', 'sail_to',
    'tow_grab', 'tow_drop', 'pull_back', 'pair_step', 'tow_pair',
    'is_calm_front', 'flow_step', 'scan_calm_side', 'tow_in_calm', 'pick_calm_lane',
    'flip_valve', 'open_gate_pass', 'shut_stream_tow', 'valve_and_back', 'lock_rescue',
    'drop_anchor', 'lift_anchor', 'anchor_wait', 'anchor_tow', 'hold_and_valve',
    'tether_grab', 'tether_drop', 'tow_to_tail', 'tug_corner', 'deliver_tail',
    'flow_power', 'calmer_power', 'faster_power', 'turn_to_calmer', 'best_branch',
    'calm_gate_pass', 'dock_tow_back', 'rescue_old_dock', 'anchor_flip', 'tail_over_calm'
  ];

  function R1_XUONG() {
    return {
      loaiRobot: 'xuong',
      robot: { than: 'xuong', tay: 'day-keo', camBien: [{ ma: 'dong-chay', o: 'tren' }] },
      hamGoc: XUONG_HAM.slice()
    };
  }
  function R2_BANH() {
    return {
      loaiRobot: 'banh',
      robot: { than: 'hai-banh', tay: 'kep', camBien: [{ ma: 'khoang-cach', o: 'truoc' }], son: 'lam' },
      hamGoc: BANH_HAM.slice()
    };
  }

  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function B(c1, c2, them) {
    return Object.assign({ doi: [{ chinh: c1.slice() }, { chinh: c2.slice() }], hamCuaMan: [] }, them || {});
  }

  var T_BRIDGE_LAY = [
    'pull_back(n)',
    'tow_drop()'
  ];
  var T_CROSS_AND_PICK = [
    'forward(n)',
    'pick()'
  ];
  var T_FERRY_DROP = [
    'forward(n)',
    'drop()'
  ];
  var T_SYNC_DOCK_PASS = [
    'wait_n(t)',
    'cross_and_pick(n)'
  ];
  var T_CLEAR_RIVER_BRIDGE = [
    'calm_gate_pass(a)',
    'bridge_lay(b)'
  ];
  var T_FIX_BRIDGE_SYNC_SAI = [
    'cross_and_pick(n)',
    'wait_n(t)'
  ];
  var T_FIX_BRIDGE_SYNC_DUNG = [
    'wait_n(t)',
    'cross_and_pick(n)'
  ];

  function hBridgeLay(than) { return H('bridge_lay', ['n'], than || T_BRIDGE_LAY); }
  function hCrossAndPick(than) { return H('cross_and_pick', ['n'], than || T_CROSS_AND_PICK); }
  function hFerryDrop(than) { return H('ferry_drop', ['n'], than || T_FERRY_DROP); }
  function hSyncDockPass(than) { return H('sync_dock_pass', ['t', 'n'], than || T_SYNC_DOCK_PASS); }
  function hClearRiverBridge(than) { return H('clear_river_bridge', ['a', 'b'], than || T_CLEAR_RIVER_BRIDGE); }
  function hFixBridgeSync(than) { return H('fix_bridge_sync', ['t', 'n'], than || T_FIX_BRIDGE_SYNC_DUNG); }

  function manDoi(m) {
    var bd = m.bd, r1 = R1_XUONG(), r2 = R2_BANH(), khoa = m.khoa;
    delete m.bd; delete m.khoa;
    var bd1 = bd[0], bd2 = bd[1];
    m.chuong = m.chuong || 'doi-xuong';
    m.vo = 'song';
    m.bienDem = true;
    m.cauTruc = CAU_TRUC;
    m.vaHoac = true;
    m.mucTieu = m.mucTieu || 'dua-vat';
    m.moXuong = true;
    m.camHamCuaEm = false;
    m.khung = m.khung || { chinh: 10, moiHam: 10, cauTruc: CAU_TRUC };
    m.doi = [Object.assign({ batDau: bd1 }, r1), Object.assign({ batDau: bd2 }, r2)];
    if (khoa !== undefined) [].concat(khoa).forEach(function (k) { m.doi[k].coDinh = true; });
    m.batDau = bd1;
    m.loaiRobot = r1.loaiRobot;
    m.robot = JSON.parse(JSON.stringify(r1.robot));
    m.hamGoc = r1.hamGoc.slice();
    m.taoHam = m.taoHam || [];
    m.loiSai = m.loiSai || [];
    m.hamCuaEmCan = m.hamCuaEmCan || KHO_TRUOC.slice();
    if (m.loiGiai) m.loiGiai.hamCuaEmMoi = m.loiGiai.hamCuaEmMoi || [];
    return ManHoc.chuanHoa(m);
  }
  function cheDoi(m) { m.chuong = 'che-doi-xuong'; return manDoi(m); }

  var DS = [
    /* ========================================================================
       CHUONG 1: doi-xuong (10 man) - Doi xuong bac cau phao
       ======================================================================== */
    manDoi({
      so: 1, ten: 'Làm mẫu xuồng ghép cầu phao cho xe qua sông', hang: 'lam-quen',
      chiChay: true, chinhCoDinh: true, khoa: [0, 1],
      deBai: 'Sola và Luna hội quân ở bến sông! R1 là xuồng thủy lợi của Sola dưới lòng kênh, còn R2 là xe kẹp hai bánh của Luna trên bờ Bắc (3, 1). Khi R1 kéo bè gỗ B về đặt tại bến nước êm q ở (3, 2) rồi tháo dây, chiếc bè B trở thành CẦU PHAO nối hai bờ để R2 lăn bánh qua sông sang bờ Nam (3, 3) nhặt kiện hàng o ở (3, 4) đặt vào đích D ở (2, 3)! Bấm Chạy để xem.',
      veMaMau: 'Hai chương trình đã khóa. Bấm mũi tên chuyển giữa R1 và R2 để xem rồi bấm Chạy.',
      san: [
        '#######',
        '#=..=.#',
        '#~~qB~#',
        '#.D...#',
        '#..oH.#',
        '#######'
      ],
      bd: [{ x: 2, y: 2, huong: 1 }, { x: 3, y: 1, huong: 2 }],
      maMau: B(
        ['pull_back(1)', 'tow_drop()'],
        ['wait_n(2)', 'forward(2)', 'pick()', 'turn_right()', 'drop()']
      ),
      loiGiai: B(
        ['pull_back(1)', 'tow_drop()'],
        ['wait_n(2)', 'forward(2)', 'pick()', 'turn_right()', 'drop()']
      ),
      sao: { o: 36, nhip: 8 },
      goiY: ['Luna: Bè gỗ B nằm trên mặt nước êm ở (3, 2) vừa đạt đích q của R1, vừa làm cầu phao cho R2 đi qua!', 'Luna: R2 chờ 2 nhịp cho R1 kéo bè vào (3, 2) rồi tiến 2 ô qua sông nhặt hàng đặt vào D.']
    }),

    manDoi({
      so: 2, ten: 'Tiến xuồng kéo bè ghép cầu phao', hang: 'lam-quen',
      deBai: 'Sola gọi: bè gỗ B đang ở tận (5, 2), cách R1 ở (2, 2) tới 3 ô. Hãy lập trình cho R1 gọi move(), pull_back(2) và tow_drop() để kéo B về bến cầu phao q ở (3, 2). Cùng lúc đó, R2 ở (3, 1) gọi wait_n(4) chờ cầu phao ghép xong, rồi gọi forward(2) qua sông xuống (3, 3), pick() nhặt hàng ở (3, 4), turn_left() và drop() vào D ở (4, 3)!',
      veMaMau: 'Viết tiếp cho R1 kéo bè B về (3, 2) và R2 chờ 4 nhịp rồi qua cầu phao nhặt hàng.',
      san: [
        '########',
        '#=..=..#',
        '#~~q~B~#',
        '#...D..#',
        '#=uoH..#',
        '########'
      ],
      bd: [{ x: 2, y: 2, huong: 1 }, { x: 3, y: 1, huong: 2 }],
      maMau: B(
        ['move()', 'pull_back(2)'],
        ['wait_n(4)', 'forward(2)']
      ),
      loiGiai: B(
        ['move()', 'pull_back(2)', 'tow_drop()'],
        ['wait_n(4)', 'forward(2)', 'pick()', 'turn_left()', 'drop()']
      ),
      sao: { o: 37, nhip: 10 },
      loiSai: [
        { moTa: 'R2 không chờ đủ 4 nhịp đã lao xuống (3, 2) khi bè B chưa kéo tới nên rơi xuống nước', baiLam: B(['move()', 'pull_back(2)', 'tow_drop()'], ['wait_n(1)', 'forward(2)', 'pick()', 'turn_left()', 'drop()']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'R2 qua cầu phao nhưng quên gọi pick(), turn_left(), drop() để đặt kiện hàng vào D', baiLam: B(['move()', 'pull_back(2)', 'tow_drop()'], ['wait_n(4)', 'forward(2)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: R1 cần 1 nhịp move() + 3 nhịp pull_back(2) = 4 nhịp để bè B về tới (3, 2), rồi gọi tow_drop().', 'Luna: R2 sau wait_n(4) và forward(2) hãy gọi pick(), turn_left(), drop().']
    }),

    manDoi({
      so: 3, ten: 'Nhặt hàng bờ Bắc rồi vượt cầu phao sang bờ Nam', hang: 'lam-quen',
      deBai: 'Lần này kiện hàng o nằm ngay trên bờ Bắc ở (3, 2) trước mũi R2 tại (3, 1), còn đích D ở bờ Nam (3, 5). Trong lúc R1 ở (2, 3) gọi pull_back(1) và tow_drop() để kéo bè B từ (4, 3) về ô cầu phao q ở (3, 3), R2 gọi pick() nhặt ngay kiện hàng ở (3, 2), chờ thêm 1 nhịp wait() rồi gọi forward(3) vượt cầu phao xuống (3, 4) và drop() hàng vào D ở (3, 5)!',
      veMaMau: 'R1 kéo bè về (3, 3) và tháo lưới; R2 nhặt hàng, chờ 1 nhịp, tiến 3 ô qua cầu rồi thả hàng.',
      san: [
        '#######',
        '#=..=.#',
        '#..o..#',
        '#~~qB~#',
        '#=..H.#',
        '#..D..#',
        '#######'
      ],
      bd: [{ x: 2, y: 3, huong: 1 }, { x: 3, y: 1, huong: 2 }],
      maMau: B(
        ['pull_back(1)'],
        ['pick()', 'wait()']
      ),
      loiGiai: B(
        ['pull_back(1)', 'tow_drop()'],
        ['pick()', 'wait()', 'forward(3)', 'drop()']
      ),
      sao: { o: 31, nhip: 7 },
      loiSai: [
        { moTa: 'R1 chỉ tung lưới mà chưa kéo lùi đưa bè B về đúng (3, 3) nên R2 lao xuống nước', baiLam: B(['tow_grab()'], ['pick()', 'wait()', 'forward(3)', 'drop()']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'R2 chỉ tiến 2 ô forward(2) nên mới đứng trên cầu phao (3, 3), thả hàng xuống bờ Nam (3, 4) chưa tới D', baiLam: B(['pull_back(1)', 'tow_drop()'], ['pick()', 'wait()', 'forward(2)', 'drop()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: R1 gọi pull_back(1) rồi tow_drop() để đặt bè B tại (3, 3).', 'Luna: R2 gọi pick() (mất 1 nhịp), wait() (nhịp 2), rồi forward(3) đi từ (3, 1) qua (3, 2), (3, 3) xuống (3, 4) và drop() vào (3, 5).']
    }),

    manDoi({
      so: 4, ten: 'Gạt van tắt dòng cho cầu phao vững rồi mở cống kéo bè', hang: 'luyen',
      deBai: 'Sola cảnh báo: bè B đã nằm sẵn ở bến q (2, 2), nhưng dưới gầm bè đang có dòng chảy Nam nên mặt bè chòng chành, R2 chưa thể đi qua! Từ (3, 2) hướng Đông có van V ở (3, 1) trên bờ Bắc: R1 hãy gọi open_gate_pass(2) để gạt van V (vừa tắt dòng ở (2, 2) cho B thành cầu phao vững, vừa mở cống K ở (4, 2)) và tiến tới (5, 2), rồi gọi pull_back(2) kéo đám lục bình L ở (7, 2) về bến q thứ hai ở (5, 2). R2 ở (2, 1) chờ 2 nhịp wait_n(2) cho dòng tắt rồi gọi forward(2), pick(), turn_right(), drop()!',
      veMaMau: 'R1 gọi open_gate_pass(2) và pull_back(2); R2 chờ 2 nhịp rồi qua cầu phao (2, 2) nhặt hàng đặt vào D.',
      san: [
        '#########',
        '#=.V====#',
        '#Bq~Kq~L#',
        '#D.=.=H.#',
        '#.o.....#',
        '#########'
      ],
      dong: [{ x: 1, y: 2, huong: 1, suc: 1 }, { x: 2, y: 2, huong: 2, suc: 1 }],
      noi: [{ nut: { x: 3, y: 1 }, cong: [{ x: 4, y: 2 }], dong: [{ x: 1, y: 2 }, { x: 2, y: 2 }] }],
      bd: [{ x: 3, y: 2, huong: 1 }, { x: 2, y: 1, huong: 2 }],
      maMau: B(
        ['open_gate_pass(2)'],
        ['wait_n(2)', 'forward(2)']
      ),
      loiGiai: B(
        ['open_gate_pass(2)', 'pull_back(2)'],
        ['wait_n(2)', 'forward(2)', 'pick()', 'turn_right()', 'drop()']
      ),
      sao: { o: 41, nhip: 9 },
      loiSai: [
        { moTa: 'R2 không chờ wait_n(2) mà bước lên (2, 2) ngay nhịp 1 khi dòng chảy dưới bè chưa tắt nên ngã xuống nước', baiLam: B(['open_gate_pass(2)', 'pull_back(2)'], ['forward(2)', 'pick()', 'turn_right()', 'drop()']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'R1 quên gọi pull_back(2) để kéo đám lục bình L ở (7, 2) về bến (5, 2)', baiLam: B(['open_gate_pass(2)'], ['wait_n(2)', 'forward(2)', 'pick()', 'turn_right()', 'drop()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Ở nhịp 2, R1 tung lưới trúng van V ở (3, 1) làm dòng chảy tại (2, 2) tắt ngay, nên từ nhịp 3 R2 bước qua (2, 2) an toàn.', 'Luna: Sau open_gate_pass(2), R1 đang ở (5, 2); gọi pull_back(2) sẽ kéo L từ (7, 2) về đúng bến (5, 2).']
    }),

    manDoi({
      so: 5, ten: 'Chờ xe qua cầu xong mới rút bè về bến', hang: 'luyen',
      deBai: 'Sola nhắc: chiếc bè B đang bắc ngang khe nước ở (2, 2) cho R2 từ (2, 1) đi qua sang bờ Nam, nhưng bến nhận cuối cùng q của bè B lại nằm ở (4, 2)! Khi R2 đang đứng trên bè thì R1 không thể kéo bè đi. Hãy cho R2 đi ngay từ nhịp 1: forward(2) qua bè xuống (2, 3), pick() hàng ở (2, 4), turn_left() và drop() vào D ở (3, 3). R1 ở (4, 2) hướng Tây gọi wait_n(2) chờ R2 qua khỏi bè rồi mới gọi pull_back(2) kéo B về bến (4, 2)!',
      veMaMau: 'R1 chờ 2 nhịp cho R2 qua cầu rồi kéo lùi bè B về (4, 2); R2 qua cầu ngay từ đầu để nhặt hàng đặt vào D.',
      san: [
        '########',
        '#=.====#',
        '#~B~q~~#',
        '#..D.H.#',
        '#.o=u..#',
        '########'
      ],
      bd: [{ x: 4, y: 2, huong: 3 }, { x: 2, y: 1, huong: 2 }],
      maMau: B(
        ['wait_n(2)'],
        ['forward(2)', 'pick()']
      ),
      loiGiai: B(
        ['wait_n(2)', 'pull_back(2)'],
        ['forward(2)', 'pick()', 'turn_left()', 'drop()']
      ),
      sao: { o: 33, nhip: 7 },
      loiSai: [
        { moTa: 'R1 không chờ wait_n(2) mà kéo bè B ngay khi R2 còn đứng trên bè ở (2, 2) nên bị kẹt nhịp kéo', baiLam: B(['pull_back(2)'], ['forward(2)', 'pick()', 'turn_left()', 'drop()']), phaiCoMa: ['luoi-vuong', 'chua-dua-vat'] },
        { moTa: 'R1 chỉ kéo lùi 1 ô pull_back(1) nên bè B mới ở (3, 2), chưa tới bến (4, 2)', baiLam: B(['wait_n(2)', 'pull_back(1)'], ['forward(2)', 'pick()', 'turn_left()', 'drop()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: R2 bước lên bè (2, 2) ở nhịp 1 và sang bờ Nam (2, 3) ở nhịp 2.', 'Luna: R1 chờ đủ 2 nhịp bằng wait_n(2) rồi gọi pull_back(2) sẽ bắt B ở (2, 2) và kéo lùi 2 ô về (4, 2).']
    }),

    manDoi({
      so: 6, ten: 'Lai dắt cầu phao qua cua theo sức nước', hang: 'luyen', nhipTheo: 'tong',
      deBai: 'Sola và Luna gặp khúc kênh chữ L có sức nước thay đổi qua 2 sân: từ (2, 1) hướng Đông với bè B ở (4, 1), R1 gọi tug_corner("R", 1) để thu B về sát mũi và rẽ xuống (2, 2) hướng Nam. Ô (2, 3) trước mũi có dòng xuôi sức 1 hoặc 2; R1 hãy gọi forward(3 - flow_power()) và tether_drop() để đưa B vào đúng ô cầu phao q ở (2, 4). R2 ở bờ Tây (1, 4) hướng Đông gọi wait_n(6) chờ cầu phao, rồi gọi forward(2) qua sông sang (3, 4), pick() hàng ở (4, 4), turn_left() và drop() vào D ở (3, 3)!',
      veMaMau: 'R1 gọi tug_corner("R", 1), forward(3 - flow_power()), tether_drop(); R2 chờ 6 nhịp rồi qua cầu phao.',
      san: [
        ['######', '#~~~B#', '#=~==#', '#u~D.#', '#.q.o#', '#~~~H#', '######'],
        ['######', '#~~~B#', '#=~==#', '#u~D.#', '#.q.o#', '#~~~H#', '######']
      ],
      dong: [
        [{ x: 2, y: 3, huong: 2, suc: 1 }],
        [{ x: 2, y: 3, huong: 2, suc: 2 }]
      ],
      bd: [{ x: 2, y: 1, huong: 1 }, { x: 1, y: 4, huong: 1 }],
      maMau: B(
        ['tug_corner("R", 1)', 'p = flow_power()', 't = 3 - p', 'forward(t)'],
        ['wait_n(6)', 'forward(2)']
      ),
      loiGiai: B(
        ['tug_corner("R", 1)', 'p = flow_power()', 't = 3 - p', 'forward(t)', 'tether_drop()'],
        ['wait_n(6)', 'forward(2)', 'pick()', 'turn_left()', 'drop()']
      ),
      sao: { o: 47, nhip: 24 },
      loiSai: [
        { moTa: 'R1 đếm cứng forward(1) thay vì forward(3 - flow_power()) nên ở sân 1 bè B chưa tới ô cầu phao (2, 4)', baiLam: B(['tug_corner("R", 1)', 'forward(1)', 'tether_drop()'], ['wait_n(6)', 'forward(2)', 'pick()', 'turn_left()', 'drop()']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'R2 chỉ chờ 3 nhịp wait_n(3) đã bước ra (2, 4) khi R1 chưa kéo bè tới nơi', baiLam: B(['tug_corner("R", 1)', 'p = flow_power()', 't = 3 - p', 'forward(t)', 'tether_drop()'], ['wait_n(3)', 'forward(2)', 'pick()', 'turn_left()', 'drop()']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau tug_corner("R", 1), R1 ở (2, 2) và B ở (2, 1); tiến 3 - flow_power() bước đưa R1 xuống (2, 5) và B vào đúng (2, 4).', 'Luna: R2 chờ 6 nhịp rồi gọi forward(2), pick(), turn_left(), drop().']
    }),

    manDoi({
      so: 7, ten: 'Neo xuồng canh bè trôi thành cầu phao', hang: 'bien-the',
      deBai: 'Sola chỉ ra chiếc bè B ở (1, 3) đang trôi về Đông qua (2, 3) hướng tới ô cầu phao q ở (3, 3). Từ (1, 1) hướng Bắc nhìn vào van V ở (1, 0), R1 đang đứng trên dòng chảy nên hãy gọi anchor_flip(1) để neo xuồng chờ 1 nhịp cho B trôi tới (3, 3) rồi gạt van V tắt dòng (biến B ở (3, 3) thành cầu phao vững) kiêm mở cống K ở (2, 1), sau đó gọi pull_back(1) để kéo đám lục bình L từ (5, 1) về bến q (4, 1)! R2 ở (3, 2) hướng Nam gọi wait_n(4) chờ dòng tắt, rồi gọi forward(2) qua cầu phao (3, 3) xuống (3, 4), turn_left() nhặt o ở (4, 4), u_turn() và drop() vào D ở (2, 4)!',
      veMaMau: 'R1 gọi anchor_flip(1) rồi pull_back(1); R2 chờ 4 nhịp rồi qua cầu phao ở kênh dưới.',
      san: [
        '#V======',
        '#~K~qL~#',
        '#=u..H=#',
        '#B~q~~~#',
        '#.D.o..#',
        '########'
      ],
      dong: [
        { x: 1, y: 1, huong: 3, suc: 1 },
        { x: 1, y: 3, huong: 1, suc: 1 },
        { x: 2, y: 3, huong: 1, suc: 1 },
        { x: 3, y: 3, huong: 1, suc: 1 }
      ],
      noi: [{ nut: { x: 1, y: 0 }, cong: [{ x: 2, y: 1 }], dong: [{ x: 1, y: 1 }, { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 }] }],
      bd: [{ x: 1, y: 1, huong: 0 }, { x: 3, y: 2, huong: 2 }],
      maMau: B(
        ['anchor_flip(1)'],
        ['wait_n(4)', 'forward(2)']
      ),
      loiGiai: B(
        ['anchor_flip(1)', 'pull_back(1)'],
        ['wait_n(4)', 'forward(2)', 'turn_left()', 'pick()', 'u_turn()', 'drop()']
      ),
      sao: { o: 57, nhip: 11 },
      loiSai: [
        { moTa: 'R1 gọi anchor_flip(0) không chờ 1 nhịp nên tắt dòng khi bè B mới ở (2, 3), chưa tới ô cầu phao (3, 3)', baiLam: B(['anchor_flip(0)', 'pull_back(1)'], ['wait_n(4)', 'forward(2)', 'turn_left()', 'pick()', 'u_turn()', 'drop()']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'R2 không chờ wait_n(4) đã bước xuống (3, 3) khi dòng chảy chưa tắt', baiLam: B(['anchor_flip(1)', 'pull_back(1)'], ['forward(2)', 'turn_left()', 'pick()', 'u_turn()', 'drop()']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Bè B ở (1, 3) trôi sang (2, 3) ở nhịp 1 (drop_anchor) và tới (3, 3) ở nhịp 2 (wait), đúng lúc R1 gạt van tắt dòng ở nhịp 3!', 'Luna: Từ nhịp 5, R2 ở (3, 2) tiến 2 ô qua cầu phao (3, 3) xuống (3, 4), quay trái nhặt o ở (4, 4), quay đầu u_turn() và thả vào D ở (2, 4).']
    }),

    manDoi({
      so: 8, ten: 'Đo dòng mở cống cứu hộ cầu phao 2 sân', hang: 'bien-the', nhipTheo: 'tong',
      deBai: 'Sola và Luna phối hợp trên 2 sân: từ (2, 2) hướng Đông trước cống K/k ở (4, 2) và bè B ở (6, 2), R1 gọi rescue_old_dock(2, 3) và tow_drop() để tự kiểm tra dòng chảy mở cống khi cần, tiến 2 ô qua cống rồi kéo B lùi 3 ô về bến cầu phao q ở (3, 2) và tháo lưới! R2 ở (3, 1) hướng Nam gọi wait_n(9) chờ cầu phao trên cả hai sân, rồi gọi forward(2), pick(), turn_right(), drop()!',
      veMaMau: 'R1 gọi rescue_old_dock(2, 3) và tow_drop(); R2 chờ 9 nhịp rồi qua cầu phao nhặt hàng đặt vào D.',
      san: [
        ['########', '#=V.=..#', '#~~qK~B#', '#.D....#', '#=uoH..#', '########'],
        ['########', '#=V.=..#', '#~~qk~B#', '#.D....#', '#=uoH..#', '########']
      ],
      dong: [
        [{ x: 3, y: 2, huong: 3, suc: 2 }],
        []
      ],
      noi: [
        [{ nut: { x: 2, y: 1 }, cong: [{ x: 4, y: 2 }], dong: [{ x: 3, y: 2 }] }],
        [{ nut: { x: 2, y: 1 }, cong: [{ x: 4, y: 2 }], dong: [] }]
      ],
      bd: [{ x: 2, y: 2, huong: 1 }, { x: 3, y: 1, huong: 2 }],
      maMau: B(
        ['rescue_old_dock(2, 3)'],
        ['wait_n(9)', 'forward(2)']
      ),
      loiGiai: B(
        ['rescue_old_dock(2, 3)', 'tow_drop()'],
        ['wait_n(9)', 'forward(2)', 'pick()', 'turn_right()', 'drop()']
      ),
      sao: { o: 48, nhip: 30 },
      loiSai: [
        { moTa: 'R1 dùng open_gate_pass(2) thay vì rescue_old_dock(2, 3) nên ở sân 2 làm đóng cống k', baiLam: B(['open_gate_pass(2)', 'pull_back(3)', 'tow_drop()'], ['wait_n(9)', 'forward(2)', 'pick()', 'turn_right()', 'drop()']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'R2 chỉ chờ 4 nhịp wait_n(4) nên ở sân 1 khi R1 còn đang gạt van và kéo bè thì R2 đã lao xuống nước', baiLam: B(['rescue_old_dock(2, 3)', 'tow_drop()'], ['wait_n(4)', 'forward(2)', 'pick()', 'turn_right()', 'drop()']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Hàm rescue_old_dock(2, 3) giúp R1 mở cống ở sân 1 (mất 9 nhịp để đưa B về (3, 2)) và đi thẳng ở sân 2.', 'Luna: R2 chờ 9 nhịp bằng wait_n(9) là an toàn trên cả hai sân trước khi gọi forward(2), pick(), turn_right(), drop().']
    }),

    manDoi({
      so: 9, ten: 'Một chiếc bè bắc nhịp hai lần qua đảo giữa sông', hang: 'bien-the',
      deBai: 'Sola nghĩ ra kế sách độc đáo: chỉ có 1 chiếc bè B nhưng R2 cần qua sông 2 lần! Lúc đầu B đang ở (2, 2) nối bờ Bắc (2, 1) với đảo (2, 3). R2 ở (2, 1) đi ngay: forward(2) sang đảo (2, 3), pick() nhặt hàng ở (2, 4), pair_step("L", 2) sang (4, 3), rồi turn_left() hướng Bắc chờ ở (4, 3). Trong lúc đó R1 ở (4, 2) hướng Tây gọi wait_n(2) chờ R2 qua khỏi (2, 2), rồi gọi tow_to_tail(), back() và tether_drop() để dắt B từ (2, 2) sang bến q ở (4, 2) làm cầu phao lần hai cho R2 tiến lên (4, 1) thả hàng vào D ở (5, 1)!',
      veMaMau: 'R1 chờ 2 nhịp rồi dùng tow_to_tail(), back(), tether_drop() đưa B sang (4, 2); R2 qua cầu ở cột 2, nhặt hàng, sang cột 4 rồi qua cầu lần hai.',
      san: [
        '########',
        '#=.=.D.#',
        '#~B~q~~#',
        '#=....=#',
        '#uo==H.#',
        '########'
      ],
      bd: [{ x: 4, y: 2, huong: 3 }, { x: 2, y: 1, huong: 2 }],
      maMau: B(
        ['wait_n(2)', 'tow_to_tail()', 'back()'],
        ['forward(2)', 'pick()', 'pair_step("L", 2)']
      ),
      loiGiai: B(
        ['wait_n(2)', 'tow_to_tail()', 'back()', 'tether_drop()'],
        ['forward(2)', 'pick()', 'pair_step("L", 2)', 'turn_left()', 'forward(2)', 'turn_right()', 'drop()']
      ),
      sao: { o: 42, nhip: 12 },
      loiSai: [
        { moTa: 'R2 quên gọi turn_left() sau pair_step("L", 2) ở (4, 3) nên đi tiếp sang Đông đâm vào hàng rào', baiLam: B(['wait_n(2)', 'tow_to_tail()', 'back()', 'tether_drop()'], ['forward(2)', 'pick()', 'pair_step("L", 2)', 'forward(2)', 'turn_right()', 'drop()']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'R1 quên gọi back() sau tow_to_tail() nên bè B mới ở (3, 2), chưa tới nhịp cầu thứ hai ở (4, 2)', baiLam: B(['wait_n(2)', 'tow_to_tail()', 'tether_drop()'], ['forward(2)', 'pick()', 'pair_step("L", 2)', 'turn_left()', 'forward(2)', 'turn_right()', 'drop()']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: R1 gọi wait_n(2), tow_to_tail(), back(), tether_drop() thì bè B tới (4, 2) ở nhịp 5, kịp trước khi R2 bước lên (4, 2) ở nhịp 8!', 'Luna: R2 ở (4, 3) sau pair_step("L", 2) hãy gọi turn_left(), forward(2) qua cầu lên (4, 1), rồi turn_right() và drop() vào D ở (5, 1).']
    }),

    manDoi({
      so: 10, ten: 'Trùm: Đội xuồng và xe giải cứu bến sông cổ', hang: 'trum', nhipTheo: 'tong',
      huyHieu: { ma: 'doi-xuong', ten: 'Huy hiệu Đội xuồng bắc cầu phao' },
      deBai: 'Bài kiểm tra Trùm chương 1 trên 2 sân: R1 ở (3, 2) hướng Đông cần gọi rescue_old_dock(2, 1) và tow_drop() để tự mở cống K/k ở (4, 2) khi có dòng chảy và kéo bè B từ (7, 2) lùi về bến q bên phải (6, 2), sau đó gọi u_turn(), move(), pull_back(1) và tow_drop() để kéo tiếp lục bình L ở (1, 2) về bến cầu phao q ở (2, 2)! R2 ở (2, 1) hướng Nam gọi wait_n(12) chờ cầu phao L ghép xong ở (2, 2), rồi gọi forward(2), pick(), turn_right(), drop()!',
      veMaMau: 'R1 cứu hộ B về (6, 2) rồi quay lại kéo L về làm cầu phao ở (2, 2); R2 chờ 12 nhịp rồi qua cầu nhặt hàng đặt vào D.',
      san: [
        ['#########', '#=.V=...#', '#Lq~K~qB#', '#D......#', '#=ouH...#', '#########'],
        ['#########', '#=.V=...#', '#Lq~k~qB#', '#D......#', '#=ouH...#', '#########']
      ],
      dong: [
        [{ x: 4, y: 2, huong: 3, suc: 2 }],
        []
      ],
      noi: [
        [{ nut: { x: 3, y: 1 }, cong: [{ x: 4, y: 2 }], dong: [{ x: 4, y: 2 }] }],
        [{ nut: { x: 3, y: 1 }, cong: [{ x: 4, y: 2 }], dong: [] }]
      ],
      bd: [{ x: 3, y: 2, huong: 1 }, { x: 2, y: 1, huong: 2 }],
      maMau: B(
        ['rescue_old_dock(2, 1)', 'tow_drop()', 'u_turn()'],
        ['wait_n(12)', 'forward(2)']
      ),
      loiGiai: B(
        [
          'rescue_old_dock(2, 1)',
          'tow_drop()',
          'u_turn()',
          'move()',
          'pull_back(1)',
          'tow_drop()'
        ],
        [
          'wait_n(12)',
          'forward(2)',
          'pick()',
          'turn_right()',
          'drop()'
        ]
      ),
      sao: { o: 56, nhip: 36 },
      loiSai: [
        { moTa: 'R1 quên kéo lục bình L về (2, 2) nên ô (2, 2) không có cầu phao cho R2 đi qua', baiLam: B(['rescue_old_dock(2, 1)', 'tow_drop()', 'u_turn()'], ['wait_n(12)', 'forward(2)', 'pick()', 'turn_right()', 'drop()']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'R2 chỉ chờ 6 nhịp wait_n(6) khi R1 vừa đưa B về (6, 2) mà chưa kéo L về (2, 2)', baiLam: B(['rescue_old_dock(2, 1)', 'tow_drop()', 'u_turn()', 'move()', 'pull_back(1)', 'tow_drop()'], ['wait_n(6)', 'forward(2)', 'pick()', 'turn_right()', 'drop()']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau khi R1 đưa B về (6, 2) và gọi tow_drop(), R1 đang ở (4, 2); gọi u_turn(), move() sang (3, 2), rồi pull_back(1) và tow_drop() để đặt L vào (2, 2).', 'Luna: R2 sau wait_n(12) và forward(2) chỉ cần gọi pick(), turn_right(), drop()!']
    }),

    /* ========================================================================
       CHUONG 2: che-doi-xuong (10 man) - Che lenh: doi xuong phoi hop
       ======================================================================== */
    cheDoi({
      so: 1, ten: 'Chế hàm kéo bè ghép cầu bridge_lay(n)', hang: 'lam-quen',
      taoHam: ['bridge_lay'],
      deBai: 'Sola hướng dẫn: mỗi lần R1 kéo bè lùi n ô về vị trí cầu phao q rồi tháo dây để nhường cầu cho R2, ta đều viết 2 dòng pull_back(n) và tow_drop(). Hãy đóng gói thành hàm bridge_lay(n), rồi cho R1 gọi bridge_lay(2) kéo bè B từ (5, 2) về (3, 2)! R2 ở (3, 1) đã được lập trình chờ 3 nhịp rồi qua cầu nhặt hàng đặt vào D.',
      veMaMau: 'Tạo hàm bridge_lay(n) gồm pull_back(n) và tow_drop(), rồi gọi bridge_lay(2) cho R1.',
      san: [
        '########',
        '#=..=..#',
        '#~~q~B~#',
        '#.D.H..#',
        '#=uo...#',
        '########'
      ],
      bd: [{ x: 3, y: 2, huong: 1 }, { x: 3, y: 1, huong: 2 }],
      maMau: B(
        ['bridge_lay(2)'],
        ['wait_n(3)', 'forward(2)', 'pick()', 'turn_right()', 'drop()']
      ),
      loiGiai: B(
        ['bridge_lay(2)'],
        ['wait_n(3)', 'forward(2)', 'pick()', 'turn_right()', 'drop()'],
        { hamCuaEmMoi: [hBridgeLay()] }
      ),
      sao: { o: 37, nhip: 9 },
      loiSai: [
        { moTa: 'Chưa tạo hàm bridge_lay(n)', baiLam: B(['bridge_lay(2)'], ['wait_n(3)', 'forward(2)', 'pick()', 'turn_right()', 'drop()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên gọi pull_back(n) trong bridge_lay(n) nên bè B vẫn đứng ở (5, 2)', baiLam: B(['bridge_lay(2)'], ['wait_n(3)', 'forward(2)', 'pick()', 'turn_right()', 'drop()']), hamCuaEmMoi: [hBridgeLay(['tow_drop()'])], phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Trong hàm bridge_lay(n), dòng 1 là pull_back(n) và dòng 2 là tow_drop().', 'Luna: Chương trình của R1 và R2 đã gọi sẵn đúng hàm.']
    }),

    cheDoi({
      so: 2, ten: 'Chế hàm vượt cầu nhặt hàng cross_and_pick(n)', hang: 'lam-quen', nhipTheo: 'tong',
      hamCuaEmCan: KHO_TRUOC.concat(['bridge_lay']),
      taoHam: ['cross_and_pick'],
      deBai: 'Luna hướng dẫn: khi cầu phao đã sẵn sàng, R2 thường tiến thẳng n ô qua cầu sang bờ bên kia rồi gọi pick() nhặt kiện hàng trước mũi. Hãy chế hàm cross_and_pick(n) gồm 2 dòng: forward(n) và pick(). Áp dụng trên 2 sân: R1 gọi move() rồi bridge_lay(2), còn R2 gọi wait_n(4), cross_and_pick(2), turn_left() và drop()!',
      veMaMau: 'Trong hàm cross_and_pick(n), viết forward(n) và pick().',
      san: [
        ['########', '#=..=..#', '#~~q~B~#', '#...D..#', '#=uoH..#', '########'],
        ['########', '#=..=..#', '#~~q~L~#', '#...D..#', '#=uoH..#', '########']
      ],
      bd: [{ x: 2, y: 2, huong: 1 }, { x: 3, y: 1, huong: 2 }],
      maMau: B(
        ['move()', 'bridge_lay(2)'],
        ['wait_n(4)', 'cross_and_pick(2)', 'turn_left()', 'drop()']
      ),
      loiGiai: B(
        ['move()', 'bridge_lay(2)'],
        ['wait_n(4)', 'cross_and_pick(2)', 'turn_left()', 'drop()'],
        { hamCuaEmMoi: [hCrossAndPick()] }
      ),
      sao: { o: 39, nhip: 20 },
      loiSai: [
        { moTa: 'Chưa tạo hàm cross_and_pick(n)', baiLam: B(['move()', 'bridge_lay(2)'], ['wait_n(4)', 'cross_and_pick(2)', 'turn_left()', 'drop()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên gọi pick() trong cross_and_pick(n) nên R2 sang bờ Nam mà không nhặt kiện hàng o', baiLam: B(['move()', 'bridge_lay(2)'], ['wait_n(4)', 'cross_and_pick(2)', 'turn_left()', 'drop()']), hamCuaEmMoi: [hCrossAndPick(['forward(n)'])], phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Trong hàm cross_and_pick(n), dòng 1 là forward(n) và dòng 2 là pick().', 'Luna: Cả R1 và R2 đều đã có sẵn lời gọi hàm trong khung chính.']
    }),

    cheDoi({
      so: 3, ten: 'Ghép cầu phao đôi vượt kênh rộng', hang: 'lam-quen',
      hamCuaEmCan: KHO_TRUOC.concat(['bridge_lay', 'cross_and_pick']),
      deBai: 'Sola và Luna gặp lòng kênh rộng 2 ô nước ở cột 3: hàng 2 có bè B ở (4, 2) cần về q (3, 2), hàng 3 có lục bình L ở (4, 3) cần về q (3, 3) để ghép thành cây cầu phao dài 2 nhịp! R1 ở (2, 2) hướng Đông hãy gọi bridge_lay(1), rồi gọi pair_step("R", 1), turn_left(), move() và bridge_lay(1) ở hàng 3. R2 ở (3, 1) hướng Nam gọi wait_n(8) chờ cả 2 nhịp cầu ghép xong, rồi gọi cross_and_pick(3) sang (3, 4), turn_right() và drop() vào D ở (2, 4)!',
      veMaMau: 'R1 ghép 2 nhịp cầu ở (3, 2) và (3, 3); R2 chờ 8 nhịp rồi gọi cross_and_pick(3), turn_right(), drop().',
      san: [
        '#######',
        '#=..=.#',
        '#~~qB~#',
        '#~~qL~#',
        '#.D.H.#',
        '#=uo..#',
        '#######'
      ],
      bd: [{ x: 2, y: 2, huong: 1 }, { x: 3, y: 1, huong: 2 }],
      maMau: B(
        ['bridge_lay(1)', 'pair_step("R", 1)', 'turn_left()', 'move()'],
        ['wait_n(8)', 'cross_and_pick(3)']
      ),
      loiGiai: B(
        ['bridge_lay(1)', 'pair_step("R", 1)', 'turn_left()', 'move()', 'bridge_lay(1)'],
        ['wait_n(8)', 'cross_and_pick(3)', 'turn_right()', 'drop()']
      ),
      sao: { o: 50, nhip: 15 },
      loiSai: [
        { moTa: 'R1 mới ghép nhịp cầu đầu ở (3, 2), quên gọi bridge_lay(1) ở hàng 3 nên R2 rơi xuống nước ở (3, 3)', baiLam: B(['bridge_lay(1)', 'pair_step("R", 1)', 'turn_left()', 'move()'], ['wait_n(8)', 'cross_and_pick(3)', 'turn_right()', 'drop()']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'R2 chỉ tiến 2 ô cross_and_pick(2) nên còn đứng trên nhịp cầu (3, 3), chưa sang tới bờ Nam (3, 4)', baiLam: B(['bridge_lay(1)', 'pair_step("R", 1)', 'turn_left()', 'move()', 'bridge_lay(1)'], ['wait_n(8)', 'cross_and_pick(2)', 'turn_right()', 'drop()']), phaiCoMa: ['kep-hut', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau khi R1 gọi bridge_lay(1) ở hàng 2 (lùi về đứng tại (1, 2)), gọi pair_step("R", 1) xuống (1, 3), turn_left() hướng Đông, move() sang (2, 3) rồi gọi bridge_lay(1) để kéo L về (3, 3)!', 'Luna: R2 sau wait_n(8) gọi cross_and_pick(3), turn_right(), drop().']
    }),

    cheDoi({
      so: 4, ten: 'Chế hàm chở hàng qua cầu thả đích ferry_drop(n)', hang: 'co-ban',
      hamCuaEmCan: KHO_TRUOC.concat(['bridge_lay', 'cross_and_pick']),
      taoHam: ['ferry_drop'],
      deBai: 'Luna hướng dẫn: sau khi R2 đã nhặt kiện hàng, thao tác tiến n ô (qua cầu phao hoặc dọc bến) rồi gọi drop() thả hàng vào đích D lặp lại rất nhiều lần. Hãy chế hàm ferry_drop(n) gồm 2 dòng: forward(n) và drop()! Trong màn này, R1 ở (2, 3) gọi bridge_lay(1) đặt B vào (3, 3), còn R2 ở (3, 1) gọi pick() nhặt hàng ở (3, 2), chờ 1 nhịp wait() rồi gọi ferry_drop(3) đưa thẳng hàng qua cầu vào D ở (3, 5)!',
      veMaMau: 'Trong hàm ferry_drop(n), viết forward(n) và drop().',
      san: [
        '#######',
        '#=..=.#',
        '#..o..#',
        '#~~qB~#',
        '#=..H.#',
        '#..D..#',
        '#######'
      ],
      bd: [{ x: 2, y: 3, huong: 1 }, { x: 3, y: 1, huong: 2 }],
      maMau: B(
        ['bridge_lay(1)'],
        ['pick()', 'wait()', 'ferry_drop(3)']
      ),
      loiGiai: B(
        ['bridge_lay(1)'],
        ['pick()', 'wait()', 'ferry_drop(3)'],
        { hamCuaEmMoi: [hFerryDrop()] }
      ),
      sao: { o: 33, nhip: 7 },
      loiSai: [
        { moTa: 'Chưa tạo hàm ferry_drop(n)', baiLam: B(['bridge_lay(1)'], ['pick()', 'wait()', 'ferry_drop(3)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên gọi drop() trong ferry_drop(n) nên R2 chỉ mang hàng tới trước D mà chưa thả xuống', baiLam: B(['bridge_lay(1)'], ['pick()', 'wait()', 'ferry_drop(3)']), hamCuaEmMoi: [hFerryDrop(['forward(n)'])], phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Hàm ferry_drop(n) chỉ gồm 2 dòng: forward(n) và drop().', 'Luna: R1 ở (2, 3) gọi bridge_lay(1) sẽ bắt B ở (4, 3) rồi lùi 1 ô về (1, 3), đặt B đúng vào (3, 3).']
    }),

    cheDoi({
      so: 5, ten: 'Chế hàm chờ cầu rồi vượt sông sync_dock_pass(t, n)', hang: 'co-ban', nhipTheo: 'tong',
      hamCuaEmCan: KHO_TRUOC.concat(['bridge_lay', 'cross_and_pick', 'ferry_drop']),
      taoHam: ['sync_dock_pass'],
      deBai: 'Luna hướng dẫn: để R2 tự động chờ t nhịp cho R1 bắc cầu xong rồi vượt n ô qua sông nhặt hàng, hãy ghép wait_n(t) và cross_and_pick(n) thành hàm sync_dock_pass(t, n)! Trên 2 sân, R1 ở (2, 2) tiến 1 ô rồi gọi bridge_lay(2), còn R2 ở (3, 1) gọi sync_dock_pass(4, 2), u_turn() và ferry_drop(2) để mang kiện hàng ngược qua cầu về đích D ở bờ Bắc (3, 0)!',
      veMaMau: 'Trong hàm sync_dock_pass(t, n), viết wait_n(t) và cross_and_pick(n).',
      san: [
        ['###D####', '#=..=..#', '#~~q~B~#', '#=..H..#', '#..ou..#', '########'],
        ['###D####', '#=..=..#', '#~~q~L~#', '#=..H..#', '#..ou..#', '########']
      ],
      bd: [{ x: 2, y: 2, huong: 1 }, { x: 3, y: 1, huong: 2 }],
      maMau: B(
        ['move()', 'bridge_lay(2)'],
        ['sync_dock_pass(4, 2)', 'u_turn()', 'ferry_drop(2)']
      ),
      loiGiai: B(
        ['move()', 'bridge_lay(2)'],
        ['sync_dock_pass(4, 2)', 'u_turn()', 'ferry_drop(2)'],
        { hamCuaEmMoi: [hSyncDockPass()] }
      ),
      sao: { o: 43, nhip: 24 },
      loiSai: [
        { moTa: 'Chưa tạo hàm sync_dock_pass(t, n)', baiLam: B(['move()', 'bridge_lay(2)'], ['sync_dock_pass(4, 2)', 'u_turn()', 'ferry_drop(2)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên gọi wait_n(t) trong sync_dock_pass(t, n) nên R2 lao xuống sông trước khi cầu phao ghép xong', baiLam: B(['move()', 'bridge_lay(2)'], ['sync_dock_pass(4, 2)', 'u_turn()', 'ferry_drop(2)']), hamCuaEmMoi: [hSyncDockPass(['cross_and_pick(n)'])], phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Hàm sync_dock_pass(t, n) gồm 2 dòng: wait_n(t) và cross_and_pick(n).', 'Luna: Sau khi nhặt hàng ở bờ Nam (3, 3), R2 quay đầu u_turn() rồi gọi ferry_drop(2) trở lại (3, 1) và thả hàng vào D ở (3, 0)!']
    }),

    cheDoi({
      so: 6, ten: 'Chế hàm mở cống bắc cầu clear_river_bridge(a, b)', hang: 'luyen',
      hamCuaEmCan: KHO_TRUOC.concat(['bridge_lay', 'cross_and_pick', 'ferry_drop', 'sync_dock_pass']),
      taoHam: ['clear_river_bridge'],
      deBai: 'Sola hướng dẫn chế hàm thứ 5 của gói: khi bè B nằm sau trạm cống K/k, R1 cần gọi calm_gate_pass(a) để tự kiểm tra dòng chảy mở cống và tiến a ô, rồi gọi bridge_lay(b) để kéo bè lùi b ô về bến cầu phao q và tháo lưới. Hãy đóng gói thành hàm clear_river_bridge(a, b)! Gọi clear_river_bridge(2, 3) cho R1 và sync_dock_pass(9, 2), turn_right(), drop() cho R2!',
      veMaMau: 'Trong hàm clear_river_bridge(a, b), viết calm_gate_pass(a) và bridge_lay(b).',
      san: [
        '########',
        '#=V.=..#',
        '#~~qK~B#',
        '#.D....#',
        '#=uoH..#',
        '########'
      ],
      dong: [{ x: 3, y: 2, huong: 3, suc: 2 }],
      noi: [{ nut: { x: 2, y: 1 }, cong: [{ x: 4, y: 2 }], dong: [{ x: 3, y: 2 }] }],
      bd: [{ x: 2, y: 2, huong: 1 }, { x: 3, y: 1, huong: 2 }],
      maMau: B(
        ['clear_river_bridge(2, 3)'],
        ['sync_dock_pass(9, 2)', 'turn_right()', 'drop()']
      ),
      loiGiai: B(
        ['clear_river_bridge(2, 3)'],
        ['sync_dock_pass(9, 2)', 'turn_right()', 'drop()'],
        { hamCuaEmMoi: [hClearRiverBridge()] }
      ),
      sao: { o: 51, nhip: 15 },
      loiSai: [
        { moTa: 'Chưa tạo hàm clear_river_bridge(a, b)', baiLam: B(['clear_river_bridge(2, 3)'], ['sync_dock_pass(9, 2)', 'turn_right()', 'drop()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên gọi bridge_lay(b) trong clear_river_bridge(a, b) nên R1 chỉ tiến qua cống mà chưa kéo bè về làm cầu', baiLam: B(['clear_river_bridge(2, 3)'], ['sync_dock_pass(9, 2)', 'turn_right()', 'drop()']), hamCuaEmMoi: [hClearRiverBridge(['calm_gate_pass(a)'])], phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Trong hàm clear_river_bridge(a, b), dòng 1 là calm_gate_pass(a) và dòng 2 là bridge_lay(b).', 'Luna: Cả hai chương trình của R1 và R2 đều đã gọi sẵn đúng hàm.']
    }),

    cheDoi({
      so: 7, ten: 'Sửa hàm fix_bridge_sync() viết ngược thứ tự chờ cầu', hang: 'sua-ham', nhipTheo: 'tong',
      chinhCoDinh: true, khoa: [0, 1],
      hamCuaEmCan: KHO_TRUOC.concat(['bridge_lay', 'cross_and_pick', 'ferry_drop', 'sync_dock_pass', 'clear_river_bridge']),
      deBai: 'Luna phát hiện lỗi trong hàm fix_bridge_sync(t, n) của màn: đáng lẽ R2 phải chờ t nhịp bằng wait_n(t) cho R1 gọi clear_river_bridge(2, 3) ghép xong cầu phao ở (3, 2) rồi mới gọi cross_and_pick(n), nhưng ai đó lại đặt cross_and_pick(n) lên trước wait_n(t) khiến R2 lao thẳng xuống sông ngay nhịp 1! Hãy sửa lại thứ tự trong fix_bridge_sync(t, n)!',
      veMaMau: 'Đổi chỗ để wait_n(t) chạy trước cross_and_pick(n) trong hàm fix_bridge_sync(t, n).',
      san: [
        ['########', '#=V.=..#', '#~~qK~B#', '#.D....#', '#=uoH..#', '########'],
        ['########', '#=V.=..#', '#~~qk~B#', '#.D....#', '#=uoH..#', '########']
      ],
      dong: [
        [{ x: 3, y: 2, huong: 3, suc: 2 }],
        []
      ],
      noi: [
        [{ nut: { x: 2, y: 1 }, cong: [{ x: 4, y: 2 }], dong: [{ x: 3, y: 2 }] }],
        [{ nut: { x: 2, y: 1 }, cong: [{ x: 4, y: 2 }], dong: [] }]
      ],
      bd: [{ x: 2, y: 2, huong: 1 }, { x: 3, y: 1, huong: 2 }],
      maMau: B(
        ['clear_river_bridge(2, 3)'],
        ['fix_bridge_sync(9, 2)', 'turn_right()', 'drop()'],
        { hamCuaMan: [hFixBridgeSync(T_FIX_BRIDGE_SYNC_SAI)] }
      ),
      loiGiai: B(
        ['clear_river_bridge(2, 3)'],
        ['fix_bridge_sync(9, 2)', 'turn_right()', 'drop()'],
        { hamCuaMan: [hFixBridgeSync(T_FIX_BRIDGE_SYNC_DUNG)] }
      ),
      sao: { o: 51, nhip: 30 },
      loiSai: [
        { moTa: 'Chưa sửa thứ tự trong fix_bridge_sync(t, n) nên R2 vẫn bước xuống nước ngay nhịp 1', baiLam: B(['clear_river_bridge(2, 3)'], ['fix_bridge_sync(9, 2)', 'turn_right()', 'drop()'], { hamCuaMan: [hFixBridgeSync(T_FIX_BRIDGE_SYNC_SAI)] }), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'Xóa mất cross_and_pick(n) trong fix_bridge_sync(t, n) nên R2 chỉ đứng chờ mà không qua cầu', baiLam: B(['clear_river_bridge(2, 3)'], ['fix_bridge_sync(9, 2)', 'turn_right()', 'drop()'], { hamCuaMan: [hFixBridgeSync(['wait_n(t)'])] }), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Trong fix_bridge_sync(t, n), đặt wait_n(t) ở dòng 1 và cross_and_pick(n) ở dòng 2 (hoặc gọi sync_dock_pass(t, n)).', 'Luna: Sửa xong bấm Chạy để kiểm tra trên cả 2 sân!']
    }),

    cheDoi({
      so: 8, ten: 'Phối hợp mở cống bắc cầu và chở hàng hai bờ', hang: 'bien-the',
      hamCuaEmCan: KHO_TRUOC.concat(['bridge_lay', 'cross_and_pick', 'ferry_drop', 'sync_dock_pass', 'clear_river_bridge']),
      deBai: 'Sola và Luna phối hợp nhịp nhàng: R1 ở (2, 2) hướng Đông gọi clear_river_bridge(2, 3) để mở cống K ở (4, 2) và kéo bè B từ (6, 2) về làm cầu phao ở (3, 2). R2 ở (3, 1) hướng Nam gọi sync_dock_pass(9, 2) để chờ cầu rồi qua sông nhặt kiện hàng o ở (3, 4), sau đó gọi u_turn() và ferry_drop(2) chở kiện hàng ngược qua cầu về thả vào đích D ở bờ Bắc (3, 0)!',
      veMaMau: 'R1 gọi clear_river_bridge(2, 3); R2 gọi sync_dock_pass(9, 2), u_turn() và ferry_drop(2).',
      san: [
        '###D####',
        '#=V.=..#',
        '#~~qK~B#',
        '#=....=#',
        '#=uoH..#',
        '########'
      ],
      dong: [{ x: 3, y: 2, huong: 3, suc: 2 }],
      noi: [{ nut: { x: 2, y: 1 }, cong: [{ x: 4, y: 2 }], dong: [{ x: 3, y: 2 }] }],
      bd: [{ x: 2, y: 2, huong: 1 }, { x: 3, y: 1, huong: 2 }],
      maMau: B(
        ['clear_river_bridge(2, 3)'],
        ['sync_dock_pass(9, 2)']
      ),
      loiGiai: B(
        ['clear_river_bridge(2, 3)'],
        ['sync_dock_pass(9, 2)', 'u_turn()', 'ferry_drop(2)']
      ),
      sao: { o: 56, nhip: 17 },
      loiSai: [
        { moTa: 'R2 chỉ tiến 1 ô ferry_drop(1) khi quay về nên thả kiện hàng ở bờ (3, 1) thay vì đích D ở (3, 0)', baiLam: B(['clear_river_bridge(2, 3)'], ['sync_dock_pass(9, 2)', 'u_turn()', 'ferry_drop(1)']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'R2 quên gọi u_turn() trước khi gọi ferry_drop(2) nên đi tiếp xuống phía Nam đâm vào hàng o/tường', baiLam: B(['clear_river_bridge(2, 3)'], ['sync_dock_pass(9, 2)', 'ferry_drop(2)']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau sync_dock_pass(9, 2), R2 đang ở (3, 3) hướng Nam và đã cầm kiện hàng trên tay.', 'Luna: Gọi u_turn() để quay mặt về hướng Bắc rồi gọi ferry_drop(2) tiến lên (3, 1) và thả hàng vào D ở (3, 0).']
    }),

    cheDoi({
      so: 9, ten: 'Lai dắt cầu phao qua cống cổ và giao hàng liên bờ', hang: 'bien-the', nhipTheo: 'tong',
      hamCuaEmCan: KHO_TRUOC.concat(['bridge_lay', 'cross_and_pick', 'ferry_drop', 'sync_dock_pass', 'clear_river_bridge']),
      deBai: 'Sola và Luna đối mặt thử thách 2 sân: từ (2, 1) hướng Đông, R1 gọi tail_over_calm("R", 1) để tự kiểm tra dòng chảy mở cống K/k ở (2, 3) khi cần và dắt lục bình L ở (4, 1) rẽ xuống (2, 2), rồi gọi forward(3 - flow_power()) và tether_drop() để đặt L vào đúng ô cầu phao q ở (2, 4)! R2 ở (1, 4) hướng Đông gọi sync_dock_pass(11, 2) vượt cầu sang (3, 4) nhặt hàng ở (4, 4), rồi gọi u_turn() và ferry_drop(2) chở hàng về thả vào D ở bờ Tây (0, 4)!',
      veMaMau: 'R1 gọi tail_over_calm("R", 1), forward(3 - flow_power()), tether_drop(); R2 gọi sync_dock_pass(11, 2), u_turn(), ferry_drop(2).',
      san: [
        ['##V###', '#~~~L#', '#=~H=#', '#uK==#', 'D.q.o#', '#~~~~#', '######'],
        ['##V###', '#~~~L#', '#=~H=#', '#uk==#', 'D.q.o#', '#~~~~#', '######']
      ],
      dong: [
        [{ x: 3, y: 1, huong: 1, suc: 1 }, { x: 2, y: 3, huong: 2, suc: 1 }],
        [{ x: 2, y: 3, huong: 2, suc: 2 }]
      ],
      noi: [
        [{ nut: { x: 2, y: 0 }, cong: [{ x: 2, y: 3 }], dong: [{ x: 3, y: 1 }] }],
        [{ nut: { x: 2, y: 0 }, cong: [{ x: 2, y: 3 }], dong: [] }]
      ],
      bd: [{ x: 2, y: 1, huong: 1 }, { x: 1, y: 4, huong: 1 }],
      maMau: B(
        ['tail_over_calm("R", 1)', 'p = flow_power()', 't = 3 - p', 'forward(t)'],
        ['sync_dock_pass(11, 2)', 'u_turn()']
      ),
      loiGiai: B(
        ['tail_over_calm("R", 1)', 'p = flow_power()', 't = 3 - p', 'forward(t)', 'tether_drop()'],
        ['sync_dock_pass(11, 2)', 'u_turn()', 'ferry_drop(2)']
      ),
      sao: { o: 60, nhip: 38 },
      loiSai: [
        { moTa: 'R1 dùng tug_corner("R", 1) thay vì tail_over_calm("R", 1) nên ở sân 1 cống K ở (2, 3) chưa mở', baiLam: B(['tug_corner("R", 1)', 'p = flow_power()', 't = 3 - p', 'forward(t)', 'tether_drop()'], ['sync_dock_pass(11, 2)', 'u_turn()', 'ferry_drop(2)']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'R2 chỉ chờ 4 nhịp sync_dock_pass(4, 2) nên ở sân 1 bước ra (2, 4) trước khi L tới nơi', baiLam: B(['tail_over_calm("R", 1)', 'p = flow_power()', 't = 3 - p', 'forward(t)', 'tether_drop()'], ['sync_dock_pass(4, 2)', 'u_turn()', 'ferry_drop(2)']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      goiY: ['Luna: Sau tail_over_calm("R", 1), R1 gọi forward(3 - flow_power()) và tether_drop() để đặt L vào (2, 4) ở nhịp 10.', 'Luna: R2 gọi sync_dock_pass(11, 2) sang (3, 4) nhặt hàng ở (4, 4), rồi gọi u_turn() và ferry_drop(2) về (1, 4) thả hàng vào D ở (0, 4)!']
    }),

    cheDoi({
      so: 10, ten: 'Trùm: Đội xuồng và xe tổng lực bến sông', hang: 'trum', nhipTheo: 'tong',
      huyHieu: { ma: 'che-doi-xuong', ten: 'Huy hiệu Chế lệnh: đội xuồng phối hợp' },
      hamCuaEmCan: KHO_TRUOC.concat(['bridge_lay', 'cross_and_pick', 'ferry_drop', 'sync_dock_pass', 'clear_river_bridge']),
      deBai: 'Bài kiểm tra Trùm Gói 9 trên 2 sân: có cả bè B ở (7, 2) và lục bình L ở (1, 2)! R1 ở (3, 2) hướng Đông gọi clear_river_bridge(2, 1) để tự mở cống K/k ở (4, 2) khi có dòng chảy và đưa B về bến q bên phải (6, 2), rồi gọi u_turn(), move() và bridge_lay(1) để đặt L vào ô cầu phao (2, 2)! R2 ở (2, 1) hướng Nam gọi sync_dock_pass(12, 2), u_turn() và ferry_drop(2) đưa hàng về đích D ở (2, 0)!',
      veMaMau: 'R1 đưa B về (6, 2) rồi quay lại dùng bridge_lay(1) đặt L vào (2, 2); R2 gọi sync_dock_pass(12, 2), u_turn(), ferry_drop(2).',
      san: [
        ['##D######', '#=.V=...#', '#Lq~K~qB#', '#=....=.#', '#=ouH...#', '#########'],
        ['##D######', '#=.V=...#', '#Lq~k~qB#', '#=....=.#', '#=ouH...#', '#########']
      ],
      dong: [
        [{ x: 4, y: 2, huong: 3, suc: 2 }],
        []
      ],
      noi: [
        [{ nut: { x: 3, y: 1 }, cong: [{ x: 4, y: 2 }], dong: [{ x: 4, y: 2 }] }],
        [{ nut: { x: 3, y: 1 }, cong: [{ x: 4, y: 2 }], dong: [] }]
      ],
      bd: [{ x: 3, y: 2, huong: 1 }, { x: 2, y: 1, huong: 2 }],
      maMau: B(
        ['clear_river_bridge(2, 1)', 'u_turn()', 'move()'],
        ['sync_dock_pass(12, 2)', 'u_turn()']
      ),
      loiGiai: B(
        [
          'clear_river_bridge(2, 1)',
          'u_turn()',
          'move()',
          'bridge_lay(1)'
        ],
        [
          'sync_dock_pass(12, 2)',
          'u_turn()',
          'ferry_drop(2)'
        ]
      ),
      sao: { o: 60, nhip: 40 },
      loiSai: [
        { moTa: 'R1 quên gọi bridge_lay(1) ở bước cuối nên L chưa về (2, 2) làm cầu phao cho R2', baiLam: B(['clear_river_bridge(2, 1)', 'u_turn()', 'move()'], ['sync_dock_pass(12, 2)', 'u_turn()', 'ferry_drop(2)']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'R2 quên gọi ferry_drop(2) sau khi quay đầu u_turn() nên chưa chở hàng về đích D ở (2, 0)', baiLam: B(['clear_river_bridge(2, 1)', 'u_turn()', 'move()', 'bridge_lay(1)'], ['sync_dock_pass(12, 2)', 'u_turn()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Luna: Nhờ hàm clear_river_bridge(2, 1) và bridge_lay(1), chương trình của R1 rút gọn chỉ còn 4 dòng!', 'Luna: R2 gọi sync_dock_pass(12, 2), u_turn() rồi ferry_drop(2) để hoàn thành bài Trùm Gói 9!']
    })
  ];

  ManHoc.manDoiXuong = DS;
  if (laNode) module.exports = DS;
})();
