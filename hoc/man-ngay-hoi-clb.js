/* ============================================================================
   man-ngay-hoi-clb.js - Mùa 9 CLB Sáng Tạo: Gói 10 "Ngày hội" (dựng lại 17/11, M9M10, theo khuôn G7 / G8 / G9)
   20 màn: tong-hop-clb (chọn đội, mỗi màn 2–3 sân) + trum-mua-clb (R1 đặt sẵn, R2 Luna tự lắp, mỗi màn 2–3 sân).
   MỘT chương trình chạy đúng MỌI sân: khác biệt giữa các sân do sân cấp qua cảm biến (listen / hear / color / radar / front_metal / front_clear …)
   hay do chương trình đủ tổng quát. Mỗi sân là một nơi cũ (Kho, Nhà máy, Bãi tái chế, Cảng, Bến, Nông trại, Mỏ đá, Hang động, CLB).
   Ôn Python: list bài nhạc (ghép đoạn), cộng ôn bù and / or, abs, %, //, set (bảng "màn → Python ôn" ở ghi chú MUA-9-200-CAU-DO.md mục G10).
   Ném đá: luật NÉM ĐÀ mùa 9 (aim chỉ 1, 2; aim_lob(3) tự chạy đà rồi lùi về chỗ cũ).
   Bài hát "Kìa con bướm vàng" ghép từ đoạn song ca màn 10 của G1–G9 (bè 1 | bè 2):
     G1 1 1 5 5 6 6 5 5 | 1 3 5 3 4 4 1 1      G2 4 4 3 3 2 2 1 1 | 2 4 1 3 5 5 1 1      G3 5 5 4 4 3 3 2 2 | 3 1 2 4 1 3 5 5
     G4 5 5 4 4 3 3 2 2 | 1 3 2 4 3 5 4 2      G5 1 1 5 5 6 6 5 5 | 3 1 3 5 4 6 5 3      G6 4 4 3 3 2 2 1 1 | 6 2 5 1 4 5 3 1
     G7 1 1 5 5 6 6 5 5 | 3 3 1 3 4 4 3 3      G8 4 4 3 3 2 2 1 1 | 6 6 5 5 4 4 3 3      G9 5 5 4 4 3 3 2 2 | 7 7 6 6 5 5 4 4
   Câu đố: hoc/MUA-9-200-CAU-DO.md mục G10 (ghi chú "Đã dựng 17/11 (M9M10)": các chỗ lệch so với bảng).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  /* ---- M9M10: khung màn mùa 9 (chép từ man-cuu-clb.js) ------------------------------------------ */
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

  /** tong-hop-clb.1 (hai sân: Kho + Nhà máy): sân 1 Kho có dải bùn trơn trước khúc quẹo (sau bùn là hố); sân 2 Nhà máy có cửa C trên lối, nút bắn N mở cửa.
   *  Khe A (lối trên) tiến hai ô, quay xuống, tiến hai ô về cờ: chỉ bánh gai đứng lại được trên bùn để quay (xe khác trượt xuống hố).
   *  Khe B phun một phát lên trên (sân 1 trúng tường, sân 2 trúng nút N: cửa mở), quay phải, về cờ. Một chương trình qua cả hai sân. */
  var HD_1 = ['forward(2)', 'turn_right()', 'forward(2)'];
  var CU_1 = ['spray()', 'wait()', 'tr_right()', 'forward(1)'];
  var SAN_1_KHO = ['##########', '#.IIu#####', '###.######', '###F##.F##', '##########'];
  var SAN_1_NM = ['##########', '#...##N###', '###C##.###', '###F##.F##', '##########'];

  /** tong-hop-clb.2 (hai sân: Bãi tái chế + Cảng): sắt vụn rơi trên ray cần cẩu (mỗi sân hai thanh, chỗ khác nhau); container chờ ở góc ray, ghe đậu ở boong T tới hết nhịp 47.
   *  Nhện (khe B, mặt quay phải) bò dọc ray: ô bên phải có sắt (front_metal()) thì bước lên, pull_deliver("D") (gói 3) thả sắt xuống sân, bò lên lại; hết ray thì xuống sân.
   *  Cần cẩu (khe A) chờ ray trống, chạy ray sang phải, móc container, chạy về, quay cần lên, hạ lên ghe. Viết thẳng chỗ sắt của sân 1 thì sân 2 vướng sắt. */
  var PL_2 = ['for i in range(4):', '    go_right()', '    pull_deliver("D")', '    go_up()', 'go_down()'];
  function cc2(cho) { return ['wait_n(' + cho + ')', 'rail(6)', 'pick_up()', 'rail(-6)', 'swing_right()', 'swing_right()', 'set_down()', 'wait()']; }
  function san2() { return ['#########', '#T~~~~~~#', '#RRRRRRR#', '#.......#', '#########']; }
  var TAU_2 = { o: [{ x: 1, y: 1 }], co: 47, vang: 60 };
  function sat2(a, b) { return [{ x: a, y: 2, chat: 'sat' }, { x: b, y: 2, chat: 'sat' }]; }

  /** tong-hop-clb.3 (hai sân: Bến sông + Nông trại): sân 1 sông, sân 2 mương tưới giữa hai luống; cả hai sân có bè B trôi ở cuối kênh, bến q trước mũi khe A.
   *  Xuồng (khe B) buộc bè sau đuôi (lưới dài 1), chạy năm ô kéo bè vào bến q: cầu phao. Xe cứu hỏa (khe A) chờ cầu, qua cầu, quay phải.
   *  Cây đổ / kiện rơm (thùng nặng H) nằm trên lối, mỗi sân cách một khác: k = distance() (hồng ngoại đếm ô trống) rồi forward(k + 1) ủi thùng vào ô D. */
  var CU_3 = ['wait_n(6)', 'forward(2)', 'tr_right()', 'k = distance()', 'forward(k + 1)'];
  var XU_3 = ['set_length(1)', 'cast_net("back")', 'wait()', 'forward(5)', 'drop_net()', 'wait()'];
  var SAN_3_BEN = ['#########', '##..HD###', '#~q~~~~B#', '#......##', '#########'];
  var SAN_3_NT = ['#########', '##....HD#', '#~q~~~~B#', '#.gggg.##', '#########'];

  /** tong-hop-clb.4 (hai sân: Mỏ đá + Hang động): lối trên của xe hang động có hố sụt ở cột 5; lối dưới của máy khai thác bị tượng đá chuông chắn ở cột 7.
   *  Máy khai thác hất đá tròn trước mũi lấp hố lối trên (lob(), gói 7), quay phải, chờ tượng vỡ rồi về cờ. Xe hang động qua hố vừa lấp, dừng trên tượng (cách 2 ô),
   *  nghe nốt, hát lại: tượng vỡ; về cờ. Mỗi sân tượng một nốt (sân 1 nốt 3, sân 2 nốt 6), sân 2 lối trên là đá vôi ướt (bánh gai bám). */
  var HD_4 = ['forward(6)', 'play_note(listen())', 'forward(1)'];
  var KT_4 = ['lob()', 'turn_right()', 'wait_n(2)', 'forward(3)'];
  var VD_4 = ['..........', '..........', '.....r....', '..........', '..........'];
  var SAN_4_MO = ['##########', '#....u..F#', '#####o####', '#####...F#', '##########'];
  var SAN_4_HANG = ['##########', '#.IIIu..F#', '#####o####', '#####...F#', '##########'];

  /** tong-hop-clb.5 (ba sân, đọc rồi chọn): lối trên từ (1, 1) tới cờ (8, 1), ô (6, 1) mỗi sân một thứ chắn: sân 1 Nhà máy cửa C (nút đè M ở (6, 2)), sân 2 Mỏ đá hố sụt (đá tròn ở (6, 2)), sân 3 Hang tượng đá chuông.
   *  Xe hang động tiến hai ô, nghe: có nốt (n > 0) thì hát (tượng vỡ), rồi về cờ. Máy khai thác (6, 3) hất đá lên lối trên
   *  (sân 2 lấp hố; sân khác không có gì để hất), tiến lên (6, 2) (sân 1 đè nút: cửa mở), chờ xe qua, lùi, sang cờ (5, 3). Đôi khác qua được một, hai sân: chỉ đôi này qua cả ba. */
  var HD_5 = ['forward(2)', 'n = listen()', 'if n > 0:', '    play_note(n)', 'forward(5)'];
  var KT_5 = ['lob()', 'forward(1)', 'wait_n(1)', 'back()', 'turn_left()', 'forward(1)'];
  var VD_5 = ['..........', '..........', '......r...', '..........', '..........'];
  var SAN_5_HANG = ['##########', '#.......F#', '######.###', '#####F.###', '##########'];
  var SAN_5_MO = ['##########', '#.....u.F#', '######o###', '#####F.###', '##########'];
  var SAN_5_NM = ['##########', '#.....C.F#', '######M###', '#####F.###', '##########'];

  /** tong-hop-clb.6 (hai sân, cứu người): sân 1 bờ sông: người áo phao rơi xuống nước ở (3, 2); sân 2 hầm mỏ: thợ mỏ kẹt ở (2, 1) trong hầm.
   *  Cả hai sân lối về trạm cứu (8, 1) bị tượng đá chuông chắn ở (6, 1), mỗi sân một nốt. Xuồng (khe B, (5, 2) quay trái) tung lưới kéo người về trước mũi:
   *  ô sát bờ, người tự lên bờ (sân 2 lưới vướng vách hầm, không sao). Xe hang động chạy hàng dưới tới (6, 3), nghe nốt tượng, hát: tượng vỡ, người về trạm. */
  var HD_6 = ['forward(5)', 'play_note(listen())'];
  var XU_6 = ['cast_net()', 'wait()'];
  var SAN_6_SONG = ['##########', '#........#', '#~~~~~~###', '#........#', '##########'];
  var SAN_6_HAM = ['##########', '#........#', '#~###~~###', '#........#', '##########'];

  /** tong-hop-clb.7 (ba sân, cứu máy): xe chở hàng cũ của CLB (R3, máy khách khoá) đi từng ô dọc hàng 2 về cờ (9, 2), ô trước bị chắn thì chờ.
   *  Ô (3, 2): kệ sắt đổ (thùng nặng) ở sân 1, 2; ô (6, 2): sân 1 cửa C (nút đè M (6, 3)), sân 2, 3 tượng đá chuông (mỗi sân một nốt). Xe cứu hỏa tiến ủi kệ vào hốc (3, 1), lùi về cờ.
   *  Xe hang động lên ô (6, 3) (sân 1 đè nút giữ cửa), nghe: có nốt thì hát vỡ tượng; chờ máy khách qua rồi sang cờ (7, 3). */
  var R3_7 = ['for i in range(8):', '    while not front_clear():', '        wait()', '    forward(1)'];
  var CU_7 = ['forward(1)', 'back()'];
  var HD_7 = ['forward(1)', 'n = listen()', 'if n > 0:', '    play_note(n)', 'wait_n(5)', 'forward(1)'];
  function san7(h, c, m) { return ['###########', '###.#######', '#..' + h + '..' + c + '..F#', '###F#.' + m + 'F###', '###########']; }

  /** tong-hop-clb.8 (hai sân, lắp tự do): xe chở hàng R1 (đặt sẵn) mang thùng quà từ (2, 1) vào kho D (7, 1). Ô (3, 1) bị chắn: sân 1 Kho thùng gỗ đổ, sân 2 Bãi thanh sắt rơi.
   *  R2 tự lắp một robot dọn được cả hai: từ (1, 3) tới (3, 2), gắp vật chắn, quay phải, đặt vào hốc chứa D (4, 2). Tay kẹp gắp được cả gỗ lẫn sắt (đa năng);
   *  nam châm chỉ hút sắt (sân Kho thua). Cách một: hai bánh + kẹp (rẻ, quay rồi tiến). Cách hai: omni + kẹp trượt ngang (nhanh, đắt). */
  function ch8(cho) { return ['pick()', 'wait_n(' + cho + ')', 'forward(5)', 'drop()']; }
  var BANH_8 = ['turn_right()', 'forward(2)', 'turn_left()', 'forward(1)', 'pick()', 'turn_right()', 'drop()'];
  var OMNI_8 = ['slide_r(2)', 'forward(1)', 'pick()', 'turn_right()', 'drop()'];
  function san8() { return ['##########', '#.oo...D##', '###.D#####', '#........#', '##########']; }

  /** tong-hop-clb.9 (hai sân, tự lắp): kẻ sân cho ngày hội. Drone R1 (đặt sẵn) kẻ vạch đỏ hàng trên (giống nhau hai sân). R2 tự lắp gieo cỏ xanh cách một ô một khóm
   *  dọc hàng dưới; luống sân 1 (Nông trại) dài 6 ô, sân 2 (sân CLB) dài 8 ô: đi tới khi trước mặt hết trống (while front_clear()), đếm i, i % 2 == 0 thì gieo.
   *  Cách một: hai bánh + gieo hạt + khoảng cách (rẻ): quay lên, tiến, quay phải. Cách hai: omni + gieo hạt + khoảng cách: trượt lên một ô (nhanh, đắt). */
  var DR_9 = ['ink("red")', 'pen_down()', 'for i in range(7):', '    go_right()', 'pen_up()', 'wait()'];
  var GIEO_9 = ['ink("green")', 'i = 0', 'while front_clear():', '    if i % 2 == 0:', '        dot()', '    forward(1)', '    i = i + 1'];
  var BANH_9 = ['turn_left()', 'forward(1)', 'turn_right()'].concat(GIEO_9);
  var OMNI_9 = ['slide_left()', 'wait()'].concat(GIEO_9);
  function san9(dai) { var h = '#' + '.'.repeat(dai) + '#'.repeat(9 - dai); return ['##########', '#........#', '##########', h, '#.########', '##########']; }
  function hinh9(dai) { var h = '.'; for (var x = 1; x <= 8; x++) h += (x <= dai && x % 2 === 1) ? 'g' : '.'; return ['..........', '.rrrrrrrr.', '..........', h + '.', '..........', '..........']; }

  /** Đoạn song ca của từng gói (màn 10 G1–G9), bè 1 | bè 2: ghép thành bài "Kìa con bướm vàng". */
  var B1 = { 1: '1 1 5 5 6 6 5 5', 2: '4 4 3 3 2 2 1 1', 3: '5 5 4 4 3 3 2 2', 4: '5 5 4 4 3 3 2 2', 5: '1 1 5 5 6 6 5 5', 6: '4 4 3 3 2 2 1 1', 7: '1 1 5 5 6 6 5 5', 8: '4 4 3 3 2 2 1 1', 9: '5 5 4 4 3 3 2 2' };
  var B2 = { 1: '1 3 5 3 4 4 1 1', 2: '2 4 1 3 5 5 1 1', 3: '3 1 2 4 1 3 5 5', 4: '1 3 2 4 3 5 4 2', 5: '3 1 3 5 4 6 5 3', 6: '6 2 5 1 4 5 3 1', 7: '3 3 1 3 4 4 3 3', 8: '6 6 5 5 4 4 3 3', 9: '7 7 6 6 5 5 4 4' };
  function ds(chuoi) { return '[' + chuoi.split(' ').join(', ') + ']'; }
  /** Dòng Python khai list đoạn: ten = [..]. */
  function khaiDoan(ten, chuoi) { return ten + ' = ' + ds(chuoi); }
  function noiDieu(be, ds) { return ds.map(function (g) { return be[g]; }).join(' '); }

  /** tong-hop-clb.10 (hai sân, song ca, trùm chương 1): tập ghép bốn đoạn đầu (G1 Kho, G2 Nhà máy, G3 Bãi, G4 Cảng). Mỗi bè: bốn list đoạn, nối list (d1 + d2 + d3 + d4) rồi play_part. */
  function be10(be) { return [khaiDoan('d1', be[1]), khaiDoan('d2', be[2]), khaiDoan('d3', be[3]), khaiDoan('d4', be[4]), 'play_part(d1 + d2 + d3 + d4)']; }
  var BE1_10 = be10(B1), BE2_10 = be10(B2);
  var SAN_10 = ['#######', '#RRRRR#', '#~~~~~#', '#######'];

  /** Robot hát đặt sẵn (R1): xe hang động (bánh gai + loa). hat(g, be) = play_part đoạn g của bè be. */
  function hat(g, be) { return 'play_part(' + ds((be === 2 ? B2 : B1)[g]) + ')'; }

  /** trum-mua-clb.1 (hai sân Kho, không dùng xe chở hàng: bảng thân không có hai bánh): xe hang động R1 hát đoạn Kho (bè 1 đoạn 1) trên hành lang trên.
   *  Thùng quà đổ trên lối dưới, mỗi sân cách một khác. R2 tự lắp đi tới khi trước mặt hết trống (while front_clear()), gắp thùng, quay trái, đặt lên kệ D.
   *  Cách một: omni + kẹp + khoảng cách (quay một nhịp, nhanh). Cách hai: xích + kẹp + khoảng cách (rẻ, quay hai nhịp). */
  var HD_11 = [hat(1, 1)];
  var OMNI_11 = ['while front_clear():', '    forward(1)', 'pick()', 'turn_left()', 'drop()'];
  var XICH_11 = ['while front_clear():', '    forward(1)', 'pick()', 'tr_left()', 'drop()'];
  function san11(x) { var h = '#........#'.split(''); h[x] = 'o'; return ['##########', '#........#', '#DDDDDDDD#', h.join(''), '##########']; }

  /** Xe có bánh lắp loa (KE-HOACH dòng G10: robot hát nào cũng là thân có bánh / xuồng + loa): CH bỏ tay kẹp, thêm note / beat. */
  function xeLoa(ma, bd, them) {
    var bo = { CH: ['arm_down', 'arm_up', 'arm_left', 'arm_right', 'grab', 'release'], CU: ['spray', 'spray_back'], KT: ['load', 'throw', 'aim'] }[ma] || [];
    return may(ma, bd, Object.assign({ tay: 'loa', boHam: bo, themHam: ['note', 'beat'], phatNot: true }, them || {}));
  }

  /** trum-mua-clb.2 (hai sân Nhà máy, không dùng xe cứu hỏa: bảng thân không có xích): xe chở hàng lắp loa R1 hát đoạn Nhà máy (bè 1 đoạn 2) rồi chạy qua cửa C về cờ.
   *  Nút bắn N mở cửa nằm trong ngách trên lối giữa, mỗi sân một cột. R2 tự lắp xe có vòi phun: dò ngách bằng cảm biến khoảng cách, phun lên trúng N, lên ngách (cờ của R2).
   *  Cách một: omni + vòi phun + khoảng cách mặt quay lên, trượt phải tới khi trước mặt trống (nhanh). Cách hai: hai bánh + vòi phun + khoảng cách quay phải, tiến tới khi bên trái trống, quay lên (rẻ). */
  var CH_12 = [hat(2, 1), 'forward(7)'];
  var OMNI_12 = ['while not front_clear():', '    slide_r(1)', 'spray()', 'wait()', 'forward(1)'];
  var BANH_12 = ['turn_right()', 'while not left_clear():', '    forward(1)', 'turn_left()', 'spray()', 'wait()', 'forward(1)'];
  function san12(x) { var a = '##########'.split(''), b = a.slice(); a[x] = 'N'; b[x] = 'F'; return ['##########', a.join(''), b.join(''), '#........#', '##########', '#...C...F#', '##########']; }

  /** trum-mua-clb.3 (ba sân Bãi, không dùng nhện bò ray: bảng thân không có nhện): xe cứu hỏa lắp loa R1 hát đoạn Bãi (bè 1 đoạn 3).
   *  Trước mũi R2 là một vật, mỗi sân một loại: sắt, nam châm quay cực N, nam châm quay cực S. Cảm biến từ đọc, chọn cực hút được (sắt: cực nào cũng hút; nam châm: khác cực mới hút), kéo về đích D.
   *  Cách một: omni + nam châm + cảm biến từ, trượt xuống một ô (nhanh). Cách hai: hai bánh + nam châm + cảm biến từ, quay, tiến, quay (rẻ). Ôn if / else, or, so chuỗi ==. */
  var CU_13 = [hat(3, 1)];
  var CHON_CUC_13 = ['if front_metal() or front_pole() == "N":', '    magnet_s()', 'else:', '    magnet_n()', 'wait()'];
  var OMNI_13 = CHON_CUC_13.concat(['slide_right()', 'wait()', 'magnet_off()', 'wait()']);
  var BANH_13 = CHON_CUC_13.concat(['turn_right()', 'forward(1)', 'turn_left()', 'magnet_off()', 'wait()']);
  var SAN_13 = ['#######', '#..o..#', '#.D...#', '#.....#', '#######'];
  function chat13(c) { return ['.......', '...' + c + '...', '.......', '.......', '.......']; }

  /** trum-mua-clb.4 (hai sân Cảng, không dùng cần cẩu: bảng thân không có cẩu): máy khai thác lắp loa R1 hát đoạn Cảng (bè 1 đoạn 4).
   *  Container trôi trên luồng, sân 1 cách xe ở đầu cầu tàu 2 ô, sân 2 cách 3 ô. R2 tự lắp xe bờ + tay lưới: ra đầu cầu tàu, set_length(3) (dây dài nhất), tung lưới kéo container về bến q (ô nước gần xe nhất).
   *  Dây mặc định 2 ô chỉ tới container sân 1. Cách một: omni (trượt ngang, nhanh). Cách hai: hai bánh (rẻ). Không cảm biến (xe bờ không đo được qua mặt nước). */
  var KT_14 = [hat(4, 1)];
  var KEO_14 = ['set_length(3)', 'wait()', 'cast_net()', 'wait()'];
  var OMNI_14 = ['slide_left()', 'wait()', 'slide_left()', 'wait()', 'forward(2)', 'turn_right()'].concat(KEO_14);
  var BANH_14 = ['turn_left()', 'forward(2)', 'turn_right()', 'forward(2)', 'turn_right()'].concat(KEO_14);
  function san14(x) { var a = '#.q~~~~~~#'.split(''); a[x] = 'B'; return ['##########', a.join(''), '#.########', '#........#', '##########']; }

  /** trum-mua-clb.5 (hai sân Bến, không dùng xuồng: bảng thân không có xuồng): xe hang động R1 hát đoạn Bến (bè 1 đoạn 5) trên lối trên.
   *  Người rơi xuống sông, mỗi sân một chỗ; trên bờ ngay chỗ đó có cọc phao đỏ (sàn đỏ). R2 tự lắp xe bờ + tay lưới + cảm biến màu bụng: chạy dọc bờ tới khi color() == "red", tung lưới xuống sông kéo người vào sát bờ; người tự lên bờ về trạm.
   *  Cách một: omni (mặt quay xuống sông, trượt ngang, không quay, nhanh). Cách hai: hai bánh (rẻ, quay hai lần). Ôn while, so chuỗi !=. */
  var HD_15 = [hat(5, 1)];
  var OMNI_15 = ['while color() != "red":', '    slide_left()', '    wait()', 'cast_net()', 'wait()', 'slide_left()', 'wait()'];
  var BANH_15 = ['turn_left()', 'while color() != "red":', '    forward(1)', 'turn_right()', 'cast_net()', 'wait()', 'turn_left()', 'forward(1)'];
  function san15(x) { var b = '#........#'.split(''); b[x] = 'r'; return ['##########', '#........#', b.join(''), '#~~~~~~~~#', '#~~~~~~~~#', '##########']; }

  /** trum-mua-clb.6 (hai sân Nông trại, không dùng drone: bảng thân không có drone): xe hang động R1 hát đoạn Nông trại (bè 1 đoạn 6) trên lối trên.
   *  Luống mỗi sân dài khác nhau (7 ô, 9 ô). Gieo MỘT cây ở giữa luống: đứng ở đầu luống, k = distance() (hồng ngoại: số ô trống tới cuối luống), đi k // 2 ô rồi gieo.
   *  Cách một: omni + gieo hạt + hồng ngoại (trượt lên luống, không quay, nhanh). Cách hai: hai bánh + gieo hạt + hồng ngoại (rẻ, quay hai lần). Nhện không gắn được hồng ngoại. Ôn // (chia lấy phần nguyên). */
  var HD_16 = [hat(6, 1)];
  var GIEO_16 = ['ink("green")', 'k = distance()', 'forward(k // 2)', 'dot()', 'wait()'];
  var OMNI_16 = ['slide_left()', 'wait()'].concat(GIEO_16);
  var BANH_16 = ['turn_left()', 'forward(1)', 'turn_right()'].concat(GIEO_16);
  function san16(dai) { return ['###########', '#.........#', '###########', '#' + '.'.repeat(dai) + '#'.repeat(9 - dai) + '#', '#.#########', '###########']; }
  function hinh16(dai) { var h = '...........'.split(''); h[1 + Math.floor((dai - 1) / 2)] = 'g'; return ['...........', '...........', '...........', h.join(''), '...........', '...........']; }

  function man9(chuong, so, hang, cfg) {
    var r1 = cfg.doi[0];
    var m = {
      chuong: chuong, so: so, ten: cfg.ten, hang: hang, vo: cfg.vo || 'kho-hang', daLapHo: true, nhipTheo: 'tong',
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
       CHƯƠNG 1: tong-hop-clb (10 màn, mỗi màn 2–3 sân, chọn đội)
       ======================================================================== */
    // 1 · nhiều sân, hai sân Kho (G1: bùn trơn, hố) + Nhà máy (G2: nút bắn N, cửa C, vòi phun). Một đôi qua được cả bùn lẫn cửa:
    //     bánh gai đứng lại trên bùn để quay (xe khác trượt xuống hố), xe cứu hỏa phun nút mở cửa. Bẫy: xe chở hàng (trượt trên bùn, không phun).
    //     Viết thẳng theo sân 1 (bỏ phát phun vì sân 1 không có cửa) thì sân 2 thua.
    man9('tong-hop-clb', 1, 'lam-quen', {
      ten: 'Bùn ở Kho, cửa ở Nhà máy',
      deBai: 'Ngày hội mở màn! Hai sân: Kho có dải bùn trơn, Nhà máy có cửa đóng và nút bắn. Chọn hai bạn, viết MỘT chương trình qua được cả hai sân.',
      veMaMau: 'Khe B chưa làm gì: sân Nhà máy cửa còn đóng.',
      san: [SAN_1_KHO, SAN_1_NM],
      them: { noi: [[], [{ nut: { x: 6, y: 1 }, cua: [{ x: 3, y: 2 }] }]] },
      doi: [khe({ x: 1, y: 1, huong: 1 }, { co: [{ x: 3, y: 3 }] }), khe({ x: 6, y: 3, huong: 0 }, { co: [{ x: 7, y: 3 }] })],
      chonDoi: {
        menu: ['HD', 'CU', 'CH'],
        cachMau: [{ chon: ['HD', 'CU'], ghiChu: 'đôi tốt', loiGiai: doiBai([HD_1, CU_1]) }]
      },
      maMau: doiBai([HD_1, ['tr_right()', 'forward(1)']]),
      loiSai: [
        { moTa: 'Chạy đúng sân 1, thua sân 2: khe B không phun (sân Kho không có cửa), sân Nhà máy cửa đóng', baiLam: doiBai([HD_1, ['tr_right()', 'forward(1)']]), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Khe A tiến ba ô rồi mới quay: sân Kho rơi hố', baiLam: doiBai([['forward(3)', 'turn_right()', 'forward(2)'], CU_1]), phaiCoMa: ['roi-ho'] },
        { moTa: 'Khe A quay trái: sân Kho đâm tường, không tới cờ', baiLam: doiBai([['forward(2)', 'turn_left()', 'forward(2)'], CU_1]), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 20, nhip: 12 },
      goiY: ['Mỗi sân chạy cùng một chương trình: thiếu việc của sân nào thì sân đó thua.', 'Bánh gai bung gai bám bùn trơn; xe khác vào bùn là trượt thẳng.', 'Tia phun trúng nút N thì cửa C đổi (đóng ↔ mở).'],
      cauDo: { doi: ['HD', 'CU'], lap: null, coChe: ['bun', 'ho', 'nut-ban', 'cua', 'kho', 'nha-may', 'nhieu-san'], cuu: 'hang', meo: 'nhieu-san' }
    }),
    // 2 · nhiều sân, hai sân Bãi tái chế (G3: sắt, nhện, pull_deliver) + Cảng (G4: ray, container, ghe). Sắt rơi trên ray, mỗi sân một chỗ: nhện đọc front_metal() dọn từng thanh,
    //     cẩu chạy ray đưa container lên ghe. Bẫy: drone (bay qua ray nhưng không có nam châm). Mọi khe trên dải ray.
    man9('tong-hop-clb', 2, 'lam-quen', {
      ten: 'Sắt trên ray, container lên ghe',
      mucTieu: 'giao-tau', vo: 'cang',
      hamCuaEmCan: HAM_EM.concat(['pull_deliver']),
      khung: { chinh: 14, moiHam: 8 },
      deBai: 'Hai sân: Bãi tái chế và Cảng. Bão rải sắt lên ray cần cẩu, mỗi sân một chỗ. Chọn hai bạn: ai dọn sắt khỏi ray, ai đưa container lên ghe? Một chương trình qua cả hai sân.',
      veMaMau: 'Nhện chưa biết chỗ nào có sắt.',
      san: [san2(), san2()],
      them: { vatThem: [sat2(3, 5), sat2(4, 6)], chong: [[{ x: 7, y: 3, cont: [{ so: 13 }] }], [{ x: 7, y: 3, cont: [{ so: 8 }] }]], tau: [[TAU_2], [TAU_2]], giao: [[{ tau: 0, so: [13] }], [{ tau: 0, so: [8] }]] },
      doi: [khe({ x: 1, y: 2, nac: 2, tam: 1 }), khe({ x: 2, y: 2 })],
      chonDoi: {
        menu: ['CC', 'PL', 'DR'],
        cachMau: [{ chon: ['CC', 'PL'], ghiChu: 'đôi tốt', loiGiai: doiBai([cc2(30), PL_2]) }]
      },
      maMau: doiBai([cc2(30), ['for i in range(4):', '    go_right()', 'go_down()']]),
      loiSai: [
        { moTa: 'Chạy đúng sân 1, thua sân 2: nhện dọn thẳng cột 3 và 5 (chỗ sắt sân 1), sân 2 sắt ở cột 4 và 6 còn trên ray', baiLam: doiBai([cc2(30), ['go_right()', 'pull_deliver("D")', 'go_up()', 'go_right()', 'go_right()', 'pull_deliver("D")', 'go_up()', 'go_right()', 'go_down()']]), phaiCoMa: ['het-ray'] },
        { moTa: 'Nhện không xuống sân: đứng chắn ray', baiLam: doiBai([cc2(30), PL_2.slice(0, -1)]), phaiCoMa: ['het-ray'] },
        { moTa: 'Cẩu không chờ: vướng sắt trên ray', baiLam: doiBai([cc2(30).slice(1), PL_2]), phaiCoMa: ['het-ray'] }
      ],
      sao: { o: 35, nhip: 112 },
      goiY: ['front_metal(): ô bên phải nhện có sắt không.', 'pull_deliver("D"): hút sắt dưới bụng, bước xuống, thả.', 'Thanh sắt nằm trên ray thì bệ cẩu không chạy qua được.'],
      cauDo: { doi: ['CC', 'PL'], lap: null, coChe: ['sat', 'ray', 'container', 'ghe', 'cam-bien', 'nhieu-san'], cuu: 'hang', meo: 'nhieu-san' }
    }),
    // 3 · nhiều sân, hai sân Bến sông (G5: bè, bến q, cầu phao) + Nông trại (G6: mương tưới, luống, cây đổ). Xuồng kéo bè làm cầu ở cả hai sân;
    //     xe cứu hỏa qua cầu, đo bằng hồng ngoại (distance()) xem kiện rơm (thùng nặng) cách mấy ô, ủi vào ô D. Bẫy: xe chở hàng (không ủi được thùng nặng).
    man9('tong-hop-clb', 3, 'lam-quen', {
      ten: 'Cầu phao và kiện rơm',
      vo: 'song',
      mucTieu: 'day-thung',
      deBai: 'Hai sân: Bến sông và mương tưới ở Nông trại. Cả hai có bè trôi ở cuối kênh; bên kia kênh có một kiện rơm nặng chắn lối, mỗi sân một chỗ. Chọn hai bạn: ai kéo bè làm cầu, ai qua cầu ủi kiện rơm vào ô D?',
      veMaMau: 'Xuồng chưa kéo bè.',
      san: [SAN_3_BEN, SAN_3_NT],
      doi: [khe({ x: 2, y: 3, huong: 0 }, { batDauNuoc: { x: 5, y: 2, huong: 3 } }), khe({ x: 6, y: 3, huong: 3 }, { batDauNuoc: { x: 6, y: 2, huong: 3 } })],
      chonDoi: {
        menu: ['XU', 'CU', 'CH'],
        cachMau: [{ chon: ['CU', 'XU'], ghiChu: 'đôi tốt', loiGiai: doiBai([CU_3, XU_3]) }]
      },
      maMau: doiBai([['wait_n(6)', 'forward(2)', 'tr_right()'], ['set_length(1)']]),
      loiSai: [
        { moTa: 'Điền thẳng dữ liệu sân 1 (forward(2)): sân 2 kiện rơm cách 3 ô, chưa vào D', baiLam: doiBai([['wait_n(6)', 'forward(2)', 'tr_right()', 'forward(2)'], XU_3]), phaiCoMa: ['chua-day-thung'] },
        { moTa: 'Xe lên cầu khi bè chưa tới: đâm mặt nước', baiLam: doiBai([['wait_n(2)', 'forward(2)', 'tr_right()', 'k = distance()', 'forward(k + 1)'], XU_3]), phaiCoMa: ['chua-day-thung'] },
        { moTa: 'Lưới dài 2 (quên set_length(1)): lưới vươn quá bè, không bắt được', baiLam: doiBai([CU_3, ['cast_net("back")', 'wait()', 'forward(5)', 'drop_net()', 'wait()']]), phaiCoMa: ['chua-day-thung'] }
      ],
      sao: { o: 25, nhip: 32 },
      goiY: ['set_length(1): lưới dài 1 ô; cast_net("back"): tung lưới ra sau đuôi.', 'Bè nằm trên bến q là cầu phao.', 'distance(): số ô trống trước mũi; xích tiến vào thùng nặng thì đẩy thùng đi một ô.'],
      cauDo: { doi: ['CU', 'XU'], lap: null, coChe: ['nuoc', 'be', 'luoi', 'thung-nang', 'hong-ngoai', 'luong', 'nhieu-san'], cuu: 'hang', meo: 'nhieu-san' }
    }),
    // 4 · nhiều sân, hai sân Mỏ đá (G7: đá tròn, hố, lob) + Hang động (G8: đá chuông, listen, đá vôi ướt). Mỗi bạn dọn lối cho bạn kia:
    //     máy khai thác hất đá lấp hố lối trên, xe hang động hát vỡ tượng chắn lối dưới. Mỗi sân tượng một nốt (sân cấp qua listen()). Bẫy: xe cứu hỏa (không hất đá, không hát).
    man9('tong-hop-clb', 4, 'luyen', {
      ten: 'Đá tròn và đá chuông',
      vo: 'mo-da',
      deBai: 'Hai sân: Mỏ đá và Hang động. Lối trên có hố sụt, lối dưới có tượng đá chuông; mỗi sân tượng một nốt. Chọn hai bạn dọn lối cho nhau, rồi cả hai về cờ.',
      veMaMau: 'Hố và tượng còn chắn hai lối.',
      san: [SAN_4_MO, SAN_4_HANG],
      them: { vatDang: [VD_4, VD_4], daChuong: [[{ x: 7, y: 3, not: 3, ben: 1 }], [{ x: 7, y: 3, not: 6, ben: 1 }]] },
      doi: [khe({ x: 1, y: 1, huong: 1 }, { co: [{ x: 8, y: 1 }] }), khe({ x: 5, y: 3, huong: 0 }, { co: [{ x: 8, y: 3 }] })],
      chonDoi: {
        menu: ['HD', 'KT', 'CU'],
        cachMau: [{ chon: ['HD', 'KT'], ghiChu: 'đôi tốt', loiGiai: doiBai([HD_4, KT_4]) }]
      },
      maMau: doiBai([['forward(6)'], ['lob()']]),
      loiSai: [
        { moTa: 'Điền thẳng nốt sân 1 (play_note(3)): sân Hang tượng nốt 6, không vỡ', baiLam: doiBai([['forward(6)', 'play_note(3)', 'forward(1)'], KT_4]), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Máy khai thác không chờ tượng vỡ: đâm tượng, đứng lại', baiLam: doiBai([HD_4, ['lob()', 'turn_right()', 'forward(3)']]), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Hất đá tầm 1 (aim(1)): đá rơi lại trước mũi, hố còn đó', baiLam: doiBai([HD_4, ['aim(1)'].concat(KT_4)]), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 27, nhip: 19 },
      goiY: ['lob(): nạp vật trước mũi rồi ném xa 2 ô; đá rơi xuống hố thì lấp hố.', 'listen(): nốt của đá chuông gần nhất; loa phá đá trong tầm 3 ô.', 'Mỗi sân tượng một nốt: đừng điền thẳng.'],
      cauDo: { doi: ['HD', 'KT'], lap: null, coChe: ['ho', 'da-tron', 'nem', 'da-chuong', 'not', 'da-uot', 'nhieu-san'], cuu: 'hang', meo: 'nhieu-san' }
    }),
    // 5 · đọc rồi chọn, ba sân Nhà máy (cửa, nút đè) + Mỏ đá (hố, đá tròn) + Hang (đá chuông), bảng 4 cỗ máy: cùng một ô chắn lối, mỗi sân một thứ.
    //     Xe hang động nghe (if n > 0: hát), máy khai thác hất đá rồi đè nút. Xe cứu hỏa thay máy khai thác: qua sân 1, 3, kẹt hố sân 2; xe chở hàng thay xe hang động: kẹt tượng sân 3.
    man9('tong-hop-clb', 5, 'luyen', {
      ten: 'Một ô, ba thứ chắn',
      vo: 'mo-da',
      deBai: 'Ba sân: Nhà máy, Mỏ đá, Hang động. Cùng một ô trên lối trên, mỗi sân một thứ chắn: cửa đóng, hố sụt, tượng đá chuông. Chọn hai bạn qua được cả ba sân. Đôi nào cũng qua được một sân, chỉ một đôi qua cả ba.',
      veMaMau: 'Xe hang động chưa biết sân nào có tượng.',
      san: [SAN_5_NM, SAN_5_MO, SAN_5_HANG],
      them: { daChuong: [[], [], [{ x: 6, y: 1, not: 4, ben: 1 }]], vatDang: [null, VD_5, null], noi: [[{ nut: { x: 6, y: 2 }, cua: [{ x: 6, y: 1 }] }], [], []] },
      doi: [khe({ x: 1, y: 1, huong: 1 }, { co: [{ x: 8, y: 1 }] }), khe({ x: 6, y: 3, huong: 0 }, { co: [{ x: 5, y: 3 }] })],
      chonDoi: {
        menu: ['HD', 'KT', 'CU', 'CH'],
        cachMau: [{ chon: ['HD', 'KT'], ghiChu: 'đôi tốt', loiGiai: doiBai([HD_5, KT_5]) }]
      },
      maMau: doiBai([['forward(2)', 'n = listen()'], ['lob()']]),
      loiSai: [
        { moTa: 'Chạy đúng sân Hang, thua hai sân kia: hát thẳng play_note(listen()) (sân Mỏ đá, Nhà máy không có tượng, listen() trả 0)', baiLam: doiBai([['forward(2)', 'play_note(listen())', 'forward(5)'], KT_5]), phaiCoMa: ['not-sai'] },
        { moTa: 'Máy khai thác không tiến lên nút: sân Nhà máy cửa đóng', baiLam: doiBai([HD_5, ['lob()', 'wait_n(4)']]), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Máy khai thác rời nút sớm: cửa đóng trước mũi xe', baiLam: doiBai([HD_5, ['lob()', 'forward(1)', 'back()']]), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 35, nhip: 26 },
      goiY: ['listen() trả 0 khi không có tượng nào trong tầm: if n > 0 thì mới hát.', 'lob(): nạp vật trước mũi rồi ném xa 2 ô; đá rơi xuống hố thì lấp hố.', 'Nút đè chỉ giữ cửa mở khi có robot đứng trên nút.'],
      cauDo: { doi: ['HD', 'KT'], lap: null, coChe: ['da-chuong', 'ho', 'da-tron', 'nut-de', 'cua', 'nhieu-san'], cuu: 'hang', meo: 'doc-roi-chon' }
    }),
    // 6 · cứu người, nhiều sân, hai sân Bến sông (G5: người trôi, lưới) + Mỏ đá / Hang (hầm, tượng đá chuông). Xuồng kéo người dưới nước vào bờ, xe hang động hát vỡ tượng
    //     chắn lối về trạm; mỗi sân tượng một nốt (sân cấp qua listen()). Bẫy: xe cứu hỏa (không kéo người, không phun vào người).
    man9('tong-hop-clb', 6, 'cung-co', {
      ten: 'Người dưới sông, thợ trong hầm',
      vo: 'song',
      mucTieu: 'cuu-nguoi',
      deBai: 'Hai sân: bờ sông có người rơi xuống nước; hầm mỏ có thợ mỏ kẹt. Cả hai sân, lối về trạm cứu bị tượng đá chuông chắn, mỗi sân một nốt. Chọn hai bạn cứu người ở cả hai sân.',
      veMaMau: 'Chưa ai kéo người, tượng còn chắn.',
      san: [SAN_6_SONG, SAN_6_HAM],
      them: { nguoi: [[{ x: 3, y: 2 }], [{ x: 2, y: 1 }]], tramCuu: [{ x: 8, y: 1 }], daChuong: [[{ x: 6, y: 1, not: 2, ben: 1 }], [{ x: 6, y: 1, not: 7, ben: 1 }]] },
      doi: [khe({ x: 1, y: 3, huong: 1 }, { batDauNuoc: { x: 1, y: 2, huong: 1 } }), khe({ x: 8, y: 3, huong: 3 }, { batDauNuoc: { x: 5, y: 2, huong: 3 } })],
      chonDoi: {
        menu: ['HD', 'XU', 'CU'],
        cachMau: [{ chon: ['HD', 'XU'], ghiChu: 'đôi tốt', loiGiai: doiBai([HD_6, XU_6]) }]
      },
      maMau: doiBai([['forward(5)'], []]),
      loiSai: [
        { moTa: 'Điền thẳng nốt sân 1 (play_note(2)): sân hầm tượng nốt 7, không vỡ', baiLam: doiBai([['forward(5)', 'play_note(2)'], XU_6]), phaiCoMa: ['chua-cuu-nguoi'] },
        { moTa: 'Chạy đúng sân 2, thua sân 1: xuồng không kéo (sân hầm không có người dưới nước)', baiLam: doiBai([HD_6, []]), phaiCoMa: ['chua-cuu-nguoi'] },
        { moTa: 'Xe hang động hát khi còn xa (forward(2)): tượng cách hơn 3 ô, không vỡ', baiLam: doiBai([['forward(2)', 'play_note(listen())'], XU_6]), phaiCoMa: ['chua-cuu-nguoi'] }
      ],
      sao: { o: 13, nhip: 19 },
      goiY: ['cast_net(): lưới dài 2, kéo người cách 2 ô về trước mũi xuồng; ô sát bờ thì người tự lên bờ.', 'listen(): nốt của tượng gần nhất; loa phá đá trong tầm 3 ô.', 'Người tự đi về trạm khi lối trống.'],
      cauDo: { doi: ['HD', 'XU'], lap: null, coChe: ['nguoi', 'nuoc', 'luoi', 'da-chuong', 'not', 'ham', 'nhieu-san'], cuu: 'nguoi', meo: 'nhieu-san' }
    }),
    // 7 · cứu máy, nhiều sân, ba sân Nhà máy (kệ đổ, cửa nút đè) + Hang (kệ đổ, tượng đá chuông) + sân CLB (tượng đá chuông), R3 xe chở hàng cũ (khoá) đi từng ô, bị chắn thì chờ.
    //     Xe cứu hỏa ủi kệ, xe hang động đứng trên nút giữ cửa, nghe nốt tượng (if n > 0) rồi hát. Bẫy: nhện (giữ được nút, không hát), xe chở hàng (không ủi kệ).
    man9('tong-hop-clb', 7, 'van-dung', {
      ten: 'Xe cũ của CLB qua ba sân',
      khung: { chinh: 14, moiHam: 8 },
      deBai: 'Ba sân. Xe chở hàng cũ của CLB đi từng ô, ô trước bị chắn thì chờ. Trên lối của nó: kệ sắt đổ, cửa kho đóng hay tượng đá chuông, mỗi sân một kiểu. Chọn hai bạn mở lối để nó về cờ ở cả ba sân.',
      veMaMau: 'Đọc chương trình của máy khách: ô trước bị chắn thì chờ.',
      san: [san7('H', 'C', 'M'), san7('H', '.', '.'), san7('.', '.', '.')],
      them: { xichDay: true, noi: [[{ nut: { x: 6, y: 3 }, cua: [{ x: 6, y: 2 }] }], [], []], daChuong: [[], [{ x: 6, y: 2, not: 5, ben: 1 }], [{ x: 6, y: 2, not: 3, ben: 1 }]] },
      doi: [khe({ x: 3, y: 3, huong: 0 }, { co: [{ x: 3, y: 3 }] }), khe({ x: 5, y: 3, huong: 1 }, { co: [{ x: 7, y: 3 }] }),
        may('CH', { x: 1, y: 2, huong: 1 }, { son: 'tim', coDinh: true, co: [{ x: 9, y: 2 }] })],
      chonDoi: {
        menu: ['CU', 'HD', 'PL', 'CH'],
        cachMau: [{ chon: ['CU', 'HD'], ghiChu: 'đôi tốt', loiGiai: doiBai([CU_7, HD_7, R3_7]) }]
      },
      maMau: doiBai([[], [], R3_7]),
      loiSai: [
        { moTa: 'Chạy đúng sân 1, thua sân 2, 3: không nghe tượng (sân 1 chỉ có cửa), máy khách chờ mãi trước tượng', baiLam: doiBai([CU_7, ['forward(1)', 'wait_n(5)', 'forward(1)'], R3_7]), phaiCoMa: ['qua-nhieu-nhip'] },
        { moTa: 'Xe hang động rời nút ngay: sân 1 cửa đóng, máy khách chờ mãi', baiLam: doiBai([CU_7, ['forward(1)', 'n = listen()', 'if n > 0:', '    play_note(n)', 'forward(1)'], R3_7]), phaiCoMa: ['qua-nhieu-nhip'] },
        { moTa: 'Xích ủi xong đứng lại giữa lối: máy khách chờ mãi', baiLam: doiBai([['forward(1)'], HD_7, R3_7]), phaiCoMa: ['qua-nhieu-nhip'] }
      ],
      sao: { o: 29, nhip: 32 },
      goiY: ['while not front_clear(): wait(): máy khách đứng chờ khi ô trước bị chắn.', 'listen() trả 0 khi không có tượng trong tầm: if n > 0 thì mới hát.', 'Nút đè chỉ giữ cửa mở khi có robot đứng trên nút.'],
      cauDo: { doi: ['CU', 'HD'], lap: null, coChe: ['thung-nang', 'nut-de', 'cua', 'da-chuong', 'r3', 'nhieu-san'], cuu: 'may', meo: 'nhieu-san' }
    }),
    // 8 · nhiều sân, lắp tự do (một robot cho hai sân khác hẳn): R1 đặt sẵn xe chở hàng; R2 tự lắp dọn vật chắn lối: sân Kho thùng gỗ, sân Bãi tái chế thanh sắt.
    //     Tay kẹp gắp được cả hai (đa năng), nam châm chỉ hút sắt. Cách một hai bánh + kẹp (rẻ), cách hai omni + kẹp (trượt ngang, nhanh).
    man9('tong-hop-clb', 8, 'van-dung', {
      ten: 'Một robot cho hai sân',
      mucTieu: 'dua-vat',
      deBai: 'Hai sân: Kho và Bãi tái chế. Xe chở hàng mang thùng quà vào kho, nhưng lối bị chắn: sân Kho là thùng gỗ đổ, sân Bãi là thanh sắt rơi. Lắp cho Luna MỘT robot dọn được cả hai, đặt vật chắn vào hốc chứa.',
      veMaMau: 'R2 chưa có chương trình.',
      san: [san8(), san8()],
      them: { vatChat: [null, ['..........', '...s......', '..........', '..........', '..........']] },
      doi: [may('CH', { x: 1, y: 1, huong: 1 }), khe({ x: 1, y: 3, huong: 0 }, { son: 'lam' })],
      lapRap: lapR2(['hai-banh', 'omni', 'nhen'], ['kep', 'nam-cham', 'day-keo'], [], 6, [
        cach('hai-banh', 'kep', null, [ch8(3), BANH_8]),
        cach('omni', 'kep', null, [ch8(1), OMNI_8])
      ]),
      maMau: doiBai([ch8(3), []]),
      loiSai: [
        { moTa: 'Đặt vật chắn ngay trước mũi (không quay): vật nằm lại giữa lối', baiLam: doiBai([ch8(3), ['turn_right()', 'forward(2)', 'turn_left()', 'forward(1)', 'pick()', 'drop()']]), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Xe chở hàng không chờ: đâm vật chắn', baiLam: doiBai([['pick()', 'forward(5)', 'drop()'], BANH_8]), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quay trái khi đặt: vật rơi vào tường, không đặt được', baiLam: doiBai([ch8(3), ['turn_right()', 'forward(2)', 'turn_left()', 'forward(1)', 'pick()', 'turn_left()', 'drop()']]), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 38, nhip: 26 },
      goiY: ['Tay kẹp gắp được thùng gỗ lẫn thanh sắt; nam châm chỉ hút sắt.', 'Omni trượt ngang được, không cần quay.', 'Vật nằm trên ô D (hốc chứa, kho) là đã vào chỗ.'],
      cauDo: { doi: null, lap: 'hai-banh+kep', coChe: ['thung', 'sat', 'kho', 'hoc', 'da-nang', 'nhieu-san'], cuu: 'hang', meo: 'nhieu-san' }
    }),
    // 9 · nhiều sân, tự lắp (bảng ghi hai robot tự lắp: lõi chỉ cho tự lắp MỘT robot, nên R1 drone đặt sẵn), Nông trại (gieo, luống) + sân CLB (kẻ vạch):
    //     R2 gieo cỏ cách một ô (i % 2 == 0), luống mỗi sân dài khác nhau: while front_clear() đọc từ sân. Ôn %.
    man9('tong-hop-clb', 9, 'bien-the', {
      ten: 'Kẻ sân ngày hội',
      mucTieu: 'to-hinh', vo: 'nong-trai',
      khung: { chinh: 14, moiHam: 8 },
      deBai: 'Hai sân: luống ở Nông trại và sân CLB. Drone kẻ vạch đỏ hàng trên. Lắp cho Luna một robot gieo cỏ xanh dọc hàng dưới, cách một ô một khóm. Luống mỗi sân dài khác nhau.',
      veMaMau: 'R2 mới có màu cỏ.',
      san: [san9(6), san9(8)],
      them: { hinh: [hinh9(6), hinh9(8)] },
      doi: [may('DR', { x: 1, y: 1, huong: 1 }), khe({ x: 1, y: 4, huong: 1 }, { son: 'lam' })],
      lapRap: lapR2(['hai-banh', 'omni', 'drone'], ['son', 'kep', 'loa'], ['khoang-cach', 'camera', 'hong-ngoai'], 8, [
        cach('hai-banh', 'son', 'khoang-cach', [DR_9, BANH_9]),
        cach('omni', 'son', 'khoang-cach', [DR_9, OMNI_9])
      ]),
      maMau: doiBai([DR_9, ['ink("green")', 'i = 0']]),
      loiSai: [
        { moTa: 'Điền thẳng dữ liệu sân 1 (gieo ba khóm): sân 2 luống dài 8, thiếu khóm cuối', baiLam: doiBai([DR_9, ['turn_left()', 'forward(1)', 'turn_right()', 'ink("green")', 'for i in range(3):', '    dot()', '    forward(2)']]), phaiCoMa: ['chua-to-hinh'] },
        { moTa: 'Gieo mọi ô (quên i % 2 == 0): cỏ mọc kín luống', baiLam: doiBai([DR_9, ['turn_left()', 'forward(1)', 'turn_right()', 'ink("green")', 'while front_clear():', '    dot()', '    forward(1)']]), phaiCoMa: ['to-thua'] },
        { moTa: 'Quên i = i + 1: i luôn là 0, gieo mọi ô', baiLam: doiBai([DR_9, BANH_9.slice(0, -1)]), phaiCoMa: ['to-thua'] }
      ],
      sao: { o: 30, nhip: 22 },
      goiY: ['i % 2: số dư khi chia i cho 2; i % 2 == 0 là i chẵn: 0, 2, 4…', 'while front_clear(): đi tới khi trước mặt không còn trống.', 'Omni trượt ngang được, không cần quay.'],
      cauDo: { doi: null, lap: 'hai-banh+son+khoang-cach', coChe: ['gieo', 'vach', 'luong', 'chia-du', 'nhieu-san'], cuu: 'hang', meo: 'nhieu-san' }
    }),
    // 10 · song ca (trùm chương 1), hai sân (sân Kho và sân Nhà máy, đá chuông mỗi sân một nốt để nhìn): tập ghép bốn đoạn đầu của bài (đoạn Kho, Nhà máy, Bãi tái chế, Cảng).
    //      Bảng đủ 8 cỗ máy, chọn trùng được: chỉ xe hang động có loa. Ôn list: mỗi đoạn một list, nối list bằng +. Hát tại chỗ (màn choi-dieu có ô F thì lõi không cho thắng).
    //      Nốt: bè 1 = 1 1 5 5 6 6 5 5 | 4 4 3 3 2 2 1 1 | 5 5 4 4 3 3 2 2 | 5 5 4 4 3 3 2 2, bè 2 = 1 3 5 3 4 4 1 1 | 2 4 1 3 5 5 1 1 | 3 1 2 4 1 3 5 5 | 1 3 2 4 3 5 4 2 (bảng B1 / B2 đầu tệp). Mọi khe trên dải ray, dưới mỗi khe là ô nước.
    man9('tong-hop-clb', 10, 'trum', {
      ten: 'Tập song ca bốn đoạn đầu',
      mucTieu: 'choi-dieu',
      hamCuaEmCan: ['play_note', 'play_part'],
      khung: { chinh: 12, moiHam: 8 },
      deBai: 'Tổng duyệt ngày hội! Hai sân: Kho và Nhà máy. Ghép bốn đoạn đầu của bài (đoạn Kho, Nhà máy, Bãi tái chế, Cảng). Chọn hai bạn hát được; mỗi bè khai bốn list đoạn, nối lại rồi play_part.',
      veMaMau: 'Hai bè mới hát đoạn 1.',
      san: [SAN_10, SAN_10],
      doi: [khe({ x: 1, y: 1, huong: 0, nac: 2, tam: 1 }, { batDauNuoc: { x: 1, y: 2, huong: 1 } }), khe({ x: 3, y: 1, huong: 0, nac: 2, tam: 1 }, { batDauNuoc: { x: 3, y: 2, huong: 1 } })],
      them: { dieu: { r1: noiDieu(B1, [1, 2, 3, 4]), r2: noiDieu(B2, [1, 2, 3, 4]) }, daChuong: [[{ x: 2, y: 2, not: 6, ben: 1 }, { x: 5, y: 2, not: 3, ben: 1 }], [{ x: 2, y: 2, not: 2, ben: 1 }]] },
      chonDoi: {
        menu: ['CH', 'CU', 'PL', 'CC', 'XU', 'DR', 'KT', 'HD'], trung: true,
        cachMau: [{ chon: ['HD', 'HD'], ghiChu: 'đôi tốt: chỉ xe hang động có loa', loiGiai: doiBai([BE1_10, BE2_10]) }]
      },
      maMau: doiBai([BE1_10.slice(0, 4).concat(['play_part(d1)']), BE2_10.slice(0, 4).concat(['play_part(d1)'])]),
      loiSai: [
        { moTa: 'Bè 2 mới hát đoạn 1', baiLam: doiBai([BE1_10, BE2_10.slice(0, 4).concat(['play_part(d1)'])]), phaiCoMa: ['lo-nhip'] },
        { moTa: 'Ghép sai thứ tự (d2 + d1 + d3 + d4)', baiLam: doiBai([BE1_10.slice(0, 4).concat(['play_part(d2 + d1 + d3 + d4)']), BE2_10]), phaiCoMa: ['sai-not'] },
        { moTa: 'Cộng từng số thay vì nối list: play_note(d1[0] + d2[0]) ra nốt 5', baiLam: doiBai([BE1_10.slice(0, 4).concat(['play_note(d1[0] + d2[0])']), BE2_10]), phaiCoMa: ['sai-not'] }
      ],
      sao: { o: 17, nhip: 77 },
      goiY: ['Nối hai list bằng dấu +: [1, 2] + [3] là [1, 2, 3].', 'play_part(notes): hát lần lượt từng nốt trong list.', 'Hai bạn bắt đầu cùng một nhịp.'],
      cauDo: { doi: ['HD', 'HD'], lap: null, coChe: ['loa', 'da-chuong', 'ghep-bai', 'list', 'nhieu-san'], cuu: null, meo: 'song-song' }
    }),
    /* ========================================================================
       CHƯƠNG 2: trum-mua-clb (10 màn) · R1 đặt sẵn (hát đoạn của nơi đó), R2 Luna tự lắp, mỗi màn 2–3 sân. #11–#18: làm việc của cỗ máy nhà mà KHÔNG có cỗ máy đó.
       ======================================================================== */
    // 11 · đổi vai, hai sân Kho (G1), không dùng xe chở hàng (bảng thân không có hai bánh): R1 xe hang động hát đoạn Kho (bè 1 đoạn 1: 1 1 5 5 6 6 5 5), tượng nhỏ nốt 6 vỡ khi hát tới.
    //      R2 tự lắp làm việc của xe chở hàng: tìm thùng quà (while front_clear()), gắp, đặt lên kệ. Cách một omni + kẹp (nhanh), cách hai xích + kẹp (rẻ).
    man9('trum-mua-clb', 1, 'lam-quen', {
      ten: 'Kho không có xe chở hàng',
      mucTieu: 'dua-vat',
      hamCuaEmCan: HAM_EM.concat(['play_part']),
      deBai: 'Hai sân Kho. Xe chở hàng về nhà sửa! Xe hang động hát đoạn Kho. Lắp cho Luna một robot làm việc của xe chở hàng: tìm thùng quà trên lối dưới (mỗi sân một chỗ), đặt lên kệ.',
      veMaMau: 'R2 chưa có chương trình.',
      san: [san11(4), san11(7)],
      them: { daChuong: [{ x: 3, y: 1, not: 6, ben: 1 }] },
      doi: [may('HD', { x: 1, y: 1, huong: 1 }), khe({ x: 1, y: 3, huong: 1 }, { son: 'lam' })],
      lapRap: lapR2(['omni', 'xich', 'nhen'], ['kep', 'nam-cham', 'day-keo'], ['khoang-cach', 'camera', 'tu'], 7, [
        cach('omni', 'kep', 'khoang-cach', [HD_11, OMNI_11]),
        cach('xich', 'kep', 'khoang-cach', [HD_11, XICH_11])
      ]),
      maMau: doiBai([HD_11, []]),
      loiSai: [
        { moTa: 'Điền thẳng dữ liệu sân 1 (forward(2)): sân 2 thùng xa hơn, gắp hụt', baiLam: doiBai([HD_11, ['forward(2)', 'pick()', 'turn_left()', 'drop()']]), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên quay: thả thùng lại trước mũi, trên lối', baiLam: doiBai([HD_11, ['while front_clear():', '    forward(1)', 'pick()', 'drop()']]), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quay phải: thùng rơi vào tường, không đặt được', baiLam: doiBai([HD_11, ['while front_clear():', '    forward(1)', 'pick()', 'turn_right()', 'drop()']]), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 33, nhip: 18 },
      goiY: ['while front_clear(): forward(1): đi tới khi trước mặt có vật.', 'Kệ D ở hàng trên lối: quay trái rồi đặt.', 'play_part(notes): hát lần lượt từng nốt trong list.'],
      cauDo: { doi: null, lap: 'omni+kep+khoang-cach', coChe: ['thung', 'kho', 'loa', 'doi-vai', 'nhieu-san'], cuu: 'hang', meo: 'doi-vai' }
    }),
    // 12 · đổi vai, hai sân Nhà máy (G2), không dùng xe cứu hỏa (bảng thân không có xích): R1 xe chở hàng lắp loa hát đoạn Nhà máy (bè 1 đoạn 2: 4 4 3 3 2 2 1 1), rồi qua cửa.
    //      R2 tự lắp xe có vòi phun dò ngách có nút bắn (mỗi sân một cột), phun mở cửa. Ôn not, while.
    man9('trum-mua-clb', 2, 'lam-quen', {
      ten: 'Nhà máy không có xích',
      hamCuaEmCan: HAM_EM.concat(['play_part']),
      deBai: 'Hai sân Nhà máy. Xe cứu hỏa về nhà sửa! Xe chở hàng lắp loa hát đoạn Nhà máy rồi về cờ, nhưng cửa đóng. Nút bắn mở cửa nằm trong một ngách, mỗi sân một chỗ. Lắp cho Luna một robot tìm ngách, phun mở cửa.',
      veMaMau: 'R2 chưa có chương trình.',
      san: [san12(3), san12(6)],
      them: { noi: [[{ nut: { x: 3, y: 1 }, cua: [{ x: 4, y: 5 }] }], [{ nut: { x: 6, y: 1 }, cua: [{ x: 4, y: 5 }] }]] },
      doi: [xeLoa('CH', { x: 1, y: 5, huong: 1 }, { co: [{ x: 8, y: 5 }] }), khe({ x: 1, y: 3, huong: 0 }, { son: 'lam', co: [[{ x: 3, y: 2 }], [{ x: 6, y: 2 }]] })],
      lapRap: lapR2(['omni', 'hai-banh', 'nhen'], ['hoi', 'kep', 'nam-cham'], ['khoang-cach', 'camera', 'hong-ngoai'], 8, [
        cach('omni', 'hoi', 'khoang-cach', [CH_12, OMNI_12]),
        cach('hai-banh', 'hoi', 'khoang-cach', [CH_12, BANH_12])
      ]),
      maMau: doiBai([CH_12, []]),
      loiSai: [
        { moTa: 'Điền thẳng dữ liệu sân 1 (slide_r(2)): sân 2 phun trúng tường, cửa đóng', baiLam: doiBai([CH_12, ['slide_r(2)', 'spray()', 'wait()', 'forward(1)']]), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên not: while front_clear() không chạy lần nào, phun trúng tường', baiLam: doiBai([CH_12, ['while front_clear():', '    slide_r(1)', 'spray()', 'wait()', 'forward(1)']]), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Phun hai lần: cửa mở rồi đóng lại', baiLam: doiBai([CH_12, ['while not front_clear():', '    slide_r(1)', 'spray()', 'wait()', 'spray()', 'wait()', 'forward(1)']]), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 23, nhip: 36 },
      goiY: ['front_clear(): ô trước mặt có trống không; not đảo True thành False.', 'Tia phun trúng nút N thì cửa C đổi (đóng ↔ mở).', 'Omni trượt ngang được, không cần quay.'],
      cauDo: { doi: null, lap: 'omni+hoi+khoang-cach', coChe: ['nut-ban', 'cua', 'phun', 'loa', 'doi-vai', 'nhieu-san'], cuu: 'hang', meo: 'doi-vai' }
    }),
    // 13 · đổi vai, ba sân Bãi (G3), không dùng nhện bò ray (bảng thân không có nhện): R1 xe cứu hỏa lắp loa hát đoạn Bãi (bè 1 đoạn 3: 5 5 4 4 3 3 2 2).
    //      R2 tự lắp xe nam châm: vật trước mũi mỗi sân một loại (sắt / nam châm N / nam châm S); đọc cảm biến từ, chọn cực hút được, đưa về đích. Ôn if / else, or, ==.
    man9('trum-mua-clb', 3, 'lam-quen', {
      ten: 'Bãi không có nhện',
      mucTieu: 'dua-vat',
      hamCuaEmCan: HAM_EM.concat(['play_part']),
      deBai: 'Ba sân Bãi. Nhện bò ray về nhà sửa! Xe cứu hỏa hát đoạn Bãi. Lắp cho Luna một robot nam châm: trước mũi là sắt hay nam châm, mỗi sân một thứ. Đọc cảm biến, bật cực hút được, đưa vật về đích D.',
      veMaMau: 'R2 chưa có chương trình.',
      san: [SAN_13, SAN_13, SAN_13],
      them: { vatChat: [chat13('s'), chat13('N'), chat13('S')], vatCan: 'tu' },
      doi: [xeLoa('CU', { x: 5, y: 3, huong: 3 }), khe({ x: 1, y: 1, huong: 1 }, { son: 'lam' })],
      lapRap: lapR2(['omni', 'hai-banh', 'xich'], ['nam-cham', 'kep', 'day-keo'], ['tu', 'khoang-cach', 'camera'], 9, [
        cach('omni', 'nam-cham', 'tu', [CU_13, OMNI_13]),
        cach('hai-banh', 'nam-cham', 'tu', [CU_13, BANH_13])
      ]),
      maMau: doiBai([CU_13, []]),
      loiSai: [
        { moTa: 'Điền thẳng dữ liệu sân 1 (sắt: magnet_s()): sân 3 nam châm quay cực S bị đẩy ra xa', baiLam: doiBai([CU_13, ['magnet_s()', 'wait()', 'slide_right()', 'wait()', 'magnet_off()', 'wait()']]), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên or: chỉ hỏi front_metal(), nam châm quay cực N gặp cực N bị đẩy', baiLam: doiBai([CU_13, ['if front_metal():', '    magnet_s()', 'else:', '    magnet_n()', 'wait()', 'slide_right()', 'wait()', 'magnet_off()', 'wait()']]), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên magnet_off(): vật còn dính mũi xe, chưa nằm trên đích', baiLam: doiBai([CU_13, CHON_CUC_13.concat(['slide_right()', 'wait()'])]), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 28, nhip: 18 },
      goiY: ['front_metal(): vật trước mũi là sắt. front_pole(): "N", "S" hay "none".', 'Sắt: cực nào cũng hút. Nam châm: khác cực mới hút, cùng cực thì đẩy.', 'A or B: đúng khi một trong hai đúng.'],
      cauDo: { doi: null, lap: 'omni+nam-cham+tu', coChe: ['nam-cham', 'sat', 'cuc', 'loa', 'doi-vai', 'nhieu-san'], cuu: 'hang', meo: 'doi-vai' }
    }),
    // 14 · đổi vai, hai sân Cảng (G4), không dùng cần cẩu (bảng thân không có cẩu): R1 máy khai thác lắp loa hát đoạn Cảng (bè 1 đoạn 4: 5 5 4 4 3 3 2 2).
    //      R2 tự lắp xe bờ + tay lưới: ra đầu cầu tàu, set_length(3), kéo container về bến q. Dây mặc định 2 ô chỉ tới sân 1.
    man9('trum-mua-clb', 4, 'lam-quen', {
      ten: 'Cảng không có cần cẩu',
      vo: 'song',
      mucTieu: 'dua-vat',
      hamCuaEmCan: HAM_EM.concat(['play_part']),
      deBai: 'Hai sân Cảng. Cần cẩu về nhà sửa! Máy khai thác hát đoạn Cảng. Container rơi xuống luồng, mỗi sân trôi xa gần khác nhau. Lắp cho Luna một xe bờ có tay lưới: ra đầu cầu tàu, kéo container về bến q.',
      veMaMau: 'R2 chưa có chương trình.',
      san: [san14(3), san14(4)],
      them: { contTroi: [[{ x: 3, y: 1, so: 41 }], [{ x: 4, y: 1, so: 41 }]] },
      doi: [xeLoa('KT', { x: 8, y: 3, huong: 3 }), khe({ x: 3, y: 3, huong: 0 }, { son: 'lam' })],
      lapRap: lapR2(['omni', 'hai-banh', 'nhen'], ['day-keo', 'kep', 'nam-cham'], [], 7, [
        cach('omni', 'day-keo', null, [KT_14, OMNI_14]),
        cach('hai-banh', 'day-keo', null, [KT_14, BANH_14])
      ], { moLai: ['L3'] }),
      maMau: doiBai([KT_14, []]),
      loiSai: [
        { moTa: 'Quên set_length(3): dây mặc định 2 ô, sân 2 container cách 3 ô', baiLam: doiBai([KT_14, ['slide_left()', 'wait()', 'slide_left()', 'wait()', 'forward(2)', 'turn_right()', 'cast_net()', 'wait()']]), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Trượt không chờ: hai lệnh slide_left() cùng một nhịp, xe mới sang một ô', baiLam: doiBai([KT_14, ['slide_left()', 'slide_left()', 'forward(2)', 'turn_right()'].concat(KEO_14)]), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên quay phải: tung lưới lên tường', baiLam: doiBai([KT_14, ['slide_left()', 'wait()', 'slide_left()', 'wait()', 'forward(2)'].concat(KEO_14)]), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 27, nhip: 22 },
      goiY: ['set_length(n): dây lưới dài n ô (1 tới 3), mặc định 2.', 'Omni trượt một ô mỗi nhịp: slide_left() rồi wait().', 'Xe bờ kéo vật nổi về ô nước gần xe nhất trên dây.'],
      cauDo: { doi: null, lap: 'omni+day-keo', coChe: ['nuoc', 'cont-troi', 'luoi', 'xe-bo', 'loa', 'doi-vai', 'nhieu-san'], cuu: 'hang', meo: 'doi-vai' }
    }),
    // 15 · đổi vai, hai sân Bến (G5), không dùng xuồng (bảng thân không có xuồng): R1 xe hang động hát đoạn Bến (bè 1 đoạn 5: 1 1 5 5 6 6 5 5).
    //      R2 tự lắp xe bờ + tay lưới + cảm biến màu: tìm cọc phao đỏ trên bờ (mỗi sân một chỗ), kéo người dưới sông vào bờ. Ôn while, !=.
    man9('trum-mua-clb', 5, 'lam-quen', {
      ten: 'Bến không có xuồng',
      vo: 'song',
      mucTieu: 'cuu-nguoi',
      hamCuaEmCan: HAM_EM.concat(['play_part']),
      deBai: 'Hai sân Bến. Xuồng về nhà sửa! Xe hang động hát đoạn Bến. Có người rơi xuống sông, trên bờ chỗ đó cắm cọc phao đỏ, mỗi sân một chỗ. Lắp cho Luna một xe bờ: tìm cọc đỏ, tung lưới kéo người vào bờ.',
      veMaMau: 'R2 chưa có chương trình.',
      san: [san15(4), san15(6)],
      them: { nguoi: [[{ x: 4, y: 4 }], [{ x: 6, y: 4 }]], tramCuu: [{ x: 8, y: 1 }] },
      doi: [may('HD', { x: 1, y: 1, huong: 1 }), khe({ x: 1, y: 2, huong: 2 }, { son: 'lam' })],
      lapRap: lapR2(['omni', 'hai-banh', 'drone'], ['day-keo', 'kep', 'nam-cham'], ['mau', 'camera', 'khoang-cach'], 9, [
        cach('omni', 'day-keo', 'mau', [HD_15, OMNI_15]),
        cach('hai-banh', 'day-keo', 'mau', [HD_15, BANH_15])
      ], { moLai: ['L3'] }),
      maMau: doiBai([HD_15, []]),
      loiSai: [
        { moTa: 'Điền thẳng dữ liệu sân 1 (trượt 3 ô): sân 2 lưới hụt', baiLam: doiBai([HD_15, ['for i in range(3):', '    slide_left()', '    wait()', 'cast_net()', 'wait()']]), phaiCoMa: ['chua-cuu-nguoi'] },
        { moTa: 'Quên wait() trong vòng lặp: mỗi nhịp chỉ trượt một lần, xe đọc màu mãi ở ô đầu', baiLam: doiBai([HD_15, ['while color() != "red":', '    slide_left()', 'cast_net()', 'wait()']]), phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Xe đứng lì chỗ cọc: người được kéo sát bờ nhưng xe chắn lối lên', baiLam: doiBai([HD_15, ['while color() != "red":', '    slide_left()', '    wait()', 'cast_net()', 'wait()']]), phaiCoMa: ['chua-cuu-nguoi'] }
      ],
      sao: { o: 26, nhip: 31 },
      goiY: ['color(): màu sàn dưới bụng xe, "red" là cọc phao.', 'A != B: đúng khi A khác B.', 'Xe bờ kéo người dưới nước về ô nước sát bờ; người tự lên bờ, đi về trạm.'],
      cauDo: { doi: null, lap: 'omni+day-keo+mau', coChe: ['nguoi', 'nuoc', 'luoi', 'xe-bo', 'mau', 'loa', 'doi-vai', 'nhieu-san'], cuu: 'nguoi', meo: 'doi-vai' }
    }),
    // 16 · đổi vai, hai sân Nông trại (G6), không dùng drone (bảng thân không có drone): R1 xe hang động hát đoạn Nông trại (bè 1 đoạn 6: 4 4 3 3 2 2 1 1).
    //      R2 tự lắp robot gieo hạt + hồng ngoại: luống dài khác nhau, gieo một cây ở giữa (k // 2). Ôn //.
    man9('trum-mua-clb', 6, 'lam-quen', {
      ten: 'Nông trại không có drone',
      mucTieu: 'to-hinh', vo: 'nong-trai',
      hamCuaEmCan: HAM_EM.concat(['play_part']),
      deBai: 'Hai sân Nông trại. Drone về nhà sửa! Xe hang động hát đoạn Nông trại. Lắp cho Luna một robot gieo hạt: gieo một cây xanh ở giữa luống. Luống mỗi sân dài khác nhau.',
      veMaMau: 'R2 chưa có chương trình.',
      san: [san16(7), san16(9)],
      them: { hinh: [hinh16(7), hinh16(9)] },
      doi: [may('HD', { x: 1, y: 1, huong: 1 }), khe({ x: 1, y: 4, huong: 1 }, { son: 'lam' })],
      lapRap: lapR2(['omni', 'hai-banh', 'nhen'], ['son', 'kep', 'loa'], ['hong-ngoai', 'camera', 'mau'], 9, [
        cach('omni', 'son', 'hong-ngoai', [HD_16, OMNI_16]),
        cach('hai-banh', 'son', 'hong-ngoai', [HD_16, BANH_16])
      ]),
      maMau: doiBai([HD_16, []]),
      loiSai: [
        { moTa: 'Điền thẳng dữ liệu sân 1 (đi 3 ô): sân 2 luống dài 9, cây lệch giữa', baiLam: doiBai([HD_16, ['slide_left()', 'wait()', 'ink("green")', 'forward(3)', 'dot()', 'wait()']]), phaiCoMa: ['to-thua'] },
        { moTa: 'Đi hết k ô (quên // 2): gieo ở cuối luống', baiLam: doiBai([HD_16, ['slide_left()', 'wait()', 'ink("green")', 'k = distance()', 'forward(k)', 'dot()', 'wait()']]), phaiCoMa: ['to-thua'] },
        { moTa: 'Dùng % thay //: k % 2 là số dư (0), gieo ngay đầu luống', baiLam: doiBai([HD_16, ['slide_left()', 'wait()', 'ink("green")', 'k = distance()', 'forward(k % 2)', 'dot()', 'wait()']]), phaiCoMa: ['to-thua'] }
      ],
      sao: { o: 26, nhip: 18 },
      goiY: ['k // 2: chia k cho 2, bỏ phần lẻ: 6 // 2 = 3, 7 // 2 = 3.', 'distance(): số ô trống trước mặt.', 'Omni trượt ngang được, không cần quay.'],
      cauDo: { doi: null, lap: 'omni+son+hong-ngoai', coChe: ['gieo', 'luong', 'hong-ngoai', 'chia-nguyen', 'loa', 'doi-vai', 'nhieu-san'], cuu: 'hang', meo: 'doi-vai' }
    })
  ];

  ManHoc.manNgayHoiClb = DS_MAN;
})();
