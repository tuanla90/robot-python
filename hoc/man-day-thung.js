/* ============================================================================
   man-day-thung.js — "Robot Chấn Hưng": NGÂN HÀNG MÀN MỚI của mùa 2, gói 5 "Đẩy thùng" (KE-HOACH-MUA-2.md).
   Khung mùa 2 (lo-trinh-hoc.js, khối "MÙA 2 = 10 GÓI", mảng MUA_2) đã chừa chỗ: tệp đã có trong danh sách require của lo-trinh-hoc.js và
   thẻ <script> của game/choi.html. Màn tự hiện đúng chương, đúng gói.
     - `day-thung` (mã day-thung.1 … day-thung.10): chương 1: xích tiến vào thùng nặng thì đẩy
     - `che-day-thung` (mã che-day-thung.1 … che-day-thung.10): chương 2 "Hàm đẩy thùng"
   Mỗi màn khai `chuong` (một trong các mã trên) và `so` (1, 2, …: thứ tự trong phần màn mới của chương); mã `ma` = chuong + '.' + so là khóa lưu sao,
   KHÔNG đổi sau khi xuất bản. Gọi ManHoc.chuanHoa(m) như các tệp màn khác. Chương còn trống thì chưa hiện; gói chưa có chương nào có màn thì chưa hiện.
   Ràng buộc mùa 2 (hoc/kiem-lo-trinh.mjs): robot chỉ dùng part mùa 1 + xích + súng hơi (+ hồng ngoại khi lõi có); không bậc thang S, hố u, gầm n;
   biến chỉ từ gói 1 chương 2, hàm có tham số chỉ từ gói 2 chương 2 (tham-so); hàm của em cần phải được tạo ở màn đứng trước.
   Tệp này KHÔNG tự thêm màn vào ManHoc: danh sách nằm ở ManHoc.manDayThung, lo-trinh-hoc.js thêm vào chương rồi xếp chỗ (so, hang do dungChuong đặt).

   NỘI DUNG (27/10): XE BÁNH XÍCH đẩy THÙNG NẶNG (luật ở san-hoc.js, mục XÍCH ĐẨY THÙNG NẶNG; mọi màn khai xichDay: true):
   xích TIẾN vào ô thùng thì thùng trượt 1 ô theo hướng tiến nếu ô sau thùng nhận được thùng; ô sau bị chặn thì xích đứng yên như đâm tường;
   LÙI không kéo thùng. Mục tiêu 'day-thung' (mọi thùng nằm trên ô đích; thùng kẹt góc không phải đích thì dừng sớm) hay 'toi-co' (thùng chắn lối).
   Không súng hơi, không warm(), không beSung / lucBan (gói sau). Thùng đè nút đè M (mùa 1, gói Nút đè) giữ cửa mở: lõi tính thùng nằm trên M là đè.
   Hàm của em dùng lại: move (tiến, cũng là đẩy), back, tr_right / tr_left / spin / sidestep (gói 1 mùa 2), forward(n) (gói 2), go_to_wall (gói 3).
   Hồng ngoại: distance() đếm số ô trống tới vật cản đầu tiên, THÙNG LÀ VẬT CẢN: forward(distance()) đưa xích tới sát thùng.
   MỘT SÂN mỗi màn (luật lộ trình: nhiều sân chỉ ở trùm). kiem-day-thung.mjs + do-duong-day-thung.mjs kiểm (bộ dò liệt kê lời cố định rẻ nhất).
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-chuoi-1.js') : window.ManHoc;

  var BANH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
  var BANH_MAT = BANH.concat(['distance']);

  /** Thụt mọi dòng vào một bậc (4 dấu cách). */
  function thut(ds) { return ds.map(function (s) { return '    ' + s; }); }
  function nhieu() { var kq = []; for (var i = 0; i < arguments.length; i++) kq = kq.concat(arguments[i]); return kq; }
  /** Vòng for: dòng đầu rồi thân thụt một bậc. n là số hay biểu thức; bien là tên biến đếm (mặc định i). */
  function FOR(n, than, bien) { return ['for ' + (bien || 'i') + ' in range(' + n + '):'].concat(thut(than)); }
  function WHILE(dk, than) { return ['while ' + dk + ':'].concat(thut(than)); }
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo.slice(), than: than.slice() }; }
  function bai(chinh, hamCuaMan) { return { chinh: chinh.slice(), hamCuaMan: (hamCuaMan || []).slice() }; }

  /** Điền trường chung: xe bánh xích đẩy thùng; coMat: gắn hồng ngoại (khay có distance). */
  function man(m, coMat) {
    m.cauTruc = ['for', 'if', 'while'];
    m.loaiRobot = 'xich';
    m.xichDay = true;
    m.robot = { than: 'xich', tay: null, camBien: coMat ? [{ ma: 'hong-ngoai', o: 'tren' }] : [] };
    m.hamGoc = coMat ? BANH_MAT : BANH;
    m.moXuong = true; m.camHamCuaEm = false;
    m.khung = { chinh: 10, moiHam: 10 };
    if (!m.mucTieu) m.mucTieu = 'day-thung';
    if (Array.isArray(m.san[0])) m.nhipTheo = 'tong';
    return ManHoc.chuanHoa(m);
  }

  var DS = [
    /* ================================================================ chương day-thung: xích tiến vào thùng nặng thì đẩy */
    man({
      chuong: 'day-thung', so: 1, ten: 'Thùng trượt một ô', yMoi: 'xích tiến vào thùng nặng thì thùng trượt một ô', hamCuaEmCan: ['move', 'back', 'forward'],
      deBai: 'Xích của xe đã được nâng cấp: tiến vào thùng nặng thì thùng trượt đi một ô. Đẩy thùng vào ô đích khung vàng.',
      veMaMau: 'Chương trình có sẵn mới tiến một lần. Thùng đi được mấy ô?',
      san: ['#######', '#.H.D.#', '#######'],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['move()']),
      sao: { o: 5, nhip: 2 },
      loiGiai: bai(['move()', 'move()']),
      loiGiaiKhac: { moTa: 'Dùng forward(2) của gói trước: đúng, nhưng thêm thân một hàm', baiLam: bai(['forward(2)']) },
      loiSai: [
        { moTa: 'Mới tiến một lần: thùng chưa tới ô đích', baiLam: bai(['move()']), phaiCoMa: ['chua-day-thung'] },
        { moTa: 'Lùi thay vì tiến: xích đi ngược, đâm tường phía sau', baiLam: bai(['back()', 'back()']), phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['Mỗi lần move() xích tiến một ô, và thùng trước mũi trượt theo một ô.',
        'Thùng cách ô đích hai ô: cần tiến hai lần.']
    }),
    man({
      chuong: 'day-thung', so: 2, ten: 'Đẩy cả đoạn đường', yMoi: 'đẩy nhiều ô bằng vòng for', hamCuaEmCan: ['move', 'back', 'forward'],
      deBai: 'Thùng nằm cuối một hành lang dài, ô đích ở đầu kia. Xích tiến bao nhiêu lần thì thùng trượt bấy nhiêu ô. Dùng vòng lặp for.',
      veMaMau: 'Chương trình có sẵn lặp ba lần: thùng còn cách ô đích bao xa?',
      san: ['###', '#D#', '#.#', '#.#', '#.#', '#H#', '#.#', '#.#', '###'],
      batDau: { x: 1, y: 7, huong: 0 },
      maMau: bai(FOR(3, ['move()'])),
      sao: { o: 5, nhip: 5 },
      loiGiai: bai(FOR(5, ['move()'])),
      loiGiaiKhac: { moTa: 'Dùng forward(5): đúng, nhưng thêm thân một hàm', baiLam: bai(['forward(5)']) },
      loiSai: [
        { moTa: 'Lặp ba lần: thùng mới đi nửa đường', baiLam: bai(FOR(3, ['move()'])), phaiCoMa: ['chua-day-thung'] },
        { moTa: 'Lặp back(): lùi không đẩy được thùng, xích đâm tường phía sau', baiLam: bai(FOR(5, ['back()'])), phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['Xích phải đi một ô trống tới sát thùng trước, rồi mới bắt đầu đẩy.',
        'Đếm: một ô trống tới thùng, rồi bốn ô đẩy thùng tới ô đích.']
    }),
    man({
      chuong: 'day-thung', so: 3, ten: 'Quay xích rồi đẩy', yMoi: 'quay xích bằng tr_right() để đẩy theo hướng khác', hamCuaEmCan: ['move', 'tr_right', 'tr_left', 'turn_right', 'forward'],
      deBai: 'Xích lên một ô, quay phải rồi đẩy thùng sang phải vào ô đích. Nhớ lại: xích quay chậm, phải dùng hàm tr_right() của gói Bánh xích.',
      veMaMau: 'Chương trình có sẵn quay bằng turn_right() của xe hai bánh. Chạy thử xem xích quay được không.',
      san: ['#######', '#.H..D#', '#.#####', '#######'],
      batDau: { x: 1, y: 2, huong: 0 },
      maMau: bai(nhieu(['move()', 'turn_right()'], FOR(4, ['move()']))),
      sao: { o: 10, nhip: 6 },
      loiGiai: bai(nhieu(['move()', 'tr_right()'], FOR(4, ['move()']))),
      loiGiaiKhac: { moTa: 'Đẩy bằng forward(4): đúng, nhưng thêm thân một hàm', baiLam: bai(['move()', 'tr_right()', 'forward(4)']) },
      loiSai: [
        { moTa: 'turn_right() của xe hai bánh: xích chỉ nhích nửa vòng, vẫn quay mặt lên', baiLam: bai(nhieu(['move()', 'turn_right()'], FOR(4, ['move()']))), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Quay trái: xích quay vào tường', baiLam: bai(nhieu(['move()', 'tr_left()'], FOR(4, ['move()']))), phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['tr_right() quay xích 90 độ trong hai nhịp liền.',
        'Sau khi quay, thùng ở ngay trước mũi: mỗi move() đẩy nó một ô.']
    }),
    man({
      chuong: 'day-thung', so: 4, ten: 'Đố: lùi có kéo được không?', yMoi: 'lùi vào thùng không đẩy được: quay đầu rồi tiến', hamCuaEmCan: ['move', 'back', 'tr_right', 'spin'],
      deBai: 'Thùng ở SAU lưng xe, ô đích ở bên kia thùng. Sola viết: lùi ba lần cho xích đẩy thùng bằng đuôi. Chạy thử bản của Sola rồi sửa lại.',
      veMaMau: 'Bản của Sola lùi vào thùng. Xích có đẩy được thùng khi lùi không?',
      san: ['########', '#..H..D#', '########'],
      batDau: { x: 2, y: 1, huong: 3 },
      maMau: bai(FOR(3, ['back()'])),
      sao: { o: 10, nhip: 7 },
      loiGiai: bai(nhieu(['tr_right()', 'tr_right()'], FOR(3, ['move()']))),
      loiGiaiKhac: { moTa: 'Quay đầu bằng spin() của gói Bánh xích: đúng, nhưng thêm thân một hàm', baiLam: bai(nhieu(['spin()'], FOR(3, ['move()']))) },
      loiSai: [
        { moTa: 'Bản của Sola: lùi vào thùng, xích đứng yên như đâm tường', baiLam: bai(FOR(3, ['back()'])), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Quay đầu rồi mà vẫn lùi: xích đi xa khỏi thùng', baiLam: bai(nhieu(['spin()'], FOR(3, ['back()']))), phaiCoMa: ['chua-day-thung'] },
        { moTa: 'Quay đầu, đẩy hai lần: thùng còn thiếu một ô', baiLam: bai(nhieu(['spin()'], FOR(2, ['move()']))), phaiCoMa: ['chua-day-thung'] }
      ],
      goiY: ['Xích chỉ đẩy được thùng khi TIẾN. Lùi vào thùng thì không kéo, không đẩy.',
        'Hai lần tr_right() là quay đầu. Sau đó thùng ở ngay trước mũi.']
    }),
    man({
      chuong: 'day-thung', so: 5, ten: 'Ô sau thùng là tường', yMoi: 'ô sau thùng bị chặn: đi vòng, đẩy từ phía khác', hamCuaEmCan: ['move', 'tr_right', 'tr_left', 'sidestep'],
      deBai: 'Thùng nằm sát tường phía trên nên đẩy lên không được. Ô đích ở bên trái thùng. Đi vòng sang bên phải thùng rồi đẩy nó sang trái.',
      veMaMau: 'Chương trình có sẵn đẩy thùng lên. Chạy thử: ô sau thùng là gì?',
      san: ['#######', '#.D.H.#', '####..#', '#######'],
      batDau: { x: 4, y: 2, huong: 0 },
      maMau: bai(FOR(2, ['move()'])),
      sao: { o: 15, nhip: 10 },
      loiGiai: bai(nhieu(['tr_right()', 'move()'], FOR(2, ['tr_left()', 'move()']), ['move()'])),
      loiGiaiKhac: { moTa: 'Viết thẳng từng lệnh, không gộp hai lần quay trái rồi tiến vào vòng for', baiLam: bai(nhieu(['tr_right()', 'move()', 'tr_left()', 'move()', 'tr_left()'], FOR(2, ['move()']))) },
      loiSai: [
        { moTa: 'Đẩy thùng lên: ô sau thùng là tường, xích đứng yên', baiLam: bai(FOR(2, ['move()'])), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Đi vòng bằng sidestep() rồi quay phải: mũi xích quay ra xa thùng', baiLam: bai(nhieu(['sidestep()', 'move()', 'tr_right()'], FOR(2, ['move()']))), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Đẩy một lần: thùng còn cách ô đích một ô', baiLam: bai(['tr_right()', 'move()', 'tr_left()', 'move()', 'tr_left()', 'move()']), phaiCoMa: ['chua-day-thung'] }
      ],
      goiY: ['Muốn đẩy thùng sang trái thì xích phải đứng bên PHẢI thùng, mũi quay sang trái.',
        'Quay phải, tiến; rồi hai lần: quay trái, tiến. Lần thứ hai xích đã đẩy thùng một ô; tiến thêm một ô nữa.']
    }),
    man({
      chuong: 'day-thung', so: 6, ten: 'Mắt hồng ngoại thấy thùng', yMoi: 'distance() đếm số ô trống tới thùng: range(distance()) tới sát thùng', hamCuaEmCan: ['move', 'tr_right', 'forward'],
      deBai: 'Ba thùng nằm trên ba đoạn đường dài ngắn khác nhau, ô đích ngay sau mỗi thùng; đẩy quá một ô là thùng kẹt góc. Mắt hồng ngoại coi thùng là vật cản: distance() cho biết còn mấy ô trống tới thùng. Mỗi đoạn: tới sát thùng, đẩy một ô, quay phải.',
      veMaMau: 'Chương trình có sẵn đoạn nào cũng đi hai ô tới thùng. Thay số 2 bằng số đo của mắt hồng ngoại.',
      san: ['#######', '#.#####', '#D#####', '#H.HD.#', '#.#.###', '###.###', '###H###', '###D###', '#######'],
      batDau: { x: 1, y: 4, huong: 0 },
      maMau: bai(FOR(3, ['forward(2)', 'move()', 'tr_right()'])),
      sao: { o: 11, nhip: 10 },
      loiGiai: bai(FOR(3, nhieu(FOR('distance()', ['move()'], 'j'), ['move()', 'tr_right()']))),
      loiGiaiKhac: { moTa: 'Tới sát thùng bằng forward(distance()): đúng, nhưng thêm thân một hàm', baiLam: bai(FOR(3, ['forward(distance())', 'move()', 'tr_right()'])) },
      loiSai: [
        { moTa: 'Đoạn nào cũng đi hai ô: đoạn giữa thùng bị đẩy quá ô đích, kẹt góc', baiLam: bai(FOR(3, ['forward(2)', 'move()', 'tr_right()'])), phaiCoMa: ['thung-ket'] },
        { moTa: 'Quên move() đẩy thùng: xích tới sát thùng rồi quay luôn', baiLam: bai(FOR(3, nhieu(FOR('distance()', ['move()'], 'j'), ['tr_right()']))), phaiCoMa: ['chua-day-thung'] }
      ],
      goiY: ['Thùng nặng chắn tia hồng ngoại như tường: đứng sát thùng thì distance() là 0.',
        'for j in range(distance()): move() đưa xích tới sát thùng; thêm một move() nữa là đẩy thùng vào ô đích.']
    }, true),
    man({
      chuong: 'day-thung', so: 7, ten: 'Thùng lên băng chuyền', yMoi: 'đẩy thùng lên băng chuyền rồi chờ băng chở đi', hamCuaEmCan: ['move', 'forward'],
      deBai: 'Đẩy thùng lên băng chuyền. Băng chở thùng tới ô đích, cứ hai nhịp một ô. Đẩy thêm là thùng rời băng, kẹt góc. Đẩy xong thì chờ: while True: wait() chờ mãi, thùng tới đích là thắng.',
      veMaMau: 'Chương trình có sẵn đẩy thùng lên băng rồi dừng luôn. Băng chưa kịp chở thùng.',
      san: ['######', '#.####', '#>>>D#', '#H####', '#.####', '#.####', '######'],
      batDau: { x: 1, y: 5, huong: 0 },
      maMau: bai(FOR(2, ['move()'])),
      sao: { o: 7, nhip: 7 },
      loiGiai: bai(nhieu(FOR(2, ['move()']), WHILE('True', ['wait()']))),
      loiGiaiKhac: { moTa: 'Đẩy bằng forward(2): đúng, nhưng thêm thân một hàm', baiLam: bai(nhieu(['forward(2)'], WHILE('True', ['wait()']))) },
      loiSai: [
        { moTa: 'Đẩy xong là dừng: băng chưa kịp chở thùng', baiLam: bai(FOR(2, ['move()'])), phaiCoMa: ['chua-day-thung'] },
        { moTa: 'Chờ ba nhịp thì ít quá: thùng mới đi một ô', baiLam: bai(nhieu(FOR(2, ['move()']), FOR(3, ['wait()']))), phaiCoMa: ['chua-day-thung'] },
        { moTa: 'Đẩy ba lần: thùng rời băng, kẹt vào góc', baiLam: bai(nhieu(FOR(3, ['move()']), WHILE('True', ['wait()']))), phaiCoMa: ['thung-ket'] }
      ],
      goiY: ['Thùng nằm trên băng đủ hai nhịp liền thì băng đẩy nó đi một ô.',
        'wait() cho một nhịp trôi qua mà xích đứng yên.']
    }),
    man({
      chuong: 'day-thung', so: 8, ten: 'Mở đường', yMoi: 'mục tiêu tới cờ: đẩy thùng chắn lối vào ngách', mucTieu: 'toi-co', hamCuaEmCan: ['move', 'tr_right', 'go_to_wall'],
      deBai: 'Thùng nặng chắn ngay ngã rẽ xuống cờ. Đẩy thùng vào ngách phía trước một ô để mở đường, rồi rẽ phải xuống cờ.',
      veMaMau: 'Chương trình có sẵn quên đẩy thùng: xích dừng sát thùng rồi rẽ luôn.',
      san: ['#########', '#....H..#', '#####.###', '#####.###', '#####.###', '#####.###', '#####F###', '#########'],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(['go_to_wall()', 'tr_right()', 'go_to_wall()']),
      sao: { o: 11, nhip: 11 },
      loiGiai: bai(nhieu(FOR(4, ['move()']), ['tr_right()'], FOR(5, ['move()']))),
      loiGiaiKhac: { moTa: 'Dùng go_to_wall() rồi move() để đẩy: đúng, nhưng thêm thân một hàm', baiLam: bai(['go_to_wall()', 'move()', 'tr_right()', 'go_to_wall()']) },
      loiSai: [
        { moTa: 'Quên đẩy thùng: xích rẽ khi chưa tới ngã rẽ, quay mặt vào tường', baiLam: bai(['go_to_wall()', 'tr_right()', 'go_to_wall()']), phaiCoMa: ['chua-toi-co'] },
        { moTa: 'Đi ba ô: xích dừng sát thùng, chưa đẩy, rẽ vào tường', baiLam: bai(nhieu(FOR(3, ['move()']), ['tr_right()'], FOR(5, ['move()']))), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Đẩy hai lần: xích đi quá ngã rẽ, rẽ vào tường', baiLam: bai(nhieu(FOR(5, ['move()']), ['tr_right()'], FOR(5, ['move()']))), phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['Ba ô trống tới thùng, thêm một ô đẩy: xích tiến bốn lần là đứng đúng ngã rẽ.',
        'Đẩy hai lần là xích đi quá ngã rẽ. Đường xuống cờ dài năm ô.']
    }, true),
    man({
      chuong: 'day-thung', so: 9, ten: 'Thùng đè nút', yMoi: 'đẩy thùng đè nút M để giữ cửa mở', mucTieu: 'toi-co', hamCuaEmCan: ['move', 'tr_right', 'forward'],
      deBai: 'Nút đè M mở cửa khi có vật đè lên. Xích phải đi qua cửa nên không đứng trên nút được: đẩy thùng nặng đè lên nút, cửa mở, rồi rẽ phải xuống cờ.',
      veMaMau: 'Chương trình có sẵn đẩy thùng ba lần: thùng trượt qua khỏi nút.',
      san: ['#######', '#.H.M.#', '###C###', '###.###', '###F###', '#######'],
      batDau: { x: 1, y: 1, huong: 1 },
      maMau: bai(nhieu(FOR(3, ['move()']), ['tr_right()'], FOR(3, ['move()']))),
      sao: { o: 11, nhip: 7 },
      loiGiai: bai(nhieu(FOR(2, ['move()']), ['tr_right()'], FOR(3, ['move()']))),
      loiGiaiKhac: { moTa: 'Đẩy bằng forward(2): đúng, nhưng thêm thân một hàm', baiLam: bai(nhieu(['forward(2)', 'tr_right()'], FOR(3, ['move()']))) },
      loiSai: [
        { moTa: 'Đẩy ba lần: thùng trượt qua nút, xích đứng trên nút nhưng không ở trước cửa', baiLam: bai(nhieu(FOR(3, ['move()']), ['tr_right()'], FOR(3, ['move()']))), phaiCoMa: ['dam-tuong'] },
        { moTa: 'Đẩy một lần: thùng chưa tới nút, xích quay vào tường', baiLam: bai(nhieu(['move()', 'tr_right()'], FOR(3, ['move()']))), phaiCoMa: ['dam-tuong'] }
      ],
      goiY: ['Thùng nằm trên nút M thì nút bị đè, cửa mở cho tới khi thùng rời đi.',
        'Thùng cách nút hai ô: đẩy hai lần. Lúc đó xích đứng ngay trên cửa.']
    }),
    man({
      chuong: 'day-thung', so: 10, ten: 'Trùm: Kho thùng xích', yMoi: 'một chương trình đẩy thùng cho ba kho', hang: 'trum', hamCuaEmCan: ['move', 'tr_right', 'forward'],
      huyHieu: { ma: 'day-thung', ten: 'Huy hiệu Đẩy thùng' },
      deBai: 'Ba kho hàng, một chương trình. Ở kho nào xích cũng: tới sát thùng thứ nhất, đẩy nó một ô vào ô đích, quay phải, tới sát thùng thứ hai, đẩy nó hai ô vào ô đích. Thùng mỗi kho xa gần khác nhau.',
      veMaMau: 'Chương trình có sẵn đếm cứng số ô của kho thứ nhất.',
      san: [['########', '#D######', '#H..H.D#', '#.######', '#.######', '########'],
        ['########', '#D######', '#H.H.D##', '#.######', '########'],
        ['#########', '#D#######', '#H...H.D#', '#.#######', '#.#######', '#.#######', '#########']],
      batDau: [{ x: 1, y: 4, huong: 0 }, { x: 1, y: 3, huong: 0 }, { x: 1, y: 5, huong: 0 }],
      maMau: bai(['forward(2)', 'move()', 'tr_right()', 'forward(2)', 'forward(2)']),
      sao: { o: 13, nhip: 24 },
      loiGiai: bai(['forward(distance())', 'move()', 'tr_right()', 'forward(distance())', 'forward(2)']),
      loiGiaiKhac: { moTa: 'Đẩy hai ô bằng hai lệnh move(): đúng, thêm một ô', baiLam: bai(['forward(distance())', 'move()', 'tr_right()', 'forward(distance())', 'move()', 'move()']) },
      loiSai: [
        { moTa: 'Đếm cứng theo kho thứ nhất: kho khác xích dừng sai chỗ', baiLam: bai(['forward(2)', 'move()', 'tr_right()', 'forward(2)', 'forward(2)']), phaiCoMa: ['chua-day-thung'] },
        { moTa: 'Đẩy thùng thứ hai một ô: còn thiếu một ô', baiLam: bai(['forward(distance())', 'move()', 'tr_right()', 'forward(distance())', 'move()']), phaiCoMa: ['chua-day-thung'] }
      ],
      goiY: ['Mỗi kho xa gần khác nhau nhưng việc làm giống nhau: đo, tới sát thùng, đẩy.',
        'Thùng thứ hai cách ô đích hai ô: forward(2) sau khi đã sát thùng.']
    }, true),

    /* ================================================================ chương che-day-thung: Hàm đẩy thùng */
    man({
      chuong: 'che-day-thung', so: 1, ten: 'Hàm push(n)', yMoi: 'tạo hàm push(n): tới sát thùng rồi đẩy n ô, forward(distance() + n)', hamCuaEmCan: ['tr_right', 'tr_left', 'forward'],
      taoHam: ['push'], chinhCoDinh: true,
      deBai: 'Tạo hàm push(n): xích tới sát thùng trước mặt rồi đẩy nó n ô. Chương trình chính đã khóa: push(1), quay phải, push(2), quay trái, push(1). Ba thùng xa gần khác nhau, đẩy quá là thùng kẹt góc.',
      veMaMau: 'Hàm push chưa có. Mở Xưởng hàm, tạo nó với tham số n: distance() ô tới sát thùng, cộng thêm n ô đẩy.',
      san: ['#########', '#.###D###', '#D###H###', '#H..H.D.#', '#.#######', '#.#######', '#########'],
      batDau: { x: 1, y: 5, huong: 0 },
      maMau: bai(['push(1)', 'tr_right()', 'push(2)', 'tr_left()', 'push(1)']),
      sao: { o: 17, nhip: 11 },
      loiGiai: { chinh: ['push(1)', 'tr_right()', 'push(2)', 'tr_left()', 'push(1)'], hamCuaEmMoi: [H('push', ['n'], ['forward(distance() + n)'])] },
      loiGiaiKhac: { moTa: 'Hai dòng: forward(distance()) rồi forward(n): đúng, thêm một ô', baiLam: bai(['push(1)', 'tr_right()', 'push(2)', 'tr_left()', 'push(1)']), hamCuaEmMoi: [H('push', ['n'], ['forward(distance())', 'forward(n)'])] },
      loiSai: [
        { moTa: 'Thân hàm chỉ có forward(n): xích không tới sát thùng', baiLam: bai(['push(1)', 'tr_right()', 'push(2)', 'tr_left()', 'push(1)']), hamCuaEmMoi: [H('push', ['n'], ['forward(n)'])], phaiCoMa: ['chua-day-thung'] },
        { moTa: 'Quên cộng n: xích tới sát thùng rồi dừng, không đẩy', baiLam: bai(['push(1)', 'tr_right()', 'push(2)', 'tr_left()', 'push(1)']), hamCuaEmMoi: [H('push', ['n'], ['forward(distance())'])], phaiCoMa: ['chua-day-thung'] },
        { moTa: 'Viết cứng forward(distance() + 2): thùng đầu bị đẩy quá, kẹt góc', baiLam: bai(['push(1)', 'tr_right()', 'push(2)', 'tr_left()', 'push(1)']), hamCuaEmMoi: [H('push', ['n'], ['forward(distance() + 2)'])], phaiCoMa: ['thung-ket'] }
      ],
      goiY: ['distance() là số ô trống tới thùng. Đi chừng ấy ô là sát thùng; đi thêm n ô là thùng trượt n ô.',
        'Thân hàm một dòng: forward(distance() + n).']
    }, true),
    man({
      chuong: 'che-day-thung', so: 2, ten: 'push trong vòng lặp', yMoi: 'gọi push(1) trong vòng lặp for', hamCuaEmCan: ['push', 'tr_left', 'tr_right', 'forward'],
      deBai: 'Bốn thùng nằm trên bốn đoạn đường xoay vòng, xa gần khác nhau. Mỗi đoạn: push(1) rồi quay trái. Viết chương trình chính bằng một vòng lặp.',
      veMaMau: 'Chương trình có sẵn quay phải sau mỗi lần đẩy. Đường này rẽ trái.',
      san: ['##########', '####.#####', '####D#####', '#.DHH#####', '###..#####', '###H...HD#', '###D.#####', '###.######', '##########'],
      batDau: { x: 4, y: 6, huong: 0 },
      maMau: bai(FOR(4, ['push(1)', 'tr_right()'])),
      sao: { o: 12, nhip: 16 },
      loiGiai: bai(FOR(4, ['push(1)', 'tr_left()'])),
      loiGiaiKhac: { moTa: 'Gọi push(1) bốn lần liền, không dùng vòng lặp', baiLam: bai(['push(1)', 'tr_left()', 'push(1)', 'tr_left()', 'push(1)', 'tr_left()', 'push(1)']) },
      loiSai: [
        { moTa: 'Quay phải: xích quay vào tường', baiLam: bai(FOR(4, ['push(1)', 'tr_right()'])), phaiCoMa: ['chua-day-thung'] },
        { moTa: 'push(2): thùng đầu bị đẩy quá ô đích, kẹt góc', baiLam: bai(FOR(4, ['push(2)', 'tr_left()'])), phaiCoMa: ['thung-ket'] }
      ],
      goiY: ['Hàm push của em tự đo nên đoạn dài ngắn thế nào cũng được.',
        'Thân vòng lặp có hai dòng: push(1) và tr_left().']
    }, true),
    man({
      chuong: 'che-day-thung', so: 3, ten: 'Hàm go_around()', yMoi: 'tạo hàm go_around(): đi vòng sang hông thùng, mũi quay vào thùng', hamCuaEmCan: ['move', 'tr_right', 'tr_left', 'sidestep', 'push', 'forward'],
      taoHam: ['go_around'], chinhCoDinh: true,
      deBai: 'Tạo hàm go_around(): xích đang đứng sát thùng, mặt quay vào thùng; đi vòng sang bên phải thùng rồi quay mũi vào thùng. Chương trình chính đã khóa: push(1) cho thùng chạm tường, go_around(), rồi push(2) đẩy thùng sang trái vào ô đích.',
      veMaMau: 'Hàm go_around() chưa có. Quay phải, tiến, quay trái, tiến, quay trái.',
      san: ['######', '#D...#', '###H.#', '###.##', '###.##', '######'],
      batDau: { x: 3, y: 4, huong: 0 },
      maMau: bai(['push(1)', 'go_around()', 'push(2)']),
      sao: { o: 20, nhip: 12 },
      loiGiai: { chinh: ['push(1)', 'go_around()', 'push(2)'], hamCuaEmMoi: [H('go_around', [], ['tr_right()', 'move()', 'tr_left()', 'move()', 'tr_left()'])] },
      loiGiaiKhac: { moTa: 'Dùng sidestep() của gói Bánh xích: đúng, nhưng thêm thân một hàm', baiLam: bai(['push(1)', 'go_around()', 'push(2)']), hamCuaEmMoi: [H('go_around', [], ['sidestep()', 'move()', 'tr_left()'])] },
      loiSai: [
        { moTa: 'Quay phải ở cuối: mũi xích quay ra xa thùng', baiLam: bai(['push(1)', 'go_around()', 'push(2)']), hamCuaEmMoi: [H('go_around', [], ['tr_right()', 'move()', 'tr_left()', 'move()', 'tr_right()'])], phaiCoMa: ['chua-day-thung'] },
        { moTa: 'Thiếu một move(): xích còn ở hàng dưới, đẩy vào tường', baiLam: bai(['push(1)', 'go_around()', 'push(2)']), hamCuaEmMoi: [H('go_around', [], ['tr_right()', 'move()', 'tr_left()', 'tr_left()'])], phaiCoMa: ['chua-day-thung'] }
      ],
      goiY: ['Muốn đẩy thùng sang trái thì xích phải đứng bên phải thùng, mũi quay sang trái.',
        'Vẽ đường đi ra giấy: sang phải một ô, lên một ô, rồi quay mặt vào thùng.']
    }, true),
    man({
      chuong: 'che-day-thung', so: 4, ten: 'Sửa hàm round_left()', yMoi: 'sửa hàm lỗi: quay sai chiều ở bước cuối', hamCuaEmCan: ['move', 'tr_right', 'tr_left', 'push', 'forward'], chinhCoDinh: true,
      deBai: 'Sola viết hàm round_left(): đi vòng sang bên TRÁI thùng rồi quay mũi vào thùng. Chạy thử thì xích quay lưng lại với thùng. Chương trình chính đã khóa. Tìm và sửa lỗi trong hàm round_left.',
      veMaMau: 'Chạy thử: sau round_left(), mũi xích quay về đâu? Thùng ở phía nào?',
      san: ['######', '#..D##', '#..###', '##H###', '##.###', '##.###', '######'],
      batDau: { x: 2, y: 5, huong: 0 },
      maMau: bai(['push(2)', 'round_left()', 'push(1)'], [H('round_left', [], ['tr_left()', 'move()', 'tr_right()', 'move()', 'tr_left()'])]),
      sao: { o: 20, nhip: 12 },
      loiGiai: { chinh: ['push(2)', 'round_left()', 'push(1)'], hamCuaMan: [H('round_left', [], ['tr_left()', 'move()', 'tr_right()', 'move()', 'tr_right()'])] },
      loiGiaiKhac: { moTa: 'Viết lần quay cuối bằng lệnh gốc: đúng, nhưng dài hơn', baiLam: bai(['push(2)', 'round_left()', 'push(1)'], [H('round_left', [], nhieu(['tr_left()', 'move()', 'tr_right()', 'move()'], FOR(2, ['right_back()', 'wait()'])))]) },
      loiSai: [
        { moTa: 'Để nguyên bản của Sola: lần quay cuối sai chiều', baiLam: bai(['push(2)', 'round_left()', 'push(1)'], [H('round_left', [], ['tr_left()', 'move()', 'tr_right()', 'move()', 'tr_left()'])]), phaiCoMa: ['chua-day-thung'] },
        { moTa: 'Sửa nhầm lần quay đầu: xích đi sang phải, vào tường', baiLam: bai(['push(2)', 'round_left()', 'push(1)'], [H('round_left', [], ['tr_right()', 'move()', 'tr_right()', 'move()', 'tr_left()'])]), phaiCoMa: ['chua-day-thung'] }
      ],
      goiY: ['Đứng bên trái thùng thì muốn đẩy thùng sang phải, mũi xích phải quay sang PHẢI.',
        'Chỉ cần sửa một dòng.']
    }, true)
  ];

  ManHoc.manDayThung = DS;
  if (laNode) module.exports = ManHoc;
})();
