/* ============================================================================
   man-m4-tay.js — diem10code-python: MÙA 4 Nông trại, CỘT 2 "Vòi phun" (Drone + Vòi phun + Camera). DUYỆT DANH SÁCH, a[i], len(a), a.append(x).
   Vòi phun làm ở Ô DƯỚI BỤNG: spray() tưới ô đất khô (lớp datKho, số lần tưới cần), seed(c) gieo hạt màu c vào ô cần gieo (lớp hinh). Mỗi lệnh tự chạy 1 nhịp, drone đứng yên trong nhịp đó.
   Tưới đất không khô thì úng, gieo ngoài luống thì hỏng, đều dừng ngay. Camera đọc màu đất dưới bụng (lớp mau).
   8 hàng theo khuôn ManHoc.khuon (hoc/KE-HOACH-4-MUA-COT-LOI.md).
   ========================================================================== */
(function () {
  'use strict';
  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-co-so.js') : window.ManHoc;

  var HAM_GOC = ['go_up', 'go_down', 'go_left', 'go_right', 'spray', 'seed', 'color'];
  function H(ten, thamSo, than) { return { ten: ten, thamSo: thamSo, than: than.slice() }; }
  function HANG(s) { var r = s.replace(/./g, '.'); return [r, s, r]; }
  var BD = { x: 0, y: 1, huong: 0 }, SAN4 = HANG('....');
  function GIEO(a) { return ['a = [' + a + ']', 'for c in a:', '    seed(c)', '    go_right()']; }
  var CHEP = ['a = []', 'for i in range(3):', '    a.append(color())', '    go_right()', 'go_down()', 'for i in range(3):', '    go_left()', 'for c in a:', '    seed(c)', '    go_right()'];

  function man(so, m) {
    m.chuong = 'm4-c2-tay';
    m.loaiRobot = 'drone'; m.robot = { than: 'drone', tay: 'hoi', camBien: [{ ma: 'camera', o: 'tren' }] };
    m.hamGoc = HAM_GOC.slice(); m.khung = Object.assign({ chinh: 10, moiHam: 10 }, m.khung);
    m.cauTruc = ['for', 'if', 'while', 'list'];
    m.vaHoac = true;
    m.bienDem = true;
    m.khaiDoiSo = true;
    m.moXuong = true;
    m.vo = 'nong-trai';
    m.mucTieu = 'cham-dat';
    m.phienBanNoiDung = 1;                     // wait() không còn chốt lệnh: bản nháp cũ không dùng nữa
    ManHoc.khuon(so, m);
    m.camHamCuaEm = m.moXuong === false;
    return ManHoc.chuanHoa(m);
  }

  ManHoc.them([
    man(1, { ten: 'Gieo theo danh sách',
      deBai: 'Bấm Chạy và xem. Danh sách cũng đựng được chữ. for c in a lấy lần lượt từng màu, seed(c) gieo hạt màu đó xuống ô dưới bụng drone. Ô cần gieo hiện bông hoa mờ.',
      san: SAN4, hinh: HANG('rby.'), batDau: BD,
      sao: { o: 4, nhip: 5 },
      loiGiai: { chinh: GIEO('"red", "blue", "yellow"') } }),

    man(2, { ten: 'Tưới mấy lần',
      deBai: 'Số chấm trên ô đất khô là số lần còn phải tưới. spray() tưới ô dưới bụng. Tưới ô không khô thì úng. Đọc code, đoán rồi bấm Chạy.',
      san: SAN4, datKho: HANG('121.'), batDau: BD,
      duDoan: { hoi: 'Cả chương trình gọi spray() mấy lần?', luaChon: ['3 lần', '4 lần', '5 lần'], dung: 1, xacMinh: { x: 2, y: 1, lenh: { spray: 4 } } },
      sao: { o: 5, nhip: 6 },
      loiGiai: { chinh: ['a = [1, 2, 1]', 'for n in a:', '    for i in range(n):', '        spray()', '    go_right()'] } }),

    man(3, { ten: 'Ô thứ mấy',
      deBai: 'a[i] là phần tử ở vị trí i, đếm từ 0. len(a) là số phần tử. Code dùng a mà chưa tạo. Điền dòng tạo danh sách đúng màu các ô, từ trái sang phải.',
      san: SAN4, hinh: HANG('rbr.'), batDau: BD,
      maMau: { chinh: ['', 'for i in range(len(a)):', '    seed(a[i])', '    go_right()'] },
      goiY: ['Ba ô là đỏ, xanh dương, đỏ: a = ["red", "blue", "red"].'],
      sao: { o: 4, nhip: 5 },
      loiGiai: { chinh: ['a = ["red", "blue", "red"]', 'for i in range(len(a)):', '    seed(a[i])', '    go_right()'] } }),

    man(4, { ten: 'Gieo rồi mới bay',
      deBai: 'Đủ dòng nhưng sai thứ tự: drone bay trước khi gieo nên hạt rơi lệch một ô. Giữ một dòng rồi kéo sang chỗ đúng.',
      san: SAN4, hinh: HANG('bry.'), batDau: BD,
      maMau: { chinh: ['a = ["blue", "red", "yellow"]', 'for c in a:', '    go_right()', '    seed(c)'] },
      goiY: ['seed(c) làm việc ở ô đang đứng, nên phải gọi trước go_right().'],
      sao: { o: 4, nhip: 5 },
      loiGiai: { chinh: GIEO('"blue", "red", "yellow"') } }),

    man(5, { ten: 'Sai thứ tự màu',
      deBai: 'Code này sai đúng 1 chỗ: hai màu trong danh sách đổi chỗ cho nhau. Bấm Chạy xem lỗi, rồi sửa.',
      san: SAN4, mau: HANG('rby.'), hinh: HANG('rby.'), batDau: BD,
      maMau: { chinh: GIEO('"red", "yellow", "blue"') },
      goiY: ['Danh sách giữ đúng thứ tự: phần tử đầu tiên là ô bên trái nhất.'],
      sao: { o: 4, nhip: 5 },
      loiGiai: { chinh: GIEO('"red", "blue", "yellow"') } }),

    man(6, { ten: 'Chép luống mẫu',
      deBai: 'Màn trống, em tự viết. Hai sân. Luống trên là đất màu làm mẫu, không cần gieo. Luống dưới chưa có màu nên camera đọc ra "none", phải gieo y như mẫu. Đọc trước, nhớ vào danh sách, rồi xuống gieo.',
      san: [['....', '....'], ['....', '....']],
      mau: [['rby.', '....'], ['ybb.', '....']],
      hinh: [['....', 'rby.'], ['....', 'ybb.']],
      batDau: [{ x: 0, y: 0, huong: 0 }, { x: 0, y: 0, huong: 0 }],
      canList: true,
      goiY: ['Tạo danh sách rỗng a = [] rồi a.append(color()) ở mỗi ô của luống trên.', 'Bay xuống, về đầu luống, rồi for c in a: seed(c), go_right().'],
      sao: { o: 10, nhip: 12 },
      loiGiai: { chinh: CHEP.slice() } }),

    man(7, { ten: 'Hàm gieo luống',
      deBai: 'Hai luống. Tự viết hàm tên tùy em nhận danh sách màu, ví dụ gieo(a): gieo từng màu, mỗi màu một ô từ trái sang phải. Khi đặt tên hàm, thêm một đối số.',
      san: ['...', '...'], hinh: ['rb.', 'yr.'], batDau: { x: 0, y: 0, huong: 0 },
      canThamSo: true,
      goiY: ['Trong hàm: for c in a:, seed(c), go_right().', 'Chương trình chính: gieo(["red", "blue"]), bay xuống, về đầu luống, gieo(["yellow", "red"]).'],
      sao: { o: 8, nhip: 10 },
      loiGiai: {
        chinh: ['gieo(["red", "blue"])', 'go_down()', 'go_left()', 'go_left()', 'gieo(["yellow", "red"])'],
        hamCuaEmMoi: [H('gieo', ['a'], ['for c in a:', '    seed(c)', '    go_right()'])]
      } }),

    man(8, { ten: 'Luống dài ngắn',
      deBai: 'Ba sân, luống mẫu dài ngắn khác nhau. Chép luống mẫu xuống luống dưới.',
      san: [['.....', '.....'], ['.....', '.....'], ['.....', '.....']],
      mau: [['rb...', '.....'], ['ybr..', '.....'], ['bbyr.', '.....']],
      hinh: [['.....', 'rb...'], ['.....', 'ybr..'], ['.....', 'bbyr.']],
      batDau: [{ x: 0, y: 0, huong: 0 }, { x: 0, y: 0, huong: 0 }, { x: 0, y: 0, huong: 0 }],
      canList: true,
      sao: { o: 10, nhip: 16 },
      loiGiai: { chinh: ['a = []', 'while color() != "none":', '    a.append(color())', '    go_right()', 'go_down()', 'for i in range(len(a)):', '    go_left()', 'for c in a:', '    seed(c)', '    go_right()'] },
      huyHieu: { ma: 'gieo-hat', ten: 'Tay gieo hạt' } })
  ]);

  if (laNode) module.exports = ManHoc;
})();
