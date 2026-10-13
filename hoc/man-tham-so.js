/* ============================================================================
   man-tham-so.js — "Đường học": CHƯƠNG `tham-so` · HÀM CÓ THAM SỐ (10 màn).
   Xe hai bánh có tay kẹp, Xưởng hàm mở (moXuong true), được dùng hàm của em. Hàm gốc như chương
   bang-chuyen (bánh, wait, 4 lệnh tay). Chương trình 10 ô; mỗi hàm một khung riêng 10 ô.
   Đã học `for` nên cauTruc ['for'].

   Python học thêm: hàm CÓ THAM SỐ — `def forward(n):`, thân dùng chính tên n (`range(n)`), gọi `forward(4)`;
   rồi hàm hai tham số `step(a, b)`. Gọi thiếu hay thừa đối số là lỗi chạy ("cần n đối số, đang có m").

   Hàm của em MỚI (tên cốt truyện, bị khóa trong kho, xem KhoHam.datTenCoDinh):
     tham-so.3  forward(n)    = for i in range(n): move()
     tham-so.4  right(k)      = for i in range(k): turn_right()          (quay phải k lần)
     tham-so.6  deliver(n)    = pick(); forward(n); drop()                (nhặt, tiến n ô, thả)
     tham-so.8  step(a, b)    = forward(a); turn_right(); forward(b); turn_left()   (một bậc thang)
   Tên không trùng hàm cốt truyện chương trước (move, turn_right, turn_left, u_turn, corner, stair, two,
   pick, drop, carry, side, row, bend_left, bend_right).
   Hàm CỦA MÀN (tạm, không vào kho): 6.1 và 6.2 cho sẵn forward(n) (đúng ở 6.1, thân thiếu ở 6.2) để học sinh
   dùng / hoàn thành TRƯỚC khi tự tạo ở 6.3; 6.7 cho run(n) (tiến n ô rồi rẽ phải) viết nhầm số cố định.

   Trường riêng của chương này:
   - canThamSo: 'tran-khung' — viết KHÔNG dùng hàm có tham số (khai triển mọi lời gọi thành move() / turn từng dòng)
                               thì tràn khung 10 ô;
                'mat-sao'     — vẫn vừa khung nhưng nhiều ô hơn, không đạt 3 sao.
     (kiem-tham-so.mjs tự khai triển lời giải để chứng minh. Cả 10 màn hiện đều 'tran-khung'. Riêng 6.4: bỏ
     mỗi right(k), vẫn dùng forward(), thì vừa khung nhưng 16 ô > 15, chỉ 2 sao — kiểm riêng ở mục 6.)
   - nhipTheoLoiGiai: true — sao.nhip là nhịp của lời giải CHUẨN, có thể dài hơn đường ngắn nhất (BFS):
     6.4 (right(3) thay turn_left() cho dễ nhớ), 6.6 và 6.10 (pick / drop còn nâng tay ở nhịp riêng).
     Máy kiểm chỉ đòi BFS <= sao.nhip.

   Sân là HÀNH LANG (mọi ô ngoài đường đi là tường) nên không có đường tắt; BFS (kiem-hoc.mjs, do-duong-tay.mjs)
   xác nhận. 6.9 và 6.10 có băng chuyền (luật như chương bang-chuyen): số lần gọi move() KHÔNG bằng số ô đi qua.

   Nối tiếp man-chuoi-1.js vào cùng window.ManHoc. Thứ tự chương: thu-tu-chuong.js.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var HAM_GOC = ['left_move', 'right_move', 'wait', 'arm_down', 'arm_up', 'grab', 'release'];

  function lap(s, n) { var kq = []; for (var i = 0; i < n; i++) kq.push(s); return kq; }
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  /** Vòng for: dòng đầu rồi thân thụt 4 dấu cách. n có thể là số hoặc tên biến ('n'). */
  function FOR(n, than, bien) {
    return ['for ' + (bien || 'i') + ' in range(' + n + '):'].concat(than.map(function (s) { return '    ' + s; }));
  }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }

  // thân các hàm có tham số của chương
  var T_FORWARD = FOR('n', ['move()']);
  var T_RIGHT = FOR('k', ['turn_right()']);
  var T_DELIVER = ['pick()', 'forward(n)', 'drop()'];
  var T_STEP = ['forward(a)', 'turn_right()', 'forward(b)', 'turn_left()'];
  function hForward() { return H('forward', ['n'], T_FORWARD); }
  function hRight() { return H('right', ['k'], T_RIGHT); }
  function hDeliver() { return H('deliver', ['n'], T_DELIVER); }
  function hStep() { return H('step', ['a', 'b'], T_STEP); }
  // 6.7: run(n) = tiến n ô rồi rẽ phải. Bản của màn dùng NHẦM số cố định 3 thay vì n.
  function hRun(soLan) { return H('run', ['n'], nhieu(FOR(soLan, ['move()']), ['turn_right()'])); }

  function man(m) {
    m.chuong = 'tham-so';
    m.cauTruc = ['for'];
    m.loaiRobot = 'banh'; m.hamGoc = HAM_GOC;
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    return ManHoc.chuanHoa(m);
  }

  /* ------------------------------------------------------------- chương trình dùng lại */

  // 6.1: bốn - ba - hai ô, rẽ phải rồi rẽ trái
  var CHINH_1 = ['forward(4)', 'turn_right()', 'forward(3)', 'turn_left()', 'forward(2)'];
  // 6.2: ba - năm - hai ô, hai lần rẽ phải
  var CHINH_2 = ['forward(3)', 'turn_right()', 'forward(5)', 'turn_right()', 'forward(2)'];
  // 6.3: năm - ba - một ô, hai lần rẽ trái
  var CHINH_3 = ['forward(5)', 'turn_left()', 'forward(3)', 'turn_left()', 'forward(1)'];
  // 6.4: xe quay mặt vào tường: quay đầu, đi, rẽ phải, đi, rẽ trái (right(3) = ba lần quay phải), đi
  var CHINH_4 = ['right(2)', 'forward(4)', 'right(1)', 'forward(3)', 'right(3)', 'forward(2)'];
  // 6.5: năm đoạn dài ngắn khác nhau, bốn khúc rẽ
  var CHINH_5 = ['forward(4)', 'turn_right()', 'forward(3)', 'turn_left()', 'forward(2)', 'turn_right()', 'forward(3)', 'turn_right()', 'forward(4)'];
  // 6.6: ba chuyến giao hàng, một khúc rẽ
  var CHINH_6 = ['deliver(3)', 'forward(1)', 'deliver(2)', 'turn_right()', 'forward(1)', 'deliver(3)'];
  // 6.7: xoắn ốc từ giữa ra
  var CHINH_7 = ['run(1)', 'run(2)', 'run(4)', 'run(5)', 'run(6)'];
  // 6.8: ba bậc thang
  var CHINH_8 = ['step(3, 1)', 'step(2, 2)', 'step(1, 3)'];
  // 6.9: hai đoạn băng chuyền (xuôi chiều rồi ngược chiều)
  var CHINH_9 = ['forward(2)', 'turn_right()', 'forward(3)', 'turn_left()', 'forward(6)', 'turn_left()', 'forward(2)'];
  // 6.10: ba chuyến, ba đoạn có băng chuyền
  var CHINH_10 = ['deliver(5)', 'turn_right()', 'forward(2)', 'turn_right()', 'deliver(5)', 'turn_left()', 'forward(2)', 'turn_left()', 'deliver(3)'];

  var DS = [
    /* ------------------------------------------------ hàng 1: làm quen */
    man({
      so: 1, ten: 'Gọi hàm có số', hang: 'lam-quen', canThamSo: 'tran-khung', hamCuaEmCan: ['move', 'turn_right', 'turn_left'],
      deBai: 'Màn này cho sẵn hàm forward(n): xe tiến n ô. Gọi nó với số ô của từng đoạn đường để đưa xe tới cờ.',
      san: ['.....##', '####.##', '####.##', '####..F'],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: { chinh: [], hamCuaMan: [hForward()] },
      sao: { o: 14, nhip: 11 },
      loiGiai: { chinh: CHINH_1.slice(), hamCuaMan: [hForward()] },
      loiGiaiKhac: {
        moTa: 'Đoạn giữa gọi move() từng lần thay vì forward(3)',
        baiLam: { chinh: ['forward(4)', 'turn_right()', 'move()', 'move()', 'move()', 'turn_left()', 'forward(2)'], hamCuaMan: [hForward()] }
      },
      loiSai: [
        { moTa: 'Gọi forward() mà không đưa số vào', baiLam: { chinh: ['forward()', 'turn_right()', 'forward(3)', 'turn_left()', 'forward(2)'], hamCuaMan: [hForward()] }, phaiCoMa: ['loi-chay'] },
        { moTa: 'Đưa hai số vào forward(), trong khi hàm chỉ nhận một', baiLam: { chinh: ['forward(4, 3)', 'turn_right()', 'forward(3)', 'turn_left()', 'forward(2)'], hamCuaMan: [hForward()] }, phaiCoMa: ['loi-chay'] },
        { moTa: 'Đếm đoạn thứ hai thiếu một ô', baiLam: { chinh: ['forward(4)', 'turn_right()', 'forward(2)', 'turn_left()', 'forward(2)'], hamCuaMan: [hForward()] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đoạn đầu đi dư một ô: xe đâm tường một nhịp, tới cờ chậm hơn', baiLam: { chinh: ['forward(5)', 'turn_right()', 'forward(3)', 'turn_left()', 'forward(2)'], hamCuaMan: [hForward()] }, phaiCoMa: ['dam-tuong'] },
        { moTa: 'Không dùng hàm, viết move() từng lần: mười một dòng, quá 10 ô', baiLam: { chinh: nhieu(lap('move()', 4), ['turn_right()'], lap('move()', 3), ['turn_left()'], lap('move()', 2)), hamCuaMan: [hForward()] }, phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['Số trong ngoặc là số ô cần đi: đếm từng đoạn thẳng trên sân.',
        'Hết một đoạn thì rẽ, rồi gọi forward() với số của đoạn kế.']
    }),

    man({
      so: 2, ten: 'Hoàn thành forward', hang: 'lam-quen', canThamSo: 'tran-khung', hamCuaEmCan: ['move', 'turn_right'],
      deBai: 'Hàm forward(n) của màn phải đưa xe tiến n ô. Hoàn thành thân hàm để xe đi hết đường tới cờ.',
      veMaMau: 'Chương trình có sẵn đã gọi forward(n) với đúng số ô của từng đoạn, nhưng thân hàm forward() mới có một lệnh move(). Chạy thử, xem xe nhích mấy ô mỗi lần gọi rồi sửa thân hàm.',
      san: ['......', '.####.', '.####F', '.#####'],
      batDau: { x: 0, y: 3, huong: 0 },
      maMau: { chinh: CHINH_2.slice(), hamCuaMan: [H('forward', ['n'], ['move()'])] },
      sao: { o: 12, nhip: 12 },
      loiGiai: { chinh: CHINH_2.slice(), hamCuaMan: [hForward()] },
      loiGiaiKhac: {
        moTa: 'Thân hàm dùng while thay cho for',
        baiLam: { chinh: CHINH_2.slice(), hamCuaMan: [H('forward', ['n'], ['i = 0', 'while i < n:', '    move()', '    i += 1'])] }
      },
      loiSai: [
        { moTa: 'Không sửa gì: mỗi lần gọi xe chỉ nhích một ô', baiLam: { chinh: CHINH_2.slice(), hamCuaMan: [H('forward', ['n'], ['move()'])] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Vòng lặp lặp đúng ba lần, không theo n', baiLam: { chinh: CHINH_2.slice(), hamCuaMan: [H('forward', ['n'], FOR(3, ['move()']))] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Gõ nhầm tên đối số trong range()', baiLam: { chinh: CHINH_2.slice(), hamCuaMan: [H('forward', ['n'], FOR('m', ['move()']))] }, phaiCoMa: ['loi-chay'] },
        { moTa: 'Dòng move() không thụt lề vào thân vòng lặp', baiLam: { chinh: CHINH_2.slice(), hamCuaMan: [H('forward', ['n'], ['for i in range(n):', 'move()'])] }, phaiCoMa: ['loi-cu-phap'] }
      ],
      goiY: ['Chạy thử bản có sẵn: n bằng 3 mà xe đi được mấy ô?',
        'Việc "tiến một ô" phải lặp lại n lần, và n đổi theo mỗi lần gọi.']
    }),

    man({
      so: 3, ten: 'Tạo hàm forward', hang: 'lam-quen', canThamSo: 'tran-khung', hamCuaEmCan: ['move', 'turn_left'], taoHam: ['forward'],
      deBai: 'Tạo trong Xưởng hàm forward(n): tiến n ô. Rồi dùng nó để đưa xe tới cờ.',
      veMaMau: 'Chương trình có sẵn đã gọi forward(n), nhưng em chưa có hàm đó. Tạo hàm forward với một đối số n.',
      san: ['####F.', '#####.', '#####.', '......'],
      batDau: { x: 0, y: 3, huong: 1 },
      maMau: { chinh: CHINH_3.slice() },
      sao: { o: 12, nhip: 11 },
      loiGiai: { chinh: CHINH_3.slice(), hamCuaEmMoi: [hForward()] },
      loiGiaiKhac: {
        moTa: 'Đoạn đầu gọi forward() hai lần: 2 rồi 3',
        baiLam: { chinh: ['forward(2)', 'forward(3)', 'turn_left()', 'forward(3)', 'turn_left()', 'forward(1)'] },
        hamCuaEmMoi: [hForward()]
      },
      loiSai: [
        { moTa: 'Gọi forward() mà chưa tạo hàm', baiLam: { chinh: CHINH_3.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Tạo forward() không có đối số nhưng vẫn gọi forward(5)', baiLam: { chinh: CHINH_3.slice() }, hamCuaEmMoi: [H('forward', [], ['move()'])], phaiCoMa: ['loi-chay'] },
        { moTa: 'Thân hàm chỉ có một move(): xe nhích một ô mỗi lần gọi', baiLam: { chinh: CHINH_3.slice() }, hamCuaEmMoi: [H('forward', ['n'], ['move()'])], phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Không dùng hàm, viết move() từng lần: mười một dòng, quá 10 ô', baiLam: { chinh: nhieu(lap('move()', 5), ['turn_left()'], lap('move()', 3), ['turn_left()'], ['move()']) }, phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['Hàm có tham số: tên đối số nằm trong ngoặc của dòng def, và thân hàm dùng chính tên đó.',
        'Thân hàm chỉ cần lặp move() đủ n lần.']
    }),

    /* ------------------------------------------------------------- hàng 2 */
    man({
      so: 4, ten: 'Quay k lần', hang: 'luyen', canThamSo: 'tran-khung', hamCuaEmCan: ['move', 'forward', 'turn_right'], taoHam: ['right'], nhipTheoLoiGiai: true,
      deBai: 'Tạo hàm right(k): quay phải k lần. Xe đang quay mặt vào tường: hãy dùng right() cho mọi lần quay để đưa xe tới cờ.',
      san: ['###F', '###.', '....', '.###', '.###', '.###', '.###'],
      batDau: { x: 0, y: 6, huong: 2 },
      maMau: { chinh: [] },
      sao: { o: 15, nhip: 15 },
      loiGiai: { chinh: CHINH_4.slice(), hamCuaEmMoi: [hRight()] },
      loiGiaiKhac: {
        moTa: 'Không có right(): chỉ gọi right(1) thật nhiều lần',
        baiLam: { chinh: ['right(1)', 'right(1)', 'forward(4)', 'right(1)', 'forward(3)', 'right(1)', 'right(1)', 'right(1)', 'forward(2)'] },
        hamCuaEmMoi: [hRight()]
      },
      loiSai: [
        { moTa: 'Chưa tạo right() mà đã gọi nó', baiLam: { chinh: CHINH_4.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'right() quay một lần dù k bằng mấy: xe không quay đầu được', baiLam: { chinh: CHINH_4.slice() }, hamCuaEmMoi: [H('right', ['k'], ['turn_right()'])], phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'right() quay phải k lần nhưng thân hàm viết sai tên đối số', baiLam: { chinh: CHINH_4.slice() }, hamCuaEmMoi: [H('right', ['k'], FOR('n', ['turn_right()']))], phaiCoMa: ['loi-chay'] },
        { moTa: 'Quay đầu chỉ một lần: xe chưa quay mặt ra khỏi tường', baiLam: { chinh: ['right(1)', 'forward(4)', 'right(1)', 'forward(3)', 'right(3)', 'forward(2)'] }, hamCuaEmMoi: [hRight()], phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Quay phải ba lần liền thì xe nhìn về phía nào?',
        'Muốn làm một việc k lần thì dùng for với range(k).']
    }),

    man({
      so: 5, ten: 'Đường nhiều đoạn', hang: 'luyen', canThamSo: 'tran-khung', hamCuaEmCan: ['move', 'forward', 'turn_right', 'turn_left'],
      deBai: 'Đường đi có năm đoạn dài ngắn khác nhau, ngăn cách bằng bốn khúc rẽ. Đưa xe tới cờ.',
      san: ['###....', '###.##.', '....##.', '.#####.', '.#####F', '.######', '.######'],
      batDau: { x: 0, y: 6, huong: 0 },
      maMau: { chinh: [] },
      sao: { o: 18, nhip: 20 },
      loiGiai: { chinh: CHINH_5.slice() },
      loiGiaiKhac: {
        moTa: 'Mọi khúc rẽ phải gọi qua right(1)',
        baiLam: { chinh: ['forward(4)', 'right(1)', 'forward(3)', 'turn_left()', 'forward(2)', 'right(1)', 'forward(3)', 'right(1)', 'forward(4)'] }
      },
      loiSai: [
        { moTa: 'Đoạn thứ ba đi dư một ô: xe đâm mép sân một nhịp, tới cờ chậm hơn', baiLam: { chinh: ['forward(4)', 'turn_right()', 'forward(3)', 'turn_left()', 'forward(3)', 'turn_right()', 'forward(3)', 'turn_right()', 'forward(4)'] }, phaiCoMa: ['dam-tuong'] },
        { moTa: 'Khúc rẽ thứ hai rẽ nhầm sang phải: xe đâm tường', baiLam: { chinh: ['forward(4)', 'turn_right()', 'forward(3)', 'turn_right()', 'forward(2)', 'turn_right()', 'forward(3)', 'turn_right()', 'forward(4)'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Đoạn cuối thiếu một ô: xe dừng ngay trước cờ', baiLam: { chinh: ['forward(4)', 'turn_right()', 'forward(3)', 'turn_left()', 'forward(2)', 'turn_right()', 'forward(3)', 'turn_right()', 'forward(3)'] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Không dùng forward(), viết move() từng lần: hai mươi dòng', baiLam: { chinh: nhieu(lap('move()', 4), ['turn_right()'], lap('move()', 3), ['turn_left()'], lap('move()', 2), ['turn_right()'], lap('move()', 3), ['turn_right()'], lap('move()', 4)) }, phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['Đếm từng đoạn thẳng trên sân: đi mấy ô thì rẽ, rẽ bên nào.',
        'Mỗi đoạn thẳng là một lần gọi forward(); giữa hai đoạn là một khúc rẽ.']
    }),

    man({
      so: 6, ten: 'Giao hàng deliver', hang: 'luyen', canThamSo: 'tran-khung', hamCuaEmCan: ['move', 'forward', 'turn_right', 'pick', 'drop'], taoHam: ['deliver'],
      mucTieu: 'dua-vat', nhipTheoLoiGiai: true,
      deBai: 'Ba vật nằm rải trên đường, mỗi vật có ô đích (khung vàng) ở phía trước nó. Tạo hàm deliver(n): nhặt vật, tiến n ô rồi đặt xuống; dùng nó đưa cả ba vật tới đích.',
      veMaMau: 'Chương trình có sẵn đã gọi deliver(n) với số ô của từng chuyến, nhưng em chưa có hàm đó. Tạo hàm deliver với một đối số n.',
      san: ['o..Do.D', '######o', '######.', '######.', '######D'],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: { chinh: CHINH_6.slice() },
      sao: { o: 26, nhip: 22 },
      loiGiai: { chinh: CHINH_6.slice(), hamCuaEmMoi: [hDeliver()] },
      loiGiaiKhac: {
        moTa: 'Chuyến thứ hai viết thẳng pick(), forward(2), drop()',
        baiLam: { chinh: ['deliver(3)', 'forward(1)', 'pick()', 'forward(2)', 'drop()', 'turn_right()', 'forward(1)', 'deliver(3)'] },
        hamCuaEmMoi: [hDeliver()]
      },
      loiSai: [
        { moTa: 'Gọi deliver() mà chưa tạo hàm', baiLam: { chinh: CHINH_6.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'deliver() quên đặt vật xuống: tay vẫn cầm vật', baiLam: { chinh: CHINH_6.slice() }, hamCuaEmMoi: [H('deliver', ['n'], ['pick()', 'forward(n)'])], phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'deliver() thả bằng release() khi tay còn nâng: vật vỡ', baiLam: { chinh: CHINH_6.slice() }, hamCuaEmMoi: [H('deliver', ['n'], ['pick()', 'forward(n)', 'release()', 'wait()'])], phaiCoMa: ['vat-vo'] },
        { moTa: 'Chuyến đầu đếm thiếu một ô: vật đặt sai chỗ', baiLam: { chinh: ['deliver(2)', 'forward(1)', 'deliver(2)', 'turn_right()', 'forward(1)', 'deliver(3)'] }, hamCuaEmMoi: [hDeliver()], phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Gọi deliver() không có số', baiLam: { chinh: ['deliver()', 'forward(1)', 'deliver(2)', 'turn_right()', 'forward(1)', 'deliver(3)'] }, hamCuaEmMoi: [hDeliver()], phaiCoMa: ['loi-chay'] }
      ],
      goiY: ['Đếm khoảng cách từ mỗi vật tới ô đích của nó: đó là số n của chuyến.',
        'Giữa các chuyến, xe còn phải đi tới vật kế tiếp.']
    }),

    /* ------------------------------------------------------------- hàng 3 */
    man({
      so: 7, ten: 'Sửa số cố định', hang: 'bien-the', canThamSo: 'tran-khung', hamCuaEmCan: ['move', 'turn_right'],
      deBai: 'Xe xuất phát ở giữa một đường xoắn ốc. Hàm run(n) của màn phải đưa xe tiến n ô rồi rẽ phải; dùng nó để đi hết đường tới cờ.',
      veMaMau: 'Chương trình có sẵn đã gọi run(n) với đúng số ô của từng đoạn, nhưng xe không đi theo đường xoắn ốc. Chạy thử, xem xe làm gì mỗi lần gọi run() rồi sửa thân hàm.',
      san: ['......F', '.######', '.######', '.##..##', '.###.##', '.....##'],
      batDau: { x: 3, y: 3, huong: 1 },
      maMau: { chinh: CHINH_7.slice(), hamCuaMan: [hRun(3)] },
      sao: { o: 13, nhip: 22 },
      loiGiai: { chinh: CHINH_7.slice(), hamCuaMan: [hRun('n')] },
      loiGiaiKhac: {
        moTa: 'Bỏ run(), dùng forward() và turn_right()',
        baiLam: { chinh: ['forward(1)', 'turn_right()', 'forward(2)', 'turn_right()', 'forward(4)', 'turn_right()', 'forward(5)', 'turn_right()', 'forward(6)'] }
      },
      loiSai: [
        { moTa: 'Không sửa gì: run() luôn đi đúng ba ô', baiLam: { chinh: CHINH_7.slice(), hamCuaMan: [hRun(3)] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Sửa số lần lặp nhưng lỡ xóa dòng rẽ phải', baiLam: { chinh: CHINH_7.slice(), hamCuaMan: [H('run', ['n'], FOR('n', ['move()']))] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Dòng rẽ phải bị thụt vào trong vòng lặp: xe rẽ sau mỗi bước', baiLam: { chinh: CHINH_7.slice(), hamCuaMan: [H('run', ['n'], FOR('n', ['move()', 'turn_right()']))] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Gõ nhầm tên đối số trong range()', baiLam: { chinh: CHINH_7.slice(), hamCuaMan: [H('run', ['n'], nhieu(FOR('m', ['move()']), ['turn_right()']))] }, phaiCoMa: ['loi-chay'] }
      ],
      goiY: ['Thử nghĩ: run(2) đi mấy ô, run(4) đi mấy ô? Có giống nhau không?',
        'Con số cố định trong range() chỉ đúng với một lần gọi.']
    }),

    man({
      so: 8, ten: 'Hai tham số', hang: 'bien-the', canThamSo: 'tran-khung', hamCuaEmCan: ['move', 'forward', 'turn_right', 'turn_left'], taoHam: ['step'],
      deBai: 'Mỗi bậc thang là một đoạn đi ngang rồi một đoạn đi xuống, hai đoạn dài ngắn khác nhau. Tạo hàm step(a, b) làm trọn một bậc, rồi dùng nó đưa xe xuống tới cờ.',
      veMaMau: 'Chương trình có sẵn đã gọi step() cho ba bậc thang, nhưng em chưa có hàm đó. Tạo hàm step với hai đối số a và b.',
      san: ['....###', '###...#', '#####.#', '#####..', '######.', '######.', '######F'],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: { chinh: CHINH_8.slice() },
      sao: { o: 16, nhip: 17 },
      loiGiai: { chinh: CHINH_8.slice(), hamCuaEmMoi: [hStep()] },
      loiGiaiKhac: {
        moTa: 'Bậc cuối không dùng step()',
        baiLam: { chinh: ['step(3, 1)', 'step(2, 2)', 'forward(1)', 'turn_right()', 'forward(3)'] },
        hamCuaEmMoi: [hStep()]
      },
      loiSai: [
        { moTa: 'Gọi step() mà chưa tạo hàm', baiLam: { chinh: CHINH_8.slice() }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'step() chỉ có một đối số nhưng vẫn gọi với hai số', baiLam: { chinh: CHINH_8.slice() }, hamCuaEmMoi: [H('step', ['a'], ['forward(a)', 'turn_right()', 'forward(a)', 'turn_left()'])], phaiCoMa: ['loi-chay'] },
        { moTa: 'Gọi step(3) thiếu số thứ hai', baiLam: { chinh: ['step(3)', 'step(2, 2)', 'step(1, 3)'] }, hamCuaEmMoi: [hStep()], phaiCoMa: ['loi-chay'] },
        { moTa: 'Thân step() quên rẽ trái cuối bậc: bậc sau đi sai hướng', baiLam: { chinh: CHINH_8.slice() }, hamCuaEmMoi: [H('step', ['a', 'b'], ['forward(a)', 'turn_right()', 'forward(b)'])], phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Đổi chỗ hai số của bậc đầu: step(1, 3) thay step(3, 1)', baiLam: { chinh: ['step(1, 3)', 'step(2, 2)', 'step(1, 3)'] }, hamCuaEmMoi: [hStep()], phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Nhìn một bậc: xe đi mấy ô ngang, mấy ô xuống? Hai con số đó là hai đối số.',
        'Hàm hai đối số thì mỗi lần gọi đưa vào hai số, cách nhau bằng dấu phẩy.']
    }),

    man({
      so: 9, ten: 'Số lần chứ không phải số ô', hang: 'bien-the', canThamSo: 'tran-khung', hamCuaEmCan: ['move', 'forward', 'turn_right', 'turn_left'],
      deBai: 'Đường có hai đoạn băng chuyền: một đoạn chạy cùng chiều xe, một đoạn chạy ngược chiều. Số lần xe đi không bằng số ô nó đi qua: tính riêng từng đoạn để tới cờ.',
      san: ['...####', '##v####', '##v####', '##v###F', '##v###.', '##.<<<.'],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: { chinh: [] },
      sao: { o: 16, nhip: 16 },
      loiGiai: { chinh: CHINH_9.slice() },
      loiGiaiKhac: {
        moTa: 'Đoạn ngược băng chia thành forward(3) hai lần',
        baiLam: { chinh: ['forward(2)', 'turn_right()', 'forward(3)', 'turn_left()', 'forward(3)', 'forward(3)', 'turn_left()', 'forward(2)'] }
      },
      loiSai: [
        { moTa: 'Đếm theo số ô: đoạn xuôi băng forward(5), đoạn ngược băng forward(4)', baiLam: { chinh: ['forward(2)', 'turn_right()', 'forward(5)', 'turn_left()', 'forward(4)', 'turn_left()', 'forward(2)'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Đoạn ngược băng thiếu một lần: forward(5)', baiLam: { chinh: ['forward(2)', 'turn_right()', 'forward(3)', 'turn_left()', 'forward(5)', 'turn_left()', 'forward(2)'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Đoạn xuôi băng thiếu một lần: xe rẽ trước khi tới chỗ rẽ, đâm tường', baiLam: { chinh: ['forward(2)', 'turn_right()', 'forward(2)', 'turn_left()', 'forward(6)', 'turn_left()', 'forward(2)'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Đoạn ngược băng dư hai lần: vẫn tới cờ nhưng đâm tường và chậm hơn', baiLam: { chinh: ['forward(2)', 'turn_right()', 'forward(3)', 'turn_left()', 'forward(8)', 'turn_left()', 'forward(2)'] }, phaiCoMa: ['dam-tuong'] },
        { moTa: 'Không dùng forward(), viết move() từng lần: mười sáu dòng', baiLam: { chinh: nhieu(lap('move()', 2), ['turn_right()'], lap('move()', 3), ['turn_left()'], lap('move()', 6), ['turn_left()'], lap('move()', 2)) }, phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['Cứ hai nhịp đứng trên băng, băng đẩy xe một ô theo mũi tên: xuôi chiều thì được lời, ngược chiều thì thiệt.',
        'Thử từng đoạn băng một: đổi số trong forward() rồi xem xe dừng ở ô nào.']
    }),

    /* ------------------------------------------------------------- trùm */
    man({
      so: 10, ten: 'Ba chuyến dài', hang: 'trum', canThamSo: 'tran-khung', hamCuaEmCan: ['move', 'forward', 'turn_right', 'turn_left', 'pick', 'drop', 'deliver'],
      mucTieu: 'dua-vat', nhipTheoLoiGiai: true,
      deBai: 'Ba vật nằm ở đầu ba đoạn đường dài, có băng chuyền chạy xuôi hoặc ngược chiều xe. Đưa mỗi vật tới ô đích ở cuối đoạn của nó.',
      san: ['o.>>>.D', '######.', '##D>>.o', '##.####', '##o>>>D'],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: { chinh: [] },
      sao: { o: 31, nhip: 32 },
      huyHieu: { ma: 'tham-so', ten: 'Huy hiệu Hàm có tham số' },
      loiGiai: { chinh: CHINH_10.slice() },
      loiGiaiKhac: {
        moTa: 'Hai khúc rẽ phải gọi qua right(1)',
        baiLam: { chinh: ['deliver(5)', 'right(1)', 'forward(2)', 'right(1)', 'deliver(5)', 'turn_left()', 'forward(2)', 'turn_left()', 'deliver(3)'] }
      },
      loiSai: [
        { moTa: 'Đếm theo số ô: chuyến đầu deliver(6), băng đã đưa xe đi xa nên xe đâm tường một nhịp, chậm hơn', baiLam: { chinh: ['deliver(6)', 'turn_right()', 'forward(2)', 'turn_right()', 'deliver(5)', 'turn_left()', 'forward(2)', 'turn_left()', 'deliver(3)'] }, phaiCoMa: ['dam-tuong'] },
        { moTa: 'Chuyến giữa ngược băng nhưng đếm theo số ô: deliver(4) thiếu lần', baiLam: { chinh: ['deliver(5)', 'turn_right()', 'forward(2)', 'turn_right()', 'deliver(4)', 'turn_left()', 'forward(2)', 'turn_left()', 'deliver(3)'] }, phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên rẽ lần thứ hai giữa hai chuyến: xe đâm tường', baiLam: { chinh: ['deliver(5)', 'turn_right()', 'forward(2)', 'deliver(5)', 'turn_left()', 'forward(2)', 'turn_left()', 'deliver(3)'] }, phaiCoMa: ['dam-tuong', 'chua-dua-vat'] },
        { moTa: 'Không dùng deliver(), viết nhặt - tiến - thả cho từng chuyến: quá 10 ô', baiLam: { chinh: ['pick()', 'forward(5)', 'drop()', 'turn_right()', 'forward(2)', 'turn_right()', 'pick()', 'forward(5)', 'drop()', 'turn_left()', 'forward(2)', 'turn_left()', 'pick()', 'forward(3)', 'drop()'] }, phaiCoMa: ['tran-khung'] }
      ],
      goiY: ['Mỗi đoạn là một chuyến deliver() với số n riêng: đoạn có băng chuyền cần số n khác số ô.',
        'Giữa hai chuyến, xe phải rẽ hai lần và đi sang đoạn kế.']
    })
  ];

  ManHoc.them(DS);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();
