/* ============================================================================
   man-m1-tay.js — diem10code-python: MÙA 1 Kho hàng, CỘT 2 "+Tay" (hai bánh + tay kẹp, chưa cảm biến).
   grab()/release() tác động Ô PHÍA TRƯỚC MŨI: xe đứng CẠNH vật / đích, quay mặt vào nó. Cột này giới thiệu for: hàng 1 xem, hàng 2 đoán, hàng 3 thấy lại, hàng 6 tự viết.
   Mỗi lệnh tay tự chiếm 1 nhịp như lệnh bánh, Mùa 1 không có wait().
   Từ hàng 1 tới hàng 6 màn cho sẵn một phần bằng HÀM CỦA MÀN (pick / drop); hàng 7–8 em tự viết.
   8 hàng theo khuôn ManHoc.khuon (hoc/KE-HOACH-4-MUA-COT-LOI.md).
   ========================================================================== */
(function () {
  'use strict';
  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-co-so.js') : window.ManHoc;

  var HAM_GOC = ['forward', 'backward', 'turn_left', 'turn_right', 'arm_down', 'arm_up', 'grab', 'release'];
  var T_PICK = ['arm_down()', 'grab()', 'arm_up()'];
  var T_DROP = ['arm_down()', 'release()', 'arm_up()'];
  function H(ten, than) { return { ten: ten, thamSo: [], than: than.slice() }; }
  function hPick() { return H('pick', T_PICK); }
  function hDrop() { return H('drop', T_DROP); }
  function FOR(n, than) { return ['for i in range(' + n + '):'].concat(than.map(function (s) { return '    ' + s; })); }

  function man(so, m) {
    m.chuong = 'm1-c2-tay';
    m.loaiRobot = 'banh'; m.robot = { than: 'hai-banh', tay: 'kep' };
    m.hamGoc = HAM_GOC.slice(); m.khung = Object.assign({ chinh: 10, moiHam: 10 }, m.khung);
    m.cauTruc = ['for'];
    m.mucTieu = 'dua-vat';
    m.moXuong = true;
    m.phienBanNoiDung = 2;                     // lệnh tay tự chiếm nhịp, bỏ wait(): bản nháp cũ không dùng nữa
    ManHoc.khuon(so, m);
    m.camHamCuaEm = m.moXuong === false;
    return ManHoc.chuanHoa(m);
  }

  ManHoc.them([
    man(1, { ten: 'Nhặt thùng, đi nhiều ô',
      deBai: 'Bấm Chạy và xem: hạ tay, kẹp, nâng tay rồi mới đi được. Mỗi lệnh tay chiếm 1 nhịp, giống lệnh bánh xe. Khối for mới: nó lặp lại dòng thụt vào bên trong, ở đây xe tiến 3 lần. Hàm drop() của màn gói sẵn việc đặt thùng.',
      san: ['..D..', '.....', '.....', '..o..', '.....'],
      batDau: { x: 2, y: 4, huong: 0 },
      sao: { o: 9, nhip: 8 },
      loiGiai: { chinh: T_PICK.concat(FOR(3, ['forward()']), ['drop()']), hamCuaMan: [hDrop()] } }),

    man(2, { ten: 'Vòng for chạy mấy lần',
      deBai: 'Lần này pick() gói sẵn việc nhặt thùng, còn phần đặt thùng viết đủ lệnh: release() đặt thùng xuống ô trước mũi xe. Dòng không thụt vào thì không nằm trong for. Đọc code, đoán rồi bấm Chạy.',
      san: ['.......', '..o....', '......D'],
      batDau: { x: 2, y: 2, huong: 0 },
      duDoan: { hoi: 'Chạy xong, forward() đã chạy tổng cộng mấy lần?', luaChon: ['2 lần', '3 lần', '4 lần'], dung: 1, xacMinh: { lenh: { forward: 3 }, vat: [{ x: 6, y: 2 }] } },
      sao: { o: 11, nhip: 9 },
      loiGiai: { chinh: ['pick()', 'turn_right()'].concat(FOR(2, ['forward()']), ['forward()'], T_DROP), hamCuaMan: [hPick()] } }),

    man(3, { ten: 'Điền lệnh tay',
      deBai: 'Đoạn nhặt thùng thiếu 2 lệnh. Chạm ô trống rồi chọn lệnh để điền: một lệnh kẹp thùng, một lệnh nâng tay.',
      san: ['..D..', '.....', '.....', '..o..', '.....'],
      batDau: { x: 2, y: 4, huong: 0 },
      maMau: { chinh: ['arm_down()', '', ''].concat(FOR(3, ['forward()']), ['drop()']) },
      goiY: ['Tay phải hạ xuống rồi mới kẹp được.', 'Tay còn hạ thì xe không đi được.'],
      sao: { o: 9, nhip: 8 },
      loiGiai: { chinh: T_PICK.concat(FOR(3, ['forward()']), ['drop()']), hamCuaMan: [hDrop()] } }),

    man(4, { ten: 'Sắp lại việc nhặt',
      deBai: 'Đủ lệnh nhưng sai thứ tự: tay được nâng trước khi hạ xuống kẹp. Giữ một dòng rồi kéo sang chỗ đúng.',
      san: ['..D..', '.....', '..o..', '.....'],
      batDau: { x: 2, y: 3, huong: 0 },
      maMau: { chinh: ['arm_up()', 'arm_down()', 'grab()', 'forward()', 'forward()', 'drop()'] },
      goiY: ['Muốn kẹp thì tay phải đang hạ. Tay đã nâng thì xe mới đi được.'],
      sao: { o: 9, nhip: 7 },
      loiGiai: { chinh: T_PICK.concat(['forward()', 'forward()', 'drop()']), hamCuaMan: [hDrop()] } }),

    man(5, { ten: 'Xe đứng yên',
      deBai: 'Code này sai đúng 1 chỗ: thùng đã kẹp mà xe không chịu đi. Bấm Chạy xem lỗi, rồi sửa dòng sai.',
      san: ['.....', '.....', '.o.D.', '.....'],
      batDau: { x: 1, y: 3, huong: 0 },
      maMau: { chinh: ['arm_down()', 'grab()', 'arm_down()', 'forward()', 'turn_right()', 'forward()', 'drop()'] },
      goiY: ['Tay đang hạ thì xe không đi được.'],
      loiMa: 'tay-vuong',
      sao: { o: 10, nhip: 8 },
      loiGiai: { chinh: T_PICK.concat(['forward()', 'turn_right()', 'forward()', 'drop()']), hamCuaMan: [hDrop()] } }),

    man(6, { ten: 'Thùng nằm bên phải',
      deBai: 'Màn trống, em tự viết: mang thùng tới ô đích D. Hàm pick() và drop() của màn đã có sẵn trong khay.',
      san: ['...D.', '.....', '.....', '.....', '..o..'],
      batDau: { x: 1, y: 4, huong: 0 },
      goiY: ['Tay chỉ tác động ô trước mũi xe, nên phải quay mặt vào thùng trước khi pick().', 'Đi thẳng nhiều ô thì dùng for cho ngắn: for i in range(n). Chạm con số trong range(...) là đổi được số.', 'Tới cạnh ô đích, quay mặt vào nó rồi mới drop().'],
      sao: { o: 14, nhip: 13 },
      loiGiai: { chinh: ['turn_right()', 'pick()', 'turn_left()'].concat(FOR(4, ['forward()']), ['turn_right()', 'forward()', 'drop()']), hamCuaMan: [hPick(), hDrop()] } }),

    man(7, { ten: 'Hai thùng: tự viết hàm',
      deBai: 'Có hai thùng, việc nhặt và đặt lặp lại mà chương trình chính chỉ có 10 ô. Tự tạo hàm ở Xưởng hàm, đặt tên tùy em.',
      san: ['.....', '.D...', '.o..D', '...o.'],
      batDau: { x: 1, y: 3, huong: 0 },
      goiY: ['Thử gom 3 lệnh nhặt thùng vào một hàm, 3 lệnh đặt thùng vào một hàm khác.'],
      sao: { o: 16, nhip: 17 },
      loiGiai: {
        chinh: ['nhat()', 'forward()', 'dat()', 'turn_right()', 'forward()', 'forward()', 'turn_right()', 'nhat()', 'turn_left()', 'dat()'],
        hamCuaEmMoi: [H('nhat', T_PICK), H('dat', T_DROP)]
      } }),

    man(8, { ten: 'Ba thùng một hàng',
      deBai: 'Chuyển cả ba thùng vào ba ô đích. Chương trình chính chỉ có 3 ô.',
      san: ['D.D.D..', '.......', 'o.o.o..', '.......'],
      batDau: { x: 0, y: 3, huong: 0 },
      khung: { chinh: 3 },
      sao: { o: 18, nhip: 35 },
      loiGiai: {
        chinh: FOR(3, ['chuyen()']),
        hamCuaEmMoi: [H('nhat', T_PICK), H('dat', T_DROP), H('chuyen', ['nhat()', 'forward()', 'forward()', 'dat()', 'backward()', 'backward()', 'turn_right()', 'forward()', 'forward()', 'turn_left()'])]
      },
      huyHieu: { ma: 'tay-gap', ten: 'Thợ kẹp hàng' } })
  ]);

  if (laNode) module.exports = ManHoc;
})();
