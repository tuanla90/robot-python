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

  /* ---- BẢN CŨ: khung màn cũ (xoá khi dựng xong 20 màn) ---- */
  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var HAM_NHEN = ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'crouch', 'stand', 'magnet_n', 'magnet_s', 'magnet_off', 'front_metal', 'front_pole'];
  var HAM_XICH = BANH.concat(['spray', 'spray_back', 'distance', 'warm']);
  var HAM_XICH_LOA = BANH.concat(['beat', 'note', 'distance', 'warm']);
  var HAM_BANH = BANH.concat(['arm_down', 'arm_up', 'arm_left', 'arm_right', 'grab', 'release', 'front_clear', 'left_clear', 'right_clear']);
  var HAM_OMNI = BANH.concat(['slide_left', 'slide_right', 'load', 'throw', 'radar', 'diag_left', 'diag_right', 'aim', 'shape']);
  var HAM_GAI = BANH.concat(['retract_spikes', 'extend_spikes', 'beat', 'note', 'hear', 'listen']);

  var R1_NHEN = {
    loaiRobot: 'nhen',
    robot: { than: 'nhen', tay: 'nam-cham', camBien: [{ ma: 'tu', o: 'hong' }] },
    hamGoc: HAM_NHEN
  };
  var R1_LOA = {
    loaiRobot: 'xich', phatNot: true,
    robot: { than: 'xich', tay: 'loa', camBien: [{ ma: 'hong-ngoai', o: 'tren' }] },
    hamGoc: HAM_XICH_LOA
  };
  var R_XICH = {
    loaiRobot: 'xich', xichDay: true, lucBan: true,
    robot: { than: 'xich', tay: 'hoi', camBien: [{ ma: 'hong-ngoai', o: 'tren' }], son: 'lam' },
    hamGoc: HAM_XICH
  };
  var R_BANH = {
    loaiRobot: 'banh',
    robot: { than: 'hai-banh', tay: 'xoay', camBien: [{ ma: 'khoang-cach', o: 'hong' }], son: 'lam' },
    hamGoc: HAM_BANH
  };
  var R_OMNI = {
    loaiRobot: 'omni', omniCheo: true, chinhLuc: true, nhanDang: true, tamNemMacDinh: 2, daLapHo: true,
    robot: { than: 'omni', tay: 'nem', camBien: [{ ma: 'radar', o: 'tren', nhanDang: true }], son: 'lam' },
    hamGoc: HAM_OMNI
  };
  var R_GAI = {
    loaiRobot: 'gai', thuGai: true, phatNot: true, phanAm: true,
    robot: { than: 'gai', tay: 'loa', camBien: [{ ma: 'am-thanh', o: 'tren', phanAm: true }], son: 'lam' },
    hamGoc: HAM_GAI
  };

  var H_CLEAR_IRON = {
    ten: 'clear_iron', thamSo: ['d'],
    than: ['pull_s()', 'go(d)']
  };
  var H_HOP_OVER = {
    ten: 'hop_over', thamSo: ['d'],
    than: ['jump(d)', 'go(d)']
  };
  var H_PULL_DELIVER = {
    ten: 'pull_deliver', thamSo: ['d'],
    than: ['pull_s()', 'go(d)', 'magnet_off()', 'wait()']
  };


  function baiDoi(r1Chinh, r2Chinh, hamEm, hamMan) {
    return {
      doi: [{ chinh: r1Chinh.slice() }, { chinh: r2Chinh.slice() }],
      hamCuaMan: hamMan ? clone(hamMan) : [],
      hamCuaEmMoi: hamEm ? clone(hamEm) : []
    };
  }

  function manTC(chuong, so, hang, cfg) {
    var r1 = clone(cfg.r1 || R1_NHEN);
    var r2 = clone(cfg.r2 || R_XICH);
    r1.batDau = cfg.bd[0];
    r2.batDau = cfg.bd[1];
    if (cfg.coDinhR1) r1.coDinh = true;
    if (cfg.coDinhR2) r2.coDinh = true;
    if (cfg.co) {
      r1.co = cfg.co[0];
      r2.co = cfg.co[1];
    }
    var m = {
      chuong: chuong,
      so: so,
      ten: cfg.ten,
      hang: hang,
      vo: 'tai-che',
      loaiRobot: r1.loaiRobot,
      daLapHo: true,
      robot: clone(r1.robot),
      hamGoc: r1.hamGoc.slice(),
      cauTruc: cfg.cauTruc || ['for', 'if', 'while', 'list'],
      vaHoac: true,
      moXuong: true,
      camHamCuaEm: false,
      hamCuaEmCan: cfg.hamCuaEmCan || ['go', 'walk', 'wait_n'],
      taoHam: cfg.taoHam || [],
      khung: cfg.khung || { chinh: 10, moiHam: 8 },
      mucTieu: cfg.mucTieu || 'toi-co',
      deBai: cfg.deBai,
      veMaMau: cfg.veMaMau || '',
      san: cfg.san,
      batDau: cfg.bd[0],
      doi: [r1, r2],
      maMau: cfg.maMau,
      loiGiai: cfg.loiGiai,
      loiSai: cfg.loiSai || [],
      sao: cfg.sao || { o: 16, nhip: 10 },
      goiY: cfg.goiY || []
    };
    if (cfg.chiChay) { m.chiChay = true; m.chinhCoDinh = true; }
    if (cfg.vatCan) m.vatCan = cfg.vatCan;
    if (cfg.noi) m.noi = cfg.noi;
    if (cfg.dieu) m.dieu = cfg.dieu;
    if (cfg.vatChat) m.vatChat = cfg.vatChat;
    if (cfg.vatThem) m.vatThem = cfg.vatThem;
    if (cfg.chuongDa) m.chuongDa = cfg.chuongDa;
    if (cfg.daChuong) m.daChuong = cfg.daChuong;
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
      doi: [khe({ x: 7, y: 4, huong: 0 }), khe({ x: 5, y: 4, huong: 0, nac: 0 })],
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
    //     Drone rắc cát ô dưới nút; xe dừng ở ô cát, quay lên đứng giữ nút cho R3 qua cửa. Bẫy: xuồng (không lên bờ).
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
        menu: ['CH', 'DR', 'XU'],
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
      doi: [khe({ x: 3, y: 3, huong: 0, nac: 0 }), khe({ x: 4, y: 3, huong: 0 }),
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

    /* ---- BẢN CŨ (xoá dần khi dựng lại) ---- */
    manTC('lap-bai-tai-che', 1, 'lam-quen', {
      ten: 'Quan sát hàm clear_iron dọn sắt nhanh',
      chiChay: true, r2: R_XICH,
      hamCuaEmCan: ['go', 'pull_s', 'move', 'forward', 'wait_n'],
      deBai: 'Sang chương Lập trình cứu Bãi tái chế, em sẽ chế tạo các hàm điều khiển nhện nam châm phối hợp cùng đồng đội! Hãy nhấn Chạy để xem R1 gọi clear_iron("D") vừa hút mẩu sắt ở (2, 1) vừa bước xuống F(2, 2), nhường đường cho R2 tiến thẳng tới cờ F(4, 1).',
      veMaMau: 'Quan sát hàm clear_iron(d) giúp R1 hút sắt và tránh đường gọn gàng.',
      san: ['######', '#...F#', '##F###', '######'],
      bd: [{ x: 2, y: 1, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      co: [[{ x: 2, y: 2 }], [{ x: 4, y: 1 }]],
      vatThem: [{ x: 2, y: 1, chat: 'sat' }],
      maMau: baiDoi(['clear_iron("D")'], ['wait_n(3)', 'forward(3)'], [], [H_CLEAR_IRON]),
      loiGiai: baiDoi(['clear_iron("D")'], ['wait_n(3)', 'forward(3)'], [], [H_CLEAR_IRON]),
      sao: { o: 17, nhip: 6 },
      goiY: ['Nhấn Chạy để xem hàm clear_iron("D") hoạt động.']
    }),
    manTC('lap-bai-tai-che', 2, 'lam-quen', {
      ten: 'Chế tạo hàm clear_iron cho robot nhện',
      r2: R_BANH,
      taoHam: ['clear_iron'],
      hamCuaEmCan: ['go', 'pull_s', 'move', 'forward', 'wait_n'],
      deBai: 'Hãy định nghĩa hàm clear_iron(d) cho R1 gồm 2 lệnh: pull_s() để hút sắt vụn dưới bụng, rồi go(d) để bước sang hướng d nhường đường! Ở chương trình chính, R1 gọi clear_iron("U") hút sắt ở (2, 2) rồi bước lên cờ F(2, 1), mở đường cho R2 (xe hai bánh) chờ 3 nhịp rồi tiến 3 ô tới F(4, 2).',
      veMaMau: 'Hoàn thiện thân hàm clear_iron(d) gồm pull_s() và go(d).',
      san: ['######', '##F###', '#...F#', '######'],
      bd: [{ x: 2, y: 2, huong: 1 }, { x: 1, y: 2, huong: 1 }],
      co: [[{ x: 2, y: 1 }], [{ x: 4, y: 2 }]],
      vatThem: [{ x: 2, y: 2, chat: 'sat' }],
      maMau: baiDoi(['clear_iron("U")'], ['wait_n(3)', 'forward(3)']),
      loiGiai: baiDoi(['clear_iron("U")'], ['wait_n(3)', 'forward(3)'], [H_CLEAR_IRON]),
      loiSai: [
        { moTa: 'Hàm clear_iron(d) thiếu go(d) nên R1 vẫn đứng ở (2, 2) chắn đường R2', baiLam: baiDoi(['clear_iron("U")'], ['wait_n(3)', 'forward(3)']), hamCuaEmMoi: [{ ten: 'clear_iron', thamSo: ['d'], than: ['pull_s()'] }], phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 17, nhip: 6 },
      goiY: ['Trong hàm clear_iron(d), thêm go(d) ngay dưới pull_s().']
    }),
    manTC('lap-bai-tai-che', 3, 'luyen', {
      ten: 'Dọn sắt và đè nút mở cửa bằng clear_iron',
      r2: R_XICH,
      hamCuaEmCan: ['go', 'pull_s', 'move', 'forward', 'wait_n', 'clear_iron'],
      deBai: 'Trên đường tiến về cờ F(4, 2) của R2 có mẩu sắt tại (2, 2) và cửa C(3, 2). Hãy cho R1 ở (2, 2) gọi clear_iron("U") để vừa hút mẩu sắt ở (2, 2) vừa bước lên đè nút M(2, 1), chờ 2 nhịp bằng wait_n(2) cho R2 đi qua cửa C(3, 2), rồi gọi go("R") sang cờ F(3, 1)!',
      veMaMau: 'Gọi clear_iron("U"), wait_n(2), go("R") cho R1.',
      san: ['######', '##MF##', '#..CF#', '######'],
      noi: [{ nut: { x: 2, y: 1 }, cua: [{ x: 3, y: 2 }] }],
      bd: [{ x: 2, y: 2, huong: 1 }, { x: 1, y: 2, huong: 1 }],
      co: [[{ x: 3, y: 1 }], [{ x: 4, y: 2 }]],
      vatThem: [{ x: 2, y: 2, chat: 'sat' }],
      maMau: baiDoi(['go("U")', 'wait_n(2)', 'go("R")'], ['wait_n(3)', 'forward(3)']),
      loiGiai: baiDoi(['clear_iron("U")', 'wait_n(2)', 'go("R")'], ['wait_n(3)', 'forward(3)']),
      loiSai: [
        { moTa: 'R1 chỉ gọi go("U") mà quên hút sắt nên mẩu sắt ở (2, 2) vẫn chặn R2', baiLam: baiDoi(['go("U")', 'wait_n(2)', 'go("R")'], ['wait_n(3)', 'forward(3)']), phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      sao: { o: 17, nhip: 7 },
      goiY: ['Thay go("U") của R1 bằng clear_iron("U").']
    }),
    manTC('lap-bai-tai-che', 4, 'luyen', {
      ten: 'Chế tạo hàm hop_over nhảy vượt rào và bước tới',
      r2: R_OMNI,
      taoHam: ['hop_over'],
      hamCuaEmCan: ['jump', 'go', 'wait_n', 'slide_r'],
      deBai: 'Hãy định nghĩa hàm hop_over(d) cho R1 gồm 2 lệnh: jump(d) để nhảy qua hố hoặc hàng rào theo hướng d, rồi go(d) để bước thêm 1 ô nữa! Ở chương trình chính, R2 trượt sang đè nút M(3, 2) mở cửa C(3, 1) để R1 gọi hop_over("R") nhảy qua hố u(2, 1) đáp lên C(3, 1) rồi bước tiếp vào cờ F(4, 1).',
      veMaMau: 'Hoàn thiện hàm hop_over(d) gồm jump(d) và go(d).',
      san: ['######', '#.uCF#', '##.MF#', '######'],
      noi: [{ nut: { x: 3, y: 2 }, cua: [{ x: 3, y: 1 }] }],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 2, huong: 0 }],
      co: [[{ x: 4, y: 1 }], [{ x: 4, y: 2 }]],
      maMau: baiDoi(['hop_over("R")'], ['slide_r(1)', 'wait_n(2)', 'slide_r(1)']),
      loiGiai: baiDoi(['hop_over("R")'], ['slide_r(1)', 'wait_n(2)', 'slide_r(1)'], [H_HOP_OVER]),
      loiSai: [
        { moTa: 'Hàm hop_over(d) thiếu go(d) nên R1 dừng ở (3, 1), chưa vào cờ F(4, 1)', baiLam: baiDoi(['hop_over("R")'], ['slide_r(1)', 'wait_n(2)', 'slide_r(1)']), hamCuaEmMoi: [{ ten: 'hop_over', thamSo: ['d'], than: ['jump(d)'] }], phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 21, nhip: 8 },
      goiY: ['Trong hàm hop_over(d), thêm go(d) ngay dưới jump(d).']
    }),
    manTC('lap-bai-tai-che', 5, 'cung-co', {
      ten: 'Sửa lỗi hàm hop_over phối hợp xe xích phun van',
      r2: R_XICH,
      hamCuaEmCan: ['jump', 'go', 'squirt'],
      deBai: 'Trong màn này hàm hop_over(d) bị viết ngược thứ tự (gọi go(d) trước jump(d) khiến R1 bước thẳng xuống hố u(2, 1) trước khi nhảy!). Hãy sửa lại hàm hop_over(d) cho đúng thứ tự jump(d) rồi go(d), đồng thời cho R2 gọi squirt("low") phun van N(3, 2) mở cửa C(3, 1) rồi lùi về F(1, 2)!',
      veMaMau: 'Sửa lại thứ tự lệnh trong hop_over(d) và thêm squirt("low") cho R2.',
      san: ['######', '#.uCF#', '#F.N.#', '######'],
      noi: [{ nut: { x: 3, y: 2 }, cua: [{ x: 3, y: 1 }] }],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 2, huong: 1 }],
      co: [[{ x: 4, y: 1 }], [{ x: 1, y: 2 }]],
      maMau: baiDoi(['hop_over("R")'], ['back()'], [], [
        { ten: 'hop_over', thamSo: ['d'], than: ['go(d)', 'jump(d)'] }
      ]),
      loiGiai: baiDoi(['hop_over("R")'], ['squirt("low")', 'back()'], [], [H_HOP_OVER]),
      loiSai: [
        { moTa: 'Chưa sửa thứ tự lệnh trong hop_over(d) nên R1 bước thẳng xuống hố u(2, 1)', baiLam: baiDoi(['hop_over("R")'], ['squirt("low")', 'back()'], [], [{ ten: 'hop_over', thamSo: ['d'], than: ['go(d)', 'jump(d)'] }]), phaiCoMa: ['roi-ho'] }
      ],
      sao: { o: 20, nhip: 5 },
      goiY: ['Đổi thứ tự trong hop_over(d) thành jump(d) rồi go(d); ở R2 thêm squirt("low") trước back().']
    }),
    manTC('lap-bai-tai-che', 6, 'cung-co', {
      ten: 'Chế tạo hàm pull_deliver giao sắt vào đích',
      r2: R_OMNI, mucTieu: 'dua-vat', vatCan: 'sat',
      taoHam: ['pull_deliver'],
      hamCuaEmCan: ['go', 'walk', 'pull_s', 'wait_n', 'slide_r'],
      deBai: 'Hãy chế tạo hàm pull_deliver(d) cho R1 gồm 4 lệnh: pull_s(), go(d), magnet_off(), wait() để hút mẩu sắt dưới bụng, bước 1 ô theo hướng d tới ô đích D rồi tắt nam châm thả sắt xuống! Ở chương trình chính, R2 (omni) gọi slide_r(1) đè nút M(2, 2) mở cửa C(2, 1), còn R1 chờ 2 nhịp, gọi walk("RR") qua cửa C(2, 1) tới ô (3, 1) có mẩu sắt rồi gọi pull_deliver("R") giao sắt vào D(4, 1)!',
      veMaMau: 'Hoàn thiện hàm pull_deliver(d) cho R1.',
      san: ['######', '#.C.D#', '#.M..#', '######'],
      noi: [{ nut: { x: 2, y: 2 }, cua: [{ x: 2, y: 1 }] }],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 2, huong: 0 }],
      vatThem: [{ x: 3, y: 1, chat: 'sat' }],
      maMau: baiDoi(['wait_n(2)', 'walk("RR")', 'pull_deliver("R")'], ['slide_r(1)']),
      loiGiai: baiDoi(['wait_n(2)', 'walk("RR")', 'pull_deliver("R")'], ['slide_r(1)'], [H_PULL_DELIVER]),
      loiSai: [
        { moTa: 'Hàm pull_deliver(d) thiếu magnet_off() và wait() nên sắt vẫn dính dưới bụng R1', baiLam: baiDoi(['wait_n(2)', 'walk("RR")', 'pull_deliver("R")'], ['slide_r(1)']), hamCuaEmMoi: [{ ten: 'pull_deliver', thamSo: ['d'], than: ['pull_s()', 'go(d)'] }], phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 19, nhip: 9 },
      goiY: ['Trong hàm pull_deliver(d), thêm magnet_off() và wait() sau go(d).']
    }),
    manTC('lap-bai-tai-che', 7, 'van-dung', {
      ten: 'Kết hợp lob_clear và pull_deliver qua hố sâu',
      r2: R_OMNI, mucTieu: 'dua-vat', vatCan: 'sat',
      hamCuaEmCan: ['go', 'pull_s', 'lob_clear', 'pull_deliver'],
      deBai: 'Mẩu sắt nằm ở (1, 1) dưới bụng R1, còn ô đích D ở (3, 1) bên kia hố sâu u(2, 1). Hãy cho R2 (robot omni) ở (2, 3) gọi lob_clear(2) để hất đá o(2, 2) lấp hố u(2, 1) rồi trượt sang phải; R1 chờ 2 nhịp cho hố lấp xong, gọi clear_iron("R") mang sắt lên (2, 1) rồi gọi pull_deliver("R") giao sắt vào D(3, 1)!',
      veMaMau: 'Phối hợp lob_clear(2) của R2 cùng clear_iron("R") và pull_deliver("R") của R1.',
      san: ['#####', '#.uD#', '##o##', '##..#', '#####'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 3, huong: 0 }],
      vatThem: [{ x: 1, y: 1, chat: 'sat' }],
      maMau: baiDoi(['wait_n(2)', 'clear_iron("R")'], ['lob_clear(2)']),
      loiGiai: baiDoi(['wait_n(2)', 'clear_iron("R")', 'pull_deliver("R")'], ['lob_clear(2)']),
      loiSai: [
        { moTa: 'R1 mới mang sắt tới (2, 1), chưa gọi pull_deliver("R") giao vào D(3, 1)', baiLam: baiDoi(['wait_n(2)', 'clear_iron("R")'], ['lob_clear(2)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 29, nhip: 9 },
      goiY: ['Ở chương trình R1, thêm pull_deliver("R") sau clear_iron("R").']
    }),
    manTC('lap-bai-tai-che', 8, 'van-dung', {
      ten: 'Xe kho chuyền kiện gỗ và nhện giao sắt',
      r2: R_BANH, mucTieu: 'dua-vat',
      hamCuaEmCan: ['go', 'pull_s', 'pick', 'drop_right', 'pull_deliver'],
      deBai: 'Màn này yêu cầu đưa cả mẩu sắt ở (1, 1) và kiện gỗ o ở (3, 2) về 2 ô đích D! R1 đứng ở (1, 1) gọi pull_deliver("R") để giao mẩu sắt vào D(2, 1). Cùng lúc đó, R2 (xe hai bánh gắn tay xoay) ở (3, 3) hướng lên hãy gọi pick(), wait() rồi gọi drop_right() thả kiện gỗ o(3, 2) vào D(4, 3)!',
      veMaMau: 'R2 chưa gọi wait() và drop_right() để thả kiện gỗ vào D(4, 3).',
      san: ['######', '#.D###', '###o##', '###.D#', '######'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 3, y: 3, huong: 0 }],
      vatThem: [{ x: 1, y: 1, chat: 'sat' }],
      maMau: baiDoi(['pull_deliver("R")'], ['pick()']),
      loiGiai: baiDoi(['pull_deliver("R")'], ['pick()', 'wait()', 'drop_right()']),
      loiSai: [
        { moTa: 'R2 chỉ gắp kiện gỗ o(3, 2) mà chưa gọi wait(), drop_right() thả vào D(4, 3)', baiLam: baiDoi(['pull_deliver("R")'], ['pick()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 22, nhip: 5 },
      goiY: ['Thêm wait() và drop_right() sau pick() ở chương trình R2.']
    }),
    manTC('lap-bai-tai-che', 9, 'bien-the', {
      ten: 'Tổng duyệt Bãi tái chế - Hang động',
      r2: R_GAI,
      hamCuaEmCan: ['jump', 'go', 'play_note', 'echo_glide', 'hop_over', 'clear_iron'],
      deBai: 'Tổng duyệt trước màn hợp tấu! R1 đứng trên mẩu sắt ở (2, 2) chắn đầu dải băng I(2, 2) của R2 (bánh gai ở (2, 3) hướng lên). Hãy cho R1 ở (2, 2) gọi clear_iron("R") sang (3, 2) rồi gọi hop_over("R") nhảy qua hố u(4, 2) và bước vào cờ F(6, 2); còn R2 chờ 3 nhịp cho R1 dọn sắt khỏi (2, 2) rồi gọi echo_glide() phá đá chuông ở (2, 1) và trượt qua I(2, 2) lên F(2, 1)!',
      veMaMau: 'Phối hợp clear_iron("R"), hop_over("R") của R1 và echo_glide() của R2.',
      san: ['########', '##F#####', '##I.u.F#', '##.#####', '########'],
      bd: [{ x: 2, y: 2, huong: 1 }, { x: 2, y: 3, huong: 0 }],
      co: [[{ x: 6, y: 2 }], [{ x: 2, y: 1 }]],
      vatThem: [{ x: 2, y: 2, chat: 'sat' }],
      daChuong: [{ x: 2, y: 1, not: 5, ben: 1 }],
      maMau: baiDoi(['clear_iron("R")'], ['wait_n(3)']),
      loiGiai: baiDoi(['clear_iron("R")', 'hop_over("R")'], ['wait_n(3)', 'echo_glide()']),
      loiSai: [
        { moTa: 'R1 chưa gọi hop_over("R") và R2 chưa gọi echo_glide()', baiLam: baiDoi(['clear_iron("R")'], ['wait_n(3)']), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 28, nhip: 8 },
      goiY: ['R1 gọi clear_iron("R") rồi hop_over("R"); R2 gọi wait_n(3) rồi echo_glide().']
    }),
    manTC('lap-bai-tai-che', 10, 'trum', {
      ten: 'Hợp tấu hàm play_part: Đoạn 3 Kìa con bướm vàng',
      r1: R1_LOA, r2: R_GAI, mucTieu: 'choi-dieu',
      dieu: { r1: '5 5 4 4 3 3 2 2', r2: '3 1 2 4 1 3 5 5' },
      hamCuaEmCan: ['play_note', 'play_part'],
      deBai: 'Màn kết Gói 3: Hãy dùng hàm play_part(notes) cho cả R1 và R2 để biểu diễn Đoạn 3 bài "Kìa con bướm vàng" ("Xoè đôi cánh, xoè đôi cánh") với 2 bè 8 nhịp: R1 gọi play_part([5, 5, 4, 4, 3, 3, 2, 2]), còn R2 gọi play_part([3, 1, 2, 4, 1, 3, 5, 5])!',
      veMaMau: 'Gọi play_part([3, 1, 2, 4, 1, 3, 5, 5]) cho R2 để hoàn thành bản hợp tấu.',
      san: ['#####', '#...#', '#####'],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 3, y: 1, huong: 3 }],
      maMau: baiDoi(['play_part([5, 5, 4, 4, 3, 3, 2, 2])'], ['play_part([3, 1, 2, 4])']),
      loiGiai: baiDoi(['play_part([5, 5, 4, 4, 3, 3, 2, 2])'], ['play_part([3, 1, 2, 4, 1, 3, 5, 5])']),
      loiSai: [
        { moTa: 'Danh sách nốt của R2 mới có 4 nốt, thiếu 4 nốt cuối [1, 3, 5, 5]', baiLam: baiDoi(['play_part([5, 5, 4, 4, 3, 3, 2, 2])'], ['play_part([3, 1, 2, 4])']), phaiCoMa: ['lo-nhip'] }
      ],
      sao: { o: 24, nhip: 8 },
      goiY: ['Điền đủ 8 nốt [3, 1, 2, 4, 1, 3, 5, 5] vào lệnh play_part(...) của R2.']
    }),
  ];
})();
