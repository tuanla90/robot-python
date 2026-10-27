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
    })
  ];

  ManHoc.manHongNgoai = DS;
  if (laNode) module.exports = ManHoc;
})();
