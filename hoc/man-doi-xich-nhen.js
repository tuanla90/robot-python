/* ============================================================================
   man-doi-xich-nhen.js — "Robot Chấn Hưng": NGÂN HÀNG MÀN MỚI của mùa 3, gói 9 "Đội xích và nhện" (PDM3b2 31/10, KE-HOACH-PART-DUNG-MUA.md).
   Hai chương doi-xich (so 11..20) và che-doi-xich (so 11..20), 20 màn phối hợp hai robot:
     - R1 (vàng, của Sola): Robot phân loại đầy đủ mùa 3 (thân nhện + nam châm bụng N/S + cảm biến từ ở hông + nhảy crouch/stand).
     - R2 (hồng, của Luna): Xe cứu hỏa mùa 2 (thân xích đẩy thùng nặng xichDay + vòi phun hai lực lucBan + cảm biến hồng ngoại distance/warm).
   Mỗi robot làm việc robot kia không làm được:
     - R2 phun van hơi N mở cửa C / tắt băng chuyền, đẩy thùng nặng H đè nút M, đi trên băng chuyền không bị trôi, đo khoảng cách / nhiệt (warm thấy đồng đội).
     - R1 nhảy qua hố u, chui qua gầm thấp n, đọc cảm biến từ front_metal() / front_pole(), hút sắt vụn và vật nam châm N/S dưới bụng mang về đích D.
   Hàm của em chương 2: wait_n(n) chờ n nhịp; valve_go(n) cho R2 tiến n ô tới van hơi rồi phun; hop_iron(d) cho R1 hút sắt dưới bụng, nhảy về hướng d rồi thả.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var NHEN_HAM = ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'crouch', 'stand', 'magnet_n', 'magnet_s', 'magnet_off', 'front_metal', 'front_pole'];
  var XICH_HAM = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'spray', 'spray_back', 'distance', 'warm'];

  function R1_NHEN() {
    return {
      loaiRobot: 'nhen',
      robot: { than: 'nhen', tay: 'nam-cham', camBien: [{ ma: 'tu', o: 'hong' }] },
      hamGoc: NHEN_HAM.slice()
    };
  }
  function R2_XICH() {
    return {
      loaiRobot: 'xich',
      xichDay: true,
      lucBan: true,
      robot: { than: 'xich', tay: 'hoi', camBien: [{ ma: 'hong-ngoai', o: 'tren' }], son: 'lam' },
      hamGoc: XICH_HAM.slice()
    };
  }
  function B(c1, c2, them) {
    return Object.assign({ doi: [{ chinh: c1.slice() }, { chinh: c2.slice() }], hamCuaMan: [] }, them || {});
  }
  function LAP(n, lenh) {
    return ['for i in range(' + n + '):'].concat((Array.isArray(lenh) ? lenh : [lenh]).map(function (s) { return '    ' + s; }));
  }
  function CHO(n) { return LAP(n, 'wait()'); }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }

  /** m.bd: [batDau R1 nhện, batDau R2 xích]; m.khoa: chỉ số robot khoá; m.co: [cờ R1, cờ R2]. */
  function man(m) {
    var bd = m.bd, r1 = R1_NHEN(), r2 = R2_XICH(), khoa = m.khoa, co = m.co;
    delete m.bd; delete m.khoa; delete m.co;
    m.chuong = m.chuong || 'doi-xich';
    m.cauTruc = ['for', 'if', 'while'];
    m.vaHoac = true;
    m.mucTieu = m.mucTieu || 'dua-vat';
    if (m.mucTieu === 'dua-vat' && !m.vatCan) m.vatCan = 'tu';
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = m.khung || { chinh: 12, moiHam: 10 };
    m.bienDem = true;
    m.xichDay = true;
    m.lucBan = true;
    m.nhipTheoLoiGiai = true;
    m.doi = [Object.assign({ batDau: bd[0] }, r1), Object.assign({ batDau: bd[1] }, r2)];
    if (khoa !== undefined) [].concat(khoa).forEach(function (k) { m.doi[k].coDinh = true; });
    if (co) m.doi.forEach(function (d, i) { if (co[i]) d.co = co[i]; });
    m.batDau = bd[0];
    m.loaiRobot = r1.loaiRobot;
    m.robot = JSON.parse(JSON.stringify(r1.robot));
    m.hamGoc = r1.hamGoc.slice();
    m.taoHam = m.taoHam || [];
    m.loiSai = m.loiSai || [];
    m.hamCuaEmCan = m.hamCuaEmCan || [];
    m.loiGiai.hamCuaEmMoi = m.loiGiai.hamCuaEmMoi || [];
    return ManHoc.chuanHoa(m);
  }

  var DS = [
    /* ================================================= chương doi-xich "Đội xích và nhện" ================================================= */
    man({
      so: 11, ten: 'Van hơi mở lối nhện', hang: 'lam-quen', chiChay: true, chinhCoDinh: true, khoa: [0, 1], mucTieu: 'toi-co',
      hamCuaEmCan: ['jump', 'walk', 'squirt', 'back'],
      deBai: 'Màn này có hai robot chạy cùng lúc theo nhịp: R1 là robot phân loại của Sola, R2 là xe cứu hỏa của Luna. R2 phun tia nước vào van hơi N để mở cánh cửa C trên làn của R1, rồi lùi về cờ của mình. R1 nhảy qua hố rồi bước qua cửa tới cờ. Bấm Chạy để xem hai robot phối hợp.',
      veMaMau: 'Hai chương trình đã viết sẵn và khoá. Bấm mũi tên ở cột chương trình để xem từng robot, rồi bấm Chạy.',
      san: ['########', '#.u.CF.#', '#..##..#', '#.F.N..#', '########'],
      noi: [{ nut: { x: 4, y: 3 }, cua: [{ x: 4, y: 1 }], bang: [] }],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 3, y: 3, huong: 1 }],
      co: [[{ x: 5, y: 1 }], [{ x: 2, y: 3 }]],
      maMau: B(['jump("R")', 'walk("RR")'], ['squirt("low")', 'back()']),
      loiGiai: B(['jump("R")', 'walk("RR")'], ['squirt("low")', 'back()']),
      sao: { o: 23, nhip: 7 },
      goiY: ['R2 phun van N ở nhịp đầu nên cửa C mở kịp trước khi R1 bước tới.', 'Mỗi robot có lá cờ riêng mang màu của mình.']
    }),

    man({
      so: 12, ten: 'Mở cửa lấy sắt', hang: 'lam-quen', vatCan: 'sat',
      hamCuaEmCan: ['jump', 'go', 'pull_s', 'walk', 'go_to_wall', 'squirt'],
      deBai: 'Mẩu sắt nằm trước cánh cửa C đang đóng. R2 ở làn dưới đi tới sát van hơi N bằng go_to_wall() rồi squirt("low") để mở cửa C. R1 ở làn trên nhảy qua hố, bước lên mẩu sắt, hút dưới bụng rồi mang qua cửa C tới ô đích D.',
      veMaMau: 'Chương trình có sẵn: R1 mới tới mẩu sắt, R2 chưa phun van. Viết tiếp cho cả hai robot.',
      san: ['#########', '#.u.oCD##', '#########', '#....N###', '#########'],
      vatChat: ['.........', '....s....', '.........', '.........', '.........'],
      noi: [{ nut: { x: 5, y: 3 }, cua: [{ x: 5, y: 1 }], bang: [] }],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 3, huong: 1 }],
      maMau: B(['jump("R")', 'go("R")', 'pull_s()'], ['go_to_wall()']),
      loiGiai: B(['jump("R")', 'go("R")', 'pull_s()', 'walk("RR")', 'magnet_off()', 'wait()'], ['go_to_wall()', 'squirt("low")']),
      sao: { o: 31, nhip: 11 },
      loiSai: [
        { moTa: 'R2 quên squirt("low"): cửa C vẫn đóng, R1 húc cửa không tới được ô đích', baiLam: B(['jump("R")', 'go("R")', 'pull_s()', 'walk("RR")', 'magnet_off()', 'wait()'], ['go_to_wall()']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'R1 đi bộ qua hố thay vì nhảy: R1 rơi xuống hố', baiLam: B(['walk("RRR")', 'pull_s()', 'walk("RR")', 'magnet_off()', 'wait()'], ['go_to_wall()', 'squirt("low")']), phaiCoMa: ['roi-ho'] }
      ],
      goiY: ['R2 đi tới sát van N mất 3 nhịp rồi squirt("low") ở nhịp 4: cửa C mở trước khi R1 hút xong sắt.', 'R1 hút sắt bằng pull_s(), đi hai bước sang phải qua cửa rồi magnet_off(), wait().']
    }),

    man({
      so: 13, ten: 'Xích đẩy thùng đè nút', hang: 'lam-quen', vatCan: 'sat',
      hamCuaEmCan: ['crawl', 'go', 'pull_s', 'walk', 'push'],
      deBai: 'Lần này không có van hơi, mà có thùng nặng H nằm trước nút đè M ở làn của R2. Xe xích của R2 đẩy được thùng nặng: gọi push(1) để đẩy thùng H lên nút M giữ cửa C mở. R1 chui qua gầm thấp, lấy mẩu sắt rồi mang qua cửa C về ô đích D.',
      veMaMau: 'Chương trình có sẵn: R2 chưa đẩy thùng, R1 mới chui qua gầm. Viết tiếp cả hai.',
      san: ['#########', '#.n.oCD.#', '##..#####', '#..HM...#', '#########'],
      vatChat: ['.........', '....s....', '.........', '.........', '.........'],
      noi: [{ nut: { x: 4, y: 3 }, cua: [{ x: 5, y: 1 }], bang: [] }],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 3, huong: 1 }],
      maMau: B(['crawl("R")'], []),
      loiGiai: B(['crawl("R")', 'go("R")', 'pull_s()', 'walk("RR")', 'magnet_off()', 'wait()'], ['push(1)']),
      sao: { o: 30, nhip: 13 },
      loiSai: [
        { moTa: 'R2 chỉ go_to_wall() mà không đẩy thùng lên nút M: cửa C vẫn đóng', baiLam: B(['crawl("R")', 'go("R")', 'pull_s()', 'walk("RR")', 'magnet_off()', 'wait()'], ['go_to_wall()']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'R2 chỉ tiến 1 ô rồi dừng trước thùng H: thùng chưa đè nút M', baiLam: B(['crawl("R")', 'go("R")', 'pull_s()', 'walk("RR")', 'magnet_off()', 'wait()'], ['move()']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      goiY: ['push(1) đưa R2 tới sát thùng H rồi đẩy thùng tiến 1 ô lên nút M.', 'Thùng H nằm yên trên nút M nên cửa C mở suốt cho R1 đi qua.']
    }),

    man({
      so: 14, ten: 'Tắt băng ngược cho nhện', hang: 'luyen', vatCan: 'sat',
      hamCuaEmCan: ['crawl', 'go', 'pull_s', 'walk', 'forward', 'tr_left', 'squirt'],
      deBai: 'Giữa mẩu sắt và ô đích D của R1 là ô băng chuyền chạy ngược: nhện bước lên lúc băng còn chạy sẽ bị đẩy lùi. R2 đi trên băng ở làn dưới mà không bị trôi, tiến 4 ô, quay trái hướng lên van N rồi squirt("low") tắt băng cho R1.',
      veMaMau: 'Chương trình có sẵn: R2 chưa quay lên phun van, nên R1 bị băng đẩy lùi. Viết tiếp cho cả hai.',
      san: ['#########', '#.n.o<D.#', '#...#N###', '#.>>>...#', '#########'],
      vatChat: ['.........', '....s....', '.........', '.........', '.........'],
      noi: [{ nut: { x: 5, y: 2 }, cua: [], bang: [{ x: 5, y: 1 }] }],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 3, huong: 1 }],
      maMau: B(['crawl("R")', 'go("R")', 'pull_s()', 'walk("RR")', 'magnet_off()', 'wait()'], ['forward(4)']),
      loiGiai: B(['crawl("R")', 'go("R")', 'pull_s()', 'walk("RR")', 'magnet_off()', 'wait()'], ['forward(4)', 'tr_left()', 'squirt("low")']),
      sao: { o: 36, nhip: 13 },
      loiSai: [
        { moTa: 'R2 quên squirt("low"): băng chuyền còn chạy, đẩy R1 lùi về ô cũ', baiLam: B(['crawl("R")', 'go("R")', 'pull_s()', 'walk("RR")', 'magnet_off()', 'wait()'], ['forward(4)', 'tr_left()']), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'R2 quay phải thay vì quay trái: phun vào tường dưới', baiLam: B(['crawl("R")', 'go("R")', 'pull_s()', 'walk("RR")', 'magnet_off()', 'wait()'], ['forward(4)', 'tr_right()', 'squirt("low")']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Trong lúc R1 chui gầm và bước tới mẩu sắt (8 nhịp), R2 đi 4 ô, quay trái (2 nhịp) rồi phun van ở nhịp 7.', 'Khi R1 bước lên ô băng ở nhịp 11 thì băng đã tắt hẳn.']
    }),

    man({
      so: 15, ten: 'Chờ bạn rời đường ngắm', hang: 'luyen', vatCan: 'sat',
      hamCuaEmCan: ['jump', 'pull_s', 'walk', 'wait_clear', 'squirt'],
      deBai: 'R1 xuất phát ngay giữa mũi vòi phun của R2 và van hơi N phía trên, đang chuẩn bị nhảy qua cái hố bên phải để lấy sắt. Nếu R2 phun ngay thì tia nước trúng R1, van N không mở. Cho R2 gọi wait_clear() chờ tới khi cảm biến nhiệt hết thấy R1 trước mũi rồi mới squirt("high") mở cửa C cho R1.',
      veMaMau: 'Chương trình có sẵn: R2 phun ngay lúc R1 còn đứng trước mũi. Sửa R2 và viết tiếp R1.',
      san: ['##########', '####N#####', '#....uoCD#', '####.#####', '#........#', '##########'],
      vatChat: ['..........', '..........', '......s...', '..........', '..........', '..........'],
      noi: [{ nut: { x: 4, y: 1 }, cua: [{ x: 7, y: 2 }], bang: [] }],
      bd: [{ x: 4, y: 2, huong: 1 }, { x: 4, y: 3, huong: 0 }],
      maMau: B(['jump("R")'], ['squirt("high")']),
      loiGiai: B(['jump("R")', 'pull_s()', 'walk("RR")', 'magnet_off()', 'wait()'], ['wait_clear()', 'squirt("high")']),
      sao: { o: 27, nhip: 9 },
      loiSai: [
        { moTa: 'R2 phun ngay không chờ: tia nước trúng R1, cửa C không mở', baiLam: B(['jump("R")', 'pull_s()', 'walk("RR")', 'magnet_off()', 'wait()'], ['squirt("high")']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'R1 quên thả sắt ở ô đích', baiLam: B(['jump("R")', 'pull_s()', 'walk("RR")'], ['wait_clear()', 'squirt("high")']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['wait_clear() lặp while warm(): wait(), chờ tới khi R1 nhảy khỏi ô trước mũi R2.', 'Ngay khi R1 nhảy qua hố sang ô sắt, R2 gọi squirt("high") phun xa 2 ô tới van N, mở cửa C trước khi R1 bước vào cửa.']
    }),

    man({
      so: 16, ten: 'Phun mạnh qua rào, dò sắt', hang: 'luyen', vatCan: 'sat',
      hamCuaEmCan: ['jump', 'go', 'pull_s', 'walk', 'fence_shot'],
      deBai: 'Van hơi N ở làn dưới nằm cách R2 một hàng rào = (cách 3 ô). Tia phun nhẹ chỉ bay 2 ô không tới, nên R2 dùng fence_shot() để phun mạnh qua rào mở cửa C. Ở làn trên, R1 nhảy qua hố, lặp while not front_metal(): go("R") tới khi đầu dò thấy mẩu sắt, đi tiếp lên sắt hút vào bụng rồi mang qua cửa C về ô đích D.',
      veMaMau: 'Chương trình có sẵn: R2 phun nhẹ không tới van, R1 chưa đi tới mẩu sắt. Sửa cả hai.',
      san: ['##########', '#.u...oCD#', '#...##...#', '#..=.N...#', '##########'],
      vatChat: ['..........', '......s...', '..........', '..........', '..........'],
      noi: [{ nut: { x: 5, y: 3 }, cua: [{ x: 7, y: 1 }], bang: [] }],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 3, huong: 1 }],
      maMau: B(['jump("R")'], ['squirt("low")']),
      loiGiai: B(['jump("R")', 'while not front_metal():', '    go("R")', 'walk("RR")', 'pull_s()', 'walk("RR")', 'magnet_off()', 'wait()'], ['fence_shot()']),
      sao: { o: 32, nhip: 15 },
      loiSai: [
        { moTa: 'R2 dùng squirt("low") phun nhẹ: tia nước rơi ở ô (4,3) trước van N, cửa C không mở', baiLam: B(['jump("R")', 'while not front_metal():', '    go("R")', 'walk("RR")', 'pull_s()', 'walk("RR")', 'magnet_off()', 'wait()'], ['squirt("low")']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'R1 chỉ bước 1 ô sau vòng while: đầu dò thấy sắt từ cách 2 ô nên còn đứng bên trái mẩu sắt', baiLam: B(['jump("R")', 'while not front_metal():', '    go("R")', 'go("R")', 'pull_s()', 'walk("RR")', 'magnet_off()', 'wait()'], ['fence_shot()']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['fence_shot() phun mạnh qua hàng rào tới van N cách 3 ô rồi tiến 1 ô bù cú giật.', 'front_metal() thấy sắt từ khoảng cách 2 ô bên phải, nên dừng vòng lặp thì gọi walk("RR") để bước lên đúng ô có sắt.']
    }),

    man({
      so: 17, ten: 'Đọc cực sau cánh cửa', hang: 'bien-the',
      hamCuaEmCan: ['go', 'sort_row', 'open_left', 'push'],
      deBai: 'Hai vật nam châm N và S nằm sau hai cánh cửa C1, C2 trên hành lang của R1; phía trên mỗi vật là ô đích đỏ (nhận N), phía dưới là ô đích xanh (nhận S). R2 gọi open_left() phun van N mở cửa C1, rồi push(1) đẩy thùng H lên nút M mở cửa C2. R1 bước qua từng cửa, dùng sort_row() đọc cực và thả vào đúng ô đích.',
      veMaMau: 'Chương trình có sẵn mới mở cửa đầu và phân loại vật thứ nhất. Viết tiếp cho cả hai robot.',
      san: ['#########', '###D##D##', '#.Co.Co.#', '###D##D##', '#.N#....#', '#...HM..#', '#########'],
      vatChat: ['.........', '.........', '...N..S..', '.........', '.........', '.........', '.........'],
      mau: ['.........', '...r..r..', '.........', '...b..b..', '.........', '.........', '.........'],
      noi: [
        { nut: { x: 2, y: 4 }, cua: [{ x: 2, y: 2 }], bang: [] },
        { nut: { x: 5, y: 5 }, cua: [{ x: 5, y: 2 }], bang: [] }
      ],
      bd: [{ x: 1, y: 2, huong: 1 }, { x: 2, y: 5, huong: 1 }],
      maMau: B([' wait()', ' wait()', ' wait()', 'go("R")', 'sort_row()'], ['open_left()']),
      loiGiai: B(
        nhieu(CHO(3), ['go("R")', 'sort_row()', 'go("D")', 'go("R")', 'go("R")', 'sort_row()']),
        ['open_left()', 'push(1)']
      ),
      sao: { o: 48, nhip: 21 },
      loiSai: [
        { moTa: 'R2 quên push(1): cửa C2 vẫn đóng, R1 húc vào cửa C2', baiLam: B(nhieu(CHO(3), ['go("R")', 'sort_row()', 'go("D")', 'go("R")', 'go("R")', 'sort_row()']), ['open_left()']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'R1 đi ngay không chờ R2 quay trái phun van N: R1 húc cửa C1 lúc cửa chưa mở', baiLam: B(['go("R")', 'sort_row()', 'go("D")', 'go("R")', 'go("R")', 'sort_row()'], ['open_left()', 'push(1)']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      goiY: ['open_left() của R2 quay trái (2 nhịp) rồi phun van ở nhịp 3, nên R1 chờ 3 nhịp rồi bước vào C1(2,2) ở nhịp 4.', 'Sau sort_row() thứ nhất, vật N được thả ở D đỏ(3,1), nên R1 đang ở (3,1): gọi go("D") về (3,2), đi hai bước sang C2(5,2) rồi sort_row() lần hai.']
    }),

    man({
      so: 18, ten: 'Nhện đè nút, xích qua cửa', hang: 'bien-the', vatCan: 'sat',
      hamCuaEmCan: ['jump', 'go', 'pull_s', 'walk', 'forward', 'squirt'],
      deBai: 'Hai robot mở đường cho nhau: R1 nhảy qua hố lên đứng trên nút M để mở cửa C1 ở làn dưới cho R2. R1 chờ trên nút M cho R2 đi dọc hành lang qua hẳn cửa C1 tới phun van hơi N mở cửa C2 ở làn trên. Sau đó R1 bước sang hút mẩu sắt rồi mang qua cửa C2 tới ô đích D.',
      veMaMau: 'Chương trình có sẵn: R1 rời nút M ngay nên cửa C1 đóng lại trước khi R2 đi tới. Thêm nhịp chờ cho R1 trên nút M.',
      san: ['###########', '#.uMo..CD.#', '#...###...#', '#......C.N#', '###########'],
      vatChat: ['...........', '....s......', '...........', '...........', '...........'],
      noi: [
        { nut: { x: 3, y: 1 }, cua: [{ x: 7, y: 3 }], bang: [] },
        { nut: { x: 9, y: 3 }, cua: [{ x: 7, y: 1 }], bang: [] }
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 3, huong: 1 }],
      maMau: B(['jump("R")', 'go("R")', 'pull_s()', 'walk("RRRR")', 'magnet_off()', 'wait()'], ['forward(7)', 'squirt("low")']),
      loiGiai: B(nhieu(['jump("R")'], CHO(2), ['go("R")', 'pull_s()', 'walk("RRRR")', 'magnet_off()', 'wait()']), ['forward(7)', 'squirt("low")']),
      sao: { o: 33, nhip: 17 },
      loiSai: [
        { moTa: 'R1 không chờ trên nút M: R1 rời nút M ở nhịp 5 nên cửa C1 đóng lại trước khi R2 tới ở nhịp 6', baiLam: B(['jump("R")', 'go("R")', 'pull_s()', 'walk("RRRR")', 'magnet_off()', 'wait()'], ['forward(7)', 'squirt("low")']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'R2 chỉ tiến 4 ô rồi phun: dừng trước cửa C1, không tới được van N', baiLam: B(nhieu(['jump("R")'], CHO(2), ['go("R")', 'pull_s()', 'walk("RRRR")', 'magnet_off()', 'wait()']), ['forward(4)', 'squirt("low")']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      goiY: ['R1 nhảy lên nút M ở cuối nhịp 3; R2 đi 7 bước từ (1,3) nên bước qua cửa C1(7,3) ở nhịp 6 và ra khỏi cửa ở nhịp 7.', 'R1 chờ 2 nhịp trên nút M rồi mới gọi go("R") để cửa C1 mở đủ lâu cho R2 đi qua.']
    }),

    man({
      so: 19, ten: 'Hai trạm van hơi', hang: 'bien-the', vatCan: 'sat',
      hamCuaEmCan: ['go', 'pull_s', 'walk', 'forward', 'open_left'],
      deBai: 'Hai mẩu sắt, hai cánh cửa C và hai ô đích D xếp đều nhau trên hành lang của R1 (cách nhau 4 ô). Ở làn dưới, hai van hơi N cũng cách nhau 4 ô. Dùng vòng lặp for i in range(2): cho cả hai robot để R2 lần lượt mở từng van và R1 lần lượt đưa từng mẩu sắt về đích.',
      veMaMau: 'Chương trình có sẵn mới làm trạm đầu. Dùng vòng lặp for i in range(2): cho cả hai robot.',
      san: ['############', '#.oCD.oCD..#', '#....N#..N.#', '#..........#', '############'],
      vatChat: ['............', '..s...s.....', '............', '............', '............'],
      noi: [
        { nut: { x: 5, y: 2 }, cua: [{ x: 3, y: 1 }], bang: [] },
        { nut: { x: 9, y: 2 }, cua: [{ x: 7, y: 1 }], bang: [] }
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 3, huong: 1 }],
      maMau: B(['go("R")', 'pull_s()', 'walk("RR")', 'magnet_off()', 'wait()'], ['forward(4)', 'open_left()']),
      loiGiai: B(
        LAP(2, nhieu(CHO(4), ['go("R")', 'pull_s()', 'walk("RR")', 'magnet_off()', 'wait()', 'go("R")'])),
        LAP(2, ['forward(4)', 'open_left()'])
      ),
      sao: { o: 39, nhip: 26 },
      loiSai: [
        { moTa: 'R2 chỉ mở trạm đầu: cửa thứ hai vẫn đóng, R1 húc cửa', baiLam: B(LAP(2, nhieu(CHO(4), ['go("R")', 'pull_s()', 'walk("RR")', 'magnet_off()', 'wait()', 'go("R")'])), ['forward(4)', 'open_left()']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'R1 quên bước go("R") cuối mỗi vòng: vòng hai đứng lại ở ô đích đầu', baiLam: B(LAP(2, nhieu(CHO(4), ['go("R")', 'pull_s()', 'walk("RR")', 'magnet_off()', 'wait()'])), LAP(2, ['forward(4)', 'open_left()'])), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Mỗi trạm cách nhau 4 ô: R2 lặp 2 lần forward(4) rồi open_left().', 'Mỗi vòng R1 chờ van mở, bước lên sắt, hút, đi 2 bước qua cửa tới D, thả sắt rồi go("R") sang đứng trước mẩu sắt tiếp theo.']
    }),

    man({
      so: 20, ten: 'Trùm đội: phân loại qua cửa van', hang: 'trum', khung: { chinh: 16, moiHam: 10 },
      hamCuaEmCan: ['leap', 'sort_row', 'go', 'walk', 'push', 'open_left', 'forward'],
      deBai: 'Trùm chương 1. R1 nhảy qua hai cái hố bằng leap("RR"), rồi đi dọc hành lang qua hai cánh cửa C1, C2 để phân loại hai vật nam châm N và S bằng sort_row(). Ở làn dưới, R2 tiến 2 ô gọi open_left() phun van N mở cửa C1, rồi push(1) đẩy thùng H lên nút M mở cửa C2.',
      veMaMau: 'Chương trình có sẵn mới mở cửa đầu và xử lý vật thứ nhất. Viết tiếp cho cả hai robot.',
      san: ['#############', '#######D##D##', '#.u.u.Co.Co.#', '#######D##D##', '#..N###.....#', '#.....HM....#', '#############'],
      vatChat: ['.............', '.............', '.......N..S..', '.............', '.............', '.............', '.............'],
      mau: ['.............', '.......r..r..', '.............', '.......b..b..', '.............', '.............', '.............'],
      noi: [
        { nut: { x: 3, y: 4 }, cua: [{ x: 6, y: 2 }], bang: [] },
        { nut: { x: 7, y: 5 }, cua: [{ x: 9, y: 2 }], bang: [] }
      ],
      bd: [{ x: 1, y: 2, huong: 1 }, { x: 1, y: 5, huong: 1 }],
      maMau: B(['leap("RR")', 'go("R")', 'sort_row()'], ['forward(2)', 'open_left()']),
      loiGiai: B(
        ['leap("RR")', 'go("R")', 'sort_row()', 'go("D")', 'walk("RR")', 'sort_row()'],
        ['forward(2)', 'open_left()', 'push(1)']
      ),
      sao: { o: 55, nhip: 24 },
      loiSai: [
        { moTa: 'R2 chỉ mở van đầu mà quên push(1): cửa C2 vẫn đóng', baiLam: B(['leap("RR")', 'go("R")', 'sort_row()', 'go("D")', 'walk("RR")', 'sort_row()'], ['forward(2)', 'open_left()']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'R1 quên go("D") sau khi thả vật N lên ô đích đỏ trên', baiLam: B(['leap("RR")', 'go("R")', 'sort_row()', 'walk("RR")', 'sort_row()'], ['forward(2)', 'open_left()', 'push(1)']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      goiY: ['Trong lúc R1 nhảy qua hai hố (6 nhịp), R2 tiến 2 ô tới (3,5) và open_left() mở cửa C1 ở nhịp 5.', 'Sau đó R2 gọi push(1) đẩy thùng H lên nút M(7,5) mở cửa C2 trước khi R1 phân loại xong vật đầu và đi tới C2.']
    })
  ];

  /* ================================================= chương che-doi-xich "Đội xích và nhện phối hợp" ================================================= */
  function che(m) { m.chuong = 'che-doi-xich'; return man(m); }
  var T_IDLE = LAP('n', 'wait()');
  var T_VALVE = ['forward(n)', 'squirt("low")'];
  var T_HOP = ['pull_s()', 'jump(d)', 'magnet_off()', 'wait()'];
  function hIdle(than) { return H('wait_n', ['n'], than || T_IDLE); }
  function hValve(than) { return H('valve_go', ['n'], than || T_VALVE); }
  function hHop(than) { return H('hop_iron', ['d'], than || T_HOP); }

  DS.push(
    che({
      so: 11, ten: 'Hàm chờ của màn', hang: 'lam-quen', chiChay: true, chinhCoDinh: true, khoa: [0, 1], khoaHamMan: ['rest'], mucTieu: 'toi-co',
      hamCuaEmCan: ['walk', 'move', 'squirt', 'back'],
      deBai: 'Cánh cửa C trước mặt R1 chỉ mở sau khi R2 tiến lên phun van hơi N rồi lùi về cờ. Hàm rest(n) của màn giúp R1 chờ đúng n nhịp trước khi bước qua cửa. Mở Xưởng xem rest(n) rồi bấm Chạy.',
      veMaMau: 'Hai chương trình và hàm của màn đã viết sẵn, khoá. Bấm Chạy.',
      san: ['########', '#..CF..#', '#..#...#', '#.F..N.#', '########'],
      noi: [{ nut: { x: 5, y: 3 }, cua: [{ x: 3, y: 1 }], bang: [] }],
      bd: [{ x: 2, y: 1, huong: 1 }, { x: 3, y: 3, huong: 1 }],
      co: [[{ x: 4, y: 1 }], [{ x: 2, y: 3 }]],
      maMau: B(['rest(2)', 'walk("RR")'], ['move()', 'squirt("low")', 'back()', 'back()'], { hamCuaMan: [H('rest', ['n'], T_IDLE)] }),
      loiGiai: B(['rest(2)', 'walk("RR")'], ['move()', 'squirt("low")', 'back()', 'back()'], { hamCuaMan: [H('rest', ['n'], T_IDLE)] }),
      sao: { o: 26, nhip: 6 },
      goiY: ['rest(n) lặp wait() đúng n lần.', 'Màn sau em sẽ tự tạo hàm wait_n(n) giống vậy để dùng suốt gói.']
    }),

    che({
      so: 12, ten: 'Hàm wait_n(n)', hang: 'lam-quen', taoHam: ['wait_n'], vatCan: 'sat',
      hamCuaEmCan: ['pull_s', 'walk', 'forward', 'squirt'],
      deBai: 'Tạo hàm wait_n(n): for i in range(n): wait(). R1 đứng sẵn trên mẩu sắt ngay trước cánh cửa C đang đóng. R2 cần 4 nhịp để tiến 3 ô tới van N và squirt("low") mở cửa. Cho R1 hút sắt, gọi wait_n(3) chờ cửa mở rồi mới bước qua cửa tới ô đích D.',
      veMaMau: 'Chương trình có sẵn gọi wait_n(3) nhưng em chưa có hàm đó. Bấm Hàm mới để tạo wait_n(n).',
      san: ['#########', '#..oCD..#', '#...#...#', '#....N..#', '#########'],
      vatChat: ['.........', '...s.....', '.........', '.........', '.........'],
      noi: [{ nut: { x: 5, y: 3 }, cua: [{ x: 4, y: 1 }], bang: [] }],
      bd: [{ x: 3, y: 1, huong: 1 }, { x: 1, y: 3, huong: 1 }],
      maMau: B(['pull_s()', 'wait_n(3)', 'walk("RR")', 'magnet_off()', 'wait()'], ['forward(3)', 'squirt("low")']),
      loiGiai: B(['pull_s()', 'wait_n(3)', 'walk("RR")', 'magnet_off()', 'wait()'], ['forward(3)', 'squirt("low")'], { hamCuaEmMoi: [hIdle()] }),
      sao: { o: 28, nhip: 9 },
      loiSai: [
        { moTa: 'Chưa tạo hàm wait_n mà đã gọi nó', baiLam: B(['pull_s()', 'wait_n(3)', 'walk("RR")', 'magnet_off()', 'wait()'], ['forward(3)', 'squirt("low")']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'R1 không chờ: húc vào cửa C khi R2 chưa kịp phun van', baiLam: B(['pull_s()', 'walk("RR")', 'magnet_off()', 'wait()'], ['forward(3)', 'squirt("low")']), hamCuaEmMoi: [hIdle()], phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      goiY: ['Thân hàm wait_n(n) có hai dòng: for i in range(n): rồi wait().', 'R1 hút sắt ở nhịp 1..2, chờ 3 nhịp (nhịp 3..5) khi R2 phun van ở nhịp 4.']
    }),

    che({
      so: 13, ten: 'Nhện giữ nút bằng wait_n', hang: 'lam-quen', vatCan: 'sat',
      hamCuaEmCan: ['jump', 'wait_n', 'go', 'pull_s', 'walk', 'forward', 'squirt'],
      deBai: 'Màn Nhện đè nút, xích qua cửa viết gọn lại bằng wait_n(n): R1 nhảy qua hố lên nút M, gọi wait_n(2) giữ cửa C1 cho R2 đi qua tới phun van N, rồi R1 bước sang lấy sắt mang qua cửa C2 tới ô đích D.',
      veMaMau: 'Chương trình có sẵn thiếu wait_n(2) ở R1. Thêm wait_n(2) cho R1 và hoàn thiện R2.',
      san: ['###########', '#.uMo..CD.#', '#...###...#', '#......C.N#', '###########'],
      vatChat: ['...........', '....s......', '...........', '...........', '...........'],
      noi: [
        { nut: { x: 3, y: 1 }, cua: [{ x: 7, y: 3 }], bang: [] },
        { nut: { x: 9, y: 3 }, cua: [{ x: 7, y: 1 }], bang: [] }
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 3, huong: 1 }],
      maMau: B(['jump("R")', 'go("R")', 'pull_s()', 'walk("RRRR")', 'magnet_off()', 'wait()'], ['forward(7)']),
      loiGiai: B(['jump("R")', 'wait_n(2)', 'go("R")', 'pull_s()', 'walk("RRRR")', 'magnet_off()', 'wait()'], ['forward(7)', 'squirt("low")']),
      sao: { o: 34, nhip: 17 },
      loiSai: [
        { moTa: 'R1 quên wait_n(2) trên nút M: cửa C1 đóng trước mặt R2', baiLam: B(['jump("R")', 'go("R")', 'pull_s()', 'walk("RRRR")', 'magnet_off()', 'wait()'], ['forward(7)', 'squirt("low")']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'R2 quên squirt("low") ở cuối: cửa C2 vẫn đóng', baiLam: B(['jump("R")', 'wait_n(2)', 'go("R")', 'pull_s()', 'walk("RRRR")', 'magnet_off()', 'wait()'], ['forward(7)']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      goiY: ['R1 gọi wait_n(2) ngay sau jump("R") để đứng yên trên nút M hai nhịp cho R2 đi qua C1(7,3).', 'R2 gọi forward(7) rồi squirt("low") để mở cửa C2(7,1).']
    }),

    che({
      so: 14, ten: 'Hàm valve_go(n)', hang: 'luyen', taoHam: ['valve_go'], vatCan: 'sat',
      hamCuaEmCan: ['forward', 'squirt', 'jump', 'pull_s', 'wait_n', 'walk', 'go'],
      deBai: 'Tạo hàm valve_go(n) cho R2: tiến n ô bằng forward(n) rồi squirt("low") phun van hơi trước mặt. R2 gọi valve_go(4) để mở cửa C cho R1. R1 nhảy qua hố lên mẩu sắt, hút lên rồi bước qua cửa về ô đích D.',
      veMaMau: 'Chương trình có sẵn gọi valve_go(4) nhưng em chưa tạo hàm đó. Bấm Hàm mới.',
      san: ['##########', '#.u.oCD..#', '#...#....#', '#.....N..#', '##########'],
      vatChat: ['..........', '....s.....', '..........', '..........', '..........'],
      noi: [{ nut: { x: 6, y: 3 }, cua: [{ x: 5, y: 1 }], bang: [] }],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 3, huong: 1 }],
      maMau: B(['jump("R")', 'go("R")', 'pull_s()', 'walk("RR")', 'magnet_off()', 'wait()'], ['valve_go(4)']),
      loiGiai: B(['jump("R")', 'go("R")', 'pull_s()', 'walk("RR")', 'magnet_off()', 'wait()'], ['valve_go(4)'], { hamCuaEmMoi: [hValve()] }),
      sao: { o: 32, nhip: 11 },
      loiSai: [
        { moTa: 'Chưa tạo hàm valve_go mà đã gọi nó', baiLam: B(['jump("R")', 'go("R")', 'pull_s()', 'walk("RR")', 'magnet_off()', 'wait()'], ['valve_go(4)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong hàm viết cứng forward(1) thay vì forward(n): R2 dừng quá xa van N', baiLam: B(['jump("R")', 'go("R")', 'pull_s()', 'walk("RR")', 'magnet_off()', 'wait()'], ['valve_go(4)']), hamCuaEmMoi: [hValve(['forward(1)', 'squirt("low")'])], phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      goiY: ['Thân hàm valve_go(n) gồm hai dòng: forward(n) và squirt("low").', 'Nhớ dùng tham số n trong forward(n).']
    }),

    che({
      so: 15, ten: 'Hàm hop_iron(d)', hang: 'luyen', taoHam: ['hop_iron'], vatCan: 'sat',
      hamCuaEmCan: ['pull_s', 'jump', 'valve_go', 'wait_n', 'walk'],
      deBai: 'Tạo hàm hop_iron(d) cho R1: hút sắt dưới bụng bằng pull_s(), nhảy qua hố về phía d bằng jump(d), rồi magnet_off(), wait() thả xuống. Ô đích D và mẩu sắt nằm bên trái cánh cửa C; R2 gọi valve_go(3) mở cửa C, R1 chờ bằng wait_n(4), đi qua cửa tới mẩu sắt rồi hop_iron("L") qua hố vào D.',
      veMaMau: 'Chương trình có sẵn gọi hop_iron("L") nhưng em chưa tạo hàm đó. Bấm Hàm mới.',
      san: ['##########', '##DuoC...#', '###.#....#', '#....N...#', '##########'],
      vatChat: ['..........', '....s.....', '..........', '..........', '..........'],
      noi: [{ nut: { x: 5, y: 3 }, cua: [{ x: 5, y: 1 }], bang: [] }],
      bd: [{ x: 6, y: 1, huong: 1 }, { x: 1, y: 3, huong: 1 }],
      maMau: B(['wait_n(4)', 'walk("LL")', 'hop_iron("L")'], ['valve_go(3)']),
      loiGiai: B(['wait_n(4)', 'walk("LL")', 'hop_iron("L")'], ['valve_go(3)'], { hamCuaEmMoi: [hHop()] }),
      sao: { o: 35, nhip: 13 },
      loiSai: [
        { moTa: 'Chưa tạo hàm hop_iron mà đã gọi nó', baiLam: B(['wait_n(4)', 'walk("LL")', 'hop_iron("L")'], ['valve_go(3)']), phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong hàm viết cứng jump("R") thay vì jump(d): R1 nhảy ngược sang phải', baiLam: B(['wait_n(4)', 'walk("LL")', 'hop_iron("L")'], ['valve_go(3)']), hamCuaEmMoi: [hHop(['pull_s()', 'jump("R")', 'magnet_off()', 'wait()'])], phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Thân hàm hop_iron(d): pull_s(), jump(d), magnet_off(), wait().', 'Nhớ truyền d vào jump(d) để nhảy được mọi hướng.']
    }),

    che({
      so: 16, ten: 'Hai hướng nhảy sắt', hang: 'luyen', vatCan: 'sat',
      hamCuaEmCan: ['go', 'hop_iron', 'valve_go'],
      deBai: 'Hai mẩu sắt, hai cái hố theo hai hướng khác nhau: bước lên mẩu sắt đầu rồi nhảy sang phải vào D(4,1), mẩu sắt thứ hai nằm sau cửa C1 và cần nhảy xuống qua hố vào D(6,3). R2 gọi valve_go(2) mở cửa C1. R1 dùng go("R"), hop_iron("R"), bước hai lần go("R") qua cửa rồi gọi hop_iron("D").',
      veMaMau: 'Chương trình có sẵn mới làm xong mẩu sắt đầu. Viết tiếp cho R1.',
      san: ['##########', '#.ouDCo..#', '######u###', '######D###', '#...N....#', '##########'],
      vatChat: ['..........', '..s...s...', '..........', '..........', '..........', '..........'],
      noi: [
        { nut: { x: 4, y: 4 }, cua: [{ x: 5, y: 1 }], bang: [] }
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 4, huong: 1 }],
      maMau: B(['go("R")', 'hop_iron("R")'], ['valve_go(2)']),
      loiGiai: B(['go("R")', 'hop_iron("R")', 'go("R")', 'go("R")', 'hop_iron("D")'], ['valve_go(2)']),
      sao: { o: 33, nhip: 16 },
      loiSai: [
        { moTa: 'R2 không mở van: cửa C1 đóng, R1 không sang được mẩu sắt thứ hai', baiLam: B(['go("R")', 'hop_iron("R")', 'go("R")', 'go("R")', 'hop_iron("D")'], []), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'Mẩu sắt thứ hai nhảy sang phải thay vì nhảy xuống: lệch đích', baiLam: B(['go("R")', 'hop_iron("R")', 'go("R")', 'go("R")', 'hop_iron("R")'], ['valve_go(2)']), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['R1 bước sang (2,1) gọi hop_iron("R") thả sắt đầu vào D(4,1), rồi hai lần go("R") qua cửa C1(5,1) sang sắt thứ hai ở (6,1), gọi hop_iron("D") qua hố (6,2) xuống D(6,3).', 'R2 gọi valve_go(2) phun van N(4,4) mở cửa C1(5,1).']
    }),

    che({
      so: 17, ten: 'Sửa hàm go_mark()', hang: 'bien-the', vatCan: 'sat',
      hamCuaEmCan: ['crawl', 'jump', 'walk', 'wait_n', 'go', 'pull_s', 'valve_go'],
      deBai: 'Đường của R1 qua gầm và hố tới nút M được gói trong hàm go_mark() của màn, nhưng hàm viết nhầm go("R") ở chỗ hố nên R1 rơi xuống hố. Sửa go_mark(), cho R1 đứng trên nút M bằng wait_n(2) để R2 qua cửa C1 gọi valve_go(4) mở cửa C2, rồi R1 mang sắt về D.',
      veMaMau: 'Chạy thử: R1 rơi xuống hố. Mở Xưởng sửa go_mark() và viết tiếp.',
      san: ['###########', '#.n.uMo.CD#', '#....##...#', '#..C...N..#', '###########'],
      vatChat: ['...........', '......s....', '...........', '...........', '...........'],
      noi: [
        { nut: { x: 5, y: 1 }, cua: [{ x: 3, y: 3 }], bang: [] },
        { nut: { x: 7, y: 3 }, cua: [{ x: 8, y: 1 }], bang: [] }
      ],
      bd: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 3, huong: 1 }],
      maMau: B(['go_mark()', 'go("R")', 'pull_s()', 'walk("RRR")', 'magnet_off()', 'wait()'], ['wait_n(9)', 'valve_go(4)'], { hamCuaMan: [H('go_mark', [], ['crawl("R")', 'go("R")'])] }),
      loiGiai: B(['go_mark()', 'wait_n(2)', 'go("R")', 'pull_s()', 'walk("RRR")', 'magnet_off()', 'wait()'], ['wait_n(9)', 'valve_go(4)'], { hamCuaMan: [H('go_mark', [], ['crawl("R")', 'jump("R")'])] }),
      sao: { o: 43, nhip: 20 },
      loiSai: [
        { moTa: 'Giữ hàm go_mark() sai: R1 bước vào hố', baiLam: B(['go_mark()', 'wait_n(2)', 'go("R")', 'pull_s()', 'walk("RRR")', 'magnet_off()', 'wait()'], ['wait_n(9)', 'valve_go(4)'], { hamCuaMan: [H('go_mark', [], ['crawl("R")', 'go("R")'])] }), phaiCoMa: ['roi-ho'] },
        { moTa: 'Sửa hàm nhưng R1 không wait_n(2) trên nút M: cửa C1 đóng trước mặt R2', baiLam: B(['go_mark()', 'go("R")', 'pull_s()', 'walk("RRR")', 'magnet_off()', 'wait()'], ['wait_n(9)', 'valve_go(4)'], { hamCuaMan: [H('go_mark', [], ['crawl("R")', 'jump("R")'])] }), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      goiY: ['Trong go_mark(), đổi go("R") thành jump("R") để bật qua hố u tới nút M(5,1).', 'R1 tới nút M ở cuối nhịp 9; R2 wait_n(9) rồi valve_go(4) đi qua cửa C1(3,3) tới phun van N(7,3).']
    }),

    che({
      so: 18, ten: 'Chờ bạn rồi phun mạnh', hang: 'bien-the', vatCan: 'sat',
      hamCuaEmCan: ['go', 'walk', 'wait_n', 'hop_iron', 'wait_clear', 'fence_shot', 'push', 'tr_right'],
      deBai: 'R1 xuất phát ngay trước mũi vòi phun của R2. R2 gọi wait_clear() chờ R1 bước sang phải, rồi fence_shot() phun mạnh tới van N mở cửa C1, quay phải và push(1) đẩy thùng H lên nút M mở cửa C2. R1 bước sang phải nhường tia, wait_n(6) chờ cả hai cửa mở rồi walk("RRR") qua hai cửa tới mẩu sắt và hop_iron("R") vào D.',
      veMaMau: 'Chương trình có sẵn: R2 chưa chờ R1, R1 chưa chờ hai cửa mở. Viết tiếp cho cả hai.',
      san: ['############', '####N#######', '#.....CCouD#', '####.#######', '#.....HM...#', '#..........#', '############'],
      vatChat: ['............', '............', '........s...', '............', '............', '............', '............'],
      noi: [
        { nut: { x: 4, y: 1 }, cua: [{ x: 6, y: 2 }], bang: [] },
        { nut: { x: 7, y: 4 }, cua: [{ x: 7, y: 2 }], bang: [] }
      ],
      bd: [{ x: 4, y: 2, huong: 1 }, { x: 4, y: 4, huong: 0 }],
      maMau: B(['go("R")', 'walk("RRR")', 'hop_iron("R")'], ['fence_shot()']),
      loiGiai: B(['go("R")', 'wait_n(6)', 'walk("RRR")', 'hop_iron("R")'], ['wait_clear()', 'fence_shot()', 'tr_right()', 'push(1)']),
      sao: { o: 45, nhip: 19 },
      loiSai: [
        { moTa: 'R2 dùng squirt("low") thay vì fence_shot(): tia nước chỉ bay 2 ô, không tới van N', baiLam: B(['go("R")', 'wait_n(6)', 'walk("RRR")', 'hop_iron("R")'], ['wait_clear()', 'squirt("low")', 'tr_right()', 'push(1)']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'R2 quên push(1): cửa C2 vẫn đóng', baiLam: B(['go("R")', 'wait_n(6)', 'walk("RRR")', 'hop_iron("R")'], ['wait_clear()', 'fence_shot()']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      goiY: ['R2 gọi wait_clear() chờ R1 rời (4,2), rồi fence_shot() phun mạnh 3 ô tới van N(4,1) mở cửa C1(6,2), tiếp theo tr_right() và push(1) đẩy thùng H(6,4) lên nút M(7,4) mở cửa C2(7,2).', 'R1 go("R") sang (5,2), wait_n(6) chờ cả hai cửa mở, rồi walk("RRR") tới sắt(8,2) và hop_iron("R") vào D(10,2).']
    }),

    che({
      so: 19, ten: 'Đội phân loại hai cực', hang: 'bien-the',
      hamCuaEmCan: ['wait_n', 'sort_row', 'go', 'walk', 'valve_go', 'tr_right', 'tr_left'],
      deBai: 'Hai vật nam châm N và S nằm sau hai cánh cửa C1, C2 trên hành lang của R1; phía trên mỗi vật là ô đích đỏ, phía dưới là ô đích xanh. R2 gọi valve_go(2) mở cửa C1, rồi lách xuống một hàng gọi valve_go(2) mở cửa C2. R1 chờ cửa mở rồi dùng sort_row() phân loại từng vật.',
      veMaMau: 'Chương trình có sẵn mới phân loại vật đầu. Viết tiếp cho cả hai robot.',
      san: ['##########', '####D##D##', '#..Co.Co.#', '####D##D##', '#...N#...#', '#......N.#', '##########'],
      vatChat: ['..........', '..........', '....N..S..', '..........', '..........', '..........', '..........'],
      mau: ['..........', '....r..r..', '..........', '....b..b..', '..........', '..........', '..........'],
      noi: [
        { nut: { x: 4, y: 4 }, cua: [{ x: 3, y: 2 }], bang: [] },
        { nut: { x: 7, y: 5 }, cua: [{ x: 6, y: 2 }], bang: [] }
      ],
      bd: [{ x: 2, y: 2, huong: 1 }, { x: 1, y: 4, huong: 1 }],
      maMau: B(['wait_n(3)', 'go("R")', 'sort_row()'], ['valve_go(2)']),
      loiGiai: B(
        ['wait_n(3)', 'go("R")', 'sort_row()', 'go("D")', 'walk("RR")', 'sort_row()'],
        ['valve_go(2)', 'tr_right()', 'move()', 'tr_left()', 'valve_go(2)']
      ),
      sao: { o: 52, nhip: 21 },
      loiSai: [
        { moTa: 'R2 chỉ mở cửa đầu: cửa thứ hai vẫn đóng, R1 húc cửa', baiLam: B(['wait_n(3)', 'go("R")', 'sort_row()', 'go("D")', 'walk("RR")', 'sort_row()'], ['valve_go(2)']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'R1 không chờ cửa C1 mở mà bước ngay: húc vào cửa C1', baiLam: B(['go("R")', 'sort_row()', 'go("D")', 'walk("RR")', 'sort_row()'], ['valve_go(2)', 'tr_right()', 'move()', 'tr_left()', 'valve_go(2)']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] }
      ],
      goiY: ['R2 mở van đầu bằng valve_go(2), lách xuống một hàng rồi gọi valve_go(2) mở van thứ hai.', 'Sau sort_row() đầu tiên thả vật N ở D đỏ(4,1), R1 gọi go("D") về (4,2), walk("RR") sang C2(6,2) rồi sort_row().']
    }),

    che({
      so: 20, ten: 'Trùm phối hợp: dây chuyền hai robot', hang: 'trum', khung: { chinh: 16, moiHam: 10 },
      hamCuaEmCan: ['crawl', 'go', 'hop_iron', 'walk', 'sort_row', 'valve_go', 'push', 'tr_right'],
      deBai: 'Trùm gói Đội: một mẩu sắt và một vật nam châm N trên dây chuyền. R2 gọi valve_go(1) mở cửa C1 cho R1 nhảy mang sắt qua hố vào ô đích đầu, rồi R2 quay phải gọi push(1) đẩy thùng H lên nút M mở cửa C2 cho R1 phân loại vật nam châm bằng sort_row().',
      veMaMau: 'Chương trình có sẵn mới làm xong mẩu sắt đầu. Viết tiếp cho cả hai robot.',
      san: ['############', '#########D##', '#.n.CouDCo.#', '####N####D##', '#.....HM...#', '#..........#', '############'],
      vatChat: ['............', '............', '.....s...N..', '............', '............', '............', '............'],
      mau: ['............', '.........r..', '............', '.........b..', '............', '............', '............'],
      noi: [
        { nut: { x: 4, y: 3 }, cua: [{ x: 4, y: 2 }], bang: [] },
        { nut: { x: 7, y: 4 }, cua: [{ x: 8, y: 2 }], bang: [] }
      ],
      bd: [{ x: 1, y: 2, huong: 1 }, { x: 4, y: 5, huong: 0 }],
      maMau: B(['crawl("R")', 'walk("RR")', 'hop_iron("R")'], ['valve_go(1)']),
      loiGiai: B(
        ['crawl("R")', 'walk("RR")', 'hop_iron("R")', 'go("R")', 'sort_row()'],
        ['valve_go(1)', 'tr_right()', 'push(1)']
      ),
      sao: { o: 60, nhip: 21 },
      loiSai: [
        { moTa: 'R2 chỉ mở cửa đầu mà không đẩy thùng: cửa C2 vẫn đóng', baiLam: B(['crawl("R")', 'walk("RR")', 'hop_iron("R")', 'go("R")', 'sort_row()'], ['valve_go(1)']), phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'R1 quên hop_iron("R") cho mẩu sắt đầu: bước thẳng vào hố', baiLam: B(['crawl("R")', 'walk("RRRR")', 'go("R")', 'sort_row()'], ['valve_go(1)', 'tr_right()', 'push(1)']), phaiCoMa: ['roi-ho'] }
      ],
      goiY: ['R1 chui gầm bằng crawl("R"), đi tới sắt đầu bằng walk("RR"), gọi hop_iron("R") thả sắt vào D(7,2), rồi go("R") qua cửa C2(8,2) và sort_row() phân loại vật N ở (9,2).', 'R2 xuất phát ở (4,5) hướng lên: gọi valve_go(1) tiến tới (4,4) và phun van N(4,3) mở cửa C1(4,2), sau đó tr_right() rồi push(1) đẩy thùng H(6,4) lên nút M(7,4) mở cửa C2(8,2).']
    })
  );

  ManHoc.manDoiXichNhen = DS;
  if (laNode) module.exports = ManHoc;
})();
