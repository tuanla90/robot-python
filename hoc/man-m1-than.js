/* ============================================================================
   man-m1-than.js — diem10code-python: MÙA 1 Kho hàng, CỘT 1 "Thân" (hai bánh một mình).
   Chưa có tay, chưa có cảm biến. 4 lệnh gốc forward()/backward()/turn_left()/turn_right(), mỗi
   lệnh tự chạy đủ số nhịp của nó: tiến, lùi 1 nhịp, quay 2 nhịp. Chỉ dùng lệnh thường, chưa có for (for dạy từ cột 2); hàng 6 lần đầu mở Xưởng hàm.
   8 hàng theo khuôn mới ManHoc.khuonMoi (hoc/KE-HOACH-4-MUA-COT-LOI.md).
   ========================================================================== */
(function () {
  'use strict';
  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-co-so.js') : window.ManHoc;

  var HAM_GOC = ['forward', 'backward', 'turn_left', 'turn_right'];
  function H(ten, than) { return { ten: ten, thamSo: [], than: than.slice() }; }

  function man(so, m) {
    m.chuong = 'm1-c1-than';
    m.loaiRobot = 'banh'; m.robot = { than: 'hai-banh', tay: null };
    m.hamGoc = HAM_GOC.slice(); m.khung = Object.assign({ chinh: 10, moiHam: 10 }, m.khung);
    m.cauTruc = [];
    m.moXuong = false;
    m.phienBanNoiDung = 2;                     // khuôn mới: đánh số lại các màn, bản nháp cũ không dùng nữa
    ManHoc.khuonMoi(so, m);
    m.camHamCuaEm = m.moXuong === false;
    return ManHoc.chuanHoa(m);
  }

  ManHoc.them([
    man(1, { ten: 'Mũi xe quay về đâu',
      deBai: 'forward() cho xe tiến 1 ô theo hướng mũi xe, turn_left() và turn_right() quay xe tại chỗ. Tiến mất 1 nhịp, quay mất 2 nhịp. Đâm tường là thua, và chạy hết code xe phải đứng đúng trên cờ. Đọc code, đoán trước rồi bấm Chạy để kiểm tra.',
      san: ['.....', '..F..', '.....', '.....', '.....'],
      batDau: { x: 3, y: 4, huong: 0 },
      duDoan: { hoi: 'Khi tới cờ, mũi xe quay về hướng nào?', luaChon: ['Lên trên', 'Sang trái', 'Sang phải'], dung: 1, xacMinh: { x: 2, y: 1, huong: 3 } },
      sao: { o: 5, nhip: 6 },
      loiGiai: { chinh: ['forward()', 'forward()', 'forward()', 'turn_left()', 'forward()'] } }),

    man(2, { ten: 'Lùi một ô',
      deBai: 'Phía trước là tường. Điền một lệnh vào ô trống để xe xuống đúng hàng có cờ. backward() lùi 1 ô mà không quay.',
      san: ['..#', '...', 'F..'],
      batDau: { x: 2, y: 1, huong: 0 },
      maMau: { chinh: ['', 'turn_left()', 'forward()', 'forward()'] },
      goiY: ['Cờ ở hàng dưới xe một ô. Xe đang quay mặt lên, vậy lệnh nào đưa xe xuống mà không cần quay?'],
      sao: { o: 4, nhip: 5 },
      loiGiai: { chinh: ['backward()', 'turn_left()', 'forward()', 'forward()'] } }),

    man(3, { ten: 'Rẽ nhầm hướng',
      deBai: 'Code này sai đúng 1 chỗ nên xe không tới được cờ. Bấm Chạy xem xe đi đâu, rồi sửa dòng sai.',
      san: ['.....', '...F.', '.....', '.....', '.....'],
      batDau: { x: 0, y: 4, huong: 0 },
      maMau: { chinh: ['forward()', 'forward()', 'forward()', 'turn_left()', 'forward()', 'forward()', 'forward()'] },
      goiY: ['Xe lên tới hàng có cờ rồi, cờ nằm bên nào của xe?'],
      sao: { o: 7, nhip: 8 },
      loiGiai: { chinh: ['forward()', 'forward()', 'forward()', 'turn_right()', 'forward()', 'forward()', 'forward()'] } }),

    man(4, { ten: 'Đi vòng qua kệ hàng',
      deBai: 'Màn trống, em tự viết từ đầu: đưa xe men theo lối đi tới cờ.',
      san: ['F....', '####.', '####.', '####.', '####.'],
      batDau: { x: 4, y: 4, huong: 0 },
      goiY: ['Đường đi gồm hai đoạn thẳng, giữa hai đoạn là một lần rẽ.', 'Đếm đúng số ô của từng đoạn, không tính ô xe đang đứng.'],
      sao: { o: 9, nhip: 10 },
      loiGiai: { chinh: ['forward()', 'forward()', 'forward()', 'forward()', 'turn_left()', 'forward()', 'forward()', 'forward()', 'forward()'] } }),

    man(5, { ten: 'Kho rộng, nhiều lối',
      deBai: 'Kho này có nhiều lối tới cờ. Em tự chọn đường, miễn không quá 10 dòng.',
      san: ['....F', '.#.#.', '.....', '.#.#.', '.....'],
      batDau: { x: 0, y: 4, huong: 0 },
      goiY: ['Đi thẳng rồi rẽ, rẽ rồi đi thẳng, hay đi giữa kho đều được. Chọn đường em thích.'],
      sao: { o: 10, nhip: 10 },
      loiGiai: { chinh: ['forward()', 'forward()', 'turn_right()', 'forward()', 'forward()', 'forward()', 'forward()', 'turn_left()', 'forward()', 'forward()'] },
      cachKhac: [
        { chinh: ['forward()', 'forward()', 'forward()', 'forward()', 'turn_right()', 'forward()', 'forward()', 'forward()', 'forward()'] },
        { chinh: ['turn_right()', 'forward()', 'forward()', 'forward()', 'forward()', 'turn_left()', 'forward()', 'forward()', 'forward()', 'forward()'] }
      ] }),

    man(6, { ten: 'Bậc thang: tự đặt tên hàm',
      deBai: 'Thao tác "sang phải 1 ô, lên 1 ô" cứ lặp lại. Bấm Hàm mới, đặt tên tùy em, gom thao tác đó vào hàm rồi gọi hàm. Chương trình chính chỉ có 3 ô.',
      san: ['###F', '##..', '#..#', '..##'],
      batDau: { x: 0, y: 3, huong: 0 },
      khung: { chinh: 3 },
      goiY: ['Một bậc thang gồm 4 lệnh: quay phải, tiến, quay trái, tiến.', 'Có 3 bậc. Chương trình chính chỉ cần gọi hàm của em 3 lần.'],
      sao: { o: 7, nhip: 18 },
      loiGiai: { chinh: ['step()', 'step()', 'step()'], hamCuaEmMoi: [H('step', ['turn_right()', 'forward()', 'turn_left()', 'forward()'])] } }),

    man(7, { ten: 'Gọn hay nhanh',
      deBai: 'Một sao cho bài gọn, một sao cho bài nhanh. Hai sao này có thể lấy bằng hai bài khác nhau, sao đã có vẫn được giữ. Em đi đường nào?',
      san: ['#..F', '....', '....', '...#'],
      batDau: { x: 0, y: 3, huong: 0 },
      goiY: ['Đường bậc thang lặp lại nên viết hàm rất gọn, nhưng xe rẽ nhiều nên chậm.', 'Ít lần rẽ thì nhanh hơn, nhưng thường phải viết nhiều dòng hơn.'],
      sao: { o: 7, nhip: 10 },
      doiCho: true,
      loiGiai: { chinh: ['bac()', 'bac()', 'bac()'], hamCuaEmMoi: [H('bac', ['turn_right()', 'forward()', 'turn_left()', 'forward()'])] },
      cachKhac: [{ chinh: ['forward()', 'forward()', 'turn_right()', 'forward()', 'forward()', 'forward()', 'turn_left()', 'forward()'] }] }),

    man(8, { ten: 'Lối đi ngoằn ngoèo',
      deBai: 'Tới cờ qua lối đi ngoằn ngoèo. Chương trình chính chỉ có 10 ô, em tự tìm cách viết gọn.',
      san: ['...#..F', '.#.#.##', '.#...##'],
      batDau: { x: 0, y: 2, huong: 0 },
      sao: { o: 14, nhip: 22 },
      loiGiai: {
        chinh: ['hop()', 'turn_right()', 'forward()', 'forward()', 'turn_left()', 'forward()', 'forward()', 'turn_left()', 'hop()'],
        hamCuaEmMoi: [H('hop', ['forward()', 'forward()', 'turn_right()', 'forward()', 'forward()'])]
      },
      huyHieu: { ma: 'hai-banh', ten: 'Tay lái hai bánh' } })
  ]);

  if (laNode) module.exports = ManHoc;
})();
