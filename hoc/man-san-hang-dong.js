/* ============================================================================
   man-san-hang-dong.js — Mùa 8 Hang động · Gói 4: Ngách hang (viết lại 16/11, KE-HOACH-MUA-8.md)
   Chương 1: san-hang-dong "Chui ngách ngầm" (10 màn): ngachHang [{a, b}]: bước vào miệng a là chui ra miệng b cùng màu (và ngược lại),
             giữ hướng cũ; bước vào miệng tính một bước. Đá chuông sau ngách, chuông đá sau ngách (hear() đo đường chim bay, không theo ngách),
             tầng ngách (wait_echo), sổ nốt theo sân.
   Chương 2: che-hang-dong "Chế lệnh: vượt ngách" (10 màn): dive(n), echo_exit(), dive_once(n, s), dive_all(book).
   Lời: "Giúp Sola với!", gợi ý của Luna, gọi người chơi là "bạn".
   ========================================================================== */
(function () {
  'use strict';

  var M = (typeof window !== 'undefined' && window.ManHoc) ||
    (typeof require === 'function' ? require('./man-chuoi-1.js') : null);

  var GOC_HANG = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'note', 'beat', 'hear'];
  var ROBOT_HANG = { than: 'gai', tay: 'loa', camBien: [{ ma: 'am-thanh', o: 'tren' }] };

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

  /** Tầng ngách: n tầng, mỗi tầng một hàng y = 1, 3, …: miệng ra b ở (1, y) (tầng đầu là chỗ xuất phát), đá chuông ở (2, y) nếu coDa,
   *  ô (3, y), miệng vào a ở (4, y) chui xuống (1, y + 2) (ngách cuối ra ở (bCuoi, y + 2) nếu có). Hàng cuối y = 2n + 1 do `duoi` vẽ (mảng hàng, hàng đầu là hàng của miệng ra cuối).
   *  Trả về { san, ngachHang, daChuong }. */
  function tang(n, coDa, duoi, rong, bCuoi) {
    rong = rong || 6;
    var tuong = new Array(rong + 1).join('#');
    var san = [tuong], ngach = [], daCh = [];
    for (var i = 0; i < n; i++) {
      var y = 2 * i + 1;
      san.push(('#' + (coDa ? '.' : '.') + (coDa ? '.' : 'I') + 'I.' + tuong).slice(0, rong - 1) + '#');
      san.push(tuong);
      ngach.push(ng(4, y, i === n - 1 && bCuoi ? bCuoi : 1, y + 2));
      if (coDa) daCh.push({ x: 2, y: y });
    }
    duoi.forEach(function (h) { san.push(h); });
    san.push(tuong);
    return { san: san, ngachHang: ngach, daChuong: daCh };
  }

  function manHangDong(so, hang, ds) {
    return Object.assign({
      chuong: 'san-hang-dong', so: so, hang: hang,
      vo: 'hang', loaiRobot: 'gai',
      robot: ROBOT_HANG,
      hamGoc: GOC_HANG.slice(),
      hamCuaEmCan: [],
      taoHam: [],
      cauTruc: ['for', 'while', 'dict'],
      khung: { chinh: 10, moiHam: 8, cauTruc: ['for', 'while', 'dict'] },
      mucTieu: 'toi-co'
    }, ds);
  }

  function manCheHangDong(so, hang, ds) {
    return Object.assign({
      chuong: 'che-hang-dong', so: so, hang: hang,
      vo: 'hang', loaiRobot: 'gai',
      robot: ROBOT_HANG,
      hamGoc: GOC_HANG.slice(),
      hamCuaEmCan: [],
      taoHam: [],
      cauTruc: ['for', 'while', 'if', 'dict', 'set'],
      khung: { chinh: 10, moiHam: 8, cauTruc: ['for', 'while', 'if', 'dict', 'set'] },
      mucTieu: 'toi-co'
    }, ds);
  }

  function voiDa(t, nots) { return t.daChuong.map(function (d, i) { return da(d.x, d.y, nots[i]); }); }

  var T7A = tang(2, false, ['#####.IF#'], 9, 5), T7B = tang(3, false, ['#####.IF#'], 9, 5);
  var T9A = tang(3, true, ['#.IF##']), T9B = tang(2, true, ['#.IF##']);
  var T10A = tang(3, true, ['#.IIIII#', '#####I##', '#####F##'], 8), T10B = tang(2, true, ['#.IIIII#', '###I####', '###F####'], 8);

  var C1 = tang(2, true, ['#.IIF#']);
  var C2A = tang(2, true, ['#.IIF#']), C2B = tang(3, true, ['#.IIF#']);
  var C4A = tang(3, true, ['#.IIIII#', '######I#', '######F#'], 8), C4B = tang(2, true, ['#.IIIII#', '####I###', '####F###'], 8);
  var C5A = tang(3, true, ['#.IF##']), C5B = tang(2, true, ['#.IF##']);
  var C6A = tang(2, true, ['#.IIF#']), C6B = tang(3, true, ['#.IIF#']);
  var C7A = tang(2, true, ['#.IIIII#', '###I####', '###F####'], 8), C7B = tang(2, true, ['#.IIIII#', '######I#', '######F#'], 8);
  var C8A = tang(3, true, ['#.IIIII#', '####I###', '####F###'], 8), C8B = tang(2, true, ['#.IIIII#', '######I#', '######F#'], 8);
  var C9A = tang(2, true, ['#.III.##', '#####I##', '#####I##', '###FI.##'], 8), C9B = tang(3, true, ['#.IIII.#', '######I#', '######I#', '####FI.#'], 8);
  var C10A = tang(3, true, ['#.IIIII#', '#####I##', '#####I##', '###FI.##'], 8), C10B = tang(2, true, ['#.IIIII#', '###I####', '###I####', '#FI.####'], 8);

  var DIVE = ham('dive', ['play_note(n)', 'forward(3)'], ['n']);
  var ECHO_EXIT = ham('echo_exit', ['wait_echo()', 'turn_right()', 'go_echo()']);
  var DIVE_ONCE = ham('dive_once', ['ring_once(n, s)', 'forward(3)'], ['n', 's']);
  var DIVE_ALL = ham('dive_all', ['for k in book:', '    dive(book[k])'], ['book']);

  var DS = [
    /* ========================================================================
       CHƯƠNG 1: san-hang-dong — Chui ngách ngầm
       ====================================================================== */
    manHangDong(1, 'lam-quen', {
      ten: 'Chui qua ngách',
      chiChay: true, chinhCoDinh: true,
      hamCuaEmCan: ['forward'],
      deBai: 'Sola làm mẫu. Vách đá chắn ngang, nhưng có ngách ngầm. Bước vào miệng ngách là chui ra miệng cùng màu bên kia, vẫn nhìn hướng cũ. Bước vào miệng tính một bước. Bấm Chạy để xem.',
      veMaMau: 'Chương trình Sola viết sẵn và đã khoá: 3 bước tới miệng ngách, 3 bước từ miệng ra tới cờ.',
      san: [
        '#######',
        '#.II.##',
        '#######',
        '##.IIF#',
        '#######'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      ngachHang: [ng(4, 1, 2, 3)],
      maMau: bai(['forward(6)']),
      loiGiai: bai(['forward(6)']),
      sao: { o: 6, nhip: 6 },
      goiY: [
        'Luna: Miệng ngách cùng màu là hai đầu của một đường ngầm.',
        'Luna: Chui qua ngách không tốn thêm nhịp.'
      ]
    }),

    manHangDong(2, 'lam-quen', {
      ten: 'Đếm cả bước vào ngách',
      hamCuaEmCan: ['forward', 'turn_right'],
      deBai: 'Giúp Sola với! Ra khỏi ngách, R1 đi tiếp tới chỗ rẽ rồi rẽ phải xuống cờ. Qua chỗ rẽ là hố sụt.',
      veMaMau: 'Sola chỉ đếm tới miệng ngách. Chạy thử: R1 rẽ ngay ở miệng ra.',
      san: [
        '########',
        '#.III.##',
        '########',
        '##.I.u##',
        '####I###',
        '####F###',
        '########'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      ngachHang: [ng(5, 1, 2, 3)],
      maMau: bai(['forward(4)', 'turn_right()', 'forward(2)']),
      loiGiai: bai(['forward(6)', 'turn_right()', 'forward(2)']),
      loiSai: [
        { moTa: 'Chỉ đếm tới miệng ngách: R1 rẽ ngay ở miệng ra, đâm vách', baiLam: bai(['forward(4)', 'turn_right()', 'forward(2)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Đếm thêm một bước để chui ra: R1 đi quá chỗ rẽ, lăn xuống hố', baiLam: bai(['forward(7)', 'turn_right()', 'forward(2)']), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 10, nhip: 9 },
      goiY: [
        'Luna: 4 bước tới miệng ngách. Ra khỏi ngách còn 2 bước tới chỗ rẽ.',
        'Luna: forward(6) rồi turn_right().'
      ]
    }),

    manHangDong(3, 'lam-quen', {
      ten: 'Ra ngách vẫn nhìn hướng cũ',
      hamCuaEmCan: ['move', 'forward', 'turn_left'],
      deBai: 'Giúp Sola với! R1 chui ngách khi đang đi xuống, nên ra khỏi ngách vẫn đi xuống. Tới chỗ rẽ thì rẽ trái sang cờ.',
      veMaMau: 'Sola tưởng ra ngách thì quay ngược. Chạy thử xem.',
      san: [
        '#######',
        '#.#.###',
        '#I#I###',
        '#.#.F##',
        '###u###',
        '#######'
      ],
      batDau: { x: 1, y: 1, huong: 2 },
      ngachHang: [ng(1, 3, 3, 1)],
      maMau: bai(['forward(4)', 'turn_right()', 'move()']),
      loiGiai: bai(['forward(4)', 'turn_left()', 'move()']),
      loiSai: [
        { moTa: 'Rẽ phải: R1 quay ra vách', baiLam: bai(['forward(4)', 'turn_right()', 'move()']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'forward(5): R1 đi quá chỗ rẽ, lăn xuống hố', baiLam: bai(['forward(5)', 'turn_left()', 'move()']), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 10, nhip: 6 },
      goiY: [
        'Luna: Ra khỏi ngách, R1 vẫn nhìn xuống. Cờ ở bên tay trái của R1.',
        'Luna: turn_left() rồi move().'
      ]
    }),

    manHangDong(4, 'luyen', {
      ten: 'Hai ngách nối nhau',
      hamCuaEmCan: ['forward', 'turn_right'],
      deBai: 'Giúp Sola với! Hai cặp ngách hai màu. Chui ngách thứ nhất, đi tới chỗ rẽ, rẽ phải, rồi chui ngách thứ hai xuống cờ.',
      veMaMau: 'Sola rẽ ngay ở miệng ra. Chạy thử xem.',
      san: [
        '#########',
        '#.I.#..u#',
        '######I##',
        '######.##',
        '##.######',
        '##I######',
        '##F######',
        '#########'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      ngachHang: [ng(3, 1, 5, 1), ng(6, 3, 2, 4)],
      maMau: bai(['forward(2)', 'turn_right()', 'forward(4)']),
      loiGiai: bai(['forward(3)', 'turn_right()', 'forward(4)']),
      loiSai: [
        { moTa: 'Rẽ ngay ở miệng ra: R1 đâm vách', baiLam: bai(['forward(2)', 'turn_right()', 'forward(4)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'forward(4): R1 đi quá chỗ rẽ, lăn xuống hố', baiLam: bai(['forward(4)', 'turn_right()', 'forward(4)']), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 10, nhip: 8 },
      goiY: [
        'Luna: Ngách vàng: 2 bước vào, 1 bước ra tới chỗ rẽ.',
        'Luna: Sau khi rẽ: 2 bước vào ngách thứ hai, 2 bước ra tới cờ.'
      ]
    }),

    manHangDong(5, 'luyen', {
      ten: 'Đá chuông bên kia ngách',
      hamCuaEmCan: ['forward', 'play_note'],
      deBai: 'Giúp Sola với! Đá chuông nốt 5 chắn lối ra ngách. Từ chỗ xuất phát, tiếng loa không vượt vách tới đá. Chui qua ngách rồi mới gõ.',
      veMaMau: 'Sola gõ ngay từ đầu. Chạy thử: đá vẫn nguyên.',
      san: [
        '########',
        '#.I.####',
        '########',
        '##.I.IF#',
        '########'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      ngachHang: [ng(3, 1, 2, 3)],
      daChuong: [da(4, 3, 5)],
      maMau: bai(['play_note(5)', 'forward(6)']),
      loiGiai: bai(['forward(2)', 'play_note(5)', 'forward(4)']),
      loiSai: [
        { moTa: 'Gõ từ chỗ xuất phát: đá ở bên kia vách, quá 3 ô nên không nghe', baiLam: bai(['play_note(5)', 'forward(6)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Quên gõ: R1 đâm vào đá chuông', baiLam: bai(['forward(6)']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 10, nhip: 7 },
      goiY: [
        'Luna: forward(2) đưa R1 chui ra miệng bên dưới, mũi nhìn thẳng vào đá.',
        'Luna: play_note(5) rồi forward(4).'
      ]
    }),

    manHangDong(6, 'luyen', {
      ten: 'Nghe chuông sau ngách',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'go_echo'],
      deBai: 'Giúp Sola với! Chuông đá ở chỗ rẽ sau ngách. hear() đo đường chim bay xuyên vách, không đi theo ngách. Chui qua ngách rồi mới nghe. Qua chỗ rẽ là hố sụt.',
      veMaMau: 'Sola nghe ngay từ đầu. Chạy thử: số đo xuyên vách ngắn hơn đường đi.',
      san: [
        [
          '#######',
          '#.III.#',
          '#######',
          '#.I.u##',
          '###F###',
          '#######'
        ],
        [
          '#########',
          '#.III.###',
          '#########',
          '#.IIII.u#',
          '######F##',
          '#########'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      ngachHang: hai([ng(5, 1, 1, 3)]),
      chuongDa: [[cd(3, 3, 6)], [cd(6, 3, 6)]],
      maMau: bai(['go_echo()', 'turn_right()', 'move()']),
      loiGiai: bai(['forward(4)', 'go_echo()', 'turn_right()', 'move()']),
      loiSai: [
        { moTa: 'Nghe từ chỗ xuất phát: số đo xuyên vách, R1 dừng ngay miệng ra', baiLam: bai(['go_echo()', 'turn_right()', 'move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Viết forward(5) sau ngách: hầm 1 chỉ 2 ô, R1 lăn xuống hố', baiLam: bai(['forward(4)', 'forward(5)', 'turn_right()', 'move()']), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 12, nhip: 11 },
      goiY: [
        'Luna: forward(4) đưa R1 chui ra miệng bên dưới. Từ đó hear() mới đúng đường.',
        'Luna: forward(4), go_echo(), turn_right(), move().'
      ]
    }),

    manHangDong(7, 'luyen', {
      ten: 'Tầng ngách xuống sâu',
      hamCuaEmCan: ['wait_echo', 'go_echo'],
      deBai: 'Giúp Sola với! Mỗi tầng hang có một ngách chui xuống tầng dưới. Chuông đá ở tầng cuối ngân khẽ, chỉ nghe được khi đã xuống tới tầng đó. Hầm 1 ba tầng, hầm 2 bốn tầng.',
      veMaMau: 'Sola đếm tầng hầm 1. Chạy thử: sang hầm 2 R1 dừng sớm một tầng.',
      san: [T7A.san, T7B.san],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      ngachHang: [T7A.ngachHang, T7B.ngachHang],
      chuongDa: [[cd(7, 5, 3, 2)], [cd(7, 7, 3, 2)]],
      maMau: bai(['forward(6)', 'go_echo()']),
      loiGiai: bai(['wait_echo()', 'go_echo()']),
      loiSai: [
        { moTa: 'Đếm bước hầm 1: hầm 2 còn một tầng nữa, R1 chưa nghe chuông nên dừng', baiLam: bai(['forward(6)', 'go_echo()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Chỉ go_echo(): lúc đầu chưa nghe gì nên R1 không đi', baiLam: bai(['go_echo()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 10, nhip: 11 },
      goiY: [
        'Luna: wait_echo() đi từng bước, kể cả chui ngách, tới khi nghe thấy chuông.',
        'Luna: Nghe thấy rồi thì go_echo().'
      ]
    }),

    manHangDong(8, 'bien-the', {
      ten: 'Đo sau khi chui',
      hamCuaEmCan: ['forward', 'crack_rim'],
      deBai: 'Giúp Sola với! Đá chuông nốt 6 chắn chỗ rẽ sau ngách, qua chỗ rẽ là hố sụt. hear() đo đường chim bay, nên chui qua ngách rồi mới đo.',
      veMaMau: 'Sola đo ngay từ đầu. Chạy thử: số đo xuyên vách, tiếng loa không tới đá.',
      san: [
        [
          '#######',
          '#.II.##',
          '#######',
          '#.II.u#',
          '####I##',
          '####F##',
          '#######'
        ],
        [
          '#########',
          '#.II.####',
          '#########',
          '#.IIII.u#',
          '######I##',
          '######F##',
          '#########'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      ngachHang: hai([ng(4, 1, 1, 3)]),
      daChuong: [[da(4, 3, 6)], [da(6, 3, 6)]],
      maMau: bai(['crack_rim(6)', 'forward(2)']),
      loiGiai: bai(['forward(3)', 'crack_rim(6)', 'forward(2)']),
      loiSai: [
        { moTa: 'Đo và gõ từ chỗ xuất phát: đá ở bên kia vách nên không vỡ', baiLam: bai(['crack_rim(6)', 'forward(2)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Chép tay số đo hầm 1: hầm 2 đá xa hơn, R1 rẽ sớm', baiLam: bai(['forward(3)', 'play_note(6)', 'rim(3)', 'forward(2)']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 17, nhip: 12 },
      goiY: [
        'Luna: forward(3) đưa R1 chui ra miệng bên dưới, mũi nhìn vào đá.',
        'Luna: Rồi crack_rim(6) và forward(2).'
      ]
    }),

    manHangDong(9, 'bien-the', {
      ten: 'Tầng đá theo sổ',
      hamCuaEmCan: ['forward', 'play_note'],
      khoaTD: ['dau', 'giua', 'cuoi'],
      duLieuSan: ['notes = {"dau": 4, "giua": 7, "cuoi": 2}', 'notes = {"dau": 5, "giua": 3}'],
      deBai: 'Giúp Sola với! Mỗi tầng có một khối đá chuông chắn ngay trước mũi R1, nốt ghi trong sổ notes. Gõ đúng nốt, đi 3 bước là chui xuống tầng dưới. Hầm 1 ba tầng đá, hầm 2 hai tầng.',
      veMaMau: 'Sola chép tay nốt hầm 1. Chạy thử: sang hầm 2 sổ khác.',
      san: [T9A.san, T9B.san],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      ngachHang: [T9A.ngachHang, T9B.ngachHang],
      daChuong: [voiDa(T9A, [4, 7, 2]), voiDa(T9B, [5, 3])],
      maMau: bai(['notes = {"dau": 4, "giua": 7, "cuoi": 2}', 'play_note(4)', 'forward(3)', 'play_note(7)', 'forward(3)', 'play_note(2)', 'forward(3)', 'forward(2)']),
      loiGiai: bai(['notes = {"dau": 4, "giua": 7, "cuoi": 2}', 'for k in notes:', '    play_note(notes[k])', '    forward(3)', 'forward(2)']),
      loiSai: [
        { moTa: 'Chép tay nốt hầm 1: đá đầu hầm 2 nốt 5, không vỡ', baiLam: bai(['notes = {"dau": 4, "giua": 7, "cuoi": 2}', 'play_note(4)', 'forward(3)', 'play_note(7)', 'forward(3)', 'play_note(2)', 'forward(3)', 'forward(2)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Quên gõ trong vòng lặp: R1 đâm đá ngay tầng đầu', baiLam: bai(['notes = {"dau": 4, "giua": 7, "cuoi": 2}', 'for k in notes:', '    forward(3)', 'forward(2)']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 12, nhip: 14 },
      goiY: [
        'Luna: for k in notes: mỗi khoá là một tầng.',
        'Luna: Trong vòng lặp: play_note(notes[k]) rồi forward(3).'
      ]
    }),

    manHangDong(10, 'tong-hop', {
      ten: 'Trùm: đáy hang ngầm',
      hamCuaEmCan: ['forward', 'turn_right', 'play_note', 'wait_echo', 'go_echo'],
      khoaTD: ['dau', 'giua', 'cuoi'],
      duLieuSan: ['notes = {"dau": 6, "giua": 1, "cuoi": 8}', 'notes = {"dau": 2, "giua": 5}'],
      deBai: 'Giúp Sola với! Phá đá chuông từng tầng theo sổ notes, chui ngách xuống đáy hang. Đáy hang có ngách bên phải, chuông trong ngách chỉ nghe được ở miệng ngách.',
      veMaMau: 'Sola xuống tới đáy rồi go_echo() ngay. Chạy thử: R1 chưa nghe chuông nên đứng yên.',
      san: [T10A.san, T10B.san],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      ngachHang: [T10A.ngachHang, T10B.ngachHang],
      daChuong: [voiDa(T10A, [6, 1, 8]), voiDa(T10B, [2, 5])],
      chuongDa: [[cd(5, 9, 4, 2)], [cd(3, 7, 4, 2)]],
      maMau: bai(['notes = {"dau": 6, "giua": 1, "cuoi": 8}', 'for k in notes:', '    play_note(notes[k])', '    forward(3)', 'go_echo()']),
      loiGiai: bai(['notes = {"dau": 6, "giua": 1, "cuoi": 8}', 'for k in notes:', '    play_note(notes[k])', '    forward(3)', 'wait_echo()', 'turn_right()', 'go_echo()']),
      loiSai: [
        { moTa: 'go_echo() ngay ở đáy: chưa nghe chuông nên R1 đứng yên', baiLam: bai(['notes = {"dau": 6, "giua": 1, "cuoi": 8}', 'for k in notes:', '    play_note(notes[k])', '    forward(3)', 'go_echo()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên rẽ vào ngách: R1 đi tiếp dọc đáy hang', baiLam: bai(['notes = {"dau": 6, "giua": 1, "cuoi": 8}', 'for k in notes:', '    play_note(notes[k])', '    forward(3)', 'wait_echo()', 'go_echo()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đọc từng khoá: sổ hầm 2 không có "cuoi" nên chương trình dừng', baiLam: bai(['notes = {"dau": 6, "giua": 1, "cuoi": 8}', 'play_note(notes["dau"])', 'forward(3)', 'play_note(notes["giua"])', 'forward(3)', 'play_note(notes["cuoi"])', 'forward(3)', 'wait_echo()', 'turn_right()', 'go_echo()']), phaiCoMa: ['loi-chay'] }
      ],
      sao: { o: 19, nhip: 19 },
      goiY: [
        'Luna: Vòng lặp của màn "Tầng đá theo sổ" đưa R1 xuống đáy.',
        'Luna: Rồi wait_echo(), turn_right(), go_echo().'
      ]
    }),

    /* ========================================================================
       CHƯƠNG 2: che-hang-dong — Chế lệnh: vượt ngách
       ====================================================================== */
    manCheHangDong(1, 'lam-quen', {
      ten: 'Chế lệnh: gõ rồi chui',
      taoHam: ['dive'], chinhCoDinh: true,
      hamCuaEmCan: ['forward', 'play_note'],
      deBai: 'Giúp Sola với! Mỗi tầng là play_note rồi forward(3). Chế hàm dive(n): gõ nốt n cho vỡ đá trước mũi, rồi đi 3 bước chui xuống tầng dưới. Chương trình chính đã khoá.',
      veMaMau: 'Chương trình chính gọi dive(5), dive(2) rồi forward(3). Mở Xưởng hàm, chế dive(n).',
      san: C1.san,
      batDau: { x: 1, y: 1, huong: 1 },
      ngachHang: C1.ngachHang,
      daChuong: voiDa(C1, [5, 2]),
      maMau: bai(['dive(5)', 'dive(2)', 'forward(3)']),
      loiGiai: bai(['dive(5)', 'dive(2)', 'forward(3)'], [], [DIVE]),
      loiSai: [
        { moTa: 'Chưa chế hàm dive', baiLam: bai(['dive(5)', 'dive(2)', 'forward(3)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Thân hàm quên gõ: R1 đâm đá ngay tầng đầu', baiLam: bai(['dive(5)', 'dive(2)', 'forward(3)']), hamCuaEmMoi: [ham('dive', ['forward(3)'], ['n'])], phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 12, nhip: 11 },
      goiY: [
        'Luna: Thân dive(n) hai dòng: play_note(n) rồi forward(3).',
        'Luna: n là nốt đưa vào: dive(5) thì n là 5.'
      ]
    }),

    manCheHangDong(2, 'lam-quen', {
      ten: 'Lặn theo sổ',
      hamCuaEmCan: ['forward', 'dive'],
      khoaTD: ['dau', 'giua', 'cuoi'],
      duLieuSan: ['notes = {"dau": 8, "giua": 3}', 'notes = {"dau": 1, "giua": 6, "cuoi": 4}'],
      deBai: 'Giúp Sola với! Sổ notes ghi nốt đá từng tầng, mỗi hầm một sổ. Mỗi khoá một lần dive, xuống đáy thì forward(3) tới cờ.',
      veMaMau: 'Sola chép tay nốt hầm 1. Chạy thử: hầm 2 sổ khác.',
      san: [C2A.san, C2B.san],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      ngachHang: [C2A.ngachHang, C2B.ngachHang],
      daChuong: [voiDa(C2A, [8, 3]), voiDa(C2B, [1, 6, 4])],
      maMau: bai(['notes = {"dau": 8, "giua": 3}', 'dive(8)', 'dive(3)', 'forward(3)']),
      loiGiai: bai(['notes = {"dau": 8, "giua": 3}', 'for k in notes:', '    dive(notes[k])', 'forward(3)']),
      loiSai: [
        { moTa: 'Chép tay nốt hầm 1: đá đầu hầm 2 nốt 1, không vỡ', baiLam: bai(['notes = {"dau": 8, "giua": 3}', 'dive(8)', 'dive(3)', 'forward(3)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Đọc hai khoá: hầm 2 còn tầng "cuoi"', baiLam: bai(['notes = {"dau": 8, "giua": 3}', 'dive(notes["dau"])', 'dive(notes["giua"])', 'forward(3)']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 13, nhip: 15 },
      goiY: [
        'Luna: for k in notes: rồi dive(notes[k]) thụt vào.',
        'Luna: Hết vòng lặp, forward(3) tới cờ.'
      ]
    }),

    manCheHangDong(3, 'lam-quen', {
      ten: 'Chế lệnh: tìm lối ra',
      taoHam: ['echo_exit'], chinhCoDinh: true,
      hamCuaEmCan: ['forward', 'turn_right', 'wait_echo', 'go_echo'],
      deBai: 'Giúp Sola với! Ra khỏi ngách là đường tối, ngách có chuông nằm bên phải. Chế hàm echo_exit(): đi tới khi nghe chuông, rẽ phải, tới chuông. Chương trình chính đã khoá.',
      veMaMau: 'Chương trình chính chui ngách rồi gọi echo_exit(). Mở Xưởng hàm, chế echo_exit().',
      san: [
        [
          '########',
          '#.II.###',
          '########',
          '#.IIIII#',
          '###I####',
          '###F####',
          '########'
        ],
        [
          '########',
          '#.II.###',
          '########',
          '#.IIIII#',
          '######I#',
          '######F#',
          '########'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      ngachHang: hai([ng(4, 1, 1, 3)]),
      chuongDa: [[cd(3, 5, 7, 2)], [cd(6, 5, 7, 2)]],
      maMau: bai(['forward(3)', 'echo_exit()']),
      loiGiai: bai(['forward(3)', 'echo_exit()'], [], [ECHO_EXIT]),
      loiSai: [
        { moTa: 'Chưa chế hàm echo_exit', baiLam: bai(['forward(3)', 'echo_exit()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Thân hàm quên rẽ: R1 đi tiếp dọc hầm', baiLam: bai(['forward(3)', 'echo_exit()']), hamCuaEmMoi: [ham('echo_exit', ['wait_echo()', 'go_echo()'])], phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 15, nhip: 11 },
      goiY: [
        'Luna: Ba dòng: wait_echo(), turn_right(), go_echo().',
        'Luna: Giống đoạn cuối của màn "Trùm: đáy hang ngầm".'
      ]
    }),

    manCheHangDong(4, 'luyen', {
      ten: 'Lặn xuống, tìm lối ra',
      hamCuaEmCan: ['dive', 'echo_exit'],
      khoaTD: ['dau', 'giua', 'cuoi'],
      duLieuSan: ['notes = {"dau": 2, "giua": 7, "cuoi": 5}', 'notes = {"dau": 6, "giua": 3}'],
      deBai: 'Giúp Sola với! Lặn hết các tầng theo sổ notes, rồi tìm ngách có chuông ở đáy hang.',
      veMaMau: 'Sola lặn xong thì dừng. Chạy thử: R1 đứng ở đáy hang.',
      san: [C4A.san, C4B.san],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      ngachHang: [C4A.ngachHang, C4B.ngachHang],
      daChuong: [voiDa(C4A, [2, 7, 5]), voiDa(C4B, [6, 3])],
      chuongDa: [[cd(6, 9, 1, 2)], [cd(4, 7, 1, 2)]],
      maMau: bai(['notes = {"dau": 2, "giua": 7, "cuoi": 5}', 'for k in notes:', '    dive(notes[k])']),
      loiGiai: bai(['notes = {"dau": 2, "giua": 7, "cuoi": 5}', 'for k in notes:', '    dive(notes[k])', 'echo_exit()']),
      loiSai: [
        { moTa: 'Lặn xong rồi dừng: R1 chưa tới cờ', baiLam: bai(['notes = {"dau": 2, "giua": 7, "cuoi": 5}', 'for k in notes:', '    dive(notes[k])']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Gọi echo_exit() trong vòng lặp: R1 đi tìm chuông khi còn ở tầng trên', baiLam: bai(['notes = {"dau": 2, "giua": 7, "cuoi": 5}', 'for k in notes:', '    dive(notes[k])', '    echo_exit()']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 21, nhip: 20 },
      goiY: [
        'Luna: Vòng lặp dive như màn "Lặn theo sổ".',
        'Luna: Ra ngoài vòng lặp (không thụt vào) gọi echo_exit().'
      ]
    }),

    manCheHangDong(5, 'luyen', {
      ten: 'Không gõ trùng khi lặn',
      hamCuaEmCan: ['forward', 'ring_once'],
      khoaTD: ['dau', 'giua', 'cuoi'],
      duLieuSan: ['notes = {"dau": 4, "giua": 4, "cuoi": 6}', 'notes = {"dau": 5, "giua": 5}'],
      nhipToiDa: 13,
      deBai: 'Giúp Sola với! Nước ngầm dâng, chỉ còn 13 nhịp. Đá tầng dưới cách R1 đúng 3 ô nên cũng nghe được tiếng gõ. Hai tầng liền nhau cùng nốt thì một lần gõ vỡ cả hai. Dùng túi s để không gõ trùng.',
      veMaMau: 'Sola gõ mọi tầng. Chạy thử: hết nhịp trước khi tới cờ.',
      san: [C5A.san, C5B.san],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      ngachHang: [C5A.ngachHang, C5B.ngachHang],
      daChuong: [voiDa(C5A, [4, 4, 6]), voiDa(C5B, [5, 5])],
      maMau: bai(['notes = {"dau": 4, "giua": 4, "cuoi": 6}', 'for k in notes:', '    play_note(notes[k])', '    forward(3)', 'forward(2)']),
      loiGiai: bai(['notes = {"dau": 4, "giua": 4, "cuoi": 6}', 's = set()', 'for k in notes:', '    ring_once(notes[k], s)', '    forward(3)', 'forward(2)']),
      loiSai: [
        { moTa: 'Gõ mọi tầng: tầng giữa gõ lại nốt 4 nên quá 13 nhịp', baiLam: bai(['notes = {"dau": 4, "giua": 4, "cuoi": 6}', 'for k in notes:', '    play_note(notes[k])', '    forward(3)', 'forward(2)']), phaiCoMa: ['qua-nhieu-nhip'] },
        { moTa: 'Chép tay nốt hầm 1: hầm 2 đá nốt 5, không vỡ', baiLam: bai(['notes = {"dau": 4, "giua": 4, "cuoi": 6}', 'play_note(4)', 'forward(3)', 'forward(3)', 'play_note(6)', 'forward(3)', 'forward(2)']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 16, nhip: 13 },
      goiY: [
        'Luna: s = set() ngay sau sổ. ring_once(n, s) chỉ gõ nốt chưa có trong túi.',
        'Luna: Trong vòng lặp: ring_once(notes[k], s) rồi forward(3).'
      ]
    }),

    manCheHangDong(6, 'luyen', {
      ten: 'Chế lệnh: lặn không gõ trùng',
      taoHam: ['dive_once'], chinhCoDinh: true,
      hamCuaEmCan: ['forward', 'ring_once'],
      khoaTD: ['dau', 'giua', 'cuoi'],
      duLieuSan: ['notes = {"dau": 2, "giua": 2}', 'notes = {"dau": 6, "giua": 1, "cuoi": 1}'],
      nhipToiDa: 14,
      deBai: 'Giúp Sola với! Chế hàm dive_once(n, s): gõ nốt n nếu chưa có trong túi s, rồi đi 3 bước chui xuống tầng dưới. Nước dâng, chỉ còn 14 nhịp. Chương trình chính đã khoá.',
      veMaMau: 'Chương trình chính lặn theo sổ bằng dive_once(notes[k], s). Mở Xưởng hàm, chế dive_once(n, s).',
      san: [C6A.san, C6B.san],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      ngachHang: [C6A.ngachHang, C6B.ngachHang],
      daChuong: [voiDa(C6A, [2, 2]), voiDa(C6B, [6, 1, 1])],
      maMau: bai(['notes = {"dau": 2, "giua": 2}', 's = set()', 'for k in notes:', '    dive_once(notes[k], s)', 'forward(3)']),
      loiGiai: bai(['notes = {"dau": 2, "giua": 2}', 's = set()', 'for k in notes:', '    dive_once(notes[k], s)', 'forward(3)'], [], [DIVE_ONCE]),
      loiSai: [
        { moTa: 'Chưa chế hàm dive_once', baiLam: bai(['notes = {"dau": 2, "giua": 2}', 's = set()', 'for k in notes:', '    dive_once(notes[k], s)', 'forward(3)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Thân hàm luôn gõ: gõ trùng nên quá 14 nhịp', baiLam: bai(['notes = {"dau": 2, "giua": 2}', 's = set()', 'for k in notes:', '    dive_once(notes[k], s)', 'forward(3)']), hamCuaEmMoi: [ham('dive_once', ['play_note(n)', 'forward(3)'], ['n', 's'])], phaiCoMa: ['qua-nhieu-nhip'] }
      ],
      sao: { o: 17, nhip: 14 },
      goiY: [
        'Luna: Hai dòng: ring_once(n, s) rồi forward(3).',
        'Luna: ring_once tự bỏ qua nốt đã gõ.'
      ]
    }),

    manCheHangDong(7, 'bien-the', {
      ten: 'Sửa hàm tìm lối ra',
      suaHam: ['echo_exit'], chinhCoDinh: true,
      hamCuaEmCan: ['turn_right', 'wait_echo', 'go_echo', 'dive', 'echo_exit'],
      deBai: 'Giúp Sola với! Ai đó sửa echo_exit() thành rẽ trái, nhưng ngách có chuông nằm bên phải. Sửa lại hàm. Chương trình chính đã khoá.',
      veMaMau: 'Mở echo_exit() trong Xưởng hàm. Chạy thử: R1 quay vào vách.',
      san: [C7A.san, C7B.san],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      ngachHang: [C7A.ngachHang, C7B.ngachHang],
      daChuong: [voiDa(C7A, [3, 8]), voiDa(C7B, [3, 8])],
      chuongDa: [[cd(3, 7, 2, 2)], [cd(6, 7, 2, 2)]],
      maMau: bai(['dive(3)', 'dive(8)', 'echo_exit()'], [], [ham('echo_exit', ['wait_echo()', 'turn_left()', 'go_echo()'])]),
      loiGiai: bai(['dive(3)', 'dive(8)', 'echo_exit()'], [], [ECHO_EXIT]),
      loiSai: [
        { moTa: 'Không sửa: R1 rẽ trái vào vách', baiLam: bai(['dive(3)', 'dive(8)', 'echo_exit()']), hamCuaEmMoi: [ham('echo_exit', ['wait_echo()', 'turn_left()', 'go_echo()'])], phaiCoMa: ['dam-tuong'] },
        { moTa: 'Xoá dòng rẽ: R1 đi tiếp dọc đáy hang', baiLam: bai(['dive(3)', 'dive(8)', 'echo_exit()']), hamCuaEmMoi: [ham('echo_exit', ['wait_echo()', 'go_echo()'])], phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 20, nhip: 16 },
      goiY: [
        'Luna: Chuông nằm bên phải R1.',
        'Luna: Đổi turn_left() thành turn_right().'
      ]
    }),

    manCheHangDong(8, 'bien-the', {
      ten: 'Chế lệnh: lặn hết sổ',
      taoHam: ['dive_all'], chinhCoDinh: true,
      hamCuaEmCan: ['dive', 'echo_exit'],
      khoaTD: ['dau', 'giua', 'cuoi'],
      duLieuSan: ['notes = {"dau": 7, "giua": 1, "cuoi": 4}', 'notes = {"dau": 3, "giua": 8}'],
      deBai: 'Giúp Sola với! Chế hàm dive_all(book): với mỗi khoá trong sổ book, dive một lần. Chương trình chính đã khoá.',
      veMaMau: 'Chương trình chính gọi dive_all(notes) rồi echo_exit(). Mở Xưởng hàm, chế dive_all(book).',
      san: [C8A.san, C8B.san],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      ngachHang: [C8A.ngachHang, C8B.ngachHang],
      daChuong: [voiDa(C8A, [7, 1, 4]), voiDa(C8B, [3, 8])],
      chuongDa: [[cd(4, 9, 6, 2)], [cd(6, 7, 6, 2)]],
      maMau: bai(['notes = {"dau": 7, "giua": 1, "cuoi": 4}', 'dive_all(notes)', 'echo_exit()']),
      loiGiai: bai(['notes = {"dau": 7, "giua": 1, "cuoi": 4}', 'dive_all(notes)', 'echo_exit()'], [], [DIVE_ALL]),
      loiSai: [
        { moTa: 'Chưa chế hàm dive_all', baiLam: bai(['notes = {"dau": 7, "giua": 1, "cuoi": 4}', 'dive_all(notes)', 'echo_exit()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Thân hàm đọc từng khoá: sổ hầm 2 không có "cuoi" nên chương trình dừng', baiLam: bai(['notes = {"dau": 7, "giua": 1, "cuoi": 4}', 'dive_all(notes)', 'echo_exit()']), hamCuaEmMoi: [ham('dive_all', ['dive(book["dau"])', 'dive(book["giua"])', 'dive(book["cuoi"])'], ['book'])], phaiCoMa: ['loi-chay'] }
      ],
      sao: { o: 22, nhip: 18 },
      goiY: [
        'Luna: Thân dive_all(book) giống walk_book(book): for k in book: rồi một dòng thụt vào.',
        'Luna: Dòng thụt vào: dive(book[k]).'
      ]
    }),

    manCheHangDong(9, 'bien-the', {
      ten: 'Lặn xong theo chuông',
      hamCuaEmCan: ['dive_all', 'echo_spiral'],
      khoaTD: ['dau', 'giua', 'cuoi'],
      duLieuSan: ['notes = {"dau": 5, "giua": 2}', 'notes = {"dau": 8, "giua": 6, "cuoi": 3}'],
      deBai: 'Giúp Sola với! Lặn hết sổ notes xuống đáy hang. Ở đáy, chuông đá treo ở mọi chỗ rẽ dẫn tới cờ.',
      veMaMau: 'Sola lặn xong rồi đếm bước hầm 1. Chạy thử: hầm 2 đáy khác.',
      san: [C9A.san, C9B.san],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      ngachHang: [C9A.ngachHang, C9B.ngachHang],
      daChuong: [voiDa(C9A, [5, 2]), voiDa(C9B, [8, 6, 3])],
      chuongDa: [
        [cd(5, 5, 2, 4), cd(5, 8, 4, 3), cd(3, 8, 7, 2)],
        [cd(6, 7, 2, 5), cd(6, 10, 4, 3), cd(4, 10, 7, 2)]
      ],
      maMau: bai(['notes = {"dau": 5, "giua": 2}', 'dive_all(notes)', 'rim(4)', 'rim(3)', 'forward(2)']),
      loiGiai: bai(['notes = {"dau": 5, "giua": 2}', 'dive_all(notes)', 'echo_spiral()']),
      loiSai: [
        { moTa: 'Đếm bước đáy hầm 1: đáy hầm 2 dài hơn', baiLam: bai(['notes = {"dau": 5, "giua": 2}', 'dive_all(notes)', 'rim(4)', 'rim(3)', 'forward(2)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Theo chuông trước khi lặn: còn tầng đá nên R1 đâm đá', baiLam: bai(['notes = {"dau": 5, "giua": 2}', 'echo_spiral()', 'dive_all(notes)']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 20, nhip: 24 },
      goiY: [
        'Luna: dive_all(notes) đưa R1 xuống đáy.',
        'Luna: Ở đáy, echo_spiral() theo chuông tới cờ.'
      ]
    }),

    manCheHangDong(10, 'tong-hop', {
      ten: 'Trùm: cửa hang ngầm',
      hamCuaEmCan: ['turn_right', 'wait_echo', 'go_echo', 'crack_rim', 'dive_once'],
      khoaTD: ['dau', 'giua', 'cuoi'],
      duLieuSan: ['notes = {"dau": 7, "giua": 7, "cuoi": 2}', 'notes = {"dau": 4, "giua": 4}'],
      khung: { chinh: 10, moiHam: 8, cauTruc: ['for', 'while', 'if', 'dict', 'set'] },
      deBai: 'Giúp Sola với! Lặn theo sổ notes, không gõ trùng cho đỡ tốn nhịp. Ở đáy có ngách bên phải, trong ngách là đá chuông nốt 6, sau đá là chuông đá ở cờ.',
      veMaMau: 'Sola lặn xong thì tìm chuông ngay. Chạy thử: R1 đâm vào đá trong ngách.',
      san: [C10A.san, C10B.san],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      ngachHang: [C10A.ngachHang, C10B.ngachHang],
      daChuong: [voiDa(C10A, [7, 7, 2]).concat([{ x: 5, y: 10, not: 6, ben: 1, phamVi: 3 }]), voiDa(C10B, [4, 4]).concat([{ x: 3, y: 8, not: 6, ben: 1, phamVi: 3 }])],
      chuongDa: [[cd(3, 10, 1, 2)], [cd(1, 8, 1, 2)]],
      maMau: bai(['notes = {"dau": 7, "giua": 7, "cuoi": 2}', 's = set()', 'for k in notes:', '    dive_once(notes[k], s)', 'wait_echo()', 'turn_right()', 'go_echo()']),
      loiGiai: bai(['notes = {"dau": 7, "giua": 7, "cuoi": 2}', 's = set()', 'for k in notes:', '    dive_once(notes[k], s)', 'wait_echo()', 'turn_right()', 'crack_rim(6)', 'go_echo()']),
      loiSai: [
        { moTa: 'Không phá đá trong ngách: R1 đâm vào đá', baiLam: bai(['notes = {"dau": 7, "giua": 7, "cuoi": 2}', 's = set()', 'for k in notes:', '    dive_once(notes[k], s)', 'wait_echo()', 'turn_right()', 'go_echo()']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Quên s = set(): chưa có túi s nên chương trình dừng', baiLam: bai(['notes = {"dau": 7, "giua": 7, "cuoi": 2}', 'for k in notes:', '    dive_once(notes[k], s)', 'wait_echo()', 'turn_right()', 'crack_rim(6)', 'go_echo()']), phaiCoMa: ['loi-chay'] },
        { moTa: 'Quên rẽ vào ngách: R1 đi tiếp dọc đáy hang', baiLam: bai(['notes = {"dau": 7, "giua": 7, "cuoi": 2}', 's = set()', 'for k in notes:', '    dive_once(notes[k], s)', 'wait_echo()', 'crack_rim(6)', 'go_echo()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 30, nhip: 23 },
      goiY: [
        'Luna: Lặn như màn "Chế lệnh: lặn không gõ trùng", rồi wait_echo() và turn_right().',
        'Luna: Trong ngách: crack_rim(6), rồi go_echo() tới cờ.'
      ]
    })
  ];

  if (M && M.them) M.manSanHangDong = DS;
  if (typeof module !== 'undefined' && module.exports) module.exports = M;
})();
