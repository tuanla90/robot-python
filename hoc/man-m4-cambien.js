/* ============================================================================
   man-m4-cambien.js — diem10code-python: MÙA 4 Nông trại, CỘT 3 "Hồng ngoại" (Drone + Vòi phun + Hồng ngoại: combo nhà của mùa). NHỚ KẾT QUẢ ĐO VÀO DANH SÁCH.
   warm() đo ô dưới bụng, không tốn nhịp: True khi đất còn khô. Lớp datKho: số 1..3 là đất khô cần tưới từng ấy lần, m là luống đo (nóng nhưng không cần tưới, tưới là úng).
   Lớp datRom: x là ô phủ rơm, warm() không đọc xuyên rơm nên trả False dù đất dưới rơm vẫn khô: phải đo ở luống đo rồi nhớ vào danh sách.
   8 hàng theo khuôn mới ManHoc.khuonMoi (hoc/KE-HOACH-4-MUA-COT-LOI.md).
   ========================================================================== */
(function () {
  'use strict';
  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-co-so.js') : window.ManHoc;

  var HAM_GOC = ['go_up', 'go_down', 'go_left', 'go_right', 'spray', 'warm'];
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo, than: than.slice() }; }
  function HANG(s) { var r = s.replace(/./g, '.'); return [r, s, r]; }
  function VE(n) { return [H('ve', [], ['go_down()', 'for i in range(' + n + '):', '    go_left()'])]; }
  var BD = { x: 0, y: 1, huong: 0 };
  var TUOI = ['for i in range(3):', '    while warm():', '        spray()', '    go_right()'];
  var DO4 = ['a = []', 'for i in range(4):', '    a.append(warm())', '    go_right()', 've()', 'for k in a:', '    if k:', '        spray()', '    go_right()'];

  function man(so, m) {
    m.chuong = 'm4-c3-cam-bien';
    m.loaiRobot = 'drone'; m.robot = { than: 'drone', tay: 'hoi', camBien: [{ ma: 'hong-ngoai', o: 'tren' }] };
    m.hamGoc = HAM_GOC.slice(); m.khung = Object.assign({ chinh: 10, moiHam: 10 }, m.khung);
    m.cauTruc = ['for', 'if', 'while', 'list'];
    m.vaHoac = true;
    m.bienDem = true;
    m.khaiDoiSo = true;
    m.moXuong = true;
    m.vo = 'nong-trai';
    m.mucTieu = 'cham-dat';
    m.phienBanNoiDung = 2;                     // khuôn mới: đánh số lại các màn, bản nháp cũ không dùng nữa
    ManHoc.khuonMoi(so, m);
    m.camHamCuaEm = m.moXuong === false;
    return ManHoc.chuanHoa(m);
  }

  ManHoc.them([
    man(1, { ten: 'Khô bao lâu',
      deBai: 'warm() đo ô dưới bụng drone, không tốn nhịp: đất còn khô thì True. while warm() tưới tới khi hết khô, nên không ô nào bị úng. Đọc code, đoán rồi bấm Chạy.',
      san: HANG('...'), datKho: HANG('3..'), batDau: BD,
      duDoan: { hoi: 'Ô đất cần tưới 3 lần. spray() chạy mấy lần?', luaChon: ['1 lần', '3 lần', 'Lặp mãi không dừng'], dung: 1, xacMinh: { x: 0, y: 1, lenh: { spray: 3 } } },
      sao: { o: 2, nhip: 3 },
      loiGiai: { chinh: ['while warm():', '    spray()'] } }),

    man(2, { ten: 'Đo từng ô',
      deBai: 'Hai sân, đất khô ở chỗ khác nhau. Code thiếu dòng lặp qua ba ô. Điền vào.',
      san: [HANG('....'), HANG('....')], datKho: [HANG('12..'), HANG('.31.')], batDau: [BD, BD],
      maMau: { chinh: [''].concat(TUOI.slice(1)) },
      goiY: ['Có ba ô cần đi qua, mỗi ô làm giống nhau.'],
      sao: { o: 4, nhip: 7 },
      loiGiai: { chinh: TUOI.slice() } }),

    man(3, { ten: 'Tưới chưa đủ',
      deBai: 'Code này sai đúng 1 chỗ: mỗi ô chỉ tưới một lần nên đất còn khô. Bấm Chạy xem lỗi, rồi sửa.',
      san: [HANG('....'), HANG('....')], datKho: [HANG('2.3.'), HANG('.12.')], batDau: [BD, BD],
      maMau: { chinh: TUOI.map(function (d) { return d === '    while warm():' ? '    if warm():' : d; }) },
      goiY: ['if chỉ hỏi một lần. Muốn tưới tới khi hết khô thì dùng while.'],
      sao: { o: 4, nhip: 8 },
      loiGiai: { chinh: TUOI.slice() } }),

    man(4, { ten: 'Đo một nơi, tưới một nẻo',
      deBai: 'Màn trống, em tự viết. Hai sân. Luống trên là luống đo, không tưới được. Luống dưới phủ rơm, warm() không đọc xuyên rơm, nhưng đất dưới rơm khô y như luống đo. Đo trước, nhớ vào danh sách, rồi xuống tưới. Hàm ve() đưa drone về đầu luống dưới.',
      san: [['.....', '.....'], ['.....', '.....']],
      datKho: [['m.mm.', '1.11.'], ['.mm..', '.11..']],
      datRom: [['.....', 'xxxx.'], ['.....', 'xxxx.']],
      batDau: [{ x: 0, y: 0, huong: 0 }, { x: 0, y: 0, huong: 0 }],
      canList: true,
      goiY: ['a = [] rồi a.append(warm()) ở mỗi ô: danh sách nhớ True hay False.', 'Sau ve(): for k in a:, if k: spray(), rồi go_right().'],
      sao: { o: 12, nhip: 16 },
      loiGiai: { chinh: DO4.slice(), hamCuaMan: VE(4) } }),

    man(5, { ten: 'Đi ngược cho khỏi về',
      deBai: 'Hai sân, luống trên để đo, luống dưới phủ rơm, đất khô y như luống đo. Đo xong đừng về đầu luống: bay xuống rồi đi ngược từ cuối luống, đọc danh sách từ cuối về đầu. Hàm ve() vẫn có sẵn nếu muốn về. Tìm bài vừa gọn vừa nhanh.',
      san: [['.....', '.....'], ['.....', '.....']],
      datKho: [['mm.m.', '11.1.'], ['..mm.', '..11.']],
      datRom: [['.....', 'xxxx.'], ['.....', 'xxxx.']],
      batDau: [{ x: 0, y: 0, huong: 0 }, { x: 0, y: 0, huong: 0 }],
      canList: true,
      goiY: ['Lượt thứ i đi ngược đang đứng ở ô a[3 - i]: lượt đầu là phần tử cuối, a[3].', 'Mỗi lượt: go_left() trước, rồi hỏi a[3 - i] để tưới.'],
      sao: { o: 9, nhip: 12 },
      loiGiai: { chinh: ['a = []', 'for i in range(4):', '    a.append(warm())', '    go_right()', 'go_down()', 'for i in range(4):', '    go_left()', '    if a[3 - i]:', '        spray()'], hamCuaMan: VE(4) },
      cachKhac: [{ chinh: DO4.slice() }] }),

    man(6, { ten: 'Hàm tưới luống',
      deBai: 'Hai luống dài ngắn khác nhau. Tự viết hàm tên tùy em nhận độ dài luống, ví dụ tuoi(n): đo và tưới n ô, về đầu luống, xuống luống sau. Danh sách a giữ độ dài các luống. Khi đặt tên hàm, thêm một đối số.',
      san: ['....', '....', '....'], datKho: ['213.', '12..', '....'], batDau: { x: 0, y: 0, huong: 0 },
      canThamSo: true, canList: true,
      goiY: ['Trong hàm: for i in range(n):, while warm(): spray(), rồi go_right(). Xong thì lùi n ô và go_down().', 'Chương trình chính: a = [3, 2], for n in a:, tuoi(n).'],
      sao: { o: 10, nhip: 21 },
      loiGiai: {
        chinh: ['a = [3, 2]', 'for n in a:', '    tuoi(n)'],
        hamCuaEmMoi: [H('tuoi', ['n'], ['for i in range(n):', '    while warm():', '        spray()', '    go_right()', 'for i in range(n):', '    go_left()', 'go_down()'])]
      } }),

    man(7, { ten: 'Một hàm hay đi ngoằn ngoèo',
      deBai: 'Ba luống cùng dài. Một hàm tưới luống rồi về đầu luống, gọi ba lần: gọn. Hay đi ngoằn ngoèo, hết luống thì xuống và quay đầu đi ngược: nhanh. Hàm nào cũng được, tên tùy em. Một sao cho bài gọn, một sao cho bài nhanh.',
      san: ['.....', '.....', '.....', '.....'], datKho: ['21.1.', '.12..', '1..2.', '.....'], batDau: { x: 0, y: 0, huong: 0 },
      goiY: ['Về đầu luống là 4 ô bay không tưới gì, mỗi ô một nhịp.', 'Đi ngược thì bay trước rồi mới đo, vì lúc xuống drone đang ở ngoài luống.'],
      sao: { o: 9, nhip: 24 },
      doiCho: true,
      loiGiai: {
        chinh: ['for i in range(3):', '    tuoi()'],
        hamCuaEmMoi: [H('tuoi', [], ['for i in range(4):', '    while warm():', '        spray()', '    go_right()', 'for i in range(4):', '    go_left()', 'go_down()'])]
      },
      cachKhac: [{
        chinh: ['di_phai()', 'go_down()', 'di_trai()', 'go_down()', 'di_phai()'],
        hamCuaEmMoi: [
          H('di_phai', [], ['for i in range(4):', '    while warm():', '        spray()', '    go_right()']),
          H('di_trai', [], ['for i in range(4):', '    go_left()', '    while warm():', '        spray()'])
        ]
      }] }),

    man(8, { ten: 'Nhớ cả luống dài',
      deBai: 'Ba sân. Luống trên để đo, luống dưới phủ rơm, đất khô y như luống đo. Tưới đúng những ô còn khô của luống dưới.',
      san: [['......', '......'], ['......', '......'], ['......', '......']],
      datKho: [['m.m.m.', '1.1.1.'], ['.mm...', '.11...'], ['mm..m.', '11..1.']],
      datRom: [['......', 'xxxxx.'], ['......', 'xxxxx.'], ['......', 'xxxxx.']],
      batDau: [{ x: 0, y: 0, huong: 0 }, { x: 0, y: 0, huong: 0 }, { x: 0, y: 0, huong: 0 }],
      canList: true,
      sao: { o: 12, nhip: 19 },
      loiGiai: {
        chinh: ['a = []', 'for i in range(5):', '    a.append(warm())', '    go_right()', 've()', 'for k in a:', '    if k:', '        spray()', '    go_right()'],
        hamCuaEmMoi: VE(5)
      },
      huyHieu: { ma: 'm4-c3-cam-bien', ten: 'Mắt đo đất' } })
  ]);

  if (laNode) module.exports = ManHoc;
})();
