/* ============================================================================
   man-trum-mua-hang.js — Mùa 8 Hang động · Gói 10: Cứu hộ hang sâu (mã gói tong-hop-hang; viết lại 16/11, KE-HOACH-MUA-8.md)
   Chương 1: tong-hop-hang "Một chương trình, mọi sân" (10 màn): R1 một mình, đủ part mùa 8 (bánh gai thu / bung, loa ngân, mic nghe nốt);
             mỗi màn 2–3 hầm chạy cùng một chương trình. Nhắc lại cả 8 gói: sổ, túi nốt, tiếng vang, ngách, lướt, ngân, nghe nốt, dấu cũ.
   Chương 2: trum-mua-hang "Chế lệnh: cứu hộ hang sâu" (10 màn): echo_crack_step(), tunnel_crack_glide() (mùa 9 gọi: giữ tên và thân), ring_dive(k).
   Lời: "Giúp Sola với!", gợi ý của Luna, gọi người chơi là "bạn".
   ========================================================================== */
(function () {
  'use strict';

  var M = (typeof window !== 'undefined' && window.ManHoc) ||
    (typeof require === 'function' ? require('./man-chuoi-1.js') : null);

  function bai(chinh, ham, moi) {
    return { chinh: chinh, hamCuaMan: ham || [], hamCuaEmMoi: moi || [] };
  }
  function ham(ten, than, thamSo) {
    return { ten: ten, than: than, thamSo: thamSo || [] };
  }

  var CAU_TRUC = ['for', 'while', 'if', 'else', 'dict', 'set'];
  var GOC_TH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'note', 'beat', 'hear', 'listen', 'retract_spikes', 'extend_spikes'];
  var ROBOT_TH = { than: 'gai', tay: 'loa', camBien: [{ ma: 'am-thanh', o: 'tren', phanAm: true }] };
  function cd(x, y, not, phamVi) { return phamVi ? { x: x, y: y, not: not, phamVi: phamVi } : { x: x, y: y, not: not }; }
  function da(x, y, not, ben) { return { x: x, y: y, not: not, ben: ben || 1 }; }
  function ng(ax, ay, bx, by) { return { a: { x: ax, y: ay }, b: { x: bx, y: by } }; }
  function hai(a) { return [a, a]; }
  function ba(a) { return [a, a, a]; }
  /** Cổng nhịp đóng k nhịp đầu rồi mở hẳn. */
  function dongDau(x, y, k) { return { x: x, y: y, mo: 30, dong: k, pha: 30 }; }

  function manTH(so, hang, ds) {
    return Object.assign({
      chuong: 'tong-hop-hang', so: so, hang: hang,
      vo: 'hang', loaiRobot: 'gai', thuGai: true, phatNot: true, phanAm: true,
      robot: ROBOT_TH,
      hamGoc: GOC_TH.slice(),
      hamCuaEmCan: [],
      taoHam: [],
      cauTruc: CAU_TRUC.slice(),
      khung: { chinh: 10, moiHam: 8, cauTruc: CAU_TRUC.slice() },
      mucTieu: 'toi-co',
      nhipTheo: 'tong'
    }, ds);
  }
  function manTrum(so, hang, ds) {
    return Object.assign(manTH(so, hang, ds), { chuong: 'trum-mua-hang' }, ds);
  }

  var ECHO_CRACK_STEP = ham('echo_crack_step', ['go_echo()', 'play_note(listen())', 'move()']);
  var TUNNEL_CRACK_GLIDE = ham('tunnel_crack_glide', ['go_echo()', 'crack_switch()']);
  var RING_DIVE = ham('ring_dive', ['n = listen()', 'note(n, k)', 'wait()', 'forward(3)'], ['k']);

  var DS = [
    /* ========================================================================
       CHƯƠNG 1: tong-hop-hang — Một chương trình, mọi sân
       ====================================================================== */
    manTH(1, 'lam-quen', {
      ten: 'Một chương trình, hai hầm',
      chiChay: true, chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward', 'go_echo', 'crack_switch'],
      deBai: 'Sola làm mẫu. Cuối mùa, R1 đi cứu hộ hang sâu một mình. Một chương trình phải chạy được ở mọi hầm. Hai hầm này dải đá ướt dài khác nhau, cờ xa khác nhau. Bấm Chạy để xem.',
      veMaMau: 'Chương trình đã khoá: crack_switch() gõ đá rồi lướt, go_echo() đi theo tiếng chuông trên cờ.',
      san: [
        ['#######', '#.IIII#', '#####.#', '#####F#', '#######'],
        ['########', '#.IIIII#', '######.#', '######.#', '######F#', '########']
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      chuongDa: [[cd(5, 3, 3)], [cd(6, 4, 5)]],
      daChuong: [[da(2, 1, 6)], [da(2, 1, 2)]],
      maMau: bai(['crack_switch()', 'go_echo()']),
      loiGiai: bai(['crack_switch()', 'go_echo()']),
      sao: { o: 18, nhip: 11 },
      goiY: [
        'Luna: Không viết số cố định thì chạy được mọi hầm.',
        'Luna: listen() và hear() đo hầm giúp bạn.'
      ]
    }),

    manTH(2, 'lam-quen', {
      ten: 'Chui ngách rồi mới nghe',
      hamCuaEmCan: ['move', 'forward', 'go_echo'],
      deBai: 'Giúp Sola với! Miệng ngách cách R1 3 bước, ra ngách là tầng dưới. Chuông treo trên cờ ở tầng dưới, mỗi hầm xa khác nhau.',
      veMaMau: 'Sola đếm đường hầm 1. Chạy thử: hầm 2 cờ xa hơn.',
      san: [
        ['#######', '#.II.##', '#######', '#...F##', '#######'],
        ['########', '#.II.###', '########', '#.....F#', '########']
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      ngachHang: [[ng(4, 1, 1, 3)], [ng(4, 1, 1, 3)]],
      chuongDa: [[cd(4, 3, 6)], [cd(6, 3, 6)]],
      maMau: bai(['forward(6)']),
      loiGiai: bai(['forward(3)', 'go_echo()']),
      loiSai: [
        { moTa: 'Đếm đường hầm 1: hầm 2 chưa tới cờ', baiLam: bai(['forward(6)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Nghe trước khi chui: hear() đo đường chim bay, không theo ngách', baiLam: bai(['go_echo()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 8, nhip: 14 },
      goiY: [
        'Luna: forward(3) là chui ra tầng dưới.',
        'Luna: Ra ngách rồi mới go_echo().'
      ]
    }),

    manTH(3, 'lam-quen', {
      ten: 'Sổ ám hiệu mọi hầm',
      hamCuaEmCan: ['move', 'go_echo', 'decode_glide'],
      khoaTD: ['2', '4'],
      deBai: 'Giúp Sola với! R1 đứng dưới chuông. Sổ d ghi: chuông nốt 2 thì đá nốt 5, chuông nốt 4 thì đá nốt 7. Tra sổ gõ vỡ đá, lướt dải đá ướt, rồi đi theo tiếng chuông trên cờ.',
      veMaMau: 'Sola gõ nốt chuông. Chạy thử: đá không vỡ.',
      san: [
        ['########', '#.IIIII#', '######.#', '######.#', '######F#', '########'],
        ['######', '#.III#', '####.#', '####F#', '######']
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      chuongDa: [[cd(1, 1, 2), cd(6, 4, 3)], [cd(1, 1, 4), cd(4, 3, 3)]],
      daChuong: [[da(2, 1, 5)], [da(2, 1, 7)]],
      maMau: bai(['d = {2: 5, 4: 7}', 'crack_glide(listen(), 1)', 'go_echo()']),
      loiGiai: bai(['d = {2: 5, 4: 7}', 'decode_glide(d, 1)', 'go_echo()']),
      loiSai: [
        { moTa: 'Gõ nốt chuông: đá không vỡ', baiLam: bai(['d = {2: 5, 4: 7}', 'crack_glide(listen(), 1)', 'go_echo()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Luôn gõ nốt 5: đá hầm 2 không vỡ', baiLam: bai(['d = {2: 5, 4: 7}', 'crack_glide(5, 1)', 'go_echo()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 20, nhip: 11 },
      goiY: [
        'Luna: decode_glide(d, 1) nghe, tra sổ, gõ rồi lướt.',
        'Luna: Rồi go_echo().'
      ]
    }),

    manTH(4, 'luyen', {
      ten: 'Túi nốt mọi hầm',
      hamCuaEmCan: ['move', 'go_echo', 'glide_step', 'listen_unique_step'],
      nhipToiDa: 11,
      deBai: 'Giúp Sola với! Bốn ô đầu hầm treo chuông, nốt trùng nhau. Đá chuông chắn đầu dải đá ướt. Gõ mỗi nốt một lần, lướt hết dải và rẽ, rồi đi theo tiếng chuông trên cờ. Mỗi hầm chỉ còn 11 nhịp.',
      veMaMau: 'Sola gõ ở mọi chuông. Chạy thử: hết nhịp.',
      san: [
        ['##########', '#.....III#', '########.#', '########F#', '##########'],
        ['###########', '#.....IIII#', '#########.#', '#########.#', '#########F#', '###########']
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      chuongDa: [[cd(1, 1, 4), cd(2, 1, 1), cd(3, 1, 4), cd(4, 1, 1), cd(8, 3, 6)], [cd(1, 1, 3), cd(2, 1, 3), cd(3, 1, 8), cd(4, 1, 3), cd(9, 4, 2)]],
      daChuong: [[da(6, 1, 4), da(7, 1, 1)], [da(6, 1, 3), da(7, 1, 8)]],
      maMau: bai(['for i in range(4):', '    play_note(listen())', '    move()', 'glide_step()', 'go_echo()']),
      loiGiai: bai(['s = set()', 'for i in range(4):', '    listen_unique_step(s)', 'glide_step()', 'go_echo()']),
      loiSai: [
        { moTa: 'Gõ ở mọi chuông: quá 11 nhịp', baiLam: bai(['for i in range(4):', '    play_note(listen())', '    move()', 'glide_step()', 'go_echo()']), phaiCoMa: ['qua-nhieu-nhip'] },
        { moTa: 'Đi bộ thay vì lướt: quá 11 nhịp', baiLam: bai(['s = set()', 'for i in range(4):', '    listen_unique_step(s)', 'forward(3)', 'turn_right()', 'go_echo()']), phaiCoMa: ['qua-nhieu-nhip'] }
      ],
      sao: { o: 24, nhip: 21 },
      goiY: [
        'Luna: s = set(), rồi for i in range(4): listen_unique_step(s).',
        'Luna: glide_step() rồi go_echo().'
      ]
    }),

    manTH(5, 'luyen', {
      ten: 'Gõ đá rồi chui ngách',
      hamCuaEmCan: ['move', 'forward', 'go_echo', 'dive'],
      deBai: 'Giúp Sola với! Hai tầng ngách, đầu mỗi tầng là đá chuông chắn. Nghe nốt đá, gõ, rồi chui ngách xuống tầng dưới. Tầng cuối đi theo tiếng chuông trên cờ. Mỗi hầm nốt đá khác.',
      veMaMau: 'Sola gõ nốt đá hầm 1. Chạy thử: đá hầm 2 không vỡ.',
      san: [
        ['#######', '#....##', '#######', '#....##', '#######', '#....F#', '#######'],
        ['########', '#....###', '########', '#....###', '########', '#.....F#', '########']
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      ngachHang: [[ng(4, 1, 1, 3), ng(4, 3, 1, 5)], [ng(4, 1, 1, 3), ng(4, 3, 1, 5)]],
      daChuong: [[da(2, 1, 3), da(2, 3, 8)], [da(2, 1, 6), da(2, 3, 2)]],
      chuongDa: [[cd(5, 5, 4)], [cd(6, 5, 4)]],
      maMau: bai(['dive(3)', 'dive(8)', 'go_echo()']),
      loiGiai: bai(['for i in range(2):', '    dive(listen())', 'go_echo()']),
      loiSai: [
        { moTa: 'Gõ nốt đá hầm 1: hầm 2 đá không vỡ', baiLam: bai(['dive(3)', 'dive(8)', 'go_echo()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Chưa chui tầng hai: R1 nghe chuông từ tầng giữa', baiLam: bai(['dive(listen())', 'go_echo()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 13, nhip: 25 },
      goiY: [
        'Luna: dive(listen()) gõ nốt nghe được rồi chui ngách.',
        'Luna: Lặp 2 lần, rồi go_echo().'
      ]
    }),

    manTH(6, 'luyen', {
      ten: 'Ngân phá đá ở mỗi khúc',
      hamCuaEmCan: ['move', 'go_echo', 'crack_glide'],
      deBai: 'Giúp Sola với! Hầm xoắn hai khúc đá ướt. Đầu mỗi khúc là đá chuông 2 vạch: nghe nốt, ngân 2 nhịp rồi lướt. Hết khúc thứ hai thì đi theo tiếng chuông trên cờ. Mỗi hầm nốt và độ dài khác nhau.',
      veMaMau: 'Sola ngân 1 nhịp. Chạy thử: đá 2 vạch chỉ nứt.',
      san: [
        ['#######', '#.IIII#', '#####I#', '#####I#', '##F..I#', '#######'],
        ['########', '#.IIIII#', '######I#', '##F...I#', '########']
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      daChuong: [[da(2, 1, 4, 2), da(5, 2, 6, 2)], [da(2, 1, 1, 2), da(6, 2, 8, 2)]],
      chuongDa: [[cd(2, 4, 3)], [cd(2, 3, 3)]],
      maMau: bai(['for i in range(2):', '    n = listen()', '    crack_glide(n, 1)', 'go_echo()']),
      loiGiai: bai(['for i in range(2):', '    n = listen()', '    crack_glide(n, 2)', 'go_echo()']),
      loiSai: [
        { moTa: 'Ngân 1 nhịp: đá 2 vạch chỉ nứt', baiLam: bai(['for i in range(2):', '    n = listen()', '    crack_glide(n, 1)', 'go_echo()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Lặp 1 lần: khúc thứ hai còn đá', baiLam: bai(['n = listen()', 'crack_glide(n, 2)', 'go_echo()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 19, nhip: 23 },
      goiY: [
        'Luna: n = listen(), crack_glide(n, 2).',
        'Luna: Lặp 2 lần cho 2 khúc.'
      ]
    }),

    manTH(7, 'bien-the', {
      ten: 'Bàn xoay đưa vào ngách',
      hamCuaEmCan: ['move', 'forward', 'go_echo', 'spin_crack'],
      deBai: 'Giúp Sola với! Cuối dải đá ướt là bàn xoay: hầm 1 bàn @ quay phải, hầm 2 bàn % quay trái. Sau bàn là đá chuông, rồi miệng ngách. Ra ngách thì đi theo tiếng chuông trên cờ.',
      veMaMau: 'Sola tưởng bàn xoay không quay. Chạy thử: R1 đâm vách.',
      san: [
        ['########', '#.III@##', '#####.##', '#.###.##', '#.######', '#.######', '#F######', '########'],
        ['########', '#F######', '#.###.##', '#.###.##', '##.II%##', '########']
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 4, huong: 1 }],
      ngachHang: [[ng(5, 3, 1, 3)], [ng(5, 2, 1, 3)]],
      daChuong: [[da(5, 2, 7)], [da(5, 3, 2)]],
      chuongDa: [[cd(1, 6, 5)], [cd(1, 1, 5)]],
      maMau: bai(['spin_crack()', 'turn_right()', 'forward(2)', 'go_echo()']),
      loiGiai: bai(['spin_crack()', 'forward(2)', 'go_echo()']),
      loiSai: [
        { moTa: 'Rẽ thêm sau bàn xoay: R1 đâm vách', baiLam: bai(['spin_crack()', 'turn_right()', 'forward(2)', 'go_echo()']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Quên gõ đá: R1 đâm vào đá chuông', baiLam: bai(['retract_spikes()', 'move()', 'extend_spikes()', 'forward(2)', 'go_echo()']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 15, nhip: 13 },
      goiY: [
        'Luna: spin_crack() lướt lên bàn xoay rồi gõ đá.',
        'Luna: forward(2) vào ngách, rồi go_echo().'
      ]
    }),

    manTH(8, 'bien-the', {
      ten: 'Ngân chờ cổng, lướt, nghe',
      hamCuaEmCan: ['move', 'go_echo', 'ring_gate', 'glide_step'],
      deBai: 'Giúp Sola với! Cổng nhịp C đóng nhịp đầu. Sau cổng là đá chuông 2 vạch rồi dải đá ướt. Ngân nốt đá 2 nhịp trong lúc chờ cổng, bước vào cổng, lướt, rồi đi theo tiếng chuông trên cờ.',
      veMaMau: 'Sola gõ một nhịp rồi bước. Chạy thử: cổng còn đóng.',
      san: [
        ['########', '#.CIIII#', '######.#', '######F#', '########'],
        ['#######', '#.CIII#', '#####.#', '#####.#', '#####F#', '#######']
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      cuaNhip: [[dongDau(2, 1, 1)], [dongDau(2, 1, 1)]],
      daChuong: [[da(3, 1, 5, 2)], [da(3, 1, 8, 2)]],
      chuongDa: [[cd(6, 3, 2)], [cd(5, 4, 2)]],
      maMau: bai(['play_note(listen())', 'move()', 'glide_step()', 'go_echo()']),
      loiGiai: bai(['ring_gate(listen(), 2)', 'glide_step()', 'go_echo()']),
      loiSai: [
        { moTa: 'Gõ một nhịp: đá 2 vạch chỉ nứt', baiLam: bai(['play_note(listen())', 'move()', 'glide_step()', 'go_echo()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Ngân 1 nhịp: đá chưa vỡ', baiLam: bai(['ring_gate(listen(), 1)', 'glide_step()', 'go_echo()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 18, nhip: 15 },
      goiY: [
        'Luna: ring_gate(listen(), 2) ngân 2 nhịp rồi bước.',
        'Luna: Rồi glide_step(), go_echo().'
      ]
    }),

    manTH(9, 'bien-the', {
      ten: 'Còn đá thì còn chui ngách',
      hamCuaEmCan: ['move', 'dive'],
      deBai: 'Giúp Sola với! Ba hầm số tầng ngách khác nhau, đầu mỗi tầng là đá chuông. Đá chưa vỡ còn vang, nên còn nghe tiếng là còn tầng. Hết đá thì bước vào cờ.',
      veMaMau: 'Sola đếm tầng hầm 1. Chạy thử: hầm 2, hầm 3 còn đá.',
      san: [
        ['######', '#....#', '######', '#.F###', '######'],
        ['######', '#....#', '######', '#....#', '######', '#.F###', '######'],
        ['######', '#....#', '######', '#....#', '######', '#....#', '######', '#.F###', '######']
      ],
      batDau: ba({ x: 1, y: 1, huong: 1 }),
      ngachHang: [[ng(4, 1, 1, 3)], [ng(4, 1, 1, 3), ng(4, 3, 1, 5)], [ng(4, 1, 1, 3), ng(4, 3, 1, 5), ng(4, 5, 1, 7)]],
      daChuong: [[da(2, 1, 6)], [da(2, 1, 3), da(2, 3, 7)], [da(2, 1, 2), da(2, 3, 4), da(2, 5, 5)]],
      maMau: bai(['dive(listen())', 'move()']),
      loiGiai: bai(['while hear() > 0:', '    dive(listen())', 'move()']),
      loiSai: [
        { moTa: 'Đếm tầng hầm 1: hầm 2, hầm 3 còn đá', baiLam: bai(['dive(listen())', 'move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Lặp 2 lần: hầm 1 không còn tầng, hầm 3 còn đá', baiLam: bai(['for i in range(2):', '    dive(listen())', 'move()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 12, nhip: 27 },
      goiY: [
        'Luna: while hear() > 0: dive(listen()).',
        'Luna: Hết đá thì move() vào cờ.'
      ]
    }),

    manTH(10, 'trum', {
      ten: 'Trùm: ba hầm, một chương trình',
      hamCuaEmCan: ['move', 'go_echo', 'glide_step', 'dive', 'listen_unique_step'],
      nhipToiDa: 14,
      deBai: 'Giúp Sola với! Ba ô đầu treo chuông, có nốt trùng; đá chuông chắn đầu dải đá ướt. Gõ mỗi nốt một lần, lướt hết dải và rẽ. Dưới đó là đá chuông rồi miệng ngách. Ra ngách thì đi theo tiếng chuông trên cờ. Mỗi hầm chỉ còn 14 nhịp.',
      veMaMau: 'Sola gõ ở mọi chuông. Chạy thử.',
      san: [
        ['#########', '#....III#', '#######.#', '####.##.#', '####.##.#', '####F####', '#########'],
        ['##########', '#....IIII#', '########.#', '#####.##.#', '#####.##.#', '#####.####', '#####F####', '##########'],
        ['########', '#....II#', '######.#', '###.##.#', '###.##.#', '###F####', '########']
      ],
      batDau: ba({ x: 1, y: 1, huong: 1 }),
      ngachHang: [[ng(7, 4, 4, 3)], [ng(8, 4, 5, 3)], [ng(6, 4, 3, 3)]],
      chuongDa: [
        [cd(1, 1, 3), cd(2, 1, 3), cd(3, 1, 6), cd(4, 5, 1)],
        [cd(1, 1, 2), cd(2, 1, 7), cd(3, 1, 7), cd(5, 6, 1)],
        [cd(1, 1, 8), cd(2, 1, 4), cd(3, 1, 8), cd(3, 5, 1)]
      ],
      daChuong: [[da(5, 1, 6), da(7, 2, 4)], [da(5, 1, 7), da(8, 2, 5)], [da(5, 1, 4), da(6, 2, 3)]],
      maMau: bai(['for i in range(3):', '    play_note(listen())', '    move()', 'glide_step()', 'dive(listen())', 'go_echo()']),
      loiGiai: bai(['s = set()', 'for i in range(3):', '    listen_unique_step(s)', 'glide_step()', 'dive(listen())', 'go_echo()']),
      loiSai: [
        { moTa: 'Gõ ở mọi chuông: quá 14 nhịp', baiLam: bai(['for i in range(3):', '    play_note(listen())', '    move()', 'glide_step()', 'dive(listen())', 'go_echo()']), phaiCoMa: ['qua-nhieu-nhip'] },
        { moTa: 'Nghe trước khi chui ngách: R1 không tới cờ', baiLam: bai(['s = set()', 'for i in range(3):', '    listen_unique_step(s)', 'glide_step()', 'play_note(listen())', 'go_echo()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 27, nhip: 40 },
      goiY: [
        'Luna: s = set(), rồi for i in range(3): listen_unique_step(s).',
        'Luna: glide_step(), dive(listen()), go_echo().'
      ]
    }),

    /* ========================================================================
       CHƯƠNG 2: trum-mua-hang — Chế lệnh: cứu hộ hang sâu
       ====================================================================== */
    manTrum(1, 'lam-quen', {
      ten: 'Chế lệnh: theo tiếng, gõ, bước',
      taoHam: ['echo_crack_step'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'go_echo', 'play_note'],
      deBai: 'Giúp Sola với! Chuông treo ngay trước đá chuông, cùng nốt với đá. Chế hàm echo_crack_step(): đi theo tiếng chuông, gõ nốt nghe được, rồi bước vào ô đá vừa vỡ. Sau đá là dải đá ướt tới cờ. Chương trình chính đã khoá.',
      veMaMau: 'Chương trình chính gọi echo_crack_step(). Mở Xưởng hàm, chế echo_crack_step().',
      san: [
        ['#########', '#...IIIF#', '#########'],
        ['###########', '#....IIIIF#', '###########']
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      chuongDa: [[cd(3, 1, 7)], [cd(4, 1, 3)]],
      daChuong: [[da(4, 1, 7)], [da(5, 1, 3)]],
      maMau: bai(['echo_crack_step()', 'retract_spikes()', 'move()']),
      loiGiai: bai(['echo_crack_step()', 'retract_spikes()', 'move()'], [], [ECHO_CRACK_STEP]),
      loiSai: [
        { moTa: 'Chưa chế hàm echo_crack_step', baiLam: bai(['echo_crack_step()', 'retract_spikes()', 'move()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Thân hàm quên gõ: R1 đâm vào đá', baiLam: bai(['echo_crack_step()', 'retract_spikes()', 'move()']), hamCuaEmMoi: [ham('echo_crack_step', ['go_echo()', 'move()'])], phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 14, nhip: 11 },
      goiY: [
        'Luna: Thân hàm: go_echo(), play_note(listen()), move().',
        'Luna: Tới chuông, listen() nghe nốt chuông trên đầu.'
      ]
    }),

    manTrum(2, 'luyen', {
      ten: 'Theo tiếng, gõ, bước, lướt',
      hamCuaEmCan: ['move', 'glide_step', 'echo_crack_step'],
      deBai: 'Giúp Sola với! Hầm xoắn hai khúc. Mỗi khúc: chuông, đá chuông, rồi dải đá ướt tới vách. Hết khúc thứ hai thì bước vào cờ. Hai hầm khúc dài khác nhau.',
      veMaMau: 'Sola làm một khúc. Chạy thử: khúc hai chưa qua.',
      san: [
        ['#########', '#...IIII#', '#######.#', '#######.#', '#######I#', '#######I#', '######FI#', '#########'],
        ['##########', '#...IIIII#', '########.#', '########.#', '########I#', '#######FI#', '##########']
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      chuongDa: [[cd(3, 1, 2), cd(7, 3, 6)], [cd(3, 1, 5), cd(8, 3, 1)]],
      daChuong: [[da(4, 1, 2), da(7, 4, 6)], [da(4, 1, 5), da(8, 4, 1)]],
      maMau: bai(['echo_crack_step()', 'glide_step()', 'move()']),
      loiGiai: bai(['for i in range(2):', '    echo_crack_step()', '    glide_step()', 'move()']),
      loiSai: [
        { moTa: 'Làm một khúc: khúc hai còn đá', baiLam: bai(['echo_crack_step()', 'glide_step()', 'move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đi bộ thay vì lướt: R1 chưa tới khúc hai', baiLam: bai(['for i in range(2):', '    echo_crack_step()', '    move()', 'move()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 21, nhip: 26 },
      goiY: [
        'Luna: Mỗi khúc: echo_crack_step(), glide_step().',
        'Luna: Lặp 2 lần, rồi move() vào cờ.'
      ]
    }),

    manTrum(3, 'luyen', {
      ten: 'Chế lệnh: theo tiếng, gõ, lướt',
      taoHam: ['tunnel_crack_glide'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'go_echo', 'crack_switch'],
      deBai: 'Giúp Sola với! Chuông treo ngay trước đá chuông. Chế hàm tunnel_crack_glide(): đi theo tiếng chuông, rồi crack_switch() gõ đá và lướt rẽ. Chương trình chính đã khoá.',
      veMaMau: 'Chương trình chính gọi tunnel_crack_glide() hai lần. Mở Xưởng hàm, chế tunnel_crack_glide().',
      san: [
        ['########', '#..IIII#', '######.#', '######I#', '######I#', '#####FI#', '########'],
        ['#########', '#..IIIII#', '#######.#', '#######I#', '#######I#', '#######I#', '######FI#', '#########']
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      chuongDa: [[cd(2, 1, 8), cd(6, 2, 4)], [cd(2, 1, 1), cd(7, 2, 7)]],
      daChuong: [[da(3, 1, 8), da(6, 3, 4)], [da(3, 1, 1), da(7, 3, 7)]],
      maMau: bai(['for i in range(2):', '    tunnel_crack_glide()', 'move()']),
      loiGiai: bai(['for i in range(2):', '    tunnel_crack_glide()', 'move()'], [], [TUNNEL_CRACK_GLIDE]),
      loiSai: [
        { moTa: 'Chưa chế hàm tunnel_crack_glide', baiLam: bai(['for i in range(2):', '    tunnel_crack_glide()', 'move()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Thân hàm quên gõ: R1 lướt đâm vào đá', baiLam: bai(['for i in range(2):', '    tunnel_crack_glide()', 'move()']), hamCuaEmMoi: [ham('tunnel_crack_glide', ['go_echo()', 'glide_step()'])], phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 21, nhip: 18 },
      goiY: [
        'Luna: Thân hàm: go_echo(), crack_switch().',
        'Luna: crack_switch() là gõ nốt nghe được rồi lướt rẽ.'
      ]
    }),

    manTrum(4, 'luyen', {
      ten: 'Còn tiếng chuông thì còn khúc',
      hamCuaEmCan: ['move', 'tunnel_crack_glide'],
      deBai: 'Giúp Sola với! Chuông ở đây ngân khẽ, chỉ nghe được trong 3 ô. Mỗi khúc: chuông, đá, dải đá ướt. Lướt hết khúc thì chuông cũ đã xa. Ba hầm số khúc khác nhau. Hết khúc thì bước vào cờ.',
      veMaMau: 'Sola đếm khúc hầm 2. Chạy thử: hầm 1, hầm 3 sai.',
      san: [
        ['#########', '#...IIII#', '#######F#', '#########'],
        ['#########', '#...IIII#', '#######.#', '#######.#', '#######I#', '#######I#', '#######I#', '######FI#', '#########'],
        ['#########', '#...IIII#', '#######.#', '#######.#', '#######I#', '#######I#', '#F#####I#', '#IIII..I#', '#########']
      ],
      batDau: ba({ x: 1, y: 1, huong: 1 }),
      chuongDa: [[cd(3, 1, 4, 3)], [cd(3, 1, 4, 3), cd(7, 3, 2, 3)], [cd(3, 1, 4, 3), cd(7, 3, 2, 3), cd(5, 7, 6, 3)]],
      daChuong: [[da(4, 1, 4)], [da(4, 1, 4), da(7, 4, 2)], [da(4, 1, 4), da(7, 4, 2), da(4, 7, 6)]],
      maMau: bai(['for i in range(2):', '    tunnel_crack_glide()', 'move()']),
      loiGiai: bai(['while hear() > 0:', '    tunnel_crack_glide()', 'move()']),
      loiSai: [
        { moTa: 'Đếm khúc hầm 2: hầm 1, hầm 3 sai', baiLam: bai(['for i in range(2):', '    tunnel_crack_glide()', 'move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'while hear() == 0: vòng lặp không chạy', baiLam: bai(['while hear() == 0:', '    tunnel_crack_glide()', 'move()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 21, nhip: 33 },
      goiY: [
        'Luna: while hear() > 0: tunnel_crack_glide().',
        'Luna: Hết tiếng thì move() vào cờ.'
      ]
    }),

    manTrum(5, 'luyen', {
      ten: 'Chế lệnh: ngân rồi chui ngách',
      taoHam: ['ring_dive'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward', 'go_echo'],
      deBai: 'Giúp Sola với! Hai tầng ngách, đầu mỗi tầng là đá chuông 2 vạch. Chế hàm ring_dive(k): nghe nốt đá, ngân k nhịp, rồi chui ngách (3 bước). Tầng cuối đi theo tiếng chuông trên cờ. Chương trình chính đã khoá.',
      veMaMau: 'Chương trình chính gọi ring_dive(2) hai lần. Mở Xưởng hàm, chế ring_dive(k).',
      san: [
        ['#######', '#....##', '#######', '#....##', '#######', '#...F##', '#######'],
        ['########', '#....###', '########', '#....###', '########', '#.....F#', '########']
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      ngachHang: [[ng(4, 1, 1, 3), ng(4, 3, 1, 5)], [ng(4, 1, 1, 3), ng(4, 3, 1, 5)]],
      daChuong: [[da(2, 1, 5, 2), da(2, 3, 1, 2)], [da(2, 1, 7, 2), da(2, 3, 4, 2)]],
      chuongDa: [[cd(4, 5, 3)], [cd(6, 5, 3)]],
      maMau: bai(['for i in range(2):', '    ring_dive(2)', 'go_echo()']),
      loiGiai: bai(['for i in range(2):', '    ring_dive(2)', 'go_echo()'], [], [RING_DIVE]),
      loiSai: [
        { moTa: 'Chưa chế hàm ring_dive', baiLam: bai(['for i in range(2):', '    ring_dive(2)', 'go_echo()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Thân hàm gõ một nhịp: đá 2 vạch chỉ nứt', baiLam: bai(['for i in range(2):', '    ring_dive(2)', 'go_echo()']), hamCuaEmMoi: [ham('ring_dive', ['dive(listen())'], ['k'])], phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 13, nhip: 28 },
      goiY: [
        'Luna: Thân hàm: n = listen(), note(n, k), wait(), forward(3).',
        'Luna: note(n, k) rồi wait() là đứng ngân.'
      ]
    }),

    manTrum(6, 'luyen', {
      ten: 'Sổ số vạch',
      hamCuaEmCan: ['move', 'go_echo', 'ring_dive'],
      khoaTD: ['5', '3'],
      deBai: 'Giúp Sola với! Đá chuông nốt 5 có 2 vạch, đá nốt 3 có 3 vạch. Sổ d ghi số vạch theo nốt. Ở mỗi tầng: nghe nốt, tra sổ, ngân đủ vạch rồi chui ngách. Tầng cuối đi theo tiếng chuông trên cờ.',
      veMaMau: 'Sola luôn ngân 2 nhịp. Chạy thử: đá 3 vạch chỉ nứt.',
      san: [
        ['#######', '#....##', '#######', '#....##', '#######', '#....F#', '#######'],
        ['#######', '#....##', '#######', '#....##', '#######', '#...F##', '#######']
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      ngachHang: [[ng(4, 1, 1, 3), ng(4, 3, 1, 5)], [ng(4, 1, 1, 3), ng(4, 3, 1, 5)]],
      daChuong: [[da(2, 1, 5, 2), da(2, 3, 3, 3)], [da(2, 1, 3, 3), da(2, 3, 5, 2)]],
      chuongDa: [[cd(5, 5, 7)], [cd(4, 5, 7)]],
      maMau: bai(['d = {5: 2, 3: 3}', 'for i in range(2):', '    ring_dive(2)', 'go_echo()']),
      loiGiai: bai(['d = {5: 2, 3: 3}', 'for i in range(2):', '    n = listen()', '    ring_dive(d[n])', 'go_echo()']),
      loiSai: [
        { moTa: 'Luôn ngân 2 nhịp: đá 3 vạch chỉ nứt', baiLam: bai(['d = {5: 2, 3: 3}', 'for i in range(2):', '    ring_dive(2)', 'go_echo()']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Nghe một lần trước vòng lặp: tầng hai ngân sai số vạch', baiLam: bai(['d = {5: 2, 3: 3}', 'n = listen()', 'for i in range(2):', '    ring_dive(d[n])', 'go_echo()']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 15, nhip: 29 },
      goiY: [
        'Luna: n = listen(), ring_dive(d[n]).',
        'Luna: Lặp 2 tầng, rồi go_echo().'
      ]
    }),

    manTrum(7, 'bien-the', {
      ten: 'Sửa hàm theo tiếng, gõ, lướt',
      suaHam: ['tunnel_crack_glide'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'go_echo', 'glide_step', 'crack_switch', 'tunnel_crack_glide'],
      deBai: 'Giúp Sola với! Ai đó sửa tunnel_crack_glide() thành quên gõ đá: R1 lướt đâm vào đá chuông. Sửa lại hàm. Chương trình chính đã khoá.',
      veMaMau: 'Mở tunnel_crack_glide trong Xưởng hàm. Chạy thử: R1 đâm vào đá.',
      san: [
        ['#########', '#...IIII#', '#######.#', '#######.#', '#######I#', '#######I#', '######FI#', '#########'],
        ['##########', '#...IIIII#', '########.#', '########.#', '########I#', '#######FI#', '##########']
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      chuongDa: [[cd(3, 1, 6), cd(7, 3, 3)], [cd(3, 1, 8), cd(8, 3, 2)]],
      daChuong: [[da(4, 1, 6), da(7, 4, 3)], [da(4, 1, 8), da(8, 4, 2)]],
      maMau: bai(['for i in range(2):', '    tunnel_crack_glide()', 'move()'], [], [ham('tunnel_crack_glide', ['go_echo()', 'glide_step()'])]),
      loiGiai: bai(['for i in range(2):', '    tunnel_crack_glide()', 'move()'], [], [TUNNEL_CRACK_GLIDE]),
      loiSai: [
        { moTa: 'Không sửa: R1 lướt đâm vào đá', baiLam: bai(['for i in range(2):', '    tunnel_crack_glide()', 'move()']), hamCuaEmMoi: [ham('tunnel_crack_glide', ['go_echo()', 'glide_step()'])], phaiCoMa: ['dam-tuong'] },
        { moTa: 'Gõ rồi bước, không lướt: R1 chưa qua khúc', baiLam: bai(['for i in range(2):', '    tunnel_crack_glide()', 'move()']), hamCuaEmMoi: [ham('tunnel_crack_glide', ['go_echo()', 'play_note(listen())', 'move()'])], phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 21, nhip: 22 },
      goiY: [
        'Luna: crack_switch() gõ rồi mới lướt.',
        'Luna: go_echo(), crack_switch().'
      ]
    }),

    manTrum(8, 'bien-the', {
      ten: 'Túi nốt rồi theo tiếng',
      hamCuaEmCan: ['move', 'glide_step', 'listen_unique_step', 'tunnel_crack_glide'],
      nhipToiDa: 13,
      deBai: 'Giúp Sola với! Ba ô đầu treo chuông, có nốt trùng; đá chuông chắn đầu dải đá ướt. Gõ mỗi nốt một lần, lướt hết dải. Khúc sau: chuông, đá, dải đá ướt. Hết thì bước vào cờ. Mỗi hầm chỉ còn 13 nhịp.',
      veMaMau: 'Sola gõ ở mọi chuông. Chạy thử: hết nhịp.',
      san: [
        ['#########', '#....III#', '#######.#', '#######.#', '#######I#', '#######I#', '######FI#', '#########'],
        ['########', '#....II#', '######.#', '######.#', '######I#', '#####FI#', '########']
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      chuongDa: [[cd(1, 1, 2), cd(2, 1, 5), cd(3, 1, 2), cd(7, 3, 8)], [cd(1, 1, 6), cd(2, 1, 6), cd(3, 1, 1), cd(6, 3, 4)]],
      daChuong: [[da(5, 1, 5), da(7, 4, 8)], [da(5, 1, 1), da(6, 4, 4)]],
      maMau: bai(['for i in range(3):', '    play_note(listen())', '    move()', 'glide_step()', 'tunnel_crack_glide()', 'move()']),
      loiGiai: bai(['s = set()', 'for i in range(3):', '    listen_unique_step(s)', 'glide_step()', 'tunnel_crack_glide()', 'move()']),
      loiSai: [
        { moTa: 'Gõ ở mọi chuông: quá 13 nhịp', baiLam: bai(['for i in range(3):', '    play_note(listen())', '    move()', 'glide_step()', 'tunnel_crack_glide()', 'move()']), phaiCoMa: ['qua-nhieu-nhip'] },
        { moTa: 'Quên khúc sau: R1 dừng ở cuối dải đầu', baiLam: bai(['s = set()', 'for i in range(3):', '    listen_unique_step(s)', 'glide_step()', 'move()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 29, nhip: 26 },
      goiY: [
        'Luna: s = set(), for i in range(3): listen_unique_step(s).',
        'Luna: glide_step(), tunnel_crack_glide(), move().'
      ]
    }),

    manTrum(9, 'bien-the', {
      ten: 'Ba hầm, sổ số vạch',
      hamCuaEmCan: ['move', 'ring_dive'],
      khoaTD: ['2', '6'],
      deBai: 'Giúp Sola với! Ba hầm số tầng ngách khác nhau. Đá nốt 2 có 1 vạch, đá nốt 6 có 2 vạch. Còn nghe tiếng đá là còn tầng: nghe nốt, tra sổ, ngân rồi chui. Hết đá thì bước vào cờ.',
      veMaMau: 'Sola đếm tầng hầm 2. Chạy thử: hầm 1, hầm 3 sai.',
      san: [
        ['######', '#....#', '######', '#.F###', '######'],
        ['######', '#....#', '######', '#....#', '######', '#.F###', '######'],
        ['######', '#....#', '######', '#....#', '######', '#....#', '######', '#.F###', '######']
      ],
      batDau: ba({ x: 1, y: 1, huong: 1 }),
      ngachHang: [[ng(4, 1, 1, 3)], [ng(4, 1, 1, 3), ng(4, 3, 1, 5)], [ng(4, 1, 1, 3), ng(4, 3, 1, 5), ng(4, 5, 1, 7)]],
      daChuong: [[da(2, 1, 6, 2)], [da(2, 1, 2), da(2, 3, 6, 2)], [da(2, 1, 6, 2), da(2, 3, 2), da(2, 5, 6, 2)]],
      maMau: bai(['d = {2: 1, 6: 2}', 'for i in range(2):', '    n = listen()', '    ring_dive(d[n])', 'move()']),
      loiGiai: bai(['d = {2: 1, 6: 2}', 'while hear() > 0:', '    n = listen()', '    ring_dive(d[n])', 'move()']),
      loiSai: [
        { moTa: 'Đếm tầng hầm 2: hầm 1, hầm 3 sai', baiLam: bai(['d = {2: 1, 6: 2}', 'for i in range(2):', '    n = listen()', '    ring_dive(d[n])', 'move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Luôn ngân 1 nhịp: đá 2 vạch chỉ nứt', baiLam: bai(['d = {2: 1, 6: 2}', 'while hear() > 0:', '    ring_dive(1)', 'move()']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 14, nhip: 31 },
      goiY: [
        'Luna: while hear() > 0: (thụt vào n = listen(), ring_dive(d[n])).',
        'Luna: Hết đá thì move() vào cờ.'
      ]
    }),

    manTrum(10, 'trum', {
      ten: 'Trùm mùa: cứu hộ hang sâu',
      hamCuaEmCan: ['move', 'echo_crack_step', 'tunnel_crack_glide', 'ring_dive'],
      deBai: 'Giúp Sola với! Khúc đầu: chuông, đá, dải đá ướt. Rẽ xuống là đá 2 vạch rồi miệng ngách. Ra ngách: chuông, đá, rồi dải đá ướt dẫn tới cờ. Ba hầm, một chương trình.',
      veMaMau: 'Sola gõ đá 2 vạch một nhịp. Chạy thử.',
      san: [
        ['#########', '#...IIII#', '#######.#', '#.#####.#', '#.#####.#', '#.#######', '#I#######', '#I#######', '#F#######', '#########'],
        ['##########', '#...IIIII#', '########.#', '#.######.#', '#.######.#', '#.########', '#I########', '#F########', '##########'],
        ['########', '#...III#', '######.#', '#.####.#', '#.####.#', '#.######', '#I######', '#I######', '#I######', '#F######', '########']
      ],
      batDau: ba({ x: 1, y: 1, huong: 1 }),
      ngachHang: [[ng(7, 4, 1, 3)], [ng(8, 4, 1, 3)], [ng(6, 4, 1, 3)]],
      chuongDa: [[cd(3, 1, 4), cd(1, 5, 7)], [cd(3, 1, 1), cd(1, 5, 3)], [cd(3, 1, 8), cd(1, 5, 2)]],
      daChuong: [[da(4, 1, 4), da(7, 2, 6, 2), da(1, 6, 7)], [da(4, 1, 1), da(8, 2, 5, 2), da(1, 6, 3)], [da(4, 1, 8), da(6, 2, 4, 2), da(1, 6, 2)]],
      maMau: bai(['tunnel_crack_glide()', 'echo_crack_step()', 'echo_crack_step()', 'retract_spikes()', 'move()']),
      loiGiai: bai(['tunnel_crack_glide()', 'ring_dive(2)', 'echo_crack_step()', 'retract_spikes()', 'move()']),
      loiSai: [
        { moTa: 'Gõ đá 2 vạch một nhịp: đá chỉ nứt', baiLam: bai(['tunnel_crack_glide()', 'echo_crack_step()', 'echo_crack_step()', 'retract_spikes()', 'move()']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Quên thu gai ở cuối: R1 chỉ bước một ô', baiLam: bai(['tunnel_crack_glide()', 'ring_dive(2)', 'echo_crack_step()', 'move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Nghe trước khi chui: R1 gõ đá 2 vạch rồi theo tiếng', baiLam: bai(['tunnel_crack_glide()', 'echo_crack_step()', 'retract_spikes()', 'move()']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 30, nhip: 45 },
      goiY: [
        'Luna: tunnel_crack_glide(), ring_dive(2), echo_crack_step().',
        'Luna: Cuối cùng retract_spikes(), move() lướt tới cờ.'
      ]
    }),

  ];

  M.manTrumMuaHang = DS;
})();
