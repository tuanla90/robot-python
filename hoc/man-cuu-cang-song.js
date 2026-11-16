/* ============================================================================
   man-cuu-cang-song.js - Mùa 9 CLB Sáng Tạo: Gói 4 "Cảng sông sau bão" (dựng lại 16/11, M9M4, theo khuôn G2 / G3)
   20 màn: cuu-cang-song (chọn đội trong menu cỗ máy) + lap-cang-song (R1 cần cẩu đặt sẵn, R2 tự lắp; lai L2 L3 L5 L9 L10 L13).
   Ôn Python: số âm (rail(-3)), abs, %, //. Gói tạo hàm grab_clear() [pick(), back()] (cuu-cang-song.6) và sonic_rail() [play_note(listen()), back()] (lap-cang-song.7).
   Màn 10 mỗi chương: song ca đoạn 4 "Kìa con bướm vàng" (bè 1: 5 5 4 4 3 3 2 2 | bè 2: 1 3 2 4 3 5 4 2), gọi play_part.
   Câu đố: hoc/MUA-9-200-CAU-DO.md mục G4 (ghi chú "Đã dựng 16/11 (M9M4)": các chỗ lệch so với bảng).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  function VS(x, y) { return { x: x, y: y, chat: 'sat' }; }

  var H_SONIC_RAIL = {
    ten: 'sonic_rail', thamSo: [],
    than: ['play_note(listen())', 'back()']
  };
  var H_GRAB_CLEAR = {
    ten: 'grab_clear', thamSo: [],
    than: ['pick()', 'back()']
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  /* ---- M9M4: khung màn mùa 9 (chép từ man-cuu-bai-tai-che.js) ------------------------------------------ */
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
  /** R2 đã lắp sẵn (màn show chương 2): xuồng + lưới + đầu đọc mã (lai L2), như LapRap.apDung lắp ra. */
  var XUONG_L2 = {
    loaiRobot: 'xuong', chinhLuoi: true, robot: { than: 'xuong', tay: 'day-keo', camBien: [{ ma: 'quet-ma', o: 'tren' }], son: 'lam' },
    hamGoc: ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'anchor', 'unanchor', 'cast_net', 'drop_net', 'set_length', 'read_code', 'weight']
  };
  /** Chương trình cẩu của lap-cang-song.3: hai lần chờ số dưới móc, nhấc, quay phải hạ lên boong; giữa hai lần quay về, thu cần, chạy ray. */
  var CAU_13 = ['for k in range(2):', '    while read_code() == -1:', '        wait()', '    wait()', '    pick_up()', '    swing_right()', '    set_down()', '    if k == 0:',
    '        swing_left()', '        retract()', '        retract()', '        rail(2)'];
  /** lap-cang-song.3 (ba sân): sân hai luồng nước, bè nổi ở cột x1 (luồng trên) và x2 (luồng dưới). Xuồng: tiến tới khi thấy số, kéo lùi c // 10 ô, nhả, xuống luồng dưới. */
  function san13(x1, x2) {
    function luong(x) { return '#' + '~~~~~~'.split('').map(function (c, i) { return i + 1 === x ? 'B' : c; }).join('') + '#'; }
    return ['########', luong(x1), '####~###', luong(x2), '#RRRRRT#', '########'];
  }
  var XU_13 = ['for i in range(2):', '    set_length(1)', '    while read_code() == -1:', '        move()', '    c = read_code()', '    cast_net()', '    wait()', '    for j in range(c // 10):', '        back()',
    '    drop_net()', '    wait()', '    if i == 0:', '        turn_left()', '        forward(2)', '        turn_right()'];
  /** Chương trình cẩu của lap-cang-song.4: chờ số dưới móc, chờ xe nhả lưới, nhấc, quay phải hạ lên boong. */
  var CAU_14 = ['while read_code() == -1:', '    wait()', 'wait()', 'pick_up()', 'swing_right()', 'set_down()'];
  /** Chương trình xuồng khách khoá của lap-cang-song.5: lưới dài 1, chờ 2 nhịp tung lần một; sang phải một ô (ba nhịp), tung lần hai. */
  var XU_15 = ['set_length(1)', 'wait_n(2)', 'cast_net()', 'wait()', 'turn_left()', 'move()', 'turn_right()', 'set_length(1)', 'cast_net()', 'wait()'];
  /** Xuồng lắp loa thay tay lưới: bỏ cờ chỉnh dây lưới (set_length chỉ là nâng cấp của tay lưới). */
  /** lap-cang-song.8: cẩu khách R1 cuối ray nhấc container 45, quay hai nấc, vươn hạ lên tàu xanh. Thân vòng lặp của R2: nhấc, nhìn màu ô bãi, hạ đúng tàu, quay về, chạy ray. */
  var CAU_R1_18 = ['pick_up()', 'swing_right()', 'swing_right()', 'extend()', 'set_down()'];
  var CAU_18_THAN = ['pick_up()', 'mau = look()', 'swing_right()', 'swing_right()', 'if mau == "blue":', '    extend()', '    set_down()', '    retract()', 'else:', '    set_down()',
    'swing_right()', 'swing_right()', 'rail(1)'];
  /** lap-cang-song.9: cẩu chờ số dưới móc, nhấc 22, quay lên hạ; thu cần, quay hai nấc xuống nhấc 35 ở chồng bãi, quay về, vươn, hạ. */
  /** lap-cang-song.9 (hai sân): sông trên, ray dọc cột 6 (hàng 2–7), tàu (6, 1); chồng cạnh ray ở cột 7, mỗi sân một hàng. */
  var SAN_19 = ['##########', '#~~~B~T..#', '#~~~~~R..#', '#~~~~~R..#', '#.....R..#', '#.....R..#', '#.....R..#', '#.....R..#', '##########'];
  /** Cẩu lap-cang-song.9: chờ container nổi dưới móc, giao; quay phải, thu cần, dò ray xuống tới khi thấy số (đếm n), nhấc, rail(-n) về, quay lên, vươn, giao. */
  var CAU_19 = ['while read_code() == -1:', '    wait()', 'wait()', 'pick_up()', 'swing_right()', 'set_down()', 'swing_right()', 'retract()', 'n = 0', 'while read_code() == -1:', '    rail(1)', '    n = n + 1',
    'pick_up()', 'rail(-n)', 'swing_left()', 'extend()', 'set_down()'];
  /** Xe chở hàng lap-cang-song.9: dọn thùng gỗ chắn ray bằng hàm của gói. */
  var CH_19 = ['grab_clear()'];
  /** lap-cang-song.2 (hai sân): luồng xiết hàng 1 chảy sang phải, sức suc ô mỗi nhịp (mỗi sân một sức). */
  var SAN_12 = ['#########', '~B~~~~~~.', '~~~~~~~~#', '~~~~~~~~#', '~~~~~~~.#', '##RRRRRRT', '#########'];
  var CAU_12 = ['while read_code() == -1:', '    wait()', 'wait()', 'pick_up()', 'swing_right()', 'set_down()'];
  /** Cẩu cách xe bờ: chạy ray tới cột 7, thu cần một nấc (đầu cần ô (7, 3) trước mũi xe), chờ số, nhấc, thu thêm một nấc rồi quay phải hạ lên tàu (8, 5). */
  var CAU_12_XE = ['rail(2)', 'retract()', 'while read_code() == -1:', '    wait()', 'wait()', 'pick_up()', 'retract()', 'swing_right()', 'set_down()'];
  function dong12(suc) { return [0, 1, 2, 3, 4, 5, 6, 7].map(function (x) { return { x: x, y: 1, huong: 1, suc: suc }; }); }
  /** lap-cang-song.8 (ba sân): cùng sân, cùng chồng; khác màu sơn ô bãi (chuỗi 3 chữ r / b cho cột 1–3), giờ tàu rời và danh sách giao. */
  var SAN_18 = ['########', '#......#', '#RRRRRR#', '~TTTT~~~', '~TTTTTT~', '########'];
  function chong18(ds) { return ds.map(function (so, i) { return { x: i + 1, y: 1, cont: [{ so: so }] }; }).concat([{ x: 6, y: 1, cont: [{ so: 45 }] }]); }
  function son18(m) { return ['........', '.' + m + '....', '........', '........', '........', '........']; }
  function tau18(coDo, coXanh) {
    return [{ o: [1, 2, 3, 4].map(function (x) { return { x: x, y: 3 }; }), co: coDo, vang: 40 }, { o: [1, 2, 3, 4, 5, 6].map(function (x) { return { x: x, y: 4 }; }), co: coXanh, vang: 40 }];
  }
  /** Số chẵn lên tàu đỏ, số lẻ lên tàu xanh (khớp màu sơn ô bãi; R1 giao 45 lên tàu xanh). */
  function giao18(ds) { return [{ tau: 0, so: ds.filter(function (n) { return n % 2 === 0; }) }, { tau: 1, so: ds.filter(function (n) { return n % 2 === 1; }).concat([45]) }]; }
  /** cuu-cang-song.3 (hai sân): cùng sân, cùng tàu; container 27 đổi chỗ với 14. */
  var SAN_3 = ['~TTTTTT~~', '~BB~~~~~B', '~~~~~~~~~', '.RRRRRRR.', '#########'];
  var TAU_3 = [{ o: [1, 2, 3, 4, 5, 6].map(function (x) { return { x: x, y: 0 }; }), co: 14, vang: 40 }];
  function xuongLoa(r) { r.chinhLuoi = false; return r; }
  function man9(chuong, so, hang, cfg) {
    var r1 = cfg.doi[0];
    var m = {
      chuong: chuong, so: so, ten: cfg.ten, hang: hang, vo: 'cang',
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

  ManHoc.manCuuCangSong = [
    /* ========================================================================
       CHƯƠNG 1: cuu-cang-song (10 màn)
       ======================================================================== */
    // 1 · show (tiếp sức): bão đánh rơi container 12 xuống sông, nằm ngoài tầm cần. Xuồng tung lưới bắt container, cuộn dây kéo về một ô, nhả lưới;
    //     cẩu chạy ray sang phải rail(2), nhấc container, chạy ray về rail(-2) (số âm: sang trái), vươn cần hạ lên boong tàu (chạy sẵn, khoá). Đội cố định CC + XU.
    man9('cuu-cang-song', 1, 'lam-quen', {
      ten: 'Container rơi xuống sông',
      chiChay: true, mucTieu: 'giao-tau',
      deBai: 'Bão đánh rơi container xuống sông, ngoài tầm cần. Xuồng kéo nó về, cẩu nhấc lên tàu. Bấm Chạy.',
      veMaMau: 'Bấm Chạy xem mỗi bạn làm gì.',
      san: ['~~~T~~~~', '~~~~~~B~', '~~~~~~~~', '..RRRR..', '########'],
      doi: [may('CC', { x: 3, y: 3, nac: 0, tam: 2 }), may('XU', { x: 4, y: 1, huong: 1 }, { son: 'lam' })],
      them: { contTroi: [{ x: 6, y: 1, so: 12 }], tau: [{ o: [{ x: 3, y: 0 }], co: 8, vang: 4 }], giao: [{ tau: 0, so: [12] }] },
      maMau: doiBai([['rail(2)', 'wait()', 'pick_up()', 'rail(-2)', 'extend()', 'set_down()'], ['cast_net()', 'wait()', 'reel_in()', 'wait()', 'drop_net()', 'wait()']]),
      loiGiai: doiBai([['rail(2)', 'wait()', 'pick_up()', 'rail(-2)', 'extend()', 'set_down()'], ['cast_net()', 'wait()', 'reel_in()', 'wait()', 'drop_net()', 'wait()']]),
      sao: { o: 14, nhip: 10 },
      goiY: ['rail(-2): số âm, bệ cẩu chạy sang trái 2 ô.'],
      cauDo: { doi: ['CC', 'XU'], lap: null, coChe: ['nuoc', 'cont-troi', 'luoi', 'tau'], cuu: 'hang', meo: 'tiep-suc' }
    }),

    // 2 · cứu kịp: tàu chỉ đậu tới hết nhịp 9 rồi đi luôn. Container 25 trôi xa, ngoài tầm cần. Xuồng tung lưới bắt container, lùi 3 ô kéo nó về cột 3,
    //     nhả lưới. Cẩu phải chạy ray rail(-4) (số âm: sang trái) NGAY từ đầu, trong lúc xuồng kéo; nhấc, rail(-1), vươn cần, hạ lên boong cột 2.
    //     Cẩu chờ xuồng xong mới chạy ray thì tàu đã đi. Bảng 2 cỗ máy (đúng đôi tốt); khe trên ray, batDauNuoc cho xuồng.
    man9('cuu-cang-song', 2, 'lam-quen', {
      ten: 'Tàu không chờ lâu',
      mucTieu: 'giao-tau',
      deBai: 'Tàu chỉ đậu tới hết nhịp 9. Xuồng kéo container về, cẩu chạy ray sang trái cùng lúc rồi nhấc lên tàu.',
      veMaMau: 'Cẩu chờ xuồng xong mới chạy ray: tàu đi mất.',
      san: ['~~T~~~~~~', 'B~~~~~~~~', '~~~~~~~~~', '..RRRRRR.', '#########'],
      doi: [khe({ x: 7, y: 3, huong: 0, nac: 0, tam: 2 }, { batDauNuoc: { x: 7, y: 2, huong: 3 } }), khe({ x: 6, y: 3, huong: 0 }, { batDauNuoc: { x: 2, y: 1, huong: 3 } })],
      them: { contTroi: [{ x: 0, y: 1, so: 25 }], tau: [{ o: [{ x: 2, y: 0 }], co: 9, vang: 40 }], giao: [{ tau: 0, so: [25] }] },
      chonDoi: {
        menu: ['CC', 'XU'],
        cachMau: [{ chon: ['CC', 'XU'], ghiChu: 'đôi tốt', loiGiai: doiBai([
          ['rail(-4)', 'wait()', 'pick_up()', 'rail(-1)', 'extend()', 'set_down()'],
          ['cast_net()', 'wait()', 'for i in range(3):', '    back()', 'drop_net()', 'wait()']]) }]
      },
      maMau: doiBai([['wait_n(5)', 'rail(-4)', 'pick_up()', 'rail(-1)', 'extend()', 'set_down()'], ['cast_net()', 'wait()', 'for i in range(3):', '    back()', 'drop_net()', 'wait()']]),
      loiSai: [
        { moTa: 'Cẩu chờ xuồng xong mới chạy ray: tàu đã đi', baiLam: doiBai([['wait_n(5)', 'rail(-4)', 'pick_up()', 'rail(-1)', 'extend()', 'set_down()'], ['cast_net()', 'wait()', 'for i in range(3):', '    back()', 'drop_net()', 'wait()']]), phaiCoMa: ['chua-giao-tau'] },
        { moTa: 'Không nhả lưới: cẩu không nhấc được', baiLam: doiBai([['rail(-4)', 'wait()', 'pick_up()', 'rail(-1)', 'extend()', 'set_down()'], ['cast_net()', 'wait()', 'for i in range(3):', '    back()']]), phaiCoMa: ['chua-giao-tau'] }
      ],
      sao: { o: 18, nhip: 11 },
      goiY: ['rail(-4): số âm, bệ chạy sang trái 4 ô.', 'Hai bạn làm cùng lúc.'],
      cauDo: { doi: ['CC', 'XU'], lap: null, coChe: ['nuoc', 'cont-troi', 'luoi', 'tau', 'ray'], cuu: 'hang', meo: 'cuu-kip' }
    }),

    // 3 · đọc rồi chọn: ba container trôi, tàu chỉ nhận 14 và 32 (27 là của tàu khác). Container 32 trôi xa, ngoài tầm cần: xuồng bắt, lùi, cuộn dây kéo về cột 6, nhả lưới.
    //     Cẩu chạy ray từng ô, read_code() đọc ô đầu cần (ô trống trả -1, số âm): số dương và khác 27 thì nhấc, vươn cần hạ lên boong.
    //     (Bảng ghi "xuồng thả cái sai": xuồng không có đầu đọc mã, không biết cái nào sai; cái sai nằm yên, cẩu đọc rồi bỏ qua.) Bẫy: robot phân loại (không xuống nước).
    //     Hai sân (dữ liệu theo sân, luật 13/11): sân 1 container 27 ở cột 2, sân 2 ở cột 1. Bỏ qua cột điền thẳng của sân 1 thì sân 2 nhấc nhầm 27.
    man9('cuu-cang-song', 3, 'luyen', {
      ten: 'Số nào lên tàu',
      mucTieu: 'giao-tau',
      deBai: 'Tàu chỉ nhận container 14 và 32. Container 27 của tàu khác, để yên. Hai sân, 27 nằm chỗ khác nhau. read_code() trả -1 khi ô trống.',
      veMaMau: 'Cẩu nhấc cả container 27.',
      san: [SAN_3, SAN_3],
      doi: [khe({ x: 1, y: 3, huong: 0, nac: 0, tam: 2 }, { batDauNuoc: { x: 4, y: 2, huong: 1 } }), khe({ x: 7, y: 3, huong: 0 }, { batDauNuoc: { x: 6, y: 1, huong: 1 } })],
      them: { contTroi: [[{ x: 1, y: 1, so: 14 }, { x: 2, y: 1, so: 27 }, { x: 8, y: 1, so: 32 }], [{ x: 1, y: 1, so: 27 }, { x: 2, y: 1, so: 14 }, { x: 8, y: 1, so: 32 }]],
        tau: [TAU_3, TAU_3], giao: [[{ tau: 0, so: [14, 32] }], [{ tau: 0, so: [14, 32] }]] },
      chonDoi: {
        menu: ['CC', 'XU', 'PL'],
        cachMau: [{ chon: ['CC', 'XU'], ghiChu: 'đôi tốt', loiGiai: doiBai([
          ['for i in range(6):', '    c = read_code()', '    if c > 0 and c != 27:', '        pick_up()', '        extend()', '        set_down()', '        retract()', '    rail(1)'],
          ['cast_net()', 'wait()', 'back()', 'reel_in()', 'wait()', 'drop_net()', 'wait()']]) }]
      },
      maMau: doiBai([['for i in range(6):', '    rail(1)'], ['cast_net()', 'wait()', 'back()', 'reel_in()', 'wait()', 'drop_net()', 'wait()']]),
      loiSai: [
        { moTa: 'Không đọc số: nhấc cả container 27 lên tàu', baiLam: doiBai([['for i in range(6):', '    c = read_code()', '    if c > 0:', '        pick_up()', '        extend()', '        set_down()', '        retract()', '    rail(1)'], ['cast_net()', 'wait()', 'back()', 'reel_in()', 'wait()', 'drop_net()', 'wait()']]), phaiCoMa: ['giao-nham'] },
        { moTa: 'Điền thẳng chỗ của sân 1 (bỏ qua ô thứ hai): sân 2 nhấc nhầm 27', baiLam: doiBai([['for i in range(6):', '    c = read_code()', '    if c > 0 and i != 1:', '        pick_up()', '        extend()', '        set_down()', '        retract()', '    rail(1)'], ['cast_net()', 'wait()', 'back()', 'reel_in()', 'wait()', 'drop_net()', 'wait()']]), phaiCoMa: ['giao-nham'] },
        { moTa: 'Xuồng không kéo container 32 về: thiếu hàng', baiLam: doiBai([['for i in range(6):', '    c = read_code()', '    if c > 0 and c != 27:', '        pick_up()', '        extend()', '        set_down()', '        retract()', '    rail(1)'], []]), phaiCoMa: ['chua-giao-tau'] }
      ],
      sao: { o: 22, nhip: 17 },
      goiY: ['read_code() == -1: ô đầu cần trống.', 'if c > 0 and c != 27: có container và không phải 27.'],
      cauDo: { doi: ['CC', 'XU'], lap: null, coChe: ['nuoc', 'cont-troi', 'luoi', 'tau', 'doc-ma'], cuu: 'hang', meo: 'doc-roi-chon' }
    }),

    // 4 · chờ tín hiệu: dòng xiết, container 40 trôi nhanh qua tầm cần. Hàng 2 chảy mạnh (2 ô / nhịp): xuồng phải anchor() mới đứng được.
    //     Xuồng neo, tung lưới dài 1 ô giữ container lại, đợi cẩu chạy ray tới cột 6 rồi nhả. Cẩu không đoán giờ: chờ tới khi read_code()
    //     khác -1 (số âm: ô trống) mới nhấc, vươn cần, hạ lên boong. Tàu đầu hàng rời bến ngay khi nhận container (hangTau).
    //     Bảng 2 cỗ máy; khe trên ray, batDauNuoc cho xuồng.
    man9('cuu-cang-song', 4, 'lam-quen', {
      ten: 'Dòng xiết',
      mucTieu: 'giao-tau',
      deBai: 'Dòng xiết cuốn container 40 qua bến. Xuồng neo lại, giữ container chờ cẩu. Cẩu chờ tới khi đọc được số mới nhấc lên tàu.',
      veMaMau: 'Xuồng không neo: dòng cuốn xuồng đi mất.',
      san: ['~~~~~~T~~', '~B~~~~~~~', '~~~~~~~~~', 'RRRRRRR..', '#########'],
      doi: [khe({ x: 0, y: 3, huong: 0, nac: 0, tam: 2 }, { batDauNuoc: { x: 3, y: 2, huong: 0 } }), khe({ x: 1, y: 3, huong: 0 }, { batDauNuoc: { x: 4, y: 2, huong: 0 } })],
      them: { contTroi: [{ x: 1, y: 1, so: 40 }], hangTau: { o: [{ x: 6, y: 0 }], can: [40] }, thac: [{ x: 8, y: 1 }],
        dong: [0, 1, 2, 3, 4, 5, 6, 7, 8].map(function (x) { return { x: x, y: 1, huong: 1, suc: 1 }; })
          .concat([0, 1, 2, 3, 4, 5, 6, 7, 8].map(function (x) { return { x: x, y: 2, huong: 1, suc: 2 }; })) },
      chonDoi: {
        menu: ['CC', 'XU'],
        cachMau: [{ chon: ['CC', 'XU'], ghiChu: 'đôi tốt', loiGiai: doiBai([
          ['rail(6)', 'while read_code() == -1:', '    wait()', 'pick_up()', 'extend()', 'set_down()'],
          ['set_length(1)', 'anchor()', 'wait_n(2)', 'cast_net()', 'wait_n(3)', 'drop_net()', 'wait()']]) }]
      },
      maMau: doiBai([['rail(6)', 'while read_code() == -1:', '    wait()', 'pick_up()', 'extend()', 'set_down()'], ['set_length(1)', 'wait_n(2)', 'cast_net()', 'wait_n(3)', 'drop_net()', 'wait()']]),
      loiSai: [
        { moTa: 'Xuồng không neo: bị dòng cuốn, container trôi mất', baiLam: doiBai([['rail(6)', 'while read_code() == -1:', '    wait()', 'pick_up()', 'extend()', 'set_down()'], ['set_length(1)', 'wait_n(2)', 'cast_net()', 'wait_n(3)', 'drop_net()', 'wait()']]), phaiCoMa: ['qua-nhieu-nhip'] },
        { moTa: 'Cẩu không chờ tín hiệu: nhấc vào ô trống', baiLam: doiBai([['rail(6)', 'pick_up()', 'extend()', 'set_down()'], ['set_length(1)', 'anchor()', 'wait_n(2)', 'cast_net()', 'wait_n(3)', 'drop_net()', 'wait()']]), phaiCoMa: ['chua-giao-tau'] }
      ],
      sao: { o: 18, nhip: 13 },
      goiY: ['read_code() == -1: dưới móc chưa có container.', 'anchor(): xuồng đứng yên giữa dòng.'],
      cauDo: { doi: ['CC', 'XU'], lap: null, coChe: ['nuoc', 'dong', 'neo', 'cont-troi', 'luoi', 'tau'], cuu: 'hang', meo: 'cho-tin-hieu' }
    }),

    // 5 · cứu người, cứu kịp: thủy thủ rơi xuống luồng nước chảy (hàng 1), trôi mỗi nhịp một ô về mép sân. Người ở cột 1, xuồng ở cột 5: d = 1 - 5 âm; xuồng chờ abs(d) - 1 nhịp (lưới tung ở nhịp kế) cho người trôi tới ngay dưới mũi,
    //     tung lưới dài 1 ô kéo người sát bờ, người tự lên bờ. Container đổ chắn lối về trạm cứu: cẩu nhấc đi. Khe trên ray (cẩu), batDauNuoc cho xuồng.
    //     Bẫy: xe cứu hỏa (không xuống nước, không nhấc container).
    man9('cuu-cang-song', 5, 'cung-co', {
      ten: 'Thủy thủ trôi theo dòng',
      mucTieu: 'cuu-nguoi',
      deBai: 'Thủy thủ trôi theo dòng, mỗi nhịp một ô. Kéo người vào bờ kịp lúc, dọn container chắn lối về trạm cứu.',
      veMaMau: 'Xuồng tung lưới sớm quá.',
      san: ['~~~~~~~~~', '~~~~~~~~~', '###...###', '###.#####', '#..RRR..#', '#########'],
      doi: [khe({ x: 4, y: 4, huong: 0, nac: 0, tam: 2 }, { batDauNuoc: { x: 2, y: 0, huong: 2 } }), khe({ x: 5, y: 4, huong: 0 }, { batDauNuoc: { x: 5, y: 0, huong: 2 } })],
      them: { contChan: true, chong: [{ x: 4, y: 2, cont: [{ so: 9 }] }], nguoi: [{ x: 1, y: 1 }], tramCuu: [{ x: 3, y: 3 }],
        dong: [0, 1, 2, 3, 4, 5, 6, 7, 8].map(function (x) { return { x: x, y: 1, huong: 1, suc: 1 }; }) },
      chonDoi: {
        menu: ['CC', 'XU', 'CU'],
        cachMau: [{ chon: ['CC', 'XU'], ghiChu: 'đôi tốt', loiGiai: doiBai([
          ['pick_up()', 'swing_right()', 'set_down()'],
          ['set_length(1)', 'd = 1 - 5', 'wait_n(abs(d) - 1)', 'cast_net()', 'wait()']]) }]
      },
      maMau: doiBai([['pick_up()', 'swing_right()', 'set_down()'], ['set_length(1)', 'cast_net()', 'wait()']]),
      loiSai: [
        { moTa: 'Tung lưới ngay: người chưa tới, trôi xa', baiLam: doiBai([['pick_up()', 'swing_right()', 'set_down()'], ['set_length(1)', 'cast_net()', 'wait()']]), phaiCoMa: ['nguoi-troi-xa'] },
        { moTa: 'Cẩu không nhấc container: người đứng chờ', baiLam: doiBai([[], ['set_length(1)', 'd = 1 - 5', 'wait_n(abs(d) - 1)', 'cast_net()', 'wait()']]), phaiCoMa: ['chua-cuu-nguoi'] }
      ],
      sao: { o: 13, nhip: 9 },
      goiY: ['d = 1 - 5 = -4: người ở bên trái xuồng 4 ô. abs(d) = 4.', 'set_length(1): lưới dài 1 ô.'],
      cauDo: { doi: ['CC', 'XU'], lap: null, coChe: ['nuoc', 'dong', 'nguoi', 'luoi', 'container'], cuu: 'nguoi', meo: 'cuu-kip' }
    }),

    // 6 · dọn lối + tạo hàm grab_clear(): container đổ giữa lối duy nhất từ kho ra bến. Cẩu nhấc nó, quay cần hai nấc, đặt lên ô trống phía trên ray.
    //     Thùng gỗ nằm ngay trước mũi xe chở hàng: grab_clear() gắp rồi lùi một ô (ra khỏi ray), xe quay phải chạy dọc lối qua chỗ cẩu vừa dọn,
    //     quay xuống đặt thùng vào ô bến D. Mọi khe trên dải ray R (bảng có cần cẩu). Bẫy: drone (không nhấc thùng gỗ, không nhấc container).
    //     Bảng ghi bẫy máy khai thác: nó nạp / ném chở thùng được như xe, nên đổi thành drone. Các gói sau gọi grab_clear (cuu-clb, cuu-hang-dong, ngay-hoi-clb).
    man9('cuu-cang-song', 6, 'cung-co', {
      ten: 'Container chắn lối',
      mucTieu: 'dua-vat',
      taoHam: ['grab_clear'],
      deBai: 'Container đổ chắn lối ra bến. Cẩu dọn lối, xe chở thùng gỗ ra ô bến D. Viết grab_clear(): gắp rồi lùi một ô.',
      veMaMau: 'Hàm grab_clear chưa có. Xe chạy thẳng vào container.',
      san: ['########', '#o##.###', '#RRRR###', '#......#', '######D#', '########'],
      doi: [khe({ x: 4, y: 2, huong: 0, nac: 2, tam: 1 }), khe({ x: 1, y: 2, huong: 0 })],
      them: { contChan: true, chong: [{ x: 4, y: 3, cont: [{ so: 7 }] }] },
      chonDoi: {
        menu: ['CC', 'CH', 'DR'],
        cachMau: [{ chon: ['CC', 'CH'], ghiChu: 'đôi tốt', loiGiai: doiBai([
          ['pick_up()', 'swing_left()', 'swing_left()', 'set_down()'],
          ['grab_clear()', 'turn_right()', 'forward(5)', 'turn_right()', 'drop()']], [], [H_GRAB_CLEAR]) }]
      },
      maMau: doiBai([[], ['turn_right()', 'forward(5)']]),
      loiSai: [
        { moTa: 'Cẩu không dọn: xe đâm container', baiLam: doiBai([[], ['grab_clear()', 'turn_right()', 'forward(5)', 'turn_right()', 'drop()']]), hamCuaEmMoi: [H_GRAB_CLEAR], phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Thân grab_clear thiếu back(): xe chạy dọc ray, đâm vào cẩu', baiLam: doiBai([['pick_up()', 'swing_left()', 'swing_left()', 'set_down()'], ['grab_clear()', 'turn_right()', 'forward(5)', 'turn_right()', 'drop()']]), hamCuaEmMoi: [{ ten: 'grab_clear', thamSo: [], than: ['pick()'] }], phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 37, nhip: 13 },
      goiY: ['grab_clear(): pick() rồi back().', 'Cẩu: swing_left() hai lần là quay từ hướng xuống sang hướng lên.'],
      cauDo: { doi: ['CC', 'CH'], lap: null, coChe: ['container', 'thung-go', 'dich'], cuu: 'hang', meo: 'don-loi' }
    }),

    // 7 · cứu máy: cần cẩu khách (R3, khoá) hỏng khớp quay: chờ 3 nhịp, chạy ray rail(5) tới cột 6, chờ tới khi dưới móc có container (read_code() khác -1)
    //     rồi nhấc, vươn cần, hạ lên tàu. Sắt vụn nằm trên ray chắn bệ R3: nhện bước lên ô sắt, hút (pull_s: nam châm bụng), bước xuống bãi, thả ra. Container 31 nổi ở cột 2:
    //     xuồng tung lưới, lùi 6 - 2 = 4 ô kéo nó về đúng ô dưới móc R3, nhả lưới. Bẫy: xe cứu hỏa (không hút sắt, không xuống nước).
    man9('cuu-cang-song', 7, 'van-dung', {
      ten: 'Cẩu khách kẹt khớp',
      mucTieu: 'giao-tau',
      deBai: 'Cần cẩu khách chờ 3 nhịp rồi chạy ray, chỉ nhấc được ở cột 6. Sắt vụn chắn ray của nó, container nổi ở xa. Giúp cẩu khách đưa container lên tàu.',
      veMaMau: 'Đọc chương trình của cẩu khoá.',
      san: ['~~~~~~T~~', '~~B~~~~~~', '~~~~~~~~~', 'RRRRRRR..', '.........', '.........', '#########'],
      doi: [khe({ x: 3, y: 4, huong: 0 }, { batDauNuoc: { x: 4, y: 1, huong: 3 } }), khe({ x: 4, y: 4, huong: 0 }, { batDauNuoc: { x: 5, y: 2, huong: 3 } }),
        may('CC', { x: 1, y: 3, huong: 0, nac: 0, tam: 2 }, { son: 'tim', coDinh: true })],
      them: { contTroi: [{ x: 2, y: 1, so: 31 }], hangTau: { o: [{ x: 6, y: 0 }], can: [31] }, vatThem: [VS(4, 3)] },
      chonDoi: {
        menu: ['XU', 'PL', 'CU'],
        cachMau: [{ chon: ['XU', 'PL'], ghiChu: 'đôi tốt', loiGiai: doiBai([
          ['cast_net()', 'wait()', 'for i in range(6 - 2):', '    back()', 'drop_net()', 'wait()'],
          ['go_up()', 'pull_s()', 'go_down()', 'magnet_off()', 'wait()'],
          ['wait_n(3)', 'rail(5)', 'while read_code() == -1:', '    wait()', 'pick_up()', 'extend()', 'set_down()']]) }]
      },
      maMau: doiBai([[], [], ['wait_n(3)', 'rail(5)', 'while read_code() == -1:', '    wait()', 'pick_up()', 'extend()', 'set_down()']]),
      loiSai: [
        { moTa: 'Không dọn sắt: cẩu khách kẹt trên ray', baiLam: doiBai([['cast_net()', 'wait()', 'for i in range(6 - 2):', '    back()', 'drop_net()', 'wait()'], [], ['wait_n(3)', 'rail(5)', 'while read_code() == -1:', '    wait()', 'pick_up()', 'extend()', 'set_down()']]), phaiCoMa: ['het-ray'] },
        { moTa: 'Xuồng kéo thiếu một ô: container không tới dưới móc', baiLam: doiBai([['cast_net()', 'wait()', 'for i in range(3):', '    back()', 'drop_net()', 'wait()'], ['go_up()', 'pull_s()', 'go_down()', 'magnet_off()', 'wait()'], ['wait_n(3)', 'rail(5)', 'while read_code() == -1:', '    wait()', 'pick_up()', 'extend()', 'set_down()']]), phaiCoMa: ['qua-nhieu-nhip'] }
      ],
      sao: { o: 30, nhip: 13 },
      goiY: ['Cẩu khách chỉ nhấc ở cột 6: kéo container 6 - 2 ô.', 'pull_s(): nhện hút sắt ở ô dưới bụng.'],
      cauDo: { doi: ['XU', 'PL'], lap: null, coChe: ['nuoc', 'cont-troi', 'luoi', 'sat', 'ray', 'r3', 'tau'], cuu: 'may', meo: 'tiep-suc' }
    }),

    // 8 · cứu máy, dọn lối: cần cẩu khách (R3, khoá) chờ 5 nhịp, rail(-3) (số âm: sang trái) tới chồng container 15, nhấc, rail(6) sang phải hạ lên tàu.
    //     Sắt vụn nằm trên ray bên trái, thùng nặng trên ray bên phải. Nhện bước lên ô sắt, hút, bước xuống bãi thả ra; xe cứu hỏa ủi thùng nặng
    //     lên ô trống phía trên rồi lùi khỏi ray. Bẫy: drone (không hút sắt, không ủi thùng). Bảng ghi bẫy máy khai thác: nó nạp (load) được sắt vụn
    //     như vật thường, đôi xe cứu hỏa + máy khai thác cũng thắng, nên đổi thành drone.
    man9('cuu-cang-song', 8, 'van-dung', {
      ten: 'Ray hai đầu bị chắn',
      mucTieu: 'giao-tau',
      deBai: 'Cần cẩu khách chờ 5 nhịp, chạy ray sang trái lấy container rồi sang phải lên tàu. Sắt vụn và thùng nặng chắn ray. Dọn cả hai.',
      veMaMau: 'Đọc chương trình của cẩu khoá: rail(-3) rồi rail(6).',
      san: ['~~~~~~~~~~', '#.#####T~~', '#####.####', '#RRRRRRR##', '##.##.####', '##########'],
      doi: [khe({ x: 2, y: 4, huong: 0 }), khe({ x: 5, y: 4, huong: 0 }),
        may('CC', { x: 4, y: 3, huong: 0, nac: 0, tam: 2 }, { son: 'tim', coDinh: true })],
      them: { chong: [{ x: 1, y: 1, cont: [{ so: 15 }] }], hangTau: { o: [{ x: 7, y: 1 }], can: [15] }, vatThem: [VS(2, 3)], thungThem: [{ x: 5, y: 3 }] },
      chonDoi: {
        menu: ['PL', 'CU', 'DR'],
        cachMau: [{ chon: ['PL', 'CU'], ghiChu: 'đôi tốt', loiGiai: doiBai([
          ['go_up()', 'pull_s()', 'go_down()', 'magnet_off()', 'wait()'],
          ['move()', 'back()'],
          ['wait_n(5)', 'rail(-3)', 'pick_up()', 'rail(6)', 'set_down()']]) }]
      },
      maMau: doiBai([[], [], ['wait_n(5)', 'rail(-3)', 'pick_up()', 'rail(6)', 'set_down()']]),
      loiSai: [
        { moTa: 'Chỉ dọn sắt: cẩu khách mang container đâm thùng nặng', baiLam: doiBai([['go_up()', 'pull_s()', 'go_down()', 'magnet_off()', 'wait()'], [], ['wait_n(5)', 'rail(-3)', 'pick_up()', 'rail(6)', 'set_down()']]), phaiCoMa: ['het-ray', 'chua-giao-tau'] },
        { moTa: 'Xe ủi thùng rồi đứng lại trên ray', baiLam: doiBai([['go_up()', 'pull_s()', 'go_down()', 'magnet_off()', 'wait()'], ['move()'], ['wait_n(5)', 'rail(-3)', 'pick_up()', 'rail(6)', 'set_down()']]), phaiCoMa: ['het-ray', 'chua-giao-tau'] }
      ],
      sao: { o: 26, nhip: 19 },
      goiY: ['rail(-3): bệ chạy sang trái 3 ô; rail(6): sang phải 6 ô.', 'Ủi thùng xong thì back() ra khỏi ray.'],
      cauDo: { doi: ['PL', 'CU'], lap: null, coChe: ['ray', 'sat', 'thung-nang', 'container', 'r3', 'tau'], cuu: 'may', meo: 'don-loi' }
    }),

    // 9 · cứu máy, làm cầu: cần cẩu khách (R3, khoá) đứng trên bãi giữa sông, nhấc container 23 rồi chờ 6 nhịp, chạy ray rail(6), vươn cần hạ lên tàu.
    //     Tảng đá đổ trên ray chắn bệ. Máy khai thác ở bờ dưới, cách bãi một luồng nước: xuồng tung lưới kéo bè về ô (4, 4) làm cầu phao,
    //     máy khai thác chờ cầu, đi qua bè lên bãi, nạp tảng đá vào rổ. Bẫy: drone (không nạp đá, không kéo bè).
    //     Bảng ghi "máy khai thác lăn đá lấp hố trên ray": hố lấp xong thành sàn '.', không thành ray, nên đổi thành đá chắn ray + cầu phao (mẹo làm cầu giữ nguyên).
    man9('cuu-cang-song', 9, 'van-dung', {
      ten: 'Cầu phao ra bãi giữa sông',
      mucTieu: 'giao-tau',
      deBai: 'Tảng đá chắn ray của cẩu khách trên bãi giữa sông. Kéo bè làm cầu phao cho máy khai thác sang dọn đá.',
      veMaMau: 'Đọc chương trình của cẩu khoá: nhấc, chờ 6 nhịp rồi chạy ray.',
      san: ['~~~~~~~T~', '~.~~~~~~~', '~RRRRRRR~', '~.......~', '~~~~~~B~~', '#.......#', '#########'],
      doi: [khe({ x: 2, y: 5, huong: 0 }, { batDauNuoc: { x: 4, y: 4, huong: 1 } }), khe({ x: 4, y: 5, huong: 0 }, { batDauNuoc: { x: 2, y: 4, huong: 1 } }),
        may('CC', { x: 1, y: 2, huong: 0, nac: 0, tam: 1 }, { son: 'tim', coDinh: true })],
      them: { chong: [{ x: 1, y: 1, cont: [{ so: 23 }] }], hangTau: { o: [{ x: 7, y: 0 }], can: [23] }, vatThem: [{ x: 4, y: 2 }] },
      chonDoi: {
        menu: ['XU', 'KT', 'DR'],
        cachMau: [{ chon: ['XU', 'KT'], ghiChu: 'đôi tốt', loiGiai: doiBai([
          ['cast_net()', 'wait()', 'back()', 'back()', 'drop_net()', 'wait()'],
          ['wait_n(4)', 'move()', 'move()', 'load()', 'wait()'],
          ['pick_up()', 'wait_n(6)', 'rail(6)', 'extend()', 'set_down()']]) }]
      },
      maMau: doiBai([[], [], ['pick_up()', 'wait_n(6)', 'rail(6)', 'extend()', 'set_down()']]),
      loiSai: [
        { moTa: 'Máy khai thác đi ngay: chưa có cầu, đâm nước', baiLam: doiBai([['cast_net()', 'wait()', 'back()', 'back()', 'drop_net()', 'wait()'], ['move()', 'move()', 'load()', 'wait()'], ['pick_up()', 'wait_n(6)', 'rail(6)', 'extend()', 'set_down()']]), phaiCoMa: ['het-ray', 'chua-giao-tau'] },
        { moTa: 'Xuồng kéo bè thiếu một ô', baiLam: doiBai([['cast_net()', 'wait()', 'back()', 'drop_net()', 'wait()'], ['wait_n(4)', 'move()', 'move()', 'load()', 'wait()'], ['pick_up()', 'wait_n(6)', 'rail(6)', 'extend()', 'set_down()']]), phaiCoMa: ['het-ray', 'chua-giao-tau'] }
      ],
      sao: { o: 29, nhip: 18 },
      goiY: ['Bè nổi trên nước là cầu phao: xe đi qua được.', 'Máy khai thác chờ xuồng kéo bè xong mới đi.'],
      cauDo: { doi: ['XU', 'KT'], lap: null, coChe: ['nuoc', 'be', 'luoi', 'da', 'ray', 'r3', 'tau'], cuu: 'may', meo: 'lam-cau' }
    }),

    // 10 · song ca đoạn 4 (Bè 1: 5 5 4 4 3 3 2 2 | Bè 2: 1 3 2 4 3 5 4 2), giữ cho gói 10 ghép bài; dùng play_part (cuu-kho-hang.10 tạo).
    //      Bảng ghi "xuồng lắp loa hát, cẩu quay cần theo nhịp": cẩu không có loa và màn choi-dieu chỉ chấm robot hát, nên bè 2 do xe hang động (khách của cảng,
    //      loa sẵn) hát trên bờ; xuồng lắp loa hát bè 1 dưới nước. Hai đá chuông trên bến vỡ khi nghe nốt cuối. Đội cố định (tay loa không có trên bảng chọn).
    man9('cuu-cang-song', 10, 'trum', {
      ten: 'Song ca cảng sông',
      mucTieu: 'choi-dieu',
      deBai: 'Cảng đã thông! Xuồng hát dưới nước, xe hang động hát trên bờ: song ca đoạn 4. Mỗi bạn gọi play_part với bè của mình.',
      veMaMau: 'Bè 2 mới có một nốt.',
      hamCuaEmCan: ['play_note', 'play_part'],
      san: ['######', '~~~~.#', '#....#', '######'],
      doi: [xuongLoa(may('XU', { x: 1, y: 1, huong: 1 }, { tay: 'loa', boHam: ['cast_net', 'drop_net', 'set_length', 'reel_in', 'reel_out'], themHam: ['note', 'beat'], phatNot: true })),
        may('HD', { x: 1, y: 2, huong: 1 }, { son: 'lam' })],
      them: { dieu: { r1: '5 5 4 4 3 3 2 2', r2: '1 3 2 4 3 5 4 2' }, daChuong: [{ x: 4, y: 1, not: 2, ben: 1 }, { x: 4, y: 2, not: 2, ben: 1 }] },
      maMau: doiBai([['play_part([5, 5, 4, 4, 3, 3, 2, 2])'], ['play_note(1)']]),
      loiGiai: doiBai([['play_part([5, 5, 4, 4, 3, 3, 2, 2])'], ['play_part([1, 3, 2, 4, 3, 5, 4, 2])']]),
      loiSai: [
        { moTa: 'Bè 2 mới phát một nốt', baiLam: doiBai([['play_part([5, 5, 4, 4, 3, 3, 2, 2])'], ['play_note(1)']]), phaiCoMa: ['lo-nhip'] },
        { moTa: 'Bè 2 đảo hai nốt giữa', baiLam: doiBai([['play_part([5, 5, 4, 4, 3, 3, 2, 2])'], ['play_part([1, 3, 2, 4, 5, 3, 4, 2])']]), phaiCoMa: ['sai-not'] }
      ],
      sao: { o: 7, nhip: 10 },
      goiY: ['Bè 2: play_part([1, 3, 2, 4, 3, 5, 4, 2]).'],
      cauDo: { doi: ['XU', 'HD'], lap: null, coChe: ['loa', 'da-chuong', 'nuoc'], cuu: null, meo: 'song-song' }
    }),

    /* ========================================================================
       CHƯƠNG 2: lap-cang-song (10 màn)
       ======================================================================== */
    // 11 · show: Luna lắp sẵn xuồng + lưới + đầu đọc mã (lai L2, khoá). Xuồng đọc số container nổi ngay trước mũi: số chẵn (% 2 == 0) thì tung lưới
    //      kéo về, số lẻ thì chạy sang container kế. Cẩu chạy ray, chờ tới khi dưới móc có số, chờ thêm một nhịp cho xuồng nhả lưới, nhấc lên tàu.
    man9('lap-cang-song', 1, 'lam-quen', {
      ten: 'Xuồng đọc số',
      chiChay: true, mucTieu: 'giao-tau',
      deBai: 'Luna lắp cho xuồng đầu đọc mã. Xuồng đọc số container: chẵn thì kéo về cho cẩu, lẻ thì bỏ qua. Bấm Chạy.',
      veMaMau: 'Bấm Chạy xem xuồng chọn container nào.',
      san: ['~~~~~~~~', '~B~~B~~~', '~~~~~~~~', '~~~~~~~~', 'RRRRRR~T', '########'],
      doi: [may('CC', { x: 0, y: 4, huong: 0, nac: 0, tam: 2 }), Object.assign({ batDau: { x: 1, y: 2, huong: 0 } }, clone(XUONG_L2))],
      them: { contTroi: [{ x: 1, y: 1, so: 9 }, { x: 4, y: 1, so: 14 }], hangTau: { o: [{ x: 7, y: 4 }], can: [14] } },
      maMau: doiBai([['rail(4)', 'while read_code() == -1:', '    wait()', 'wait()', 'pick_up()', 'swing_right()', 'extend()', 'set_down()'],
        ['set_length(1)', 'for i in range(2):', '    if read_code() % 2 == 0:', '        cast_net()', '        wait()', '        back()', '        drop_net()', '        wait()', '    else:', '        turn_right()', '        forward(3)', '        turn_left()']]),
      loiGiai: doiBai([['rail(4)', 'while read_code() == -1:', '    wait()', 'wait()', 'pick_up()', 'swing_right()', 'extend()', 'set_down()'],
        ['set_length(1)', 'for i in range(2):', '    if read_code() % 2 == 0:', '        cast_net()', '        wait()', '        back()', '        drop_net()', '        wait()', '    else:', '        turn_right()', '        forward(3)', '        turn_left()']]),
      sao: { o: 38, nhip: 14 },
      goiY: ['read_code() % 2 == 0: số chẵn.'],
      cauDo: { doi: null, lap: 'xuong+day-keo+quet-ma', coChe: ['nuoc', 'cont-troi', 'luoi', 'doc-ma', 'tau'], cuu: 'hang', meo: 'doc-roi-chon' }
    }),

    // 12 · ép đổi cảm biến: container trôi trên luồng hàng 1 (chảy sang phải), không có số nào để đọc trước. Đầu đọc mã của màn trước không giúp gì;
    //      chong chóng dòng chảy (flow) cho biết sức nước: h, s = flow() rồi chờ 4 // s - 1 nhịp, tung lưới đúng lúc container trôi tới ô (5, 1) trước mũi xuồng.
    //      Xuồng lùi kéo về ô (5, 2) dưới móc, nhả; cẩu chờ có số dưới móc, nhấc, quay phải hạ lên tàu (8, 5).
    //      Hai sân (dữ liệu theo sân, luật 13/11): sân 1 nước xiết 2 ô / nhịp, sân 2 nước thường 1 ô / nhịp (lõi chỉ có sức 1, 2). Điền thẳng wait_n(1) thua sân 2,
    //      tưởng 1 ô / nhịp thua sân 1. Bẫy: xuồng + lưới + đầu đọc mã chờ thấy số trước mũi mới tung thì vòng chờ không dừng, thua cả hai sân (loiSai với robot mặc định báo chưa gắn cảm biến).
    //      Cách hai rẻ hơn, chậm hơn, không đọc: xe hai bánh + lưới (L3) đứng ở ô bờ (7, 4), cuối dòng (container dừng ở (7, 1) vì (8, 1) là bờ), chờ đủ lâu cho sân chậm nhất
    //      rồi tung lưới 3 ô tời container về (7, 3); cẩu chạy ray tới cột 7, thu cần đón. Cẩu không với tới hàng 1 (tầm 3 từ hàng 5), nên phải có R2 kéo container.
    man9('lap-cang-song', 2, 'lam-quen', {
      ten: 'Nước chảy mạnh cỡ nào',
      mucTieu: 'giao-tau',
      deBai: 'Hai sân, nước chảy nhanh chậm khác nhau. Lắp cảm biến nào để biết nước chảy nhanh cỡ nào? Tung lưới đúng lúc, kéo container về cho cẩu. Hay lắp xe rẻ, chờ ở bờ cuối dòng.',
      veMaMau: 'Xuồng tung lưới sớm quá.',
      san: [SAN_12, SAN_12],
      doi: [may('CC', { x: 5, y: 5, huong: 0, nac: 0, tam: 3 }), khe({ x: 7, y: 4, huong: 0 }, { son: 'lam', batDauNuoc: { x: 5, y: 2, huong: 0 } })],
      them: { contTroi: [[{ x: 1, y: 1, so: 18 }], [{ x: 1, y: 1, so: 27 }]],
        hangTau: [{ o: [{ x: 8, y: 5 }], can: [18] }, { o: [{ x: 8, y: 5 }], can: [27] }],
        dong: [dong12(2), dong12(1)] },
      lapRap: lapR2(['xuong', 'hai-banh'], ['day-keo'], ['dong-chay', 'quet-ma'], 12, [
        cach('xuong', 'day-keo', 'dong-chay', [CAU_12,
          ['set_length(1)', 'h, s = flow()', 'wait_n(4 // s - 1)', 'cast_net()', 'wait()', 'back()', 'drop_net()', 'wait()']]),
        cach('hai-banh', 'day-keo', null, [CAU_12_XE, ['set_length(3)', 'wait_n(5)', 'cast_net()', 'wait()']])
      ], { moLai: ['L2', 'L3'] }),
      maMau: doiBai([CAU_12, ['set_length(1)', 'cast_net()', 'wait()', 'back()', 'drop_net()', 'wait()']]),
      loiSai: [
        { moTa: 'Tung lưới ngay: container chưa tới', baiLam: doiBai([CAU_12, ['set_length(1)', 'cast_net()', 'wait()', 'back()', 'drop_net()', 'wait()']]), phaiCoMa: ['qua-nhieu-nhip'] },
        { moTa: 'Điền thẳng sức nước sân 1: wait_n(1) thắng sân 1, sân 2 (1 ô / nhịp) tung sớm', baiLam: doiBai([CAU_12, ['set_length(1)', 'wait_n(1)', 'cast_net()', 'wait()', 'back()', 'drop_net()', 'wait()']]), phaiCoMa: ['qua-nhieu-nhip'] },
        { moTa: 'Tưởng nước chảy 1 ô / nhịp: chờ 4 // 1 - 1 = 3 nhịp, sân 1 container trôi qua mất', baiLam: doiBai([CAU_12, ['set_length(1)', 'wait_n(4 // 1 - 1)', 'cast_net()', 'wait()', 'back()', 'drop_net()', 'wait()']]), phaiCoMa: ['qua-nhieu-nhip'] },
        { moTa: 'Bẫy ép đổi cảm biến: giữ đầu đọc mã của màn trước, chờ thấy số trước mũi mới tung (xuồng + lưới + đầu đọc mã thua cả hai sân: vòng chờ không dừng, lưới hụt)', baiLam: doiBai([CAU_12, ['set_length(1)', 'while read_code() == -1:', '    wait()', 'cast_net()', 'wait()', 'back()', 'drop_net()', 'wait()']]), phaiCoMa: ['chua-gan-cam-bien'] }
      ],
      sao: { o: 23, nhip: 13 },
      goiY: ['h, s = flow(): s là sức nước (ô mỗi nhịp), mỗi sân một số.', '6 // s: chia lấy phần nguyên. Container cách 6 ô.'],
      cauDo: { doi: null, lap: 'xuong+day-keo+dong-chay', coChe: ['nuoc', 'dong', 'cont-troi', 'luoi', 'tau'], cuu: 'hang', meo: 'cho-tin-hieu' }
    }),

    // 13 · đọc rồi chọn, ôn //: hai luồng nước, mỗi luồng một container nổi. Số container chia lấy phần nguyên cho 10 là số ô phải kéo về dưới móc cẩu
    //      (luồng trên: ô (3, 1); luồng dưới: ô (5, 3)). Xuồng tiến tới khi đầu đọc mã thấy số trước mũi, đọc c, tung lưới, lùi c // 10 ô, nhả;
    //      quay xuống luồng dưới, làm tiếp. Hàng tàu nối đuôi ở một bến nhận đúng thứ tự. Cẩu chờ có số dưới móc, nhấc, quay phải hạ lên boong; quay về, thu cần, chạy ray, làm tiếp.
    //      Ba sân (dữ liệu theo sân, luật 13/11), mỗi sân một cặp số và chỗ nổi: 15 / 37, 24 / 46, 19 / 28. Chương trình điền thẳng số ô của sân 1 thua sân 2, 3.
    //      Cách hai cùng giá, nhanh hơn: xuồng + lưới + hồng ngoại đọc distance() (số ô trống tới container), tung lưới dài d + 1 rồi thu dây về 1 (container tới thẳng ô dưới móc
    //      ở luồng trên), không phải tiến lùi; luồng dưới lùi thêm 2 ô. Hồng ngoại cũng đọc dữ liệu của từng sân (chỗ container nổi), nên thắng cả ba sân.
    //      Bảng ghi "so // 10 là tàu, đưa container về đúng bến của tàu": giao nhiều tàu (cfg.tau) cần tàu rời đúng nhịp lời giải xong; ô q thì dua-vat đếm cả
    //      container cẩu đã nhấc lên bờ. Đổi thành: số chục là số ô kéo, hàng tàu nối đuôi (hangTau) nhận đúng thứ tự.
    man9('lap-cang-song', 3, 'luyen', {
      ten: 'Số chục là số ô',
      mucTieu: 'giao-tau', khung: { chinh: 16, moiHam: 8 },
      deBai: 'Ba sân, mỗi sân số khác. Số chục của container là số ô phải kéo về dưới móc cẩu: c // 10. Tiến tới khi đọc thấy số.',
      veMaMau: 'Xuồng kéo luồng nào cũng một ô.',
      san: [san13(2, 2), san13(1, 1), san13(2, 3)],
      doi: [may('CC', { x: 3, y: 4, huong: 0, nac: 0, tam: 3 }), khe({ x: 1, y: 4, huong: 0 }, { son: 'lam', batDauNuoc: { x: 4, y: 1, huong: 3 } })],
      them: {
        contTroi: [[{ x: 2, y: 1, so: 15 }, { x: 2, y: 3, so: 37 }], [{ x: 1, y: 1, so: 24 }, { x: 1, y: 3, so: 46 }], [{ x: 2, y: 1, so: 19 }, { x: 3, y: 3, so: 28 }]],
        hangTau: [{ o: [{ x: 6, y: 4 }], can: [15, 37] }, { o: [{ x: 6, y: 4 }], can: [24, 46] }, { o: [{ x: 6, y: 4 }], can: [19, 28] }]
      },
      lapRap: lapR2(['xuong'], ['day-keo'], ['quet-ma', 'hong-ngoai', 'dong-chay'], 10, [
        cach('xuong', 'day-keo', 'quet-ma', [CAU_13, XU_13]),
        cach('xuong', 'day-keo', 'hong-ngoai', [CAU_13, ['for i in range(2):', '    d = distance()', '    set_length(d + 1)', '    cast_net()', '    wait()', '    set_length(1)', '    wait()',
          '    for j in range(2 * i):', '        back()', '    drop_net()', '    wait()', '    if i == 0:', '        turn_left()', '        forward(2)', '        turn_right()']])
      ], { moLai: ['L2'] }),
      maMau: doiBai([CAU_13, ['for i in range(2):', '    set_length(1)', '    while read_code() == -1:', '        move()', '    cast_net()', '    wait()', '    back()', '    drop_net()', '    wait()',
        '    if i == 0:', '        turn_left()', '        forward(2)', '        turn_right()']]),
      loiSai: [
        { moTa: 'Luồng nào cũng kéo một ô: container số chục 2, 3, 4 không tới dưới móc', baiLam: doiBai([CAU_13, ['for i in range(2):', '    set_length(1)', '    while read_code() == -1:', '        move()', '    cast_net()', '    wait()', '    back()', '    drop_net()', '    wait()',
          '    if i == 0:', '        turn_left()', '        forward(2)', '        turn_right()']]), phaiCoMa: ['qua-nhieu-nhip'] },
        { moTa: 'Điền thẳng số ô của sân 1 (lùi 1 rồi 3): thắng sân 1, sân 2 (24 / 46) và sân 3 (19 / 28) kéo sai ô', baiLam: doiBai([CAU_13, ['for i in range(2):', '    set_length(1)', '    while read_code() == -1:', '        move()', '    cast_net()', '    wait()', '    for j in range(1 + 2 * i):', '        back()', '    drop_net()', '    wait()',
          '    if i == 0:', '        turn_left()', '        forward(2)', '        turn_right()']]), phaiCoMa: ['qua-nhieu-nhip'] },
        { moTa: 'Quên set_length(1) trong vòng lặp: nhả lưới xong dây về dài 2, lần sau tung hụt', baiLam: doiBai([CAU_13, ['set_length(1)'].concat(XU_13.filter(function (d) { return d !== '    set_length(1)'; }))]), phaiCoMa: ['qua-nhieu-nhip'] }
      ],
      sao: { o: 45, nhip: 25 },
      goiY: ['c // 10: số chục của c (37 // 10 = 3).', 'Nhả lưới xong, dây lưới về dài 2: đặt lại set_length(1).'],
      cauDo: { doi: null, lap: 'xuong+day-keo+quet-ma', coChe: ['nuoc', 'cont-troi', 'luoi', 'doc-ma', 'hang-tau'], cuu: 'hang', meo: 'doc-roi-chon' }
    }),

    // 14 · tiếp sức, lai L3 (xe tời bờ): container 22 nổi xa bờ, ngoài tầm cẩu. Xe trên bờ lắp tay lưới: sang đúng cột, set_length(3) tung lưới xa 3 ô,
    //      tời kéo container một lần về ô nước sát bờ. Cẩu đứng ray dọc bên phải, cần quay trái: chờ có số dưới móc, nhấc, quay phải hạ lên tàu.
    //      Cách một hai bánh + lưới (rẻ): quay, đi, quay để sang cột. Cách hai omni + lưới (đắt hơn, nhanh hơn): slide_right() một nhịp.
    man9('lap-cang-song', 4, 'luyen', {
      ten: 'Xe tời bờ',
      mucTieu: 'giao-tau',
      deBai: 'Container 22 nổi xa bờ, cẩu với không tới. Lắp cho xe trên bờ tay lưới: tung xa, tời container về sát bờ cho cẩu.',
      veMaMau: 'Xe tung lưới sai cột.',
      san: ['########', '#~~~B~T#', '#~~~~~R#', '#~~~~~R#', '#.....##', '#.....##', '#.....##', '########'],
      doi: [may('CC', { x: 6, y: 3, huong: 0, nac: 3, tam: 2 }), khe({ x: 3, y: 4, huong: 0 }, { son: 'lam' })],
      them: { contTroi: [{ x: 4, y: 1, so: 22 }], hangTau: { o: [{ x: 6, y: 1 }], can: [22] } },
      lapRap: lapR2(['hai-banh', 'omni'], ['day-keo'], [], 7, [
        cach('hai-banh', 'day-keo', null, [CAU_14, ['turn_right()', 'move()', 'turn_left()', 'set_length(3)', 'cast_net()', 'wait()']]),
        cach('omni', 'day-keo', null, [CAU_14, ['slide_right()', 'wait()', 'set_length(3)', 'cast_net()', 'wait()']])
      ], { moLai: ['L3'] }),
      maMau: doiBai([CAU_14, ['set_length(3)', 'cast_net()', 'wait()']]),
      loiSai: [
        { moTa: 'Xe tung lưới ở cột 3: không có container', baiLam: doiBai([CAU_14, ['set_length(3)', 'cast_net()', 'wait()']]), phaiCoMa: ['qua-nhieu-nhip'] },
        { moTa: 'Lưới dài 2: tung hụt, container cách 3 ô', baiLam: doiBai([CAU_14, ['turn_right()', 'move()', 'turn_left()', 'cast_net()', 'wait()']]), phaiCoMa: ['qua-nhieu-nhip'] }
      ],
      sao: { o: 23, nhip: 10 },
      goiY: ['set_length(3): lưới xa 3 ô.', 'Xe trên bờ tung lưới là tời kéo vật về ô nước sát bờ.'],
      cauDo: { doi: null, lap: 'hai-banh+day-keo', coChe: ['nuoc', 'cont-troi', 'luoi', 'bo', 'tau'], cuu: 'hang', meo: 'tiep-suc' }
    }),

    // 15 · cứu người, cứu kịp, lai L10 (drone thả phao): hai thủy thủ trôi sát nhau trên luồng nước chảy về thác. Xuồng khách (R3, khoá) neo phía trên,
    //      tung lưới bắt người thứ nhất ở ô (5, 1) sát bờ, rồi sang phải một ô (ba nhịp) mới tung lần hai ở (6, 1). Drone lắp tay lưới mang phao: bay tới (6, 1)
    //      thả phao, bay ra; người thứ hai trôi tới bám phao đứng yên chờ lưới. Container đổ trên lối về trạm: cẩu nhấc xuống bãi dưới.
    //      Cách một drone + lưới (thả phao). Cách hai rẻ hơn: hai bánh + lưới (xe tời bờ) đứng ô (6, 3), chờ người thứ hai trôi tới (6, 1) rồi tời vào, tránh sang phải.
    man9('lap-cang-song', 5, 'cung-co', {
      ten: 'Phao cho người thứ hai',
      mucTieu: 'cuu-nguoi',
      deBai: 'Hai thủy thủ trôi sát nhau. Xuồng khách bắt người thứ nhất, rồi sang phải một ô mới tung lần hai. Giữ người thứ hai lại cho xuồng.',
      veMaMau: 'Đọc chương trình của xuồng khoá: lần tung thứ hai ở ô (6, 1).',
      san: ['~~~~~~~~~', '~~~~~~~~~', '#####..##', '#RRR#...#', '#####..##', '###.#####', '#########'],
      doi: [may('CC', { x: 3, y: 3, huong: 0, nac: 1, tam: 2 }), khe({ x: 6, y: 3, huong: 0 }, { son: 'lam', pin: 20 }),
        may('XU', { x: 5, y: 0, huong: 2 }, { son: 'tim', coDinh: true })],
      them: { contChan: true, chong: [{ x: 5, y: 3, cont: [{ so: 12 }] }], nguoi: [{ x: 2, y: 1 }, { x: 1, y: 1 }], tramCuu: [{ x: 5, y: 4 }, { x: 6, y: 4 }], thac: [{ x: 8, y: 1 }],
        dong: [0, 1, 2, 3, 4, 5, 6, 7, 8].map(function (x) { return { x: x, y: 1, huong: 1, suc: 1 }; }) },
      lapRap: lapR2(['drone', 'hai-banh'], ['day-keo'], [], 8, [
        cach('drone', 'day-keo', null, [['pick_up()', 'swing_right()', 'set_down()'], ['go_up()', 'go_up()', 'cast_net()', 'wait()', 'go_right()'], XU_15]),
        cach('hai-banh', 'day-keo', null, [['pick_up()', 'swing_right()', 'set_down()'], ['wait_n(4)', 'cast_net()', 'wait()', 'turn_right()', 'move()'], XU_15])
      ], { moLai: ['L10', 'L3'] }),
      maMau: doiBai([['pick_up()', 'swing_right()', 'set_down()'], [], XU_15]),
      loiSai: [
        { moTa: 'Không giữ người thứ hai: trôi qua lưới, xuống thác', baiLam: doiBai([['pick_up()', 'swing_right()', 'set_down()'], [], XU_15]), phaiCoMa: ['nguoi-troi-xa'] }
      ],
      sao: { o: 32, nhip: 11 },
      goiY: ['Người trôi tới ô có phao thì bám phao, đứng yên.', 'Thả phao xong bay ra cho lưới của xuồng đi qua.'],
      cauDo: { doi: null, lap: 'drone+day-keo', coChe: ['nuoc', 'dong', 'nguoi', 'phao', 'container', 'r3'], cuu: 'nguoi', meo: 'cuu-kip' }
    }),

    // 16 · cứu người, cứu kịp, lai L9 (cẩu + tay lưới = giỏ cứu hộ): thủy thủ kẹt dưới vũng nước sau tường, xuồng không vào được. Khe ô (4, 2), cần dài 2:
    //      cần đang chỉ nấc 0 (lên), người ở nấc 2 (xuống, ô (4, 4) qua tường). Quay abs(dich - nac) nấc, vớt, quay sang nấc 3 đặt người lên bờ (2, 2).
    //      Cẩu khách R1 nhấc container chắn lối đi bộ ở (2, 3). Cách một cẩu + lưới (quay cần qua tường). Cách hai rẻ hơn: hai bánh + lưới vòng qua bờ trái
    //      tời người vào ô nước sát bờ rồi lùi nhường ô lên bờ.
    man9('lap-cang-song', 6, 'cung-co', {
      ten: 'Giỏ cứu hộ trên cần cẩu',
      mucTieu: 'cuu-nguoi',
      deBai: 'Thủy thủ kẹt dưới vũng nước sau tường. Cần cẩu gắn tay lưới thành giỏ cứu hộ: quay abs(dich - nac) nấc, vớt người, đặt lên bờ.',
      veMaMau: 'Cần chỉ nấc 0, người ở nấc 2. Đếm số nấc phải quay bằng abs.',
      san: ['#######', '#######', '#....##', '#R.####', '#R.~~##', '##.####', '#######'],
      doi: [may('CC', { x: 1, y: 3, huong: 0, nac: 1, tam: 1 }, { boHam: ['rail'] }), khe({ x: 4, y: 2, huong: 0, nac: 0, tam: 2 }, { son: 'lam' })],
      them: { contChan: true, chong: [{ x: 2, y: 3, cont: [{ so: 26 }] }], nguoi: [{ x: 4, y: 4 }], tramCuu: [{ x: 2, y: 5 }] },
      lapRap: lapR2(['cau', 'hai-banh'], ['day-keo'], [], 9, [
        cach('cau', 'day-keo', null, [['pick_up()', 'swing_left()', 'set_down()'], ['nac = 0', 'dich = 2', 'for i in range(abs(dich - nac)):', '    swing_right()', 'cast_net()', 'swing_right()', 'drop_net()']]),
        cach('hai-banh', 'day-keo', null, [['pick_up()', 'swing_left()', 'set_down()'], ['turn_left()', 'forward(2)', 'turn_left()', 'forward(2)', 'turn_left()', 'cast_net()', 'wait()', 'back()']])
      ], { moLai: ['L9', 'L3'] }),
      maMau: doiBai([['pick_up()', 'swing_left()', 'set_down()'], ['nac = 0', 'dich = 2']]),
      loiSai: [
        { moTa: 'range(nac - dich) = range(-2) rỗng: cần không quay, vớt hụt', baiLam: doiBai([['pick_up()', 'swing_left()', 'set_down()'], ['nac = 0', 'dich = 2', 'for i in range(nac - dich):', '    swing_right()', 'cast_net()', 'swing_right()', 'drop_net()']]), phaiCoMa: ['chua-cuu-nguoi'] },
        { moTa: 'Quên quay sang bờ: giỏ đặt xuống nước', baiLam: doiBai([['pick_up()', 'swing_left()', 'set_down()'], ['nac = 0', 'dich = 2', 'for i in range(abs(dich - nac)):', '    swing_right()', 'cast_net()', 'drop_net()']]), phaiCoMa: ['chua-cuu-nguoi'] }
      ],
      sao: { o: 12, nhip: 8 },
      goiY: ['abs(2 - 0) = 2: quay hai nấc.', 'cast_net() vớt người ở đầu cần, drop_net() đặt người lên ô bờ ở đầu cần.'],
      cauDo: { doi: null, lap: 'cau+day-keo', coChe: ['nuoc', 'nguoi', 'gio', 'container', 'tuong'], cuu: 'nguoi', meo: 'cuu-kip' }
    }),

    // 17 · cứu người + tạo hàm sonic_rail(): thủy thủ đã lên bờ phải đi dọc lối về trạm cứu. Container đổ chắn lối (cẩu nhấc, quay cần xuống bãi dưới),
    //      tảng đá chuông chắn lối: robot gắn mic (cảm biến âm thanh) nghe nốt bằng listen(), loa hát lại play_note(listen()), đá vỡ; rồi back() lùi khỏi lối.
    //      Cách một: bánh gai + loa + mic (như xe hang động); cách hai rẻ hơn: hai bánh + loa + mic. Gói sau (cuu-ben-song) gọi sonic_rail.
    //      Bảng ghi "omni + nam châm + radar hút sắt trên ray": trùng việc dọn sắt trên ray của cuu-cang-song.7 / .8, và gói phải tạo sonic_rail, nên đổi.
    //      Mẹo khai cứu kịp (người, không phải robot, đi lên ô đá chuông đã vỡ nên bộ dò dọn lối không thấy).
    man9('lap-cang-song', 7, 'van-dung', {
      ten: 'Đá chuông chắn lối',
      mucTieu: 'cuu-nguoi',
      taoHam: ['sonic_rail'],
      hamCuaEmCan: HAM_EM.concat(['play_note']),
      deBai: 'Container và đá chuông chắn lối về trạm cứu. Lắp robot nghe được nốt, hát lại để phá đá. Viết sonic_rail(): hát lại nốt nghe được, rồi lùi.',
      veMaMau: 'Hàm sonic_rail chưa có. Thủy thủ đứng chờ.',
      san: ['#########', '######.##', '#.......#', '#RRRR####', '#....####', '#########'],
      doi: [may('CC', { x: 3, y: 3, huong: 0, nac: 0, tam: 1 }), khe({ x: 6, y: 2, huong: 3 }, { son: 'lam' })],
      them: { contChan: true, chong: [{ x: 3, y: 2, cont: [{ so: 31 }] }], nguoi: [{ x: 1, y: 2 }], tramCuu: [{ x: 6, y: 1 }], daChuong: [{ x: 5, y: 2, not: 6, ben: 1 }] },
      lapRap: lapR2(['gai', 'hai-banh'], ['loa'], ['am-thanh'], 9, [
        cach('gai', 'loa', 'am-thanh', [['pick_up()', 'swing_right()', 'swing_right()', 'set_down()'], ['sonic_rail()']], [H_SONIC_RAIL]),
        cach('hai-banh', 'loa', 'am-thanh', [['pick_up()', 'swing_right()', 'swing_right()', 'set_down()'], ['sonic_rail()']], [H_SONIC_RAIL])
      ]),
      maMau: doiBai([['pick_up()', 'swing_right()', 'swing_right()', 'set_down()'], []]),
      loiSai: [
        { moTa: 'Thân sonic_rail thiếu back(): robot còn đứng chắn lối', baiLam: doiBai([['pick_up()', 'swing_right()', 'swing_right()', 'set_down()'], ['sonic_rail()']]), hamCuaEmMoi: [{ ten: 'sonic_rail', thamSo: [], than: ['play_note(listen())'] }], phaiCoMa: ['chua-cuu-nguoi'] },
        { moTa: 'Hát sai nốt: đá chuông không vỡ', baiLam: doiBai([['pick_up()', 'swing_right()', 'swing_right()', 'set_down()'], ['sonic_rail()']]), hamCuaEmMoi: [{ ten: 'sonic_rail', thamSo: [], than: ['play_note(5)', 'back()'] }], phaiCoMa: ['chua-cuu-nguoi'] }
      ],
      sao: { o: 14, nhip: 7 },
      goiY: ['listen() trả nốt của đá chuông gần nhất.', 'sonic_rail(): play_note(listen()) rồi back().'],
      cauDo: { doi: null, lap: 'gai+loa+am-thanh', coChe: ['da-chuong', 'loa', 'container', 'nguoi'], cuu: 'nguoi', meo: 'cuu-kip' }
    }),

    // 18 · đọc rồi chọn, lai L13 (cẩu + móc + camera bụng): ô bãi dưới mỗi chồng sơn màu tàu (đỏ / xanh).
    //      Container tự không có màu (lõi: chồng không màu) nên đổi so với bảng: cẩu nhấc container trước, camera ở đầu cần nhìn xuống ô bãi vừa trống, look() trả màu ô.
    //      Đỏ: quay hai nấc hạ lên tàu đỏ sát ray; xanh: quay hai nấc, vươn thêm một ô hạ lên tàu xanh ngoài xa. Tàu rời ngay sau lần hạ cuối của nó.
    //      Cẩu khách R1 ở cuối ray giao container 45 lên tàu xanh. Ba sân (dữ liệu theo sân, luật 13/11): màu ô bãi đỏ-xanh-đỏ, xanh-đỏ-xanh, xanh-xanh-đỏ;
    //      mỗi sân tàu đậu vừa đủ nhịp, mỗi sân một bộ số (chẵn đi tàu đỏ, lẻ đi tàu xanh). Danh sách màu điền thẳng của sân 1 giao nhầm ở sân 2, 3.
    //      Cách hai: cẩu + móc + đầu đọc mã đọc số trước khi nhấc, số lẻ thì tàu xanh (cùng giá, cùng nhịp: camera bụng chỉ có trên cẩu và drone, drone không nhấc container).
    //      Bảng ghi "số bị mờ, đọc màu thay số": chồng container không có màu (lõi), nên màu ở ô bãi và số vẫn đọc được.
    man9('lap-cang-song', 8, 'van-dung', {
      ten: 'Màu ô bãi, tàu nào',
      mucTieu: 'giao-tau',
      khung: { chinh: 16, moiHam: 8 },
      deBai: 'Ô bãi dưới mỗi container sơn màu tàu: đỏ hay xanh, mỗi sân một kiểu (số chẵn đi tàu đỏ, số lẻ đi tàu xanh). Nhấc lên, nhìn màu ô, hạ lên đúng tàu.',
      veMaMau: 'Cẩu R2 chưa có chương trình. Camera ở đầu cần đọc màu ô bãi bằng look().',
      san: [SAN_18, SAN_18, SAN_18],
      doi: [may('CC', { x: 6, y: 2, huong: 0, nac: 0, tam: 1 }), khe({ x: 1, y: 2, huong: 0, nac: 0, tam: 1 }, { son: 'lam' })],
      them: {
        chong: [chong18([12, 27, 30]), chong18([13, 28, 31]), chong18([15, 23, 34])],
        sonBanDau: [son18('rbr'), son18('brb'), son18('bbr')],
        tau: [tau18(21, 13), tau18(14, 22), tau18(23, 15)],
        giao: [giao18([12, 27, 30]), giao18([13, 28, 31]), giao18([15, 23, 34])]
      },
      lapRap: lapR2(['cau'], ['moc-cau'], ['camera-bay', 'quet-ma'], 12, [
        cach('cau', 'moc-cau', 'camera-bay', [CAU_R1_18, ['for k in range(3):'].concat(CAU_18_THAN.map(function (d) { return '    ' + d; }))]),
        cach('cau', 'moc-cau', 'quet-ma', [CAU_R1_18, ['for k in range(3):', '    so = read_code()', '    pick_up()', '    swing_right()', '    swing_right()', '    if so % 2 == 1:', '        extend()', '        set_down()', '        retract()',
          '    else:', '        set_down()', '    swing_right()', '    swing_right()', '    rail(1)']])
      ], { moLai: ['L13'] }),
      maMau: doiBai([CAU_R1_18, []]),
      loiSai: [
        { moTa: 'Không đọc màu: container nào cũng hạ lên tàu đỏ', baiLam: doiBai([CAU_R1_18, ['for k in range(3):', '    pick_up()', '    swing_right()', '    swing_right()', '    set_down()', '    swing_right()', '    swing_right()', '    rail(1)']]), phaiCoMa: ['giao-nham'] },
        { moTa: 'Điền thẳng màu của sân 1 (đỏ, xanh, đỏ): thắng sân 1, sân 2 và 3 giao nhầm tàu', baiLam: doiBai([CAU_R1_18, ['for mau in ["red", "blue", "red"]:'].concat([CAU_18_THAN[0]].concat(CAU_18_THAN.slice(2)).map(function (d) { return '    ' + d; }))]), phaiCoMa: ['giao-nham'] },
        { moTa: 'Cẩu R2 đứng yên: tàu rời thiếu hàng', baiLam: doiBai([CAU_R1_18, []]), phaiCoMa: ['chua-giao-tau'] }
      ],
      sao: { o: 23, nhip: 27 },
      goiY: ['Nhấc container lên trước: ô bãi trống thì camera mới thấy màu sơn.', 'mau = look(); xanh thì extend() rồi set_down(), hạ xong retract().'],
      cauDo: { doi: null, lap: 'cau+moc-cau+camera-bay', coChe: ['ray', 'tau', 'son', 'container', 'camera'], cuu: 'hang', meo: 'doc-roi-chon' }
    }),

    // 19 · biến thể, đọc rồi chọn, nhắc lại cả gói và G1–G3: container nổi trên bè giữa sông, ngoài tầm cần; hàng tàu (6, 1) cần nó rồi container ở chồng bãi cạnh ray.
    //      Ba robot: cẩu (R1) và xe chở hàng (R3) đặt sẵn, em viết cả hai; R2 tự lắp. Thùng gỗ đổ chắn ray ở (6, 4) (việc của G1 Kho: thùng đổ chắn lối):
    //      xe chở hàng gọi grab_clear() (hàm của gói, cuu-cang-song.6: gắp rồi lùi một ô) dọn ray. Cẩu chờ số dưới móc ở ô (4, 3), nhấc, quay lên hạ lên tàu;
    //      quay sang phải, thu cần, rồi dò xuống ray: read_code() == -1 thì rail(1), đếm n; thấy số thì nhấc, rail(-n) về (số âm, cuu-cang-song.8), quay lên, vươn, hạ.
    //      Hai sân (dữ liệu theo sân, luật 13/11): chồng ở (7, 5) số 35 / (7, 7) số 41, container nổi 22 / 26. Điền thẳng rail(2) của sân 1 thì sân 2 móc hụt.
    //      Hai cách đưa container nổi về ô (4, 3): xuồng + lưới xuất phát ngay ô (4, 3) (nhanh): lưới dài 2 bắt, thu dây còn 1, quay trái, lùi một ô, nhả lưới.
    //      Cách hai rẻ hơn: xe hai bánh + lưới chạy dọc bờ ba ô tới cột 4, lưới dài 3 tời container về ô nước sát bờ.
    man9('lap-cang-song', 9, 'bien-the', {
      ten: 'Xuồng hay xe bờ',
      mucTieu: 'giao-tau', khung: { chinh: 20, moiHam: 8 },
      deBai: 'Hai sân. Container nổi giữa sông, ngoài tầm cần: đưa về ô (4, 3) dưới móc (xuồng nhanh, xe bờ rẻ). Thùng gỗ đổ chắn ray: xe chở hàng grab_clear(). Cẩu dò ray tìm chồng thứ hai, rail(-n) về.',
      veMaMau: 'Cẩu mới giao container nổi. Thùng gỗ còn chắn ray, chưa ai dọn.',
      san: [SAN_19, SAN_19],
      doi: [may('CC', { x: 6, y: 3, huong: 0, nac: 3, tam: 2 }), khe({ x: 1, y: 4, huong: 0 }, { son: 'lam', batDauNuoc: { x: 4, y: 3, huong: 0 } }), may('CH', { x: 7, y: 4, huong: 3 })],
      them: {
        contTroi: [[{ x: 4, y: 1, so: 22 }], [{ x: 4, y: 1, so: 26 }]],
        chong: [[{ x: 7, y: 5, cont: [{ so: 35 }] }], [{ x: 7, y: 7, cont: [{ so: 41 }] }]],
        hangTau: [{ o: [{ x: 6, y: 1 }], can: [22, 35] }, { o: [{ x: 6, y: 1 }], can: [26, 41] }],
        vatThem: [[{ x: 6, y: 4 }], [{ x: 6, y: 4 }]]
      },
      lapRap: lapR2(['xuong', 'hai-banh'], ['day-keo'], [], 8, [
        cach('xuong', 'day-keo', null, [CAU_19, ['cast_net()', 'wait()', 'set_length(1)', 'wait()', 'turn_left()', 'back()', 'drop_net()', 'wait()'], CH_19]),
        cach('hai-banh', 'day-keo', null, [CAU_19, ['turn_right()', 'forward(3)', 'turn_left()', 'set_length(3)', 'cast_net()', 'wait()'], CH_19])
      ], { moLai: ['L3'] }),
      maMau: doiBai([CAU_19.slice(0, 6), [], []]),
      loiSai: [
        { moTa: 'Xuồng kéo nhưng không rời ô (4, 3): container nằm ở ô khác', baiLam: doiBai([CAU_19, ['cast_net()', 'wait()', 'turn_left()', 'drop_net()', 'wait()'], CH_19]), phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Quên thu dây set_length(1): lùi xong container mới tới ô (4, 2)', baiLam: doiBai([CAU_19, ['cast_net()', 'wait()', 'turn_left()', 'back()', 'drop_net()', 'wait()'], CH_19]), phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Xe chở hàng không dọn thùng: cẩu chạy ray đâm thùng gỗ', baiLam: doiBai([CAU_19, ['cast_net()', 'wait()', 'set_length(1)', 'wait()', 'turn_left()', 'back()', 'drop_net()', 'wait()'], []]), phaiCoMa: ['het-ray'] },
        { moTa: 'Điền thẳng chồng của sân 1: rail(2) rồi rail(-2), sân 2 móc hụt', baiLam: doiBai([CAU_19.slice(0, 8).concat(['rail(2)', 'pick_up()', 'rail(-2)', 'swing_left()', 'extend()', 'set_down()']),
          ['cast_net()', 'wait()', 'set_length(1)', 'wait()', 'turn_left()', 'back()', 'drop_net()', 'wait()'], CH_19]), phaiCoMa: ['moc-hut'] },
        { moTa: 'Về bằng rail(n) thay vì rail(-n): cẩu chạy tiếp xuống, hết ray', baiLam: doiBai([CAU_19.map(function (d) { return d === 'rail(-n)' ? 'rail(n)' : d; }),
          ['cast_net()', 'wait()', 'set_length(1)', 'wait()', 'turn_left()', 'back()', 'drop_net()', 'wait()'], CH_19]), phaiCoMa: ['het-ray'] }
      ],
      sao: { o: 44, nhip: 30 },
      goiY: ['Xe chở hàng: grab_clear() gắp thùng gỗ rồi lùi khỏi ray.', 'Dò ray: while read_code() == -1: rail(1), đếm n. Về: rail(-n).', 'Xe trên bờ tung lưới: container về ô nước sát bờ.'],
      cauDo: { doi: null, lap: 'xuong+day-keo', coChe: ['nuoc', 'cont-troi', 'luoi', 'hang-tau', 'chong', 'thung-go', 'ray'], cuu: 'hang', meo: 'doc-roi-chon' }
    }),

    // 20 · song ca đoạn 4 (gói 10 ghép bài): bè 1 5 5 4 4 3 3 2 2, bè 2 1 3 2 4 3 5 4 2. Mục tiêu choi-dieu cần đúng hai robot cùng hát, mà cần cẩu không gắn loa,
    //      nên R1 là xe hang động (loa + mic, đặt sẵn trên bờ, hát bè 1), không phải cẩu. R2 tự lắp loa: xuồng hát dưới nước hay xe hai bánh hát trên bờ (rẻ hơn).
    //      Đá chuông nốt 2 ở cuối luồng nước vỡ khi xuồng hát (tiếng vang từ mũi dọc luồng); xe trên bờ không với tới. Đá chỉ để nhìn, không tính thắng.
    man9('lap-cang-song', 10, 'trum', {
      ten: 'Song ca trên nước, trên bờ',
      mucTieu: 'choi-dieu',
      hamCuaEmCan: ['play_note', 'play_part'],
      deBai: 'Màn cuối cảng sông: song ca đoạn 4. Xe hang động hát bè 1 trên bờ. Lắp loa cho bạn hát bè 2: xuồng dưới nước hay xe trên bờ.',
      veMaMau: 'Bè 2 mới có bốn nốt.',
      san: ['#######', '#.....#', '~~~~~.#', '#.....#', '#######'],
      doi: [may('HD', { x: 1, y: 1, huong: 1 }), khe({ x: 1, y: 3, huong: 1 }, { son: 'lam', chinhLuoi: false, batDauNuoc: { x: 1, y: 2, huong: 1 } })],
      them: { dieu: { r1: '5 5 4 4 3 3 2 2', r2: '1 3 2 4 3 5 4 2' }, daChuong: [{ x: 5, y: 2, not: 2, ben: 1 }] },
      lapRap: lapR2(['xuong', 'hai-banh'], ['loa'], [], 8, [
        cach('xuong', 'loa', null, [['play_part([5, 5, 4, 4, 3, 3, 2, 2])'], ['play_part([1, 3, 2, 4, 3, 5, 4, 2])']]),
        cach('hai-banh', 'loa', null, [['play_part([5, 5, 4, 4, 3, 3, 2, 2])'], ['play_part([1, 3, 2, 4, 3, 5, 4, 2])']])
      ], { moLai: ['L5'] }),
      maMau: doiBai([['play_part([5, 5, 4, 4, 3, 3, 2, 2])'], ['play_part([1, 3, 2, 4])']]),
      loiSai: [
        { moTa: 'Bè 2 mới có bốn nốt', baiLam: doiBai([['play_part([5, 5, 4, 4, 3, 3, 2, 2])'], ['play_part([1, 3, 2, 4])']]), phaiCoMa: ['lo-nhip'] },
        { moTa: 'R2 hát nhầm bè 1', baiLam: doiBai([['play_part([5, 5, 4, 4, 3, 3, 2, 2])'], ['play_part([5, 5, 4, 4, 3, 3, 2, 2])']]), phaiCoMa: ['sai-not'] }
      ],
      sao: { o: 7, nhip: 10 },
      goiY: ['Bè 2: play_part([1, 3, 2, 4, 3, 5, 4, 2]).', 'Hai bạn bắt đầu cùng một nhịp.'],
      cauDo: { doi: null, lap: 'xuong+loa', coChe: ['loa', 'nuoc', 'bo', 'da-chuong'], cuu: null, meo: 'song-song' }
    }),
  ];
})();
