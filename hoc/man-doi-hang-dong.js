/* ============================================================================
   man-doi-hang-dong.js — Mùa 8 Hang động · Gói 9: Đội thám hiểm hang (mã gói doi-hang-dong; viết lại 16/11, KE-HOACH-MUA-8.md)
   Chương 1: doi-hang-dong "Lấp hố, phá đá cho nhau" (10 màn): R1 của Sola (bánh gai, loa, mic) đi cùng R2 của Luna,
             máy mỏ đá từ mùa Mỏ đá (bánh omni, tay ném, radar). R2 hất đá lấp hố hay đè nút mở cổng cho R1;
             R1 gõ đúng nốt làm vỡ đá chuông chắn đường R2.
   Chương 2: che-doi-hang-dong "Chế lệnh: cùng vượt hang" (10 màn): fill_for_mate(k), crack_for_mate() (mùa 9 gọi: giữ tên và thân),
             ring_for_mate(k).
   Đội: mỗi robot một chương trình; hàm của em dùng chung. R2 không có diag_*: đi chéo bằng dir_*() đã chế ở Mỏ đá.
   Lời: "Giúp Sola với!", gợi ý của Luna, gọi người chơi là "bạn".
   ========================================================================== */
(function () {
  'use strict';

  var M = (typeof window !== 'undefined' && window.ManHoc) ||
    (typeof require === 'function' ? require('./man-chuoi-1.js') : null);

  var CAU_TRUC = ['for', 'while', 'if', 'else', 'dict', 'set'];
  var GOC_R1 = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'note', 'beat', 'hear', 'listen', 'retract_spikes', 'extend_spikes'];
  var GOC_R2 = ['left_move', 'right_move', 'left_back', 'right_back', 'slide_left', 'slide_right', 'wait', 'load', 'throw', 'radar', 'aim'];
  var ROBOT_R1 = { than: 'gai', tay: 'loa', camBien: [{ ma: 'am-thanh', o: 'tren', phanAm: true }] };
  var ROBOT_R2 = { than: 'omni', tay: 'nem', camBien: [{ ma: 'radar', o: 'tren' }], son: 'lam' };

  function ham(ten, than, thamSo) {
    return { ten: ten, than: than, thamSo: thamSo || [] };
  }
  /** Bài của đội: c1 cho R1, c2 cho R2, moi = hàm của em (chế / sửa ở màn này). */
  function doi(c1, c2, moi) {
    return { doi: [{ chinh: c1.slice() }, { chinh: c2.slice() }], hamCuaMan: [], hamCuaEmMoi: moi || [] };
  }
  function cd(x, y, not, phamVi) { return phamVi ? { x: x, y: y, not: not, phamVi: phamVi } : { x: x, y: y, not: not }; }
  function da(x, y, not, ben) { return { x: x, y: y, not: not, ben: ben || 1 }; }
  function hai(a) { return [a, a]; }

  function taoR1(bd) {
    return { batDau: bd, loaiRobot: 'gai', thuGai: true, phatNot: true, phanAm: true, robot: ROBOT_R1, hamGoc: GOC_R1.slice() };
  }
  function taoR2(bd) {
    return {
      batDau: bd, loaiRobot: 'omni', omniCheo: true, cheoGhep: true, chinhLuc: true,
      tamNemMacDinh: 2, daLapHo: true, robot: ROBOT_R2, hamGoc: GOC_R2.slice()
    };
  }

  /** d.bd = [R1, R2] (một sân: ô; nhiều sân: [[R1 từng sân], [R2 từng sân]]); d.khoa = 0 / 1 / [0, 1]: khoá chương trình robot đó. */
  function manDoi(chuong, so, hang, d) {
    var nhieuSan = Array.isArray(d.san && d.san[0]);
    var r1 = taoR1(d.bd[0]), r2 = taoR2(d.bd[1]);
    [].concat(d.khoa === undefined ? [] : d.khoa).forEach(function (k) { (k === 0 ? r1 : r2).coDinh = true; });
    var kq = Object.assign({
      chuong: chuong, so: so, hang: hang,
      vo: 'hang', loaiRobot: 'gai', thuGai: true, phatNot: true, phanAm: true,
      omniCheo: true, chinhLuc: true, tamNemMacDinh: 2, daLapHo: true,
      robot: ROBOT_R1,
      batDau: d.bd[0],
      doi: [r1, r2],
      hamGoc: GOC_R1.slice(),
      hamCuaEmCan: [],
      taoHam: [],
      cauTruc: CAU_TRUC.slice(),
      khung: { chinh: 10, moiHam: 8, cauTruc: CAU_TRUC.slice() },
      mucTieu: 'toi-co',
      nhipTheo: nhieuSan ? 'tong' : undefined
    }, d);
    delete kq.bd;
    delete kq.khoa;
    return kq;
  }
  function manDH(so, hang, d) { return manDoi('doi-hang-dong', so, hang, d); }
  function manCheDH(so, hang, d) { return manDoi('che-doi-hang-dong', so, hang, d); }

  var FILL_FOR_MATE = ham('fill_for_mate', ['aim_lob(k)', 'slide_r(1)'], ['k']);
  var CRACK_FOR_MATE = ham('crack_for_mate', ['go_echo()', 'play_note(listen())', 'move()']);
  var RING_FOR_MATE = ham('ring_for_mate', ['go_echo()', 'ring_gate(listen(), k)'], ['k']);

  var DS = [
    /* ========================================================================
       CHƯƠNG 1: doi-hang-dong — Lấp hố, phá đá cho nhau
       ====================================================================== */
    manDH(1, 'lam-quen', {
      ten: 'R2 lấp hố cho R1',
      chiChay: true, chinhCoDinh: true, khoa: [0, 1],
      hamCuaEmCan: ['forward', 'wait_n', 'lob', 'slide_r'],
      deBai: 'Sola làm mẫu. Luna mang R2, máy mỏ đá ở Mỏ đá, vào hang. Hố u chắn đường R1. R2 hất hòn đá o lấp hố, R1 chờ rồi đi qua. Bấm Chạy để xem.',
      veMaMau: 'Hai chương trình đã khoá. R2: lob(), slide_r(1). R1: chờ 2 nhịp rồi đi 3 ô.',
      san: ['######', '#.uIF#', '##o###', '#..F##', '######'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 3, huong: 0 }],
      maMau: doi(['wait_n(2)', 'forward(3)'], ['lob()', 'slide_r(1)']),
      loiGiai: doi(['wait_n(2)', 'forward(3)'], ['lob()', 'slide_r(1)']),
      sao: { o: 18, nhip: 5 },
      goiY: [
        'Luna: lob() hất đá xa 2 ô, rơi vào hố là lấp hố.',
        'Luna: R1 chờ 2 nhịp cho đá rơi xong.'
      ]
    }),

    manDH(2, 'lam-quen', {
      ten: 'Hất đá đè nút',
      khoa: 0,
      hamCuaEmCan: ['forward', 'wait_n', 'aim_lob', 'slide_r'],
      deBai: 'Giúp Sola với! Cổng C chắn R1, nút M mở cổng ở xa R2 3 ô, giữa là rào =. Sửa chương trình R2 cho đá rơi đúng nút, rồi R2 trượt về cờ. Chương trình R1 đã khoá.',
      veMaMau: 'R2 đang hất xa 2 ô. Chạy thử: đá rơi vào rào.',
      san: ['######', '#.ICF#', '##M###', '##=###', '##o###', '#..F##', '######'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 5, huong: 0 }],
      noi: [{ nut: { x: 2, y: 2 }, cua: [{ x: 3, y: 1 }] }],
      maMau: doi(['wait_n(2)', 'forward(3)'], ['aim_lob(2)', 'slide_r(1)']),
      loiGiai: doi(['wait_n(2)', 'forward(3)'], ['aim_lob(3)', 'slide_r(1)']),
      loiSai: [
        { moTa: 'Hất xa 2 ô: đá rơi vào rào', baiLam: doi(['wait_n(2)', 'forward(3)'], ['aim_lob(2)', 'slide_r(1)']), phaiCoMa: ['nem-vo'] },
        { moTa: 'Quên trượt về cờ: R2 đứng yên', baiLam: doi(['wait_n(2)', 'forward(3)'], ['aim_lob(3)']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 31, nhip: 5 },
      goiY: [
        'Luna: aim_lob(3) hất xa 3 ô.',
        'Luna: Đá trên nút thì cổng mở.'
      ]
    }),

    manDH(3, 'lam-quen', {
      ten: 'R1 gõ vỡ đá cho R2',
      khoa: 1,
      hamCuaEmCan: ['move', 'forward', 'go_echo', 'play_note', 'wait_n'],
      deBai: 'Giúp Sola với! Đá chuông chắn đường R2. R1 đi tới chuông treo trên đường mình, nghe nốt rồi gõ: đá ngay bên dưới cùng nốt sẽ vỡ. Rồi R1 vào cờ. Chương trình R2 đã khoá.',
      veMaMau: 'R1 chưa gõ. Chạy thử: R2 đâm vào đá.',
      san: [
        ['#######', '#.I.F##', '#######', '#....F#', '#######'],
        ['########', '#.II.F##', '########', '#.....F#', '########']
      ],
      bd: [[{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }], [{ x: 1, y: 3, huong: 1 }, { x: 1, y: 3, huong: 1 }]],
      chuongDa: [[cd(3, 1, 4)], [cd(4, 1, 7)]],
      daChuong: [[da(3, 3, 4)], [da(4, 3, 7)]],
      maMau: doi(['go_echo()', 'move()'], ['wait_n(4)', 'forward(5)']),
      loiGiai: doi(['go_echo()', 'play_note(listen())', 'move()'], ['wait_n(4)', 'forward(5)']),
      loiSai: [
        { moTa: 'Không gõ: R2 đâm vào đá', baiLam: doi(['go_echo()', 'move()'], ['wait_n(4)', 'forward(5)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Luôn gõ nốt 4: đá hầm 2 nốt 7 không vỡ', baiLam: doi(['go_echo()', 'play_note(4)', 'move()'], ['wait_n(4)', 'forward(5)']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 15, nhip: 17 },
      goiY: [
        'Luna: go_echo() đưa R1 tới chuông.',
        'Luna: play_note(listen()) gõ đúng nốt.'
      ]
    }),

    manDH(4, 'luyen', {
      ten: 'Chờ lấp hố rồi lướt',
      hamCuaEmCan: ['move', 'wait_n', 'slide_stop', 'lob', 'slide_r'],
      deBai: 'Giúp Sola với! Dải đá ướt dẫn thẳng vào hố. R2 phải hất đá lấp hố trước, R1 mới lướt. Lướt dừng ở hố đã lấp.',
      veMaMau: 'R1 lướt ngay. Chạy thử: R1 rơi xuống hố.',
      san: ['#######', '#.Iu.F#', '###o###', '###.F##', '#######'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 3, y: 3, huong: 0 }],
      maMau: doi(['slide_stop()', 'move()'], ['lob()', 'slide_r(1)']),
      loiGiai: doi(['wait_n(2)', 'slide_stop()', 'move()'], ['lob()', 'slide_r(1)']),
      loiSai: [
        { moTa: 'Lướt ngay: R1 rơi xuống hố', baiLam: doi(['slide_stop()', 'move()'], ['lob()', 'slide_r(1)']), phaiCoMa: ['roi-ho'] },
        { moTa: 'R2 chưa hất đá: hố còn nguyên', baiLam: doi(['wait_n(2)', 'slide_stop()', 'move()'], ['slide_r(1)']), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 21, nhip: 5 },
      goiY: [
        'Luna: wait_n(2) chờ đá rơi.',
        'Luna: Rồi slide_stop(), move().'
      ]
    }),

    manDH(5, 'luyen', {
      ten: 'Ngân 2 nhịp phá đá cho R2',
      hamCuaEmCan: ['move', 'forward', 'go_echo', 'ring_gate', 'wait_n'],
      deBai: 'Giúp Sola với! Đá chuông chắn R2 có 2 vạch: phải ngân 2 nhịp mới vỡ. R1 đi tới chuông, nghe nốt, ngân 2 nhịp rồi bước vào cờ. R2 chờ đá vỡ rồi đi tới cờ.',
      veMaMau: 'R1 gõ một nhịp. Chạy thử: đá chỉ nứt.',
      san: [
        ['#######', '#.I.F##', '#######', '#....F#', '#######'],
        ['########', '#.II.F##', '########', '#.....F#', '########']
      ],
      bd: [[{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }], [{ x: 1, y: 3, huong: 1 }, { x: 1, y: 3, huong: 1 }]],
      chuongDa: [[cd(3, 1, 6)], [cd(4, 1, 2)]],
      daChuong: [[da(3, 3, 6, 2)], [da(4, 3, 2, 2)]],
      maMau: doi(['go_echo()', 'play_note(listen())', 'move()'], ['wait_n(3)', 'forward(5)']),
      loiGiai: doi(['go_echo()', 'ring_gate(listen(), 2)'], ['wait_n(3)', 'forward(5)']),
      loiSai: [
        { moTa: 'Gõ một nhịp: đá 2 vạch chỉ nứt', baiLam: doi(['go_echo()', 'play_note(listen())', 'move()'], ['wait_n(3)', 'forward(5)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'R2 không chờ: tới đá khi đá chưa vỡ', baiLam: doi(['go_echo()', 'ring_gate(listen(), 2)'], ['forward(5)']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 15, nhip: 15 },
      goiY: [
        'Luna: ring_gate(listen(), 2) ngân 2 nhịp rồi bước.',
        'Luna: R2 wait_n(3) rồi mới đi.'
      ]
    }),

    manDH(6, 'luyen', {
      ten: 'Đổi lượt giúp nhau',
      hamCuaEmCan: ['move', 'wait_n', 'go_echo', 'play_note', 'lob', 'slide_r'],
      deBai: 'Giúp Sola với! Hố chắn R1, đá chuông chắn R2. R2 hất đá lấp hố trước. R1 qua hố, tới chuông thì gõ cho đá của R2 vỡ, rồi vào cờ. R2 chờ rồi trượt sang phải tới cờ.',
      veMaMau: 'Hai robot đi ngay. Chạy thử: R1 rơi hố.',
      san: [
        '#########',
        '#.u..F###',
        '##o######',
        '#......F#',
        '#########'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 3, huong: 0 }],
      chuongDa: [cd(4, 1, 3)],
      daChuong: [da(4, 3, 3)],
      maMau: doi(['go_echo()', 'play_note(listen())', 'move()'], ['lob()', 'slide_r(5)']),
      loiGiai: doi(['wait_n(2)', 'go_echo()', 'play_note(listen())', 'move()'], ['lob()', 'wait_n(4)', 'slide_r(5)']),
      loiSai: [
        { moTa: 'R1 đi ngay: rơi xuống hố', baiLam: doi(['go_echo()', 'play_note(listen())', 'move()'], ['lob()', 'wait_n(4)', 'slide_r(5)']), phaiCoMa: ['roi-ho'] },
        { moTa: 'R2 trượt ngay sau khi hất: đâm vào đá', baiLam: doi(['wait_n(2)', 'go_echo()', 'play_note(listen())', 'move()'], ['lob()', 'slide_r(5)']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 24, nhip: 11 },
      goiY: [
        'Luna: R1 wait_n(2) chờ đá lấp hố.',
        'Luna: R2 chờ R1 gõ xong rồi mới trượt.'
      ]
    }),

    manDH(7, 'bien-the', {
      ten: 'Mỗi nốt gõ một lần',
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'listen_unique_step'],
      nhipToiDa: 7,
      deBai: 'Giúp Sola với! Bốn ô đầu đường R1 treo chuông, có nốt trùng. Đá chuông chắn R2 nằm ngay dưới. Gõ mỗi nốt một lần là đủ phá đá. Chỉ còn 7 nhịp.',
      veMaMau: 'R1 gõ ở mọi chuông. Chạy thử: hết nhịp.',
      san: [
        '########',
        '#....F##',
        '########',
        '#.....F#',
        '########'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 3, huong: 1 }],
      chuongDa: [cd(1, 1, 2), cd(2, 1, 7), cd(3, 1, 7), cd(4, 1, 2)],
      daChuong: [da(2, 3, 2), da(3, 3, 7)],
      maMau: doi(['for i in range(4):', '    play_note(listen())', '    move()'], ['wait_n(2)', 'forward(5)']),
      loiGiai: doi(['s = set()', 'for i in range(4):', '    listen_unique_step(s)'], ['wait_n(2)', 'forward(5)']),
      loiSai: [
        { moTa: 'Gõ ở mọi chuông: quá 7 nhịp', baiLam: doi(['for i in range(4):', '    play_note(listen())', '    move()'], ['wait_n(2)', 'forward(5)']), phaiCoMa: ['qua-nhieu-nhip'] },
        { moTa: 'R2 không chờ: đâm vào đá nốt 7', baiLam: doi(['s = set()', 'for i in range(4):', '    listen_unique_step(s)'], ['forward(5)']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 19, nhip: 7 },
      goiY: [
        'Luna: s = set(), rồi lặp listen_unique_step(s) bốn lần.',
        'Luna: R2 chờ 2 nhịp cho đá nốt 7 vỡ.'
      ]
    }),

    manDH(8, 'bien-the', {
      ten: 'Bàn xoay và cổng nút',
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'aim_lob', 'slide_r'],
      deBai: 'Giúp Sola với! R1 lướt lên bàn xoay @ thì bị quay xuống, ngay dưới là cổng C. Nút M mở cổng ở xa R2 3 ô, qua rào. R2 hất đá lên nút rồi trượt về cờ. R1 chờ cổng mở.',
      veMaMau: 'R2 hất xa 2 ô. Chạy thử: đá rơi vào rào.',
      san: [
        '#######',
        '#.III@#',
        '##M##C#',
        '##=##F#',
        '##o####',
        '#..F###',
        '#######'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 5, huong: 0 }],
      noi: [{ nut: { x: 2, y: 2 }, cua: [{ x: 5, y: 2 }] }],
      maMau: doi(['retract_spikes()', 'move()', 'extend_spikes()', 'forward(2)'], ['aim_lob(2)', 'slide_r(1)']),
      loiGiai: doi(['wait_n(1)', 'retract_spikes()', 'move()', 'extend_spikes()', 'forward(2)'], ['aim_lob(3)', 'slide_r(1)']),
      loiSai: [
        { moTa: 'R2 hất xa 2 ô: cổng không mở', baiLam: doi(['wait_n(1)', 'retract_spikes()', 'move()', 'extend_spikes()', 'forward(2)'], ['aim_lob(2)', 'slide_r(1)']), phaiCoMa: ['nem-vo'] },
        { moTa: 'R1 không chờ: tới cổng khi cổng còn đóng', baiLam: doi(['retract_spikes()', 'move()', 'extend_spikes()', 'forward(2)'], ['aim_lob(3)', 'slide_r(1)']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 34, nhip: 4 },
      goiY: [
        'Luna: R2 aim_lob(3).',
        'Luna: Bàn xoay tự quay R1, không cần rẽ.'
      ]
    }),

    manDH(9, 'bien-the', {
      ten: 'Sổ ám hiệu cho đá của R2',
      hamCuaEmCan: ['move', 'forward', 'go_echo', 'play_note', 'wait_n'],
      khoaTD: ['2', '4'],
      deBai: 'Giúp Sola với! Chuông trên đường R1 không cùng nốt với đá chắn R2. Sổ d ghi: chuông nốt 2 thì đá nốt 5, chuông nốt 4 thì đá nốt 7. R1 tới chuông, nghe nốt, tra sổ rồi gõ. Mỗi hầm chuông khác.',
      veMaMau: 'R1 gõ nốt chuông. Chạy thử: đá không vỡ.',
      san: [
        ['#######', '#.I.F##', '#######', '#....F#', '#######'],
        ['#######', '#..IF##', '#######', '#....F#', '#######']
      ],
      bd: [hai({ x: 1, y: 1, huong: 1 }), hai({ x: 1, y: 3, huong: 1 })],
      chuongDa: [[cd(3, 1, 2)], [cd(3, 1, 4)]],
      daChuong: [[da(3, 3, 5)], [da(3, 3, 7)]],
      maMau: doi(['d = {2: 5, 4: 7}', 'go_echo()', 'play_note(listen())', 'move()'], ['wait_n(3)', 'forward(4)']),
      loiGiai: doi(['d = {2: 5, 4: 7}', 'go_echo()', 'n = listen()', 'play_note(d[n])', 'move()'], ['wait_n(3)', 'forward(4)']),
      loiSai: [
        { moTa: 'Gõ nốt chuông: đá không vỡ', baiLam: doi(['d = {2: 5, 4: 7}', 'go_echo()', 'play_note(listen())', 'move()'], ['wait_n(3)', 'forward(4)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Luôn gõ nốt 5: đá hầm 2 không vỡ', baiLam: doi(['d = {2: 5, 4: 7}', 'go_echo()', 'play_note(5)', 'move()'], ['wait_n(3)', 'forward(4)']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 17, nhip: 14 },
      goiY: [
        'Luna: n = listen(), rồi play_note(d[n]).',
        'Luna: Giống màn sổ ám hiệu ở gói Nghe nốt.'
      ]
    }),

    manDH(10, 'trum', {
      ten: 'Trùm: cùng qua hang',
      hamCuaEmCan: ['move', 'wait_n', 'slide_stop', 'go_echo', 'play_note', 'lob', 'slide_r'],
      deBai: 'Giúp Sola với! R2 hất đá lấp hố trên dải đá ướt. R1 chờ rồi lướt, dừng ở hố đã lấp. Rồi R1 đi theo tiếng chuông, gõ vỡ đá chắn R2 và vào cờ. R2 chờ đá vỡ rồi trượt tới cờ. Hai hầm chuông và đá ở chỗ khác nhau.',
      veMaMau: 'Sola chưa viết gì cho R2. Chạy thử.',
      san: [
        ['#########', '#.Iu..F##', '###o#####', '#......F#', '#########'],
        ['#########', '#.Iu...F#', '###o#####', '#......F#', '#########']
      ],
      bd: [hai({ x: 1, y: 1, huong: 1 }), hai({ x: 3, y: 3, huong: 0 })],
      chuongDa: [[cd(5, 1, 3)], [cd(6, 1, 6)]],
      daChuong: [[da(5, 3, 3)], [da(6, 3, 6)]],
      maMau: doi(['wait_n(2)', 'slide_stop()', 'go_echo()', 'move()'], []),
      loiGiai: doi(['wait_n(2)', 'slide_stop()', 'go_echo()', 'play_note(listen())', 'move()'], ['lob()', 'wait_n(4)', 'slide_r(4)']),
      loiSai: [
        { moTa: 'R1 lướt ngay: rơi xuống hố', baiLam: doi(['slide_stop()', 'go_echo()', 'play_note(listen())', 'move()'], ['lob()', 'wait_n(4)', 'slide_r(4)']), phaiCoMa: ['roi-ho'] },
        { moTa: 'R1 luôn gõ nốt 3: đá hầm 2 không vỡ', baiLam: doi(['wait_n(2)', 'slide_stop()', 'go_echo()', 'play_note(3)', 'move()'], ['lob()', 'wait_n(4)', 'slide_r(4)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'R2 trượt ngay: đâm vào đá', baiLam: doi(['wait_n(2)', 'slide_stop()', 'go_echo()', 'play_note(listen())', 'move()'], ['lob()', 'slide_r(4)']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 29, nhip: 20 },
      goiY: [
        'Luna: R1: wait_n(2), slide_stop(), go_echo(), play_note(listen()), move().',
        'Luna: R2: lob(), chờ R1 gõ, rồi slide_r(4).'
      ]
    }),

    /* ========================================================================
       CHƯƠNG 2: che-doi-hang-dong — Chế lệnh: cùng vượt hang
       ====================================================================== */
    manCheDH(1, 'lam-quen', {
      ten: 'Chế lệnh: lấp hố giúp bạn',
      taoHam: ['fill_for_mate'], chinhCoDinh: true,
      hamCuaEmCan: ['forward', 'wait_n', 'aim_lob', 'slide_r'],
      deBai: 'Giúp Sola với! Chế hàm fill_for_mate(k) cho R2: hất đá xa k ô, rồi trượt sang phải một ô. Hố của R1 ở xa R2 3 ô, giữa là rào. Hai chương trình chính đã khoá.',
      veMaMau: 'R2 gọi fill_for_mate(3). Mở Xưởng hàm, chế fill_for_mate(k).',
      san: ['######', '#.uIF#', '##=###', '##o###', '#..F##', '######'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 4, huong: 0 }],
      maMau: doi(['wait_n(2)', 'forward(3)'], ['fill_for_mate(3)']),
      loiGiai: doi(['wait_n(2)', 'forward(3)'], ['fill_for_mate(3)'], [FILL_FOR_MATE]),
      loiSai: [
        { moTa: 'Chưa chế hàm fill_for_mate', baiLam: doi(['wait_n(2)', 'forward(3)'], ['fill_for_mate(3)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Thân hàm dùng lob(): đá chỉ bay 2 ô, rơi vào rào', baiLam: doi(['wait_n(2)', 'forward(3)'], ['fill_for_mate(3)'], [ham('fill_for_mate', ['lob()', 'slide_r(1)'], ['k'])]), phaiCoMa: ['nem-vo'] }
      ],
      sao: { o: 32, nhip: 5 },
      goiY: [
        'Luna: Thân hàm: aim_lob(k), slide_r(1).',
        'Luna: k là số ô đá bay.'
      ]
    }),

    manCheDH(2, 'lam-quen', {
      ten: 'Hai hố, hai tầm',
      khoa: 0,
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'turn_left', 'wait_n', 'fill_for_mate'],
      deBai: 'Giúp Sola với! Đường R1 có hai hố: hố đầu xa R2 3 ô, hố sau xa 2 ô. Sau mỗi lần hất, R2 trượt sang phải. Gọi fill_for_mate hai lần cho đúng tầm. Chương trình R1 đã khoá.',
      veMaMau: 'R2 mới lấp hố đầu. Chạy thử: R1 rơi xuống hố sau.',
      san: [
        '#######',
        '#.u.###',
        '##=uF##',
        '##oo###',
        '#...F##',
        '#######'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 4, huong: 0 }],
      maMau: doi(['wait_n(4)', 'forward(2)', 'turn_right()', 'move()', 'turn_left()', 'move()'], ['fill_for_mate(3)']),
      loiGiai: doi(['wait_n(4)', 'forward(2)', 'turn_right()', 'move()', 'turn_left()', 'move()'], ['fill_for_mate(3)', 'fill_for_mate(2)']),
      loiSai: [
        { moTa: 'Chỉ lấp hố đầu: R1 rơi xuống hố sau', baiLam: doi(['wait_n(4)', 'forward(2)', 'turn_right()', 'move()', 'turn_left()', 'move()'], ['fill_for_mate(3)']), phaiCoMa: ['roi-ho'] },
        { moTa: 'Đổi chỗ hai tầm: đá đầu rơi vào rào', baiLam: doi(['wait_n(4)', 'forward(2)', 'turn_right()', 'move()', 'turn_left()', 'move()'], ['fill_for_mate(2)', 'fill_for_mate(3)']), phaiCoMa: ['nem-vo'] }
      ],
      sao: { o: 45, nhip: 10 },
      goiY: [
        'Luna: Hố đầu fill_for_mate(3).',
        'Luna: Hố sau fill_for_mate(2).'
      ]
    }),

    manCheDH(3, 'lam-quen', {
      ten: 'Chế lệnh: phá đá giúp bạn',
      taoHam: ['crack_for_mate'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward', 'go_echo', 'play_note', 'wait_n'],
      deBai: 'Giúp Sola với! Chế hàm crack_for_mate() cho R1: đi theo tiếng chuông, gõ đúng nốt nghe được, rồi bước một ô. Đá chắn R2 nằm ngay dưới chuông. Hai hầm chuông ở chỗ khác nhau. Hai chương trình chính đã khoá.',
      veMaMau: 'R1 gọi crack_for_mate(). Mở Xưởng hàm, chế crack_for_mate().',
      san: [
        ['#######', '#.I.F##', '#######', '#....F#', '#######'],
        ['#######', '#.II.F#', '#######', '#....F#', '#######']
      ],
      bd: [hai({ x: 1, y: 1, huong: 1 }), hai({ x: 1, y: 3, huong: 1 })],
      chuongDa: [[cd(3, 1, 5)], [cd(4, 1, 1)]],
      daChuong: [[da(3, 3, 5)], [da(4, 3, 1)]],
      maMau: doi(['crack_for_mate()'], ['wait_n(2)', 'forward(4)']),
      loiGiai: doi(['crack_for_mate()'], ['wait_n(2)', 'forward(4)'], [CRACK_FOR_MATE]),
      loiSai: [
        { moTa: 'Chưa chế hàm crack_for_mate', baiLam: doi(['crack_for_mate()'], ['wait_n(2)', 'forward(4)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Thân hàm quên gõ: R2 đâm vào đá', baiLam: doi(['crack_for_mate()'], ['wait_n(2)', 'forward(4)'], [ham('crack_for_mate', ['go_echo()', 'move()'])]), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 16, nhip: 12 },
      goiY: [
        'Luna: Thân hàm: go_echo(), play_note(listen()), move().',
        'Luna: Giống màn "R1 gõ vỡ đá cho R2".'
      ]
    }),

    manCheDH(4, 'luyen', {
      ten: 'Lấp hố rồi phá đá',
      hamCuaEmCan: ['move', 'wait_n', 'slide_r', 'fill_for_mate', 'crack_for_mate'],
      deBai: 'Giúp Sola với! R2 hất đá qua rào lấp hố cho R1. R1 chờ rồi phá đá chắn R2. R2 chờ đá vỡ rồi trượt tới cờ. Hai hầm chuông ở chỗ khác nhau.',
      veMaMau: 'R2 trượt ngay sau khi lấp hố. Chạy thử: R2 đâm vào đá.',
      san: [
        ['#########', '#.u..F###', '##=######', '##o######', '#......F#', '#########'],
        ['#########', '#.u...F##', '##=######', '##o######', '#......F#', '#########']
      ],
      bd: [hai({ x: 1, y: 1, huong: 1 }), hai({ x: 2, y: 4, huong: 0 })],
      chuongDa: [[cd(4, 1, 6)], [cd(5, 1, 2)]],
      daChuong: [[da(4, 4, 6)], [da(5, 4, 2)]],
      maMau: doi(['wait_n(2)', 'crack_for_mate()'], ['fill_for_mate(3)', 'slide_r(4)']),
      loiGiai: doi(['wait_n(2)', 'crack_for_mate()'], ['fill_for_mate(3)', 'wait_n(2)', 'slide_r(4)']),
      loiSai: [
        { moTa: 'R2 trượt ngay: đâm vào đá', baiLam: doi(['wait_n(2)', 'crack_for_mate()'], ['fill_for_mate(3)', 'slide_r(4)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'R1 đi ngay: rơi xuống hố', baiLam: doi(['crack_for_mate()'], ['fill_for_mate(3)', 'wait_n(2)', 'slide_r(4)']), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 40, nhip: 20 },
      goiY: [
        'Luna: R1 wait_n(2), crack_for_mate().',
        'Luna: R2 chờ 2 nhịp sau khi lấp hố.'
      ]
    }),

    manCheDH(5, 'luyen', {
      ten: 'Chế lệnh: ngân phá đá giúp bạn',
      taoHam: ['ring_for_mate'], chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward', 'go_echo', 'ring_gate', 'wait_n'],
      deBai: 'Giúp Sola với! Đá chắn R2 có 2 vạch. Chế hàm ring_for_mate(k) cho R1: đi theo tiếng chuông, rồi ngân nốt nghe được k nhịp và bước. Hai chương trình chính đã khoá.',
      veMaMau: 'R1 gọi ring_for_mate(2). Mở Xưởng hàm, chế ring_for_mate(k).',
      san: [
        ['#######', '#..I.F#', '#######', '#....F#', '#######'],
        ['#######', '#.I.F##', '#######', '#....F#', '#######']
      ],
      bd: [hai({ x: 1, y: 1, huong: 1 }), hai({ x: 1, y: 3, huong: 1 })],
      chuongDa: [[cd(4, 1, 8)], [cd(3, 1, 3)]],
      daChuong: [[da(4, 3, 8, 2)], [da(3, 3, 3, 2)]],
      maMau: doi(['ring_for_mate(2)'], ['wait_n(4)', 'forward(4)']),
      loiGiai: doi(['ring_for_mate(2)'], ['wait_n(4)', 'forward(4)'], [RING_FOR_MATE]),
      loiSai: [
        { moTa: 'Chưa chế hàm ring_for_mate', baiLam: doi(['ring_for_mate(2)'], ['wait_n(4)', 'forward(4)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Thân hàm gõ một nhịp: đá 2 vạch chỉ nứt', baiLam: doi(['ring_for_mate(2)'], ['wait_n(4)', 'forward(4)'], [ham('ring_for_mate', ['go_echo()', 'play_note(listen())', 'move()'], ['k'])]), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 16, nhip: 16 },
      goiY: [
        'Luna: Thân hàm: go_echo(), ring_gate(listen(), k).',
        'Luna: ring_gate ngân k nhịp rồi bước.'
      ]
    }),

    manCheDH(6, 'luyen', {
      ten: 'Lướt tới chuông, ngân phá đá',
      hamCuaEmCan: ['move', 'wait_n', 'slide_stop', 'slide_r', 'fill_for_mate', 'ring_for_mate'],
      deBai: 'Giúp Sola với! R2 lấp hố cuối dải đá ướt. R1 chờ, lướt dừng ở hố đã lấp, rồi ngân phá đá 2 vạch chắn R2. R2 chờ đá vỡ rồi trượt tới cờ. Hai hầm chuông ở chỗ khác nhau.',
      veMaMau: 'R2 chờ 2 nhịp. Chạy thử: hầm 1 R2 tới đá sớm.',
      san: [
        ['#########', '#.Iu..F##', '###o#####', '#......F#', '#########'],
        ['#########', '#.Iu...F#', '###o#####', '#......F#', '#########']
      ],
      bd: [hai({ x: 1, y: 1, huong: 1 }), hai({ x: 3, y: 3, huong: 0 })],
      chuongDa: [[cd(5, 1, 4)], [cd(6, 1, 7)]],
      daChuong: [[da(5, 3, 4, 2)], [da(6, 3, 7, 2)]],
      maMau: doi(['wait_n(2)', 'slide_stop()', 'ring_for_mate(2)'], ['fill_for_mate(2)', 'wait_n(2)', 'slide_r(3)']),
      loiGiai: doi(['wait_n(2)', 'slide_stop()', 'ring_for_mate(2)'], ['fill_for_mate(2)', 'wait_n(4)', 'slide_r(3)']),
      loiSai: [
        { moTa: 'R2 chờ 2 nhịp: tới đá khi đá chưa vỡ', baiLam: doi(['wait_n(2)', 'slide_stop()', 'ring_for_mate(2)'], ['fill_for_mate(2)', 'wait_n(2)', 'slide_r(3)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Ngân 1 nhịp: đá 2 vạch chỉ nứt', baiLam: doi(['wait_n(2)', 'slide_stop()', 'ring_for_mate(1)'], ['fill_for_mate(2)', 'wait_n(4)', 'slide_r(3)']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 39, nhip: 20 },
      goiY: [
        'Luna: R1 wait_n(2), slide_stop(), ring_for_mate(2).',
        'Luna: R2 chờ 4 nhịp sau khi lấp hố.'
      ]
    }),

    manCheDH(7, 'bien-the', {
      ten: 'Sửa hàm lấp hố',
      suaHam: ['fill_for_mate'], chinhCoDinh: true,
      hamCuaEmCan: ['forward', 'wait_n', 'aim_lob', 'slide_r', 'fill_for_mate'],
      deBai: 'Giúp Sola với! Ai đó sửa fill_for_mate(k) thành luôn hất xa 2 ô. Hố của R1 xa R2 3 ô, nút M mở cổng C xa 2 ô. Sửa lại hàm. Hai chương trình chính đã khoá.',
      veMaMau: 'Mở fill_for_mate trong Xưởng hàm. Chạy thử: đá đầu rơi vào rào.',
      san: [
        '########',
        '#.u..CF#',
        '##=M####',
        '##oo####',
        '#...F###',
        '########'
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 4, huong: 0 }],
      noi: [{ nut: { x: 3, y: 2 }, cua: [{ x: 5, y: 1 }] }],
      maMau: doi(['wait_n(3)', 'forward(5)'], ['fill_for_mate(3)', 'fill_for_mate(2)'], [ham('fill_for_mate', ['lob()', 'slide_r(1)'], ['k'])]),
      loiGiai: doi(['wait_n(3)', 'forward(5)'], ['fill_for_mate(3)', 'fill_for_mate(2)'], [FILL_FOR_MATE]),
      loiSai: [
        { moTa: 'Không sửa: đá đầu rơi vào rào', baiLam: doi(['wait_n(3)', 'forward(5)'], ['fill_for_mate(3)', 'fill_for_mate(2)'], [ham('fill_for_mate', ['lob()', 'slide_r(1)'], ['k'])]), phaiCoMa: ['nem-vo'] },
        { moTa: 'Quên trượt: lần hai R2 không còn đá trước mặt', baiLam: doi(['wait_n(3)', 'forward(5)'], ['fill_for_mate(3)', 'fill_for_mate(2)'], [ham('fill_for_mate', ['aim_lob(k)'], ['k'])]), phaiCoMa: ['nap-hut'] }
      ],
      sao: { o: 37, nhip: 8 },
      goiY: [
        'Luna: lob() luôn bay 2 ô, aim_lob(k) bay k ô.',
        'Luna: aim_lob(k), slide_r(1).'
      ]
    }),

    manCheDH(8, 'bien-the', {
      ten: 'Sổ ám hiệu và hố',
      hamCuaEmCan: ['move', 'wait_n', 'go_echo', 'play_note', 'slide_r', 'fill_for_mate'],
      khoaTD: ['3', '5'],
      deBai: 'Giúp Sola với! R2 lấp hố cho R1. Chuông trên đường R1 không cùng nốt với đá chắn R2. Sổ d ghi: chuông nốt 3 thì đá nốt 6, chuông nốt 5 thì đá nốt 1. R1 tới chuông, tra sổ rồi gõ. Mỗi hầm chuông khác.',
      veMaMau: 'R1 gõ nốt chuông. Chạy thử: đá không vỡ.',
      san: [
        ['#########', '#.u..F###', '##o######', '#......F#', '#########'],
        ['#########', '#.u...F##', '##o######', '#......F#', '#########']
      ],
      bd: [hai({ x: 1, y: 1, huong: 1 }), hai({ x: 2, y: 3, huong: 0 })],
      chuongDa: [[cd(4, 1, 3)], [cd(5, 1, 5)]],
      daChuong: [[da(4, 3, 6)], [da(5, 3, 1)]],
      maMau: doi(['d = {3: 6, 5: 1}', 'wait_n(2)', 'go_echo()', 'play_note(listen())', 'move()'], ['fill_for_mate(2)', 'wait_n(3)', 'slide_r(4)']),
      loiGiai: doi(['d = {3: 6, 5: 1}', 'wait_n(2)', 'go_echo()', 'n = listen()', 'play_note(d[n])', 'move()'], ['fill_for_mate(2)', 'wait_n(3)', 'slide_r(4)']),
      loiSai: [
        { moTa: 'Gõ nốt chuông: đá không vỡ', baiLam: doi(['d = {3: 6, 5: 1}', 'wait_n(2)', 'go_echo()', 'play_note(listen())', 'move()'], ['fill_for_mate(2)', 'wait_n(3)', 'slide_r(4)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Luôn gõ nốt 6: đá hầm 2 không vỡ', baiLam: doi(['d = {3: 6, 5: 1}', 'wait_n(2)', 'go_echo()', 'play_note(6)', 'move()'], ['fill_for_mate(2)', 'wait_n(3)', 'slide_r(4)']), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 35, nhip: 20 },
      goiY: [
        'Luna: n = listen(), play_note(d[n]).',
        'Luna: R1 wait_n(2) chờ lấp hố trước.'
      ]
    }),

    manCheDH(9, 'bien-the', {
      ten: 'Bàn xoay gõ đá cho bạn',
      hamCuaEmCan: ['move', 'wait_n', 'slide_stop', 'spin_crack', 'slide_r', 'fill_for_mate'],
      deBai: 'Giúp Sola với! R2 lấp hố giữa dải đá ướt. R1 chờ, lướt dừng ở hố đã lấp, rồi lướt tiếp lên bàn xoay và gõ nốt chuông: đá chắn R2 ở ngay dưới. Rồi R1 vào cờ. Hai hầm dải dài khác nhau.',
      veMaMau: 'R2 trượt ngay sau khi lấp hố. Chạy thử: R2 đâm vào đá.',
      san: [
        ['##########', '#.IuII@###', '###o##F###', '#.......F#', '##########'],
        ['##########', '#.IuIII@##', '###o###F##', '#.......F#', '##########']
      ],
      bd: [hai({ x: 1, y: 1, huong: 1 }), hai({ x: 3, y: 3, huong: 0 })],
      chuongDa: [[cd(6, 1, 2)], [cd(7, 1, 5)]],
      daChuong: [[da(6, 3, 2)], [da(7, 3, 5)]],
      maMau: doi(['wait_n(2)', 'slide_stop()', 'spin_crack()', 'move()'], ['fill_for_mate(2)', 'slide_r(4)']),
      loiGiai: doi(['wait_n(2)', 'slide_stop()', 'spin_crack()', 'move()'], ['fill_for_mate(2)', 'wait_n(3)', 'slide_r(4)']),
      loiSai: [
        { moTa: 'R2 trượt ngay: đâm vào đá', baiLam: doi(['wait_n(2)', 'slide_stop()', 'spin_crack()', 'move()'], ['fill_for_mate(2)', 'slide_r(4)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'R1 lướt ngay: rơi xuống hố', baiLam: doi(['slide_stop()', 'spin_crack()', 'move()'], ['fill_for_mate(2)', 'wait_n(3)', 'slide_r(4)']), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 38, nhip: 20 },
      goiY: [
        'Luna: R1: wait_n(2), slide_stop(), spin_crack(), move().',
        'Luna: R2 chờ R1 gõ xong rồi mới trượt.'
      ]
    }),

    manCheDH(10, 'trum', {
      ten: 'Trùm: hai đá, hai cách gõ',
      hamCuaEmCan: ['move', 'wait_n', 'slide_r', 'fill_for_mate', 'crack_for_mate', 'ring_for_mate'],
      deBai: 'Giúp Sola với! R2 hất đá qua rào lấp hố cho R1. Trên đường R1 có hai chuông, dưới mỗi chuông là một đá chắn R2: đá đầu 1 vạch, đá sau 2 vạch. R1 phá cả hai rồi vào cờ. R2 chờ rồi trượt tới cờ. Hai hầm chuông ở chỗ khác nhau.',
      veMaMau: 'R1 gõ cả hai đá một nhịp. Chạy thử: đá sau chỉ nứt.',
      san: [
        ['##########', '#.u....F##', '##=#######', '##o#######', '#.......F#', '##########'],
        ['##########', '#.u.....F#', '##=#######', '##o#######', '#.......F#', '##########']
      ],
      bd: [hai({ x: 1, y: 1, huong: 1 }), hai({ x: 2, y: 4, huong: 0 })],
      chuongDa: [[cd(6, 1, 7), cd(4, 1, 2)], [cd(7, 1, 4), cd(5, 1, 8)]],
      daChuong: [[da(4, 4, 2), da(6, 4, 7, 2)], [da(5, 4, 8), da(7, 4, 4, 2)]],
      maMau: doi(['wait_n(2)', 'crack_for_mate()', 'crack_for_mate()'], ['fill_for_mate(3)', 'wait_n(4)', 'slide_r(5)']),
      loiGiai: doi(['wait_n(2)', 'crack_for_mate()', 'ring_for_mate(2)'], ['fill_for_mate(3)', 'wait_n(4)', 'slide_r(5)']),
      loiSai: [
        { moTa: 'Gõ đá sau một nhịp: đá 2 vạch chỉ nứt', baiLam: doi(['wait_n(2)', 'crack_for_mate()', 'crack_for_mate()'], ['fill_for_mate(3)', 'wait_n(4)', 'slide_r(5)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'R2 chờ 2 nhịp: tới đá sau khi đá chưa vỡ', baiLam: doi(['wait_n(2)', 'crack_for_mate()', 'ring_for_mate(2)'], ['fill_for_mate(3)', 'wait_n(2)', 'slide_r(5)']), phaiCoMa: ['dam-tuong'] },
        { moTa: 'R1 đi ngay: rơi xuống hố', baiLam: doi(['crack_for_mate()', 'ring_for_mate(2)'], ['fill_for_mate(3)', 'wait_n(4)', 'slide_r(5)']), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 46, nhip: 26 },
      goiY: [
        'Luna: Đá đầu crack_for_mate(), đá sau ring_for_mate(2).',
        'Luna: R2 lấp hố rồi chờ 4 nhịp.'
      ]
    }),

  ];

  M.manDoiHangDong = DS;
})();
