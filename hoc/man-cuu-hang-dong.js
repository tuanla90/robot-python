/* ============================================================================
   man-cuu-hang-dong.js - Mùa 9 CLB Sáng Tạo: Gói 8 "Hang động sau bão" (dựng lại 17/11, M9M8, theo khuôn G6 / G7)
   20 màn: cuu-hang-dong (chọn đội trong menu cỗ máy) + lap-hang-dong (R1 xe hang động đặt sẵn, R2 tự lắp; lai L4 L5 L7).
   Ôn Python: dict (sổ tra trong code: nốt nghe được → nốt phát / hướng; KHOÁ tra do sân cấp qua listen() / hear()), set (nhớ nốt / ngách đã đi).
   Bão: hố sụt mới (u), cửa đá (C, nút đè M giữ), sông ngầm dâng (~), đá chuông chắn lối (vỡ khi phát đúng nốt, trong tầm 3 ô hay trên tia từ mũi xe),
   chuông đá vang (nguồn tiếng cố định: listen() trả nốt, hear() trả khoảng cách), ngách hang (chui miệng này ra miệng kia), thạch nhũ đổ (thùng nặng H).
   Ném đá: luật NÉM ĐÀ mùa 9 (aim chỉ 1, 2; aim_lob(3) tự chạy đà rồi lùi về chỗ cũ).
   Màn 10 mỗi chương: song ca đoạn 8 (bè 1: 4 4 3 3 2 2 1 1 | bè 2: 6 6 5 5 4 4 3 3), gọi play_part.
   Câu đố: hoc/MUA-9-200-CAU-DO.md mục G8 (ghi chú "Đã dựng 17/11 (M9M8)": các chỗ lệch so với bảng).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  /* ---- M9M8: khung màn mùa 9 (chép từ man-cuu-mo-da.js) ------------------------------------------ */
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

  /** cuu-hang-dong.1: nhện bật qua hố sụt lên nút đè M (cửa đá mở), giữ nút tới khi xe hang động qua cửa, bước sang cờ.
   *  Xe hang động chờ cửa mở, chạy thẳng qua cửa đá tới cờ. */
  var PL_1 = ['jump("R")', 'wait_n(3)', 'go_right()'];
  var HD_1 = ['wait_n(3)', 'forward(6)'];

  /** cuu-hang-dong.2 (ba sân): chuông đá vang trong hốc dưới hang xe (mỗi sân một nốt 2 / 4 / 6), đá chuông chắn ngách nhện ở hàng trên (nốt 5 / 7 / 3).
   *  Sổ ám hiệu d (bảng tra trong code): nghe chuông nốt n thì phát nốt d[n]. Khoá n do sân cấp qua listen(). */
  var D_2 = 'd = {2: 5, 4: 7, 6: 3}';
  /** Xe hang động: tiến ba ô tới trên hốc chuông, nghe nốt chuông, tra sổ, hát nốt đá chuông (cách 2 ô): đá vỡ; tiến về cờ. */
  var HD_2 = [D_2, 'forward(3)', 'n = listen()', 'play_note(d[n])', 'forward(3)'];
  /** Nhện: co chân chui gầm đá thấp, đứng lên, chờ đá chuông vỡ, đi qua chỗ đá về cờ. */
  var PL_2 = ['crouch()', 'go_right()', 'go_right()', 'stand()', 'wait()', 'for i in range(4):', '    go_right()'];
  function san2() { return ['#########', '#.n....F#', '#########', '#......F#', '####.####', '#########']; }

  /** cuu-hang-dong.3: hang dài, hai hố sụt trên lối nhện ở hàng 3, nút đè M sau hố thứ hai; cửa đá C trên lối xe hang động (sàn đá ướt trước cửa).
   *  Nhện bật qua hai hố, lên nút, giữ tới khi xe qua cửa, bước sang cờ. Xe hang động chờ, bám đá ướt qua cửa tới cờ. */
  var PL_3 = ['jump("R")', 'jump("R")', 'go_right()', 'wait_n(4)', 'go_right()'];
  var HD_3 = ['wait_n(7)', 'forward(7)'];

  /** cuu-hang-dong.4: hang dưới bị vách đá chia đôi, ngách hang nối miệng (2, 3) với miệng (5, 3) trong buồng kín có nút đè M; cửa đá C trên lối xe hang động.
   *  Nhện bước vào miệng ngách, chui ra miệng kia trong buồng, lên nút, giữ tới khi xe qua cửa, sang cờ. */
  var PL_4 = ['go_right()', 'go_right()', 'go_right()', 'wait_n(4)', 'go_right()'];
  var HD_4 = ['wait_n(4)', 'forward(7)'];

  /** cuu-hang-dong.5: sông ngầm dâng, nhà thám hiểm mặc áo phao kẹt ở cuối luồng (7, 2) dưới vách đá; đá chuông (4, 2) rơi chắn luồng xuồng.
   *  Xe hang động tiến một ô (đá trong tầm 3), nghe nốt, hát lại: đá vỡ. Xuồng chờ, chạy qua chỗ đá, cách người 2 ô (lưới dài 2) tung lưới, lùi hai ô kéo người tới dưới bờ đá; người lên bờ về trạm. */
  var HD_5 = ['forward(1)', 'play_note(listen())'];
  var XU_5 = ['wait_n(2)', 'forward(4)', 'cast_net()', 'wait()', 'back()', 'back()'];

  /** cuu-hang-dong.6: sông ngầm hàng 2, bến q (4, 2) nối hai bờ; bè B (6, 2) trôi giữa sông; đá chuông (2, 2) rơi chắn luồng xuồng ở mép bờ.
   *  Nhà thám hiểm kẹt ở bờ bên kia (7, 1) sau đá chuông thứ hai (6, 1); đá này xa bờ dưới hơn 3 ô, chỉ đứng trên cầu phao mới hát tới.
   *  Xe hang động hát vỡ đá chắn luồng, tới dưới bến, quay lên chờ bè, lên cầu phao, nghe nốt đá thứ hai, hát lại: đá vỡ, người về trạm cứu bờ bên kia.
   *  Xuồng chờ, chạy tới bến, tung lưới (dài 2) bắt bè, lùi hai ô kéo bè vào bến, nhả lưới. */
  var HD_6 = ['play_note(listen())', 'forward(2)', 'turn_left()', 'wait_n(4)', 'forward(1)', 'play_note(listen())'];
  var XU_6 = ['wait()', 'forward(3)', 'cast_net()', 'wait()', 'back()', 'back()', 'drop_net()', 'wait()'];

  /** Xe hang động khách khoá cuu-hang-dong.7: kẹt sau hố sụt mới (4, 1) và cửa đá (6, 1); chờ ba nhịp rồi chạy thẳng bảy ô về cờ. */
  var HD_R3_7 = ['wait_n(3)', 'forward(7)'];
  /** Máy khai thác: hất đá tròn trước mũi xuống hố (xa 2 ô), lên qua chỗ đá vừa xúc, rẽ phải về cờ. Nhện: lên nút đè (cửa đá mở), giữ tới khi máy khách qua cửa, sang cờ. */
  var KT_7 = ['lob()', 'forward(1)', 'turn_right()', 'forward(1)'];
  var PL_7 = ['go_up()', 'wait_n(4)', 'go_right()'];

  /** Xe hang động khách khoá cuu-hang-dong.8: chờ bốn nhịp rồi chạy thẳng bảy ô dọc lối hang hàng 2 về cờ (8, 2). */
  var HD_R3_8 = ['wait_n(4)', 'forward(7)'];
  /** Xe cứu hỏa: ủi thạch nhũ đổ (thùng nặng) lên hốc trên, lùi hai ô về cờ. Nhện: bật qua hố sụt lên nút đè (cửa đá mở), giữ tới khi máy khách qua cửa, sang cờ. */
  var CU_8 = ['forward(1)', 'back()', 'back()'];
  var PL_8 = ['jump("R")', 'wait_n(6)', 'go_right()'];

  /** cuu-hang-dong.9 (ba sân): xuồng khách R3 (khoá) kéo bè hàng sau đuôi, chờ rồi chạy thẳng ra bến q (7, 4); đá chuông (5, 4) rơi chắn luồng sông ngầm.
   *  Bờ trên (hàng 2) là lối duy nhất tới chỗ hát (đá chỉ trong tầm từ (4, 2)); thang sắt đổ (3, 2) chắn lối; chuông đá (4, 1) vang nốt của sân. */
  var D_9 = 'd = {1: 4, 3: 8, 5: 6}';
  function san9() { return ['##########', '###D.#####', '#..o....##', '##########', '#B~~~~~q~#', '##########']; }
  var VC_9 = ['..........', '..........', '...s......', '..........', '..........', '..........'];
  /** Xuồng khách khoá: buộc bè sau đuôi (lưới dài 1 ra sau), chờ chín nhịp, chạy sáu ô (bè theo vào bến q), nhả lưới. */
  var XU_R3_9 = ['set_length(1)', 'cast_net("back")', 'wait()', 'wait_n(9)', 'forward(6)', 'drop_net()', 'wait()'];
  /** Nhện: bước xuống ô thang sắt, gọi clear_iron("U") (gói 3: hút sắt rồi bước lên), thả thang vào hốc chứa D. */
  var PL_9 = ['go_down()', 'clear_iron("U")', 'magnet_off()', 'wait()'];
  /** Xe hang động: chờ lối thông, tiến ba ô tới chỗ hát, nghe chuông, tra sổ, hát nốt đá chuông. */
  var HD_9 = [D_9, 'wait_n(5)', 'forward(3)', 'n = listen()', 'play_note(d[n])'];

  /** R2 đã lắp sẵn (màn show chương 2): nhện + nam châm + mic (lai L4), như LapRap.apDung lắp ra. */
  var NHEN_MIC = {
    loaiRobot: 'nhen', robot: { than: 'nhen', tay: 'nam-cham', camBien: [{ ma: 'am-thanh', o: 'tren' }], son: 'lam' },
    hamGoc: ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'crouch', 'stand', 'magnet_n', 'magnet_s', 'magnet_off', 'hear', 'listen']
  };
  /** lap-hang-dong.1: xe hang động R1 hát vỡ đá chuông chắn miệng ngách (cách 3 ô). Nhện L4: co chân, nghe chuông đá cuối ngách (hear() = khoảng cách),
   *  bò hear() - 1 ô tới hòm sắt nằm ngay trước chuông, hút, bò ra, đứng lên, xuống hốc chứa D, thả. */
  var HD_11 = ['play_note(listen())'];
  var NHEN_11 = ['wait()', 'crouch()', 'k = hear() - 1', 'for i in range(k):', '    go_right()', 'pull_s()', 'for i in range(k):', '    go_left()', 'stand()', 'wait()', 'go_down()', 'magnet_off()', 'wait()'];

  /** lap-hang-dong.2 (ba sân): thang sắt đổ chắn lối xe hang động R1 (hàng 2) ở cột 3 / 5 / 4 tuỳ sân; chuông đá treo trên vách ngay trên cột thang (hàng 0) vang trong hang tối.
   *  R2 nhện đi hàng 1 (mặt quay xuống), dọn thang, mang về cờ cuối hàng 1. */
  function san12(x) { var h = '#.......F#'.split(''); h[x] = 'o'; return ['##########', '#.......F#', h.join(''), '##########']; }
  function vc12(x) { var h = '..........'.split(''); h[x] = 's'; return ['..........', '..........', h.join(''), '..........']; }
  var HD_12 = ['wait_n(14)', 'forward(7)'];
  /** Cách một (mic, L4): n = hear() là khoảng cách tới chuông = số cột của thang; bò n - 1 ô tới trên thang, bước xuống, clear_iron("U") (gói 3), bò 8 - n ô về cờ. */
  var NHEN_MIC_12 = ['n = hear()', 'for i in range(n - 1):', '    go_right()', 'go_down()', 'clear_iron("U")', 'for i in range(8 - n):', '    go_right()', 'magnet_off()', 'wait()'];
  /** Cách hai (cảm biến từ, mặt quay xuống): bò bảy ô về cờ, ô nào front_metal() thì bước xuống hút. */
  var NHEN_TU_12 = ['for i in range(7):', '    go_right()', '    if front_metal():', '        go_down()', '        clear_iron("U")', 'magnet_off()', 'wait()'];

  /** lap-hang-dong.3 (ba sân): ngã ba hang tối (4, 3), một nhánh lên, một nhánh xuống, cuối mỗi nhánh một cờ; nhánh sai có hố sụt mới. Chuông đá trong vách cạnh ngã ba
   *  vang một nốt (mỗi sân một nốt). Sổ đường d (bảng tra trong code): nốt → hướng ("U" lên, "D" xuống). Xe hang động R1 ở hang dưới hát vỡ đá chuông chắn lối nhện. */
  var D_13 = 'd = {2: "U", 4: "D", 6: "U"}';
  function san13(len) { return ['#######', '####F##', len ? '####.##' : '####u##', '#.u..##', len ? '####u##' : '####.##', '####F##', '#....F#', '#######']; }
  var HD_13 = ['forward(2)', 'play_note(listen())', 'forward(2)'];
  /** Nhện + mic (L4): chờ đá vỡ, bật qua hố sụt (2, 3) đáp chỗ đá vừa vỡ, bò tới ngã ba, nghe nốt chuông, tra sổ ra hướng, đi hai bước theo hướng đó tới cờ. */
  var NHEN_13 = [D_13, 'wait_n(2)', 'jump("R")', 'go_right()', 'n = listen()', 'go(d[n])', 'go(d[n])'];

  /** lap-hang-dong.4: thợ ảnh hang động kẹt cuối hang trên (8, 1) sau đá chuông B (7, 1); cửa đá (3, 1) trên lối về trạm, nút đè M (3, 2). Sông ngầm hàng 3, đá chuông A (2, 3) chắn luồng.
   *  Xe hang động R1 lên nút giữ cửa. R2 xuồng + loa + mic (L5): nghe nốt đá A, hát lại, chạy năm ô tới gần đá B (cách 3 ô), nghe, hát lại. */
  var HD_14 = ['forward(2)'];
  var XUONG_14 = ['play_note(listen())', 'forward(5)', 'play_note(listen())'];
  /** Cách hai rẻ hơn: xuồng + loa (không mic), hát thẳng nốt hai đá (4 rồi 7). */
  var XUONG_LOA_14 = ['play_note(4)', 'forward(5)', 'play_note(7)'];

  /** lap-hang-dong.5: hòm hàng của đội khảo sát kẹt sau đá chuông dày (8, 1) (ben 3: phải ngân 3 nhịp liền). Sông ngầm hàng 3 chảy sang phải (sức 1),
   *  xuồng không đứng lại được: chỉ ba ô (7..9, 3) ở trong tầm 3 ô của đá. R1 nhện nam châm (PL) bò qua đá vừa vỡ, hút hòm sắt (9, 1) về hốc D (1, 1).
   *  R1 KHÔNG có loa: lõi (apLoa) cho mọi robot có loa mà không phát trong nhịp đó đặt daNgan của đá về 0, nên đá ben > 1 chỉ vỡ khi chỉ một robot có loa. */
  var DONG_15 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(function (x) { return { x: x, y: 3, huong: 1, suc: 1 }; });
  /** Xuồng + loa: trôi theo dòng, vừa tới ô (7, 3) thì ngân nốt 6 ba nhịp liền: note(6, 3). */
  var XUONG_15 = ['wait_n(6)', 'note(6, 3)', 'wait()'];
  var PL_15 = ['for i in range(7):', '    go_right()', 'pull_s()', 'for i in range(8):', '    go_left()', 'magnet_off()', 'wait()'];
  /** Cách hai: xuồng + loa + mic, nghe nốt đá rồi ngân: n = listen(), note(n, 3). */
  var XUONG_MIC_15 = ['wait_n(6)', 'n = listen()', 'note(n, 3)', 'wait()'];

  function man9(chuong, so, hang, cfg) {
    var r1 = cfg.doi[0];
    var m = {
      chuong: chuong, so: so, ten: cfg.ten, hang: hang, vo: 'hang-dong', daLapHo: true,
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
       CHƯƠNG 1: cuu-hang-dong (10 màn)
       ======================================================================== */
    // 1 · show (giữ cửa): bão làm sụt một hố mới giữa hang dưới, cửa đá trên lối xe hang động đóng. Nhện bật qua hố sụt (jump("R")) đáp lên nút đè M: cửa đá mở.
    //     Nhện giữ nút tới khi xe hang động qua cửa, rồi bước sang cờ. Đội cố định HD + PL (chạy sẵn, khoá).
    man9('cuu-hang-dong', 1, 'lam-quen', {
      ten: 'Nhện giữ cửa đá',
      chiChay: true,
      deBai: 'Bão làm sụt một hố mới trong hang, cửa đá đóng lối xe hang động. Nhện bật qua hố, đứng lên nút giữ cửa mở. Bấm Chạy.',
      veMaMau: 'Bấm Chạy xem mỗi bạn làm gì.',
      san: ['#########', '#..C...F#', '###.uMF##', '#########'],
      noi: [{ nut: { x: 5, y: 2 }, cua: [{ x: 3, y: 1 }] }],
      doi: [may('HD', { x: 1, y: 1, huong: 1 }, { co: [{ x: 7, y: 1 }] }), may('PL', { x: 3, y: 2, huong: 1 }, { son: 'lam', co: [{ x: 6, y: 2 }] })],
      maMau: doiBai([HD_1, PL_1]),
      loiGiai: doiBai([HD_1, PL_1]),
      sao: { o: 28, nhip: 11 },
      goiY: ['jump("R"): nhện co chân, bật qua một ô (qua được hố) rồi đáp.', 'Nút đè chỉ giữ cửa mở khi có robot đứng trên nút.'],
      cauDo: { doi: ['HD', 'PL'], lap: null, coChe: ['ho', 'nhay', 'nut-de', 'cua'], cuu: 'hang', meo: 'giu-cua' }
    }),
    // 2 · dọn lối, ôn dict (ba sân, luật 13/11): bão làm đá chuông rơi chắn ngách hẹp của nhện; chuông đá trong hốc dưới hang xe vang một nốt, mỗi sân một nốt.
    //     Sổ ám hiệu d = {2: 5, 4: 7, 6: 3} là bảng tra trong code: nghe chuông nốt n thì đá chuông cần nốt d[n]. Xe hang động tiến tới trên hốc chuông, n = listen(),
    //     play_note(d[n]): đá vỡ; về cờ. Nhện co chân chui gầm đá thấp, qua chỗ đá vừa vỡ về cờ. Gõ lại nốt chuông (play_note(listen())) hay điền thẳng nốt sân 1 thì đá không vỡ.
    man9('cuu-hang-dong', 2, 'lam-quen', {
      ten: 'Sổ ám hiệu chuông đá',
      hamCuaEmCan: HAM_EM.concat(['crouch', 'stand']),
      deBai: 'Ba sân. Đá chuông chắn ngách của nhện. Chuông đá dưới hốc vang một nốt, mỗi sân một nốt. Sổ d: nghe nốt n thì đá cần nốt d[n]. Xe hang động nghe, tra sổ, hát cho đá vỡ.',
      veMaMau: 'Xe hang động có sổ d nhưng chưa nghe.',
      san: [san2(), san2(), san2()],
      them: { khoaTD: ['2', '4', '6'],
        chuongDa: [[{ x: 4, y: 4, not: 2 }], [{ x: 4, y: 4, not: 4 }], [{ x: 4, y: 4, not: 6 }]],
        daChuong: [[{ x: 4, y: 1, not: 5, ben: 1 }], [{ x: 4, y: 1, not: 7, ben: 1 }], [{ x: 4, y: 1, not: 3, ben: 1 }]] },
      doi: [khe({ x: 1, y: 3, huong: 1 }, { co: [{ x: 7, y: 3 }] }), khe({ x: 1, y: 1, huong: 1 }, { co: [{ x: 7, y: 1 }] })],
      chonDoi: {
        menu: ['HD', 'PL'],
        cachMau: [{ chon: ['HD', 'PL'], ghiChu: 'đôi tốt', loiGiai: doiBai([HD_2, PL_2]) }]
      },
      maMau: doiBai([[D_2, 'forward(3)'], []]),
      loiSai: [
        { moTa: 'Điền thẳng nốt của sân 1 (play_note(5)): sân 2, 3 đá không vỡ', baiLam: doiBai([[D_2, 'forward(3)', 'play_note(5)', 'forward(3)'], PL_2]), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Gõ lại nốt chuông (play_note(listen())), không tra sổ: đá không vỡ', baiLam: doiBai([[D_2, 'forward(3)', 'play_note(listen())', 'forward(3)'], PL_2]), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Nhện quên co chân: đâm gầm đá thấp', baiLam: doiBai([HD_2, ['wait()', 'go_right()', 'go_right()', 'wait_n(2)', 'for i in range(4):', '    go_right()']]), phaiCoMa: ['gam-thap'] }
      ],
      sao: { o: 23, nhip: 15 },
      goiY: ['n = listen(): nốt của nguồn tiếng gần nhất (ở đây là chuông đá dưới hốc).', 'd[n]: tra sổ, nốt mà đá chuông cần.', 'Đá chuông vỡ khi nghe đúng nốt trong tầm 3 ô.'],
      cauDo: { doi: ['HD', 'PL'], lap: null, coChe: ['da-chuong', 'chuong-da', 'not', 'gam', 'dict'], cuu: 'hang', meo: 'don-loi' }
    }),
    // 3 · giữ cửa (bẫy drone): hang dài sau bão, hai hố sụt nối nhau trên lối nhện, nút đè M nằm sau hố thứ hai; cửa đá C chắn lối xe hang động trên sàn đá ướt.
    //     Nhện bật qua hai hố lên nút, giữ cửa mở tới khi xe qua. Bẫy: drone (bay qua hố được nhưng không đè nút: bay thì không nặng lên nút).
    man9('cuu-hang-dong', 3, 'luyen', {
      ten: 'Hai hố trước nút',
      deBai: 'Cửa đá chắn lối xe hang động. Nút giữ cửa nằm sau hai hố sụt. Chọn hai bạn: ai qua hai hố đứng lên nút, ai bám đá ướt qua cửa?',
      veMaMau: 'Cửa đá còn đóng.',
      san: ['##########', '#..IIC..F#', '##########', '#.u.u.MF.#', '##########'],
      noi: [{ nut: { x: 6, y: 3 }, cua: [{ x: 5, y: 1 }] }],
      doi: [khe({ x: 1, y: 1, huong: 1 }, { co: [{ x: 8, y: 1 }] }), khe({ x: 1, y: 3, huong: 1 }, { co: [{ x: 7, y: 3 }] })],
      chonDoi: {
        menu: ['HD', 'PL', 'DR'],
        cachMau: [{ chon: ['HD', 'PL'], ghiChu: 'đôi tốt', loiGiai: doiBai([HD_3, PL_3]) }]
      },
      maMau: doiBai([['wait_n(7)'], ['jump("R")']]),
      loiSai: [
        { moTa: 'Nhện nhảy một lần rồi đi bộ: rơi hố thứ hai', baiLam: doiBai([HD_3, ['jump("R")', 'go_right()', 'go_right()', 'go_right()', 'wait_n(4)', 'go_right()']]), phaiCoMa: ['roi-ho'] },
        { moTa: 'Nhện rời nút ngay: cửa đóng trước mũi xe', baiLam: doiBai([HD_3, ['jump("R")', 'jump("R")', 'go_right()', 'go_right()']]), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Xe không chờ: tới cửa khi cửa còn đóng', baiLam: doiBai([['forward(7)'], PL_3]), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 30, nhip: 17 },
      goiY: ['jump("R") hai lần: qua hai hố.', 'Nút đè chỉ giữ cửa mở khi có robot đứng trên nút.', 'Drone bay thì không đè nút.'],
      cauDo: { doi: ['HD', 'PL'], lap: null, coChe: ['ho', 'hai-ho', 'nhay', 'nut-de', 'cua', 'da-uot'], cuu: 'hang', meo: 'giu-cua' }
    }),
    // 4 · giữ cửa, ngách hang: bão làm đá lở bít lối vào buồng nút; chỉ còn ngách hang ngầm (hai miệng cùng màu) nối hang ngoài với buồng kín. Nhện đi vào miệng ngách,
    //     chui ra miệng kia trong buồng, lên nút đè M, giữ cửa đá mở tới khi xe hang động qua, sang cờ. Bảng 2 cỗ máy (đúng đôi tốt).
    man9('cuu-hang-dong', 4, 'luyen', {
      ten: 'Ngách vào buồng nút',
      deBai: 'Đá lở bít lối vào buồng có nút giữ cửa đá. Chỉ còn ngách hang: bước vào miệng này, chui ra miệng kia cùng màu. Nhện vào buồng giữ nút cho xe hang động qua cửa.',
      veMaMau: 'Cửa đá còn đóng.',
      san: ['##########', '#.....C.F#', '##########', '#...#.MF##', '##########'],
      noi: [{ nut: { x: 6, y: 3 }, cua: [{ x: 6, y: 1 }] }],
      them: { ngachHang: [{ a: { x: 3, y: 3 }, b: { x: 5, y: 3 } }] },
      doi: [khe({ x: 1, y: 1, huong: 1 }, { co: [{ x: 8, y: 1 }] }), khe({ x: 1, y: 3, huong: 1 }, { co: [{ x: 7, y: 3 }] })],
      chonDoi: {
        menu: ['HD', 'PL'],
        cachMau: [{ chon: ['HD', 'PL'], ghiChu: 'đôi tốt', loiGiai: doiBai([HD_4, PL_4]) }]
      },
      maMau: doiBai([['wait_n(4)'], ['go_right()']]),
      loiSai: [
        { moTa: 'Nhện rời nút ngay: cửa đóng trước mũi xe', baiLam: doiBai([HD_4, ['go_right()', 'go_right()', 'go_right()', 'go_right()']]), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Xe không chờ: tới cửa khi cửa còn đóng', baiLam: doiBai([['forward(7)'], PL_4]), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 17, nhip: 14 },
      goiY: ['Bước vào miệng ngách là chui ra miệng kia cùng màu, giữ hướng.', 'Nút đè chỉ giữ cửa mở khi có robot đứng trên nút.'],
      cauDo: { doi: ['HD', 'PL'], lap: null, coChe: ['ngach', 'nut-de', 'cua'], cuu: 'hang', meo: 'giu-cua' }
    }),
    // 5 · cứu người, dọn lối + cứu kịp: sông ngầm dâng sau bão, nhà thám hiểm (áo phao) kẹt dưới vách đá cuối luồng, không có bờ để lên; đá chuông rơi chắn luồng.
    //     Xe hang động tiến một ô, listen() rồi hát lại: đá vỡ. Xuồng qua chỗ đá, tung lưới kéo người lùi về dưới bờ đá; người tự lên bờ về trạm cứu.
    //     Bẫy: robot phân loại (nhện không bơi, không hát). Khe thứ hai: xuồng xuất phát trong luồng, cỗ máy khác đứng ở hốc dưới.
    man9('cuu-hang-dong', 5, 'cung-co', {
      ten: 'Người dưới vách sông ngầm',
      mucTieu: 'cuu-nguoi',
      deBai: 'Sông ngầm dâng, nhà thám hiểm kẹt dưới vách đá cuối luồng. Đá chuông chắn luồng. Chọn hai bạn: ai hát vỡ đá, ai kéo người về dưới bờ đá cho người lên trạm cứu?',
      veMaMau: 'Đá chuông còn chắn luồng.',
      san: ['##########', '#.....####', '#~~~~~~~~#', '#.########', '##########'],
      them: { daChuong: [{ x: 4, y: 2, not: 6, ben: 1 }], nguoi: [{ x: 7, y: 2 }], tramCuu: [{ x: 3, y: 1 }] },
      doi: [khe({ x: 1, y: 1, huong: 1 }, { batDauNuoc: { x: 3, y: 2, huong: 1 } }), khe({ x: 1, y: 3, huong: 0 }, { batDauNuoc: { x: 1, y: 2, huong: 1 } })],
      chonDoi: {
        menu: ['HD', 'XU', 'PL'],
        cachMau: [{ chon: ['HD', 'XU'], ghiChu: 'đôi tốt', loiGiai: doiBai([HD_5, XU_5]) }]
      },
      maMau: doiBai([['forward(1)'], ['wait_n(2)']]),
      loiSai: [
        { moTa: 'Xe hang động hát ngay chỗ xuất phát: xa đá 4 ô, đá không vỡ', baiLam: doiBai([['play_note(listen())'], XU_5]), phaiCoMa: ['chua-cuu-nguoi'] },
        { moTa: 'Xuồng lùi một ô: người còn dưới vách, không lên bờ được', baiLam: doiBai([HD_5, XU_5.slice(0, 5)]), phaiCoMa: ['chua-cuu-nguoi'] },
        { moTa: 'Xuồng chạy sát người rồi mới tung lưới: lưới dài 2 ô, vướng người', baiLam: doiBai([HD_5, ['wait_n(2)', 'forward(5)', 'cast_net()', 'wait()', 'back()', 'back()', 'back()']]), phaiCoMa: ['chua-cuu-nguoi'] }
      ],
      sao: { o: 23, nhip: 13 },
      goiY: ['listen(): nốt của đá chuông gần nhất.', 'cast_net(): lưới dài 2 ô, bắt người cách mũi xuồng đúng 2 ô; back(): kéo người theo.', 'Người được kéo tới ô nước sát bờ thì tự lên bờ, đi về trạm cứu.'],
      cauDo: { doi: ['HD', 'XU'], lap: null, coChe: ['song-ngam', 'da-chuong', 'not', 'nguoi', 'luoi'], cuu: 'nguoi', meo: 'cuu-kip' }
    }),
    // 6 · làm cầu, cứu người: sông ngầm dâng cuốn cầu phao ra giữa dòng; nhà thám hiểm kẹt ở bờ bên kia sau một khối đá chuông (xa bờ này hơn 3 ô). Đá chuông thứ hai rơi chắn luồng ở mép bờ.
    //     Xe hang động hát vỡ đá chắn luồng; xuồng kéo bè vào bến q làm cầu phao; xe lên cầu, nghe nốt, hát vỡ đá bên kia; người về trạm cứu. Bẫy: xe chở hàng (không bơi, không hát).
    man9('cuu-hang-dong', 6, 'cung-co', {
      ten: 'Cầu phao trên sông ngầm',
      mucTieu: 'cuu-nguoi',
      deBai: 'Sông ngầm cuốn cầu phao ra giữa dòng. Nhà thám hiểm kẹt bên kia sau đá chuông, xa bờ này. Đá chuông khác chắn luồng ở mép bờ. Chọn hai bạn: ai hát, ai kéo bè vào bến q làm cầu?',
      veMaMau: 'Bè còn trôi giữa sông.',
      san: ['##########', '####....##', '#~~~q~B~##', '#....#####', '##########'],
      them: { daChuong: [{ x: 2, y: 2, not: 2, ben: 1 }, { x: 6, y: 1, not: 7, ben: 1 }], nguoi: [{ x: 7, y: 1 }], tramCuu: [{ x: 4, y: 1 }] },
      doi: [khe({ x: 2, y: 3, huong: 1 }, { batDauNuoc: { x: 3, y: 2, huong: 1 } }), khe({ x: 1, y: 3, huong: 0 }, { batDauNuoc: { x: 1, y: 2, huong: 1 } })],
      chonDoi: {
        menu: ['HD', 'XU', 'CH'],
        cachMau: [{ chon: ['HD', 'XU'], ghiChu: 'đôi tốt', loiGiai: doiBai([HD_6, XU_6]) }]
      },
      maMau: doiBai([['play_note(listen())'], ['wait()']]),
      loiSai: [
        { moTa: 'Xuồng lùi một ô: bè dừng trước bến, xe không lên cầu được', baiLam: doiBai([HD_6, ['wait()', 'forward(3)', 'cast_net()', 'wait()', 'back()', 'drop_net()', 'wait()']]), phaiCoMa: ['chua-cuu-nguoi'] },
        { moTa: 'Xe hang động hát ở bờ: đá bên kia xa 4 ô, không vỡ', baiLam: doiBai([['play_note(listen())', 'forward(2)', 'turn_left()', 'wait_n(4)', 'play_note(listen())'], XU_6]), phaiCoMa: ['chua-cuu-nguoi'] },
        { moTa: 'Xe hang động không chờ bè: đâm mặt nước, hát từ bờ', baiLam: doiBai([['play_note(listen())', 'forward(2)', 'turn_left()', 'forward(1)', 'play_note(listen())'], XU_6]), phaiCoMa: ['chua-cuu-nguoi'] }
      ],
      sao: { o: 33, nhip: 14 },
      goiY: ['Bè nằm trên bến q là cầu phao: xe đi lên được.', 'cast_net(): lưới dài 2 ô bắt bè; back(): kéo bè theo.', 'Loa phá đá trong tầm 3 ô quanh xe.'],
      cauDo: { doi: ['HD', 'XU'], lap: null, coChe: ['song-ngam', 'be', 'luoi', 'da-chuong', 'not', 'nguoi'], cuu: 'nguoi', meo: 'lam-cau' }
    }),
    // 7 · cứu máy, làm cầu + giữ cửa: xe hang động khách (R3, khoá) kẹt sau hố sụt mới và cửa đá; nó chỉ chờ ba nhịp rồi chạy thẳng. Máy khai thác hất đá tròn lấp hố,
    //     nhện lên nút đè giữ cửa đá tới khi máy khách qua. Bẫy: cần cẩu (không lấp hố, không đè nút). Bảng có cẩu nên mọi khe trên dải ray.
    man9('cuu-hang-dong', 7, 'van-dung', {
      ten: 'Máy khách sau hố sụt',
      deBai: 'Xe hang động khách kẹt sau hố sụt mới và cửa đá. Đọc chương trình của nó rồi chọn hai bạn: ai lấp hố, ai giữ cửa? Ba bạn về cờ.',
      veMaMau: 'Đọc chương trình của máy khách: chờ 3 nhịp rồi đi.',
      san: ['##########', '#...u.C.F#', '#...oFMF.#', '#RRRRRRR.#', '##########'],
      noi: [{ nut: { x: 6, y: 2 }, cua: [{ x: 6, y: 1 }] }],
      them: { vatDang: ['..........', '..........', '....r.....', '..........', '..........'] },
      doi: [khe({ x: 4, y: 3, huong: 0 }, { co: [{ x: 5, y: 2 }] }), khe({ x: 6, y: 3, huong: 0 }, { co: [{ x: 7, y: 2 }] }),
        may('HD', { x: 1, y: 1, huong: 1 }, { son: 'tim', coDinh: true, co: [{ x: 8, y: 1 }] })],
      chonDoi: {
        menu: ['PL', 'KT', 'CC'],
        cachMau: [{ chon: ['KT', 'PL'], ghiChu: 'đôi tốt', loiGiai: doiBai([KT_7, PL_7, HD_R3_7]) }]
      },
      maMau: doiBai([[], [], HD_R3_7]),
      loiSai: [
        { moTa: 'Không lấp hố: máy khách rơi hố', baiLam: doiBai([['wait()', 'forward(1)'], PL_7, HD_R3_7]), phaiCoMa: ['roi-ho'] },
        { moTa: 'Nhện rời nút sớm: cửa đá đóng trước mũi máy khách', baiLam: doiBai([KT_7, ['go_up()', 'go_right()'], HD_R3_7]), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 26, nhip: 12 },
      goiY: ['Đọc chương trình của máy khách: nó tới hố, tới cửa lúc nào?', 'lob(): xúc đá trước mũi rồi hất xa 2 ô; đá rơi xuống hố thì lấp hố.', 'Nút đè chỉ giữ cửa mở khi có robot đứng trên nút.'],
      cauDo: { doi: ['KT', 'PL'], lap: null, coChe: ['ho', 'da-tron', 'nem', 'nut-de', 'cua', 'ray', 'r3'], cuu: 'may', meo: 'giu-cua' }
    }),
    // 8 · cứu máy, dọn lối + giữ cửa: xe hang động khách (R3, khoá) chờ bốn nhịp rồi chạy thẳng dọc lối hang. Bão làm thạch nhũ đổ (thùng nặng) chắn lối, cửa đá đóng;
    //     nút giữ cửa nằm sau một hố sụt. Xe cứu hỏa ủi thạch nhũ lên hốc rồi lùi về cờ; nhện bật qua hố giữ nút. Bẫy: drone (không ủi, bay thì không đè nút).
    man9('cuu-hang-dong', 8, 'van-dung', {
      ten: 'Thạch nhũ đổ chắn lối',
      deBai: 'Xe hang động khách chờ bốn nhịp rồi chạy thẳng về cờ. Thạch nhũ đổ chắn lối, cửa đá đóng, nút giữ cửa nằm sau hố sụt. Chọn hai bạn mở đường kịp. Ba bạn về cờ.',
      veMaMau: 'Đọc chương trình của máy khách: chờ 4 nhịp rồi đi.',
      san: ['##########', '###.######', '#..H..C.F#', '###.##.###', '#..F.uMF.#', '##########'],
      noi: [{ nut: { x: 6, y: 4 }, cua: [{ x: 6, y: 2 }] }],
      doi: [khe({ x: 3, y: 3, huong: 0 }, { co: [{ x: 3, y: 4 }] }), khe({ x: 4, y: 4, huong: 1 }, { co: [{ x: 7, y: 4 }] }),
        may('HD', { x: 1, y: 2, huong: 1 }, { son: 'tim', coDinh: true, co: [{ x: 8, y: 2 }] })],
      chonDoi: {
        menu: ['PL', 'CU', 'DR'],
        cachMau: [{ chon: ['CU', 'PL'], ghiChu: 'đôi tốt', loiGiai: doiBai([CU_8, PL_8, HD_R3_8]) }]
      },
      maMau: doiBai([[], [], HD_R3_8]),
      loiSai: [
        { moTa: 'Xe cứu hỏa ủi xong đứng lại giữa lối: máy khách vướng', baiLam: doiBai([['forward(1)'], PL_8, HD_R3_8]), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Nhện rời nút sớm: cửa đá đóng trước mũi máy khách', baiLam: doiBai([CU_8, ['jump("R")', 'go_right()'], HD_R3_8]), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 35, nhip: 13 },
      goiY: ['Đọc chương trình của máy khách: nó tới thạch nhũ, tới cửa lúc nào?', 'Xích tiến vào thùng nặng thì đẩy thùng đi một ô.', 'jump("R"): nhện bật qua hố.'],
      cauDo: { doi: ['CU', 'PL'], lap: null, coChe: ['thung-nang', 'thach-nhu', 'ho', 'nhay', 'nut-de', 'cua', 'r3'], cuu: 'may', meo: 'don-loi' }
    }),
    // 9 · cứu máy, phong phú (ba sân), nhắc G3 (clear_iron), G5 (xuồng kéo bè), #2 (sổ ám hiệu dict): xuồng khách (R3, khoá) kéo bè hàng ra bến q, chờ chín nhịp rồi chạy thẳng.
    //     Đá chuông rơi chắn luồng sông ngầm; chỗ duy nhất hát tới đá là bờ trên, nhưng thang sắt đổ chắn lối. Nhện bước xuống thang, clear_iron("U") hút rồi bước lên, thả vào hốc chứa D.
    //     Xe hang động tới chỗ hát, n = listen() (chuông đá trên hốc, mỗi sân một nốt), play_note(d[n]). Bẫy: drone (không hút sắt, không hát).
    man9('cuu-hang-dong', 9, 'bien-the', {
      ten: 'Xuồng khách trên sông ngầm',
      mucTieu: 'dua-vat',
      khung: { chinh: 14, moiHam: 8 },
      hamCuaEmCan: HAM_EM.concat(['clear_iron']),
      deBai: 'Ba sân. Xuồng khách kéo bè hàng, chờ 9 nhịp rồi chạy ra bến q. Đá chuông chắn luồng, thang sắt đổ chắn lối tới chỗ hát. Chọn hai bạn. Nhớ clear_iron(d) và sổ d.',
      veMaMau: 'Đọc chương trình của xuồng khách: chờ 9 nhịp rồi forward(6).',
      san: [san9(), san9(), san9()],
      them: { khoaTD: ['1', '3', '5'], vatChat: [VC_9, VC_9, VC_9],
        chuongDa: [[{ x: 4, y: 1, not: 1 }], [{ x: 4, y: 1, not: 3 }], [{ x: 4, y: 1, not: 5 }]],
        daChuong: [[{ x: 5, y: 4, not: 4, ben: 1 }], [{ x: 5, y: 4, not: 8, ben: 1 }], [{ x: 5, y: 4, not: 6, ben: 1 }]] },
      doi: [khe({ x: 1, y: 2, huong: 1 }), khe({ x: 3, y: 1, huong: 2 }),
        may('XU', { x: 2, y: 4, huong: 1 }, { son: 'tim', coDinh: true })],
      chonDoi: {
        menu: ['HD', 'PL', 'DR'],
        cachMau: [{ chon: ['HD', 'PL'], ghiChu: 'đôi tốt', loiGiai: doiBai([HD_9, PL_9, XU_R3_9]) }]
      },
      maMau: doiBai([[D_9], [], XU_R3_9]),
      loiSai: [
        { moTa: 'Điền thẳng nốt của sân 1 (play_note(4)): sân 2, 3 đá không vỡ', baiLam: doiBai([[D_9, 'wait_n(5)', 'forward(3)', 'play_note(4)'], PL_9, XU_R3_9]), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Không dọn thang sắt: xe hang động đứng xa đá, hát không tới', baiLam: doiBai([HD_9, [], XU_R3_9]), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Nhện hút thang rồi thả ngay trên lối: xe vướng thang', baiLam: doiBai([HD_9, ['go_down()', 'pull_s()', 'magnet_off()', 'wait()', 'go_up()'], XU_R3_9]), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 43, nhip: 19 },
      goiY: ['Đọc chương trình của xuồng khách: nó tới đá chuông lúc nào?', 'clear_iron(d): hút sắt rồi bước d (hàm em viết ở Bãi tái chế).', 'n = listen() rồi play_note(d[n]): tra sổ.'],
      cauDo: { doi: ['HD', 'PL'], lap: null, coChe: ['song-ngam', 'be', 'da-chuong', 'chuong-da', 'dict', 'sat', 'r3'], cuu: 'may', meo: 'don-loi' }
    }),
    // 10 · song ca đoạn 8 (Bè 1: 4 4 3 3 2 2 1 1 | Bè 2: 6 6 5 5 4 4 3 3), giữ cho gói 10 ghép bài; dùng play_part (cuu-kho-hang.10 tạo).
    //      Xe hang động hát bè 1; nhện lắp loa thay nam châm (lai L7) hát bè 2 (bè 2 cao hơn bè 1 một quãng ba). Hai khối đá chuông còn sót trong hang vỡ khi nghe nốt
    //      của mình (chỉ để nhìn). Đội cố định (tay loa không có trên bảng chọn).
    man9('cuu-hang-dong', 10, 'trum', {
      ten: 'Song ca hang động',
      mucTieu: 'choi-dieu',
      deBai: 'Hang động đã thông! Nhện lắp loa thay nam châm, xe hang động hát cùng: song ca đoạn 8. Mỗi bạn gọi play_part với bè của mình.',
      veMaMau: 'Bè 2 mới có một nốt.',
      hamCuaEmCan: ['play_note', 'play_part'],
      san: ['######', '#....#', '#....#', '######'],
      doi: [may('HD', { x: 1, y: 1, huong: 1 }),
        may('PL', { x: 1, y: 2, huong: 1 }, { son: 'lam', tay: 'loa', boHam: ['magnet_n', 'magnet_s', 'magnet_off', 'front_metal', 'front_pole'], themHam: ['note', 'beat'], phatNot: true })],
      them: { dieu: { r1: '4 4 3 3 2 2 1 1', r2: '6 6 5 5 4 4 3 3' }, daChuong: [{ x: 4, y: 1, not: 2, ben: 1 }, { x: 4, y: 2, not: 5, ben: 1 }] },
      maMau: doiBai([['play_part([4, 4, 3, 3, 2, 2, 1, 1])'], ['play_note(6)']]),
      loiGiai: doiBai([['play_part([4, 4, 3, 3, 2, 2, 1, 1])'], ['play_part([6, 6, 5, 5, 4, 4, 3, 3])']]),
      loiSai: [
        { moTa: 'Bè 2 mới phát một nốt', baiLam: doiBai([['play_part([4, 4, 3, 3, 2, 2, 1, 1])'], ['play_note(6)']]), phaiCoMa: ['lo-nhip'] },
        { moTa: 'Bè 2 đảo hai nốt giữa', baiLam: doiBai([['play_part([4, 4, 3, 3, 2, 2, 1, 1])'], ['play_part([6, 6, 5, 4, 5, 4, 3, 3])']]), phaiCoMa: ['sai-not'] }
      ],
      sao: { o: 7, nhip: 10 },
      goiY: ['Bè 2: play_part([6, 6, 5, 5, 4, 4, 3, 3]).'],
      cauDo: { doi: ['HD', 'PL'], lap: null, coChe: ['loa', 'da-chuong', 'hang-dong'], cuu: null, meo: 'song-song' }
    }),
    /* ========================================================================
       CHƯƠNG 2: lap-hang-dong (10 màn)
       ======================================================================== */
    // 11 · show (đọc rồi chọn), lai L4 nhện + nam châm + mic (ra mắt): ngách gầm thấp tối om, hòm dụng cụ sắt kẹt ở cuối ngách, ngay trước một chuông đá đang vang.
    //      Xe hang động R1 hát vỡ đá chuông chắn miệng ngách. Luna lắp sẵn nhện + nam châm + mic (khoá): co chân, hear() đo xa tới chuông, bò hear() - 1 ô tới hòm, hút, bò ra, thả vào D.
    man9('lap-hang-dong', 1, 'lam-quen', {
      ten: 'Nhện nghe chuông trong ngách',
      chiChay: true,
      khung: { chinh: 14, moiHam: 8 },
      mucTieu: 'dua-vat',
      deBai: 'Hòm dụng cụ sắt kẹt cuối ngách gầm thấp tối om, ngay trước chuông đá đang vang. Luna lắp cho nhện một cái mic: nghe chuông để biết hòm ở xa bao nhiêu. Bấm Chạy.',
      veMaMau: 'Bấm Chạy xem nhện nghe chuông.',
      san: ['#########', '#..nno..#', '#D#######', '#.......#', '#########'],
      them: { vatChat: ['.........', '.....s...', '.........', '.........', '.........'], chuongDa: [{ x: 6, y: 1, not: 3 }], daChuong: [{ x: 2, y: 1, not: 6, ben: 1 }] },
      doi: [may('HD', { x: 1, y: 3, huong: 1 }), Object.assign({ batDau: { x: 1, y: 1, huong: 1 } }, clone(NHEN_MIC))],
      maMau: doiBai([HD_11, NHEN_11]),
      loiGiai: doiBai([HD_11, NHEN_11]),
      sao: { o: 21, nhip: 26 },
      goiY: ['hear(): khoảng cách (số ô) tới nguồn tiếng gần nhất.', 'Mic không cần mũi: nhện gắn được.', 'pull_s(): hút sắt dưới bụng nhện.'],
      cauDo: { doi: null, lap: 'nhen+nam-cham+am-thanh', coChe: ['gam', 'ngach', 'chuong-da', 'da-chuong', 'sat', 'mic'], cuu: 'hang', meo: 'doc-roi-chon' }
    }),
    // 12 · đọc rồi chọn (ba sân), ép đổi cảm biến: thang sắt đổ chắn lối xe hang động R1, mỗi sân một cột; chuông đá treo trên vách ngay trên cột thang vang trong hang tối.
    //      R2 nhện + nam châm, chọn cảm biến: mic (hear() = khoảng cách tới chuông = cột thang, rồi bò đúng số ô) hay cảm biến từ (bò từng ô, front_metal() thì xuống hút).
    //      Nhện bò hàng trên, bước xuống thang, clear_iron("U") (gói 3), mang về cờ. R1 chờ rồi chạy qua lối đã dọn.
    man9('lap-hang-dong', 2, 'lam-quen', {
      ten: 'Thang sắt dưới chuông',
      khung: { chinh: 14, moiHam: 8 },
      hamCuaEmCan: HAM_EM.concat(['clear_iron']),
      deBai: 'Ba sân. Thang sắt đổ chắn lối xe hang động, mỗi sân một cột. Chuông đá treo ngay trên cột thang. Lắp nhện + nam châm, chọn cảm biến để tìm thang, mang thang về cờ cuối hàng trên.',
      veMaMau: 'R2 chưa có chương trình.',
      san: [san12(3), san12(5), san12(4)],
      them: { vatChat: [vc12(3), vc12(5), vc12(4)], chuongDa: [[{ x: 3, y: 0, not: 4 }], [{ x: 5, y: 0, not: 4 }], [{ x: 4, y: 0, not: 4 }]] },
      doi: [may('HD', { x: 1, y: 2, huong: 1 }, { co: [{ x: 8, y: 2 }] }), khe({ x: 1, y: 1, huong: 2 }, { son: 'lam', co: [{ x: 8, y: 1 }] })],
      lapRap: lapR2(['nhen'], ['nam-cham'], ['am-thanh', 'tu'], 10, [
        cach('nhen', 'nam-cham', 'am-thanh', [HD_12, NHEN_MIC_12]),
        cach('nhen', 'nam-cham', 'tu', [HD_12, NHEN_TU_12])
      ], { moLai: ['L4'] }),
      maMau: doiBai([HD_12, ['n = hear()']]),
      loiSai: [
        { moTa: 'Điền thẳng cột của sân 1 (cột 3): sân 2, 3 thang còn chắn lối', baiLam: doiBai([HD_12, ['go_right()', 'go_right()', 'go_down()', 'clear_iron("U")', 'for i in range(5):', '    go_right()', 'magnet_off()', 'wait()']]), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Bò n ô (quên trừ 1): nhện đi quá cột thang', baiLam: doiBai([HD_12, ['n = hear()', 'for i in range(n):', '    go_right()', 'go_down()', 'clear_iron("U")', 'for i in range(7 - n):', '    go_right()', 'magnet_off()', 'wait()']]), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 35, nhip: 25 },
      goiY: ['hear(): số ô tới chuông. Chuông ở hàng trên vách, nên hear() bằng số cột của thang.', 'clear_iron(d): hút sắt rồi bước d (hàm em viết ở Bãi tái chế).', 'Mặt nhện quay xuống: front_metal() đọc ô ngay dưới.'],
      cauDo: { doi: null, lap: 'nhen+nam-cham+am-thanh', coChe: ['sat', 'chuong-da', 'mic', 'thang'], cuu: 'hang', meo: 'doc-roi-chon' }
    }),
    // 13 · đọc rồi chọn (ba sân), ôn dict: nhện + mic (L4) bò tới ngã ba hang tối; chuông đá trong vách cạnh ngã ba vang một nốt, mỗi sân một nốt. Sổ đường d = {2: "U", 4: "D", 6: "U"}
    //      tra nốt ra hướng: n = listen(), go(d[n]) hai lần tới cờ; nhánh sai có hố sụt mới. Xe hang động R1 hát vỡ đá chuông chắn lối nhện rồi về cờ; nhện bật qua hố sụt đầu hang.
    //      Cách hai: thêm nam châm (đắt hơn, cùng chương trình). Điền thẳng hướng sân 1 ("U") thì sân 2 rơi hố.
    man9('lap-hang-dong', 3, 'luyen', {
      ten: 'Sổ đường ngã ba',
      khung: { chinh: 14, moiHam: 8 },
      hamCuaEmCan: HAM_EM.concat(['go']),
      deBai: 'Ba sân. Ngã ba hang tối, một nhánh có hố sụt mới. Chuông đá cạnh ngã ba vang một nốt, mỗi sân một nốt. Sổ d: nốt → hướng. Lắp robot nghe nốt, tra sổ, đi đúng nhánh tới cờ.',
      veMaMau: 'Nhện có sổ d nhưng chưa nghe.',
      san: [san13(true), san13(false), san13(true)],
      them: { khoaTD: ['2', '4', '6'], daChuong: [{ x: 3, y: 3, not: 5, ben: 1 }],
        chuongDa: [[{ x: 5, y: 3, not: 2 }], [{ x: 5, y: 3, not: 4 }], [{ x: 5, y: 3, not: 6 }]] },
      doi: [may('HD', { x: 1, y: 6, huong: 1 }, { co: [{ x: 5, y: 6 }] }), khe({ x: 1, y: 3, huong: 1 }, { son: 'lam', co: [{ x: 4, y: 1 }, { x: 4, y: 5 }] })],
      lapRap: lapR2(['nhen', 'gai'], ['nam-cham'], ['am-thanh'], 9, [
        cach('nhen', null, 'am-thanh', [HD_13, NHEN_13]),
        cach('nhen', 'nam-cham', 'am-thanh', [HD_13, NHEN_13])
      ], { moLai: ['L4'] }),
      maMau: doiBai([HD_13, [D_13]]),
      loiSai: [
        { moTa: 'Điền thẳng hướng của sân 1 ("U"): sân 2 rơi hố', baiLam: doiBai([HD_13, [D_13, 'wait_n(2)', 'jump("R")', 'go_right()', 'go_up()', 'go_up()']]), phaiCoMa: ['roi-ho'] },
        { moTa: 'Đi theo nốt (go(n)), không tra sổ: lệnh đi không hiểu số', baiLam: doiBai([HD_13, [D_13, 'wait_n(2)', 'jump("R")', 'go_right()', 'n = listen()', 'go(n)', 'go(n)']]), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đi một bước theo sổ: nhện dừng giữa nhánh, chưa tới cờ', baiLam: doiBai([HD_13, [D_13, 'wait_n(2)', 'jump("R")', 'go_right()', 'n = listen()', 'go(d[n])']]), phaiCoMa: ['chua-toi-co'] }
      ],
      sao: { o: 36, nhip: 13 },
      goiY: ['n = listen(): nốt chuông gần nhất. d[n]: hướng trong sổ.', 'go("U"): nhện bước lên; go("D"): bước xuống.', 'Bánh gai không đi lên, đi xuống mà không quay.'],
      cauDo: { doi: null, lap: 'nhen++am-thanh', coChe: ['chuong-da', 'da-chuong', 'dict', 'nga-ba', 'ho', 'nhay'], cuu: 'hang', meo: 'doc-roi-chon' }
    }),
    // 14 · dọn lối, cứu người, lai L5 xuồng + loa + mic (ra mắt): thợ ảnh hang động kẹt cuối hang trên sau một khối đá chuông; bánh gai không tới gần được (vách dày, sông ngầm ở dưới).
    //      Đá chuông thứ hai chắn luồng sông ngầm. R2 lắp xuồng + loa + mic: nghe, hát vỡ đá chắn luồng, chạy tới gần đá kia, nghe, hát lại. Xe hang động R1 đứng nút giữ cửa đá
    //      trên lối người về trạm. Cách hai rẻ hơn: xuồng + loa, hát thẳng hai nốt.
    man9('lap-hang-dong', 4, 'luyen', {
      ten: 'Xuồng hát trên sông ngầm',
      mucTieu: 'cuu-nguoi',
      deBai: 'Thợ ảnh kẹt cuối hang sau đá chuông. Sông ngầm bên dưới, đá chuông khác chắn luồng. Lắp xuồng có loa hát vỡ hai đá. Xe hang động giữ nút cho cửa đá mở trên lối về trạm.',
      veMaMau: 'R2 chưa có chương trình.',
      san: ['##########', '#..C.....#', '#..M######', '#~~~~~~~~#', '##########'],
      noi: [{ nut: { x: 3, y: 2 }, cua: [{ x: 3, y: 1 }] }],
      them: { daChuong: [{ x: 2, y: 3, not: 4, ben: 1 }, { x: 7, y: 1, not: 7, ben: 1 }], nguoi: [{ x: 8, y: 1 }], tramCuu: [{ x: 1, y: 1 }] },
      doi: [may('HD', { x: 1, y: 2, huong: 1 }), khe({ x: 1, y: 3, huong: 1 }, { son: 'lam', chinhLuoi: false })],   // chinhLuoi: false: xuồng lắp loa không có tay lưới (lộ trình bật chinhLuoi mặc định cho mọi xuồng)
      lapRap: lapR2(['xuong', 'gai'], ['loa'], ['am-thanh'], 10, [
        cach('xuong', 'loa', 'am-thanh', [HD_14, XUONG_14]),
        cach('xuong', 'loa', null, [HD_14, XUONG_LOA_14])
      ], { moLai: ['L5'] }),
      maMau: doiBai([HD_14, []]),
      loiSai: [
        { moTa: 'Xuồng hát đá kia ở xa (chạy ba ô): cách 5 ô, đá không vỡ', baiLam: doiBai([HD_14, ['play_note(listen())', 'forward(3)', 'play_note(listen())']]), phaiCoMa: ['chua-cuu-nguoi'] },
        { moTa: 'Xe hang động không giữ nút: cửa đá đóng trên lối người', baiLam: doiBai([['forward(1)'], XUONG_14]), phaiCoMa: ['chua-cuu-nguoi'] },
        { moTa: 'Xuồng chạy ngay: đâm đá chắn luồng', baiLam: doiBai([HD_14, ['forward(5)', 'play_note(listen())']]), phaiCoMa: ['chua-cuu-nguoi'] }
      ],
      sao: { o: 13, nhip: 15 },
      goiY: ['Xuồng + loa: hát như xe có bánh, đá chuông trên mặt nước vỡ thì thành nước đi được.', 'Loa phá đá trong tầm 3 ô quanh xuồng.', 'Người chỉ bước khi ô kế trên lối trống.'],
      cauDo: { doi: null, lap: 'xuong+loa+am-thanh', coChe: ['song-ngam', 'da-chuong', 'not', 'nguoi', 'nut-de', 'cua'], cuu: 'nguoi', meo: 'cuu-kip' }
    }),
    // 15 · dọn lối kịp lúc, ngân dài note(n, k): hòm sắt của đội khảo sát kẹt sau một khối đá chuông dày (phải ngân ba nhịp liền mới vỡ). Sông ngầm bên dưới chảy xiết sang phải,
    //      xuồng không dừng được: chỉ trong ba nhịp trôi ngang qua đá là trong tầm. Xuồng + loa ngân note(6, 3) đúng lúc, trước khi nhện (R1) bò tới đá.
    //      Cách hai: thêm mic, nghe nốt rồi ngân (đắt hơn). R1 là nhện nam châm, không phải xe hang động: xem chú thích DONG_15.
    man9('lap-hang-dong', 5, 'luyen', {
      ten: 'Ngân dài khi trôi',
      mucTieu: 'dua-vat',
      deBai: 'Đá chuông dày chắn hòm sắt: phải ngân 3 nhịp liền mới vỡ. Sông ngầm chảy xiết, xuồng trôi qua đá chỉ trong 3 nhịp. Lắp xuồng có loa, ngân dài đúng lúc: note(n, k).',
      veMaMau: 'Xuồng trôi qua đá mà chưa hát.',
      san: ['##############', '#D.......o...#', '##############', '#~~~~~~~~~~~~#', '##############'],
      them: { dong: DONG_15, daChuong: [{ x: 8, y: 1, not: 6, ben: 3 }], vatChat: ['..............', '.........s....', '..............', '..............', '..............'] },
      doi: [may('PL', { x: 2, y: 1, huong: 1 }), khe({ x: 1, y: 3, huong: 1 }, { son: 'lam', chinhLuoi: false })],
      lapRap: lapR2(['xuong'], ['loa'], ['am-thanh'], 9, [
        cach('xuong', 'loa', null, [PL_15, XUONG_15]),
        cach('xuong', 'loa', 'am-thanh', [PL_15, XUONG_MIC_15])
      ], { moLai: ['L5'] }),
      maMau: doiBai([PL_15, ['wait_n(6)']]),
      loiSai: [
        { moTa: 'Ngân một nhịp (note(6)): đá dày chưa vỡ', baiLam: doiBai([PL_15, ['wait_n(6)', 'note(6)', 'wait()']]), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Ngân sớm một nhịp (wait_n(5)): nhịp đầu đá còn ngoài tầm', baiLam: doiBai([PL_15, ['wait_n(5)', 'note(6, 3)', 'wait()']]), phaiCoMa: ['chua-dua-vat'] }
      ],
      sao: { o: 17, nhip: 38 },
      goiY: ['note(n, k): ngân nốt n trong k nhịp liền; xuồng vẫn trôi trong lúc ngân.', 'Đá dày phải nghe đúng nốt 3 nhịp liền, trong tầm 3 ô.', 'Dòng chảy đẩy xuồng mỗi nhịp một ô.'],
      cauDo: { doi: null, lap: 'xuong+loa', coChe: ['song-ngam', 'dong', 'da-chuong', 'ngan-dai'], cuu: 'hang', meo: 'don-loi' }
    })
  ];

  ManHoc.manCuuHangDong = DS_MAN;
})();
