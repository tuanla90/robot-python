/* ============================================================================
   man-di-cheo.js — Mùa 6 "Mỏ đá" · Gói 5 "Đi chéo" (20 màn)
   - Chương 1: di-cheo (10 màn: di-cheo.1 .. di-cheo.10) — "Lách chéo vách đá"
     Màn 1 trình diễn (chiChay: true), màn 2–9 luyện diag_left() / diag_right()
     lách chéo 1 ô trong 1 nhịp không đổi hướng mặt, kết hợp máy hất đá (lob)
     và radar tròn (radar), màn 10 trùm 2 sân.
   - Chương 2: che-di-cheo (10 màn: che-di-cheo.1 .. che-di-cheo.10) — "Chế lệnh: đi chéo"
     Chế 5 hàm mới: diag_r(n), diag_l(n), bypass_r(), diag_lob(), auto_bypass()
     + 1 màn sửa hàm hỏng (che-di-cheo.8), màn 10 trùm 2 sân.
   Toàn bộ 20 màn chạy trên Máy khai mỏ R1 (loaiRobot: 'omni', tay: 'nem',
   camBien: [{ ma: 'radar', o: 'tren' }], omniCheo: true, tamNemMacDinh: 2, daLapHo: true).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var KHAY_DI_CHEO = ['left_move', 'right_move', 'left_back', 'right_back', 'slide_left', 'slide_right', 'wait', 'load', 'throw', 'radar', 'diag_left', 'diag_right'];
  var ROBOT_DI_CHEO = { than: 'omni', tay: 'nem', camBien: [{ ma: 'radar', o: 'tren' }] };
  var CAU_TRUC = ['for', 'if', 'while', 'list'];

  function bai(chinh, Phu) {
    return {
      chinh: chinh,
      hamCuaMan: (Phu && Phu.hamCuaMan) || [],
      hamCuaEmMoi: (Phu && Phu.hamCuaEmMoi) || []
    };
  }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo, than: than }; }

  var T_DIAG_R = ['for i in range(n):', '    diag_right()'];
  var T_DIAG_L = ['for i in range(n):', '    diag_left()'];
  var T_BYPASS_R = ['diag_right()', 'diag_left()'];
  var T_DIAG_LOB = ['diag_right()', 'lob()'];
  var T_AUTO_BYPASS = ['g = radar()', 't = g[0][1]', 'if t == "#":', '    bypass_r()', 'else:', '    forward(2)'];

  function manDC(o) {
    return Object.assign({
      loaiRobot: 'omni',
      robot: ROBOT_DI_CHEO,
      omniCheo: true,
      tamNemMacDinh: 2,
      daLapHo: true,
      hamGoc: KHAY_DI_CHEO,
      moXuong: true,
      mucTieu: 'toi-co',
      khung: { chinh: 10, moiHam: 10, cauTruc: CAU_TRUC },
      cauTruc: CAU_TRUC,
      taoHam: [],
      hamCuaEmCan: [],
      loiSai: [],
      goiY: [],
      phienBanNoiDung: 2
    }, o);
  }

  /* CHÉO GHÉP (ghép nhịp 5a, 15/11): bánh omni cộng hai chuyển động tới và ngang. slide_* cùng nhịp với hai bánh đi thẳng = đi chéo 1 ô.
     Bốn bước chéo viết bằng lệnh gốc, mỗi dòng một việc (f = tới, b = lùi, l / r = trái / phải so với hướng mặt). */
  var FR = ['slide_right()', 'left_move()', 'right_move()', 'wait()'];
  var FL = ['slide_left()', 'left_move()', 'right_move()', 'wait()'];
  var BR = ['slide_right()', 'left_back()', 'right_back()', 'wait()'];
  var BL = ['slide_left()', 'left_back()', 'right_back()', 'wait()'];
  function thut(ds) { return ds.map(function (d) { return '    ' + d; }); }
  /* Khay của gói 5 mới: KHÔNG còn diag_left / diag_right (lệnh cũ, thôi dạy; lõi vẫn giữ cho mã cũ). */
  var KHAY_GHEP = ['left_move', 'right_move', 'left_back', 'right_back', 'slide_left', 'slide_right', 'wait', 'load', 'throw', 'radar'];
  /* Màn chéo ghép: màn 1–5 chương 1 giấu hàm của em (camHamCuaEm) để em tự ghép bằng lệnh gốc; từ màn 6 thả (camHamCuaEm: false). */
  function manGhep(o) {
    return manDC(Object.assign({ omniCheo: false, hamGoc: KHAY_GHEP, camHamCuaEm: true, phienBanNoiDung: 3 }, o));
  }

  var DS = [
    /* ========================================================================
       CHƯƠNG 1: di-cheo — "Lách chéo vách đá" (10 màn)
       ======================================================================== */

    /* ---- Màn 1: TRÌNH DIỄN chéo ghép (chiChay, mã khoá): trượt + tiến cùng một nhịp = đi chéo ---- */
    manGhep({
      id: 6501, chuong: 'di-cheo', so: 1, ma: 'di-cheo.1',
      ten: 'Bánh omni cộng hai chuyển động', hang: 'lam-quen',
      chiChay: true, chinhCoDinh: true,
      deBai: 'Hố sâu nằm sát hai bên lối đi. Bánh omni cộng được hai chuyển động: tới và ngang. Ra lệnh trượt và lệnh tiến trong cùng một nhịp thì R1 đi chéo. Bấm Chạy để xem.',
      veMaMau: 'Chương trình đã viết sẵn và khóa. Bấm Chạy để xem R1 đi chéo giữa các hố.',
      goiY: ['Bấm nút Chạy. Nhìn kỹ: mỗi nhịp R1 vừa trượt phải vừa tiến, mũi xe không đổi hướng.'],
      san: [
        '#####',
        '#.uF#',
        '#u.u#',
        '#.u.#',
        '#####'
      ],
      batDau: { x: 1, y: 3, huong: 0 },
      maMau: bai(FR.concat(FR)),
      loiGiai: bai(FR.concat(FR)),
      sao: { o: 8, nhip: 2 },
      loiBinh: 'Trượt phải cộng tiến trong một nhịp thành một bước chéo. Mũi xe vẫn nhìn lên.'
    }),

    /* ---- Màn 2: ÉP — tách nhịp (trượt rồi mới tiến) thì rơi hố ---- */
    manGhep({
      id: 6502, chuong: 'di-cheo', so: 2, ma: 'di-cheo.2',
      ten: 'Tách nhịp là rơi hố', hang: 'lam-quen',
      deBai: 'Hố sâu nằm ngay bên phải và ngay trước mặt R1. Ô chéo tiến-phải thì trống. Hãy cho R1 trượt phải và tiến trong CÙNG một nhịp, rồi tiến tới cờ.',
      veMaMau: 'Chương trình có sẵn trượt xong mới tiến: hai nhịp riêng. Hãy sửa để trượt và tiến nằm chung một nhịp.',
      goiY: [
        'Lệnh wait() cho một nhịp trôi. Mọi lệnh viết trước wait() chạy chung nhịp đó.',
        'Bỏ lệnh wait() đứng ngay sau slide_right(). Khi đó slide_right(), left_move(), right_move() chung một nhịp.'
      ],
      san: [
        '####',
        '#.F#',
        '#u.#',
        '#.u#',
        '####'
      ],
      batDau: { x: 1, y: 3, huong: 0 },
      maMau: bai(['slide_right()', 'wait()', 'left_move()', 'right_move()', 'wait()', 'left_move()', 'right_move()', 'wait()']),
      loiGiai: bai(FR.concat(['left_move()', 'right_move()', 'wait()'])),
      sao: { o: 7, nhip: 2 },
      loiSai: [
        { moTa: 'Trượt phải một nhịp riêng rồi mới tiến nên rơi xuống hố ở (2, 3)', baiLam: bai(['slide_right()', 'wait()', 'left_move()', 'right_move()', 'wait()', 'left_move()', 'right_move()', 'wait()']), phaiCoMa: ['roi-ho'] },
        { moTa: 'Tiến một nhịp riêng rồi mới trượt nên rơi xuống hố ở (1, 2)', baiLam: bai(['left_move()', 'right_move()', 'wait()', 'slide_right()', 'wait()', 'left_move()', 'right_move()', 'wait()']), phaiCoMa: ['roi-ho'] }
      ],
      loiBinh: 'Trượt và tiến chung một nhịp thì R1 đi thẳng tới ô chéo, không ghé qua ô hố nào.'
    }),

    /* ---- Màn 3: chéo tiến-trái rồi chéo tiến-phải ---- */
    manGhep({
      id: 6503, chuong: 'di-cheo', so: 3, ma: 'di-cheo.3',
      ten: 'Chéo trái, chéo phải', hang: 'lam-quen',
      deBai: 'Lối lên cờ ngoằn ngoèo giữa ba hố sâu. Hãy đi chéo tiến-trái một bước, rồi chéo tiến-phải một bước.',
      veMaMau: 'Chương trình có sẵn mới đi bước chéo tiến-trái. Hãy viết thêm bước chéo tiến-phải.',
      goiY: [
        'Chéo tiến-trái là slide_left() cùng nhịp với left_move() và right_move().',
        'Bước thứ hai giống bước đầu, chỉ đổi slide_left() thành slide_right().'
      ],
      san: [
        '####',
        '#uF#',
        '#.u#',
        '#u.#',
        '####'
      ],
      batDau: { x: 2, y: 3, huong: 0 },
      maMau: bai(FL),
      loiGiai: bai(FL.concat(FR)),
      sao: { o: 8, nhip: 2 },
      loiSai: [
        { moTa: 'Mới đi một bước chéo tiến-trái nên dừng ở (1, 2)', baiLam: bai(FL), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Bước thứ hai vẫn trượt trái nên đâm vào vách đá', baiLam: bai(FL.concat(FL)), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      loiBinh: 'Đổi slide_left() thành slide_right() là đổi ngả chéo. Phần tiến giữ nguyên.'
    }),

    /* ---- Màn 4: vòng lặp for đi chéo 4 bậc ---- */
    manGhep({
      id: 6504, chuong: 'di-cheo', so: 4, ma: 'di-cheo.4',
      ten: 'Rãnh chéo dài', hang: 'luyen',
      deBai: 'Rãnh mỏ chạy chéo 4 bậc lên phía phải. Hãy dùng vòng lặp `for` để R1 đi chéo tiến-phải đủ 4 bước tới cờ.',
      veMaMau: 'Chương trình có sẵn mới lặp 3 lần nên còn thiếu 1 bước chéo. Hãy sửa số lần lặp.',
      goiY: [
        'Từ (1, 5) tới cờ (5, 1) là đúng 4 bước chéo tiến-phải.',
        'Sửa range(3) thành range(4).'
      ],
      san: [
        '#######',
        '#....F#',
        '###...#',
        '##..###',
        '#..####',
        '#.....#',
        '#######'
      ],
      batDau: { x: 1, y: 5, huong: 0 },
      maMau: bai(['for i in range(3):'].concat(thut(FR))),
      loiGiai: bai(['for i in range(4):'].concat(thut(FR))),
      sao: { o: 5, nhip: 4 },
      loiSai: [
        { moTa: 'Chỉ lặp 3 lần nên dừng ở (4, 2) trước cờ', baiLam: bai(['for i in range(3):'].concat(thut(FR))), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Trượt nhầm sang trái nên đâm vào vách đá', baiLam: bai(['for i in range(4):'].concat(thut(FL))), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      loiBinh: 'Bốn bước chéo liền nhau chỉ tốn 4 nhịp. Đi thẳng rồi trượt thì mất 8 nhịp.'
    }),

    /* ---- Màn 5: chéo LÙI (slide + left_back + right_back) ---- */
    manGhep({
      id: 6505, chuong: 'di-cheo', so: 5, ma: 'di-cheo.5',
      ten: 'Lùi chéo xuống dốc', hang: 'luyen',
      deBai: 'Cờ nằm ở phía sau, lệch sang phải. Trượt cũng ghép được với LÙI. Hãy cho R1 đi chéo lùi-phải 2 bước, mũi xe vẫn nhìn lên.',
      veMaMau: 'Chương trình có sẵn ghép trượt với tiến nên đâm vào vách đá. Hãy đổi hai lệnh tiến thành hai lệnh lùi.',
      goiY: [
        'Lùi thẳng là left_back() và right_back() chung một nhịp.',
        'Trong vòng lặp, đổi left_move() thành left_back() và right_move() thành right_back().'
      ],
      san: [
        '#####',
        '#.u.#',
        '#u.u#',
        '#.uF#',
        '#####'
      ],
      batDau: { x: 1, y: 1, huong: 0 },
      maMau: bai(['for i in range(2):'].concat(thut(FR))),
      loiGiai: bai(['for i in range(2):'].concat(thut(BR))),
      sao: { o: 5, nhip: 2 },
      loiSai: [
        { moTa: 'Ghép trượt phải với tiến nên đâm vào vách đá phía trên', baiLam: bai(['for i in range(2):'].concat(thut(FR))), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Trượt phải một nhịp riêng rồi mới lùi nên rơi xuống hố ở (2, 1)', baiLam: bai(['slide_right()', 'wait()', 'left_back()', 'right_back()', 'wait()']), phaiCoMa: ['roi-ho'] }
      ],
      loiBinh: 'Trượt cộng lùi thành bước chéo lùi. R1 có đủ bốn ngả chéo mà không cần quay xe.'
    }),

    /* ---- Màn 6: THẢ hàm cũ — đi chéo vào sau viên đá rồi hất lấp hố ---- */
    manGhep({
      id: 6506, chuong: 'di-cheo', so: 6, ma: 'di-cheo.6',
      ten: 'Lách chéo hất đá', hang: 'luyen',
      camHamCuaEm: false,
      hamCuaEmCan: ['forward', 'lob'],
      deBai: 'Viên đá tròn nằm ở cột bên phải. Trước nó là hố sâu chắn lối tới cờ. Hãy đi chéo tiến-phải vào ngay dưới viên đá, hất đá lấp hố, rồi tiến tới cờ.',
      veMaMau: 'Chương trình có sẵn đã đi chéo và tiến 3 ô nhưng quên hất đá lấp hố.',
      goiY: [
        'Sau bước chéo, R1 ở (3, 4), ngay dưới viên đá ở (3, 3). Mũi xe vẫn nhìn lên.',
        'Gọi lob() trước forward(3).'
      ],
      san: [
        '######',
        '#..F.#',
        '#..u.#',
        '#..o.#',
        '###..#',
        '#....#',
        '######'
      ],
      batDau: { x: 2, y: 5, huong: 0 },
      maMau: bai(FR.concat(['forward(3)'])),
      loiGiai: bai(FR.concat(['lob()', 'forward(3)'])),
      sao: { o: 15, nhip: 6 },
      loiSai: [
        { moTa: 'Quên gọi lob() trước khi tiến nên đâm vào viên đá ở (3, 3)', baiLam: bai(FR.concat(['forward(3)'])), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Gọi lob() trước khi đi chéo nên xúc hụt vì đá nằm ở cột bên phải', baiLam: bai(['lob()'].concat(FR).concat(['forward(3)'])), phaiCoMa: ['nap-hut', 'dam-tuong'] }
      ],
      loiBinh: 'Đi chéo không đổi hướng mặt. Tới sau viên đá là hất được ngay.'
    }),

    /* ---- Màn 7: vòng lặp ziczac chéo phải rồi chéo trái qua 3 hố ---- */
    manGhep({
      id: 6507, chuong: 'di-cheo', so: 7, ma: 'di-cheo.7',
      ten: 'Ziczac qua bãi hố', hang: 'bien-the',
      camHamCuaEm: false,
      deBai: 'Ba hố sâu nằm thẳng hàng trên cột giữa. Mỗi hố cần một bước chéo tiến-phải rồi một bước chéo tiến-trái để vòng qua. Hãy dùng vòng lặp `for` 3 lần.',
      veMaMau: 'Chương trình có sẵn mới có bước chéo tiến-phải trong vòng lặp. Hãy thêm bước chéo tiến-trái.',
      goiY: [
        'Bước chéo tiến-trái: slide_left(), left_move(), right_move(), wait().',
        'Viết bốn lệnh đó ngay dưới bước chéo tiến-phải, vẫn nằm trong vòng lặp.'
      ],
      san: [
        '#####',
        '#.F.#',
        '#.u.#',
        '#...#',
        '#.u.#',
        '#...#',
        '#.u.#',
        '#...#',
        '#####'
      ],
      batDau: { x: 2, y: 7, huong: 0 },
      maMau: bai(['for i in range(3):'].concat(thut(FR))),
      loiGiai: bai(['for i in range(3):'].concat(thut(FR)).concat(thut(FL))),
      sao: { o: 9, nhip: 6 },
      loiSai: [
        { moTa: 'Thiếu bước chéo tiến-trái trong vòng lặp nên đâm vào vách đá bên phải', baiLam: bai(['for i in range(3):'].concat(thut(FR))), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Chỉ lặp 2 lần nên dừng ở (2, 3) dưới hố cuối cùng', baiLam: bai(['for i in range(2):'].concat(thut(FR)).concat(thut(FL))), phaiCoMa: ['chua-toi-co'] }
      ],
      loiBinh: 'Chéo phải rồi chéo trái là vòng qua một hố trong 2 nhịp.'
    }),

    /* ---- Màn 8: radar — gặp vách đá thì thêm lệnh trượt vào nhịp tiến (2 sân) ---- */
    manGhep({
      id: 6508, chuong: 'di-cheo', so: 8, ma: 'di-cheo.8',
      ten: 'Radar báo thì trượt thêm', hang: 'bien-the',
      camHamCuaEm: false,
      deBai: 'Đường lên cờ dài 4 bước. Có bước bị vách đá `#` chắn ngay trước mặt. Mỗi bước hãy quét `g = radar()` và đọc `t = g[0][1]`. Nếu `t == "#"` thì thêm lệnh trượt phải vào nhịp đó. Bước nào R1 cũng tiến.',
      veMaMau: 'Chương trình có sẵn bước nào cũng tiến thẳng. Hãy thêm câu if để trượt phải khi trước mặt là vách đá.',
      goiY: [
        'Viết if t == "#": ngay dưới dòng t = g[0][1], bên trong gọi slide_right().',
        'Ba lệnh left_move(), right_move(), wait() nằm ngoài câu if, vẫn trong vòng lặp.'
      ],
      san: [
        [
          '######',
          '#..F.#',
          '#....#',
          '###..#',
          '#....#',
          '#....#',
          '######'
        ],
        [
          '######',
          '#..F.#',
          '###..#',
          '#....#',
          '##...#',
          '#....#',
          '######'
        ]
      ],
      batDau: [
        { x: 2, y: 5, huong: 0 },
        { x: 1, y: 5, huong: 0 }
      ],
      maMau: bai(['for i in range(4):', '    g = radar()', '    t = g[0][1]', '    left_move()', '    right_move()', '    wait()']),
      loiGiai: bai(['for i in range(4):', '    g = radar()', '    t = g[0][1]', '    if t == "#":', '        slide_right()', '    left_move()', '    right_move()', '    wait()']),
      sao: { o: 8, nhip: 4 },
      loiSai: [
        { moTa: 'Bước nào cũng tiến thẳng, không trượt, nên đâm vào vách đá', baiLam: bai(['for i in range(4):', '    g = radar()', '    t = g[0][1]', '    left_move()', '    right_move()', '    wait()']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Bước nào cũng trượt phải, không hỏi radar, nên đâm vào vách đá bên phải', baiLam: bai(['for i in range(4):'].concat(thut(FR))), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      loiBinh: 'Nhịp nào cũng tiến. Nhịp nào radar báo vách đá thì cộng thêm trượt phải, thành bước chéo.'
    }),

    /* ---- Màn 9: đi chéo lên bàn xoay rồi hất đá lấp hố ---- */
    manGhep({
      id: 6509, chuong: 'di-cheo', so: 9, ma: 'di-cheo.9',
      ten: 'Lách chéo lên bàn xoay', hang: 'bien-the',
      camHamCuaEm: false,
      hamCuaEmCan: ['forward', 'lob'],
      deBai: 'Bàn xoay `@` nằm chéo phía trên, cách 2 bước chéo tiến-phải. Lên bàn xoay thì mũi xe tự quay sang phải. Trước mũi xe lúc đó là viên đá, hố sâu, rồi cờ. Hãy đưa R1 tới cờ.',
      veMaMau: 'Chương trình có sẵn đã đi chéo 2 bước lên bàn xoay và tiến 3 ô, nhưng quên hất đá lấp hố.',
      goiY: [
        'Sau 2 bước chéo, R1 đứng trên bàn xoay ở (3, 1), mũi xe quay sang phải.',
        'Gọi lob() rồi mới forward(3).'
      ],
      san: [
        '########',
        '#..@ouF#',
        '##.....#',
        '#......#',
        '########'
      ],
      batDau: { x: 1, y: 3, huong: 0 },
      maMau: bai(['for i in range(2):'].concat(thut(FR)).concat(['forward(3)'])),
      loiGiai: bai(['for i in range(2):'].concat(thut(FR)).concat(['lob()', 'forward(3)'])),
      sao: { o: 16, nhip: 7 },
      loiSai: [
        { moTa: 'Quên gọi lob() sau khi lên bàn xoay nên đâm vào viên đá ở (4, 1)', baiLam: bai(['for i in range(2):'].concat(thut(FR)).concat(['forward(3)'])), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Chỉ đi chéo 1 bước nên chưa lên tới bàn xoay', baiLam: bai(FR.concat(['lob()', 'forward(3)'])), phaiCoMa: ['nap-hut', 'dam-tuong'] }
      ],
      loiBinh: 'Bước chéo cuối đáp đúng lên bàn xoay. R1 đổi hướng mà không tốn nhịp quay xe.'
    }),

    /* ---- Màn 10: TRÙM chương 1 (2 sân): radar chọn ngả trượt, phần tiến dùng chung ---- */
    manGhep({
      id: 6510, chuong: 'di-cheo', so: 10, ma: 'di-cheo.10',
      ten: 'Trùm lách chéo mỏ đá', hang: 'trum',
      camHamCuaEm: false,
      huyHieu: { ma: 'di-cheo', ten: 'Bánh Chéo Vách Đá' },
      deBai: 'Đường lên mỏ là 4 bước chéo qua các khe đá. Hai sân có khe khác nhau. Mỗi bước hãy quét `g = radar()` và đọc `t = g[0][2]`, ô chéo tiến-phải. Ô đó không phải vách đá `#` thì trượt phải, còn không thì trượt trái. Bước nào R1 cũng tiến.',
      veMaMau: 'Chương trình có sẵn mới trượt phải khi ô chéo tiến-phải trống. Hãy thêm nhánh else để trượt trái.',
      goiY: [
        'Thêm else: ngay dưới nhánh if, bên trong gọi slide_left().',
        'Ba lệnh left_move(), right_move(), wait() nằm ngoài if và else, vẫn trong vòng lặp.'
      ],
      san: [
        [
          '######',
          '#.F..#',
          '#..###',
          '#...##',
          '#..###',
          '#....#',
          '######'
        ],
        [
          '######',
          '#..F.#',
          '###..#',
          '##...#',
          '###..#',
          '#....#',
          '######'
        ]
      ],
      batDau: [
        { x: 2, y: 5, huong: 0 },
        { x: 3, y: 5, huong: 0 }
      ],
      maMau: bai(['for i in range(4):', '    g = radar()', '    t = g[0][2]', '    if t != "#":', '        slide_right()', '    left_move()', '    right_move()', '    wait()']),
      loiGiai: bai(['for i in range(4):', '    g = radar()', '    t = g[0][2]', '    if t != "#":', '        slide_right()', '    else:', '        slide_left()', '    left_move()', '    right_move()', '    wait()']),
      sao: { o: 10, nhip: 4 },
      loiSai: [
        { moTa: 'Chưa có nhánh else trượt trái nên có bước R1 tiến thẳng và đâm vào vách đá', baiLam: bai(['for i in range(4):', '    g = radar()', '    t = g[0][2]', '    if t != "#":', '        slide_right()', '    left_move()', '    right_move()', '    wait()']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Bước nào cũng chéo tiến-phải, không hỏi radar, nên đâm vào vách đá', baiLam: bai(['for i in range(4):'].concat(thut(FR))), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      loiBinh: 'Radar chọn ngả trượt, hai bánh lo phần tiến. Hai chuyển động cộng lại thành bước chéo đúng ngả.'
    }),

    /* ========================================================================
       CHƯƠNG 2: che-di-cheo — "Chế lệnh: đi chéo" (10 màn)
       Hàm chế mới:
       1. diag_r(n)       (che-di-cheo.1)
       2. diag_l(n)       (che-di-cheo.2)
       3. bypass_r()      (che-di-cheo.4)
       4. diag_lob()      (che-di-cheo.5)
       5. auto_bypass()   (che-di-cheo.6)
       Sửa hàm hỏng:
       - bypass_r()       (che-di-cheo.8)
       ======================================================================== */

    /* ---- Màn 11 (che-di-cheo.1): Chế hàm diag_r(n) ---- */
    manDC({
      id: 6511, chuong: 'che-di-cheo', so: 1, ma: 'che-di-cheo.1',
      ten: 'Chế hàm lách phải n ô', hang: 'lam-quen',
      canHam: 'tran-khung',
      mucTieu: 'bong-mo',
      bongMo: { x: 4, y: 1, huong: 0, diQua: [{ x: 2, y: 3 }] },
      taoHam: ['diag_r'],
      chinhCoDinh: true,
      deBai: 'Hãy viết hàm `diag_r(n)` dùng vòng lặp `for` gọi `diag_right()` đúng `n` lần để R1 trượt chéo tiến-phải 3 ô liền nhau tới bóng mờ.',
      veMaMau: 'Chương trình chính đã gọi sẵn diag_r(3). Hãy vào Xưởng hàm viết thân hàm diag_r(n).',
      goiY: [
        'Trong def diag_r(n):, viết for i in range(n): rồi gọi diag_right() bên trong.',
        'Chương trình chính đã gọi sẵn diag_r(3).'
      ],
      san: [
        '######',
        '#....#',
        '#.#..#',
        '##...#',
        '#....#',
        '######'
      ],
      batDau: { x: 1, y: 4, huong: 0 },
      maMau: bai(['diag_r(3)'], { hamCuaEmMoi: [H('diag_r', ['n'], ['diag_right()'])] }),
      loiGiai: bai(['diag_r(3)'], { hamCuaEmMoi: [H('diag_r', ['n'], T_DIAG_R)] }),
      sao: { o: 3, nhip: 3 },
      loiSai: [
        { moTa: 'Trong diag_r(n) chỉ gọi diag_right() 1 lần không dùng vòng lặp for', baiLam: bai(['diag_r(3)']), hamCuaEmMoi: [H('diag_r', ['n'], ['diag_right()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Trong diag_r(n) gọi nhầm diag_left() nên đâm vào tường bên trái', baiLam: bai(['diag_r(3)']), hamCuaEmMoi: [H('diag_r', ['n'], ['for i in range(n):', '    diag_left()'])], phaiCoMa: ['dam-tuong', 'lech-bong-mo'] }
      ],
      loiBinh: 'Hàm diag_r(n) đã lưu vào kho lệnh để em đi chéo phải bao nhiêu ô tùy ý.'
    }),

    /* ---- Màn 12 (che-di-cheo.2): Chế hàm diag_l(n) ---- */
    manDC({
      id: 6512, chuong: 'che-di-cheo', so: 2, ma: 'che-di-cheo.2',
      ten: 'Chế hàm lách trái n ô', hang: 'lam-quen',
      canHam: 'tran-khung',
      mucTieu: 'bong-mo',
      bongMo: { x: 1, y: 1, huong: 0, diQua: [{ x: 3, y: 3 }] },
      taoHam: ['diag_l'],
      chinhCoDinh: true,
      deBai: 'Hãy viết hàm `diag_l(n)` dùng vòng lặp `for` gọi `diag_left()` đúng `n` lần để R1 trượt chéo tiến-trái 3 ô liền nhau tới bóng mờ.',
      veMaMau: 'Chương trình chính đã gọi sẵn diag_l(3). Hãy vào Xưởng hàm viết thân hàm diag_l(n).',
      goiY: [
        'Trong def diag_l(n):, viết for i in range(n): rồi gọi diag_left() bên trong.',
        'Chương trình chính đã gọi sẵn diag_l(3).'
      ],
      san: [
        '######',
        '#....#',
        '#..#.#',
        '#...##',
        '#....#',
        '######'
      ],
      batDau: { x: 4, y: 4, huong: 0 },
      maMau: bai(['diag_l(3)'], { hamCuaEmMoi: [H('diag_l', ['n'], ['diag_left()'])] }),
      loiGiai: bai(['diag_l(3)'], { hamCuaEmMoi: [H('diag_l', ['n'], T_DIAG_L)] }),
      sao: { o: 3, nhip: 3 },
      loiSai: [
        { moTa: 'Trong diag_l(n) chỉ gọi diag_left() 1 lần không dùng vòng lặp for', baiLam: bai(['diag_l(3)']), hamCuaEmMoi: [H('diag_l', ['n'], ['diag_left()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Trong diag_l(n) gọi nhầm diag_right() nên đâm vào tường bên phải', baiLam: bai(['diag_l(3)']), hamCuaEmMoi: [H('diag_l', ['n'], ['for i in range(n):', '    diag_right()'])], phaiCoMa: ['dam-tuong', 'lech-bong-mo'] }
      ],
      loiBinh: 'Có đủ cặp diag_r(n) và diag_l(n), R1 đã sẵn sàng lách chéo hai bên theo tham số.'
    }),

    /* ---- Màn 13 (che-di-cheo.3): Luyện diag_r(n), diag_l(n) và lob() ---- */
    manDC({
      id: 6513, chuong: 'che-di-cheo', so: 3, ma: 'che-di-cheo.3',
      ten: 'Đường chéo chữ V', hang: 'luyen',
      hamCuaEmCan: ['move', 'forward', 'lob', 'diag_r', 'diag_l'],
      deBai: 'Hãy gọi `diag_r(2)` rồi `diag_l(1)` để vòng qua vách đá vào ngay dưới viên đá tròn, sau đó gọi `lob()` hất đá lấp hố sâu rồi `forward(3)` tới cờ.',
      veMaMau: 'Chương trình có sẵn đã lách qua vách đá bằng diag_r(2) và diag_l(1) nhưng thiếu lệnh lob() trước forward(3).',
      goiY: [
        'Từ (1, 7) gọi diag_r(2) tới (3, 5), rồi gọi diag_l(1) tới (2, 4) ngay dưới viên đá ở (2, 3).',
        'Gọi lob() để lấp hố ở (2, 2), rồi forward(3) tiến thẳng lên cờ ở (2, 1).'
      ],
      san: [
        '#####',
        '#.F.#',
        '#.u.#',
        '#.o.#',
        '#...#',
        '###.#',
        '#...#',
        '#...#',
        '#####'
      ],
      batDau: { x: 1, y: 7, huong: 0 },
      maMau: bai(['diag_r(2)', 'diag_l(1)', 'forward(3)']),
      loiGiai: bai(['diag_r(2)', 'diag_l(1)', 'lob()', 'forward(3)']),
      sao: { o: 17, nhip: 8 },
      loiSai: [
        { moTa: 'Quên gọi lob() trước forward(3) nên đâm vào viên đá ở (2, 3)', baiLam: bai(['diag_r(2)', 'diag_l(1)', 'forward(3)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Chỉ tiến 2 ô sau khi lấp hố nên dừng ở (2, 2) trước cờ', baiLam: bai(['diag_r(2)', 'diag_l(1)', 'lob()', 'forward(2)']), phaiCoMa: ['chua-toi-co'] }
      ],
      loiBinh: 'Ghép diag_r(2) và diag_l(1) giúp R1 vòng qua vách đá chắn ngang và vào đúng vị trí hất đá.'
    }),

    /* ---- Màn 14 (che-di-cheo.4): Chế hàm bypass_r() ---- */
    manDC({
      id: 6514, chuong: 'che-di-cheo', so: 4, ma: 'che-di-cheo.4',
      ten: 'Chế hàm lách trụ đá', hang: 'luyen',
      canHam: 'tran-khung',
      mucTieu: 'bong-mo',
      bongMo: { x: 2, y: 1, huong: 0, diQua: [{ x: 3, y: 4 }, { x: 3, y: 2 }] },
      taoHam: ['bypass_r'],
      chinhCoDinh: true,
      deBai: 'Trước mặt R1 có trụ đá chắn ngang cột. Hãy viết hàm `bypass_r()` gồm `diag_right()` rồi `diag_left()` để lách qua bên phải trụ đá và trở về đúng cột cũ chỉ trong 2 nhịp.',
      veMaMau: 'Chương trình chính đã gọi bypass_r() 2 lần. Hãy hoàn thiện thân hàm bypass_r() trong Xưởng hàm.',
      goiY: [
        'Trong def bypass_r():, gọi diag_right() rồi diag_left().',
        'Chương trình chính gọi bypass_r() hai lần để vượt qua 2 trụ đá liên tiếp.'
      ],
      san: [
        '#####',
        '#...#',
        '#.#.#',
        '#...#',
        '#.#.#',
        '#...#',
        '#####'
      ],
      batDau: { x: 2, y: 5, huong: 0 },
      maMau: bai(['bypass_r()', 'bypass_r()'], { hamCuaEmMoi: [H('bypass_r', [], ['diag_right()'])] }),
      loiGiai: bai(['bypass_r()', 'bypass_r()'], { hamCuaEmMoi: [H('bypass_r', [], T_BYPASS_R)] }),
      sao: { o: 4, nhip: 4 },
      loiSai: [
        { moTa: 'Trong bypass_r() chỉ gọi diag_right() mà thiếu diag_left() nên đâm vào tường bên phải', baiLam: bai(['bypass_r()', 'bypass_r()']), hamCuaEmMoi: [H('bypass_r', [], ['diag_right()'])], phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Trong bypass_r() lách sang trái thay vì sang phải nên bỏ lỡ điểm mốc bên phải', baiLam: bai(['bypass_r()', 'bypass_r()']), hamCuaEmMoi: [H('bypass_r', [], ['diag_left()', 'diag_right()'])], phaiCoMa: ['chua-qua-diem'] }
      ],
      loiBinh: 'Với bánh omni đi chéo, bypass_r() vượt qua chướng ngại trước mặt chỉ mất 2 nhịp thay vì 4 nhịp.'
    }),

    /* ---- Màn 15 (che-di-cheo.5): Chế hàm diag_lob() ---- */
    manDC({
      id: 6515, chuong: 'che-di-cheo', so: 5, ma: 'che-di-cheo.5',
      ten: 'Chế hàm lách phải hất đá', hang: 'luyen',
      canHam: 'tran-khung',
      mucTieu: 'dua-vat',
      taoHam: ['diag_lob'],
      chinhCoDinh: true,
      hamCuaEmCan: ['lob'],
      deBai: 'Ba viên đá nằm trên bậc thang chéo sang phải, mỗi viên cần hất xa 2 ô vào máng `D` phía trên. Hãy viết hàm `diag_lob()`: gọi `diag_right()` để lách vào ngay dưới viên đá rồi gọi `lob()` để hất đá vào máng.',
      veMaMau: 'Chương trình chính đã lặp 3 lần diag_lob(). Hãy thêm lệnh lob() vào thân hàm diag_lob().',
      goiY: [
        'Trong def diag_lob():, gọi diag_right() rồi gọi lob().',
        'Chương trình chính lặp 3 lần diag_lob() để hất đủ 3 viên đá vào 3 máng D.'
      ],
      san: [
        '#######',
        '#...D.#',
        '#..Do.#',
        '#.Do..#',
        '#.o...#',
        '#.....#',
        '#.....#',
        '#######'
      ],
      batDau: { x: 1, y: 6, huong: 0 },
      maMau: bai(['for i in range(3):', '    diag_lob()'], { hamCuaEmMoi: [H('diag_lob', [], ['diag_right()'])] }),
      loiGiai: bai(['for i in range(3):', '    diag_lob()'], { hamCuaEmMoi: [H('diag_lob', [], T_DIAG_LOB)] }),
      sao: { o: 8, nhip: 9 },
      loiSai: [
        { moTa: 'Trong diag_lob() chỉ gọi diag_right() mà quên gọi lob() để hất đá', baiLam: bai(['for i in range(3):', '    diag_lob()']), hamCuaEmMoi: [H('diag_lob', [], ['diag_right()'])], phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Trong diag_lob() gọi lob() trước diag_right() nên xúc hụt ngay từ bước đầu', baiLam: bai(['for i in range(3):', '    diag_lob()']), hamCuaEmMoi: [H('diag_lob', [], ['lob()', 'diag_right()'])], phaiCoMa: ['nap-hut', 'chua-dua-vat'] }
      ],
      loiBinh: 'Hàm diag_lob() gom thao tác lách chéo tới viên đá và hất đá vào một lệnh duy nhất.'
    }),

    /* ---- Màn 16 (che-di-cheo.6): Chế hàm auto_bypass() (2 sân) ---- */
    manDC({
      id: 6516, chuong: 'che-di-cheo', so: 6, ma: 'che-di-cheo.6',
      ten: 'Chế hàm tự lách trụ đá', hang: 'bien-the',
      canHam: 'tran-khung',
      taoHam: ['auto_bypass'],
      chinhCoDinh: true,
      hamCuaEmCan: ['move', 'forward', 'bypass_r'],
      deBai: 'Mỗi chặng R1 cần tiến lên 2 hàng. Hãy viết hàm `auto_bypass()`: quét `g = radar()`, nếu ô ngay trước mặt là trụ đá (ô `g[0][1]` là `"#"`) thì gọi `bypass_r()`, ngược lại thì gọi `forward(2)`.',
      veMaMau: 'Chương trình chính đã lặp 3 lần auto_bypass(). Hãy viết thân hàm auto_bypass() kiểm tra radar().',
      goiY: [
        'Trong def auto_bypass():, g = radar().',
        'Đọc t = g[0][1]; nếu t == "#": gọi bypass_r(), else: gọi forward(2).'
      ],
      san: [
        [
          '#####',
          '#.F.#',
          '#.#.#',
          '#...#',
          '#...#',
          '#.#.#',
          '#...#',
          '#####'
        ],
        [
          '#####',
          '#.F.#',
          '#...#',
          '#...#',
          '#.#.#',
          '#...#',
          '#...#',
          '#####'
        ]
      ],
      batDau: [
        { x: 2, y: 6, huong: 0 },
        { x: 2, y: 6, huong: 0 }
      ],
      maMau: bai(['for i in range(3):', '    auto_bypass()'], { hamCuaEmMoi: [H('auto_bypass', [], ['g = radar()', 'forward(2)'])] }),
      loiGiai: bai(['for i in range(3):', '    auto_bypass()'], { hamCuaEmMoi: [H('auto_bypass', [], T_AUTO_BYPASS)] }),
      sao: { o: 14, nhip: 6 },
      loiSai: [
        { moTa: 'Trong auto_bypass() luôn gọi forward(2) nên đâm vào trụ đá', baiLam: bai(['for i in range(3):', '    auto_bypass()']), hamCuaEmMoi: [H('auto_bypass', [], ['g = radar()', 'forward(2)'])], phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Thiếu nhánh else gọi forward(2) nên khi đường trống xe đứng yên', baiLam: bai(['for i in range(3):', '    auto_bypass()']), hamCuaEmMoi: [H('auto_bypass', [], ['g = radar()', 't = g[0][1]', 'if t == "#":', '    bypass_r()'])], phaiCoMa: ['chua-toi-co'] }
      ],
      loiBinh: 'Dù chặng đường trống hay có trụ đá chắn, auto_bypass() đều đưa R1 tiến 2 hàng trong đúng 2 nhịp.'
    }),

    /* ---- Màn 17 (che-di-cheo.7): Luyện auto_bypass() và diag_lob() (2 sân) ---- */
    manDC({
      id: 6517, chuong: 'che-di-cheo', so: 7, ma: 'che-di-cheo.7',
      ten: 'Lách đá lấp hố dọc hầm', hang: 'bien-the',
      hamCuaEmCan: ['move', 'forward', 'lob', 'bypass_r', 'diag_lob', 'auto_bypass'],
      deBai: 'Hãy gọi `diag_lob()` để lách phải sang cột giữa và hất viên đá lấp hố sâu phía trên, sau đó gọi `auto_bypass()` 2 lần để vượt qua 2 chặng cuối tới cờ.',
      veMaMau: 'Chương trình có sẵn mới gọi auto_bypass() 1 lần sau diag_lob(). Hãy gọi thêm auto_bypass() lần thứ hai.',
      goiY: [
        'Bắt đầu bằng diag_lob() để R1 từ (1, 6) lách lên (2, 5), nạp đá ở (2, 4) lấp hố ở (2, 3).',
        'Sau đó gọi auto_bypass() 2 lần (hoặc dùng vòng for 2 lần) để từ (2, 5) tiến 4 hàng lên cờ ở (2, 1).'
      ],
      san: [
        [
          '#####',
          '#.F.#',
          '#.#.#',
          '#.u.#',
          '#.o.#',
          '#...#',
          '#...#',
          '#####'
        ],
        [
          '#####',
          '#.F.#',
          '#...#',
          '#.u.#',
          '#.o.#',
          '#...#',
          '#...#',
          '#####'
        ]
      ],
      batDau: [
        { x: 1, y: 6, huong: 0 },
        { x: 1, y: 6, huong: 0 }
      ],
      maMau: bai(['diag_lob()', 'auto_bypass()']),
      loiGiai: bai(['diag_lob()', 'auto_bypass()', 'auto_bypass()']),
      sao: { o: 21, nhip: 7 },
      loiGiaiKhac: {
        moTa: 'Dùng vòng lặp for 2 lần gọi auto_bypass()',
        baiLam: bai(['diag_lob()', 'for i in range(2):', '    auto_bypass()'])
      },
      loiSai: [
        { moTa: 'Mới gọi auto_bypass() 1 lần nên dừng ở (2, 3) chưa tới cờ', baiLam: bai(['diag_lob()', 'auto_bypass()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên gọi diag_lob() ở đầu nên đi ở cột 1 không vào được cột cờ', baiLam: bai(['auto_bypass()', 'auto_bypass()']), phaiCoMa: ['chua-toi-co'] }
      ],
      loiBinh: 'Khi hố sâu đã được lấp thành sàn phẳng, auto_bypass() đi qua đoạn đó dễ dàng.'
    }),

    /* ---- Màn 18 (che-di-cheo.8): Sửa hàm hỏng bypass_r() ---- */
    manDC({
      id: 6518, chuong: 'che-di-cheo', so: 8, ma: 'che-di-cheo.8',
      ten: 'Sửa hàm lách trụ đá', hang: 'bien-the',
      mucTieu: 'bong-mo',
      bongMo: { x: 2, y: 5, huong: 0, diQua: [{ x: 2, y: 1 }] },
      suaHam: ['bypass_r'],
      chinhCoDinh: true,
      khoaHamMan: ['quarry_back'],
      hamCuaEmCan: ['back', 'bypass_r'],
      deBai: 'Hàm `bypass_r()` đang bị viết nhầm thành 2 lần `diag_right()` nên R1 lệch hẳn khỏi làn đường. Hãy sửa lại `bypass_r()` thành `diag_right()` rồi `diag_left()` để R1 lách lên điểm mốc và lùi về bóng mờ.',
      veMaMau: 'Mở hàm bypass_r() trong Xưởng hàm và đổi dòng thứ hai từ diag_right() thành diag_left().',
      goiY: [
        'Sửa dòng thứ hai trong def bypass_r(): từ diag_right() thành diag_left().',
        'Khi bypass_r() đúng, quarry_back() sẽ đưa R1 lùi về đúng bóng mờ ở (2, 5).'
      ],
      san: [
        '#####',
        '#...#',
        '#.#.#',
        '#...#',
        '#.#.#',
        '#...#',
        '#####'
      ],
      batDau: { x: 2, y: 5, huong: 0 },
      maMau: bai(
        ['bypass_r()', 'bypass_r()', 'quarry_back()'],
        {
          hamCuaMan: [H('quarry_back', [], ['slide_right()', 'wait()', 'back()', 'back()', 'back()', 'back()', 'slide_left()', 'wait()'])],
          hamCuaEmMoi: [H('bypass_r', [], ['diag_right()', 'diag_right()'])]
        }
      ),
      loiGiai: bai(
        ['bypass_r()', 'bypass_r()', 'quarry_back()'],
        {
          hamCuaMan: [H('quarry_back', [], ['slide_right()', 'wait()', 'back()', 'back()', 'back()', 'back()', 'slide_left()', 'wait()'])],
          hamCuaEmMoi: [H('bypass_r', [], T_BYPASS_R)]
        }
      ),
      sao: { o: 16, nhip: 10 },
      loiSai: [
        {
          moTa: 'Không sửa hàm bypass_r(): hai lần diag_right() làm xe đâm vào tường bên phải',
          baiLam: bai(['bypass_r()', 'bypass_r()', 'quarry_back()'], { hamCuaMan: [H('quarry_back', [], ['slide_right()', 'wait()', 'back()', 'back()', 'back()', 'back()', 'slide_left()', 'wait()'])] }),
          hamCuaEmMoi: [H('bypass_r', [], ['diag_right()', 'diag_right()'])],
          phaiCoMa: ['dam-tuong', 'chua-qua-diem']
        },
        {
          moTa: 'Xóa mất dòng thứ hai trong bypass_r(): xe mới lệch sang cột 3 đã đâm tường',
          baiLam: bai(['bypass_r()', 'bypass_r()', 'quarry_back()'], { hamCuaMan: [H('quarry_back', [], ['slide_right()', 'wait()', 'back()', 'back()', 'back()', 'back()', 'slide_left()', 'wait()'])] }),
          hamCuaEmMoi: [H('bypass_r', [], ['diag_right()'])],
          phaiCoMa: ['dam-tuong', 'chua-qua-diem']
        }
      ],
      loiBinh: 'Sửa lại bước thứ hai thành diag_left() giúp R1 giữ đúng trục đường sau mỗi lần né trụ đá.'
    }),

    /* ---- Màn 19 (che-di-cheo.9): Tổng hợp hàm đi chéo và danh sách 2D ---- */
    manDC({
      id: 6519, chuong: 'che-di-cheo', so: 9, ma: 'che-di-cheo.9',
      ten: 'Bảng lộ trình chéo', hang: 'bien-the',
      hamCuaEmCan: ['move', 'forward', 'lob', 'diag_r', 'diag_l'],
      deBai: 'Danh sách 2 chiều `steps` ghi từng chặng, mỗi sân một bảng riêng (sân 1: `steps = [[2, 1], [1, 2]]`): `r[0]` bước chéo phải `diag_r(r[0])` rồi `r[1]` bước chéo trái `diag_l(r[1])`. Hãy duyệt `for r in steps:` thực hiện 2 bước đó, rồi gọi `lob()` lấp hố và `forward(3)` tới cờ.',
      veMaMau: 'Chương trình có sẵn đã duyệt danh sách steps nhưng chưa gọi lob() và forward(3) ở cuối.',
      goiY: [
        'Trong vòng lặp for r in steps:, gọi diag_r(r[0]) rồi diag_l(r[1]).',
        'Sau vòng lặp, R1 đứng ở (2, 4) ngay dưới viên đá (2, 3): gọi lob() lấp hố ở (2, 2) rồi forward(3) tới cờ.'
      ],
      // dữ liệu theo sân: mỗi sân một bảng steps, điền thẳng số của sân 1 thì đâm tường ở sân 2 (và ngược lại)
      san: [[
        '######',
        '#.F..#',
        '#.u..#',
        '#.o..#',
        '#....#',
        '#.#..#',
        '#....#',
        '###..#',
        '#....#',
        '#.#..#',
        '#....#',
        '######'
      ], [
        '######',
        '#.F..#',
        '#.u..#',
        '#.o..#',
        '#....#',
        '#.#..#',
        '#...##',
        '#.#..#',
        '#...##',
        '#.#..#',
        '#....#',
        '######'
      ]],
      duLieuSan: ['steps = [[2, 1], [1, 2]]', 'steps = [[1, 2], [2, 1]]'],
      batDau: { x: 2, y: 10, huong: 0 },
      maMau: bai([
        'steps = [[2, 1], [1, 2]]',
        'for r in steps:',
        '    diag_r(r[0])',
        '    diag_l(r[1])'
      ]),
      loiGiai: bai([
        'steps = [[2, 1], [1, 2]]',
        'for r in steps:',
        '    diag_r(r[0])',
        '    diag_l(r[1])',
        'lob()',
        'forward(3)'
      ]),
      sao: { o: 19, nhip: 11 },
      loiSai: [
        { moTa: 'Mới chạy xong vòng lặp steps mà chưa lấp hố và tiến lên cờ', baiLam: bai(['steps = [[2, 1], [1, 2]]', 'for r in steps:', '    diag_r(r[0])', '    diag_l(r[1])']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên gọi lob() trước forward(3) nên đâm vào viên đá ở (2, 3)', baiLam: bai(['steps = [[2, 1], [1, 2]]', 'for r in steps:', '    diag_r(r[0])', '    diag_l(r[1])', 'forward(3)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Bỏ vòng lặp, điền thẳng số của sân 1: sang sân 2 đường chéo khác nên đâm vách', baiLam: bai(['steps = [[2, 1], [1, 2]]', 'diag_r(2)', 'diag_l(1)', 'diag_r(1)', 'diag_l(2)', 'lob()', 'forward(3)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      loiBinh: 'Kết hợp danh sách 2 chiều với diag_r() và diag_l() giúp R1 uốn lượn qua dãy vách đá phức tạp.'
    }),

    /* ---- Màn 20 (che-di-cheo.10): Trùm chương 2 (2 sân) ---- */
    manDC({
      id: 6520, chuong: 'che-di-cheo', so: 10, ma: 'che-di-cheo.10',
      ten: 'Trùm chế lệnh đi chéo', hang: 'trum',
      huyHieu: { ma: 'che-di-cheo', ten: 'Kỹ Sư Lách Chéo' },
      hamCuaEmCan: ['move', 'forward', 'lob', 'bypass_r', 'diag_lob', 'auto_bypass'],
      deBai: 'Hành lang mỏ gồm 2 nhánh nối bằng bước lách chéo. Hãy gọi `auto_bypass()` để vượt chặng đầu ở nhánh trái, tiếp theo gọi `diag_lob()` để lách sang nhánh giữa và hất đá lấp hố, rồi gọi `auto_bypass()` 2 lần nữa để lên tới cờ.',
      veMaMau: 'Chương trình có sẵn đã gọi auto_bypass() và diag_lob(). Hãy gọi thêm 2 lần auto_bypass() để lên tới cờ.',
      goiY: [
        'Bước 1: gọi auto_bypass() đưa R1 từ (1, 8) lên (1, 6).',
        'Bước 2: gọi diag_lob() để lách sang (2, 5) và hất viên đá ở (2, 4) lấp hố ở (2, 3).',
        'Bước 3: gọi auto_bypass() 2 lần để từ (2, 5) vượt qua (2, 3) lên cờ ở (2, 1).'
      ],
      san: [
        [
          '######',
          '#.F..#',
          '#....#',
          '#.u..#',
          '#.o..#',
          '#....#',
          '#....#',
          '#.#..#',
          '#....#',
          '######'
        ],
        [
          '######',
          '#.F..#',
          '#.#..#',
          '#.u..#',
          '#.o..#',
          '#....#',
          '#....#',
          '#....#',
          '#....#',
          '######'
        ]
      ],
      batDau: [
        { x: 1, y: 8, huong: 0 },
        { x: 1, y: 8, huong: 0 }
      ],
      maMau: bai(['auto_bypass()', 'diag_lob()']),
      loiGiai: bai(['auto_bypass()', 'diag_lob()', 'auto_bypass()', 'auto_bypass()']),
      sao: { o: 22, nhip: 9 },
      loiGiaiKhac: {
        moTa: 'Dùng vòng lặp for 2 lần cho hai lệnh auto_bypass() cuối',
        baiLam: bai(['auto_bypass()', 'diag_lob()', 'for i in range(2):', '    auto_bypass()'])
      },
      loiSai: [
        { moTa: 'Mới gọi 1 lần auto_bypass() ở nhánh giữa nên dừng ở (2, 3) chưa tới cờ', baiLam: bai(['auto_bypass()', 'diag_lob()', 'auto_bypass()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Gọi diag_lob() ngay từ đầu trước khi qua chặng đầu nên xúc hụt', baiLam: bai(['diag_lob()', 'auto_bypass()', 'auto_bypass()']), phaiCoMa: ['nap-hut', 'chua-toi-co'] }
      ],
      loiBinh: 'Ghép auto_bypass() và diag_lob() giúp R1 tự thích ứng với trụ đá ở cả hai sân và về đích gọn gàng.'
    })
  ];

  ManHoc.manDiCheo = DS;
  if (laNode) module.exports = DS;
})();
