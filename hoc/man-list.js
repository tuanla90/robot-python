/* ============================================================================
   man-list.js — "Đường học": CHƯƠNG `list` · DANH SÁCH (10 màn). Kế hoạch KE-HOACH-LIST-FLYCAM.md (mục 3), làm 17/10.
   Chương thứ 15 (ngay sau Chế lệnh nhện, trước Bánh xích). Chương chế lệnh đi kèm: man-che-list.js (route, route_left, scan, box).
   Robot là XE HAI BÁNH (không tay, không cảm biến): robot { than: 'hai-banh', tay: null, camBien: [] }, hàm gốc = bánh (tiến, lùi) + wait. Xưởng hàm mở, được dùng hàm của em.
   Hàm của em dùng ở đây (đã chế ở chương trước): forward(n) (tham-so.3), right(k) (tham-so.4), turn_right, turn_left (chế xe). Chương trình 10 ô; mỗi hàm một khung riêng 10 ô.
   cauTruc ['for', 'list']: khay có nhóm DANH SÁCH (a = [1, 2], for n in a:, for n in [1, 2]:, a.append(1)) ở thẻ Logic; chạm một số trong [ ] để sửa, "thêm ô", "bỏ ô".

   LÝ DO CẦN LIST (thật): mỗi đoạn đường dài một số ô khác nhau, và chương trình chỉ có 10 ô. Viết forward(n) + rẽ cho từng đoạn thì từ sáu đoạn trở đi tràn khung
   (`canList: 'tran-khung'`, máy kiểm kiem-list-man.mjs chứng minh bằng chương trình viết thẳng trong loiSai); ghi các số vào một danh sách rồi `for n in a:` thì chỉ vài dòng.
   Sân là HÀNH LANG (mọi ô ngoài đường đi là tường, không hai ô đường nào kề nhau trừ các ô liền nhau) nên không có đường tắt; BFS (do-duong-che-cam-bien.mjs) xác nhận.
   Mục tiêu tới cờ ở cả 10 màn.

   Python học ở chương: danh sách (list). Số trong danh sách là 1–9, tối đa 6 số một danh sách.
     list.1  a = [4, 2, 3] rồi for n in a:  — khai danh sách, duyệt từng số (forward(n))
     list.2  sáu đoạn: chương trình viết thẳng tràn 10 ô, danh sách thì gọn — thêm ô nhiều lần
     list.3  sửa một danh sách có sẵn: đổi một số, thêm ô còn thiếu
     list.4  hai danh sách, hai vòng for (đường chữ S: đoạn rẽ phải rồi đoạn rẽ trái)
     list.5  a[i] và range(len(a)): hai danh sách song song (độ dài đoạn và số lần quay phải sau đoạn: 1 = rẽ phải, 3 = rẽ trái)
     list.6  len(a): đoạn cuối dài đúng bằng số đoạn đã đi
     list.7  lỗi chỉ số ngoài danh sách (đếm từ 0): danh sách thiếu một số
     list.8  danh sách làm ĐỐI SỐ: hàm của màn tour(steps), tour_left(steps) (cho sẵn, khóa); gọi tour([..]) và tour_left([..])
     list.9  sửa hàm của màn tour(steps): steps[0] thay cho steps[i]
     list.10 trùm: hai danh sách song song + len(a) cho đoạn cuối, tự viết chương trình chính; huy hiệu `list`

   Hàm CỦA MÀN (không vào kho, không có trong Sổ lệnh): tour(steps), tour_left(steps) ở list.8 (khóa) và list.9 (tour có lỗi, người chơi sửa).
   Hàm của em MỚI: không có (chương làm quen chỉ dùng hàm đã chế; hàm nhận danh sách đầu tiên của em là route(steps) ở che-list.1).

   Trường riêng: canList: 'tran-khung' — viết KHÔNG dùng danh sách thì tràn khung 10 ô (list.2, 4, 5, 8, 10; kiem-list-man.mjs chứng minh).
   nhipTheoLoiGiai: true ở list.5 và list.10 (right(3) tốn 3 nhịp để rẽ trái, nên lời giải chuẩn dài hơn đường ngắn nhất 1 nhịp mỗi lần rẽ trái).
   Hướng: 0 lên, 1 phải, 2 xuống, 3 trái. (x, y) với y = 0 ở hàng trên.
   Nối tiếp man-chuoi-1.js vào cùng window.ManHoc. Thứ tự chương: thu-tu-chuong.js.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];

  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  function lap(s, n) { var kq = []; for (var i = 0; i < n; i++) kq.push(s); return kq; }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  /** Dòng gán danh sách: LS('a', [4, 2, 3]) → 'a = [4, 2, 3]'. */
  function LS(ten, ds) { return ten + ' = [' + ds.join(', ') + ']'; }
  /** Vòng for n in <ten>: tiến n ô rồi rẽ (turn_right() hay turn_left()). */
  function DUYET(ten, re) { return ['for n in ' + ten + ':', '    forward(n)', '    ' + (re || 'turn_right()')]; }
  /** Viết thẳng từng đoạn (không danh sách): forward(n) rồi rẽ, không rẽ sau đoạn cuối. rs: mảng 'turn_right()' / 'turn_left()' sau từng đoạn (trừ đoạn cuối). */
  function THANG(lens, rs) {
    var kq = [];
    lens.forEach(function (n, i) { kq.push('forward(' + n + ')'); if (i < lens.length - 1) kq.push(typeof rs === 'string' ? rs : rs[i]); });
    return kq;
  }
  /** Thân hàm tour(steps) / tour_left(steps) của màn. */
  function tour(re, chiSo) { return ['for i in range(len(steps)):', '    forward(steps[' + (chiSo === undefined ? 'i' : chiSo) + '])', '    ' + re]; }
  function tourDuyet(re) { return ['for n in steps:', '    forward(n)', '    ' + re]; }

  function man(m) {
    m.chuong = 'list';
    m.cauTruc = ['for', 'list'];
    m.loaiRobot = 'banh';
    m.robot = { than: 'hai-banh', tay: null, camBien: [] };
    m.hamGoc = BANH.slice();
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    return ManHoc.chuanHoa(m);
  }

  /* ------------------------------------------------------------------- sân (dựng từ đường đi, kiểm bằng bộ dò) */
  // 1: ba đoạn 4 - 2 - 3, hai khúc rẽ phải; xe ở (0,0) quay phải; cờ (1,2)
  var SAN_1 = ['.....', '####.', '#F...'];
  // 2: xoắn ốc sáu đoạn 6 - 7 - 4 - 5 - 2 - 3, năm khúc rẽ phải; xe ở (0,0) quay phải; cờ (4,5)
  var SAN_2 = ['.......', '######.', '##...#.', '##.#.#.', '##.#.#.', '##.#F#.', '##.###.', '##.....'];
  // 3: xoắn ốc ngược chiều kim đồng hồ 6 - 6 - 3 - 4 - 1, bốn khúc rẽ trái; xe ở (6,0) quay trái; cờ (2,2)
  var SAN_3 = ['.......', '.######', '.#F.###', '.##.###', '.##.###', '.##.###', '....###'];
  // 4: chữ S: 4 - 3 (rẽ phải) rồi 2 - 4 - 3 - 2 (rẽ trái); xe ở (0,0) quay phải; cờ (5,5)
  var SAN_4 = ['.....#', '####.#', '####.#', '##...#', '##.###', '##.##F', '##.##.', '##....'];
  // 5: sáu đoạn 5 - 3 - 2 - 3 - 3 - 2, rẽ phải / trái / phải / phải / phải; xe ở (0,7) quay lên; cờ (4,3)
  var SAN_5 = ['###....', '###.##.', '....##.', '.###F..', '.######', '.######', '.######', '.######'];
  // 6: ba đoạn 6 - 5 - 4, rẽ phải sau mỗi đoạn, rồi đoạn cuối dài 3; xe ở (0,0) quay phải; cờ (2,2)
  var SAN_6 = ['.......', '######.', '##F###.', '##.###.', '##.###.', '##.....'];
  // 7: bốn đoạn 4 - 6 - 5 - 2, rẽ phải sau mỗi đoạn; xe ở (1,0) quay phải; cờ (0,4)
  var SAN_7 = ['#.....', '#####.', '#####.', '#####.', 'F####.', '.####.', '......'];
  // 8: ba đoạn rẽ phải 2 - 4 - 2 rồi bốn đoạn rẽ trái 1 - 4 - 5 - 1; xe ở (4,0) quay phải; cờ (1,8)
  var SAN_8 = ['####...', '######.', '######.', '.....#.', '.###...', '.######', '.######', '.######', '.F#####'];
  // 9: năm đoạn 4 - 3 - 6 - 2 - 1, rẽ phải sau mỗi đoạn; xe ở (2,0) quay phải; cờ (1,1)
  var SAN_9 = ['##.....', '.F####.', '.#####.', '.......'];
  // 10: năm đoạn 4 - 2 - 3 - 2 - 5 (rẽ trái, trái, phải, phải, phải) rồi đoạn cuối dài 5; xe ở (1,0) quay xuống; cờ (0,6)
  var SAN_10 = ['#.####', '#.#...', '#.#.#.', '#.#.#.', '#...#.', '#####.', 'F.....'];

  var A_1 = [4, 2, 3];
  var A_2 = [6, 7, 4, 5, 2, 3];
  var A_3 = [6, 6, 3, 4, 1];
  var A_4 = [4, 3], B_4 = [2, 4, 3, 2];
  var A_5 = [5, 3, 2, 3, 3, 2], B_5 = [1, 3, 1, 1, 1, 1];
  var A_6 = [6, 5, 4];
  var A_7 = [4, 6, 5, 2];
  var A_8 = [2, 4, 2], B_8 = [1, 4, 5, 1];
  var A_9 = [4, 3, 6, 2, 1];
  var A_10 = [4, 2, 3, 2, 5], B_10 = [3, 3, 1, 1, 1];

  // chương trình của từng màn (lời giải gọn)
  var C_1 = nhieu([LS('a', A_1)], DUYET('a'));
  var C_2 = nhieu([LS('a', A_2)], DUYET('a'));
  var C_3 = nhieu([LS('a', A_3)], DUYET('a', 'turn_left()'));
  var C_4 = nhieu([LS('a', A_4), LS('b', B_4)], DUYET('a'), DUYET('b', 'turn_left()'));
  var C_5 = [LS('a', A_5), LS('b', B_5), 'for i in range(len(a)):', '    forward(a[i])', '    right(b[i])'];
  var C_6 = nhieu([LS('a', A_6)], DUYET('a'), ['forward(len(a))']);
  var C_7 = nhieu([LS('a', A_7)], ['for i in range(4):', '    forward(a[i])', '    turn_right()']);
  var C_8 = ['tour(' + '[' + A_8.join(', ') + '])', 'tour_left(' + '[' + B_8.join(', ') + '])'];
  var C_9 = ['tour([' + A_9.join(', ') + '])'];
  var C_10 = [LS('a', A_10), LS('b', B_10), 'for i in range(len(a)):', '    forward(a[i])', '    right(b[i])', 'forward(len(a))'];

  var DS = [
    /* ------------------------------------------------------------ hàng 1: làm quen */
    man({
      so: 1, ten: 'Danh sách đầu tiên', hang: 'lam-quen', hamCuaEmCan: ['forward', 'turn_right'],
      deBai: 'Đường tới cờ có ba đoạn dài 4, 2 và 3 ô, hết đoạn nào xe rẽ phải. Ghi ba số đó vào một danh sách a, rồi cho xe đi theo từng số.',
      san: SAN_1,
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: { chinh: [] },
      sao: { o: 11, nhip: 11 },
      loiGiai: { chinh: C_1.slice() },
      loiGiaiKhac: {
        moTa: 'Không dùng danh sách: gọi forward() từng đoạn',
        baiLam: { chinh: THANG(A_1, 'turn_right()') }
      },
      loiSai: [
        { moTa: 'Dùng a mà quên khai báo danh sách', baiLam: { chinh: DUYET('a') }, phaiCoMa: ['loi-chay'] },
        { moTa: 'Danh sách thiếu số cuối: xe dừng sau hai đoạn', baiLam: { chinh: nhieu([LS('a', [4, 2])], DUYET('a')) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên rẽ sau mỗi đoạn: xe đi thẳng và đâm tường', baiLam: { chinh: [LS('a', A_1), 'for n in a:', '    forward(n)'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Rẽ nhầm sang trái: xe đâm tường', baiLam: { chinh: nhieu([LS('a', A_1)], DUYET('a', 'turn_left()')) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Đưa cả danh sách vào forward(): forward() cần một số, không phải danh sách', baiLam: { chinh: [LS('a', A_1), 'forward(a)'] }, phaiCoMa: ['loi-chay'] }
      ],
      goiY: ['Mỗi số trong danh sách là độ dài một đoạn đường, theo thứ tự xe đi.',
        'for n in a: lấy lần lượt từng số của danh sách ra làm n. Sau mỗi đoạn xe phải rẽ.']
    }),

    man({
      so: 2, ten: 'Đường xoắn ốc', hang: 'lam-quen', canList: 'tran-khung', hamCuaEmCan: ['forward', 'turn_right'],
      deBai: 'Đường xoắn ốc có sáu đoạn dài 6, 7, 4, 5, 2 và 3 ô, hết đoạn nào xe rẽ phải. Chương trình chỉ có 10 ô, nên hãy ghi các số vào một danh sách.',
      san: SAN_2,
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: { chinh: [] },
      sao: { o: 11, nhip: 32 },
      loiGiai: { chinh: C_2.slice() },
      loiGiaiKhac: {
        moTa: 'Cùng danh sách, thêm một dòng chú thích',
        baiLam: { chinh: nhieu([LS('a', A_2)], ['# đi theo từng số'], DUYET('a')) }
      },
      loiSai: [
        { moTa: 'Không dùng danh sách: mười một dòng, quá 10 ô', baiLam: { chinh: THANG(A_2, 'turn_right()') }, phaiCoMa: ['tran-khung'] },
        { moTa: 'Danh sách thiếu số cuối: xe dừng cách cờ ba ô', baiLam: { chinh: nhieu([LS('a', A_2.slice(0, 5))], DUYET('a')) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đổi chỗ hai số 4 và 5: xe đâm tường ở khúc thứ ba', baiLam: { chinh: nhieu([LS('a', [6, 7, 5, 4, 2, 3])], DUYET('a')) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Danh sách đúng nhưng quên rẽ: xe đâm tường', baiLam: { chinh: [LS('a', A_2), 'for n in a:', '    forward(n)'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Đếm số ô của từng đoạn từ chỗ xe đứng, theo đúng thứ tự xe đi.',
        'Muốn thêm một số vào danh sách thì chạm một số rồi chọn thêm ô.']
    }),

    man({
      so: 3, ten: 'Sửa danh sách', hang: 'lam-quen', hamCuaEmCan: ['forward', 'turn_left'],
      deBai: 'Xe phải đi các đoạn dài 6, 6, 3, 4 và 1 ô, hết đoạn nào rẽ trái. Danh sách có sẵn viết sai một số và thiếu một số. Sửa danh sách để xe tới cờ.',
      veMaMau: 'Chương trình có sẵn đã đi theo danh sách a nhưng xe đâm tường. Chạy thử, xem xe sai từ đoạn nào, rồi sửa danh sách.',
      san: SAN_3,
      batDau: { x: 6, y: 0, huong: 3 },
      maMau: { chinh: nhieu([LS('a', [6, 6, 4, 4])], DUYET('a', 'turn_left()')) },
      sao: { o: 11, nhip: 24 },
      loiGiai: { chinh: C_3.slice() },
      loiGiaiKhac: {
        moTa: 'Không dùng danh sách: gọi forward() từng đoạn',
        baiLam: { chinh: THANG(A_3, 'turn_left()') }
      },
      loiSai: [
        { moTa: 'Không sửa gì: số 4 ở đoạn thứ ba làm xe đâm tường', baiLam: { chinh: nhieu([LS('a', [6, 6, 4, 4])], DUYET('a', 'turn_left()')) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Sửa số sai nhưng quên thêm số cuối: xe dừng sát cờ', baiLam: { chinh: nhieu([LS('a', [6, 6, 3, 4])], DUYET('a', 'turn_left()')) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Thêm số cuối nhưng quên sửa số 4 ở đoạn thứ ba: xe đâm tường một lần, tới cờ chậm hơn một nhịp', baiLam: { chinh: nhieu([LS('a', [6, 6, 4, 4, 1])], DUYET('a', 'turn_left()')) }, phaiCoMa: [] },
        { moTa: 'Sửa nhầm đoạn thứ tư thành 3: xe dừng cách cờ hai ô', baiLam: { chinh: nhieu([LS('a', [6, 6, 3, 3, 1])], DUYET('a', 'turn_left()')) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Chạy thử và nhìn xe đâm tường ở đoạn nào: số ở chỗ đó trong danh sách đã đúng chưa?',
        'Đoạn nào cũng đếm từ ô xe đứng tới ô trước khúc rẽ. Danh sách còn thiếu một đoạn.']
    }),

    /* ------------------------------------------------------------ hàng 2: luyện */
    man({
      so: 4, ten: 'Đường chữ S', hang: 'luyen', canList: 'tran-khung', hamCuaEmCan: ['forward', 'turn_right', 'turn_left'],
      deBai: 'Đường chữ S có hai đoạn đầu rẽ phải, bốn đoạn sau rẽ trái. Ghi các đoạn rẽ phải vào danh sách a, các đoạn rẽ trái vào danh sách b, mỗi danh sách một vòng for.',
      san: SAN_4,
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: { chinh: [] },
      sao: { o: 17, nhip: 23 },
      loiGiai: { chinh: C_4.slice() },
      loiGiaiKhac: {
        moTa: 'Cùng hai danh sách, thêm hai dòng chú thích',
        baiLam: { chinh: nhieu([LS('a', A_4), LS('b', B_4)], ['# đoạn rẽ phải'], DUYET('a'), ['# đoạn rẽ trái'], DUYET('b', 'turn_left()')) }
      },
      loiSai: [
        { moTa: 'Không dùng danh sách: mười một dòng, quá 10 ô', baiLam: { chinh: THANG(A_4.concat(B_4), ['turn_right()', 'turn_right()', 'turn_left()', 'turn_left()', 'turn_left()']) }, phaiCoMa: ['tran-khung'] },
        { moTa: 'Cả hai vòng đều rẽ phải: xe đâm tường ở khúc thứ ba', baiLam: { chinh: nhieu([LS('a', A_4), LS('b', B_4)], DUYET('a'), DUYET('b')) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Chỉ có một danh sách a gồm sáu số, rẽ phải hết: xe đâm tường', baiLam: { chinh: nhieu([LS('a', A_4.concat(B_4))], DUYET('a')) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Vòng thứ hai quên đổi sang danh sách b: for n in a chạy lại hai đoạn đầu', baiLam: { chinh: nhieu([LS('a', A_4), LS('b', B_4)], DUYET('a'), DUYET('a', 'turn_left()')) }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Danh sách b thiếu số cuối: xe dừng sát cờ', baiLam: { chinh: nhieu([LS('a', A_4), LS('b', [2, 4, 3])], DUYET('a'), DUYET('b', 'turn_left()')) }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Chia đường đi làm hai phần: các đoạn mà sau đó xe rẽ phải, và các đoạn mà sau đó xe rẽ trái.',
        'Vòng for thứ hai dùng danh sách b: chạm tên danh sách trong dòng for để đổi từ a sang b.']
    }),

    man({
      so: 5, ten: 'Hai danh sách', hang: 'luyen', canList: 'tran-khung', nhipTheoLoiGiai: true, hamCuaEmCan: ['forward', 'right'],
      deBai: 'Đường có sáu đoạn, khi rẽ phải khi rẽ trái. Danh sách a ghi độ dài từng đoạn, danh sách b ghi số lần quay phải sau đoạn đó (1 là rẽ phải, 3 là rẽ trái). Dùng a[i] và b[i] trong một vòng for.',
      san: SAN_5,
      batDau: { x: 0, y: 7, huong: 0 },
      maMau: { chinh: [] },
      sao: { o: 14, nhip: 25 },
      loiGiai: { chinh: C_5.slice() },
      loiGiaiKhac: {
        moTa: 'Cùng hai danh sách, thêm hai dòng chú thích',
        baiLam: { chinh: [LS('a', A_5), LS('b', B_5), '# a[i]: độ dài, b[i]: số lần quay phải', 'for i in range(len(a)):', '    forward(a[i])', '    right(b[i])'] }
      },
      congThucKhac: [
        { moTa: 'Vòng range(6) thay cho range(len(a))', baiLam: { chinh: [LS('a', A_5), LS('b', B_5), 'for i in range(6):', '    forward(a[i])', '    right(b[i])'] } }
      ],
      loiSai: [
        { moTa: 'Không dùng danh sách: mười một dòng, quá 10 ô', baiLam: { chinh: THANG(A_5, ['right(1)', 'right(3)', 'right(1)', 'right(1)', 'right(1)']) }, phaiCoMa: ['tran-khung'] },
        { moTa: 'Quên quay sau mỗi đoạn: xe đâm tường', baiLam: { chinh: [LS('a', A_5), LS('b', B_5), 'for i in range(len(a)):', '    forward(a[i])'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Cả sáu lần đều quay phải một lần: đoạn thứ hai xe đâm tường', baiLam: { chinh: [LS('a', A_5), 'for i in range(len(a)):', '    forward(a[i])', '    right(1)'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Vòng chỉ lặp ba lần (range(3)): xe dừng giữa đường', baiLam: { chinh: [LS('a', A_5), LS('b', B_5), 'for i in range(3):', '    forward(a[i])', '    right(b[i])'] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Danh sách b ghi 2 thay cho 3 (quay đầu thay vì rẽ trái): xe đâm tường', baiLam: { chinh: [LS('a', A_5), LS('b', [1, 2, 1, 1, 1, 1]), 'for i in range(len(a)):', '    forward(a[i])', '    right(b[i])'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['a[i] và b[i] cùng số thứ tự i: đoạn thứ i đi a[i] ô rồi quay phải b[i] lần.',
        'Quay phải 3 lần giống một lần rẽ trái.']
    }),

    man({
      so: 6, ten: 'Đoạn cuối', hang: 'luyen', hamCuaEmCan: ['forward', 'turn_right'],
      deBai: 'Xe đi ba đoạn dài 6, 5 và 4 ô, hết đoạn nào rẽ phải. Đoạn cuối dài đúng bằng số đoạn đã đi: hãy đếm số đoạn bằng len(a).',
      san: SAN_6,
      batDau: { x: 0, y: 0, huong: 1 },
      maMau: { chinh: [] },
      sao: { o: 12, nhip: 21 },
      loiGiai: { chinh: C_6.slice() },
      loiGiaiKhac: {
        moTa: 'Đoạn cuối viết số 3 thẳng thay cho len(a), có chú thích',
        baiLam: { chinh: nhieu([LS('a', A_6)], DUYET('a'), ['# đoạn cuối', 'forward(3)']) }
      },
      loiSai: [
        { moTa: 'Quên đoạn cuối: xe dừng cách cờ ba ô', baiLam: { chinh: nhieu([LS('a', A_6)], DUYET('a')) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đoạn cuối chỉ đi forward(1): xe dừng cách cờ hai ô', baiLam: { chinh: nhieu([LS('a', A_6)], DUYET('a'), ['forward(1)']) }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đưa cả danh sách vào forward(): forward() cần một số', baiLam: { chinh: nhieu([LS('a', A_6)], DUYET('a'), ['forward(a)']) }, phaiCoMa: ['loi-chay'] },
        { moTa: 'Đặt forward(len(a)) trước vòng for: xe đi thêm ba ô ngay từ đầu rồi đâm tường', baiLam: { chinh: [LS('a', A_6), 'forward(len(a))', 'for n in a:', '    forward(n)', '    turn_right()'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['len(a) là số phần tử của danh sách a. Danh sách này có mấy số?',
        'Đi hết các đoạn trong danh sách trước, rồi mới đi đoạn cuối.']
    }),

    /* ------------------------------------------------------------ hàng 3: biến thể */
    man({
      so: 7, ten: 'Thiếu một số', hang: 'bien-the', hamCuaEmCan: ['forward', 'turn_right'],
      deBai: 'Xe phải đi các đoạn dài 4, 6, 5 và 2 ô, hết đoạn nào rẽ phải. Chương trình có sẵn lặp bốn lần nhưng danh sách chỉ có ba số. Sửa để xe tới cờ.',
      veMaMau: 'Chạy thử: lỗi báo ở lần lặp thứ mấy? Danh sách đang có mấy số?',
      san: SAN_7,
      batDau: { x: 1, y: 0, huong: 1 },
      maMau: { chinh: [LS('a', A_7.slice(0, 3)), 'for i in range(4):', '    forward(a[i])', '    turn_right()'] },
      sao: { o: 11, nhip: 20 },
      loiGiai: { chinh: C_7.slice() },
      loiGiaiKhac: {
        moTa: 'Vòng lặp range(len(a)) sau khi thêm số, thêm một dòng chú thích',
        baiLam: { chinh: [LS('a', A_7), '# lặp theo số phần tử', 'for i in range(len(a)):', '    forward(a[i])', '    turn_right()'] }
      },
      loiSai: [
        { moTa: 'Không sửa gì: lần lặp thứ tư đọc a[3] mà danh sách chỉ có ba số', baiLam: { chinh: [LS('a', A_7.slice(0, 3)), 'for i in range(4):', '    forward(a[i])', '    turn_right()'] }, phaiCoMa: ['loi-chay'] },
        { moTa: 'Đổi range(4) thành range(3): hết lỗi nhưng xe dừng cách cờ hai ô', baiLam: { chinh: [LS('a', A_7.slice(0, 3)), 'for i in range(3):', '    forward(a[i])', '    turn_right()'] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Thêm số nhưng ghi 1 thay cho 2: xe dừng cách cờ một ô', baiLam: { chinh: [LS('a', [4, 6, 5, 1]), 'for i in range(4):', '    forward(a[i])', '    turn_right()'] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Thêm số vào đầu danh sách thay vì cuối: xe đi sai đoạn và đâm tường', baiLam: { chinh: [LS('a', [2, 4, 6, 5]), 'for i in range(4):', '    forward(a[i])', '    turn_right()'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] }
      ],
      goiY: ['Danh sách đếm từ số 0: ba số thì có a[0], a[1], a[2], không có a[3].',
        'Lỗi cho biết xe cần số thứ tư. Em thêm một số vào cuối danh sách, ứng với đoạn cuối.']
    }),

    man({
      so: 8, ten: 'Gọi hàm danh sách', hang: 'bien-the', canList: 'tran-khung', hamCuaEmCan: ['forward', 'turn_right', 'turn_left'],
      deBai: 'Màn này cho sẵn hai hàm tour(steps) và tour_left(steps): xe đi theo từng số trong danh sách, hết đoạn nào rẽ phải (hoặc trái). Gọi mỗi hàm một lần, với danh sách của nó, để xe tới cờ.',
      san: SAN_8,
      batDau: { x: 4, y: 0, huong: 1 },
      khoaHamMan: ['tour', 'tour_left'],
      maMau: { chinh: [], hamCuaMan: [H('tour', ['steps'], tourDuyet('turn_right()')), H('tour_left', ['steps'], tourDuyet('turn_left()'))] },
      sao: { o: 17, nhip: 25 },
      loiGiai: { chinh: C_8.slice(), hamCuaMan: [H('tour', ['steps'], tourDuyet('turn_right()')), H('tour_left', ['steps'], tourDuyet('turn_left()'))] },
      loiGiaiKhac: {
        moTa: 'Ghi sẵn hai danh sách rồi truyền tên vào hàm',
        baiLam: { chinh: [LS('a', A_8), LS('b', B_8), 'tour(a)', 'tour_left(b)'], hamCuaMan: [H('tour', ['steps'], tourDuyet('turn_right()')), H('tour_left', ['steps'], tourDuyet('turn_left()'))] }
      },
      loiSai: [
        { moTa: 'Không dùng hàm của màn: mười ba dòng, quá 10 ô', baiLam: { chinh: THANG(A_8.concat(B_8), ['turn_right()', 'turn_right()', 'turn_right()', 'turn_left()', 'turn_left()', 'turn_left()']), hamCuaMan: [H('tour', ['steps'], tourDuyet('turn_right()')), H('tour_left', ['steps'], tourDuyet('turn_left()'))] }, phaiCoMa: ['tran-khung'] },
        { moTa: 'Gọi tour() cho cả bảy đoạn: xe rẽ phải suốt nên đâm tường ở khúc thứ tư', baiLam: { chinh: ['tour([' + A_8.concat(B_8).join(', ') + '])'], hamCuaMan: [H('tour', ['steps'], tourDuyet('turn_right()')), H('tour_left', ['steps'], tourDuyet('turn_left()'))] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Gọi tour_left() trước, tour() sau: xe rẽ trái ngay đoạn đầu và đâm tường', baiLam: { chinh: ['tour_left([' + B_8.join(', ') + '])', 'tour([' + A_8.join(', ') + '])'], hamCuaMan: [H('tour', ['steps'], tourDuyet('turn_right()')), H('tour_left', ['steps'], tourDuyet('turn_left()'))] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Truyền một số thay cho danh sách: tour(2) không lặp được qua số', baiLam: { chinh: ['tour(2)', 'tour_left([' + B_8.join(', ') + '])'], hamCuaMan: [H('tour', ['steps'], tourDuyet('turn_right()')), H('tour_left', ['steps'], tourDuyet('turn_left()'))] }, phaiCoMa: ['loi-chay'] },
        { moTa: 'Danh sách của tour_left() thiếu số cuối: xe dừng sát cờ', baiLam: { chinh: ['tour([' + A_8.join(', ') + '])', 'tour_left([' + B_8.slice(0, 3).join(', ') + '])'], hamCuaMan: [H('tour', ['steps'], tourDuyet('turn_right()')), H('tour_left', ['steps'], tourDuyet('turn_left()'))] }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Cả đường có bảy đoạn: ba đoạn đầu mà sau đó xe rẽ phải, bốn đoạn sau mà sau đó xe rẽ trái.',
        'Mỗi hàm nhận MỘT danh sách các số. Đếm từng đoạn từ chỗ xe đứng.']
    }),

    man({
      so: 9, ten: 'Sửa hàm tour', hang: 'bien-the', hamCuaEmCan: ['forward', 'turn_right'],
      deBai: 'Hàm tour(steps) của màn phải đưa xe đi theo từng số trong danh sách, nhưng xe cứ đi các đoạn dài bằng nhau. Sửa thân hàm tour để xe tới cờ.',
      veMaMau: 'Chương trình chính gọi tour() với đúng năm số của đường. Chạy thử, xem các đoạn xe đi dài bao nhiêu, rồi sửa thân hàm tour của màn.',
      san: SAN_9,
      batDau: { x: 2, y: 0, huong: 1 },
      chinhCoDinh: true,
      maMau: { chinh: C_9.slice(), hamCuaMan: [H('tour', ['steps'], tour('turn_right()', 0))] },
      sao: { o: 11, nhip: 20 },
      loiGiai: { chinh: C_9.slice(), hamCuaMan: [H('tour', ['steps'], tour('turn_right()'))] },
      loiGiaiKhac: {
        moTa: 'Sửa bằng vòng for n in steps thay cho chỉ số, có chú thích',
        baiLam: { chinh: C_9.slice(), hamCuaMan: [H('tour', ['steps'], nhieu(['# mỗi lần một số'], tourDuyet('turn_right()')))] }
      },
      loiSai: [
        { moTa: 'Không sửa gì: forward(steps[0]) luôn đi 4 ô nên xe đâm tường', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('tour', ['steps'], tour('turn_right()', 0))] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Đổi thành steps[1]: mọi đoạn đều đi 3 ô', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('tour', ['steps'], tour('turn_right()', 1))] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Sửa đúng chỗ nhưng bỏ dòng turn_right(): xe không rẽ và đâm tường', baiLam: { chinh: C_9.slice(), hamCuaMan: [H('tour', ['steps'], ['for i in range(len(steps)):', '    forward(steps[i])'])] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Xóa mất hàm tour của màn: lệnh gọi nó không còn hàm nào', baiLam: { chinh: C_9.slice(), hamCuaMan: [] }, phaiCoMa: ['ham-chua-co'] }
      ],
      goiY: ['Xe đi các đoạn dài bằng nhau: số nào trong danh sách được đọc mỗi lần lặp?',
        'steps[0] luôn là số đầu tiên. Muốn mỗi lần một số khác thì dùng số thứ i.']
    }),

    /* ------------------------------------------------------------ trùm */
    man({
      so: 10, ten: 'Mê cung kho', hang: 'trum', canList: 'tran-khung', nhipTheoLoiGiai: true, hamCuaEmCan: ['forward', 'right'],
      huyHieu: { ma: 'list', ten: 'Huy hiệu Danh sách' },
      deBai: 'Mê cung có sáu đoạn: năm đoạn đầu dài khác nhau, đoạn cuối dài bằng số đoạn đã đi. Dùng hai danh sách (độ dài đoạn, số lần quay phải) và len(a) để đưa xe tới cờ.',
      veMaMau: 'Chương trình chính còn trống. Hãy đếm các đoạn và các khúc rẽ từ chỗ xe đứng.',
      san: SAN_10,
      batDau: { x: 1, y: 0, huong: 2 },
      maMau: { chinh: [] },
      sao: { o: 15, nhip: 30 },
      loiGiai: { chinh: C_10.slice() },
      loiGiaiKhac: {
        moTa: 'Cùng hai danh sách, thêm hai dòng chú thích',
        baiLam: { chinh: [LS('a', A_10), LS('b', B_10), '# a[i]: độ dài, b[i]: số lần quay phải', 'for i in range(len(a)):', '    forward(a[i])', '    right(b[i])', '# đoạn cuối', 'forward(len(a))'] }
      },
      congThucKhac: [
        { moTa: 'Vòng range(5) thay cho range(len(a))', baiLam: { chinh: [LS('a', A_10), LS('b', B_10), 'for i in range(5):', '    forward(a[i])', '    right(b[i])', 'forward(5)'] } }
      ],
      loiSai: [
        { moTa: 'Không dùng danh sách: mười một dòng, quá 10 ô', baiLam: { chinh: THANG(A_10.concat([5]), ['right(3)', 'right(3)', 'right(1)', 'right(1)', 'right(1)']) }, phaiCoMa: ['tran-khung'] },
        { moTa: 'Quên đoạn cuối: xe dừng cách cờ năm ô', baiLam: { chinh: [LS('a', A_10), LS('b', B_10), 'for i in range(len(a)):', '    forward(a[i])', '    right(b[i])'] }, phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Cả năm lần đều quay phải một lần: xe đâm tường ở khúc đầu', baiLam: { chinh: [LS('a', A_10), 'for i in range(len(a)):', '    forward(a[i])', '    right(1)', 'forward(len(a))'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Danh sách b ghi 1 cho khúc rẽ trái đầu tiên: xe rẽ nhầm sang phải và đâm tường', baiLam: { chinh: [LS('a', A_10), LS('b', [1, 3, 1, 1, 1]), 'for i in range(len(a)):', '    forward(a[i])', '    right(b[i])', 'forward(len(a))'] }, phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Đoạn cuối forward(a[0]) chỉ 4 ô: xe dừng sát cờ', baiLam: { chinh: [LS('a', A_10), LS('b', B_10), 'for i in range(len(a)):', '    forward(a[i])', '    right(b[i])', 'forward(a[0])'] }, phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Năm đoạn đầu đi bằng vòng for với a[i] và b[i]. Rẽ trái là quay phải ba lần.',
        'Sau năm đoạn, đoạn cuối chỉ cần đi len(a) ô.']
    })
  ];

  ManHoc.them(DS);
  if (laNode) module.exports = ManHoc;
  if (typeof window !== 'undefined') window.ManHoc = ManHoc;
})();
