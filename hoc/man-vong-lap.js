/* ============================================================================
   man-vong-lap.js — "Đường học": CHƯƠNG `vong-lap` · VÒNG LẶP for (10 màn).
   Xe hai bánh, Xưởng hàm mở (moXuong true), được dùng hàm của em. Hàm gốc như chương tay-gap
   (bánh, wait, 4 lệnh tay); các màn ở đây chỉ dùng bánh.
   Chương trình 10 ô; mỗi hàm một khung riêng 10 ô (dòng def không tốn ô).
   Cấu trúc mới: `for i in range(n):` (cauTruc ['for']). Dòng `for ...:` chiếm 1 ô, mỗi dòng trong
   thân for cũng 1 ô; thân for thụt 4 dấu cách. Thân hàm vẫn viết ở mức thụt lề 0.

   Hàm của em các màn giả định (kho sau chương xuong-ham): move, turn_right, turn_left
   (u_turn, corner, stair, two cũng đang có trong kho nhưng màn nào cũng không BẮT BUỘC).
   Màn dạy tạo hàm: vong-lap.6 tạo side(); vong-lap.10 tạo row(), bend_left(), bend_right().

   Trường riêng của chương này:
   - canFor: 'tran-khung' — viết KHÔNG dùng for (trải hết vòng lặp ra) thì tràn khung 10 ô của
                            chương trình hoặc của một hàm;
             'mat-sao'    — viết không dùng for vẫn vừa khung nhưng không đạt 3 sao (nhiều ô hơn).
     Máy kiểm (kiem-hoc.mjs) tự trải for của lời giải để chứng minh điều này.

   Sân dựng thành HÀNH LANG (mọi ô ngoài đường đi là tường) để không có đường tắt, trừ hai màn
   sân trống (.1 và .7: sân rộng, đường chữ L/thẳng vẫn là ngắn nhất, BFS kiểm).
   Nối tiếp man-chuoi-1.js vào cùng window.ManHoc. Thứ tự chương: thu-tu-chuong.js.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  // đứng sau chương tay-gap nên cũng có 4 lệnh tay (chưa màn nào dùng tới vật; sân không có vật)
  var HAM_GOC = ['left_move', 'right_move', 'wait', 'arm_down', 'arm_up', 'grab', 'release'];

  var T_MOVE = ['left_move()', 'right_move()', 'wait()'];
  function H(ten, than) { return { ten: ten, thamSo: [], than: than.slice() }; }
  function hSide() { return H('side', FOR(3, ['move()'])); }
  function hRow() { return H('row', FOR(6, ['move()'])); }
  function hBendL() { return H('bend_left', ['turn_left()', 'move()', 'move()', 'turn_left()']); }
  function hBendR() { return H('bend_right', ['turn_right()', 'move()', 'move()', 'turn_right()']); }
  function lap(s, n) { var kq = []; for (var i = 0; i < n; i++) kq.push(s); return kq; }
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  /** Vòng for: dòng đầu rồi thân thụt 4 dấu cách. bien: tên biến lặp (mặc định i). */
  function FOR(n, than, bien) {
    return ['for ' + (bien || 'i') + ' in range(' + n + '):'].concat(than.map(function (s) { return '    ' + s; }));
  }

  function man(m) {
    m.chuong = 'vong-lap';
    m.cauTruc = ['for'];
    m.loaiRobot = 'banh'; m.hamGoc = HAM_GOC;
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    return ManHoc.chuanHoa(m);
  }

  // cụm của màn 5 (bậc thang) và vòng lồng của màn 9
  var CUM_BAC = ['move()', 'turn_right()', 'move()', 'turn_left()'];

  var DS = [
    /* ------------------------------------------------ hàng 1: làm quen */
    man({
      so: 1, ten: 'Lặp lại', hang: 'lam-quen', canFor: 'mat-sao', hamCuaEmCan: ['move'],
      deBai: 'Lá cờ nằm thẳng phía trước xe, cách sáu ô. Đưa xe tới cờ.',
      veMaMau: 'Chương trình có sẵn dùng vòng lặp for để gọi move() hai lần. Số trong range() là số lần lặp.',
      san: ['..F..', '.....', '.....', '.....', '.....', '.....', '.....'],
      batDau: { x: 2, y: 6, huong: 0 },
      maMau: { chinh: FOR(2, ['move()']) },
      sao: { o: 5, nhip: 6 },
      loiGiai: { chinh: FOR(6, ['move()']) },
      loiGiaiKhac: { moTa: 'Không dùng vòng lặp: gọi move() sáu lần', baiLam: { chinh: lap('move()', 6) } },
      loiSai: [
        { moTa: 'Không sửa gì: vòng lặp chỉ chạy hai lần', baiLam: { chinh: FOR(2, ['move()']) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đếm thiếu một: range(5)', baiLam: { chinh: FOR(5, ['move()']) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Dòng move() không thụt lề vào thân vòng lặp', baiLam: { chinh: ['for i in range(6):', 'move()'] }, phaiCoMa: ['loi-cu-phap'] },
        { moTa: 'Thiếu dấu đóng ngoặc của range', baiLam: { chinh: ['for i in range(6:', '    move()'] }, phaiCoMa: ['loi-cu-phap'] }
      ],
      goiY: ['Vòng lặp chạy các dòng thụt vào bên dưới nó đúng bằng số trong range().',
        'Cờ cách xe mấy ô thì move() cần chạy mấy lần?']
    }),

    man({
      so: 2, ten: 'Tự viết vòng lặp', hang: 'lam-quen', canFor: 'mat-sao', hamCuaEmCan: ['move'],
      deBai: 'Xe đứng ở đầu một hành lang thẳng, lá cờ ở tận cuối, cách sáu ô. Viết chương trình đưa xe tới cờ.',
      san: ['#######', '......F', '#######'],
      batDau: { x: 0, y: 1, huong: 1 },
      maMau: { chinh: [] },
      sao: { o: 5, nhip: 6 },
      loiGiai: { chinh: FOR(6, ['move()']) },
      loiGiaiKhac: { moTa: 'Vòng lặp ba lần, mỗi lần hai move()', baiLam: { chinh: FOR(3, ['move()', 'move()']) } },
      loiSai: [
        { moTa: 'Lặp thiếu một lần: range(5)', baiLam: { chinh: FOR(5, ['move()']) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Bỏ qua hàm của em, viết tay từng bánh: quá 10 ô', baiLam: { chinh: nhieu(T_MOVE, T_MOVE, T_MOVE, T_MOVE) }, phaiCoMa: ['tran-khung'] },
        { moTa: 'Vòng lặp nhưng quên thụt lề dòng move()', baiLam: { chinh: ['for i in range(6):', 'move()'] }, phaiCoMa: ['loi-cu-phap'] }
      ],
      goiY: ['Cần gọi move() sáu lần, nhưng chỉ viết nó một lần.']
    }),

    man({
      so: 3, ten: 'Hai đoạn thẳng', hang: 'lam-quen', canFor: 'tran-khung', hamCuaEmCan: ['move', 'turn_right'],
      deBai: 'Xe đi lên năm ô, rẽ phải, rồi đi tiếp sáu ô tới cờ. Mỗi đoạn thẳng dùng một vòng for riêng.',
      san: ['......F', '.######', '.######', '.######', '.######', '.######'],
      batDau: { x: 0, y: 5, huong: 0 },
      maMau: { chinh: [] },
      sao: { o: 10, nhip: 12 },
      loiGiai: { chinh: nhieu(FOR(5, ['move()']), ['turn_right()'], FOR(6, ['move()'])) },
      loiGiaiKhac: {
        moTa: 'Đoạn đầu dùng vòng lặp, đoạn sau gọi move() sáu lần',
        baiLam: { chinh: nhieu(FOR(5, ['move()']), ['turn_right()'], lap('move()', 6)) }
      },
      loiSai: [
        { moTa: 'Không dùng vòng lặp: 12 dòng, quá 10 ô', baiLam: { chinh: nhieu(lap('move()', 5), ['turn_right()'], lap('move()', 6)) }, phaiCoMa: ['tran-khung'] },
        { moTa: 'Đoạn hai lặp thiếu một lần', baiLam: { chinh: nhieu(FOR(5, ['move()']), ['turn_right()'], FOR(5, ['move()'])) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên rẽ phải: xe đâm thẳng ra ngoài sân', baiLam: { chinh: nhieu(FOR(5, ['move()']), FOR(6, ['move()'])) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Hai đoạn thẳng khác độ dài thì cần hai vòng for với hai số khác nhau.',
        'Giữa hai vòng for là một lần rẽ.']
    }),

    /* ------------------------------------------------------------- hàng 2 */
    man({
      so: 4, ten: 'Lặp một cụm', hang: 'luyen', canFor: 'mat-sao', hamCuaEmCan: ['move', 'turn_right'],
      deBai: 'Hành lang hình chữ U nằm ngang: đi hai ô, rẽ phải, đi hai ô, rẽ phải, đi hai ô tới cờ. Phần "đi hai ô rồi rẽ phải" cứ lặp lại.',
      san: ['...', '##.', 'F..'],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: { chinh: [] },
      sao: { o: 9, nhip: 8 },
      loiGiai: { chinh: FOR(3, ['move()', 'move()', 'turn_right()']) },
      loiGiaiKhac: { moTa: 'Vòng lặp gọi corner() của em', baiLam: { chinh: FOR(3, ['corner()']) } },
      loiSai: [
        { moTa: 'Quên rẽ trong thân vòng lặp: xe đâm tường', baiLam: { chinh: FOR(3, ['move()', 'move()']) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Lặp hai lần thay vì ba', baiLam: { chinh: FOR(2, ['move()', 'move()', 'turn_right()']) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Dòng rẽ phải nằm ngoài vòng lặp: xe không rẽ giữa chừng', baiLam: { chinh: nhieu(FOR(3, ['move()', 'move()']), ['turn_right()']) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Thân vòng lặp có thể có nhiều dòng; cả cụm cùng thụt lề.',
        'Một cụm là: đi hai ô rồi rẽ phải. Cần lặp bao nhiêu cụm?']
    }),

    man({
      so: 5, ten: 'Bậc thang', hang: 'luyen', canFor: 'tran-khung', hamCuaEmCan: ['move', 'turn_right', 'turn_left'],
      deBai: 'Xe đi xuống năm bậc thang, mỗi bậc là: đi một ô, rẽ phải, đi một ô, rẽ trái. Đưa xe tới cờ ở bậc cuối.',
      san: ['..####', '#..###', '##..##', '###..#', '####..', '#####F'],
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: { chinh: [] },
      sao: { o: 12, nhip: 19 },
      loiGiai: { chinh: FOR(5, CUM_BAC) },
      loiGiaiKhac: { moTa: 'Vòng lặp gọi stair() của em', baiLam: { chinh: FOR(5, ['stair()']) } },
      loiSai: [
        { moTa: 'Không dùng vòng lặp: hơn 10 dòng', baiLam: { chinh: nhieu(CUM_BAC, CUM_BAC, CUM_BAC, CUM_BAC, CUM_BAC) }, phaiCoMa: ['tran-khung'] },
        { moTa: 'Quên rẽ trái cuối mỗi bậc: xe đi sai hướng, đâm tường', baiLam: { chinh: FOR(5, ['move()', 'turn_right()', 'move()']) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Lặp bốn bậc thay vì năm', baiLam: { chinh: FOR(4, CUM_BAC) }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Một bậc là bốn lệnh. Chương trình cần lặp bao nhiêu bậc?']
    }),

    man({
      so: 6, ten: 'Vòng lặp trong hàm', hang: 'luyen', canFor: 'mat-sao', hamCuaEmCan: ['move', 'turn_right', 'turn_left'], taoHam: ['side'],
      deBai: 'Tạo hàm side() đi thẳng ba ô, rồi dùng nó đưa xe: lên ba ô, rẽ phải, ba ô, rẽ trái, ba ô tới cờ.',
      san: ['###F', '###.', '###.', '....', '.###', '.###', '.###'],
      batDau: { x: 0, y: 6, huong: 0 },
      maMau: { chinh: [] },
      sao: { o: 14, nhip: 11 },
      loiGiai: { chinh: ['side()', 'turn_right()', 'side()', 'turn_left()', 'side()'], hamCuaEmMoi: [hSide()] },
      loiGiaiKhac: {
        moTa: 'Gọi side() hai lần, đoạn giữa viết lại vòng for ngay trong chương trình',     // 23/10: phải gọi side() (taoHam) mới thắng
        baiLam: { chinh: nhieu(['side()', 'turn_right()'], FOR(3, ['move()']), ['turn_left()', 'side()']) },
        hamCuaEmMoi: [hSide()]
      },
      loiSai: [
        { moTa: 'side() chỉ đi một ô (chưa có vòng lặp trong thân hàm)', baiLam: { chinh: ['side()', 'turn_right()', 'side()', 'turn_left()', 'side()'] },
          hamCuaEmMoi: [H('side', ['move()'])], phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Gọi side() mà chưa tạo hàm', baiLam: { chinh: ['side()', 'turn_right()', 'side()', 'turn_left()', 'side()'] }, phaiCoMa: ['ham-chua-co'] },
        { moTa: 'Trong side() dòng move() không thụt lề', baiLam: { chinh: ['side()', 'turn_right()', 'side()', 'turn_left()', 'side()'] },
          hamCuaEmMoi: [H('side', ['for i in range(3):', 'move()'])], phaiCoMa: ['loi-cu-phap'] }
      ],
      goiY: ['Thân hàm cũng viết được vòng for, các dòng bên trong thụt vào.',
        'Có ba đoạn thẳng bằng nhau, ngăn cách bằng hai lần rẽ.']
    }),

    /* ------------------------------------------------------------- hàng 3 */
    man({
      so: 7, ten: 'Lệch một', hang: 'bien-the', canFor: 'mat-sao', hamCuaEmCan: ['move', 'turn_right'],
      deBai: 'Xe đi lên bốn ô, rẽ phải, rồi đi tiếp ba ô tới cờ.',
      veMaMau: 'Chương trình có sẵn dùng vòng lặp nhưng xe đi lố, không tới được cờ. Chạy thử, xem xe rẽ ở đâu rồi chỉnh số lần lặp.',
      san: ['.....', '...F.', '.....', '.....', '.....', '.....'],
      batDau: { x: 0, y: 5, huong: 0 },
      maMau: { chinh: nhieu(FOR(5, ['move()']), ['turn_right()'], FOR(3, ['move()'])) },
      sao: { o: 10, nhip: 8 },
      loiGiai: { chinh: nhieu(FOR(4, ['move()']), ['turn_right()'], FOR(3, ['move()'])) },
      loiGiaiKhac: { moTa: 'Không dùng vòng lặp: gọi move() từng lần', baiLam: { chinh: nhieu(lap('move()', 4), ['turn_right()'], lap('move()', 3)) } },
      loiSai: [
        { moTa: 'Không sửa gì: lặp năm lần nên xe rẽ quá xa', baiLam: { chinh: nhieu(FOR(5, ['move()']), ['turn_right()'], FOR(3, ['move()'])) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Sửa quá tay: range(3)', baiLam: { chinh: nhieu(FOR(3, ['move()']), ['turn_right()'], FOR(3, ['move()'])) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Sửa nhầm vòng lặp thứ hai', baiLam: { chinh: nhieu(FOR(5, ['move()']), ['turn_right()'], FOR(4, ['move()'])) }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Đếm số ô xe phải đi lên trước khi rẽ, rồi so với số trong range().',
        'Một vòng lặp chạy dư một lần cũng làm xe rẽ lệch hàng.']
    }),

    man({
      so: 8, ten: 'Thụt lề', hang: 'bien-the', canFor: 'mat-sao', hamCuaEmCan: ['move', 'turn_left'],
      deBai: 'Xe đi sang phải bốn ô, rẽ trái, rồi đi lên ba ô tới cờ.',
      veMaMau: 'Chương trình có sẵn đủ lệnh nhưng xe cứ quay vòng thay vì đi thẳng. Thụt vào là nằm trong vòng lặp, thụt ra là nằm ngoài: có dòng nào đang đứng sai chỗ?',
      san: ['####F', '####.', '####.', '.....'],
      batDau: { x: 0, y: 3, huong: 1 },
      maMau: { chinh: nhieu(FOR(4, ['move()', 'turn_left()']), FOR(3, ['move()'])) },
      sao: { o: 10, nhip: 8 },
      loiGiai: { chinh: nhieu(FOR(4, ['move()']), ['turn_left()'], FOR(3, ['move()'])) },
      loiGiaiKhac: { moTa: 'Không dùng vòng lặp: gọi move() từng lần', baiLam: { chinh: nhieu(lap('move()', 4), ['turn_left()'], lap('move()', 3)) } },
      loiSai: [
        { moTa: 'Không sửa gì: turn_left() nằm trong vòng lặp nên xe quay vòng, đâm tường', baiLam: { chinh: nhieu(FOR(4, ['move()', 'turn_left()']), FOR(3, ['move()'])) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Cả vòng for thứ hai bị thụt vào: thụt lề thừa', baiLam: { chinh: ['for i in range(4):', '    move()', 'turn_left()', '    for i in range(3):', '        move()'] }, phaiCoMa: ['loi-thut-le'] },
        { moTa: 'Quên rẽ trái: xe đâm tường', baiLam: { chinh: nhieu(FOR(4, ['move()']), FOR(3, ['move()'])) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Chạy thử và xem xe làm gì ở nhịp thứ hai: nó rẽ sớm hơn dự định.',
        'Dòng rẽ chỉ nên chạy một lần, sau khi vòng lặp đầu đã đi xong.']
    }),

    man({
      // 15/10 user: bản cũ 5 – 3 – 5 với lời giải lặp cụm "5, rẽ, 3, rẽ" HAI lần chỉ đúng nhờ xe tới cờ giữa vòng (code không khớp đường đi).
      // Nay ba đoạn đều 5 ô: code khớp đúng đường. Bỏ hẳn for thì tràn khung; một vòng ngoài không lồng vẫn vừa nhưng chỉ 2 sao (loiGiaiKhac).
      so: 9, ten: 'Vòng lặp lồng nhau', hang: 'bien-the', canFor: 'tran-khung', hamCuaEmCan: ['move', 'turn_right'],
      deBai: 'Hành lang hình chữ U úp ngược: lên năm ô, rẽ phải, sang năm ô, rẽ phải, xuống năm ô tới cờ. Ba đoạn giống hệt nhau là "đi năm ô rồi rẽ phải", mà đi năm ô cũng là một vòng lặp.',
      san: ['......', '.####.', '.####.', '.####.', '.####.', '.####F'],
      batDau: { x: 0, y: 5, huong: 0 },
      maMau: { chinh: [] },
      sao: { o: 9, nhip: 17 },
      loiGiai: { chinh: FOR(3, nhieu(FOR(5, ['move()'], 'j'), ['turn_right()'])) },
      loiGiaiKhac: {
        moTa: 'Không lồng vòng lặp: vòng ngoài gọi move() năm lần rồi rẽ',
        baiLam: { chinh: FOR(3, nhieu(lap('move()', 5), ['turn_right()'])) }
      },
      loiSai: [
        { moTa: 'Vòng ngoài chỉ lặp hai lần: xe dừng ở góc trên bên phải', baiLam: { chinh: FOR(2, nhieu(FOR(5, ['move()'], 'j'), ['turn_right()'])) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Vòng trong lặp bốn lần: xe rẽ sớm một ô rồi đâm tường', baiLam: { chinh: FOR(3, nhieu(FOR(4, ['move()'], 'j'), ['turn_right()'])) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Vòng trong không thụt lề vào vòng ngoài', baiLam: { chinh: ['for i in range(3):', 'for j in range(5):', '    move()'] }, phaiCoMa: ['loi-cu-phap'] }
      ],
      goiY: ['Vòng lặp có thể nằm trong thân một vòng lặp khác, thụt vào thêm một bậc.',
        'Ba đoạn giống nhau thì vòng ngoài lặp ba lần; mỗi đoạn năm ô là một vòng trong.']
    }),

    /* ------------------------------------------------------------- trùm */
    man({
      // 15/10 user: bản cũ bốn hàng với lời giải lặp cụm "hàng, rẽ trái, hàng, rẽ phải" HAI lần: lần rẽ phải cuối (cả hai bước đi) không bao giờ chạy
      // vì xe tới cờ trước. Nay năm hàng: row() rồi lặp hai lần "rẽ trái, hàng, rẽ phải, hàng" — code khớp đúng đường, không dư lệnh nào.
      so: 10, ten: 'Đường ngoằn ngoèo', hang: 'trum', canFor: 'mat-sao', hamCuaEmCan: ['move', 'turn_left', 'turn_right'], taoHam: ['row', 'bend_left', 'bend_right'],
      deBai: 'Hành lang ngoằn ngoèo gồm năm hàng, mỗi hàng đi sáu ô, nối nhau ở hai đầu. Gói từng phần thành hàm và dùng vòng lặp để đưa xe tới cờ.',
      san: ['......F', '.######', '.......', '######.', '.......', '.######', '.......', '######.', '.......'],
      batDau: { x: 0, y: 8, huong: 1 },
      maMau: { chinh: [] },
      sao: { o: 23, nhip: 46 },
      huyHieu: { ma: 'vong-lap', ten: 'Huy hiệu Vòng lặp' },
      loiGiai: {
        chinh: ['row()'].concat(FOR(2, ['bend_left()', 'row()', 'bend_right()', 'row()'])),
        hamCuaEmMoi: [hRow(), hBendL(), hBendR()]
      },
      loiGiaiKhac: {
        moTa: 'Không dùng vòng lặp ngoài: gọi hàm chín lần',
        baiLam: { chinh: ['row()', 'bend_left()', 'row()', 'bend_right()', 'row()', 'bend_left()', 'row()', 'bend_right()', 'row()'] },
        hamCuaEmMoi: [hRow(), hBendL(), hBendR()]
      },
      loiSai: [
        { moTa: 'Không gói chỗ rẽ thành hàm: vòng ngoài vượt 10 ô', baiLam: { chinh: ['row()'].concat(FOR(2, ['turn_left()', 'move()', 'move()', 'turn_left()', 'row()', 'turn_right()', 'move()', 'move()', 'turn_right()', 'row()'])) },
          hamCuaEmMoi: [hRow()], phaiCoMa: ['tran-khung'] },
        { moTa: 'bend_right() rẽ nhầm sang trái: xe đâm tường', baiLam: { chinh: ['row()'].concat(FOR(2, ['bend_left()', 'row()', 'bend_right()', 'row()'])) },
          hamCuaEmMoi: [hRow(), hBendL(), H('bend_right', ['turn_left()', 'move()', 'move()', 'turn_left()'])], phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'row() lặp thiếu một ô: xe rẽ sớm một ô', baiLam: { chinh: ['row()'].concat(FOR(2, ['bend_left()', 'row()', 'bend_right()', 'row()'])) },
          hamCuaEmMoi: [H('row', FOR(5, ['move()'])), hBendL(), hBendR()], phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Vòng ngoài chỉ lặp một lần: xe dừng giữa đường', baiLam: { chinh: ['row()'].concat(FOR(1, ['bend_left()', 'row()', 'bend_right()', 'row()'])) },
          hamCuaEmMoi: [hRow(), hBendL(), hBendR()], phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Chưa tạo hàm row() mà đã gọi', baiLam: { chinh: ['row()'].concat(FOR(2, ['bend_left()', 'row()', 'bend_right()', 'row()'])) },
          hamCuaEmMoi: [hBendL(), hBendR()], phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Năm hàng, bốn chỗ rẽ: hai kiểu rẽ thay phiên nhau, mỗi kiểu một hàm.',
        'Sau hàng đầu tiên, cụm "rẽ trái, hàng, rẽ phải, hàng" lặp lại hai lần.']
    })
  ];

  ManHoc.them(DS);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();
