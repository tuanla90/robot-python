/* ============================================================================
   man-che-omni.js — "Đường học": CHƯƠNG `che-omni` · CHẾ LỆNH OMNI (10 màn). Kế hoạch "Chế lệnh" (KE-HOACH-CHE-LENH.md, mục 5c.2, 15/10): chương chế lệnh đi sau chương `omni`.
   Robot là XE BÁNH OMNI: robot { than: 'omni', tay: null | 'kep' } (loaiRobot 'omni'). Có mọi lệnh bánh của xe hai bánh (left_move / right_move / left_back / right_back, wait) và hai lệnh trượt ngang
   slide_left() / slide_right() (một ô sang trái / phải SO VỚI HƯỚNG MẶT, không đổi hướng). Luật omni (san-hoc.js, phần 'omni'): KHÔNG ĐI CHÉO (nhịp có trượt thì lệnh bánh bị bỏ), băng chuyền đẩy omni
   mạnh hơn (đứng trên băng một nhịp là bị đẩy một ô; đi xuôi băng thì hai ô một nhịp), tay hạ thì xe không đi cũng không trượt. Mọi lệnh chỉ RA LỆNH, wait() cho nhịp trôi.
   Luật thiết kế như che-xe / che-tay / che-nam-cham: lệnh gốc chỉ đổi MỘT trạng thái; động tác hay (đi chéo, vòng qua tường, qua băng, dời vật sang bên…) là thứ NGƯỜI CHƠI TỰ CHẾ.
   Mỗi lệnh chế được ít nhất hai cách và cả hai đều thắng: `congThucKhac: [{ moTa, hamCuaEmMoi }]` (hay `baiLam` cho hàm của màn). Khác chương nhện / nam châm: omni không có cảm biến nên không dùng if / while (cauTruc ['for']).

   Mục tiêu `bong-mo` (san-hoc.js, phần BÓNG MỜ): xe phải đứng đúng tư thế "xe mờ" khi chương trình CHẠY XONG, vật mờ cho biết mỗi vật phải nằm ở ô nào, ◆ là chỗ xe phải ghé qua; chưa chế hàm thì không thắng.
   `chinhCoDinh: true` — chương trình chính khóa (bản mẫu `maMau.chinh`), người chơi chỉ sửa / tạo hàm trong Xưởng. 3 (tới cờ) và 10 không khóa: người chơi tự viết chương trình chính.

   KHAY: cả chương mở đủ bánh (có bánh lùi) và hai lệnh trượt; 6 và 10 thêm bốn lệnh tay kẹp. Màn 7 là màn HỎNG: khay = phần cứng, thiếu slide_right.
   Hàm của em có sẵn ở chương này: toàn bộ chương trước (move, u_turn một nhịp, back, dodge_right, pick, drop, forward(n)…), cùng slide_r(n) và slide_l(n) của chương omni.
       slide_r(n) = for i in range(n): slide_right(), wait()      slide_l(n) = for i in range(n): slide_left(), wait()

   Hàm của em MỚI (tên cốt truyện, khóa trong kho):
     che-omni.1 diag()      = slide_right(), wait(), move()                          một bước chéo lên phía phải, giữ hướng (2 nhịp: omni không đi chéo trong một nhịp)
     che-omni.2 zig(n)      = for i in range(n): diag()                              n bước chéo liền nhau (2n nhịp)
     che-omni.4 bypass()    = slide_r(1), forward(2), slide_l(1)                     vòng qua một khối tường chắn ngay trước mặt, đứng ngay sau nó (4 nhịp)
     che-omni.5 cross_belt() = slide_r(3), forward(2)                                 qua hai băng chuyền chạy xuống: băng kéo xe xuống hai ô nên tiến hai ô để về cùng hàng (5 nhịp)
     che-omni.6 shift()     = pick(), slide_r(1), drop(), slide_l(1)                 dời vật trước mặt sang cột bên phải của nó, xe về lại chỗ cũ (6 nhịp theo cách viết chuẩn)
   HÀM CỦA MÀN (hàm chỉ đúng cho MỘT màn, không vào kho, không có trong Sổ lệnh; `maMau.hamCuaMan`):
     che-omni.7 hop_right()        thân ban đầu = slide_right(), wait() (chạy sai: bánh trượt phải hỏng, phanCung thiếu slide_right); lời giải dodge_right() (turn_right, move, turn_left), hay u_turn, slide_left, u_turn (3 nhịp)
     che-omni.8 north(n) / east(n) thân ban đầu viết cho xe quay mặt LÊN (north = tiến, east = trượt phải) nhưng xe quay mặt sang TRÁI; lời giải north = slide_r(n), east = back n lần
     che-omni.9 step_out() (khóa) / step_back() thân ban đầu `pass`; lời giải slide_r(2), back(), back(), rồi hai lần (back, slide_l)   đi NGƯỢC lại step_out() = zig(2), forward(2), slide_l(2): trượt phải ↔ trái, tiến ↔ lùi, thứ tự ngược

   Sao: sao.nhip = số nhịp của lời giải cách 1 chạy thật (nhipTheoLoiGiai ở 6, 7, 10: pick() / drop() mỗi cái 2 nhịp nhưng nâng tay gộp được vào nhịp trượt kế tiếp, và 7 sửa hàm trong chương trình chính cố định,
   nên đường ngắn nhất BFS — do-duong-che-omni.mjs — ngắn hơn hay bằng); sao.o = ô của lời giải cách 1 (đếm cả thân các hàm đã dùng, kể cả hàm của em lồng bên trong).
   Hành lang 3 và 7 (bậc thang) và 9 (đúng một đường) không có đường tắt: không hai ô nào của đường nằm cạnh nhau trừ ô liền kề, nên đảo thứ tự lệnh ngược là cách nhanh nhất ở 9. Hướng: 0 lên, 1 phải, 2 xuống, 3 trái. (x, y) với y = 0 ở hàng trên.
   Nối tiếp man-omni.js vào cùng window.ManHoc. Thứ tự chương: thu-tu-chuong.js.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-omni.js') : window.ManHoc;

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back'];
  var TAY = ['arm_down', 'arm_up', 'grab', 'release'];
  var KHAY = BANH.concat(['slide_left', 'slide_right', 'wait']);                // khay cả chương
  var KHAY_TAY = KHAY.concat(TAY);                                              // 6 và 10: có tay kẹp
  var KHAY_HONG = BANH.concat(['slide_left', 'wait']);                          // 7: bánh trượt phải hỏng (không có slide_right)

  function H(ten, than, thamSo) { return { ten: ten, thamSo: (thamSo || []).slice(), than: than.slice() }; }
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  function lap(n, lenh) { return ['for i in range(' + n + '):'].concat((Array.isArray(lenh) ? lenh : [lenh]).map(function (s) { return '    ' + s; })); }

  // thân các hàm chế (cách 1, cách người chơi thường chọn)
  var T_DIAG = ['slide_right()', 'wait()', 'move()'];
  var T_ZIG = lap('n', 'diag()');
  var T_BYPASS = ['slide_r(1)', 'forward(2)', 'slide_l(1)'];
  var T_CROSS = ['slide_r(3)', 'forward(2)'];
  var T_SHIFT = ['pick()', 'slide_r(1)', 'drop()', 'slide_l(1)'];
  // 7: hop_right() của màn: thân ban đầu (hỏng) và bản sửa
  var T_HOP_CU = ['slide_right()', 'wait()'];
  var T_HOP = ['dodge_right()'];
  // 8: north(n) / east(n) của màn: thân ban đầu (viết cho xe quay mặt LÊN) và bản sửa (xe quay mặt sang TRÁI: bên phải xe là phía trên màn hình, sau lưng xe là phía phải màn hình)
  var T_NORTH_CU = lap('n', 'move()');
  var T_EAST_CU = lap('n', ['slide_right()', 'wait()']);
  var T_NORTH = ['slide_r(n)'];
  var T_EAST = lap('n', 'back()');
  // 9: step_out() của màn (khóa) và step_back() (thân ban đầu: pass; lời giải đi ngược: trượt phải hai ô, lùi hai ô, rồi hai lần lùi + trượt trái)
  var T_STEP_OUT = ['zig(2)', 'forward(2)', 'slide_l(2)'];
  var T_STEP_BACK_TRONG = ['pass'];
  var T_STEP_BACK = ['slide_r(2)', 'back()', 'back()'].concat(lap(2, ['back()', 'slide_l(1)']));

  // chương trình chính khóa của từng màn (maMau.chinh)
  var C_1 = ['diag()'];
  var C_2 = ['zig(3)'];
  var C_4 = ['bypass()'];
  var C_5 = ['cross_belt()'];
  var C_6 = ['shift()'];
  var C_7 = ['hop_right()', 'move()', 'hop_right()', 'move()', 'hop_right()', 'move()'];
  var C_8 = ['north(2)', 'east(3)', 'north(1)'];
  var C_9 = ['step_out()', 'step_back()'];
  // 3 (người chơi tự viết): leo ba bậc chéo, đi thẳng hai ô, trượt trái hai ô, đi thẳng hai ô tới cờ
  var L_3 = ['zig(3)', 'forward(2)', 'slide_l(2)', 'forward(2)'];
  // 10 (người chơi tự viết): nhặt vật, qua băng, vòng qua tường, đặt vật xuống
  var L_10 = ['pick()', 'cross_belt()', 'bypass()', 'drop()'];

  /** Điền các trường chung của chương (không đụng tới trường màn đã khai). */
  function man(m, coTay) {
    m.chuong = 'che-omni';
    m.loaiRobot = 'omni';
    m.robot = { than: 'omni', tay: coTay ? 'kep' : null };
    m.hamGoc = m.hamGoc || (coTay ? KHAY_TAY : KHAY);
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    m.cauTruc = ['for'];
    if (m.mucTieu === 'toi-co') delete m.mucTieu;                 // mặc định của lõi
    else m.mucTieu = m.mucTieu || 'bong-mo';
    return ManHoc.chuanHoa(m);
  }

  /* ------------------------------------------------------------------- sân */

  // 1: sân thoáng, xe (1,3) quay lên, xe mờ chếch lên phía phải (2,2)
  var SAN_1 = ['.....', '.....', '.....', '.....', '.....'];
  // 2: xe (1,5), xe mờ (4,2): ba bậc chéo
  var SAN_2 = ['.......', '.......', '.......', '.......', '.......', '.......'];
  // 3: hành lang bậc thang: xe (0,7); ba bậc chéo tới (3,4); lên (3,2); trượt trái tới (1,2); lên tới cờ (1,0). Các ô thêm (0,6) (1,5) (2,4) để cả hai thứ tự (trượt rồi tiến, tiến rồi trượt) đi được
  var SAN_3 = ['#F##', '#.##', '#...', '###.', '##..', '#...', '...#', '..##'];
  // 4: xe (2,4) quay lên, khối tường (2,3) chắn ngay trước mặt; xe mờ (2,2) sau tường
  var SAN_4 = ['.....', '.....', '.....', '..#..', '.....', '.....'];
  // 5: hai băng chuyền chạy XUỐNG (cột 3, 4); xe (2,2), xe mờ (5,2) bên kia băng cùng hàng
  var SAN_5 = ['...vv..', '...vv..', '...vv..', '...vv..', '...vv..', '...vv..', '...vv..'];
  // 6: vật (2,2) ngay trước mặt xe (2,3); vật mờ (3,2)
  var SAN_6 = ['.....', '.....', '..o..', '.....', '.....'];
  // 7: hành lang bậc thang rộng 4×4: xe (0,3) quay lên, xe mờ (3,0): ba lần nhích phải xen ba lần tiến (hành lang chỉ có đường này nên không có đường tắt)
  var SAN_7 = ['###.', '##..', '#..#', '..##'];
  // 8: xe (3,5) QUAY MẶT SANG TRÁI, xe mờ (6,2) quay sang trái: lên hai ô (trượt phải), sang phải ba ô (lùi), lên một ô
  var SAN_8 = ['.......', '.......', '.......', '.......', '.......', '.......'];
  // 9: hành lang đúng một đường (không hai ô nào của đường nằm cạnh nhau trừ ô liền kề, nên không có đường tắt): xe (3,4); step_out(): hai bậc chéo, đi thẳng hai ô, trượt trái hai ô, tới ◆ (3,0); về lại (3,4)
  var SAN_9 = ['###...', '#####.', '#####.', '####..', '###..#'];
  // 10: hai băng chạy xuống (cột 2, 3), xe (1,5), vật (1,4) ngay trước mặt, khối tường (1,3) sau vật (chặn đường tắt: lên trước rồi để băng kéo xuống đúng chỗ) và khối tường (4,4) ngay sau băng; xe mờ (4,3) sau tường, vật mờ (4,2) ngay trước xe mờ
  var SAN_10 = ['..vv...', '..vv...', '..vv...', '.#vv...', '.ovv#..', '..vv...', '..vv...', '..vv...'];

  var DS = [
    /* ------------------------------------------------------------ hàng 1: làm quen */
    man({
      so: 1, hamCuaEmCan: ['move'], ten: 'Đi chéo', hang: 'lam-quen', taoHam: ['diag'],
      deBai: 'Xe omni không đi chéo được trong một nhịp. Chương trình chính chỉ gọi diag() (diag là đường chéo): em tự chế lệnh này để xe tiến chéo lên phía phải một ô, mặt vẫn quay lên, đúng chỗ xe mờ.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi diag(). Mở Xưởng hàm, tạo diag() rồi bấm Chạy.',
      san: SAN_1,
      batDau: { x: 1, y: 3, huong: 0 },
      bongMo: { x: 2, y: 2, huong: 0 },
      chinhCoDinh: true,
      maMau: { chinh: C_1.slice() },
      sao: { o: 7, nhip: 2 },
      loiGiai: { chinh: C_1.slice(), hamCuaEmMoi: [H('diag', T_DIAG)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_1.slice() },
        hamCuaEmMoi: [H('diag', nhieu(['# đi chéo lên phải'], T_DIAG))]
      },
      congThucKhac: [
        { moTa: 'Tiến trước rồi mới trượt (cùng số nhịp)', hamCuaEmMoi: [H('diag', ['move()', 'slide_right()', 'wait()'])] },
        { moTa: 'Đi như xe hai bánh: rẽ phải, tiến, rẽ trái, tiến (chậm hơn hai nhịp)', hamCuaEmMoi: [H('diag', ['turn_right()', 'move()', 'turn_left()', 'move()'])] }
      ],
      loiSai: [
        { moTa: 'Quên wait() sau lệnh trượt: trượt và tiến dồn vào một nhịp, omni không đi chéo nên chỉ trượt', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [H('diag', ['slide_right()', 'move()'])], phaiCoMa: ['omni-khong-cheo', 'lech-bong-mo'] },
        { moTa: 'Chỉ trượt, quên tiến: xe đứng cạnh xe mờ', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [H('diag', ['slide_right()', 'wait()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Trượt sang trái: xe mờ nằm ở bên phải', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [H('diag', ['slide_left()', 'wait()', 'move()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Gọi diag() mà chưa chế hàm', baiLam: { chinh: C_1.slice() }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Trượt một nhịp, tiến một nhịp: hai nhịp liền nhau mới thành một bước chéo.', 'Xe mờ nằm chếch về phía trên bên phải xe, cách một ô theo mỗi hướng.']
    }, false),

    man({
      so: 2, ten: 'Bậc thang chéo', hang: 'lam-quen', hamCuaEmCan: ['diag'], taoHam: ['zig'],
      deBai: 'Xe omni cần leo ba bậc chéo liền nhau. Chương trình chính chỉ gọi zig(3): em tự chế lệnh zig(n) để xe đi chéo n bước liên tiếp, đúng chỗ xe mờ.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi zig(3). Mở Xưởng hàm, tạo zig có một tham số n rồi bấm Chạy.',
      san: SAN_2,
      batDau: { x: 1, y: 5, huong: 0 },
      bongMo: { x: 4, y: 2, huong: 0 },
      chinhCoDinh: true,
      maMau: { chinh: C_2.slice() },
      sao: { o: 9, nhip: 6 },
      loiGiai: { chinh: C_2.slice(), hamCuaEmMoi: [H('zig', T_ZIG, ['n'])] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_2.slice() },
        hamCuaEmMoi: [H('zig', nhieu(['# n bước chéo'], T_ZIG), ['n'])]
      },
      congThucKhac: [
        { moTa: 'Không dùng diag(): viết thẳng trượt, wait(), tiến trong vòng lặp', hamCuaEmMoi: [H('zig', lap('n', ['slide_right()', 'wait()', 'move()']), ['n'])] },
        { moTa: 'Tiến trước rồi mới trượt trong mỗi bước (cùng số nhịp)', hamCuaEmMoi: [H('zig', lap('n', ['move()', 'slide_r(1)']), ['n'])] }
      ],
      loiSai: [
        { moTa: 'Hàm zig không có tham số n: gọi zig(3) báo lỗi', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [H('zig', lap(3, 'diag()'))], phaiCoMa: ['loi-chay'] },
        { moTa: 'Lặp số lần cố định hai thay vì n: xe leo thiếu một bậc', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [H('zig', lap(2, 'diag()'), ['n'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quên vòng lặp: xe chỉ đi chéo một bước', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [H('zig', ['diag()'], ['n'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Trong vòng lặp quên wait() sau lệnh trượt: trượt và tiến dồn vào một nhịp', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [H('zig', lap('n', ['slide_right()', 'move()']), ['n'])], phaiCoMa: ['omni-khong-cheo', 'lech-bong-mo'] },
        { moTa: 'Gọi zig(3) mà chưa chế hàm', baiLam: { chinh: C_2.slice() }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Mỗi bước chéo em đã có diag(). Lặp nó n lần bằng vòng for.', 'Số 3 trong ngoặc của zig(3) chạy vào tham số n.']
    }, false),

    man({
      so: 3, ten: 'Hành lang chéo', hang: 'lam-quen', mucTieu: 'toi-co',
      hamCuaEmCan: ['zig', 'forward', 'slide_l'],
      deBai: 'Hành lang gồm bậc thang chéo, đoạn đi thẳng và đoạn đi ngang. Dùng zig(), forward() và slide_l() em đã có để đưa xe omni tới cờ. Chương trình chỉ có 10 ô.',
      san: SAN_3,
      batDau: { x: 0, y: 7, huong: 0 },
      maMau: { chinh: [] },
      sao: { o: 17, nhip: 12 },
      loiGiai: { chinh: L_3.slice() },
      loiGiaiKhac: {
        moTa: 'Cùng cách làm, thêm một dòng chú thích',
        baiLam: { chinh: nhieu(['# leo bậc thang, đi thẳng, trượt trái, đi thẳng'], L_3) }
      },
      congThucKhac: [
        { moTa: 'Mỗi bậc thang gọi diag() một lần thay cho zig(3)', baiLam: { chinh: ['diag()', 'diag()', 'diag()', 'forward(2)', 'slide_l(2)', 'forward(2)'] } },
        { moTa: 'Đi thẳng từng ô bằng move() thay cho forward(2)', baiLam: { chinh: ['zig(3)', 'move()', 'move()', 'slide_l(2)', 'move()', 'move()'] } }
      ],
      loiSai: [
        { moTa: 'Không dùng zig(), viết thẳng từng lệnh gốc: quá 10 ô', baiLam: { chinh: ['slide_right()', 'wait()', 'move()', 'slide_right()', 'wait()', 'move()', 'slide_right()', 'wait()', 'move()', 'forward(2)', 'slide_l(2)', 'forward(2)'] }, phaiCoMa: ['tran-khung'] },
        { moTa: 'Leo thiếu một bậc: xe đâm tường khi đi thẳng', baiLam: { chinh: ['zig(2)', 'forward(2)', 'slide_l(2)', 'forward(2)'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Trượt trái thiếu một ô: xe đâm tường khi đi lên', baiLam: { chinh: ['zig(3)', 'forward(2)', 'slide_l(1)', 'forward(2)'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Trượt phải thay vì trượt trái ở đoạn ngang: xe đâm tường', baiLam: { chinh: ['zig(3)', 'forward(2)', 'slide_r(2)', 'forward(2)'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Quên đoạn đi thẳng cuối: xe dừng sát cờ', baiLam: { chinh: ['zig(3)', 'forward(2)', 'slide_l(2)', 'forward(1)'] }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Leo hết các bậc thang chéo trước, rồi nhìn xem hành lang rẽ về phía nào.', 'Đếm số bậc thang và số ô của từng đoạn rồi điền vào ngoặc.']
    }, false),

    /* ------------------------------------------------------------ hàng 2: luyện */
    man({
      so: 4, ten: 'Vòng qua tường', hang: 'luyen', hamCuaEmCan: ['slide_r', 'slide_l', 'forward'], taoHam: ['bypass'],
      deBai: 'Một khối tường chắn ngay trước mặt xe omni. Chương trình chính chỉ gọi bypass(): em tự chế lệnh này để xe vòng qua khối tường và đứng ngay phía sau nó, mặt vẫn quay lên, đúng chỗ xe mờ.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi bypass(). Mở Xưởng hàm, tạo bypass() rồi bấm Chạy.',
      san: SAN_4,
      batDau: { x: 2, y: 4, huong: 0 },
      bongMo: { x: 2, y: 2, huong: 0 },
      chinhCoDinh: true,
      maMau: { chinh: C_4.slice() },
      sao: { o: 15, nhip: 4 },
      loiGiai: { chinh: C_4.slice(), hamCuaEmMoi: [H('bypass', T_BYPASS)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_4.slice() },
        hamCuaEmMoi: [H('bypass', nhieu(['# vòng qua tường'], T_BYPASS))]
      },
      congThucKhac: [
        { moTa: 'Vòng bên trái thay vì bên phải', hamCuaEmMoi: [H('bypass', ['slide_l(1)', 'forward(2)', 'slide_r(1)'])] },
        { moTa: 'Quay xe như xe hai bánh: rẽ phải, tiến, rẽ trái, đi hai ô, rẽ trái, tiến, rẽ phải (chậm hơn bốn nhịp)', hamCuaEmMoi: [H('bypass', ['turn_right()', 'move()', 'turn_left()', 'forward(2)', 'turn_left()', 'move()', 'turn_right()'])] }
      ],
      loiSai: [
        { moTa: 'Quên trượt về: xe đứng lệch một cột so với xe mờ', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [H('bypass', ['slide_r(1)', 'forward(2)'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đi thẳng một ô thôi rồi trượt về: xe đâm khối tường', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [H('bypass', ['slide_r(1)', 'move()', 'slide_l(1)'])], phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Trượt hai lần cùng một phía: xe lệch hai cột', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [H('bypass', ['slide_r(1)', 'forward(2)', 'slide_r(1)'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đi thẳng vào khối tường', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [H('bypass', ['forward(2)'])], phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Quên wait() sau lệnh trượt: lệnh tiến bị bỏ, xe đâm tường khi trượt về', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [H('bypass', ['slide_right()', 'move()', 'move()', 'slide_left()', 'wait()'])], phaiCoMa: ['omni-khong-cheo', 'dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Gọi bypass() mà chưa chế hàm', baiLam: { chinh: C_4.slice() }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Khối tường chiếm một ô: trượt sang một bên, đi thẳng qua tường, rồi trượt về lại cột cũ.', 'Xe mờ nằm cùng cột với xe, tường ở giữa hai xe.']
    }, false),

    man({
      so: 5, ten: 'Qua băng chuyền', hang: 'luyen', hamCuaEmCan: ['slide_r', 'forward'], taoHam: ['cross_belt'],
      deBai: 'Hai băng chuyền chạy xuống cắt ngang đường của xe omni. Chương trình chính chỉ gọi cross_belt(): em tự chế lệnh này để xe sang bên kia băng, cùng hàng với chỗ xuất phát, mặt vẫn quay lên, đúng chỗ xe mờ.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi cross_belt(). Mở Xưởng hàm, tạo cross_belt() rồi bấm Chạy. Viết thử vài lệnh trượt để xem băng làm gì với xe.',
      san: SAN_5,
      batDau: { x: 2, y: 2, huong: 0 },
      bongMo: { x: 5, y: 2, huong: 0 },
      chinhCoDinh: true,
      maMau: { chinh: C_5.slice() },
      sao: { o: 11, nhip: 5 },
      loiGiai: { chinh: C_5.slice(), hamCuaEmMoi: [H('cross_belt', T_CROSS)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_5.slice() },
        hamCuaEmMoi: [H('cross_belt', nhieu(['# qua băng chuyền'], T_CROSS))]
      },
      congThucKhac: [
        { moTa: 'Tiến hai ô trước, rồi mới trượt qua băng (cùng số nhịp)', hamCuaEmMoi: [H('cross_belt', ['forward(2)', 'slide_r(3)'])] },
        { moTa: 'Tiến một ô trước, một ô sau khi qua băng (cùng số nhịp)', hamCuaEmMoi: [H('cross_belt', ['move()', 'slide_r(3)', 'move()'])] }
      ],
      loiSai: [
        { moTa: 'Quên bù chỗ băng kéo: xe sang bên kia nhưng thấp hơn xe mờ hai ô', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [H('cross_belt', ['slide_r(3)'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Trượt hai lần thôi: xe còn đứng trên băng, băng đẩy tiếp', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [H('cross_belt', ['slide_r(2)', 'forward(2)'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Bù sai chiều: lùi thay vì tiến, xe càng thấp hơn xe mờ', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [H('cross_belt', ['slide_r(3)', 'back()', 'back()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Gọi cross_belt() mà chưa chế hàm', baiLam: { chinh: C_5.slice() }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Mỗi nhịp xe omni đứng trên băng, băng đẩy xe đi thêm một ô.', 'Đếm xem băng đã kéo xe lệch mấy ô, rồi đưa xe về cùng hàng với xe mờ.']
    }, false),

    man({
      so: 6, ten: 'Dời vật sang bên', hang: 'luyen', hamCuaEmCan: ['pick', 'drop', 'slide_r', 'slide_l'], taoHam: ['shift'], nhipTheoLoiGiai: true,
      deBai: 'Một vật nằm ngay trước mặt xe omni. Chương trình chính chỉ gọi shift(): em tự chế lệnh này để dời vật sang cột bên phải của nó, xe về lại chỗ cũ và vẫn quay lên, đúng như vật mờ và xe mờ.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi shift(). Mở Xưởng hàm, tạo shift() rồi bấm Chạy.',
      san: SAN_6,
      batDau: { x: 2, y: 3, huong: 0 },
      bongMo: { x: 2, y: 3, huong: 0, vat: [{ x: 3, y: 2 }] },
      chinhCoDinh: true,
      maMau: { chinh: C_6.slice() },
      sao: { o: 21, nhip: 6 },
      loiGiai: { chinh: C_6.slice(), hamCuaEmMoi: [H('shift', T_SHIFT)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_6.slice() },
        hamCuaEmMoi: [H('shift', nhieu(['# dời vật sang phải'], T_SHIFT))]
      },
      congThucKhac: [
        { moTa: 'Trượt từng lệnh slide_right(), slide_left() kèm wait() thay cho slide_r(1), slide_l(1)', hamCuaEmMoi: [H('shift', ['pick()', 'slide_right()', 'wait()', 'drop()', 'slide_left()', 'wait()'])] },
        { moTa: 'Chờ thêm một nhịp sau khi nhặt (chậm hơn một nhịp)', hamCuaEmMoi: [H('shift', ['pick()', 'wait()', 'slide_r(1)', 'drop()', 'slide_l(1)'])] }
      ],
      loiSai: [
        { moTa: 'Đặt vật xong không trượt về: xe đứng lệch một cột', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [H('shift', ['pick()', 'slide_r(1)', 'drop()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Trượt sang trái: vật bị dời sang cột bên trái', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [H('shift', ['pick()', 'slide_l(1)', 'drop()', 'slide_r(1)'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Thả bằng release() khi tay còn nâng: vật rơi vỡ', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [H('shift', ['pick()', 'slide_r(1)', 'release()', 'wait()', 'slide_l(1)'])], phaiCoMa: ['vat-vo'] },
        { moTa: 'Quên nhặt vật: xe trượt đi trượt về tay không', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [H('shift', ['slide_r(1)', 'drop()', 'slide_l(1)'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Gọi shift() mà chưa chế hàm', baiLam: { chinh: C_6.slice() }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Xe chỉ nhặt và đặt vật ở ô ngay trước mặt. Trượt sang một bên thì ô trước mặt cũng dời theo.', 'Đặt vật xuống xong, đừng quên đưa xe về đúng chỗ cũ.']
    }, true),

    /* ------------------------------------------------------------ hàng 3: biến thể */
    man({
      so: 7, ten: 'Trượt phải hỏng', hang: 'bien-the', hamGoc: KHAY_HONG, phanCung: KHAY_HONG, canhBao: 'Trượt phải hỏng', nhipTheoLoiGiai: true,
      hamCuaEmCan: ['dodge_right', 'u_turn', 'turn_right', 'turn_left', 'move'],
      deBai: 'Bánh trượt phải bị hỏng: slide_right() không chạy được. Hàm hop_right() của màn muốn nhích xe sang phải một ô, nhưng đang gọi đúng lệnh hỏng đó. Sửa thân hop_right() để chương trình đưa xe tới chỗ xe mờ, mặt vẫn quay lên.',
      veMaMau: 'Chương trình chính bị khóa: ba lần hop_right() xen ba lần tiến. Hàm hop_right() đang gọi slide_right(). Thử nó xem xe báo gì, rồi viết lại bằng những lệnh còn chạy.',
      san: SAN_7,
      batDau: { x: 0, y: 3, huong: 0 },
      bongMo: { x: 3, y: 0, huong: 0 },
      chinhCoDinh: true,
      maMau: { chinh: C_7.slice(), hamCuaMan: [H('hop_right', T_HOP_CU)] },
      sao: { o: 17, nhip: 12 },
      loiGiai: { chinh: C_7.slice(), hamCuaMan: [H('hop_right', T_HOP)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách sửa, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_7.slice(), hamCuaMan: [H('hop_right', nhieu(['# bánh trượt phải hỏng'], T_HOP))] }
      },
      congThucKhac: [
        { moTa: 'Quay đầu, trượt trái (lúc này là sang phải), quay đầu lại', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('hop_right', ['u_turn()', 'slide_left()', 'wait()', 'u_turn()'])] } },
        { moTa: 'Rẽ phải, tiến, rẽ trái viết thẳng thay cho dodge_right()', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('hop_right', ['turn_right()', 'move()', 'turn_left()'])] } }
      ],
      loiSai: [
        { moTa: 'Để nguyên hop_right(): vẫn gọi slide_right() đã hỏng', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('hop_right', T_HOP_CU)] }, phaiCoMa: ['lenh-goc-hong'] },
        { moTa: 'Đổi sang slide_left(): xe nhích sang trái, xa xe mờ', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('hop_right', ['slide_left()', 'wait()'])] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Rẽ phải, tiến mà quên rẽ lại: xe quay mặt sang phải, tiến tiếp đi sai hướng', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('hop_right', ['turn_right()', 'move()'])] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quay đầu, trượt trái mà quên quay đầu lại: xe quay mặt xuống', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('hop_right', ['u_turn()', 'slide_left()', 'wait()'])] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Xóa mất hàm hop_right() của màn: lệnh gọi nó không còn hàm nào', baiLam: { chinh: C_7.slice() }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Bánh trượt trái vẫn tốt, và em đã biết quay xe: có hai cách nhích sang phải mà không cần slide_right().', 'Dù cách nào, xe phải quay mặt lên lại như lúc đầu.']
    }, false),

    man({
      so: 8, ten: 'Sai la bàn', hang: 'bien-the', hamCuaEmCan: ['slide_r', 'u_turn', 'forward', 'move'],
      deBai: 'Hàm north(n) của màn muốn đưa xe lên phía trên màn hình n ô, còn east(n) muốn đưa xe sang phải màn hình n ô. Nhưng người viết nghĩ xe quay mặt lên, mà xe này đang quay mặt sang trái. Sửa cả hai hàm để xe tới chỗ xe mờ.',
      veMaMau: 'Chương trình chính bị khóa: north(2), east(3), north(1). Chạy thử, xem xe đi về phía nào rồi sửa thân hai hàm.',
      san: SAN_8,
      batDau: { x: 3, y: 5, huong: 3 },
      bongMo: { x: 6, y: 2, huong: 3 },
      chinhCoDinh: true,
      maMau: { chinh: C_8.slice(), hamCuaMan: [H('north', T_NORTH_CU, ['n']), H('east', T_EAST_CU, ['n'])] },
      sao: { o: 12, nhip: 6 },
      loiGiai: { chinh: C_8.slice(), hamCuaMan: [H('north', T_NORTH, ['n']), H('east', T_EAST, ['n'])] },
      loiGiaiKhac: {
        moTa: 'Cùng cách sửa, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_8.slice(), hamCuaMan: [H('north', nhieu(['# lên phía trên màn hình'], T_NORTH), ['n']), H('east', T_EAST, ['n'])] }
      },
      congThucKhac: [
        { moTa: 'north(n) viết thẳng vòng lặp slide_right() và wait(); east(n) gọi forward(n) sau khi quay đầu (chậm hơn hai nhịp)', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('north', lap('n', ['slide_right()', 'wait()']), ['n']), H('east', ['u_turn()', 'forward(n)', 'u_turn()'], ['n'])] } },
        { moTa: 'north(n) rẽ phải, tiến n ô rồi rẽ trái như xe hai bánh (chậm hơn hai nhịp mỗi lần gọi)', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('north', ['turn_right()', 'forward(n)', 'turn_left()'], ['n']), H('east', T_EAST, ['n'])] } }
      ],
      loiSai: [
        { moTa: 'Để nguyên hai hàm: xe đi theo hướng mặt, lạc khỏi xe mờ', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('north', T_NORTH_CU, ['n']), H('east', T_EAST_CU, ['n'])] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Chỉ sửa north(n): east(n) vẫn trượt xe lên trên', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('north', T_NORTH, ['n']), H('east', T_EAST_CU, ['n'])] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Chỉ sửa east(n): north(n) vẫn đưa xe sang trái', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('north', T_NORTH_CU, ['n']), H('east', T_EAST, ['n'])] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'north(n) trượt trái: xe đi xuống thay vì đi lên', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('north', lap('n', ['slide_left()', 'wait()']), ['n']), H('east', T_EAST, ['n'])] }, phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'east(n) quên wait() trong vòng lặp: các lệnh lùi dồn vào một nhịp', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('north', T_NORTH, ['n']), H('east', lap('n', ['left_back()', 'right_back()']), ['n'])] }, phaiCoMa: ['banh-goi-lai', 'lech-bong-mo'] }
      ],
      goiY: ['Xe quay mặt sang trái: bên tay phải của xe là phía nào của màn hình?', 'Lùi thì xe đi về phía sau lưng, tức là về phía nào của màn hình?']
    }, false),

    man({
      so: 9, ten: 'Đường về', hang: 'bien-the', hamCuaEmCan: ['zig', 'forward', 'slide_r', 'slide_l', 'back'],
      deBai: 'Hàm step_out() của màn đưa xe đi một đoạn. Viết thân hàm step_back() của màn để đưa xe về đúng chỗ và hướng xuất phát, như xe mờ.',
      veMaMau: 'Chương trình chính bị khóa: step_out() rồi step_back(). Hàm step_out() cũng bị khóa, em chỉ xem được thân hàm. Thân hàm step_back() đang chỉ có dòng pass, nghĩa là chưa làm gì: em viết lệnh thay cho nó. Điểm ◆ là chỗ step_out() đưa xe tới.',
      san: SAN_9,
      batDau: { x: 3, y: 4, huong: 0 },
      bongMo: { x: 3, y: 4, huong: 0, diQua: [{ x: 3, y: 0 }] },
      chinhCoDinh: true, khoaHamMan: ['step_out'],
      maMau: { chinh: C_9.slice(), hamCuaMan: [H('step_out', T_STEP_OUT), H('step_back', T_STEP_BACK_TRONG)] },
      sao: { o: 30, nhip: 16 },
      loiGiai: { chinh: C_9.slice(), hamCuaMan: [H('step_out', T_STEP_OUT), H('step_back', T_STEP_BACK)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách viết, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_9.slice(), hamCuaMan: [H('step_out', T_STEP_OUT), H('step_back', nhieu(['# làm ngược lại step_out()'], T_STEP_BACK))] }
      },
      congThucKhac: [
        { moTa: 'Viết thẳng từng lệnh, không dùng vòng for (nhiều ô hơn, cùng số nhịp)', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('step_out', T_STEP_OUT), H('step_back', ['slide_r(2)', 'back()', 'back()', 'back()', 'slide_l(1)', 'back()', 'slide_l(1)'])] } },
        { moTa: 'Chờ thêm một nhịp sau khi trượt phải (chậm hơn một nhịp)', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('step_out', T_STEP_OUT), H('step_back', ['slide_r(2)', 'wait()', 'back()', 'back()'].concat(lap(2, ['back()', 'slide_l(1)'])))] } }
      ],
      loiSai: [
        { moTa: 'Để nguyên thân pass: xe còn đứng ở ◆, chưa về', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('step_out', T_STEP_OUT), H('step_back', T_STEP_BACK_TRONG)] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đi lại y như step_out(): xe đi tiếp xa khỏi chỗ cũ, đâm tường', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('step_out', T_STEP_OUT), H('step_back', T_STEP_OUT)] }, phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Quên đảo thứ tự: lùi các bước chéo trước, trượt phải sau, xe đâm tường', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('step_out', T_STEP_OUT), H('step_back', lap(2, ['back()', 'slide_l(1)']).concat(['back()', 'back()', 'slide_r(2)']))] }, phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Chỉ lùi một bước chéo thay vì hai: xe dừng cách chỗ cũ một bậc', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('step_out', T_STEP_OUT), H('step_back', ['slide_r(2)', 'back()', 'back()'].concat(lap(1, ['back()', 'slide_l(1)'])))] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Xóa mất hàm step_back() của màn: lệnh gọi nó không còn hàm nào', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('step_out', T_STEP_OUT)] }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Làm ngược lại step_out() từng bước, theo thứ tự ngược.', 'Mỗi lệnh có một lệnh ngược: tiến thì lùi, trượt phải thì trượt trái. Một bước chéo gồm hai lệnh nên lúc về cũng phải đảo cả hai lệnh.']
    }, false),

    /* ------------------------------------------------------------ trùm */
    man({
      so: 10, ten: 'Kho ngang', hang: 'trum', nhipTheoLoiGiai: true,
      hamCuaEmCan: ['pick', 'drop', 'cross_belt', 'bypass'],
      huyHieu: { ma: 'che-omni', ten: 'Huy hiệu Chế lệnh omni' },
      gioiHanHam: 4,
      deBai: 'Xe omni có tay kẹp. Nhặt vật trước mặt, mang qua hai băng chuyền, vòng qua khối tường rồi đặt vật xuống ngay sau tường, đúng như vật mờ. Chương trình chính chỉ được gọi 4 hàm của em khác nhau.',
      san: SAN_10,
      batDau: { x: 1, y: 5, huong: 0 },
      bongMo: { x: 4, y: 3, huong: 0, vat: [{ x: 4, y: 2 }] },
      maMau: { chinh: [] },
      sao: { o: 30, nhip: 13 },
      loiGiai: { chinh: L_10.slice() },
      loiGiaiKhac: {
        moTa: 'Cùng cách làm, thêm một dòng chú thích',
        baiLam: { chinh: nhieu(['# nhặt vật, qua băng, vòng tường, đặt vật'], L_10) }
      },
      congThucKhac: [
        { moTa: 'Qua băng bằng vòng for viết thẳng lệnh trượt thay cho cross_belt() (bypass vẫn dùng, vẫn 4 hàm)', baiLam: { chinh: ['pick()', 'for i in range(3):', '    slide_right()', '    wait()', 'forward(2)', 'bypass()', 'drop()'] } }
      ],
      loiSai: [
        { moTa: 'Không bù chỗ băng kéo: xe sang bên kia nhưng thấp hơn hai ô, ô trước mặt là tường nên không thả được vật', baiLam: { chinh: ['pick()', 'slide_r(3)', 'bypass()', 'drop()'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quên nhặt vật: đặt vật xuống khi tay không', baiLam: { chinh: ['cross_belt()', 'bypass()', 'drop()'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quên đặt vật: vật còn nằm trên tay', baiLam: { chinh: ['pick()', 'cross_belt()', 'bypass()'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đi thẳng vào khối tường, không vòng', baiLam: { chinh: ['pick()', 'cross_belt()', 'forward(2)', 'drop()'] }, phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Gọi 5 hàm khác nhau (pick, cross_belt, bypass, drop, forward): vượt giới hạn 4 hàm', baiLam: { chinh: ['pick()', 'cross_belt()', 'bypass()', 'drop()', 'forward(1)'] }, phaiCoMa: ['qua-gioi-han-ham'] }
      ],
      goiY: ['Việc nào trên đường đi em đã có lệnh chế sẵn? Nối chúng lại theo thứ tự.', 'Nhặt vật trước khi qua băng, đặt vật sau khi vòng qua tường.']
    }, true)
  ];

  ManHoc.them(DS);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();
