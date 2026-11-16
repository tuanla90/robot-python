/* ============================================================================
   man-cuu-ben-song.js - Mùa 9 CLB Sáng Tạo: Gói 5 "Bến sông sau bão" (dựng lại 16/11, M9M5, theo khuôn G3 / G4)
   20 màn: cuu-ben-song (chọn đội trong menu cỗ máy) + lap-ben-song (R1 xuồng thủy lợi đặt sẵn, R2 tự lắp; lai L3 L10 L14, T3).
   Ôn Python: return, tuple (h, s = flow()), min / max.
   Câu đố: hoc/MUA-9-200-CAU-DO.md mục G5 (ghi chú "Đã dựng 16/11 (M9M5)": các chỗ lệch so với bảng).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  /* ---- M9M5: khung màn mùa 9 (chép từ man-cuu-cang-song.js) ------------------------------------------ */
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
  function xuongLoa(r) { r.chinhLuoi = false; return r; }
  function man9(chuong, so, hang, cfg) {
    var r1 = cfg.doi[0];
    var m = {
      chuong: chuong, so: so, ten: cfg.ten, hang: hang, vo: 'song', daLapHo: true,
      cauTruc: ['for', 'if', 'while', 'list', 'def', 'return', 'tuple'], vaHoac: true, moXuong: true, camHamCuaEm: false,
      hamCuaEmCan: cfg.hamCuaEmCan || HAM_EM, taoHam: cfg.taoHam || [],
      khung: cfg.khung || { chinh: 12, moiHam: 8 }, mucTieu: cfg.mucTieu || 'dua-vat',
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

  ManHoc.manCuuBenSong = [
    /* ========================================================================
       CHƯƠNG 1: cuu-ben-song (10 màn)
       ======================================================================== */
    // 1 · show (làm cầu): lũ làm sụt bờ thành hố, cầu phao trôi mất. Máy khai thác nạp đá tròn, ném lấp hố bờ; xuồng tung lưới bắt bè, lùi hai ô
    //     kéo bè về bến q làm cầu phao, nhả lưới. Máy khai thác qua hố đã lấp, lên cầu phao, nạp bao hàng ở bờ bên kia, lùi về, quay trái ném vào ô đích D.
    //     Mục tiêu đưa vật: bè nằm trên q (cầu) và bao hàng trong D; đá lấp hố không cần về đích. Đội cố định XU + KT (chạy sẵn, khoá).
    man9('cuu-ben-song', 1, 'lam-quen', {
      ten: 'Cầu phao qua bờ sụt',
      chiChay: true,
      deBai: 'Lũ làm sụt bờ, cuốn mất cầu phao. Máy khai thác ném đá lấp hố, xuồng kéo bè làm cầu, rồi máy khai thác sang lấy bao hàng. Bấm Chạy.',
      veMaMau: 'Bấm Chạy xem mỗi bạn làm gì.',
      san: ['########', '#..o...#', '#~~q~B~#', '#..u...#', '#..o...#', '#D.....#', '########'],
      doi: [may('XU', { x: 3, y: 2, huong: 1 }), may('KT', { x: 3, y: 5, huong: 0 }, { son: 'lam' })],
      them: { vatDang: ['........', '........', '........', '........', '...r....', '........', '........'] },
      maMau: doiBai([['cast_net()', 'wait()', 'back()', 'back()', 'drop_net()', 'wait()'],
        ['load()', 'wait()', 'throw()', 'wait()', 'forward(3)', 'load()', 'wait()', 'for i in range(3):', '    back()', 'turn_left()', 'throw()', 'wait()']]),
      loiGiai: doiBai([['cast_net()', 'wait()', 'back()', 'back()', 'drop_net()', 'wait()'],
        ['load()', 'wait()', 'throw()', 'wait()', 'forward(3)', 'load()', 'wait()', 'for i in range(3):', '    back()', 'turn_left()', 'throw()', 'wait()']]),
      sao: { o: 33, nhip: 13 },
      goiY: ['Bè nằm trên bến q là cầu phao: xe đi qua được.', 'throw(): ném vật trong rổ xa 2 ô; rơi trúng hố thì lấp hố.'],
      cauDo: { doi: ['XU', 'KT'], lap: null, coChe: ['nuoc', 'be', 'luoi', 'ho', 'nem'], cuu: 'hang', meo: 'lam-cau' }
    }),
    // 2 · dọn lối: lũ cuốn tảng đá tròn nằm giữa luồng nước, chắn đường xuồng kéo bè; bè hàng kẹt sau cống đóng. Xuồng tung lưới lên trúng van cống V (cống mở cuối nhịp),
    //     quay trái tung lưới bắt bè, lùi năm ô qua ô đá vừa dọn và qua cống, kéo bè vào bến q, nhả lưới. Máy khai thác đứng trên bờ nạp tảng đá ở ô nước trước mũi,
    //     quay phải ném lấp hố bờ sụt (đá lấp hố không cần về đích). Bảng 2 cỗ máy (đúng đôi tốt).
    man9('cuu-ben-song', 2, 'lam-quen', {
      ten: 'Đá chắn luồng',
      deBai: 'Tảng đá lũ cuốn chắn luồng nước. Bè hàng kẹt sau cống đóng. Dọn đá, gạt van, kéo bè vào bến q.',
      veMaMau: 'Xuồng lùi vướng tảng đá.',
      san: ['##########', '#........#', '#..V.....#', '#.u~.#####', '#B~~~Kq~~#', '##########'],
      doi: [khe({ x: 4, y: 3, huong: 2 }, { batDauNuoc: { x: 3, y: 4, huong: 0 } }), khe({ x: 4, y: 3, huong: 2 }, { batDauNuoc: { x: 3, y: 4, huong: 0 } })],
      them: { vatThem: [{ x: 4, y: 4 }] },
      chonDoi: {
        menu: ['XU', 'KT'],
        cachMau: [{ chon: ['XU', 'KT'], ghiChu: 'đôi tốt', loiGiai: doiBai([
          ['cast_net()', 'wait()', 'turn_left()', 'cast_net()', 'wait()', 'for i in range(5):', '    back()', 'drop_net()', 'wait()'],
          ['load()', 'wait()', 'turn_right()', 'throw()', 'wait()']]) }]
      },
      maMau: doiBai([['cast_net()', 'wait()', 'turn_left()', 'cast_net()', 'wait()', 'for i in range(5):', '    back()', 'drop_net()', 'wait()'], []]),
      loiSai: [
        { moTa: 'Máy khai thác không dọn đá: xuồng lùi vướng đá', baiLam: doiBai([['cast_net()', 'wait()', 'turn_left()', 'cast_net()', 'wait()', 'for i in range(5):', '    back()', 'drop_net()', 'wait()'], []]), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Máy khai thác quên quay: đá ném vào bờ, vỡ', baiLam: doiBai([['cast_net()', 'wait()', 'turn_left()', 'cast_net()', 'wait()', 'for i in range(5):', '    back()', 'drop_net()', 'wait()'], ['load()', 'wait()', 'throw()', 'wait()']]), phaiCoMa: ['nem-vo'] },
        { moTa: 'Không gạt van: cống đóng, bè không qua', baiLam: doiBai([['turn_left()', 'cast_net()', 'wait()', 'for i in range(5):', '    back()', 'drop_net()', 'wait()'], ['load()', 'wait()', 'turn_right()', 'throw()', 'wait()']]), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 26, nhip: 12 },
      goiY: ['Lưới bay thẳng tới van V: van đổi, cống mở.', 'Đá lấp hố thì không cần về đích.'],
      cauDo: { doi: ['XU', 'KT'], lap: null, coChe: ['nuoc', 'van', 'cong', 'be', 'luoi', 'ho', 'nem'], cuu: 'hang', meo: 'don-loi' }
    }),
  ];
})();
