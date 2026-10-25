/* ============================================================================
   man-che-xich.js — "Robot Chấn Hưng": CHƯƠNG `che-xich` · CHẾ LỆNH XÍCH (10 màn). Kế hoạch "Chế lệnh" (KE-HOACH-CHE-LENH.md, mục 5c.1), làm 15/10.
   Chương thứ 16 (ngay sau Bánh xích, man-xich.js). Robot là XE BÁNH XÍCH: robot { than: 'xich', tay: null } (tay kẹp ở che-xich.6 và 10). Xưởng hàm mở, được dùng hàm của em.
   Luật thiết kế như che-xe: lệnh gốc chỉ đổi MỘT trạng thái (một bên xích quay tới / lùi); động tác hay (quay đầu, né sang bên, leo bậc, xuống bậc, nhặt vật sau lưng)
   là thứ NGƯỜI CHƠI TỰ CHẾ. Mỗi lệnh chế được ít nhất hai cách và cả hai đều thắng: `congThucKhac: [{ moTa, hamCuaEmMoi }]` (kiem-che-xich.mjs chạy từng cách).
   Màn dùng HÀM CỦA MÀN (7, 8: hàm chỉ đúng cho màn đó, không vào kho) khai cách khác bằng `{ moTa, baiLam: { chinh, hamCuaMan } }`.

   LUẬT XÍCH (san-hoc.js, phần 'xich'): tiến / lùi 1 ô mỗi nhịp; QUAY CHẬM: cần 2 nhịp LIÊN TIẾP CÙNG tổ hợp bánh mới quay đủ 90° (quay đầu 180° = 4 nhịp); nhịp kế khác tổ hợp thì phần quay dở mất;
   bậc thang S đi như sàn; băng chuyền không đẩy được xích. Hàm quay của xe bánh (turn_right, turn_left, u_turn, dodge_*…) quay SAI trên xích: em dùng tr_right(), tr_left() của chương xich.
   Mục tiêu `bong-mo` (san-hoc.js, phần BÓNG MỜ): xe phải đứng đúng tư thế "xe mờ" khi chương trình CHẠY XONG (vật mờ cho biết vật phải nằm ở ô nào; bongMo.cam: xe đang cầm vật).
   `chinhCoDinh: true` — chương trình chính khóa (bản mẫu `maMau.chinh`), người chơi chỉ sửa / tạo hàm trong Xưởng. 3, 9 và 10 không khóa: người chơi tự viết chương trình chính.

   KHAY: cả chương mở đủ bốn lệnh bánh (có bánh lùi) và wait(); 6 và 10 thêm bốn lệnh tay kẹp. Màn 9 là màn HỎNG (xích trái kẹt số lùi, không có left_move): khay = phần cứng.
   Hàm của em có sẵn ở chương này: toàn bộ chương trước (move, back, forward(n), pick, drop, tr_right, tr_left…). KHÔNG dùng hàm quay của xe bánh (turn_right, turn_left, u_turn) trên xích.
     pick() = arm_down(), grab(), wait(), arm_up(), wait()      (2 nhịp)        drop() = arm_down(), release(), wait(), arm_up(), wait()      (2 nhịp)

   Hàm của em MỚI (tên cốt truyện, khóa trong kho):
     che-xich.1 spin()           = tr_right(), tr_right()                                   quay đầu tại chỗ, mặt hướng ngược lại (4 nhịp)
     che-xich.2 sidestep()       = tr_right(), move(), tr_left()                            né sang phải một ô, giữ hướng (5 nhịp)
     che-xich.4 climb(n)         = for n lần: move(), tr_left(), move(), tr_right()         leo n bậc: mỗi bậc đi một ô, rẽ trái, đi một ô, rẽ phải (6 nhịp / bậc)
     che-xich.5 descend(n)       = for n lần: tr_left(), back(), tr_right(), back()         xuống n bậc BẰNG CÁCH LÙI: làm ngược lại climb(n) (6 nhịp / bậc), không phải quay đầu
     che-xich.6 pick_behind()    = spin(), pick(), spin()                                   nhặt vật SAU LƯNG; xong xe đang CẦM vật, mặt như cũ (10 nhịp)
   HÀM CỦA MÀN (15/10: hàm chỉ đúng cho MỘT màn thì không vào kho, người chơi tự viết / sửa thân trong màn; `maMau.hamCuaMan`, không `taoHam`, không có trong Sổ lệnh):
     che-xich.7 to_hill()        khóa, xem được: forward(2), tr_right(), forward(2), climb(2); back_home() thân ban đầu `pass`, lời giải descend(2), back(), back(), tr_left(), back(), back()
                                 đi NGƯỢC lại to_hill(): đảo thứ tự, mỗi lệnh đổi thành lệnh ngược (tiến ↔ lùi, rẽ phải ↔ rẽ trái, climb ↔ descend)
     che-xich.8 fixed_drive()    thân ban đầu = move() cũ; fixed_turn() thân ban đầu = tr_right() cũ: xích TRÁI đấu ngược (daoChieu ['trai']), left_move() làm xích trái quay LÙI;
                                 lời giải đổi left_move ↔ left_back trong cả hai hàm
   Hàm của em được SỬA ở chương này (không tính là tạo mới):
     che-xich.9 tr_right() = right_back(), wait() hai lần      xích trái kẹt số lùi (không có left_move): quay phải bằng xích phải lùi; vẫn đúng ở mọi màn khác (cùng là quay phải 90° hai nhịp).
                                 spin() gọi tr_right() nên tự chạy lại được.

   Sao: sao.nhip = số nhịp của lời giải cách 1 chạy thật; máy kiểm (kiem-hoc.mjs, do-duong-che-xich.mjs) dò BFS rằng không có đường tắt (BFS = sao.nhip, hoặc ≤ khi nhipTheoLoiGiai).
   Màn 6 và 10 (tay kẹp) dùng nhipTheoLoiGiai: pick() / drop() của kho có nhịp wait() nâng tay riêng (2 nhịp), còn BFS gộp nâng tay vào nhịp quay kế tiếp nên luôn ngắn hơn hay bằng (6: BFS 9, lời giải 10).
   Màn 10: lời giải chuẩn (nhặt sau lưng rồi quay về, đi tới, né, leo) 33 nhịp; đường ngắn nhất BFS 27 nhịp là quay đầu MỘT lần rồi LÙI suốt đường và rẽ trái từng góc,
   cần thẳng tay gọi back(), tr_left(), move(), spin(), pick(), drop() (vượt giới hạn 5 hàm của em), nên sao.nhip lấy theo lời giải chuẩn trong giới hạn; kiem-hoc chỉ đòi BFS <= sao.nhip.
   sao.o = ô chương trình + thân các hàm thực sự được gọi (kể cả hàm lồng nhau, mỗi hàm tính một lần).
   Hướng: 0 lên, 1 phải, 2 xuống, 3 trái. (x, y) với y = 0 ở hàng trên.
   Nối tiếp man-chuoi-1.js vào cùng window.ManHoc. Thứ tự chương: thu-tu-chuong.js.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var XICH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var XICH_TAY = XICH.concat(['arm_down', 'arm_up', 'grab', 'release']);
  var XICH_HONG = ['right_move', 'left_back', 'right_back', 'wait'];                 // 9: xích trái kẹt số lùi (không có left_move)

  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  /** Vòng for lặp các lệnh `lenh` (mảng) `n` lần (n là số hay tên biến). */
  function LAP(n, lenh) { return ['for i in range(' + n + '):'].concat(lenh.map(function (s) { return '    ' + s; })); }
  function lap(s, n) { var kq = []; for (var i = 0; i < n; i++) kq.push(s); return kq; }

  // thân các hàm chế (cách 1, cách người chơi thường chọn)
  var T_SPIN = ['tr_right()', 'tr_right()'];
  var T_SIDESTEP = ['tr_right()', 'move()', 'tr_left()'];
  var T_CLIMB = LAP('n', ['move()', 'tr_left()', 'move()', 'tr_right()']);
  var T_DESCEND = LAP('n', ['tr_left()', 'back()', 'tr_right()', 'back()']);
  var T_PICK_BEHIND = ['spin()', 'pick()', 'spin()'];
  function hSpin(than) { return H('spin', [], than || T_SPIN); }
  function hSidestep(than) { return H('sidestep', [], than || T_SIDESTEP); }
  function hClimb(than) { return H('climb', ['n'], than || T_CLIMB); }
  function hDescend(than) { return H('descend', ['n'], than || T_DESCEND); }
  function hPickBehind(than) { return H('pick_behind', [], than || T_PICK_BEHIND); }

  // hàm của màn
  var T_TO_HILL = ['forward(2)', 'tr_right()', 'forward(2)', 'climb(2)'];
  var T_BACK_HOME_TRONG = ['pass'];                                                          // thân ban đầu của back_home() ở 7: chưa làm gì (lõi hiểu pass), người chơi viết thay nó
  var T_BACK_HOME = ['descend(2)', 'back()', 'back()', 'tr_left()', 'back()', 'back()'];
  var T_FIXED_DRIVE_CU = ['left_move()', 'right_move()', 'wait()'];                          // thân ban đầu của fixed_drive() ở 8: move() cũ, chạy sai vì xích trái đấu ngược
  var T_FIXED_DRIVE = ['left_back()', 'right_move()', 'wait()'];
  var T_FIXED_TURN_CU = LAP(2, ['left_move()', 'wait()']);                                   // thân ban đầu của fixed_turn() ở 8: tr_right() cũ
  var T_FIXED_TURN = LAP(2, ['left_back()', 'wait()']);
  var T_TR_RIGHT_LUI = LAP(2, ['right_back()', 'wait()']);                                   // 9: tr_right() sửa, quay phải bằng xích phải lùi

  // chương trình chính khóa của từng màn (maMau.chinh)
  var C_1 = ['spin()'];
  var C_2 = ['sidestep()'];
  var C_4 = ['climb(3)'];
  var C_5 = ['descend(4)'];
  var C_7 = ['to_hill()', 'back_home()'];
  var C_8 = ['fixed_drive()', 'fixed_drive()', 'fixed_drive()', 'fixed_turn()', 'fixed_drive()', 'fixed_drive()'];
  // 3 (người chơi tự viết): ba lần "đi hai ô rồi né sang phải", rồi một ô tới cờ
  var L_3 = ['forward(2)', 'sidestep()', 'forward(2)', 'sidestep()', 'forward(2)', 'sidestep()', 'move()'];
  // 9 (người chơi tự viết): xích trái chỉ lùi được, nên quay lưng về phía muốn đi: quay đầu, lùi 3 ô sang phải, quay phải, lùi 3 ô xuống
  var L_9 = ['spin()', 'back()', 'back()', 'back()', 'tr_right()', 'back()', 'back()', 'back()'];
  // 10 (người chơi tự viết): nhặt vật sau lưng, đi 2 ô, né sang phải, đi 2 ô, leo 2 bậc, đặt vật xuống chỗ vật mờ
  var L_10 = ['pick_behind()', 'forward(2)', 'sidestep()', 'forward(2)', 'climb(2)', 'drop()'];

  /** Điền các trường chung của chương (không đụng tới trường màn đã khai). */
  function man(m) {
    var coTay = !!m.tay;
    m.chuong = 'che-xich';
    m.loaiRobot = 'xich';
    m.robot = { than: 'xich', tay: coTay ? 'kep' : null };
    delete m.tay;
    m.hamGoc = m.hamGoc || (coTay ? XICH_TAY : XICH);
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    m.cauTruc = ['for', 'if'];
    if (m.mucTieu === 'toi-co') delete m.mucTieu;                 // mặc định của lõi
    else m.mucTieu = 'bong-mo';
    return ManHoc.chuanHoa(m);
  }

  /* ------------------------------------------------------------------- sân */

  // 1: sân thoáng, xe ở giữa quay lên; xe mờ cùng ô quay xuống
  var SAN_1 = ['.....', '.....', '.....', '.....', '.....'];
  // 2: sân thoáng, xe ở (1,3), xe mờ ở (2,3), cùng hướng
  var SAN_2 = ['.....', '.....', '.....', '.....', '.....'];
  // 3: hành lang so le ba đoạn dài 3 ô; mỗi chỗ dịch sang phải là một sidestep. S bậc thang, < và v là băng chuyền (xích đứng vững, không bị đẩy).
  var SAN_3 = ['###F#', '##..#', '##v##', '#..##', '#<###', '..###', 'S####', '.####'];
  var BD_3 = { x: 0, y: 7, huong: 0 };
  // 4: cầu thang 3 bậc (hành lang lên chéo sang phải), mỗi bậc là một ô S; xe quay phải, xe mờ ở đỉnh cũng quay phải
  var SAN_4 = ['#####', '###S#', '##S.#', '#S.##', '..###'];
  var BD_4 = { x: 0, y: 4, huong: 1 };
  // 5: cầu thang 4 bậc; xe ở ĐỈNH quay phải, xe mờ ở chân cầu thang cũng quay phải
  var SAN_5 = ['######', '####S#', '###S.#', '##S.##', '#S.###', '..####'];
  var BD_5 = { x: 4, y: 1, huong: 1 };
  // 6: sân thoáng, xe (2,2) quay lên, vật ở (2,3) ngay sau lưng
  var SAN_6 = ['.....', '.....', '.....', '..o..', '.....'];
  var BD_6 = { x: 2, y: 2, huong: 0 };
  // 7: đường lên đồi: lên 2, rẽ phải, sang 2, leo 2 bậc; to_hill() dừng ở (4,1) quay phải
  var SAN_7 = ['######', '####S#', '###S.#', '....##', '.#####', '.#####'];
  var BD_7 = { x: 0, y: 5, huong: 0 };
  // 8: đi 3 ô sang phải, rẽ phải, đi 2 ô xuống
  var SAN_8 = ['#####', '....#', '###.#', '###.#', '#####'];
  var BD_8 = { x: 0, y: 1, huong: 1 };
  // 9: đi 3 ô sang phải rồi 3 ô xuống (xích trái chỉ lùi được)
  var SAN_9 = ['#####', '....#', '###.#', '###.#', '###.#', '#####'];
  var BD_9 = { x: 0, y: 1, huong: 1 };
  // 10: kho trên đồi: vật ở (3,8) ngay SAU lưng xe (3,7); lên 2, né sang phải, lên 2, leo 2 bậc chéo trái, đặt vật xuống ô trống (2,0) trước mũi xe ở (2,1) (vật mờ ở đó; màn bóng mờ không vẽ ô đích D)
  var SAN_10 = ['##.###', '##.S##', '###S.#', '####.#', '####^#', '###..#', '###>##', '###.##', '###o##'];
  var BD_10 = { x: 3, y: 7, huong: 0 };

  var DS = [
    /* ------------------------------------------------------------ hàng 1: làm quen */
    man({
      so: 1, ten: 'Quay đầu', hang: 'lam-quen', hamCuaEmCan: ['tr_right', 'tr_left'], taoHam: ['spin'],
      deBai: 'Xe xích quay chậm: mỗi lần quay 90° tốn hai nhịp. Chương trình chính chỉ gọi spin(). Em tự chế lệnh spin() để xe quay đầu tại chỗ, mặt hướng ngược lại như xe mờ.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi spin(). Mở Xưởng hàm, tạo spin() rồi bấm Chạy.',
      san: SAN_1,
      batDau: { x: 2, y: 2, huong: 0 },
      bongMo: { x: 2, y: 2, huong: 2 },
      chinhCoDinh: true,
      maMau: { chinh: C_1.slice() },
      sao: { o: 6, nhip: 4 },
      loiGiai: { chinh: C_1.slice(), hamCuaEmMoi: [hSpin()] },
      loiGiaiKhac: {
        moTa: 'Không dùng tr_right(): viết thẳng bốn nhịp quay bằng lệnh gốc',
        baiLam: { chinh: C_1.slice() },
        hamCuaEmMoi: [hSpin(['left_move()', 'wait()', 'left_move()', 'wait()', 'left_move()', 'wait()', 'left_move()', 'wait()'])]
      },
      congThucKhac: [
        { moTa: 'Quay trái hai lần bằng tr_left()', hamCuaEmMoi: [hSpin(['tr_left()', 'tr_left()'])] },
        { moTa: 'Một vòng for bốn nhịp: xích trái tiến, xích phải lùi, quay phải tại chỗ', hamCuaEmMoi: [hSpin(LAP(4, ['left_move()', 'right_back()', 'wait()']))] }
      ],
      loiSai: [
        { moTa: 'Gọi spin() mà chưa chế hàm', baiLam: { chinh: C_1.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Chỉ quay một lần: xe quay mặt sang phải, chưa quay đầu', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [hSpin(['tr_right()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quay phải rồi quay trái: hai nửa vòng khác lệnh nên quay dở mất, xe vẫn quay mặt như cũ', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [hSpin(['tr_right()', 'tr_left()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quay ba lần: xe quay mặt sang trái', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [hSpin(['tr_right()', 'tr_right()', 'tr_right()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Dùng turn_right() của xe hai bánh hai lần: mỗi lần chỉ nhích nửa vòng, hai lần cộng lại chỉ được 90°', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [hSpin(['turn_right()', 'turn_right()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Thiếu wait(): bốn lệnh dồn vào một nhịp, xe không quay', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [hSpin(['left_move()', 'left_move()', 'left_move()', 'left_move()'])], phaiCoMa: ['quen-wait', 'lech-bong-mo'] }
      ],
      goiY: ['Em đã chế tr_right(): xe xích cần hai nhịp để quay 90°, nên quay đầu là quay đủ hai lần như vậy.', 'Xe mờ nhìn xuống, xe thật đang nhìn lên: phải quay nửa vòng thật sự.']
    }),

    man({
      so: 2, ten: 'Né sang phải', hang: 'lam-quen', hamCuaEmCan: ['tr_right', 'tr_left', 'move'], taoHam: ['sidestep'],
      deBai: 'Xe xích đứng cạnh chỗ của xe mờ, nhưng cùng quay mặt lên. Chương trình chính chỉ gọi sidestep(): em tự chế lệnh này để xe né sang phải một ô mà vẫn quay mặt lên.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi sidestep(). Mở Xưởng hàm, tạo sidestep() rồi bấm Chạy.',
      san: SAN_2,
      batDau: { x: 1, y: 3, huong: 0 },
      bongMo: { x: 2, y: 3, huong: 0 },
      chinhCoDinh: true,
      maMau: { chinh: C_2.slice() },
      sao: { o: 13, nhip: 5 },
      loiGiai: { chinh: C_2.slice(), hamCuaEmMoi: [hSidestep()] },
      loiGiaiKhac: {
        moTa: 'Đi một ô bằng forward(1) thay cho move()',
        baiLam: { chinh: C_2.slice() },
        hamCuaEmMoi: [hSidestep(['tr_right()', 'forward(1)', 'tr_left()'])]
      },
      congThucKhac: [
        { moTa: 'Quay trái, lùi một ô, quay phải: lùi cũng đưa xe sang phải', hamCuaEmMoi: [hSidestep(['tr_left()', 'back()', 'tr_right()'])] },
        { moTa: 'Quay phải bằng ba lần quay trái (chậm hơn bốn nhịp)', hamCuaEmMoi: [hSidestep(['tr_left()', 'tr_left()', 'tr_left()', 'move()', 'tr_left()'])] }
      ],
      loiSai: [
        { moTa: 'Gọi sidestep() mà chưa chế hàm', baiLam: { chinh: C_2.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Né xong không quay về: xe quay mặt sang phải', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [hSidestep(['tr_right()', 'move()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Né sang trái thay vì sang phải: xe nằm bên trái chỗ cũ', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [hSidestep(['tr_left()', 'move()', 'tr_right()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Dùng turn_right() và turn_left() của xe hai bánh: mỗi lần chỉ nhích nửa vòng, xe quay dở rồi đi sai', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [hSidestep(['turn_right()', 'move()', 'turn_left()'])], phaiCoMa: ['xich-quay-do', 'lech-bong-mo'] },
        { moTa: 'Đi tiếp hai ô thay vì một: xe nằm quá chỗ xe mờ', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [hSidestep(['tr_right()', 'move()', 'move()', 'tr_left()'])], phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Quay mặt sang phải, đi một ô, rồi quay mặt lại.', 'Xe xích quay 90° mất hai nhịp: dùng tr_right() và tr_left() đã chế.']
    }),

    man({
      so: 3, ten: 'Đường so le', hang: 'lam-quen', mucTieu: 'toi-co',
      hamCuaEmCan: ['move', 'forward', 'sidestep'],
      deBai: 'Hành lang dịch dần sang phải ba lần. Xích bám chắc nên băng chuyền không đẩy được xe, còn bậc thang S xe leo như đi trên sàn. Dùng các lệnh em đã chế để đưa xe tới cờ trong 10 ô.',
      veMaMau: 'Chương trình chính còn trống. Mỗi chỗ dịch sang phải là một lần né: hãy tìm lệnh em đã chế cho việc đó.',
      san: SAN_3,
      batDau: BD_3,
      maMau: { chinh: [] },
      sao: { o: 21, nhip: 22 },
      loiGiai: { chinh: L_3.slice() },
      loiGiaiKhac: {
        moTa: 'Thêm một dòng chú thích',
        baiLam: { chinh: nhieu(['# so le ba lần'], L_3) }
      },
      congThucKhac: [
        { moTa: 'Gộp bằng vòng for: ba lần (đi hai ô, né sang phải) rồi một ô', baiLam: { chinh: nhieu(LAP(3, ['forward(2)', 'sidestep()']), ['move()']) } },
        { moTa: 'Gọi move() hai lần thay cho forward(2)', baiLam: { chinh: ['move()', 'move()', 'sidestep()', 'move()', 'move()', 'sidestep()', 'move()', 'move()', 'sidestep()', 'move()'] } }
      ],
      loiSai: [
        { moTa: 'Không né: đi thẳng, xe đâm tường ở chỗ dịch đầu tiên', baiLam: { chinh: ['forward(7)'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Thiếu một lần né: xe đâm tường ở chỗ dịch cuối', baiLam: { chinh: ['forward(2)', 'sidestep()', 'forward(2)', 'sidestep()', 'forward(3)'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Dùng turn_right() và turn_left() của xe hai bánh để né: xe xích quay dở rồi đâm tường', baiLam: { chinh: ['forward(2)', 'turn_right()', 'move()', 'turn_left()', 'forward(2)'] }, phaiCoMa: ['xich-quay-do', 'dam-tuong', 'chua-toi-co'] },
        { moTa: 'Không dùng sidestep(), viết thẳng quay phải, đi, quay trái ở cả ba chỗ: quá 10 ô', baiLam: { chinh: ['forward(2)', 'tr_right()', 'move()', 'tr_left()', 'forward(2)', 'tr_right()', 'move()', 'tr_left()', 'forward(2)', 'tr_right()', 'move()', 'tr_left()', 'move()'] }, phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['Mỗi chỗ hành lang dịch sang phải một ô thì xe cần né sang phải một ô.', 'Ba đoạn giống nhau: đi hai ô rồi né. Vòng for gọn hơn viết ba lần.']
    }),

    /* ------------------------------------------------------------ hàng 2: luyện */
    man({
      so: 4, ten: 'Leo cầu thang', hang: 'luyen', hamCuaEmCan: ['move', 'tr_left', 'tr_right'], taoHam: ['climb'],
      deBai: 'Cầu thang dốc chéo lên phải, mỗi bậc là một ô S. Chương trình chính chỉ gọi climb(3). Em tự chế lệnh climb(n) để xe leo n bậc: mỗi bậc đi một ô, rẽ trái, đi một ô rồi rẽ phải.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi climb(3). Mở Xưởng hàm, tạo climb có đối số n rồi bấm Chạy.',
      san: SAN_4,
      batDau: BD_4,
      bongMo: { x: 3, y: 1, huong: 1 },
      chinhCoDinh: true,
      maMau: { chinh: C_4.slice() },
      sao: { o: 15, nhip: 18 },
      loiGiai: { chinh: C_4.slice(), hamCuaEmMoi: [hClimb()] },
      loiGiaiKhac: {
        moTa: 'Đi một ô bằng forward(1) thay cho move()',
        baiLam: { chinh: C_4.slice() },
        hamCuaEmMoi: [hClimb(LAP('n', ['forward(1)', 'tr_left()', 'forward(1)', 'tr_right()']))]
      },
      congThucKhac: [
        { moTa: 'Quay trái tại chỗ bằng lệnh gốc: xích phải tiến, xích trái lùi', hamCuaEmMoi: [hClimb(LAP('n', ['move()', 'right_move()', 'left_back()', 'wait()', 'right_move()', 'left_back()', 'wait()', 'move()', 'tr_right()']))] },
        { moTa: 'Bậc đầu viết riêng, rồi lặp n - 1 bậc còn lại', hamCuaEmMoi: [hClimb(nhieu(['move()', 'tr_left()', 'move()', 'tr_right()'], LAP('n - 1', ['move()', 'tr_left()', 'move()', 'tr_right()'])))] }
      ],
      loiSai: [
        { moTa: 'Gọi climb(3) mà chưa chế hàm', baiLam: { chinh: C_4.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Hàm không dùng đối số n mà lặp cố định hai lần: xe dừng ở bậc thứ hai', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [hClimb(LAP(2, ['move()', 'tr_left()', 'move()', 'tr_right()']))], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Thân vòng lặp bắt đầu bằng rẽ trái: xe đâm tường ngay ô đầu tiên', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [hClimb(LAP('n', ['tr_left()', 'move()', 'tr_right()', 'move()']))], phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Mỗi bậc quên rẽ phải cuối cùng: xe quay mặt lên tường', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [hClimb(LAP('n', ['move()', 'tr_left()', 'move()']))], phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Dùng turn_left() và turn_right() của xe hai bánh: xe xích quay dở rồi đâm tường', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [hClimb(LAP('n', ['move()', 'turn_left()', 'move()', 'turn_right()']))], phaiCoMa: ['xich-quay-do', 'dam-tuong', 'lech-bong-mo'] }
      ],
      goiY: ['Một bậc gồm bốn việc: đi một ô, rẽ trái, đi một ô, rẽ phải. Cả cầu thang là n bậc như thế.', 'Vòng for chạy n lần: số lần lấy từ đối số n của hàm.']
    }),

    man({
      so: 5, ten: 'Lùi xuống bậc', hang: 'luyen', hamCuaEmCan: ['back', 'tr_left', 'tr_right'], taoHam: ['descend'],
      deBai: 'Xe đứng ở đỉnh cầu thang bốn bậc, xe mờ đứng ở chân cầu thang, cùng quay mặt sang phải. Chương trình chính chỉ gọi descend(4). Em tự chế lệnh descend(n) để xe xuống n bậc mà không phải quay đầu.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi descend(4). Mở Xưởng hàm, tạo descend có đối số n rồi bấm Chạy.',
      san: SAN_5,
      batDau: BD_5,
      bongMo: { x: 0, y: 5, huong: 1 },
      chinhCoDinh: true,
      maMau: { chinh: C_5.slice() },
      sao: { o: 15, nhip: 24 },
      loiGiai: { chinh: C_5.slice(), hamCuaEmMoi: [hDescend()] },
      loiGiaiKhac: {
        moTa: 'Viết thẳng hai bánh lùi thay cho back()',
        baiLam: { chinh: C_5.slice() },
        hamCuaEmMoi: [hDescend(LAP('n', ['tr_left()', 'left_back()', 'right_back()', 'wait()', 'tr_right()', 'left_back()', 'right_back()', 'wait()']))]
      },
      congThucKhac: [
        { moTa: 'Quay đầu, đi xuống bằng cách tiến (rẽ trái, tiến, rẽ phải, tiến), rồi quay đầu lại: chậm hơn tám nhịp', hamCuaEmMoi: [hDescend(nhieu(['spin()'], LAP('n', ['tr_left()', 'move()', 'tr_right()', 'move()']), ['spin()']))] },
        { moTa: 'Bậc đầu viết riêng, rồi lặp n - 1 bậc còn lại', hamCuaEmMoi: [hDescend(nhieu(['tr_left()', 'back()', 'tr_right()', 'back()'], LAP('n - 1', ['tr_left()', 'back()', 'tr_right()', 'back()'])))] }
      ],
      loiSai: [
        { moTa: 'Gọi descend(4) mà chưa chế hàm', baiLam: { chinh: C_5.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Dùng move() thay cho back(): xe đâm tường', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [hDescend(LAP('n', ['tr_left()', 'move()', 'tr_right()', 'move()']))], phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Lặp cố định ba lần: xe dừng ở bậc thứ ba', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [hDescend(LAP(3, ['tr_left()', 'back()', 'tr_right()', 'back()']))], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đổi chỗ hai lần quay (phải rồi trái): xe lùi vào tường', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [hDescend(LAP('n', ['tr_right()', 'back()', 'tr_left()', 'back()']))], phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Quay đầu rồi đi xuống như lên: xe tới chân cầu thang nhưng quay mặt sang trái', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [hDescend(LAP('n', ['tr_right()', 'move()', 'tr_right()', 'move()']))], phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Lên là đi, rẽ trái, đi, rẽ phải. Xuống thì làm ngược lại từng việc: rẽ trái, lùi, rẽ phải, lùi.', 'Lùi xuống cầu thang thì xe vẫn quay mặt về phía đỉnh, nên không cần quay đầu.']
    }),

    man({
      so: 6, ten: 'Nhặt sau lưng', hang: 'luyen', tay: true, hamCuaEmCan: ['spin', 'pick'], taoHam: ['pick_behind'], nhipTheoLoiGiai: true,
      deBai: 'Một vật nằm ngay sau lưng xe. Chương trình chính chỉ gọi pick_behind(). Em tự chế lệnh này để xe nhặt vật rồi quay về như cũ, tay vẫn đang cầm vật như xe mờ.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi pick_behind(). Mở Xưởng hàm, tạo pick_behind() rồi bấm Chạy.',
      san: SAN_6,
      batDau: BD_6,
      bongMo: { x: 2, y: 2, huong: 0, cam: true },
      chinhCoDinh: true,
      maMau: { chinh: ['pick_behind()'] },
      sao: { o: 14, nhip: 10 },
      loiGiai: { chinh: ['pick_behind()'], hamCuaEmMoi: [hPickBehind()] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: ['pick_behind()'] },
        hamCuaEmMoi: [hPickBehind(nhieu(['# nhặt vật sau lưng'], T_PICK_BEHIND))]
      },
      congThucKhac: [
        { moTa: 'Quay trái hai lần, nhặt, rồi quay trái hai lần nữa', hamCuaEmMoi: [hPickBehind(['tr_left()', 'tr_left()', 'pick()', 'tr_left()', 'tr_left()'])] },
        { moTa: 'Quay đầu bằng spin() rồi nhặt bằng lệnh tay gốc', hamCuaEmMoi: [hPickBehind(['spin()', 'arm_down()', 'grab()', 'wait()', 'arm_up()', 'wait()', 'spin()'])] }
      ],
      loiSai: [
        { moTa: 'Gọi pick_behind() mà chưa chế hàm', baiLam: { chinh: ['pick_behind()'] }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Nhặt xong không quay về: xe quay mặt xuống', baiLam: { chinh: ['pick_behind()'] }, hamCuaEmMoi: [hPickBehind(['spin()', 'pick()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Nhặt mà chưa quay đầu: không có vật trước mặt', baiLam: { chinh: ['pick_behind()'] }, hamCuaEmMoi: [hPickBehind(['pick()', 'spin()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quay đầu bằng turn_right() hai lần của xe hai bánh: xe mới quay được 90°', baiLam: { chinh: ['pick_behind()'] }, hamCuaEmMoi: [hPickBehind(['turn_right()', 'turn_right()', 'pick()', 'turn_right()', 'turn_right()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quay đầu khi tay còn hạ: tay vướng sàn nên xe không quay', baiLam: { chinh: ['pick_behind()'] }, hamCuaEmMoi: [hPickBehind(['spin()', 'arm_down()', 'grab()', 'wait()', 'spin()'])], phaiCoMa: ['tay-vuong', 'lech-bong-mo'] }
      ],
      goiY: ['Muốn nhặt vật thì vật phải nằm trước mũi xe: quay đầu trước, nhặt, rồi quay đầu trở lại.', 'Em đã chế spin() và pick(): ghép chúng lại.']
    }),

    /* ------------------------------------------------------------ hàng 3: biến thể */
    man({
      so: 7, ten: 'Đường về', hang: 'bien-the', hamCuaEmCan: ['descend', 'back', 'tr_left', 'climb', 'forward', 'tr_right'],
      deBai: 'Hàm to_hill() của màn đưa xe lên đồi qua cầu thang. Viết thân hàm back_home() của màn để đưa xe về đúng chỗ và hướng xuất phát, như xe mờ. Chương trình chỉ có 10 ô.',
      veMaMau: 'Chương trình chính bị khóa: to_hill() rồi back_home(). Hàm to_hill() cũng bị khóa, em chỉ xem được thân hàm. Thân hàm back_home() đang chỉ có dòng pass, nghĩa là chưa làm gì: em viết lệnh thay cho nó. Điểm ◆ là chỗ to_hill() dừng.',
      san: SAN_7,
      batDau: BD_7,
      bongMo: { x: 0, y: 5, huong: 0, diQua: [{ x: 4, y: 1 }] },       // ◆ ở chỗ to_hill() dừng: chương trình rỗng hay to_hill() hỏng không qua ◆, không thể "thắng" chỉ vì xe còn nguyên chỗ cũ
      chinhCoDinh: true, khoaHamMan: ['to_hill'],
      maMau: { chinh: C_7.slice(), hamCuaMan: [H('to_hill', [], T_TO_HILL), H('back_home', [], T_BACK_HOME_TRONG)] },
      sao: { o: 36, nhip: 36 },
      loiGiai: { chinh: C_7.slice(), hamCuaMan: [H('to_hill', [], T_TO_HILL), H('back_home', [], T_BACK_HOME)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách viết, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_7.slice(), hamCuaMan: [H('to_hill', [], T_TO_HILL), H('back_home', [], nhieu(['# làm ngược lại to_hill()'], T_BACK_HOME))] }
      },
      congThucKhac: [
        { moTa: 'Lùi bằng vòng for thay cho gọi back() từng lần', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('to_hill', [], T_TO_HILL), H('back_home', [], nhieu(['descend(2)'], LAP(2, ['back()']), ['tr_left()'], LAP(2, ['back()'])))] } },
        { moTa: 'Xuống bậc bằng lệnh quay trái rồi lùi, viết thẳng hai bậc', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('to_hill', [], T_TO_HILL), H('back_home', [], ['descend(1)', 'descend(1)', 'back()', 'back()', 'tr_left()', 'back()', 'back()'])] } }
      ],
      loiSai: [
        { moTa: 'Để nguyên thân pass: xe còn đứng trên đồi', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('to_hill', [], T_TO_HILL), H('back_home', [], T_BACK_HOME_TRONG)] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Viết theo thứ tự xuôi (không đảo): xe lùi vào tường ngay đầu', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('to_hill', [], T_TO_HILL), H('back_home', [], ['back()', 'back()', 'tr_left()', 'back()', 'back()', 'descend(2)'])] }, phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Không đổi tr_right() thành tr_left(): xe quay sai bên rồi lùi vào tường', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('to_hill', [], T_TO_HILL), H('back_home', [], ['descend(2)', 'back()', 'back()', 'tr_right()', 'back()', 'back()'])] }, phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Dùng move() thay cho back(): xe đi tiếp lên đồi thay vì về', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('to_hill', [], T_TO_HILL), H('back_home', [], ['descend(2)', 'move()', 'move()', 'tr_left()', 'move()', 'move()'])] }, phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Xóa mất hàm back_home() của màn: lệnh gọi nó không còn hàm nào', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('to_hill', [], T_TO_HILL)] }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Làm ngược lại to_hill() từng bước, theo thứ tự ngược.', 'Mỗi lệnh có một lệnh ngược: tiến thì lùi, rẽ phải thì rẽ trái, leo bậc thì xuống bậc.']
    }),

    man({
      so: 8, ten: 'Xích trái đấu ngược', hang: 'bien-the',
      daoChieu: ['trai'], canhBao: 'Dây xích trái đấu ngược',
      deBai: 'Dây của xích trái bị đấu ngược nên các hàm fixed_drive() và fixed_turn() của màn chạy sai: lệnh left_move() làm xích trái quay lùi, left_back() làm nó quay tới. Sửa cả hai hàm để xe đi hết đường như xe mờ.',
      veMaMau: 'Chương trình chính bị khóa: đi ba ô, rẽ phải, đi hai ô. Hàm fixed_drive() đang giống move() cũ, fixed_turn() giống tr_right() cũ. Thử chúng trong sân thử của Xưởng hàm để thấy xe làm gì.',
      san: SAN_8,
      batDau: BD_8,
      bongMo: { x: 3, y: 3, huong: 2 },
      chinhCoDinh: true,
      maMau: { chinh: C_8.slice(), hamCuaMan: [H('fixed_drive', [], T_FIXED_DRIVE_CU), H('fixed_turn', [], T_FIXED_TURN_CU)] },
      sao: { o: 12, nhip: 7 },
      loiGiai: { chinh: C_8.slice(), hamCuaMan: [H('fixed_drive', [], T_FIXED_DRIVE), H('fixed_turn', [], T_FIXED_TURN)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách sửa, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_8.slice(), hamCuaMan: [H('fixed_drive', [], nhieu(['# xích trái đấu ngược'], T_FIXED_DRIVE)), H('fixed_turn', [], T_FIXED_TURN)] }
      },
      congThucKhac: [
        { moTa: 'Quay phải bằng xích phải lùi (xích phải không đấu ngược)', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('fixed_drive', [], T_FIXED_DRIVE), H('fixed_turn', [], LAP(2, ['right_back()', 'wait()']))] } },
        { moTa: 'Quay phải tại chỗ: xích trái tiến thật, xích phải lùi', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('fixed_drive', [], ['right_move()', 'left_back()', 'wait()']), H('fixed_turn', [], LAP(2, ['left_back()', 'right_back()', 'wait()']))] } }
      ],
      loiSai: [
        { moTa: 'Để nguyên hai hàm của màn: xích trái đấu ngược nên xe quay tại chỗ chứ không đi', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('fixed_drive', [], T_FIXED_DRIVE_CU), H('fixed_turn', [], T_FIXED_TURN_CU)] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Chỉ sửa fixed_drive(): xe đi đúng nhưng chỗ rẽ phải lại quay sang trái', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('fixed_drive', [], T_FIXED_DRIVE), H('fixed_turn', [], T_FIXED_TURN_CU)] }, phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Chỉ sửa fixed_turn(): xe quay đúng nhưng đi thì quay tại chỗ', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('fixed_drive', [], T_FIXED_DRIVE_CU), H('fixed_turn', [], T_FIXED_TURN)] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đổi cả xích phải thành lùi: hai xích quay ngược chiều nên xe quay tại chỗ chứ không đi tới', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('fixed_drive', [], ['left_back()', 'right_back()', 'wait()']), H('fixed_turn', [], T_FIXED_TURN)] }, phaiCoMa: ['xich-quay-do', 'lech-bong-mo'] },
        { moTa: 'Xóa mất hàm fixed_turn() của màn: lệnh gọi nó không còn hàm nào', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('fixed_drive', [], T_FIXED_DRIVE)] }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Thử gọi left_move() trong sân thử: xích trái quay tới hay lùi?', 'Muốn xích trái quay tới thật thì phải gọi left_back(), và ngược lại.']
    }),

    man({
      so: 9, ten: 'Xích trái chỉ lùi', hang: 'bien-the', hamGoc: XICH_HONG, phanCung: XICH_HONG, canhBao: 'Xích trái hỏng số tiến',
      hamCuaEmCan: ['spin', 'back', 'tr_right', 'tr_left'],
      deBai: 'Xích trái hỏng số tiến, chỉ còn lùi được, nên xe chỉ đi được khi quay lưng về phía muốn đi. Sửa tr_right() của em để không dùng xích trái, rồi tự viết chương trình đưa xe tới chỗ xe mờ.',
      veMaMau: 'Chương trình chính còn trống. Khay chỉ còn bốn lệnh bánh vì xích trái hỏng: tr_right() hiện có left_move() nên chạy không được, hãy mở Xưởng hàm sửa nó.',
      san: SAN_9,
      batDau: BD_9,
      bongMo: { x: 3, y: 4, huong: 0 },
      maMau: { chinh: [] },
      sao: { o: 16, nhip: 12 },
      loiGiai: { chinh: L_9.slice(), hamCuaEmMoi: [H('tr_right', [], T_TR_RIGHT_LUI)] },
      loiGiaiKhac: {
        moTa: 'Thêm một dòng chú thích trong chương trình',
        baiLam: { chinh: nhieu(['# xe chỉ lùi được'], L_9) },
        hamCuaEmMoi: [H('tr_right', [], T_TR_RIGHT_LUI)]
      },
      congThucKhac: [
        { moTa: 'Không sửa tr_right(): quay phải bằng ba lần tr_left() (chậm hơn bốn nhịp, còn 2 sao)', baiLam: { chinh: nhieu(['tr_left()', 'tr_left()'], LAP(3, ['back()']), ['tr_left()', 'tr_left()', 'tr_left()'], LAP(3, ['back()'])) } },
        { moTa: 'Sửa tr_right() bằng hai lần right_back() viết thẳng', baiLam: { chinh: L_9.slice() }, hamCuaEmMoi: [H('tr_right', [], ['right_back()', 'wait()', 'right_back()', 'wait()'])] }
      ],
      loiSai: [
        { moTa: 'Gọi move(): bánh trái hỏng số tiến nên không chạy được', baiLam: { chinh: ['move()'] }, phaiCoMa: ['lenh-goc-hong'] },
        { moTa: 'Không sửa tr_right(): trong hàm có left_move() của xích trái đã hỏng', baiLam: { chinh: L_9.slice() }, phaiCoMa: ['lenh-goc-hong'] },
        { moTa: 'Quên quay đầu: lùi lúc đang quay mặt sang phải thì xe đi ngược lại, đâm tường', baiLam: { chinh: ['back()', 'back()', 'back()', 'tr_right()', 'back()', 'back()', 'back()'] }, hamCuaEmMoi: [H('tr_right', [], T_TR_RIGHT_LUI)], phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Sửa tr_right() thành xích phải tiến: xe quay sang trái chứ không phải sang phải', baiLam: { chinh: L_9.slice() }, hamCuaEmMoi: [H('tr_right', [], LAP(2, ['right_move()', 'wait()']))], phaiCoMa: ['dam-tuong', 'lech-bong-mo'] }
      ],
      goiY: ['Quay phải còn cách khác: xích phải quay lùi cũng làm xe quay phải. Sửa tr_right() theo cách đó.', 'Xe chỉ lùi được thì phải quay lưng về hướng muốn đi: đi sang phải thì quay mặt sang trái trước.']
    }),

    /* ------------------------------------------------------------ trùm */
    man({
      so: 10, ten: 'Kho trên đồi', hang: 'trum', tay: true, hamCuaEmCan: ['pick_behind', 'forward', 'sidestep', 'climb', 'drop'],
      nhipTheoLoiGiai: true, gioiHanHam: 5,
      huyHieu: { ma: 'che-xich', ten: 'Huy hiệu Chế lệnh xích' },
      deBai: 'Một vật nằm sau lưng xe, còn vật mờ nằm trên đồi. Nhặt vật, đi lên qua chỗ dịch sang phải và cầu thang chéo, rồi đặt vật xuống chỗ vật mờ ngay trước mũi xe. Chương trình chính chỉ được gọi 5 hàm của em khác nhau.',
      veMaMau: 'Chương trình chính còn trống. Xe mờ đứng ngay trước vật mờ trên đồi. Chạm ảnh xe mờ để xem xe sẽ đứng ở đâu.',
      san: SAN_10,
      batDau: BD_10,
      bongMo: { x: 2, y: 1, huong: 0, vat: [{ x: 2, y: 0 }] },
      maMau: { chinh: [] },
      sao: { o: 40, nhip: 33 },
      loiGiai: { chinh: L_10.slice() },
      loiGiaiKhac: {
        moTa: 'Đi hai ô bằng hai lần forward(1)',
        baiLam: { chinh: ['pick_behind()', 'forward(1)', 'forward(1)', 'sidestep()', 'forward(2)', 'climb(2)', 'drop()'] }
      },
      congThucKhac: [
        { moTa: 'Hai bậc leo bằng vòng for gọi climb(1) hai lần', baiLam: { chinh: ['pick_behind()', 'forward(2)', 'sidestep()', 'forward(2)', 'for i in range(2):', '    climb(1)', 'drop()'] } },
        { moTa: 'Hai đoạn đi thẳng gọi forward(1) hai lần mỗi đoạn', baiLam: { chinh: ['pick_behind()', 'forward(1)', 'forward(1)', 'sidestep()', 'forward(1)', 'forward(1)', 'climb(2)', 'drop()'] } }
      ],
      loiSai: [
        { moTa: 'Không nhặt vật: xe lên tới chỗ vật mờ tay không', baiLam: { chinh: ['forward(2)', 'sidestep()', 'forward(2)', 'climb(2)', 'drop()'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quên drop(): vật vẫn nằm trên tay', baiLam: { chinh: ['pick_behind()', 'forward(2)', 'sidestep()', 'forward(2)', 'climb(2)'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quên né sang phải: xe đâm tường', baiLam: { chinh: ['pick_behind()', 'forward(4)', 'climb(2)', 'drop()'] }, phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Leo ba bậc thay vì hai: xe đâm tường', baiLam: { chinh: ['pick_behind()', 'forward(2)', 'sidestep()', 'forward(2)', 'climb(3)', 'drop()'] }, phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Gọi 6 hàm khác nhau (spin, pick, forward, sidestep, climb, drop): vượt giới hạn 5 hàm', baiLam: { chinh: ['spin()', 'pick()', 'spin()', 'forward(2)', 'sidestep()', 'forward(2)', 'climb(2)', 'drop()'] }, phaiCoMa: ['qua-gioi-han-ham'] }
      ],
      goiY: ['Vật nằm sau lưng thì không cần tự quay đầu: em đã chế một lệnh nhặt sau lưng rồi.', 'Đếm đoạn đường: đi thẳng, một lần dịch sang phải, rồi cầu thang chéo; cuối cùng vật rơi xuống ô trước mũi xe.']
    })
  ];

  ManHoc.them(DS);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();
