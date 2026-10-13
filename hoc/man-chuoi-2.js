/* ============================================================================
   man-chuoi-2.js — "Đường học": CHUỖI 2 · XƯỞNG HÀM (10 màn).
   Chương trình 10 ô; mỗi hàm một khung riêng 10 ô (dòng def không tốn ô).
   Hàm gốc như chuỗi 1. Thư viện của chuỗi 2 RỖNG: ở mọi màn học sinh tự tạo hàm
   (hoặc maMau cho sẵn tùy ý màn). Thắng TRÙM 2.10 thì các hàm của chuỗi vào
   thư viện (trường `moThuVien` của 2.10) cho chuỗi sau.
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
    m.loaiRobot = 'banh'; m.hamGoc = HAM_GOC; m.thuVien = [];
    m.khung = Object.assign({ chinh: 10, moiHam: 10, soHam: 1 }, m.khung || {});
    return m;
  }

  var DS = [
    /* ------------------------------------------------ hàng 1: thiếu chỗ thật */
    man({
      id: '2.1', ten: 'Gọi hàm', hang: 'lam-quen', khung: { soHam: 1 },
      deBai: 'Cờ cách xe bốn ô. Viết tay bốn lần "tiến một ô" là 12 dòng, quá 10 ô. Hàm move() đã có sẵn trong Xưởng hàm, chỉ việc gọi nó.',
      san: ['..F..', '.....', '.....', '.....', '.....'],
      batDau: { x: 2, y: 4, huong: 0 },
      maMau: { ham: [hMove()], chinh: [] },
      sao: { o: 7, nhip: 4 },
      loiGiai: { ham: [hMove()], chinh: lap('move()', 4) },
      loiGiaiKhac: {
        moTa: 'Gọi move() ba lần, ô cuối viết tay',
        baiLam: { ham: [hMove()], chinh: nhieu(lap('move()', 3), T_MOVE) }
      },
      loiSai: [
        { moTa: 'Không dùng hàm, viết tay cả bốn lần: 12 dòng', baiLam: { ham: [], chinh: nhieu(T_MOVE, T_MOVE, T_MOVE, T_MOVE) },
          phaiCoMa: ['tran-khung'] },
        { moTa: 'Gọi sai tên hàm', baiLam: { ham: [hMove()], chinh: ['mov()', 'move()', 'move()', 'move()'] },
          phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Gọi hàm là viết tên hàm kèm cặp ngoặc, mỗi lần gọi chiếm một dòng.']
    }),

    man({
      id: '2.2', ten: 'Điền thân hàm', hang: 'lam-quen', khung: { soHam: 1 },
      deBai: 'Chương trình đã gọi move() sẵn, nhưng hàm move() mới có tên. Mở Xưởng hàm, viết thân hàm: "tiến một ô".',
      san: ['.....', '...F.', '.....', '.....', '.....'],
      batDau: { x: 1, y: 3, huong: 0 },
      maMau: { ham: [H('move', [])], chinh: ['move()', 'move()', 'left_move()', 'wait()', 'move()', 'move()'] },
      sao: { o: 9, nhip: 5 },
      loiGiai: { ham: [hMove()], chinh: ['move()', 'move()', 'left_move()', 'wait()', 'move()', 'move()'] },
      loiGiaiKhac: {
        moTa: 'Thân hàm có thêm dòng chú thích',
        baiLam: { ham: [H('move', nhieu(['# tiến một ô'], T_MOVE))], chinh: ['move()', 'move()', 'left_move()', 'wait()', 'move()', 'move()'] }
      },
      loiSai: [
        { moTa: 'Thân hàm quên wait()', baiLam: { ham: [H('move', ['left_move()', 'right_move()'])], chinh: ['move()', 'move()', 'left_move()', 'wait()', 'move()', 'move()'] },
          phaiCoMa: ['banh-goi-lai', 'quen-wait', 'chua-toi-co'] },
        { moTa: 'Hàm chưa có dòng nào trong thân', baiLam: { ham: [H('move', [])], chinh: ['move()', 'move()', 'left_move()', 'wait()', 'move()', 'move()'] },
          phaiCoMa: ['loi-cu-phap'] }
      ],
      goiY: ['Thân hàm giống hệt đoạn "tiến một ô" ở chuỗi trước.', 'Mỗi nhịp kết thúc bằng wait().']
    }),

    man({
      id: '2.3', ten: 'Tự viết move', hang: 'lam-quen', khung: { soHam: 1 },
      deBai: 'Lần này Xưởng hàm trống. Tự tạo hàm move(), rồi dùng nó để xe đi lên ba ô, rẽ phải, đi tiếp hai ô.',
      san: ['.....', '..F..', '.....', '.....', '.....'],
      batDau: { x: 0, y: 4, huong: 0 },
      maMau: { ham: [], chinh: [] },
      sao: { o: 10, nhip: 6 },
      loiGiai: { ham: [hMove()], chinh: nhieu(lap('move()', 3), T_RIGHT, lap('move()', 2)) },
      loiGiaiKhac: {
        moTa: 'Ô đầu tiên viết tay, các ô sau gọi move()',
        baiLam: { ham: [hMove()], chinh: nhieu(T_MOVE, lap('move()', 2), T_RIGHT, lap('move()', 2)) }
      },
      loiSai: [
        { moTa: 'Thân hàm quên wait()', baiLam: { ham: [H('move', ['left_move()', 'right_move()'])], chinh: nhieu(lap('move()', 3), T_RIGHT, lap('move()', 2)) },
          phaiCoMa: ['banh-goi-lai', 'quen-wait'] },
        { moTa: 'Gọi move() nhưng chưa tạo hàm', baiLam: { ham: [], chinh: nhieu(lap('move()', 3), T_RIGHT, lap('move()', 2)) },
          phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Không dùng hàm: viết tay hết', baiLam: { ham: [], chinh: nhieu(T_MOVE, T_MOVE, T_MOVE, T_RIGHT, T_MOVE, T_MOVE) },
          phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['Hàm phải được tạo trong Xưởng hàm thì mới gọi được.', 'Gọi cả hàm chỉ tốn một dòng chương trình.']
    }),

    /* ------------------------------------------------------------- hàng 2 */
    man({
      id: '2.4', ten: 'Hàm rẽ phải', hang: 'luyen', khung: { soHam: 2 },
      deBai: 'move() đã có sẵn. Viết thêm hàm turn_right() rồi dẫn xe đi lên hai ô, rẽ phải, đi hai ô, rẽ phải, đi hai ô.',
      san: ['#####', '#...#', '#.#.#', '#.#F#', '#####'],
      batDau: { x: 1, y: 3, huong: 0 },
      maMau: { ham: [hMove()], chinh: [] },
      sao: { o: 13, nhip: 8 },
      loiGiai: { ham: [hMove(), hRight()], chinh: nhieu(lap('move()', 2), ['turn_right()'], lap('move()', 2), ['turn_right()'], lap('move()', 2)) },
      loiGiaiKhac: {
        moTa: 'Một chỗ rẽ gọi hàm, chỗ kia viết tay',
        baiLam: { ham: [hMove(), hRight()], chinh: nhieu(lap('move()', 2), ['turn_right()'], lap('move()', 2), T_RIGHT, lap('move()', 2)) }
      },
      loiSai: [
        { moTa: 'turn_right() viết bằng bánh phải: xe rẽ trái, đâm tường',
          baiLam: { ham: [hMove(), H('turn_right', T_LEFT)], chinh: nhieu(lap('move()', 2), ['turn_right()'], lap('move()', 2), ['turn_right()'], lap('move()', 2)) },
          phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Gọi turn_right() mà chưa tạo hàm',
          baiLam: { ham: [hMove()], chinh: nhieu(lap('move()', 2), ['turn_right()'], lap('move()', 2), ['turn_right()'], lap('move()', 2)) },
          phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Rẽ phải ở chuỗi 1 chỉ cần hai dòng.', 'Đặt tên hàm đúng như tên bạn gọi trong chương trình.']
    }),

    man({
      id: '2.5', ten: 'Hàm rẽ trái', hang: 'luyen', khung: { soHam: 2 },
      deBai: 'Tương tự màn trước nhưng rẽ trái. Viết hàm turn_left() rồi dùng nó: đi lên ba ô, rẽ trái, đi hai ô, rẽ trái, đi một ô.',
      san: ['#####', '#...#', '#F#.#', '###.#', '###.#'],
      batDau: { x: 3, y: 4, huong: 0 },
      maMau: { ham: [hMove()], chinh: [] },
      sao: { o: 13, nhip: 8 },
      loiGiai: { ham: [hMove(), hLeft()], chinh: nhieu(lap('move()', 3), ['turn_left()'], lap('move()', 2), ['turn_left()'], ['move()']) },
      loiGiaiKhac: {
        moTa: 'Một chỗ rẽ gọi hàm, chỗ kia viết tay',
        baiLam: { ham: [hMove(), hLeft()], chinh: nhieu(lap('move()', 3), ['turn_left()'], lap('move()', 2), T_LEFT, ['move()']) }
      },
      loiSai: [
        { moTa: 'turn_left() viết bằng bánh trái: xe rẽ nhầm sang phải',
          baiLam: { ham: [hMove(), H('turn_left', T_RIGHT)], chinh: nhieu(lap('move()', 3), ['turn_left()'], lap('move()', 2), ['turn_left()'], ['move()']) },
          phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Gọi turn_left() mà chưa tạo hàm',
          baiLam: { ham: [hMove()], chinh: nhieu(lap('move()', 3), ['turn_left()'], lap('move()', 2), ['turn_left()'], ['move()']) },
          phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Rẽ trái và rẽ phải khác nhau ở bánh nào được quay.']
    }),

    man({
      id: '2.6', ten: 'Bậc thang', hang: 'luyen', khung: { soHam: 3 },
      deBai: 'Xe leo một cầu thang hẹp: đi, rẽ phải, đi, rẽ trái, ... Chương trình có 10 ô: nên viết cả turn_right() lẫn turn_left().',
      san: ['#####', '##F##', '#..##', '..###', '.####'],
      batDau: { x: 0, y: 4, huong: 0 },
      maMau: { ham: [hMove()], chinh: [] },
      sao: { o: 16, nhip: 9 },
      loiGiai: {
        ham: [hMove(), hRight(), hLeft()],
        chinh: ['move()', 'turn_right()', 'move()', 'turn_left()', 'move()', 'turn_right()', 'move()', 'turn_left()', 'move()']
      },
      loiGiaiKhac: {
        moTa: 'Cùng đường đi, thêm một dòng chú thích',
        baiLam: {
          ham: [hMove(), hRight(), hLeft()],
          chinh: ['# leo cầu thang', 'move()', 'turn_right()', 'move()', 'turn_left()', 'move()', 'turn_right()', 'move()', 'turn_left()', 'move()']
        }
      },
      loiSai: [
        { moTa: 'Rẽ phải mãi: xe đâm tường chứ không leo lên',
          baiLam: { ham: [hMove(), hRight()], chinh: ['move()', 'turn_right()', 'move()', 'turn_right()', 'move()', 'turn_right()', 'move()', 'turn_right()', 'move()'] },
          phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Chỉ có hàm rẽ phải, rẽ trái viết tay: vượt 10 ô',
          baiLam: { ham: [hMove(), hRight()], chinh: ['move()', 'turn_right()', 'move()', 'right_move()', 'wait()', 'move()', 'turn_right()', 'move()', 'right_move()', 'wait()', 'move()'] },
          phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['Mỗi bậc là: đi một ô, rẽ phải, đi một ô, rẽ trái.']
    }),

    /* ------------------------------------------------------------- hàng 3 */
    man({
      id: '2.7', ten: 'Quay đầu bằng hàm', hang: 'bien-the', khung: { soHam: 4 },
      deBai: 'Xe đứng ở cuối ngõ cụt, cờ ở cuối lối ra. Thêm hàm u_turn() gọi turn_right() hai lần (hàm gọi hàm), rồi dùng nó.',
      san: ['#.###', '#.###', '#.###', '#.F##', '#####'],
      batDau: { x: 1, y: 0, huong: 0 },
      maMau: { ham: [hMove(), hRight(), hLeft()], chinh: [] },
      sao: { o: 15, nhip: 7 },
      loiGiai: {
        ham: [hMove(), hRight(), hLeft(), H('u_turn', ['turn_right()', 'turn_right()'])],
        chinh: ['u_turn()', 'move()', 'move()', 'move()', 'turn_left()', 'move()']
      },
      loiGiaiKhac: {
        moTa: 'u_turn() viết thẳng bằng lệnh bánh, không gọi turn_right()',
        baiLam: {
          ham: [hMove(), hRight(), hLeft(), H('u_turn', nhieu(T_RIGHT, T_RIGHT))],
          chinh: ['u_turn()', 'move()', 'move()', 'move()', 'turn_left()', 'move()']
        }
      },
      loiSai: [
        { moTa: 'u_turn() quay phải rồi lại quay trái: xe không quay đầu, đâm ra ngoài',
          baiLam: { ham: [hMove(), hRight(), hLeft(), H('u_turn', ['turn_right()', 'turn_left()'])], chinh: ['u_turn()', 'move()', 'move()', 'move()', 'turn_left()', 'move()'] },
          phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Gọi u_turn() mà chưa tạo hàm',
          baiLam: { ham: [hMove(), hRight(), hLeft()], chinh: ['u_turn()', 'move()', 'move()', 'move()', 'turn_left()', 'move()'] },
          phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Hai lần quay phải liền nhau thì xe quay mặt về phía nào?', 'Trong thân hàm cũng gọi được hàm khác.']
    }),

    man({
      id: '2.8', ten: 'Sửa hàm lỗi', hang: 'bien-the', khung: { soHam: 4 },
      deBai: 'Hàm step_right() định "rẽ phải rồi đi một ô", nhưng xe cứ đi sai chỗ. Đọc kỹ thân hàm, tìm và sửa chỗ nhầm.',
      san: ['#####', '#####', '#...#', '#.#F#', '#.###'],
      batDau: { x: 1, y: 4, huong: 0 },
      maMau: {
        ham: [hMove(), hRight(), hLeft(), H('step_right', ['turn_left()', 'move()'])],
        chinh: ['move()', 'move()', 'step_right()', 'move()', 'step_right()']
      },
      sao: { o: 12, nhip: 7 },
      loiGiai: {
        ham: [hMove(), hRight(), H('step_right', ['turn_right()', 'move()'])],
        chinh: ['move()', 'move()', 'step_right()', 'move()', 'step_right()']
      },
      loiGiaiKhac: {
        moTa: 'Sửa đúng nhưng giữ lại hàm turn_left() không dùng đến',
        baiLam: {
          ham: [hMove(), hRight(), hLeft(), H('step_right', ['turn_right()', 'move()'])],
          chinh: ['move()', 'move()', 'step_right()', 'move()', 'step_right()']
        }
      },
      loiSai: [
        { moTa: 'Không sửa gì: hàm rẽ trái thay vì rẽ phải',
          baiLam: {
            ham: [hMove(), hRight(), hLeft(), H('step_right', ['turn_left()', 'move()'])],
            chinh: ['move()', 'move()', 'step_right()', 'move()', 'step_right()']
          }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Gọi hàm sai chính tả',
          baiLam: {
            ham: [hMove(), hRight(), H('step_right', ['turn_right()', 'move()'])],
            chinh: ['move()', 'move()', 'step_rigth()', 'move()', 'step_right()']
          }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Chạy thử và xem xe rẽ về phía nào ở lần gọi step_right() đầu tiên.']
    }),

    man({
      id: '2.9', ten: 'Hàm gọi hàm', hang: 'bien-the', khung: { soHam: 3 },
      deBai: 'Gói "đi hai ô rồi rẽ phải" thành hàm corner() (trong đó gọi move() và turn_right()), rồi đi vòng ba góc tới cờ.',
      san: ['#####', '#####', '...##', '.#.##', '.#F##'],
      batDau: { x: 0, y: 4, huong: 0 },
      maMau: { ham: [hMove(), hRight()], chinh: [] },
      sao: { o: 11, nhip: 8 },
      loiGiai: {
        ham: [hMove(), hRight(), H('corner', ['move()', 'move()', 'turn_right()'])],
        chinh: lap('corner()', 3)
      },
      loiGiaiKhac: {
        moTa: 'Không gói thành hàm: gọi move() và turn_right() từng lần',
        baiLam: {
          ham: [hMove(), hRight()],
          chinh: ['move()', 'move()', 'turn_right()', 'move()', 'move()', 'turn_right()', 'move()', 'move()']
        }
      },
      loiSai: [
        { moTa: 'corner() rẽ trái thay vì rẽ phải: xe đâm tường',
          baiLam: { ham: [hMove(), hRight(), H('corner', nhieu(['move()', 'move()'], T_LEFT))], chinh: lap('corner()', 3) },
          phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Gọi corner() mà trong thân hàm không có lệnh quay',
          baiLam: { ham: [hMove(), hRight(), H('corner', ['move()', 'move()'])], chinh: lap('corner()', 3) },
          phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Ba góc giống hệt nhau thì chỉ cần viết một lần.']
    }),

    /* ------------------------------------------------------------- trùm */
    man({
      id: '2.10', ten: 'Cầu thang dài', hang: 'trum', khung: { soHam: 5 },
      deBai: 'Leo cầu thang sáu bậc tới cờ. Chương trình có 10 ô nhưng nếu gọi từng bậc thì vừa sát; để hàm gọi hàm sẽ gọn hơn.',
      san: ['#####.F', '####..#', '###..##', '##..###', '#..####', '..#####', '.######'],
      batDau: { x: 0, y: 6, huong: 0 },
      maMau: { ham: [hMove(), hRight(), hLeft()], chinh: [] },
      sao: { o: 16, nhip: 23 },
      loiGiai: {
        ham: [hMove(), hRight(), hLeft(),
          H('stair', ['move()', 'turn_right()', 'move()', 'turn_left()']),
          H('two', ['stair()', 'stair()'])],
        chinh: lap('two()', 3)
      },
      loiGiaiKhac: {
        moTa: 'Chỉ có hàm stair(), gọi sáu lần ở chương trình',
        baiLam: {
          ham: [hMove(), hRight(), hLeft(), H('stair', ['move()', 'turn_right()', 'move()', 'turn_left()'])],
          chinh: lap('stair()', 6)
        }
      },
      loiSai: [
        { moTa: 'Không gói hàm, gọi từng lệnh: quá 10 ô',
          baiLam: { ham: [hMove(), hRight(), hLeft()], chinh: nhieu(['move()', 'turn_right()', 'move()', 'turn_left()'], ['move()', 'turn_right()', 'move()', 'turn_left()'], ['move()', 'turn_right()', 'move()', 'turn_left()']) },
          phaiCoMa: ['tran-khung'] },
        { moTa: 'stair() rẽ ngược: xe đâm tường',
          baiLam: {
            ham: [hMove(), hRight(), hLeft(), H('stair', ['move()', 'turn_left()', 'move()', 'turn_right()']), H('two', ['stair()', 'stair()'])],
            chinh: lap('two()', 3)
          }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Sáu bậc là ba lần "hai bậc".'],
      moThuVien: ['move', 'turn_right', 'turn_left', 'u_turn']
    })
  ];

  ManHoc.them(DS);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();
