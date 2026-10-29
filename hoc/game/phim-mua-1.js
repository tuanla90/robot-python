var BM = (typeof window !== 'undefined' && window.BangMau) || (typeof require === 'function' ? require('./bang-mau.js') : {});   // bảng màu theo vai (bang-mau.js)
/* ============================================================================
   phim-mua-1.js — "Robot Chấn Hưng": DỮ LIỆU PHIM GÓI MÙA 1 (bộ máy chiếu: phim-goi.js). Kịch bản: hoc/KE-HOACH-PHIM-GOI.md mục 3.
   Mỗi mã gói một mảng 3–4 hàm khung (k, c): k = khung tranh 320×220, c = bộ dựng hình của PhimGoi (c.xe, c.san, c.code…).
   Lời khung n ở chu.js khóa 'pg.<mã gói>.<n>' (≤ 14 từ). Gói 'xe' không có phim (đã có phim mở đầu, mo-dau.js).
   Gói 'combo' (gói 9) có màn từ 27/10 (man-combo-mua-1.js); mọi phim mùa 1 khớp một gói thật.
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
  var ME = ['#######', '#...#F#', '#.#.#.#', '#.#...#', '#######'];      // mê cung nhỏ: bám tường phải từ ô (1, 3) tới cờ (5, 1)
  var CHAT = ['#o###', '.....', '###o#'];        // kho chật: thùng nằm hai bên lối đi
  var XOAY = { than: 'hai-banh', tay: 'xoay', camBien: [] };
  var DU_BO = { than: 'hai-banh', tay: 'xoay', camBien: CAM };            // R1 đủ bộ cuối mùa 1: tay xoay + cảm biến hai bên
  var KEP_R2 = { than: 'hai-banh', tay: 'kep', camBien: [], son: 'lam' };  // R2 sơn lam
  var HUY = ['hai-banh', 'tay-gap', 'khoang-cach', 'che-tay', 'che-xe', 'tay-xoay', 'cam-bien-ben', 'hai-robot'];   // huy hiệu các gói mùa 1 (HuyHieu)
  var Y = 158;                                    // tâm thân R1 khi đứng trên sàn (tỉ lệ 3)
  /* Gói V6: robot vẽ trong MỘT Ô cạnh tỉ lệ · 24 · 1,2 px (VeRobot.veCo) nên thùng trong kẹp theo VeVector.vatKep (1/100 ô).
     VAT / VAT2: tâm thùng trong kẹp cách tâm thân (px khung) ở tỉ lệ 3 / 2; NUA / NUA2: nửa cạnh ô thùng (thùng vector vẽ trong hộp 76% ô). V7c2: hết hằng pixel (57, 38, 14) / biến VEC. */
  var VR = goc.VeRobot || {};                                                                   // Node (máy kiểm đọc lời / khung) không nạp ve-robot: số dự phòng
  function oPx(tl) { return tl * (VR.PX_O_PART || 24) * (VR.PHONG_NGOAI_SAN || 1.2); }
  function kepPx(tl) { var v = (VR.vatKep && VR.vatKep(KEP, 'tren')) || { ahead: 75, n: 42 }; return { vat: v.ahead * oPx(tl) / 100, nua: v.n / 0.76 * oPx(tl) / 200 }; }
  var VAT = kepPx(3).vat;
  var NUA = kepPx(3).nua, VAT2 = kepPx(2).vat, NUA2 = kepPx(2).nua;
  var NANG_MO = { tay: { tuThe: 'tren', kep: false } }, HA_MO = { tay: { tuThe: 'duoi', kep: false } };
  var HA_CAM = { tay: { tuThe: 'duoi', kep: true, cam: true } }, NANG_CAM = { tay: { tuThe: 'tren', kep: true, cam: true } };

  /* Gói V6b (user 28/10 "Nâng lên to ra"): thùng dựng ở cỡ vật NÂNG (NUA theo vatKep 'tren'); nằm sàn / tay hạ thì coT(tg, false) thu về cỡ vật nằm sàn
     bằng thuộc tính CSS `scale` (quanh tâm, không đụng transform của lớp hoạt cảnh), tay nâng coT(tg, true) trả về cỡ nâng. */
  var CO_SAN = goc.VeVector && goc.VeVector.coVatKep ? String(goc.VeVector.coVatKep(0) / goc.VeVector.coVatKep(1)) : '';
  function coT(tg, nang) { tg.style.scale = nang ? '' : CO_SAN; return tg; }
  /** Thùng nhỏ (cạnh 2 · nua, mặc định NUA) đặt tâm ở (x, y). */
  function thung(c, x, y, cls, nua) { nua = nua || NUA; return c.dat(c.o('crate', 2 * nua / 14), x - nua, y - nua, cls); }
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
        k.appendChild(c.dat(c.ico('denKepMo', 3, BM.vang), 236, 156, 'md-lac'));
        k.appendChild(c.dat(c.o('crate', 5), 180, 120));
        var r = c.xe(XE, {}, 1, 3, -40, Y); k.appendChild(r);
        truot(c, r, 60, 86, Y, 1.2);
        k.appendChild(c.chu('md-hoi pg-hoi-r1', '!'));
        c.sau(400, function () { c.keu('buoc'); });
        c.sau(1300, function () { r.mat('ngac'); });                   // biểu cảm mắt (chỉ vector, gói V6): thấy thùng
      },
      // 2 · tay kẹp bay lên, gắn vào mũi R1, CẠCH!
      function (k, c) {
        c.nen(k, 'md-san');
        k.appendChild(c.dat(c.o('crate', 5), 180, 120));
        k.appendChild(c.tu(c.xe(XE, {}, 1, 3, 86, Y), 0.95, true));
        var r2 = c.xe(KEP, NANG_MO, 1, 3, 86, Y); k.appendChild(c.tu(r2, 0.95));
        c.sau(1100, function () { r2.mat('vui'); });
        var vx = c.h('div', 'md-a md-vx'); vx.style.left = '236px'; vx.style.top = '156px'; vx.style.setProperty('--x', '-100px'); vx.style.animationDelay = '.1s';
        var vy = c.h('div', 'md-vy'); vy.style.setProperty('--y', '-10px'); vy.style.setProperty('--r', '360deg'); vy.style.animationDelay = '.1s';
        vy.appendChild(c.ico('denKepMo', 3, BM.vang)); vx.appendChild(vy); k.appendChild(c.tu(vx, 0.95, true));
        var cach = c.chu('md-ram pg-cach', 'CẠCH!'); cach.style.animationDelay = '.95s'; k.appendChild(cach);
        c.sau(950, function () { c.keu('kep'); });
      },
      // 3 · R1 hạ tay, kẹp thùng, nhấc lên
      function (k, c) {
        c.nen(k, 'md-san');
        var tg = coT(thung(c, 110 + VAT, Y), false); k.appendChild(tg);
        var r = c.xe(KEP, NANG_MO, 1, 3, 110, Y); k.appendChild(r);
        c.sau(600, function () { r.ve(HA_MO); c.keu('bam'); });
        c.sau(1200, function () { r.ve(HA_CAM); c.keu('kep'); });
        c.sau(1800, function () { r.ve(NANG_CAM); coT(tg, true); c.keu('bam'); });      // vector (V6b): nhấc lên thì thùng to ra
        c.sau(2100, function () { r.mat('vui'); });
      },
      // 4 · code arm_down() grab() arm_up(); R1 đặt thùng vào ô đích khung vàng, sao lóe
      function (k, c) {
        c.nen(k, 'md-san');
        c.code(k, ['arm_down()', 'grab()', 'arm_up()'], 10, 14);
        var dich = c.dat(c.h('div', 'pg-dich'), 248, 136); dich.style.width = dich.style.height = '40px'; k.appendChild(dich);
        var nhom = c.dat(c.h('div', 'pg-nhom md-di'), 0, 0); nhom.style.setProperty('--d', (268 - 110 - VAT) + 'px');      // vector: tay ngắn hơn, đi thêm cho thùng vẫn vào giữa ô đích (tâm 268)
        var tg = thung(c, 110 + VAT, Y - 4); nhom.appendChild(tg);
        var r = c.xe(KEP, NANG_CAM, 1, 3, 110, Y); nhom.appendChild(r);
        k.appendChild(nhom);
        c.sau(2600, function () { r.ve(HA_MO); coT(tg, false); tg.style.top = (Y - NUA) + 'px'; c.keu('tha'); });
        var s = c.dat(c.sao(3), 255, 96, 'md-pop md-sang'); s.style.animationDelay = '2.9s, 2.9s'; k.appendChild(s);
        for (var i = 0; i < 5; i++) c.sau(1000 + i * 280, function () { c.keu('buoc'); });
        c.sau(2900, function () { c.keu('thang'); r.mat('vui'); });
      }
    ],

    /* ---------------------------------------------------------------- 3 · Cảm biến khoảng cách */
    'cam-bien': [
      // 1 · R1 chạy thẳng, đâm tường RẦM, sao quay trên đầu
      function (k, c) {
        c.nen(k, 'md-san'); tuong(k, c, 270);
        var r = c.xe(XE, {}, 1, 3, 40, Y); k.appendChild(r);
        truot(c, r, 60, 238, Y, 0.8);
        c.sau(880, function () { r.classList.add('md-rung'); c.keu('dam'); r.mat('xoay'); });
        c.sau(1500, function () { r.mat('dam'); });
        var ram = c.chu('md-ram', 'RẦM!'); ram.style.animationDelay = '.88s'; k.appendChild(ram);
        saoQuay(k, c, 238, 0.95);
      },
      // 2 · đèn cảm biến xanh lăn ra từ góc xưởng
      function (k, c) {
        c.nen(k, 'md-san'); tuong(k, c, 270);
        var r = c.xe(XE, {}, 1, 3, 230, Y); k.appendChild(r.mat('dam'));
        saoQuay(k, c, 230, 0);
        c.sau(1400, function () { r.mat('ngac'); });
        var den = c.dat(c.ico('denCam', 3, BM.xanhLoSang2), -30, 160, 'pg-lan'); den.style.setProperty('--x', '150px'); k.appendChild(c.tu(den, 1.4, true));
        var nhay = c.dat(c.h('div'), 0, 0); k.appendChild(c.tu(nhay, 1.4));
        nhay.appendChild(c.dat(c.ico('denCam', 3, BM.xanhLoSang2), 120, 160, 'pg-nhay'));
        var hoi = c.chu('md-hoi', '!'); hoi.style.left = '132px'; hoi.style.top = '118px'; hoi.style.animationDelay = '1.4s'; k.appendChild(hoi);
        c.sau(1400, function () { c.keu('moKhoa'); });
      },
      // 3 · gắn cảm biến; tia quét trước mũi, gặp tường tia đỏ, R1 dừng kịp
      function (k, c) {
        c.nen(k, 'md-san'); tuong(k, c, 270);
        var nhom = c.dat(c.h('div', 'pg-nhom md-di'), 0, 0); nhom.style.setProperty('--d', '140px');
        var tia = c.dat(c.h('div', 'pg-tia pg-do'), 92, Y - 4); tia.style.width = '38px'; tia.style.setProperty('--t', '2.4s'); nhom.appendChild(tia);
        var r = c.xe(CAM_XE, { camBien: { bat: true } }, 1, 3, 60, Y); nhom.appendChild(r);
        k.appendChild(nhom);
        c.sau(300, function () { c.keu('quet'); });
        c.sau(2400, function () { c.keu('loi'); r.mat('ngac'); });
      },
      // 4 · code while front_clear(): move(); R1 dừng sát tường
      function (k, c) {
        c.nen(k, 'md-san'); tuong(k, c, 270);
        c.code(k, ['while front_clear():', '    move()'], 10, 14);
        var nhom = c.dat(c.h('div', 'pg-nhom md-di'), 0, 0); nhom.style.setProperty('--d', '178px');
        var tia = c.dat(c.h('div', 'pg-tia pg-do'), 92, Y - 4); tia.style.width = '0px'; tia.style.setProperty('--t', '2.4s'); nhom.appendChild(tia);
        var r = c.xe(CAM_XE, { camBien: { bat: true } }, 1, 3, 60, Y); nhom.appendChild(r);
        k.appendChild(nhom);
        c.sau(400, function () { tia.style.width = '38px'; });
        c.sau(2100, function () { tia.style.width = '2px'; });
        for (var i = 0; i < 5; i++) c.sau(1000 + i * 280, function () { c.keu('buoc'); });
        c.sau(2500, function () { c.keu('thang'); r.mat('vui'); });
      }
    ],

    /* ---------------------------------------------------------------- 4 · Kho hàng (nút đè) */
    'kho-hang': [
      // 1 · cửa kho đóng; trên sàn có ô nút đè
      function (k, c) {
        var s = c.san(k, KHO, 4, 20, 26);
        s.nut['1,0'].classList.add('pg-nhay');
        var r = c.xe(XE, {}, 1, 2, s.o(0, 1).x, s.o(0, 1).y); k.appendChild(r);
        c.sau(800, function () { r.mat('ngac'); });
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
        c.sau(900, function () { r.mat('vui'); });
        c.sau(2700, function () { cua.dat(false); cua.classList.add('md-rung'); c.keu('dam'); r.mat('buon'); });
        var hoi = c.chu('md-hoi', '?!'); hoi.style.left = (a.x - 14) + 'px'; hoi.style.top = (a.y + 14) + 'px'; hoi.style.animationDelay = '2.9s'; k.appendChild(hoi);
      },
      // 3 · R1 đặt thùng gỗ lên nút, cửa mở, R1 đi qua
      function (k, c) {
        var s = c.san(k, KHO, 4, 20, 26), nut = s.nut['1,0'], cua = s.cua['3,1'];
        var a = s.o(1, 1), b = s.o(1, 0);
        var tg = thung(c, a.x, a.y - VAT2, '', NUA2); k.appendChild(tg);
        var r = c.xe(KEP, NANG_CAM, 0, 2, a.x, a.y); k.appendChild(r);
        c.sau(500, function () { r.ve(HA_CAM); coT(tg, false); });                       // vector (V6b): tay hạ, thùng về cỡ vật nằm sàn rồi nằm trên nút đúng cỡ đó
        truot(c, tg, 1000, a.x - NUA2, b.y - NUA2, 0.3);                          // vector: tay ngắn hơn, thùng trượt lên nút thay vì nhảy
        c.sau(1000, function () { r.ve(HA_MO); tg.style.top = (b.y - NUA2) + 'px'; c.keu('tha'); });
        c.sau(1300, function () { nut.dat(true); cua.dat(true); c.keu('moKhoa'); r.ve(NANG_MO); });
        c.sau(1900, function () { r.ve(NANG_MO, 1); });
        var dich = s.o(4, 1);
        truot(c, r, 2200, dich.x - 40, dich.y, 1.2);
        c.sau(1300, function () { r.mat('vui'); });
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
        c.sau(1100, function () { r.classList.add('pg-lac-xe'); c.keu('loi'); r.mat('buon'); });
        var hoi = c.chu('md-hoi', '?'); hoi.style.left = (p.x - 8) + 'px'; hoi.style.top = '6px'; hoi.style.animationDelay = '1.6s'; k.appendChild(hoi);
      },
      // 2 · hộp linh kiện bật nắp, hai bánh R1 sáng lên
      function (k, c) {
        var s = c.san(k, NGO, 4, 20, 26), p = s.o(3, 1), h = s.o(0, 0);
        k.appendChild(c.dat(c.ico('box', 3, BM.camToiV1), h.x - 17, h.y - 12));
        k.appendChild(c.dat(c.h('div', 'pg-nap'), h.x - 16, h.y - 16, 'md-bat'));
        var r = c.xe(XE, {}, 1, 2, p.x, p.y); k.appendChild(r);
        var vx = c.h('div', 'md-a md-vx'); vx.style.left = (h.x - 16) + 'px'; vx.style.top = (h.y - 16) + 'px'; vx.style.setProperty('--x', (p.x - h.x) + 'px'); vx.style.animationDelay = '.3s';
        var vy = c.h('div', 'md-vy'); vy.style.setProperty('--y', (p.y - h.y) + 'px'); vy.style.setProperty('--r', '360deg'); vy.style.animationDelay = '.3s';
        vy.appendChild(c.ico('denBanh', 3, BM.lamSang)); vx.appendChild(vy); k.appendChild(c.tu(vx, 1.2, true));
        r.mat('buon');
        c.sau(1200, function () { r.classList.add('pg-nhay'); r.ve({ wl: 2, wr: 2 }); c.keu('moKhoa'); r.mat('ngac'); });
        c.sau(1700, function () { r.mat('vui'); });
      },
      // 3 · R1 lùi ra khỏi ngõ, vệt bánh
      function (k, c) {
        var s = c.san(k, NGO, 4, 20, 26), p = s.o(3, 1), q = s.o(0, 1);
        var vet = c.dat(c.h('div', 'pg-vet'), q.x, p.y - 3); vet.style.width = (p.x - q.x) + 'px'; k.appendChild(vet);
        var r = c.xe(XE, { wl: 2, wr: 2 }, 1, 2, p.x, p.y); k.appendChild(r);
        truot(c, r, 500, q.x, q.y, 1.4); r.mat('vui');
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
        c.sau(2200, function () { r.ve({}); c.keu('thang'); r.mat('vui'); });
      }
    ],

    /* ---------------------------------------------------------------- 6 · Tay xoay (nhìn từ trên: bên trái R1 = phía trên khung) */
    'tay-xoay': [
      // 1 · thùng nằm bên trái R1; R1 phải quay cả xe (mũi tên vòng, 2 nhịp)
      function (k, c) {
        var cx = 150, cy = 140, tg = coT(thung(c, cx, cy - VAT), false); k.appendChild(tg);
        var r = c.xe(KEP, NANG_MO, 1, 3, cx, cy); k.appendChild(r);
        var vong = c.dat(c.ico('reset', 3, BM.vang), cx + 46, cy - 70, 'md-pop'); vong.style.animationDelay = '.3s'; k.appendChild(vong);
        nhip(k, c, '1', cx - 70, cy - 40, 0.6);
        c.sau(600, function () { r.ve(null, 0); c.keu('buoc'); });
        c.sau(1100, function () { r.ve(HA_MO); });
        c.sau(1500, function () { r.ve(HA_CAM); c.keu('kep'); });
        c.sau(1900, function () { r.ve(NANG_CAM); coT(tg, true); });
        nhip(k, c, '2', cx - 70, cy + 10, 2.4);
        c.sau(2400, function () { r.ve(null, 1); tg.style.left = (cx + VAT - NUA) + 'px'; tg.style.top = (cy - NUA) + 'px'; c.keu('buoc'); });
        c.sau(2700, function () { c.keu('loi'); r.mat('buon'); });
      },
      // 2 · khớp xoay lấp lánh trên kệ, gắn vào tay
      function (k, c) {
        var cx = 110, cy = 140;
        k.appendChild(c.dat(c.o('thung', 4), 228, 36));
        k.appendChild(c.tu(c.xe(KEP, NANG_MO, 1, 3, cx, cy), 1.2, true));
        var rx = c.xe(XOAY, NANG_MO, 1, 3, cx, cy, 'pg-sang'); k.appendChild(c.tu(rx, 1.2));
        c.sau(1300, function () { rx.mat('vui'); });
        var vx = c.h('div', 'md-a md-vx'); vx.style.left = '240px'; vx.style.top = '46px'; vx.style.setProperty('--x', (cx + 30 - 240) + 'px'); vx.style.animationDelay = '.4s';
        var vy = c.h('div', 'md-vy pg-nhay'); vy.style.setProperty('--y', (cy - 62) + 'px'); vy.style.setProperty('--r', '360deg'); vy.style.animationDelay = '.4s';
        vy.appendChild(c.ico('denXoay', 3, BM.timV7)); vx.appendChild(vy); k.appendChild(c.tu(vx, 1.2, true));
        var cach = c.chu('md-ram pg-cach', 'CẠCH!'); cach.style.animationDelay = '1.2s'; k.appendChild(cach);
        c.sau(1200, function () { c.keu('kep'); });
      },
      // 3 · tay xoay sang trái nhặt thùng, xe đứng yên
      function (k, c) { xoayNhat(k, c, 0.3); },
      // 4 · code arm_left() arm_down() grab()
      function (k, c) {
        c.code(k, ['arm_left()', 'arm_down()', 'grab()'], 10, 14);
        xoayNhat(k, c, 1.0, 190);
      }
    ],

    /* ---------------------------------------------------------------- 7 · Cảm biến bên (mê cung) */
    'me-cung': [
      // 1 · R1 ở ngã ba mê cung, "?"
      function (k, c) {
        var s = c.san(k, ME, 3, 13, 5), p = s.o(3, 1);
        var r = c.xe(XE, {}, 1, 1.5, p.x, p.y); k.appendChild(r);
        c.sau(600, function () { r.mat('ngac'); });
        var hoi = c.chu('md-hoi', '?'); hoi.style.left = (p.x + 4) + 'px'; hoi.style.top = (p.y - 40) + 'px'; hoi.style.animationDelay = '.6s'; k.appendChild(hoi);
        var hoi2 = c.chu('md-hoi', '?'); hoi2.style.left = (p.x - 26) + 'px'; hoi2.style.top = (p.y - 34) + 'px'; hoi2.style.animationDelay = '1.1s'; k.appendChild(hoi2);
      },
      // 2 · hai mắt nhỏ gắn hai bên hông, tia trái / phải quét
      function (k, c) {
        var s = c.san(k, ME, 3, 13, 5), p = s.o(3, 1);
        k.appendChild(c.tu(c.xe(XE, {}, 1, 1.5, p.x, p.y), 0.6, true));
        var rc = c.xe(CAM_XE, { camBien: { bat: true } }, 1, 1.5, p.x, p.y, 'pg-sang'); k.appendChild(c.tu(rc, 0.6));
        c.sau(1100, function () { rc.mat('vui'); });
        var tren = c.dat(c.h('div', 'pg-tia doc pg-do'), p.x - 4, p.y - 21 - 4); tren.style.height = '4px'; tren.style.setProperty('--t', '1.2s');
        var duoi = c.dat(c.h('div', 'pg-tia doc'), p.x - 4, p.y + 14); duoi.style.height = '52px';
        k.appendChild(c.tu(tren, 1.0)); k.appendChild(c.tu(duoi, 1.0));
        c.sau(1000, function () { c.keu('quet'); });
      },
      // 3 · R1 bám tường phải, đi ra khỏi mê cung tới cờ
      function (k, c) {
        var s = c.san(k, ME, 3, 13, 5), d = s.o(1, 3);
        var r = c.xe(CAM_XE, { camBien: { bat: true } }, 0, 1.5, d.x, d.y); k.appendChild(r);
        // [ô, hướng] theo luật bám tường phải: lên, lên, rẽ phải, phải, rẽ phải, xuống, rẽ trái, phải, rẽ trái, lên tới cờ
        var duong = [[1, 2, 0], [1, 1, 0], [1, 1, 1], [2, 1, 1], [3, 1, 1], [3, 1, 2], [3, 2, 2], [3, 3, 2], [3, 3, 1], [4, 3, 1], [5, 3, 1], [5, 3, 0], [5, 2, 0], [5, 1, 0]];
        r.classList.add('pg-truot'); r.style.setProperty('--tg', '.25s');
        duong.forEach(function (b, i) {
          c.sau(400 + i * 260, function () { var o = s.o(b[0], b[1]); r.toi(o.x, o.y); r.ve(null, b[2]); c.keu('buoc'); });
        });
        var sx = s.o(5, 1);
        var sa = c.dat(c.sao(3), sx.x - 10, sx.y - 40, 'md-pop md-sang'); sa.style.animationDelay = (0.4 + duong.length * 0.26) + 's, ' + (0.4 + duong.length * 0.26) + 's'; k.appendChild(sa);
        c.sau(500 + duong.length * 260, function () { c.keu('thang'); r.mat('vui'); });
      },
      // 4 · code if right_clear(): turn_right()
      function (k, c) {
        var s = c.san(k, ME, 3, 13, 5), p = s.o(3, 1), q = s.o(3, 2);
        c.code(k, ['if right_clear():', '    turn_right()'], 10, 150);
        var r = c.xe(CAM_XE, { camBien: { bat: true } }, 1, 1.5, p.x, p.y); k.appendChild(r);
        var duoi = c.dat(c.h('div', 'pg-tia doc'), p.x - 4, p.y + 14); duoi.style.height = '52px';
        k.appendChild(c.tu(duoi, 0.9));
        c.sau(900, function () { c.keu('quet'); });
        c.sau(1700, function () { duoi.style.display = 'none'; r.ve(null, 2); c.keu('buoc'); });
        truot(c, r, 2100, q.x, q.y, 0.5);
      }
    ],

    /* ---------------------------------------------------------------- 8 · Đội hai robot */
    'hai-robot': [
      // 1 · cửa xưởng mở, R2 sơn lam lăn vào
      function (k, c) {
        c.nen(k, 'md-san');
        var r1 = c.xe(KEP, NANG_MO, 1, 3, 70, Y); k.appendChild(r1);
        c.sau(700, function () { r1.mat('ngac'); });
        var anh = c.dat(c.h('div', 'pg-anh'), 200, 20); anh.style.width = '120px'; anh.style.height = '170px'; k.appendChild(anh);
        var cua = c.dat(c.h('div', 'pg-cua-lon pg-mo-cua'), 236, 20); k.appendChild(cua);
        var r2 = c.xe(KEP_R2, NANG_MO, 3, 3, 360, Y); k.appendChild(r2);
        truot(c, r2, 1700, 236, Y, 1.0);
        c.sau(2800, function () { r1.mat('vui'); r2.mat('vui'); });
        c.sau(500, function () { c.keu('moKhoa'); });
        c.sau(1800, function () { c.keu('buoc'); });
      },
      // 2 · R1 và R2 nhìn nhau; hai bảng code R1 / R2 hiện cạnh nhau
      function (k, c) {
        c.nen(k, 'md-san');
        k.appendChild(c.xe(KEP, NANG_MO, 1, 3, 70, Y).mat('vui'));
        k.appendChild(c.xe(KEP_R2, NANG_MO, 3, 3, 250, Y).mat('vui'));
        var b1 = c.code(k, ['pick()', 'move()', 'drop()'], 8, 8); bangTen(c, b1, t2('pg.tenR1'), '');
        var b2 = c.code(k, ['wait()', 'pick()', 'move()'], 186, 8, 0.5); bangTen(c, b2, t2('pg.tenR2'), 'pg-ten-r2');
        c.sau(300, function () { c.keu('bam'); });
      },
      // 3 · R1 chuyền thùng cho R2, R2 đưa vào ô đích
      function (k, c) {
        c.nen(k, 'md-san');
        var dich = c.dat(c.h('div', 'pg-dich'), 262, 138); dich.style.width = dich.style.height = '40px'; k.appendChild(dich);
        var tg = thung(c, 60 + VAT, Y - 4); k.appendChild(tg);
        var r1 = c.xe(KEP, NANG_CAM, 1, 3, 60, Y); k.appendChild(r1);
        var r2 = c.xe(KEP_R2, NANG_MO, 3, 3, 250, Y); k.appendChild(r2);
        truot(c, r1, 300, 110, Y, 0.8); truot(c, tg, 300, 110 + VAT - NUA, Y - 4 - NUA, 0.8);
        c.sau(1300, function () { r1.ve(HA_CAM); coT(tg, false); });
        c.sau(1600, function () { r1.ve(HA_MO); tg.style.top = (Y - NUA) + 'px'; c.keu('tha'); });
        c.sau(1900, function () { r1.ve(NANG_MO); });
        truot(c, r2, 2000, 110 + 2 * VAT, Y, 0.6);
        c.sau(2700, function () { r2.ve(HA_MO); });
        c.sau(3000, function () { r2.ve(HA_CAM); c.keu('kep'); });
        c.sau(3300, function () { r2.ve(NANG_CAM); coT(tg, true); tg.style.top = (Y - 4 - NUA) + 'px'; });
        c.sau(3700, function () { r2.ve(null, 1); tg.style.left = (110 + 3 * VAT - NUA) + 'px'; c.keu('buoc'); });
        truot(c, r2, 3750, 282 - VAT, Y, 0.35); truot(c, tg, 3750, 282 - NUA, undefined, 0.35);   // vector: tay ngắn hơn, R2 lăn thêm tới ô đích (tâm 282)
        c.sau(4100, function () { r2.ve(HA_MO); coT(tg, false); tg.style.top = (Y - NUA) + 'px'; c.keu('tha'); });
        var sa = c.dat(c.sao(3), 270, 96, 'md-pop md-sang'); sa.style.animationDelay = '4.3s, 4.3s'; k.appendChild(sa);
        c.sau(4300, function () { c.keu('thang'); r1.mat('vui'); r2.mat('vui'); });
      }
    ],

    /* ---------------------------------------------------------------- 9 · Combo (tay xoay + cảm biến bên) */
    'combo': [
      // 1 · kho chật, thùng nằm hai bên lối đi
      function (k, c) {
        var s = c.san(k, CHAT, 4, 20, 26), p = s.o(0, 1);
        var r = c.xe(DU_BO, {}, 1, 2, p.x, p.y); k.appendChild(r);
        c.sau(600, function () { r.mat('ngac'); });
        var hoi = c.chu('md-hoi', '?'); hoi.style.left = (p.x + 20) + 'px'; hoi.style.top = (p.y - 46) + 'px'; hoi.style.animationDelay = '.6s'; k.appendChild(hoi);
      },
      // 2 · cảm biến bên nháy ở bên có thùng, tay xoay sang đúng bên đó nhặt
      function (k, c) {
        var s = c.san(k, CHAT, 4, 20, 26), p = s.o(1, 1), v = s.vat['1,0'];
        var r = c.xe(DU_BO, { camBien: { bat: true } }, 1, 2, p.x, p.y, 'pg-truot'); k.appendChild(r);
        var tren = c.dat(c.h('div', 'pg-tia doc pg-do'), p.x - 4, p.y - 32); tren.style.height = '6px'; tren.style.setProperty('--t', '.2s');
        k.appendChild(c.tu(tren, 0.2));
        c.sau(200, function () { c.keu('quet'); });
        [-30, -60, -90].forEach(function (g, i) { c.sau(800 + i * 200, function () { r.ve({ tay: { tuThe: 'tren', kep: false, goc: g } }); }); });
        c.sau(1500, function () { r.ve({ tay: { tuThe: 'duoi', kep: false, goc: -90 } }); });
        c.sau(1900, function () { r.ve({ tay: { tuThe: 'duoi', kep: true, cam: true, goc: -90 } }); veVat(v, r, -90, 2); c.keu('kep'); });
        c.sau(2300, function () { r.ve({ tay: { tuThe: 'tren', kep: true, cam: true, goc: -90 } }); });
      },
      // 3 · R1 lướt dọc lối đi, nhặt hai bên không cần quay xe, chồng thùng xong
      function (k, c) {
        var s = c.san(k, CHAT, 4, 20, 26), a = s.o(1, 1), b = s.o(3, 1), d = s.o(4, 1);
        var v1 = s.vat['1,0'], v2 = s.vat['3,2'];
        var r = c.xe(DU_BO, { camBien: { bat: true } }, 1, 2, s.o(0, 1).x, a.y, 'pg-truot'); r.style.setProperty('--tg', '.5s'); k.appendChild(r);
        var B = function (tuThe, kep, goc) { return { tay: { tuThe: tuThe, kep: kep, cam: kep, goc: goc }, camBien: { bat: true } }; };
        c.sau(200, function () { r.toi(a.x, a.y); });
        c.sau(800, function () { r.ve(B('duoi', false, -90)); });
        c.sau(1100, function () { r.ve(B('duoi', true, -90)); v1.classList.add('pg-an-ngay'); c.keu('kep'); });
        c.sau(1400, function () { r.ve(B('tren', true, 0)); });
        c.sau(1700, function () { r.toi(b.x, b.y); c.keu('buoc'); });
        c.sau(2300, function () { r.ve(B('duoi', false, 90)); });
        c.sau(2600, function () { r.ve(B('duoi', true, 90)); v2.classList.add('pg-an-ngay'); c.keu('kep'); });
        c.sau(2900, function () { r.ve(B('tren', true, 0)); });
        var chong = c.dat(c.h('div'), 0, 0);
        chong.appendChild(c.dat(c.o('crate', 2), d.x - 14, d.y - 4));
        chong.appendChild(c.dat(c.o('crate', 2), d.x - 14, d.y - 24));
        k.appendChild(c.tu(chong, 3.3));
        c.sau(3300, function () { r.ve(B('tren', false, 0)); c.keu('tha'); });
        var sa = c.dat(c.sao(3), d.x - 10, d.y - 70, 'md-pop md-sang'); sa.style.animationDelay = '3.5s, 3.5s'; k.appendChild(sa);
        c.sau(3500, function () { c.keu('thang'); r.mat('vui'); });
      }
    ],

    /* ---------------------------------------------------------------- 10 · R1 xuất xưởng */
    'robot': [
      // 1 · R1 đủ bộ giữa xưởng, các huy hiệu mùa 1 bay quanh
      function (k, c) {
        c.nen(k, 'md-san');
        k.appendChild(c.xe(DU_BO, { camBien: { bat: true } }, 1, 3, 150, Y, 'md-nhun').mat('vui'));
        var ds = HUY.filter(function (m) { return window.HuyHieu && HuyHieu.DS.indexOf(m) >= 0; });
        var cho = [[30, 30], [110, 14], [196, 14], [262, 40], [20, 100], [266, 104], [64, 60], [222, 72]];
        ds.forEach(function (m, i) {
          if (!cho[i]) return;
          var hh; try { hh = HuyHieu.mk(m, 'xong', 1); hh.classList.add('pxi'); } catch (e) { hh = c.sao(2); }
          var o = c.dat(c.h('div', 'pg-bay'), cho[i][0], cho[i][1]); o.style.animationDelay = (-i * 0.3) + 's';
          var p = c.dat(c.h('div', 'md-pop'), 0, 0); p.style.animationDelay = (0.2 + i * 0.15) + 's'; p.appendChild(hh);
          o.appendChild(p); k.appendChild(o);
        });
        c.sau(300, function () { c.keu('thang'); });
      },
      // 2 · cánh cửa lớn của xưởng mở, ánh sáng tràn vào; tem XUẤT XƯỞNG đóng xuống: "Xe chở hàng R1" + ba part (KE-HOACH-PHIM-GOI.md mục 3c)
      function (k, c) {
        c.nen(k, 'md-san');
        var anh = c.dat(c.h('div', 'pg-anh pg-anh-lon'), 150, 10); k.appendChild(anh);
        var trai = c.dat(c.h('div', 'pg-cua-lon pg-mo-cua'), 196, 10); trai.style.transformOrigin = '0 50%'; k.appendChild(trai);
        var phai = c.dat(c.h('div', 'pg-cua-lon pg-mo-cua'), 256, 10); phai.style.transformOrigin = '100% 50%'; k.appendChild(phai);
        var r = c.xe(DU_BO, {}, 1, 3, 80, Y); k.appendChild(r);
        c.sau(500, function () { c.keu('moKhoa'); r.mat('ngac'); });
        c.sau(1600, function () { r.mat('vui'); });
        temXuatXuong(k, c, 'pg.tem.xe-cho-hang', [['denBanh', BM.vang], ['denXoay', BM.vang], ['denCam', BM.xanhLoSang2]], 70, 10, 2);
      },
      // 3 · R1 lăn ra ngoài; xa xa trên đồi thấy bánh xích văng hôm trước (nhá mùa 2)
      function (k, c) {
        c.nen(k, 'pg-troi'); c.nen(k, 'pg-doi'); c.nen(k, 'md-san pg-dat');
        var xich = c.dat(c.ico('denXich', 2, BM.lamSang), 252, 78, 'pg-nhay'); k.appendChild(xich);
        var hoi = c.chu('md-hoi', '!'); hoi.style.left = '258px'; hoi.style.top = '40px'; hoi.style.animationDelay = '2s'; k.appendChild(hoi);
        var r = c.xe(DU_BO, {}, 1, 3, -40, Y); k.appendChild(r);
        truot(c, r, 100, 130, Y, 1.6);
        for (var i = 0; i < 6; i++) c.sau(200 + i * 270, function () { c.keu('buoc'); });
        c.sau(2000, function () { c.keu('moKhoa'); r.mat('ngac'); });
      }
    ]
  };

  /** Chữ qua t() của chu.js (Node không có t: trả khóa). */
  function t2(khoa) { return typeof t === 'function' ? t(khoa) : khoa; }
  /** Tem XUẤT XƯỞNG (PhimVector.xuatXuong) góc trên trái (x, y), chạm ở giây t: tiếng dấu đóng, rồi tiếng thắng khi ba part hiện. */
  function temXuatXuong(k, c, khoaTen, part, x, y, t) {
    var v = goc.PhimVector && PhimVector.xuatXuong({ tem: t2('pg.tem.xuat-xuong'), ten: t2(khoaTen), part: part, t: t });
    if (!v) return;
    k.appendChild(c.dat(v, x, y));
    c.sau(t * 1000, function () { c.keu('dam'); });
    c.sau(t * 1000 + 900, function () { c.keu('thang'); });
  }
  /** Đặt nhãn tên robot lên đầu bảng code. */
  function bangTen(c, bang, ten, cls) { var d = c.h('div', 'pg-ten ' + (cls || ''), ten); bang.insertBefore(d, bang.firstChild); }
  /** Số nhịp bật lên ở (x, y) từ giây t. */
  function nhip(k, c, so, x, y, t) { var e = c.chu('md-hoi pg-nhip', so); e.style.left = x + 'px'; e.style.top = y + 'px'; e.style.animationDelay = t + 's'; k.appendChild(e); }
  /** Thùng bị tay xoay kéo về kẹp: dời ô thùng v tới vị trí vật của tay ở góc g (xe hướng phải, tỉ lệ tl). */
  function veVat(v, r, g, tl) {
    var w = parseFloat(v.style.width) || v.width || 56, p = vatXoay(g, 'duoi', tl);
    v.classList.add('pg-truot'); v.style.setProperty('--tg', '.3s');
    v.style.transform = 'scale(.5)';
    v.style.left = (parseFloat(r.style.left) + p.x - w / 2) + 'px'; v.style.top = (parseFloat(r.style.top) + p.y - w / 2) + 'px';
  }
  /** Tâm vật trong tay xoay so với tâm thân (xe hướng phải): x = về phía mũi, y = về bên phải xe (xuống). */
  function vatXoay(g, tuThe, tl) {
    var v = (window.VeRobot && VeRobot.vatXoay) ? VeRobot.vatXoay(XOAY, tuThe, g) : { f: 12, l: g < 0 ? -10 : g > 0 ? 10 : 0 };
    var k = oPx(tl) / 100;               // vector: VeRobot.vatXoay theo 1/100 ô; pixel: pixel part × tỉ lệ
    return { x: v.f * k, y: v.l * k };
  }
  /** Tay xoay sang trái nhặt thùng rồi xoay về trước; xe đứng yên. tre: giây bắt đầu; cx: tâm xe. */
  function xoayNhat(k, c, tre, cx) {
    cx = cx || 150; var cy = 140, ms = tre * 1000;
    var p0 = vatXoay(-90, 'duoi', 3);
    var tg = coT(thung(c, cx + p0.x, cy + p0.y - 30), false); k.appendChild(tg);
    var r = c.xe(XOAY, NANG_MO, 1, 3, cx, cy); k.appendChild(r);
    var T = function (tuThe, kep, goc) { return { tay: { tuThe: tuThe, kep: kep, cam: kep, goc: goc } }; };
    [-30, -60, -90].forEach(function (g, i) { c.sau(ms + i * 180, function () { r.ve(T('tren', false, g)); }); });
    c.sau(ms + 200, function () { c.keu('bam'); });
    c.sau(ms + 700, function () { r.ve(T('duoi', false, -90)); tg.classList.add('pg-truot'); tg.style.setProperty('--tg', '.3s'); tg.style.top = (cy + p0.y - NUA) + 'px'; });
    c.sau(ms + 1100, function () { r.ve(T('duoi', true, -90)); c.keu('kep'); });
    c.sau(ms + 1400, function () { r.ve(T('tren', true, -90)); coT(tg, true); });
    [-60, -30, 0].forEach(function (g, i) {
      c.sau(ms + 1800 + i * 180, function () { var p = vatXoay(g, 'tren', 3); r.ve(T('tren', true, g)); tg.style.setProperty('--tg', '.15s'); tg.style.left = (cx + p.x - NUA) + 'px'; tg.style.top = (cy + p.y - NUA) + 'px'; });
    });
    c.sau(ms + 2400, function () { c.keu('thang'); r.mat('vui'); });
  }

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
