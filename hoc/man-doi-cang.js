/* ============================================================================
   man-doi-cang.js - "Robot Chấn Hưng": GÓI 9 MÙA 4 "CẢNG SÔNG" (ĐỘI CẨU VÀ NHỆN)
   Gồm 20 màn phối hợp 2 robot:
   - R1 (Sola, vàng): Cần cẩu container đầy đủ mùa 4 (thân cau, tay moc-cau, cảm biến quet-ma).
   - R2 (Luna, lam): Robot phân loại đầy đủ mùa 3 (thân nhen, tay nam-cham bụng, cảm biến tu ở hông).
   - doi-cang.1..10     (10 màn chương doi-cang "Đội cẩu và nhện")
   - che-doi-cang.1..10 (10 màn chương che-doi-cang "Đội cẩu và nhện phối hợp")
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var CAU_HAM = ['swing_left', 'swing_right', 'extend', 'retract', 'pick_up', 'set_down', 'pick_up2', 'read_code', 'weight', 'rail', 'wait'];
  var NHEN_HAM = ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'crouch', 'stand', 'magnet_n', 'magnet_s', 'magnet_off', 'front_metal', 'front_pole'];
  var CAU_TRUC = ['for', 'if', 'while', 'list'];

  function R1_CAU() {
    return {
      loaiRobot: 'cau',
      robot: { than: 'cau', tay: 'moc-cau', camBien: [{ ma: 'quet-ma', o: 'tren' }] },
      hamGoc: CAU_HAM.slice()
    };
  }
  function R2_NHEN() {
    return {
      loaiRobot: 'nhen',
      robot: { than: 'nhen', tay: 'nam-cham', camBien: [{ ma: 'tu', o: 'hong' }], son: 'lam' },
      hamGoc: NHEN_HAM.slice()
    };
  }

  var SAN_DOI_1 = [
    '~~~~~~~',
    '~~~~~~~',
    '~DTTTD~',
    '.RRRRR.',
    '.DDDDD.',
    '.DDDDD.',
    '.......'
  ];

  var SAN_DOI_2 = [
    '~~~~~~~',
    '~~~~~~~',
    '~TTDTT~',
    '.RRRRR.',
    '.DDDDD.',
    '.DDDDD.',
    '.......'
  ];

  var SAN_DOI_HO = [
    '~~~~~~~',
    '~~~~~~~',
    '~DTTTD~',
    '.RRRRR.',
    '.DDDDD.',
    '.DDuDD.',
    '.......'
  ];

  var SAN_DOI_GAM = [
    '~~~~~~~',
    '~~~~~~~',
    '~DTTTD~',
    '.RRRRR.',
    '.DDDDD.',
    '.DDnDD.',
    '.......'
  ];

  var O_TAU_1 = [{ x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 }];
  var O_TAU_TRAI = [{ x: 1, y: 2 }, { x: 2, y: 2 }];
  var O_TAU_PHAI = [{ x: 4, y: 2 }, { x: 5, y: 2 }];

  function tauDon(co, vang, pha) {
    var t = { o: O_TAU_1, co: co, vang: vang };
    if (pha) t.pha = pha;
    return [t];
  }
  function tauDoi(co, vang, pha0, pha1) {
    var t0 = { o: O_TAU_TRAI, co: co, vang: vang };
    var t1 = { o: O_TAU_PHAI, co: co, vang: vang };
    if (pha0) t0.pha = pha0;
    if (pha1) t1.pha = pha1;
    return [t0, t1];
  }

  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function B(c1, c2, them) {
    return Object.assign({ doi: [{ chinh: c1.slice() }, { chinh: c2.slice() }], hamCuaMan: [] }, them || {});
  }
  function CW(x, y, ds) {
    return {
      x: x, y: y,
      cont: ds.map(function (p) { return { so: p[0], tan: p[1] }; })
    };
  }
  function VS(x, y) { return { x: x, y: y, chat: 'sat' }; }
  function VN(x, y, cuc) { return { x: x, y: y, chat: 'nam-cham', cuc: cuc }; }

  // Các hàm chế ở Gói 9 chương che-doi-cang
  var T_CLEAR_RAIL = [
    'pull_s()',
    'go(d)'
  ];
  var T_CLEAR_POLE = [
    'grab_pole()',
    'go(d)'
  ];
  var T_WAIT_LOAD = [
    'wait_n(t)',
    'carry_by(d)'
  ];
  var T_SLIDE_LOAD = [
    'rail(s)',
    'carry_by(d)'
  ];
  var T_SLIDE_LOAD2 = [
    'rail(s)',
    'carry2_by(d)'
  ];
  var T_TEAM_SWEEP_SAI = [
    'for i in range(n):',
    '    rail(1)',
    '    wait_n(3)',
    '    carry_by(4)',
    '    swing_by(4)'
  ];
  var T_TEAM_SWEEP_DUNG = [
    'for i in range(n):',
    '    wait_n(3)',
    '    rail(1)',
    '    carry_by(4)',
    '    swing_by(4)'
  ];

  function hClearRail(than) { return H('clear_rail', ['d'], than || T_CLEAR_RAIL); }
  function hClearPole(than) { return H('clear_pole', ['d'], than || T_CLEAR_POLE); }
  function hWaitLoad(than) { return H('wait_load', ['t', 'd'], than || T_WAIT_LOAD); }
  function hSlideLoad(than) { return H('slide_load', ['s', 'd'], than || T_SLIDE_LOAD); }
  function hSlideLoad2(than) { return H('slide_load2', ['s', 'd'], than || T_SLIDE_LOAD2); }
  function hTeamSweep(than) { return H('team_sweep', ['n'], than || T_TEAM_SWEEP_DUNG); }

  function manDoi(m) {
    var bd = m.bd, r1 = R1_CAU(), r2 = R2_NHEN(), khoa = m.khoa;
    delete m.bd; delete m.khoa;
    var nhieu = Array.isArray(m.san[0]);
    var bd1 = nhieu && Array.isArray(bd[0]) ? bd[0] : bd[0];
    var bd2 = nhieu && Array.isArray(bd[1]) ? bd[1] : bd[1];
    m.chuong = m.chuong || 'doi-cang';
    m.vo = 'cang';
    m.cauTruc = CAU_TRUC;
    m.vaHoac = true;
    m.mucTieu = m.mucTieu || 'giao-tau';
    m.taiToiDa = m.taiToiDa || 6;
    m.moXuong = true;
    m.camHamCuaEm = false;
    m.khung = m.khung || { chinh: 10, moiHam: 10 };
    m.doi = [Object.assign({ batDau: bd1 }, r1), Object.assign({ batDau: bd2 }, r2)];
    if (khoa !== undefined) [].concat(khoa).forEach(function (k) { m.doi[k].coDinh = true; });
    m.batDau = bd1;
    m.loaiRobot = r1.loaiRobot;
    m.robot = JSON.parse(JSON.stringify(r1.robot));
    m.hamGoc = r1.hamGoc.slice();
    m.taoHam = m.taoHam || [];
    m.loiSai = m.loiSai || [];
    m.hamCuaEmCan = m.hamCuaEmCan || [];
    if (m.loiGiai) m.loiGiai.hamCuaEmMoi = m.loiGiai.hamCuaEmMoi || [];
    return ManHoc.chuanHoa(m);
  }
  function cheDoi(m) { m.chuong = 'che-doi-cang'; return manDoi(m); }

  var DS = [
    /* ========================================================================
       CHƯƠNG 1: doi-cang (10 màn) - Đội cẩu và nhện
       ======================================================================== */
    manDoi({
      so: 1, ten: 'Nhện dọn sắt trên ray', hang: 'lam-quen',
      chiChay: true, chinhCoDinh: true, khoa: [0, 1],
      taiToiDa: 6,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'pull_s', 'go'],
      deBai: 'Sola và Luna hội quân ở cảng sông! R1 là cần cẩu container của Sola ở (1, 3), còn R2 là robot nhện nam châm bụng của Luna đang đứng trên mẩu sắt vụn tại (2, 3) ngay trên đường ray. Trong lúc R1 nhấc kiện 15 ở (1, 4) và quay về nấc 0, R2 gọi pull_s() hút sắt vào bụng rồi go("D") bước xuống bãi (2, 4) nhường ray cho R1 trượt sang cột 2 giao hàng lên tàu! Bấm Chạy để xem.',
      veMaMau: 'Hai chương trình đã khóa. Bấm mũi tên chuyển giữa R1 và R2 để xem rồi bấm Chạy.',
      san: SAN_DOI_1,
      bd: [{ x: 1, y: 3, nac: 4, tam: 1 }, { x: 2, y: 3, huong: 1 }],
      chong: [CW(1, 4, [[15, 1]])],
      vatThem: [VS(2, 3)],
      tau: tauDon(7, 2),
      giao: [{ tau: 0, so: [15] }],
      maMau: B(['pick_up()', 'swing_by(4)', 'rail(1)', 'set_down()'], ['pull_s()', 'go("D")']),
      loiGiai: B(['pick_up()', 'swing_by(4)', 'rail(1)', 'set_down()'], ['pull_s()', 'go("D")']),
      sao: { o: 22, nhip: 7 },
      goiY: ['Luna: Mẩu sắt nằm trên đường ray (2, 3) sẽ chặn bánh ray của R1 nếu R2 không hút đi.', 'Luna: R2 gọi pull_s() rồi go("D") chỉ mất 3 nhịp, vừa kịp trước khi R1 trượt rail(1) ở nhịp 6.']
    }),

    manDoi({
      so: 2, ten: 'Bước lên ray nhặt sắt', hang: 'lam-quen',
      taiToiDa: 6,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'pull_s', 'go'],
      deBai: 'Sola nhờ Luna: mẩu sắt vụn nằm trên đường ray tại (2, 3) chặn lối trượt của R1 từ (1, 3) sang tàu ở cột 2. R2 đang đứng ở (2, 4) ngay dưới ray: hãy lập trình cho R2 gọi go("U") bước lên (2, 3), gọi pull_s() hút mẩu sắt rồi go("D") lùi về (2, 4). Cùng lúc đó R1 nhấc kiện 18 ở (1, 4), quay swing_by(4), trượt rail(1) rồi set_down() lên tàu!',
      veMaMau: 'Viết tiếp cho R1 trượt sang cột 2 hạ hàng và R2 bước lên ray hút sắt rồi lùi xuống.',
      san: SAN_DOI_1,
      bd: [{ x: 1, y: 3, nac: 4, tam: 1 }, { x: 2, y: 4, huong: 1 }],
      chong: [CW(1, 4, [[18, 2]])],
      vatThem: [VS(2, 3)],
      tau: tauDon(7, 2),
      giao: [{ tau: 0, so: [18] }],
      maMau: B(['pick_up()', 'swing_by(4)'], ['go("U")']),
      loiGiai: B(['pick_up()', 'swing_by(4)', 'rail(1)', 'set_down()'], ['go("U")', 'pull_s()', 'go("D")']),
      sao: { o: 23, nhip: 7 },
      loiSai: [
        { moTa: 'R2 mới bước lên (2, 3) mà không hút sắt và lùi ra nên R1 đâm phải R2 trên ray', baiLam: B(['pick_up()', 'swing_by(4)', 'rail(1)', 'set_down()'], ['go("U")']), phaiCoMa: ['het-ray'] },
        { moTa: 'R2 quên gọi pull_s() nên mẩu sắt vẫn nằm lại trên ray (2, 3) chặn R1', baiLam: B(['pick_up()', 'swing_by(4)', 'rail(1)', 'set_down()'], ['go("U")', 'go("D")']), phaiCoMa: ['het-ray'] }
      ],
      goiY: ['Luna: R2 gọi go("U"), pull_s(), go("D") mất 2 + 1 + 2 = 5 nhịp.', 'Luna: R1 gọi pick_up() và swing_by(4) cũng vừa đúng 5 nhịp, sang nhịp 6 gọi rail(1) và set_down() là khớp nhịp!']
    }),

    manDoi({
      so: 3, ten: 'Dọn bãi trung chuyển cho cẩu', hang: 'lam-quen',
      taiToiDa: 4,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry2_by', 'pull_s', 'go'],
      deBai: 'Sola cần ô bãi (3, 4) làm điểm trung chuyển để gom 2 kiện 2 tấn [24, 12] từ (3, 5) về tầm 1 trước khi bốc đôi lên tàu (vì taiToiDa = 4). Nhưng trên ô (3, 4) đang có mẩu sắt vụn và R2! Hãy cho R2 gọi pull_s() rồi go("L") sang (2, 4) nhường bãi, còn R1 lặp 2 lần đưa từng kiện từ (3, 5) về (3, 4) rồi gọi carry2_by(4)!',
      veMaMau: 'R2 hút sắt ở (3, 4) rồi bước sang trái; R1 gom 2 kiện từ (3, 5) về (3, 4) rồi gọi carry2_by(4).',
      san: SAN_DOI_1,
      bd: [{ x: 3, y: 3, nac: 4, tam: 1 }, { x: 3, y: 4, huong: 1 }],
      chong: [CW(3, 5, [[24, 2], [12, 2]])],
      vatThem: [VS(3, 4)],
      tau: tauDon(14, 2),
      giao: [{ tau: 0, so: [12, 24] }],
      maMau: B(['for i in range(2):', '    extend()', '    pick_up()', '    retract()'], ['pull_s()']),
      loiGiai: B([
        'for i in range(2):',
        '    extend()',
        '    pick_up()',
        '    retract()',
        '    set_down()',
        'carry2_by(4)'
      ], ['pull_s()', 'go("L")']),
      sao: { o: 27, nhip: 14 },
      loiSai: [
        { moTa: 'R2 hút sắt nhưng quên bước ra khỏi (3, 4) nên R1 hạ container trúng R2', baiLam: B(['for i in range(2):', '    extend()', '    pick_up()', '    retract()', '    set_down()', 'carry2_by(4)'], ['pull_s()']), phaiCoMa: ['ha-bi-chan'] },
        { moTa: 'R2 bước đi mà quên gọi pull_s() nên mẩu sắt vẫn nằm ở (3, 4) chặn R1 hạ hàng', baiLam: B(['for i in range(2):', '    extend()', '    pick_up()', '    retract()', '    set_down()', 'carry2_by(4)'], ['go("L")']), phaiCoMa: ['ha-bi-chan'] }
      ],
      goiY: ['Luna: R2 chỉ cần gọi pull_s() rồi go("L") là ô (3, 4) trống ngay từ nhịp 3.', 'Luna: R1 hoàn thiện vòng lặp bằng set_down() rồi gọi carry2_by(4) để đưa cả cặp lên tàu.']
    }),

    manDoi({
      so: 4, ten: 'Đảo cực hút nam châm chữ N', hang: 'luyen',
      taiToiDa: 4,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry2_by', 'wait_n', 'pull_n', 'go'],
      deBai: 'Sola báo: trên đường ray tại (2, 3) có mẩu nam châm chữ N màu đỏ! R2 đang đứng ở (2, 3): để hút mẩu chữ N, R2 phải bật cực S bằng pull_n() rồi gọi go("D") bước xuống (2, 4). R1 ở (1, 3) hãy gọi wait_n(3) chờ R2 dọn xong ray, trượt rail(2) sang cột 3 rồi gọi carry2_by(4) bốc đôi cặp kiện [22, 11] từ (3, 4) lên tàu!',
      veMaMau: 'R2 dùng pull_n() hút mẩu chữ N rồi go("D"); R1 chờ 3 nhịp rồi trượt sang cột 3 bốc đôi.',
      san: SAN_DOI_1,
      bd: [{ x: 1, y: 3, nac: 4, tam: 1 }, { x: 2, y: 3, huong: 1 }],
      chong: [CW(3, 4, [[22, 1], [11, 1]])],
      vatThem: [VN(2, 3, 'N')],
      tau: tauDon(11, 2),
      giao: [{ tau: 0, so: [11, 22] }],
      maMau: B(['wait_n(3)', 'rail(2)'], ['pull_n()']),
      loiGiai: B(['wait_n(3)', 'rail(2)', 'carry2_by(4)'], ['pull_n()', 'go("D")']),
      sao: { o: 26, nhip: 11 },
      loiSai: [
        { moTa: 'R2 gọi nhầm pull_s() (cực N) nên mẩu nam châm chữ N cùng cực nằm yên trên ray chặn R1', baiLam: B(['wait_n(3)', 'rail(2)', 'carry2_by(4)'], ['pull_s()', 'go("D")']), phaiCoMa: ['het-ray'] },
        { moTa: 'R1 quên gọi wait_n(3) nên trượt ray ngay nhịp 1 đâm vào R2', baiLam: B(['rail(2)', 'carry2_by(4)'], ['pull_n()', 'go("D")']), phaiCoMa: ['het-ray'] }
      ],
      goiY: ['Luna: Mẩu nam châm chữ N cần cực S để hút, nên R2 phải gọi pull_n() rồi go("D").', 'Luna: R1 gọi wait_n(3), rail(2) rồi carry2_by(4) để bốc cặp kiện ở (3, 4) lên tàu.']
    }),

    manDoi({
      so: 5, ten: 'Nhện nhảy hố cứu đường ray', hang: 'luyen',
      taiToiDa: 6,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'jump', 'go', 'pull_s'],
      deBai: 'Sola và Luna phối hợp nhịp nhàng: R2 ở (3, 6) phía dưới hố sâu u tại (3, 5), còn trên đường ray (3, 3) có mẩu nam châm chữ S màu xanh. Trong lúc R1 ở (2, 3) gọi carry_by(4) và swing_by(4) để giao kiện 19 tại (2, 4) lên tàu (mất đúng 10 nhịp), R2 hãy gọi jump("U") nhảy qua hố lên (3, 4), go("U") lên (3, 3), pull_s() hút mẩu S rồi go("R") sang (4, 3) (cũng vừa đúng 10 nhịp!). Sau đó R1 trượt rail(1) sang cột 3 và gọi carry_by(4) bốc nốt kiện 29!',
      veMaMau: 'R2 nhảy qua hố lên dọn mẩu S ở (3, 3); R1 giao kiện 19 ở cột 2 rồi sang cột 3 bốc kiện 29.',
      san: SAN_DOI_HO,
      bd: [{ x: 2, y: 3, nac: 4, tam: 1 }, { x: 3, y: 6, huong: 0 }],
      chong: [CW(2, 4, [[19, 2]]), CW(3, 4, [[29, 2]])],
      vatThem: [VN(3, 3, 'S')],
      tau: tauDon(17, 2),
      giao: [{ tau: 0, so: [19, 29] }],
      maMau: B([
        'carry_by(4)',
        'swing_by(4)',
        'rail(1)'
      ], ['jump("U")', 'go("U")']),
      loiGiai: B([
        'carry_by(4)',
        'swing_by(4)',
        'rail(1)',
        'carry_by(4)'
      ], ['jump("U")', 'go("U")', 'pull_s()', 'go("R")']),
      sao: { o: 31, nhip: 17 },
      loiSai: [
        { moTa: 'R2 đi bộ go("U") vào hố u ở (3, 5) thay vì nhảy jump("U")', baiLam: B(['carry_by(4)', 'swing_by(4)', 'rail(1)', 'carry_by(4)'], ['go("U")', 'go("U")', 'pull_s()', 'go("R")']), phaiCoMa: ['roi-ho'] },
        { moTa: 'R2 hút mẩu S nhưng quên gọi go("R") tránh khỏi ô (3, 3) nên R1 trượt rail(1) đâm phải R2', baiLam: B(['carry_by(4)', 'swing_by(4)', 'rail(1)', 'carry_by(4)'], ['jump("U")', 'go("U")', 'pull_s()']), phaiCoMa: ['het-ray'] }
      ],
      goiY: ['Luna: R2 gọi jump("U") (5 nhịp), go("U") (2 nhịp), pull_s() (1 nhịp), go("R") (2 nhịp) tổng cộng 10 nhịp, vừa khớp lúc R1 xong carry_by(4) và swing_by(4).', 'Luna: Sau rail(1), R1 gọi carry_by(4) để bốc kiện 29 lên tàu.']
    }),

    manDoi({
      so: 6, ten: 'Đọc cực trên ray hai sân', hang: 'luyen',
      taiToiDa: 6,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'grab_pole', 'go'],
      deBai: 'Sola thử thách trên hai sân: R1 ở (4, 3) cần bốc kiện hàng tại (4, 4) lên Tàu 2, rồi trượt rail(-2) sang cột 2 để bốc kiện hàng tại (2, 4) lên Tàu 1. Nhưng trên ray (2, 3) có một mẩu nam châm (sân 1 là cực N, sân 2 là cực S). R2 đang đứng ở (1, 3) nhìn sang phải: hãy cho R2 gọi grab_pole() để tự đọc cực và bước sang (2, 3) hút gọn, rồi gọi go("L") lùi về (1, 3)!',
      veMaMau: 'R2 gọi grab_pole() rồi go("L"); R1 bốc cột 4 rồi trượt rail(-2) sang bốc cột 2.',
      san: [SAN_DOI_2, SAN_DOI_2],
      bd: [{ x: 4, y: 3, nac: 4, tam: 1 }, { x: 1, y: 3, huong: 1 }],
      chong: [
        [CW(2, 4, [[14, 2]]), CW(4, 4, [[24, 2]])],
        [CW(2, 4, [[18, 2]]), CW(4, 4, [[28, 2]])]
      ],
      vatThem: [
        [VN(2, 3, 'N')],
        [VN(2, 3, 'S')]
      ],
      tau: [tauDoi(18, 2), tauDoi(18, 2)],
      giao: [
        [{ tau: 0, so: [14] }, { tau: 1, so: [24] }],
        [{ tau: 0, so: [18] }, { tau: 1, so: [28] }]
      ],
      maMau: B(['carry_by(4)', 'swing_by(4)', 'rail(-2)'], ['grab_pole()']),
      loiGiai: B(['carry_by(4)', 'swing_by(4)', 'rail(-2)', 'carry_by(4)'], ['grab_pole()', 'go("L")']),
      sao: { o: 28, nhip: 18 },
      loiSai: [
        { moTa: 'R2 quên gọi go("L") lùi về (1, 3) nên đứng chắn trên ray (2, 3)', baiLam: B(['carry_by(4)', 'swing_by(4)', 'rail(-2)', 'carry_by(4)'], ['grab_pole()']), phaiCoMa: ['het-ray'] },
        { moTa: 'R2 dùng cố định magnet_s() thay vì grab_pole() nên ở sân 2 không hút được mẩu S', baiLam: B(['carry_by(4)', 'swing_by(4)', 'rail(-2)', 'carry_by(4)'], ['magnet_s()', 'go("R")', 'go("L")']), phaiCoMa: ['het-ray'] }
      ],
      goiY: ['Luna: Hàm grab_pole() đã tự kiểm tra front_pole() == "N" để chọn cực ngược lại rồi bước sang phải.', 'Luna: Sau grab_pole(), R2 chỉ cần gọi go("L") để lùi về (1, 3), còn R1 gọi thêm carry_by(4) ở cột 2.']
    }),

    manDoi({
      so: 7, ten: 'Chui gầm thấp dọn cọc tháp', hang: 'bien-the',
      taiToiDa: 6, luatThap: true,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'move_tower2', 'crawl', 'pull_s', 'go'],
      deBai: 'Sola gặp bài toán Tháp Hà Nội (luatThap = true): tại (3, 4) có tháp [20, 10] cần chuyển nguyên thứ tự lên tàu ở (3, 2) nhờ cọc phụ (2, 4) (nấc 5). Nhưng trên cọc phụ (2, 4) đang có mẩu sắt vụn, còn R2 ở (3, 6) phía dưới gầm thấp n tại (3, 5)! Hãy cho R2 gọi crawl("U") chui qua gầm lên (3, 4), go("L") sang (2, 4), pull_s() hút sắt rồi go("D") xuống (2, 5); R1 chờ R2 bằng wait_n(8) rồi gọi move_tower2(1, 4)!',
      veMaMau: 'R2 chui qua gầm thấp lên dọn sắt ở cọc phụ (2, 4); R1 gọi wait_n(8) rồi move_tower2(1, 4).',
      san: SAN_DOI_GAM,
      bd: [{ x: 3, y: 3, nac: 4, tam: 1 }, { x: 3, y: 6, huong: 0 }],
      chong: [CW(3, 4, [[20, 2], [10, 1]])],
      vatThem: [VS(2, 4)],
      tau: tauDon(26, 2),
      giao: [{ tau: 0, so: [10, 20] }],
      maMau: B(['wait_n(8)'], ['crawl("U")', 'go("L")']),
      loiGiai: B(['wait_n(8)', 'move_tower2(1, 4)'], ['crawl("U")', 'go("L")', 'pull_s()', 'go("D")']),
      sao: { o: 39, nhip: 26 },
      loiSai: [
        { moTa: 'R1 không chờ wait_n(8) nên hạ kiện 10 xuống cọc phụ (2, 4) khi mẩu sắt vẫn còn ở đó', baiLam: B(['move_tower2(1, 4)'], ['crawl("U")', 'go("L")', 'pull_s()', 'go("D")']), phaiCoMa: ['ha-bi-chan'] },
        { moTa: 'R2 đi thẳng go("U") vào gầm thấp n mà không co chân bằng crawl("U")', baiLam: B(['wait_n(8)', 'move_tower2(1, 4)'], ['go("U")', 'go("U")', 'go("L")', 'pull_s()', 'go("D")']), phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['Luna: crawl("U") đưa R2 từ (3, 6) chui qua gầm thấp (3, 5) lên (3, 4) trong 5 nhịp.', 'Luna: Sau go("L"), R2 gọi pull_s() và go("D"), còn R1 gọi wait_n(8) rồi move_tower2(1, 4).']
    }),

    manDoi({
      so: 8, ten: 'Dò sắt trên đường ray', hang: 'bien-the',
      taiToiDa: 6,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'wait_n', 'pull_s', 'go'],
      deBai: 'Sola và Luna kiểm tra hai sân: R2 đứng ở (1, 3) nhìn sang phải dọc đường ray. Ở một trong hai sân có mẩu sắt nằm tại (2, 3) (cách R2 đúng 1 ô trước mặt nên front_metal() trả về True). Nếu front_metal(): R2 hãy bước go("R") lên (2, 3), gọi pull_s() hút sắt rồi go("L") lùi về (1, 3). R1 ở (4, 3) gọi wait_n(5), trượt rail(-2) sang (2, 3) rồi carry_by(4) bốc kiện hàng ở (2, 4) lên tàu!',
      veMaMau: 'R2 kiểm tra if front_metal(): để dọn sắt ở (2, 3); R1 chờ 5 nhịp rồi trượt sang cột 2 bốc hàng.',
      san: [SAN_DOI_1, SAN_DOI_1],
      bd: [{ x: 4, y: 3, nac: 4, tam: 1 }, { x: 1, y: 3, huong: 1 }],
      chong: [
        [CW(2, 4, [[15, 2]])],
        [CW(2, 4, [[25, 2]])]
      ],
      vatThem: [
        [VS(2, 3)],
        []
      ],
      tau: [tauDon(13, 2), tauDon(13, 2)],
      giao: [
        [{ tau: 0, so: [15] }],
        [{ tau: 0, so: [25] }]
      ],
      maMau: B(['wait_n(5)', 'rail(-2)'], ['if front_metal():', '    go("R")']),
      loiGiai: B(['wait_n(5)', 'rail(-2)', 'carry_by(4)'], [
        'if front_metal():',
        '    go("R")',
        '    pull_s()',
        '    go("L")'
      ]),
      sao: { o: 28, nhip: 13 },
      loiSai: [
        { moTa: 'R2 quên lùi go("L") về (1, 3) sau khi hút sắt nên đứng chắn trên ray (2, 3)', baiLam: B(['wait_n(5)', 'rail(-2)', 'carry_by(4)'], ['if front_metal():', '    go("R")', '    pull_s()']), phaiCoMa: ['het-ray'] },
        { moTa: 'R1 quên gọi carry_by(4) sau khi trượt tới (2, 3)', baiLam: B(['wait_n(5)', 'rail(-2)'], ['if front_metal():', '    go("R")', '    pull_s()', '    go("L")']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Trong khối if front_metal(): của R2, sau go("R") hãy gọi pull_s() rồi go("L").', 'Luna: R1 sau khi wait_n(5) và rail(-2) chỉ cần gọi carry_by(4) để đưa kiện hàng ở (2, 4) lên tàu (2, 2).']
    }),

    manDoi({
      so: 9, ten: 'Dọn dọc hai cột ray', hang: 'bien-the',
      taiToiDa: 6,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'wait_n', 'pull_s', 'go'],
      deBai: 'Sola giao việc: trên đường ray có tới 2 mẩu sắt vụn tại (2, 3) và (3, 3), còn dưới bãi là 2 kiện hàng ở (2, 4) và (3, 4). R2 bắt đầu ở (2, 3): vì nam châm bụng chỉ giữ 1 vật nên sau khi hút sắt ở (2, 3) và đem thả xuống (2, 5), R2 hãy vòng sang (3, 3) hút mẩu sắt thứ hai rồi bước sang (4, 3). R1 ở (1, 3) gọi wait_n(4), rồi lặp 2 cột: trượt rail(1), gọi carry_by(4) giao lên tàu và swing_by(4) quay về nấc 4!',
      veMaMau: 'R2 thả sắt đầu tiên ở (2, 5) rồi lên (3, 3) hút mẩu thứ hai sang (4, 3); R1 lặp 2 cột bốc hàng.',
      san: SAN_DOI_1,
      bd: [{ x: 1, y: 3, nac: 4, tam: 1 }, { x: 2, y: 3, huong: 1 }],
      chong: [CW(2, 4, [[16, 2]]), CW(3, 4, [[26, 2]])],
      vatThem: [VS(2, 3), VS(3, 3)],
      tau: tauDon(26, 2),
      giao: [{ tau: 0, so: [16, 26] }],
      maMau: B([
        'wait_n(4)',
        'for i in range(2):',
        '    rail(1)'
      ], [
        'pull_s()',
        'go("D")',
        'go("D")',
        'magnet_off()',
        'wait()'
      ]),
      loiGiai: B([
        'wait_n(4)',
        'for i in range(2):',
        '    rail(1)',
        '    carry_by(4)',
        '    swing_by(4)'
      ], [
        'pull_s()',
        'go("D")',
        'go("D")',
        'magnet_off()',
        'wait()',
        'go("R")',
        'go("U")',
        'go("U")',
        'pull_s()',
        'go("R")'
      ]),
      sao: { o: 36, nhip: 26 },
      loiSai: [
        { moTa: 'R2 mới dọn mẩu sắt ở (2, 3), chưa lên (3, 3) dọn mẩu sắt thứ hai nên R1 bị chặn ở cột 3', baiLam: B(['wait_n(4)', 'for i in range(2):', '    rail(1)', '    carry_by(4)', '    swing_by(4)'], ['pull_s()', 'go("D")', 'go("D")', 'magnet_off()', 'wait()']), phaiCoMa: ['het-ray'] },
        { moTa: 'R1 quên gọi swing_by(4) ở cuối vòng lặp nên vừa lệch hướng cần vừa trượt sang cột 3 quá sớm khi R2 chưa dọn xong', baiLam: B(['wait_n(4)', 'for i in range(2):', '    rail(1)', '    carry_by(4)'], ['pull_s()', 'go("D")', 'go("D")', 'magnet_off()', 'wait()', 'go("R")', 'go("U")', 'go("U")', 'pull_s()', 'go("R")']), phaiCoMa: ['het-ray'] }
      ],
      goiY: ['Luna: Sau khi R2 thả mẩu sắt đầu tiên ở (2, 5), hãy gọi go("R"), go("U"), go("U") lên (3, 3), gọi pull_s() rồi go("R") sang (4, 3).', 'Luna: Trong vòng lặp của R1, sau rail(1) hãy gọi carry_by(4) và swing_by(4).']
    }),

    manDoi({
      so: 10, ten: 'Trùm Đội cẩu và nhện', hang: 'trum', nhipTheo: 'tong',
      taiToiDa: 6,
      huyHieu: { ma: 'doi-cang', ten: 'Huy hiệu Đội cẩu và nhện' },
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'safe_carry', 'wait_n', 'grab_pole', 'go'],
      deBai: 'Trùm chương 1: trên hai sân với taiToiDa = 6, R2 đứng ở (2, 3) nhìn sang phải, trước mặt tại (3, 3) là một mẩu nam châm (N hoặc S tùy sân) chặn đường ray. R2 hãy gọi grab_pole() để bước sang (3, 3) hút mẩu nam châm rồi go("R") sang (4, 3). R1 ở (1, 3) gọi wait_n(2) chờ R2 rời (2, 3), rồi lặp 2 cột: trượt rail(1) và gọi safe_carry(4) để bốc toàn bộ hàng ở (2, 4) và (3, 4) lên tàu!',
      veMaMau: 'R2 gọi grab_pole() rồi go("R"); R1 chờ 2 nhịp rồi lặp 2 cột gọi rail(1) và safe_carry(4).',
      san: [SAN_DOI_1, SAN_DOI_1],
      bd: [{ x: 1, y: 3, nac: 4, tam: 1 }, { x: 2, y: 3, huong: 1 }],
      chong: [
        [CW(2, 4, [[14, 2], [12, 2]]), CW(3, 4, [[28, 3], [26, 3]])],
        [CW(2, 4, [[19, 3], [17, 3]]), CW(3, 4, [[24, 2], [22, 2]])]
      ],
      vatThem: [
        [VN(3, 3, 'N')],
        [VN(3, 3, 'S')]
      ],
      tau: [tauDon(34, 2), tauDon(34, 2)],
      giao: [
        [{ tau: 0, so: [12, 14, 26, 28] }],
        [{ tau: 0, so: [17, 19, 22, 24] }]
      ],
      maMau: B([
        'wait_n(2)',
        'for i in range(2):',
        '    rail(1)'
      ], ['grab_pole()']),
      loiGiai: B([
        'wait_n(2)',
        'for i in range(2):',
        '    rail(1)',
        '    safe_carry(4)'
      ], ['grab_pole()', 'go("R")']),
      sao: { o: 43, nhip: 68 },
      loiSai: [
        { moTa: 'R2 quên gọi go("R") sang (4, 3) nên đứng lại ở (3, 3) chặn R1 ở vòng lặp thứ hai', baiLam: B(['wait_n(2)', 'for i in range(2):', '    rail(1)', '    safe_carry(4)'], ['grab_pole()']), phaiCoMa: ['het-ray'] },
        { moTa: 'R1 chỉ lặp 1 cột nên chưa bốc chồng hàng ở (3, 4)', baiLam: B(['wait_n(2)', 'rail(1)', 'safe_carry(4)'], ['grab_pole()', 'go("R")']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Sau wait_n(2), R2 đã rời (2, 3) sang (3, 3) nên R1 trượt rail(1) vào (2, 3) thông suốt.', 'Luna: R2 gọi thêm go("R") sang (4, 3), còn R1 trong vòng lặp gọi rail(1) và safe_carry(4).']
    }),

    /* ========================================================================
       CHƯƠNG 2: che-doi-cang (10 màn) - Đội cẩu và nhện phối hợp
       ======================================================================== */
    cheDoi({
      so: 1, ten: 'Chế hàm dọn sắt đường ray', hang: 'lam-quen',
      chinhCoDinh: true,
      taiToiDa: 6,
      taoHam: ['clear_rail'],
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'wait_n', 'pull_s', 'go'],
      deBai: 'Sola gợi ý: R2 đứng trên mẩu sắt ở đường ray luôn phải hút sắt bằng pull_s() rồi bước 1 ô theo hướng d bằng go(d) để nhường đường cho cần cẩu. Hãy chế hàm clear_rail(d) gồm 2 lệnh đó để R2 dọn ô ray (2, 3) cho R1!',
      veMaMau: 'Viết hàm clear_rail(d): gọi pull_s() rồi go(d).',
      san: SAN_DOI_1,
      bd: [{ x: 1, y: 3, nac: 4, tam: 1 }, { x: 2, y: 3, huong: 1 }],
      chong: [CW(2, 4, [[18, 2]])],
      vatThem: [VS(2, 3)],
      tau: tauDon(10, 2),
      giao: [{ tau: 0, so: [18] }],
      maMau: B(['wait_n(3)', 'rail(1)', 'carry_by(4)'], ['clear_rail("R")']),
      loiGiai: B(['wait_n(3)', 'rail(1)', 'carry_by(4)'], ['clear_rail("R")'], { hamCuaEmMoi: [hClearRail()] }),
      sao: { o: 27, nhip: 10 },
      loiSai: [
        { moTa: 'Chưa tạo hàm clear_rail mà đã bấm Chạy', baiLam: B(['wait_n(3)', 'rail(1)', 'carry_by(4)'], ['clear_rail("R")']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong clear_rail(d) quên gọi pull_s() nên mẩu sắt vẫn nằm lại trên ray (2, 3)', baiLam: B(['wait_n(3)', 'rail(1)', 'carry_by(4)'], ['clear_rail("R")']), hamCuaEmMoi: [hClearRail(['go(d)'])], phaiCoMa: ['het-ray'] }
      ],
      goiY: ['Luna: Thân hàm clear_rail(d) gồm 2 dòng: pull_s() và go(d).', 'Luna: Khi R2 gọi clear_rail("R"), nhện hút mẩu sắt ở (2, 3) rồi bước sang (3, 3) trong 3 nhịp.']
    }),

    cheDoi({
      so: 2, ten: 'Chế hàm dò cực mở ray', hang: 'lam-quen',
      chinhCoDinh: true,
      taiToiDa: 6,
      taoHam: ['clear_pole'],
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'wait_n', 'grab_pole', 'go'],
      deBai: 'Sola nâng cấp cho R2: khi trước mặt bên phải R2 là một mẩu nam châm N hoặc S nằm trên ray, R2 cần gọi grab_pole() để đọc cực và bước sang hút, rồi gọi go(d) để rời khỏi ô đó. Hãy chế hàm clear_pole(d) gồm grab_pole() và go(d)!',
      veMaMau: 'Viết hàm clear_pole(d): gọi grab_pole() rồi go(d).',
      san: [SAN_DOI_1, SAN_DOI_1],
      bd: [{ x: 1, y: 3, nac: 4, tam: 1 }, { x: 2, y: 3, huong: 1 }],
      chong: [
        [CW(3, 4, [[16, 2]])],
        [CW(3, 4, [[26, 2]])]
      ],
      vatThem: [
        [VN(3, 3, 'N')],
        [VN(3, 3, 'S')]
      ],
      tau: [tauDon(12, 2), tauDon(12, 2)],
      giao: [
        [{ tau: 0, so: [16] }],
        [{ tau: 0, so: [26] }]
      ],
      maMau: B(['wait_n(4)', 'rail(2)', 'carry_by(4)'], ['clear_pole("R")']),
      loiGiai: B(['wait_n(4)', 'rail(2)', 'carry_by(4)'], ['clear_pole("R")'], { hamCuaEmMoi: [hClearPole()] }),
      sao: { o: 30, nhip: 12 },
      loiSai: [
        { moTa: 'Chưa tạo hàm clear_pole mà đã bấm Chạy', baiLam: B(['wait_n(4)', 'rail(2)', 'carry_by(4)'], ['clear_pole("R")']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên gọi go(d) sau grab_pole() nên R2 đứng lại trên ô (3, 3) chặn R1', baiLam: B(['wait_n(4)', 'rail(2)', 'carry_by(4)'], ['clear_pole("R")']), hamCuaEmMoi: [hClearPole(['grab_pole()'])], phaiCoMa: ['het-ray'] }
      ],
      goiY: ['Luna: Thân hàm clear_pole(d) gồm 2 dòng: grab_pole() và go(d).', 'Luna: R2 ở (2, 3) gọi clear_pole("R") sẽ bước sang (3, 3) hút mẩu nam châm rồi bước tiếp sang (4, 3).']
    }),

    cheDoi({
      so: 3, ten: 'Chế hàm chờ rồi bốc hàng', hang: 'lam-quen',
      chinhCoDinh: true,
      taiToiDa: 6,
      taoHam: ['wait_load'],
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'wait_n', 'clear_rail'],
      deBai: 'Sola chế hàm cho cần cẩu R1: khi tàu rời bến ở nhịp 3 và quay lại ở nhịp 7 (trong lúc R2 đang dọn sắt trên ray), R1 có thể gọi wait_load(t, d) gồm wait_n(t) rồi carry_by(d) để chờ đúng t nhịp rồi nhấc kiện hàng quay d nấc hạ xuống tàu!',
      veMaMau: 'Viết hàm wait_load(t, d): gọi wait_n(t) rồi carry_by(d).',
      san: SAN_DOI_1,
      bd: [{ x: 3, y: 3, nac: 4, tam: 1 }, { x: 2, y: 3, huong: 1 }],
      chong: [CW(3, 4, [[15, 2]])],
      vatThem: [VS(2, 3)],
      tau: [{ o: [{ x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 }], co: 2, vang: 5 }],
      giao: [{ tau: 0, so: [15] }],
      maMau: B(['wait_load(3, 4)'], ['clear_rail("L")']),
      loiGiai: B(['wait_load(3, 4)'], ['clear_rail("L")'], { hamCuaEmMoi: [hWaitLoad()] }),
      sao: { o: 27, nhip: 9 },
      loiSai: [
        { moTa: 'Chưa tạo hàm wait_load mà đã bấm Chạy', baiLam: B(['wait_load(3, 4)'], ['clear_rail("L")']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Quên gọi wait_n(t) trước carry_by(d) khiến R1 hạ hàng lúc tàu đang vắng mặt nên bị chặn', baiLam: B(['wait_load(3, 4)'], ['clear_rail("L")']), hamCuaEmMoi: [hWaitLoad(['carry_by(d)'])], phaiCoMa: ['ha-bi-chan'] }
      ],
      goiY: ['Luna: Thân hàm wait_load(t, d) gồm 2 dòng: wait_n(t) và carry_by(d).', 'Luna: R1 chờ 3 nhịp rồi gọi carry_by(4), vừa kịp hạ kiện 15 xuống boong ở nhịp 9 khi tàu đã cập bến.']
    }),

    cheDoi({
      so: 4, ten: 'Chế hàm trượt ray bốc đơn', hang: 'luyen',
      chinhCoDinh: true,
      taiToiDa: 6,
      taoHam: ['slide_load'],
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'wait_n', 'clear_rail'],
      deBai: 'Sola tiếp tục rút gọn thao tác cho R1: sau khi R2 đã dọn thông đường ray, R1 trượt rail(s) tới cột hàng rồi gọi carry_by(d) để bốc kiện hàng lên tàu. Hãy chế hàm slide_load(s, d) gồm rail(s) và carry_by(d)!',
      veMaMau: 'Viết hàm slide_load(s, d): gọi rail(s) rồi carry_by(d).',
      san: SAN_DOI_1,
      bd: [{ x: 1, y: 3, nac: 4, tam: 1 }, { x: 2, y: 3, huong: 1 }],
      chong: [CW(2, 4, [[21, 2]])],
      vatThem: [VS(2, 3)],
      tau: tauDon(10, 2),
      giao: [{ tau: 0, so: [21] }],
      maMau: B(['wait_n(3)', 'slide_load(1, 4)'], ['clear_rail("R")']),
      loiGiai: B(['wait_n(3)', 'slide_load(1, 4)'], ['clear_rail("R")'], { hamCuaEmMoi: [hSlideLoad()] }),
      sao: { o: 28, nhip: 10 },
      loiSai: [
        { moTa: 'Chưa tạo hàm slide_load mà đã bấm Chạy', baiLam: B(['wait_n(3)', 'slide_load(1, 4)'], ['clear_rail("R")']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong slide_load(s, d) quên gọi carry_by(d) nên R1 chỉ trượt ray mà không bốc hàng', baiLam: B(['wait_n(3)', 'slide_load(1, 4)'], ['clear_rail("R")']), hamCuaEmMoi: [hSlideLoad(['rail(s)'])], phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Thân hàm slide_load(s, d) gồm 2 dòng: rail(s) và carry_by(d).', 'Luna: Sau khi R2 chạy clear_rail("R") dọn ô (2, 3), R1 gọi slide_load(1, 4) là giao gọn kiện 21 lên tàu!']
    }),

    cheDoi({
      so: 5, ten: 'Chế hàm trượt ray bốc đôi', hang: 'luyen',
      chinhCoDinh: true,
      taiToiDa: 4,
      taoHam: ['slide_load2'],
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry2_by', 'wait_n', 'clear_pole'],
      deBai: 'Sola hoàn thiện bộ hàm trượt ray: khi tại cột đích có cặp kiện nhẹ có thể nhấc đôi, hãy chế hàm slide_load2(s, d) gồm rail(s) và carry2_by(d) để R1 trượt ray s ô rồi bốc đôi cả 2 kiện lên tàu!',
      veMaMau: 'Viết hàm slide_load2(s, d): gọi rail(s) rồi carry2_by(d).',
      san: [SAN_DOI_1, SAN_DOI_1],
      bd: [{ x: 1, y: 3, nac: 4, tam: 1 }, { x: 2, y: 3, huong: 1 }],
      chong: [
        [CW(3, 4, [[14, 1], [12, 1]])],
        [CW(3, 4, [[24, 1], [22, 1]])]
      ],
      vatThem: [
        [VN(3, 3, 'N')],
        [VN(3, 3, 'S')]
      ],
      tau: [tauDon(12, 2), tauDon(12, 2)],
      giao: [
        [{ tau: 0, so: [12, 14] }],
        [{ tau: 0, so: [22, 24] }]
      ],
      maMau: B(['wait_n(4)', 'slide_load2(2, 4)'], ['clear_pole("R")']),
      loiGiai: B(['wait_n(4)', 'slide_load2(2, 4)'], ['clear_pole("R")'], { hamCuaEmMoi: [hSlideLoad2()] }),
      sao: { o: 31, nhip: 12 },
      loiSai: [
        { moTa: 'Chưa tạo hàm slide_load2 mà đã bấm Chạy', baiLam: B(['wait_n(4)', 'slide_load2(2, 4)'], ['clear_pole("R")']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Dùng carry_by(d) thay vì carry2_by(d) nên chỉ giao được 1 kiện trước khi tàu rời bến', baiLam: B(['wait_n(4)', 'slide_load2(2, 4)'], ['clear_pole("R")']), hamCuaEmMoi: [hSlideLoad2(['rail(s)', 'carry_by(d)'])], phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Thân hàm slide_load2(s, d) gồm 2 dòng: rail(s) và carry2_by(d).', 'Luna: R2 gọi clear_pole("R") dọn mẩu nam châm ở (3, 3), còn R1 gọi slide_load2(2, 4) để bốc đôi cặp kiện ở (3, 4).']
    }),

    cheDoi({
      so: 6, ten: 'Phối hợp hàm dọn ray hai đầu', hang: 'luyen',
      taiToiDa: 4,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'carry2_by', 'slide_load', 'slide_load2', 'clear_rail'],
      deBai: 'Sola và Luna chia việc: R1 ở (2, 3) hướng nấc 4 tầm 1, tại (2, 4) có kiện 15 (2 tấn) và tại (4, 4) có cặp kiện 1 tấn [24, 22]. Trên đường ray (3, 3) có mẩu sắt vụn và R2 đang đứng ngay tại (3, 3). Trong lúc R1 gọi carry_by(4) giao kiện 15 ở cột 2 rồi quay swing_by(4) về nấc 4, R2 hãy gọi clear_rail("D") để hút sắt ở (3, 3) và bước xuống (3, 4). Sau đó R1 gọi slide_load2(2, 4) trượt sang cột 4 bốc đôi [24, 22]!',
      veMaMau: 'R1 bốc cột 2 rồi gọi slide_load2(2, 4) sang cột 4; R2 gọi clear_rail("D") dọn ô (3, 3).',
      san: SAN_DOI_1,
      bd: [{ x: 2, y: 3, nac: 4, tam: 1 }, { x: 3, y: 3, huong: 1 }],
      chong: [CW(2, 4, [[15, 2]]), CW(4, 4, [[24, 1], [22, 1]])],
      vatThem: [VS(3, 3)],
      tau: tauDon(18, 2),
      giao: [{ tau: 0, so: [15, 22, 24] }],
      maMau: B(['carry_by(4)', 'swing_by(4)'], ['clear_rail("D")']),
      loiGiai: B(['carry_by(4)', 'swing_by(4)', 'slide_load2(2, 4)'], ['clear_rail("D")']),
      sao: { o: 30, nhip: 18 },
      loiSai: [
        { moTa: 'R2 gọi clear_rail("R") sang (4, 3) nên đứng chắn đúng cột 4 mà R1 cần trượt tới', baiLam: B(['carry_by(4)', 'swing_by(4)', 'slide_load2(2, 4)'], ['clear_rail("R")']), phaiCoMa: ['het-ray'] },
        { moTa: 'R1 dùng slide_load(2, 4) thay vì slide_load2(2, 4) nên bỏ sót 1 kiện ở cột 4', baiLam: B(['carry_by(4)', 'swing_by(4)', 'slide_load(2, 4)'], ['clear_rail("D")']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: R2 gọi clear_rail("D") sẽ hút sắt ở (3, 3) rồi bước xuống bãi (3, 4), giúp toàn bộ đường ray thông suốt.', 'Luna: R1 sau carry_by(4) và swing_by(4) chỉ cần gọi slide_load2(2, 4)!']
    }),

    cheDoi({
      so: 7, ten: 'Cân tải và dò cực cùng lúc', hang: 'bien-the',
      taiToiDa: 4,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'carry2_by', 'wait_n', 'slide_load', 'slide_load2', 'clear_pole'],
      deBai: 'Sola thử thách trên hai sân với taiToiDa = 4: R2 ở (2, 3) nhìn sang phải thấy mẩu nam châm tại (3, 3), hãy gọi clear_pole("R") để dọn thông cột 3 rồi sang (4, 3). R1 ở (1, 3) gọi wait_n(4), trượt rail(2) sang cột 3, rồi đọc w = weight() và kiểm tra if w == 1: để gọi carry2_by(4) (nếu cặp 1 tấn) hoặc carry_by(4) (nếu 1 kiện 3 tấn)!',
      veMaMau: 'R2 gọi clear_pole("R"); R1 chờ 4 nhịp, trượt rail(2), đọc w = weight() rồi kiểm tra w == 1.',
      san: [SAN_DOI_1, SAN_DOI_1],
      bd: [{ x: 1, y: 3, nac: 4, tam: 1 }, { x: 2, y: 3, huong: 1 }],
      chong: [
        [CW(3, 4, [[16, 1], [14, 1]])],
        [CW(3, 4, [[25, 3]])]
      ],
      vatThem: [
        [VN(3, 3, 'N')],
        [VN(3, 3, 'S')]
      ],
      tau: [tauDon(12, 2), tauDon(12, 2)],
      giao: [
        [{ tau: 0, so: [14, 16] }],
        [{ tau: 0, so: [25] }]
      ],
      maMau: B([
        'wait_n(4)',
        'rail(2)',
        'w = weight()',
        'if w == 1:',
        '    carry2_by(4)'
      ], ['clear_pole("R")']),
      loiGiai: B([
        'wait_n(4)',
        'rail(2)',
        'w = weight()',
        'if w == 1:',
        '    carry2_by(4)',
        'else:',
        '    carry_by(4)'
      ], ['clear_pole("R")']),
      sao: { o: 36, nhip: 12 },
      loiSai: [
        { moTa: 'R1 luôn gọi carry2_by(4) nên ở sân 2 chỉ có 1 kiện bị lỗi móc thiếu', baiLam: B(['wait_n(4)', 'rail(2)', 'carry2_by(4)'], ['clear_pole("R")']), phaiCoMa: ['moc-thieu'] },
        { moTa: 'R2 gọi clear_pole("L") lùi về (2, 3) nên đứng chắn đường trượt rail(2) của R1', baiLam: B(['wait_n(4)', 'rail(2)', 'w = weight()', 'if w == 1:', '    carry2_by(4)', 'else:', '    carry_by(4)'], ['clear_pole("L")']), phaiCoMa: ['het-ray'] }
      ],
      goiY: ['Luna: R2 đã có clear_pole("R") dọn mẩu nam châm ở (3, 3) và bước sang (4, 3).', 'Luna: R1 chỉ cần thêm nhánh else: gọi carry_by(4).']
    }),

    cheDoi({
      so: 8, ten: 'Sửa hàm quét đội cảng', hang: 'bien-the',
      chinhCoDinh: true,
      taiToiDa: 6,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'wait_n', 'clear_rail'],
      deBai: 'Sola phát hiện lỗi phối hợp: hàm team_sweep(n) của R1 dùng để chờ R2 dọn sắt trên ray (mất 3 nhịp) rồi trượt sang bốc hàng. Nhưng trong thân hàm đang gọi rail(1) TRƯỚC wait_n(3), khiến R1 lao vào ô ray (2, 3) ngay nhịp 1 khi R2 chưa kịp dọn! Hãy đổi lại thứ tự wait_n(3) lên trước rail(1) trong team_sweep(n).',
      veMaMau: 'Đưa lệnh wait_n(3) lên trước rail(1) trong hàm team_sweep(n).',
      san: SAN_DOI_1,
      bd: [{ x: 1, y: 3, nac: 4, tam: 1 }, { x: 2, y: 3, huong: 1 }],
      chong: [CW(2, 4, [[18, 2]])],
      vatThem: [VS(2, 3)],
      tau: tauDon(14, 2),
      giao: [{ tau: 0, so: [18] }],
      maMau: B(['team_sweep(1)'], ['clear_rail("D")'], { hamCuaMan: [hTeamSweep(T_TEAM_SWEEP_SAI)] }),
      loiGiai: B(['team_sweep(1)'], ['clear_rail("D")'], { hamCuaMan: [hTeamSweep(T_TEAM_SWEEP_DUNG)] }),
      sao: { o: 30, nhip: 14 },
      loiSai: [
        { moTa: 'Chưa sửa thứ tự trong team_sweep(n) nên R1 gọi rail(1) ngay nhịp 1 đâm vào R2', baiLam: B(['team_sweep(1)'], ['clear_rail("D")'], { hamCuaMan: [hTeamSweep(T_TEAM_SWEEP_SAI)] }), phaiCoMa: ['het-ray'] },
        { moTa: 'Xóa mất lệnh carry_by(4) trong team_sweep(n) nên R1 không bốc kiện 18 lên tàu', baiLam: B(['team_sweep(1)'], ['clear_rail("D")'], { hamCuaMan: [hTeamSweep(['for i in range(n):', '    wait_n(3)', '    rail(1)', '    swing_by(4)'])] }), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: R2 cần 3 nhịp để thực hiện clear_rail("D") (1 nhịp pull_s + 2 nhịp go("D")).', 'Luna: Trong vòng lặp của team_sweep(n), đặt wait_n(3) trước rail(1), carry_by(4), swing_by(4).']
    }),

    cheDoi({
      so: 9, ten: 'Dọn bãi rồi phân loại hai tàu', hang: 'bien-the',
      taiToiDa: 6,
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'over_wall', 'vault_stack', 'rail_drop', 'scan_rail', 'clear_rail'],
      deBai: 'Sola và Luna phối hợp phân loại: trên hai sân, tại (3, 5) có 2 kiện hàng (mã 1x và 2x) cần đưa qua rào sang bãi (3, 2) rồi phân loại sang hai tàu bằng scan_rail(). Nhưng trên ô ray (3, 3) đang có mẩu sắt vụn và R2! Hãy cho R2 gọi clear_rail("R") sang (4, 3) rồi go("D") xuống (4, 4); R1 ở (2, 3) gọi wait_n(3), trượt rail(1) vào (3, 3), gọi vault_stack(2, 4), swing_by(4) rồi scan_rail()!',
      veMaMau: 'R2 gọi clear_rail("R") rồi go("D"); R1 chờ 3 nhịp, trượt sang cột 3, chuyển 2 kiện ra (3, 2) rồi scan_rail().',
      san: [SAN_DOI_2, SAN_DOI_2],
      bd: [{ x: 2, y: 3, nac: 4, tam: 1 }, { x: 3, y: 3, huong: 1 }],
      chong: [
        [CW(3, 5, [[18, 2], [24, 2]])],
        [CW(3, 5, [[29, 2], [15, 2]])]
      ],
      vatThem: [
        [VS(3, 3)],
        [VS(3, 3)]
      ],
      tau: [tauDoi(40, 2), tauDoi(40, 2)],
      giao: [
        [{ tau: 0, so: [18] }, { tau: 1, so: [24] }],
        [{ tau: 0, so: [15] }, { tau: 1, so: [29] }]
      ],
      maMau: B(['wait_n(3)', 'rail(1)', 'vault_stack(2, 4)'], ['clear_rail("R")']),
      loiGiai: B([
        'wait_n(3)',
        'rail(1)',
        'vault_stack(2, 4)',
        'swing_by(4)',
        'scan_rail()'
      ], ['clear_rail("R")', 'go("D")']),
      sao: { o: 46, nhip: 40 },
      loiSai: [
        { moTa: 'R2 quên gọi go("D") xuống (4, 4) nên đứng lại trên ray (4, 3) chặn scan_rail() khi R1 trượt sang Tàu 2', baiLam: B(['wait_n(3)', 'rail(1)', 'vault_stack(2, 4)', 'swing_by(4)', 'scan_rail()'], ['clear_rail("R")']), phaiCoMa: ['het-ray'] },
        { moTa: 'R1 quên gọi scan_rail() sau khi đã chuyển 2 kiện ra bãi (3, 2)', baiLam: B(['wait_n(3)', 'rail(1)', 'vault_stack(2, 4)', 'swing_by(4)'], ['clear_rail("R")', 'go("D")']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: R2 gọi clear_rail("R") sang (4, 3) rồi phải gọi thêm go("D") xuống (4, 4) để nhường cả ô ray (4, 3) cho scan_rail()!', 'Luna: R1 sau vault_stack(2, 4) hãy gọi swing_by(4) rồi scan_rail().']
    }),

    cheDoi({
      so: 10, ten: 'Trùm Đội cẩu và nhện phối hợp', hang: 'trum', nhipTheo: 'tong',
      taiToiDa: 4,
      huyHieu: { ma: 'che-doi-cang', ten: 'Huy hiệu Đội cẩu và nhện phối hợp' },
      hamCuaEmCan: ['swing_l', 'swing_r', 'swing_by', 'carry_by', 'carry2_by', 'wait_n', 'slide_load', 'slide_load2', 'clear_rail', 'clear_pole', 'go'],
      deBai: 'Trùm chương 2: trên hai sân với taiToiDa = 4, R1 ở (1, 3) cần trượt sang cột 2 bốc kiện đơn 3 tấn ở (2, 4), rồi trượt tiếp 2 ô sang cột 4 bốc đôi cặp kiện 1 tấn ở (4, 4). Trên đường ray có mẩu sắt ở (2, 3) và mẩu nam châm (N hoặc S) ở (4, 3). R2 bắt đầu tại (2, 3): hãy gọi clear_rail("D") xuống (2, 4), go("R") sang (3, 4) thả sắt magnet_off(); wait(), rồi go("U") lên (3, 3) và gọi clear_pole("R") để dọn thông cột 4 cho R1!',
      veMaMau: 'Phối hợp nhịp nhàng R1 (wait_n, slide_load, swing_by, slide_load2) và R2 (clear_rail, thả sắt ở (3, 4), lên (3, 3) gọi clear_pole).',
      san: [SAN_DOI_1, SAN_DOI_1],
      bd: [{ x: 1, y: 3, nac: 4, tam: 1 }, { x: 2, y: 3, huong: 1 }],
      chong: [
        [CW(2, 4, [[15, 3]]), CW(4, 4, [[24, 1], [22, 1]])],
        [CW(2, 4, [[19, 3]]), CW(4, 4, [[28, 1], [26, 1]])]
      ],
      vatThem: [
        [VS(2, 3), VN(4, 3, 'N')],
        [VS(2, 3), VN(4, 3, 'S')]
      ],
      tau: [tauDon(22, 2), tauDon(22, 2)],
      giao: [
        [{ tau: 0, so: [15, 22, 24] }],
        [{ tau: 0, so: [19, 26, 28] }]
      ],
      maMau: B([
        'wait_n(3)',
        'slide_load(1, 4)',
        'swing_by(4)'
      ], [
        'clear_rail("D")',
        'go("R")',
        'magnet_off()',
        'wait()'
      ]),
      loiGiai: B([
        'wait_n(3)',
        'slide_load(1, 4)',
        'swing_by(4)',
        'slide_load2(2, 4)'
      ], [
        'clear_rail("D")',
        'go("R")',
        'magnet_off()',
        'wait()',
        'go("U")',
        'clear_pole("R")'
      ]),
      sao: { o: 47, nhip: 44 },
      loiSai: [
        { moTa: 'R2 mới dọn mẩu sắt ở (2, 3), chưa lên (3, 3) gọi clear_pole("R") dọn cột 4 nên R1 bị chặn', baiLam: B(['wait_n(3)', 'slide_load(1, 4)', 'swing_by(4)', 'slide_load2(2, 4)'], ['clear_rail("D")', 'go("R")', 'magnet_off()', 'wait()']), phaiCoMa: ['het-ray'] },
        { moTa: 'R1 quên gọi slide_load2(2, 4) ở bước cuối', baiLam: B(['wait_n(3)', 'slide_load(1, 4)', 'swing_by(4)'], ['clear_rail("D")', 'go("R")', 'magnet_off()', 'wait()', 'go("U")', 'clear_pole("R")']), phaiCoMa: ['chua-giao-tau'] }
      ],
      goiY: ['Luna: Sau khi R2 thả sắt ở (3, 4), gọi go("U") lên (3, 3) rồi gọi clear_pole("R") để bước sang (4, 3) hút mẩu nam châm và sang (5, 3).', 'Luna: R1 sau swing_by(4) chỉ cần gọi slide_load2(2, 4) là bốc gọn cặp kiện ở (4, 4) lên tàu!']
    })
  ];

  ManHoc.manDoiCang = DS;
  if (laNode) module.exports = DS;
})();
