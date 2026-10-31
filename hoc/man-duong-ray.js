/* ============================================================================
   man-duong-ray.js — "Robot Chấn Hưng": GÓI 5 MÙA 4 "CẢNG SÔNG" (ĐƯỜNG RAY CẢNG)
   Gồm 20 màn mới trên Cần cẩu R1 nâng cấp thân chạy dọc đường ray (rail):
   - duong-ray.1..10     (10 màn chương duong-ray "Chạy dọc đường ray")
   - che-duong-ray.1..10 (10 màn chương che-duong-ray "Chế lệnh: dời bệ cẩu")
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var HAM_RAY = ['swing_left', 'swing_right', 'extend', 'retract', 'pick_up', 'set_down', 'read_code', 'rail', 'wait'];
  var ROBOT_RAY = { than: 'cau', tay: 'moc-cau', camBien: [{ ma: 'quet-ma', o: 'tren' }] };
  var CAU_TRUC = ['for', 'if', 'while', 'list'];

  var SAN_RAY_1 = [
    '~~~~~~~',
    '~~~~~~~',
    '~DTTTD~',
    '.RRRRR.',
    '.DDDDD.',
    '.DDDDD.',
    '.......'
  ];

  var SAN_RAY_2 = [
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

  function C(x, y, so) {
    return { x: x, y: y, cont: so.map(function (n) { return { so: n }; }) };
  }
  function BM(x, y, chong) {
    return {
      x: x, y: y,
      chong: chong.map(function (q) { return { x: q.x, y: q.y, so: q.so.slice() }; })
    };
  }

  // Các hàm chế ở Gói 5 chương che-duong-ray
  var T_RAIL_PICK = [
    'rail(dx)',
    'pick_up()',
    'rail(-dx)',
    'set_down()'
  ];
  var T_RAIL_DROP = [
    'pick_up()',
    'rail(dx)',
    'set_down()',
    'rail(-dx)'
  ];
  var T_SHUTTLE_CONT = [
    'rail(dx)',
    'carry_by(4)',
    'swing_by(4)'
  ];
  var T_RAIL_CLEAR = [
    'while read_code() != -1:',
    '    rail_drop(dx)'
  ];
  var T_SCAN_RAIL = [
    'while read_code() != -1:',
    '    if read_code() // 10 == 1:',
    '        rail_drop(-1)',
    '    else:',
    '        rail_drop(1)'
  ];
  var T_RAIL_SORT_SAI = [
    'for i in range(n):',
    '    rail(1)',
    '    if read_code() == -1:',
    '        carry_by(4)',
    '        swing_by(4)'
  ];
  var T_RAIL_SORT_DUNG = [
    'for i in range(n):',
    '    rail(1)',
    '    if read_code() != -1:',
    '        carry_by(4)',
    '        swing_by(4)'
  ];

  function hRailPick(than) { return H('rail_pick', ['dx'], than || T_RAIL_PICK); }
  function hRailDrop(than) { return H('rail_drop', ['dx'], than || T_RAIL_DROP); }
  function hShuttleCont(than) { return H('shuttle_cont', ['dx'], than || T_SHUTTLE_CONT); }
  function hRailClear(than) { return H('rail_clear', ['dx'], than || T_RAIL_CLEAR); }
  function hScanRail(than) { return H('scan_rail', [], than || T_SCAN_RAIL); }
  function hRailSort(than) { return H('rail_sort', ['n'], than || T_RAIL_SORT_DUNG); }

  function manDuongRay(cfg) {
    return ManHoc.chuanHoa(Object.assign({
      chuong: 'duong-ray',
      loaiRobot: 'cau',
      robot: ROBOT_RAY,
      vo: 'cang',
      hamGoc: HAM_RAY,
      cauTruc: CAU_TRUC,
      khung: { chinh: 10, moiHam: 10 },
      moXuong: true,
      mucTieu: 'giao-tau',
      hamCuaEmCan: [],
      taoHam: []
    }, cfg));
  }

  function manCheDuongRay(cfg) {
    return ManHoc.chuanHoa(Object.assign({
      chuong: 'che-duong-ray',
      loaiRobot: 'cau',
      robot: ROBOT_RAY,
      vo: 'cang',
      hamGoc: HAM_RAY,
      cauTruc: CAU_TRUC,
      khung: { chinh: 10, moiHam: 10 },
      moXuong: true,
      mucTieu: 'giao-tau',
      hamCuaEmCan: [],
      taoHam: []
    }, cfg));
  }

  var DS = [
    /* ========================================================================
       CHƯƠNG 1: duong-ray (10 màn) — Chạy dọc đường ray
       ======================================================================== */
    manDuongRay({
      so: 1, ten: 'Lăn bánh trên đường ray', hang: 'lam-quen',
      chiChay: true, chinhCoDinh: true,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by'],
      deBai: 'Sola làm mẫu: bệ cần cẩu nay đặt trên đường ray R chạy ngang từ cột 1 đến cột 5. Bấm Chạy để xem cần cẩu nhấc kiện 15 ở (1, 4), gọi rail(2) lăn bệ sang cột 3, rồi quay sang nấc 0 hạ kiện lên tàu.',
      veMaMau: 'Chương trình mẫu đã khóa. Bấm Chạy để quan sát lệnh rail(2) dời cả bệ cẩu và đầu cần.',
      san: SAN_RAY_1,
      batDau: { x: 1, y: 3, nac: 4, tam: 1 },
      chong: [C(1, 4, [15])],
      tau: tauDon(8, 2),
      giao: [{ tau: 0, so: [15] }],
      maMau: bai([
        'pick_up()',
        'rail(2)',
        'swing_by(4)',
        'set_down()'
      ]),
      loiGiai: bai([
        'pick_up()',
        'rail(2)',
        'swing_by(4)',
        'set_down()'
      ]),
      sao: { o: 10, nhip: 8 },
      loiSai: [],
      goiY: ['Luna: Bấm nút Chạy để xem bệ cần cẩu trượt 2 ô sang phải trên đường ray.', 'Luna: Khi gọi rail(n), đầu cần và kiện hàng đang treo cũng dịch chuyển theo bệ cẩu.']
    }),

    manDuongRay({
      so: 2, ten: 'Tiến phải rồi lùi trái', hang: 'lam-quen',
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by'],
      deBai: 'Sola nhờ bạn: bệ cẩu đang ở cột 2 (2, 3), còn kiện hàng 24 nằm tận cột 5 (5, 4). Hãy gọi rail(3) chạy sang cột 5 để pick_up(), sau đó gọi rail(-2) lùi về cột 3, quay sang nấc 0 bằng swing_by(4) rồi set_down() lên tàu.',
      veMaMau: 'Sau rail(-2), hãy quay cần sang nấc 0 và hạ kiện hàng xuống boong tàu.',
      san: SAN_RAY_1,
      batDau: { x: 2, y: 3, nac: 4, tam: 1 },
      chong: [C(5, 4, [24])],
      tau: tauDon(11, 2),
      giao: [{ tau: 0, so: [24] }],
      maMau: bai([
        'rail(3)',
        'pick_up()',
        'rail(-2)'
      ]),
      loiGiai: bai([
        'rail(3)',
        'pick_up()',
        'rail(-2)',
        'swing_by(4)',
        'set_down()'
      ]),
      sao: { o: 11, nhip: 11 },
      loiGiaiKhac: {
        moTa: 'Dùng swing_by(-4) khi quay cần sang boong tàu nấc 0',
        baiLam: bai([
          'rail(3)',
          'pick_up()',
          'rail(-2)',
          'swing_by(-4)',
          'set_down()'
        ])
      },
      loiSai: [
        { moTa: 'Chạy quá đường ray sang phải bằng rail(4)', baiLam: bai(['rail(4)', 'pick_up()']), phaiCoMa: ['het-ray'] },
        { moTa: 'Mới lùi về cột 3 nhưng chưa quay cần và hạ hàng lên tàu', baiLam: bai(['rail(3)', 'pick_up()', 'rail(-2)']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Sau rail(-2), bệ cẩu đang ở (3, 3) và đầu cần chỉ vào (3, 4) ở nấc 4.', 'Luna: Thêm swing_by(4) và set_down() để đặt kiện 24 lên boong tàu tại (3, 2).']
    }),

    manDuongRay({
      so: 3, ten: 'Gom hàng dọc đường ray', hang: 'lam-quen',
      mucTieu: 'bong-mo',
      hamCuaEmCan: [],
      deBai: 'Sola nhờ bạn: gom kiện 12 ở (1, 4) và kiện 18 ở (3, 4) về xếp thành chồng [12, 18] tại (5, 4), đồng thời đỗ bệ cẩu tại (5, 3). Đầu cần luôn hướng về nấc 4 nên chỉ cần kết hợp pick_up(), rail(n) và set_down().',
      veMaMau: 'Sau khi đặt kiện 12 xuống (5, 4), hãy lùi về cột 3 lấy kiện 18 đem sang (5, 4).',
      san: SAN_RAY_1,
      batDau: { x: 1, y: 3, nac: 4, tam: 1 },
      chong: [C(1, 4, [12]), C(3, 4, [18])],
      tau: tauDon(20, 0),
      bongMo: BM(5, 3, [
        { x: 1, y: 4, so: [] },
        { x: 3, y: 4, so: [] },
        { x: 5, y: 4, so: [12, 18] }
      ]),
      maMau: bai([
        'pick_up()',
        'rail(4)',
        'set_down()',
        'rail(-2)'
      ]),
      loiGiai: bai([
        'pick_up()',
        'rail(4)',
        'set_down()',
        'rail(-2)',
        'pick_up()',
        'rail(2)',
        'set_down()'
      ]),
      sao: { o: 7, nhip: 12 },
      loiGiaiKhac: {
        moTa: 'Tách rail(4) thành hai bước rail(2)',
        baiLam: bai([
          'pick_up()',
          'rail(2)',
          'rail(2)',
          'set_down()',
          'rail(-2)',
          'pick_up()',
          'rail(2)',
          'set_down()'
        ])
      },
      loiSai: [
        { moTa: 'Mới chuyển kiện 12 sang (5, 4) rồi dừng ở cột 3', baiLam: bai(['pick_up()', 'rail(4)', 'set_down()', 'rail(-2)']), phaiCoMa: ['chua-xep-chong'] },
        { moTa: 'Lùi quá đà sang cột 0 ngoài đường ray', baiLam: bai(['pick_up()', 'rail(4)', 'set_down()', 'rail(-5)']), phaiCoMa: ['het-ray'] }
      ],
      goiY: ['Luna: Sau rail(-2), bệ cẩu đang ở cột 3 đối diện kiện 18 tại (3, 4).', 'Luna: Gọi tiếp pick_up(), rail(2) và set_down() để xếp kiện 18 lên trên kiện 12 tại (5, 4).']
    }),

    manDuongRay({
      so: 4, ten: 'Quét ba cột bãi cảng', hang: 'luyen-tap',
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by'],
      deBai: 'Sola nhờ bạn: ba kiện hàng nằm lần lượt ở các cột 2, 3, 4 tại hàng bãi y = 4. Bệ cẩu đang ở cột 1 (1, 3), nấc 4. Hãy lặp 3 lần: mỗi lần tiến 1 ô bằng rail(1), chuyển kiện sang boong tàu đối diện bằng carry_by(4), rồi quay lại nấc 4 bằng swing_by(4).',
      veMaMau: 'Hoàn thiện thân vòng lặp for i in range(3): với rail(1), carry_by(4) và swing_by(4).',
      san: SAN_RAY_1,
      batDau: { x: 1, y: 3, nac: 4, tam: 1 },
      chong: [C(2, 4, [11]), C(3, 4, [14]), C(4, 4, [19])],
      tau: tauDon(33, 2),
      giao: [{ tau: 0, so: [11, 14, 19] }],
      maMau: bai([
        'for i in range(3):',
        '    rail(1)',
        '    carry_by(4)'
      ]),
      loiGiai: bai([
        'for i in range(3):',
        '    rail(1)',
        '    carry_by(4)',
        '    swing_by(4)'
      ]),
      sao: { o: 13, nhip: 33 },
      loiGiaiKhac: {
        moTa: 'Dùng swing_by(-4) để quay lại nấc 4 sau mỗi lần giao',
        baiLam: bai([
          'for i in range(3):',
          '    rail(1)',
          '    carry_by(4)',
          '    swing_by(-4)'
        ])
      },
      loiSai: [
        { moTa: 'Quên gọi swing_by(4) nên ở vòng thứ hai đầu cần vẫn chỉ vào boong tàu nấc 0', baiLam: bai(['for i in range(3):', '    rail(1)', '    carry_by(4)']), phaiCoMa: ['moc-hut'] },
        { moTa: 'Chỉ lặp 2 lần nên bỏ sót kiện 19 ở cột 4', baiLam: bai(['for i in range(2):', '    rail(1)', '    carry_by(4)', '    swing_by(4)']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Sau carry_by(4), đầu cần đang ở nấc 0 phía boong tàu.', 'Luna: Thêm swing_by(4) vào cuối vòng lặp để đầu cần quay về nấc 4 trước khi tiến sang cột kế tiếp.']
    }),

    manDuongRay({
      so: 5, ten: 'Vươn cần kết hợp chạy ray', hang: 'luyen-tap',
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'reach_by', 'aim_crane', 'haul_to'],
      deBai: 'Sola nhờ bạn: hai kiện hàng nằm ở bãi sâu y = 5 tại (2, 5) và (4, 5). Bệ cẩu bắt đầu ở (2, 3) với nấc 4, tầm 2. Hãy dùng haul_to(4, -1) đưa kiện ở (2, 5) lên tàu tại (2, 2), chạy sang cột 4 bằng rail(2), chỉnh cần về (4, 5) bằng aim_crane(4, 1) rồi gọi haul_to(4, -1).',
      veMaMau: 'Sau rail(2), hãy gọi aim_crane(4, 1) rồi haul_to(4, -1).',
      san: SAN_RAY_1,
      batDau: { x: 2, y: 3, nac: 4, tam: 2 },
      chong: [C(2, 5, [16]), C(4, 5, [26])],
      tau: tauDon(21, 2),
      giao: [{ tau: 0, so: [16, 26] }],
      maMau: bai([
        'haul_to(4, -1)',
        'rail(2)'
      ]),
      loiGiai: bai([
        'haul_to(4, -1)',
        'rail(2)',
        'aim_crane(4, 1)',
        'haul_to(4, -1)'
      ]),
      sao: { o: 21, nhip: 21 },
      loiGiaiKhac: {
        moTa: 'Quay và vươn cần bằng aim_crane(4, 1) trước khi gọi rail(2)',
        baiLam: bai([
          'haul_to(4, -1)',
          'aim_crane(4, 1)',
          'rail(2)',
          'haul_to(4, -1)'
        ])
      },
      loiSai: [
        { moTa: 'Quên gọi aim_crane(4, 1) nên nhấc nhầm ở boong tàu (4, 2)', baiLam: bai(['haul_to(4, -1)', 'rail(2)', 'haul_to(4, -1)']), phaiCoMa: ['moc-hut'] },
        { moTa: 'Mới giao kiện 16 ở cột 2, chưa lấy kiện 26 ở cột 4', baiLam: bai(['haul_to(4, -1)', 'rail(2)']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Sau haul_to(4, -1) lần đầu và rail(2), đầu cần đang ở (4, 2) với nấc 0, tầm 1.', 'Luna: Gọi aim_crane(4, 1) để quay sang nấc 4, tầm 2 chỉ vào (4, 5), rồi gọi haul_to(4, -1).']
    }),

    manDuongRay({
      so: 6, ten: 'Trượt ray chia hai tàu', hang: 'luyen-tap',
      khung: { chinh: 12, moiHam: 10 },
      hamCuaEmCan: [],
      deBai: 'Sola nhờ bạn: tại cầu cảng giữa (3, 2) có 2 kiện hàng [28, 13], hai bên là Tàu 1 ở (2, 2) và Tàu 2 ở (4, 2). Bệ cẩu đang ở (3, 3) hướng nấc 0 chỉ thẳng vào (3, 2). Với mỗi kiện, nếu read_code() // 10 == 1 thì nhấc lên, rail(-1) sang Tàu 1 hạ xuống rồi rail(1) quay về; ngược lại thì rail(1) sang Tàu 2 hạ xuống rồi rail(-1) quay về.',
      veMaMau: 'Hoàn thiện nhánh else để đưa kiện hàng chục bằng 2 sang Tàu 2 ở bên phải.',
      san: SAN_RAY_2,
      batDau: { x: 3, y: 3, nac: 0, tam: 1 },
      chong: [C(3, 2, [28, 13])],
      tau: tauDoi(8, 2),
      giao: [{ tau: 0, so: [13] }, { tau: 1, so: [28] }],
      maMau: bai([
        'for i in range(2):',
        '    if read_code() // 10 == 1:',
        '        pick_up()',
        '        rail(-1)',
        '        set_down()',
        '        rail(1)',
        '    else:'
      ]),
      loiGiai: bai([
        'for i in range(2):',
        '    if read_code() // 10 == 1:',
        '        pick_up()',
        '        rail(-1)',
        '        set_down()',
        '        rail(1)',
        '    else:',
        '        pick_up()',
        '        rail(1)',
        '        set_down()',
        '        rail(-1)'
      ]),
      sao: { o: 11, nhip: 8 },
      loiGiaiKhac: {
        moTa: 'Dùng vòng lặp while read_code() != -1 thay cho for i in range(2)',
        baiLam: bai([
          'while read_code() != -1:',
          '    if read_code() // 10 == 1:',
          '        pick_up()',
          '        rail(-1)',
          '        set_down()',
          '        rail(1)',
          '    else:',
          '        pick_up()',
          '        rail(1)',
          '        set_down()',
          '        rail(-1)'
        ])
      },
      loiSai: [
        { moTa: 'Đưa cả 2 kiện sang Tàu 1 bên trái nên kiện 28 bị giao nhầm', baiLam: bai(['for i in range(2):', '    pick_up()', '    rail(-1)', '    set_down()', '    rail(1)']), phaiCoMa: ['giao-nham'] },
        { moTa: 'Trong nhánh else quên gọi rail(-1) quay về cột 3', baiLam: bai(['for i in range(2):', '    if read_code() // 10 == 1:', '        pick_up()', '        rail(-1)', '        set_down()', '        rail(1)', '    else:', '        pick_up()', '        rail(1)', '        set_down()']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Khi đầu cần giữ nguyên ở nấc 0, trượt bệ bằng rail(-1) sẽ đưa đầu cần sang (2, 2) trên Tàu 1, còn rail(1) sẽ đưa đầu cần sang (4, 2) trên Tàu 2.', 'Luna: Nhánh else gồm 4 lệnh: pick_up(), rail(1), set_down(), rail(-1).']
    }),

    manDuongRay({
      so: 7, ten: 'Chuyển cả chồng ở đầu ray', hang: 'bien-the',
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by'],
      deBai: 'Sola nhờ bạn: tại đầu ray bên trái (1, 4) có chồng hàng [19, 15, 12]. Dùng vòng lặp while read_code() != -1: để nhấc từng kiện ở (1, 4), trượt sang cột 2 bằng rail(1), quay sang nấc 0 đặt lên tàu ở (2, 2), rồi quay lại nấc 4 và lùi rail(-1) về cột 1.',
      veMaMau: 'Sau set_down() lên tàu, hãy quay về nấc 4 bằng swing_by(4) rồi lùi về cột 1 bằng rail(-1).',
      san: SAN_RAY_1,
      batDau: { x: 1, y: 3, nac: 4, tam: 1 },
      chong: [C(1, 4, [19, 15, 12])],
      tau: tauDon(36, 2),
      giao: [{ tau: 0, so: [12, 15, 19] }],
      maMau: bai([
        'while read_code() != -1:',
        '    pick_up()',
        '    rail(1)',
        '    swing_by(4)',
        '    set_down()'
      ]),
      loiGiai: bai([
        'while read_code() != -1:',
        '    pick_up()',
        '    rail(1)',
        '    swing_by(4)',
        '    set_down()',
        '    swing_by(4)',
        '    rail(-1)'
      ]),
      sao: { o: 13, nhip: 36 },
      loiGiaiKhac: {
        moTa: 'Lùi rail(-1) về cột 1 trước rồi mới gọi swing_by(4)',
        baiLam: bai([
          'while read_code() != -1:',
          '    pick_up()',
          '    rail(1)',
          '    swing_by(4)',
          '    set_down()',
          '    rail(-1)',
          '    swing_by(4)'
        ])
      },
      loiSai: [
        { moTa: 'Hạ kiện tại (1, 2) khi chưa gọi rail(1) nên kiện nằm trên cầu cảng chứ không lên tàu', baiLam: bai(['while read_code() != -1:', '    pick_up()', '    swing_by(4)', '    set_down()', '    swing_by(4)']), phaiCoMa: ['chua-giao-tau'] },
        { moTa: 'Quên lùi rail(-1) về cột 1 nên vòng sau đọc ô trống (2, 4)', baiLam: bai(['while read_code() != -1:', '    pick_up()', '    rail(1)', '    swing_by(4)', '    set_down()', '    swing_by(4)']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Ô (1, 2) là bến cảng D chứ không phải boong tàu T, nên phải gọi rail(1) sang cột 2 mới hạ lên tàu được.', 'Luna: Cuối vòng lặp cần thêm swing_by(4) và rail(-1) để đầu cần trở lại (1, 4).']
    }),

    manDuongRay({
      so: 8, ten: 'Mượn cột bên cạnh giữ luật tháp', hang: 'bien-the',
      khung: { chinh: 12, moiHam: 10 },
      luatThap: true,
      hamCuaEmCan: [],
      deBai: 'Sola nhờ bạn: tại cầu cảng (3, 2) có tháp 2 kiện [24, 12], cần xếp cả 2 kiện lên Tàu 1 ở (2, 2) đúng luật tháp. Với đầu cần giữ ở nấc 0, hãy tạm gửi kiện 12 sang Tàu 2 ở (4, 2) hoặc mượn cột bên cạnh: nhấc kiện 12 ở (3, 2) trượt rail(1) đặt tạm sang (4, 2), quay về (3, 2) đưa kiện 24 sang (2, 2) bằng rail(-1), rồi sang (4, 2) lấy kiện 12 đặt chồng lên kiện 24 ở (2, 2).',
      veMaMau: 'Sau khi đặt kiện 24 lên (2, 2), hãy trượt rail(2) sang (4, 2) lấy kiện 12 đem về (2, 2).',
      san: SAN_RAY_2,
      batDau: { x: 3, y: 3, nac: 0, tam: 1 },
      chong: [C(3, 2, [24, 12])],
      tau: tauDoi(13, 2),
      giao: [{ tau: 0, so: [12, 24] }],
      maMau: bai([
        'pick_up()',
        'rail(1)',
        'set_down()',
        'rail(-1)',
        'pick_up()',
        'rail(-1)',
        'set_down()'
      ]),
      loiGiai: bai([
        'pick_up()',
        'rail(1)',
        'set_down()',
        'rail(-1)',
        'pick_up()',
        'rail(-1)',
        'set_down()',
        'rail(2)',
        'pick_up()',
        'rail(-2)',
        'set_down()'
      ]),
      sao: { o: 11, nhip: 13 },
      loiGiaiKhac: {
        moTa: 'Tách rail(2) thành hai lần rail(1)',
        baiLam: bai([
          'pick_up()',
          'rail(1)',
          'set_down()',
          'rail(-1)',
          'pick_up()',
          'rail(-1)',
          'set_down()',
          'rail(1)',
          'rail(1)',
          'pick_up()',
          'rail(-2)',
          'set_down()'
        ])
      },
      loiSai: [
        { moTa: 'Chuyển thẳng cả 2 kiện từ (3, 2) sang (2, 2) nên kiện 24 đè lên kiện 12', baiLam: bai(['pick_up()', 'rail(-1)', 'set_down()', 'rail(1)', 'pick_up()', 'rail(-1)', 'set_down()']), phaiCoMa: ['thap-sai'] },
        { moTa: 'Mới đưa kiện 24 sang Tàu 1, chưa lấy kiện 12 từ (4, 2) sang đặt lên đỉnh', baiLam: bai(['pick_up()', 'rail(1)', 'set_down()', 'rail(-1)', 'pick_up()', 'rail(-1)', 'set_down()']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Sau khi hạ kiện 24 xuống (2, 2), bệ cẩu đang ở cột 2 còn kiện 12 đang nằm tạm ở (4, 2).', 'Luna: Gọi rail(2), pick_up(), rail(-2), set_down() để đặt kiện 12 lên trên kiện 24 tại (2, 2).']
    }),

    manDuongRay({
      so: 9, ten: 'Chạy ray đón nhịp tàu cập', hang: 'bien-the',
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by'],
      deBai: 'Sola nhờ bạn: tàu vắng mặt 3 nhịp đầu rồi mới cập bến (đỗ từ nhịp 4 đến nhịp 18). Bệ cẩu bắt đầu ở cột 5 (5, 3), nấc 4. Hãy nhấc kiện 27 ở (5, 4), trượt rail(-2) về cột 3 trong lúc chờ tàu cập bến, quay sang nấc 0 hạ xuống tàu, rồi quay lại nấc 4 dùng carry_by(4) giao tiếp kiện 16 ở (3, 4).',
      veMaMau: 'Sau khi hạ kiện 27 xuống (3, 2), hãy quay về nấc 4 và gọi carry_by(4).',
      san: SAN_RAY_1,
      batDau: { x: 5, y: 3, nac: 4, tam: 1 },
      chong: [C(5, 4, [27]), C(3, 4, [16])],
      tau: tauDon(15, 3, 15),
      giao: [{ tau: 0, so: [16, 27] }],
      maMau: bai([
        'pick_up()',
        'rail(-2)',
        'swing_by(4)',
        'set_down()'
      ]),
      loiGiai: bai([
        'pick_up()',
        'rail(-2)',
        'swing_by(4)',
        'set_down()',
        'swing_by(4)',
        'carry_by(4)'
      ]),
      sao: { o: 15, nhip: 18 },
      loiGiaiKhac: {
        moTa: 'Dùng swing_by(-4) khi quay từ nấc 0 về nấc 4',
        baiLam: bai([
          'pick_up()',
          'rail(-2)',
          'swing_by(4)',
          'set_down()',
          'swing_by(-4)',
          'carry_by(4)'
        ])
      },
      loiSai: [
        { moTa: 'Trượt nhầm sang phải bằng rail(2) khi đang ở đầu phải của đường ray', baiLam: bai(['pick_up()', 'rail(2)']), phaiCoMa: ['het-ray'] },
        { moTa: 'Mới giao kiện 27, chưa giao kiện 16 ở (3, 4)', baiLam: bai(['pick_up()', 'rail(-2)', 'swing_by(4)', 'set_down()']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Nhấc kiện ở (5, 4) rồi trượt rail(-2) và swing_by(4) tốn 7 nhịp, vừa kịp lúc tàu đã đỗ ở bến.', 'Luna: Sau set_down(), thêm swing_by(4) và carry_by(4) để chuyển nốt kiện 16 ở (3, 4) lên tàu.']
    }),

    manDuongRay({
      so: 10, ten: 'Trùm Chạy dọc đường ray', hang: 'trum', nhipTheo: 'tong',
      khung: { chinh: 12, moiHam: 10 },
      huyHieu: { ma: 'duong-ray', ten: 'Huy hiệu Chạy dọc đường ray' },
      hamCuaEmCan: [],
      deBai: 'Trùm chương 1: trên hai sân, tại cầu cảng giữa (3, 2) có chồng 4 kiện hàng. Bệ cẩu đứng ở (3, 3) hướng nấc 0. Hãy dùng vòng lặp while read_code() != -1: kết hợp if read_code() // 10 == 1 để trượt rail(-1) giao kiện hàng chục bằng 1 sang Tàu 1, và trượt rail(1) giao kiện hàng chục bằng 2 sang Tàu 2.',
      veMaMau: 'Hoàn thiện vòng lặp while phân loại cả 4 kiện ở (3, 2) sang hai tàu bằng lệnh rail.',
      san: [SAN_RAY_2, SAN_RAY_2],
      batDau: [{ x: 3, y: 3, nac: 0, tam: 1 }, { x: 3, y: 3, nac: 0, tam: 1 }],
      chong: [
        [C(3, 2, [27, 14, 21, 18])],
        [C(3, 2, [16, 29, 12, 25])]
      ],
      tau: [tauDoi(16, 2), tauDoi(16, 2)],
      giao: [
        [{ tau: 0, so: [14, 18] }, { tau: 1, so: [21, 27] }],
        [{ tau: 0, so: [12, 16] }, { tau: 1, so: [25, 29] }]
      ],
      maMau: bai([
        'while read_code() != -1:',
        '    if read_code() // 10 == 1:',
        '        pick_up()',
        '        rail(-1)',
        '        set_down()',
        '        rail(1)'
      ]),
      loiGiai: bai([
        'while read_code() != -1:',
        '    if read_code() // 10 == 1:',
        '        pick_up()',
        '        rail(-1)',
        '        set_down()',
        '        rail(1)',
        '    else:',
        '        pick_up()',
        '        rail(1)',
        '        set_down()',
        '        rail(-1)'
      ]),
      sao: { o: 11, nhip: 32 },
      loiGiaiKhac: {
        moTa: 'Dùng for i in range(4) thay cho while read_code() != -1',
        baiLam: bai([
          'for i in range(4):',
          '    if read_code() // 10 == 1:',
          '        pick_up()',
          '        rail(-1)',
          '        set_down()',
          '        rail(1)',
          '    else:',
          '        pick_up()',
          '        rail(1)',
          '        set_down()',
          '        rail(-1)'
        ])
      },
      loiSai: [
        { moTa: 'Chưa viết nhánh else nên gặp kiện hàng chục bằng 2 thì đứng im', baiLam: bai(['while read_code() != -1:', '    if read_code() // 10 == 1:', '        pick_up()', '        rail(-1)', '        set_down()', '        rail(1)']), phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Trượt nhầm hướng nên giao ngược tàu', baiLam: bai(['while read_code() != -1:', '    if read_code() // 10 == 1:', '        pick_up()', '        rail(1)', '        set_down()', '        rail(-1)', '    else:', '        pick_up()', '        rail(-1)', '        set_down()', '        rail(1)']), phaiCoMa: ['giao-nham'] }
      ],
      goiY: ['Luna: Khi chữ số hàng chục là 1 thì trượt sang trái bằng rail(-1), đặt xuống Tàu 1 rồi rail(1) về (3, 2).', 'Luna: Trong nhánh else, gọi pick_up(), rail(1), set_down(), rail(-1) để giao sang Tàu 2 rồi quay về (3, 2).']
    }),

    /* ========================================================================
       CHƯƠNG 2: che-duong-ray (10 màn) — Chế lệnh: dời bệ cẩu
       ======================================================================== */
    manCheDuongRay({
      so: 1, ten: 'Chế hàm rail_pick(dx)', hang: 'lam-quen',
      taoHam: ['rail_pick'],
      hamCuaEmCan: [],
      deBai: 'Sola nhờ bạn: mở Xưởng hàm chế rail_pick(dx) gồm 4 lệnh: rail(dx), pick_up(), rail(-dx), set_down() để trượt đi lấy kiện hàng cách dx cột trên đường ray đem về đặt tại vị trí hiện tại. Áp dụng gọi rail_pick(-2) và rail_pick(2) khi đứng ở (3, 3) hướng nấc 0 để gom 2 kiện ở hai đầu cầu cảng (1, 2) và (5, 2) về boong tàu (3, 2).',
      veMaMau: 'Tạo hàm rail_pick(dx) rồi gọi rail_pick(-2) và rail_pick(2).',
      san: SAN_RAY_1,
      batDau: { x: 3, y: 3, nac: 0, tam: 1 },
      chong: [C(1, 2, [14]), C(5, 2, [23])],
      tau: tauDon(12, 2),
      giao: [{ tau: 0, so: [14, 23] }],
      maMau: bai([
        'rail_pick(-2)',
        'rail_pick(2)'
      ]),
      loiGiai: bai(
        ['rail_pick(-2)', 'rail_pick(2)'],
        { hamCuaEmMoi: [hRailPick()] }
      ),
      sao: { o: 6, nhip: 12 },
      loiGiaiKhac: {
        moTa: 'Lấy kiện ở (5, 2) trước rồi mới lấy kiện ở (1, 2)',
        baiLam: bai(['rail_pick(2)', 'rail_pick(-2)']),
        hamCuaEmMoi: [hRailPick()]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm rail_pick mà đã bấm Chạy', baiLam: bai(['rail_pick(-2)', 'rail_pick(2)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong rail_pick quên gọi rail(-dx) nên lần gọi thứ hai nhấc hụt ở (3, 2)', baiLam: bai(['rail_pick(-2)', 'rail_pick(2)']), hamCuaEmMoi: [hRailPick(['rail(dx)', 'pick_up()', 'set_down()'])], phaiCoMa: ['moc-hut'] }
      ],
      goiY: ['Luna: Thân hàm rail_pick(dx) gồm 4 dòng: rail(dx), pick_up(), rail(-dx), set_down().', 'Luna: Ở chương trình chính gọi rail_pick(-2) và rail_pick(2).']
    }),

    manCheDuongRay({
      so: 2, ten: 'Gom hai đầu cầu cảng', hang: 'lam-quen',
      hamCuaEmCan: ['rail_pick'],
      deBai: 'Sola nhờ bạn: tại hai đầu cầu cảng (1, 2) và (5, 2) mỗi bên có chồng 2 kiện hàng. Bệ cẩu đang ở (3, 3) hướng nấc 0 chỉ vào boong tàu (3, 2). Hãy dùng vòng lặp for i in range(2): gọi rail_pick(-2) và rail_pick(2) để gom hết 4 kiện lên tàu.',
      veMaMau: 'Trong vòng lặp for i in range(2): hãy gọi rail_pick(-2) rồi rail_pick(2).',
      san: SAN_RAY_1,
      batDau: { x: 3, y: 3, nac: 0, tam: 1 },
      chong: [C(1, 2, [11, 17]), C(5, 2, [22, 28])],
      tau: tauDon(24, 2),
      giao: [{ tau: 0, so: [11, 17, 22, 28] }],
      maMau: bai([
        'for i in range(2):',
        '    rail_pick(-2)'
      ]),
      loiGiai: bai([
        'for i in range(2):',
        '    rail_pick(-2)',
        '    rail_pick(2)'
      ]),
      sao: { o: 7, nhip: 24 },
      loiGiaiKhac: {
        moTa: 'Gọi rail_pick(2) trước rail_pick(-2) trong vòng lặp',
        baiLam: bai([
          'for i in range(2):',
          '    rail_pick(2)',
          '    rail_pick(-2)'
        ])
      },
      loiSai: [
        { moTa: 'Mới lấy 2 kiện bên trái ở (1, 2), chưa lấy 2 kiện bên phải ở (5, 2)', baiLam: bai(['for i in range(2):', '    rail_pick(-2)']), phaiCoMa: ['chua-giao-tau'] },
        { moTa: 'Truyền nhầm khoảng cách -1 thay vì -2 nên nhấc hụt trên boong tàu', baiLam: bai(['for i in range(2):', '    rail_pick(-1)', '    rail_pick(2)']), phaiCoMa: ['moc-hut'] }
      ],
      goiY: ['Luna: Từ cột 3 đến cột 1 là dx = -2, từ cột 3 đến cột 5 là dx = 2.', 'Luna: Thêm rail_pick(2) ngay dưới rail_pick(-2) trong vòng lặp for.']
    }),

    manCheDuongRay({
      so: 3, ten: 'Chế hàm rail_drop(dx)', hang: 'lam-quen',
      taoHam: ['rail_drop'],
      hamCuaEmCan: [],
      deBai: 'Sola nhờ bạn: mở Xưởng hàm chế rail_drop(dx) gồm 4 lệnh: pick_up(), rail(dx), set_down(), rail(-dx) để nhấc kiện tại chỗ đem sang cột cách dx hạ xuống rồi quay về. Áp dụng tại (3, 3) hướng nấc 0 để chuyển kiện đỉnh ở (3, 2) sang Tàu 1 bằng rail_drop(-1) và kiện đáy sang Tàu 2 bằng rail_drop(1).',
      veMaMau: 'Tạo hàm rail_drop(dx) rồi gọi rail_drop(-1) và rail_drop(1).',
      san: SAN_RAY_2,
      batDau: { x: 3, y: 3, nac: 0, tam: 1 },
      chong: [C(3, 2, [26, 15])],
      tau: tauDoi(8, 2),
      giao: [{ tau: 0, so: [15] }, { tau: 1, so: [26] }],
      maMau: bai([
        'rail_drop(-1)',
        'rail_drop(1)'
      ]),
      loiGiai: bai(
        ['rail_drop(-1)', 'rail_drop(1)'],
        { hamCuaEmMoi: [hRailDrop()] }
      ),
      sao: { o: 6, nhip: 8 },
      loiGiaiKhac: {
        moTa: 'Thêm chú thích trước khi gọi rail_drop(-1) và rail_drop(1)',
        baiLam: bai(['# chia 2 kiện sang hai tàu', 'rail_drop(-1)', 'rail_drop(1)']),
        hamCuaEmMoi: [hRailDrop()]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm rail_drop mà đã bấm Chạy', baiLam: bai(['rail_drop(-1)', 'rail_drop(1)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Gọi ngược thứ tự nên đưa kiện 15 sang Tàu 2 và kiện 26 sang Tàu 1', baiLam: bai(['rail_drop(1)', 'rail_drop(-1)']), hamCuaEmMoi: [hRailDrop()], phaiCoMa: ['giao-nham'] }
      ],
      goiY: ['Luna: Thân hàm rail_drop(dx) gồm 4 dòng: pick_up(), rail(dx), set_down(), rail(-dx).', 'Luna: Gọi rail_drop(-1) trước cho kiện 15 trên đỉnh, rồi gọi rail_drop(1) cho kiện 26 ở dưới.']
    }),

    manCheDuongRay({
      so: 4, ten: 'Chế hàm shuttle_cont(dx)', hang: 'luyen-tap',
      taoHam: ['shuttle_cont'],
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by'],
      deBai: 'Sola nhờ bạn: mở Xưởng hàm chế shuttle_cont(dx) gồm: rail(dx), carry_by(4), swing_by(4) để trượt dx ô trên đường ray, chuyển kiện ở nấc 4 sang boong tàu nấc 0 rồi quay lại nấc 4. Áp dụng lặp 3 lần shuttle_cont(1) để bốc 3 kiện ở (2, 4), (3, 4), (4, 4) lên tàu.',
      veMaMau: 'Tạo hàm shuttle_cont(dx) rồi lặp 3 lần gọi shuttle_cont(1).',
      san: SAN_RAY_1,
      batDau: { x: 1, y: 3, nac: 4, tam: 1 },
      chong: [C(2, 4, [13]), C(3, 4, [18]), C(4, 4, [24])],
      tau: tauDon(33, 2),
      giao: [{ tau: 0, so: [13, 18, 24] }],
      maMau: bai([
        'for i in range(3):',
        '    shuttle_cont(1)'
      ]),
      loiGiai: bai(
        ['for i in range(3):', '    shuttle_cont(1)'],
        { hamCuaEmMoi: [hShuttleCont()] }
      ),
      sao: { o: 14, nhip: 33 },
      loiGiaiKhac: {
        moTa: 'Gọi shuttle_cont(1) 3 dòng liên tiếp',
        baiLam: bai(['shuttle_cont(1)', 'shuttle_cont(1)', 'shuttle_cont(1)']),
        hamCuaEmMoi: [hShuttleCont()]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm shuttle_cont mà đã bấm Chạy', baiLam: bai(['for i in range(3):', '    shuttle_cont(1)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong shuttle_cont quên gọi swing_by(4) nên lần lặp thứ hai nhấc hụt trên boong tàu', baiLam: bai(['for i in range(3):', '    shuttle_cont(1)']), hamCuaEmMoi: [hShuttleCont(['rail(dx)', 'carry_by(4)'])], phaiCoMa: ['moc-hut'] }
      ],
      goiY: ['Luna: Thân hàm shuttle_cont(dx) gồm 3 dòng: rail(dx), carry_by(4), swing_by(4).', 'Luna: Chương trình chính lặp 3 lần gọi shuttle_cont(1).']
    }),

    manCheDuongRay({
      so: 5, ten: 'Chế hàm rail_clear(dx)', hang: 'luyen-tap',
      taoHam: ['rail_clear'],
      hamCuaEmCan: ['rail_drop'],
      deBai: 'Sola nhờ bạn: mở Xưởng hàm chế rail_clear(dx) lặp while read_code() != -1: gọi rail_drop(dx) để dời toàn bộ chồng hàng tại chỗ sang cột cách dx. Áp dụng tại (3, 3) hướng nấc 0 để dời chồng 3 kiện ở (3, 2) sang Tàu 1 bằng rail_clear(-1).',
      veMaMau: 'Tạo hàm rail_clear(dx) rồi gọi rail_clear(-1).',
      san: SAN_RAY_2,
      batDau: { x: 3, y: 3, nac: 0, tam: 1 },
      chong: [C(3, 2, [19, 14, 11])],
      tau: tauDoi(12, 2),
      giao: [{ tau: 0, so: [11, 14, 19] }],
      maMau: bai(['rail_clear(-1)']),
      loiGiai: bai(
        ['rail_clear(-1)'],
        { hamCuaEmMoi: [hRailClear()] }
      ),
      sao: { o: 7, nhip: 12 },
      loiGiaiKhac: {
        moTa: 'Thêm chú thích trước khi gọi rail_clear(-1)',
        baiLam: bai(['# chuyển hết chồng hàng sang Tàu 1', 'rail_clear(-1)']),
        hamCuaEmMoi: [hRailClear()]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm rail_clear mà đã bấm Chạy', baiLam: bai(['rail_clear(-1)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Truyền dx = 1 nên chuyển nhầm cả chồng sang Tàu 2', baiLam: bai(['rail_clear(1)']), hamCuaEmMoi: [hRailClear()], phaiCoMa: ['giao-nham'] }
      ],
      goiY: ['Luna: Thân hàm rail_clear(dx) gồm 2 dòng: while read_code() != -1: và rail_drop(dx).', 'Luna: Ở chương trình chính gọi rail_clear(-1).']
    }),

    manCheDuongRay({
      so: 6, ten: 'Chế hàm scan_rail()', hang: 'luyen-tap',
      taoHam: ['scan_rail'],
      hamCuaEmCan: ['rail_drop'],
      deBai: 'Sola nhờ bạn: mở Xưởng hàm chế scan_rail() lặp while read_code() != -1:, nếu read_code() // 10 == 1 thì gọi rail_drop(-1) sang Tàu 1, ngược lại gọi rail_drop(1) sang Tàu 2. Áp dụng gọi scan_rail() để phân loại chồng 4 kiện ở (3, 2).',
      veMaMau: 'Tạo hàm scan_rail() rồi gọi scan_rail() ở chương trình chính.',
      san: SAN_RAY_2,
      batDau: { x: 3, y: 3, nac: 0, tam: 1 },
      chong: [C(3, 2, [24, 15, 29, 12])],
      tau: tauDoi(16, 2),
      giao: [{ tau: 0, so: [12, 15] }, { tau: 1, so: [24, 29] }],
      maMau: bai(['scan_rail()']),
      loiGiai: bai(
        ['scan_rail()'],
        { hamCuaEmMoi: [hScanRail()] }
      ),
      sao: { o: 10, nhip: 16 },
      loiGiaiKhac: {
        moTa: 'Thêm dòng chú thích trước khi gọi scan_rail()',
        baiLam: bai(['# phân loại chồng hàng bằng rail_drop', 'scan_rail()']),
        hamCuaEmMoi: [hScanRail()]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm scan_rail mà đã bấm Chạy', baiLam: bai(['scan_rail()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong scan_rail dùng nhầm % 10 thay vì // 10 nên giao nhầm tàu', baiLam: bai(['scan_rail()']), hamCuaEmMoi: [hScanRail(['while read_code() != -1:', '    if read_code() % 10 == 1:', '        rail_drop(-1)', '    else:', '        rail_drop(1)'])], phaiCoMa: ['giao-nham'] }
      ],
      goiY: ['Luna: Nhờ có sẵn rail_drop(dx), thân hàm scan_rail() rất gọn: kiểm tra if read_code() // 10 == 1: để gọi rail_drop(-1) hoặc rail_drop(1).', 'Luna: Ở chương trình chính chỉ cần gọi scan_rail().']
    }),

    manCheDuongRay({
      so: 7, ten: 'Sửa hàm rail_sort(n)', hang: 'bien-the',
      chinhCoDinh: true,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by'],
      deBai: 'Sola nhờ bạn: hàm rail_sort(n) của màn cần tiến qua n cột dọc đường ray, cột nào có hàng (read_code() != -1) thì gọi carry_by(4) và swing_by(4) để đưa lên tàu. Nhưng hàm đang viết nhầm điều kiện thành read_code() == -1. Hãy sửa lại hàm rail_sort(n).',
      veMaMau: 'Chương trình chính đã khóa. Hãy sửa == -1 thành != -1 trong hàm rail_sort(n).',
      san: SAN_RAY_1,
      batDau: { x: 1, y: 3, nac: 4, tam: 1 },
      chong: [C(2, 4, [17]), C(4, 4, [23])],
      tau: tauDon(23, 2),
      giao: [{ tau: 0, so: [17, 23] }],
      maMau: bai(
        ['rail_sort(3)'],
        { hamCuaMan: [hRailSort(T_RAIL_SORT_SAI)] }
      ),
      loiGiai: bai(
        ['rail_sort(3)'],
        { hamCuaMan: [hRailSort(T_RAIL_SORT_DUNG)] }
      ),
      sao: { o: 15, nhip: 23 },
      loiGiaiKhac: {
        moTa: 'Kiểm tra read_code() > 0 thay vì read_code() != -1',
        baiLam: bai(
          ['rail_sort(3)'],
          {
            hamCuaMan: [H('rail_sort', ['n'], [
              'for i in range(n):',
              '    rail(1)',
              '    if read_code() > 0:',
              '        carry_by(4)',
              '        swing_by(4)'
            ])]
          }
        )
      },
      loiSai: [
        { moTa: 'Để nguyên hàm mẫu dùng == -1 nên nhấc hụt ở cột trống (3, 4)', baiLam: bai(['rail_sort(3)'], { hamCuaMan: [hRailSort(T_RAIL_SORT_SAI)] }), phaiCoMa: ['moc-hut'] },
        { moTa: 'Bỏ luôn câu lệnh if nên vẫn nhấc hụt ở cột trống (3, 4)', baiLam: bai(['rail_sort(3)'], { hamCuaMan: [hRailSort(['for i in range(n):', '    rail(1)', '    carry_by(4)', '    swing_by(4)'])] }), phaiCoMa: ['moc-hut'] }
      ],
      goiY: ['Luna: Ô có kiện hàng trả về mã số dương (khác -1), còn ô trống trả về -1.', 'Luna: Đổi dòng if read_code() == -1: thành if read_code() != -1: trong hàm rail_sort(n).']
    }),

    manCheDuongRay({
      so: 8, ten: 'Dồn bãi lên cầu cảng', hang: 'bien-the',
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'clear_stack', 'rail_drop', 'scan_rail'],
      deBai: 'Sola nhờ bạn: phân loại chồng hàng ở cầu cảng (3, 2) lên hai tàu bằng scan_rail(), sau đó quay sang nấc 4 (3, 4) dùng clear_stack(4) đưa chồng hàng ở bãi sau ra (3, 2), rồi quay về nấc 0 gọi scan_rail() lần nữa.',
      veMaMau: 'Sau clear_stack(4) ở nấc 4, hãy quay về nấc 0 bằng swing_by(4) và gọi scan_rail().',
      san: SAN_RAY_2,
      batDau: { x: 3, y: 3, nac: 0, tam: 1 },
      chong: [C(3, 2, [26, 14]), C(3, 4, [18, 21])],
      tau: tauDoi(44, 2),
      giao: [{ tau: 0, so: [14, 18] }, { tau: 1, so: [21, 26] }],
      maMau: bai([
        'scan_rail()',
        'swing_by(4)',
        'clear_stack(4)'
      ]),
      loiGiai: bai([
        'scan_rail()',
        'swing_by(4)',
        'clear_stack(4)',
        'swing_by(4)',
        'scan_rail()'
      ]),
      sao: { o: 28, nhip: 44 },
      loiGiaiKhac: {
        moTa: 'Dùng swing_by(-4) khi quay về nấc 0',
        baiLam: bai([
          'scan_rail()',
          'swing_by(4)',
          'clear_stack(4)',
          'swing_by(-4)',
          'scan_rail()'
        ])
      },
      loiSai: [
        { moTa: 'Mới phân loại chồng đầu tiên ở (3, 2)', baiLam: bai(['scan_rail()']), phaiCoMa: ['chua-giao-tau'] },
        { moTa: 'Đưa chồng ở (3, 4) ra (3, 2) nhưng quên gọi scan_rail() lần hai', baiLam: bai(['scan_rail()', 'swing_by(4)', 'clear_stack(4)']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Sau clear_stack(4), cả 2 kiện từ (3, 4) đã nằm ở cầu cảng (3, 2) nhưng đầu cần vẫn ở nấc 4.', 'Luna: Gọi swing_by(4) về nấc 0 rồi gọi scan_rail() để phân loại nốt lên hai tàu.']
    }),

    manCheDuongRay({
      so: 9, ten: 'Hai bến gom hàng dọc ray', hang: 'bien-the', nhipTheo: 'tong',
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'rail_pick'],
      deBai: 'Sola nhờ bạn: trên hai sân, bệ cẩu đứng ở (3, 3) hướng nấc 0. Hãy gom kiện ở hai đầu cầu cảng (1, 2) và (5, 2) về boong tàu (3, 2) bằng rail_pick(-2) và rail_pick(2), sau đó quay sang nấc 4 dùng carry_by(4) đưa nốt kiện ở (3, 4) lên tàu.',
      veMaMau: 'Sau rail_pick(-2) và rail_pick(2), hãy quay sang nấc 4 và gọi carry_by(4).',
      san: [SAN_RAY_1, SAN_RAY_1],
      batDau: [{ x: 3, y: 3, nac: 0, tam: 1 }, { x: 3, y: 3, nac: 0, tam: 1 }],
      chong: [
        [C(1, 2, [12]), C(5, 2, [24]), C(3, 4, [18])],
        [C(1, 2, [21]), C(5, 2, [15]), C(3, 4, [29])]
      ],
      tau: [tauDon(22, 2), tauDon(22, 2)],
      giao: [
        [{ tau: 0, so: [12, 18, 24] }],
        [{ tau: 0, so: [15, 21, 29] }]
      ],
      maMau: bai([
        'rail_pick(-2)',
        'rail_pick(2)'
      ]),
      loiGiai: bai([
        'rail_pick(-2)',
        'rail_pick(2)',
        'swing_by(4)',
        'carry_by(4)'
      ]),
      sao: { o: 17, nhip: 44 },
      loiGiaiKhac: {
        moTa: 'Gọi rail_pick(2) trước rail_pick(-2)',
        baiLam: bai([
          'rail_pick(2)',
          'rail_pick(-2)',
          'swing_by(4)',
          'carry_by(4)'
        ])
      },
      loiSai: [
        { moTa: 'Mới gom 2 kiện ở (1, 2) và (5, 2), quên kiện ở (3, 4)', baiLam: bai(['rail_pick(-2)', 'rail_pick(2)']), phaiCoMa: ['chua-giao-tau'] },
        { moTa: 'Quên gọi swing_by(4) trước khi gọi carry_by(4)', baiLam: bai(['rail_pick(-2)', 'rail_pick(2)', 'carry_by(4)']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Sau rail_pick(-2) và rail_pick(2), đầu cần đang ở nấc 0 chỉ vào (3, 2).', 'Luna: Thêm swing_by(4) sang (3, 4) rồi gọi carry_by(4) để đưa kiện thứ ba lên tàu.']
    }),

    manCheDuongRay({
      so: 10, ten: 'Trùm Chế lệnh: dời bệ cẩu', hang: 'trum', nhipTheo: 'tong',
      huyHieu: { ma: 'che-duong-ray', ten: 'Huy hiệu Chế lệnh: dời bệ cẩu' },
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'clear_stack', 'rail_pick', 'rail_drop', 'scan_rail'],
      deBai: 'Trùm chương 2: trên hai sân, bệ cẩu đứng ở (3, 3) hướng nấc 4. Hai kiện hàng nằm ở hai đầu bãi (1, 4) và (5, 4), còn tại cầu cảng (3, 2) có sẵn 2 kiện. Hãy dùng rail_pick(-2) và rail_pick(2) gom 2 kiện ở hai đầu bãi về (3, 4), dùng clear_stack(4) chuyển cả chồng từ (3, 4) sang (3, 2), rồi quay về nấc 0 gọi scan_rail() phân loại tất cả lên hai tàu.',
      veMaMau: 'Kết hợp rail_pick(-2), rail_pick(2), clear_stack(4), swing_by(4) và scan_rail().',
      san: [SAN_RAY_2, SAN_RAY_2],
      batDau: [{ x: 3, y: 3, nac: 4, tam: 1 }, { x: 3, y: 3, nac: 4, tam: 1 }],
      chong: [
        [C(1, 4, [15]), C(5, 4, [22]), C(3, 2, [28, 12])],
        [C(1, 4, [25]), C(5, 4, [16]), C(3, 2, [19, 24])]
      ],
      tau: [tauDoi(52, 2), tauDoi(52, 2)],
      giao: [
        [{ tau: 0, so: [12, 15] }, { tau: 1, so: [22, 28] }],
        [{ tau: 0, so: [16, 19] }, { tau: 1, so: [24, 25] }]
      ],
      maMau: bai([
        'rail_pick(-2)',
        'rail_pick(2)',
        'clear_stack(4)'
      ]),
      loiGiai: bai([
        'rail_pick(-2)',
        'rail_pick(2)',
        'clear_stack(4)',
        'swing_by(4)',
        'scan_rail()'
      ]),
      sao: { o: 32, nhip: 104 },
      loiGiaiKhac: {
        moTa: 'Gom kiện ở (5, 4) bằng rail_pick(2) trước rồi mới gọi rail_pick(-2)',
        baiLam: bai([
          'rail_pick(2)',
          'rail_pick(-2)',
          'clear_stack(4)',
          'swing_by(4)',
          'scan_rail()'
        ])
      },
      loiSai: [
        { moTa: 'Mới gom hàng ra (3, 2), quên quay sang nấc 0 gọi scan_rail()', baiLam: bai(['rail_pick(-2)', 'rail_pick(2)', 'clear_stack(4)']), phaiCoMa: ['chua-giao-tau'] },
        { moTa: 'Gọi scan_rail() khi đầu cần còn ở nấc 4 chưa quay về nấc 0', baiLam: bai(['rail_pick(-2)', 'rail_pick(2)', 'clear_stack(4)', 'scan_rail()']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Sau rail_pick(-2), rail_pick(2) và clear_stack(4), cả 4 kiện đều đã tập kết tại cầu cảng (3, 2).', 'Luna: Gọi swing_by(4) để quay đầu cần về nấc 0 chỉ vào (3, 2), rồi gọi scan_rail() để phân loại hết lên hai tàu.']
    })
  ];

  ManHoc.manDuongRay = DS;
  if (laNode) module.exports = DS;
})();
