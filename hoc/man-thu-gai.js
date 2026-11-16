/* ============================================================================
   man-thu-gai.js — Mùa 8 Hang động · Gói 5: Thu gai (viết lại 16/11, KE-HOACH-MUA-8.md)
   Chương 1: thu-gai "Lướt đá ướt" (10 màn): retract_spikes() thu gai (không tốn nhịp): bước vào ô đá ướt 'I' là lướt một mạch,
             dừng ở ô đầu tiên không phải 'I' (bị chặn thì dừng ở ô 'I' cuối; gặp hố thì rơi), cả cú lướt tốn một nhịp.
             extend_spikes() bung gai lại, bám từng bước. Lướt vào ngách, lướt rồi nghe chuông, đá chuông chắn dải, sổ nốt theo sân.
   Chương 2: che-thu-gai "Chế lệnh: lướt rồi bám" (10 màn): slide_stop(), glide_step(), glide_tunnel(), echo_glide()
             (mùa 9 gọi cả bốn hàm: giữ tên và thân).
   Lời: "Giúp Sola với!", gợi ý của Luna, gọi người chơi là "bạn".
   ========================================================================== */
(function () {
  'use strict';

  var M = (typeof window !== 'undefined' && window.ManHoc) ||
    (typeof require === 'function' ? require('./man-chuoi-1.js') : null);

  var GOC_GAI = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'note', 'beat', 'hear', 'retract_spikes', 'extend_spikes'];
  var ROBOT_GAI = { than: 'gai', tay: 'loa', camBien: [{ ma: 'am-thanh', o: 'tren' }] };

  function bai(chinh, ham, moi) {
    return { chinh: chinh, hamCuaMan: ham || [], hamCuaEmMoi: moi || [] };
  }
  function ham(ten, than, thamSo) {
    return { ten: ten, than: than, thamSo: thamSo || [] };
  }
  function cd(x, y, not, phamVi) { return phamVi ? { x: x, y: y, not: not, phamVi: phamVi } : { x: x, y: y, not: not }; }
  function da(x, y, not, ben) { return { x: x, y: y, not: not, ben: ben || 1 }; }
  function ng(ax, ay, bx, by) { return { a: { x: ax, y: ay }, b: { x: bx, y: by } }; }
  function hai(a) { return [a, a]; }

  /** Tầng đá ướt: tầng i ở hàng y = 2i + 1: ô (1, y) là chỗ xuất phát hay miệng ra của tầng trên, ô (2, y) đá ướt, đá chuông ở (3, y) trên đá ướt,
   *  đá ướt tới miệng ngách ở (cuoi[i], y), chui xuống (1, y + 2). Các hàng `duoi` vẽ từ hàng y = 2n + 1 (hàng đầu là hàng của miệng ra cuối).
   *  Trả về { san, ngachHang, daChuong }. */
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
  function voiDa(t, nots) { return t.daChuong.map(function (d, i) { return da(d.x, d.y, nots[i]); }); }

  function manLuot(so, hang, ds) {
    return Object.assign({
      chuong: 'thu-gai', so: so, hang: hang,
      vo: 'hang', loaiRobot: 'gai', thuGai: true,
      robot: ROBOT_GAI,
      hamGoc: GOC_GAI.slice(),
      hamCuaEmCan: [],
      taoHam: [],
      cauTruc: ['for', 'while', 'dict'],
      khung: { chinh: 10, moiHam: 8, cauTruc: ['for', 'while', 'dict'] },
      mucTieu: 'toi-co'
    }, ds);
  }

  function manCheLuot(so, hang, ds) {
    return Object.assign({
      chuong: 'che-thu-gai', so: so, hang: hang,
      vo: 'hang', loaiRobot: 'gai', thuGai: true,
      robot: ROBOT_GAI,
      hamGoc: GOC_GAI.slice(),
      hamCuaEmCan: [],
      taoHam: [],
      cauTruc: ['for', 'while', 'if', 'else', 'dict', 'set'],
      khung: { chinh: 10, moiHam: 8, cauTruc: ['for', 'while', 'if', 'else', 'dict', 'set'] },
      mucTieu: 'toi-co'
    }, ds);
  }

  var T8A = tangLuot([6, 5], ['#.Iu####', '##F#####'], 8), T8B = tangLuot([4, 7, 5], ['#.Iu#####', '##F######'], 9);
  var T9A = tangLuot([5, 6, 4], ['#.Iu####', '##F#####'], 8), T9B = tangLuot([7, 4, 6], ['#.Iu#####', '##F######'], 9);
  var T10A = tangLuot([7, 6], ['#.IIIIII#', '#######I#', '#######I#', '#####F.I#'], 9);
  var T10B = tangLuot([5, 7, 4], ['#.IIIIII#', '#######I#', '#######I#', '###F###I#', '###.###I#', '###IIIII#'], 9);

  var SLIDE_STOP = ham('slide_stop', ['retract_spikes()', 'move()', 'extend_spikes()', 'move()']);
  var GLIDE_STEP = ham('glide_step', ['retract_spikes()', 'move()', 'extend_spikes()', 'turn_right()']);
  var GLIDE_TUNNEL = ham('glide_tunnel', ['retract_spikes()', 'move()', 'extend_spikes()', 'move()']);
  var ECHO_GLIDE = ham('echo_glide', ['if hear() > 0:', '    glide_step()', 'else:', '    move()']);

  var DS = [
    /* ========================================================================
       CHƯƠNG 1: thu-gai — Lướt đá ướt
       ====================================================================== */
    manLuot(1, 'lam-quen', {
      ten: 'Thu gai, lướt một mạch',
      chiChay: true, chinhCoDinh: true,
      hamCuaEmCan: ['move'],
      deBai: 'Sola làm mẫu. Ô I là đá vôi ướt. Gai bung thì R1 bám từng bước. retract_spikes() thu gai: R1 bước vào đá ướt là lướt một mạch tới hết dải, chỉ tốn một nhịp. extend_spikes() bung gai lại. Bấm Chạy để xem.',
      veMaMau: 'Chương trình Sola viết sẵn và đã khoá: thu gai, lướt, bung gai, bước vào cờ.',
      san: [
        '#########',
        '#.IIII.F#',
        '#########'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['retract_spikes()', 'move()', 'extend_spikes()', 'move()']),
      loiGiai: bai(['retract_spikes()', 'move()', 'extend_spikes()', 'move()']),
      sao: { o: 7, nhip: 2 },
      goiY: [
        'Luna: Thu gai và bung gai không tốn nhịp.',
        'Luna: Bốn ô đá ướt mà chỉ một nhịp lướt.'
      ]
    }),

    manLuot(2, 'lam-quen', {
      ten: 'Dải dài, dải ngắn',
      hamCuaEmCan: ['move', 'forward', 'turn_right'],
      nhipToiDa: 6,
      deBai: 'Giúp Sola với! Nước ngầm dâng, chỉ còn 6 nhịp. Đi bộ qua dải đá ướt thì không kịp. Thu gai, lướt tới chỗ rẽ, rồi rẽ phải xuống cờ. Hai hầm dài ngắn khác nhau.',
      veMaMau: 'Sola đếm từng bước của hầm 1. Chạy thử: hết nhịp, mà hầm 2 còn dài hơn.',
      san: [
        [
          '#########',
          '#.IIII.##',
          '######.##',
          '######F##',
          '#########'
        ],
        [
          '###########',
          '#.IIIIIII.#',
          '#########.#',
          '#########F#',
          '###########'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      maMau: bai(['forward(5)', 'turn_right()', 'forward(2)']),
      loiGiai: bai(['retract_spikes()', 'move()', 'turn_right()', 'forward(2)']),
      loiSai: [
        { moTa: 'Đi bộ từng ô: quá 6 nhịp', baiLam: bai(['forward(5)', 'turn_right()', 'forward(2)']), phaiCoMa: ['qua-nhieu-nhip'] },
        { moTa: 'Quên thu gai: move() chỉ bước một ô, rẽ là đâm vách', baiLam: bai(['move()', 'turn_right()', 'forward(2)']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 11, nhip: 4 },
      goiY: [
        'Luna: retract_spikes() rồi move() là lướt tới hết dải, dài ngắn gì cũng một nhịp.',
        'Luna: retract_spikes(), move(), turn_right(), forward(2).'
      ]
    }),

    manLuot(3, 'lam-quen', {
      ten: 'Gai thu tới khi bung',
      hamCuaEmCan: ['move', 'forward', 'turn_right'],
      nhipToiDa: 8,
      deBai: 'Giúp Sola với! Gai đã thu thì thu mãi, tới khi gọi extend_spikes(). Lướt tới chỗ rẽ, rẽ phải. Dải dọc có hố sụt ở cuối: bung gai để bước từng ô, tới ô thứ hai thì rẽ phải vào cờ. Chỉ còn 8 nhịp.',
      veMaMau: 'Sola quên bung gai. Chạy thử: R1 lướt luôn xuống hố.',
      san: [
        [
          '########',
          '#.IIII.#',
          '######I#',
          '#####FI#',
          '######u#',
          '########'
        ],
        [
          '##########',
          '#.IIIIII.#',
          '########I#',
          '#######FI#',
          '########u#',
          '##########'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      maMau: bai(['retract_spikes()', 'move()', 'turn_right()', 'forward(2)', 'turn_right()', 'move()']),
      loiGiai: bai(['retract_spikes()', 'move()', 'extend_spikes()', 'turn_right()', 'forward(2)', 'turn_right()', 'move()']),
      loiSai: [
        { moTa: 'Quên bung gai: R1 lướt xuống hố', baiLam: bai(['retract_spikes()', 'move()', 'turn_right()', 'forward(2)', 'turn_right()', 'move()']), phaiCoMa: ['roi-ho'] },
        { moTa: 'Đi bộ từng ô: quá 8 nhịp', baiLam: bai(['forward(5)', 'turn_right()', 'forward(2)', 'turn_right()', 'move()']), phaiCoMa: ['qua-nhieu-nhip'] }
      ],
      sao: { o: 14, nhip: 6 },
      goiY: [
        'Luna: Lướt xong, extend_spikes() trước khi xuống dải dọc.',
        'Luna: Thêm extend_spikes() ngay sau move() đầu tiên.'
      ]
    }),

    manLuot(4, 'luyen', {
      ten: 'Lướt tới vách đá',
      hamCuaEmCan: ['move', 'forward', 'turn_right'],
      nhipToiDa: 5,
      deBai: 'Giúp Sola với! Dải đá ướt chạy thẳng vào vách. Lướt tới vách thì R1 dừng ở ô đá ướt cuối cùng. Rẽ phải rồi lướt tiếp xuống cờ. Chỉ còn 5 nhịp.',
      veMaMau: 'Sola đi bộ từng ô. Chạy thử: hết nhịp.',
      san: [
        [
          '#######',
          '#.IIII#',
          '#####I#',
          '#####I#',
          '#####F#',
          '#######'
        ],
        [
          '#########',
          '#.IIIIII#',
          '#######I#',
          '#######F#',
          '#########'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      maMau: bai(['forward(4)', 'turn_right()', 'forward(3)']),
      loiGiai: bai(['retract_spikes()', 'move()', 'turn_right()', 'move()']),
      loiSai: [
        { moTa: 'Đi bộ từng ô: quá 5 nhịp', baiLam: bai(['forward(4)', 'turn_right()', 'forward(3)']), phaiCoMa: ['qua-nhieu-nhip'] },
        { moTa: 'Bung gai sau dải đầu: dải dọc chỉ bước được một ô', baiLam: bai(['retract_spikes()', 'move()', 'extend_spikes()', 'turn_right()', 'move()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 9, nhip: 3 },
      goiY: [
        'Luna: Gai thu rồi thì giữ nguyên, rẽ xong không cần thu lại.',
        'Luna: retract_spikes(), move(), turn_right(), move().'
      ]
    }),

    manLuot(5, 'luyen', {
      ten: 'Lướt rồi nghe chuông',
      hamCuaEmCan: ['move', 'forward', 'turn_right'],
      nhipToiDa: 10,
      deBai: 'Giúp Sola với! Lướt tới chỗ rẽ, rẽ phải. Chuông đá treo trên hố sụt ở cuối hầm. Cờ ở bên phải, ngay trước hố. Đo bằng hear() để dừng đúng chỗ. Chỉ còn 10 nhịp.',
      veMaMau: 'Sola đếm bước xuống của hầm 1. Chạy thử: hầm 2 sâu hơn.',
      san: [
        [
          '########',
          '#.IIII.#',
          '######.#',
          '#####F.#',
          '######u#',
          '########'
        ],
        [
          '#######',
          '#.III.#',
          '#####.#',
          '#####.#',
          '#####.#',
          '####F.#',
          '#####u#',
          '#######'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      chuongDa: [[cd(6, 4, 3)], [cd(5, 6, 3)]],
      maMau: bai(['retract_spikes()', 'move()', 'turn_right()', 'forward(2)', 'turn_right()', 'move()']),
      loiGiai: bai(['retract_spikes()', 'move()', 'turn_right()', 'forward(hear() - 1)', 'turn_right()', 'move()']),
      loiSai: [
        { moTa: 'Đếm bước hầm 1: hầm 2 còn xa cờ', baiLam: bai(['retract_spikes()', 'move()', 'turn_right()', 'forward(2)', 'turn_right()', 'move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'forward(hear()): R1 đi tới tận chuông, lăn xuống hố', baiLam: bai(['retract_spikes()', 'move()', 'turn_right()', 'forward(hear())', 'turn_right()', 'move()']), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 13, nhip: 8 },
      goiY: [
        'Luna: Ở chỗ rẽ, hear() là số bước tới chuông. Chỗ rẽ vào cờ gần hơn một bước.',
        'Luna: forward(hear() - 1), rồi turn_right() và move().'
      ]
    }),

    manLuot(6, 'luyen', {
      ten: 'Lướt vào ngách',
      hamCuaEmCan: ['move', 'forward'],
      nhipToiDa: 4,
      deBai: 'Giúp Sola với! Dải đá ướt chạy thẳng vào miệng ngách. Lướt hết dải là chui luôn qua ngách, ra bên kia vẫn nhìn hướng cũ. Bên kia lại là đá ướt dẫn tới cờ. Chỉ còn 4 nhịp.',
      veMaMau: 'Sola đi bộ cả hai dải. Chạy thử: hết nhịp.',
      san: [
        [
          '#######',
          '#.III.#',
          '#######',
          '#.IIIF#',
          '#######'
        ],
        [
          '#########',
          '#.IIIII.#',
          '#########',
          '#.IIF####',
          '#########'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      ngachHang: [[ng(5, 1, 1, 3)], [ng(7, 1, 1, 3)]],
      maMau: bai(['forward(4)', 'forward(4)']),
      loiGiai: bai(['retract_spikes()', 'move()', 'move()']),
      loiSai: [
        { moTa: 'Đi bộ từng ô: quá 4 nhịp', baiLam: bai(['forward(4)', 'forward(4)']), phaiCoMa: ['qua-nhieu-nhip'] },
        { moTa: 'Bung gai sau ngách: dải dưới chỉ bước được một ô', baiLam: bai(['retract_spikes()', 'move()', 'extend_spikes()', 'move()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 6, nhip: 2 },
      goiY: [
        'Luna: Gai thu suốt cả hai dải. Mỗi move() là một lần lướt.',
        'Luna: retract_spikes(), move(), move().'
      ]
    }),

    manLuot(7, 'bien-the', {
      ten: 'Xoắn ốc đá ướt',
      hamCuaEmCan: ['move', 'turn_right'],
      nhipToiDa: 9,
      khung: { chinh: 6, moiHam: 8, cauTruc: ['for', 'while', 'dict'] },
      deBai: 'Giúp Sola với! Hầm cuộn thành xoắn ốc đá ướt, góc nào cũng là vách. Thu gai một lần, rồi lặp: lướt, rẽ phải. Chỉ còn 9 nhịp.',
      veMaMau: 'Sola lặp hai lần. Chạy thử: R1 còn cách cờ một dải.',
      san: [
        [
          '########',
          '#.IIIII#',
          '#F####I#',
          '#I####I#',
          '#IIIIII#',
          '########'
        ],
        [
          '##########',
          '#.IIIIIII#',
          '#F######I#',
          '#I######I#',
          '#I######I#',
          '#IIIIIIII#',
          '##########'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      maMau: bai(['retract_spikes()', 'for i in range(2):', '    move()', '    turn_right()', 'move()']),
      loiGiai: bai(['retract_spikes()', 'for i in range(3):', '    move()', '    turn_right()', 'move()']),
      loiSai: [
        { moTa: 'Lặp hai lần: R1 còn cách cờ một dải', baiLam: bai(['retract_spikes()', 'for i in range(2):', '    move()', '    turn_right()', 'move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên thu gai: move() chỉ bước một ô, rẽ là đâm vách', baiLam: bai(['for i in range(3):', '    move()', '    turn_right()', 'move()']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 10, nhip: 7 },
      goiY: [
        'Luna: Ba lần lướt rồi rẽ phải, thêm một lần lướt cuối.',
        'Luna: for i in range(3): move() rồi turn_right(). Ra ngoài vòng lặp: move().'
      ]
    }),

    manLuot(8, 'bien-the', {
      ten: 'Đá chuông chắn dải',
      hamCuaEmCan: ['move', 'play_note'],
      nhipToiDa: 5,
      deBai: 'Giúp Sola với! Đá chuông nốt 4 chắn giữa dải đá ướt. Lướt tới thì R1 dừng ngay trước đá. Gõ nốt 4 cho đá vỡ, rồi lướt tiếp tới cờ. Chỉ còn 5 nhịp.',
      veMaMau: 'Sola quên gõ đá. Chạy thử xem.',
      san: [
        [
          '##########',
          '#.IIIIIIF#',
          '##########'
        ],
        [
          '############',
          '#.IIIIIIIIF#',
          '############'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      daChuong: [[da(5, 1, 4)], [da(7, 1, 4)]],
      maMau: bai(['retract_spikes()', 'move()', 'move()']),
      loiGiai: bai(['retract_spikes()', 'move()', 'play_note(4)', 'move()']),
      loiSai: [
        { moTa: 'Quên gõ đá: R1 kẹt trước đá chuông', baiLam: bai(['retract_spikes()', 'move()', 'move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Gõ xong lại bung gai: R1 chỉ bước một ô', baiLam: bai(['retract_spikes()', 'move()', 'play_note(4)', 'extend_spikes()', 'move()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 9, nhip: 3 },
      goiY: [
        'Luna: Lướt dừng trước đá. play_note(4) cho đá vỡ.',
        'Luna: retract_spikes(), move(), play_note(4), move().'
      ]
    }),

    manLuot(9, 'bien-the', {
      ten: 'Sổ nốt đá trên dải',
      hamCuaEmCan: ['move', 'play_note'],
      khoaTD: ['dau', 'giua', 'cuoi'],
      duLieuSan: ['notes = {"dau": 3, "cuoi": 6}', 'notes = {"dau": 5, "giua": 2, "cuoi": 7}'],
      nhipToiDa: 9,
      deBai: 'Giúp Sola với! Sổ notes ghi nốt các đá chuông chắn trên dải, theo thứ tự từ đầu tới cuối. Mỗi hầm một sổ. Lướt tới đá nào thì gõ nốt của đá đó. Chỉ còn 9 nhịp.',
      veMaMau: 'Sola chép tay nốt của hầm 1. Chạy thử: hầm 2 có ba đá.',
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
      daChuong: [[da(4, 1, 3), da(7, 1, 6)], [da(3, 1, 5), da(6, 1, 2), da(9, 1, 7)]],
      maMau: bai(['notes = {"dau": 3, "cuoi": 6}', 'retract_spikes()', 'move()', 'play_note(3)', 'move()', 'play_note(6)', 'move()']),
      loiGiai: bai(['notes = {"dau": 3, "cuoi": 6}', 'retract_spikes()', 'for k in notes:', '    move()', '    play_note(notes[k])', 'move()']),
      loiSai: [
        { moTa: 'Chép tay nốt hầm 1: hầm 2 nốt khác, đá không vỡ', baiLam: bai(['notes = {"dau": 3, "cuoi": 6}', 'retract_spikes()', 'move()', 'play_note(3)', 'move()', 'play_note(6)', 'move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên lướt sau vòng lặp: R1 dừng trước cờ', baiLam: bai(['notes = {"dau": 3, "cuoi": 6}', 'retract_spikes()', 'for k in notes:', '    move()', '    play_note(notes[k])']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 11, nhip: 7 },
      goiY: [
        'Luna: for k in notes: lướt tới đá, rồi gõ notes[k].',
        'Luna: Hết vòng lặp, đá đã vỡ hết: move() lướt tới cờ.'
      ]
    }),

    manLuot(10, 'tong-hop', {
      ten: 'Trùm: hầm đá ướt hai tầng',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'play_note'],
      khoaTD: ['dau', 'cuoi'],
      duLieuSan: ['notes = {"dau": 4, "cuoi": 7}', 'notes = {"dau": 2, "cuoi": 5}'],
      nhipToiDa: 14,
      deBai: 'Giúp Sola với! Hai dải đá ướt nối nhau bằng ngách, mỗi dải có một đá chuông chắn, nốt ghi trong sổ notes. Hết dải dưới thì rẽ phải. Cuối hầm là hố có chuông đá, cờ ở bên phải ngay trước hố. Chỉ còn 14 nhịp.',
      veMaMau: 'Sola đếm bước xuống của hầm 1. Chạy thử: hầm 2 sâu hơn.',
      san: [
        [
          '#########',
          '#.IIIII.#',
          '#########',
          '#.IIIII.#',
          '#######.#',
          '######F.#',
          '#######u#',
          '#########'
        ],
        [
          '##########',
          '#.IIIIII.#',
          '##########',
          '#.IIII.###',
          '######.###',
          '######.###',
          '######.###',
          '#####F.###',
          '######u###',
          '##########'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      ngachHang: [[ng(7, 1, 1, 3)], [ng(8, 1, 1, 3)]],
      daChuong: [[da(4, 1, 4), da(3, 3, 7)], [da(6, 1, 2), da(2, 3, 5)]],
      chuongDa: [[cd(7, 6, 1)], [cd(6, 8, 1)]],
      maMau: bai(['notes = {"dau": 4, "cuoi": 7}', 'retract_spikes()', 'for k in notes:', '    move()', '    play_note(notes[k])', 'move()', 'turn_right()', 'forward(2)', 'turn_right()', 'move()']),
      loiGiai: bai(['notes = {"dau": 4, "cuoi": 7}', 'retract_spikes()', 'for k in notes:', '    move()', '    play_note(notes[k])', 'move()', 'turn_right()', 'forward(hear() - 1)', 'turn_right()', 'move()']),
      loiSai: [
        { moTa: 'Đếm bước xuống hầm 1: hầm 2 còn xa cờ', baiLam: bai(['notes = {"dau": 4, "cuoi": 7}', 'retract_spikes()', 'for k in notes:', '    move()', '    play_note(notes[k])', 'move()', 'turn_right()', 'forward(2)', 'turn_right()', 'move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'forward(hear()): R1 đi tới tận chuông, lăn xuống hố', baiLam: bai(['notes = {"dau": 4, "cuoi": 7}', 'retract_spikes()', 'for k in notes:', '    move()', '    play_note(notes[k])', 'move()', 'turn_right()', 'forward(hear())', 'turn_right()', 'move()']), phaiCoMa: ['roi-ho'] },
        { moTa: 'Quên thu gai: R1 đi bộ từng ô, quá 14 nhịp', baiLam: bai(['notes = {"dau": 4, "cuoi": 7}', 'for k in notes:', '    move()', '    play_note(notes[k])', 'move()', 'turn_right()', 'forward(hear() - 1)', 'turn_right()', 'move()']), phaiCoMa: ['qua-nhieu-nhip'] }
      ],
      sao: { o: 19, nhip: 12 },
      goiY: [
        'Luna: Vòng lặp như màn "Sổ nốt đá trên dải": lướt rồi gõ notes[k]. Lần lướt thứ hai chui qua ngách.',
        'Luna: Hết vòng lặp: move(), turn_right(), forward(hear() - 1), rồi rẽ phải vào cờ.'
      ]
    }),

    /* ========================================================================
       CHƯƠNG 2: che-thu-gai — Chế lệnh: lướt rồi bám
       ====================================================================== */
    manCheLuot(1, 'lam-quen', {
      ten: 'Chế lệnh: lướt rồi bám',
      taoHam: ['slide_stop'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'turn_right'],
      deBai: 'Giúp Sola với! Chế hàm slide_stop(): thu gai, lướt tới hết dải, bung gai, bước thêm một ô. Ô đá ướt sau chỗ dừng có hố sụt phía trước, nên phải bám gai. Chương trình chính đã khoá.',
      veMaMau: 'Chương trình chính gọi slide_stop() hai lần. Mở Xưởng hàm, chế slide_stop().',
      san: [
        [
          '##########',
          '#.IIII.Iu#',
          '#######I##',
          '#######I##',
          '#######.##',
          '#######F##',
          '##########'
        ],
        [
          '########',
          '#.II.Iu#',
          '#####I##',
          '#####I##',
          '#####I##',
          '#####.##',
          '#####F##',
          '########'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      maMau: bai(['slide_stop()', 'turn_right()', 'slide_stop()']),
      loiGiai: bai(['slide_stop()', 'turn_right()', 'slide_stop()'], [], [SLIDE_STOP]),
      loiSai: [
        { moTa: 'Chưa chế hàm slide_stop', baiLam: bai(['slide_stop()', 'turn_right()', 'slide_stop()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Thân hàm quên bung gai: bước thêm một ô là lướt xuống hố', baiLam: bai(['slide_stop()', 'turn_right()', 'slide_stop()']), hamCuaEmMoi: [ham('slide_stop', ['retract_spikes()', 'move()', 'move()'])], phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 12, nhip: 5 },
      goiY: [
        'Luna: Thân slide_stop() có bốn dòng: thu gai, lướt, bung gai, bước.',
        'Luna: retract_spikes(), move(), extend_spikes(), move().'
      ]
    }),

    manCheLuot(2, 'lam-quen', {
      ten: 'Bậc thang đá ướt',
      hamCuaEmCan: ['move', 'turn_right', 'turn_left', 'slide_stop'],
      khung: { chinh: 6, moiHam: 8, cauTruc: ['for', 'while', 'if', 'else', 'dict', 'set'] },
      deBai: 'Giúp Sola với! Bậc thang đá ướt đi xuống: lướt, bám một ô, rẽ phải; lướt, bám một ô, rẽ trái; cứ thế. Ô bám nào cũng có hố phía trước. Hai hầm bậc dài ngắn khác nhau.',
      veMaMau: 'Sola xuống một bậc. Chạy thử: R1 còn trên thang.',
      san: [
        [
          '############',
          '#.II.Iu#####',
          '#####I######',
          '#####.######',
          '#####III.Iu#',
          '#####u###I##',
          '#########.##',
          '#########IF#',
          '#########u##',
          '############'
        ],
        [
          '############',
          '#.III.Iu####',
          '######I#####',
          '######I#####',
          '######.#####',
          '######II.Iu#',
          '######u##I##',
          '#########I##',
          '#########.##',
          '#########IF#',
          '#########u##',
          '############'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      maMau: bai(['for i in range(1):', '    slide_stop()', '    turn_right()', '    slide_stop()', '    turn_left()', 'move()']),
      loiGiai: bai(['for i in range(2):', '    slide_stop()', '    turn_right()', '    slide_stop()', '    turn_left()', 'move()']),
      loiSai: [
        { moTa: 'Lặp một lần: R1 mới xuống một bậc', baiLam: bai(['for i in range(1):', '    slide_stop()', '    turn_right()', '    slide_stop()', '    turn_left()', 'move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Rẽ trái trước rồi mới rẽ phải: R1 quay vào vách', baiLam: bai(['for i in range(2):', '    slide_stop()', '    turn_left()', '    slide_stop()', '    turn_right()', 'move()']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 17, nhip: 13 },
      goiY: [
        'Luna: Một bậc là slide_stop(), turn_right(), slide_stop(), turn_left().',
        'Luna: Lặp hai bậc, rồi move() vào cờ.'
      ]
    }),

    manCheLuot(3, 'luyen', {
      ten: 'Chế lệnh: lướt rồi rẽ',
      taoHam: ['glide_step'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'turn_right'],
      deBai: 'Giúp Sola với! Chế hàm glide_step(): thu gai, lướt, bung gai, rẽ phải. Hết xoắn ốc, gai phải đang bung để bước một ô lên đá ướt, phía trước ô đó là hố. Chương trình chính đã khoá.',
      veMaMau: 'Chương trình chính gọi glide_step() ba lần. Mở Xưởng hàm, chế glide_step().',
      san: [
        [
          '########',
          '#.IIIII#',
          '#u####I#',
          '#IF###I#',
          '#IIIIII#',
          '########'
        ],
        [
          '##########',
          '#.IIIIIII#',
          '#u######I#',
          '#I######I#',
          '#IF#####I#',
          '#IIIIIIII#',
          '##########'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      maMau: bai(['for i in range(3):', '    glide_step()', 'move()', 'turn_right()', 'move()']),
      loiGiai: bai(['for i in range(3):', '    glide_step()', 'move()', 'turn_right()', 'move()'], [], [GLIDE_STEP]),
      loiSai: [
        { moTa: 'Chưa chế hàm glide_step', baiLam: bai(['for i in range(3):', '    glide_step()', 'move()', 'turn_right()', 'move()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Thân hàm quên bung gai: hết xoắn ốc R1 lướt xuống hố', baiLam: bai(['for i in range(3):', '    glide_step()', 'move()', 'turn_right()', 'move()']), hamCuaEmMoi: [ham('glide_step', ['retract_spikes()', 'move()', 'turn_right()'])], phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 14, nhip: 9 },
      goiY: [
        'Luna: Giống slide_stop(), nhưng dòng cuối là turn_right() thay cho move().',
        'Luna: retract_spikes(), move(), extend_spikes(), turn_right().'
      ]
    }),

    manCheLuot(4, 'luyen', {
      ten: 'Lướt tới khi nghe chuông',
      hamCuaEmCan: ['glide_step', 'go_echo'],
      deBai: 'Giúp Sola với! Xoắn ốc đá ướt, cờ treo chuông đá. Chuông ngân nhỏ, chỉ nghe được ở góc cuối. Chưa nghe thì còn lướt rồi rẽ; nghe được rồi thì đi tới chuông. Hai hầm số góc khác nhau.',
      veMaMau: 'Sola đếm góc của hầm 1. Chạy thử: hầm 2 ít góc hơn.',
      san: [
        [
          '##########',
          '#.IIIIIII#',
          '########I#',
          '###F####I#',
          '###.####I#',
          '###IIIIII#',
          '##########'
        ],
        [
          '########',
          '#.IIIII#',
          '######I#',
          '######I#',
          '######I#',
          '###F..I#',
          '########'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      chuongDa: [[cd(3, 3, 5, 2)], [cd(3, 5, 5, 3)]],
      maMau: bai(['for i in range(3):', '    glide_step()', 'go_echo()']),
      loiGiai: bai(['while hear() == 0:', '    glide_step()', 'go_echo()']),
      loiSai: [
        { moTa: 'Đếm góc hầm 1: hầm 2 lướt thừa một lần', baiLam: bai(['for i in range(3):', '    glide_step()', 'go_echo()']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Lặp hai lần: hầm 1 chưa nghe được chuông', baiLam: bai(['for i in range(2):', '    glide_step()', 'go_echo()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 15, nhip: 8 },
      goiY: [
        'Luna: Giống wait_echo(), nhưng mỗi vòng là glide_step() thay cho move().',
        'Luna: while hear() == 0: glide_step(). Ra ngoài vòng lặp: go_echo().'
      ]
    }),

    manCheLuot(5, 'luyen', {
      ten: 'Chế lệnh: lướt qua ngách',
      taoHam: ['glide_tunnel'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'turn_right'],
      deBai: 'Giúp Sola với! Chế hàm glide_tunnel(): thu gai, lướt vào ngách, bung gai, bước một ô ra khỏi miệng ngách. Ô đầu tầng cuối có hố phía trước. Chương trình chính đã khoá.',
      veMaMau: 'Chương trình chính gọi glide_tunnel() hai lần. Mở Xưởng hàm, chế glide_tunnel().',
      san: [
        [
          '########',
          '#.IIII.#',
          '########',
          '#.III.##',
          '########',
          '#.Iu####',
          '##F#####',
          '########'
        ],
        [
          '#########',
          '#.II.####',
          '#########',
          '#.IIIII.#',
          '#########',
          '#.Iu#####',
          '##F######',
          '#########'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      ngachHang: [[ng(6, 1, 1, 3), ng(5, 3, 1, 5)], [ng(4, 1, 1, 3), ng(7, 3, 1, 5)]],
      maMau: bai(['for i in range(2):', '    glide_tunnel()', 'turn_right()', 'move()']),
      loiGiai: bai(['for i in range(2):', '    glide_tunnel()', 'turn_right()', 'move()'], [], [GLIDE_TUNNEL]),
      loiSai: [
        { moTa: 'Chưa chế hàm glide_tunnel', baiLam: bai(['for i in range(2):', '    glide_tunnel()', 'turn_right()', 'move()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Thân hàm quên bung gai: bước ra khỏi ngách là lướt xuống hố', baiLam: bai(['for i in range(2):', '    glide_tunnel()', 'turn_right()', 'move()']), hamCuaEmMoi: [ham('glide_tunnel', ['retract_spikes()', 'move()', 'move()'])], phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 13, nhip: 6 },
      goiY: [
        'Luna: Thân giống hệt slide_stop(), chỉ khác tên: lần này cuối dải là miệng ngách.',
        'Luna: retract_spikes(), move(), extend_spikes(), move().'
      ]
    }),

    manCheLuot(6, 'luyen', {
      ten: 'Chế lệnh: nghe rồi lướt',
      taoHam: ['echo_glide'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'glide_step'],
      deBai: 'Giúp Sola với! Chuông đá nhỏ treo trong hốc, sát chỗ bắt đầu mỗi dải đá ướt, chỉ nghe được khi đứng cạnh. Chế hàm echo_glide(): nghe thấy chuông thì glide_step(), không thì bước một ô. Chương trình chính đã khoá.',
      veMaMau: 'Chương trình chính gọi echo_glide() bốn lần. Mở Xưởng hàm, chế echo_glide().',
      san: [
        [
          '#########',
          '##.######',
          '#..IIII##',
          '######..#',
          '######I##',
          '#####FI##',
          '#########'
        ],
        [
          '########',
          '#.######',
          '#.IIII##',
          '####..##',
          '#####I##',
          '###F.I##',
          '########'
        ]
      ],
      batDau: hai({ x: 1, y: 2, huong: 1 }),
      chuongDa: [[cd(2, 1, 3, 1), cd(7, 3, 6, 1)], [cd(1, 1, 3, 1), cd(4, 3, 6, 1)]],
      maMau: bai(['for i in range(4):', '    echo_glide()', 'move()']),
      loiGiai: bai(['for i in range(4):', '    echo_glide()', 'move()'], [], [ECHO_GLIDE]),
      loiSai: [
        { moTa: 'Chưa chế hàm echo_glide', baiLam: bai(['for i in range(4):', '    echo_glide()', 'move()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Thân hàm luôn glide_step(): chỗ không có dải đá ướt R1 rẽ vào vách', baiLam: bai(['for i in range(4):', '    echo_glide()', 'move()']), hamCuaEmMoi: [ham('echo_glide', ['glide_step()'])], phaiCoMa: ['dam-tuong'] },
        { moTa: 'Đảo hai nhánh: nghe thấy chuông lại chỉ bước một ô', baiLam: bai(['for i in range(4):', '    echo_glide()', 'move()']), hamCuaEmMoi: [ham('echo_glide', ['if hear() > 0:', '    move()', 'else:', '    glide_step()'])], phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 16, nhip: 7 },
      goiY: [
        'Luna: if hear() > 0: glide_step(). else: move().',
        'Luna: Bốn dòng: if hear() > 0:, thụt vào glide_step(), else:, thụt vào move().'
      ]
    }),

    manCheLuot(7, 'bien-the', {
      ten: 'Sửa hàm lướt rồi rẽ',
      suaHam: ['glide_step'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'turn_right', 'glide_step', 'go_echo'],
      deBai: 'Giúp Sola với! Ai đó sửa glide_step() thành rẽ trái, nhưng hầm này vòng sang phải. Sửa lại hàm. Cờ treo chuông đá. Chương trình chính đã khoá.',
      veMaMau: 'Mở glide_step() trong Xưởng hàm. Chạy thử: R1 quay vào vách.',
      san: [
        [
          '#########',
          '#.IIIIII#',
          '#######I#',
          '#######I#',
          '#F.....I#',
          '#########'
        ],
        [
          '#######',
          '#.IIII#',
          '#####I#',
          '#####I#',
          '#####I#',
          '#####I#',
          '#F...I#',
          '#######'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      chuongDa: [[cd(1, 4, 2)], [cd(1, 6, 2)]],
      maMau: bai(['for i in range(2):', '    glide_step()', 'go_echo()'], [], [ham('glide_step', ['retract_spikes()', 'move()', 'extend_spikes()', 'turn_left()'])]),
      loiGiai: bai(['for i in range(2):', '    glide_step()', 'go_echo()'], [], [GLIDE_STEP]),
      loiSai: [
        { moTa: 'Không sửa: R1 rẽ trái vào vách', baiLam: bai(['for i in range(2):', '    glide_step()', 'go_echo()']), hamCuaEmMoi: [ham('glide_step', ['retract_spikes()', 'move()', 'extend_spikes()', 'turn_left()'])], phaiCoMa: ['dam-tuong'] },
        { moTa: 'Xoá dòng rẽ: R1 lướt xong vẫn nhìn vào vách', baiLam: bai(['for i in range(2):', '    glide_step()', 'go_echo()']), hamCuaEmMoi: [ham('glide_step', ['retract_spikes()', 'move()', 'extend_spikes()'])], phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 15, nhip: 10 },
      goiY: [
        'Luna: Hầm vòng sang phải của R1.',
        'Luna: Đổi turn_left() thành turn_right().'
      ]
    }),

    manCheLuot(8, 'bien-the', {
      ten: 'Sổ đá chắn các tầng',
      hamCuaEmCan: ['move', 'turn_right', 'play_note', 'glide_tunnel'],
      khoaTD: ['dau', 'giua', 'cuoi'],
      duLieuSan: ['notes = {"dau": 6, "giua": 2}', 'notes = {"dau": 1, "giua": 8, "cuoi": 4}'],
      deBai: 'Giúp Sola với! Mỗi tầng đá ướt có một đá chuông chắn trước miệng ngách. Sổ notes ghi nốt đá từng tầng, từ trên xuống. Gõ cho đá vỡ rồi lướt qua ngách. Tầng cuối có hố phía trước, cờ ở bên phải.',
      veMaMau: 'Sola chép tay nốt hầm 1. Chạy thử: hầm 2 có ba tầng.',
      san: [T8A.san, T8B.san],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      ngachHang: [T8A.ngachHang, T8B.ngachHang],
      daChuong: [voiDa(T8A, [6, 2]), voiDa(T8B, [1, 8, 4])],
      maMau: bai(['notes = {"dau": 6, "giua": 2}', 'play_note(6)', 'glide_tunnel()', 'play_note(2)', 'glide_tunnel()', 'turn_right()', 'move()']),
      loiGiai: bai(['notes = {"dau": 6, "giua": 2}', 'for k in notes:', '    play_note(notes[k])', '    glide_tunnel()', 'turn_right()', 'move()']),
      loiSai: [
        { moTa: 'Chép tay nốt hầm 1: hầm 2 đá không vỡ', baiLam: bai(['notes = {"dau": 6, "giua": 2}', 'play_note(6)', 'glide_tunnel()', 'play_note(2)', 'glide_tunnel()', 'turn_right()', 'move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Lướt trước rồi mới gõ: R1 kẹt trước đá', baiLam: bai(['notes = {"dau": 6, "giua": 2}', 'for k in notes:', '    glide_tunnel()', '    play_note(notes[k])', 'turn_right()', 'move()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 17, nhip: 11 },
      goiY: [
        'Luna: for k in notes: gõ notes[k], rồi glide_tunnel().',
        'Luna: Ra ngoài vòng lặp: turn_right(), move().'
      ]
    }),

    manCheLuot(9, 'bien-the', {
      ten: 'Không gõ trùng khi lướt',
      hamCuaEmCan: ['move', 'turn_right', 'ring_once', 'glide_tunnel'],
      khoaTD: ['dau', 'giua', 'cuoi'],
      duLieuSan: ['notes = {"dau": 5, "giua": 3, "cuoi": 3}', 'notes = {"dau": 2, "giua": 6, "cuoi": 6}'],
      nhipToiDa: 10,
      deBai: 'Giúp Sola với! Nước ngầm dâng, chỉ còn 10 nhịp. Đá tầng dưới cách R1 đúng 3 ô nên cũng nghe được tiếng gõ: hai tầng liền nhau cùng nốt thì một lần gõ vỡ cả hai. Dùng túi s để không gõ trùng.',
      veMaMau: 'Sola gõ mọi tầng. Chạy thử: hết nhịp.',
      san: [T9A.san, T9B.san],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      ngachHang: [T9A.ngachHang, T9B.ngachHang],
      daChuong: [voiDa(T9A, [5, 3, 3]), voiDa(T9B, [2, 6, 6])],
      maMau: bai(['notes = {"dau": 5, "giua": 3, "cuoi": 3}', 'for k in notes:', '    play_note(notes[k])', '    glide_tunnel()', 'turn_right()', 'move()']),
      loiGiai: bai(['notes = {"dau": 5, "giua": 3, "cuoi": 3}', 's = set()', 'for k in notes:', '    ring_once(notes[k], s)', '    glide_tunnel()', 'turn_right()', 'move()']),
      loiSai: [
        { moTa: 'Gõ mọi tầng: quá 10 nhịp', baiLam: bai(['notes = {"dau": 5, "giua": 3, "cuoi": 3}', 'for k in notes:', '    play_note(notes[k])', '    glide_tunnel()', 'turn_right()', 'move()']), phaiCoMa: ['qua-nhieu-nhip'] },
        { moTa: 'Quên s = set(): chưa có túi s nên chương trình dừng', baiLam: bai(['notes = {"dau": 5, "giua": 3, "cuoi": 3}', 'for k in notes:', '    ring_once(notes[k], s)', '    glide_tunnel()', 'turn_right()', 'move()']), phaiCoMa: ['loi-chay'] }
      ],
      sao: { o: 21, nhip: 10 },
      goiY: [
        'Luna: s = set() ngay sau sổ. ring_once(n, s) chỉ gõ nốt chưa có trong túi.',
        'Luna: Trong vòng lặp: ring_once(notes[k], s) rồi glide_tunnel().'
      ]
    }),

    manCheLuot(10, 'tong-hop', {
      ten: 'Trùm: hầm đá ướt ngân chuông',
      hamCuaEmCan: ['move', 'play_note', 'glide_step', 'glide_tunnel', 'go_echo'],
      khoaTD: ['dau', 'giua', 'cuoi'],
      duLieuSan: ['notes = {"dau": 4, "giua": 6}', 'notes = {"dau": 2, "giua": 5, "cuoi": 8}'],
      deBai: 'Giúp Sola với! Lướt qua các tầng đá ướt theo sổ notes như màn trước. Ra khỏi tầng cuối là xoắn ốc đá ướt, cờ treo chuông đá chỉ nghe được ở góc cuối.',
      veMaMau: 'Sola đếm góc xoắn ốc của hầm 1. Chạy thử: hầm 2 nhiều góc hơn.',
      san: [T10A.san, T10B.san],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      ngachHang: [T10A.ngachHang, T10B.ngachHang],
      daChuong: [voiDa(T10A, [4, 6]), voiDa(T10B, [2, 5, 8])],
      chuongDa: [[cd(5, 8, 1, 2)], [cd(3, 10, 1, 2)]],
      maMau: bai(['notes = {"dau": 4, "giua": 6}', 'for k in notes:', '    play_note(notes[k])', '    glide_tunnel()', 'for i in range(2):', '    glide_step()', 'go_echo()']),
      loiGiai: bai(['notes = {"dau": 4, "giua": 6}', 'for k in notes:', '    play_note(notes[k])', '    glide_tunnel()', 'while hear() == 0:', '    glide_step()', 'go_echo()']),
      loiSai: [
        { moTa: 'Đếm góc hầm 1: hầm 2 còn một góc chưa lướt', baiLam: bai(['notes = {"dau": 4, "giua": 6}', 'for k in notes:', '    play_note(notes[k])', '    glide_tunnel()', 'for i in range(2):', '    glide_step()', 'go_echo()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Theo chuông trước khi qua các tầng: R1 kẹt trước đá', baiLam: bai(['notes = {"dau": 4, "giua": 6}', 'while hear() == 0:', '    glide_step()', 'go_echo()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 25, nhip: 17 },
      goiY: [
        'Luna: Qua các tầng như màn "Sổ đá chắn các tầng".',
        'Luna: Rồi while hear() == 0: glide_step(), và go_echo().'
      ]
    })
  ];

  if (M && M.them) M.manThuGai = DS;
  if (typeof module !== 'undefined' && module.exports) module.exports = M;
})();
