/* ============================================================================
   man-trum-mua-1.js — "Robot Chấn Hưng": 11 MÀN MỚI cho mùa 1, gói 10 "R1 xuất xưởng" (KE-HOACH-MUA-1.md, bảng 10 gói:
   "Tổng hợp: robot-hoan-thien 1–8 + cam-bien-ben.10 + 1" · "Trùm mùa: 10 mới (lùi + tay xoay + cảm biến bên + while)").

   - robot-hoan-thien.11 "Giao ca ở kho" (trùm chương 1 Tổng hợp, ba sân, huy hiệu 'robot-hoan-thien'): thay robot-hoan-thien.10 (cất vì hai hàm của màn
     bounce / fetch_back có biến đếm). Cùng kho, cùng việc, nhưng "lùi về chỗ cũ" thay bằng LÙI TỚI CỬA NHÁNH (cảm biến bên), không đếm bước.
     Robot như chương robot-hoan-thien: xe hai bánh + TAY KẸP + cảm biến khoảng cách ba hướng.
   - Chương `trum-mua-1` "Trùm mùa" (mã trum-mua-1.1 … .10; .10 trùm cuối mùa 1, ba sân, huy hiệu 'xuat-xuong'): R1 đủ bộ như phim gói 10
     (game/phim-mua-1.js): xe hai bánh + TAY XOAY + cảm biến khoảng cách ba hướng. Màn hai robot: R1 tay xoay (vàng), R2 tay kẹp (lam).
   Mỗi màn khai `kieuBai` (giao-hang · do-duong · sua-ham · che-ham · do-nhip · nhieu-san · hai-robot): kiem-trum-mua-1.mjs kiểm không hai màn liền nhau
   cùng kiểu (gộp gói 9 + 10) và in BẢNG RECALL (gói 1–8 nào được dùng, đọc từ lời giải).

   Ràng buộc mùa 1: không biến (khung.chanBien), không hàm có tham số, không bậc thang, không part mùa sau. Không tạo hàm của em mới:
   màn "chế hàm" / "sửa hàm" dùng HÀM CỦA MÀN (maMau.hamCuaMan) mà chương trình chính bị khóa (chinhCoDinh) gọi.
   Sao: sao.o / sao.nhip đo bằng cham.js trên lời giải (kiem-trum-mua-1.mjs so khớp đúng từng số).
   Tệp này KHÔNG tự thêm màn vào ManHoc: danh sách nằm ở ManHoc.manTrumMua1, lo-trinh-hoc.js thêm vào gói robot.
   Hướng: 0 lên, 1 phải, 2 xuống, 3 trái. (x, y) với y = 0 ở hàng trên. Xe quay lên thì bên trái là x − 1, bên phải là x + 1.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var BA_HUONG = ['front_clear', 'left_clear', 'right_clear'];
  var CAM = [{ ma: 'khoang-cach', o: 'hong' }];
  var XOAY = { loaiRobot: 'banh', robot: { than: 'hai-banh', tay: 'xoay', camBien: CAM }, hamGoc: BANH.concat(['arm_down', 'arm_up', 'arm_left', 'arm_right', 'grab', 'release'], BA_HUONG) };
  var KEP = { loaiRobot: 'banh', robot: { than: 'hai-banh', tay: 'kep', camBien: CAM }, hamGoc: BANH.concat(['arm_down', 'arm_up', 'grab', 'release'], BA_HUONG) };

  function sao(x) { return JSON.parse(JSON.stringify(x)); }
  function H(ten, than) { return { ten: ten, thamSo: [], than: than.slice() }; }
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  function FOR(n, than) { return ['for i in range(' + n + '):'].concat(than.map(function (s) { return '    ' + s; })); }
  function THUT(ds) { return ds.map(function (s) { return '    ' + s; }); }
  /** while <dk>: than (than là mảng dòng). */
  function WHILE(dk, than) { return ['while ' + dk + ':'].concat(THUT(than)); }
  /** if <dk>: a else: b (a, b là mảng dòng). */
  function IF(dk, a, b) { return ['if ' + dk + ':'].concat(THUT(a), b ? ['else:'].concat(THUT(b)) : []); }
  /** Bài làm hai robot. */
  function B(c1, c2, hm) { return { doi: [{ chinh: c1.slice() }, { chinh: c2.slice() }], hamCuaMan: hm || [] }; }
  /** Ô đích / nút đè của sân (nơi thùng phải nằm khi xong). */
  function dichCua(rows) { var ds = []; rows.forEach(function (r, y) { for (var x = 0; x < r.length; x++) if (r[x] === 'D' || r[x] === 'M') ds.push({ x: x, y: y }); }); return ds; }

  /**
   * Trường chung. m.c: 1 (chương robot-hoan-thien, R1 tay kẹp) hay 2 (chương trum-mua-1, R1 tay xoay). Màn hai robot: m.bd = [batDau R1, batDau R2],
   * m.khoa = chỉ số robot khóa, m.co = [cờ riêng R1, cờ riêng R2] (mục tiêu toi-co: mỗi robot chỉ dừng ở cờ của mình). R1 tay xoay vàng, R2 tay kẹp lam.
   */
  function man(m) {
    var c = m.c, bd = m.bd, khoa = m.khoa, co = m.co;
    delete m.c; delete m.bd; delete m.khoa; delete m.co;
    m.chuong = c === 1 ? 'robot-hoan-thien' : 'trum-mua-1';
    m.hang = m.hang || (m.so <= 3 ? 'lam-quen' : m.so <= 6 ? 'luyen' : m.so <= 9 ? 'bien-the' : 'trum');
    m.cauTruc = ['for', 'if', 'while'];
    m.mucTieu = m.mucTieu || 'toi-co';
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10, chanBien: true };
    m.nhipTheoLoiGiai = true;
    var R = c === 1 ? KEP : XOAY;
    if (bd) {
      m.doi = [Object.assign({ batDau: bd[0] }, sao(XOAY), { robot: Object.assign(sao(XOAY.robot), { son: 'vang' }) }),
        Object.assign({ batDau: bd[1] }, sao(KEP), { robot: Object.assign(sao(KEP.robot), { son: 'lam' }) })];
      if (khoa !== undefined) m.doi[khoa].coDinh = true;
      if (co) { m.doi[0].co = co[0]; m.doi[1].co = co[1]; }
      m.batDau = bd[0]; m.loaiRobot = XOAY.loaiRobot; m.robot = sao(m.doi[0].robot); m.hamGoc = XOAY.hamGoc.slice();   // cấp ngoài = R1
    } else {
      m.loaiRobot = R.loaiRobot; m.robot = sao(R.robot); m.hamGoc = R.hamGoc.slice();
    }
    if (Array.isArray(m.san[0])) {
      m.nhipTheo = 'tong';
      if (!bd && !Array.isArray(m.batDau)) m.batDau = m.san.map(function () { return Object.assign({}, m.batDau); });
    }
    m.taoHam = [];
    return ManHoc.chuanHoa(m);
  }

  /* ================================================================ robot-hoan-thien.11 "Giao ca ở kho" (trùm chương Tổng hợp) */
  // Kho của robot-hoan-thien.10: hành lang dọc x = 2, xe (2,6) quay lên; thùng chắn hành lang; ◆ ở đầu hành lang (2,0); một nhánh bên phải có thùng ở cuối;
  // một hốc bên trái làm mồi. Việc: cất thùng chắn ra sau lưng (pass_back), lên ◆, LÙI tới khi bên phải trống (cửa nhánh), rẽ phải, lấy thùng cuối nhánh
  // rồi đặt nó ngay trong cửa nhánh (hàm của màn bring_out(): tới thùng, nhặt, lùi tới khi bên phải trống, đặt), xe đứng ở cửa nhánh quay phải.
  var SAN_R11 = [
    ['##.####', '#..####', '##..o##', '##.####', '##o####', '##.####', '##.####'],
    ['##.####', '##...o#', '#..####', '##o####', '##.####', '##.####', '##.####'],
    ['##.####', '##.####', '#..####', '##...o#', '##o####', '##.####', '##.####']
  ];
  var BM_R11 = [
    { x: 2, y: 2, huong: 1, diQua: [{ x: 2, y: 0 }], vat: [{ x: 2, y: 6 }, { x: 3, y: 2 }] },
    { x: 2, y: 1, huong: 1, diQua: [{ x: 2, y: 0 }], vat: [{ x: 2, y: 5 }, { x: 3, y: 1 }] },
    { x: 2, y: 3, huong: 1, diQua: [{ x: 2, y: 0 }], vat: [{ x: 2, y: 6 }, { x: 3, y: 3 }] }
  ];
  var LUI_CUA = WHILE('not right_clear()', ['back()']);
  var BRING = nhieu(['go_wall()', 'pick()'], LUI_CUA, ['drop()']);
  var L_R11 = nhieu(['go_wall()', 'pass_back()', 'go_wall()'], LUI_CUA, ['turn_right()', 'bring_out()']);

  /* ================================================================ chương trum-mua-1 "Trùm mùa" */
  // 1: làn x = 2, xe (2,2) quay lên; kệ trái (1,2), (1,3) trống, thùng ở kệ trái (1,4) phía sau; ô đích (3,1) bên phải đầu làn.
  //    Lùi khi bên trái còn trống, gặp thùng thì dừng, nhặt bên trái, đi tới tường, đặt sang phải.
  var L_1 = nhieu(WHILE('left_clear()', ['back()']), ['pick_left()', 'go_wall()', 'drop_right()']);
  // 2: làn x = 2, thùng ở cuối làn (2,1); hốc đích bên phải (3,4). Xe (2,5) quay lên: tới thùng, nhặt, LÙI tới khi bên phải trống, đặt sang phải.
  //    Quay đầu rồi đi thì chậm hơn một nhịp (quay một nhịp, rồi vẫn phải đi chừng ấy ô).
  var L_2 = nhieu(['go_wall()', 'pick()'], WHILE('not right_clear()', ['back()']), ['drop_right()']);
  // 3: làn x = 2, xe (2,1) ở đầu trên quay lên; kệ phải trống trừ hai ô có thùng (3,2), (3,4); ô đích bên trái (1,2), (1,4).
  //    Chương trình chính khóa: hai lần seek(), pick_right(), drop_left(). seek() của màn phải LÙI khi bên phải còn trống; bản lỗi lại tiến.
  var C_3 = FOR(2, ['seek()', 'pick_right()', 'drop_left()']);
  var SEEK = WHILE('right_clear()', ['back()']);
  var SEEK_LOI = WHILE('right_clear()', ['move()']);
  // 4 (hai robot): R1 tay xoay (3,2) quay lên; R2 tay kẹp (1,2) quay lên, khóa: nhặt thùng (1,1), quay phải, đặt vào (2,2) — ô bên trái R1.
  //    R1 chờ tới khi bên trái có thùng, nhặt bên trái, lùi một ô rồi đặt vào ô đích bên phải (4,3).
  var R2_4 = ['pick()', 'turn_right()', 'drop()'];
  var R1_4 = nhieu(WHILE('left_clear()', ['wait()']), ['pick_left()', 'back()', 'drop_right()']);
  // 5: làn x = 2, thùng (2,1) chắn đầu làn, xe (2,2) quay lên; nút đè M bên phải (3,3); cửa C (2,5) đóng; cờ F (2,7) sau cửa.
  //    Nhặt thùng, LÙI tới khi bên phải trống (nút M), đặt thùng lên nút, cửa mở, lùi tiếp qua cửa tới cờ. Quay đầu thì nút sang bên trái, chậm hơn.
  var L_5 = nhieu(['pick()'], WHILE('not right_clear()', ['back()']), ['drop_right()'], FOR(4, ['back()']));

  var DS = [
    man({
      c: 1, so: 11, hang: 'trum', ten: 'Giao ca ở kho', kieuBai: 'nhieu-san', mucTieu: 'bong-mo',
      huyHieu: { ma: 'robot-hoan-thien', ten: 'Huy hiệu Robot hoàn thiện' },
      hamCuaEmCan: ['go_wall', 'pass_back', 'back', 'turn_right', 'pick', 'drop', 'move', 'u_turn', 'to_gap'],
      deBai: 'Ba kho giống ca trước: một thùng chắn hành lang, một thùng nằm cuối nhánh bên phải. Cất thùng chắn ra sau lưng, đi lên ◆ ở đầu hành lang, rồi LÙI về cửa nhánh (bên phải trống), vào nhánh lấy thùng và đặt nó ngay trong cửa nhánh, giống xe mờ và thùng mờ. Không đếm bước: dùng cảm biến. Một chương trình cho cả ba kho.',
      veMaMau: 'Chương trình mới cất thùng chắn và lên ◆. Viết tiếp: lùi về cửa nhánh, rẽ phải, rồi viết thân bring_out() trong Xưởng hàm.',
      san: SAN_R11, batDau: { x: 2, y: 6, huong: 0 }, bongMo: BM_R11,
      maMau: { chinh: ['go_wall()', 'pass_back()', 'go_wall()'], hamCuaMan: [H('bring_out', ['pass'])] },
      sao: { o: 39, nhip: 67 },
      loiGiai: { chinh: L_R11, hamCuaMan: [H('bring_out', BRING)] },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: ['# cất thùng chắn, lên ◆, lùi về cửa nhánh'].concat(L_R11), hamCuaMan: [H('bring_out', BRING)] } },
      loiSai: [
        { moTa: 'Bỏ lên ◆: lùi từ chỗ thùng chắn thì ◆ chưa được ghé', baiLam: { chinh: nhieu(['go_wall()', 'pass_back()', 'to_gap()', 'turn_right()', 'bring_out()']), hamCuaMan: [H('bring_out', BRING)] }, phaiCoMa: ['chua-qua-diem'] },
        { moTa: 'Lùi khi bên phải trống (thiếu chữ not): xe đứng yên ở ◆, rẽ vào tường', baiLam: { chinh: nhieu(['go_wall()', 'pass_back()', 'go_wall()'], WHILE('right_clear()', ['back()']), ['turn_right()', 'bring_out()']), hamCuaMan: [H('bring_out', BRING)] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đếm cứng theo kho đầu: lùi hai ô, kho khác cửa nhánh ở chỗ khác', baiLam: { chinh: ['go_wall()', 'pass_back()', 'go_wall()', 'back()', 'back()', 'turn_right()', 'bring_out()'], hamCuaMan: [H('bring_out', BRING)] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'bring_out() quên lùi: thùng đặt lại cuối nhánh', baiLam: { chinh: L_R11, hamCuaMan: [H('bring_out', ['go_wall()', 'pick()', 'drop()'])] }, phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Ở đầu hành lang, bên phải là tường; tới cửa nhánh thì bên phải trống: while not right_clear(): back().', 'bring_out(): go_wall() tới thùng, pick(), lùi như trên, rồi drop() vào cửa nhánh.']
    }),

    man({
      c: 2, so: 1, ten: 'Lùi tìm thùng', kieuBai: 'do-duong', mucTieu: 'dua-vat',
      hamCuaEmCan: ['back', 'pick_left', 'go_wall', 'drop_right', 'move'],
      deBai: 'R1 đã đủ bộ: tay xoay và cảm biến hai bên. Thùng nằm ở kệ bên trái, đâu đó sau lưng xe. Lùi khi bên trái còn trống, gặp thùng thì dừng, nhặt nó bên trái, rồi đi tới đầu làn và đặt vào ô đích bên phải.',
      veMaMau: 'Chạy thử: xe chưa đứng cạnh thùng nên tay kẹp vào ngăn trống. Thêm vòng while ở đầu: lùi khi bên trái còn trống.',
      san: ['#####', '##.D#', '#..##', '#..##', '#o.##', '#####'], batDau: { x: 2, y: 2, huong: 0 },
      maMau: { chinh: ['pick_left()', 'go_wall()', 'drop_right()'] },
      sao: { o: 27, nhip: 8 },
      loiGiai: { chinh: L_1 },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: ['# lùi tới khi bên trái có thùng'].concat(L_1) } },
      loiSai: [
        { moTa: 'Không lùi tìm thùng: tay kẹp vào ngăn trống', baiLam: { chinh: ['pick_left()', 'go_wall()', 'drop_right()'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Tiến thay vì lùi: thùng ở sau lưng', baiLam: { chinh: nhieu(WHILE('left_clear()', ['move()']), ['pick_left()', 'go_wall()', 'drop_right()']) }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Thêm chữ not: bên trái đang trống nên xe không lùi', baiLam: { chinh: nhieu(WHILE('not left_clear()', ['back()']), ['pick_left()', 'go_wall()', 'drop_right()']) }, phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Ngăn kệ trống thì left_clear() trả True: lùi tiếp. Gặp thùng thì dừng.', 'while left_clear(): back(), rồi pick_left().']
    }),

    man({
      c: 2, so: 2, ten: 'Lùi về hốc đích', kieuBai: 'giao-hang', mucTieu: 'dua-vat',
      hamCuaEmCan: ['go_wall', 'pick', 'back', 'drop_right', 'u_turn', 'move', 'drop_left'],
      deBai: 'Thùng nằm ở cuối làn. Đi tới thùng, nhặt nó, rồi lùi tới khi bên phải trống: đó là hốc đích. Đặt thùng sang phải mà không quay xe.',
      veMaMau: 'Xe đã nhặt được thùng. Viết tiếp: lùi tới hốc đích, đặt sang phải.',
      san: ['#####', '##o##', '##.##', '##.##', '##.D#', '##.##', '#####'], batDau: { x: 2, y: 5, huong: 0 },
      maMau: { chinh: ['go_wall()', 'pick()'] },
      sao: { o: 25, nhip: 8 },
      loiGiai: { chinh: L_2 },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: ['go_wall()', 'pick()', '# lùi tới hốc đích'].concat(WHILE('not right_clear()', ['back()']), ['drop_right()']) } },
      loiSai: [
        { moTa: 'Lùi khi bên phải trống (thiếu chữ not): xe không lùi, đặt vào tường', baiLam: { chinh: nhieu(['go_wall()', 'pick()'], WHILE('right_clear()', ['back()']), ['drop_right()']) }, phaiCoMa: ['tha-bi-chan'] },
        { moTa: 'Lùi về tận chỗ xuất phát: quá hốc đích một ô', baiLam: { chinh: ['go_wall()', 'pick()', 'back()', 'back()', 'back()', 'drop_right()'] }, phaiCoMa: ['tha-bi-chan'] }
      ],
      goiY: ['Trong làn, bên phải xe là tường; tới hốc thì bên phải trống.', 'while not right_clear(): back() rồi drop_right(). Quay đầu thì hốc sang bên trái và chậm hơn.']
    }),

    man({
      c: 2, so: 3, ten: 'Sửa hàm lùi tìm', kieuBai: 'sua-ham', mucTieu: 'dua-vat', chinhCoDinh: true,
      hamCuaEmCan: ['back', 'pick_right', 'drop_left', 'move'],
      deBai: 'Xe đứng ở đầu trên làn. Kệ bên phải có hai thùng ở xa gần khác nhau, ô đích nằm bên trái ngay đối diện mỗi thùng. Hàm seek() của màn phải lùi tới khi bên phải có thùng, nhưng nó lại cho xe tiến. Sửa seek() để cả hai thùng sang ô đích.',
      veMaMau: 'Chương trình chính bị khóa: hai lần seek(), pick_right(), drop_left(). Chạy thử, xem xe đi đâu.',
      san: ['#####', '##..#', '#D.o#', '##..#', '#D.o#', '#####'], batDau: { x: 2, y: 1, huong: 0 },
      maMau: { chinh: C_3, hamCuaMan: [H('seek', SEEK_LOI)] },
      sao: { o: 23, nhip: 10 },
      loiGiai: { chinh: C_3, hamCuaMan: [H('seek', SEEK)] },
      loiGiaiKhac: { moTa: 'Cùng cách sửa, thêm một dòng chú thích trong hàm', baiLam: { chinh: C_3, hamCuaMan: [H('seek', ['# lùi khi kệ phải còn trống'].concat(SEEK))] } },
      loiSai: [
        { moTa: 'Chưa sửa: xe tiến vào tường, bên phải vẫn trống nên lặp mãi', baiLam: { chinh: C_3, hamCuaMan: [H('seek', SEEK_LOI)] }, phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Đếm cứng một bước lùi: thùng thứ hai còn xa hơn', baiLam: { chinh: C_3, hamCuaMan: [H('seek', ['back()'])] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Thêm chữ not: kệ phải đang trống nên xe không lùi', baiLam: { chinh: C_3, hamCuaMan: [H('seek', WHILE('not right_clear()', ['back()']))] }, phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Thùng ở phía sau xe: phải lùi, không tiến.', 'while right_clear(): back() — kệ trống thì lùi tiếp, gặp thùng thì dừng.']
    }),

    man({
      c: 2, so: 4, ten: 'Hàng trao tay', kieuBai: 'hai-robot', mucTieu: 'dua-vat', khoa: 1,
      bd: [{ x: 3, y: 2, huong: 0 }, { x: 1, y: 2, huong: 0 }],
      hamCuaEmCan: ['pick', 'turn_right', 'drop', 'pick_left', 'back', 'drop_right'],
      deBai: 'R2 (tay kẹp, chương trình khóa, xem được) nhặt thùng rồi đặt vào ô bên trái R1. R1 có tay xoay: chờ tới khi bên trái có thùng, nhặt bên trái, lùi một ô rồi đặt thùng vào ô đích bên phải.',
      veMaMau: 'R1 chưa có chương trình. Viết R1: chờ thùng tới bên trái, nhặt, lùi, đặt sang phải.',
      san: ['######', '#o####', '#...##', '###.D#', '######'],
      maMau: B([], R2_4),
      sao: { o: 37, nhip: 8 },
      loiGiai: B(R1_4, R2_4),
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: B(['# chờ hàng từ R2'].concat(R1_4), R2_4) },
      loiSai: [
        { moTa: 'R1 không chờ: nhặt khi thùng chưa tới', baiLam: B(['pick_left()', 'back()', 'drop_right()'], R2_4), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'R1 nhặt rồi đặt ngay sang phải: bên phải là tường', baiLam: B(nhieu(WHILE('left_clear()', ['wait()']), ['pick_left()', 'drop_right()']), R2_4), phaiCoMa: ['tha-bi-chan'] }
      ],
      goiY: ['Chưa có thùng thì left_clear() trả True: chờ tiếp.', 'Lùi một ô thì ô đích nằm ngay bên phải R1.']
    }),

    man({
      c: 2, so: 5, ten: 'Lùi qua cửa tới cờ', kieuBai: 'giao-hang',
      hamCuaEmCan: ['pick', 'back', 'drop_right', 'u_turn', 'move', 'drop_left', 'go_wall', 'drop'],
      deBai: 'Thùng chắn đầu làn. Cửa C phía sau lưng đang đóng, cờ ở sau cửa. Nhặt thùng, lùi tới nút đè M bên phải, đặt thùng lên nút cho cửa mở, rồi lùi qua cửa tới cờ.',
      veMaMau: 'Xe đã nhặt thùng. Viết tiếp: lùi tới nút, đặt thùng, lùi qua cửa.',
      san: ['#####', '##o##', '##.##', '##.M#', '##.##', '##C##', '##.##', '##F##', '#####'], batDau: { x: 2, y: 2, huong: 0 },
      maMau: { chinh: ['pick()'] },
      sao: { o: 21, nhip: 9 },
      loiGiai: { chinh: L_5 },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: ['pick()', '# lùi tới nút đè'].concat(L_5.slice(1)) } },
      loiSai: [
        { moTa: 'Lùi thẳng tới cờ, mang thùng theo: cửa không mở', baiLam: { chinh: nhieu(['pick()'], FOR(5, ['back()'])) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đặt thùng ngay chỗ nhặt: nút trống', baiLam: { chinh: nhieu(['pick()', 'drop()'], FOR(5, ['back()'])) }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Nút M là sàn trống nên right_clear() trả True khi xe tới cạnh nó.', 'Thùng nằm trên M thì cửa mở. Lùi tiếp bốn ô tới cờ.']
    })
  ];

  ManHoc.manTrumMua1 = DS;
  if (laNode) module.exports = ManHoc;
})();
