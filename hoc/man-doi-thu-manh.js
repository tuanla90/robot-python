/* ============================================================================
   man-doi-thu-manh.js — "Robot Chấn Hưng": GÓI THỬ THÁCH "ĐỌ SỨC PART MẠNH" (10 màn, chương `doi-thu-manh`, 26/10). Kế hoạch: hoc/KE-HOACH-DOI-THU-MANH.md.
   Mọi màn bật `doiKhang: true` như gói Đua đối kháng (man-dua-robot.js, luật ở san-hoc.js + cham.js):
   - R1 (sơn vàng, người chơi): CHỈ part mùa 1, hai bánh + tay kẹp + cảm biến khoảng cách; mọi hàm cần dùng học ở mùa 1.
   - R2 (sơn đỏ, `coDinh`): MỘT part mạnh mỗi màn (xích, omni, nhện, drone, súng hơi, nam châm, máy ném), chương trình khóa, chạy bằng bộ hàm riêng
     `khoDoiThu` (không mượn kho của người chơi). Vòng chờ của R2 luôn có giới hạn (R2 bỏ cuộc thay vì treo).
   - R1 phải xong mục tiêu trước khi R2 chạm cờ F; cùng nhịp thì R1 thua. Part mạnh nào cũng có giá: R1 thắng nhờ ĐỌC CODE R2 tìm điểm yếu của part đó.
   - `m.doiThu` = { part, manh: [...], yeu: [...] }: thẻ "ĐỐI THỦ" khi vào màn (game/the-part.js, ThePart.doiThu).
   Mỗi màn: hai lời sai (bảng SAI), lời giải khác 2 sao (thêm dòng chú thích), hamCuaEmCan theo đúng hàm lời giải dùng.
   Đường tắt: node tools/do-tat-dua.mjs (do-duong-dua-robot.mjs). Gói neo ngay sau gói Đua đối kháng (sau che-dua-robot), cuối mùa 4.
   Hướng: 0 lên, 1 phải, 2 xuống, 3 trái. (x, y) với y = 0 ở hàng trên.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var TAY = ['arm_down', 'arm_up', 'grab', 'release'];
  var BA_HUONG = ['front_clear', 'left_clear', 'right_clear'];
  var CAM = [{ ma: 'khoang-cach', o: 'hong' }];
  var R1 = { loaiRobot: 'banh', robot: { than: 'hai-banh', tay: 'kep', camBien: CAM, son: 'vang' }, hamGoc: BANH.concat(TAY, BA_HUONG) };

  function sao(x) { return JSON.parse(JSON.stringify(x)); }
  function ham(ten, than, thamSo) { return { ten: ten, thamSo: thamSo || [], than: than.slice() }; }
  function FOR(n, body) { return ['for i in range(' + n + '):'].concat(body.map(function (s) { return '    ' + s; })); }
  function B(c1, c2, hm) { return { doi: [{ chinh: c1.slice() }, { chinh: c2.slice() }], hamCuaMan: (hm || []).map(function (f) { return ham(f.ten, f.than, f.thamSo); }) }; }

  /** R2 theo part mạnh. Mọi R2 có cảm biến khoảng cách (trừ nhện, drone: không có hướng mặt) để chương trình khóa chờ được khi bị chắn. */
  var R2 = {
    xich: function () { return { loaiRobot: 'xich', robot: { than: 'xich', tay: null, camBien: CAM, son: 'do' }, hamGoc: BANH.concat(['front_clear']) }; },
    omni: function () { return { loaiRobot: 'omni', robot: { than: 'omni', tay: null, camBien: CAM, son: 'do' }, hamGoc: BANH.concat(['slide_left', 'slide_right', 'front_clear']) }; },
    nhen: function () { return { loaiRobot: 'nhen', robot: { than: 'nhen', tay: null, camBien: [], son: 'do' }, hamGoc: ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'crouch', 'stand'] }; },
    drone: function (pin) { return { loaiRobot: 'drone', robot: { than: 'drone', tay: null, camBien: [{ ma: 'pin', o: 'than' }], son: 'do' }, hamGoc: ['go_up', 'go_down', 'go_left', 'go_right', 'wait', 'battery'], pin: pin }; },
    hoi: function () { return { loaiRobot: 'banh', robot: { than: 'hai-banh', tay: 'hoi', camBien: CAM, son: 'do' }, hamGoc: BANH.concat(['shoot', 'shoot_back', 'front_clear']) }; },
    namCham: function () { return { loaiRobot: 'banh', robot: { than: 'hai-banh', tay: 'nam-cham', camBien: CAM, son: 'do' }, hamGoc: BANH.concat(['magnet_n', 'magnet_s', 'magnet_off', 'front_clear']) }; },
    nem: function () { return { loaiRobot: 'banh', robot: { than: 'hai-banh', tay: 'nem', camBien: CAM, son: 'do' }, hamGoc: BANH.concat(['aim', 'load', 'throw', 'front_clear']) }; }
  };

  // Bộ hàm RIÊNG của R2 (man.khoDoiThu): bản chuẩn của hàm cốt truyện; thêm tr_left / tr_right quay 90° của xích (2 nhịp).
  var KHO_DOI_THU = [
    ham('move', ['left_move()', 'right_move()', 'wait()']),
    ham('back', ['left_back()', 'right_back()', 'wait()']),
    ham('turn_left', ['left_back()', 'wait()']),
    ham('turn_right', ['left_move()', 'wait()']),
    ham('u_turn', ['left_back()', 'right_move()', 'wait()']),
    ham('pick', ['arm_down()', 'grab()', 'wait()', 'arm_up()', 'wait()']),
    ham('drop', ['arm_down()', 'release()', 'wait()', 'arm_up()', 'wait()']),
    ham('go_wall', ['while front_clear():', '    move()']),
    ham('tr_right', FOR(2, ['left_move()', 'wait()'])),
    ham('tr_left', FOR(2, ['right_move()', 'wait()']))
  ];
  var HAM_R1 = ['move', 'back', 'turn_left', 'turn_right', 'u_turn', 'pick', 'drop', 'go_wall'];

  /** Hàm của em mà lời giải R1 cần (chương trình chính + thân hàm của màn); go_wall() kéo theo move(). */
  function hamCan(c1, hm) {
    var nguon = (c1 || []).concat.apply(c1 || [], (hm || []).map(function (h) { return h.than; })).join('\n');
    var kq = HAM_R1.filter(function (t) { return new RegExp('(^|[^a-z_])' + t + '\\(').test(nguon); });
    if (kq.indexOf('go_wall') >= 0 && kq.indexOf('move') < 0) kq.unshift('move');
    return kq;
  }

  // Ngưỡng 3 sao { o, nhip } đo bằng ChamHoc.cham (kho như người chơi đi tuần tự)
  var SAO = {
    'doi-thu-manh.1':  { o: 17, nhip: 7 },
    'doi-thu-manh.2':  { o: 20, nhip: 7 },
    'doi-thu-manh.3':  { o: 17, nhip: 6 },
    'doi-thu-manh.4':  { o: 35, nhip: 17 },
    'doi-thu-manh.5':  { o: 25, nhip: 13 },
    'doi-thu-manh.6':  { o: 17, nhip: 7 },
    'doi-thu-manh.7':  { o: 33, nhip: 8 },
    'doi-thu-manh.8':  { o: 18, nhip: 4 },
    'doi-thu-manh.9':  { o: 32, nhip: 17 },
    'doi-thu-manh.10': { o: 21, nhip: 21 }
  };

  // Lời sai của từng màn: lỗi R1 hay gặp (khác chương trình mẫu), mã chẩn đoán đo bằng ChamHoc.cham.
  function S(moTa, c1, phaiCoMa, hm) { return { moTa: moTa, c1: c1, phaiCoMa: phaiCoMa, hm: hm || null }; }
  var SAI = {
    'doi-thu-manh.1': [S('Rẽ nhầm sang trái', ['go_wall()', 'turn_left()', 'go_wall()'], ['doi-thu-thang']), S('Quay trái ba lần thay vì quay phải một lần', ['go_wall()', 'turn_left()', 'turn_left()', 'turn_left()', 'go_wall()'], ['doi-thu-thang'])],
    'doi-thu-manh.2': [S('Quay phải ngay đầu: trước mặt là tường', ['turn_right()', 'go_wall()'], ['doi-thu-thang']), S('Quay qua quay lại trên ô băng nên bị đẩy lùi', ['move()', 'move()', 'turn_right()', 'move()', 'move()', 'move()', 'turn_left()', 'turn_right()', 'move()'], ['doi-thu-thang'])],
    'doi-thu-manh.3': [S('Rẽ nhầm sang trái ở góc trên', ['go_wall()', 'turn_left()', 'move()', 'move()'], ['doi-thu-thang']), S('Thiếu một bước cuối', ['go_wall()', 'turn_right()', 'move()'], ['doi-thu-thang'])],
    'doi-thu-manh.4': [S('Bịt khe rồi quên quay đầu', ['pick()', 'u_turn()', 'drop()', 'go_wall()'], ['chua-toi-co']), S('Thả hộp lại chỗ cũ, khe vẫn hở', ['pick()', 'drop()', 'go_wall()', 'turn_right()', 'go_wall()', 'turn_right()', 'go_wall()'], ['doi-thu-thang'])],
    'doi-thu-manh.5': [S('Chờ chỉ một nhịp nên rời chỗ trước khi R2 bắn', ['move()', 'wait()', 'go_wall()', 'turn_right()', 'go_wall()', 'turn_right()', 'move()'], ['doi-thu-thang']),
      S('Đứng chờ ở ô xuất phát, không nằm trên đường đạn', ['wait()', 'wait()', 'wait()', 'go_wall()', 'turn_right()', 'go_wall()', 'turn_right()', 'move()'], ['doi-thu-thang'])],
    'doi-thu-manh.6': [S('Ra khỏi cổng rồi rẽ nhầm', ['go_wall()', 'turn_right()', 'go_wall()'], ['doi-thu-thang']), S('Rẽ trái ngay đầu, không đi vào cổng', ['turn_left()', 'go_wall()'], ['doi-thu-thang'])],
    'doi-thu-manh.7': [S('Đi vòng sang phải trước rồi mới nhặt: R2 hút mất hộp', ['turn_right()', 'move()', 'turn_left()', 'move()', 'turn_left()', 'pick()'], ['doi-thu-thang']), S('Nhặt rồi thả ở ô chưa phải đích', ['pick()', 'turn_left()', 'move()', 'turn_right()', 'move()', 'drop()'], ['doi-thu-thang'])],
    'doi-thu-manh.8': [S('Chờ hai nhịp nên hộp rơi chắn lối', ['wait()', 'wait()', 'go_wall()'], ['doi-thu-thang']), S('Quay phải: trước mặt là tường', ['turn_right()', 'go_wall()'], ['doi-thu-thang'])],
    'doi-thu-manh.9': [S('Nhặt hộp nhưng thả lại ngay chỗ cũ', ['pick()', 'drop()', 'turn_left()', 'go_wall()', 'turn_right()', 'go_wall()'], ['doi-thu-thang']),
      S('Đóng cửa xong quay nhầm sang phải: trước mặt là tường', ['pick()', 'u_turn()', 'drop()', 'turn_left()', 'go_wall()', 'turn_right()', 'go_wall()'], ['chua-toi-co'])],
    'doi-thu-manh.10': [S('Luôn quay trái', ['go_wall()', 'turn_left()', 'go_wall()'], ['doi-thu-thang']), S('Hỏi nhầm bên trái', ['go_wall()', 'if left_clear():', '    turn_right()', 'else:', '    turn_left()', 'go_wall()'], ['doi-thu-thang'])]
  };

  function taoMan(m) {
    var bd = m.bd, r2 = m.r2, r2Code = m.c2;
    delete m.bd; delete m.r2; delete m.c2;
    m.chuong = 'doi-thu-manh';
    m.ma = m.chuong + '.' + m.so;
    m.hang = m.so <= 3 ? 'lam-quen' : m.so <= 6 ? 'luyen' : m.so <= 9 ? 'bien-the' : 'trum';
    m.doiKhang = true;
    m.khoDoiThu = sao(KHO_DOI_THU);
    m.mucTieu = m.mucTieu || 'toi-co';
    m.loaiRobot = 'banh';
    m.robot = sao(R1.robot);
    m.hamGoc = R1.hamGoc.slice();
    m.cauTruc = ['for', 'if', 'while'];
    m.moXuong = true;
    m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    m.bienDem = true;
    if (Array.isArray(m.san[0])) m.nhipTheo = 'tong';
    m.nhipTheoLoiGiai = true;
    m.doi = [Object.assign({ batDau: bd[0] }, sao(R1)), Object.assign({ batDau: bd[1], coDinh: true }, r2)];
    m.batDau = bd[0];
    var hmMau = m.hmMau || [], hmGiai = m.hmGiai || [];
    delete m.hmMau; delete m.hmGiai;
    m.hamCuaEmCan = hamCan(m.c1Giai, hmGiai);
    m.maMau = B(m.c1Mau || [], r2Code, hmMau);
    m.loiGiai = B(m.c1Giai, r2Code, hmGiai);
    m.loiGiaiKhac = { moTa: 'Cùng cách giải, thêm một dòng chú thích', baiLam: B(['# đọc bài R2 trước khi viết'].concat(m.c1Giai), r2Code, hmGiai) };
    m.loiSai = (SAI[m.ma] || []).map(function (s) {
      return { moTa: s.moTa, baiLam: B(s.c1, r2Code, s.hm ? s.hm.map(function (h) { return ham(h[0], h[1]); }) : hmMau), phaiCoMa: s.phaiCoMa.slice() };
    });
    delete m.c1Mau; delete m.c1Giai;
    m.sao = SAO[m.ma] || { o: 99, nhip: 99 };
    return ManHoc.chuanHoa(m);
  }

  var DS = [
    // 1. Xích leo bậc thang đi tắt, nhưng mỗi lần tr_left() mất 2 nhịp.
    taoMan({
      so: 1, ten: 'Xích quay chậm',
      deBai: 'R2 là xe xích: leo thẳng bậc thang S để đi tắt tới cờ F. Nhưng xích quay một góc vuông mất 2 nhịp. Đọc chương trình R2, đếm nhịp, rồi đưa R1 tới cờ trước.',
      veMaMau: 'R1 mới chạy hết hàng dưới rồi dừng. Viết tiếp để R1 lên tới cờ.',
      san: ['#######', '#F....#', '#.###S#', '#.###.#', '#.....#', '#######'],
      bd: [{ x: 4, y: 4, huong: 3 }, { x: 5, y: 3, huong: 0 }],
      r2: R2.xich(),
      c2: ['move()', 'move()', 'tr_left()', 'go_wall()'],
      c1Mau: ['go_wall()'],
      c1Giai: ['go_wall()', 'turn_right()', 'go_wall()'],
      doiThu: { part: 'xich', manh: ['Leo được bậc thang S, nên đi tắt được', 'Băng chuyền không đẩy được'], yeu: ['Quay một góc vuông mất 2 nhịp: tr_left() = 2 nhịp'] },
      goiY: ['R2 lên bậc thang 2 nhịp, quay 2 nhịp rồi đi 4 ô: tới cờ ở nhịp 8.', 'R1 quay chỉ 1 nhịp: go_wall(), turn_right(), go_wall() là 7 nhịp.']
    }),

    // 2. Omni đứng trên băng 1 nhịp là bị đẩy (xe hai bánh phải 2 nhịp): R2 phải vòng tránh ô băng, R1 đi thẳng qua.
    taoMan({
      so: 2, ten: 'Omni gặp băng chuyền',
      deBai: 'R2 là xe omni: trượt ngang không cần quay. Nhưng băng chuyền đẩy omni ngay khi nó vừa bước lên, nên R2 phải vòng tránh ô băng. Xe hai bánh chỉ bị đẩy khi đứng trên băng 2 nhịp liền: đưa R1 qua băng tới cờ trước.',
      veMaMau: 'R1 dừng chờ một nhịp ngay trên ô băng nên bị đẩy lùi. Sửa cho R1 đi liền qua băng.',
      san: ['#######', '#...<F#', '#.###.#', '#.#.<.#', '###.#.#', '###...#', '#######'],
      bd: [{ x: 1, y: 3, huong: 0 }, { x: 3, y: 3, huong: 1 }],
      r2: R2.omni(),
      c2: ['slide_right()', 'wait()', 'slide_right()', 'wait()', 'move()', 'move()'].concat(FOR(4, ['slide_left()', 'wait()'])),
      c1Mau: ['move()', 'move()', 'turn_right()', 'move()', 'move()', 'move()', 'wait()', 'move()'],
      c1Giai: ['move()', 'move()', 'turn_right()', 'go_wall()'],
      doiThu: { part: 'omni', manh: ['Trượt ngang slide_left() / slide_right() mà không phải quay'], yeu: ['Băng chuyền đẩy omni ngay khi vừa bước lên: đi ngược băng là đứng im, phải vòng tránh'] },
      goiY: ['R2 vòng xuống dưới để tránh ô băng: tới cờ ở nhịp 8.', 'Xe hai bánh đứng trên băng 1 nhịp thì chưa bị đẩy: đi liền qua, đừng wait() trên băng.']
    }),

    // 3. Nhện nhảy qua hố đi thẳng, nhưng mỗi bước mất 2 nhịp.
    taoMan({
      so: 3, ten: 'Nhện chậm chân',
      deBai: 'R2 là nhện: nhảy qua hàng hố, đi thẳng lên cờ F. Nhưng nhện đi mỗi ô mất 2 nhịp. R1 không qua được hố nên phải đi vòng: đếm nhịp xem đường vòng của R1 có kịp không.',
      veMaMau: 'R1 mới chạy lên tới góc trên rồi dừng. Viết tiếp để R1 tới cờ.',
      san: ['#######', '#..F..#', '#.....#', '#.uuu.#', '#.....#', '###.###', '###.###', '#######'],
      bd: [{ x: 1, y: 4, huong: 0 }, { x: 3, y: 6 }],
      r2: R2.nhen(),
      c2: ['go_up()', 'crouch()', 'go_up()', 'stand()', 'go_up()', 'go_up()'],
      c1Mau: ['go_wall()'],
      c1Giai: ['go_wall()', 'turn_right()', 'move()', 'move()'],
      doiThu: { part: 'nhen', manh: ['Nhảy qua hố, leo bậc thang, đi 4 hướng không cần quay'], yeu: ['Mỗi bước go_up() / go_down()… mất 2 nhịp'] },
      goiY: ['R2 đi 4 bước, mỗi bước 2 nhịp: tới cờ ở nhịp 8.', 'Đường vòng của R1 dài 5 ô nhưng mỗi ô chỉ 1 nhịp.']
    }),

    // 4. Xích leo bậc thang lên khe hẹp ngay dưới cờ: R1 nhặt hộp bịt khe (xích không qua được vật) rồi đi đường vòng.
    taoMan({
      so: 4, ten: 'Bịt khe leo',
      deBai: 'R2 là xe xích: chờ 3 nhịp rồi leo hai bậc thang S lên thẳng cờ F. Xe hai bánh không leo được bậc, đường vòng của R1 rất xa nên chạy đua thì thua. Nhưng xích không đi qua được vật: hãy nhặt hộp, đặt bịt ô giữa hai bậc thang, rồi đi vòng tới cờ.',
      veMaMau: 'R1 chỉ nhặt hộp dọn đường rồi chạy tới cờ, nhưng R2 leo khe tới trước.',
      san: ['#######', '#....F#', '#.###S#', '#..o..#', '#####S#', '#####.#', '#####.#', '#######'],
      bd: [{ x: 4, y: 3, huong: 3 }, { x: 5, y: 6, huong: 0 }],
      r2: R2.xich(),
      c2: FOR(3, ['wait()']).concat(FOR(20, ['if front_clear():', '    move()', 'else:', '    wait()'])),
      c1Mau: ['pick()', 'go_wall()', 'turn_right()', 'go_wall()', 'turn_right()', 'go_wall()'],
      c1Giai: ['pick()', 'u_turn()', 'drop()', 'u_turn()', 'go_wall()'].concat(FOR(2, ['turn_right()', 'go_wall()'])),
      doiThu: { part: 'xich', manh: ['Leo bậc thang S lên khe hẹp sát cờ'], yeu: ['Không đi qua được vật nằm trên đường', 'Chờ 3 nhịp mới chạy (đọc code: 3 lần wait())'] },
      goiY: ['Hộp đặt ở ô (5, 3), giữa hai bậc thang, là bịt kín đường leo của R2.', 'pick(), u_turn() quay sang phải rồi drop(): hộp nằm ở (5, 3) trước khi R2 tới.']
    }),

    // 5. Súng hơi bắn nút N mở cửa cho mình: R1 đứng chắn đường đạn đúng nhịp R2 bắn.
    taoMan({
      so: 5, ten: 'Chắn đường đạn',
      deBai: 'R2 có súng hơi: bắn trúng nút N là cửa C mở, R2 chạy thẳng lên cờ F chỉ vài nhịp. Nhưng quả bóng bay thẳng, gặp xe là dừng. Đọc code R2 xem nó bắn ở nhịp nào, cho R1 đứng chắn đường đạn đúng lúc đó, rồi đi vòng tới cờ.',
      veMaMau: 'R1 chạy luôn nên R2 bắn trúng nút, mở cửa và tới cờ trước.',
      san: ['#######', '#.....#', '#.###F#', '#.###C#', 'N.....#', '#.#####', '#######'],
      bd: [{ x: 1, y: 5, huong: 0 }, { x: 5, y: 4, huong: 3 }],
      r2: R2.hoi(),
      c2: ['wait()', 'wait()', 'shoot()', 'wait()', 'turn_right()'].concat(FOR(20, ['if front_clear():', '    move()', 'else:', '    wait()'])),
      c1Mau: ['go_wall()', 'turn_right()', 'go_wall()', 'turn_right()', 'move()'],
      c1Giai: ['move()', 'wait()', 'wait()', 'go_wall()', 'turn_right()', 'go_wall()', 'turn_right()', 'move()'],
      doiThu: { part: 'hoi', manh: ['Bắn nút N từ xa để mở cửa', 'Giật lùi đi một ô mỗi phát, không cần quay'], yeu: ['Quả bóng bay thẳng, gặp xe là dừng: đứng chắn là nút không bị bắn'] },
      goiY: ['R2 chờ 2 nhịp rồi shoot() ở nhịp 3, bóng bay dọc hàng dưới tới nút N.', 'R1 vào ô (1, 4) ở nhịp 1 rồi wait() hai lần: bóng đập vào R1, cửa C vẫn đóng.']
    }),

    // 6. Drone bay qua hàng rào nhưng pin ít, phải vòng qua ô sạc P: R1 đi cổng dịch chuyển 1 tới gần cờ.
    taoMan({
      so: 6, ten: 'Drone phải sạc',
      deBai: 'R2 là drone: bay qua hàng rào = mà xe không qua được. Nhưng pin chỉ đủ 6 nhịp, bay thẳng tới cờ cần 7, nên drone phải vào hốc sạc P rồi ra. Đọc code R2 đếm nhịp, rồi chọn đường cho R1: cổng dịch chuyển 1 đưa xe tới gần cờ.',
      veMaMau: 'R1 mới đi hai ô rồi dừng trước cổng.',
      san: ['#######', '#F===.#', '#.##P.#', '#.###.#', '#1###.#', '##...1#', '#######'],
      bd: [{ x: 2, y: 5, huong: 1 }, { x: 5, y: 4 }],
      r2: R2.drone(6),
      c2: FOR(2, ['go_up()']).concat(['go_left()', 'go_right()', 'go_up()'], FOR(4, ['go_left()'])),
      c1Mau: ['move()', 'move()'],
      c1Giai: ['go_wall()', 'turn_left()', 'go_wall()'],
      doiThu: { part: 'drone', manh: ['Bay qua hàng rào =, băng chuyền, hố; mỗi ô chỉ 1 nhịp'], yeu: ['Mỗi nhịp tốn 1 pin, hết pin là rơi: phải ghé ô sạc P'] },
      goiY: ['Drone vào hốc sạc P rồi ra: 9 nhịp mới tới cờ.', 'R1 đi vào cổng 1 ở góc phải dưới: ra ở cổng 1 bên trái, quay lên là tới cờ.']
    }),

    // 7. Nam châm hút hộp sắt từ xa 2 ô, nhưng không hút được hộp đang bị kẹp: R1 nhặt trước nhịp R2 bật nam châm.
    taoMan({
      so: 7, ten: 'Nhặt trước nam châm', mucTieu: 'dua-vat',
      deBai: 'R1 phải đưa hộp sắt về ô đích D. R2 có nam châm hút hộp sắt từ xa 2 ô, hút được là mang đi luôn. Nhưng nam châm không hút được hộp đang bị kẹp. Đọc code R2 xem nhịp nào nó bật nam châm, rồi nhặt hộp trước nhịp đó.',
      veMaMau: 'R1 đi vòng lấy góc đẹp nên tới hộp chậm, R2 hút mất hộp.',
      san: ['#######', '#D...F#', '#.....#', '#.o...#', '#.....#', '#######'],
      vatChat: ['.......', '.......', '.......', '..s....', '.......', '.......'],
      bd: [{ x: 2, y: 4, huong: 0 }, { x: 4, y: 3, huong: 3 }],
      r2: R2.namCham(),
      c2: FOR(4, ['wait()']).concat(['magnet_n()', 'wait()', 'turn_right()', 'move()', 'move()', 'turn_right()', 'move()']),
      c1Mau: ['turn_left()', 'move()', 'turn_right()', 'move()', 'turn_right()', 'pick()'],
      c1Giai: ['pick()', 'turn_left()', 'move()', 'turn_right()', 'move()', 'move()', 'drop()'],
      doiThu: { part: 'nam-cham', manh: ['Hút hộp sắt từ xa 2 ô, khỏi phải lại gần'], yeu: ['Không hút được hộp đang bị kẹp trong tay R1', 'Chờ 4 nhịp mới bật magnet_n()'] },
      goiY: ['R2 bật magnet_n() ở nhịp 5.', 'Hộp ở ngay trước mũi R1: pick() luôn ở nhịp đầu.']
    }),

    // 8. Máy ném ném hộp qua tường rơi xuống hành lang của R1 (ô theo aim(n)): R1 qua ô đó trước khi hộp rơi.
    taoMan({
      so: 8, ten: 'Máy ném lấp lối',
      deBai: 'R2 có máy ném: nạp hộp rồi ném qua tường, rơi đúng vào hành lang của R1 để chặn đường. Đọc aim(n) trong code R2 để biết hộp rơi xuống ô nào, nhịp nào. Cho R1 đi qua ô đó trước khi hộp rơi.',
      veMaMau: 'R1 quay một vòng trước khi chạy nên tới chậm, hộp đã nằm chắn lối.',
      san: ['#######', '#F....#', '#.#o###', '#.....#', '#######'],
      bd: [{ x: 5, y: 1, huong: 3 }, { x: 3, y: 3, huong: 0 }],
      r2: R2.nem(),
      c2: ['wait()', 'load()', 'wait()', 'aim(2)', 'throw()', 'wait()', 'turn_left()', 'go_wall()', 'turn_right()', 'go_wall()'],
      c1Mau: ['u_turn()', 'u_turn()', 'go_wall()'],
      c1Giai: ['go_wall()'],
      doiThu: { part: 'nem', manh: ['Ném hộp qua tường tới đúng ô cách 1 đến 3 ô'], yeu: ['Phải load() rồi mới throw(), mỗi lệnh một nhịp', 'aim(n) cho biết trước hộp rơi ở đâu'] },
      goiY: ['R2 nạp ở nhịp 2, ném ở nhịp 3: aim(2) từ ô (3, 3) là rơi xuống ô (3, 1).', 'Đi luôn: R1 qua ô (3, 1) ở nhịp 2, trước khi hộp rơi.']
    }),

    // 9. Omni nhìn lên mà trượt ngang sang trái dọc hành lang trên, qua cửa mở c tới cờ: R1 thả hộp lên nút đè M ngay dưới chân để đóng cửa, rồi chạy đường vòng.
    taoMan({
      so: 9, ten: 'Omni lách cửa',
      deBai: 'R2 là omni: mặt nhìn lên mà slide_left() trượt ngang sang trái, đi thẳng hành lang trên qua cửa c tới cờ F. Đường vòng của R1 xa hơn, chạy đua thì thua. Hộp nằm ngay trước mặt R1, nút đè M ngay sau lưng: đặt hộp lên M để đóng sập cửa c, rồi mới chạy.',
      veMaMau: 'R1 chạy thẳng đường vòng tới cờ nên R2 trượt qua cửa tới trước.',
      san: ['#########', '#F..c...#', '#.#######', '#.#######', '#.#####o#', '#.......#', '#######M#', '#########'],
      bd: [{ x: 7, y: 5, huong: 0 }, { x: 7, y: 1, huong: 0 }],
      r2: R2.omni(),
      c2: FOR(4, ['wait()']).concat(FOR(20, ['slide_left()', 'wait()'])),
      c1Mau: ['turn_left()', 'go_wall()', 'turn_right()', 'go_wall()'],
      c1Giai: ['pick()', 'u_turn()', 'drop()', 'turn_right()', 'go_wall()', 'turn_right()', 'go_wall()'],
      doiThu: { part: 'omni', manh: ['Trượt ngang slide_left() mà không cần quay mặt'], yeu: ['Không qua được cửa đã đóng: nút đè M có hộp đè lên là cửa c đóng'] },
      goiY: ['R2 chờ 4 nhịp rồi trượt sang trái: nhịp 7 vào cửa c, nhịp 10 tới cờ. Đường vòng của R1 mất 12 nhịp.', 'pick(), u_turn(), drop(): nhịp 3 hộp đã nằm trên M, cửa đóng trước khi R2 tới.']
    }),

    // 10. Trùm: ba sân, R2 xích ở cả ba (go_wall, tr_left, go_wall). R1 phải quay trái ở sân này, quay phải ở sân kia: dùng cảm biến.
    taoMan({
      so: 10, ten: 'Trùm: Ba sân, một chương trình',
      deBai: 'Ba sân, một chương trình cho R1. Ở sân nào R2 cũng là xích leo bậc thang rồi tr_left() mất 2 nhịp. R1 đi tới tường rồi phải quay, lúc sang trái lúc sang phải: dùng cảm biến để biết bên nào trống.',
      veMaMau: 'R1 luôn quay phải: đúng ở sân đầu, sai ở sân khác.',
      san: [
        ['#######', '#F....#', '#.###S#', '#.###.#', '#.....#', '#######'],
        ['#######', '#....F#', '#S###.#', '#.###.#', '#.....#', '#######'],
        ['#######', '#F....#', '#.##S.#', '#.##.##', '#....##', '#######']
      ],
      bd: [
        [{ x: 4, y: 4, huong: 3 }, { x: 1, y: 4, huong: 1 }, { x: 3, y: 4, huong: 3 }],
        [{ x: 5, y: 3, huong: 0 }, { x: 1, y: 3, huong: 0 }, { x: 4, y: 3, huong: 0 }]
      ],
      r2: R2.xich(),
      c2: ['go_wall()', 'tr_left()', 'go_wall()'],
      c1Mau: ['go_wall()', 'turn_right()', 'go_wall()'],
      c1Giai: ['go_wall()', 'if right_clear():', '    turn_right()', 'else:', '    turn_left()', 'go_wall()'],
      doiThu: { part: 'xich', manh: ['Leo bậc thang S đi tắt'], yeu: ['tr_left() quay 90° mất 2 nhịp'] },
      goiY: ['Tới tường rồi hỏi right_clear(): trống thì quay phải, không thì quay trái.', 'R1 quay 1 nhịp, R2 quay 2 nhịp: hơn nhau đúng một nhịp ở mỗi sân.'],
      huyHieu: { ma: 'doi-thu-manh', ten: 'Huy hiệu Đọ sức part mạnh' }
    })
  ];

  ManHoc.chuongCoChe = ManHoc.chuongCoChe || [];
  ManHoc.chuongCoChe.push({
    sau: 'che-dua-robot',
    goi: { ma: 'doi-thu-manh', ten: 'Đọ sức part mạnh', loai: 'thu-thach', hinh: 'doi-thu-manh' },
    chuong: [{ ma: 'doi-thu-manh', ten: 'Đọ sức part mạnh' }],
    ds: DS
  });
})();
