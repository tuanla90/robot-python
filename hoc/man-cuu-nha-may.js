/* ============================================================================
   man-cuu-nha-may.js - Mùa 9 Về CLB: Gói 2 "Nhà máy sau bão" (M9M2 5/11; dựng lại theo khuôn G1 hoc/man-cuu-kho-hang.js)
   Câu đố: hoc/MUA-9-200-CAU-DO.md mục G2 (20 dòng); luật: hoc/KE-HOACH-MUA-9-TO-HOP.md. Bão: container văng chắn lối, sắt vụn rơi vào khe máy, vệt dầu trơn (ô I).
   - Chương 1 cuu-nha-may: CHỌN ĐỘI (man.chonDoi); bảng có cần cẩu thì mọi khe em lập trình đứng trên MỘT dải ray R, mặt hướng lên (huong 0):
     cần cẩu của CoMay có rail() nên phải xuất phát trên R, và không nhận huong khác 0 — đặt cỗ máy nào vào khe nào cũng không vỡ màn.
   - Chương 2 lap-nha-may: R1 xe cứu hỏa đặt sẵn, Luna TỰ LẮP R2 (man.lapRap.robot = 1). Lai ra mắt: L1 cẩu + nam châm, L8 cẩu + gầu, L13 cẩu + cảm biến từ.
   - Mỗi màn khai man.cauDo (máy kiểm hoc/kiem-cau-do-mua-9.mjs). Ôn Python G2: BIẾN (giữ số đọc được, số ô), THAM SỐ (hàm có n).
   - Hàm của em do gói này tạo mà gói sau gọi: valve_step(n) [squirt("low"), forward(n)] (cuu-nha-may.5), push_valve(n) [forward(n), back()] (lap-nha-may.8;
     man-cuu-clb.js, man-cuu-hang-dong.js gọi). lob_clear(d) [aim_lob(d), slide_r(1)] của bản cũ KHÔNG còn (G2 không có màn omni + máy ném):
     lap-bai-tai-che.7, lap-ben-song.6 gọi nó nên đỏ ở kiem-loi-giai (xem báo cáo M9M2b).
   - Chồng container chặn thật (màn khai contChan: true, lõi M9T5): #1, #2, #3, #5, #6, #7, #8. Màn có cần cẩu không dùng 'toi-co' (cẩu không tới cờ).
   - Màn 10 mỗi chương: song ca đoạn 2 "Kìa con bướm vàng" (Bè 1: 4 4 3 3 2 2 1 1 | Bè 2: 2 4 1 3 5 5 1 1), giữ để gói 10 ghép bài.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  /* ---- M9M2: khung màn mùa 9 (chép từ man-cuu-kho-hang.js) --------------------------------------------- */
  var CoMay = laNode ? require('./co-may.js') : window.CoMay;
  var HAM_EM = ['move', 'back', 'forward', 'wait_n', 'tr_left', 'tr_right', 'squirt', 'pick', 'drop', 'swing_l', 'swing_r', 'fly_right'];
  /** Robot của màn: cỗ máy `ma` (CoMay.dung) ở ô xuất phát bd, cờ riêng co, đế son ('lam' Luna, 'tim' máy khách). */
  function may(ma, bd, them) {
    var t = them || {};
    var r = CoMay.dung(ma, { batDau: bd, son: t.son, pin: t.pin });
    if (t.co) r.co = t.co;
    if (t.coDinh) r.coDinh = true;
    if (t.tay) r.robot.tay = t.tay;
    if (t.tay || t.boHam || t.themHam) r.hamGoc = r.hamGoc.filter(function (h) { return (t.boHam || []).indexOf(h) < 0; }).concat(t.themHam || []);
    if (t.phatNot) r.phatNot = true;
    return r;
  }
  /** Khe robot em lập trình ở màn chọn đội / khe lắp: chỉ ô xuất phát, cờ, pin (drone), đế. */
  function khe(bd, them) { return Object.assign({ batDau: bd }, them || {}); }
  function doiBai(ds, hamMan, hamEm) {
    return { doi: ds.map(function (c) { return { chinh: c.slice() }; }), hamCuaMan: clone(hamMan || []), hamCuaEmMoi: clone(hamEm || []) };
  }
  /** Hàm của em tạo ở gói này (gói sau còn gọi: man-cuu-clb.js, man-cuu-hang-dong.js). */
  var H_VALVE_STEP9 = { ten: 'valve_step', thamSo: ['n'], than: ['squirt("low")', 'forward(n)'] };
  var H_PUSH_VALVE9 = { ten: 'push_valve', thamSo: ['n'], than: ['forward(n)', 'back()'] };
  /** Một cách lắp mẫu (màn tự lắp, lapRap.robot = 1): part của R2 + lời giải cả đội. */
  function cach(than, tay, cam, ds, hamEm) { return { than: than, tay: tay || null, camBien: cam || null, loiGiai: doiBai(ds, [], hamEm) }; }
  function lapR2(than, tay, cam, nganSach, cachLap, them) {
    return Object.assign({ robot: 1, than: than, tay: tay, camBien: cam, nganSach: nganSach, dungKho: true, cachLap: cachLap }, them || {});
  }
  /** R2 đã lắp sẵn (màn show chương 2, lai L1): cần cẩu + nam châm trên đầu cần (cầu trục từ), như LapRap.apDung lắp ra; màn khai moLai ['L1']. */
  var CAU_TU = {
    loaiRobot: 'cau', robot: { than: 'cau', tay: 'nam-cham', camBien: [], son: 'lam' },
    hamGoc: ['swing_left', 'swing_right', 'extend', 'retract', 'wait', 'magnet_n', 'magnet_s', 'magnet_off']
  };
  function man9(chuong, so, hang, cfg) {
    var r1 = cfg.doi[0];
    var m = {
      chuong: chuong, so: so, ten: cfg.ten, hang: hang, vo: 'nha-may',
      cauTruc: ['for', 'if', 'while', 'list'], vaHoac: true, moXuong: true, camHamCuaEm: false,
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

  ManHoc.manCuuNhaMay = [
    /* ========================================================================
       CHƯƠNG 1: cuu-nha-may (10 màn)
       ======================================================================== */
    // 1 · show: cần cẩu nhấc container chắn lối (treo luôn trên móc), xe cứu hỏa ủi thùng nặng vào ô đích (chạy sẵn, khoá). Đội cố định CU + CC (màn chạy sẵn không qua bảng chọn).
    man9('cuu-nha-may', 1, 'lam-quen', {
      ten: 'Cẩu mở lối',
      chiChay: true, mucTieu: 'day-thung',
      deBai: 'Bão hất container chắn lối. Cẩu nhấc container, xe cứu hỏa ủi thùng vào ô đích. Bấm Chạy.',
      veMaMau: 'Bấm Chạy xem mỗi bạn làm gì.',
      san: ['##########', '#..H....D#', '#####R.###', '#####R####', '##########'],
      doi: [may('CU', { x: 1, y: 1, huong: 1 }), may('CC', { x: 5, y: 3, nac: 0, tam: 2 }, { son: 'lam' })],
      them: { contChan: true, chong: [{ x: 5, y: 1, cont: [{ so: 7 }] }] },
      maMau: doiBai([['forward(6)'], ['pick_up()', 'swing_right()']]),
      loiGiai: doiBai([['forward(6)'], ['pick_up()', 'swing_right()']]),
      sao: { o: 10, nhip: 7 },
      goiY: ['Còn container, thùng nặng không qua được.'],
      cauDo: { doi: ['CU', 'CC'], lap: null, coChe: ['container', 'thung-nang'], cuu: 'hang', meo: 'don-loi' }
    }),

    // 2 · chờ tín hiệu: băng chuyền đưa thùng nặng tới; container chặn băng. Cẩu nhấc container; xe cứu hỏa đọc hồng ngoại distance(), thùng tới sát mũi thì ủi vào đích.
    //     Hai khe đứng trên dải ray, mặt hướng lên (bảng có cần cẩu).
    man9('cuu-nha-may', 2, 'lam-quen', {
      ten: 'Chờ thùng tới',
      mucTieu: 'day-thung',
      deBai: 'Băng chuyền đưa thùng nặng tới. Container chặn băng. Thùng tới sát mũi xe thì ủi vào đích.',
      veMaMau: 'Xe chưa biết chờ thùng.',
      san: ['########', '###D####', '#>>....#', '###RR###', '########'],
      doi: [khe({ x: 3, y: 3, huong: 0 }), khe({ x: 4, y: 3, huong: 0 })],
      them: { contChan: true, chong: [{ x: 3, y: 2, cont: [{ so: 4 }] }], thungThem: [{ x: 1, y: 2 }] },
      chonDoi: {
        menu: ['CU', 'CC'],
        cachMau: [{ chon: ['CU', 'CC'], ghiChu: 'đôi tốt', loiGiai: doiBai([
          ['wait_n(2)', 'while distance() > 0:', '    wait()', 'move()'],
          ['swing_left()', 'pick_up()', 'swing_right()', 'set_down()']]) }]
      },
      maMau: doiBai([['wait_n(2)', 'move()'], ['swing_left()', 'pick_up()', 'swing_right()', 'set_down()']]),
      loiSai: [
        { moTa: 'Xe ủi ngay khi thùng chưa tới', baiLam: doiBai([['wait_n(2)', 'move()'], ['swing_left()', 'pick_up()', 'swing_right()', 'set_down()']]), phaiCoMa: ['chua-day-thung'] }
      ],
      sao: { o: 16, nhip: 6 },
      goiY: ['distance() > 0: trước mũi còn ô trống.'],
      cauDo: { doi: ['CU', 'CC'], lap: null, coChe: ['bang-chuyen', 'container', 'thung-nang'], cuu: 'hang', meo: 'cho-tin-hieu' }
    }),

    // 3 · đọc rồi chọn: chồng giữa (2 container) chắn lối thùng; chồng trên đã đầy 4, chồng dưới còn chỗ. Cẩu vươn / thu cần chuyển container sang chồng còn chỗ (biến n = số container).
    //     Bẫy: drone (bay qua được nhưng không nhấc container, không ủi thùng).
    man9('cuu-nha-may', 3, 'luyen', {
      ten: 'Chồng nào còn chỗ',
      mucTieu: 'day-thung',
      deBai: 'Chồng giữa chắn lối thùng. Một chồng tối đa 4 container. Chuyển sang chồng còn chỗ.',
      veMaMau: 'Cẩu mới vươn tới chồng giữa.',
      san: ['#########', '#####.###', '#..H...D#', '#.###.###', '#RRRRR###', '#########'],
      doi: [khe({ x: 1, y: 4, huong: 0 }), khe({ x: 5, y: 4, huong: 0 })],
      them: { contChan: true, chong: [{ x: 5, y: 1, cont: [{ so: 11 }, { so: 12 }, { so: 13 }, { so: 14 }] }, { x: 5, y: 2, cont: [{ so: 21 }, { so: 22 }] }, { x: 5, y: 3, cont: [{ so: 31 }] }] },
      chonDoi: {
        menu: ['CU', 'CC', 'DR'],
        cachMau: [{ chon: ['CU', 'CC'], ghiChu: 'đôi tốt', loiGiai: doiBai([
          ['forward(2)', 'tr_right()', 'forward(5)'],
          ['n = 2', 'for i in range(n):', '    extend()', '    pick_up()', '    retract()', '    set_down()']]) }]
      },
      maMau: doiBai([['forward(2)', 'tr_right()', 'forward(5)'], ['extend()']]),
      loiSai: [
        { moTa: 'Hạ container lên chồng trên đã đầy', baiLam: doiBai([['forward(2)', 'tr_right()', 'forward(5)'], ['n = 2', 'for i in range(n):', '    extend()', '    pick_up()', '    extend()', '    set_down()', '    retract()', '    retract()']]), phaiCoMa: ['ha-bi-chan'] }
      ],
      sao: { o: 22, nhip: 11 },
      goiY: ['extend() vươn lên, retract() thu về.', 'Đếm container mỗi chồng.'],
      cauDo: { doi: ['CU', 'CC'], lap: null, coChe: ['container', 'chong-day', 'thung-nang'], cuu: 'hang', meo: 'doc-roi-chon' }
    }),

    // 4 · làm cầu: vệt dầu trơn trước thùng nặng; xích vào dầu là trượt tới hố. Drone bay fly_right(n) tới ô rẽ, rắc cát; xích dừng ở ô cát, quay, ủi thùng vào đích.
    man9('cuu-nha-may', 4, 'luyen', {
      ten: 'Cát trên vệt dầu',
      mucTieu: 'day-thung',
      deBai: 'Vệt dầu trơn: xích vào là trượt tới hố. Rắc cát ô nằm dưới thùng để xích dừng lại.',
      veMaMau: 'Drone chưa tới ô rẽ.',
      san: ['########', '####D###', '####H###', '#.IIIIu#', '#......#', '########'],
      doi: [khe({ x: 1, y: 3, huong: 1 }), khe({ x: 1, y: 4, huong: 1 })],
      chonDoi: {
        menu: ['CU', 'DR'],
        cachMau: [{ chon: ['CU', 'DR'], ghiChu: 'đôi tốt', loiGiai: doiBai([
          ['wait_n(5)', 'move()', 'tr_left()', 'move()'],
          ['fly_right(3)', 'go_up()', 'dot()', 'go_down()']]) }]
      },
      maMau: doiBai([['wait_n(5)', 'move()', 'tr_left()', 'move()'], []]),
      loiSai: [
        { moTa: 'Không rắc cát: xích trượt rơi hố', baiLam: doiBai([['wait_n(5)', 'move()', 'tr_left()', 'move()'], ['fly_right(3)']]), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 18, nhip: 11 },
      goiY: ['fly_right(3): bay 3 ô sang phải.'],
      cauDo: { doi: ['CU', 'DR'], lap: null, coChe: ['dau-tron', 'rac-cat', 'ho', 'thung-nang'], cuu: 'hang', meo: 'lam-cau' }
    }),

    // 5 · cứu người + tạo hàm valve_step(n): công nhân kẹt trong phòng điều khiển sau cửa C. Container chắn ngách van; cẩu nhấc container,
    //     xích vào ngách, valve_step(1): phun nhẹ trúng van N mở cửa C rồi tiến 1 ô. Bẫy: máy khai thác (không nhấc container, không phun).
    man9('cuu-nha-may', 5, 'cung-co', {
      ten: 'Phòng điều khiển',
      mucTieu: 'cuu-nguoi',
      taoHam: ['valve_step'],
      deBai: 'Công nhân kẹt sau cửa C. Van N mở cửa. Viết hàm valve_step(n): phun nhẹ, rồi tiến n ô.',
      veMaMau: 'Hàm valve_step chưa có.',
      san: ['#########', '#..C...N#', '#######.#', '######..#', '#####RRR#', '#########'],
      noi: [{ nut: { x: 7, y: 1 }, cua: [{ x: 3, y: 1 }] }],
      doi: [khe({ x: 7, y: 4, huong: 0 }), khe({ x: 5, y: 4, huong: 0 })],
      them: { contChan: true, chong: [{ x: 7, y: 2, cont: [{ so: 5 }] }], nguoi: [{ x: 1, y: 1 }], tramCuu: [{ x: 5, y: 1 }] },
      chonDoi: {
        menu: ['CU', 'CC', 'KT'],
        cachMau: [{ chon: ['CU', 'CC'], ghiChu: 'đôi tốt', loiGiai: doiBai([
          ['move()', 'wait_n(2)', 'valve_step(1)'],
          ['swing_right()', 'extend()', 'pick_up()', 'retract()', 'set_down()']], [], [H_VALVE_STEP9]) }]
      },
      maMau: doiBai([['move()', 'wait_n(2)', 'valve_step(1)'], ['swing_right()', 'extend()', 'pick_up()', 'retract()', 'set_down()']]),
      loiSai: [
        { moTa: 'Thân valve_step thiếu lệnh phun', baiLam: doiBai([['move()', 'wait_n(2)', 'valve_step(1)'], ['swing_right()', 'extend()', 'pick_up()', 'retract()', 'set_down()']]), hamCuaEmMoi: [{ ten: 'valve_step', thamSo: ['n'], than: ['forward(n)'] }], phaiCoMa: ['chua-cuu-nguoi'] }
      ],
      sao: { o: 23, nhip: 9 },
      goiY: ['Trong valve_step(n): squirt("low") rồi forward(n).'],
      cauDo: { doi: ['CU', 'CC'], lap: null, coChe: ['container', 'van', 'cua'], cuu: 'nguoi', meo: 'don-loi' }
    }),

    // 6 · dọn lối: băng chuyền đưa thanh sắt tới mép hố; ô bên kia hố có chồng container (nhện đáp vào là hụt). Cẩu nhấc chồng, nhện hút sắt, nhảy hố, thả sắt vào ô đích.
    //     Bẫy: xe cứu hỏa (không qua hố, không nhấc container).
    man9('cuu-nha-may', 6, 'cung-co', {
      ten: 'Sắt trên băng',
      mucTieu: 'dua-vat',
      deBai: 'Băng chuyền đưa thanh sắt tới mép hố. Bên kia hố có chồng container. Đưa sắt vào ô đích.',
      veMaMau: 'Nhện chưa có lệnh.',
      san: ['#########', '#>>>.u.D#', '####.#..#', '####RRR##', '#########'],
      doi: [khe({ x: 4, y: 3, huong: 0 }), khe({ x: 6, y: 3, huong: 0 })],
      them: { contChan: true, chong: [{ x: 6, y: 1, cont: [{ so: 6 }] }], vatThem: [{ x: 3, y: 1, chat: 'sat' }] },
      chonDoi: {
        menu: ['CU', 'PL', 'CC'],
        cachMau: [{ chon: ['PL', 'CC'], ghiChu: 'đôi tốt', loiGiai: doiBai([
          ['go_up()', 'go_up()', 'magnet_n()', 'go_left()', 'wait()', 'jump("R")', 'go_right()', 'magnet_off()', 'wait()'],
          ['extend()', 'pick_up()', 'retract()', 'set_down()']]) }]
      },
      maMau: doiBai([['go_up()', 'go_up()'], []]),
      loiSai: [
        { moTa: 'Cẩu không nhấc container: nhện nhảy hụt', baiLam: doiBai([['go_up()', 'go_up()', 'magnet_n()', 'go_left()', 'wait()', 'jump("R")', 'go_right()', 'magnet_off()', 'wait()'], []]), phaiCoMa: ['nhay-hut'] }
      ],
      sao: { o: 30, nhip: 16 },
      goiY: ['Nhện nhảy qua hố: jump("R").', 'magnet_n() hút sắt dưới bụng.'],
      cauDo: { doi: ['PL', 'CC'], lap: null, coChe: ['bang-chuyen', 'sat', 'ho', 'container'], cuu: 'hang', meo: 'don-loi' }
    }),

    // 7 · cứu máy: xe cứu hỏa khách (R3, khoá) kẹt giữa hai chồng container, đang đẩy kệ hàng về kho. Cẩu nhấc chồng trước mũi R3 đặt lên chồng kia;
    //     nhện đè nút M giữ cửa C. R3 tự chờ phía trước trống rồi ủi kệ vào ô đích. Bẫy: drone (không nhấc, không đè nút).
    //     Đội có cẩu nên mục tiêu là day-thung (cẩu không tới cờ): R3 ủi kệ vào đích là R3 thoát kẹt.
    man9('cuu-nha-may', 7, 'van-dung', {
      ten: 'Xe kẹt giữa chồng',
      mucTieu: 'day-thung',
      deBai: 'Xe cứu hỏa kẹt giữa hai chồng container. Xe chờ phía trước trống thì tiến. Mở lối cho xe ủi kệ vào kho.',
      veMaMau: 'Đọc chương trình của xe khoá.',
      san: ['#########', '#..C.HD##', '#.#M#####', '#RRR#####', '#########'],
      noi: [{ nut: { x: 3, y: 2 }, cua: [{ x: 3, y: 1 }] }],
      doi: [khe({ x: 2, y: 3, huong: 0 }), khe({ x: 3, y: 3, huong: 0 }),
        may('CU', { x: 1, y: 1, huong: 1 }, { son: 'tim', coDinh: true })],
      them: { contChan: true, chong: [{ x: 2, y: 1, cont: [{ so: 7 }] }, { x: 1, y: 2, cont: [{ so: 8 }] }] },
      chonDoi: {
        menu: ['CC', 'DR', 'PL'],
        cachMau: [{ chon: ['CC', 'PL'], ghiChu: 'đôi tốt', loiGiai: doiBai([
          ['extend()', 'pick_up()', 'retract()', 'swing_left()', 'set_down()'],
          ['go_up()']]) }]
      },
      maMau: doiBai([[], [], ['while distance() == 0:', '    wait()', 'forward(4)']]),
      loiSai: [
        { moTa: 'Cẩu nhấc chồng dưới: xe vẫn kẹt', baiLam: doiBai([['swing_left()', 'pick_up()', 'swing_right()', 'extend()', 'set_down()'], ['go_up()'], ['while distance() == 0:', '    wait()', 'forward(4)']]), phaiCoMa: ['vong-vo-han'] }
      ],
      sao: { o: 17, nhip: 7 },
      goiY: ['Xe khoá đọc distance(): chồng container như tường.', 'Cẩu đặt container lên chồng kia.'],
      cauDo: { doi: ['CC', 'PL'], lap: null, coChe: ['container', 'nut-de', 'cua', 'r3'], cuu: 'may', meo: 'don-loi' }
    }),

    // 8 · cứu máy, song song: xe cứu hỏa khách (R3, khoá) đã nổ máy, tiến ngay 4 ô ủi kệ về kho. Trên lối: thùng gỗ (ô ray) rồi chồng container.
    //     Nhịp 1 xe chở hàng gắp thùng bên phải (kẹp xoay, không quay); nhịp 2 cẩu quay cần nhấc chồng. Chậm một nhịp là R3 đâm.
    //     Bẫy: máy khai thác (phải quay rồi mới nạp được thùng: R3 đâm thùng).
    man9('cuu-nha-may', 8, 'van-dung', {
      ten: 'Dọn cùng lúc',
      mucTieu: 'day-thung',
      deBai: 'Xe cứu hỏa đã nổ máy, tiến ngay 4 ô. Thùng gỗ và chồng container chắn lối. Hai bạn dọn cùng lúc.',
      veMaMau: 'Đọc chương trình của xe khoá.',
      san: ['#######', '###D###', '###H###', '###.###', '###..##', '##RRR##', '###.###', '#######'],
      doi: [khe({ x: 4, y: 5, huong: 0 }), khe({ x: 2, y: 5, huong: 0 }),
        may('CU', { x: 3, y: 6, huong: 0 }, { son: 'tim', coDinh: true })],
      them: { contChan: true, chong: [{ x: 3, y: 4, cont: [{ so: 9 }] }], vatThem: [{ x: 3, y: 5 }] },
      chonDoi: {
        menu: ['CC', 'CH', 'KT'],
        cachMau: [{ chon: ['CC', 'CH'], ghiChu: 'đôi tốt', loiGiai: doiBai([
          ['swing_left()', 'pick_up()', 'swing_right()', 'set_down()'],
          ['pick_right()']]) }]
      },
      maMau: doiBai([[], [], ['forward(4)']]),
      loiSai: [
        { moTa: 'Cẩu chậm một nhịp: xe khoá đâm chồng', baiLam: doiBai([['wait()', 'swing_left()', 'pick_up()', 'swing_right()', 'set_down()'], ['pick_right()'], ['forward(4)']]), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 22, nhip: 5 },
      goiY: ['pick_right(): gắp thùng bên phải.', 'Xe khoá không chờ ai.'],
      cauDo: { doi: ['CC', 'CH'], lap: null, coChe: ['container', 'thung', 'r3'], cuu: 'may', meo: 'song-song' }
    }),

    // 9 · cứu máy, phong phú (nước, bè, chồng container, thùng nặng, R3): xưởng ngập. Xe cứu hỏa khách (R3, khoá) chờ 3 nhịp rồi tiến (cảm biến không thấy cầu phao: nước như tường) ủi kệ về kho.
    //     Xuồng kéo bè làm cầu phao qua rãnh nước; cẩu nhấc chồng container chắn sau cầu. Đội cố định: xuồng cần khe nước, cẩu cần khe ray, nên không chung một bảng chọn.
    man9('cuu-nha-may', 9, 'bien-the', {
      ten: 'Xưởng ngập',
      mucTieu: 'day-thung',
      deBai: 'Xưởng ngập nước. Xe cứu hỏa chờ 3 nhịp rồi tiến 3 ô. Kịp kéo bè làm cầu, nhấc chồng container.',
      veMaMau: 'Đọc chương trình của xe khoá.',
      hamCuaEmCan: HAM_EM.concat(['bridge_lay', 'pull_back', 'tow_grab', 'tow_drop']),
      san: ['#######', '###.###', '#~~qB~#', '#R....#', '#R.H..#', '###D###', '#######'],
      doi: [may('XU', { x: 2, y: 2, huong: 1 }), may('CC', { x: 1, y: 3, nac: 2, tam: 2 }, { son: 'lam' }),
        may('CU', { x: 3, y: 1, huong: 2 }, { son: 'tim', coDinh: true })],
      them: { contChan: true, chong: [{ x: 3, y: 3, cont: [{ so: 2 }] }] },
      maMau: doiBai([['bridge_lay(1)'], [], ['wait_n(3)', 'forward(3)']]),
      loiGiai: doiBai([['bridge_lay(1)'], ['pick_up()', 'retract()', 'set_down()'], ['wait_n(3)', 'forward(3)']]),
      loiSai: [
        { moTa: 'Cẩu không nhấc chồng: xe khoá đâm container', baiLam: doiBai([['bridge_lay(1)'], [], ['wait_n(3)', 'forward(3)']]), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 30, nhip: 7 },
      goiY: ['bridge_lay(1): kéo bè về ô q.', 'Cẩu: pick_up(), retract(), set_down().'],
      cauDo: { doi: ['CC', 'XU'], lap: null, coChe: ['nuoc', 'be', 'container', 'thung-nang', 'r3'], cuu: 'may', meo: 'lam-cau' }
    }),

    // 10 · song ca đoạn 2 "Kìa con bướm vàng" (Bè 1: 4 4 3 3 2 2 1 1 | Bè 2: 2 4 1 3 5 5 1 1), giữ cho gói 10 ghép bài; dùng play_part (cuu-kho-hang.10 tạo).
    //      Xe cứu hỏa lắp loa thay vòi phun hát bè 1; bè 2 do xe hang động hát (cẩu không gắn được loa, mà song ca cần đủ hai bè: lệch bảng "cẩu quay cần theo nhịp").
    //      Hát đúng nốt làm vỡ đá chuông chắn cửa xưởng (nốt 1 cuối mỗi bè). Đội cố định (tay loa không có trên bảng chọn).
    man9('cuu-nha-may', 10, 'trum', {
      ten: 'Song ca nhà máy',
      mucTieu: 'choi-dieu',
      deBai: 'Nhà máy chạy lại rồi! Hai xe song ca đoạn 2. Mỗi bạn gọi play_part với bè của mình.',
      veMaMau: 'Bè 2 mới có một nốt.',
      hamCuaEmCan: ['play_note', 'play_part'],
      san: ['#######', '#.....#', '#.....#', '#######'],
      doi: [may('CU', { x: 1, y: 1, huong: 1 }, { tay: 'loa', boHam: ['spray', 'spray_back'], themHam: ['note', 'beat'], phatNot: true }),
        may('HD', { x: 1, y: 2, huong: 1 }, { son: 'lam' })],
      them: { dieu: { r1: '4 4 3 3 2 2 1 1', r2: '2 4 1 3 5 5 1 1' }, daChuong: [{ x: 2, y: 1, not: 1, ben: 1 }, { x: 2, y: 2, not: 1, ben: 1 }] },
      maMau: doiBai([['play_part([4, 4, 3, 3, 2, 2, 1, 1])'], ['play_note(2)']]),
      loiGiai: doiBai([['play_part([4, 4, 3, 3, 2, 2, 1, 1])'], ['play_part([2, 4, 1, 3, 5, 5, 1, 1])']]),
      loiSai: [
        { moTa: 'Bè 2 mới phát một nốt', baiLam: doiBai([['play_part([4, 4, 3, 3, 2, 2, 1, 1])'], ['play_note(2)']]), phaiCoMa: ['lo-nhip'] },
        { moTa: 'Bè 2 thiếu 4 nốt cuối', baiLam: doiBai([['play_part([4, 4, 3, 3, 2, 2, 1, 1])'], ['play_part([2, 4, 1, 3])']]), phaiCoMa: ['lo-nhip'] }
      ],
      sao: { o: 7, nhip: 9 },
      goiY: ['Bè 2: play_part([2, 4, 1, 3, 5, 5, 1, 1]).'],
      cauDo: { doi: ['CU', 'HD'], lap: null, coChe: ['loa', 'da-chuong'], cuu: null, meo: 'song-song' }
    }),

    /* ========================================================================
       CHƯƠNG 2: lap-nha-may (10 màn)
       ======================================================================== */
    // 11 · show (lai L1): Luna lắp sẵn cẩu + nam châm (cầu trục từ, khoá). Thanh sắt vụn rơi chắn lối xe cứu hỏa; cầu trục hút sắt, vươn cần thả vào khe máy;
    //      xe cứu hỏa ủi thùng nặng vào ô đích. Bấm Chạy là thấy. Cẩu không tới cờ nên mục tiêu day-thung.
    man9('lap-nha-may', 1, 'lam-quen', {
      ten: 'Cầu trục từ',
      chiChay: true, mucTieu: 'day-thung',
      deBai: 'Luna lắp cẩu với nam châm: cầu trục từ. Cầu trục hút sắt vụn khỏi lối. Bấm Chạy.',
      veMaMau: 'Bấm Chạy xem cầu trục làm gì.',
      san: ['###.###', '#..o.HD', '###.###', '###.###', '#######'],
      doi: [may('CU', { x: 1, y: 1, huong: 1 }), Object.assign({ batDau: { x: 3, y: 3, nac: 0, tam: 2 } }, clone(CAU_TU))],
      them: { moLai: ['L1'], vatChat: ['.......', '...s...', '.......', '.......', '.......'] },
      maMau: doiBai([['wait()', 'forward(4)'], ['magnet_n()', 'extend()', 'magnet_off()']]),
      loiGiai: doiBai([['wait()', 'forward(4)'], ['magnet_n()', 'extend()', 'magnet_off()']]),
      sao: { o: 12, nhip: 6 },
      goiY: ['Nam châm trên đầu cần hút sắt ở ô dưới đầu cần.'],
      cauDo: { doi: null, lap: 'cau+nam-cham', coChe: ['sat', 'thung-nang', 'qua-tuong'], cuu: 'hang', meo: 'don-loi' }
    }),

    // 12 · ép đổi tay: thanh sắt rơi vào khe máy sau hàng rào. Đặt sắt lên nút M thì cửa C mở cho xe cứu hỏa ủi thùng. Móc cẩu chỉ nhấc container (sắt: móc hụt);
    //      nam châm hút sắt. Cẩu + nam châm (nhanh, đắt) hay drone + nam châm (rẻ, bay vòng qua rào, chậm).
    man9('lap-nha-may', 2, 'lam-quen', {
      ten: 'Móc hay nam châm',
      mucTieu: 'day-thung',
      deBai: 'Thanh sắt rơi vào khe máy. Đặt sắt lên nút M để mở cửa C. Lắp tay nào cho cẩu?',
      veMaMau: 'Xe cứu hỏa chờ cửa mở.',
      san: ['#########', '##o=M####', '##==.####', '####.####', '#...C.HD#', '#########'],
      noi: [{ nut: { x: 4, y: 1 }, cua: [{ x: 4, y: 4 }] }],
      doi: [may('CU', { x: 1, y: 4, huong: 1 }), khe({ x: 4, y: 3, huong: 0 }, { son: 'lam' })],
      them: { vatChat: ['.........', '..s......', '.........', '.........', '.........', '.........'] },
      lapRap: lapR2(['cau', 'drone'], ['moc-cau', 'nam-cham'], [], 9, [
        cach('cau', 'nam-cham', null, [['wait_n(4)', 'forward(5)'], ['extend()', 'swing_left()', 'magnet_n()', 'swing_right()', 'magnet_off()']]),
        cach('drone', 'nam-cham', null, [['wait_n(6)', 'forward(5)'], ['go_up()', 'go_up()', 'go_left()', 'go_left()', 'magnet_n()', 'wait()', 'go_right()', 'go_right()', 'magnet_off()', 'wait()']])
      ], { moLai: ['L1'] }),
      maMau: doiBai([['wait_n(4)', 'forward(5)'], []]),
      loiSai: [
        { moTa: 'Hút sắt rồi thả ngay tại khe: cửa đóng', baiLam: doiBai([['wait_n(4)', 'forward(5)'], ['extend()', 'swing_left()', 'magnet_n()', 'magnet_off()']]), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 17, nhip: 11 },
      goiY: ['Sắt không phải container.', 'magnet_n() hút, magnet_off() thả.'],
      cauDo: { doi: null, lap: 'cau+nam-cham', coChe: ['sat', 'nut-de', 'cua', 'thung-nang', 'doi-tay'], cuu: 'hang', meo: 'doc-roi-chon' }
    }),

    // 13 · lai L13 cẩu + nam châm + cảm biến từ: quanh bệ cẩu là đống lẫn sắt và gỗ. Sắt nằm trên lối xe cứu hỏa; hút nhầm gỗ là lỗi.
    //      Quét năm ô quanh bệ, front_metal() đọc ô đầu cần: sắt thì hút, vươn cần thả ra ngoài lối; biến n đếm số sắt đã dọn.
    //      Cách hai rẻ hơn: không lắp cảm biến, nhìn sân rồi quay thẳng tới từng thanh sắt.
    man9('lap-nha-may', 3, 'luyen', {
      ten: 'Sắt hay gỗ',
      mucTieu: 'day-thung',
      khung: { chinh: 16, moiHam: 8 },
      deBai: 'Sắt và gỗ lẫn quanh cẩu. Sắt chắn lối xe cứu hỏa. Chỉ hút sắt, thả ra ngoài lối.',
      veMaMau: 'Cẩu mới quét một ô.',
      san: ['#.#.#.###', '#.ooo.HD#', '##o.o####', '#########'],
      doi: [may('CU', { x: 1, y: 1, huong: 1 }), khe({ x: 3, y: 2, huong: 0 }, { son: 'lam' })],
      them: { vatChat: ['.........', '..sss....', '..g.g....', '.........'] },
      lapRap: lapR2(['cau'], ['moc-cau', 'nam-cham'], ['tu'], 11, [
        cach('cau', 'nam-cham', 'tu', [['wait_n(12)', 'forward(5)'],
          ['n = 0', 'swing_left()', 'swing_left()', 'for i in range(5):', '    if front_metal():', '        magnet_n()', '        extend()', '        magnet_off()', '        retract()', '        n = n + 1', '    swing_right()']]),
        cach('cau', 'nam-cham', null, [['wait_n(10)', 'forward(5)'],
          ['swing_left()', 'magnet_n()', 'extend()', 'magnet_off()', 'retract()', 'swing_right()', 'magnet_n()', 'extend()', 'magnet_off()', 'retract()', 'swing_right()', 'magnet_n()', 'extend()', 'magnet_off()']])
      ], { moLai: ['L1', 'L13'] }),
      maMau: doiBai([['wait_n(12)', 'forward(5)'], ['swing_left()', 'swing_left()', 'if front_metal():', '    magnet_n()']]),
      loiSai: [
        { moTa: 'Không đọc cảm biến: nam châm hút cả gỗ', baiLam: doiBai([['wait_n(12)', 'forward(5)'], ['swing_left()', 'swing_left()', 'for i in range(5):', '    magnet_n()', '    extend()', '    magnet_off()', '    retract()', '    swing_right()']]), phaiCoMa: ['hut-go'] }
      ],
      sao: { o: 24, nhip: 20 },
      goiY: ['front_metal(): ô đầu cần có sắt không.', 'n = n + 1: đếm thêm một thanh.'],
      cauDo: { doi: null, lap: 'cau+nam-cham+tu', coChe: ['sat', 'go', 'cam-bien', 'thung-nang'], cuu: 'hang', meo: 'doc-roi-chon' }
    }),

    // 14 · lai L8 cẩu + gầu ngoạm: thùng gỗ kẹt trên lối xe cứu hỏa, ngay sau bức tường khe máy. Gầu thả từ đầu cần xuống, ngoạm qua tường: extend() rồi grab().
    //      Cách hai rẻ hơn: xe hai bánh + tay kẹp vòng qua lối hẹp bên phải, gắp thùng rồi lùi ra khỏi lối (chậm, dài).
    man9('lap-nha-may', 4, 'luyen', {
      ten: 'Gầu ngoạm qua tường',
      mucTieu: 'day-thung',
      hamCuaEmCan: HAM_EM.concat(['turn_left', 'turn_right']),
      deBai: 'Thùng gỗ kẹt trên lối, sau bức tường khe máy. Lắp robot gắp thùng ra cho xe cứu hỏa đẩy thùng nặng vào ô D.',
      veMaMau: 'Xe cứu hỏa chờ lối trống.',
      san: ['#########', '#..o..HD#', '####.####', '###..####', '#########'],
      doi: [may('CU', { x: 1, y: 1, huong: 1 }), khe({ x: 3, y: 3, huong: 0 }, { son: 'lam' })],
      lapRap: lapR2(['cau', 'hai-banh'], ['moc-cau', 'kep'], [], 8, [
        cach('cau', 'kep', null, [['wait()', 'forward(5)'], ['extend()', 'grab()']]),
        cach('hai-banh', 'kep', null, [['wait_n(8)', 'forward(5)'], ['turn_right()', 'move()', 'turn_left()', 'forward(2)', 'turn_left()', 'pick()', 'turn_left()', 'move()']])
      ], { moLai: ['L8'] }),
      maMau: doiBai([['wait()', 'forward(5)'], ['extend()']]),
      loiSai: [
        { moTa: 'Ngoạm rồi thả lại ngay chỗ cũ: thùng vẫn chắn lối', baiLam: doiBai([['wait_n(3)', 'forward(5)'], ['extend()', 'grab()', 'release()']]), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 11, nhip: 7 },
      goiY: ['Gầu thả từ đầu cần xuống: extend() rồi grab().', 'Ngoạm xong cứ cầm thùng, đừng thả lại xuống lối.'],
      cauDo: { doi: null, lap: 'cau+kep', coChe: ['go', 'qua-tuong', 'thung-nang'], cuu: 'hang', meo: 'don-loi' }
    }),

    // 15 · omni + vòi phun + hồng ngoại: bốn cửa C trên lối xe cứu hỏa, mỗi cửa mở bằng một nút N trong bức tường máy. Nút nằm lệch nhau; ô trước nút trống,
    //      ô trước tường thì không. Omni trượt dọc hàng, distance() > 0 là có nút trước mặt cách 2 ô: phun nhẹ (không giật). Cửa mở và giữ mở cho xe cứu hỏa qua.
    //      Cách hai rẻ hơn: không lắp hồng ngoại, đếm cột trên sân rồi viết từng lần trượt (dài hơn).
    man9('lap-nha-may', 5, 'cung-co', {
      ten: 'Hàng nút trong tường',
      mucTieu: 'day-thung',
      hamCuaEmCan: HAM_EM.concat(['slide_r']),
      deBai: 'Bốn cửa chắn lối xe cứu hỏa. Mỗi cửa có một nút N trong tường máy. Lắp robot trượt dọc hàng, phun trúng từng nút.',
      veMaMau: 'Omni mới phun nút đầu.',
      san: ['############', '#.C.C.C.CHD#', '##NN##N#N###', '##..##.#.###', '#..........#', '############'],
      noi: [{ nut: { x: 2, y: 2 }, cua: [{ x: 2, y: 1 }] }, { nut: { x: 3, y: 2 }, cua: [{ x: 4, y: 1 }] }, { nut: { x: 6, y: 2 }, cua: [{ x: 6, y: 1 }] }, { nut: { x: 8, y: 2 }, cua: [{ x: 8, y: 1 }] }],
      doi: [may('CU', { x: 1, y: 1, huong: 1 }), khe({ x: 2, y: 4, huong: 0 }, { son: 'lam' })],
      them: { lucBan: true },
      lapRap: lapR2(['omni', 'hai-banh'], ['hoi', 'kep'], ['hong-ngoai'], 9, [
        cach('omni', 'hoi', 'hong-ngoai', [['wait_n(4)', 'forward(9)'], ['for i in range(7):', '    if distance() > 0:', '        squirt("low")', '    slide_r(1)']]),
        cach('omni', 'hoi', null, [['wait_n(4)', 'forward(9)'], ['squirt("low")', 'slide_r(1)', 'squirt("low")', 'slide_r(3)', 'squirt("low")', 'slide_r(2)', 'squirt("low")']])
      ]),
      maMau: doiBai([['wait_n(4)', 'forward(9)'], ['squirt("low")']]),
      loiSai: [
        { moTa: 'Đọc ngược: phun khi distance() == 0 (trúng tường), nút không bật, cửa còn đóng', baiLam: doiBai([['wait_n(4)', 'forward(9)'], ['for i in range(7):', '    if distance() == 0:', '        squirt("low")', '    slide_r(1)']]), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 22, nhip: 14 },
      goiY: ['distance() > 0: trước mặt có ô trống, nút nằm sau ô đó.', 'squirt("low") phun nhẹ, không giật.'],
      cauDo: { doi: null, lap: 'omni+hoi+hong-ngoai', coChe: ['nut-ban', 'cua', 'thung-nang', 'cam-bien'], cuu: 'hang', meo: 'giu-cua' }
    }),

    // 16 · bánh gai + vòi phun: vệt dầu dài (ô I) dẫn tới chỗ đứng phun nút N; cuối vệt là hố. Bánh gai bung gai bám dầu, dừng đúng ô, quay lên phun nhẹ:
    //      nút bật, cửa C mở và giữ mở cho xe cứu hỏa. Xe hai bánh vào dầu là trượt xuống hố. Cách hai rẻ hơn: hai bánh vòng hành lang khô bên dưới,
    //      đi lên ô dầu dưới nút thì trượt một ô tới sát nút rồi phun (chậm, dài).
    man9('lap-nha-may', 6, 'cung-co', {
      ten: 'Bám vệt dầu',
      mucTieu: 'day-thung',
      hamCuaEmCan: HAM_EM.concat(['turn_left', 'turn_right']),
      deBai: 'Cửa C đóng. Nút N ở cuối vệt dầu trơn, cạnh hố. Lắp robot tới tầm phun nút cho xe cứu hỏa qua cửa.',
      veMaMau: 'Robot mới tới đầu vệt dầu.',
      san: ['#########', '#.C...HD#', '###N#####', '###.#####', '#uIIIIII.', '###......', '#########'].map(function (h) { return (h + '#').slice(0, 9); }),
      noi: [{ nut: { x: 3, y: 2 }, cua: [{ x: 2, y: 1 }] }],
      doi: [may('CU', { x: 1, y: 1, huong: 1 }), khe({ x: 8, y: 4, huong: 3 }, { son: 'lam' })],
      them: { lucBan: true },
      lapRap: lapR2(['gai', 'hai-banh'], ['hoi', 'kep'], [], 7, [
        cach('gai', 'hoi', null, [['wait_n(7)', 'forward(5)'], ['forward(5)', 'turn_right()', 'squirt("low")']]),
        cach('hai-banh', 'hoi', null, [['wait_n(11)', 'forward(5)'], ['turn_left()', 'move()', 'turn_right()', 'forward(5)', 'turn_right()', 'move()', 'squirt("low")']])
      ]),
      maMau: doiBai([['wait_n(7)', 'forward(5)'], ['move()']]),
      loiSai: [
        { moTa: 'Đi quá một ô trên dầu: đứng lệch, phun trúng tường', baiLam: doiBai([['wait_n(7)', 'forward(5)'], ['forward(6)', 'turn_right()', 'squirt("low")']]), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 19, nhip: 14 },
      goiY: ['Bánh gai đang bung gai: đi trên dầu không trượt.', 'Đứng ngay dưới nút, quay lên rồi phun.'],
      cauDo: { doi: null, lap: 'gai+hoi', coChe: ['dau-tron', 'ho', 'nut-ban', 'cua', 'thung-nang'], cuu: 'hang', meo: 'giu-cua' }
    }),

    // 17 · hai bánh + nam châm + cảm biến từ, chờ tín hiệu: thanh sắt rơi trên lối xe cứu hỏa. Xe đứng trên băng chuyền, băng chở xe dọc hàng phế liệu.
    //      Trước sắt có một khối nam châm cực S (không phải sắt): bật nam châm sớm là hút nhầm khối đó (bật cực S thì đẩy nó lên lối). Đọc front_metal() mỗi nhịp,
    //      thấy sắt mới bật nam châm. Cách hai rẻ hơn: xe hai bánh + tay kẹp để băng chở tới, lên một ô rồi gắp (chậm hơn).
    //      (Bảng: "sắt rơi trên băng chuyền tới" — lõi không cho băng chở vật nhẹ, nên băng chở xe qua sắt.)
    man9('lap-nha-may', 7, 'van-dung', {
      ten: 'Chờ sắt trên băng',
      mucTieu: 'day-thung',
      deBai: 'Băng chuyền chở xe dọc hàng phế liệu. Một thanh sắt chắn lối xe cứu hỏa. Khối đỏ xanh là nam châm, không phải sắt.',
      veMaMau: 'Xe mới chờ một nhịp.',
      san: ['##########', '#...o..HD#', '##o..#####', '#>>>.#####', '##########'],
      doi: [may('CU', { x: 1, y: 1, huong: 1 }), khe({ x: 1, y: 3, huong: 0 }, { son: 'lam' })],
      them: { vatChat: ['..........', '....s.....', '..S.......', '..........', '..........'] },
      lapRap: lapR2(['hai-banh', 'omni'], ['nam-cham', 'kep'], ['tu'], 7, [
        cach('hai-banh', 'nam-cham', 'tu', [['wait_n(5)', 'forward(6)'], ['while not front_metal():', '    wait()', 'magnet_n()', 'wait()']]),
        cach('hai-banh', 'kep', null, [['wait_n(6)', 'forward(6)'], ['wait_n(6)', 'move()', 'pick()']])
      ]),
      maMau: doiBai([['wait_n(5)', 'forward(6)'], ['wait()']]),
      loiSai: [
        { moTa: 'Bật nam châm ngay: hút nhầm khối nam châm, sắt còn trên lối', baiLam: doiBai([['wait_n(5)', 'forward(6)'], ['magnet_n()', 'wait()']]), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 16, nhip: 13 },
      goiY: ['front_metal(): vật đầu tiên trước mũi là sắt.', 'while not front_metal(): wait() — chờ tới khi thấy sắt.'],
      cauDo: { doi: null, lap: 'hai-banh+nam-cham+tu', coChe: ['bang-chuyen', 'sat', 'nam-cham', 'thung-nang'], cuu: 'hang', meo: 'cho-tin-hieu' }
    }),

    // 18 · drone + ⟨gieo hạt, nam châm⟩, cứu người + làm cầu + tạo lại hàm push_valve(n) [forward(n), back()] (gói sau còn gọi: man-cuu-clb.js, man-cuu-hang-dong.js):
    //      công nhân kẹt, thùng nặng H chắn lối ra. Xe cứu hỏa phải tới dưới thùng, đẩy thùng lên hốc rồi lùi xuống cho người qua: push_valve(1).
    //      Đường xe qua vệt dầu, cuối vệt là hố: drone rắc cát hai ô dầu (dot), xe dừng được đúng ô. Cách hai rẻ hơn: bánh gai bám dầu rắc từng ô (chậm hơn).
    //      Nam châm là bẫy: không rắc cát được. (Bảng: "rắc cát lối cho người tự đi ra" — lõi cho người đi qua dầu không trượt, nên cát là lối của xe.)
    man9('lap-nha-may', 8, 'van-dung', {
      ten: 'Cát cho xe cứu hỏa',
      mucTieu: 'cuu-nguoi',
      taoHam: ['push_valve'],
      hamCuaEmCan: HAM_EM.concat(['turn_left', 'turn_right', 'push_valve']),
      deBai: 'Công nhân kẹt, thùng H chắn lối ra trạm cứu. Xe cứu hỏa phải qua vệt dầu để đẩy thùng. Viết push_valve(n): tiến n ô rồi lùi một ô.',
      veMaMau: 'Hàm push_valve chưa có.',
      san: ['##########', '####.#####', '#.......##', '#..IIu####', '###..#####', '##########'],
      doi: [may('CU', { x: 1, y: 3, huong: 1 }), khe({ x: 3, y: 4, huong: 0 }, { son: 'lam' })],
      them: { thungThem: [{ x: 4, y: 2 }], nguoi: [{ x: 1, y: 2, duong: [{ x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 }, { x: 5, y: 2 }, { x: 6, y: 2 }, { x: 7, y: 2 }] }], tramCuu: [{ x: 7, y: 2 }] },
      lapRap: lapR2(['drone', 'gai'], ['son', 'nam-cham'], [], 8, [
        cach('drone', 'son', null, [['wait()', 'forward(3)', 'tr_left()', 'push_valve(1)'], ['go_up()', 'dot()', 'go_right()', 'dot()', 'go_down()']], [H_PUSH_VALVE9]),
        cach('gai', 'son', null, [['wait_n(3)', 'forward(3)', 'tr_left()', 'push_valve(1)'], ['move()', 'dot()', 'turn_right()', 'move()', 'dot()', 'turn_right()', 'move()']], [H_PUSH_VALVE9])
      ]),
      maMau: doiBai([['wait()', 'forward(3)', 'tr_left()', 'push_valve(1)'], ['go_up()', 'dot()']]),
      loiSai: [
        { moTa: 'Thân push_valve thiếu back(): xe đứng chắn lối người', baiLam: doiBai([['wait()', 'forward(3)', 'tr_left()', 'push_valve(1)'], ['go_up()', 'dot()', 'go_right()', 'dot()', 'go_down()']]), hamCuaEmMoi: [{ ten: 'push_valve', thamSo: ['n'], than: ['forward(n)'] }], phaiCoMa: ['chua-cuu-nguoi'] },
        { moTa: 'Rắc thiếu ô dầu thứ hai: xe trượt xuống hố', baiLam: doiBai([['wait()', 'forward(3)', 'tr_left()', 'push_valve(1)'], ['go_up()', 'dot()', 'go_right()', 'go_down()']], [], [H_PUSH_VALVE9]), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 27, nhip: 13 },
      goiY: ['dot() rắc cát ô dầu dưới drone: ô thành sàn thường.', 'push_valve(n): forward(n) rồi back().'],
      cauDo: { doi: null, lap: 'drone+son', coChe: ['dau-tron', 'rac-cat', 'ho', 'thung-nang', 'nguoi'], cuu: 'nguoi', meo: 'lam-cau' }
    }),

    // 19 · ⟨nhện, cẩu⟩ + nam châm, đọc rồi chọn: thanh sắt chắn lối xe cứu hỏa, giữa khe và sắt là hố, trên sắt là hốc trống.
    //      Nhện (rẻ): bật nam châm bụng, nhảy qua hố đáp lên sắt, leo lên hốc. Cẩu (nhanh, đắt): vươn cần hút sắt, vươn tiếp thả vào hốc.
    //      (Bảng ghi cẩu rẻ, nhện nhanh; giá part thật ngược lại: cẩu 6, nhện 4.)
    man9('lap-nha-may', 9, 'bien-the', {
      ten: 'Nhện hay cẩu',
      mucTieu: 'day-thung',
      deBai: 'Thanh sắt chắn lối, trước nó là hố. Nhện nhảy hố hay cẩu vươn cần? Xem giá, xem nhịp rồi chọn.',
      veMaMau: 'Robot chưa làm gì.',
      san: ['####.####', '#...o.HD#', '####u####', '####.####', '#########'],
      doi: [may('CU', { x: 1, y: 1, huong: 1 }), khe({ x: 4, y: 3, huong: 0 }, { son: 'lam' })],
      them: { vatChat: ['.........', '....s....', '.........', '.........', '.........'] },
      lapRap: lapR2(['nhen', 'cau'], ['nam-cham', 'kep'], [], 9, [
        cach('nhen', 'nam-cham', null, [['wait_n(3)', 'forward(5)'], ['magnet_n()', 'jump("U")', 'go_up()']]),
        cach('cau', 'nam-cham', null, [['forward(5)'], ['extend()', 'magnet_n()', 'extend()', 'magnet_off()']])
      ], { moLai: ['L1'] }),
      maMau: doiBai([['wait_n(3)', 'forward(5)'], []]),
      loiSai: [
        { moTa: 'Nhện nhảy mà quên bật nam châm: đáp lên sắt rồi đi, sắt còn trên lối', baiLam: doiBai([['wait_n(3)', 'forward(5)'], ['jump("U")', 'go_up()']]), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 29, nhip: 10 },
      goiY: ['Nam châm bụng nhện hút sắt ở ô nhện đứng.', 'Cẩu: extend() tới ô sắt, magnet_n(), extend() thêm rồi thả.'],
      cauDo: { doi: null, lap: 'nhen+nam-cham', coChe: ['sat', 'ho', 'nhay', 'thung-nang'], cuu: 'hang', meo: 'doc-roi-chon' }
    }),

    // 20 · ⟨omni, xích⟩ + loa, song ca đoạn 2 "Kìa con bướm vàng" (play_part, cuu-kho-hang.10 tạo): đá chuông nốt 5 chắn lối xe cứu hỏa; chỉ bè 2
    //      có nốt 5 (ben 1: ben 2 không dùng được vì bè 1 hát nốt 2 cùng nhịp, xe cứu hỏa nhìn thẳng vào đá, nốt khác làm đá về 0). Luna đứng xa đá; omni trượt ngang ba ô vào tầm (nhanh), xích phải quay rồi mới đi (rẻ hơn, chậm hơn).
    //      Xe cứu hỏa chờ bằng đúng số nhịp Luna di chuyển để hai bè vào cùng lúc, hát xong thì đi qua chỗ đá vỡ về cờ.
    //      (Bảng: "omni hát đi ngang theo nhịp giữa hai hàng máy". Đội choi-dieu có cờ thì lõi chưa cho thắng — xeToiCo chỉ ghi ở mục tiêu toi-co — nên dùng toi-co như G1.)
    man9('lap-nha-may', 10, 'trum', {
      ten: 'Song ca giữa hai hàng máy',
      hamCuaEmCan: HAM_EM.concat(['play_note', 'play_part', 'slide_r']),
      deBai: 'Nhà máy chạy lại rồi! Song ca đoạn 2. Đá chuông nốt 5 chắn lối: phải hát nốt 5 ở gần đá.',
      veMaMau: 'Xe cứu hỏa đã có bè 1.',
      san: ['##########', '#......F##', '#####.####', '#....F####', '##########'],
      them: { daChuong: [{ x: 5, y: 1, not: 5, ben: 1 }] },
      doi: [may('CU', { x: 1, y: 1, huong: 1 }, { co: [{ x: 7, y: 1 }], tay: 'loa', boHam: ['spray', 'spray_back'], themHam: ['note', 'beat'], phatNot: true }),
        khe({ x: 1, y: 3, huong: 0 }, { son: 'lam', co: [{ x: 5, y: 3 }] })],
      lapRap: lapR2(['omni', 'xich'], ['loa'], [], 7, [
        cach('omni', 'loa', null, [['wait_n(3)', 'play_part([4, 4, 3, 3, 2, 2, 1, 1])', 'forward(6)'], ['slide_r(3)', 'play_part([2, 4, 1, 3, 5, 5, 1, 1])', 'slide_r(1)']]),
        cach('xich', 'loa', null, [['wait_n(5)', 'play_part([4, 4, 3, 3, 2, 2, 1, 1])', 'forward(6)'], ['tr_right()', 'forward(3)', 'play_part([2, 4, 1, 3, 5, 5, 1, 1])', 'move()']])
      ]),
      maMau: doiBai([['wait_n(3)', 'play_part([4, 4, 3, 3, 2, 2, 1, 1])', 'forward(6)'], ['slide_r(3)']]),
      loiSai: [
        { moTa: 'Bè 2 hát ngay tại khe: đá chuông xa quá, không vỡ', baiLam: doiBai([['wait_n(3)', 'play_part([4, 4, 3, 3, 2, 2, 1, 1])', 'forward(6)'], ['play_part([2, 4, 1, 3, 5, 5, 1, 1])', 'slide_r(4)']]), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Bè 2 hát nhầm bè 1 (không có nốt 5): đá chuông còn', baiLam: doiBai([['wait_n(3)', 'play_part([4, 4, 3, 3, 2, 2, 1, 1])', 'forward(6)'], ['slide_r(3)', 'play_part([4, 4, 3, 3, 2, 2, 1, 1])', 'slide_r(1)']]), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 24, nhip: 20 },
      goiY: ['Bè 2: play_part([2, 4, 1, 3, 5, 5, 1, 1]).', 'Đá chuông vỡ khi nghe nốt 5 từ gần (tối đa 3 ô).'],
      cauDo: { doi: null, lap: 'omni+loa', coChe: ['loa', 'da-chuong', 'truot-ngang'], cuu: null, meo: 'song-song' }
    }),
  ];
})();
