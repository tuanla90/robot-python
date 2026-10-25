/* ============================================================================
   den-bo-phan.js — "Robot Chấn Hưng": ĐÈN THEO BỘ PHẬN cạnh đồng hồ NHỊP của màn chơi (window.DenBoPhan).
   Thay hai đèn chữ T / P cũ: mỗi bộ phận robot có trên màn là một biểu tượng pixel nhỏ, sáng lên trong nhịp bộ phận đó chạy.
     bánh trái · bánh phải (xe hai bánh, xích, omni: xích / omni như bánh) · trượt (omni) · tay (lên / xuống) · kẹp (mở / đóng) · nam châm · máy ném · súng hơi · cảm biến (nháy khi đọc)
     nhện: chân · drone: cánh quạt
   Dữ liệu lấy từ VẾT của lõi, không tự suy ra luật: với mỗi sự kiện 'nhip' e và các mục 'lenh' đứng ngay trước nó (các lệnh chạy trong nhịp đó):
     bánh trái / phải: e.robot.banh.trai / .phai ≠ 0 (omni trượt: e.robot.truot ≠ 0 thì cả hai bánh + đèn trượt);
     tay: có lệnh arm_up / arm_down; kẹp: có lệnh grab / release (hình tay lên / xuống, kẹp mở / đóng theo e.robot.tay);
     nam châm: có magnet_n / magnet_s / magnet_off hoặc nam châm đang bật (e.robot.namCham.bat); máy ném: load / throw; súng hơi: shoot / shoot_back;
     cảm biến: có lệnh đọc cảm biến (mục 'lenh' có docCamBien, hay front_clear / left_clear / right_clear / front_metal / color / look / battery) hoặc e.robot.camBien;
     nhện: chân sáng ở nhịp chuẩn bị ('chuan-bi'), nhịp bước ('di'), nhịp nhảy ('nhay') và nhịp co / duỗi chân ('doi-chan'); drone: cánh sáng ở nhịp bay ('di') và nhịp lơ lửng ('dung-yen').
   Dùng:  DenBoPhan.dung(phanTuClock)  (một lần, dựng vùng đèn)  ·  DenBoPhan.nap(man)  (vào màn: chọn các bộ phận có trên màn)  ·
          DenBoPhan.bat(e, lenhTruoc)  (sáng theo nhịp e)  ·  DenBoPhan.tat()  (tắt hết, tay lên / kẹp mở như lúc đầu).
   DenBoPhan.phan(e, lenhTruoc) (thuần túy, kiểm trong Node): trả về { banhT, banhP, truot, tay, xoay, kep, namCham, nem, sung, son, camBien, chan, canh } (true = sáng).
   DenBoPhan.boPhanCuaMan(man): mảng khóa bộ phận có trên màn theo thứ tự hiển thị.
   ========================================================================== */
(function () {
  'use strict';

  var CAM_BIEN = ['front_clear', 'left_clear', 'right_clear', 'front_metal', 'front_pole', 'color', 'look', 'battery'];
  var TAY_LEN = ['arm_up', 'arm_down'], KEP_LEN = ['grab', 'release'], NC_LEN = ['magnet_n', 'magnet_s', 'magnet_off'], NEM_LEN = ['load', 'throw'];
  // khóa → { hinh: [tên hình khi trạng thái A, B], mau: màu khi sáng, nhan: khóa chữ }
  var BP = {
    banhT: { hinh: ['denBanh'], mau: '#5ff0ff', nhan: 'choi.den.banhT' },
    banhP: { hinh: ['denBanh'], mau: '#5ff0ff', nhan: 'choi.den.banhP' },
    truot: { hinh: ['denTruot'], mau: '#b6e04c', nhan: 'choi.den.truot' },
    tay: { hinh: ['denTayLen', 'denTayXuong'], mau: '#ffb050', nhan: 'choi.den.tay' },
    xoay: { hinh: ['denXoay'], mau: '#ffb050', nhan: 'choi.den.xoay' },
    kep: { hinh: ['denKepMo', 'denKepDong'], mau: '#ffb050', nhan: 'choi.den.kep' },
    namCham: { hinh: ['denNamCham'], mau: '#ff7a6a', nhan: 'choi.den.namCham' },
    nem: { hinh: ['denNem'], mau: '#ffb050', nhan: 'choi.den.nem' },
    sung: { hinh: ['denSung'], mau: '#ffb050', nhan: 'choi.den.sung' },
    son: { hinh: ['denSon'], mau: '#ff7ad9', nhan: 'choi.den.son' },
    camBien: { hinh: ['denCam'], mau: '#9ff0e2', nhan: 'choi.den.camBien' },
    chan: { hinh: ['denChan'], mau: '#8fb4ff', nhan: 'choi.den.chan' },
    canh: { hinh: ['denCanh'], mau: '#8fb4ff', nhan: 'choi.den.canh' }
  };
  var THU_TU = ['banhT', 'banhP', 'truot', 'tay', 'xoay', 'kep', 'namCham', 'nem', 'sung', 'son', 'camBien', 'chan', 'canh'];

  function coTrong(ds, tenLenh) { return (ds || []).some(function (e) { return tenLenh.indexOf(e && e.ten) >= 0; }); }

  /** Các bộ phận (khóa) có trên màn, theo thứ tự hiển thị, từ loại robot + hamGoc của màn. */
  function boPhanCuaMan(man) {
    var g = (man && man.hamGoc) || [], loai = (man && man.loaiRobot) || 'banh', kq = [];
    function co(ds) { return ds.some(function (n) { return g.indexOf(n) >= 0; }); }
    if (loai === 'nhen') kq.push('chan');
    else if (loai === 'drone') kq.push('canh');
    else { kq.push('banhT', 'banhP'); if (loai === 'omni' || co(['slide_left', 'slide_right'])) kq.push('truot'); }
    if (co(TAY_LEN)) kq.push('tay');
    if (co(['arm_left', 'arm_right'])) kq.push('xoay');           // tay xoay: khớp xoay có đèn riêng
    if (co(KEP_LEN)) kq.push('kep');
    if (co(NC_LEN)) kq.push('namCham');
    if (co(['aim', 'load', 'throw'])) kq.push('nem');
    if (co(['shoot', 'shoot_back'])) kq.push('sung');
    if (co(['dot', 'pen_down', 'pen_up'])) kq.push('son');         // máy sơn: đèn sáng khi chấm / hạ / nhấc, và cả nhịp đầu sơn đang hạ (đang tô nét)
    if (co(CAM_BIEN)) kq.push('camBien');
    return THU_TU.filter(function (k) { return kq.indexOf(k) >= 0; });
  }

  /** Bộ phận nào chạy trong nhịp e (xem đầu tệp). lenhTruoc = các mục 'lenh' của vết nằm ngay trước e (sau nhịp trước). */
  function phan(e, lenhTruoc) {
    var rb = (e && e.robot) || {}, banh = rb.banh || { trai: 0, phai: 0 }, sk = (e && e.suKien) || [], kq = {}, i;
    function coSk(ma) { for (i = 0; i < sk.length; i++) if (sk[i] && sk[i].ma === ma) return true; return false; }
    var truot = !!rb.truot;
    kq.banhT = banh.trai !== 0 || truot;
    kq.banhP = banh.phai !== 0 || truot;
    kq.truot = truot;
    kq.tay = coTrong(lenhTruoc, TAY_LEN);
    kq.xoay = coTrong(lenhTruoc, ['arm_left', 'arm_right']);
    kq.kep = coTrong(lenhTruoc, KEP_LEN);
    kq.namCham = coTrong(lenhTruoc, NC_LEN) || !!(rb.namCham && rb.namCham.bat);
    kq.nem = coTrong(lenhTruoc, NEM_LEN);
    kq.sung = coTrong(lenhTruoc, ['shoot', 'shoot_back']);
    kq.son = coTrong(lenhTruoc, ['dot', 'pen_down', 'pen_up']) || !!(rb.son && rb.son.ha);
    kq.camBien = (lenhTruoc || []).some(function (x) { return x && (x.docCamBien || CAM_BIEN.indexOf(x.ten) >= 0); }) || coSk('doc-cam-bien') || !!rb.camBien;
    kq.chan = coSk('chuan-bi') || coSk('di') || coSk('doi-chan') || coSk('nhay');
    kq.canh = coSk('di') || coSk('dung-yen');
    return kq;
  }

  /* ----------------------------------------------------------------- giao diện */
  var goc = null, den = {}, dsHien = [], tt = { tay: 0, kep: 0 };     // tt: trạng thái hình hiện tại (0 = tay lên / kẹp mở, 1 = tay xuống / kẹp đóng)

  function veMot(k) {
    var d = den[k]; if (!d) return;
    var b = BP[k], n = b.hinh.length, a = n > 1 ? (tt[k] ? 1 : 0) : 0, i;
    for (i = 0; i < d.cv.length; i++) {
      var h = Math.floor(i / 2), sang = i % 2 === 1;
      d.cv[i].style.display = (h === a && sang === d.sang) ? 'block' : 'none';
    }
    d.el.classList.toggle('sang', d.sang);
    d.el.setAttribute('data-sang', d.sang ? '1' : '0');
  }
  function dungMot(k, hinh) {
    var b = BP[k], el = document.createElement('span'), cv = [];
    el.className = 'den den-' + k; el.setAttribute('data-den', k);
    el.setAttribute('title', window.t ? window.t(b.nhan) : k); el.setAttribute('aria-label', window.t ? window.t(b.nhan) : k);
    (hinh || b.hinh).forEach(function (ten) {
      [false, true].forEach(function (sang) {
        var c = window.Ve.ico(ten, 1, mauIcon(b.mau, sang));
        c.style.display = 'none'; el.appendChild(c); cv.push(c);
      });
    });
    return { el: el, cv: cv, sang: false };
  }
  /** Màu icon bộ phận (ve.js, ICON BỘ PHẬN): sáng = màu bộ phận + chi tiết trắng; tắt = xanh xám. Thẻ khay (thanh-phan.js) dùng cùng hàm này. */
  function mauIcon(mau, sang) { return sang ? { fill: mau, line: '#06323a', toi: '#06323a', sang: '#ffffff' } : { fill: '#4f8a73', line: '#0a2a1f', toi: '#0a2a1f', sang: '#8fc4ad' }; }
  /** Icon của bộ phận k trên màn (xe xích: bánh vẽ thành xích). */
  function hinhCua(k, man) { return (k === 'banhT' || k === 'banhP') && man && man.loaiRobot === 'xich' ? ['denXich'] : BP[k].hinh; }
  /** Dựng vùng đèn trong phần tử clock (một dòng thứ hai dưới "NHỊP n"). Gọi một lần. */
  function dung(clock) {
    goc = document.createElement('span'); goc.className = 'den-bo'; clock.appendChild(goc);
    return goc;
  }
  /** Vào màn: chỉ hiện các bộ phận có trên màn (hết sáng, tay lên, kẹp mở). */
  function nap(man) {
    if (!goc) return [];
    goc.innerHTML = ''; den = {}; tt = { tay: 0, kep: 0 };
    dsHien = boPhanCuaMan(man);
    goc.className = 'den-bo n' + dsHien.length;                      // n1..n7: cỡ đèn nhỏ dần khi nhiều bộ phận (CSS)
    dsHien.forEach(function (k) { den[k] = dungMot(k, hinhCua(k, man)); goc.appendChild(den[k].el); veMot(k); });
    return dsHien.slice();
  }
  /** Tắt hết đèn (hết nhịp / chạy lại). Hình tay / kẹp giữ nguyên trạng thái cuối nếu giu = true, không thì về tay lên, kẹp mở. */
  function tat(giu) {
    if (!giu) tt = { tay: 0, kep: 0 };
    dsHien.forEach(function (k) { den[k].sang = false; veMot(k); });
  }
  /** Sáng theo nhịp e (lenhTruoc: các mục 'lenh' ngay trước nhịp đó). */
  function bat(e, lenhTruoc) {
    var p = phan(e, lenhTruoc), tay = e && e.robot && e.robot.tay;
    if (tay) { tt.tay = tay.tuThe === 'duoi' ? 1 : 0; tt.kep = tay.kep ? 1 : 0; }
    dsHien.forEach(function (k) { den[k].sang = !!p[k]; veMot(k); });
  }

  window.DenBoPhan = { dung: dung, nap: nap, tat: tat, bat: bat, phan: phan, boPhanCuaMan: boPhanCuaMan, mauIcon: mauIcon, BP: BP, hienTai: function () { return dsHien.slice(); } };
})();
