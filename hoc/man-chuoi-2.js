/* ============================================================================
   man-chuoi-2.js — "Đường học": CHUỖI 2 · XƯỞNG HÀM (10 màn).
   Chương trình 10 ô; mỗi hàm một khung riêng 10 ô (dòng def không tốn ô).
   Hàm gốc như chuỗi 1. Xưởng hàm mở (moXuong true); không giới hạn số hàm theo màn.

   Hai loại hàm:
   - HÀM CỦA EM (bền): học sinh tạo một lần ở Xưởng, lưu vào kho (kho-ham.js), có trên
     khay ở mọi màn sau. Dữ liệu màn khai: hamCuaEmCan (kho phải có sẵn khi tới màn),
     taoHam (màn học sinh lần đầu tạo), loiGiai.hamCuaEmMoi (hàm tạo / sửa ở màn).
   - HÀM CỦA MÀN (tạm): màn cho sẵn để dạy (2.1: move() chỉ để gọi; 2.8: step_right()
     bị lỗi để sửa), chỉ sống trong màn, nằm ở maMau.hamCuaMan.
   Trùm 2.10 chỉ là màn tổng hợp: thắng thì nhận huy hiệu (huyHieu), không mở khóa gì.

   Nối tiếp man-chuoi-1.js vào cùng window.ManHoc.

   Sân dựng thành HÀNH LANG (mọi ô ngoài đường đi là tường) để không có đường tắt;
   máy kiểm dò bằng BFS (xem kiem-hoc.mjs).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var HAM_GOC = ['left_move', 'right_move', 'wait'];

  // thân các hàm cơ bản (mức thụt lề 0)
  var T_MOVE = ['left_move()', 'right_move()', 'wait()'];
  var T_RIGHT = ['left_move()', 'wait()'];
  var T_LEFT = ['right_move()', 'wait()'];
  function H(ten, than) { return { ten: ten, thamSo: [], than: than.slice() }; }
  function hMove() { return H('move', T_MOVE); }
  function hRight() { return H('turn_right', T_RIGHT); }
  function hLeft() { return H('turn_left', T_LEFT); }
  function lap(s, n) { var kq = []; for (var i = 0; i < n; i++) kq.push(s); return kq; }
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }

  function man(m) {
    m.loaiRobot = 'banh'; m.hamGoc = HAM_GOC;
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = Object.assign({ chinh: 10, moiHam: 10 }, m.khung || {});
    return ManHoc.chuanHoa(m);
  }

  var CHINH_22 = ['move()', 'move()', 'left_move()', 'wait()', 'move()', 'move()'];
  var CHINH_24 = nhieu(lap('move()', 2), ['turn_right()'], lap('move()', 2), ['turn_right()'], lap('move()', 2));
  var CHINH_25 = nhieu(lap('move()', 3), ['turn_left()'], lap('move()', 2), ['turn_left()'], ['move()']);
  var CHINH_27 = ['u_turn()', 'move()', 'move()', 'move()', 'turn_left()', 'move()'];
  var CHINH_28 = ['move()', 'move()', 'step_right()', 'move()', 'step_right()'];

  var DS = [
    /* ------------------------------------------------ hàng 1: thiếu chỗ thật */
    man({
      id: '2.1', ten: 'Gọi hàm', hang: 'lam-quen',
      deBai: 'Cờ cách xe bốn ô. Viết tay bốn lần "tiến một ô" là 12 dòng, quá 10 ô. Màn này cho sẵn hàm move(), chỉ việc gọi nó.',
      san: ['..F..', '.....', '.....', '.....', '.....'],
      batDau: { x: 2, y: 4, huong: 0 },
      maMau: { chinh: [], hamCuaMan: [hMove()] },
      sao: { o: 7, nhip: 4 },
      loiGiai: { chinh: lap('move()', 4), hamCuaMan: [hMove()] },
      loiGiaiKhac: {
        moTa: 'Gọi move() ba lần, ô cuối viết tay',
        baiLam: { chinh: nhieu(lap('move()', 3), T_MOVE), hamCuaMan: [hMove()] }
      },
      loiSai: [
        { moTa: 'Không dùng hàm, viết tay cả bốn lần: 12 dòng', baiLam: { chinh: nhieu(T_MOVE, T_MOVE, T_MOVE, T_MOVE), hamCuaMan: [hMove()] },
          phaiCoMa: ['tran-khung'] },
        { moTa: 'Gọi sai tên hàm', baiLam: { chinh: ['mov()', 'move()', 'move()', 'move()'], hamCuaMan: [hMove()] },
          phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Gọi hàm là viết tên hàm kèm cặp ngoặc, mỗi lần gọi chiếm một dòng.']
    }),

    man({
      id: '2.2', ten: 'Tạo hàm move', hang: 'lam-quen', taoHam: ['move'],
      deBai: 'Chương trình đã gọi move() sẵn, nhưng em chưa có hàm move(). Mở Xưởng hàm, tạo hàm move() và viết thân hàm: "tiến một ô".',
      san: ['.....', '...F.', '.....', '.....', '.....'],
      batDau: { x: 1, y: 3, huong: 0 },
      maMau: { chinh: CHINH_22.slice() },
      sao: { o: 9, nhip: 5 },
      loiGiai: { chinh: CHINH_22.slice(), hamCuaEmMoi: [hMove()] },
      loiGiaiKhac: {
        moTa: 'Thân hàm có thêm dòng chú thích',
        baiLam: { chinh: CHINH_22.slice() },
        hamCuaEmMoi: [H('move', nhieu(['# tiến một ô'], T_MOVE))]
      },
      loiSai: [
        { moTa: 'Thân hàm quên wait()', baiLam: { chinh: CHINH_22.slice() }, hamCuaEmMoi: [H('move', ['left_move()', 'right_move()'])],
          phaiCoMa: ['banh-goi-lai', 'quen-wait', 'chua-toi-co'] },
        { moTa: 'Hàm chưa có dòng nào trong thân', baiLam: { chinh: CHINH_22.slice() }, hamCuaEmMoi: [H('move', [])],
          phaiCoMa: ['loi-cu-phap'] },
        { moTa: 'Chưa tạo hàm move() mà đã gọi nó', baiLam: { chinh: CHINH_22.slice() },
          phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Thân hàm giống hệt đoạn "tiến một ô" ở chuỗi trước.', 'Mỗi nhịp kết thúc bằng wait().']
    }),

    man({
      id: '2.3', ten: 'Dùng move của em', hang: 'lam-quen', hamCuaEmCan: ['move'],
      deBai: 'Hàm move() của em đã nằm sẵn trên khay. Dùng nó để xe đi lên ba ô, rẽ phải, đi tiếp hai ô.',
      san: ['.....', '..F..', '.....', '.....', '.....'],
      batDau: { x: 0, y: 4, huong: 0 },
      maMau: { chinh: [] },
      sao: { o: 10, nhip: 6 },
      loiGiai: { chinh: nhieu(lap('move()', 3), T_RIGHT, lap('move()', 2)) },
      loiGiaiKhac: {
        moTa: 'Ô đầu tiên viết tay, các ô sau gọi move()',
        baiLam: { chinh: nhieu(T_MOVE, lap('move()', 2), T_RIGHT, lap('move()', 2)) }
      },
      loiSai: [
        { moTa: 'Hàm move() của em quên wait()', baiLam: { chinh: nhieu(lap('move()', 3), T_RIGHT, lap('move()', 2)) },
          hamCuaEmMoi: [H('move', ['left_move()', 'right_move()'])], phaiCoMa: ['banh-goi-lai', 'quen-wait'] },
        { moTa: 'Gọi sai tên hàm', baiLam: { chinh: nhieu(['mov()'], lap('move()', 2), T_RIGHT, lap('move()', 2)) },
          phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Không dùng hàm: viết tay hết', baiLam: { chinh: nhieu(T_MOVE, T_MOVE, T_MOVE, T_RIGHT, T_MOVE, T_MOVE) },
          phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['Hàm của em nằm trên khay, gọi như hàm có sẵn.', 'Gọi cả hàm chỉ tốn một dòng chương trình.']
    }),

    /* ------------------------------------------------------------- hàng 2 */
    man({
      id: '2.4', ten: 'Tạo hàm rẽ phải', hang: 'luyen', hamCuaEmCan: ['move'], taoHam: ['turn_right'],
      deBai: 'Tạo thêm hàm turn_right() rồi dẫn xe đi lên hai ô, rẽ phải, đi hai ô, rẽ phải, đi hai ô.',
      san: ['#####', '#...#', '#.#.#', '#.#F#', '#####'],
      batDau: { x: 1, y: 3, huong: 0 },
      maMau: { chinh: [] },
      sao: { o: 13, nhip: 8 },
      loiGiai: { chinh: CHINH_24.slice(), hamCuaEmMoi: [hRight()] },
      loiGiaiKhac: {
        moTa: 'Một chỗ rẽ gọi hàm, chỗ kia viết tay',
        baiLam: { chinh: nhieu(lap('move()', 2), ['turn_right()'], lap('move()', 2), T_RIGHT, lap('move()', 2)) },
        hamCuaEmMoi: [hRight()]
      },
      loiSai: [
        { moTa: 'turn_right() viết bằng bánh phải: xe rẽ trái, đâm tường',
          baiLam: { chinh: CHINH_24.slice() }, hamCuaEmMoi: [H('turn_right', T_LEFT)],
          phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Gọi turn_right() mà chưa tạo hàm',
          baiLam: { chinh: CHINH_24.slice() },
          phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Rẽ phải ở chuỗi 1 chỉ cần hai dòng.', 'Đặt tên hàm đúng như tên bạn gọi trong chương trình.']
    }),

    man({
      id: '2.5', ten: 'Tạo hàm rẽ trái', hang: 'luyen', hamCuaEmCan: ['move'], taoHam: ['turn_left'],
      deBai: 'Tương tự màn trước nhưng rẽ trái. Tạo hàm turn_left() rồi dùng nó: đi lên ba ô, rẽ trái, đi hai ô, rẽ trái, đi một ô.',
      san: ['#####', '#...#', '#F#.#', '###.#', '###.#'],
      batDau: { x: 3, y: 4, huong: 0 },
      maMau: { chinh: [] },
      sao: { o: 13, nhip: 8 },
      loiGiai: { chinh: CHINH_25.slice(), hamCuaEmMoi: [hLeft()] },
      loiGiaiKhac: {
        moTa: 'Một chỗ rẽ gọi hàm, chỗ kia viết tay',
        baiLam: { chinh: nhieu(lap('move()', 3), ['turn_left()'], lap('move()', 2), T_LEFT, ['move()']) },
        hamCuaEmMoi: [hLeft()]
      },
      loiSai: [
        { moTa: 'turn_left() viết bằng bánh trái: xe rẽ nhầm sang phải',
          baiLam: { chinh: CHINH_25.slice() }, hamCuaEmMoi: [H('turn_left', T_RIGHT)],
          phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Gọi turn_left() mà chưa tạo hàm',
          baiLam: { chinh: CHINH_25.slice() },
          phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Rẽ trái và rẽ phải khác nhau ở bánh nào được quay.']
    }),

    man({
      id: '2.6', ten: 'Bậc thang', hang: 'luyen', hamCuaEmCan: ['move', 'turn_right', 'turn_left'],
      deBai: 'Xe leo một cầu thang hẹp: đi, rẽ phải, đi, rẽ trái, ... Chương trình chỉ có 10 ô: lấy các hàm trong kho của em ra dùng.',
      san: ['#####', '##F##', '#..##', '..###', '.####'],
      batDau: { x: 0, y: 4, huong: 0 },
      maMau: { chinh: [] },
      sao: { o: 16, nhip: 9 },
      loiGiai: {
        chinh: ['move()', 'turn_right()', 'move()', 'turn_left()', 'move()', 'turn_right()', 'move()', 'turn_left()', 'move()']
      },
      loiGiaiKhac: {
        moTa: 'Cùng đường đi, thêm một dòng chú thích',
        baiLam: {
          chinh: ['# leo cầu thang', 'move()', 'turn_right()', 'move()', 'turn_left()', 'move()', 'turn_right()', 'move()', 'turn_left()', 'move()']
        }
      },
      loiSai: [
        { moTa: 'Rẽ phải mãi: xe đâm tường chứ không leo lên',
          baiLam: { chinh: ['move()', 'turn_right()', 'move()', 'turn_right()', 'move()', 'turn_right()', 'move()', 'turn_right()', 'move()'] },
          phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Rẽ trái viết tay thay vì gọi turn_left(): vượt 10 ô',
          baiLam: { chinh: ['move()', 'turn_right()', 'move()', 'right_move()', 'wait()', 'move()', 'turn_right()', 'move()', 'right_move()', 'wait()', 'move()'] },
          phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['Mỗi bậc là: đi một ô, rẽ phải, đi một ô, rẽ trái.']
    }),

    /* ------------------------------------------------------------- hàng 3 */
    man({
      id: '2.7', ten: 'Quay đầu bằng hàm', hang: 'bien-the', hamCuaEmCan: ['move', 'turn_right', 'turn_left'], taoHam: ['u_turn'],
      deBai: 'Xe đứng ở cuối ngõ cụt, cờ ở cuối lối ra. Tạo hàm u_turn() gọi turn_right() hai lần (hàm gọi hàm), rồi dùng nó.',
      san: ['#.###', '#.###', '#.###', '#.F##', '#####'],
      batDau: { x: 1, y: 0, huong: 0 },
      maMau: { chinh: [] },
      sao: { o: 15, nhip: 7 },
      loiGiai: {
        chinh: CHINH_27.slice(),
        hamCuaEmMoi: [H('u_turn', ['turn_right()', 'turn_right()'])]
      },
      loiGiaiKhac: {
        moTa: 'u_turn() có thêm dòng chú thích',
        baiLam: { chinh: CHINH_27.slice() },
        hamCuaEmMoi: [H('u_turn', ['# quay đầu', 'turn_right()', 'turn_right()'])]
      },
      loiSai: [
        { moTa: 'u_turn() quay phải rồi lại quay trái: xe không quay đầu, đâm ra ngoài',
          baiLam: { chinh: CHINH_27.slice() }, hamCuaEmMoi: [H('u_turn', ['turn_right()', 'turn_left()'])],
          phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Gọi u_turn() mà chưa tạo hàm',
          baiLam: { chinh: CHINH_27.slice() },
          phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Hai lần quay phải liền nhau thì xe quay mặt về phía nào?', 'Trong thân hàm cũng gọi được hàm khác.']
    }),

    man({
      id: '2.8', ten: 'Sửa hàm lỗi', hang: 'bien-the', hamCuaEmCan: ['move', 'turn_right', 'turn_left'],
      deBai: 'Màn cho sẵn hàm step_right() định "rẽ phải rồi đi một ô", nhưng xe cứ đi sai chỗ. Đọc kỹ thân hàm, tìm và sửa chỗ nhầm.',
      san: ['#####', '#####', '#...#', '#.#F#', '#.###'],
      batDau: { x: 1, y: 4, huong: 0 },
      maMau: {
        chinh: CHINH_28.slice(),
        hamCuaMan: [H('step_right', ['turn_left()', 'move()'])]
      },
      sao: { o: 12, nhip: 7 },
      loiGiai: {
        chinh: CHINH_28.slice(),
        hamCuaMan: [H('step_right', ['turn_right()', 'move()'])]
      },
      loiGiaiKhac: {
        moTa: 'Sửa đúng, thêm một dòng chú thích trong hàm',
        baiLam: {
          chinh: CHINH_28.slice(),
          hamCuaMan: [H('step_right', ['# rẽ phải rồi đi', 'turn_right()', 'move()'])]
        }
      },
      loiSai: [
        { moTa: 'Không sửa gì: hàm rẽ trái thay vì rẽ phải',
          baiLam: { chinh: CHINH_28.slice(), hamCuaMan: [H('step_right', ['turn_left()', 'move()'])] },
          phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Gọi hàm sai chính tả',
          baiLam: {
            chinh: ['move()', 'move()', 'step_rigth()', 'move()', 'step_right()'],
            hamCuaMan: [H('step_right', ['turn_right()', 'move()'])]
          }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Chạy thử và xem xe rẽ về phía nào ở lần gọi step_right() đầu tiên.']
    }),

    man({
      id: '2.9', ten: 'Hàm gọi hàm', hang: 'bien-the', hamCuaEmCan: ['move', 'turn_right'], taoHam: ['corner'],
      deBai: 'Gói "đi hai ô rồi rẽ phải" thành hàm corner() (trong đó gọi move() và turn_right()), rồi đi vòng ba góc tới cờ.',
      san: ['#####', '#####', '...##', '.#.##', '.#F##'],
      batDau: { x: 0, y: 4, huong: 0 },
      maMau: { chinh: [] },
      sao: { o: 11, nhip: 8 },
      loiGiai: {
        chinh: lap('corner()', 3),
        hamCuaEmMoi: [H('corner', ['move()', 'move()', 'turn_right()'])]
      },
      loiGiaiKhac: {
        moTa: 'Không gói thành hàm: gọi move() và turn_right() từng lần',
        baiLam: {
          chinh: ['move()', 'move()', 'turn_right()', 'move()', 'move()', 'turn_right()', 'move()', 'move()']
        }
      },
      loiSai: [
        { moTa: 'corner() rẽ trái thay vì rẽ phải: xe đâm tường',
          baiLam: { chinh: lap('corner()', 3) }, hamCuaEmMoi: [H('corner', nhieu(['move()', 'move()'], T_LEFT))],
          phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Gọi corner() mà trong thân hàm không có lệnh quay',
          baiLam: { chinh: lap('corner()', 3) }, hamCuaEmMoi: [H('corner', ['move()', 'move()'])],
          phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Ba góc giống hệt nhau thì chỉ cần viết một lần.']
    }),

    /* ------------------------------------------------------------- trùm */
    man({
      id: '2.10', ten: 'Cầu thang dài', hang: 'trum', hamCuaEmCan: ['move', 'turn_right', 'turn_left'], taoHam: ['stair', 'two'],
      deBai: 'Leo cầu thang sáu bậc tới cờ. Chương trình có 10 ô nhưng nếu gọi từng bậc thì vừa sát; để hàm gọi hàm sẽ gọn hơn.',
      san: ['#####.F', '####..#', '###..##', '##..###', '#..####', '..#####', '.######'],
      batDau: { x: 0, y: 6, huong: 0 },
      maMau: { chinh: [] },
      sao: { o: 16, nhip: 23 },
      huyHieu: { ma: 'xuong-ham', ten: 'Huy hiệu Xưởng hàm' },
      loiGiai: {
        chinh: lap('two()', 3),
        hamCuaEmMoi: [H('stair', ['move()', 'turn_right()', 'move()', 'turn_left()']), H('two', ['stair()', 'stair()'])]
      },
      loiGiaiKhac: {
        moTa: 'Chỉ có hàm stair(), gọi sáu lần ở chương trình',
        baiLam: { chinh: lap('stair()', 6) },
        hamCuaEmMoi: [H('stair', ['move()', 'turn_right()', 'move()', 'turn_left()'])]
      },
      loiSai: [
        { moTa: 'Không gói hàm, gọi từng lệnh: quá 10 ô',
          baiLam: { chinh: nhieu(['move()', 'turn_right()', 'move()', 'turn_left()'], ['move()', 'turn_right()', 'move()', 'turn_left()'], ['move()', 'turn_right()', 'move()', 'turn_left()']) },
          phaiCoMa: ['tran-khung'] },
        { moTa: 'stair() rẽ ngược: xe đâm tường',
          baiLam: { chinh: lap('two()', 3) },
          hamCuaEmMoi: [H('stair', ['move()', 'turn_left()', 'move()', 'turn_right()']), H('two', ['stair()', 'stair()'])],
          phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Sáu bậc là ba lần "hai bậc".']
    })
  ];

  ManHoc.them(DS);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();
