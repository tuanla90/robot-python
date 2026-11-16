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
  /** R2 đã lắp sẵn (màn show chương 2): omni + tay lưới + radar (lai L3 xe tời bờ), như LapRap.apDung lắp ra. */
  var OMNI_L3 = {
    loaiRobot: 'omni', chinhLuoi: true, nhanDang: true, robot: { than: 'omni', tay: 'day-keo', camBien: [{ ma: 'radar', o: 'tren', nhanDang: true }], son: 'lam' },
    hamGoc: ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'slide_left', 'slide_right', 'cast_net', 'drop_net', 'set_length', 'radar', 'shape']
  };
  function xuongLoa(r) { r.chinhLuoi = false; return r; }
  /** cuu-ben-song.4 (ba sân): ngã ba kênh ở ô (4, 3); nhánh trái (hàng 3, x 1–3), nhánh trên (cột 4, y 0–2), nhánh phải (hàng 3, x 5–7) chảy về ngã ba.
   *  Mỗi sân một bộ sức (0 = nước êm); bến nhận bè q chỉ có ở ô đầu nhánh nước êm (nq: 'trai' | 'tren' | 'phai'). */
  function san4(nq) {
    return ['####~####', '####~####', '###u' + (nq === 'tren' ? 'q' : '~') + '####', '#~~' + (nq === 'trai' ? 'q' : '~') + '~' + (nq === 'phai' ? 'q' : '~') + '~~#',
      '###.~####', '#..#~#..#', '#..#~#..#', '####B####', '#########'];
  }
  /** Xuồng cuu-ben-song.4: bắt bè phía sau, tới ngã ba, đọc ba nhánh (trên, trái, phải), chọn nhánh sức nhỏ nhất. Máy khai thác: nạp đá chắn cửa kênh, ném lấp hố. */
  var XU_4 = ['cast_net("back")', 'wait()', 'forward(2)', 'h, a = flow()', 'turn_left()', 'h, b = flow()', 'turn_right()', 'turn_right()', 'h, c = flow()', 'm = min(a, b, c)',
    'if m == a:', '    turn_left()', 'if m == b:', '    turn_right()', '    turn_right()', 'forward(3)', 'drop_net()', 'wait()'];
  var KT_4 = ['load()', 'wait()', 'turn_left()', 'throw()', 'wait()'];
  /** cuu-ben-song.6: xuồng chờ nhện rời bè, bắt bè phía sau, chạy vòng kênh phải sang lạch trên, nhả bè ở (3, 2). Nhện: qua bè lên cồn hút hòm sắt, chờ cầu thứ hai, lên bờ trên thả vào đích. */
  var XU_6 = ['set_length(1)', 'wait_n(4)', 'cast_net("back")', 'wait()', 'forward(2)', 'turn_left()', 'forward(2)', 'turn_left()', 'forward(4)', 'drop_net()', 'wait()'];
  var PL_6 = ['go_up()', 'go_up()', 'pull_s()', 'wait_n(8)', 'go_up()', 'go_up()', 'magnet_off()', 'wait()'];
  /** Xuồng khách khoá cuu-ben-song.7: lưới dài 1 bắt bè sau đuôi, chờ 5 nhịp, chạy thẳng 6 ô qua cống (bè theo sau vào bến q), nhả lưới. */
  var XU_R3_7 = ['set_length(1)', 'cast_net("back")', 'wait()', 'wait_n(4)', 'forward(6)', 'drop_net()', 'wait()'];
  /** cuu-ben-song.8: xe cứu hỏa chờ drone rắc cát, chạy vào dải bùn (trượt tới ô cát dưới van), quay lên phun van. Xuồng khách khoá: bắt bè sau đuôi, chờ, chạy ra bến. */
  var CU_8 = ['wait_n(3)', 'move()', 'spray()', 'wait()'];
  var DR_8 = ['go_down()', 'dot()', 'go_up()', 'land()'];
  var XU_R3_8 = ['set_length(1)', 'cast_net("back")', 'wait()', 'wait_n(7)', 'forward(5)', 'drop_net()', 'wait()'];
  /** cuu-ben-song.9: cẩu nhấc container chắn lối bờ, quay trái một nấc hạ lên bãi. Máy khai thác xuống bờ, chạy dọc lối, quay xuống nạp đá giữa luồng, quay trái ném lấp hố. Xuồng khách khoá. */
  var CC_9 = ['pick_up()', 'swing_left()', 'set_down()'];
  var KT_9 = ['turn_right()', 'turn_right()', 'move()', 'turn_left()', 'forward(5)', 'turn_right()', 'load()', 'wait()', 'turn_left()', 'throw()', 'wait()'];
  var XU_R3_9 = ['set_length(1)', 'cast_net("back")', 'wait()', 'wait_n(8)', 'forward(7)', 'drop_net()', 'wait()'];
  /** lap-ben-song.2: xuồng R1 tung lưới sang trái bắt bè thứ nhất, lùi một ô kéo bè vào bến q, nhả. */
  var XU_12 = ['cast_net()', 'wait()', 'back()', 'drop_net()', 'wait()'];
  /** lap-ben-song.3 (ba sân): lục bình L chắn luồng hàng 1 ở cột c; bến q của lục bình ở (c, 2); bờ hàng 3 dài tới cột c (mỏm bờ), sau đó là tường. */
  function san13(c) {
    var h1 = '#B~~~~~q~#'.split(''); h1[c] = 'L';
    var h2 = '#~~~~~~~~#'.split(''); h2[c] = 'q';
    return ['##########', h1.join(''), h2.join(''), ('#' + '.'.repeat(c) + '##########').slice(0, 10), '##########'];
  }
  /** Xuồng lap-ben-song.3: lưới dài 1 bắt bè sau đuôi, chờ xe bờ dọn lục bình, chạy thẳng 6 ô (bè vào bến q (7, 1)), nhả lưới. */
  var XU_13 = ['set_length(1)', 'cast_net("back")', 'wait()', 'wait_n(4)', 'forward(6)', 'drop_net()', 'wait()'];
  /** lap-ben-song.4 (hai sân): luồng hàng 4 chảy sang phải (x 1–10, sức s); lạch trên ở cột 5 (cống K (5, 3), bến q (5, 2)); lạch êm hàng 5 dài tới cột 5 - s
   *  (vào luồng ở đó thì trôi đúng tới cửa lạch); van V (8, 5) nối cống, xuồng R1 đứng ở vũng (8, 6). */
  function san14(s) {
    return ['############', '#####~######', '#####q######', '#####K######', '#~~~~~~~~~~#', ('#B' + '~'.repeat(4 - s) + '########').slice(0, 8) + 'V###', '########~###', '############'];
  }
  var NOI_14 = [{ nut: { x: 8, y: 5 }, cong: [{ x: 5, y: 3 }], dong: [] }];
  function dong14(suc) { return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function (x) { return { x: x, y: 4, huong: 1, suc: suc }; }); }
  /** Xuồng R1 lap-ben-song.4: lưới dài 1 trúng van V ngay trước mũi, cống mở. */
  var XU_14 = ['set_length(1)', 'cast_net()', 'wait()'];
  function dong4(trai, tren, phai) {
    var ds = [];
    if (trai) [1, 2, 3].forEach(function (x) { ds.push({ x: x, y: 3, huong: 1, suc: trai }); });
    if (tren) [0, 1, 2].forEach(function (y) { ds.push({ x: 4, y: y, huong: 2, suc: tren }); });
    if (phai) [5, 6, 7].forEach(function (x) { ds.push({ x: x, y: 3, huong: 3, suc: phai }); });
    return ds;
  }
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
    // 3 · làm cầu: bờ bên kia sụt hố, xe cứu hộ sau này cần đi qua. Hố cách bờ gần 3 ô: máy khai thác đứng trên bờ ném không tới, phải đứng trên cầu phao mới ném trúng.
    //     Xuồng thu lưới còn 1 ô (set_length(1)), bắt bè sát mũi, lùi ba ô kéo bè vào bến q, nhả lưới. Máy khai thác nạp tảng đá trước mũi, tiến một ô chờ cầu,
    //     lên cầu phao ném đá lấp hố. Đá phải lấp hố (không có ô đích cho đá). Bẫy: xe chở hàng (qua cầu được, gắp được đá, nhưng không lấp được hố).
    man9('cuu-ben-song', 3, 'luyen', {
      ten: 'Hố bên kia sông',
      deBai: 'Bờ bên kia sụt hố. Ai ghép cầu phao, ai lấp hố? Đứng trên bờ ném không tới hố đâu.',
      veMaMau: 'Máy khai thác ném từ bờ: đá rơi trước hố.',
      san: ['#########', '#...u...#', '#.......#', '#~~~q~~B#', '#.......#', '#.......#', '#########'],
      doi: [khe({ x: 2, y: 5, huong: 0 }, { batDauNuoc: { x: 6, y: 3, huong: 1 } }), khe({ x: 4, y: 5, huong: 0 }, { batDauNuoc: { x: 1, y: 3, huong: 1 } })],
      them: { vatThem: [{ x: 4, y: 4 }] },
      chonDoi: {
        menu: ['XU', 'KT', 'CH'],
        cachMau: [{ chon: ['XU', 'KT'], ghiChu: 'đôi tốt', loiGiai: doiBai([
          ['set_length(1)', 'cast_net()', 'wait()', 'for i in range(3):', '    back()', 'drop_net()', 'wait()'],
          ['load()', 'wait()', 'move()', 'wait_n(3)', 'move()', 'throw()', 'wait()']]) }]
      },
      maMau: doiBai([['set_length(1)', 'cast_net()', 'wait()', 'for i in range(3):', '    back()', 'drop_net()', 'wait()'], ['load()', 'wait()', 'move()', 'throw()', 'wait()']]),
      loiSai: [
        { moTa: 'Ném từ bờ: đá rơi trước hố', baiLam: doiBai([['set_length(1)', 'cast_net()', 'wait()', 'for i in range(3):', '    back()', 'drop_net()', 'wait()'], ['load()', 'wait()', 'move()', 'throw()', 'wait()']]), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Máy khai thác lên cầu sớm: chưa có bè, đâm nước', baiLam: doiBai([['set_length(1)', 'cast_net()', 'wait()', 'for i in range(3):', '    back()', 'drop_net()', 'wait()'], ['load()', 'wait()', 'move()', 'move()', 'throw()', 'wait()']]), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Lưới dài 2: tung qua bè, không bắt được', baiLam: doiBai([['cast_net()', 'wait()', 'for i in range(3):', '    back()', 'drop_net()', 'wait()'], ['load()', 'wait()', 'move()', 'wait_n(3)', 'move()', 'throw()', 'wait()']]), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 26, nhip: 8 },
      goiY: ['set_length(1): lưới dài 1 ô, bắt bè sát mũi.', 'throw() ném xa 2 ô: đứng trên cầu phao mới tới hố.'],
      cauDo: { doi: ['XU', 'KT'], lap: null, coChe: ['nuoc', 'be', 'luoi', 'ho', 'nem', 'do-dai-luoi'], cuu: 'hang', meo: 'lam-cau' }
    }),
    // 4 · đọc rồi chọn, ôn tuple + min (ba sân): ngã ba ba nhánh kênh, nước mỗi nhánh chảy về ngã ba mạnh yếu khác nhau; bến nhận bè chỉ xây ở nhánh nước êm.
    //     Xuồng tung lưới ra sau bắt bè, tiến tới ngã ba; quay đọc h, s = flow() ba nhánh (a, b, c), m = min(a, b, c) là nhánh êm; quay về nhánh đó, kéo bè vào bến, nhả lưới.
    //     Máy khai thác nạp tảng đá chắn cửa kênh, quay lên ném lấp hố bờ. Ba sân (dữ liệu theo sân, luật 13/11): nhánh êm phải / trên / trái; điền thẳng nhánh của sân 1 thua sân 2, 3.
    man9('cuu-ben-song', 4, 'luyen', {
      ten: 'Ba nhánh kênh',
      khung: { chinh: 20, moiHam: 8 },
      deBai: 'Ba sân. Bến nhận bè ở nhánh nước êm nhất. Đọc h, s = flow() ở cả ba nhánh, chọn nhánh có s nhỏ nhất: min(a, b, c).',
      veMaMau: 'Xuồng mới tới ngã ba, chưa đọc nhánh nào.',
      san: [san4('phai'), san4('tren'), san4('trai')],
      doi: [khe({ x: 3, y: 4, huong: 1 }, { batDauNuoc: { x: 4, y: 5, huong: 0 } }), khe({ x: 3, y: 4, huong: 1 }, { batDauNuoc: { x: 4, y: 5, huong: 0 } })],
      them: { vatThem: [[{ x: 4, y: 4 }], [{ x: 4, y: 4 }], [{ x: 4, y: 4 }]], dong: [dong4(2, 1, 0), dong4(1, 0, 2), dong4(0, 2, 1)] },
      chonDoi: {
        menu: ['XU', 'KT'],
        cachMau: [{ chon: ['XU', 'KT'], ghiChu: 'đôi tốt', loiGiai: doiBai([XU_4, KT_4]) }]
      },
      maMau: doiBai([['cast_net("back")', 'wait()', 'forward(2)'], KT_4]),
      loiSai: [
        { moTa: 'Điền thẳng nhánh của sân 1 (rẽ phải): sân 2, 3 bến ở nhánh khác', baiLam: doiBai([['cast_net("back")', 'wait()', 'forward(2)', 'turn_right()', 'forward(3)', 'drop_net()', 'wait()'], KT_4]), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Dùng max thay min: kéo bè vào nhánh nước xiết nhất', baiLam: doiBai([XU_4.map(function (d) { return d === 'm = min(a, b, c)' ? 'm = max(a, b, c)' : d; }), KT_4]), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Máy khai thác không dọn đá: xuồng vướng đá ở cửa kênh', baiLam: doiBai([XU_4, []]), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 38, nhip: 13 },
      goiY: ['h, s = flow(): h là hướng, s là sức nước (0 là nước êm).', 'm = min(a, b, c): số nhỏ nhất trong ba số.'],
      cauDo: { doi: ['XU', 'KT'], lap: null, coChe: ['nuoc', 'dong', 'be', 'luoi', 'doc-dong', 'ho'], cuu: 'hang', meo: 'doc-roi-chon' }
    }),
    // 5 · cứu người, cứu kịp: người mặc áo phao rơi xuống luồng nước, trôi mỗi nhịp một ô về phía thác. Xuồng đứng trong lạch, lưới dài 1, chờ người trôi tới ngay trước mũi
    //     rồi tung lưới, lùi một ô kéo người vào ô nước sát bờ; người tự lên bờ đi về trạm. Lối lên trạm có hố bờ sụt: máy khai thác nạp tảng đá, ném lấp hố.
    //     Bẫy: drone (bay qua hố được nhưng không lấp hố, không kéo người).
    man9('cuu-ben-song', 5, 'cung-co', {
      ten: 'Người trôi về thác',
      mucTieu: 'cuu-nguoi',
      deBai: 'Một người rơi xuống sông, trôi mỗi nhịp một ô về phía thác. Kéo người vào bờ kịp lúc, lấp hố trên lối về trạm cứu.',
      veMaMau: 'Xuồng tung lưới sớm quá.',
      san: ['#########', '~~~~~~~~~', '###..~###', '#.ou#~###', '#.#.#~###', '###.#####', '#########'],
      doi: [khe({ x: 1, y: 4, huong: 0 }, { batDauNuoc: { x: 5, y: 2, huong: 0 } }), khe({ x: 1, y: 3, huong: 1 }, { batDauNuoc: { x: 5, y: 3, huong: 0 } })],
      them: { nguoi: [{ x: 1, y: 1 }], tramCuu: [{ x: 3, y: 5 }], thac: [{ x: 8, y: 1 }],
        dong: [0, 1, 2, 3, 4, 5, 6, 7, 8].map(function (x) { return { x: x, y: 1, huong: 1, suc: 1 }; }) },
      chonDoi: {
        menu: ['XU', 'KT', 'DR'],
        cachMau: [{ chon: ['XU', 'KT'], ghiChu: 'đôi tốt', loiGiai: doiBai([
          ['set_length(1)', 'wait_n(4)', 'cast_net()', 'wait()', 'back()'],
          ['load()', 'wait()', 'throw()', 'wait()']]) }]
      },
      maMau: doiBai([['set_length(1)', 'cast_net()', 'wait()', 'back()'], []]),
      loiSai: [
        { moTa: 'Tung lưới ngay: người chưa tới, trôi xuống thác', baiLam: doiBai([['set_length(1)', 'cast_net()', 'wait()', 'back()'], ['load()', 'wait()', 'throw()', 'wait()']]), phaiCoMa: ['nguoi-troi-xa'] },
        { moTa: 'Không lấp hố: người lên bờ đứng chờ', baiLam: doiBai([['set_length(1)', 'wait_n(4)', 'cast_net()', 'wait()', 'back()'], []]), phaiCoMa: ['chua-cuu-nguoi'] }
      ],
      sao: { o: 17, nhip: 12 },
      goiY: ['Người trôi mỗi nhịp một ô: đếm số ô từ người tới trước mũi xuồng.', 'Lùi một ô: người tới ô nước sát bờ thì tự lên bờ.'],
      cauDo: { doi: ['XU', 'KT'], lap: null, coChe: ['nuoc', 'dong', 'nguoi', 'luoi', 'ho', 'nem', 'thac'], cuu: 'nguoi', meo: 'cuu-kip' }
    }),
    // 6 · đổi vai: một chiếc bè làm cầu hai lần. Lũ cuốn hòm dụng cụ sắt lên cồn giữa hai lạch nước. Bè đang nằm ở lạch dưới làm cầu: nhện bò qua bè lên cồn,
    //     đứng trên hòm sắt hút lên (pull_s). Nhện rời bè thì xuồng tung lưới ra sau bắt bè, chạy vòng qua kênh bên phải kéo bè sang lạch trên làm cầu thứ hai;
    //     nhện qua cầu đó lên bờ trên, thả hòm vào ô đích. Chỉ hòm sắt cần về đích (bè là gỗ). Bẫy: cần cẩu (móc không nhấc hòm sắt, không kéo bè).
    man9('cuu-ben-song', 6, 'cung-co', {
      ten: 'Một bè hai cầu',
      deBai: 'Hòm sắt kẹt trên cồn giữa hai lạch nước. Chỉ có một chiếc bè. Nhện qua cầu lấy hòm, rồi bè phải sang lạch kia làm cầu lần nữa.',
      veMaMau: 'Xuồng kéo bè khi nhện còn đứng trên bè.',
      san: ['########', '#..D...#', '#~~~~~~#', '#..o..~#', '#~~B~~~#', '#RRRRRR#', '########'],
      doi: [khe({ x: 5, y: 5, huong: 0 }, { batDauNuoc: { x: 4, y: 4, huong: 1 } }), khe({ x: 3, y: 5, huong: 0 }, { batDauNuoc: { x: 1, y: 4, huong: 1 } })],
      them: { vatCan: 'sat', vatChat: ['........', '........', '........', '...s....', '........', '........', '........'] },
      chonDoi: {
        menu: ['XU', 'PL', 'CC'],
        cachMau: [{ chon: ['XU', 'PL'], ghiChu: 'đôi tốt', loiGiai: doiBai([XU_6, PL_6]) }]
      },
      maMau: doiBai([['set_length(1)', 'cast_net("back")', 'wait()'], ['go_up()', 'go_up()', 'pull_s()']]),
      loiSai: [
        { moTa: 'Xuồng kéo bè ngay: nhện còn trên bè, lưới không kéo', baiLam: doiBai([XU_6.filter(function (d) { return d !== 'wait_n(4)'; }), PL_6]), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Nhện qua lạch trên sớm: bè chưa tới, nhện đâm nước', baiLam: doiBai([XU_6, ['go_up()', 'go_up()', 'pull_s()', 'go_up()', 'go_up()', 'magnet_off()', 'wait()']]), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 35, nhip: 21 },
      goiY: ['Bè có xe đứng trên thì lưới không kéo được: chờ nhện xuống cồn.', 'Lưới ra sau: cast_net("back"), xuồng tiến thì bè theo sau.'],
      cauDo: { doi: ['XU', 'PL'], lap: null, coChe: ['nuoc', 'be', 'luoi', 'sat', 'con'], cuu: 'hang', meo: 'doi-vai' }
    }),
    // 7 · cứu máy (dọn lối + gạt van từ xa, T3): xuồng khách (R3, khoá) buộc bè hàng sau đuôi, chờ 5 nhịp rồi chạy thẳng qua cống ra bến q.
    //     Cống đang đóng, van V ở xa trên bờ: xe cứu hỏa phun nước trúng van (tia dừng ở van, van đổi, cống mở cuối nhịp). Tảng đá lũ cuốn nằm ngay sau cửa cống:
    //     máy khai thác nạp đá, quay phải ném lấp hố bờ. Bẫy: xe chở hàng (gắp được đá nhưng không lấp hố, không gạt van).
    man9('cuu-ben-song', 7, 'van-dung', {
      ten: 'Xuồng khách sau cống',
      deBai: 'Xuồng khách kéo bè hàng, chờ 5 nhịp rồi chạy thẳng ra bến q. Cống đóng, van ở xa trên bờ, tảng đá chắn sau cửa cống. Giúp xuồng khách ra kịp.',
      veMaMau: 'Đọc chương trình của xuồng khoá: chờ 5 nhịp rồi forward(6).',
      san: ['##########', '#........#', '#V.......#', '#B~~K~~q~#', '#......u.#', '##########'],
      doi: [khe({ x: 5, y: 4, huong: 0 }), khe({ x: 3, y: 2, huong: 3 }),
        may('XU', { x: 2, y: 3, huong: 1 }, { son: 'tim', coDinh: true })],
      them: { vatThem: [{ x: 5, y: 3 }] },
      chonDoi: {
        menu: ['KT', 'CH', 'CU'],
        cachMau: [{ chon: ['KT', 'CU'], ghiChu: 'đôi tốt', loiGiai: doiBai([['load()', 'wait()', 'turn_right()', 'throw()', 'wait()'], ['spray()', 'wait()'], XU_R3_7]) }]
      },
      maMau: doiBai([[], [], XU_R3_7]),
      loiSai: [
        { moTa: 'Không gạt van: cống đóng, xuồng khách kẹt', baiLam: doiBai([['load()', 'wait()', 'turn_right()', 'throw()', 'wait()'], [], XU_R3_7]), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Không dọn đá: xuồng khách qua cống rồi vướng đá', baiLam: doiBai([[], ['spray()', 'wait()'], XU_R3_7]), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 27, nhip: 13 },
      goiY: ['Tia nước của xe cứu hỏa trúng van V thì van đổi, cống mở.', 'Máy khai thác: load() đá trước mũi, quay rồi throw() lấp hố.'],
      cauDo: { doi: ['KT', 'CU'], lap: null, coChe: ['nuoc', 'van', 'cong', 'phun', 'nem', 'ho', 'r3'], cuu: 'may', meo: 'don-loi' }
    }),
    // 8 · cứu máy, làm cầu (rắc cát): xuồng khách (R3, khoá) kẹt trong vũng tách sông, cống đóng; van V nằm trên bờ cuối một dải bùn trơn, giữa van và bùn là hố.
    //     Xe cứu hỏa chạy vào dải bùn thì trượt một mạch rơi xuống hố, không dừng được trong tầm phun (2 ô). Drone bay xuống ô bùn cuối dải rắc cát (dot()): ô đó thành sàn,
    //     xe trượt tới đó thì dừng, phun qua hố trúng van, cống mở; xuồng khách kéo bè ra bến q. Bẫy: xe hang động (bám bùn nhưng không phun van).
    man9('cuu-ben-song', 8, 'van-dung', {
      ten: 'Van trên bờ bùn',
      deBai: 'Xuồng khách kẹt trong vũng, cống đóng. Van nằm trên dải bùn trơn: xe chạy vào bùn trượt mãi tới hố. Làm sao cho xe dừng đúng dưới van?',
      veMaMau: 'Đọc chương trình của xuồng khoá: chờ 8 nhịp rồi forward(5). Xe cứu hỏa chạy vào bùn là trượt.',
      san: ['##########', '####.#####', '#.VuIIII.#', '##########', '#B~K~~q~##', '##########'],
      doi: [khe({ x: 8, y: 2, huong: 3 }), khe({ x: 4, y: 1, huong: 2 }, { pin: 8 }),
        may('XU', { x: 2, y: 4, huong: 1 }, { son: 'tim', coDinh: true })],
      chonDoi: {
        menu: ['CU', 'DR', 'HD'],
        cachMau: [{ chon: ['CU', 'DR'], ghiChu: 'đôi tốt', loiGiai: doiBai([CU_8, DR_8, XU_R3_8]) }]
      },
      maMau: doiBai([[], [], XU_R3_8]),
      loiSai: [
        { moTa: 'Không rắc cát: xe trượt qua van, rơi hố', baiLam: doiBai([CU_8, [], XU_R3_8]), phaiCoMa: ['roi-ho'] },
        { moTa: 'dot() là lệnh cuối của drone: không còn nhịp nào để rắc, xe trượt rơi hố', baiLam: doiBai([CU_8, ['go_down()', 'dot()'], XU_R3_8]), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 26, nhip: 15 },
      goiY: ['dot() trên ô bùn: rắc cát, ô thành sàn thường.', 'Xe trượt trên bùn tới ô không còn bùn thì dừng.'],
      cauDo: { doi: ['CU', 'DR'], lap: null, coChe: ['bun', 'rac-cat', 'van', 'cong', 'phun', 'ho', 'r3'], cuu: 'may', meo: 'lam-cau' }
    }),
    // 9 · cứu máy, tiếp sức, nhắc lại G2–G4 (container chắn lối, ray cẩu, máy ném lấp hố): xuồng khách (R3, khoá) kéo bè hàng, chờ rồi chạy thẳng vào bến q.
    //     Tảng đá lũ cuốn nằm giữa luồng chắn xuồng khách; máy khai thác phải ra bờ sông nạp đá, nhưng container đổ chắn lối bờ duy nhất.
    //     Cẩu nhấc container, quay sang hạ lên bãi trống; máy khai thác xuống bờ, chạy dọc lối qua chỗ container vừa dọn, quay xuống nạp đá, quay phải ném lấp hố.
    //     Bẫy: robot phân loại (không nhấc đá, không nhấc container). Bảng ghi "song song": container trôi cẩu nhấc lên bờ không về đích được (lõi: dua-vat đếm
    //     container đã nhấc), nên đổi thành chuỗi tiếp sức cẩu → máy khai thác → xuồng khách.
    man9('cuu-ben-song', 9, 'bien-the', {
      ten: 'Mở luồng cho xuồng khách',
      khung: { chinh: 16, moiHam: 8 },
      deBai: 'Xuồng khách chờ rồi chạy thẳng vào bến. Đá chắn luồng, container chắn lối ra bờ sông. Ai dọn gì trước?',
      veMaMau: 'Đọc chương trình của xuồng khoá: chờ 9 nhịp rồi forward(7).',
      san: ['###########', '#RRRR.....#', '#.......u.#', '#B~~~~~~q~#', '###########'],
      doi: [khe({ x: 3, y: 1, huong: 0, nac: 2, tam: 1 }), khe({ x: 1, y: 1, huong: 0 }),
        may('XU', { x: 2, y: 3, huong: 1 }, { son: 'tim', coDinh: true })],
      them: { contChan: true, chong: [{ x: 3, y: 2, cont: [{ so: 17 }] }], vatThem: [{ x: 6, y: 3 }] },
      chonDoi: {
        menu: ['KT', 'PL', 'CC'],
        cachMau: [{ chon: ['CC', 'KT'], ghiChu: 'đôi tốt', loiGiai: doiBai([CC_9, KT_9, XU_R3_9]) }]
      },
      maMau: doiBai([[], [], XU_R3_9]),
      loiSai: [
        { moTa: 'Cẩu không dọn container: máy khai thác kẹt trên lối bờ', baiLam: doiBai([[], KT_9, XU_R3_9]), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Máy khai thác quên quay trước khi ném: đá ném vào bờ đá, vỡ', baiLam: doiBai([CC_9, KT_9.filter(function (d, i) { return i !== KT_9.length - 3; }), XU_R3_9]), phaiCoMa: ['nem-vo'] }
      ],
      sao: { o: 37, nhip: 19 },
      goiY: ['Cẩu: pick_up(), quay một nấc, set_down() lên ô bãi trống.', 'Đá lấp hố thì không cần về đích.'],
      cauDo: { doi: ['CC', 'KT'], lap: null, coChe: ['nuoc', 'container', 'ray', 'nem', 'ho', 'be', 'r3'], cuu: 'may', meo: 'tiep-suc' }
    }),
    // 10 · song ca đoạn 5 "Kìa con bướm vàng" (Bè 1: 1 1 5 5 6 6 5 5 | Bè 2: 3 1 3 5 4 6 5 3), giữ cho gói 10 ghép bài; dùng play_part (cuu-kho-hang.10 tạo).
    //      Xuồng lắp loa (L5 dùng sớm, như G4) hát bè 1 dưới nước; máy khai thác lắp loa hát bè 2 trên bờ (bảng ghi "omni đi chéo theo nhịp": choi-dieu chỉ chấm hai robot hát).
    //      Hai đá chuông lũ cuốn về bến vỡ khi nghe nốt cuối mỗi bè. Đội cố định (tay loa không có trên bảng chọn).
    man9('cuu-ben-song', 10, 'trum', {
      ten: 'Song ca bến sông',
      mucTieu: 'choi-dieu',
      deBai: 'Bến sông đã thông! Xuồng hát dưới nước, máy khai thác hát trên bờ: song ca đoạn 5. Mỗi bạn gọi play_part với bè của mình.',
      veMaMau: 'Bè 2 mới có một nốt.',
      hamCuaEmCan: ['play_note', 'play_part'],
      san: ['######', '~~~~.#', '#....#', '######'],
      doi: [xuongLoa(may('XU', { x: 1, y: 1, huong: 1 }, { tay: 'loa', boHam: ['cast_net', 'drop_net', 'set_length', 'reel_in', 'reel_out'], themHam: ['note', 'beat'], phatNot: true })),
        may('KT', { x: 1, y: 2, huong: 1 }, { son: 'lam', tay: 'loa', boHam: ['load', 'throw', 'aim'], themHam: ['note', 'beat'], phatNot: true })],
      them: { dieu: { r1: '1 1 5 5 6 6 5 5', r2: '3 1 3 5 4 6 5 3' }, daChuong: [{ x: 4, y: 1, not: 5, ben: 1 }, { x: 4, y: 2, not: 3, ben: 1 }] },
      maMau: doiBai([['play_part([1, 1, 5, 5, 6, 6, 5, 5])'], ['play_note(3)']]),
      loiGiai: doiBai([['play_part([1, 1, 5, 5, 6, 6, 5, 5])'], ['play_part([3, 1, 3, 5, 4, 6, 5, 3])']]),
      loiSai: [
        { moTa: 'Bè 2 mới phát một nốt', baiLam: doiBai([['play_part([1, 1, 5, 5, 6, 6, 5, 5])'], ['play_note(3)']]), phaiCoMa: ['lo-nhip'] },
        { moTa: 'Bè 2 đảo hai nốt đầu', baiLam: doiBai([['play_part([1, 1, 5, 5, 6, 6, 5, 5])'], ['play_part([1, 3, 3, 5, 4, 6, 5, 3])']]), phaiCoMa: ['sai-not'] }
      ],
      sao: { o: 7, nhip: 10 },
      goiY: ['Bè 2: play_part([3, 1, 3, 5, 4, 6, 5, 3]).'],
      cauDo: { doi: ['XU', 'KT'], lap: null, coChe: ['loa', 'da-chuong', 'nuoc', 'bo'], cuu: null, meo: 'song-song' }
    }),

    /* ========================================================================
       CHƯƠNG 2: lap-ben-song (10 màn)
       ======================================================================== */
    // 11 · show (làm cầu), lai L3 xe tời bờ: cống kẹt vì bão, xuồng thủy lợi (R1) ở sau cống không ra được: tung lưới chỉ trúng cửa cống.
    //      Luna lắp sẵn omni + tay lưới + radar (khoá) đứng trên mỏm bờ giữa sông: tung lưới sang phải dọc lòng sông, tời bè về ô nước sát xe (bến q) thành cầu phao.
    //      Xe chở hàng (R3) gắp thùng gỗ, qua cầu phao, đặt thùng vào ô đích bờ bên kia.
    man9('lap-ben-song', 1, 'lam-quen', {
      ten: 'Xe tời bờ',
      chiChay: true,
      deBai: 'Cống kẹt, xuồng không ra được. Luna lắp cho xe omni tay lưới: đứng trên bờ tung lưới tời bè về làm cầu cho xe chở hàng. Bấm Chạy.',
      veMaMau: 'Bấm Chạy xem xe trên bờ tời bè.',
      san: ['##########', '#..D.....#', '##.q~B~K~#', '#..o.....#', '#........#', '##########'],
      doi: [may('XU', { x: 8, y: 2, huong: 3 }), Object.assign({ batDau: { x: 2, y: 2, huong: 0 } }, clone(OMNI_L3)), may('CH', { x: 3, y: 4, huong: 0 })],
      maMau: doiBai([['cast_net()', 'wait()'], ['set_length(3)', 'cast_net("right")', 'wait()'], ['pick()', 'forward(2)', 'drop()']]),
      loiGiai: doiBai([['cast_net()', 'wait()'], ['set_length(3)', 'cast_net("right")', 'wait()'], ['pick()', 'forward(2)', 'drop()']]),
      sao: { o: 27, nhip: 6 },
      goiY: ['Xe trên bờ tung lưới: vật bắt được về ô nước sát xe.', 'cast_net("right"): tung lưới sang bên phải xe.'],
      cauDo: { doi: null, lap: 'omni+day-keo+radar', coChe: ['nuoc', 'be', 'luoi', 'cong', 'bo', 'thung-go'], cuu: 'hang', meo: 'lam-cau' }
    }),
    // 12 · ép đổi thân (song song): bè thứ hai nằm trong lạch sau cống kẹt, xuồng không vào được. Xuồng R1 kéo bè thứ nhất vào bến q ngoài sông;
    //      R2 tự lắp xe có bánh + tay lưới đứng trên bờ dưới lạch, tung lưới tời bè thứ hai về bến q trong lạch. Lắp xuồng thì kẹt ngoài cống.
    //      Cách một omni + lưới (trượt ngang, nhanh). Cách hai hai bánh + lưới (rẻ hơn, phải quay, chậm hơn).
    man9('lap-ben-song', 2, 'lam-quen', {
      ten: 'Bè sau cống kẹt',
      deBai: 'Bè thứ hai kẹt trong lạch sau cống, xuồng không vào được. Lắp thân nào để tới gần lạch? Tung lưới từ bờ tời bè vào bến.',
      veMaMau: 'R2 chưa có chương trình.',
      san: ['#########', '#~Bq~~KB#', '#######q#', '#.......#', '#########'],
      doi: [may('XU', { x: 4, y: 1, huong: 3 }), khe({ x: 4, y: 3, huong: 0 }, { son: 'lam', batDauNuoc: { x: 1, y: 1, huong: 1 } })],
      lapRap: lapR2(['xuong', 'omni', 'hai-banh'], ['day-keo'], [], 8, [
        cach('omni', 'day-keo', null, [XU_12, ['for i in range(3):', '    slide_right()', '    wait()', 'cast_net()', 'wait()']]),
        cach('hai-banh', 'day-keo', null, [XU_12, ['turn_right()', 'forward(3)', 'turn_left()', 'cast_net()', 'wait()']])
      ], { moLai: ['L3'] }),
      maMau: doiBai([XU_12, []]),
      loiSai: [
        { moTa: 'R2 đứng yên: bè trong lạch chưa vào bến', baiLam: doiBai([XU_12, []]), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Xe tung lưới ở chỗ xuất phát: dây không trúng lạch', baiLam: doiBai([XU_12, ['cast_net()', 'wait()']]), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 16, nhip: 5 },
      goiY: ['Xuồng không qua cống kẹt: lắp thân đi trên bờ.', 'Xe trên bờ tung lưới: bè về ô nước sát mũi xe.'],
      cauDo: { doi: null, lap: 'omni+day-keo', coChe: ['nuoc', 'be', 'luoi', 'cong', 'bo', 'lach'], cuu: 'hang', meo: 'song-song' }
    }),
    // 13 · dọn lối (kéo), ba sân: đám lục bình L dạt chắn luồng của xuồng, mỗi sân ở một cột (3, 5, 6). Xuồng R1 dắt bè ra bến q cuối luồng, chờ lối thông.
    //      R2 tự lắp xe trên bờ dưới luồng: đo tầm tới mỏm bờ (cột của lục bình) rồi tung lưới sang trái tời lục bình vào bến q sát bờ. Điền thẳng số của sân 1 thì trượt sân 2, 3.
    //      Cách một xích + lưới + hồng ngoại: d = distance(), forward(d). Cách hai rẻ hơn: hai bánh + lưới + khoảng cách: while front_clear(): forward(1).
    man9('lap-ben-song', 3, 'luyen', {
      ten: 'Lục bình chắn luồng',
      khung: { chinh: 16, moiHam: 8 },
      deBai: 'Ba sân. Lục bình dạt chắn luồng, mỗi sân một chỗ. Lắp xe đi trên bờ, đo xem mỏm bờ ở đâu, tới đó tung lưới tời lục bình vào bến. Xuồng chờ lối thông rồi dắt bè ra.',
      veMaMau: 'Xe R2 chưa có chương trình.',
      san: [san13(3), san13(5), san13(6)],
      doi: [may('XU', { x: 2, y: 1, huong: 1 }), khe({ x: 1, y: 3, huong: 1 }, { son: 'lam' })],
      lapRap: lapR2(['xich', 'hai-banh', 'omni'], ['day-keo', 'kep'], ['hong-ngoai', 'khoang-cach', 'camera'], 8, [
        cach('xich', 'day-keo', 'hong-ngoai', [XU_13, ['d = distance()', 'forward(d)', 'cast_net("left")', 'wait()']]),
        cach('hai-banh', 'day-keo', 'khoang-cach', [XU_13, ['while front_clear():', '    forward(1)', 'cast_net("left")', 'wait()']])
      ], { moLai: ['L3'] }),
      maMau: doiBai([XU_13, []]),
      loiSai: [
        { moTa: 'Điền thẳng forward(2) của sân 1: sân 2, 3 xe dừng sớm, lưới không trúng lục bình', baiLam: doiBai([XU_13, ['forward(2)', 'cast_net("left")', 'wait()']]), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Xe tung lưới ngay chỗ xuất phát: lục bình còn chắn luồng', baiLam: doiBai([XU_13, ['cast_net("left")', 'wait()']]), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 19, nhip: 13 },
      goiY: ['d = distance(): số ô trống trước mũi xe, tới sát mỏm bờ.', 'Xe trên bờ tung lưới sang trái: lục bình về ô nước sát bờ.'],
      cauDo: { doi: null, lap: 'xich+day-keo+hong-ngoai', coChe: ['nuoc', 'be', 'luoi', 'bo', 'luc-binh'], cuu: 'hang', meo: 'don-loi' }
    }),
    // 14 · dẫn đường (kéo theo đuôi), hai sân, ôn return: luồng ngang chảy sang phải, sức 2 (sân 1) hay 1 (sân 2). Bến q nằm trong lạch phía trên, sau cống K (cột 5).
    //      Xuồng R1 đặt sẵn tung lưới gạt van mở cống. R2 tự lắp xuồng thứ hai buộc bè sau đuôi, chạy dọc lạch êm, rẽ lên băng qua luồng: vào luồng ở cột x thì trôi tới cột x + s,
    //      nên phải vào ở cột 5 - s. Cách một xuồng + lưới + chong chóng: hàm trả số ô đi dọc lạch (return 3 - s). Cách hai rẻ hơn: xuồng + lưới + khoảng cách, đi tới cuối lạch êm.
    man9('lap-ben-song', 4, 'luyen', {
      ten: 'Băng qua dòng chảy',
      khung: { chinh: 16, moiHam: 8 },
      deBai: 'Hai sân, nước chảy nhanh chậm khác nhau. Xuồng R1 mở cống. Lắp xuồng thứ hai dắt bè sau đuôi, băng qua dòng chảy vào lạch có bến. Nước đẩy xuồng trôi: vào dòng ở cột nào?',
      veMaMau: 'Xuồng R2 chưa có chương trình.',
      san: [san14(2), san14(1)],
      doi: [may('XU', { x: 8, y: 6, huong: 0 }), khe({ x: 2, y: 5, huong: 1 }, { son: 'lam', batDauNuoc: { x: 2, y: 5, huong: 1 } })],
      them: { dong: [dong14(2), dong14(1)], noi: [NOI_14, NOI_14] },
      lapRap: lapR2(['xuong'], ['day-keo'], ['dong-chay', 'khoang-cach', 'camera'], 10, [
        cach('xuong', 'day-keo', 'dong-chay', [XU_14, ['set_length(1)', 'cast_net("back")', 'wait()', 'turn_left()', 'h, s = flow()', 'turn_right()', 'forward(3 - s)', 'turn_left()', 'forward(4)', 'drop_net()', 'wait()']]),
        cach('xuong', 'day-keo', 'khoang-cach', [XU_14, ['set_length(1)', 'cast_net("back")', 'wait()', 'while front_clear():', '    forward(1)', 'turn_left()', 'forward(4)', 'drop_net()', 'wait()']])
      ], { moLai: ['L2'] }),
      maMau: doiBai([XU_14, []]),
      loiSai: [
        { moTa: 'Điền thẳng forward(1) của sân 1: sân 2 nước chậm, xuồng trôi chưa tới cửa lạch, đâm bờ', baiLam: doiBai([XU_14, ['set_length(1)', 'cast_net("back")', 'wait()', 'forward(1)', 'turn_left()', 'forward(4)', 'drop_net()', 'wait()']]), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Xuồng R1 không gạt van: cống đóng, xuồng dắt bè kẹt ngoài lạch', baiLam: doiBai([[], ['set_length(1)', 'cast_net("back")', 'wait()', 'turn_left()', 'h, s = flow()', 'turn_right()', 'forward(3 - s)', 'turn_left()', 'forward(4)', 'drop_net()', 'wait()']]), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 24, nhip: 12 },
      goiY: ['h, s = flow(): s là số ô nước đẩy xuồng mỗi nhịp.', 'Vào dòng ở cột x thì trôi tới cột x + s. Cửa lạch ở cột 5.'],
      cauDo: { doi: null, lap: 'xuong+day-keo+dong-chay', coChe: ['nuoc', 'dong', 'be', 'luoi', 'van', 'cong'], cuu: 'hang', meo: 'dan-duong' }
    }),
  ];
})();
