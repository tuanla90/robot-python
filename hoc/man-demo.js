/* ============================================================================
   man-demo.js — diem10code-python: MÀN DEMO cho các mùa cốt lõi chưa dựng.

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

  /* mùa 1 Kho hàng, mùa 2 Bãi tái chế, mùa 3 Bến sông: nội dung thật đã viết ở man-m1-*.js, man-m2-*.js, man-m3-*.js (xem thu-tu-chuong.js). */

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
