/* ============================================================================
   man-nhac-doi.js — "Robot Chấn Hưng": GÓI 6 MÙA 4 "CẢNG SÔNG" (MÓC CẨU ĐÔI)
   Gồm 20 màn mới trên Cần cẩu R1 nâng cấp tay móc đôi 2 container (pick_up2):
   - nhac-doi.1..10     (10 màn chương nhac-doi "Móc đôi hai tầng")
   - che-nhac-doi.1..10 (10 màn chương che-nhac-doi "Chế lệnh: bốc nhanh")
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var HAM_DOI = ['swing_left', 'swing_right', 'extend', 'retract', 'pick_up', 'set_down', 'pick_up2', 'read_code', 'rail', 'wait'];
  var ROBOT_DOI = { than: 'cau', tay: 'moc-cau', camBien: [{ ma: 'quet-ma', o: 'tren' }] };
  var CAU_TRUC = ['for', 'if', 'while', 'list'];

  var SAN_DOI_1 = [
    '~~~~~~~',
    '~~~~~~~',
    '~DTTTD~',
    '.RRRRR.',
    '.DDDDD.',
    '.DDDDD.',
    '.......'
  ];

  var SAN_DOI_2 = [
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

  // Các hàm chế ở Gói 6 chương che-nhac-doi
  var T_CARRY2_BY = [
    'pick_up2()',
    'swing_by(d)',
    'set_down()'
  ];
  var T_CARRY2_N = [
    'for i in range(n):',
    '    carry2_by(d)',
    '    swing_by(-d)'
  ];
  var T_FAST_STACK = [
    'carry2_n(n // 2, d)',
    'carry_n(n % 2, d)'
  ];
  var T_RAIL_CARRY2 = [
    'pick_up2()',
    'rail(dx)',
    'set_down()',
    'rail(-dx)'
  ];
  var T_SHIP_PAIR2 = [
    'if read_code() // 10 == 1:',
    '    rail_carry2(-1)',
    'else:',
    '    rail_carry2(1)'
  ];
  var T_SPLIT_STACK2_SAI = [
    'carry2_n(n % 2, 4)',
    'carry_n(n // 2, 4)'
  ];
  var T_SPLIT_STACK2_DUNG = [
    'carry2_n(n // 2, 4)',
    'carry_n(n % 2, 4)'
  ];

  function hCarry2By(than) { return H('carry2_by', ['d'], than || T_CARRY2_BY); }
  function hCarry2N(than) { return H('carry2_n', ['n', 'd'], than || T_CARRY2_N); }
  function hFastStack(than) { return H('fast_stack', ['n', 'd'], than || T_FAST_STACK); }
  function hRailCarry2(than) { return H('rail_carry2', ['dx'], than || T_RAIL_CARRY2); }
  function hShipPair2(than) { return H('ship_pair2', [], than || T_SHIP_PAIR2); }
  function hSplitStack2(than) { return H('split_stack2', ['n'], than || T_SPLIT_STACK2_DUNG); }

  function manNhacDoi(cfg) {
    return ManHoc.chuanHoa(Object.assign({
      chuong: 'nhac-doi',
      loaiRobot: 'cau',
      robot: ROBOT_DOI,
      vo: 'cang',
      hamGoc: HAM_DOI,
      cauTruc: CAU_TRUC,
      khung: { chinh: 10, moiHam: 10 },
      moXuong: true,
      mucTieu: 'giao-tau',
      hamCuaEmCan: [],
      taoHam: []
    }, cfg));
  }

  function manCheNhacDoi(cfg) {
    return ManHoc.chuanHoa(Object.assign({
      chuong: 'che-nhac-doi',
      loaiRobot: 'cau',
      robot: ROBOT_DOI,
      vo: 'cang',
      hamGoc: HAM_DOI,
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
       CHƯƠNG 1: nhac-doi (10 màn) — Móc đôi hai tầng
       ======================================================================== */
    manNhacDoi({
      so: 1, ten: 'Nhấc đôi một nhịp', hang: 'lam-quen',
      chiChay: true, chinhCoDinh: true,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by'],
      deBai: 'Sola làm mẫu: móc cẩu đôi cho phép gọi pick_up2() nhấc cùng lúc 2 container trên đỉnh chồng và giữ nguyên thứ tự [dưới, trên]. Bấm Chạy để xem cần cẩu bốc cặp [20, 10] ở (3, 4) lên tàu chỉ trong 6 nhịp.',
      veMaMau: 'Chương trình mẫu đã khóa. Bấm Chạy để quan sát lệnh pick_up2() nhấc 2 kiện cùng lúc.',
      san: SAN_DOI_1,
      batDau: { x: 3, y: 3, nac: 4, tam: 1 },
      chong: [C(3, 4, [20, 10])],
      tau: tauDon(6, 2),
      giao: [{ tau: 0, so: [10, 20] }],
      maMau: bai([
        'pick_up2()',
        'swing_by(4)',
        'set_down()'
      ]),
      loiGiai: bai([
        'pick_up2()',
        'swing_by(4)',
        'set_down()'
      ]),
      sao: { o: 9, nhip: 6 },
      loiSai: [],
      goiY: ['Luna: Bấm nút Chạy để xem móc đôi nhấc cả 2 kiện 20 và 10 trong 1 nhịp.', 'Luna: Khi gọi set_down(), cả 2 kiện được hạ xuống boong tàu theo đúng thứ tự [20, 10].']
    }),

    manNhacDoi({
      so: 2, ten: 'Móc đôi trượt đường ray', hang: 'lam-quen',
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by'],
      deBai: 'Sola nhờ bạn: tại (1, 4) có cặp kiện [22, 14], tàu chỉ đỗ 8 nhịp ở giữa bến. Hãy gọi pick_up2() nhấc cả 2 kiện, trượt rail(2) sang cột 3, quay sang nấc 0 bằng swing_by(4) rồi set_down() lên tàu.',
      veMaMau: 'Sau pick_up2() và rail(2), hãy quay sang nấc 0 rồi hạ cặp kiện xuống tàu.',
      san: SAN_DOI_1,
      batDau: { x: 1, y: 3, nac: 4, tam: 1 },
      chong: [C(1, 4, [22, 14])],
      tau: tauDon(8, 2),
      giao: [{ tau: 0, so: [14, 22] }],
      maMau: bai([
        'pick_up2()',
        'rail(2)'
      ]),
      loiGiai: bai([
        'pick_up2()',
        'rail(2)',
        'swing_by(4)',
        'set_down()'
      ]),
      sao: { o: 10, nhip: 8 },
      loiGiaiKhac: {
        moTa: 'Dùng swing_by(-4) khi quay sang nấc 0',
        baiLam: bai([
          'pick_up2()',
          'rail(2)',
          'swing_by(-4)',
          'set_down()'
        ])
      },
      loiSai: [
        { moTa: 'Dùng pick_up() thay vì pick_up2() nên chỉ giao được 1 kiện trước khi tàu đi', baiLam: bai(['pick_up()', 'rail(2)', 'swing_by(4)', 'set_down()']), phaiCoMa: ['chua-giao-tau'] },
        { moTa: 'Mới trượt sang cột 3 nhưng chưa quay cần và hạ hàng', baiLam: bai(['pick_up2()', 'rail(2)']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Lệnh pick_up2() đã treo cả 2 kiện [22, 14] dưới đầu cần.', 'Luna: Thêm swing_by(4) và set_down() để hạ cả cặp xuống ô boong tàu (3, 2).']
    }),

    manNhacDoi({
      so: 3, ten: 'Cặp đôi và kiện lẻ', hang: 'lam-quen',
      mucTieu: 'bong-mo',
      hamCuaEmCan: [],
      deBai: 'Sola nhờ bạn: tại (1, 4) có 2 kiện [25, 15], còn tại (3, 4) chỉ có 1 kiện lẻ [11]. Hãy dùng pick_up2() dời cặp [25, 15] sang (5, 4), sau đó lùi rail(-2) về (3, 4) dùng pick_up() lấy kiện lẻ 11 đem sang đặt lên đỉnh tại (5, 4), đỗ bệ cẩu ở (5, 3).',
      veMaMau: 'Chỗ có 2 kiện dùng pick_up2(), chỗ chỉ có 1 kiện phải dùng pick_up().',
      san: SAN_DOI_1,
      batDau: { x: 1, y: 3, nac: 4, tam: 1 },
      chong: [C(1, 4, [25, 15]), C(3, 4, [11])],
      tau: tauDon(20, 0),
      bongMo: BM(5, 3, [
        { x: 1, y: 4, so: [] },
        { x: 3, y: 4, so: [] },
        { x: 5, y: 4, so: [25, 15, 11] }
      ]),
      maMau: bai([
        'pick_up2()',
        'rail(4)',
        'set_down()',
        'rail(-2)'
      ]),
      loiGiai: bai([
        'pick_up2()',
        'rail(4)',
        'set_down()',
        'rail(-2)',
        'pick_up()',
        'rail(2)',
        'set_down()'
      ]),
      sao: { o: 7, nhip: 12 },
      loiGiaiKhac: {
        moTa: 'Tách rail(4) thành hai lần rail(2)',
        baiLam: bai([
          'pick_up2()',
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
        { moTa: 'Gọi pick_up2() ở (3, 4) khi chồng chỉ có 1 kiện nên bị lỗi móc thiếu', baiLam: bai(['pick_up2()', 'rail(4)', 'set_down()', 'rail(-2)', 'pick_up2()']), phaiCoMa: ['moc-thieu'] },
        { moTa: 'Mới dời cặp [25, 15] sang (5, 4), chưa lấy kiện 11 ở (3, 4)', baiLam: bai(['pick_up2()', 'rail(4)', 'set_down()', 'rail(-2)']), phaiCoMa: ['chua-xep-chong'] }
      ],
      goiY: ['Luna: Chồng ở (3, 4) chỉ có 1 kiện nên nếu gọi pick_up2() sẽ báo lỗi moc-thieu.', 'Luna: Sau rail(-2), gọi pick_up(), rail(2), set_down() để hoàn tất chồng [25, 15, 11].']
    }),

    manNhacDoi({
      so: 4, ten: 'Bốc chồng bốn tầng', hang: 'luyen-tap',
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by'],
      deBai: 'Sola nhờ bạn: tại (3, 4) có chồng 4 kiện hàng [19, 17, 14, 11]. Hãy dùng vòng lặp for i in range(2): để thực hiện 2 chuyến pick_up2() đưa hết 4 kiện lên boong tàu ở (3, 2) trong 20 nhịp.',
      veMaMau: 'Trong vòng lặp for i in range(2): hãy nhấc đôi, quay sang nấc 0 hạ xuống rồi quay về nấc 4.',
      san: SAN_DOI_1,
      batDau: { x: 3, y: 3, nac: 4, tam: 1 },
      chong: [C(3, 4, [19, 17, 14, 11])],
      tau: tauDon(20, 2),
      giao: [{ tau: 0, so: [11, 14, 17, 19] }],
      maMau: bai([
        'for i in range(2):',
        '    pick_up2()',
        '    swing_by(4)'
      ]),
      loiGiai: bai([
        'for i in range(2):',
        '    pick_up2()',
        '    swing_by(4)',
        '    set_down()',
        '    swing_by(4)'
      ]),
      sao: { o: 11, nhip: 20 },
      loiGiaiKhac: {
        moTa: 'Dùng swing_by(-4) khi quay về nấc 4',
        baiLam: bai([
          'for i in range(2):',
          '    pick_up2()',
          '    swing_by(4)',
          '    set_down()',
          '    swing_by(-4)'
        ])
      },
      loiSai: [
        { moTa: 'Dùng pick_up() thay vì pick_up2() nên 2 chuyến chỉ giao được 2 kiện', baiLam: bai(['for i in range(2):', '    pick_up()', '    swing_by(4)', '    set_down()', '    swing_by(4)']), phaiCoMa: ['chua-giao-tau'] },
        { moTa: 'Quên gọi swing_by(4) ở cuối vòng lặp nên lần thứ hai nhấc ở boong tàu rồi hạ chồng 4 kiện', baiLam: bai(['for i in range(2):', '    pick_up2()', '    swing_by(4)', '    set_down()']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Chồng 4 kiện chia thành 4 // 2 = 2 chuyến nhấc đôi.', 'Luna: Trong vòng lặp for, sau swing_by(4) hãy gọi set_down() rồi swing_by(4) để quay về nấc 4.']
    }),

    manNhacDoi({
      so: 5, ten: 'Chồng ba kiện ở cầu cảng', hang: 'luyen-tap',
      hamCuaEmCan: ['rail_drop'],
      deBai: 'Sola nhờ bạn: tại cầu cảng giữa (3, 2) có chồng 3 kiện [28, 18, 12]. Hai kiện trên [18, 12] cần giao cho Tàu 1 ở (2, 2), còn kiện đáy 28 cần giao cho Tàu 2 ở (4, 2). Hãy dùng pick_up2() chuyển cặp [18, 12] sang Tàu 1, quay về (3, 2) rồi dùng rail_drop(1) giao kiện lẻ 28 sang Tàu 2.',
      veMaMau: 'Sau khi giao cặp [18, 12] sang (2, 2) và quay về (3, 2), hãy gọi rail_drop(1).',
      san: SAN_DOI_2,
      batDau: { x: 3, y: 3, nac: 0, tam: 1 },
      chong: [C(3, 2, [28, 18, 12])],
      tau: tauDoi(8, 2),
      giao: [{ tau: 0, so: [12, 18] }, { tau: 1, so: [28] }],
      maMau: bai([
        'pick_up2()',
        'rail(-1)',
        'set_down()',
        'rail(1)'
      ]),
      loiGiai: bai([
        'pick_up2()',
        'rail(-1)',
        'set_down()',
        'rail(1)',
        'rail_drop(1)'
      ]),
      sao: { o: 9, nhip: 8 },
      loiGiaiKhac: {
        moTa: 'Viết tường minh pick_up(), rail(1), set_down(), rail(-1) cho kiện cuối',
        baiLam: bai([
          'pick_up2()',
          'rail(-1)',
          'set_down()',
          'rail(1)',
          'pick_up()',
          'rail(1)',
          'set_down()',
          'rail(-1)'
        ])
      },
      loiSai: [
        { moTa: 'Gọi pick_up2() lần thứ hai khi ở (3, 2) chỉ còn 1 kiện 28', baiLam: bai(['pick_up2()', 'rail(-1)', 'set_down()', 'rail(1)', 'pick_up2()']), phaiCoMa: ['moc-thieu'] },
        { moTa: 'Mới giao cặp [18, 12] cho Tàu 1, chưa giao kiện 28 cho Tàu 2', baiLam: bai(['pick_up2()', 'rail(-1)', 'set_down()', 'rail(1)']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Sau 4 lệnh đầu, cặp [18, 12] đã nằm trên Tàu 1 và đầu cần đã quay về (3, 2).', 'Luna: Chỉ còn 1 kiện 28 tại (3, 2), hãy gọi rail_drop(1) để giao sang Tàu 2.']
    }),

    manNhacDoi({
      so: 6, ten: 'Quét ba cặp dọc đường ray', hang: 'luyen-tap',
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by'],
      deBai: 'Sola nhờ bạn: tại ba cột 2, 3, 4 của hàng bãi y = 4 đều có sẵn một cặp 2 kiện hàng. Bệ cẩu bắt đầu ở (1, 3) hướng nấc 4. Hãy lặp 3 lần: mỗi lần tiến rail(1), dùng pick_up2() nhấc cả cặp, quay sang nấc 0 hạ xuống tàu rồi quay lại nấc 4.',
      veMaMau: 'Hoàn thiện vòng lặp for i in range(3): để bốc cả 3 cặp kiện hàng lên tàu.',
      san: SAN_DOI_1,
      batDau: { x: 1, y: 3, nac: 4, tam: 1 },
      chong: [C(2, 4, [21, 11]), C(3, 4, [24, 14]), C(4, 4, [29, 19])],
      tau: tauDon(33, 2),
      giao: [{ tau: 0, so: [11, 14, 19, 21, 24, 29] }],
      maMau: bai([
        'for i in range(3):',
        '    rail(1)',
        '    pick_up2()',
        '    swing_by(4)'
      ]),
      loiGiai: bai([
        'for i in range(3):',
        '    rail(1)',
        '    pick_up2()',
        '    swing_by(4)',
        '    set_down()',
        '    swing_by(4)'
      ]),
      sao: { o: 12, nhip: 33 },
      loiGiaiKhac: {
        moTa: 'Dùng swing_by(-4) khi quay về nấc 4',
        baiLam: bai([
          'for i in range(3):',
          '    rail(1)',
          '    pick_up2()',
          '    swing_by(4)',
          '    set_down()',
          '    swing_by(-4)'
        ])
      },
      loiSai: [
        { moTa: 'Dùng pick_up() thay vì pick_up2() nên mỗi cột còn sót 1 kiện', baiLam: bai(['for i in range(3):', '    rail(1)', '    pick_up()', '    swing_by(4)', '    set_down()', '    swing_by(4)']), phaiCoMa: ['chua-giao-tau'] },
        { moTa: 'Quên gọi set_down() nên đang treo hàng lại gọi pick_up2() ở cột tiếp theo', baiLam: bai(['for i in range(3):', '    rail(1)', '    pick_up2()', '    swing_by(4)', '    swing_by(4)']), phaiCoMa: ['dang-treo'] }
      ],
      goiY: ['Luna: Mỗi cột có đúng 2 kiện nên 1 lệnh pick_up2() nhấc gọn cả cột.', 'Luna: Sau swing_by(4), thêm set_down() và swing_by(4) để khép kín vòng lặp.']
    }),

    manNhacDoi({
      so: 7, ten: 'Giữ nguyên thứ tự tháp', hang: 'bien-the',
      luatThap: true,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by'],
      deBai: 'Sola nhờ bạn: màn này có luật tháp (kiện nhỏ đặt trên kiện lớn). Tại (2, 4) có tháp [24, 12] và tại (4, 4) có tháp [30, 15]. Vì pick_up2() giữ nguyên thứ tự [dưới, trên] nên bạn có thể nhấc thẳng từng tháp 2 kiện đặt lên tàu mà không cần mượn bãi phụ!',
      veMaMau: 'Sau khi đặt tháp ở cột 2 lên tàu, hãy trượt rail(2) sang cột 4 và bốc tiếp tháp thứ hai.',
      san: SAN_DOI_1,
      batDau: { x: 2, y: 3, nac: 4, tam: 1 },
      chong: [C(2, 4, [24, 12]), C(4, 4, [30, 15])],
      tau: tauDon(18, 2),
      giao: [{ tau: 0, so: [12, 15, 24, 30] }],
      maMau: bai([
        'pick_up2()',
        'swing_by(4)',
        'set_down()',
        'rail(2)'
      ]),
      loiGiai: bai([
        'pick_up2()',
        'swing_by(4)',
        'set_down()',
        'rail(2)',
        'swing_by(4)',
        'pick_up2()',
        'swing_by(4)',
        'set_down()'
      ]),
      sao: { o: 14, nhip: 18 },
      loiGiaiKhac: {
        moTa: 'Quay về nấc 4 bằng swing_by(4) trước khi trượt rail(2)',
        baiLam: bai([
          'pick_up2()',
          'swing_by(4)',
          'set_down()',
          'swing_by(4)',
          'rail(2)',
          'pick_up2()',
          'swing_by(4)',
          'set_down()'
        ])
      },
      loiSai: [
        { moTa: 'Bốc từng kiện bằng pick_up() nên thứ tự bị đảo ngược làm kiện 24 đè lên kiện 12', baiLam: bai(['pick_up()', 'swing_by(4)', 'set_down()', 'swing_by(4)', 'pick_up()', 'swing_by(4)', 'set_down()']), phaiCoMa: ['thap-sai'] },
        { moTa: 'Mới giao tháp ở cột 2, chưa giao tháp ở cột 4', baiLam: bai(['pick_up2()', 'swing_by(4)', 'set_down()', 'rail(2)']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Nhấc từng kiện bằng pick_up() sẽ làm đảo thứ tự tháp, còn pick_up2() giữ nguyên [dưới, trên].', 'Luna: Sau rail(2), gọi swing_by(4), pick_up2(), swing_by(4), set_down() để giao tháp thứ hai.']
    }),

    manNhacDoi({
      so: 8, ten: 'Đọc mã chọn móc đơn hay đôi', hang: 'bien-the',
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by'],
      deBai: 'Sola nhờ bạn: dọc ba cột 2, 3, 4 ở hàng bãi y = 4, cột nào có kiện đỉnh mang chữ số hàng chục bằng 2 (read_code() // 10 == 2) thì cột đó có cặp 2 kiện, ngược lại chỉ có 1 kiện lẻ. Hãy lặp 3 lần qua 3 cột, dùng if để chọn pick_up2() hoặc pick_up() cho đúng.',
      veMaMau: 'Trong vòng lặp for i in range(3): hãy kiểm tra read_code() // 10 == 2 để gọi pick_up2() hay pick_up().',
      san: SAN_DOI_1,
      batDau: { x: 1, y: 3, nac: 4, tam: 1 },
      chong: [C(2, 4, [25, 21]), C(3, 4, [16]), C(4, 4, [29, 24])],
      tau: tauDon(33, 2),
      giao: [{ tau: 0, so: [16, 21, 24, 25, 29] }],
      maMau: bai([
        'for i in range(3):',
        '    rail(1)',
        '    if read_code() // 10 == 2:',
        '        pick_up2()',
        '    else:'
      ]),
      loiGiai: bai([
        'for i in range(3):',
        '    rail(1)',
        '    if read_code() // 10 == 2:',
        '        pick_up2()',
        '    else:',
        '        pick_up()',
        '    swing_by(4)',
        '    set_down()',
        '    swing_by(4)'
      ]),
      sao: { o: 15, nhip: 33 },
      loiGiaiKhac: {
        moTa: 'Kiểm tra read_code() // 10 == 1 trước để gọi pick_up()',
        baiLam: bai([
          'for i in range(3):',
          '    rail(1)',
          '    if read_code() // 10 == 1:',
          '        pick_up()',
          '    else:',
          '        pick_up2()',
          '    swing_by(4)',
          '    set_down()',
          '    swing_by(4)'
        ])
      },
      loiSai: [
        { moTa: 'Gọi pick_up2() ở mọi cột nên gặp cột 3 chỉ có 1 kiện bị lỗi móc thiếu', baiLam: bai(['for i in range(3):', '    rail(1)', '    pick_up2()', '    swing_by(4)', '    set_down()', '    swing_by(4)']), phaiCoMa: ['moc-thieu'] },
        { moTa: 'Gọi pick_up() ở mọi cột nên bỏ sót kiện đáy ở cột 2 và cột 4', baiLam: bai(['for i in range(3):', '    rail(1)', '    pick_up()', '    swing_by(4)', '    set_down()', '    swing_by(4)']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Nhánh else dành cho cột chỉ có 1 kiện nên gọi pick_up().', 'Luna: Sau khối if/else, gọi swing_by(4), set_down(), swing_by(4) để giao hàng lên tàu rồi quay về nấc 4.']
    }),

    manNhacDoi({
      so: 9, ten: 'Ghép tháp bốn tầng trên tàu', hang: 'bien-the',
      luatThap: true,
      hamCuaEmCan: [],
      deBai: 'Sola nhờ bạn: cần ghép tháp 4 tầng [40, 30, 20, 10] lên boong tàu tại (3, 2) đúng luật tháp. Cặp đáy [40, 30] đang ở (1, 2) và cặp đỉnh [20, 10] đang ở (5, 2). Bệ cẩu đứng ở (3, 3) hướng nấc 0. Hãy trượt sang (1, 2) dùng pick_up2() lấy cặp [40, 30] đặt lên (3, 2) trước, rồi mới sang (5, 2) lấy cặp [20, 10] đặt chồng lên trên.',
      veMaMau: 'Lấy cặp lớn [40, 30] ở (1, 2) đặt xuống (3, 2) trước, sau đó lấy cặp nhỏ [20, 10] ở (5, 2).',
      san: SAN_DOI_1,
      batDau: { x: 3, y: 3, nac: 0, tam: 1 },
      chong: [C(1, 2, [40, 30]), C(5, 2, [20, 10])],
      tau: tauDon(12, 2),
      giao: [{ tau: 0, so: [10, 20, 30, 40] }],
      maMau: bai([
        'rail(-2)',
        'pick_up2()',
        'rail(2)',
        'set_down()'
      ]),
      loiGiai: bai([
        'rail(-2)',
        'pick_up2()',
        'rail(2)',
        'set_down()',
        'rail(2)',
        'pick_up2()',
        'rail(-2)',
        'set_down()'
      ]),
      sao: { o: 8, nhip: 12 },
      loiGiaiKhac: {
        moTa: 'Tách rail(2) đầu tiên thành hai bước rail(1)',
        baiLam: bai([
          'rail(-2)',
          'pick_up2()',
          'rail(1)',
          'rail(1)',
          'set_down()',
          'rail(2)',
          'pick_up2()',
          'rail(-2)',
          'set_down()'
        ])
      },
      loiSai: [
        { moTa: 'Lấy cặp nhỏ [20, 10] ở (5, 2) đặt xuống trước nên khi đặt [40, 30] lên trên bị sai luật tháp', baiLam: bai(['rail(2)', 'pick_up2()', 'rail(-2)', 'set_down()', 'rail(-2)', 'pick_up2()', 'rail(2)', 'set_down()']), phaiCoMa: ['thap-sai'] },
        { moTa: 'Mới chuyển cặp [40, 30] về (3, 2), chưa lấy cặp [20, 10] ở (5, 2)', baiLam: bai(['rail(-2)', 'pick_up2()', 'rail(2)', 'set_down()']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Theo luật tháp, cặp số lớn [40, 30] phải nằm dưới đáy, cặp số nhỏ [20, 10] đặt lên trên.', 'Luna: Sau set_down() đầu tiên tại (3, 2), gọi tiếp rail(2), pick_up2(), rail(-2), set_down().']
    }),

    manNhacDoi({
      so: 10, ten: 'Trùm Móc đôi hai tầng', hang: 'trum', nhipTheo: 'tong',
      khung: { chinh: 12, moiHam: 10 },
      luatThap: true,
      huyHieu: { ma: 'nhac-doi', ten: 'Huy hiệu Móc đôi hai tầng' },
      hamCuaEmCan: [],
      deBai: 'Trùm chương 1: trên hai sân có luật tháp, tại cầu cảng giữa (3, 2) có chồng 4 kiện gồm 2 cặp tháp. Bệ cẩu đứng ở (3, 3) hướng nấc 0. Hãy lặp 2 lần: nếu read_code() // 10 == 1 thì dùng pick_up2() nhấc cặp tháp trượt rail(-1) giao sang Tàu 1 rồi rail(1) quay về; ngược lại thì trượt rail(1) giao sang Tàu 2 rồi rail(-1) quay về.',
      veMaMau: 'Hoàn thiện vòng lặp 2 lần dùng pick_up2() và rail để chia 2 cặp tháp sang hai tàu.',
      san: [SAN_DOI_2, SAN_DOI_2],
      batDau: [{ x: 3, y: 3, nac: 0, tam: 1 }, { x: 3, y: 3, nac: 0, tam: 1 }],
      chong: [
        [C(3, 2, [28, 22, 16, 11])],
        [C(3, 2, [19, 14, 27, 21])]
      ],
      tau: [tauDoi(8, 2), tauDoi(8, 2)],
      giao: [
        [{ tau: 0, so: [11, 16] }, { tau: 1, so: [22, 28] }],
        [{ tau: 0, so: [14, 19] }, { tau: 1, so: [21, 27] }]
      ],
      maMau: bai([
        'for i in range(2):',
        '    if read_code() // 10 == 1:',
        '        pick_up2()',
        '        rail(-1)',
        '        set_down()',
        '        rail(1)'
      ]),
      loiGiai: bai([
        'for i in range(2):',
        '    if read_code() // 10 == 1:',
        '        pick_up2()',
        '        rail(-1)',
        '        set_down()',
        '        rail(1)',
        '    else:',
        '        pick_up2()',
        '        rail(1)',
        '        set_down()',
        '        rail(-1)'
      ]),
      sao: { o: 11, nhip: 16 },
      loiGiaiKhac: {
        moTa: 'Dùng while read_code() != -1 thay cho for i in range(2)',
        baiLam: bai([
          'while read_code() != -1:',
          '    if read_code() // 10 == 1:',
          '        pick_up2()',
          '        rail(-1)',
          '        set_down()',
          '        rail(1)',
          '    else:',
          '        pick_up2()',
          '        rail(1)',
          '        set_down()',
          '        rail(-1)'
        ])
      },
      loiSai: [
        { moTa: 'Dùng pick_up() thay vì pick_up2() nên vừa không kịp giờ tàu chạy vừa sai luật tháp', baiLam: bai(['for i in range(2):', '    if read_code() // 10 == 1:', '        pick_up()', '        rail(-1)', '        set_down()', '        rail(1)', '    else:', '        pick_up()', '        rail(1)', '        set_down()', '        rail(-1)']), phaiCoMa: ['chua-giao-tau'] },
        { moTa: 'Giao nhầm cặp hàng chục bằng 2 sang Tàu 1', baiLam: bai(['for i in range(2):', '    pick_up2()', '    rail(-1)', '    set_down()', '    rail(1)']), phaiCoMa: ['giao-nham'] }
      ],
      goiY: ['Luna: Mỗi lần gọi pick_up2() sẽ nhấc trọn 1 cặp 2 kiện giữ đúng thứ tự tháp.', 'Luna: Trong nhánh else, gọi pick_up2(), rail(1), set_down(), rail(-1) để giao sang Tàu 2.']
    }),

    /* ========================================================================
       CHƯƠNG 2: che-nhac-doi (10 màn) — Chế lệnh: bốc nhanh
       ======================================================================== */
    manCheNhacDoi({
      so: 1, ten: 'Chế hàm carry2_by(d)', hang: 'lam-quen',
      taoHam: ['carry2_by'],
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by'],
      deBai: 'Sola nhờ bạn: mở Xưởng hàm chế carry2_by(d) gồm 3 lệnh: pick_up2(), swing_by(d), set_down() để nhấc đôi 2 kiện ở đầu cần, quay d nấc rồi hạ xuống. Áp dụng gọi carry2_by(4) để chuyển cặp [24, 12] từ (3, 4) lên boong tàu ở (3, 2).',
      veMaMau: 'Tạo hàm carry2_by(d) rồi gọi carry2_by(4) ở chương trình chính.',
      san: SAN_DOI_1,
      batDau: { x: 3, y: 3, nac: 4, tam: 1 },
      chong: [C(3, 4, [24, 12])],
      tau: tauDon(6, 2),
      giao: [{ tau: 0, so: [12, 24] }],
      maMau: bai(['carry2_by(4)']),
      loiGiai: bai(
        ['carry2_by(4)'],
        { hamCuaEmMoi: [hCarry2By()] }
      ),
      sao: { o: 10, nhip: 6 },
      loiGiaiKhac: {
        moTa: 'Gọi carry2_by(-4) để quay nửa vòng theo chiều ngược lại',
        baiLam: bai(['carry2_by(-4)']),
        hamCuaEmMoi: [hCarry2By()]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm carry2_by mà đã bấm Chạy', baiLam: bai(['carry2_by(4)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong carry2_by dùng nhầm pick_up() thay vì pick_up2()', baiLam: bai(['carry2_by(4)']), hamCuaEmMoi: [hCarry2By(['pick_up()', 'swing_by(d)', 'set_down()'])], phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Thân hàm carry2_by(d) giống hệt carry_by(d) nhưng thay pick_up() bằng pick_up2().', 'Luna: Ở chương trình chính chỉ cần gọi carry2_by(4).']
    }),

    manCheNhacDoi({
      so: 2, ten: 'Chế hàm carry2_n(n, d)', hang: 'lam-quen',
      taoHam: ['carry2_n'],
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry2_by'],
      deBai: 'Sola nhờ bạn: mở Xưởng hàm chế carry2_n(n, d) lặp n lần: mỗi lần gọi carry2_by(d) rồi swing_by(-d) để bốc n cặp container sang nấc cách d. Áp dụng gọi carry2_n(2, 4) để chuyển chồng 4 kiện ở (3, 4) lên tàu tại (3, 2).',
      veMaMau: 'Tạo hàm carry2_n(n, d) rồi gọi carry2_n(2, 4).',
      san: SAN_DOI_1,
      batDau: { x: 3, y: 3, nac: 4, tam: 1 },
      chong: [C(3, 4, [28, 22, 16, 12])],
      tau: tauDon(20, 2),
      giao: [{ tau: 0, so: [12, 16, 22, 28] }],
      maMau: bai(['carry2_n(2, 4)']),
      loiGiai: bai(
        ['carry2_n(2, 4)'],
        { hamCuaEmMoi: [hCarry2N()] }
      ),
      sao: { o: 15, nhip: 20 },
      loiGiaiKhac: {
        moTa: 'Thêm dòng chú thích trước khi gọi carry2_n(2, 4)',
        baiLam: bai(['# bốc 2 cặp kiện lên tàu', 'carry2_n(2, 4)']),
        hamCuaEmMoi: [hCarry2N()]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm carry2_n mà đã bấm Chạy', baiLam: bai(['carry2_n(2, 4)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Truyền n = 1 nên mới bốc được 1 cặp (2 kiện) lên tàu', baiLam: bai(['carry2_n(1, 4)']), hamCuaEmMoi: [hCarry2N()], phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Thân hàm carry2_n(n, d) gồm: for i in range(n):, carry2_by(d) và swing_by(-d).', 'Luna: Ở chương trình chính gọi carry2_n(2, 4).']
    }),

    manCheNhacDoi({
      so: 3, ten: 'Chế hàm fast_stack(n, d)', hang: 'lam-quen',
      taoHam: ['fast_stack'],
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'carry_n', 'carry2_by', 'carry2_n'],
      deBai: 'Sola nhờ bạn: với chồng hàng có n kiện bất kỳ (chẵn hoặc lẻ), ta có thể bốc nhanh bằng n // 2 chuyến móc đôi và n % 2 chuyến móc đơn! Hãy chế hàm fast_stack(n, d) gồm 2 lệnh: carry2_n(n // 2, d) và carry_n(n % 2, d). Áp dụng gọi fast_stack(3, 4) để chuyển chồng 3 kiện ở (3, 4) lên tàu.',
      veMaMau: 'Tạo hàm fast_stack(n, d) rồi gọi fast_stack(3, 4).',
      san: SAN_DOI_1,
      batDau: { x: 3, y: 3, nac: 4, tam: 1 },
      chong: [C(3, 4, [25, 18, 11])],
      tau: tauDon(20, 2),
      giao: [{ tau: 0, so: [11, 18, 25] }],
      maMau: bai(['fast_stack(3, 4)']),
      loiGiai: bai(
        ['fast_stack(3, 4)'],
        { hamCuaEmMoi: [hFastStack()] }
      ),
      sao: { o: 23, nhip: 20 },
      loiGiaiKhac: {
        moTa: 'Thêm dòng chú thích trước khi gọi fast_stack(3, 4)',
        baiLam: bai(['# 3 // 2 = 1 chuyến đôi, 3 % 2 = 1 chuyến đơn', 'fast_stack(3, 4)']),
        hamCuaEmMoi: [hFastStack()]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm fast_stack mà đã bấm Chạy', baiLam: bai(['fast_stack(3, 4)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên dòng carry_n(n % 2, d) nên còn sót kiện lẻ cuối cùng ở (3, 4)', baiLam: bai(['fast_stack(3, 4)']), hamCuaEmMoi: [hFastStack(['carry2_n(n // 2, d)'])], phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Phép chia nguyên n // 2 tính số cặp nhấc đôi, còn phép chia dư n % 2 tính kiện lẻ còn lại.', 'Luna: Thân hàm fast_stack(n, d) gồm carry2_n(n // 2, d) và carry_n(n % 2, d).']
    }),

    manCheNhacDoi({
      so: 4, ten: 'Chế hàm rail_carry2(dx)', hang: 'luyen-tap',
      taoHam: ['rail_carry2'],
      hamCuaEmCan: [],
      deBai: 'Sola nhờ bạn: mở Xưởng hàm chế rail_carry2(dx) gồm 4 lệnh: pick_up2(), rail(dx), set_down(), rail(-dx) để nhấc đôi 2 kiện tại chỗ, trượt dx ô trên đường ray hạ xuống rồi quay về. Áp dụng tại (3, 3) hướng nấc 0 gọi rail_carry2(-1) và rail_carry2(1) để chia chồng 4 kiện ở (3, 2) sang hai tàu.',
      veMaMau: 'Tạo hàm rail_carry2(dx) rồi gọi rail_carry2(-1) và rail_carry2(1).',
      san: SAN_DOI_2,
      batDau: { x: 3, y: 3, nac: 0, tam: 1 },
      chong: [C(3, 2, [29, 21, 17, 13])],
      tau: tauDoi(8, 2),
      giao: [{ tau: 0, so: [13, 17] }, { tau: 1, so: [21, 29] }],
      maMau: bai([
        'rail_carry2(-1)',
        'rail_carry2(1)'
      ]),
      loiGiai: bai(
        ['rail_carry2(-1)', 'rail_carry2(1)'],
        { hamCuaEmMoi: [hRailCarry2()] }
      ),
      sao: { o: 6, nhip: 8 },
      loiGiaiKhac: {
        moTa: 'Thêm chú thích trước khi gọi rail_carry2(-1) và rail_carry2(1)',
        baiLam: bai(['# chia 2 cặp kiện sang hai tàu', 'rail_carry2(-1)', 'rail_carry2(1)']),
        hamCuaEmMoi: [hRailCarry2()]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm rail_carry2 mà đã bấm Chạy', baiLam: bai(['rail_carry2(-1)', 'rail_carry2(1)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Gọi ngược rail_carry2(1) trước nên giao nhầm tàu', baiLam: bai(['rail_carry2(1)', 'rail_carry2(-1)']), hamCuaEmMoi: [hRailCarry2()], phaiCoMa: ['giao-nham'] }
      ],
      goiY: ['Luna: Thân hàm rail_carry2(dx) gồm 4 dòng: pick_up2(), rail(dx), set_down(), rail(-dx).', 'Luna: Ở chương trình chính gọi rail_carry2(-1) rồi rail_carry2(1).']
    }),

    manCheNhacDoi({
      so: 5, ten: 'Chế hàm ship_pair2()', hang: 'luyen-tap',
      taoHam: ['ship_pair2'],
      hamCuaEmCan: ['rail_carry2'],
      deBai: 'Sola nhờ bạn: mở Xưởng hàm chế ship_pair2() kiểm tra if read_code() // 10 == 1: thì gọi rail_carry2(-1) sang Tàu 1, ngược lại gọi rail_carry2(1) sang Tàu 2. Áp dụng gọi ship_pair2() 2 lần để phân loại chồng 4 kiện ở (3, 2).',
      veMaMau: 'Tạo hàm ship_pair2() rồi gọi 2 lần ở chương trình chính.',
      san: SAN_DOI_2,
      batDau: { x: 3, y: 3, nac: 0, tam: 1 },
      chong: [C(3, 2, [18, 12, 27, 23])],
      tau: tauDoi(8, 2),
      giao: [{ tau: 0, so: [12, 18] }, { tau: 1, so: [23, 27] }],
      maMau: bai([
        'ship_pair2()',
        'ship_pair2()'
      ]),
      loiGiai: bai(
        ['ship_pair2()', 'ship_pair2()'],
        { hamCuaEmMoi: [hShipPair2()] }
      ),
      sao: { o: 10, nhip: 8 },
      loiGiaiKhac: {
        moTa: 'Dùng vòng lặp for i in range(2) gọi ship_pair2()',
        baiLam: bai(['for i in range(2):', '    ship_pair2()']),
        hamCuaEmMoi: [hShipPair2()]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm ship_pair2 mà đã bấm Chạy', baiLam: bai(['ship_pair2()', 'ship_pair2()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Mới gọi ship_pair2() 1 lần nên còn cặp [18, 12] chưa giao', baiLam: bai(['ship_pair2()']), hamCuaEmMoi: [hShipPair2()], phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Thân hàm ship_pair2() dùng if read_code() // 10 == 1: gọi rail_carry2(-1), else: gọi rail_carry2(1).', 'Luna: Chương trình chính gọi ship_pair2() 2 lần.']
    }),

    manCheNhacDoi({
      so: 6, ten: 'Dời nhanh ra cầu cảng', hang: 'luyen-tap',
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry2_by', 'carry2_n', 'rail_carry2', 'ship_pair2'],
      deBai: 'Sola nhờ bạn: tại bãi sau (3, 4) có chồng 4 kiện gồm 2 cặp [16, 11, 28, 24]. Bệ cẩu đứng ở (3, 3) hướng nấc 4. Hãy gọi carry2_n(2, 4) để dời cả 4 kiện ra cầu cảng (3, 2), quay cần về nấc 0 bằng swing_by(4), rồi gọi ship_pair2() 2 lần để phân loại lên hai tàu.',
      veMaMau: 'Sau carry2_n(2, 4) và swing_by(4), hãy gọi ship_pair2() 2 lần.',
      san: SAN_DOI_2,
      batDau: { x: 3, y: 3, nac: 4, tam: 1 },
      chong: [C(3, 4, [16, 11, 28, 24])],
      tau: tauDoi(32, 2),
      giao: [{ tau: 0, so: [11, 16] }, { tau: 1, so: [24, 28] }],
      maMau: bai([
        'carry2_n(2, 4)',
        'swing_by(4)'
      ]),
      loiGiai: bai([
        'carry2_n(2, 4)',
        'swing_by(4)',
        'ship_pair2()',
        'ship_pair2()'
      ]),
      sao: { o: 26, nhip: 32 },
      loiGiaiKhac: {
        moTa: 'Dùng swing_by(-4) khi quay về nấc 0',
        baiLam: bai([
          'carry2_n(2, 4)',
          'swing_by(-4)',
          'ship_pair2()',
          'ship_pair2()'
        ])
      },
      loiSai: [
        { moTa: 'Mới đưa 4 kiện ra (3, 2), chưa gọi ship_pair2() để giao lên tàu', baiLam: bai(['carry2_n(2, 4)', 'swing_by(4)']), phaiCoMa: ['chua-giao-tau'] },
        { moTa: 'Quên gọi swing_by(4) nên gọi ship_pair2() ở ô trống (3, 4) bị lỗi móc hụt', baiLam: bai(['carry2_n(2, 4)', 'ship_pair2()', 'ship_pair2()']), phaiCoMa: ['moc-hut'] }
      ],
      goiY: ['Luna: Sau carry2_n(2, 4), cặp [28, 24] nằm dưới và cặp [16, 11] nằm trên tại (3, 2).', 'Luna: Quay về nấc 0 bằng swing_by(4) rồi gọi ship_pair2() hai lần.']
    }),

    manCheNhacDoi({
      so: 7, ten: 'Sửa hàm split_stack2(n)', hang: 'bien-the',
      chinhCoDinh: true,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'carry_n', 'carry2_by', 'carry2_n'],
      deBai: 'Sola nhờ bạn: hàm split_stack2(n) của màn cần chuyển chồng n kiện từ (3, 4) lên tàu ở (3, 2) bằng n // 2 chuyến nhấc đôi và n % 2 chuyến nhấc đơn. Nhưng hàm đang viết nhầm thành carry2_n(n % 2, 4) và carry_n(n // 2, 4) nên khi n = 4 chỉ chuyển được 2 kiện. Hãy sửa lại hàm split_stack2(n).',
      veMaMau: 'Chương trình chính đã khóa. Hãy đổi % 2 và // 2 cho đúng trong hàm split_stack2(n).',
      san: SAN_DOI_1,
      batDau: { x: 3, y: 3, nac: 4, tam: 1 },
      chong: [C(3, 4, [29, 25, 19, 15])],
      tau: tauDon(20, 2),
      giao: [{ tau: 0, so: [15, 19, 25, 29] }],
      maMau: bai(
        ['split_stack2(4)'],
        { hamCuaMan: [hSplitStack2(T_SPLIT_STACK2_SAI)] }
      ),
      loiGiai: bai(
        ['split_stack2(4)'],
        { hamCuaMan: [hSplitStack2(T_SPLIT_STACK2_DUNG)] }
      ),
      sao: { o: 17, nhip: 20 },
      loiGiaiKhac: {
        moTa: 'Bốc kiện lẻ trước bằng carry_n(n % 2, 4) rồi mới bốc cặp bằng carry2_n(n // 2, 4)',
        baiLam: bai(
          ['split_stack2(4)'],
          {
            hamCuaMan: [H('split_stack2', ['n'], [
              'carry_n(n % 2, 4)',
              'carry2_n(n // 2, 4)'
            ])]
          }
        )
      },
      loiSai: [
        { moTa: 'Để nguyên hàm mẫu nên chỉ chuyển 2 kiện bằng carry_n(2, 4)', baiLam: bai(['split_stack2(4)'], { hamCuaMan: [hSplitStack2(T_SPLIT_STACK2_SAI)] }), phaiCoMa: ['chua-giao-tau'] },
        { moTa: 'Chỉ gọi carry2_by(4) 1 lần nên mới giao được 2 kiện lên tàu', baiLam: bai(['split_stack2(4)'], { hamCuaMan: [hSplitStack2(['carry2_by(4)'])] }), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Với n = 4, số cặp nhấc đôi là n // 2 = 2 và số kiện lẻ nhấc đơn là n % 2 = 0.', 'Luna: Đổi dòng 1 thành carry2_n(n // 2, 4) và dòng 2 thành carry_n(n % 2, 4).']
    }),

    manCheNhacDoi({
      so: 8, ten: 'Ba cột tháp đôi dọc ray', hang: 'bien-the',
      luatThap: true,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry2_by'],
      deBai: 'Sola nhờ bạn: tại ba cột 2, 3, 4 của hàng bãi y = 4 đều có một tháp 2 kiện cần đưa lên tàu theo đúng luật tháp. Bệ cẩu bắt đầu ở (1, 3) hướng nấc 4. Hãy lặp 3 lần: mỗi lần gọi rail(1), carry2_by(4) rồi swing_by(4).',
      veMaMau: 'Trong vòng lặp for i in range(3): hãy kết hợp rail(1), carry2_by(4) và swing_by(4).',
      san: SAN_DOI_1,
      batDau: { x: 1, y: 3, nac: 4, tam: 1 },
      chong: [C(2, 4, [24, 12]), C(3, 4, [28, 14]), C(4, 4, [32, 16])],
      tau: tauDon(33, 2),
      giao: [{ tau: 0, so: [12, 14, 16, 24, 28, 32] }],
      maMau: bai([
        'for i in range(3):',
        '    rail(1)',
        '    carry2_by(4)'
      ]),
      loiGiai: bai([
        'for i in range(3):',
        '    rail(1)',
        '    carry2_by(4)',
        '    swing_by(4)'
      ]),
      sao: { o: 13, nhip: 33 },
      loiGiaiKhac: {
        moTa: 'Dùng swing_by(-4) để quay lại nấc 4 cuối mỗi vòng lặp',
        baiLam: bai([
          'for i in range(3):',
          '    rail(1)',
          '    carry2_by(4)',
          '    swing_by(-4)'
        ])
      },
      loiSai: [
        { moTa: 'Quên gọi swing_by(4) cuối vòng lặp nên lần thứ hai nhấc hụt trên boong tàu', baiLam: bai(['for i in range(3):', '    rail(1)', '    carry2_by(4)']), phaiCoMa: ['moc-hut'] },
        { moTa: 'Chỉ lặp 2 lần nên bỏ sót tháp ở cột 4', baiLam: bai(['for i in range(2):', '    rail(1)', '    carry2_by(4)', '    swing_by(4)']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Hàm carry2_by(4) đã nhấc đôi cả tháp 2 kiện từ nấc 4 sang boong tàu ở nấc 0.', 'Luna: Thêm swing_by(4) vào cuối vòng lặp để quay về nấc 4 trước khi tiến sang cột kế tiếp.']
    }),

    manCheNhacDoi({
      so: 9, ten: 'Hai bến phân loại tháp đôi', hang: 'bien-the', nhipTheo: 'tong',
      luatThap: true,
      hamCuaEmCan: ['rail_carry2', 'ship_pair2'],
      deBai: 'Sola nhờ bạn: trên hai sân có luật tháp, tại cầu cảng giữa (3, 2) có chồng 4 kiện gồm 2 cặp tháp. Bệ cẩu đứng ở (3, 3) hướng nấc 0. Hãy dùng vòng lặp for i in range(2): gọi ship_pair2() để phân loại cả 2 cặp tháp sang hai tàu.',
      veMaMau: 'Gọi ship_pair2() đủ 2 lần để giao 2 cặp tháp sang Tàu 1 và Tàu 2.',
      san: [SAN_DOI_2, SAN_DOI_2],
      batDau: [{ x: 3, y: 3, nac: 0, tam: 1 }, { x: 3, y: 3, nac: 0, tam: 1 }],
      chong: [
        [C(3, 2, [26, 21, 18, 12])],
        [C(3, 2, [17, 13, 29, 24])]
      ],
      tau: [tauDoi(8, 2), tauDoi(8, 2)],
      giao: [
        [{ tau: 0, so: [12, 18] }, { tau: 1, so: [21, 26] }],
        [{ tau: 0, so: [13, 17] }, { tau: 1, so: [24, 29] }]
      ],
      maMau: bai([
        'ship_pair2()'
      ]),
      loiGiai: bai([
        'for i in range(2):',
        '    ship_pair2()'
      ]),
      sao: { o: 10, nhip: 16 },
      loiGiaiKhac: {
        moTa: 'Gọi ship_pair2() 2 dòng liên tiếp',
        baiLam: bai([
          'ship_pair2()',
          'ship_pair2()'
        ])
      },
      loiSai: [
        { moTa: 'Mới gọi ship_pair2() 1 lần nên còn 1 cặp tháp chưa giao', baiLam: bai(['ship_pair2()']), phaiCoMa: ['chua-giao-tau'] },
        { moTa: 'Đưa cả 2 cặp sang Tàu 1 bên trái nên bị lỗi giao nhầm', baiLam: bai(['rail_carry2(-1)', 'rail_carry2(-1)']), phaiCoMa: ['giao-nham'] }
      ],
      goiY: ['Luna: Hàm ship_pair2() đã tự kiểm tra chữ số hàng chục và gọi rail_carry2(-1) hoặc rail_carry2(1).', 'Luna: Lặp 2 lần ship_pair2() là giao xong cả 4 kiện trên hai sân.']
    }),

    manCheNhacDoi({
      so: 10, ten: 'Trùm Chế lệnh: bốc nhanh', hang: 'trum', nhipTheo: 'tong',
      huyHieu: { ma: 'che-nhac-doi', ten: 'Huy hiệu Chế lệnh: bốc nhanh' },
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry2_by', 'carry2_n', 'rail_carry2', 'ship_pair2'],
      deBai: 'Trùm chương 2: trên hai sân, bệ cẩu bắt đầu ở (1, 3) hướng nấc 4. Tại (1, 4) có 1 cặp kiện và tại (3, 4) có 1 cặp kiện. Hãy gọi rail_carry2(2) để dồn cặp ở (1, 4) sang (3, 4), trượt rail(2) sang cột 3, gọi carry2_n(2, 4) đưa cả 4 kiện ra cầu cảng (3, 2), rồi quay về nấc 0 gọi ship_pair2() 2 lần để giao lên hai tàu.',
      veMaMau: 'Kết hợp rail_carry2(2), rail(2), carry2_n(2, 4), swing_by(4) và 2 lần ship_pair2().',
      san: [SAN_DOI_2, SAN_DOI_2],
      batDau: [{ x: 1, y: 3, nac: 4, tam: 1 }, { x: 1, y: 3, nac: 4, tam: 1 }],
      chong: [
        [C(1, 4, [17, 12]), C(3, 4, [28, 23])],
        [C(1, 4, [26, 21]), C(3, 4, [19, 14])]
      ],
      tau: [tauDoi(40, 2), tauDoi(40, 2)],
      giao: [
        [{ tau: 0, so: [12, 17] }, { tau: 1, so: [23, 28] }],
        [{ tau: 0, so: [14, 19] }, { tau: 1, so: [21, 26] }]
      ],
      maMau: bai([
        'rail_carry2(2)',
        'rail(2)',
        'carry2_n(2, 4)'
      ]),
      loiGiai: bai([
        'rail_carry2(2)',
        'rail(2)',
        'carry2_n(2, 4)',
        'swing_by(4)',
        'ship_pair2()',
        'ship_pair2()'
      ]),
      sao: { o: 28, nhip: 80 },
      loiGiaiKhac: {
        moTa: 'Dùng swing_by(-4) khi quay về nấc 0',
        baiLam: bai([
          'rail_carry2(2)',
          'rail(2)',
          'carry2_n(2, 4)',
          'swing_by(-4)',
          'ship_pair2()',
          'ship_pair2()'
        ])
      },
      loiSai: [
        { moTa: 'Mới đưa 4 kiện ra (3, 2), quên quay sang nấc 0 gọi ship_pair2()', baiLam: bai(['rail_carry2(2)', 'rail(2)', 'carry2_n(2, 4)']), phaiCoMa: ['chua-giao-tau'] },
        { moTa: 'Quên gọi rail(2) nên gọi carry2_n(2, 4) tại cột 1 đã trống hàng', baiLam: bai(['rail_carry2(2)', 'carry2_n(2, 4)']), phaiCoMa: ['moc-hut'] }
      ],
      goiY: ['Luna: Sau rail_carry2(2), cả 4 kiện nằm ở (3, 4) còn bệ cẩu vẫn ở cột 1; gọi rail(2) rồi carry2_n(2, 4) để đưa cả 4 kiện ra (3, 2).', 'Luna: Tiếp theo gọi swing_by(4) về nấc 0 rồi gọi ship_pair2() 2 lần.']
    })
  ];

  ManHoc.manNhacDoi = DS;
  if (laNode) module.exports = DS;
})();
