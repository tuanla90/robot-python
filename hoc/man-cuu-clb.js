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
    })
  ];

  ManHoc.manCuuClb = DS_MAN;
})();
