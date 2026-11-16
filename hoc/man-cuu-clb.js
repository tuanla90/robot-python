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
   *  Máy khai thác chờ thùng, nạp vào rổ, tiến một ô cho sát tường, ném xa 2 ô qua tường vào D. */
  var CH_2 = ['pick()', 'forward(1)', 'drop()'];
  var KT_2 = ['wait_n(4)', 'load()', 'wait()', 'forward(1)', 'throw()', 'wait()'];

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
    //     Xe chở hàng gắp thùng, đặt trước mũi máy khai thác; máy khai thác nạp, tiến một ô sát tường, ném qua tường vào D. Bẫy: drone (không mang thùng gỗ).
    man9('cuu-clb', 2, 'lam-quen', {
      ten: 'Ném thùng qua tường kho',
      mucTieu: 'dua-vat',
      deBai: 'Tường kho CLB đổ, bít cửa. Thùng dụng cụ phải vào ô D sau tường. Chọn hai bạn: ai mang thùng tới, ai ném qua tường?',
      veMaMau: 'Thùng còn nằm ngoài sân.',
      san: ['#######', '###D###', '#######', '#.o...#', '###.###', '#######'],
      doi: [khe({ x: 1, y: 3, huong: 1 }), khe({ x: 3, y: 4, huong: 0 })],
      chonDoi: {
        menu: ['CH', 'KT', 'DR'],
        cachMau: [{ chon: ['CH', 'KT'], ghiChu: 'đôi tốt', loiGiai: doiBai([CH_2, KT_2]) }]
      },
      maMau: doiBai([['pick()'], []]),
      loiSai: [
        { moTa: 'Máy khai thác ném ngay chỗ xuất phát: thùng rơi trúng tường, vỡ', baiLam: doiBai([CH_2, ['wait_n(4)', 'lob()']]), phaiCoMa: ['nem-vo'] },
        { moTa: 'Xe thả thùng tại chỗ (không tiến): máy khai thác nạp hụt', baiLam: doiBai([['pick()', 'drop()'], KT_2]), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Máy khai thác không chờ: nạp khi thùng chưa tới', baiLam: doiBai([CH_2, ['load()', 'wait()', 'forward(1)', 'throw()', 'wait()']]), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 31, nhip: 9 },
      goiY: ['load(): nạp vật ở ô trước mũi vào rổ. throw(): ném xa 2 ô, bay qua tường.', 'Vật rơi trúng tường thì vỡ.', 'drop(): xe thả thùng ở ô trước mũi.'],
      cauDo: { doi: ['CH', 'KT'], lap: null, coChe: ['thung', 'nem', 'tuong', 'kho'], cuu: 'hang', meo: 'tiep-suc' }
    })
  ];

  ManHoc.manCuuClb = DS_MAN;
})();
