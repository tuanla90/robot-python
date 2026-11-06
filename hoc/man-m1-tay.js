/* ============================================================================
   man-m1-tay.js — diem10code-python: MÙA 1 Kho hàng, CỘT 2 "+Tay" (hai bánh + tay kẹp, chưa cảm biến).
   Tay kẹp có hai lệnh gốc: pick() nhặt, drop() đặt, mỗi lệnh tự chạy đủ 2 nhịp. Làm ở Ô PHÍA TRƯỚC MŨI: xe đứng CẠNH vật / đích, quay mặt vào nó.
   Cột này giới thiệu for: hàng 1 xem và đoán, hàng 2 thấy lại, hàng 4 tự viết.
   8 hàng theo khuôn mới ManHoc.khuonMoi (hoc/KE-HOACH-4-MUA-COT-LOI.md).
   ========================================================================== */
(function () {
  'use strict';
  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-co-so.js') : window.ManHoc;

  var HAM_GOC = ['forward', 'backward', 'turn_left', 'turn_right', 'pick', 'drop'];
  function H(ten, than) { return { ten: ten, thamSo: [], than: than.slice() }; }
  function FOR(n, than) { return ['for i in range(' + n + '):'].concat(than.map(function (s) { return '    ' + s; })); }

  function man(so, m) {
    m.chuong = 'm1-c2-tay';
    m.loaiRobot = 'banh'; m.robot = { than: 'hai-banh', tay: 'kep' };
    m.hamGoc = HAM_GOC.slice(); m.khung = Object.assign({ chinh: 10, moiHam: 10 }, m.khung);
    m.cauTruc = ['for'];
    m.mucTieu = 'dua-vat';
    m.moXuong = true;
    m.phienBanNoiDung = 4;                     // khuôn mới: đánh số lại các màn, bản nháp cũ không dùng nữa
    ManHoc.khuonMoi(so, m);
    m.camHamCuaEm = m.moXuong === false;
    return ManHoc.chuanHoa(m);
  }

  var CHUYEN = ['pick()', 'forward()', 'forward()', 'drop()', 'backward()', 'backward()', 'turn_right()', 'forward()', 'forward()', 'turn_left()'];
  var MANG = ['pick()', 'forward()', 'drop()', 'backward()'];

  ManHoc.them([
    man(1, { ten: 'Vòng for chạy mấy lần',
      deBai: 'Hai lệnh tay mới: pick() nhặt thùng, drop() đặt thùng xuống ô trước mũi xe, mỗi lệnh hết 2 nhịp. Khối for mới lặp lại các dòng thụt vào bên trong, dòng không thụt vào thì không nằm trong for. Đọc code, đoán rồi bấm Chạy.',
      san: ['.......', '..o....', '......D'],
      batDau: { x: 2, y: 2, huong: 0 },
      duDoan: { hoi: 'Chạy xong, forward() đã chạy tổng cộng mấy lần?', luaChon: ['2 lần', '3 lần', '4 lần'], dung: 1, xacMinh: { lenh: { forward: 3 }, vat: [{ x: 6, y: 2 }] } },
      sao: { o: 6, nhip: 9 },
      loiGiai: { chinh: ['pick()', 'turn_right()'].concat(FOR(2, ['forward()']), ['forward()', 'drop()']) } }),

    man(2, { ten: 'Điền lệnh tay',
      deBai: 'Chương trình thiếu 2 lệnh. Chạm ô trống rồi chọn lệnh để điền: một lệnh nhặt thùng, một lệnh đặt thùng.',
      san: ['.....', '.D...', '.....', '..o..', '.....'],
      batDau: { x: 2, y: 4, huong: 0 },
      maMau: { chinh: [''].concat(FOR(3, ['forward()']), ['turn_left()', '']) },
      goiY: ['Thùng đang ở ngay trước mũi xe. Phải cầm thùng rồi mới đi.', 'Quay mặt vào ô đích rồi thì đặt thùng xuống.'],
      sao: { o: 5, nhip: 9 },
      loiGiai: { chinh: ['pick()'].concat(FOR(3, ['forward()']), ['turn_left()', 'drop()']) } }),

    man(3, { ten: 'Mang nhầm hướng',
      deBai: 'Code này sai đúng 1 chỗ nên thùng không tới được ô đích. Bấm Chạy xem xe đi đâu, rồi sửa dòng sai.',
      san: ['.....', '.....', '.o.D.', '.....'],
      batDau: { x: 1, y: 3, huong: 0 },
      maMau: { chinh: ['pick()', 'forward()', 'turn_left()', 'forward()', 'drop()'] },
      goiY: ['Ô đích nằm bên nào của xe sau khi xe tiến lên?'],
      sao: { o: 5, nhip: 8 },
      loiGiai: { chinh: ['pick()', 'forward()', 'turn_right()', 'forward()', 'drop()'] } }),

    man(4, { ten: 'Thùng nằm bên phải',
      deBai: 'Màn trống, em tự viết: mang thùng tới ô đích D.',
      san: ['...D.', '.....', '.....', '.....', '..o..'],
      batDau: { x: 1, y: 4, huong: 0 },
      goiY: ['Tay chỉ làm ở ô trước mũi xe, nên phải quay mặt vào thùng trước khi pick().', 'Đi thẳng nhiều ô thì dùng for cho ngắn: for i in range(n). Chạm con số trong range(...) là đổi được số.', 'Tới cạnh ô đích, quay mặt vào nó rồi mới drop().'],
      sao: { o: 8, nhip: 15 },
      loiGiai: { chinh: ['turn_right()', 'pick()', 'turn_left()'].concat(FOR(4, ['forward()']), ['turn_right()', 'forward()', 'drop()']) } }),

    man(5, { ten: 'Bậc thang hay đường thẳng',
      deBai: 'Mang thùng tới ô đích, đường nào cũng được. Một sao cho bài gọn, một sao cho bài nhanh, có thể lấy bằng hai bài khác nhau.',
      san: ['......', '...D..', '......', '......', 'o.....', '......'],
      batDau: { x: 0, y: 5, huong: 0 },
      goiY: ['Đặt các bước lặp lại vào một vòng for thì bài rất gọn, nhưng xe có thể đi chậm hơn.', 'Muốn nhanh thì rẽ ít lần thôi.'],
      sao: { o: 7, nhip: 14 },
      doiCho: true,
      loiGiai: { chinh: ['pick()'].concat(FOR(3, ['turn_right()', 'forward()', 'turn_left()', 'forward()']), ['drop()']) },
      cachKhac: [
        { chinh: ['pick()'].concat(FOR(3, ['forward()']), ['turn_right()'], FOR(3, ['forward()']), ['turn_left()', 'drop()']) },
        { chinh: ['pick()', 'turn_right()'].concat(FOR(3, ['forward()']), ['turn_left()'], FOR(3, ['forward()']), ['drop()']) }
      ] }),

    man(6, { ten: 'Hai thùng: tự viết hàm',
      deBai: 'Hai thùng, việc mang mỗi thùng giống hệt nhau mà chương trình chính chỉ có 3 ô. Tự tạo một hàm ở Xưởng hàm cho một lượt, đặt tên tùy em.',
      san: ['.D.D..', '......', '.o.o..', '......'],
      batDau: { x: 1, y: 3, huong: 0 },
      khung: { chinh: 3 },
      goiY: ['Một lượt: nhặt thùng, tiến tới, đặt, lùi về, rồi sang đứng dưới thùng kế tiếp.', 'Hàm xong thì chương trình chính chỉ cần gọi hàm 2 lần.'],
      sao: { o: 12, nhip: 28 },
      loiGiai: {
        chinh: ['chuyen()', 'chuyen()'],
        hamCuaEmMoi: [H('chuyen', CHUYEN)]
      } }),

    man(7, { ten: 'Thùng nào trước',
      deBai: 'Hai thùng ở hai bên, em tự chọn mang thùng nào trước. Thứ tự làm việc khác nhau thì số nhịp cũng khác nhau.',
      san: ['.....', 'D...D', 'o...o', '.....'],
      batDau: { x: 1, y: 3, huong: 0 },
      goiY: ['Việc mang mỗi thùng giống nhau, viết thành hàm cho gọn.', 'Thùng nào gần xe hơn?'],
      sao: { o: 14, nhip: 25 },
      loiGiai: {
        chinh: ['turn_left()', 'forward()', 'turn_right()', 'mang()', 'turn_right()'].concat(FOR(4, ['forward()']), ['turn_left()', 'mang()']),
        hamCuaEmMoi: [H('mang', MANG)]
      },
      cachKhac: [{
        chinh: ['turn_right()'].concat(FOR(3, ['forward()']), ['turn_left()', 'mang()', 'turn_left()'], FOR(4, ['forward()']), ['turn_right()', 'mang()']),
        hamCuaEmMoi: [H('mang', MANG)]
      }] }),

    man(8, { ten: 'Ba thùng một hàng',
      deBai: 'Chuyển cả ba thùng vào ba ô đích. Chương trình chính chỉ có 3 ô.',
      san: ['D.D.D..', '.......', 'o.o.o..', '.......'],
      batDau: { x: 0, y: 3, huong: 0 },
      khung: { chinh: 3 },
      sao: { o: 12, nhip: 42 },
      loiGiai: {
        chinh: FOR(3, ['chuyen()']),
        hamCuaEmMoi: [H('chuyen', CHUYEN)]
      },
      huyHieu: { ma: 'tay-gap', ten: 'Thợ kẹp hàng' } })
  ]);

  if (laNode) module.exports = ManHoc;
})();
