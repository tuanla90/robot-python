/* ============================================================================
   man-di-cheo.js — Mùa "Mỏ đá" · Gói 5 "Đi chéo" (20 màn) — LÀM LẠI 15/11 (ghép nhịp 5a, cfg.cheoGhep)
   Bánh omni cộng hai chuyển động: tới và ngang. slide_* cùng nhịp với hai bánh ĐI THẲNG (tiến / lùi) = đi chéo 1 ô.
   - Chương 1: di-cheo (di-cheo.1 .. .10) — "Lách chéo vách đá": ghép bằng LỆNH GỐC.
     .1 trình diễn (khoá) · .2 ÉP: tách nhịp là rơi hố · .3 chéo trái + phải · .4 for · .5 chéo LÙI ·
     .6 thả hàm cũ + lob() · .7 ziczac · .8 radar: thêm trượt vào nhịp tiến (2 sân) · .9 bàn xoay · .10 trùm (2 sân).
     Màn 1–5 giấu hàm của em (camHamCuaEm) để em tự ghép; từ màn 6 thả.
   - Chương 2: che-di-cheo (che-di-cheo.1 .. .10) — "Chế lệnh: đi chéo": bốn hàm của em
     dir_fr() (trình diễn), dir_fl(), dir_br(), dir_bl() (em tự viết); .8 sửa hàm hỏng (trượt + quay không ghép được);
     .7, .9 radar 2 sân; .10 trùm 2 sân.
   diag_left() / diag_right() là LỆNH CŨ: gói này thôi dạy, khay không còn; lõi vẫn giữ cho mã cũ.
   Toàn bộ 20 màn chạy trên Máy khai mỏ R1 (loaiRobot: 'omni', tay: 'nem',
   camBien: [{ ma: 'radar', o: 'tren' }], tamNemMacDinh: 2, daLapHo: true); cờ cheoGhep do lo-trinh-hoc.js bật cho gói 5–10.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  /* Khay của gói 5 mới: KHÔNG còn diag_left / diag_right (lệnh cũ, thôi dạy; lõi vẫn giữ cho mã cũ). */
  var KHAY_GHEP = ['left_move', 'right_move', 'left_back', 'right_back', 'slide_left', 'slide_right', 'wait', 'load', 'throw', 'radar'];
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


  function manDC(o) {
    return Object.assign({
      loaiRobot: 'omni',
      robot: ROBOT_DI_CHEO,
      tamNemMacDinh: 2,
      daLapHo: true,
      hamGoc: KHAY_GHEP,
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
  /* Màn chéo ghép: màn 1–5 chương 1 giấu hàm của em (camHamCuaEm) để em tự ghép bằng lệnh gốc; từ màn 6 thả (camHamCuaEm: false). */
  function manGhep(o) {
    return manDC(Object.assign({ camHamCuaEm: true, phienBanNoiDung: 3 }, o));
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
       Bốn hàm của em, mỗi hàm một bước chéo (f = tới, b = lùi, l / r = trái / phải so với hướng mặt):
       1. dir_fr()   (che-di-cheo.1, TRÌNH DIỄN, hàm viết sẵn)
       2. dir_fl()   (che-di-cheo.2, em tự viết)
       3. dir_br()   (che-di-cheo.3, em tự viết)
       4. dir_bl()   (che-di-cheo.4, em tự viết)
       Sửa hàm hỏng:
       - dir_bl()    (che-di-cheo.8: thiếu một bánh thì thành trượt + quay, không ghép được)
       ======================================================================== */

    /* ---- Màn 11 (che-di-cheo.1): TRÌNH DIỄN hàm dir_fr() ---- */
    manGhep({
      id: 6511, chuong: 'che-di-cheo', so: 1, ma: 'che-di-cheo.1',
      ten: 'Gói bước chéo thành một lệnh', hang: 'lam-quen',
      camHamCuaEm: false,
      taoHam: ['dir_fr'],
      chiChay: true, chinhCoDinh: true,
      deBai: 'Mỗi bước chéo đang tốn bốn dòng lệnh. Sola gói bốn dòng đó vào hàm `dir_fr()`: một bước chéo tiến-phải. Bấm Chạy để xem R1 leo rãnh chéo bằng ba lần gọi.',
      veMaMau: 'Chương trình và hàm dir_fr() đã viết sẵn và khóa. Bấm Chạy, rồi mở Xưởng hàm xem thân hàm.',
      goiY: ['Bấm nút Chạy. Mỗi lần gọi dir_fr() là một nhịp: trượt phải cộng tiến.'],
      san: [
        '######',
        '#...F#',
        '#.#..#',
        '##...#',
        '#....#',
        '######'
      ],
      batDau: { x: 1, y: 4, huong: 0 },
      maMau: bai(['dir_fr()', 'dir_fr()', 'dir_fr()'], { hamCuaEmMoi: [H('dir_fr', [], FR)] }),
      loiGiai: bai(['dir_fr()', 'dir_fr()', 'dir_fr()'], { hamCuaEmMoi: [H('dir_fr', [], FR)] }),
      sao: { o: 7, nhip: 3 },
      loiBinh: 'Tên hàm nói rõ ngả đi: f là tới, r là phải. dir_fr() đã vào kho lệnh của em.'
    }),

    /* ---- Màn 12 (che-di-cheo.2): em tự viết dir_fl() ---- */
    manGhep({
      id: 6512, chuong: 'che-di-cheo', so: 2, ma: 'che-di-cheo.2',
      ten: 'Chế hàm chéo tiến-trái', hang: 'lam-quen',
      camHamCuaEm: false,
      canHam: 'tran-khung',
      taoHam: ['dir_fl'],
      chinhCoDinh: true,
      deBai: 'Lối lên cờ chạy chéo sang trái, hố sâu nằm sát hai bên. Hãy viết hàm `dir_fl()`: một bước chéo tiến-trái trong một nhịp.',
      veMaMau: 'Chương trình chính đã gọi sẵn dir_fl() ba lần. Thân hàm mới chỉ trượt trái. Hãy vào Xưởng hàm viết cho đủ.',
      goiY: [
        'Hàm dir_fr() trong kho là mẫu: trượt, hai bánh tiến, rồi wait().',
        'Trong def dir_fl(): viết slide_left(), left_move(), right_move(), rồi wait().'
      ],
      san: [
        '######',
        '#Fu..#',
        '#u.u.#',
        '#.u.u#',
        '#..u.#',
        '######'
      ],
      batDau: { x: 4, y: 4, huong: 0 },
      maMau: bai(['dir_fl()', 'dir_fl()', 'dir_fl()'], { hamCuaEmMoi: [H('dir_fl', [], ['slide_left()', 'wait()'])] }),
      loiGiai: bai(['dir_fl()', 'dir_fl()', 'dir_fl()'], { hamCuaEmMoi: [H('dir_fl', [], FL)] }),
      sao: { o: 7, nhip: 3 },
      loiSai: [
        { moTa: 'Trong dir_fl() trượt trái một nhịp riêng rồi mới tiến nên rơi xuống hố', baiLam: bai(['dir_fl()', 'dir_fl()', 'dir_fl()']), hamCuaEmMoi: [H('dir_fl', [], ['slide_left()', 'wait()', 'left_move()', 'right_move()', 'wait()'])], phaiCoMa: ['roi-ho'] },
        { moTa: 'Trong dir_fl() trượt nhầm sang phải nên đâm vào vách đá', baiLam: bai(['dir_fl()', 'dir_fl()', 'dir_fl()']), hamCuaEmMoi: [H('dir_fl', [], FR)], phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      loiBinh: 'Cả hàm chỉ có một wait() ở cuối, nên trượt và tiến chung một nhịp.'
    }),

    /* ---- Màn 13 (che-di-cheo.3): em tự viết dir_br() ---- */
    manGhep({
      id: 6513, chuong: 'che-di-cheo', so: 3, ma: 'che-di-cheo.3',
      ten: 'Chế hàm chéo lùi-phải', hang: 'lam-quen',
      camHamCuaEm: false,
      canHam: 'tran-khung',
      taoHam: ['dir_br'],
      chinhCoDinh: true,
      deBai: 'Cờ nằm phía sau, lệch sang phải. Hãy viết hàm `dir_br()`: một bước chéo lùi-phải trong một nhịp. Chữ b là lùi.',
      veMaMau: 'Chương trình chính đã gọi sẵn dir_br() ba lần. Thân hàm mới chỉ trượt phải. Hãy vào Xưởng hàm viết cho đủ.',
      goiY: [
        'Lùi thẳng là left_back() và right_back().',
        'Trong def dir_br(): viết slide_right(), left_back(), right_back(), rồi wait().'
      ],
      san: [
        '######',
        '#.u..#',
        '#u.u.#',
        '#.u.u#',
        '#..uF#',
        '######'
      ],
      batDau: { x: 1, y: 1, huong: 0 },
      maMau: bai(['dir_br()', 'dir_br()', 'dir_br()'], { hamCuaEmMoi: [H('dir_br', [], ['slide_right()', 'wait()'])] }),
      loiGiai: bai(['dir_br()', 'dir_br()', 'dir_br()'], { hamCuaEmMoi: [H('dir_br', [], BR)] }),
      sao: { o: 7, nhip: 3 },
      loiSai: [
        { moTa: 'Trong dir_br() ghép trượt phải với tiến nên đâm vào vách đá phía trên', baiLam: bai(['dir_br()', 'dir_br()', 'dir_br()']), hamCuaEmMoi: [H('dir_br', [], FR)], phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Trong dir_br() trượt phải một nhịp riêng rồi mới lùi nên rơi xuống hố', baiLam: bai(['dir_br()', 'dir_br()', 'dir_br()']), hamCuaEmMoi: [H('dir_br', [], ['slide_right()', 'wait()', 'left_back()', 'right_back()', 'wait()'])], phaiCoMa: ['roi-ho'] }
      ],
      loiBinh: 'dir_br() đưa R1 lùi chéo sang phải. Mũi xe vẫn nhìn lên.'
    }),

    /* ---- Màn 14 (che-di-cheo.4): em tự viết dir_bl() — đủ bốn ngả ---- */
    manGhep({
      id: 6514, chuong: 'che-di-cheo', so: 4, ma: 'che-di-cheo.4',
      ten: 'Chế hàm chéo lùi-trái', hang: 'luyen',
      camHamCuaEm: false,
      canHam: 'tran-khung',
      taoHam: ['dir_bl'],
      chinhCoDinh: true,
      deBai: 'Còn thiếu một ngả chéo: lùi-trái. Hãy viết hàm `dir_bl()` để R1 lùi chéo sang trái ba bước tới cờ.',
      veMaMau: 'Chương trình chính đã gọi sẵn dir_bl() trong vòng lặp. Thân hàm còn trống phần trượt và lùi. Hãy vào Xưởng hàm viết cho đủ.',
      goiY: [
        'Nhìn tên hàm: b là lùi, l là trái.',
        'Trong def dir_bl(): viết slide_left(), left_back(), right_back(), rồi wait().'
      ],
      san: [
        '######',
        '#..u.#',
        '#.u.u#',
        '#u.u.#',
        '#Fu..#',
        '######'
      ],
      batDau: { x: 4, y: 1, huong: 0 },
      maMau: bai(['for i in range(3):', '    dir_bl()'], { hamCuaEmMoi: [H('dir_bl', [], ['wait()'])] }),
      loiGiai: bai(['for i in range(3):', '    dir_bl()'], { hamCuaEmMoi: [H('dir_bl', [], BL)] }),
      sao: { o: 6, nhip: 3 },
      loiSai: [
        { moTa: 'Trong dir_bl() trượt nhầm sang phải nên đâm vào vách đá', baiLam: bai(['for i in range(3):', '    dir_bl()']), hamCuaEmMoi: [H('dir_bl', [], BR)], phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Trong dir_bl() lùi một nhịp riêng rồi mới trượt nên rơi xuống hố', baiLam: bai(['for i in range(3):', '    dir_bl()']), hamCuaEmMoi: [H('dir_bl', [], ['left_back()', 'right_back()', 'wait()', 'slide_left()', 'wait()'])], phaiCoMa: ['roi-ho'] }
      ],
      loiBinh: 'Kho lệnh của em đã đủ bốn ngả chéo: dir_fl(), dir_fr(), dir_bl(), dir_br().'
    }),

    /* ---- Màn 15 (che-di-cheo.5): luyện dir_fr(), dir_fl() với lob() ---- */
    manGhep({
      id: 6515, chuong: 'che-di-cheo', so: 5, ma: 'che-di-cheo.5',
      ten: 'Đường chéo chữ V', hang: 'luyen',
      camHamCuaEm: false,
      hamCuaEmCan: ['forward', 'lob', 'dir_fr', 'dir_fl'],
      deBai: 'Vách đá chắn lối thẳng. Viên đá tròn nằm ở cột giữa, trước nó là hố sâu rồi tới cờ. Hãy đi chéo vòng qua vách đá vào ngay dưới viên đá, hất đá lấp hố, rồi tiến tới cờ.',
      veMaMau: 'Chương trình có sẵn đã vòng qua vách đá và tiến 3 ô, nhưng quên hất đá lấp hố.',
      goiY: [
        'Sau ba bước chéo, R1 ở (2, 4), ngay dưới viên đá ở (2, 3).',
        'Gọi lob() trước forward(3).'
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
      maMau: bai(['dir_fr()', 'dir_fr()', 'dir_fl()', 'forward(3)']),
      loiGiai: bai(['dir_fr()', 'dir_fr()', 'dir_fl()', 'lob()', 'forward(3)']),
      sao: { o: 22, nhip: 8 },
      loiSai: [
        { moTa: 'Quên gọi lob() nên đâm vào viên đá ở (2, 3)', baiLam: bai(['dir_fr()', 'dir_fr()', 'dir_fl()', 'forward(3)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Mới đi chéo phải một bước đã chéo trái nên đâm vào vách đá', baiLam: bai(['dir_fr()', 'dir_fl()', 'lob()', 'forward(3)']), phaiCoMa: ['dam-tuong'] }
      ],
      loiBinh: 'Ba lời gọi ngắn thay cho mười hai dòng lệnh gốc.'
    }),

    /* ---- Màn 16 (che-di-cheo.6): luyện đủ ngả tiến và lùi ---- */
    manGhep({
      id: 6516, chuong: 'che-di-cheo', so: 6, ma: 'che-di-cheo.6',
      ten: 'Lên chéo, lùi chéo', hang: 'luyen',
      camHamCuaEm: false,
      hamCuaEmCan: ['dir_fr', 'dir_br', 'dir_bl'],
      deBai: 'Lối đi gấp khúc giữa bãi hố: chéo lên phải, chéo lùi sang phải, rồi chéo lùi sang trái tới cờ. Mỗi đoạn dài 2 bước. Hãy chọn đúng hàm cho từng đoạn.',
      veMaMau: 'Chương trình có sẵn mới đi hai đoạn đầu. Hãy viết thêm đoạn cuối.',
      goiY: [
        'Đoạn cuối đi về phía sau và sang trái.',
        'Gọi dir_bl() hai lần.'
      ],
      san: [
        '#######',
        '#.u.u.#',
        '#u.u.u#',
        '#.u.u.#',
        '#..u.u#',
        '#..Fu.#',
        '#######'
      ],
      batDau: { x: 1, y: 3, huong: 0 },
      maMau: bai(['dir_fr()', 'dir_fr()', 'dir_br()', 'dir_br()']),
      loiGiai: bai(['dir_fr()', 'dir_fr()', 'dir_br()', 'dir_br()', 'dir_bl()', 'dir_bl()']),
      sao: { o: 18, nhip: 6 },
      loiSai: [
        { moTa: 'Mới đi hai đoạn đầu nên dừng ở (5, 3)', baiLam: bai(['dir_fr()', 'dir_fr()', 'dir_br()', 'dir_br()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đoạn cuối gọi nhầm dir_fl() nên R1 quay ngược lên trên', baiLam: bai(['dir_fr()', 'dir_fr()', 'dir_br()', 'dir_br()', 'dir_fl()', 'dir_fl()']), phaiCoMa: ['chua-toi-co'] }
      ],
      loiBinh: 'Sáu bước chéo, ba ngả khác nhau, R1 không quay xe lần nào.'
    }),

    /* ---- Màn 17 (che-di-cheo.7): radar — gặp vách đá thì dir_fr(), không thì move() (2 sân) ---- */
    manGhep({
      id: 6517, chuong: 'che-di-cheo', so: 7, ma: 'che-di-cheo.7',
      ten: 'Radar báo lách chéo', hang: 'bien-the',
      camHamCuaEm: false,
      hamCuaEmCan: ['move', 'dir_fr'],
      deBai: 'Đường lên cờ dài 4 bước. Có bước bị vách đá `#` chắn ngay trước mặt. Mỗi bước hãy quét `g = radar()` và đọc `t = g[0][1]`. Nếu `t == "#"` thì đi chéo tiến-phải, còn không thì tiến thẳng.',
      veMaMau: 'Chương trình có sẵn mới có nhánh if khi gặp vách đá. Hãy thêm nhánh else để tiến thẳng.',
      goiY: [
        'Thêm else: ngay dưới nhánh if.',
        'Trong nhánh else gọi move().'
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
      maMau: bai(['for i in range(4):', '    g = radar()', '    t = g[0][1]', '    if t == "#":', '        dir_fr()']),
      loiGiai: bai(['for i in range(4):', '    g = radar()', '    t = g[0][1]', '    if t == "#":', '        dir_fr()', '    else:', '        move()']),
      sao: { o: 14, nhip: 4 },
      loiSai: [
        { moTa: 'Thiếu nhánh else nên gặp ô trống R1 đứng yên', baiLam: bai(['for i in range(4):', '    g = radar()', '    t = g[0][1]', '    if t == "#":', '        dir_fr()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Tiến thẳng cả 4 bước, không hỏi radar, nên đâm vào vách đá', baiLam: bai(['for i in range(4):', '    move()']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      loiBinh: 'Một chương trình chạy đúng trên cả hai sân vì radar quyết định từng bước.'
    }),

    /* ---- Màn 18 (che-di-cheo.8): SỬA HÀM HỎNG dir_bl() — thiếu một bánh thành trượt + quay, không ghép được ---- */
    manGhep({
      id: 6518, chuong: 'che-di-cheo', so: 8, ma: 'che-di-cheo.8',
      ten: 'Sửa hàm chéo lùi-trái', hang: 'bien-the',
      camHamCuaEm: false,
      suaHam: ['dir_bl'],
      chinhCoDinh: true,
      hamCuaEmCan: ['dir_bl'],
      deBai: 'Luna sửa hàm `dir_bl()` và lỡ tay xóa mất một dòng. Giờ R1 chỉ trượt ngang, không lùi. Trượt chỉ ghép được với đi thẳng: cả hai bánh cùng lùi, hay cùng tiến. Hãy sửa lại hàm.',
      veMaMau: 'Chương trình chính đã khóa. Mở hàm dir_bl() trong Xưởng hàm và tìm dòng bị thiếu.',
      goiY: [
        'Trong hàm mới có left_back(). Một bánh lùi là quay xe, không phải đi thẳng.',
        'Thêm right_back() vào trước wait().'
      ],
      san: [
        '######',
        '#....#',
        '#....#',
        '#....#',
        '#F...#',
        '######'
      ],
      batDau: { x: 4, y: 1, huong: 0 },
      maMau: bai(['for i in range(3):', '    dir_bl()'], { hamCuaEmMoi: [H('dir_bl', [], ['slide_left()', 'left_back()', 'wait()'])] }),
      loiGiai: bai(['for i in range(3):', '    dir_bl()'], { hamCuaEmMoi: [H('dir_bl', [], BL)] }),
      sao: { o: 6, nhip: 3 },
      loiSai: [
        { moTa: 'Không sửa dir_bl(): trượt ghép với một bánh lùi thì lệnh bánh bị bỏ, R1 chỉ trượt ngang', baiLam: bai(['for i in range(3):', '    dir_bl()']), hamCuaEmMoi: [H('dir_bl', [], ['slide_left()', 'left_back()', 'wait()'])], phaiCoMa: ['omni-khong-cheo', 'chua-toi-co'] },
        { moTa: 'Thêm nhầm right_move(): một bánh lùi, một bánh tiến là quay đầu, vẫn không ghép được', baiLam: bai(['for i in range(3):', '    dir_bl()']), hamCuaEmMoi: [H('dir_bl', [], ['slide_left()', 'left_back()', 'right_move()', 'wait()'])], phaiCoMa: ['omni-khong-cheo', 'chua-toi-co'] }
      ],
      loiBinh: 'Trượt cộng đi thẳng thì thành chéo. Trượt cộng quay thì xe chỉ trượt.'
    }),

    /* ---- Màn 19 (che-di-cheo.9): radar nhìn góc SAU chọn dir_br() hay dir_bl() (2 sân) ---- */
    manGhep({
      id: 6519, chuong: 'che-di-cheo', so: 9, ma: 'che-di-cheo.9',
      ten: 'Lùi chéo theo radar', hang: 'bien-the',
      camHamCuaEm: false,
      hamCuaEmCan: ['dir_br', 'dir_bl'],
      deBai: 'R1 phải lùi chéo 4 bước xuống cờ qua các khe đá. Hai sân có khe khác nhau. Mỗi bước hãy quét `g = radar()` và đọc `t = g[2][2]`, ô chéo lùi-phải. Ô đó không phải vách đá `#` thì lùi chéo sang phải, còn không thì lùi chéo sang trái.',
      veMaMau: 'Chương trình có sẵn mới lùi chéo sang phải khi ô đó trống. Hãy thêm nhánh else.',
      goiY: [
        'Hàng g[2] là hàng phía sau R1. g[2][2] là góc sau bên phải.',
        'Trong nhánh else gọi dir_bl().'
      ],
      san: [
        [
          '######',
          '#....#',
          '#..###',
          '#...##',
          '#..###',
          '#.F..#',
          '######'
        ],
        [
          '######',
          '#....#',
          '###..#',
          '##...#',
          '###..#',
          '#..F.#',
          '######'
        ]
      ],
      batDau: [
        { x: 2, y: 1, huong: 0 },
        { x: 3, y: 1, huong: 0 }
      ],
      maMau: bai(['for i in range(4):', '    g = radar()', '    t = g[2][2]', '    if t != "#":', '        dir_br()']),
      loiGiai: bai(['for i in range(4):', '    g = radar()', '    t = g[2][2]', '    if t != "#":', '        dir_br()', '    else:', '        dir_bl()']),
      sao: { o: 15, nhip: 4 },
      loiSai: [
        { moTa: 'Chưa có nhánh else gọi dir_bl() nên chưa xuống tới cờ', baiLam: bai(['for i in range(4):', '    g = radar()', '    t = g[2][2]', '    if t != "#":', '        dir_br()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Bước nào cũng gọi dir_br(), không hỏi radar, nên đâm vào vách đá', baiLam: bai(['for i in range(4):', '    dir_br()']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      loiBinh: 'Radar nhìn được cả phía sau. R1 lùi chéo mà không cần quay đầu lại nhìn.'
    }),

    /* ---- Màn 20 (che-di-cheo.10): TRÙM chương 2 (2 sân): radar + fill_pit() + dir_fr() / dir_fl() ---- */
    manGhep({
      id: 6520, chuong: 'che-di-cheo', so: 10, ma: 'che-di-cheo.10',
      ten: 'Trùm chế lệnh đi chéo', hang: 'trum',
      camHamCuaEm: false,
      huyHieu: { ma: 'che-di-cheo', ten: 'Thợ Chế Lệnh Chéo' },
      hamCuaEmCan: ['move', 'fill_pit', 'dir_fr', 'dir_fl'],
      deBai: 'Đường mỏ có 3 chặng, mỗi chặng 2 hàng, rồi thêm 1 ô cuối vào cờ. Đầu mỗi chặng hãy quét `g = radar()` và đọc `t = g[0][1]`. Trước mặt là đá tròn `"V"` thì hất đá lấp hố rồi đi qua. Còn không thì trước mặt là trụ đá: vòng qua bằng hai bước chéo.',
      veMaMau: 'Chương trình có sẵn mới có nhánh if gọi fill_pit(). Hãy viết nhánh else và bước cuối vào cờ.',
      goiY: [
        'Vòng qua trụ đá: một bước chéo tiến-phải rồi một bước chéo tiến-trái.',
        'Trong nhánh else gọi dir_fr() rồi dir_fl(). Sau vòng lặp gọi move().'
      ],
      san: [
        [
          '#####',
          '#.F.#',
          '#...#',
          '#.#.#',
          '#...#',
          '#.#.#',
          '#.u.#',
          '#.o.#',
          '#...#',
          '#####'
        ],
        [
          '#####',
          '#.F.#',
          '#...#',
          '#.#.#',
          '#.u.#',
          '#.o.#',
          '#...#',
          '#.#.#',
          '#...#',
          '#####'
        ]
      ],
      batDau: [
        { x: 2, y: 8, huong: 0 },
        { x: 2, y: 8, huong: 0 }
      ],
      maMau: bai(['for i in range(3):', '    g = radar()', '    t = g[0][1]', '    if t == "V":', '        fill_pit()']),
      loiGiai: bai(['for i in range(3):', '    g = radar()', '    t = g[0][1]', '    if t == "V":', '        fill_pit()', '    else:', '        dir_fr()', '        dir_fl()', 'move()']),
      sao: { o: 28, nhip: 9 },
      loiSai: [
        { moTa: 'Thiếu nhánh else vòng qua trụ đá và lệnh move() cuối', baiLam: bai(['for i in range(3):', '    g = radar()', '    t = g[0][1]', '    if t == "V":', '        fill_pit()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Chỉ đi chéo mà không lấp hố khi gặp đá nên rơi xuống hố sâu', baiLam: bai(['for i in range(3):', '    dir_fr()', '    dir_fl()', 'move()']), phaiCoMa: ['roi-ho'] }
      ],
      loiBinh: 'Radar chọn việc, fill_pit() lấp hố, dir_fr() và dir_fl() vòng qua trụ đá. R1 qua được cả hai sân.'
    })
  ];

  ManHoc.manDiCheo = DS;
  if (laNode) module.exports = DS;
})();
