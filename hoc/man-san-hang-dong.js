/* ============================================================================
   man-san-hang-dong.js — Mùa 8 (Hang động đá vôi) · Gói 4: Ngách hang đá vôi
   Chương 1: san-hang-dong (10 màn) — Ngách hang đá vôi (ngachHang)
   Chương 2: che-hang-dong (10 màn) — Chế lệnh: vượt ngách hang
   ========================================================================== */
(function () {
  'use strict';

  var M = (typeof window !== 'undefined' && window.ManHoc) ||
    (typeof require === 'function' ? require('./man-chuoi-1.js') : null);

  var GOC_HANG = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'beat', 'hear'];

  function bai(chinh, ham, moi) {
    return { chinh: chinh, hamCuaMan: ham || [], hamCuaEmMoi: moi || [] };
  }
  function ham(ten, than, thamSo) {
    return { ten: ten, than: than, thamSo: thamSo || [] };
  }

  function manHangDong(so, hang, ds) {
    return Object.assign({
      chuong: 'san-hang-dong', so: so, hang: hang,
      vo: 'hang', loaiRobot: 'gai',
      robot: { than: 'gai', tay: 'loa', camBien: [{ ma: 'am-thanh', o: 'tren' }] },
      hamGoc: GOC_HANG.slice(),
      hamCuaEmCan: [],
      taoHam: [],
      bienDem: true,
      cauTruc: ['for', 'if', 'while'],
      khung: { chinh: 10, moiHam: 10, cauTruc: ['for', 'if', 'while'] },
      mucTieu: 'toi-co'
    }, ds);
  }

  function manCheHangDong(so, hang, ds) {
    return Object.assign({
      chuong: 'che-hang-dong', so: so, hang: hang,
      vo: 'hang', loaiRobot: 'gai',
      robot: { than: 'gai', tay: 'loa', camBien: [{ ma: 'am-thanh', o: 'tren' }] },
      hamGoc: GOC_HANG.slice(),
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
       CHƯƠNG 1: san-hang-dong — Ngách hang đá vôi (10 màn)
       ====================================================================== */
    manHangDong(1, 'lam-quen', {
      ten: 'Bước vào ngách hang',
      chiChay: true, chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward'],
      deBai: 'Trong hang động đá vôi có các ngách hang ngầm nối hai cửa hang với nhau. Khi R1 bước vào cửa ngách thứ nhất, nó lập tức chui qua đường ngầm sang cửa ngách thứ hai và giữ nguyên hướng đi. Bấm Chạy để xem R1 đi qua ngách hang.',
      veMaMau: 'forward(2) đưa R1 vào cửa ngách ở (3, 1) để vọt sang (3, 3), rồi forward(2) đi tiếp tới cờ ở (5, 3).',
      san: ['#######', '#.I.###', '#######', '###.IF#', '#######'],
      batDau: { x: 1, y: 1, huong: 1 },
      ngachHang: [{ a: { x: 3, y: 1 }, b: { x: 3, y: 3 } }],
      maMau: bai(['forward(2)', 'forward(2)']),
      loiGiai: bai(['forward(2)', 'forward(2)']),
      sao: { o: 7, nhip: 4 },
      goiY: [
        'Bấm nút Chạy để quan sát R1 chui qua ngách hang ngầm vượt qua vách đá chắn giữa sân.'
      ]
    }),

    manHangDong(2, 'lam-quen', {
      ten: 'Ra khỏi cửa ngách',
      hamCuaEmCan: ['move', 'forward'],
      deBai: 'Cửa ngách đầu cách vị trí xuất phát 3 bước. Sau khi chui sang cửa ngách bên kia ở tầng dưới, cờ còn cách 3 bước nữa.',
      veMaMau: 'Mã mẫu mới đưa R1 vào cửa ngách đầu mà chưa đi tiếp tới cờ.',
      san: ['#########', '#.II.####', '#########', '####.IIF#', '#########'],
      batDau: { x: 1, y: 1, huong: 1 },
      ngachHang: [{ a: { x: 4, y: 1 }, b: { x: 4, y: 3 } }],
      maMau: bai(['forward(3)']),
      loiGiai: bai(['forward(3)', 'forward(3)']),
      loiSai: [
        { moTa: 'Mới đi vào ngách, chưa đi tiếp tới cờ', baiLam: bai(['forward(3)']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 7, nhip: 6 },
      goiY: [
        'Thêm forward(3) ở dòng thứ hai để đi từ cửa ngách ra tới cờ.'
      ]
    }),

    manHangDong(3, 'lam-quen', {
      ten: 'Rẽ hướng sau ngách ngầm',
      hamCuaEmCan: ['move', 'forward', 'turn_left'],
      deBai: 'Khi chui qua ngách ngầm, R1 giữ nguyên hướng Đông. Nhưng ở cửa ra, cờ lại nằm ở phía Bắc cách 2 bước. Hãy xoay trái sau khi qua ngách rồi tiến tới cờ.',
      veMaMau: 'Mã mẫu chưa xoay trái và đi lên cờ sau khi chui qua ngách.',
      san: ['########', '######F#', '######I#', '#.I.##.#', '########'],
      batDau: { x: 1, y: 3, huong: 1 },
      ngachHang: [{ a: { x: 3, y: 3 }, b: { x: 6, y: 3 } }],
      maMau: bai(['forward(2)']),
      loiGiai: bai(['forward(2)', 'turn_left()', 'forward(2)']),
      loiSai: [
        { moTa: 'Chưa xoay trái và đi lên cờ', baiLam: bai(['forward(2)']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 10, nhip: 5 },
      goiY: [
        'Sau forward(2) để vào ngách, gọi turn_left() rồi forward(2).'
      ]
    }),

    manHangDong(4, 'lam-quen', {
      ten: 'Hai ngách nối tiếp',
      hamCuaEmCan: ['move', 'forward'],
      deBai: 'Hang động bị chia thành 3 tầng bởi 2 vách đá ngang. Mỗi tầng có một cửa ngách cách 2 bước đi về phía Đông. Hãy đi qua cả 2 ngách ngầm rồi tiến 2 bước cuối tới cờ.',
      veMaMau: 'Mã mẫu mới đi qua ngách đầu tiên và tới ngách thứ hai.',
      san: ['#########', '#.I.#####', '#########', '###.I.###', '#########', '#####.IF#', '#########'],
      batDau: { x: 1, y: 1, huong: 1 },
      ngachHang: [
        { a: { x: 3, y: 1 }, b: { x: 3, y: 3 } },
        { a: { x: 5, y: 3 }, b: { x: 5, y: 5 } }
      ],
      maMau: bai(['forward(2)', 'forward(2)']),
      loiGiai: bai(['for i in range(3):', '    forward(2)']),
      loiSai: [
        { moTa: 'Mới đi 2 lần forward(2): dừng ở cửa ra ngách thứ hai', baiLam: bai(['forward(2)', 'forward(2)']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 7, nhip: 6 },
      goiY: [
        'Dùng vòng lặp for i in range(3): với forward(2) để đi qua 2 ngách và tới cờ.'
      ]
    }),

    manHangDong(5, 'luyen', {
      ten: 'Chế lệnh: xuyên ngách ngầm',
      taoHam: ['enter_tunnel'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward'],
      deBai: 'Chế tạo hàm enter_tunnel(a, b): tiến a bước vào cửa ngách ngầm rồi tiến tiếp b bước sau khi ra khỏi cửa ngách bên kia.',
      veMaMau: 'Chương trình chính đã gọi enter_tunnel(3, 2). Em hãy hoàn thiện phần thân hàm enter_tunnel(a, b).',
      san: ['########', '#.II.###', '########', '####.IF#', '########'],
      batDau: { x: 1, y: 1, huong: 1 },
      ngachHang: [{ a: { x: 4, y: 1 }, b: { x: 4, y: 3 } }],
      maMau: bai(['enter_tunnel(3, 2)']),
      loiGiai: bai(
        ['enter_tunnel(3, 2)'],
        [],
        [ham('enter_tunnel', ['forward(a)', 'forward(b)'], ['a', 'b'])]
      ),
      loiSai: [
        { moTa: 'Quên gọi forward(b) sau khi qua ngách', baiLam: bai(['enter_tunnel(3, 2)']), hamCuaEmMoi: [ham('enter_tunnel', ['forward(a)'], ['a', 'b'])], phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 8, nhip: 5 },
      goiY: [
        'Trong enter_tunnel(a, b), gọi forward(a) rồi forward(b).'
      ]
    }),

    manHangDong(6, 'luyen', {
      ten: 'Chuông đá báo cửa ngách',
      hamCuaEmCan: ['move', 'forward', 'go_echo'],
      deBai: 'Cửa ngách ở mỗi sân nằm ở khoảng cách khác nhau nhưng đều có gắn một chuông đá. Sau khi chui qua ngách, cờ luôn cách 2 bước về phía Đông. Hãy kết hợp go_echo() và forward(2).',
      veMaMau: 'Mã mẫu mới đưa R1 tới cửa ngách bằng go_echo().',
      san: [
        ['#######', '#.I.###', '#######', '###.IF#', '#######'],
        ['#########', '#.III.###', '#########', '#####.IF#', '#########']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [{ x: 3, y: 1, not: 1, phamVi: 8 }],
        [{ x: 5, y: 1, not: 1, phamVi: 8 }]
      ],
      ngachHang: [
        [{ a: { x: 3, y: 1 }, b: { x: 3, y: 3 } }],
        [{ a: { x: 5, y: 1 }, b: { x: 5, y: 3 } }]
      ],
      maMau: bai(['go_echo()']),
      loiGiai: bai(['go_echo()', 'forward(2)']),
      loiSai: [
        { moTa: 'Chưa tiến 2 bước sau khi qua ngách', baiLam: bai(['go_echo()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 8, nhip: 6 },
      goiY: [
        'go_echo() đưa R1 tới đúng ô chuông đá cũng là cửa ngách đầu, làm R1 dịch chuyển sang cửa ra.',
        'Thêm forward(2) ở dòng thứ hai để đi tới cờ.'
      ]
    }),

    manHangDong(7, 'luyen', {
      ten: 'Chế lệnh: ngách vang âm',
      taoHam: ['tunnel_echo'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward', 'go_echo'],
      deBai: 'Chế tạo hàm tunnel_echo(n): gọi go_echo() để lần theo tiếng chuông vào cửa ngách ngầm, sau khi sang cửa bên kia thì tiến tiếp forward(n) bước.',
      veMaMau: 'Chương trình chính gọi tunnel_echo(3). Em hãy hoàn thiện thân hàm tunnel_echo(n).',
      san: [
        ['########', '#.I.####', '########', '###.IIF#', '########'],
        ['#########', '#.II.####', '#########', '####.IIF#', '#########']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [{ x: 3, y: 1, not: 1, phamVi: 8 }],
        [{ x: 4, y: 1, not: 1, phamVi: 8 }]
      ],
      ngachHang: [
        [{ a: { x: 3, y: 1 }, b: { x: 3, y: 3 } }],
        [{ a: { x: 4, y: 1 }, b: { x: 4, y: 3 } }]
      ],
      maMau: bai(['tunnel_echo(3)']),
      loiGiai: bai(
        ['tunnel_echo(3)'],
        [],
        [ham('tunnel_echo', ['go_echo()', 'forward(n)'], ['n'])]
      ),
      loiSai: [
        { moTa: 'Quên gọi forward(n) trong tunnel_echo', baiLam: bai(['tunnel_echo(3)']), hamCuaEmMoi: [ham('tunnel_echo', ['go_echo()'], ['n'])], phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 9, nhip: 6 },
      goiY: [
        'Trong tunnel_echo(n), gọi go_echo() ở dòng 1 và forward(n) ở dòng 2.'
      ]
    }),

    manHangDong(8, 'bien-the', {
      ten: 'Ngách ngầm dẫn vào mạch âm',
      mucTieu: 'choi-dieu', dieuToiCo: true,
      dieu: ['xx', 'xxx'],
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'march_beat', 'go_echo', 'echo_beat', 'tunnel_echo'],
      deBai: 'Sau khi chui qua ngách hang có gắn chuông đá và đi tiếp 2 bước rồi rẽ phải, R1 cần vừa tiến vừa gõ nhịp tới chuông đá thứ hai ở ô cờ.',
      veMaMau: 'Mã mẫu mới đi qua ngách và tiến 2 bước.',
      san: [
        ['#######', '#.I.###', '#######', '###.I.#', '#####I#', '#####F#', '#######'],
        ['########', '#.II.###', '########', '####.I.#', '######I#', '######I#', '######F#', '########']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [{ x: 3, y: 1, not: 1, phamVi: 8 }, { x: 5, y: 5, not: 2, phamVi: 2 }],
        [{ x: 4, y: 1, not: 1, phamVi: 8 }, { x: 6, y: 6, not: 2, phamVi: 3 }]
      ],
      ngachHang: [
        [{ a: { x: 3, y: 1 }, b: { x: 3, y: 3 } }],
        [{ a: { x: 4, y: 1 }, b: { x: 4, y: 3 } }]
      ],
      maMau: bai(['tunnel_echo(2)']),
      loiGiai: bai(['tunnel_echo(2)', 'turn_right()', 'echo_beat()']),
      loiSai: [
        { moTa: 'Chưa rẽ phải và gọi echo_beat()', baiLam: bai(['tunnel_echo(2)']), phaiCoMa: ['chua-du-dieu'] }
      ],
      sao: { o: 19, nhip: 9 },
      goiY: [
        'Sau tunnel_echo(2), gọi turn_right() để hướng xuống phía Nam.',
        'Sau đó gọi echo_beat() để vừa tiến tới chuông ở ô cờ vừa gõ nhịp.'
      ]
    }),

    manHangDong(9, 'bien-the', {
      ten: 'Chế lệnh: nhảy ngách rẽ góc',
      taoHam: ['cave_hop'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'go_echo', 'tunnel_echo'],
      deBai: 'Chế tạo hàm cave_hop(n): gọi tunnel_echo(n) để đi qua ngách hang có chuông đá và tiến n bước, sau đó gọi turn_right().',
      veMaMau: 'Chương trình chính gọi cave_hop(2) rồi go_echo(). Hãy hoàn thiện thân hàm cave_hop(n).',
      san: [
        ['#######', '#.I.###', '#######', '###.I.#', '#####I#', '#####F#', '#######'],
        ['#########', '#.III.###', '#########', '#####.I.#', '#######I#', '#######I#', '#######F#', '#########']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [{ x: 3, y: 1, not: 1, phamVi: 8 }, { x: 5, y: 5, not: 2, phamVi: 2 }],
        [{ x: 5, y: 1, not: 1, phamVi: 8 }, { x: 7, y: 6, not: 2, phamVi: 3 }]
      ],
      ngachHang: [
        [{ a: { x: 3, y: 1 }, b: { x: 3, y: 3 } }],
        [{ a: { x: 5, y: 1 }, b: { x: 5, y: 3 } }]
      ],
      maMau: bai(['cave_hop(2)', 'go_echo()']),
      loiGiai: bai(
        ['cave_hop(2)', 'go_echo()'],
        [],
        [ham('cave_hop', ['tunnel_echo(n)', 'turn_right()'], ['n'])]
      ),
      loiSai: [
        { moTa: 'Quên gọi turn_right() trong cave_hop', baiLam: bai(['cave_hop(2)', 'go_echo()']), hamCuaEmMoi: [ham('cave_hop', ['tunnel_echo(n)'], ['n'])], phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 14, nhip: 10 },
      goiY: [
        'Trong cave_hop(n), gọi tunnel_echo(n) rồi turn_right().'
      ]
    }),

    manHangDong(10, 'trum', {
      ten: 'Trùm Sân hang động: Mê cung ngách đá',
      nhipTheo: 'tong',
      mucTieu: 'choi-dieu', dieuToiCo: true,
      dieu: ['xx', 'xxx'],
      huyHieu: { ma: 'san-hang-dong', ten: 'Huy hiệu Ngách hang đá vôi' },
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'march_beat', 'go_echo', 'echo_beat', 'tunnel_echo', 'cave_hop'],
      deBai: 'Thử thách Trùm Sân hang động trên 2 sân: dùng cave_hop(2) để vượt ngách ngầm thứ nhất và rẽ phải, dùng tiếp cave_hop(1) để vượt ngách ngầm thứ hai và rẽ phải, cuối cùng gọi echo_beat() để gõ nhịp về cờ.',
      veMaMau: 'Mã mẫu mới thực hiện bước nhảy ngách đầu tiên cave_hop(2).',
      san: [
        ['#######', '#.I.###', '###.I.#', '#####.#', '#####.#', '###FI.#', '#######'],
        ['########', '#.II.###', '####.I.#', '######.#', '######.#', '###FII.#', '########']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [
          { x: 3, y: 1, not: 1, phamVi: 2 },
          { x: 5, y: 3, not: 2, phamVi: 1 },
          { x: 3, y: 5, not: 3, phamVi: 2 }
        ],
        [
          { x: 4, y: 1, not: 1, phamVi: 3 },
          { x: 6, y: 3, not: 2, phamVi: 1 },
          { x: 3, y: 5, not: 3, phamVi: 3 }
        ]
      ],
      ngachHang: [
        [{ a: { x: 3, y: 1 }, b: { x: 3, y: 2 } }, { a: { x: 5, y: 3 }, b: { x: 5, y: 4 } }],
        [{ a: { x: 4, y: 1 }, b: { x: 4, y: 2 } }, { a: { x: 6, y: 3 }, b: { x: 6, y: 4 } }]
      ],
      maMau: bai(['cave_hop(2)']),
      loiGiai: bai(['cave_hop(2)', 'cave_hop(1)', 'echo_beat()']),
      loiSai: [
        { moTa: 'Mới vượt ngách đầu tiên', baiLam: bai(['cave_hop(2)']), phaiCoMa: ['chua-du-dieu'] }
      ],
      sao: { o: 21, nhip: 22 },
      goiY: [
        'Sau cave_hop(2), gọi cave_hop(1) để qua ngách thứ hai và xoay về hướng Tây.',
        'Cuối cùng gọi echo_beat() để tiến về cờ đồng thời phát xung âm.'
      ]
    }),

    /* ========================================================================
       CHƯƠNG 2: che-hang-dong — Chế lệnh: vượt ngách hang (10 màn)
       ====================================================================== */
    manCheHangDong(1, 'lam-quen', {
      ten: 'Chế lệnh: vang qua ngách rẽ góc',
      taoHam: ['echo_tunnel_turn'], chiChay: true, chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'go_echo'],
      deBai: 'Màn mở đầu Chương 2: khi cả cửa ngách và góc cua phía sau ngách đều có chuông đá, hàm echo_tunnel_turn() chỉ cần gọi go_echo() hai lần liên tiếp rồi turn_right(). Bấm Chạy để xem hàm hoạt động.',
      veMaMau: 'Lần go_echo() thứ nhất đưa R1 vào ngách để vọt sang tầng dưới; lần go_echo() thứ hai đo tiếp chuông ở góc cua và đi tới đó.',
      san: [
        ['########', '#.I.####', '########', '####.I.#', '######I#', '######F#', '########'],
        ['#########', '#.II.####', '#########', '#########', '#####.I.#', '#######I#', '#######F#', '#########']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [{ x: 3, y: 1, not: 1, phamVi: 2 }, { x: 6, y: 3, not: 2, phamVi: 2 }],
        [{ x: 4, y: 1, not: 1, phamVi: 3 }, { x: 7, y: 4, not: 2, phamVi: 2 }]
      ],
      ngachHang: [
        [{ a: { x: 3, y: 1 }, b: { x: 4, y: 3 } }],
        [{ a: { x: 4, y: 1 }, b: { x: 5, y: 4 } }]
      ],
      maMau: bai(
        ['echo_tunnel_turn()', 'forward(2)'],
        [],
        [ham('echo_tunnel_turn', ['go_echo()', 'go_echo()', 'turn_right()'])]
      ),
      loiGiai: bai(
        ['echo_tunnel_turn()', 'forward(2)'],
        [],
        [ham('echo_tunnel_turn', ['go_echo()', 'go_echo()', 'turn_right()'])]
      ),
      sao: { o: 13, nhip: 8 },
      goiY: [
        'Bấm nút Chạy để quan sát echo_tunnel_turn() và mở khóa hàm.'
      ]
    }),

    manCheHangDong(2, 'lam-quen', {
      ten: 'Vượt ngách gõ nhịp',
      mucTieu: 'choi-dieu', dieuToiCo: true,
      dieu: ['xx', 'xxx'],
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'march_beat', 'go_echo', 'echo_beat', 'echo_tunnel_turn'],
      deBai: 'Sử dụng hàm echo_tunnel_turn() vừa mở khóa để vượt ngách ngầm và rẽ phải ở góc cua, sau đó gọi echo_beat() để vừa tiến về cờ vừa gõ nhịp.',
      veMaMau: 'Mã mẫu mới gọi echo_tunnel_turn() mà chưa gọi echo_beat().',
      san: [
        ['########', '#.I.####', '########', '####.I.#', '######I#', '######F#', '########'],
        ['#########', '#.II.####', '#########', '#########', '#####.I.#', '#######I#', '#######I#', '#######F#', '#########']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [
          { x: 3, y: 1, not: 1, phamVi: 2 },
          { x: 6, y: 3, not: 2, phamVi: 2 },
          { x: 6, y: 5, not: 3, phamVi: 2 }
        ],
        [
          { x: 4, y: 1, not: 1, phamVi: 3 },
          { x: 7, y: 4, not: 2, phamVi: 2 },
          { x: 7, y: 7, not: 3, phamVi: 3 }
        ]
      ],
      ngachHang: [
        [{ a: { x: 3, y: 1 }, b: { x: 4, y: 3 } }],
        [{ a: { x: 4, y: 1 }, b: { x: 5, y: 4 } }]
      ],
      maMau: bai(['echo_tunnel_turn()']),
      loiGiai: bai(['echo_tunnel_turn()', 'echo_beat()']),
      loiSai: [
        { moTa: 'Chưa gọi echo_beat() sau echo_tunnel_turn()', baiLam: bai(['echo_tunnel_turn()']), phaiCoMa: ['chua-du-dieu'] }
      ],
      sao: { o: 19, nhip: 9 },
      goiY: [
        'Thêm echo_beat() ở dòng thứ hai.'
      ]
    }),

    manCheHangDong(3, 'lam-quen', {
      ten: 'Nhảy đôi qua hai tầng ngách',
      hamCuaEmCan: ['move', 'forward', 'go_echo'],
      deBai: 'Cả hai cửa ngách ở tầng 1 và tầng 3 đều có gắn chuông đá. Hãy gọi go_echo() hai lần để chui qua liên tiếp 2 ngách ngầm xuống tầng 5, rồi tiến 2 bước tới cờ.',
      veMaMau: 'Mã mẫu mới gọi go_echo() một lần nên R1 đang dừng ở tầng giữa.',
      san: [
        ['##########', '#.I.######', '##########', '####.I.###', '##########', '######.IF#', '##########'],
        ['###########', '#.I.#######', '###########', '####.II.###', '###########', '#######.IF#', '###########']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [{ x: 3, y: 1, not: 1, phamVi: 2 }, { x: 6, y: 3, not: 2, phamVi: 2 }],
        [{ x: 3, y: 1, not: 1, phamVi: 2 }, { x: 7, y: 3, not: 2, phamVi: 3 }]
      ],
      ngachHang: [
        [{ a: { x: 3, y: 1 }, b: { x: 4, y: 3 } }, { a: { x: 6, y: 3 }, b: { x: 6, y: 5 } }],
        [{ a: { x: 3, y: 1 }, b: { x: 4, y: 3 } }, { a: { x: 7, y: 3 }, b: { x: 7, y: 5 } }]
      ],
      maMau: bai(['go_echo()']),
      loiGiai: bai(['go_echo()', 'go_echo()', 'forward(2)']),
      loiSai: [
        { moTa: 'Mới qua ngách đầu tiên', baiLam: bai(['go_echo()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 9, nhip: 7 },
      goiY: [
        'Gọi thêm go_echo() lần thứ hai để vào ngách tiếp theo, rồi gọi forward(2).'
      ]
    }),

    manCheHangDong(4, 'lam-quen', {
      ten: 'Chế lệnh: xuyên hai tầng ngách',
      taoHam: ['double_tunnel'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward', 'go_echo'],
      deBai: 'Đóng gói cú nhảy 2 ngách liên tiếp thành hàm double_tunnel(n): gọi go_echo() hai lần để vượt 2 ngách có chuông đá, sau đó tiến forward(n) bước.',
      veMaMau: 'Chương trình chính gọi double_tunnel(2). Em hãy hoàn thiện thân hàm double_tunnel(n).',
      san: [
        ['#########', '#.I.#####', '#########', '###.I.###', '#########', '#####.IF#', '#########'],
        ['##########', '#.II.#####', '##########', '####.I.###', '##########', '######.IF#', '##########']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [{ x: 3, y: 1, not: 1, phamVi: 2 }, { x: 5, y: 3, not: 2, phamVi: 2 }],
        [{ x: 4, y: 1, not: 1, phamVi: 3 }, { x: 6, y: 3, not: 2, phamVi: 2 }]
      ],
      ngachHang: [
        [{ a: { x: 3, y: 1 }, b: { x: 3, y: 3 } }, { a: { x: 5, y: 3 }, b: { x: 5, y: 5 } }],
        [{ a: { x: 4, y: 1 }, b: { x: 4, y: 3 } }, { a: { x: 6, y: 3 }, b: { x: 6, y: 5 } }]
      ],
      maMau: bai(['double_tunnel(2)']),
      loiGiai: bai(
        ['double_tunnel(2)'],
        [],
        [ham('double_tunnel', ['go_echo()', 'go_echo()', 'forward(n)'], ['n'])]
      ),
      loiSai: [
        { moTa: 'Quên gọi forward(n) cuối hàm double_tunnel', baiLam: bai(['double_tunnel(2)']), hamCuaEmMoi: [ham('double_tunnel', ['go_echo()', 'go_echo()'], ['n'])], phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 10, nhip: 7 },
      goiY: [
        'Trong double_tunnel(n), gọi go_echo(), go_echo(), rồi forward(n).'
      ]
    }),

    manCheHangDong(5, 'luyen', {
      ten: 'Tập hợp bước sau ngách đôi',
      hamCuaEmCan: ['move', 'forward', 'count_unique', 'go_echo', 'double_tunnel'],
      deBai: 'Sau khi vượt 2 ngách ngầm, số bước cuối tới cờ bằng đúng số phần tử phân biệt trong danh sách a = [4, 7, 4, 9, 7]. Hãy truyền count_unique(a) vào double_tunnel(...).',
      veMaMau: 'Mã mẫu truyền số cứng 1 vào double_tunnel(1) nên dừng trước cờ.',
      san: [
        ['#########', '#..######', '#########', '##.I.####', '#########', '####.IIF#', '#########'],
        ['##########', '#.I.######', '##########', '###.I.####', '##########', '#####.IIF#', '##########']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [{ x: 2, y: 1, not: 1, phamVi: 1 }, { x: 4, y: 3, not: 2, phamVi: 2 }],
        [{ x: 3, y: 1, not: 1, phamVi: 2 }, { x: 5, y: 3, not: 2, phamVi: 2 }]
      ],
      ngachHang: [
        [{ a: { x: 2, y: 1 }, b: { x: 2, y: 3 } }, { a: { x: 4, y: 3 }, b: { x: 4, y: 5 } }],
        [{ a: { x: 3, y: 1 }, b: { x: 3, y: 3 } }, { a: { x: 5, y: 3 }, b: { x: 5, y: 5 } }]
      ],
      maMau: bai(['a = [4, 7, 4, 9, 7]', 'double_tunnel(1)']),
      loiGiai: bai(['a = [4, 7, 4, 9, 7]', 'double_tunnel(count_unique(a))']),
      loiSai: [
        { moTa: 'Giữ nguyên double_tunnel(1): dừng trước cờ 2 ô', baiLam: bai(['a = [4, 7, 4, 9, 7]', 'double_tunnel(1)']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 11, nhip: 7 },
      goiY: [
        'Danh sách a có 3 giá trị phân biệt là 4, 7, 9.',
        'Đổi double_tunnel(1) thành double_tunnel(count_unique(a)).'
      ]
    }),

    manCheHangDong(6, 'luyen', {
      ten: 'Từ điển khoảng cách ngách',
      hamCuaEmCan: ['move', 'forward', 'go_echo'],
      deBai: 'Khoảng cách k = hear() từ chỗ xuất phát tới chuông đá ở cửa ngách cho biết khóa trong từ điển d = {2: 3, 4: 2}. Sau khi vào ngách bằng go_echo(), hãy đi tiếp d[k] bước để tới cờ ở cả 2 sân.',
      veMaMau: 'Mã mẫu chưa đi tiếp d[k] bước sau khi chui qua ngách.',
      san: [
        ['########', '#.I.####', '########', '###.IIF#', '########'],
        ['#########', '#.III.###', '#########', '#####.IF#', '#########']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [{ x: 3, y: 1, not: 1, phamVi: 8 }],
        [{ x: 5, y: 1, not: 1, phamVi: 8 }]
      ],
      ngachHang: [
        [{ a: { x: 3, y: 1 }, b: { x: 3, y: 3 } }],
        [{ a: { x: 5, y: 1 }, b: { x: 5, y: 3 } }]
      ],
      maMau: bai(['d = {2: 3, 4: 2}', 'k = hear()', 'go_echo()']),
      loiGiai: bai(['d = {2: 3, 4: 2}', 'k = hear()', 'go_echo()', 'forward(d[k])']),
      loiSai: [
        { moTa: 'Chưa tiến d[k] bước sau khi qua ngách', baiLam: bai(['d = {2: 3, 4: 2}', 'k = hear()', 'go_echo()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 10, nhip: 6 },
      goiY: [
        'Lưu k = hear() trước khi gọi go_echo().',
        'Sau go_echo(), gọi forward(d[k]).'
      ]
    }),

    manCheHangDong(7, 'luyen', {
      ten: 'Chế lệnh: ngách tra từ điển',
      taoHam: ['tunnel_dict_step'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward', 'go_echo'],
      deBai: 'Chế tạo hàm tunnel_dict_step(d) nhận từ điển d: đo k = hear(), gọi go_echo() để chui qua ngách ngầm tại chuông đá, rồi đi tiếp forward(d[k]) bước.',
      veMaMau: 'Chương trình chính đã khởi tạo d và gọi tunnel_dict_step(d). Hãy hoàn thiện thân hàm tunnel_dict_step(d).',
      san: [
        ['########', '#.I.####', '########', '###.IIF#', '########'],
        ['#########', '#.III.###', '#########', '#####.IF#', '#########']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [{ x: 3, y: 1, not: 1, phamVi: 8 }],
        [{ x: 5, y: 1, not: 1, phamVi: 8 }]
      ],
      ngachHang: [
        [{ a: { x: 3, y: 1 }, b: { x: 3, y: 3 } }],
        [{ a: { x: 5, y: 1 }, b: { x: 5, y: 3 } }]
      ],
      maMau: bai(['d = {2: 3, 4: 2}', 'tunnel_dict_step(d)']),
      loiGiai: bai(
        ['d = {2: 3, 4: 2}', 'tunnel_dict_step(d)'],
        [],
        [ham('tunnel_dict_step', ['k = hear()', 'go_echo()', 'forward(d[k])'], ['d'])]
      ),
      loiSai: [
        { moTa: 'Quên gọi forward(d[k]) trong tunnel_dict_step', baiLam: bai(['d = {2: 3, 4: 2}', 'tunnel_dict_step(d)']), hamCuaEmMoi: [ham('tunnel_dict_step', ['k = hear()', 'go_echo()'], ['d'])], phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 11, nhip: 6 },
      goiY: [
        'Trong tunnel_dict_step(d), viết 3 dòng: k = hear(), go_echo(), forward(d[k]).'
      ]
    }),

    manCheHangDong(8, 'bien-the', {
      ten: 'Tra bản đồ qua ngách vào mạch âm',
      mucTieu: 'choi-dieu', dieuToiCo: true,
      dieu: ['xx', 'xxx'],
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'march_beat', 'go_echo', 'echo_beat', 'tunnel_dict_step'],
      deBai: 'Sau khi vượt ngách bằng tunnel_dict_step(d), R1 đứng ở góc cua. Hãy xoay phải rồi gọi echo_beat() để vừa tiến về cờ vừa gõ nhịp.',
      veMaMau: 'Mã mẫu mới thực hiện tunnel_dict_step(d).',
      san: [
        ['########', '#.I.####', '########', '###.II.#', '######I#', '######F#', '########'],
        ['#########', '#.III.###', '#####.I.#', '#######I#', '#######I#', '#######F#', '#########']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [{ x: 3, y: 1, not: 1, phamVi: 2 }, { x: 6, y: 5, not: 2, phamVi: 2 }],
        [{ x: 5, y: 1, not: 1, phamVi: 4 }, { x: 7, y: 5, not: 2, phamVi: 3 }]
      ],
      ngachHang: [
        [{ a: { x: 3, y: 1 }, b: { x: 3, y: 3 } }],
        [{ a: { x: 5, y: 1 }, b: { x: 5, y: 2 } }]
      ],
      maMau: bai(['d = {2: 3, 4: 2}', 'tunnel_dict_step(d)']),
      loiGiai: bai(['d = {2: 3, 4: 2}', 'tunnel_dict_step(d)', 'turn_right()', 'echo_beat()']),
      loiSai: [
        { moTa: 'Chưa xoay phải và gọi echo_beat()', baiLam: bai(['d = {2: 3, 4: 2}', 'tunnel_dict_step(d)']), phaiCoMa: ['chua-du-dieu'] }
      ],
      sao: { o: 21, nhip: 10 },
      goiY: [
        'Sau tunnel_dict_step(d), gọi turn_right() để hướng xuống phía Nam.',
        'Sau đó gọi echo_beat() để tiến tới chuông ở ô cờ và gõ đúng giai điệu.'
      ]
    }),

    manCheHangDong(9, 'bien-the', {
      ten: 'Kết hợp dò âm và ngách từ điển',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'go_echo', 'tunnel_echo', 'cave_hop', 'tunnel_dict_step'],
      deBai: 'Ở màn này, trước hết R1 vượt ngách đầu bằng tunnel_dict_step(d), sau đó rẽ phải và vượt tiếp ngách thứ hai bằng cave_hop(1), cuối cùng gọi go_echo() để về đích.',
      veMaMau: 'Mã mẫu mới vượt ngách đầu tiên và rẽ phải.',
      san: [
        ['########', '#.I.####', '###.II.#', '######.#', '######.#', '###FII.#', '########'],
        ['#########', '#.III.###', '#####.I.#', '#######.#', '#######.#', '####FII.#', '#########']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [
          { x: 3, y: 1, not: 1, phamVi: 2 },
          { x: 6, y: 3, not: 2, phamVi: 1 },
          { x: 3, y: 5, not: 3, phamVi: 3 }
        ],
        [
          { x: 5, y: 1, not: 1, phamVi: 4 },
          { x: 7, y: 3, not: 2, phamVi: 1 },
          { x: 4, y: 5, not: 3, phamVi: 3 }
        ]
      ],
      ngachHang: [
        [{ a: { x: 3, y: 1 }, b: { x: 3, y: 2 } }, { a: { x: 6, y: 3 }, b: { x: 6, y: 4 } }],
        [{ a: { x: 5, y: 1 }, b: { x: 5, y: 2 } }, { a: { x: 7, y: 3 }, b: { x: 7, y: 4 } }]
      ],
      maMau: bai(['d = {2: 3, 4: 2}', 'tunnel_dict_step(d)', 'turn_right()']),
      loiGiai: bai(['d = {2: 3, 4: 2}', 'tunnel_dict_step(d)', 'turn_right()', 'cave_hop(1)', 'go_echo()']),
      loiSai: [
        { moTa: 'Chưa gọi cave_hop(1) và go_echo() ở nửa sau', baiLam: bai(['d = {2: 3, 4: 2}', 'tunnel_dict_step(d)', 'turn_right()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 20, nhip: 13 },
      goiY: [
        'Sau turn_right(), gọi cave_hop(1) để chui qua ngách thứ hai, tiến 1 bước và xoay phải.',
        'Cuối cùng gọi go_echo() để tới chuông ở ô cờ.'
      ]
    }),

    manCheHangDong(10, 'trum', {
      ten: 'Trùm Chế tác hang động: Đại lộ lòng đất',
      nhipTheo: 'tong',
      mucTieu: 'choi-dieu', dieuToiCo: true,
      dieu: ['xx', 'xxx'],
      huyHieu: { ma: 'che-hang-dong', ten: 'Huy hiệu Chế lệnh: vượt ngách hang' },
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'march_beat', 'go_echo', 'echo_beat', 'tunnel_echo', 'cave_hop', 'tunnel_dict_step'],
      deBai: 'Thử thách Trùm Chế tác hang động (màn 80 khép lại nửa đầu Mùa 8): dùng tunnel_dict_step(d) để vượt ngách ngầm đầu tiên theo từ điển d, rẽ phải rồi dùng cave_hop(1) vượt ngách ngầm thứ hai, cuối cùng gọi echo_beat() để vừa tiến về cờ vừa gõ đúng giai điệu.',
      veMaMau: 'Mã mẫu mới thực hiện tunnel_dict_step(d) và turn_right().',
      san: [
        ['########', '#.I.####', '###.II.#', '######.#', '######.#', '####FI.#', '########'],
        ['#########', '#.III.###', '#####.I.#', '#######.#', '#######.#', '####FII.#', '#########']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      chuongDa: [
        [
          { x: 3, y: 1, not: 1, phamVi: 2 },
          { x: 6, y: 3, not: 2, phamVi: 1 },
          { x: 4, y: 5, not: 3, phamVi: 2 }
        ],
        [
          { x: 5, y: 1, not: 1, phamVi: 4 },
          { x: 7, y: 3, not: 2, phamVi: 1 },
          { x: 4, y: 5, not: 3, phamVi: 3 }
        ]
      ],
      ngachHang: [
        [{ a: { x: 3, y: 1 }, b: { x: 3, y: 2 } }, { a: { x: 6, y: 3 }, b: { x: 6, y: 4 } }],
        [{ a: { x: 5, y: 1 }, b: { x: 5, y: 2 } }, { a: { x: 7, y: 3 }, b: { x: 7, y: 4 } }]
      ],
      maMau: bai(['d = {2: 3, 4: 2}', 'tunnel_dict_step(d)', 'turn_right()']),
      loiGiai: bai(['d = {2: 3, 4: 2}', 'tunnel_dict_step(d)', 'turn_right()', 'cave_hop(1)', 'echo_beat()']),
      loiSai: [
        { moTa: 'Chưa gọi cave_hop(1) và echo_beat() ở nửa sau', baiLam: bai(['d = {2: 3, 4: 2}', 'tunnel_dict_step(d)', 'turn_right()']), phaiCoMa: ['chua-du-dieu'] }
      ],
      sao: { o: 26, nhip: 24 },
      goiY: [
        'Sau turn_right(), gọi cave_hop(1) để qua ngách thứ hai, tiến 1 bước xuống dòng 5 rồi xoay phải về hướng Tây.',
        'Cuối cùng gọi echo_beat() để vừa tiến tới cờ vừa phát xung âm.'
      ]
    })
  ];

  if (M && M.them) M.manSanHangDong = DS;
  if (typeof module !== 'undefined' && module.exports) module.exports = M;
})();
