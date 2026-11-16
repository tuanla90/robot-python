/* ============================================================================
   man-cuu-nong-trai.js - Mùa 9 CLB Sáng Tạo: Gói 6 "Nông trại sau bão" (dựng lại 16/11, M9M6, theo khuôn G4 / G5)
   20 màn: cuu-nong-trai (chọn đội trong menu cỗ máy) + lap-nong-trai (R1 drone nông nghiệp đặt sẵn, R2 tự lắp; lai L6 L12, T4).
   Ôn Python: list (a = [...], a[i], len(a), for c in a, a.append(...)).
   Bão: cây đổ (thùng nặng H, xích ủi) chắn luống, trạm sạc hỏng (ít ô sạc P), mương tràn thành bùn trơn (I).
   Gieo luống = tô hình mờ (mục tiêu to-hinh): drone / xe gắn bộ gieo hạt chấm hạt màu lên ô luống.
   Màn 10 mỗi chương: song ca đoạn 6 "Kìa con bướm vàng" (bè 1: 4 4 3 3 2 2 1 1 | bè 2: 6 2 5 1 4 5 3 1), gọi play_part.
   Câu đố: hoc/MUA-9-200-CAU-DO.md mục G6 (ghi chú "Đã dựng 16/11 (M9M6)": các chỗ lệch so với bảng).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  /* ---- M9M6: khung màn mùa 9 (chép từ man-cuu-ben-song.js) ------------------------------------------ */
  var CoMay = laNode ? require('./co-may.js') : window.CoMay;
  var HAM_EM = ['move', 'back', 'forward', 'wait_n', 'tr_left', 'tr_right', 'turn_left', 'turn_right', 'pick', 'drop', 'go', 'walk', 'jump', 'crawl', 'pull_s'];
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
  /** Khe robot em lập trình ở màn chọn đội / khe lắp: ô xuất phát trên cạn, batDauNuoc (ô trên nước khi cỗ máy là xuồng), cờ, pin (drone), đế. */
  function khe(bd, them) { return Object.assign({ batDau: bd }, them || {}); }
  function doiBai(ds, hamMan, hamEm) {
    return { doi: ds.map(function (c) { return { chinh: c.slice() }; }), hamCuaMan: clone(hamMan || []), hamCuaEmMoi: clone(hamEm || []) };
  }
  /** Một cách lắp mẫu (màn tự lắp, lapRap.robot = 1): part của R2 + lời giải cả đội. */
  function cach(than, tay, cam, ds, hamEm) { return { than: than, tay: tay || null, camBien: cam || null, loiGiai: doiBai(ds, [], hamEm) }; }
  function lapR2(than, tay, cam, nganSach, cachLap, them) {
    return Object.assign({ robot: 1, than: than, tay: tay, camBien: cam, nganSach: nganSach, dungKho: true, cachLap: cachLap }, them || {});
  }
  /** Hình mờ (luống cần gieo) từ danh sách { y, x0, mau: 'gggg' } trên sân rộng w, cao h. */
  function luong(w, h, ds) {
    var rows = []; for (var y = 0; y < h; y++) rows.push('.'.repeat(w).split(''));
    ds.forEach(function (l) { l.mau.split('').forEach(function (c, i) { if (c !== '.') rows[l.y][l.x0 + i] = c; }); });
    return rows.map(function (r) { return r.join(''); });
  }
  /** cuu-nong-trai.1: drone gieo luống trên (xanh lá) sang phải, xuống ô sạc đáp sạc, cất cánh, xuống luống dưới gieo (vàng) sang trái. Xe cứu hỏa ủi cây khỏi ô sạc, lùi nhường chỗ. */
  var DR_1 = ['ink("green")', 'pen_down()', 'for i in range(4):', '    go_right()', 'pen_up()', 'go_down()', 'land()', 'take_off()', 'go_down()',
    'ink("yellow")', 'pen_down()', 'for i in range(4):', '    go_left()', 'pen_up()'];
  var CU_1 = ['move()', 'back()'];
  /** cuu-nong-trai.2: drone bay tới ô sạc (cây đã ủi), đáp sạc, cất cánh, sang đầu luống, gieo theo danh sách màu a (kế hoạch của em). Xe cứu hỏa ủi cây lên, lùi. */
  var DR_2 = ['a = ["red", "yellow", "yellow", "red"]', 'for i in range(3):', '    go_right()', 'land()', 'take_off()', 'for i in range(3):', '    go_right()',
    'for c in a:', '    ink(c)', '    dot()', '    go_right()'];
  var CU_2 = ['move()', 'back()'];
  /** cuu-nong-trai.3: xe cứu hỏa ủi cây khỏi ô sạc, lùi, quay phải phun nút N mở cửa nhà kính. Drone: sang ô sạc, đáp sạc, bay qua cửa vào nhà kính gieo luống theo a. */
  var CU_3 = ['move()', 'back()', 'tr_right()', 'spray()', 'wait()'];
  var DR_3 = ['a = ["red", "yellow", "blue", "yellow"]', 'go_right()', 'go_right()', 'land()', 'take_off()', 'go_up()', 'for i in range(3):', '    go_right()',
    'for c in a:', '    ink(c)', '    dot()', '    go_right()'];
  /** cuu-nong-trai.4: drone xuống ô bùn dưới ô sạc rắc cát, lên chờ trên ô sạc tới khi xích ủi cây, đáp sạc, xuống luống dưới mương gieo theo a. Xích chờ cát, trượt dừng ở ô cát, quay lên ủi cây, lùi. */
  var DR_4 = ['a = ["green", "green", "yellow", "yellow", "green"]', 'for i in range(3):', '    go_right()', 'go_down()', 'dot()', 'go_up()', 'wait_n(5)', 'land()', 'take_off()', 'go_down()', 'go_down()',
    'for c in a:', '    ink(c)', '    dot()', '    go_right()'];
  var CU_4 = ['wait_n(5)', 'move()', 'tr_left()', 'move()', 'back()'];
  /** cuu-nong-trai.5: xe chở hàng chờ cây được ủi, đi tới trước cửa, gắp bao hạt, lùi, rẽ xuống khỏi lối. Xích ủi cây lên, lùi hai ô nhường chỗ. */
  var CH_5 = ['wait_n(2)', 'forward(3)', 'pick()', 'back()', 'turn_left()', 'forward(1)'];
  var CU_5 = ['move()', 'back()', 'back()'];
  /** cuu-nong-trai.6 (hai sân): xe chở hàng gắp bao hạt ở góc kho, quay đầu, chở tới đặt cạnh luống. Drone đậu chờ (đậu không tốn pin), cất cánh, bay lên bao đọc màu hạt c = color("here"), xuống luống gieo màu c. */
  var CH_6 = ['pick()', 'turn_left()', 'turn_left()', 'forward(5)', 'drop()'];
  var DR_6 = ['land()', 'wait_n(9)', 'take_off()', 'go_left()', 'c = color("here")', 'go_down()', 'go_down()', 'go_left()', 'go_left()', 'ink(c)', 'pen_down()', 'for i in range(4):', '    go_right()', 'pen_up()'];
  var SAN_6 = ['############', '#..........#', '#o.........#', '#..........#', '#..........#', '############'];
  function MAU_6(c) { return ['............', '............', '.' + c + '..........', '............', '............', '............']; }
  /** Drone khách khoá cuu-nong-trai.7: đậu chờ 6 nhịp, cất cánh, sang ô sạc thứ nhất đáp sạc, gieo ba ô, tới ô sạc thứ hai đáp sạc, gieo hai ô. */
  var DR_R3_7 = ['land()', 'wait_n(6)', 'take_off()', 'go_right()', 'go_right()', 'land()', 'take_off()', 'ink("green")', 'for i in range(3):', '    go_right()', '    dot()',
    'go_right()', 'land()', 'take_off()', 'for i in range(2):', '    go_right()', '    dot()', 'wait()'];
  var CU_7 = ['forward(1)', 'move()', 'back()'];
  var KT_7 = ['forward(1)', 'load()', 'wait()', 'turn_right()', 'throw()', 'wait()'];
  /** cuu-nong-trai.8: xuồng tung lưới bắt bè sạc, lùi ba ô kéo bè tới dưới drone khách, nhả lưới. Xe chở hàng gắp bao hạt trên ô sạc bờ.
   *  Drone khách khoá: đậu chờ, xuống đáp bè sạc, gieo năm ô sang phải tới ô sạc bờ, đáp sạc, xuống hàng dưới gieo năm ô sang trái. Xe chở hàng gắp bao, lùi. */
  var XU_8 = ['cast_net()', 'wait()', 'back()', 'back()', 'back()', 'drop_net()', 'wait()'];
  var CH_8 = ['pick()', 'back()'];
  var DR_R3_8 = ['land()', 'wait_n(7)', 'take_off()', 'go_down()', 'land()', 'take_off()', 'go_down()', 'ink("yellow")', 'for i in range(5):', '    dot()', '    go_right()',
    'land()', 'take_off()', 'go_down()', 'for i in range(5):', '    dot()', '    go_left()'];
  /** Drone khách khoá cuu-nong-trai.9: đậu chờ, sang ô sạc 1; theo danh sách độ dài luống a = [3, 2]: mỗi đoạn đáp sạc, cất cánh, gieo n ô, bay sang ô sạc kế. */
  var DR_R3_9 = ['land()', 'wait_n(3)', 'take_off()', 'go_right()', 'go_right()', 'ink("red")', 'a = [3, 2]', 'for n in a:', '    land()', '    take_off()',
    '    for i in range(n):', '        go_right()', '        dot()', '    go_right()'];
  var CH_9 = ['grab_clear()'];
  var PL_9 = ['go_up()', 'clear_iron("D")'];
  /** R2 đã lắp sẵn (màn show chương 2): xích + bộ gieo hạt + camera trước, như LapRap.apDung lắp ra. Màn khai xichDay: xích lắp ráp cũng ủi được cây đổ (như xe cứu hỏa). */
  var XICH_GIEO = {
    loaiRobot: 'xich', robot: { than: 'xich', tay: 'son', camBien: [{ ma: 'camera', o: 'tren' }], son: 'lam' },
    hamGoc: ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'ink', 'dot', 'pen_down', 'pen_up', 'color']
  };
  /** Drone R1 gieo một hàng n + 1 ô màu c sang phải (bút hạ). */
  function hang(c, n) { return ['ink("' + c + '")', 'pen_down()', 'for i in range(' + n + '):', '    go_right()', 'pen_up()']; }
  /** Xe gieo hạt R2 hạ bút chạy thẳng n ô: gieo cả ô xuất phát (xích ủi cây đổ trên đường đi). */
  function hangXe(c, n) { return ['ink("' + c + '")', 'pen_down()', 'forward(' + n + ')', 'pen_up()', 'wait()']; }
  /** lap-nong-trai.2: drone R1 gieo luống trên rồi đáp xuống đậu chờ (đậu không tốn pin). */
  var DR_12 = hang('red', 4).concat(['land()']);
  /** lap-nong-trai.3: nhện gieo hạt (L6) gieo ô dưới bụng: ba ô, nhảy qua mương sụt, gieo, co chân chui qua nhà kính đổ, duỗi chân, gieo hai ô. */
  var NHEN_13 = ['ink("green")', 'for i in range(2):', '    dot()', '    go_right()', 'dot()', 'crouch()', 'wait()', 'stand()', 'go_right()', 'dot()', 'crouch()',
    'for i in range(3):', '    go_right()', 'stand()', 'dot()', 'wait()', 'go_right()', 'dot()', 'wait()'];
  /** Drone R2 lap-nong-trai.3: bay qua mương, qua nhà kính, gieo theo danh sách a (1 gieo, 0 bỏ qua). */
  var DRONE_13 = ['ink("green")', 'a = [1, 1, 1, 0, 1, 0, 0, 1, 1]', 'for g in a:', '    if g == 1:', '        dot()', '    go_right()'];
  function man9(chuong, so, hang, cfg) {
    var r1 = cfg.doi[0];
    var m = {
      chuong: chuong, so: so, ten: cfg.ten, hang: hang, vo: 'nong-trai', daLapHo: true,
      cauTruc: ['for', 'if', 'while', 'list', 'def', 'return', 'tuple'], vaHoac: true, moXuong: true, camHamCuaEm: false,
      hamCuaEmCan: cfg.hamCuaEmCan || HAM_EM, taoHam: cfg.taoHam || [],
      khung: cfg.khung || { chinh: 12, moiHam: 8 }, mucTieu: cfg.mucTieu || 'to-hinh',
      deBai: cfg.deBai, veMaMau: cfg.veMaMau || '', san: cfg.san, batDau: clone(r1.batDau),
      doi: cfg.doi.map(clone), maMau: cfg.maMau, loiSai: cfg.loiSai || [], sao: cfg.sao, goiY: cfg.goiY || [], cauDo: cfg.cauDo
    };
    if (r1.loaiRobot) { m.loaiRobot = r1.loaiRobot; m.robot = clone(r1.robot); m.hamGoc = r1.hamGoc.slice(); }
    if (cfg.hinh) m.hinh = cfg.hinh;
    if (cfg.loiGiai) m.loiGiai = cfg.loiGiai;
    if (cfg.chonDoi) m.chonDoi = cfg.chonDoi;
    if (cfg.lapRap) m.lapRap = cfg.lapRap;
    if (cfg.noi) m.noi = cfg.noi;
    if (cfg.chiChay) { m.chiChay = true; m.chinhCoDinh = true; }
    Object.keys(cfg.them || {}).forEach(function (k) { m[k] = cfg.them[k]; });
    return ManHoc.chuanHoa(m);
  }

  ManHoc.manCuuNongTrai = [
    /* ========================================================================
       CHƯƠNG 1: cuu-nong-trai (10 màn)
       ======================================================================== */
    // 1 · show (dọn lối): bão quật cây đổ đè lên ô sạc P giữa hai luống. Drone ít pin: gieo xong luống trên là phải đáp sạc mới gieo được luống dưới;
    //     ô sạc có cây đổ thì không đáp được. Xe cứu hỏa tiến một ô ủi cây khỏi ô sạc, lùi nhường chỗ. Drone gieo luống trên, xuống đáp sạc, cất cánh,
    //     gieo luống dưới. Đội cố định DR + CU (chạy sẵn, khoá).
    man9('cuu-nong-trai', 1, 'lam-quen', {
      ten: 'Cây đổ đè ô sạc',
      khung: { chinh: 16, moiHam: 8 },
      chiChay: true,
      deBai: 'Bão quật cây đổ đè lên ô sạc. Xe cứu hỏa ủi cây ra, drone gieo luống trên, đáp sạc rồi gieo luống dưới. Bấm Chạy.',
      veMaMau: 'Bấm Chạy xem mỗi bạn làm gì.',
      san: ['#########', '#.......#', '#.....P.#', '#.......#', '#########'],
      them: { thungThem: [{ x: 6, y: 2 }] },
      hinh: luong(9, 5, [{ y: 1, x0: 2, mau: 'ggggg' }, { y: 3, x0: 2, mau: 'yyyyy' }]),
      doi: [may('DR', { x: 2, y: 1, huong: 1 }, { pin: 12 }), may('CU', { x: 5, y: 2, huong: 1 }, { son: 'lam' })],
      maMau: doiBai([DR_1, CU_1]),
      loiGiai: doiBai([DR_1, CU_1]),
      sao: { o: 26, nhip: 14 },
      goiY: ['Xích tiến vào ô cây đổ thì đẩy cây đi một ô.', 'land() trên ô sạc P: pin đầy lại. Ô có cây đổ thì không đáp được.'],
      cauDo: { doi: ['DR', 'CU'], lap: null, coChe: ['cay-do', 'gieo', 'sac', 'pin'], cuu: 'hang', meo: 'don-loi' }
    }),
    // 2 · dọn lối, ôn list (kế hoạch của em): cây đổ đè ô sạc giữa đường bay. Drone ít pin: bay thẳng tới luống thì hết pin giữa luống; phải đáp sạc ở ô sạc trước.
    //     Xe cứu hỏa tiến ủi cây khỏi ô sạc, lùi. Drone gieo luống bốn ô theo danh sách màu a = ["red", "yellow", "yellow", "red"]: for c in a: ink(c), dot(), go_right().
    //     Bảng 2 cỗ máy (đúng đôi tốt). Drone ở khe 1 (pin 12).
    man9('cuu-nong-trai', 2, 'lam-quen', {
      ten: 'Gieo theo danh sách',
      deBai: 'Cây đổ đè ô sạc. Drone ít pin: phải đáp sạc giữa đường. Gieo luống theo danh sách màu a, mỗi ô một màu.',
      veMaMau: 'Drone bay thẳng tới luống: hết pin giữa chừng.',
      san: ['#############', '#...........#', '#...P.......#', '#...........#', '#############'],
      them: { thungThem: [{ x: 4, y: 2 }] },
      hinh: luong(13, 5, [{ y: 2, x0: 7, mau: 'ryyr' }]),
      doi: [khe({ x: 1, y: 2, huong: 1 }, { pin: 12 }), khe({ x: 4, y: 3, huong: 0 })],
      chonDoi: {
        menu: ['DR', 'CU'],
        cachMau: [{ chon: ['DR', 'CU'], ghiChu: 'đôi tốt', loiGiai: doiBai([DR_2, CU_2]) }]
      },
      maMau: doiBai([['a = ["red", "yellow", "yellow", "red"]', 'for i in range(6):', '    go_right()', 'for c in a:', '    ink(c)', '    dot()', '    go_right()'], []]),
      loiSai: [
        { moTa: 'Drone không đáp sạc: hết pin giữa luống', baiLam: doiBai([['a = ["red", "yellow", "yellow", "red"]', 'for i in range(6):', '    go_right()', 'for c in a:', '    ink(c)', '    dot()', '    go_right()'], CU_2]), phaiCoMa: ['het-pin'] },
        { moTa: 'Xe cứu hỏa không ủi cây: drone không đáp được', baiLam: doiBai([DR_2, []]), phaiCoMa: ['dap-bi-chan'] },
        { moTa: 'Danh sách thiếu một màu: luống còn ô chưa gieo', baiLam: doiBai([DR_2.map(function (d, i) { return i === 0 ? 'a = ["red", "yellow", "red"]' : d; }), CU_2]), phaiCoMa: ['chua-to-hinh'] }
      ],
      sao: { o: 22, nhip: 14 },
      goiY: ['for c in a: lần lượt lấy từng màu trong danh sách a.', 'land() trên ô sạc P: pin đầy lại.'],
      cauDo: { doi: ['DR', 'CU'], lap: null, coChe: ['cay-do', 'gieo', 'sac', 'pin', 'list'], cuu: 'hang', meo: 'don-loi' }
    }),
    // 3 · dọn lối + mở cửa: cây đổ đè ô sạc, cửa nhà kính đóng (nút N trong tường). Xe cứu hỏa ủi cây khỏi ô sạc, lùi, quay phải phun trúng nút: cửa mở.
    //     Drone đáp sạc, bay qua cửa vào nhà kính gieo luống theo danh sách màu. Bẫy: xuồng (chạy trong mương, không lên bờ ủi cây, không phun).
    man9('cuu-nong-trai', 3, 'luyen', {
      ten: 'Cửa nhà kính',
      deBai: 'Cây đổ đè ô sạc, cửa nhà kính đóng. Chọn hai bạn: ai ủi cây, ai mở cửa, ai gieo luống trong nhà kính?',
      veMaMau: 'Drone tới cửa: cửa còn đóng.',
      san: ['############', '#....#.....#', '#....C.....#', '#..P.#.....#', '#....N.....#', '#~~~~~~~~~~#', '############'],
      them: { thungThem: [{ x: 3, y: 3 }] },
      hinh: luong(12, 7, [{ y: 2, x0: 6, mau: 'ryby' }]),
      doi: [khe({ x: 1, y: 3, huong: 1 }, { pin: 13, batDauNuoc: { x: 1, y: 5, huong: 1 } }), khe({ x: 3, y: 4, huong: 0 }, { batDauNuoc: { x: 3, y: 5, huong: 1 } })],
      chonDoi: {
        menu: ['DR', 'CU', 'XU'],
        cachMau: [{ chon: ['DR', 'CU'], ghiChu: 'đôi tốt', loiGiai: doiBai([DR_3, CU_3]) }]
      },
      maMau: doiBai([DR_3, ['move()', 'back()']]),
      loiSai: [
        { moTa: 'Xe cứu hỏa không mở cửa: drone đâm cửa đóng', baiLam: doiBai([DR_3, ['move()', 'back()']]), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Drone chờ trên ô sạc mà không đáp: hết pin trong nhà kính', baiLam: doiBai([DR_3.map(function (d) { return d === 'land()' || d === 'take_off()' ? 'wait()' : d; }), CU_3]), phaiCoMa: ['het-pin'] }
      ],
      sao: { o: 28, nhip: 17 },
      goiY: ['Tia nước trúng nút N: cửa nhà kính mở.', 'Đi qua ô sạc thì đáp sạc: land(), rồi take_off().'],
      cauDo: { doi: ['DR', 'CU'], lap: null, coChe: ['cay-do', 'gieo', 'sac', 'pin', 'list', 'cua', 'phun'], cuu: 'hang', meo: 'don-loi' }
    }),
    // 4 · làm cầu (rắc cát), ôn list: mương tràn thành dải bùn trơn ngay dưới ô sạc; cây đổ đè ô sạc. Xích chạy vào bùn trượt một mạch, không dừng được dưới ô sạc để ủi cây.
    //     Drone bay xuống ô bùn dưới ô sạc rắc cát (dot()): ô đó thành sàn, xích trượt tới đó thì dừng, quay lên ủi cây khỏi ô sạc, lùi về ô cát.
    //     Drone chờ trên ô sạc, đáp sạc, bay qua mương xuống luống dưới gieo theo danh sách màu a.
    man9('cuu-nong-trai', 4, 'luyen', {
      ten: 'Mương tràn thành bùn',
      deBai: 'Mương tràn thành bùn trơn: xích chạy vào là trượt tuột qua ô sạc. Rắc cát cho xích dừng đúng chỗ ủi cây, rồi đáp sạc gieo luống theo danh sách a.',
      veMaMau: 'Xích trượt qua ô sạc.',
      khung: { chinh: 16, moiHam: 8 },
      san: ['###########', '#.........#', '#...P.....#', '#.IIIIII..#', '#.........#', '###########'],
      them: { thungThem: [{ x: 4, y: 2 }] },
      hinh: luong(11, 6, [{ y: 4, x0: 4, mau: 'ggyyg' }]),
      doi: [khe({ x: 1, y: 2, huong: 1 }, { pin: 14 }), khe({ x: 1, y: 3, huong: 1 })],
      chonDoi: {
        menu: ['DR', 'CU'],
        cachMau: [{ chon: ['DR', 'CU'], ghiChu: 'đôi tốt', loiGiai: doiBai([DR_4, CU_4]) }]
      },
      maMau: doiBai([['a = ["green", "green", "yellow", "yellow", "green"]'], ['wait_n(5)', 'move()']]),
      loiSai: [
        { moTa: 'Không rắc cát: xích trượt qua ô sạc, cây còn đè', baiLam: doiBai([DR_4.map(function (d) { return d === 'dot()' ? 'wait()' : d; }).slice(0, 7).concat(DR_4.slice(7)), CU_4]), phaiCoMa: ['dap-bi-chan'] },
        { moTa: 'Xích chạy ngay: trượt qua trước khi có cát', baiLam: doiBai([DR_4, CU_4.slice(1)]), phaiCoMa: ['dap-bi-chan'] }
      ],
      sao: { o: 36, nhip: 23 },
      goiY: ['dot() trên ô bùn: rắc cát, ô thành sàn thường.', 'Xích trượt trên bùn tới ô không còn bùn thì dừng.'],
      cauDo: { doi: ['DR', 'CU'], lap: null, coChe: ['bun', 'rac-cat', 'cay-do', 'gieo', 'sac', 'pin', 'list'], cuu: 'hang', meo: 'lam-cau' }
    }),
    // 5 · cứu người, dọn lối: bão làm đổ nhà kính, bác nông dân kẹt bên trong. Bao hạt rơi chắn cửa nhà kính, khung cây đổ (thùng nặng) chắn lối ra.
    //     Xe cứu hỏa ủi khung đổ lên, lùi hai ô nhường chỗ. Xe chở hàng chờ, đi qua chỗ cây vừa ủi tới trước cửa, gắp bao hạt, lùi rồi rẽ xuống khỏi lối.
    //     Bác tự đi theo lối về trạm cứu. Bẫy: drone (bay qua được nhưng không gắp, không ủi).
    man9('cuu-nong-trai', 5, 'cung-co', {
      ten: 'Bác nông dân trong nhà kính',
      mucTieu: 'cuu-nguoi',
      deBai: 'Nhà kính đổ, bác nông dân kẹt bên trong. Bao hạt chắn cửa, khung cây đổ chắn lối ra. Chọn hai bạn dọn lối, rồi tránh khỏi lối cho bác đi.',
      veMaMau: 'Xe chở hàng vướng cây đổ.',
      san: ['##########', '#...#....#', '#...o....#', '######.#.#', '######...#', '##########'],
      them: { thungThem: [{ x: 6, y: 2 }], tramCuu: [{ x: 8, y: 4 }],
        nguoi: [{ x: 1, y: 2, duong: [{ x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 }, { x: 5, y: 2 }, { x: 6, y: 2 }, { x: 7, y: 2 }, { x: 8, y: 2 }, { x: 8, y: 3 }, { x: 8, y: 4 }] }] },
      doi: [khe({ x: 8, y: 2, huong: 3 }), khe({ x: 6, y: 3, huong: 0 })],
      chonDoi: {
        menu: ['DR', 'CU', 'CH'],
        cachMau: [{ chon: ['CH', 'CU'], ghiChu: 'đôi tốt', loiGiai: doiBai([CH_5, CU_5]) }]
      },
      maMau: doiBai([['forward(3)'], []]),
      loiSai: [
        { moTa: 'Xích không ủi cây: xe chở hàng không tới được cửa', baiLam: doiBai([CH_5, []]), phaiCoMa: ['chua-cuu-nguoi'] },
        { moTa: 'Xe chở hàng gắp xong đứng lại trên lối: bác phải chờ', baiLam: doiBai([CH_5.slice(0, 4), CU_5]), phaiCoMa: ['chua-cuu-nguoi'] }
      ],
      sao: { o: 30, nhip: 16 },
      goiY: ['pick(): gắp vật trước mũi xe.', 'Bác chỉ bước khi ô kế trên lối trống: robot đứng trên lối thì bác chờ.'],
      cauDo: { doi: ['CH', 'CU'], lap: null, coChe: ['nha-kinh', 'bao-hat', 'cay-do', 'nguoi'], cuu: 'nguoi', meo: 'don-loi' }
    }),
    // 6 · tiếp sức, đọc màu (hai sân, luật 13/11): bao hạt giống nằm ở góc kho xa, mỗi sân một màu (đỏ / xanh dương). Drone ít pin: bay tới góc kho đọc màu rồi về gieo thì hết pin.
    //     Xe chở hàng gắp bao, quay đầu chở tới đặt cạnh luống. Drone đậu chờ (đậu không tốn pin), cất cánh, bay lên bao đọc màu hạt c = color("here"), xuống luống gieo màu c.
    //     Điền thẳng màu của sân 1 thì sân 2 gieo sai màu. Bẫy: robot phân loại (nam châm không hút bao hạt gỗ).
    man9('cuu-nong-trai', 6, 'cung-co', {
      ten: 'Bao hạt ở góc kho',
      khung: { chinh: 16, moiHam: 8 },
      deBai: 'Hai sân. Bao hạt ở góc kho, mỗi sân một màu. Drone ít pin, bay tới góc kho thì không đủ pin về gieo. Ai chở bao tới gần luống? Drone đọc màu bao rồi gieo đúng màu đó.',
      veMaMau: 'Drone chưa biết màu hạt.',
      san: [SAN_6, SAN_6],
      them: { vatMau: [MAU_6('r'), MAU_6('b')] },
      hinh: [luong(12, 6, [{ y: 4, x0: 6, mau: 'rrrrr' }]), luong(12, 6, [{ y: 4, x0: 6, mau: 'bbbbb' }])],
      doi: [khe({ x: 2, y: 2, huong: 3 }), khe({ x: 9, y: 2, huong: 0 }, { pin: 16 })],
      chonDoi: {
        menu: ['DR', 'CH', 'PL'],
        cachMau: [{ chon: ['CH', 'DR'], ghiChu: 'đôi tốt', loiGiai: doiBai([CH_6, DR_6]) }]
      },
      maMau: doiBai([CH_6, ['land()', 'wait_n(9)', 'take_off()', 'go_left()']]),
      loiSai: [
        { moTa: 'Điền thẳng màu đỏ của sân 1: sân 2 gieo sai màu', baiLam: doiBai([CH_6, DR_6.map(function (d) { return d === 'ink(c)' ? 'ink("red")' : d; })]), phaiCoMa: ['chua-to-hinh'] },
        { moTa: 'Drone tự bay tới góc kho đọc màu: hết pin', baiLam: doiBai([[], ['for i in range(8):', '    go_left()', 'c = color("here")', 'for i in range(5):', '    go_right()', 'go_down()', 'go_down()', 'ink(c)', 'pen_down()', 'for i in range(4):', '    go_right()']]), phaiCoMa: ['het-pin'] },
        { moTa: 'Drone bay lơ lửng chờ (không đậu): hết pin', baiLam: doiBai([CH_6, DR_6.map(function (d) { return d === 'land()' || d === 'take_off()' ? 'wait()' : d; })]), phaiCoMa: ['het-pin'] }
      ],
      sao: { o: 44, nhip: 24 },
      goiY: ['color("here"): màu bao hạt ngay dưới drone.', 'land() rồi chờ: đậu không tốn pin.'],
      cauDo: { doi: ['CH', 'DR'], lap: null, coChe: ['bao-hat', 'mau', 'gieo', 'pin', 'dau'], cuu: 'hang', meo: 'tiep-suc' }
    }),
    // 7 · cứu máy, dọn lối: drone khách (R3, khoá) hết pin sau bão, đậu chờ rồi đi gieo luống; nó phải đáp sạc ở hai ô sạc trên đường. Cây đổ đè ô sạc thứ nhất,
    //     tảng đá lăn tới đè ô sạc thứ hai. Xe cứu hỏa tiến ủi cây; máy khai thác tiến nạp đá, quay phải ném ra bãi trống. Drone khách đáp sạc hai lần, gieo đủ luống.
    //     Bẫy: cần cẩu (móc không nhấc cây, không nhấc đá). Bảng có cẩu nên mọi khe trên dải ray, hướng lên.
    man9('cuu-nong-trai', 7, 'van-dung', {
      ten: 'Drone khách hết pin',
      khung: { chinh: 20, moiHam: 8 },
      deBai: 'Drone khách hết pin, phải đáp sạc ở hai ô sạc rồi mới gieo xong luống. Cây đổ đè ô sạc thứ nhất, đá đè ô sạc thứ hai. Đọc chương trình của drone khách rồi chọn hai bạn dọn kịp.',
      veMaMau: 'Đọc chương trình của drone khoá: đậu chờ 6 nhịp rồi đi.',
      san: ['###########', '#.........#', '#.........#', '#..P...P..#', '#.........#', '#RRRRRRRRR#', '###########'],
      them: { thungThem: [{ x: 3, y: 3 }], vatThem: [{ x: 7, y: 3 }] },
      hinh: luong(11, 7, [{ y: 3, x0: 4, mau: 'ggg.gg' }]),
      doi: [khe({ x: 3, y: 5, huong: 0 }), khe({ x: 7, y: 5, huong: 0 }),
        may('DR', { x: 1, y: 3, huong: 1 }, { son: 'tim', coDinh: true, pin: 9 })],
      chonDoi: {
        menu: ['CU', 'CC', 'KT'],
        cachMau: [{ chon: ['CU', 'KT'], ghiChu: 'đôi tốt', loiGiai: doiBai([CU_7, KT_7, DR_R3_7]) }]
      },
      maMau: doiBai([[], [], DR_R3_7]),
      loiSai: [
        { moTa: 'Không ủi cây: drone khách không đáp được ô sạc thứ nhất', baiLam: doiBai([[], KT_7, DR_R3_7]), phaiCoMa: ['dap-bi-chan'] },
        { moTa: 'Không dọn đá: drone khách hết pin trước ô sạc thứ hai', baiLam: doiBai([CU_7, [], DR_R3_7]), phaiCoMa: ['dap-bi-chan'] },
        { moTa: 'Máy khai thác nạp khi chưa tới sát đá: nạp hụt, đá còn đè ô sạc', baiLam: doiBai([CU_7, KT_7.slice(1), DR_R3_7]), phaiCoMa: ['dap-bi-chan'] }
      ],
      sao: { o: 46, nhip: 25 },
      goiY: ['Đọc chương trình của drone khoá: nó đáp ô sạc nào, lúc nào?', 'Máy khai thác: load() nạp vật trước mũi, throw() ném xa 2 ô.'],
      cauDo: { doi: ['CU', 'KT'], lap: null, coChe: ['cay-do', 'da', 'sac', 'pin', 'gieo', 'ray', 'r3'], cuu: 'may', meo: 'don-loi' }
    }),
    // 8 · cứu máy, tiếp sức (T4 bè sạc): drone khách (R3, khoá) hết pin. Trạm sạc hỏng, chỉ còn bè sạc trôi giữa mương và một ô sạc trên bờ bị bao hạt đè.
    //     Xuồng tung lưới bắt bè sạc, lùi kéo bè tới ngay dưới drone khách; drone đáp lên bè sạc, sạc đầy, gieo hàng trên. Xe chở hàng gắp bao hạt khỏi ô sạc bờ, lùi khỏi luống;
    //     drone đáp sạc lần hai, gieo hàng dưới. Bẫy: xe hang động (không kéo bè, không gắp bao).
    man9('cuu-nong-trai', 8, 'van-dung', {
      ten: 'Bè sạc giữa mương',
      khung: { chinh: 20, moiHam: 8 },
      deBai: 'Drone khách hết pin. Trạm sạc hỏng, chỉ còn bè sạc giữa mương và một ô sạc bị bao hạt đè. Đọc chương trình của drone khách: nó đáp ở đâu? Chọn hai bạn đưa bè tới, dọn ô sạc.',
      veMaMau: 'Đọc chương trình của drone khoá: đậu chờ 7 nhịp, rồi đáp xuống mương ngay dưới nó.',
      san: ['############', '#..........#', '#~~~~~~~B~~#', '#.........P#', '#..........#', '#..........#', '############'],
      them: { beSac: [{ x: 8, y: 2 }], vatThem: [{ x: 10, y: 3 }] },
      hinh: luong(12, 7, [{ y: 3, x0: 5, mau: 'yyyyy' }, { y: 4, x0: 6, mau: 'yyyyy' }]),
      doi: [khe({ x: 6, y: 1, huong: 2 }, { batDauNuoc: { x: 6, y: 2, huong: 1 } }), khe({ x: 10, y: 4, huong: 0 }, { batDauNuoc: { x: 10, y: 2, huong: 3 } }),
        may('DR', { x: 5, y: 1, huong: 1 }, { son: 'tim', coDinh: true, pin: 13 })],
      chonDoi: {
        menu: ['XU', 'CH', 'HD'],
        cachMau: [{ chon: ['XU', 'CH'], ghiChu: 'đôi tốt', loiGiai: doiBai([XU_8, CH_8, DR_R3_8]) }]
      },
      maMau: doiBai([[], [], DR_R3_8]),
      loiSai: [
        { moTa: 'Xuồng không kéo bè sạc: drone khách đáp xuống nước, không sạc', baiLam: doiBai([[], CH_8, DR_R3_8]), phaiCoMa: ['dap-bi-chan'] },
        { moTa: 'Xuồng lùi hai ô: bè sạc lệch một ô', baiLam: doiBai([['cast_net()', 'wait()', 'back()', 'back()', 'drop_net()', 'wait()'], CH_8, DR_R3_8]), phaiCoMa: ['dap-bi-chan'] },
        { moTa: 'Không dọn bao hạt: drone khách không đáp được ô sạc bờ', baiLam: doiBai([XU_8, [], DR_R3_8]), phaiCoMa: ['dap-bi-chan'] }
      ],
      sao: { o: 42, nhip: 30 },
      goiY: ['Drone đậu trên bè sạc thì sạc như ô sạc P.', 'Xuồng lùi thì bè trong lưới đi theo.'],
      cauDo: { doi: ['XU', 'CH'], lap: null, coChe: ['be-sac', 'nuoc', 'luoi', 'bao-hat', 'sac', 'pin', 'gieo', 'r3'], cuu: 'may', meo: 'tiep-suc' }
    }),
    // 9 · cứu máy, song song, nhắc lại (G1 gắp gỗ, G3 hút sắt clear_iron, G4 grab_clear): drone khách (R3, khoá) đi gieo theo danh sách độ dài luống a = [3, 2],
    //     đầu mỗi đoạn đáp sạc. Bão phủ bao hạt (gỗ) lên ô sạc thứ nhất, cày sắt rơi lên ô sạc thứ hai. Xe chở hàng grab_clear() gắp bao lùi ra;
    //     nhện bước lên cày, clear_iron("D") hút cày mang xuống. Hai việc phải xong trước khi drone khách tới. Bẫy: xe cứu hỏa (xích không ủi được bao, không hút sắt).
    man9('cuu-nong-trai', 9, 'bien-the', {
      ten: 'Bao hạt và cày sắt',
      khung: { chinh: 16, moiHam: 8 },
      hamCuaEmCan: HAM_EM.concat(['grab_clear', 'clear_iron']),
      deBai: 'Drone khách gieo theo danh sách a = [3, 2]: đầu mỗi đoạn đáp sạc. Bao hạt đè ô sạc thứ nhất, cày sắt đè ô sạc thứ hai. Chọn hai bạn: ai gắp gỗ, ai hút sắt? Nhớ grab_clear() và clear_iron(d).',
      veMaMau: 'Đọc chương trình của drone khoá: nó đáp ở hai ô sạc nào?',
      san: ['############', '#..........#', '#..P...P...#', '#..........#', '#..........#', '############'],
      them: { vatThem: [{ x: 3, y: 2 }, { x: 7, y: 2, chat: 'sat' }] },
      hinh: luong(12, 6, [{ y: 2, x0: 4, mau: 'rrr.rr' }]),
      doi: [khe({ x: 3, y: 3, huong: 0 }), khe({ x: 7, y: 3, huong: 0 }),
        may('DR', { x: 1, y: 2, huong: 1 }, { son: 'tim', coDinh: true, pin: 9 })],
      chonDoi: {
        menu: ['CH', 'PL', 'CU'],
        cachMau: [{ chon: ['CH', 'PL'], ghiChu: 'đôi tốt', loiGiai: doiBai([CH_9, PL_9, DR_R3_9]) }]
      },
      maMau: doiBai([[], [], DR_R3_9]),
      loiSai: [
        { moTa: 'Không gắp bao hạt: drone khách không đáp được ô sạc thứ nhất', baiLam: doiBai([[], PL_9, DR_R3_9]), phaiCoMa: ['dap-bi-chan'] },
        { moTa: 'Nhện chưa bước lên cày đã hút: cày còn đè ô sạc', baiLam: doiBai([CH_9, ['clear_iron("D")'], DR_R3_9]), phaiCoMa: ['dap-bi-chan'] }
      ],
      sao: { o: 48, nhip: 22 },
      goiY: ['grab_clear(): gắp vật trước mũi rồi lùi một ô.', 'clear_iron(d): hút sắt dưới bụng nhện rồi bước theo hướng d.'],
      cauDo: { doi: ['CH', 'PL'], lap: null, coChe: ['bao-hat', 'sat', 'sac', 'pin', 'gieo', 'list', 'r3'], cuu: 'may', meo: 'song-song' }
    }),
    // 10 · song ca đoạn 6 "Kìa con bướm vàng" (Bè 1: 4 4 3 3 2 2 1 1 | Bè 2: 6 2 5 1 4 5 3 1), giữ cho gói 10 ghép bài; dùng play_part (cuu-kho-hang.10 tạo).
    //      Drone không gắn loa (chở nhẹ): xe cứu hỏa lắp loa hát bè 1, xe chở hàng lắp loa hát bè 2 (bảng ghi "drone lượn theo nhịp": choi-dieu chỉ chấm hai robot hát).
    //      Hai đá chuông bão cuốn vào luống vỡ khi nghe nốt cuối mỗi bè. Đội cố định (tay loa không có trên bảng chọn).
    man9('cuu-nong-trai', 10, 'trum', {
      ten: 'Song ca nông trại',
      mucTieu: 'choi-dieu',
      deBai: 'Nông trại đã gieo xong! Drone không mang được loa: xe cứu hỏa và xe chở hàng song ca đoạn 6. Mỗi bạn gọi play_part với bè của mình.',
      veMaMau: 'Bè 2 mới có một nốt.',
      hamCuaEmCan: ['play_note', 'play_part'],
      san: ['######', '#....#', '#....#', '######'],
      doi: [may('CU', { x: 1, y: 1, huong: 1 }, { tay: 'loa', boHam: ['spray', 'spray_back'], themHam: ['note', 'beat'], phatNot: true }),
        may('CH', { x: 1, y: 2, huong: 1 }, { son: 'lam', tay: 'loa', boHam: ['arm_down', 'arm_up', 'arm_left', 'arm_right', 'grab', 'release'], themHam: ['note', 'beat'], phatNot: true })],
      them: { dieu: { r1: '4 4 3 3 2 2 1 1', r2: '6 2 5 1 4 5 3 1' }, daChuong: [{ x: 4, y: 1, not: 1, ben: 1 }, { x: 4, y: 2, not: 1, ben: 1 }] },
      maMau: doiBai([['play_part([4, 4, 3, 3, 2, 2, 1, 1])'], ['play_note(6)']]),
      loiGiai: doiBai([['play_part([4, 4, 3, 3, 2, 2, 1, 1])'], ['play_part([6, 2, 5, 1, 4, 5, 3, 1])']]),
      loiSai: [
        { moTa: 'Bè 2 mới phát một nốt', baiLam: doiBai([['play_part([4, 4, 3, 3, 2, 2, 1, 1])'], ['play_note(6)']]), phaiCoMa: ['lo-nhip'] },
        { moTa: 'Bè 2 đảo hai nốt đầu', baiLam: doiBai([['play_part([4, 4, 3, 3, 2, 2, 1, 1])'], ['play_part([2, 6, 5, 1, 4, 5, 3, 1])']]), phaiCoMa: ['sai-not'] }
      ],
      sao: { o: 7, nhip: 10 },
      goiY: ['Bè 2: play_part([6, 2, 5, 1, 4, 5, 3, 1]).'],
      cauDo: { doi: ['CU', 'CH'], lap: null, coChe: ['loa', 'da-chuong', 'nong-trai'], cuu: null, meo: 'song-song' }
    }),

    /* ========================================================================
       CHƯƠNG 2: lap-nong-trai (10 màn)
       ======================================================================== */
    // 11 · show (song song): drone R1 ít pin, chỉ đủ gieo luống trên. Luna lắp sẵn xích + bộ gieo hạt + camera (khoá): hạ bút chạy dọc luống dưới,
    //      vừa ủi cây đổ đi trước vừa gieo hạt. Màn khai xichDay: xích lắp ráp ủi được cây như xe cứu hỏa.
    man9('lap-nong-trai', 1, 'lam-quen', {
      ten: 'Xe vừa ủi vừa gieo',
      chiChay: true,
      deBai: 'Drone ít pin, chỉ gieo được luống trên. Luna lắp cho xe xích bộ gieo hạt: hạ bút chạy dọc luống dưới, vừa ủi cây đổ vừa gieo. Bấm Chạy.',
      veMaMau: 'Bấm Chạy xem xe xích gieo hạt.',
      san: ['##########', '#........#', '#........#', '#........#', '##########'],
      them: { thungThem: [{ x: 4, y: 3 }], xichDay: true },
      hinh: luong(10, 5, [{ y: 1, x0: 2, mau: 'ggggg' }, { y: 3, x0: 2, mau: 'yyyyy' }]),
      doi: [may('DR', { x: 2, y: 1, huong: 1 }, { pin: 10 }), Object.assign({ batDau: { x: 2, y: 3, huong: 1 } }, clone(XICH_GIEO))],
      maMau: doiBai([hang('green', 4), hangXe('yellow', 4)]),
      loiGiai: doiBai([hang('green', 4), hangXe('yellow', 4)]),
      sao: { o: 16, nhip: 7 },
      goiY: ['pen_down(): xe chạy tới đâu gieo hạt tới đó.', 'Xích tiến vào ô cây đổ thì đẩy cây đi một ô.'],
      cauDo: { doi: null, lap: 'xich+son+camera', coChe: ['cay-do', 'gieo', 'pin'], cuu: 'hang', meo: 'song-song' }
    }),
    // 12 · song song, ép đổi thân: drone R1 ít pin chỉ gieo được luống trên; luống dưới dài, có cây đổ nằm giữa. R2 tự lắp thân có bộ gieo hạt gieo luống dưới.
    //      Cách một drone + gieo hạt: bay qua cây (nhanh). Cách hai xích + gieo hạt: hạ bút chạy thẳng, ủi cây đi trước (rẻ hơn). Hai bánh không qua được cây.
    man9('lap-nong-trai', 2, 'lam-quen', {
      ten: 'Luống dưới có cây đổ',
      deBai: 'Drone R1 chỉ đủ pin gieo luống trên. Lắp robot gieo luống dưới: cây đổ nằm giữa luống. Thân nào qua được cây?',
      veMaMau: 'R2 chưa có chương trình.',
      san: ['##########', '#........#', '#........#', '#........#', '##########'],
      them: { thungThem: [{ x: 3, y: 3 }], xichDay: true },
      hinh: luong(10, 5, [{ y: 1, x0: 1, mau: 'rrrrr' }, { y: 3, x0: 1, mau: 'bbbbbbb' }]),
      doi: [may('DR', { x: 1, y: 1, huong: 1 }, { pin: 11 }), khe({ x: 1, y: 3, huong: 1 }, { son: 'lam' })],
      lapRap: lapR2(['drone', 'xich', 'hai-banh'], ['son'], [], 8, [
        cach('drone', 'son', null, [DR_12, hang('blue', 6)]),
        cach('xich', 'son', null, [DR_12, hangXe('blue', 6)])
      ]),
      maMau: doiBai([DR_12, []]),
      loiSai: [
        { moTa: 'R2 đứng yên: luống dưới chưa gieo', baiLam: doiBai([DR_12, []]), phaiCoMa: ['chua-to-hinh'] },
        { moTa: 'Drone R1 gieo luôn luống dưới: hết pin', baiLam: doiBai([hang('red', 4).concat(['go_down()', 'go_down()', 'ink("blue")', 'pen_down()', 'for i in range(6):', '    go_left()']), []]), phaiCoMa: ['het-pin'] }
      ],
      sao: { o: 20, nhip: 9 },
      goiY: ['Drone bay qua cây đổ. Xích ủi cây đi trước.', 'Hai bánh gặp cây đổ thì đứng im.'],
      cauDo: { doi: null, lap: 'drone+son', coChe: ['cay-do', 'gieo', 'pin'], cuu: 'hang', meo: 'song-song' }
    }),
    // 13 · song song, lai L6 nhện + bộ gieo hạt (ra mắt), luống bị mương sụt (hố 1 ô) và nhà kính đổ (gầm thấp) cắt ngang. Drone R1 ít pin gieo luống trên rồi đậu.
    //      Cách một nhện + gieo hạt (L6): gieo ô dưới bụng, nhảy qua hố, co chân chui gầm (rẻ). Cách hai drone + gieo hạt: bay qua hết, gieo theo danh sách a (1 gieo, 0 bỏ qua) (nhanh, đắt).
    //      Hai bánh rơi hố. R1 gieo luống trên cùng lúc (song song).
    man9('lap-nong-trai', 3, 'luyen', {
      ten: 'Nhện gieo hạt',
      khung: { chinh: 20, moiHam: 8 },
      deBai: 'Luống dưới bị mương sụt và nhà kính đổ cắt ngang: xe có bánh rơi hố, không chui gầm. Lắp robot gieo luống dưới. Nhện gắn bộ gieo hạt thì gieo ô dưới bụng.',
      veMaMau: 'R2 chưa có chương trình.',
      san: ['############', '#..........#', '#...u.nn...#', '#..........#', '############'],
      hinh: luong(12, 5, [{ y: 1, x0: 1, mau: 'rrrrr' }, { y: 2, x0: 1, mau: 'ggg.g..gg' }]),
      doi: [may('DR', { x: 1, y: 1, huong: 1 }, { pin: 11 }), khe({ x: 1, y: 2, huong: 1 }, { son: 'lam' })],
      lapRap: lapR2(['nhen', 'drone', 'hai-banh'], ['son'], [], 8, [
        cach('nhen', 'son', null, [DR_12, NHEN_13]),
        cach('drone', 'son', null, [DR_12, DRONE_13])
      ], { moLai: ['L6'] }),
      maMau: doiBai([DR_12, []]),
      loiSai: [
        { moTa: 'Nhện bước thẳng vào mương: rơi hố', baiLam: doiBai([DR_12, ['ink("green")', 'for i in range(4):', '    dot()', '    go_right()']]), phaiCoMa: ['roi-ho'] },
        { moTa: 'Nhện quên co chân trước khi chui: đâm nhà kính đổ', baiLam: doiBai([DR_12, NHEN_13.slice(0, 10).concat(['for i in range(3):', '    go_right()'])]), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 34, nhip: 23 },
      goiY: ['Nhện gieo ô dưới bụng: dot() rồi mới bước.', 'Nhảy: crouch(), wait(), stand() cùng go_right(). Chui gầm: co chân rồi đi.'],
      cauDo: { doi: null, lap: 'nhen+son', coChe: ['gieo', 'ho', 'gam-thap', 'nha-kinh', 'pin'], cuu: 'hang', meo: 'song-song' }
    }),
  ];
})();
