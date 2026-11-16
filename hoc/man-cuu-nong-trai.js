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
  ];
})();
