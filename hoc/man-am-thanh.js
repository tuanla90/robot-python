/* ============================================================================
   man-am-thanh.js — Mùa 8 (Hang động đá vôi) · Gói 3: Cảm biến âm thanh
   Chương 1: am-thanh (10 màn) — Lắng nghe tiếng vang (hear, chuongDa)
   Chương 2: che-am-thanh (10 màn) — Chế lệnh: dò sóng âm
   ========================================================================== */
(function () {
  'use strict';

  var M = (typeof window !== 'undefined' && window.ManHoc) ||
    (typeof require === 'function' ? require('./man-chuoi-1.js') : null);

  var GOC_AM_THANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'beat', 'hear'];

  function bai(chinh, ham, moi) {
    return { chinh: chinh, hamCuaMan: ham || [], hamCuaEmMoi: moi || [] };
  }
  function ham(ten, than, thamSo) {
    return { ten: ten, than: than, thamSo: thamSo || [] };
  }

  function manAmThanh(so, hang, ds) {
    return Object.assign({
      chuong: 'am-thanh', so: so, hang: hang,
      vo: 'hang', loaiRobot: 'gai',
      robot: { than: 'gai', tay: 'loa', camBien: [{ ma: 'am-thanh', o: 'tren' }] },
      hamGoc: GOC_AM_THANH.slice(),
      hamCuaEmCan: [],
      taoHam: [],
      bienDem: true,
      cauTruc: ['for', 'if', 'while'],
      khung: { chinh: 10, moiHam: 10, cauTruc: ['for', 'if', 'while'] },
      mucTieu: 'toi-co'
    }, ds);
  }

  function manCheAmThanh(so, hang, ds) {
    return Object.assign({
      chuong: 'che-am-thanh', so: so, hang: hang,
      vo: 'hang', loaiRobot: 'gai',
      robot: { than: 'gai', tay: 'loa', camBien: [{ ma: 'am-thanh', o: 'tren' }] },
      hamGoc: GOC_AM_THANH.slice(),
      hamCuaEmCan: [],
      taoHam: [],
      bienDem: true,
      cauTruc: ['for', 'if', 'while', 'return', 'list'],
      khung: { chinh: 12, moiHam: 10, cauTruc: ['for', 'if', 'while', 'return', 'list'] },
      mucTieu: 'toi-co'
    }, ds);
  }

  var DS = [
    /* ========================================================================
       CHƯƠNG 1: am-thanh — Lắng nghe tiếng vang (10 màn)
       ====================================================================== */
    manAmThanh(1, 'lam-quen', {
      ten: 'Lắng nghe chuông đá',
      chiChay: true, chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward'],
      deBai: 'R1 vừa lắp cảm biến âm thanh trên đỉnh đầu. Lệnh hear() trả về số bước từ R1 tới chuông đá gần nhất trong tầm vang. Bấm Chạy để xem R1 tự đo khoảng cách và đi tới cờ.',
      veMaMau: 'n = hear() lưu khoảng cách tới chuông đá ở ô cờ vào n, rồi forward(n) đưa R1 đi đúng số bước đó.',
      san: ['#######', '#.IIIF#', '#######'],
      batDau: { x: 1, y: 1, huong: 1 },
      chuongDa: [{ x: 5, y: 1, not: 1, phamVi: 8 }],
      maMau: bai(['n = hear()', 'forward(n)']),
      loiGiai: bai(['n = hear()', 'forward(n)']),
      sao: { o: 7, nhip: 4 },
      goiY: [
        'Bấm nút Chạy để quan sát hear() trả về khoảng cách tới chuông đá.',
        'Màn 1 chỉ cần chạy thử, chưa cần sửa mã.'
      ]
    }),

    manAmThanh(2, 'lam-quen', {
      ten: 'Hai hầm khác độ dài',
      hamCuaEmCan: ['move', 'forward'],
      deBai: 'Có 2 đường hầm dài ngắn khác nhau, nhưng cuối mỗi hầm đều có chuông đá tại ô cờ. Hãy dùng hear() để đi thẳng tới cờ ở cả 2 sân.',
      veMaMau: 'Mã mẫu dùng số cứng 3 nên chỉ tới cờ ở sân 1 và dừng thiếu ở sân 2.',
      san: [
        ['######', '#.IIF#', '######'],
        ['#########', '#.IIIIIF#', '#########']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [{ x: 4, y: 1, not: 1, phamVi: 8 }],
        [{ x: 7, y: 1, not: 1, phamVi: 8 }]
      ],
      maMau: bai(['forward(3)']),
      loiGiai: bai(['forward(hear())']),
      loiSai: [
        { moTa: 'Giữ nguyên forward(3): sân 2 dừng thiếu trước cờ', baiLam: bai(['forward(3)']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 6, nhip: 6 },
      goiY: [
        'Đổi forward(3) thành forward(hear()).',
        'Khi dùng hear(), R1 tự đo đúng số bước ở cả 2 sân.'
      ]
    }),

    manAmThanh(3, 'lam-quen', {
      ten: 'Chuông đá ở góc cua',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'spike_step'],
      deBai: 'Chuông đá đặt ngay tại góc rẽ phải. Ở cả 2 sân, sau khi rẽ phải tại chuông đá, cờ đều cách đúng 2 bước về phía Nam.',
      veMaMau: 'Mã mẫu chưa rẽ phải và đi nốt 2 bước tới cờ.',
      san: [
        ['######', '#.II.#', '####I#', '####F#', '######'],
        ['########', '#.IIII.#', '######I#', '######F#', '########']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [{ x: 4, y: 1, not: 2, phamVi: 8 }],
        [{ x: 6, y: 1, not: 2, phamVi: 8 }]
      ],
      maMau: bai(['forward(hear())']),
      loiGiai: bai(['spike_step(hear())', 'forward(2)']),
      loiSai: [
        { moTa: 'Chưa rẽ phải và đi xuống cờ', baiLam: bai(['forward(hear())']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 11, nhip: 8 },
      goiY: [
        'Dùng spike_step(hear()) để đi tới chuông đá ở góc cua và rẽ phải.',
        'Sau đó gọi forward(2) để tới cờ.'
      ]
    }),

    manAmThanh(4, 'lam-quen', {
      ten: 'Hai trạm chuông vang',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'spike_step'],
      deBai: 'Khi R1 đứng ngay trên một chuông đá, hear() sẽ bỏ qua chuông dưới chân và lắng nghe chuông đá tiếp theo. Hãy dùng tính chất này để đi qua góc rẽ tới cờ ở cả 2 sân.',
      veMaMau: 'Mã mẫu mới đi hết chặng thứ nhất và rẽ phải tại chuông đầu tiên.',
      san: [
        ['######', '#.II.#', '####I#', '####F#', '######'],
        ['########', '#.IIII.#', '######I#', '######I#', '######F#', '########']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [{ x: 4, y: 1, not: 1, phamVi: 8 }, { x: 4, y: 3, not: 3, phamVi: 3 }],
        [{ x: 6, y: 1, not: 1, phamVi: 8 }, { x: 6, y: 4, not: 3, phamVi: 3 }]
      ],
      maMau: bai(['spike_step(hear())']),
      loiGiai: bai(['spike_step(hear())', 'forward(hear())']),
      loiSai: [
        { moTa: 'Mới đi hết chặng đầu tiên', baiLam: bai(['spike_step(hear())']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 11, nhip: 9 },
      goiY: [
        'Chuông thứ hai ở ô cờ có tầm vang 3 bước nên khi đứng ở góc rẽ, hear() đo đúng khoảng cách tới cờ.',
        'Thêm forward(hear()) ở dòng thứ hai.'
      ]
    }),

    manAmThanh(5, 'luyen', {
      ten: 'Chế lệnh: tiến theo tiếng vang',
      taoHam: ['go_echo'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward'],
      deBai: 'Chế tạo hàm go_echo() không tham số: đo khoảng cách bằng hear() rồi tiến thẳng bấy nhiêu bước bằng forward(hear()).',
      veMaMau: 'Chương trình chính đã gọi go_echo() cố định. Em hãy viết phần thân hàm go_echo().',
      san: [
        ['#######', '#.IIIF#', '#######'],
        ['#########', '#.IIIIIF#', '#########']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [{ x: 5, y: 1, not: 1, phamVi: 8 }],
        [{ x: 7, y: 1, not: 1, phamVi: 8 }]
      ],
      maMau: bai(['go_echo()']),
      loiGiai: bai(['go_echo()'], [], [ham('go_echo', ['forward(hear())'])]),
      loiSai: [
        { moTa: 'Chưa tạo hàm go_echo', baiLam: bai(['go_echo()']), phaiCoMa: ['ham-chua-co'] }
      ],
      sao: { o: 7, nhip: 6 },
      goiY: [
        'Trong thân hàm go_echo(), viết forward(hear()).',
        'Hàm này sẽ mở khóa trong mục Hàm của em cho các màn sau.'
      ]
    }),

    manAmThanh(6, 'luyen', {
      ten: 'Lần theo tiếng vang đôi',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'go_echo'],
      deBai: 'Dùng hàm go_echo() vừa chế để đi tới góc rẽ, xoay phải, rồi gọi go_echo() lần nữa để tới cờ ở cả 2 sân.',
      veMaMau: 'Mã mẫu mới đi tới chuông thứ nhất và rẽ phải.',
      san: [
        ['#######', '#.III.#', '#####I#', '#####I#', '#####F#', '#######'],
        ['#########', '#.IIIII.#', '#######I#', '#######F#', '#########']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [{ x: 5, y: 1, not: 1, phamVi: 8 }, { x: 5, y: 4, not: 2, phamVi: 3 }],
        [{ x: 7, y: 1, not: 1, phamVi: 8 }, { x: 7, y: 3, not: 2, phamVi: 3 }]
      ],
      maMau: bai(['go_echo()', 'turn_right()']),
      loiGiai: bai(['go_echo()', 'turn_right()', 'go_echo()']),
      loiSai: [
        { moTa: 'Chưa gọi go_echo() lần thứ hai sau khi rẽ phải', baiLam: bai(['go_echo()', 'turn_right()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 11, nhip: 9 },
      goiY: [
        'Sau turn_right(), gọi thêm go_echo() để đi tới chuông thứ hai tại ô cờ.'
      ]
    }),

    manAmThanh(7, 'luyen', {
      ten: 'Chế lệnh: vang âm rẽ góc',
      taoHam: ['echo_turn'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'go_echo'],
      deBai: 'Chế tạo hàm echo_turn() không tham số: gọi go_echo() để đi tới chuông đá ở góc cua rồi turn_right().',
      veMaMau: 'Chương trình chính gọi echo_turn() rồi go_echo(). Hãy hoàn thiện thân hàm echo_turn().',
      san: [
        ['######', '#.II.#', '####I#', '####I#', '####F#', '######'],
        ['########', '#.IIII.#', '######I#', '######F#', '########']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [{ x: 4, y: 1, not: 1, phamVi: 8 }, { x: 4, y: 4, not: 2, phamVi: 3 }],
        [{ x: 6, y: 1, not: 1, phamVi: 8 }, { x: 6, y: 3, not: 2, phamVi: 3 }]
      ],
      maMau: bai(['echo_turn()', 'go_echo()']),
      loiGiai: bai(['echo_turn()', 'go_echo()'], [], [ham('echo_turn', ['go_echo()', 'turn_right()'])]),
      loiSai: [
        { moTa: 'Quên gọi turn_right() trong echo_turn', baiLam: bai(['echo_turn()', 'go_echo()']), hamCuaEmMoi: [ham('echo_turn', ['go_echo()'])], phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 12, nhip: 8 },
      goiY: [
        'Trong echo_turn(), gọi go_echo() ở dòng 1 và turn_right() ở dòng 2.'
      ]
    }),

    manAmThanh(8, 'bien-the', {
      ten: 'Vừa đi vừa gõ theo vang',
      mucTieu: 'choi-dieu', dieuToiCo: true,
      dieu: ['xxx', 'xxxxx'],
      hamCuaEmCan: ['move', 'forward', 'march_beat', 'go_echo'],
      deBai: 'Trong hầm này có giai điệu cần gõ mỗi bước đi tới chuông đá. Hãy đo số bước bằng hear() rồi gọi march_beat(...) để vừa tiến vừa phát xung âm ở cả 2 sân.',
      veMaMau: 'Mã mẫu chỉ dùng go_echo() nên không phát xung âm theo giai điệu.',
      san: [
        ['######', '#.IIF#', '######'],
        ['########', '#.IIIIF#', '########']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [{ x: 4, y: 1, not: 1, phamVi: 8 }],
        [{ x: 6, y: 1, not: 1, phamVi: 8 }]
      ],
      maMau: bai(['go_echo()']),
      loiGiai: bai(['march_beat(hear())']),
      loiSai: [
        { moTa: 'Dùng go_echo() mà không gõ trống', baiLam: bai(['go_echo()']), phaiCoMa: ['chua-du-dieu'] }
      ],
      sao: { o: 6, nhip: 5 },
      goiY: [
        'Thay go_echo() bằng march_beat(hear()).',
        'march_beat(n) vừa tiến n bước vừa gõ beat() mỗi bước.'
      ]
    }),

    manAmThanh(9, 'bien-the', {
      ten: 'Chế lệnh: hành quân theo vang',
      taoHam: ['echo_beat'], chinhCoDinh: true,
      mucTieu: 'choi-dieu', dieuToiCo: true,
      dieu: ['xxx', 'xx'],
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'march_beat', 'go_echo', 'echo_turn'],
      deBai: 'Chế tạo hàm echo_beat() không tham số: gọi march_beat(hear()) để tiến tới chuông đá đồng thời gõ nhịp mỗi bước.',
      veMaMau: 'Chương trình chính gọi echo_turn() rồi echo_beat(). Hãy hoàn thiện thân hàm echo_beat().',
      san: [
        ['######', '#.II.#', '####I#', '####I#', '####F#', '######'],
        ['########', '#.IIII.#', '######I#', '######F#', '########']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [{ x: 4, y: 1, not: 1, phamVi: 8 }, { x: 4, y: 4, not: 2, phamVi: 3 }],
        [{ x: 6, y: 1, not: 1, phamVi: 8 }, { x: 6, y: 3, not: 2, phamVi: 2 }]
      ],
      maMau: bai(['echo_turn()', 'echo_beat()']),
      loiGiai: bai(['echo_turn()', 'echo_beat()'], [], [ham('echo_beat', ['march_beat(hear())'])]),
      loiSai: [
        { moTa: 'Trong echo_beat gọi go_echo() thay vì march_beat(hear())', baiLam: bai(['echo_turn()', 'echo_beat()']), hamCuaEmMoi: [ham('echo_beat', ['go_echo()'])], phaiCoMa: ['chua-du-dieu'] }
      ],
      sao: { o: 18, nhip: 8 },
      goiY: [
        'Trong thân hàm echo_beat(), viết march_beat(hear()).'
      ]
    }),

    manAmThanh(10, 'trum', {
      ten: 'Trùm Cảm biến âm thanh: Vòm đá vọng âm',
      nhipTheo: 'tong',
      mucTieu: 'choi-dieu', dieuToiCo: true,
      dieu: ['xx', 'xxx'],
      huyHieu: { ma: 'am-thanh', ten: 'Huy hiệu Lắng nghe tiếng vang' },
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'march_beat', 'go_echo', 'echo_turn', 'echo_beat'],
      deBai: 'Thử thách Trùm Cảm biến âm thanh trên 2 sân: đi qua 2 góc cua có đặt chuông đá bằng echo_turn(), sau đó gõ nhịp về đích bằng echo_beat().',
      veMaMau: 'Mã mẫu mới đi qua góc cua đầu tiên.',
      san: [
        ['#######', '#.III.#', '#####I#', '#####I#', '###FI.#', '#######'],
        ['#########', '#.IIIII.#', '#######I#', '#######I#', '####FII.#', '#########']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [
          { x: 5, y: 1, not: 1, phamVi: 8 },
          { x: 5, y: 4, not: 2, phamVi: 3 },
          { x: 3, y: 4, not: 3, phamVi: 2 }
        ],
        [
          { x: 7, y: 1, not: 1, phamVi: 8 },
          { x: 7, y: 4, not: 2, phamVi: 3 },
          { x: 4, y: 4, not: 3, phamVi: 3 }
        ]
      ],
      maMau: bai(['echo_turn()']),
      loiGiai: bai(['echo_turn()', 'echo_turn()', 'echo_beat()']),
      loiSai: [
        { moTa: 'Mới đi qua một góc cua', baiLam: bai(['echo_turn()']), phaiCoMa: ['chua-du-dieu'] }
      ],
      sao: { o: 19, nhip: 25 },
      goiY: [
        'Gọi echo_turn() 2 lần cho 2 góc rẽ phải.',
        'Cuối cùng gọi echo_beat() để vừa tiến về cờ vừa khớp giai điệu.'
      ]
    }),

    /* ========================================================================
       CHƯƠNG 2: che-am-thanh — Chế lệnh: dò sóng âm (10 màn)
       ====================================================================== */
    manCheAmThanh(1, 'lam-quen', {
      ten: 'Chế lệnh: bước khi nghe vang',
      taoHam: ['step_if_echo'], chiChay: true, chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward', 'go_echo'],
      deBai: 'Màn mở đầu Chương 2: chế sẵn hàm step_if_echo() kiểm tra nếu nghe thấy chuông đá (hear() > 0) thì gọi go_echo(). Bấm Chạy để xem hàm hoạt động trên 2 sân.',
      veMaMau: 'if hear() > 0: giúp R1 chỉ tiến theo tiếng vang khi có chuông trong tầm nghe.',
      san: [
        ['#######', '#.IIIF#', '#######'],
        ['#########', '#.IIIIIF#', '#########']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [{ x: 5, y: 1, not: 1, phamVi: 8 }],
        [{ x: 7, y: 1, not: 1, phamVi: 8 }]
      ],
      maMau: bai(['step_if_echo()'], [], [ham('step_if_echo', ['if hear() > 0:', '    go_echo()'])]),
      loiGiai: bai(['step_if_echo()'], [], [ham('step_if_echo', ['if hear() > 0:', '    go_echo()'])]),
      sao: { o: 9, nhip: 6 },
      goiY: [
        'Bấm nút Chạy để quan sát step_if_echo() hoạt động và mở khóa hàm.'
      ]
    }),

    manCheAmThanh(2, 'lam-quen', {
      ten: 'Dò vào vùng vang âm',
      hamCuaEmCan: ['move', 'forward', 'go_echo', 'step_if_echo'],
      deBai: 'Chuông đá ở ô cờ chỉ có tầm vang 3 bước nên lúc xuất phát hear() bằng 0. Hãy lặp while hear() == 0: để tiến từng bước move() cho tới khi nghe thấy chuông, rồi gọi go_echo().',
      veMaMau: 'Mã mẫu gọi step_if_echo() ngay lúc hear() == 0 nên R1 đứng yên.',
      san: [
        ['#######', '#.IIIF#', '#######'],
        ['#########', '#.IIIIIF#', '#########']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [{ x: 5, y: 1, not: 1, phamVi: 3 }],
        [{ x: 7, y: 1, not: 1, phamVi: 3 }]
      ],
      maMau: bai(['step_if_echo()']),
      loiGiai: bai(['while hear() == 0:', '    move()', 'go_echo()']),
      loiSai: [
        { moTa: 'Gọi step_if_echo() ngay khi ngoài tầm vang: đứng yên', baiLam: bai(['step_if_echo()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 9, nhip: 6 },
      goiY: [
        'Viết vòng lặp while hear() == 0: với thân move().',
        'Ngay sau vòng lặp, gọi go_echo() để đi nốt tới cờ.'
      ]
    }),

    manCheAmThanh(3, 'lam-quen', {
      ten: 'Chế lệnh: dò tìm tiếng vang',
      taoHam: ['find_echo'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward', 'go_echo'],
      deBai: 'Đóng gói thao tác dò sóng âm thành hàm find_echo(): trong khi hear() == 0 thì move(), sau khi nghe thấy tiếng chuông thì gọi go_echo().',
      veMaMau: 'Chương trình chính đã gọi find_echo(). Em hãy hoàn thiện phần thân hàm find_echo().',
      san: [
        ['########', '#.IIIIF#', '########'],
        ['#########', '#.IIIIIF#', '#########']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [{ x: 6, y: 1, not: 1, phamVi: 3 }],
        [{ x: 7, y: 1, not: 1, phamVi: 2 }]
      ],
      maMau: bai(['find_echo()']),
      loiGiai: bai(['find_echo()'], [], [ham('find_echo', ['while hear() == 0:', '    move()', 'go_echo()'])]),
      loiSai: [
        { moTa: 'Quên gọi go_echo() sau vòng lặp while', baiLam: bai(['find_echo()']), hamCuaEmMoi: [ham('find_echo', ['while hear() == 0:', '    move()'])], phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 10, nhip: 6 },
      goiY: [
        'Sau vòng lặp while hear() == 0: trong hàm find_echo(), thêm lệnh go_echo().'
      ]
    }),

    manCheAmThanh(4, 'lam-quen', {
      ten: 'Dò sóng qua khúc cua',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'go_echo', 'find_echo'],
      deBai: 'Chuông đá ở góc cua có tầm vang ngắn (2 bước) nên cần dò từng bước, còn chuông ở ô cờ vừa đủ tầm nghe từ góc cua. Hãy dùng find_echo() kết hợp turn_right() để đi qua góc cua tới cờ ở cả 2 sân.',
      veMaMau: 'Mã mẫu mới dò tới góc cua và xoay phải.',
      san: [
        ['#######', '#.III.#', '#####I#', '#####I#', '#####F#', '#######'],
        ['#########', '#.IIIII.#', '#######I#', '#######I#', '#######I#', '#######F#', '#########']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [{ x: 5, y: 1, not: 1, phamVi: 2 }, { x: 5, y: 4, not: 2, phamVi: 3 }],
        [{ x: 7, y: 1, not: 1, phamVi: 2 }, { x: 7, y: 5, not: 2, phamVi: 4 }]
      ],
      maMau: bai(['find_echo()', 'turn_right()']),
      loiGiai: bai(['find_echo()', 'turn_right()', 'find_echo()']),
      loiSai: [
        { moTa: 'Chưa gọi find_echo() lần thứ hai sau khi rẽ phải', baiLam: bai(['find_echo()', 'turn_right()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 14, nhip: 11 },
      goiY: [
        'Sau turn_right(), gọi thêm find_echo() một lần nữa để đi tới chuông ở ô cờ.'
      ]
    }),

    manCheAmThanh(5, 'luyen', {
      ten: 'Chế lệnh: chuỗi khúc cua vang',
      taoHam: ['echo_chain'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'go_echo', 'echo_turn'],
      deBai: 'Chế tạo hàm echo_chain(n) nhận số khúc cua n: lặp n lần lệnh echo_turn() để đi qua chuỗi n góc cua có đặt chuông đá.',
      veMaMau: 'Chương trình chính gọi echo_chain(2) rồi go_echo(). Hãy hoàn thiện thân hàm echo_chain(n).',
      san: [
        ['#######', '#.III.#', '#####I#', '#####I#', '###FI.#', '#######'],
        ['#########', '#.IIIII.#', '#######I#', '#######I#', '#######I#', '####FII.#', '#########']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [
          { x: 5, y: 1, not: 1, phamVi: 4 },
          { x: 5, y: 4, not: 2, phamVi: 3 },
          { x: 3, y: 4, not: 3, phamVi: 2 }
        ],
        [
          { x: 7, y: 1, not: 1, phamVi: 6 },
          { x: 7, y: 5, not: 2, phamVi: 4 },
          { x: 4, y: 5, not: 3, phamVi: 3 }
        ]
      ],
      maMau: bai(['echo_chain(2)', 'go_echo()']),
      loiGiai: bai(
        ['echo_chain(2)', 'go_echo()'],
        [],
        [ham('echo_chain', ['for i in range(n):', '    echo_turn()'], ['n'])]
      ),
      loiSai: [
        { moTa: 'Trong echo_chain chỉ gọi go_echo() mà quên rẽ phải', baiLam: bai(['echo_chain(2)', 'go_echo()']), hamCuaEmMoi: [ham('echo_chain', ['for i in range(n):', '    go_echo()'], ['n'])], phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 14, nhip: 15 },
      goiY: [
        'Bên trong for i in range(n):, gọi echo_turn().'
      ]
    }),

    manCheAmThanh(6, 'luyen', {
      ten: 'Vòng xoắn ba trạm chuông',
      mucTieu: 'choi-dieu', dieuToiCo: true,
      dieu: ['xx', 'xxx'],
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'march_beat', 'go_echo', 'echo_turn', 'echo_beat', 'echo_chain'],
      deBai: 'Hành lang xoắn ốc có 2 góc cua gắn chuông đá và kết thúc bằng một đoạn cần gõ nhịp tới chuông thứ ba tại ô cờ. Hãy kết hợp echo_chain(2) và echo_beat().',
      veMaMau: 'Mã mẫu mới truyền 1 vào echo_chain(...) nên thiếu một góc cua.',
      san: [
        ['#######', '#.III.#', '#####I#', '#####I#', '###FI.#', '#######'],
        ['#########', '#.IIIII.#', '#######I#', '#######I#', '####FII.#', '#########']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [
          { x: 5, y: 1, not: 1, phamVi: 8 },
          { x: 5, y: 4, not: 2, phamVi: 3 },
          { x: 3, y: 4, not: 3, phamVi: 2 }
        ],
        [
          { x: 7, y: 1, not: 1, phamVi: 8 },
          { x: 7, y: 4, not: 2, phamVi: 3 },
          { x: 4, y: 4, not: 3, phamVi: 3 }
        ]
      ],
      maMau: bai(['echo_chain(1)', 'echo_beat()']),
      loiGiai: bai(['echo_chain(2)', 'echo_beat()']),
      loiSai: [
        { moTa: 'Để nguyên echo_chain(1): thiếu góc rẽ thứ hai', baiLam: bai(['echo_chain(1)', 'echo_beat()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 20, nhip: 14 },
      goiY: [
        'Sửa echo_chain(1) thành echo_chain(2) rồi giữ nguyên echo_beat().'
      ]
    }),

    manCheAmThanh(7, 'luyen', {
      ten: 'Tra từ điển bằng khoảng cách vang',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'spike_step'],
      deBai: 'Khoảng cách k = hear() tới chuông đá ở góc cua cũng chính là khóa trong từ điển d chỉ số bước cần đi sau khi rẽ phải. Hãy đo k = hear(), gọi spike_step(k), rồi tiến d[k] bước tới cờ.',
      veMaMau: 'Mã mẫu chưa tiến d[k] bước sau khi rẽ phải.',
      san: [
        ['######', '#.II.#', '####I#', '####F#', '######'],
        ['########', '#.IIII.#', '######I#', '######I#', '######F#', '########']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [{ x: 4, y: 1, not: 1, phamVi: 8 }],
        [{ x: 6, y: 1, not: 1, phamVi: 8 }]
      ],
      maMau: bai(['d = {3: 2, 5: 3}', 'k = hear()', 'spike_step(k)']),
      loiGiai: bai(['d = {3: 2, 5: 3}', 'k = hear()', 'spike_step(k)', 'forward(d[k])']),
      loiSai: [
        { moTa: 'Chưa tiến d[k] bước sau khi rẽ phải', baiLam: bai(['d = {3: 2, 5: 3}', 'k = hear()', 'spike_step(k)']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 13, nhip: 9 },
      goiY: [
        'Ở sân 1, hear() trả về 3 và d[3] là 2. Ở sân 2, hear() trả về 5 và d[5] là 3.',
        'Thêm forward(d[k]) ở dòng cuối.'
      ]
    }),

    manCheAmThanh(8, 'bien-the', {
      ten: 'Chế lệnh: lộ trình vang từ điển',
      taoHam: ['echo_route'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'spike_step'],
      deBai: 'Chế tạo hàm echo_route(d) nhận bản đồ từ điển d: lưu k = hear(), gọi spike_step(k) để tới chuông đá và rẽ phải, rồi đi tiếp forward(d[k]) bước.',
      veMaMau: 'Chương trình chính đã khởi tạo d và gọi echo_route(d). Hãy hoàn thiện thân hàm echo_route(d).',
      san: [
        ['######', '#.II.#', '####I#', '####I#', '####F#', '######'],
        ['########', '#.IIII.#', '######I#', '######F#', '########']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [{ x: 4, y: 1, not: 1, phamVi: 8 }],
        [{ x: 6, y: 1, not: 1, phamVi: 8 }]
      ],
      maMau: bai(['d = {3: 3, 5: 2}', 'echo_route(d)']),
      loiGiai: bai(
        ['d = {3: 3, 5: 2}', 'echo_route(d)'],
        [],
        [ham('echo_route', ['k = hear()', 'spike_step(k)', 'forward(d[k])'], ['d'])]
      ),
      loiSai: [
        { moTa: 'Quên gọi forward(d[k]) cuối hàm echo_route', baiLam: bai(['d = {3: 3, 5: 2}', 'echo_route(d)']), hamCuaEmMoi: [ham('echo_route', ['k = hear()', 'spike_step(k)'], ['d'])], phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 14, nhip: 8 },
      goiY: [
        'Trong echo_route(d), viết 3 dòng: k = hear(), spike_step(k), và forward(d[k]).'
      ]
    }),

    manCheAmThanh(9, 'bien-the', {
      ten: 'Lộ trình âm vang kép',
      mucTieu: 'choi-dieu', dieuToiCo: true,
      dieu: ['xx', 'xxx'],
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'spike_step', 'march_beat', 'go_echo', 'echo_beat', 'echo_route'],
      deBai: 'Dùng echo_route(d) để vượt chặng chữ L đầu tiên theo từ điển d, sau đó rẽ phải và gọi echo_beat() để vừa tiến vừa gõ nhịp tới chuông đá cuối cùng ở ô cờ.',
      veMaMau: 'Mã mẫu mới gọi echo_route(d) mà chưa rẽ phải và gọi echo_beat().',
      san: [
        ['######', '#.II.#', '####I#', '####I#', '##FI.#', '######'],
        ['########', '#.IIII.#', '######I#', '######I#', '######I#', '###FII.#', '########']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [{ x: 4, y: 1, not: 1, phamVi: 3 }, { x: 2, y: 4, not: 2, phamVi: 2 }],
        [{ x: 6, y: 1, not: 1, phamVi: 5 }, { x: 3, y: 5, not: 2, phamVi: 3 }]
      ],
      maMau: bai(['d = {3: 3, 5: 4}', 'echo_route(d)']),
      loiGiai: bai(['d = {3: 3, 5: 4}', 'echo_route(d)', 'turn_right()', 'echo_beat()']),
      loiSai: [
        { moTa: 'Chưa rẽ phải và gọi echo_beat() ở chặng cuối', baiLam: bai(['d = {3: 3, 5: 4}', 'echo_route(d)']), phaiCoMa: ['chua-du-dieu'] }
      ],
      sao: { o: 22, nhip: 14 },
      goiY: [
        'Sau echo_route(d), gọi turn_right() để hướng về phía Tây (trái).',
        'Sau đó gọi echo_beat() để tiến tới chuông đá ở ô cờ và khớp giai điệu.'
      ]
    }),

    manCheAmThanh(10, 'trum', {
      ten: 'Trùm Chế tác âm thanh: Bản giao hưởng thạch nhũ',
      nhipTheo: 'tong',
      mucTieu: 'choi-dieu', dieuToiCo: true,
      dieu: ['xx', 'xxx'],
      huyHieu: { ma: 'che-am-thanh', ten: 'Huy hiệu Chế lệnh: dò sóng âm' },
      hamCuaEmCan: ['move', 'forward', 'turn_left', 'turn_right', 'spike_step', 'march_beat', 'go_echo', 'echo_beat', 'find_echo', 'echo_route'],
      deBai: 'Thử thách Trùm Chế tác âm thanh: dò sóng tới góc cua đầu tiên bằng find_echo(), xoay phải rồi tra từ điển bằng echo_route(d), cuối cùng xoay trái bằng turn_left() và gõ nhịp xuống cờ bằng echo_beat().',
      veMaMau: 'Mã mẫu mới dò tới góc cua đầu tiên và xoay phải.',
      san: [
        ['#######', '#.III.#', '#####I#', '#####I#', '###.II#', '###I###', '###F###', '#######'],
        ['#########', '#.IIIII.#', '#######I#', '#######I#', '#######I#', '####.III#', '####I####', '####I####', '####F####', '#########']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [
          { x: 5, y: 1, not: 1, phamVi: 2 },
          { x: 5, y: 4, not: 2, phamVi: 3 },
          { x: 3, y: 6, not: 3, phamVi: 2 }
        ],
        [
          { x: 7, y: 1, not: 1, phamVi: 2 },
          { x: 7, y: 5, not: 2, phamVi: 4 },
          { x: 4, y: 8, not: 3, phamVi: 3 }
        ]
      ],
      maMau: bai(['d = {3: 2, 4: 3}', 'find_echo()', 'turn_right()']),
      loiGiai: bai([
        'd = {3: 2, 4: 3}',
        'find_echo()',
        'turn_right()',
        'echo_route(d)',
        'turn_left()',
        'echo_beat()'
      ]),
      loiSai: [
        { moTa: 'Mới dò tới góc đầu tiên', baiLam: bai(['d = {3: 2, 4: 3}', 'find_echo()', 'turn_right()']), phaiCoMa: ['chua-du-dieu'] }
      ],
      sao: { o: 30, nhip: 33 },
      goiY: [
        'Sau turn_right(), gọi echo_route(d) để đi hết cạnh dọc và cạnh ngang theo từ điển d.',
        'Tiếp tục gọi turn_left() và echo_beat() để vừa tiến xuống phía Nam vừa gõ nhịp tới cờ.'
      ]
    })
  ];

  if (M && M.them) M.manAmThanh = DS;
  if (typeof module !== 'undefined' && module.exports) module.exports = M;
})();
