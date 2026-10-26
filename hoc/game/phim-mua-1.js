/* ============================================================================
   phim-mua-1.js — "Robot Chấn Hưng": DỮ LIỆU PHIM GÓI MÙA 1 (bộ máy chiếu: phim-goi.js). Kịch bản: hoc/KE-HOACH-PHIM-GOI.md mục 3.
   Mỗi mã gói một mảng 3–4 hàm khung (k, c): k = khung tranh 320×220, c = bộ dựng hình của PhimGoi (c.xe, c.san, c.code…).
   Lời khung n ở chu.js khóa 'pg.<mã gói>.<n>' (≤ 14 từ). Gói 'xe' không có phim (đã có phim mở đầu, mo-dau.js).
   Gói 'combo' (gói 9) chưa có màn nên chưa có trong lộ trình: phim khai sẵn, gói ra đời là chiếu.
   R1 sơn vàng (sơn mặc định của VeRobot: vàng, hay màu người chơi chọn ở Cài đặt); R2 sơn lam (son: 'lam').
   Hình chiếu ngang như phim mở đầu: robot nhìn từ trên, mũi quay sang PHẢI (hướng 1), đứng trên dải sàn ở đáy khung (đỉnh sàn y = 190).
   Node (máy kiểm kiem-phim-goi.mjs) require tệp này lấy bảng PHIM (không chạy hàm vẽ nào).
   ========================================================================== */
(function (goc) {
  'use strict';

  var CAM = [{ ma: 'khoang-cach', o: 'hong' }];
  var XE = { than: 'hai-banh', tay: null, camBien: [] };
  var KEP = { than: 'hai-banh', tay: 'kep', camBien: [] };
  var Y = 158;                                    // tâm thân R1 khi đứng trên sàn (tỉ lệ 3)
  var VAT = 57;                                   // tâm thùng trong kẹp cách tâm thân (pixel khung, tỉ lệ 3: VeRobot.vatKep ≈ 18–20 pixel part)
  var NANG_MO = { tay: { tuThe: 'tren', kep: false } }, HA_MO = { tay: { tuThe: 'duoi', kep: false } };
  var HA_CAM = { tay: { tuThe: 'duoi', kep: true, cam: true } }, NANG_CAM = { tay: { tuThe: 'tren', kep: true, cam: true } };

  /** Thùng nhỏ (cạnh 28) đặt tâm ở (x, y). */
  function thung(c, x, y, cls) { return c.dat(c.o('crate', 2), x - 14, y - 14, cls); }
  /** Dời phần tử (left/top) sau ms, có trượt (lớp pg-truot, thời lượng giây). */
  function truot(c, e, ms, x, y, giay) {
    e.classList.add('pg-truot'); e.style.setProperty('--tg', (giay || 1) + 's');
    c.sau(ms, function () { e.style.left = x + 'px'; if (y !== undefined) e.style.top = y + 'px'; });
  }

  var PHIM = {
    /* ---------------------------------------------------------------- 2 · Tay gắp */
    'tay-gap': [
      // 1 · R1 lăn tới thùng gỗ; tay kẹp thò ra dưới gầm, lắc lắc
      function (k, c) {
        c.nen(k, 'md-san');
        k.appendChild(c.dat(c.ico('denKepMo', 3, '#ffd95a'), 236, 156, 'md-lac'));
        k.appendChild(c.dat(c.o('crate', 5), 180, 120));
        var r = c.xe(XE, {}, 1, 3, -40, Y); k.appendChild(r);
        truot(c, r, 60, 86, Y, 1.2);
        k.appendChild(c.chu('md-hoi pg-hoi-r1', '!'));
        c.sau(400, function () { c.keu('buoc'); });
      },
      // 2 · tay kẹp bay lên, gắn vào mũi R1, CẠCH!
      function (k, c) {
        c.nen(k, 'md-san');
        k.appendChild(c.dat(c.o('crate', 5), 180, 120));
        k.appendChild(c.tu(c.xe(XE, {}, 1, 3, 86, Y), 0.95, true));
        k.appendChild(c.tu(c.xe(KEP, NANG_MO, 1, 3, 86, Y), 0.95));
        var vx = c.h('div', 'md-a md-vx'); vx.style.left = '236px'; vx.style.top = '156px'; vx.style.setProperty('--x', '-100px'); vx.style.animationDelay = '.1s';
        var vy = c.h('div', 'md-vy'); vy.style.setProperty('--y', '-10px'); vy.style.setProperty('--r', '360deg'); vy.style.animationDelay = '.1s';
        vy.appendChild(c.ico('denKepMo', 3, '#ffd95a')); vx.appendChild(vy); k.appendChild(c.tu(vx, 0.95, true));
        var cach = c.chu('md-ram pg-cach', 'CẠCH!'); cach.style.animationDelay = '.95s'; k.appendChild(cach);
        c.sau(950, function () { c.keu('kep'); });
      },
      // 3 · R1 hạ tay, kẹp thùng, nhấc lên
      function (k, c) {
        c.nen(k, 'md-san');
        var tg = thung(c, 110 + VAT, Y); k.appendChild(tg);
        var r = c.xe(KEP, NANG_MO, 1, 3, 110, Y); k.appendChild(r);
        c.sau(600, function () { r.ve(HA_MO); c.keu('bam'); });
        c.sau(1200, function () { r.ve(HA_CAM); c.keu('kep'); });
        c.sau(1800, function () { r.ve(NANG_CAM); tg.classList.add('pg-nhac'); c.keu('bam'); });
      },
      // 4 · code arm_down() grab() arm_up(); R1 đặt thùng vào ô đích khung vàng, sao lóe
      function (k, c) {
        c.nen(k, 'md-san');
        c.code(k, ['arm_down()', 'grab()', 'arm_up()'], 10, 14);
        var dich = c.dat(c.h('div', 'pg-dich'), 248, 136); dich.style.width = dich.style.height = '40px'; k.appendChild(dich);
        var nhom = c.dat(c.h('div', 'pg-nhom md-di'), 0, 0); nhom.style.setProperty('--d', '101px');
        var tg = thung(c, 110 + VAT, Y - 4); nhom.appendChild(tg);
        var r = c.xe(KEP, NANG_CAM, 1, 3, 110, Y); nhom.appendChild(r);
        k.appendChild(nhom);
        c.sau(2600, function () { r.ve(HA_MO); tg.style.top = (Y - 14) + 'px'; c.keu('tha'); });
        var s = c.dat(c.sao(3), 255, 96, 'md-pop md-sang'); s.style.animationDelay = '2.9s, 2.9s'; k.appendChild(s);
        for (var i = 0; i < 5; i++) c.sau(1000 + i * 280, function () { c.keu('buoc'); });
        c.sau(2900, function () { c.keu('thang'); });
      }
    ]
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = PHIM;
  if (goc && goc.PhimGoi) goc.PhimGoi.them(PHIM);
})(typeof window !== 'undefined' ? window : globalThis);
