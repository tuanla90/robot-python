/* ============================================================================
   man-demo.js — diem10code-python: MÀN DEMO cho 4 mùa cốt lõi đang chạy được.

   Chỉ để CHỨNG MINH khung game (bảng mẫu, chấm bài, vẽ robot) hoạt động đúng
   với mỗi loại thân đã giữ lại. KHÔNG phải màn thật của lộ trình ôn thi — xem
   README.md mục "Việc còn lại" trước khi thêm màn mới vào lộ trình thật.

   Mẫu hồ sơ màn (`chuong`, `so`, `ten`, `san`, `batDau`, `maMau`, `loiGiai`…)
   giữ đúng schema của bản gốc (hoc/man-chuoi-1.js), xem lại ở đó nếu cần tra cứu.
   ========================================================================== */
(function () {
  'use strict';

  var laNode = (typeof module !== 'undefined' && module.exports);
  var ManHoc = laNode ? require('./man-co-so.js') : window.ManHoc;

  function lap(ds, n) { var kq = []; for (var i = 0; i < n; i++) kq = kq.concat(ds); return kq; }

  /* mùa 1 Kho hàng: nội dung thật đã viết ở man-m1-*.js (xem thu-tu-chuong.js). */

  /* ---------------------------------------------------------- mùa 2 Nhà máy (xích) */
  (function () {
    var HAM_XICH = ['left_move', 'right_move', 'left_back', 'right_back', 'wait'];
    function man(m) {
      m.chuong = 'demo-nha-may';
      m.cauTruc = ['for'];
      m.loaiRobot = 'xich'; m.robot = { than: 'xich', tay: null }; m.hamGoc = HAM_XICH;
      m.moXuong = true; m.camHamCuaEm = false;
      m.khung = { chinh: 10, moiHam: 10 };
      return ManHoc.chuanHoa(m);
    }
    ManHoc.them([
      man({
        so: 1, ten: 'Xích lăn bánh', hang: 'lam-quen',
        deBai: 'Xe bánh xích đứng trước lá cờ ba ô. Đưa xe tới cờ.',
        san: ['.....', '..F..', '.....', '.....', '.....'],
        batDau: { x: 2, y: 4, huong: 0 },
        maMau: { chinh: ['left_move()', 'right_move()', 'wait()'] },
        sao: { o: 9, nhip: 3 },
        loiGiai: { chinh: lap(['left_move()', 'right_move()', 'wait()'], 3) }
      })
    ]);
  })();

  /* ---------------------------------------------------------- mùa 3 Bãi tái chế (nhện) */
  (function () {
    var HAM_NHEN = ['go_up', 'go_down', 'go_left', 'go_right', 'wait'];
    function man(m) {
      m.chuong = 'demo-bai-tai-che';
      m.cauTruc = ['for'];
      m.loaiRobot = 'nhen'; m.robot = { than: 'nhen', tay: null }; m.hamGoc = HAM_NHEN;
      m.moXuong = true; m.camHamCuaEm = false;
      m.khung = { chinh: 10, moiHam: 10 };
      return ManHoc.chuanHoa(m);
    }
    ManHoc.them([
      man({
        so: 1, ten: 'Bước chân nhện', hang: 'lam-quen',
        deBai: 'Nhện không cần quay: go_right() sang phải, go_down() xuống, mỗi bước mất 2 nhịp. Đưa nhện tới cờ.',
        san: ['....', '###.', '###.', '###F'],
        batDau: { x: 0, y: 0, huong: 0 },
        maMau: { chinh: ['go_right()', 'go_right()'] },
        sao: { o: 4, nhip: 12 },
        loiGiai: { chinh: lap(['go_right()'], 3).concat(lap(['go_down()'], 3)) }
      })
    ]);
  })();

  /* ---------------------------------------------------------- mùa 4 Nông trại (drone) */
  (function () {
    var BAY = ['go_up', 'go_down', 'go_left', 'go_right', 'wait'];
    function man(m) {
      m.chuong = 'demo-nong-trai';
      m.cauTruc = ['for'];
      m.loaiRobot = 'drone'; m.robot = { than: 'drone', tay: null, camBien: [] }; m.hamGoc = BAY;
      m.mucTieu = 'toi-co';
      m.moXuong = true; m.camHamCuaEm = false;
      m.khung = { chinh: 10, moiHam: 10 };
      return ManHoc.chuanHoa(m);
    }
    ManHoc.them([
      man({
        so: 1, ten: 'Bay ra luống hoa', hang: 'lam-quen',
        deBai: 'Drone đứng trước lá cờ ba ô. Bay tới cờ.',
        san: ['.....', '.....', '..F..', '.....', '.....'],
        batDau: { x: 2, y: 4, huong: 0 },
        maMau: { chinh: ['go_up()', 'wait()'] },
        sao: { o: 4, nhip: 2 },
        loiGiai: { chinh: lap(['go_up()'], 2) }
      })
    ]);
  })();

  if (laNode) module.exports = ManHoc;
})();
