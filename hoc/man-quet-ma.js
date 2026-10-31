/* ============================================================================
   man-quet-ma.js — "Robot Chấn Hưng": GÓI 3 MÙA 4 "CẢNG SÔNG" (ĐẦU ĐỌC MÃ CONTAINER)
   Gồm 20 màn mới trên Cần cẩu R1 gắn móc cẩu + đầu đọc mã (quet-ma):
   - quet-ma.1..10     (10 màn chương quet-ma "Đọc mã số")
   - che-quet-ma.1..10 (10 màn chương che-quet-ma "Chế lệnh: phân loại theo mã")
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var HAM_QUET = ['swing_left', 'swing_right', 'extend', 'retract', 'pick_up', 'set_down', 'read_code', 'wait'];
  var ROBOT_QUET = { than: 'cau', tay: 'moc-cau', camBien: [{ ma: 'quet-ma', o: 'tren' }] };
  var CAU_TRUC = ['for', 'if', 'while', 'list'];

  var SAN_CANG = [
    '~~~~~~~',
    '.D.D.D.',
    '..DDD..',
    '.DD.DD.',
    '..DDD..',
    '.D.D.D.',
    'D..D..D'
  ];

  var SAN_CANG_RONG = [
    '~~~~~~~',
    '.D.D.D.',
    '..DDD..',
    'DDD.DDD',
    '..DDD..',
    '.D.D.D.',
    'D..D..D'
  ];

  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function bai(chinh, phu) {
    var kq = { chinh: chinh.slice() };
    if (phu && phu.hamCuaMan) kq.hamCuaMan = phu.hamCuaMan;
    if (phu && phu.hamCuaEmMoi) kq.hamCuaEmMoi = phu.hamCuaEmMoi;
    return kq;
  }

  function C(x, y, so) {
    return { x: x, y: y, cont: so.map(function (n) { return { so: n }; }) };
  }
  function BM(chong) {
    return {
      x: 3, y: 3,
      chong: chong.map(function (q) { return { x: q.x, y: q.y, so: q.so.slice() }; })
    };
  }

  // Các hàm chế ở Gói 3 chương che-quet-ma
  var T_SORT_PARITY = [
    'if read_code() % 2 == 0:',
    '    carry_by(-1)',
    '    swing_by(1)',
    'else:',
    '    carry_by(1)',
    '    swing_by(-1)'
  ];
  var T_SORT_ALL_PARITY = [
    'while read_code() != -1:',
    '    sort_parity()'
  ];
  var T_CLEAR_STACK = [
    'while read_code() != -1:',
    '    carry_by(d)',
    '    swing_by(-d)'
  ];
  var T_ROUTE_TENS = [
    'k = read_code() // 10',
    'carry_by(k)',
    'swing_by(-k)'
  ];
  var T_PULL_MATCH_SAI = [
    'while read_code() // 10 == r:',
    '    haul_to(0, -1)',
    '    reach_by(1)'
  ];
  var T_PULL_MATCH_DUNG = [
    'while read_code() % 10 == r:',
    '    haul_to(0, -1)',
    '    reach_by(1)'
  ];
  var T_ROUTE_ALL_TENS = [
    'while read_code() != -1:',
    '    route_tens()'
  ];

  function hSortParity(than) { return H('sort_parity', [], than || T_SORT_PARITY); }
  function hSortAllParity(than) { return H('sort_all_parity', [], than || T_SORT_ALL_PARITY); }
  function hClearStack(than) { return H('clear_stack', ['d'], than || T_CLEAR_STACK); }
  function hRouteTens(than) { return H('route_tens', [], than || T_ROUTE_TENS); }
  function hPullMatch(than) { return H('pull_matching', ['r'], than || T_PULL_MATCH_DUNG); }
  function hRouteAllTens(than) { return H('route_all_tens', [], than || T_ROUTE_ALL_TENS); }

  function manQuetMa(cfg) {
    return ManHoc.chuanHoa(Object.assign({
      chuong: 'quet-ma',
      loaiRobot: 'cau',
      robot: ROBOT_QUET,
      vo: 'cang',
      hamGoc: HAM_QUET,
      cauTruc: CAU_TRUC,
      khung: { chinh: 10, moiHam: 10 },
      moXuong: true,
      mucTieu: 'bong-mo',
      hamCuaEmCan: [],
      taoHam: []
    }, cfg));
  }

  function manCheQuetMa(cfg) {
    return ManHoc.chuanHoa(Object.assign({
      chuong: 'che-quet-ma',
      loaiRobot: 'cau',
      robot: ROBOT_QUET,
      vo: 'cang',
      hamGoc: HAM_QUET,
      cauTruc: CAU_TRUC,
      khung: { chinh: 10, moiHam: 10 },
      moXuong: true,
      mucTieu: 'bong-mo',
      hamCuaEmCan: [],
      taoHam: []
    }, cfg));
  }

  var DS = [
    /* ========================================================================
       CHƯƠNG 1: quet-ma (10 màn) — Đọc mã số
       ======================================================================== */
    manQuetMa({
      so: 1, ten: 'Thử đầu đọc mã read_code()', hang: 'lam-quen',
      chiChay: true, chinhCoDinh: true,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by'],
      deBai: 'Sola làm mẫu: đầu cần cẩu đã gắn cảm biến read_code() đọc mã số của container trên cùng tại ô đầu cần (trả về -1 nếu ô trống), không tốn nhịp. Bấm Chạy để xem cần cẩu kiểm tra mã chẵn 14 và đưa sang nấc 1.',
      veMaMau: 'Chương trình mẫu đã khóa. Bấm Chạy để quan sát read_code() đọc mã trước khi nhấc.',
      san: SAN_CANG,
      batDau: { x: 3, y: 3, nac: 2, tam: 2 },
      chong: [C(5, 3, [14])],
      bongMo: BM([{ x: 5, y: 1, so: [14] }]),
      maMau: bai([
        'if read_code() % 2 == 0:',
        '    carry_by(-1)',
        'else:',
        '    carry_by(1)'
      ]),
      loiGiai: bai([
        'if read_code() % 2 == 0:',
        '    carry_by(-1)',
        'else:',
        '    carry_by(1)'
      ]),
      sao: { o: 13, nhip: 3 },
      loiSai: [],
      goiY: ['Luna: Bấm nút Chạy để xem read_code() đọc mã số trên lưng container.', 'Luna: Lưu ý gọi read_code() khi container còn nằm ở ô dưới đầu cần, trước khi pick_up().']
    }),

    manQuetMa({
      so: 2, ten: 'Phân loại kiện chẵn lẻ', hang: 'lam-quen', nhipTheo: 'tong',
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by'],
      deBai: 'Sola nhờ bạn: trên hai sân, kiện hàng tại nấc 2 tầm 2 (5, 3) có mã khác nhau. Nếu mã chẵn (read_code() % 2 == 0) thì chuyển sang nấc 1 bằng carry_by(-1), ngược lại mã lẻ thì chuyển sang nấc 3 bằng carry_by(1).',
      veMaMau: 'Đã có nhánh if cho mã chẵn. Hãy viết thêm nhánh else cho mã lẻ.',
      san: [SAN_CANG, SAN_CANG],
      batDau: [{ x: 3, y: 3, nac: 2, tam: 2 }, { x: 3, y: 3, nac: 2, tam: 2 }],
      chong: [
        [C(5, 3, [12])],
        [C(5, 3, [15])]
      ],
      bongMo: [
        BM([{ x: 5, y: 1, so: [12] }]),
        BM([{ x: 5, y: 5, so: [15] }])
      ],
      maMau: bai([
        'if read_code() % 2 == 0:',
        '    carry_by(-1)'
      ]),
      loiGiai: bai([
        'if read_code() % 2 == 0:',
        '    carry_by(-1)',
        'else:',
        '    carry_by(1)'
      ]),
      sao: { o: 15, nhip: 6 },
      loiGiaiKhac: {
        moTa: 'Kiểm tra mã lẻ trước rồi mới else sang mã chẵn',
        baiLam: bai([
          'if read_code() % 2 == 1:',
          '    carry_by(1)',
          'else:',
          '    carry_by(-1)'
        ])
      },
      loiSai: [
        { moTa: 'Thiếu nhánh else nên sân có mã lẻ không được chuyển đi', baiLam: bai(['if read_code() % 2 == 0:', '    carry_by(-1)']), phaiCoMa: ['chua-xep-chong'] },
        { moTa: 'Đổi ngược hướng của chẵn và lẻ', baiLam: bai(['if read_code() % 2 == 0:', '    carry_by(1)', 'else:', '    carry_by(-1)']), phaiCoMa: ['chua-xep-chong'] }
      ],
      goiY: ['Luna: Dùng read_code() % 2 == 0 để kiểm tra mã chẵn.', 'Luna: Trong nhánh else, gọi carry_by(1) để đưa kiện lẻ sang nấc 3.']
    }),

    manQuetMa({
      so: 3, ten: 'Đọc chữ số hàng chục bằng // 10', hang: 'lam-quen', nhipTheo: 'tong',
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by'],
      deBai: 'Sola nhờ bạn: chữ số hàng chục của mã container (read_code() // 10) cho biết cần chuyển kiện hàng sang phải bao nhiêu nấc từ nấc 2. Hãy đọc mã và gọi carry_by(read_code() // 10).',
      veMaMau: 'Lấy k = read_code() // 10 rồi gọi carry_by(k).',
      san: [SAN_CANG, SAN_CANG],
      batDau: [{ x: 3, y: 3, nac: 2, tam: 2 }, { x: 3, y: 3, nac: 2, tam: 2 }],
      chong: [
        [C(5, 3, [18])],
        [C(5, 3, [27])]
      ],
      bongMo: [
        BM([{ x: 5, y: 5, so: [18] }]),
        BM([{ x: 3, y: 5, so: [27] }])
      ],
      maMau: bai(['k = read_code()']),
      loiGiai: bai(['carry_by(read_code() // 10)']),
      sao: { o: 10, nhip: 7 },
      loiGiaiKhac: {
        moTa: 'Lưu chữ số hàng chục vào biến k rồi mới gọi carry_by(k)',
        baiLam: bai(['k = read_code() // 10', 'carry_by(k)'])
      },
      loiSai: [
        { moTa: 'Dùng % 10 thay vì // 10 nên quay sai số nấc', baiLam: bai(['carry_by(read_code() % 10)']), phaiCoMa: ['chua-xep-chong'] },
        { moTa: 'Viết cứng carry_by(1) nên chỉ đúng sân đầu', baiLam: bai(['carry_by(1)']), phaiCoMa: ['chua-xep-chong'] }
      ],
      goiY: ['Luna: Với mã 18 thì 18 // 10 = 1; với mã 27 thì 27 // 10 = 2.', 'Luna: Chỉ cần gọi carry_by(read_code() // 10) là đúng cho cả hai sân.']
    }),

    manQuetMa({
      so: 4, ten: 'Đọc chữ số hàng đơn vị bằng % 10', hang: 'luyen', nhipTheo: 'tong',
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'reach_by', 'aim_crane', 'haul_to'],
      deBai: 'Sola nhờ bạn: kiện hàng ở nấc 2 tầm 1 (4, 3) có chữ số hàng đơn vị (read_code() % 10) là số bước cần vươn thêm ra ngoài. Hãy dùng haul_to(0, read_code() % 10) để đưa kiện hàng ra đúng tầm.',
      veMaMau: 'Đọc phần dư read_code() % 10 và truyền vào tham số thứ hai của haul_to.',
      san: [SAN_CANG_RONG, SAN_CANG_RONG],
      batDau: [{ x: 3, y: 3, nac: 2, tam: 1 }, { x: 3, y: 3, nac: 2, tam: 1 }],
      chong: [
        [C(4, 3, [31])],
        [C(4, 3, [42])]
      ],
      bongMo: [
        BM([{ x: 5, y: 3, so: [31] }]),
        BM([{ x: 6, y: 3, so: [42] }])
      ],
      maMau: bai(['r = read_code()']),
      loiGiai: bai(['haul_to(0, read_code() % 10)']),
      sao: { o: 12, nhip: 7 },
      loiGiaiKhac: {
        moTa: 'Gán r = read_code() % 10 trước khi gọi haul_to(0, r)',
        baiLam: bai(['r = read_code() % 10', 'haul_to(0, r)'])
      },
      loiSai: [
        { moTa: 'Dùng // 10 thay vì % 10 nên vươn quá tầm cần cẩu', baiLam: bai(['haul_to(0, read_code() // 10)']), phaiCoMa: ['can-het-tam', 'chua-xep-chong'] },
        { moTa: 'Ghi cứng haul_to(0, 1) nên sai ở sân thứ hai', baiLam: bai(['haul_to(0, 1)']), phaiCoMa: ['chua-xep-chong'] }
      ],
      goiY: ['Luna: Phép chia dư % 10 lấy chữ số hàng đơn vị (31 % 10 = 1, 42 % 10 = 2).', 'Luna: Gọi haul_to(0, read_code() % 10) để giữ nguyên nấc và vươn đúng tầm.']
    }),

    manQuetMa({
      so: 5, ten: 'Giải mã cả nấc lẫn tầm', hang: 'luyen', nhipTheo: 'tong',
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'reach_by', 'aim_crane', 'haul_to'],
      deBai: 'Sola nhờ bạn: kiện hàng ở (4, 3) (nấc 2, tầm 1) mang mã số có hàng chục là độ lệch nấc và hàng đơn vị là độ lệch tầm. Hãy lưu c = read_code() rồi gọi haul_to(c // 10, c % 10).',
      veMaMau: 'Đã có dòng c = read_code(). Hãy gọi haul_to(c // 10, c % 10).',
      san: [SAN_CANG_RONG, SAN_CANG_RONG],
      batDau: [{ x: 3, y: 3, nac: 2, tam: 1 }, { x: 3, y: 3, nac: 2, tam: 1 }],
      chong: [
        [C(4, 3, [11])],
        [C(4, 3, [22])]
      ],
      bongMo: [
        BM([{ x: 5, y: 5, so: [11] }]),
        BM([{ x: 3, y: 6, so: [22] }])
      ],
      maMau: bai(['c = read_code()']),
      loiGiai: bai(['c = read_code()', 'haul_to(c // 10, c % 10)']),
      sao: { o: 19, nhip: 10 },
      loiGiaiKhac: {
        moTa: 'Gọi trực tiếp read_code() trong đối số của haul_to',
        baiLam: bai(['haul_to(read_code() // 10, read_code() % 10)'])
      },
      loiSai: [
        { moTa: 'Gọi pick_up() trước khi đọc read_code() nên c nhận giá trị -1', baiLam: bai(['pick_up()', 'c = read_code()', 'aim_crane(c // 10, c % 10)', 'set_down()']), phaiCoMa: ['can-het-tam', 'chua-xep-chong'] },
        { moTa: 'Chỉ truyền c // 10 mà quên vươn tầm c % 10', baiLam: bai(['c = read_code()', 'haul_to(c // 10, 0)']), phaiCoMa: ['chua-xep-chong'] }
      ],
      goiY: ['Luna: Đọc c = read_code() ngay khi container còn nằm ở (4, 3).', 'Luna: Gọi haul_to(c // 10, c % 10) để chuyển kiện tới đúng nấc và tầm.']
    }),

    manQuetMa({
      so: 6, ten: 'Dọn chồng bằng vòng while', hang: 'luyen', nhipTheo: 'tong',
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by'],
      deBai: 'Sola nhờ bạn: chồng hàng tại nấc 2 tầm 2 (5, 3) có số kiện khác nhau ở hai sân. Dùng while read_code() != -1: để chuyển từng kiện sang nấc 3 (5, 5) rồi quay lại nấc 2 cho tới khi chồng trống.',
      veMaMau: 'Hoàn thiện thân vòng while: gọi carry_by(1) rồi swing_by(-1).',
      san: [SAN_CANG, SAN_CANG],
      batDau: [{ x: 3, y: 3, nac: 2, tam: 2 }, { x: 3, y: 3, nac: 2, tam: 2 }],
      chong: [
        [C(5, 3, [10, 20])],
        [C(5, 3, [10, 20, 30])]
      ],
      bongMo: [
        BM([{ x: 5, y: 5, so: [20, 10] }]),
        BM([{ x: 5, y: 5, so: [30, 20, 10] }])
      ],
      maMau: bai([
        'while read_code() != -1:',
        '    carry_by(1)'
      ]),
      loiGiai: bai([
        'while read_code() != -1:',
        '    carry_by(1)',
        '    swing_by(-1)'
      ]),
      sao: { o: 14, nhip: 20 },
      loiGiaiKhac: {
        moTa: 'Viết while read_code() > 0: thay cho != -1',
        baiLam: bai([
          'while read_code() > 0:',
          '    carry_by(1)',
          '    swing_by(-1)'
        ])
      },
      loiSai: [
        { moTa: 'Quên swing_by(-1) trong while nên cần cẩu nhấc đi nhấc lại ở nấc 3 vô hạn', baiLam: bai(['while read_code() != -1:', '    carry_by(1)']), phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Dùng for cố định 2 lần nên sân thứ hai còn sót kiện 10', baiLam: bai(['for i in range(2):', '    carry_by(1)', '    swing_by(-1)']), phaiCoMa: ['chua-xep-chong'] }
      ],
      goiY: ['Luna: Khi chồng ở nấc 2 hết hàng, read_code() trả về -1 và vòng while tự dừng.', 'Luna: Sau carry_by(1), bắt buộc phải swing_by(-1) về nấc 2 để kiểm tra kiện tiếp theo.']
    }),

    manQuetMa({
      so: 7, ten: 'Phân loại chẵn lẻ cả chồng', hang: 'bien-the', nhipTheo: 'tong',
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by'],
      deBai: 'Sola nhờ bạn: dùng while read_code() != -1: tách hết chồng hàng ở nấc 2 (5, 3): kiện chẵn đưa sang nấc 1 (carry_by(-1) rồi swing_by(1)), kiện lẻ đưa sang nấc 3 (carry_by(1) rồi swing_by(-1)).',
      veMaMau: 'Đã có nhánh if cho kiện chẵn trong vòng while. Hãy viết tiếp nhánh else cho kiện lẻ.',
      san: [SAN_CANG, SAN_CANG],
      batDau: [{ x: 3, y: 3, nac: 2, tam: 2 }, { x: 3, y: 3, nac: 2, tam: 2 }],
      chong: [
        [C(5, 3, [11, 24, 32])],
        [C(5, 3, [18, 25, 37])]
      ],
      bongMo: [
        BM([{ x: 5, y: 1, so: [32, 24] }, { x: 5, y: 5, so: [11] }]),
        BM([{ x: 5, y: 1, so: [18] }, { x: 5, y: 5, so: [37, 25] }])
      ],
      maMau: bai([
        'while read_code() != -1:',
        '    if read_code() % 2 == 0:',
        '        carry_by(-1)',
        '        swing_by(1)'
      ]),
      loiGiai: bai([
        'while read_code() != -1:',
        '    if read_code() % 2 == 0:',
        '        carry_by(-1)',
        '        swing_by(1)',
        '    else:',
        '        carry_by(1)',
        '        swing_by(-1)'
      ]),
      sao: { o: 18, nhip: 24 },
      loiGiaiKhac: {
        moTa: 'Dùng vòng for 3 lần vì cả hai sân đều có 3 kiện',
        baiLam: bai([
          'for i in range(3):',
          '    if read_code() % 2 == 0:',
          '        carry_by(-1)',
          '        swing_by(1)',
          '    else:',
          '        carry_by(1)',
          '        swing_by(-1)'
        ])
      },
      loiSai: [
        { moTa: 'Quên quay lại nấc 2 ở nhánh else nên vòng lặp kẹt ở nấc 3', baiLam: bai(['while read_code() != -1:', '    if read_code() % 2 == 0:', '        carry_by(-1)', '        swing_by(1)', '    else:', '        carry_by(1)']), phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Đưa cả kiện chẵn lẫn kiện lẻ sang cùng nấc 1', baiLam: bai(['while read_code() != -1:', '    carry_by(-1)', '    swing_by(1)']), phaiCoMa: ['chua-xep-chong'] }
      ],
      goiY: ['Luna: Sau khi hạ kiện lẻ ở nấc 3 bằng carry_by(1), nhớ gọi swing_by(-1) để quay về nấc 2.', 'Luna: Sau khi hạ kiện chẵn ở nấc 1 bằng carry_by(-1), gọi swing_by(1) để quay về nấc 2.']
    }),

    manQuetMa({
      so: 8, ten: 'Dọn tới khi gặp kiện tròn chục', hang: 'bien-the', nhipTheo: 'tong',
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by'],
      deBai: 'Sola nhờ bạn: dưới đáy chồng ở nấc 2 (5, 3) có một kiện hàng tròn chục (mã chia hết cho 10) cần giữ nguyên tại chỗ. Hãy dùng while read_code() % 10 != 0: để dời hết các kiện lẻ phía trên sang nấc 3 (5, 5).',
      veMaMau: 'Kiểm tra điều kiện read_code() % 10 != 0 trong vòng while.',
      san: [SAN_CANG, SAN_CANG],
      batDau: [{ x: 3, y: 3, nac: 2, tam: 2 }, { x: 3, y: 3, nac: 2, tam: 2 }],
      chong: [
        [C(5, 3, [20, 23, 27])],
        [C(5, 3, [30, 35])]
      ],
      bongMo: [
        BM([{ x: 5, y: 3, so: [20] }, { x: 5, y: 5, so: [27, 23] }]),
        BM([{ x: 5, y: 3, so: [30] }, { x: 5, y: 5, so: [35] }])
      ],
      maMau: bai([
        'while read_code() % 10 != 0:',
        '    carry_by(1)'
      ]),
      loiGiai: bai([
        'while read_code() % 10 != 0:',
        '    carry_by(1)',
        '    swing_by(-1)'
      ]),
      sao: { o: 14, nhip: 12 },
      loiGiaiKhac: {
        moTa: 'Thêm dòng chú thích bên trong vòng while',
        baiLam: bai([
          'while read_code() % 10 != 0:',
          '    # dời kiện không tròn chục sang nấc 3',
          '    carry_by(1)',
          '    swing_by(-1)'
        ])
      },
      loiSai: [
        { moTa: 'Dùng while read_code() != -1: nên dời luôn cả kiện tròn chục ở đáy', baiLam: bai(['while read_code() != -1:', '    carry_by(1)', '    swing_by(-1)']), phaiCoMa: ['chua-xep-chong'] },
        { moTa: 'Quên swing_by(-1) nên cần cẩu đứng ở nấc 3 lặp mãi', baiLam: bai(['while read_code() % 10 != 0:', '    carry_by(1)']), phaiCoMa: ['vong-vo-han'] }
      ],
      goiY: ['Luna: Kiện tròn chục có chữ số tận cùng bằng 0 nên read_code() % 10 == 0.', 'Luna: Vòng while read_code() % 10 != 0: sẽ dừng ngay khi lộ ra kiện tròn chục ở đáy.']
    }),

    manQuetMa({
      so: 9, ten: 'Quét ba nấc rút kiện mã lớn', hang: 'bien-the', nhipTheo: 'tong',
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'reach_by', 'aim_crane', 'haul_to'],
      deBai: 'Sola nhờ bạn: quét qua 3 nấc liên tiếp (nấc 1, 2, 3 ở tầm 2). Tại mỗi nấc, nếu container có mã từ 50 trở lên (read_code() >= 50) thì rút về tầm 1 bằng haul_to(0, -1) rồi vươn lại tầm 2 bằng reach_by(1), sau đó quay sang nấc kế tiếp.',
      veMaMau: 'Hoàn thiện vòng for 3 lượt: kiểm tra if read_code() >= 50: rồi cuối mỗi lượt gọi swing_by(1).',
      san: [SAN_CANG, SAN_CANG],
      batDau: [{ x: 3, y: 3, nac: 1, tam: 2 }, { x: 3, y: 3, nac: 1, tam: 2 }],
      chong: [
        [C(5, 1, [60]), C(5, 3, [25]), C(5, 5, [75])],
        [C(5, 1, [30]), C(5, 3, [80]), C(5, 5, [40])]
      ],
      bongMo: [
        BM([{ x: 4, y: 2, so: [60] }, { x: 5, y: 3, so: [25] }, { x: 4, y: 4, so: [75] }]),
        BM([{ x: 5, y: 1, so: [30] }, { x: 4, y: 3, so: [80] }, { x: 5, y: 5, so: [40] }])
      ],
      maMau: bai([
        'for i in range(3):',
        '    if read_code() >= 50:',
        '        haul_to(0, -1)'
      ]),
      loiGiai: bai([
        'for i in range(3):',
        '    if read_code() >= 50:',
        '        haul_to(0, -1)',
        '        reach_by(1)',
        '    swing_by(1)'
      ]),
      sao: { o: 22, nhip: 18 },
      loiGiaiKhac: {
        moTa: 'Kiểm tra read_code() // 10 >= 5 thay cho read_code() >= 50',
        baiLam: bai([
          'for i in range(3):',
          '    if read_code() // 10 >= 5:',
          '        haul_to(0, -1)',
          '        reach_by(1)',
          '    swing_by(1)'
        ])
      },
      loiSai: [
        { moTa: 'Quên reach_by(1) sau haul_to(0, -1) nên ở nấc kế tiếp cần cẩu quét nhầm tầm 1', baiLam: bai(['for i in range(3):', '    if read_code() >= 50:', '        haul_to(0, -1)', '    swing_by(1)']), phaiCoMa: ['chua-xep-chong'] },
        { moTa: 'Đặt swing_by(1) thụt vào trong nhánh if nên gặp kiện < 50 thì đứng yên', baiLam: bai(['for i in range(3):', '    if read_code() >= 50:', '        haul_to(0, -1)', '        reach_by(1)', '        swing_by(1)']), phaiCoMa: ['chua-xep-chong'] }
      ],
      goiY: ['Luna: Sau haul_to(0, -1), đầu cần đang ở tầm 1 nên phải gọi reach_by(1) để ra lại tầm 2.', 'Luna: Dòng swing_by(1) nằm ngoài khối if để lượt nào cũng sang nấc tiếp theo.']
    }),

    manQuetMa({
      so: 10, ten: 'Trùm cuối: Phân luồng theo hàng chục', hang: 'trum', nhipTheo: 'tong',
      huyHieu: { ma: 'quet-ma', ten: 'Huy hiệu Đọc mã số' },
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by'],
      deBai: 'Sola nhờ bạn: trùm cuối chương 1! Chồng hàng ở nấc 2 tầm 2 (5, 3) gồm các kiện có chữ số hàng chục là 1, 3 hoặc 4, cần được chuyển tương ứng về nấc 1, nấc 3 hoặc nấc 4. Hãy lặp while read_code() != -1:, tính độ lệch d = read_code() // 10 - 2 rồi chuyển đi và quay lại.',
      veMaMau: 'Trong vòng while, tính d = read_code() // 10 - 2, gọi carry_by(d) rồi swing_by(-d).',
      san: [SAN_CANG, SAN_CANG],
      batDau: [{ x: 3, y: 3, nac: 2, tam: 2 }, { x: 3, y: 3, nac: 2, tam: 2 }],
      chong: [
        [C(5, 3, [15, 32, 41])],
        [C(5, 3, [38, 12, 49])]
      ],
      bongMo: [
        BM([{ x: 5, y: 1, so: [15] }, { x: 5, y: 5, so: [32] }, { x: 3, y: 5, so: [41] }]),
        BM([{ x: 5, y: 1, so: [12] }, { x: 5, y: 5, so: [38] }, { x: 3, y: 5, so: [49] }])
      ],
      maMau: bai([
        'while read_code() != -1:',
        '    d = read_code() // 10 - 2'
      ]),
      loiGiai: bai([
        'while read_code() != -1:',
        '    d = read_code() // 10 - 2',
        '    carry_by(d)',
        '    swing_by(-d)'
      ]),
      sao: { o: 15, nhip: 28 },
      loiGiaiKhac: {
        moTa: 'Dùng vòng for 3 lần vì mỗi sân có 3 kiện',
        baiLam: bai([
          'for i in range(3):',
          '    d = read_code() // 10 - 2',
          '    carry_by(d)',
          '    swing_by(-d)'
        ])
      },
      loiSai: [
        { moTa: 'Quên trừ 2 khi tính độ lệch d từ nấc 2', baiLam: bai(['while read_code() != -1:', '    d = read_code() // 10', '    carry_by(d)', '    swing_by(-d)']), phaiCoMa: ['chua-xep-chong'] },
        { moTa: 'Quên swing_by(-d) để quay lại nấc 2 sau mỗi kiện', baiLam: bai(['while read_code() != -1:', '    d = read_code() // 10 - 2', '    carry_by(d)']), phaiCoMa: ['vong-vo-han'] }
      ],
      goiY: ['Luna: Đang đứng ở nấc 2 nên muốn tới nấc (read_code() // 10) thì độ lệch là d = read_code() // 10 - 2.', 'Luna: Chuyển xong bằng carry_by(d), nhớ gọi swing_by(-d) để quay về nấc 2.']
    }),

    /* ========================================================================
       CHƯƠNG 2: che-quet-ma (10 màn) — Chế lệnh: phân loại theo mã
       ======================================================================== */
    manCheQuetMa({
      so: 1, ten: 'Chế hàm sort_parity()', hang: 'lam-quen', nhipTheo: 'tong',
      taoHam: ['sort_parity'],
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by'],
      deBai: 'Sola nhờ bạn: mở Xưởng hàm chế sort_parity() để phân loại 1 kiện tại chỗ rồi quay về: nếu read_code() % 2 == 0 thì carry_by(-1) rồi swing_by(1), ngược lại thì carry_by(1) rồi swing_by(-1).',
      veMaMau: 'Tạo hàm sort_parity() rồi gọi 2 lần để phân loại 2 kiện ở nấc 2.',
      san: [SAN_CANG, SAN_CANG],
      batDau: [{ x: 3, y: 3, nac: 2, tam: 2 }, { x: 3, y: 3, nac: 2, tam: 2 }],
      chong: [
        [C(5, 3, [12, 25])],
        [C(5, 3, [19, 28])]
      ],
      bongMo: [
        BM([{ x: 5, y: 1, so: [12] }, { x: 5, y: 5, so: [25] }]),
        BM([{ x: 5, y: 1, so: [28] }, { x: 5, y: 5, so: [19] }])
      ],
      maMau: bai(['sort_parity()', 'sort_parity()']),
      loiGiai: bai(
        ['sort_parity()', 'sort_parity()'],
        { hamCuaEmMoi: [hSortParity()] }
      ),
      sao: { o: 19, nhip: 16 },
      loiGiaiKhac: {
        moTa: 'Dùng vòng for 2 lần gọi sort_parity()',
        baiLam: bai(['for i in range(2):', '    sort_parity()']),
        hamCuaEmMoi: [hSortParity()]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm sort_parity mà đã bấm Chạy', baiLam: bai(['sort_parity()', 'sort_parity()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong sort_parity quên quay về vị trí gốc sau khi carry_by', baiLam: bai(['sort_parity()', 'sort_parity()']), hamCuaEmMoi: [hSortParity(['if read_code() % 2 == 0:', '    carry_by(-1)', 'else:', '    carry_by(1)'])], phaiCoMa: ['chua-xep-chong'] }
      ],
      goiY: ['Luna: Nhánh chẵn của sort_parity() gồm carry_by(-1) và swing_by(1).', 'Luna: Nhánh lẻ của sort_parity() gồm carry_by(1) và swing_by(-1).']
    }),

    manCheQuetMa({
      so: 2, ten: 'Phân loại ở hai trạm đối diện', hang: 'lam-quen', nhipTheo: 'tong',
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'sort_parity'],
      deBai: 'Sola nhờ bạn: tại nấc 2 (5, 3) và nấc 6 (1, 3) mỗi nơi có 2 kiện hàng. Dùng sort_parity() phân loại hết 2 kiện ở nấc 2, quay sang nấc 6 bằng swing_by(4) rồi phân loại tiếp 2 kiện ở nấc 6.',
      veMaMau: 'Đã phân loại trạm đầu tiên ở nấc 2. Hãy quay sang nấc 6 và gọi sort_parity() cho 2 kiện còn lại.',
      san: [SAN_CANG, SAN_CANG],
      batDau: [{ x: 3, y: 3, nac: 2, tam: 2 }, { x: 3, y: 3, nac: 2, tam: 2 }],
      chong: [
        [C(5, 3, [14, 21]), C(1, 3, [32, 45])],
        [C(5, 3, [17, 26]), C(1, 3, [39, 44])]
      ],
      bongMo: [
        BM([{ x: 5, y: 1, so: [14] }, { x: 5, y: 5, so: [21] }, { x: 1, y: 5, so: [32] }, { x: 1, y: 1, so: [45] }]),
        BM([{ x: 5, y: 1, so: [26] }, { x: 5, y: 5, so: [17] }, { x: 1, y: 5, so: [44] }, { x: 1, y: 1, so: [39] }])
      ],
      maMau: bai(['sort_parity()', 'sort_parity()']),
      loiGiai: bai([
        'for i in range(2):',
        '    sort_parity()',
        '    sort_parity()',
        '    swing_by(4)'
      ]),
      sao: { o: 21, nhip: 48 },
      loiGiaiKhac: {
        moTa: 'Viết tuần tự không dùng vòng for ngoài',
        baiLam: bai(['sort_parity()', 'sort_parity()', 'swing_by(4)', 'sort_parity()', 'sort_parity()'])
      },
      loiSai: [
        { moTa: 'Mới phân loại ở nấc 2, chưa sang nấc 6', baiLam: bai(['sort_parity()', 'sort_parity()']), phaiCoMa: ['chua-xep-chong'] },
        { moTa: 'Chỉ gọi 1 lần sort_parity() ở mỗi trạm nên còn sót kiện đáy', baiLam: bai(['for i in range(2):', '    sort_parity()', '    swing_by(4)']), phaiCoMa: ['chua-xep-chong'] }
      ],
      goiY: ['Luna: Mỗi trạm có 2 kiện nên cần gọi sort_parity() 2 lần.', 'Luna: Giữa hai trạm cách nhau 4 nấc nên dùng swing_by(4).']
    }),

    manCheQuetMa({
      so: 3, ten: 'Chế hàm sort_all_parity()', hang: 'lam-quen', nhipTheo: 'tong',
      taoHam: ['sort_all_parity'],
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'sort_parity'],
      deBai: 'Sola nhờ bạn: chế hàm sort_all_parity() dùng while read_code() != -1: gọi sort_parity() để tự động phân loại sạch cả chồng dù chồng cao mấy kiện. Dùng hàm đó cho nấc 2 và nấc 6.',
      veMaMau: 'Trong sort_all_parity(), viết while read_code() != -1: rồi gọi sort_parity().',
      san: [SAN_CANG, SAN_CANG],
      batDau: [{ x: 3, y: 3, nac: 2, tam: 2 }, { x: 3, y: 3, nac: 2, tam: 2 }],
      chong: [
        [C(5, 3, [12, 25, 34]), C(1, 3, [41, 56])],
        [C(5, 3, [19, 28]), C(1, 3, [33, 42, 51])]
      ],
      bongMo: [
        BM([{ x: 5, y: 1, so: [34, 12] }, { x: 5, y: 5, so: [25] }, { x: 1, y: 5, so: [56] }, { x: 1, y: 1, so: [41] }]),
        BM([{ x: 5, y: 1, so: [28] }, { x: 5, y: 5, so: [19] }, { x: 1, y: 5, so: [42] }, { x: 1, y: 1, so: [51, 33] }])
      ],
      maMau: bai(['sort_all_parity()', 'swing_by(4)', 'sort_all_parity()']),
      loiGiai: bai(
        ['sort_all_parity()', 'swing_by(4)', 'sort_all_parity()'],
        { hamCuaEmMoi: [hSortAllParity()] }
      ),
      sao: { o: 22, nhip: 48 },
      loiGiaiKhac: {
        moTa: 'Quay sang nấc 6 bằng swing_by(-4)',
        baiLam: bai(['sort_all_parity()', 'swing_by(-4)', 'sort_all_parity()']),
        hamCuaEmMoi: [hSortAllParity()]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm sort_all_parity mà đã bấm Chạy', baiLam: bai(['sort_all_parity()', 'swing_by(4)', 'sort_all_parity()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong sort_all_parity chỉ dùng if thay vì while nên chỉ phân loại 1 kiện đầu', baiLam: bai(['sort_all_parity()', 'swing_by(4)', 'sort_all_parity()']), hamCuaEmMoi: [hSortAllParity(['if read_code() != -1:', '    sort_parity()'])], phaiCoMa: ['chua-xep-chong'] }
      ],
      goiY: ['Luna: Mở Xưởng hàm, tạo sort_all_parity() không tham số.', 'Luna: Thân hàm viết while read_code() != -1: rồi thụt lề sort_parity().']
    }),

    manCheQuetMa({
      so: 4, ten: 'Chế hàm clear_stack(d)', hang: 'luyen', nhipTheo: 'tong',
      taoHam: ['clear_stack'],
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by'],
      deBai: 'Sola nhờ bạn: chế hàm clear_stack(d) dùng while read_code() != -1: lặp carry_by(d) và swing_by(-d) để dọn sạch chồng hiện tại sang độ lệch d nấc. Dùng hàm đó dọn chồng ở nấc 1 sang nấc 2 và chồng ở nấc 5 sang nấc 4.',
      veMaMau: 'Tạo hàm clear_stack(d) trong Xưởng hàm rồi bấm Chạy.',
      san: [SAN_CANG, SAN_CANG],
      batDau: [{ x: 3, y: 3, nac: 1, tam: 2 }, { x: 3, y: 3, nac: 1, tam: 2 }],
      chong: [
        [C(5, 1, [10, 20]), C(1, 5, [30, 40, 50])],
        [C(5, 1, [15, 25, 35]), C(1, 5, [45, 55])]
      ],
      bongMo: [
        BM([{ x: 5, y: 3, so: [20, 10] }, { x: 3, y: 5, so: [50, 40, 30] }]),
        BM([{ x: 5, y: 3, so: [35, 25, 15] }, { x: 3, y: 5, so: [55, 45] }])
      ],
      maMau: bai(['clear_stack(1)', 'swing_by(4)', 'clear_stack(-1)']),
      loiGiai: bai(
        ['clear_stack(1)', 'swing_by(4)', 'clear_stack(-1)'],
        { hamCuaEmMoi: [hClearStack()] }
      ),
      sao: { o: 17, nhip: 48 },
      loiGiaiKhac: {
        moTa: 'Quay từ nấc 1 sang nấc 5 bằng swing_by(-4)',
        baiLam: bai(['clear_stack(1)', 'swing_by(-4)', 'clear_stack(-1)']),
        hamCuaEmMoi: [hClearStack()]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm clear_stack mà đã bấm Chạy', baiLam: bai(['clear_stack(1)', 'swing_by(4)', 'clear_stack(-1)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong clear_stack quên swing_by(-d) nên vòng lặp bị kẹt ở chồng đích', baiLam: bai(['clear_stack(1)', 'swing_by(4)', 'clear_stack(-1)']), hamCuaEmMoi: [hClearStack(['while read_code() != -1:', '    carry_by(d)'])], phaiCoMa: ['vong-vo-han'] }
      ],
      goiY: ['Luna: Hàm clear_stack(d) nhận 1 tham số d là độ lệch nấc cần chuyển tới.', 'Luna: Trong while read_code() != -1:, gọi carry_by(d) rồi swing_by(-d).']
    }),

    manCheQuetMa({
      so: 5, ten: 'Chế hàm route_tens()', hang: 'luyen', nhipTheo: 'tong',
      taoHam: ['route_tens'],
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by'],
      deBai: 'Sola nhờ bạn: chế hàm route_tens() đọc chữ số hàng chục k = read_code() // 10, gọi carry_by(k) để chuyển kiện hàng đi k nấc rồi swing_by(-k) quay về. Dùng hàm đó phân luồng 2 kiện ở nấc 0 (3, 1).',
      veMaMau: 'Tạo hàm route_tens() gồm 3 dòng: k = read_code() // 10, carry_by(k), swing_by(-k).',
      san: [SAN_CANG, SAN_CANG],
      batDau: [{ x: 3, y: 3, nac: 0, tam: 2 }, { x: 3, y: 3, nac: 0, tam: 2 }],
      chong: [
        [C(3, 1, [14, 26])],
        [C(3, 1, [31, 19])]
      ],
      bongMo: [
        BM([{ x: 5, y: 1, so: [14] }, { x: 5, y: 3, so: [26] }]),
        BM([{ x: 5, y: 1, so: [19] }, { x: 5, y: 5, so: [31] }])
      ],
      maMau: bai(['route_tens()', 'route_tens()']),
      loiGiai: bai(
        ['route_tens()', 'route_tens()'],
        { hamCuaEmMoi: [hRouteTens()] }
      ),
      sao: { o: 16, nhip: 22 },
      loiGiaiKhac: {
        moTa: 'Dùng vòng for 2 lần gọi route_tens()',
        baiLam: bai(['for i in range(2):', '    route_tens()']),
        hamCuaEmMoi: [hRouteTens()]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm route_tens mà đã bấm Chạy', baiLam: bai(['route_tens()', 'route_tens()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong route_tens dùng % 10 thay vì // 10', baiLam: bai(['route_tens()', 'route_tens()']), hamCuaEmMoi: [hRouteTens(['k = read_code() % 10', 'carry_by(k)', 'swing_by(-k)'])], phaiCoMa: ['chua-xep-chong'] }
      ],
      goiY: ['Luna: Đứng ở nấc 0, kiện có hàng chục k sẽ tới thẳng nấc k khi gọi carry_by(k).', 'Luna: Nhớ gọi swing_by(-k) ở cuối route_tens() để cần cẩu quay về nấc 0.']
    }),

    manCheQuetMa({
      so: 6, ten: 'Dọn kho trung chuyển rồi phân luồng', hang: 'luyen', nhipTheo: 'tong',
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'clear_stack', 'route_tens'],
      deBai: 'Sola nhờ bạn: kiện hàng đang nằm ở nấc 7 (1, 1). Hãy dùng clear_stack(1) để dồn hết sang nấc 0 (3, 1), quay sang nấc 0 rồi dùng while read_code() != -1: gọi route_tens() phân luồng từng kiện.',
      veMaMau: 'Đã dồn chồng từ nấc 7 sang nấc 0. Hãy quay sang nấc 0 và lặp route_tens() cho tới khi hết hàng.',
      san: [SAN_CANG, SAN_CANG],
      batDau: [{ x: 3, y: 3, nac: 7, tam: 2 }, { x: 3, y: 3, nac: 7, tam: 2 }],
      chong: [
        [C(1, 1, [25, 18])],
        [C(1, 1, [12, 34, 21])]
      ],
      bongMo: [
        BM([{ x: 5, y: 1, so: [18] }, { x: 5, y: 3, so: [25] }]),
        BM([{ x: 5, y: 1, so: [12] }, { x: 5, y: 3, so: [21] }, { x: 5, y: 5, so: [34] }])
      ],
      maMau: bai(['clear_stack(1)', 'swing_by(1)']),
      loiGiai: bai([
        'clear_stack(1)',
        'swing_by(1)',
        'while read_code() != -1:',
        '    route_tens()'
      ]),
      sao: { o: 21, nhip: 50 },
      loiGiaiKhac: {
        moTa: 'Dùng swing_right() thay cho swing_by(1) để sang nấc 0',
        baiLam: bai([
          'clear_stack(1)',
          'swing_right()',
          'while read_code() != -1:',
          '    route_tens()'
        ])
      },
      loiSai: [
        { moTa: 'Mới dồn sang nấc 0, chưa chạy vòng while phân luồng', baiLam: bai(['clear_stack(1)', 'swing_by(1)']), phaiCoMa: ['chua-xep-chong'] },
        { moTa: 'Quên swing_by(1) sang nấc 0 nên vòng while đọc ô trống ở nấc 7', baiLam: bai(['clear_stack(1)', 'while read_code() != -1:', '    route_tens()']), phaiCoMa: ['chua-xep-chong'] }
      ],
      goiY: ['Luna: Sau clear_stack(1), cần cẩu vẫn ở nấc 7 nên cần swing_by(1) để sang nấc 0.', 'Luna: Tại nấc 0, viết while read_code() != -1: rồi gọi route_tens().']
    }),

    manCheQuetMa({
      so: 7, ten: 'Sửa hàm pull_matching(r)', hang: 'bien-the', nhipTheo: 'tong',
      chinhCoDinh: true,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'reach_by', 'aim_crane', 'haul_to'],
      deBai: 'Sola nhờ bạn: hàm pull_matching(r) của màn cần rút mọi kiện ở đầu chồng có chữ số hàng đơn vị bằng r (read_code() % 10 == r) từ tầm 2 về tầm 1, nhưng đang viết nhầm thành // 10. Hãy sửa lại hàm!',
      veMaMau: 'Chương trình chính đã khóa. Mở hàm pull_matching(r) và sửa điều kiện while thành read_code() % 10 == r.',
      san: [SAN_CANG, SAN_CANG],
      batDau: [{ x: 3, y: 3, nac: 2, tam: 2 }, { x: 3, y: 3, nac: 2, tam: 2 }],
      chong: [
        [C(5, 3, [20, 15, 35]), C(3, 5, [40, 25])],
        [C(5, 3, [10, 45]), C(3, 5, [30, 15, 25])]
      ],
      bongMo: [
        BM([{ x: 5, y: 3, so: [20] }, { x: 4, y: 3, so: [35, 15] }, { x: 3, y: 5, so: [40] }, { x: 3, y: 4, so: [25] }]),
        BM([{ x: 5, y: 3, so: [10] }, { x: 4, y: 3, so: [45] }, { x: 3, y: 5, so: [30] }, { x: 3, y: 4, so: [25, 15] }])
      ],
      maMau: bai(
        ['pull_matching(5)', 'swing_by(2)', 'pull_matching(5)'],
        { hamCuaMan: [hPullMatch(T_PULL_MATCH_SAI)] }
      ),
      loiGiai: bai(
        ['pull_matching(5)', 'swing_by(2)', 'pull_matching(5)'],
        { hamCuaMan: [hPullMatch(T_PULL_MATCH_DUNG)] }
      ),
      sao: { o: 23, nhip: 28 },
      loiGiaiKhac: {
        moTa: 'Thêm dòng chú thích trong thân hàm pull_matching(r)',
        baiLam: bai(
          ['pull_matching(5)', 'swing_by(2)', 'pull_matching(5)'],
          { hamCuaMan: [hPullMatch(['while read_code() % 10 == r:', '    # rút về tầm 1', '    haul_to(0, -1)', '    reach_by(1)'])] }
        )
      },
      loiSai: [
        { moTa: 'Chưa sửa // 10 thành % 10 nên không rút được kiện có hàng đơn vị bằng 5', baiLam: bai(['pull_matching(5)', 'swing_by(2)', 'pull_matching(5)'], { hamCuaMan: [hPullMatch(T_PULL_MATCH_SAI)] }), phaiCoMa: ['chua-xep-chong'] },
        { moTa: 'Sửa thành read_code() != -1 nên rút luôn cả kiện đáy tròn chục', baiLam: bai(['pull_matching(5)', 'swing_by(2)', 'pull_matching(5)'], { hamCuaMan: [hPullMatch(['while read_code() != -1:', '    haul_to(0, -1)', '    reach_by(1)'])] }), phaiCoMa: ['chua-xep-chong'] }
      ],
      goiY: ['Luna: Chữ số hàng đơn vị là phần dư khi chia cho 10: read_code() % 10.', 'Luna: Đổi // 10 thành % 10 ở dòng while của pull_matching(r).']
    }),

    manCheQuetMa({
      so: 8, ten: 'Chế hàm route_all_tens()', hang: 'bien-the', nhipTheo: 'tong',
      taoHam: ['route_all_tens'],
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'route_tens'],
      deBai: 'Sola nhờ bạn: chế hàm route_all_tens() dùng while read_code() != -1: gọi route_tens() để tự động phân luồng sạch cả chồng theo hàng chục. Dùng hàm đó tại nấc 0 (3, 1) và nấc 4 (3, 5).',
      veMaMau: 'Trong route_all_tens(), viết while read_code() != -1: rồi gọi route_tens().',
      san: [SAN_CANG, SAN_CANG],
      batDau: [{ x: 3, y: 3, nac: 0, tam: 2 }, { x: 3, y: 3, nac: 0, tam: 2 }],
      chong: [
        [C(3, 1, [12, 24, 18]), C(3, 5, [15, 29])],
        [C(3, 1, [21, 16]), C(3, 5, [27, 13, 22])]
      ],
      bongMo: [
        BM([{ x: 5, y: 1, so: [18, 12] }, { x: 5, y: 3, so: [24] }, { x: 1, y: 5, so: [15] }, { x: 1, y: 3, so: [29] }]),
        BM([{ x: 5, y: 1, so: [16] }, { x: 5, y: 3, so: [21] }, { x: 1, y: 5, so: [13] }, { x: 1, y: 3, so: [22, 27] }])
      ],
      maMau: bai(['route_all_tens()', 'swing_by(4)', 'route_all_tens()']),
      loiGiai: bai(
        ['route_all_tens()', 'swing_by(4)', 'route_all_tens()'],
        { hamCuaEmMoi: [hRouteAllTens()] }
      ),
      sao: { o: 19, nhip: 58 },
      loiGiaiKhac: {
        moTa: 'Dùng vòng for 2 lần qua nấc 0 và nấc 4',
        baiLam: bai(['for i in range(2):', '    route_all_tens()', '    swing_by(4)']),
        hamCuaEmMoi: [hRouteAllTens()]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm route_all_tens mà đã bấm Chạy', baiLam: bai(['route_all_tens()', 'swing_by(4)', 'route_all_tens()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong route_all_tens chỉ gọi route_tens() 1 lần không có while', baiLam: bai(['route_all_tens()', 'swing_by(4)', 'route_all_tens()']), hamCuaEmMoi: [hRouteAllTens(['route_tens()'])], phaiCoMa: ['chua-xep-chong'] }
      ],
      goiY: ['Luna: Mở Xưởng hàm, tạo route_all_tens() gồm while read_code() != -1: và route_tens().', 'Luna: Tạo xong hàm, bấm Chạy để phân luồng cả hai trạm nấc 0 và nấc 4.']
    }),

    manCheQuetMa({
      so: 9, ten: 'Phân luồng hàng chục rồi tách chẵn lẻ', hang: 'bien-the', nhipTheo: 'tong',
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'sort_parity', 'sort_all_parity', 'route_tens', 'route_all_tens'],
      deBai: 'Sola nhờ bạn: tại nấc 0 (3, 1) có chồng hàng mang mã 2x và 4x. Hãy gọi route_all_tens() để đưa các kiện 2x về nấc 2 và 4x về nấc 4, sau đó đến nấc 2 và nấc 4 gọi sort_all_parity() để tách tiếp chẵn lẻ sang hai bên!',
      veMaMau: 'Đã gọi route_all_tens() ở nấc 0. Hãy lần lượt sang nấc 2 và nấc 4 gọi sort_all_parity().',
      san: [SAN_CANG, SAN_CANG],
      batDau: [{ x: 3, y: 3, nac: 0, tam: 2 }, { x: 3, y: 3, nac: 0, tam: 2 }],
      chong: [
        [C(3, 1, [21, 44, 28])],
        [C(3, 1, [43, 26, 48])]
      ],
      bongMo: [
        BM([{ x: 5, y: 1, so: [28] }, { x: 5, y: 5, so: [21, 44] }]),
        BM([{ x: 5, y: 1, so: [26] }, { x: 5, y: 5, so: [48] }, { x: 1, y: 5, so: [43] }])
      ],
      maMau: bai(['route_all_tens()']),
      loiGiai: bai([
        'route_all_tens()',
        'swing_by(2)',
        'sort_all_parity()',
        'swing_by(2)',
        'sort_all_parity()'
      ]),
      sao: { o: 29, nhip: 80 },
      loiGiaiKhac: {
        moTa: 'Dùng vòng for 2 lần cho bước swing_by(2) và sort_all_parity()',
        baiLam: bai([
          'route_all_tens()',
          'for i in range(2):',
          '    swing_by(2)',
          '    sort_all_parity()'
        ])
      },
      loiSai: [
        { moTa: 'Mới phân luồng từ nấc 0, chưa tách chẵn lẻ ở nấc 2 và nấc 4', baiLam: bai(['route_all_tens()']), phaiCoMa: ['chua-xep-chong'] },
        { moTa: 'Chỉ tách chẵn lẻ ở nấc 2, quên sang nấc 4', baiLam: bai(['route_all_tens()', 'swing_by(2)', 'sort_all_parity()']), phaiCoMa: ['chua-xep-chong'] }
      ],
      goiY: ['Luna: Sau route_all_tens() ở nấc 0, các kiện 2x nằm ở nấc 2 và 4x nằm ở nấc 4.', 'Luna: Gọi swing_by(2), sort_all_parity(), rồi lại swing_by(2), sort_all_parity().']
    }),

    manCheQuetMa({
      so: 10, ten: 'Trùm cuối: Trung tâm phân loại tự động', hang: 'trum', nhipTheo: 'tong',
      huyHieu: { ma: 'che-quet-ma', ten: 'Huy hiệu Chế lệnh: phân loại theo mã' },
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'sort_parity', 'sort_all_parity', 'clear_stack', 'route_tens', 'route_all_tens'],
      deBai: 'Sola nhờ bạn: trùm cuối gói 3! Đầu tiên dồn chồng hàng ở nấc 7 sang nấc 0 bằng clear_stack(1), sang nấc 0 gọi route_all_tens() để chia các kiện 2x và 5x về nấc 2 và nấc 5, rồi sang nấc 2 gọi sort_all_parity() để tách chẵn lẻ!',
      veMaMau: 'Kết hợp clear_stack(1), route_all_tens() và sort_all_parity() để hoàn thành dây chuyền phân loại.',
      san: [SAN_CANG, SAN_CANG],
      batDau: [{ x: 3, y: 3, nac: 7, tam: 2 }, { x: 3, y: 3, nac: 7, tam: 2 }],
      chong: [
        [C(1, 1, [24, 51, 27])],
        [C(1, 1, [58, 22, 29])]
      ],
      bongMo: [
        BM([{ x: 5, y: 1, so: [24] }, { x: 5, y: 5, so: [27] }, { x: 1, y: 5, so: [51] }]),
        BM([{ x: 5, y: 1, so: [22] }, { x: 5, y: 5, so: [29] }, { x: 1, y: 5, so: [58] }])
      ],
      maMau: bai([
        'clear_stack(1)',
        'swing_by(1)'
      ]),
      loiGiai: bai([
        'clear_stack(1)',
        'swing_by(1)',
        'route_all_tens()',
        'swing_by(2)',
        'sort_all_parity()'
      ]),
      sao: { o: 32, nhip: 94 },
      loiGiaiKhac: {
        moTa: 'Thêm dòng chú thích cho hai giai đoạn phân loại',
        baiLam: bai([
          '# dồn về nấc 0 rồi phân luồng',
          'clear_stack(1)',
          'swing_by(1)',
          'route_all_tens()',
          'swing_by(2)',
          'sort_all_parity()'
        ])
      },
      loiSai: [
        { moTa: 'Mới phân luồng về nấc 2 và nấc 5, chưa tách chẵn lẻ ở nấc 2', baiLam: bai(['clear_stack(1)', 'swing_by(1)', 'route_all_tens()']), phaiCoMa: ['chua-xep-chong'] },
        { moTa: 'Sau route_all_tens() ở nấc 0 quên swing_by(2) sang nấc 2 trước khi sort_all_parity()', baiLam: bai(['clear_stack(1)', 'swing_by(1)', 'route_all_tens()', 'sort_all_parity()']), phaiCoMa: ['chua-xep-chong'] }
      ],
      goiY: ['Luna: Sau clear_stack(1) ở nấc 7, gọi swing_by(1) sang nấc 0 rồi gọi route_all_tens().', 'Luna: Tiếp theo gọi swing_by(2) sang nấc 2 rồi gọi sort_all_parity() để tách các kiện 2x.']
    })
  ];

  ManHoc.manQuetMa = DS;
  if (laNode) module.exports = DS;
})();
