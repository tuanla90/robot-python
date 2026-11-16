/* ============================================================================
   man-cuu-mo-da.js - Mùa 9 CLB Sáng Tạo: Gói 7 "Mỏ đá sau bão" (dựng lại 16/11, M9M7, theo khuôn G5 / G6)
   20 màn: cuu-mo-da (chọn đội trong menu cỗ máy) + lap-mo-da (R1 máy khai thác đặt sẵn, R2 tự lắp; lai L1 L9 L11 L12).
   Ôn Python: lưới grid[r][c] (radar() trả lưới 3×3 quanh robot: hàng 0 trên, cột 0 trái; toạ độ (r, c) của ô).
   Bão: dốc thành bùn trơn (I: xe trượt, bánh gai bám), đá lở bít hố (u: máy khai thác ném đá tròn lấp), đá rỗng chắn hầm (đá chuông: phát đúng nốt thì nứt vỡ),
   khối đá vuông (thùng nặng H: xích ủi), thợ mỏ kẹt (người P).
   Ném đá: luật NÉM ĐÀ mùa 9 (aim chỉ 1, 2; aim_lob(3) tự chạy đà rồi lùi về chỗ cũ).
   Màn 10 mỗi chương: song ca đoạn 7 (bè 1: 1 1 5 5 6 6 5 5 | bè 2: 3 3 1 3 4 4 3 3), gọi play_part.
   Câu đố: hoc/MUA-9-200-CAU-DO.md mục G7 (ghi chú "Đã dựng 16/11 (M9M7)": các chỗ lệch so với bảng).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  /* ---- M9M7: khung màn mùa 9 (chép từ man-cuu-nong-trai.js) ------------------------------------------ */
  var CoMay = laNode ? require('./co-may.js') : window.CoMay;
  var HAM_EM = ['move', 'back', 'forward', 'wait_n', 'tr_left', 'tr_right', 'turn_left', 'turn_right', 'pick', 'drop', 'go', 'walk', 'jump', 'crawl', 'pull_s', 'lob', 'aim_lob', 'slide_r'];
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

  /** cuu-mo-da.1: máy khai thác hất đá tròn trước mũi xuống hố thứ nhất giữa dốc bùn (tầm 2), trượt sang hai ô hất viên thứ hai xuống hố thứ hai, chờ xe hang động đi qua rồi lên qua hố vừa lấp tới cờ.
   *  Xe hang động phát nốt 5 làm nứt vỡ khối đá rỗng chắn trước cờ, chờ, bám bùn đi ngang dốc qua hai hố đã lấp tới cờ. */
  var KT_1 = ['lob()', 'slide_r(2)', 'lob()', 'wait()', 'forward(3)'];
  var HD_1 = ['note(5)', 'wait()', 'wait_n(2)', 'forward(6)'];

  /** cuu-mo-da.2 (ba sân): dốc bùn hàng 2, hố ở cột 3 / 5 / 4 tuỳ sân; cuối dốc nút đè M (giữ ba cửa hầm C hàng 6) rồi cờ của xe hang động; ba cờ của máy khai thác ở hàng 7. */
  function san2(xHo) { var h = '#.'; for (var x = 2; x <= 5; x++) h += x === xHo ? 'u' : 'I'; return ['##########', '#........#', h + 'IMF#', '#........#', '#...o....#', '#........#', '#..CCC...#', '#..FFF...#', '##########']; }
  var NOI_2 = [{ nut: { x: 7, y: 2 }, cua: [{ x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 }] }];
  var VD_2 = ['..........', '..........', '..........', '..........', '....r.....', '..........', '..........', '..........', '..........'];
  /** Máy khai thác cuu-mo-da.2: xúc đá, tiến sát dốc, đọc radar g, hố ở cột nào (g[0][0] trái, g[0][1] trước, g[0][2] phải) thì trượt sang đó, hất 1 ô; lùi, chờ cửa hầm mở, lùi qua cửa về cờ. */
  var KT_2 = ['load()', 'wait()', 'forward(2)', 'g = radar()', 'if g[0][0] == "u":', '    slide_left()', '    wait()', 'if g[0][2] == "u":', '    slide_right()', '    wait()',
    'aim(1)', 'throw()', 'wait()', 'back()', 'back()', 'wait_n(4)', 'back()', 'back()'];
  /** Xe hang động cuu-mo-da.2: chờ hố được lấp, bám bùn đi ngang dốc tới nút đè (cửa hầm mở), giữ nút chờ máy khai thác qua cửa, rồi tới cờ. */
  var HD_2 = ['wait_n(3)', 'forward(6)', 'wait_n(2)', 'forward(1)'];

  /** cuu-mo-da.3: máy khai thác hất đá tròn chạy đà (aim_lob(3)) lấp hố ở cột 4, chờ cửa hầm mở, đi qua hố đã lấp và cửa, xúc quặng, hất 2 ô lên xe goòng D.
   *  Xe hang động bám bùn, dừng giữa dốc ở cột 4, quay lên, qua hố đã lấp, đứng giữ nút đè (cửa hầm mở). */
  var KT_3 = ['aim_lob(3)', 'wait_n(3)', 'forward(6)', 'load()', 'wait()', 'aim(2)', 'throw()', 'wait()'];
  var HD_3 = ['forward(3)', 'turn_left()', 'forward(2)'];

  /** cuu-mo-da.4 (ba sân): hầm hẹp hàng 1, khối đá rỗng chắn cửa hầm ở (3, 1), mỗi sân một nốt (3 / 6 / 8); quặng và xe goòng sau cửa; dốc bùn hàng 3 sát hầm. */
  var SAN_4 = ['#########', '#....oD.#', '#########', '#.IIIIII#', '#########'];
  var VD_4 = ['.........', '.....q...', '.........', '.........', '.........'];
  /** Xe hang động: tiến một ô lên dốc bùn (đủ gần cửa hầm), nghe nốt của đá rỗng rồi hát lại. Máy khai thác: chờ, qua cửa hầm vừa vỡ, hất quặng lên xe goòng. */
  var HD_4 = ['forward(1)', 'play_note(listen())'];
  var KT_4 = ['wait()', 'forward(3)', 'lob()'];

  /** cuu-mo-da.5: thợ mỏ kẹt cuối hầm (1, 1); đá lở (đá tròn) chắn giữa hầm, khối đá rỗng nốt 5 chắn cửa hầm (5, 1); hố ngách (4, 2) dưới hầm; trạm cứu ngoài cửa (8, 3).
   *  Xe hang động tiến ba ô trên dốc bùn cho đủ gần cửa hầm, nghe nốt, hát lại: đá rỗng vỡ. Máy khai thác chờ, vào hầm qua cửa vừa mở, xúc đá lở, quay xuống hất vào hố ngách, rồi lùi xuống ngách nhường lối. */
  var HD_5 = ['forward(3)', 'play_note(listen())'];
  var KT_5 = ['wait_n(4)', 'forward(3)', 'load()', 'wait()', 'turn_left()', 'aim(1)', 'throw()', 'wait()', 'forward(1)'];

  /** cuu-mo-da.6: khối đá vuông (thùng nặng) ở đầu lối hàng 1, hố sụt ở (4, 1) giữa lối, xe goòng D ở (6, 1); thùng đá (container) ở ngách (4, 2); dải ray hàng 3 (1, 3)–(4, 3).
   *  Cần cẩu: nhấc thùng đá ở ngách, vươn cần thêm một ô, hạ thùng đá xuống hố (hố thành sàn). Xe cứu hỏa: rời ray lên đầu lối, quay phải, ủi khối đá qua hố đã lấp vào xe goòng. */
  var CC_6 = ['pick_up()', 'extend()', 'set_down()'];
  var CU_6 = ['forward(2)', 'tr_right()', 'forward(4)'];

  /** Máy khai thác khách khoá cuu-mo-da.7: kẹt sau hố sụt 2 ô ở hàng 3; đi đường vòng hàng 1: lên hai ô, quay phải, chờ hai nhịp, tiến bảy ô qua cửa hầm (2, 1) và chỗ đá rỗng (6, 1) tới cờ. */
  var KT_R3_7 = ['forward(2)', 'turn_right()', 'wait_n(2)', 'forward(7)'];
  /** Xe hang động: tiến một ô cho đủ gần đá rỗng (tầm 3), nghe nốt rồi hát lại, tiến về cờ. Robot phân loại: lên nút đè (cửa hầm mở), giữ nút tới khi máy khách qua cửa, xuống về cờ. */
  var HD_7 = ['forward(1)', 'play_note(listen())', 'forward(1)'];
  var PL_7 = ['go_up()', 'wait_n(4)', 'go_down()', 'go_left()'];

  /** Máy khai thác khách khoá cuu-mo-da.8: chờ ba nhịp rồi chạy thẳng bảy ô dọc lối hầm hàng 2 về cờ (8, 2). */
  var KT_R3_8 = ['wait_n(3)', 'forward(7)'];
  /** Xe cứu hỏa: ủi khối đá vuông lên ngách trên, lùi hai ô về cờ. Xe chở hàng: gắp hòm dụng cụ, lùi về cờ. */
  var CU_8 = ['forward(1)', 'back()', 'back()'];
  var CH_8 = ['pick()', 'back()'];

  /** Máy khai thác khách khoá cuu-mo-da.9: chờ, tiến vào dốc bùn (ô cát (4, 1) thì dừng), quay xuống, qua chỗ đá rỗng (4, 2), xúc quặng (4, 4), hất 2 ô lên xe goòng (4, 5). */
  var KT_R3_9 = ['wait_n(7)', 'forward(1)', 'turn_right()', 'forward(2)', 'load()', 'wait()', 'throw()', 'wait()'];
  /** Drone: bay lên ba ô, sang phải ba ô tới đầu ngã rẽ trên dốc bùn, rắc cát. Xe hang động: sonic_rail() (G4) nghe nốt đá rỗng, hát lại, lùi khỏi ray. */
  var DR_9 = ['for i in range(3):', '    go_up()', 'for i in range(3):', '    go_right()', 'dot()', 'wait()'];
  var HD_9 = ['sonic_rail()'];

  /** R2 đã lắp sẵn (màn show chương 2): bánh gai + máy ném + radar, như LapRap.apDung lắp ra. */
  var GAI_NEM = {
    loaiRobot: 'gai', robot: { than: 'gai', tay: 'nem', camBien: [{ ma: 'radar', o: 'tren' }], son: 'lam' },
    hamGoc: ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'retract_spikes', 'extend_spikes', 'aim', 'throw', 'load', 'radar', 'shape']
  };
  /** lap-mo-da.1: xe gai ném tiến hai ô trên dốc bùn (bám, không trượt), quay lên, hất đá tròn trước mũi xa 2 ô xuống hố, lùi về cờ. Máy khai thác chờ rồi chạy qua hố đã lấp tới cờ. */
  var GAI_11 = ['forward(2)', 'turn_left()', 'aim(2)', 'lob()', 'back()'];
  var KT_11 = ['wait_n(5)', 'forward(6)'];

  /** Hàm em radar_front_lob(n) (tạo ở lap-mo-da.2; gói 8, 9 gọi lại: man-cuu-hang-dong, man-cuu-clb): quét radar, ô ngay trên (g[0][1]) có vật thì hất xa n ô, rồi trượt phải 1 cột. */
  var H_RFL = { ten: 'radar_front_lob', thamSo: ['n'], than: ['g = radar()', 'if g[0][1] == "V":', '    aim_lob(n)', 'slide_r(1)'] };
  /** lap-mo-da.2: máy khai thác R1 lấp hố cột 6 bằng radar_front_lob(2), trượt về cờ. R2 bánh gai đi vào dốc bùn, dừng ở cột 4, quay lên hất đá lấp hố giếng, rồi lên qua hai hố đã lấp tới cờ. */
  var KT_12 = ['radar_front_lob(2)'];
  var GAI_12 = ['forward(3)', 'turn_left()', 'aim_lob(2)', 'forward(3)', 'turn_right()', 'forward(3)'];

  /** lap-mo-da.3: sân nhện ba sân, mũi khoan sắt nằm ở một ngách phía trên hành lang (cột 3, 5, 4 tuỳ sân); máy khai thác hất quặng vào máng ở hầm dưới. */
  function san13(xMui) {
    var h1 = '##.....###'.split(''); h1[xMui] = 'o';
    return ['##########', h1.join(''), '#......nD#', '##########', '#.oD.....#', '##########'];
  }
  function vc13(xMui) { var h1 = '..........'.split(''); h1[xMui] = 's'; return ['..........', h1.join(''), '..........', '..........', '..........', '..........']; }
  var VD_13 = ['..........', '..........', '..........', '..........', '..q.......', '..........'];
  var KT_13 = ['lob()'];
  /** Nhện đọc radar (L12): ô trên đầu (g[0][1]) có vật là mũi khoan, lên hút, xuống; hết ngách thì co chân chui gầm đá lở tới máng, thả. */
  var NHEN_13 = ['for i in range(5):', '    go_right()', '    g = radar()', '    if g[0][1] == "V":', '        go_up()', '        pull_s()', '        go_down()', 'crouch()', 'go_right()', 'go_right()', 'magnet_off()', 'wait()'];
  /** Cách hai: nhện + cảm biến từ (nhện quay mặt lên, front_metal() đọc ngách phía trên). */
  var NHEN_TU_13 = ['for i in range(5):', '    go_right()', '    if front_metal():', '        go_up()', '        pull_s()', '        go_down()', 'crouch()', 'go_right()', 'go_right()', 'magnet_off()', 'wait()'];

  /** lap-mo-da.4: máy khai thác chờ lối hầm trống, tiến ba ô, hất quặng vào máng cuối hầm. */
  var KT_14 = ['wait_n(4)', 'forward(3)', 'lob()'];
  var KT_14B = ['wait_n(7)', 'forward(3)', 'lob()'];
  /** Cẩu + nam châm (L1): đầu cần chĩa xuống lối hầm, hút mũi khoan, quay cần nửa vòng, thả vào hốc chứa phía trên. */
  var CAU_14 = ['magnet_n()', 'swing_left()', 'swing_left()', 'magnet_off()'];
  /** Drone + nam châm: hạ xuống trên mũi khoan, hút, bay lên hốc chứa, thả. */
  var DRONE_14 = ['go_down()', 'magnet_n()', 'wait()', 'go_up()', 'go_up()', 'magnet_off()', 'wait()'];

  function man9(chuong, so, hang, cfg) {
    var r1 = cfg.doi[0];
    var m = {
      chuong: chuong, so: so, ten: cfg.ten, hang: hang, vo: 'mo-da', daLapHo: true,
      cauTruc: ['for', 'if', 'while', 'list', 'def', 'return', 'tuple'], vaHoac: true, moXuong: true, camHamCuaEm: false,
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

  var MOI = [
    /* ========================================================================
       CHƯƠNG 1: cuu-mo-da (10 màn)
       ======================================================================== */
    // 1 · show (làm cầu): bão biến dốc mỏ thành bùn trơn, đá lở bít thành hố giữa dốc. Máy khai thác đứng dưới chân dốc hất viên đá tròn trước mũi bay 2 ô xuống hố: hố lấp phẳng.
    //     Xe hang động bung gai bám bùn đi ngang dốc, qua chỗ hố vừa lấp tới cờ. Máy khai thác lên qua hố tới cờ của nó. Đội cố định KT + HD (chạy sẵn, khoá).
    man9('cuu-mo-da', 1, 'lam-quen', {
      ten: 'Hố giữa dốc bùn',
      chiChay: true,
      deBai: 'Bão biến dốc mỏ thành bùn trơn, đá lở bít thành hố. Máy khai thác hất đá tròn lấp hai hố. Xe hang động hát nốt 5 phá đá rỗng, bám bùn đi qua. Bấm Chạy.',
      veMaMau: 'Bấm Chạy xem mỗi bạn làm gì.',
      san: ['#########', '#....F..#', '#.IuIuIF#', '#..o.o..#', '#.......#', '#########'],
      them: { vatDang: ['.........', '.........', '.........', '...r.r...', '.........', '.........'], daChuong: [{ x: 6, y: 2, not: 5, ben: 1 }] },
      doi: [may('KT', { x: 3, y: 4, huong: 0 }, { co: [{ x: 5, y: 1 }] }), may('HD', { x: 1, y: 2, huong: 1 }, { son: 'lam', co: [{ x: 7, y: 2 }] })],
      maMau: doiBai([KT_1, HD_1]),
      loiGiai: doiBai([KT_1, HD_1]),
      sao: { o: 27, nhip: 12 },
      goiY: ['lob(): xúc đá trước mũi rồi hất xa 2 ô. Đá tròn rơi xuống hố thì lấp phẳng hố.', 'Bánh gai bung gai thì bám bùn trơn, không trượt.', 'note(5): phát nốt 5. Đá rỗng nghe đúng nốt của nó thì nứt vỡ.'],
      cauDo: { doi: ['KT', 'HD'], lap: null, coChe: ['bun', 'ho', 'da-tron', 'nem', 'da-rong'], cuu: 'hang', meo: 'lam-cau' }
    }),
    // 2 · đọc rồi chọn, ôn lưới grid[r][c] (ba sân, luật 13/11): hố giữa dốc bùn mỗi sân một cột. Máy khai thác xúc đá, tiến sát dốc, đọc radar() thành lưới g:
    //     hàng 0 là hàng trước mặt, cột 0 trái, cột 2 phải. Hố ở g[0][0] thì trượt trái, g[0][2] thì trượt phải, rồi hất 1 ô lấp hố, lùi về cờ.
    //     Xe hang động chờ, bám bùn đi qua hố đã lấp tới nút đè, giữ nút cho cửa hầm mở tới khi máy khai thác lùi qua cửa về cờ. Điền thẳng cột của sân 1 thì sân 2, 3 đá rơi lệch, xe rơi hố. Bảng 2 cỗ máy (đúng đôi tốt).
    man9('cuu-mo-da', 2, 'lam-quen', {
      ten: 'Hố ở cột nào',
      khung: { chinh: 20, moiHam: 8 },
      deBai: 'Ba sân, mỗi sân hố ở một cột. Máy khai thác đọc radar(): lưới 3×3, g[0][0] ô trước bên trái, g[0][1] ô trước, g[0][2] ô trước bên phải. Hố ở đâu thì trượt tới đó hất đá lấp. Xe hang động qua dốc giữ nút cho cửa hầm mở.',
      veMaMau: 'Máy khai thác chưa biết hố ở cột nào.',
      san: [san2(3), san2(5), san2(4)],
      noi: [NOI_2, NOI_2, NOI_2],
      them: { vatDang: [VD_2, VD_2, VD_2] },
      doi: [khe({ x: 4, y: 5, huong: 0 }, { co: [{ x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }] }), khe({ x: 1, y: 2, huong: 1 }, { co: [{ x: 8, y: 2 }] })],
      chonDoi: {
        menu: ['KT', 'HD'],
        cachMau: [{ chon: ['KT', 'HD'], ghiChu: 'đôi tốt', loiGiai: doiBai([KT_2, HD_2]) }]
      },
      maMau: doiBai([['load()', 'wait()', 'forward(2)', 'g = radar()'], HD_2]),
      loiSai: [
        { moTa: 'Điền thẳng cột của sân 1 (trượt trái): sân 2, 3 đá rơi lệch, xe hang động rơi hố', baiLam: doiBai([['load()', 'wait()', 'forward(2)', 'slide_left()', 'wait()', 'aim(1)', 'throw()', 'wait()', 'back()', 'back()', 'wait_n(4)', 'back()', 'back()'], HD_2]), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đọc nhầm hàng: g[2][0] là hàng sau lưng', baiLam: doiBai([KT_2.map(function (d) { return d.replace('g[0][0]', 'g[2][0]').replace('g[0][2]', 'g[2][2]'); }), HD_2]), phaiCoMa: ['roi-ho'] },
        { moTa: 'Xe hang động không giữ nút: chạy thẳng tới cờ, cửa hầm đóng lại', baiLam: doiBai([KT_2, ['wait_n(3)', 'forward(7)']]), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 38, nhip: 15 },
      goiY: ['g = radar(): g[r][c] là ô hàng r cột c quanh máy. Hàng 0 trước mặt (khi quay lên).', '"u" là hố.', 'aim(1) rồi throw(): đá rơi ô ngay trước mũi.'],
      cauDo: { doi: ['KT', 'HD'], lap: null, coChe: ['bun', 'ho', 'da-tron', 'nem', 'nut-de', 'cua', 'radar'], cuu: 'hang', meo: 'doc-roi-chon' }
    }),
    // 3 · làm cầu (bẫy xích trượt bùn): dốc bùn hàng 4; hố ở cột 4 chắn lối lên nút đè M giữ cửa hầm C, sau cửa là quặng và xe goòng D.
    //     Máy khai thác chạy đà hất đá tròn xa 3 ô lấp hố (aim_lob(3)), chờ, đi qua hố đã lấp và cửa, xúc quặng hất lên xe goòng.
    //     Xe hang động bám bùn dừng giữa dốc ở cột 4, quay lên qua hố đã lấp, đứng giữ nút. Bẫy: xe cứu hỏa (xích trượt tuột trên bùn, không dừng giữa dốc được).
    man9('cuu-mo-da', 3, 'luyen', {
      ten: 'Dừng giữa dốc bùn',
      mucTieu: 'dua-vat',
      deBai: 'Quặng sau cửa hầm phải lên xe goòng D. Nút giữ cửa ở trên hố, lối lên nút đi từ giữa dốc bùn. Chọn hai bạn: ai lấp hố, ai dừng được giữa dốc bùn để lên giữ nút?',
      veMaMau: 'Cửa hầm còn đóng.',
      san: ['###########', '#.........#', '#...M.....#', '#.o.u.C.oD#', '#.IIIIIIII#', '###########'],
      noi: [{ nut: { x: 4, y: 2 }, cua: [{ x: 6, y: 3 }] }],
      them: { vatDang: ['...........', '...........', '...........', '..r.....q..', '...........', '...........'] },
      doi: [khe({ x: 1, y: 3, huong: 1 }), khe({ x: 1, y: 4, huong: 1 })],
      chonDoi: {
        menu: ['KT', 'HD', 'CU'],
        cachMau: [{ chon: ['KT', 'HD'], ghiChu: 'đôi tốt', loiGiai: doiBai([KT_3, HD_3]) }]
      },
      maMau: doiBai([['aim_lob(3)'], ['forward(3)']]),
      loiSai: [
        { moTa: 'Hất đá 2 ô (không chạy đà): đá rơi trước hố, xe hang động rơi hố', baiLam: doiBai([['lob()', 'wait_n(4)', 'forward(6)', 'load()', 'wait()', 'aim(2)', 'throw()', 'wait()'], HD_3]), phaiCoMa: ['roi-ho'] },
        { moTa: 'Máy khai thác đi ngay: cửa hầm còn đóng', baiLam: doiBai([['aim_lob(3)', 'forward(6)', 'load()', 'wait()', 'aim(2)', 'throw()', 'wait()'], HD_3]), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Xe hang động đi tiếp tới nút rồi rời nút: cửa đóng lại', baiLam: doiBai([KT_3, HD_3.concat(['forward(1)'])]), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 44, nhip: 17 },
      goiY: ['aim_lob(3): chạy đà một ô rồi hất, đá bay xa 3 ô tính từ chỗ đứng cũ.', 'Bánh gai bám bùn: dừng được giữa dốc rồi quay.', 'Nút đè chỉ giữ cửa mở khi có xe đứng trên nút.'],
      cauDo: { doi: ['KT', 'HD'], lap: null, coChe: ['bun', 'ho', 'da-tron', 'nem-da', 'nut-de', 'cua', 'xe-goong'], cuu: 'hang', meo: 'lam-cau' }
    }),
    // 4 · dọn lối, đọc nốt (ba sân, luật 13/11): khối đá rỗng chắn cửa hầm, mỗi sân một nốt. Xe hang động tiến một ô lên dốc bùn cho đủ gần (tầm 3 ô), nghe nốt bằng listen(),
    //     hát lại play_note(...): đá rỗng nứt vỡ. Máy khai thác chờ, đi qua cửa hầm vừa mở, hất quặng lên xe goòng. Bảng 2 cỗ máy (đúng đôi tốt).
    //     Điền thẳng nốt của sân 1 thì sân 2, 3 đá không vỡ. Xe hang động đứng ở chỗ xuất phát thì quá xa (4 ô), hát không tới.
    man9('cuu-mo-da', 4, 'luyen', {
      ten: 'Đá rỗng chắn cửa hầm',
      mucTieu: 'dua-vat',
      hamCuaEmCan: HAM_EM.concat(['play_note']),
      deBai: 'Ba sân. Khối đá rỗng chắn cửa hầm, mỗi sân một nốt. Xe hang động nghe nốt bằng listen() rồi hát lại cho đá vỡ (đứng cách đá tối đa 3 ô). Máy khai thác qua cửa, hất quặng lên xe goòng.',
      veMaMau: 'Cửa hầm còn bị đá rỗng chắn.',
      san: [SAN_4, SAN_4, SAN_4],
      them: { vatDang: [VD_4, VD_4, VD_4], daChuong: [[{ x: 3, y: 1, not: 3, ben: 1 }], [{ x: 3, y: 1, not: 6, ben: 1 }], [{ x: 3, y: 1, not: 8, ben: 1 }]] },
      doi: [khe({ x: 1, y: 1, huong: 1 }), khe({ x: 1, y: 3, huong: 1 })],
      chonDoi: {
        menu: ['KT', 'HD'],
        cachMau: [{ chon: ['KT', 'HD'], ghiChu: 'đôi tốt', loiGiai: doiBai([KT_4, HD_4]) }]
      },
      maMau: doiBai([KT_4, ['forward(1)']]),
      loiSai: [
        { moTa: 'Điền thẳng nốt của sân 1 (play_note(3)): sân 2, 3 đá không vỡ', baiLam: doiBai([KT_4, ['forward(1)', 'play_note(3)']]), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Xe hang động hát ngay ở chỗ xuất phát: xa đá 4 ô, đá không vỡ', baiLam: doiBai([KT_4, ['play_note(listen())']]), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Máy khai thác không chờ: tới cửa hầm khi đá chưa vỡ', baiLam: doiBai([['forward(3)', 'lob()'], HD_4]), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 19, nhip: 7 },
      goiY: ['listen(): nốt của khối đá rỗng gần nhất.', 'play_note(n): hát nốt n. Đá rỗng nghe đúng nốt của nó thì nứt vỡ.', 'Loa chỉ tới đá cách xe tối đa 3 ô.'],
      cauDo: { doi: ['KT', 'HD'], lap: null, coChe: ['da-rong', 'not', 'bun', 'nem', 'xe-goong'], cuu: 'hang', meo: 'don-loi' }
    }),
    // 5 · cứu người, dọn lối: bão làm sập hầm, thợ mỏ kẹt bên trong. Khối đá rỗng chắn cửa hầm, đá lở chắn giữa hầm. Xe hang động tiến ba ô trên dốc bùn (đủ gần, tầm 3 ô),
    //     nghe nốt rồi hát lại: đá rỗng nứt vỡ. Máy khai thác vào hầm qua cửa vừa mở, xúc đá lở, quay xuống hất vào hố ngách (lấp luôn hố), lùi xuống ngách nhường lối.
    //     Thợ mỏ tự đi ra trạm cứu. Bẫy: robot phân loại (nhện không hát, nam châm không hút đá).
    man9('cuu-mo-da', 5, 'cung-co', {
      ten: 'Thợ mỏ trong hầm sập',
      mucTieu: 'cuu-nguoi',
      khung: { chinh: 16, moiHam: 8 },
      hamCuaEmCan: HAM_EM.concat(['play_note']),
      deBai: 'Hầm sập, thợ mỏ kẹt bên trong. Đá rỗng chắn cửa hầm, đá lở chắn giữa hầm. Chọn hai bạn mở lối, rồi tránh khỏi lối cho thợ mỏ ra trạm cứu.',
      veMaMau: 'Cửa hầm còn đá rỗng chắn.',
      san: ['##########', '#..o.....#', '####u###.#', '#.IIIIII.#', '##########'],
      them: { vatDang: ['..........', '...r......', '..........', '..........', '..........'], daChuong: [{ x: 5, y: 1, not: 5, ben: 1 }],
        tramCuu: [{ x: 8, y: 3 }], nguoi: [{ x: 1, y: 1, duong: [{ x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 }, { x: 5, y: 1 }, { x: 6, y: 1 }, { x: 7, y: 1 }, { x: 8, y: 1 }, { x: 8, y: 2 }, { x: 8, y: 3 }] }] },
      doi: [khe({ x: 7, y: 1, huong: 3 }), khe({ x: 1, y: 3, huong: 1 })],
      chonDoi: {
        menu: ['KT', 'HD', 'PL'],
        cachMau: [{ chon: ['KT', 'HD'], ghiChu: 'đôi tốt', loiGiai: doiBai([KT_5, HD_5]) }]
      },
      maMau: doiBai([['wait_n(4)', 'forward(3)'], ['forward(3)']]),
      loiSai: [
        { moTa: 'Máy khai thác xúc đá xong đứng lại giữa hầm: thợ mỏ phải chờ', baiLam: doiBai([KT_5.slice(0, 8), HD_5]), phaiCoMa: ['chua-cuu-nguoi'] },
        { moTa: 'Xe hang động hát ngay chỗ xuất phát: xa cửa hầm, đá không vỡ', baiLam: doiBai([KT_5, ['play_note(listen())']]), phaiCoMa: ['chua-cuu-nguoi'] },
        { moTa: 'Hất đá lở 2 ô (quên aim(1)): đá bay qua hố, rơi trúng xe hang động, vỡ', baiLam: doiBai([KT_5.filter(function (d) { return d !== 'aim(1)'; }), HD_5]), phaiCoMa: ['nem-vo'] }
      ],
      sao: { o: 26, nhip: 20 },
      goiY: ['Thợ mỏ chỉ bước khi ô kế trên lối trống: robot đứng trên lối thì thợ mỏ chờ.', 'listen() rồi play_note(...): hát lại nốt của đá rỗng.', 'Đá tròn rơi xuống hố thì lấp hố: ngách thành chỗ đứng.'],
      cauDo: { doi: ['KT', 'HD'], lap: null, coChe: ['da-rong', 'not', 'bun', 'nem', 'ho', 'nguoi'], cuu: 'nguoi', meo: 'don-loi' }
    }),
    // 6 · làm cầu (T2 thùng đá lấp hố): khối đá vuông (thùng nặng) phải vào xe goòng, hố sụt giữa lối. Cần cẩu nhấc thùng đá ở ngách, vươn cần, hạ xuống hố: hố thành sàn.
    //     Xe cứu hỏa ủi khối đá qua chỗ hố vừa lấp vào xe goòng. Bẫy: máy khai thác (không ủi thùng nặng, không nhấc thùng đá; ném đá vuông xuống hố thì đá vỡ, không lấp).
    //     Bảng có cẩu nên mọi khe trên dải ray.
    man9('cuu-mo-da', 6, 'cung-co', {
      ten: 'Thùng đá lấp hố',
      mucTieu: 'day-thung',
      deBai: 'Khối đá vuông phải vào xe goòng D, nhưng hố sụt chắn giữa lối. Chọn hai bạn: ai lấp hố bằng thùng đá, ai ủi khối đá nặng?',
      veMaMau: 'Hố còn chắn lối.',
      san: ['########', '#.H.u.D#', '#.##.###', '#RRRR###', '########'],
      them: { contChan: true, contLapHo: true, chong: [{ x: 4, y: 2, cont: [{ so: 7 }] }] },
      doi: [khe({ x: 1, y: 3, huong: 0 }), khe({ x: 4, y: 3, huong: 0 })],
      chonDoi: {
        menu: ['KT', 'CU', 'CC'],
        cachMau: [{ chon: ['CU', 'CC'], ghiChu: 'đôi tốt', loiGiai: doiBai([CU_6, CC_6]) }]
      },
      maMau: doiBai([['forward(2)', 'tr_right()', 'forward(4)'], []]),
      loiSai: [
        { moTa: 'Không lấp hố: xích ủi tới hố thì rơi', baiLam: doiBai([CU_6, []]), phaiCoMa: ['roi-ho'] },
        { moTa: 'Cẩu hạ thùng đá ngay ngách (quên vươn cần): hố còn đó', baiLam: doiBai([CU_6, ['pick_up()', 'set_down()']]), phaiCoMa: ['roi-ho'] },
        { moTa: 'Xích quên quay: tiến thẳng đâm tường', baiLam: doiBai([['forward(2)', 'forward(4)'], CC_6]), phaiCoMa: ['chua-day-thung'] }
      ],
      sao: { o: 17, nhip: 10 },
      goiY: ['Cẩu hạ thùng đá xuống ô hố: hố thành sàn đi được.', 'Xích tiến vào ô thùng nặng thì đẩy thùng đi một ô.'],
      cauDo: { doi: ['CU', 'CC'], lap: null, coChe: ['thung-nang', 'container', 'ho', 'ray', 'xe-goong'], cuu: 'hang', meo: 'lam-cau' }
    }),
    // 7 · cứu máy, giữ cửa: máy khai thác khách (R3, khoá) kẹt sau hố sụt 2 ô, phải đi đường vòng hàng 1: cửa hầm (nút đè M) và khối đá rỗng chắn đường vòng.
    //     Robot phân loại lên đứng nút đè giữ cửa hầm mở tới khi máy khách qua; xe hang động tiến một ô cho đủ gần, nghe nốt rồi hát lại phá đá rỗng. Ba bạn về cờ.
    //     Bẫy: drone (không đè nút, không hát).
    man9('cuu-mo-da', 7, 'van-dung', {
      ten: 'Máy khách đi đường vòng',
      hamCuaEmCan: HAM_EM.concat(['play_note']),
      deBai: 'Máy khai thác khách kẹt sau hố sụt, phải đi đường vòng. Trên đường vòng có cửa hầm (nút đè giữ) và đá rỗng. Đọc chương trình của máy khách rồi chọn hai bạn mở đường kịp. Ba bạn về cờ.',
      veMaMau: 'Đọc chương trình của máy khách: nó chỉ chờ hai nhịp.',
      san: ['##########', '#.C.....F#', '#.###M####', '#.uuF.F..#', '##########'],
      noi: [{ nut: { x: 5, y: 2 }, cua: [{ x: 2, y: 1 }] }],
      them: { daChuong: [{ x: 6, y: 1, not: 2, ben: 1 }] },
      doi: [khe({ x: 8, y: 3, huong: 3 }, { co: [{ x: 6, y: 3 }] }), khe({ x: 5, y: 3, huong: 0 }, { co: [{ x: 4, y: 3 }] }),
        may('KT', { x: 1, y: 3, huong: 0 }, { son: 'tim', coDinh: true, co: [{ x: 8, y: 1 }] })],
      chonDoi: {
        menu: ['HD', 'DR', 'PL'],
        cachMau: [{ chon: ['HD', 'PL'], ghiChu: 'đôi tốt', loiGiai: doiBai([HD_7, PL_7, KT_R3_7]) }]
      },
      maMau: doiBai([[], [], KT_R3_7]),
      loiSai: [
        { moTa: 'Robot phân loại không giữ nút: máy khách đâm cửa hầm', baiLam: doiBai([HD_7, ['go_left()'], KT_R3_7]), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Robot phân loại rời nút sớm: cửa đóng trước khi máy khách qua', baiLam: doiBai([HD_7, ['go_up()', 'go_down()', 'go_left()'], KT_R3_7]), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Xe hang động hát ngay chỗ xuất phát: xa đá rỗng, đá không vỡ', baiLam: doiBai([['play_note(listen())', 'forward(2)'], PL_7, KT_R3_7]), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 26, nhip: 14 },
      goiY: ['Đọc chương trình của máy khách: nó tới cửa hầm, tới đá rỗng lúc nào?', 'Nút đè chỉ giữ cửa mở khi có robot đứng trên nút.'],
      cauDo: { doi: ['HD', 'PL'], lap: null, coChe: ['ho', 'nut-de', 'cua', 'da-rong', 'not', 'r3'], cuu: 'may', meo: 'giu-cua' }
    }),
    // 8 · cứu máy, dọn lối: máy khai thác khách (R3, khoá) chờ ba nhịp rồi chạy thẳng dọc lối hầm. Bão làm khối đá vuông (thùng nặng) và hòm dụng cụ (thùng gỗ) rơi chắn lối.
    //     Xe cứu hỏa ủi khối đá lên ngách trên rồi lùi về cờ; xe chở hàng gắp hòm, lùi về cờ. Bẫy: xuồng (chỉ chạy trong mương, không lên lối hầm).
    man9('cuu-mo-da', 8, 'van-dung', {
      ten: 'Lối hầm bị chắn',
      deBai: 'Máy khai thác khách chờ ba nhịp rồi chạy thẳng về cờ. Khối đá vuông nặng và hòm dụng cụ chắn lối hầm. Chọn hai bạn dọn kịp rồi về cờ.',
      veMaMau: 'Đọc chương trình của máy khách: chờ 3 nhịp rồi đi.',
      san: ['##########', '###.##.###', '#..H..o.F#', '###.##.###', '#~~F~~F~~#', '##########'],
      doi: [khe({ x: 3, y: 3, huong: 0 }, { co: [{ x: 3, y: 4 }], batDauNuoc: { x: 2, y: 4, huong: 1 } }), khe({ x: 6, y: 3, huong: 0 }, { co: [{ x: 6, y: 4 }], batDauNuoc: { x: 5, y: 4, huong: 1 } }),
        may('KT', { x: 1, y: 2, huong: 1 }, { son: 'tim', coDinh: true, co: [{ x: 8, y: 2 }] })],
      chonDoi: {
        menu: ['CU', 'CH', 'XU'],
        cachMau: [{ chon: ['CU', 'CH'], ghiChu: 'đôi tốt', loiGiai: doiBai([CU_8, CH_8, KT_R3_8]) }]
      },
      maMau: doiBai([[], [], KT_R3_8]),
      loiSai: [
        { moTa: 'Xe cứu hỏa ủi xong đứng lại giữa lối: máy khách vướng', baiLam: doiBai([['forward(1)'], CH_8, KT_R3_8]), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Không gắp hòm dụng cụ: máy khách vướng hòm', baiLam: doiBai([CU_8, ['back()'], KT_R3_8]), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 26, nhip: 12 },
      goiY: ['Đọc chương trình của máy khách: nó đi qua khối đá lúc nào?', 'Xích tiến vào ô thùng nặng thì đẩy thùng đi một ô.', 'pick(): gắp vật trước mũi xe.'],
      cauDo: { doi: ['CU', 'CH'], lap: null, coChe: ['thung-nang', 'hom', 'nuoc', 'r3'], cuu: 'may', meo: 'don-loi' }
    }),
    // 9 · cứu máy, làm cầu, nhắc lại G4 (sonic_rail): máy khai thác khách (R3, khoá) chạy vào dốc bùn định rẽ xuống ở cột 4 để xúc quặng lên xe goòng; bùn trơn làm nó trượt quá chỗ rẽ,
    //     và khối đá rỗng chắn ngay dưới chỗ rẽ. Drone bay tới rắc cát ô rẽ (máy dừng đúng chỗ); xe hang động gọi sonic_rail(): nghe nốt, hát lại phá đá rỗng, lùi.
    //     Bẫy: cần cẩu (không rắc cát, không hát). Bảng có cẩu nên mọi khe trên dải ray.
    man9('cuu-mo-da', 9, 'bien-the', {
      ten: 'Chỗ rẽ trên dốc bùn',
      mucTieu: 'dua-vat',
      khung: { chinh: 14, moiHam: 8 },
      hamCuaEmCan: HAM_EM.concat(['sonic_rail', 'play_note']),
      deBai: 'Máy khai thác khách định rẽ xuống ở cột 4 để xúc quặng lên xe goòng, nhưng dốc bùn trơn làm nó trượt quá chỗ rẽ, và đá rỗng chắn dưới chỗ rẽ. Chọn hai bạn: ai rắc cát, ai hát vỡ đá? Nhớ sonic_rail().',
      veMaMau: 'Đọc chương trình của máy khách: chờ 7 nhịp, tiến một bước vào bùn rồi quay xuống.',
      san: ['#########', '#.IIIII.#', '#.......#', '#.......#', '#RRRo...#', '#...D...#', '#########'],
      them: { vatDang: ['.........', '.........', '.........', '.........', '....q....', '.........', '.........'], daChuong: [{ x: 4, y: 2, not: 7, ben: 1 }] },
      doi: [khe({ x: 1, y: 4, huong: 0 }), khe({ x: 3, y: 4, huong: 0 }),
        may('KT', { x: 1, y: 1, huong: 1 }, { son: 'tim', coDinh: true })],
      chonDoi: {
        menu: ['DR', 'HD', 'CC'],
        cachMau: [{ chon: ['DR', 'HD'], ghiChu: 'đôi tốt', loiGiai: doiBai([DR_9, HD_9, KT_R3_9]) }]
      },
      maMau: doiBai([[], [], KT_R3_9]),
      loiSai: [
        { moTa: 'Không rắc cát: máy khách trượt quá chỗ rẽ', baiLam: doiBai([DR_9.slice(0, 4), HD_9, KT_R3_9]), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Không phá đá rỗng: máy khách vướng đá dưới chỗ rẽ', baiLam: doiBai([DR_9, [], KT_R3_9]), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Drone rắc cát lệch một ô (cột 3): máy khách vẫn trượt quá', baiLam: doiBai([['for i in range(3):', '    go_up()', 'for i in range(2):', '    go_right()', 'dot()', 'wait()'], HD_9, KT_R3_9]), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 37, nhip: 16 },
      goiY: ['Đọc chương trình của máy khách: nó rẽ ở ô nào?', 'dot() trên bùn trơn: rắc cát, ô thành sàn thường; xe trượt tới ô cát thì dừng.', 'sonic_rail(): nghe nốt, hát lại, lùi.'],
      cauDo: { doi: ['DR', 'HD'], lap: null, coChe: ['bun', 'rac-cat', 'da-rong', 'not', 'xe-goong', 'ray', 'r3'], cuu: 'may', meo: 'lam-cau' }
    }),
    // 10 · song ca đoạn 7 (Bè 1: 1 1 5 5 6 6 5 5 | Bè 2: 3 3 1 3 4 4 3 3), giữ cho gói 10 ghép bài; dùng play_part (cuu-kho-hang.10 tạo).
    //      Máy khai thác lắp loa thay máy ném hát bè 1; xe hang động hát bè 2 (bảng ghi "gai gõ nhịp": choi-dieu chấm hai robot hát nốt).
    //      Hai khối đá rỗng còn sót trên dốc vỡ khi nghe nốt của mình (chỉ để nhìn). Đội cố định (tay loa không có trên bảng chọn).
    man9('cuu-mo-da', 10, 'trum', {
      ten: 'Song ca mỏ đá',
      mucTieu: 'choi-dieu',
      deBai: 'Mỏ đá đã thông! Máy khai thác lắp loa thay máy ném, xe hang động hát cùng: song ca đoạn 7. Mỗi bạn gọi play_part với bè của mình.',
      veMaMau: 'Bè 2 mới có một nốt.',
      hamCuaEmCan: ['play_note', 'play_part'],
      san: ['######', '#....#', '#.II.#', '######'],
      doi: [may('KT', { x: 1, y: 1, huong: 1 }, { tay: 'loa', boHam: ['load', 'throw', 'aim', 'radar', 'shape', 'diag_left', 'diag_right'], themHam: ['note', 'beat'], phatNot: true }),
        may('HD', { x: 1, y: 2, huong: 1 }, { son: 'lam' })],
      them: { dieu: { r1: '1 1 5 5 6 6 5 5', r2: '3 3 1 3 4 4 3 3' }, daChuong: [{ x: 4, y: 1, not: 6, ben: 1 }, { x: 4, y: 2, not: 4, ben: 1 }] },
      maMau: doiBai([['play_part([1, 1, 5, 5, 6, 6, 5, 5])'], ['play_note(3)']]),
      loiGiai: doiBai([['play_part([1, 1, 5, 5, 6, 6, 5, 5])'], ['play_part([3, 3, 1, 3, 4, 4, 3, 3])']]),
      loiSai: [
        { moTa: 'Bè 2 mới phát một nốt', baiLam: doiBai([['play_part([1, 1, 5, 5, 6, 6, 5, 5])'], ['play_note(3)']]), phaiCoMa: ['lo-nhip'] },
        { moTa: 'Bè 2 đảo hai nốt giữa', baiLam: doiBai([['play_part([1, 1, 5, 5, 6, 6, 5, 5])'], ['play_part([3, 3, 3, 1, 4, 4, 3, 3])']]), phaiCoMa: ['sai-not'] }
      ],
      sao: { o: 7, nhip: 10 },
      goiY: ['Bè 2: play_part([3, 3, 1, 3, 4, 4, 3, 3]).'],
      cauDo: { doi: ['KT', 'HD'], lap: null, coChe: ['loa', 'da-chuong', 'mo-da'], cuu: null, meo: 'song-song' }
    }),
    /* ========================================================================
       CHƯƠNG 2: lap-mo-da (10 màn)
       ======================================================================== */
    // 11 · show (làm cầu): hố chắn lối máy khai thác R1; viên đá tròn nằm dưới hố, chỗ đứng hất đá là dốc bùn: máy khai thác (omni) vào bùn là trượt quá.
    //      Luna lắp sẵn bánh gai + máy ném + radar (khoá): bám bùn dừng đúng chỗ, quay lên hất đá xuống hố, lùi về cờ. R1 chạy qua hố đã lấp tới cờ.
    man9('lap-mo-da', 1, 'lam-quen', {
      ten: 'Xe gai ném đá',
      chiChay: true,
      deBai: 'Hố chắn lối máy khai thác. Chỗ đứng hất đá là dốc bùn: bánh omni vào là trượt. Luna lắp bánh gai cho xe ném: bám bùn, dừng đúng chỗ, hất đá lấp hố. Bấm Chạy.',
      veMaMau: 'Bấm Chạy xem xe gai ném đá.',
      san: ['#########', '#..u...F#', '#..o....#', '#.IIIIII#', '#..F....#', '#########'],
      them: { vatDang: ['.........', '.........', '...r.....', '.........', '.........', '.........'] },
      doi: [may('KT', { x: 1, y: 1, huong: 1 }, { co: [{ x: 7, y: 1 }] }), Object.assign({ batDau: { x: 1, y: 3, huong: 1 }, co: [{ x: 3, y: 4 }] }, clone(GAI_NEM))],
      maMau: doiBai([KT_11, GAI_11]),
      loiGiai: doiBai([KT_11, GAI_11]),
      sao: { o: 27, nhip: 13 },
      goiY: ['Bánh gai bung gai thì bám bùn: dừng được giữa dốc.', 'lob(): xúc đá trước mũi, hất xa 2 ô.'],
      cauDo: { doi: null, lap: 'gai+nem+radar', coChe: ['bun', 'ho', 'da-tron', 'nem'], cuu: 'hang', meo: 'lam-cau' }
    }),
    // 12 · ép đổi thân (làm cầu) + tạo hàm radar_front_lob(n): hai giếng hẹp, mỗi giếng một viên đá tròn nằm dưới hố. Máy khai thác R1 đứng dưới giếng cột 6,
    //      radar thấy đá (g[0][1] == "V") thì hất xa 2 ô lấp hố, trượt phải về cờ. Giếng cột 4 chỉ vào được từ dốc bùn: R2 lắp thân omni (như R1) thì vào bùn trượt tới cuối dốc;
    //      bánh gai bám bùn, dừng đúng cột 4, quay lên hất đá lấp hố, rồi lên qua giếng, rẽ phải qua hố R1 vừa lấp tới cờ.
    man9('lap-mo-da', 2, 'lam-quen', {
      ten: 'Giếng hẹp dưới dốc bùn',
      taoHam: ['radar_front_lob'],
      deBai: 'Hai giếng hẹp, mỗi giếng có hố và một viên đá tròn. Máy khai thác lấp giếng cột 6. Tạo hàm radar_front_lob(n): g = radar(), nếu g[0][1] == "V" thì aim_lob(n), rồi slide_r(1). Lắp R2 lấp giếng cột 4: lối vào là dốc bùn.',
      veMaMau: 'Hàm radar_front_lob chưa có. R2 chưa có chương trình.',
      san: ['#########', '#.....uF#', '####u#o##', '####o#.F#', '#.IIIIII#', '#########'],
      them: { vatDang: ['.........', '.........', '......r..', '....r....', '.........', '.........'] },
      doi: [may('KT', { x: 6, y: 3, huong: 0 }, { co: [{ x: 7, y: 3 }] }), khe({ x: 1, y: 4, huong: 1 }, { son: 'lam', co: [{ x: 7, y: 1 }] })],
      lapRap: lapR2(['omni', 'gai'], ['nem'], ['radar'], 10, [
        cach('gai', 'nem', null, [KT_12, GAI_12], [H_RFL]),
        cach('gai', 'nem', 'radar', [KT_12, GAI_12], [H_RFL])
      ]),
      maMau: doiBai([KT_12, []]),
      loiSai: [
        { moTa: 'radar_front_lob quên slide_r(1): máy khai thác đứng dưới giếng, chưa tới cờ', baiLam: doiBai([KT_12, GAI_12], [], [{ ten: 'radar_front_lob', thamSo: ['n'], than: ['g = radar()', 'if g[0][1] == "V":', '    aim_lob(n)'] }]), hamCuaEmMoi: [{ ten: 'radar_front_lob', thamSo: ['n'], than: ['g = radar()', 'if g[0][1] == "V":', '    aim_lob(n)'] }], phaiCoMa: ['chua-toi-co'] },
        { moTa: 'R2 quên aim(2), hất tầm 1: đá rơi lại ngay trước mũi, chắn giếng', baiLam: doiBai([KT_12, ['forward(3)', 'turn_left()', 'lob()', 'forward(3)', 'turn_right()', 'forward(3)']], [], [H_RFL]), hamCuaEmMoi: [H_RFL], phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 40, nhip: 16 },
      goiY: ['g[0][1] là ô ngay phía trên robot. "V" là có vật.', 'Thân omni vào bùn là trượt tới cuối dốc. Bánh gai bám bùn.'],
      cauDo: { doi: null, lap: 'gai+nem', coChe: ['bun', 'ho', 'da-tron', 'nem', 'radar'], cuu: 'hang', meo: 'lam-cau' }
    }),
    // 13 · đọc rồi chọn (ba sân, ôn lưới grid[r][c]), lai L12 nhện + nam châm + radar (ra mắt): đá lở vùi mũi khoan sắt vào một ngách phía trên hành lang, mỗi sân một ngách.
    //      Nhện đi dọc hành lang, mỗi ô đọc radar: g[0][1] (ô ngay trên) là "V" thì lên hút, xuống; cuối hành lang đá lở chỉ còn gầm thấp: co chân chui qua tới máng, thả.
    //      Cách hai: nhện + cảm biến từ (quay mặt lên, front_metal()). Xe có bánh không chui gầm, không hút sắt. Máy khai thác R1 hất quặng vào máng hầm dưới (song song).
    man9('lap-mo-da', 3, 'luyen', {
      ten: 'Mũi khoan trong ngách',
      mucTieu: 'dua-vat',
      deBai: 'Ba sân. Đá lở vùi mũi khoan sắt vào một ngách phía trên hành lang, mỗi sân một ngách. Lắp robot tìm mũi khoan, mang qua gầm đá lở tới máng D.',
      veMaMau: 'R2 chưa có chương trình.',
      san: [san13(3), san13(5), san13(4)],
      them: { vatChat: [vc13(3), vc13(5), vc13(4)], vatDang: [VD_13, VD_13, VD_13] },
      doi: [may('KT', { x: 1, y: 4, huong: 1 }), khe({ x: 1, y: 2, huong: 0 }, { son: 'lam' })],
      lapRap: lapR2(['nhen', 'omni', 'hai-banh'], ['nam-cham', 'kep'], ['radar', 'tu'], 10, [
        cach('nhen', 'nam-cham', 'radar', [KT_13, NHEN_13]),
        cach('nhen', 'nam-cham', 'tu', [KT_13, NHEN_TU_13])
      ], { moLai: ['L12'] }),
      maMau: doiBai([KT_13, []]),
      loiSai: [
        { moTa: 'Điền thẳng ngách của sân 1 (cột 3): sân 2, 3 mũi khoan còn trong ngách', baiLam: doiBai([KT_13, ['go_right()', 'go_right()', 'go_up()', 'pull_s()', 'go_down()', 'for i in range(3):', '    go_right()', 'crouch()', 'go_right()', 'go_right()', 'magnet_off()', 'wait()']]), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên co chân: nhện đứng thẳng không chui được gầm đá lở', baiLam: doiBai([KT_13, NHEN_13.filter(function (d) { return d !== 'crouch()'; })]), phaiCoMa: ['gam-thap'] }
      ],
      sao: { o: 23, nhip: 24 },
      goiY: ['g = radar(): g[0][1] là ô ngay trên robot. "V" là có vật.', 'pull_s(): hút sắt dưới bụng. magnet_off(): thả.', 'crouch(): co chân chui gầm thấp.'],
      cauDo: { doi: null, lap: 'nhen+nam-cham+radar', coChe: ['sat', 'gam', 'ngach', 'radar', 'nem'], cuu: 'hang', meo: 'doc-roi-chon' }
    }),
    // 14 · dọn lối, lai L1 cẩu + nam châm: mũi khoan sắt rơi giữa lối hầm hẹp, chắn máy khai thác. Bệ cẩu ở hốc trên lối, đầu cần chĩa xuống đúng ô mũi khoan:
    //      hút, quay cần nửa vòng, thả vào hốc chứa D phía trên bệ. Máy khai thác qua lối vừa dọn, hất quặng vào máng cuối hầm. Cách hai: drone + nam châm (rẻ hơn, chậm hơn).
    man9('lap-mo-da', 4, 'luyen', {
      ten: 'Mũi khoan rơi giữa lối',
      mucTieu: 'dua-vat',
      deBai: 'Mũi khoan sắt rơi giữa lối hầm, chắn máy khai thác. Lắp robot ở hốc trên lối: hút mũi khoan cất vào hốc chứa D phía trên.',
      veMaMau: 'Máy khai thác chờ lối trống.',
      san: ['#########', '###D#####', '###.#####', '#..o.oD.#', '#########'],
      them: { vatChat: ['.........', '.........', '.........', '...s.....', '.........'], vatDang: ['.........', '.........', '.........', '.....q...', '.........'] },
      doi: [may('KT', { x: 1, y: 3, huong: 1 }), khe({ x: 3, y: 2, huong: 0, nac: 2 }, { son: 'lam' })],
      lapRap: lapR2(['cau', 'drone'], ['moc-cau', 'nam-cham'], [], 9, [
        cach('cau', 'nam-cham', null, [KT_14, CAU_14]),
        cach('drone', 'nam-cham', null, [KT_14B, DRONE_14])
      ], { moLai: ['L1'] }),
      maMau: doiBai([KT_14, []]),
      loiSai: [
        { moTa: 'Hút mũi khoan rồi thả ngay: mũi khoan rơi lại giữa lối', baiLam: doiBai([KT_14, ['magnet_n()', 'magnet_off()']]), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quay cần một nấc rồi thả: mũi khoan rơi vào tường bên', baiLam: doiBai([KT_14, ['magnet_n()', 'swing_left()', 'magnet_off()']]), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 22, nhip: 11 },
      goiY: ['Nam châm trên đầu cần hút sắt ở ô dưới đầu cần.', 'swing_left() hai lần: cần quay nửa vòng.'],
      cauDo: { doi: null, lap: 'cau+nam-cham', coChe: ['sat', 'ho', 'nem', 'mui-khoan'], cuu: 'hang', meo: 'don-loi' }
    }),
    /* HẾT MOI */
  ];

  var R1_OMNI = {
    loaiRobot: 'omni',
    omniCheo: true,
    cheoGhep: true,      // ghép nhịp 5a: Máy mỏ đá đi chéo bằng hàm của em dir_*() (slide_* cùng nhịp hai bánh đi thẳng)
    chinhLuc: true,
    nhanDang: true,
    tamNemMacDinh: 2,
    daLapHo: true,
    robot: { than: 'omni', tay: 'nem', camBien: [{ ma: 'radar', o: 'tren', nhanDang: true }] },
    hamGoc: ['left_move', 'right_move', 'left_back', 'right_back', 'slide_left', 'slide_right', 'wait', 'load', 'throw', 'radar', 'diag_left', 'diag_right', 'aim', 'shape']
  };

  var R1_LOA = {
    loaiRobot: 'xich',
    phatNot: true,
    robot: { than: 'xich', tay: 'loa', camBien: [{ ma: 'hong-ngoai', o: 'tren' }] },
    hamGoc: ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'beat', 'note', 'distance', 'warm']
  };

  var R_BANH = {
    loaiRobot: 'banh',
    robot: { than: 'hai-banh', tay: 'xoay', camBien: [{ ma: 'khoang-cach', o: 'truoc', ben: true }], son: 'lam' },
    hamGoc: ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'arm_down', 'arm_up', 'grab', 'release', 'arm_left', 'arm_right', 'front_clear', 'left_clear', 'right_clear']
  };

  var R_XICH = {
    loaiRobot: 'xich',
    xichDay: true,
    lucBan: true,
    beSung: true,
    robot: { than: 'xich', tay: 'hoi', camBien: [{ ma: 'hong-ngoai', o: 'truoc', doNhiet: true }], son: 'lam' },
    hamGoc: ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'spray', 'spray_back', 'distance', 'warm']
  };

  var R_NHEN = {
    loaiRobot: 'nhen',
    daoCuc: true,
    docCuc: true,
    robot: { than: 'nhen', tay: 'nam-cham', camBien: [{ ma: 'tu', o: 'hong', docCuc: true }], son: 'lam' },
    hamGoc: ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'crouch', 'stand', 'magnet_n', 'magnet_s', 'magnet_off', 'front_metal', 'front_pole']
  };

  var R_DRONE = {
    loaiRobot: 'drone',
    robot: { than: 'drone', tay: 'son', camBien: [{ ma: 'camera-4', o: 'tren', taiCho: true }], son: 'lam' },
    hamGoc: ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'ink', 'dot', 'pen_down', 'pen_up', 'color', 'land', 'take_off']
  };

  var R_GAI = {
    loaiRobot: 'gai',
    thuGai: true,
    phatNot: true,
    phanAm: true,
    robot: { than: 'gai', tay: 'loa', camBien: [{ ma: 'am-thanh', o: 'tren', phanAm: true }], son: 'lam' },
    hamGoc: ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'retract_spikes', 'extend_spikes', 'beat', 'note', 'hear', 'listen']
  };

  var H_QUARRY_WAIT_LOB = {
    ten: 'quarry_wait_lob', thamSo: ['w', 'n'],
    than: ['wait_n(w)', 'forward(2)', 'aim_lob(n)']
  };
  var H_RADAR_FRONT_LOB = {
    ten: 'radar_front_lob', thamSo: ['n'],
    than: ['g = radar()', 'if g[0][1] == "V":', '    aim_lob(n)', 'slide_r(1)']
  };
  var H_RADAR_SIDE_LOB = {
    ten: 'radar_side_lob', thamSo: ['n'],
    than: ['g = radar()', 'if g[0][0] == "V":', '    slide_l(1)', 'else:', '    slide_r(1)', 'aim_lob(n)']
  };
  var H_SHAPE_BRIDGE_LOB = {
    ten: 'shape_bridge_lob', thamSo: [],
    than: ['if shape("front") == "round":', '    fill_pit()', '    lob()']
  };
  var H_GRID_CLEAR_PASS = {
    ten: 'grid_clear_pass', thamSo: ['w', 'n'],
    than: ['wait_n(w)', 'for i in range(2):', '    radar_front_lob(n)']
  };


  function baiDoi(r1Chinh, r2Chinh, hamEm, hamMan) {
    return {
      doi: [{ chinh: r1Chinh.slice() }, { chinh: r2Chinh.slice() }],
      hamCuaMan: hamMan ? clone(hamMan) : [],
      hamCuaEmMoi: hamEm ? clone(hamEm) : []
    };
  }

  function manMD(chuong, so, hang, cfg) {
    var r1 = clone(cfg.r1 || R1_OMNI);
    var r2 = clone(cfg.r2 || R_BANH);
    r1.batDau = cfg.bd[0];
    r2.batDau = cfg.bd[1];
    if (cfg.coDinhR1) r1.coDinh = true;
    if (cfg.coDinhR2) r2.coDinh = true;
    var m = {
      chuong: chuong,
      so: so,
      ten: cfg.ten,
      hang: hang,
      vo: 'mo-da',
      loaiRobot: r1.loaiRobot,
      daLapHo: true,
      tamNemMacDinh: 2,
      omniCheo: true,
      chinhLuc: true,
      nhanDang: true,
      robot: clone(r1.robot),
      hamGoc: r1.hamGoc.slice(),
      cauTruc: cfg.cauTruc || ['for', 'if', 'while', 'list'],
      vaHoac: true,
      moXuong: true,
      camHamCuaEm: false,
      bienDem: true,
      nhipTheoLoiGiai: true,
      hamCuaEmCan: cfg.hamCuaEmCan || ['lob', 'aim_lob', 'wait_n', 'forward', 'move'],
      taoHam: cfg.taoHam || [],
      khung: cfg.khung || { chinh: 10, moiHam: 8 },
      mucTieu: cfg.mucTieu || 'dua-vat',
      deBai: cfg.deBai,
      veMaMau: cfg.veMaMau || '',
      san: cfg.san,
      batDau: cfg.bd[0],
      doi: [r1, r2],
      maMau: cfg.maMau,
      loiGiai: cfg.loiGiai,
      loiSai: cfg.loiSai || [],
      sao: cfg.sao || { o: 16, nhip: 10 },
      goiY: cfg.goiY || []
    };
    if (cfg.chiChay) { m.chiChay = true; m.chinhCoDinh = true; }
    if (cfg.vatDang) m.vatDang = cfg.vatDang;
    if (cfg.vatChat) m.vatChat = cfg.vatChat;
    if (cfg.noi) m.noi = cfg.noi;
    if (cfg.dieu) m.dieu = cfg.dieu;
    if (cfg.chuongDa) m.chuongDa = cfg.chuongDa;
    if (cfg.daChuong) m.daChuong = cfg.daChuong;
    return ManHoc.chuanHoa(m);
  }

  /* ---- BẢN CŨ (trước M9M7): giữ tạm tới khi màn mới thay đủ ---- */
  var CU = [
    /* ========================================================================
       CHUONG 1: cuu-mo-da (10 man)
       ======================================================================== */
    manMD('cuu-mo-da', 1, 'lam-quen', {
      ten: 'Hất đá tròn lấp hố sâu cho xe kho qua mỏ',
      chiChay: true, r2: R_BANH,
      hamCuaEmCan: ['lob', 'wait_n', 'forward', 'move', 'pick', 'drop'],
      deBai: 'Sạt lở làm xuất hiện hố sâu u(3, 2) chắn ngang đường vận chuyển ở Mỏ đá (Mùa 7)! Máy khai mỏ R1 (thân omni + tay ném) ở (1, 2) gọi lob() hất tảng đá tròn o(2, 2) bay 2 ô lấp phẳng hố u(3, 2) thành đường đi. Xe hai bánh R2 (Mùa 1) ở (3, 1) chờ 2 nhịp rồi tiến 2 ô qua hố đã lấp xuống (3, 3), nhặt kiện hàng o(3, 4) và tiến lên đặt vào D(3, 5). Nhấn Chạy để xem!',
      veMaMau: 'Quan sát R1 hất đá tròn lấp hố u(3, 2) mở đường cho R2.',
      san: ['#######', '#..=..#', '#.ou..#', '#=..=.#', '#..o..#', '#..D..#', '#######'].map(function (r, idx) { return idx === 1 ? '#=..=.#' : r; }),
      vatDang: ['.......', '.......', '..r....', '.......', '.......', '.......', '.......'],
      bd: [{ x: 1, y: 2, huong: 1 }, { x: 3, y: 1, huong: 2 }],
      maMau: baiDoi(['lob()'], ['wait_n(2)', 'forward(2)', 'pick()', 'move()', 'drop()']),
      loiGiai: baiDoi(['lob()'], ['wait_n(2)', 'forward(2)', 'pick()', 'move()', 'drop()']),
      sao: { o: 24, nhip: 8 },
      goiY: ['Nhấn Chạy để xem R1 hất đá tròn lấp hố u(3, 2) cho R2 đi qua.']
    }),

    manMD('cuu-mo-da', 2, 'lam-quen', {
      ten: 'Chỉnh lực hất đá xa lấp hố cho xe xích đẩy thùng',
      r2: R_XICH, mucTieu: 'day-thung',
      hamCuaEmCan: ['aim_lob', 'lob', 'wait_n', 'forward', 'move'],
      deBai: 'Hố sâu u(4, 2) nằm cách R1 ở (1, 2) tới 3 ô, chắn đường xe bánh xích R2 (Mùa 2) từ (4, 1) tiến xuống đẩy thùng máy H(4, 4) vào bệ đích D(4, 5)! Hãy cho R1 gọi aim_lob(3) hất viên đá tròn o(2, 2) bay xa 3 ô lấp phẳng hố u(4, 2). R2 ở (4, 1) gọi wait_n(2) chờ lấp hố xong rồi gọi forward(3) tiến qua đẩy H(4, 4) vào D(4, 5)!',
      veMaMau: 'R1 chưa gọi aim_lob(3) để lấp hố u(4, 2) cho R2.',
      san: ['#######', '#=...=#', '#.o.u.#', '#=...=#', '#...H.#', '#...D.#', '#######'],
      vatDang: ['.......', '.......', '..r....', '.......', '.......', '.......', '.......'],
      bd: [{ x: 1, y: 2, huong: 1 }, { x: 4, y: 1, huong: 2 }],
      maMau: baiDoi(['lob()'], ['wait_n(2)', 'forward(3)']),
      loiGiai: baiDoi(['aim_lob(3)'], ['wait_n(2)', 'forward(3)']),
      loiSai: [
        { moTa: 'R1 chỉ dùng lob() tầm 2 nên viên đá rơi xuống (3, 2), hố u(4, 2) chưa được lấp và R2 rơi xuống hố', baiLam: baiDoi(['lob()'], ['wait_n(2)', 'forward(3)']), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 20, nhip: 4 },
      goiY: ['Ở chương trình R1, thay lob() bằng aim_lob(3) để hất đá xa 3 ô tới hố u(4, 2).']
    }),

    manMD('cuu-mo-da', 3, 'luyen', {
      ten: 'Nhện chui gầm đè nút mở cổng cho omni hất quặng',
      r2: R_NHEN,
      hamCuaEmCan: ['wait_n', 'forward', 'move', 'aim_lob', 'lob', 'crawl'],
      deBai: 'Tảng quặng quý o(4, 1) cần được hất vào máng thu D(6, 1), nhưng cổng sắt C(2, 1) đang đóng trước mặt R1(1, 1)! Ở làn dưới, hãy cho nhện R2 (Mùa 3) tại (1, 3) gọi crawl("R") chui qua gầm thấp n(2, 3) tới đứng đè nút M(3, 3) mở cổng C(2, 1) ở cuối nhịp 5. R1 ở (1, 1) gọi wait_n(5), tiến 2 ô forward(2) qua cổng tới (3, 1) rồi gọi aim_lob(3) hất quặng o(4, 1) vào D(6, 1)!',
      veMaMau: 'R1 chưa chờ 5 nhịp rồi tiến qua cổng hất quặng vào D(6, 1).',
      san: ['########', '#.C.o.D#', '########', '#.nM...#', '########'],
      vatDang: ['........', '....q...', '........', '........', '........'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 3, huong: 1 }],
      maMau: baiDoi(['wait_n(5)', 'forward(2)'], ['crawl("R")']),
      loiGiai: baiDoi(['wait_n(5)', 'forward(2)', 'aim_lob(3)'], ['crawl("R")']),
      loiSai: [
        { moTa: 'R1 tiến qua cổng tới (3, 1) nhưng quên gọi aim_lob(3) để hất quặng vào D(6, 1)', baiLam: baiDoi(['wait_n(5)', 'forward(2)'], ['crawl("R")']), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 28, nhip: 9 },
      goiY: ['Ở chương trình R1, sau wait_n(5) và forward(2), gọi thêm aim_lob(3).']
    }),

    manMD('cuu-mo-da', 4, 'luyen', {
      ten: 'Đi chéo lấp hố sâu mở lối cho xe kho',
      r2: R_BANH,
      hamCuaEmCan: ['sort_lob', 'aim_lob', 'lob', 'wait_n', 'forward', 'move', 'pick', 'drop'],
      deBai: 'Hố sâu u(2, 1) đang chắn ngang đường xe kho R2 đi lấy kiện hàng o(4, 1) đưa về D(5, 1). Hãy cho R1 ở (1, 4) hướng Bắc gọi dir_fr() lách chéo lên (2, 3) đối diện tảng đá tròn o(2, 2), rồi gọi sort_lob() để tự nhận dạng đá tròn và hất 2 ô lấp phẳng hố u(2, 1)! R2 ở (1, 1) gọi wait_n(3) chờ lấp hố xong, gọi forward(2) qua (2, 1) tới (3, 1), pick() nhặt o(4, 1), move() sang (4, 1) và drop() vào D(5, 1)!',
      veMaMau: 'R1 gọi dir_fr() và sort_lob(); R2 chờ lấp hố rồi nhặt hàng đưa vào D(5, 1).',
      san: ['#######', '#.u.oD#', '#.o...#', '#.....#', '#.....#', '#######'],
      vatDang: ['.......', '.......', '..r....', '.......', '.......', '.......'],
      bd: [{ x: 1, y: 4, huong: 0 }, { x: 1, y: 1, huong: 1 }],
      maMau: baiDoi(['dir_fr()'], ['wait_n(3)', 'forward(2)', 'pick()', 'move()', 'drop()']),
      loiGiai: baiDoi(['dir_fr()', 'sort_lob()'], ['wait_n(3)', 'forward(2)', 'pick()', 'move()', 'drop()']),
      loiSai: [
        { moTa: 'R1 mới đi chéo lên (2, 3) mà chưa gọi sort_lob() hất đá lấp hố u(2, 1)', baiLam: baiDoi(['dir_fr()'], ['wait_n(3)', 'forward(2)', 'pick()', 'move()', 'drop()']), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 28, nhip: 8 },
      goiY: ['Ở chương trình R1, thêm sort_lob() sau dir_fr().']
    }),

    manMD('cuu-mo-da', 5, 'cung-co', {
      ten: 'Bánh gai phá đá chuông mở đường ném quặng',
      r2: R_GAI,
      hamCuaEmCan: ['wait_n', 'move', 'aim_lob', 'lob', 'play_note'],
      deBai: 'Trên đường hất quặng của R1, ô (2, 1) đang bị tảng đá chuông nốt 3 chắn kín trước viên quặng o(3, 1)! Hãy cho R2 (bánh gai Mùa 8) ở (2, 2) cạnh chuông đá (3, 2) gọi play_note(listen()) phá vỡ tảng đá chuông tại (2, 1) ngay nhịp 1. R1 ở (1, 1) hướng Đông gọi wait(), tiến 1 ô move() vào (2, 1) rồi gọi aim_lob(3) hất viên quặng o(3, 1) vào máng D(5, 1)!',
      veMaMau: 'R1 chưa chờ phá đá chuông rồi tiến lên hất quặng vào D(5, 1).',
      san: ['#######', '#..o.D#', '#.....#', '#######'],
      vatDang: ['.......', '...q...', '.......', '.......'],
      chuongDa: [{ x: 3, y: 2, not: 3, phamVi: 3 }],
      daChuong: [{ x: 2, y: 1, not: 3, ben: 1 }],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 2, huong: 1 }],
      maMau: baiDoi(['wait()'], ['play_note(listen())']),
      loiGiai: baiDoi(['wait()', 'move()', 'aim_lob(3)'], ['play_note(listen())']),
      loiSai: [
        { moTa: 'R1 chỉ chờ mà chưa tiến vào (2, 1) và gọi aim_lob(3)', baiLam: baiDoi(['wait()'], ['play_note(listen())']), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 22, nhip: 4 },
      goiY: ['Ở chương trình R1, sau wait() hãy gọi move() và aim_lob(3).']
    }),

    manMD('cuu-mo-da', 6, 'cung-co', {
      ten: 'Lấp hai hố sâu liên tiếp mở đường cho nhện hút sắt',
      r2: R_NHEN,
      hamCuaEmCan: ['fill_pit', 'lob', 'forward', 'move', 'wait_n', 'walk', 'go', 'pull_s', 'pull_deliver'],
      deBai: 'Trước mặt R1 ở (1, 1) có viên đá tròn o(2, 1) và hố sâu u(3, 1), tiếp theo là viên đá tròn thứ hai o(4, 1) và hố sâu u(5, 1) chắn lối của nhện R2! Hãy cho R1 gọi fill_pit() (hất o(2, 1) lấp hố u(3, 1) rồi tiến 2 ô lên (3, 1)) và gọi lob() hất viên đá o(4, 1) lấp nốt hố u(5, 1) (tổng cộng 6 nhịp). R2 ở (5, 0) gọi wait_n(6), walk("DD") qua hố đã lấp (5, 1) xuống (5, 2) rồi gọi pull_deliver("R") đưa sắt o(5, 2) vào D(6, 2)!',
      veMaMau: 'R1 gọi fill_pit() và lob(); R2 chờ 6 nhịp rồi đi qua (5, 1) hút sắt đưa vào D(6, 2).',
      san: ['#####.##', '#.ouou.#', '####.oD#', '########'],
      vatDang: ['........', '..r.r...', '........', '........'],
      vatChat: ['........', '........', '.....s..', '........'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 5, y: 0, huong: 2 }],
      maMau: baiDoi(['fill_pit()'], ['wait_n(6)', 'walk("DD")', 'pull_deliver("R")']),
      loiGiai: baiDoi(['fill_pit()', 'lob()'], ['wait_n(6)', 'walk("DD")', 'pull_deliver("R")']),
      loiSai: [
        { moTa: 'R1 mới lấp hố u(3, 1) mà quên gọi lob() để lấp hố u(5, 1) cho R2 đi qua', baiLam: baiDoi(['fill_pit()'], ['wait_n(6)', 'walk("DD")', 'pull_deliver("R")']), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 30, nhip: 12 },
      goiY: ['Ở chương trình R1, sau fill_pit() hãy gọi thêm lob() để hất o(4, 1) lấp hố u(5, 1).']
    }),

    manMD('cuu-mo-da', 7, 'van-dung', {
      ten: 'Xe xích bắn van mở cửa hầm cho omni lấp hố đẩy đá',
      r2: R_XICH,
      hamCuaEmCan: ['wait_n', 'move', 'fill_pit', 'lob', 'forward', 'squirt'],
      deBai: 'Cửa hầm mỏ C(2, 1) nối với nút van nước N(4, 3). Hãy cho xe xích R2 ở (2, 3) hướng Đông gọi squirt("low") bắn tia nước mở cửa C(2, 1) ngay nhịp 1. R1 ở (1, 1) gọi wait(), move() tiến vào (2, 1), gọi fill_pit() hất đá tròn o(3, 1) lấp hố u(4, 1) rồi tiến lên (4, 1), cuối cùng gọi lob() hất viên đá o(5, 1) vào đích D(6, 1)!',
      veMaMau: 'R1 chưa gọi fill_pit() và lob() sau khi qua cửa C(2, 1).',
      san: ['########', '#.CouoD#', '########', '#...N..#', '########'],
      vatDang: ['........', '...r.r..', '........', '........', '........'],
      noi: [{ nut: { x: 4, y: 3 }, cua: [{ x: 2, y: 1 }] }],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 3, huong: 1 }],
      maMau: baiDoi(['wait()', 'move()'], ['squirt("low")']),
      loiGiai: baiDoi(['wait()', 'move()', 'fill_pit()', 'lob()'], ['squirt("low")']),
      loiSai: [
        { moTa: 'R1 mới bước vào cửa C(2, 1) mà chưa gọi fill_pit() và lob()', baiLam: baiDoi(['wait()', 'move()'], ['squirt("low")']), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 28, nhip: 8 },
      goiY: ['Ở chương trình R1, sau wait() và move(), gọi thêm fill_pit() rồi lob().']
    }),

    manMD('cuu-mo-da', 8, 'van-dung', {
      ten: 'Chế hàm chờ mở cổng rồi tiến qua hất quặng',
      r2: R_NHEN, taoHam: ['quarry_wait_lob'],
      hamCuaEmCan: ['wait_n', 'forward', 'move', 'aim_lob', 'lob', 'walk', 'go'],
      deBai: 'Hãy tạo hàm mới quarry_wait_lob(w, n) cho R1 gồm 3 dòng: wait_n(w), forward(2), aim_lob(n). Ở làn dưới, nhện R2 tại (1, 3) gọi walk("RR") bước 2 ô tới đứng đè nút M(3, 3) mở cổng C(2, 1) sau 4 nhịp; R1 ở (1, 1) gọi quarry_wait_lob(4, 3) để chờ 4 nhịp, tiến 2 ô qua cổng tới (3, 1) và hất viên quặng o(4, 1) xa 3 ô vào máng D(6, 1)!',
      veMaMau: 'Định nghĩa hàm quarry_wait_lob(w, n) và gọi cho R1.',
      san: ['########', '#.C.o.D#', '########', '#..M...#', '########'],
      vatDang: ['........', '....q...', '........', '........', '........'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 3, huong: 1 }],
      maMau: baiDoi(['forward(2)', 'aim_lob(3)'], ['walk("RR")']),
      loiGiai: baiDoi(['quarry_wait_lob(4, 3)'], ['walk("RR")'], [H_QUARRY_WAIT_LOB]),
      loiSai: [
        { moTa: 'R1 không chờ 4 nhịp nên đâm vào cổng C(2, 1) khi chưa mở', baiLam: baiDoi(['quarry_wait_lob(0, 3)'], ['walk("RR")'], [H_QUARRY_WAIT_LOB]), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      sao: { o: 28, nhip: 8 },
      goiY: ['Tạo hàm quarry_wait_lob(w, n) gồm: wait_n(w), forward(2), aim_lob(n); ở R1 gọi quarry_wait_lob(4, 3).']
    }),

    manMD('cuu-mo-da', 9, 'bien-the', {
      ten: 'Phá đá chuông trên nút cổng cho hàm quarry_wait_lob',
      r2: R_GAI,
      hamCuaEmCan: ['quarry_wait_lob', 'wait_n', 'forward', 'move', 'aim_lob', 'lob', 'play_note'],
      deBai: 'Dùng lại hàm quarry_wait_lob(w, n) vừa chế! Ở làn dưới, nút đè M(3, 3) mở cổng C(2, 1) đang bị tảng đá chuông nốt 5 che khuất. Hãy cho R2 (bánh gai Mùa 8) ở (2, 3) hướng Đông gọi play_note(listen()) phá đá chuông rồi gọi move() bước lên đè nút M(3, 3) (mất 2 nhịp). R1 ở (1, 1) gọi quarry_wait_lob(2, 2) chờ 2 nhịp, tiến qua cổng tới (3, 1) và hất viên đá o(4, 1) vào D(5, 1)!',
      veMaMau: 'R2 phá đá chuông và bước lên nút M(3, 3); R1 gọi quarry_wait_lob(2, 2).',
      san: ['#######', '#.C.oD#', '#######', '#..M..#', '#######'],
      chuongDa: [{ x: 2, y: 3, not: 5, phamVi: 3 }],
      daChuong: [{ x: 3, y: 3, not: 5, ben: 1 }],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 3, huong: 1 }],
      maMau: baiDoi(['quarry_wait_lob(2, 2)'], ['play_note(listen())']),
      loiGiai: baiDoi(['quarry_wait_lob(2, 2)'], ['play_note(listen())', 'move()']),
      loiSai: [
        { moTa: 'R2 phá đá chuông ở (3, 3) nhưng quên gọi move() tiến lên đè nút M(3, 3)', baiLam: baiDoi(['quarry_wait_lob(2, 2)'], ['play_note(listen())']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      sao: { o: 28, nhip: 6 },
      goiY: ['Ở chương trình R2, sau play_note(listen()) hãy gọi thêm move().']
    }),

    manMD('cuu-mo-da', 10, 'trum', {
      ten: 'Tiếng vọng đại ngàn mỏ đá Chấn Hưng',
      r1: R1_LOA, r2: R_GAI, mucTieu: 'choi-dieu',
      dieu: { r1: '5 3 5 8', r2: '1 5 3 5' },
      hamCuaEmCan: ['play_part', 'play_note'],
      deBai: 'Tuyến đường mỏ đá đã thông suốt! Dàn nhạc robot R1 và R2 cùng hòa tấu bản nhạc "Tiếng vọng đại ngàn" gồm 4 nhịp 2 bè: R1 tấu bè [5, 3, 5, 8], còn R2 tấu bè [1, 5, 3, 5]. Hãy gọi play_part([1, 5, 3, 5]) cho R2!',
      veMaMau: 'R2 chưa gọi play_part([1, 5, 3, 5]).',
      san: ['#####', '#...#', '#####'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 3, y: 1, huong: 3 }],
      maMau: baiDoi(['play_part([5, 3, 5, 8])'], ['play_note(1)']),
      loiGiai: baiDoi(['play_part([5, 3, 5, 8])'], ['play_part([1, 5, 3, 5])']),
      loiSai: [
        { moTa: 'R2 chỉ phát 1 nốt đầu nên thiếu 3 nhịp hòa âm', baiLam: baiDoi(['play_part([5, 3, 5, 8])'], ['play_note(1)']), phaiCoMa: ['lo-nhip'] }
      ],
      sao: { o: 18, nhip: 4 },
      goiY: ['Ở chương trình R2, gọi play_part([1, 5, 3, 5]).']
    }),

    /* ========================================================================
       CHUONG 2: lap-mo-da (10 man)
       ======================================================================== */
    manMD('lap-mo-da', 1, 'lam-quen', {
      ten: 'Quét lưới 2D radar tìm đá lấp hố cho xe kho',
      chiChay: true, r2: R_BANH,
      hamCuaEmCan: ['slide_r', 'lob', 'wait_n', 'forward', 'move', 'pick', 'drop'],
      deBai: 'Sang Chương 2, đội cứu hộ ôn sâu về danh sách 2 chiều (lưới 2D g = radar(), truy cập g[r][c]) và nhận dạng shape() của Mùa 7! Ở màn làm mẫu này, R1 tại (1, 3) hướng Bắc gọi g = radar() quét lưới 3x3 quanh xe: thấy ô chéo trước-phải g[0][2] == "V" có tảng đá tròn o(2, 2), R1 trượt phải slide_r(1) sang (2, 3) rồi gọi lob() hất đá lấp hố u(2, 1) mở đường cho R2 đi qua! Nhấn Chạy để xem!',
      veMaMau: 'Quan sát R1 đọc lưới 2D g = radar() tại g[0][2] rồi trượt sang hất đá lấp hố.',
      san: ['#######', '#.u.oD#', '#.o...#', '#...==#', '#######'],
      vatDang: ['.......', '.......', '..r....', '.......', '.......'],
      bd: [{ x: 1, y: 3, huong: 0 }, { x: 1, y: 1, huong: 1 }],
      maMau: baiDoi(['g = radar()', 'if g[0][2] == "V":', '    slide_r(1)', 'lob()'], ['wait_n(3)', 'forward(2)', 'pick()', 'move()', 'drop()']),
      loiGiai: baiDoi(['g = radar()', 'if g[0][2] == "V":', '    slide_r(1)', 'lob()'], ['wait_n(3)', 'forward(2)', 'pick()', 'move()', 'drop()']),
      sao: { o: 24, nhip: 8 },
      goiY: ['Nhấn Chạy để xem R1 đọc g[0][2] == "V" trên lưới 2D radar() và lấp hố cho R2.']
    }),

    manMD('lap-mo-da', 2, 'lam-quen', {
      ten: 'Chế hàm quét ô trước mũi g[0][1] để hất đá và trượt ngang',
      r2: R_XICH, mucTieu: 'day-thung', taoHam: ['radar_front_lob'],
      hamCuaEmCan: ['aim_lob', 'lob', 'slide_r', 'wait_n', 'forward', 'move'],
      deBai: 'Trong lưới 3x3 trả về từ g = radar(), phần tử g[0][1] là ô ngay trước mũi xe! Hãy tạo hàm mới radar_front_lob(n) cho R1 gồm: g = radar(), nếu g[0][1] == "V" thì gọi aim_lob(n), sau đó (ngoài if) gọi slide_r(1) trượt phải 1 cột. R1 ở (2, 3) hướng Bắc gọi radar_front_lob(2) để hất đá tròn o(2, 2) lấp hố u(2, 1) rồi trượt sang (3, 3); xe xích R2 ở (1, 1) gọi wait_n(2) rồi forward(3) qua hố đã lấp đẩy thùng H(3, 1) vào D(4, 1)!',
      veMaMau: 'Định nghĩa hàm radar_front_lob(n) kiểm tra g[0][1] == "V".',
      san: ['######', '#.uHD#', '#.o..#', '#....#', '######'],
      vatDang: ['......', '......', '..r...', '......', '......'],
      bd: [{ x: 2, y: 3, huong: 0 }, { x: 1, y: 1, huong: 1 }],
      maMau: baiDoi(['slide_r(1)'], ['wait_n(2)', 'forward(3)']),
      loiGiai: baiDoi(['radar_front_lob(2)'], ['wait_n(2)', 'forward(3)'], [H_RADAR_FRONT_LOB]),
      loiSai: [
        { moTa: 'R1 chỉ trượt phải mà không kiểm tra g[0][1] == "V" để hất đá lấp hố u(2, 1)', baiLam: baiDoi(['slide_r(1)'], ['wait_n(2)', 'forward(3)']), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 28, nhip: 5 },
      goiY: ['Tạo hàm radar_front_lob(n) gồm: g = radar(), if g[0][1] == "V": aim_lob(n), và slide_r(1); ở R1 gọi radar_front_lob(2).']
    }),

    manMD('lap-mo-da', 3, 'luyen', {
      ten: 'Lặp quét dọc vách đá bằng hàm radar_front_lob',
      r2: R_NHEN,
      hamCuaEmCan: ['radar_front_lob', 'aim_lob', 'lob', 'slide_r', 'wait_n', 'walk', 'go', 'pull_s', 'pull_deliver'],
      deBai: 'Dùng lại hàm radar_front_lob(n) vừa chế! Trên 2 cột 2 và 3, tại (2, 2) có viên đá tròn cần hất lấp hố u(2, 1) mở đường cho nhện R2, và tại (3, 2) có viên quặng cần hất vào máng D(3, 1). Hãy cho R1 ở (2, 3) hướng Bắc lặp for i in range(2): gọi radar_front_lob(2)! Nhện R2 ở (1, 1) gọi wait_n(2) chờ hố u(2, 1) được lấp, gọi walk("RRRR") băng qua tới (5, 1) rồi gọi pull_deliver("R") đưa sắt o(5, 1) vào D(6, 1)!',
      veMaMau: 'R1 lặp 2 lần gọi radar_front_lob(2); R2 qua hố đã lấp hút sắt vào D(6, 1).',
      san: ['########', '#.uD.oD#', '#.oo...#', '#......#', '########'],
      vatDang: ['........', '........', '..rq....', '........', '........'],
      vatChat: ['........', '.....s..', '........', '........', '........'],
      bd: [{ x: 2, y: 3, huong: 0 }, { x: 1, y: 1, huong: 1 }],
      maMau: baiDoi(['for i in range(2):', '    radar_front_lob(2)'], ['wait_n(2)', 'walk("RRRR")']),
      loiGiai: baiDoi(['for i in range(2):', '    radar_front_lob(2)'], ['wait_n(2)', 'walk("RRRR")', 'pull_deliver("R")']),
      loiSai: [
        { moTa: 'R2 băng qua tới (5, 1) nhưng quên gọi pull_deliver("R") để đưa sắt vào D(6, 1)', baiLam: baiDoi(['for i in range(2):', '    radar_front_lob(2)'], ['wait_n(2)', 'walk("RRRR")']), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 34, nhip: 9 },
      goiY: ['Ở chương trình R2, sau wait_n(2) và walk("RRRR"), gọi thêm pull_deliver("R").']
    }),

    manMD('lap-mo-da', 4, 'luyen', {
      ten: 'Chế hàm dò hai góc chéo g[0][0] và g[0][2] trên lưới radar',
      r2: R_BANH, taoHam: ['radar_side_lob'],
      hamCuaEmCan: ['slide_l', 'slide_r', 'aim_lob', 'lob', 'wait_n', 'forward', 'move', 'pick', 'drop'],
      deBai: 'Khi viên đá nằm lệch ở góc chéo trước-trái g[0][0] hoặc trước-phải g[0][2], hãy tạo hàm mới radar_side_lob(n) cho R1: đọc g = radar(), nếu g[0][0] == "V" thì gọi slide_l(1), ngược lại (else:) gọi slide_r(1), cuối cùng ngoài if/else gọi aim_lob(n)! R1 ở (2, 3) hướng Bắc gọi radar_side_lob(2) để trượt sang cột có đá o(3, 2) và hất lấp hố u(3, 1); R2 ở (2, 1) gọi wait_n(3), forward(2) qua hố đã lấp tới (4, 1), pick() nhặt o(5, 1), move() và drop() vào D(6, 1)!',
      veMaMau: 'Định nghĩa hàm radar_side_lob(n) kiểm tra g[0][0] == "V".',
      san: ['########', '#..u.oD#', '#..o...#', '#......#', '########'],
      vatDang: ['........', '........', '...r....', '........', '........'],
      bd: [{ x: 2, y: 3, huong: 0 }, { x: 2, y: 1, huong: 1 }],
      maMau: baiDoi(['slide_r(1)'], ['wait_n(3)', 'forward(2)', 'pick()', 'move()', 'drop()']),
      loiGiai: baiDoi(['radar_side_lob(2)'], ['wait_n(3)', 'forward(2)', 'pick()', 'move()', 'drop()'], [H_RADAR_SIDE_LOB]),
      loiSai: [
        { moTa: 'R1 mới trượt phải mà chưa gọi aim_lob(2) để lấp hố u(3, 1)', baiLam: baiDoi(['slide_r(1)'], ['wait_n(3)', 'forward(2)', 'pick()', 'move()', 'drop()'], [H_RADAR_SIDE_LOB]), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 34, nhip: 8 },
      goiY: ['Tạo hàm radar_side_lob(n) gồm: g = radar(), if g[0][0] == "V": slide_l(1), else: slide_r(1), rồi aim_lob(n); ở R1 gọi radar_side_lob(2).']
    }),

    manMD('lap-mo-da', 5, 'cung-co', {
      ten: 'Dò góc chéo bằng radar_side_lob kết hợp bánh gai phá đá chuông',
      r2: R_GAI,
      hamCuaEmCan: ['radar_side_lob', 'slide_l', 'slide_r', 'aim_lob', 'lob', 'play_note'],
      deBai: 'Viên quặng o(1, 2) nằm ở góc chéo trước-trái g[0][0] của R1 (đang đứng ở (2, 3) hướng Bắc), nhưng ô (1, 3) bên trái R1 đang bị tảng đá chuông nốt 4 chắn không cho trượt sang! Hãy cho R2 (bánh gai Mùa 8) ở (1, 4) hướng Bắc gọi play_note(listen()) phá đá chuông tại (1, 3) ngay nhịp 1; R1 ở (2, 3) gọi wait() chờ 1 nhịp rồi gọi radar_side_lob(2) trượt sang (1, 3) và hất quặng o(1, 2) vào D(1, 1)!',
      veMaMau: 'R1 gọi wait() và radar_side_lob(2); R2 gọi play_note(listen()) phá đá chuông tại (1, 3).',
      san: ['######', '#D...#', '#o...#', '#....#', '#....#', '######'],
      vatDang: ['......', '......', '.q....', '......', '......', '......'],
      chuongDa: [{ x: 2, y: 4, not: 4, phamVi: 3 }],
      daChuong: [{ x: 1, y: 3, not: 4, ben: 1 }],
      bd: [{ x: 2, y: 3, huong: 0 }, { x: 1, y: 4, huong: 0 }],
      maMau: baiDoi(['wait()', 'radar_side_lob(2)'], []),
      loiGiai: baiDoi(['wait()', 'radar_side_lob(2)'], ['play_note(listen())']),
      loiSai: [
        { moTa: 'R2 chưa gọi play_note(listen()) phá đá chuông tại (1, 3) nên R1 không trượt trái sang cột 1 được', baiLam: baiDoi(['wait()', 'radar_side_lob(2)'], []), phaiCoMa: ['dam-tuong', 'nap-hut', 'chua-dua-vat'] }
      ],
      sao: { o: 24, nhip: 4 },
      goiY: ['Ở chương trình R2, gọi play_note(listen()) để phá tảng đá chuông tại (1, 3).']
    }),

    manMD('lap-mo-da', 6, 'cung-co', {
      ten: 'Chế hàm kiểm tra đá tròn lấp hố rồi hất tiếp',
      r2: R_XICH, mucTieu: 'day-thung', taoHam: ['shape_bridge_lob'],
      hamCuaEmCan: ['fill_pit', 'lob', 'forward', 'move', 'wait_n'],
      deBai: 'Chỉ có đá tròn ("round") mới lấp được hố sâu u! Hãy tạo hàm mới shape_bridge_lob() (không tham số) cho R1: kiểm tra if shape("front") == "round": bên trong gọi fill_pit() (hất đá tròn lấp hố rồi tiến 2 ô lên hố đã lấp) và gọi lob() hất viên đá kế tiếp lên đè nút M! R1 ở (1, 1) hướng Đông gọi shape_bridge_lob() lấp hố u(3, 1) và hất o(4, 1) đè nút M(5, 1) mở cửa C(2, 3); xe xích R2 ở (1, 3) gọi wait_n(6) rồi forward(3) qua cửa đẩy thùng H(3, 3) vào D(4, 3)!',
      veMaMau: 'Định nghĩa hàm shape_bridge_lob() kiểm tra shape("front") == "round".',
      san: ['#######', '#.ouoM#', '#######', '#.CHD.#', '#######'],
      vatDang: ['.......', '..r.r..', '.......', '.......', '.......'],
      noi: [{ nut: { x: 5, y: 1 }, cua: [{ x: 2, y: 3 }] }],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 3, huong: 1 }],
      maMau: baiDoi(['fill_pit()'], ['wait_n(6)', 'forward(3)']),
      loiGiai: baiDoi(['shape_bridge_lob()'], ['wait_n(6)', 'forward(3)'], [H_SHAPE_BRIDGE_LOB]),
      loiSai: [
        { moTa: 'R1 mới lấp hố mà chưa gọi lob() hất viên đá thứ hai lên nút M(5, 1) nên cửa C(2, 3) đóng chặt', baiLam: baiDoi(['fill_pit()'], ['wait_n(6)', 'forward(3)'], [H_SHAPE_BRIDGE_LOB]), phaiCoMa: ['dam-tuong', 'chua-day-thung'] }
      ],
      sao: { o: 28, nhip: 9 },
      goiY: ['Tạo hàm shape_bridge_lob() gồm: if shape("front") == "round": bên trong gọi fill_pit() và lob(); ở R1 gọi shape_bridge_lob().']
    }),

    manMD('lap-mo-da', 7, 'van-dung', {
      ten: 'Xe xích bắn van mở cửa cho hàm shape_bridge_lob',
      r2: R_XICH,
      hamCuaEmCan: ['shape_bridge_lob', 'fill_pit', 'lob', 'forward', 'move', 'squirt'],
      deBai: 'Dùng lại hàm shape_bridge_lob() vừa chế! Cửa hầm C(2, 1) trước mặt R1(1, 1) được nối với nút van N(4, 3). Hãy cho xe xích R2 ở (2, 3) hướng Đông gọi squirt("low") bắn van N(4, 3) mở cửa C(2, 1) ngay nhịp 1; R1 ở (1, 1) gọi wait(), move() tiến vào (2, 1) rồi gọi shape_bridge_lob() để kiểm tra đá tròn o(3, 1), lấp hố u(4, 1) và hất viên đá thứ hai o(5, 1) vào đích D(6, 1)!',
      veMaMau: 'R1 gọi wait(), move(), shape_bridge_lob(); R2 gọi squirt("low").',
      san: ['########', '#.CouoD#', '########', '#...N..#', '########'],
      vatDang: ['........', '...r.r..', '........', '........', '........'],
      noi: [{ nut: { x: 4, y: 3 }, cua: [{ x: 2, y: 1 }] }],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 3, huong: 1 }],
      maMau: baiDoi(['wait()', 'move()'], ['squirt("low")']),
      loiGiai: baiDoi(['wait()', 'move()', 'shape_bridge_lob()'], ['squirt("low")']),
      loiSai: [
        { moTa: 'R1 bước vào (2, 1) nhưng quên gọi shape_bridge_lob()', baiLam: baiDoi(['wait()', 'move()'], ['squirt("low")']), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 28, nhip: 8 },
      goiY: ['Ở chương trình R1, sau wait() và move(), gọi thêm shape_bridge_lob().']
    }),

    manMD('lap-mo-da', 8, 'van-dung', {
      ten: 'Chế hàm chờ đồng đội rồi quét lưới 2 cột liên tiếp',
      r2: R_BANH, taoHam: ['grid_clear_pass'],
      hamCuaEmCan: ['wait_n', 'radar_front_lob', 'aim_lob', 'lob', 'slide_r', 'forward', 'move'],
      deBai: 'R1 đang đứng ở (1, 3) hướng Bắc cần quét 2 cột liên tiếp (cột 1 trống và cột 2 có quặng o(2, 2)) để trượt qua cổng C(2, 3) sang (2, 3) rồi hất quặng vào đích D(2, 1)! Hãy tạo hàm mới grid_clear_pass(w, n) cho R1 gồm: wait_n(w), lặp for i in range(2): gọi radar_front_lob(n). R2 ở (4, 3) hướng Đông gọi move() tiến lên đứng đè nút M(5, 3) mở cổng C(2, 3) ở cuối nhịp 1; R1 ở (1, 3) gọi grid_clear_pass(1, 2)!',
      veMaMau: 'Định nghĩa hàm grid_clear_pass(w, n) và gọi cho R1.',
      san: ['#######', '##D####', '#.o...#', '#.C..M#', '#######'],
      vatDang: ['.......', '.......', '..q....', '.......', '.......'],
      noi: [{ nut: { x: 5, y: 3 }, cua: [{ x: 2, y: 3 }] }],
      bd: [{ x: 1, y: 3, huong: 0 }, { x: 4, y: 3, huong: 1 }],
      maMau: baiDoi(['for i in range(2):', '    radar_front_lob(2)'], ['move()']),
      loiGiai: baiDoi(['grid_clear_pass(1, 2)'], ['move()'], [H_GRID_CLEAR_PASS]),
      loiSai: [
        { moTa: 'R1 không chờ 1 nhịp nên trượt phải đâm vào cổng C(2, 3) khi chưa kịp mở', baiLam: baiDoi(['grid_clear_pass(0, 2)'], ['move()'], [H_GRID_CLEAR_PASS]), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      sao: { o: 36, nhip: 5 },
      goiY: ['Tạo hàm grid_clear_pass(w, n) gồm: wait_n(w), for i in range(2): radar_front_lob(n); ở R1 gọi grid_clear_pass(1, 2).']
    }),

    manMD('lap-mo-da', 9, 'bien-the', {
      ten: 'Nhện chui gầm giữ cổng cho hàm grid_clear_pass',
      r2: R_NHEN,
      hamCuaEmCan: ['grid_clear_pass', 'wait_n', 'radar_front_lob', 'aim_lob', 'lob', 'slide_r', 'crawl'],
      deBai: 'Dùng lại hàm grid_clear_pass(w, n) vừa chế! Cổng C(2, 3) trên đường trượt ngang của R1 được nối với nút đè M(6, 3) sau gầm thấp n(5, 3). Hãy cho nhện R2 ở (4, 3) gọi crawl("R") chui qua gầm thấp n(5, 3) tới đứng đè nút M(6, 3) mở cổng C(2, 3) ở cuối nhịp 5; R1 ở (1, 3) hướng Bắc gọi grid_clear_pass(5, 2) để chờ 5 nhịp rồi quét 2 cột liên tiếp, trượt qua cổng sang (2, 3) và hất quặng o(2, 2) vào đích D(2, 1)!',
      veMaMau: 'R1 gọi grid_clear_pass(5, 2); R2 gọi crawl("R") mở cổng C(2, 3).',
      san: ['########', '##D#####', '#.o....#', '#.C..nM#', '########'],
      vatDang: ['........', '........', '..q.....', '........', '........'],
      noi: [{ nut: { x: 6, y: 3 }, cua: [{ x: 2, y: 3 }] }],
      bd: [{ x: 1, y: 3, huong: 0 }, { x: 4, y: 3, huong: 1 }],
      maMau: baiDoi(['grid_clear_pass(5, 2)'], []),
      loiGiai: baiDoi(['grid_clear_pass(5, 2)'], ['crawl("R")']),
      loiSai: [
        { moTa: 'R2 chưa gọi crawl("R") để đè nút M(6, 3) mở cổng C(2, 3)', baiLam: baiDoi(['grid_clear_pass(5, 2)'], []), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      sao: { o: 32, nhip: 9 },
      goiY: ['Ở chương trình R2, gọi crawl("R") để chui qua gầm thấp n(5, 3) tới đè nút M(6, 3).']
    }),

    manMD('lap-mo-da', 10, 'trum', {
      ten: 'Khúc khải hoàn mỏ đá kim cương',
      r1: R1_LOA, r2: R_GAI, mucTieu: 'choi-dieu',
      dieu: { r1: '1 5 3 8 5 8', r2: '3 1 5 3 1 5' },
      hamCuaEmCan: ['play_part', 'play_note'],
      deBai: 'Khép lại toàn bộ chiến dịch cứu hộ Mỏ đá, những mẻ quặng quý đã về kho an toàn! Hai robot R1 và R2 cùng hòa tấu khúc khải hoàn 6 nhịp: R1 chơi bè [1, 5, 3, 8, 5, 8], còn R2 chơi bè [3, 1, 5, 3, 1, 5]. Hãy gọi play_part([3, 1, 5, 3, 1, 5]) cho R2!',
      veMaMau: 'R2 chưa gọi play_part([3, 1, 5, 3, 1, 5]).',
      san: ['#####', '#...#', '#####'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 3, y: 1, huong: 3 }],
      maMau: baiDoi(['play_part([1, 5, 3, 8, 5, 8])'], ['play_note(3)']),
      loiGiai: baiDoi(['play_part([1, 5, 3, 8, 5, 8])'], ['play_part([3, 1, 5, 3, 1, 5])']),
      loiSai: [
        { moTa: 'R2 chỉ phát 1 nốt nhạc nên thiếu 5 nhịp hòa âm', baiLam: baiDoi(['play_part([1, 5, 3, 8, 5, 8])'], ['play_note(3)']), phaiCoMa: ['lo-nhip'] }
      ],
      sao: { o: 22, nhip: 6 },
      goiY: ['Ở chương trình R2, gọi play_part([3, 1, 5, 3, 1, 5]).']
    })
  ];
  ManHoc.manCuuMoDa = MOI.concat(CU.filter(function (c) { return !MOI.some(function (m) { return m.chuong === c.chuong && m.so === c.so; }); }));
})();
