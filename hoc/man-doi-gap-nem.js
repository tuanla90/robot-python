/* ============================================================================
   man-doi-gap-nem.js — "Đường học": GÓI ĐỘI TAY GẮP VÀ MÁY NÉM (20 màn, sau gói Máy ném): chương `doi-gap-nem` (tay kẹp + máy ném, 10 màn dưới đây)
   và chương `che-doi-gap-nem` "Chế lệnh đội gắp ném" (TAY XOAY + máy ném, 10 màn, khối chương 2 ở cuối tệp; máy kiểm riêng kiem-doi-gap-nem.mjs).
   Hai xe hai bánh, cùng cảm biến khoảng cách ở hông: R1 gắn TAY KẸP (mang vật đi mọi ngả nhưng không qua được hàng rào '='),
   R2 gắn MÁY NÉM (ném vật bay qua rào nhưng chỉ theo đường thẳng, đúng 1–3 ô). Mỗi robot một chương trình, chạy theo nhịp chung;
   robot chờ đồng đội bằng cảm biến (vật hay đồng đội trước mặt làm front_clear() trả False).

   Mười màn (lời giải chuẩn):
     1  Hai xe, hai tay        hai làn riêng: R1 đã có deliver(3); em viết launch(3) cho máy ném
     2  Nạp, tiến rồi ném      R2 đã có carry_throw(1); em đưa vật của R1 qua khúc quanh
     3  Hàng bay qua rào       R2 ném vật qua rào tới trước mũi R1; R1 chờ bằng cảm biến rồi mang vào đích
     4  Gắp đưa, ném đi        R1 đặt vật trước mặt R2; R2 chờ rồi side_throw(3) qua rào
     5  Dọn đường              R1 dời vật chắn vào đích; R2 chờ đường trống (while not front_clear()) rồi tiến và ném
     6  Hai đích, hai tầm      R1 chuyền hai vật; R2 ném vật đầu tầm 2, vật sau tầm 3
     7  Sửa tầm ném            tầm 2 rơi trúng hàng rào: vật vỡ
     8  Sửa điều kiện chờ      while not front_clear() làm R2 ném rổ trống
     9  Lặp hai chuyến         viết thẳng thì tràn khung: R1 lặp for, R2 lặp với biến tầm n tăng dần
     10 Kho hai phía           trùm ba sân: vật của R1 xa gần khác nhau, đích của R2 lúc bên phải lúc bên trái

   Tệp chỉ khai báo chương (ManHoc.chuongThem); lo-trinh-hoc.js chèn nó ngay sau che-may-nem (gói ngay sau gói Máy ném, trước Lắp ráp: Thân + Tay).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var CHUONG = 'doi-gap-nem';
  // @sao-dau (node tools/do-goi-doi.mjs <tệp này> --ghi viết lại khối này: ngưỡng sao = ô / nhịp của lời giải chuẩn)
  var SAO = {
    'doi-gap-nem.1': { o: 26, nhip: 6 },
    'doi-gap-nem.2': { o: 31, nhip: 7 },
    'doi-gap-nem.3': { o: 33, nhip: 9 },
    'doi-gap-nem.4': { o: 32, nhip: 10 },
    'doi-gap-nem.5': { o: 29, nhip: 5 },
    'doi-gap-nem.6': { o: 44, nhip: 15 },
    'doi-gap-nem.7': { o: 32, nhip: 10 },
    'doi-gap-nem.8': { o: 35, nhip: 10 },
    'doi-gap-nem.9': { o: 44, nhip: 21 },
    'doi-gap-nem.10': { o: 40, nhip: 36 },
    'che-doi-gap-nem.1': { o: 24, nhip: 5 },
    'che-doi-gap-nem.2': { o: 26, nhip: 5 },
    'che-doi-gap-nem.3': { o: 24, nhip: 5 },
    'che-doi-gap-nem.4': { o: 32, nhip: 11 },
    'che-doi-gap-nem.5': { o: 44, nhip: 10 },
    'che-doi-gap-nem.6': { o: 30, nhip: 11 },
    'che-doi-gap-nem.7': { o: 20, nhip: 5 },
    'che-doi-gap-nem.8': { o: 29, nhip: 7 },
    'che-doi-gap-nem.9': { o: 16, nhip: 15 },
    'che-doi-gap-nem.10': { o: 42, nhip: 17 }
  };
  // @sao-cuoi

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var BA_HUONG = ['front_clear', 'left_clear', 'right_clear'];
  var CAM_BIEN = [{ ma: 'khoang-cach', o: 'hong' }];
  var GAP = { loaiRobot: 'banh', robot: { than: 'hai-banh', tay: 'kep', camBien: CAM_BIEN }, hamGoc: BANH.concat(['arm_down', 'arm_up', 'grab', 'release'], BA_HUONG) };
  var NEM = { loaiRobot: 'banh', robot: { than: 'hai-banh', tay: 'nem', camBien: CAM_BIEN }, hamGoc: BANH.concat(['aim', 'throw', 'load'], BA_HUONG) };
  // chương 2: R1 gắn TAY XOAY (part liền trước máy ném) thay cho tay kẹp
  var XOAY = { loaiRobot: 'banh', robot: { than: 'hai-banh', tay: 'xoay', camBien: CAM_BIEN }, hamGoc: BANH.concat(['arm_down', 'arm_up', 'arm_left', 'arm_right', 'grab', 'release'], BA_HUONG) };

  function sao(x) { return JSON.parse(JSON.stringify(x)); }
  /** Bài làm hai robot; hm: hàm của màn (chương 2). */
  function B(c1, c2, hm) { return { doi: [{ chinh: c1.slice() }, { chinh: c2.slice() }], hamCuaMan: (hm || []).map(sao) }; }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  var CHO_HANG = ['while front_clear():', '    wait()'];

  /** m.bd: [batDau R1 (tay kẹp; chương 2 tay xoay), batDau R2 (máy ném)]; m.ro: rổ R2 có sẵn một vật;
   *  m.khoa: số thứ tự robot tự động khóa (chương trình = maMau.doi[khoa]); m.co: [cờ riêng R1, cờ riêng R2]. */
  function man(m) {
    var bd = m.bd, khoa = m.khoa, co = m.co, taoHam = m.taoHam || [];
    delete m.bd; delete m.khoa; delete m.co;
    m.chuong = m.chuong || CHUONG;                                         // chương 2 của gói khai chuong: 'che-' + CHUONG
    var r1 = m.chuong === CHUONG ? GAP : XOAY;
    m.hang = m.so <= 3 ? 'lam-quen' : m.so <= 6 ? 'luyen' : m.so <= 9 ? 'bien-the' : 'trum';
    m.cauTruc = ['for', 'if', 'while'];
    m.mucTieu = m.mucTieu || 'dua-vat';
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    m.bienDem = true;
    if (Array.isArray(m.san[0])) m.nhipTheo = 'tong';
    m.nhipTheoLoiGiai = true;
    m.doi = [Object.assign({ batDau: bd[0] }, sao(r1)), Object.assign({ batDau: bd[1] }, sao(NEM))];
    if (m.ro) { m.doi[1].roBanDau = true; delete m.ro; }
    if (khoa !== undefined) m.doi[khoa].coDinh = true;
    if (co) co.forEach(function (c, i) { if (c) m.doi[i].co = sao(c); });
    // Cấp ngoài là của R1 để mã đọc màn một robot không vỡ.
    m.batDau = bd[0]; m.loaiRobot = r1.loaiRobot; m.robot = sao(r1.robot); m.hamGoc = r1.hamGoc.slice();
    m.taoHam = taoHam; m.loiSai = [];
    m.loiGiai.hamCuaEmMoi = m.loiGiai.hamCuaEmMoi || [];
    m.sao = SAO[m.chuong + '.' + m.so] || { o: 1, nhip: 1 };
    return ManHoc.chuanHoa(m);
  }

  var R1_DAT = ['pick()', 'go_wall()', 'turn_right()', 'drop()'];
  var R1_HAI = ['pass_back()', 'move()', 'pick()', 'u_turn()', 'move()', 'drop()'];

  var DS = [
    man({
      so: 1, ten: 'Hai xe, hai tay',
      deBai: 'Hai xe ở hai làn riêng. R1 tay kẹp đã có chương trình mang vật vào đích. Làn của R2 có hàng rào chắn trước đích: nạp vật trước mũi rồi ném qua rào.',
      veMaMau: 'Chạy thử: R1 xong việc, R2 đứng yên. Viết chương trình R2.',
      san: ['#######', '#.o=D.#', '#######', '#.o..D#', '#######'], bd: [{ x: 1, y: 3, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      maMau: B(['deliver(3)'], []), loiGiai: B(['deliver(3)'], ['launch(3)']),
      hamCuaEmCan: ['deliver', 'launch'],
      goiY: ['Tầm ném tính từ ô xe đứng tới ô vật rơi.', 'launch(n) nạp vật trước mũi rồi ném xa n ô.']
    }),
    man({
      so: 2, ten: 'Nạp, tiến rồi ném',
      deBai: 'Đích của R2 cách xa hơn tầm ném nên R2 nạp vật, tiến một ô rồi mới ném. Chương trình R2 đã xong. Viết chương trình cho R1 mang vật qua khúc quanh vào đích.',
      veMaMau: 'Chương trình R2 đã xong. Viết chương trình R1.',
      san: ['#######', '#.o.=D#', '#######', '#.o..##', '####D##', '#######'], bd: [{ x: 1, y: 3, huong: 1 }, { x: 1, y: 1, huong: 1 }],
      maMau: B([], ['carry_throw(1)']), loiGiai: B(R1_DAT, ['carry_throw(1)']),
      hamCuaEmCan: ['pick', 'drop', 'go_wall', 'turn_right', 'carry_throw'],
      goiY: ['Đích của R1 nằm dưới ô cuối làn.', 'pick(), go_wall(), turn_right(), drop()']
    }),
    man({
      so: 3, ten: 'Hàng bay qua rào',
      deBai: 'R1 không qua được hàng rào để lấy vật. R2 ném vật qua rào, rơi ngay trước mũi R1. R1 chờ tới khi thấy vật, rồi nhặt và mang xuống đích.',
      veMaMau: 'Chạy thử: R1 gắp hụt vì vật chưa bay tới. Thêm vòng chờ cho R1.',
      san: ['#######', '#.o=..#', '#####.#', '####D.#', '#######'], bd: [{ x: 5, y: 1, huong: 3 }, { x: 1, y: 1, huong: 1 }],
      maMau: B(['pick()', 'turn_left()', 'go_wall()', 'turn_right()', 'drop()'], ['launch(3)']),
      loiGiai: B(CHO_HANG.concat(['pick()', 'turn_left()', 'go_wall()', 'turn_right()', 'drop()']), ['launch(3)']),
      hamCuaEmCan: ['pick', 'drop', 'turn_left', 'turn_right', 'go_wall', 'launch'],
      goiY: ['Vật nằm trước mũi thì front_clear() trả False.', 'while front_clear(): wait() đặt trước pick().']
    }),
    man({
      so: 4, ten: 'Gắp đưa, ném đi',
      deBai: 'Lần này R1 mang vật tới đặt trước mặt R2. R2 chờ tới khi thấy vật, nạp vào rổ, quay sang phải rồi ném qua rào vào đích.',
      veMaMau: 'Chương trình R1 đã xong. Viết chương trình R2.',
      san: ['#########', '#.o..####', '####.####', '####.=.D#', '#########'], bd: [{ x: 1, y: 1, huong: 1 }, { x: 4, y: 3, huong: 0 }],
      maMau: B(R1_DAT, []), loiGiai: B(R1_DAT, CHO_HANG.concat(['side_throw(3)'])),
      hamCuaEmCan: ['pick', 'drop', 'go_wall', 'turn_right', 'side_throw'],
      goiY: ['R2 phải chờ như R1 ở bài trước.', 'side_throw(n) nạp, quay phải, ném rồi quay lại.']
    }),
    man({
      so: 5, ten: 'Dọn đường', ro: true,
      deBai: 'Rổ của R2 đã có một vật, nhưng một vật khác chắn ngay trước mũi R2. R1 dời vật chắn vào đích bên cạnh. R2 chờ tới khi đường trống, tiến sát hàng rào rồi ném vào đích.',
      veMaMau: 'Chạy thử: R2 ném ngay từ chỗ cũ. Cho R2 chờ đường trống trước khi tiến.',
      san: ['########', '#D.#####', '#.o..=D#', '########'], bd: [{ x: 2, y: 1, huong: 2 }, { x: 1, y: 2, huong: 1 }],
      maMau: B(['put_right()'], ['go_wall()', 'toss(2)']),
      loiGiai: B(['put_right()'], ['while not front_clear():', '    wait()', 'go_wall()', 'toss(2)']),
      hamCuaEmCan: ['put_right', 'go_wall', 'toss'],
      goiY: ['Lần này chờ cho tới khi trước mặt TRỐNG.', 'while not front_clear(): wait()']
    }),
    man({
      so: 6, ten: 'Hai đích, hai tầm',
      deBai: 'R1 chuyền lần lượt hai vật tới ô trên đầu R2. R2 ném vật thứ nhất vào đích gần (tầm 2), vật thứ hai vào đích xa (tầm 3).',
      veMaMau: 'R2 đã ném xong vật thứ nhất. Viết tiếp cho vật thứ hai.',
      san: ['#########', '#oo..####', '####.=DD#', '#########'], bd: [{ x: 3, y: 1, huong: 3 }, { x: 4, y: 2, huong: 0 }],
      maMau: B(R1_HAI, CHO_HANG.concat(['side_throw(2)'])),
      loiGiai: B(R1_HAI, CHO_HANG.concat(['side_throw(2)'], CHO_HANG, ['side_throw(3)'])),
      hamCuaEmCan: ['pass_back', 'move', 'pick', 'u_turn', 'drop', 'side_throw'],
      goiY: ['Đích gần đã có vật thì vật sau phải bay qua nó.', 'Chờ lần nữa rồi side_throw(3).']
    }),
    man({
      so: 7, ten: 'Sửa tầm ném',
      deBai: 'R1 đặt vật trên đầu R2. R2 nạp vật, quay trái rồi ném, nhưng vật rơi trúng hàng rào và vỡ. Sửa chương trình R2 cho vật rơi vào đích.',
      veMaMau: 'Chương trình R1 đã đúng. Chạy thử rồi sửa R2.',
      san: ['######', '#.o..#', '####.#', '#D=..#', '######'], bd: [{ x: 1, y: 1, huong: 1 }, { x: 4, y: 3, huong: 0 }],
      maMau: B(R1_DAT, CHO_HANG.concat(['load()', 'wait()', 'turn_left()', 'toss(2)'])),
      loiGiai: B(R1_DAT, CHO_HANG.concat(['load()', 'wait()', 'turn_left()', 'toss(3)'])),
      hamCuaEmCan: ['pick', 'drop', 'go_wall', 'turn_right', 'turn_left', 'toss'],
      goiY: ['Đếm số ô từ R2 tới đích, không tính ô R2 đứng.', 'Đích cách R2 ba ô.']
    }),
    man({
      so: 8, ten: 'Sửa điều kiện chờ',
      deBai: 'R2 phải chờ R1 đặt vật trên đầu rồi mới ném, nhưng R2 ném ngay lúc đầu với rổ trống. Sửa điều kiện vòng chờ của R2.',
      veMaMau: 'Chương trình R1 đã đúng. Sửa một dòng của R2.',
      san: ['########', '#...####', '#o#.####', '###.=.D#', '########'], bd: [{ x: 1, y: 1, huong: 2 }, { x: 3, y: 3, huong: 0 }],
      maMau: B(['pick()', 'turn_left()', 'go_wall()', 'turn_right()', 'drop()'], ['while not front_clear():', '    wait()', 'side_throw(3)']),
      loiGiai: B(['pick()', 'turn_left()', 'go_wall()', 'turn_right()', 'drop()'], CHO_HANG.concat(['side_throw(3)'])),
      hamCuaEmCan: ['pick', 'drop', 'turn_left', 'go_wall', 'turn_right', 'side_throw'],
      goiY: ['Lúc đầu trước mặt R2 trống. Vòng chờ phải chạy chính lúc đó.', 'Bỏ chữ not.']
    }),
    man({
      so: 9, ten: 'Lặp hai chuyến',
      deBai: 'R1 đi lấy từng vật mang về đặt trên đầu R2; R2 ném vật đầu tầm 2, vật sau tầm 3. Viết thẳng hai chuyến thì R1 tràn khung: dùng vòng lặp cho cả hai robot.',
      veMaMau: 'Chương trình đã làm được chuyến thứ nhất. Bọc vào vòng lặp.',
      san: ['#########', '#oo..####', '####.####', '####.=DD#', '#########'], bd: [{ x: 4, y: 1, huong: 3 }, { x: 4, y: 3, huong: 0 }],
      maMau: B(['go_wall()', 'pick()', 'u_turn()', 'go_wall()', 'turn_right()', 'drop()'], CHO_HANG.concat(['side_throw(2)'])),
      loiGiai: B(['for i in range(2):', '    go_wall()', '    pick()', '    u_turn()', '    go_wall()', '    turn_right()', '    drop()', '    turn_right()'],
        ['n = 2', 'for i in range(2):', '    while front_clear():', '        wait()', '    side_throw(n)', '    n = n + 1']),
      hamCuaEmCan: ['go_wall', 'pick', 'u_turn', 'turn_right', 'drop', 'side_throw'],
      goiY: ['go_wall() dừng ngay trước vật kế tiếp dù vật xa hay gần.', 'R2 giữ tầm trong biến n: bắt đầu n = 2, mỗi lần ném xong tăng n thêm 1.']
    }),
    man({
      so: 10, ten: 'Kho hai phía',
      deBai: 'Ba kho: vật của R1 lúc xa lúc gần, đích của R2 lúc bên phải lúc bên trái (luôn cách R2 ba ô, sau hàng rào). Một chương trình cho mỗi robot phải giao vật vào đích ở cả ba kho.',
      veMaMau: 'Tự viết cả hai chương trình.',
      san: [
        ['###########', '#..o...####', '######.####', '######..=D#', '###########'],
        ['###########', '#....o.####', '######.####', '###D=..####', '###########'],
        ['###########', '#o.....####', '######.####', '######..=D#', '###########']
      ],
      bd: [[{ x: 6, y: 1, huong: 3 }, { x: 6, y: 1, huong: 3 }, { x: 6, y: 1, huong: 3 }], [{ x: 6, y: 3, huong: 0 }, { x: 6, y: 3, huong: 0 }, { x: 6, y: 3, huong: 0 }]],
      maMau: B([], []),
      loiGiai: B(['go_wall()', 'pick()', 'u_turn()', 'go_wall()', 'turn_right()', 'drop()'],
        CHO_HANG.concat(['load()', 'wait()', 'if right_clear():', '    turn_right()', 'else:', '    turn_left()', 'toss(3)'])),
      hamCuaEmCan: ['go_wall', 'pick', 'u_turn', 'turn_right', 'turn_left', 'drop', 'toss'],
      goiY: ['R1 về tới ô cũ thì thả vật xuống ô trên đầu R2.', 'Phía có đích còn một ô sàn trước hàng rào; phía kia là tường.'],
      huyHieu: { ma: CHUONG, ten: 'Huy hiệu Đội tay gắp và máy ném' }
    })
  ];

  /* ------------------------------------------------------------ chương 2 `che-doi-gap-nem`: CHẾ LỆNH ĐỘI GẮP NÉM (KE-HOACH-PHOI-HOP.md §3b)
     R1 đổi sang TAY XOAY: đặt vật sang ô bên cạnh mà không quay xe, nên ô bàn giao là ô bên phải (hay trái) của R1, ngay trước mặt máy ném.
     Hàm của em MỚI (tên cốt truyện):
       1 feed()          = pick(), drop_right()                         tay xoay nhặt vật trước mặt, đặt sang ô bên phải (4 nhịp)
       2 relay_throw(n)  = while front_clear(): wait(), launch(n)       máy ném chờ tới khi có vật trước mặt rồi nạp và ném xa n ô
       3 catch_box()     = while front_clear(): wait(), pick()          tay xoay chờ vật bay tới trước mặt rồi nhặt
     Hàm của màn: 7 swing() quên nâng tay trước khi xoay (khớp kẹt); 8 long_throw(n) ném rồi mới aim (ném tầm cũ); 9 let_pass() chỉ chờ đồng đội đi khỏi,
     quên chờ đồng đội tới. */
  var T_FEED = ['pick()', 'drop_right()'];
  var T_RELAY = CHO_HANG.concat(['launch(n)']);
  var T_CATCH = CHO_HANG.concat(['pick()']);
  function hFeed(than) { return H('feed', [], than || T_FEED); }
  function hRelay(than) { return H('relay_throw', ['n'], than || T_RELAY); }
  function hCatch(than) { return H('catch_box', [], than || T_CATCH); }
  var T_SWING_CU = ['arm_down()', 'grab()', 'wait()', 'arm_right()', 'wait()', 'arm_down()', 'release()', 'wait()'];
  var T_SWING = ['arm_down()', 'grab()', 'wait()', 'arm_up()', 'arm_right()', 'wait()', 'arm_down()', 'release()', 'wait()'];
  function hSwing(than) { return H('swing', [], than || T_SWING_CU); }
  function hLong(than) { return H('long_throw', ['n'], than || ['load()', 'wait()', 'throw()', 'aim(n)', 'wait()']); }
  var T_LET_PASS = ['while front_clear():', '    wait()', 'while not front_clear():', '    wait()'];
  function hLetPass(than) { return H('let_pass', [], than || ['while not front_clear():', '    wait()']); }
  function lg(bai, ham) { bai.hamCuaEmMoi = ham || []; return bai; }
  var CHE = 'che-' + CHUONG;
  var NEM_5 = ['relay_throw(3)'].concat(CHO_HANG, ['side_throw(3)']);
  var R1_TRUM = ['go_wall()', 'if right_clear():', '    feed()', 'else:', '    pick()', '    drop_left()'];

  DS = DS.concat([
    man({
      so: 1, chuong: CHE, ten: 'Bàn giao bên hông', khoa: 1, taoHam: ['feed'],
      deBai: 'R1 giờ gắn tay xoay: đặt vật sang ô bên cạnh mà không cần quay xe. Máy ném tự động chờ vật trước mặt rồi ném qua hàng rào vào đích. Em chế feed(): nhặt vật trước mặt rồi đặt sang ô bên phải, đúng trước mặt máy ném.',
      veMaMau: 'Chương trình máy ném bị khóa. Tạo feed() trong Xưởng hàm rồi viết chương trình R1 gọi nó.',
      san: ['#####', '###D#', '##o=#', '##..#', '###.#', '#####'], bd: [{ x: 2, y: 3, huong: 0 }, { x: 3, y: 4, huong: 0 }],
      maMau: B([], CHO_HANG.concat(['launch(3)'])),
      loiGiai: lg(B(['feed()'], CHO_HANG.concat(['launch(3)'])), [hFeed()]),
      hamCuaEmCan: ['pick', 'drop_right', 'launch'],
      goiY: ['Máy ném chỉ nạp được vật ở ô ngay trước mặt nó, tức ô bên phải tay xoay.', 'pick() rồi drop_right(): hai dòng.']
    }),
    man({
      so: 2, chuong: CHE, ten: 'Chờ rồi ném', khoa: 0, taoHam: ['relay_throw'],
      deBai: 'Tay xoay tự động lấy vật bên trái rồi đặt sang bên phải, ngay trước mặt máy ném. Em chế relay_throw(n) cho máy ném: chờ tới khi thấy vật trước mặt, rồi nạp và ném xa n ô qua hàng rào vào đích.',
      veMaMau: 'Chương trình R1 bị khóa. Tạo relay_throw(n) rồi viết chương trình máy ném.',
      san: ['#######', '###o###', '###.###', '##..=D#', '#######'], bd: [{ x: 3, y: 2, huong: 1 }, { x: 2, y: 3, huong: 1 }],
      maMau: B(['pick_left()', 'drop_right()'], []),
      loiGiai: lg(B(['pick_left()', 'drop_right()'], ['relay_throw(3)']), [hRelay()]),
      hamCuaEmCan: ['pick_left', 'drop_right', 'launch'],
      goiY: ['Vật chưa tới mà nạp ngay thì máy ném nạp hụt.', 'while front_clear(): wait(), rồi launch(n).']
    }),
    man({
      so: 3, chuong: CHE, ten: 'Bắt vật bay tới', khoa: 1, taoHam: ['catch_box'],
      deBai: 'Lần này máy ném tự động ném vật qua hàng rào, rơi ngay trước mặt tay xoay. Em chế catch_box(): chờ tới khi vật rơi trước mặt rồi nhặt; sau đó R1 đặt vật sang bên trái vào ô đích.',
      veMaMau: 'Chương trình máy ném bị khóa. Tạo catch_box() rồi viết chương trình R1.',
      san: ['#######', '#.o=..#', '#####D#', '#######'], bd: [{ x: 5, y: 1, huong: 3 }, { x: 1, y: 1, huong: 1 }],
      maMau: B([], ['launch(3)']),
      loiGiai: lg(B(['catch_box()', 'drop_left()'], ['launch(3)']), [hCatch()]),
      hamCuaEmCan: ['pick', 'drop_left', 'launch'],
      goiY: ['R1 quay mặt sang trái, nên bên trái của R1 là phía dưới.', 'Chờ như relay_throw(), nhưng chờ xong thì pick().']
    }),
    man({
      so: 4, chuong: CHE, ten: 'Cùng tiến, cùng lặp',
      deBai: 'Hai vật nằm nối nhau trước mũi tay xoay. Mỗi lượt tay xoay tiến một ô rồi chuyền vật sang ô dưới; máy ném chờ vật, ném xa 3 ô rồi cũng tiến một ô. Viết vòng lặp cho cả hai robot.',
      veMaMau: 'Tự viết cả hai chương trình bằng các hàm em đã chế.',
      san: ['#######', '#..oo##', '#...DD#', '#######'], bd: [{ x: 1, y: 1, huong: 1 }, { x: 1, y: 2, huong: 1 }],
      maMau: B([], []),
      loiGiai: B(['for i in range(2):', '    move()', '    feed()'], ['for i in range(2):', '    relay_throw(3)', '    move()']),
      hamCuaEmCan: ['move', 'feed', 'relay_throw'],
      goiY: ['Mỗi lần tay xoay tiến một ô thì ô bàn giao cũng dời theo một ô.', 'Máy ném ném xong thì tiến một ô để đứng sau ô bàn giao mới.']
    }),
    man({
      so: 5, chuong: CHE, ten: 'Máy ném tự động dùng hàm của em', khoa: 1,
      deBai: 'Máy ném tự động gọi relay_throw(3) em đã chế để ném vật thứ nhất qua rào phía trước, rồi chờ vật thứ hai và ném sang phải bằng side_throw(3). Tay xoay có một vật trước mặt và một vật bên trái: chuyền lần lượt cả hai sang ô bên phải, đúng trước mặt máy ném.',
      veMaMau: 'Chương trình máy ném bị khóa, xem được. Viết chương trình tay xoay.',
      san: ['########', '###D####', '##o=####', '#o..####', '###..=D#', '########'], bd: [{ x: 2, y: 3, huong: 0 }, { x: 3, y: 4, huong: 0 }],
      maMau: B([], NEM_5),
      loiGiai: B(['feed()', 'pick_left()', 'drop_right()'], NEM_5),
      hamCuaEmCan: ['feed', 'pick_left', 'drop_right', 'relay_throw', 'side_throw'],
      goiY: ['feed() lo vật trước mặt; vật bên trái cần một lần nhặt bên trái.', 'pick_left() rồi drop_right().']
    }),
    man({
      so: 6, chuong: CHE, ten: 'Bắt hai lượt', khoa: 1, ro: true,
      deBai: 'Máy ném tự động ném vật trong rổ ra xa 2 ô, rồi nạp vật trước mặt ném xa 3 ô. Hai vật rơi nối nhau trước mũi tay xoay. Mỗi lượt tay xoay bắt vật, đặt sang bên trái vào đích rồi tiến một ô: dùng vòng lặp.',
      veMaMau: 'Chương trình máy ném bị khóa. Viết chương trình tay xoay bằng vòng lặp.',
      san: ['####', '#.D#', '#.D#', '#.##', '#o##', '#.##', '####'], bd: [{ x: 1, y: 1, huong: 2 }, { x: 1, y: 5, huong: 0 }],
      maMau: B(['catch_box()', 'drop_left()'], ['toss(2)', 'launch(3)']),
      loiGiai: B(['for i in range(2):', '    catch_box()', '    drop_left()', '    move()'], ['toss(2)', 'launch(3)']),
      hamCuaEmCan: ['catch_box', 'drop_left', 'move', 'toss', 'launch'],
      goiY: ['Vật xa rơi trước, vật gần rơi sau, nhưng tay xoay bắt vật gần trước.', 'Bắt, đặt, tiến một ô: lặp hai lần.']
    }),
    man({
      so: 7, chuong: CHE, ten: 'Khớp kẹt vì tay hạ', khoa: 0,
      deBai: 'Tay xoay tự động gọi swing(): hàm của màn nhặt vật trước mặt rồi xoay sang phải đặt trước mặt máy ném. Nhưng tay còn hạ sát đất mà đã xoay nên khớp kẹt. Sửa swing() cho khớp xoay được.',
      veMaMau: 'Chương trình tay xoay bị khóa, chương trình máy ném đã đúng. Chạy thử rồi sửa hàm swing() trong Xưởng hàm.',
      san: ['#######', '##D=..#', '###o.##', '#######'], bd: [{ x: 4, y: 2, huong: 3 }, { x: 5, y: 1, huong: 3 }],
      maMau: B(['swing()'], ['relay_throw(3)'], [hSwing()]),
      loiGiai: B(['swing()'], ['relay_throw(3)'], [hSwing(T_SWING)]),
      hamCuaEmCan: ['relay_throw'],
      goiY: ['Khớp chỉ xoay được khi tay đang nâng.', 'Thêm arm_up() ngay trước arm_right(): nâng rồi xoay trong cùng một nhịp.']
    }),
    man({
      so: 8, chuong: CHE, ten: 'Ném rồi mới ngắm', khoa: 1,
      deBai: 'Máy ném tự động chờ vật rồi gọi long_throw(3), nhưng hàm của màn ném trước rồi mới aim(), nên vật bay đúng tầm cũ 1 ô và nằm lại trước mặt. Sửa long_throw(n) để vật bay qua hàng rào vào đích.',
      veMaMau: 'Chương trình máy ném bị khóa, chương trình tay xoay đã đúng. Sửa hàm long_throw(n).',
      san: ['#######', '#...o##', '##..=D#', '#######'], bd: [{ x: 1, y: 1, huong: 1 }, { x: 2, y: 2, huong: 1 }],
      maMau: B(['go_wall()', 'feed()'], CHO_HANG.concat(['long_throw(3)']), [hLong()]),
      loiGiai: B(['go_wall()', 'feed()'], CHO_HANG.concat(['long_throw(3)']), [hLong(['load()', 'wait()', 'aim(n)', 'throw()', 'wait()'])]),
      hamCuaEmCan: ['go_wall', 'feed'],
      goiY: ['throw() nhớ tầm đang đặt lúc gọi.', 'Đổi chỗ hai dòng throw() và aim(n).']
    }),
    man({
      so: 9, chuong: CHE, ten: 'Nhường đường', mucTieu: 'toi-co', khoa: 0, co: [[{ x: 9, y: 1 }], [{ x: 1, y: 1 }]],
      deBai: 'Hai robot đổi phía qua một hành lang hẹp, mỗi robot tới cờ có vạch màu của mình. Tay xoay đứng trong hốc và gọi let_pass() để chờ máy ném đi qua, nhưng hàm của màn chỉ chờ "tới khi trước mặt trống" nên tay xoay ra quá sớm. Sửa let_pass() và viết chương trình máy ném.',
      veMaMau: 'Chương trình tay xoay bị khóa. Sửa hàm let_pass() rồi viết chương trình máy ném.',
      san: ['###########', '#F.......F#', '###.#######', '###########'], bd: [{ x: 3, y: 2, huong: 0 }, { x: 9, y: 1, huong: 3 }],
      maMau: B(['let_pass()', 'move()', 'turn_right()', 'go_wall()'], [], [hLetPass()]),
      loiGiai: B(['let_pass()', 'move()', 'turn_right()', 'go_wall()'], ['go_wall()'], [hLetPass(T_LET_PASS)]),
      hamCuaEmCan: ['go_wall', 'move', 'turn_right'],
      goiY: ['Lúc đầu trước mặt tay xoay đã trống: phải chờ máy ném tới trước, rồi mới chờ máy ném đi khỏi.', 'Hai vòng while: while front_clear(), rồi while not front_clear().']
    }),
    man({
      so: 10, chuong: CHE, ten: 'Ca bốc xếp',
      deBai: 'Ba kho: vật lúc ngay trước mũi tay xoay, lúc ở cuối đường; máy ném lúc đứng bên phải, lúc đứng bên trái tay xoay. Một chương trình cho mỗi robot phải đưa vật vào đích ở cả ba kho.',
      veMaMau: 'Tự viết cả hai chương trình bằng các hàm em đã chế.',
      san: [
        ['#####', '###D#', '##o=#', '##..#', '###.#', '#####', '#####'],
        ['#####', '#D###', '#=o##', '#..##', '#.###', '#####', '#####'],
        ['#####', '###D#', '##o=#', '##..#', '##..#', '##.##', '#####']
      ],
      bd: [[{ x: 2, y: 3, huong: 0 }, { x: 2, y: 3, huong: 0 }, { x: 2, y: 5, huong: 0 }], [{ x: 3, y: 4, huong: 0 }, { x: 1, y: 4, huong: 0 }, { x: 3, y: 4, huong: 0 }]],
      maMau: B([], []),
      loiGiai: B(R1_TRUM, ['relay_throw(3)']),
      hamCuaEmCan: ['go_wall', 'feed', 'pick', 'drop_left', 'relay_throw'],
      goiY: ['go_wall() dừng ngay trước vật dù vật xa hay gần.', 'Hỏi right_clear(): bên phải trống thì máy ném đứng bên phải.'],
      huyHieu: { ma: CHE, ten: 'Huy hiệu Chế lệnh đội gắp ném' }
    })
  ]);

  // Chỉ khai báo: lo-trinh-hoc.js chèn chương vào thứ tự xuất bản rồi mới thêm màn, nên ngân hàng gốc và id các chương cũ giữ nguyên.
  ManHoc.chuongThem = (ManHoc.chuongThem || []).concat([{
    sau: 'che-may-nem', ds: DS,
    chuong: [{ ma: CHUONG, ten: 'Đội tay gắp và máy ném' }, { ma: 'che-' + CHUONG, ten: 'Chế lệnh đội gắp ném' }],
    goi: { ma: CHUONG, ten: 'Đội tay gắp và máy ném', hinh: 'may-nem' }
  }]);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();
