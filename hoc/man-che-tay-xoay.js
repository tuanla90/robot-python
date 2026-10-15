/* ============================================================================
   man-che-tay-xoay.js — "Đường học": CHƯƠNG `che-tay-xoay` · CHẾ LỆNH TAY XOAY (10 màn). Đợt 2 làm lại theo khuôn (KE-HOACH-CHE-LENH.md, mục 5b.3). Chương chế lệnh của bộ phận tay xoay (sau chương `tay-xoay`).
   Robot như chương tay-xoay: XE HAI BÁNH GẮN TAY XOAY, robot { than: 'hai-banh', tay: 'xoay', camBien: [] }. Luật thiết kế như che-xe / che-tay: lệnh gốc chỉ đổi MỘT trạng thái (tay nâng / hạ, kẹp, khớp xoay một nấc);
   động tác hay (nhặt bên trái, đặt sang phải, đổi chỗ hai bên, phân loại…) là thứ NGƯỜI CHƠI TỰ CHẾ. Mỗi lệnh chế được ít nhất hai cách và cả hai đều thắng: `congThucKhac: [{ moTa, hamCuaEmMoi | baiLam }]` (kiem-che-tay-xoay.mjs chạy từng cách).
   Màn dùng HÀM CỦA MÀN (6.7, 6.8, 6.9: hàm chỉ đúng cho màn đó, không vào kho) khai cách khác bằng `{ moTa, baiLam: { chinh, hamCuaMan } }`.

   Mục tiêu `bong-mo` (san-hoc.js, phần BÓNG MỜ): xe phải đứng đúng tư thế của "xe mờ" khi chương trình CHẠY XONG, vật mờ cho biết mỗi vật phải nằm ở ô nào (vật có màu chấm theo màu), xe mờ cầm vật (`bongMo.cam`)
   nghĩa là lúc xong tay đang kẹp một vật, và bongMo.xoay là nấc của khớp lúc xong (không khai thì 'truoc': tay chỉ phía trước). Chương trình chính khóa (`chinhCoDinh`, bản mẫu `maMau.chinh`), người chơi chỉ chế hàm.
   6.3 tới cờ; 6.10 tự viết chương trình chính.

   LUẬT TAY XOAY (san-hoc.js): một nhịp máy làm theo thứ tự cố định: tay NÂNG → khớp XOAY một nấc (arm_left / arm_right) → tay HẠ → KẸP / THẢ ở ô tay chỉ (trước mặt, bên trái hay bên phải xe) → bánh chạy. Khớp chỉ xoay được khi tay đang nâng;
   thả khi tay đang nâng thì vật vỡ; tay hạ thì xe không đi, không quay. Hàm của em có sẵn: mọi hàm các chương trước (move, turn_left, turn_right, pick, drop, clear_left, relay…).
     pick() = arm_down(), grab(), wait(), arm_up(), wait()      (2 nhịp: nhặt vật ở ô tay chỉ, tay về tư thế nâng)
     drop() = arm_down(), release(), wait(), arm_up(), wait()   (2 nhịp: đặt vật xuống ô tay chỉ, tay về tư thế nâng)

   KHAY: cả chương mở đủ bánh (có bánh lùi) và đủ sáu lệnh tay (xoay trái / phải, nâng / hạ, kẹp / thả); 6.9 là màn HỎNG nên khay hẹp hơn (xem dưới).

   Hàm của em MỚI (tên cốt truyện, khóa trong kho):
     che-tay-xoay.1 pick_left()   = arm_left(), arm_down(), grab(), wait(), arm_up(), arm_right(), wait()   nhặt vật bên TRÁI xe, tay về phía trước, đang cầm vật (2 nhịp)
     che-tay-xoay.2 drop_right()  = arm_right(), arm_down(), release(), wait(), arm_up(), arm_left(), wait() đặt vật cầm sang ô bên PHẢI xe, tay về phía trước (2 nhịp)
     che-tay-xoay.4 pick_right()  = arm_right(), arm_down(), grab(), wait(), arm_up(), arm_left(), wait()   nhặt vật bên PHẢI xe (2 nhịp)
                    drop_left()   = arm_left(), arm_down(), release(), wait(), arm_up(), arm_right(), wait() đặt vật cầm sang ô bên TRÁI xe (2 nhịp)
     che-tay-xoay.5 swap_sides()  = pick_left(), drop(), pick_right(), drop_left(), pick(), drop_right()  vật bên trái và vật bên phải đổi chỗ, ô trước mặt trống làm chỗ cất tạm (12 nhịp)
     che-tay-xoay.6 sort_two()    = pick(), drop_left(), move(), pick(), drop_right(), move()           vật trước mặt sang trái, tiến một ô, vật kế sang phải, tiến một ô (10 nhịp)
   HÀM CỦA MÀN (hàm chỉ đúng cho MỘT màn, không vào kho, không có trong Sổ lệnh; `maMau.hamCuaMan`):
     che-tay-xoay.7 put_back()            thân ban đầu `pass`; lời giải arm_down(), release(), wait(), arm_up(), arm_right(), wait()    đi NGƯỢC lại lift_left() của màn (khóa)
     che-tay-xoay.8 fixed_pick_left() / fixed_drop_right()  thân ban đầu = pick_left() / drop_right() cũ (khớp lắp ngược: arm_left() xoay sang phải); người chơi đổi chỗ arm_left ↔ arm_right
     che-tay-xoay.9 side_pick() / side_drop()   thân ban đầu = bản dùng khớp (hỏng); người chơi viết lại bằng cách QUAY XE (turn_left, pick, turn_right / turn_right, drop, turn_left)

   Sao: sao.nhip = số nhịp của lời giải cách 1 chạy thật (nhipTheoLoiGiai khi nâng tay và xoay có thể gộp chung nhịp nên BFS của do-duong-tay-xoay.mjs ngắn hơn hay bằng); sao.o = ô của lời giải cách 1.
   Hướng: 0 lên, 1 phải, 2 xuống, 3 trái. (x, y) với y = 0 ở hàng trên.
   Nối tiếp man-chuoi-1.js vào cùng window.ManHoc. Thứ tự chương: thu-tu-chuong.js.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var KHAY = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'arm_down', 'arm_up', 'arm_left', 'arm_right', 'grab', 'release'];
  var KHAY_KET = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'arm_down', 'arm_up', 'grab', 'release'];            // 6.9: khớp kẹt cứng, không còn arm_left / arm_right

  function H(ten, than) { return { ten: ten, thamSo: [], than: than.slice() }; }
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  function doiXoay(ds) { return ds.map(function (d) { return d === 'arm_left()' ? 'arm_right()' : d === 'arm_right()' ? 'arm_left()' : d; }); }

  // thân các hàm chế (cách 1, cách người chơi thường chọn): hai nhịp, nâng tay và xoay về chạy chung một nhịp
  var T_PICK_LEFT = ['arm_left()', 'arm_down()', 'grab()', 'wait()', 'arm_up()', 'arm_right()', 'wait()'];
  var T_PICK_RIGHT = doiXoay(T_PICK_LEFT);
  var T_DROP_RIGHT = ['arm_right()', 'arm_down()', 'release()', 'wait()', 'arm_up()', 'arm_left()', 'wait()'];
  var T_DROP_LEFT = doiXoay(T_DROP_RIGHT);
  var T_SWAP_SIDES = ['pick_left()', 'drop()', 'pick_right()', 'drop_left()', 'pick()', 'drop_right()'];
  var T_SORT_TWO = ['pick()', 'drop_left()', 'move()', 'pick()', 'drop_right()', 'move()'];
  var T_LIFT_LEFT = ['arm_left()', 'arm_down()', 'grab()', 'wait()', 'arm_up()', 'wait()'];                  // hàm của màn 6.7 (khóa)
  var T_PUT_BACK = ['arm_down()', 'release()', 'wait()', 'arm_up()', 'arm_right()', 'wait()'];
  var T_PUT_BACK_TRONG = ['pass'];                                                                           // thân ban đầu của put_back() ở 6.7: chưa làm gì (lõi hiểu pass), người chơi viết thay nó

  // chương trình chính khóa của từng màn (maMau.chinh)
  var C_1 = ['pick_left()'];
  var C_2 = ['pick()', 'drop_right()'];
  var C_4 = ['pick_right()', 'drop_left()'];
  var C_5 = ['swap_sides()'];
  var C_6 = ['sort_two()', 'sort_two()'];
  var C_7 = ['lift_left()', 'put_back()'];
  var C_8 = ['fixed_pick_left()', 'fixed_drop_right()'];
  var C_9 = ['side_pick()', 'side_drop()'];
  // 6.3 (người chơi tự viết): lên hai ô tới ngã rẽ, dọn vật bên trái sang bên phải, rẽ trái đi hai ô tới cờ
  var L_3 = ['move()', 'move()', 'pick_left()', 'drop_right()', 'turn_left()', 'move()', 'move()'];
  // 6.10 (người chơi tự viết): đổi chỗ hai vật hai bên, lên hai ô, phân loại bốn vật
  var L_10 = ['swap_sides()', 'move()', 'move()', 'sort_two()', 'sort_two()'];

  /** Điền các trường chung của chương (không đụng tới trường màn đã khai). */
  function man(m) {
    m.chuong = 'che-tay-xoay';
    m.loaiRobot = 'banh';
    m.robot = { than: 'hai-banh', tay: 'xoay', camBien: [] };
    m.hamGoc = m.hamGoc || KHAY;
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    m.cauTruc = ['for', 'if', 'while'];
    if (m.mucTieu === 'toi-co') delete m.mucTieu;                 // mặc định của lõi
    else m.mucTieu = m.mucTieu || 'bong-mo';
    return ManHoc.chuanHoa(m);
  }

  var DS = [
    /* ------------------------------------------------------------ hàng 1: làm quen */
    man({
      so: 1, ten: 'Nhặt bên trái', hang: 'lam-quen', taoHam: ['pick_left'],
      deBai: 'Một vật nằm ngay bên trái xe. Chương trình chính chỉ gọi pick_left(): em tự chế lệnh này để tay nhặt vật bên trái. Xong, tay chỉ về phía trước và đang cầm vật, giống xe mờ.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi pick_left(). Mở Xưởng hàm, tạo pick_left() rồi bấm Chạy.',
      san: ['.....', '.....', '.....', '.o...', '.....'],
      batDau: { x: 2, y: 3, huong: 0 },
      bongMo: { x: 2, y: 3, huong: 0, cam: true, vat: [] },
      chinhCoDinh: true,
      maMau: { chinh: C_1.slice() },
      sao: { o: 8, nhip: 2 },
      loiGiai: { chinh: C_1.slice(), hamCuaEmMoi: [H('pick_left', T_PICK_LEFT)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_1.slice() },
        hamCuaEmMoi: [H('pick_left', nhieu(['# nhặt vật bên trái'], T_PICK_LEFT))]
      },
      congThucKhac: [
        { moTa: 'Dùng pick() của em: xoay trái, pick(), rồi xoay về (chậm hơn một nhịp)', hamCuaEmMoi: [H('pick_left', ['arm_left()', 'pick()', 'arm_right()', 'wait()'])] },
        { moTa: 'Mỗi lệnh một nhịp riêng (chậm hơn nhưng vẫn đúng)', hamCuaEmMoi: [H('pick_left', ['arm_left()', 'wait()', 'arm_down()', 'grab()', 'wait()', 'arm_up()', 'wait()', 'arm_right()', 'wait()'])] }
      ],
      loiSai: [
        { moTa: 'Quên nâng tay trước khi xoay về: khớp kẹt, tay còn chỉ sang trái', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [H('pick_left', ['arm_left()', 'arm_down()', 'grab()', 'wait()', 'arm_right()', 'wait()'])], phaiCoMa: ['tay-xoay-ket', 'lech-bong-mo'] },
        { moTa: 'Xoay nhầm sang phải: tay kẹp vào ô trống', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [H('pick_left', T_PICK_RIGHT)], phaiCoMa: ['kep-hut', 'lech-bong-mo'] },
        { moTa: 'Nhặt xong không xoay về: tay còn chỉ sang trái', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [H('pick_left', ['arm_left()', 'arm_down()', 'grab()', 'wait()', 'arm_up()', 'wait()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quên hạ tay: tay kẹp trên cao, vật vẫn nằm đó', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [H('pick_left', ['arm_left()', 'grab()', 'wait()', 'arm_right()', 'wait()'])], phaiCoMa: ['kep-hut', 'lech-bong-mo'] },
        { moTa: 'Gọi pick_left() mà chưa chế hàm', baiLam: { chinh: C_1.slice() }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Xoay sang trái, hạ tay, kẹp, rồi nâng tay và xoay về. Nâng tay và xoay về chạy được chung một nhịp.',
        'Xe mờ cho biết tay phải chỉ về đâu khi chương trình xong.']
    }),

    man({
      so: 2, ten: 'Đặt sang phải', hang: 'lam-quen', hamCuaEmCan: ['pick'], taoHam: ['drop_right'],
      deBai: 'Một vật nằm ngay trước mặt xe. Chương trình chính nhặt vật bằng pick() rồi gọi drop_right(): em tự chế lệnh này để tay đặt vật sang ô bên phải xe. Xong, tay chỉ về phía trước như xe mờ.',
      veMaMau: 'Chương trình chính bị khóa: pick() rồi drop_right(). Mở Xưởng hàm, tạo drop_right() rồi bấm Chạy.',
      san: ['.....', '.....', '..o..', '.....', '.....'],
      batDau: { x: 2, y: 3, huong: 0 },
      bongMo: { x: 2, y: 3, huong: 0, vat: [{ x: 3, y: 3 }] },
      chinhCoDinh: true,
      maMau: { chinh: C_2.slice() },
      sao: { o: 14, nhip: 4 },
      loiGiai: { chinh: C_2.slice(), hamCuaEmMoi: [H('drop_right', T_DROP_RIGHT)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_2.slice() },
        hamCuaEmMoi: [H('drop_right', nhieu(['# đặt vật sang phải'], T_DROP_RIGHT))]
      },
      congThucKhac: [
        { moTa: 'Dùng drop() của em: xoay phải, drop(), rồi xoay về (chậm hơn một nhịp)', hamCuaEmMoi: [H('drop_right', ['arm_right()', 'drop()', 'arm_left()', 'wait()'])] },
        { moTa: 'Mỗi lệnh một nhịp riêng (chậm hơn nhưng vẫn đúng)', hamCuaEmMoi: [H('drop_right', ['arm_right()', 'wait()', 'arm_down()', 'release()', 'wait()', 'arm_up()', 'wait()', 'arm_left()', 'wait()'])] }
      ],
      loiSai: [
        { moTa: 'Quên nâng tay trước khi xoay về: khớp kẹt, tay còn chỉ sang phải', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [H('drop_right', ['arm_right()', 'arm_down()', 'release()', 'wait()', 'arm_left()', 'wait()'])], phaiCoMa: ['tay-xoay-ket', 'lech-bong-mo'] },
        { moTa: 'Xoay nhầm sang trái: vật nằm bên trái xe', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [H('drop_right', T_DROP_LEFT)], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Thả khi tay còn nâng: vật rơi vỡ', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [H('drop_right', ['arm_right()', 'release()', 'wait()', 'arm_left()', 'wait()'])], phaiCoMa: ['vat-vo'] },
        { moTa: 'Thả xong không xoay về: tay còn chỉ sang phải', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [H('drop_right', ['arm_right()', 'arm_down()', 'release()', 'wait()', 'arm_up()', 'wait()'])], phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Xoay sang phải, hạ tay, thả, rồi nâng tay và xoay về.', 'Thả phải khi tay đã hạ, nếu không vật sẽ vỡ.']
    }),

    man({
      so: 3, ten: 'Mở lối', hang: 'lam-quen', mucTieu: 'toi-co', hamCuaEmCan: ['move', 'turn_left', 'pick_left', 'drop_right'],
      deBai: 'Xe đi lên hai ô tới ngã rẽ, nhưng một vật nằm chắn lối rẽ trái tới cờ. Dùng pick_left() và drop_right() em đã chế để dọn vật sang bên phải. Chương trình chỉ có 10 ô.',
      san: ['#####', '#####', 'Fo..#', '##.##', '##.##'],
      batDau: { x: 2, y: 4, huong: 0 },
      maMau: { chinh: [] },
      sao: { o: 26, nhip: 9 },
      nhipTheoLoiGiai: true,
      loiGiai: { chinh: L_3.slice() },
      loiGiaiKhac: {
        moTa: 'Cùng cách làm, thêm một dòng chú thích',
        baiLam: { chinh: nhieu(['# dọn vật rồi rẽ trái'], L_3) }
      },
      congThucKhac: [
        { moTa: 'Hai hàm chế bằng pick() và drop() (chậm hơn nhưng vẫn qua)',
          hamCuaEmMoi: [H('pick_left', ['arm_left()', 'pick()', 'arm_right()', 'wait()']), H('drop_right', ['arm_right()', 'drop()', 'arm_left()', 'wait()'])] },
        { moTa: 'Nhặt vật và mang theo tới cờ (nhặt xong vật không còn chiếm ô)',
          baiLam: { chinh: ['move()', 'move()', 'pick_left()', 'turn_left()', 'move()', 'move()'] } }
      ],
      loiSai: [
        { moTa: 'Không dọn vật: xe rẽ trái thì đâm vật chắn lối', baiLam: { chinh: ['move()', 'move()', 'turn_left()', 'move()', 'move()'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Dọn vật sang bên trái xe: vật vẫn nằm đúng chỗ chắn lối', baiLam: { chinh: ['move()', 'move()', 'drop_right()', 'turn_left()', 'move()', 'move()'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Quên rẽ trái sau khi dọn: xe đi thẳng đâm tường', baiLam: { chinh: ['move()', 'move()', 'pick_left()', 'drop_right()', 'move()', 'move()'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Không dùng lệnh đã chế, viết từng bước: quá 10 ô', baiLam: { chinh: ['move()', 'move()', 'arm_left()', 'arm_down()', 'grab()', 'wait()', 'arm_up()', 'arm_right()', 'wait()', 'arm_right()', 'arm_down()', 'release()', 'wait()', 'arm_up()', 'arm_left()', 'wait()'] }, phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['Vật nằm bên trái xe, mà bên phải xe còn trống: nhặt bên trái, đặt sang bên phải.', 'Xe chỉ rẽ trái được khi ô bên trái đã trống.']
    }),

    /* ------------------------------------------------------------ hàng 2: luyện */
    man({
      so: 4, ten: 'Nhặt phải, đặt trái', hang: 'luyen', taoHam: ['pick_right', 'drop_left'],
      deBai: 'Một vật nằm bên phải xe, cần sang ô bên trái xe. Chương trình chính gọi pick_right() rồi drop_left(): em tự chế cả hai lệnh. Xong, tay chỉ về phía trước như xe mờ.',
      veMaMau: 'Chương trình chính bị khóa: pick_right() rồi drop_left(). Mở Xưởng hàm, tạo hai hàm đó rồi bấm Chạy.',
      san: ['.....', '.....', '.....', '...o.', '.....'],
      batDau: { x: 2, y: 3, huong: 0 },
      bongMo: { x: 2, y: 3, huong: 0, vat: [{ x: 1, y: 3 }] },
      chinhCoDinh: true,
      maMau: { chinh: C_4.slice() },
      sao: { o: 16, nhip: 4 },
      loiGiai: { chinh: C_4.slice(), hamCuaEmMoi: [H('pick_right', T_PICK_RIGHT), H('drop_left', T_DROP_LEFT)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_4.slice() },
        hamCuaEmMoi: [H('pick_right', nhieu(['# nhặt vật bên phải'], T_PICK_RIGHT)), H('drop_left', T_DROP_LEFT)]
      },
      congThucKhac: [
        { moTa: 'Dùng pick() và drop() của em (chậm hơn hai nhịp)', hamCuaEmMoi: [H('pick_right', ['arm_right()', 'pick()', 'arm_left()', 'wait()']), H('drop_left', ['arm_left()', 'drop()', 'arm_right()', 'wait()'])] },
        { moTa: 'Mỗi lệnh một nhịp riêng (chậm hơn nhưng vẫn đúng)', hamCuaEmMoi: [H('pick_right', ['arm_right()', 'wait()', 'arm_down()', 'grab()', 'wait()', 'arm_up()', 'wait()', 'arm_left()', 'wait()']), H('drop_left', T_DROP_LEFT)] }
      ],
      loiSai: [
        { moTa: 'Nhặt nhầm bên trái: tay kẹp vào ô trống, vật bên phải còn nằm đó', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [H('pick_right', T_PICK_LEFT), H('drop_left', T_DROP_LEFT)], phaiCoMa: ['kep-hut', 'lech-bong-mo'] },
        { moTa: 'Đặt nhầm sang phải: vật đặt lại ô cũ', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [H('pick_right', T_PICK_RIGHT), H('drop_left', T_DROP_RIGHT)], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'drop_left() quên nâng tay trước khi xoay về: khớp kẹt', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [H('pick_right', T_PICK_RIGHT), H('drop_left', ['arm_left()', 'arm_down()', 'release()', 'wait()', 'arm_right()', 'wait()'])], phaiCoMa: ['tay-xoay-ket', 'lech-bong-mo'] },
        { moTa: 'Mới chế pick_right(): gọi drop_left() mà chưa chế hàm', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [H('pick_right', T_PICK_RIGHT)], phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['pick_right() giống pick_left() nhưng xoay sang phải; drop_left() giống drop_right() nhưng xoay sang trái.', 'Mỗi hàm đều kết thúc bằng tay chỉ về phía trước.']
    }),

    man({
      so: 5, ten: 'Đổi chỗ hai bên', hang: 'luyen', hamCuaEmCan: ['pick', 'drop', 'pick_left', 'pick_right', 'drop_left', 'drop_right'], taoHam: ['swap_sides'],
      deBai: 'Vật đỏ nằm bên trái xe, vật xanh dương nằm bên phải xe, ô trước mặt còn trống. Chế lệnh swap_sides() để hai vật đổi chỗ cho nhau. Mỗi hàm chỉ có 10 ô, nên hãy dùng các lệnh em đã chế.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi swap_sides(). Mở Xưởng hàm, tạo swap_sides() rồi bấm Chạy.',
      san: ['.....', '.....', '.....', '.o.o.', '.....'],
      vatMau: ['.....', '.....', '.....', '.r.b.', '.....'],
      batDau: { x: 2, y: 3, huong: 0 },
      bongMo: { x: 2, y: 3, huong: 0, vat: [{ x: 1, y: 3, mau: 'blue' }, { x: 3, y: 3, mau: 'red' }] },
      chinhCoDinh: true,
      maMau: { chinh: C_5.slice() },
      sao: { o: 45, nhip: 12 },
      loiGiai: { chinh: C_5.slice(), hamCuaEmMoi: [H('swap_sides', T_SWAP_SIDES)] },
      loiGiaiKhac: {
        moTa: 'Gói hai lệnh đầu vào hàm stash_left() (swap_sides() chỉ còn 5 dòng, cùng số nhịp, nhiều ô hơn)',
        baiLam: { chinh: C_5.slice() },
        hamCuaEmMoi: [H('stash_left', ['pick_left()', 'drop()']), H('swap_sides', ['stash_left()', 'pick_right()', 'drop_left()', 'pick()', 'drop_right()'])]
      },
      congThucKhac: [
        { moTa: 'Cất vật xanh dương ra trước mặt trước, rồi chuyển vật đỏ sang phải, vật xanh về trái', hamCuaEmMoi: [H('swap_sides', ['pick_right()', 'drop()', 'pick_left()', 'drop_right()', 'pick()', 'drop_left()'])] }
      ],
      loiSai: [
        { moTa: 'Chỉ chuyển vật đỏ sang phải: ô bên phải đã có vật xanh nên không đặt được', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [H('swap_sides', ['pick_left()', 'drop_right()'])], phaiCoMa: ['tha-bi-chan', 'lech-bong-mo'] },
        { moTa: 'Cất vật đỏ ra trước mặt rồi thôi: hai vật chưa đổi chỗ', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [H('swap_sides', ['pick_left()', 'drop()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Không dùng hàm đã chế, viết từng bước: quá 10 ô', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [H('swap_sides', ['arm_left()', 'arm_down()', 'grab()', 'wait()', 'arm_up()', 'arm_right()', 'wait()', 'arm_down()', 'release()', 'wait()', 'arm_up()', 'arm_right()', 'wait()', 'arm_down()', 'grab()', 'wait()'])], phaiCoMa: ['tran-khung'] },
        { moTa: 'Quên đưa vật đỏ từ trước mặt sang phải: vật đỏ nằm giữa', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [H('swap_sides', ['pick_left()', 'drop()', 'pick_right()', 'drop_left()'])], phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Hai vật bị kẹt hai bên, nên cần ô trước mặt làm chỗ cất tạm.', 'Cất vật bên trái ra trước mặt, chuyển vật bên phải sang trái, rồi đưa vật ở trước mặt sang phải.']
    }),

    man({
      so: 6, ten: 'Phân loại', hang: 'luyen', hamCuaEmCan: ['pick', 'move', 'drop_left', 'drop_right'], taoHam: ['sort_two'],
      deBai: 'Bốn vật đỏ và xanh dương nằm nối nhau ở phía trước xe. Chương trình chính gọi sort_two() hai lần. Chế lệnh sort_two(): vật đỏ sang trái, vật xanh dương sang phải, mỗi vật xong thì xe tiến một ô.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có hai dòng gọi sort_two(). Mở Xưởng hàm, tạo sort_two() rồi bấm Chạy.',
      san: ['.....', '..o..', '..o..', '..o..', '..o..', '.....'],
      vatMau: ['.....', '..b..', '..r..', '..b..', '..r..', '.....'],
      batDau: { x: 2, y: 5, huong: 0 },
      bongMo: { x: 2, y: 1, huong: 0, vat: [{ x: 1, y: 5, mau: 'red' }, { x: 3, y: 4, mau: 'blue' }, { x: 1, y: 3, mau: 'red' }, { x: 3, y: 2, mau: 'blue' }] },
      chinhCoDinh: true,
      maMau: { chinh: C_6.slice() },
      sao: { o: 30, nhip: 20 },
      nhipTheoLoiGiai: true, khongDoBFS: true,                                           // bốn vật: BFS đầy đủ không chạy nổi (xem do-duong-tay-xoay.mjs); sao.nhip theo lời giải
      loiGiai: { chinh: C_6.slice(), hamCuaEmMoi: [H('sort_two', T_SORT_TWO)] },
      loiGiaiKhac: {
        moTa: 'Gói việc của mỗi vật vào hàm sort_one(), sort_two() chỉ gọi nó hai lần (cùng số nhịp, nhiều ô hơn)',
        baiLam: { chinh: C_6.slice() },
        hamCuaEmMoi: [H('sort_left', ['pick()', 'drop_left()', 'move()']), H('sort_two', ['sort_left()', 'pick()', 'drop_right()', 'move()'])]
      },
      congThucKhac: [
        { moTa: 'Viết thẳng lệnh tay và gộp việc nâng tay vào nhịp tiến lên (nhanh hơn)', hamCuaEmMoi: [H('sort_two', ['pick()', 'arm_left()', 'drop()', 'arm_right()', 'wait()', 'move()', 'pick()', 'drop_right()', 'move()'])] }
      ],
      loiSai: [
        { moTa: 'Đặt cả hai vật sang trái: vật xanh dương nằm sai bên', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [H('sort_two', ['pick()', 'drop_left()', 'move()', 'pick()', 'drop_left()', 'move()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quên tiến lên giữa hai vật: tay kẹp vào ô trống', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [H('sort_two', ['pick()', 'drop_left()', 'pick()', 'drop_right()', 'move()'])], phaiCoMa: ['kep-hut', 'lech-bong-mo'] },
        { moTa: 'Đặt vật sang phải trước rồi sang trái: hai bên đổi chỗ', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [H('sort_two', ['pick()', 'drop_right()', 'move()', 'pick()', 'drop_left()', 'move()'])], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Gọi sort_two() mà chưa chế hàm', baiLam: { chinh: C_6.slice() }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Mỗi lần gọi sort_two() xử lý hai vật: một sang trái, một sang phải, và xe tiến hai ô.', 'Em đã có pick(), drop_left(), drop_right() và move().']
    }),

    /* ------------------------------------------------------------ hàng 3: biến thể */
    man({
      so: 7, ten: 'Đường về', hang: 'bien-the',
      deBai: 'Hàm lift_left() của màn nhặt vật bên trái và để tay đang cầm. Viết thân hàm put_back() để đặt vật về đúng chỗ cũ bên trái rồi đưa tay về phía trước, như xe mờ.',
      veMaMau: 'Chương trình chính bị khóa: lift_left() rồi put_back(). Hàm lift_left() cũng bị khóa, em chỉ xem được thân hàm. Thân hàm put_back() đang chỉ có dòng pass, nghĩa là chưa làm gì: em viết lệnh thay cho nó.',
      san: ['.....', '.....', '.....', '.o...', '.....'],
      batDau: { x: 2, y: 3, huong: 0 },
      bongMo: { x: 2, y: 3, huong: 0, vat: [{ x: 1, y: 3 }] },
      chinhCoDinh: true, khoaHamMan: ['lift_left'],
      maMau: { chinh: C_7.slice(), hamCuaMan: [H('lift_left', T_LIFT_LEFT), H('put_back', T_PUT_BACK_TRONG)] },
      sao: { o: 14, nhip: 4 },
      loiGiai: { chinh: C_7.slice(), hamCuaMan: [H('lift_left', T_LIFT_LEFT), H('put_back', T_PUT_BACK)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách viết, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_7.slice(), hamCuaMan: [H('lift_left', T_LIFT_LEFT), H('put_back', nhieu(['# làm ngược lại lift_left()'], T_PUT_BACK))] }
      },
      congThucKhac: [
        { moTa: 'Mỗi lệnh một nhịp riêng (chậm hơn nhưng vẫn đúng)', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('lift_left', T_LIFT_LEFT), H('put_back', ['arm_down()', 'wait()', 'release()', 'wait()', 'arm_up()', 'wait()', 'arm_right()', 'wait()'])] } },
        { moTa: 'Gọi drop() của em: thả rồi nâng tay, xoay về ở nhịp kế', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('lift_left', T_LIFT_LEFT), H('put_back', ['drop()', 'arm_right()', 'wait()'])] } }
      ],
      loiSai: [
        { moTa: 'Để nguyên thân pass: xe còn cầm vật, tay chỉ sang trái', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('lift_left', T_LIFT_LEFT), H('put_back', T_PUT_BACK_TRONG)] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Đảo ngược nguyên từng dòng, nâng tay chung nhịp với thả: vật rơi vỡ', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('lift_left', T_LIFT_LEFT), H('put_back', ['wait()', 'arm_down()', 'wait()', 'release()', 'arm_up()', 'arm_right()', 'wait()'])] }, phaiCoMa: ['vat-vo'] },
        { moTa: 'Quên xoay tay về: tay còn chỉ sang trái', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('lift_left', T_LIFT_LEFT), H('put_back', ['arm_down()', 'release()', 'wait()', 'arm_up()', 'wait()'])] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Xoay thêm sang trái thay vì về phía trước: khớp đã hết nấc', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('lift_left', T_LIFT_LEFT), H('put_back', ['arm_down()', 'release()', 'wait()', 'arm_up()', 'arm_left()', 'wait()'])] }, phaiCoMa: ['xoay-het-nac', 'lech-bong-mo'] },
        { moTa: 'Xóa mất hàm put_back() của màn: lệnh gọi nó không còn hàm nào', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('lift_left', T_LIFT_LEFT)] }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Làm ngược lại lift_left() từng bước, theo thứ tự ngược. Mỗi lệnh có một lệnh ngược: xoay trái thì xoay phải, kẹp thì mở.',
        'Thả vật phải khi tay đang hạ. Nâng tay và thả không chạy chung một nhịp được.']
    }),

    man({
      so: 8, ten: 'Khớp lắp ngược', hang: 'bien-the',
      daoChieu: ['xoay'], canhBao: 'Dây khớp xoay đấu ngược',
      deBai: 'Dây khớp xoay bị đấu ngược nên hai hàm fixed_pick_left() và fixed_drop_right() của màn chạy sai. Sửa chúng để chuyển vật từ trái sang phải như vật mờ.',
      veMaMau: 'Chương trình chính bị khóa: nhặt bên trái rồi đặt sang phải. Hai hàm của màn đang giống pick_left() và drop_right() cũ. Thử chúng trong sân thử của Xưởng hàm để xem tay xoay về phía nào.',
      san: ['.....', '.....', '.....', '.o...', '.....'],
      batDau: { x: 2, y: 3, huong: 0 },
      bongMo: { x: 2, y: 3, huong: 0, vat: [{ x: 3, y: 3 }] },
      chinhCoDinh: true,
      maMau: { chinh: C_8.slice(), hamCuaMan: [H('fixed_pick_left', T_PICK_LEFT), H('fixed_drop_right', T_DROP_RIGHT)] },
      sao: { o: 16, nhip: 4 },
      loiGiai: { chinh: C_8.slice(), hamCuaMan: [H('fixed_pick_left', T_PICK_RIGHT), H('fixed_drop_right', T_DROP_LEFT)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách sửa, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_8.slice(), hamCuaMan: [H('fixed_pick_left', nhieu(['# khớp đấu ngược'], T_PICK_RIGHT)), H('fixed_drop_right', T_DROP_LEFT)] }
      },
      congThucKhac: [
        { moTa: 'Dùng pick() và drop() của em (chậm hơn hai nhịp)', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('fixed_pick_left', ['arm_right()', 'pick()', 'arm_left()', 'wait()']), H('fixed_drop_right', ['arm_left()', 'drop()', 'arm_right()', 'wait()'])] } },
        { moTa: 'Mỗi lệnh một nhịp riêng (chậm hơn nhưng vẫn đúng)', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('fixed_pick_left', ['arm_right()', 'wait()', 'arm_down()', 'grab()', 'wait()', 'arm_up()', 'wait()', 'arm_left()', 'wait()']), H('fixed_drop_right', T_DROP_LEFT)] } }
      ],
      loiSai: [
        { moTa: 'Để nguyên hai hàm của màn (còn là pick_left() và drop_right() cũ): tay xoay ngược nên kẹp hụt', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('fixed_pick_left', T_PICK_LEFT), H('fixed_drop_right', T_DROP_RIGHT)] }, phaiCoMa: ['kep-hut', 'lech-bong-mo'] },
        { moTa: 'Chỉ sửa fixed_pick_left(): fixed_drop_right() vẫn xoay ngược, vật đặt lại chỗ cũ', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('fixed_pick_left', T_PICK_RIGHT), H('fixed_drop_right', T_DROP_RIGHT)] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Sửa thiếu một chỗ: xoay về mà quên đổi lệnh, khớp hết nấc', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('fixed_pick_left', ['arm_right()', 'arm_down()', 'grab()', 'wait()', 'arm_up()', 'arm_right()', 'wait()']), H('fixed_drop_right', T_DROP_LEFT)] }, phaiCoMa: ['xoay-het-nac', 'lech-bong-mo'] },
        { moTa: 'Xóa mất hai hàm của màn: lệnh gọi chúng không còn hàm nào', baiLam: { chinh: C_8.slice() }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Thử arm_left() ở sân thử của Xưởng hàm: tay xoay về phía nào?', 'Muốn tay xoay sang trái thì phải ra lệnh arm_right(), và ngược lại.']
    }),

    man({
      so: 9, ten: 'Khớp kẹt cứng', hang: 'bien-the', hamGoc: KHAY_KET,
      phanCung: KHAY_KET, canhBao: 'Khớp xoay kẹt cứng',
      deBai: 'Khớp xoay kẹt cứng, tay chỉ còn nhìn về phía trước. Hai hàm side_pick() và side_drop() của màn dùng khớp nên không chạy được. Viết lại chúng bằng cách quay cả xe để chuyển vật từ trái sang phải.',
      veMaMau: 'Chương trình chính bị khóa: side_pick() rồi side_drop(). Hai hàm của màn đang dùng khớp xoay, mà khớp đã hỏng. Chạy thử để xem chẩn đoán.',
      san: ['.....', '.....', '.....', '.o...', '.....'],
      batDau: { x: 2, y: 3, huong: 0 },
      bongMo: { x: 2, y: 3, huong: 0, vat: [{ x: 3, y: 3 }] },
      chinhCoDinh: true,
      maMau: { chinh: C_9.slice(), hamCuaMan: [H('side_pick', T_PICK_LEFT), H('side_drop', T_DROP_RIGHT)] },
      sao: { o: 22, nhip: 8 },
      nhipTheoLoiGiai: true,
      loiGiai: { chinh: C_9.slice(), hamCuaMan: [H('side_pick', ['turn_left()', 'pick()', 'turn_right()']), H('side_drop', ['turn_right()', 'drop()', 'turn_left()'])] },
      loiGiaiKhac: {
        moTa: 'Cùng cách sửa, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_9.slice(), hamCuaMan: [H('side_pick', nhieu(['# quay xe thay cho khớp'], ['turn_left()', 'pick()', 'turn_right()'])), H('side_drop', ['turn_right()', 'drop()', 'turn_left()'])] }
      },
      congThucKhac: [
        { moTa: 'Viết thẳng lệnh tay và gộp việc nâng tay vào nhịp quay xe (nhanh hơn)', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('side_pick', ['turn_left()', 'arm_down()', 'grab()', 'wait()', 'arm_up()', 'turn_right()']), H('side_drop', ['turn_right()', 'arm_down()', 'release()', 'wait()', 'arm_up()', 'turn_left()'])] } },
        { moTa: 'Quay đầu xe một lần giữa hai việc thay vì quay về rồi quay đi', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('side_pick', ['turn_left()', 'pick()', 'u_turn()']), H('side_drop', ['drop()', 'turn_left()'])] } }
      ],
      loiSai: [
        { moTa: 'Không sửa gì: hai hàm vẫn gọi khớp đã hỏng', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('side_pick', T_PICK_LEFT), H('side_drop', T_DROP_RIGHT)] }, phaiCoMa: ['lenh-goc-hong'] },
        { moTa: 'Mới sửa side_pick(), side_drop() còn dùng khớp', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('side_pick', ['turn_left()', 'pick()', 'turn_right()']), H('side_drop', T_DROP_RIGHT)] }, phaiCoMa: ['lenh-goc-hong'] },
        { moTa: 'Quay nhầm sang phải để nhặt: tay kẹp vào ô trống', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('side_pick', ['turn_right()', 'pick()', 'turn_left()']), H('side_drop', ['turn_right()', 'drop()', 'turn_left()'])] }, phaiCoMa: ['kep-hut', 'lech-bong-mo'] },
        { moTa: 'side_drop() quên quay về: xe quay mặt sang phải', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('side_pick', ['turn_left()', 'pick()', 'turn_right()']), H('side_drop', ['turn_right()', 'drop()'])] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Xóa mất hai hàm của màn: lệnh gọi chúng không còn hàm nào', baiLam: { chinh: C_9.slice() }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Khớp không xoay được nữa, nhưng pick() và drop() vẫn làm việc ở ô trước mặt. Muốn ô bên trái thành ô trước mặt thì xe phải làm gì?', 'Làm xong nhớ quay xe về như cũ.']
    }),

    /* ------------------------------------------------------------ trùm */
    man({
      so: 10, ten: 'Kho hai bên', hang: 'trum', hamCuaEmCan: ['move', 'swap_sides', 'sort_two'],
      huyHieu: { ma: 'che-tay-xoay', ten: 'Huy hiệu Chế lệnh tay xoay' },
      gioiHanHam: 3,
      deBai: 'Vật đỏ bên trái xe và vật xanh dương bên phải xe cần đổi chỗ, rồi phía trước còn bốn vật xếp thẳng hàng, đỏ xanh xen kẽ. Đổi chỗ hai vật, sau đó xếp vật đỏ sang trái, vật xanh dương sang phải. Chương trình chính chỉ được gọi 3 hàm của em khác nhau.',
      san: ['..o..', '..o..', '..o..', '..o..', '.....', '.....', '.o.o.'],
      vatMau: ['..b..', '..r..', '..b..', '..r..', '.....', '.....', '.r.b.'],
      batDau: { x: 2, y: 6, huong: 0 },
      bongMo: { x: 2, y: 0, huong: 0, vat: [{ x: 1, y: 6, mau: 'blue' }, { x: 3, y: 6, mau: 'red' }, { x: 1, y: 4, mau: 'red' }, { x: 3, y: 3, mau: 'blue' }, { x: 1, y: 2, mau: 'red' }, { x: 3, y: 1, mau: 'blue' }] },
      maMau: { chinh: [] },
      sao: { o: 58, nhip: 34 },
      nhipTheoLoiGiai: true, khongDoBFS: true,                                           // sáu vật: BFS đầy đủ không chạy nổi (xem do-duong-tay-xoay.mjs); sao.nhip theo lời giải
      loiGiai: { chinh: L_10.slice() },
      loiGiaiKhac: {
        moTa: 'Cùng cách làm, thêm một dòng chú thích',
        baiLam: { chinh: nhieu(['# đổi chỗ, lên hai ô, phân loại'], L_10) }
      },
      congThucKhac: [
        { moTa: 'Chế swap_sides() theo thứ tự khác: cất vật xanh dương ra trước mặt trước', hamCuaEmMoi: [H('swap_sides', ['pick_right()', 'drop()', 'pick_left()', 'drop_right()', 'pick()', 'drop_left()'])] }
      ],
      loiSai: [
        { moTa: 'Bỏ việc đổi chỗ: hai vật bên hông còn nguyên', baiLam: { chinh: ['move()', 'move()', 'sort_two()', 'sort_two()'] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quên lên hai ô trước khi phân loại: tay kẹp vào ô trống', baiLam: { chinh: ['swap_sides()', 'sort_two()', 'sort_two()'] }, phaiCoMa: ['kep-hut', 'lech-bong-mo'] },
        { moTa: 'Gọi thêm pick() và drop() trực tiếp: vượt giới hạn 3 hàm', baiLam: { chinh: ['swap_sides()', 'move()', 'move()', 'pick()', 'sort_two()', 'drop()'] }, phaiCoMa: ['qua-gioi-han-ham'] },
        { moTa: 'Chỉ phân loại một lần: hai vật cuối còn nằm giữa hành lang', baiLam: { chinh: ['swap_sides()', 'move()', 'move()', 'sort_two()'] }, phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Đổi chỗ trước khi đi: swap_sides() cần ô trước mặt trống.', 'sort_two() xử lý hai vật rồi tiến hai ô, nên hai lần gọi là đủ bốn vật.']
    })
  ];

  ManHoc.them(DS);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();
