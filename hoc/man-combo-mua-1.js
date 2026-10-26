/* ============================================================================
   man-combo-mua-1.js — "Robot Chấn Hưng": 19 MÀN MỚI cho mùa 1, gói 9 "Combo" (KE-HOACH-MUA-1.md, bảng 10 gói:
   "10 mới: tay xoay + cảm biến bên" · "che-cam-bien.10 + 9 mới"). Mã gói `combo` (phim gói ở game/phim-mua-1.js tự chiếu).

   Ý chính của gói (combo): CẢM BIẾN BÊN hỏi bên nào có thùng (thùng làm left_clear() / right_clear() trả False), rồi TAY XOAY nhặt / đặt
   đúng bên đó mà KHÔNG QUAY XE (pick_left / pick_right / drop_left / drop_right của chương che-tay-xoay).
   Robot: xe hai bánh + TAY XOAY + cảm biến khoảng cách ba hướng (như R2 của chương che-hai-robot). Màn hai robot: R1 tay kẹp (vàng), R2 tay xoay (lam).

   - Chương `combo` "Nhìn bên, nhặt bên" (mã combo.1 … .10; .10 trùm ba sân, huy hiệu 'combo'): combo cốt lõi.
   - Chương `che-combo` "Combo mở rộng" (mã che-combo.1 … .9 + che-cam-bien.10 do lo-trinh-hoc.js chèn; trùm che-combo.9 ba sân,
     huy hiệu 'che-combo'): ghép combo với từng gói cũ (hàm, vòng for, front_clear / go_wall, nút đè, bánh lùi, đội hai robot).
   Mỗi màn khai `kieuBai` (giao-hang · do-duong · sua-ham · che-ham · do-nhip · nhieu-san · hai-robot): kiem-combo-mua-1.mjs kiểm
   không hai màn liền nhau cùng kiểu, và in BẢNG RECALL (gói 1–8 nào được dùng, đọc từ lời giải).

   Ràng buộc mùa 1: không biến (khung.chanBien), không hàm có tham số, không bậc thang, không part mùa sau. Không tạo hàm của em mới:
   màn "chế hàm" / "sửa hàm" dùng HÀM CỦA MÀN (maMau.hamCuaMan) mà chương trình chính bị khóa (chinhCoDinh) gọi.
   Hàm của em dùng được: mọi hàm chế ở gói 1–8 (go_wall, back, to_gap, pick_left, drop_right, pick_right, drop_left, put_right…).

   Sao: sao.o / sao.nhip đo bằng cham.js trên lời giải (kiem-combo-mua-1.mjs so khớp đúng từng số).
   Tệp này KHÔNG tự thêm màn vào ManHoc: danh sách nằm ở ManHoc.manComboMua1, lo-trinh-hoc.js thêm hai chương vào gói combo.
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
  /** if <dk>: a else: b (a, b là mảng dòng). */
  function IF(dk, a, b) { return ['if ' + dk + ':'].concat(THUT(a), b ? ['else:'].concat(THUT(b)) : []); }
  /** Nhặt bên có thùng: bên trái trống thì thùng ở bên phải. */
  var NHAT_BEN = IF('left_clear()', ['pick_right()'], ['pick_left()']);
  /** Bài làm hai robot. */
  function B(c1, c2, hm) { return { doi: [{ chinh: c1.slice() }, { chinh: c2.slice() }], hamCuaMan: hm || [] }; }

  /**
   * Trường chung. m.c: 1 (chương combo) hay 2 (chương che-combo). Màn hai robot: m.bd = [batDau R1, batDau R2], m.khoa = chỉ số robot khóa.
   */
  function man(m) {
    var c = m.c, bd = m.bd, khoa = m.khoa;
    delete m.c; delete m.bd; delete m.khoa;
    m.chuong = c === 1 ? 'combo' : 'che-combo';
    m.hang = m.so <= 3 ? 'lam-quen' : m.so <= 6 ? 'luyen' : m.so <= 9 ? 'bien-the' : 'trum';
    m.cauTruc = ['for', 'if', 'while'];
    m.mucTieu = m.mucTieu || 'toi-co';
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10, chanBien: true };
    m.nhipTheoLoiGiai = true;
    if (bd) {
      m.doi = [Object.assign({ batDau: bd[0] }, sao(KEP), { robot: Object.assign(sao(KEP.robot), { son: 'vang' }) }),
        Object.assign({ batDau: bd[1] }, sao(XOAY), { robot: Object.assign(sao(XOAY.robot), { son: 'lam' }) })];
      if (khoa !== undefined) m.doi[khoa].coDinh = true;
      m.batDau = bd[0]; m.loaiRobot = KEP.loaiRobot; m.robot = sao(m.doi[0].robot); m.hamGoc = KEP.hamGoc.slice();   // cấp ngoài = R1
    } else {
      m.loaiRobot = XOAY.loaiRobot; m.robot = sao(XOAY.robot); m.hamGoc = XOAY.hamGoc.slice();
    }
    if (Array.isArray(m.san[0])) {
      m.nhipTheo = 'tong';
      if (!bd && !Array.isArray(m.batDau)) m.batDau = m.san.map(function () { return Object.assign({}, m.batDau); });
    }
    m.taoHam = [];
    return ManHoc.chuanHoa(m);
  }

  /* ================================================================ chương combo "Nhìn bên, nhặt bên" */

  // 1: xe (2,2) quay lên, đi tới tường ở (2,1); thùng ở bên trái (1,1), bên phải (3,1) trống; ô đích (2,3) phía sau
  var L_1 = nhieu(['go_wall()'], NHAT_BEN, ['u_turn()', 'move()', 'drop()']);
  // 2: làn x = 2, kệ phải x = 3 (sàn trống); thùng ở (3,2); ô đích (3,5) ngay bên phải chỗ xuất phát (2,5). Đi tới khi bên phải có thùng, nhặt,
  //    lùi về chỗ cũ (ba ô), đặt sang phải. Đi tắt qua kệ (vào kệ, nhặt phía trước, quay xuống đặt) cũng 10 nhịp: không nhanh hơn.
  var L_2 = nhieu(['while right_clear():', '    move()', 'pick_right()'], FOR(3, ['back()']), ['drop_right()']);
  /** Đổi kệ: nhặt thùng ở bên có thùng, đặt sang bên đối diện (bên kia còn trống). */
  var DOI_KE = IF('left_clear()', ['pick_right()', 'drop_left()'], ['pick_left()', 'drop_right()']);
  // 3: làn x = 2, xe (2,3) quay lên; trạm (2,2): thùng trái (1,2), ô đích phải (3,2); trạm (2,1): ô đích trái (1,1), thùng phải (3,1).
  //    Chương trình chính khóa: for 2 lần move(), cross(). Hàm của màn cross() đặt nhầm cùng một bên (drop_left) ở mọi trạm.
  var C_3 = FOR(2, ['move()', 'cross()']);
  var CROSS_LOI = IF('left_clear()', ['pick_right()'], ['pick_left()']).concat(['drop_left()']);
  // 4: xe (2,1) quay lên, thùng bên trái (1,1); ô đích (1,3) ở bên trái, hai ô phía sau. Lùi giữ đúng bên của tay xoay; quay đầu thì tốn thêm nhịp và bên trái thành bên phải.
  var L_4 = nhieu(NHAT_BEN, FOR(2, ['back()']), ['drop_left()']);
  // 5: xe (2,5) quay lên; cửa C (2,2) đóng chắn làn; ở hàng 3: thùng bên trái (1,3), nút đè M bên phải (3,3); cờ (2,1) sau cửa.
  var L_5 = nhieu(['go_wall()'], DOI_KE, ['go_wall()']);
  // 6: hai dãy kệ (hàng 1–4, sàn trống) hai bên làn x = 2, làn còn một ô (2,5); xe (2,1) quay lên ở đầu làn; thùng ở kệ phải (3,4); ô đích (2,3) giữa làn.
  //    LÙI khi CẢ HAI bên còn trống (hai if lồng trong vòng for), gặp thùng bên nào cũng dừng; nhặt rồi đặt vào ô đích ngay trước mặt.
  var TIM = FOR(4, ['if left_clear():', '    if right_clear():', '        back()']);
  var L_6 = nhieu(TIM, NHAT_BEN, ['drop()']);
  // 7: làn có hai thùng chắn (2,3), (2,2); xe (2,4) quay lên. Ngăn trống: (1,4) bên trái ở hàng 4, (3,3) bên phải ở hàng 3 (bên kia là tường).
  //    Chương trình chính khóa: for 2 lần pick(), side_drop(), move(). Người chơi viết thân side_drop(): đặt vào bên còn trống. Xe mờ ở (2,2).
  var C_7 = FOR(2, ['pick()', 'side_drop()', 'move()']);
  var SIDE_DROP = IF('left_clear()', ['drop_left()'], ['drop_right()']);
  // 8: làn x = 2, kệ phải x = 3 có thùng A (3,3) và B (3,1); bên trái làn là tường trừ hai ô đích (1,3), (1,4). Xe (2,4) quay lên.
  //    Lần đầu nhặt A rồi không phải lùi (cạnh ô đích trống); lần sau nhặt B rồi lùi ba ô (ô đích (1,3) đã có A). Lùi cố định bao nhiêu ô cũng sai một lần.
  //    Chương trình chính khóa: for 2 lần fetch_box(), drop_left(). fetch_box(): đi tới khi bên phải có thùng, nhặt, lùi tới khi bên trái trống.
  var C_8 = FOR(2, ['fetch_box()', 'drop_left()']);
  var FETCH_BOX = ['while right_clear():', '    move()', 'pick_right()', 'while not left_clear():', '    back()'];
  var FETCH_BOX_LOI = ['while right_clear():', '    move()', 'pick_right()', 'while left_clear():', '    back()'];
  // 9: xe (2,2) quay lên; thùng bên phải (3,2), nút đè M bên trái (1,2); cửa C (2,3) sau lưng đóng; cờ (2,5) phía sau cửa. Lùi qua cửa (không quay đầu).
  var L_9 = nhieu(DOI_KE, FOR(3, ['back()']));
  // 10 (trùm, ba sân): làn x = 2, ba trạm hàng 5, 4, 3: mỗi trạm một thùng ở một bên, bên kia là ô đích hay nút đè M; cửa C (2,2) mở khi có thùng trên M;
  //    xe (2,6) quay lên, xe mờ ở cuối làn (2,1) sau cửa. Bên có thùng mỗi sân một khác.
  function kho3(r3, r4, r5) { return ['#####', '##.##', '##C##', r3, r4, r5, '##.##', '#####']; }
  var SAN_10 = [kho3('#o.M#', '#D.o#', '#o.D#'), kho3('#D.o#', '#o.M#', '#D.o#'), kho3('#o.D#', '#o.D#', '#M.o#')];
  /** Ô đích / nút đè của sân (nơi thùng phải nằm khi xong). */
  function dichCua(rows) { var ds = []; rows.forEach(function (r, y) { for (var x = 0; x < r.length; x++) if (r[x] === 'D' || r[x] === 'M') ds.push({ x: x, y: y }); }); return ds; }
  var BM_10 = SAN_10.map(function (rows) { return { x: 2, y: 1, huong: 0, vat: dichCua(rows) }; });
  var L_10 = nhieu(FOR(3, ['move()'].concat(DOI_KE)), ['go_wall()']);

  var DS = [
    man({
      c: 1, so: 1, ten: 'Thùng nằm bên nào', kieuBai: 'giao-hang', mucTieu: 'dua-vat',
      hamCuaEmCan: ['go_wall', 'pick_right', 'pick_left', 'u_turn', 'move', 'drop'],
      deBai: 'Xe có tay xoay và cảm biến hai bên. Đi tới tường, hỏi cảm biến xem thùng nằm bên trái hay bên phải, xoay tay nhặt đúng bên đó mà không quay xe, rồi mang thùng về đặt vào ô đích sau lưng.',
      veMaMau: 'Chương trình mới biết nhặt bên phải. Thêm nhánh else cho trường hợp thùng ở bên trái.',
      san: ['#####', '#o..#', '##.##', '##D##', '#####'], batDau: { x: 2, y: 2, huong: 0 },
      maMau: { chinh: ['go_wall()', 'if left_clear():', '    pick_right()', 'u_turn()', 'move()', 'drop()'] },
      sao: { o: 28, nhip: 6 },
      loiGiai: { chinh: L_1 },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: ['# thùng ở bên nào?'].concat(L_1) } },
      loiSai: [
        { moTa: 'Chỉ biết nhặt bên phải: thùng nằm bên trái nên tay kẹp vào chỗ trống', baiLam: { chinh: ['go_wall()', 'if left_clear():', '    pick_right()', 'u_turn()', 'move()', 'drop()'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Đảo hai nhánh: bên trái có thùng lại đi nhặt bên phải', baiLam: { chinh: nhieu(['go_wall()'], IF('left_clear()', ['pick_left()'], ['pick_right()']), ['u_turn()', 'move()', 'drop()']) }, phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Thùng nằm cạnh xe thì cảm biến bên đó trả False, giống như gặp tường.', 'if left_clear(): pick_right() — còn không (else) thì pick_left().']
    }),

    man({
      c: 1, so: 2, ten: 'Dừng cạnh thùng', kieuBai: 'do-duong', mucTieu: 'dua-vat',
      hamCuaEmCan: ['move', 'pick_right', 'back', 'drop_right', 'go_wall', 'u_turn'],
      deBai: 'Dọc lối đi, kệ bên phải còn trống nhiều ngăn, chỉ một ngăn có thùng. Đi tới khi thấy thùng ở bên phải, nhặt nó, rồi lùi về chỗ xuất phát và đặt thùng vào ô đích ở kệ bên phải. go_wall() sẽ đi quá chỗ thùng.',
      veMaMau: 'Xe đã dừng đúng cạnh thùng và nhặt được. Viết tiếp: lùi ba ô bằng vòng for, đặt sang phải.',
      san: ['#####', '##.##', '##.o#', '##..#', '##..#', '##.D#', '#####'], batDau: { x: 2, y: 5, huong: 0 },
      maMau: { chinh: ['while right_clear():', '    move()', 'pick_right()'] },
      sao: { o: 26, nhip: 9 },
      loiGiai: { chinh: L_2 },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: ['# tới khi bên phải có thùng'].concat(L_2) } },
      loiSai: [
        { moTa: 'Đi tới tường: chạy quá chỗ thùng, tay kẹp vào ngăn trống', baiLam: { chinh: nhieu(['go_wall()', 'pick_right()'], FOR(3, ['back()']), ['drop_right()']) }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quay đầu rồi đi ba ô: ô đích chuyển sang bên trái xe', baiLam: { chinh: nhieu(['while right_clear():', '    move()', 'pick_right()', 'u_turn()'], FOR(3, ['move()']), ['drop_right()']) }, phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Ngăn kệ trống thì right_clear() trả True: đi tiếp. Gặp thùng thì dừng.', 'Lùi thì mặt xe và bên phải vẫn như cũ: for i in range(3): back().']
    }),

    man({
      c: 1, so: 3, ten: 'Sửa hàm đổi kệ', kieuBai: 'sua-ham', mucTieu: 'dua-vat', chinhCoDinh: true,
      hamCuaEmCan: ['move', 'pick_right', 'pick_left', 'drop_left', 'drop_right'],
      deBai: 'Mỗi trạm có một thùng ở một bên và ô đích ở bên đối diện. Hàm cross() của màn phải chuyển thùng sang bên kia lối đi, nhưng nó luôn đặt thùng sang bên trái. Sửa cross() để cả hai trạm đều đúng.',
      veMaMau: 'Chương trình chính bị khóa: hai lần move(), cross(). Thử cross() ở hai trạm, xem trạm nào đặt sai.',
      san: ['#####', '#D.o#', '#o.D#', '##.##', '#####'], batDau: { x: 2, y: 3, huong: 0 },
      maMau: { chinh: C_3, hamCuaMan: [H('cross', CROSS_LOI)] },
      sao: { o: 40, nhip: 9 },
      loiGiai: { chinh: C_3, hamCuaMan: [H('cross', DOI_KE)] },
      loiGiaiKhac: { moTa: 'Cùng cách sửa, thêm một dòng chú thích trong hàm', baiLam: { chinh: C_3, hamCuaMan: [H('cross', ['# nhặt bên có thùng, đặt bên kia'].concat(DOI_KE))] } },
      loiSai: [
        { moTa: 'Chưa sửa: trạm đầu thùng bị đặt về chỗ cũ', baiLam: { chinh: C_3, hamCuaMan: [H('cross', CROSS_LOI)] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Đếm cứng theo trạm đầu: nhặt trái đặt phải ở mọi trạm', baiLam: { chinh: C_3, hamCuaMan: [H('cross', ['pick_left()', 'drop_right()'])] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Đảo hai nhánh: bên trái trống lại đi nhặt bên trái', baiLam: { chinh: C_3, hamCuaMan: [H('cross', IF('left_clear()', ['pick_left()', 'drop_right()'], ['pick_right()', 'drop_left()']))] }, phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Nhặt bên trái thì phải đặt sang phải, và ngược lại.', 'Đặt lệnh drop vào trong từng nhánh: nhánh if có drop_left(), nhánh else có drop_right().']
    }),

    man({
      c: 1, so: 4, ten: 'Lùi giữ bên tay', kieuBai: 'do-nhip', mucTieu: 'dua-vat',
      hamCuaEmCan: ['pick_right', 'pick_left', 'back', 'drop_left', 'u_turn', 'move'],
      deBai: 'Ô đích nằm bên trái, hai ô phía sau xe. Nhặt thùng ở bên có thùng, rồi đưa nó tới ô đích trong 5 nhịp. Quay xe tốn nhịp; lùi thì bên trái vẫn là bên trái, tay xoay không phải đổi bên.',
      veMaMau: 'Xe đã nhặt được thùng. Viết tiếp: lùi hai ô rồi đặt sang trái.',
      san: ['#####', '#o..#', '##.##', '#D.##', '#####'], batDau: { x: 2, y: 1, huong: 0 },
      maMau: { chinh: NHAT_BEN.slice() },
      sao: { o: 24, nhip: 5 },
      loiGiai: { chinh: L_4 },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: NHAT_BEN.concat(['# lùi giữ bên tay'], FOR(2, ['back()']), ['drop_left()']) } },
      loiSai: [
        { moTa: 'Quay đầu rồi tiến hai ô: ô đích sang bên phải xe, bên trái là tường', baiLam: { chinh: nhieu(NHAT_BEN, ['u_turn()'], FOR(2, ['move()']), ['drop_left()']) }, phaiCoMa: ['tha-bi-chan', 'chua-dua-vat'] },
        { moTa: 'Lùi một ô: bên trái còn là tường', baiLam: { chinh: nhieu(NHAT_BEN, ['back()', 'drop_left()']) }, phaiCoMa: ['tha-bi-chan', 'chua-dua-vat'] }
      ],
      goiY: ['back() lùi một ô mà mặt xe không đổi.', 'Quay đầu rồi đi cũng tới nơi nhưng chậm hơn một nhịp, và phải đặt sang phải.']
    }),

    man({
      c: 1, so: 5, ten: 'Thùng lên nút đè', kieuBai: 'giao-hang',
      hamCuaEmCan: ['go_wall', 'pick_right', 'drop_left', 'pick_left', 'drop_right', 'move'],
      deBai: 'Cửa C đóng chắn lối lên cờ. Bên cạnh chỗ dừng trước cửa có một thùng ở một bên và nút đè M ở bên kia. Hỏi cảm biến xem thùng ở bên nào, chuyển nó sang nút M cho cửa mở, rồi đi tới cờ.',
      veMaMau: 'Chạy thử: go_wall() dừng trước cửa đóng (cửa đóng chắn cảm biến như tường). Viết tiếp.',
      san: ['#####', '##F##', '##C##', '#o.M#', '##.##', '##.##', '#####'], batDau: { x: 2, y: 5, huong: 0 },
      maMau: { chinh: ['go_wall()'] },
      sao: { o: 27, nhip: 8 },
      loiGiai: { chinh: L_5 },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: ['go_wall()', '# thùng sang nút đè'].concat(DOI_KE, ['go_wall()']) } },
      loiSai: [
        { moTa: 'Nhặt thùng rồi mang theo: không có gì đè nút, cửa vẫn đóng', baiLam: { chinh: nhieu(['go_wall()'], NHAT_BEN, ['go_wall()']) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đặt thùng về chỗ cũ: nút M vẫn trống', baiLam: { chinh: nhieu(['go_wall()'], IF('left_clear()', ['pick_right()', 'drop_right()'], ['pick_left()', 'drop_left()']), ['go_wall()']) }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Nút M là sàn trống nên cảm biến bên đó trả True.', 'Thùng bên trái thì đặt sang phải lên M, và ngược lại. Cửa mở rồi go_wall() lần nữa.']
    }),

    man({
      c: 1, so: 6, ten: 'Bên nào cũng dừng', kieuBai: 'do-duong', mucTieu: 'dua-vat',
      hamCuaEmCan: ['back', 'pick_right', 'pick_left', 'drop', 'move'],
      deBai: 'Xe đứng ở đầu lối đi giữa hai dãy kệ trống, chỉ một ngăn có thùng, không biết ở bên nào. Lùi khi cả hai bên còn trống, gặp thùng thì dừng, nhặt nó, rồi đặt vào ô đích ngay trước mặt (ô xe vừa lùi qua).',
      veMaMau: 'Vòng lặp chỉ hỏi bên trái nên xe lùi quá thùng bên phải. Thêm câu hỏi bên phải vào trong.',
      san: ['#####', '#...#', '#...#', '#.D.#', '#..o#', '##.##', '#####'], batDau: { x: 2, y: 1, huong: 0 },
      maMau: { chinh: nhieu(FOR(4, ['if left_clear():', '    back()']), NHAT_BEN, ['drop()']) },
      sao: { o: 24, nhip: 6 },
      loiGiai: { chinh: L_6 },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: ['# lùi khi hai bên đều trống'].concat(L_6) } },
      loiSai: [
        { moTa: 'Chỉ hỏi bên trái: lùi quá thùng bên phải', baiLam: { chinh: nhieu(FOR(4, ['if left_clear():', '    back()']), NHAT_BEN, ['drop()']) }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Tiến thay vì lùi: thùng ở phía sau lưng', baiLam: { chinh: nhieu(FOR(4, ['if left_clear():', '    if right_clear():', '        move()']), NHAT_BEN, ['drop()']) }, phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Hai câu if lồng nhau: bên trái trống, và bên phải cũng trống, thì mới back().', 'Khi đã dừng, các vòng lặp còn lại không làm gì (không tốn nhịp). Lùi thì ô vừa đi qua nằm ngay trước mặt.']
    }),

    man({
      c: 1, so: 7, ten: 'Dọn lối đi', kieuBai: 'che-ham', mucTieu: 'bong-mo', chinhCoDinh: true,
      hamCuaEmCan: ['pick', 'move', 'drop_left', 'drop_right'],
      deBai: 'Hai thùng chắn giữa lối đi. Chương trình chính nhặt thùng trước mặt, gọi side_drop(), rồi tiến vào chỗ vừa trống. Viết thân side_drop() của màn: đặt thùng vào ngăn còn trống ở bên trái hay bên phải xe (bên kia là tường). Xong thì xe đứng như xe mờ.',
      veMaMau: 'Chương trình chính bị khóa. Thân side_drop() còn trống (pass): viết nó trong Xưởng hàm.',
      san: ['#####', '##.##', '##o##', '##oD#', '#D.##', '#####'], batDau: { x: 2, y: 4, huong: 0 },
      bongMo: { x: 2, y: 2, huong: 0, vat: [{ x: 1, y: 4 }, { x: 3, y: 3 }] },
      maMau: { chinh: C_7, hamCuaMan: [H('side_drop', ['pass'])] },
      sao: { o: 30, nhip: 10 },
      loiGiai: { chinh: C_7, hamCuaMan: [H('side_drop', SIDE_DROP)] },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích trong hàm', baiLam: { chinh: C_7, hamCuaMan: [H('side_drop', ['# bên nào trống thì đặt bên đó'].concat(SIDE_DROP))] } },
      loiSai: [
        { moTa: 'Luôn đặt sang trái: thùng thứ hai đặt vào tường', baiLam: { chinh: C_7, hamCuaMan: [H('side_drop', ['drop_left()'])] }, phaiCoMa: ['tha-bi-chan'] },
        { moTa: 'Hỏi ngược: bên trái trống lại đặt sang phải (vào tường)', baiLam: { chinh: C_7, hamCuaMan: [H('side_drop', IF('left_clear()', ['drop_right()'], ['drop_left()']))] }, phaiCoMa: ['tha-bi-chan'] }
      ],
      goiY: ['Ngăn trống thì cảm biến bên đó trả True; tường thì False.', 'if left_clear(): drop_left() — còn không thì drop_right().']
    }),

    man({
      c: 1, so: 8, ten: 'Sửa hàm lấy hàng', kieuBai: 'sua-ham', mucTieu: 'dua-vat', chinhCoDinh: true,
      hamCuaEmCan: ['move', 'pick_right', 'back', 'drop_left'],
      deBai: 'Kệ bên phải có hai thùng xa gần khác nhau; bên trái lối đi là tường, trừ hai ô đích ở cuối. Hàm fetch_box() của màn đi tới thùng, nhặt, rồi phải lùi tới khi bên trái trống (cạnh một ô đích còn trống). Nhưng điều kiện lùi viết sai nên xe lùi mãi. Sửa hàm.',
      veMaMau: 'Chương trình chính bị khóa: hai lần fetch_box(), drop_left(). Chạy thử, xem xe đứng đâu khi đặt.',
      san: ['#####', '##.o#', '##..#', '#D.o#', '#D..#', '#####'], batDau: { x: 2, y: 4, huong: 0 },
      maMau: { chinh: C_8, hamCuaMan: [H('fetch_box', FETCH_BOX_LOI)] },
      sao: { o: 28, nhip: 13 },
      loiGiai: { chinh: C_8, hamCuaMan: [H('fetch_box', FETCH_BOX)] },
      loiGiaiKhac: { moTa: 'Cùng cách sửa, thêm một dòng chú thích trong hàm', baiLam: { chinh: C_8, hamCuaMan: [H('fetch_box', FETCH_BOX.slice(0, 3).concat(['# lùi tới ô đích còn trống'], FETCH_BOX.slice(3)))] } },
      loiSai: [
        { moTa: 'Chưa sửa: thiếu chữ not, bên trái trống mà xe vẫn lùi mãi', baiLam: { chinh: C_8, hamCuaMan: [H('fetch_box', FETCH_BOX_LOI)] }, phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Lùi cố định một ô: lần sau còn cách ô đích xa', baiLam: { chinh: C_8, hamCuaMan: [H('fetch_box', FETCH_BOX.slice(0, 3).concat(['back()']))] }, phaiCoMa: ['tha-bi-chan', 'chua-dua-vat'] }
      ],
      goiY: ['Bên trái là tường thì left_clear() trả False: phải lùi tiếp.', 'while not left_clear(): back(). Ô đích đã có thùng cũng làm cảm biến thấy vướng.']
    }),

    man({
      c: 1, so: 9, ten: 'Lùi qua cửa', kieuBai: 'do-nhip',
      hamCuaEmCan: ['pick_right', 'drop_left', 'pick_left', 'drop_right', 'back', 'u_turn', 'go_wall'],
      deBai: 'Cửa C sau lưng xe đang đóng, cờ ở phía sau cửa. Hai bên xe: một thùng và một nút đè M. Chuyển thùng lên nút cho cửa mở, rồi tới cờ trong 7 nhịp. Quay đầu tốn thêm một nhịp: lùi qua cửa.',
      veMaMau: 'Chương trình mới đổi thùng sang nút. Viết tiếp: tới cờ ở sau lưng.',
      san: ['#####', '#####', '#M.o#', '##C##', '##.##', '##F##', '#####'], batDau: { x: 2, y: 2, huong: 0 },
      maMau: { chinh: DOI_KE.slice() },
      sao: { o: 25, nhip: 7 },
      loiGiai: { chinh: L_9 },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: DOI_KE.concat(['# cửa đã mở: lùi qua'], FOR(3, ['back()'])) } },
      loiSai: [
        { moTa: 'Lùi trước khi đặt thùng lên nút: cửa còn đóng', baiLam: { chinh: nhieu(FOR(3, ['back()']), DOI_KE) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Mang thùng theo: nút trống, cửa đóng', baiLam: { chinh: nhieu(NHAT_BEN, FOR(3, ['back()'])) }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Thùng nằm trên M thì cửa mở và giữ mở.', 'Lùi ba ô: for i in range(3): back(). Quay đầu rồi go_wall() chậm hơn một nhịp.']
    }),

    man({
      c: 1, so: 10, ten: 'Kho hai bên', kieuBai: 'nhieu-san', mucTieu: 'bong-mo',
      huyHieu: { ma: 'combo', ten: 'Huy hiệu Nhìn bên, nhặt bên' },
      hamCuaEmCan: ['move', 'pick_right', 'drop_left', 'pick_left', 'drop_right', 'go_wall'],
      deBai: 'Ba kho, mỗi kho ba trạm dọc lối đi. Ở mỗi trạm, thùng nằm ở một bên, bên kia là ô đích hay nút đè M; kho nào thùng nằm bên nào cũng khác. Chuyển mọi thùng sang bên đối diện, rồi đi qua cửa tới cuối lối đi như xe mờ. Một chương trình cho cả ba kho.',
      veMaMau: 'Chương trình mới làm xong trạm đầu của một kho. Lặp cho ba trạm, rồi qua cửa.',
      san: SAN_10, batDau: { x: 2, y: 6, huong: 0 }, bongMo: BM_10,
      maMau: { chinh: ['move()', 'pick_left()', 'drop_right()'] },
      sao: { o: 42, nhip: 51 },
      loiGiai: { chinh: L_10 },
      loiGiaiKhac: { moTa: 'Cùng cách làm, thêm một dòng chú thích', baiLam: { chinh: ['# ba trạm, mỗi trạm đổi kệ'].concat(L_10) } },
      loiSai: [
        { moTa: 'Đếm cứng theo kho đầu: kho khác thùng nằm bên khác', baiLam: { chinh: ['move()', 'pick_left()', 'drop_right()', 'move()', 'pick_right()', 'drop_left()', 'move()', 'pick_left()', 'drop_right()', 'go_wall()'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Chỉ chuyển trạm cuối: cửa có thể mở nhưng còn thùng chưa sang', baiLam: { chinh: nhieu(FOR(3, ['move()']), DOI_KE, ['go_wall()']) }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quên qua cửa: xe dừng ở trạm cuối', baiLam: { chinh: FOR(3, ['move()'].concat(DOI_KE)) }, phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Mỗi trạm làm giống nhau: move(), rồi hỏi bên trái để chọn nhặt bên nào, đặt bên kia.', 'Nút M là một ô đích đặc biệt: có thùng thì cửa mở.']
    })
  ];

  ManHoc.manComboMua1 = DS;
  if (laNode) module.exports = ManHoc;
})();
