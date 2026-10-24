/* ============================================================================
   man-doi-gap-nem.js — "Đường học": CHƯƠNG `doi-gap-nem` · ĐỘI TAY GẮP VÀ MÁY NÉM (10 màn, gói thử thách sau gói Lắp ráp: Thân + Tay).
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

   Tệp chỉ khai báo chương (ManHoc.chuongThem); lo-trinh-hoc.js chèn nó ngay sau rap-tay (gói ngay sau gói Lắp ráp: Thân + Tay).
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
    'doi-gap-nem.10': { o: 40, nhip: 36 }
  };
  // @sao-cuoi

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var BA_HUONG = ['front_clear', 'left_clear', 'right_clear'];
  var CAM_BIEN = [{ ma: 'khoang-cach', o: 'hong' }];
  var GAP = { loaiRobot: 'banh', robot: { than: 'hai-banh', tay: 'kep', camBien: CAM_BIEN }, hamGoc: BANH.concat(['arm_down', 'arm_up', 'grab', 'release'], BA_HUONG) };
  var NEM = { loaiRobot: 'banh', robot: { than: 'hai-banh', tay: 'nem', camBien: CAM_BIEN }, hamGoc: BANH.concat(['aim', 'throw', 'load'], BA_HUONG) };

  function sao(x) { return JSON.parse(JSON.stringify(x)); }
  /** Bài làm hai robot. */
  function B(c1, c2) { return { doi: [{ chinh: c1.slice() }, { chinh: c2.slice() }], hamCuaMan: [] }; }
  var CHO_HANG = ['while front_clear():', '    wait()'];

  /** m.bd: [batDau R1 (tay kẹp), batDau R2 (máy ném)]; m.ro: rổ R2 có sẵn một vật. */
  function man(m) {
    var bd = m.bd;
    delete m.bd;
    m.chuong = m.chuong || CHUONG;                                         // chương 2 của gói khai chuong: 'che-' + CHUONG
    m.hang = m.so <= 3 ? 'lam-quen' : m.so <= 6 ? 'luyen' : m.so <= 9 ? 'bien-the' : 'trum';
    m.cauTruc = ['for', 'if', 'while'];
    m.mucTieu = 'dua-vat';
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    m.bienDem = true;
    if (Array.isArray(m.san[0])) m.nhipTheo = 'tong';
    m.nhipTheoLoiGiai = true;
    m.doi = [Object.assign({ batDau: bd[0] }, sao(GAP)), Object.assign({ batDau: bd[1] }, sao(NEM))];
    if (m.ro) { m.doi[1].roBanDau = true; delete m.ro; }
    // Cấp ngoài là của R1 để mã đọc màn một robot không vỡ.
    m.batDau = bd[0]; m.loaiRobot = GAP.loaiRobot; m.robot = sao(GAP.robot); m.hamGoc = GAP.hamGoc.slice();
    m.taoHam = []; m.loiSai = [];
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

  // Chỉ khai báo: lo-trinh-hoc.js chèn chương vào thứ tự xuất bản rồi mới thêm màn, nên ngân hàng gốc và id các chương cũ giữ nguyên.
  ManHoc.chuongThem = (ManHoc.chuongThem || []).concat([{
    sau: 'che-may-nem', ds: DS,
    chuong: [{ ma: CHUONG, ten: 'Đội tay gắp và máy ném' }, { ma: 'che-' + CHUONG, ten: 'Chế lệnh đội gắp ném' }],
    goi: { ma: CHUONG, ten: 'Đội tay gắp và máy ném', hinh: 'may-nem' }
  }]);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();
