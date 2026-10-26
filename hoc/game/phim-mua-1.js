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
  var CAM_XE = { than: 'hai-banh', tay: null, camBien: CAM };
  var KHO = ['#M###', '...CF', '#####'];          // kho hàng: nút đè trong hốc trên, cửa chặn lối tới cờ
  var NGO = ['.####', '....#', '.####'];          // ngõ cụt hẹp: vào được, không quay được
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
    ],

    /* ---------------------------------------------------------------- 3 · Cảm biến khoảng cách */
    'cam-bien': [
      // 1 · R1 chạy thẳng, đâm tường RẦM, sao quay trên đầu
      function (k, c) {
        c.nen(k, 'md-san'); tuong(k, c, 270);
        var r = c.xe(XE, {}, 1, 3, 40, Y); k.appendChild(r);
        truot(c, r, 60, 238, Y, 0.8);
        c.sau(880, function () { r.classList.add('md-rung'); c.keu('dam'); });
        var ram = c.chu('md-ram', 'RẦM!'); ram.style.animationDelay = '.88s'; k.appendChild(ram);
        saoQuay(k, c, 238, 0.95);
      },
      // 2 · đèn cảm biến xanh lăn ra từ góc xưởng
      function (k, c) {
        c.nen(k, 'md-san'); tuong(k, c, 270);
        k.appendChild(c.xe(XE, {}, 1, 3, 230, Y));
        saoQuay(k, c, 230, 0);
        var den = c.dat(c.ico('denCam', 3, '#7ff0ff'), -30, 160, 'pg-lan'); den.style.setProperty('--x', '150px'); k.appendChild(c.tu(den, 1.4, true));
        var nhay = c.dat(c.h('div'), 0, 0); k.appendChild(c.tu(nhay, 1.4));
        nhay.appendChild(c.dat(c.ico('denCam', 3, '#7ff0ff'), 120, 160, 'pg-nhay'));
        var hoi = c.chu('md-hoi', '!'); hoi.style.left = '132px'; hoi.style.top = '118px'; hoi.style.animationDelay = '1.4s'; k.appendChild(hoi);
        c.sau(1400, function () { c.keu('moKhoa'); });
      },
      // 3 · gắn cảm biến; tia quét trước mũi, gặp tường tia đỏ, R1 dừng kịp
      function (k, c) {
        c.nen(k, 'md-san'); tuong(k, c, 270);
        var nhom = c.dat(c.h('div', 'pg-nhom md-di'), 0, 0); nhom.style.setProperty('--d', '140px');
        var tia = c.dat(c.h('div', 'pg-tia pg-do'), 92, Y - 4); tia.style.width = '38px'; tia.style.setProperty('--t', '2.4s'); nhom.appendChild(tia);
        nhom.appendChild(c.xe(CAM_XE, { camBien: { bat: true } }, 1, 3, 60, Y));
        k.appendChild(nhom);
        c.sau(300, function () { c.keu('quet'); });
        c.sau(2400, function () { c.keu('loi'); });
      },
      // 4 · code while front_clear(): move(); R1 dừng sát tường
      function (k, c) {
        c.nen(k, 'md-san'); tuong(k, c, 270);
        c.code(k, ['while front_clear():', '    move()'], 10, 14);
        var nhom = c.dat(c.h('div', 'pg-nhom md-di'), 0, 0); nhom.style.setProperty('--d', '178px');
        var tia = c.dat(c.h('div', 'pg-tia pg-do'), 92, Y - 4); tia.style.width = '0px'; tia.style.setProperty('--t', '2.4s'); nhom.appendChild(tia);
        nhom.appendChild(c.xe(CAM_XE, { camBien: { bat: true } }, 1, 3, 60, Y));
        k.appendChild(nhom);
        c.sau(400, function () { tia.style.width = '38px'; });
        c.sau(2100, function () { tia.style.width = '2px'; });
        for (var i = 0; i < 5; i++) c.sau(1000 + i * 280, function () { c.keu('buoc'); });
        c.sau(2500, function () { c.keu('thang'); });
      }
    ],

    /* ---------------------------------------------------------------- 4 · Kho hàng (nút đè) */
    'kho-hang': [
      // 1 · cửa kho đóng; trên sàn có ô nút đè
      function (k, c) {
        var s = c.san(k, KHO, 4, 20, 26);
        s.nut['1,0'].classList.add('pg-nhay');
        k.appendChild(c.xe(XE, {}, 1, 2, s.o(0, 1).x, s.o(0, 1).y));
        var hoi = c.chu('md-hoi md-hoi-xa', '?'); hoi.style.left = '196px'; hoi.style.top = '30px'; hoi.style.animationDelay = '.8s'; k.appendChild(hoi);
      },
      // 2 · R1 lên nút: cửa mở; rời nút: cửa đóng sập, "?!"
      function (k, c) {
        var s = c.san(k, KHO, 4, 20, 26), nut = s.nut['1,0'], cua = s.cua['3,1'];
        var a = s.o(1, 1), b = s.o(1, 0);
        var r = c.xe(XE, {}, 0, 2, a.x, a.y); k.appendChild(r);
        truot(c, r, 300, b.x, b.y, 0.6);
        c.sau(900, function () { nut.dat(true); cua.dat(true); c.keu('moKhoa'); });
        c.sau(1700, function () { r.ve(null, 2); });
        truot(c, r, 2000, a.x, a.y, 0.6);
        c.sau(2400, function () { nut.dat(false); });
        c.sau(2700, function () { cua.dat(false); cua.classList.add('md-rung'); c.keu('dam'); });
        var hoi = c.chu('md-hoi', '?!'); hoi.style.left = (a.x - 14) + 'px'; hoi.style.top = (a.y + 14) + 'px'; hoi.style.animationDelay = '2.9s'; k.appendChild(hoi);
      },
      // 3 · R1 đặt thùng gỗ lên nút, cửa mở, R1 đi qua
      function (k, c) {
        var s = c.san(k, KHO, 4, 20, 26), nut = s.nut['1,0'], cua = s.cua['3,1'];
        var a = s.o(1, 1), b = s.o(1, 0);
        var tg = thung(c, a.x, a.y - 38); k.appendChild(tg);
        var r = c.xe(KEP, NANG_CAM, 0, 2, a.x, a.y); k.appendChild(r);
        c.sau(500, function () { r.ve(HA_CAM); });
        c.sau(1000, function () { r.ve(HA_MO); tg.style.top = (b.y - 14) + 'px'; c.keu('tha'); });
        c.sau(1300, function () { nut.dat(true); cua.dat(true); c.keu('moKhoa'); r.ve(NANG_MO); });
        c.sau(1900, function () { r.ve(NANG_MO, 1); });
        var dich = s.o(4, 1);
        truot(c, r, 2200, dich.x - 40, dich.y, 1.2);
        c.sau(3500, function () { c.keu('thang'); });
      }
    ],

    /* ---------------------------------------------------------------- 5 · Bánh lùi */
    'banh-lui': [
      // 1 · R1 vào ngõ cụt hẹp, hai bên tường, không quay được, "?"
      function (k, c) {
        var s = c.san(k, NGO, 4, 20, 26), p = s.o(3, 1);
        var r = c.xe(XE, {}, 1, 2, s.o(1, 1).x, p.y); k.appendChild(r);
        truot(c, r, 100, p.x, p.y, 0.8);
        c.sau(1100, function () { r.classList.add('pg-lac-xe'); c.keu('loi'); });
        var hoi = c.chu('md-hoi', '?'); hoi.style.left = (p.x - 8) + 'px'; hoi.style.top = '6px'; hoi.style.animationDelay = '1.6s'; k.appendChild(hoi);
      },
      // 2 · hộp linh kiện bật nắp, hai bánh R1 sáng lên
      function (k, c) {
        var s = c.san(k, NGO, 4, 20, 26), p = s.o(3, 1), h = s.o(0, 0);
        k.appendChild(c.dat(c.ico('box', 3, '#c98a45'), h.x - 17, h.y - 12));
        k.appendChild(c.dat(c.h('div', 'pg-nap'), h.x - 16, h.y - 16, 'md-bat'));
        var r = c.xe(XE, {}, 1, 2, p.x, p.y); k.appendChild(r);
        var vx = c.h('div', 'md-a md-vx'); vx.style.left = (h.x - 16) + 'px'; vx.style.top = (h.y - 16) + 'px'; vx.style.setProperty('--x', (p.x - h.x) + 'px'); vx.style.animationDelay = '.3s';
        var vy = c.h('div', 'md-vy'); vy.style.setProperty('--y', (p.y - h.y) + 'px'); vy.style.setProperty('--r', '360deg'); vy.style.animationDelay = '.3s';
        vy.appendChild(c.ico('denBanh', 3, '#c0c6d4')); vx.appendChild(vy); k.appendChild(c.tu(vx, 1.2, true));
        c.sau(1200, function () { r.classList.add('pg-nhay'); r.ve({ wl: 2, wr: 2 }); c.keu('moKhoa'); });
      },
      // 3 · R1 lùi ra khỏi ngõ, vệt bánh
      function (k, c) {
        var s = c.san(k, NGO, 4, 20, 26), p = s.o(3, 1), q = s.o(0, 1);
        var vet = c.dat(c.h('div', 'pg-vet'), q.x, p.y - 3); vet.style.width = (p.x - q.x) + 'px'; k.appendChild(vet);
        var r = c.xe(XE, { wl: 2, wr: 2 }, 1, 2, p.x, p.y); k.appendChild(r);
        truot(c, r, 500, q.x, q.y, 1.4);
        for (var i = 0; i < 3; i++) c.sau(600 + i * 450, function () { c.keu('buoc'); });
      },
      // 4 · code left_back() right_back() wait()
      function (k, c) {
        var s = c.san(k, NGO, 4, 20, 26), p = s.o(3, 1), q = s.o(2, 1);
        c.code(k, ['left_back()', 'right_back()', 'wait()'], 10, 14);
        var r = c.xe(XE, {}, 1, 2, p.x, p.y); k.appendChild(r);
        c.sau(1100, function () { r.ve({ wl: 2, wr: 0 }); c.keu('buoc'); });
        c.sau(1400, function () { r.ve({ wl: 2, wr: 2 }); c.keu('buoc'); });
        truot(c, r, 1500, q.x, q.y, 0.6);
        c.sau(2200, function () { r.ve({}); c.keu('thang'); });
      }
    ]
  };

  /** Cột tường ở x (ba ô tường cạnh 42, đáy chạm sàn). */
  function tuong(k, c, x) { [64, 106, 148].forEach(function (y) { k.appendChild(c.dat(c.o('wall', 3), x, y)); }); }
  /** Hai ngôi sao quay quanh đầu R1 (choáng), hiện từ giây t. */
  function saoQuay(k, c, x, t) {
    var nhom = c.dat(c.h('div'), 0, 0);
    nhom.appendChild(c.dat(c.sao(2), x - 30, 104, 'pg-sao-quay'));
    nhom.appendChild(c.dat(c.sao(2), x + 6, 98, 'pg-sao-quay'));
    k.appendChild(c.tu(nhom, t));
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = PHIM;
  if (goc && goc.PhimGoi) goc.PhimGoi.them(PHIM);
})(typeof window !== 'undefined' ? window : globalThis);
