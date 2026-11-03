/* ============================================================================
   man-loa.js — Mùa 8 Hang động · Gói 2: Loa (viết lại 2/11, KE-HOACH-MUA-8.md)
   Chương 1: loa "Gõ đá chuông" (10 màn): note(n) phát nốt ở nhịp kế; đá chuông daChuong {x, y, not, ben} vỡ khi nghe đúng nốt ben nhịp liền
             (trong tầm 3 ô, hay trên tia thẳng trước mũi xe); vừa đi vừa phát; beat() một tiếng trống; chế play_note(n) (mùa 9 gọi, giữ thân).
   Chương 2: tap-hop "Không gõ trùng" (10 màn): tập hợp: s = set(), s = {4, 6}, s.add(n), n in s, n not in s, len(s); chế ring_once(n, s).
   Lời: "Giúp Sola với!", gợi ý của Luna, gọi người chơi là "bạn".
   ========================================================================== */
(function () {
  'use strict';

  var M = (typeof window !== 'undefined' && window.ManHoc) ||
    (typeof require === 'function' ? require('./man-chuoi-1.js') : null);

  var GOC_LOA = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'note', 'beat'];

  function bai(chinh, ham, moi) {
    return { chinh: chinh, hamCuaMan: ham || [], hamCuaEmMoi: moi || [] };
  }
  function ham(ten, than, thamSo) {
    return { ten: ten, than: than, thamSo: thamSo || [] };
  }
  function da(x, y, not, ben) { return { x: x, y: y, not: not, ben: ben || 1 }; }

  function manLoa(so, hang, ds) {
    return Object.assign({
      chuong: 'loa', so: so, hang: hang,
      vo: 'hang', loaiRobot: 'gai',
      robot: { than: 'gai', tay: 'loa', camBien: [] },
      hamGoc: GOC_LOA.slice(),
      hamCuaEmCan: [],
      taoHam: [],
      cauTruc: ['for'],
      khung: { chinh: 10, moiHam: 8, cauTruc: ['for'] },
      mucTieu: 'toi-co'
    }, ds);
  }

  function manTapHop(so, hang, ds) {
    return Object.assign({
      chuong: 'tap-hop', so: so, hang: hang,
      vo: 'hang', loaiRobot: 'gai',
      robot: { than: 'gai', tay: 'loa', camBien: [] },
      hamGoc: GOC_LOA.slice(),
      hamCuaEmCan: [],
      taoHam: [],
      cauTruc: ['for', 'if', 'else', 'dict', 'set'],
      khung: { chinh: 10, moiHam: 8, cauTruc: ['for', 'if', 'else', 'dict', 'set'] },
      mucTieu: 'toi-co'
    }, ds);
  }

  var PLAY_NOTE = ham('play_note', ['note(n)', 'wait()'], ['n']);
  var RING_ONCE = ham('ring_once', ['if n not in s:', '    s.add(n)', '    play_note(n)'], ['n', 's']);

  var DS = [
    /* ========================================================================
       CHƯƠNG 1: loa — Gõ đá chuông
       ====================================================================== */
    manLoa(1, 'lam-quen', {
      ten: 'Loa gõ vỡ đá',
      chiChay: true, chinhCoDinh: true,
      hamCuaEmCan: ['forward'],
      deBai: 'Sola làm mẫu. R1 lắp thêm loa. Khối đá chuông chắn lối, số trên khối là nốt của nó. note(3) bảo loa phát nốt 3, wait() cho nhịp trôi để nốt vang lên. Đá chuông nghe đúng nốt của mình thì vỡ. Bấm Chạy để xem.',
      veMaMau: 'Chương trình Sola viết sẵn và đã khoá: phát nốt 3 rồi đi tới cờ.',
      san: [
        '#######',
        '#.IIIF#',
        '#######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      daChuong: [da(3, 1, 3)],
      maMau: bai(['note(3)', 'wait()', 'forward(4)']),
      loiGiai: bai(['note(3)', 'wait()', 'forward(4)']),
      sao: { o: 8, nhip: 5 },
      goiY: [
        'Luna: note(n) chỉ chọn nốt. Nốt vang ở nhịp kế tiếp, nên sau note(3) có wait().',
        'Luna: Nốt từ 1 tới 8. Đá chuông chỉ vỡ khi nghe đúng số ghi trên nó.'
      ]
    }),

    manLoa(2, 'lam-quen', {
      ten: 'Đúng nốt mới vỡ',
      hamCuaEmCan: ['forward', 'turn_right'],
      deBai: 'Giúp Sola với! Sola phát nhầm nốt nên đá chuông vẫn đứng nguyên. Nhìn số trên khối đá rồi sửa nốt.',
      veMaMau: 'Chạy thử: đá chuông không vỡ, R1 đâm vào đá.',
      san: [
        '########',
        '#.IIII##',
        '#uuuuI##',
        '#####F##',
        '########'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      daChuong: [da(3, 1, 5)],
      maMau: bai(['note(2)', 'wait()', 'forward(4)', 'turn_right()', 'forward(2)']),
      loiGiai: bai(['note(5)', 'wait()', 'forward(4)', 'turn_right()', 'forward(2)']),
      loiSai: [
        { moTa: 'Để nguyên note(2): đá chuông nốt 5 không vỡ, R1 đâm vào đá', baiLam: bai(['note(2)', 'wait()', 'forward(4)', 'turn_right()', 'forward(2)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Quên wait(): nốt chưa kịp vang thì R1 đã đi', baiLam: bai(['note(5)', 'forward(4)', 'turn_right()', 'forward(2)']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 12, nhip: 8 },
      goiY: [
        'Luna: Số trên khối đá chuông là nốt nó cần nghe.',
        'Luna: Đổi note(2) thành note(5).'
      ]
    }),

    manLoa(3, 'lam-quen', {
      ten: 'Quay loa về phía đá',
      hamCuaEmCan: ['forward', 'turn_left'],
      deBai: 'Giúp Sola với! Loa vang xa theo hướng mũi R1. Sang hai bên, tiếng chỉ tới được 3 ô. Đá chuông ở xa bên hông R1. Quay mũi về phía đá rồi mới phát nốt.',
      veMaMau: 'Sola phát nốt khi R1 còn nhìn xuống. Chạy thử xem đá có vỡ không.',
      san: [
        '########',
        '#.IIIIF#',
        '########'
      ],
      batDau: { x: 1, y: 1, huong: 2 },
      daChuong: [da(5, 1, 4)],
      maMau: bai(['note(4)', 'wait()', 'turn_left()', 'forward(5)']),
      loiGiai: bai(['turn_left()', 'note(4)', 'wait()', 'forward(5)']),
      loiSai: [
        { moTa: 'Phát nốt trước khi quay: đá cách 4 ô bên hông nên không nghe thấy', baiLam: bai(['note(4)', 'wait()', 'turn_left()', 'forward(5)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Quay phải: mũi R1 nhìn ra vách, đá không nghe thấy', baiLam: bai(['turn_right()', 'note(4)', 'wait()', 'turn_left()', 'turn_left()', 'forward(5)']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 11, nhip: 7 },
      goiY: [
        'Luna: R1 đang nhìn xuống. Đá ở bên phải màn hình, cách 4 ô: xa hơn 3 ô nên phải quay mũi về phía nó.',
        'Luna: turn_left() trước, rồi note(4) và wait().'
      ]
    }),

    manLoa(4, 'luyen', {
      ten: 'Đá ngân hai nhịp',
      hamCuaEmCan: ['forward'],
      deBai: 'Giúp Sola với! Khối đá này có hai vạch: phải nghe đúng nốt hai nhịp liền mới vỡ. Nghỉ một nhịp là đá quên, phải đếm lại.',
      veMaMau: 'Sola mới phát một nhịp. Chạy thử: một vạch sáng lên rồi tắt.',
      san: [
        '#######',
        '#.IIIF#',
        '#######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      daChuong: [da(3, 1, 6, 2)],
      maMau: bai(['note(6)', 'wait()', 'forward(4)']),
      loiGiai: bai(['note(6)', 'wait()', 'note(6)', 'wait()', 'forward(4)']),
      loiSai: [
        { moTa: 'Phát một nhịp: đá mới sáng một vạch, R1 đâm vào đá', baiLam: bai(['note(6)', 'wait()', 'forward(4)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Nghỉ một nhịp giữa hai nốt: đá quên vạch đầu', baiLam: bai(['note(6)', 'wait()', 'wait()', 'note(6)', 'wait()', 'forward(4)']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 10, nhip: 6 },
      goiY: [
        'Luna: Mỗi vạch trên khối đá là một nhịp phải nghe.',
        'Luna: Viết note(6), wait() hai lần liền nhau.'
      ]
    }),

    manLoa(5, 'luyen', {
      ten: 'Chế lệnh: gõ một nốt',
      taoHam: ['play_note'], chinhCoDinh: true,
      hamCuaEmCan: ['forward'],
      deBai: 'Giúp Sola với! Cặp note(n), wait() lặp đi lặp lại. Chế hàm play_note(n): phát nốt n trong một nhịp. Chương trình chính đã khoá.',
      veMaMau: 'Chương trình chính gọi play_note(2) ba lần rồi đi tới cờ. Mở Xưởng hàm, chế play_note(n).',
      san: [
        '########',
        '#.IIIIF#',
        '########'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      daChuong: [da(4, 1, 2, 3)],
      maMau: bai(['play_note(2)', 'play_note(2)', 'play_note(2)', 'forward(5)']),
      loiGiai: bai(['play_note(2)', 'play_note(2)', 'play_note(2)', 'forward(5)'], [], [PLAY_NOTE]),
      loiSai: [
        { moTa: 'Chưa chế hàm play_note', baiLam: bai(['play_note(2)', 'play_note(2)', 'play_note(2)', 'forward(5)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Thân hàm thiếu wait(): ba nốt dồn vào một nhịp, đá không vỡ', baiLam: bai(['play_note(2)', 'play_note(2)', 'play_note(2)', 'forward(5)']), hamCuaEmMoi: [ham('play_note', ['note(n)'], ['n'])], phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 11, nhip: 8 },
      goiY: [
        'Luna: Thân play_note(n) có hai dòng: note(n) rồi wait().',
        'Luna: n là nốt đưa vào khi gọi: play_note(2) thì n là 2.'
      ]
    }),

    manLoa(6, 'luyen', {
      ten: 'Lặp nốt bốn nhịp',
      hamCuaEmCan: ['play_note', 'forward', 'turn_right'],
      deBai: 'Giúp Sola với! Khối đá chuông bốn vạch chắn lối rẽ xuống. Dùng vòng lặp để phát đủ bốn nhịp.',
      veMaMau: 'Sola lặp ba lần. Chạy thử xem còn thiếu mấy vạch.',
      san: [
        '#######',
        '#.III##',
        '#uuuI##',
        '#uuuI##',
        '####F##',
        '#######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      daChuong: [da(4, 2, 7, 4)],
      maMau: bai(['for i in range(3):', '    play_note(7)', 'forward(3)', 'turn_right()', 'forward(3)']),
      loiGiai: bai(['for i in range(4):', '    play_note(7)', 'forward(3)', 'turn_right()', 'forward(3)']),
      loiSai: [
        { moTa: 'Lặp ba lần: đá còn một vạch, R1 đâm vào đá', baiLam: bai(['for i in range(3):', '    play_note(7)', 'forward(3)', 'turn_right()', 'forward(3)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Viết bốn dòng play_note(7) thay vì lặp: tới cờ nhưng tốn ô', baiLam: bai(['play_note(7)', 'play_note(7)', 'play_note(7)', 'play_note(7)', 'forward(3)', 'turn_right()', 'forward(3)']) }
      ],
      sao: { o: 0, nhip: 0 },
      goiY: [
        'Luna: Đá ở ngay dưới chỗ rẽ. Từ chỗ R1 đứng tới đá là 4 ô theo đường đi, nhưng tính thẳng chỉ 3 + 1 = 4… thử xem đá có nghe không.',
        'Luna: Đá cách R1 quá 3 ô thì phải đi lại gần trước khi phát.'
      ]
    }),

    manLoa(7, 'luyen', {
      ten: 'Vừa đi vừa gõ',
      hamCuaEmCan: ['move', 'forward'],
      deBai: 'Giúp Sola với! Loa phát ở đầu nhịp, bánh vẫn lăn được trong nhịp đó. Viết note(3) ngay trước move(): R1 vừa tiến vừa phát nốt, không phải dừng.',
      veMaMau: 'Sola dừng lại gõ hai nhịp rồi mới đi: tới cờ nhưng chậm. Chạy thử rồi gộp nốt vào bước đi.',
      san: [
        '########',
        '#.IIIIF#',
        '########'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      daChuong: [da(3, 1, 3, 2)],
      maMau: bai(['note(3)', 'wait()', 'forward(5)']),
      loiGiai: bai(['for i in range(2):', '    note(3)', '    move()', 'forward(3)']),
      loiSai: [
        { moTa: 'Gõ một nhịp rồi đi: đá hai vạch không vỡ', baiLam: bai(['note(3)', 'wait()', 'forward(5)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Dừng gõ hai nhịp rồi mới đi: tới cờ nhưng thừa hai nhịp', baiLam: bai(['note(3)', 'wait()', 'note(3)', 'wait()', 'forward(5)']) }
      ],
      sao: { o: 9, nhip: 5 },
      goiY: [
        'Luna: move() có wait() bên trong. note(3) viết ngay trước move() thì nốt vang trong đúng nhịp R1 tiến.',
        'Luna: Lặp hai lần cặp note(3), move(): bước thứ hai đá vỡ ngay đầu nhịp nên R1 đi vào chỗ đá cũ được.'
      ]
    }),

    manLoa(8, 'bien-the', {
      ten: 'Báo hiệu tới nơi',
      mucTieu: 'choi-dieu', dieu: [5, 'x', 5], dieuToiCo: true,
      hamCuaEmCan: ['forward', 'turn_right', 'play_note'],
      deBai: 'Giúp Sola với! Tới cờ rồi, R1 phải phát tín hiệu cho Luna: nốt 5, một tiếng trống, nốt 5. beat() là một tiếng trống, cũng cần wait() để vang.',
      veMaMau: 'Sola đã đưa R1 tới cờ. Chạy thử rồi viết tín hiệu.',
      san: [
        '#######',
        '#.III##',
        '####I##',
        '####F##',
        '#######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['forward(3)', 'turn_right()', 'forward(2)']),
      loiGiai: bai(['forward(3)', 'turn_right()', 'forward(2)', 'play_note(5)', 'beat()', 'wait()', 'play_note(5)']),
      loiSai: [
        { moTa: 'Chưa phát tín hiệu', baiLam: bai(['forward(3)', 'turn_right()', 'forward(2)']) },
        { moTa: 'Quên tiếng trống ở giữa: hai nốt 5 liền nhau là sai tín hiệu', baiLam: bai(['forward(3)', 'turn_right()', 'forward(2)', 'play_note(5)', 'play_note(5)']), phaiCoMa: ['sai-not'] }
      ],
      sao: { o: 16, nhip: 9 },
      goiY: [
        'Luna: Tín hiệu có ba nhịp: play_note(5), rồi beat() với wait(), rồi play_note(5).',
        'Luna: Phát tín hiệu khi R1 đã đứng trên cờ.'
      ]
    }),

    manLoa(9, 'bien-the', {
      ten: 'Hai khối, hai nốt',
      hamCuaEmCan: ['play_note', 'forward'],
      deBai: 'Giúp Sola với! Hai khối đá chuông nằm liền nhau: khối nốt 3 hai vạch, khối nốt 5 một vạch. Phát nốt 5 xen giữa thì khối nốt 3 quên vạch đã đếm.',
      veMaMau: 'Sola phát 3, 5, 3. Chạy thử xem khối nào còn đứng.',
      san: [
        '########',
        '#.IIIIF#',
        '########'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      daChuong: [da(3, 1, 3, 2), da(4, 1, 5, 1)],
      maMau: bai(['play_note(3)', 'play_note(5)', 'play_note(3)', 'forward(5)']),
      loiGiai: bai(['play_note(3)', 'play_note(3)', 'play_note(5)', 'forward(5)']),
      loiSai: [
        { moTa: 'Phát 3, 5, 3: khối nốt 3 bị ngắt giữa chừng, không vỡ', baiLam: bai(['play_note(3)', 'play_note(5)', 'play_note(3)', 'forward(5)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Chỉ phát nốt 3 một nhịp: khối nốt 3 còn đứng', baiLam: bai(['play_note(3)', 'play_note(5)', 'forward(5)']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 11, nhip: 8 },
      goiY: [
        'Luna: Hai nhịp nốt 3 phải liền nhau.',
        'Luna: Phát 3, 3 rồi mới 5 (hay 5 trước rồi 3, 3).'
      ]
    }),

    manLoa(10, 'trum', {
      ten: 'Trùm: Hành lang đá chuông',
      hamCuaEmCan: ['play_note', 'forward', 'move', 'turn_right'],
      deBai: 'Giúp Sola với! Hành lang dài có ba khối đá chuông. Phá hết để tới cờ, càng ít nhịp càng tốt: vừa đi vừa gõ khi được. Chương trình chỉ được 10 ô.',
      veMaMau: 'Sola mới phá được khối đầu.',
      san: [
        '########',
        '#.IIII##',
        '#uuuuI##',
        '#uuuuI##',
        '#FIIII##',
        '########'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      daChuong: [da(3, 1, 2, 2), da(5, 3, 6, 1), da(2, 4, 4, 2)],
      maMau: bai(['for i in range(2):', '    note(2)', '    move()']),
      loiGiai: bai(['for i in range(2):', '    note(2)', '    move()', 'forward(2)', 'turn_right()', 'note(6)', 'forward(2)', 'turn_right()', 'for i in range(2):', '    note(4)', '    move()', 'forward(2)']),
      loiSai: [
        { moTa: 'Chỉ phá khối đầu: R1 dừng giữa đường', baiLam: bai(['for i in range(2):', '    note(2)', '    move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Khối cuối chỉ gõ một nhịp: R1 đâm vào đá', baiLam: bai(['for i in range(2):', '    note(2)', '    move()', 'forward(2)', 'turn_right()', 'note(6)', 'forward(2)', 'turn_right()', 'note(4)', 'forward(4)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Dừng lại gõ từng khối: tới cờ nhưng nhiều nhịp', baiLam: bai(['play_note(2)', 'play_note(2)', 'forward(4)', 'turn_right()', 'play_note(6)', 'forward(2)', 'turn_right()', 'play_note(4)', 'play_note(4)', 'forward(4)']) }
      ],
      sao: { o: 0, nhip: 0 },
      goiY: [
        'Luna: note(6) viết ngay trước forward(2) thì nốt vang trong bước đầu của forward.',
        'Luna: Khối hai vạch thì vừa đi vừa gõ hai bước liền.'
      ]
    }),

    /* ========================================================================
       CHƯƠNG 2: tap-hop — Không gõ trùng
       ====================================================================== */
    manTapHop(1, 'lam-quen', {
      ten: 'Túi nốt không trùng',
      chiChay: true, chinhCoDinh: true,
      hamCuaEmCan: ['forward'],
      deBai: 'Sola làm mẫu. Tập hợp s giống một cái túi: bỏ vào nốt đã có thì túi không nhận thêm. s.add(n) bỏ nốt n vào túi, len(s) đếm số nốt khác nhau trong túi. Bấm Chạy: R1 đi đúng len(s) ô.',
      veMaMau: 'Túi có sẵn 4 và 6. Thêm 4 (đã có) và 5 (mới): túi còn 3 nốt nên R1 đi 3 ô.',
      san: [
        '######',
        '#.IIF#',
        '######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['s = {4, 6}', 's.add(4)', 's.add(5)', 'forward(len(s))']),
      loiGiai: bai(['s = {4, 6}', 's.add(4)', 's.add(5)', 'forward(len(s))']),
      sao: { o: 9, nhip: 3 },
      goiY: [
        'Luna: s = {4, 6} tạo túi có hai nốt. s = set() tạo túi rỗng.',
        'Luna: Thêm nốt đã có trong túi thì len(s) không tăng.'
      ]
    }),

    manTapHop(2, 'lam-quen', {
      ten: 'Chế lệnh: gõ nốt mới thôi',
      taoHam: ['ring_once'], chinhCoDinh: true,
      hamCuaEmCan: ['play_note', 'forward', 'turn_right'],
      deBai: 'Giúp Sola với! Đá chuông cùng nốt trong tầm 3 ô vỡ cùng một lúc, kể cả bên kia vách. Chế ring_once(n, s): nếu nốt n chưa có trong túi s thì bỏ vào túi rồi play_note(n); có rồi thì thôi, khỏi tốn nhịp.',
      veMaMau: 'Chương trình chính đã khoá, gọi ring_once ba lần. Chế ring_once(n, s) với if n not in s:.',
      san: [
        '#######',
        '#.IIII#',
        '#####I#',
        '#FIIII#',
        '#######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      daChuong: [da(3, 1, 3), da(3, 3, 3), da(2, 3, 5)],
      maMau: bai(['s = set()', 'move()', 'ring_once(3, s)', 'forward(3)', 'turn_right()', 'forward(2)', 'turn_right()', 'ring_once(3, s)', 'ring_once(5, s)', 'forward(4)']),
      loiGiai: bai(['s = set()', 'move()', 'ring_once(3, s)', 'forward(3)', 'turn_right()', 'forward(2)', 'turn_right()', 'ring_once(3, s)', 'ring_once(5, s)', 'forward(4)'], [], [RING_ONCE]),
      loiSai: [
        { moTa: 'Chưa chế hàm ring_once', baiLam: bai(['s = set()', 'move()', 'ring_once(3, s)', 'forward(3)', 'turn_right()', 'forward(2)', 'turn_right()', 'ring_once(3, s)', 'ring_once(5, s)', 'forward(4)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Lần nào cũng gõ, không hỏi túi: tới cờ nhưng thừa một nhịp gõ lại nốt 3', baiLam: bai(['s = set()', 'move()', 'ring_once(3, s)', 'forward(3)', 'turn_right()', 'forward(2)', 'turn_right()', 'ring_once(3, s)', 'ring_once(5, s)', 'forward(4)']), hamCuaEmMoi: [ham('ring_once', ['play_note(n)'], ['n', 's'])] },
        { moTa: 'Hỏi túi mà quên bỏ nốt vào: lần sau vẫn gõ lại', baiLam: bai(['s = set()', 'move()', 'ring_once(3, s)', 'forward(3)', 'turn_right()', 'forward(2)', 'turn_right()', 'ring_once(3, s)', 'ring_once(5, s)', 'forward(4)']), hamCuaEmMoi: [ham('ring_once', ['if n not in s:', '    play_note(n)'], ['n', 's'])] }
      ],
      sao: { o: 22, nhip: 14 },
      goiY: [
        'Luna: Lần gọi đầu ring_once(3, s), nốt 3 làm vỡ cả hai khối nốt 3. Lần sau gõ lại chỉ phí nhịp.',
        'Luna: Thân hàm: if n not in s: rồi hai dòng thụt vào s.add(n) và play_note(n).'
      ]
    }),

    manTapHop(3, 'lam-quen', {
      ten: 'Túi nhớ qua vòng lặp',
      hamCuaEmCan: ['ring_once', 'move'],
      deBai: 'Giúp Sola với! Bốn khối đá nốt 4 nằm sát nhau. Trong vòng lặp, R1 tiến một ô rồi gọi ring_once(4, s). Túi s nhớ nốt 4 đã gõ nên chỉ lần đầu là phát.',
      veMaMau: 'Sola tạo túi mới trong mỗi vòng. Chạy thử: R1 gõ lại mỗi bước.',
      san: [
        '########',
        '#.IIIIF#',
        '########'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      daChuong: [da(2, 1, 4), da(3, 1, 4), da(4, 1, 4), da(5, 1, 4)],
      maMau: bai(['for i in range(5):', '    s = set()', '    ring_once(4, s)', '    move()']),
      loiGiai: bai(['s = set()', 'for i in range(5):', '    ring_once(4, s)', '    move()']),
      loiSai: [
        { moTa: 'Tạo túi mới trong vòng: túi quên nốt cũ, R1 gõ lại mỗi bước', baiLam: bai(['for i in range(5):', '    s = set()', '    ring_once(4, s)', '    move()']) },
        { moTa: 'Đi trước rồi mới gõ: R1 đâm vào khối đầu', baiLam: bai(['s = set()', 'for i in range(5):', '    move()', '    ring_once(4, s)']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 12, nhip: 6 },
      goiY: [
        'Luna: s = set() đặt trước vòng lặp: túi tạo một lần, dùng suốt.',
        'Luna: Đặt trong vòng thì mỗi vòng lại có túi rỗng mới.'
      ]
    }),

    manTapHop(4, 'luyen', {
      ten: 'Đếm nốt đã gõ',
      hamCuaEmCan: ['ring_once', 'forward', 'turn_right'],
      deBai: 'Giúp Sola với! Luna dặn: gõ xong ba khối đá thì đi xuống đúng bằng số nốt khác nhau đã gõ. Dùng len(s) làm số bước.',
      veMaMau: 'Sola đi xuống 2 ô cố định. Chạy thử rồi đổi số bước thành len(s).',
      san: [
        '#######',
        '#.III##',
        '#uuuI##',
        '#uuuI##',
        '#uuuI##',
        '####F##',
        '#######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      daChuong: [da(2, 1, 2), da(3, 1, 6), da(4, 2, 2)],
      maMau: bai(['s = set()', 'ring_once(2, s)', 'ring_once(6, s)', 'ring_once(2, s)', 'forward(3)', 'turn_right()', 'forward(2)']),
      loiGiai: bai(['s = set()', 'ring_once(2, s)', 'ring_once(6, s)', 'ring_once(2, s)', 'forward(3)', 'turn_right()', 'forward(len(s) + 2)']),
      loiSai: [
        { moTa: 'Đi xuống 2 ô: R1 dừng giữa đường', baiLam: bai(['s = set()', 'ring_once(2, s)', 'ring_once(6, s)', 'ring_once(2, s)', 'forward(3)', 'turn_right()', 'forward(2)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đi xuống len(s) ô: thiếu hai ô đá ướt phía trên', baiLam: bai(['s = set()', 'ring_once(2, s)', 'ring_once(6, s)', 'ring_once(2, s)', 'forward(3)', 'turn_right()', 'forward(len(s))']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 0, nhip: 0 },
      goiY: [
        'Luna: Gõ 2, 6, 2 thì túi có hai nốt khác nhau: len(s) là 2.',
        'Luna: Từ góc rẽ tới cờ là 4 ô: len(s) + 2.'
      ]
    }),

    manTapHop(5, 'luyen', {
      ten: 'Sửa câu hỏi túi',
      hamCuaEmCan: ['play_note', 'forward', 'turn_right'],
      deBai: 'Giúp Sola với! Hàm ring_check của màn hỏi ngược: nốt đã có trong túi thì mới gõ. Thế là chẳng bao giờ gõ. Sửa điều kiện trong hàm.',
      veMaMau: 'Mở hàm ring_check của màn. Chạm vào chữ in để đổi thành not in.',
      san: [
        '#######',
        '#.III##',
        '#uuuI##',
        '#FIII##',
        '#######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      daChuong: [da(3, 1, 7), da(3, 3, 7), da(2, 3, 1)],
      maMau: bai(['s = set()', 'ring_check(7, s)', 'forward(3)', 'turn_right()', 'forward(2)', 'turn_right()', 'ring_check(7, s)', 'ring_check(1, s)', 'forward(3)'],
        [ham('ring_check', ['if n in s:', '    s.add(n)', '    play_note(n)'], ['n', 's'])]),
      loiGiai: bai(['s = set()', 'ring_check(7, s)', 'forward(3)', 'turn_right()', 'forward(2)', 'turn_right()', 'ring_check(7, s)', 'ring_check(1, s)', 'forward(3)'],
        [ham('ring_check', ['if n not in s:', '    s.add(n)', '    play_note(n)'], ['n', 's'])]),
      loiSai: [
        { moTa: 'Để nguyên if n in s: túi rỗng nên không bao giờ gõ, R1 đâm vào đá', baiLam: bai(['s = set()', 'ring_check(7, s)', 'forward(3)', 'turn_right()', 'forward(2)', 'turn_right()', 'ring_check(7, s)', 'ring_check(1, s)', 'forward(3)'], [ham('ring_check', ['if n in s:', '    s.add(n)', '    play_note(n)'], ['n', 's'])]), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Bỏ hẳn câu hỏi: lần nào cũng gõ, thừa một nhịp', baiLam: bai(['s = set()', 'ring_check(7, s)', 'forward(3)', 'turn_right()', 'forward(2)', 'turn_right()', 'ring_check(7, s)', 'ring_check(1, s)', 'forward(3)'], [ham('ring_check', ['s.add(n)', 'play_note(n)'], ['n', 's'])]) }
      ],
      sao: { o: 0, nhip: 0 },
      goiY: [
        'Luna: n in s đúng khi túi đã có n. Lúc đầu túi rỗng nên điều kiện sai mãi.',
        'Luna: Đổi thành n not in s: chưa có thì mới gõ.'
      ]
    }),

    manTapHop(6, 'luyen', {
      ten: 'Sổ đá và túi nốt',
      khoaTD: ['dau', 'giua', 'cuoi'],
      hamCuaEmCan: ['ring_once', 'rim'],
      deBai: 'Giúp Sola với! Sổ d ghi nốt của khối đá ở đầu mỗi đoạn đường. Lật từng trang sổ: gõ nốt đó (nốt đã gõ thì thôi) rồi đi rim(3).',
      veMaMau: 'Sola viết vòng lặp nhưng quên tạo túi s. Chạy thử xem báo lỗi gì.',
      san: [
        '######',
        '#.III#',
        '#uuuI#',
        '#uuuI#',
        '#FIII#',
        '######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      daChuong: [da(2, 1, 5), da(4, 2, 5), da(3, 4, 8)],
      maMau: bai(['d = {"dau": 5, "giua": 5, "cuoi": 8}', 'for k in d:', '    ring_once(d[k], s)', '    rim(3)']),
      loiGiai: bai(['d = {"dau": 5, "giua": 5, "cuoi": 8}', 's = set()', 'for k in d:', '    ring_once(d[k], s)', '    rim(3)']),
      loiSai: [
        { moTa: 'Chưa tạo túi s: chương trình dừng ngay lần gọi đầu', baiLam: bai(['d = {"dau": 5, "giua": 5, "cuoi": 8}', 'for k in d:', '    ring_once(d[k], s)', '    rim(3)']), phaiCoMa: ['loi-chay'] },
        { moTa: 'Gõ mọi trang không hỏi túi: tới cờ nhưng thừa một nhịp', baiLam: bai(['d = {"dau": 5, "giua": 5, "cuoi": 8}', 'for k in d:', '    play_note(d[k])', '    rim(3)']) }
      ],
      sao: { o: 0, nhip: 0 },
      goiY: [
        'Luna: Thêm dòng s = set() trước vòng lặp.',
        'Luna: Hai khối nốt 5 vỡ cùng lúc ở lần gõ đầu, trang "giua" khỏi gõ lại.'
      ]
    }),

    manTapHop(7, 'bien-the', {
      ten: 'Đá hai vạch, gõ một lần',
      taoHam: ['ring_twice'], chinhCoDinh: true,
      hamCuaEmCan: ['play_note', 'forward', 'turn_right', 'turn_left'],
      deBai: 'Giúp Sola với! Mọi khối đá ở đây đều hai vạch. Chế ring_twice(n, s): nốt n chưa có trong túi thì bỏ vào túi rồi phát nốt n hai nhịp liền. Chương trình chính đã khoá.',
      veMaMau: 'Chương trình chính gọi ring_twice ở bốn chỗ. Chế ring_twice(n, s).',
      san: [
        '########',
        '#.III###',
        '#uuuI###',
        '#uuuIII#',
        '#uuuuuI#',
        '######F#',
        '########'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      daChuong: [da(3, 1, 2, 2), da(4, 3, 2, 2), da(6, 3, 6, 2), da(6, 4, 6, 2)],
      maMau: bai(['s = set()', 'move()', 'ring_twice(2, s)', 'forward(2)', 'turn_right()', 'forward(2)', 'turn_left()', 'ring_twice(2, s)', 'ring_twice(6, s)', 'forward(2)', 'turn_right()', 'ring_twice(6, s)', 'forward(2)']),
      loiGiai: bai(['s = set()', 'move()', 'ring_twice(2, s)', 'forward(2)', 'turn_right()', 'forward(2)', 'turn_left()', 'ring_twice(2, s)', 'ring_twice(6, s)', 'forward(2)', 'turn_right()', 'ring_twice(6, s)', 'forward(2)'], [], [
        ham('ring_twice', ['if n not in s:', '    s.add(n)', '    for i in range(2):', '        play_note(n)'], ['n', 's'])
      ]),
      loiSai: [
        { moTa: 'Chưa chế hàm ring_twice', baiLam: bai(['s = set()', 'move()', 'ring_twice(2, s)', 'forward(2)', 'turn_right()', 'forward(2)', 'turn_left()', 'ring_twice(2, s)', 'ring_twice(6, s)', 'forward(2)', 'turn_right()', 'ring_twice(6, s)', 'forward(2)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Chỉ phát một nhịp: đá hai vạch không vỡ', baiLam: bai(['s = set()', 'move()', 'ring_twice(2, s)', 'forward(2)', 'turn_right()', 'forward(2)', 'turn_left()', 'ring_twice(2, s)', 'ring_twice(6, s)', 'forward(2)', 'turn_right()', 'ring_twice(6, s)', 'forward(2)']), hamCuaEmMoi: [ham('ring_twice', ['if n not in s:', '    s.add(n)', '    play_note(n)'], ['n', 's'])], phaiCoMa: ['dam-tuong'] },
        { moTa: 'Không hỏi túi: tới cờ nhưng gõ lại cả nốt 2 lẫn nốt 6', baiLam: bai(['s = set()', 'move()', 'ring_twice(2, s)', 'forward(2)', 'turn_right()', 'forward(2)', 'turn_left()', 'ring_twice(2, s)', 'ring_twice(6, s)', 'forward(2)', 'turn_right()', 'ring_twice(6, s)', 'forward(2)']), hamCuaEmMoi: [ham('ring_twice', ['for i in range(2):', '    play_note(n)'], ['n', 's'])] }
      ],
      sao: { o: 0, nhip: 0 },
      goiY: [
        'Luna: Giống ring_once, chỉ khác phần gõ: lặp play_note(n) hai lần.',
        'Luna: Vòng for i in range(2): thụt vào dưới if, cùng hàng với s.add(n).'
      ]
    }),

    manTapHop(8, 'bien-the', {
      ten: 'Túi có sẵn nốt',
      hamCuaEmCan: ['ring_once', 'forward', 'turn_right'],
      deBai: 'Giúp Sola với! Hôm qua Luna đã gõ vỡ hết đá nốt 1 và nốt 8 ở khúc này. Sổ ghi đường vẫn gọi ring_once cho mọi nốt. Tạo túi có sẵn hai nốt đó để R1 khỏi gõ lại.',
      veMaMau: 'Sola tạo túi rỗng. Chạy thử: R1 gõ cả nốt 1 và nốt 8, phí hai nhịp mà còn chậm hơn dòng nước đang dâng.',
      san: [
        '#######',
        '#.IIII#',
        '#uuuuI#',
        '#uuuuF#',
        '#######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      nhipToiDa: 9,
      daChuong: [da(3, 1, 3)],
      maMau: bai(['s = set()', 'ring_once(1, s)', 'ring_once(3, s)', 'ring_once(8, s)', 'forward(4)', 'turn_right()', 'forward(2)']),
      loiGiai: bai(['s = {1, 8}', 'ring_once(1, s)', 'ring_once(3, s)', 'ring_once(8, s)', 'forward(4)', 'turn_right()', 'forward(2)']),
      loiSai: [
        { moTa: 'Túi rỗng: R1 gõ cả nốt 1 và 8, hết nhịp trước khi tới cờ', baiLam: bai(['s = set()', 'ring_once(1, s)', 'ring_once(3, s)', 'ring_once(8, s)', 'forward(4)', 'turn_right()', 'forward(2)']), phaiCoMa: ['het-nhip'] },
        { moTa: 'Bỏ cả nốt 3 vào túi: khối nốt 3 không được gõ, R1 đâm vào đá', baiLam: bai(['s = {1, 3, 8}', 'ring_once(1, s)', 'ring_once(3, s)', 'ring_once(8, s)', 'forward(4)', 'turn_right()', 'forward(2)']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 19, nhip: 8 },
      goiY: [
        'Luna: s = {1, 8} tạo túi có sẵn nốt 1 và nốt 8.',
        'Luna: Nốt 3 phải gõ thật nên đừng bỏ vào túi.'
      ]
    }),

    manTapHop(9, 'bien-the', {
      ten: 'Hai đoạn chung một túi',
      khoaTD: ['dau', 'giua', 'cuoi'],
      hamCuaEmCan: ['ring_once', 'rim'],
      deBai: 'Giúp Sola với! Hai cuốn sổ cho hai vòng quanh hai hố. Dùng chung một túi s cho cả hai vòng để nốt đã gõ ở vòng đầu không phải gõ lại.',
      veMaMau: 'Sola viết xong vòng đầu. Chạy thử rồi viết vòng sau với sổ b.',
      san: [
        '#######',
        '#.III##',
        '#uuuI##',
        '#uIII##',
        '#uIuuu#',
        '#uIIIF#',
        '#######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      daChuong: [da(2, 1, 4), da(4, 2, 7), da(3, 3, 4), da(2, 4, 7), da(3, 5, 2)],
      maMau: bai(['a = {"dau": 3, "giua": 2}', 's = set()', 'for k in a:', '    ring_once(a[k], s)', '    rim(a[k])']),
      loiGiai: bai(['a = {"dau": 3, "giua": 2}', 'b = {"dau": 2, "giua": 3}', 's = set()', 'for k in a:', '    ring_once(a[k] + 1, s)', '    rim(a[k])', 'u_turn()', 'for k in b:', '    ring_once(b[k] + 2, s)', '    rim(b[k])']),
      loiSai: [
        { moTa: 'Mới có vòng đầu: R1 dừng giữa đường', baiLam: bai(['a = {"dau": 3, "giua": 2}', 's = set()', 'for k in a:', '    ring_once(a[k], s)', '    rim(a[k])']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Tạo túi mới cho vòng sau: tới cờ nhưng gõ lại nốt 4 và 7', baiLam: bai(['a = {"dau": 3, "giua": 2}', 'b = {"dau": 2, "giua": 3}', 's = set()', 'for k in a:', '    ring_once(a[k] + 1, s)', '    rim(a[k])', 'u_turn()', 's = set()', 'for k in b:', '    ring_once(b[k] + 2, s)', '    rim(b[k])']) }
      ],
      sao: { o: 0, nhip: 0 },
      goiY: [
        'Luna: Không tạo lại túi giữa hai vòng.',
        'Luna: Đá ở đầu mỗi đoạn có nốt bằng số bước của đoạn đó cộng thêm.'
      ]
    }),

    manTapHop(10, 'trum', {
      ten: 'Trùm: Mê cung đá chuông',
      taoHam: ['ring_book'], chinhCoDinh: true,
      khoaTD: ['dau', 'giua', 'cuoi'],
      hamCuaEmCan: ['ring_once', 'rim'],
      deBai: 'Giúp Sola với! Hai sổ, mỗi trang ghi số bước của một đoạn; đá ở đầu đoạn có nốt bằng đúng số bước đó. Chế ring_book(book, s): lật từng trang, gõ nốt đó nếu chưa gõ, rồi rim(số bước). Chương trình chính đã khoá.',
      veMaMau: 'Chương trình chính dùng chung túi s cho hai lần ring_book. Chế ring_book(book, s).',
      san: [
        '########',
        '#.IIII##',
        '#uuuuI##',
        '#uIIII##',
        '#uIuuuu#',
        '#uIIIIF#',
        '########'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      daChuong: [da(2, 1, 4), da(5, 2, 2), da(2, 5, 4), da(3, 5, 4)],
      maMau: bai(['a = {"dau": 4, "giua": 2, "cuoi": 3}', 'b = {"dau": 2, "giua": 4}', 's = set()', 'ring_book(a, s)', 'u_turn()', 'turn_left()', 'ring_book(b, s)']),
      loiGiai: bai(['a = {"dau": 4, "giua": 2, "cuoi": 3}', 'b = {"dau": 2, "giua": 4}', 's = set()', 'ring_book(a, s)', 'u_turn()', 'turn_left()', 'ring_book(b, s)'], [], [
        ham('ring_book', ['for k in book:', '    ring_once(book[k], s)', '    rim(book[k])'], ['book', 's'])
      ]),
      loiSai: [
        { moTa: 'Chưa chế hàm ring_book', baiLam: bai(['a = {"dau": 4, "giua": 2, "cuoi": 3}', 'b = {"dau": 2, "giua": 4}', 's = set()', 'ring_book(a, s)', 'u_turn()', 'turn_left()', 'ring_book(b, s)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Gõ mọi trang không hỏi túi: tới cờ nhưng thừa nhịp', baiLam: bai(['a = {"dau": 4, "giua": 2, "cuoi": 3}', 'b = {"dau": 2, "giua": 4}', 's = set()', 'ring_book(a, s)', 'u_turn()', 'turn_left()', 'ring_book(b, s)']), hamCuaEmMoi: [ham('ring_book', ['for k in book:', '    play_note(book[k])', '    rim(book[k])'], ['book', 's'])] },
        { moTa: 'Đi trước rồi mới gõ: R1 đâm vào khối đầu', baiLam: bai(['a = {"dau": 4, "giua": 2, "cuoi": 3}', 'b = {"dau": 2, "giua": 4}', 's = set()', 'ring_book(a, s)', 'u_turn()', 'turn_left()', 'ring_book(b, s)']), hamCuaEmMoi: [ham('ring_book', ['for k in book:', '    rim(book[k])', '    ring_once(book[k], s)'], ['book', 's'])], phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 0, nhip: 0 },
      goiY: [
        'Luna: Thân hàm: for k in book: rồi hai dòng thụt vào ring_once(book[k], s) và rim(book[k]).',
        'Luna: Túi s đi theo cả hai lần gọi nên nốt 4 gõ ở sổ a không phải gõ lại ở sổ b.'
      ]
    })
  ];

  if (M && M.them) M.manLoa = DS;
  if (typeof module !== 'undefined' && module.exports) module.exports = M;
})();
