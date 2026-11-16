/* ============================================================================
   man-nghe-not.js — Mùa 8 Hang động · Gói 7: Nghe nốt (mã gói nghe-not; viết lại 16/11, KE-HOACH-MUA-8.md)
   Chương 1: nghe-not "Bắt nốt chuông đá" (10 màn): listen() trả nốt của nguồn âm gần nhất (chuông, đá chuông chưa vỡ),
             kể cả chuông ngay trên đầu; ghép với note(n, k), lướt đá ướt, ngách, sổ dict, túi set.
   Chương 2: che-nghe-not "Chế lệnh: giải mã giai điệu" (10 màn): crack_tunnel(), decode_glide(d, k), listen_unique_step(s)
             (mùa 9 gọi: giữ tên và thân).
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

  var GOC_NGHE = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'note', 'beat', 'hear', 'listen', 'retract_spikes', 'extend_spikes'];
  var ROBOT_NGHE = { than: 'gai', tay: 'loa', camBien: [{ ma: 'am-thanh', o: 'tren', phanAm: true }] };
  function cd(x, y, not, phamVi) { return phamVi ? { x: x, y: y, not: not, phamVi: phamVi } : { x: x, y: y, not: not }; }
  function da(x, y, not, ben) { return { x: x, y: y, not: not, ben: ben || 1 }; }
  function ng(ax, ay, bx, by) { return { a: { x: ax, y: ay }, b: { x: bx, y: by } }; }
  function hai(a) { return [a, a]; }
  function tangLuot(cuoi, duoi, rong) {
    var tuong = new Array(rong + 1).join('#');
    var san = [tuong], ngach = [], daCh = [];
    cuoi.forEach(function (x, i) {
      var y = 2 * i + 1;
      san.push(('#.' + new Array(x - 1).join('I') + '.' + tuong).slice(0, rong - 1) + '#');
      san.push(tuong);
      ngach.push(ng(x, y, 1, y + 2));
      daCh.push({ x: 3, y: y });
    });
    duoi.forEach(function (h) { san.push(h); });
    san.push(tuong);
    return { san: san, ngachHang: ngach, daChuong: daCh };
  }
  function voiDa(t, nots, ben) { return t.daChuong.map(function (d, i) { return da(d.x, d.y, nots[i], ben); }); }
  function manNghe(so, hang, ds) {
    return Object.assign({
      chuong: 'nghe-not', so: so, hang: hang,
      vo: 'hang', loaiRobot: 'gai', thuGai: true, phanAm: true,
      robot: ROBOT_NGHE,
      hamGoc: GOC_NGHE.slice(),
      hamCuaEmCan: [],
      taoHam: [],
      cauTruc: ['for', 'while', 'if', 'dict', 'set'],
      khung: { chinh: 10, moiHam: 8, cauTruc: ['for', 'while', 'if', 'dict', 'set'] },
      mucTieu: 'toi-co'
    }, ds);
  }
  var T7A = tangLuot([5, 6, 4], ['#.Iu####', '##F#####'], 8), T7B = tangLuot([7, 4, 6], ['#.Iu#####', '##F######'], 9);
  var T10A = tangLuot([5, 6], ['#.IIIIF#'], 8), T10B = tangLuot([6, 4], ['#.IIIIIIF#'], 10);
  function manCheNghe(so, hang, ds) {
    return Object.assign({
      chuong: 'che-nghe-not', so: so, hang: hang,
      vo: 'hang', loaiRobot: 'gai', thuGai: true, phanAm: true,
      robot: ROBOT_NGHE,
      hamGoc: GOC_NGHE.slice(),
      hamCuaEmCan: [],
      taoHam: [],
      cauTruc: ['for', 'while', 'if', 'else', 'dict', 'set'],
      khung: { chinh: 10, moiHam: 8, cauTruc: ['for', 'while', 'if', 'else', 'dict', 'set'] },
      mucTieu: 'toi-co'
    }, ds);
  }

  var C1A = tangLuot([6, 4, 5], ['#.Iu####', '##F#####'], 8), C1B = tangLuot([4, 6, 7], ['#.Iu#####', '##F######'], 9);
  var C2A = tangLuot([5, 6], ['#.Iu####', '##F#####'], 8), C2B = tangLuot([4, 7, 5], ['#.Iu#####', '##F######'], 9);
  var C8A = tangLuot([5, 4, 6], ['#.Iu####', '##F#####'], 8), C8B = tangLuot([6, 7, 4], ['#.Iu#####', '##F######'], 9);
  var C10A = tangLuot([5, 6], ['#.IIIII#', '######I#', '######I#', '#####FI#'], 8);
  var C10B = tangLuot([4, 6], ['#.IIII###', '#####I###', '##F##I###', '##IIII###'], 9);

  var CRACK_TUNNEL = ham('crack_tunnel', ['play_note(listen())', 'glide_tunnel()']);
  var DECODE_GLIDE = ham('decode_glide', ['n = listen()', 'crack_glide(d[n], k)'], ['d', 'k']);
  var LISTEN_UNIQUE_STEP = ham('listen_unique_step', ['n = listen()', 'if n not in s:', '    s.add(n)', '    play_note(n)', 'move()'], ['s']);

  var DS = [
    /* ========================================================================
       CHƯƠNG 1: nghe-not — Bắt nốt chuông đá
       ====================================================================== */
    manNghe(1, 'lam-quen', {
      ten: 'Nghe nốt của đá',
      chiChay: true, chinhCoDinh: true,
      hamCuaEmCan: ['forward', 'play_note'],
      deBai: 'Sola làm mẫu. Mic của R1 vừa nâng cấp: listen() là nốt của tiếng vang gần nhất. Đá chuông chưa vỡ cũng vang nốt của nó. play_note(listen()) gõ đúng nốt đá. Bấm Chạy để xem.',
      veMaMau: 'Chương trình Sola viết sẵn và đã khoá: nghe nốt đá, gõ đúng nốt đó, rồi đi tới cờ.',
      san: [
        '########',
        '#.....F#',
        '########'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      daChuong: [da(3, 1, 6)],
      maMau: bai(['play_note(listen())', 'forward(5)']),
      loiGiai: bai(['play_note(listen())', 'forward(5)']),
      sao: { o: 9, nhip: 6 },
      goiY: [
        'Luna: listen() không tốn nhịp, như hear().',
        'Luna: Đá nốt 6 nên listen() là 6.'
      ]
    }),

    manNghe(2, 'lam-quen', {
      ten: 'Mỗi hầm một nốt',
      hamCuaEmCan: ['forward', 'play_note'],
      deBai: 'Giúp Sola với! Hai hầm, đá chuông mỗi hầm một nốt. Nghe nốt đá rồi gõ đúng nốt đó.',
      veMaMau: 'Sola gõ nốt 5 của hầm 1. Chạy thử: đá hầm 2 nốt khác.',
      san: hai([
        '#########',
        '#......F#',
        '#########'
      ]),
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      daChuong: [[da(4, 1, 5)], [da(4, 1, 7)]],
      maMau: bai(['play_note(5)', 'forward(6)']),
      loiGiai: bai(['play_note(listen())', 'forward(6)']),
      loiSai: [
        { moTa: 'Gõ nốt 5 của hầm 1: đá hầm 2 không vỡ', baiLam: bai(['play_note(5)', 'forward(6)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'play_note(hear()): hear() là số ô, không phải nốt', baiLam: bai(['play_note(hear())', 'forward(6)']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 9, nhip: 7 },
      goiY: [
        'Luna: listen() là nốt, hear() là số ô.',
        'Luna: play_note(listen()) rồi forward(6).'
      ]
    }),

    manNghe(3, 'lam-quen', {
      ten: 'Nghe rồi ngân dài',
      hamCuaEmCan: ['forward', 'play_note'],
      deBai: 'Giúp Sola với! Đá chuông 3 vạch, mỗi hầm một nốt. Gán nốt nghe được vào n, rồi vừa ngân n đủ 3 nhịp vừa đi tới cờ.',
      veMaMau: 'Sola gõ nốt một nhịp. Chạy thử: đá 3 vạch chưa vỡ.',
      san: hai([
        '#########',
        '#......F#',
        '#########'
      ]),
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      daChuong: [[da(5, 1, 2, 3)], [da(5, 1, 8, 3)]],
      maMau: bai(['n = listen()', 'play_note(n)', 'forward(6)']),
      loiGiai: bai(['n = listen()', 'note(n, 3)', 'forward(6)']),
      loiSai: [
        { moTa: 'Gõ một nhịp: đá 3 vạch chưa vỡ', baiLam: bai(['n = listen()', 'play_note(n)', 'forward(6)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Ngân nốt 2 của hầm 1: đá hầm 2 không vỡ', baiLam: bai(['note(2, 3)', 'forward(6)']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 8, nhip: 6 },
      goiY: [
        'Luna: n = listen() rồi note(n, 3).',
        'Luna: Vừa ngân vừa đi: forward(6) ngay sau note(n, 3).'
      ]
    }),

    manNghe(4, 'luyen', {
      ten: 'Đá nào gõ nốt đó',
      hamCuaEmCan: ['forward', 'play_note'],
      deBai: 'Giúp Sola với! Ba đá chuông cách nhau 2 ô, mỗi đá một nốt, mỗi hầm một bộ nốt. Đứng trước đá nào thì nghe nốt đá đó.',
      veMaMau: 'Sola nghe một lần rồi gõ mãi nốt đó. Chạy thử: đá thứ hai không vỡ.',
      san: hai([
        '#########',
        '#......F#',
        '#########'
      ]),
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      daChuong: [[da(2, 1, 3), da(4, 1, 6), da(6, 1, 1)], [da(2, 1, 7), da(4, 1, 2), da(6, 1, 5)]],
      maMau: bai(['n = listen()', 'for i in range(3):', '    play_note(n)', '    forward(2)']),
      loiGiai: bai(['for i in range(3):', '    play_note(listen())', '    forward(2)']),
      loiSai: [
        { moTa: 'Nghe một lần: đá thứ hai nốt khác, không vỡ', baiLam: bai(['n = listen()', 'for i in range(3):', '    play_note(n)', '    forward(2)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Chép tay nốt hầm 1: đá hầm 2 không vỡ', baiLam: bai(['play_note(3)', 'forward(2)', 'play_note(6)', 'forward(2)', 'play_note(1)', 'forward(2)']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 10, nhip: 9 },
      goiY: [
        'Luna: Nghe lại trước mỗi đá: listen() nằm trong vòng lặp.',
        'Luna: for i in range(3): play_note(listen()), forward(2).'
      ]
    }),

    manNghe(5, 'luyen', {
      ten: 'Lướt tới đá rồi nghe',
      hamCuaEmCan: ['move', 'play_note'],
      deBai: 'Giúp Sola với! Dải đá ướt có hai đá chuông chắn. Lướt dừng ngay trước đá, nghe nốt đá, gõ, rồi lướt tiếp. Hai hầm, đá ở chỗ khác, nốt khác.',
      veMaMau: 'Sola chép tay nốt hầm 1. Chạy thử: hầm 2 đá nốt khác.',
      san: [
        [
          '############',
          '#.IIIIIIIIF#',
          '############'
        ],
        [
          '##############',
          '#.IIIIIIIIIIF#',
          '##############'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      daChuong: [[da(4, 1, 3), da(7, 1, 6)], [da(3, 1, 5), da(9, 1, 2)]],
      maMau: bai(['retract_spikes()', 'move()', 'play_note(3)', 'move()', 'play_note(6)', 'move()']),
      loiGiai: bai(['retract_spikes()', 'for i in range(2):', '    move()', '    play_note(listen())', 'move()']),
      loiSai: [
        { moTa: 'Chép tay nốt hầm 1: đá hầm 2 không vỡ', baiLam: bai(['retract_spikes()', 'move()', 'play_note(3)', 'move()', 'play_note(6)', 'move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên thu gai: move() chỉ bước một ô', baiLam: bai(['for i in range(2):', '    move()', '    play_note(listen())', 'move()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 10, nhip: 5 },
      goiY: [
        'Luna: Mỗi vòng: move() lướt tới đá, rồi play_note(listen()).',
        'Luna: Hết vòng lặp, move() lướt tới cờ.'
      ]
    }),

    manNghe(6, 'luyen', {
      ten: 'Nghe ở góc xoắn ốc',
      hamCuaEmCan: ['move', 'crack_glide'],
      deBai: 'Giúp Sola với! Mỗi góc xoắn ốc có đá chuông 2 vạch chắn đầu dải. Đứng ở góc thì nghe nốt đá, ngân 2 nhịp rồi lướt. Mỗi hầm một bộ nốt.',
      veMaMau: 'Sola ngân nốt 4 ở mọi góc. Chạy thử: đá góc thứ hai không vỡ.',
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
      daChuong: [[da(2, 1, 4, 2), da(6, 2, 7, 2)], [da(2, 1, 6, 2), da(8, 2, 1, 2)]],
      maMau: bai(['for i in range(2):', '    crack_glide(4, 2)', 'move()']),
      loiGiai: bai(['for i in range(2):', '    crack_glide(listen(), 2)', 'move()']),
      loiSai: [
        { moTa: 'Ngân nốt 4 ở mọi góc: đá khác nốt không vỡ', baiLam: bai(['for i in range(2):', '    crack_glide(4, 2)', 'move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Ngân một nhịp: đá 2 vạch chưa vỡ', baiLam: bai(['for i in range(2):', '    crack_glide(listen(), 1)', 'move()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 15, nhip: 9 },
      goiY: [
        'Luna: crack_glide(n, k) nhận nốt n. Nốt đó là listen().',
        'Luna: for i in range(2): crack_glide(listen(), 2). Rồi move().'
      ]
    }),

    manNghe(7, 'bien-the', {
      ten: 'Nghe qua tầng ngách',
      hamCuaEmCan: ['move', 'turn_right', 'play_note', 'glide_tunnel'],
      deBai: 'Giúp Sola với! Ba tầng đá ướt, đá chuông chắn trước miệng ngách mỗi tầng. Nghe nốt đá, gõ, rồi lướt qua ngách. Tầng cuối có hố phía trước, cờ ở bên phải.',
      veMaMau: 'Sola nghe một lần ở tầng đầu. Chạy thử: đá tầng hai không vỡ.',
      san: [T7A.san, T7B.san],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      ngachHang: [T7A.ngachHang, T7B.ngachHang],
      daChuong: [voiDa(T7A, [2, 5, 8]), voiDa(T7B, [6, 3, 1])],
      maMau: bai(['n = listen()', 'for i in range(3):', '    play_note(n)', '    glide_tunnel()', 'turn_right()', 'move()']),
      loiGiai: bai(['for i in range(3):', '    play_note(listen())', '    glide_tunnel()', 'turn_right()', 'move()']),
      loiSai: [
        { moTa: 'Nghe một lần ở tầng đầu: đá tầng hai không vỡ', baiLam: bai(['n = listen()', 'for i in range(3):', '    play_note(n)', '    glide_tunnel()', 'turn_right()', 'move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Lướt trước rồi mới gõ: R1 kẹt trước đá', baiLam: bai(['for i in range(3):', '    glide_tunnel()', '    play_note(listen())', 'turn_right()', 'move()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 16, nhip: 11 },
      goiY: [
        'Luna: Mỗi tầng: play_note(listen()) rồi glide_tunnel().',
        'Luna: Hết ba tầng: turn_right(), move().'
      ]
    }),

    manNghe(8, 'bien-the', {
      ten: 'Sổ ám hiệu',
      khoaTD: ['2', '4'],
      hamCuaEmCan: ['forward'],
      deBai: 'Giúp Sola với! R1 đứng ngay dưới một chuông đá. Chuông ngân ám hiệu, đá chuông 3 vạch phía trước cần nốt khác. Sổ d dịch ám hiệu ra nốt phá đá: chuông nốt 2 thì đá nốt 5, chuông nốt 4 thì đá nốt 7.',
      veMaMau: 'Sola ngân luôn nốt chuông. Chạy thử: đá không vỡ.',
      san: hai([
        '#########',
        '#......F#',
        '#########'
      ]),
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      chuongDa: [[cd(1, 1, 2)], [cd(1, 1, 4)]],
      daChuong: [[da(5, 1, 5, 3)], [da(5, 1, 7, 3)]],
      maMau: bai(['d = {2: 5, 4: 7}', 'note(listen(), 3)', 'forward(6)']),
      loiGiai: bai(['d = {2: 5, 4: 7}', 'n = listen()', 'note(d[n], 3)', 'forward(6)']),
      loiSai: [
        { moTa: 'Ngân nốt chuông: đá cần nốt khác, không vỡ', baiLam: bai(['d = {2: 5, 4: 7}', 'note(listen(), 3)', 'forward(6)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Ngân nốt 5 của hầm 1: đá hầm 2 không vỡ', baiLam: bai(['d = {2: 5, 4: 7}', 'note(5, 3)', 'forward(6)']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 9, nhip: 6 },
      goiY: [
        'Luna: Đứng dưới chuông thì listen() là nốt chuông. n = listen(), rồi d[n] là nốt đá.',
        'Luna: n = listen(), note(d[n], 3), rồi forward(6).'
      ]
    }),

    manNghe(9, 'bien-the', {
      ten: 'Không gõ lại nốt đã nghe',
      hamCuaEmCan: ['move', 'forward', 'play_note'],
      nhipToiDa: 10,
      deBai: 'Giúp Sola với! Bốn ô đầu hầm, ô nào cũng treo một chuông đá. Dưới mỗi chuông, nghe nốt rồi gõ, đá chuông cùng nốt ở cuối hầm sẽ vỡ. Nốt đã gõ thì không gõ lại: chỉ còn 10 nhịp.',
      veMaMau: 'Sola gõ ở mọi chuông. Chạy thử: hết nhịp.',
      san: hai([
        '###########',
        '#........F#',
        '###########'
      ]),
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      chuongDa: [[cd(1, 1, 3), cd(2, 1, 5), cd(3, 1, 3), cd(4, 1, 5)], [cd(1, 1, 6), cd(2, 1, 6), cd(3, 1, 2), cd(4, 1, 2)]],
      daChuong: [[da(6, 1, 3), da(8, 1, 5)], [da(6, 1, 6), da(8, 1, 2)]],
      maMau: bai(['for i in range(4):', '    play_note(listen())', '    move()', 'forward(4)']),
      loiGiai: bai(['s = set()', 'for i in range(4):', '    n = listen()', '    if n not in s:', '        s.add(n)', '        play_note(n)', '    move()', 'forward(4)']),
      loiSai: [
        { moTa: 'Gõ ở mọi chuông: quá 10 nhịp', baiLam: bai(['for i in range(4):', '    play_note(listen())', '    move()', 'forward(4)']), phaiCoMa: ['qua-nhieu-nhip'] },
        { moTa: 'move() nằm trong nhánh if: gặp nốt trùng thì R1 đứng yên', baiLam: bai(['s = set()', 'for i in range(4):', '    n = listen()', '    if n not in s:', '        s.add(n)', '        play_note(n)', '        move()', 'forward(4)']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 15, nhip: 10 },
      goiY: [
        'Luna: Túi s ghi nốt đã gõ. n = listen(), if n not in s: thì thêm vào túi rồi gõ.',
        'Luna: move() thụt ngang với if (không nằm trong nhánh if).'
      ]
    }),

    manNghe(10, 'tong-hop', {
      ten: 'Trùm: hầm ám hiệu',
      khoaTD: ['3', '5'],
      hamCuaEmCan: ['move', 'play_note', 'glide_tunnel'],
      deBai: 'Giúp Sola với! Hai tầng đá ướt có đá chuông chắn như màn trước. Ra khỏi tầng cuối, R1 đứng dưới chuông ám hiệu, đá chuông 2 vạch chắn dải đá ướt dẫn tới cờ. Sổ d dịch ám hiệu ra nốt đá.',
      veMaMau: 'Sola ngân luôn nốt chuông. Chạy thử: đá cuối không vỡ.',
      san: [T10A.san, T10B.san],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      ngachHang: [T10A.ngachHang, T10B.ngachHang],
      chuongDa: [[cd(2, 5, 3)], [cd(2, 5, 5)]],
      daChuong: [voiDa(T10A, [2, 7]).concat([da(3, 5, 6, 2)]), voiDa(T10B, [4, 8]).concat([da(3, 5, 1, 2)])],
      maMau: bai(['d = {3: 6, 5: 1}', 'for i in range(2):', '    play_note(listen())', '    glide_tunnel()', 'note(listen(), 2)', 'wait()', 'retract_spikes()', 'move()']),
      loiGiai: bai(['d = {3: 6, 5: 1}', 'for i in range(2):', '    play_note(listen())', '    glide_tunnel()', 'n = listen()', 'note(d[n], 2)', 'wait()', 'retract_spikes()', 'move()']),
      loiSai: [
        { moTa: 'Ngân nốt chuông: đá cuối cần nốt khác', baiLam: bai(['d = {3: 6, 5: 1}', 'for i in range(2):', '    play_note(listen())', '    glide_tunnel()', 'note(listen(), 2)', 'wait()', 'retract_spikes()', 'move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Ngân nốt 6 của hầm 1: đá cuối hầm 2 không vỡ', baiLam: bai(['d = {3: 6, 5: 1}', 'for i in range(2):', '    play_note(listen())', '    glide_tunnel()', 'note(6, 2)', 'wait()', 'retract_spikes()', 'move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên wait(): R1 lướt khi đá chưa vỡ', baiLam: bai(['d = {3: 6, 5: 1}', 'for i in range(2):', '    play_note(listen())', '    glide_tunnel()', 'n = listen()', 'note(d[n], 2)', 'retract_spikes()', 'move()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 18, nhip: 9 },
      goiY: [
        'Luna: Hai tầng như màn "Nghe qua tầng ngách".',
        'Luna: Dưới chuông: n = listen(), note(d[n], 2), wait(), rồi lướt tới cờ.'
      ]
    }),

    /* ========================================================================
       CHƯƠNG 2: che-nghe-not — Chế lệnh: giải mã giai điệu
       ====================================================================== */
    manCheNghe(1, 'lam-quen', {
      ten: 'Chế lệnh: nghe rồi chui',
      taoHam: ['crack_tunnel'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'turn_right', 'play_note', 'glide_tunnel'],
      deBai: 'Giúp Sola với! Chế hàm crack_tunnel(): nghe nốt đá chắn trước, gõ đúng nốt đó, rồi glide_tunnel(). Chương trình chính đã khoá.',
      veMaMau: 'Chương trình chính gọi crack_tunnel() ba lần. Mở Xưởng hàm, chế crack_tunnel().',
      san: [C1A.san, C1B.san],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      ngachHang: [C1A.ngachHang, C1B.ngachHang],
      daChuong: [voiDa(C1A, [3, 7, 2]), voiDa(C1B, [5, 1, 6])],
      maMau: bai(['for i in range(3):', '    crack_tunnel()', 'turn_right()', 'move()']),
      loiGiai: bai(['for i in range(3):', '    crack_tunnel()', 'turn_right()', 'move()'], [], [CRACK_TUNNEL]),
      loiSai: [
        { moTa: 'Chưa chế hàm crack_tunnel', baiLam: bai(['for i in range(3):', '    crack_tunnel()', 'turn_right()', 'move()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Thân hàm lướt trước rồi mới gõ: R1 kẹt trước đá', baiLam: bai(['for i in range(3):', '    crack_tunnel()', 'turn_right()', 'move()']), hamCuaEmMoi: [ham('crack_tunnel', ['glide_tunnel()', 'play_note(listen())'])], phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 17, nhip: 11 },
      goiY: [
        'Luna: Thân hàm hai dòng, giống màn "Nghe qua tầng ngách".',
        'Luna: play_note(listen()), glide_tunnel().'
      ]
    }),

    manCheNghe(2, 'lam-quen', {
      ten: 'Còn đá thì còn chui',
      hamCuaEmCan: ['move', 'turn_right', 'crack_tunnel'],
      deBai: 'Giúp Sola với! Tầng nào cũng có đá chuông chắn. Đá chưa vỡ còn vang, nên còn nghe tiếng vang là còn tầng. Hai hầm số tầng khác nhau. Tầng cuối có hố phía trước, cờ ở bên phải.',
      veMaMau: 'Sola đếm tầng của hầm 1. Chạy thử: hầm 2 có ba tầng.',
      san: [C2A.san, C2B.san],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      ngachHang: [C2A.ngachHang, C2B.ngachHang],
      daChuong: [voiDa(C2A, [4, 8]), voiDa(C2B, [2, 6, 3])],
      maMau: bai(['for i in range(2):', '    crack_tunnel()', 'turn_right()', 'move()']),
      loiGiai: bai(['while hear() > 0:', '    crack_tunnel()', 'turn_right()', 'move()']),
      loiSai: [
        { moTa: 'Đếm tầng hầm 1: hầm 2 còn một tầng', baiLam: bai(['for i in range(2):', '    crack_tunnel()', 'turn_right()', 'move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'while hear() == 0: vòng lặp không chạy', baiLam: bai(['while hear() == 0:', '    crack_tunnel()', 'turn_right()', 'move()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 17, nhip: 11 },
      goiY: [
        'Luna: while hear() > 0: crack_tunnel().',
        'Luna: Ra ngoài vòng lặp: turn_right(), move().'
      ]
    }),

    manCheNghe(3, 'luyen', {
      ten: 'Chế lệnh: giải mã rồi lướt',
      khoaTD: ['1', '3'],
      taoHam: ['decode_glide'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'crack_glide'],
      deBai: 'Giúp Sola với! Ở mỗi góc, R1 dừng ngay dưới chuông ám hiệu, đá chuông 2 vạch chắn đầu dải. Chế hàm decode_glide(d, k): tra sổ d theo nốt chuông, rồi crack_glide nốt đó k nhịp. Chương trình chính đã khoá.',
      veMaMau: 'Chương trình chính gọi decode_glide hai lần. Mở Xưởng hàm, chế decode_glide(d, k).',
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
      chuongDa: [[cd(1, 1, 1), cd(6, 1, 3)], [cd(1, 1, 3), cd(8, 1, 1)]],
      daChuong: [[da(2, 1, 6, 2), da(6, 2, 8, 2)], [da(2, 1, 8, 2), da(8, 2, 6, 2)]],
      maMau: bai(['d = {1: 6, 3: 8}', 'decode_glide(d, 2)', 'decode_glide(d, 2)', 'move()']),
      loiGiai: bai(['d = {1: 6, 3: 8}', 'decode_glide(d, 2)', 'decode_glide(d, 2)', 'move()'], [], [DECODE_GLIDE]),
      loiSai: [
        { moTa: 'Chưa chế hàm decode_glide', baiLam: bai(['d = {1: 6, 3: 8}', 'decode_glide(d, 2)', 'decode_glide(d, 2)', 'move()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Thân hàm không tra sổ: ngân nốt chuông, đá không vỡ', baiLam: bai(['d = {1: 6, 3: 8}', 'decode_glide(d, 2)', 'decode_glide(d, 2)', 'move()']), hamCuaEmMoi: [ham('decode_glide', ['crack_glide(listen(), k)'], ['d', 'k'])], phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 18, nhip: 9 },
      goiY: [
        'Luna: n = listen() là nốt chuông, d[n] là nốt đá.',
        'Luna: Thân hàm hai dòng: n = listen(), crack_glide(d[n], k).'
      ]
    }),

    manCheNghe(4, 'luyen', {
      ten: 'Sổ ám hiệu mỗi hầm',
      khoaTD: ['2', '5', '6'],
      hamCuaEmCan: ['move', 'decode_glide'],
      duLieuSan: ['d = {2: 7, 5: 3}', 'd = {2: 4, 6: 1}'],
      deBai: 'Giúp Sola với! Mỗi hầm dùng một sổ ám hiệu d riêng. Ba góc xoắn ốc, góc nào cũng có chuông ám hiệu và đá chuông 1 vạch.',
      veMaMau: 'Sola giải mã hai góc. Chạy thử: còn góc thứ ba.',
      san: [
        [
          '##########',
          '#.IIIIIII#',
          '########I#',
          '########I#',
          '###F####I#',
          '###IIIIII#',
          '##########'
        ],
        [
          '########',
          '#.IIIII#',
          '######I#',
          '#F####I#',
          '#IIIIII#',
          '########'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      chuongDa: [[cd(1, 1, 2), cd(8, 1, 5), cd(8, 5, 2)], [cd(1, 1, 6), cd(6, 1, 2), cd(6, 4, 6)]],
      daChuong: [[da(2, 1, 7), da(8, 2, 3), da(7, 5, 7)], [da(2, 1, 1), da(6, 2, 4), da(5, 4, 1)]],
      maMau: bai(['d = {2: 7, 5: 3}', 'for i in range(2):', '    decode_glide(d, 1)', 'move()']),
      loiGiai: bai(['d = {2: 7, 5: 3}', 'for i in range(3):', '    decode_glide(d, 1)', 'move()']),
      loiSai: [
        { moTa: 'Lặp hai lần: còn góc thứ ba', baiLam: bai(['d = {2: 7, 5: 3}', 'for i in range(2):', '    decode_glide(d, 1)', 'move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Không tra sổ: ngân nốt chuông, đá không vỡ', baiLam: bai(['d = {2: 7, 5: 3}', 'for i in range(3):', '    crack_glide(listen(), 1)', 'move()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 18, nhip: 10 },
      goiY: [
        'Luna: for i in range(3): decode_glide(d, 1).',
        'Luna: Ra ngoài vòng lặp: move() vào cờ.'
      ]
    }),

    manCheNghe(5, 'luyen', {
      ten: 'Chế lệnh: nghe từng ô',
      taoHam: ['listen_unique_step'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward', 'play_note'],
      nhipToiDa: 10,
      deBai: 'Giúp Sola với! Bốn ô đầu hầm treo chuông đá. Chế hàm listen_unique_step(s): nghe nốt, nốt chưa có trong túi s thì thêm vào túi và gõ, rồi bước một ô. Chỉ còn 10 nhịp. Chương trình chính đã khoá.',
      veMaMau: 'Chương trình chính gọi listen_unique_step bốn lần. Mở Xưởng hàm, chế listen_unique_step(s).',
      san: hai([
        '###########',
        '#........F#',
        '###########'
      ]),
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      chuongDa: [[cd(1, 1, 2), cd(2, 1, 7), cd(3, 1, 7), cd(4, 1, 2)], [cd(1, 1, 5), cd(2, 1, 5), cd(3, 1, 5), cd(4, 1, 3)]],
      daChuong: [[da(6, 1, 2), da(8, 1, 7)], [da(6, 1, 5), da(8, 1, 3)]],
      maMau: bai(['s = set()', 'for i in range(4):', '    listen_unique_step(s)', 'forward(4)']),
      loiGiai: bai(['s = set()', 'for i in range(4):', '    listen_unique_step(s)', 'forward(4)'], [], [LISTEN_UNIQUE_STEP]),
      loiSai: [
        { moTa: 'Chưa chế hàm listen_unique_step', baiLam: bai(['s = set()', 'for i in range(4):', '    listen_unique_step(s)', 'forward(4)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Thân hàm quên s.add(n): gõ lại nốt cũ, quá 10 nhịp', baiLam: bai(['s = set()', 'for i in range(4):', '    listen_unique_step(s)', 'forward(4)']), hamCuaEmMoi: [ham('listen_unique_step', ['n = listen()', 'if n not in s:', '    play_note(n)', 'move()'], ['s'])], phaiCoMa: ['qua-nhieu-nhip'] }
      ],
      sao: { o: 16, nhip: 10 },
      goiY: [
        'Luna: Giống màn "Không gõ lại nốt đã nghe", gói lại thành hàm.',
        'Luna: n = listen(), if n not in s: (thụt vào s.add(n), play_note(n)), rồi move() ngang với if.'
      ]
    }),

    manCheNghe(6, 'luyen', {
      ten: 'Nghe từng ô rồi lướt',
      hamCuaEmCan: ['move', 'listen_unique_step'],
      nhipToiDa: 7,
      deBai: 'Giúp Sola với! Bốn ô đầu hầm treo chuông đá, sau đó là dải đá ướt có đá chuông chắn. Gõ mỗi nốt một lần dưới các chuông, rồi lướt một mạch tới cờ. Chỉ còn 7 nhịp.',
      veMaMau: 'Sola gõ ở mọi chuông. Chạy thử: hết nhịp.',
      san: [
        [
          '############',
          '#.....IIIIF#',
          '############'
        ],
        [
          '###############',
          '#.....IIIIIIIF#',
          '###############'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      chuongDa: [[cd(1, 1, 4), cd(2, 1, 4), cd(3, 1, 1), cd(4, 1, 1)], [cd(1, 1, 3), cd(2, 1, 6), cd(3, 1, 6), cd(4, 1, 3)]],
      daChuong: [[da(7, 1, 4), da(9, 1, 1)], [da(8, 1, 3), da(11, 1, 6)]],
      maMau: bai(['for i in range(4):', '    play_note(listen())', '    move()', 'retract_spikes()', 'move()']),
      loiGiai: bai(['s = set()', 'for i in range(4):', '    listen_unique_step(s)', 'retract_spikes()', 'move()']),
      loiSai: [
        { moTa: 'Gõ ở mọi chuông: quá 7 nhịp', baiLam: bai(['for i in range(4):', '    play_note(listen())', '    move()', 'retract_spikes()', 'move()']), phaiCoMa: ['qua-nhieu-nhip'] },
        { moTa: 'Quên thu gai: R1 chỉ bước một ô', baiLam: bai(['s = set()', 'for i in range(4):', '    listen_unique_step(s)', 'move()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 15, nhip: 7 },
      goiY: [
        'Luna: s = set(), rồi for i in range(4): listen_unique_step(s).',
        'Luna: Hết vòng lặp: retract_spikes(), move().'
      ]
    }),

    manCheNghe(7, 'bien-the', {
      ten: 'Sửa hàm giải mã',
      khoaTD: ['1', '3'],
      suaHam: ['decode_glide'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'crack_glide', 'decode_glide'],
      deBai: 'Giúp Sola với! Ai đó sửa decode_glide(d, k) thành ngân luôn nốt chuông, quên tra sổ. Sửa lại hàm. Chương trình chính đã khoá.',
      veMaMau: 'Mở decode_glide trong Xưởng hàm. Chạy thử: đá không vỡ.',
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
      chuongDa: [[cd(1, 1, 1), cd(7, 1, 3), cd(7, 5, 1)], [cd(1, 1, 3), cd(5, 1, 1), cd(5, 4, 3)]],
      daChuong: [[da(2, 1, 6, 2), da(7, 2, 8, 2), da(6, 5, 6, 2)], [da(2, 1, 8, 2), da(5, 2, 6, 2), da(4, 4, 8, 2)]],
      maMau: bai(['d = {1: 6, 3: 8}', 'for i in range(3):', '    decode_glide(d, 2)', 'move()'], [], [ham('decode_glide', ['crack_glide(listen(), k)'], ['d', 'k'])]),
      loiGiai: bai(['d = {1: 6, 3: 8}', 'for i in range(3):', '    decode_glide(d, 2)', 'move()'], [], [DECODE_GLIDE]),
      loiSai: [
        { moTa: 'Không sửa: ngân nốt chuông, đá không vỡ', baiLam: bai(['d = {1: 6, 3: 8}', 'for i in range(3):', '    decode_glide(d, 2)', 'move()']), hamCuaEmMoi: [ham('decode_glide', ['crack_glide(listen(), k)'], ['d', 'k'])], phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Tra sổ nhưng ngân 1 nhịp: đá 2 vạch chưa vỡ', baiLam: bai(['d = {1: 6, 3: 8}', 'for i in range(3):', '    decode_glide(d, 2)', 'move()']), hamCuaEmMoi: [ham('decode_glide', ['n = listen()', 'crack_glide(d[n], 1)'], ['d', 'k'])], phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 18, nhip: 13 },
      goiY: [
        'Luna: listen() là nốt chuông. Nốt đá là d[n] với n = listen().',
        'Luna: Hai dòng: n = listen(), crack_glide(d[n], k).'
      ]
    }),

    manCheNghe(8, 'bien-the', {
      ten: 'Ám hiệu qua ngách',
      khoaTD: ['2', '6', '8'],
      hamCuaEmCan: ['move', 'turn_right', 'play_note', 'glide_tunnel', 'crack_tunnel'],
      deBai: 'Giúp Sola với! Ở mỗi tầng, R1 đứng dưới chuông ám hiệu, đá chuông chắn trước miệng ngách cần nốt khác. Tra sổ d rồi gõ, rồi lướt qua ngách. crack_tunnel() ở đây sẽ gõ nhầm nốt chuông.',
      veMaMau: 'Sola dùng crack_tunnel(). Chạy thử: đá không vỡ.',
      san: [C8A.san, C8B.san],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      ngachHang: [C8A.ngachHang, C8B.ngachHang],
      chuongDa: [[cd(1, 1, 2), cd(2, 3, 6), cd(2, 5, 8)], [cd(1, 1, 8), cd(2, 3, 2), cd(2, 5, 6)]],
      daChuong: [voiDa(C8A, [5, 3, 1]), voiDa(C8B, [1, 5, 3])],
      maMau: bai(['d = {2: 5, 6: 3, 8: 1}', 'for i in range(3):', '    crack_tunnel()', 'turn_right()', 'move()']),
      loiGiai: bai(['d = {2: 5, 6: 3, 8: 1}', 'for i in range(3):', '    n = listen()', '    play_note(d[n])', '    glide_tunnel()', 'turn_right()', 'move()']),
      loiSai: [
        { moTa: 'crack_tunnel(): gõ nốt chuông, đá không vỡ', baiLam: bai(['d = {2: 5, 6: 3, 8: 1}', 'for i in range(3):', '    crack_tunnel()', 'turn_right()', 'move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Nghe một lần ở tầng đầu: đá tầng hai không vỡ', baiLam: bai(['d = {2: 5, 6: 3, 8: 1}', 'n = listen()', 'for i in range(3):', '    play_note(d[n])', '    glide_tunnel()', 'turn_right()', 'move()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 18, nhip: 11 },
      goiY: [
        'Luna: Mỗi tầng: n = listen(), rồi play_note(d[n]).',
        'Luna: Rồi glide_tunnel(). Hết ba tầng: turn_right(), move().'
      ]
    }),

    manCheNghe(9, 'bien-the', {
      ten: 'Giải mã tới khi hết đá',
      khoaTD: ['4', '7'],
      hamCuaEmCan: ['move', 'decode_glide'],
      deBai: 'Giúp Sola với! Chuông ám hiệu ở đây ngân khẽ, chỉ nghe được khi đứng ngay dưới. Đá chuông 2 vạch thì vang xa. Còn nghe đá thì còn giải mã rồi lướt. Hai hầm số góc khác nhau.',
      veMaMau: 'Sola đếm góc của hầm 1. Chạy thử: hầm 2 nhiều góc hơn.',
      san: [
        [
          '########',
          '#.IIIII#',
          '######I#',
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
      chuongDa: [[cd(1, 1, 4, 1), cd(6, 1, 7, 1)], [cd(1, 1, 7, 1), cd(5, 1, 4, 1), cd(5, 4, 7, 1)]],
      daChuong: [[da(2, 1, 2, 2), da(6, 2, 5, 2)], [da(2, 1, 5, 2), da(5, 2, 2, 2), da(4, 4, 5, 2)]],
      maMau: bai(['d = {4: 2, 7: 5}', 'for i in range(2):', '    decode_glide(d, 2)', 'move()']),
      loiGiai: bai(['d = {4: 2, 7: 5}', 'while hear() > 0:', '    decode_glide(d, 2)', 'move()']),
      loiSai: [
        { moTa: 'Đếm góc hầm 1: hầm 2 còn một đá', baiLam: bai(['d = {4: 2, 7: 5}', 'for i in range(2):', '    decode_glide(d, 2)', 'move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'while hear() == 0: vòng lặp không chạy, R1 đâm đá', baiLam: bai(['d = {4: 2, 7: 5}', 'while hear() == 0:', '    decode_glide(d, 2)', 'move()']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 18, nhip: 13 },
      goiY: [
        'Luna: hear() bỏ qua chuông ngay trên đầu, chỉ đo tới đá còn vang.',
        'Luna: while hear() > 0: decode_glide(d, 2). Rồi move().'
      ]
    }),

    manCheNghe(10, 'tong-hop', {
      ten: 'Trùm: hầm giai điệu',
      khoaTD: ['2', '4'],
      hamCuaEmCan: ['move', 'crack_tunnel', 'decode_glide'],
      deBai: 'Giúp Sola với! Hai tầng đá ướt có đá chuông chắn, nghe là ra nốt. Ra khỏi tầng cuối là xoắn ốc: góc nào cũng có chuông ám hiệu ngân khẽ và đá chuông 2 vạch. Tra sổ d. Hai hầm số góc khác nhau.',
      veMaMau: 'Sola đếm góc xoắn ốc của hầm 1. Chạy thử: hầm 2 nhiều góc hơn.',
      san: [C10A.san, C10B.san],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      ngachHang: [C10A.ngachHang, C10B.ngachHang],
      chuongDa: [[cd(2, 5, 2, 1), cd(6, 5, 4, 1)], [cd(2, 5, 4, 1), cd(5, 5, 2, 1), cd(5, 8, 4, 1)]],
      daChuong: [
        voiDa(C10A, [3, 6]).concat([da(3, 5, 7, 2), da(6, 6, 1, 2)]),
        voiDa(C10B, [5, 8]).concat([da(3, 5, 1, 2), da(5, 6, 7, 2), da(4, 8, 1, 2)])
      ],
      maMau: bai(['d = {2: 7, 4: 1}', 'for i in range(2):', '    crack_tunnel()', 'for i in range(2):', '    decode_glide(d, 2)', 'move()']),
      loiGiai: bai(['d = {2: 7, 4: 1}', 'for i in range(2):', '    crack_tunnel()', 'while hear() > 0:', '    decode_glide(d, 2)', 'move()']),
      loiSai: [
        { moTa: 'Đếm góc hầm 1: hầm 2 còn một đá', baiLam: bai(['d = {2: 7, 4: 1}', 'for i in range(2):', '    crack_tunnel()', 'for i in range(2):', '    decode_glide(d, 2)', 'move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Xoắn ốc không tra sổ: gõ nốt chuông, đá không vỡ', baiLam: bai(['d = {2: 7, 4: 1}', 'for i in range(2):', '    crack_tunnel()', 'for i in range(3):', '    crack_glide(listen(), 2)', 'move()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 28, nhip: 19 },
      goiY: [
        'Luna: Hai tầng: for i in range(2): crack_tunnel().',
        'Luna: Xoắn ốc: while hear() > 0: decode_glide(d, 2). Rồi move().'
      ]
    })
  ];

  if (M && M.them) M.manNgheNot = DS;
  if (typeof module !== 'undefined' && module.exports) module.exports = M;
})();
