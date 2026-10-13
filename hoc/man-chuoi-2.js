/* ============================================================================
   man-chuoi-2.js — "Đường học": CHUỖI 2 · XƯỞNG HÀM (10 màn).
   Mở cột HÀM 8 ô; cột CHÍNH 8 ô (có màn khóa bớt). Hàm gốc như chuỗi 1.
   Thư viện được dùng lớn dần theo HÀNG:
     hàng 1 (2.1–2.3): rỗng · hàng 2 (2.4–2.6): move ·
     hàng 3 (2.7–2.9): move, turn_right, turn_left · trùm (2.10): thêm u_turn.
   Nối tiếp man-chuoi-1.js vào cùng window.ManHoc.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var HAM_GOC = ['left_move', 'right_move', 'wait'];

  function hamMove() { return ['def move():', '    left_move()', '    right_move()', '    wait()']; }
  function hamTurnRight() { return ['def turn_right():', '    left_move()', '    wait()']; }
  function hamTurnLeft() { return ['def turn_left():', '    right_move()', '    wait()']; }
  function lap(dong, n) { var kq = []; for (var i = 0; i < n; i++) kq.push(dong); return kq; }
  var TIEN = ['left_move()', 'right_move()', 'wait()'];

  function man(m) {
    m.loaiRobot = 'banh'; m.hamGoc = HAM_GOC;
    m.khung = Object.assign({ chinh: 8, ham: 8, khoaChinh: 0, khoaHam: 0 }, m.khung || {});
    return m;
  }

  var TV0 = [], TV1 = ['move'], TV2 = ['move', 'turn_right', 'turn_left'], TV3 = TV2.concat(['u_turn']);

  var DS = [
    /* ---------------------------------------------------------------- hàng 1 */
    man({
      id: '2.1', ten: 'Gọi hàm', hang: 'lam-quen', thuVien: TV0,
      deBai: 'Cờ cách xe ba ô. Viết tay ba lần "tiến một ô" thì quá 8 dòng. Hàm move() đã có sẵn ở cột HÀM, chỉ việc gọi nó.',
      san: ['.....', '..F..', '.....', '.....', '.....'],
      batDau: { x: 2, y: 4, huong: 0 },
      maMau: { ham: hamMove(), chinh: [] },
      sao: { o: 7, nhip: 3 },
      loiGiai: { ham: hamMove(), chinh: lap('move()', 3) },
      loiSai: [
        { moTa: 'Không dùng hàm, viết tay cả ba lần: 9 dòng', baiLam: { ham: [], chinh: TIEN.concat(TIEN, TIEN) },
          phaiCoMa: ['tran-khung'] },
        { moTa: 'Gọi sai tên hàm', baiLam: { ham: hamMove(), chinh: ['mov()', 'move()', 'move()'] },
          phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Gọi hàm là viết tên hàm kèm cặp ngoặc, mỗi lần gọi chiếm một dòng.']
    }),

    man({
      id: '2.2', ten: 'Điền thân hàm', hang: 'lam-quen', thuVien: TV0,
      deBai: 'Cột CHÍNH đã gọi move() sẵn nhưng cột HÀM mới có dòng đầu def move():. Viết thân hàm: "tiến một ô".',
      san: ['..F..', '.....', '.....', '.....', '.....'],
      batDau: { x: 2, y: 4, huong: 0 },
      maMau: { ham: ['def move():'], chinh: lap('move()', 4) },
      sao: { o: 8, nhip: 4 },
      loiGiai: { ham: hamMove(), chinh: lap('move()', 4) },
      loiSai: [
        { moTa: 'Thân hàm quên wait()', baiLam: { ham: ['def move():', '    left_move()', '    right_move()'], chinh: lap('move()', 4) },
          phaiCoMa: ['banh-goi-lai', 'quen-wait', 'chua-toi-co'] },
        { moTa: 'Chỉ có dòng def, chưa có thân', baiLam: { ham: ['def move():'], chinh: lap('move()', 4) },
          phaiCoMa: ['loi-cu-phap'] }
      ],
      goiY: ['Thân hàm phải thụt vào so với dòng def.', 'Thân hàm giống hệt đoạn "tiến một ô" ở chuỗi trước.']
    }),

    man({
      id: '2.3', ten: 'Tự viết move', hang: 'lam-quen', thuVien: TV0,
      deBai: 'Lần này cột HÀM trống. Tự viết hàm move() rồi gọi nó bốn lần để xe chạy ngang sân tới cờ.',
      san: ['.....', '.....', '....F', '.....', '.....'],
      batDau: { x: 0, y: 2, huong: 1 },
      maMau: { ham: [], chinh: [] },
      sao: { o: 8, nhip: 4 },
      loiGiai: { ham: hamMove(), chinh: lap('move()', 4) },
      loiSai: [
        { moTa: 'Thân hàm quên wait()', baiLam: { ham: ['def move():', '    left_move()', '    right_move()'], chinh: lap('move()', 4) },
          phaiCoMa: ['banh-goi-lai', 'quen-wait'] },
        { moTa: 'Gọi move() nhưng chưa viết hàm', baiLam: { ham: [], chinh: lap('move()', 4) },
          phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Hàm phải được viết (def) thì mới gọi được.', 'Chạy 4 lần hàm chỉ tốn 4 dòng ở cột CHÍNH.']
    }),

    /* ---------------------------------------------------------------- hàng 2 */
    man({
      id: '2.4', ten: 'Hàm rẽ phải', hang: 'luyen', thuVien: TV1, khung: { khoaChinh: 3 },
      deBai: 'move() đã nằm trong thư viện, không chiếm ô. Cột CHÍNH chỉ còn 5 ô: hãy viết hàm turn_right() để đi lên hai ô, rẽ phải, đi hai ô.',
      san: ['.....', '...F.', '.....', '.....', '.....'],
      batDau: { x: 1, y: 3, huong: 0 },
      maMau: { ham: [], chinh: [] },
      sao: { o: 8, nhip: 5 },
      loiGiai: { ham: hamTurnRight(), chinh: ['move()', 'move()', 'turn_right()', 'move()', 'move()'] },
      loiSai: [
        { moTa: 'turn_right() viết bằng bánh phải: xe rẽ trái, đi ra ngoài sân',
          baiLam: { ham: ['def turn_right():', '    right_move()', '    wait()'], chinh: ['move()', 'move()', 'turn_right()', 'move()', 'move()'] },
          phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Không dùng hàm, viết thẳng lệnh quay: vượt 5 ô',
          baiLam: { ham: [], chinh: ['move()', 'move()', 'left_move()', 'wait()', 'move()', 'move()'] },
          phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['Rẽ phải ở chuỗi 1 chỉ cần hai dòng.', 'Đặt tên hàm đúng như tên bạn gọi ở cột CHÍNH.']
    }),

    man({
      id: '2.5', ten: 'Hàm rẽ trái', hang: 'luyen', thuVien: TV1, khung: { khoaChinh: 3 },
      deBai: 'Tương tự màn trước nhưng rẽ trái. Viết hàm turn_left() rồi dùng nó: đi lên ba ô, rẽ trái, đi một ô.',
      san: ['.....', '..F..', '.....', '.....', '.....'],
      batDau: { x: 3, y: 4, huong: 0 },
      maMau: { ham: [], chinh: [] },
      sao: { o: 8, nhip: 5 },
      loiGiai: { ham: hamTurnLeft(), chinh: ['move()', 'move()', 'move()', 'turn_left()', 'move()'] },
      loiSai: [
        { moTa: 'turn_left() viết bằng bánh trái: xe rẽ nhầm sang phải',
          baiLam: { ham: ['def turn_left():', '    left_move()', '    wait()'], chinh: ['move()', 'move()', 'move()', 'turn_left()', 'move()'] },
          phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Gọi turn_left() mà chưa viết hàm',
          baiLam: { ham: [], chinh: ['move()', 'move()', 'move()', 'turn_left()', 'move()'] },
          phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Rẽ trái và rẽ phải khác nhau ở bánh nào được quay.']
    }),

    man({
      id: '2.6', ten: 'Bậc thang', hang: 'luyen', thuVien: TV1, khung: { ham: 6, khoaChinh: 1 },
      deBai: 'Xe leo một cầu thang: đi, rẽ phải, đi, rẽ trái, ... Cột CHÍNH chỉ còn 7 ô và cột HÀM có 6 ô. Viết cả turn_right() lẫn turn_left().',
      san: ['#####', '#.F##', '..###', '.####', '#####'],
      batDau: { x: 0, y: 3, huong: 0 },
      maMau: { ham: [], chinh: [] },
      sao: { o: 13, nhip: 7 },
      loiGiai: {
        ham: hamTurnRight().concat(hamTurnLeft()),
        chinh: ['move()', 'turn_right()', 'move()', 'turn_left()', 'move()', 'turn_right()', 'move()']
      },
      loiSai: [
        { moTa: 'Rẽ phải mãi: xe vòng xuống chứ không leo lên',
          baiLam: { ham: hamTurnRight(), chinh: ['move()', 'turn_right()', 'move()', 'turn_right()', 'move()', 'turn_right()', 'move()'] },
          phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Chỉ viết hàm rẽ phải, rẽ trái viết tay: vượt 7 ô',
          baiLam: { ham: hamTurnRight(), chinh: ['move()', 'turn_right()', 'move()', 'right_move()', 'wait()', 'move()', 'turn_right()', 'move()'] },
          phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['Mỗi bậc là: đi một ô, rẽ phải, đi một ô, rẽ trái.']
    }),

    /* ---------------------------------------------------------------- hàng 3 */
    man({
      id: '2.7', ten: 'Quay đầu bằng hàm', hang: 'bien-the', thuVien: TV2, khung: { khoaChinh: 2 },
      deBai: 'Xe đứng ở cuối ngõ cụt, cờ ở cuối lối ra. Viết hàm u_turn() gọi turn_right() hai lần (hàm gọi hàm), rồi dùng nó.',
      san: ['#.###', '#.###', '#.###', '#.F##', '#####'],
      batDau: { x: 1, y: 0, huong: 0 },
      maMau: { ham: [], chinh: [] },
      sao: { o: 9, nhip: 7 },
      loiGiai: {
        ham: ['def u_turn():', '    turn_right()', '    turn_right()'],
        chinh: ['u_turn()', 'move()', 'move()', 'move()', 'turn_left()', 'move()']
      },
      loiSai: [
        { moTa: 'u_turn() quay phải rồi lại quay trái: xe không quay đầu, đâm ra ngoài',
          baiLam: { ham: ['def u_turn():', '    turn_right()', '    turn_left()'], chinh: ['u_turn()', 'move()', 'move()', 'move()', 'turn_left()', 'move()'] },
          phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Không viết u_turn(), gọi turn_right() hai lần ở cột CHÍNH: vượt 6 ô',
          baiLam: { ham: [], chinh: ['turn_right()', 'turn_right()', 'move()', 'move()', 'move()', 'turn_left()', 'move()'] },
          phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['Hai lần quay phải liền nhau thì xe quay mặt về phía nào?', 'Trong thân hàm cũng gọi được hàm khác.']
    }),

    man({
      id: '2.8', ten: 'Sửa hàm lỗi', hang: 'bien-the', thuVien: TV2,
      deBai: 'Hàm step_right() định "rẽ phải rồi đi một ô", nhưng xe cứ đi sai chỗ. Đọc kỹ thân hàm, tìm và sửa chỗ nhầm.',
      san: ['#####', '#####', '...##', '.#F##', '.####'],
      batDau: { x: 0, y: 4, huong: 0 },
      maMau: {
        ham: ['def step_right():', '    turn_left()', '    move()'],
        chinh: ['move()', 'move()', 'step_right()', 'move()', 'step_right()']
      },
      sao: { o: 8, nhip: 7 },
      loiGiai: {
        ham: ['def step_right():', '    turn_right()', '    move()'],
        chinh: ['move()', 'move()', 'step_right()', 'move()', 'step_right()']
      },
      loiSai: [
        { moTa: 'Không sửa gì: hàm rẽ trái thay vì rẽ phải', baiLam: {
          ham: ['def step_right():', '    turn_left()', '    move()'],
          chinh: ['move()', 'move()', 'step_right()', 'move()', 'step_right()'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Gọi hàm sai chính tả', baiLam: {
          ham: ['def step_right():', '    turn_right()', '    move()'],
          chinh: ['move()', 'move()', 'step_rigth()', 'move()', 'step_right()'] }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Chạy thử và xem xe rẽ về phía nào ở lần gọi đầu tiên.']
    }),

    man({
      id: '2.9', ten: 'Hàm gọi hàm', hang: 'bien-the', thuVien: TV2, khung: { khoaChinh: 5 },
      deBai: 'Cột CHÍNH chỉ còn 3 ô. Gói "đi hai ô rồi rẽ phải" thành hàm corner() (trong đó gọi move() và turn_right()), rồi đi vòng ba góc tới cờ.',
      san: ['#####', '#####', '...##', '.#.##', '.#F##'],
      batDau: { x: 0, y: 4, huong: 0 },
      maMau: { ham: [], chinh: [] },
      sao: { o: 7, nhip: 8 },
      loiGiai: {
        ham: ['def corner():', '    move()', '    move()', '    turn_right()'],
        chinh: lap('corner()', 3)
      },
      loiSai: [
        { moTa: 'corner() rẽ trái thay vì rẽ phải: xe ra khỏi sân',
          baiLam: { ham: ['def corner():', '    move()', '    move()', '    turn_left()'], chinh: lap('corner()', 3) },
          phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Không gói thành hàm: 9 dòng ở cột CHÍNH',
          baiLam: { ham: [], chinh: ['move()', 'move()', 'turn_right()', 'move()', 'move()', 'turn_right()', 'move()', 'move()', 'turn_right()'] },
          phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['Ba góc giống hệt nhau thì chỉ cần viết một lần.']
    }),

    /* ------------------------------------------------------------------ trùm */
    man({
      id: '2.10', ten: 'Cầu thang dài', hang: 'trum', thuVien: TV3, khung: { khoaChinh: 5 },
      deBai: 'Leo cầu thang bốn bậc tới cờ. Cột CHÍNH chỉ còn 3 ô: một hàm thôi chưa đủ, hãy để hàm gọi hàm.',
      san: ['###F#', '##..#', '#..##', '..###', '.####'],
      batDau: { x: 0, y: 4, huong: 0 },
      maMau: { ham: [], chinh: [] },
      sao: { o: 10, nhip: 13 },
      loiGiai: {
        ham: ['def stair():', '    move()', '    turn_right()', '    move()', '    turn_left()', 'def two():', '    stair()', '    stair()'],
        chinh: ['two()', 'two()']
      },
      loiSai: [
        { moTa: 'Chỉ có stair(): gọi bốn lần thì quá 3 ô cột CHÍNH',
          baiLam: { ham: ['def stair():', '    move()', '    turn_right()', '    move()', '    turn_left()'], chinh: lap('stair()', 4) },
          phaiCoMa: ['tran-khung'] },
        { moTa: 'stair() rẽ ngược: xe đâm tường',
          baiLam: { ham: ['def stair():', '    move()', '    turn_left()', '    move()', '    turn_right()', 'def two():', '    stair()', '    stair()'],
            chinh: ['two()', 'two()'] },
          phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Bốn bậc là hai lần "hai bậc".']
    })
  ];

  ManHoc.them(DS);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();
