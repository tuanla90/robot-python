/* ============================================================================
   man-can-tai.js — "Robot Chấn Hưng": GÓI 7 MÙA 4 "CẢNG SÔNG" (CẢM BIẾN TẢI TRỌNG)
   Gồm 20 màn mới trên Cần cẩu R1 nâng cấp cảm biến đo tải (weight & taiToiDa):
   - can-tai.1..10     (10 màn chương can-tai "Đo sức nặng")
   - che-can-tai.1..10 (10 màn chương che-can-tai "Chế lệnh: giữ cần an toàn")
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var HAM_TAI = ['swing_left', 'swing_right', 'extend', 'retract', 'pick_up', 'set_down', 'pick_up2', 'read_code', 'weight', 'rail', 'wait'];
  var ROBOT_TAI = { than: 'cau', tay: 'moc-cau', camBien: [{ ma: 'quet-ma', o: 'tren' }] };
  var CAU_TRUC = ['for', 'if', 'while', 'list'];

  // Bãi phụ hai đầu ray (14/11, cẩu 4 hướng): ô chéo không còn với tới, nên tháp mượn ô (1, 3) hay (5, 3) cạnh bệ làm bãi tạm
  var SAN_TAI_3 = [
    '~~~~~~~',
    '~~~~~~~',
    '~DTTTD~',
    '.DRRRD.',
    '.DDDDD.',
    '.DDDDD.',
    '.......'
  ];
  var SAN_TAI_1 = [
    '~~~~~~~',
    '~~~~~~~',
    '~DTTTD~',
    '.RRRRR.',
    '.DDDDD.',
    '.DDDDD.',
    '.......'
  ];

  var SAN_TAI_2 = [
    '~~~~~~~',
    '~~~~~~~',
    '~TTDTT~',
    '.RRRRR.',
    '.DDDDD.',
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
  function BM(x, y, chong) {
    return {
      x: x, y: y,
      chong: chong.map(function (q) { return { x: q.x, y: q.y, so: q.so.slice() }; })
    };
  }

  // DÃY NGANG (ghép nhịp 3f, 15/11): ray y = 3 từ x = 0, dãy bãi y = 4 từ x = 1, mỗi ô MỘT container (mọi ô đều lấy được).
  // Cẩu quét dãy giữ KỶ LỤC (lớn nhất / nặng nhất), lùi về ô kỷ lục, đưa container sang ô bên kia ray (y = 2) ngay đối diện.
  // Mỗi sân một bộ số, kỷ lục nằm chỗ khác nhau: dãy lệnh cố định thắng một sân thì thua sân khác.
  var SAN_DAY = [
    '~~~~~~~',
    '~~~~~~~',
    '~DDDDD~',
    'RRRRRR.',
    'DDDDDD.',
    '.......',
    '.......'
  ];
  var BD_DAY = { x: 0, y: 3, nac: 2, tam: 1 };
  function dayNgang(ds) {
    return ds.map(function (p, i) { return { x: i + 1, y: 4, cont: [{ so: p[0], tan: p[1] }] }; });
  }
  function chiSoKyLuc(ds, kieu) {
    var k = 0;
    for (var i = 1; i < ds.length; i++) {
      if (kieu === 'lon' && ds[i][0] > ds[k][0]) k = i;
      if (kieu === 'nang' && ds[i][1] > ds[k][1]) k = i;
    }
    return k;
  }
  function bmKyLuc(ds, kieu) {
    var k = chiSoKyLuc(ds, kieu);
    var chong = ds.map(function (p, i) { return { x: i + 1, y: 4, so: i === k ? [] : [p[0]] }; });
    chong.push({ x: k + 1, y: 2, so: [ds[k][0]] });
    return { x: k + 1, y: 3, chong: chong };
  }
  // [mã, tấn]; kỷ lục số và kỷ lục tấn mỗi sân chỉ có MỘT ô
  var DAY_8A = [[12, 1], [35, 1], [7, 1], [28, 1], [19, 1]];
  var DAY_8B = [[23, 1], [9, 1], [16, 1], [41, 1], [30, 1]];
  var DAY_9A = [[18, 1], [6, 1], [27, 1], [11, 1], [44, 1]];
  var DAY_9B = [[52, 1], [13, 1], [38, 1], [25, 1], [40, 1]];
  var DAY_9C = [[9, 1], [21, 1], [36, 1], [14, 1], [30, 1]];
  var DAY_C8A = [[31, 1], [14, 4], [45, 2], [22, 3], [9, 1]];
  var DAY_C8B = [[27, 2], [38, 1], [12, 3], [50, 2], [16, 4]];
  var DAY_C8C = [[40, 3], [19, 1], [33, 2], [8, 4], [25, 2]];
  var T_TIM_LON = [
    'lon = -1',
    'for i in range(5):',
    '    rail(1)',
    '    c = read_code()',
    '    if c > lon:',
    '        lon = c',
    'c = read_code()',
    'while c != lon:',
    '    rail(-1)',
    '    c = read_code()',
    'pick_up()',
    'swing_left()',
    'swing_left()',
    'set_down()',
    'wait()'
  ];

  // Các hàm chế ở Gói 7 chương che-can-tai
  var T_SAFE_LIFT = [
    'w = weight()',
    'if w <= 2:',
    '    pick_up2()',
    'else:',
    '    pick_up()'
  ];
  var T_SAFE_CARRY = [
    'w = weight()',
    'if w <= 2:',
    '    carry2_by(d)',
    '    swing_by(-d)',
    'else:',
    '    carry_n(2, d)'
  ];
  var T_SAFE_EXTEND = [
    'w = weight()',
    'if w <= 2:',
    '    pick_up()',
    '    extend()',
    '    set_down()',
    '    retract()',
    'else:',
    '    carry_by(2)',
    '    swing_by(2)'
  ];
  var T_HEAVY_RAIL = [
    'c = read_code()',
    'while c != -1:',
    '    w = weight()',
    '    if w <= 2:',
    '        rail_drop(-1)',
    '    else:',
    '        rail_drop(1)',
    '    c = read_code()'
  ];
  var T_LOAD_SAFE_STACK = [
    'w = weight()',
    'if w == 1:',
    '    carry2_by(2)',
    'else:',
    '    t = 2 * d',
    '    move_tower2(d, t)'
  ];
  var T_CHECK_LOAD_SAI = [
    'for i in range(n):',
    '    rail(1)',
    '    w = weight()',
    '    if w >= 2:',
    '        carry2_by(2)',
    '        swing_by(2)',
    '    else:',
    '        carry_n(2, 2)'
  ];
  var T_CHECK_LOAD_DUNG = [
    'for i in range(n):',
    '    rail(1)',
    '    w = weight()',
    '    if w <= 2:',
    '        carry2_by(2)',
    '        swing_by(2)',
    '    else:',
    '        carry_n(2, 2)'
  ];

  function hSafeLift(than) { return H('safe_lift', [], than || T_SAFE_LIFT); }
  function hSafeCarry(than) { return H('safe_carry', ['d'], than || T_SAFE_CARRY); }
  function hSafeExtend(than) { return H('safe_extend', [], than || T_SAFE_EXTEND); }
  function hHeavyRail(than) { return H('heavy_rail', [], than || T_HEAVY_RAIL); }
  function hLoadSafeStack(than) { return H('load_safe_stack', ['d'], than || T_LOAD_SAFE_STACK); }
  function hCheckLoad(than) { return H('check_load', ['n'], than || T_CHECK_LOAD_DUNG); }

  function manCanTai(cfg) {
    return ManHoc.chuanHoa(Object.assign({
      chuong: 'can-tai',
      loaiRobot: 'cau',
      robot: ROBOT_TAI,
      vo: 'cang',
      hamGoc: HAM_TAI,
      cauTruc: CAU_TRUC,
      khung: { chinh: 10, moiHam: 10 },
      moXuong: true,
      mucTieu: 'giao-tau',
      taiToiDa: 4,
      hamCuaEmCan: [],
      taoHam: []
    }, cfg));
  }

  function manCheCanTai(cfg) {
    return ManHoc.chuanHoa(Object.assign({
      chuong: 'che-can-tai',
      loaiRobot: 'cau',
      robot: ROBOT_TAI,
      vo: 'cang',
      hamGoc: HAM_TAI,
      cauTruc: CAU_TRUC,
      khung: { chinh: 10, moiHam: 10 },
      moXuong: true,
      mucTieu: 'giao-tau',
      taiToiDa: 4,
      hamCuaEmCan: [],
      taoHam: []
    }, cfg));
  }

  var DS = [
    /* ========================================================================
       CHƯƠNG 1: can-tai (10 màn) — Đo sức nặng
       ======================================================================== */
    manCanTai({
      so: 1, ten: 'Cân tải trước khi nhấc', hang: 'lam-quen',
      chiChay: true, chinhCoDinh: true,
      taiToiDa: 4,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry2_by'],
      deBai: 'Sola làm mẫu: mỗi container nay có khối lượng từ 1 đến 4 tấn, và cần cẩu có tải tối đa taiToiDa = 4 (tích số tấn nhân tầm vươn không vượt quá 4). Tại (3, 4) có 2 kiện 2 tấn, ở tầm 1 tổng tải là (2 + 2) * 1 = 4 <= 4 nên gọi carry2_by(2) nhấc đôi an toàn.',
      veMaMau: 'Chương trình mẫu đã khóa. Bấm Chạy để xem cần cẩu nhấc đôi 2 kiện 2 tấn ở tầm 1.',
      san: SAN_TAI_1,
      batDau: { x: 3, y: 3, nac: 2, tam: 1 },
      chong: [CW(3, 4, [[20, 2], [10, 2]])],
      tau: tauDon(4, 2),
      giao: [{ tau: 0, so: [10, 20] }],
      maMau: bai(['carry2_by(2)']),
      loiGiai: bai(['carry2_by(2)']),
      sao: { o: 11, nhip: 4 },
      loiSai: [],
      goiY: ['Luna: Bấm nút Chạy để quan sát cần cẩu bốc cặp kiện 2 tấn lên tàu.', 'Luna: Luật tải trọng yêu cầu tổng số tấn đang treo nhân với tầm vươn tam không vượt quá taiToiDa.']
    }),

    manCanTai({
      so: 2, ten: 'Tách đôi kiện nặng', hang: 'lam-quen',
      taiToiDa: 4,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'carry_n'],
      deBai: 'Sola nhờ bạn: tại (3, 4) có 2 kiện nặng 3 tấn, còn tải tối đa của cần cẩu là taiToiDa = 4. Nếu nhấc đôi cả 2 kiện thì tổng tải là (3 + 3) * 1 = 6 > 4 sẽ bị lỗi quá tải! Hãy dùng carry_n(2, 2) để bốc từng kiện 3 tấn lên tàu.',
      veMaMau: 'Thay vì nhấc đôi, hãy gọi carry_n(2, 2) để chuyển từng kiện 3 tấn.',
      san: SAN_TAI_1,
      batDau: { x: 3, y: 3, nac: 2, tam: 1 },
      chong: [CW(3, 4, [[24, 3], [14, 3]])],
      tau: tauDon(12, 2),
      giao: [{ tau: 0, so: [14, 24] }],
      maMau: bai(['carry_n(1, 2)']),
      loiGiai: bai(['carry_n(2, 2)']),
      sao: { o: 16, nhip: 12 },
      loiGiaiKhac: {
        moTa: 'Dùng vòng lặp for 2 lần gọi carry_by(2) và swing_by(2)',
        baiLam: bai([
          'for i in range(2):',
          '    carry_by(2)',
          '    swing_by(2)'
        ])
      },
      loiSai: [
        { moTa: 'Gọi pick_up2() nhấc cùng lúc 2 kiện 3 tấn (6 tấn > taiToiDa 4) nên bị quá tải', baiLam: bai(['pick_up2()', 'swing_by(2)', 'set_down()']), phaiCoMa: ['qua-tai'] },
        { moTa: 'Mới chuyển 1 kiện bằng carry_n(1, 2)', baiLam: bai(['carry_n(1, 2)']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Mỗi kiện nặng 3 tấn nên chỉ nhấc đơn từng kiện được (3 * 1 = 3 <= 4).', 'Luna: Đổi đối số đầu của carry_n thành 2: carry_n(2, 2).']
    }),

    manCanTai({
      so: 3, ten: 'Đọc số tấn bằng weight()', hang: 'lam-quen',
      taiToiDa: 4,
      hamCuaEmCan: ['rail_drop'],
      deBai: 'Sola nhờ bạn: lệnh weight() trả về số tấn của kiện hàng trên đỉnh chồng ở đầu cần (không tốn nhịp). Tại (3, 2) có 2 kiện hàng: kiện nhẹ (<= 2 tấn) cần giao sang Tàu 1 bên trái bằng rail_drop(-1), kiện nặng (> 2 tấn) cần giao sang Tàu 2 bên phải bằng rail_drop(1).',
      veMaMau: 'Trong vòng lặp 2 lần, đọc w = weight() rồi dùng if w <= 2: để chọn rail_drop(-1) hoặc rail_drop(1).',
      san: SAN_TAI_2,
      batDau: { x: 3, y: 3, nac: 0, tam: 1 },
      chong: [CW(3, 2, [[28, 3], [15, 2]])],
      tau: tauDoi(6, 2),
      giao: [{ tau: 0, so: [15] }, { tau: 1, so: [28] }],
      maMau: bai([
        'for i in range(2):',
        '    w = weight()',
        '    if w <= 2:',
        '        rail_drop(-1)',
        '    else:'
      ]),
      loiGiai: bai([
        'for i in range(2):',
        '    w = weight()',
        '    if w <= 2:',
        '        rail_drop(-1)',
        '    else:',
        '        rail_drop(1)'
      ]),
      sao: { o: 10, nhip: 8 },
      loiGiaiKhac: {
        moTa: 'Dùng while c != -1 (c = read_code()) thay cho for i in range(2)',
        baiLam: bai([
          'c = read_code()',
          'while c != -1:',
          '    w = weight()',
          '    if w <= 2:',
          '        rail_drop(-1)',
          '    else:',
          '        rail_drop(1)',
          '    c = read_code()'
        ])
      },
      loiSai: [
        { moTa: 'Đưa cả 2 kiện sang Tàu 1 nên kiện 3 tấn bị giao nhầm', baiLam: bai(['for i in range(2):', '    rail_drop(-1)']), phaiCoMa: ['giao-nham'] },
        { moTa: 'Dùng điều kiện ngược w > 2 cho Tàu 1 nên giao ngược cả 2 kiện', baiLam: bai(['for i in range(2):', '    w = weight()', '    if w > 2:', '        rail_drop(-1)', '    else:', '        rail_drop(1)']), phaiCoMa: ['giao-nham'] }
      ],
      goiY: ['Luna: Lệnh weight() đo ngay kiện trên đỉnh tại (3, 2) trước khi nhấc.', 'Luna: Trong nhánh else, gọi rail_drop(1) để chuyển kiện nặng sang Tàu 2.']
    }),

    manCanTai({
      so: 4, ten: 'Giữ tầm ngắn cho hàng nặng', hang: 'luyen-tap',
      taiToiDa: 4,
      mucTieu: 'bong-mo',
      hamCuaEmCan: [],
      deBai: 'Sola nhờ bạn: tại (2, 4) có kiện hàng nặng 4 tấn, cần dời sang (4, 4) và đỗ bệ cẩu ở (4, 3). Với taiToiDa = 4, kiện 4 tấn chỉ nâng được ở tầm 1 (4 * 1 = 4); nếu gọi extend() ra tầm 2 thì 4 * 2 = 8 > 4 sẽ bị quá tải! Hãy giữ tầm 1, nhấc kiện lên rồi trượt rail(2) sang cột 4 hạ xuống.',
      veMaMau: 'Sau pick_up() và rail(2), hãy gọi set_down() để hạ kiện 4 tấn tại (4, 4).',
      san: SAN_TAI_1,
      batDau: { x: 2, y: 3, nac: 2, tam: 1 },
      chong: [CW(2, 4, [[32, 4]])],
      tau: tauDon(20, 0),
      bongMo: BM(4, 3, [
        { x: 2, y: 4, so: [] },
        { x: 4, y: 4, so: [32] }
      ]),
      maMau: bai([
        'pick_up()',
        'rail(2)'
      ]),
      loiGiai: bai([
        'pick_up()',
        'rail(2)',
        'set_down()'
      ]),
      sao: { o: 3, nhip: 4 },
      loiGiaiKhac: {
        moTa: 'Tách rail(2) thành hai bước rail(1)',
        baiLam: bai([
          'pick_up()',
          'rail(1)',
          'rail(1)',
          'set_down()'
        ])
      },
      loiSai: [
        { moTa: 'Đang treo kiện 4 tấn mà gọi extend() sang tầm 2 (4 * 2 = 8 > 4) nên bị quá tải', baiLam: bai(['pick_up()', 'extend()', 'set_down()']), phaiCoMa: ['qua-tai'] },
        { moTa: 'Mới trượt sang cột 4 mà quên gọi set_down()', baiLam: bai(['pick_up()', 'rail(2)']), phaiCoMa: ['chua-xep-chong'] }
      ],
      goiY: ['Luna: Trượt đường ray bằng rail(2) giữ nguyên tầm vươn tam = 1 nên mô-men tải luôn là 4 * 1 = 4.', 'Luna: Thêm set_down() ở cuối chương trình để đặt kiện 32 xuống (4, 4).']
    }),

    manCanTai({
      so: 5, ten: 'Bãi sâu tầm hai', hang: 'luyen-tap',
      taiToiDa: 4,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'reach_by', 'aim_crane', 'haul_to'],
      deBai: 'Sola nhờ bạn: tại bãi sâu (3, 5) ở tầm 2 có chồng 2 kiện mỗi kiện nặng 2 tấn. Với taiToiDa = 4, ở tầm 2 mỗi lần chỉ nhấc được 1 kiện 2 tấn (2 * 2 = 4 <= 4); nếu gọi pick_up2() thì (2 + 2) * 2 = 8 > 4 sẽ bị quá tải! Hãy lặp 2 lần: gọi haul_to(2, -1) đưa từng kiện lên tàu ở (3, 2) rồi gọi aim_crane(2, 1) quay về (3, 5).',
      veMaMau: 'Trong vòng lặp 2 lần, sau haul_to(2, -1) hãy gọi aim_crane(2, 1) để quay lại (3, 5).',
      san: SAN_TAI_1,
      batDau: { x: 3, y: 3, nac: 2, tam: 2 },
      chong: [CW(3, 5, [[22, 2], [12, 2]])],
      tau: tauDon(16, 2),
      giao: [{ tau: 0, so: [12, 22] }],
      maMau: bai([
        'for i in range(2):',
        '    haul_to(2, -1)'
      ]),
      loiGiai: bai([
        'for i in range(2):',
        '    haul_to(2, -1)',
        '    aim_crane(2, 1)'
      ]),
      sao: { o: 22, nhip: 16 },
      loiGiaiKhac: {
        moTa: 'Dùng aim_crane(-2, 1) để quay về nấc 2 tầm 2',
        baiLam: bai([
          'for i in range(2):',
          '    haul_to(2, -1)',
          '    aim_crane(-2, 1)'
        ])
      },
      loiSai: [
        { moTa: 'Dùng pick_up2() ở tầm 2 cho 2 kiện 2 tấn ((2 + 2) * 2 = 8 > 4) nên bị quá tải', baiLam: bai(['pick_up2()', 'aim_crane(2, -1)', 'set_down()']), phaiCoMa: ['qua-tai'] },
        { moTa: 'Mới giao 1 kiện vì quên gọi aim_crane(2, 1) quay lại (3, 5)', baiLam: bai(['haul_to(2, -1)']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Ở tầm 2, mỗi kiện 2 tấn đã chạm ngưỡng tải 2 * 2 = 4 nên phải bốc từng kiện bằng haul_to(2, -1).', 'Luna: Thêm aim_crane(2, 1) ngay dưới haul_to(2, -1) trong vòng lặp for.']
    }),

    manCanTai({
      so: 6, ten: 'Đo tải chọn móc dọc ray', hang: 'luyen-tap',
      taiToiDa: 4,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'carry_n', 'carry2_by'],
      deBai: 'Sola nhờ bạn: dọc 3 cột (2, 4), (3, 4), (4, 4) mỗi cột có một cặp 2 kiện cùng số tấn. Với taiToiDa = 4 ở tầm 1, nếu kiện đỉnh nặng tối đa 2 tấn thì cả cặp nặng tối đa 4 tấn nên bốc đôi bằng carry2_by(2) rồi swing_by(2); ngược lại (3 tấn mỗi kiện) phải bốc từng kiện bằng carry_n(2, 2).',
      veMaMau: 'Hoàn thiện nhánh else bằng carry_n(2, 2) cho cột có hàng nặng.',
      san: SAN_TAI_1,
      batDau: { x: 1, y: 3, nac: 2, tam: 1 },
      chong: [CW(2, 4, [[21, 2], [11, 2]]), CW(3, 4, [[26, 3], [16, 3]]), CW(4, 4, [[29, 1], [19, 1]])],
      tau: tauDon(27, 2),
      giao: [{ tau: 0, so: [11, 16, 19, 21, 26, 29] }],
      maMau: bai([
        'for i in range(3):',
        '    rail(1)',
        '    w = weight()',
        '    if w <= 2:',
        '        carry2_by(2)',
        '        swing_by(2)',
        '    else:'
      ]),
      loiGiai: bai([
        'for i in range(3):',
        '    rail(1)',
        '    w = weight()',
        '    if w <= 2:',
        '        carry2_by(2)',
        '        swing_by(2)',
        '    else:',
        '        carry_n(2, 2)'
      ]),
      sao: { o: 26, nhip: 27 },
      loiGiaiKhac: {
        moTa: 'Hỏi w > 2 trước để gọi carry_n(2, 2)',
        baiLam: bai([
          'for i in range(3):',
          '    rail(1)',
          '    w = weight()',
          '    if w > 2:',
          '        carry_n(2, 2)',
          '    else:',
          '        carry2_by(2)',
          '        swing_by(2)'
        ])
      },
      loiSai: [
        { moTa: 'Gọi carry2_by(2) ở mọi cột nên gặp cột 3 gồm 2 kiện 3 tấn bị quá tải', baiLam: bai(['for i in range(3):', '    rail(1)', '    carry2_by(2)', '    swing_by(2)']), phaiCoMa: ['qua-tai'] },
        { moTa: 'Trong nhánh else chỉ gọi carry_n(1, 2) nên sót 1 kiện ở cột 3', baiLam: bai(['for i in range(3):', '    rail(1)', '    w = weight()', '    if w <= 2:', '        carry2_by(2)', '        swing_by(2)', '    else:', '        carry_n(1, 2)']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Cột 2 và cột 4 có w <= 2 nên nhấc đôi được, còn cột 3 có w == 3 phải nhấc đơn 2 chuyến.', 'Luna: Trong nhánh else, gọi carry_n(2, 2) (hàm này đã tự quay về nấc 2 sau mỗi chuyến).']
    }),

    manCanTai({
      so: 7, ten: 'Phân luồng tàu nhẹ và tàu nặng', hang: 'bien-the',
      taiToiDa: 4,
      hamCuaEmCan: ['rail_drop'],
      deBai: 'Sola nhờ bạn: tại cầu cảng giữa (3, 2) có chồng 4 kiện hàng với khối lượng khác nhau. Đọc c = read_code(), lặp while c != -1:, trong vòng đọc w = weight() rồi if w <= 2: để giao các kiện nhẹ (1 hoặc 2 tấn) sang Tàu 1 bằng rail_drop(-1), và giao các kiện nặng (3 hoặc 4 tấn) sang Tàu 2 bằng rail_drop(1).',
      veMaMau: 'Đọc c = read_code(), lặp while c != -1:; trong vòng đọc w = weight(), hỏi w <= 2 để chia hàng sang hai tàu, cuối vòng đọc lại c.',
      san: SAN_TAI_2,
      batDau: { x: 3, y: 3, nac: 0, tam: 1 },
      chong: [CW(3, 2, [[28, 4], [14, 1], [25, 3], [12, 2]])],
      tau: tauDoi(12, 2),
      giao: [{ tau: 0, so: [12, 14] }, { tau: 1, so: [25, 28] }],
      maMau: bai([
        'c = read_code()',
        'while c != -1:',
        '    w = weight()',
        '    if w <= 2:',
        '        rail_drop(-1)',
        '    c = read_code()'
      ]),
      loiGiai: bai([
        'c = read_code()',
        'while c != -1:',
        '    w = weight()',
        '    if w <= 2:',
        '        rail_drop(-1)',
        '    else:',
        '        rail_drop(1)',
        '    c = read_code()'
      ]),
      sao: { o: 12, nhip: 16 },
      loiGiaiKhac: {
        moTa: 'Dùng for i in range(4) thay cho while c != -1',
        baiLam: bai([
          'for i in range(4):',
          '    w = weight()',
          '    if w <= 2:',
          '        rail_drop(-1)',
          '    else:',
          '        rail_drop(1)'
        ])
      },
      loiSai: [
        { moTa: 'Chưa viết nhánh else nên gặp kiện nặng 3 tấn thì lặp vô hạn', baiLam: bai(['c = read_code()', 'while c != -1:', '    w = weight()', '    if w <= 2:', '        rail_drop(-1)', '    c = read_code()']), phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Dùng điều kiện w < 2 nên kiện 12 nặng 2 tấn bị giao nhầm sang Tàu 2', baiLam: bai(['c = read_code()', 'while c != -1:', '    w = weight()', '    if w < 2:', '        rail_drop(-1)', '    else:', '        rail_drop(1)', '    c = read_code()']), phaiCoMa: ['giao-nham'] }
      ],
      goiY: ['Luna: Tàu 1 nhận các kiện có w <= 2 (1 tấn hoặc 2 tấn).', 'Luna: Thêm nhánh else: và gọi rail_drop(1) để giao các kiện 3 tấn, 4 tấn sang Tàu 2.']
    }),

    manCanTai({
      so: 8, ten: 'Tìm container số lớn nhất', hang: 'bien-the',
      chiChay: true, chinhCoDinh: true,
      mucTieu: 'bong-mo',
      khung: { chinh: 16, moiHam: 10 },
      deBai: 'Sola làm mẫu: dãy bãi có 5 container, mỗi ô một cái. Cẩu chạy qua từng ô và đọc mã. Biến lon giữ số lớn nhất đã gặp: đó là kỷ lục. Gặp số lớn hơn kỷ lục thì ghi kỷ lục mới. Quét xong, cẩu lùi về ô có kỷ lục. Nó đưa container đó sang ô bên kia ray. Bấm Chạy, xem cả hai sân.',
      veMaMau: 'Chương trình đã khóa. Để ý dòng lon = c: nó chỉ chạy khi c lớn hơn kỷ lục.',
      san: [SAN_DAY, SAN_DAY],
      batDau: [BD_DAY, BD_DAY],
      chong: [dayNgang(DAY_8A), dayNgang(DAY_8B)],
      bongMo: [bmKyLuc(DAY_8A, 'lon'), bmKyLuc(DAY_8B, 'lon')],
      maMau: bai(T_TIM_LON),
      loiGiai: bai(T_TIM_LON),
      sao: { o: 15, nhip: 11 },
      loiSai: [],
      goiY: ['Luna: Kỷ lục bắt đầu là -1, nhỏ hơn mọi mã. Container đầu tiên luôn phá kỷ lục.', 'Luna: Vòng while lùi từng ô, tới khi mã ở đầu cần bằng kỷ lục thì dừng.']
    }),

    manCanTai({
      so: 9, ten: 'Container số lớn nhất', hang: 'bien-the',
      mucTieu: 'bong-mo',
      khung: { chinh: 16, moiHam: 10 },
      deBai: 'Sola nhờ bạn: đưa container số lớn nhất sang ô bên kia ray, ngay đối diện chỗ nó nằm. Ba sân, mỗi sân một bộ số. Phải quét hết dãy mới biết số nào lớn nhất.',
      veMaMau: 'Mã mẫu mới chạy qua từng ô và đọc mã. Hãy giữ kỷ lục, rồi quay về lấy container kỷ lục.',
      san: [SAN_DAY, SAN_DAY, SAN_DAY],
      batDau: [BD_DAY, BD_DAY, BD_DAY],
      chong: [dayNgang(DAY_9A), dayNgang(DAY_9B), dayNgang(DAY_9C)],
      bongMo: [bmKyLuc(DAY_9A, 'lon'), bmKyLuc(DAY_9B, 'lon'), bmKyLuc(DAY_9C, 'lon')],
      maMau: bai([
        'lon = -1',
        'for i in range(5):',
        '    rail(1)',
        '    c = read_code()'
      ]),
      loiGiai: bai(T_TIM_LON),
      sao: { o: 15, nhip: 12 },
      loiSai: [
        { moTa: 'Làm theo sân 1: số lớn nhất nằm ở ô cuối nên chạy thẳng tới đó. Sân 2 số lớn nhất ở ô đầu nên lấy nhầm', baiLam: bai(['rail(5)', 'pick_up()', 'swing_left()', 'swing_left()', 'set_down()', 'wait()']), phaiCoMa: ['chua-xep-chong'] },
        { moTa: 'Ghi lon = c ở mọi ô (không có if) nên lon là số cuối, không phải số lớn nhất', baiLam: bai(['lon = -1', 'for i in range(5):', '    rail(1)', '    c = read_code()', '    lon = c', 'c = read_code()', 'while c != lon:', '    rail(-1)', '    c = read_code()', 'pick_up()', 'swing_left()', 'swing_left()', 'set_down()', 'wait()']), phaiCoMa: ['chua-xep-chong'] },
        { moTa: 'Quên cập nhật kỷ lục: ghi c vào biến khác nên lon vẫn là -1, cẩu lùi tới ô trống', baiLam: bai(['lon = -1', 'for i in range(5):', '    rail(1)', '    c = read_code()', '    if c > lon:', '        m = c', 'c = read_code()', 'while c != lon:', '    rail(-1)', '    c = read_code()', 'pick_up()', 'swing_left()', 'swing_left()', 'set_down()', 'wait()']), phaiCoMa: ['moc-hut'] }
      ],
      goiY: ['Luna: Kỷ lục mới chỉ ghi khi c lớn hơn lon.', 'Luna: Quét xong, đọc lại c, rồi lùi bằng while tới khi c bằng lon.']
    }),

    manCanTai({
      so: 10, ten: 'Trùm Đo sức nặng', hang: 'trum', nhipTheo: 'tong',
      taiToiDa: 4,
      huyHieu: { ma: 'can-tai', ten: 'Huy hiệu Đo sức nặng' },
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'carry_n', 'carry2_by'],
      deBai: 'Trùm chương 1: trên hai sân với taiToiDa = 4, dọc 3 cột (2, 4), (3, 4), (4, 4) mỗi cột có 2 kiện hàng cùng số tấn. Hãy lặp 3 lần tiến dọc đường ray: đọc w = weight(), kiểm tra if w <= 2: để bốc đôi bằng carry2_by(2) rồi swing_by(2), ngược lại thì bốc đơn 2 chuyến bằng carry_n(2, 2).',
      veMaMau: 'Hoàn thiện vòng lặp 3 cột kết hợp w = weight(), if w <= 2:, carry2_by(2) và carry_n(2, 2).',
      san: [SAN_TAI_1, SAN_TAI_1],
      batDau: [{ x: 1, y: 3, nac: 2, tam: 1 }, { x: 1, y: 3, nac: 2, tam: 1 }],
      chong: [
        [CW(2, 4, [[22, 2], [12, 2]]), CW(3, 4, [[27, 3], [17, 3]]), CW(4, 4, [[24, 2], [14, 2]])],
        [CW(2, 4, [[28, 3], [18, 3]]), CW(3, 4, [[21, 1], [11, 1]]), CW(4, 4, [[29, 3], [19, 3]])]
      ],
      tau: [tauDon(27, 2), tauDon(33, 2)],
      giao: [
        [{ tau: 0, so: [12, 14, 17, 22, 24, 27] }],
        [{ tau: 0, so: [11, 18, 19, 21, 28, 29] }]
      ],
      maMau: bai([
        'for i in range(3):',
        '    rail(1)',
        '    w = weight()',
        '    if w <= 2:',
        '        carry2_by(2)',
        '        swing_by(2)'
      ]),
      loiGiai: bai([
        'for i in range(3):',
        '    rail(1)',
        '    w = weight()',
        '    if w <= 2:',
        '        carry2_by(2)',
        '        swing_by(2)',
        '    else:',
        '        carry_n(2, 2)'
      ]),
      sao: { o: 26, nhip: 60 },
      loiGiaiKhac: {
        moTa: 'Đảo nhánh if w > 2 lên trước',
        baiLam: bai([
          'for i in range(3):',
          '    rail(1)',
          '    w = weight()',
          '    if w > 2:',
          '        carry_n(2, 2)',
          '    else:',
          '        carry2_by(2)',
          '        swing_by(2)'
        ])
      },
      loiSai: [
        { moTa: 'Dùng carry2_by(2) cho mọi cột nên gặp cặp 3 tấn bị lỗi quá tải', baiLam: bai(['for i in range(3):', '    rail(1)', '    carry2_by(2)', '    swing_by(2)']), phaiCoMa: ['qua-tai'] },
        { moTa: 'Dùng carry_n(2, 2) cho mọi cột nên sân 1 mất 39 nhịp không kịp tàu rời bến ở nhịp 27', baiLam: bai(['for i in range(3):', '    rail(1)', '    carry_n(2, 2)']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Cặp 2 tấn trở xuống bốc đôi tốn 7 nhịp mỗi cột; cặp 3 tấn bốc đơn tốn 13 nhịp mỗi cột.', 'Luna: Thêm nhánh else: gọi carry_n(2, 2) là vượt qua cả hai sân.']
    }),

    /* ========================================================================
       CHƯƠNG 2: che-can-tai (10 màn) — Chế lệnh: giữ cần an toàn
       ======================================================================== */
    manCheCanTai({
      so: 1, ten: 'Chế hàm safe_lift()', hang: 'lam-quen',
      taiToiDa: 4,
      taoHam: ['safe_lift'],
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by'],
      deBai: 'Sola nhờ bạn: mở Xưởng hàm chế safe_lift(): đọc w = weight(), if w <= 2: thì gọi pick_up2(), ngược lại gọi pick_up() để không bao giờ vượt tải 4 tấn ở tầm 1. Áp dụng gọi safe_lift(), swing_by(2), set_down() để bốc cặp kiện 2 tấn ở (3, 4) lên tàu.',
      veMaMau: 'Tạo hàm safe_lift() rồi gọi safe_lift(), swing_by(2), set_down().',
      san: SAN_TAI_1,
      batDau: { x: 3, y: 3, nac: 2, tam: 1 },
      chong: [CW(3, 4, [[24, 2], [12, 2]])],
      tau: tauDon(4, 2),
      giao: [{ tau: 0, so: [12, 24] }],
      maMau: bai([
        'safe_lift()',
        'swing_by(2)',
        'set_down()'
      ]),
      loiGiai: bai(
        ['safe_lift()', 'swing_by(2)', 'set_down()'],
        { hamCuaEmMoi: [hSafeLift()] }
      ),
      sao: { o: 15, nhip: 4 },
      loiGiaiKhac: {
        moTa: 'Dùng swing_by(-2) khi quay sang nấc 0',
        baiLam: bai(['safe_lift()', 'swing_by(-2)', 'set_down()']),
        hamCuaEmMoi: [hSafeLift()]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm safe_lift mà đã bấm Chạy', baiLam: bai(['safe_lift()', 'swing_by(2)', 'set_down()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong safe_lift dùng điều kiện w < 2 nên chỉ nhấc 1 kiện 2 tấn', baiLam: bai(['safe_lift()', 'swing_by(2)', 'set_down()']), hamCuaEmMoi: [hSafeLift(['w = weight()', 'if w < 2:', '    pick_up2()', 'else:', '    pick_up()'])], phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Thân hàm safe_lift() gồm 5 dòng: w = weight(), if w <= 2:, pick_up2(), else:, pick_up().', 'Luna: Chương trình chính gọi safe_lift(), swing_by(2), set_down().']
    }),

    manCheCanTai({
      so: 2, ten: 'Chế hàm safe_carry(d)', hang: 'lam-quen',
      taiToiDa: 4,
      taoHam: ['safe_carry'],
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'carry_n', 'carry2_by'],
      deBai: 'Sola nhờ bạn: mở Xưởng hàm chế safe_carry(d) chuyển 2 kiện ở đầu cần sang nấc cách d rồi quay về: đọc w = weight(), nếu w <= 2 thì gọi carry2_by(d) và swing_by(-d), ngược lại gọi carry_n(2, d). Áp dụng gọi safe_carry(2) để chuyển cặp kiện 3 tấn ở (3, 4) lên tàu.',
      veMaMau: 'Tạo hàm safe_carry(d) rồi gọi safe_carry(2).',
      san: SAN_TAI_1,
      batDau: { x: 3, y: 3, nac: 2, tam: 1 },
      chong: [CW(3, 4, [[28, 3], [18, 3]])],
      tau: tauDon(12, 2),
      giao: [{ tau: 0, so: [18, 28] }],
      maMau: bai(['safe_carry(2)']),
      loiGiai: bai(
        ['safe_carry(2)'],
        { hamCuaEmMoi: [hSafeCarry()] }
      ),
      sao: { o: 22, nhip: 12 },
      loiGiaiKhac: {
        moTa: 'Thêm dòng chú thích trước khi gọi safe_carry(2)',
        baiLam: bai(['# chuyển cặp kiện an toàn theo tải trọng', 'safe_carry(2)']),
        hamCuaEmMoi: [hSafeCarry()]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm safe_carry mà đã bấm Chạy', baiLam: bai(['safe_carry(2)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong safe_carry luôn gọi carry2_by(d) nên gặp cặp 3 tấn bị quá tải', baiLam: bai(['safe_carry(2)']), hamCuaEmMoi: [hSafeCarry(['carry2_by(d)', 'swing_by(-d)'])], phaiCoMa: ['qua-tai'] }
      ],
      goiY: ['Luna: Đọc w = weight() trước. Nhánh if w <= 2: gồm carry2_by(d) và swing_by(-d); nhánh else: gồm carry_n(2, d).', 'Luna: Ở chương trình chính chỉ cần gọi safe_carry(2).']
    }),

    manCheCanTai({
      so: 3, ten: 'Chế hàm safe_extend()', hang: 'lam-quen',
      taiToiDa: 4,
      taoHam: ['safe_extend'],
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by'],
      deBai: 'Sola nhờ bạn: tại (3, 4) có 2 kiện hàng: kiện nhẹ (<= 2 tấn) cần cất ra bãi sâu (3, 5) ở tầm 2 bằng pick_up(), extend(), set_down(), retract(); còn kiện nặng (> 2 tấn) không thể vươn ra tầm 2 nên giao thẳng lên tàu ở (3, 2) bằng carry_by(2) rồi swing_by(2). Hãy chế hàm safe_extend() thực hiện quy tắc đó và gọi 2 lần.',
      veMaMau: 'Tạo hàm safe_extend() rồi gọi 2 lần để xử lý 2 kiện ở (3, 4).',
      san: SAN_TAI_1,
      batDau: { x: 3, y: 3, nac: 2, tam: 1 },
      chong: [CW(3, 4, [[29, 3], [14, 2]])],
      tau: tauDon(10, 2),
      giao: [{ tau: 0, so: [29] }],
      maMau: bai([
        'safe_extend()',
        'safe_extend()'
      ]),
      loiGiai: bai(
        ['safe_extend()', 'safe_extend()'],
        { hamCuaEmMoi: [hSafeExtend()] }
      ),
      sao: { o: 21, nhip: 10 },
      loiGiaiKhac: {
        moTa: 'Dùng vòng lặp for i in range(2) gọi safe_extend()',
        baiLam: bai(['for i in range(2):', '    safe_extend()']),
        hamCuaEmMoi: [hSafeExtend()]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm safe_extend mà đã bấm Chạy', baiLam: bai(['safe_extend()', 'safe_extend()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Cố gọi extend() cho cả kiện 3 tấn nên bị quá tải ở tầm 2', baiLam: bai(['safe_extend()', 'safe_extend()']), hamCuaEmMoi: [hSafeExtend(['pick_up()', 'extend()', 'set_down()', 'retract()'])], phaiCoMa: ['qua-tai'] }
      ],
      goiY: ['Luna: Đọc w = weight() trước. Nhánh if w <= 2: gồm 4 lệnh: pick_up(), extend(), set_down(), retract().', 'Luna: Nhánh else: gồm 2 lệnh: carry_by(2) và swing_by(2).']
    }),

    manCheCanTai({
      so: 4, ten: 'Chế hàm heavy_rail()', hang: 'luyen-tap',
      taiToiDa: 4,
      taoHam: ['heavy_rail'],
      hamCuaEmCan: ['rail_drop'],
      deBai: 'Sola nhờ bạn: mở Xưởng hàm chế heavy_rail(): đọc c = read_code(), lặp while c != -1:, đọc w = weight(), nếu w <= 2 thì gọi rail_drop(-1) sang Tàu 1, ngược lại gọi rail_drop(1) sang Tàu 2, cuối vòng đọc lại c. Áp dụng gọi heavy_rail() để phân loại chồng 4 kiện ở (3, 2).',
      veMaMau: 'Tạo hàm heavy_rail() rồi gọi heavy_rail() ở chương trình chính.',
      san: SAN_TAI_2,
      batDau: { x: 3, y: 3, nac: 0, tam: 1 },
      chong: [CW(3, 2, [[27, 4], [16, 2], [23, 3], [11, 1]])],
      tau: tauDoi(12, 2),
      giao: [{ tau: 0, so: [11, 16] }, { tau: 1, so: [23, 27] }],
      maMau: bai(['heavy_rail()']),
      loiGiai: bai(
        ['heavy_rail()'],
        { hamCuaEmMoi: [hHeavyRail()] }
      ),
      sao: { o: 13, nhip: 16 },
      loiGiaiKhac: {
        moTa: 'Thêm dòng chú thích trước khi gọi heavy_rail()',
        baiLam: bai(['# phân loại toàn bộ chồng theo tải trọng', 'heavy_rail()']),
        hamCuaEmMoi: [hHeavyRail()]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm heavy_rail mà đã bấm Chạy', baiLam: bai(['heavy_rail()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong heavy_rail quên vòng lặp while nên chỉ giao được 1 kiện', baiLam: bai(['heavy_rail()']), hamCuaEmMoi: [hHeavyRail(['w = weight()', 'if w <= 2:', '    rail_drop(-1)', 'else:', '    rail_drop(1)'])] , phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Thân hàm heavy_rail(): c = read_code(), while c != -1: bọc ngoài w = weight() và khối if w <= 2: gọi rail_drop(-1) / rail_drop(1), cuối vòng c = read_code().', 'Luna: Ở chương trình chính chỉ cần gọi heavy_rail().']
    }),

    manCheCanTai({
      so: 5, ten: 'Chế hàm load_safe_stack()', hang: 'luyen-tap',
      taiToiDa: 4,
      luatThap: true,
      taoHam: ['load_safe_stack'],
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'move_tower2', 'carry2_by'],
      deBai: 'Sola nhờ bạn: chế hàm load_safe_stack(d) cho tháp 2 kiện ở nấc 2 (tầm 1), có luật tháp và taiToiDa = 4. Nếu kiện đỉnh nặng 1 tấn (cả tháp tối đa 1 + 3 = 4 tấn) thì gọi carry2_by(2) nhấc đôi thẳng lên tàu. Ngược lại thì tính t = 2 * d rồi gọi move_tower2(d, t) dời từng kiện qua bãi phụ: d = 1 là bãi bên trái, d = -1 là bãi bên phải. Hãy áp dụng cho tháp ở (2, 4) với bãi phụ bên trái (1, 3).',
      veMaMau: 'Tạo hàm load_safe_stack(d) rồi gọi load_safe_stack(1) ở chương trình chính.',
      san: SAN_TAI_3,
      batDau: { x: 2, y: 3, nac: 2, tam: 1 },
      chong: [CW(2, 4, [[28, 3], [14, 2]])],
      tau: tauDon(12, 2),
      giao: [{ tau: 0, so: [14, 28] }],
      maMau: bai(['load_safe_stack(1)']),
      loiGiai: bai(
        ['load_safe_stack(1)'],
        { hamCuaEmMoi: [hLoadSafeStack()] }
      ),
      sao: { o: 26, nhip: 12 },
      loiGiaiKhac: {
        moTa: 'Thêm chú thích trước khi gọi load_safe_stack()',
        baiLam: bai(['# chọn nhấc đôi hoặc mượn bãi phụ theo tải', 'load_safe_stack(1)']),
        hamCuaEmMoi: [hLoadSafeStack()]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm load_safe_stack mà đã bấm Chạy', baiLam: bai(['load_safe_stack(1)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong load_safe_stack dùng w <= 2 nên gọi carry2_by(2) cho tháp 5 tấn bị quá tải', baiLam: bai(['load_safe_stack(1)']), hamCuaEmMoi: [hLoadSafeStack(['w = weight()', 'if w <= 2:', '    carry2_by(2)', 'else:', '    t = 2 * d', '    move_tower2(d, t)'])], phaiCoMa: ['qua-tai'] }
      ],
      goiY: ['Luna: Vì kiện đáy nặng 3 tấn nên chỉ khi kiện đỉnh có w == 1 mới nhấc đôi được (3 + 1 = 4).', 'Luna: Thân hàm load_safe_stack(d): w = weight(), if w == 1: gọi carry2_by(2), else: t = 2 * d rồi move_tower2(d, t).']
    }),

    manCheCanTai({
      so: 6, ten: 'Quét ba cột bằng safe_carry', hang: 'luyen-tap',
      taiToiDa: 4,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'carry_n', 'carry2_by', 'safe_carry'],
      deBai: 'Sola nhờ bạn: nhờ đã có hàm safe_carry(2), việc bốc 3 cặp kiện dọc các cột (2, 4), (3, 4), (4, 4) nay cực kỳ ngắn gọn! Hãy dùng vòng lặp for i in range(3): gọi rail(1) rồi safe_carry(2).',
      veMaMau: 'Trong vòng lặp for i in range(3): hãy gọi rail(1) và safe_carry(2).',
      san: SAN_TAI_1,
      batDau: { x: 1, y: 3, nac: 2, tam: 1 },
      chong: [CW(2, 4, [[22, 2], [12, 2]]), CW(3, 4, [[28, 3], [18, 3]]), CW(4, 4, [[25, 2], [15, 2]])],
      tau: tauDon(27, 2),
      giao: [{ tau: 0, so: [12, 15, 18, 22, 25, 28] }],
      maMau: bai([
        'for i in range(3):',
        '    rail(1)'
      ]),
      loiGiai: bai([
        'for i in range(3):',
        '    rail(1)',
        '    safe_carry(2)'
      ]),
      sao: { o: 27, nhip: 27 },
      loiGiaiKhac: {
        moTa: 'Viết 3 lần rail(1) và safe_carry(2) liên tiếp',
        baiLam: bai([
          'rail(1)',
          'safe_carry(2)',
          'rail(1)',
          'safe_carry(2)',
          'rail(1)',
          'safe_carry(2)'
        ])
      },
      loiSai: [
        { moTa: 'Mới trượt dọc đường ray mà quên gọi safe_carry(2)', baiLam: bai(['for i in range(3):', '    rail(1)']), phaiCoMa: ['chua-giao-tau'] },
        { moTa: 'Chỉ lặp 2 lần nên bỏ sót cặp kiện ở cột 4', baiLam: bai(['for i in range(2):', '    rail(1)', '    safe_carry(2)']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Hàm safe_carry(2) đã tự đọc w = weight(), hỏi w <= 2 và tự quay đầu cần về nấc 2 sau khi giao.', 'Luna: Thêm safe_carry(2) ngay dưới rail(1) trong vòng lặp for.']
    }),

    manCheCanTai({
      so: 7, ten: 'Sửa hàm check_load(n)', hang: 'bien-the',
      taiToiDa: 4,
      chinhCoDinh: true,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'carry_n', 'carry2_by'],
      deBai: 'Sola nhờ bạn: hàm check_load(n) của màn cần quét qua n cột dọc đường ray, cột nào có w <= 2 (w = weight()) thì nhấc đôi bằng carry2_by(2) rồi swing_by(2), ngược lại thì nhấc đơn bằng carry_n(2, 2). Nhưng hàm đang viết nhầm điều kiện thành w >= 2 nên gặp cặp 3 tấn bị quá tải! Hãy sửa lại hàm check_load(n).',
      veMaMau: 'Chương trình chính đã khóa. Hãy sửa >= 2 thành <= 2 trong hàm check_load(n).',
      san: SAN_TAI_1,
      batDau: { x: 1, y: 3, nac: 2, tam: 1 },
      chong: [CW(2, 4, [[21, 1], [11, 1]]), CW(3, 4, [[27, 3], [17, 3]])],
      tau: tauDon(20, 2),
      giao: [{ tau: 0, so: [11, 17, 21, 27] }],
      maMau: bai(
        ['check_load(2)'],
        { hamCuaMan: [hCheckLoad(T_CHECK_LOAD_SAI)] }
      ),
      loiGiai: bai(
        ['check_load(2)'],
        { hamCuaMan: [hCheckLoad(T_CHECK_LOAD_DUNG)] }
      ),
      sao: { o: 27, nhip: 20 },
      loiGiaiKhac: {
        moTa: 'Dùng điều kiện w < 3 thay cho w <= 2',
        baiLam: bai(
          ['check_load(2)'],
          {
            hamCuaMan: [H('check_load', ['n'], [
              'for i in range(n):',
              '    rail(1)',
              '    w = weight()',
              '    if w < 3:',
              '        carry2_by(2)',
              '        swing_by(2)',
              '    else:',
              '        carry_n(2, 2)'
            ])]
          }
        )
      },
      loiSai: [
        { moTa: 'Để nguyên hàm mẫu dùng >= 2 nên ở cột 3 gọi carry2_by(2) cho cặp 3 tấn bị quá tải', baiLam: bai(['check_load(2)'], { hamCuaMan: [hCheckLoad(T_CHECK_LOAD_SAI)] }), phaiCoMa: ['qua-tai'] },
        { moTa: 'Dùng carry2_by(2) cho mọi cột nên vẫn bị quá tải ở cột 3', baiLam: bai(['check_load(2)'], { hamCuaMan: [hCheckLoad(['for i in range(n):', '    rail(1)', '    carry2_by(2)', '    swing_by(2)'])] }), phaiCoMa: ['qua-tai'] }
      ],
      goiY: ['Luna: Điều kiện >= 2 khiến cặp 3 tấn rơi vào nhánh carry2_by(2) gây quá tải (6 > 4).', 'Luna: Đổi dòng điều kiện thành if w <= 2: trong hàm check_load(n).']
    }),

    manCheCanTai({
      so: 8, ten: 'Kiện nặng nhất', hang: 'bien-the',
      mucTieu: 'bong-mo',
      khung: { chinh: 16, moiHam: 10 },
      deBai: 'Sola nhờ bạn: lần này tìm kiện NẶNG nhất, không phải số lớn nhất. Đưa nó sang ô bên kia ray, ngay đối diện chỗ nó nằm. Ba sân, mỗi sân một bộ kiện.',
      veMaMau: 'weight() cho biết số tấn của kiện ở đầu cần. Hãy giữ kỷ lục số tấn.',
      san: [SAN_DAY, SAN_DAY, SAN_DAY],
      batDau: [BD_DAY, BD_DAY, BD_DAY],
      chong: [dayNgang(DAY_C8A), dayNgang(DAY_C8B), dayNgang(DAY_C8C)],
      bongMo: [bmKyLuc(DAY_C8A, 'nang'), bmKyLuc(DAY_C8B, 'nang'), bmKyLuc(DAY_C8C, 'nang')],
      maMau: bai([
        'nang = 0',
        'for i in range(5):',
        '    rail(1)'
      ]),
      loiGiai: bai([
        'nang = 0',
        'for i in range(5):',
        '    rail(1)',
        '    w = weight()',
        '    if w > nang:',
        '        nang = w',
        'w = weight()',
        'while w != nang:',
        '    rail(-1)',
        '    w = weight()',
        'pick_up()',
        'swing_left()',
        'swing_left()',
        'set_down()',
        'wait()'
      ]),
      sao: { o: 15, nhip: 11 },
      loiSai: [
        { moTa: 'Vẫn tìm số lớn nhất bằng read_code() nên lấy kiện số lớn mà nhẹ', baiLam: bai(T_TIM_LON), phaiCoMa: ['chua-xep-chong'] },
        { moTa: 'Làm theo sân 1: kiện nặng nhất ở ô 2 nên chạy thẳng tới đó. Sân khác lấy nhầm', baiLam: bai(['rail(2)', 'pick_up()', 'swing_left()', 'swing_left()', 'set_down()', 'wait()']), phaiCoMa: ['chua-xep-chong'] },
        { moTa: 'Quên cập nhật kỷ lục nên nang vẫn là 0, cẩu lùi tới ô trống', baiLam: bai(['nang = 0', 'for i in range(5):', '    rail(1)', '    w = weight()', '    if w > nang:', '        m = w', 'w = weight()', 'while w != nang:', '    rail(-1)', '    w = weight()', 'pick_up()', 'swing_left()', 'swing_left()', 'set_down()', 'wait()']), phaiCoMa: ['moc-hut'] }
      ],
      goiY: ['Luna: Số trên container không cho biết nó nặng bao nhiêu. Hãy hỏi weight().', 'Luna: Kỷ lục số tấn bắt đầu là 0. Ô trống cũng cho weight() bằng 0.']
    }),

    manCheCanTai({
      so: 9, ten: 'Hai bến dời tháp an toàn', hang: 'bien-the', nhipTheo: 'tong',
      taiToiDa: 4,
      luatThap: true,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'move_tower2', 'carry2_by', 'load_safe_stack'],
      deBai: 'Sola nhờ bạn: trên hai sân có luật tháp và taiToiDa = 4, tại (2, 4) và (4, 4) đều có một tháp 2 kiện (có tháp nhẹ nhấc đôi được, có tháp nặng phải mượn bãi phụ). Bệ cẩu bắt đầu ở (2, 3) hướng nấc 2. Hãy gọi load_safe_stack(1) cho cột 2 (bãi phụ bên trái (1, 3)), trượt rail(2) sang cột 4, quay về nấc 2 bằng swing_by(2) rồi gọi load_safe_stack(-1) (bãi phụ bên phải (5, 3)).',
      veMaMau: 'Sau load_safe_stack(1) và rail(2), hãy quay về nấc 2 rồi gọi load_safe_stack(-1).',
      san: [SAN_TAI_3, SAN_TAI_3],
      batDau: [{ x: 2, y: 3, nac: 2, tam: 1 }, { x: 2, y: 3, nac: 2, tam: 1 }],
      chong: [
        [CW(2, 4, [[22, 2], [11, 1]]), CW(4, 4, [[28, 3], [14, 2]])],
        [CW(2, 4, [[30, 3], [15, 2]]), CW(4, 4, [[24, 2], [12, 1]])]
      ],
      tau: [tauDon(20, 2), tauDon(20, 2)],
      giao: [
        [{ tau: 0, so: [11, 14, 22, 28] }],
        [{ tau: 0, so: [12, 15, 24, 30] }]
      ],
      maMau: bai([
        'load_safe_stack(1)',
        'rail(2)'
      ]),
      loiGiai: bai([
        'load_safe_stack(1)',
        'rail(2)',
        'swing_by(2)',
        'load_safe_stack(-1)'
      ]),
      sao: { o: 32, nhip: 40 },
      loiGiaiKhac: {
        moTa: 'Quay về nấc 2 bằng swing_by(2) trước khi trượt rail(2)',
        baiLam: bai([
          'load_safe_stack(1)',
          'swing_by(2)',
          'rail(2)',
          'load_safe_stack(-1)'
        ])
      },
      loiSai: [
        { moTa: 'Mới dời tháp ở cột 2, chưa dời tháp ở cột 4', baiLam: bai(['load_safe_stack(1)', 'rail(2)']), phaiCoMa: ['chua-giao-tau'] },
        { moTa: 'Quên gọi swing_by(2) nên gọi load_safe_stack(-1) khi đầu cần đang ở nấc 0', baiLam: bai(['load_safe_stack(1)', 'rail(2)', 'load_safe_stack(-1)']), phaiCoMa: ['moc-hut'] },
        { moTa: 'Ở cột 4 vẫn gọi load_safe_stack(1) nên tháp nặng mượn bãi trên đường ray (3, 3)', baiLam: bai(['load_safe_stack(1)', 'rail(2)', 'swing_by(2)', 'load_safe_stack(1)']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Dù đi nhánh carry2_by(2) hay move_tower2, hàm load_safe_stack(d) đều kết thúc tại nấc 0.', 'Luna: Sau rail(2), gọi swing_by(2) về nấc 2 rồi gọi load_safe_stack(-1): bãi phụ bên trái (3, 3) là đường ray, nên mượn bãi bên phải.']
    }),

    manCheCanTai({
      so: 10, ten: 'Trùm Chế lệnh: giữ cần an toàn', hang: 'trum', nhipTheo: 'tong',
      taiToiDa: 4,
      huyHieu: { ma: 'che-can-tai', ten: 'Huy hiệu Chế lệnh: giữ cần an toàn' },
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'carry_n', 'carry2_by', 'safe_carry', 'rail_drop', 'heavy_rail'],
      deBai: 'Trùm chương 2: trên hai sân với taiToiDa = 4, bệ cẩu bắt đầu ở (3, 3) hướng nấc 2. Tại (3, 4) có 2 kiện hàng cùng số tấn và tại cầu cảng (3, 2) cũng có sẵn 2 kiện. Hãy gọi safe_carry(2) để đưa cặp ở (3, 4) ra (3, 2) an toàn, quay cần về nấc 0 bằng swing_by(2), rồi gọi heavy_rail() để phân loại cả 4 kiện sang Tàu 1 (<= 2 tấn) và Tàu 2 (> 2 tấn).',
      veMaMau: 'Kết hợp safe_carry(2), swing_by(2) và heavy_rail().',
      san: [SAN_TAI_2, SAN_TAI_2],
      batDau: [{ x: 3, y: 3, nac: 2, tam: 1 }, { x: 3, y: 3, nac: 2, tam: 1 }],
      chong: [
        [CW(3, 4, [[24, 2], [12, 2]]), CW(3, 2, [[28, 4], [19, 3]])],
        [CW(3, 4, [[29, 3], [17, 3]]), CW(3, 2, [[21, 1], [15, 2]])]
      ],
      tau: [tauDoi(20, 2), tauDoi(26, 2)],
      giao: [
        [{ tau: 0, so: [12, 24] }, { tau: 1, so: [19, 28] }],
        [{ tau: 0, so: [15, 21] }, { tau: 1, so: [17, 29] }]
      ],
      maMau: bai([
        'safe_carry(2)',
        'swing_by(2)'
      ]),
      loiGiai: bai([
        'safe_carry(2)',
        'swing_by(2)',
        'heavy_rail()'
      ]),
      sao: { o: 39, nhip: 54 },
      loiGiaiKhac: {
        moTa: 'Dùng swing_by(-2) khi quay về nấc 0',
        baiLam: bai([
          'safe_carry(2)',
          'swing_by(-2)',
          'heavy_rail()'
        ])
      },
      loiSai: [
        { moTa: 'Mới dồn hàng ra (3, 2), quên gọi heavy_rail() để phân loại lên hai tàu', baiLam: bai(['safe_carry(2)', 'swing_by(2)']), phaiCoMa: ['chua-giao-tau'] },
        { moTa: 'Dùng carry2_by(2) thay vì safe_carry(2) nên ở sân 2 gặp cặp 3 tấn bị quá tải', baiLam: bai(['carry2_by(2)', 'heavy_rail()']), phaiCoMa: ['qua-tai'] }
      ],
      goiY: ['Luna: Sân 1 ở (3, 4) là cặp 2 tấn còn sân 2 ở (3, 4) là cặp 3 tấn, nên safe_carry(2) sẽ tự xử lý đúng cho cả hai sân.', 'Luna: Sau swing_by(2), gọi heavy_rail() để phân loại cả 4 kiện ở (3, 2) lên hai tàu.']
    })
  ];

  ManHoc.manCanTai = DS;
  if (laNode) module.exports = DS;
})();
