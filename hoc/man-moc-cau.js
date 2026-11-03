/* ============================================================================
   man-moc-cau.js — "Robot Chấn Hưng": GÓI 2 MÙA 4 "CẢNG SÔNG" (MÓC CẨU ĐƠN & CHIA DƯ)
   Gồm 20 màn mới trên Cần cẩu R1 gắn móc cẩu đơn (thân cau, tay moc-cau):
   - moc-cau.1..10 (10 màn chương moc-cau "Nhấc container")
   - chia-du.1..10 (10 màn chương chia-du "Chia lấy phần nguyên, phần dư")
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var HAM_MOC = ['swing_left', 'swing_right', 'extend', 'retract', 'pick_up', 'set_down', 'wait'];
  var ROBOT_MOC = { than: 'cau', tay: 'moc-cau', camBien: [] };
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

  // Các hàm chế ở Gói 2 chương chia-du
  var T_TURN_CW = ['t = b - a', 'k = t % 8', 'swing_r(k)'];
  var T_CARRY_BY = ['pick_up()', 'swing_by(d)', 'set_down()'];
  var T_CARRY_N = [
    'for i in range(n):',
    '    carry_by(d)',
    '    swing_by(-d)'
  ];
  var T_SPLIT_PAIR = [
    't = n // 2',
    'carry_n(t, d1)',
    't = n // 2',
    'carry_n(t, d2)'
  ];
  var T_SPLIT_REM_SAI = [
    't = n % 2',
    'carry_n(t, d1)',
    't = n // 2',
    'carry_n(t, d2)'
  ];
  var T_SPLIT_REM_DUNG = [
    't = n // 2',
    'carry_n(t, d1)',
    't = n % 2',
    'carry_n(t, d2)'
  ];
  var T_HAUL_TO = ['pick_up()', 'aim_crane(d, dr)', 'set_down()'];

  function hTurnCw(than) { return H('turn_cw', ['a', 'b'], than || T_TURN_CW); }
  function hCarryBy(than) { return H('carry_by', ['d'], than || T_CARRY_BY); }
  function hCarryN(than) { return H('carry_n', ['n', 'd'], than || T_CARRY_N); }
  function hSplitPair(than) { return H('split_pair', ['n', 'd1', 'd2'], than || T_SPLIT_PAIR); }
  function hSplitRem(than) { return H('split_rem', ['n', 'd1', 'd2'], than || T_SPLIT_REM_DUNG); }
  function hHaulTo(than) { return H('haul_to', ['d', 'dr'], than || T_HAUL_TO); }

  function manMocCau(cfg) {
    return ManHoc.chuanHoa(Object.assign({
      chuong: 'moc-cau',
      loaiRobot: 'cau',
      robot: ROBOT_MOC,
      vo: 'cang',
      hamGoc: HAM_MOC,
      cauTruc: CAU_TRUC,
      khung: { chinh: 10, moiHam: 10 },
      moXuong: true,
      mucTieu: 'bong-mo',
      hamCuaEmCan: [],
      taoHam: []
    }, cfg));
  }

  function manChiaDu(cfg) {
    return ManHoc.chuanHoa(Object.assign({
      chuong: 'chia-du',
      loaiRobot: 'cau',
      robot: ROBOT_MOC,
      vo: 'cang',
      hamGoc: HAM_MOC,
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
       CHƯƠNG 1: moc-cau (10 màn) — Nhấc container
       ======================================================================== */
    manMocCau({
      so: 1, ten: 'Thử móc cẩu đơn', hang: 'lam-quen',
      chiChay: true, chinhCoDinh: true,
      deBai: 'Sola làm mẫu: cần cẩu đã gắn móc cẩu đơn. Bấm Chạy để xem pick_up() nhấc container 10 ở đỉnh chồng (3, 2), quay sang phải 2 nấc rồi set_down() hạ xuống ô (4, 3).',
      veMaMau: 'Chương trình mẫu đã sẵn sàng, bấm Chạy để quan sát móc cẩu nhấc và hạ container.',
      san: SAN_CANG,
      batDau: { x: 3, y: 3, nac: 0, tam: 1 },
      chong: [C(3, 2, [10])],
      bongMo: BM([{ x: 4, y: 3, so: [10] }]),
      maMau: bai(['pick_up()', 'swing_right()', 'swing_right()', 'set_down()']),
      loiGiai: bai(['pick_up()', 'swing_right()', 'swing_right()', 'set_down()']),
      sao: { o: 4, nhip: 4 },
      loiSai: [],
      goiY: ['Luna: Bấm nút Chạy để xem pick_up() và set_down() hoạt động.', 'Luna: Mỗi lệnh pick_up() hoặc set_down() tốn 1 nhịp.']
    }),

    manMocCau({
      so: 2, ten: 'Nhấc sang bên trái', hang: 'lam-quen',
      deBai: 'Sola nhờ bạn: nhấc container 15 đang ở ô (4, 3) (nấc 2, tầm 1), quay cần sang trái 2 nấc về nấc 0 rồi hạ xuống ô (3, 2).',
      veMaMau: 'Đã có lệnh pick_up() và một lần swing_left(). Hãy quay thêm 1 nấc sang trái rồi gọi set_down().',
      san: SAN_CANG,
      batDau: { x: 3, y: 3, nac: 2, tam: 1 },
      chong: [C(4, 3, [15])],
      bongMo: BM([{ x: 3, y: 2, so: [15] }]),
      maMau: bai(['pick_up()', 'swing_left()']),
      loiGiai: bai(['pick_up()', 'swing_left()', 'swing_left()', 'set_down()']),
      sao: { o: 4, nhip: 4 },
      loiGiaiKhac: {
        moTa: 'Thêm dòng chú thích trước khi hạ hàng',
        baiLam: bai(['pick_up()', 'swing_left()', 'swing_left()', '# hạ xuống bãi', 'set_down()'])
      },
      loiSai: [
        { moTa: 'Mới quay trái 1 nấc rồi hạ xuống ô (4, 2)', baiLam: bai(['pick_up()', 'swing_left()', 'set_down()']), phaiCoMa: ['chua-xep-chong'] },
        { moTa: 'Quên hạ container xuống bãi', baiLam: bai(['pick_up()', 'swing_left()', 'swing_left()']), phaiCoMa: ['chua-xep-chong'] }
      ],
      goiY: ['Luna: Từ nấc 2 về nấc 0 cần 2 lần swing_left().', 'Luna: Quay tới nơi nhớ gọi set_down() để thả container xuống bãi.']
    }),

    manMocCau({
      so: 3, ten: 'Nhấc và vươn tầm', hang: 'lam-quen',
      deBai: 'Sola nhờ bạn: nhấc container 20 ở ô (4, 3) (nấc 2, tầm 1) rồi vươn cần ra tầm 3 để hạ xuống ô (6, 3).',
      veMaMau: 'Hãy gọi pick_up() trước, sau đó extend() hai lần rồi set_down().',
      san: SAN_CANG_RONG,
      batDau: { x: 3, y: 3, nac: 2, tam: 1 },
      chong: [C(4, 3, [20])],
      bongMo: BM([{ x: 6, y: 3, so: [20] }]),
      maMau: bai(['pick_up()', 'extend()']),
      loiGiai: bai(['pick_up()', 'extend()', 'extend()', 'set_down()']),
      sao: { o: 4, nhip: 4 },
      loiGiaiKhac: {
        moTa: 'Dùng vòng for 2 lần cho lệnh extend()',
        baiLam: bai(['pick_up()', 'for i in range(2):', '    extend()', 'set_down()'])
      },
      loiSai: [
        { moTa: 'Gọi extend() trước khi pick_up() nên móc hụt ở ô trống', baiLam: bai(['extend()', 'pick_up()', 'extend()', 'set_down()']), phaiCoMa: ['moc-hut', 'chua-xep-chong'] },
        { moTa: 'Chỉ vươn 1 lần nên hạ nhầm ở tầm 2 (5, 3)', baiLam: bai(['pick_up()', 'extend()', 'set_down()']), phaiCoMa: ['chua-xep-chong'] }
      ],
      goiY: ['Luna: Container đang ở tầm 1, nên phải pick_up() ngay từ đầu.', 'Luna: Từ tầm 1 ra tầm 3 cần 2 lần extend() trước khi set_down().']
    }),

    manMocCau({
      so: 4, ten: 'Chuyển hai kiện hàng', hang: 'luyen',
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by'],
      deBai: 'Sola nhờ bạn: chuyển container 11 từ nấc 0 (3, 2) sang nấc 2 (4, 3), rồi quay tiếp sang nấc 4 (3, 4) để chuyển container 22 sang nấc 6 (2, 3).',
      veMaMau: 'Đã chuyển xong kiện hàng đầu tiên. Hãy quay sang nấc 4, nhấc kiện thứ hai và đưa sang nấc 6.',
      san: SAN_CANG,
      batDau: { x: 3, y: 3, nac: 0, tam: 1 },
      chong: [C(3, 2, [11]), C(3, 4, [22])],
      bongMo: BM([{ x: 4, y: 3, so: [11] }, { x: 2, y: 3, so: [22] }]),
      maMau: bai(['pick_up()', 'swing_by(2)', 'set_down()']),
      loiGiai: bai(['pick_up()', 'swing_by(2)', 'set_down()', 'swing_by(2)', 'pick_up()', 'swing_by(2)', 'set_down()']),
      sao: { o: 13, nhip: 10 },
      loiGiaiKhac: {
        moTa: 'Dùng vòng for lặp 2 lần thao tác nhấc, quay 2 nấc, hạ rồi quay tiếp 2 nấc',
        baiLam: bai(['for i in range(2):', '    pick_up()', '    swing_by(2)', '    set_down()', '    swing_by(2)'])
      },
      loiSai: [
        { moTa: 'Quên gọi set_down() kiện đầu đã bấm pick_up() kiện thứ hai', baiLam: bai(['pick_up()', 'swing_by(4)', 'pick_up()', 'swing_by(2)', 'set_down()']), phaiCoMa: ['dang-treo', 'chua-xep-chong'] },
        { moTa: 'Mới chuyển kiện đầu tiên, quên kiện thứ hai', baiLam: bai(['pick_up()', 'swing_by(2)', 'set_down()']), phaiCoMa: ['chua-xep-chong'] }
      ],
      goiY: ['Luna: Sau khi hạ kiện 11 ở nấc 2, gọi swing_by(2) để đến nấc 4.', 'Luna: Tại nấc 4, gọi pick_up(), swing_by(2), set_down() để đưa kiện 22 sang nấc 6.']
    }),

    manMocCau({
      so: 5, ten: 'Đảo chồng hai kiện', hang: 'luyen',
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by'],
      deBai: 'Sola nhờ bạn: tại nấc 0 tầm 2 (3, 1) có chồng 2 container [10, 20] (10 ở đáy, 20 ở đỉnh). Nhấc từng kiện sang nấc 2 tầm 2 (5, 3) để đảo thành chồng [20, 10].',
      veMaMau: 'Dùng vòng for lặp 2 lần: mỗi lần nhấc kiện trên đỉnh, quay sang nấc 2 hạ xuống rồi quay về nấc 0.',
      san: SAN_CANG,
      batDau: { x: 3, y: 3, nac: 0, tam: 2 },
      chong: [C(3, 1, [10, 20])],
      bongMo: BM([{ x: 5, y: 3, so: [20, 10] }]),
      maMau: bai(['for i in range(2):', '    pick_up()', '    swing_by(2)']),
      loiGiai: bai([
        'for i in range(2):',
        '    pick_up()',
        '    swing_by(2)',
        '    set_down()',
        '    swing_by(-2)'
      ]),
      sao: { o: 13, nhip: 12 },
      loiGiaiKhac: {
        moTa: 'Viết tách hai lượt nhấc và hạ nên không cần quay về ở lượt cuối',
        baiLam: bai(['pick_up()', 'swing_by(2)', 'set_down()', 'swing_by(-2)', 'pick_up()', 'swing_by(2)', 'set_down()'])
      },
      loiSai: [
        { moTa: 'Quên set_down() trong vòng lặp nên lượt thứ hai bị lỗi đang treo', baiLam: bai(['for i in range(2):', '    pick_up()', '    swing_by(2)', '    swing_by(-2)']), phaiCoMa: ['dang-treo', 'chua-xep-chong'] },
        { moTa: 'Quên quay về nấc 0 sau khi hạ kiện đầu tiên nên móc hụt tại nấc 2', baiLam: bai(['for i in range(2):', '    pick_up()', '    swing_by(2)', '    set_down()']), phaiCoMa: ['chua-xep-chong'] }
      ],
      goiY: ['Luna: Móc cẩu đơn luôn nhấc kiện trên đỉnh trước (20 trước, 10 sau).', 'Luna: Trong vòng for, sau set_down() nhớ gọi swing_by(-2) để quay lại chồng gốc.']
    }),

    manMocCau({
      so: 6, ten: 'Gom ba nấc vào một chồng', hang: 'luyen',
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by'],
      deBai: 'Sola nhờ bạn: gom ba container ở nấc 1 (5, 1), nấc 2 (5, 3) và nấc 3 (5, 5) về xếp chồng tại nấc 4 (3, 5) theo đúng thứ tự từ đáy lên đỉnh là [10, 20, 30].',
      veMaMau: 'Duyệt danh sách khoảng cách [3, 2, 1] từ mỗi nấc tới nấc 4: nhấc hàng, quay k nấc tới nấc 4, hạ xuống rồi quay về nấc kế tiếp.',
      san: SAN_CANG,
      batDau: { x: 3, y: 3, nac: 1, tam: 2 },
      chong: [C(5, 1, [10]), C(5, 3, [20]), C(5, 5, [30])],
      bongMo: BM([{ x: 3, y: 5, so: [10, 20, 30] }]),
      maMau: bai(['for k in [3, 2, 1]:', '    pick_up()', '    swing_by(k)']),
      loiGiai: bai([
        'for k in [3, 2, 1]:',
        '    pick_up()',
        '    swing_by(k)',
        '    set_down()',
        '    t = 1 - k',
        '    swing_by(t)'
      ]),
      sao: { o: 13, nhip: 15 },
      loiGiaiKhac: {
        moTa: 'Thêm dòng chú thích bên trong vòng for',
        baiLam: bai([
          'for k in [3, 2, 1]:',
          '    # đưa kiện vào nấc 4',
          '    pick_up()',
          '    swing_by(k)',
          '    set_down()',
          '    t = 1 - k',
          '    swing_by(t)'
        ])
      },
      loiSai: [
        { moTa: 'Duyệt ngược [1, 2, 3] nên móc sai nấc và sai thứ tự chồng', baiLam: bai(['for k in [1, 2, 3]:', '    pick_up()', '    swing_by(k)', '    set_down()', '    t = 1 - k', '    swing_by(t)']), phaiCoMa: ['chua-xep-chong'] },
        { moTa: 'Quay về bằng swing_by(-k) nên cả 3 lượt đều quay lại nấc 1 đã trống', baiLam: bai(['for k in [3, 2, 1]:', '    pick_up()', '    swing_by(k)', '    set_down()', '    swing_by(-k)']), phaiCoMa: ['moc-hut', 'chua-xep-chong'] }
      ],
      goiY: ['Luna: Đang ở nấc 4 muốn lùi về nấc kế tiếp thì cần lệch (1 - k) nấc.', 'Luna: Sau set_down(), thêm t = 1 - k rồi swing_by(t) để sang đúng nấc tiếp theo.']
    }),

    manMocCau({
      so: 7, ten: 'Rải chồng ra ba tầm', hang: 'bien-the',
      hamCuaEmCan: ['reach_by'],
      deBai: 'Sola nhờ bạn: tại ô (4, 3) (nấc 2, tầm 1) có chồng 3 container [30, 20, 10] (10 ở trên cùng). Hãy nhấc 10 đặt ra tầm 2 (5, 3), nhấc 20 đặt ra tầm 3 (6, 3), giữ 30 ở tầm 1.',
      veMaMau: 'Dùng vòng for duyệt độ lệch tầm d trong [1, 2]: nhấc kiện ở tầm 1, vươn ra d nấc tầm, hạ xuống rồi thu về tầm 1.',
      san: SAN_CANG_RONG,
      batDau: { x: 3, y: 3, nac: 2, tam: 1 },
      chong: [C(4, 3, [30, 20, 10])],
      bongMo: BM([{ x: 4, y: 3, so: [30] }, { x: 5, y: 3, so: [10] }, { x: 6, y: 3, so: [20] }]),
      maMau: bai(['for d in [1, 2]:', '    pick_up()']),
      loiGiai: bai([
        'for d in [1, 2]:',
        '    pick_up()',
        '    reach_by(d)',
        '    set_down()',
        '    reach_by(-d)'
      ]),
      sao: { o: 11, nhip: 10 },
      loiGiaiKhac: {
        moTa: 'Viết tường minh hai lượt vươn tầm bằng extend() và retract()',
        baiLam: bai(['pick_up()', 'extend()', 'set_down()', 'retract()', 'pick_up()', 'extend()', 'extend()', 'set_down()'])
      },
      loiSai: [
        { moTa: 'Duyệt [2, 1] nên kiện 10 và 20 bị đổi chỗ cho nhau', baiLam: bai(['for d in [2, 1]:', '    pick_up()', '    reach_by(d)', '    set_down()', '    reach_by(-d)']), phaiCoMa: ['chua-xep-chong'] },
        { moTa: 'Quên thu cần reach_by(-d) về tầm 1 trước lượt thứ hai', baiLam: bai(['for d in [1, 2]:', '    pick_up()', '    reach_by(d)', '    set_down()']), phaiCoMa: ['can-het-tam', 'chua-xep-chong'] }
      ],
      goiY: ['Luna: Kiện 10 nằm trên cùng nên được nhấc ở lượt d = 1 để đặt ra tầm 2.', 'Luna: Sau khi set_down(), gọi reach_by(-d) để thu cần về tầm 1 nhấc kiện 20.']
    }),

    manMocCau({
      so: 8, ten: 'Giữ nguyên thứ tự chồng', hang: 'bien-the',
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by'],
      deBai: 'Sola nhờ bạn: chuyển chồng [10, 20] từ nấc 2 (5, 3) sang nấc 4 (3, 5) sao cho thứ tự vẫn giữ nguyên [10, 20] (10 ở đáy, 20 ở đỉnh) bằng cách đảo tạm qua nấc 3 (5, 5).',
      veMaMau: 'Đảo chồng từ nấc 2 sang nấc 3 sẽ thành [20, 10], rồi đảo tiếp từ nấc 3 sang nấc 4 sẽ trở lại [10, 20].',
      san: SAN_CANG,
      batDau: { x: 3, y: 3, nac: 2, tam: 2 },
      chong: [C(5, 3, [10, 20])],
      bongMo: BM([{ x: 3, y: 5, so: [10, 20] }]),
      maMau: bai([
        'for step in range(2):',
        '    for i in range(2):',
        '        pick_up()',
        '        swing_by(1)'
      ]),
      loiGiai: bai([
        'for step in range(2):',
        '    for i in range(2):',
        '        pick_up()',
        '        swing_by(1)',
        '        set_down()',
        '        swing_by(-1)',
        '    swing_by(1)'
      ]),
      sao: { o: 15, nhip: 18 },
      loiGiaiKhac: {
        moTa: 'Dùng danh sách [1, 1] cho vòng lặp ngoài',
        baiLam: bai([
          'for d in [1, 1]:',
          '    for i in range(2):',
          '        pick_up()',
          '        swing_by(d)',
          '        set_down()',
          '        swing_by(-d)',
          '    swing_by(d)'
        ])
      },
      loiSai: [
        { moTa: 'Chuyển thẳng từng kiện từ nấc 2 sang nấc 4 nên chồng bị ngược thành [20, 10]', baiLam: bai(['for i in range(2):', '    pick_up()', '    swing_by(2)', '    set_down()', '    swing_by(-2)']), phaiCoMa: ['chua-xep-chong'] },
        { moTa: 'Quên swing_by(1) ở cuối chặng đầu nên chặng hai móc hụt ở nấc 2', baiLam: bai(['for step in range(2):', '    for i in range(2):', '        pick_up()', '        swing_by(1)', '        set_down()', '        swing_by(-1)']), phaiCoMa: ['moc-hut', 'chua-xep-chong'] }
      ],
      goiY: ['Luna: Đảo chồng 2 lần liên tiếp sẽ trả lại đúng thứ tự ban đầu [10, 20].', 'Luna: Sau vòng for trong, gọi swing_by(1) để cần cẩu bước sang nấc 3 bắt đầu chặng thứ hai.']
    }),

    manMocCau({
      so: 9, ten: 'Dời ba góc ra vòng ngoài', hang: 'bien-the',
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'reach_by', 'aim_crane'],
      deBai: 'Sola nhờ bạn: ba container ở tầm 1 tại nấc 1 (4, 2), nấc 3 (4, 4) và nấc 5 (2, 4) cần được dời sang nấc kế tiếp ở tầm 2 là (5, 3), (3, 5) và (1, 3).',
      veMaMau: 'Mỗi lượt dùng aim_crane(1, 1) để mang hàng ra nấc kế ở tầm 2, hạ xuống rồi aim_crane(1, -1) để tới kiện tiếp theo ở tầm 1.',
      san: SAN_CANG,
      batDau: { x: 3, y: 3, nac: 1, tam: 1 },
      chong: [C(4, 2, [12]), C(4, 4, [24]), C(2, 4, [36])],
      bongMo: BM([{ x: 5, y: 3, so: [12] }, { x: 3, y: 5, so: [24] }, { x: 1, y: 3, so: [36] }]),
      maMau: bai(['for i in range(3):', '    pick_up()', '    aim_crane(1, 1)']),
      loiGiai: bai([
        'for i in range(3):',
        '    pick_up()',
        '    aim_crane(1, 1)',
        '    set_down()',
        '    aim_crane(1, -1)'
      ]),
      sao: { o: 19, nhip: 18 },
      loiGiaiKhac: {
        moTa: 'Thêm chú thích trong vòng lặp',
        baiLam: bai([
          'for i in range(3):',
          '    # dời kiện ra vòng ngoài',
          '    pick_up()',
          '    aim_crane(1, 1)',
          '    set_down()',
          '    aim_crane(1, -1)'
        ])
      },
      loiSai: [
        { moTa: 'Quay về bằng aim_crane(-1, -1) nên quay lại ô cũ đã trống', baiLam: bai(['for i in range(3):', '    pick_up()', '    aim_crane(1, 1)', '    set_down()', '    aim_crane(-1, -1)']), phaiCoMa: ['moc-hut', 'chua-xep-chong'] },
        { moTa: 'Chỉ lặp 2 lần nên còn sót kiện 36 ở (2, 4)', baiLam: bai(['for i in range(2):', '    pick_up()', '    aim_crane(1, 1)', '    set_down()', '    aim_crane(1, -1)']), phaiCoMa: ['chua-xep-chong'] }
      ],
      goiY: ['Luna: Từ nấc chẵn ở tầm 2 muốn sang nấc lẻ kế tiếp ở tầm 1 thì gọi aim_crane(1, -1).', 'Luna: Lặp đủ 3 lần trong vòng for để chuyển hết cả 3 container.']
    }),

    manMocCau({
      so: 10, ten: 'Trùm cuối: Dồn chồng hai bến', hang: 'trum', nhipTheo: 'tong',
      huyHieu: { ma: 'moc-cau', ten: 'Huy hiệu Nhấc container' },
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'reach_by', 'aim_crane'],
      deBai: 'Sola nhờ bạn: trên cả hai sân, dời chồng 2 kiện ở vị trí xuất phát (tầm 1) sang vị trí lệch (+2 nấc, +1 tầm), rồi lấy tiếp kiện 30 ở vị trí lệch (+4 nấc, +1 tầm) so với xuất phát đặt chồng lên trên cùng để được chồng [20, 10, 30].',
      veMaMau: 'Vòng for đầu đã dời xong 2 kiện đầu tiên. Hãy viết tiếp phần đi lấy kiện 30 và đặt lên đỉnh chồng đích.',
      san: [SAN_CANG, SAN_CANG],
      batDau: [{ x: 3, y: 3, nac: 1, tam: 1 }, { x: 3, y: 3, nac: 2, tam: 1 }],
      chong: [
        [C(4, 2, [10, 20]), C(1, 5, [30])],
        [C(4, 3, [10, 20]), C(1, 3, [30])]
      ],
      bongMo: [
        BM([{ x: 5, y: 5, so: [20, 10, 30] }]),
        BM([{ x: 3, y: 5, so: [20, 10, 30] }])
      ],
      maMau: bai([
        'for i in range(2):',
        '    pick_up()',
        '    aim_crane(2, 1)',
        '    set_down()',
        '    aim_crane(-2, -1)'
      ]),
      loiGiai: bai([
        'for i in range(2):',
        '    pick_up()',
        '    aim_crane(2, 1)',
        '    set_down()',
        '    aim_crane(-2, -1)',
        'aim_crane(4, 1)',
        'pick_up()',
        'swing_by(-2)',
        'set_down()'
      ]),
      sao: { o: 25, nhip: 50 },
      loiGiaiKhac: {
        moTa: 'Dùng aim_crane(-2, 0) ở bước quay về chồng đích',
        baiLam: bai([
          'for i in range(2):',
          '    pick_up()',
          '    aim_crane(2, 1)',
          '    set_down()',
          '    aim_crane(-2, -1)',
          'aim_crane(4, 1)',
          'pick_up()',
          'aim_crane(-2, 0)',
          'set_down()'
        ])
      },
      loiSai: [
        { moTa: 'Mới dời 2 kiện đầu, chưa lấy kiện 30 đặt lên đỉnh chồng', baiLam: bai(['for i in range(2):', '    pick_up()', '    aim_crane(2, 1)', '    set_down()', '    aim_crane(-2, -1)']), phaiCoMa: ['chua-xep-chong'] },
        { moTa: 'Đi lấy kiện 30 xong quay nhầm swing_by(2) thay vì swing_by(-2)', baiLam: bai(['for i in range(2):', '    pick_up()', '    aim_crane(2, 1)', '    set_down()', '    aim_crane(-2, -1)', 'aim_crane(4, 1)', 'pick_up()', 'swing_by(2)', 'set_down()']), phaiCoMa: ['chua-xep-chong'] }
      ],
      goiY: ['Luna: Sau vòng for, cần cẩu đang ở vị trí xuất phát (tầm 1). Gọi aim_crane(4, 1) để tới kiện 30.', 'Luna: Nhấc kiện 30 bằng pick_up(), quay lùi 2 nấc bằng swing_by(-2) rồi set_down().']
    }),

    /* ========================================================================
       CHƯƠNG 2: chia-du (10 màn) — Chia lấy phần nguyên, phần dư
       ======================================================================== */
    manChiaDu({
      so: 1, ten: 'Vòng tròn 8 nấc và phép %', hang: 'lam-quen',
      chiChay: true, chinhCoDinh: true,
      hamCuaEmCan: ['swing_r'],
      deBai: 'Sola làm mẫu: trên vòng tròn 8 nấc (0..7), muốn quay theo chiều kim đồng hồ từ nấc a sang nấc b chỉ cần tính (b - a) % 8. Bấm Chạy để xem (1 - 6) % 8 ra đúng 3 nấc phải!',
      veMaMau: 'Chương trình mẫu đã viết sẵn, bấm Chạy để xem phép chia lấy dư % trên vòng 8 nấc.',
      san: SAN_CANG,
      batDau: { x: 3, y: 3, nac: 6, tam: 2 },
      chong: [C(1, 3, [10])],
      bongMo: BM([{ x: 5, y: 1, so: [10] }]),
      maMau: bai(['pick_up()', 't = 1 - 6', 'd = t % 8', 'swing_r(d)', 'set_down()']),
      loiGiai: bai(['pick_up()', 't = 1 - 6', 'd = t % 8', 'swing_r(d)', 'set_down()']),
      sao: { o: 6, nhip: 5 },
      loiSai: [],
      goiY: ['Luna: Trong Python, (-5) % 8 bằng 3 vì -5 + 8 = 3.', 'Luna: Nhờ % 8, công thức (b - a) % 8 luôn cho số bước quay phải từ 0 đến 7.']
    }),

    manChiaDu({
      so: 2, ten: 'Chia phần nguyên // và phần dư %', hang: 'lam-quen',
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by'],
      deBai: 'Sola nhờ bạn: chồng ở nấc 2 (5, 3) có n = 3 kiện [10, 20, 30]. Đưa n // 2 kiện sang nấc 3 (5, 5), rồi đưa n % 2 kiện sang nấc 1 (5, 1) (kiện còn lại ở nguyên nấc 2).',
      veMaMau: 'Đã chuyển n // 2 kiện sang nấc 3 và quay về nấc 2. Hãy viết tiếp phần chuyển n % 2 kiện sang nấc 1.',
      san: SAN_CANG,
      batDau: { x: 3, y: 3, nac: 2, tam: 2 },
      chong: [C(5, 3, [10, 20, 30])],
      bongMo: BM([{ x: 5, y: 3, so: [10] }, { x: 5, y: 5, so: [30] }, { x: 5, y: 1, so: [20] }]),
      maMau: bai([
        'n = 3',
        't = n // 2',
        'for i in range(t):',
        '    pick_up()',
        '    swing_by(1)',
        '    set_down()',
        '    swing_by(-1)'
      ]),
      loiGiai: bai([
        'n = 3',
        't = n // 2',
        'for i in range(t):',
        '    pick_up()',
        '    swing_by(1)',
        '    set_down()',
        '    swing_by(-1)',
        't = n % 2',
        'for i in range(t):',
        '    pick_up()',
        '    swing_by(-1)',
        '    set_down()'
      ]),
      sao: { o: 18, nhip: 7 },
      loiGiaiKhac: {
        moTa: 'Quay về nấc 2 sau khi đặt kiện phần dư ở nấc 1',
        baiLam: bai([
          'n = 3',
          't = n // 2',
          'for i in range(t):',
          '    pick_up()',
          '    swing_by(1)',
          '    set_down()',
          '    swing_by(-1)',
          'pick_up()',
          'swing_by(-1)',
          'set_down()',
          'swing_by(1)'
        ])
      },
      loiSai: [
        { moTa: 'Mới chuyển phần nguyên n // 2, quên chuyển phần dư n % 2 sang nấc 1', baiLam: bai(['n = 3', 't = n // 2', 'for i in range(t):', '    pick_up()', '    swing_by(1)', '    set_down()', '    swing_by(-1)']), phaiCoMa: ['chua-xep-chong'] },
        { moTa: 'Đưa phần dư sang nấc 3 thay vì nấc 1', baiLam: bai(['n = 3', 't = n // 2', 'for i in range(t):', '    pick_up()', '    swing_by(1)', '    set_down()', '    swing_by(-1)', 't = n % 2', 'for i in range(t):', '    pick_up()', '    swing_by(1)', '    set_down()']), phaiCoMa: ['chua-xep-chong'] }
      ],
      goiY: ['Luna: Với n = 3 thì n // 2 là 1 và n % 2 cũng là 1.', 'Luna: Thêm t = n % 2 và vòng for i in range(t): nhấc hàng, swing_by(-1) rồi set_down().']
    }),

    manChiaDu({
      so: 3, ten: 'Chế hàm turn_cw(a, b)', hang: 'lam-quen',
      taoHam: ['turn_cw'],
      hamCuaEmCan: ['swing_r'],
      deBai: 'Sola nhờ bạn: mở Xưởng hàm chế turn_cw(a, b) để quay phải đúng (b - a) % 8 nấc. Dùng hàm đó chuyển kiện 10 từ nấc 5 (1, 5) sang nấc 1 (5, 1) rồi lấy kiện 20 ở nấc 6 (1, 3) đưa sang nấc 2 (5, 3).',
      veMaMau: 'Trong turn_cw(a, b), chỉ cần gọi swing_r((b - a) % 8).',
      san: SAN_CANG,
      batDau: { x: 3, y: 3, nac: 5, tam: 2 },
      chong: [C(1, 5, [10]), C(1, 3, [20])],
      bongMo: BM([{ x: 5, y: 1, so: [10] }, { x: 5, y: 3, so: [20] }]),
      maMau: bai(['pick_up()', 'turn_cw(5, 1)', 'set_down()', 'turn_cw(1, 6)', 'pick_up()', 'turn_cw(6, 2)', 'set_down()']),
      loiGiai: bai(
        ['pick_up()', 'turn_cw(5, 1)', 'set_down()', 'turn_cw(1, 6)', 'pick_up()', 'turn_cw(6, 2)', 'set_down()'],
        { hamCuaEmMoi: [hTurnCw()] }
      ),
      sao: { o: 10, nhip: 17 },
      loiGiaiKhac: {
        moTa: 'Viết vòng for trực tiếp trong thân turn_cw(a, b)',
        baiLam: bai(['pick_up()', 'turn_cw(5, 1)', 'set_down()', 'turn_cw(1, 6)', 'pick_up()', 'turn_cw(6, 2)', 'set_down()']),
        hamCuaEmMoi: [hTurnCw(['t = b - a', 'k = t % 8', 'for i in range(k):', '    swing_right()'])]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm turn_cw mà đã bấm Chạy', baiLam: bai(['pick_up()', 'turn_cw(5, 1)', 'set_down()', 'turn_cw(1, 6)', 'pick_up()', 'turn_cw(6, 2)', 'set_down()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Viết nhầm (a - b) % 8 trong turn_cw nên quay sai số nấc ở bước 1 -> 6', baiLam: bai(['pick_up()', 'turn_cw(5, 1)', 'set_down()', 'turn_cw(1, 6)', 'pick_up()', 'turn_cw(6, 2)', 'set_down()']), hamCuaEmMoi: [hTurnCw(['t = a - b', 'k = t % 8', 'swing_r(k)'])], phaiCoMa: ['moc-hut', 'chua-xep-chong'] }
      ],
      goiY: ['Luna: Mở Xưởng hàm, tạo turn_cw với 2 tham số a, b.', 'Luna: Thân hàm turn_cw(a, b) viết: swing_r((b - a) % 8).']
    }),

    manChiaDu({
      so: 4, ten: 'Chế hàm carry_by(d)', hang: 'luyen',
      taoHam: ['carry_by'],
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by'],
      deBai: 'Sola nhờ bạn: chế hàm carry_by(d) gồm 3 bước: pick_up(), swing_by(d), set_down(). Sau đó dùng carry_by để chuyển 3 kiện hàng từ các nấc 0, 2, 4 sang các nấc 1, 3, 5.',
      veMaMau: 'Tạo hàm carry_by(d) trong Xưởng hàm rồi bấm Chạy chương trình.',
      san: SAN_CANG,
      batDau: { x: 3, y: 3, nac: 0, tam: 2 },
      chong: [C(3, 1, [11]), C(5, 3, [22]), C(3, 5, [33])],
      bongMo: BM([{ x: 5, y: 1, so: [11] }, { x: 5, y: 5, so: [22] }, { x: 1, y: 5, so: [33] }]),
      maMau: bai([
        'for i in range(3):',
        '    carry_by(1)',
        '    swing_by(1)'
      ]),
      loiGiai: bai(
        [
          'for i in range(3):',
          '    carry_by(1)',
          '    swing_by(1)'
        ],
        { hamCuaEmMoi: [hCarryBy()] }
      ),
      sao: { o: 12, nhip: 12 },
      loiGiaiKhac: {
        moTa: 'Gọi tuần tự 3 lần carry_by(1) và 2 lần swing_by(1)',
        baiLam: bai(['carry_by(1)', 'swing_by(1)', 'carry_by(1)', 'swing_by(1)', 'carry_by(1)']),
        hamCuaEmMoi: [hCarryBy()]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm carry_by mà đã bấm Chạy', baiLam: bai(['for i in range(3):', '    carry_by(1)', '    swing_by(1)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên gọi set_down() trong carry_by(d)', baiLam: bai(['for i in range(3):', '    carry_by(1)', '    swing_by(1)']), hamCuaEmMoi: [hCarryBy(['pick_up()', 'swing_by(d)'])], phaiCoMa: ['dang-treo', 'chua-xep-chong'] }
      ],
      goiY: ['Luna: Hàm carry_by(d) giúp gom 3 lệnh pick_up(), swing_by(d), set_down() thành 1 lệnh gọn.', 'Luna: Tạo xong carry_by(d), vòng for ở chương trình chính sẽ chuyển đủ 3 kiện.']
    }),

    manChiaDu({
      so: 5, ten: 'Chế hàm carry_n(n, d)', hang: 'luyen',
      taoHam: ['carry_n'],
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by'],
      deBai: 'Sola nhờ bạn: chế hàm carry_n(n, d) lặp n lần việc gọi carry_by(d) rồi swing_by(-d) để quay về chồng gốc. Dùng carry_n chuyển 3 kiện ở nấc 1 (5, 1) sang nấc 3 (5, 5).',
      veMaMau: 'Trong carry_n(n, d), dùng for i in range(n): gọi carry_by(d) và swing_by(-d).',
      san: SAN_CANG,
      batDau: { x: 3, y: 3, nac: 1, tam: 2 },
      chong: [C(5, 1, [10, 20, 30])],
      bongMo: BM([{ x: 5, y: 5, so: [30, 20, 10] }]),
      maMau: bai(['carry_n(3, 2)']),
      loiGiai: bai(
        ['carry_n(3, 2)'],
        { hamCuaEmMoi: [hCarryN()] }
      ),
      sao: { o: 15, nhip: 18 },
      loiGiaiKhac: {
        moTa: 'Thêm chú thích ở chương trình chính',
        baiLam: bai(['# chuyển 3 kiện sang nấc 3', 'carry_n(3, 2)']),
        hamCuaEmMoi: [hCarryN()]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm carry_n mà đã bấm Chạy', baiLam: bai(['carry_n(3, 2)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong carry_n quên swing_by(-d) để quay về chồng gốc', baiLam: bai(['carry_n(3, 2)']), hamCuaEmMoi: [hCarryN(['for i in range(n):', '    carry_by(d)'])], phaiCoMa: ['chua-xep-chong'] }
      ],
      goiY: ['Luna: Hàm carry_n(n, d) nhận số kiện n và độ lệch nấc d.', 'Luna: Bên trong vòng for i in range(n): gọi carry_by(d) rồi swing_by(-d).']
    }),

    manChiaDu({
      so: 6, ten: 'Chế hàm split_pair(n, d1, d2)', hang: 'luyen',
      taoHam: ['split_pair'],
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'carry_n'],
      deBai: 'Sola nhờ bạn: chế hàm split_pair(n, d1, d2) để chia chồng n kiện làm hai phần nguyên bằng nhau: chuyển n // 2 kiện tới độ lệch d1 và n // 2 kiện tới độ lệch d2 (phần dư n % 2 ở lại chỗ cũ).',
      veMaMau: 'Trong split_pair(n, d1, d2), tính t = n // 2, gọi carry_n(t, d1); tính lại t = n // 2, gọi carry_n(t, d2).',
      san: SAN_CANG,
      batDau: { x: 3, y: 3, nac: 2, tam: 2 },
      chong: [C(5, 3, [10, 20, 30]), C(1, 3, [40, 50])],
      bongMo: BM([
        { x: 5, y: 3, so: [10] },
        { x: 5, y: 1, so: [30] },
        { x: 5, y: 5, so: [20] },
        { x: 1, y: 1, so: [50] },
        { x: 1, y: 5, so: [40] }
      ]),
      maMau: bai(['split_pair(3, -1, 1)', 'swing_by(4)', 'split_pair(2, 1, -1)']),
      loiGiai: bai(
        ['split_pair(3, -1, 1)', 'swing_by(4)', 'split_pair(2, 1, -1)'],
        { hamCuaEmMoi: [hSplitPair()] }
      ),
      sao: { o: 19, nhip: 20 },
      loiGiaiKhac: {
        moTa: 'Quay sang nấc 6 bằng swing_by(-4) thay vì swing_by(4)',
        baiLam: bai(['split_pair(3, -1, 1)', 'swing_by(-4)', 'split_pair(2, 1, -1)']),
        hamCuaEmMoi: [hSplitPair()]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm split_pair mà đã bấm Chạy', baiLam: bai(['split_pair(3, -1, 1)', 'swing_by(4)', 'split_pair(2, 1, -1)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Dùng n % 2 thay vì n // 2 trong split_pair', baiLam: bai(['split_pair(3, -1, 1)', 'swing_by(4)', 'split_pair(2, 1, -1)']), hamCuaEmMoi: [hSplitPair(['t = n % 2', 'carry_n(t, d1)', 't = n % 2', 'carry_n(t, d2)'])], phaiCoMa: ['chua-xep-chong'] }
      ],
      goiY: ['Luna: Với chồng 3 kiện ở nấc 2, 3 // 2 = 1 kiện sang nấc 1, 1 kiện sang nấc 3, còn dư 1 kiện ở nấc 2.', 'Luna: Với chồng 2 kiện ở nấc 6, 2 // 2 = 1 kiện sang nấc 7, 1 kiện sang nấc 5, còn dư 0 kiện.']
    }),

    manChiaDu({
      so: 7, ten: 'Sửa hàm split_rem(n, d1, d2)', hang: 'bien-the',
      chinhCoDinh: true,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'carry_n'],
      deBai: 'Sola nhờ bạn: hàm split_rem(n, d1, d2) của màn cần chuyển phần nguyên n // 2 kiện sang hướng d1 và phần dư n % 2 kiện sang hướng d2, nhưng hai phép toán đang bị viết ngược. Hãy sửa lại hàm!',
      veMaMau: 'Chương trình chính đã khóa. Mở hàm split_rem của màn và đổi lại thứ tự n // 2 và n % 2.',
      san: SAN_CANG,
      batDau: { x: 3, y: 3, nac: 2, tam: 2 },
      chong: [C(5, 3, [10, 20, 30, 40]), C(1, 3, [50, 60, 70])],
      bongMo: BM([
        { x: 5, y: 3, so: [10, 20] },
        { x: 5, y: 5, so: [40, 30] },
        { x: 1, y: 3, so: [50] },
        { x: 1, y: 1, so: [70] },
        { x: 1, y: 5, so: [60] }
      ]),
      maMau: bai(
        ['split_rem(4, 1, -1)', 'swing_by(4)', 'split_rem(3, 1, -1)'],
        { hamCuaMan: [hSplitRem(T_SPLIT_REM_SAI)] }
      ),
      loiGiai: bai(
        ['split_rem(4, 1, -1)', 'swing_by(4)', 'split_rem(3, 1, -1)'],
        { hamCuaMan: [hSplitRem(T_SPLIT_REM_DUNG)] }
      ),
      sao: { o: 19, nhip: 20 },
      loiGiaiKhac: {
        moTa: 'Gán biến q = n // 2 và r = n % 2 trong thân split_rem',
        baiLam: bai(
          ['split_rem(4, 1, -1)', 'swing_by(4)', 'split_rem(3, 1, -1)'],
          { hamCuaMan: [hSplitRem(['q = n // 2', 'r = n % 2', 'carry_n(q, d1)', 'carry_n(r, d2)'])] }
        )
      },
      loiSai: [
        { moTa: 'Chưa sửa hàm split_rem nên chồng 4 kiện bị chuyển nhầm sang hướng d2', baiLam: bai(['split_rem(4, 1, -1)', 'swing_by(4)', 'split_rem(3, 1, -1)'], { hamCuaMan: [hSplitRem(T_SPLIT_REM_SAI)] }), phaiCoMa: ['chua-xep-chong'] },
        { moTa: 'Cả hai dòng đều dùng n // 2 nên chồng 3 kiện mất kiện cuối cùng', baiLam: bai(['split_rem(4, 1, -1)', 'swing_by(4)', 'split_rem(3, 1, -1)'], { hamCuaMan: [hSplitRem(['t = n // 2', 'carry_n(t, d1)', 't = n // 2', 'carry_n(t, d2)'])] }), phaiCoMa: ['chua-xep-chong'] }
      ],
      goiY: ['Luna: Hai dòng đầu của split_rem phải chuyển phần nguyên: t = n // 2 rồi carry_n(t, d1).', 'Luna: Hai dòng sau của split_rem chuyển phần dư: t = n % 2 rồi carry_n(t, d2).']
    }),

    manChiaDu({
      so: 8, ten: 'Chế hàm haul_to(d, dr)', hang: 'bien-the',
      taoHam: ['haul_to'],
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'reach_by', 'aim_crane'],
      deBai: 'Sola nhờ bạn: chế hàm haul_to(d, dr) gồm pick_up(), aim_crane(d, dr), set_down() để nhấc và chuyển container đổi cả nấc lẫn tầm. Dùng hàm đó rải chồng 3 kiện ở (4, 3) ra 3 bến ở tầm 2.',
      veMaMau: 'Tạo hàm haul_to(d, dr) trong Xưởng hàm rồi chạy vòng for.',
      san: SAN_CANG,
      batDau: { x: 3, y: 3, nac: 2, tam: 1 },
      chong: [C(4, 3, [10, 20, 30])],
      bongMo: BM([{ x: 5, y: 1, so: [30] }, { x: 5, y: 3, so: [20] }, { x: 5, y: 5, so: [10] }]),
      maMau: bai([
        'for d in [-1, 0, 1]:',
        '    haul_to(d, 1)',
        '    aim_crane(-d, -1)'
      ]),
      loiGiai: bai(
        [
          'for d in [-1, 0, 1]:',
          '    haul_to(d, 1)',
          '    aim_crane(-d, -1)'
        ],
        { hamCuaEmMoi: [hHaulTo()] }
      ),
      sao: { o: 22, nhip: 16 },
      loiGiaiKhac: {
        moTa: 'Gọi trực tiếp 3 lần haul_to và 2 lần aim_crane quay về',
        baiLam: bai(['haul_to(-1, 1)', 'aim_crane(1, -1)', 'haul_to(0, 1)', 'aim_crane(0, -1)', 'haul_to(1, 1)']),
        hamCuaEmMoi: [hHaulTo()]
      },
      loiSai: [
        { moTa: 'Chưa tạo hàm haul_to mà đã bấm Chạy', baiLam: bai(['for d in [-1, 0, 1]:', '    haul_to(d, 1)', '    aim_crane(-d, -1)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Truyền nhầm aim_crane(dr, d) trong haul_to', baiLam: bai(['for d in [-1, 0, 1]:', '    haul_to(d, 1)', '    aim_crane(-d, -1)']), hamCuaEmMoi: [hHaulTo(['pick_up()', 'aim_crane(dr, d)', 'set_down()'])], phaiCoMa: ['can-het-tam', 'chua-xep-chong'] }
      ],
      goiY: ['Luna: Hàm haul_to(d, dr) gồm 3 dòng: pick_up(), aim_crane(d, dr), set_down().', 'Luna: Nhớ giữ đúng thứ tự tham số d (nấc) trước, dr (tầm) sau.']
    }),

    manChiaDu({
      so: 9, ten: 'Chia hàng rồi rút phần dư', hang: 'bien-the',
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'reach_by', 'aim_crane', 'carry_by', 'carry_n', 'split_pair', 'haul_to'],
      deBai: 'Sola nhờ bạn: tại nấc 2 tầm 2 (5, 3) và nấc 5 tầm 2 (1, 5) đều có chồng 3 kiện. Ở mỗi chồng, hãy gọi split_pair(3, -1, 1) để chia sang hai nấc kề bên, rồi dùng haul_to(0, -1) rút kiện dư còn lại về tầm 1.',
      veMaMau: 'Đã xử lý xong chồng đầu tiên ở nấc 2. Hãy đưa cần cẩu sang nấc 5 tầm 2 và làm tương tự cho chồng thứ hai.',
      san: SAN_CANG,
      batDau: { x: 3, y: 3, nac: 2, tam: 2 },
      chong: [C(5, 3, [10, 20, 30]), C(1, 5, [40, 50, 60])],
      bongMo: BM([
        { x: 5, y: 1, so: [30] },
        { x: 5, y: 5, so: [20] },
        { x: 4, y: 3, so: [10] },
        { x: 3, y: 5, so: [60] },
        { x: 1, y: 3, so: [50] },
        { x: 2, y: 4, so: [40] }
      ]),
      maMau: bai([
        'split_pair(3, -1, 1)',
        'haul_to(0, -1)'
      ]),
      loiGiai: bai([
        'split_pair(3, -1, 1)',
        'haul_to(0, -1)',
        'aim_crane(3, 1)',
        'split_pair(3, -1, 1)',
        'haul_to(0, -1)'
      ]),
      sao: { o: 32, nhip: 26 },
      loiGiaiKhac: {
        moTa: 'Dùng vòng for lặp 2 lần qua hai chồng hàng',
        baiLam: bai([
          'for i in range(2):',
          '    split_pair(3, -1, 1)',
          '    haul_to(0, -1)',
          '    aim_crane(3, 1)'
        ])
      },
      loiSai: [
        { moTa: 'Mới chia và rút chồng đầu ở nấc 2, chưa xử lý chồng ở nấc 5', baiLam: bai(['split_pair(3, -1, 1)', 'haul_to(0, -1)']), phaiCoMa: ['chua-xep-chong'] },
        { moTa: 'Sau haul_to(0, -1) chỉ gọi swing_by(3) mà quên vươn lại ra tầm 2', baiLam: bai(['split_pair(3, -1, 1)', 'haul_to(0, -1)', 'swing_by(3)', 'split_pair(3, -1, 1)', 'haul_to(0, -1)']), phaiCoMa: ['moc-hut', 'chua-xep-chong'] }
      ],
      goiY: ['Luna: Sau haul_to(0, -1) đầu tiên, cần cẩu đang ở nấc 2 tầm 1.', 'Luna: Gọi aim_crane(3, 1) để sang nấc 5 tầm 2 rồi gọi split_pair(3, -1, 1) và haul_to(0, -1).']
    }),

    manChiaDu({
      so: 10, ten: 'Trùm cuối: Điều phối chia dư hai cảng', hang: 'trum', nhipTheo: 'tong',
      huyHieu: { ma: 'chia-du', ten: 'Huy hiệu Chia lấy phần nguyên, phần dư' },
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'reach_by', 'aim_crane', 'carry_by', 'carry_n', 'split_pair', 'haul_to'],
      deBai: 'Sola nhờ bạn: trùm cuối gói 2! Trên cả hai sân, chồng 3 kiện ở vị trí xuất phát (tầm 2) cần được chia bằng split_pair(3, -1, 1), rút kiện dư về tầm 1 bằng haul_to(0, -1), sau đó sang vị trí lệch (+4 nấc, +1 tầm) chuyển nốt chồng 2 kiện sang nấc kế (+1) bằng carry_n(2, 1).',
      veMaMau: 'Đã có bước chia chồng 3 kiện đầu tiên. Hãy rút kiện dư về tầm 1, sang chồng 2 kiện đối diện và dùng carry_n(2, 1).',
      san: [SAN_CANG, SAN_CANG],
      batDau: [{ x: 3, y: 3, nac: 1, tam: 2 }, { x: 3, y: 3, nac: 2, tam: 2 }],
      chong: [
        [C(5, 1, [10, 20, 30]), C(1, 5, [40, 50])],
        [C(5, 3, [10, 20, 30]), C(1, 3, [40, 50])]
      ],
      bongMo: [
        BM([{ x: 3, y: 1, so: [30] }, { x: 5, y: 3, so: [20] }, { x: 4, y: 2, so: [10] }, { x: 1, y: 3, so: [50, 40] }]),
        BM([{ x: 5, y: 1, so: [30] }, { x: 5, y: 5, so: [20] }, { x: 4, y: 3, so: [10] }, { x: 1, y: 1, so: [50, 40] }])
      ],
      maMau: bai([
        'split_pair(3, -1, 1)',
        'haul_to(0, -1)'
      ]),
      loiGiai: bai([
        'split_pair(3, -1, 1)',
        'haul_to(0, -1)',
        'aim_crane(4, 1)',
        'carry_n(2, 1)'
      ]),
      sao: { o: 31, nhip: 48 },
      loiGiaiKhac: {
        moTa: 'Quay sang chồng đối diện bằng aim_crane(-4, 1)',
        baiLam: bai([
          'split_pair(3, -1, 1)',
          'haul_to(0, -1)',
          'aim_crane(-4, 1)',
          'carry_n(2, 1)'
        ])
      },
      loiSai: [
        { moTa: 'Chưa chuyển chồng 2 kiện ở phía đối diện', baiLam: bai(['split_pair(3, -1, 1)', 'haul_to(0, -1)']), phaiCoMa: ['chua-xep-chong'] },
        { moTa: 'Ở chồng đối diện chỉ gọi carry_by(1) nên còn sót 1 kiện', baiLam: bai(['split_pair(3, -1, 1)', 'haul_to(0, -1)', 'aim_crane(4, 1)', 'carry_by(1)']), phaiCoMa: ['chua-xep-chong'] }
      ],
      goiY: ['Luna: Sau haul_to(0, -1), gọi aim_crane(4, 1) để tới chồng 2 kiện phía đối diện ở tầm 2.', 'Luna: Gọi carry_n(2, 1) để chuyển cả 2 kiện sang nấc kế bên.']
    })
  ];

  ManHoc.manMocCau = DS;
  if (laNode) module.exports = DS;
})();
