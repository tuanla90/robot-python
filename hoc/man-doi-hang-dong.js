/* ============================================================================
   man-doi-hang-dong.js - Mùa 8 Hang động đá vôi: GÓI 9 "Đội thám hiểm hang" (20 màn)
     Chương 1: doi-hang-dong     (10 màn: phối hợp R1 Bánh gai thám hiểm hang + R2 Omni mỏ đá)
     Chương 2: che-doi-hang-dong (10 màn: chế hàm phối hợp hai robot trong hang đá vôi)

   Luật đội R1 + R2 gói 9:
     - R1 (vàng, Sola): Thân 'gai' (thuGai: true), tay 'loa' (phatNot: true),
                        cảm biến 'am-thanh' (phanAm: true, hear, listen).
     - R2 (lam, Luna):  Thân 'omni' (omniCheo: true), tay 'nem' (chinhLuc: true,
                        tamNemMacDinh: 2, daLapHo: true), cảm biến 'radar' (nhanDang: true, shape).
   ========================================================================== */
(function () {
  'use strict';

  var M = (typeof window !== 'undefined' && window.ManHoc) ||
    (typeof require === 'function' ? require('./man-chuoi-1.js') : null);

  var CAU_TRUC = ['for', 'while', 'if', 'elif', 'else', 'def', 'return', 'list', 'dict', 'set'];
  var GOC_R1 = [
    'left_move', 'right_move', 'left_back', 'right_back', 'wait',
    'retract_spikes', 'extend_spikes', 'beat', 'note', 'hear', 'listen'
  ];
  var GOC_R2 = [
    'left_move', 'right_move', 'left_back', 'right_back', 'slide_left', 'slide_right', 'wait',
    'load', 'throw', 'radar', 'diag_left', 'diag_right', 'aim', 'shape'
  ];

  function taoR1(bd) {
    return {
      batDau: bd,
      loaiRobot: 'gai',
      thuGai: true,
      phatNot: true,
      phanAm: true,
      robot: { than: 'gai', tay: 'loa', camBien: [{ ma: 'am-thanh', o: 'tren', phanAm: true }] },
      hamGoc: GOC_R1.slice()
    };
  }
  function taoR2(bd) {
    return {
      batDau: bd,
      loaiRobot: 'omni',
      omniCheo: true,
      chinhLuc: true,
      nhanDang: true,
      tamNemMacDinh: 2,
      daLapHo: true,
      robot: { than: 'omni', tay: 'nem', camBien: [{ ma: 'radar', o: 'tren', nhanDang: true }], son: 'lam' },
      hamGoc: GOC_R2.slice()
    };
  }

  function baiDoi(c1, c2, hamEm, hamMan) {
    return {
      doi: [{ chinh: (c1 || []).slice() }, { chinh: (c2 || []).slice() }],
      hamCuaMan: (hamMan || []).slice(),
      hamCuaEmMoi: (hamEm || []).slice()
    };
  }
  function ham(ten, than, thamSo) {
    return { ten: ten, thamSo: (thamSo || []).slice(), than: (than || []).slice() };
  }

  function manDoiHang(chuong, so, hang, d) {
    var nhieuSan = Array.isArray(d.san && d.san[0]);
    var r1 = taoR1(d.bd[0]), r2 = taoR2(d.bd[1]);
    if (d.khoa !== undefined) {
      [].concat(d.khoa).forEach(function (k) {
        if (k === 0) r1.coDinh = true;
        if (k === 1) r2.coDinh = true;
      });
    }
    var kq = Object.assign({
      id: chuong + '.' + so,
      chuong: chuong,
      so: so,
      hang: hang,
      loaiRobot: 'gai',
      thuGai: true,
      phatNot: true,
      phanAm: true,
      omniCheo: true,
      chinhLuc: true,
      nhanDang: true,
      tamNemMacDinh: 2,
      daLapHo: true,
      robot: JSON.parse(JSON.stringify(r1.robot)),
      batDau: d.bd[0],
      doi: [r1, r2],
      moXuong: true,
      camHamCuaEm: false,
      taoHam: [],
      hamCuaEmCan: [],
      khung: { ham: 10, chinh: 10, cauTruc: CAU_TRUC },
      cauTruc: CAU_TRUC,
      hamGoc: GOC_R1.slice(),
      mucTieu: 'toi-co',
      nhipTheo: nhieuSan ? 'tong' : undefined,
      nhipToiDa: d.nhipToiDa || (d.sao && d.sao.nhip ? d.sao.nhip + 14 : 45),
      loiSai: []
    }, d);
    if (kq.hamCuaEmCan && kq.hamCuaEmCan.indexOf('slide_r') < 0) kq.hamCuaEmCan = kq.hamCuaEmCan.concat(['slide_r']);
    delete kq.bd;
    delete kq.khoa;
    return kq;
  }

  function manDH(so, hang, d) { return manDoiHang('doi-hang-dong', so, hang, d); }
  function manCheDH(so, hang, d) { return manDoiHang('che-doi-hang-dong', so, hang, d); }

  var DS = [
    /* ========================================================================
       CHƯƠNG 1: doi-hang-dong - Đội thám hiểm hang (10 màn)
       ====================================================================== */
    manDH(1, 'lam-quen', {
      ten: 'R2 hất đá lấp hố cho R1',
      chiChay: true, chinhCoDinh: true, khoa: [0, 1],
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'lob'],
      deBai: 'R2 (xe omni mỏ đá của Luna) tiến vào hang hỗ trợ R1! Ở làn trên, R1 gặp hố sâu u giữa nền đá vôi ướt I. Từ làn dưới, R2 dùng lob() hất hòn đá o bay lên lấp đầy hố u ở (2, 1), rồi trượt ngang về cờ. Bấm Chạy để xem hai robot phối hợp.',
      veMaMau: 'R2 hất đá lấp hố trong 2 nhịp rồi trượt sang phải; R1 chờ 2 nhịp rồi đi qua hố đã lấp tới cờ.',
      san: ['######', '#.uIF#', '##o###', '#..F##', '######'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 3, huong: 0 }],
      maMau: baiDoi(['wait_n(2)', 'forward(3)'], ['lob()', 'slide_r(1)']),
      loiGiai: baiDoi(['wait_n(2)', 'forward(3)'], ['lob()', 'slide_r(1)']),
      sao: { o: 18, nhip: 5 },
      goiY: ['Bấm nút Chạy để quan sát R2 hất đá lấp hố cho R1 đi qua.', 'Màn 1 chỉ cần chạy thử, chưa cần sửa mã.']
    }),

    manDH(2, 'lam-quen', {
      ten: 'Hất đá đè nút mở cổng hang',
      khoa: [0],
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'aim_lob'],
      deBai: 'Cổng sắt C ở (3, 1) chặn đường R1 trên nền đá ướt. R1 đã khóa chương trình: chờ 2 nhịp rồi tiến 3 ô tới cờ. Hãy sửa chương trình của R2: dùng aim_lob(3) hất hòn đá o qua hàng rào = lên nút đè M ở (2, 2) để mở cổng C, rồi gọi slide_r(1) về cờ.',
      veMaMau: 'R2 đang gọi aim_lob(2) nên đá rơi trúng hàng rào =, chưa tới nút M.',
      san: ['######', '#.ICF#', '##M###', '##=###', '##o###', '#..F##', '######'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 5, huong: 0 }],
      noi: [{ nut: { x: 2, y: 2 }, cua: [{ x: 3, y: 1 }] }],
      maMau: baiDoi(['wait_n(2)', 'forward(3)'], ['aim_lob(2)', 'slide_r(1)']),
      loiGiai: baiDoi(['wait_n(2)', 'forward(3)'], ['aim_lob(3)', 'slide_r(1)']),
      loiSai: [
        { moTa: 'Để nguyên aim_lob(2): đá rơi trúng hàng rào = ở (2, 3), cổng C không mở', baiLam: baiDoi(['wait_n(2)', 'forward(3)'], ['aim_lob(2)', 'slide_r(1)']), phaiCoMa: ['nem-vo', 'dam-tuong'] }
      ],
      sao: { o: 20, nhip: 5 },
      goiY: ['Từ R2 ở (2, 5) tới nút M ở (2, 2) cách 3 ô.', 'Sửa aim_lob(2) thành aim_lob(3).']
    }),

    manDH(3, 'lam-quen', {
      ten: 'R1 phá đá chuông mở đường cho R2',
      khoa: [1],
      hamCuaEmCan: ['move', 'forward', 'go_echo', 'play_note', 'wait_n'],
      deBai: 'Ở 2 sân, một khối đá chuông chặn đường R2 ở làn dưới. R1 ở làn trên cần dùng go_echo() tiến tới chuông đá đối diện vách ngăn (trong tầm cộng hưởng), gọi play_note(listen()) phá vỡ khối đá chuông cho R2 đi qua, rồi gọi move() vào cờ.',
      veMaMau: 'R1 chưa gọi play_note(listen()) nên R2 đâm vào khối đá chuông.',
      san: [
        ['#######', '#.I.F##', '#######', '#....F#', '#######'],
        ['########', '#.II.F##', '########', '#.....F#', '########']
      ],
      bd: [
        [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
        [{ x: 1, y: 3, huong: 1 }, { x: 1, y: 3, huong: 1 }]
      ],
      chuongDa: [
        [{ x: 3, y: 1, not: 4 }],
        [{ x: 4, y: 1, not: 7 }]
      ],
      daChuong: [
        [{ x: 3, y: 3, not: 4, ben: 1 }],
        [{ x: 4, y: 3, not: 7, ben: 1 }]
      ],
      maMau: baiDoi(['go_echo()', 'move()'], ['wait_n(4)', 'forward(5)']),
      loiGiai: baiDoi(['go_echo()', 'play_note(listen())', 'move()'], ['wait_n(4)', 'forward(5)']),
      loiSai: [
        { moTa: 'Quên play_note(listen()) ở R1: khối đá chuông ở làn dưới không vỡ, R2 đâm vào đá', baiLam: baiDoi(['go_echo()', 'move()'], ['wait_n(4)', 'forward(5)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 15, nhip: 17 },
      goiY: ['Khi R1 đứng ở chuông đá (y = 1), khối đá chuông ở (y = 3) cách đúng 2 ô nên nằm trong tầm cộng hưởng của loa.', 'Chèn play_note(listen()) vào giữa go_echo() và move() của R1.']
    }),

    manDH(4, 'lam-quen', {
      ten: 'R2 đi chéo hất đá mở cổng',
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'lob', 'slide_stop'],
      deBai: 'R2 xuất phát ở (1, 5) cần đi chéo sang phải 1 bước bằng diag_right() lên (2, 4) để đứng ngay sau hòn đá o ở (2, 3), sau đó gọi lob() hất đá lên nút M ở (2, 2) mở cổng C cho R1, rồi gọi slide_r(1) vào cờ. R1 chờ 3 nhịp rồi gọi slide_stop() trượt qua đá ướt vào cờ.',
      veMaMau: 'R2 chưa gọi diag_right(), lob(), slide_r(1) nên cổng C vẫn đóng.',
      san: ['#######', '#.IICF#', '##M####', '##o####', '#..F###', '#.#####', '#######'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 5, huong: 0 }],
      noi: [{ nut: { x: 2, y: 2 }, cua: [{ x: 4, y: 1 }] }],
      maMau: baiDoi(['wait_n(3)', 'slide_stop()'], ['move()']),
      loiGiai: baiDoi(['wait_n(3)', 'slide_stop()'], ['diag_right()', 'lob()', 'slide_r(1)']),
      loiSai: [
        { moTa: 'R2 chỉ gọi move(): không nạp được đá và không mở cổng C cho R1', baiLam: baiDoi(['wait_n(3)', 'slide_stop()'], ['move()']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 21, nhip: 5 },
      goiY: ['Từ (1, 5) hướng lên, diag_right() đưa R2 tới (2, 4) ngay dưới hòn đá o ở (2, 3).', 'Viết cho R2: diag_right(), lob(), slide_r(1).']
    }),

    manDH(5, 'cung-co', {
      ten: 'Chế hàm: Hất đá giúp bạn rồi trượt về cờ',
      taoHam: ['fill_for_mate'],
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'aim_lob'],
      deBai: 'Để R2 nhanh chóng hỗ trợ R1 rồi về đích, hãy viết hàm fill_for_mate(k): gọi aim_lob(k) để hất đá xa k ô (lấp hố hoặc đè nút M), rồi gọi slide_r(1) để trượt sang cờ bên phải. Dùng fill_for_mate(3) cho R2.',
      veMaMau: 'Hàm fill_for_mate(k) đang để trống thân hàm.',
      san: ['######', '#.uIF#', '##=###', '##o###', '#..F##', '######'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 4, huong: 0 }],
      maMau: baiDoi(['wait_n(2)', 'forward(3)'], ['fill_for_mate(3)'], [ham('fill_for_mate', [], ['k'])]),
      loiGiai: baiDoi(['wait_n(2)', 'forward(3)'], ['fill_for_mate(3)'], [ham('fill_for_mate', ['aim_lob(k)', 'slide_r(1)'], ['k'])]),
      loiSai: [
        { moTa: 'Để trống fill_for_mate(k): R2 đứng yên, R1 lao xuống hố u', baiLam: baiDoi(['wait_n(2)', 'forward(3)'], ['fill_for_mate(3)'], [ham('fill_for_mate', [], ['k'])]), phaiCoMa: ['loi-cu-phap'] },
        { moTa: 'Quên slide_r(1) trong fill_for_mate(k): R1 tới cờ nhưng R2 chưa về cờ', baiLam: baiDoi(['wait_n(2)', 'forward(3)'], ['fill_for_mate(3)'], [ham('fill_for_mate', ['aim_lob(k)'], ['k'])]), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 21, nhip: 5 },
      goiY: ['Trong fill_for_mate(k), viết 2 dòng: aim_lob(k) và slide_r(1).', 'Từ (2, 4) hướng lên, aim_lob(3) hất đá ở (2, 3) bay 3 ô qua rào = lấp hố u ở (2, 1).']
    }),

    manDH(6, 'cung-co', {
      ten: 'Lấp hố và phá đá hai sân',
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'play_note', 'fill_for_mate'],
      deBai: 'Ở 2 sân, R2 gọi fill_for_mate(3) để lấp hố u ở (2, 1) cho R1. Sau khi chờ 2 nhịp, R1 tiến 1 ô lên (2, 1), gọi play_note(listen()) phá khối đá chuông ở (3, 1) rồi tiến 2 ô tới cờ.',
      veMaMau: 'R1 quên gọi play_note(listen()) trước khi đi qua (3, 1).',
      san: [
        ['######', '#.uIF#', '##=###', '##o###', '#..F##', '######'],
        ['######', '#.uIF#', '##=###', '##o###', '#..F##', '######']
      ],
      bd: [
        [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
        [{ x: 2, y: 4, huong: 0 }, { x: 2, y: 4, huong: 0 }]
      ],
      daChuong: [
        [{ x: 3, y: 1, not: 3, ben: 1 }],
        [{ x: 3, y: 1, not: 6, ben: 1 }]
      ],
      maMau: baiDoi(['wait_n(2)', 'move()', 'forward(2)'], ['fill_for_mate(3)']),
      loiGiai: baiDoi(['wait_n(2)', 'move()', 'play_note(listen())', 'forward(2)'], ['fill_for_mate(3)']),
      loiSai: [
        { moTa: 'R1 quên play_note(listen()): đâm vào khối đá chuông ở (3, 1)', baiLam: baiDoi(['wait_n(2)', 'move()', 'forward(2)'], ['fill_for_mate(3)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'R1 phát cứng play_note(3): ở sân 2 không phá được đá chuông nốt 6', baiLam: baiDoi(['wait_n(2)', 'move()', 'play_note(3)', 'forward(2)'], ['fill_for_mate(3)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'], cung: true }
      ],
      sao: { o: 25, nhip: 12 },
      goiY: ['Sau khi R1 bước lên ô (2, 1) đã lấp, khối đá chuông nằm ngay trước mặt ở (3, 1).', 'Chèn play_note(listen()) giữa move() và forward(2) của R1.']
    }),

    manDH(7, 'cung-co', {
      ten: 'Chế hàm: Đi theo vang phá đá giúp bạn',
      taoHam: ['crack_for_mate'],
      hamCuaEmCan: ['move', 'forward', 'go_echo', 'play_note', 'wait_n'],
      deBai: 'Hãy viết hàm crack_for_mate() cho R1: gọi go_echo() để tiến tới chuông đá, gọi play_note(listen()) để phá khối đá chuông chặn đường R2 ở làn dưới, rồi gọi move() bước vào cờ. R2 chờ 4 nhịp rồi tiến về cờ.',
      veMaMau: 'Hàm crack_for_mate() chưa có thân hàm.',
      san: ['#######', '#.IIF##', '#######', '#....F#', '#######'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 3, huong: 1 }],
      chuongDa: [{ x: 3, y: 1, not: 5 }],
      daChuong: [{ x: 3, y: 3, not: 5, ben: 1 }],
      maMau: baiDoi(['crack_for_mate()'], ['wait_n(4)', 'forward(4)'], [ham('crack_for_mate', [])]),
      loiGiai: baiDoi(['crack_for_mate()'], ['wait_n(4)', 'forward(4)'], [ham('crack_for_mate', ['go_echo()', 'play_note(listen())', 'move()'])]),
      loiSai: [
        { moTa: 'Để trống crack_for_mate(): R1 đứng yên và R2 đâm vào đá chuông', baiLam: baiDoi(['crack_for_mate()'], ['wait_n(4)', 'forward(4)'], [ham('crack_for_mate', [])]), phaiCoMa: ['loi-cu-phap'] },
        { moTa: 'Quên play_note(listen()) trong crack_for_mate(): R2 vẫn bị đá chuông chặn', baiLam: baiDoi(['crack_for_mate()'], ['wait_n(4)', 'forward(4)'], [ham('crack_for_mate', ['go_echo()', 'move()'])]), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 16, nhip: 8 },
      goiY: ['Trong crack_for_mate(), viết 3 dòng: go_echo(), play_note(listen()), move().', 'Cả hai chương trình chính đã gọi sẵn đúng hàm.']
    }),

    manDH(8, 'van-dung', {
      ten: 'Phối hợp đôi qua hai sân',
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'fill_for_mate', 'crack_for_mate'],
      deBai: 'Ở 2 sân, R2 gọi fill_for_mate(3) để hất đá qua hàng rào = lấp hố u ở (2, 1) cho R1 rồi trượt sang cờ. R1 chờ 2 nhịp cho hố lấp xong, rồi gọi crack_for_mate() để tiến theo tiếng vang qua hố, phá đá chuông trước cờ và về đích.',
      veMaMau: 'R1 chưa gọi crack_for_mate() sau khi chờ R2 lấp hố.',
      san: [
        ['#######', '#.uI.F#', '##=####', '##o####', '#..F###', '#######'],
        ['########', '#.uII.F#', '##=#####', '##o#####', '#..F####', '########']
      ],
      bd: [
        [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
        [{ x: 2, y: 4, huong: 0 }, { x: 2, y: 4, huong: 0 }]
      ],
      chuongDa: [
        [{ x: 4, y: 1, not: 3 }],
        [{ x: 5, y: 1, not: 6 }]
      ],
      daChuong: [
        [{ x: 5, y: 1, not: 3, ben: 1 }],
        [{ x: 6, y: 1, not: 6, ben: 1 }]
      ],
      maMau: baiDoi(['wait_n(2)'], ['fill_for_mate(3)']),
      loiGiai: baiDoi(['wait_n(2)', 'crack_for_mate()'], ['fill_for_mate(3)']),
      loiSai: [
        { moTa: 'R1 chỉ gọi wait_n(2): đứng yên ở đầu đường, chưa về cờ', baiLam: baiDoi(['wait_n(2)'], ['fill_for_mate(3)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'R1 không chờ wait_n(2) mà đi ngay: lao xuống hố u trước khi R2 kịp lấp', baiLam: baiDoi(['crack_for_mate()'], ['fill_for_mate(3)']), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 27, nhip: 15 },
      goiY: ['R2 cần 2 nhịp để nạp và hất đá lấp hố u ở (2, 1).', 'R1 gọi wait_n(2) rồi gọi crack_for_mate().']
    }),

    manDH(9, 'van-dung', {
      ten: 'R2 nhận dạng quặng mở cổng cho R1',
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'sort_lob', 'crack_switch'],
      deBai: 'Trước mặt R2 là viên quặng ("ore") cần ném tầm 3 qua hàng rào = lên nút M ở (2, 2) để mở cổng C(4, 2) cho R1. Hãy cho R2 gọi sort_lob() rồi slide_r(1) về cờ; còn R1 gọi crack_switch() trượt xuống nhánh dọc rồi tiến 1 ô qua cổng C vào cờ.',
      veMaMau: 'R2 đang gọi lob() tầm 2 cứng nên đá vướng hàng rào =.',
      san: ['######', '#.III#', '##M#C#', '##=#F#', '##o###', '#..F##', '######'],
      vatDang: ['......', '......', '......', '......', '..q...', '......', '......'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 5, huong: 0 }],
      daChuong: [{ x: 2, y: 1, not: 4, ben: 1 }],
      noi: [{ nut: { x: 2, y: 2 }, cua: [{ x: 4, y: 2 }] }],
      maMau: baiDoi(['crack_switch()', 'forward(2)'], ['lob()', 'slide_r(1)']),
      loiGiai: baiDoi(['crack_switch()', 'forward(2)'], ['sort_lob()', 'slide_r(1)']),
      loiSai: [
        { moTa: 'Để nguyên lob(): đá vướng rào = ở (2, 3), cổng C(4, 2) đóng chặt', baiLam: baiDoi(['crack_switch()', 'forward(2)'], ['lob()', 'slide_r(1)']), phaiCoMa: ['nem-vo', 'dam-tuong'] }
      ],
      sao: { o: 32, nhip: 5 },
      goiY: ['Hàm sort_lob() kiểm tra shape("front") == "ore" để tự động gọi aim_lob(3).', 'Đổi lob() của R2 thành sort_lob().']
    }),

    manDH(10, 'trum', {
      ten: 'Trùm Đội thám hiểm: Mở lối hang sâu',
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'fill_for_mate', 'crack_for_mate'],
      deBai: 'Bài trùm 3 sân! Ở mỗi sân, R2 gọi fill_for_mate(3) để hất đá lấp hố u cho R1 rồi trượt sang phải, sau đó chờ R1 phá khối đá chuông chắn trước cờ của R2 rồi tiến 1 ô vào cờ. R1 chờ 2 nhịp cho hố lấp xong rồi gọi crack_for_mate() vừa phá đá chuông giúp R2 vừa về cờ.',
      veMaMau: 'Phối hợp hai chiều giữa R1 và R2 trên cả 3 sân.',
      san: [
        ['#######', '#.uI.F#', '##=####', '##oF###', '#...###', '#######'],
        ['########', '#.uII.F#', '##=#####', '##oF####', '#....###', '########'],
        ['#########', '#.uIII.F#', '##=######', '##oF#####', '#.....###', '#########']
      ],
      bd: [
        [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
        [{ x: 2, y: 4, huong: 0 }, { x: 2, y: 4, huong: 0 }, { x: 2, y: 4, huong: 0 }]
      ],
      chuongDa: [
        [{ x: 4, y: 1, not: 2 }],
        [{ x: 5, y: 1, not: 5 }],
        [{ x: 6, y: 1, not: 7 }]
      ],
      daChuong: [
        [{ x: 5, y: 1, not: 2, ben: 1 }],
        [{ x: 6, y: 1, not: 5, ben: 1 }],
        [{ x: 7, y: 1, not: 7, ben: 1 }]
      ],
      maMau: baiDoi(['wait_n(2)'], ['fill_for_mate(3)', 'move()']),
      loiGiai: baiDoi(['wait_n(2)', 'crack_for_mate()'], ['fill_for_mate(3)', 'move()']),
      loiSai: [
        { moTa: 'R1 thiếu crack_for_mate(): dừng ở đầu hành lang', baiLam: baiDoi(['wait_n(2)'], ['fill_for_mate(3)', 'move()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'R1 đi cứng forward(3) thay vì crack_for_mate(): đâm vào đá chuông và trượt ở sân 2, 3', baiLam: baiDoi(['wait_n(2)', 'forward(3)', 'play_note(2)', 'move()'], ['fill_for_mate(3)', 'move()']), phaiCoMa: ['chua-toi-co'], cung: true }
      ],
      sao: { o: 28, nhip: 24 },
      goiY: ['Sau fill_for_mate(3), R2 ở (3, 4) hướng lên và gọi move() tiến lên cờ F ở (3, 3).', 'R1 gọi wait_n(2) rồi gọi crack_for_mate().']
    }),

    /* ========================================================================
       CHƯƠNG 2: che-doi-hang-dong - Chế lệnh: Đội hang động (10 màn)
       ====================================================================== */
    manCheDH(1, 'lam-quen', {
      ten: 'Chế hàm: Đi chéo hất đá mở cổng',
      taoHam: ['heavy_gate_lob'],
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'aim_lob', 'slide_stop'],
      deBai: 'Hãy viết hàm heavy_gate_lob(k) cho R2: gọi diag_right() để bước chéo vào sau viên đá, gọi aim_lob(k) để hất đá xa k ô lên nút M mở cổng C cho R1, rồi gọi slide_r(1) để về cờ. Dùng heavy_gate_lob(3) cho R2.',
      veMaMau: 'Hàm heavy_gate_lob(k) đang để trống thân hàm.',
      san: ['#######', '#.IICF#', '##M####', '##=####', '##o####', '#..F###', '#.#####', '#######'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 6, huong: 0 }],
      noi: [{ nut: { x: 2, y: 2 }, cua: [{ x: 4, y: 1 }] }],
      maMau: baiDoi(['wait_n(3)', 'slide_stop()'], ['heavy_gate_lob(3)'], [ham('heavy_gate_lob', [], ['k'])]),
      loiGiai: baiDoi(['wait_n(3)', 'slide_stop()'], ['heavy_gate_lob(3)'], [ham('heavy_gate_lob', ['diag_right()', 'aim_lob(k)', 'slide_r(1)'], ['k'])]),
      loiSai: [
        { moTa: 'Để trống heavy_gate_lob(k): R2 đứng yên, cổng C đóng chặt', baiLam: baiDoi(['wait_n(3)', 'slide_stop()'], ['heavy_gate_lob(3)'], [ham('heavy_gate_lob', [], ['k'])]), phaiCoMa: ['loi-cu-phap'] },
        { moTa: 'Quên diag_right() trong heavy_gate_lob(k): R2 hất hụt vì chưa đứng sau viên đá', baiLam: baiDoi(['wait_n(3)', 'slide_stop()'], ['heavy_gate_lob(3)'], [ham('heavy_gate_lob', ['aim_lob(k)', 'slide_r(1)'], ['k'])]), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 24, nhip: 5 },
      goiY: ['Trong heavy_gate_lob(k), viết 3 dòng: diag_right(), aim_lob(k), slide_r(1).', 'R1 chờ 3 nhịp rồi gọi slide_stop() trượt qua cổng C tới cờ.']
    }),

    manCheDH(2, 'lam-quen', {
      ten: 'Mở cổng và nghe vang hai sân',
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'go_echo', 'heavy_gate_lob'],
      deBai: 'Ở 2 sân, R2 gọi heavy_gate_lob(3) để mở cổng C(2, 1) cho R1 trong 3 nhịp. R1 chờ 3 nhịp rồi gọi go_echo() để tiến qua cổng C đúng tới cờ có đặt chuông đá.',
      veMaMau: 'R1 đang gọi forward(3) cứng nên ở sân 2 chưa tới cờ.',
      san: [
        ['#######', '#.CI.F#', '##M####', '##=####', '##o####', '#..F###', '#.#####', '#######'],
        ['########', '#.CII.F#', '##M#####', '##=#####', '##o#####', '#..F####', '#.######', '########']
      ],
      bd: [
        [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
        [{ x: 1, y: 6, huong: 0 }, { x: 1, y: 6, huong: 0 }]
      ],
      chuongDa: [
        [{ x: 5, y: 1, not: 2 }],
        [{ x: 6, y: 1, not: 6 }]
      ],
      noi: [
        [{ nut: { x: 2, y: 2 }, cua: [{ x: 2, y: 1 }] }],
        [{ nut: { x: 2, y: 2 }, cua: [{ x: 2, y: 1 }] }]
      ],
      maMau: baiDoi(['wait_n(3)', 'forward(3)'], ['heavy_gate_lob(3)']),
      loiGiai: baiDoi(['wait_n(3)', 'go_echo()'], ['heavy_gate_lob(3)']),
      loiSai: [
        { moTa: 'Để nguyên forward(3): ở sân 2 R1 dừng trước cờ', baiLam: baiDoi(['wait_n(3)', 'forward(3)'], ['heavy_gate_lob(3)']), phaiCoMa: ['chua-toi-co'], cung: true }
      ],
      sao: { o: 23, nhip: 15 },
      goiY: ['Chuông đá đặt ngay tại cờ F của R1 ở cả 2 sân.', 'Đổi forward(3) của R1 thành go_echo().']
    }),

    manCheDH(3, 'lam-quen', {
      ten: 'Chế hàm: Chờ mở lối rồi phá đá tiến lên',
      taoHam: ['wait_crack_go'],
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'play_note', 'heavy_gate_lob'],
      deBai: 'Hãy viết hàm wait_crack_go(k, n) cho R1: gọi wait_n(k) chờ R2 mở cổng hoặc lấp hố, gọi play_note(listen()) phá khối đá chuông trước mặt, rồi gọi forward(n) tiến về cờ. Dùng wait_crack_go(3, 4) cho R1.',
      veMaMau: 'Hàm wait_crack_go(k, n) chưa có thân hàm.',
      san: ['#######', '#.ICIF#', '##M####', '##=####', '##o####', '#..F###', '#.#####', '#######'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 6, huong: 0 }],
      daChuong: [{ x: 2, y: 1, not: 4, ben: 1 }],
      noi: [{ nut: { x: 2, y: 2 }, cua: [{ x: 3, y: 1 }] }],
      maMau: baiDoi(['wait_crack_go(3, 4)'], ['heavy_gate_lob(3)'], [ham('wait_crack_go', [], ['k', 'n'])]),
      loiGiai: baiDoi(['wait_crack_go(3, 4)'], ['heavy_gate_lob(3)'], [ham('wait_crack_go', ['wait_n(k)', 'play_note(listen())', 'forward(n)'], ['k', 'n'])]),
      loiSai: [
        { moTa: 'Để trống wait_crack_go(k, n): R1 đứng yên', baiLam: baiDoi(['wait_crack_go(3, 4)'], ['heavy_gate_lob(3)'], [ham('wait_crack_go', [], ['k', 'n'])]), phaiCoMa: ['loi-cu-phap'] },
        { moTa: 'Quên play_note(listen()) trong wait_crack_go: R1 đâm vào đá chuông ở (2, 1)', baiLam: baiDoi(['wait_crack_go(3, 4)'], ['heavy_gate_lob(3)'], [ham('wait_crack_go', ['wait_n(k)', 'forward(n)'], ['k', 'n'])]), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 26, nhip: 8 },
      goiY: ['Trong wait_crack_go(k, n), viết 3 dòng: wait_n(k), play_note(listen()), forward(n).', 'Chương trình chính của hai robot đã gọi sẵn đúng hàm.']
    }),

    manCheDH(4, 'lam-quen', {
      ten: 'Chờ lấp hố và phá đá hai sân',
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'play_note', 'go_echo', 'fill_for_mate', 'wait_crack_go'],
      deBai: 'Ở 2 sân, R2 gọi fill_for_mate(3) lấp hố u ở (3, 1) trong 2 nhịp. R1 đứng trước đá chuông ở (2, 1) cần gọi wait_crack_go(2, 1) để chờ 2 nhịp, phá đá chuông và bước vào (2, 1), sau đó gọi go_echo() để tiến đúng số bước tới chuông đá ở cờ.',
      veMaMau: 'R1 đang gọi forward(3) cứng sau wait_crack_go(2, 1).',
      san: [
        ['#######', '#.IuIF#', '###=###', '###o###', '#...F##', '#######'],
        ['########', '#.IuIIF#', '###=####', '###o####', '#...F###', '########']
      ],
      bd: [
        [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
        [{ x: 3, y: 4, huong: 0 }, { x: 3, y: 4, huong: 0 }]
      ],
      chuongDa: [
        [{ x: 5, y: 1, not: 3 }],
        [{ x: 6, y: 1, not: 7 }]
      ],
      daChuong: [
        [{ x: 2, y: 1, not: 3, ben: 1 }],
        [{ x: 2, y: 1, not: 7, ben: 1 }]
      ],
      maMau: baiDoi(['wait_crack_go(2, 1)', 'forward(2)'], ['fill_for_mate(3)']),
      loiGiai: baiDoi(['wait_crack_go(2, 1)', 'go_echo()'], ['fill_for_mate(3)']),
      loiSai: [
        { moTa: 'Để nguyên forward(2): R1 chưa tới được cờ F', baiLam: baiDoi(['wait_crack_go(2, 1)', 'forward(2)'], ['fill_for_mate(3)']), phaiCoMa: ['chua-toi-co'], cung: true }
      ],
      sao: { o: 27, nhip: 15 },
      goiY: ['Sau khi wait_crack_go(2, 1) phá xong đá chuông ở (2, 1), chuông đá tại cờ F là nguồn âm duy nhất còn lại.', 'Đổi forward(2) thành go_echo().']
    }),

    manCheDH(5, 'cung-co', {
      ten: 'Chế hàm: Lọc đá theo hình dạng mở cổng',
      taoHam: ['shape_lob_step'],
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'sort_lob', 'wait_crack_go'],
      deBai: 'Hãy viết hàm shape_lob_step() cho R2: gọi sort_lob() để radar tự phân biệt đá tròn (ném tầm 2) hay quặng (ném tầm 3) lên nút M, rồi gọi slide_r(1) để về cờ. Áp dụng cùng wait_crack_go(2, 4) của R1.',
      veMaMau: 'Hàm shape_lob_step() chưa có thân hàm.',
      san: ['#######', '#.ICIF#', '##M####', '##=####', '##o####', '#..F###', '#######'],
      vatDang: ['.......', '.......', '.......', '.......', '..q....', '.......', '.......'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 5, huong: 0 }],
      daChuong: [{ x: 2, y: 1, not: 5, ben: 1 }],
      noi: [{ nut: { x: 2, y: 2 }, cua: [{ x: 3, y: 1 }] }],
      maMau: baiDoi(['wait_crack_go(2, 4)'], ['shape_lob_step()'], [ham('shape_lob_step', [])]),
      loiGiai: baiDoi(['wait_crack_go(2, 4)'], ['shape_lob_step()'], [ham('shape_lob_step', ['sort_lob()', 'slide_r(1)'])]),
      loiSai: [
        { moTa: 'Để trống shape_lob_step(): R2 đứng yên, cổng C không mở', baiLam: baiDoi(['wait_crack_go(2, 4)'], ['shape_lob_step()'], [ham('shape_lob_step', [])]), phaiCoMa: ['loi-cu-phap'] },
        { moTa: 'Gọi lob() thay vì sort_lob(): quặng vướng hàng rào =', baiLam: baiDoi(['wait_crack_go(2, 4)'], ['shape_lob_step()'], [ham('shape_lob_step', ['lob()', 'slide_r(1)'])]), phaiCoMa: ['nem-vo', 'dam-tuong'] }
      ],
      sao: { o: 29, nhip: 7 },
      goiY: ['Trong shape_lob_step(), viết 2 dòng: sort_lob() và slide_r(1).', 'Chương trình chính đã gọi sẵn wait_crack_go(2, 4) và shape_lob_step().']
    }),

    manCheDH(6, 'cung-co', {
      ten: 'Lọc đá mở cổng hai sân',
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'play_note', 'go_echo', 'shape_lob_step', 'wait_crack_go'],
      deBai: 'Ở 2 sân, viên đá trước mặt R2 ở sân 1 là đá tròn (tầm 2 tới nút M), còn ở sân 2 là quặng (tầm 3 qua rào = tới nút M). Hãy gọi shape_lob_step() cho R2, còn R1 gọi wait_crack_go(2, 1) rồi go_echo().',
      veMaMau: 'R2 đang gọi fill_for_mate(2) nên hỏng ở sân 2.',
      san: [
        ['#######', '#.ICIF#', '##.####', '##M####', '##o####', '#..F###', '#######'],
        ['########', '#.ICIIF#', '##M#####', '##=#####', '##o#####', '#..F####', '########']
      ],
      vatDang: [
        ['.......', '.......', '.......', '.......', '..r....', '.......', '.......'],
        ['........', '........', '........', '........', '..q.....', '........', '........']
      ],
      bd: [
        [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
        [{ x: 2, y: 5, huong: 0 }, { x: 2, y: 5, huong: 0 }]
      ],
      chuongDa: [
        [{ x: 5, y: 1, not: 2 }],
        [{ x: 6, y: 1, not: 6 }]
      ],
      daChuong: [
        [{ x: 2, y: 1, not: 2, ben: 1 }],
        [{ x: 2, y: 1, not: 6, ben: 1 }]
      ],
      noi: [
        [{ nut: { x: 2, y: 3 }, cua: [{ x: 3, y: 1 }] }],
        [{ nut: { x: 2, y: 2 }, cua: [{ x: 3, y: 1 }] }]
      ],
      maMau: baiDoi(['wait_crack_go(2, 1)', 'go_echo()'], ['fill_for_mate(2)']),
      loiGiai: baiDoi(['wait_crack_go(2, 1)', 'go_echo()'], ['shape_lob_step()']),
      loiSai: [
        { moTa: 'Dùng fill_for_mate(2): ở sân 2 đá rơi trúng hàng rào =, cổng C không mở', baiLam: baiDoi(['wait_crack_go(2, 1)', 'go_echo()'], ['fill_for_mate(2)']), phaiCoMa: ['nem-vo', 'dam-tuong'], cung: true }
      ],
      sao: { o: 31, nhip: 15 },
      goiY: ['Hàm shape_lob_step() tự chọn tầm 2 cho đá tròn ở sân 1 và tầm 3 cho quặng ở sân 2.', 'Đổi fill_for_mate(2) của R2 thành shape_lob_step().']
    }),

    manCheDH(7, 'cung-co', {
      ten: 'Chế hàm: Tra từ điển hình dạng đá để hất',
      taoHam: ['dict_team_lob'],
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'aim_lob', 'wait_crack_go'],
      deBai: 'Từ điển d = {"round": 2, "ore": 3} ánh xạ hình dạng viên đá trước mặt R2 sang tầm hất cần thiết. Hãy viết hàm dict_team_lob(d) cho R2: lấy k = d[shape("front")], gọi aim_lob(k), rồi gọi slide_r(1).',
      veMaMau: 'Hàm dict_team_lob(d) chưa có thân hàm.',
      san: ['#######', '#.ICIF#', '##M####', '##=####', '##o####', '#..F###', '#######'],
      vatDang: ['.......', '.......', '.......', '.......', '..q....', '.......', '.......'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 5, huong: 0 }],
      daChuong: [{ x: 2, y: 1, not: 4, ben: 1 }],
      noi: [{ nut: { x: 2, y: 2 }, cua: [{ x: 3, y: 1 }] }],
      maMau: baiDoi(['wait_crack_go(2, 4)'], ['d = {"round": 2, "ore": 3}', 'dict_team_lob(d)'], [ham('dict_team_lob', [], ['d'])]),
      loiGiai: baiDoi(['wait_crack_go(2, 4)'], ['d = {"round": 2, "ore": 3}', 'dict_team_lob(d)'], [ham('dict_team_lob', ['k = d[shape("front")]', 'aim_lob(k)', 'slide_r(1)'], ['d'])]),
      loiSai: [
        { moTa: 'Để trống dict_team_lob(d): R2 đứng yên, cổng C không mở', baiLam: baiDoi(['wait_crack_go(2, 4)'], ['d = {"round": 2, "ore": 3}', 'dict_team_lob(d)'], [ham('dict_team_lob', [], ['d'])]), phaiCoMa: ['loi-cu-phap'] },
        { moTa: 'Dùng aim_lob(2) thay vì aim_lob(k): đá vướng rào = ở (2, 3)', baiLam: baiDoi(['wait_crack_go(2, 4)'], ['d = {"round": 2, "ore": 3}', 'dict_team_lob(d)'], [ham('dict_team_lob', ['k = d[shape("front")]', 'aim_lob(2)', 'slide_r(1)'], ['d'])]), phaiCoMa: ['nem-vo', 'dam-tuong'] }
      ],
      sao: { o: 27, nhip: 7 },
      goiY: ['Trong dict_team_lob(d), viết 3 dòng: k = d[shape("front")], aim_lob(k), slide_r(1).', 'Nhờ từ điển d, R2 tự tra tầm ném 3 khi gặp quặng "ore".']
    }),

    manCheDH(8, 'van-dung', {
      ten: 'Từ điển đôi hai sân',
      hamCuaEmCan: ['move', 'forward', 'wait_n', 'play_note', 'dict_gate', 'dict_team_lob'],
      deBai: 'Ở 2 sân, R2 dùng dict_team_lob(d2) với d2 = {"round": 2, "ore": 3} để hất đá đè nút M mở cổng C(3, 1) cho R1. R1 chờ 2 nhịp rồi dùng dict_gate(d1) với d1 = {3: 4, 6: 5} để phá đá chuông và tiến qua cổng C tới cờ.',
      veMaMau: 'R1 chưa gọi dict_gate(d1) sau khi chờ 2 nhịp.',
      san: [
        ['#######', '#.ICIF#', '##.####', '##M####', '##o####', '#..F###', '#######'],
        ['########', '#.ICIIF#', '##M#####', '##=#####', '##o#####', '#..F####', '########']
      ],
      vatDang: [
        ['.......', '.......', '.......', '.......', '..r....', '.......', '.......'],
        ['........', '........', '........', '........', '..q.....', '........', '........']
      ],
      bd: [
        [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
        [{ x: 2, y: 5, huong: 0 }, { x: 2, y: 5, huong: 0 }]
      ],
      daChuong: [
        [{ x: 2, y: 1, not: 3, ben: 1 }],
        [{ x: 2, y: 1, not: 6, ben: 1 }]
      ],
      noi: [
        [{ nut: { x: 2, y: 3 }, cua: [{ x: 3, y: 1 }] }],
        [{ nut: { x: 2, y: 2 }, cua: [{ x: 3, y: 1 }] }]
      ],
      maMau: baiDoi(['d1 = {3: 4, 6: 5}', 'wait_n(2)'], ['d2 = {"round": 2, "ore": 3}', 'dict_team_lob(d2)']),
      loiGiai: baiDoi(['d1 = {3: 4, 6: 5}', 'wait_n(2)', 'dict_gate(d1)'], ['d2 = {"round": 2, "ore": 3}', 'dict_team_lob(d2)']),
      loiSai: [
        { moTa: 'R1 thiếu dict_gate(d1): đứng yên trước đá chuông', baiLam: baiDoi(['d1 = {3: 4, 6: 5}', 'wait_n(2)'], ['d2 = {"round": 2, "ore": 3}', 'dict_team_lob(d2)']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 29, nhip: 15 },
      goiY: ['Sau wait_n(2), cổng C đã mở sẵn cho R1.', 'Thêm dòng dict_gate(d1) cho R1.']
    }),

    manCheDH(9, 'van-dung', {
      ten: 'Mở hai tầng khóa hang',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'wait_n', 'crack_switch', 'heavy_gate_lob'],
      deBai: 'R2 gọi heavy_gate_lob(3) để đi chéo, hất đá qua rào = lên nút M(2, 2) mở cổng C(4, 2) cho R1 rồi trượt về cờ. R1 gọi crack_switch() để phá đá chuông ở (2, 1), trượt hết dải đá ướt rẽ phải ở (4, 1), rồi tiến 2 ô qua cổng C tới cờ.',
      veMaMau: 'R1 thiếu forward(2) sau crack_switch().',
      san: ['######', '#.III#', '##M#C#', '##=#F#', '##o###', '#..F##', '#.####', '######'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 6, huong: 0 }],
      daChuong: [{ x: 2, y: 1, not: 5, ben: 1 }],
      noi: [{ nut: { x: 2, y: 2 }, cua: [{ x: 4, y: 2 }] }],
      maMau: baiDoi(['crack_switch()'], ['heavy_gate_lob(3)']),
      loiGiai: baiDoi(['crack_switch()', 'forward(2)'], ['heavy_gate_lob(3)']),
      loiSai: [
        { moTa: 'R1 chỉ gọi crack_switch(): dừng ở góc (4, 1) trước cổng C', baiLam: baiDoi(['crack_switch()'], ['heavy_gate_lob(3)']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 30, nhip: 5 },
      goiY: ['Khi crack_switch() xong ở nhịp 3, R2 cũng vừa hất đá mở cổng C(4, 2) xong ở nhịp 3!', 'Thêm forward(2) cho R1 để đi qua cổng C vào cờ F.']
    }),

    manCheDH(10, 'trum', {
      ten: 'Trùm Chế lệnh Đội hang động: Song kiếm hợp bích',
      hamCuaEmCan: ['move', 'forward', 'turn_right', 'wait_n', 'crack_switch', 'dict_gate', 'shape_lob_step'],
      deBai: 'Bài trùm 3 sân! Ở mỗi sân, R2 gọi shape_lob_step() để lọc đá tròn/quặng hất lên nút M mở cổng C cho R1 rồi trượt sang cờ. R1 đầu tiên gọi crack_switch() để phá đá chuông đầu hành lang và trượt rẽ xuống nhánh dọc, sau đó gọi dict_gate(d) với d = {3: 3, 6: 4} để phá đá chuông thứ hai và tiến qua cổng C tới cờ.',
      veMaMau: 'Hoàn thiện chương trình phối hợp R1 và R2 trên cả 3 sân.',
      san: [
        ['######', '#.III#', '##.#I#', '##M#C#', '##o#F#', '#..F##', '######'],
        ['#######', '#.IIII#', '##M##I#', '##=##.#', '##o##C#', '#..F#F#', '#######'],
        ['#######', '#.III##', '##M#I##', '##=#.##', '##o#C##', '#..FF##', '#######']
      ],
      vatDang: [
        ['......', '......', '......', '......', '..r...', '......', '......'],
        ['.......', '.......', '.......', '.......', '..q....', '.......', '.......'],
        ['.......', '.......', '.......', '.......', '..q....', '.......', '.......']
      ],
      bd: [
        [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
        [{ x: 2, y: 5, huong: 0 }, { x: 2, y: 5, huong: 0 }, { x: 2, y: 5, huong: 0 }]
      ],
      daChuong: [
        [{ x: 2, y: 1, not: 4, ben: 1 }, { x: 4, y: 2, not: 3, ben: 1 }],
        [{ x: 2, y: 1, not: 7, ben: 1 }, { x: 5, y: 2, not: 6, ben: 1 }],
        [{ x: 2, y: 1, not: 2, ben: 1 }, { x: 4, y: 2, not: 6, ben: 1 }]
      ],
      noi: [
        [{ nut: { x: 2, y: 3 }, cua: [{ x: 4, y: 3 }] }],
        [{ nut: { x: 2, y: 2 }, cua: [{ x: 5, y: 4 }] }],
        [{ nut: { x: 2, y: 2 }, cua: [{ x: 4, y: 4 }] }]
      ],
      maMau: baiDoi(['d = {3: 3, 6: 4}', 'crack_switch()'], ['shape_lob_step()']),
      loiGiai: baiDoi(['d = {3: 3, 6: 4}', 'crack_switch()', 'dict_gate(d)'], ['shape_lob_step()']),
      loiSai: [
        { moTa: 'R1 thiếu dict_gate(d): dừng ở đầu nhánh dọc', baiLam: baiDoi(['d = {3: 3, 6: 4}', 'crack_switch()'], ['shape_lob_step()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'R2 dùng fill_for_mate(2) thay vì shape_lob_step(): ở sân 2, 3 đá vướng rào =, cổng C đóng chặt', baiLam: baiDoi(['d = {3: 3, 6: 4}', 'crack_switch()', 'dict_gate(d)'], ['fill_for_mate(2)']), phaiCoMa: ['nem-vo', 'dam-tuong'], cung: true }
      ],
      sao: { o: 37, nhip: 23 },
      goiY: ['R2 đã có shape_lob_step() để mở cổng C cho cả 3 sân.', 'R1 chỉ cần gọi thêm dict_gate(d) sau crack_switch().']
    })
  ];

  M.manDoiHangDong = DS;
})();
