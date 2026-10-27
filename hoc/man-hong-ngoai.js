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
   (sát là 0), không tốn nhịp (luật ở san-hoc.js, CẢM BIẾN HỒNG NGOẠI). Hàm của em dùng lại: move, turn_right, turn_left, u_turn, back, forward(n),
   pick, drop (gói 1–2 mùa 2 và mùa 1).
   MỌI màn có NHIỀU SÂN (cùng một chương trình, khoảng cách khác nhau) và nhipTheo 'tong': chương trình đếm cứng số ô (không đọc distance())
   hoặc thua một sân, hoặc phải đâm tường mới khớp mọi sân nên tốn nhịp hơn ngưỡng. kiem-hong-ngoai.mjs dò bằng BFS chung mọi sân để chứng minh.
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
  /** Vòng for: dòng đầu rồi thân thụt một bậc. n là số hay tên biến. */
  function FOR(n, than) { return ['for i in range(' + n + '):'].concat(thut(than)); }
  function WHILE(dk, than) { return ['while ' + dk + ':'].concat(thut(than)); }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function bai(chinh, hamCuaMan) { return { chinh: chinh.slice(), hamCuaMan: (hamCuaMan || []).slice() }; }

  // Đi đúng số ô trống tới vật cản rồi dừng sát nó: hai cách viết (vòng for theo biến d, hay hàm forward(n) của gói 2)
  var DOC = ['d = distance()'];
  var DI_D = FOR('d', ['move()']);

  function man(m, coTay) {
    m.cauTruc = ['for', 'if', 'while'];
    m.loaiRobot = 'banh';
    m.robot = { than: 'hai-banh', tay: coTay ? 'kep' : null, camBien: [{ ma: 'hong-ngoai', o: 'tren' }] };
    m.hamGoc = coTay ? HAM_GOC_TAY : HAM_GOC;
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    if (!m.mucTieu) m.mucTieu = 'toi-co';
    m.nhipTheo = 'tong';
    return ManHoc.chuanHoa(m);
  }

  var DS = [
    /* ================================================================ chương hong-ngoai: Đo khoảng cách → So mức an toàn → Gần thì rẽ */
    man({
      chuong: 'hong-ngoai', so: 1, ten: 'Mỗi ô là 10 cm', yMoi: 'distance(): đọc số ô trống vào biến d', buocVideo: 'Đo khoảng cách', hamCuaEmCan: ['move', 'turn_right', 'forward'],
      deBai: 'Xe có mắt hồng ngoại ở mũi. distance() cho biết còn bao nhiêu ô trống tới tường phía trước, mỗi ô là 10 cm. Hai sân dài ngắn khác nhau, một chương trình: đọc số vào biến d, đi đúng d ô rồi rẽ phải vào cờ.',
      veMaMau: 'Chương trình có sẵn đã đọc d = distance() nhưng lại đi cố định hai ô. Sân thứ hai dài hơn: dùng d thay cho số 2.',
      san: [['...####', '##F####'], ['.....##', '####F##']],
      batDau: [{ x: 0, y: 0, huong: 1 }, { x: 0, y: 0, huong: 1 }],
      maMau: bai(nhieu(DOC, FOR(2, ['move()']), ['turn_right()', 'move()'])),
      sao: { o: 10, nhip: 10 },
      loiGiai: bai(nhieu(DOC, DI_D, ['turn_right()', 'move()'])),
      loiGiaiKhac: { moTa: 'Đi d ô bằng hàm forward(d) của gói trước', baiLam: bai(nhieu(DOC, ['forward(d)', 'turn_right()', 'move()'])) },
      loiSai: [
        { moTa: 'Đếm ô của sân đầu, viết cố định range(2): sân thứ hai rẽ quá sớm', baiLam: bai(nhieu(DOC, FOR(2, ['move()']), ['turn_right()', 'move()'])), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Quên dòng d = distance(): Python chưa biết d là gì', baiLam: bai(nhieu(DI_D, ['turn_right()', 'move()'])), phaiCoMa: ['loi-chay'] },
        { moTa: 'Đi d - 1 ô: dừng trước chỗ rẽ một ô', baiLam: bai(nhieu(DOC, FOR('d - 1', ['move()']), ['turn_right()', 'move()'])), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['distance() đếm số ô trống phía trước mũi xe. Xe đứng sát tường thì distance() là 0.',
        'Đọc số một lần vào d ở đầu chương trình, rồi lặp move() d lần.']
    }),
    man({
      chuong: 'hong-ngoai', so: 2, ten: 'Đo hai lần', yMoi: 'đưa d vào forward(d), đo lại sau khi rẽ', buocVideo: 'Đo khoảng cách', hamCuaEmCan: ['move', 'turn_right', 'forward'],
      deBai: 'Đường có hai đoạn thẳng, mỗi sân dài ngắn khác nhau. Đo distance() ở đầu mỗi đoạn rồi đưa số đó vào forward(d) để đi hết đoạn.',
      san: [['######', '...F##', '.#####', '.#####'], ['....F#', '.#####', '.#####', '.#####']],
      batDau: [{ x: 0, y: 3, huong: 0 }, { x: 0, y: 3, huong: 0 }],
      maMau: bai(nhieu(DOC, ['forward(d)', 'turn_right()'])),
      sao: { o: 12, nhip: 14 },
      loiGiai: bai(nhieu(DOC, ['forward(d)', 'turn_right()'], DOC, ['forward(d)'])),
      loiGiaiKhac: { moTa: 'Đoạn sau đi bằng vòng for thay cho forward(d)', baiLam: bai(nhieu(DOC, ['forward(d)', 'turn_right()'], DOC, DI_D)) },
      loiSai: [
        { moTa: 'Không đo lại sau khi rẽ: d vẫn là số ô của đoạn đầu', baiLam: bai(nhieu(DOC, ['forward(d)', 'turn_right()', 'forward(d)'])), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đo trước, rẽ rồi mới đi: xe đi sai hướng', baiLam: bai(nhieu(DOC, ['turn_right()', 'forward(d)'], DOC, ['forward(d)'])), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Gọi forward() mà không đưa số vào', baiLam: bai(nhieu(DOC, ['forward()', 'turn_right()'], DOC, ['forward(d)'])), phaiCoMa: ['loi-chay'] }
      ],
      goiY: ['Rẽ xong thì phía trước mũi xe đã khác: số ô trống cũng khác.',
        'Gán lại d = distance() sau khi rẽ, biến d nhận số mới.']
    }),
    man({
      chuong: 'hong-ngoai', so: 3, ten: 'Còn ô trống thì đi', yMoi: 'phép so sánh distance() > 0 trong while', buocVideo: 'So mức an toàn', hamCuaEmCan: ['move', 'turn_left', 'forward'],
      deBai: 'distance() trả về một số nên ta so sánh được nó với số khác. Phép so sánh distance() > 0 đúng khi phía trước còn ô trống. Dùng while distance() > 0: để đi tới sát tường, rẽ trái rồi lại đi tới sát tường để vào cờ.',
      veMaMau: 'Chương trình có sẵn mới đi hết đoạn đầu. Viết tiếp: rẽ trái rồi đi tới sát tường.',
      san: [['######', '######', '#F...#', '####.#', '####.#'], ['######', '##F..#', '####.#', '####.#', '####.#']],
      batDau: [{ x: 4, y: 4, huong: 0 }, { x: 4, y: 4, huong: 0 }],
      maMau: bai(WHILE('distance() > 0', ['move()'])),
      sao: { o: 10, nhip: 12 },
      loiGiai: bai(nhieu(WHILE('distance() > 0', ['move()']), ['turn_left()'], WHILE('distance() > 0', ['move()']))),
      loiGiaiKhac: { moTa: 'Đoạn sau đo vào d rồi gọi forward(d)', baiLam: bai(nhieu(WHILE('distance() > 0', ['move()']), ['turn_left()'], DOC, ['forward(d)'])) },
      loiSai: [
        { moTa: 'So với 1: xe dừng khi còn một ô, rẽ sớm', baiLam: bai(nhieu(WHILE('distance() > 1', ['move()']), ['turn_left()'], WHILE('distance() > 1', ['move()']))), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'distance() >= 0 luôn đúng: vòng lặp không bao giờ dừng, xe húc tường mãi', baiLam: bai(nhieu(WHILE('distance() >= 0', ['move()']), ['turn_left()'], WHILE('distance() > 0', ['move()']))), phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Dùng if thay cho while: xe chỉ đi một ô', baiLam: bai(nhieu(['if distance() > 0:', '    move()', 'turn_left()'], WHILE('distance() > 0', ['move()']))), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Phép so sánh: dấu > đọc là "lớn hơn". distance() > 0 nghĩa là còn ít nhất một ô trống phía trước.',
        'while lặp lại khi phép so sánh còn đúng. Sát tường thì distance() là 0, phép so sánh sai, vòng lặp dừng.']
    }),
    man({
      chuong: 'hong-ngoai', so: 4, ten: 'Dừng cách tường 20 cm', yMoi: 'so với số khác 0: dừng khi còn 2 ô', buocVideo: 'So mức an toàn', hamCuaEmCan: ['move', 'turn_right', 'forward'],
      deBai: 'Lối rẽ vào cờ nằm cách tường cuối 2 ô, tức 20 cm. Đi khi phía trước còn hơn 2 ô trống, dừng lại rồi rẽ phải vào lối đó.',
      veMaMau: 'Chương trình có sẵn đi tới sát tường mới rẽ: quá sát, lỡ mất lối rẽ. Sửa số trong phép so sánh của vòng lặp đầu.',
      san: [['.....##', '##.####', '##F####'], ['.......', '####.##', '####F##']],
      batDau: [{ x: 0, y: 0, huong: 1 }, { x: 0, y: 0, huong: 1 }],
      maMau: bai(nhieu(WHILE('distance() > 0', ['move()']), ['turn_right()'], WHILE('distance() > 0', ['move()']))),
      sao: { o: 10, nhip: 12 },
      loiGiai: bai(nhieu(WHILE('distance() > 2', ['move()']), ['turn_right()'], WHILE('distance() > 0', ['move()']))),
      loiGiaiKhac: { moTa: 'Đoạn sau đi cố định forward(2)', baiLam: bai(nhieu(WHILE('distance() > 2', ['move()']), ['turn_right()', 'forward(2)'])) },
      loiSai: [
        { moTa: 'Không sửa: xe đi tới sát tường mới rẽ, lỡ lối vào cờ', baiLam: bai(nhieu(WHILE('distance() > 0', ['move()']), ['turn_right()'], WHILE('distance() > 0', ['move()']))), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'So với 3: xe dừng sớm một ô', baiLam: bai(nhieu(WHILE('distance() > 3', ['move()']), ['turn_right()'], WHILE('distance() > 0', ['move()']))), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Dùng >= 2: xe còn đi thêm khi đúng 2 ô, dừng muộn một ô', baiLam: bai(nhieu(WHILE('distance() >= 2', ['move()']), ['turn_right()'], WHILE('distance() > 0', ['move()']))), phaiCoMa: ['chua-toi-co'] }
      ],
      goiY: ['Đếm trên sân: đứng ở chỗ rẽ thì phía trước còn mấy ô trống?',
        'distance() > 2 đúng khi còn 3, 4, 5… ô; còn đúng 2 ô thì sai, vòng lặp dừng.']
    }),
    man({
      chuong: 'hong-ngoai', so: 5, ten: 'Biến an_toan', yMoi: 'so sánh với biến an_toan', buocVideo: 'So mức an toàn', hamCuaEmCan: ['move', 'turn_right'],
      deBai: 'Mức an toàn của xe là 2 ô (20 cm): gán an_toan = 2 rồi dùng biến này trong phép so sánh. Ở mỗi đoạn, xe đi khi distance() > an_toan, dừng thì rẽ phải. Hai lần rẽ phải, thêm một bước là tới cờ.',
      veMaMau: 'Chương trình có sẵn đã có biến an_toan nhưng vòng lặp vẫn so với 0. Thay số 0 bằng an_toan.',
      san: [['....##', '#.####', 'F.####', '#.####', '#.####', '######'], ['......', '##F.##', '###.##', '###.##', '######', '######']],
      batDau: [{ x: 0, y: 0, huong: 1 }, { x: 0, y: 0, huong: 1 }],
      maMau: bai(nhieu(['an_toan = 2'], FOR(2, WHILE('distance() > 0', ['move()']).concat(['turn_right()'])), ['move()'])),
      sao: { o: 11, nhip: 13 },
      loiGiai: bai(nhieu(['an_toan = 2'], FOR(2, WHILE('distance() > an_toan', ['move()']).concat(['turn_right()'])), ['move()'])),
      loiGiaiKhac: { moTa: 'Viết hai đoạn liền nhau, không dùng vòng for', baiLam: bai(nhieu(['an_toan = 2'], WHILE('distance() > an_toan', ['move()']), ['turn_right()'], WHILE('distance() > an_toan', ['move()']), ['turn_right()', 'move()'])) },
      loiSai: [
        { moTa: 'Không sửa: so với 0 nên xe đi tới sát tường mới rẽ', baiLam: bai(nhieu(['an_toan = 2'], FOR(2, WHILE('distance() > 0', ['move()']).concat(['turn_right()'])), ['move()'])), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Gán an_toan = 1: xe rẽ muộn một ô', baiLam: bai(nhieu(['an_toan = 1'], FOR(2, WHILE('distance() > an_toan', ['move()']).concat(['turn_right()'])), ['move()'])), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Gõ nhầm tên biến trong phép so sánh', baiLam: bai(nhieu(['an_toan = 2'], FOR(2, WHILE('distance() > antoan', ['move()']).concat(['turn_right()'])), ['move()'])), phaiCoMa: ['loi-chay'] }
      ],
      goiY: ['Biến giữ một con số để dùng nhiều lần: an_toan = 2 rồi viết distance() > an_toan.',
        'Muốn xe giữ khoảng cách khác thì chỉ cần sửa một chỗ: dòng an_toan = 2.']
    }),
    man({
      chuong: 'hong-ngoai', so: 6, ten: 'Gần thì rẽ', yMoi: 'if distance() <= an_toan: rẽ, else: đi', buocVideo: 'Gần thì rẽ', hamCuaEmCan: ['move', 'turn_right'],
      deBai: 'Robot hút bụi chạy mãi: mỗi lần đo, nếu vật cản gần, tức distance() <= an_toan, thì rẽ phải; còn không thì đi một ô. Phép so sánh <= đọc là "nhỏ hơn hoặc bằng". Đưa robot tới cờ ở cả hai sân.',
      veMaMau: 'Chương trình có sẵn đã có vòng lặp và an_toan = 2. Thêm điều kiện: gần thì rẽ phải, còn không thì đi.',
      san: [['......#', '###.###', '..F.###', '###.###', '###.###', '#######'], ['.......', '####.##', '#..F.##', '####.##', '####.##', '#######']],
      batDau: [{ x: 0, y: 0, huong: 1 }, { x: 0, y: 0, huong: 1 }],
      maMau: bai(nhieu(['an_toan = 2'], WHILE('True', ['move()']))),
      sao: { o: 11, nhip: 17 },
      loiGiai: bai(nhieu(['an_toan = 2'], WHILE('True', ['if distance() <= an_toan:', '    turn_right()', 'else:', '    move()']))),
      loiGiaiKhac: { moTa: 'Đo vào biến d trước rồi so sánh d', baiLam: bai(nhieu(['an_toan = 2'], WHILE('True', ['d = distance()', 'if d <= an_toan:', '    turn_right()', 'else:', '    move()']))) },
      loiSai: [
        { moTa: 'Không có điều kiện: robot đi thẳng, húc tường mãi', baiLam: bai(nhieu(['an_toan = 2'], WHILE('True', ['move()']))), phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Đổi chỗ hai nhánh: gần thì lại đi, xa thì rẽ', baiLam: bai(nhieu(['an_toan = 2'], WHILE('True', ['if distance() <= an_toan:', '    move()', 'else:', '    turn_right()']))), phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Dùng < thay cho <=: còn đúng 2 ô robot vẫn đi, rẽ muộn', baiLam: bai(nhieu(['an_toan = 2'], WHILE('True', ['if distance() < an_toan:', '    turn_right()', 'else:', '    move()']))), phaiCoMa: ['vong-vo-han'] }
      ],
      goiY: ['Mỗi vòng lặp robot chỉ làm một việc: hoặc rẽ, hoặc đi một ô. Hỏi distance() trước rồi mới chọn.',
        'distance() <= an_toan đúng khi còn 2, 1 hay 0 ô trống: lúc đó phải rẽ.']
    }),
    man({
      chuong: 'hong-ngoai', so: 7, ten: 'Phanh không kịp', yMoi: 'sửa ngưỡng: xe đi 3 ô mới đo lại', buocVideo: 'So mức an toàn', hamCuaEmCan: ['move', 'turn_right', 'forward'],
      deBai: 'Xe chạy nhanh: mỗi lần forward(3) đi luôn 3 ô (30 cm) rồi mới đo lại. Sola đặt an_toan = 0 nên xe đâm tường. Sửa số an_toan để xe dừng kịp, rồi rẽ phải vào lối dẫn tới cờ.',
      veMaMau: 'Chạy thử bản của Sola: xe đâm tường ở sân nào? Lúc đó distance() còn mấy ô?',
      san: [['.....####', '###.#####', '###F#####'], ['.........', '######.##', '######F##']],
      batDau: [{ x: 0, y: 0, huong: 1 }, { x: 0, y: 0, huong: 1 }],
      maMau: bai(nhieu(['an_toan = 0'], WHILE('distance() > an_toan', ['forward(3)']), ['turn_right()', 'forward(2)'])),
      sao: { o: 12, nhip: 15 },
      loiGiai: bai(nhieu(['an_toan = 2'], WHILE('distance() > an_toan', ['forward(3)']), ['turn_right()', 'forward(2)'])),
      loiGiaiKhac: { moTa: 'Lối rẽ đi bằng while distance() > 0', baiLam: bai(nhieu(['an_toan = 2'], WHILE('distance() > an_toan', ['forward(3)']), ['turn_right()'], WHILE('distance() > 0', ['move()']))) },
      loiSai: [
        { moTa: 'Không sửa: an_toan = 0 quá nhỏ, còn 1 hay 2 ô xe vẫn lao tới 3 ô và đâm', baiLam: bai(nhieu(['an_toan = 0'], WHILE('distance() > an_toan', ['forward(3)']), ['turn_right()', 'forward(2)'])), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'an_toan = 1 vẫn chưa đủ: còn 2 ô xe vẫn lao tới 3 ô', baiLam: bai(nhieu(['an_toan = 1'], WHILE('distance() > an_toan', ['forward(3)']), ['turn_right()', 'forward(2)'])), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'an_toan = 5 quá xa: xe dừng sớm, rẽ vào tường', baiLam: bai(nhieu(['an_toan = 5'], WHILE('distance() > an_toan', ['forward(3)']), ['turn_right()', 'forward(2)'])), phaiCoMa: ['dam-tuong', 'chua-toi-co'] },
        { moTa: 'Đổi > thành >=: còn đúng 2 ô xe vẫn lao tới', baiLam: bai(nhieu(['an_toan = 2'], WHILE('distance() >= an_toan', ['forward(3)']), ['turn_right()', 'forward(2)'])), phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['Mỗi lần đi 3 ô thì trước đó phải còn ít nhất 3 ô trống. Còn 2 ô hay ít hơn là phải dừng.',
        'Ngưỡng an toàn phải đủ lớn để xe kịp phanh: thử 1, rồi 2.']
    }),
    man({
      chuong: 'hong-ngoai', so: 8, ten: 'Chân bàn', yMoi: 'vật cản là chân bàn (vật), không phải tường', buocVideo: 'Gần thì rẽ', hamCuaEmCan: ['move', 'turn_right', 'turn_left'],
      deBai: 'Trong phòng có chân bàn (vật nằm trên sàn). Mắt hồng ngoại thấy chân bàn như thấy tường. Robot hút bụi giữ cách vật cản 20 cm: gần thì rẽ phải, còn không thì đi, tới khi gặp cờ.',
      san: [['......o', '###.###', '###F###', '###.###', '###.###', '###o###'], ['....o##', '#.#####', '#.#####', '#F#####', '#.#####', '#.#####']],
      batDau: [{ x: 0, y: 0, huong: 1 }, { x: 0, y: 0, huong: 1 }],
      maMau: bai(nhieu(['an_toan = 2'], WHILE('True', ['if distance() <= an_toan:', '    turn_left()', 'else:', '    move()']))),
      sao: { o: 11, nhip: 11 },
      loiGiai: bai(nhieu(['an_toan = 2'], WHILE('True', ['if distance() <= an_toan:', '    turn_right()', 'else:', '    move()']))),
      loiGiaiKhac: { moTa: 'Đo vào biến d trước rồi so sánh d', baiLam: bai(nhieu(['an_toan = 2'], WHILE('True', ['d = distance()', 'if d <= an_toan:', '    turn_right()', 'else:', '    move()']))) },
      loiSai: [
        { moTa: 'Rẽ trái thay vì rẽ phải: robot đi vào góc cụt', baiLam: bai(nhieu(['an_toan = 2'], WHILE('True', ['if distance() <= an_toan:', '    turn_left()', 'else:', '    move()']))), phaiCoMa: ['vong-vo-han'] },
        { moTa: 'an_toan = 0: robot đi tới sát chân bàn mới rẽ, lỡ lối', baiLam: bai(nhieu(['an_toan = 0'], WHILE('True', ['if distance() <= an_toan:', '    turn_right()', 'else:', '    move()']))), phaiCoMa: ['vong-vo-han'] }
      ],
      goiY: ['Chân bàn chặn tia hồng ngoại: distance() đếm số ô trống tới chân bàn.',
        'Chương trình giống màn "Gần thì rẽ": chỉ cần đúng an_toan và đúng hướng rẽ.']
    }),
    man({
      chuong: 'hong-ngoai', so: 9, ten: 'Nhớ số để quay về', yMoi: 'dùng lại biến d để quay về đúng chỗ cũ', buocVideo: 'Đo khoảng cách', mucTieu: 'dua-vat',
      hamCuaEmCan: ['move', 'u_turn', 'forward', 'pick', 'drop'],
      deBai: 'Xe có tay kẹp. Phía trước có một vật, xa gần tùy sân. Đo khoảng cách vào d, tiến tới sát vật rồi nhặt nó, quay đầu, đi về đúng d ô rồi đặt vật vào ô đích ngay sau chỗ xuất phát.',
      veMaMau: 'Chương trình có sẵn đi về cố định hai ô nên có sân xe đi quá. Biến d vẫn còn nhớ số đã đo: dùng lại nó.',
      san: [['D..o##'], ['D...o#']],
      batDau: [{ x: 1, y: 0, huong: 1 }, { x: 1, y: 0, huong: 1 }],
      maMau: bai(nhieu(DOC, ['forward(d)', 'pick()', 'u_turn()', 'forward(2)', 'drop()'])),
      sao: { o: 24, nhip: 14 },
      loiGiai: bai(nhieu(DOC, ['forward(d)', 'pick()', 'u_turn()', 'forward(d)', 'drop()'])),
      loiGiaiKhac: { moTa: 'Đường về đi bằng vòng for theo d', baiLam: bai(nhieu(DOC, ['forward(d)', 'pick()', 'u_turn()'], DI_D, ['drop()'])) },
      loiSai: [
        { moTa: 'Đi về cố định hai ô: sân gần thì xe đi quá, không còn chỗ đặt vật', baiLam: bai(nhieu(DOC, ['forward(d)', 'pick()', 'u_turn()', 'forward(2)', 'drop()'])), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Đo lại sau khi quay đầu: d thành số ô tới mép sân, xe đi quá', baiLam: bai(nhieu(DOC, ['forward(d)', 'pick()', 'u_turn()'], DOC, ['forward(d)', 'drop()'])), phaiCoMa: ['chua-dua-vat'] },
        { moTa: 'Quên nhặt vật trước khi quay về', baiLam: bai(nhieu(DOC, ['forward(d)', 'u_turn()', 'forward(d)', 'drop()'])), phaiCoMa: ['chua-dua-vat'] }
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
      maMau: bai(nhieu(['an_toan = 2'], WHILE('True', ['if distance() <= an_toan:', '    turn_right()', 'else:', '    move()']))),
      sao: { o: 11, nhip: 31 },
      loiGiai: bai(nhieu(['an_toan = 1'], WHILE('True', ['if distance() <= an_toan:', '    turn_right()', 'else:', '    move()']))),
      loiGiaiKhac: { moTa: 'Đo vào biến d trước rồi so sánh d', baiLam: bai(nhieu(['an_toan = 1'], WHILE('True', ['d = distance()', 'if d <= an_toan:', '    turn_right()', 'else:', '    move()']))) },
      loiSai: [
        { moTa: 'Giữ an_toan = 2: robot rẽ sớm một ô, đi vào tường', baiLam: bai(nhieu(['an_toan = 2'], WHILE('True', ['if distance() <= an_toan:', '    turn_right()', 'else:', '    move()']))), phaiCoMa: ['vong-vo-han'] },
        { moTa: 'an_toan = 0: robot đi tới sát vật cản mới rẽ, lỡ lối', baiLam: bai(nhieu(['an_toan = 0'], WHILE('True', ['if distance() <= an_toan:', '    turn_right()', 'else:', '    move()']))), phaiCoMa: ['vong-vo-han'] },
        { moTa: 'Rẽ trái thay vì rẽ phải', baiLam: bai(nhieu(['an_toan = 1'], WHILE('True', ['if distance() <= an_toan:', '    turn_left()', 'else:', '    move()']))), phaiCoMa: ['vong-vo-han'] }
      ],
      goiY: ['Đứng ở một chỗ rẽ, đếm số ô trống còn lại tới vật cản: đó là an_toan.',
        'Phòng thứ ba: robot xuất phát mặt sát mép sân, nên việc đầu tiên là rẽ.']
    })
  ];

  ManHoc.manHongNgoai = DS;
  if (laNode) module.exports = ManHoc;
})();
