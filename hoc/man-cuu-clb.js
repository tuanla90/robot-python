/* ============================================================================
   man-cuu-clb.js - Mùa 9 CLB Sáng Tạo: Gói 9 "CLB sau bão" (dựng lại 16/11, M9M9, theo khuôn G7 / G8)
   20 màn: cuu-clb (chọn đội trong menu 3–4 cỗ máy) + lap-clb (R1 đặt sẵn ĐỔI MỖI MÀN, R2 Luna tự lắp từ bảng lớn, không gợi ý tổ hợp).
   Ôn Python: TRỘN mọi thứ đã ôn (def / for, biến + tham số, chuỗi + and / or, số âm abs % //, return tuple min / max, list, lưới grid[r][c], dict / set).
   Bão ở sân CLB: mỗi sân trộn yếu tố của 2–3 nơi cũ (container văng như Cảng, thùng nặng như Nhà máy, hồ CLB tràn như Bến sông, sắt rơi như Bãi tái chế,
   đá chuông như Hang động, đá tròn + hố như Mỏ đá, bùn trơn như Kho hàng), bác bảo vệ kẹt (người P).
   Ném đá: luật NÉM ĐÀ mùa 9 (aim chỉ 1, 2; aim_lob(3) tự chạy đà rồi lùi về chỗ cũ).
   Màn 10 mỗi chương: song ca đoạn 9 (bè 1: 5 5 4 4 3 3 2 2 | bè 2: 7 7 6 6 5 5 4 4), gọi play_part.
     Đoạn 9 nối đoạn 8 (bè 1 4 4 3 3 2 2 1 1 | bè 2 6 6 5 5 4 4 3 3): bè 1 sang câu "5 5 4 4 3 3 2 2" như đoạn 3, 4; bè 2 giữ quãng ba trên như đoạn 8. CHỜ USER DUYỆT.
   Câu đố: hoc/MUA-9-200-CAU-DO.md mục G9 (ghi chú "Đã dựng 16/11 (M9M9)": các chỗ lệch so với bảng).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  /* ---- M9M9: khung màn mùa 9 (chép từ man-cuu-hang-dong.js) ------------------------------------------ */
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

  /** cuu-clb.1: container văng vào sân CLB chắn lối vào kho; ngay sau đó bão làm sụt một hố. Cần cẩu trên ray nhấc container, chạy ray một ô,
   *  hạ container xuống hố (container lấp hố thành sàn). Xe chở hàng gắp thùng dụng cụ, chạy qua chỗ vừa dọn và qua hố đã lấp, thả thùng vào kho D. */
  var CC_1 = ['pick_up()', 'rail(1)', 'set_down()'];
  var CH_1 = ['pick()', 'forward(5)', 'drop()'];

  /** cuu-clb.2: kho CLB bị tường đổ bít cửa, chỉ còn ô trống D sau tường. Xe chở hàng gắp thùng dụng cụ, tiến một ô, đặt thùng trước mũi máy khai thác.
   *  Máy khai thác ở sân dưới: hất đá tròn lấp hố sụt trên lối (lob), tiến hai ô, nạp thùng, tiến một ô sát tường, ném xa 2 ô qua tường vào D. */
  var CH_2 = ['pick()', 'forward(1)', 'drop()'];
  var KT_2 = ['lob()', 'forward(2)', 'load()', 'wait()', 'forward(1)', 'throw()', 'wait()'];

  /** cuu-clb.3: hồ CLB tràn (hàng 2), cầu phao trôi vào góc sau cống đóng. Xe cứu hỏa phun trúng van cống V: cống mở; quay lên chờ cầu.
   *  Xuồng chạy qua cống, tung lưới bắt bè, lùi ba ô kéo bè vào bến q, nhả lưới. Xe cứu hỏa qua cầu phao, ủi thùng nặng (kệ đổ) vào ô D. */
  var CU_3 = ['spray()', 'wait()', 'tr_right()', 'wait_n(6)', 'forward(2)', 'tr_right()', 'forward(2)'];
  var XU_3 = ['forward(4)', 'cast_net()', 'wait()', 'for i in range(3):', '    back()', 'drop_net()', 'wait()'];

  /** cuu-clb.4: kệ sắt đổ (thùng nặng) chắn lối hàng trên của xe hang động; tượng đá chuông ngã chắn lối hàng dưới của xe cứu hỏa.
   *  Xe cứu hỏa tiến, ủi kệ vào hốc trên, lùi về lối mình, quay phải chờ đá vỡ rồi chạy về cờ.
   *  Xe hang động chờ lối thông, tiến tới chỗ nghe được tượng (trong tầm 3), nghe nốt, hát lại: tượng vỡ; chạy về cờ. */
  var CU_4 = ['forward(2)', 'back()', 'back()', 'tr_right()', 'forward(5)'];
  var HD_4 = ['wait_n(2)', 'forward(3)', 'play_note(listen())', 'forward(4)'];

  /** cuu-clb.5: bão thổi khung sắt của sân khấu rơi xuống đảo nhỏ giữa hồ CLB; đảo có một hố sụt. Xuồng buộc bè sau đuôi (lưới dài 1), chạy năm ô kéo bè vào bến q nối bờ với đảo.
   *  Nhện chờ cầu, lên đảo, bật qua hố đáp lên khung sắt, hút, bước vào kho dụng cụ sân khấu D, thả. */
  var XU_5 = ['set_length(1)', 'cast_net("back")', 'wait()', 'forward(5)', 'drop_net()', 'wait()'];
  var PL_5 = ['wait_n(6)', 'go_up()', 'go_up()', 'go_right()', 'jump("R")', 'pull_s()', 'go_right()', 'magnet_off()', 'wait()'];

  /** cuu-clb.6: sân khấu CLB đổ, cửa kho đạo cụ C đóng; nút giữ cửa M nằm dưới gầm sân khấu (chỉ nhện co chân chui được). Hố sụt trên lối máy khai thác.
   *  Máy khai thác hất đá tròn lấp hố, chạy qua cửa về cờ. Nhện co chân chui gầm, đứng lên nút, giữ tới khi máy khai thác qua cửa, sang cờ. */
  var KT_6 = ['lob()', 'forward(7)'];
  var PL_6 = ['crouch()', 'go_right()', 'go_right()', 'stand()', 'wait_n(2)', 'go_right()'];

  /** cuu-clb.7: container văng vào lối hàng trên, sau đó là hố sụt. Đá tròn nằm ngay trước mũi máy khai thác (ném xa 2 ô).
   *  Cần cẩu (vươn 2 ô) nhấc container, thu cần, hạ xuống hốc dưới. Máy khai thác nạp đá, lên lối trên, quay phải, tiến tới cách hố 2 ô, ném đá lấp hố,
   *  qua hố tới trước thùng loa của CLB, nạp thùng, ném qua chỗ thùng vừa nằm vào kho D (xa 2 ô).
   *  Sai thứ tự (ném trước khi tới chỗ): đá rơi chắn lối, hố còn nguyên. */
  var CC_7 = ['pick_up()', 'retract()', 'set_down()'];
  var KT_7 = ['load()', 'wait()', 'forward(2)', 'turn_right()', 'forward(2)', 'throw()', 'wait()', 'forward(3)', 'load()', 'wait()', 'throw()', 'wait()'];

  /** cuu-clb.8: bác bảo vệ kẹt trong dãy kho trên (hàng 1), lối ra trạm cứu bị tượng đá chuông đổ chắn. Hành lang dưới (hàng 3) bị container văng chắn.
   *  Cần cẩu nhấc container, quay phải, hạ xuống ô trống cuối ray. Xe hang động lên hành lang, quay phải, qua chỗ container, tới dưới tượng (cách 2 ô), nghe nốt, hát lại: tượng vỡ.
   *  Bác bảo vệ tự đi về trạm cứu khi lối trống. */
  var CC_8 = ['pick_up()', 'swing_right()', 'set_down()'];
  var HD_8 = ['forward(1)', 'turn_right()', 'forward(4)', 'play_note(listen())'];

  /** cuu-clb.9: xe chở hàng cũ của CLB (R3, khoá) đi từng ô dọc lối hàng 2, ô trước bị chắn thì đứng chờ. Kệ sắt đổ (thùng nặng) chắn lối ở cột 3, cửa kho C ở cột 6 (nút M dưới cửa).
   *  Xe cứu hỏa (khe A) ủi kệ vào hốc trên, lùi về cờ ở ô xuất phát. Khe B (cách xa nút): xe chở hàng chạy năm ô, quay lên nút (máy khách đã chờ sẵn trước cửa), sang cờ.
   *  Nhện ở khe B cũng giữ được nút nhưng mỗi bước hai nhịp: máy khách chờ lâu, quá trần nhịp. */
  var R3_9 = ['for i in range(8):', '    while not front_clear():', '        wait()', '    forward(1)'];
  var CU_9 = ['forward(1)', 'back()'];
  var CH_9 = ['forward(5)', 'turn_left()', 'forward(1)', 'turn_right()', 'forward(1)'];
  var PL_9 = ['for i in range(5):', '    go_right()', 'go_up()', 'wait_n(2)', 'go_right()'];

  /** cuu-clb.10 / lap-clb.10: song ca đoạn 9 (nối đoạn 8: bè 1 sang câu 5 5 4 4 3 3 2 2, bè 2 giữ quãng ba trên như đoạn 8). CHỜ USER DUYỆT nốt. */
  var BE1_9 = 'play_part([5, 5, 4, 4, 3, 3, 2, 2])';
  var BE2_9 = 'play_part([7, 7, 6, 6, 5, 5, 4, 4])';

  /** lap-clb.1: xe chở hàng R1 (đặt sẵn) mang thùng dụng cụ A vào kho D cuối lối; thùng loa B đổ ngay giữa lối, tay kẹp đang bận giữ A nên không gắp được B.
   *  R2 tự lắp xe có bánh + tay lưới (xe tời bờ L3): tới dưới hốc D2, tung lưới lên kéo B ra khỏi lối vào hốc D2. Xe chở hàng chờ lối thông rồi chạy qua.
   *  Cách một (rẻ): hai bánh + lưới, quay, tiến, quay. Cách hai (nhanh): omni + lưới, trượt ngang thẳng tới hốc. */
  var CH_11A = ['pick()', 'wait_n(3)', 'forward(6)', 'drop()'];
  var BANH_11 = ['turn_right()', 'forward(3)', 'turn_left()', 'cast_net()', 'wait()'];
  var CH_11B = ['pick()', 'wait()', 'forward(6)', 'drop()'];
  var OMNI_11 = ['slide_r(3)', 'cast_net()', 'wait()'];

  /** lap-clb.2: bão hất thanh sắt của giàn đèn vào hốc kín sau tường (chỉ có lối từ ô khe của Luna). Máy khai thác R1 (đặt sẵn) đứng dưới, ném được qua tường kho
   *  nhưng không với tới hốc. R2 tự lắp lấy thanh sắt ra, đặt trước mũi máy khai thác (tiếp sức); máy khai thác nạp, quay trái, chạy tới cách kho 2 ô, ném qua tường vào D.
   *  Cách một: cẩu + gầu ngoạm (L8) ngoạm qua tường, quay cần, thả (nhanh). Cách hai rẻ hơn: nhện + nam châm bò vào hốc, clear_iron("R") (gói 3), bò xuống thả, lùi lên (chậm). */
  var KT_12A = ['x = 7', 'wait_n(3)', 'load()', 'wait()', 'turn_left()', 'forward(x - 3)', 'throw()', 'wait()'];
  var GAU_12 = ['grab()', 'swing_left()', 'release()'];
  var KT_12B = ['x = 7', 'wait_n(9)', 'load()', 'wait()', 'turn_left()', 'forward(x - 3)', 'throw()', 'wait()'];
  var NHEN_12 = ['go_left()', 'clear_iron("R")', 'go_down()', 'magnet_off()', 'go_up()'];

  function man9(chuong, so, hang, cfg) {
    var r1 = cfg.doi[0];
    var m = {
      chuong: chuong, so: so, ten: cfg.ten, hang: hang, vo: cfg.vo || 'kho-hang', daLapHo: true,
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
       CHƯƠNG 1: cuu-clb (10 màn)
       ======================================================================== */
    // 1 · show (dọn lối), cặp #3 Chở hàng + Cần cẩu, trộn Cảng (container) + Kho (thùng vào kho): bão quăng một container vào sân CLB, chắn lối vào kho.
    //     Cần cẩu trên ray nhấc container, chạy ray một ô, hạ container lấp hố sụt (T2); xe chở hàng gắp thùng dụng cụ, chạy qua chỗ vừa dọn, thả thùng vào kho. Đội cố định (chạy sẵn, khoá).
    man9('cuu-clb', 1, 'lam-quen', {
      ten: 'Container chắn kho CLB',
      chiChay: true,
      mucTieu: 'dua-vat',
      deBai: 'Bão quăng một container vào sân CLB, chắn lối vào kho. Cần cẩu nhấc container, hạ xuống lấp hố. Xe chở hàng mang thùng dụng cụ vào kho. Bấm Chạy.',
      veMaMau: 'Bấm Chạy xem mỗi bạn làm gì.',
      san: ['#########', '#.o..u.D#', '####RR###', '#########'],
      them: { contChan: true, contLapHo: true, chong: [{ x: 4, y: 1, cont: [{ so: 9 }] }] },
      doi: [may('CH', { x: 1, y: 1, huong: 1 }), may('CC', { x: 4, y: 2, nac: 0, tam: 1 }, { son: 'lam' })],
      maMau: doiBai([CH_1, CC_1]),
      loiGiai: doiBai([CH_1, CC_1]),
      sao: { o: 26, nhip: 10 },
      goiY: ['pick_up(): cẩu móc container ở đầu cần; rail(1): bệ chạy ray một ô; set_down(): hạ container.', 'Container chắn lối như tường: nhờ cẩu nhấc đi trước.', 'pick() / drop(): gắp / thả thùng ở ô trước mũi.'],
      cauDo: { doi: ['CH', 'CC'], lap: null, coChe: ['container', 'thung', 'kho', 'ray', 'ho'], cuu: 'hang', meo: 'don-loi' }
    }),
    // 2 · tiếp sức, cặp #6 Chở hàng + Khai thác, trộn Kho (thùng gỗ) + Mỏ đá (ném qua tường): tường kho CLB đổ bít cửa, chỉ còn ô D sau tường.
    //     Bão còn làm sụt một hố trên lối máy khai thác. Máy khai thác hất đá tròn lấp hố, tiến lên; xe chở hàng gắp thùng, đặt trước mũi máy khai thác;
    //     máy khai thác nạp, tiến một ô sát tường, ném qua tường vào D. Bẫy: drone (không mang thùng gỗ).
    man9('cuu-clb', 2, 'lam-quen', {
      ten: 'Ném thùng qua tường kho',
      mucTieu: 'dua-vat',
      deBai: 'Tường kho CLB đổ, bít cửa. Thùng dụng cụ phải vào ô D sau tường; lối dưới có hố sụt. Chọn hai bạn: ai mang thùng tới, ai lấp hố rồi ném qua tường?',
      veMaMau: 'Thùng còn nằm ngoài sân.',
      san: ['#######', '###D###', '#######', '#.o...#', '###u###', '###o###', '###.###', '#######'],
      them: { vatDang: ['.......', '.......', '.......', '.......', '.......', '...r...', '.......', '.......'] },
      doi: [khe({ x: 1, y: 3, huong: 1 }), khe({ x: 3, y: 6, huong: 0 })],
      chonDoi: {
        menu: ['CH', 'KT', 'DR'],
        cachMau: [{ chon: ['CH', 'KT'], ghiChu: 'đôi tốt', loiGiai: doiBai([CH_2, KT_2]) }]
      },
      maMau: doiBai([['pick()'], []]),
      loiSai: [
        { moTa: 'Máy khai thác ném thùng ngay khi nạp: thùng rơi trúng tường, vỡ', baiLam: doiBai([CH_2, ['lob()', 'forward(2)', 'lob()']]), phaiCoMa: ['nem-vo'] },
        { moTa: 'Hất đá tầm 1 (aim(1)): đá rơi lại trước mũi, hố còn đó, máy khai thác kẹt', baiLam: doiBai([CH_2, ['aim(1)', 'lob()', 'forward(2)', 'load()', 'wait()', 'forward(1)', 'throw()', 'wait()']]), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Xe thả thùng tại chỗ (không tiến): máy khai thác nạp hụt', baiLam: doiBai([['pick()', 'drop()'], KT_2]), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 35, nhip: 9 },
      goiY: ['lob(): nạp vật trước mũi rồi ném xa 2 ô; đá rơi xuống hố thì lấp hố.', 'load(): nạp vật trước mũi vào rổ. throw(): ném xa 2 ô, bay qua tường.', 'Vật rơi trúng tường thì vỡ.', 'drop(): xe thả thùng ở ô trước mũi.'],
      cauDo: { doi: ['CH', 'KT'], lap: null, coChe: ['thung', 'nem', 'tuong', 'kho', 'ho', 'da-tron'], cuu: 'hang', meo: 'tiep-suc' }
    }),
    // 3 · làm cầu, cặp #10 Cứu hỏa + Xuồng, trộn Nhà máy (thùng nặng, vòi phun) + Bến sông (cống, van T3, cầu phao): hồ CLB tràn, cầu phao trôi vào góc sau cống đóng;
    //     kệ dụng cụ đổ (thùng nặng) nằm bên kia hồ. Xích phun trúng van cống, xuồng qua cống kéo bè vào bến q, xích qua cầu ủi kệ vào ô D. Bẫy: xe chở hàng (không phun, không ủi).
    man9('cuu-clb', 3, 'lam-quen', {
      ten: 'Cầu phao qua hồ CLB',
      vo: 'song',
      mucTieu: 'day-thung',
      deBai: 'Hồ CLB tràn, cầu phao trôi vào góc sau cống đóng. Kệ dụng cụ đổ nằm bên kia hồ. Chọn hai bạn: ai mở cống và ủi kệ vào D, ai kéo bè làm cầu?',
      veMaMau: 'Cống còn đóng.',
      san: ['##########', '#....H.D.#', '#B~Kq~~~~#', '#.V......#', '##########'],
      doi: [khe({ x: 4, y: 3, huong: 3 }, { batDauNuoc: { x: 6, y: 2, huong: 3 } }), khe({ x: 7, y: 3, huong: 3 }, { batDauNuoc: { x: 7, y: 2, huong: 3 } })],
      chonDoi: {
        menu: ['CU', 'XU', 'CH'],
        cachMau: [{ chon: ['CU', 'XU'], ghiChu: 'đôi tốt', loiGiai: doiBai([CU_3, XU_3]) }]
      },
      maMau: doiBai([['spray()', 'wait()'], []]),
      loiSai: [
        { moTa: 'Không mở cống: xuồng đâm cống đóng', baiLam: doiBai([['tr_right()', 'wait_n(6)', 'forward(2)', 'tr_right()', 'forward(2)'], XU_3]), phaiCoMa: ['chua-day-thung'] },
        { moTa: 'Xích lên cầu khi bè chưa tới: đâm mặt nước', baiLam: doiBai([['spray()', 'wait()', 'tr_right()', 'forward(2)', 'tr_right()', 'forward(2)'], XU_3]), phaiCoMa: ['chua-day-thung'] },
        { moTa: 'Xuồng lùi hai ô: bè dừng trước bến q', baiLam: doiBai([CU_3, ['forward(4)', 'cast_net()', 'wait()', 'for i in range(2):', '    back()', 'drop_net()', 'wait()']]), phaiCoMa: ['chua-day-thung'] }
      ],
      sao: { o: 33, nhip: 18 },
      goiY: ['Tia phun trúng van V thì cống đổi (đóng ↔ mở).', 'Bè nằm trên bến q là cầu phao.', 'Xích tiến vào thùng nặng thì đẩy thùng đi một ô.'],
      cauDo: { doi: ['CU', 'XU'], lap: null, coChe: ['nuoc', 'van', 'cong', 'phun', 'be', 'luoi', 'thung-nang'], cuu: 'hang', meo: 'lam-cau' }
    }),
    // 4 · song song, cặp #13 Cứu hỏa + Hang động, trộn Nhà máy (thùng nặng) + Hang động (đá chuông): kệ sắt đổ chắn lối xe hang động, tượng đá chuông ngã chắn lối xe cứu hỏa.
    //     Mỗi bạn dọn lối cho bạn kia, cùng lúc: xích ủi kệ vào hốc rồi lùi về lối mình; gai qua chỗ kệ, nghe nốt tượng, hát vỡ tượng. Bẫy: máy khai thác (không ủi thùng nặng, không hát).
    man9('cuu-clb', 4, 'luyen', {
      ten: 'Kệ đổ và tượng đá',
      deBai: 'Kệ sắt đổ chắn lối trên, tượng đá chuông ngã chắn lối dưới. Chọn hai bạn dọn lối cho nhau, cùng lúc, rồi cả hai về cờ.',
      veMaMau: 'Hai lối còn bị chắn.',
      san: ['##########', '###.######', '#..H....F#', '###.######', '###.....F#', '##########'],
      them: { daChuong: [{ x: 5, y: 4, not: 3, ben: 1 }] },
      doi: [khe({ x: 1, y: 2, huong: 1 }, { co: [{ x: 8, y: 2 }] }), khe({ x: 3, y: 4, huong: 0 }, { co: [{ x: 8, y: 4 }] })],
      chonDoi: {
        menu: ['HD', 'CU', 'KT'],
        cachMau: [{ chon: ['HD', 'CU'], ghiChu: 'đôi tốt', loiGiai: doiBai([HD_4, CU_4]) }]
      },
      maMau: doiBai([['wait_n(2)'], ['forward(2)']]),
      loiSai: [
        { moTa: 'Xe hang động hát ngay chỗ xuất phát: tượng xa 6 ô, không vỡ', baiLam: doiBai([['play_note(listen())', 'wait()', 'forward(7)'], CU_4]), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Xe cứu hỏa ủi xong đứng lại giữa lối trên: xe hang động vướng', baiLam: doiBai([HD_4, ['forward(2)']]), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Xe hang động không chờ: đâm kệ chưa ủi', baiLam: doiBai([['forward(3)', 'play_note(listen())', 'forward(4)'], CU_4]), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 29, nhip: 13 },
      goiY: ['Xích tiến vào thùng nặng thì đẩy thùng đi một ô.', 'listen(): nốt của đá chuông gần nhất; loa phá đá trong tầm 3 ô.', 'Hai bạn làm cùng lúc thì mới kịp.'],
      cauDo: { doi: ['HD', 'CU'], lap: null, coChe: ['thung-nang', 'da-chuong', 'not', 'hoc'], cuu: 'hang', meo: 'song-song' }
    }),
    // 5 · làm cầu, cặp #15 Phân loại + Xuồng, trộn Bến sông (bè, cầu phao) + Bãi tái chế (sắt, hố): khung sắt sân khấu rơi xuống đảo giữa hồ CLB, đảo có hố sụt.
    //     Xuồng buộc bè sau đuôi kéo vào bến q làm cầu; nhện qua cầu, bật qua hố, hút khung sắt, mang về kho. Bẫy: drone (bay qua hồ, qua hố, nhưng không có nam châm).
    man9('cuu-clb', 5, 'luyen', {
      ten: 'Khung sắt trên đảo',
      vo: 'song',
      mucTieu: 'dua-vat',
      khung: { chinh: 16, moiHam: 8 },
      deBai: 'Khung sắt sân khấu rơi xuống đảo giữa hồ CLB, đảo có hố sụt. Chọn hai bạn: ai làm cầu sang đảo, ai mang khung sắt vào kho D trên đảo?',
      veMaMau: 'Chưa có cầu sang đảo.',
      san: ['#########', '##..uoD##', '#~q~~~~B#', '#......##', '#########'],
      them: { vatChat: ['.........', '.....s...', '.........', '.........', '.........'] },
      doi: [khe({ x: 2, y: 3, huong: 0 }, { batDauNuoc: { x: 5, y: 2, huong: 3 } }), khe({ x: 6, y: 3, huong: 3 }, { batDauNuoc: { x: 6, y: 2, huong: 3 } })],
      chonDoi: {
        menu: ['PL', 'XU', 'DR'],
        cachMau: [{ chon: ['PL', 'XU'], ghiChu: 'đôi tốt', loiGiai: doiBai([PL_5, XU_5]) }]
      },
      maMau: doiBai([['wait_n(6)'], ['set_length(1)']]),
      loiSai: [
        { moTa: 'Lưới dài 2 (quên set_length(1)): lưới vươn quá bè, không bắt được', baiLam: doiBai([PL_5, ['cast_net("back")', 'wait()', 'forward(5)', 'drop_net()', 'wait()']]), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Nhện đi bộ qua hố: rơi hố', baiLam: doiBai([['wait_n(6)', 'go_up()', 'go_up()', 'go_right()', 'go_right()'], XU_5]), phaiCoMa: ['roi-ho'] },
        { moTa: 'Nhện lên cầu khi bè chưa tới: nhện không bơi', baiLam: doiBai([['wait_n(2)'].concat(PL_5.slice(1)), XU_5]), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 43, nhip: 23 },
      goiY: ['set_length(1): lưới dài 1 ô; cast_net("back"): tung lưới ra sau đuôi.', 'Bè nằm trên bến q là cầu phao.', 'jump("R"): nhện bật qua một ô (qua được hố).'],
      cauDo: { doi: ['PL', 'XU'], lap: null, coChe: ['nuoc', 'be', 'luoi', 'dao', 'ho', 'nhay', 'sat'], cuu: 'hang', meo: 'lam-cau' }
    }),
    // 6 · giữ cửa, cặp #17 Phân loại + Khai thác, trộn Mỏ đá (đá tròn lấp hố) + Bãi tái chế / Hang (gầm thấp, nút đè): sân khấu CLB đổ, nút giữ cửa kho đạo cụ nằm dưới gầm sân khấu.
    //     Máy khai thác hất đá lấp hố sụt rồi chạy qua cửa; nhện co chân chui gầm, đứng giữ nút. Bẫy: xe chở hàng (không chui gầm, không lấp hố).
    man9('cuu-clb', 6, 'cung-co', {
      ten: 'Nút dưới gầm sân khấu',
      vo: 'mo-da',
      deBai: 'Sân khấu CLB đổ. Nút giữ cửa kho đạo cụ nằm dưới gầm sân khấu, lối trên có hố sụt. Chọn hai bạn: ai lấp hố và qua cửa, ai chui gầm giữ nút?',
      veMaMau: 'Cửa kho còn đóng.',
      san: ['##########', '#.ou..C.F#', '##########', '#.nMF#####', '##########'],
      noi: [{ nut: { x: 3, y: 3 }, cua: [{ x: 6, y: 1 }] }],
      them: { vatDang: ['..........', '..r.......', '..........', '..........', '..........'] },
      doi: [khe({ x: 1, y: 1, huong: 1 }, { co: [{ x: 8, y: 1 }] }), khe({ x: 1, y: 3, huong: 1 }, { co: [{ x: 4, y: 3 }] })],
      chonDoi: {
        menu: ['KT', 'PL', 'CH'],
        cachMau: [{ chon: ['KT', 'PL'], ghiChu: 'đôi tốt', loiGiai: doiBai([KT_6, PL_6]) }]
      },
      maMau: doiBai([['lob()'], ['crouch()']]),
      loiSai: [
        { moTa: 'Nhện quên co chân: đâm gầm sân khấu', baiLam: doiBai([KT_6, ['go_right()', 'go_right()', 'wait_n(2)', 'go_right()']]), phaiCoMa: ['gam-thap'] },
        { moTa: 'Nhện rời nút ngay: cửa đóng trước mũi máy khai thác', baiLam: doiBai([KT_6, ['crouch()', 'go_right()', 'go_right()', 'stand()', 'go_right()']]), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Không hất đá: máy khai thác vướng đá, hố còn đó', baiLam: doiBai([['wait()', 'forward(7)'], PL_6]), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 23, nhip: 11 },
      goiY: ['crouch(): nhện co chân chui gầm thấp; stand(): đứng lên.', 'lob(): hất vật trước mũi xa 2 ô; đá rơi xuống hố thì lấp hố.', 'Nút đè chỉ giữ cửa mở khi có robot đứng trên nút.'],
      cauDo: { doi: ['KT', 'PL'], lap: null, coChe: ['gam', 'nut-de', 'cua', 'ho', 'da-tron', 'san-khau'], cuu: 'hang', meo: 'giu-cua' }
    }),
    // 7 · dọn lối (bảng ghi "thứ tự": không có trong 12 mẹo, giữ ý thứ tự trong coChe), cặp #21 Cần cẩu + Khai thác, trộn Cảng (container) + Mỏ đá (ném đá lấp hố): container văng vào lối, sau đó là hố sụt. Cẩu nhấc container trước,
    //     máy khai thác tiến tới đúng chỗ (cách hố 2 ô) rồi mới ném: ném sớm thì đá rơi chắn lối. Bẫy: xe cứu hỏa (không nhấc container, không ném). Mọi khe trên dải ray.
    man9('cuu-clb', 7, 'van-dung', {
      ten: 'Nhấc trước, ném sau',
      vo: 'cang',
      mucTieu: 'dua-vat',
      khung: { chinh: 16, moiHam: 8 },
      deBai: 'Container văng vào lối, sau đó là hố sụt. Đá tròn nằm sẵn trước mũi máy khai thác. Chọn hai bạn và làm đúng thứ tự: dọn container, tới đúng chỗ rồi mới ném đá lấp hố; thùng loa sau hố vào kho D.',
      veMaMau: 'Container còn chắn lối.',
      san: ['###########', '#.....u.oD#', '##o.#######', '##RR#######', '###########'],
      them: { contChan: true, chong: [{ x: 3, y: 1, cont: [{ so: 21 }] }], vatDang: ['...........', '...........', '..r........', '...........', '...........'] },
      doi: [khe({ x: 3, y: 3, huong: 0, nac: 0, tam: 2 }), khe({ x: 2, y: 3, huong: 0 })],
      chonDoi: {
        menu: ['CC', 'KT', 'CU'],
        cachMau: [{ chon: ['CC', 'KT'], ghiChu: 'đôi tốt', loiGiai: doiBai([CC_7, KT_7]) }]
      },
      maMau: doiBai([[], ['load()', 'wait()', 'forward(2)', 'turn_right()']]),
      loiSai: [
        { moTa: 'Ném sớm (ngay khi lên lối trên): đá rơi chắn lối, hố còn nguyên', baiLam: doiBai([CC_7, ['load()', 'wait()', 'forward(2)', 'turn_right()', 'throw()', 'wait()', 'forward(5)', 'load()', 'wait()', 'throw()', 'wait()']]), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Cẩu không nhấc container: máy khai thác đâm container', baiLam: doiBai([[], KT_7]), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Ném thùng tầm 1 (aim(1)): thùng rơi lại trước mũi, chưa vào kho', baiLam: doiBai([CC_7, KT_7.slice(0, -2).concat(['aim(1)', 'throw()', 'wait()'])]), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Ném muộn (tiến 3 ô): đứng sát hố, đá bay qua hố', baiLam: doiBai([CC_7, ['load()', 'wait()', 'forward(2)', 'turn_right()', 'forward(3)', 'throw()', 'wait()', 'forward(2)', 'load()', 'wait()', 'throw()', 'wait()']]), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 27, nhip: 15 },
      goiY: ['Container chắn lối như tường: nhờ cẩu nhấc đi trước.', 'throw(): đá trong rổ bay xa 2 ô; rơi xuống hố thì lấp hố, rơi xuống lối thì chắn lối.', 'retract(): thu cần một ô.'],
      cauDo: { doi: ['CC', 'KT'], lap: null, coChe: ['container', 'ray', 'ho', 'da-tron', 'nem', 'thu-tu'], cuu: 'hang', meo: 'don-loi' }
    }),
    // 8 · cứu người, dọn lối (bảng: cặp HD + CC, "gai phát nốt dẫn bác đi theo tiếng": lõi chưa có người đi theo tiếng, đổi thành gai hát vỡ tượng đá chuông chắn lối bác),
    //     trộn Kho (người trên cạn) + Cảng (container) + Hang (đá chuông): bác bảo vệ kẹt trong dãy kho, tượng đá chuông đổ chắn lối ra; container văng chắn hành lang dưới.
    //     Cẩu nhấc container, gai qua chỗ vừa dọn tới dưới tượng, hát vỡ tượng; bác tự đi về trạm cứu. Bẫy: robot phân loại (không hát, không nhấc container). Mọi khe trên dải ray.
    man9('cuu-clb', 8, 'van-dung', {
      ten: 'Bác bảo vệ trong kho',
      mucTieu: 'cuu-nguoi',
      deBai: 'Bác bảo vệ kẹt trong dãy kho, tượng đá chuông đổ chắn lối ra. Hành lang dưới có container văng chắn. Chọn hai bạn mở lối cho bác về trạm cứu.',
      veMaMau: 'Tượng đá còn chắn lối bác.',
      san: ['###########', '#.........#', '###########', '##.......##', '##RRRR.####', '###########'],
      them: { contChan: true, chong: [{ x: 5, y: 3, cont: [{ so: 8 }] }], daChuong: [{ x: 7, y: 1, not: 5, ben: 1 }], nguoi: [{ x: 1, y: 1 }], tramCuu: [{ x: 9, y: 1 }] },
      doi: [khe({ x: 3, y: 4, huong: 0 }), khe({ x: 5, y: 4, huong: 0, nac: 0, tam: 1 })],
      chonDoi: {
        menu: ['HD', 'CC', 'PL'],
        cachMau: [{ chon: ['HD', 'CC'], ghiChu: 'đôi tốt', loiGiai: doiBai([HD_8, CC_8]) }]
      },
      maMau: doiBai([['forward(1)'], []]),
      loiSai: [
        { moTa: 'Cẩu không nhấc container: xe hang động kẹt, hát xa tượng 5 ô', baiLam: doiBai([['forward(1)', 'turn_right()', 'forward(4)', 'play_note(listen())'], []]), phaiCoMa: ['chua-cuu-nguoi'] },
        { moTa: 'Xe hang động hát khi mới qua container: tượng cách 4 ô', baiLam: doiBai([['forward(1)', 'turn_right()', 'forward(2)', 'play_note(listen())'], CC_8]), phaiCoMa: ['chua-cuu-nguoi'] },
        { moTa: 'Cẩu hạ container lại xuống hành lang: xe hang động kẹt', baiLam: doiBai([HD_8, ['pick_up()', 'set_down()']]), phaiCoMa: ['chua-cuu-nguoi'] }
      ],
      sao: { o: 20, nhip: 11 },
      goiY: ['Container chắn lối như tường: nhờ cẩu nhấc đi trước.', 'listen(): nốt của đá chuông gần nhất; loa phá đá trong tầm 3 ô (đếm ngang + dọc).', 'Người tự bước về trạm cứu khi ô kế trên lối trống.'],
      cauDo: { doi: ['HD', 'CC'], lap: null, coChe: ['nguoi', 'container', 'ray', 'da-chuong', 'not', 'kho'], cuu: 'nguoi', meo: 'don-loi' }
    }),
    // 9 · cứu máy, đọc rồi chọn (phong phú: Nhà máy thùng nặng + Kho nút đè + R3), bảng 4 cỗ máy: xe chở hàng cũ của CLB (R3, khoá) đi từng ô, bị chắn thì chờ (while not front_clear()).
    //     Kệ sắt đổ chắn lối, cửa kho đóng, nút giữ cửa ở xa. Hai cặp đều qua: xích + xe chở hàng (nhanh, trong trần nhịp) hay xích + nhện (mỗi bước hai nhịp: qua, nhưng quá trần).
    //     Bẫy: xuồng (sân không có nước). Đọc chương trình máy khách để biết nó chờ, rồi chọn bạn tới nút nhanh nhất.
    man9('cuu-clb', 9, 'bien-the', {
      ten: 'Xe chở hàng cũ của CLB',
      khung: { chinh: 14, moiHam: 8 },
      deBai: 'Xe chở hàng cũ của CLB đi từng ô, ô trước bị chắn thì đứng chờ. Kệ sắt đổ chắn lối, cửa kho đóng, nút giữ cửa ở xa. Đọc chương trình của nó, chọn hai bạn để nó về cờ nhanh nhất. Ba bạn về cờ.',
      veMaMau: 'Đọc chương trình của máy khách: ô trước bị chắn thì chờ.',
      san: ['###########', '###.#######', '#..H..C..F#', '###F##MF###', '#......#~~#', '###########'],
      noi: [{ nut: { x: 6, y: 3 }, cua: [{ x: 6, y: 2 }] }],
      doi: [khe({ x: 3, y: 3, huong: 0 }, { co: [{ x: 3, y: 3 }], batDauNuoc: { x: 8, y: 4, huong: 1 } }), khe({ x: 1, y: 4, huong: 1 }, { co: [{ x: 7, y: 3 }], batDauNuoc: { x: 9, y: 4, huong: 3 } }),
        may('CH', { x: 1, y: 2, huong: 1 }, { son: 'tim', coDinh: true, co: [{ x: 9, y: 2 }] })],
      chonDoi: {
        menu: ['CH', 'CU', 'PL', 'XU'],
        cachMau: [{ chon: ['CU', 'CH'], ghiChu: 'đôi tốt', loiGiai: doiBai([CU_9, CH_9, R3_9]) },
          { chon: ['CU', 'PL'], ghiChu: 'qua được, nhưng nhện mỗi bước hai nhịp: quá trần', loiGiai: doiBai([CU_9, PL_9, R3_9]) }]
      },
      maMau: doiBai([[], [], R3_9]),
      loiSai: [
        { moTa: 'Không ủi kệ: máy khách chờ mãi trước kệ', baiLam: doiBai([[], CH_9, R3_9]), phaiCoMa: ['qua-nhieu-nhip'] },
        { moTa: 'Xe quay nhầm phải: không lên nút, máy khách chờ mãi trước cửa', baiLam: doiBai([CU_9, ['forward(5)', 'turn_right()', 'forward(1)', 'turn_left()', 'forward(1)'], R3_9]), phaiCoMa: ['qua-nhieu-nhip'] },
        { moTa: 'Xích ủi xong đứng lại giữa lối: máy khách chờ mãi', baiLam: doiBai([['forward(1)'], CH_9, R3_9]), phaiCoMa: ['qua-nhieu-nhip'] }
      ],
      sao: { o: 28, nhip: 13 },
      goiY: ['while not front_clear(): wait(): máy khách đứng chờ khi ô trước bị chắn.', 'Xích tiến vào thùng nặng thì đẩy thùng đi một ô.', 'Nhện mỗi bước mất hai nhịp: ai tới nút nhanh hơn?'],
      cauDo: { doi: ['CU', 'CH'], lap: null, coChe: ['thung-nang', 'nut-de', 'cua', 'r3', 'cho-truoc'], cuu: 'may', meo: 'doc-roi-chon' }
    }),
    // 10 · song ca đoạn 9 (Bè 1: 5 5 4 4 3 3 2 2 | Bè 2: 7 7 6 6 5 5 4 4), giữ cho gói 10 ghép bài; dùng play_part (cuu-kho-hang.10 tạo).
    //      Bảng đủ 8 cỗ máy, được chọn trùng: chỉ cỗ máy có loa mới hát được (xe hang động), nên đôi tốt là hai xe hang động. Hát tại chỗ (màn choi-dieu có ô F thì lõi không cho thắng).
    //      Mọi khe trên dải ray (cẩu đứng được), dưới mỗi khe là ô hồ (xuồng xuất phát được). Khối đá chuông trên hồ vỡ khi nghe nốt 2 của bè 1 (chỉ để nhìn).
    man9('cuu-clb', 10, 'trum', {
      ten: 'Song ca sân CLB',
      mucTieu: 'choi-dieu',
      deBai: 'Sân CLB đã gọn! Song ca đoạn 9. Bảng có đủ tám cỗ máy: chọn hai bạn hát được, rồi mỗi bạn gọi play_part với bè của mình.',
      veMaMau: 'Bè 2 mới có một nốt.',
      hamCuaEmCan: ['play_note', 'play_part'],
      san: ['#######', '#RRRRR#', '#~~~~~#', '#######'],
      doi: [khe({ x: 1, y: 1, huong: 0, nac: 2, tam: 1 }, { batDauNuoc: { x: 1, y: 2, huong: 1 } }), khe({ x: 3, y: 1, huong: 0, nac: 2, tam: 1 }, { batDauNuoc: { x: 3, y: 2, huong: 1 } })],
      them: { dieu: { r1: '5 5 4 4 3 3 2 2', r2: '7 7 6 6 5 5 4 4' }, daChuong: [{ x: 2, y: 2, not: 2, ben: 1 }] },
      chonDoi: {
        menu: ['CH', 'CU', 'PL', 'CC', 'XU', 'DR', 'KT', 'HD'], trung: true,
        cachMau: [{ chon: ['HD', 'HD'], ghiChu: 'đôi tốt: chỉ xe hang động có loa', loiGiai: doiBai([[BE1_9], [BE2_9]]) }]
      },
      maMau: doiBai([[BE1_9], ['play_note(7)']]),
      loiSai: [
        { moTa: 'Bè 2 mới phát một nốt', baiLam: doiBai([[BE1_9], ['play_note(7)']]), phaiCoMa: ['lo-nhip'] },
        { moTa: 'Bè 2 đảo hai nốt giữa', baiLam: doiBai([[BE1_9], ['play_part([7, 7, 6, 5, 6, 5, 4, 4])']]), phaiCoMa: ['sai-not'] },
        { moTa: 'R2 hát nhầm bè 1', baiLam: doiBai([[BE1_9], [BE1_9]]), phaiCoMa: ['sai-not'] }
      ],
      sao: { o: 7, nhip: 10 },
      goiY: ['Cỗ máy nào có loa thì mới hát được.', 'Bè 2: play_part([7, 7, 6, 6, 5, 5, 4, 4]).', 'Hai bạn bắt đầu cùng một nhịp.'],
      cauDo: { doi: ['HD', 'HD'], lap: null, coChe: ['loa', 'da-chuong', 'clb', 'chon-may-hat'], cuu: null, meo: 'song-song' }
    }),
    /* ========================================================================
       CHƯƠNG 2: lap-clb (10 màn) · R1 đặt sẵn đổi mỗi màn, R2 Luna tự lắp từ bảng 3 thẻ mỗi khe, không gợi ý tổ hợp
       ======================================================================== */
    // 11 · dọn lối (kéo), R1 đặt sẵn xe chở hàng; R2 lai L3 xe tời bờ, trộn Kho (thùng gỗ, kho) + Bến (tay lưới): thùng loa đổ giữa lối, kẹp của xe chở hàng đang bận giữ thùng khác.
    //      R2 tự lắp xe có bánh + tay lưới, tung lưới kéo thùng loa vào hốc chứa D2 bên lối. Cách hai omni + lưới đắt hơn mà nhanh hơn (trượt, không quay).
    man9('lap-clb', 1, 'lam-quen', {
      ten: 'Kéo thùng khỏi lối',
      mucTieu: 'dua-vat',
      deBai: 'Xe chở hàng mang thùng dụng cụ vào kho, nhưng thùng loa đổ giữa lối. Kẹp của nó đang bận. Lắp cho Luna một robot kéo thùng loa vào hốc chứa bên lối.',
      veMaMau: 'R2 chưa có chương trình.',
      san: ['##########', '#.o..o..D#', '#####D####', '#.....####', '##########'],
      doi: [may('CH', { x: 1, y: 1, huong: 1 }), khe({ x: 2, y: 3, huong: 0 }, { son: 'lam' })],
      lapRap: lapR2(['hai-banh', 'omni', 'nhen'], ['day-keo', 'kep', 'nam-cham'], ['khoang-cach', 'hong-ngoai'], 8, [
        cach('hai-banh', 'day-keo', null, [CH_11A, BANH_11]),
        cach('omni', 'day-keo', null, [CH_11B, OMNI_11])
      ], { moLai: ['L3'] }),
      maMau: doiBai([CH_11A, []]),
      loiSai: [
        { moTa: 'Kéo khi chưa tới dưới hốc (tiến 2 ô): dây vướng tường', baiLam: doiBai([CH_11A, ['turn_right()', 'forward(2)', 'turn_left()', 'cast_net()', 'wait()']]), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Xe chở hàng không chờ: đâm thùng loa giữa lối', baiLam: doiBai([['pick()', 'forward(6)', 'drop()'], BANH_11]), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên quay lên: dây tung sang phải, vướng tường', baiLam: doiBai([CH_11A, ['turn_right()', 'forward(3)', 'cast_net()', 'wait()']]), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 36, nhip: 15 },
      goiY: ['Tay lưới trên xe có bánh (xe tời bờ): cast_net() kéo thùng gỗ cách 2 ô về ô trước mũi.', 'Omni trượt ngang được, không cần quay.', 'Thùng nằm trên ô D2 là đã vào hốc chứa.'],
      cauDo: { doi: null, lap: 'hai-banh+day-keo', coChe: ['thung', 'keo', 'kho', 'hoc'], cuu: 'hang', meo: 'don-loi' }
    }),
    // 12 · tiếp sức, R1 đặt sẵn máy khai thác (đổi chỗ với #14: xuồng đặt sẵn sang #14), trộn Nhà máy (gầu ngoạm L8) + Bãi tái chế (nhện, sắt, clear_iron) + Mỏ đá (ném qua tường):
    //      thanh sắt trong hốc kín sau tường; R2 tự lắp lấy ra đặt trước mũi máy khai thác, máy khai thác ném qua tường vào kho D.
    man9('lap-clb', 2, 'lam-quen', {
      ten: 'Thanh sắt trong hốc kín',
      mucTieu: 'dua-vat',
      hamCuaEmCan: HAM_EM.concat(['clear_iron']),
      deBai: 'Thanh sắt của giàn đèn rơi vào hốc kín sau tường. Máy khai thác ném được vào kho nhưng không tới được hốc. Lắp cho Luna một robot lấy thanh sắt ra trước mũi máy khai thác.',
      veMaMau: 'R2 chưa có chương trình. Máy khai thác chưa biết phải chờ bao lâu.',
      san: ['##########', '######oRR#', '#######.##', '#D#.....##', '##########'],
      doi: [may('KT', { x: 7, y: 3, huong: 0 }), khe({ x: 7, y: 1, huong: 0, nac: 3, tam: 1 }, { son: 'lam' })],
      them: { vatChat: ['..........', '......s...', '..........', '..........', '..........'] },
      lapRap: lapR2(['cau', 'nhen', 'hai-banh'], ['kep', 'nam-cham', 'moc-cau'], [], 8, [
        cach('cau', 'kep', null, [KT_12A, GAU_12]),
        cach('nhen', 'nam-cham', null, [KT_12B, NHEN_12])
      ], { moLai: ['L8'] }),
      maMau: doiBai([KT_12A, []]),
      loiSai: [
        { moTa: 'Máy khai thác không chờ: nạp hụt khi thanh sắt chưa tới', baiLam: doiBai([['x = 7', 'load()', 'wait()', 'turn_left()', 'forward(x - 3)', 'throw()', 'wait()'], GAU_12]), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Gầu ngoạm rồi thả lại ngay trong hốc', baiLam: doiBai([KT_12A, ['grab()', 'release()']]), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'forward(x - 4): ném từ cột 4, thanh sắt rơi trúng tường kho', baiLam: doiBai([['x = 7', 'wait_n(3)', 'load()', 'wait()', 'turn_left()', 'forward(x - 4)', 'throw()', 'wait()'], GAU_12]), phaiCoMa: ['nem-vo'] }
      ],
      sao: { o: 24, nhip: 12 },
      goiY: ['Gầu ngoạm thả từ đầu cần xuống: grab() ngoạm qua tường, release() thả ở ô đầu cần.', 'Nhện đứng lên sắt mới hút được: clear_iron(d) hút rồi bước một ô.', 'Máy khai thác nạp vật ở ô trước mũi, ném xa 2 ô, bay qua tường.'],
      cauDo: { doi: null, lap: 'cau+kep', coChe: ['sat', 'qua-tuong', 'nem', 'kho'], cuu: 'hang', meo: 'tiep-suc' }
    })
  ];

  ManHoc.manCuuClb = DS_MAN;
})();
