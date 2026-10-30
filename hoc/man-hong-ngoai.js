/* ============================================================================
   man-hong-ngoai.js — "Robot Chấn Hưng": NGÂN HÀNG MÀN MỚI của mùa 2, gói 3 "Hồng ngoại" (KE-HOACH-MUA-2.md).
   Khung mùa 2 (lo-trinh-hoc.js, khối "MÙA 2 = 10 GÓI", mảng MUA_2) đã chừa chỗ: tệp đã có trong danh sách require của lo-trinh-hoc.js và
   thẻ <script> của game/choi.html. Màn tự hiện đúng chương, đúng gói.
     - `hong-ngoai` (mã hong-ngoai.1 … hong-ngoai.10): chương 1: distance() số ô tới vật cản
     - `che-hong-ngoai` (mã che-hong-ngoai.1 … che-hong-ngoai.10): chương 2 "Hàm cho hồng ngoại": d = distance(), so số
   Mỗi màn khai `chuong` (một trong các mã trên) và `so` (1, 2, …: thứ tự trong phần màn mới của chương); mã `ma` = chuong + '.' + so là khóa lưu sao,
   KHÔNG đổi sau khi xuất bản. Gọi ManHoc.chuanHoa(m) như các tệp màn khác. Chương còn trống thì chưa hiện; gói chưa có chương nào có màn thì chưa hiện.
   Ràng buộc mùa 2 (hoc/kiem-lo-trinh.mjs): robot chỉ dùng part mùa 1 + xích + súng hơi (+ hồng ngoại khi lõi có); không bậc thang S, hố u, gầm n;
   biến chỉ từ gói 1 chương 2, hàm có tham số chỉ từ gói 2 chương 2 (tham-so); hàm của em cần phải được tạo ở màn đứng trước.
   Tệp này KHÔNG tự thêm màn vào ManHoc: danh sách nằm ở ManHoc.manHongNgoai, lo-trinh-hoc.js thêm vào chương rồi xếp chỗ (so, hang do dungChuong đặt).

   NỘI DUNG (27/10, theo video diem10code "Rô bốt né vật cản": Đo khoảng cách → So mức an toàn → Gần thì rẽ; mỗi ô là 10 cm):
   Xe hai bánh gắn cảm biến hồng ngoại ở mũi (robot.camBien [{ ma: 'hong-ngoai', o: 'tren' }]); distance() = số ô TRỐNG tới vật cản phía trước
   (sát là 0), không tốn nhịp (luật ở san-hoc.js, CẢM BIẾN HỒNG NGOẠI). Hàm của em dùng lại: move, turn_right, turn_left, u_turn, forward(n),
   pick, drop (gói 1–2 mùa 2 và mùa 1).
   MỘT SÂN mỗi màn (luật lộ trình: nhiều sân chỉ ở trùm). Để màn không giải được bằng cách đếm cứng số ô, đường đi có NHIỀU ĐOẠN DÀI NGẮN KHÔNG ĐỀU
   và CÙNG MỘT đoạn code (thân vòng lặp, thân hàm) chạy cho mọi đoạn: đọc distance() thì một vòng lặp đủ, đếm cứng thì mỗi đoạn một dòng, dài hơn ngưỡng ô.
   kiem-hong-ngoai.mjs + do-duong-hong-ngoai.mjs chứng minh: không chương trình nào né distance() mà được 3 sao (trùm nhiều sân: BFS chung mọi sân).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var HAM_GOC = ['left_move', 'right_move', 'left_back', 'right_back', 'wait', 'distance'];
  var HAM_GOC_TAY = HAM_GOC.concat(['arm_down', 'arm_up', 'grab', 'release']);

  /** Thụt mọi dòng vào một bậc (4 dấu cách). */
  function thut(ds) { return ds.map(function (s) { return '    ' + s; }); }
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  /** Vòng for: dòng đầu rồi thân thụt một bậc. n là số hay tên biến; bien là tên biến đếm (mặc định i). */
  function FOR(n, than, bien) { return ['for ' + (bien || 'i') + ' in range(' + n + '):'].concat(thut(than)); }
  function WHILE(dk, than) { return ['while ' + dk + ':'].concat(thut(than)); }
  function IF(dk, co, khong) { return ['if ' + dk + ':'].concat(thut(co), khong ? ['else:'].concat(thut(khong)) : []); }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function bai(chinh, hamCuaMan) { return { chinh: chinh.slice(), hamCuaMan: (hamCuaMan || []).slice() }; }

  // Đo rồi đi đúng số ô trống tới vật cản (dừng sát nó)
  var DOC = ['d = distance()'];
  var DI_D = FOR('d', ['move()'], 'j');
  /** Robot hút bụi: gần thì rẽ phải, còn không thì đi. */
  function HUT_BUI(dk, re, di) { return IF(dk, [re || 'turn_right()'], [di || 'move()']); }

  function man(m, coTay) {
    m.cauTruc = ['for', 'if', 'while'];
    m.loaiRobot = 'banh';
    m.robot = { than: 'hai-banh', tay: coTay ? 'kep' : null, camBien: [{ ma: 'hong-ngoai', o: 'tren' }] };
    m.hamGoc = coTay ? HAM_GOC_TAY : HAM_GOC;
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    if (!m.mucTieu) m.mucTieu = 'toi-co';
    if (Array.isArray(m.san[0])) m.nhipTheo = 'tong';
    return ManHoc.chuanHoa(m);
  }

  var DS = [
    /* ================================================================ chương hong-ngoai: Đo khoảng cách → So mức an toàn → Gần thì rẽ */
    man({
      chuong: 'hong-ngoai', so: 1, ten: 'Mỗi ô là 10 cm', yMoi: 'distance(): đọc số ô trống vào biến d', buocVideo: 'Đo khoảng cách', hamCuaEmCan: ['move', 'turn_right', 'forward'],
      deBai: 'Xe có mắt hồng ngoại ở mũi. distance() cho biết phía trước còn bao nhiêu ô trống tới tường, mỗi ô là 10 cm. Đường có ba đoạn dài ngắn khác nhau. Ở đầu mỗi đoạn, đọc số vào biến d rồi đi đúng d ô, rẽ phải và làm lại.',
      veMaMau: 'Chương trình có sẵn đã đọc d = distance() nhưng mỗi đoạn lại đi cố định hai ô. Dùng d thay cho số 2.',
      san: ['...#', '.#.#', '.#.#', '.#F#', '.###'],
      batDau: { x: 0, y: 4, huong: 0 },
      maMau: bai(FOR(3, nhieu(DOC, FOR(2, ['move()'], 'j'), ['turn_right()']))),
      sao: { o: 10, nhip: 11 },
      loiGiai: bai(FOR(3, nhieu(DOC, DI_D, ['turn_right()']))),
      loiGiaiKhac: { moTa: 'Đi d ô bằng hàm forward(d) của gói trước', baiLam: bai(FOR(3, nhieu(DOC, ['forward(d)', 'turn_right()']))) },
      loiSai: [
        { moTa: 'Đi cố định range(2): đoạn đầu dài 4 ô, xe rẽ quá sớm', baiLam: bai(FOR(3, nhieu(DOC, FOR(2, ['move()'], 'j'), ['turn_right()']))), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên rẽ phải trong vòng lặp: xe đứng sát tường, đo được 0 mãi', baiLam: bai(FOR(3, nhieu(DOC, DI_D))), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên dòng d = distance(): Python chưa biết d là gì', baiLam: bai(FOR(3, nhieu(DI_D, ['turn_right()']))), phaiCoMa: ['loi-chay'] }
      ],
      goiY: ['distance() đếm số ô trống phía trước mũi xe. Xe đứng sát tường thì distance() là 0.',
        'Đo lại ở đầu mỗi đoạn: rẽ xong thì phía trước đã khác, số ô cũng khác.']
    }),
    man({
      chuong: 'hong-ngoai', so: 2, ten: 'Đưa thẳng số đo vào vòng lặp', yMoi: 'range(distance()): dùng số đo ngay, không cần biến', buocVideo: 'Đo khoảng cách', hamCuaEmCan: ['move', 'turn_left', 'turn_right'],
      deBai: 'distance() là một con số nên đặt thẳng được vào range(): for j in range(distance()): đi hết đoạn trước mặt. Đường bốn đoạn, lần này rẽ trái.',
      veMaMau: 'Chương trình có sẵn đi bốn đoạn, mỗi đoạn ba ô. Thay số 3 bằng distance().',
      san: ['#######', '#######', '#.....#', '#.###.#', '#.F##.#', '#####.#', '#####.#', '#####.#', '#######'],
      batDau: { x: 5, y: 7, huong: 0 },
      maMau: bai(FOR(4, nhieu(FOR(3, ['move()'], 'j'), ['turn_left()']))),
      sao: { o: 9, nhip: 15 },
      loiGiai: bai(FOR(4, nhieu(FOR('distance()', ['move()'], 'j'), ['turn_left()']))),
      loiGiaiKhac: { moTa: 'Đọc vào biến d trước rồi mới lặp d lần', baiLam: bai(FOR(4, nhieu(DOC, DI_D, ['turn_left()']))) },
      loiSai: [
        { moTa: 'Mỗi đoạn đi cố định 3 ô: đoạn đầu dài 5 ô, xe rẽ sớm vào tường', baiLam: bai(FOR(4, nhieu(FOR(3, ['move()'], 'j'), ['turn_left()']))), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Rẽ phải thay vì rẽ trái: phía bên phải toàn tường', baiLam: bai(FOR(4, nhieu(FOR('distance()', ['move()'], 'j'), ['turn_right()']))), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Viết distance không có dấu ngoặc: Python không lặp theo tên hàm được', baiLam: bai(FOR(4, nhieu(FOR('distance', ['move()'], 'j'), ['turn_left()']))), phaiCoMa: ['loi-chay'] }
      ],
      goiY: ['range(distance()) đọc số ô ngay lúc bắt đầu vòng lặp, rồi lặp đúng chừng ấy lần.',
        'Vòng lặp ngoài chạy bốn lần, mỗi lần một đoạn: đo, đi, rẽ trái.']
    }),
    man({
      chuong: 'hong-ngoai', so: 3, ten: 'Còn ô trống thì đi', yMoi: 'phép so sánh distance() > 0 trong while', buocVideo: 'So mức an toàn', hamCuaEmCan: ['move', 'turn_right'],
      deBai: 'distance() trả về một số nên ta so sánh được nó với số khác. Phép so sánh distance() > 0 đúng khi phía trước còn ô trống. Mỗi đoạn: while distance() > 0: đi tới sát tường, rồi rẽ phải.',
      veMaMau: 'Chương trình có sẵn so với 1 nên xe dừng khi còn một ô. Sửa số trong phép so sánh.',
      san: ['#######', '#####.#', '#F###.#', '#.###.#', '#.....#', '#######'],
      batDau: { x: 5, y: 1, huong: 2 },
      maMau: bai(FOR(3, nhieu(WHILE('distance() > 1', ['move()']), ['turn_right()']))),
      sao: { o: 9, nhip: 11 },
      loiGiai: bai(FOR(3, nhieu(WHILE('distance() > 0', ['move()']), ['turn_right()']))),
      loiGiaiKhac: { moTa: 'Đo vào biến d rồi lặp d lần', baiLam: bai(FOR(3, nhieu(DOC, DI_D, ['turn_right()']))) },
      loiSai: [
        { moTa: 'So với 1: xe dừng khi còn một ô, rẽ vào tường', baiLam: bai(FOR(3, nhieu(WHILE('distance() > 1', ['move()']), ['turn_right()']))), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'distance() >= 0 luôn đúng: vòng lặp không bao giờ dừng, xe húc tường mãi', baiLam: bai(FOR(3, nhieu(WHILE('distance() >= 0', ['move()']), ['turn_right()']))), phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Dùng if thay cho while: mỗi đoạn xe chỉ đi một ô', baiLam: bai(FOR(3, nhieu(IF('distance() > 0', ['move()']), ['turn_right()']))), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Phép so sánh: dấu > đọc là "lớn hơn". distance() > 0 nghĩa là còn ít nhất một ô trống phía trước.',
        'while lặp lại khi phép so sánh còn đúng. Sát tường thì distance() là 0, phép so sánh sai, vòng lặp dừng.']
    }),
    man({
      chuong: 'hong-ngoai', so: 4, ten: 'Dừng cách tường 20 cm', yMoi: 'so với số khác 0: dừng khi còn 2 ô', buocVideo: 'So mức an toàn', hamCuaEmCan: ['move', 'turn_right'],
      deBai: 'Mỗi chỗ rẽ nằm cách tường cuối đường 2 ô, tức 20 cm; đi quá là lạc vào ngõ cụt. Mỗi đoạn: đi khi phía trước còn hơn 2 ô trống, dừng lại rồi rẽ phải.',
      veMaMau: 'Chương trình có sẵn đi tới sát tường mới rẽ: quá sát, lỡ mất chỗ rẽ. Sửa số trong phép so sánh.',
      san: ['#######', '#.#####', '#.#####', '#.....#', '#.#.###', '#.#F###', '#.#.###', '#.#.###', '#######'],
      batDau: { x: 1, y: 7, huong: 0 },
      maMau: bai(FOR(3, nhieu(WHILE('distance() > 0', ['move()']), ['turn_right()']))),
      sao: { o: 9, nhip: 10 },
      loiGiai: bai(FOR(3, nhieu(WHILE('distance() > 2', ['move()']), ['turn_right()']))),
      loiGiaiKhac: { moTa: 'Đoạn nào cũng đi số ô trừ 2: for j in range(distance() - 2)', baiLam: bai(FOR(3, nhieu(DOC, FOR('d - 2', ['move()'], 'j'), ['turn_right()']))) },
      loiSai: [
        { moTa: 'Không sửa: xe đi tới sát tường, vào ngõ cụt', baiLam: bai(FOR(3, nhieu(WHILE('distance() > 0', ['move()']), ['turn_right()']))), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'So với 3: xe dừng sớm một ô', baiLam: bai(FOR(3, nhieu(WHILE('distance() > 3', ['move()']), ['turn_right()']))), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Dùng >= 2: còn đúng 2 ô xe vẫn đi thêm, dừng muộn một ô', baiLam: bai(FOR(3, nhieu(WHILE('distance() >= 2', ['move()']), ['turn_right()']))), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Đứng ở chỗ rẽ thì phía trước còn mấy ô trống tới tường? Đếm trên sân.',
        'distance() > 2 đúng khi còn 3, 4, 5… ô; còn đúng 2 ô thì sai, vòng lặp dừng.']
    }),
    man({
      chuong: 'hong-ngoai', so: 5, ten: 'Biến an_toan', yMoi: 'so sánh với biến an_toan', buocVideo: 'So mức an toàn', hamCuaEmCan: ['move', 'turn_right'],
      deBai: 'Mức an toàn của xe là 2 ô (20 cm). Gán an_toan = 2 rồi dùng biến này trong phép so sánh: xe đi khi distance() > an_toan. Muốn xe giữ khoảng cách khác thì chỉ sửa một dòng.',
      veMaMau: 'Chương trình có sẵn đã có biến an_toan nhưng vòng lặp vẫn so với 0. Thay số 0 bằng an_toan.',
      san: ['##########', '####.....#', '######.###', '######.###', '######.###', '#..F...###', '######.###', '######.###', '##########'],
      batDau: { x: 4, y: 1, huong: 1 },
      maMau: bai(nhieu(['an_toan = 2'], FOR(3, nhieu(WHILE('distance() > 0', ['move()']), ['turn_right()'])))),
      sao: { o: 10, nhip: 11 },
      loiGiai: bai(nhieu(['an_toan = 2'], FOR(3, nhieu(WHILE('distance() > an_toan', ['move()']), ['turn_right()'])))),
      loiGiaiKhac: { moTa: 'Mỗi đoạn đọc vào biến d rồi đi d - an_toan ô', baiLam: bai(nhieu(['an_toan = 2'], FOR(3, nhieu(DOC, FOR('d - an_toan', ['move()'], 'j'), ['turn_right()'])))) },
      loiSai: [
        { moTa: 'Không sửa: so với 0 nên xe đi tới sát tường, vào ngõ cụt', baiLam: bai(nhieu(['an_toan = 2'], FOR(3, nhieu(WHILE('distance() > 0', ['move()']), ['turn_right()'])))), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Gán an_toan = 1: xe rẽ muộn một ô', baiLam: bai(nhieu(['an_toan = 1'], FOR(3, nhieu(WHILE('distance() > an_toan', ['move()']), ['turn_right()'])))), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Gõ nhầm tên biến trong phép so sánh', baiLam: bai(nhieu(['an_toan = 2'], FOR(3, nhieu(WHILE('distance() > antoan', ['move()']), ['turn_right()'])))), phaiCoMa: ['loi-chay'] }
      ],
      goiY: ['Biến giữ một con số để dùng lại: an_toan = 2 rồi viết distance() > an_toan.',
        'Tên biến phải viết giống hệt nhau ở chỗ gán và chỗ dùng, kể cả dấu gạch dưới.']
    }),
    man({
      chuong: 'hong-ngoai', so: 6, ten: 'Gần thì rẽ', yMoi: 'if / else theo số đo: xa hơn an_toan thì đi, không thì rẽ (while True có sẵn trong mã mẫu)', buocVideo: 'Gần thì rẽ', hamCuaEmCan: ['move', 'turn_right'],
      deBai: 'Robot hút bụi làm một việc mỗi lượt: đo, nếu phía trước còn xa hơn mức an toàn, tức distance() > an_toan, thì đi một ô; còn không thì rẽ phải. Vòng while True có sẵn: lặp mãi, tới cờ là robot dừng.',
      veMaMau: 'Chương trình có sẵn đã có an_toan = 2 và vòng while True nhưng chỉ biết đi. Thêm if / else: xa thì đi, gần thì rẽ phải.',
      san: ['#########', '#######.#', '####.##.#', '####.##.#', '####F##.#', '####.##.#', '####.##.#', '####.##.#', '##......#', '#######.#', '#######.#', '#########'],
      batDau: { x: 7, y: 1, huong: 2 },
      maMau: bai(nhieu(['an_toan = 2'], WHILE('True', ['move()']))),
      sao: { o: 11, nhip: 16 },
      loiGiai: bai(nhieu(['an_toan = 2'], WHILE('True', HUT_BUI('distance() > an_toan', 'move()', 'turn_right()')))),
      loiGiaiKhac: { moTa: 'Đo vào biến d trước rồi so sánh d', baiLam: bai(nhieu(['an_toan = 2'], WHILE('True', nhieu(DOC, HUT_BUI('d > an_toan', 'move()', 'turn_right()'))))) },
      loiSai: [
        { moTa: 'Không có điều kiện: robot đi thẳng, húc tường', baiLam: bai(nhieu(['an_toan = 2'], WHILE('True', ['move()']))), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Đổi chỗ hai nhánh: xa thì lại rẽ, gần thì đi', baiLam: bai(nhieu(['an_toan = 2'], WHILE('True', HUT_BUI('distance() > an_toan')))), phaiCoMa: ['vong-vo-han'] },
        { moTa: 'So với 1 thay cho an_toan: còn đúng 2 ô robot vẫn đi, rẽ muộn', baiLam: bai(nhieu(['an_toan = 2'], WHILE('True', HUT_BUI('distance() > 1', 'move()', 'turn_right()')))), phaiCoMa: ['vong-vo-han'] }
      ],
      goiY: ['Mỗi lượt robot chỉ làm một việc: hoặc rẽ, hoặc đi một ô. Hỏi distance() trước rồi mới chọn.',
        'distance() > an_toan đúng khi còn từ 3 ô trống trở lên: lúc đó đi, còn không thì rẽ.']
    }),
    man({
      chuong: 'hong-ngoai', so: 7, ten: 'Phanh không kịp', yMoi: 'xe đi 3 ô một lần: sửa số trong phép so sánh cho phanh kịp', buocVideo: 'So mức an toàn', hamCuaEmCan: ['move', 'turn_right', 'forward'],
      deBai: 'Xe chạy nhanh: mỗi lần forward(3) đi luôn 3 ô (30 cm) rồi mới đo lại. while True: lặp mãi, tới cờ là xe dừng. Sola viết distance() <= 0 nên xe đâm vào ngõ cụt. Sửa số trong phép so sánh để xe phanh kịp và rẽ đúng chỗ.',
      veMaMau: 'Chạy thử bản của Sola: lúc xe lao vào ngõ cụt, distance() còn mấy ô?',
      san: ['###########', '#.#########', '#.#########', '#.........#', '#.#####.###', '#.#####.###', '#.##.##.###', '####F##.###', '####.##.###', '##......###', '#######.###', '#######.###', '###########'],
      batDau: { x: 1, y: 6, huong: 0 },
      maMau: bai(nhieu(WHILE('True', HUT_BUI('distance() <= 0', 'turn_right()', 'forward(3)')))),
      sao: { o: 12, nhip: 24 },
      loiGiai: bai(nhieu(WHILE('True', HUT_BUI('distance() <= 2', 'turn_right()', 'forward(3)')))),
      loiGiaiKhac: { moTa: 'Gán an_toan = 2 rồi so sánh với biến: đúng, thêm một dòng', baiLam: bai(nhieu(['an_toan = 2'], WHILE('True', HUT_BUI('distance() <= an_toan', 'turn_right()', 'forward(3)')))) },
      loiSai: [
        { moTa: 'Không sửa: so với 0 là quá nhỏ, còn 2 ô xe vẫn lao tới 3 ô và đâm', baiLam: bai(nhieu(WHILE('True', HUT_BUI('distance() <= 0', 'turn_right()', 'forward(3)')))), phaiCoMa: ['dam-tuong'] },
        { moTa: 'So với 1 vẫn chưa đủ: còn 2 ô xe vẫn lao tới 3 ô', baiLam: bai(nhieu(WHILE('True', HUT_BUI('distance() <= 1', 'turn_right()', 'forward(3)')))), phaiCoMa: ['dam-tuong'] },
        { moTa: 'So với 5 quá xa: xe chỉ quay tại chỗ', baiLam: bai(nhieu(WHILE('True', HUT_BUI('distance() <= 5', 'turn_right()', 'forward(3)')))), phaiCoMa: ['vong-vo-han'] }
      ],
      goiY: ['Mỗi lần đi 3 ô thì trước đó phải còn ít nhất 3 ô trống. Còn 2 ô hay ít hơn là phải rẽ.',
        'Số trong phép so sánh là mức an toàn: phải đủ lớn để xe kịp phanh. Thử 1, rồi 2.']
    }),
    man({
      chuong: 'hong-ngoai', so: 8, ten: 'Chân bàn', yMoi: 'vật cản là chân bàn (vật), không phải tường', buocVideo: 'Gần thì rẽ', hamCuaEmCan: ['move', 'turn_right', 'turn_left'],
      deBai: 'Trong phòng có chân bàn (vật nằm trên sàn). Mắt hồng ngoại thấy chân bàn như thấy tường. Robot hút bụi giữ cách vật cản 20 cm: gần thì rẽ phải, còn không thì đi, tới khi gặp cờ.',
      veMaMau: 'Chương trình có sẵn rẽ trái khi gần vật cản. Ở phòng này phải rẽ phải.',
      san: ['#o########', '#.########', '#.########', '#........o', '#.####.###', '#.####.###', '#.####.###', '#.o..F.###', '#.####.###', '######.###', '##########'],
      batDau: { x: 1, y: 8, huong: 0 },
      maMau: bai(nhieu(['an_toan = 2'], WHILE('True', HUT_BUI('distance() <= an_toan', 'turn_left()')))),
      sao: { o: 11, nhip: 18 },
      loiGiai: bai(nhieu(['an_toan = 2'], WHILE('True', HUT_BUI('distance() <= an_toan')))),
      loiGiaiKhac: { moTa: 'Đo vào biến d trước rồi so sánh d', baiLam: bai(nhieu(['an_toan = 2'], WHILE('True', nhieu(DOC, HUT_BUI('d <= an_toan'))))) },
      loiSai: [
        { moTa: 'Rẽ trái thay vì rẽ phải: robot quay vào tường', baiLam: bai(nhieu(['an_toan = 2'], WHILE('True', HUT_BUI('distance() <= an_toan', 'turn_left()')))), phaiCoMa: ['vong-vo-han'] },
        { moTa: 'an_toan = 0: robot đi tới sát chân bàn mới rẽ, lạc vào ngõ cụt', baiLam: bai(nhieu(['an_toan = 0'], WHILE('True', HUT_BUI('distance() <= an_toan')))), phaiCoMa: ['vong-vo-han'] }
      ],
      goiY: ['Chân bàn chặn tia hồng ngoại: distance() đếm số ô trống tới chân bàn.',
        'Chương trình giống màn "Gần thì rẽ": chỉ cần đúng an_toan và đúng hướng rẽ.']
    }),
    man({
      chuong: 'hong-ngoai', so: 9, ten: 'Nhớ số để quay về', yMoi: 'dùng lại biến d để quay về đúng chỗ cũ', buocVideo: 'Đo khoảng cách', mucTieu: 'dua-vat',
      hamCuaEmCan: ['move', 'turn_left', 'u_turn', 'forward', 'pick', 'drop'],
      deBai: 'Xe có tay kẹp đứng ở ngã ba. Mỗi ngả có một vật, xa gần khác nhau. Mỗi chuyến: đo khoảng cách vào d, tiến tới sát vật rồi nhặt, quay đầu, đi về đúng d ô, đặt vật vào ô đích trước mặt rồi rẽ trái sang ngả kế.',
      veMaMau: 'Chương trình có sẵn đi về cố định hai ô nên chuyến đầu xe chưa về tới ngã ba. Biến d vẫn còn nhớ số đã đo: dùng lại nó.',
      san: ['#o###', '#.###', '#.###', '#.###', 'D..o#', '#D###'],
      batDau: { x: 1, y: 4, huong: 0 },
      maMau: bai(FOR(2, nhieu(DOC, ['forward(d)', 'pick()', 'u_turn()', 'forward(2)', 'drop()', 'turn_left()']))),
      sao: { o: 28, nhip: 18 },
      loiGiai: bai(FOR(2, nhieu(DOC, ['forward(d)', 'pick()', 'u_turn()', 'forward(d)', 'drop()', 'turn_left()']))),
      loiGiaiKhac: { moTa: 'Đường về đi bằng vòng for theo d', baiLam: bai(FOR(2, nhieu(DOC, ['forward(d)', 'pick()', 'u_turn()'], DI_D, ['drop()', 'turn_left()']))) },
      loiSai: [
        { moTa: 'Đi về cố định hai ô: chuyến đầu xe chưa về tới ngã ba', baiLam: bai(FOR(2, nhieu(DOC, ['forward(d)', 'pick()', 'u_turn()', 'forward(2)', 'drop()', 'turn_left()']))), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Đo lại sau khi quay đầu: d thành số ô tới tường phía sau, xe đi quá', baiLam: bai(FOR(2, nhieu(DOC, ['forward(d)', 'pick()', 'u_turn()'], DOC, ['forward(d)', 'drop()', 'turn_left()']))), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên nhặt vật trước khi quay về', baiLam: bai(FOR(2, nhieu(DOC, ['forward(d)', 'u_turn()', 'forward(d)', 'drop()', 'turn_left()']))), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Biến d giữ số đã đo cho tới khi em gán số khác vào nó.',
        'Đi tới mấy ô thì đi về bấy nhiêu ô: đường về cũng dài d ô.']
    }, true),
    man({
      chuong: 'hong-ngoai', so: 10, ten: 'Trùm: Robot hút bụi', yMoi: 'tự tìm ngưỡng an_toan, ba sân', buocVideo: 'Đo · So · Rẽ', hang: 'trum', hamCuaEmCan: ['move', 'turn_right', 'turn_left'],
      huyHieu: { ma: 'hong-ngoai', ten: 'Huy hiệu Hồng ngoại' },
      deBai: 'Ba căn phòng có tường và chân bàn. Robot hút bụi chạy một chương trình cho cả ba phòng: đo distance(), so với an_toan, gần thì rẽ phải, còn không thì đi. Lối đi nào cũng cách vật cản đúng một khoảng: em tự tìm an_toan.',
      veMaMau: 'Chương trình có sẵn dùng an_toan = 2 như các màn trước, nhưng lối rẽ ở đây gần vật cản hơn.',
      san: [['......o#', '####.###', '####.###', '.F...###', '####.###', '########'],
        ['....o###', '##.#####', '##.#####', '.F.#####', '##.#####', '##o#####'],
        ['.......#', '#####.##', '#...F.##', '#####.##', '#####o##', '########']],
      batDau: [{ x: 0, y: 0, huong: 1 }, { x: 0, y: 0, huong: 1 }, { x: 0, y: 0, huong: 0 }],
      maMau: bai(nhieu(['an_toan = 2'], WHILE('True', HUT_BUI('distance() <= an_toan')))),
      sao: { o: 11, nhip: 31 },
      loiGiai: bai(nhieu(['an_toan = 1'], WHILE('True', HUT_BUI('distance() <= an_toan')))),
      loiGiaiKhac: { moTa: 'Đo vào biến d trước rồi so sánh d', baiLam: bai(nhieu(['an_toan = 1'], WHILE('True', nhieu(DOC, HUT_BUI('d <= an_toan'))))) },
      loiSai: [
        { moTa: 'Giữ an_toan = 2: robot rẽ sớm một ô, đi vào tường', baiLam: bai(nhieu(['an_toan = 2'], WHILE('True', HUT_BUI('distance() <= an_toan')))), phaiCoMa: ['vong-vo-han'] },
        { moTa: 'an_toan = 0: robot đi tới sát vật cản mới rẽ, lỡ lối', baiLam: bai(nhieu(['an_toan = 0'], WHILE('True', HUT_BUI('distance() <= an_toan')))), phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Rẽ trái thay vì rẽ phải', baiLam: bai(nhieu(['an_toan = 1'], WHILE('True', HUT_BUI('distance() <= an_toan', 'turn_left()')))), phaiCoMa: ['vong-vo-han'] }
      ],
      goiY: ['Đứng ở một chỗ rẽ, đếm số ô trống còn lại tới vật cản: đó là an_toan.',
        'Phòng thứ ba: robot xuất phát mặt sát mép sân, nên việc đầu tiên là rẽ.']
    }),

    /* ================================================================ chương che-hong-ngoai: Hàm cho hồng ngoại */
    man({
      chuong: 'che-hong-ngoai', so: 1, ten: 'Hàm go_to_wall()', yMoi: 'tạo hàm dùng distance(): đi tới sát tường', buocVideo: 'Đo khoảng cách', hamCuaEmCan: ['move', 'turn_right', 'turn_left'],
      taoHam: ['go_to_wall'], chinhCoDinh: true,
      deBai: 'Xe này không có front_clear(), chỉ có mắt hồng ngoại. Chương trình chính đã khóa: gọi go_to_wall() ba lần, xen giữa là rẽ phải, rẽ trái. Em tạo hàm go_to_wall(): đi thẳng tới khi sát tường, dùng distance().',
      veMaMau: 'Hàm go_to_wall() chưa có. Mở Xưởng hàm, tạo nó: một vòng while với phép so sánh distance() > 0.',
      san: ['##########', '#....#####', '####.#####', '####....F#', '##########'],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['go_to_wall()', 'turn_right()', 'go_to_wall()', 'turn_left()', 'go_to_wall()']),
      sao: { o: 14, nhip: 11 },
      loiGiai: { chinh: ['go_to_wall()', 'turn_right()', 'go_to_wall()', 'turn_left()', 'go_to_wall()'], hamCuaEmMoi: [H('go_to_wall', [], WHILE('distance() > 0', ['move()']))] },
      loiGiaiKhac: { moTa: 'Đo vào biến d rồi lặp d lần', baiLam: bai(['go_to_wall()', 'turn_right()', 'go_to_wall()', 'turn_left()', 'go_to_wall()']), hamCuaEmMoi: [H('go_to_wall', [], nhieu(DOC, DI_D))] },
      loiSai: [
        { moTa: 'So với 1: mỗi đoạn xe dừng sớm một ô', baiLam: bai(['go_to_wall()', 'turn_right()', 'go_to_wall()', 'turn_left()', 'go_to_wall()']), hamCuaEmMoi: [H('go_to_wall', [], WHILE('distance() > 1', ['move()']))], phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Thân hàm chỉ có move(): mỗi lần gọi xe đi một ô', baiLam: bai(['go_to_wall()', 'turn_right()', 'go_to_wall()', 'turn_left()', 'go_to_wall()']), hamCuaEmMoi: [H('go_to_wall', [], ['move()'])], phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Dùng if thay cho while: hỏi một lần, đi một ô', baiLam: bai(['go_to_wall()', 'turn_right()', 'go_to_wall()', 'turn_left()', 'go_to_wall()']), hamCuaEmMoi: [H('go_to_wall', [], IF('distance() > 0', ['move()']))], phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Ba đoạn dài ngắn khác nhau nhưng cùng một hàm: hàm phải tự đo, không đếm cứng.',
        'Thân hàm: while distance() > 0: rồi move() thụt vào trong.']
    }),
    man({
      chuong: 'che-hong-ngoai', so: 2, ten: 'Hàm go_safe(an_toan)', yMoi: 'hàm có tham số an_toan trong phép so sánh', buocVideo: 'So mức an toàn', hamCuaEmCan: ['move', 'turn_right'],
      taoHam: ['go_safe'], chinhCoDinh: true,
      deBai: 'Tạo hàm go_safe(an_toan): đi thẳng tới khi phía trước chỉ còn an_toan ô trống. Chương trình chính đã khóa gọi go_safe(2), go_safe(0) rồi go_safe(1): cùng một hàm, mỗi lần một mức an toàn.',
      veMaMau: 'Hàm go_safe chưa có. Tạo nó với tham số an_toan và dùng tham số trong phép so sánh.',
      san: ['#######', '#.#####', '#.#####', '#.....#', '#.###.#', '#.###F#', '#.###.#', '#######'],
      batDau: { x: 1, y: 6, huong: 0 },
      maMau: bai(['go_safe(2)', 'turn_right()', 'go_safe(0)', 'turn_right()', 'go_safe(1)']),
      sao: { o: 12, nhip: 11 },
      loiGiai: { chinh: ['go_safe(2)', 'turn_right()', 'go_safe(0)', 'turn_right()', 'go_safe(1)'], hamCuaEmMoi: [H('go_safe', ['an_toan'], WHILE('distance() > an_toan', ['move()']))] },
      loiGiaiKhac: { moTa: 'Đo vào biến d rồi đi d - an_toan ô', baiLam: bai(['go_safe(2)', 'turn_right()', 'go_safe(0)', 'turn_right()', 'go_safe(1)']), hamCuaEmMoi: [H('go_safe', ['an_toan'], nhieu(DOC, FOR('d - an_toan', ['move()'], 'j')))] },
      loiSai: [
        { moTa: 'Viết cứng số 2 thay cho an_toan: đoạn giữa xe dừng sớm', baiLam: bai(['go_safe(2)', 'turn_right()', 'go_safe(0)', 'turn_right()', 'go_safe(1)']), hamCuaEmMoi: [H('go_safe', ['an_toan'], WHILE('distance() > 2', ['move()']))], phaiCoMa: ['chua-toi-co'] },
        { moTa: 'So với 0: đoạn đầu xe đi quá chỗ rẽ, vào ngõ cụt', baiLam: bai(['go_safe(2)', 'turn_right()', 'go_safe(0)', 'turn_right()', 'go_safe(1)']), hamCuaEmMoi: [H('go_safe', ['an_toan'], WHILE('distance() > 0', ['move()']))], phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Dùng >= : go_safe(0) không bao giờ dừng', baiLam: bai(['go_safe(2)', 'turn_right()', 'go_safe(0)', 'turn_right()', 'go_safe(1)']), hamCuaEmMoi: [H('go_safe', ['an_toan'], WHILE('distance() >= an_toan', ['move()']))], phaiCoMa: ['vong-vo-han'] }
      ],
      goiY: ['Tham số an_toan nhận số trong ngoặc của lời gọi: go_safe(2) thì an_toan là 2.',
        'Thân hàm: while distance() > an_toan: rồi move().']
    }),
    man({
      chuong: 'che-hong-ngoai', so: 3, ten: 'Một bước hút bụi', yMoi: 'if / else trong hàm có tham số', buocVideo: 'Gần thì rẽ', hamCuaEmCan: ['move', 'turn_right', 'turn_left'],
      taoHam: ['clean_step'], chinhCoDinh: true,
      deBai: 'Tạo hàm clean_step(an_toan): một bước của robot hút bụi. Nếu distance() <= an_toan thì rẽ phải, còn không thì đi một ô. Chương trình chính đã khóa: lặp clean_step(2) 20 lần.',
      veMaMau: 'Hàm clean_step chưa có. Tạo nó với if / else như màn "Gần thì rẽ".',
      san: ['#########', '#.......o', '#####.###', '..F...###', '#####.###', '#####.###', '#########'],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(FOR(20, ['clean_step(2)'])),
      sao: { o: 11, nhip: 11 },
      loiGiai: { chinh: FOR(20, ['clean_step(2)']), hamCuaEmMoi: [H('clean_step', ['an_toan'], HUT_BUI('distance() <= an_toan'))] },
      loiGiaiKhac: { moTa: 'Đo vào biến d trước rồi so sánh d', baiLam: bai(FOR(20, ['clean_step(2)'])), hamCuaEmMoi: [H('clean_step', ['an_toan'], nhieu(DOC, HUT_BUI('d <= an_toan')))] },
      loiSai: [
        { moTa: 'Đổi chỗ hai nhánh: gần thì đi, xa thì rẽ', baiLam: bai(FOR(20, ['clean_step(2)'])), hamCuaEmMoi: [H('clean_step', ['an_toan'], HUT_BUI('distance() <= an_toan', 'move()', 'turn_right()'))], phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Rẽ trái thay vì rẽ phải', baiLam: bai(FOR(20, ['clean_step(2)'])), hamCuaEmMoi: [H('clean_step', ['an_toan'], HUT_BUI('distance() <= an_toan', 'turn_left()'))], phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Dùng < thay cho <=: còn đúng 2 ô robot vẫn đi, lạc vào ngõ cụt', baiLam: bai(FOR(20, ['clean_step(2)'])), hamCuaEmMoi: [H('clean_step', ['an_toan'], HUT_BUI('distance() < an_toan'))], phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Mỗi lần gọi, hàm chỉ làm MỘT việc: rẽ, hoặc đi một ô.',
        'Vòng lặp 20 lần ở chương trình chính lo việc lặp lại; hàm chỉ lo một bước.']
    }),
    man({
      chuong: 'che-hong-ngoai', so: 4, ten: 'Đi lấy rồi về: go_get()',yMoi: 'hàm nhớ số đo vào biến để đi về', buocVideo: 'Đo khoảng cách', mucTieu: 'dua-vat',
      hamCuaEmCan: ['move', 'turn_left', 'u_turn', 'forward', 'pick', 'drop'], taoHam: ['go_get'], chinhCoDinh: true,
      deBai: 'Tạo hàm go_get(): đo khoảng cách vào d, tới sát vật rồi nhặt, quay đầu, đi về đúng d ô và đặt vật vào ô đích trước mặt. Chương trình chính đã khóa: go_get(), rẽ trái, go_get(). Hai vật xa gần khác nhau.',
      veMaMau: 'Hàm go_get() chưa có. Tạo nó giống màn "Nhớ số để quay về", nhưng gói vào một hàm.',
      san: ['#o###', '#.###', 'D...o', '#D###'],
      batDau: { x: 1, y: 2, huong: 0 },
      maMau: bai(['go_get()', 'turn_left()', 'go_get()']),
      sao: { o: 29, nhip: 16 },
      loiGiai: { chinh: ['go_get()', 'turn_left()', 'go_get()'], hamCuaEmMoi: [H('go_get', [], nhieu(DOC, ['forward(d)', 'pick()', 'u_turn()', 'forward(d)', 'drop()']))] },
      loiGiaiKhac: { moTa: 'Đường về đi bằng vòng for theo d', baiLam: bai(['go_get()', 'turn_left()', 'go_get()']), hamCuaEmMoi: [H('go_get', [], nhieu(DOC, ['forward(d)', 'pick()', 'u_turn()'], DI_D, ['drop()']))] },
      loiSai: [
        { moTa: 'Đi về cố định một ô: chuyến sau xe chưa về tới chỗ cũ', baiLam: bai(['go_get()', 'turn_left()', 'go_get()']), hamCuaEmMoi: [H('go_get', [], nhieu(DOC, ['forward(d)', 'pick()', 'u_turn()', 'forward(1)', 'drop()']))], phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Đo lại sau khi quay đầu: d thành số ô tới ô đích phía sau', baiLam: bai(['go_get()', 'turn_left()', 'go_get()']), hamCuaEmMoi: [H('go_get', [], nhieu(DOC, ['forward(d)', 'pick()', 'u_turn()'], DOC, ['forward(d)', 'drop()']))], phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên nhặt vật', baiLam: bai(['go_get()', 'turn_left()', 'go_get()']), hamCuaEmMoi: [H('go_get', [], nhieu(DOC, ['forward(d)', 'u_turn()', 'forward(d)', 'drop()']))], phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Biến d trong hàm giữ số đo của lần gọi đó; lần gọi sau đo lại từ đầu.',
        'Đi tới d ô thì đi về cũng d ô.']
    }, true),
    man({
      chuong: 'che-hong-ngoai', so: 5, ten: 'Sửa hàm safe()', yMoi: 'sửa hàm lỗi: >= thành >', buocVideo: 'So mức an toàn', hamCuaEmCan: ['move', 'turn_left'], chinhCoDinh: true,
      deBai: 'Hàm safe(an_toan) của màn này viết sai một dấu nên xe lúc đi quá chỗ rẽ, lúc chạy mãi không dừng. Chương trình chính đã khóa. Tìm và sửa lỗi trong hàm safe.',
      veMaMau: 'Chạy thử: xe làm gì ở đoạn đầu (safe(2))? Còn safe(0) thì sao?',
      san: ['#######', '#####.#', '#####.#', '#.....#', '#.###.#', '#F###.#', '#.###.#', '#.#####', '#######'],
      batDau: { x: 5, y: 6, huong: 0 },
      maMau: bai(['safe(2)', 'turn_left()', 'safe(0)', 'turn_left()', 'safe(2)'], [H('safe', ['an_toan'], WHILE('distance() >= an_toan', ['move()']))]),
      sao: { o: 12, nhip: 11 },
      loiGiai: { chinh: ['safe(2)', 'turn_left()', 'safe(0)', 'turn_left()', 'safe(2)'], hamCuaMan: [H('safe', ['an_toan'], WHILE('distance() > an_toan', ['move()']))] },
      loiGiaiKhac: { moTa: 'Viết lại bằng biến d: đi d - an_toan ô', baiLam: bai(['safe(2)', 'turn_left()', 'safe(0)', 'turn_left()', 'safe(2)'], [H('safe', ['an_toan'], nhieu(DOC, FOR('d - an_toan', ['move()'], 'j')))]) },
      loiSai: [
        { moTa: 'Để nguyên >=: còn đúng an_toan ô xe vẫn đi, safe(0) chạy mãi', baiLam: bai(['safe(2)', 'turn_left()', 'safe(0)', 'turn_left()', 'safe(2)'], [H('safe', ['an_toan'], WHILE('distance() >= an_toan', ['move()']))]), phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Sửa thành > an_toan + 1: xe dừng sớm một ô', baiLam: bai(['safe(2)', 'turn_left()', 'safe(0)', 'turn_left()', 'safe(2)'], [H('safe', ['an_toan'], WHILE('distance() > an_toan + 1', ['move()']))]), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['>= đọc là "lớn hơn hoặc bằng": còn đúng 2 ô thì 2 >= 2 vẫn đúng, xe còn đi.',
        'Muốn dừng khi còn đúng an_toan ô thì phép so sánh phải sai đúng lúc đó.']
    }),
    man({
      chuong: 'che-hong-ngoai', so: 6, ten: 'go_safe trong vòng lặp', yMoi: 'gọi hàm của em trong vòng for', buocVideo: 'So mức an toàn', hamCuaEmCan: ['go_safe', 'go_to_wall', 'turn_right', 'turn_left'],
      deBai: 'Ba đoạn đường, chỗ rẽ nào cũng cách vật cản 2 ô (có chỗ là tường, có chỗ là chân bàn). Viết chương trình chính: vòng lặp ba lần, mỗi lần gọi go_safe(2) rồi rẽ phải.',
      veMaMau: 'Chương trình có sẵn gọi go_to_wall(): xe đi tới sát vật cản, lỡ chỗ rẽ. Đổi sang hàm giữ khoảng cách.',
      san: ['####.###', '####.#.#', '####F#.#', '####.#.#', '####.#.#', '##.....#', '######.#', '######.#', '######o#'],
      batDau: { x: 6, y: 1, huong: 2 },
      maMau: bai(FOR(3, ['go_to_wall()', 'turn_right()'])),
      sao: { o: 10, nhip: 11 },
      loiGiai: bai(FOR(3, ['go_safe(2)', 'turn_right()'])),
      loiGiaiKhac: { moTa: 'Gọi go_safe(2) ba lần liền, không dùng vòng lặp', baiLam: bai(['go_safe(2)', 'turn_right()', 'go_safe(2)', 'turn_right()', 'go_safe(2)']) },
      loiSai: [
        { moTa: 'Dùng go_to_wall(): đi tới sát vật cản, vào ngõ cụt', baiLam: bai(FOR(3, ['go_to_wall()', 'turn_right()'])), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'go_safe(3): xe dừng sớm một ô, rẽ vào tường', baiLam: bai(FOR(3, ['go_safe(3)', 'turn_right()'])), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Rẽ trái thay vì rẽ phải', baiLam: bai(FOR(3, ['go_safe(2)', 'turn_left()'])), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Hàm go_safe của em đã tự đo, nên mỗi đoạn dài ngắn thế nào cũng được.',
        'Thân vòng lặp có hai dòng: go_safe(2) và turn_right().']
    }),
    man({
      chuong: 'che-hong-ngoai', so: 7, ten: 'Sửa hàm take()', yMoi: 'sửa hàm lỗi: đo lại làm mất số cũ', buocVideo: 'Đo khoảng cách', mucTieu: 'dua-vat',
      hamCuaEmCan: ['move', 'turn_right', 'u_turn', 'forward', 'pick', 'drop'], chinhCoDinh: true,
      deBai: 'Hàm take() của màn này đi lấy vật rồi mang về, nhưng nó đo lại sau khi quay đầu nên đi về sai số ô. Chương trình chính đã khóa: take(), rẽ phải, take(). Sửa hàm take.',
      veMaMau: 'Chạy thử: sau khi quay đầu, d = distance() đo tới đâu?',
      san: ['###o#', '###.#', 'o...D', '###D#'],
      batDau: { x: 3, y: 2, huong: 0 },
      maMau: bai(['take()', 'turn_right()', 'take()'], [H('take', [], nhieu(DOC, ['forward(d)', 'pick()', 'u_turn()'], DOC, ['forward(d)', 'drop()']))]),
      sao: { o: 29, nhip: 16 },
      loiGiai: { chinh: ['take()', 'turn_right()', 'take()'], hamCuaMan: [H('take', [], nhieu(DOC, ['forward(d)', 'pick()', 'u_turn()', 'forward(d)', 'drop()']))] },
      loiGiaiKhac: { moTa: 'Đường về đi bằng vòng for theo d', baiLam: bai(['take()', 'turn_right()', 'take()'], [H('take', [], nhieu(DOC, ['forward(d)', 'pick()', 'u_turn()'], DI_D, ['drop()']))]) },
      loiSai: [
        { moTa: 'Để nguyên: đo lại sau khi quay đầu, xe đi quá chỗ cũ', baiLam: bai(['take()', 'turn_right()', 'take()'], [H('take', [], nhieu(DOC, ['forward(d)', 'pick()', 'u_turn()'], DOC, ['forward(d)', 'drop()']))]), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Bỏ luôn dòng đo đầu hàm: Python chưa biết d', baiLam: bai(['take()', 'turn_right()', 'take()'], [H('take', [], ['forward(d)', 'pick()', 'u_turn()', 'forward(d)', 'drop()'])]), phaiCoMa: ['loi-chay'] }
      ],
      goiY: ['Gán d = distance() lần hai thì số cũ mất. Đường về cần số cũ.',
        'Chỉ cần xóa một dòng trong hàm take.']
    }, true),
    man({
      chuong: 'che-hong-ngoai', so: 8, ten: 'Tìm mức an toàn', yMoi: 'tự chọn số an_toan cho hàm clean_step', buocVideo: 'Gần thì rẽ', hamCuaEmCan: ['clean_step', 'turn_right'],
      deBai: 'Chỗ rẽ ở phòng này chỉ cách vật cản 1 ô (10 cm). Viết chương trình chính: while True lặp mãi clean_step với mức an toàn đúng. Đếm trên sân để tìm số đó.',
      veMaMau: 'Chương trình có sẵn gọi clean_step(2): robot rẽ sớm một ô, quay vào tường.',
      san: ['########', '#......o', '#####.##', '#.F...##', '#####.##', '########'],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(WHILE('True', ['clean_step(2)'])),
      sao: { o: 11, nhip: 11 },
      loiGiai: bai(WHILE('True', ['clean_step(1)'])),
      loiGiaiKhac: { moTa: 'Gán an_toan = 1 rồi gọi clean_step(an_toan)', baiLam: bai(nhieu(['an_toan = 1'], WHILE('True', ['clean_step(an_toan)']))) },
      loiSai: [
        { moTa: 'clean_step(2): rẽ sớm một ô', baiLam: bai(WHILE('True', ['clean_step(2)'])), phaiCoMa: ['vong-vo-han'] },
        { moTa: 'clean_step(0): robot đi tới sát vật cản mới rẽ, lạc vào ngõ cụt', baiLam: bai(WHILE('True', ['clean_step(0)'])), phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Dùng for 5 lần thay cho while True: robot chưa tới cờ', baiLam: bai(FOR(5, ['clean_step(1)'])), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Đứng ở chỗ rẽ đầu tiên, phía trước còn mấy ô trống tới chân bàn?',
        'Mức an toàn là tham số: chỉ đổi số trong ngoặc.']
    }),
    man({
      chuong: 'che-hong-ngoai', so: 9, ten: 'Chở vật qua ngõ hẹp', yMoi: 'mang vật trong lúc gọi go_safe', buocVideo: 'So mức an toàn', mucTieu: 'dua-vat',
      hamCuaEmCan: ['go_safe', 'turn_right', 'turn_left', 'pick', 'drop'],
      deBai: 'Nhặt vật trước mặt, rồi chở nó qua ba đoạn đường. Mỗi chỗ rẽ cách tường 1 ô. Sau lần rẽ cuối, ô đích ở ngay trước mặt: đặt vật xuống.',
      veMaMau: 'Chương trình có sẵn đi bằng go_safe(2) nên rẽ sớm. Sửa mức an toàn.',
      san: ['#######', '#######', '#.#####', '#.....#', '#.##.##', '#.#D.##', '#o##.##', '#.#####', '#######'],
      batDau: { x: 1, y: 7, huong: 0 },
      maMau: bai(nhieu(['pick()'], FOR(3, ['go_safe(2)', 'turn_right()']), ['drop()'])),
      sao: { o: 22, nhip: 15 },
      loiGiai: bai(nhieu(['pick()'], FOR(3, ['go_safe(1)', 'turn_right()']), ['drop()'])),
      loiGiaiKhac: { moTa: 'Gọi go_safe(1) ba lần liền, không dùng vòng lặp', baiLam: bai(['pick()', 'go_safe(1)', 'turn_right()', 'go_safe(1)', 'turn_right()', 'go_safe(1)', 'turn_right()', 'drop()']) },
      loiSai: [
        { moTa: 'go_safe(2): rẽ sớm một ô', baiLam: bai(nhieu(['pick()'], FOR(3, ['go_safe(2)', 'turn_right()']), ['drop()'])), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên nhặt vật trước khi đi: vật chắn đường', baiLam: bai(nhieu(FOR(3, ['go_safe(1)', 'turn_right()']), ['drop()'])), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Đặt vật trước lần rẽ cuối: vật rơi vào ngõ cụt', baiLam: bai(nhieu(['pick()'], FOR(3, ['go_safe(1)', 'turn_right()']), ['turn_left()', 'drop()'])), phaiCoMa: ['chua-dua-vat'] }
      ],
      goiY: ['Xe đang cầm vật vẫn đo được: vật ở trên tay, không chắn mắt hồng ngoại.',
        'Mỗi chỗ rẽ cách tường 1 ô: go_safe(1).']
    }, true),
    man({
      chuong: 'che-hong-ngoai', so: 10, ten: 'Trùm: Một hàm cho mọi đoạn', yMoi: 'go_safe(0) thay go_to_wall, ba phòng', buocVideo: 'Đo · So · Rẽ', hang: 'trum', hamCuaEmCan: ['go_safe', 'go_to_wall', 'turn_right', 'turn_left'],
      huyHieu: { ma: 'che-hong-ngoai', ten: 'Huy hiệu Hàm cho hồng ngoại' },
      deBai: 'Ba căn phòng, một chương trình. Ở phòng nào xe cũng: đi tới sát tường, rẽ phải, đi tới khi còn 2 ô thì rẽ trái, rồi đi tới sát tường là gặp cờ. Chỉ dùng hàm go_safe: go_safe(0) cũng là đi tới sát tường.',
      veMaMau: 'Chương trình có sẵn dùng go_to_wall() ở cả ba đoạn: đoạn giữa xe đi quá chỗ rẽ.',
      san: [['....###', '###.###', '###..F#', '###.###', '###.###', '#######'],
        ['..#####', '#.#####', '#.#####', '#...F##', '#.#####', '#.#####', '#######'],
        ['.....##', '####.F#', '####.##', '####.##', '#######']],
      batDau: [{ x: 0, y: 0, huong: 1 }, { x: 0, y: 0, huong: 1 }, { x: 0, y: 0, huong: 1 }],
      maMau: bai(['go_to_wall()', 'turn_right()', 'go_to_wall()', 'turn_left()', 'go_to_wall()']),
      sao: { o: 14, nhip: 26 },
      loiGiai: bai(['go_safe(0)', 'turn_right()', 'go_safe(2)', 'turn_left()', 'go_safe(0)']),
      loiGiaiKhac: { moTa: 'Dùng go_to_wall() cho hai đoạn sát tường: đúng nhưng thêm thân một hàm', baiLam: bai(['go_to_wall()', 'turn_right()', 'go_safe(2)', 'turn_left()', 'go_to_wall()']) },
      loiSai: [
        { moTa: 'Để nguyên go_to_wall() ở đoạn giữa: xe vào ngõ cụt', baiLam: bai(['go_to_wall()', 'turn_right()', 'go_to_wall()', 'turn_left()', 'go_to_wall()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'go_safe(1) ở đoạn giữa: xe đi quá chỗ rẽ một ô', baiLam: bai(['go_safe(0)', 'turn_right()', 'go_safe(1)', 'turn_left()', 'go_safe(0)']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'go_safe(2) ở mọi đoạn: đoạn đầu xe dừng sớm', baiLam: bai(['go_safe(2)', 'turn_right()', 'go_safe(2)', 'turn_left()', 'go_safe(2)']), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Mỗi phòng dài ngắn khác nhau nhưng đường đi cùng một kiểu: đo, không đếm.',
        'Đoạn giữa phải dừng khi còn 2 ô: go_safe(2).']
    })
  ];

  ManHoc.manHongNgoai = DS;
  if (laNode) module.exports = ManHoc;
})();
