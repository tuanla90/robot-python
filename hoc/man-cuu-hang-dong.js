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
    })
  ];

  ManHoc.manCuuHangDong = DS_MAN;
})();
