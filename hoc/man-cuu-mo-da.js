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

  /** lap-mo-da.5: máy khai thác chờ hố trên lối được lấp rồi chạy tới cờ. */
  var KT_15 = ['wait_n(8)', 'forward(6)'];
  /** Xích + máy ném: tiến bốn ô ủi khối đá vuông dạt sang, quay lên, hất đá tròn xa 2 ô lấp hố trên lối máy khai thác, quay lại ủi tiếp một ô tới cờ. */
  var XICH_15 = ['forward(4)', 'tr_left()', 'aim_lob(2)', 'tr_right()', 'forward(1)'];
  /** Cách hai: thêm cảm biến hồng ngoại, tiến tới khi khối đá vuông đã dạt khỏi cột đá tròn. */
  var XICH_HN_15 = ['for i in range(4):', '    forward(1)', 'tr_left()', 'if distance() == 0:', '    aim_lob(2)', 'tr_right()', 'forward(1)'];

  /** lap-mo-da.6: máy khai thác trong hốc dưới hất đá tròn lấp hố trên lối về trạm cứu. */
  var KT_16 = ['lob()'];
  /** Cẩu + lưới (L9, giỏ cứu hộ): hố ở hàng r = 4, bệ cẩu ở hàng 2: cần đang chỉ lên, quay abs(4 - 2) = 2 nấc xuống, vớt, quay một nấc sang phải, đặt lên bờ. */
  var CAU_16 = ['ho = (4, 4)', 'r, c = ho', 'for i in range(abs(r - 2)):', '    swing_right()', 'cast_net()', 'swing_left()', 'drop_net()'];
  /** Cách hai rẻ hơn (xe tời bờ L3): hai bánh quay đầu xuống, tung lưới kéo người lên ô nước sát bờ, lùi nhường ô rồi tránh sang trái. */
  var XE_16 = ['turn_left()', 'turn_left()', 'cast_net()', 'wait()', 'back()', 'turn_right()', 'move()'];

  /** lap-mo-da.7: máy khai thác chạy thẳng một mạch qua cửa mở, qua cửa đóng (phải mở kịp), tới cờ. */
  var KT_17 = ['forward(7)'];
  /** Omni + vòi phun + hồng ngoại: nhìn lên lối hầm, chờ tới khi thấy máy khai thác (warm()), phun ra sau trúng nút: cửa trước mở, cửa sau đóng; trượt phải về cờ. */
  var OMNI_17 = ['while not warm():', '    wait()', 'spray_back()', 'wait()', 'slide_r(1)'];
  /** Cách hai rẻ hơn: hai bánh, chờ y như vậy rồi quay phải, tiến một ô về cờ. */
  var XE_17 = ['while not warm():', '    wait()', 'spray_back()', 'wait()', 'turn_right()', 'move()'];

  /** lap-mo-da.8: bãi đá lở ba sân, mũi khoan sắt nằm ngay trên hay ngay dưới chỗ robot (tuỳ sân); rào '=' chắn lối thẳng tới thùng D, lối vòng hàng trên có gầm thấp 'n'. */
  function san18(tren) {
    return ['#######', tren ? '#.o.n.#' : '#...n.#', '#...=D#', tren ? '##.####' : '##o####', '#.oD..#', '#######'];
  }
  function vc18(tren) { return ['.......', tren ? '..s....' : '.......', '.......', tren ? '.......' : '..s....', '.......', '.......']; }
  var VD_18 = ['.......', '.......', '.......', '.......', '..q....', '.......'];
  var KT_18 = ['lob()'];
  /** Drone + nam châm + radar (L11): radar đọc ô trên g[0][1]: có mũi khoan thì bay lên hút, không thì bay xuống hút; về chỗ cũ, bay qua rào thấp tới thùng, thả. */
  var DOC_18 = ['g = radar()', 'if g[0][1] == "V":', '    go_up()', '    pull_s()', '    go_down()', 'else:', '    go_down()', '    pull_s()', '    go_up()'];
  var DRONE_18 = DOC_18.concat(['for i in range(3):', '    go_right()', 'magnet_off()', 'wait()']);
  /** Cách hai: nhện + nam châm + radar (L12) đọc y hệt, nhưng không qua rào: vòng lên hàng trên, co chân chui gầm đá lở, xuống thùng. */
  var NHEN_18 = DOC_18.concat(['go_up()', 'crouch()', 'for i in range(3):', '    go_right()', 'go_down()', 'magnet_off()', 'wait()']);

  /** lap-mo-da.9: ba sân, mũi khoan sắt rơi trên lối máy khai thác (hàng 2) ở cột 3, 5, 4 tuỳ sân; R2 đi hàng trên dọn giúp. */
  function san19(xMui) { var h2 = '#........#'.split(''); h2[xMui] = 'o'; h2[8] = 'F'; return ['##########', '#......F##', h2.join(''), '##########']; }
  function vc19(xMui) { var h2 = '..........'.split(''); h2[xMui] = 's'; return ['..........', '..........', h2.join(''), '..........']; }
  /** Cách một: bánh gai + máy ném + radar: quay sang phải, mỗi ô đọc g[2][1] (ô ngay dưới); có mũi khoan thì quay xuống xúc vào rổ, quay lại đi tiếp. */
  var GAI_19 = ['turn_left()', 'for i in range(6):', '    forward(1)', '    g = radar()', '    if g[2][1] == "V":', '        turn_right()', '        load()', '        wait()', '        turn_left()'];
  /** Cách hai: nhện + nam châm + cảm biến từ (mặt quay xuống): front_metal() thì bước xuống, gọi hàm clear_iron("U") của Bãi tái chế (hút rồi bước lên), thả trên hàng trên. */
  var NHEN_19 = ['for i in range(6):', '    go_right()', '    if front_metal():', '        go_down()', '        clear_iron("U")', '        magnet_off()', '        wait()'];
  /** Máy khai thác chờ đủ lâu cho cả hai cách (nhện chậm hơn: mỗi bước hai nhịp) rồi chạy qua lối đã dọn. */
  var KT_19 = ['wait_n(16)', 'forward(7)'];

  /** lap-mo-da.10: song ca đoạn 7 như cuu-mo-da.10, mỗi bạn gọi play_part (gói 1) với bè của mình. */
  var KT_20 = ['play_part([1, 1, 5, 5, 6, 6, 5, 5])'];
  var R2_20 = ['play_part([3, 3, 1, 3, 4, 4, 3, 3])'];

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

  var DS_MAN = [
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
    // 15 · dọn lối + làm cầu, xích + máy ném (một xe làm cả hai): hố trên lối máy khai thác; viên đá tròn duy nhất nằm trong khe dưới hố, chỉ hất được từ hành lang dưới.
    //      Khối đá vuông (thùng nặng H) bít hành lang dưới: xích tiến là ủi khối đá dạt đi, tới dưới khe thì quay lên hất đá tròn xa 2 ô lấp hố. Bánh omni, bánh gai vướng khối đá vuông.
    man9('lap-mo-da', 5, 'luyen', {
      ten: 'Khối đá vuông và hố',
      deBai: 'Hố chắn lối máy khai thác. Đá tròn nằm trong khe, chỉ hất được từ hành lang dưới. Khối đá vuông bít hành lang. Lắp một xe làm cả hai việc.',
      veMaMau: 'Máy khai thác chờ hố được lấp.',
      san: ['#########', '#....u.F#', '#####o###', '#.....F.#', '#########'],
      them: { xichDay: true, thungThem: [{ x: 3, y: 3 }], vatDang: ['.........', '.........', '.....r...', '.........', '.........'] },
      doi: [may('KT', { x: 1, y: 1, huong: 1 }, { co: [{ x: 7, y: 1 }] }), khe({ x: 1, y: 3, huong: 1 }, { son: 'lam', co: [{ x: 6, y: 3 }] })],
      lapRap: lapR2(['xich', 'omni', 'gai'], ['nem'], ['hong-ngoai'], 8, [
        cach('xich', 'nem', null, [KT_15, XICH_15]),
        cach('xich', 'nem', 'hong-ngoai', [KT_15, XICH_HN_15])
      ]),
      maMau: doiBai([KT_15, []]),
      loiSai: [
        { moTa: 'Xích ủi khối đá nhưng quên quay lên: đá tròn không tới hố', baiLam: doiBai([KT_15, ['forward(4)', 'aim_lob(2)']]), phaiCoMa: ['roi-ho'] },
        { moTa: 'Xích hất tầm 1: đá rơi lại khe, hố còn đó', baiLam: doiBai([KT_15, ['forward(4)', 'tr_left()', 'aim(1)', 'lob()', 'tr_right()', 'forward(1)']]), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 37, nhip: 17 },
      goiY: ['Xích tiến vào khối đá vuông là đẩy nó đi một ô.', 'tr_left(): xích quay trái tại chỗ.'],
      cauDo: { doi: null, lap: 'xich+nem', coChe: ['thung-nang', 'ho', 'da-tron', 'nem'], cuu: 'hang', meo: 'lam-cau' }
    }),
    // 16 · cứu người, cứu kịp, lai L9 cẩu + lưới (giỏ cứu hộ): bão làm hố sâu ngập nước, thợ mỏ kẹt dưới đáy ô (4, 4), vách hố dựng đứng. Bệ cẩu ở mép hố (hàng 2), cần chỉ lên:
    //      toạ độ hố (r, c) = (4, 4), quay abs(r - 2) = 2 nấc xuống, vớt, quay một nấc sang phải đặt lên bờ (6, 2). Máy khai thác R1 hất đá tròn lấp hố trên lối về trạm cứu.
    //      Cách hai rẻ hơn (xe tời bờ L3): hai bánh + lưới quay đầu, kéo người lên ô nước sát bờ, lùi nhường ô.
    man9('lap-mo-da', 6, 'cung-co', {
      ten: 'Thợ mỏ dưới hố ngập',
      mucTieu: 'cuu-nguoi',
      deBai: 'Hố sâu ngập nước, thợ mỏ kẹt dưới đáy ô (4, 4). Lắp robot ở mép hố: vớt thợ mỏ lên bờ. Máy khai thác lấp hố trên lối về trạm cứu.',
      veMaMau: 'Cần cẩu đang chỉ lên. Hố ở hàng 4, bệ ở hàng 2.',
      san: ['##########', '#......u.#', '####.#.o##', '####~##.##', '####~#####', '##########'],
      them: { nguoi: [{ x: 4, y: 4 }], tramCuu: [{ x: 8, y: 1 }], vatDang: ['..........', '..........', '.......r..', '..........', '..........', '..........'] },
      doi: [may('KT', { x: 7, y: 3, huong: 0 }), khe({ x: 4, y: 2, huong: 0, nac: 0, tam: 2 }, { son: 'lam' })],
      lapRap: lapR2(['cau', 'hai-banh'], ['day-keo'], [], 9, [
        cach('cau', 'day-keo', null, [KT_16, CAU_16]),
        cach('hai-banh', 'day-keo', null, [KT_16, XE_16])
      ], { moLai: ['L9', 'L3'] }),
      maMau: doiBai([KT_16, ['ho = (4, 4)', 'r, c = ho']]),
      loiSai: [
        { moTa: 'range(2 - r) rỗng: cần không quay, vớt hụt', baiLam: doiBai([KT_16, ['ho = (4, 4)', 'r, c = ho', 'for i in range(2 - r):', '    swing_right()', 'cast_net()', 'swing_left()', 'drop_net()']]), phaiCoMa: ['chua-cuu-nguoi'] },
        { moTa: 'Máy khai thác không lấp hố: thợ mỏ không có lối về trạm', baiLam: doiBai([[], CAU_16]), phaiCoMa: ['chua-cuu-nguoi'] }
      ],
      sao: { o: 14, nhip: 9 },
      goiY: ['r, c = ho: tách toạ độ hố thành hàng r, cột c.', 'abs(4 - 2) = 2: quay hai nấc.', 'cast_net() vớt người ở đầu cần, drop_net() đặt người lên bờ.'],
      cauDo: { doi: null, lap: 'cau+day-keo', coChe: ['nuoc', 'nguoi', 'gio', 'ho', 'da-tron'], cuu: 'nguoi', meo: 'cuu-kip' }
    }),
    // 17 · chờ tín hiệu, omni + vòi phun: bão làm kẹt hệ cửa hầm, một nút điều khiển hai cửa: phun trúng nút thì cửa trước (đang mở) đóng, cửa sau (đang đóng) mở.
    //      Máy khai thác phải qua cửa trước rồi mới tới cửa sau: phun sớm là cửa trước đóng ập trước mũi, không phun là cửa sau còn đóng.
    //      Robot đứng dưới lối hầm, cảm biến hồng ngoại nhìn lên: warm() là máy khai thác (máy nóng) vừa qua cửa trước, ngay trên đầu; phun ra sau trúng nút. Cách hai: hai bánh (rẻ hơn).
    man9('lap-mo-da', 7, 'van-dung', {
      ten: 'Một nút hai cửa',
      deBai: 'Một nút điều khiển hai cửa hầm: phun trúng nút thì cửa đang mở đóng lại, cửa đang đóng mở ra. Máy khai thác phải qua cửa mở trước. Lắp robot chờ đúng lúc rồi phun nút.',
      veMaMau: 'Máy khai thác chạy thẳng một mạch, không chờ.',
      san: ['##########', '#..c..C.F#', '####.#####', '####.F####', '####.#####', '####N#####', '##########'],
      noi: [{ nut: { x: 4, y: 5 }, cua: [{ x: 3, y: 1 }, { x: 6, y: 1 }] }],
      doi: [may('KT', { x: 1, y: 1, huong: 1 }, { co: [{ x: 8, y: 1 }] }), khe({ x: 4, y: 3, huong: 0 }, { son: 'lam', co: [{ x: 5, y: 3 }] })],
      lapRap: lapR2(['omni', 'hai-banh'], ['hoi', 'nem'], ['hong-ngoai', 'radar'], 9, [
        cach('omni', 'hoi', 'hong-ngoai', [KT_17, OMNI_17]),
        cach('hai-banh', 'hoi', 'hong-ngoai', [KT_17, XE_17])
      ]),
      maMau: doiBai([KT_17, []]),
      loiSai: [
        { moTa: 'Phun ngay không chờ: cửa trước đóng ập trước mũi máy khai thác', baiLam: doiBai([KT_17, ['spray_back()', 'wait()', 'slide_r(1)']]), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Phun ra trước (spray): tia bay lên lối hầm, không trúng nút', baiLam: doiBai([KT_17, ['while not warm():', '    wait()', 'spray()', 'wait()', 'slide_r(1)']]), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 17, nhip: 9 },
      goiY: ['warm(): vật trước cảm biến đang nóng (máy đang chạy).', 'spray_back(): phun ra sau đuôi.', 'while not warm(): wait(): chờ tới khi thấy máy.'],
      cauDo: { doi: null, lap: 'omni+hoi+hong-ngoai', coChe: ['nut-ban', 'cua', 'hong-ngoai', 'voi-phun'], cuu: 'hang', meo: 'cho-tin-hieu' }
    }),
    // 18 · đọc rồi chọn (ba sân, ôn lưới grid[r][c]), lai L11 drone + nam châm + radar (ra mắt): bãi đá lở, mũi khoan sắt nằm ngay trên hay ngay dưới chỗ robot (mỗi sân một chỗ).
    //      Radar đọc g[0][1] (ô trên): "V" thì lên hút, không thì xuống hút; về chỗ cũ, bay qua rào thấp tới thùng D, thả. Máy khai thác R1 hất quặng vào thùng hầm dưới (song song).
    //      Cách hai: nhện + nam châm + radar (L12) đọc y hệt, không qua rào: vòng hàng trên, co chân chui gầm đá lở (chậm hơn). Xe có bánh kẹp được mũi khoan nhưng vướng rào và gầm thấp.
    man9('lap-mo-da', 8, 'van-dung', {
      ten: 'Mũi khoan trên hay dưới',
      mucTieu: 'dua-vat',
      khung: { chinh: 16, moiHam: 8 },
      deBai: 'Ba sân. Mũi khoan sắt nằm ngay trên hay ngay dưới chỗ robot, mỗi sân một chỗ. Lắp robot đọc radar, hút mũi khoan, mang tới thùng D sau rào.',
      veMaMau: 'R2 chưa có chương trình.',
      san: [san18(true), san18(false), san18(false)],
      them: { vatChat: [vc18(true), vc18(false), vc18(false)], vatDang: [VD_18, VD_18, VD_18] },
      doi: [may('KT', { x: 1, y: 4, huong: 1 }), khe({ x: 2, y: 2, huong: 0 }, { son: 'lam', pin: 20 })],
      lapRap: lapR2(['drone', 'nhen', 'hai-banh'], ['nam-cham', 'kep'], ['radar'], 11, [
        cach('drone', 'nam-cham', 'radar', [KT_18, DRONE_18]),
        cach('nhen', 'nam-cham', 'radar', [KT_18, NHEN_18])
      ], { moLai: ['L11', 'L12'] }),
      maMau: doiBai([KT_18, ['g = radar()']]),
      loiSai: [
        { moTa: 'Điền thẳng chỗ của sân 1 (bay lên): sân 2, 3 mũi khoan nằm dưới', baiLam: doiBai([KT_18, ['go_up()', 'pull_s()', 'go_down()', 'for i in range(3):', '    go_right()', 'magnet_off()', 'wait()']]), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Đọc g[1][0] (ô bên trái) thay vì g[0][1] (ô trên)', baiLam: doiBai([KT_18, ['g = radar()', 'if g[1][0] == "V":', '    go_up()', '    pull_s()', '    go_down()', 'else:', '    go_down()', '    pull_s()', '    go_up()', 'for i in range(3):', '    go_right()', 'magnet_off()', 'wait()']]), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 24, nhip: 9 },
      goiY: ['g[0][1]: hàng 0 (trên), cột 1 (giữa) = ô ngay trên robot.', 'pull_s(): bật nam châm hút. magnet_off(): thả.'],
      cauDo: { doi: null, lap: 'drone+nam-cham+radar', coChe: ['sat', 'rao', 'radar', 'nem', 'mui-khoan'], cuu: 'hang', meo: 'doc-roi-chon' }
    }),
    // 19 · đọc rồi chọn (ba sân), hai cách lắp, nhắc gói 3 (clear_iron của Bãi tái chế): mũi khoan sắt rơi giữa lối máy khai thác, mỗi sân một cột. R2 đi hàng trên, đọc ô ngay dưới.
    //      Cách một bánh gai + máy ném + radar: g[2][1] == "V" thì quay xuống xúc mũi khoan vào rổ. Cách hai nhện + nam châm + cảm biến từ (mặt quay xuống):
    //      front_metal() thì bước xuống, clear_iron("U") hút rồi bước lên, thả ở hàng trên. Máy khai thác R1 chờ rồi chạy qua lối đã dọn tới cờ.
    man9('lap-mo-da', 9, 'van-dung', {
      ten: 'Ném hay hút',
      hamCuaEmCan: HAM_EM.concat(['clear_iron']),
      deBai: 'Ba sân. Mũi khoan sắt rơi giữa lối máy khai thác, mỗi sân một cột. Lắp robot đi hàng trên, đọc ô ngay dưới, dọn mũi khoan. Bánh gai xúc vào rổ, hay nhện hút lên?',
      veMaMau: 'Máy khai thác chờ 16 nhịp rồi chạy.',
      san: [san19(3), san19(5), san19(4)],
      them: { vatChat: [vc19(3), vc19(5), vc19(4)] },
      doi: [may('KT', { x: 1, y: 2, huong: 1 }, { co: [{ x: 8, y: 2 }] }), khe({ x: 1, y: 1, huong: 2 }, { son: 'lam', co: [{ x: 7, y: 1 }] })],
      lapRap: lapR2(['gai', 'nhen'], ['nem', 'nam-cham'], ['radar', 'tu'], 10, [
        cach('gai', 'nem', 'radar', [KT_19, GAI_19]),
        cach('nhen', 'nam-cham', 'tu', [KT_19, NHEN_19])
      ], { moLai: ['L12'] }),
      maMau: doiBai([KT_19, []]),
      loiSai: [
        { moTa: 'Điền thẳng cột của sân 1 (cột 3): sân 2, 3 mũi khoan còn trên lối', baiLam: doiBai([KT_19, ['turn_left()', 'forward(2)', 'turn_right()', 'load()', 'wait()', 'turn_left()', 'forward(4)']]), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đọc g[0][1] (ô trên) thay vì g[2][1] (ô dưới): không thấy mũi khoan', baiLam: doiBai([KT_19, ['turn_left()', 'for i in range(6):', '    forward(1)', '    g = radar()', '    if g[0][1] == "V":', '        turn_right()', '        load()', '        wait()', '        turn_left()']]), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 26, nhip: 28 },
      goiY: ['g[2][1]: hàng 2 (dưới), cột 1 (giữa) = ô ngay dưới robot.', 'clear_iron(d): hút sắt rồi bước d (hàm em viết ở Bãi tái chế).'],
      cauDo: { doi: null, lap: 'gai+nem+radar', coChe: ['sat', 'radar', 'nem', 'nam-cham', 'mui-khoan'], cuu: 'hang', meo: 'doc-roi-chon' }
    }),
    // 20 · song ca đoạn 7 (Bè 1: 1 1 5 5 6 6 5 5 | Bè 2: 3 3 1 3 4 4 3 3, như cuu-mo-da.10), giữ cho gói 10 ghép bài; mỗi bạn gọi play_part (gói 1).
    //      Máy khai thác lắp loa hát bè 1 trên nền đá khô; R2 tự lắp đứng trên dốc bùn hát bè 2. Cách một bánh gai + loa, cách hai bánh omni + loa (đắt hơn); drone không mang nổi loa (bẫy).
    //      Bảng ghi "robot hát phải đứng vững không trượt" (đi trên bùn vừa đi vừa hát, tới cờ): lõi chưa làm được, màn đội choi-dieu có ô F thì bắt mọi xe tới cờ
    //      (dieuToiCo) mà xeToiCo chỉ ghi khi mục tiêu là toi-co, nên không bao giờ thắng (ghi trong báo cáo M9M7). Khối đá rỗng cuối dốc vỡ khi nghe nốt Fa của bè 2 (chỉ để nhìn).
    man9('lap-mo-da', 10, 'trum', {
      ten: 'Song ca trên dốc',
      mucTieu: 'choi-dieu',
      hamCuaEmCan: ['play_note', 'play_part'],
      deBai: 'Màn cuối mỏ đá: song ca đoạn 7. Máy khai thác hát bè 1. Lắp loa cho bạn đứng trên dốc bùn hát bè 2. Drone không mang nổi loa: chọn thân khác.',
      veMaMau: 'Bè 2 mới có một nốt.',
      san: ['#######', '#.....#', '#.III.#', '#######'],
      doi: [may('KT', { x: 1, y: 1, huong: 1 }, { tay: 'loa', boHam: ['load', 'throw', 'aim', 'radar', 'shape', 'diag_left', 'diag_right'], themHam: ['note', 'beat'], phatNot: true }),
        khe({ x: 3, y: 2, huong: 1 }, { son: 'lam' })],
      them: { dieu: { r1: '1 1 5 5 6 6 5 5', r2: '3 3 1 3 4 4 3 3' }, daChuong: [{ x: 5, y: 2, not: 4, ben: 1 }] },
      lapRap: lapR2(['gai', 'omni', 'drone'], ['loa'], [], 7, [
        cach('gai', 'loa', null, [KT_20, R2_20]),
        cach('omni', 'loa', null, [KT_20, R2_20])
      ]),
      maMau: doiBai([KT_20, ['play_note(3)']]),
      loiSai: [
        { moTa: 'Bè 2 mới phát một nốt', baiLam: doiBai([KT_20, ['play_note(3)']]), phaiCoMa: ['lo-nhip'] },
        { moTa: 'R2 hát nhầm bè 1', baiLam: doiBai([KT_20, KT_20]), phaiCoMa: ['sai-not'] },
        { moTa: 'R2 chờ một nhịp rồi mới hát: lệch nhịp với bè 1', baiLam: doiBai([KT_20, ['wait()'].concat(R2_20)]), phaiCoMa: ['lo-nhip'] }
      ],
      sao: { o: 7, nhip: 10 },
      goiY: ['Bè 2: play_part([3, 3, 1, 3, 4, 4, 3, 3]).', 'Hai bạn bắt đầu cùng một nhịp.', 'Drone chở nhẹ, không mang nổi loa.'],
      cauDo: { doi: null, lap: 'gai+loa', coChe: ['loa', 'da-chuong', 'bun', 'mo-da'], cuu: null, meo: 'song-song' }
    }),
  ];

  ManHoc.manCuuMoDa = DS_MAN;
})();
