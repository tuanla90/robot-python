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
    })
  ];

  ManHoc.manNgayHoiClb = DS_MAN;
})();
