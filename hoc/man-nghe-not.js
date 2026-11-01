/* ============================================================================
   man-nghe-not.js — Mùa 8 Hang động đá vôi: GÓI 7 "Thẩm âm chuông đá" (20 màn)
     Chương 1: nghe-not     (10 màn: listen() nhận diện nốt 1..8 của chuông đá / đá chuông)
     Chương 2: che-nghe-not (10 màn: chế hàm giải mã giai điệu kết hợp thu gai, phát nốt, dict, set)

   Luật R1 gói 7:
     - Thân: 'gai' (loaiRobot: 'gai', thuGai: true)
     - Tay: 'loa' (beat, note)
     - Cảm biến: 'am-thanh' nâng cấp thẩm âm (phanAm: true, mở lệnh listen())
     - Khay lệnh: left_move, right_move, left_back, right_back, wait,
                  retract_spikes, extend_spikes, beat, note, hear, listen
   ========================================================================== */
(function () {
  'use strict';

  var M = (typeof window !== 'undefined' && window.ManHoc) ||
    (typeof require === 'function' ? require('./man-chuoi-1.js') : null);

  function bai(chinh, hamMan, hamEm) {
    return { chinh: chinh || [], hamCuaMan: hamMan || [], hamCuaEmMoi: hamEm || [] };
  }
  function ham(ten, than, thamSo, dong) {
    var h = { ten: ten, thamSo: thamSo || [], than: than || [] };
    if (dong) h.dong = true;
    return h;
  }

  var CAU_TRUC = ['for', 'while', 'if', 'elif', 'else', 'def', 'return', 'list', 'dict', 'set'];
  var HAM_GOC_NGHE_NOT = [
    'left_move', 'right_move', 'left_back', 'right_back', 'wait',
    'retract_spikes', 'extend_spikes', 'beat', 'note', 'hear', 'listen'
  ];

  function manGaiThauAm(chuong, so, hang, d) {
    return Object.assign({
      id: chuong + '.' + so,
      chuong: chuong,
      so: so,
      hang: hang,
      loaiRobot: 'gai',
      thuGai: true,
      phanAm: true,
      robot: { than: 'gai', tay: 'loa', camBien: [{ ma: 'am-thanh', o: 'tren', phanAm: true }] },
      moXuong: true,
      camHamCuaEm: false,
      taoHam: [],
      hamCuaEmCan: [],
      khung: { ham: 10, chinh: 10, cauTruc: CAU_TRUC },
      cauTruc: CAU_TRUC,
      hamGoc: HAM_GOC_NGHE_NOT,
      mucTieu: d.dieu ? 'choi-dieu' : 'toi-co',
      nhipToiDa: d.nhipToiDa || (d.sao && d.sao.nhip ? d.sao.nhip + 12 : 40),
      loiSai: []
    }, d);
  }

  function manNgheNot(so, hang, d) { return manGaiThauAm('nghe-not', so, hang, d); }
  function manCheNgheNot(so, hang, d) { return manGaiThauAm('che-nghe-not', so, hang, d); }

  var DS = [
    /* ========================================================================
       CHƯƠNG 1: nghe-not — Thẩm âm chuông đá (10 màn)
       ====================================================================== */
    manNgheNot(1, 'lam-quen', {
      ten: 'Cảm biến thẩm âm mở khóa',
      chiChay: true, chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward', 'play_note'],
      deBai: 'Khi cảm biến âm thanh được nâng cấp thẩm âm, lệnh listen() trả về đúng nốt nhạc (từ 1 đến 8) của chuông đá hoặc khối đá chuông chưa vỡ gần nhất (kể cả ngay dưới chân R1). Bấm Chạy để xem R1 dùng play_note(listen()) tự đọc tần số và phá đá chuông.',
      veMaMau: 'listen() đọc được nốt 6 của khối đá chuông ở (3, 1), truyền vào play_note(listen()) để phá đá rồi tiến tới cờ.',
      san: [
        '#######',
        '#.II.F#',
        '#######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      daChuong: [{ x: 3, y: 1, not: 6, ben: 1 }],
      maMau: bai(['play_note(listen())', 'forward(4)']),
      loiGiai: bai(['play_note(listen())', 'forward(4)']),
      sao: { o: 9, nhip: 5 },
      goiY: [
        'Bấm nút Chạy để quan sát listen() tự nhận diện tần số cộng hưởng của khối đá.',
        'Màn 1 chỉ cần chạy thử, chưa cần sửa mã.'
      ]
    }),

    manNgheNot(2, 'lam-quen', {
      ten: 'Tự bắt tần số hai sân',
      hamCuaEmCan: ['move', 'forward', 'play_note'],
      deBai: 'Ở 2 sân, khối đá chuông chắn đường mang tần số khác nhau (sân 1 là nốt 3, sân 2 là nốt 7). Hãy thay số cứng trong play_note(3) bằng play_note(listen()) để phá đá ở cả 2 sân.',
      veMaMau: 'Mã mẫu dùng số cứng 3 nên ở sân 2 không phá được khối đá nốt 7.',
      san: [
        ['#######', '#.II.F#', '#######'],
        ['#######', '#.II.F#', '#######']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      daChuong: [
        [{ x: 3, y: 1, not: 3, ben: 1 }],
        [{ x: 3, y: 1, not: 7, ben: 1 }]
      ],
      maMau: bai(['play_note(3)', 'forward(4)']),
      loiGiai: bai(['play_note(listen())', 'forward(4)']),
      loiSai: [
        { moTa: 'Để nguyên play_note(3): ở sân 2 đâm vào khối đá chuông nốt 7', baiLam: bai(['play_note(3)', 'forward(4)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 9, nhip: 5 },
      goiY: [
        'Đổi play_note(3) thành play_note(listen()).',
        'Nhờ listen(), R1 tự phát nốt 3 ở sân 1 và nốt 7 ở sân 2.'
      ]
    }),

    manNgheNot(3, 'lam-quen', {
      ten: 'Nhại lại tiếng chuông đá',
      hamCuaEmCan: ['move', 'forward', 'play_note'],
      dieu: '4...8',
      dieuToiCo: true,
      deBai: 'Dọc hành lang có 2 chuông đá phát nốt mẫu: chuông đầu ở ngay (1, 1) và chuông thứ hai ở cờ (4, 1). Hãy nghe và phát lại nốt của chuông đầu bằng play_note(listen()), tiến 3 bước tới cờ bằng forward(3) (ứng với 3 nhịp nghỉ ...), rồi phát lại nốt của chuông thứ hai.',
      veMaMau: 'Mã mẫu mới nhại tiếng chuông đầu và đi tới cờ, chưa phát nốt của chuông tại cờ.',
      san: ['######', '#.IIF#', '######'],
      batDau: { x: 1, y: 1, huong: 1 },
      chuongDa: [
        { x: 1, y: 1, not: 4, phamVi: 1 },
        { x: 4, y: 1, not: 8, phamVi: 1 }
      ],
      maMau: bai(['play_note(listen())', 'forward(3)']),
      loiGiai: bai(['play_note(listen())', 'forward(3)', 'play_note(listen())']),
      loiSai: [
        { moTa: 'Chưa phát nốt của chuông thứ hai sau khi tới cờ', baiLam: bai(['play_note(listen())', 'forward(3)']), phaiCoMa: ['chua-du-dieu'] }
      ],
      sao: { o: 10, nhip: 5 },
      goiY: [
        'Khác với hear() bỏ qua chuông dưới chân, listen() đọc được cả chuông đá ngay tại ô R1 đang đứng.',
        'Thêm dòng play_note(listen()) vào cuối chương trình.'
      ]
    }),

    manNgheNot(4, 'lam-quen', {
      ten: 'Thẩm âm phá thạch nhũ dày',
      hamCuaEmCan: ['move', 'turn_right', 'glide_step', 'crack_glide'],
      deBai: 'Ở cả 2 sân, khối đá chuông chặn trên dải băng ngang đều có độ bền 2 nhưng mang tần số khác nhau. Hãy truyền listen() vào hàm crack_glide(listen(), 2) để ngân 2 nhịp phá đá, trượt tới góc (5, 1) rẽ phải rồi bước vào cờ.',
      veMaMau: 'Mã mẫu đang gọi crack_glide(listen(), 1) nên chỉ ngân 1 nhịp, chưa đủ phá thạch nhũ dày.',
      san: [
        ['#######', '#.III.#', '#####F#', '#######'],
        ['#######', '#.III.#', '#####F#', '#######']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      daChuong: [
        [{ x: 3, y: 1, not: 2, ben: 2 }],
        [{ x: 3, y: 1, not: 6, ben: 2 }]
      ],
      maMau: bai([
        'crack_glide(listen(), 1)',
        'move()'
      ]),
      loiGiai: bai([
        'crack_glide(listen(), 2)',
        'move()'
      ]),
      loiSai: [
        { moTa: 'Để nguyên độ bền 1 trong crack_glide(listen(), 1): đá ben=2 chưa vỡ', baiLam: bai(['crack_glide(listen(), 1)', 'move()']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 14, nhip: 5 },
      goiY: [
        'Khối đá chuông có độ bền 2 nên cần ngân 2 nhịp.',
        'Đổi crack_glide(listen(), 1) thành crack_glide(listen(), 2).'
      ]
    }),

    manNgheNot(5, 'luyen', {
      ten: 'Chế lệnh: tự dò tần số trượt',
      taoHam: ['auto_crack_glide'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'turn_right', 'glide_step', 'crack_glide'],
      deBai: 'Tạo hàm auto_crack_glide(k) nhận độ bền k: tự đọc tần số đá chuông bằng listen() rồi gọi crack_glide(listen(), k) để ngân k nhịp phá đá, trượt hết dải băng và rẽ phải.',
      veMaMau: 'Mở Xưởng hàm, tạo auto_crack_glide(k) gồm 1 dòng: crack_glide(listen(), k).',
      san: [
        [
          '#######',
          '#.III.#',
          '#####I#',
          '#####I#',
          '####FI#',
          '#######'
        ],
        [
          '#######',
          '#.III.#',
          '#####I#',
          '#####I#',
          '####FI#',
          '#######'
        ]
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      daChuong: [
        [
          { x: 3, y: 1, not: 4, ben: 1 },
          { x: 5, y: 3, not: 7, ben: 2 }
        ],
        [
          { x: 3, y: 1, not: 8, ben: 1 },
          { x: 5, y: 3, not: 3, ben: 2 }
        ]
      ],
      maMau: bai([
        'auto_crack_glide(1)',
        'auto_crack_glide(2)',
        'move()'
      ]),
      loiGiai: bai(
        [
          'auto_crack_glide(1)',
          'auto_crack_glide(2)',
          'move()'
        ],
        [],
        [ham('auto_crack_glide', ['crack_glide(listen(), k)'], ['k'])]
      ),
      loiSai: [
        { moTa: 'Chưa tạo hàm auto_crack_glide', baiLam: bai(['auto_crack_glide(1)', 'auto_crack_glide(2)', 'move()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Dùng hear() thay vì listen() trong auto_crack_glide: phát sai tần số đá chuông', baiLam: bai(['auto_crack_glide(1)', 'auto_crack_glide(2)', 'move()']), hamCuaEmMoi: [ham('auto_crack_glide', ['crack_glide(hear(), k)'], ['k'])], phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 16, nhip: 8 },
      goiY: [
        'Thân hàm auto_crack_glide(k) chỉ cần gọi crack_glide(listen(), k).',
        'Khi khối đá thứ nhất vỡ, lần gọi auto_crack_glide(2) tự động bắt tần số khối đá thứ hai.'
      ]
    }),

    manNgheNot(6, 'luyen', {
      ten: 'Ba dải băng cộng hưởng',
      hamCuaEmCan: ['move', 'turn_right', 'glide_step', 'crack_glide', 'auto_crack_glide'],
      deBai: 'Hành lang xoắn 3 cạnh đều có đá chuông độ bền 1 chặn trên dải đá ướt. Hãy dùng vòng lặp for lặp 3 lần auto_crack_glide(1) rồi bước 1 ô vào cờ ở cả 2 sân.',
      veMaMau: 'Mã mẫu mới lặp 2 lần nên dừng ở góc (1, 4).',
      san: [
        [
          '#######',
          '#.III.#',
          '#F###I#',
          '#.III.#',
          '#######'
        ],
        [
          '#######',
          '#.III.#',
          '#F###I#',
          '#.III.#',
          '#######'
        ]
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      daChuong: [
        [
          { x: 3, y: 1, not: 2, ben: 1 },
          { x: 5, y: 2, not: 5, ben: 1 },
          { x: 3, y: 3, not: 8, ben: 1 }
        ],
        [
          { x: 3, y: 1, not: 6, ben: 1 },
          { x: 5, y: 2, not: 3, ben: 1 },
          { x: 3, y: 3, not: 4, ben: 1 }
        ]
      ],
      maMau: bai([
        'for i in range(2):',
        '    auto_crack_glide(1)',
        'move()'
      ]),
      loiGiai: bai([
        'for i in range(3):',
        '    auto_crack_glide(1)',
        'move()'
      ]),
      loiSai: [
        { moTa: 'Chỉ lặp 2 lần: mới tới góc (5, 3) và đâm vào đá chuông thứ ba', baiLam: bai(['for i in range(2):', '    auto_crack_glide(1)', 'move()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 16, nhip: 10 },
      goiY: [
        'Cần đi qua 3 cạnh băng trước khi bước lên cờ ở (1, 2).',
        'Đổi range(2) thành range(3).'
      ]
    }),

    manNgheNot(7, 'luyen', {
      ten: 'Chế lệnh: vừa bước vừa nhại âm',
      taoHam: ['echo_march'], chinhCoDinh: true,
      hamCuaEmCan: ['march_note'],
      dieu: '362',
      dieuToiCo: true,
      deBai: 'Tạo hàm echo_march(n) lặp n lần (for i in range(n):) lệnh march_note(listen()): ở mỗi bước, R1 đọc tần số của chuông đá hoặc đá chuông gần nhất rồi vừa tiến 1 ô vừa phát đúng nốt đó!',
      veMaMau: 'Trong echo_march(n), viết 2 dòng: for i in range(n): và thụt lề march_note(listen()).',
      san: [
        '######',
        '#.IIF#',
        '######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      chuongDa: [
        { x: 1, y: 1, not: 3, phamVi: 1 },
        { x: 2, y: 1, not: 6, phamVi: 1 },
        { x: 3, y: 1, not: 2, phamVi: 1 }
      ],
      maMau: bai([
        'echo_march(3)'
      ]),
      loiGiai: bai(
        [
          'echo_march(3)'
        ],
        [],
        [ham('echo_march', ['for i in range(n):', '    march_note(listen())'], ['n'])]
      ),
      loiSai: [
        { moTa: 'Chưa tạo hàm echo_march', baiLam: bai(['echo_march(3)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Gọi march_note(1) thay vì march_note(listen()): phát sai nốt', baiLam: bai(['echo_march(3)']), hamCuaEmMoi: [ham('echo_march', ['for i in range(n):', '    march_note(1)'], ['n'])], phaiCoMa: ['sai-not'] }
      ],
      sao: { o: 7, nhip: 3 },
      goiY: [
        'Trong thân vòng lặp for i in range(n):, gọi march_note(listen()).',
        'Tại (1, 1), (2, 1), (3, 1), R1 lần lượt nghe và phát 3, 6, 2 đồng thời bước vào cờ (4, 1).'
      ]
    }),

    manNgheNot(8, 'bien-the', {
      ten: 'Từ điển dịch giọng chuông đá',
      hamCuaEmCan: ['move', 'turn_right', 'glide_step', 'crack_glide'],
      deBai: 'Tại (1, 1) có một chuông đá chỉ đường (phamVi: 1), còn ở (4, 1) có khối đá chuông chặn đường nhưng đặt ngoài tầm nghe trực tiếp (phamVi: 1). Từ điển d = {2: 7, 5: 4} cho biết: nếu chuông chỉ đường ngân nốt 2 thì khối đá phía trước mang nốt 7; nếu ngân nốt 5 thì khối đá mang nốt 4. Hãy tra d[listen()] để gọi crack_glide(d[listen()], 1) rồi bước vào cờ.',
      veMaMau: 'Mã mẫu truyền thẳng listen() thay vì tra từ điển d[listen()] nên phát sai tần số khối đá.',
      san: [
        ['#######', '#.III.#', '#####F#', '#######'],
        ['#######', '#.III.#', '#####F#', '#######']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [{ x: 1, y: 1, not: 2, phamVi: 1 }],
        [{ x: 1, y: 1, not: 5, phamVi: 1 }]
      ],
      daChuong: [
        [{ x: 4, y: 1, not: 7, ben: 1, phamVi: 1 }],
        [{ x: 4, y: 1, not: 4, ben: 1, phamVi: 1 }]
      ],
      maMau: bai(['d = {2: 7, 5: 4}', 'crack_glide(listen(), 1)', 'move()']),
      loiGiai: bai(['d = {2: 7, 5: 4}', 'crack_glide(d[listen()], 1)', 'move()']),
      loiSai: [
        { moTa: 'Truyền listen() mà không tra d[listen()]: khối đá ở (4, 1) không vỡ', baiLam: bai(['d = {2: 7, 5: 4}', 'crack_glide(listen(), 1)', 'move()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 15, nhip: 4 },
      goiY: [
        'Khối đá ở (4, 1) cách (1, 1) đúng 3 ô trên tia nhìn thẳng nên loa phát từ (1, 1) vẫn làm vỡ đá.',
        'Đổi listen() thành d[listen()] trong lệnh crack_glide.'
      ]
    }),

    manNgheNot(9, 'bien-the', {
      ten: 'Thu thập nốt nhạc không trùng',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'glide_step'],
      deBai: 'Dọc 3 ô đầu có 3 chuông đá (trong đó có những chuông trùng nốt). Hãy vừa đi qua 3 ô vừa thêm nốt nghe được vào tập hợp s = set() bằng s.add(listen()), sau đó rẽ phải và tiến len(s) bước xuống cờ ở cả 2 sân.',
      veMaMau: 'Mã mẫu chưa thêm lệnh tiến len(s) bước xuống cờ sau khi rẽ phải.',
      san: [
        ['######', '#.II.#', '####I#', '####F#', '####u#', '######'],
        ['######', '#.II.#', '####I#', '####I#', '####F#', '####u#', '######']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [
          { x: 1, y: 1, not: 3, phamVi: 1 },
          { x: 2, y: 1, not: 5, phamVi: 1 },
          { x: 3, y: 1, not: 3, phamVi: 1 }
        ],
        [
          { x: 1, y: 1, not: 3, phamVi: 1 },
          { x: 2, y: 1, not: 5, phamVi: 1 },
          { x: 3, y: 1, not: 8, phamVi: 1 }
        ]
      ],
      maMau: bai(['s = set()', 'for i in range(3):', '    s.add(listen())', '    move()', 'turn_right()']),
      loiGiai: bai(['s = set()', 'for i in range(3):', '    s.add(listen())', '    move()', 'turn_right()', 'forward(len(s))']),
      loiSai: [
        { moTa: 'Chưa tiến xuống cờ sau khi rẽ phải', baiLam: bai(['s = set()', 'for i in range(3):', '    s.add(listen())', '    move()', 'turn_right()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đi cứng 3 bước forward(3): ở sân 1 vượt quá cờ rơi xuống hố', baiLam: bai(['s = set()', 'for i in range(3):', '    s.add(listen())', '    move()', 'turn_right()', 'forward(3)']), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 13, nhip: 7 },
      goiY: [
        'Ở sân 1 có 2 nốt khác nhau (3, 5) nên len(s) == 2; ở sân 2 có 3 nốt khác nhau (3, 5, 8) nên len(s) == 3.',
        'Thêm dòng forward(len(s)) vào cuối chương trình.'
      ]
    }),

    manNgheNot(10, 'trum', {
      ten: 'Trùm: Mê cung chuông đá thẩm âm',
      huyHieu: { ma: 'nghe-not', ten: 'Huy hiệu Thẩm âm chuông đá' },
      hamCuaEmCan: ['move', 'turn_right', 'glide_step', 'crack_glide', 'auto_crack_glide', 'march_note', 'echo_march'],
      nhipTheo: 'tong',
      deBai: 'Trùm Chương 1 Gói 7! Trên cả 2 sân, đầu tiên gọi auto_crack_glide(2) để thẩm âm, ngân 2 nhịp phá thạch nhũ dày trên hành lang ngang rồi trượt tới góc (5, 1) và rẽ phải. Sau đó gọi echo_march(2) để vừa bước xuống 2 ô vừa thẩm âm phá liên tiếp 2 khối đá chuông dọc đường tới cờ.',
      veMaMau: 'Kết hợp auto_crack_glide(2) và echo_march(2).',
      san: [
        [
          '#######',
          '#.III.#',
          '#####I#',
          '#####F#',
          '#######'
        ],
        [
          '#######',
          '#.III.#',
          '#####I#',
          '#####F#',
          '#######'
        ]
      ],
      batDau: [
        { x: 1, y: 1, huong: 1 },
        { x: 1, y: 1, huong: 1 }
      ],
      daChuong: [
        [
          { x: 3, y: 1, not: 4, ben: 2 },
          { x: 5, y: 2, not: 7, ben: 1 },
          { x: 5, y: 3, not: 2, ben: 1 }
        ],
        [
          { x: 3, y: 1, not: 6, ben: 2 },
          { x: 5, y: 2, not: 3, ben: 1 },
          { x: 5, y: 3, not: 8, ben: 1 }
        ]
      ],
      maMau: bai([
        'auto_crack_glide(2)'
      ]),
      loiGiai: bai([
        'auto_crack_glide(2)',
        'echo_march(2)'
      ]),
      loiSai: [
        { moTa: 'Mới đi hết chặng ngang: dừng ở góc (5, 1)', baiLam: bai(['auto_crack_glide(2)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Chỉ gọi echo_march(1): dừng ở (5, 2) trước cờ', baiLam: bai(['auto_crack_glide(2)', 'echo_march(1)']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 21, nhip: 12 },
      goiY: [
        'Sau auto_crack_glide(2), R1 đứng ở (5, 1) hướng xuống Nam với gai đã bung.',
        'Gọi echo_march(2) để R1 lần lượt thẩm âm, phá 2 khối đá chuông ở (5, 2) và (5, 3) rồi bước vào cờ.'
      ]
    }),

    /* ========================================================================
       CHƯƠNG 2: che-nghe-not — Chế lệnh: giải mã giai điệu (10 màn)
       ====================================================================== */
    manCheNgheNot(1, 'lam-quen', {
      ten: 'Chế lệnh: thẩm âm bước tới',
      taoHam: ['listen_step'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward', 'play_note', 'crack_step'],
      deBai: 'Tạo hàm listen_step(m) nhận số bước m: tự đọc tần số khối đá chuông phía trước bằng listen() rồi gọi crack_step(listen(), m) để phá đá và tiến m bước.',
      veMaMau: 'Mở Xưởng hàm, tạo listen_step(m) gồm 1 dòng: crack_step(listen(), m).',
      san: [
        ['#######', '#..I.F#', '#######'],
        ['#######', '#..I.F#', '#######']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      daChuong: [
        [{ x: 3, y: 1, not: 5, ben: 1 }],
        [{ x: 3, y: 1, not: 8, ben: 1 }]
      ],
      maMau: bai(['listen_step(4)']),
      loiGiai: bai(['listen_step(4)'], [], [ham('listen_step', ['crack_step(listen(), m)'], ['m'])]),
      loiSai: [
        { moTa: 'Chưa tạo hàm listen_step', baiLam: bai(['listen_step(4)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Truyền cứng tần số 5 thay vì listen(): ở sân 2 đâm vào đá chuông nốt 8', baiLam: bai(['listen_step(4)']), hamCuaEmMoi: [ham('listen_step', ['crack_step(5, m)'], ['m'])], phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 11, nhip: 5 },
      goiY: [
        'Thân hàm listen_step(m) chỉ cần 1 dòng: crack_step(listen(), m).',
        'Khi gọi listen_step(4), R1 tự phá khối đá ở (3, 1) và tiến 4 bước tới cờ (5, 1) trên cả 2 sân.'
      ]
    }),

    manCheNgheNot(2, 'lam-quen', {
      ten: 'Thẩm âm kết hợp đo khoảng cách',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'play_note', 'crack_step', 'listen_step'],
      deBai: 'Cảm biến nâng cấp vừa có listen() (đọc nốt) vừa có hear() (đo khoảng cách)! Ở cả 2 sân, khối đá chuông nằm ngay trên ô cờ ở cuối hành lang. Hãy gọi listen_step(hear()) để vừa tự phá đá vừa tiến đúng số bước tới cờ.',
      veMaMau: 'Mã mẫu truyền cứng 3 bước nên ở sân 2 dừng thiếu trước cờ.',
      san: [
        ['######', '#.IIF#', '######'],
        ['#######', '#.IIIF#', '#######']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      daChuong: [
        [{ x: 4, y: 1, not: 3, ben: 1 }],
        [{ x: 5, y: 1, not: 7, ben: 1 }]
      ],
      maMau: bai(['listen_step(3)']),
      loiGiai: bai(['listen_step(hear())']),
      loiSai: [
        { moTa: 'Để nguyên listen_step(3): ở sân 2 dừng trước cờ 1 ô', baiLam: bai(['listen_step(3)']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 11, nhip: 5 },
      goiY: [
        'Trước khi khối đá ở ô cờ vỡ, hear() đo chính xác khoảng cách từ R1 tới ô cờ.',
        'Đổi listen_step(3) thành listen_step(hear()).'
      ]
    }),

    manCheNgheNot(3, 'lam-quen', {
      ten: 'Chế lệnh: thẩm âm xuyên ngách',
      taoHam: ['crack_tunnel'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'glide_tunnel', 'play_note'],
      deBai: 'Tạo hàm crack_tunnel() gồm 2 dòng: gọi play_note(listen()) để tự phá khối đá chuông đang chặn trên dải băng dẫn vào ngách hang, rồi gọi glide_tunnel() để trượt qua dải băng, chui qua ngách ngầm và bước ra 1 ô.',
      veMaMau: 'Trong crack_tunnel(), viết 2 dòng: play_note(listen()) và glide_tunnel().',
      san: [
        ['#######', '#.III>#', '#######', '#>II.F#', '#######'],
        ['#######', '#.III>#', '#######', '#>II.F#', '#######']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      ngachHang: [
        [{ a: { x: 5, y: 1 }, b: { x: 1, y: 3 } }],
        [{ a: { x: 5, y: 1 }, b: { x: 1, y: 3 } }]
      ],
      daChuong: [
        [{ x: 3, y: 1, not: 4, ben: 1 }],
        [{ x: 3, y: 1, not: 8, ben: 1 }]
      ],
      maMau: bai(['crack_tunnel()', 'retract_spikes()', 'move()', 'extend_spikes()', 'move()']),
      loiGiai: bai(
        ['crack_tunnel()', 'retract_spikes()', 'move()', 'extend_spikes()', 'move()'],
        [],
        [ham('crack_tunnel', ['play_note(listen())', 'glide_tunnel()'])]
      ),
      loiSai: [
        { moTa: 'Chưa tạo hàm crack_tunnel', baiLam: bai(['crack_tunnel()', 'retract_spikes()', 'move()', 'extend_spikes()', 'move()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Gọi glide_tunnel() trước play_note(listen()): trượt vướng đá chuông nên không tới được miệng ngách', baiLam: bai(['crack_tunnel()', 'retract_spikes()', 'move()', 'extend_spikes()', 'move()']), hamCuaEmMoi: [ham('crack_tunnel', ['glide_tunnel()', 'play_note(listen())'])], phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 16, nhip: 5 },
      goiY: [
        'Trong crack_tunnel(), phải gọi play_note(listen()) phá đá trước rồi mới gọi glide_tunnel().',
        'Sau khi ra ở (2, 3), chương trình chính trượt tiếp qua dải băng dưới và bước vào cờ (5, 3).'
      ]
    }),

    manCheNgheNot(4, 'lam-quen', {
      ten: 'Hai ngách hang khóa âm',
      hamCuaEmCan: ['move', 'glide_tunnel', 'play_note', 'crack_tunnel'],
      deBai: 'Cả hai tầng ngách hang đều có đá chuông chắn trên dải băng. Hãy gọi crack_tunnel() để vượt ngách đầu sang (2, 3), sau đó phá tiếp khối đá thứ hai bằng play_note(listen()), thu gai trượt tới (4, 3) rồi bung gai bước vào cờ.',
      veMaMau: 'Mã mẫu mới vượt qua ngách đầu, chưa phá đá và trượt ở tầng dưới.',
      san: [
        ['#######', '#.III>#', '#######', '#>II.F#', '#######'],
        ['#######', '#.III>#', '#######', '#>II.F#', '#######']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      ngachHang: [
        [{ a: { x: 5, y: 1 }, b: { x: 1, y: 3 } }],
        [{ a: { x: 5, y: 1 }, b: { x: 1, y: 3 } }]
      ],
      daChuong: [
        [{ x: 3, y: 1, not: 2, ben: 1 }, { x: 3, y: 3, not: 6, ben: 1 }],
        [{ x: 3, y: 1, not: 5, ben: 1 }, { x: 3, y: 3, not: 7, ben: 1 }]
      ],
      maMau: bai(['crack_tunnel()']),
      loiGiai: bai(['crack_tunnel()', 'play_note(listen())', 'retract_spikes()', 'move()', 'extend_spikes()', 'move()']),
      loiSai: [
        { moTa: 'Chưa đi nốt tầng dưới', baiLam: bai(['crack_tunnel()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên gọi play_note(listen()) ở tầng dưới: vướng khối đá ở (3, 3)', baiLam: bai(['crack_tunnel()', 'retract_spikes()', 'move()', 'extend_spikes()', 'move()']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 17, nhip: 6 },
      goiY: [
        'Sau crack_tunnel(), R1 đang đứng ở (2, 3) ngay trước khối đá chuông (3, 3).',
        'Gọi play_note(listen()), rồi retract_spikes(), move(), extend_spikes(), move() để tới cờ.'
      ]
    }),

    manCheNgheNot(5, 'luyen', {
      ten: 'Chế lệnh: dịch mã chuông bằng từ điển',
      taoHam: ['decode_glide'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'turn_right', 'glide_step', 'crack_glide'],
      deBai: 'Tạo hàm decode_glide(d, k) nhận từ điển mật mã d và độ bền k: đọc nốt của chuông chỉ đường dưới chân bằng listen(), tra tần số thật d[listen()] rồi gọi crack_glide(d[listen()], k) để phá khối đá phía trước và trượt hết dải băng.',
      veMaMau: 'Trong decode_glide(d, k), viết 1 dòng: crack_glide(d[listen()], k).',
      san: [
        ['#######', '#.III.#', '#####F#', '#######'],
        ['#######', '#.III.#', '#####F#', '#######']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [{ x: 1, y: 1, not: 1, phamVi: 1 }],
        [{ x: 1, y: 1, not: 3, phamVi: 1 }]
      ],
      daChuong: [
        [{ x: 4, y: 1, not: 6, ben: 2, phamVi: 1 }],
        [{ x: 4, y: 1, not: 8, ben: 2, phamVi: 1 }]
      ],
      maMau: bai(['d = {1: 6, 3: 8}', 'decode_glide(d, 2)', 'move()']),
      loiGiai: bai(
        ['d = {1: 6, 3: 8}', 'decode_glide(d, 2)', 'move()'],
        [],
        [ham('decode_glide', ['crack_glide(d[listen()], k)'], ['d', 'k'])]
      ),
      loiSai: [
        { moTa: 'Chưa tạo hàm decode_glide', baiLam: bai(['d = {1: 6, 3: 8}', 'decode_glide(d, 2)', 'move()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Truyền thẳng listen() không tra d[listen()]: phát sai tần số đá chuông', baiLam: bai(['d = {1: 6, 3: 8}', 'decode_glide(d, 2)', 'move()']), hamCuaEmMoi: [ham('decode_glide', ['crack_glide(listen(), k)'], ['d', 'k'])], phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 16, nhip: 5 },
      goiY: [
        'Thân hàm decode_glide(d, k) chỉ gồm 1 dòng: crack_glide(d[listen()], k).',
        'Khi đá vỡ và R1 trượt tới (5, 1) rẽ phải, lệnh move() bước vào cờ.'
      ]
    }),

    manCheNgheNot(6, 'luyen', {
      ten: 'Giải mã hai tầng mật âm',
      hamCuaEmCan: ['move', 'turn_right', 'glide_step', 'crack_glide', 'decode_glide'],
      deBai: 'Mỗi góc hành lang đều đặt một chuông chỉ đường báo mật mã cho khối đá chuông ở cuối dải băng tiếp theo. Hãy dùng bảng mã d = {1: 5, 2: 7, 4: 8} và gọi decode_glide(d, 1) hai lần liên tiếp rồi bước vào cờ.',
      veMaMau: 'Mã mẫu mới giải mã tầng đầu tiên.',
      san: [
        ['#######', '#.III.#', '#####I#', '#####I#', '####FI#', '#######'],
        ['#######', '#.III.#', '#####I#', '#####I#', '####FI#', '#######']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [{ x: 1, y: 1, not: 1, phamVi: 1 }, { x: 5, y: 1, not: 2, phamVi: 1 }],
        [{ x: 1, y: 1, not: 2, phamVi: 1 }, { x: 5, y: 1, not: 4, phamVi: 1 }]
      ],
      daChuong: [
        [{ x: 4, y: 1, not: 5, ben: 1, phamVi: 1 }, { x: 5, y: 3, not: 7, ben: 1, phamVi: 1 }],
        [{ x: 4, y: 1, not: 7, ben: 1, phamVi: 1 }, { x: 5, y: 3, not: 8, ben: 1, phamVi: 1 }]
      ],
      maMau: bai(['d = {1: 5, 2: 7, 4: 8}', 'decode_glide(d, 1)']),
      loiGiai: bai(['d = {1: 5, 2: 7, 4: 8}', 'decode_glide(d, 1)', 'decode_glide(d, 1)', 'move()']),
      loiSai: [
        { moTa: 'Chưa giải mã chặng dọc và bước vào cờ', baiLam: bai(['d = {1: 5, 2: 7, 4: 8}', 'decode_glide(d, 1)']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 17, nhip: 7 },
      goiY: [
        'Tại góc (5, 1) có chuông chỉ đường thứ hai ngay dưới chân R1.',
        'Gọi thêm decode_glide(d, 1) rồi move() để vào cờ ở (4, 4).'
      ]
    }),

    manCheNgheNot(7, 'luyen', {
      ten: 'Chế lệnh: phát nốt mới không trùng',
      taoHam: ['listen_unique_step'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'play_note'],
      dieu: '3.7..5',
      dieuToiCo: true,
      deBai: 'Tạo hàm listen_unique_step(s) nhận tập hợp s: đọc nốt dưới chân n = listen(), kiểm tra nếu n chưa có trong s (if n not in s:) thì thêm s.add(n) và gọi play_note(n), sau cùng (ngoài khối if) gọi move() để bước sang ô kế tiếp.',
      veMaMau: 'Trong listen_unique_step(s), viết: n = listen(), if n not in s: (thụt lề s.add(n), play_note(n)), rồi move().',
      san: ['#######', '#.II.F#', '#######'],
      batDau: { x: 1, y: 1, huong: 1 },
      chuongDa: [
        { x: 1, y: 1, not: 3, phamVi: 1 },
        { x: 2, y: 1, not: 7, phamVi: 1 },
        { x: 3, y: 1, not: 3, phamVi: 1 },
        { x: 4, y: 1, not: 5, phamVi: 1 }
      ],
      maMau: bai(['s = set()', 'for i in range(4):', '    listen_unique_step(s)']),
      loiGiai: bai(
        ['s = set()', 'for i in range(4):', '    listen_unique_step(s)'],
        [],
        [ham('listen_unique_step', ['n = listen()', 'if n not in s:', '    s.add(n)', '    play_note(n)', 'move()'], ['s'])]
      ),
      loiSai: [
        { moTa: 'Chưa tạo hàm listen_unique_step', baiLam: bai(['s = set()', 'for i in range(4):', '    listen_unique_step(s)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Đặt move() bên trong nhánh if: khi gặp nốt trùng tại (3, 1) R1 đứng yên không đi tiếp', baiLam: bai(['s = set()', 'for i in range(4):', '    listen_unique_step(s)']), hamCuaEmMoi: [ham('listen_unique_step', ['n = listen()', 'if n not in s:', '    s.add(n)', '    play_note(n)', '    move()'], ['s'])], phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 13, nhip: 7 },
      goiY: [
        'Nhớ đặt dòng move() thẳng cột với if n not in s: để dù gặp nốt trùng R1 vẫn bước qua.',
        'Tại (3, 1) nốt 3 đã có trong s nên R1 không phát nốt mà bước luôn sang (4, 1).'
      ]
    }),

    manCheNgheNot(8, 'bien-the', {
      ten: 'Lọc tiếng vọng qua bốn trạm',
      hamCuaEmCan: ['move', 'play_note', 'listen_unique_step'],
      dieu: '2.6.4.',
      dieuToiCo: true,
      deBai: 'Dọc 3 ô đầu từ (1, 1) tới (3, 1) có 3 chuông đá khác nhau mang nốt 2, 6, 4. Khi gọi listen_unique_step(s), mỗi trạm phát 1 nốt rồi dành 1 nhịp để bước sang ô kế tiếp, tạo đúng tiết tấu 2.6.4. tới cờ! Hãy sửa số lần lặp trong vòng lặp.',
      veMaMau: 'Mã mẫu chỉ lặp 2 lần nên chưa phát nốt thứ ba và chưa tới cờ.',
      san: ['######', '#.IIF#', '######'],
      batDau: { x: 1, y: 1, huong: 1 },
      chuongDa: [
        { x: 1, y: 1, not: 2, phamVi: 1 },
        { x: 2, y: 1, not: 6, phamVi: 1 },
        { x: 3, y: 1, not: 4, phamVi: 1 }
      ],
      maMau: bai(['s = set()', 'for i in range(2):', '    listen_unique_step(s)']),
      loiGiai: bai(['s = set()', 'for i in range(3):', '    listen_unique_step(s)']),
      loiSai: [
        { moTa: 'Để nguyên range(2): dừng ở (3, 1) thiếu nốt 4 và chưa tới cờ', baiLam: bai(['s = set()', 'for i in range(2):', '    listen_unique_step(s)']), phaiCoMa: ['chua-du-dieu'] }
      ],
      sao: { o: 13, nhip: 6 },
      goiY: [
        'Từ (1, 1) tới cờ (4, 1) có 3 trạm chuông.',
        'Đổi range(2) thành range(3).'
      ]
    }),

    manCheNgheNot(9, 'bien-the', {
      ten: 'Chế lệnh: đếm nốt chuông mở lối',
      taoHam: ['scan_unique_notes'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward', 'turn_right'],
      deBai: 'Tạo hàm scan_unique_notes(n) nhận số bước khảo sát n: khởi tạo s = set(), lặp for i in range(n): gọi s.add(listen()) rồi move(), sau vòng lặp trả về return len(s) (số nốt nhạc phân biệt đã thu thập).',
      veMaMau: 'Trong scan_unique_notes(n), tạo s = set(), lặp n lần s.add(listen()) + move(), rồi return len(s).',
      san: [
        ['######', '#.II.#', '####I#', '####F#', '####u#', '######'],
        ['######', '#.II.#', '####I#', '####I#', '####F#', '####u#', '######']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [{ x: 1, y: 1, not: 4, phamVi: 1 }, { x: 2, y: 1, not: 7, phamVi: 1 }, { x: 3, y: 1, not: 4, phamVi: 1 }],
        [{ x: 1, y: 1, not: 4, phamVi: 1 }, { x: 2, y: 1, not: 7, phamVi: 1 }, { x: 3, y: 1, not: 2, phamVi: 1 }]
      ],
      maMau: bai(['k = scan_unique_notes(3)', 'turn_right()', 'forward(k)']),
      loiGiai: bai(
        ['k = scan_unique_notes(3)', 'turn_right()', 'forward(k)'],
        [],
        [ham('scan_unique_notes', ['s = set()', 'for i in range(n):', '    s.add(listen())', '    move()', 'return len(s)'], ['n'])]
      ),
      loiSai: [
        { moTa: 'Chưa tạo hàm scan_unique_notes', baiLam: bai(['k = scan_unique_notes(3)', 'turn_right()', 'forward(k)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trả về n thay vì len(s): ở sân 1 đi 3 bước rơi xuống hố sụt', baiLam: bai(['k = scan_unique_notes(3)', 'turn_right()', 'forward(k)']), hamCuaEmMoi: [ham('scan_unique_notes', ['s = set()', 'for i in range(n):', '    s.add(listen())', '    move()', 'return n'], ['n'])], phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 15, nhip: 7 },
      goiY: [
        'Trong scan_unique_notes(n), sau vòng lặp for i in range(n): hãy trả về return len(s).',
        'Ở sân 1 hàm trả về 2, ở sân 2 hàm trả về 3, giúp forward(k) dừng đúng tại cờ.'
      ]
    }),

    manCheNgheNot(10, 'trum', {
      ten: 'Trùm: Giải mã cung điện chuông đá',
      huyHieu: { ma: 'che-nghe-not', ten: 'Huy hiệu Chế lệnh: giải mã giai điệu' },
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'glide_step', 'glide_tunnel', 'play_note', 'crack_glide', 'crack_tunnel', 'decode_glide', 'scan_unique_notes'],
      nhipTheo: 'tong',
      deBai: 'Trùm Gói 7! Trên cả 2 sân, đầu tiên gọi crack_tunnel() để thẩm âm phá đá trên dải băng tầng trên, trượt vào ngách ngầm (5, 1) sang (1, 3) và bước ra (2, 3). Tiếp theo dùng bảng mã d = {2: 6, 4: 8} và gọi decode_glide(d, 2) để giải mã chuông chỉ đường ở (2, 3), ngân 2 nhịp phá thạch nhũ dày ở (4, 3), trượt tới góc (5, 3) và rẽ phải. Cuối cùng tiến hear() bước xuống cờ.',
      veMaMau: 'Kết hợp crack_tunnel(), d = {2: 6, 4: 8}, decode_glide(d, 2) và forward(hear()).',
      san: [
        ['#######', '#.III>#', '#######', '#>III.#', '#####I#', '#####F#', '#######'],
        ['#######', '#.III>#', '#######', '#>III.#', '#####I#', '#####I#', '#####F#', '#######']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      ngachHang: [
        [{ a: { x: 5, y: 1 }, b: { x: 1, y: 3 } }],
        [{ a: { x: 5, y: 1 }, b: { x: 1, y: 3 } }]
      ],
      chuongDa: [
        [{ x: 2, y: 3, not: 2, phamVi: 1 }, { x: 5, y: 5, not: 1, phamVi: 3 }],
        [{ x: 2, y: 3, not: 4, phamVi: 1 }, { x: 5, y: 6, not: 1, phamVi: 4 }]
      ],
      daChuong: [
        [{ x: 3, y: 1, not: 5, ben: 1 }, { x: 4, y: 3, not: 6, ben: 2, phamVi: 1 }],
        [{ x: 3, y: 1, not: 7, ben: 1 }, { x: 4, y: 3, not: 8, ben: 2, phamVi: 1 }]
      ],
      maMau: bai(['d = {2: 6, 4: 8}', 'crack_tunnel()', 'decode_glide(d, 2)']),
      loiGiai: bai(['d = {2: 6, 4: 8}', 'crack_tunnel()', 'decode_glide(d, 2)', 'forward(hear())']),
      loiSai: [
        { moTa: 'Chưa đi đoạn cuối từ (5, 3) xuống cờ', baiLam: bai(['d = {2: 6, 4: 8}', 'crack_tunnel()', 'decode_glide(d, 2)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đi cứng forward(2): ở sân 2 dừng trước cờ 1 ô', baiLam: bai(['d = {2: 6, 4: 8}', 'crack_tunnel()', 'decode_glide(d, 2)', 'forward(2)']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 27, nhip: 19 },
      goiY: [
        'Sau decode_glide(d, 2), R1 đứng ở (5, 3) hướng xuống Nam và nghe thấy chuông đá đặt tại ô cờ.',
        'Thêm dòng forward(hear()) vào cuối chương trình.'
      ]
    })
  ];

  if (M && M.them) M.manNgheNot = DS;
  if (typeof module !== 'undefined' && module.exports) module.exports = M;
})();
