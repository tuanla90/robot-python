/* ============================================================================
   man-m4-tay.js — diem10code-python: MÙA 4 Nông trại, CỘT 2 "Vòi phun" (Drone + Vòi phun + Camera). DUYỆT DANH SÁCH, a[i], len(a), a.append(x).
   Vòi phun làm ở Ô DƯỚI BỤNG: spray() tưới ô đất khô (lớp datKho, số lần tưới cần), seed(c) gieo hạt màu c vào ô cần gieo (lớp hinh). Mỗi lệnh tự chạy 1 nhịp, drone đứng yên trong nhịp đó.
   Tưới đất không khô thì úng, gieo ngoài luống thì hỏng, đều dừng ngay. Camera đọc màu đất dưới bụng (lớp mau).
   8 hàng theo khuôn mới ManHoc.khuonMoi (hoc/KE-HOACH-4-MUA-COT-LOI.md).
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
    m.phienBanNoiDung = 2;                     // khuôn mới: đánh số lại các màn, bản nháp cũ không dùng nữa
    ManHoc.khuonMoi(so, m);
    m.camHamCuaEm = m.moXuong === false;
    return ManHoc.chuanHoa(m);
  }

  ManHoc.them([
    man(1, { ten: 'Gieo theo danh sách',
      deBai: 'Danh sách cũng đựng được chữ. for c in a lấy lần lượt từng màu, seed(c) gieo hạt màu đó xuống ô dưới bụng drone. Ô cần gieo hiện bông hoa mờ. Đọc code, đoán rồi bấm Chạy.',
      san: SAN4, hinh: HANG('rby.'), batDau: BD,
      duDoan: { hoi: 'Vòng lặp lần thứ hai, c là màu gì?', luaChon: ['red', 'blue', 'yellow'], dung: 1, xacMinh: { lenh: { seed: 3 } } },
      sao: { o: 4, nhip: 5 },
      loiGiai: { chinh: GIEO('"red", "blue", "yellow"') } }),

    man(2, { ten: 'Ô thứ mấy',
      deBai: 'a[i] là phần tử ở vị trí i, đếm từ 0. len(a) là số phần tử. Code dùng a mà chưa tạo. Điền dòng tạo danh sách đúng màu các ô, từ trái sang phải.',
      san: SAN4, hinh: HANG('rbr.'), batDau: BD,
      maMau: { chinh: ['', 'for i in range(len(a)):', '    seed(a[i])', '    go_right()'] },
      goiY: ['Ba ô là đỏ, xanh dương, đỏ: a = ["red", "blue", "red"].'],
      sao: { o: 4, nhip: 5 },
      loiGiai: { chinh: ['a = ["red", "blue", "red"]', 'for i in range(len(a)):', '    seed(a[i])', '    go_right()'] } }),

    man(3, { ten: 'Sai thứ tự màu',
      deBai: 'Code này sai đúng 1 chỗ: hai màu trong danh sách đổi chỗ cho nhau. Bấm Chạy xem lỗi, rồi sửa.',
      san: SAN4, mau: HANG('rby.'), hinh: HANG('rby.'), batDau: BD,
      maMau: { chinh: GIEO('"red", "yellow", "blue"') },
      goiY: ['Danh sách giữ đúng thứ tự: phần tử đầu tiên là ô bên trái nhất.'],
      sao: { o: 4, nhip: 5 },
      loiGiai: { chinh: GIEO('"red", "blue", "yellow"') } }),

    man(4, { ten: 'Chép luống mẫu',
      deBai: 'Màn trống, em tự viết. Hai sân. Luống trên là đất màu làm mẫu, không cần gieo. Luống dưới chưa có màu nên camera đọc ra "none", phải gieo y như mẫu. Đọc trước, nhớ vào danh sách, rồi xuống gieo.',
      san: [['....', '....'], ['....', '....']],
      mau: [['rby.', '....'], ['ybb.', '....']],
      hinh: [['....', 'rby.'], ['....', 'ybb.']],
      batDau: [{ x: 0, y: 0, huong: 0 }, { x: 0, y: 0, huong: 0 }],
      canList: true,
      goiY: ['Tạo danh sách rỗng a = [] rồi a.append(color()) ở mỗi ô của luống trên.', 'Bay xuống, về đầu luống, rồi for c in a: seed(c), go_right().'],
      sao: { o: 10, nhip: 12 },
      loiGiai: { chinh: CHEP.slice() } }),

    man(5, { ten: 'Một lượt hay hai lượt',
      deBai: 'Ba ô vừa khô vừa cần gieo. Số chấm trên ô đất khô là số lần còn phải tưới, spray() tưới ô dưới bụng, tưới ô không khô thì úng. Bay hai lượt, hay làm hết trong một lượt? Tìm bài vừa gọn vừa nhanh.',
      san: SAN4, datKho: HANG('111.'), hinh: HANG('rby.'), batDau: BD,
      goiY: ['Mỗi lệnh tưới, gieo mất 1 nhịp, mỗi ô bay cũng mất 1 nhịp.', 'Bay lại từ đầu là mất thêm nhịp. Trong một vòng lặp có thể làm hai việc.'],
      sao: { o: 5, nhip: 8 },
      loiGiai: { chinh: ['a = ["red", "blue", "yellow"]', 'for c in a:', '    spray()', '    seed(c)', '    go_right()'] },
      cachKhac: [{ chinh: ['for i in range(3):', '    spray()', '    go_right()', 'for i in range(3):', '    go_left()', 'a = ["red", "blue", "yellow"]', 'for c in a:', '    seed(c)', '    go_right()'] }] }),

    man(6, { ten: 'Hàm gieo luống',
      deBai: 'Hai luống. Tự viết hàm tên tùy em nhận danh sách màu, ví dụ gieo(a): gieo từng màu, mỗi màu một ô từ trái sang phải. Khi đặt tên hàm, thêm một đối số.',
      san: ['...', '...'], hinh: ['rb.', 'yr.'], batDau: { x: 0, y: 0, huong: 0 },
      canThamSo: true,
      goiY: ['Trong hàm: for c in a:, seed(c), go_right().', 'Chương trình chính: gieo(["red", "blue"]), bay xuống, về đầu luống, gieo(["yellow", "red"]).'],
      sao: { o: 8, nhip: 10 },
      loiGiai: {
        chinh: ['gieo(["red", "blue"])', 'go_down()', 'go_left()', 'go_left()', 'gieo(["yellow", "red"])'],
        hamCuaEmMoi: [H('gieo', ['a'], ['for c in a:', '    seed(c)', '    go_right()'])]
      } }),

    man(7, { ten: 'Về đầu luống hay đi ngược',
      deBai: 'Hai luống. Gieo hết luống trên rồi về đầu luống, dùng lại một hàm. Hay bay xuống rồi gieo ngược từ cuối luống dưới, khỏi phải về. Hàm nào cũng được, tên tùy em. Tìm bài vừa gọn vừa nhanh.',
      san: ['.....', '.....'], hinh: ['rbyr.', 'ybbr.'], batDau: { x: 0, y: 0, huong: 0 },
      goiY: ['Đi ngược thì danh sách cũng phải viết ngược, từ ô cuối về ô đầu.', 'Đi ngược: bay trước rồi mới gieo, vì lúc xuống drone đang ở ngoài luống.', 'Danh sách viết thẳng trong for cũng được: for c in ["red", "blue"]:.'],
      sao: { o: 7, nhip: 17 },
      loiGiai: { chinh: ['for c in ["red", "blue", "yellow", "red"]:', '    seed(c)', '    go_right()', 'go_down()', 'for c in ["red", "blue", "blue", "yellow"]:', '    go_left()', '    seed(c)'] },
      cachKhac: [{
        chinh: ['gieo(["red", "blue", "yellow", "red"])', 'go_down()', 'for i in range(4):', '    go_left()', 'gieo(["yellow", "blue", "blue", "red"])'],
        hamCuaEmMoi: [H('gieo', ['a'], ['for c in a:', '    seed(c)', '    go_right()'])]
      }] }),

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
