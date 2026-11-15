/* ============================================================================
   man-ben-tau.js — "Robot Chấn Hưng": GÓI 4 MÙA 4 "CẢNG SÔNG" (BẾN TÀU & LUẬT THÁP)
   Gồm 20 màn mới trên Cần cẩu R1 gắn móc cẩu + đầu đọc mã (quet-ma):
   - ben-tau.1..10     (10 màn chương ben-tau "Tàu cập bến")
   - che-ben-tau.1..10 (10 màn chương che-ben-tau "Chế lệnh: hàng tàu nối đuôi": hàng đợi, cfg.hangTau; 15/11 làm lại)
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var HAM_BEN = ['swing_left', 'swing_right', 'extend', 'retract', 'pick_up', 'set_down', 'read_code', 'wait'];
  var ROBOT_BEN = { than: 'cau', tay: 'moc-cau', camBien: [{ ma: 'quet-ma', o: 'tren' }] };
  var CAU_TRUC = ['for', 'if', 'while', 'list'];

  var SAN_BEN_1 = [
    '~~~~~~~',
    '~~~~~~~',
    '~~TTT~~',
    '.DD.DD.',
    '..DDD..',
    '.D.D.D.',
    '.......'
  ];

  // Hai bến hai bên bệ (14/11, cẩu 4 hướng): Tàu 1 ở nấc 3 (2, 3), Tàu 2 ở nấc 1 (4, 3), cầu cảng nấc 0 (3, 2)
  var SAN_BEN_3 = [
    '~~~~~~~',
    '~~~~~~~',
    '~~TDT~~',
    '.DT.TD.',
    '..DDD..',
    '.D.D.D.',
    '.......'
  ];
  // Hai tàu phía bắc ở hai tầm: Tàu 1 nhận ở (3, 2) tầm 1, Tàu 2 nhận ở (3, 1) tầm 2
  var SAN_BEN_4 = [
    '~~~~~~~',
    '~~~TT~~',
    '~~TT~~~',
    '.DD.DD.',
    '..DDD..',
    '.D.D.D.',
    '.......'
  ];
  function tauHaiBen(co, vang) {
    return [{ o: [{ x: 2, y: 3 }, { x: 2, y: 2 }], co: co, vang: vang }, { o: [{ x: 4, y: 3 }, { x: 4, y: 2 }], co: co, vang: vang }];
  }
  function tauHaiTam(co, vang) {
    return [{ o: [{ x: 3, y: 2 }, { x: 2, y: 2 }], co: co, vang: vang }, { o: [{ x: 3, y: 1 }, { x: 4, y: 1 }], co: co, vang: vang }];
  }
  var O_TAU_1 = [{ x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 }];

  function tauDon(co, vang, pha) {
    var t = { o: O_TAU_1, co: co, vang: vang };
    if (pha) t.pha = pha;
    return [t];
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
  function BM(chong) {
    return {
      x: 3, y: 3,
      chong: chong.map(function (q) { return { x: q.x, y: q.y, so: q.so.slice() }; })
    };
  }

  // Hàm chế ở chương che-ben-tau (hàng tàu nối đuôi). move_tower2 giữ nguyên tên, chữ ký, thân: gói 7, 9, 10 còn gọi.
  var T_MOVE_TOWER2 = [
    'carry_by(d1)',
    'swing_by(-d1)',
    'carry_by(d2)',
    't = d1 - d2',
    'swing_by(t)',
    't = d2 - d1',
    'carry_by(t)'
  ];
  // serve_ship(): cần đang chĩa boong (nấc 0). Đọc số tàu đầu hàng cần, quay phải tìm kiện có số đó (đếm d nấc), mang về boong.
  var T_SERVE_SHIP = [
    'c = read_code()',
    'd = 1',
    'swing_by(1)',
    'k = read_code()',
    'while k != c:',
    '    swing_by(1)',
    '    d = d + 1',
    '    k = read_code()',
    't = 0 - d',
    'carry_by(t)'
  ];
  // Màn 7 (trình diễn): kiện ở nấc 1 và nấc 3
  var T_DOC_BANG_7 = [
    'c = read_code()',
    'swing_by(1)',
    'k = read_code()',
    'if k == c:',
    '    carry_by(-1)',
    '    swing_by(-1)',
    '    carry_by(1)',
    'else:',
    '    swing_by(2)',
    '    carry_by(1)',
    '    swing_by(1)',
    '    carry_by(-1)'
  ];
  // Màn 8 (ép): kiện ở nấc 1 và nấc 2
  var T_DOC_BANG_8 = [
    'c = read_code()',
    'swing_by(1)',
    'k = read_code()',
    'if k == c:',
    '    carry_by(-1)',
    '    swing_by(2)',
    '    carry_by(2)',
    'else:',
    '    swing_by(1)',
    '    carry_by(2)',
    '    swing_by(1)',
    '    carry_by(-1)'
  ];
  function hMoveTower2(than) { return H('move_tower2', ['d1', 'd2'], than || T_MOVE_TOWER2); }
  function hServeShip(than) { return H('serve_ship', [], than || T_SERVE_SHIP); }

  // Bến hàng tàu nối đuôi: bệ (3, 3); boong (3, 2) ở nấc 0; bãi nấc 1 (4, 3), nấc 2 (3, 4), nấc 3 (2, 3); tàu chờ nối đuôi bên phải bến
  var SAN_HANG = [
    '~~~~~~~',
    '~~~~~~~',
    '~~~T~~~',
    '.DD.DD.',
    '...D...',
    '...D...',
    '.......'
  ];
  function hangTau(can) {
    return { o: [{ x: 3, y: 2 }], can: can.slice(), cho: [{ x: 4, y: 2 }, { x: 5, y: 2 }, { x: 6, y: 2 }] };
  }

  function manBenTau(cfg) {
    return ManHoc.chuanHoa(Object.assign({
      chuong: 'ben-tau',
      loaiRobot: 'cau',
      robot: ROBOT_BEN,
      vo: 'cang',
      hamGoc: HAM_BEN,
      cauTruc: CAU_TRUC,
      khung: { chinh: 10, moiHam: 10 },
      moXuong: true,
      mucTieu: 'giao-tau',
      hamCuaEmCan: [],
      taoHam: []
    }, cfg));
  }

  function manCheBenTau(cfg) {
    return ManHoc.chuanHoa(Object.assign({
      chuong: 'che-ben-tau',
      loaiRobot: 'cau',
      robot: ROBOT_BEN,
      vo: 'cang',
      hamGoc: HAM_BEN,
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
       CHƯƠNG 1: ben-tau (10 màn) — Tàu cập bến
       ======================================================================== */
    manBenTau({
      so: 1, ten: 'Chuyến tàu đầu tiên', hang: 'lam-quen',
      chiChay: true, chinhCoDinh: true,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by'],
      deBai: 'Sola làm mẫu: tàu hàng đang đỗ ở bến phía bắc (ô boong tàu T ngay trên bệ, ở nấc 0). Bấm Chạy để xem cần cẩu nhấc kiện hàng 18 ở nấc 1, quay sang boong tàu ở nấc 0 rồi hạ xuống đúng lúc tàu rời bến.',
      veMaMau: 'Chương trình mẫu đã khóa. Bấm Chạy để quan sát tàu rời bến mang theo kiện 18.',
      san: SAN_BEN_1,
      batDau: { x: 3, y: 3, nac: 1, tam: 1 },
      chong: [C(4, 3, [18])],
      tau: tauDon(3, 2),
      giao: [{ tau: 0, so: [18] }],
      maMau: bai(['carry_by(-1)']),
      loiGiai: bai(['carry_by(-1)']),
      sao: { o: 11, nhip: 3 },
      loiSai: [],
      goiY: ['Luna: Bấm nút Chạy để xem tàu nhận kiện 18 và rời bến.', 'Luna: Kiện hàng chỉ được tính là đã giao khi tàu rời bến mang theo kiện đó.']
    }),

    manBenTau({
      so: 2, ten: 'Giữ nhịp chờ tàu đi', hang: 'lam-quen',
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by'],
      deBai: 'Sola nhờ bạn: chuyển kiện hàng 24 ở nấc 1 (4, 3) lên boong tàu ở nấc 0 (3, 2) bằng carry_by(-1), sau đó đứng chờ thêm 2 nhịp bằng wait() để tàu rời bến.',
      veMaMau: 'Thêm 1 lệnh wait() nữa ở cuối để chờ đủ 5 nhịp cho tàu rời bến.',
      san: SAN_BEN_1,
      batDau: { x: 3, y: 3, nac: 1, tam: 1 },
      chong: [C(4, 3, [24])],
      tau: tauDon(5, 2),
      giao: [{ tau: 0, so: [24] }],
      maMau: bai([
        'carry_by(-1)',
        'wait()'
      ]),
      loiGiai: bai([
        'carry_by(-1)',
        'wait()',
        'wait()'
      ]),
      sao: { o: 13, nhip: 5 },
      loiGiaiKhac: {
        moTa: 'Dùng lệnh cơ bản pick_up, swing_left, set_down và 2 lần wait',
        baiLam: bai([
          'pick_up()',
          'swing_left()',
          'set_down()',
          'wait()',
          'wait()'
        ])
      },
      loiSai: [
        { moTa: 'Mới chờ 1 nhịp nên tàu chưa rời bến khi chương trình kết thúc', baiLam: bai(['carry_by(-1)', 'wait()']), phaiCoMa: ['chua-giao-tau'] },
        { moTa: 'Quay nhầm sang nấc 2 thay vì boong tàu ở nấc 0', baiLam: bai(['carry_by(1)', 'wait()', 'wait()']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: carry_by(-1) tốn 3 nhịp, mà tàu đỗ 5 nhịp mới đi.', 'Luna: Thêm 2 lệnh wait() sau carry_by(-1) để tàu kịp rời bến.']
    }),

    manBenTau({
      so: 3, ten: 'Đón tàu cập bến', hang: 'lam-quen',
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by'],
      deBai: 'Sola nhờ bạn: tàu đang ở ngoài khơi và chỉ cập bến từ cuối nhịp 3. Hãy chờ 1 nhịp bằng wait() rồi mới gọi carry_by(-1) chuyển kiện 31 lên boong tàu, sau đó chờ thêm 2 nhịp cho tàu rời bến.',
      veMaMau: 'Đặt 1 lệnh wait() trước carry_by(-1) để không hạ hàng lúc tàu vắng.',
      san: SAN_BEN_1,
      batDau: { x: 3, y: 3, nac: 1, tam: 1 },
      chong: [C(4, 3, [31])],
      tau: tauDon(3, 3, 3),
      giao: [{ tau: 0, so: [31] }],
      maMau: bai([
        'carry_by(-1)',
        'wait()',
        'wait()'
      ]),
      loiGiai: bai([
        'wait()',
        'carry_by(-1)',
        'wait()',
        'wait()'
      ]),
      sao: { o: 14, nhip: 6 },
      loiGiaiKhac: {
        moTa: 'Nhấc và quay sang nấc 0 trước, chờ tàu cập bến rồi mới hạ xuống',
        baiLam: bai([
          'pick_up()',
          'swing_left()',
          'wait()',
          'set_down()',
          'wait()',
          'wait()'
        ])
      },
      loiSai: [
        { moTa: 'Gọi carry_by(-1) ngay nên set_down() ở nhịp 3 gặp lúc tàu chưa cập bến', baiLam: bai(['carry_by(-1)', 'wait()', 'wait()']), phaiCoMa: ['ha-bi-chan'] },
        { moTa: 'Thiếu 1 lệnh wait() ở cuối nên tàu chưa rời bến', baiLam: bai(['wait()', 'carry_by(-1)', 'wait()']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Nếu gọi carry_by(-1) ngay, nhịp 3 sẽ hạ hàng xuống nước vì cuối nhịp 3 tàu mới cập bến.', 'Luna: Gọi wait(), tiếp theo carry_by(-1), rồi 2 lệnh wait() ở cuối.']
    }),

    manBenTau({
      so: 4, ten: 'Bốc hai kiện kịp chuyến', hang: 'luyen-tap',
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'carry_n', 'clear_stack'],
      deBai: 'Sola nhờ bạn: chuyển cả chồng 2 kiện hàng [14, 28] ở nấc 1 (4, 3) lên boong tàu ở nấc 0 (3, 2) trước khi tàu rời bến ở cuối nhịp 8.',
      veMaMau: 'Dùng clear_stack(-1) để chuyển hết chồng hàng sang nấc 0.',
      san: SAN_BEN_1,
      batDau: { x: 3, y: 3, nac: 1, tam: 1 },
      chong: [C(4, 3, [14, 28])],
      tau: tauDon(8, 2),
      giao: [{ tau: 0, so: [14, 28] }],
      maMau: bai([
        'carry_by(-1)'
      ]),
      loiGiai: bai(['clear_stack(-1)']),
      sao: { o: 18, nhip: 8 },
      loiGiaiKhac: {
        moTa: 'Dùng hàm carry_n(2, -1) để chuyển đúng 2 kiện',
        baiLam: bai(['carry_n(2, -1)'])
      },
      loiSai: [
        { moTa: 'Mới chuyển 1 kiện lên tàu', baiLam: bai(['carry_by(-1)']), phaiCoMa: ['chua-giao-tau'] },
        { moTa: 'Chuyển nhầm sang bãi nấc 2 thay vì boong tàu ở nấc 0', baiLam: bai(['clear_stack(1)']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Gọi clear_stack(-1) sẽ tự động nhấc từng kiện ở nấc 1 đưa sang boong tàu ở nấc 0.', 'Luna: Đúng cuối nhịp 8 tàu sẽ rời bến mang theo cả 2 kiện 14 và 28.']
    }),

    manBenTau({
      so: 5, ten: 'Chọn đúng kiện cho tàu', hang: 'luyen-tap',
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by'],
      deBai: 'Sola nhờ bạn: chồng hàng ở nấc 1 (4, 3) có kiện 25 nằm đè lên kiện 16, nhưng tàu chỉ nhận kiện 16. Hãy dời kiện 25 sang bãi tạm nấc 2 (3, 4), quay lại nấc 1 rồi đưa kiện 16 lên tàu ở nấc 0 (3, 2).',
      veMaMau: 'Sau khi cất kiện 25 sang nấc 2 và quay về nấc 1, hãy đưa kiện 16 lên tàu.',
      san: SAN_BEN_1,
      batDau: { x: 3, y: 3, nac: 1, tam: 1 },
      chong: [C(4, 3, [16, 25])],
      tau: tauDon(7, 2),
      giao: [{ tau: 0, so: [16] }],
      maMau: bai([
        'carry_by(1)',
        'swing_by(-1)'
      ]),
      loiGiai: bai([
        'carry_by(1)',
        'swing_by(-1)',
        'carry_by(-1)'
      ]),
      sao: { o: 15, nhip: 7 },
      loiGiaiKhac: {
        moTa: 'Dùng lệnh cơ bản cho kiện đầu tiên rồi gọi carry_by(-1)',
        baiLam: bai([
          'pick_up()',
          'swing_right()',
          'set_down()',
          'swing_left()',
          'carry_by(-1)'
        ])
      },
      loiSai: [
        { moTa: 'Đưa kiện 25 lên tàu nên khi tàu rời bến bị lỗi giao nhầm', baiLam: bai(['carry_by(-1)', 'wait()', 'wait()', 'wait()', 'wait()']), phaiCoMa: ['giao-nham'] },
        { moTa: 'Cất kiện 25 xong nhưng quên đưa kiện 16 lên tàu', baiLam: bai(['carry_by(1)', 'swing_by(-1)']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Nếu đặt kiện 25 lên tàu, khi tàu rời bến sẽ báo lỗi giao nhầm ngay.', 'Luna: Sau carry_by(1) và swing_by(-1), gọi tiếp carry_by(-1) để đưa kiện 16 lên tàu.']
    }),

    manBenTau({
      so: 6, ten: 'Hai bến hai tàu', hang: 'luyen-tap',
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by'],
      deBai: 'Sola nhờ bạn: cầu cảng nấc 0 (3, 2) nằm giữa Tàu 1 bên trái ở nấc 3 (2, 3) và Tàu 2 bên phải ở nấc 1 (4, 3). Hãy giao kiện 15 trên đỉnh cho Tàu 1 và kiện 24 bên dưới cho Tàu 2.',
      veMaMau: 'Sau khi giao kiện 15 cho Tàu 1 và quay về nấc 0, hãy giao kiện 24 cho Tàu 2.',
      san: SAN_BEN_3,
      batDau: { x: 3, y: 3, nac: 0, tam: 1 },
      chong: [C(3, 2, [24, 15])],
      tau: tauHaiBen(7, 2),
      giao: [{ tau: 0, so: [15] }, { tau: 1, so: [24] }],
      maMau: bai([
        'carry_by(-1)',
        'swing_by(1)'
      ]),
      loiGiai: bai([
        'carry_by(-1)',
        'swing_by(1)',
        'carry_by(1)'
      ]),
      sao: { o: 15, nhip: 7 },
      loiGiaiKhac: {
        moTa: 'Dùng lệnh cơ bản cho kiện 15 rồi gọi carry_by(1) cho kiện 24',
        baiLam: bai([
          'pick_up()',
          'swing_left()',
          'set_down()',
          'swing_right()',
          'carry_by(1)'
        ])
      },
      loiSai: [
        { moTa: 'Giao ngược kiện 15 sang Tàu 2 và kiện 24 sang Tàu 1', baiLam: bai(['carry_by(1)', 'swing_by(-1)', 'carry_by(-1)']), phaiCoMa: ['giao-nham'] },
        { moTa: 'Mới giao kiện 15 cho Tàu 1, chưa giao kiện 24 cho Tàu 2', baiLam: bai(['carry_by(-1)', 'swing_by(1)']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Từ nấc 0, Tàu 1 ở nấc 3 (lệch -1) và Tàu 2 ở nấc 1 (lệch +1).', 'Luna: Gọi carry_by(-1), swing_by(1), rồi carry_by(1).']
    }),

    manBenTau({
      so: 7, ten: 'Phân luồng hai tàu theo mã', hang: 'luyen-tap', nhipTheo: 'tong',
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by'],
      deBai: 'Sola nhờ bạn: đọc mã từng kiện trong chồng 3 kiện ở cầu cảng nấc 0 (3, 2) trên hai sân. Đọc c = read_code(), tính t = c // 10: nếu t == 1 thì giao cho Tàu 1 ở nấc 3 rồi quay về nấc 0, ngược lại giao cho Tàu 2 ở nấc 1 rồi quay về nấc 0.',
      veMaMau: 'Hoàn thiện nhánh else để giao các kiện 2x cho Tàu 2 ở nấc 1.',
      san: [SAN_BEN_3, SAN_BEN_3],
      batDau: [{ x: 3, y: 3, nac: 0, tam: 1 }, { x: 3, y: 3, nac: 0, tam: 1 }],
      chong: [
        [C(3, 2, [26, 14, 21])],
        [C(3, 2, [19, 28, 12])]
      ],
      tau: [tauHaiBen(11, 2), tauHaiBen(11, 2)],
      giao: [
        [{ tau: 0, so: [14] }, { tau: 1, so: [21, 26] }],
        [{ tau: 0, so: [12, 19] }, { tau: 1, so: [28] }]
      ],
      maMau: bai([
        'c = read_code()',
        'while c != -1:',
        '    t = c // 10',
        '    if t == 1:',
        '        carry_by(-1)',
        '        swing_by(1)',
        '    c = read_code()'
      ]),
      loiGiai: bai([
        'c = read_code()',
        'while c != -1:',
        '    t = c // 10',
        '    if t == 1:',
        '        carry_by(-1)',
        '        swing_by(1)',
        '    else:',
        '        carry_by(1)',
        '        swing_by(-1)',
        '    c = read_code()'
      ]),
      sao: { o: 22, nhip: 22 },
      loiGiaiKhac: {
        moTa: 'Dùng vòng for 3 lần thay cho while c != -1',
        baiLam: bai([
          'for i in range(3):',
          '    c = read_code()',
          '    t = c // 10',
          '    if t == 1:',
          '        carry_by(-1)',
          '        swing_by(1)',
          '    else:',
          '        carry_by(1)',
          '        swing_by(-1)'
        ])
      },
      loiSai: [
        { moTa: 'Đưa mọi kiện sang Tàu 1 nên bị giao nhầm kiện 2x', baiLam: bai(['c = read_code()', 'while c != -1:', '    carry_by(-1)', '    swing_by(1)', '    c = read_code()']), phaiCoMa: ['giao-nham'] },
        { moTa: 'Không dùng vòng lặp nên chỉ giao được 1 kiện đầu tiên', baiLam: bai(['c = read_code()', 't = c // 10', 'if t == 1:', '    carry_by(-1)', 'else:', '    carry_by(1)']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Trong nhánh if t == 1: (t = c // 10), gọi carry_by(-1) rồi swing_by(1).', 'Luna: Trong nhánh else:, gọi carry_by(1) rồi swing_by(-1).']
    }),

    manBenTau({
      so: 8, ten: 'Luật tháp: số nhỏ trên số lớn', hang: 'bien-the',
      mucTieu: 'bong-mo',
      luatThap: true,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by'],
      deBai: 'Sola nhờ bạn: với hàng dễ vỡ có luật tháp, kiện số lớn không được đặt đè lên kiện số nhỏ hơn. Hãy gom kiện 20 ở nấc 3 (2, 3) và kiện 10 ở nấc 2 (3, 4) về bãi nấc 1 (4, 3) thành tháp [20, 10].',
      veMaMau: 'Đưa kiện 20 ở nấc 3 về nấc 1 trước, sau đó quay sang nấc 2 đưa kiện 10 lên đỉnh.',
      san: SAN_BEN_1,
      batDau: { x: 3, y: 3, nac: 2, tam: 1 },
      chong: [C(3, 4, [10]), C(2, 3, [20])],
      tau: tauDon(20, 0),
      bongMo: BM([
        { x: 3, y: 4, so: [] },
        { x: 2, y: 3, so: [] },
        { x: 4, y: 3, so: [20, 10] }
      ]),
      maMau: bai([
        'swing_by(1)',
        'carry_by(-2)'
      ]),
      loiGiai: bai([
        'swing_by(1)',
        'carry_by(-2)',
        'swing_by(1)',
        'carry_by(-1)'
      ]),
      sao: { o: 16, nhip: 9 },
      loiGiaiKhac: {
        moTa: 'Dùng swing_right() thay cho swing_by(1)',
        baiLam: bai([
          'swing_right()',
          'carry_by(-2)',
          'swing_right()',
          'carry_by(-1)'
        ])
      },
      loiSai: [
        { moTa: 'Đặt kiện 10 xuống nấc 1 trước rồi đặt kiện 20 đè lên kiện 10', baiLam: bai(['carry_by(-1)', 'swing_by(2)', 'carry_by(-2)']), phaiCoMa: ['thap-sai'] },
        { moTa: 'Mới chuyển kiện 20 về nấc 1, chưa chuyển kiện 10 lên đỉnh', baiLam: bai(['swing_by(1)', 'carry_by(-2)']), phaiCoMa: ['chua-xep-chong'] }
      ],
      goiY: ['Luna: Phải đặt kiện lớn 20 ở đáy trước, rồi mới đặt kiện nhỏ 10 lên trên.', 'Luna: Sau swing_by(1) và carry_by(-2), gọi tiếp swing_by(1) và carry_by(-1).']
    }),

    manBenTau({
      so: 9, ten: 'Chuyển tháp qua bãi phụ', hang: 'bien-the',
      mucTieu: 'bong-mo',
      luatThap: true,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by'],
      deBai: 'Sola nhờ bạn: dời tháp 2 kiện [20, 10] từ nấc 3 (2, 3) sang nấc 1 (4, 3) đúng thứ tự [20, 10] bằng cách mượn bãi phụ nấc 2 (3, 4) làm trung gian.',
      veMaMau: 'Sau khi đưa kiện 10 sang nấc 2 và kiện 20 sang nấc 1, hãy lấy kiện 10 ở nấc 2 đặt lên kiện 20.',
      san: SAN_BEN_1,
      batDau: { x: 3, y: 3, nac: 3, tam: 1 },
      chong: [C(2, 3, [20, 10])],
      tau: tauDon(20, 0),
      bongMo: BM([
        { x: 2, y: 3, so: [] },
        { x: 3, y: 4, so: [] },
        { x: 4, y: 3, so: [20, 10] }
      ]),
      maMau: bai([
        'carry_by(-1)',
        'swing_by(1)',
        'carry_by(-2)'
      ]),
      loiGiai: bai([
        'carry_by(-1)',
        'swing_by(1)',
        'carry_by(-2)',
        'swing_by(1)',
        'carry_by(-1)'
      ]),
      sao: { o: 17, nhip: 12 },
      loiGiaiKhac: {
        moTa: 'Dùng swing_right() cho các bước quay sang phải 1 nấc',
        baiLam: bai([
          'carry_by(-1)',
          'swing_right()',
          'carry_by(-2)',
          'swing_right()',
          'carry_by(-1)'
        ])
      },
      loiSai: [
        { moTa: 'Chuyển thẳng cả 2 kiện sang nấc 1 nên kiện 20 đè lên kiện 10', baiLam: bai(['carry_by(-2)', 'swing_by(2)', 'carry_by(-2)']), phaiCoMa: ['thap-sai'] },
        { moTa: 'Quên chuyển kiện 10 từ bãi phụ nấc 2 sang đỉnh tháp ở nấc 1', baiLam: bai(['carry_by(-1)', 'swing_by(1)', 'carry_by(-2)']), phaiCoMa: ['chua-xep-chong'] }
      ],
      goiY: ['Luna: Tạm gửi kiện 10 sang nấc 2 bằng carry_by(-1), quay về nấc 3 đưa kiện 20 sang nấc 1 bằng carry_by(-2).', 'Luna: Cuối cùng gọi swing_by(1) sang nấc 2 rồi carry_by(-1) đưa kiện 10 về nấc 1.']
    }),

    manBenTau({
      so: 10, ten: 'Trùm Tàu cập bến', hang: 'trum', nhipTheo: 'tong',
      luatThap: true,
      huyHieu: { ma: 'ben-tau', ten: 'Huy hiệu Tàu cập bến' },
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by'],
      deBai: 'Trùm chương 1: trên hai sân, tháp 2 kiện ở nấc 1 (4, 3) phải được xếp lên boong tàu ở nấc 0 (3, 2) theo đúng luật tháp trước khi tàu rời bến ở cuối nhịp 13. Hãy mượn bãi phụ nấc 2 (3, 4) làm trung gian.',
      veMaMau: 'Gửi kiện nhỏ sang nấc 2, đưa kiện lớn lên tàu ở nấc 0, rồi lấy kiện nhỏ ở nấc 2 đặt lên tàu.',
      san: [SAN_BEN_1, SAN_BEN_1],
      batDau: [{ x: 3, y: 3, nac: 1, tam: 1 }, { x: 3, y: 3, nac: 1, tam: 1 }],
      chong: [
        [C(4, 3, [24, 12])],
        [C(4, 3, [36, 18])]
      ],
      tau: [tauDon(13, 2), tauDon(13, 2)],
      giao: [
        [{ tau: 0, so: [12, 24] }],
        [{ tau: 0, so: [18, 36] }]
      ],
      maMau: bai([
        'carry_by(1)',
        'swing_by(-1)',
        'carry_by(-1)'
      ]),
      loiGiai: bai([
        'carry_by(1)',
        'swing_by(-1)',
        'carry_by(-1)',
        'swing_by(2)',
        'carry_by(-2)'
      ]),
      sao: { o: 17, nhip: 26 },
      loiGiaiKhac: {
        moTa: 'Dùng swing_left() khi quay từ nấc 2 về nấc 1',
        baiLam: bai([
          'carry_by(1)',
          'swing_left()',
          'carry_by(-1)',
          'swing_by(2)',
          'carry_by(-2)'
        ])
      },
      loiSai: [
        { moTa: 'Đưa thẳng 2 kiện từ nấc 1 sang nấc 0 nên vi phạm luật tháp trên boong tàu', baiLam: bai(['carry_by(-1)', 'swing_by(1)', 'carry_by(-1)']), phaiCoMa: ['thap-sai'] },
        { moTa: 'Mới đưa kiện lớn lên tàu, chưa lấy kiện nhỏ từ nấc 2 sang tàu', baiLam: bai(['carry_by(1)', 'swing_by(-1)', 'carry_by(-1)']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Gửi kiện nhỏ sang nấc 2 bằng carry_by(1), quay về nấc 1 bằng swing_by(-1) rồi đưa kiện lớn lên tàu bằng carry_by(-1).', 'Luna: Sau đó gọi swing_by(2) sang nấc 2 rồi carry_by(-2) đưa kiện nhỏ lên boong tàu ở nấc 0.']
    }),

    /* ========================================================================
       CHƯƠNG 2: che-ben-tau (10 màn) — Chế lệnh: hàng tàu nối đuôi (HÀNG ĐỢI, kế hoạch ghép nhịp 3d, 15/11)
       Một bến, nhiều tàu nối đuôi (cfg.hangTau). Chỉ tàu đầu hàng ở boong, mỗi tàu cần đúng một container.
       1 trình diễn · 2 ép thứ tự · 3 vòng lặp · 4 bãi tạm · 5 move_tower2 (gói 7, 9, 10 còn gọi) · 6 hai tháp
       7 trình diễn read_code() ở boong · 8 ép 3 sân · 9 serve_ship() · 10 trùm
       ======================================================================== */
    manCheBenTau({
      so: 1, ten: 'Hàng tàu nối đuôi', hang: 'lam-quen',
      chiChay: true, chinhCoDinh: true,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by'],
      deBai: 'Sola làm mẫu: hôm nay bến có hai tàu nối đuôi. Tàu tới trước đỗ ở boong, bảng ghi số nó cần. Tàu sau chờ ngoài sông. Bấm Chạy để xem.',
      veMaMau: 'Chương trình mẫu đã khóa. Bấm Chạy: tàu đầu nhận kiện 2 rồi rời bến, tàu sau mới vào.',
      san: SAN_HANG,
      batDau: { x: 3, y: 3, nac: 1, tam: 1 },
      chong: [C(4, 3, [8, 2])],
      hangTau: hangTau([2, 8]),
      maMau: bai(['carry_by(-1)', 'swing_by(1)', 'carry_by(-1)']),
      loiGiai: bai(['carry_by(-1)', 'swing_by(1)', 'carry_by(-1)']),
      sao: { o: 15, nhip: 7 },
      loiSai: [],
      goiY: ['Luna: Bấm nút Chạy để xem hai tàu lần lượt nhận hàng.', 'Luna: Đây là hàng đợi: tàu tới trước nhận trước.']
    }),

    manCheBenTau({
      so: 2, ten: 'Tàu tới trước nhận trước', hang: 'lam-quen',
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by'],
      deBai: 'Sola nhờ bạn: giao hàng cho hai tàu nối đuôi. Nhìn bảng số ở boong: tàu đầu hàng cần kiện nào thì giao kiện đó trước. Bạn không chọn được tàu. Giao nhầm là thua.',
      veMaMau: 'Mã mẫu mới quay cần sang kiện 9. Hãy giao kiện 9, rồi giao kiện 3.',
      san: SAN_HANG,
      batDau: { x: 3, y: 3, nac: 1, tam: 1 },
      chong: [C(4, 3, [3]), C(2, 3, [9])],
      hangTau: hangTau([9, 3]),
      maMau: bai(['swing_by(2)']),
      loiGiai: bai(['swing_by(2)', 'carry_by(1)', 'swing_by(1)', 'carry_by(-1)']),
      sao: { o: 16, nhip: 9 },
      loiGiaiKhac: {
        moTa: 'Thêm chú thích: tàu đầu hàng cần kiện 9',
        baiLam: bai(['# kiện 9 trước, kiện 3 sau', 'swing_by(2)', 'carry_by(1)', 'swing_by(1)', 'carry_by(-1)'])
      },
      loiSai: [
        { moTa: 'Giao kiện 3 ở gần trước: tàu đầu hàng cần kiện 9 nên giao nhầm', baiLam: bai(['carry_by(-1)', 'swing_by(-1)', 'carry_by(1)']), phaiCoMa: ['giao-nham'] },
        { moTa: 'Mới giao kiện 9 cho tàu đầu, tàu sau còn chờ', baiLam: bai(['swing_by(2)', 'carry_by(1)']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Tàu đầu hàng cần kiện 9. Kiện 9 nằm bên trái bệ, ở nấc 3.', 'Luna: Tàu đầu rời bến thì bảng số đổi sang 3. Lúc đó mới giao kiện 3.']
    }),

    manCheBenTau({
      so: 3, ten: 'Ba tàu một chồng', hang: 'lam-quen',
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by'],
      deBai: 'Sola nhờ bạn: ba tàu nối đuôi cần kiện 4, rồi 7, rồi 5. Chồng hàng ở nấc 1 xếp sẵn đúng thứ tự đó từ trên xuống. Hãy giao hết bằng một vòng lặp.',
      veMaMau: 'Mã mẫu mới giao một kiện rồi quay về chồng. Hãy lặp lại cho đủ ba tàu.',
      san: SAN_HANG,
      batDau: { x: 3, y: 3, nac: 1, tam: 1 },
      chong: [C(4, 3, [5, 7, 4])],
      hangTau: hangTau([4, 7, 5]),
      maMau: bai(['carry_by(-1)', 'swing_by(1)']),
      loiGiai: bai(['for i in range(3):', '    carry_by(-1)', '    swing_by(1)']),
      sao: { o: 15, nhip: 11 },
      loiGiaiKhac: {
        moTa: 'Viết ba lần không dùng vòng lặp',
        baiLam: bai(['carry_by(-1)', 'swing_by(1)', 'carry_by(-1)', 'swing_by(1)', 'carry_by(-1)'])
      },
      loiSai: [
        { moTa: 'Vòng lặp mới chạy 2 lần nên tàu thứ ba còn chờ', baiLam: bai(['for i in range(2):', '    carry_by(-1)', '    swing_by(1)']), phaiCoMa: ['chua-giao-tau'] },
        { moTa: 'Quên quay về chồng hàng nên lần sau móc vào boong trống', baiLam: bai(['for i in range(3):', '    carry_by(-1)']), phaiCoMa: ['moc-hut'] }
      ],
      goiY: ['Luna: Mỗi tàu cần hai việc: carry_by(-1) rồi swing_by(1).', 'Luna: Có ba tàu nên dùng for i in range(3):.']
    }),

    manCheBenTau({
      so: 4, ten: 'Kiện chưa tới lượt', hang: 'luyen-tap',
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by'],
      deBai: 'Sola nhờ bạn: tàu đầu hàng cần kiện 6, nhưng kiện 3 đang đè lên trên. Kiện 3 chưa tới lượt. Hãy cất nó sang bãi trống ở nấc 2, giao kiện 6, rồi mới giao kiện 3.',
      veMaMau: 'Mã mẫu mới cất kiện 3 sang bãi trống và quay về chồng. Hãy giao kiện 6, rồi lấy lại kiện 3.',
      san: SAN_HANG,
      batDau: { x: 3, y: 3, nac: 1, tam: 1 },
      chong: [C(4, 3, [6, 3])],
      hangTau: hangTau([6, 3]),
      maMau: bai(['carry_by(1)', 'swing_by(-1)']),
      loiGiai: bai(['carry_by(1)', 'swing_by(-1)', 'carry_by(-1)', 'swing_by(2)', 'carry_by(2)']),
      sao: { o: 17, nhip: 13 },
      loiGiaiKhac: {
        moTa: 'Thêm chú thích cho bước cất kiện 3 sang bãi tạm',
        baiLam: bai(['# cất kiện 3 sang bãi tạm', 'carry_by(1)', 'swing_by(-1)', 'carry_by(-1)', 'swing_by(2)', 'carry_by(2)'])
      },
      loiSai: [
        { moTa: 'Giao luôn kiện 3 đang ở trên cùng: tàu đầu hàng cần kiện 6', baiLam: bai(['carry_by(-1)', 'swing_by(1)', 'carry_by(-1)']), phaiCoMa: ['giao-nham'] },
        { moTa: 'Giao kiện 6 xong thì quên lấy lại kiện 3 ở bãi tạm', baiLam: bai(['carry_by(1)', 'swing_by(-1)', 'carry_by(-1)']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Chồng hàng chỉ lấy được kiện trên cùng. Tàu lại nhận theo thứ tự hàng.', 'Luna: Giao kiện 6 xong, cần đang ở boong. Bãi tạm cách đó 2 nấc.']
    }),

    manCheBenTau({
      so: 5, ten: 'Chế hàm move_tower2(d1, d2)', hang: 'luyen-tap',
      taoHam: ['move_tower2'],
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by'],
      deBai: 'Sola nhờ bạn: mở Xưởng hàm chế move_tower2(d1, d2). Hàm dời tháp 2 kiện sang chỗ cách d2 nấc, mượn bãi tạm cách d1 nấc. Kiện dưới tới nơi trước, kiện trên tới sau. Dùng hàm đó giao tháp ở nấc 1 cho hai tàu: tàu đầu cần kiện dưới.',
      veMaMau: 'Tạo hàm move_tower2(d1, d2) rồi gọi move_tower2(1, -1).',
      san: SAN_HANG,
      batDau: { x: 3, y: 3, nac: 1, tam: 1 },
      chong: [C(4, 3, [26, 13])],
      hangTau: hangTau([26, 13]),
      maMau: bai(['move_tower2(1, -1)']),
      loiGiai: bai(
        ['move_tower2(1, -1)'],
        { hamCuaEmMoi: [hMoveTower2()] }
      ),
      sao: { o: 20, nhip: 13 },
      loiGiaiKhac: {
        moTa: 'Thêm chú thích trước lệnh gọi move_tower2(1, -1)',
        baiLam: bai(['# bãi tạm ở nấc 2, tàu ở nấc 0', 'move_tower2(1, -1)']),
        hamCuaEmMoi: [hMoveTower2()]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm move_tower2 mà đã bấm Chạy', baiLam: bai(['move_tower2(1, -1)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Truyền ngược d1 và d2 nên kiện trên (13) lên tàu trước: tàu đầu hàng cần 26', baiLam: bai(['move_tower2(-1, 1)']), hamCuaEmMoi: [hMoveTower2()], phaiCoMa: ['giao-nham'] }
      ],
      goiY: ['Luna: Thân hàm gồm 7 dòng: carry_by(d1), swing_by(-d1), carry_by(d2), t = d1 - d2, swing_by(t), t = d2 - d1, carry_by(t).', 'Luna: Bãi tạm cách 1 nấc, tàu cách -1 nấc: gọi move_tower2(1, -1).']
    }),

    manCheBenTau({
      so: 6, ten: 'Hai tháp bốn tàu', hang: 'luyen-tap',
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'move_tower2'],
      deBai: 'Sola nhờ bạn: bốn tàu nối đuôi. Hai tàu đầu cần tháp bên phải, hai tàu sau cần tháp bên trái. Tàu nào cũng cần kiện dưới trước. Bãi tạm ở nấc 2. Hãy gọi move_tower2 hai lần.',
      veMaMau: 'Mã mẫu đã giao tháp bên phải và quay sang tháp bên trái. Hãy gọi move_tower2 lần nữa với số âm.',
      san: SAN_HANG,
      batDau: { x: 3, y: 3, nac: 1, tam: 1 },
      chong: [C(4, 3, [14, 31]), C(2, 3, [22, 9])],
      hangTau: hangTau([14, 31, 22, 9]),
      maMau: bai(['move_tower2(1, -1)', 'swing_by(-1)']),
      loiGiai: bai(['move_tower2(1, -1)', 'swing_by(-1)', 'move_tower2(-1, 1)']),
      sao: { o: 22, nhip: 27 },
      loiGiaiKhac: {
        moTa: 'Thêm chú thích cho hai lần dời tháp',
        baiLam: bai(['# tháp phải rồi tháp trái', 'move_tower2(1, -1)', 'swing_by(-1)', 'move_tower2(-1, 1)'])
      },
      loiSai: [
        { moTa: 'Gọi lại move_tower2(1, -1) ở tháp bên trái: bãi cách 1 nấc lúc này chính là boong tàu', baiLam: bai(['move_tower2(1, -1)', 'swing_by(-1)', 'move_tower2(1, -1)']), phaiCoMa: ['giao-nham'] },
        { moTa: 'Mới giao tháp bên phải, hai tàu sau còn chờ', baiLam: bai(['move_tower2(1, -1)', 'swing_by(-1)']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Sau move_tower2(1, -1), cần đứng ở boong. Tháp bên trái ở nấc 3.', 'Luna: Từ nấc 3, bãi tạm cách -1 nấc, tàu cách 1 nấc.']
    }),

    manCheBenTau({
      so: 7, ten: 'Đọc bảng số của tàu', hang: 'bien-the', nhipTheo: 'tong',
      chiChay: true, chinhCoDinh: true,
      khung: { chinh: 14, moiHam: 10 },
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by'],
      deBai: 'Sola làm mẫu: hai ngày, hàng tàu mỗi ngày một khác. Cần chĩa vào boong thì read_code() đọc được số tàu đầu hàng cần. Bấm Chạy để xem một chương trình đúng cả hai ngày.',
      veMaMau: 'Chương trình mẫu đã khóa. Xem c = read_code() ở boong: ngày 1 đọc ra 12, ngày 2 đọc ra 18.',
      san: [SAN_HANG, SAN_HANG],
      batDau: [{ x: 3, y: 3, nac: 0, tam: 1 }, { x: 3, y: 3, nac: 0, tam: 1 }],
      chong: [
        [C(4, 3, [12]), C(2, 3, [7])],
        [C(4, 3, [5]), C(2, 3, [18])]
      ],
      hangTau: [hangTau([12, 7]), hangTau([18, 5])],
      maMau: bai(T_DOC_BANG_7),
      loiGiai: bai(T_DOC_BANG_7),
      sao: { o: 24, nhip: 18 },
      loiSai: [],
      goiY: ['Luna: Bấm nút Chạy rồi xem từng ngày.', 'Luna: c là số tàu cần, k là số trên kiện. Bằng nhau thì giao kiện đó trước.']
    }),

    manCheBenTau({
      so: 8, ten: 'Tàu đầu hàng cần gì?', hang: 'bien-the', nhipTheo: 'tong',
      khung: { chinh: 14, moiHam: 10 },
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by'],
      deBai: 'Sola nhờ bạn: ba ngày, mỗi ngày hai tàu nối đuôi cần hai kiện theo thứ tự khác nhau. Một kiện ở nấc 1, một kiện ở nấc 2. Hãy đọc bảng số của tàu đầu hàng rồi mới quyết định giao kiện nào trước.',
      veMaMau: 'Mã mẫu mới lo trường hợp tàu đầu hàng cần kiện ở nấc 1. Hãy thêm nhánh else cho trường hợp còn lại.',
      san: [SAN_HANG, SAN_HANG, SAN_HANG],
      batDau: [{ x: 3, y: 3, nac: 0, tam: 1 }, { x: 3, y: 3, nac: 0, tam: 1 }, { x: 3, y: 3, nac: 0, tam: 1 }],
      chong: [
        [C(4, 3, [16]), C(3, 4, [3])],
        [C(4, 3, [21]), C(3, 4, [10])],
        [C(4, 3, [8]), C(3, 4, [27])]
      ],
      hangTau: [hangTau([16, 3]), hangTau([10, 21]), hangTau([27, 8])],
      maMau: bai(T_DOC_BANG_8.slice(0, 7)),
      loiGiai: bai(T_DOC_BANG_8),
      sao: { o: 24, nhip: 30 },
      loiSai: [
        { moTa: 'Làm theo ngày 1: luôn giao kiện ở nấc 1 trước. Ngày 2 tàu đầu hàng cần kiện ở nấc 2', theoSan1: true, baiLam: bai(['swing_by(1)', 'carry_by(-1)', 'swing_by(2)', 'carry_by(2)']), phaiCoMa: ['giao-nham'] },
        { moTa: 'Để nguyên mã mẫu, không có nhánh else: ngày 2 không giao được kiện nào', baiLam: bai(T_DOC_BANG_8.slice(0, 7)), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Trong nhánh else, kiện tàu cần nằm ở nấc 2. Cần đang ở nấc 1.', 'Luna: Nhánh else có 4 dòng: swing_by(1), carry_by(2), swing_by(1), carry_by(-1).']
    }),

    manCheBenTau({
      so: 9, ten: 'Chế hàm serve_ship()', hang: 'bien-the', nhipTheo: 'tong',
      taoHam: ['serve_ship'],
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by'],
      deBai: 'Sola nhờ bạn: mở Xưởng hàm chế serve_ship() để phục vụ tàu đầu hàng. Hàm đọc số tàu cần, quay cần tìm kiện có số đó, đếm số nấc đã quay, rồi mang kiện về boong. Hai ngày, mỗi ngày ba tàu cần ba kiện theo thứ tự khác nhau.',
      veMaMau: 'Tạo hàm serve_ship() rồi gọi 3 lần bằng vòng lặp.',
      san: [SAN_HANG, SAN_HANG],
      batDau: [{ x: 3, y: 3, nac: 0, tam: 1 }, { x: 3, y: 3, nac: 0, tam: 1 }],
      chong: [
        [C(4, 3, [15]), C(3, 4, [6]), C(2, 3, [24])],
        [C(4, 3, [9]), C(3, 4, [30]), C(2, 3, [11])]
      ],
      hangTau: [hangTau([6, 24, 15]), hangTau([11, 9, 30])],
      maMau: bai(['for i in range(3):', '    serve_ship()']),
      loiGiai: bai(
        ['for i in range(3):', '    serve_ship()'],
        { hamCuaEmMoi: [hServeShip()] }
      ),
      sao: { o: 24, nhip: 36 },
      loiGiaiKhac: {
        moTa: 'Gọi serve_ship() ba lần không dùng vòng lặp',
        baiLam: bai(['serve_ship()', 'serve_ship()', 'serve_ship()']),
        hamCuaEmMoi: [hServeShip()]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm serve_ship mà đã bấm Chạy', baiLam: bai(['for i in range(3):', '    serve_ship()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Làm theo ngày 1: giao kiện ở nấc 2, nấc 3 rồi nấc 1. Ngày 2 hàng tàu cần thứ tự khác', theoSan1: true, baiLam: bai(['swing_by(2)', 'carry_by(2)', 'swing_by(-1)', 'carry_by(1)', 'swing_by(1)', 'carry_by(-1)']), phaiCoMa: ['giao-nham'] },
        { moTa: 'Trong serve_ship thiếu vòng while tìm kiện: luôn lấy kiện ở nấc 1', baiLam: bai(['for i in range(3):', '    serve_ship()']), hamCuaEmMoi: [hServeShip(['c = read_code()', 'swing_by(1)', 'carry_by(-1)'])], phaiCoMa: ['giao-nham'] }
      ],
      goiY: ['Luna: Thân hàm: c = read_code(), d = 1, swing_by(1), k = read_code(), rồi while k != c: quay thêm 1 nấc, d = d + 1, đọc lại k.', 'Luna: Tìm thấy rồi thì t = 0 - d và carry_by(t) để mang kiện về boong.']
    }),

    manCheBenTau({
      so: 10, ten: 'Trùm Chế lệnh: hàng tàu nối đuôi', hang: 'trum', nhipTheo: 'tong',
      huyHieu: { ma: 'che-ben-tau', ten: 'Huy hiệu Chế lệnh: hàng tàu nối đuôi' },
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'serve_ship'],
      deBai: 'Trùm chương 2: hai ngày, hàng tàu dài ngắn khác nhau: ngày 1 có ba tàu, ngày 2 có bốn tàu. Hàng nằm trong ba chồng quanh bệ. Hết tàu thì read_code() ở boong trả về -1. Hãy phục vụ tới khi hết hàng tàu.',
      veMaMau: 'Mã mẫu mới đọc số tàu đầu hàng cần. Hãy lặp serve_ship() tới khi c bằng -1.',
      san: [SAN_HANG, SAN_HANG],
      batDau: [{ x: 3, y: 3, nac: 0, tam: 1 }, { x: 3, y: 3, nac: 0, tam: 1 }],
      chong: [
        [C(4, 3, [5, 12]), C(3, 4, [20]), C(2, 3, [7, 33])],
        [C(4, 3, [18, 4]), C(3, 4, [25, 9]), C(2, 3, [14])]
      ],
      hangTau: [hangTau([33, 12, 7]), hangTau([9, 25, 4, 14])],
      maMau: bai(['c = read_code()']),
      loiGiai: bai(['c = read_code()', 'while c != -1:', '    serve_ship()', '    c = read_code()']),
      sao: { o: 26, nhip: 44 },
      loiGiaiKhac: {
        moTa: 'Thêm chú thích trước vòng while',
        baiLam: bai(['# phục vụ tới khi hết hàng tàu', 'c = read_code()', 'while c != -1:', '    serve_ship()', '    c = read_code()'])
      },
      loiSai: [
        { moTa: 'Làm theo ngày 1: giao kiện trên cùng ở nấc 3, nấc 1 rồi nấc 3. Ngày 2 hàng tàu cần thứ tự khác', theoSan1: true, baiLam: bai(['swing_by(-1)', 'carry_by(1)', 'swing_by(1)', 'carry_by(-1)', 'swing_by(-1)', 'carry_by(1)']), phaiCoMa: ['giao-nham'] },
        { moTa: 'Chỉ gọi serve_ship() 3 lần: ngày 2 có bốn tàu nên tàu cuối còn chờ', baiLam: bai(['for i in range(3):', '    serve_ship()']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Còn tàu thì c là số tàu cần. Hết tàu thì c bằng -1.', 'Luna: Trong vòng while, gọi serve_ship() rồi đọc lại c = read_code().']
    })
  ];

  ManHoc.manBenTau = DS;
  if (laNode) module.exports = DS;
})();
