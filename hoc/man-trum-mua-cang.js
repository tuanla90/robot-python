/* ============================================================================
   man-trum-mua-cang.js - Mua 4 "Cang song" - Goi 10: Tong hop & Trum mua 4
   20 man:
     - Chuong 1: tong-hop-cang (10 man: tong-hop-cang.1 .. tong-hop-cang.10)
     - Chuong 2: trum-mua-cang (10 man: trum-mua-cang.1 .. trum-mua-cang.10)
   PDM-Cang-c:
     - Moi man 1 robot: Can cau container R1 day du (than 'cau', tay 'moc-cau',
       camBien [{ ma: 'quet-ma', o: 'tren' }], hamGoc day du 11 lenh).
     - Moi man 2-3 san ("ngay lam viec"), nhipTheo: 'tong'.
     - Moi man (tru man 1 chiChay) co >= 1 loi sai viet cung (cung: true) thua
       o it nhat mot san.
   ============================================================================ */
(function () {
  'use strict';
  var laNode = typeof module !== 'undefined' && module.exports;
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var HAM_CAU_FULL = ['swing_left', 'swing_right', 'extend', 'retract', 'pick_up', 'set_down', 'pick_up2', 'read_code', 'weight', 'rail', 'wait'];
  var ROBOT_CAU_FULL = { than: 'cau', tay: 'moc-cau', camBien: [{ ma: 'quet-ma', o: 'tren' }] };
  var CAU_TRUC = ['for', 'if', 'while'];

  /* --- San mau --- */
  var SAN_CANG_1 = [
    '#######',
    '#~~~~~#',
    '#~TTT~#',
    '#RRRRR#',
    '#DDDDD#',
    '#DDDDD#',
    '#######'
  ];

  var SAN_CANG_2 = [
    '#######',
    '#~~~~~#',
    '#~TDT~#',
    '#RRRRR#',
    '#DDDDD#',
    '#DDDDD#',
    '#######'
  ];

  var SAN_CANG_RAO = [
    '#######',
    '#~~~~~#',
    '#~TTT~#',
    '#RRRRR#',
    '#.=DDD#',
    '#DDDDD#',
    '#######'
  ];

  var SAN_CANG_RAO4 = [
    '#######',
    '#~~~~~#',
    '#~TTT~#',
    '#RRRRR#',
    '#DDD=.#',
    '#DDDDD#',
    '#######'
  ];

  var SAN_CANG_BANG = [
    '#######',
    '#~~~~~#',
    '#~TTT~#',
    '#RRRRR#',
    '#DDDu.#',
    '#DDDDD#',
    '#######'
  ];

  // Cọc phụ cạnh bệ (14/11, cẩu 4 hướng): ô chéo không còn với tới, cọc phụ là ô đất (1, 3) / (5, 3) ở đầu ray
  var SAN_CANG_COC_TRAI = [
    '#######',
    '#~~~~~#',
    '#~TTT~#',
    '#DRRRR#',
    '#DDDDD#',
    '#DDDDD#',
    '#######'
  ];

  var SAN_CANG_COC_PHAI = [
    '#######',
    '#~~~~~#',
    '#~TTT~#',
    '#RRRRD#',
    '#DDDDD#',
    '#DDDDD#',
    '#######'
  ];

  var SAN_CANG_DAI = [
    '########',
    '#~~~~~~#',
    '#~TTTT~#',
    '#RRRRRR#',
    '#DD=Du.#',
    '#DDDDDD#',
    '########'
  ];

  function CW(x, y, ds) {
    return {
      x: x, y: y,
      cont: ds.map(function (p) { return { so: p[0], tan: p[1] }; })
    };
  }

  function tauDon(co, vang) {
    return [{ o: [{ x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 }], co: co, vang: vang || 2 }];
  }
  function tauDai(co, vang) {
    return [{ o: [{ x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 }, { x: 5, y: 2 }], co: co, vang: vang || 2 }];
  }
  function tauDoi(co, vang) {
    return [
      { o: [{ x: 2, y: 2 }], co: co, vang: vang || 2 },
      { o: [{ x: 4, y: 2 }], co: co, vang: vang || 2 }
    ];
  }

  function B(chinh, phu) {
    return Object.assign({ chinh: chinh.slice(), hamCuaMan: [], hamCuaEmMoi: [] }, phu || {});
  }
  function H(ten, thamSo, than, khoa) {
    var o = { ten: ten, thamSo: thamSo.slice(), than: than.slice() };
    if (khoa) o.khoa = true;
    return o;
  }
  function cung(moTa, baiLam, phaiCoMa, them) {
    return Object.assign({ moTa: moTa, baiLam: baiLam, phaiCoMa: phaiCoMa, cung: true }, them || {});
  }

  /* --- Ham moi cua Chuong 2 (trum-mua-cang) --- */
  var T_SMART_SLIDE = ['rail(s)', 'safe_carry(2)'];
  var T_VAULT_RAIL = ['rail(s)', 'vault_stack(n, 2)'];
  var T_BELT_RAIL = ['rail(s)', 'over_wall(d)', 'swing_by(-d)'];
  var T_PORT_SWEEP = ['for i in range(n):', '    smart_slide(1)'];

  function hSmartSlide(than) { return H('smart_slide', ['s'], than || T_SMART_SLIDE); }
  function hVaultRail(than) { return H('vault_rail', ['s', 'n'], than || T_VAULT_RAIL); }
  function hBeltRail(than) { return H('belt_rail', ['s', 'd'], than || T_BELT_RAIL); }
  function hPortSweep(than) { return H('port_sweep', ['n'], than || T_PORT_SWEEP); }

  /* --- Ham sua loi --- */
  var T_SMART_DOCK_DUNG = [
    'c = read_code()',
    't = c // 10',
    'if t == 1:',
    '    rail_drop(-1)',
    'else:',
    '    rail_drop(1)'
  ];
  var T_SMART_DOCK_SAI = [
    'c = read_code()',
    't = c // 10',
    'if t == 1:',
    '    rail_drop(-1)',
    'else:',
    '    rail_drop(2)'
  ];
  function hSmartDock(than) { return H('smart_dock', [], than || T_SMART_DOCK_DUNG); }

  var T_PORT_STEP_DUNG = [
    'c = read_code()',
    'if c != -1:',
    '    safe_carry(2)',
    'else:',
    '    over_wall(2)',
    '    swing_by(2)'
  ];
  var T_PORT_STEP_SAI = [
    'c = read_code()',
    'if c != -1:',
    '    safe_carry(2)',
    'else:',
    '    over_wall(1)',
    '    swing_by(2)'
  ];
  function hPortStep(than) { return H('port_step', [], than || T_PORT_STEP_DUNG); }

  function manCang(m) {
    m.chuong = m.chuong || 'tong-hop-cang';
    m.hang = m.hang || (m.so <= 3 ? 'lam-quen' : m.so <= 6 ? 'luyen' : m.so <= 9 ? 'bien-the' : 'trum');
    m.vo = 'cang';
    m.cauTruc = CAU_TRUC;
    m.vaHoac = true;
    m.loaiRobot = 'cau';
    m.robot = JSON.parse(JSON.stringify(ROBOT_CAU_FULL));
    m.hamGoc = HAM_CAU_FULL.slice();
    m.mucTieu = m.mucTieu || 'giao-tau';
    m.taiToiDa = m.taiToiDa || 4;
    m.nhipTheo = 'tong';
    m.moXuong = true;
    m.camHamCuaEm = false;
    m.khung = m.khung || { chinh: 10, moiHam: 10 };
    m.taoHam = m.taoHam || [];
    m.loiSai = m.loiSai || [];
    m.hamCuaEmCan = m.hamCuaEmCan || [];
    if (m.loiGiai) m.loiGiai.hamCuaEmMoi = m.loiGiai.hamCuaEmMoi || [];
    if (Array.isArray(m.san[0]) && !Array.isArray(m.batDau)) {
      var bd = m.batDau;
      m.batDau = m.san.map(function () { return Object.assign({}, bd); });
    }
    if (m.so === 10 && !m.huyHieu) {
      m.huyHieu = {
        ma: m.chuong,
        ten: m.chuong === 'tong-hop-cang' ? 'Huy hiệu Tổng hợp cảng sông' : 'Huy hiệu Trùm mùa cảng sông'
      };
    }
    return ManHoc.chuanHoa(m);
  }

  function manTrum(m) {
    m.chuong = 'trum-mua-cang';
    return manCang(m);
  }

  var DS = [
    /* ========================================================================
       CHƯƠNG 1: tong-hop-cang (10 màn) - Tổng hợp cảng sông
       ======================================================================== */
    manCang({
      so: 1, ten: 'Ngày làm việc đầu tiên ở cảng',
      chiChay: true, chinhCoDinh: true,
      taiToiDa: 4,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'carry2_by', 'carry_n', 'safe_carry'],
      deBai: 'Chào mừng đến gói cuối của Mùa 4 Cảng sông! Cần cẩu container R1 giờ đã trang bị đầy đủ thân cẩu trượt ray, tay móc đôi và cảm biến quét mã/cân tải. Ở mỗi màn sẽ có 2-3 ngày làm việc (2-3 sân): ngày 1 tại (2, 4) là cặp kiện nhẹ 1 tấn [14, 12], ngày 2 là kiện nặng 3 tấn [25, 22]. Hàm safe_carry(2) giúp R1 tự cân tải để bốc đôi hoặc tách từng kiện an toàn! Bấm Chạy để xem.',
      veMaMau: 'Chương trình đã viết sẵn. Bấm Chạy để xem R1 xử lý cả hai ngày làm việc.',
      san: [SAN_CANG_1, SAN_CANG_1],
      batDau: { x: 2, y: 3, nac: 2, tam: 1 },
      chong: [
        [CW(2, 4, [[14, 1], [12, 1]])],
        [CW(2, 4, [[25, 3], [22, 3]])]
      ],
      tau: [tauDon(6, 2), tauDon(12, 2)],
      giao: [
        [{ tau: 0, so: [12, 14] }],
        [{ tau: 0, so: [22, 25] }]
      ],
      maMau: B(['safe_carry(2)']),
      loiGiai: B(['safe_carry(2)']),
      sao: { o: 25, nhip: 18 },
      goiY: ['Luna: safe_carry(2) tự đọc w = weight(), hỏi w <= 2 để chọn carry2_by(4) hoặc carry_n(2, 4).', 'Luna: Ở ngày 1 R1 bốc đôi nhanh gọn, ở ngày 2 R1 tách từng kiện không sợ quá tải.']
    }),

    manCang({
      so: 2, ten: 'Trượt ray cân tải hai cột',
      taiToiDa: 4,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'carry2_by', 'carry_n', 'safe_carry'],
      deBai: 'Trong hai ngày làm việc, hàng hóa đặt ở cột 2 và cột 3 có trọng lượng thay đổi giữa cặp 1 tấn và cặp 3 tấn. R1 bắt đầu tại (1, 3): hãy lặp 2 lần trượt rail(1) rồi gọi safe_carry(2) để bốc hết hàng ở cả hai cột mà không bị quá tải ở bất kỳ ngày nào!',
      veMaMau: 'Thay mã mẫu viết cứng carry2_by(2) bằng vòng lặp 2 lần gọi rail(1) và safe_carry(2).',
      san: [SAN_CANG_1, SAN_CANG_1],
      batDau: { x: 1, y: 3, nac: 2, tam: 1 },
      chong: [
        [CW(2, 4, [[14, 1], [12, 1]]), CW(3, 4, [[26, 3], [24, 3]])],
        [CW(2, 4, [[18, 3], [16, 3]]), CW(3, 4, [[28, 1], [22, 1]])]
      ],
      tau: [tauDon(20, 2), tauDon(20, 2)],
      giao: [
        [{ tau: 0, so: [12, 14, 24, 26] }],
        [{ tau: 0, so: [16, 18, 22, 28] }]
      ],
      maMau: B(['rail(1)', 'carry2_by(2)', 'swing_by(2)', 'rail(1)', 'carry2_by(2)']),
      loiGiai: B([
        'for i in range(2):',
        '    rail(1)',
        '    safe_carry(2)'
      ]),
      sao: { o: 27, nhip: 40 },
      loiSai: [
        cung('Dùng carry2_by(2) cứng cho cả hai cột: gặp cặp 3 tấn bị quá tải (taiToiDa = 4)', B(['rail(1)', 'carry2_by(2)', 'swing_by(2)', 'rail(1)', 'carry2_by(2)']), ['qua-tai']),
        { moTa: 'Chỉ lặp 1 lần nên bỏ sót chồng hàng ở cột 3', baiLam: B(['rail(1)', 'safe_carry(2)']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: safe_carry(2) sau khi bốc hết chồng hàng đã tự quay cần về nấc 2.', 'Luna: Chỉ cần for i in range(2): gồm rail(1) và safe_carry(2).']
    }),

    manCang({
      so: 3, ten: 'Đọc mã phân loại rồi trượt ray',
      taiToiDa: 6,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'rail_drop', 'scan_rail'],
      deBai: 'Hai ngày làm việc với hai tàu neo ở cột 2 (Tàu 1, mã 1x) và cột 4 (Tàu 2, mã 2x). Tại (4, 4) có 1 kiện mã 2x, còn trên cầu cảng giữa (3, 2) có chồng 2 kiện hàng khác thứ tự mã giữa hai ngày. R1 ở (4, 3) hướng nấc 2 hãy gọi carry_by(2) để bốc kiện ở (4, 4) lên Tàu 2 (khiến cần quay về nấc 0), rồi lùi rail(-1) sang cột 3 và gọi scan_rail()!',
      veMaMau: 'Gọi carry_by(2) ở cột 4, sau đó lùi rail(-1) về cột 3 và gọi scan_rail().',
      san: [SAN_CANG_2, SAN_CANG_2],
      batDau: { x: 4, y: 3, nac: 2, tam: 1 },
      chong: [
        [CW(3, 2, [[24, 2], [14, 2]]), CW(4, 4, [[28, 2]])],
        [CW(3, 2, [[16, 2], [26, 2]]), CW(4, 4, [[29, 2]])]
      ],
      tau: [tauDoi(11, 2), tauDoi(11, 2)],
      giao: [
        [{ tau: 0, so: [14] }, { tau: 1, so: [24, 28] }],
        [{ tau: 0, so: [16] }, { tau: 1, so: [26, 29] }]
      ],
      maMau: B(['carry_by(2)', 'rail(-1)', 'rail_drop(-1)', 'rail_drop(1)']),
      loiGiai: B(['carry_by(2)', 'rail(-1)', 'scan_rail()']),
      sao: { o: 25, nhip: 26 },
      loiSai: [
        cung('Ở cột 3 gọi cứng rail_drop(-1) rồi rail_drop(1) theo ngày 1: sang ngày 2 kiện 26 ở trên bị giao nhầm cho Tàu 1', B(['carry_by(2)', 'rail(-1)', 'rail_drop(-1)', 'rail_drop(1)']), ['giao-nham']),
        { moTa: 'Chỉ bốc kiện ở cột 4 mà quên lùi rail(-1) và gọi scan_rail()', baiLam: B(['carry_by(2)']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Sau carry_by(2) ở cột 4, đầu cần đang hướng nấc 0 về phía tàu.', 'Luna: Lùi rail(-1) sang cột 3 rồi gọi scan_rail() để phân loại chồng hàng ở cầu cảng giữa (3, 2) sang hai tàu.']
    }),

    manCang({
      so: 4, ten: 'Nhấc qua tường rào rồi cân tải',
      taiToiDa: 4,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'carry2_by', 'carry_n', 'safe_carry', 'over_wall', 'vault_stack'],
      deBai: 'Hai ngày làm việc ở khu cảng cũ có tường rào = tại (2, 4): phía sau rào ở (2, 5) có 2 kiện hàng, còn bên cột 3 tại (3, 4) là chồng 2 kiện có khối lượng thay đổi theo ngày. R1 ở (2, 3) hãy gọi vault_stack(2, 2) để đưa 2 kiện ở (2, 5) qua rào lên tàu, rồi trượt rail(1) sang cột 3 và gọi safe_carry(2)!',
      veMaMau: 'Gọi vault_stack(2, 2), rail(1), safe_carry(2).',
      san: [SAN_CANG_RAO, SAN_CANG_RAO],
      batDau: { x: 2, y: 3, nac: 2, tam: 1 },
      chong: [
        [CW(2, 5, [[15, 2], [11, 2]]), CW(3, 4, [[24, 1], [22, 1]])],
        [CW(2, 5, [[18, 2], [14, 2]]), CW(3, 4, [[29, 3], [27, 3]])]
      ],
      tau: [tauDon(23, 2), tauDon(29, 2)],
      giao: [
        [{ tau: 0, so: [11, 15, 22, 24] }],
        [{ tau: 0, so: [14, 18, 27, 29] }]
      ],
      maMau: B(['vault_stack(2, 2)', 'rail(1)', 'carry2_by(2)']),
      loiGiai: B([
        'vault_stack(2, 2)',
        'rail(1)',
        'safe_carry(2)'
      ]),
      sao: { o: 35, nhip: 52 },
      loiSai: [
        cung('Ở cột 3 gọi cứng carry2_by(2) theo ngày 1: sang ngày 2 gặp cặp 3 tấn bị quá tải', B(['vault_stack(2, 2)', 'rail(1)', 'carry2_by(2)']), ['qua-tai']),
        { moTa: 'Quên gọi safe_carry(2) sau khi trượt sang cột 3', baiLam: B(['vault_stack(2, 2)', 'rail(1)']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: vault_stack(2, 2) sau mỗi kiện đã tự quay cần về nấc 2.', 'Luna: Tại cột 3, gọi safe_carry(2) để xử lý cả cặp 1 tấn lẫn cặp 3 tấn.']
    }),

    manCang({
      so: 5, ten: 'Cân tải rồi nhấc qua hố sâu',
      taiToiDa: 4,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'carry2_by', 'carry_n', 'safe_carry', 'over_wall'],
      deBai: 'Hai ngày làm việc kết hợp cân tải và nhấc qua hố sâu: tại (2, 4) có chồng 2 kiện (ngày 1 là cặp 1 tấn, ngày 2 là cặp 3 tấn), còn ở (4, 5) phía sau hố sâu u tại (4, 4) có 1 kiện hàng. R1 ở (2, 3) hãy gọi safe_carry(2) để dọn cột 2, trượt rail(2) sang cột 4 rồi gọi over_wall(2) để nhấc kiện ở (4, 5) lên tàu!',
      veMaMau: 'Gọi safe_carry(2), trượt rail(2) rồi gọi over_wall(2).',
      san: [SAN_CANG_BANG, SAN_CANG_BANG],
      batDau: { x: 2, y: 3, nac: 2, tam: 1 },
      chong: [
        [CW(2, 4, [[14, 1], [12, 1]]), CW(4, 5, [[28, 2]])],
        [CW(2, 4, [[19, 3], [17, 3]]), CW(4, 5, [[25, 2]])]
      ],
      tau: [tauDon(14, 2), tauDon(20, 2)],
      giao: [
        [{ tau: 0, so: [12, 14, 28] }],
        [{ tau: 0, so: [17, 19, 25] }]
      ],
      maMau: B(['carry2_by(2)', 'swing_by(2)', 'rail(2)', 'over_wall(2)']),
      loiGiai: B(['safe_carry(2)', 'rail(2)', 'over_wall(2)']),
      sao: { o: 32, nhip: 34 },
      loiSai: [
        cung('Dùng carry2_by(2) cứng ở cột 2 theo ngày 1: sang ngày 2 gặp cặp 3 tấn bị quá tải', B(['carry2_by(2)', 'swing_by(2)', 'rail(2)', 'over_wall(2)']), ['qua-tai']),
        { moTa: 'Quên gọi over_wall(2) sau khi trượt sang cột 4', baiLam: B(['safe_carry(2)', 'rail(2)']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: safe_carry(2) tự xử lý cặp kiện ở (2, 4) rồi trả cần về nấc 2.', 'Luna: Sau đó trượt rail(2) sang (4, 3) và gọi over_wall(2) để bốc kiện hàng từ (4, 5) lên tàu.']
    }),

    manCang({
      so: 6, ten: 'Sửa hàm phân luồng tại bến',
      chinhCoDinh: true,
      taiToiDa: 6,
      hamCuaEmCan: ['rail_drop'],
      deBai: 'Hai ngày làm việc: R1 đứng tại (3, 3) hướng nấc 0 nhìn vào cầu cảng giữa (3, 2), hai bên là Tàu 1 ở (2, 2) và Tàu 2 ở (4, 2). Hàm smart_dock() kiểm tra nếu kiện ở (3, 2) có mã 1x (c = read_code(), t = c // 10, t == 1) thì gọi rail_drop(-1) giao sang Tàu 1, ngược lại giao sang Tàu 2 bằng rail_drop(1). Nhưng nhánh else đang viết nhầm thành rail_drop(2) khiến hàng rơi xuống nước ở (5, 2)! Hãy sửa lại smart_dock().',
      veMaMau: 'Sửa rail_drop(2) thành rail_drop(1) trong hàm smart_dock().',
      san: [SAN_CANG_2, SAN_CANG_2],
      batDau: { x: 3, y: 3, nac: 0, tam: 1 },
      chong: [
        [CW(3, 2, [[15, 2]])],
        [CW(3, 2, [[25, 2]])]
      ],
      tau: [tauDoi(3, 2), tauDoi(3, 2)],
      giao: [
        [{ tau: 0, so: [15] }],
        [{ tau: 1, so: [25] }]
      ],
      maMau: B(['smart_dock()'], { hamCuaMan: [hSmartDock(T_SMART_DOCK_SAI)] }),
      loiGiai: B(['smart_dock()'], { hamCuaMan: [hSmartDock(T_SMART_DOCK_DUNG)] }),
      sao: { o: 11, nhip: 8 },
      loiSai: [
        { moTa: 'Chưa sửa rail_drop(2) thành rail_drop(1) nên ở ngày 2 kiện 25 bị thả xuống nước tại (5, 2)', baiLam: B(['smart_dock()'], { hamCuaMan: [hSmartDock(T_SMART_DOCK_SAI)] }), phaiCoMa: ['ha-bi-chan'] },
        cung('Luôn gọi rail_drop(-1) theo ngày 1: sang ngày 2 kiện 25 bị giao nhầm cho Tàu 1', B(['smart_dock()'], { hamCuaMan: [hSmartDock(['rail_drop(-1)'])] }), ['giao-nham'])
      ],
      goiY: ['Luna: Tàu 2 neo ở (4, 2), chỉ cách cột 3 đúng 1 ô ray về bên phải.', 'Luna: Đổi rail_drop(2) thành rail_drop(1) ở dòng cuối của smart_dock().']
    }),

    manCang({
      so: 7, ten: 'Dọn cọc phụ rồi chuyển tháp',
      taiToiDa: 4, luatThap: true,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'carry2_by', 'carry_n', 'safe_carry', 'move_tower2'],
      deBai: 'Hai ngày làm việc với quy tắc Tháp Hà Nội (luatThap = true): tại (2, 4) có tháp 2 tầng [11, 10] cần chuyển nguyên thứ tự lên tàu ở (2, 2) nhờ cọc phụ (1, 3) bên trái bệ. Nhưng trên cọc phụ (1, 3) đang có chồng 2 kiện (ngày 1 là cặp 3 tấn [15, 18], ngày 2 là cặp 1 tấn [14, 12])! R1 ở (2, 3) đang quay về cọc phụ (nấc 3): hãy gọi safe_carry(1) để dọn sạch ô (1, 3) lên tàu trước, rồi quay swing_by(-1) về tháp và gọi move_tower2(1, 2)!',
      veMaMau: 'Gọi safe_carry(1) dọn ô (1, 3), sau đó quay swing_by(-1) về nấc 2 rồi gọi move_tower2(1, 2).',
      san: [SAN_CANG_COC_TRAI, SAN_CANG_COC_TRAI],
      batDau: { x: 2, y: 3, nac: 3, tam: 1 },
      chong: [
        [CW(1, 3, [[15, 3], [18, 3]]), CW(2, 4, [[11, 2], [10, 1]])],
        [CW(1, 3, [[14, 1], [12, 1]]), CW(2, 4, [[11, 2], [10, 1]])]
      ],
      tau: [tauDon(21, 2), tauDon(17, 2)],
      giao: [
        [{ tau: 0, so: [10, 11, 15, 18] }],
        [{ tau: 0, so: [10, 11, 12, 14] }]
      ],
      maMau: B(['carry2_by(1)', 'swing_by(2)', 'move_tower2(1, 2)']),
      loiGiai: B(['safe_carry(1)', 'swing_by(-1)', 'move_tower2(1, 2)']),
      sao: { o: 34, nhip: 38 },
      loiSai: [
        cung('Gọi cứng carry2_by(1) ở cọc phụ theo ngày 2: ở ngày 1 gặp cặp 3 tấn bị quá tải', B(['carry2_by(1)', 'swing_by(2)', 'move_tower2(1, 2)']), ['qua-tai']),
        { moTa: 'Gọi move_tower2(1, 2) ngay mà quên dọn cọc phụ (1, 3) trước', baiLam: B(['swing_by(-1)', 'move_tower2(1, 2)']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: safe_carry(1) dọn sạch cả chồng ở (1, 3) lên tàu ở (2, 2) và quay cần về nấc 3.', 'Luna: Sau đó quay swing_by(-1) về tháp (2, 4) và gọi move_tower2(1, 2) là chuyển gọn tháp [11, 10] lên trên chồng hàng vừa dọn!']
    }),

    manCang({
      so: 8, ten: 'Lọc kiện ưu tiên đuôi 9 và cân tải',
      taiToiDa: 4,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'carry2_by', 'carry_n', 'safe_carry'],
      deBai: 'Hai ngày làm việc tại bến phân loại: R1 đứng ở (2, 3) hướng nấc 2. Nếu kiện trên cùng ở (2, 4) có chữ số hàng đơn vị bằng 9 (c = read_code(), t = c % 10, t == 9) thì bốc ngay chồng hàng ở (2, 4) lên tàu bằng safe_carry(2); ngược lại phải bỏ qua kiện chờ ở (2, 4), trượt rail(1) sang cột 3 và gọi safe_carry(2) để bốc chồng hàng ở (3, 4)!',
      veMaMau: 'Đọc c = read_code(), t = c % 10, kiểm tra if t == 9: gọi safe_carry(2), else: gọi rail(1) rồi safe_carry(2).',
      san: [SAN_CANG_1, SAN_CANG_1],
      batDau: { x: 2, y: 3, nac: 2, tam: 1 },
      chong: [
        [CW(2, 4, [[15, 1], [19, 1]])],
        [CW(2, 4, [[14, 2]]), CW(3, 4, [[28, 3], [26, 3]])]
      ],
      tau: [tauDon(6, 2), tauDon(13, 2)],
      giao: [
        [{ tau: 0, so: [15, 19] }],
        [{ tau: 0, so: [26, 28] }]
      ],
      maMau: B(['safe_carry(2)']),
      loiGiai: B([
        'c = read_code()',
        't = c % 10',
        'if t == 9:',
        '    safe_carry(2)',
        'else:',
        '    rail(1)',
        '    safe_carry(2)'
      ]),
      sao: { o: 31, nhip: 19 },
      loiSai: [
        cung('Chỉ gọi cứng safe_carry(2) ở cột 2 theo ngày 1: sang ngày 2 bốc nhầm kiện chờ 14 ở cột 2', B(['safe_carry(2)']), ['chua-giao-tau']),
        cung('Luôn trượt rail(1) sang cột 3 theo ngày 2: ở ngày 1 cột 3 trống nên móc hụt', B(['rail(1)', 'safe_carry(2)']), ['moc-hut'])
      ],
      goiY: ['Luna: Phép chia lấy dư t = c % 10 (c = read_code()) trả về chữ số hàng đơn vị của mã container.', 'Luna: Nếu t == 9 thì gọi safe_carry(2), ngược lại gọi rail(1) rồi safe_carry(2).']
    }),

    manCang({
      so: 9, ten: 'Ba ngày quét dọc ba cột cảng',
      taiToiDa: 4,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'carry2_by', 'carry_n', 'safe_carry'],
      deBai: 'Ba ngày làm việc liên tiếp! Trên mỗi sân, dọc 3 cột bãi (2, 4), (3, 4) và (4, 4) là các chồng 2 kiện (cặp 1 tấn hoặc cặp 3 tấn thay đổi vị trí mỗi ngày). R1 bắt đầu tại (1, 3): hãy lặp 3 lần trượt rail(1) và gọi safe_carry(2) để dọn sạch cả 3 cột trong cả 3 ngày!',
      veMaMau: 'Lặp 3 lần: trượt rail(1) rồi gọi safe_carry(2).',
      san: [SAN_CANG_1, SAN_CANG_1, SAN_CANG_1],
      batDau: { x: 1, y: 3, nac: 2, tam: 1 },
      chong: [
        [CW(2, 4, [[14, 1], [12, 1]]), CW(3, 4, [[26, 3], [25, 3]]), CW(4, 4, [[34, 1], [32, 1]])],
        [CW(2, 4, [[18, 3], [16, 3]]), CW(3, 4, [[24, 1], [22, 1]]), CW(4, 4, [[38, 3], [36, 3]])],
        [CW(2, 4, [[15, 1], [11, 1]]), CW(3, 4, [[28, 1], [21, 1]]), CW(4, 4, [[39, 3], [37, 3]])]
      ],
      tau: [tauDon(27, 2), tauDon(33, 2), tauDon(27, 2)],
      giao: [
        [{ tau: 0, so: [12, 14, 25, 26, 32, 34] }],
        [{ tau: 0, so: [16, 18, 22, 24, 36, 38] }],
        [{ tau: 0, so: [11, 15, 21, 28, 37, 39] }]
      ],
      maMau: B(['rail(1)', 'carry2_by(2)', 'swing_by(2)', 'rail(1)', 'carry_n(2, 2)', 'rail(1)', 'carry2_by(2)']),
      loiGiai: B([
        'for i in range(3):',
        '    rail(1)',
        '    safe_carry(2)'
      ]),
      sao: { o: 27, nhip: 87 },
      loiSai: [
        cung('Viết cứng carry2_by ở cột 2 theo ngày 1: hỏng ngay ở ngày 2 khi cột 2 là cặp 3 tấn (quá tải)', B(['rail(1)', 'carry2_by(2)', 'swing_by(2)', 'rail(1)', 'carry_n(2, 2)', 'rail(1)', 'carry2_by(2)']), ['qua-tai']),
        { moTa: 'Chỉ lặp 2 cột nên bỏ sót cột 4', baiLam: B(['for i in range(2):', '    rail(1)', '    safe_carry(2)']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Dù mỗi ngày thứ tự cột nhẹ và cột nặng khác nhau, safe_carry(2) đều tự động xử lý hết.', 'Luna: Dùng for i in range(3): gồm rail(1) và safe_carry(2).']
    }),

    manCang({
      so: 10, ten: 'Trùm Tổng hợp cảng sông',
      taiToiDa: 4,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'carry2_by', 'carry_n', 'safe_carry', 'over_wall', 'vault_stack'],
      deBai: 'Trùm chương 1 trên ba ngày làm việc: tại cột 2 có tường rào = ở (2, 4) chắn trước chồng 2 kiện tại (2, 5); còn tại cột 3 và cột 4 là các chồng 2 kiện ở (3, 4) và (4, 4) có trọng lượng thay đổi mỗi ngày. R1 ở (2, 3) hãy gọi vault_stack(2, 2) để nhấc 2 kiện qua rào lên tàu, rồi lặp 2 lần trượt rail(1) và gọi safe_carry(2)!',
      veMaMau: 'Kết hợp vault_stack(2, 2) và vòng lặp 2 cột với rail(1), safe_carry(2).',
      san: [SAN_CANG_RAO, SAN_CANG_RAO, SAN_CANG_RAO],
      batDau: { x: 2, y: 3, nac: 2, tam: 1 },
      chong: [
        [CW(2, 5, [[15, 2], [11, 2]]), CW(3, 4, [[24, 1], [22, 1]]), CW(4, 4, [[36, 3], [35, 3]])],
        [CW(2, 5, [[18, 2], [14, 2]]), CW(3, 4, [[29, 3], [28, 3]]), CW(4, 4, [[36, 1], [32, 1]])],
        [CW(2, 5, [[19, 2], [17, 2]]), CW(3, 4, [[26, 1], [21, 1]]), CW(4, 4, [[38, 1], [34, 1]])]
      ],
      tau: [tauDon(36, 2), tauDon(36, 2), tauDon(30, 2)],
      giao: [
        [{ tau: 0, so: [11, 15, 22, 24, 35, 36] }],
        [{ tau: 0, so: [14, 18, 28, 29, 32, 36] }],
        [{ tau: 0, so: [17, 19, 21, 26, 34, 38] }]
      ],
      maMau: B([
        'vault_stack(2, 2)',
        'rail(1)',
        'carry2_by(2)'
      ]),
      loiGiai: B([
        'vault_stack(2, 2)',
        'for i in range(2):',
        '    rail(1)',
        '    safe_carry(2)'
      ]),
      sao: { o: 36, nhip: 102 },
      loiSai: [
        cung('Viết cứng carry2_by ở cột 3 theo ngày 1: hỏng ở ngày 2 khi cột 3 là cặp 3 tấn (quá tải)', B(['vault_stack(2, 2)', 'rail(1)', 'carry2_by(2)', 'swing_by(2)', 'rail(1)', 'carry2_by(2)']), ['qua-tai']),
        { moTa: 'Chỉ bốc qua rào ở cột 2 mà quên vòng lặp 2 cột tiếp theo', baiLam: B(['vault_stack(2, 2)']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: vault_stack(2, 2) đã trả cần về lại nấc 2 tầm 1 sau khi bốc xong 2 kiện.', 'Luna: Tiếp theo lặp for i in range(2): gồm rail(1) và safe_carry(2) để dọn sạch cột 3 và cột 4 trên cả 3 sân!']
    }),

    /* ========================================================================
       CHƯƠNG 2: trum-mua-cang (10 màn) - Trùm mùa cảng sông
       ======================================================================== */
    manTrum({
      so: 1, ten: 'Chế hàm trượt ray cân tải',
      chinhCoDinh: true,
      taiToiDa: 4,
      taoHam: ['smart_slide'],
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'carry2_by', 'carry_n', 'safe_carry'],
      deBai: 'Sola mở màn chương Trùm mùa: thao tác trượt ray s ô rồi gọi safe_carry(2) để tự cân tải bốc hết chồng hàng lên tàu lặp lại ở khắp mọi bến. Hãy chế hàm smart_slide(s) gồm rail(s) và safe_carry(2) để R1 dọn sạch cột 3 trên cả hai ngày làm việc!',
      veMaMau: 'Viết hàm smart_slide(s): gọi rail(s) rồi safe_carry(2).',
      san: [SAN_CANG_1, SAN_CANG_1],
      batDau: { x: 1, y: 3, nac: 2, tam: 1 },
      chong: [
        [CW(3, 4, [[16, 1], [14, 1]])],
        [CW(3, 4, [[28, 3], [24, 3]])]
      ],
      tau: [tauDon(8, 2), tauDon(14, 2)],
      giao: [
        [{ tau: 0, so: [14, 16] }],
        [{ tau: 0, so: [24, 28] }]
      ],
      maMau: B(['smart_slide(2)']),
      loiGiai: B(['smart_slide(2)'], { hamCuaEmMoi: [hSmartSlide()] }),
      sao: { o: 27, nhip: 22 },
      loiSai: [
        { moTa: 'Chưa tạo hàm smart_slide mà đã bấm Chạy', baiLam: B(['smart_slide(2)']), phaiCoMa: ['ham-chua-co'] },
        cung('Trong smart_slide(s) gọi carry2_by(2) cứng theo ngày 1: sang ngày 2 gặp cặp 3 tấn bị quá tải', B(['smart_slide(2)']), ['qua-tai'], { hamCuaEmMoi: [hSmartSlide(['rail(s)', 'carry2_by(2)'])] })
      ],
      goiY: ['Luna: Thân hàm smart_slide(s) gồm 2 dòng: rail(s) và safe_carry(2).', 'Luna: Nhờ safe_carry(2), hàm smart_slide(s) xử lý được cả chồng hàng nhẹ lẫn chồng hàng nặng.']
    }),

    manTrum({
      so: 2, ten: 'Chế hàm trượt ray nhấc qua rào',
      chinhCoDinh: true,
      taiToiDa: 4,
      taoHam: ['vault_rail'],
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'carry2_by', 'carry_n', 'safe_carry', 'over_wall', 'vault_stack', 'smart_slide'],
      deBai: 'Sola chế hàm thứ hai cho trùm mùa: khi cần trượt ray s ô tới cột có tường rào chắn ở tầm 1 và nhấc n kiện từ tầm 2 qua rào lên tàu bằng vault_stack(n, 2). Hãy chế hàm vault_rail(s, n) gồm rail(s) và vault_stack(n, 2)!',
      veMaMau: 'Viết hàm vault_rail(s, n): gọi rail(s) rồi vault_stack(n, 2).',
      san: [SAN_CANG_RAO4, SAN_CANG_RAO4],
      batDau: { x: 1, y: 3, nac: 2, tam: 1 },
      chong: [
        [CW(2, 4, [[14, 1], [12, 1]]), CW(4, 5, [[28, 2], [26, 2]])],
        [CW(2, 4, [[19, 3], [17, 3]]), CW(4, 5, [[25, 2], [21, 2]])]
      ],
      tau: [tauDon(25, 2), tauDon(31, 2)],
      giao: [
        [{ tau: 0, so: [12, 14, 26, 28] }],
        [{ tau: 0, so: [17, 19, 21, 25] }]
      ],
      maMau: B(['smart_slide(1)', 'vault_rail(2, 2)']),
      loiGiai: B(['smart_slide(1)', 'vault_rail(2, 2)'], { hamCuaEmMoi: [hVaultRail()] }),
      sao: { o: 38, nhip: 56 },
      loiSai: [
        { moTa: 'Chưa tạo hàm vault_rail mà đã bấm Chạy', baiLam: B(['smart_slide(1)', 'vault_rail(2, 2)']), phaiCoMa: ['ham-chua-co'] },
        cung('Trong vault_rail(s, n) trượt cứng rail(1) thay vì rail(s): không tới được cột 4 có hàng sau rào', B(['smart_slide(1)', 'vault_rail(2, 2)']), ['moc-hut'], { hamCuaEmMoi: [hVaultRail(['rail(1)', 'vault_stack(n, 2)'])] })
      ],
      goiY: ['Luna: Thân hàm vault_rail(s, n) gồm 2 dòng: rail(s) và vault_stack(n, 2).', 'Luna: Sau smart_slide(1) ở cột 2, vault_rail(2, 2) đưa R1 sang cột 4 nhấc 2 kiện ở (4, 5) lên tàu.']
    }),

    manTrum({
      so: 3, ten: 'Chế hàm trượt ray vươn qua hố',
      chinhCoDinh: true,
      taiToiDa: 4,
      taoHam: ['belt_rail'],
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'carry2_by', 'carry_n', 'safe_carry', 'over_wall', 'smart_slide'],
      deBai: 'Sola chế tiếp hàm vươn qua hố: khi kiện hàng nằm ở tầm 2 phía sau hố sâu u, R1 cần trượt ray s ô tới cột đó, gọi over_wall(d) nhấc kiện từ tầm 2 lên tàu rồi gọi swing_by(-d) quay cần về hướng cũ. Hãy chế hàm belt_rail(s, d) gồm rail(s), over_wall(d) và swing_by(-d)!',
      veMaMau: 'Viết hàm belt_rail(s, d): gọi rail(s), over_wall(d) rồi swing_by(-d).',
      san: [SAN_CANG_BANG, SAN_CANG_BANG],
      batDau: { x: 1, y: 3, nac: 2, tam: 1 },
      chong: [
        [CW(2, 4, [[14, 1], [12, 1]]), CW(4, 5, [[28, 2]])],
        [CW(2, 4, [[18, 3], [16, 3]]), CW(4, 5, [[24, 2]])]
      ],
      tau: [tauDon(17, 2), tauDon(23, 2)],
      giao: [
        [{ tau: 0, so: [12, 14, 28] }],
        [{ tau: 0, so: [16, 18, 24] }]
      ],
      maMau: B(['smart_slide(1)', 'belt_rail(2, 2)']),
      loiGiai: B(['smart_slide(1)', 'belt_rail(2, 2)'], { hamCuaEmMoi: [hBeltRail()] }),
      sao: { o: 36, nhip: 40 },
      loiSai: [
        { moTa: 'Chưa tạo hàm belt_rail mà đã bấm Chạy', baiLam: B(['smart_slide(1)', 'belt_rail(2, 2)']), phaiCoMa: ['ham-chua-co'] },
        cung('Trong belt_rail(s, d) gọi carry_by(d) ở tầm 1 thay vì over_wall(d) ở tầm 2: móc hụt vì kiện nằm ở (4, 5)', B(['smart_slide(1)', 'belt_rail(2, 2)']), ['moc-hut'], { hamCuaEmMoi: [hBeltRail(['rail(s)', 'carry_by(d)', 'swing_by(-d)'])] })
      ],
      goiY: ['Luna: Thân hàm belt_rail(s, d) gồm 3 dòng: rail(s), over_wall(d) và swing_by(-d).', 'Luna: Sau smart_slide(1) ở cột 2, belt_rail(2, 2) đưa R1 sang cột 4 nhấc kiện hàng ở (4, 5) qua hố sâu lên tàu.']
    }),

    manTrum({
      so: 4, ten: 'Sửa hàm tự chọn tầm bốc',
      chinhCoDinh: true,
      taiToiDa: 4,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'carry2_by', 'carry_n', 'safe_carry', 'over_wall'],
      deBai: 'Hai ngày làm việc: tại mỗi cột, hàng có thể đặt ngay ở tầm 1 (mã khác -1) hoặc nằm ở tầm 2 phía sau bãi trống (mã -1). Hàm port_step() đọc c = read_code(), nếu c != -1 thì gọi safe_carry(2), ngược lại gọi over_wall(2) và swing_by(2). Nhưng nhánh else đang viết nhầm thành over_wall(1)! Hãy sửa lại port_step().',
      veMaMau: 'Sửa over_wall(1) thành over_wall(2) trong hàm port_step().',
      san: [SAN_CANG_1, SAN_CANG_1],
      batDau: { x: 2, y: 3, nac: 2, tam: 1 },
      chong: [
        [CW(2, 4, [[14, 1], [12, 1]]), CW(3, 5, [[25, 2]])],
        [CW(2, 5, [[18, 2]]), CW(3, 4, [[26, 1], [22, 1]])]
      ],
      tau: [tauDon(15, 2), tauDon(15, 2)],
      giao: [
        [{ tau: 0, so: [12, 14, 25] }],
        [{ tau: 0, so: [18, 22, 26] }]
      ],
      maMau: B(['port_step()', 'rail(1)', 'port_step()'], { hamCuaMan: [hPortStep(T_PORT_STEP_SAI)] }),
      loiGiai: B(['port_step()', 'rail(1)', 'port_step()'], { hamCuaMan: [hPortStep(T_PORT_STEP_DUNG)] }),
      sao: { o: 32, nhip: 30 },
      loiSai: [
        { moTa: 'Chưa sửa over_wall(1) thành over_wall(2) nên kiện ở tầm 2 bị xoay sang nấc 1 và hạ trúng đường ray', baiLam: B(['port_step()', 'rail(1)', 'port_step()'], { hamCuaMan: [hPortStep(T_PORT_STEP_SAI)] }), phaiCoMa: ['chua-giao-tau'] },
        cung('Luôn gọi safe_carry(2) theo cột 2 ngày 1: hỏng khi gặp cột có hàng ở tầm 2', B(['port_step()', 'rail(1)', 'port_step()'], { hamCuaMan: [hPortStep(['safe_carry(2)'])] }), ['chua-giao-tau'])
      ],
      goiY: ['Luna: Để đưa kiện từ hướng Nam (nấc 2) lên boong tàu hướng Bắc (nấc 0) cần quay 2 nấc.', 'Luna: Đổi over_wall(1) thành over_wall(2) trong hàm port_step().']
    }),

    manTrum({
      so: 5, ten: 'Chế hàm quét chuỗi cột cảng',
      chinhCoDinh: true,
      taiToiDa: 4,
      taoHam: ['port_sweep'],
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'carry2_by', 'carry_n', 'safe_carry', 'smart_slide'],
      deBai: 'Sola hoàn thiện bộ hàm tổng hợp: hãy chế hàm port_sweep(n) lặp n lần gọi smart_slide(1) để cần cẩu R1 tự động trượt qua n cột liên tiếp và bốc sạch mọi chồng hàng ở mỗi cột!',
      veMaMau: 'Viết hàm port_sweep(n): dùng for i in range(n): gọi smart_slide(1).',
      san: [SAN_CANG_1, SAN_CANG_1],
      batDau: { x: 1, y: 3, nac: 2, tam: 1 },
      chong: [
        [CW(2, 4, [[14, 1], [12, 1]]), CW(3, 4, [[26, 3], [25, 3]]), CW(4, 4, [[34, 1], [32, 1]])],
        [CW(2, 4, [[19, 3], [17, 3]]), CW(3, 4, [[24, 1], [22, 1]]), CW(4, 4, [[38, 1], [36, 1]])]
      ],
      tau: [tauDon(27, 2), tauDon(27, 2)],
      giao: [
        [{ tau: 0, so: [12, 14, 25, 26, 32, 34] }],
        [{ tau: 0, so: [17, 19, 22, 24, 36, 38] }]
      ],
      maMau: B(['port_sweep(3)']),
      loiGiai: B(['port_sweep(3)'], { hamCuaEmMoi: [hPortSweep()] }),
      sao: { o: 29, nhip: 54 },
      loiSai: [
        { moTa: 'Chưa tạo hàm port_sweep mà đã bấm Chạy', baiLam: B(['port_sweep(3)']), phaiCoMa: ['ham-chua-co'] },
        cung('Trong port_sweep(n) chỉ lặp cứng 2 lần thay vì n lần: bỏ sót cột 4', B(['port_sweep(3)']), ['chua-giao-tau'], { hamCuaEmMoi: [hPortSweep(['for i in range(2):', '    smart_slide(1)'])] })
      ],
      goiY: ['Luna: Thân hàm port_sweep(n) gồm 2 dòng: for i in range(n): và smart_slide(1).', 'Luna: Khi gọi port_sweep(3), R1 lần lượt dọn sạch cột 2, cột 3 và cột 4 trên cả hai ngày.']
    }),

    manTrum({
      so: 6, ten: 'Quét hai cột rồi nhấc qua rào',
      taiToiDa: 4,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'carry2_by', 'carry_n', 'safe_carry', 'over_wall', 'vault_stack', 'smart_slide', 'vault_rail', 'port_sweep'],
      deBai: 'Hai ngày làm việc ở bến cảng có tường rào = tại (4, 4): cột 2 và cột 3 có các chồng 2 kiện ở tầm 1, riêng cột 4 có 2 kiện nằm sau rào ở (4, 5). R1 bắt đầu tại (1, 3): hãy gọi port_sweep(2) để dọn cột 2 và cột 3, rồi gọi vault_rail(1, 2) để trượt sang cột 4 nhấc nốt 2 kiện sau rào lên tàu!',
      veMaMau: 'Gọi port_sweep(2) rồi vault_rail(1, 2).',
      san: [SAN_CANG_RAO4, SAN_CANG_RAO4],
      batDau: { x: 1, y: 3, nac: 2, tam: 1 },
      chong: [
        [CW(2, 4, [[14, 1], [12, 1]]), CW(3, 4, [[26, 3], [25, 3]]), CW(4, 5, [[36, 2], [32, 2]])],
        [CW(2, 4, [[18, 3], [16, 3]]), CW(3, 4, [[24, 1], [22, 1]]), CW(4, 5, [[39, 2], [35, 2]])]
      ],
      tau: [tauDon(37, 2), tauDon(37, 2)],
      giao: [
        [{ tau: 0, so: [12, 14, 25, 26, 32, 36] }],
        [{ tau: 0, so: [16, 18, 22, 24, 35, 39] }]
      ],
      maMau: B(['port_sweep(2)']),
      loiGiai: B(['port_sweep(2)', 'vault_rail(1, 2)']),
      sao: { o: 40, nhip: 74 },
      loiSai: [
        cung('Viết cứng carry2_by ở cột 2 theo ngày 1: sang ngày 2 gặp cặp 3 tấn bị quá tải', B(['rail(1)', 'carry2_by(2)', 'swing_by(2)', 'rail(1)', 'carry_n(2, 2)', 'vault_rail(1, 2)']), ['qua-tai']),
        { moTa: 'Quên gọi vault_rail(1, 2) để bốc 2 kiện sau rào ở (4, 5)', baiLam: B(['port_sweep(2)']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: port_sweep(2) đưa R1 quét qua cột 2 và cột 3 rồi dừng ở (3, 3) hướng nấc 2.', 'Luna: Từ (3, 3), gọi vault_rail(1, 2) sẽ trượt sang (4, 3) và bốc 2 kiện ở (4, 5) qua rào lên tàu!']
    }),

    manTrum({
      so: 7, ten: 'Nhấc qua hố sâu rồi lùi quét cột giữa',
      taiToiDa: 4,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'carry2_by', 'carry_n', 'safe_carry', 'over_wall', 'smart_slide', 'belt_rail'],
      deBai: 'Hai ngày làm việc với hố sâu u ở (4, 4) chắn trước kiện hàng tại (4, 5): R1 bắt đầu tại (1, 3), hãy gọi smart_slide(1) để dọn cột 2, tiếp theo gọi belt_rail(2, 2) trượt sang cột 4 nhấc kiện hàng ở (4, 5) lên tàu, rồi gọi smart_slide(-1) lùi về cột 3 bốc nốt chồng hàng ở (3, 4)!',
      veMaMau: 'Gọi smart_slide(1), belt_rail(2, 2) rồi smart_slide(-1).',
      san: [SAN_CANG_BANG, SAN_CANG_BANG],
      batDau: { x: 1, y: 3, nac: 2, tam: 1 },
      chong: [
        [CW(2, 4, [[14, 1], [12, 1]]), CW(3, 4, [[26, 3], [25, 3]]), CW(4, 5, [[38, 2]])],
        [CW(2, 4, [[19, 3], [17, 3]]), CW(3, 4, [[24, 1], [22, 1]]), CW(4, 5, [[35, 2]])]
      ],
      tau: [tauDon(30, 2), tauDon(30, 2)],
      giao: [
        [{ tau: 0, so: [12, 14, 25, 26, 38] }],
        [{ tau: 0, so: [17, 19, 22, 24, 35] }]
      ],
      maMau: B(['smart_slide(1)', 'belt_rail(2, 2)']),
      loiGiai: B([
        'smart_slide(1)',
        'belt_rail(2, 2)',
        'smart_slide(-1)'
      ]),
      sao: { o: 37, nhip: 60 },
      loiSai: [
        cung('Ở cột 3 dùng cứng carry2_by(2) theo ngày 2: ở ngày 1 gặp cặp 3 tấn bị quá tải', B(['smart_slide(1)', 'belt_rail(2, 2)', 'rail(-1)', 'carry2_by(2)']), ['qua-tai']),
        { moTa: 'Quên gọi smart_slide(-1) để lùi về cột 3 bốc chồng hàng ở (3, 4)', baiLam: B(['smart_slide(1)', 'belt_rail(2, 2)']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Sau belt_rail(2, 2), R1 đang đứng ở (4, 3) hướng nấc 2.', 'Luna: Gọi smart_slide(-1) sẽ lùi R1 về (3, 3) và tự động cân tải bốc hết chồng hàng ở (3, 4)!']
    }),

    manTrum({
      so: 8, ten: 'Quét hai cột rồi giải tháp Hà Nội',
      taiToiDa: 4, luatThap: true,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'carry2_by', 'carry_n', 'safe_carry', 'move_tower2', 'smart_slide', 'port_sweep'],
      deBai: 'Hai ngày làm việc với quy tắc Tháp Hà Nội (luatThap = true): cột 2 và cột 3 có các chồng 2 kiện cần dọn sạch lên tàu, còn tháp [30, 10] đặt tại (4, 4) phải chuyển nguyên thứ tự qua cọc phụ (5, 3) ở đầu ray. R1 bắt đầu ở (1, 3): hãy gọi port_sweep(2) để dọn sạch cột 2 và cột 3, rồi trượt rail(1) sang (4, 3) và gọi move_tower2(-1, -2) để chuyển tháp [30, 10] qua cọc phụ bên phải lên tàu!',
      veMaMau: 'Gọi port_sweep(2), sau đó trượt rail(1) và gọi move_tower2(-1, -2).',
      san: [SAN_CANG_COC_PHAI, SAN_CANG_COC_PHAI],
      batDau: { x: 1, y: 3, nac: 2, tam: 1 },
      chong: [
        [CW(2, 4, [[14, 1], [12, 1]]), CW(3, 4, [[25, 3], [26, 3]]), CW(4, 4, [[30, 2], [10, 1]])],
        [CW(2, 4, [[16, 3], [18, 3]]), CW(3, 4, [[24, 1], [22, 1]]), CW(4, 4, [[30, 2], [10, 1]])]
      ],
      tau: [tauDon(33, 2), tauDon(33, 2)],
      giao: [
        [{ tau: 0, so: [10, 12, 14, 25, 26, 30] }],
        [{ tau: 0, so: [10, 16, 18, 22, 24, 30] }]
      ],
      maMau: B(['port_sweep(2)', 'rail(1)']),
      loiGiai: B([
        'port_sweep(2)',
        'rail(1)',
        'move_tower2(-1, -2)'
      ]),
      sao: { o: 38, nhip: 66 },
      loiSai: [
        cung('Dọn cột 3 bằng carry2_by(2) cứng theo ngày 2: ở ngày 1 gặp cặp 3 tấn bị quá tải', B(['smart_slide(1)', 'rail(1)', 'carry2_by(2)', 'swing_by(2)', 'rail(1)', 'move_tower2(-1, -2)']), ['qua-tai']),
        { moTa: 'Quên gọi move_tower2(-1, -2) sau khi trượt sang cột 4', baiLam: B(['port_sweep(2)', 'rail(1)']), phaiCoMa: ['chua-giao-tau'] },
        { moTa: 'Gọi move_tower2(1, 2) nên mượn cọc phụ bên trái (3, 3) là đường ray', baiLam: B(['port_sweep(2)', 'rail(1)', 'move_tower2(1, 2)']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Khi R1 đứng ở (4, 3) hướng nấc 2, ô bên trái (3, 3) là đường ray, không đặt hàng được. Cọc phụ là ô (5, 3) bên phải ở nấc 1, nên d1 = -1.', 'Luna: Sau port_sweep(2), chỉ cần gọi rail(1) và move_tower2(-1, -2)!']
    }),

    manTrum({
      so: 9, ten: 'Ba ngày phân loại rồi cân tải hai tàu',
      taiToiDa: 4,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'carry2_by', 'carry_n', 'safe_carry', 'rail_drop', 'scan_rail', 'smart_slide'],
      deBai: 'Ba ngày làm việc với hai tàu neo ở cột 2 (Tàu 1, mã 1x) và cột 4 (Tàu 2, mã 2x)! Trên cầu cảng giữa (3, 2) có chồng 2 kiện trộn lẫn mã 1x và 2x, còn tại (4, 4) có chồng 2 kiện cho Tàu 2 (nặng hoặc nhẹ tùy ngày). R1 bắt đầu ở (3, 3) hướng nấc 0: hãy gọi scan_rail() để phân loại chồng hàng ở (3, 2) sang hai tàu, rồi quay swing_by(2) và gọi smart_slide(1) để dọn nốt cột 4 lên Tàu 2!',
      veMaMau: 'Gọi scan_rail(), quay swing_by(2) rồi gọi smart_slide(1).',
      san: [SAN_CANG_2, SAN_CANG_2, SAN_CANG_2],
      batDau: { x: 3, y: 3, nac: 0, tam: 1 },
      chong: [
        [CW(3, 2, [[18, 2], [24, 2]]), CW(4, 4, [[26, 1], [22, 1]])],
        [CW(3, 2, [[28, 2], [16, 2]]), CW(4, 4, [[29, 3], [25, 3]])],
        [CW(3, 2, [[19, 2], [15, 2]]), CW(4, 4, [[27, 1], [21, 1]])]
      ],
      tau: [tauDoi(15, 2), tauDoi(21, 2), tauDoi(15, 2)],
      giao: [
        [{ tau: 0, so: [18] }, { tau: 1, so: [22, 24, 26] }],
        [{ tau: 0, so: [16] }, { tau: 1, so: [25, 28, 29] }],
        [{ tau: 0, so: [15, 19] }, { tau: 1, so: [21, 27] }]
      ],
      maMau: B(['scan_rail()', 'swing_by(2)']),
      loiGiai: B([
        'scan_rail()',
        'swing_by(2)',
        'smart_slide(1)'
      ]),
      sao: { o: 41, nhip: 57 },
      loiSai: [
        cung('Ở cột 3 gọi cứng rail_drop(1) rồi rail_drop(-1) theo ngày 1: sang ngày 2 kiện 16 ở trên bị giao nhầm sang Tàu 2', B(['rail_drop(1)', 'rail_drop(-1)', 'swing_by(2)', 'smart_slide(1)']), ['giao-nham']),
        { moTa: 'Quên gọi smart_slide(1) để dọn chồng hàng ở (4, 4) lên Tàu 2', baiLam: B(['scan_rail()', 'swing_by(2)']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: scan_rail() phân loại xong chồng hàng ở (3, 2) thì đầu cần vẫn ở (3, 3) hướng nấc 0.', 'Luna: Quay swing_by(2) về nấc 2 rồi gọi smart_slide(1) để trượt sang cột 4 bốc chồng hàng ở (4, 4) lên Tàu 2.']
    }),

    manTrum({
      so: 10, ten: 'Trùm mùa cảng sông',
      taiToiDa: 4,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'carry2_by', 'carry_n', 'safe_carry', 'over_wall', 'vault_stack', 'smart_slide', 'vault_rail', 'belt_rail'],
      deBai: 'Trùm cuối Mùa 4 Cảng sông trên ba ngày làm việc! Dọc bến cảng lớn: cột 2 có chồng 2 kiện ở tầm 1 (thay đổi nặng/nhẹ mỗi ngày), cột 3 có rào chắn = tại (3, 4) trước 2 kiện ở (3, 5), còn cột 5 có hố sâu u tại (5, 4) trước kiện hàng cuối cùng ở (5, 5)! R1 bắt đầu ở (1, 3): hãy gọi smart_slide(1) dọn cột 2, gọi vault_rail(1, 2) sang cột 3 nhấc 2 kiện sau rào, rồi gọi belt_rail(2, 2) sang cột 5 nhấc kiện hàng qua hố sâu giao lên tàu!',
      veMaMau: 'Kết hợp smart_slide(1), vault_rail(1, 2) và belt_rail(2, 2) để hoàn thành đại thử thách Cảng sông!',
      san: [SAN_CANG_DAI, SAN_CANG_DAI, SAN_CANG_DAI],
      batDau: { x: 1, y: 3, nac: 2, tam: 1 },
      chong: [
        [CW(2, 4, [[14, 1], [12, 1]]), CW(3, 5, [[26, 2], [22, 2]]), CW(5, 5, [[38, 2]])],
        [CW(2, 4, [[18, 3], [16, 3]]), CW(3, 5, [[28, 2], [24, 2]]), CW(5, 5, [[35, 2]])],
        [CW(2, 4, [[19, 3], [11, 3]]), CW(3, 5, [[29, 2], [25, 2]]), CW(5, 5, [[39, 2]])]
      ],
      tau: [tauDai(34, 2), tauDai(39, 2), tauDai(39, 2)],
      giao: [
        [{ tau: 0, so: [12, 14, 22, 26, 38] }],
        [{ tau: 0, so: [16, 18, 24, 28, 35] }],
        [{ tau: 0, so: [11, 19, 25, 29, 39] }]
      ],
      maMau: B(['smart_slide(1)', 'vault_rail(1, 2)']),
      loiGiai: B([
        'smart_slide(1)',
        'vault_rail(1, 2)',
        'belt_rail(2, 2)'
      ]),
      sao: { o: 42, nhip: 112 },
      loiSai: [
        cung('Ở cột 2 gọi cứng carry2_by(2) theo ngày 1: hỏng ở ngày 2 và ngày 3 khi gặp cặp 3 tấn (quá tải)', B(['rail(1)', 'carry2_by(2)', 'swing_by(2)', 'vault_rail(1, 2)', 'belt_rail(2, 2)']), ['qua-tai']),
        { moTa: 'Quên gọi belt_rail(2, 2) ở bước cuối để bốc kiện hàng ở cột 5', baiLam: B(['smart_slide(1)', 'vault_rail(1, 2)']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: smart_slide(1) dọn sạch cột 2, vault_rail(1, 2) sang cột 3 nhấc 2 kiện sau tường rào.', 'Luna: Cuối cùng gọi belt_rail(2, 2) để trượt 2 ô sang cột 5 nhấc kiện hàng qua hố sâu lên tàu!']
    })
  ];

  ManHoc.manTrumMuaCang = DS;
})();
