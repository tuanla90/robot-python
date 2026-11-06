/* ============================================================================
   man-m4-san.js — diem10code-python: MÙA 4 Nông trại, CỘT 4 "Sân nông trại" (Drone + Vòi phun + Hồng ngoại + Camera ôn lại). PHỐI HỢP DANH SÁCH, HÀM VÀ HAI CẢM BIẾN.
   Đất khô (datKho) đo bằng warm() rồi tưới bằng spray(); đất màu (mau, hinh) đọc bằng color() rồi gieo bằng seed(c). Hàng 8 là trùm của cả 4 mùa cốt lõi.
   8 hàng theo khuôn mới ManHoc.khuonMoi (hoc/KE-HOACH-4-MUA-COT-LOI.md).
   ========================================================================== */
(function () {
  'use strict';
  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-co-so.js') : window.ManHoc;

  var HAM_GOC = ['go_up', 'go_down', 'go_left', 'go_right', 'spray', 'seed', 'warm', 'color'];
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo, than: than.slice() }; }
  function HANG(s) { var r = s.replace(/./g, '.'); return [r, s, r]; }
  function LAM_O() { return [H('lam_o', [], ['while warm():', '    spray()', 'c = color()', 'if c != "none":', '    seed(c)'])]; }
  var BD = { x: 0, y: 1, huong: 0 };
  var CHAM = ['for i in range(4):', '    while warm():', '        spray()', '    c = color()', '    if c != "none":', '        seed(c)', '    go_right()'];
  var BA_LUONG = ['a = [4, 3]', 'for n in a:', '    for i in range(n):', '        lam_o()', '        go_right()', '    for i in range(n):', '        go_left()', '    go_down()'];

  function man(so, m) {
    m.chuong = 'm4-c4-san';
    m.loaiRobot = 'drone'; m.robot = { than: 'drone', tay: 'hoi', camBien: [{ ma: 'hong-ngoai', o: 'tren' }, { ma: 'camera', o: 'tren' }] };
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
    man(1, { ten: 'Vừa khô vừa màu',
      deBai: 'Mỗi ô: đất khô thì tưới tới khi hết khô, đất có màu thì gieo hạt đúng màu đó. Hai cảm biến cùng làm việc. Ô đầu vừa khô vừa có màu. Đọc code, đoán rồi bấm Chạy.',
      san: HANG('.....'), datKho: HANG('2....'), mau: HANG('y.b..'), hinh: HANG('y.b..'), batDau: BD,
      duDoan: { hoi: 'Ở ô đầu, drone làm gì trước?', luaChon: ['Gieo hạt rồi mới tưới', 'Tưới hết khô rồi mới gieo', 'Chỉ gieo, không tưới'], dung: 1, xacMinh: { lenh: { spray: 2, seed: 2 } } },
      sao: { o: 7, nhip: 6 },
      loiGiai: { chinh: CHAM.slice() } }),

    man(2, { ten: 'Lặp qua cả luống',
      deBai: 'Hai sân. Code thiếu dòng lặp qua bốn ô. Điền vào.',
      san: [HANG('.....'), HANG('.....')], datKho: [HANG('.2.1.'), HANG('1..2.')], mau: [HANG('r..y.'), HANG('.b.g.')], hinh: [HANG('r..y.'), HANG('.b.g.')], batDau: [BD, BD],
      maMau: { chinh: [''].concat(CHAM.slice(1)) },
      goiY: ['Có bốn ô cần đi qua, mỗi ô làm giống nhau.'],
      sao: { o: 7, nhip: 8 },
      loiGiai: { chinh: CHAM.slice() } }),

    man(3, { ten: 'Gieo nhầm chỗ',
      deBai: 'Code này sai đúng 1 chỗ: điều kiện gieo bị ngược. Bấm Chạy xem lỗi, rồi sửa.',
      san: [HANG('.....'), HANG('.....')], datKho: [HANG('.1...'), HANG('..2..')], mau: [HANG('r.y..'), HANG('.b...')], hinh: [HANG('r.y..'), HANG('.b...')], batDau: [BD, BD],
      maMau: { chinh: CHAM.map(function (d) { return d === '    if c != "none":' ? '    if c == "none":' : d; }) },
      goiY: ['Đất không màu đọc ra "none", không gieo. Chỉ gieo khi c khác "none".'],
      sao: { o: 7, nhip: 5 },
      loiGiai: { chinh: CHAM.slice() } }),

    man(4, { ten: 'Hai luống dài ngắn',
      deBai: 'Màn trống, em tự viết. Danh sách a giữ độ dài từng luống: a = [4, 3]. Mỗi luống bay qua từng ô rồi về đầu luống, xuống luống sau. Hàm lam_o() có sẵn: tưới hết khô rồi gieo đúng màu ở ô đang đứng.',
      san: ['.....', '.....', '.....'], datKho: ['1.2..', '.1...', '.....'], mau: ['.r.b.', 'y....', '.....'], hinh: ['.r.b.', 'y....', '.....'], batDau: { x: 0, y: 0, huong: 0 },
      canList: true,
      goiY: ['for n in a:, bên trong for i in range(n): lam_o(), go_right().', 'Hết luống: lùi n ô bằng go_left(), rồi go_down().'],
      sao: { o: 13, nhip: 17 },
      loiGiai: { chinh: BA_LUONG.slice(), hamCuaMan: LAM_O() } }),

    man(5, { ten: 'Quét hết hay đi theo bậc',
      deBai: 'Ba ô cần chăm nằm theo bậc thang trên ba luống. Quét hết từng luống thì không sót, nhưng bay rất nhiều. Danh sách giữ được số ô phải bay ở mỗi bậc. Hàm lam_o() có sẵn. Tìm bài vừa gọn vừa nhanh.',
      san: ['......', '......', '......'], datKho: ['.1....', '......', '....2.'], mau: ['.r....', '...b..', '......'], hinh: ['.r....', '...b..', '......'], batDau: { x: 0, y: 0, huong: 0 },
      goiY: ['Danh sách a = [1, 2, 1]: bậc đầu bay 1 ô, bậc sau 2 ô, bậc cuối 1 ô.', 'Mỗi bậc: bay sang phải n ô, lam_o(), rồi xuống một ô.'],
      sao: { o: 11, nhip: 11 },
      loiGiai: { chinh: ['a = [1, 2, 1]', 'for n in a:', '    for i in range(n):', '        go_right()', '    lam_o()', '    go_down()'], hamCuaMan: LAM_O() },
      cachKhac: [{ chinh: ['for k in range(3):', '    for i in range(5):', '        lam_o()', '        go_right()', '    for i in range(5):', '        go_left()', '    go_down()'] }] }),

    man(6, { ten: 'Hàm chăm luống',
      deBai: 'Ba luống dài ngắn. Tự viết hàm tên tùy em nhận độ dài luống, ví dụ luong(n): chăm n ô, về đầu luống, xuống luống sau. Khi đặt tên hàm, thêm một đối số. Hàm lam_o() có sẵn.',
      san: ['.....', '.....', '.....', '.....'], datKho: ['1....', '..2..', '.1.1.', '.....'], mau: ['.r...', 'b....', '...y.', '.....'], hinh: ['.r...', 'b....', '...y.', '.....'], batDau: { x: 0, y: 0, huong: 0 },
      canThamSo: true, canList: true,
      goiY: ['Trong hàm: for i in range(n): lam_o(), go_right(). Rồi lùi n ô, go_down().', 'Chương trình chính: a = [3, 4, 4], for n in a:, luong(n).'],
      sao: { o: 14, nhip: 27 },
      loiGiai: {
        chinh: ['a = [3, 4, 4]', 'for n in a:', '    luong(n)'],
        hamCuaMan: LAM_O(),
        hamCuaEmMoi: [H('luong', ['n'], ['for i in range(n):', '    lam_o()', '    go_right()', 'for i in range(n):', '    go_left()', 'go_down()'])]
      } }),

    man(7, { ten: 'Về đầu luống hay ngoằn ngoèo',
      deBai: 'Ba luống cùng dài. Một hàm chăm luống rồi về đầu luống: gọn. Hay đi ngoằn ngoèo, hết luống thì xuống và đi ngược: nhanh. Hàm lam_o() có sẵn, hàm khác tên tùy em. Một sao cho bài gọn, một sao cho bài nhanh.',
      san: ['.....', '.....', '.....'], datKho: ['1.2..', '.1...', '.1.1.'], mau: ['.r...', 'y..b.', '..b..'], hinh: ['.r...', 'y..b.', '..b..'], batDau: { x: 0, y: 0, huong: 0 },
      goiY: ['Về đầu luống là 4 ô bay không làm gì, mỗi ô một nhịp.', 'Đi ngược thì bay trước rồi mới lam_o(), vì lúc xuống drone đang ở ngoài luống.'],
      sao: { o: 13, nhip: 23 },
      doiCho: true,
      loiGiai: {
        chinh: ['for i in range(3):', '    luong()'],
        hamCuaMan: LAM_O(),
        hamCuaEmMoi: [H('luong', [], ['for i in range(4):', '    lam_o()', '    go_right()', 'for i in range(4):', '    go_left()', 'go_down()'])]
      },
      cachKhac: [{
        chinh: ['di_phai()', 'go_down()', 'di_trai()', 'go_down()', 'di_phai()'],
        hamCuaEmMoi: [
          H('di_phai', [], ['for i in range(4):', '    lam_o()', '    go_right()']),
          H('di_trai', [], ['for i in range(4):', '    go_left()', '    lam_o()'])
        ]
      }] }),

    man(8, { ten: 'Chủ nông trại',
      deBai: 'Ba sân. Luống trên là đất màu làm mẫu, dài ngắn khác nhau. Luống dưới phải gieo y như mẫu, và có ô còn khô thì tưới trước khi gieo.',
      san: [['.....', '.....'], ['.....', '.....'], ['.....', '.....']],
      mau: [['rb...', '.....'], ['ybr..', '.....'], ['bbyr.', '.....']],
      hinh: [['.....', 'rb...'], ['.....', 'ybr..'], ['.....', 'bbyr.']],
      datKho: [['.....', '2....'], ['.....', '.12..'], ['.....', '1.2..']],
      batDau: [{ x: 0, y: 0, huong: 0 }, { x: 0, y: 0, huong: 0 }, { x: 0, y: 0, huong: 0 }],
      canList: true,
      sao: { o: 14, nhip: 19 },
      loiGiai: {
        chinh: ['a = []', 'while color() != "none":', '    a.append(color())', '    go_right()', 've(len(a))', 'for c in a:', '    lam(c)', '    go_right()'],
        hamCuaEmMoi: [H('ve', ['n'], ['go_down()', 'for i in range(n):', '    go_left()']), H('lam', ['c'], ['while warm():', '    spray()', 'seed(c)'])]
      },
      huyHieu: { ma: 'chu-nong-trai', ten: 'Chủ nông trại' } })
  ]);

  if (laNode) module.exports = ManHoc;
})();
