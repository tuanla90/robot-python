/* ============================================================================
   man-cuu-bai-tai-che.js - Mùa 9 Về CLB: Gói 3 "Bãi tái chế sau bão" (M9M3 16/11; dựng lại theo khuôn G1 / G2: man-cuu-kho-hang.js, man-cuu-nha-may.js)
   Câu đố: hoc/MUA-9-200-CAU-DO.md mục G3 (20 dòng); luật: hoc/KE-HOACH-MUA-9-TO-HOP.md. Bão: phế liệu gỗ lẫn sắt, khe (hố) mới, đệm từ, bùn trơn.
   - Chương 1 cuu-bai-tai-che: CHỌN ĐỘI (man.chonDoi). Đôi tốt: Robot phân loại (PL, nhện + nam châm bụng + cảm biến từ) + Xe chở hàng (CH): sắt cho nam châm, gỗ cho kẹp.
   - Chương 2 lap-bai-tai-che: R1 robot phân loại đặt sẵn, Luna TỰ LẮP R2 (man.lapRap.robot = 1). Tổ hợp đích: nhện + kẹp + cảm biến từ (đổi tay, giữ thân).
     Lai: L12 nhện + camera bốn hướng, L1 cẩu + nam châm, L6 nhện + gieo hạt, L7 nhện + loa; T2 container lấp hố (chương 1).
   - Mỗi màn khai man.cauDo (máy kiểm hoc/kiem-cau-do-mua-9.mjs). Ôn Python G3: CHUỖI (walk("RRD"), front_pole() / color() trả chuỗi), and / or trong điều kiện.
   - Hàm của em do gói này tạo mà gói sau gọi: clear_iron(d) [pull_s(), go(d)] (man-cuu-clb.js, man-cuu-hang-dong.js gọi),
     pull_deliver(d) [pull_s(), go(d), magnet_off(), wait()] (man-cuu-ben-song.js, man-cuu-mo-da.js, man-cuu-nong-trai.js gọi).
   - Màn 10 mỗi chương: song ca đoạn 3 "Kìa con bướm vàng" (Bè 1: 5 5 4 4 3 3 2 2 | Bè 2: 3 1 2 4 1 3 5 5), giữ để gói 10 ghép bài; dùng play_part (cuu-kho-hang.10 tạo).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  /* ---- M9M3: khung màn mùa 9 (chép từ man-cuu-nha-may.js) --------------------------------------------- */
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
  /** Khe robot em lập trình ở màn chọn đội / khe lắp: chỉ ô xuất phát, cờ, pin (drone), đế. */
  function khe(bd, them) { return Object.assign({ batDau: bd }, them || {}); }
  function doiBai(ds, hamMan, hamEm) {
    return { doi: ds.map(function (c) { return { chinh: c.slice() }; }), hamCuaMan: clone(hamMan || []), hamCuaEmMoi: clone(hamEm || []) };
  }
  /** Hàm của em tạo ở gói này (gói sau còn gọi). */
  var H_CLEAR_IRON = { ten: 'clear_iron', thamSo: ['d'], than: ['pull_s()', 'go(d)'] };
  var H_PULL_DELIVER = { ten: 'pull_deliver', thamSo: ['d'], than: ['pull_s()', 'go(d)', 'magnet_off()', 'wait()'] };
  /** Một cách lắp mẫu (màn tự lắp, lapRap.robot = 1): part của R2 + lời giải cả đội. */
  function cach(than, tay, cam, ds, hamEm) { return { than: than, tay: tay || null, camBien: cam || null, loiGiai: doiBai(ds, [], hamEm) }; }
  function lapR2(than, tay, cam, nganSach, cachLap, them) {
    return Object.assign({ robot: 1, than: than, tay: tay, camBien: cam, nganSach: nganSach, dungKho: true, cachLap: cachLap }, them || {});
  }
  /** R2 đã lắp sẵn (màn show chương 2): nhện + kẹp + cảm biến từ, như LapRap.apDung lắp ra. */
  var NHEN_KEP_TU = {
    loaiRobot: 'nhen', robot: { than: 'nhen', tay: 'kep', camBien: [{ ma: 'tu', o: 'hong' }], son: 'lam' },
    hamGoc: ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'crouch', 'stand', 'arm_down', 'arm_up', 'grab', 'release', 'front_metal', 'front_pole']
  };
  function man9(chuong, so, hang, cfg) {
    var r1 = cfg.doi[0];
    var m = {
      chuong: chuong, so: so, ten: cfg.ten, hang: hang, vo: 'tai-che',
      cauTruc: ['for', 'if', 'while', 'list'], vaHoac: true, moXuong: true, camHamCuaEm: false,
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

  ManHoc.manCuuBaiTaiChe = [
    /* ========================================================================
       CHƯƠNG 1: cuu-bai-tai-che (10 màn)
       ======================================================================== */
    // 1 · show: phân loại phế liệu. Nhện hút thanh sắt dưới bụng đưa vào ô đích hàng trên; xe chở hàng gắp thùng gỗ đưa vào ô đích hàng dưới (chạy sẵn, khoá).
    //     Đội cố định PL + CH (màn chạy sẵn không qua bảng chọn). walk("RR"): chuỗi đường đi, mỗi chữ một bước.
    man9('cuu-bai-tai-che', 1, 'lam-quen', {
      ten: 'Sắt một bên, gỗ một bên',
      chiChay: true, mucTieu: 'dua-vat',
      deBai: 'Bão trộn sắt với gỗ. Nhện hút sắt, xe gắp gỗ, mỗi thứ vào một ô đích. Bấm Chạy.',
      veMaMau: 'Bấm Chạy xem mỗi bạn làm gì.',
      san: ['#########', '#..o.D###', '#########', '#.o.D####', '#########'],
      doi: [may('PL', { x: 1, y: 1, huong: 1 }), may('CH', { x: 1, y: 3, huong: 1 }, { son: 'lam' })],
      them: { vatChat: ['.........', '...s.....', '.........', '..g......', '.........'] },
      maMau: doiBai([['walk("RR")', 'pull_s()', 'walk("RR")', 'magnet_off()', 'wait()'], ['pick()', 'forward(2)', 'drop()']]),
      loiGiai: doiBai([['walk("RR")', 'pull_s()', 'walk("RR")', 'magnet_off()', 'wait()'], ['pick()', 'forward(2)', 'drop()']]),
      sao: { o: 38, nhip: 12 },
      goiY: ['walk("RR"): đi hai bước sang phải, mỗi chữ R một bước.'],
      cauDo: { doi: ['PL', 'CH'], lap: null, coChe: ['sat', 'go'], cuu: 'hang', meo: 'song-song' }
    }),

    // 2 · đọc rồi chọn + tạo hàm pull_deliver(d): hàng phế liệu sắt, gỗ, sắt. Nhện đi dọc hàng, front_metal() đọc ô trước (cạnh phải cố định):
    //     sắt thì bước lên, pull_deliver("D") hút và thả xuống ô đích bên dưới, gỗ thì đi trùm qua để lại cho xe. Xe chở hàng chờ nhện qua rồi gắp gỗ, lùi, đặt vào ô đích giữa.
    man9('cuu-bai-tai-che', 2, 'lam-quen', {
      ten: 'Sắt thì hút, gỗ thì chừa',
      mucTieu: 'dua-vat',
      taoHam: ['pull_deliver'],
      deBai: 'Hàng phế liệu lẫn sắt và gỗ. Nhện đọc front_metal(): sắt thì hút xuống ô đích, gỗ chừa cho xe. Viết pull_deliver(d): hút, bước d, thả.',
      veMaMau: 'Hàm pull_deliver chưa có. Nhện chưa biết chọn.',
      san: ['#######', '#.ooo##', '##DDD##', '###.###', '#######'],
      doi: [khe({ x: 1, y: 1, huong: 1 }), khe({ x: 3, y: 2, huong: 0 })],
      them: { vatChat: ['.......', '..sgs..', '.......', '.......', '.......'] },
      chonDoi: {
        menu: ['PL', 'CH'],
        cachMau: [{ chon: ['PL', 'CH'], ghiChu: 'đôi tốt', loiGiai: doiBai([
          ['for i in range(3):', '    if front_metal():', '        go_right()', '        pull_deliver("D")', '        go_up()', '    else:', '        go_right()'],
          ['wait_n(12)', 'pick()', 'back()', 'drop()']], [], [H_PULL_DELIVER]) }]
      },
      maMau: doiBai([['for i in range(3):', '    go_right()'], ['wait_n(12)', 'pick()', 'back()', 'drop()']]),
      loiSai: [
        { moTa: 'Thân pull_deliver thiếu magnet_off(): sắt còn dính bụng nhện', baiLam: doiBai([['for i in range(3):', '    if front_metal():', '        go_right()', '        pull_deliver("D")', '        go_up()', '    else:', '        go_right()'], ['wait_n(12)', 'pick()', 'back()', 'drop()']]), hamCuaEmMoi: [{ ten: 'pull_deliver', thamSo: ['d'], than: ['pull_s()', 'go(d)'] }], phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 44, nhip: 19 },
      goiY: ['front_metal(): vật đầu tiên trước nhện là sắt.', 'pull_deliver(d): pull_s(), go(d), magnet_off(), wait().'],
      cauDo: { doi: ['PL', 'CH'], lap: null, coChe: ['sat', 'go', 'cam-bien'], cuu: 'hang', meo: 'doc-roi-chon' }
    }),

    // 3 · dọn lối + tạo hàm clear_iron(d): lối xe chở hàng tới cờ có thanh sắt rồi thùng gỗ. Nhện bước xuống thanh sắt, clear_iron("D") hút sắt mang xuống hốc dưới;
    //     xe qua chỗ sắt vừa dọn, gắp thùng gỗ đặt vào hốc trên, rồi về cờ. Bẫy: xe cứu hỏa (không nhấc vật nào: vòi phun chỉ đẩy thùng nặng).
    man9('cuu-bai-tai-che', 3, 'luyen', {
      ten: 'Mỗi bạn một loại',
      taoHam: ['clear_iron'],
      deBai: 'Sắt và gỗ chắn lối tới cờ. Mỗi bạn dọn loại của mình. Viết clear_iron(d): hút sắt rồi bước d mang đi.',
      veMaMau: 'Hàm clear_iron chưa có.',
      san: ['#########', '###..####', '#..o.oF##', '###F#####', '#########'],
      doi: [khe({ x: 3, y: 1, huong: 2 }, { co: [{ x: 3, y: 3 }] }), khe({ x: 1, y: 2, huong: 1 }, { co: [{ x: 6, y: 2 }] })],
      them: { vatChat: ['.........', '.........', '...s.g...', '.........', '.........'] },
      chonDoi: {
        menu: ['PL', 'CH', 'CU'],
        cachMau: [{ chon: ['PL', 'CH'], ghiChu: 'đôi tốt', loiGiai: doiBai([
          ['go_down()', 'clear_iron("D")'],
          ['wait_n(4)', 'forward(3)', 'pick()', 'turn_left()', 'drop()', 'turn_right()', 'forward(2)']], [], [H_CLEAR_IRON]) }]
      },
      maMau: doiBai([['go_down()'], ['wait_n(4)', 'forward(3)']]),
      loiSai: [
        { moTa: 'Thân clear_iron thiếu go(d): nhện đứng lại chắn lối xe', baiLam: doiBai([['go_down()', 'clear_iron("D")'], ['wait_n(4)', 'forward(3)', 'pick()', 'turn_left()', 'drop()', 'turn_right()', 'forward(2)']]), hamCuaEmMoi: [{ ten: 'clear_iron', thamSo: ['d'], than: ['pull_s()'] }], phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 46, nhip: 18 },
      goiY: ['clear_iron(d): pull_s() rồi go(d).', 'Xe gắp gỗ, quay lên, đặt vào hốc.'],
      cauDo: { doi: ['PL', 'CH'], lap: null, coChe: ['sat', 'go', 'hoc'], cuu: 'hang', meo: 'don-loi' }
    }),

    // 4 · giữ cửa: khe (hố) mới chia lối nhện. Nhện nhảy qua khe, đứng lên nút M; cửa C mở cho xe chở hàng mang thùng gỗ vào ô đích.
    man9('cuu-bai-tai-che', 4, 'luyen', {
      ten: 'Nhảy khe giữ cửa',
      mucTieu: 'dua-vat',
      deBai: 'Nút M nằm bên kia khe. Nhện nhảy khe, đứng giữ nút. Xe mang thùng gỗ qua cửa C vào ô đích.',
      veMaMau: 'Nhện chưa qua khe.',
      san: ['########', '#.u.M###', '########', '#.o.C.D#', '########'],
      noi: [{ nut: { x: 4, y: 1 }, cua: [{ x: 4, y: 3 }] }],
      doi: [khe({ x: 1, y: 1, huong: 1 }), khe({ x: 1, y: 3, huong: 1 })],
      
      chonDoi: {
        menu: ['PL', 'CH'],
        cachMau: [{ chon: ['PL', 'CH'], ghiChu: 'đôi tốt', loiGiai: doiBai([
          ['jump("R")', 'go("R")'],
          ['pick()', 'wait_n(2)', 'forward(4)', 'drop()']]) }]
      },
      maMau: doiBai([['jump("R")'], ['pick()', 'wait_n(2)', 'forward(4)', 'drop()']]),
      loiSai: [
        { moTa: 'Nhện dừng trước nút: cửa đóng', baiLam: doiBai([['jump("R")'], ['pick()', 'wait_n(2)', 'forward(4)', 'drop()']]), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 38, nhip: 11 },
      goiY: ['jump("R"): nhảy qua khe sang phải.', 'Nhện đứng trên M thì cửa C mở.'],
      cauDo: { doi: ['PL', 'CH'], lap: null, coChe: ['ho', 'nhay', 'nut-de', 'cua', 'go'], cuu: 'hang', meo: 'giu-cua' }
    }),

    // 5 · cứu người + làm cầu (T2): người kẹt sau thanh sắt. Lối của nhện tới thanh sắt rẽ qua một khe: nhảy ngang thì đáp vào tường, phải bước vào ô khe rồi rẽ lên.
    //     Cẩu hạ container lấp khe (contLapHo), nhện đi qua chỗ vừa lấp, clear_iron("D") hút sắt lùi xuống; người tự đi về trạm cứu.
    //     Mọi khe trên dải ray R, mặt hướng lên (bảng có cần cẩu). Bẫy: xe chở hàng (không qua được khe, không lấp được).
    man9('cuu-bai-tai-che', 5, 'cung-co', {
      ten: 'Container lấp khe',
      mucTieu: 'cuu-nguoi',
      hamCuaEmCan: HAM_EM.concat(['clear_iron']),
      deBai: 'Người kẹt sau thanh sắt. Lối tới thanh sắt rẽ qua một khe. Hạ container lấp khe, dọn sắt cho người đi ra trạm cứu.',
      veMaMau: 'Khe chưa lấp.',
      san: ['##########', '#....o...#', '#####u..##', '#####.#.##', '#####RRR##', '##########'],
      doi: [khe({ x: 7, y: 4, huong: 0 }), khe({ x: 5, y: 4, huong: 0 })],
      them: { contLapHo: true, chong: [{ x: 5, y: 3, cont: [{ so: 3 }] }], vatChat: ['..........', '.....s....', '..........', '..........', '..........', '..........'],
        nguoi: [{ x: 1, y: 1, duong: [{ x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 }, { x: 5, y: 1 }, { x: 6, y: 1 }, { x: 7, y: 1 }, { x: 8, y: 1 }] }], tramCuu: [{ x: 8, y: 1 }] },
      chonDoi: {
        menu: ['PL', 'CH', 'CC'],
        cachMau: [{ chon: ['PL', 'CC'], ghiChu: 'đôi tốt', loiGiai: doiBai([
          ['walk("UULLU")', 'clear_iron("D")'],
          ['pick_up()', 'extend()', 'set_down()']]) }]
      },
      maMau: doiBai([['walk("UULL")'], []]),
      loiSai: [
        { moTa: 'Không lấp khe: nhện bước xuống khe', baiLam: doiBai([['walk("UULLU")', 'clear_iron("D")'], []]), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 22, nhip: 19 },
      goiY: ['Cẩu: pick_up(), extend(), set_down() lên khe.', 'walk("UULLU"): mỗi chữ một bước.'],
      cauDo: { doi: ['PL', 'CC'], lap: null, coChe: ['ho', 'container', 'sat', 'nguoi'], cuu: 'nguoi', meo: 'lam-cau' }
    }),

    // 6 · tiếp sức: thùng gỗ phải vào ô đích sau hàng rào. Xe chở hàng gắp gỗ chạy dọc hành lang dài, đặt trước mũi máy khai thác; máy khai thác nạp, quay xuống, ném qua rào.
    //     Máy khai thác tự đi lấy gỗ cũng được nhưng phải đi rồi về cả hành lang (quá trần nhịp). Bẫy: robot phân loại (nam châm không nhấc gỗ).
    man9('cuu-bai-tai-che', 6, 'cung-co', {
      ten: 'Chuyền gỗ qua rào',
      mucTieu: 'dua-vat',
      deBai: 'Thùng gỗ phải vào ô đích sau hàng rào. Ai mang gỗ, ai ném qua rào?',
      veMaMau: 'Xe chưa đưa gỗ tới.',
      san: ['############', '#.o........#', '##########=#', '##########D#', '############'],
      doi: [khe({ x: 1, y: 1, huong: 1 }), khe({ x: 10, y: 1, huong: 3 })],
      chonDoi: {
        menu: ['PL', 'CH', 'KT'],
        cachMau: [{ chon: ['CH', 'KT'], ghiChu: 'đôi tốt', loiGiai: doiBai([
          ['pick()', 'forward(7)', 'drop()'],
          ['wait_n(11)', 'load()', 'wait()', 'turn_left()', 'throw()', 'wait()']]) }]
      },
      maMau: doiBai([['pick()', 'forward(7)', 'drop()'], ['wait_n(11)', 'load()', 'wait()']]),
      loiSai: [
        { moTa: 'Ném mà chưa quay xuống: gỗ rơi giữa hành lang', baiLam: doiBai([['pick()', 'forward(7)', 'drop()'], ['wait_n(11)', 'load()', 'wait()', 'throw()', 'wait()']]), phaiCoMa: ['nem-vo'] }
      ],
      sao: { o: 31, nhip: 17 },
      goiY: ['load() nạp vật trước mũi, throw() ném xa 2 ô.', 'Quay mặt về phía rào rồi mới ném.'],
      cauDo: { doi: ['CH', 'KT'], lap: null, coChe: ['go', 'rao', 'nem'], cuu: 'hang', meo: 'tiep-suc' }
    }),

    // 7 · cứu máy: robot phân loại khách (R3, khoá) chờ rồi đi thẳng về cờ; kệ sắt nặng (thùng nặng H) chắn lối. Thùng gỗ chắn đường xe cứu hỏa tới kệ:
    //     xe chở hàng gắp gỗ đặt xuống hốc; xe cứu hỏa ủi kệ vào hốc trên rồi lùi ra. Bẫy: drone (không nhấc gỗ, không ủi kệ).
    man9('cuu-bai-tai-che', 7, 'van-dung', {
      ten: 'Kệ sắt chắn nhện',
      deBai: 'Robot phân loại chờ 6 nhịp rồi đi thẳng về cờ. Kệ sắt nặng chắn lối, thùng gỗ chắn đường tới kệ. Ba bạn về cờ.',
      veMaMau: 'Đọc chương trình của robot khoá.',
      san: ['####.####', '#...H.F##', '##F.o####', '###..F###', '####.####', '#########'],
      doi: [khe({ x: 3, y: 2, huong: 1 }, { co: [{ x: 2, y: 2 }] }), khe({ x: 4, y: 4, huong: 0 }, { co: [{ x: 5, y: 3 }] }),
        may('PL', { x: 1, y: 1, huong: 1 }, { son: 'tim', coDinh: true, co: [{ x: 6, y: 1 }] })],
      chonDoi: {
        menu: ['CH', 'CU', 'DR'],
        cachMau: [{ chon: ['CH', 'CU'], ghiChu: 'đôi tốt', loiGiai: doiBai([
          ['pick()', 'turn_right()', 'drop()', 'turn_right()', 'move()'],
          ['wait_n(2)', 'forward(3)', 'back()', 'back()', 'tr_right()', 'move()']]) }]
      },
      maMau: doiBai([[], [], ['wait_n(6)', 'walk("RRRRR")']]),
      loiSai: [
        { moTa: 'Xe cứu hỏa ủi kệ rồi đứng lại: robot khoá vướng xe', baiLam: doiBai([['pick()', 'turn_right()', 'drop()', 'turn_right()', 'move()'], ['wait_n(2)', 'forward(3)'], ['wait_n(6)', 'walk("RRRRR")']]), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 53, nhip: 19 },
      goiY: ['Xe cứu hỏa đi vào ô kệ là ủi kệ đi một ô.', 'Ủi xong thì back() ra khỏi lối.'],
      cauDo: { doi: ['CH', 'CU'], lap: null, coChe: ['go', 'thung-nang', 'r3'], cuu: 'may', meo: 'don-loi' }
    }),

    // 8 · cứu máy: robot phân loại khách (R3, khoá) chờ cửa C mở. Nút M nằm trên dải bùn trơn; xe chở hàng vào bùn là trượt tới hố.
    //     Drone rắc cát ô dưới nút; xe dừng ở ô cát, quay lên đứng giữ nút cho R3 qua cửa. Bẫy: đôi không có drone (xe nào vào bùn cũng trượt rơi hố).
//     (Bảng ghi bẫy xuồng: xuồng xuất phát trên cạn thì lõi ném lỗi, không thua êm, nên đổi xuồng thành xe cứu hỏa; xích + drone cũng thắng.)
    man9('cuu-bai-tai-che', 8, 'van-dung', {
      ten: 'Cát dưới nút đè',
      mucTieu: 'dua-vat',
      deBai: 'Robot phân loại chờ rồi mang sắt qua cửa C. Nút M ở cạnh dải bùn trơn. Rắc cát cho xe dừng đúng ô, giữ nút.',
      veMaMau: 'Đọc chương trình của robot khoá.',
      san: ['#########', '#.oC..D##', '###M#####', '#.IIIu..#', '###.#####', '#########'],
      noi: [{ nut: { x: 3, y: 2 }, cua: [{ x: 3, y: 1 }] }],
      doi: [khe({ x: 1, y: 3, huong: 1 }), khe({ x: 3, y: 4, huong: 0 }),
        may('PL', { x: 1, y: 1, huong: 1 }, { son: 'tim', coDinh: true })],
      them: { vatChat: ['.........', '..s......', '.........', '.........', '.........', '.........'] },
      chonDoi: {
        menu: ['CH', 'DR', 'CU'],
        cachMau: [{ chon: ['CH', 'DR'], ghiChu: 'đôi tốt', loiGiai: doiBai([
          ['wait_n(3)', 'move()', 'turn_left()', 'move()'],
          ['go_up()', 'dot()', 'for i in range(4):', '    go_right()']]) }]
      },
      maMau: doiBai([[], [], ['wait_n(6)', 'go("R")', 'pull_s()', 'walk("RRRR")', 'magnet_off()', 'wait()']]),
      loiSai: [
        { moTa: 'Không rắc cát: xe trượt rơi hố', baiLam: doiBai([['wait_n(3)', 'move()', 'turn_left()', 'move()'], ['go_up()', 'for i in range(4):', '    go_right()'], ['wait_n(6)', 'go("R")', 'pull_s()', 'walk("RRRR")', 'magnet_off()', 'wait()']]), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 37, nhip: 22 },
      goiY: ['dot(): rắc cát ô bùn dưới drone.', 'Xe đứng trên M thì cửa C mở.'],
      cauDo: { doi: ['CH', 'DR'], lap: null, coChe: ['bun', 'rac-cat', 'nut-de', 'cua', 'r3'], cuu: 'may', meo: 'lam-cau' }
    }),

    // 9 · cứu máy, phong phú (khe rộng 2 ô, container, máy ném, sắt, R3): robot phân loại khách (R3, khoá) chỉ đi bộ, mang sắt qua khe rộng hai ô vào ô đích.
    //     Cẩu hạ container lấp ô khe thứ nhất (T2); máy khai thác nạp thùng gỗ chắn trước mũi, ném xuống ô khe thứ hai (đá / vật ném lấp hố).
    //     Mọi khe trên dải ray, mặt hướng lên; cẩu không tới cờ nên mục tiêu là đưa sắt vào đích. Bẫy: xe chở hàng (gắp được gỗ nhưng không lấp được khe).
    man9('cuu-bai-tai-che', 9, 'bien-the', {
      ten: 'Khe rộng hai ô',
      mucTieu: 'dua-vat',
      deBai: 'Robot phân loại mang sắt qua khe rộng hai ô. Nó chỉ đi bộ, không nhảy. Lấp cả hai ô khe kịp lúc.',
      veMaMau: 'Đọc chương trình của robot khoá.',
      san: ['#########', '#.ouu.D##', '###.o####', '###RR####', '#########'],
      doi: [khe({ x: 3, y: 3, huong: 0 }), khe({ x: 4, y: 3, huong: 0 }),
        may('PL', { x: 1, y: 1, huong: 1 }, { son: 'tim', coDinh: true })],
      them: { vatCan: 'sat', contLapHo: true, daLapHo: true, chong: [{ x: 3, y: 2, cont: [{ so: 5 }] }], vatChat: ['.........', '..s......', '....g....', '.........', '.........'] },
      chonDoi: {
        menu: ['CH', 'KT', 'CC'],
        cachMau: [{ chon: ['CC', 'KT'], ghiChu: 'đôi tốt', loiGiai: doiBai([
          ['pick_up()', 'extend()', 'set_down()'],
          ['load()', 'wait()', 'throw()', 'wait()']]) }]
      },
      maMau: doiBai([[], [], ['wait_n(4)', 'go("R")', 'pull_s()', 'walk("RRRR")', 'magnet_off()', 'wait()']]),
      loiSai: [
        { moTa: 'Máy khai thác không ném: robot khoá rơi ô khe thứ hai', baiLam: doiBai([['pick_up()', 'extend()', 'set_down()'], [], ['wait_n(4)', 'go("R")', 'pull_s()', 'walk("RRRR")', 'magnet_off()', 'wait()']]), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 30, nhip: 19 },
      goiY: ['Cẩu: pick_up(), extend(), set_down() lên ô khe.', 'Máy khai thác: load() rồi throw(), vật rơi xa 2 ô.'],
      cauDo: { doi: ['CC', 'KT'], lap: null, coChe: ['ho', 'container', 'nem', 'sat', 'r3'], cuu: 'may', meo: 'lam-cau' }
    }),

    // 10 · song ca đoạn 3 "Kìa con bướm vàng" (Bè 1: 5 5 4 4 3 3 2 2 | Bè 2: 3 1 2 4 1 3 5 5), giữ cho gói 10 ghép bài; dùng play_part (cuu-kho-hang.10 tạo).
    //      Nhện không gắn loa (luật ba câu: thân không mũi, L7 chỉ mở ở chương 2): xe chở hàng lắp loa hát bè 1; bè 2 do máy khai thác lắp loa (khách khác của bãi).
    //      Đá chuông chắn lối ra bãi vỡ khi nghe đúng nốt cuối mỗi bè. Đội cố định (tay loa không có trên bảng chọn).
    man9('cuu-bai-tai-che', 10, 'trum', {
      ten: 'Song ca bãi tái chế',
      mucTieu: 'choi-dieu',
      deBai: 'Bãi đã gọn rồi! Hai xe song ca đoạn 3. Mỗi bạn gọi play_part với bè của mình.',
      veMaMau: 'Bè 2 mới có một nốt.',
      hamCuaEmCan: ['play_note', 'play_part'],
      san: ['#######', '#.....#', '#.....#', '#######'],
      doi: [may('CH', { x: 1, y: 1, huong: 1 }, { tay: 'loa', boHam: ['arm_down', 'arm_up', 'arm_left', 'arm_right', 'grab', 'release'], themHam: ['note', 'beat'], phatNot: true }),
        may('KT', { x: 1, y: 2, huong: 1 }, { son: 'lam', tay: 'loa', boHam: ['load', 'throw', 'aim'], themHam: ['note', 'beat'], phatNot: true })],
      them: { dieu: { r1: '5 5 4 4 3 3 2 2', r2: '3 1 2 4 1 3 5 5' }, daChuong: [{ x: 3, y: 1, not: 2, ben: 1 }, { x: 3, y: 2, not: 5, ben: 1 }] },
      maMau: doiBai([['play_part([5, 5, 4, 4, 3, 3, 2, 2])'], ['play_note(3)']]),
      loiGiai: doiBai([['play_part([5, 5, 4, 4, 3, 3, 2, 2])'], ['play_part([3, 1, 2, 4, 1, 3, 5, 5])']]),
      loiSai: [
        { moTa: 'Bè 2 mới phát một nốt', baiLam: doiBai([['play_part([5, 5, 4, 4, 3, 3, 2, 2])'], ['play_note(3)']]), phaiCoMa: ['lo-nhip'] },
        { moTa: 'Bè 2 thiếu 4 nốt cuối', baiLam: doiBai([['play_part([5, 5, 4, 4, 3, 3, 2, 2])'], ['play_part([3, 1, 2, 4])']]), phaiCoMa: ['lo-nhip'] }
      ],
      sao: { o: 7, nhip: 10 },
      goiY: ['Bè 2: play_part([3, 1, 2, 4, 1, 3, 5, 5]).'],
      cauDo: { doi: ['CH', 'KT'], lap: null, coChe: ['loa', 'da-chuong'], cuu: null, meo: 'song-song' }
    }),

    /* ========================================================================
       CHƯƠNG 2: lap-bai-tai-che (10 màn)
       ======================================================================== */
    // 11 · show: Luna lắp sẵn nhện + kẹp + cảm biến từ (đổi tay, giữ thân; khoá). Nhện kẹp nhảy khe, gắp thùng gỗ đặt vào ô đích; robot phân loại hút sắt vào ô đích của nó.
    //      Bấm Chạy là thấy: cùng thân nhện, tay kẹp làm được việc nam châm không làm được.
    man9('lap-bai-tai-che', 1, 'lam-quen', {
      ten: 'Nhện tay kẹp',
      chiChay: true, mucTieu: 'dua-vat',
      deBai: 'Luna lắp nhện với tay kẹp. Nhện kẹp nhảy khe gắp gỗ, robot phân loại hút sắt. Bấm Chạy.',
      veMaMau: 'Bấm Chạy xem nhện kẹp làm gì.',
      san: ['########', '#.o.D###', '########', '#.u.oD##', '########'],
      doi: [may('PL', { x: 1, y: 1, huong: 1 }), Object.assign({ batDau: { x: 1, y: 3, huong: 1 } }, clone(NHEN_KEP_TU))],
      them: { vatChat: ['........', '..s.....', '........', '....g...', '........'] },
      maMau: doiBai([['walk("R")', 'pull_s()', 'walk("RR")', 'magnet_off()', 'wait()'], ['jump("R")', 'pick()', 'go("R")', 'drop()']]),
      loiGiai: doiBai([['walk("R")', 'pull_s()', 'walk("RR")', 'magnet_off()', 'wait()'], ['jump("R")', 'pick()', 'go("R")', 'drop()']]),
      sao: { o: 39, nhip: 10 },
      goiY: ['Kẹp của nhện gắp ô phía trước cố định (bên phải).'],
      cauDo: { doi: null, lap: 'nhen+kep+tu', coChe: ['go', 'sat', 'ho', 'nhay'], cuu: 'hang', meo: 'song-song' }
    }),

    // 12 · ép đổi tay: thùng gỗ nằm trên ô đích của robot phân loại (thả sắt bị chặn). Nam châm không nhấc gỗ; kẹp thì được.
    //      Nhện + kẹp nhảy khe lên gắp ngay (nhanh, đắt); xe hai bánh + kẹp đi vòng hành lang (rẻ, chậm).
    man9('lap-bai-tai-che', 2, 'lam-quen', {
      ten: 'Nam châm hay kẹp',
      mucTieu: 'dua-vat',
      deBai: 'Thùng gỗ nằm trên ô đích của robot phân loại. Lắp tay nào để nhấc gỗ đi?',
      veMaMau: 'Robot phân loại chờ ô đích trống.',
      san: ['#########', '#.o..X###', '#####..##', '#####u.##', '#####..##', '#########'],
      doi: [may('PL', { x: 1, y: 1, huong: 1 }), khe({ x: 5, y: 4, huong: 0 }, { son: 'lam' })],
      them: { vatCan: 'sat', vatChat: ['.........', '..s..g...', '.........', '.........', '.........', '.........'] },
      lapRap: lapR2(['nhen', 'hai-banh'], ['nam-cham', 'kep'], [], 6, [
        cach('nhen', 'kep', null, [['walk("R")', 'pull_s()', 'walk("RRR")', 'magnet_off()', 'wait()'], ['jump("U")', 'pick()']]),
        cach('hai-banh', 'kep', null, [['wait_n(2)', 'walk("R")', 'pull_s()', 'walk("RRR")', 'magnet_off()', 'wait()'],
          ['turn_right()', 'move()', 'turn_left()', 'forward(2)', 'turn_left()', 'move()', 'turn_right()', 'pick()']])
      ]),
      maMau: doiBai([['walk("R")', 'pull_s()', 'walk("RRR")', 'magnet_off()', 'wait()'], []]),
      loiSai: [
        { moTa: 'Không ai nhấc gỗ: sắt không thả được', baiLam: doiBai([['walk("R")', 'pull_s()', 'walk("RRR")', 'magnet_off()', 'wait()'], []]), phaiCoMa: ['tha-bi-chan'] }
      ],
      sao: { o: 31, nhip: 12 },
      goiY: ['Gỗ không dính nam châm.', 'Nhện nhảy khe: jump("U").'],
      cauDo: { doi: null, lap: 'nhen+kep', coChe: ['go', 'sat', 'ho', 'doi-tay'], cuu: 'hang', meo: 'don-loi' }
    }),

    // 13 · nhện + kẹp + cảm biến từ, and: hàng phế liệu dưới lối nhện có sắt, gỗ, khối nam châm. Nhện đi dọc hàng, đọc ô dưới:
    //      not front_metal() and front_pole() == "none" là gỗ thì gắp; sắt chừa cho robot phân loại, khối nam châm để yên. Cách hai rẻ hơn: xe hai bánh + kẹp, quay lên quay xuống (chậm).
    man9('lap-bai-tai-che', 3, 'luyen', {
      ten: 'Gỗ, sắt hay nam châm',
      mucTieu: 'dua-vat',
      deBai: 'Hàng phế liệu có sắt, gỗ và khối nam châm. Chỉ gắp gỗ, đặt vào ô đích cuối hàng. Sắt để robot phân loại.',
      veMaMau: 'Nhện chưa đọc gì.',
      san: ['########', '#......#', '#.oXoD##', '##D#####', '########'],
      doi: [may('PL', { x: 1, y: 2, huong: 1 }), khe({ x: 2, y: 1, huong: 2 }, { son: 'lam' })],
      them: { vatChat: ['........', '........', '..sNg...', '........', '........'] },
      lapRap: lapR2(['nhen', 'hai-banh'], ['kep'], ['tu'], 8, [
        cach('nhen', 'kep', 'tu', [['go("R")', 'pull_deliver("D")'],
          ['for i in range(3):', '    if not front_metal() and front_pole() == "none":', '        pick()', '    go_right()', 'drop()']]),
        cach('hai-banh', 'kep', null, [['go("R")', 'pull_deliver("D")'],
          ['turn_left()', 'forward(2)', 'turn_right()', 'pick()', 'turn_left()', 'move()', 'turn_right()', 'drop()']])
      ]),
      hamCuaEmCan: HAM_EM.concat(['pull_deliver']),
      maMau: doiBai([['go("R")', 'pull_deliver("D")'], ['for i in range(3):', '    go_right()']]),
      loiSai: [
        { moTa: 'Chỉ đọc front_metal(): gắp nhầm khối nam châm', baiLam: doiBai([['go("R")', 'pull_deliver("D")'], ['for i in range(3):', '    if not front_metal():', '        pick()', '    go_right()', 'drop()']]), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 34, nhip: 11 },
      goiY: ['front_pole() trả "N", "S" hay "none".', 'Gỗ: không phải sắt VÀ không có cực.'],
      cauDo: { doi: null, lap: 'nhen+kep+tu', coChe: ['go', 'sat', 'nam-cham', 'cam-bien'], cuu: 'hang', meo: 'doc-roi-chon' }
    }),

    // 14 · lai L12 nhện + kẹp + camera bốn hướng: thùng gỗ sơn màu theo loại (xanh dương đã đúng chỗ, đỏ phải vào ô đích). color("up") trả chuỗi màu;
    //      nhện đi tới khi ô trên là "red", gắp, qua cửa C (robot phân loại đứng giữ nút M), đặt vào ô đích. Cách hai rẻ hơn: xe hai bánh + kẹp quay lên quay sang (chậm).
    man9('lap-bai-tai-che', 4, 'luyen', {
      ten: 'Gỗ sơn đỏ',
      mucTieu: 'dua-vat',
      deBai: 'Gỗ sơn màu theo loại. Thùng đỏ phải vào ô đích sau cửa C. color("up") đọc màu ô bên trên.',
      veMaMau: 'Nhện chưa tìm thùng đỏ.',
      san: ['#######', '#XoD###', '#..C###', '###M###', '###.###', '#######'],
      noi: [{ nut: { x: 3, y: 3 }, cua: [{ x: 3, y: 2 }] }],
      doi: [may('PL', { x: 3, y: 4, huong: 0 }), khe({ x: 1, y: 2, huong: 0 }, { son: 'lam' })],
      them: { vatMau: ['.......', '.br....', '.......', '.......', '.......', '.......'] },
      lapRap: lapR2(['nhen', 'hai-banh'], ['kep'], ['camera-4'], 9, [
        cach('nhen', 'kep', 'camera-4', [['go("U")'], ['while color("up") != "red":', '    go_right()', 'pick()', 'go_right()', 'drop()']]),
        cach('hai-banh', 'kep', null, [['go("U")'], ['turn_right()', 'move()', 'turn_left()', 'pick()', 'turn_right()', 'move()', 'turn_left()', 'drop()']])
      ], { moLai: ['L12'] }),
      maMau: doiBai([['go("U")'], ['go_right()']]),
      loiSai: [
        { moTa: 'Gắp ngay thùng xanh dương ở trên', baiLam: doiBai([['go("U")'], ['pick()', 'go_right()', 'go_right()', 'drop()']]), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 27, nhip: 9 },
      goiY: ['color("up") trả chuỗi như "red", "blue".', 'while color("up") != "red": đi tiếp.'],
      cauDo: { doi: null, lap: 'nhen+kep+camera-4', coChe: ['go', 'mau', 'nut-de', 'cua'], cuu: 'hang', meo: 'doc-roi-chon' }
    }),

    // 15 · hai bánh + nam châm + cảm biến từ: khối nam châm nằm trên ô đích của robot phân loại. front_pole() đọc cực quay về xe (chuỗi "N" / "S");
    //      bật CÙNG cực thì khối bị đẩy xa 3 ô, trượt vào ô đích cuối hành lang. Cách hai rẻ hơn: xe hai bánh + kẹp tới gắp khối, chở vào ô đích (chậm).
    man9('lap-bai-tai-che', 5, 'cung-co', {
      ten: 'Cùng cực thì đẩy',
      mucTieu: 'dua-vat',
      deBai: 'Khối nam châm nằm trên ô đích của robot phân loại. Đọc cực của khối, bật cùng cực để đẩy nó vào ô đích cuối hành lang.',
      veMaMau: 'Xe chưa đọc cực.',
      san: ['##########', '####.o####', '##...X..D#', '##########'],
      doi: [may('PL', { x: 4, y: 1, huong: 1 }), khe({ x: 2, y: 2, huong: 1 }, { son: 'lam' })],
      them: { vatChat: ['..........', '.....s....', '.....N....', '..........'] },
      lapRap: lapR2(['hai-banh'], ['nam-cham', 'kep'], ['tu'], 7, [
        cach('hai-banh', 'nam-cham', 'tu', [['go("R")', 'pull_deliver("D")'], ['if front_pole() == "N":', '    magnet_n()', 'else:', '    magnet_s()', 'wait()', 'magnet_off()', 'wait()']]),
        cach('hai-banh', 'kep', null, [['wait_n(5)', 'go("R")', 'pull_deliver("D")'], ['forward(2)', 'pick()', 'forward(3)', 'drop()']])
      ]),
      hamCuaEmCan: HAM_EM.concat(['pull_deliver']),
      maMau: doiBai([['go("R")', 'pull_deliver("D")'], ['magnet_s()', 'wait()']]),
      loiSai: [
        { moTa: 'Bật khác cực: khối bị hút dính vào xe', baiLam: doiBai([['go("R")', 'pull_deliver("D")'], ['magnet_s()', 'wait()', 'magnet_off()', 'wait()']]), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 26, nhip: 8 },
      goiY: ['front_pole() == "N": cực N quay về xe.', 'Cùng cực thì đẩy, khác cực thì hút.'],
      cauDo: { doi: null, lap: 'hai-banh+nam-cham+tu', coChe: ['nam-cham', 'sat', 'day-tu-xa'], cuu: 'hang', meo: 'don-loi' }
    }),

    // 16 · lai L1 cẩu + nam châm: thanh sắt thứ hai nằm trên ô đích của robot phân loại; ô đích của nó là hốc sau hàng rào thấp (nhện không vào được).
    //      Cẩu vươn cần qua rào hút sắt, quay cần thả vào hốc. Cách hai rẻ hơn: drone + nam châm bay qua rào (cùng nhịp, nhiều ô lệnh hơn). Khe không khai nac (cẩu mặc định nac 0) để drone dùng chung khe.
    man9('lap-bai-tai-che', 6, 'cung-co', {
      ten: 'Hốc sau hàng rào',
      mucTieu: 'dua-vat',
      deBai: 'Một thanh sắt chiếm ô đích của robot phân loại. Chỗ của nó là hốc sau hàng rào, nhện không vào được. Lắp robot đưa sắt vào hốc.',
      veMaMau: 'Cẩu mới vươn cần.',
      san: ['########', '#.o.X###', '####=###', '####.=D#', '########'],
      doi: [may('PL', { x: 1, y: 1, huong: 1 }), khe({ x: 4, y: 3, huong: 0 }, { son: 'lam' })],
      them: { vatChat: ['........', '..s.s...', '........', '........', '........'] },
      lapRap: lapR2(['cau', 'drone'], ['nam-cham'], [], 9, [
        cach('cau', 'nam-cham', null, [['walk("R")', 'pull_s()', 'walk("RR")', 'magnet_off()', 'wait()'], ['extend()', 'magnet_n()', 'swing_right()', 'magnet_off()']]),
        cach('drone', 'nam-cham', null, [['walk("R")', 'pull_s()', 'walk("RR")', 'magnet_off()', 'wait()'],
          ['go_up()', 'go_up()', 'magnet_n()', 'wait()', 'go_down()', 'go_down()', 'go_right()', 'go_right()', 'magnet_off()', 'wait()']])
      ], { moLai: ['L1'] }),
      maMau: doiBai([['walk("R")', 'pull_s()', 'walk("RR")', 'magnet_off()', 'wait()'], ['extend()']]),
      loiSai: [
        { moTa: 'Hút sắt mà chưa quay cần: thả lại chỗ cũ', baiLam: doiBai([['walk("R")', 'pull_s()', 'walk("RR")', 'magnet_off()', 'wait()'], ['extend()', 'magnet_n()', 'magnet_off()']]), phaiCoMa: ['tha-bi-chan'] }
      ],
      sao: { o: 25, nhip: 10 },
      goiY: ['Nam châm trên đầu cần hút sắt ở ô dưới đầu cần.', 'swing_right() quay cần sang phải.'],
      cauDo: { doi: null, lap: 'cau+nam-cham', coChe: ['sat', 'qua-rao', 'hoc-kin'], cuu: 'hang', meo: 'don-loi' }
    }),

    // 17 · lai L6 nhện + gieo hạt: dải bùn trơn trước lối robot phân loại, cuối dải là hố. Nhện gieo hạt leo lên ô rẽ (trên là tường nên dừng được trên bùn),
    //      rắc cát ô đó rồi lui về; robot phân loại đi theo đúng vết: trượt tới ô cát, rẽ xuống về cờ. Cách hai đắt hơn: drone + gieo hạt bay (nhanh hơn).
    man9('lap-bai-tai-che', 7, 'van-dung', {
      ten: 'Cát dẫn lối',
      deBai: 'Bùn trơn: robot phân loại vào dải là trượt tới hố. Rắc cát ô rẽ cho nó dừng, rồi tránh đường. Hai bạn về cờ.',
      veMaMau: 'Robot phân loại chờ ô cát.',
      san: ['########', '#.IIIu##', '###.####', '###.F###', '###F####', '########'],
      doi: [may('PL', { x: 1, y: 1, huong: 1 }, { co: [{ x: 3, y: 4 }] }), khe({ x: 3, y: 3, huong: 0 }, { son: 'lam', co: [{ x: 4, y: 3 }] })],
      lapRap: lapR2(['nhen', 'drone'], ['son'], [], 8, [
        cach('nhen', 'son', null, [['wait_n(7)', 'walk("RDDD")'], ['go_up()', 'go_up()', 'dot()', 'go_down()', 'go_down()', 'go_right()']]),
        cach('drone', 'son', null, [['wait_n(3)', 'walk("RDDD")'], ['go_up()', 'go_up()', 'dot()', 'go_down()', 'go_down()', 'go_right()']])
      ], { moLai: ['L6'] }),
      maMau: doiBai([['wait_n(7)', 'walk("RDDD")'], ['go_up()', 'go_up()']]),
      loiSai: [
        { moTa: 'Không rắc cát: robot phân loại trượt rơi hố', baiLam: doiBai([['wait_n(7)', 'walk("RDDD")'], ['go_up()', 'go_up()', 'go_down()', 'go_down()', 'go_right()']]), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 24, nhip: 18 },
      goiY: ['dot(): rắc cát ô bùn dưới bụng.', 'walk("RDDD"): một chuỗi, mỗi chữ một bước.'],
      cauDo: { doi: null, lap: 'nhen+son', coChe: ['bun', 'rac-cat', 'ho'], cuu: null, meo: 'dan-duong' }
    }),

    // 18 · cứu người: người kẹt sau thanh sắt và thùng gỗ. Robot phân loại dọn sắt (clear_iron). Nhện + kẹp nhảy khe, gắp thùng gỗ từ dưới lên (nhanh, đắt);
    //      xích + kẹp đi vòng bên phải rồi gắp (rẻ, chậm). (Bảng có thùng nặng: bỏ, xích không ủi được thùng nặng.)
    man9('lap-bai-tai-che', 8, 'van-dung', {
      ten: 'Người sau đống phế liệu',
      mucTieu: 'cuu-nguoi',
      hamCuaEmCan: HAM_EM.concat(['clear_iron']),
      deBai: 'Người kẹt sau thanh sắt và thùng gỗ. Robot phân loại dọn sắt. Lắp robot gắp thùng gỗ cho người đi ra trạm cứu.',
      veMaMau: 'Thùng gỗ còn chắn lối.',
      san: ['##########', '#..o.o...#', '###.#..###', '#####u.###', '#####..###', '##########'],
      doi: [may('PL', { x: 3, y: 2, huong: 0 }), khe({ x: 5, y: 4, huong: 0 }, { son: 'lam' })],
      them: { vatChat: ['..........', '...s.g....', '..........', '..........', '..........', '..........'],
        nguoi: [{ x: 1, y: 1, duong: [{ x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 }, { x: 5, y: 1 }, { x: 6, y: 1 }, { x: 7, y: 1 }, { x: 8, y: 1 }] }], tramCuu: [{ x: 8, y: 1 }] },
      lapRap: lapR2(['nhen', 'xich'], ['kep'], [], 6, [
        cach('nhen', 'kep', null, [['go("U")', 'clear_iron("D")'], ['jump("U")', 'pick()']]),
        cach('xich', 'kep', null, [['go("U")', 'clear_iron("D")'], ['tr_right()', 'move()', 'tr_left()', 'forward(2)', 'tr_left()', 'move()', 'tr_right()', 'pick()']])
      ]),
      maMau: doiBai([['go("U")', 'clear_iron("D")'], []]),
      loiSai: [
        { moTa: 'Nhảy khe rồi không gắp: thùng gỗ còn chắn người', baiLam: doiBai([['go("U")', 'clear_iron("D")'], ['jump("U")']]), phaiCoMa: ['chua-cuu-nguoi'] }
      ],
      sao: { o: 30, nhip: 12 },
      goiY: ['Nhện nhảy khe: jump("U").', 'Xích không qua hố: đi vòng bên phải.'],
      cauDo: { doi: null, lap: 'nhen+kep', coChe: ['go', 'sat', 'ho', 'nguoi'], cuu: 'nguoi', meo: 'cuu-kip' }
    }),

    // 19 · ⟨nhện, omni⟩ + kẹp, đọc rồi chọn: thùng gỗ phải qua cửa C vào ô đích; robot phân loại đứng giữ nút M. Nhện nhảy khe (lệnh ngắn, chậm hơn);
    //      omni trượt xuống hành lang dưới rồi trượt lên (nhanh hơn, lệnh dài hơn). Hai cách cùng giá: chọn theo nhịp hay theo số ô lệnh.
    man9('lap-bai-tai-che', 9, 'bien-the', {
      ten: 'Nhảy khe hay trượt',
      mucTieu: 'dua-vat',
      deBai: 'Thùng gỗ phải qua cửa C vào ô đích. Nhện nhảy khe hay omni trượt hành lang? Cùng giá: xem nhịp, xem số ô lệnh.',
      veMaMau: 'Robot chưa làm gì.',
      san: ['#########', '#..M#####', '#########', '#.u.oCD##', '#...#####', '#########'],
      noi: [{ nut: { x: 3, y: 1 }, cua: [{ x: 5, y: 3 }] }],
      doi: [may('PL', { x: 1, y: 1, huong: 1 }), khe({ x: 1, y: 3, huong: 1 }, { son: 'lam' })],
      lapRap: lapR2(['nhen', 'omni'], ['kep'], [], 6, [
        cach('omni', 'kep', null, [['walk("RR")'], ['slide_r(1)', 'forward(2)', 'slide_left()', 'wait()', 'pick()', 'forward(2)', 'drop()']]),
        cach('nhen', 'kep', null, [['walk("RR")'], ['jump("R")', 'pick()', 'walk("RR")', 'drop()']])
      ]),
      hamCuaEmCan: HAM_EM.concat(['slide_r']),
      maMau: doiBai([['walk("RR")'], []]),
      loiSai: [
        { moTa: 'Robot phân loại không giữ nút: cửa đóng', baiLam: doiBai([['walk("R")'], ['slide_r(1)', 'forward(2)', 'slide_left()', 'wait()', 'pick()', 'forward(2)', 'drop()']]), phaiCoMa: ['dam-tuong'] }
      ],
      sao: { o: 43, nhip: 11 },
      goiY: ['Omni quay mặt sang phải: slide_r(1) trượt xuống, slide_left() trượt lên.'],
      cauDo: { doi: null, lap: 'omni+kep', coChe: ['go', 'ho', 'nut-de', 'cua', 'truot-ngang'], cuu: 'hang', meo: 'doc-roi-chon' }
    }),

    // 20 · lai L7 nhện + loa, song ca đoạn 3 "Kìa con bướm vàng" (play_part, cuu-kho-hang.10 tạo): đá chuông nốt 1 chắn lối xe chở hàng (đặt sẵn, lắp loa, hát bè 1);
    //      chỉ bè 2 có nốt 1. Nhện hát lần đầu: nhảy khe vào tầm 3 ô quanh nó (không cần mũi). Xe hai bánh + loa phải đi vòng, quay mũi về đá (rẻ hơn, chậm hơn).
    //      Xe chở hàng chờ đúng số nhịp Luna di chuyển để hai bè vào cùng lúc, hát xong đi qua chỗ đá vỡ về cờ. (Đội choi-dieu có cờ thì lõi chưa cho thắng: dùng toi-co như G1, G2.)
    man9('lap-bai-tai-che', 10, 'trum', {
      ten: 'Nhện hát lần đầu',
      hamCuaEmCan: HAM_EM.concat(['play_note', 'play_part']),
      deBai: 'Bãi gọn rồi! Song ca đoạn 3. Đá chuông nốt 1 chắn lối xe chở hàng: phải hát nốt 1 ở gần đá.',
      veMaMau: 'Xe chở hàng đã có bè 1.',
      san: ['#########', '#......F#', '#########', '#.u...F##', '#.....###', '#########'],
      them: { daChuong: [{ x: 5, y: 1, not: 1, ben: 1 }] },
      doi: [may('CH', { x: 1, y: 1, huong: 1 }, { co: [{ x: 7, y: 1 }], tay: 'loa', boHam: ['arm_down', 'arm_up', 'arm_left', 'arm_right', 'grab', 'release'], themHam: ['note', 'beat'], phatNot: true }),
        khe({ x: 1, y: 3, huong: 1 }, { son: 'lam', co: [{ x: 6, y: 3 }] })],
      lapRap: lapR2(['nhen', 'hai-banh'], ['loa'], [], 7, [
        cach('nhen', 'loa', null, [['wait_n(5)', 'play_part([5, 5, 4, 4, 3, 3, 2, 2])', 'forward(6)'], ['jump("R")', 'go("R")', 'play_part([3, 1, 2, 4, 1, 3, 5, 5])', 'walk("RR")']]),
        cach('hai-banh', 'loa', null, [['wait_n(8)', 'play_part([5, 5, 4, 4, 3, 3, 2, 2])', 'forward(6)'],
          ['turn_right()', 'move()', 'turn_left()', 'forward(4)', 'turn_left()', 'play_part([3, 1, 2, 4, 1, 3, 5, 5])', 'move()', 'turn_right()', 'move()']])
      ], { moLai: ['L7'] }),
      maMau: doiBai([['wait_n(5)', 'play_part([5, 5, 4, 4, 3, 3, 2, 2])', 'forward(6)'], ['jump("R")']]),
      loiSai: [
        { moTa: 'Nhện hát ngay sau khi nhảy: đá chuông xa quá, không vỡ', baiLam: doiBai([['wait_n(5)', 'play_part([5, 5, 4, 4, 3, 3, 2, 2])', 'forward(6)'], ['jump("R")', 'play_part([3, 1, 2, 4, 1, 3, 5, 5])', 'walk("RRR")']]), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Nhện hát nhầm bè 1 (không có nốt 1): đá chuông còn', baiLam: doiBai([['wait_n(5)', 'play_part([5, 5, 4, 4, 3, 3, 2, 2])', 'forward(6)'], ['jump("R")', 'go("R")', 'play_part([5, 5, 4, 4, 3, 3, 2, 2])', 'walk("RR")']]), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 38, nhip: 23 },
      goiY: ['Bè 2: play_part([3, 1, 2, 4, 1, 3, 5, 5]).', 'Nhện hát vang quanh nó tới 3 ô.'],
      cauDo: { doi: null, lap: 'nhen+loa', coChe: ['loa', 'da-chuong', 'ho', 'nhay'], cuu: null, meo: 'song-song' }
    }),
  ];
})();
