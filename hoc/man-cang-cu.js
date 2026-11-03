/* ============================================================================
   man-cang-cu.js — "Robot Chấn Hưng": GÓI 8 MÙA 4 "CẢNG SÔNG" (BÃI CẢNG CŨ)
   Gồm 20 màn mới trên Cần cẩu R1 đầy đủ gặp yếu tố mùa 1–3 (#, =, u, C, H):
   - cang-cu.1..10     (10 màn chương cang-cu "Bãi cảng cũ")
   - che-cang-cu.1..10 (10 màn chương che-cang-cu "Chế lệnh: vượt chướng ngại cũ")
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var HAM_CU = ['swing_left', 'swing_right', 'extend', 'retract', 'pick_up', 'set_down', 'pick_up2', 'read_code', 'weight', 'rail', 'wait'];
  var ROBOT_CU = { than: 'cau', tay: 'moc-cau', camBien: [{ ma: 'quet-ma', o: 'tren' }] };
  var CAU_TRUC = ['for', 'if', 'while', 'list'];

  var SAN_CU_1 = [
    '~~~~~~~',
    '~~~~~~~',
    '~DTTTD~',
    '.RRRRR.',
    '.#=u=#.',
    '.DDDDD.',
    '.......'
  ];

  var SAN_CU_2 = [
    '~~~~~~~',
    '~~~~~~~',
    '~TTDTT~',
    '.RRRRR.',
    '.=CuH=.',
    '.DDDDD.',
    '.......'
  ];

  var SAN_CU_3 = [
    '~~~~~~~',
    '~~~~~~~',
    '~DTTTD~',
    '.RRRRR.',
    '.=CDH=.',
    '.DDDDD.',
    '.......'
  ];

  var O_TAU_1 = [{ x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 }];
  var O_TAU_TRAI = [{ x: 1, y: 2 }, { x: 2, y: 2 }];
  var O_TAU_PHAI = [{ x: 4, y: 2 }, { x: 5, y: 2 }];

  function tauDon(co, vang, pha) {
    var t = { o: O_TAU_1, co: co, vang: vang };
    if (pha) t.pha = pha;
    return [t];
  }
  function tauDoi(co, vang, pha0, pha1) {
    var t0 = { o: O_TAU_TRAI, co: co, vang: vang };
    var t1 = { o: O_TAU_PHAI, co: co, vang: vang };
    if (pha0) t0.pha = pha0;
    if (pha1) t1.pha = pha1;
    return [t0, t1];
  }

  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function bai(chinh, phu) {
    var kq = { chinh: chinh.slice() };
    if (phu && phu.hamCuaMan) kq.hamCuaMan = phu.hamCuaMan;
    if (phu && phu.hamCuaEmMoi) kq.hamCuaEmMoi = phu.hamCuaEmMoi;
    return kq;
  }

  function CW(x, y, ds) {
    return {
      x: x, y: y,
      cont: ds.map(function (p) { return { so: p[0], tan: p[1] }; })
    };
  }

  // Các hàm chế ở Gói 8 chương che-cang-cu
  var T_REACH_PICK = [
    'reach_by(dr)',
    'pick_up()',
    'reach_by(-dr)'
  ];
  var T_OVER_WALL = [
    'extend()',
    'pick_up()',
    'retract()',
    'swing_by(d)',
    'set_down()'
  ];
  var T_OVER_WALL2 = [
    'extend()',
    'pick_up2()',
    'retract()',
    'swing_by(d)',
    'set_down()'
  ];
  var T_SAFE_OVER = [
    'extend()',
    'safe_lift()',
    'retract()',
    'swing_by(d)',
    'set_down()'
  ];
  var T_VAULT_STACK = [
    'for i in range(n):',
    '    over_wall(d)',
    '    swing_by(-d)'
  ];
  var T_OLD_SWEEP_SAI = [
    'for i in range(n):',
    '    rail(1)',
    '    extend()',
    '    pick_up()',
    '    swing_by(4)',
    '    set_down()',
    '    retract()',
    '    swing_by(4)'
  ];
  var T_OLD_SWEEP_DUNG = [
    'for i in range(n):',
    '    rail(1)',
    '    extend()',
    '    pick_up()',
    '    retract()',
    '    swing_by(4)',
    '    set_down()',
    '    swing_by(4)'
  ];

  function hReachPick(than) { return H('reach_pick', ['dr'], than || T_REACH_PICK); }
  function hOverWall(than) { return H('over_wall', ['d'], than || T_OVER_WALL); }
  function hOverWall2(than) { return H('over_wall2', ['d'], than || T_OVER_WALL2); }
  function hSafeOver(than) { return H('safe_over', ['d'], than || T_SAFE_OVER); }
  function hVaultStack(than) { return H('vault_stack', ['n', 'd'], than || T_VAULT_STACK); }
  function hOldSweep(than) { return H('old_sweep', ['n'], than || T_OLD_SWEEP_DUNG); }

  function manCangCu(cfg) {
    return ManHoc.chuanHoa(Object.assign({
      chuong: 'cang-cu',
      loaiRobot: 'cau',
      robot: ROBOT_CU,
      vo: 'cang',
      hamGoc: HAM_CU,
      cauTruc: CAU_TRUC,
      khung: { chinh: 10, moiHam: 10 },
      moXuong: true,
      mucTieu: 'giao-tau',
      taiToiDa: 6,
      hamCuaEmCan: [],
      taoHam: []
    }, cfg));
  }

  function manCheCangCu(cfg) {
    return ManHoc.chuanHoa(Object.assign({
      chuong: 'che-cang-cu',
      loaiRobot: 'cau',
      robot: ROBOT_CU,
      vo: 'cang',
      hamGoc: HAM_CU,
      cauTruc: CAU_TRUC,
      khung: { chinh: 10, moiHam: 10 },
      moXuong: true,
      mucTieu: 'giao-tau',
      taiToiDa: 6,
      hamCuaEmCan: [],
      taoHam: []
    }, cfg));
  }

  var DS = [
    /* ========================================================================
       CHƯƠNG 1: cang-cu (10 màn) — Bãi cảng cũ
       ======================================================================== */
    manCangCu({
      so: 1, ten: 'Vươn cần qua hố sâu', hang: 'lam-quen',
      chiChay: true, chinhCoDinh: true,
      taiToiDa: 6,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by'],
      deBai: 'Sola làm mẫu: ở khu bãi cảng cũ còn sót lại tường đá #, hàng rào = và hố sâu u của các mùa trước. Cần cẩu vươn cao nên quay và vươn qua tường, rào, hố không hề bị chặn, chỉ không thể hạ container xuống các ô đó! Bấm Chạy để xem cần cẩu vươn qua hố u ở (3, 4) lấy kiện 15 ở (3, 5) rồi thu về giao lên tàu.',
      veMaMau: 'Chương trình mẫu đã khóa. Bấm Chạy để xem cần cẩu vươn qua hố sâu u nhấc container.',
      san: SAN_CU_1,
      batDau: { x: 3, y: 3, nac: 4, tam: 1 },
      chong: [CW(3, 5, [[15, 1]])],
      tau: tauDon(8, 2),
      giao: [{ tau: 0, so: [15] }],
      maMau: bai(['extend()', 'pick_up()', 'retract()', 'swing_by(4)', 'set_down()']),
      loiGiai: bai(['extend()', 'pick_up()', 'retract()', 'swing_by(4)', 'set_down()']),
      sao: { o: 11, nhip: 8 },
      loiSai: [],
      goiY: ['Luna: Bấm nút Chạy để quan sát cần cẩu vươn qua hố sâu u ở (3, 4) và nhấc kiện 15 ở (3, 5).', 'Luna: Sau khi nhấc ở tầm 2, cần cẩu gọi retract() về tầm 1 để hạ xuống boong tàu ở (3, 2).']
    }),

    manCangCu({
      so: 2, ten: 'Nhấc đôi sau hàng rào', hang: 'lam-quen',
      taiToiDa: 4,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by'],
      deBai: 'Sola nhờ bạn: bệ cẩu ở (2, 3) hướng nấc 4, ngay trước mặt ở (2, 4) là hàng rào sắt =. Phía sau hàng rào tại (2, 5) có 2 kiện 1 tấn [22, 11]. Với taiToiDa = 4, hãy vươn cần extend() qua rào, gọi pick_up2() nhấc đôi cả 2 kiện, thu cần retract(), quay swing_by(4) rồi set_down() lên tàu ở (2, 2).',
      veMaMau: 'Hoàn thiện bước thu cần, quay về nấc 0 và hạ xuống tàu.',
      san: SAN_CU_1,
      batDau: { x: 2, y: 3, nac: 4, tam: 1 },
      chong: [CW(2, 5, [[22, 1], [11, 1]])],
      tau: tauDon(8, 2),
      giao: [{ tau: 0, so: [11, 22] }],
      maMau: bai(['extend()', 'pick_up2()']),
      loiGiai: bai(['extend()', 'pick_up2()', 'retract()', 'swing_by(4)', 'set_down()']),
      sao: { o: 11, nhip: 8 },
      loiGiaiKhac: {
        moTa: 'Dùng swing_by(-4) để quay về nấc 0',
        baiLam: bai(['extend()', 'pick_up2()', 'retract()', 'swing_by(-4)', 'set_down()'])
      },
      loiSai: [
        { moTa: 'Mới nhấc đôi ở (2, 5), chưa thu cần và quay về tàu để hạ', baiLam: bai(['extend()', 'pick_up2()']), phaiCoMa: ['chua-giao-tau'] },
        { moTa: 'Hạ nhầm xuống hàng rào = ở (2, 4) trước khi quay về tàu', baiLam: bai(['extend()', 'pick_up2()', 'retract()', 'set_down()']), phaiCoMa: ['ha-bi-chan'] }
      ],
      goiY: ['Luna: Sau extend() và pick_up2(), gọi retract() để thu đầu cần về tầm 1.', 'Luna: Tiếp theo gọi swing_by(4) và set_down() để hạ cặp kiện xuống boong tàu (2, 2).']
    }),

    manCangCu({
      so: 3, ten: 'Trượt ray tránh tường đá', hang: 'lam-quen',
      taiToiDa: 6,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by'],
      deBai: 'Sola chỉ dẫn: bệ cẩu ở (1, 3) hướng nấc 4, phía sau tường đá # ở (1, 4) là kiện 18 (2 tấn) tại (1, 5). Hãy vươn cần extend() qua tường đá nhấc kiện 18, thu cần retract(), trượt rail(1) sang cột 2 rồi quay swing_by(4) và set_down() giao lên tàu ở (2, 2).',
      veMaMau: 'Sau khi nhấc và thu cần ở cột 1, hãy trượt ray sang cột 2 rồi quay giao lên tàu.',
      san: SAN_CU_1,
      batDau: { x: 1, y: 3, nac: 4, tam: 1 },
      chong: [CW(1, 5, [[18, 2]])],
      tau: tauDon(9, 2),
      giao: [{ tau: 0, so: [18] }],
      maMau: bai(['extend()', 'pick_up()', 'retract()']),
      loiGiai: bai(['extend()', 'pick_up()', 'retract()', 'rail(1)', 'swing_by(4)', 'set_down()']),
      sao: { o: 12, nhip: 9 },
      loiGiaiKhac: {
        moTa: 'Quay cần về nấc 0 trước khi trượt rail(1) sang cột 2',
        baiLam: bai(['extend()', 'pick_up()', 'retract()', 'swing_by(4)', 'rail(1)', 'set_down()'])
      },
      loiSai: [
        { moTa: 'Quên gọi rail(1) nên hạ xuống bãi (1, 2) thay vì boong tàu (2, 2)', baiLam: bai(['extend()', 'pick_up()', 'retract()', 'swing_by(4)', 'set_down()']), phaiCoMa: ['chua-giao-tau'] },
        { moTa: 'Hạ nhầm xuống tường đá # ở (1, 4)', baiLam: bai(['extend()', 'pick_up()', 'retract()', 'set_down()']), phaiCoMa: ['ha-bi-chan'] }
      ],
      goiY: ['Luna: Ô (1, 2) chỉ là bãi cảng, còn boong tàu bắt đầu từ cột 2 tại (2, 2).', 'Luna: Sau retract(), gọi rail(1), swing_by(4) rồi set_down().']
    }),

    manCangCu({
      so: 4, ten: 'Bốc kiện nặng sau cửa sắt', hang: 'luyen',
      taiToiDa: 6,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by'],
      deBai: 'Sola báo: trên bãi cảng cũ có cánh cửa sắt C đóng kín ở (2, 4) và thùng nặng H ở (4, 4). Bệ cẩu ở (2, 3) hướng nấc 4 tầm 2, ngay trên kiện 24 (3 tấn) ở (2, 5). Hãy nhấc kiện 24, thu cần retract(), trượt rail(2) sang cột 4, quay swing_by(4) rồi set_down() lên Tàu 2 ở (4, 2).',
      veMaMau: 'Nhấc kiện 24 ở (2, 5), thu cần về tầm 1 rồi trượt sang cột 4 giao cho Tàu 2.',
      san: SAN_CU_2,
      batDau: { x: 2, y: 3, nac: 4, tam: 2 },
      chong: [CW(2, 5, [[24, 3]])],
      tau: tauDoi(9, 2),
      giao: [{ tau: 1, so: [24] }],
      maMau: bai(['pick_up()', 'retract()']),
      loiGiai: bai(['pick_up()', 'retract()', 'rail(2)', 'swing_by(4)', 'set_down()']),
      sao: { o: 11, nhip: 9 },
      loiGiaiKhac: {
        moTa: 'Quay về nấc 0 trước rồi trượt rail(2) sang Tàu 2',
        baiLam: bai(['pick_up()', 'retract()', 'swing_by(4)', 'rail(2)', 'set_down()'])
      },
      loiSai: [
        { moTa: 'Hạ nhầm xuống Tàu 1 ở (2, 2) mà chưa trượt rail(2) sang Tàu 2', baiLam: bai(['pick_up()', 'retract()', 'swing_by(4)', 'set_down()', 'wait()', 'wait()']), phaiCoMa: ['giao-nham'] },
        { moTa: 'Hạ nhầm xuống cánh cửa đóng C ở (2, 4)', baiLam: bai(['pick_up()', 'retract()', 'set_down()']), phaiCoMa: ['ha-bi-chan'] }
      ],
      goiY: ['Luna: Kiện 24 thuộc đơn hàng của Tàu 2 ở cột 4.', 'Luna: Sau pick_up() và retract(), gọi rail(2), swing_by(4) rồi set_down().']
    }),

    manCangCu({
      so: 5, ten: 'Bãi trung chuyển giữa cảng', hang: 'luyen',
      taiToiDa: 4,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry2_by'],
      deBai: 'Sola thử thách: trên bãi cảng có cửa C ở (2, 4), thùng nặng H ở (4, 4), chỉ riêng ô (3, 4) là bãi trống D. Tại (3, 5) có 2 kiện 2 tấn [26, 16] và taiToiDa = 4. Ở tầm 2 không thể nhấc đôi (4 * 2 = 8 > 4), nên hãy lặp 2 lần vươn ra (3, 5) nhấc từng kiện thu về đặt tạm xuống bãi trống (3, 4), rồi gọi carry2_by(4) bốc đôi cả 2 kiện từ (3, 4) lên tàu!',
      veMaMau: 'Hoàn thiện vòng lặp gom 2 kiện từ (3, 5) về (3, 4), rồi gọi carry2_by(4).',
      san: SAN_CU_3,
      batDau: { x: 3, y: 3, nac: 4, tam: 1 },
      chong: [CW(3, 5, [[26, 2], [16, 2]])],
      tau: tauDon(14, 2),
      giao: [{ tau: 0, so: [16, 26] }],
      maMau: bai([
        'for i in range(2):',
        '    extend()',
        '    pick_up()',
        '    retract()'
      ]),
      loiGiai: bai([
        'for i in range(2):',
        '    extend()',
        '    pick_up()',
        '    retract()',
        '    set_down()',
        'carry2_by(4)'
      ]),
      sao: { o: 15, nhip: 14 },
      loiGiaiKhac: {
        moTa: 'Dùng carry2_by(-4) ở bước cuối',
        baiLam: bai([
          'for i in range(2):',
          '    extend()',
          '    pick_up()',
          '    retract()',
          '    set_down()',
          'carry2_by(-4)'
        ])
      },
      loiSai: [
        { moTa: 'Cố gọi pick_up2() ở tầm 2 khiến tải trọng 4 * 2 = 8 > 4 bị quá tải', baiLam: bai(['extend()', 'pick_up2()', 'retract()', 'swing_by(4)', 'set_down()']), phaiCoMa: ['qua-tai'] },
        { moTa: 'Quên gọi carry2_by(4) sau khi gom 2 kiện về bãi trung chuyển (3, 4)', baiLam: bai(['for i in range(2):', '    extend()', '    pick_up()', '    retract()', '    set_down()']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Trong vòng lặp for, sau retract() hãy gọi set_down() để đặt từng kiện xuống bãi trống (3, 4).', 'Luna: Sau vòng lặp, cả 2 kiện đã ở tầm 1 tại (3, 4), gọi carry2_by(4) để nhấc đôi lên tàu (3, 2).']
    }),

    manCangCu({
      so: 6, ten: 'Phân loại hàng qua hố sâu', hang: 'luyen',
      taiToiDa: 6,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by'],
      deBai: 'Sola hướng dẫn: trên hai sân, bệ cẩu ở (3, 3) hướng nấc 4 tầm 1, phía trước là hố sâu u ở (3, 4) và kiện hàng ở (3, 5). Hãy vươn extend() qua hố, lưu c = read_code(), nhấc pick_up(), thu retract(), quay swing_by(4) về nấc 0: nếu c // 10 == 1 thì trượt rail(-1) sang Tàu 1, ngược lại trượt rail(1) sang Tàu 2, rồi gọi set_down().',
      veMaMau: 'Hoàn thiện nhánh else để trượt sang Tàu 2 và hạ container xuống boong tàu.',
      san: [SAN_CU_2, SAN_CU_2],
      batDau: [{ x: 3, y: 3, nac: 4, tam: 1 }, { x: 3, y: 3, nac: 4, tam: 1 }],
      chong: [
        [CW(3, 5, [[14, 2]])],
        [CW(3, 5, [[25, 2]])]
      ],
      tau: [tauDoi(9, 2), tauDoi(9, 2)],
      giao: [
        [{ tau: 0, so: [14] }],
        [{ tau: 1, so: [25] }]
      ],
      maMau: bai([
        'extend()',
        'c = read_code()',
        'pick_up()',
        'retract()',
        'swing_by(4)',
        't = c // 10',
        'if t == 1:',
        '    rail(-1)'
      ]),
      loiGiai: bai([
        'extend()',
        'c = read_code()',
        'pick_up()',
        'retract()',
        'swing_by(4)',
        't = c // 10',
        'if t == 1:',
        '    rail(-1)',
        'else:',
        '    rail(1)',
        'set_down()'
      ]),
      sao: { o: 16, nhip: 9 },
      loiGiaiKhac: {
        moTa: 'Kiểm tra nhánh c // 10 == 2 trước',
        baiLam: bai([
          'extend()',
          'c = read_code()',
          'pick_up()',
          'retract()',
          'swing_by(4)',
          't = c // 10',
          'if t == 2:',
          '    rail(1)',
          'else:',
          '    rail(-1)',
          'set_down()'
        ])
      },
      loiSai: [
        { moTa: 'Luôn trượt rail(-1) sang Tàu 1 nên ở sân 2 giao nhầm kiện 25', baiLam: bai(['extend()', 'pick_up()', 'retract()', 'swing_by(4)', 'rail(-1)', 'set_down()']), phaiCoMa: ['giao-nham'] },
        { moTa: 'Quên gọi set_down() sau khi trượt ray tới tàu', baiLam: bai(['extend()', 'c = read_code()', 'pick_up()', 'retract()', 'swing_by(4)', 't = c // 10', 'if t == 1:', '    rail(-1)', 'else:', '    rail(1)']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Sau khi thu cần và quay về nấc 0 ở cột 3, kiểm tra c // 10 == 1 để trượt rail(-1) sang Tàu 1 hoặc rail(1) sang Tàu 2.', 'Luna: Cuối cùng gọi set_down() để hạ kiện hàng xuống boong tàu.']
    }),

    manCangCu({
      so: 7, ten: 'Quét dọc dãy rào chắn', hang: 'bien-the',
      taiToiDa: 4,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by'],
      deBai: 'Sola giao việc: bệ cẩu ở (1, 3) hướng nấc 4 tầm 1. Dọc 3 cột 2, 3, 4 phía sau hàng rào = và hố sâu u (tức tại (2, 5), (3, 5), (4, 5)), mỗi cột có 2 kiện 1 tấn. Hãy lặp 3 lần: trượt rail(1), vươn extend(), nhấc đôi pick_up2(), thu retract(), quay swing_by(4), hạ set_down() lên tàu rồi quay swing_by(4) về nấc 4.',
      veMaMau: 'Dùng vòng lặp for i in range(3) để bốc gọn 3 cặp kiện qua rào và hố.',
      san: SAN_CU_1,
      batDau: { x: 1, y: 3, nac: 4, tam: 1 },
      chong: [
        CW(2, 5, [[12, 1], [11, 1]]),
        CW(3, 5, [[22, 1], [21, 1]]),
        CW(4, 5, [[32, 1], [31, 1]])
      ],
      tau: tauDon(39, 2),
      giao: [{ tau: 0, so: [11, 12, 21, 22, 31, 32] }],
      maMau: bai([
        'for i in range(3):',
        '    rail(1)',
        '    extend()',
        '    pick_up2()'
      ]),
      loiGiai: bai([
        'for i in range(3):',
        '    rail(1)',
        '    extend()',
        '    pick_up2()',
        '    retract()',
        '    swing_by(4)',
        '    set_down()',
        '    swing_by(4)'
      ]),
      sao: { o: 14, nhip: 39 },
      loiGiaiKhac: {
        moTa: 'Dùng swing_by(-4) khi quay cần',
        baiLam: bai([
          'for i in range(3):',
          '    rail(1)',
          '    extend()',
          '    pick_up2()',
          '    retract()',
          '    swing_by(-4)',
          '    set_down()',
          '    swing_by(-4)'
        ])
      },
      loiSai: [
        { moTa: 'Chỉ lặp 2 cột nên bỏ sót cặp kiện ở cột 4', baiLam: bai(['for i in range(2):', '    rail(1)', '    extend()', '    pick_up2()', '    retract()', '    swing_by(4)', '    set_down()', '    swing_by(4)']), phaiCoMa: ['chua-giao-tau'] },
        { moTa: 'Quên gọi retract() nên hạ container ở tầm 2 rơi xuống mặt nước (x, 1)', baiLam: bai(['for i in range(3):', '    rail(1)', '    extend()', '    pick_up2()', '    swing_by(4)', '    set_down()', '    retract()', '    swing_by(4)']), phaiCoMa: ['ha-bi-chan'] }
      ],
      goiY: ['Luna: Sau pick_up2() ở tầm 2, phải gọi retract() về tầm 1 trước khi quay và hạ xuống tàu.', 'Luna: Cuối mỗi vòng lặp nhớ gọi swing_by(4) để đưa cần về lại nấc 4 cho cột kế tiếp.']
    }),

    manCangCu({
      so: 8, ten: 'Cân tải sau thùng sắt', hang: 'bien-the',
      taiToiDa: 4,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'reach_by', 'aim_crane', 'haul_to'],
      deBai: 'Sola lưu ý: trên hai sân với taiToiDa = 4, bệ cẩu ở (4, 3) hướng nấc 4 tầm 2, vươn qua thùng nặng H ở (4, 4) tới chồng 2 kiện ở (4, 5). Ở tầm 2, nếu weight() == 1 thì nhấc đôi pick_up2() chỉ tốn tải (1 + 1) * 2 = 4 <= 4; nhưng nếu weight() == 2 thì phải lặp 2 lần gọi haul_to(4, -1) và aim_crane(4, 1) để chuyển đơn từng kiện! Hãy dùng if weight() == 1 để xử lý cả hai sân.',
      veMaMau: 'Kiểm tra weight() == 1 ở tầm 2 để chọn nhấc đôi hoặc lặp 2 lần chuyển đơn.',
      san: [SAN_CU_2, SAN_CU_2],
      batDau: [{ x: 4, y: 3, nac: 4, tam: 2 }, { x: 4, y: 3, nac: 4, tam: 2 }],
      chong: [
        [CW(4, 5, [[22, 1], [21, 1]])],
        [CW(4, 5, [[28, 2], [26, 2]])]
      ],
      tau: [tauDoi(7, 2), tauDoi(24, 2)],
      giao: [
        [{ tau: 1, so: [21, 22] }],
        [{ tau: 1, so: [26, 28] }]
      ],
      maMau: bai([
        'w = weight()',
        'if w == 1:',
        '    pick_up2()',
        '    retract()',
        '    swing_by(4)',
        '    set_down()'
      ]),
      loiGiai: bai([
        'w = weight()',
        'if w == 1:',
        '    pick_up2()',
        '    retract()',
        '    swing_by(4)',
        '    set_down()',
        'else:',
        '    for i in range(2):',
        '        haul_to(4, -1)',
        '        aim_crane(4, 1)'
      ]),
      sao: { o: 26, nhip: 24 },
      loiSai: [
        { moTa: 'Luôn gọi pick_up2() ở tầm 2 nên sân 2 gặp cặp 2 tấn bị quá tải (4 * 2 = 8 > 4)', baiLam: bai(['pick_up2()', 'retract()', 'swing_by(4)', 'set_down()']), phaiCoMa: ['qua-tai'] },
        { moTa: 'Luôn nhấc đơn 2 chuyến nên ở sân 1 tàu rời bến nhịp 7 không kịp giao kiện thứ hai', baiLam: bai(['for i in range(2):', '    haul_to(4, -1)', '    aim_crane(4, 1)']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Sân 1 tàu rời ở nhịp 7 nên cặp 1 tấn phải bốc đôi mới kịp.', 'Luna: Trong nhánh else, lặp 2 lần: haul_to(4, -1) để bốc lên tàu rồi aim_crane(4, 1) để vươn lại ra (4, 5).']
    }),

    manCangCu({
      so: 9, ten: 'Chuyển tháp qua cửa đóng', hang: 'bien-the',
      taiToiDa: 6, luatThap: true,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by'],
      deBai: 'Sola thử tài: trên sân có luật tháp (luatThap = true), tại (3, 5) phía sau bãi trống (3, 4) là tháp 2 tầng [20, 10] (kiện 10 ở trên, kiện 20 ở dưới). Hai bên (2, 4) và (4, 4) đều bị chắn bởi cửa C và thùng H, nên chỉ có ô (3, 4) làm cọc trung gian! Hãy đưa kiện 10 về đặt tạm ở (3, 4), đưa kiện 20 từ (3, 5) thẳng lên tàu (3, 2), rồi chuyển kiện 10 từ (3, 4) chồng lên 20 ở (3, 2).',
      veMaMau: 'Dùng ô bãi trống (3, 4) làm trung gian để giữ đúng thứ tự [20, 10] trên tàu.',
      san: SAN_CU_3,
      batDau: { x: 3, y: 3, nac: 4, tam: 2 },
      chong: [CW(3, 5, [[20, 2], [10, 1]])],
      tau: tauDon(21, 2),
      giao: [{ tau: 0, so: [10, 20] }],
      maMau: bai(['pick_up()', 'retract()', 'set_down()', 'extend()']),
      loiGiai: bai([
        'pick_up()',
        'retract()',
        'set_down()',
        'extend()',
        'pick_up()',
        'retract()',
        'swing_by(4)',
        'set_down()',
        'swing_by(4)',
        'carry_by(4)'
      ]),
      sao: { o: 19, nhip: 21 },
      loiGiaiKhac: {
        moTa: 'Dùng swing_by(-4) khi quay cần',
        baiLam: bai([
          'pick_up()',
          'retract()',
          'set_down()',
          'extend()',
          'pick_up()',
          'retract()',
          'swing_by(-4)',
          'set_down()',
          'swing_by(-4)',
          'carry_by(4)'
        ])
      },
      loiSai: [
        { moTa: 'Bỏ qua cọc trung gian (3, 4) nên đặt kiện 20 lên trên kiện 10 vi phạm luật tháp', baiLam: bai(['pick_up()', 'retract()', 'swing_by(4)', 'set_down()', 'swing_by(4)', 'extend()', 'pick_up()', 'retract()', 'swing_by(4)', 'set_down()']), phaiCoMa: ['thap-sai'] },
        { moTa: 'Mới giao kiện 20 lên tàu, quên đưa kiện 10 từ (3, 4) lên theo', baiLam: bai(['pick_up()', 'retract()', 'set_down()', 'extend()', 'pick_up()', 'retract()', 'swing_by(4)', 'set_down()']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Sau khi đặt tạm kiện 10 ở (3, 4) và vươn extend() ra (3, 5), hãy nhấc kiện 20, retract(), swing_by(4), set_down() lên tàu (3, 2).', 'Luna: Cuối cùng gọi swing_by(4) về nấc 4 (tầm 1 đang trỏ vào kiện 10 ở (3, 4)) rồi gọi carry_by(4) để đặt 10 lên đỉnh 20.']
    }),

    manCangCu({
      so: 10, ten: 'Trùm Bãi cảng cũ', hang: 'trum', nhipTheo: 'tong',
      taiToiDa: 6,
      huyHieu: { ma: 'cang-cu', ten: 'Huy hiệu Bãi cảng cũ' },
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'safe_lift'],
      deBai: 'Trùm chương 1: trên hai sân bãi cảng cũ với taiToiDa = 6, bệ cẩu ở (1, 3) hướng nấc 4 tầm 1. Dọc 3 cột 2, 3, 4 phía sau hàng rào = và hố sâu u (tại (2, 5), (3, 5), (4, 5)), mỗi cột có một cặp kiện 1 tấn hoặc một kiện đơn 3 tấn. Hãy lặp 3 cột: trượt rail(1), vươn extend(), gọi safe_lift() để tự chọn nhấc đôi hay nhấc đơn, thu retract(), quay swing_by(4), hạ set_down() lên tàu rồi quay swing_by(4) về nấc 4!',
      veMaMau: 'Lặp 3 cột: trượt rail(1), vươn qua chướng ngại gọi safe_lift(), thu về và giao lên tàu.',
      san: [SAN_CU_1, SAN_CU_1],
      batDau: [{ x: 1, y: 3, nac: 4, tam: 1 }, { x: 1, y: 3, nac: 4, tam: 1 }],
      chong: [
        [CW(2, 5, [[12, 1], [11, 1]]), CW(3, 5, [[25, 3]]), CW(4, 5, [[32, 1], [31, 1]])],
        [CW(2, 5, [[15, 3]]), CW(3, 5, [[22, 1], [21, 1]]), CW(4, 5, [[35, 3]])]
      ],
      tau: [tauDon(39, 2), tauDon(39, 2)],
      giao: [
        [{ tau: 0, so: [11, 12, 25, 31, 32] }],
        [{ tau: 0, so: [15, 21, 22, 35] }]
      ],
      maMau: bai(['for i in range(3):', '    rail(1)', '    extend()', '    safe_lift()']),
      loiGiai: bai([
        'for i in range(3):',
        '    rail(1)',
        '    extend()',
        '    safe_lift()',
        '    retract()',
        '    swing_by(4)',
        '    set_down()',
        '    swing_by(4)'
      ]),
      sao: { o: 18, nhip: 78 },
      loiGiaiKhac: {
        moTa: 'Dùng swing_by(-4) khi quay cần',
        baiLam: bai([
          'for i in range(3):',
          '    rail(1)',
          '    extend()',
          '    safe_lift()',
          '    retract()',
          '    swing_by(-4)',
          '    set_down()',
          '    swing_by(-4)'
        ])
      },
      loiSai: [
        { moTa: 'Dùng pick_up2() thay cho safe_lift() nên gặp cột chỉ có 1 kiện 3 tấn bị lỗi móc thiếu', baiLam: bai(['for i in range(3):', '    rail(1)', '    extend()', '    pick_up2()', '    retract()', '    swing_by(4)', '    set_down()', '    swing_by(4)']), phaiCoMa: ['moc-thieu'] },
        { moTa: 'Dùng pick_up() thay cho safe_lift() nên cột có 2 kiện 1 tấn bị bỏ sót 1 kiện', baiLam: bai(['for i in range(3):', '    rail(1)', '    extend()', '    pick_up()', '    retract()', '    swing_by(4)', '    set_down()', '    swing_by(4)']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Hàm safe_lift() kiểm tra weight() <= 2 để gọi pick_up2() cho cặp kiện 1 tấn và pick_up() cho kiện 3 tấn.', 'Luna: Sau safe_lift(), hãy gọi retract(), swing_by(4), set_down() rồi swing_by(4).']
    }),

    /* ========================================================================
       CHƯƠNG 2: che-cang-cu (10 màn) — Chế lệnh: vượt chướng ngại cũ
       ======================================================================== */
    manCheCangCu({
      so: 1, ten: 'Chế hàm vươn nhấc thu về', hang: 'lam-quen',
      chinhCoDinh: true,
      taiToiDa: 6,
      taoHam: ['reach_pick'],
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'reach_by'],
      deBai: 'Sola gợi ý: để lấy hàng nằm phía sau tường đá, hàng rào hay hố sâu ở khoảng cách dr, ta luôn phải vươn reach_by(dr), nhấc pick_up() rồi thu reach_by(-dr) về tầm cũ. Hãy chế hàm reach_pick(dr) gồm 3 bước đó để chương trình chính lấy kiện 15 ở (3, 5) giao lên tàu.',
      veMaMau: 'Viết hàm reach_pick(dr): gọi reach_by(dr), pick_up() rồi reach_by(-dr).',
      san: SAN_CU_1,
      batDau: { x: 3, y: 3, nac: 4, tam: 1 },
      chong: [CW(3, 5, [[15, 2]])],
      tau: tauDon(8, 2),
      giao: [{ tau: 0, so: [15] }],
      maMau: bai(['reach_pick(1)', 'swing_by(4)', 'set_down()']),
      loiGiai: bai(['reach_pick(1)', 'swing_by(4)', 'set_down()'], { hamCuaEmMoi: [hReachPick()] }),
      sao: { o: 18, nhip: 8 },
      loiSai: [
        { moTa: 'Chưa tạo hàm reach_pick mà đã bấm Chạy', baiLam: bai(['reach_pick(1)', 'swing_by(4)', 'set_down()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên gọi reach_by(-dr) sau khi nhấc nên cần vẫn ở tầm 2, hạ container rơi xuống nước', baiLam: bai(['reach_pick(1)', 'swing_by(4)', 'set_down()']), hamCuaEmMoi: [hReachPick(['reach_by(dr)', 'pick_up()'])], phaiCoMa: ['ha-bi-chan'] }
      ],
      goiY: ['Luna: Thân hàm reach_pick(dr) gồm 3 dòng: reach_by(dr), pick_up() và reach_by(-dr).', 'Luna: Khi gọi reach_pick(1), cần vươn thêm 1 nấc tầm qua hố u, nhấc kiện 15 rồi thu 1 nấc tầm về.']
    }),

    manCheCangCu({
      so: 2, ten: 'Chế hàm bốc vượt tường', hang: 'lam-quen',
      chinhCoDinh: true,
      taiToiDa: 6,
      taoHam: ['over_wall'],
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by'],
      deBai: 'Sola nâng cấp: hãy chế hàm over_wall(d) để vươn cần extend() qua vách tường / rào / hố ở tầm 1, nhấc đơn pick_up() ở tầm 2, thu cần retract() về tầm 1, quay swing_by(d) rồi hạ set_down() xuống đích.',
      veMaMau: 'Viết hàm over_wall(d): extend(), pick_up(), retract(), swing_by(d), set_down().',
      san: SAN_CU_1,
      batDau: { x: 2, y: 3, nac: 4, tam: 1 },
      chong: [CW(2, 5, [[18, 2]])],
      tau: tauDon(8, 2),
      giao: [{ tau: 0, so: [18] }],
      maMau: bai(['over_wall(4)']),
      loiGiai: bai(['over_wall(4)'], { hamCuaEmMoi: [hOverWall()] }),
      sao: { o: 12, nhip: 8 },
      loiSai: [
        { moTa: 'Chưa tạo hàm over_wall mà đã bấm Chạy', baiLam: bai(['over_wall(4)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên gọi retract() trước swing_by(d) nên hạ container ở tầm 2 rơi xuống nước', baiLam: bai(['over_wall(4)']), hamCuaEmMoi: [hOverWall(['extend()', 'pick_up()', 'swing_by(d)', 'set_down()'])], phaiCoMa: ['ha-bi-chan'] }
      ],
      goiY: ['Luna: Thân hàm over_wall(d) gồm 5 dòng: extend(), pick_up(), retract(), swing_by(d), set_down().', 'Luna: Khi gọi over_wall(4), cần vươn qua hàng rào = ở (2, 4), nhấc kiện 18 ở (2, 5), thu về rồi quay 4 nấc giao lên tàu.']
    }),

    manCheCangCu({
      so: 3, ten: 'Chế hàm bốc đôi vượt rào', hang: 'lam-quen',
      chinhCoDinh: true,
      taiToiDa: 4,
      taoHam: ['over_wall2'],
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by'],
      deBai: 'Sola hướng dẫn: khi phía sau hàng rào là 2 kiện 1 tấn, ta có thể bốc đôi vượt rào trong một chuyến! Hãy chế hàm over_wall2(d) gồm: extend(), pick_up2(), retract(), swing_by(d), set_down().',
      veMaMau: 'Viết hàm over_wall2(d) dùng pick_up2() để nhấc đôi 2 kiện ở tầm 2.',
      san: SAN_CU_1,
      batDau: { x: 4, y: 3, nac: 4, tam: 1 },
      chong: [CW(4, 5, [[24, 1], [12, 1]])],
      tau: tauDon(8, 2),
      giao: [{ tau: 0, so: [12, 24] }],
      maMau: bai(['over_wall2(4)']),
      loiGiai: bai(['over_wall2(4)'], { hamCuaEmMoi: [hOverWall2()] }),
      sao: { o: 12, nhip: 8 },
      loiSai: [
        { moTa: 'Dùng pick_up() thay vì pick_up2() nên chỉ giao được 1 kiện trước khi tàu rời bến', baiLam: bai(['over_wall2(4)']), hamCuaEmMoi: [hOverWall2(['extend()', 'pick_up()', 'retract()', 'swing_by(d)', 'set_down()'])], phaiCoMa: ['chua-giao-tau'] },
        { moTa: 'Quên gọi set_down() ở cuối hàm over_wall2(d)', baiLam: bai(['over_wall2(4)']), hamCuaEmMoi: [hOverWall2(['extend()', 'pick_up2()', 'retract()', 'swing_by(d)'])], phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Thân hàm over_wall2(d) giống over_wall(d) nhưng thay pick_up() bằng pick_up2().', 'Luna: Ở tầm 2, hai kiện 1 tấn có tải (1 + 1) * 2 = 4 <= 4 nên nhấc đôi an toàn.']
    }),

    manCheCangCu({
      so: 4, ten: 'Chế hàm vượt rào an toàn', hang: 'luyen',
      chinhCoDinh: true,
      taiToiDa: 8,
      taoHam: ['safe_over'],
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'safe_lift'],
      deBai: 'Sola nhắc: trên hai sân có taiToiDa = 8, sân 1 ở (2, 5) là cặp 2 tấn (4 * 2 = 8 <= 8), sân 2 ở (2, 5) là cặp 3 tấn (6 * 2 = 12 > 8). Hãy chế hàm safe_over(d): extend(), safe_lift(), retract(), swing_by(d), set_down().',
      veMaMau: 'Viết hàm safe_over(d) gọi safe_lift() ở tầm 2 rồi thu về, quay d nấc và hạ xuống.',
      san: [SAN_CU_2, SAN_CU_2],
      batDau: [{ x: 2, y: 3, nac: 4, tam: 1 }, { x: 2, y: 3, nac: 4, tam: 1 }],
      chong: [
        [CW(2, 5, [[16, 2], [14, 2]])],
        [CW(2, 5, [[19, 3], [15, 3]])]
      ],
      tau: [tauDoi(13, 2), tauDoi(22, 2)],
      giao: [
        [{ tau: 0, so: [14, 16] }],
        [{ tau: 0, so: [15, 19] }]
      ],
      maMau: bai([
        'safe_over(4)',
        'swing_by(4)',
        'extend()',
        'c = read_code()',
        'if c != -1:',
        '    retract()',
        '    safe_over(4)'
      ]),
      loiGiai: bai([
        'safe_over(4)',
        'swing_by(4)',
        'extend()',
        'c = read_code()',
        'if c != -1:',
        '    retract()',
        '    safe_over(4)'
      ], { hamCuaEmMoi: [hSafeOver()] }),
      sao: { o: 21, nhip: 22 },
      loiSai: [
        { moTa: 'Dùng pick_up2() thay vì safe_lift() nên ở sân 2 gặp cặp 3 tấn ở tầm 2 bị quá tải (6 * 2 = 12 > 8)', baiLam: bai(['safe_over(4)', 'swing_by(4)', 'extend()', 'c = read_code()', 'if c != -1:', '    retract()', '    safe_over(4)']), hamCuaEmMoi: [hSafeOver(['extend()', 'pick_up2()', 'retract()', 'swing_by(d)', 'set_down()'])], phaiCoMa: ['qua-tai'] },
        { moTa: 'Chưa tạo hàm safe_over mà đã bấm Chạy', baiLam: bai(['safe_over(4)', 'swing_by(4)', 'extend()', 'c = read_code()', 'if c != -1:', '    retract()', '    safe_over(4)']), phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Luna: Thân hàm safe_over(d) gồm 5 dòng: extend(), safe_lift(), retract(), swing_by(d), set_down().', 'Luna: Sân 1 nhấc đôi xong trong 1 chuyến, còn sân 2 còn lại kiện thứ hai nên chương trình chính tự kiểm tra read_code() != -1 để gọi safe_over(4) lần nữa.']
    }),

    manCheCangCu({
      so: 5, ten: 'Chế hàm chuyển chồng vượt vách', hang: 'luyen',
      chinhCoDinh: true,
      taiToiDa: 6,
      taoHam: ['vault_stack'],
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'over_wall'],
      deBai: 'Sola chỉ dẫn: khi phía sau vách tường hay hố sâu có chồng n kiện nặng phải bốc đơn từng kiện, hãy chế hàm vault_stack(n, d): lặp n lần gọi over_wall(d) rồi swing_by(-d) để quay về hướng cũ cho chuyến tiếp theo.',
      veMaMau: 'Viết hàm vault_stack(n, d) dùng vòng lặp for i in range(n) gọi over_wall(d) và swing_by(-d).',
      san: SAN_CU_1,
      batDau: { x: 3, y: 3, nac: 4, tam: 1 },
      chong: [CW(3, 5, [[30, 3], [20, 3], [10, 3]])],
      tau: tauDon(36, 2),
      giao: [{ tau: 0, so: [10, 20, 30] }],
      maMau: bai(['vault_stack(3, 4)']),
      loiGiai: bai(['vault_stack(3, 4)'], { hamCuaEmMoi: [hVaultStack()] }),
      sao: { o: 17, nhip: 36 },
      loiSai: [
        { moTa: 'Chưa tạo hàm vault_stack mà đã bấm Chạy', baiLam: bai(['vault_stack(3, 4)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên gọi swing_by(-d) sau over_wall(d) nên chuyến thứ hai vươn cần ra phía nước ở nấc 0', baiLam: bai(['vault_stack(3, 4)']), hamCuaEmMoi: [hVaultStack(['for i in range(n):', '    over_wall(d)'])], phaiCoMa: ['moc-hut'] }
      ],
      goiY: ['Luna: Trong vòng lặp for i in range(n), gọi over_wall(d) để đưa 1 kiện qua hố lên tàu, rồi gọi swing_by(-d) để quay cần về lại nấc 4.', 'Luna: Cả 3 kiện ở (3, 5) sẽ lần lượt được bốc qua hố sâu u lên boong tàu (3, 2).']
    }),

    manCheCangCu({
      so: 6, ten: 'Kết hợp bốc đôi và bốc chồng', hang: 'luyen',
      taiToiDa: 4,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'over_wall', 'over_wall2', 'vault_stack'],
      deBai: 'Sola giao bài: với taiToiDa = 4, bệ cẩu ở (2, 3) hướng nấc 4 tầm 1. Tại (2, 5) sau hàng rào = có 2 kiện 1 tấn [14, 12]; tại (4, 5) sau hàng rào = có 2 kiện 2 tấn [28, 26]. Hãy gọi over_wall2(4) để bốc đôi cột 2, quay swing_by(4) về nấc 4, trượt rail(2) sang cột 4 rồi gọi vault_stack(2, 4) để bốc từng kiện 2 tấn!',
      veMaMau: 'Sau over_wall2(4) ở cột 2, hãy quay về nấc 4, trượt sang cột 4 và gọi vault_stack(2, 4).',
      san: SAN_CU_1,
      batDau: { x: 2, y: 3, nac: 4, tam: 1 },
      chong: [
        CW(2, 5, [[14, 1], [12, 1]]),
        CW(4, 5, [[28, 2], [26, 2]])
      ],
      tau: tauDon(38, 2),
      giao: [{ tau: 0, so: [12, 14, 26, 28] }],
      maMau: bai(['over_wall2(4)', 'swing_by(4)']),
      loiGiai: bai(['over_wall2(4)', 'swing_by(4)', 'rail(2)', 'vault_stack(2, 4)']),
      sao: { o: 25, nhip: 38 },
      loiGiaiKhac: {
        moTa: 'Trượt rail(2) trước khi xoay swing_by(4) về nấc 4',
        baiLam: bai(['over_wall2(4)', 'rail(2)', 'swing_by(4)', 'vault_stack(2, 4)'])
      },
      loiSai: [
        { moTa: 'Mới bốc cột 2, quên trượt sang cột 4 bốc 2 kiện nặng', baiLam: bai(['over_wall2(4)', 'swing_by(4)']), phaiCoMa: ['chua-giao-tau'] },
        { moTa: 'Dùng over_wall2(4) ở cột 4 khiến cặp 2 tấn ở tầm 2 bị quá tải (4 * 2 = 8 > 4)', baiLam: bai(['over_wall2(4)', 'swing_by(4)', 'rail(2)', 'over_wall2(4)']), phaiCoMa: ['qua-tai'] }
      ],
      goiY: ['Luna: Cột 2 là hai kiện 1 tấn nên over_wall2(4) nhấc đôi được ngay.', 'Luna: Cột 4 là hai kiện 2 tấn ở tầm 2 nên phải dùng vault_stack(2, 4) để chuyển từng kiện.']
    }),

    manCheCangCu({
      so: 7, ten: 'Vươn nhấc rồi phân loại ray', hang: 'bien-the',
      taiToiDa: 6,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'over_wall', 'vault_stack', 'rail_drop', 'scan_rail'],
      deBai: 'Sola phối hợp: trên hai sân, tại (3, 5) sau hố sâu u có 3 kiện hàng (mã 1x và 2x). Hãy dùng vault_stack(3, 4) để chuyển cả 3 kiện từ (3, 5) vượt qua hố sâu u ra xếp tại bãi cầu cảng (3, 2), xoay swing_by(4) về nấc 0 rồi gọi scan_rail() để phân loại sạch sang hai tàu!',
      veMaMau: 'Kết hợp vault_stack(3, 4), swing_by(4) và scan_rail().',
      san: [SAN_CU_2, SAN_CU_2],
      batDau: [{ x: 3, y: 3, nac: 4, tam: 1 }, { x: 3, y: 3, nac: 4, tam: 1 }],
      chong: [
        [CW(3, 5, [[18, 2], [27, 2], [14, 2]])],
        [CW(3, 5, [[29, 2], [15, 2], [22, 2]])]
      ],
      tau: [tauDoi(52, 2), tauDoi(52, 2)],
      giao: [
        [{ tau: 0, so: [14, 18] }, { tau: 1, so: [27] }],
        [{ tau: 0, so: [15] }, { tau: 1, so: [22, 29] }]
      ],
      maMau: bai(['vault_stack(3, 4)']),
      loiGiai: bai(['vault_stack(3, 4)', 'swing_by(4)', 'scan_rail()']),
      sao: { o: 28, nhip: 52 },
      loiGiaiKhac: {
        moTa: 'Dùng swing_by(-4) để quay về nấc 0 trước scan_rail()',
        baiLam: bai(['vault_stack(3, 4)', 'swing_by(-4)', 'scan_rail()'])
      },
      loiSai: [
        { moTa: 'Mới gọi vault_stack(3, 4) đưa hàng ra bãi (3, 2), quên gọi scan_rail() để giao tàu', baiLam: bai(['vault_stack(3, 4)']), phaiCoMa: ['chua-giao-tau'] },
        { moTa: 'Quên gọi swing_by(4) trước scan_rail() nên đầu cần vẫn ở nấc 4', baiLam: bai(['vault_stack(3, 4)', 'scan_rail()']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: vault_stack(3, 4) đã gom gọn cả 3 kiện từ (3, 5) ra bãi (3, 2) và kết thúc ở nấc 4.', 'Luna: Chỉ cần thêm swing_by(4) để quay về nấc 0 rồi gọi scan_rail()!']
    }),

    manCheCangCu({
      so: 8, ten: 'Sửa hàm quét bãi cảng cũ', hang: 'bien-the',
      chinhCoDinh: true,
      taiToiDa: 6,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by'],
      deBai: 'Sola phát hiện lỗi: hàm old_sweep(n) dùng để trượt qua n cột (từ cột 1 sang cột 2, 3, 4) và bốc kiện hàng sau tường/rào/hố ở hàng 5 giao lên tàu ở hàng 2. Nhưng trong thân hàm đang đặt lệnh retract() SAU set_down(), khiến cần cẩu quay về nấc 0 khi vẫn ở tầm 2 và hạ container rơi xuống mặt nước (x, 1)! Hãy sửa lại thứ tự trong old_sweep(n).',
      veMaMau: 'Đưa lệnh retract() lên trước swing_by(4) và set_down() trong hàm old_sweep(n).',
      san: SAN_CU_1,
      batDau: { x: 1, y: 3, nac: 4, tam: 1 },
      chong: [
        CW(2, 5, [[12, 2]]),
        CW(3, 5, [[24, 2]]),
        CW(4, 5, [[36, 2]])
      ],
      tau: tauDon(39, 2),
      giao: [{ tau: 0, so: [12, 24, 36] }],
      maMau: bai(['old_sweep(3)'], { hamCuaMan: [hOldSweep(T_OLD_SWEEP_SAI)] }),
      loiGiai: bai(['old_sweep(3)'], { hamCuaMan: [hOldSweep(T_OLD_SWEEP_DUNG)] }),
      sao: { o: 15, nhip: 39 },
      loiSai: [
        { moTa: 'Chưa sửa thứ tự retract() nên cần cẩu hạ container ở tầm 2 rơi xuống nước', baiLam: bai(['old_sweep(3)'], { hamCuaMan: [hOldSweep(T_OLD_SWEEP_SAI)] }), phaiCoMa: ['ha-bi-chan'] },
        { moTa: 'Xóa mất lệnh extend() nên cần cẩu móc vào hàng rào = và hố u ở hàng 4', baiLam: bai(['old_sweep(3)'], { hamCuaMan: [hOldSweep(['for i in range(n):', '    rail(1)', '    pick_up()', '    swing_by(4)', '    set_down()', '    swing_by(4)'])] }), phaiCoMa: ['moc-hut'] }
      ],
      goiY: ['Luna: Sau khi extend() và pick_up() ở tầm 2, phải gọi retract() về tầm 1 rồi mới swing_by(4) và set_down().', 'Luna: Thứ tự đúng trong vòng lặp là: rail(1), extend(), pick_up(), retract(), swing_by(4), set_down(), swing_by(4).']
    }),

    manCheCangCu({
      so: 9, ten: 'Dọn hai cột sau cửa và thùng', hang: 'bien-the',
      taiToiDa: 8,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'safe_lift', 'safe_over', 'over_wall', 'vault_stack'],
      deBai: 'Sola thử thách: trên hai sân với taiToiDa = 8, bệ cẩu ở (2, 3) hướng nấc 4 tầm 1. Phía sau cửa C ở (2, 5) có 2 kiện 2 tấn (nhấc đôi ở tầm 2 có tải 4 * 2 = 8 <= 8); phía sau thùng nặng H ở (4, 5) có 2 kiện 3 tấn (ở tầm 2 phải bốc từng kiện bằng vault_stack). Hãy dùng safe_over(4) cho cột 2, rồi trượt sang cột 4 dùng vault_stack(2, 4)!',
      veMaMau: 'Bốc cột 2 bằng safe_over(4), quay về nấc 4, trượt rail(2) sang cột 4 rồi gọi vault_stack(2, 4).',
      san: [SAN_CU_2, SAN_CU_2],
      batDau: [{ x: 2, y: 3, nac: 4, tam: 1 }, { x: 2, y: 3, nac: 4, tam: 1 }],
      chong: [
        [CW(2, 5, [[14, 2], [12, 2]]), CW(4, 5, [[28, 3], [26, 3]])],
        [CW(2, 5, [[18, 2], [16, 2]]), CW(4, 5, [[29, 3], [25, 3]])]
      ],
      tau: [tauDoi(38, 2), tauDoi(38, 2)],
      giao: [
        [{ tau: 0, so: [12, 14] }, { tau: 1, so: [26, 28] }],
        [{ tau: 0, so: [16, 18] }, { tau: 1, so: [25, 29] }]
      ],
      maMau: bai(['safe_over(4)', 'swing_by(4)']),
      loiGiai: bai(['safe_over(4)', 'swing_by(4)', 'rail(2)', 'vault_stack(2, 4)']),
      sao: { o: 29, nhip: 38 },
      loiGiaiKhac: {
        moTa: 'Trượt rail(2) trước khi gọi swing_by(4)',
        baiLam: bai(['safe_over(4)', 'rail(2)', 'swing_by(4)', 'vault_stack(2, 4)'])
      },
      loiSai: [
        { moTa: 'Mới bốc cột 2, chưa trượt sang cột 4 bốc 2 kiện 3 tấn', baiLam: bai(['safe_over(4)', 'swing_by(4)']), phaiCoMa: ['chua-giao-tau'] },
        { moTa: 'Chỉ gọi safe_over(4) một lần ở cột 4 nên còn sót 1 kiện 3 tấn tại (4, 5)', baiLam: bai(['safe_over(4)', 'swing_by(4)', 'rail(2)', 'safe_over(4)']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Cột 2 là cặp 2 tấn nên safe_over(4) gọi safe_lift() sẽ nhấc đôi cả 2 kiện lên Tàu 1.', 'Luna: Sau đó gọi swing_by(4), rail(2) và vault_stack(2, 4) để bốc cả 2 kiện 3 tấn ở cột 4 lên Tàu 2.']
    }),

    manCheCangCu({
      so: 10, ten: 'Trùm Chế lệnh: vượt chướng ngại cũ', hang: 'trum', nhipTheo: 'tong',
      taiToiDa: 4,
      huyHieu: { ma: 'che-cang-cu', ten: 'Huy hiệu Chế lệnh: vượt chướng ngại cũ' },
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'over_wall', 'over_wall2', 'vault_stack'],
      deBai: 'Trùm chương 2: trên hai sân với taiToiDa = 4, bệ cẩu bắt đầu ở (1, 3) hướng nấc 4 tầm 1. Dọc 3 cột 2, 3, 4 phía sau hàng rào = và hố u (tại (2, 5), (3, 5), (4, 5)), mỗi cột có 2 kiện hàng (cột 1 tấn hoặc cột 2 tấn tùy sân). Trong vòng lặp 3 cột, hãy trượt rail(1), vươn extend() kiểm tra if weight() == 1 (rồi thu retract()) để chọn over_wall2(4) + swing_by(4) hoặc vault_stack(2, 4)!',
      veMaMau: 'Lặp 3 cột: trượt rail(1), kiểm tra khối lượng ở tầm 2 rồi gọi over_wall2(4) hoặc vault_stack(2, 4).',
      san: [SAN_CU_1, SAN_CU_1],
      batDau: [{ x: 1, y: 3, nac: 4, tam: 1 }, { x: 1, y: 3, nac: 4, tam: 1 }],
      chong: [
        [CW(2, 5, [[12, 1], [11, 1]]), CW(3, 5, [[22, 2], [21, 2]]), CW(4, 5, [[32, 1], [31, 1]])],
        [CW(2, 5, [[14, 2], [13, 2]]), CW(3, 5, [[24, 1], [23, 1]]), CW(4, 5, [[34, 2], [33, 2]])]
      ],
      tau: [tauDon(57, 2), tauDon(69, 2)],
      giao: [
        [{ tau: 0, so: [11, 12, 21, 22, 31, 32] }],
        [{ tau: 0, so: [13, 14, 23, 24, 33, 34] }]
      ],
      maMau: bai([
        'for i in range(3):',
        '    rail(1)',
        '    extend()',
        '    w = weight()',
        '    retract()'
      ]),
      loiGiai: bai([
        'for i in range(3):',
        '    rail(1)',
        '    extend()',
        '    w = weight()',
        '    retract()',
        '    if w == 1:',
        '        over_wall2(4)',
        '        swing_by(4)',
        '    else:',
        '        vault_stack(2, 4)'
      ]),
      sao: { o: 31, nhip: 126 },
      loiSai: [
        { moTa: 'Luôn gọi over_wall2(4) cho mọi cột nên gặp cột 2 tấn ở tầm 2 bị quá tải (4 * 2 = 8 > 4)', baiLam: bai(['for i in range(3):', '    rail(1)', '    over_wall2(4)', '    swing_by(4)']), phaiCoMa: ['qua-tai'] },
        { moTa: 'Quên gọi swing_by(4) sau over_wall2(4) nên sang cột kế tiếp đầu cần đang ở nấc 0', baiLam: bai(['for i in range(3):', '    rail(1)', '    extend()', '    w = weight()', '    retract()', '    if w == 1:', '        over_wall2(4)', '    else:', '        vault_stack(2, 4)']), phaiCoMa: ['moc-hut'] }
      ],
      goiY: ['Luna: Sau khi đo w = weight() ở tầm 2 và retract() về tầm 1, nếu w == 1 thì gọi over_wall2(4) rồi swing_by(4).', 'Luna: Trong nhánh else (khi w == 2), chỉ cần gọi vault_stack(2, 4) vì vault_stack đã tự quay về nấc 4 sau mỗi chuyến!']
    })
  ];

  ManHoc.manCangCu = DS;
  if (laNode) module.exports = DS;
})();
