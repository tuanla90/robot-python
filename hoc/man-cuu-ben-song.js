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
  ];
})();
