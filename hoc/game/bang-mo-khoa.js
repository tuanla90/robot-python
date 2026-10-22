/* ============================================================================
   bang-mo-khoa.js — "Đường học": BẢNG "MỞ GÓI MỚI!" (window.MoKhoa).
   Hiện khi tổng sao của người chơi vừa đủ mở một (hay vài) gói (game/mo-goi.js): mỗi gói một huy hiệu (HuyHieu.ve, hình của chương đầu gói) + tên gói.
   App.baoGoiMoi() (ung-dung.js) lo chuyện "mỗi gói báo một lần" (cờ 'goi-mo:<mã>' ở Luu) rồi gọi MoKhoa.mo(dsGoi, khiXong).
   ========================================================================== */
(function () {
  'use strict';

  var h = TP.h;

  /** Hình của một gói: huy hiệu của chương `hinh` nếu có, không thì dấu + để giữ chỗ. */
  function hinhGoi(g) {
    var co = window.HuyHieu && HuyHieu.DS && HuyHieu.DS.indexOf(g.hinh) >= 0;
    return co ? Ve.mk(HuyHieu.ve(g.hinh, 'mo'), 2) : Ve.ico('plus', 4, { fill: '#ffd95a', line: '#1b120a' });
  }

  /** Mở bảng cho các gói ds; bấm "Tuyệt!" thì đóng và gọi khiXong (nếu có). */
  function mo(ds, khiXong) {
    ds = ds || [];
    var hop = TP.Hop.mo(t('moKhoa.tieuDe'), 'hop-mo-khoa');
    if (window.AmThanh) AmThanh.phat('moKhoa');
    hop.hop.setAttribute('data-hop', 'mo-khoa');
    hop.than.appendChild(h('div', 'mk-loi', t('moKhoa.loi', { sao: window.App ? App.tongSao() : '' })));
    var luoi = h('div', 'mk-luoi');
    ds.forEach(function (g, i) {
      var o = h('div', 'mk-o'); o.setAttribute('data-goi', g.ma); o.style.animationDelay = (0.12 + i * 0.07) + 's';
      var hinh = h('div', 'mk-hinh'); hinh.appendChild(hinhGoi(g)); o.appendChild(hinh);
      o.appendChild(h('div', 'mk-ten', g.ten));
      luoi.appendChild(o);
    });
    hop.than.appendChild(luoi);
    if (window.ThanhCuon) ThanhCuon.gan(luoi);
    var hang = h('div', 'hop-hang');
    hang.appendChild(TP.Hop.nut('g-gr', t('moKhoa.nut'), function () { TP.Hop.dong(); if (khiXong) khiXong(); }, 'mo-khoa-xong'));
    hop.than.appendChild(hang);
  }

  window.MoKhoa = { mo: mo, hinhGoi: hinhGoi };
})();
