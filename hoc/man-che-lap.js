/* ============================================================================
   man-che-lap.js — "Đường học": CHƯƠNG `che-lap` · CHẾ LỆNH CÓ for (10 màn). Kế hoạch "Chế lệnh" 14/10 (KE-HOACH-CHE-LENH.md, mục 5.2).
   Chương thứ 7 (sau Vòng lặp, trước Cảm biến khoảng cách). Robot là XE HAI BÁNH, cauTruc ['for']: người chơi đã học `for i in range(n):` ở chương vong-lap
   và ở đây dùng nó TRONG THÂN HÀM tự chế. Chỉ dùng hàm của em từ các chương xuong-ham, che-xe, tay-gap, vong-lap (KHÔNG dùng hàm của che-tay).
   Khuôn như che-xe: mục tiêu 'bong-mo' (xe mờ + ô ◆), chương trình chính khóa (`chinhCoDinh`) ở màn chế lệnh, mỗi lệnh chế được ít nhất hai cách
   (`congThucKhac`), màn "dùng" (3 và 10) tự viết chương trình chính. Hướng: 0 lên, 1 phải, 2 xuống, 3 trái. (x, y) với y = 0 ở hàng trên.

   Hàm của em MỚI (tên cốt truyện, khóa trong kho):
     che-lap.1 dash()        = for i in range(4): move()                          chạy thẳng bốn ô
     che-lap.2 square()      = for i in range(4): corner()                        một vòng vuông cạnh hai ô, về đúng chỗ + hướng cũ
     che-lap.4 zigzag()      = for i in range(3): stair()                         lên ba bậc chéo phải, giữ hướng
     che-lap.5 sweep()       = for i in range(3): pick(), move(), turn_right(), drop(), turn_left()   dời ba vật thẳng hàng sang cột bên phải
     che-lap.6 ring()        = for i in range(4): { for j in range(3): move() ; turn_right() }       vòng vuông cạnh ba ô (for lồng)
   HÀM CỦA MÀN (15/10: hàm chỉ đúng cho MỘT màn thì không vào kho, người chơi tự viết / sửa thân trong màn; `maMau.hamCuaMan`, không `taoHam`, không có trong Sổ lệnh):
     che-lap.7 come_home()   thân ban đầu `pass`; lời giải for i in range(2): { turn_left() ; for j in range(4): back() }   đi ngược lại go_round(): CÙNG số lần lặp, đảo thứ tự, mỗi lệnh thành lệnh ngược
     che-lap.8 go_far()      range(5) sai một; sửa thành range(4)
     che-lap.9 reverse_run() thân ban đầu = for i in range(6): move() (xe chỉ còn số lùi nên báo hỏng); lời giải for i in range(6): back()   lùi sáu ô
   Màn 3 và 10 không chế hàm mới.

   VÌ SAO CÓ for MỚI ĐƯỢC SAO Ô (canFor, như chương vong-lap): viết không dùng for thì (a) 'mat-sao': vẫn thắng nhưng nhiều ô hơn sao.o nên tụt dưới 3 sao, hay
   (b) 'tran-khung': thân hàm vượt khung 10 ô nên không chạy. kiem-che-lap.mjs tự trải for của lời giải để chứng minh từng màn.

   ĐƯỜNG NGẮN NHẤT: sao.nhip = BFS trên PHẦN CỨNG (do-duong-che-lap.mjs; xe bánh có cả bánh lùi và quay đầu một nhịp), nên sân là HÀNH LANG ở nơi cần ép (3, 4, 7)
   và là sân trống ở nơi đường vòng đã là ngắn nhất (1, 2, 6, 8, 9, 10). Không lời giải nào dùng u_turn (u_turn của em đổi từ 2 nhịp sang 1 nhịp ở che-xe.5,
   nên kho cũ và kho thật khác nhau ở u_turn). Riêng 5 "Dọn hàng": tay gắp chạy theo cách chuẩn pick() / drop() (2 nhịp mỗi lần) nên sao.nhip lấy theo lời giải chuẩn
   (nhipTheoLoiGiai), BFS chỉ cần ≤ sao.nhip.
   Nối tiếp man-chuoi-1.js vào cùng window.ManHoc. Thứ tự chương: thu-tu-chuong.js.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var BANH_DU = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var BANH_TAY = BANH_DU.concat(['arm_down', 'arm_up', 'grab', 'release']);       // màn 5: xe có thêm tay kẹp
  var BANH_LUI = ['left_back', 'right_back', 'wait'];                              // màn 9: hộp số chỉ còn số lùi

  function H(ten, than) { return { ten: ten, thamSo: [], than: than.slice() }; }
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  function lap(s, n) { var kq = []; for (var i = 0; i < n; i++) kq.push(s); return kq; }
  /** Vòng for: dòng đầu rồi thân thụt 4 dấu cách. bien: tên biến lặp (mặc định i). */
  function FOR(n, than, bien) {
    return ['for ' + (bien || 'i') + ' in range(' + n + '):'].concat(than.map(function (s) { return '    ' + s; }));
  }

  // thân các hàm chế (cách 1)
  var T_DASH = FOR(4, ['move()']);
  var T_SQUARE = FOR(4, ['corner()']);
  var T_ZIGZAG = FOR(3, ['stair()']);
  var T_SWEEP = FOR(3, ['pick()', 'move()', 'turn_right()', 'drop()', 'turn_left()']);
  var T_RING = FOR(4, nhieu(FOR(3, ['move()'], 'j'), ['turn_right()']));
  var T_COME_HOME = FOR(2, nhieu(['turn_left()'], FOR(4, ['back()'], 'j')));
  var T_REVERSE_RUN = FOR(6, ['back()']);
  var T_REVERSE_RUN_TIEN = FOR(6, ['move()']);                // thân ban đầu của reverse_run() ở 7.9: bản đi tiến, xe chỉ còn số lùi nên báo hỏng
  var T_COME_HOME_TRONG = ['pass'];                          // thân ban đầu của come_home() ở 7.7: chưa làm gì (lõi hiểu pass), người chơi viết thay nó
  // hàm của màn 7 (khóa): đi hết hành lang chữ L bằng hai vòng for lồng nhau
  var T_GO_ROUND = FOR(2, nhieu(FOR(4, ['move()'], 'j'), ['turn_right()']));
  // hàm của màn 8 (bản sai và bản đúng): lên N ô, rẽ phải, đi hai ô
  function tGoFar(n) { return nhieu(FOR(n, ['move()']), ['turn_right()'], FOR(2, ['move()'])); }

  // chương trình chính khóa của từng màn (maMau.chinh)
  var C_1 = ['dash()'];
  var C_2 = ['square()'];
  var C_4 = ['zigzag()'];
  var C_5 = ['sweep()'];
  var C_6 = ['ring()'];
  var C_7 = ['go_round()', 'come_home()'];
  var C_8 = ['go_far()'];
  var C_9 = ['reverse_run()'];
  // màn người chơi tự viết chương trình chính
  var L_3 = ['dash()', 'turn_right()', 'dash()', 'square()'];
  var L_10 = nhieu(FOR(2, ['dash()', 'turn_right()', 'row()', 'turn_right()']));

  /** Điền các trường chung của chương (không đụng tới trường màn đã khai). */
  function man(m) {
    m.chuong = 'che-lap';
    m.loaiRobot = 'banh';
    m.robot = { than: 'hai-banh', tay: m.coTay ? 'kep' : null, camBien: [] };
    delete m.coTay;
    m.hamGoc = m.hamGoc || BANH_DU;
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    m.cauTruc = ['for'];
    m.mucTieu = 'bong-mo';
    return ManHoc.chuanHoa(m);
  }

  var DS = [
    /* ------------------------------------------------------------ hàng 1: làm quen */
    man({
      so: 1, ten: 'Chạy nước rút', hang: 'lam-quen', canFor: 'mat-sao',
      hamCuaEmCan: ['move'], taoHam: ['dash'],
      deBai: 'Bóng mờ nằm thẳng phía trước, cách xe bốn ô. Chương trình chính chỉ gọi dash(): em tự chế lệnh này để xe chạy một mạch tới bóng mờ.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi dash(). Mở Xưởng hàm, tạo dash() rồi bấm Chạy.',
      san: ['.....', '.....', '.....', '.....', '.....', '.....'],
      batDau: { x: 2, y: 5, huong: 0 },
      bongMo: { x: 2, y: 1, huong: 0 },
      chinhCoDinh: true,
      maMau: { chinh: C_1.slice() },
      sao: { o: 6, nhip: 4 },
      loiGiai: { chinh: C_1.slice(), hamCuaEmMoi: [H('dash', T_DASH)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_1.slice() },
        hamCuaEmMoi: [H('dash', nhieu(['# chạy bốn ô'], T_DASH))]
      },
      congThucKhac: [
        { moTa: 'Không dùng for: gọi move() bốn lần (thắng nhưng nhiều ô hơn, dưới 3 sao)', hamCuaEmMoi: [H('dash', lap('move()', 4))] },
        { moTa: 'Vòng for hai lần, mỗi lần hai move()', hamCuaEmMoi: [H('dash', FOR(2, ['move()', 'move()']))] },
        { moTa: 'Vòng for viết thẳng lệnh bánh, không gọi hàm nào', hamCuaEmMoi: [H('dash', FOR(4, ['left_move()', 'right_move()', 'wait()']))] }
      ],
      loiSai: [
        { moTa: 'Lặp thiếu một lần: range(3)', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [H('dash', FOR(3, ['move()']))], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Lặp dư một lần: range(5)', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [H('dash', FOR(5, ['move()']))], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Dòng move() không thụt lề vào thân vòng lặp', baiLam: { chinh: C_1.slice() }, hamCuaEmMoi: [H('dash', ['for i in range(4):', 'move()'])], phaiCoMa: ['loi-cu-phap'] },
        { moTa: 'Gọi dash() mà chưa chế hàm', baiLam: { chinh: C_1.slice() }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Bốn ô là bốn lần move(), mà em chỉ muốn viết move() một lần.', 'Vòng for lặp các dòng thụt vào bên dưới nó đúng bằng số trong range().']
    }),

    man({
      so: 2, ten: 'Vòng vuông', hang: 'lam-quen', canFor: 'mat-sao',
      hamCuaEmCan: ['corner'], taoHam: ['square'],
      deBai: 'Xe đứng ở một góc sân. Chế lệnh square() để xe đi một vòng vuông, ghé qua ba điểm ◆ rồi về đúng chỗ cũ, mặt quay như bóng mờ.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi square(). Mở Xưởng hàm, tạo square() rồi bấm Chạy.',
      san: ['.....', '.....', '.....', '.....', '.....'],
      batDau: { x: 1, y: 3, huong: 0 },
      bongMo: { x: 1, y: 3, huong: 0, diQua: [{ x: 1, y: 1 }, { x: 3, y: 1 }, { x: 3, y: 3 }] },
      chinhCoDinh: true,
      maMau: { chinh: C_2.slice() },
      sao: { o: 11, nhip: 12 },
      loiGiai: { chinh: C_2.slice(), hamCuaEmMoi: [H('square', T_SQUARE)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_2.slice() },
        hamCuaEmMoi: [H('square', nhieu(['# đi bốn góc'], T_SQUARE))]
      },
      congThucKhac: [
        { moTa: 'Không dùng for: gọi corner() bốn lần (thắng nhưng nhiều ô hơn, dưới 3 sao)', hamCuaEmMoi: [H('square', lap('corner()', 4))] },
        { moTa: 'Vòng for viết thẳng move() và turn_right(), không gọi corner()', hamCuaEmMoi: [H('square', FOR(4, ['move()', 'move()', 'turn_right()']))] },
        { moTa: 'Vòng for hai lần, mỗi lần hai corner()', hamCuaEmMoi: [H('square', FOR(2, ['corner()', 'corner()']))] }
      ],
      loiSai: [
        { moTa: 'Chỉ lặp ba góc: xe dừng ở góc thứ ba, chưa về chỗ cũ', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [H('square', FOR(3, ['corner()']))], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Vòng lặp quên rẽ: xe đi thẳng đâm tường', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [H('square', FOR(4, ['move()', 'move()']))], phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Dòng corner() không thụt lề vào thân vòng lặp', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [H('square', ['for i in range(4):', 'corner()'])], phaiCoMa: ['loi-cu-phap'] },
        { moTa: 'Lặp năm lần: xe đi thừa một góc', baiLam: { chinh: C_2.slice() }, hamCuaEmMoi: [H('square', FOR(5, ['corner()']))], phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Mỗi cạnh của vòng vuông là đi hai ô rồi rẽ phải, em đã có corner() làm đúng việc đó.', 'Một vòng vuông có mấy cạnh?']
    }),

    man({
      so: 3, ten: 'Tuần tra', hang: 'lam-quen', canFor: 'mat-sao',
      hamCuaEmCan: ['dash', 'square', 'turn_right'],
      deBai: 'Xe tuần tra: đi hết hành lang rồi vòng quanh khu kệ ở cuối, ghé qua ba điểm ◆. Dùng dash() và square() em đã chế để viết chương trình; chỉ có 10 ô.',
      san: ['...##', '.#.##', '...##', '.####', '.####', '.####', '.....'],
      batDau: { x: 4, y: 6, huong: 3 },
      bongMo: { x: 0, y: 2, huong: 0, diQua: [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 2 }] },
      maMau: { chinh: [] },
      sao: { o: 16, nhip: 21 },
      loiGiai: { chinh: L_3.slice() },
      loiGiaiKhac: {
        moTa: 'Cùng đường đi, thêm một dòng chú thích',
        baiLam: { chinh: nhieu(['# đi tuần'], L_3) }
      },
      congThucKhac: [
        { moTa: 'Không dùng dash() và square(): vòng for viết thẳng move(), turn_right() (vẫn vừa 10 ô)',
          baiLam: { chinh: nhieu(FOR(4, ['move()']), ['turn_right()'], FOR(4, ['move()']), FOR(4, ['move()', 'move()', 'turn_right()'])) }, hamCuaEmMoi: [] },
        { moTa: 'Dùng dash() cho hai đoạn thẳng, vòng quanh khu kệ bằng corner()',
          baiLam: { chinh: nhieu(['dash()', 'turn_right()', 'dash()'], FOR(4, ['corner()'])) }, hamCuaEmMoi: [] }
      ],
      loiSai: [
        { moTa: 'Rẽ nhầm sang trái: xe đâm tường hành lang', baiLam: { chinh: ['dash()', 'turn_left()', 'dash()', 'square()'] }, phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Bỏ qua khu kệ: tới đúng chỗ nhưng chưa ghé qua ba điểm ◆', baiLam: { chinh: ['dash()', 'turn_right()', 'dash()'] }, phaiCoMa: ['chua-qua-diem'] },
        { moTa: 'Gọi square() ngay từ chỗ xuất phát: xe đâm tường', baiLam: { chinh: ['square()'] }, phaiCoMa: ['dam-tuong', 'chua-qua-diem'] },
        { moTa: 'Không dùng dash() và square(), viết từng bước: quá 10 ô',
          baiLam: { chinh: ['move()', 'move()', 'move()', 'move()', 'turn_right()', 'move()', 'move()', 'move()', 'move()', 'corner()', 'corner()', 'corner()', 'corner()'] }, phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['Hành lang có hai đoạn thẳng, mỗi đoạn dài bốn ô, nối nhau bằng một chỗ rẽ phải.', 'Khu kệ ở cuối là một vòng vuông: xe đi một vòng rồi trở lại đúng chỗ vào.']
    }),

    /* ------------------------------------------------------------ hàng 2: luyện */
    man({
      so: 4, ten: 'Bậc chéo', hang: 'luyen', canFor: 'mat-sao',
      hamCuaEmCan: ['stair'], taoHam: ['zigzag'],
      deBai: 'Cầu thang dẫn lên ba bậc chéo, mỗi bậc là một ô lên rồi một ô sang phải. Chế lệnh zigzag() để xe lên hết cầu thang, mặt vẫn quay lên như bóng mờ.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi zigzag(). Mở Xưởng hàm, tạo zigzag() rồi bấm Chạy.',
      san: ['##..', '#..#', '..##', '.###'],
      batDau: { x: 0, y: 3, huong: 0 },
      bongMo: { x: 3, y: 0, huong: 0 },
      chinhCoDinh: true,
      maMau: { chinh: C_4.slice() },
      sao: { o: 14, nhip: 12 },
      loiGiai: { chinh: C_4.slice(), hamCuaEmMoi: [H('zigzag', T_ZIGZAG)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_4.slice() },
        hamCuaEmMoi: [H('zigzag', nhieu(['# lên ba bậc'], T_ZIGZAG))]
      },
      congThucKhac: [
        { moTa: 'Không dùng for: gọi stair() ba lần (thắng nhưng nhiều ô hơn, dưới 3 sao)', hamCuaEmMoi: [H('zigzag', lap('stair()', 3))] },
        { moTa: 'Mỗi bậc là move() rồi dodge_right() (cũng bốn nhịp mỗi bậc, vẫn tới)', hamCuaEmMoi: [H('zigzag', FOR(3, ['move()', 'dodge_right()']))] },
        { moTa: 'Vòng for viết thẳng move() và các lệnh quay, không gọi stair()', hamCuaEmMoi: [H('zigzag', FOR(3, ['move()', 'turn_right()', 'move()', 'turn_left()']))] }
      ],
      loiSai: [
        { moTa: 'Lặp hai bậc: xe dừng giữa cầu thang', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [H('zigzag', FOR(2, ['stair()']))], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Mỗi vòng chỉ đi thẳng move(): xe lên một ô rồi đâm tường', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [H('zigzag', FOR(3, ['move()']))], phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Rẽ ngược mỗi bậc: xe sang trái, đâm tường', baiLam: { chinh: C_4.slice() }, hamCuaEmMoi: [H('zigzag', FOR(3, ['move()', 'turn_left()', 'move()', 'turn_right()']))], phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Gọi zigzag() mà chưa chế hàm', baiLam: { chinh: C_4.slice() }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Em đã chế stair() cho đúng một bậc.', 'Ba bậc giống hệt nhau thì không cần viết ba lần.']
    }),

    man({
      so: 5, ten: 'Dọn hàng', hang: 'luyen', canFor: 'tran-khung', nhipTheoLoiGiai: true, coTay: true, hamGoc: BANH_TAY,
      hamCuaEmCan: ['pick', 'drop', 'move', 'turn_right', 'turn_left'], taoHam: ['sweep'],
      deBai: 'Ba thùng hàng xếp thẳng hàng ngay trước mặt xe. Chế lệnh sweep() để dời mỗi thùng sang ô bên phải nó, xe đứng cuối hàng như bóng mờ.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi sweep(). Mở Xưởng hàm, tạo sweep() rồi bấm Chạy.',
      san: ['.....', '..o..', '..o..', '..o..', '.....'],
      batDau: { x: 2, y: 4, huong: 0 },
      bongMo: { x: 2, y: 1, huong: 0, vat: [{ x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }] },
      chinhCoDinh: true,
      maMau: { chinh: C_5.slice() },
      sao: { o: 24, nhip: 21 },
      loiGiai: { chinh: C_5.slice(), hamCuaEmMoi: [H('sweep', T_SWEEP)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_5.slice() },
        hamCuaEmMoi: [H('sweep', nhieu(['# dời ba thùng'], T_SWEEP))]
      },
      congThucKhac: [
        { moTa: 'Gói việc của một thùng vào hàm one_box() rồi lặp ba lần (thêm một hàm, nhiều ô hơn)',
          hamCuaEmMoi: [H('sweep', FOR(3, ['one_box()'])), H('one_box', ['pick()', 'move()', 'turn_right()', 'drop()', 'turn_left()'])] },
        { moTa: 'Đổi tên biến lặp thành k',
          hamCuaEmMoi: [H('sweep', FOR(3, ['pick()', 'move()', 'turn_right()', 'drop()', 'turn_left()'], 'k'))] }
      ],
      loiSai: [
        { moTa: 'Lặp hai thùng: thùng cuối còn nguyên chỗ cũ', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [H('sweep', FOR(2, ['pick()', 'move()', 'turn_right()', 'drop()', 'turn_left()']))], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quên quay lại sau khi thả: xe mặt hướng sang phải, không nhặt được thùng kế', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [H('sweep', FOR(3, ['pick()', 'move()', 'turn_right()', 'drop()']))], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Thả khi tay còn nâng: thùng rơi vỡ', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [H('sweep', FOR(3, ['pick()', 'move()', 'turn_right()', 'release()', 'wait()', 'turn_left()']))], phaiCoMa: ['vat-vo'] },
        { moTa: 'Không dùng for: viết ba lần ngay trong hàm, quá 10 ô', baiLam: { chinh: C_5.slice() }, hamCuaEmMoi: [H('sweep', nhieu(['pick()', 'move()', 'turn_right()', 'drop()', 'turn_left()'], ['pick()', 'move()', 'turn_right()', 'drop()', 'turn_left()'], ['pick()', 'move()', 'turn_right()', 'drop()', 'turn_left()']))], phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['Làm xong một thùng thì xe phải đứng sao cho thùng kế tiếp nằm ngay trước mặt.', 'Ba thùng cần đúng một việc lặp lại ba lần, mà thân hàm chỉ có 10 ô.']
    }),

    man({
      so: 6, ten: 'Vòng lồng', hang: 'luyen', canFor: 'tran-khung',
      hamCuaEmCan: ['move', 'turn_right'], taoHam: ['ring'],
      deBai: 'Xe chạy một vòng vuông lớn, mỗi cạnh ba ô, ghé qua ba điểm ◆ rồi về chỗ cũ. Chế lệnh ring() với một vòng for nằm trong một vòng for khác.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi ring(). Mở Xưởng hàm, tạo ring() rồi bấm Chạy.',
      san: ['.....', '.....', '.....', '.....'],
      batDau: { x: 1, y: 3, huong: 0 },
      bongMo: { x: 1, y: 3, huong: 0, diQua: [{ x: 1, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 3 }] },
      chinhCoDinh: true,
      maMau: { chinh: C_6.slice() },
      sao: { o: 10, nhip: 16 },
      loiGiai: { chinh: C_6.slice(), hamCuaEmMoi: [H('ring', T_RING)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách chế, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_6.slice() },
        hamCuaEmMoi: [H('ring', nhieu(['# bốn cạnh, mỗi cạnh ba ô'], T_RING))]
      },
      congThucKhac: [
        { moTa: 'Mỗi cạnh gọi side() em đã chế ở chương trước (thêm thân hàm side nên nhiều ô hơn, dưới 3 sao)', hamCuaEmMoi: [H('ring', FOR(4, ['side()', 'turn_right()']))] },
        { moTa: 'Vòng ngoài viết move() ba lần thay cho vòng trong', hamCuaEmMoi: [H('ring', FOR(4, ['move()', 'move()', 'move()', 'turn_right()']))] },
        { moTa: 'Vòng ngoài đi một ô rồi corner() (hai ô và rẽ phải)', hamCuaEmMoi: [H('ring', FOR(4, ['move()', 'corner()']))] }
      ],
      loiSai: [
        { moTa: 'Vòng ngoài lặp ba lần: xe dừng ở góc thứ ba', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [H('ring', FOR(3, nhieu(FOR(3, ['move()'], 'j'), ['turn_right()'])))], phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Vòng trong lặp hai lần: cạnh ngắn hơn, bỏ lỡ điểm ◆', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [H('ring', FOR(4, nhieu(FOR(2, ['move()'], 'j'), ['turn_right()'])))], phaiCoMa: ['chua-qua-diem'] },
        { moTa: 'Quên rẽ: xe đi thẳng đâm tường', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [H('ring', FOR(4, FOR(3, ['move()'], 'j')))], phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Dòng turn_right() thụt vào vòng trong: xe rẽ sau mỗi bước', baiLam: { chinh: C_6.slice() }, hamCuaEmMoi: [H('ring', FOR(4, FOR(3, ['move()', 'turn_right()'], 'j')))], phaiCoMa: ['chua-qua-diem'] }
      ],
      goiY: ['Cạnh ba ô cũng là một việc lặp lại, nằm trong việc lặp lại bốn cạnh.', 'Vòng trong thụt vào thêm một bậc so với vòng ngoài.']
    }),

    /* ------------------------------------------------------------ hàng 3: biến thể */
    man({
      so: 7, ten: 'Đường về vòng lặp', hang: 'bien-the', canFor: 'mat-sao',
      hamCuaEmCan: ['move', 'turn_right', 'turn_left', 'back'],
      deBai: 'Hàm go_round() của màn đưa xe đi hết hành lang chữ L. Viết thân hàm come_home() của màn để xe về đúng chỗ cũ và đúng hướng cũ, như bóng mờ.',
      veMaMau: 'Chương trình chính bị khóa: go_round() rồi come_home(). Thân hàm go_round() cũng bị khóa, em chỉ xem được. Thân hàm come_home() đang chỉ có dòng pass, nghĩa là chưa làm gì: em viết lệnh thay cho nó.',
      san: ['.....', '.####', '.####', '.####', '.####'],
      batDau: { x: 0, y: 4, huong: 0 },
      bongMo: { x: 0, y: 4, huong: 0 },
      chinhCoDinh: true, khoaHamMan: ['go_round'],
      maMau: { chinh: C_7.slice(), hamCuaMan: [H('go_round', T_GO_ROUND), H('come_home', T_COME_HOME_TRONG)] },
      sao: { o: 20, nhip: 20 },
      loiGiai: { chinh: C_7.slice(), hamCuaMan: [H('go_round', T_GO_ROUND), H('come_home', T_COME_HOME)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách viết, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_7.slice(), hamCuaMan: [H('go_round', T_GO_ROUND), H('come_home', nhieu(['# đi ngược lại go_round()'], T_COME_HOME))] }
      },
      congThucKhac: [
        { moTa: 'Vòng trong viết thẳng lệnh lùi của hai bánh thay cho back() (ít ô hơn nhưng cùng nhịp)',
          baiLam: { chinh: C_7.slice(), hamCuaMan: [H('go_round', T_GO_ROUND), H('come_home', FOR(2, nhieu(['turn_left()'], FOR(4, ['left_back()', 'right_back()', 'wait()'], 'j'))))] } },
        { moTa: 'Đi tiến thay vì lùi: rẽ phải, đi bốn ô, rẽ trái, đi bốn ô, quay đầu (chậm hơn một nhịp, ít sao hơn)',
          baiLam: { chinh: C_7.slice(), hamCuaMan: [H('go_round', T_GO_ROUND), H('come_home', nhieu(['turn_right()'], FOR(4, ['move()']), ['turn_left()'], FOR(4, ['move()']), ['u_turn()']))] } }
      ],
      loiSai: [
        { moTa: 'Để nguyên thân pass: xe không làm gì thêm, đứng lại chỗ go_round() dừng', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('go_round', T_GO_ROUND), H('come_home', T_COME_HOME_TRONG)] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Không đảo thứ tự: lùi bốn ô trước rồi mới quay', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('go_round', T_GO_ROUND), H('come_home', FOR(2, nhieu(FOR(4, ['back()'], 'j'), ['turn_left()'])))] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quên đổi move() thành lệnh ngược: đi tiếp thay vì lùi, đâm tường', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('go_round', T_GO_ROUND), H('come_home', FOR(2, nhieu(['turn_left()'], FOR(4, ['move()'], 'j'))))] }, phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Quên đổi turn_right() thành lệnh ngược turn_left()', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('go_round', T_GO_ROUND), H('come_home', FOR(2, nhieu(['turn_right()'], FOR(4, ['back()'], 'j'))))] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Lặp một lần thay vì hai: xe mới về giữa đường', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('go_round', T_GO_ROUND), H('come_home', FOR(1, nhieu(['turn_left()'], FOR(4, ['back()'], 'j'))))] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Xóa mất hàm come_home() của màn: lệnh gọi nó không còn hàm nào', baiLam: { chinh: C_7.slice(), hamCuaMan: [H('go_round', T_GO_ROUND)] }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Lặp đúng số lần như go_round(), nhưng làm từng bước theo thứ tự ngược lại.', 'Mỗi lệnh có một lệnh ngược: tiến thì lùi, quay phải thì quay trái.']
    }),

    man({
      so: 8, ten: 'Lệch một', hang: 'bien-the', canFor: 'mat-sao',
      hamCuaEmCan: ['move', 'turn_right'],
      deBai: 'Hàm go_far() của màn phải đưa xe lên bốn ô, rẽ phải rồi đi hai ô tới bóng mờ. Chạy thử, xem xe lệch ở đâu rồi sửa go_far().',
      veMaMau: 'Chương trình chính bị khóa, chỉ gọi go_far(). Thân hàm go_far() thì em sửa được.',
      san: ['.....', '.....', '.....', '.....', '.....', '.....'],
      batDau: { x: 0, y: 5, huong: 0 },
      bongMo: { x: 2, y: 1, huong: 1 },
      chinhCoDinh: true,
      maMau: { chinh: C_8.slice(), hamCuaMan: [H('go_far', tGoFar(5))] },
      sao: { o: 11, nhip: 7 },
      loiGiai: { chinh: C_8.slice(), hamCuaMan: [H('go_far', tGoFar(4))] },
      loiGiaiKhac: {
        moTa: 'Cùng cách sửa, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_8.slice(), hamCuaMan: [H('go_far', nhieu(['# lên bốn ô, rẽ phải, hai ô'], tGoFar(4)))] }
      },
      congThucKhac: [
        { moTa: 'Bỏ vòng for, viết move() từng lần (thắng nhưng nhiều ô hơn, dưới 3 sao)',
          baiLam: { chinh: C_8.slice(), hamCuaMan: [H('go_far', nhieu(lap('move()', 4), ['turn_right()'], lap('move()', 2)))] }, hamCuaEmMoi: [] },
        { moTa: 'Giữ range(5) nhưng lùi lại một ô sau vòng lặp (chậm hơn một nhịp)',
          baiLam: { chinh: C_8.slice(), hamCuaMan: [H('go_far', nhieu(FOR(5, ['move()']), ['back()', 'turn_right()'], FOR(2, ['move()'])))] }, hamCuaEmMoi: [] }
      ],
      loiSai: [
        { moTa: 'Không sửa gì: vòng đầu lặp năm lần nên xe lên quá một ô', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('go_far', tGoFar(5))] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Sửa quá tay: range(3)', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('go_far', tGoFar(3))] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Sửa nhầm vòng thứ hai: range(1)', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('go_far', nhieu(FOR(5, ['move()']), ['turn_right()'], FOR(1, ['move()'])))] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Dòng turn_right() thụt vào vòng lặp đầu: xe rẽ sau mỗi bước', baiLam: { chinh: C_8.slice(), hamCuaMan: [H('go_far', nhieu(FOR(4, ['move()', 'turn_right()']), FOR(2, ['move()'])))] }, phaiCoMa: ['lech-bong-mo'] }
      ],
      goiY: ['Xe dừng lệch về phía nào, lệch mấy ô?', 'Đếm lại các số trong range(): mỗi vòng lặp cho xe đi đúng chừng đó ô.']
    }),

    man({
      so: 9, ten: 'Số lùi đường dài', hang: 'bien-the', canFor: 'mat-sao', hamGoc: BANH_LUI,
      hamCuaEmCan: ['back'],
      phanCung: BANH_LUI, canhBao: 'Xe chỉ còn số lùi',
      deBai: 'Hộp số của xe kẹt, chỉ còn lệnh lùi. Bóng mờ nằm cách xe sáu ô ở phía sau. Hàm reverse_run() của màn đang cho xe tiến nên chạy không được: sửa nó để xe lùi một mạch tới bóng mờ.',
      veMaMau: 'Chương trình chính bị khóa, chỉ có một dòng gọi reverse_run(). Thân hàm reverse_run() của màn đang là vòng lặp với move(). Chạy thử để xem hàm báo gì rồi sửa.',
      san: ['.......', '.......', '.......'],
      batDau: { x: 6, y: 1, huong: 1 },
      bongMo: { x: 0, y: 1, huong: 1 },
      chinhCoDinh: true,
      maMau: { chinh: C_9.slice(), hamCuaMan: [H('reverse_run', T_REVERSE_RUN_TIEN)] },
      sao: { o: 6, nhip: 6 },
      loiGiai: { chinh: C_9.slice(), hamCuaMan: [H('reverse_run', T_REVERSE_RUN)] },
      loiGiaiKhac: {
        moTa: 'Cùng cách sửa, thêm một dòng chú thích trong hàm',
        baiLam: { chinh: C_9.slice(), hamCuaMan: [H('reverse_run', nhieu(['# lùi sáu ô'], T_REVERSE_RUN))] }
      },
      congThucKhac: [
        { moTa: 'Không dùng for: gọi back() sáu lần (thắng nhưng nhiều ô hơn, dưới 3 sao)', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('reverse_run', lap('back()', 6))] } },
        { moTa: 'Vòng for ba lần, mỗi lần hai back()', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('reverse_run', FOR(3, ['back()', 'back()']))] } },
        { moTa: 'Vòng for viết thẳng lệnh lùi của hai bánh', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('reverse_run', FOR(6, ['left_back()', 'right_back()', 'wait()']))] } }
      ],
      loiSai: [
        { moTa: 'Để nguyên thân cũ (vòng lặp với move()): bánh tiến đã hỏng', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('reverse_run', T_REVERSE_RUN_TIEN)] }, phaiCoMa: ['lenh-goc-hong'] },
        { moTa: 'Lặp thiếu một lần: range(5)', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('reverse_run', FOR(5, ['back()']))] }, phaiCoMa: ['lech-bong-mo'] },
        { moTa: 'Quên wait() trong thân vòng lặp: lệnh bánh dính sang nhịp kế', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('reverse_run', FOR(6, ['left_back()', 'right_back()']))] }, phaiCoMa: ['banh-goi-lai', 'lech-bong-mo'] },
        { moTa: 'Dòng back() không thụt lề vào thân vòng lặp', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('reverse_run', ['for i in range(6):', 'back()'])] }, phaiCoMa: ['loi-cu-phap'] }
      ],
      goiY: ['Thử move() trong sân thử của Xưởng hàm: bánh tiến đã hỏng, báo gì?', 'Lùi một ô em đã có back(); sáu ô thì sao?']
    }),

    /* ------------------------------------------------------------ trùm */
    man({
      so: 10, ten: 'Tuần tra kho', hang: 'trum', canFor: 'mat-sao',
      hamCuaEmCan: ['dash', 'row', 'turn_right'], gioiHanHam: 3,
      huyHieu: { ma: 'che-lap', ten: 'Huy hiệu Chế lệnh có for' },
      deBai: 'Xe tuần tra một vòng quanh kho: hai cạnh ngắn, hai cạnh dài, ghé qua các điểm ◆ rồi về chỗ xuất phát. Chương trình chính chỉ được gọi tối đa ba lệnh khác nhau của em.',
      san: ['.......', '..###..', '..###..', '..###..', '.......'],
      batDau: { x: 0, y: 4, huong: 0 },
      bongMo: { x: 0, y: 4, huong: 0, diQua: [{ x: 0, y: 0 }, { x: 3, y: 0 }, { x: 6, y: 0 }, { x: 6, y: 4 }, { x: 3, y: 4 }] },
      maMau: { chinh: [] },
      sao: { o: 14, nhip: 24 },
      loiGiai: { chinh: L_10.slice() },
      loiGiaiKhac: {
        moTa: 'Cùng đường đi, thêm một dòng chú thích',
        baiLam: { chinh: nhieu(['# một vòng quanh kho'], L_10) }
      },
      congThucKhac: [
        { moTa: 'Hai vòng for lồng nhau viết thẳng move() và turn_right(), không gọi dash() hay row()',
          baiLam: { chinh: FOR(2, nhieu(FOR(4, ['move()'], 'j'), ['turn_right()'], FOR(6, ['move()'], 'j'), ['turn_right()'])) }, hamCuaEmMoi: [] },
        { moTa: 'Không dùng for ở chương trình chính: gọi tám lệnh liền nhau (nhiều ô hơn, dưới 3 sao)',
          baiLam: { chinh: nhieu(['dash()', 'turn_right()', 'row()', 'turn_right()'], ['dash()', 'turn_right()', 'row()', 'turn_right()']) }, hamCuaEmMoi: [] }
      ],
      loiSai: [
        { moTa: 'Gọi bốn lệnh khác nhau của em (thêm corner()): quá giới hạn ba lệnh', baiLam: { chinh: nhieu(FOR(2, ['dash()', 'turn_right()', 'row()', 'turn_right()']), ['corner()']) }, phaiCoMa: ['qua-gioi-han-ham'] },
        { moTa: 'Chỉ đi nửa vòng rồi dừng: chưa ghé hết các điểm ◆', baiLam: { chinh: ['dash()', 'turn_right()', 'row()', 'turn_right()'] }, phaiCoMa: ['chua-qua-diem', 'lech-bong-mo'] },
        { moTa: 'Đảo hai cạnh: cạnh dài đi trước, xe đâm tường', baiLam: { chinh: FOR(2, ['row()', 'turn_right()', 'dash()', 'turn_right()']) }, phaiCoMa: ['dam-tuong', 'lech-bong-mo'] },
        { moTa: 'Không dùng lệnh đã chế, viết từng bước: quá 10 ô', baiLam: { chinh: nhieu(lap('move()', 4), ['turn_right()'], lap('move()', 6), ['turn_right()'], lap('move()', 4), ['turn_right()'], lap('move()', 6), ['turn_right()']) }, phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['Một vòng quanh kho là hai cạnh ngắn và hai cạnh dài xen kẽ, mỗi chỗ rẽ là một lần rẽ phải.', 'Cụm "cạnh ngắn, rẽ, cạnh dài, rẽ" lặp lại hai lần.']
    })
  ];

  ManHoc.them(DS);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();
