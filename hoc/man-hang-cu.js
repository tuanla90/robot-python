/* ============================================================================
   man-hang-cu.js — Mùa 8 Hang động · Gói 8: Hang có dấu cũ (mã gói hang-cu; viết lại 16/11, KE-HOACH-MUA-8.md)
   Chương 1: hang-cu "Gặp dấu cũ trong hang" (10 màn): R1 đủ part mùa 8 (bánh gai thu / bung, loa ngân dài, mic nghe nốt) gặp
             bàn xoay @ % (Mỏ đá: dừng trên bàn là bị quay), cổng nhịp C (Nhà máy: tự đóng mở theo nhịp), cổng dịch chuyển 1 1.
   Chương 2: che-hang-cu "Chế lệnh: qua hang cũ" (10 màn): crack_switch() (mùa 9 gọi: giữ tên và thân), spin_crack(), ring_gate(n, k).
             retract_spikes() ngay sau extend_spikes() (chưa qua nhịp nào) thì mất lệnh trước (gai-goi-lai), nên spin_crack kết thúc bằng một lệnh tốn nhịp.
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

  var GOC_CU = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'note', 'beat', 'hear', 'listen', 'retract_spikes', 'extend_spikes'];
  var ROBOT_CU = { than: 'gai', tay: 'loa', camBien: [{ ma: 'am-thanh', o: 'tren', phanAm: true }] };
  function cd(x, y, not, phamVi) { return phamVi ? { x: x, y: y, not: not, phamVi: phamVi } : { x: x, y: y, not: not }; }
  function da(x, y, not, ben) { return { x: x, y: y, not: not, ben: ben || 1 }; }
  function hai(a) { return [a, a]; }
  /** Cổng nhịp đóng k nhịp đầu rồi mở hẳn. */
  function dongDau(x, y, k) { return { x: x, y: y, mo: 30, dong: k, pha: 30 }; }
  /** Cổng nhịp mở k nhịp đầu rồi đóng hẳn. */
  function moDau(x, y, k) { return { x: x, y: y, mo: k, dong: 40, pha: 0 }; }
  /** Cổng nhịp chỉ mở đúng nhịp thứ k + 1 (đóng k nhịp đầu, mở một nhịp, rồi đóng lâu). */
  function moMotNhip(x, y, k) { return { x: x, y: y, mo: 1, dong: 30, pha: 31 - k }; }

  function manCu(so, hang, ds) {
    return Object.assign({
      chuong: 'hang-cu', so: so, hang: hang,
      vo: 'hang', loaiRobot: 'gai', thuGai: true, phanAm: true,
      robot: ROBOT_CU,
      hamGoc: GOC_CU.slice(),
      hamCuaEmCan: [],
      taoHam: [],
      cauTruc: ['for', 'while', 'if', 'else', 'dict', 'set'],
      khung: { chinh: 10, moiHam: 8, cauTruc: ['for', 'while', 'if', 'else', 'dict', 'set'] },
      mucTieu: 'toi-co'
    }, ds);
  }
  function manCheCu(so, hang, ds) {
    return Object.assign(manCu(so, hang, ds), { chuong: 'che-hang-cu' }, ds);
  }

  var CRACK_SWITCH = ham('crack_switch', ['play_note(listen())', 'glide_step()']);
  var SPIN_CRACK = ham('spin_crack', ['retract_spikes()', 'move()', 'extend_spikes()', 'play_note(listen())']);
  var RING_GATE = ham('ring_gate', ['note(n, k)', 'wait()', 'move()'], ['n', 'k']);

  var DS = [
    /* ========================================================================
       CHƯƠNG 1: hang-cu — Gặp dấu cũ trong hang
       ====================================================================== */
    manCu(1, 'lam-quen', {
      ten: 'Bàn xoay trong hang',
      chiChay: true, chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward'],
      deBai: 'Sola làm mẫu. Hang này có bàn xoay @ giống ở Mỏ đá. R1 lướt dừng trên bàn xoay thì bàn quay R1 sang phải. Bấm Chạy để xem.',
      veMaMau: 'Chương trình Sola viết sẵn và đã khoá: lướt lên bàn xoay, bung gai, rồi đi tới cờ.',
      san: [
        '#######',
        '#.III@#',
        '#####I#',
        '#####F#',
        '#######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['retract_spikes()', 'move()', 'extend_spikes()', 'forward(2)']),
      loiGiai: bai(['retract_spikes()', 'move()', 'extend_spikes()', 'forward(2)']),
      sao: { o: 9, nhip: 3 },
      goiY: [
        'Luna: Bàn xoay quay R1, không cần turn_right().',
        'Luna: @ quay sang phải, % quay sang trái.'
      ]
    }),

    manCu(2, 'lam-quen', {
      ten: 'Bàn xoay phải, bàn xoay trái',
      hamCuaEmCan: ['move', 'go_echo'],
      deBai: 'Giúp Sola với! Hầm 1 có bàn xoay @ quay phải, hầm 2 có bàn xoay % quay trái. Lướt lên bàn xoay, bung gai, rồi đi theo tiếng chuông treo trên cờ.',
      veMaMau: 'Sola đi 2 ô sau bàn xoay. Chạy thử: hầm 2 còn xa hơn.',
      san: [
        [
          '#######',
          '#.III@#',
          '#####I#',
          '#####F#',
          '#######'
        ],
        [
          '#######',
          '#####F#',
          '#####I#',
          '#####I#',
          '#.III%#',
          '#######'
        ]
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 4, huong: 1 }],
      chuongDa: [[cd(5, 3, 4)], [cd(5, 1, 4)]],
      maMau: bai(['retract_spikes()', 'move()', 'extend_spikes()', 'forward(2)']),
      loiGiai: bai(['retract_spikes()', 'move()', 'extend_spikes()', 'go_echo()']),
      loiSai: [
        { moTa: 'Đi 2 ô: hầm 2 chưa tới cờ', baiLam: bai(['retract_spikes()', 'move()', 'extend_spikes()', 'forward(2)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Tự rẽ thêm: bàn xoay đã quay R1 rồi', baiLam: bai(['retract_spikes()', 'move()', 'extend_spikes()', 'turn_right()', 'go_echo()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 10, nhip: 4 },
      goiY: [
        'Luna: Chuông treo trên cờ. go_echo() đi đúng số ô tới chuông.',
        'Luna: Bàn xoay quay R1 rồi, không cần rẽ thêm.'
      ]
    }),

    manCu(3, 'lam-quen', {
      ten: 'Ngân chờ cổng nhịp',
      hamCuaEmCan: ['forward'],
      deBai: 'Giúp Sola với! Cổng nhịp C giống ở Nhà máy: đóng 3 nhịp đầu rồi mở. Sau cổng là đá chuông 3 vạch, mỗi hầm một nốt. Đứng yên ngân đủ 3 nhịp: đá vỡ, cổng cũng vừa mở.',
      veMaMau: 'Sola ngân rồi đi luôn. Chạy thử: R1 đâm cổng.',
      san: hai([
        '########',
        '#.C.IIF#',
        '########'
      ]),
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      cuaNhip: hai([dongDau(2, 1, 3)]),
      daChuong: [[da(4, 1, 5, 3)], [da(4, 1, 2, 3)]],
      maMau: bai(['note(listen(), 3)', 'forward(5)']),
      loiGiai: bai(['note(listen(), 3)', 'wait()', 'forward(5)']),
      loiSai: [
        { moTa: 'Quên wait(): R1 đi khi cổng còn đóng', baiLam: bai(['note(listen(), 3)', 'forward(5)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Ngân nốt 5 của hầm 1: đá hầm 2 không vỡ', baiLam: bai(['note(5, 3)', 'wait()', 'forward(5)']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 8, nhip: 8 },
      goiY: [
        'Luna: note(listen(), 3) rồi wait(): R1 đứng ngân 3 nhịp.',
        'Luna: Rồi forward(5) tới cờ.'
      ]
    }),

    manCu(4, 'luyen', {
      ten: 'Lướt kịp cổng',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'slide_stop'],
      deBai: 'Giúp Sola với! Cổng nhịp mở 5 nhịp đầu rồi đóng. Đi bộ hết dải đá ướt thì cổng đã đóng. Lướt tới cổng, bung gai bám ô đá ướt sau cổng, rồi rẽ phải vào cờ. Sau ô đó là hố.',
      veMaMau: 'Sola đi bộ. Chạy thử: cổng đóng trước mặt.',
      san: [
        [
          '############',
          '#.IIIIIICIu#',
          '#########F##',
          '############'
        ],
        [
          '###########',
          '#.IIIIICIu#',
          '########F##',
          '###########'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      cuaNhip: [[moDau(8, 1, 5)], [moDau(7, 1, 5)]],
      maMau: bai(['forward(8)', 'turn_right()', 'move()']),
      loiGiai: bai(['slide_stop()', 'turn_right()', 'move()']),
      loiSai: [
        { moTa: 'Đi bộ: tới nơi thì cổng đã đóng', baiLam: bai(['forward(8)', 'turn_right()', 'move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên bung gai: R1 trượt qua ô đá ướt, rơi hố', baiLam: bai(['retract_spikes()', 'move()', 'move()', 'turn_right()', 'move()']), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 12, nhip: 4 },
      goiY: [
        'Luna: slide_stop() lướt tới cổng rồi bung gai bước một ô.',
        'Luna: Rồi turn_right(), move().'
      ]
    }),

    manCu(5, 'luyen', {
      ten: 'Cổng dịch chuyển cũ',
      hamCuaEmCan: ['move', 'play_note'],
      deBai: 'Giúp Sola với! Cuối dải đá ướt là cổng dịch chuyển 1, đưa R1 sang cổng 1 kia. Ra khỏi cổng là đá chuông, sau đá là dải đá ướt tới cờ. Giữ gai thu: gõ đá xong là lướt tiếp.',
      veMaMau: 'Sola gõ đá ngay từ đầu. Chạy thử: đá ở xa, không vỡ.',
      san: [
        [
          '########',
          '#.III1##',
          '########',
          '#1IIIF##',
          '########'
        ],
        [
          '#########',
          '#.IIIII1#',
          '#########',
          '#1IIIIF##',
          '#########'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      daChuong: [[da(3, 3, 6)], [da(3, 3, 3)]],
      maMau: bai(['play_note(listen())', 'retract_spikes()', 'move()', 'move()']),
      loiGiai: bai(['retract_spikes()', 'move()', 'play_note(listen())', 'move()']),
      loiSai: [
        { moTa: 'Gõ trước khi qua cổng: đá ở xa, không vỡ', baiLam: bai(['play_note(listen())', 'retract_spikes()', 'move()', 'move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Bung gai sau cổng: R1 chỉ bước một ô', baiLam: bai(['retract_spikes()', 'move()', 'extend_spikes()', 'play_note(listen())', 'move()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 9, nhip: 3 },
      goiY: [
        'Luna: Lướt vào cổng trước. Ra khỏi cổng, đá ở ngay trước mặt.',
        'Luna: play_note(listen()), rồi move() lướt tới cờ.'
      ]
    }),

    manCu(6, 'luyen', {
      ten: 'Chuỗi bàn xoay',
      hamCuaEmCan: ['move'],
      deBai: 'Giúp Sola với! Thu gai rồi lướt: mỗi lần lướt dừng ở một bàn xoay, bàn quay R1 sang dải mới. Chuông treo trên cờ, còn nghe tiếng chuông là chưa tới. Hai hầm số bàn xoay khác nhau.',
      veMaMau: 'Sola lướt ba lần. Chạy thử: hầm 2 còn một dải.',
      san: [
        [
          '########',
          '#.IIII@#',
          '######I#',
          '#FIIII@#',
          '########'
        ],
        [
          '########',
          '#.IIII@#',
          '######I#',
          '#%IIII@#',
          '#I######',
          '#F######',
          '########'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      chuongDa: [[cd(1, 3, 2)], [cd(1, 5, 6)]],
      maMau: bai(['retract_spikes()', 'for i in range(3):', '    move()']),
      loiGiai: bai(['retract_spikes()', 'while hear() > 0:', '    move()']),
      loiSai: [
        { moTa: 'Lướt ba lần: hầm 2 còn một dải', baiLam: bai(['retract_spikes()', 'for i in range(3):', '    move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'while hear() == 0: vòng lặp không chạy', baiLam: bai(['retract_spikes()', 'while hear() == 0:', '    move()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 6, nhip: 4 },
      goiY: [
        'Luna: Đứng trên cờ thì hear() là 0.',
        'Luna: while hear() > 0: move().'
      ]
    }),

    manCu(7, 'bien-the', {
      ten: 'Hai cổng nhịp',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'slide_stop'],
      deBai: 'Giúp Sola với! Cổng đầu đóng 2 nhịp, sau nó là đá chuông 2 vạch. Cổng sau mở 6 nhịp đầu rồi đóng, ở cuối dải đá ướt. Qua cổng sau là ô đá ướt, hố, cờ ở bên phải.',
      veMaMau: 'Sola đi bộ qua dải đá ướt. Chạy thử: cổng sau đã đóng.',
      san: [
        [
          '############',
          '#.C.IIIICIu#',
          '#########F##',
          '############'
        ],
        [
          '##############',
          '#.C.IIIIIICIu#',
          '###########F##',
          '##############'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      cuaNhip: [[dongDau(2, 1, 2), moDau(8, 1, 6)], [dongDau(2, 1, 2), moDau(10, 1, 6)]],
      daChuong: [[da(3, 1, 4, 2)], [da(3, 1, 7, 2)]],
      maMau: bai(['note(listen(), 2)', 'wait()', 'forward(7)', 'turn_right()', 'move()']),
      loiGiai: bai(['note(listen(), 2)', 'wait()', 'forward(2)', 'slide_stop()', 'turn_right()', 'move()']),
      loiSai: [
        { moTa: 'Đi bộ qua dải đá ướt: cổng sau đã đóng', baiLam: bai(['note(listen(), 2)', 'wait()', 'forward(7)', 'turn_right()', 'move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên wait(): R1 đâm cổng đầu', baiLam: bai(['note(listen(), 2)', 'forward(2)', 'slide_stop()', 'turn_right()', 'move()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 17, nhip: 8 },
      goiY: [
        'Luna: Cổng đầu: note(listen(), 2), wait(), forward(2).',
        'Luna: Cổng sau: slide_stop(), rồi turn_right(), move().'
      ]
    }),

    manCu(8, 'bien-the', {
      ten: 'Sổ nhịp chờ',
      hamCuaEmCan: ['forward'],
      khoaTD: ['2', '6'],
      deBai: 'Giúp Sola với! Cổng nhịp chỉ mở đúng một nhịp, ngay khi đá chuông sau nó vỡ. Đá nốt 5, mỗi hầm số vạch khác. Chuông trên đầu R1 báo số vạch: sổ d = {2: 3, 6: 2} (chuông 2 thì đá 3 vạch). Ngân thừa một nhịp là lỡ cổng.',
      veMaMau: 'Sola ngân 3 nhịp. Chạy thử: hầm 2 lỡ cổng.',
      san: hai([
        '########',
        '#.C.IIF#',
        '########'
      ]),
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      chuongDa: [[cd(1, 1, 2)], [cd(1, 1, 6)]],
      cuaNhip: [[moMotNhip(2, 1, 3)], [moMotNhip(2, 1, 2)]],
      daChuong: [[da(3, 1, 5, 3)], [da(3, 1, 5, 2)]],
      maMau: bai(['d = {2: 3, 6: 2}', 'note(5, 3)', 'wait()', 'forward(5)']),
      loiGiai: bai(['d = {2: 3, 6: 2}', 'n = listen()', 'note(5, d[n])', 'wait()', 'forward(5)']),
      loiSai: [
        { moTa: 'Ngân 3 nhịp: hầm 2 lỡ cổng', baiLam: bai(['d = {2: 3, 6: 2}', 'note(5, 3)', 'wait()', 'forward(5)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Ngân 2 nhịp: đá hầm 1 chưa vỡ', baiLam: bai(['d = {2: 3, 6: 2}', 'note(5, 2)', 'wait()', 'forward(5)']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 10, nhip: 8 },
      goiY: [
        'Luna: n = listen() là nốt chuông. d[n] là số vạch.',
        'Luna: note(5, d[n]), wait(), rồi forward(5).'
      ]
    }),

    manCu(9, 'bien-the', {
      ten: 'Không gõ trùng tới bàn xoay',
      hamCuaEmCan: ['move', 'forward', 'listen_unique_step'],
      nhipToiDa: 9,
      deBai: 'Giúp Sola với! Bốn ô đầu treo chuông, hai đá chuông chắn phía sau. Gõ mỗi nốt một lần, rồi đi lên bàn xoay và lướt tới cờ. Chỉ còn 9 nhịp.',
      veMaMau: 'Sola gõ ở mọi chuông. Chạy thử: hết nhịp.',
      san: [
        [
          '#########',
          '#......@#',
          '#######I#',
          '#######F#',
          '#########'
        ],
        [
          '#########',
          '#######F#',
          '#######I#',
          '#......%#',
          '#########'
        ]
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 3, huong: 1 }],
      chuongDa: [[cd(1, 1, 3), cd(2, 1, 6), cd(3, 1, 3), cd(4, 1, 6)], [cd(1, 3, 5), cd(2, 3, 5), cd(3, 3, 2), cd(4, 3, 5)]],
      daChuong: [[da(5, 1, 3), da(6, 1, 6)], [da(5, 3, 5), da(6, 3, 2)]],
      maMau: bai(['for i in range(4):', '    play_note(listen())', '    move()', 'forward(2)', 'retract_spikes()', 'move()']),
      loiGiai: bai(['s = set()', 'for i in range(4):', '    listen_unique_step(s)', 'forward(2)', 'retract_spikes()', 'move()']),
      loiSai: [
        { moTa: 'Gõ ở mọi chuông: quá 9 nhịp', baiLam: bai(['for i in range(4):', '    play_note(listen())', '    move()', 'forward(2)', 'retract_spikes()', 'move()']), phaiCoMa: ['qua-nhieu-nhip'] },
        { moTa: 'Quên thu gai: R1 chỉ bước một ô', baiLam: bai(['s = set()', 'for i in range(4):', '    listen_unique_step(s)', 'forward(2)', 'move()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 18, nhip: 9 },
      goiY: [
        'Luna: s = set(), rồi for i in range(4): listen_unique_step(s).',
        'Luna: forward(2) lên bàn xoay, rồi retract_spikes(), move().'
      ]
    }),

    manCu(10, 'tong-hop', {
      ten: 'Trùm: hầm dấu cũ',
      hamCuaEmCan: ['move', 'forward', 'play_note'],
      deBai: 'Giúp Sola với! Cổng nhịp đóng 2 nhịp đầu, sau cổng là đá chuông 2 vạch. Qua cổng là dải đá ướt tới bàn xoay, rồi dải tới cổng dịch chuyển. Ra khỏi cổng dịch chuyển, đá chuông chắn dải đá ướt cuối. Mỗi hầm nốt khác.',
      veMaMau: 'Sola quên gõ đá sau cổng dịch chuyển. Chạy thử: R1 kẹt.',
      san: [
        [
          '##########',
          '#.C.IIII@#',
          '#1######I#',
          '#I######1#',
          '#I########',
          '#I########',
          '#F########',
          '##########'
        ],
        [
          '#########',
          '#F#####1#',
          '#I#####I#',
          '#I#####I#',
          '#I#####I#',
          '#1#####I#',
          '#.C.III%#',
          '#########'
        ]
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 6, huong: 1 }],
      cuaNhip: [[dongDau(2, 1, 2)], [dongDau(2, 6, 2)]],
      daChuong: [[da(3, 1, 4, 2), da(1, 4, 7)], [da(3, 6, 6, 2), da(1, 3, 2)]],
      maMau: bai(['note(listen(), 2)', 'wait()', 'forward(2)', 'retract_spikes()', 'move()', 'move()', 'move()']),
      loiGiai: bai(['note(listen(), 2)', 'wait()', 'forward(2)', 'retract_spikes()', 'move()', 'move()', 'play_note(listen())', 'move()']),
      loiSai: [
        { moTa: 'Quên gõ đá sau cổng dịch chuyển', baiLam: bai(['note(listen(), 2)', 'wait()', 'forward(2)', 'retract_spikes()', 'move()', 'move()', 'move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên wait(): R1 đâm cổng nhịp', baiLam: bai(['note(listen(), 2)', 'forward(2)', 'retract_spikes()', 'move()', 'move()', 'play_note(listen())', 'move()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 15, nhip: 8 },
      goiY: [
        'Luna: Cổng nhịp: note(listen(), 2), wait(), forward(2).',
        'Luna: Thu gai, lướt hai lần, gõ đá, lướt tới cờ.'
      ]
    }),

    /* ========================================================================
       CHƯƠNG 2: che-hang-cu — Chế lệnh: qua hang cũ
       ====================================================================== */
    manCheCu(1, 'lam-quen', {
      ten: 'Chế lệnh: gõ rồi bẻ lái',
      taoHam: ['crack_switch'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'play_note', 'glide_step'],
      deBai: 'Giúp Sola với! Đầu mỗi dải đá ướt có đá chuông chắn. Chế hàm crack_switch(): nghe nốt đá, gõ đúng nốt đó, rồi glide_step() lướt hết dải và rẽ phải. Chương trình chính đã khoá.',
      veMaMau: 'Chương trình chính gọi crack_switch() hai lần. Mở Xưởng hàm, chế crack_switch().',
      san: [
        [
          '########',
          '#.IIIII#',
          '######I#',
          '######I#',
          '#####FI#',
          '########'
        ],
        [
          '##########',
          '#.IIIIIII#',
          '########I#',
          '#######FI#',
          '##########'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      daChuong: [[da(2, 1, 3), da(6, 2, 7)], [da(2, 1, 8), da(8, 2, 1)]],
      maMau: bai(['for i in range(2):', '    crack_switch()', 'move()']),
      loiGiai: bai(['for i in range(2):', '    crack_switch()', 'move()'], [], [CRACK_SWITCH]),
      loiSai: [
        { moTa: 'Chưa chế hàm crack_switch', baiLam: bai(['for i in range(2):', '    crack_switch()', 'move()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Thân hàm lướt trước rồi mới gõ: R1 kẹt trước đá', baiLam: bai(['for i in range(2):', '    crack_switch()', 'move()']), hamCuaEmMoi: [ham('crack_switch', ['glide_step()', 'play_note(listen())'])], phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 16, nhip: 7 },
      goiY: [
        'Luna: Hai dòng: play_note(listen()), glide_step().',
        'Luna: glide_step() thu gai, lướt, bung gai, rẽ phải.'
      ]
    }),

    manCheCu(2, 'lam-quen', {
      ten: 'Còn đá thì còn bẻ lái',
      hamCuaEmCan: ['move', 'crack_switch'],
      deBai: 'Giúp Sola với! Xoắn ốc đá ướt, đầu dải nào cũng có đá chuông chắn. Đá chưa vỡ còn vang, nên còn nghe tiếng vang là còn dải. Hai hầm số dải khác nhau.',
      veMaMau: 'Sola đếm dải của hầm 1. Chạy thử: hầm 2 nhiều dải hơn.',
      san: [
        [
          '########',
          '#.IIIII#',
          '######I#',
          '######I#',
          '#####FI#',
          '########'
        ],
        [
          '#########',
          '#.IIII###',
          '#####I###',
          '##F##I###',
          '##IIII###',
          '#########'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      daChuong: [[da(2, 1, 6), da(6, 2, 2)], [da(2, 1, 4), da(5, 2, 8), da(4, 4, 1)]],
      maMau: bai(['for i in range(2):', '    crack_switch()', 'move()']),
      loiGiai: bai(['while hear() > 0:', '    crack_switch()', 'move()']),
      loiSai: [
        { moTa: 'Đếm dải hầm 1: hầm 2 còn một đá', baiLam: bai(['for i in range(2):', '    crack_switch()', 'move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'while hear() == 0: vòng lặp không chạy', baiLam: bai(['while hear() == 0:', '    crack_switch()', 'move()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 16, nhip: 10 },
      goiY: [
        'Luna: while hear() > 0: crack_switch().',
        'Luna: Hết đá thì move() vào cờ.'
      ]
    }),

    manCheCu(3, 'luyen', {
      ten: 'Chế lệnh: lướt lên bàn xoay rồi gõ',
      taoHam: ['spin_crack'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward', 'turn_left', 'play_note'],
      deBai: 'Giúp Sola với! Sau mỗi bàn xoay là đá chuông chắn đầu dải. Chế hàm spin_crack(): thu gai, lướt lên bàn xoay, bung gai, nghe nốt đá rồi gõ. Sau bàn xoay thứ hai, dải đá ướt dẫn ra hố, cờ ở bên trái dải. Chương trình chính đã khoá.',
      veMaMau: 'Chương trình chính gọi spin_crack() hai lần. Mở Xưởng hàm, chế spin_crack().',
      san: [
        '########',
        '#.IIII@#',
        '######I#',
        '#uIIII@#',
        '###F####',
        '########'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      daChuong: [da(6, 2, 3), da(5, 3, 7)],
      maMau: bai(['for i in range(2):', '    spin_crack()', 'forward(3)', 'turn_left()', 'move()']),
      loiGiai: bai(['for i in range(2):', '    spin_crack()', 'forward(3)', 'turn_left()', 'move()'], [], [SPIN_CRACK]),
      loiSai: [
        { moTa: 'Chưa chế hàm spin_crack', baiLam: bai(['for i in range(2):', '    spin_crack()', 'forward(3)', 'turn_left()', 'move()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Thân hàm quên bung gai: R1 trượt xuống hố', baiLam: bai(['for i in range(2):', '    spin_crack()', 'forward(3)', 'turn_left()', 'move()']), hamCuaEmMoi: [ham('spin_crack', ['retract_spikes()', 'move()', 'play_note(listen())'])], phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 18, nhip: 9 },
      goiY: [
        'Luna: Bốn dòng: retract_spikes(), move(), extend_spikes(), play_note(listen()).',
        'Luna: Bàn xoay tự quay R1, thân hàm không cần rẽ.'
      ]
    }),

    manCheCu(4, 'luyen', {
      ten: 'Chuỗi bàn xoay có đá',
      hamCuaEmCan: ['move', 'spin_crack'],
      deBai: 'Giúp Sola với! Chuỗi bàn xoay như màn "Chuỗi bàn xoay", nay sau mỗi bàn là đá chuông. Còn nghe đá thì còn bàn xoay. Hết đá thì thu gai lướt tới cờ. Hai hầm số bàn xoay khác nhau.',
      veMaMau: 'Sola đếm bàn xoay của hầm 1. Chạy thử: hầm 2 nhiều hơn.',
      san: [
        [
          '########',
          '#.IIII@#',
          '######I#',
          '#FIIII@#',
          '########'
        ],
        [
          '########',
          '#.IIII@#',
          '######I#',
          '#%IIII@#',
          '#I######',
          '#F######',
          '########'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      daChuong: [[da(6, 2, 2), da(5, 3, 6)], [da(6, 2, 8), da(5, 3, 4), da(1, 4, 1)]],
      maMau: bai(['for i in range(2):', '    spin_crack()', 'retract_spikes()', 'move()']),
      loiGiai: bai(['while hear() > 0:', '    spin_crack()', 'retract_spikes()', 'move()']),
      loiSai: [
        { moTa: 'Đếm bàn xoay hầm 1: hầm 2 còn một đá', baiLam: bai(['for i in range(2):', '    spin_crack()', 'retract_spikes()', 'move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên thu gai ở cuối: R1 chỉ bước một ô', baiLam: bai(['while hear() > 0:', '    spin_crack()', 'move()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 13, nhip: 7 },
      goiY: [
        'Luna: while hear() > 0: spin_crack().',
        'Luna: Hết đá: retract_spikes(), move().'
      ]
    }),

    manCheCu(5, 'luyen', {
      ten: 'Chế lệnh: ngân chờ cổng',
      taoHam: ['ring_gate'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward'],
      deBai: 'Giúp Sola với! Hai cổng nhịp, sau mỗi cổng là đá chuông. Chế hàm ring_gate(n, k): ngân nốt n trong k nhịp, đứng chờ cho hết, rồi bước vào cổng. Chương trình chính đã khoá.',
      veMaMau: 'Chương trình chính gọi ring_gate hai lần. Mở Xưởng hàm, chế ring_gate(n, k).',
      san: [
        '##########',
        '#.C.C.IIF#',
        '##########'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      cuaNhip: [dongDau(2, 1, 2), dongDau(4, 1, 7)],
      daChuong: [da(3, 1, 4, 2), da(5, 1, 6, 3)],
      maMau: bai(['ring_gate(4, 2)', 'move()', 'ring_gate(6, 3)', 'forward(4)']),
      loiGiai: bai(['ring_gate(4, 2)', 'move()', 'ring_gate(6, 3)', 'forward(4)'], [], [RING_GATE]),
      loiSai: [
        { moTa: 'Chưa chế hàm ring_gate', baiLam: bai(['ring_gate(4, 2)', 'move()', 'ring_gate(6, 3)', 'forward(4)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Thân hàm quên wait(): R1 đâm cổng còn đóng', baiLam: bai(['ring_gate(4, 2)', 'move()', 'ring_gate(6, 3)', 'forward(4)']), hamCuaEmMoi: [ham('ring_gate', ['note(n, k)', 'move()'], ['n', 'k'])], phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 12, nhip: 12 },
      goiY: [
        'Luna: Giống màn "Ngân chờ cổng nhịp", gói lại thành hàm.',
        'Luna: note(n, k), wait(), move().'
      ]
    }),

    manCheCu(6, 'luyen', {
      ten: 'Nghe rồi chờ cổng',
      hamCuaEmCan: ['move', 'ring_gate'],
      deBai: 'Giúp Sola với! Dãy cổng nhịp, sau mỗi cổng là đá chuông 2 vạch, mỗi đá một nốt. Cổng sau mở muộn hơn cổng trước. Còn nghe đá thì còn cổng. Hai hầm số cổng khác nhau.',
      veMaMau: 'Sola đếm cổng của hầm 1. Chạy thử: hầm 2 còn một cổng.',
      san: [
        [
          '########',
          '#.C.C.F#',
          '########'
        ],
        [
          '##########',
          '#.C.C.C.F#',
          '##########'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      cuaNhip: [[dongDau(2, 1, 2), dongDau(4, 1, 6)], [dongDau(2, 1, 2), dongDau(4, 1, 6), dongDau(6, 1, 10)]],
      daChuong: [[da(3, 1, 5, 2), da(5, 1, 1, 2)], [da(3, 1, 7, 2), da(5, 1, 3, 2), da(7, 1, 6, 2)]],
      maMau: bai(['for i in range(2):', '    ring_gate(listen(), 2)', '    move()', 'move()']),
      loiGiai: bai(['while hear() > 0:', '    ring_gate(listen(), 2)', '    move()', 'move()']),
      loiSai: [
        { moTa: 'Đếm cổng hầm 1: hầm 2 còn một cổng', baiLam: bai(['for i in range(2):', '    ring_gate(listen(), 2)', '    move()', 'move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Ngân 1 nhịp: đá 2 vạch chưa vỡ', baiLam: bai(['while hear() > 0:', '    ring_gate(listen(), 1)', '    move()', 'move()']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 10, nhip: 13 },
      goiY: [
        'Luna: while hear() > 0: (thụt vào ring_gate(listen(), 2), move()).',
        'Luna: Hết đá thì move() vào cờ.'
      ]
    }),

    manCheCu(7, 'bien-the', {
      ten: 'Sửa hàm bẻ lái',
      suaHam: ['crack_switch'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'play_note', 'glide_step', 'crack_switch'],
      deBai: 'Giúp Sola với! Ai đó sửa crack_switch() thành luôn gõ nốt 4. Hầm 1 đá nốt 4 nên chạy được, hầm 2 thì không. Sửa lại hàm. Chương trình chính đã khoá.',
      veMaMau: 'Mở crack_switch trong Xưởng hàm. Chạy thử: đá hầm 2 không vỡ.',
      san: [
        [
          '#########',
          '#.IIIIII#',
          '#######I#',
          '#######I#',
          '#F#####I#',
          '#IIIIIII#',
          '#########'
        ],
        [
          '#######',
          '#.IIII#',
          '#####I#',
          '##F##I#',
          '##IIII#',
          '#######'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      daChuong: [[da(2, 1, 4), da(7, 2, 4), da(6, 5, 4)], [da(2, 1, 4), da(5, 2, 2), da(4, 4, 7)]],
      maMau: bai(['for i in range(3):', '    crack_switch()', 'move()'], [], [ham('crack_switch', ['play_note(4)', 'glide_step()'])]),
      loiGiai: bai(['for i in range(3):', '    crack_switch()', 'move()'], [], [CRACK_SWITCH]),
      loiSai: [
        { moTa: 'Không sửa: luôn gõ nốt 4, đá hầm 2 không vỡ', baiLam: bai(['for i in range(3):', '    crack_switch()', 'move()']), hamCuaEmMoi: [ham('crack_switch', ['play_note(4)', 'glide_step()'])], phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Gõ nhưng quên lướt: R1 đứng yên', baiLam: bai(['for i in range(3):', '    crack_switch()', 'move()']), hamCuaEmMoi: [ham('crack_switch', ['play_note(listen())', 'turn_right()'])], phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 16, nhip: 10 },
      goiY: [
        'Luna: Nốt đá là listen(), không phải 4.',
        'Luna: play_note(listen()), glide_step().'
      ]
    }),

    manCheCu(8, 'bien-the', {
      ten: 'Cổng, bàn xoay, đá',
      hamCuaEmCan: ['move', 'ring_gate', 'spin_crack', 'glide_step'],
      deBai: 'Giúp Sola với! Cổng nhịp đóng 2 nhịp, sau cổng là đá chuông 2 vạch. Rồi dải đá ướt tới bàn xoay. Sau bàn xoay là đá chuông ở đầu dải, cuối dải rẽ phải vào cờ. Mỗi hầm nốt khác.',
      veMaMau: 'Sola quên bước khỏi cổng. Chạy thử: R1 lướt hụt bàn xoay.',
      san: [
        [
          '#########',
          '#.C.III@#',
          '#######I#',
          '#######I#',
          '######FI#',
          '#########'
        ],
        [
          '#########',
          '######IF#',
          '#.C.II%##',
          '#########'
        ]
      ],
      batDau: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 2, huong: 1 }],
      cuaNhip: [[dongDau(2, 1, 2)], [dongDau(2, 2, 2)]],
      daChuong: [[da(3, 1, 3, 2), da(7, 2, 8)], [da(3, 2, 5, 2), da(6, 1, 2)]],
      maMau: bai(['ring_gate(listen(), 2)', 'spin_crack()', 'glide_step()', 'move()']),
      loiGiai: bai(['ring_gate(listen(), 2)', 'move()', 'spin_crack()', 'glide_step()', 'move()']),
      loiSai: [
        { moTa: 'Quên bước khỏi cổng: R1 lướt hụt bàn xoay', baiLam: bai(['ring_gate(listen(), 2)', 'spin_crack()', 'glide_step()', 'move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Ngân nốt 3 của hầm 1: đá hầm 2 không vỡ', baiLam: bai(['ring_gate(3, 2)', 'move()', 'spin_crack()', 'glide_step()', 'move()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 23, nhip: 9 },
      goiY: [
        'Luna: ring_gate(listen(), 2), rồi move() ra khỏi cổng.',
        'Luna: spin_crack(), glide_step(), move().'
      ]
    }),

    manCheCu(9, 'bien-the', {
      ten: 'Sổ ám hiệu ở cổng',
      hamCuaEmCan: ['forward', 'ring_gate'],
      khoaTD: ['1', '4', '6'],
      deBai: 'Giúp Sola với! Trước mỗi cổng nhịp, R1 đứng dưới chuông ám hiệu ngân khẽ. Đá chuông 2 vạch sau cổng cần nốt theo sổ d. Còn nghe đá thì còn cổng. Hai hầm số cổng khác nhau.',
      veMaMau: 'Sola ngân luôn nốt chuông. Chạy thử: đá không vỡ.',
      san: [
        [
          '#########',
          '#.C..C.F#',
          '#########'
        ],
        [
          '############',
          '#.C..C..C.F#',
          '############'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      chuongDa: [[cd(1, 1, 1, 1), cd(4, 1, 4, 1)], [cd(1, 1, 4, 1), cd(4, 1, 6, 1), cd(7, 1, 1, 1)]],
      cuaNhip: [[dongDau(2, 1, 2), dongDau(5, 1, 7)], [dongDau(2, 1, 2), dongDau(5, 1, 7), dongDau(8, 1, 12)]],
      daChuong: [[da(3, 1, 7, 2), da(6, 1, 2, 2)], [da(3, 1, 2, 2), da(6, 1, 5, 2), da(9, 1, 7, 2)]],
      maMau: bai(['d = {1: 7, 4: 2, 6: 5}', 'while hear() > 0:', '    ring_gate(listen(), 2)', '    forward(2)']),
      loiGiai: bai(['d = {1: 7, 4: 2, 6: 5}', 'while hear() > 0:', '    n = listen()', '    ring_gate(d[n], 2)', '    forward(2)']),
      loiSai: [
        { moTa: 'Ngân nốt chuông: đá không vỡ', baiLam: bai(['d = {1: 7, 4: 2, 6: 5}', 'while hear() > 0:', '    ring_gate(listen(), 2)', '    forward(2)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Đếm cổng hầm 1: hầm 2 còn một cổng', baiLam: bai(['d = {1: 7, 4: 2, 6: 5}', 'for i in range(2):', '    n = listen()', '    ring_gate(d[n], 2)', '    forward(2)']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 13, nhip: 15 },
      goiY: [
        'Luna: n = listen() là nốt chuông, d[n] là nốt đá.',
        'Luna: ring_gate(d[n], 2), rồi forward(2) tới chuông kế.'
      ]
    }),

    manCheCu(10, 'tong-hop', {
      ten: 'Trùm: đường hang cũ',
      hamCuaEmCan: ['move', 'ring_gate', 'spin_crack', 'glide_step', 'crack_switch'],
      deBai: 'Giúp Sola với! Cổng nhịp đóng 2 nhịp, sau cổng là đá chuông 2 vạch. Qua cổng là dải đá ướt tới bàn xoay, sau bàn là đá chuông. Rồi là xoắn ốc đá ướt, đầu dải nào cũng có đá chuông. Hai hầm số dải khác nhau.',
      veMaMau: 'Sola bẻ lái một lần. Chạy thử: hầm 2 nhiều dải hơn.',
      san: [
        [
          '#########',
          '#.C.III@#',
          '#######I#',
          '#F#####I#',
          '#IIIIIII#',
          '#########'
        ],
        [
          '#########',
          '#.C.III@#',
          '#######I#',
          '#IF####I#',
          '#I#####I#',
          '#I#####I#',
          '#IIIIIII#',
          '#########'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      cuaNhip: hai([dongDau(2, 1, 2)]),
      daChuong: [[da(3, 1, 6, 2), da(7, 2, 2), da(6, 4, 8)], [da(3, 1, 1, 2), da(7, 2, 5), da(6, 6, 3), da(1, 5, 7)]],
      maMau: bai(['ring_gate(listen(), 2)', 'move()', 'spin_crack()', 'glide_step()', 'crack_switch()', 'move()']),
      loiGiai: bai(['ring_gate(listen(), 2)', 'move()', 'spin_crack()', 'glide_step()', 'while hear() > 0:', '    crack_switch()', 'move()']),
      loiSai: [
        { moTa: 'Một lần crack_switch(): hầm 2 còn một đá', baiLam: bai(['ring_gate(listen(), 2)', 'move()', 'spin_crack()', 'glide_step()', 'crack_switch()', 'move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên bước khỏi cổng: R1 lướt hụt bàn xoay', baiLam: bai(['ring_gate(listen(), 2)', 'spin_crack()', 'glide_step()', 'while hear() > 0:', '    crack_switch()', 'move()']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 27, nhip: 15 },
      goiY: [
        'Luna: Cổng: ring_gate(listen(), 2), move(). Bàn xoay: spin_crack(), glide_step().',
        'Luna: Xoắn ốc: while hear() > 0: crack_switch(). Rồi move().'
      ]
    })
  ];

  if (M && M.them) M.manHangCu = DS;
  if (typeof module !== 'undefined' && module.exports) module.exports = M;
})();
