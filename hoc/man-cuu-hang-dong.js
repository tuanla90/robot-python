/* ============================================================================
   man-cuu-hang-dong.js - Mùa 9 CLB Sáng Tạo: Gói 8 "Hang động sau bão" (dựng lại 17/11, M9M8, theo khuôn G6 / G7)
   20 màn: cuu-hang-dong (chọn đội trong menu cỗ máy) + lap-hang-dong (R1 xe hang động đặt sẵn, R2 tự lắp; lai L4 L5 L7).
   Ôn Python: dict (sổ tra trong code: nốt nghe được → nốt phát / hướng; KHOÁ tra do sân cấp qua listen() / hear()), set (nhớ nốt / ngách đã đi).
   Bão: hố sụt mới (u), cửa đá (C, nút đè M giữ), sông ngầm dâng (~), đá chuông chắn lối (vỡ khi phát đúng nốt, trong tầm 3 ô hay trên tia từ mũi xe),
   chuông đá vang (nguồn tiếng cố định: listen() trả nốt, hear() trả khoảng cách), ngách hang (chui miệng này ra miệng kia), thạch nhũ đổ (thùng nặng H).
   Ném đá: luật NÉM ĐÀ mùa 9 (aim chỉ 1, 2; aim_lob(3) tự chạy đà rồi lùi về chỗ cũ).
   Màn 10 mỗi chương: song ca đoạn 8 (bè 1: 4 4 3 3 2 2 1 1 | bè 2: 6 6 5 5 4 4 3 3), gọi play_part.
   Câu đố: hoc/MUA-9-200-CAU-DO.md mục G8 (ghi chú "Đã dựng 17/11 (M9M8)": các chỗ lệch so với bảng).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  /* ---- M9M8: khung màn mùa 9 (chép từ man-cuu-mo-da.js) ------------------------------------------ */
  var CoMay = laNode ? require('./co-may.js') : window.CoMay;
  var HAM_EM = ['move', 'back', 'forward', 'wait_n', 'tr_left', 'tr_right', 'turn_left', 'turn_right', 'pick', 'drop', 'go', 'walk', 'jump', 'crawl', 'pull_s', 'lob', 'aim_lob', 'slide_r', 'play_note'];
  /** Robot của màn: cỗ máy `ma` (CoMay.dung) ở ô xuất phát bd, cờ riêng co, đế son ('lam' Luna, 'tim' máy khách). */
  function may(ma, bd, them) {
    var t = them || {};
    var r = CoMay.dung(ma, { batDau: bd, son: t.son, pin: t.pin });
    if (t.co) r.co = t.co;
    if (t.coDinh) r.coDinh = true;
    if (t.tay) r.robot.tay = t.tay;
    if (t.tay || t.boHam || t.themHam) r.hamGoc = r.hamGoc.filter(function (h) { return (t.boHam || []).indexOf(h) < 0; }).concat(t.themHam || []);
    if (t.phatNot) r.phatNot = true;
    if (t.batDauNuoc) r.batDauNuoc = t.batDauNuoc;
    return r;
  }
  /** Khe robot em lập trình ở màn chọn đội / khe lắp: ô xuất phát, cờ riêng, pin (drone), đế. */
  function khe(bd, them) { return Object.assign({ batDau: bd }, them || {}); }
  function doiBai(ds, hamMan, hamEm) {
    return { doi: ds.map(function (c) { return { chinh: c.slice() }; }), hamCuaMan: clone(hamMan || []), hamCuaEmMoi: clone(hamEm || []) };
  }
  /** Một cách lắp mẫu (màn tự lắp, lapRap.robot = 1): part của R2 + lời giải cả đội. */
  function cach(than, tay, cam, ds, hamEm) { return { than: than, tay: tay || null, camBien: cam || null, loiGiai: doiBai(ds, [], hamEm) }; }
  function lapR2(than, tay, cam, nganSach, cachLap, them) {
    return Object.assign({ robot: 1, than: than, tay: tay, camBien: cam, nganSach: nganSach, dungKho: true, cachLap: cachLap }, them || {});
  }

  /** cuu-hang-dong.1: nhện bật qua hố sụt lên nút đè M (cửa đá mở), giữ nút tới khi xe hang động qua cửa, bước sang cờ.
   *  Xe hang động chờ cửa mở, chạy thẳng qua cửa đá tới cờ. */
  var PL_1 = ['jump("R")', 'wait_n(3)', 'go_right()'];
  var HD_1 = ['wait_n(3)', 'forward(6)'];

  /** cuu-hang-dong.2 (ba sân): chuông đá vang trong hốc dưới hang xe (mỗi sân một nốt 2 / 4 / 6), đá chuông chắn ngách nhện ở hàng trên (nốt 5 / 7 / 3).
   *  Sổ ám hiệu d (bảng tra trong code): nghe chuông nốt n thì phát nốt d[n]. Khoá n do sân cấp qua listen(). */
  var D_2 = 'd = {2: 5, 4: 7, 6: 3}';
  /** Xe hang động: tiến ba ô tới trên hốc chuông, nghe nốt chuông, tra sổ, hát nốt đá chuông (cách 2 ô): đá vỡ; tiến về cờ. */
  var HD_2 = [D_2, 'forward(3)', 'n = listen()', 'play_note(d[n])', 'forward(3)'];
  /** Nhện: co chân chui gầm đá thấp, đứng lên, chờ đá chuông vỡ, đi qua chỗ đá về cờ. */
  var PL_2 = ['crouch()', 'go_right()', 'go_right()', 'stand()', 'wait()', 'for i in range(4):', '    go_right()'];
  function san2() { return ['#########', '#.n....F#', '#########', '#......F#', '####.####', '#########']; }

  /** cuu-hang-dong.3: hang dài, hai hố sụt trên lối nhện ở hàng 3, nút đè M sau hố thứ hai; cửa đá C trên lối xe hang động (sàn đá ướt trước cửa).
   *  Nhện bật qua hai hố, lên nút, giữ tới khi xe qua cửa, bước sang cờ. Xe hang động chờ, bám đá ướt qua cửa tới cờ. */
  var PL_3 = ['jump("R")', 'jump("R")', 'go_right()', 'wait_n(4)', 'go_right()'];
  var HD_3 = ['wait_n(7)', 'forward(7)'];

  /** cuu-hang-dong.4: hang dưới bị vách đá chia đôi, ngách hang nối miệng (2, 3) với miệng (5, 3) trong buồng kín có nút đè M; cửa đá C trên lối xe hang động.
   *  Nhện bước vào miệng ngách, chui ra miệng kia trong buồng, lên nút, giữ tới khi xe qua cửa, sang cờ. */
  var PL_4 = ['go_right()', 'go_right()', 'go_right()', 'wait_n(4)', 'go_right()'];
  var HD_4 = ['wait_n(4)', 'forward(7)'];

  function man9(chuong, so, hang, cfg) {
    var r1 = cfg.doi[0];
    var m = {
      chuong: chuong, so: so, ten: cfg.ten, hang: hang, vo: 'hang-dong', daLapHo: true,
      cauTruc: ['for', 'if', 'while', 'list', 'def', 'return', 'tuple', 'dict', 'set'], vaHoac: true, moXuong: true, camHamCuaEm: false,
      hamCuaEmCan: cfg.hamCuaEmCan || HAM_EM, taoHam: cfg.taoHam || [],
      khung: cfg.khung || { chinh: 12, moiHam: 8 }, mucTieu: cfg.mucTieu || 'toi-co',
      deBai: cfg.deBai, veMaMau: cfg.veMaMau || '', san: cfg.san, batDau: clone(r1.batDau),
      doi: cfg.doi.map(clone), maMau: cfg.maMau, loiSai: cfg.loiSai || [], sao: cfg.sao, goiY: cfg.goiY || [], cauDo: cfg.cauDo
    };
    if (r1.loaiRobot) { m.loaiRobot = r1.loaiRobot; m.robot = clone(r1.robot); m.hamGoc = r1.hamGoc.slice(); }
    if (cfg.loiGiai) m.loiGiai = cfg.loiGiai;
    if (cfg.chonDoi) m.chonDoi = cfg.chonDoi;
    if (cfg.lapRap) m.lapRap = cfg.lapRap;
    if (cfg.noi) m.noi = cfg.noi;
    if (cfg.chiChay) { m.chiChay = true; m.chinhCoDinh = true; }
    Object.keys(cfg.them || {}).forEach(function (k) { m[k] = cfg.them[k]; });
    return ManHoc.chuanHoa(m);
  }

  var DS_MAN = [
    /* ========================================================================
       CHƯƠNG 1: cuu-hang-dong (10 màn)
       ======================================================================== */
    // 1 · show (giữ cửa): bão làm sụt một hố mới giữa hang dưới, cửa đá trên lối xe hang động đóng. Nhện bật qua hố sụt (jump("R")) đáp lên nút đè M: cửa đá mở.
    //     Nhện giữ nút tới khi xe hang động qua cửa, rồi bước sang cờ. Đội cố định HD + PL (chạy sẵn, khoá).
    man9('cuu-hang-dong', 1, 'lam-quen', {
      ten: 'Nhện giữ cửa đá',
      chiChay: true,
      deBai: 'Bão làm sụt một hố mới trong hang, cửa đá đóng lối xe hang động. Nhện bật qua hố, đứng lên nút giữ cửa mở. Bấm Chạy.',
      veMaMau: 'Bấm Chạy xem mỗi bạn làm gì.',
      san: ['#########', '#..C...F#', '###.uMF##', '#########'],
      noi: [{ nut: { x: 5, y: 2 }, cua: [{ x: 3, y: 1 }] }],
      doi: [may('HD', { x: 1, y: 1, huong: 1 }, { co: [{ x: 7, y: 1 }] }), may('PL', { x: 3, y: 2, huong: 1 }, { son: 'lam', co: [{ x: 6, y: 2 }] })],
      maMau: doiBai([HD_1, PL_1]),
      loiGiai: doiBai([HD_1, PL_1]),
      sao: { o: 28, nhip: 11 },
      goiY: ['jump("R"): nhện co chân, bật qua một ô (qua được hố) rồi đáp.', 'Nút đè chỉ giữ cửa mở khi có robot đứng trên nút.'],
      cauDo: { doi: ['HD', 'PL'], lap: null, coChe: ['ho', 'nhay', 'nut-de', 'cua'], cuu: 'hang', meo: 'giu-cua' }
    }),
    // 2 · dọn lối, ôn dict (ba sân, luật 13/11): bão làm đá chuông rơi chắn ngách hẹp của nhện; chuông đá trong hốc dưới hang xe vang một nốt, mỗi sân một nốt.
    //     Sổ ám hiệu d = {2: 5, 4: 7, 6: 3} là bảng tra trong code: nghe chuông nốt n thì đá chuông cần nốt d[n]. Xe hang động tiến tới trên hốc chuông, n = listen(),
    //     play_note(d[n]): đá vỡ; về cờ. Nhện co chân chui gầm đá thấp, qua chỗ đá vừa vỡ về cờ. Gõ lại nốt chuông (play_note(listen())) hay điền thẳng nốt sân 1 thì đá không vỡ.
    man9('cuu-hang-dong', 2, 'lam-quen', {
      ten: 'Sổ ám hiệu chuông đá',
      hamCuaEmCan: HAM_EM.concat(['crouch', 'stand']),
      deBai: 'Ba sân. Đá chuông chắn ngách của nhện. Chuông đá dưới hốc vang một nốt, mỗi sân một nốt. Sổ d: nghe nốt n thì đá cần nốt d[n]. Xe hang động nghe, tra sổ, hát cho đá vỡ.',
      veMaMau: 'Xe hang động có sổ d nhưng chưa nghe.',
      san: [san2(), san2(), san2()],
      them: { khoaTD: ['2', '4', '6'],
        chuongDa: [[{ x: 4, y: 4, not: 2 }], [{ x: 4, y: 4, not: 4 }], [{ x: 4, y: 4, not: 6 }]],
        daChuong: [[{ x: 4, y: 1, not: 5, ben: 1 }], [{ x: 4, y: 1, not: 7, ben: 1 }], [{ x: 4, y: 1, not: 3, ben: 1 }]] },
      doi: [khe({ x: 1, y: 3, huong: 1 }, { co: [{ x: 7, y: 3 }] }), khe({ x: 1, y: 1, huong: 1 }, { co: [{ x: 7, y: 1 }] })],
      chonDoi: {
        menu: ['HD', 'PL'],
        cachMau: [{ chon: ['HD', 'PL'], ghiChu: 'đôi tốt', loiGiai: doiBai([HD_2, PL_2]) }]
      },
      maMau: doiBai([[D_2, 'forward(3)'], []]),
      loiSai: [
        { moTa: 'Điền thẳng nốt của sân 1 (play_note(5)): sân 2, 3 đá không vỡ', baiLam: doiBai([[D_2, 'forward(3)', 'play_note(5)', 'forward(3)'], PL_2]), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Gõ lại nốt chuông (play_note(listen())), không tra sổ: đá không vỡ', baiLam: doiBai([[D_2, 'forward(3)', 'play_note(listen())', 'forward(3)'], PL_2]), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Nhện quên co chân: đâm gầm đá thấp', baiLam: doiBai([HD_2, ['wait()', 'go_right()', 'go_right()', 'wait_n(2)', 'for i in range(4):', '    go_right()']]), phaiCoMa: ['gam-thap'] }
      ],
      sao: { o: 23, nhip: 15 },
      goiY: ['n = listen(): nốt của nguồn tiếng gần nhất (ở đây là chuông đá dưới hốc).', 'd[n]: tra sổ, nốt mà đá chuông cần.', 'Đá chuông vỡ khi nghe đúng nốt trong tầm 3 ô.'],
      cauDo: { doi: ['HD', 'PL'], lap: null, coChe: ['da-chuong', 'chuong-da', 'not', 'gam', 'dict'], cuu: 'hang', meo: 'don-loi' }
    }),
    // 3 · giữ cửa (bẫy drone): hang dài sau bão, hai hố sụt nối nhau trên lối nhện, nút đè M nằm sau hố thứ hai; cửa đá C chắn lối xe hang động trên sàn đá ướt.
    //     Nhện bật qua hai hố lên nút, giữ cửa mở tới khi xe qua. Bẫy: drone (bay qua hố được nhưng không đè nút: bay thì không nặng lên nút).
    man9('cuu-hang-dong', 3, 'luyen', {
      ten: 'Hai hố trước nút',
      deBai: 'Cửa đá chắn lối xe hang động. Nút giữ cửa nằm sau hai hố sụt. Chọn hai bạn: ai qua hai hố đứng lên nút, ai bám đá ướt qua cửa?',
      veMaMau: 'Cửa đá còn đóng.',
      san: ['##########', '#..IIC..F#', '##########', '#.u.u.MF.#', '##########'],
      noi: [{ nut: { x: 6, y: 3 }, cua: [{ x: 5, y: 1 }] }],
      doi: [khe({ x: 1, y: 1, huong: 1 }, { co: [{ x: 8, y: 1 }] }), khe({ x: 1, y: 3, huong: 1 }, { co: [{ x: 7, y: 3 }] })],
      chonDoi: {
        menu: ['HD', 'PL', 'DR'],
        cachMau: [{ chon: ['HD', 'PL'], ghiChu: 'đôi tốt', loiGiai: doiBai([HD_3, PL_3]) }]
      },
      maMau: doiBai([['wait_n(7)'], ['jump("R")']]),
      loiSai: [
        { moTa: 'Nhện nhảy một lần rồi đi bộ: rơi hố thứ hai', baiLam: doiBai([HD_3, ['jump("R")', 'go_right()', 'go_right()', 'go_right()', 'wait_n(4)', 'go_right()']]), phaiCoMa: ['roi-ho'] },
        { moTa: 'Nhện rời nút ngay: cửa đóng trước mũi xe', baiLam: doiBai([HD_3, ['jump("R")', 'jump("R")', 'go_right()', 'go_right()']]), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Xe không chờ: tới cửa khi cửa còn đóng', baiLam: doiBai([['forward(7)'], PL_3]), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 30, nhip: 17 },
      goiY: ['jump("R") hai lần: qua hai hố.', 'Nút đè chỉ giữ cửa mở khi có robot đứng trên nút.', 'Drone bay thì không đè nút.'],
      cauDo: { doi: ['HD', 'PL'], lap: null, coChe: ['ho', 'hai-ho', 'nhay', 'nut-de', 'cua', 'da-uot'], cuu: 'hang', meo: 'giu-cua' }
    }),
    // 4 · giữ cửa, ngách hang: bão làm đá lở bít lối vào buồng nút; chỉ còn ngách hang ngầm (hai miệng cùng màu) nối hang ngoài với buồng kín. Nhện đi vào miệng ngách,
    //     chui ra miệng kia trong buồng, lên nút đè M, giữ cửa đá mở tới khi xe hang động qua, sang cờ. Bảng 2 cỗ máy (đúng đôi tốt).
    man9('cuu-hang-dong', 4, 'luyen', {
      ten: 'Ngách vào buồng nút',
      deBai: 'Đá lở bít lối vào buồng có nút giữ cửa đá. Chỉ còn ngách hang: bước vào miệng này, chui ra miệng kia cùng màu. Nhện vào buồng giữ nút cho xe hang động qua cửa.',
      veMaMau: 'Cửa đá còn đóng.',
      san: ['##########', '#.....C.F#', '##########', '#...#.MF##', '##########'],
      noi: [{ nut: { x: 6, y: 3 }, cua: [{ x: 6, y: 1 }] }],
      them: { ngachHang: [{ a: { x: 3, y: 3 }, b: { x: 5, y: 3 } }] },
      doi: [khe({ x: 1, y: 1, huong: 1 }, { co: [{ x: 8, y: 1 }] }), khe({ x: 1, y: 3, huong: 1 }, { co: [{ x: 7, y: 3 }] })],
      chonDoi: {
        menu: ['HD', 'PL'],
        cachMau: [{ chon: ['HD', 'PL'], ghiChu: 'đôi tốt', loiGiai: doiBai([HD_4, PL_4]) }]
      },
      maMau: doiBai([['wait_n(4)'], ['go_right()']]),
      loiSai: [
        { moTa: 'Nhện rời nút ngay: cửa đóng trước mũi xe', baiLam: doiBai([HD_4, ['go_right()', 'go_right()', 'go_right()', 'go_right()']]), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Xe không chờ: tới cửa khi cửa còn đóng', baiLam: doiBai([['forward(7)'], PL_4]), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 17, nhip: 14 },
      goiY: ['Bước vào miệng ngách là chui ra miệng kia cùng màu, giữ hướng.', 'Nút đè chỉ giữ cửa mở khi có robot đứng trên nút.'],
      cauDo: { doi: ['HD', 'PL'], lap: null, coChe: ['ngach', 'nut-de', 'cua'], cuu: 'hang', meo: 'giu-cua' }
    })
  ];

  ManHoc.manCuuHangDong = DS_MAN;
})();
