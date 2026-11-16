/* ============================================================================
   man-am-thanh.js — Mùa 8 Hang động · Gói 3: Cảm biến âm thanh (viết lại 16/11, KE-HOACH-MUA-8.md)
   Chương 1: am-thanh "Nghe tiếng vang" (10 màn): chuông đá chuongDa {x, y, not, phamVi} treo trên trần, tự ngân; hear() là số ô (Manhattan) tới
             nguồn gần nhất trong tầm (chuông đá, đá chuông chưa vỡ), bỏ qua chuông ngay trên đầu, không nghe gì thì 0.
             forward(hear()), rim(hear()), n = hear(), forward(hear() - 1), while hear() == 0, while hear() > 0, đo trước khi phá đá.
   Chương 2: che-am-thanh "Chế lệnh: dò tiếng vang" (10 màn): go_echo() (mùa 9 gọi, giữ thân), wait_echo(), crack_rim(n), echo_spiral().
   Lời: "Giúp Sola với!", gợi ý của Luna, gọi người chơi là "bạn".
   ========================================================================== */
(function () {
  'use strict';

  var M = (typeof window !== 'undefined' && window.ManHoc) ||
    (typeof require === 'function' ? require('./man-chuoi-1.js') : null);

  var GOC_AM_THANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'note', 'beat', 'hear'];
  var ROBOT_AM_THANH = { than: 'gai', tay: 'loa', camBien: [{ ma: 'am-thanh', o: 'tren' }] };

  function bai(chinh, ham, moi) {
    return { chinh: chinh, hamCuaMan: ham || [], hamCuaEmMoi: moi || [] };
  }
  function ham(ten, than, thamSo) {
    return { ten: ten, than: than, thamSo: thamSo || [] };
  }
  function cd(x, y, not, phamVi) { return phamVi ? { x: x, y: y, not: not, phamVi: phamVi } : { x: x, y: y, not: not }; }
  function da(x, y, not, ben) { return { x: x, y: y, not: not, ben: ben || 1 }; }
  function hai(a) { return [a, a]; }

  function manAmThanh(so, hang, ds) {
    return Object.assign({
      chuong: 'am-thanh', so: so, hang: hang,
      vo: 'hang', loaiRobot: 'gai',
      robot: ROBOT_AM_THANH,
      hamGoc: GOC_AM_THANH.slice(),
      hamCuaEmCan: [],
      taoHam: [],
      cauTruc: ['for', 'while'],
      khung: { chinh: 10, moiHam: 8, cauTruc: ['for', 'while'] },
      mucTieu: 'toi-co'
    }, ds);
  }

  function manCheAmThanh(so, hang, ds) {
    return Object.assign({
      chuong: 'che-am-thanh', so: so, hang: hang,
      vo: 'hang', loaiRobot: 'gai',
      robot: ROBOT_AM_THANH,
      hamGoc: GOC_AM_THANH.slice(),
      hamCuaEmCan: [],
      taoHam: [],
      cauTruc: ['for', 'while', 'dict'],
      khung: { chinh: 10, moiHam: 8, cauTruc: ['for', 'while', 'dict'] },
      mucTieu: 'toi-co'
    }, ds);
  }

  var GO_ECHO = ham('go_echo', ['forward(hear())']);
  var WAIT_ECHO = ham('wait_echo', ['while hear() == 0:', '    move()']);
  var CRACK_RIM = ham('crack_rim', ['gap = hear()', 'play_note(n)', 'rim(gap)'], ['n']);
  var ECHO_SPIRAL = ham('echo_spiral', ['while hear() > 0:', '    go_echo()', '    turn_right()']);

  var DS = [
    /* ========================================================================
       CHƯƠNG 1: am-thanh — Nghe tiếng vang
       ====================================================================== */
    manAmThanh(1, 'lam-quen', {
      ten: 'Chuông đá gọi về',
      chiChay: true, chinhCoDinh: true,
      hamCuaEmCan: ['forward'],
      deBai: 'Sola làm mẫu. R1 lắp thêm cảm biến âm thanh trên nóc. Chuông đá treo trên trần hang, tự ngân mãi. hear() là số ô từ R1 tới chuông đá gần nhất. forward(hear()) đi đúng bấy nhiêu ô. Bấm Chạy để xem.',
      veMaMau: 'Chương trình Sola viết sẵn và đã khoá: nghe chuông ở ô cờ rồi đi tới đó.',
      san: [
        '########',
        '#.IIIIF#',
        '########'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      chuongDa: [cd(6, 1, 3)],
      maMau: bai(['forward(hear())']),
      loiGiai: bai(['forward(hear())']),
      sao: { o: 6, nhip: 5 },
      goiY: [
        'Luna: R1 cách chuông 5 ô nên hear() là 5, forward(hear()) thành forward(5).',
        'Luna: hear() không tốn nhịp. Chỉ bánh xe lăn mới tốn nhịp.'
      ]
    }),

    manAmThanh(2, 'lam-quen', {
      ten: 'Mỗi hầm một độ dài',
      hamCuaEmCan: ['forward', 'turn_right'],
      deBai: 'Giúp Sola với! Hai hầm, chuông đá treo ở chỗ rẽ, qua chỗ rẽ là hố sụt. Hầm dài ngắn khác nhau. Một chương trình phải đi đúng cả hai hầm.',
      veMaMau: 'Sola đếm ô ở hầm 1 rồi viết forward(4). Chạy thử: sang hầm 2 R1 rẽ sớm.',
      san: [
        [
          '########',
          '#.III.u#',
          '#####I##',
          '#####F##',
          '########'
        ],
        [
          '##########',
          '#.IIIII.u#',
          '#######I##',
          '#######F##',
          '##########'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      chuongDa: [[cd(5, 1, 2)], [cd(7, 1, 2)]],
      maMau: bai(['forward(4)', 'turn_right()', 'forward(2)']),
      loiGiai: bai(['forward(hear())', 'turn_right()', 'forward(2)']),
      loiSai: [
        { moTa: 'Để forward(4): hầm 2 dài 6 ô, R1 rẽ sớm rồi đâm vách', baiLam: bai(['forward(4)', 'turn_right()', 'forward(2)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Viết forward(6): hầm 1 chỉ dài 4 ô, R1 lăn xuống hố sau chỗ rẽ', baiLam: bai(['forward(6)', 'turn_right()', 'forward(2)']), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 10, nhip: 9 },
      goiY: [
        'Luna: Chuông đá ở ngay chỗ rẽ. hear() đo giùm bạn hầm dài bao nhiêu.',
        'Luna: Đổi forward(4) thành forward(hear()).'
      ]
    }),

    manAmThanh(3, 'lam-quen', {
      ten: 'Nghe chuông kế tiếp',
      hamCuaEmCan: ['forward', 'turn_right'],
      deBai: 'Giúp Sola với! Mỗi chỗ rẽ có một chuông đá. Đứng ngay dưới chuông này, hear() bỏ qua nó và nghe chuông kế tiếp.',
      veMaMau: 'Đoạn thứ hai Sola viết số 2. Chạy thử: hầm 2 đoạn đó dài 3 ô.',
      san: [
        [
          '#######',
          '#.II.u#',
          '####I##',
          '##FI.##',
          '####u##',
          '#######'
        ],
        [
          '#########',
          '#.IIII.u#',
          '######I##',
          '######I##',
          '####FI.##',
          '######u##',
          '#########'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      chuongDa: [[cd(4, 1, 2), cd(4, 3, 5)], [cd(6, 1, 2), cd(6, 4, 5)]],
      maMau: bai(['forward(hear())', 'turn_right()', 'forward(2)', 'turn_right()', 'forward(2)']),
      loiGiai: bai(['forward(hear())', 'turn_right()', 'forward(hear())', 'turn_right()', 'forward(2)']),
      loiSai: [
        { moTa: 'Để forward(2) ở đoạn hai: hầm 2 đoạn đó dài 3 ô, R1 rẽ sớm', baiLam: bai(['forward(hear())', 'turn_right()', 'forward(2)', 'turn_right()', 'forward(2)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Viết forward(3) ở đoạn hai: hầm 1 đoạn đó chỉ dài 2 ô, R1 lăn xuống hố', baiLam: bai(['forward(hear())', 'turn_right()', 'forward(3)', 'turn_right()', 'forward(2)']), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 12, nhip: 12 },
      goiY: [
        'Luna: Tới chuông thứ nhất rồi, hear() nghe chuông thứ hai.',
        'Luna: Đoạn thứ hai cũng là forward(hear()).'
      ]
    }),

    manAmThanh(4, 'luyen', {
      ten: 'Đo một lần, đi hai lần',
      hamCuaEmCan: ['move', 'forward', 'turn_left', 'rim'],
      bienDem: true,
      deBai: 'Giúp Sola với! R1 đi tới chuông, vòng xuống, rồi quay về đúng một quãng dài như lúc đi, tới chỗ rẽ xuống cờ. Ở hàng dưới, chuông đã ở sau lưng. Nhớ số đo vào biến n ngay từ đầu.',
      veMaMau: 'Sola đo lại ở hàng dưới. Chạy thử: lúc đó chuông chỉ cách 2 ô.',
      san: [
        [
          '########',
          '##.II.u#',
          '#####I##',
          '#u.II.##',
          '##F#####',
          '########'
        ],
        [
          '##########',
          '##.IIII.u#',
          '#######I##',
          '#u.IIII.##',
          '##F#######',
          '##########'
        ]
      ],
      batDau: hai({ x: 2, y: 1, huong: 1 }),
      chuongDa: [[cd(5, 1, 6)], [cd(7, 1, 6)]],
      maMau: bai(['n = hear()', 'rim(n)', 'rim(2)', 'forward(hear())', 'turn_left()', 'move()']),
      loiGiai: bai(['n = hear()', 'rim(n)', 'rim(2)', 'forward(n)', 'turn_left()', 'move()']),
      loiSai: [
        { moTa: 'Đo lại ở hàng dưới: chuông chỉ cách 2 ô nên R1 rẽ giữa đường', baiLam: bai(['n = hear()', 'rim(n)', 'rim(2)', 'forward(hear())', 'turn_left()', 'move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Viết forward(5) ở hàng dưới: hầm 1 chỉ dài 3 ô, R1 lăn xuống hố', baiLam: bai(['n = hear()', 'rim(n)', 'rim(2)', 'forward(5)', 'turn_left()', 'move()']), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 17, nhip: 16 },
      goiY: [
        'Luna: n = hear() ghi số đo lúc R1 còn ở đầu hầm. Về sau n vẫn giữ số đó.',
        'Luna: Dòng cuối dùng n: forward(n).'
      ]
    }),

    manAmThanh(5, 'luyen', {
      ten: 'Chuông treo trên hố',
      hamCuaEmCan: ['forward', 'turn_right'],
      deBai: 'Giúp Sola với! Chuông đá treo ngay trên hố sụt. R1 phải dừng trước hố một ô rồi mới rẽ.',
      veMaMau: 'Sola đi thẳng tới chuông. Chạy thử: R1 lăn xuống hố.',
      san: [
        [
          '#######',
          '#.IIu##',
          '###I###',
          '###F###',
          '#######'
        ],
        [
          '#########',
          '#.IIIIu##',
          '#####I###',
          '#####F###',
          '#########'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      chuongDa: [[cd(4, 1, 4)], [cd(6, 1, 4)]],
      maMau: bai(['forward(hear())', 'turn_right()', 'forward(2)']),
      loiGiai: bai(['forward(hear() - 1)', 'turn_right()', 'forward(2)']),
      loiSai: [
        { moTa: 'Đi đủ forward(hear()): R1 lăn xuống hố dưới chuông', baiLam: bai(['forward(hear())', 'turn_right()', 'forward(2)']), phaiCoMa: ['roi-ho'] },
        { moTa: 'Viết forward(2): hầm 2 dài hơn, R1 rẽ sớm', baiLam: bai(['forward(2)', 'turn_right()', 'forward(2)']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 10, nhip: 7 },
      goiY: [
        'Luna: Chuông ở trên hố. Ô cần dừng gần hơn chuông 1 ô.',
        'Luna: forward(hear() - 1).'
      ]
    }),

    manAmThanh(6, 'luyen', {
      ten: 'Chưa nghe thì đi tiếp',
      hamCuaEmCan: ['move', 'forward', 'turn_right'],
      deBai: 'Giúp Sola với! Chuông đá trong ngách này ngân khẽ, chỉ nghe được khi đứng ngay miệng ngách. hear() còn là 0 thì R1 còn đi tiếp.',
      veMaMau: 'Sola viết điều kiện ngược. Chạy thử: vòng lặp không chạy lần nào.',
      san: [
        [
          '#########',
          '#.IIIIII#',
          '##.#I####',
          '####F####',
          '#########'
        ],
        [
          '#########',
          '#.IIIIII#',
          '###.##I##',
          '######F##',
          '#########'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      chuongDa: [[cd(4, 3, 6, 2)], [cd(6, 3, 6, 2)]],
      maMau: bai(['while hear() > 0:', '    move()', 'turn_right()', 'forward(2)']),
      loiGiai: bai(['while hear() == 0:', '    move()', 'turn_right()', 'forward(2)']),
      loiSai: [
        { moTa: 'while hear() > 0: lúc đầu chưa nghe gì nên R1 rẽ ngay, đâm vách', baiLam: bai(['while hear() > 0:', '    move()', 'turn_right()', 'forward(2)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Đếm ô ở hầm 1 rồi viết forward(3): hầm 2 ngách xa hơn', baiLam: bai(['forward(3)', 'turn_right()', 'forward(2)']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 11, nhip: 8 },
      goiY: [
        'Luna: Còn chưa nghe (hear() == 0) thì move(). Nghe thấy rồi là đang đứng ở miệng ngách.',
        'Luna: Đổi > 0 thành == 0.'
      ]
    }),

    manAmThanh(7, 'bien-the', {
      ten: 'Chuỗi chuông xoáy ốc',
      hamCuaEmCan: ['forward', 'rim'],
      deBai: 'Giúp Sola với! Chuông đá treo ở mọi chỗ rẽ, đường cuộn vào trong như vỏ ốc. Còn nghe chuông là còn đi tới chuông rồi rẽ phải. Hầm 1 có năm chuông, hầm 2 có bốn.',
      veMaMau: 'Sola mới viết hai đoạn. Chạy thử: R1 dừng giữa đường.',
      san: [
        [
          '#########',
          '#.IIIII.#',
          '#######I#',
          '###.IF#I#',
          '###I###I#',
          '###I###I#',
          '###.III.#',
          '#########'
        ],
        [
          '########',
          '#.IIII.#',
          '######I#',
          '###F##I#',
          '###I##I#',
          '###.II.#',
          '########'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      chuongDa: [
        [cd(7, 1, 1, 6), cd(7, 6, 3, 5), cd(3, 6, 5, 4), cd(3, 3, 7, 3), cd(5, 3, 8, 2)],
        [cd(6, 1, 1, 5), cd(6, 5, 3, 4), cd(3, 5, 5, 3), cd(3, 3, 7, 2)]
      ],
      maMau: bai(['rim(hear())', 'rim(hear())']),
      loiGiai: bai(['while hear() > 0:', '    rim(hear())']),
      loiSai: [
        { moTa: 'Viết hai lần rim(hear()): còn chuông chưa tới', baiLam: bai(['rim(hear())', 'rim(hear())']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Lặp for 4 lần: hầm 1 có năm chuông', baiLam: bai(['for i in range(4):', '    rim(hear())']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Lặp forward(hear()) mà quên rẽ: R1 đâm vách ở chỗ rẽ đầu', baiLam: bai(['while hear() > 0:', '    forward(hear())']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 11, nhip: 24 },
      goiY: [
        'Luna: while hear() > 0: còn nghe thấy chuông là còn lặp.',
        'Luna: Trong vòng lặp chỉ một dòng: rim(hear()).'
      ]
    }),

    manAmThanh(8, 'bien-the', {
      ten: 'Đo trước khi gõ',
      hamCuaEmCan: ['forward', 'rim'],
      bienDem: true,
      deBai: 'Giúp Sola với! Đá chuông ở chỗ rẽ cũng vang, hear() nghe được nó. Gõ vỡ rồi thì đá hết vang. Đo trước, gõ sau.',
      veMaMau: 'Sola gõ vỡ đá trước rồi mới đo. Chạy thử xem hear() còn nghe gì.',
      san: [
        [
          '#######',
          '#.II.u#',
          '####I##',
          '####I##',
          '####F##',
          '#######'
        ],
        [
          '#########',
          '#.IIII.u#',
          '######I##',
          '######I##',
          '######F##',
          '#########'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      daChuong: [[da(4, 1, 5)], [da(6, 1, 5)]],
      maMau: bai(['note(5)', 'wait()', 'rim(hear())', 'forward(3)']),
      loiGiai: bai(['n = hear()', 'note(5)', 'wait()', 'rim(n)', 'forward(3)']),
      loiSai: [
        { moTa: 'Gõ trước rồi mới đo: đá đã vỡ nên hear() là 0, R1 rẽ ngay chỗ cũ', baiLam: bai(['note(5)', 'wait()', 'rim(hear())', 'forward(3)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Đo rồi đi luôn, quên gõ: R1 đâm vào đá chuông', baiLam: bai(['n = hear()', 'rim(n)', 'forward(3)']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 14, nhip: 10 },
      goiY: [
        'Luna: n = hear() ở dòng đầu, khi đá còn nguyên.',
        'Luna: Gõ note(5), wait() rồi rim(n).'
      ]
    }),

    manAmThanh(9, 'bien-the', {
      ten: 'Dãy đá chuông',
      hamCuaEmCan: ['forward', 'rim'],
      bienDem: true,
      deBai: 'Giúp Sola với! Đá chuông nốt 4 chắn mọi chỗ rẽ. Hầm 1 có ba khối, hầm 2 có hai. Còn nghe đá là còn đo, gõ, đi tới chỗ đá rồi rẽ phải. Hết đá thì đi 2 ô tới cờ.',
      veMaMau: 'Sola chỉ phá một khối. Chạy thử: R1 dừng giữa đường.',
      san: [
        [
          '########',
          '#.IIII.#',
          '######I#',
          '###F##I#',
          '###I##I#',
          '###.II.#',
          '########'
        ],
        [
          '#######',
          '#.III.#',
          '#####I#',
          '#####I#',
          '#####I#',
          '###FI.#',
          '#######'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      daChuong: [[da(6, 1, 4), da(6, 5, 4), da(3, 5, 4)], [da(5, 1, 4), da(5, 5, 4)]],
      maMau: bai(['n = hear()', 'note(4)', 'wait()', 'rim(n)', 'forward(2)']),
      loiGiai: bai(['while hear() > 0:', '    n = hear()', '    note(4)', '    wait()', '    rim(n)', 'forward(2)']),
      loiSai: [
        { moTa: 'Chỉ phá một khối: R1 rẽ ở khối đầu rồi dừng giữa đường', baiLam: bai(['n = hear()', 'note(4)', 'wait()', 'rim(n)', 'forward(2)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Gõ trước rồi mới đo trong vòng lặp: hear() nghe khối xa hơn, R1 đâm vách', baiLam: bai(['while hear() > 0:', '    note(4)', '    wait()', '    rim(hear())', 'forward(2)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Lặp for 3 lần: hầm 2 chỉ có hai khối, lần thứ ba R1 quay tại chỗ rồi đi sai hướng', baiLam: bai(['for i in range(3):', '    n = hear()', '    note(4)', '    wait()', '    rim(n)', 'forward(2)']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 15, nhip: 20 },
      goiY: [
        'Luna: Ba dòng của màn trước đặt vào trong while hear() > 0.',
        'Luna: Hết đá thì hear() là 0, vòng lặp dừng, forward(2) đưa R1 tới cờ.'
      ]
    }),

    manAmThanh(10, 'tong-hop', {
      ten: 'Trùm: hang chuông ngân',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'rim'],
      khung: { chinh: 10, moiHam: 8, cauTruc: ['for', 'while'] },
      deBai: 'Giúp Sola với! Đá chuông nốt 6 chắn ngay đầu hầm. Qua đá là đường tối, ngách có chuông nằm đâu đó bên phải. Từ ngách, chuông đá dẫn đường tới cờ.',
      veMaMau: 'Sola quên đá chuông cũng vang. Chạy thử: R1 rẽ ngay từ đầu.',
      san: [
        [
          '##########',
          '#.I.IIIII#',
          '######I###',
          '######I###',
          '###F##I###',
          '###I##I###',
          '###.II.###',
          '##########'
        ],
        [
          '##########',
          '#..IIIIII#',
          '#######I##',
          '#######I##',
          '###F###I##',
          '###I###I##',
          '###.III.##',
          '##########'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      daChuong: [[da(3, 1, 6)], [da(2, 1, 6)]],
      chuongDa: [
        [cd(6, 6, 2, 5), cd(3, 6, 4, 3), cd(3, 4, 7, 2)],
        [cd(7, 6, 2, 5), cd(3, 6, 4, 4), cd(3, 4, 7, 2)]
      ],
      maMau: bai(['while hear() == 0:', '    move()', 'turn_right()', 'while hear() > 0:', '    rim(hear())']),
      loiGiai: bai(['note(6)', 'wait()', 'while hear() == 0:', '    move()', 'turn_right()', 'while hear() > 0:', '    rim(hear())']),
      loiSai: [
        { moTa: 'Không gõ đá: hear() nghe đá chuông ngay từ đầu nên R1 rẽ luôn, đâm vách', baiLam: bai(['while hear() == 0:', '    move()', 'turn_right()', 'while hear() > 0:', '    rim(hear())']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'note(6) mà thiếu wait(): lúc đo đá chưa vỡ nên R1 rẽ ngay đầu hầm rồi dừng', baiLam: bai(['note(6)', 'while hear() == 0:', '    move()', 'turn_right()', 'while hear() > 0:', '    rim(hear())']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Lặp rim(hear()) đúng 2 lần: hầm 1 còn chuông thứ ba', baiLam: bai(['note(6)', 'wait()', 'while hear() == 0:', '    move()', 'turn_right()', 'for i in range(2):', '    rim(hear())']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 16, nhip: 21 },
      goiY: [
        'Luna: Đá chuông chưa vỡ cũng là tiếng vang. Gõ note(6), wait() trước đã.',
        'Luna: Sau đó: chưa nghe thì move(), tới ngách thì turn_right(), rồi còn nghe thì rim(hear()).'
      ]
    }),


    /* ========================================================================
       CHƯƠNG 2: che-am-thanh — Chế lệnh: dò tiếng vang
       ====================================================================== */
    manCheAmThanh(1, 'lam-quen', {
      ten: 'Chế lệnh: đi theo tiếng vang',
      taoHam: ['go_echo'], chinhCoDinh: true,
      hamCuaEmCan: ['forward', 'turn_right'],
      deBai: 'Giúp Sola với! forward(hear()) lặp lại ở mọi chỗ rẽ. Chế hàm go_echo(): đi tới chuông đá gần nhất. Chương trình chính đã khoá.',
      veMaMau: 'Chương trình chính gọi go_echo() hai lần. Mở Xưởng hàm, chế go_echo().',
      san: [
        [
          '########',
          '#.III.u#',
          '#####I##',
          '#####I##',
          '###FI.##',
          '#####u##',
          '########'
        ],
        [
          '######',
          '#.I.u#',
          '###I##',
          '#FI.##',
          '###u##',
          '######'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      chuongDa: [[cd(5, 1, 2), cd(5, 4, 6)], [cd(3, 1, 2), cd(3, 3, 6)]],
      maMau: bai(['go_echo()', 'turn_right()', 'go_echo()', 'turn_right()', 'forward(2)']),
      loiGiai: bai(['go_echo()', 'turn_right()', 'go_echo()', 'turn_right()', 'forward(2)'], [], [GO_ECHO]),
      loiSai: [
        { moTa: 'Chưa chế hàm go_echo', baiLam: bai(['go_echo()', 'turn_right()', 'go_echo()', 'turn_right()', 'forward(2)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Thân hàm viết forward(3): hầm 2 đoạn đầu chỉ dài 2 ô, R1 lăn xuống hố', baiLam: bai(['go_echo()', 'turn_right()', 'go_echo()', 'turn_right()', 'forward(2)']), hamCuaEmMoi: [ham('go_echo', ['forward(3)'])], phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 13, nhip: 11 },
      goiY: [
        'Luna: Thân go_echo() chỉ một dòng.',
        'Luna: forward(hear()).'
      ]
    }),

    manCheAmThanh(2, 'lam-quen', {
      ten: 'Lặp theo tiếng vang',
      hamCuaEmCan: ['turn_right', 'go_echo'],
      deBai: 'Giúp Sola với! Đường cuộn vào trong, mỗi chỗ rẽ một chuông đá. Hầm 1 có ba chuông, hầm 2 có bốn. Còn nghe thì go_echo() rồi rẽ phải.',
      veMaMau: 'Sola viết hai lần. Chạy thử: R1 dừng giữa đường.',
      san: [
        [
          '#######',
          '#.III.#',
          '#####I#',
          '#####I#',
          '###FI.#',
          '#######'
        ],
        [
          '#########',
          '#.IIIII.#',
          '#######I#',
          '####F##I#',
          '####I##I#',
          '####.II.#',
          '#########'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      chuongDa: [
        [cd(5, 1, 1, 4), cd(5, 4, 3, 3), cd(3, 4, 5, 2)],
        [cd(7, 1, 1, 6), cd(7, 5, 3, 4), cd(4, 5, 5, 3), cd(4, 3, 8, 2)]
      ],
      maMau: bai(['go_echo()', 'turn_right()', 'go_echo()', 'turn_right()']),
      loiGiai: bai(['while hear() > 0:', '    go_echo()', '    turn_right()']),
      loiSai: [
        { moTa: 'Viết hai lần: còn chuông chưa tới', baiLam: bai(['go_echo()', 'turn_right()', 'go_echo()', 'turn_right()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Lặp for 3 lần: hầm 2 có bốn chuông', baiLam: bai(['for i in range(3):', '    go_echo()', '    turn_right()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'while hear() == 0: lúc đầu đã nghe chuông nên vòng lặp không chạy', baiLam: bai(['while hear() == 0:', '    go_echo()', '    turn_right()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 11, nhip: 18 },
      goiY: [
        'Luna: while hear() > 0: rồi hai dòng thụt vào.',
        'Luna: go_echo() rồi turn_right().'
      ]
    }),

    manCheAmThanh(3, 'lam-quen', {
      ten: 'Chế lệnh: đi tới khi nghe',
      taoHam: ['wait_echo'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'turn_right', 'go_echo'],
      deBai: 'Giúp Sola với! Chuông trong ngách ngân khẽ, phải tới miệng ngách mới nghe. Chế hàm wait_echo(): còn chưa nghe thì đi tiếp. Chương trình chính đã khoá.',
      veMaMau: 'Chương trình chính gọi wait_echo(), rẽ phải, rồi go_echo(). Mở Xưởng hàm, chế wait_echo().',
      san: [
        [
          '#########',
          '#.IIIIII#',
          '###I#.###',
          '###F#####',
          '#########'
        ],
        [
          '#########',
          '#.IIIIII#',
          '##.###I##',
          '######F##',
          '#########'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      chuongDa: [[cd(3, 3, 4, 2)], [cd(6, 3, 4, 2)]],
      maMau: bai(['wait_echo()', 'turn_right()', 'go_echo()']),
      loiGiai: bai(['wait_echo()', 'turn_right()', 'go_echo()'], [], [WAIT_ECHO]),
      loiSai: [
        { moTa: 'Chưa chế hàm wait_echo', baiLam: bai(['wait_echo()', 'turn_right()', 'go_echo()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Thân hàm viết while hear() > 0: lúc đầu chưa nghe nên R1 không đi', baiLam: bai(['wait_echo()', 'turn_right()', 'go_echo()']), hamCuaEmMoi: [ham('wait_echo', ['while hear() > 0:', '    move()'])], phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 13, nhip: 8 },
      goiY: [
        'Luna: Thân wait_echo() giống vòng lặp ở màn "Chưa nghe thì đi tiếp".',
        'Luna: while hear() == 0: rồi move() thụt vào.'
      ]
    }),

    manCheAmThanh(4, 'luyen', {
      ten: 'Ngách sâu dẫn đường',
      hamCuaEmCan: ['turn_right', 'go_echo', 'wait_echo'],
      deBai: 'Giúp Sola với! Đi dọc hầm tới khi nghe chuông ngách. Rẽ vào ngách, rồi các chuông đá dẫn tới cờ. Mỗi hầm số chuông khác nhau.',
      veMaMau: 'Sola nối tay từng đoạn. Chạy thử: R1 dừng giữa đường.',
      san: [
        [
          '#########',
          '#.IIIIII#',
          '#####I###',
          '#####I###',
          '##F##I###',
          '##I##I###',
          '##.II.###',
          '#########'
        ],
        [
          '#########',
          '#.IIIIII#',
          '######I##',
          '######I##',
          '##F###I##',
          '##I###I##',
          '##.III.##',
          '#########'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      chuongDa: [
        [cd(5, 6, 2, 5), cd(2, 6, 4, 3), cd(2, 4, 6, 2)],
        [cd(6, 6, 2, 5), cd(2, 6, 4, 4), cd(2, 4, 6, 2)]
      ],
      maMau: bai(['wait_echo()', 'turn_right()', 'go_echo()', 'turn_right()', 'go_echo()']),
      loiGiai: bai(['wait_echo()', 'turn_right()', 'while hear() > 0:', '    go_echo()', '    turn_right()']),
      loiSai: [
        { moTa: 'Nối tay hai đoạn: còn chuông cuối chưa tới', baiLam: bai(['wait_echo()', 'turn_right()', 'go_echo()', 'turn_right()', 'go_echo()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên rẽ vào ngách: R1 đi tiếp dọc hầm, đâm vách', baiLam: bai(['wait_echo()', 'while hear() > 0:', '    go_echo()', '    turn_right()']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 15, nhip: 19 },
      goiY: [
        'Luna: wait_echo() đưa R1 tới miệng ngách. turn_right() để quay vào ngách.',
        'Luna: Rồi lặp như màn "Lặp theo tiếng vang".'
      ]
    }),

    manCheAmThanh(5, 'luyen', {
      ten: 'Chế lệnh: đo, gõ, đi',
      taoHam: ['crack_rim'], chinhCoDinh: true,
      bienDem: true,
      hamCuaEmCan: ['forward', 'rim', 'play_note'],
      deBai: 'Giúp Sola với! Đá chuông chắn mọi chỗ rẽ, qua chỗ rẽ là hố sụt. Chế hàm crack_rim(n): đo đá bằng hear(), gõ nốt n, đi tới chỗ đá rồi rẽ phải. Chương trình chính đã khoá.',
      veMaMau: 'Chương trình chính gọi crack_rim(4), crack_rim(7) rồi forward(2). Mở Xưởng hàm, chế crack_rim(n).',
      san: [
        [
          '#######',
          '#.II.u#',
          '####I##',
          '####I##',
          '##FI.##',
          '####u##',
          '#######'
        ],
        [
          '#########',
          '#.IIII.u#',
          '######I##',
          '####FI.##',
          '######u##',
          '#########'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      daChuong: [[da(4, 1, 4), da(4, 4, 7)], [da(6, 1, 4), da(6, 3, 7)]],
      maMau: bai(['crack_rim(4)', 'crack_rim(7)', 'forward(2)']),
      loiGiai: bai(['crack_rim(4)', 'crack_rim(7)', 'forward(2)'], [], [CRACK_RIM]),
      loiSai: [
        { moTa: 'Chưa chế hàm crack_rim', baiLam: bai(['crack_rim(4)', 'crack_rim(7)', 'forward(2)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Gõ trước rồi mới đo: hear() nghe khối sau, R1 đi quá chỗ rẽ, lăn xuống hố', baiLam: bai(['crack_rim(4)', 'crack_rim(7)', 'forward(2)']), hamCuaEmMoi: [ham('crack_rim', ['play_note(n)', 'rim(hear())'], ['n'])], phaiCoMa: ['roi-ho'] },
        { moTa: 'Viết rim(3) thay cho số đo: hầm 2 đoạn đầu dài 5 ô', baiLam: bai(['crack_rim(4)', 'crack_rim(7)', 'forward(2)']), hamCuaEmMoi: [ham('crack_rim', ['play_note(n)', 'rim(3)'], ['n'])], phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 17, nhip: 13 },
      goiY: [
        'Luna: Ba dòng: gap = hear(), play_note(n), rim(gap).',
        'Luna: Đo trước khi gõ, vì đá vỡ rồi thì hết vang.'
      ]
    }),

    manCheAmThanh(6, 'luyen', {
      ten: 'Sổ nốt của từng hầm',
      hamCuaEmCan: ['forward', 'crack_rim'],
      khoaTD: ['dau', 'giua', 'cuoi'],
      duLieuSan: ['notes = {"dau": 5, "giua": 2, "cuoi": 7}', 'notes = {"dau": 3, "giua": 6}'],
      deBai: 'Giúp Sola với! Luna ghi nốt các khối đá chuông vào sổ notes, mỗi hầm một sổ. Hầm 1 ba khối, hầm 2 hai khối. Đi hết sổ, mỗi dòng một lần crack_rim, rồi forward(2) tới cờ.',
      veMaMau: 'Sola chép tay nốt của hầm 1. Chạy thử: sang hầm 2 sổ khác.',
      san: [
        [
          '#######',
          '#.III.#',
          '#####I#',
          '###F#I#',
          '###I#I#',
          '###.I.#',
          '#######'
        ],
        [
          '#########',
          '#.IIIII.#',
          '#######I#',
          '#######I#',
          '#####FI.#',
          '#########'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      daChuong: [[da(5, 1, 5), da(5, 5, 2), da(3, 5, 7)], [da(7, 1, 3), da(7, 4, 6)]],
      maMau: bai(['notes = {"dau": 5, "giua": 2, "cuoi": 7}', 'crack_rim(5)', 'crack_rim(2)', 'crack_rim(7)', 'forward(2)']),
      loiGiai: bai(['notes = {"dau": 5, "giua": 2, "cuoi": 7}', 'for k in notes:', '    crack_rim(notes[k])', 'forward(2)']),
      loiSai: [
        { moTa: 'Chép tay nốt hầm 1: đá đầu hầm 2 là nốt 3, không vỡ', baiLam: bai(['notes = {"dau": 5, "giua": 2, "cuoi": 7}', 'crack_rim(5)', 'crack_rim(2)', 'crack_rim(7)', 'forward(2)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Đọc từng khoá: sổ hầm 2 không có "cuoi" nên chương trình dừng', baiLam: bai(['notes = {"dau": 5, "giua": 2, "cuoi": 7}', 'crack_rim(notes["dau"])', 'crack_rim(notes["giua"])', 'crack_rim(notes["cuoi"])', 'forward(2)']), phaiCoMa: ['loi-chay'] }
      ],
      sao: { o: 18, nhip: 18 },
      goiY: [
        'Luna: for k in notes: đi qua từng khoá của sổ.',
        'Luna: Trong vòng lặp: crack_rim(notes[k]).'
      ]
    }),

    manCheAmThanh(7, 'bien-the', {
      ten: 'Sửa hàm đo đá',
      suaHam: ['crack_rim'], chinhCoDinh: true,
      bienDem: true,
      hamCuaEmCan: ['rim', 'play_note', 'go_echo', 'crack_rim'],
      deBai: 'Giúp Sola với! Ai đó đổi thứ tự trong crack_rim(n): gõ trước, đo sau. Đá vỡ rồi thì hear() nghe sang chỗ khác. Sửa lại hàm. Chương trình chính đã khoá.',
      veMaMau: 'Mở crack_rim(n) trong Xưởng hàm. Chạy thử: R1 đi quá chỗ rẽ.',
      san: [
        [
          '########',
          '#.III.u#',
          '#####I##',
          '###FI.##',
          '#####u##',
          '########'
        ],
        [
          '######',
          '#.I.u#',
          '###I##',
          '###I##',
          '###I##',
          '#FI.##',
          '###u##',
          '######'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      daChuong: [[da(5, 1, 6), da(5, 3, 3)], [da(3, 1, 6), da(3, 5, 3)]],
      chuongDa: [[cd(3, 3, 1, 2)], [cd(1, 5, 1, 2)]],
      maMau: bai(['crack_rim(6)', 'crack_rim(3)', 'go_echo()'], [], [ham('crack_rim', ['play_note(n)', 'gap = hear()', 'rim(gap)'], ['n'])]),
      loiGiai: bai(['crack_rim(6)', 'crack_rim(3)', 'go_echo()'], [], [CRACK_RIM]),
      loiSai: [
        { moTa: 'Không sửa: đo sau khi đá vỡ, R1 đi quá chỗ rẽ, lăn xuống hố', baiLam: bai(['crack_rim(6)', 'crack_rim(3)', 'go_echo()']), hamCuaEmMoi: [ham('crack_rim', ['play_note(n)', 'gap = hear()', 'rim(gap)'], ['n'])], phaiCoMa: ['roi-ho'] },
        { moTa: 'Bỏ hẳn dòng đo, viết rim(4): hầm 2 đoạn đầu chỉ dài 2 ô', baiLam: bai(['crack_rim(6)', 'crack_rim(3)', 'go_echo()']), hamCuaEmMoi: [ham('crack_rim', ['play_note(n)', 'rim(4)'], ['n'])], phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 18, nhip: 12 },
      goiY: [
        'Luna: Dòng gap = hear() phải đứng trước play_note(n).',
        'Luna: Kéo dòng đo lên đầu hàm.'
      ]
    }),

    manCheAmThanh(8, 'bien-the', {
      ten: 'Đá chuông trong ngách',
      hamCuaEmCan: ['turn_right', 'go_echo', 'wait_echo', 'crack_rim'],
      deBai: 'Giúp Sola với! Ngách có đá chuông nốt 6, chỉ nghe thấy ở miệng ngách. Phá đá xong, chuông đá dẫn tới cờ.',
      veMaMau: 'Sola quên đá còn nguyên. Chạy thử: R1 đâm vào đá.',
      san: [
        [
          '#########',
          '#.IIIIII#',
          '####I####',
          '####I####',
          '##FI.####',
          '#########'
        ],
        [
          '#########',
          '#.IIIIII#',
          '##.###I##',
          '######I##',
          '####FI.##',
          '#########'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      daChuong: [[{ x: 4, y: 4, not: 6, ben: 1, phamVi: 3 }], [{ x: 6, y: 4, not: 6, ben: 1, phamVi: 3 }]],
      chuongDa: [[cd(2, 4, 2, 2)], [cd(4, 4, 2, 2)]],
      maMau: bai(['wait_echo()', 'turn_right()', 'go_echo()', 'turn_right()', 'go_echo()']),
      loiGiai: bai(['wait_echo()', 'turn_right()', 'crack_rim(6)', 'go_echo()']),
      loiSai: [
        { moTa: 'Không phá đá: R1 đâm vào đá chuông trong ngách', baiLam: bai(['wait_echo()', 'turn_right()', 'go_echo()', 'turn_right()', 'go_echo()']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Gõ nhầm nốt 4: đá nốt 6 không vỡ', baiLam: bai(['wait_echo()', 'turn_right()', 'crack_rim(4)', 'go_echo()']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 21, nhip: 13 },
      goiY: [
        'Luna: Tới miệng ngách, quay vào, rồi crack_rim(6).',
        'Luna: crack_rim xong R1 đã rẽ phải, go_echo() tới cờ.'
      ]
    }),

    manCheAmThanh(9, 'bien-the', {
      ten: 'Chế lệnh: theo chuỗi chuông',
      taoHam: ['echo_spiral'], chinhCoDinh: true,
      hamCuaEmCan: ['turn_right', 'go_echo', 'crack_rim'],
      deBai: 'Giúp Sola với! Phá khối đá nốt 5 ở chỗ rẽ đầu, rồi chuỗi chuông đá dẫn tới cờ. Chế hàm echo_spiral(): còn nghe thì go_echo() rồi rẽ phải. Chương trình chính đã khoá.',
      veMaMau: 'Chương trình chính gọi crack_rim(5) rồi echo_spiral(). Mở Xưởng hàm, chế echo_spiral().',
      san: [
        [
          '######',
          '#.II.#',
          '####I#',
          '##F#I#',
          '##I#I#',
          '##.I.#',
          '######'
        ],
        [
          '#########',
          '#.IIIII.#',
          '#######I#',
          '###F###I#',
          '###.III.#',
          '#########'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      daChuong: [[da(4, 1, 5)], [da(7, 1, 5)]],
      chuongDa: [
        [cd(4, 5, 2, 4), cd(2, 5, 4, 2), cd(2, 3, 7, 2)],
        [cd(7, 4, 2, 3), cd(3, 4, 4, 4), cd(3, 3, 7, 1)]
      ],
      maMau: bai(['crack_rim(5)', 'echo_spiral()']),
      loiGiai: bai(['crack_rim(5)', 'echo_spiral()'], [], [ECHO_SPIRAL]),
      loiSai: [
        { moTa: 'Chưa chế hàm echo_spiral', baiLam: bai(['crack_rim(5)', 'echo_spiral()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Thân hàm lặp for 2 lần: còn chuông cuối chưa tới', baiLam: bai(['crack_rim(5)', 'echo_spiral()']), hamCuaEmMoi: [ham('echo_spiral', ['for i in range(2):', '    go_echo()', '    turn_right()'])], phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 20, nhip: 18 },
      goiY: [
        'Luna: Thân echo_spiral() giống vòng lặp ở màn "Lặp theo tiếng vang".',
        'Luna: while hear() > 0:, rồi go_echo() và turn_right() thụt vào.'
      ]
    }),

    manCheAmThanh(10, 'tong-hop', {
      ten: 'Trùm: lối ra hang chuông',
      hamCuaEmCan: ['turn_right', 'go_echo', 'wait_echo', 'crack_rim', 'echo_spiral'],
      khoaTD: ['dau', 'giua', 'cuoi'],
      duLieuSan: ['notes = {"dau": 3, "giua": 8, "cuoi": 5}', 'notes = {"dau": 6, "giua": 2}'],
      khung: { chinh: 10, moiHam: 8, cauTruc: ['for', 'while', 'dict'] },
      deBai: 'Giúp Sola với! Vòng ngoài là đá chuông, nốt ghi trong sổ notes của từng hầm. Phá hết đá thì đi tới khi nghe chuông ngách, rẽ vào, theo chuỗi chuông tới cờ.',
      veMaMau: 'Sola mới phá đá rồi theo chuông luôn. Chạy thử: R1 dừng sau khối đá cuối.',
      san: [
        [
          '#########',
          '#.IIIII.#',
          '#######I#',
          '##.II.#I#',
          '##I##F#I#',
          '##I####I#',
          '##.IIII.#',
          '#########'
        ],
        [
          '########',
          '#.IIII.#',
          '######I#',
          '######I#',
          '###.F#I#',
          '###I##I#',
          '##I.II.#',
          '########'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      daChuong: [[da(7, 1, 3), da(7, 6, 8), da(2, 6, 5)], [da(6, 1, 6), da(6, 6, 2)]],
      chuongDa: [[cd(5, 3, 4, 3), cd(5, 4, 1, 1)], [cd(3, 4, 4, 2), cd(4, 4, 1, 1)]],
      maMau: bai(['notes = {"dau": 3, "giua": 8, "cuoi": 5}', 'for k in notes:', '    crack_rim(notes[k])', 'echo_spiral()']),
      loiGiai: bai(['notes = {"dau": 3, "giua": 8, "cuoi": 5}', 'for k in notes:', '    crack_rim(notes[k])', 'wait_echo()', 'turn_right()', 'echo_spiral()']),
      loiSai: [
        { moTa: 'Không wait_echo(): phá xong đá thì chưa nghe chuông nào, R1 đứng yên', baiLam: bai(['notes = {"dau": 3, "giua": 8, "cuoi": 5}', 'for k in notes:', '    crack_rim(notes[k])', 'echo_spiral()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đọc từng khoá: sổ hầm 2 không có "cuoi" nên chương trình dừng', baiLam: bai(['notes = {"dau": 3, "giua": 8, "cuoi": 5}', 'crack_rim(notes["dau"])', 'crack_rim(notes["giua"])', 'crack_rim(notes["cuoi"])', 'wait_echo()', 'turn_right()', 'echo_spiral()']), phaiCoMa: ['loi-chay'] },
        { moTa: 'Quên rẽ vào ngách: R1 đi tiếp dọc hầm', baiLam: bai(['notes = {"dau": 3, "giua": 8, "cuoi": 5}', 'for k in notes:', '    crack_rim(notes[k])', 'wait_echo()', 'echo_spiral()']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 26, nhip: 31 },
      goiY: [
        'Luna: for k in notes: crack_rim(notes[k]) phá hết vòng đá.',
        'Luna: Rồi wait_echo(), turn_right(), echo_spiral().'
      ]
    })
  ];

  if (M && M.them) M.manAmThanh = DS;
  if (typeof module !== 'undefined' && module.exports) module.exports = M;
})();
