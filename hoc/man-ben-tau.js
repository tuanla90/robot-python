/* ============================================================================
   man-ben-tau.js — "Robot Chấn Hưng": GÓI 4 MÙA 4 "CẢNG SÔNG" (BẾN TÀU & LUẬT THÁP)
   Gồm 20 màn mới trên Cần cẩu R1 gắn móc cẩu + đầu đọc mã (quet-ma):
   - ben-tau.1..10     (10 màn chương ben-tau "Tàu cập bến")
   - che-ben-tau.1..10 (10 màn chương che-ben-tau "Chế lệnh: giao đúng tàu")
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

  var SAN_BEN_2 = [
    '~~~~~~~',
    '~~~~~~~',
    '~TTDTT~',
    '.DD.DD.',
    '..DDD..',
    '.D.D.D.',
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
  function BM(chong) {
    return {
      x: 3, y: 3,
      chong: chong.map(function (q) { return { x: q.x, y: q.y, so: q.so.slice() }; })
    };
  }

  // Các hàm chế ở Gói 4 chương che-ben-tau
  var T_WAIT_TICKS = [
    'for i in range(n):',
    '    wait()'
  ];
  var T_SHIP_PAIR = [
    'if read_code() // 10 == 1:',
    '    carry_by(-1)',
    '    swing_by(1)',
    'else:',
    '    carry_by(1)',
    '    swing_by(-1)'
  ];
  var T_SHIP_ALL_PAIR = [
    'while read_code() != -1:',
    '    ship_pair()'
  ];
  var T_MOVE_TOWER2 = [
    'carry_by(d1)',
    'swing_by(-d1)',
    'carry_by(d2)',
    'swing_by(d1 - d2)',
    'carry_by(d2 - d1)'
  ];
  var T_FILTER_SHIP_SAI = [
    'while read_code() != -1:',
    '    if read_code() % 10 == t:',
    '        carry_by(-1)',
    '        swing_by(1)',
    '    else:',
    '        carry_by(1)',
    '        swing_by(-1)'
  ];
  var T_FILTER_SHIP_DUNG = [
    'while read_code() != -1:',
    '    if read_code() // 10 == t:',
    '        carry_by(-1)',
    '        swing_by(1)',
    '    else:',
    '        carry_by(1)',
    '        swing_by(-1)'
  ];
  var T_SHIP_TOWER2 = [
    'wait_ticks(w)',
    'move_tower2(d1, d2)'
  ];

  function hWaitTicks(than) { return H('wait_ticks', ['n'], than || T_WAIT_TICKS); }
  function hShipPair(than) { return H('ship_pair', [], than || T_SHIP_PAIR); }
  function hShipAllPair(than) { return H('ship_all_pair', [], than || T_SHIP_ALL_PAIR); }
  function hMoveTower2(than) { return H('move_tower2', ['d1', 'd2'], than || T_MOVE_TOWER2); }
  function hFilterShip(than) { return H('filter_ship', ['t'], than || T_FILTER_SHIP_DUNG); }
  function hShipTower2(than) { return H('ship_tower2', ['w', 'd1', 'd2'], than || T_SHIP_TOWER2); }

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
      deBai: 'Sola làm mẫu: tàu hàng đang đỗ ở bến phía bắc (các ô boong tàu T ở nấc 7, 0, 1). Bấm Chạy để xem cần cẩu nhấc kiện hàng 18 ở nấc 2, quay sang boong tàu ở nấc 1 rồi hạ xuống đúng lúc tàu rời bến.',
      veMaMau: 'Chương trình mẫu đã khóa. Bấm Chạy để quan sát tàu rời bến mang theo kiện 18.',
      san: SAN_BEN_1,
      batDau: { x: 3, y: 3, nac: 2, tam: 1 },
      chong: [C(4, 3, [18])],
      tau: tauDon(3, 2),
      giao: [{ tau: 0, so: [18] }],
      maMau: bai(['carry_by(-1)']),
      loiGiai: bai(['carry_by(-1)']),
      sao: { o: 8, nhip: 3 },
      loiSai: [],
      goiY: ['Luna: Bấm nút Chạy để xem tàu nhận kiện 18 và rời bến.', 'Luna: Kiện hàng chỉ được tính là đã giao khi tàu rời bến mang theo kiện đó.']
    }),

    manBenTau({
      so: 2, ten: 'Giữ nhịp chờ tàu đi', hang: 'lam-quen',
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by'],
      deBai: 'Sola nhờ bạn: chuyển kiện hàng 24 ở nấc 2 (4, 3) lên boong tàu ở nấc 1 (4, 2) bằng carry_by(-1), sau đó đứng chờ thêm 2 nhịp bằng wait() để tàu rời bến.',
      veMaMau: 'Thêm 1 lệnh wait() nữa ở cuối để chờ đủ 5 nhịp cho tàu rời bến.',
      san: SAN_BEN_1,
      batDau: { x: 3, y: 3, nac: 2, tam: 1 },
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
      sao: { o: 10, nhip: 5 },
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
        { moTa: 'Quay nhầm sang nấc 3 thay vì boong tàu ở nấc 1', baiLam: bai(['carry_by(1)', 'wait()', 'wait()']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: carry_by(-1) tốn 3 nhịp, mà tàu đỗ 5 nhịp mới đi.', 'Luna: Thêm 2 lệnh wait() sau carry_by(-1) để tàu kịp rời bến.']
    }),

    manBenTau({
      so: 3, ten: 'Đón tàu cập bến', hang: 'lam-quen',
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by'],
      deBai: 'Sola nhờ bạn: tàu đang ở ngoài khơi và chỉ cập bến từ cuối nhịp 3. Hãy chờ 1 nhịp bằng wait() rồi mới gọi carry_by(-1) chuyển kiện 31 lên boong tàu, sau đó chờ thêm 2 nhịp cho tàu rời bến.',
      veMaMau: 'Đặt 1 lệnh wait() trước carry_by(-1) để không hạ hàng lúc tàu vắng.',
      san: SAN_BEN_1,
      batDau: { x: 3, y: 3, nac: 2, tam: 1 },
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
      sao: { o: 11, nhip: 6 },
      loiGiaiKhac: {
        moTa: 'Nhấc và quay sang nấc 1 trước, chờ tàu cập bến rồi mới hạ xuống',
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
      deBai: 'Sola nhờ bạn: chuyển cả chồng 2 kiện hàng [14, 28] ở nấc 2 (4, 3) lên boong tàu ở nấc 1 (4, 2) trước khi tàu rời bến ở cuối nhịp 8.',
      veMaMau: 'Dùng clear_stack(-1) để chuyển hết chồng hàng sang nấc 1.',
      san: SAN_BEN_1,
      batDau: { x: 3, y: 3, nac: 2, tam: 1 },
      chong: [C(4, 3, [14, 28])],
      tau: tauDon(8, 2),
      giao: [{ tau: 0, so: [14, 28] }],
      maMau: bai([
        'carry_by(-1)'
      ]),
      loiGiai: bai(['clear_stack(-1)']),
      sao: { o: 12, nhip: 8 },
      loiGiaiKhac: {
        moTa: 'Dùng hàm carry_n(2, -1) để chuyển đúng 2 kiện',
        baiLam: bai(['carry_n(2, -1)'])
      },
      loiSai: [
        { moTa: 'Mới chuyển 1 kiện lên tàu', baiLam: bai(['carry_by(-1)']), phaiCoMa: ['chua-giao-tau'] },
        { moTa: 'Chuyển nhầm sang bãi nấc 3 thay vì boong tàu ở nấc 1', baiLam: bai(['clear_stack(1)']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Gọi clear_stack(-1) sẽ tự động nhấc từng kiện ở nấc 2 đưa sang boong tàu ở nấc 1.', 'Luna: Đúng cuối nhịp 8 tàu sẽ rời bến mang theo cả 2 kiện 14 và 28.']
    }),

    manBenTau({
      so: 5, ten: 'Chọn đúng kiện cho tàu', hang: 'luyen-tap',
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by'],
      deBai: 'Sola nhờ bạn: chồng hàng ở nấc 2 (4, 3) có kiện 25 nằm đè lên kiện 16, nhưng tàu chỉ nhận kiện 16. Hãy dời kiện 25 sang bãi tạm nấc 3 (4, 4), quay lại nấc 2 rồi đưa kiện 16 lên tàu ở nấc 1 (4, 2).',
      veMaMau: 'Sau khi cất kiện 25 sang nấc 3 và quay về nấc 2, hãy đưa kiện 16 lên tàu.',
      san: SAN_BEN_1,
      batDau: { x: 3, y: 3, nac: 2, tam: 1 },
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
      sao: { o: 10, nhip: 7 },
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
      deBai: 'Sola nhờ bạn: cầu cảng nấc 0 (3, 2) nằm giữa Tàu 1 bên trái ở nấc 7 (2, 2) và Tàu 2 bên phải ở nấc 1 (4, 2). Hãy giao kiện 15 trên đỉnh cho Tàu 1 và kiện 24 bên dưới cho Tàu 2.',
      veMaMau: 'Sau khi giao kiện 15 cho Tàu 1 và quay về nấc 0, hãy giao kiện 24 cho Tàu 2.',
      san: SAN_BEN_2,
      batDau: { x: 3, y: 3, nac: 0, tam: 1 },
      chong: [C(3, 2, [24, 15])],
      tau: tauDoi(7, 2),
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
      sao: { o: 10, nhip: 7 },
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
      goiY: ['Luna: Từ nấc 0, Tàu 1 ở nấc 7 (lệch -1) và Tàu 2 ở nấc 1 (lệch +1).', 'Luna: Gọi carry_by(-1), swing_by(1), rồi carry_by(1).']
    }),

    manBenTau({
      so: 7, ten: 'Phân luồng hai tàu theo mã', hang: 'luyen-tap', nhipTheo: 'tong',
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by'],
      deBai: 'Sola nhờ bạn: đọc mã từng kiện trong chồng 3 kiện ở cầu cảng nấc 0 (3, 2) trên hai sân. Nếu read_code() // 10 == 1 thì giao cho Tàu 1 ở nấc 7 rồi quay về nấc 0, ngược lại giao cho Tàu 2 ở nấc 1 rồi quay về nấc 0.',
      veMaMau: 'Hoàn thiện nhánh else để giao các kiện 2x cho Tàu 2 ở nấc 1.',
      san: [SAN_BEN_2, SAN_BEN_2],
      batDau: [{ x: 3, y: 3, nac: 0, tam: 1 }, { x: 3, y: 3, nac: 0, tam: 1 }],
      chong: [
        [C(3, 2, [26, 14, 21])],
        [C(3, 2, [19, 28, 12])]
      ],
      tau: [tauDoi(11, 2), tauDoi(11, 2)],
      giao: [
        [{ tau: 0, so: [14] }, { tau: 1, so: [21, 26] }],
        [{ tau: 0, so: [12, 19] }, { tau: 1, so: [28] }]
      ],
      maMau: bai([
        'while read_code() != -1:',
        '    if read_code() // 10 == 1:',
        '        carry_by(-1)',
        '        swing_by(1)'
      ]),
      loiGiai: bai([
        'while read_code() != -1:',
        '    if read_code() // 10 == 1:',
        '        carry_by(-1)',
        '        swing_by(1)',
        '    else:',
        '        carry_by(1)',
        '        swing_by(-1)'
      ]),
      sao: { o: 14, nhip: 22 },
      loiGiaiKhac: {
        moTa: 'Dùng vòng for 3 lần thay cho while read_code() != -1',
        baiLam: bai([
          'for i in range(3):',
          '    if read_code() // 10 == 1:',
          '        carry_by(-1)',
          '        swing_by(1)',
          '    else:',
          '        carry_by(1)',
          '        swing_by(-1)'
        ])
      },
      loiSai: [
        { moTa: 'Đưa mọi kiện sang Tàu 1 nên bị giao nhầm kiện 2x', baiLam: bai(['while read_code() != -1:', '    carry_by(-1)', '    swing_by(1)']), phaiCoMa: ['giao-nham'] },
        { moTa: 'Không dùng vòng lặp nên chỉ giao được 1 kiện đầu tiên', baiLam: bai(['if read_code() // 10 == 1:', '    carry_by(-1)', 'else:', '    carry_by(1)']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Trong nhánh if read_code() // 10 == 1:, gọi carry_by(-1) rồi swing_by(1).', 'Luna: Trong nhánh else:, gọi carry_by(1) rồi swing_by(-1).']
    }),

    manBenTau({
      so: 8, ten: 'Luật tháp: số nhỏ trên số lớn', hang: 'bien-the',
      mucTieu: 'bong-mo',
      luatThap: true,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by'],
      deBai: 'Sola nhờ bạn: với hàng dễ vỡ có luật tháp, kiện số lớn không được đặt đè lên kiện số nhỏ hơn. Hãy gom kiện 20 ở nấc 5 (2, 4) và kiện 10 ở nấc 4 (3, 4) về bãi nấc 3 (4, 4) thành tháp [20, 10].',
      veMaMau: 'Đưa kiện 20 ở nấc 5 về nấc 3 trước, sau đó quay sang nấc 4 đưa kiện 10 lên đỉnh.',
      san: SAN_BEN_1,
      batDau: { x: 3, y: 3, nac: 4, tam: 1 },
      chong: [C(3, 4, [10]), C(2, 4, [20])],
      tau: tauDon(20, 0),
      bongMo: BM([
        { x: 3, y: 4, so: [] },
        { x: 2, y: 4, so: [] },
        { x: 4, y: 4, so: [20, 10] }
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
      sao: { o: 11, nhip: 10 },
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
        { moTa: 'Đặt kiện 10 xuống nấc 3 trước rồi đặt kiện 20 đè lên kiện 10', baiLam: bai(['carry_by(-1)', 'swing_by(2)', 'carry_by(-2)']), phaiCoMa: ['thap-sai'] },
        { moTa: 'Mới chuyển kiện 20 về nấc 3, chưa chuyển kiện 10 lên đỉnh', baiLam: bai(['swing_by(1)', 'carry_by(-2)']), phaiCoMa: ['chua-xep-chong'] }
      ],
      goiY: ['Luna: Phải đặt kiện lớn 20 ở đáy trước, rồi mới đặt kiện nhỏ 10 lên trên.', 'Luna: Sau swing_by(1) và carry_by(-2), gọi tiếp swing_by(1) và carry_by(-1).']
    }),

    manBenTau({
      so: 9, ten: 'Chuyển tháp qua bãi phụ', hang: 'bien-the',
      mucTieu: 'bong-mo',
      luatThap: true,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by'],
      deBai: 'Sola nhờ bạn: dời tháp 2 kiện [20, 10] từ nấc 4 (3, 4) sang nấc 2 (4, 3) đúng thứ tự [20, 10] bằng cách mượn bãi phụ nấc 3 (4, 4) làm trung gian.',
      veMaMau: 'Sau khi đưa kiện 10 sang nấc 3 và kiện 20 sang nấc 2, hãy lấy kiện 10 ở nấc 3 đặt lên kiện 20.',
      san: SAN_BEN_1,
      batDau: { x: 3, y: 3, nac: 4, tam: 1 },
      chong: [C(3, 4, [20, 10])],
      tau: tauDon(20, 0),
      bongMo: BM([
        { x: 3, y: 4, so: [] },
        { x: 4, y: 4, so: [] },
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
      sao: { o: 12, nhip: 12 },
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
        { moTa: 'Chuyển thẳng cả 2 kiện sang nấc 2 nên kiện 20 đè lên kiện 10', baiLam: bai(['carry_by(-2)', 'swing_by(2)', 'carry_by(-2)']), phaiCoMa: ['thap-sai'] },
        { moTa: 'Quên chuyển kiện 10 từ bãi phụ nấc 3 sang đỉnh tháp ở nấc 2', baiLam: bai(['carry_by(-1)', 'swing_by(1)', 'carry_by(-2)']), phaiCoMa: ['chua-xep-chong'] }
      ],
      goiY: ['Luna: Tạm gửi kiện 10 sang nấc 3 bằng carry_by(-1), quay về nấc 4 đưa kiện 20 sang nấc 2 bằng carry_by(-2).', 'Luna: Cuối cùng gọi swing_by(1) sang nấc 3 rồi carry_by(-1) đưa kiện 10 về nấc 2.']
    }),

    manBenTau({
      so: 10, ten: 'Trùm Tàu cập bến', hang: 'trum', nhipTheo: 'tong',
      luatThap: true,
      huyHieu: { ma: 'ben-tau', ten: 'Huy hiệu Tàu cập bến' },
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by'],
      deBai: 'Trùm chương 1: trên hai sân, tháp 2 kiện ở nấc 2 (4, 3) phải được xếp lên boong tàu ở nấc 1 (4, 2) theo đúng luật tháp trước khi tàu rời bến ở cuối nhịp 13. Hãy mượn bãi phụ nấc 3 (4, 4) làm trung gian.',
      veMaMau: 'Gửi kiện nhỏ sang nấc 3, đưa kiện lớn lên tàu ở nấc 1, rồi lấy kiện nhỏ ở nấc 3 đặt lên tàu.',
      san: [SAN_BEN_1, SAN_BEN_1],
      batDau: [{ x: 3, y: 3, nac: 2, tam: 1 }, { x: 3, y: 3, nac: 2, tam: 1 }],
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
      sao: { o: 12, nhip: 26 },
      loiGiaiKhac: {
        moTa: 'Dùng swing_left() khi quay từ nấc 3 về nấc 2',
        baiLam: bai([
          'carry_by(1)',
          'swing_left()',
          'carry_by(-1)',
          'swing_by(2)',
          'carry_by(-2)'
        ])
      },
      loiSai: [
        { moTa: 'Đưa thẳng 2 kiện từ nấc 2 sang nấc 1 nên vi phạm luật tháp trên boong tàu', baiLam: bai(['carry_by(-1)', 'swing_by(1)', 'carry_by(-1)']), phaiCoMa: ['thap-sai'] },
        { moTa: 'Mới đưa kiện lớn lên tàu, chưa lấy kiện nhỏ từ nấc 3 sang tàu', baiLam: bai(['carry_by(1)', 'swing_by(-1)', 'carry_by(-1)']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Gửi kiện nhỏ sang nấc 3 bằng carry_by(1), quay về nấc 2 bằng swing_by(-1) rồi đưa kiện lớn lên tàu bằng carry_by(-1).', 'Luna: Sau đó gọi swing_by(2) sang nấc 3 rồi carry_by(-2) đưa kiện nhỏ lên boong tàu ở nấc 1.']
    }),

    /* ========================================================================
       CHƯƠNG 2: che-ben-tau (10 màn) — Chế lệnh: giao đúng tàu
       ======================================================================== */
    manCheBenTau({
      so: 1, ten: 'Chế hàm wait_ticks(n)', hang: 'lam-quen',
      taoHam: ['wait_ticks'],
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by'],
      deBai: 'Sola nhờ bạn: mở Xưởng hàm chế wait_ticks(n) đứng chờ đúng n nhịp bằng vòng lặp for. Dùng hàm đó chờ 2 nhịp cho tàu cập bến, chuyển kiện 19 từ nấc 2 lên boong tàu ở nấc 1 rồi chờ thêm 2 nhịp cho tàu đi.',
      veMaMau: 'Tạo hàm wait_ticks(n) rồi gọi wait_ticks(2), carry_by(-1), wait_ticks(2).',
      san: SAN_BEN_1,
      batDau: { x: 3, y: 3, nac: 2, tam: 1 },
      chong: [C(4, 3, [19])],
      tau: tauDon(4, 3, 4),
      giao: [{ tau: 0, so: [19] }],
      maMau: bai([
        'wait_ticks(2)',
        'carry_by(-1)',
        'wait_ticks(2)'
      ]),
      loiGiai: bai(
        ['wait_ticks(2)', 'carry_by(-1)', 'wait_ticks(2)'],
        { hamCuaEmMoi: [hWaitTicks()] }
      ),
      sao: { o: 12, nhip: 7 },
      loiGiaiKhac: {
        moTa: 'Gọi wait_ticks(1) hai lần ở đầu chương trình',
        baiLam: bai(['wait_ticks(1)', 'wait_ticks(1)', 'carry_by(-1)', 'wait_ticks(2)']),
        hamCuaEmMoi: [hWaitTicks()]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm wait_ticks mà đã bấm Chạy', baiLam: bai(['wait_ticks(2)', 'carry_by(-1)', 'wait_ticks(2)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Chờ thiếu nhịp ở cuối nên tàu chưa rời bến', baiLam: bai(['wait_ticks(2)', 'carry_by(-1)', 'wait_ticks(1)']), hamCuaEmMoi: [hWaitTicks()], phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Thân hàm wait_ticks(n) gồm for i in range(n): và wait().', 'Luna: Chương trình chính gọi wait_ticks(2), carry_by(-1), wait_ticks(2).']
    }),

    manCheBenTau({
      so: 2, ten: 'Đón hai chuyến tàu', hang: 'lam-quen',
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'wait_ticks'],
      deBai: 'Sola nhờ bạn: tàu đỗ 3 nhịp rồi rời bến 2 nhịp mới quay lại. Hãy đưa kiện đầu tiên từ nấc 2 lên tàu ở nấc 1, quay về nấc 2 chờ tàu quay lại bằng wait_ticks(1), rồi đưa nốt kiện thứ hai lên tàu.',
      veMaMau: 'Sau carry_by(-1) và swing_by(1), hãy gọi wait_ticks(1) rồi carry_by(-1).',
      san: SAN_BEN_1,
      batDau: { x: 3, y: 3, nac: 2, tam: 1 },
      chong: [C(4, 3, [15, 25])],
      tau: tauDon(3, 2),
      giao: [{ tau: 0, so: [15, 25] }],
      maMau: bai([
        'carry_by(-1)',
        'swing_by(1)'
      ]),
      loiGiai: bai([
        'carry_by(-1)',
        'swing_by(1)',
        'wait_ticks(1)',
        'carry_by(-1)'
      ]),
      sao: { o: 13, nhip: 8 },
      loiGiaiKhac: {
        moTa: 'Thêm chú thích cho hai chuyến tàu',
        baiLam: bai([
          '# chuyến 1 và chuyến 2',
          'carry_by(-1)',
          'swing_by(1)',
          'wait_ticks(1)',
          'carry_by(-1)'
        ])
      },
      loiSai: [
        { moTa: 'Không chờ tàu quay lại nên hạ kiện thứ hai lúc tàu còn vắng', baiLam: bai(['carry_by(-1)', 'swing_by(1)', ' pick_up()'.trim(), 'set_down()']), phaiCoMa: ['chua-giao-tau'] },
        { moTa: 'Mới giao 1 kiện ở chuyến đầu tiên', baiLam: bai(['carry_by(-1)', 'swing_by(1)']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Chuyến đầu rời bến ở cuối nhịp 3; nhịp 4 quay về nấc 2 bằng swing_by(1), nhịp 5 chờ bằng wait_ticks(1) để cuối nhịp 5 tàu cập lại.', 'Luna: Sau wait_ticks(1), gọi carry_by(-1) để giao kiện thứ hai ở nhịp 6..8.']
    }),

    manCheBenTau({
      so: 3, ten: 'Chế hàm ship_pair()', hang: 'lam-quen',
      taoHam: ['ship_pair'],
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by'],
      deBai: 'Sola nhờ bạn: mở Xưởng hàm chế ship_pair() đọc kiện hàng ở cầu cảng nấc 0: nếu read_code() // 10 == 1 thì carry_by(-1) rồi swing_by(1) sang Tàu 1, ngược lại thì carry_by(1) rồi swing_by(-1) sang Tàu 2.',
      veMaMau: 'Tạo hàm ship_pair() rồi gọi 2 lần để giao 2 kiện ở cầu cảng nấc 0.',
      san: SAN_BEN_2,
      batDau: { x: 3, y: 3, nac: 0, tam: 1 },
      chong: [C(3, 2, [27, 14])],
      tau: tauDoi(8, 2),
      giao: [{ tau: 0, so: [14] }, { tau: 1, so: [27] }],
      maMau: bai([
        'ship_pair()',
        'ship_pair()'
      ]),
      loiGiai: bai(
        ['ship_pair()', 'ship_pair()'],
        { hamCuaEmMoi: [hShipPair()] }
      ),
      sao: { o: 16, nhip: 8 },
      loiGiaiKhac: {
        moTa: 'Dùng vòng for 2 lần gọi ship_pair()',
        baiLam: bai(['for i in range(2):', '    ship_pair()']),
        hamCuaEmMoi: [hShipPair()]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm ship_pair mà đã bấm Chạy', baiLam: bai(['ship_pair()', 'ship_pair()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Mới gọi ship_pair() 1 lần nên còn 1 kiện chưa giao', baiLam: bai(['ship_pair()']), hamCuaEmMoi: [hShipPair()], phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Nhánh if read_code() // 10 == 1: gồm carry_by(-1) và swing_by(1).', 'Luna: Nhánh else: gồm carry_by(1) và swing_by(-1).']
    }),

    manCheBenTau({
      so: 4, ten: 'Chế hàm ship_all_pair()', hang: 'luyen-tap',
      taoHam: ['ship_all_pair'],
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'ship_pair'],
      deBai: 'Sola nhờ bạn: mở Xưởng hàm chế ship_all_pair() lặp while read_code() != -1: để gọi ship_pair() cho tới khi hết chồng hàng ở cầu cảng nấc 0.',
      veMaMau: 'Tạo hàm ship_all_pair() rồi gọi ở chương trình chính.',
      san: SAN_BEN_2,
      batDau: { x: 3, y: 3, nac: 0, tam: 1 },
      chong: [C(3, 2, [18, 23, 11, 29])],
      tau: tauDoi(16, 2),
      giao: [{ tau: 0, so: [11, 18] }, { tau: 1, so: [23, 29] }],
      maMau: bai(['ship_all_pair()']),
      loiGiai: bai(
        ['ship_all_pair()'],
        { hamCuaEmMoi: [hShipAllPair()] }
      ),
      sao: { o: 18, nhip: 16 },
      loiGiaiKhac: {
        moTa: 'Thêm dòng chú thích trước khi gọi ship_all_pair()',
        baiLam: bai(['# phân loại cả chồng lên hai tàu', 'ship_all_pair()']),
        hamCuaEmMoi: [hShipAllPair()]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm ship_all_pair mà đã bấm Chạy', baiLam: bai(['ship_all_pair()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong ship_all_pair thiếu vòng lặp while nên chỉ giao 1 kiện', baiLam: bai(['ship_all_pair()']), hamCuaEmMoi: [hShipAllPair(['ship_pair()'])], phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Thân hàm ship_all_pair() chỉ cần 2 dòng: while read_code() != -1: và ship_pair().', 'Luna: Chương trình chính gọi ship_all_pair().']
    }),

    manCheBenTau({
      so: 5, ten: 'Đưa hàng ra cầu cảng', hang: 'luyen-tap',
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'clear_stack', 'ship_pair', 'ship_all_pair'],
      deBai: 'Sola nhờ bạn: phân loại chồng hàng ở cầu cảng nấc 0 (3, 2) lên hai tàu bằng ship_all_pair(), sau đó quay sang nấc 4 (3, 4) chuyển chồng hàng 2 kiện ra nấc 0 bằng clear_stack(4), rồi quay về nấc 0 phân loại nốt.',
      veMaMau: 'Sau clear_stack(4) ở nấc 4, hãy quay về nấc 0 và gọi ship_all_pair().',
      san: SAN_BEN_2,
      batDau: { x: 3, y: 3, nac: 0, tam: 1 },
      chong: [C(3, 2, [25, 12]), C(3, 4, [16, 21])],
      tau: tauDoi(44, 2),
      giao: [{ tau: 0, so: [12, 16] }, { tau: 1, so: [21, 25] }],
      maMau: bai([
        'ship_all_pair()',
        'swing_by(4)',
        'clear_stack(4)'
      ]),
      loiGiai: bai([
        'ship_all_pair()',
        'swing_by(4)',
        'clear_stack(4)',
        'swing_by(4)',
        'ship_all_pair()'
      ]),
      sao: { o: 23, nhip: 44 },
      loiGiaiKhac: {
        moTa: 'Dùng swing_by(-4) khi quay về nấc 0',
        baiLam: bai([
          'ship_all_pair()',
          'swing_by(4)',
          'clear_stack(4)',
          'swing_by(-4)',
          'ship_all_pair()'
        ])
      },
      loiSai: [
        { moTa: 'Mới giao chồng đầu tiên ở nấc 0, chưa lấy chồng ở nấc 4', baiLam: bai(['ship_all_pair()']), phaiCoMa: ['chua-giao-tau'] },
        { moTa: 'Đưa chồng ở nấc 4 ra nấc 0 nhưng quên gọi ship_all_pair() lần hai', baiLam: bai(['ship_all_pair()', 'swing_by(4)', 'clear_stack(4)']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Sau clear_stack(4) tại nấc 4, cần cẩu vẫn đứng ở nấc 4.', 'Luna: Gọi swing_by(4) để về nấc 0 rồi gọi ship_all_pair().']
    }),

    manCheBenTau({
      so: 6, ten: 'Chế hàm move_tower2(d1, d2)', hang: 'luyen-tap',
      taoHam: ['move_tower2'],
      luatThap: true,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by'],
      deBai: 'Sola nhờ bạn: mở Xưởng hàm chế move_tower2(d1, d2) dời tháp 2 kiện ở nấc hiện tại sang nấc cách d2, mượn bãi phụ cách d1 làm trung gian. Áp dụng gọi move_tower2(1, -1) để chuyển tháp [26, 13] từ nấc 2 lên tàu ở nấc 1.',
      veMaMau: 'Hoàn thiện hàm move_tower2(d1, d2) rồi gọi move_tower2(1, -1).',
      san: SAN_BEN_1,
      batDau: { x: 3, y: 3, nac: 2, tam: 1 },
      chong: [C(4, 3, [26, 13])],
      tau: tauDon(13, 2),
      giao: [{ tau: 0, so: [13, 26] }],
      maMau: bai(['move_tower2(1, -1)']),
      loiGiai: bai(
        ['move_tower2(1, -1)'],
        { hamCuaEmMoi: [hMoveTower2()] }
      ),
      sao: { o: 13, nhip: 13 },
      loiGiaiKhac: {
        moTa: 'Thêm chú thích trước lệnh gọi move_tower2(1, -1)',
        baiLam: bai(['# mượn nấc 3 để dời tháp sang nấc 1', 'move_tower2(1, -1)']),
        hamCuaEmMoi: [hMoveTower2()]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm move_tower2 mà đã bấm Chạy', baiLam: bai(['move_tower2(1, -1)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Truyền ngược d1 và d2 nên dời tháp sang nấc 3 thay vì lên tàu ở nấc 1', baiLam: bai(['move_tower2(-1, 1)']), hamCuaEmMoi: [hMoveTower2()], phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Thân hàm move_tower2(d1, d2) gồm 5 dòng: carry_by(d1), swing_by(-d1), carry_by(d2), swing_by(d1 - d2), carry_by(d2 - d1).', 'Luna: Ở chương trình chính gọi move_tower2(1, -1).']
    }),

    manCheBenTau({
      so: 7, ten: 'Sửa hàm filter_ship(t)', hang: 'bien-the',
      chinhCoDinh: true,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by'],
      deBai: 'Sola nhờ bạn: hàm filter_ship(t) của màn cần lọc các kiện có chữ số hàng chục bằng t ở nấc 2 để đưa lên tàu ở nấc 1, còn kiện khác thì cất sang nấc 3. Nhưng hàm đang dùng nhầm % 10 thay vì // 10. Hãy sửa lại hàm filter_ship(t).',
      veMaMau: 'Chương trình chính đã khóa. Hãy sửa % 10 thành // 10 trong hàm filter_ship(t).',
      san: SAN_BEN_1,
      batDau: { x: 3, y: 3, nac: 2, tam: 1 },
      chong: [C(4, 3, [15, 24, 18])],
      tau: tauDon(12, 2),
      giao: [{ tau: 0, so: [15, 18] }],
      maMau: bai(
        ['filter_ship(1)'],
        { hamCuaMan: [hFilterShip(T_FILTER_SHIP_SAI)] }
      ),
      loiGiai: bai(
        ['filter_ship(1)'],
        { hamCuaMan: [hFilterShip(T_FILTER_SHIP_DUNG)] }
      ),
      sao: { o: 16, nhip: 12 },
      loiGiaiKhac: {
        moTa: 'Đảo điều kiện if read_code() // 10 != t lên trước',
        baiLam: bai(
          ['filter_ship(1)'],
          {
            hamCuaMan: [H('filter_ship', ['t'], [
              'while read_code() != -1:',
              '    if read_code() // 10 != t:',
              '        carry_by(1)',
              '        swing_by(-1)',
              '    else:',
              '        carry_by(-1)',
              '        swing_by(1)'
            ])]
          }
        )
      },
      loiSai: [
        { moTa: 'Để nguyên hàm mẫu dùng % 10 nên cất nhầm cả 3 kiện sang nấc 3', baiLam: bai(['filter_ship(1)'], { hamCuaMan: [hFilterShip(T_FILTER_SHIP_SAI)] }), phaiCoMa: ['chua-giao-tau'] },
        { moTa: 'Đưa mọi kiện lên tàu nên kiện 24 bị lỗi giao nhầm', baiLam: bai(['filter_ship(1)'], { hamCuaMan: [hFilterShip(['while read_code() != -1:', '    carry_by(-1)', '    swing_by(1)'])] }), phaiCoMa: ['giao-nham'] }
      ],
      goiY: ['Luna: Phép % 10 lấy chữ số hàng đơn vị nên không khớp chữ số hàng chục t = 1.', 'Luna: Đổi dòng điều kiện thành if read_code() // 10 == t: là xong.']
    }),

    manCheBenTau({
      so: 8, ten: 'Chế hàm ship_tower2(w, d1, d2)', hang: 'bien-the',
      taoHam: ['ship_tower2'],
      luatThap: true,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'wait_ticks', 'move_tower2'],
      deBai: 'Sola nhờ bạn: mở Xưởng hàm chế ship_tower2(w, d1, d2) gọi wait_ticks(w) rồi gọi move_tower2(d1, d2). Áp dụng gọi ship_tower2(2, 1, -1) để đón tàu cập bến ở cuối nhịp 7 và xếp tháp [30, 15] lên tàu.',
      veMaMau: 'Tạo hàm ship_tower2(w, d1, d2) rồi gọi ship_tower2(2, 1, -1).',
      san: SAN_BEN_1,
      batDau: { x: 3, y: 3, nac: 2, tam: 1 },
      chong: [C(4, 3, [30, 15])],
      tau: tauDon(8, 7, 8),
      giao: [{ tau: 0, so: [15, 30] }],
      maMau: bai(['ship_tower2(2, 1, -1)']),
      loiGiai: bai(
        ['ship_tower2(2, 1, -1)'],
        { hamCuaEmMoi: [hShipTower2()] }
      ),
      sao: { o: 19, nhip: 15 },
      loiGiaiKhac: {
        moTa: 'Thêm dòng chú thích trước khi gọi ship_tower2(2, 1, -1)',
        baiLam: bai(['# chờ 2 nhịp rồi dời tháp', 'ship_tower2(2, 1, -1)']),
        hamCuaEmMoi: [hShipTower2()]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm ship_tower2 mà đã bấm Chạy', baiLam: bai(['ship_tower2(2, 1, -1)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Không chờ 2 nhịp đầu nên lúc hạ kiện lớn xuống boong thì tàu vẫn chưa cập bến', baiLam: bai(['ship_tower2(0, 1, -1)']), hamCuaEmMoi: [hShipTower2()], phaiCoMa: ['ha-bi-chan'] }
      ],
      goiY: ['Luna: Thân hàm ship_tower2(w, d1, d2) gồm wait_ticks(w) và move_tower2(d1, d2).', 'Luna: Gọi ship_tower2(2, 1, -1) ở chương trình chính.']
    }),

    manCheBenTau({
      so: 9, ten: 'Hai bến dời tháp', hang: 'bien-the', nhipTheo: 'tong',
      luatThap: true,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'move_tower2'],
      deBai: 'Sola nhờ bạn: trên hai sân, cần cẩu bắt đầu ở nấc 6 (2, 3). Hãy dời tháp 2 kiện ở nấc 6 lên Tàu 1 ở nấc 7 (mượn bãi nấc 5), sau đó quay sang nấc 2 (4, 3) dời tiếp tháp 2 kiện lên Tàu 2 ở nấc 1 (mượn bãi nấc 3).',
      veMaMau: 'Sau move_tower2(-1, 1) và swing_by(3), hãy gọi move_tower2(1, -1).',
      san: [SAN_BEN_2, SAN_BEN_2],
      batDau: [{ x: 3, y: 3, nac: 6, tam: 1 }, { x: 3, y: 3, nac: 6, tam: 1 }],
      chong: [
        [C(2, 3, [22, 11]), C(4, 3, [28, 14])],
        [C(2, 3, [34, 17]), C(4, 3, [26, 13])]
      ],
      tau: [tauDoi(29, 2), tauDoi(29, 2)],
      giao: [
        [{ tau: 0, so: [11, 22] }, { tau: 1, so: [14, 28] }],
        [{ tau: 0, so: [17, 34] }, { tau: 1, so: [13, 26] }]
      ],
      maMau: bai([
        'move_tower2(-1, 1)',
        'swing_by(3)'
      ]),
      loiGiai: bai([
        'move_tower2(-1, 1)',
        'swing_by(3)',
        'move_tower2(1, -1)'
      ]),
      sao: { o: 15, nhip: 58 },
      loiGiaiKhac: {
        moTa: 'Thêm dòng chú thích cho hai lần dời tháp',
        baiLam: bai([
          '# dời tháp bên trái rồi bên phải',
          'move_tower2(-1, 1)',
          'swing_by(3)',
          'move_tower2(1, -1)'
        ])
      },
      loiSai: [
        { moTa: 'Mới dời tháp thứ nhất lên Tàu 1, chưa dời tháp thứ hai lên Tàu 2', baiLam: bai(['move_tower2(-1, 1)', 'swing_by(3)']), phaiCoMa: ['chua-giao-tau'] },
        { moTa: 'Từ nấc 7 chỉ quay 2 nấc nên dừng ở nấc 1 thay vì nấc 2', baiLam: bai(['move_tower2(-1, 1)', 'swing_by(2)', 'move_tower2(1, -1)']), phaiCoMa: ['moc-hut'] }
      ],
      goiY: ['Luna: move_tower2(-1, 1) bắt đầu ở nấc 6 và kết thúc tại nấc 7.', 'Luna: Từ nấc 7, gọi swing_by(3) để sang nấc 2 rồi gọi move_tower2(1, -1).']
    }),

    manCheBenTau({
      so: 10, ten: 'Trùm Chế lệnh: giao đúng tàu', hang: 'trum', nhipTheo: 'tong',
      luatThap: true,
      huyHieu: { ma: 'che-ben-tau', ten: 'Huy hiệu Chế lệnh: giao đúng tàu' },
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'ship_pair', 'ship_all_pair', 'move_tower2'],
      deBai: 'Trùm chương 2: trên hai sân, hãy phân loại chồng 2 kiện ở cầu cảng nấc 0 (3, 2) lên hai tàu bằng ship_all_pair(), sau đó quay sang nấc 2 (4, 3) dùng move_tower2(1, -1) dời tháp 2 kiện lên Tàu 2 ở nấc 1 đúng luật tháp.',
      veMaMau: 'Kết hợp ship_all_pair(), swing_by(2) và move_tower2(1, -1).',
      san: [SAN_BEN_2, SAN_BEN_2],
      batDau: [{ x: 3, y: 3, nac: 0, tam: 1 }, { x: 3, y: 3, nac: 0, tam: 1 }],
      chong: [
        [C(3, 2, [28, 19]), C(4, 3, [24, 12])],
        [C(3, 2, [17, 29]), C(4, 3, [26, 14])]
      ],
      tau: [tauDoi(23, 2), tauDoi(23, 2)],
      giao: [
        [{ tau: 0, so: [19] }, { tau: 1, so: [12, 24, 28] }],
        [{ tau: 0, so: [17] }, { tau: 1, so: [14, 26, 29] }]
      ],
      maMau: bai([
        'ship_all_pair()',
        'swing_by(2)'
      ]),
      loiGiai: bai([
        'ship_all_pair()',
        'swing_by(2)',
        'move_tower2(1, -1)'
      ]),
      sao: { o: 26, nhip: 46 },
      loiGiaiKhac: {
        moTa: 'Thêm dòng chú thích cho hai giai đoạn giao tàu',
        baiLam: bai([
          '# phân tàu ở nấc 0 rồi dời tháp ở nấc 2',
          'ship_all_pair()',
          'swing_by(2)',
          'move_tower2(1, -1)'
        ])
      },
      loiSai: [
        { moTa: 'Mới phân loại chồng ở nấc 0, chưa dời tháp ở nấc 2', baiLam: bai(['ship_all_pair()']), phaiCoMa: ['chua-giao-tau'] },
        { moTa: 'Dời tháp ở nấc 2 trước khi phân loại chồng ở nấc 0', baiLam: bai(['swing_by(2)', 'move_tower2(1, -1)']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Gọi ship_all_pair() ở nấc 0 để giao 2 kiện đầu tiên lên Tàu 1 và Tàu 2.', 'Luna: Tiếp theo gọi swing_by(2) sang nấc 2 rồi gọi move_tower2(1, -1) để xếp tháp 2 kiện lên trên kiện lớn ở Tàu 2.']
    })
  ];

  ManHoc.manBenTau = DS;
  if (laNode) module.exports = DS;
})();
