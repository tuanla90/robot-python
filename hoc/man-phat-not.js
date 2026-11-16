/* ============================================================================
   man-phat-not.js — Mùa 8 Hang động · Gói 6: Ngân dài (mã gói phat-not; viết lại 16/11, KE-HOACH-MUA-8.md)
   Chương 1: phat-not "Vừa đi vừa ngân" (10 màn): note(n, k) ngân nốt n trong k nhịp liền. Gọi wait() ngay sau thì R1 đứng yên ngân đủ k nhịp;
             đi / rẽ / lướt ngay sau thì loa vẫn ngân trong các nhịp đó. Đá chuông k vạch vỡ khi nghe đúng nốt k nhịp liền (tầm 3 ô hay tia trước mũi).
   Chương 2: che-phat-not "Chế lệnh: tấu phá đá" (10 màn): crack_glide(n, k) (mùa 9 gọi: giữ tên và thân), march_note(n, k, m), long_once(n, k, s).
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
  /** Đá chuông vang khẽ: chỉ nghe được (hear()) khi đứng sát bên. */
  function daK(x, y, not, ben) { return { x: x, y: y, not: not, ben: ben || 1, phamVi: 1 }; }
  function ng(ax, ay, bx, by) { return { a: { x: ax, y: ay }, b: { x: bx, y: by } }; }
  function hai(a) { return [a, a]; }

  /** Tầng đá ướt (như man-thu-gai.js): tầng i ở hàng y = 2i + 1, ô (1, y) xuất phát / miệng ra, (2, y) đá ướt, đá chuông ở (3, y),
   *  đá ướt tới miệng ngách ở (cuoi[i], y), chui xuống (1, y + 2); `duoi` vẽ từ hàng y = 2n + 1. */
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

  function manNgan(so, hang, ds) {
    return Object.assign({
      chuong: 'phat-not', so: so, hang: hang,
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

  function manCheNgan(so, hang, ds) {
    return Object.assign({
      chuong: 'che-phat-not', so: so, hang: hang,
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

  var T7A = tangLuot([5, 6, 4], ['#.Iu####', '##F#####'], 8), T7B = tangLuot([7, 4, 6], ['#.Iu#####', '##F######'], 9);
  var T8A = tangLuot([6, 4, 5], ['#.Iu####', '##F#####'], 8), T8B = tangLuot([4, 6, 7], ['#.Iu#####', '##F######'], 9);
  var T10A = tangLuot([6, 5], ['#.IIIIII#', '#######I#', '#######I#', '######FI#'], 9);
  var T10B = tangLuot([4, 7, 5], ['#.IIIII##', '######I##', '##F###I##', '##IIIII##'], 9);

  var CRACK_GLIDE = ham('crack_glide', ['note(n, k)', 'wait()', 'glide_step()'], ['n', 'k']);
  var MARCH_NOTE = ham('march_note', ['note(n, k)', 'forward(m)'], ['n', 'k', 'm']);
  var LONG_ONCE = ham('long_once', ['if n not in s:', '    s.add(n)', '    note(n, k)', '    wait()'], ['n', 'k', 's']);

  var DS = [
    /* ========================================================================
       CHƯƠNG 1: phat-not — Vừa đi vừa ngân
       ====================================================================== */
    manNgan(1, 'lam-quen', {
      ten: 'Ngân dài',
      chiChay: true, chinhCoDinh: true,
      hamCuaEmCan: ['forward'],
      deBai: 'Sola làm mẫu. Đá chuông này có 3 vạch: phải nghe đúng nốt 3 nhịp liền mới vỡ. note(5, 3) ngân nốt 5 suốt 3 nhịp, trong lúc R1 vẫn đi. Bấm Chạy để xem.',
      veMaMau: 'Chương trình Sola viết sẵn và đã khoá: ngân nốt 5 ba nhịp, vừa ngân vừa đi tới cờ.',
      san: [
        '#########',
        '#......F#',
        '#########'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      daChuong: [da(5, 1, 5, 3)],
      maMau: bai(['note(5, 3)', 'forward(6)']),
      loiGiai: bai(['note(5, 3)', 'forward(6)']),
      sao: { o: 7, nhip: 6 },
      goiY: [
        'Luna: Số thứ hai trong note(5, 3) là số nhịp ngân.',
        'Luna: Đá vỡ ở nhịp thứ ba, R1 tới đá ở nhịp thứ tư.'
      ]
    }),

    manNgan(2, 'lam-quen', {
      ten: 'Ngân cho đủ nhịp',
      hamCuaEmCan: ['forward'],
      nhipToiDa: 8,
      deBai: 'Giúp Sola với! Đá chuông nốt 2 có 4 vạch. Ngân đủ 4 nhịp trong lúc R1 đi tới đá. Chỉ còn 8 nhịp, không kịp đứng lại ngân.',
      veMaMau: 'Sola ngân thiếu một nhịp. Chạy thử: đá chưa vỡ.',
      san: [
        '##########',
        '#.......F#',
        '##########'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      daChuong: [da(6, 1, 2, 4)],
      maMau: bai(['note(2, 3)', 'forward(7)']),
      loiGiai: bai(['note(2, 4)', 'forward(7)']),
      loiSai: [
        { moTa: 'Ngân 3 nhịp: đá 4 vạch chưa vỡ, R1 đâm đá', baiLam: bai(['note(2, 3)', 'forward(7)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Đứng yên ngân rồi mới đi: quá 8 nhịp', baiLam: bai(['note(2, 4)', 'wait()', 'forward(7)']), phaiCoMa: ['qua-nhieu-nhip'] }
      ],
      sao: { o: 7, nhip: 7 },
      goiY: [
        'Luna: Đá có 4 vạch thì ngân 4 nhịp.',
        'Luna: note(2, 4) rồi forward(7).'
      ]
    }),

    manNgan(3, 'lam-quen', {
      ten: 'Đứng yên mà ngân',
      hamCuaEmCan: ['forward'],
      deBai: 'Giúp Sola với! Đá chuông nốt 6 có 3 vạch, chắn ngay trước mũi R1: đi tới là đâm. Sau note(6, 3), gọi wait() thì R1 đứng yên ngân đủ 3 nhịp. Đá vỡ rồi mới đi.',
      veMaMau: 'Sola vừa ngân vừa đi. Chạy thử: R1 đâm đá.',
      san: [
        '########',
        '#.....F#',
        '########'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      daChuong: [da(2, 1, 6, 3)],
      maMau: bai(['note(6, 3)', 'forward(5)']),
      loiGiai: bai(['note(6, 3)', 'wait()', 'forward(5)']),
      loiSai: [
        { moTa: 'Vừa ngân vừa đi: đá ngay trước mũi, R1 đâm đá', baiLam: bai(['note(6, 3)', 'forward(5)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'wait() trước note: R1 chờ suông rồi đâm đá', baiLam: bai(['wait()', 'note(6, 3)', 'forward(5)']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 8, nhip: 8 },
      goiY: [
        'Luna: wait() ngay sau note(6, 3) là đứng ngân đủ 3 nhịp.',
        'Luna: note(6, 3), wait(), forward(5).'
      ]
    }),

    manNgan(4, 'luyen', {
      ten: 'Hai đá khác nốt',
      hamCuaEmCan: ['forward'],
      deBai: 'Giúp Sola với! Đá thứ nhất nốt 3, 2 vạch. Đá thứ hai nốt 6, 3 vạch. Mỗi lúc loa chỉ ngân một nốt: phá xong đá thứ nhất rồi mới đổi nốt.',
      veMaMau: 'Sola chỉ ngân nốt 3. Chạy thử: R1 đâm đá thứ hai.',
      san: [
        '############',
        '#.........F#',
        '############'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      daChuong: [da(4, 1, 3, 2), da(8, 1, 6, 3)],
      maMau: bai(['note(3, 2)', 'forward(9)']),
      loiGiai: bai(['note(3, 2)', 'forward(3)', 'note(6, 3)', 'forward(6)']),
      loiSai: [
        { moTa: 'Chỉ ngân nốt 3: R1 đâm đá thứ hai', baiLam: bai(['note(3, 2)', 'forward(9)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Ngân nốt 6 trước: R1 đâm đá thứ nhất', baiLam: bai(['note(6, 3)', 'forward(3)', 'note(3, 2)', 'forward(6)']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 9, nhip: 9 },
      goiY: [
        'Luna: note(3, 2) rồi forward(3) tới chỗ đá thứ nhất.',
        'Luna: Rồi note(6, 3) và forward(6) tới cờ.'
      ]
    }),

    manNgan(5, 'luyen', {
      ten: 'Lướt tới đá, đứng ngân',
      hamCuaEmCan: ['move', 'forward'],
      nhipToiDa: 6,
      deBai: 'Giúp Sola với! Dải đá ướt có đá chuông nốt 4, 3 vạch chắn giữa. Lướt tới đá, đứng ngân cho đá vỡ, rồi lướt tiếp tới cờ. Hai hầm dài ngắn khác nhau. Chỉ còn 6 nhịp.',
      veMaMau: 'Sola ngân thiếu một nhịp. Chạy thử xem.',
      san: [
        [
          '###########',
          '#.IIIIIIIF#',
          '###########'
        ],
        [
          '##############',
          '#.IIIIIIIIIIF#',
          '##############'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      daChuong: [[da(6, 1, 4, 3)], [da(9, 1, 4, 3)]],
      maMau: bai(['retract_spikes()', 'move()', 'note(4, 2)', 'wait()', 'move()']),
      loiGiai: bai(['retract_spikes()', 'move()', 'note(4, 3)', 'wait()', 'move()']),
      loiSai: [
        { moTa: 'Ngân 2 nhịp: đá 3 vạch chưa vỡ', baiLam: bai(['retract_spikes()', 'move()', 'note(4, 2)', 'wait()', 'move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên wait(): R1 lướt tiếp khi đá chưa vỡ', baiLam: bai(['retract_spikes()', 'move()', 'note(4, 3)', 'move()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 8, nhip: 5 },
      goiY: [
        'Luna: Lướt dừng ngay trước đá. note(4, 3) rồi wait().',
        'Luna: retract_spikes(), move(), note(4, 3), wait(), move().'
      ]
    }),

    manNgan(6, 'luyen', {
      ten: 'Sổ ghi nốt và nhịp',
      hamCuaEmCan: ['forward'],
      khoaTD: ['not', 'nhip'],
      duLieuSan: ['d = {"not": 5, "nhip": 3}', 'd = {"not": 2, "nhip": 4}'],
      deBai: 'Giúp Sola với! Sổ d ghi nốt và số vạch của đá chuông. Mỗi hầm một sổ. Ngân theo sổ trong lúc đi tới cờ.',
      veMaMau: 'Sola chép tay sổ của hầm 1. Chạy thử: hầm 2 đá khác.',
      san: hai([
        '##########',
        '#.......F#',
        '##########'
      ]),
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      daChuong: [[da(6, 1, 5, 3)], [da(6, 1, 2, 4)]],
      maMau: bai(['d = {"not": 5, "nhip": 3}', 'note(5, 3)', 'forward(7)']),
      loiGiai: bai(['d = {"not": 5, "nhip": 3}', 'note(d["not"], d["nhip"])', 'forward(7)']),
      loiSai: [
        { moTa: 'Chép tay sổ hầm 1: hầm 2 đá không vỡ', baiLam: bai(['d = {"not": 5, "nhip": 3}', 'note(5, 3)', 'forward(7)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Quên số nhịp: loa ngân một nhịp, đá chưa vỡ', baiLam: bai(['d = {"not": 5, "nhip": 3}', 'note(d["not"])', 'forward(7)']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 8, nhip: 7 },
      goiY: [
        'Luna: d["not"] là nốt, d["nhip"] là số nhịp ngân.',
        'Luna: note(d["not"], d["nhip"]) rồi forward(7).'
      ]
    }),

    manNgan(7, 'bien-the', {
      ten: 'Ngân qua chỗ rẽ',
      hamCuaEmCan: ['forward', 'turn_right'],
      deBai: 'Giúp Sola với! Đá chuông nốt 7 có 3 vạch nằm sau chỗ rẽ. Tầm loa là 3 ô quanh R1, nên đứng ở đây đá đã nghe được. Ngân ngay từ đầu, rẽ phải trong lúc vẫn ngân.',
      veMaMau: 'Sola rẽ xong mới ngân. Chạy thử: R1 đâm đá.',
      san: [
        '#######',
        '###..##',
        '####.##',
        '####.##',
        '####.##',
        '####F##',
        '#######'
      ],
      batDau: { x: 3, y: 1, huong: 1 },
      daChuong: [da(4, 3, 7, 3)],
      maMau: bai(['forward(1)', 'turn_right()', 'note(7, 3)', 'forward(4)']),
      loiGiai: bai(['note(7, 3)', 'forward(1)', 'turn_right()', 'forward(4)']),
      loiSai: [
        { moTa: 'Rẽ xong mới ngân: R1 đâm đá', baiLam: bai(['forward(1)', 'turn_right()', 'note(7, 3)', 'forward(4)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Ngân 2 nhịp: đá 3 vạch chưa vỡ', baiLam: bai(['note(7, 2)', 'forward(1)', 'turn_right()', 'forward(4)']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 11, nhip: 6 },
      goiY: [
        'Luna: Loa vẫn ngân khi R1 rẽ.',
        'Luna: note(7, 3) ở dòng đầu, rồi forward(1), turn_right(), forward(4).'
      ]
    }),

    manNgan(8, 'bien-the', {
      ten: 'Hàng đá theo sổ',
      hamCuaEmCan: ['forward'],
      khoaTD: ['dau', 'giua', 'cuoi'],
      duLieuSan: ['notes = {"dau": 3, "cuoi": 6}', 'notes = {"dau": 8, "giua": 2, "cuoi": 5}'],
      deBai: 'Giúp Sola với! Đá chuông 3 vạch đứng cách nhau 4 ô. Sổ notes ghi nốt từng đá, từ đầu tới cuối. Mỗi hầm một sổ. Vừa ngân vừa đi qua từng đá.',
      veMaMau: 'Sola chép tay nốt hầm 1. Chạy thử: hầm 2 có ba đá.',
      san: [
        [
          '#############',
          '#..........F#',
          '#############'
        ],
        [
          '#################',
          '#..............F#',
          '#################'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      daChuong: [[da(5, 1, 3, 3), da(9, 1, 6, 3)], [da(5, 1, 8, 3), da(9, 1, 2, 3), da(13, 1, 5, 3)]],
      maMau: bai(['notes = {"dau": 3, "cuoi": 6}', 'note(3, 3)', 'forward(4)', 'note(6, 3)', 'forward(4)', 'forward(2)']),
      loiGiai: bai(['notes = {"dau": 3, "cuoi": 6}', 'for k in notes:', '    note(notes[k], 3)', '    forward(4)', 'forward(2)']),
      loiSai: [
        { moTa: 'Chép tay nốt hầm 1: hầm 2 đá không vỡ', baiLam: bai(['notes = {"dau": 3, "cuoi": 6}', 'note(3, 3)', 'forward(4)', 'note(6, 3)', 'forward(4)', 'forward(2)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Ngân một nhịp: đá 3 vạch chưa vỡ', baiLam: bai(['notes = {"dau": 3, "cuoi": 6}', 'for k in notes:', '    note(notes[k])', '    forward(4)', 'forward(2)']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 10, nhip: 14 },
      goiY: [
        'Luna: for k in notes: note(notes[k], 3) rồi forward(4).',
        'Luna: Ra ngoài vòng lặp: forward(2) tới cờ.'
      ]
    }),

    manNgan(9, 'bien-the', {
      ten: 'Lướt, ngân, lướt tiếp',
      hamCuaEmCan: ['move'],
      khoaTD: ['dau', 'giua', 'cuoi'],
      duLieuSan: ['notes = {"dau": 3, "cuoi": 6}', 'notes = {"dau": 5, "giua": 2, "cuoi": 7}'],
      deBai: 'Giúp Sola với! Dải đá ướt có đá chuông 3 vạch chắn từng quãng. Sổ notes ghi nốt từng đá, từ đầu tới cuối. Lướt tới đá nào thì đứng ngân nốt đá đó, rồi lướt tiếp.',
      veMaMau: 'Sola chép tay nốt hầm 1. Chạy thử: hầm 2 có ba đá.',
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
      daChuong: [[da(4, 1, 3, 3), da(7, 1, 6, 3)], [da(3, 1, 5, 3), da(6, 1, 2, 3), da(9, 1, 7, 3)]],
      maMau: bai(['notes = {"dau": 3, "cuoi": 6}', 'retract_spikes()', 'move()', 'note(3, 3)', 'wait()', 'move()', 'note(6, 3)', 'wait()', 'move()']),
      loiGiai: bai(['notes = {"dau": 3, "cuoi": 6}', 'retract_spikes()', 'for k in notes:', '    move()', '    note(notes[k], 3)', '    wait()', 'move()']),
      loiSai: [
        { moTa: 'Chép tay nốt hầm 1: hầm 2 đá không vỡ', baiLam: bai(['notes = {"dau": 3, "cuoi": 6}', 'retract_spikes()', 'move()', 'note(3, 3)', 'wait()', 'move()', 'note(6, 3)', 'wait()', 'move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên wait(): R1 chưa ngân đã lướt tiếp', baiLam: bai(['notes = {"dau": 3, "cuoi": 6}', 'retract_spikes()', 'for k in notes:', '    move()', '    note(notes[k], 3)', 'move()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 10, nhip: 13 },
      goiY: [
        'Luna: Mỗi vòng: move() lướt tới đá, note(notes[k], 3), wait().',
        'Luna: Hết vòng lặp, move() lướt tới cờ.'
      ]
    }),

    manNgan(10, 'tong-hop', {
      ten: 'Trùm: hầm đá ngân',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'go_echo'],
      khoaTD: ['not', 'nhip'],
      duLieuSan: ['d = {"not": 5, "nhip": 3}', 'd = {"not": 1, "nhip": 5}'],
      deBai: 'Giúp Sola với! Đá chuông chắn hầm trên, sổ d ghi nốt và số vạch. Miệng ngách ở sau đá 2 ô, đo khoảng cách tới đá bằng hear(). Qua ngách là dải đá ướt, hết dải rẽ phải, cờ treo chuông đá.',
      veMaMau: 'Sola đếm bước hầm 1. Chạy thử: hầm 2 xa hơn.',
      san: [
        [
          '##########',
          '#.......##',
          '##########',
          '#.IIII####',
          '#####.####',
          '#####F####',
          '##########'
        ],
        [
          '###########',
          '#.........#',
          '###########',
          '#.II#######',
          '###.#######',
          '###.#######',
          '###F#######',
          '###########'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      ngachHang: [[ng(7, 1, 1, 3)], [ng(9, 1, 1, 3)]],
      daChuong: [[da(5, 1, 5, 3)], [da(7, 1, 1, 5)]],
      chuongDa: [[cd(5, 5, 2)], [cd(3, 6, 2)]],
      maMau: bai(['d = {"not": 5, "nhip": 3}', 'note(d["not"], d["nhip"])', 'forward(6)', 'retract_spikes()', 'move()', 'turn_right()', 'go_echo()']),
      loiGiai: bai(['d = {"not": 5, "nhip": 3}', 'note(d["not"], d["nhip"])', 'forward(hear() + 2)', 'retract_spikes()', 'move()', 'turn_right()', 'go_echo()']),
      loiSai: [
        { moTa: 'Đếm bước hầm 1: hầm 2 chưa tới miệng ngách', baiLam: bai(['d = {"not": 5, "nhip": 3}', 'note(d["not"], d["nhip"])', 'forward(6)', 'retract_spikes()', 'move()', 'turn_right()', 'go_echo()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'forward(hear()): R1 dừng ở chỗ đá, chưa tới ngách', baiLam: bai(['d = {"not": 5, "nhip": 3}', 'note(d["not"], d["nhip"])', 'forward(hear())', 'retract_spikes()', 'move()', 'turn_right()', 'go_echo()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Ngân 3 nhịp cứng: đá hầm 2 có 5 vạch, R1 đâm đá', baiLam: bai(['d = {"not": 5, "nhip": 3}', 'note(d["not"], 3)', 'forward(hear() + 2)', 'retract_spikes()', 'move()', 'turn_right()', 'go_echo()']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 15, nhip: 13 },
      goiY: [
        'Luna: hear() lúc đầu là số ô tới đá. Miệng ngách xa hơn 2 ô.',
        'Luna: forward(hear() + 2), rồi lướt, rẽ phải, go_echo().'
      ]
    }),

    /* ========================================================================
       CHƯƠNG 2: che-phat-not — Chế lệnh: tấu phá đá
       ====================================================================== */
    manCheNgan(1, 'lam-quen', {
      ten: 'Chế lệnh: ngân rồi lướt',
      taoHam: ['crack_glide'], chinhCoDinh: true,
      hamCuaEmCan: ['glide_step'],
      deBai: 'Giúp Sola với! Ở mỗi góc, đá chuông chắn ngay đầu dải đá ướt. Chế hàm crack_glide(n, k): đứng ngân nốt n đủ k nhịp, rồi glide_step(). Chương trình chính đã khoá.',
      veMaMau: 'Chương trình chính gọi crack_glide hai lần. Mở Xưởng hàm, chế crack_glide(n, k).',
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
      daChuong: [[da(2, 1, 4, 2), da(6, 2, 7, 3)], [da(2, 1, 4, 2), da(8, 2, 7, 3)]],
      maMau: bai(['crack_glide(4, 2)', 'crack_glide(7, 3)', 'move()']),
      loiGiai: bai(['crack_glide(4, 2)', 'crack_glide(7, 3)', 'move()'], [], [CRACK_GLIDE]),
      loiSai: [
        { moTa: 'Chưa chế hàm crack_glide', baiLam: bai(['crack_glide(4, 2)', 'crack_glide(7, 3)', 'move()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Thân hàm ngân một nhịp: đá 2 vạch chưa vỡ', baiLam: bai(['crack_glide(4, 2)', 'crack_glide(7, 3)', 'move()']), hamCuaEmMoi: [ham('crack_glide', ['note(n)', 'wait()', 'glide_step()'], ['n', 'k'])], phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 15, nhip: 10 },
      goiY: [
        'Luna: note(n, k) rồi wait() là đứng ngân k nhịp.',
        'Luna: Thân hàm: note(n, k), wait(), glide_step().'
      ]
    }),

    manCheNgan(2, 'lam-quen', {
      ten: 'Xoắn ốc theo sổ',
      hamCuaEmCan: ['move', 'crack_glide'],
      khoaTD: ['dau', 'giua', 'cuoi'],
      duLieuSan: ['notes = {"dau": 4, "cuoi": 7}', 'notes = {"dau": 2, "giua": 6, "cuoi": 3}'],
      deBai: 'Giúp Sola với! Mỗi góc xoắn ốc có một đá chuông 2 vạch. Sổ notes ghi nốt từng đá theo thứ tự. Mỗi hầm một sổ, số góc cũng khác.',
      veMaMau: 'Sola chép tay nốt hầm 1. Chạy thử: hầm 2 có ba góc.',
      san: [
        [
          '#######',
          '#.IIII#',
          '#####I#',
          '#####I#',
          '#####I#',
          '####FI#',
          '#######'
        ],
        [
          '#########',
          '#.IIIIII#',
          '#######I#',
          '##F####I#',
          '##IIIIII#',
          '#########'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      daChuong: [[da(2, 1, 4, 2), da(5, 2, 7, 2)], [da(2, 1, 2, 2), da(7, 2, 6, 2), da(6, 4, 3, 2)]],
      maMau: bai(['notes = {"dau": 4, "cuoi": 7}', 'crack_glide(4, 2)', 'crack_glide(7, 2)', 'move()']),
      loiGiai: bai(['notes = {"dau": 4, "cuoi": 7}', 'for k in notes:', '    crack_glide(notes[k], 2)', 'move()']),
      loiSai: [
        { moTa: 'Chép tay nốt hầm 1: hầm 2 đá không vỡ', baiLam: bai(['notes = {"dau": 4, "cuoi": 7}', 'crack_glide(4, 2)', 'crack_glide(7, 2)', 'move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Ngân một nhịp: đá 2 vạch chưa vỡ', baiLam: bai(['notes = {"dau": 4, "cuoi": 7}', 'for k in notes:', '    crack_glide(notes[k], 1)', 'move()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 16, nhip: 13 },
      goiY: [
        'Luna: for k in notes: crack_glide(notes[k], 2).',
        'Luna: Ra ngoài vòng lặp: move() vào cờ.'
      ]
    }),

    manCheNgan(3, 'luyen', {
      ten: 'Chế lệnh: vừa đi vừa ngân',
      taoHam: ['march_note'], chinhCoDinh: true,
      hamCuaEmCan: ['forward'],
      deBai: 'Giúp Sola với! Chế hàm march_note(n, k, m): ngân nốt n trong k nhịp, cùng lúc đi m bước. Chương trình chính đã khoá.',
      veMaMau: 'Chương trình chính gọi march_note hai lần. Mở Xưởng hàm, chế march_note(n, k, m).',
      san: [
        '#############',
        '#..........F#',
        '#############'
      ],
      batDau: { x: 1, y: 1, huong: 1 },
      daChuong: [da(5, 1, 3, 2), da(9, 1, 6, 3)],
      maMau: bai(['march_note(3, 2, 4)', 'march_note(6, 3, 4)', 'forward(2)']),
      loiGiai: bai(['march_note(3, 2, 4)', 'march_note(6, 3, 4)', 'forward(2)'], [], [MARCH_NOTE]),
      loiSai: [
        { moTa: 'Chưa chế hàm march_note', baiLam: bai(['march_note(3, 2, 4)', 'march_note(6, 3, 4)', 'forward(2)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Thân hàm đi trước rồi mới ngân: R1 đâm đá', baiLam: bai(['march_note(3, 2, 4)', 'march_note(6, 3, 4)', 'forward(2)']), hamCuaEmMoi: [ham('march_note', ['forward(m)', 'note(n, k)'], ['n', 'k', 'm'])], phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 10, nhip: 10 },
      goiY: [
        'Luna: Thân hàm hai dòng: ngân trước, đi sau.',
        'Luna: note(n, k), forward(m).'
      ]
    }),

    manCheNgan(4, 'luyen', {
      ten: 'Hành khúc nghe khoảng cách',
      hamCuaEmCan: ['forward', 'march_note'],
      khoaTD: ['dau', 'giua', 'cuoi'],
      duLieuSan: ['notes = {"dau": 2, "cuoi": 7}', 'notes = {"dau": 4, "giua": 1, "cuoi": 6}'],
      deBai: 'Giúp Sola với! Đá chuông 3 vạch đứng cách nhau xa gần khác nhau. Đá chưa vỡ vẫn vang, nên hear() là số bước tới đá kế tiếp. Sổ notes ghi nốt từng đá. Qua đá cuối, cờ cách 2 bước.',
      veMaMau: 'Sola đếm 4 bước mỗi đá. Chạy thử: R1 dừng sớm.',
      san: [
        [
          '##############',
          '#...........F#',
          '##############'
        ],
        [
          '###################',
          '#................F#',
          '###################'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      daChuong: [[da(5, 1, 2, 3), da(10, 1, 7, 3)], [da(5, 1, 4, 3), da(9, 1, 1, 3), da(15, 1, 6, 3)]],
      maMau: bai(['notes = {"dau": 2, "cuoi": 7}', 'for k in notes:', '    march_note(notes[k], 3, 4)', 'forward(2)']),
      loiGiai: bai(['notes = {"dau": 2, "cuoi": 7}', 'for k in notes:', '    march_note(notes[k], 3, hear())', 'forward(2)']),
      loiSai: [
        { moTa: 'Đi 4 bước mỗi đá: đá xa hơn thì R1 dừng sớm', baiLam: bai(['notes = {"dau": 2, "cuoi": 7}', 'for k in notes:', '    march_note(notes[k], 3, 4)', 'forward(2)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Ngân một nhịp: đá 3 vạch chưa vỡ', baiLam: bai(['notes = {"dau": 2, "cuoi": 7}', 'for k in notes:', '    march_note(notes[k], 1, hear())', 'forward(2)']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 11, nhip: 16 },
      goiY: [
        'Luna: Số bước tới đá kế tiếp là hear().',
        'Luna: for k in notes: march_note(notes[k], 3, hear()). Rồi forward(2).'
      ]
    }),

    manCheNgan(5, 'luyen', {
      ten: 'Sổ số vạch',
      hamCuaEmCan: ['move', 'crack_glide'],
      khoaTD: ['dau', 'giua', 'cuoi'],
      duLieuSan: ['ben = {"dau": 2, "cuoi": 4}', 'ben = {"dau": 3, "giua": 1, "cuoi": 2}'],
      deBai: 'Giúp Sola với! Đá chuông ở góc xoắn ốc cùng nốt 5, nhưng số vạch khác nhau. Sổ ben ghi số vạch từng đá theo thứ tự. Mỗi hầm một sổ.',
      veMaMau: 'Sola ngân 2 nhịp ở mọi đá. Chạy thử: đá 4 vạch chưa vỡ.',
      san: [
        [
          '#########',
          '#.IIIIII#',
          '#######I#',
          '#######I#',
          '######FI#',
          '#########'
        ],
        [
          '########',
          '#.IIIII#',
          '######I#',
          '##F###I#',
          '##IIIII#',
          '########'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      daChuong: [[da(2, 1, 5, 2), da(7, 2, 5, 4)], [da(2, 1, 5, 3), da(6, 2, 5, 1), da(5, 4, 5, 2)]],
      maMau: bai(['ben = {"dau": 2, "cuoi": 4}', 'for k in ben:', '    crack_glide(5, 2)', 'move()']),
      loiGiai: bai(['ben = {"dau": 2, "cuoi": 4}', 'for k in ben:', '    crack_glide(5, ben[k])', 'move()']),
      loiSai: [
        { moTa: 'Ngân 2 nhịp ở mọi đá: đá 4 vạch chưa vỡ', baiLam: bai(['ben = {"dau": 2, "cuoi": 4}', 'for k in ben:', '    crack_glide(5, 2)', 'move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đảo hai số: ngân nốt ben[k] chứ không phải nốt 5', baiLam: bai(['ben = {"dau": 2, "cuoi": 4}', 'for k in ben:', '    crack_glide(ben[k], 5)', 'move()']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 16, nhip: 13 },
      goiY: [
        'Luna: crack_glide(n, k): n là nốt, k là số nhịp ngân.',
        'Luna: crack_glide(5, ben[k]).'
      ]
    }),

    manCheNgan(6, 'luyen', {
      ten: 'Sửa hàm ngân rồi lướt',
      suaHam: ['crack_glide'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'glide_step', 'crack_glide'],
      deBai: 'Giúp Sola với! Ai đó xoá mất wait() trong crack_glide(n, k): R1 chưa ngân xong đã lướt. Sửa lại hàm. Chương trình chính đã khoá.',
      veMaMau: 'Mở crack_glide trong Xưởng hàm. Chạy thử: R1 lướt khi đá chưa vỡ.',
      san: [
        [
          '########',
          '#.IIIII#',
          '######I#',
          '#F####I#',
          '#IIIIII#',
          '########'
        ],
        [
          '#######',
          '#.IIII#',
          '#####I#',
          '#####I#',
          '#F###I#',
          '#IIIII#',
          '#######'
        ]
      ],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      daChuong: [[da(2, 1, 6, 3), da(6, 2, 2, 2), da(5, 4, 8, 3)], [da(2, 1, 6, 3), da(5, 2, 2, 2), da(4, 5, 8, 3)]],
      maMau: bai(['crack_glide(6, 3)', 'crack_glide(2, 2)', 'crack_glide(8, 3)', 'move()'], [], [ham('crack_glide', ['note(n, k)', 'glide_step()'], ['n', 'k'])]),
      loiGiai: bai(['crack_glide(6, 3)', 'crack_glide(2, 2)', 'crack_glide(8, 3)', 'move()'], [], [CRACK_GLIDE]),
      loiSai: [
        { moTa: 'Không sửa: R1 lướt khi đá chưa vỡ', baiLam: bai(['crack_glide(6, 3)', 'crack_glide(2, 2)', 'crack_glide(8, 3)', 'move()']), hamCuaEmMoi: [ham('crack_glide', ['note(n, k)', 'glide_step()'], ['n', 'k'])], phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Sửa thành note(n): đá 3 vạch chưa vỡ', baiLam: bai(['crack_glide(6, 3)', 'crack_glide(2, 2)', 'crack_glide(8, 3)', 'move()']), hamCuaEmMoi: [ham('crack_glide', ['note(n)', 'wait()', 'glide_step()'], ['n', 'k'])], phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 16, nhip: 15 },
      goiY: [
        'Luna: Sau note(n, k) phải có wait() thì R1 mới đứng ngân.',
        'Luna: note(n, k), wait(), glide_step().'
      ]
    }),

    manCheNgan(7, 'bien-the', {
      ten: 'Chế lệnh: ngân một lần',
      taoHam: ['long_once'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'turn_right', 'glide_tunnel'],
      nhipToiDa: 12,
      deBai: 'Giúp Sola với! Nước ngầm dâng, chỉ còn 12 nhịp. Đá tầng dưới cách R1 đúng 3 ô nên cũng nghe tiếng ngân: hai tầng liền nhau cùng nốt thì một lần ngân vỡ cả hai. Chế hàm long_once(n, k, s): nốt n chưa có trong túi s thì thêm vào túi, đứng ngân k nhịp. Chương trình chính đã khoá.',
      veMaMau: 'Chương trình chính gọi long_once ba lần. Mở Xưởng hàm, chế long_once(n, k, s).',
      san: [T7A.san, T7B.san],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      ngachHang: [T7A.ngachHang, T7B.ngachHang],
      daChuong: [voiDa(T7A, [5, 3, 3], 2), voiDa(T7B, [5, 3, 3], 2)],
      maMau: bai(['s = set()', 'long_once(5, 2, s)', 'glide_tunnel()', 'long_once(3, 2, s)', 'glide_tunnel()', 'long_once(3, 2, s)', 'glide_tunnel()', 'turn_right()', 'move()']),
      loiGiai: bai(['s = set()', 'long_once(5, 2, s)', 'glide_tunnel()', 'long_once(3, 2, s)', 'glide_tunnel()', 'long_once(3, 2, s)', 'glide_tunnel()', 'turn_right()', 'move()'], [], [LONG_ONCE]),
      loiSai: [
        { moTa: 'Chưa chế hàm long_once', baiLam: bai(['s = set()', 'long_once(5, 2, s)', 'glide_tunnel()', 'long_once(3, 2, s)', 'glide_tunnel()', 'long_once(3, 2, s)', 'glide_tunnel()', 'turn_right()', 'move()']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Thân hàm quên s.add(n): tầng cuối ngân lại, quá 12 nhịp', baiLam: bai(['s = set()', 'long_once(5, 2, s)', 'glide_tunnel()', 'long_once(3, 2, s)', 'glide_tunnel()', 'long_once(3, 2, s)', 'glide_tunnel()', 'turn_right()', 'move()']), hamCuaEmMoi: [ham('long_once', ['if n not in s:', '    note(n, k)', '    wait()'], ['n', 'k', 's'])], phaiCoMa: ['qua-nhieu-nhip'] }
      ],
      sao: { o: 22, nhip: 12 },
      goiY: [
        'Luna: Giống ring_once(n, s), nhưng ngân k nhịp: note(n, k) rồi wait().',
        'Luna: if n not in s:, rồi thụt vào s.add(n), note(n, k), wait().'
      ]
    }),

    manCheNgan(8, 'bien-the', {
      ten: 'Tầng đá theo sổ, không ngân trùng',
      hamCuaEmCan: ['move', 'turn_right', 'glide_tunnel', 'long_once'],
      khoaTD: ['dau', 'giua', 'cuoi'],
      duLieuSan: ['notes = {"dau": 4, "giua": 6, "cuoi": 6}', 'notes = {"dau": 7, "giua": 2, "cuoi": 2}'],
      nhipToiDa: 12,
      deBai: 'Giúp Sola với! Sổ notes ghi nốt đá từng tầng, từ trên xuống, mỗi đá 2 vạch. Mỗi hầm một sổ. Chỉ còn 12 nhịp: nốt nào đã ngân thì không ngân lại. Tầng cuối có hố phía trước, cờ ở bên phải.',
      veMaMau: 'Sola ngân mọi tầng. Chạy thử: hết nhịp.',
      san: [T8A.san, T8B.san],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      ngachHang: [T8A.ngachHang, T8B.ngachHang],
      daChuong: [voiDa(T8A, [4, 6, 6], 2), voiDa(T8B, [7, 2, 2], 2)],
      maMau: bai(['notes = {"dau": 4, "giua": 6, "cuoi": 6}', 'for k in notes:', '    note(notes[k], 2)', '    wait()', '    glide_tunnel()', 'turn_right()', 'move()']),
      loiGiai: bai(['notes = {"dau": 4, "giua": 6, "cuoi": 6}', 's = set()', 'for k in notes:', '    long_once(notes[k], 2, s)', '    glide_tunnel()', 'turn_right()', 'move()']),
      loiSai: [
        { moTa: 'Ngân mọi tầng: quá 12 nhịp', baiLam: bai(['notes = {"dau": 4, "giua": 6, "cuoi": 6}', 'for k in notes:', '    note(notes[k], 2)', '    wait()', '    glide_tunnel()', 'turn_right()', 'move()']), phaiCoMa: ['qua-nhieu-nhip'] },
        { moTa: 'Quên s = set(): chưa có túi s nên chương trình dừng', baiLam: bai(['notes = {"dau": 4, "giua": 6, "cuoi": 6}', 'for k in notes:', '    long_once(notes[k], 2, s)', '    glide_tunnel()', 'turn_right()', 'move()']), phaiCoMa: ['loi-chay'] }
      ],
      sao: { o: 20, nhip: 12 },
      goiY: [
        'Luna: s = set() ngay sau sổ.',
        'Luna: for k in notes: long_once(notes[k], 2, s) rồi glide_tunnel().'
      ]
    }),

    manCheNgan(9, 'bien-the', {
      ten: 'Ngân tới khi hết đá',
      hamCuaEmCan: ['move', 'crack_glide'],
      deBai: 'Giúp Sola với! Mỗi góc xoắn ốc có đá chuông nốt 4, 2 vạch, đá này chỉ vang khẽ, đứng sát mới nghe. Còn nghe đá thì còn ngân rồi lướt. Hết đá thì bước vào cờ. Hai hầm số góc khác nhau.',
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
      daChuong: [[daK(2, 1, 4, 2), daK(6, 2, 4, 2)], [daK(2, 1, 4, 2), daK(5, 2, 4, 2), daK(4, 4, 4, 2)]],
      maMau: bai(['for i in range(2):', '    crack_glide(4, 2)', 'move()']),
      loiGiai: bai(['while hear() > 0:', '    crack_glide(4, 2)', 'move()']),
      loiSai: [
        { moTa: 'Đếm góc hầm 1: hầm 2 còn một đá', baiLam: bai(['for i in range(2):', '    crack_glide(4, 2)', 'move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'while hear() == 0: vòng lặp không chạy, R1 đâm đá', baiLam: bai(['while hear() == 0:', '    crack_glide(4, 2)', 'move()']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 15, nhip: 13 },
      goiY: [
        'Luna: Đá chưa vỡ còn vang. while hear() > 0: crack_glide(4, 2).',
        'Luna: Ra ngoài vòng lặp: move().'
      ]
    }),

    manCheNgan(10, 'tong-hop', {
      ten: 'Trùm: tầng đá ngân và xoắn ốc',
      hamCuaEmCan: ['move', 'glide_tunnel', 'crack_glide', 'long_once'],
      khoaTD: ['dau', 'giua', 'cuoi'],
      duLieuSan: ['notes = {"dau": 4, "giua": 6}', 'notes = {"dau": 7, "giua": 2, "cuoi": 2}'],
      deBai: 'Giúp Sola với! Qua các tầng đá theo sổ notes như màn trước, mỗi đá 2 vạch, không ngân trùng. Ra khỏi tầng cuối là xoắn ốc: góc nào cũng có đá chuông nốt 5, 2 vạch, vang khẽ. Hết đá thì bước vào cờ.',
      veMaMau: 'Sola đếm góc xoắn ốc của hầm 1. Chạy thử: hầm 2 nhiều góc hơn.',
      san: [T10A.san, T10B.san],
      batDau: hai({ x: 1, y: 1, huong: 1 }),
      ngachHang: [T10A.ngachHang, T10B.ngachHang],
      daChuong: [
        voiDa(T10A, [4, 6], 2).concat([daK(3, 5, 5, 2), daK(7, 6, 5, 2)]),
        voiDa(T10B, [7, 2, 2], 2).concat([daK(3, 7, 5, 2), daK(6, 8, 5, 2), daK(5, 10, 5, 2)])
      ],
      maMau: bai(['notes = {"dau": 4, "giua": 6}', 's = set()', 'for k in notes:', '    long_once(notes[k], 2, s)', '    glide_tunnel()', 'for i in range(2):', '    crack_glide(5, 2)', 'move()']),
      loiGiai: bai(['notes = {"dau": 4, "giua": 6}', 's = set()', 'for k in notes:', '    long_once(notes[k], 2, s)', '    glide_tunnel()', 'while hear() > 0:', '    crack_glide(5, 2)', 'move()']),
      loiSai: [
        { moTa: 'Đếm góc hầm 1: hầm 2 còn một đá', baiLam: bai(['notes = {"dau": 4, "giua": 6}', 's = set()', 'for k in notes:', '    long_once(notes[k], 2, s)', '    glide_tunnel()', 'for i in range(2):', '    crack_glide(5, 2)', 'move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên s = set(): chưa có túi s nên chương trình dừng', baiLam: bai(['notes = {"dau": 4, "giua": 6}', 'for k in notes:', '    long_once(notes[k], 2, s)', '    glide_tunnel()', 'while hear() > 0:', '    crack_glide(5, 2)', 'move()']), phaiCoMa: ['loi-chay'] }
      ],
      sao: { o: 28, nhip: 23 },
      goiY: [
        'Luna: Phần tầng giống màn "Tầng đá theo sổ, không ngân trùng".',
        'Luna: Rồi while hear() > 0: crack_glide(5, 2), và move().'
      ]
    })
  ];

  if (M && M.them) M.manPhatNot = DS;
  if (typeof module !== 'undefined' && module.exports) module.exports = M;
})();
